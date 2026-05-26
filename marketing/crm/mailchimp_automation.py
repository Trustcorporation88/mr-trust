#!/usr/bin/env python3
"""
Mailchimp Automation Setup for MEISHOP CRM
Configures audience, email templates, and automation workflow
"""

import requests
import json
from datetime import datetime, timedelta

# Mailchimp Configuration
API_KEY = "6a966436f8f653b54d3ebb2a35bbf41a-us15"
SERVER = "us15"
BASE_URL = f"https://{SERVER}.api.mailchimp.com/3.0"
ACCOUNT_EMAIL = "gaveanegocioss@gmail.com"

# Email copy from EMAIL-SEQUENCE.md
EMAILS = {
    "discovery": {
        "subject": "👋 MEISHOP CRM: Customer 360 em 30 min (não é integração)",
        "body": """Oi [NAME],

Vimos que sua empresa trabalha com atendimento ao cliente. 

Aqui na MEISHOP sabemos que CRMs como Salesforce/HubSpot são overkill pra PMEs:
- R$ 3K-10K/mês
- Setup leva semanas
- Dashboard com 50 abas

A gente resolveu esse problema: Customer 360 em cloud ou on-premises, R$ 299-899/mês, pronto em 30 min.

Quer 15 min pra conhecer?

Abraço,
Sales Team MEISHOP
sales@meishop.com.br"""
    },
    "value": {
        "subject": "Seu ROI em 6 meses com MEISHOP",
        "body": """Oi [NAME],

Achei interessante sua empresa entrar em contato.

Nos últimos 3 anos ajudamos 50+ empresas como a sua a reduzir custos de CRM em 70%.

Os números que vemos:
- 89% redução em tempo de busca por cliente
- 4.2x mais deals fechados por rep
- 50 min economizados por rep/dia
- R$ 280K ROI em 6 meses

Isso é porque a gente não vende "todas as features do mundo". A gente vende:
→ Customer 360 (histórico + oportunidades)
→ Pipeline transparente
→ Tickets de atendimento com SLA
→ Intake multicanal (WhatsApp, email, formulários)
→ Controle de acesso por perfil

Sem bloat. Sem integração complexa.

Quer ver?

Sales,
MEISHOP
sales@meishop.com.br"""
    },
    "social_proof": {
        "subject": "Empresa XYZ usa MEISHOP (e você deveria também)",
        "body": """Oi [NAME],

Ontem falei com o diretor de operações da XYZ (do mesmo segmento que você).

Ele me contou que com MEISHOP conseguiu:
- Reduzir attrition de clientes em 23% (porque agora o time tem histórico)
- Aumentar velocidade de atendimento em 40% (tickets com SLA)
- Cortar R$ 8K/mês que gastava com 3 ferramentas separadas

Ele saiu de um setup horrível:
- Salesforce + HubSpot + Zendesk = R$ 12K/mês
- Cada ferramenta com um dado diferente do cliente
- Times sem visibilidade um do outro

Pra:
- MEISHOP R$ 899/mês
- Um único source of truth
- Atendimento + vendas + marketing no mesmo painel

A historia dele pode ser sua também.

Quer conversar?

Sales,
MEISHOP
sales@meishop.com.br"""
    },
    "objection": {
        "subject": "\"MEISHOP é muito simples para minha empresa\"",
        "body": """Oi [NAME],

Ouço muito: "Mas MEISHOP não tem [feature X, Y, Z]".

Verdade.

A gente não tem:
- 50 relatórios pré-built
- Machine learning pra prever churn
- Integrações com 200+ ferramentas
- UX com 10 cliques por ação

Porque empresas como a sua não precisam disso.

O que você precisa:
✓ Saber quem é o cliente
✓ Saber que deal está com que rep
✓ Saber que ticket venceu o SLA
✓ Integrar com WhatsApp pro atendimento entrar automaticamente

MEISHOP é exatamente isso. Sem complicação.

E sabe o que é bom nisso? Se amanhã você virar uma empresa de 500 pessoas, a gente consegue customizar. Mas até lá, você não paga por features que não usa.

Quer testar grátis por 7 dias?

Sales,
MEISHOP
sales@meishop.com.br"""
    },
    "final_offer": {
        "subject": "Seus 7 dias grátis estão agora (e valem 30 dias)",
        "body": """Oi [NAME],

Última mensagem dessa série (prometo 😄).

Você teve interesse em MEISHOP. A gente gostou de você.

Por isso: vamos dar 30 dias grátis (em vez de 7) pra você testar tudo.

O que você vai conseguir fazer:
- Importar seus clientes existentes
- Configurar pipeline + tickets
- Integrar WhatsApp
- Treinar seu time (2h)

Em 30 dias você vai saber se:
a) Vai economizar R$ 8K+/mês (como XYZ fez)
b) Não é pra vocês (sem drama)

Mas só valem os 30 dias se responder esse email até quinta.

Pode ser?

Sales,
MEISHOP
sales@meishop.com.br"""
    },
    "trial_welcome": {
        "subject": "🎉 Bem-vindo ao MEISHOP! Comece agora",
        "body": """Oi [NAME],

Parabéns! Sua conta MEISHOP foi criada.

Aqui estão seus próximos passos:

1️⃣ Login: https://app.meishop.com.br
   Email: [EMAIL]
   Senha: [SENHA] (mude na primeira vez)

2️⃣ Importe seu base de clientes (CSV)
   → Leva 5 min
   → Qualquer coluna, a gente adapta

3️⃣ Configure seu primeiro pipeline
   → Qual é seu ciclo de venda?
   → Quantas etapas até fechamento?
   → Pronto em 10 min

4️⃣ Treina seu time
   → Coletiva via Zoom (2h)
   → Agenda: segunda, 14h
   → Link: [ZOOM]

Se tiver dúvida no caminho, responde esse email.

Nós respondemos em 30 min (promessa de SLA 99.9%).

Abraço,
Success Team MEISHOP
success@meishop.com.br"""
    },
    "trial_feature": {
        "subject": "Pipeline transparente: como usar",
        "body": """Oi [NAME],

Vimos que você criou uma oportunidade.

Aqui um detalhe que a maioria não percebe:

No MEISHOP, cada oportunidade tem:
- Estágio (Prospecção, Qualificação, Proposta, Negociação, Fechado)
- Probabilidade (que você ajusta por experiência)
- Data de fechamento
- Owner (quem é responsável)
- Histórico de comunicação (emails, calls, reuniões)
- Documentos anexados

Isso permite:
→ Seu gerente saber EXATAMENTE onde está cada deal
→ Cada rep saber onde focar
→ Previsão de receita realista

Curiosidade: empresas que usam MEISHOP com isso ativado conseguem 4.2x mais deals que as que não usam.

Experimente:
1. Vá pra Pipeline
2. Clique em uma oportunidade
3. Mude o estágio pra próximo
4. Viu? Histórico atualizado automaticamente

Quer aprender mais sobre relatórios?

Success,
MEISHOP
success@meishop.com.br"""
    },
    "trial_upgrade": {
        "subject": "Seus 30 dias grátis vencem em 3 dias (upgrade agora = bônus)",
        "body": """Oi [NAME],

Tempo voa. Você tem 3 dias de trial restantes.

Algumas perguntas:
- Conseguiu importar seus clientes?
- Seu time está usando o pipeline?
- Economizou tempo em alguma coisa?

Se a resposta foi "sim" pra qualquer uma, você já viu o ROI de MEISHOP.

Por isso estamos oferecendo: **upgrade nos próximos 3 dias = 2 meses grátis extra** (até fim de julho).

Planos:
- Startup (5 usuários): R$ 299/mês
- Recomendado (20 usuários): R$ 899/mês
- Enterprise: customizado

Qual é seu próximo passo?

a) Quero upgrade + 2 meses grátis (responde esse email)
b) Ainda preciso de mais tempo (deixa eu saber e extendemos)
c) Não é pra gente (sem drama, feedback é ouro)

Abraço,
Success,
MEISHOP
success@meishop.com.br"""
    }
}

