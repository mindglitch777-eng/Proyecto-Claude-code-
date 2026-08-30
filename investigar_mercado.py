#!/usr/bin/env python3
"""
Analisis de mercado EXHAUSTIVO, corrido desde el runner (internet
completo) -- no desde la sesion de Claude Code, por pedido explicito
del operador ("no desde Claude... si desde github").

QUE RESPONDE
    1. Existe ya alguien vendiendo un "kit de reservas/seña por
       WhatsApp" (o equivalente) para servicios? En Hotmart (nuestra
       plataforma) y en la web en general.
    2. Cual es el volumen real de gente buscando esto en español
       (demanda medida, no intuicion) -- Google Trends.
    3. Que tan saturado esta el contenido de "ingresos pasivos con
       productos digitales" en general -- para no repetir el error
       de camino B puro.

FUENTES (todas reales, sin login, sin clave)
    - Google Trends (via pytrends): demanda de busqueda medida en el
      tiempo, por pais hispanohablante.
    - DuckDuckGo HTML y Bing HTML: resultados organicos reales, con
      URL citable cada uno. Dos motores para no depender de uno solo.
    - Hotmart: intento de catalogo publico (best-effort -- Hotmart no
      publica una API de catalogo documentada, asi que si la pagina
      no responde en un formato esperado se anota como no disponible
      en vez de inventar resultados).

NO USA TIKTOK DIRECTO: TikTok bloquea activamente el scraping
programatico y no tiene API publica sin aprobacion de partner. Pedir
esto seria fabricar datos. Se mide demanda e intencion de compra por
otras vias (Trends, buscadores, marketplaces reales) en su lugar, y se
dice esto explicitamente para no quedar como un hueco escondido.

Escribe ANALISIS_MERCADO.md con TODO, fuentes incluidas.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).parent
UA_HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/124.0.0.0 Safari/537.36"),
    "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
}

# Las palabras clave centrales que hay que validar: el producto
# candidato (kit de reservas/seña) Y el mensaje general (ingresos
# pasivos con productos digitales), para chequear saturacion de los
# dos por separado.
CONSULTAS = [
    "kit de reservas por whatsapp para negocios",
    "cobrar seña por whatsapp clientes",
    "plantillas whatsapp para no perder turnos",
    "como evitar que los clientes falten al turno",
    "guia pdf para barberos peluquerias ganar mas",
    "ingresos pasivos productos digitales españa latinoamerica",
    "como vender guias digitales en hotmart",
    "curso vender infoproductos tiktok",
]

# Ronda 2: verificar si CADA nicho tiene ya el mismo problema que
# aparecio en barberia (competencia existente en Hotmart), sin asumir
# que barberia fue un caso aislado.
NICHOS_A_VERIFICAR = ["barberos", "manicuristas", "entrenadores personales",
                      "nutricionistas", "veterinarias"]

# Ronda 2: ideas de producto NUEVAS a testear con los mismos criterios
# que el kit de whatsapp -- ninguna elegida de antemano, todas se miden
# igual y se descartan si la evidencia no las sostiene.
CANDIDATOS_NUEVOS = [
    "plantillas canva para promocionar salon de belleza",
    "calculadora de precios y rentabilidad para salones",
    "kit de contratos para profesionales independientes argentina",
    "guia para subir precios sin perder clientes",
    "catalogo de diseños de uñas para mostrar clientas",
    "como cobrar en dolares freelance argentina",
    "plantillas de presupuestos profesionales pdf",
]


def _fetch(url, timeout=25):
    pedido = urllib.request.Request(url, headers=UA_HEADERS)
    with urllib.request.urlopen(pedido, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")


def buscar_duckduckgo(query, limite=8, intentos=2):
    url = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": query})
    ultimo_err = None
    for intento in range(intentos):
        try:
            html = _fetch(url)
        except Exception as e:
            ultimo_err = str(e)
            time.sleep(8 + intento * 8)
            continue
        items = []
        for m in re.finditer(
                r'<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', html, re.S):
            href, titulo = m.group(1), re.sub("<[^>]+>", "", m.group(2)).strip()
            real = urllib.parse.parse_qs(urllib.parse.urlparse(href).query).get("uddg")
            href = real[0] if real else href
            if titulo and href.startswith("http"):
                items.append({"titulo": titulo, "url": href})
            if len(items) >= limite:
                break
        if items:
            return items, None
        if "anomaly" in html.lower() or "unusual traffic" in html.lower():
            ultimo_err = "DuckDuckGo detecto trafico automatizado y corto los resultados"
            break
        ultimo_err = "sin resultados en el HTML (posible limite de pedidos)"
        time.sleep(8 + intento * 8)
    return [], ultimo_err


def buscar_bing(query, limite=8, intentos=2):
    url = "https://www.bing.com/search?" + urllib.parse.urlencode({"q": query})
    ultimo_err = None
    for intento in range(intentos):
        try:
            html = _fetch(url)
        except Exception as e:
            ultimo_err = str(e)
            time.sleep(6 + intento * 6)
            continue
        items = []
        # Bing casi siempre pone clase/id en el <h2> (por eso el regex
        # original, que exigia <h2> pelado, no matcheaba nunca). Se
        # relaja a <h2 CUALQUIER-COSA> y ademas se prueba el patron
        # alternativo <li class="b_algo">...<a href=...>.
        patrones = [
            r'<h2[^>]*><a href="([^"]+)"[^>]*>(.*?)</a></h2>',
            r'<li class="b_algo"[^>]*>.*?<a href="([^"]+)"[^>]*>(.*?)</a>',
        ]
        for pat in patrones:
            for m in re.finditer(pat, html, re.S):
                href, titulo = m.group(1), re.sub("<[^>]+>", "", m.group(2)).strip()
                if titulo and href.startswith("http") and "bing.com" not in href:
                    items.append({"titulo": titulo, "url": href})
                if len(items) >= limite:
                    break
            if items:
                break
        if items:
            return items, None
        # HTML vino pero sin matches: puede ser que Bing sirvio una
        # pagina de verificacion/bloqueo en vez de resultados.
        if "cAPTCHA" in html or "captcha" in html.lower():
            ultimo_err = "Bing pidio verificacion (captcha), no se pudo leer"
            break
        ultimo_err = "HTML recibido pero sin resultados reconocibles (estructura distinta a la esperada)"
        time.sleep(6 + intento * 6)
    return [], ultimo_err


def buscar_hotmart(query, limite=8):
    """Best-effort: Hotmart no publica API de catalogo documentada.
    Se intenta su buscador web publico; si el HTML no trae lo esperado
    (cambio de estructura, bloqueo, JS-only), se informa como no
    disponible en vez de inventar resultados."""
    url = "https://hotmart.com/es/marketplace?" + urllib.parse.urlencode({"q": query})
    try:
        html = _fetch(url)
    except Exception as e:
        return [], str(e)
    # El marketplace de Hotmart renderiza con JS: si no aparece nada
    # reconocible en el HTML crudo, se marca como no disponible.
    if "marketplace" not in html.lower() or len(html) < 2000:
        return [], "la pagina requiere JavaScript, no se pudo leer el catalogo crudo"
    titulos = re.findall(r'<h3[^>]*>(.*?)</h3>', html, re.S)
    items = [{"titulo": re.sub("<[^>]+>", "", t).strip(), "url": url}
            for t in titulos[:limite] if t.strip()]
    return items, (None if items else "sin resultados reconocibles en el HTML")


def verificar_competencia_nicho(nicho, intentos=2):
    """Busca site:hotmart.com 'guia para <nicho>' -- prueba directa de
    si YA existe una guia de gestion de negocio para ese oficio en la
    plataforma donde vamos a vender, no una suposicion."""
    consulta = f'site:hotmart.com "guía para {nicho}" OR "guia para {nicho}"'
    return buscar_duckduckgo(consulta, limite=5, intentos=intentos)


def medir_trends(terminos, geo=""):
    try:
        from pytrends.request import TrendReq
    except ImportError as e:
        return None, f"pytrends no instalado ({e})"
    try:
        py = TrendReq(hl="es-ES", tz=180)
        py.build_payload(terminos, timeframe="today 12-m", geo=geo)
        df = py.interest_over_time()
        if df is None or df.empty:
            return None, "sin datos de Trends para estos terminos/region"
        promedio = {t: round(float(df[t].mean()), 1) for t in terminos if t in df.columns}
        pico = {t: int(df[t].max()) for t in terminos if t in df.columns}
        return {"promedio": promedio, "pico": pico}, None
    except Exception as e:
        return None, str(e)


def main():
    md = ["# Análisis de mercado — investigación exhaustiva\n",
          f"_Generado desde el runner el {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}._\n",
          "\n## Aviso metodológico\n",
          "No se pudo medir TikTok directamente: bloquea el scraping "
          "programático y no tiene API pública sin aprobación de partner "
          "verificada. Fabricar ese dato seria peor que no tenerlo. En su "
          "lugar se mide **demanda de búsqueda real** (Google Trends) e "
          "**intención de compra existente** (qué se vende ya, en Hotmart y "
          "en la web general) — son proxies honestos, no lo mismo, pero "
          "reales y citables.\n"]

    # --- Demanda medida ---
    md.append("\n## Demanda real (Google Trends, 12 meses, hispanohablante)\n")
    for geo, nombre in (("AR", "Argentina"), ("MX", "México"), ("", "Global hispano, sin filtro de país")):
        terminos = ["ingresos pasivos", "vender por internet", "productos digitales"]
        datos, err = None, None
        for intento in range(3):
            datos, err = medir_trends(terminos, geo=geo)
            if datos:
                break
            espera = 25 * (intento + 1)
            print(f"  Trends [{nombre}] fallo ({err}), reintento en {espera}s...")
            time.sleep(espera)
        md.append(f"\n### {nombre}\n")
        if err and not datos:
            md.append(f"_No se pudo medir despues de reintentos: {err}_\n")
        else:
            md.append("| Término | Promedio (0-100) | Pico (0-100) |")
            md.append("|---|---|---|")
            for t in terminos:
                md.append(f"| {t} | {datos['promedio'].get(t,'?')} | {datos['pico'].get(t,'?')} |")
        time.sleep(15)  # entre geos: Trends banea rapido pedidos seguidos

    # --- Competencia real (que existe ya) ---
    for consulta in CONSULTAS:
        md.append(f"\n## \"{consulta}\"\n")
        for nombre, fn in (("DuckDuckGo", buscar_duckduckgo), ("Bing", buscar_bing)):
            items, err = fn(consulta)
            md.append(f"\n**{nombre}:**\n")
            if err:
                md.append(f"_No se pudo consultar: {err}_\n")
            elif not items:
                md.append("_Sin resultados._\n")
            else:
                for it in items:
                    md.append(f"- [{it['titulo']}]({it['url']})")
            time.sleep(9)  # espacio real entre pedidos: la corrida
                           # anterior con 1s gatillo el limite de DDG y
                           # probablemente el bloqueo de Bing tambien

    md.append("\n\n# RONDA 2 — verificacion por nicho + candidatos nuevos\n")
    md.append("\n## ¿Ya existe una guía de gestión de negocio para cada oficio en Hotmart?\n")
    for nicho in NICHOS_A_VERIFICAR:
        items, err = verificar_competencia_nicho(nicho)
        md.append(f"\n### {nicho}\n")
        if err:
            md.append(f"_No se pudo verificar: {err}_\n")
        elif not items:
            md.append("**Sin resultados — no se encontro una guia existente para este oficio.**\n")
        else:
            md.append("**Ya existe(n):**\n")
            for it in items:
                md.append(f"- [{it['titulo']}]({it['url']})")
        time.sleep(9)

    md.append("\n## Candidatos de producto nuevos — misma prueba que el kit de WhatsApp\n")
    for consulta in CANDIDATOS_NUEVOS:
        md.append(f"\n### \"{consulta}\"\n")
        items, err = buscar_duckduckgo(consulta)
        if err:
            md.append(f"_No se pudo consultar: {err}_\n")
        elif not items:
            md.append("**Sin resultados — hueco real, sin competencia detectada.**\n")
        else:
            for it in items:
                md.append(f"- [{it['titulo']}]({it['url']})")
        time.sleep(9)

    md.append("\n## Hotmart — catálogo (best-effort)\n")
    for consulta in ("reservas whatsapp", "no show clientes", "seña turno negocio"):
        items, err = buscar_hotmart(consulta)
        md.append(f"\n**\"{consulta}\":**\n")
        if err:
            md.append(f"_{err}_\n")
        elif not items:
            md.append("_Sin resultados reconocibles._\n")
        else:
            for it in items:
                md.append(f"- {it['titulo']}")

    Path("ANALISIS_MERCADO.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print("Escrito ANALISIS_MERCADO.md")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
