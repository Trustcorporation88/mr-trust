# Publicar a landing Mr.Holmes

## Configuração (obrigatório antes de ir ao ar)

Edite **`assets/site-config.js`**:

| Campo | Descrição |
|-------|-----------|
| `contactEmail` | E-mail real (padrão: `sales@mrtrust.com`) |
| `formspreeFormId` | ID do formulário em [formspree.io](https://formspree.io) |
| `hubspotPortalId` / `hubspotFormId` | Opcional — substitui o formulário HTML pelo embed HubSpot |
| `demoDashboardUrl` | URL do Streamlit (local ou [Streamlit Cloud](https://streamlit.io/cloud)) |
| `siteUrl` | URL final do site (SEO / Open Graph) |

### Formspree (recomendado)

1. Crie conta em https://formspree.io  
2. **New form** → copie o ID (ex: `abcdwxyz`)  
3. Em `site-config.js`: `formspreeFormId: "abcdwxyz"`  
4. Confirme o e-mail de destino no painel Formspree  

### Demo Streamlit

Local:

```powershell
cd c:\Mr.Holmes
.\.venv\Scripts\streamlit.exe run web_app.py
```

Abra http://localhost:8501 e use o mesmo valor em `demoDashboardUrl`.

**Streamlit Cloud:** após deploy, cole a URL pública em `demoDashboardUrl`.

---

## GitHub Pages (repositório `Trustcorporation88/mr-trust`)

1. Faça push da branch `main` (ou `master`) com a pasta `landing/` e `.github/workflows/deploy-landing.yml`.  
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.  
3. O workflow **Deploy landing (GitHub Pages)** roda automaticamente em push em `landing/**`.  
4. URL esperada: **https://trustcorporation88.github.io/mr-trust/**  

> Se a URL ficar em subpath, ajuste links relativos ou `siteUrl` em `site-config.js`.

---

## Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add site** → importe o repo.  
2. **Base directory:** `landing`  
3. **Publish directory:** `.` (ponto)  
4. Deploy.

Ou arraste a pasta `landing/` em **Deploy manually**.

---

## Vercel

1. [vercel.com](https://vercel.com) → **Import Project**.  
2. **Root Directory:** `landing`  
3. Framework: **Other** (site estático).  
4. Deploy.

O arquivo `vercel.json` já está na pasta `landing/`.

---

## Arquivos do site

| URL | Arquivo |
|-----|---------|
| `/` ou `index.html` | CRM + OSINT |
| `/osint.html` | MR TRUST OSINT |
| `/sales-onepager.html` | One-pager para PDF |

---

## Testar localmente

```powershell
cd c:\Mr.Holmes\landing
python -m http.server 8080
```

Abra http://localhost:8080
