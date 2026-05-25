"""MR TRUST Web - Dashboard OSINT."""

import json
import os
import sys
import time
from io import BytesIO

import streamlit as st

sys.path.insert(0, os.path.dirname(__file__))

st.set_page_config(
    page_title="MR TRUST - Dashboard OSINT",
    page_icon="M",
    layout="wide",
    initial_sidebar_state="collapsed",
)


THEME_CSS = """
<style>
    @keyframes card-enter {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.99);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes hero-glow {
        0%,
        100% {
            box-shadow: 0 18px 60px rgba(0,0,0,0.45);
        }
        50% {
            box-shadow: 0 20px 70px rgba(229, 9, 20, 0.22);
        }
    }

    :root {
        --bg: #0b0b0f;
        --panel: #14141d;
        --panel-soft: #1b1b27;
        --panel-2: #232334;
        --text: #f7f7f7;
        --muted: #d0d2df;
        --red: #e50914;
        --red-soft: #ff3b44;
        --gold: #ffcc66;
        --line: rgba(255,255,255,0.08);
        --good: #22c55e;
        --warn: #f59e0b;
        --bad: #ef4444;
    }

    .stApp {
        background:
            radial-gradient(circle at 20% 0%, rgba(229, 9, 20, 0.24), transparent 32%),
            radial-gradient(circle at 80% 10%, rgba(255, 204, 102, 0.10), transparent 24%),
            linear-gradient(180deg, #050507 0%, #0b0b0f 34%, #111119 100%);
        color: var(--text);
        font-family: "Space Grotesk", "Sora", "Segoe UI", sans-serif;
    }

    [data-testid="stHeader"] {
        background: rgba(5, 5, 7, 0.0);
    }

    [data-testid="collapsedControl"] {
        color: white;
    }

    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0b0b0f 0%, #111119 100%);
        border-right: 1px solid var(--line);
    }

    [data-testid="stSidebar"] * {
        color: var(--text);
    }

    .block-container {
        padding-top: 1.2rem;
        padding-bottom: 4rem;
        max-width: 1320px;
    }

    .top-nav {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
        margin: 0 0 14px 0;
    }

    .top-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 999px;
        padding: 7px 12px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.05);
        color: #f3f4f6;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .top-nav-pill strong {
        color: #ffccd1;
    }

    h1, h2, h3, h4 {
        color: var(--text) !important;
        letter-spacing: -0.02em;
    }

    p, span, label, div {
        color: var(--text);
    }

    .hero-shell {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        padding: 44px;
        min-height: 340px;
        margin-bottom: 28px;
        border: 1px solid rgba(255,255,255,0.08);
        background:
            linear-gradient(110deg, rgba(5,5,7,0.94) 0%, rgba(5,5,7,0.84) 36%, rgba(5,5,7,0.35) 100%),
            url("https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80");
        background-size: cover;
        background-position: center;
        box-shadow: 0 18px 60px rgba(0,0,0,0.45);
        animation: card-enter 0.45s ease-out 0.04s both, hero-glow 6s ease-in-out 0.6s infinite;
    }

    .hero-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(229, 9, 20, 0.14);
        border: 1px solid rgba(229, 9, 20, 0.35);
        color: #ffd8da;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin-bottom: 18px;
    }

    .hero-title {
        font-size: clamp(36px, 6vw, 72px);
        font-weight: 900;
        line-height: 0.95;
        max-width: 760px;
        margin: 0 0 14px 0;
        text-transform: uppercase;
    }

    .hero-subtitle {
        max-width: 640px;
        font-size: 17px;
        color: var(--muted);
        margin-bottom: 26px;
        line-height: 1.7;
    }

    .hero-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        max-width: 860px;
    }

    .hero-stat,
    .stream-card,
    .detail-card,
    .metric-tile,
    .tool-tile,
    .list-card {
        background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        backdrop-filter: blur(10px);
    }

    .hero-stat {
        padding: 16px 18px;
    }

    .hero-stat-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--muted);
    }

    .hero-stat-value {
        font-size: 24px;
        font-weight: 800;
        margin-top: 6px;
    }

    .section-title {
        font-size: 24px;
        font-weight: 800;
        margin: 18px 0 14px 0;
    }

    .section-copy {
        color: var(--muted);
        margin-bottom: 12px;
    }

    .stream-card {
        min-height: 360px;
        height: 360px;
        padding: 20px;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: hidden;
        animation: card-enter 0.45s ease-out both;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .stream-card .stream-desc {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
    }

    .stream-card:hover {
        transform: translateY(-6px) scale(1.01);
        border-color: rgba(229, 9, 20, 0.45);
        box-shadow: 0 18px 38px rgba(0,0,0,0.32);
    }

    .stream-card::after {
        content: "";
        position: absolute;
        inset: auto -30% -45% auto;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(229, 9, 20, 0.22), transparent 70%);
        pointer-events: none;
    }

    .stream-eyebrow {
        color: #ffb6ba;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        margin-bottom: 10px;
    }

    .stream-name {
        font-size: 24px;
        font-weight: 800;
        margin-bottom: 6px;
        line-height: 1.18;
        min-height: 58px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .stream-desc {
        color: var(--muted);
        line-height: 1.65;
        min-height: 102px;
        font-size: 14px;
    }

    .stream-meta {
        margin-top: auto;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        min-height: 44px;
        align-items: flex-end;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 6px 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.06);
        color: #fff;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chip-red { background: rgba(229, 9, 20, 0.16); border-color: rgba(229, 9, 20, 0.35); }
    .chip-gold { background: rgba(255, 204, 102, 0.12); border-color: rgba(255, 204, 102, 0.28); color: #ffe2a3; }
    .chip-green { background: rgba(34, 197, 94, 0.14); border-color: rgba(34, 197, 94, 0.3); color: #bff5cf; }

    .detail-card,
    .metric-tile,
    .tool-tile,
    .list-card {
        padding: 18px;
        animation: card-enter 0.45s ease-out both;
    }

    .tool-tile {
        min-height: 190px;
        display: flex;
        flex-direction: column;
    }

    .tool-tile .detail-sub {
        margin-top: 4px;
        flex: 1;
    }

    .tool-tile .tool-link-wrap {
        margin-top: 14px;
    }

    .detail-title,
    .tile-title {
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--muted);
        margin-bottom: 8px;
    }

    .detail-value,
    .tile-value {
        font-size: 28px;
        font-weight: 800;
        color: white;
    }

    .detail-sub {
        color: var(--muted);
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.6;
    }

    .subtle-divider {
        height: 1px;
        background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0));
        margin: 18px 0 20px 0;
    }

    .ops-strip {
        margin: 10px 0 22px 0;
        padding: 14px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.1);
        background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .ops-chip {
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(5,5,7,0.38);
        padding: 12px;
        animation: card-enter 0.4s ease-out both;
    }

    .ops-chip-label {
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.11em;
        margin-bottom: 4px;
    }

    .ops-chip-value {
        color: #ffffff;
        font-size: 18px;
        font-weight: 800;
    }

    .results-panel {
        padding: 18px 0 0 0;
    }

    .empty-state {
        padding: 18px 20px;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
        border: 1px dashed rgba(255,255,255,0.26);
        color: #e7e9f4;
        font-weight: 600;
    }

    .stTextInput input,
    .stSelectbox div[data-baseweb="select"] > div,
    .stTextArea textarea {
        background: rgba(255,255,255,0.05) !important;
        color: white !important;
        border: 1px solid rgba(255,255,255,0.24) !important;
        border-radius: 14px !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    }

    .stTextInput input:focus,
    .stSelectbox div[data-baseweb="select"] > div:focus-within,
    .stTextArea textarea:focus {
        border-color: rgba(255, 59, 68, 0.72) !important;
        box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.22) !important;
    }

    .stButton > button {
        background: linear-gradient(90deg, #e50914 0%, #b20710 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 999px !important;
        font-weight: 800 !important;
        min-height: 46px !important;
        box-shadow: 0 10px 24px rgba(229, 9, 20, 0.24);
        transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease !important;
    }

    .stButton > button:hover {
        background: linear-gradient(90deg, #ff2733 0%, #c60d17 100%) !important;
        transform: translateY(-1px);
        box-shadow: 0 14px 26px rgba(229, 9, 20, 0.32);
    }

    div[data-testid="stMetric"] {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 14px;
    }

    div[data-testid="stMetricLabel"] * {
        color: var(--muted) !important;
    }

    div[data-testid="stMetricValue"] * {
        color: white !important;
    }

    .stAlert {
        border-radius: 16px;
        border-width: 1px !important;
    }

    .stAlert p,
    .stAlert span,
    .stAlert div {
        color: #f8fafc !important;
    }

    .profile-banner {
        position: relative;
        overflow: hidden;
        border-radius: 26px;
        min-height: 300px;
        margin-bottom: 22px;
        border: 1px solid rgba(255,255,255,0.08);
        background-size: cover;
        background-position: center;
        box-shadow: 0 18px 50px rgba(0,0,0,0.34);
    }

    .profile-overlay {
        min-height: 300px;
        padding: 34px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: linear-gradient(90deg, rgba(8,8,12,0.96) 0%, rgba(8,8,12,0.84) 42%, rgba(8,8,12,0.32) 100%);
    }

    .profile-banner-copy {
        max-width: 700px;
    }

    .profile-banner-eyebrow {
        display: inline-flex;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        margin-bottom: 16px;
        background: rgba(255,255,255,0.08);
        color: #ffe5e7;
    }

    .profile-banner-title {
        font-size: clamp(28px, 4vw, 52px);
        font-weight: 900;
        line-height: 0.96;
        margin-bottom: 12px;
        text-transform: uppercase;
    }

    .profile-banner-subtitle {
        color: var(--muted);
        max-width: 680px;
        line-height: 1.7;
        font-size: 15px;
        margin-bottom: 18px;
    }

    .profile-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .profile-tag {
        display: inline-flex;
        align-items: center;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: white;
    }

    .profile-banner-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 22px;
    }

    .profile-banner-stat {
        border-radius: 18px;
        padding: 16px 18px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(8px);
    }

    .profile-banner-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #c7c9d6;
        margin-bottom: 6px;
    }

    .profile-banner-value {
        font-size: 22px;
        font-weight: 800;
        color: white;
    }

    .profile-rail-card {
        position: relative;
        overflow: hidden;
        min-height: 430px;
        height: 430px;
        border-radius: 24px;
        background-size: cover;
        background-position: center;
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 16px 42px rgba(0,0,0,0.26);
        margin-bottom: 12px;
        animation: card-enter 0.45s ease-out both;
    }

    .profile-rail-overlay {
        min-height: 430px;
        height: 430px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        background: linear-gradient(180deg, rgba(8,8,12,0.14) 0%, rgba(8,8,12,0.50) 44%, rgba(8,8,12,0.94) 100%);
    }

    .profile-rail-kicker {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #ffe5e7;
        margin-bottom: 10px;
    }

    .profile-rail-title {
        font-size: 28px;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 10px;
        text-transform: uppercase;
    }

    .profile-rail-subtitle {
        color: var(--muted);
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 14px;
        min-height: 88px;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
    }

    .footer-note {
        text-align: center;
        color: var(--muted);
        font-size: 12px;
        padding: 22px 0 10px 0;
    }

    @media (prefers-reduced-motion: reduce) {
        .hero-shell,
        .stream-card,
        .detail-card,
        .metric-tile,
        .tool-tile,
        .list-card,
        .ops-chip,
        .profile-rail-card {
            animation: none !important;
            transition: none !important;
        }
    }

    @media (max-width: 980px) {
        .hero-shell {
            padding: 26px;
            min-height: 280px;
        }

        .hero-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .hero-title {
            font-size: 40px;
        }

        .profile-banner-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .ops-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 640px) {
        .block-container {
            padding-top: 0.8rem;
            padding-bottom: 2.2rem;
        }

        .hero-shell,
        .profile-overlay,
        .profile-rail-overlay {
            padding: 18px;
        }

        .hero-title {
            font-size: 30px;
            line-height: 1.02;
        }

        .hero-stats,
        .profile-banner-grid,
        .ops-strip {
            grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        .stream-card,
        .profile-rail-card {
            min-height: 210px;
            height: auto;
        }

        .profile-rail-overlay {
            min-height: 210px;
            height: auto;
        }

        .stream-name {
            min-height: auto;
        }

        .stream-desc,
        .profile-rail-subtitle {
            min-height: auto;
        }

        .stream-name,
        .profile-rail-title {
            font-size: 22px;
        }
    }
</style>
"""


