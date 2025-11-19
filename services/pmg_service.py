import json
import os
import textwrap
from typing import Dict, List

import paramiko


class PMGService:
    def __init__(self):
        self.api_host = self._clean_host(os.getenv('PMG_HOST', ''))
        self.api_password = os.getenv('PMG_PASSWORD', '')
        self.ssh_host = self._clean_host(os.getenv('PMG_SSH_HOST', self.api_host))
        self.ssh_port = int(os.getenv('PMG_SSH_PORT', '22') or 22)
        self.ssh_username = os.getenv('PMG_SSH_USERNAME', 'root')
        self.ssh_password = os.getenv('PMG_SSH_PASSWORD', self.api_password)
        self.ssh_python = os.getenv('PMG_SSH_PYTHON', 'python3')
        self.log_file = os.getenv('PMG_LOG_FILE', '/var/log/mail.log')

    @staticmethod
    def _clean_host(value: str) -> str:
        return (value or '').strip()

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
            timeout=20,
        )
        return client

    def _run_metrics_script(self) -> Dict:
        script = textwrap.dedent(f"""
            import json, re, os, datetime, socket, subprocess
            from collections import Counter
            LOG_FILE = {self.log_file!r}
            stats = {{"sent":0,"bounced":0,"deferred":0,"rejected":0,"connections":0,"lines":0}}
            senders = []
            now = datetime.datetime.now()
            today_iso = now.strftime("%Y-%m-%d")
            today_syslog = now.strftime("%b %e")
            if now.day < 10:
                today_syslog = now.strftime("%b  %e")
            if os.path.exists(LOG_FILE):
                with open(LOG_FILE, 'r', encoding='utf-8', errors='ignore') as handle:
                    for line in handle:
                        if not (line.startswith(today_iso) or line.startswith(today_syslog)):
                            continue
                        stats["lines"] += 1
                        if "status=sent" in line:
                            stats["sent"] += 1
                        elif "status=bounced" in line:
                            stats["bounced"] += 1
                        elif "status=deferred" in line:
                            stats["deferred"] += 1
                        elif "postfix/smtpd" in line and "client=" in line:
                            stats["connections"] += 1
                        elif "reject:" in line or "blocked" in line:
                            stats["rejected"] += 1
                        if "postfix/qmgr" in line and "from=<" in line:
                            m = re.search(r'from=<([^>]+)>', line)
                            if m:
                                sender = m.group(1)
                                if sender and not sender.startswith("root@"):
                                    senders.append(sender)
            top_list = [{{"sender": k, "count": v}} for k, v in Counter(senders).most_common(10)]
            def get_system():
                res = {{"cpu_load": 0.0, "ram_percent": 0.0, "disk_percent": "0"}}
                try:
                    with open('/proc/loadavg','r') as f:
                        res['cpu_load'] = float(f.read().split()[0])
                    out = subprocess.check_output("free | grep Mem", shell=True).decode().split()
                    res['ram_percent'] = round((int(out[2])/int(out[1]))*100, 1)
                    out = subprocess.check_output("df -h / | tail -1", shell=True).decode().split()
                    res['disk_percent'] = out[4].strip().replace('%','')
                except Exception:
                    pass
                return res
            payload = {{
                "hostname": socket.gethostname(),
                "traffic": stats,
                "top_senders": top_list,
                "system": get_system()
            }}
            print(json.dumps(payload))
        """)
        command = f"{self.ssh_python} - <<'PY'\n{script}\nPY\n"
        client = self._ssh_connect()
        try:
            stdin, stdout, stderr = client.exec_command(command, timeout=30)
            out = stdout.read().decode()
            err = stderr.read().decode().strip()
            if err:
                raise RuntimeError(err)
            return json.loads(out)
        finally:
            client.close()

    def get_stats(self):
        if not self.ssh_host or not self.ssh_password:
            return {'status': 'error', 'error': 'Configurar PMG_SSH_HOST e PMG_SSH_PASSWORD'}
        try:
            metrics = self._run_metrics_script()
            traffic = metrics.get('traffic', {})
            stats = {
                'count_in': traffic.get('sent', 0),
                'spamcount_in': traffic.get('rejected', 0),
                'viruscount_in': traffic.get('bounced', 0),
            }
            queue = {'count': traffic.get('deferred', 0)}
            top = metrics.get('top_senders', [])
            return {
                'status': 'success',
                'statistics': stats,
                'queue': queue,
                'top_senders': top,
                'traffic': traffic,
                'system': metrics.get('system', {})
            }
        except Exception as exc:
            return {'status': 'error', 'error': str(exc)}

    def test_connection(self):
        stats = self.get_stats()
        if stats.get('status') == 'success':
            count = stats.get('statistics', {}).get('count_in', 0)
            return {'status': 'success', 'message': f'PMG online via SSH, {count} mensagens encontradas'}
        return {'status': 'error', 'message': stats.get('error', 'Erro desconhecido')}
