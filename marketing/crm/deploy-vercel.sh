#!/bin/bash

# Deploy Services Catalog to Vercel - Quick Start Script
# Usage: ./deploy-vercel.sh

set -e

echo "🚀 Services Catalog Vercel Deployment"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado"
    echo "   Instale com: npm install -g vercel"
    exit 1
fi

cd "$(dirname "$0")"

# Step 1: Commit changes if any
echo "📝 Verificando git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Mudanças não commitadas encontradas"
    read -p "Deseja fazer commit? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add -A
        git commit -m "chore: pre-deployment updates"
        git push origin main
    fi
fi

# Step 2: Show current branch
echo ""
echo "🌿 Branch atual: $(git rev-parse --abbrev-ref HEAD)"
git log --oneline -1
echo ""

# Step 3: Vercel deployment
echo "📦 Iniciando deploy no Vercel..."
echo ""

# Check if .vercel folder exists (project linked)
if [ ! -d ".vercel" ]; then
    echo "⚠️  Projeto Vercel não linkado"
    echo "   Execute: vercel link"
    read -p "Continuar com novo link? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        vercel link
    fi
fi

# Deploy
vercel deploy --prod

echo ""
echo "✅ Deploy iniciado!"
echo "   Acompanhe em: https://vercel.com/dashboard"
echo ""
echo "📋 Próximas etapas:"
echo "   1. Configure variáveis de ambiente no Painel Vercel"
echo "   2. Verifique a URL de deployment"
echo "   3. Teste a rota /services"