CATALOG = [
    {
        "key": "home",
        "label": "Inicio",
        "emoji": "MT",
        "eyebrow": "Painel Principal",
        "title": "Painel Central",
        "description": "Entrada principal da suite. Acompanhe os servicos de coleta, abra modulos e navegue pelo fluxo operacional.",
        "chips": ["Painel", "Fluxo", "OSINT"],
    },
    {
        "key": "phone",
        "label": "Telefone",
        "emoji": "TEL",
        "eyebrow": "Busca Prioritaria",
        "title": "Busca de Telefone",
        "description": "Correlaciona formatos, DDD, geolocalizacao, fontes publicas e links de busca.",
        "chips": ["Inteligencia", "Geolocalizacao", "Risco"],
    },
    {
        "key": "email",
        "label": "Email",
        "emoji": "EML",
        "eyebrow": "Identidade Digital",
        "title": "Busca de Email",
        "description": "Validacao, MX, Gravatar, dominio e vazamentos publicos em uma unica visao.",
        "chips": ["MX", "Vazamentos", "Validacao"],
    },
    {
        "key": "domain",
        "label": "Dominio",
        "emoji": "DOM",
        "eyebrow": "Infraestrutura",
        "title": "Busca de Domínio",
        "description": "DNS, GeoIP, SSL, uptime, portas, subdominios e ViewDNS em um fluxo unico.",
        "chips": ["DNS", "SSL", "ViewDNS"],
    },
    {
        "key": "network",
        "label": "Rede",
        "emoji": "RED",
        "eyebrow": "Colecao Utilitaria",
        "title": "Ferramentas de Rede",
        "description": "Ping, uptime, IP reverso, scan de portas e lookup de hosting com execucao rapida.",
        "chips": ["Ping", "Portas", "Hosting"],
    },
    {
        "key": "graph",
        "label": "Grafo",
        "emoji": "GRA",
        "eyebrow": "Mapa Investigativo",
        "title": "Mapa de Relacionamentos",
        "description": "Monte um grafo de entidades no estilo Maltego para conexoes investigativas.",
        "chips": ["Nos", "Arestas", "Maltego"],
    },
    {
        "key": "tools",
        "label": "Ferramentas",
        "emoji": "FER",
        "eyebrow": "Aplicacoes Externas",
        "title": "Hub de Ferramentas",
        "description": "Abra servicos externos e componha seu fluxo de investigacao.",
        "chips": ["UrlScan", "ViewDNS", "PimEyes"],
    },
    {
        "key": "history",
        "label": "Historico",
        "emoji": "HIS",
        "eyebrow": "Retomar Operacao",
        "title": "Histórico de Buscas",
        "description": "Retome investigacoes recentes e acompanhe o volume operacional.",
        "chips": ["Logs", "Recentes", "Metricas"],
    },
    {
        "key": "about",
        "label": "Sobre",
        "emoji": "SOB",
        "eyebrow": "Documentacao",
        "title": "Sobre o Projeto",
        "description": "Resumo tecnico da stack, fontes e finalidade educacional.",
        "chips": ["Docs", "Stack", "Aviso"],
    },
]


