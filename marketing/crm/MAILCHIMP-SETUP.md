# 🚀 Mailchimp Setup - Mr.Holmes CRM

**Tempo total**: 25 minutos
**Complexidade**: Fácil
**Resultado**: Email automation pronta para disparar

---

## PASSO 1: Criar Conta Mailchimp (5 min)

1. Ir para **mailchimp.com**
2. Sign up com email pessoal
3. Confirm email
4. Login

✅ **Pronto!**

---

## PASSO 2: Criar Audience (5 min)

### 2.1 Create Audience
1. Dashboard → **Audience** (esquerda)
2. Click **Create an audience**
3. Nome: `CRM Trial Users`
4. Email campaign from: `seu-email@seu-dominio.com`
5. Default from name: `Mr.Holmes CRM`
6. Default subject line: `Novos updates do Mr.Holmes`
7. Industry: **Software/Web Services**
8. Business type: **SaaS**
9. Clique **Save**

✅ **Audience criada!**

---

## PASSO 3: Setup Automação (15 min)

### 3.1 Criar Automation - Cold Outreach Sequence

1. **Audience** → Seu audience "CRM Trial Users" 
2. **Automations** (top menu)
3. Click **Create Automation**
4. Choose **Automated Customer Journey** → **Welcome Series**

### 3.2 Email 1: Discovery Hook (enviado no dia 0)

**Trigger**: Someone joins list (via signup form)

**Subject**: `30 min de setup no seu CRM — Sem complexidade Salesforce`

**Body**:
```
Oi [FNAME],

Noticei que sua empresa ([COMPANY]) provavelmente sofre com o mesmo problema que 80% das PMEs:

❌ Clientes espalhados em Excel
❌ Tickets perdidos
❌ Sem visibilidade de pipeline
❌ Setup complexo = 2-3 meses

Criei Mr.Holmes especificamente para isso.

Setup em 30 minutos. Sem Salesforce complexity. Sem treinamento.

→ Quer ver como funciona? https://calendly.com/seu-nome/demo

Abraço,
[SEUNAME]
```

**Delay**: Send immediately

---

### 3.3 Email 2: Value Prop Deep Dive (+3 dias)

**Trigger**: Delay 3 days after Email 1

**Subject**: `4.2x mais deals com Customer 360 — case Agência XYZ`

**Body**:
```
Oi [FNAME],

Aqui tá o que uma agência de [CITY] conseguiu em 60 dias com Mr.Holmes:

✅ 89% menos tempo buscando histórico do cliente
✅ 4.2x mais deals fechados (melhor follow-up)
✅ 50 min/dia economizados (dashboard unificado)
✅ R$ 280K extra em pipeline identificado

Como? Customer 360 = toda info do cliente em 1 lugar:
- Tickets abertos
- Deals em andamento
- Histórico completo
- Health score (quando sair?)
- Touchpoints últimos 90 dias

Sem código. Sem setup. Sem headache.

→ Testar grátis (7 dias, sem cartão): https://seu-landing-page.com

Abraço,
[SEUNAME]
```

**Delay**: 3 days from Email 1

---

### 3.4 Email 3: Social Proof + FOMO (+7 dias)

**Trigger**: Delay 7 days from Email 1 (or if no click on Email 2)

**Subject**: `200+ times já usam Mr.Holmes — Por que sua não?`

**Body**:
```
Oi [FNAME],

Não quer ficar pra trás.

Suas concorrentes já estão usando Mr.Holmes e ganhando:
- 200+ clientes (PMEs + Agências + Startups)
- 4.8★ (Google Reviews)
- "Melhor investimento que fiz em CRM" (João, CEO Agência)

Enquanto você tá:
❌ Perdendo deals por falta de follow-up
❌ Treinando 5h por semana em 3 CRMs diferentes
❌ Pagando Salesforce + Zapier + 2 tools mais

Já que tá pensando... por que não testa hoje?

→ 7 dias grátis (4-5 cliques): https://seu-landing-page.com/trial

Abraço,
[SEUNAME]
```

**Delay**: 7 days from Email 1

---

### 3.5 Email 4: Objection Handling (+14 dias)

**Trigger**: Delay 14 days from Email 1 (if no signup yet)

**Subject**: `"Mas temos Salesforce..."  ← NÃO precisa trocar`

**Body**:
```
Oi [FNAME],

Entendo: "Mas temos Salesforce..."

Aqui tá a verdade:

Salesforce é ótimo se:
✅ Você tem 500+ deals/mês
✅ Equipe de 50+ pessoas
✅ Budget R$ 50K/ano

Mas se sua empresa é 10-100 pessoas?

❌ Salesforce = overkill + caro (R$ 60-150/usuário/mês)
❌ Setup = 2-3 meses + consultor (R$ 10-20K)
❌ Learning curve = 1 mês/pessoa

Mr.Holmes solve o 80% do seu problema em 30 min.

Por 1/5 do preço.

Quer comparação lado-a-lado?

→ Clique aqui: https://seu-landing-page.com/vs-salesforce

Abraço,
[SEUNAME]
```

**Delay**: 14 days from Email 1

---

### 3.6 Email 5: Final Offer + Urgency (+21 dias)

