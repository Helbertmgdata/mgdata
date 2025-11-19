from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add parent directory to path for service imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.postmark_service import PostmarkService
from services.mailgun_service import MailgunService
from services.pmg_service import PMGService
from services.server_monitor_service import ServerMonitorService
from services.cpanel_service import CpanelService
from utils.event_store import (
    record_log,
    record_history,
    get_logs as store_get_logs,
    get_history as store_get_history,
)

load_dotenv()

app = Flask(__name__)
CORS(app)

postmark_service = PostmarkService()
mailgun_service = MailgunService()
pmg_service = PMGService()
server_service = ServerMonitorService()
cpanel_service = CpanelService()


def _last_test_result(service_name: str):
    """Return the latest recorded test result for the requested service."""
    logs = store_get_logs(service_name)
    for entry in logs:
        if entry.get('action') == 'test':
            return {
                'status': entry.get('status'),
                'message': entry.get('message'),
                'timestamp': entry.get('timestamp'),
            }
    return None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/postmark', methods=['GET'])
def get_postmark_stats():
    try:
        stats = postmark_service.get_stats()
        record_log('postmark', 'fetch', stats.get('status', 'error'), stats.get('error', 'OK'))
        if stats.get('status') == 'success':
            sent = stats.get('24h', {}).get('sent', 0)
            record_history('Postmark sincronizado', f'Envios 24h: {sent}', 'postmark')
        return jsonify(stats)
    except Exception as exc:
        record_log('postmark', 'fetch', 'error', str(exc))
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/mailgun', methods=['GET'])
def get_mailgun_stats():
    try:
        stats = mailgun_service.get_stats()
        record_log('mailgun', 'fetch', stats.get('status', 'error'), stats.get('error', 'OK'))
        if stats.get('status') == 'success':
            record_history('Mailgun sincronizado', f"Dominios: {stats.get('total_domains', 0)}", 'mailgun')
        return jsonify(stats)
    except Exception as exc:
        record_log('mailgun', 'fetch', 'error', str(exc))
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/pmg', methods=['GET'])
def get_pmg_stats():
    try:
        stats = pmg_service.get_stats()
        record_log('pmg', 'fetch', stats.get('status', 'error'), stats.get('error', 'OK'))
        if stats.get('status') == 'success':
            record_history('PMG sincronizado', 'Estatisticas atualizadas', 'pmg')
        return jsonify(stats)
    except Exception as exc:
        record_log('pmg', 'fetch', 'error', str(exc))
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/server', methods=['GET'])
def get_server_stats():
    try:
        stats = server_service.get_stats()
        record_log('server', 'fetch', stats.get('status', 'error'), stats.get('error', 'OK'))
        if stats.get('status') == 'success':
            record_history('Servidor monitorado', stats.get('uptime', ''), 'server')
        return jsonify(stats)
    except Exception as exc:
        record_log('server', 'fetch', 'error', str(exc))
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/cpanel', methods=['GET'])
def get_cpanel_accounts():
    try:
        result = cpanel_service.list_accounts()
        if isinstance(result, dict):
            status = result.get('status', 'success')
            accounts = result.get('accounts', [])
            source = result.get('source')
            errors = result.get('errors', [])
        else:
            status = 'success'
            accounts = result
            source = None
            errors = []

        if status != 'success':
            raise RuntimeError('; '.join(errors) or 'Falha ao consultar WHM')

        record_log('cpanel', 'fetch', 'success', f'{len(accounts)} contas via {source or "desconhecido"}')
        record_history('WHM sincronizado', f'{len(accounts)} contas retornadas', 'cpanel')
        return jsonify({'status': 'success', 'accounts': accounts, 'source': source, 'errors': errors})
    except Exception as exc:
        record_log('cpanel', 'fetch', 'error', str(exc))
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/credentials', methods=['GET'])
def get_credentials():
    try:
        creds = {
            'postmark': {
                'server_token_valid': bool(os.getenv('POSTMARK_SERVER_TOKEN')),
                'account_token_valid': bool(os.getenv('POSTMARK_ACCOUNT_TOKEN')),
                'last_check': _last_test_result('postmark'),
            },
            'mailgun': {
                'api_key_valid': bool(os.getenv('MAILGUN_API_KEY')),
                'region': os.getenv('MAILGUN_REGION', 'us'),
                'domain': os.getenv('MAILGUN_DOMAIN', ''),
                'last_check': _last_test_result('mailgun'),
            },
            'pmg': {
                'host': os.getenv('PMG_HOST', ''),
                'auth_valid': bool(os.getenv('PMG_PASSWORD')),
                'last_check': _last_test_result('pmg'),
            },
            'server': {
                'host': os.getenv('SERVER_HOST', ''),
                'port': os.getenv('SERVER_PORT', '22'),
                'ssh_valid': bool(os.getenv('SERVER_PASSWORD')),
                'last_check': _last_test_result('server'),
            },
            'whm': {
                'host': os.getenv('WHM_HOST', ''),
                'api_token_valid': bool(os.getenv('WHM_API_TOKEN')),
                'last_check': _last_test_result('cpanel'),
            },
            'status': 'success',
        }
        return jsonify(creds)
    except Exception as exc:
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/credentials/<service>', methods=['POST'])
def save_credentials(service):
    try:
        data = request.get_json() or {}
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')

        env_vars = {}
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as env_fp:
                for line in env_fp:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()

        if service == 'postmark':
            env_vars['POSTMARK_SERVER_TOKEN'] = data.get('server_token', '')
            env_vars['POSTMARK_ACCOUNT_TOKEN'] = data.get('account_token', '')
        elif service == 'mailgun':
            env_vars['MAILGUN_API_KEY'] = data.get('api_key', '')
            env_vars['MAILGUN_REGION'] = data.get('region', 'us')
            if 'domain' in data:
                env_vars['MAILGUN_DOMAIN'] = data.get('domain', '')
        elif service == 'pmg':
            env_vars['PMG_HOST'] = data.get('host', '')
            env_vars['PMG_USERNAME'] = 'root@pam'
            env_vars['PMG_PASSWORD'] = data.get('password', '')
        elif service == 'server':
            env_vars['SERVER_HOST'] = data.get('host', '')
            env_vars['SERVER_PORT'] = data.get('port', '22')
            env_vars['SERVER_USERNAME'] = 'root'
            env_vars['SERVER_PASSWORD'] = data.get('password', '')
        elif service == 'cpanel':
            env_vars['WHM_HOST'] = data.get('host', '')
            env_vars['WHM_USERNAME'] = 'root'
            env_vars['WHM_API_TOKEN'] = data.get('api_token', '')

        with open(env_file, 'w', encoding='utf-8') as env_fp:
            for key, value in env_vars.items():
                env_fp.write(f'{key}={value}\n')

        load_dotenv(override=True)

        record_log(service, 'credentials', 'success', 'Credenciais atualizadas')
        record_history(f'Credenciais {service}', 'Atualizadas via painel', service)
        return jsonify({'status': 'success'})
    except Exception as exc:
        record_log(service, 'credentials', 'error', str(exc))
        return jsonify({'status': 'error', 'error': str(exc)}), 200