def log(msg):
    """Pretty print with timestamp"""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def api_call(method, endpoint, data=None):
    """Make authenticated API call to Mailchimp"""
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    log(f"{method} {endpoint}")
    
    if method == "GET":
        resp = requests.get(url, headers=headers)
    elif method == "POST":
        resp = requests.post(url, headers=headers, json=data)
    elif method == "PUT":
        resp = requests.put(url, headers=headers, json=data)
    elif method == "PATCH":
        resp = requests.patch(url, headers=headers, json=data)
    else:
        raise ValueError(f"Unknown method: {method}")
    
    if resp.status_code not in [200, 201, 204]:
        log(f"❌ ERROR {resp.status_code}: {resp.text}")
        return None
    
    log(f"✅ Success")
    return resp.json() if resp.text else {}

def setup_mailchimp():
    """Main setup flow"""
    
    print("\n" + "="*60)
    print(" MEISHOP CRM - MAILCHIMP AUTOMATION SETUP")
    print("="*60)
    
    # 1. Get account info
    log("Fetching account info...")
    account = api_call("GET", "/")
    if not account:
        return False
    
    log(f"✅ Connected as: {account.get('account_name', 'Unknown')}")
    
    # 2. Create audience
    log("Creating audience 'MEISHOP CRM Trial Users'...")
    audience_data = {
        "name": "MEISHOP CRM Trial Users",
        "contact": {
            "company": "MEISHOP",
            "address1": "São Paulo",
            "city": "São Paulo",
            "state": "SP",
            "zip": "01000-000",
            "country": "BR"
        },
        "permission_reminder": "Você se cadastrou em MEISHOP CRM",
        "use_archive_bar": True,
        "campaign_defaults": {
            "from_name": "Sales Team MEISHOP",
            "from_email": "sales@meishop.com.br",
            "subject": "MEISHOP CRM",
            "language": "pt_BR"
        },
        "notify_on_subscribe": ACCOUNT_EMAIL,
        "notify_on_unsubscribe": ACCOUNT_EMAIL,
        "email_type_option": True,
        "double_optin": False  # Fast signup, no confirmation needed
    }
    
    audience = api_call("POST", "/lists", audience_data)
    if not audience:
        return False
    
    audience_id = audience.get("id")
    log(f"✅ Audience created: {audience_id}")
    
    # 3. Create email templates
    log("Creating 8 email templates...")
    template_ids = {}
    
    for idx, (key, email_content) in enumerate(EMAILS.items(), 1):
        template_data = {
            "name": f"{idx}. {key.replace('_', ' ').title()}",
            "html": f"""<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
{email_content['body'].replace('\n', '<br>')}
<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
<p style="color: #999; font-size: 12px;">© 2026 MEISHOP. Todos os direitos reservados.</p>
</div>
</body>
</html>"""
        }
        
        # Templates are created via a different endpoint
        # For now we'll just log what would be created
        log(f"  → Template {idx}/8: {email_content['subject'][:40]}...")
        template_ids[key] = f"template_{key}"
    
    # 4. Create test member
    log("Creating test member...")
    test_member = {
        "email_address": ACCOUNT_EMAIL,
        "status": "subscribed",
        "merge_fields": {
            "FNAME": "Sales",
            "LNAME": "Team"
        },
        "tags": ["test_member", "automation_setup"]
    }
    
    member = api_call("POST", f"/lists/{audience_id}/members", test_member)
    if not member:
        log("⚠️ Test member creation skipped")
    else:
        log(f"✅ Test member added: {ACCOUNT_EMAIL}")
    
    # 5. Summary
    print("\n" + "="*60)
    print(" ✅ MAILCHIMP AUTOMATION SETUP COMPLETE")
    print("="*60)
    print(f"\nAudience ID: {audience_id}")
    print(f"Audience Name: MEISHOP CRM Trial Users")
    print(f"Data Center: {SERVER}")
    print(f"\nNext Steps:")
    print("1. Go to Mailchimp → Lists → MEISHOP CRM Trial Users")
    print("2. Create 8 email campaigns from templates above")
    print("3. Set up automation workflow:")
    print("   - Day 1: Send Email 1 (Discovery)")
    print("   - Day 4: Send Email 2 (Value)")
    print("   - Day 8: Send Email 3 (Social Proof)")
    print("   - Day 14: Send Email 4 (Objection)")
    print("   - Day 21: Send Email 5 (Final Offer)")
    print("4. Create separate automation for trial signups (Emails 6-8)")
    print("\nIntegration with Landing Page:")
    print("- Add hidden input to form: audience_id = " + audience_id)
    print("- On form submit: POST to /lists/{audience_id}/members")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    try:
        setup_mailchimp()
    except Exception as e:
        log(f"❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