TOOLS = [
    {
        "name": "Metricool",
        "desc": "Analytics de redes sociais e acompanhamento de campanhas.",
        "url": "https://metricool.com",
        "accent": "#4f8cff",
    },
    {
        "name": "PimEyes",
        "desc": "Busca reversa de rosto para correlação visual.",
        "url": "https://pimeyes.com",
        "accent": "#ff5d73",
    },
    {
        "name": "UrlScan.io",
        "desc": "Sandbox e análise de URLs suspeitas.",
        "url": "https://urlscan.io",
        "accent": "#4ade80",
    },
    {
        "name": "Grep.App",
        "desc": "Busca de código em massa para pesquisa técnica.",
        "url": "https://grep.app",
        "accent": "#c084fc",
    },
    {
        "name": "ViewDNS.info",
        "desc": "Conjunto amplo para WHOIS, DNS, IP history e mais.",
        "url": "https://viewdns.info",
        "accent": "#f59e0b",
    },
    {
        "name": "HostingChecker",
        "desc": "Descoberta de provedor e infraestrutura de hospedagem.",
        "url": "https://hostingchecker.com",
        "accent": "#fb7185",
    },
]


SERVICE_PROFILES = {
    "phone": {
        "eyebrow": "Rastreio Ativo",
        "title": "Inteligencia de Telefone",
        "subtitle": "Correlacione numero, DDD, operadora, formatos publicos e score heuristico em um perfil visual dedicado.",
        "image": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1400&q=80",
        "accent": "#22c55e",
        "tags": ["Inteligencia", "Geo Rastreio", "Camada de Risco"],
        "stats": [("Motor", "PhoneIntel"), ("Foco", "Correlacao"), ("Sinal", "Publico")],
    },
    "email": {
        "eyebrow": "Trilha de Identidade",
        "title": "Perfil de Exposicao de Email",
        "subtitle": "Valide enderecos, enxergue MX, gravatar e sinais de exposicao em fontes abertas com painel proprio.",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
        "accent": "#60a5fa",
        "tags": ["MX", "Vazamentos", "Avatar"],
        "stats": [("Motor", "EmailSearch"), ("Foco", "Exposicao"), ("Camada", "Identidade")],
    },
    "domain": {
        "eyebrow": "Varredura de Infra",
        "title": "Centro de Dominio",
        "subtitle": "Reuna DNS, SSL, hosting, uptime, subdominios e superficie do alvo em uma tela de perfil de dominio.",
        "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
        "accent": "#f59e0b",
        "tags": ["DNS", "SSL", "Mapa de Superficie"],
        "stats": [("Motor", "DomainSearch"), ("Foco", "Infra"), ("Visao", "Completa")],
    },
}


def _format_osint_value(value):
    if isinstance(value, bool):
        return "Sim" if value else "Nao"
    return str(value)


def inject_theme():
    st.markdown(THEME_CSS, unsafe_allow_html=True)


def navigate_to(page_key: str, prefill: str | None = None):
    label_map = {item["key"]: item["label"] for item in CATALOG}
    top_label_map = {
        "home": "🏠 Inicio",
        "phone": "📞 Telefone",
        "email": "✉️ Email",
        "domain": "🌐 Dominio",
        "network": "🛰️ Rede",
        "graph": "🕸️ Grafo",
        "tools": "🧰 Ferramentas",
        "history": "🕒 Historico",
    }
    st.session_state["page"] = page_key
    st.session_state["sidebar_nav"] = label_map.get(page_key, "Inicio")
    if page_key in top_label_map:
        st.session_state["top_nav"] = top_label_map[page_key]
    if prefill:
        st.session_state[f"{page_key}_input"] = prefill
    st.rerun()


def card_shell(title: str, subtitle: str = ""):
    st.markdown(
        f"""
        <div class="section-title">{title}</div>
        {f'<div class="section-copy">{subtitle}</div>' if subtitle else ''}
        """,
        unsafe_allow_html=True,
    )


