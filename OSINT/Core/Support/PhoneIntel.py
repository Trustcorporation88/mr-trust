"""
Phone Intelligence - Inspiração funcional em Telespot, findigo e Checker-Scammer
Implementação nativa para Mr.Holmes sem depender diretamente dos repositórios externos.
"""

import json
import re
import urllib.parse
import urllib.request
from collections import Counter

from Core.Support import History
from Core.Support.IntelBase import (
    adicionar_artefato,
    adicionar_fonte,
    adicionar_link,
    adicionar_nota,
    atualizar_metadados,
    criar_base_osint,
    definir_resumo,
    definir_risco,
)


def _digits_only(phone: str) -> str:
    return re.sub(r"\D", "", phone or "")


def gerar_formatos_telefone(phone: str) -> list:
    """Gera formatos comuns de número para correlação em buscadores."""
    digits = _digits_only(phone)
    if not digits:
        return []

    formats = {digits, f"+{digits}", f'"{digits}"', f'"{digits[:2]} {digits[2:]}"'}

    if len(digits) >= 12:
        cc = digits[:2]
        local = digits[2:]
        formats.update({
            f"+{cc} {local}",
            f"+{cc} ({local[:2]}) {local[2:7]}-{local[7:]}",
            f"({local[:2]}) {local[2:7]}-{local[7:]}",
            f"{local[:2]} {local[2:7]}-{local[7:]}",
            f"{local[:2]} {local[2:6]}-{local[6:]}",
            f'"{local}"',
        })
    elif len(digits) >= 10:
        formats.update({
            f"({digits[:2]}) {digits[2:7]}-{digits[7:]}",
            f"{digits[:2]} {digits[2:7]}-{digits[7:]}",
            f"{digits[:2]}-{digits[2:6]}-{digits[6:]}",
        })

    return [f for f in formats if f and len(f) >= 8]


def _build_search_links(phone: str) -> list:
    digits = _digits_only(phone)
    formatos = gerar_formatos_telefone(digits)[:8]
    links = []

    for termo in formatos:
        encoded = urllib.parse.quote(termo)
        links.append({
            "term": termo,
            "google": f"https://www.google.com/search?q={encoded}",
            "bing": f"https://www.bing.com/search?q={encoded}",
            "duckduckgo": f"https://duckduckgo.com/?q={encoded}",
        })

    return links


def _check_public_pages(phone: str) -> list:
    digits = _digits_only(phone)
    fontes = [
        ("free-lookup.net", f"https://free-lookup.net/{digits}"),
        ("whosenumber.info", f"https://whosenumber.info/{digits}"),
        ("spamcalls.net", f"https://spamcalls.net/en/number/{digits}"),
    ]

    encontrados = []
    for nome, url in fontes:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            resp = urllib.request.urlopen(req, timeout=8)
            if getattr(resp, "status", 0) == 200:
                encontrados.append({"source": nome, "url": url, "status": 200})
        except Exception:
            continue

    return encontrados


def _extract_indicators(text: str) -> dict:
    """Extrai indícios simples em texto livre, no estilo de correlação."""
    lower = text.lower()

    riscos = [
        "scam", "fraud", "spam", "golpe", "suspeito", "complaint",
        "abuse", "telemarketing", "robocall", "unsafe", "denúncia",
    ]
    positivos = [
        "business", "company", "support", "official", "verified",
        "oficial", "empresa", "atendimento",
    ]

    risk_hits = [k for k in riscos if k in lower]
    positive_hits = [k for k in positivos if k in lower]

    usernames = re.findall(r"@([a-zA-Z0-9_.-]{3,30})", text)
    locations = re.findall(
        r"\b(?:são paulo|rio de janeiro|minas gerais|bahia|paraná|ceará|pernambuco|brasil|brazil)\b",
        lower,
    )
    names = re.findall(r"\b[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]{2,}(?:\s+[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]{2,}){0,2}", text)

    return {
        "risk_hits": sorted(set(risk_hits)),
        "positive_hits": sorted(set(positive_hits)),
        "usernames": Counter(usernames).most_common(10),
        "locations": Counter(locations).most_common(10),
        "names": Counter(names).most_common(10),
    }


def _score_risk(found_sources: list, indicators: dict) -> dict:
    """Modelo simples inspirado em checker/scam markers."""
    score = 0
    reasons = []

    if found_sources:
        score += min(len(found_sources) * 10, 30)
        reasons.append(f"{len(found_sources)} fonte(s) públicas responderam")

    risk_count = len(indicators.get("risk_hits", []))
    positive_count = len(indicators.get("positive_hits", []))

    if risk_count:
        score += min(risk_count * 15, 45)
        reasons.append(f"{risk_count} marcador(es) de risco textual")

    if positive_count:
        score -= min(positive_count * 8, 16)
        reasons.append(f"{positive_count} marcador(es) positivos/contextuais")

    score = max(0, min(score, 100))

    if score >= 70:
        level = "alto"
    elif score >= 35:
        level = "médio"
    else:
        level = "baixo"

    return {
        "score": score,
        "level": level,
        "reasons": reasons,
    }


