import os
from datetime import datetime, timedelta

import requests


class PostmarkService:
    BASE_URL = 'https://api.postmarkapp.com'

    def __init__(self):
        self.server_token = os.getenv('POSTMARK_SERVER_TOKEN', '')
        self.session = requests.Session()

    def _headers(self):
        return {
            'Accept': 'application/json',
            'X-Postmark-Server-Token': self.server_token
        }

    def get_stats(self):
        if not self.server_token:
            return {'status': 'error', 'error': 'Token năo configurado'}
        try:
            today = datetime.utcnow().date()
            params = {
                'fromdate': (today - timedelta(days=1)).isoformat(),
                'todate': today.isoformat()
            }
            resp = self.session.get(
                f'{self.BASE_URL}/stats/outbound',
                headers=self._headers(),
                params=params,
                timeout=10
            )
            if resp.status_code != 200:
                return {'status': 'error', 'error': f'Postmark respondeu {resp.status_code}: {resp.text}'}
            data = resp.json()
            stats_24h = {
                'sent': data.get('Sent', 0),
                'open_rate': data.get('Tracked', 0),
                'bounced': data.get('Bounced', 0)
            }
            return {'status': 'success', '24h': stats_24h}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def test_connection(self):
        if not self.server_token:
            return {'status': 'error', 'message': 'Token năo configurado'}
        try:
            resp = self.session.get(f'{self.BASE_URL}/server', headers=self._headers(), timeout=10)
            if resp.status_code == 200:
                info = resp.json()
                return {'status': 'success', 'message': f"Server: {info.get('Name', 'OK')}"}
            return {'status': 'error', 'message': f'Postmark respondeu {resp.status_code}: {resp.text}'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
