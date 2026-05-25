"""Gerador de Relatório HTML para Mr.Holmes"""

import os
from datetime import datetime
from html import escape
from typing import Optional

def _render_intel_base_html(intel_base: Optional[dict]) -> str:
    if not intel_base:
        return ""

    summary_items = "".join(
        f'''
        <div class="info-item">
            <div class="label">{escape(str(key).replace("_", " ").title())}</div>
            <div class="value">{escape("Sim" if value is True else "Não" if value is False else str(value))}</div>
        </div>
        '''
        for key, value in intel_base.get("summary", {}).items()
    ) or '<p style="color:#64748b;">Nenhum resumo estruturado disponível.</p>'

    risk = intel_base.get("risk", {})
    risk_reasons = "".join(
        f'<li style="margin:4px 0;">{escape(str(item))}</li>'
        for item in risk.get("reasons", [])
    ) or '<li style="color:#64748b;">Nenhum motivo adicional registrado.</li>'

    artifacts_html = "".join(
        f'''
        <tr>
            <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{escape(str(item.get("category", "N/A")))}</td>
            <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{escape(str(item.get("label", "N/A")))}</td>
            <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{escape(str(item.get("value", "N/A")))}</td>
        </tr>
        '''
        for item in intel_base.get("artifacts", [])[:12]
    ) or '<tr><td colspan="3" style="padding:8px;color:#64748b;">Nenhum artefato estruturado.</td></tr>'

    sources_html = "".join(
        f'''
        <tr>
            <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{escape(str(item.get("name", "N/A")))}</td>
            <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{escape(str(item.get("category", "N/A")))}</td>
            <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{"<a href=\"" + escape(str(item.get("url", ""))) + "\" target=\"_blank\">abrir</a>" if item.get("url") else "—"}</td>
        </tr>
        '''
        for item in intel_base.get("sources", [])[:10]
    ) or '<tr><td colspan="3" style="padding:8px;color:#64748b;">Nenhuma fonte estruturada.</td></tr>'

    links_html = "".join(
        f'''
        <li style="margin:4px 0;word-break:break-all;">
            <a href="{escape(str(item.get("url", "#")))}" target="_blank" style="color:#2563eb;">
                {escape(str(item.get("label", item.get("url", "link"))))}
            </a>
        </li>
        '''
        for item in intel_base.get("links", [])[:12]
    ) or '<li style="color:#64748b;">Nenhum link adicional disponível.</li>'

    notes_html = "".join(
        f'<li style="margin:4px 0;">{escape(str(item))}</li>'
        for item in intel_base.get("notes", [])
    ) or '<li style="color:#64748b;">Nenhuma observação adicional.</li>'

    metadata = intel_base.get("metadata", {})
    metadata_html = "".join(
        f'''
        <div class="info-item">
            <div class="label">{escape(str(key).replace("_", " ").title())}</div>
            <div class="value">{escape(str(value))}</div>
        </div>
        '''
        for key, value in metadata.items()
    ) or '<p style="color:#64748b;">Nenhum metadado adicional.</p>'

    return f"""
        <div class="card">
            <h2>🧩 Camada OSINT Normalizada</h2>
            <div class="grid">
                <div class="info-item">
                    <div class="label">Tipo</div>
                    <div class="value">{escape(str(intel_base.get("kind", "N/A"))).upper()}</div>
                </div>
                <div class="info-item">
                    <div class="label">Normalizado</div>
                    <div class="value">{escape(str(intel_base.get("normalized", "N/A")))}</div>
                </div>
                <div class="info-item">
                    <div class="label">Score</div>
                    <div class="value">{escape(str(risk.get("score", 0)))}</div>
                </div>
                <div class="info-item">
                    <div class="label">Gerado em</div>
                    <div class="value">{escape(str(intel_base.get("generated_at", "N/A")))}</div>
                </div>
            </div>
            <h3 style="margin-top:16px;font-size:16px;">Resumo</h3>
            <div class="grid">{summary_items}</div>
            <h3 style="margin-top:16px;font-size:16px;">Motivos / Risco</h3>
            <ul style="padding-left:20px;">{risk_reasons}</ul>
            <h3 style="margin-top:16px;font-size:16px;">Artefatos</h3>
            <table>
                <tr>
                    <th style="text-align:left;padding:8px;">Categoria</th>
                    <th style="text-align:left;padding:8px;">Rótulo</th>
                    <th style="text-align:left;padding:8px;">Valor</th>
                </tr>
                {artifacts_html}
            </table>
            <h3 style="margin-top:16px;font-size:16px;">Fontes</h3>
            <table>
                <tr>
                    <th style="text-align:left;padding:8px;">Nome</th>
                    <th style="text-align:left;padding:8px;">Categoria</th>
                    <th style="text-align:left;padding:8px;">Link</th>
                </tr>
                {sources_html}
            </table>
            <h3 style="margin-top:16px;font-size:16px;">Links</h3>
            <ul style="padding-left:20px;">{links_html}</ul>
            <h3 style="margin-top:16px;font-size:16px;">Metadados</h3>
            <div class="grid">{metadata_html}</div>
            <h3 style="margin-top:16px;font-size:16px;">Notas</h3>
            <ul style="padding-left:20px;">{notes_html}</ul>
        </div>
    """