def buscar_telefone_inteligente(phone: str) -> dict:
    """
    Agrega capacidades inspiradas em:
    - Telespot: múltiplos formatos + links de buscadores
    - findigo: coleta básica orientada a telefone
    - Checker-Scammer: score simples por marcadores
    """
    digits = _digits_only(phone)

    resultado = {
        "query": phone,
        "digits": digits,
        "formats": gerar_formatos_telefone(phone),
        "search_links": [],
        "public_sources": [],
        "indicators": {},
        "risk": {},
        "notes": [],
    }
    intel_base = criar_base_osint("phone", phone, digits)
    resultado["intel_base"] = intel_base

    if len(digits) < 8:
        nota = "Número inválido ou muito curto para análise."
        resultado["notes"].append(nota)
        adicionar_nota(intel_base, nota)
        definir_resumo(intel_base, formats=0, public_sources=0, search_links=0)
        atualizar_metadados(intel_base, digits=digits)
        return resultado

    resultado["search_links"] = _build_search_links(digits)
    resultado["public_sources"] = _check_public_pages(digits)

    corpus = " ".join(
        [digits]
        + [item["source"] for item in resultado["public_sources"]]
        + [item["term"] for item in resultado["search_links"]]
    )

    resultado["indicators"] = _extract_indicators(corpus)
    resultado["risk"] = _score_risk(resultado["public_sources"], resultado["indicators"])

    resultado["notes"].append("Score heurístico local baseado em marcadores públicos.")
    resultado["notes"].append("Links de busca foram preparados para investigação manual complementar.")

    definir_resumo(
        intel_base,
        formats=len(resultado["formats"]),
        public_sources=len(resultado["public_sources"]),
        search_links=len(resultado["search_links"]),
        risk_hits=len(resultado["indicators"].get("risk_hits", [])),
        positive_hits=len(resultado["indicators"].get("positive_hits", [])),
    )
    definir_risco(
        intel_base,
        score=resultado["risk"].get("score", 0),
        level=resultado["risk"].get("level", "unknown"),
        reasons=resultado["risk"].get("reasons", []),
    )
    atualizar_metadados(
        intel_base,
        digits=digits,
        usernames=resultado["indicators"].get("usernames", []),
        locations=resultado["indicators"].get("locations", []),
        names=resultado["indicators"].get("names", []),
    )

    for item in resultado["formats"]:
        adicionar_artefato(intel_base, "format", "phone_format", item)

    for item in resultado["public_sources"]:
        adicionar_fonte(
            intel_base,
            item.get("source", "unknown"),
            url=item.get("url", ""),
            status=item.get("status"),
            category="public_directory",
        )

    for item in resultado["search_links"]:
        termo = item.get("term", "")
        adicionar_artefato(intel_base, "search_term", termo or "term", termo)
        adicionar_link(intel_base, f"{termo} / Google", item.get("google", ""), category="search", source="google")
        adicionar_link(intel_base, f"{termo} / Bing", item.get("bing", ""), category="search", source="bing")
        adicionar_link(intel_base, f"{termo} / DuckDuckGo", item.get("duckduckgo", ""), category="search", source="duckduckgo")

    for nota in resultado["notes"]:
        adicionar_nota(intel_base, nota)

    return resultado


def salvar_relatorio_phone_intel(resultado: dict) -> str:
    digits = resultado.get("digits", "unknown")
    pasta = f"GUI/Reports/Phone/{digits}"
    import os
    os.makedirs(pasta, exist_ok=True)

    caminho = os.path.join(pasta, f"{digits}_intel_report.txt")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("Mr.Holmes Phone Intelligence Report\n")
        f.write(f"Query: {resultado.get('query', '')}\n")
        f.write(f"Digits: {digits}\n\n")

        f.write("Formats:\n")
        for item in resultado.get("formats", []):
            f.write(f"  - {item}\n")

        f.write("\nPublic Sources:\n")
        for item in resultado.get("public_sources", []):
            f.write(f"  - {item.get('source')}: {item.get('url')}\n")

        f.write("\nIndicators:\n")
        indicators = resultado.get("indicators", {})
        f.write(f"  Risk hits: {', '.join(indicators.get('risk_hits', []))}\n")
        f.write(f"  Positive hits: {', '.join(indicators.get('positive_hits', []))}\n")
        f.write(f"  Usernames: {json.dumps(indicators.get('usernames', []), ensure_ascii=False)}\n")
        f.write(f"  Locations: {json.dumps(indicators.get('locations', []), ensure_ascii=False)}\n")
        f.write(f"  Names: {json.dumps(indicators.get('names', []), ensure_ascii=False)}\n")

        risk = resultado.get("risk", {})
        f.write("\nRisk:\n")
        f.write(f"  Score: {risk.get('score', 0)}\n")
        f.write(f"  Level: {risk.get('level', 'N/A')}\n")
        for reason in risk.get("reasons", []):
            f.write(f"  - {reason}\n")

        f.write("\nSearch Links:\n")
        for item in resultado.get("search_links", []):
            f.write(f"  Term: {item.get('term')}\n")
            f.write(f"    Google: {item.get('google')}\n")
            f.write(f"    Bing: {item.get('bing')}\n")
            f.write(f"    DuckDuckGo: {item.get('duckduckgo')}\n")

        f.write("\nNotes:\n")
        for note in resultado.get("notes", []):
            f.write(f"  - {note}\n")

    History.save_search(
        "phone",
        digits,
        country="",
        area="",
        carrier="",
        sites_found=len(resultado.get("public_sources", [])),
        report_path=caminho,
    )

    return caminho