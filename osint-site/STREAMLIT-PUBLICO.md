# Dashboard não abre no navegador?

## 1. App público no Streamlit Cloud

No [share.streamlit.io](https://share.streamlit.io) → seu app → **Settings** (⚙️):

- **Sharing** → deixe o app **Public** (não “Only me” / workspace privado).
- Se pedir login ao abrir o link, é porque ainda está privado.

## 2. App dormindo (free tier)

Primeira visita pode demorar **30–60 s** (cold start). Atualize a página uma vez.

## 3. Erro no build do Streamlit

**Manage app** → **Logs**. Erros comuns:

- Falta dependência → veja `OSINT/requirements.txt` e `requirements.txt` na raiz.
- `pdfkit` / `wkhtmltopdf` → PDF pode falhar; o resto do app deve abrir.

## URL do app

https://trustcorporation88-mr-trust-streamlit-app-ppasek.streamlit.app