@app.route('/api/logs', methods=['GET'])
def get_logs():
    service = request.args.get('service')
    return jsonify({'status': 'success', 'logs': store_get_logs(service)})


@app.route('/api/historico', methods=['GET'])
def get_historico():
    return jsonify({'status': 'success', 'history': store_get_history()})


@app.route('/api/test/<service>', methods=['POST'])
def test_service(service):
    service = service.lower()
    service_map = {
        'postmark': postmark_service,
        'mailgun': mailgun_service,
        'pmg': pmg_service,
        'server': server_service,
        'cpanel': cpanel_service,
    }
    svc = service_map.get(service)
    if not svc:
        return jsonify({'status': 'error', 'message': 'Servico nao suportado'}), 404
    if not hasattr(svc, 'test_connection'):
        return jsonify({'status': 'error', 'message': 'Teste nao disponivel'}), 400
    try:
        result = svc.test_connection()
        timestamp = datetime.utcnow().isoformat() + 'Z'
        result.setdefault('timestamp', timestamp)
        record_log(service, 'test', result.get('status', 'error'), result.get('message', ''))
        if result.get('status') == 'success':
            record_history(f'Teste {service}', result.get('message', 'OK'), service)
        return jsonify(result)
    except Exception as exc:
        record_log(service, 'test', 'error', str(exc))
        return jsonify({'status': 'error', 'message': str(exc)}), 200


@app.route('/api/quarentena', methods=['GET'])
def get_quarentena():
    return jsonify({'status': 'success', 'items': [], 'stats': {}})


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify({'status': 'success', 'alerts': []})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
