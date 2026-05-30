# Publicar o dashboard (Streamlit Cloud) — 3 minutos

1. Acesse https://share.streamlit.io e entre com GitHub.
2. **New app** → repositório `Trustcorporation88/mr-trust`, branch **master**.
3. **Main file:** `streamlit_app.py` (na raiz do repo).
4. **Deploy**. Aguarde o build (pode levar 5–10 min na primeira vez).
5. Copie a URL gerada (ex: `https://mr-trust-osint.streamlit.app`).
6. Cole em `osint-site/assets/site-config.js`:
   ```javascript
   demoDashboardUrl: "https://SUA-URL.streamlit.app",
   ```
7. Commit + push → redeploy na Vercel.

O botão **Abrir dashboard** no site passará a abrir o app direto.
