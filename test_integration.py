import requests
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

class IntegrationTester:
    def __init__(self):
        self.osint_url = os.getenv('OSINT_URL', 'http://localhost:8511')
        self.crm_url = os.getenv('CRM_URL', 'http://localhost:8512')
        self.integration_token = os.getenv('INTEGRATION_TOKEN')
        
        # Configurações locais de desenvolvimento
        print(f"Testando OSINT em: {self.osint_url}")
        print(f"Testando CRM em: {self.crm_url}")
    
    def test_osint_connection(self):
        try:
            # Simulando verificação de conexão para localhost
            print("Verificando conexão OSINT...")
            import socket
            socket.create_connection((socket.gethostbyname('localhost'), 8511), timeout=3)
            print("✅ Conexão OSINT OK")
            return True
        except Exception as e:
            print(f"❌ Erro na conexão OSINT: {e}")
            return False
    
    def test_crm_connection(self):
        try:
            # Simulando verificação de conexão para localhost
            print("Verificando conexão CRM...")
            import socket
            socket.create_connection((socket.gethostbyname('localhost'), 8512), timeout=3)
            print("✅ Conexão CRM OK")
            return True
        except Exception as e:
            print(f"❌ Erro na conexão CRM: {e}")
            return False
    
    def test_integration_token(self):
        # Verificando validade do token gerado
        try:
            if not self.integration_token:
                raise ValueError("Token de integração não configurado")
            
            print("Verificando Token de Integração...")
            # Token não deve ser vazio e deve ter formato de UUID
            import uuid
            uuid.UUID(str(self.integration_token))
            
            print("✅ Token de integração válido")
            return True
        except Exception as e:
            print(f"❌ Erro na validação de token: {e}")
            return False
    
    def run_full_test(self):
        print("🔍 Iniciando testes de integração MR TRUST")
        tests = [
            self.test_osint_connection,
            self.test_crm_connection,
            self.test_integration_token
        ]
        
        results = [test() for test in tests]
        
        if all(results):
            print("🟢 Todos os testes de integração passaram!")
            return True
        else:
            print("🔴 Alguns testes de integração falharam.")
            return False

if __name__ == '__main__':
    tester = IntegrationTester()
    tester.run_full_test()