"""Domain Search - Mr.Holmes
Multi-source domain investigation: WHOIS, DNS, IP, ViewDNS links
"""

import urllib.request
import urllib.parse
import json
import re
import socket
import ssl
from datetime import datetime
from Core.Support import Font
from Core.Support import Language
from Core.Support import NetTools
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

filename = Language.Translation.Get_Language()

VIEWDNS_TOOLS = {
    "WHOIS": "https://viewdns.info/whois/?domain={}",
    "DNS Records": "https://viewdns.info/dnsrecord/?domain={}",
    "IP History": "https://viewdns.info/iphistory/?domain={}",
    "Reverse IP": "https://viewdns.info/reverseip/?host={}&t=1",
    "Port Scan": "https://viewdns.info/portscan/?host={}",
    "HTTP Headers": "https://viewdns.info/httpheaders/?domain={}",
    "Traceroute": "https://viewdns.info/traceroute/?host={}",
    "DNS Report": "https://viewdns.info/dnsreport/?domain={}",
    "Spam DB": "https://viewdns.info/spamdblookup/?domain={}",
    "Country": "https://viewdns.info/country/?domain={}",
}


def _normalizar_dominio(dominio: str) -> str:
    dominio = dominio.strip().lower()
    dominio = re.sub(r'^https?://', '', dominio)
    dominio = re.sub(r'/.*$', '', dominio)
    return dominio


def _buscar_ssl_info(dominio: str) -> dict:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((dominio, 443), timeout=8) as sock:
            with context.wrap_socket(sock, server_hostname=dominio) as secure_sock:
                cert = secure_sock.getpeercert()
        subject = dict(x[0] for x in cert.get("subject", [])) if cert.get("subject") else {}
        issuer = dict(x[0] for x in cert.get("issuer", [])) if cert.get("issuer") else {}
        sans = [entry[1] for entry in cert.get("subjectAltName", []) if len(entry) > 1]
        return {
            "available": True,
            "subject_cn": subject.get("commonName", "N/A"),
            "issuer_cn": issuer.get("commonName", "N/A"),
            "not_before": cert.get("notBefore", "N/A"),
            "not_after": cert.get("notAfter", "N/A"),
            "san_count": len(sans),
            "sans_preview": sans[:10],
        }
    except Exception as e:
        return {"available": False, "error": str(e)[:120]}


def _gerar_subdominios_comuns(dominio: str) -> dict:
    candidatos = [
        "www", "mail", "webmail", "smtp", "imap", "pop", "ns1", "ns2",
        "blog", "dev", "api", "app", "admin", "portal", "vpn", "m"
    ]
    encontrados = []

    for sub in candidatos:
        host = f"{sub}.{dominio}"
        try:
            ip = socket.gethostbyname(host)
            encontrados.append({"host": host, "ip": ip})
        except Exception:
            pass

    return {
        "checked": len(candidatos),
        "found": encontrados,
    }


