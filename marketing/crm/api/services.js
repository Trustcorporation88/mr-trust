const servicesData = {
  "services": [
    {
      "id": "create_deal",
      "name": "Criar Novo Deal",
      "category": "vendas",
      "icon": "handshake",
      "description": "Registre uma nova oportunidade de vendas no pipeline de vendas",
      "color": "#3B82F6",
      "instructions": {
        "what": "Criar um novo Deal permite rastrear oportunidades de vendas através de diferentes estágios (Lead → Proposta → Negociação → Fechamento)",
        "steps": ["Clique em 'Novo Deal'", "Preencha os dados do cliente", "Defina o valor e probabilidade de fechamento", "Escolha o estágio inicial do deal", "Salve e visualize no Kanban"],
        "requiredFields": [{"field": "Cliente", "type": "select", "description": "Selecione um cliente existente ou crie um novo"}, {"field": "Título", "type": "text", "description": "Nome/descrição da oportunidade"}, {"field": "Valor", "type": "currency", "description": "Valor estimado em BRL"}, {"field": "Probabilidade", "type": "percentage", "description": "Chance de fechamento"}, {"field": "Estágio", "type": "select", "options": ["lead", "proposal", "negotiation", "closing", "won"], "description": "Estágio atual"}],
        "expectedOutput": {"success": "Deal criado com sucesso", "example": {"id": "deal-123", "title": "Venda", "stage": "negotiation", "createdAt": "26/05/2026"}}
      }
    },
    {
      "id": "manage_deal_stage",
      "name": "Gerenciar Estágio do Deal",
      "category": "vendas",
      "icon": "arrows",
      "description": "Mova um deal entre os estágios do pipeline",
      "color": "#10B981",
      "instructions": {"what": "Alterar estágio reflete progresso", "steps": ["Acesse Kanban", "Localize deal", "Arraste para novo estágio", "Atualização automática", "Recalcula pipeline"], "requiredFields": [{"field": "Deal", "type": "search"}, {"field": "Novo Estágio", "type": "select"}], "expectedOutput": {"success": "Deal movido com sucesso"}}
    },
    {
      "id": "mark_deal_won",
      "name": "Marcar Deal como Ganho",
      "category": "vendas",
      "icon": "trophy",
      "description": "Finalize um deal como venda bem-sucedida",
      "color": "#F59E0B",
      "instructions": {"what": "Confirma a venda", "steps": ["Localize deal fechado", "Clique Ganho", "Confirme data", "Adicione notas", "Deal em Vencidos"], "requiredFields": [{"field": "Deal ID"}, {"field": "Data Fechamento"}], "expectedOutput": {"success": "Deal finalizado", "revenue": "Valor adicionado"}}
    },
    {
      "id": "create_ticket",
      "name": "Abrir Novo Ticket",
      "category": "suporte",
      "icon": "ticket",
      "description": "Crie um ticket de suporte",
      "color": "#8B5CF6",
      "instructions": {"what": "Registra solicitação com SLA", "steps": ["Novo Ticket", "Categoria", "Prioridade", "Descrição", "Atribua", "SLA automático"], "requiredFields": [{"field": "Cliente"}, {"field": "Título"}, {"field": "Descrição"}, {"field": "Categoria"}, {"field": "Prioridade"}], "expectedOutput": {"success": "Ticket criado", "ticketId": "TKT-12345"}}
    },
    {
      "id": "resolve_ticket",
      "name": "Resolver Ticket",
      "category": "suporte",
      "icon": "check-circle",
      "description": "Marque ticket como resolvido",
      "color": "#06B6D4",
      "instructions": {"what": "Fecha ticket e coleta feedback", "steps": ["Localize ticket", "Resolver", "Solução", "Review", "CSAT", "Resolvido"], "requiredFields": [{"field": "Ticket ID"}, {"field": "Solução"}, {"field": "Tempo Gasto"}], "expectedOutput": {"success": "Resolvido", "followUp": "CSAT enviado"}}
    },
    {
      "id": "create_campaign",
      "name": "Criar Nova Campanha",
      "category": "marketing",
      "icon": "megaphone",
      "description": "Lance campanha de marketing",
      "color": "#EC4899",
      "instructions": {"what": "Rastreia esforços de marketing", "steps": ["Nova Campanha", "Nome/tipo/canal", "Datas", "Orçamento", "Métricas"], "requiredFields": [{"field": "Nome"}, {"field": "Tipo"}, {"field": "Canal"}, {"field": "Datas"}, {"field": "Orçamento"}], "expectedOutput": {"success": "Campanha criada", "campaignId": "camp-2026-05-email"}}
    },
    {
      "id": "track_campaign_metrics",
      "name": "Rastrear Métricas",
      "category": "marketing",
      "icon": "chart-bar",
      "description": "Visualize performance e ROI",
      "color": "#14B8A6",
      "instructions": {"what": "Dashboard de métricas", "steps": ["Campanhas", "Selecione", "Gráficos", "Compare", "Exporte PDF"], "metrics": [{"name": "Leads"}, {"name": "Conversão"}, {"name": "CPL"}, {"name": "ROI"}], "expectedOutput": {"success": "Dashboard interativo"}}
    },
    {
      "id": "import_customers",
      "name": "Importar Clientes",
      "category": "dados",
      "icon": "upload",
      "description": "Importe CSV/Excel",
      "color": "#6366F1",
      "instructions": {"what": "Importação em massa", "steps": ["Importar", "Template", "Preenchimento", "Upload", "Validação", "Relatório"], "fileFormat": {"type": "CSV", "columns": ["nome", "email", "telefone"], "encoding": "UTF-8"}, "expectedOutput": {"success": "Importado com sucesso"}}
    },
    {
      "id": "export_report",
      "name": "Exportar Relatório",
      "category": "dados",
      "icon": "download",
      "description": "Exporte em PDF/Excel",
      "color": "#F97316",
      "instructions": {"what": "Geração de relatórios", "steps": ["Tipo", "Período", "Formato", "Gerar", "Download"], "reportTypes": [{"type": "Pipeline"}, {"type": "SLA"}, {"type": "Campanhas"}], "expectedOutput": {"success": "Arquivo gerado"}}
    },
    {
      "id": "setup_automation",
      "name": "Configurar Automações",
      "category": "configuração",
      "icon": "cog",
      "description": "Workflows automáticos",
      "color": "#78716C",
      "instructions": {"what": "Reduz trabalho manual", "steps": ["Automações", "Nova", "Gatilho", "Ação", "Teste", "Ativa"], "triggers": ["Deal criado", "Ticket aberto"], "actions": ["Email", "Slack", "Webhook"], "expectedOutput": {"success": "Ativa e funcionando"}}
    },
    {
      "id": "integrate_mailchimp",
      "name": "Integração Mailchimp",
      "category": "integrações",
      "icon": "link",
      "description": "Sincronize com Mailchimp",
      "color": "#001E50",
      "instructions": {"what": "Conecta com Mailchimp", "steps": ["Integrações", "Mailchimp", "Conectar", "Autorizar", "Lista", "Ativa"], "requiredData": [{"field": "API Key"}, {"field": "List ID"}], "expectedOutput": {"success": "Conectada", "sync": "Em tempo real"}}
    }
  ]
};

function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, id } = req.query;

    if (!category && !id) {
      const total = servicesData.services.length;
      const categories = [...new Set(servicesData.services.map(s => s.category))];
      return res.status(200).json({ total, services: servicesData.services, categories });
    }

    if (id) {
      const service = servicesData.services.find(s => s.id === id);
      if (!service) return res.status(404).json({ error: 'Service not found' });
      return res.status(200).json(service);
    }

    if (category) {
      const filtered = servicesData.services.filter(s => s.category === category);
      return res.status(200).json({ total: filtered.length, services: filtered, category });
    }

    return res.status(400).json({ error: 'Invalid parameters' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

module.exports = handler;
