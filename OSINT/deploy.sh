#!/bin/bash

# Script de Deploy para MR TRUST OSINT

# Verificar e instalar dependências do sistema
echo "Verificando dependências do sistema..."
if ! command -v python3 &> /dev/null; then
    echo "Python 3 não encontrado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip
fi

# Criar e ativar ambiente virtual
echo "Preparando ambiente virtual..."
python3 -m venv .venv
source .venv/bin/activate

# Atualizar pip e instalar dependências
pip install --upgrade pip
pip install -r requirements.txt

# Configurações de segurança e ambiente
export OSINT_APP_ENV="production"
export OSINT_LOG_LEVEL="WARNING"
export PYTHONWARNINGS="ignore"

# Configurações de rede e segurança
export STREAMLIT_SERVER_PORT=8511
export STREAMLIT_SERVER_ADDRESS="0.0.0.0"
export STREAMLIT_SERVER_BASE_URL_PATH="/osint"

# Iniciar aplicação Streamlit com opções de segurança
streamlit run web_app.py \
    --server.port $STREAMLIT_SERVER_PORT \
    --server.address $STREAMLIT_SERVER_ADDRESS \
    --server.baseUrlPath $STREAMLIT_SERVER_BASE_URL_PATH \
    --server.enableCORS false \
    --server.enableXsrfProtection true