def render_service_profile(service_key: str):
    profile = SERVICE_PROFILES.get(service_key)
    if not profile:
        return

    tags_html = "".join(
        f'<span class="profile-tag">{tag}</span>'
        for tag in profile.get("tags", [])
    )
    stats_html = "".join(
        f"""
        <div class="profile-banner-stat">
            <div class="profile-banner-label">{label}</div>
            <div class="profile-banner-value">{value}</div>
        </div>
        """
        for label, value in profile.get("stats", [])
    )

    st.markdown(
        f"""
        <section class="profile-banner" style="background-image:url('{profile['image']}');">
            <div class="profile-overlay">
                <div class="profile-banner-copy">
                    <div class="profile-banner-eyebrow" style="border:1px solid {profile['accent']}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);">
                        {profile['eyebrow']}
                    </div>
                    <div class="profile-banner-title">{profile['title']}</div>
                    <div class="profile-banner-subtitle">{profile['subtitle']}</div>
                    <div class="profile-tags">{tags_html}</div>
                </div>
                <div class="profile-banner-grid">{stats_html}</div>
            </div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def render_service_profile_rail(service_keys, title: str, subtitle: str = ""):
    card_shell(title, subtitle)
    catalog_map = {item["key"]: item for item in CATALOG}
    cols = st.columns(len(service_keys))

    for col, service_key in zip(cols, service_keys):
        profile = SERVICE_PROFILES.get(service_key)
        catalog_item = catalog_map.get(service_key, {"label": service_key.title()})
        if not profile:
            continue

        tags_html = "".join(
            f'<span class="chip {"chip-red" if i == 0 else "chip-gold" if i == 1 else "chip-green"}">{tag}</span>'
            for i, tag in enumerate(profile.get("tags", [])[:3])
        )

        with col:
            st.markdown(
                f"""
                <div class="profile-rail-card" style="background-image:url('{profile["image"]}'); border-color:{profile["accent"]};">
                    <div class="profile-rail-overlay">
                        <div class="profile-rail-kicker">{profile["eyebrow"]}</div>
                        <div class="profile-rail-title">{profile["title"]}</div>
                        <div class="profile-rail-subtitle">{profile["subtitle"]}</div>
                        <div class="stream-meta">{tags_html}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(f"Acessar {catalog_item['label']}", key=f"service_rail_{service_key}", use_container_width=True):
                navigate_to(service_key)


def render_related_tracks(current_key: str):
    related_keys = [key for key in ["phone", "email", "domain", "network"] if key != current_key][:3]
    related_items = [item for item in CATALOG if item["key"] in related_keys]
    if related_items:
        card_shell("Continue investigando", "Troque de modulo sem voltar ao painel principal.")
        render_catalog_row(related_items, key_prefix=f"related_{current_key}")


def render_continue_watching():
    try:
        from Core.Support.History import get_history
    except Exception:
        return

    history = get_history(limit=6)
    if not history:
        return

    type_map = {"phone": "phone", "email": "email", "domain": "domain"}
    label_map = {"phone": "Telefone", "email": "Email", "domain": "Dominio"}
    eyebrow_map = {
        "phone": "Retomar Telefone",
        "email": "Retomar Email",
        "domain": "Retomar Dominio",
    }
    subtitle_map = {
        "phone": "Reabra a trilha de numero investigada recentemente.",
        "email": "Continue a verificacao de identidade por email.",
        "domain": "Volte para a superficie de ataque do dominio.",
    }

    recent_items = []
    seen_types = set()

    for entry in history:
        entry_type = str(entry.get("type", "")).lower()
        target_key = type_map.get(entry_type)
        if not target_key or target_key in seen_types:
            continue

        recent_items.append(
            {
                "key": target_key,
                "label": label_map[target_key],
                "eyebrow": eyebrow_map[target_key],
                "title": entry.get("query", "Busca recente"),
                "description": subtitle_map[target_key],
                "prefill": entry.get("query", ""),
                "button_label": f"Retomar {label_map[target_key]}",
                "chips": [
                    label_map[target_key],
                    str(entry.get("searched_at", "N/A"))[:16].replace("T", " "),
                    f"Achados {entry.get('sites_found', 0)}",
                ],
            }
        )
        seen_types.add(target_key)

    if recent_items:
        card_shell("Continuar explorando", "Atalhos montados a partir do historico recente da operacao.")
        render_catalog_row(recent_items, key_prefix="continue")


def render_hero():
    try:
        from Core.Support.History import get_stats

        history_stats = get_stats()
    except Exception:
        history_stats = None

    type_labels = {
        "phone": "Telefone",
        "email": "Email",
        "domain": "Dominio",
        "network": "Rede",
        "graph": "Grafo",
    }

    if history_stats and history_stats.get("total", 0) > 0:
        by_type = history_stats.get("by_type", {})
        hottest_type = max(by_type.items(), key=lambda item: item[1])[0] if by_type else ""
        hottest_label = type_labels.get(hottest_type, hottest_type.upper() if hottest_type else "OSINT")

        stats = [
            ("Buscas", str(history_stats.get("total", 0))),
            ("Hoje", str(history_stats.get("today", 0))),
            ("Categorias", str(len(by_type))),
            ("Em Alta", hottest_label),
        ]
    else:
        stats = [
            ("Buscas", "0"),
            ("Hoje", "0"),
            ("Categorias", "0"),
            ("Status", "Aguardando trilha"),
        ]

    stats_html = "".join(
        f"""
        <div class="hero-stat">
            <div class="hero-stat-label">{label}</div>
            <div class="hero-stat-value">{value}</div>
        </div>
        """
        for label, value in stats
    )
    st.markdown(
        f"""
        <section class="hero-shell">
            <div class="hero-kicker">MR TRUST OSINT</div>
            <h1 class="hero-title">Central OSINT unificada para investigacao digital.</h1>
            <p class="hero-subtitle">
                Buscas de telefone, email, dominio, rede e grafo reunidas em uma operacao unica,
                com foco em descoberta rapida, clareza visual e continuidade investigativa.
            </p>
            <div class="hero-stats">{stats_html}</div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def render_top_nav():
    option_map = {
        "🏠 Inicio": "home",
        "📞 Telefone": "phone",
        "✉️ Email": "email",
        "🌐 Dominio": "domain",
        "🛰️ Rede": "network",
        "🕸️ Grafo": "graph",
        "🧰 Ferramentas": "tools",
        "🕒 Historico": "history",
    }
    valid_keys = {item["key"] for item in CATALOG}
    valid_options = [label for label, key in option_map.items() if key in valid_keys]
    current_label = next((label for label, key in option_map.items() if key == st.session_state["page"]), valid_options[0])

    if st.session_state.get("top_nav") not in option_map:
        st.session_state["top_nav"] = current_label

    selected = st.radio(
        "Navegacao principal",
        valid_options,
        horizontal=True,
        key="top_nav",
        label_visibility="collapsed",
    )
    selected_page = option_map[selected]
    if selected_page != st.session_state["page"]:
        navigate_to(selected_page)


def render_ops_strip():
    try:
        from Core.Support.History import get_stats

        stats = get_stats()
    except Exception:
        stats = {"total": 0, "today": 0, "by_type": {}}

    by_type = stats.get("by_type", {}) or {}
    top_key = max(by_type.items(), key=lambda item: item[1])[0] if by_type else "N/A"
    top_value = by_type.get(top_key, 0) if by_type else 0

    st.markdown(
        f"""
        <div class="ops-strip">
            <div class="ops-chip">
                <div class="ops-chip-label">Buscas Totais</div>
                <div class="ops-chip-value">{stats.get("total", 0)}</div>
            </div>
            <div class="ops-chip">
                <div class="ops-chip-label">Buscas Hoje</div>
                <div class="ops-chip-value">{stats.get("today", 0)}</div>
            </div>
            <div class="ops-chip">
                <div class="ops-chip-label">Trilha em Alta</div>
                <div class="ops-chip-value">{str(top_key).upper()}</div>
            </div>
            <div class="ops-chip">
                <div class="ops-chip-label">Volume da Trilha</div>
                <div class="ops-chip-value">{top_value}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_catalog_row(items, key_prefix: str = "catalog"):
    cols = st.columns(len(items))
    for idx, (col, item) in enumerate(zip(cols, items)):
        chips_html = "".join(
            f'<span class="chip {"chip-red" if i == 0 else "chip-gold" if i == 1 else "chip-green"}">{chip}</span>'
            for i, chip in enumerate(item["chips"][:3])
        )
        with col:
            st.markdown(
                f"""
                <div class="stream-card">
                    <div class="stream-eyebrow">{item["eyebrow"]}</div>
                    <div class="stream-name">{item["title"]}</div>
                    <div class="stream-desc">{item["description"]}</div>
                    <div class="stream-meta">{chips_html}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            button_label = item.get("button_label", f"Abrir {item['label']}")
            button_key = item.get("button_key", f"{key_prefix}_{item['key']}_{idx}")
            if st.button(button_label, key=button_key, use_container_width=True):
                navigate_to(item["key"], item.get("prefill"))


def render_intel_base(base: dict, title: str = "Camada OSINT Normalizada"):
    if not base:
        return

    card_shell(title, "Estrutura comum de resumo, risco, artefatos e metadados.")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Tipo", str(base.get("kind", "N/A")).upper())
    c2.metric("Normalizado", base.get("normalized", "N/A"))
    c3.metric("Score", base.get("risk", {}).get("score", 0))
    c4.metric("Artefatos", len(base.get("artifacts", [])))

    summary = base.get("summary", {})
    if summary:
        cols = st.columns(min(4, max(1, len(summary))))
        for idx, (key, value) in enumerate(summary.items()):
            cols[idx % len(cols)].markdown(
                f"""
                <div class="metric-tile">
                    <div class="tile-title">{key.replace("_", " ").title()}</div>
                    <div class="tile-value">{_format_osint_value(value)}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    reasons = base.get("risk", {}).get("reasons", [])
    if reasons:
        st.markdown('<div class="subtle-divider"></div>', unsafe_allow_html=True)
        st.caption("Motivos sinalizados")
        for reason in reasons[:6]:
            st.markdown(f"- {reason}")

    metadata = base.get("metadata", {})
    if metadata:
        meta_cols = st.columns(min(4, max(1, len(metadata))))
        for idx, (key, value) in enumerate(metadata.items()):
            meta_cols[idx % len(meta_cols)].markdown(
                f"""
                <div class="detail-card">
                    <div class="detail-title">{key.replace("_", " ").title()}</div>
                    <div class="detail-sub">{_format_osint_value(value)}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    links = base.get("links", [])
    if links:
        card_shell("Links da Investigacao")
        cols = st.columns(3)
        for idx, item in enumerate(links[:12]):
            cols[idx % 3].markdown(f"[{item.get('label', 'Abrir')}]({item.get('url', '#')})")

    artifacts = base.get("artifacts", [])
    if artifacts:
        card_shell("Artefatos Estruturados")
        for item in artifacts[:12]:
            st.markdown(
                f"""
                <div class="list-card">
                    <strong>{item.get("category", "artifact").upper()}</strong> • {item.get("label", "item")}<br>
                    <span style="color:#b7b8c5;">{item.get("value", "N/A")}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )


def render_home():
    render_top_nav()
    render_hero()
    render_ops_strip()
    render_continue_watching()
    render_service_profile_rail(
        ["phone", "email", "domain"],
        "Perfis principais",
        "Cada servico principal possui identidade propria, painel dedicado e entrada rapida.",
    )
    card_shell("Categorias em destaque", "Escolha um modulo para iniciar sua rotina investigativa.")
    render_catalog_row(CATALOG[1:4], key_prefix="featured")
    card_shell("Colecoes utilitarias", "Ferramentas de apoio, grafo de entidades e historico operacional.")
    render_catalog_row(CATALOG[4:8], key_prefix="utility")

    card_shell("Ferramentas externas", "Atalhos para complementar a investigacao fora da suite.")
    cols = st.columns(3)
    for idx, tool in enumerate(TOOLS):
        cols[idx % 3].markdown(
            f"""
            <div class="tool-tile" style="border-color:{tool['accent']};">
                <div class="tile-title">{tool['name']}</div>
                <div class="detail-sub">{tool['desc']}</div>
                <div class="tool-link-wrap"><a href="{tool['url']}" target="_blank" style="color:{tool['accent']};font-weight:700;">Abrir ferramenta</a></div>
            </div>
            """,
            unsafe_allow_html=True,
        )


def init_navigation():
    if "page" not in st.session_state:
        st.session_state["page"] = "home"
    label_map = {item["key"]: item["label"] for item in CATALOG}
    top_label_map = {
        "home": "🏠 Inicio",
        "phone": "📞 Telefone",
        "email": "✉️ Email",
        "domain": "🌐 Dominio",
        "network": "🛰️ Rede",
        "graph": "🕸️ Grafo",
        "tools": "🧰 Ferramentas",
        "history": "🕒 Historico",
    }
    if "sidebar_nav" not in st.session_state:
        st.session_state["sidebar_nav"] = label_map.get(st.session_state["page"], "Inicio")
    if "top_nav" not in st.session_state:
        st.session_state["top_nav"] = top_label_map.get(st.session_state["page"], "🏠 Inicio")


def sidebar_navigation():
    with st.sidebar:
        st.markdown("## MR TRUST")
        st.caption("Central OSINT para buscas e correlacao")
        options = {item["label"]: item["key"] for item in CATALOG}
        labels = list(options.keys())

        current_label = next((label for label, key in options.items() if key == st.session_state["page"]), "Inicio")
        if st.session_state.get("sidebar_nav") not in options:
            st.session_state["sidebar_nav"] = current_label

        selected = st.radio("Navegacao", labels, key="sidebar_nav")
        selected_page = options[selected]
        if selected_page != st.session_state["page"]:
            st.session_state["page"] = selected_page
            st.rerun()

        quick = st.selectbox(
            "Acesso rapido",
            [item["label"] for item in CATALOG if item["key"] != "home"],
            index=0,
            key="quick_jump",
        )
        if st.button("Ir para modulo", use_container_width=True, key="quick_jump_btn"):
            navigate_to(options[quick])
        st.markdown("---")
        st.caption("Atalhos rapidos")
        st.markdown("- Telefone")
        st.markdown("- Email")
        st.markdown("- Dominio")
        st.markdown("- Rede")


def render_phone():
    render_service_profile("phone")
    card_shell("Busca de Telefone", "Operadora, DDD, geolocalizacao, fontes publicas e score heuristico.")
    phone = st.text_input("Numero com codigo do pais", placeholder="5511999999999", key="phone_input")

    if st.button("Iniciar busca", use_container_width=True, type="primary", key="phone_search") and phone:
        with st.spinner("Analisando numero..."):
            try:
                from Core.Support.Phone.Numbers import get_geo_from_ddd
                from Core.Support.PhoneIntel import buscar_telefone_inteligente, salvar_relatorio_phone_intel
                import phonenumbers as pn
                from phonenumbers import carrier, geocoder, timezone

                parsed = pn.parse("+" + phone.strip(), "BR")
                local = (
                    pn.format_number(parsed, pn.PhoneNumberFormat.E164)
                    .replace("+", "")
                    .replace(str(parsed.country_code), "")
                )
                ddd = local[:2]
                geo = get_geo_from_ddd(ddd)

                col1, col2, col3, col4 = st.columns(4)
                col1.metric("Pais", geocoder.country_name_for_number(parsed, "pt") or "N/A")
                col2.metric("Area", geocoder.description_for_number(parsed, "pt") or "N/A")
                col3.metric("Operadora", carrier.name_for_number(parsed, "pt") or "N/A")
                tz = timezone.time_zones_for_number(parsed)
                col4.metric("Fuso", tz[0] if tz else "N/A")

                if geo:
                    st.success(f"DDD {ddd} -> {geo['city']}/{geo['state']}")
                    st.map(data={"lat": [geo["lat"]], "lon": [geo["lon"]]}, zoom=10)

                intel = buscar_telefone_inteligente(phone)
                report_path = salvar_relatorio_phone_intel(intel)

                i1, i2, i3 = st.columns(3)
                i1.metric("Score", intel.get("risk", {}).get("score", 0))
                i2.metric("Nivel", intel.get("risk", {}).get("level", "N/A").upper())
                i3.metric("Fontes", len(intel.get("public_sources", [])))

                card_shell("Fontes Publicas")
                if intel.get("public_sources"):
                    for item in intel.get("public_sources", []):
                        st.success(f"[{item['source']}]({item['url']})")
                else:
                    st.markdown(
                        '<div class="empty-state">Nenhum registro publico validado.</div>',
                        unsafe_allow_html=True,
                    )

                card_shell("Formatos Correlacionados")
                formats = intel.get("formats", [])
                if formats:
                    st.code("\n".join(formats[:12]), language="text")

                card_shell("Busca Multi-Motor")
                for item in intel.get("search_links", [])[:6]:
                    st.markdown(f"**{item['term']}**")
                    c1, c2, c3 = st.columns(3)
                    c1.markdown(f"[Google]({item['google']})")
                    c2.markdown(f"[Bing]({item['bing']})")
                    c3.markdown(f"[DuckDuckGo]({item['duckduckgo']})")

                render_intel_base(intel.get("intel_base", {}))
                st.success(f"Relatorio salvo em: {report_path}")
            except Exception as e:
                st.error(f"Erro: {e}")

    render_related_tracks("phone")


def render_email():
    render_service_profile("email")
    card_shell("Busca de Email", "Validacao do endereco, MX, Gravatar e exposicao publica.")
    email = st.text_input("Endereco de email", placeholder="usuario@dominio.com", key="email_input")
    if st.button("Rodar analise", use_container_width=True, type="primary", key="email_search") and email:
        with st.spinner("Investigando email..."):
            try:
                from Core.Support.EmailSearch import buscar_email

                r = buscar_email(email)
                c1, c2, c3, c4 = st.columns(4)
                c1.metric("Valido", "Sim" if r.get("valido") else "Nao")
                c2.metric("MX", "Sim" if r.get("mx", {}).get("has_mx") else "Nao")
                c3.metric("Gravatar", "Sim" if r.get("gravatar", {}).get("has_gravatar") else "Nao")
                c4.metric("Dominio", r.get("dominio", "N/A"))

                if r.get("pastes"):
                    card_shell("Ocorrencias Publicas")
                    for item in r["pastes"][:8]:
                        st.warning(f"[{item['title'][:80]}]({item['url']})")

                alerts = r.get("alertas", [])
                if alerts:
                    card_shell("Alertas")
                    for alert in alerts:
                        st.info(alert)
            except Exception as e:
                st.error(f"Erro: {e}")

    render_related_tracks("email")


def render_domain():
    render_service_profile("domain")
    card_shell("Busca de Dominio", "IP, DNS, SSL, uptime, hosting, portas, subdominios e links auxiliares.")
    domain = st.text_input("Dominio alvo", placeholder="exemplo.com", key="domain_input")
    if st.button("Investigar dominio", use_container_width=True, type="primary", key="domain_search") and domain:
        with st.spinner("Investigando dominio..."):
            try:
                from Core.Support.DomainSearch import buscar_dominio, salvar_relatorio_dominio

                r = buscar_dominio(domain)
                report_path = salvar_relatorio_dominio(r)

                c1, c2, c3, c4 = st.columns(4)
                c1.metric("IP", r.get("ip", "N/A"))
                c2.metric("Pais", r.get("geo", {}).get("country", "N/A"))
                c3.metric("Cidade", r.get("geo", {}).get("city", "N/A"))
                c4.metric("Servidor", r.get("headers", {}).get("server", "N/A"))

                c5, c6, c7, c8 = st.columns(4)
                c5.metric("Status", r.get("headers", {}).get("status", r.get("uptime", {}).get("status_code", "N/A")))
                c6.metric("SSL", "Sim" if r.get("ssl", {}).get("available") else "Nao")
                c7.metric("Online", "Sim" if r.get("uptime", {}).get("online") else "Nao")
                c8.metric("Subdominios", len(r.get("subdomains", {}).get("found", [])))

                if r.get("geo", {}).get("lat"):
                    st.map(data={"lat": [r["geo"]["lat"]], "lon": [r["geo"]["lon"]]}, zoom=8)

                card_shell("Registros DNS")
                any_dns = False
                for rtype, records in r.get("dns", {}).items():
                    if records:
                        any_dns = True
                        st.markdown(f"**{rtype}**: {', '.join(records[:5])}")
                if not any_dns:
                    st.markdown('<div class="empty-state">Nenhum registro DNS exibivel.</div>', unsafe_allow_html=True)

                card_shell("Portas Comuns")
                if r.get("open_ports"):
                    cols = st.columns(3)
                    for idx, item in enumerate(r.get("open_ports", [])[:12]):
                        cols[idx % 3].markdown(
                            f"""
                            <div class="detail-card">
                                <div class="detail-title">Porta {item['port']}</div>
                                <div class="detail-sub">{item['service']}</div>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )
                else:
                    st.markdown('<div class="empty-state">Nenhuma porta comum aberta detectada.</div>', unsafe_allow_html=True)

                card_shell("Subdominios")
                if r.get("subdomains", {}).get("found"):
                    for item in r.get("subdomains", {}).get("found", [])[:12]:
                        st.markdown(f"- **{item['host']}** -> {item['ip']}")
                else:
                    st.markdown('<div class="empty-state">Nenhum subdominio comum resolvido.</div>', unsafe_allow_html=True)

                card_shell("Ferramentas ViewDNS")
                cols = st.columns(5)
                for idx, (name, link) in enumerate(r.get("viewdns_links", {}).items()):
                    cols[idx % 5].markdown(f"[{name}]({link})")

                render_intel_base(r.get("intel_base", {}))
                st.success(f"Relatorio salvo em: {report_path}")
            except Exception as e:
                st.error(f"Erro: {e}")

    render_related_tracks("domain")


def render_network():
    card_shell("Ferramentas de Rede", "Selecione uma rotina rapida de diagnostico ou descoberta.")
    tool = st.selectbox(
        "Escolha a ferramenta",
        ["Ping", "Scan de Portas", "Site Online", "IP Reverso", "Meu IP", "Hosting"],
        key="network_tool",
    )

    if tool == "Ping":
        host = st.text_input("Host ou IP", "google.com", key="ping_host")
        if st.button("Executar ping", use_container_width=True, key="run_ping"):
            from Core.Support.NetTools import ping_host

            r = ping_host(host)
            if r["success"]:
                c1, c2, c3 = st.columns(3)
                c1.metric("Media", f"{r['avg_time']:.1f} ms")
                c2.metric("Minimo", f"{r['min_time']:.1f} ms")
                c3.metric("Maximo", f"{r['max_time']:.1f} ms")
                st.code(r["output"][-400:])
            else:
                st.error(r.get("error", "Host inacessivel"))

    elif tool == "Scan de Portas":
        host = st.text_input("Host", "localhost", key="scan_host")
        if st.button("Escanear", use_container_width=True, key="run_scan"):
            from Core.Support.NetTools import COMMON_PORTS, scan_ports

            results = scan_ports(host)
            if results:
                for item in results:
                    st.success(f"Porta {item['port']} / {item['service']} aberta")
            else:
                st.markdown('<div class="empty-state">Nenhuma porta comum aberta.</div>', unsafe_allow_html=True)
            st.caption("Portas verificadas: " + ", ".join(str(p) for p in COMMON_PORTS.keys()))

    elif tool == "Site Online":
        url = st.text_input("URL", "https://google.com", key="uptime_url")
        if st.button("Verificar disponibilidade", use_container_width=True, key="run_uptime"):
            from Core.Support.NetTools import check_uptime

            r = check_uptime(url)
            if r["online"]:
                c1, c2 = st.columns(2)
                c1.metric("Status", r["status_code"])
                c2.metric("Tempo", f"{r['response_time']}s")
            else:
                st.error(r.get("error", "Sem resposta"))

    elif tool == "IP Reverso":
        ip = st.text_input("Endereco IP", "8.8.8.8", key="reverse_ip")
        if st.button("Resolver hostname", use_container_width=True, key="run_reverse"):
            from Core.Support.NetTools import reverse_ip

            r = reverse_ip(ip)
            if r["found"]:
                st.success(f"{ip} -> {r['hostname']}")
            else:
                st.info("Sem registro DNS reverso.")

    elif tool == "Meu IP":
        if st.button("Descobrir IP publico", use_container_width=True, key="run_my_ip"):
            from Core.Support.NetTools import get_my_ip

            r = get_my_ip()
            st.metric("IP Publico", r["ip"])
            st.caption(f"Fonte: {r['source']}")

    elif tool == "Hosting":
        domain = st.text_input("Dominio", "google.com", key="hosting_domain")
        if st.button("Buscar hosting", use_container_width=True, key="run_hosting"):
            from Core.Support.NetTools import lookup_hosting

            r = lookup_hosting(domain)
            c1, c2, c3 = st.columns(3)
            c1.metric("IP", r.get("ip", "N/A"))
            c2.metric("ISP", r.get("isp", "N/A"))
            c3.metric("Pais", r.get("country", "N/A"))
            st.markdown(f"[HostingChecker]({r.get('hosting_link', '#')}) | [WHOIS]({r.get('whois_link', '#')})")


def render_graph():
    card_shell("Mapa de Relacionamentos", "Adicione entidades e conecte-as como um quadro investigativo visual.")

    if "graph_nodes" not in st.session_state:
        st.session_state.graph_nodes = []
    if "graph_edges" not in st.session_state:
        st.session_state.graph_edges = []

    left, right = st.columns([1.6, 1])
    with right:
        type_map = {"Telefone": "Phone", "Email": "Email", "Dominio": "Domain", "IP": "IP", "Pessoa": "Person"}
        entity_type_pt = st.selectbox("Tipo", list(type_map.keys()), key="graph_type")
        entity_type = type_map[entity_type_pt]
        placeholder_map = {
            "Telefone": "5511999999999",
            "Email": "usuario@dominio.com",
            "Dominio": "exemplo.com",
            "IP": "8.8.8.8",
            "Pessoa": "Nome Sobrenome",
        }
        entity_value = st.text_input("Valor", placeholder=placeholder_map[entity_type_pt], key="graph_value")
        entity_label = st.text_input("Rotulo", "", key="graph_label")

        if st.button("Adicionar entidade", use_container_width=True, key="graph_add"):
            if entity_value:
                node = {
                    "id": entity_value,
                    "label": entity_label or entity_value,
                    "type": entity_type,
                    "color": {
                        "Phone": "#3b82f6",
                        "Email": "#ef4444",
                        "Domain": "#22c55e",
                        "IP": "#f59e0b",
                        "Person": "#a855f7",
                    }[entity_type],
                }
                if node not in st.session_state.graph_nodes:
                    st.session_state.graph_nodes.append(node)
                    st.rerun()

        if len(st.session_state.graph_nodes) >= 2:
            labels = [n["label"] for n in st.session_state.graph_nodes]
            src = st.selectbox("De", labels, key="graph_src")
            dst = st.selectbox("Para", labels, index=1, key="graph_dst")
            edge_label = st.text_input("Relacionamento", "conectado a", key="graph_edge_label")
            if st.button("Adicionar conexao", use_container_width=True, key="graph_edge_add"):
                st.session_state.graph_edges.append({"from": src, "to": dst, "label": edge_label})
                st.rerun()

        if st.button("Limpar grafo", use_container_width=True, key="graph_clear"):
            st.session_state.graph_nodes = []
            st.session_state.graph_edges = []
            st.rerun()

    with left:
        if not st.session_state.graph_nodes:
            st.markdown('<div class="empty-state">Adicione entidades para iniciar o mapa investigativo.</div>', unsafe_allow_html=True)
            return

        try:
            import matplotlib

            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            import networkx as nx

            graph = nx.Graph()
            for node in st.session_state.graph_nodes:
                graph.add_node(node["label"], color=node["color"])

            for edge in st.session_state.graph_edges:
                if edge["from"] in graph.nodes and edge["to"] in graph.nodes:
                    graph.add_edge(edge["from"], edge["to"], label=edge["label"])

            fig, ax = plt.subplots(figsize=(10, 6), facecolor="#0f1016")
            pos = nx.spring_layout(graph, k=2.8, iterations=60, seed=42)
            colors = [graph.nodes[n].get("color", "#94a3b8") for n in graph.nodes]

            nx.draw_networkx_nodes(graph, pos, node_color=colors, node_size=1300, alpha=0.94, ax=ax)
            nx.draw_networkx_edges(graph, pos, edge_color="#8b8da7", width=2.1, alpha=0.65, ax=ax)

            for node, (x, y) in pos.items():
                ax.text(
                    x,
                    y + 0.05,
                    node,
                    fontsize=9,
                    ha="center",
                    va="bottom",
                    fontweight="bold",
                    color="#f8fafc",
                    bbox=dict(facecolor="#171821", alpha=0.88, edgecolor="none", pad=3),
                )

            ax.set_facecolor("#0f1016")
            ax.axis("off")

            buf = BytesIO()
            plt.savefig(buf, format="png", dpi=130, bbox_inches="tight", facecolor="#0f1016")
            plt.close()
            buf.seek(0)
            st.image(buf, use_container_width=True)
        except Exception as e:
            st.error(f"Erro ao gerar grafo: {e}")


def render_tools():
    card_shell("Hub de Ferramentas", "Servicos externos para estender o workflow investigativo.")
    url_to_scan = st.text_input("URL para analisar", "https://exemplo.com", key="urlscan_input")

    a, b = st.columns(2)
    with a:
        if st.button("Enviar para UrlScan", use_container_width=True, key="urlscan_run"):
            try:
                import urllib.request as _ur

                req = _ur.Request(
                    "https://urlscan.io/api/v1/scan/",
                    data=json.dumps({"url": url_to_scan, "visibility": "public"}).encode(),
                    headers={"Content-Type": "application/json", "API-Key": ""},
                )
                req.add_header("User-Agent", "MrHolmes-1.0")
                resp = _ur.urlopen(req, timeout=15)
                data = json.loads(resp.read().decode())
                uuid = data.get("uuid", "")
                if uuid:
                    st.success("Analise enviada com sucesso.")
                    st.markdown(f"[Resultado](https://urlscan.io/result/{uuid}/)")
                    st.markdown(f"[Screenshot](https://urlscan.io/screenshots/{uuid}.png)")
            except Exception:
                st.warning("Falha na API gratuita. Use o acesso direto abaixo.")
    with b:
        st.markdown(f"[Abrir busca direta no UrlScan](https://urlscan.io/search/#{url_to_scan})")

    card_shell("Catalogo externo")
    cols = st.columns(3)
    for idx, tool in enumerate(TOOLS):
        cols[idx % 3].markdown(
            f"""
            <div class="tool-tile" style="border-color:{tool['accent']};">
                <div class="tile-title">{tool['name']}</div>
                <div class="detail-sub">{tool['desc']}</div>
                <div class="tool-link-wrap"><a href="{tool['url']}" target="_blank" style="color:{tool['accent']};font-weight:700;">Abrir ferramenta</a></div>
            </div>
            """,
            unsafe_allow_html=True,
        )


def render_history():
    card_shell("Historico de Buscas", "Continue de onde parou e acompanhe o uso da suite.")
    try:
        from Core.Support.History import get_history, get_stats

        stats = get_stats()
        c1, c2, c3 = st.columns(3)
        c1.metric("Total", stats["total"])
        c2.metric("Hoje", stats["today"])
        c3.metric("Tipos", len(stats.get("by_type", {})))

        history = get_history(limit=20)
        if history:
            for item in history:
                emoji = {"phone": "FONE", "email": "MAIL", "domain": "WEB"}.get(item.get("type", ""), "OSINT")
                st.markdown(
                    f"""
                    <div class="list-card">
                        <strong>{emoji}</strong> · {item['query']}<br>
                        <span style="color:#b7b8c5;">{str(item.get('searched_at', 'N/A'))[:19]}</span>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
        else:
            st.markdown('<div class="empty-state">Nenhum historico disponivel ainda.</div>', unsafe_allow_html=True)
    except Exception:
        st.markdown('<div class="empty-state">Historico indisponivel. Execute algumas buscas primeiro.</div>', unsafe_allow_html=True)


def render_about():
    card_shell("Sobre o Projeto", "Suite OSINT educacional com modulos de coleta, rede e visualizacao.")
    st.markdown(
        """
        - **Busca de Telefone**: correlacao de formatos, DDD, localizacao e sinais publicos.
        - **Busca de Email**: validacao, MX, Gravatar e exposicao em fontes abertas.
        - **Busca de Dominio**: DNS, SSL, hosting, GeoIP, uptime e ViewDNS.
        - **Rede**: ping, portas, hosting, IP reverso e disponibilidade.
        - **Grafo**: relacoes entre entidades em visualizacao investigativa.

        **Stack principal**
        - Python + Streamlit
        - phonenumbers, dnspython, SQLite, matplotlib, networkx
        - APIs e servicos publicos quando disponiveis

        **Aviso**
        - Uso educacional e de pesquisa.
        - O operador e responsavel pelo uso.
        """
    )


def render_page():
    page = st.session_state["page"]
    if page == "home":
        render_home()
    elif page == "phone":
        render_phone()
    elif page == "email":
        render_email()
    elif page == "domain":
        render_domain()
    elif page == "network":
        render_network()
    elif page == "graph":
        render_graph()
    elif page == "tools":
        render_tools()
    elif page == "history":
        render_history()
    elif page == "about":
        render_about()


inject_theme()
init_navigation()
sidebar_navigation()
render_page()
st.markdown('<div class="footer-note">MR TRUST OSINT · painel investigativo operacional.</div>', unsafe_allow_html=True)