# 🎯 Google Ads Setup - Mr.Holmes CRM

**Tempo total**: 30 minutos  
**Budget**: R$ 500 (teste inicial)  
**Expected Result**: 30-50 trial signups, ~R$ 10-15 CAC

---

## PASSO 1: Criar Conta Google Ads (5 min)

1. Ir para **google.com/ads**
2. Sign in com sua Google account
3. Click **Start now**
4. Business name: `Mr.Holmes CRM`
5. Website: `seu-crm-landing-page.com`
6. Choose: **Get more calls or contacts**
7. Continue

---

## PASSO 2: Conectar Landing Page + Tracking (5 min)

### 2.1 Setup Conversion Tracking

1. **Tools & Settings** (canto superior direito)
2. **Conversions** → **+ Conversion**
3. Tipo: **Website**
4. Conversion name: `Trial Signup`
5. Value: **R$ 0** (não é venda, é lead)
6. Copy tracking code
7. Adicione em landing page (antes de `</body>`):

```html
<!-- Google Ads Conversion Tracking -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXX');
</script>

<script>
  function trackConversion(jsfcw_guid) {
    gtag('event', 'conversion', {
      'send_to': 'AW-XXXXXXXXX/CXXX...XXX'
    });
  }
</script>
```

---

## PASSO 3: Create Campaign (15 min)

### 3.1 New Campaign

1. **Campaigns** → **+ New campaign**
2. Goal: **Get leads for your business** (or **Visits to your website**)
3. Campaign type: **Search**
4. Campaign name: `CRM-Trial-Leads-May2026`

### 3.2 Campaign Settings

1. **Locations**: Brazil (primary), Latin America (secondary)
2. **Languages**: Portuguese
3. **Budget**: R$ 500/month (or R$ 15/day to start)
4. **Bidding**: **Maximize conversions** (se tiver conversions já, else → Maximize clicks)
5. **Start date**: Tomorrow (May 26)
6. **Ad schedule**: 09:00-18:00 (business hours)

---

## PASSO 4: Ad Groups + Keywords (10 min)

### 4.1 Create Ad Group

**Name**: `CRM-PME-BR`

### 4.2 Keywords (add todas abaixo)

```
[Broad Match]
crm para pme
crm simples
crm sem salesforce
crm barato
crm brasileiro
crm startup
crm agencia
ferramenta crm
software crm gratuito

[Phrase Match]
"crm para pequena empresa"
"melhor crm pme"
"crm simples e barato"
"alternativa salesforce"
"crm com whatsapp"

[Exact Match]
[mr holmes crm]
[crm trial gratis]
```

**Bid**: R$ 5-15/click (vai auto-optimizar)

---

## PASSO 5: Write Ads (5 min)

### Ad 1: Discovery Angle

**Headline 1**: Customer 360 em 30 min
**Headline 2**: Sem Salesforce complexity
**Headline 3**: Grátis, sem cartão

**Description 1**: 89% menos tempo, 4.2x mais deals. PMEs como você já estão aqui.
**Description 2**: Setup rápido. Dashboard unificado. WhatsApp integrado.

**Final URL**: https://seu-landing-page.com
**Display URL**: seu-dominio.com/crm

---

### Ad 2: Value Angle

**Headline 1**: Teste Mr.Holmes (7 dias grátis)
**Headline 2**: 200+ PMEs já usam
**Headline 3**: -30% primeira semana

**Description 1**: Completo: Tickets + Deals + Comunicação unificada.
**Description 2**: De Excel para visibilidade em 30 minutos. Sem treinamento.

**Final URL**: https://seu-landing-page.com/trial
**Display URL**: seu-dominio.com

---

### Ad 3: Urgency Angle

**Headline 1**: -30% na primeira semana
**Headline 2**: Demo em 15 minutos
**Headline 3**: Zero commitment

**Description 1**: Veja por que Agência XYZ aumentou deals 4.2x em 60 dias.
**Description 2**: Clique, 7 dias grátis, e saia quando quiser. Sem amarração.

**Final URL**: https://seu-landing-page.com/demo
**Display URL**: seu-dominio.com/demo

---

## PASSO 6: Bid Strategy

**Recomendação**: 
- Se tiver <100 conversions/mês → Use **Maximize clicks** (mais escalável)
- Depois → Mude para **Maximize conversions** (melhor ROI)

**Max CPC Bid**: R$ 5-10/click (ajusta automático)

---

## PASSO 7: Review + Publish (2 min)

1. Review ads
2. Check landing page links (clicáveis?)
3. Check conversion tracking (GA + Ads linked?)
4. Publish campaign

✅ **Ads LIVE!**

---

## 📊 Daily Monitoring

### Daily Checklist
- [ ] Check spend (R$ 15-20/dia esperado)
- [ ] Check clicks (6-10 esperado)
- [ ] Check CTR (1-2% normal)
- [ ] Check conversions (0-2 por dia a começar)

### Weekly Review
- [ ] Check CPC (custo por clique)
- [ ] Check conversion rate (target: 5-10%)
- [ ] Pause low-performing ads
- [ ] Increase bids on high-performers

### If Performance Bad:
- [ ] Lower CPC bid → more volume (to learn)
- [ ] Improve landing page (landing page opt = 30% more conversions)
- [ ] Change headlines (urgency + specificity)
- [ ] Expand keywords

---

## 🎯 Expected Results (Week 1)

```
Budget: R$ 100 (test)
Clicks: 15-20
CTR: 1-2%
Conversions: 1-2 trial signups
CPC: R$ 5-7
CAC: R$ 50-100 (very good!)
```

---

## ⚠️ Common Mistakes (Evitar)

❌ Generic keywords ("crm" only) → Too broad, low quality
❌ High bids (>R$ 20) → Too expensive, low ROI
❌ No landing page optimization → Low conversion rate
❌ No conversion tracking → Can't see what's working
❌ Set it and forget it → Need daily optimization

---

## ✅ Checklist Conclusão

- [ ] Google Ads account criada
- [ ] Campaign criada (Search)
- [ ] 10+ keywords adicionadas
- [ ] 3 ads criados + aprovados
- [ ] Conversion tracking live
- [ ] Budget setado (R$ 500 total, ~R$ 15/dia)
- [ ] Campaign published
- [ ] Alerts configurados

---

**Status**: ✅ PRONTO PARA DISPARAR AMANHÃ

**Próximo**: Monitor daily, adjust bids/keywords based on performance.

**Budget**: R$ 500 test → Esperado: 30-50 trial signups @ R$ 10-15 CAC

