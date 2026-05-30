# Deploy na Vercel — MR TRUST OSINT

Site estático em `marketing/osint/site/`. O CRM **não** entra neste deploy.

## Importar o repositório (recomendado)

1. Acesse [vercel.com/new](https://vercel.com/new) e faça login com GitHub.
2. **Import Git Repository** → escolha `Trustcorporation88/mr-trust`.
3. Em **Configure Project**, ajuste:

| Campo | Valor |
|-------|--------|
| **Project Name** | `mr-trust-osint` (ou o nome que preferir) |
| **Framework Preset** | **Other** |
| **Root Directory** | `marketing/osint/site` ← **obrigatório** |
| **Build Command** | *(vazio)* |
| **Output Directory** | `.` *(ponto)* |
| **Install Command** | *(vazio)* |

4. **Environment Variables** — nenhuma obrigatória para o site estático.
5. Clique **Deploy**.

Em ~30s você recebe uma URL como `https://mr-trust-osint.vercel.app`.

## Depois do primeiro deploy

1. Edite `assets/site-config.js` e atualize:
   ```javascript
   siteUrl: "https://SEU-PROJETO.vercel.app",
   ```
2. Faça commit + push (ou redeploy na Vercel).
3. *(Opcional)* **Settings → Domains** → adicione domínio próprio (ex: `osint.seudominio.com`).

## Deploy automático

Cada push na branch `main` que altere arquivos em `marketing/osint/site/` gera um **novo deploy** na Vercel (se o projeto estiver linkado ao Git).

## CLI (alternativa)

```powershell
cd c:\Mr.Holmes\marketing\osint\site
npx vercel login
npx vercel link
npx vercel --prod
```

Na primeira vez, confirme que o diretório atual é a raiz do projeto Vercel.

## GitHub Pages vs Vercel

| | GitHub Pages | Vercel |
|---|--------------|--------|
| URL atual | trustcorporation88.github.io/mr-trust | seu-projeto.vercel.app |
| Config | workflow em `.github/workflows/` | Root Directory no painel |

Você pode usar **só a Vercel** ou **as duas**; se usar só Vercel, pode desativar Pages em Settings → Pages no GitHub.

## Problemas comuns

**Página 404 ou lista de pastas do repo**  
→ Root Directory não está em `marketing/osint/site`.

**CSS/JS não carrega**  
→ Confirme que `assets/` está dentro de `marketing/osint/site/assets/`.

**Formulário não envia**  
→ Configure `formspreeFormId` em `assets/site-config.js`.
