import json
import os
import threading
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DATA_FILE = os.path.join(DATA_DIR, 'events.json')
LOCK = threading.Lock()
DEFAULT_DATA = {'logs': [], 'history': []}
LOG_LIMIT = 500
HISTORY_LIMIT = 200


def _load():
    if not os.path.exists(DATA_FILE):
        return DEFAULT_DATA.copy()
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_DATA.copy()


def _save(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def record_log(service, action, status, message=''):
    entry = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'service': service,
        'action': action,
        'status': status,
        'message': message
    }
    with LOCK:
        data = _load()
        data.setdefault('logs', []).append(entry)
        data['logs'] = data['logs'][-LOG_LIMIT:]
        _save(data)


def record_history(title, detail, service=None):
    entry = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'title': title,
        'detail': detail,
        'service': service
    }
    with LOCK:
        data = _load()
        data.setdefault('history', []).append(entry)
        data['history'] = data['history'][-HISTORY_LIMIT:]
        _save(data)


def get_logs(service=None):
    with LOCK:
        data = _load()
    logs = data.get('logs', [])
    if service and service != 'all':
        logs = [l for l in logs if l.get('service') == service]
    return list(reversed(logs))


def get_history():
    with LOCK:
        data = _load()
    return list(reversed(data.get('history', [])))
