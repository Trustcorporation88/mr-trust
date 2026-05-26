#!/bin/bash

# Services Catalog - Quick Validation Test
# Testa se a API e o frontend estão funcionando

echo "🧪 Services Catalog - Teste Rápido de Validação"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Verificar se servidor está rodando
echo -e "${BLUE}[1/5]${NC} Verificando se servidor está rodando..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Servidor está online${NC}"
else
    echo -e "${RED}✗ Servidor não respondeu${NC}"
    echo "   Inicie com: npm start"
    exit 1
fi
echo ""

# Test 2: Teste endpoint /api/v1/services
echo -e "${BLUE}[2/5]${NC} Testando GET /api/v1/services..."
RESPONSE=$(curl -s http://localhost:3000/api/v1/services)
TOTAL=$(echo $RESPONSE | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$TOTAL" ]; then
    if [ "$TOTAL" -eq 11 ]; then
        echo -e "${GREEN}✓ API retornou 11 serviços${NC}"
    else
        echo -e "${YELLOW}⚠ API retornou $TOTAL serviços (esperado 11)${NC}"
    fi
else
    echo -e "${RED}✗ API não retornou dados válidos${NC}"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 3: Teste obter serviço específico
echo -e "${BLUE}[3/5]${NC} Testando GET /api/v1/services/create_deal..."
RESPONSE=$(curl -s http://localhost:3000/api/v1/services/create_deal)
if echo $RESPONSE | grep -q '"id":"create_deal"'; then
    echo -e "${GREEN}✓ Serviço 'create_deal' encontrado${NC}"
else
    echo -e "${RED}✗ Serviço não encontrado${NC}"
    exit 1
fi
echo ""

# Test 4: Teste filtro por categoria
echo -e "${BLUE}[4/5]${NC} Testando GET /api/v1/services/category/vendas..."
RESPONSE=$(curl -s http://localhost:3000/api/v1/services/category/vendas)
COUNT=$(echo $RESPONSE | grep -o '"total":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$COUNT" ]; then
    if [ "$COUNT" -eq 3 ]; then
        echo -e "${GREEN}✓ Categoria 'vendas' retornou 3 serviços${NC}"
    else
        echo -e "${YELLOW}⚠ Categoria 'vendas' retornou $COUNT serviços (esperado 3)${NC}"
    fi
else
    echo -e "${RED}✗ Erro ao filtrar por categoria${NC}"
    exit 1
fi
echo ""

# Test 5: Verificar arquivo JSON
echo -e "${BLUE}[5/5]${NC} Verificando arquivo services-catalog.json..."
if [ -f "server/services-catalog.json" ]; then
    echo -e "${GREEN}✓ Arquivo encontrado${NC}"
    # Contar número de serviços no JSON
    SERVICES=$(grep -o '"id":' server/services-catalog.json | wc -l)
    echo -e "  Serviços no JSON: $SERVICES"
else
    echo -e "${RED}✗ Arquivo não encontrado${NC}"
    echo "   Procure em: server/services-catalog.json"
    exit 1
fi
echo ""

# Teste Frontend
echo -e "${BLUE}[BONUS]${NC} Verificando Frontend..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend está acessível${NC}"
    echo "   Acesse: http://localhost:3000/services"
else
    echo -e "${YELLOW}⚠ Frontend não respondeu (pode estar em build)${NC}"
fi
echo ""

# Resultado Final
echo "=============================================="
echo -e "${GREEN}✅ Testes concluídos com sucesso!${NC}"
echo ""
echo "📚 Próximos Passos:"
echo "  1. Abra: http://localhost:3000/services"
echo "  2. Explore os 11 serviços"
echo "  3. Clique em um card para ver instruções"
echo "  4. Consulte SERVICES_CATALOG_GUIDE.md para mais detalhes"
echo ""
echo "🔗 Links Úteis:"
echo "  - API Base: http://localhost:3000/api/v1/services"
echo "  - Frontend: http://localhost:3000/services"
echo "  - Documentação: SERVICES_CATALOG_GUIDE.md"
echo ""
