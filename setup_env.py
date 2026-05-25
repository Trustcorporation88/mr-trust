import os
import secrets
import uuid

def generate_secure_config():
    config = {
        # Chaves de segurança
        'OSINT_SECRET_KEY': secrets.token_hex(32),
        'CRM_SECRET_KEY': secrets.token_hex(32),
        'INTEGRATION_TOKEN': str(uuid.uuid4()),
        
        # URLs de integração
        'OSINT_URL': 'https://osint.trustcorporation.com',
        'CRM_URL': 'https://crm.trustcorporation.com',
        
        # Configurações de log
        'LOG_LEVEL': 'WARNING',
        
        # Configurações de banco de dados
        'CRM_DATABASE_URL': 'sqlite:///./crm_database.sqlite',
        
        # Configurações de segurança
        'MAX_LOGIN_ATTEMPTS': 5,
        'LOGIN_ATTEMPT_WINDOW_MINUTES': 30,
        
        # Configurações de proxy
        'PROXY_ENABLED': 'false',
        'PROXY_URL': '',
        'PROXY_PORT': '',
    }
    
    # Gerar arquivo .env
    with open('.env', 'w') as f:
        for key, value in config.items():
            f.write(f"{key}={value}\n")
    
    print("Configurações de ambiente geradas com sucesso em .env")

if __name__ == '__main__':
    generate_secure_config()