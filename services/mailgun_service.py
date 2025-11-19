import os
from typing import Dict, List

import requests


class MailgunService:
    BASE_URL = 'https://api.mailgun.net/v3'

    def __init__(self):
        self.api_key = os.getenv('MAILGUN_API_KEY', '')

    def _auth(self):
        return ('api', self.api_key)

    def _list_domains(self) -> List[str]:
        resp = requests.get(f'{self.BASE_URL}/domains', auth=self._auth(), timeout=15)
        if resp.status_code != 200:
            raise RuntimeError(f'Mailgun respondeu {resp.status_code}: {resp.text}')
        return [d.get('name') for d in resp.json().get('items', []) if d.get('name')]

    def _fetch_domain_totals(self, domain: str) -> Dict[str, float]:
        url = f"{self.BASE_URL}/{domain}/stats/total"
        params = [('duration', '1d')]
        for event in ['accepted', 'delivered', 'failed', 'opened', 'clicked']:
            params.append(('event', event))
        resp = requests.get(url, auth=self._auth(), params=params, timeout=15)
        if resp.status_code != 200:
            raise RuntimeError(f'{domain}: {resp.status_code} {resp.text}')
        payload = resp.json()
        stats = payload.get('stats', [])
        totals = {'accepted': 0, 'delivered': 0, 'failed': 0, 'opened': 0, 'clicked': 0}
        for entry in stats:
            for key in totals.keys():
                section = entry.get(key, {})
                value = section.get('outgoing', 0)
                if isinstance(value, (int, float)):
                    totals[key] += value
        return totals

    def get_stats(self):
        if not self.api_key:
            return {'status': 'error', 'error': 'API Key nao configurada'}
        try:
            domains = self._list_domains()
        except Exception as exc:
            return {'status': 'error', 'error': str(exc)}
        if not domains:
            return {'status': 'warning', 'error': 'Nenhum dominio cadastrado', 'total_domains': 0, '24h': {}}

        aggregate = {'accepted': 0, 'delivered': 0, 'failed': 0, 'opened': 0, 'clicked': 0}
        per_domain = []
        errors = []
        for domain in domains:
            try:
                totals = self._fetch_domain_totals(domain)
                for key in aggregate.keys():
                    aggregate[key] += totals.get(key, 0)
                per_domain.append({'domain': domain, 'stats': totals})
            except Exception as exc:
                errors.append(str(exc))

        status = 'warning' if errors else 'success'
        return {
            'status': status,
            'total_domains': len(domains),
            'primary_domain': domains[0],
            'domains': domains,
            'per_domain': per_domain,
            'errors': errors,
            '24h': aggregate
        }

    def test_connection(self):
        stats = self.get_stats()
        if stats.get('status') == 'error':
            return {'status': 'error', 'message': stats.get('error', 'Falha ao consultar Mailgun')}
        accepted = stats.get('24h', {}).get('accepted', 0)
        msg = f"{accepted} mensagens nas ultimas 24h (total {stats.get('total_domains', 0)} dominios)"
        if stats.get('errors'):
            msg += f" | Avisos: {' | '.join(stats['errors'])}"
        return {'status': stats.get('status', 'success'), 'message': msg}
