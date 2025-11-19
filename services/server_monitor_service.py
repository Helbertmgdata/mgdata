import json
import os
import time
import textwrap
from datetime import timedelta

import paramiko
import psutil


class ServerMonitorService:
    def __init__(self):
        self.remote_host = (os.getenv('SERVER_HOST', '') or '').strip()
        self.remote_port = int(os.getenv('SERVER_PORT', '22') or 22)
        self.remote_user = os.getenv('SERVER_USERNAME', 'root')
        self.remote_password = os.getenv('SERVER_PASSWORD', '')
        self.remote_python = os.getenv('SERVER_SSH_PYTHON', 'python3')

    def _uptime(self):
        boot_time = getattr(psutil, 'boot_time', lambda: 0)()
        uptime_seconds = time.time() - boot_time if boot_time else 0
        if uptime_seconds <= 0:
            return 'n/a'
        delta = timedelta(seconds=int(uptime_seconds))
        return str(delta)

    def _format_bytes(self, value):
        return f"{round((value or 0) / (1024 ** 3), 2)}GB"

    def _local_disks(self):
        disks = []
        for part in psutil.disk_partitions(all=False):
            if part.fstype == '':
                continue
            try:
                usage = psutil.disk_usage(part.mountpoint)
            except PermissionError:
                continue
            disks.append({
                'mount': part.mountpoint,
                'percent': usage.percent,
                'used': self._format_bytes(usage.used),
                'total': self._format_bytes(usage.total)
            })
        return disks

    def _local_stats(self):
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        return {
            'status': 'success',
            'cpu': {'usage': cpu_percent, 'cores': cpu_count},
            'memory': {
                'percent': mem.percent,
                'used': self._format_bytes(mem.used),
                'total': self._format_bytes(mem.total)
            },
            'disk': {
                'percent': disk.percent,
                'used': self._format_bytes(disk.used),
                'total': self._format_bytes(disk.total)
            },
            'uptime': self._uptime(),
            'disks': self._local_disks()
        }

    def _ssh_connect(self):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=self.remote_host,
            port=self.remote_port,
            username=self.remote_user,
            password=self.remote_password,
            look_for_keys=False,
            allow_agent=False,
            timeout=20,
        )
        return client

    def _remote_stats(self):
        if not self.remote_host or not self.remote_password:
            raise RuntimeError('Credenciais SSH nao configuradas')

        script = textwrap.dedent("""
            import json, os, time

            def cpu_usage():
                try:
                    import psutil
                    return round(psutil.cpu_percent(interval=1), 1), psutil.cpu_count() or 0
                except Exception:
                    def read_cpu():
                        with open('/proc/stat', 'r') as fh:
                            line = fh.readline().split()
                        values = list(map(int, line[1:]))
                        idle = values[3]
                        total = sum(values)
                        return idle, total
                    idle1, total1 = read_cpu()
                    time.sleep(1)
                    idle2, total2 = read_cpu()
                    idle = idle2 - idle1
                    total = total2 - total1
                    percent = 0 if total == 0 else (1 - idle / total) * 100
                    return round(percent, 1), os.cpu_count() or 0

            def memory_usage():
                try:
                    import psutil
                    mem = psutil.virtual_memory()
                    return mem.percent, mem.used, mem.total
                except Exception:
                    info = {}
                    with open('/proc/meminfo', 'r') as fh:
                        for line in fh:
                            key, val = line.split(':', 1)
                            info[key.strip()] = int(val.strip().split()[0]) * 1024
                    total = info.get('MemTotal', 0)
                    free = info.get('MemFree', 0) + info.get('Buffers', 0) + info.get('Cached', 0)
                    used = total - free
                    percent = 0 if total == 0 else round((used / total) * 100, 1)
                    return percent, used, total

            def disk_usage(path='/'):
                try:
                    import psutil
                    d = psutil.disk_usage(path)
                    return d.percent, d.used, d.total
                except Exception:
                    st = os.statvfs(path)
                    total = st.f_blocks * st.f_frsize
                    free = st.f_bfree * st.f_frsize
                    used = total - free
                    percent = 0 if total == 0 else round(used / total * 100, 1)
                    return percent, used, total

            def list_disks():
                try:
                    import psutil
                    partitions = psutil.disk_partitions(all=False)
                    result = []
                    for part in partitions:
                        if part.fstype == '':
                            continue
                        try:
                            usage = psutil.disk_usage(part.mountpoint)
                        except PermissionError:
                            continue
                        result.append({
                            "mount": part.mountpoint,
                            "percent": usage.percent,
                            "used": usage.used,
                            "total": usage.total
                        })
                    return result
                except Exception:
                    result = []
                    stream = os.popen("df -P -B1")
                    lines = stream.read().strip().splitlines()[1:]
                    for line in lines:
                        parts = line.split()
                        if len(parts) < 6:
                            continue
                        result.append({
                            "mount": parts[5],
                            "percent": float(parts[4].strip('%')),
                            "used": int(parts[2]),
                            "total": int(parts[1])
                        })
                    return result

            def uptime():
                try:
                    with open('/proc/uptime', 'r') as fh:
                        seconds = float(fh.readline().split()[0])
                    hours, remainder = divmod(int(seconds), 3600)
                    minutes, secs = divmod(remainder, 60)
                    days, hours = divmod(hours, 24)
                    segments = []
                    if days:
                        segments.append(f"{days}d")
                    segments.append(f"{hours}h")
                    segments.append(f"{minutes}m")
                    return ' '.join(segments)
                except Exception:
                    return 'n/a'

            cpu_percent, cpu_cores = cpu_usage()
            mem_percent, mem_used, mem_total = memory_usage()
            disk_percent, disk_used, disk_total = disk_usage('/')
            disks = list_disks()
            payload = {
                "status": "success",
                "cpu": {"usage": cpu_percent, "cores": cpu_cores},
                "memory": {"percent": mem_percent, "used": mem_used, "total": mem_total},
                "disk": {"percent": disk_percent, "used": disk_used, "total": disk_total},
                "disks": disks,
                "uptime": uptime()
            }
            print(json.dumps(payload))
        """)

        command = f"{self.remote_python} - <<'PY'\n{script}\nPY\n"
        client = self._ssh_connect()
        try:
            stdin, stdout, stderr = client.exec_command(command, timeout=40)
            out = stdout.read().decode()
            err = stderr.read().decode().strip()
            if err:
                raise RuntimeError(err)
            data = json.loads(out)
            mem = data.get('memory', {})
            data['memory'] = {
                'percent': mem.get('percent', 0),
                'used': self._format_bytes(mem.get('used', 0)),
                'total': self._format_bytes(mem.get('total', 0)),
            }
            disk = data.get('disk', {})
            data['disk'] = {
                'percent': disk.get('percent', 0),
                'used': self._format_bytes(disk.get('used', 0)),
                'total': self._format_bytes(disk.get('total', 0)),
            }
            remote_disks = []
            for entry in data.get('disks', []):
                remote_disks.append({
                    'mount': entry.get('mount'),
                    'percent': entry.get('percent', 0),
                    'used': self._format_bytes(entry.get('used', 0)),
                    'total': self._format_bytes(entry.get('total', 0)),
                })
            data['disks'] = remote_disks
            return data
        finally:
            client.close()

    def get_stats(self):
        if self.remote_host and self.remote_password:
            try:
                return self._remote_stats()
            except Exception as exc:
                return {'status': 'error', 'error': str(exc)}
        try:
            return self._local_stats()
        except Exception as exc:
            return {'status': 'error', 'error': str(exc)}

    def test_connection(self):
        stats = self.get_stats()
        if stats.get('status') == 'success':
            if self.remote_host:
                return {'status': 'success', 'message': 'Monitor remoto operacional'}
            return {'status': 'success', 'message': 'Monitor local operacional'}
        return {'status': 'error', 'message': stats.get('error', 'Erro desconhecido')}
