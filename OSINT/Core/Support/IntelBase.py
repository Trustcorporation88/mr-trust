"""Helpers compartilhados para resultados OSINT normalizados."""

from datetime import datetime
from typing import Any, Optional


def criar_base_osint(kind: str, query: str, normalized: str = "") -> dict:
    """Cria um envelope comum para resultados OSINT."""
    return {
        "kind": kind,
        "query": query,
        "normalized": normalized or query,
        "generated_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "summary": {},
        "risk": {
            "score": 0,
            "level": "unknown",
            "reasons": [],
        },
        "artifacts": [],
        "links": [],
        "sources": [],
        "notes": [],
        "metadata": {},
    }


def definir_resumo(base: dict, **summary: Any) -> dict:
    """Atualiza os contadores e campos resumidos do resultado."""
    base["summary"] = {
        key: value
        for key, value in summary.items()
        if value is not None
    }
    return base


def definir_risco(
    base: dict,
    score: int = 0,
    level: str = "unknown",
    reasons: Optional[list] = None,
) -> dict:
    """Define o bloco de risco/exposição compartilhado."""
    base["risk"] = {
        "score": max(0, min(int(score or 0), 100)),
        "level": level or "unknown",
        "reasons": list(reasons or []),
    }
    return base


def adicionar_artefato(
    base: dict,
    category: str,
    label: str,
    value: Any,
    **extra: Any,
) -> dict:
    """Registra um artefato estruturado do processo OSINT."""
    artifact: dict[str, Any] = {
        "category": category,
        "label": label,
        "value": value,
    }
    artifact.update({key: val for key, val in extra.items() if val is not None})
    base["artifacts"].append(artifact)
    return artifact


def adicionar_link(
    base: dict,
    label: str,
    url: str,
    category: str = "reference",
    source: str = "",
) -> Optional[dict]:
    """Registra um link útil para investigação manual."""
    if not url:
        return None

    link: dict[str, Any] = {
        "label": label,
        "url": url,
        "category": category,
    }
    if source:
        link["source"] = source
    base["links"].append(link)
    return link


def adicionar_fonte(
    base: dict,
    name: str,
    url: str = "",
    status: Optional[int] = None,
    category: str = "public",
) -> dict:
    """Registra uma fonte consultada ou validada."""
    source: dict[str, Any] = {
        "name": name,
        "category": category,
    }
    if url:
        source["url"] = url
    if status is not None:
        source["status"] = status
    base["sources"].append(source)
    return source


def adicionar_nota(base: dict, note: str) -> None:
    """Adiciona uma nota deduplicada ao resultado."""
    if note and note not in base["notes"]:
        base["notes"].append(note)


def atualizar_metadados(base: dict, **metadata: Any) -> dict:
    """Mescla metadados auxiliares sem sobrescrever com valores vazios."""
    base["metadata"].update({
        key: value
        for key, value in metadata.items()
        if value not in (None, "")
    })
    return base