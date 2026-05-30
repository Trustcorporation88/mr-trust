# MR TRUST OSINT — site estático (separado do CRM)

Este diretório é o **único** publicado no GitHub Pages do repositório `mr-trust`.

- **CRM Mr.Holmes:** operacional em outro ambiente — não entra neste deploy.
- **OSINT:** `marketing/osint/site/` → https://trustcorporation88.github.io/mr-trust/

## Configurar

Edite `assets/site-config.js`:

| Campo | Uso |
|-------|-----|
| `contactEmail` | Contato comercial |
| `formspreeFormId` | Formulário sem mailto |
| `demoDashboardUrl` | Streamlit OSINT (local: porta **8511**) |
| `githubUrl` | Link do repositório |
| `siteUrl` | URL pública deste site |

### Rodar o dashboard local

```powershell
cd c:\Mr.Holmes\OSINT
..\ .venv\Scripts\streamlit.exe run web_app.py --server.port 8511
```

## Publicar

### Vercel (recomendado para produção)

Guia passo a passo: **[VERCEL.md](./VERCEL.md)**

Resumo na importação do repo:

- **Root Directory:** `marketing/osint/site`
- **Framework:** Other
- **Build / Install:** vazio
- **Output:** `.`

### GitHub Pages (alternativa)

Push em `main` em `marketing/osint/site/**` dispara **Deploy OSINT site (GitHub Pages)** → https://trustcorporation88.github.io/mr-trust/

## Testar local

```powershell
cd c:\Mr.Holmes\marketing\osint\site
python -m http.server 8080
```

Abra http://localhost:8080
