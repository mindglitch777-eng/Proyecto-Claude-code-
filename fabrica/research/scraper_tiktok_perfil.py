#!/usr/bin/env python3
"""
Scraper especifico de perfil de TikTok -- mas resolutivo que leer solo
meta tags Open Graph (que en TikTok no traen la lista de videos).

TikTok manda TODA la data real del perfil (lista de videos, stats,
duracion, hasta URLs de reproduccion) incrustada en un <script
id="__UNIVERSAL_DATA_FOR_REHYDRATION__"> dentro del HTML crudo que
sirve el servidor -- no requiere ejecutar JS ni login, es la misma
data con la que la pagina se arma del lado del cliente. Esto es
publico: cualquiera sin cuenta que abra la pagina del perfil la recibe.

No hace login ni usa cuenta real -- ver docstring de scraper.py para la
misma politica.

Uso:
    python3 fabrica/research/scraper_tiktok_perfil.py <url_perfil> <archivo_salida.json>
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone


def extraer_json_rehidratacion(html: str) -> dict | None:
    m = re.search(
        r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>',
        html, re.DOTALL,
    )
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return None


def extraer_videos(datos: dict) -> list[dict]:
    """Navega la estructura real de TikTok (default.__DEFAULT_SCOPE__ ->
    webapp.user-detail / webapp.video-detail) buscando la lista de
    videos del perfil con su data real (id, descripcion, stats, y las
    URLs de video si estan presentes)."""
    videos: list[dict] = []
    scope = datos.get('__DEFAULT_SCOPE__', {})
    for clave, valor in scope.items():
        if 'user-detail' not in clave and 'item-list' not in clave and 'user-post' not in clave:
            continue
        # Distintas claves segun la version de la pagina -- buscar
        # cualquier lista de "itemList" o "items" con forma de video.
        candidatos = []
        if isinstance(valor, dict):
            candidatos.append(valor.get('itemList'))
            candidatos.append(valor.get('items'))
            userinfo = valor.get('userInfo')
            if isinstance(userinfo, dict):
                candidatos.append(userinfo.get('itemList'))
        for lista in candidatos:
            if isinstance(lista, list):
                for item in lista:
                    if not isinstance(item, dict):
                        continue
                    video = item.get('video', {})
                    stats = item.get('stats', {})
                    videos.append({
                        'id': item.get('id'),
                        'desc': item.get('desc'),
                        'duracion_seg': video.get('duration'),
                        'play_addr': (video.get('playAddr') or video.get('downloadAddr')),
                        'cover': video.get('cover'),
                        'likes': stats.get('diggCount'),
                        'comentarios': stats.get('commentCount'),
                        'compartidos': stats.get('shareCount'),
                        'vistas': stats.get('playCount'),
                    })
    return videos


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    url, salida = sys.argv[1], sys.argv[2]

    resultado = {
        'url': url,
        'fecha_utc': datetime.now(timezone.utc).isoformat(),
        'metodo': None,
        'exito': False,
        'videos': [],
        'error': None,
    }

    from scrapling.fetchers import Fetcher, StealthyFetcher

    for metodo, obtener in (
        ('fetcher_simple', lambda: Fetcher.get(url, stealthy_headers=True)),
        ('stealthy_fetcher', lambda: StealthyFetcher.fetch(url, solve_cloudflare=True, headless=True)),
    ):
        try:
            pagina = obtener()
            html = pagina.html_content if hasattr(pagina, 'html_content') else str(pagina)
            datos = extraer_json_rehidratacion(html)
            if datos is None:
                resultado['error'] = (resultado['error'] or '') + f' | {metodo}: no se encontro el script de rehidratacion'
                continue
            videos = extraer_videos(datos)
            if videos:
                resultado.update(metodo=metodo, exito=True, videos=videos, error=None)
                break
            else:
                resultado['error'] = (resultado['error'] or '') + f' | {metodo}: JSON encontrado pero sin lista de videos reconocible'
        except Exception as e:
            resultado['error'] = (resultado['error'] or '') + f' | {metodo} fallo: {e}'

    with open(salida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(json.dumps(resultado, ensure_ascii=False, indent=2)[:3000])
    return 0 if resultado['exito'] else 2


if __name__ == '__main__':
    sys.exit(main())
