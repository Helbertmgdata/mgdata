import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

class Config:
    """Configurações da aplicação"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Server
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # Postmark
    POSTMARK_SERVER_TOKEN = os.getenv('POSTMARK_SERVER_TOKEN')
    POSTMARK_ACCOUNT_TOKEN = os.getenv('POSTMARK_ACCOUNT_TOKEN')
    
    # Mailgun
    MAILGUN_API_KEY = os.getenv('MAILGUN_API_KEY')
    MAILGUN_REGION = os.getenv('MAILGUN_REGION', 'us')
    
    # Proxmox Mail Gateway
    PMG_HOST = os.getenv('PMG_HOST')
    PMG_PORT = int(os.getenv('PMG_PORT', 8006))
    PMG_USERNAME = os.getenv('PMG_USERNAME')
    PMG_PASSWORD = os.getenv('PMG_PASSWORD')
    PMG_NODE = os.getenv('PMG_NODE', 'pmg')
    
    # Linux Server Monitoring
    SERVER_HOST = os.getenv('SERVER_HOST')
    SERVER_PORT = int(os.getenv('SERVER_PORT', 22))
    SERVER_USERNAME = os.getenv('SERVER_USERNAME')
    SERVER_PASSWORD = os.getenv('SERVER_PASSWORD')
    
    # cPanel/WHM (nova estrutura simplificada)
    WHM_HOST = os.getenv('WHM_HOST')
    WHM_USERNAME = os.getenv('WHM_USERNAME', 'root')
    WHM_API_TOKEN = os.getenv('WHM_API_TOKEN')
    
    # cPanel/WHM Accounts (legado - manter compatibilidade)
    CPANEL_ACCOUNTS = os.getenv('CPANEL_ACCOUNTS', '')
    
    # Scheduler
    SCHEDULER_INTERVAL_MINUTES = 5
    
    @staticmethod
    def get_cpanel_accounts():
        """Parse cPanel accounts from environment variable"""
        accounts_str = Config.CPANEL_ACCOUNTS
        if not accounts_str:
            return []
        
        accounts = []
        for account in accounts_str.split(','):
            account = account.strip()
            if not account:
                continue
            
            parts = account.split(':')
            if len(parts) >= 4:
                accounts.append({
                    'name': parts[0],
                    'url': parts[1],
                    'username': parts[2],
                    'token': ':'.join(parts[3:])  # Token pode conter ':'
                })
        
        return accounts