def buscar_dominio(dominio: str) -> dict:
    """Busca informações completas sobre um domínio."""
    dominio = _normalizar_dominio(dominio)
    
    resultado = {
        "dominio": dominio,
        "ip": None,
        "geo": {},
        "whois": {},
        "dns": {},
        "viewdns_links": {},
        "headers": {},
        "ssl": {},
        "uptime": {},
        "hosting": {},
        "reverse_ip": {},
        "open_ports": [],
        "subdomains": {},
    }
    intel_base = criar_base_osint("domain", dominio, dominio)
    resultado["intel_base"] = intel_base
    
    print(Font.Color.GREEN + "\n[+]" + Font.Color.WHITE + f" DOMAIN SEARCH: {dominio}")
    
    # 1. Resolver IP
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " Resolving IP...")
    try:
        ip = socket.gethostbyname(dominio)
        resultado["ip"] = ip
        print(Font.Color.GREEN + "[+]" + Font.Color.WHITE + f" IP: {ip}")
    except Exception:
        print(Font.Color.RED + "[!]" + Font.Color.WHITE + " Could not resolve IP")
    
    # 2. GeoIP via ip-api.com
    if resultado["ip"]:
        print(Font.Color.YELLOW + "[v]" + Font.Color.WHITE + " GeoIP lookup...")
        try:
            req = urllib.request.Request(
                f"http://ip-api.com/json/{resultado['ip']}",
                headers={"User-Agent": "MrHolmes-1.0"}
            )
            resp = urllib.request.urlopen(req, timeout=10)
            geo = json.loads(resp.read().decode())
            resultado["geo"] = geo
            print(Font.Color.GREEN + "[+]" + Font.Color.WHITE +
                  f" COUNTRY: {geo.get('country', 'N/A')} | CITY: {geo.get('city', 'N/A')}")
            print(Font.Color.GREEN + "[+]" + Font.Color.WHITE +
                  f" ISP: {geo.get('isp', 'N/A')} | ORG: {geo.get('org', 'N/A')}")
            print(Font.Color.YELLOW + "[v]" + Font.Color.WHITE +
                  f" COORDS: {geo.get('lat', 0)}, {geo.get('lon', 0)}")
        except Exception:
            pass
    
    # 3. DNS Records via dnspython
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " DNS Records...")
    try:
        import dns.resolver
        
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'CNAME']
        for rtype in record_types:
            try:
                answers = dns.resolver.resolve(dominio, rtype)
                records = [str(a) for a in answers][:3]
                resultado["dns"][rtype] = records
                if records:
                    print(Font.Color.GREEN + f"[+] {rtype}:" + Font.Color.WHITE +
                          f" {', '.join(records[:2])}")
            except Exception:
                resultado["dns"][rtype] = []
    except ImportError:
        print(Font.Color.YELLOW + "[v]" + Font.Color.WHITE + " dnspython not available")
    except Exception as e:
        print(Font.Color.RED + "[!]" + Font.Color.WHITE + f" DNS error: {str(e)[:60]}")
    
    # 4. HTTP Headers
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " HTTP Headers...")
    try:
        req = urllib.request.Request(
            f"https://{dominio}",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        resp = urllib.request.urlopen(req, timeout=10)
        headers = dict(resp.headers)
        resultado["headers"] = {
            "status": resp.status,
            "server": headers.get("Server", "N/A"),
            "content_type": headers.get("Content-Type", "N/A"),
            "x_powered_by": headers.get("X-Powered-By", "N/A"),
        }
        print(Font.Color.GREEN + "[+]" + Font.Color.WHITE +
              f" STATUS: {resp.status} | SERVER: {resultado['headers']['server']}")
    except Exception:
        print(Font.Color.RED + "[!]" + Font.Color.WHITE + " Could not connect")
    
    # 5. SSL/TLS
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " SSL/TLS...")
    resultado["ssl"] = _buscar_ssl_info(dominio)
    if resultado["ssl"].get("available"):
        print(
            Font.Color.GREEN + "[+]" + Font.Color.WHITE +
            f" SSL CN: {resultado['ssl'].get('subject_cn', 'N/A')} | ISSUER: {resultado['ssl'].get('issuer_cn', 'N/A')}"
        )
    else:
        print(Font.Color.RED + "[!]" + Font.Color.WHITE + " SSL data unavailable")

    # 6. Uptime
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " Uptime Check...")
    resultado["uptime"] = NetTools.check_uptime(dominio)
    if resultado["uptime"].get("online"):
        print(
            Font.Color.GREEN + "[+]" + Font.Color.WHITE +
            f" ONLINE | STATUS: {resultado['uptime'].get('status_code', 'N/A')} | TIME: {resultado['uptime'].get('response_time', 'N/A')}s"
        )
    else:
        print(Font.Color.RED + "[!]" + Font.Color.WHITE + " Site appears offline or unreachable")

    # 7. Hosting
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " Hosting Lookup...")
    resultado["hosting"] = NetTools.lookup_hosting(dominio)
    if resultado["hosting"].get("ip"):
        print(
            Font.Color.GREEN + "[+]" + Font.Color.WHITE +
            f" HOSTING: {resultado['hosting'].get('isp', 'N/A')} | COUNTRY: {resultado['hosting'].get('country', 'N/A')}"
        )

    # 8. Reverse IP
    if resultado["ip"]:
        print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " Reverse IP...")
        resultado["reverse_ip"] = NetTools.reverse_ip(resultado["ip"])
        if resultado["reverse_ip"].get("found"):
            print(
                Font.Color.GREEN + "[+]" + Font.Color.WHITE +
                f" HOSTNAME: {resultado['reverse_ip'].get('hostname', 'N/A')}"
            )

    # 9. Common Ports
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " Common Port Scan...")
    resultado["open_ports"] = NetTools.scan_ports(dominio)
    if resultado["open_ports"]:
        portas = ", ".join(
            f"{item['port']}/{item['service']}" for item in resultado["open_ports"][:8]
        )
        print(Font.Color.GREEN + "[+]" + Font.Color.WHITE + f" OPEN PORTS: {portas}")
    else:
        print(Font.Color.YELLOW + "[v]" + Font.Color.WHITE + " No common open ports detected")

    # 10. Common Subdomains
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " Common Subdomains...")
    resultado["subdomains"] = _gerar_subdominios_comuns(dominio)
    if resultado["subdomains"].get("found"):
        preview = ", ".join(item["host"] for item in resultado["subdomains"]["found"][:6])
        print(Font.Color.GREEN + "[+]" + Font.Color.WHITE + f" SUBDOMAINS: {preview}")
    else:
        print(Font.Color.YELLOW + "[v]" + Font.Color.WHITE + " No common subdomains resolved")

    # 11. ViewDNS Links
    print(Font.Color.YELLOW + "\n[v]" + Font.Color.WHITE + " ViewDNS Tools:")
    for name, url_template in VIEWDNS_TOOLS.items():
        link = url_template.format(dominio)
        resultado["viewdns_links"][name] = link
        print(Font.Color.GREEN + f"[+] {name}:" + Font.Color.WHITE + f" {link}")
    
    online = bool(resultado["uptime"].get("online"))
    ssl_ok = bool(resultado["ssl"].get("available"))
    subdomains_found = len(resultado["subdomains"].get("found", []))
    open_ports_count = len(resultado["open_ports"])
    dns_record_count = sum(len(records) for records in resultado["dns"].values())

    risk_score = 0
    risk_reasons = []

    if not ssl_ok:
        risk_score += 25
        risk_reasons.append("SSL/TLS indisponível")
    if not online:
        risk_score += 20
        risk_reasons.append("Serviço HTTP/HTTPS offline ou inacessível")
    if open_ports_count >= 5:
        risk_score += 20
        risk_reasons.append(f"{open_ports_count} portas comuns abertas")
    elif open_ports_count >= 1:
        risk_score += 10
        risk_reasons.append(f"{open_ports_count} porta(s) comum(ns) aberta(s)")
    if subdomains_found >= 5:
        risk_score += 10
        risk_reasons.append(f"{subdomains_found} subdomínios comuns resolvidos")
    if resultado["hosting"].get("error"):
        risk_score += 10
        risk_reasons.append("Falha parcial na identificação de hosting")

    risk_score = max(0, min(risk_score, 100))
    if risk_score >= 60:
        risk_level = "alto"
    elif risk_score >= 30:
        risk_level = "médio"
    else:
        risk_level = "baixo"

    definir_resumo(
        intel_base,
        ip_resolved=bool(resultado["ip"]),
        dns_records=dns_record_count,
        open_ports=open_ports_count,
        subdomains=subdomains_found,
        viewdns_links=len(resultado["viewdns_links"]),
        ssl_available=ssl_ok,
        online=online,
    )
    definir_risco(
        intel_base,
        score=risk_score,
        level=risk_level,
        reasons=risk_reasons,
    )
    atualizar_metadados(
        intel_base,
        domain=dominio,
        ip=resultado.get("ip"),
        country=resultado.get("geo", {}).get("country"),
        city=resultado.get("geo", {}).get("city"),
        isp=resultado.get("hosting", {}).get("isp") or resultado.get("geo", {}).get("isp"),
        server=resultado.get("headers", {}).get("server"),
    )

    if resultado.get("ip"):
        adicionar_artefato(intel_base, "network", "ip_address", resultado["ip"])

    for rtype, records in resultado.get("dns", {}).items():
        for record in records:
            adicionar_artefato(intel_base, "dns", rtype, record, record_type=rtype)

    for item in resultado.get("open_ports", []):
        adicionar_artefato(
            intel_base,
            "port",
            f"port_{item.get('port')}",
            item.get("port"),
            service=item.get("service"),
            state="open",
        )

    for item in resultado.get("subdomains", {}).get("found", []):
        adicionar_artefato(
            intel_base,
            "subdomain",
            item.get("host", "subdomain"),
            item.get("host"),
            ip=item.get("ip"),
        )

    for name, link in resultado.get("viewdns_links", {}).items():
        adicionar_link(intel_base, name, link, category="investigation", source="viewdns")

    if resultado.get("geo"):
        adicionar_fonte(intel_base, "ip-api.com", category="geoip")

    if resultado.get("headers"):
        adicionar_fonte(intel_base, f"https://{dominio}", category="http")

    if ssl_ok:
        adicionar_fonte(intel_base, "tls-certificate", category="ssl")

    if not risk_reasons:
        adicionar_nota(intel_base, "Nenhum risco relevante foi sinalizado pela heurística local.")
    else:
        for reason in risk_reasons:
            adicionar_nota(intel_base, reason)

    print(Font.Color.GREEN + "\n[+]" + Font.Color.WHITE + f" DOMAIN SEARCH COMPLETE: {dominio}")
    
    return resultado


