#!/bin/bash
# Script para adicionar env vars via Vercel API

VERCEL_TOKEN=$(vercel whoami --token)
PROJECT_ID="prj_OOlYIglT4cUy9ngKEydAoCqC3FO1"
TEAM_ID="team_A8uatAO8BKF7uUf9SsU6xC6R"

echo "Adicionando variáveis de ambiente..."

# JWT_SECRET
curl -X POST "https://api.vercel.com/v8/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "JWT_SECRET",
    "value": "your-super-secret-jwt-key-2026-flavio-crm-production",
    "target": ["production"]
  }'

echo ""
echo "Variáveis adicionadas!"
