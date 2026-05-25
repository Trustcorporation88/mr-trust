# CRM Benchmark BR x EUA

## Objetivo

Definir a primeira versao do CRM com foco principal em atendimento, sem perder o encadeamento com vendas e marketing.

## Benchmarks de referencia

### Estados Unidos

#### Salesforce
- Customer 360 como principio central.
- Sales, Service e Marketing no mesmo ecossistema.
- Forte leitura operacional por dados, handoff entre times e IA aplicada ao contexto do cliente.

#### HubSpot
- Adoção simples e narrativa de produto muito clara.
- Entrada rapida para marketing, vendas e suporte com baixo atrito.
- Boa referencia para onboarding, usabilidade e progressao modular.

### Brasil

#### RD Station CRM / Conversas
- Funil comercial disciplinado.
- Historico de interacoes, operacao por WhatsApp e automacao comercial.
- Bom benchmark para produtividade do time de vendas e atendimento local.

#### Agendor
- CRM de vendas com linguagem operacional simples.
- Boa referencia para PMEs e para reduzir friccao na adoção.

## Conclusoes para o produto

### O que deve entrar no MVP
- Cadastro unificado de clientes e empresas.
- Atendimento com tickets, prioridade, SLA e owner.
- Timeline 360 com compras, interacoes e proximas acoes.
- Pipeline comercial ligado aos clientes.
- Leitura de marketing por campanha, conversao e receita atribuida.
- Dashboard executivo com saude da carteira, carga operacional e risco imediato.

### O que deve ficar para V1/V2
- Persistencia em banco de dados.
- Login e perfis de acesso.
- Integrações reais com WhatsApp, email e portal.
- Automacoes por evento.
- IA para resumo, classificação, priorização e resposta assistida.

## Posicionamento recomendado

O produto nao deve nascer como um CRM generico. A melhor estrategia e posicionar a solucao como plataforma de relacionamento orientada a atendimento, com visao 360 do cliente e transicao natural para vendas e marketing.

Esse recorte atende tres objetivos de negocio ao mesmo tempo:
- reduzir tempo de resposta;
- organizar contexto e historico;
- aumentar conversao e receita recorrente.

## Primeiro slice implementado

Arquivo principal do MVP:
- `crm_app.py`

Escopo entregue nesta etapa:
- painel executivo;
- fila de atendimento;
- clientes 360;
- pipeline;
- marketing;
- benchmark incorporado ao app.

## Segunda etapa implementada

Itens fechados nesta iteracao:
- persistencia local com SQLite em `Data/crm.sqlite3`;
- autenticacao com perfis de acesso por area;
- intake operacional de canais para WhatsApp, Email e Formularios;
- gravacao persistida de contas, tickets, oportunidades e campanhas.

Credenciais demo atuais:
- `admin / admin123`
- `atendimento / atend123`
- `vendas / vendas123`
- `marketing / mkt123`
- `cs / cs123`