def salvar_relatorio_dominio(resultado: dict) -> str:
    """Salva o resultado em arquivo texto e registra no histórico."""
    dominio = resultado["dominio"]
    pasta = f"GUI/Reports/Domain/{dominio}"
    import os
    os.makedirs(pasta, exist_ok=True)
    
    caminho = os.path.join(pasta, f"{dominio}_report.txt")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("Mr.Holmes Domain Report\n")
        f.write(f"Date: {datetime.now().isoformat()}\n")
        f.write(f"Domain: {dominio}\n")
        f.write(f"IP: {resultado.get('ip', 'N/A')}\n\n")
        
        f.write("GeoIP:\n")
        for k, v in resultado.get("geo", {}).items():
            f.write(f"  {k}: {v}\n")
        
        f.write("\nDNS Records:\n")
        for rtype, records in resultado.get("dns", {}).items():
            f.write(f"  {rtype}: {', '.join(records)}\n")
        
        f.write("\nHTTP Headers:\n")
        for k, v in resultado.get("headers", {}).items():
            f.write(f"  {k}: {v}\n")

        f.write("\nSSL/TLS:\n")
        for k, v in resultado.get("ssl", {}).items():
            if isinstance(v, list):
                f.write(f"  {k}: {', '.join(str(x) for x in v)}\n")
            else:
                f.write(f"  {k}: {v}\n")

        f.write("\nUptime:\n")
        for k, v in resultado.get("uptime", {}).items():
            f.write(f"  {k}: {v}\n")

        f.write("\nHosting:\n")
        for k, v in resultado.get("hosting", {}).items():
            f.write(f"  {k}: {v}\n")

        f.write("\nReverse IP:\n")
        for k, v in resultado.get("reverse_ip", {}).items():
            f.write(f"  {k}: {v}\n")

        f.write("\nOpen Ports:\n")
        for item in resultado.get("open_ports", []):
            f.write(f"  {item.get('port')}/{item.get('service')} - OPEN\n")

        f.write("\nCommon Subdomains:\n")
        for item in resultado.get("subdomains", {}).get("found", []):
            f.write(f"  {item.get('host')}: {item.get('ip')}\n")
        
        f.write("\nViewDNS Links:\n")
        for name, link in resultado.get("viewdns_links", {}).items():
            f.write(f"  {name}: {link}\n")

    History.save_search(
        "domain",
        dominio,
        country=resultado.get("geo", {}).get("country", ""),
        area=resultado.get("geo", {}).get("city", ""),
        carrier=resultado.get("hosting", {}).get("isp", ""),
        sites_found=len(resultado.get("subdomains", {}).get("found", [])),
        report_path=caminho,
    )
    
    return caminho
