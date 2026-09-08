#!/usr/bin/env python3
"""
Scraper de un VIDEO puntual de TikTok (no perfil). Distinto de
scraper_tiktok_perfil.py: la pagina de perfil trae userInfo.itemList
vacio (el feed se carga aparte, via API firmada), pero la pagina de un
video individual es un render de detalle de un solo item -- apuesta:
deberia traer el item completo embebido (incluida video.playAddr) bajo
una clave tipo "webapp.video-detail" en el mismo script de
rehidratacion, sin necesitar esa API aparte.

No hace login ni usa cuenta real -- ver docstring de scraper.py.

Uso:
    python3 fabrica/research/scraper_tiktok_video.py <url_video> <archivo_salida.json>
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


def extraer_item(datos: dict) -> dict | None:
    scope = datos.get('__DEFAULT_SCOPE__', {})
    for clave, valor in scope.items():
        if 'video-detail' not in clave:
            continue
        if not isinstance(valor, dict):
            continue
        item = valor.get('itemInfo', {}).get('itemStruct')
        if isinstance(item, dict):
            return item
    return None


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
        'item': None,
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
            item = extraer_item(datos)
            if item is not None:
                video = item.get('video', {})
                resumen = {
                    'id': item.get('id'),
                    'desc': item.get('desc'),
                    'duracion_seg': video.get('duration'),
                    'play_addr': video.get('playAddr'),
                    'download_addr': video.get('downloadAddr'),
                    'cover': video.get('cover'),
                    'stats': item.get('stats') or item.get('statsV2'),
                    'autor': (item.get('author') or {}).get('uniqueId'),
                }
                resultado.update(metodo=metodo, exito=True, item=resumen, error=None)
                break
            else:
                scope = datos.get('__DEFAULT_SCOPE__', {})
                resultado['error'] = (resultado['error'] or '') + f' | {metodo}: JSON encontrado pero sin item reconocible'
                resultado['debug_claves_scope'] = list(scope.keys())
        except Exception as e:
            resultado['error'] = (resultado['error'] or '') + f' | {metodo} fallo: {e}'

    with open(salida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(json.dumps(resultado, ensure_ascii=False, indent=2)[:3000])
    return 0 if resultado['exito'] else 2


if __name__ == '__main__':
    sys.exit(main())