**Trigger**: Delay 21 days from Email 1 (final touch)

**Subject**: `Última: -30% na primeira semana (termina amanhã)`

**Body**:
```
Oi [FNAME],

Ofereci -30% pro trial na primeira semana.

Termina AMANHÃ.

Se você:
✅ Quer Customer 360 em 30 min
✅ Quer 50 min/dia economizados
✅ Quer visibilidade de pipeline real-time
✅ Quer sair do Excel

Agora é a hora.

→ Usar promo: PRIMEIRO-30 (30% off 1º mês): https://seu-landing-page.com/trial?promo=PRIMEIRO30

Abraço (final),
[SEUNAME]

P.S. Se algo não ficou claro, responde esse email. Real person aqui.
```

**Delay**: 21 days from Email 1

---

## PASSO 4: Trial Users Follow-up Sequence (novo)

**Trigger**: When someone signs up for trial (tag: "Trial User")

### Follow-up Email 1: Welcome + Onboarding

**Enviado**: Immediately after signup

**Subject**: `✅ Bem-vindo! Seus 7 dias começam AGORA`

**Body**:
```
Oi [FNAME],

Seu trial Mr.Holmes iniciou!

Você tem 7 dias (de graça, sem cartão) para:

HOJE (30 min):
1. Login: https://crm.seu-dominio.com
2. Add 3 clientes de teste
3. Create 1 deal mock

AMANHÃ:
4. Invite 1 membro do time
5. Test follow-up automation

DIA 3:
6. Agendar demo (vou mostrar tricks)

→ Documentação rápida: https://docs-crm.com/quick-start

Abraço,
[SEUNAME]

P.S. Bug? Erro? Responde esse email em <2h.
```

---

### Follow-up Email 2: Feature Highlight (+3 dias, if no action)

**Trigger**: 3 days after signup + NO usage detected

**Subject**: `3 tricks que 90% não conseguem descobrir sozinhos`

**Body**:
```
Oi [FNAME],

Notei que você não usou o CRM ainda.

Entendo: tá cheio de trabalho.

Mas listen: tem 3 tricks que a maioria NUNCA descobre:

**Trick 1: Health Score Automation**
Detalhes: https://seu-demo-video.com/health-score (2 min video)

**Trick 2: Multi-channel Timeline**
Ver histórico de conversas (WhatsApp + Email + Calls) em 1 lugar
Link: https://seu-demo-video.com/timeline

**Trick 3: Pipeline Forecasting**
Prever revenue 30 dias ahead (99% accurate)
Link: https://seu-demo-video.com/forecast

→ Quer help? Book 15 min: https://calendly.com/seu-nome/demo

Abraço,
[SEUNAME]
```

---

### Follow-up Email 3: Upgrade Offer (+5 dias, if trial ending soon)

**Trigger**: 5 days before trial expires

**Subject**: `Trial termina em 2 dias — Ativa premium (50% off hoje)`

**Body**:
```
Oi [FNAME],

Seu trial termina em 2 dias.

Se você gostou, aproveita: **50% off no primeiro mês** (código abaixo).

Preço normal: R$ 299-899/mês (por usuário)
Com desconto: R$ 149-449/mês (primeira 1 mês)

Depois volta ao normal.

→ Ativa agora: https://seu-landing-page.com/upgrade?code=TRIAL50

Abraço,
[SEUNAME]

P.S. Se tá na dúvida, marca uma demo: https://calendly.com/seu-nome/demo
```

---

## PASSO 5: Ativar Automação (2 min)

1. Quando terminar de criar os 5 emails ↑
2. Clique **Activate**
3. Confirme
4. Check: **Automation is ACTIVE** (verde)

✅ **Emails rodando!**

---

## PASSO 6: Monitor Performance

**Diário**:
- [ ] Check Mailchimp dashboard
- [ ] Ver open rates (target: >35%)
- [ ] Ver click rates (target: >8%)
- [ ] Ver reply rates (target: >3%)

**Semanal**:
- [ ] A/B test subject lines
- [ ] Adjust content based on replies
- [ ] Add replies to CRM manually (lead nurturing)

---

## 🎯 Expected Results (30 dias)

```
Email 1 (Discovery)   → 50 emails sent, 20 opens (40%), 2 clicks (4%)
Email 2 (Value Prop)  → 48 opens (96%), 8 clicks (16%)
Email 3 (Social Proof)→ 45 opens (94%), 6 clicks (12%)
Email 4 (Objection)   → 42 opens (93%), 3 clicks (6%)
Email 5 (Final)       → 40 opens (95%), 2 clicks (5%)

Expected: 5-10 trial signups from 50-email sequence = 10-20% conversion
```

---

## ✅ Checklist Conclusão

- [ ] Mailchimp account criada
- [ ] Audience "CRM Trial Users" criada
- [ ] 5 emails cold outreach criados
- [ ] 3 emails trial follow-up criados
- [ ] Automation ativada
- [ ] Test email enviado pra você
- [ ] Calendly link no subject line dos emails

---

**Status**: ✅ PRONTO PARA DISPARAR AMANHÃ

**Next**: Prepare lead list (100 PMEs no LinkedIn) para disparar Email 1 em massa.