def gerar_relatorio_html(
    numero: str,
    internacional: str,
    local: str,
    pais: str,
    area: str,
    operadora: str,
    ddd_info: dict,
    sites_encontrados: list,
    links_dorks: list,
    pasta_saida: str,
    phone_intel: Optional[dict] = None,
) -> str:
    """Gera um relatório HTML formatado com todos os dados da busca."""

    lat = ddd_info.get("lat", 0)
    lon = ddd_info.get("lon", 0)
    cidade = ddd_info.get("city", "N/A")
    estado = ddd_info.get("state", "N/A")

    sites_html = ""
    for site in sites_encontrados:
        sites_html += f'<tr><td style="padding:8px;border-bottom:1px solid #e0e0e0;">🔗</td><td style="padding:8px;border-bottom:1px solid #e0e0e0;"><a href="{site}" target="_blank" style="color:#059669;">{site}</a></td></tr>'

    dorks_html = ""
    for dork in links_dorks[:10]:
        dorks_html += f'<li style="margin:4px 0;word-break:break-all;"><a href="{dork}" target="_blank" style="color:#2563eb;font-size:12px;">{dork[:100]}...</a></li>'

    mapa_url = f"https://www.google.com/maps/place/{lat},{lon}" if lat != 0 else ""

    intel_html = ""
    intel_base_html = ""
    if phone_intel:
        risk = phone_intel.get("risk", {})
        risk_score = risk.get("score", 0)
        risk_level = str(risk.get("level", "N/A")).upper()
        risk_reasons = "".join(
            f'<li style="margin:4px 0;">{item}</li>'
            for item in risk.get("reasons", [])
        ) or '<li style="color:#64748b;">Nenhum motivo adicional calculado.</li>'

        public_sources_html = "".join(
            f'<tr><td style="padding:8px;border-bottom:1px solid #e0e0e0;">🧾</td><td style="padding:8px;border-bottom:1px solid #e0e0e0;"><a href="{item.get("url", "")}" target="_blank" style="color:#059669;">{item.get("source", "fonte")}</a></td></tr>'
            for item in phone_intel.get("public_sources", [])
        ) or '<tr><td colspan="2" style="padding:8px;color:#64748b;">Nenhuma fonte pública validada.</td></tr>'

        formats_html = "".join(
            f'<li style="margin:4px 0;word-break:break-all;">{item}</li>'
            for item in phone_intel.get("formats", [])[:10]
        ) or '<li style="color:#64748b;">Nenhum formato adicional gerado.</li>'

        search_links_html = "".join(
            f'''
            <tr>
                <td style="padding:8px;border-bottom:1px solid #e0e0e0;">{item.get("term", "")}</td>
                <td style="padding:8px;border-bottom:1px solid #e0e0e0;"><a href="{item.get("google", "#")}" target="_blank">Google</a></td>
                <td style="padding:8px;border-bottom:1px solid #e0e0e0;"><a href="{item.get("bing", "#")}" target="_blank">Bing</a></td>
                <td style="padding:8px;border-bottom:1px solid #e0e0e0;"><a href="{item.get("duckduckgo", "#")}" target="_blank">DuckDuckGo</a></td>
            </tr>
            '''
            for item in phone_intel.get("search_links", [])[:8]
        ) or '<tr><td colspan="4" style="padding:8px;color:#64748b;">Nenhum link de busca gerado.</td></tr>'

        intel_html = f"""
        <div class="card">
            <h2>🧠 Inteligência de Telefone</h2>
            <div class="grid">
                <div class="info-item">
                    <div class="label">Score de Risco</div>
                    <div class="value">{risk_score}</div>
                </div>
                <div class="info-item">
                    <div class="label">Nível</div>
                    <div class="value">{risk_level}</div>
                </div>
                <div class="info-item">
                    <div class="label">Fontes Públicas</div>
                    <div class="value">{len(phone_intel.get("public_sources", []))}</div>
                </div>
            </div>
            <h3 style="margin-top:16px;font-size:16px;">Motivos</h3>
            <ul style="padding-left:20px;">{risk_reasons}</ul>
            <h3 style="margin-top:16px;font-size:16px;">Fontes Públicas</h3>
            <table>{public_sources_html}</table>
            <h3 style="margin-top:16px;font-size:16px;">Formatos Correlacionados</h3>
            <ul style="padding-left:20px;">{formats_html}</ul>
            <h3 style="margin-top:16px;font-size:16px;">Busca Multi-Motor</h3>
            <table>
                <tr>
                    <th style="text-align:left;padding:8px;">Termo</th>
                    <th style="text-align:left;padding:8px;">Google</th>
                    <th style="text-align:left;padding:8px;">Bing</th>
                    <th style="text-align:left;padding:8px;">DuckDuckGo</th>
                </tr>
                {search_links_html}
            </table>
        </div>
        """
        intel_base_html = _render_intel_base_html(phone_intel.get("intel_base"))

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mr.Holmes - Relatório: {numero}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: #f0f2f5; color: #1a1a2e; line-height: 1.6; }}
        .container {{ max-width: 900px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center; }}
        .header h1 {{ font-size: 28px; margin-bottom: 5px; }}
        .header p {{ opacity: 0.7; font-size: 14px; }}
        .card {{ background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }}
        .card h2 {{ font-size: 18px; color: #1a1a2e; margin-bottom: 16px; border-bottom: 2px solid #059669; padding-bottom: 8px; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }}
        .info-item {{ background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 3px solid #059669; }}
        .info-item .label {{ font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }}
        .info-item .value {{ font-size: 16px; font-weight: 600; color: #1a1a2e; margin-top: 4px; }}
        .map-container {{ border-radius: 8px; overflow: hidden; margin-top: 12px; }}
        iframe {{ width: 100%; height: 300px; border: none; border-radius: 8px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 12px; }}
        .badge {{ display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }}
        .badge-success {{ background: #d1fae5; color: #065f46; }}
        .badge-info {{ background: #dbeafe; color: #1e40af; }}
        .badge-warning {{ background: #fef3c7; color: #92400e; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Mr.Holmes Report</h1>
            <p>Análise OSINT gerada em {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
        </div>

        <div class="card">
            <h2>📱 Informações do Número</h2>
            <div class="grid">
                <div class="info-item">
                    <div class="label">Número</div>
                    <div class="value">{numero}</div>
                </div>
                <div class="info-item">
                    <div class="label">Formato Internacional</div>
                    <div class="value">{internacional}</div>
                </div>
                <div class="info-item">
                    <div class="label">País</div>
                    <div class="value">{pais}</div>
                </div>
                <div class="info-item">
                    <div class="label">Área / Estado</div>
                    <div class="value">{area} ({estado})</div>
                </div>
                <div class="info-item">
                    <div class="label">Cidade (DDD)</div>
                    <div class="value">{cidade}</div>
                </div>
                <div class="info-item">
                    <div class="label">Operadora</div>
                    <div class="value">{operadora}</div>
                </div>
            </div>
            {f'<div class="map-container"><iframe src="https://maps.google.com/maps?q={lat},{lon}&z=12&output=embed"></iframe></div>' if lat != 0 else ''}
        </div>

        <div class="card">
            <h2>🌐 Sites Encontrados</h2>
            {f'<table>{sites_html}</table>' if sites_encontrados else '<p style="color:#64748b;">Nenhum site encontrado.</p>'}
        </div>

        <div class="card">
            <h2>🔎 Google Dorks</h2>
            <ul style="padding-left:20px;">{dorks_html if dorks_html else '<li style="color:#64748b;">Nenhum dork gerado.</li>'}</ul>
        </div>

        {intel_html}
        {intel_base_html}

        <div class="footer">
            <p>Mr.Holmes OSINT Tool | Relatório gerado automaticamente</p>
            <p>Esta ferramenta é para fins educacionais e de pesquisa.</p>
        </div>
    </div>
</body>
</html>"""

    os.makedirs(pasta_saida, exist_ok=True)
    caminho = os.path.join(pasta_saida, f"{numero}_report.html")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(html)

    return caminho
