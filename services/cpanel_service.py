import json
import os
import shlex
from typing import List, Optional, Tuple

import paramiko
import requests


class CpanelService:
    def __init__(self):
        self.whm_host = os.getenv('WHM_HOST', '')
        self.whm_username = os.getenv('WHM_USERNAME', 'root')
        self.whm_api_token = os.getenv('WHM_API_TOKEN', '')
        # SSH fallback
        self.ssh_host = os.getenv('SERVER_HOST', '')
        self.ssh_port = int(os.getenv('SERVER_PORT', '22') or 22)
        self.ssh_username = os.getenv('SERVER_USERNAME', 'root')
        self.ssh_password = os.getenv('SERVER_PASSWORD', '')
        self.ssh_monitor_script = os.getenv('WHM_REMOTE_SCRIPT', '/root/cpanel_monitor_api.py')
        self.ssh_python = os.getenv('WHM_REMOTE_PYTHON', 'python3')

    def list_accounts(self):
        """Lista contas do WHM priorizando coleta via SSH."""
        errors: List[str] = []
        has_ssh = bool(self.ssh_host and self.ssh_password)

        if has_ssh:
            try:
                accounts, source = self._list_accounts_ssh()
                return {'status': 'success', 'source': source, 'accounts': accounts, 'errors': errors}
            except Exception as exc:
                err_msg = f'[WHM_SSH] Falha no SSH, tentando HTTP: {exc}'
                print(err_msg)
                errors.append(err_msg)
        else:
            errors.append('SSH nao configurado (SERVER_HOST/SERVER_PASSWORD); usando API HTTP do WHM.')

        if self.whm_host and self.whm_api_token:
            try:
                accounts = self._list_accounts_http()
                return {'status': 'success', 'source': 'http', 'accounts': accounts, 'errors': errors}
            except Exception as exc:
                err_msg = f'[WHM_HTTP] Falha na API WHM: {exc}'
                print(err_msg)
                errors.append(err_msg)

        return {
            'status': 'error',
            'errors': errors or ['Nenhuma credencial valida para WHM (SSH ou token).'],
            'accounts': [],
        }

    def test_connection(self):
        try:
            result = self.list_accounts()
            if result.get('status') == 'success':
                total = len(result.get('accounts', []))
                errors = result.get('errors') or []
                status = 'warning' if errors else 'success'
                suffix = f" (Avisos: {' | '.join(errors)})" if errors else ''
                return {'status': status, 'message': f'{total} contas via {result.get("source", "desconhecido")}{suffix}'}
            return {'status': 'error', 'message': '; '.join(result.get('errors', [])) or 'Falha ao listar contas'}
        except Exception as exc:
            return {'status': 'error', 'message': str(exc)}

    def get_account_stats(self, username: str):
        if not self.whm_host or not self.whm_api_token:
            raise ValueError('WHM_HOST ou WHM_API_TOKEN nao configurados')
        host = self._clean_host()
        url = f'{host}/json-api/accountsummary'
        headers = {'Authorization': f'whm {self.whm_username}:{self.whm_api_token}'}
        params = {'user': username, 'api.version': 1}
        response = requests.get(url, headers=headers, params=params, verify=False, timeout=10)
        if response.status_code != 200:
            raise RuntimeError(f'WHM retornou status {response.status_code}')
        data = response.json()
        return data.get('data', {}).get('acct', [{}])[0]

    # ---------- HTTP helpers ----------
    def _list_accounts_http(self):
        host = self._clean_host()
        url = f'{host}/json-api/listaccts'
        headers = {'Authorization': f'whm {self.whm_username}:{self.whm_api_token}'}
        params = {'api.version': 1}
        response = requests.get(url, headers=headers, params=params, verify=False, timeout=10)
        if response.status_code != 200:
            raise RuntimeError(f'WHM retornou status {response.status_code}')
        data = response.json()
        if 'data' not in data or 'acct' not in data['data']:
            raise RuntimeError("Resposta WHM sem campo 'acct'")
        return self._enrich_accounts(data['data']['acct'])

    # ---------- SSH helpers ----------
    def _list_accounts_ssh(self) -> Tuple[List[dict], str]:
        if not self.ssh_host or not self.ssh_password:
            raise ValueError('Credenciais SSH nao configuradas (SERVER_HOST/SERVER_PASSWORD)')
        client = self._ssh_connect()
        try:
            script_accounts = self._ssh_run_monitor_script(client)
            if script_accounts:
                return self._map_script_accounts(script_accounts), 'ssh-script'
            domain_map = self._ssh_domain_map(client)
            accounts = self._ssh_whmapi_listaccts(client)
            enriched = self._enrich_accounts(accounts, ssh_client=client, domain_map=domain_map)
            return enriched, 'ssh'
        finally:
            client.close()

    def _ssh_run_monitor_script(self, client) -> Optional[List[dict]]:
        script_path = (self.ssh_monitor_script or '').strip()
        if not script_path:
            return None
        command = f"{self.ssh_python} {shlex.quote(script_path)}"
        try:
            payload = self._ssh_exec_json(client, command)
            return payload if isinstance(payload, list) else None
        except Exception as exc:
            print(f'[WHM_SSH] Script remoto falhou: {exc}')
            return None

    def _ssh_connect(self):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=self.ssh_host,
            port=self.ssh_port,
            username=self.ssh_username,
            password=self.ssh_password,
            look_for_keys=False,
            allow_agent=False,
            timeout=30,
            banner_timeout=30,
            auth_timeout=30,
        )
        return client

    def _ssh_exec_json(self, client, command: str):
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if err.strip():
            raise RuntimeError(f'SSH error: {err.strip()}')
        try:
            return json.loads(out)
        except Exception as exc:
            raise RuntimeError(f'Falha ao decodificar JSON do comando {command}: {exc}')

    def _ssh_whmapi_listaccts(self, client):
        data = self._ssh_exec_json(client, 'whmapi1 listaccts --output=json')
        return data.get('data', {}).get('acct', [])

    def _ssh_read_file(self, client, path: str) -> str:
        stdin, stdout, stderr = client.exec_command(f'cat {shlex.quote(path)}')
        out = stdout.read().decode()
        err = stderr.read().decode().strip()
        if err:
            raise RuntimeError(err)
        return out

    def _ssh_domain_map(self, client):
        try:
            content = self._ssh_read_file(client, '/etc/userdatadomains')
        except Exception as exc:
            print(f'[WHM_SSH] Nao foi possivel ler /etc/userdatadomains: {exc}')
            return {}
        mapping = {}
        for line in content.splitlines():
            if ':' not in line:
                continue
            domain, meta = line.split(':', 1)
            domain = domain.strip()
            owner = meta.strip()
            if domain.startswith('*') or 'cpcalendars' in domain or 'cpcontacts' in domain:
                continue
            mapping.setdefault(owner, []).append(domain)
        return mapping

    def _ssh_fetch_domains(self, client, username: str) -> List[str]:
        if not username:
            return []
        try:
            payload = self._ssh_exec_json(client, f'uapi --user={username} DomainInfo list_domains --output=json')
            domains: List[str] = []
            data = payload.get('result', {}).get('data', {})
            for key in ['main_domain', 'addon_domains', 'parked_domains', 'sub_domains']:
                val = data.get(key)
                if isinstance(val, list):
                    domains.extend(val)
                elif isinstance(val, str):
                    domains.append(val)
            return list({d for d in domains if d})
        except Exception as exc:
            print(f'Erro ao buscar dominios SSH de {username}: {exc}')
            return []

    def _ssh_count_emails(self, client, username: str, partition: str = 'home') -> int:
        if not username:
            return 0
        home_dir = f'/{partition}/{username}'
        command = f"""{self.ssh_python} - <<'PY'
import glob
count = 0
for path in glob.glob('{home_dir}/etc/*/shadow'):
    try:
        with open(path, 'r') as handle:
            count += sum(1 for _ in handle)
    except Exception:
        pass
print(count)
PY
"""
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        if err:
            print(f'[WHM_SSH] Erro ao contar emails de {username}: {err}')
            return 0
        try:
            return int(out) if out else 0
        except ValueError:
            return 0

    # ---------- Common enrichment ----------
    def _enrich_accounts(self, acct_list, ssh_client=None, domain_map=None):
        accounts = []
        managed_client = False
        if not ssh_client and self.ssh_host and self.ssh_password:
            try:
                ssh_client = self._ssh_connect()
                managed_client = True
            except Exception as exc:
                print(f'[WHM_SSH] Nao foi possivel abrir SSH para enriquecer: {exc}')
                ssh_client = None
        try:
            for acct in acct_list:
                user = acct.get('user', '')
                primary_domain = acct.get('domain', '')
                domains: List[str] = []
                email_count = 0

                if ssh_client:
                    if domain_map and user in domain_map:
                        domains = domain_map[user]
                    else:
                        domains = self._ssh_fetch_domains(ssh_client, user)
                    email_count = self._ssh_count_emails(ssh_client, user, acct.get('partition', 'home'))

                if (not domains or email_count == 0) and self.whm_host and self.whm_api_token:
                    if not domains:
                        domains = self._fetch_domains(user)
                    if email_count == 0:
                        email_count = self._fetch_email_count(user)

                if not domains and primary_domain:
                    domains = [primary_domain]
                if not email_count and acct.get('email') and acct.get('email') != '*unknown*':
                    email_count = 1

                accounts.append({
                    'user': user,
                    'domain': primary_domain,
                    'email_contact': acct.get('email', ''),
                    'disk_used': acct.get('diskused', '0'),
                    'disk_limit': acct.get('disklimit', 'unlimited'),
                    'suspended': acct.get('suspended', 0) == 1,
                    'ip': acct.get('ip', ''),
                    'plan': acct.get('plan', ''),
                    'domains': domains,
                    'email_accounts': email_count,
                })
        finally:
            if managed_client and ssh_client:
                ssh_client.close()
        return accounts

    def _clean_host(self):
        host = (self.whm_host or '').strip()
        if not host.startswith('http'):
            host = f'https://{host}'
        return host.rstrip('/')

    def _fetch_domains(self, username: str) -> List[str]:
        if not username:
            return []
        try:
            host = self._clean_host()
            url = f'{host}/json-api/execute/DomainInfo/domains_data'
            headers = {'Authorization': f'whm {self.whm_username}:{self.whm_api_token}'}
            params = {'user': username, 'api.version': 1}
            resp = requests.get(url, headers=headers, params=params, verify=False, timeout=10)
            if resp.status_code != 200:
                return []
            payload = resp.json()
            domains: List[str] = []
            data = payload.get('data', {})
            for key in ['main_domain', 'addon_domains', 'parked_domains', 'sub_domains']:
                val = data.get(key)
                if isinstance(val, list):
                    domains.extend(val)
                elif isinstance(val, str):
                    domains.append(val)
            return list({d for d in domains if d})
        except Exception as exc:
            print(f'Erro ao buscar dominios de {username}: {exc}')
            return []

    def _fetch_email_count(self, username: str) -> int:
        if not username:
            return 0
        try:
            host = self._clean_host()
            url = f'{host}/json-api/execute/Email/list_pops'
            headers = {'Authorization': f'whm {self.whm_username}:{self.whm_api_token}'}
            params = {'user': username, 'api.version': 1}
            resp = requests.get(url, headers=headers, params=params, verify=False, timeout=10)
            if resp.status_code != 200:
                return 0
            payload = resp.json()
            mailboxes = payload.get('data', [])
            if isinstance(mailboxes, list):
                return len(mailboxes)
            return 0
        except Exception as exc:
            print(f'Erro ao buscar emails de {username}: {exc}')
            return 0

    def _map_script_accounts(self, script_accounts):
        accounts = []
        for acct in script_accounts:
            user = acct.get('user')
            if not user:
                continue
            domains = acct.get('domains') or []
            primary_domain = domains[0] if domains else ''
            accounts.append({
                'user': user,
                'domain': primary_domain,
                'email_contact': acct.get('email_contact', ''),
                'disk_used': acct.get('disk_usage') or acct.get('disk_used') or '0',
                'disk_limit': acct.get('disk_limit', 'unlimited'),
                'suspended': bool(acct.get('suspended', 0)),
                'ip': acct.get('ip', ''),
                'plan': acct.get('plan', ''),
                'domains': domains,
                'email_accounts': acct.get('email_count', 0),
            })
        return accounts
