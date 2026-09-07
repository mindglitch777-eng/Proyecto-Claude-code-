#!/usr/bin/env python3
"""
Scraper real con Scrapling (biblioteca real, D4Vinci/Scrapling en
GitHub) -- primer uso concreto: leer publicaciones publicas de
Instagram/TikTok/etc. que este sandbox de Claude Code bloquea a nivel
de proxy de red, pero que un runner de GitHub Actions (salida a
internet normal) SI puede alcanzar.

No hace login ni usa ninguna cuenta real -- solo lee lo que la pagina
publica sin autenticarse (meta tags Open Graph que las redes sociales
ya exponen para que WhatsApp/Twitter/etc. armen la vista previa del
link, que es la misma informacion que veria alguien sin cuenta). Esto
es una eleccion deliberada: intentar loguearse con una cuenta real
violaria los terminos de servicio de la plataforma y arriesgaria esa
cuenta -- no se hace.

Estrategia en dos pasos (barato primero, pesado despues):
  1. Fetcher.get() -- pedido HTTP simple, sin navegador. Rapido. Basta
     para leer los meta tags og:* en la mayoria de paginas publicas.
  2. Si el paso 1 no trae nada util (pagina vacia, bloqueo, redirect a
     login), StealthyFetcher.fetch() -- navegador con modo sigiloso
     anti-deteccion, mas lento pero mas resistente.

Uso:
    python3 fabrica/research/scraper.py <url> <archivo_salida.json>
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone


def extraer_meta(pagina) -> dict:
    """Lee los meta tags Open Graph reales de la pagina -- la misma
    info que arma la vista previa de un link, disponible sin login."""
    def meta(prop: str) -> str | None:
        vals = pagina.css(f'meta[property="{prop}"]::attr(content)').getall()
        return vals[0] if vals else None

    return {
        'og_title': meta('og:title'),
        'og_description': meta('og:description'),
        'og_image': meta('og:image'),
        'og_video': meta('og:video'),
        'og_site_name': meta('og:site_name'),
    }


def tiene_contenido_util(meta: dict) -> bool:
    return bool(meta.get('og_title') or meta.get('og_description'))


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
        'meta': {},
        'error': None,
    }

    from scrapling.fetchers import Fetcher, StealthyFetcher

    # Paso 1: HTTP simple, sin navegador -- barato.
    try:
        pagina = Fetcher.get(url, stealthy_headers=True)
        meta = extraer_meta(pagina)
        if tiene_contenido_util(meta):
            resultado.update(metodo='fetcher_simple', exito=True, meta=meta)
        else:
            resultado['error'] = 'fetcher_simple: pagina sin meta tags utiles (posible bloqueo/redirect a login)'
    except Exception as e:
        resultado['error'] = f'fetcher_simple fallo: {e}'

    # Paso 2: si el primero no trajo nada util, navegador sigiloso.
    if not resultado['exito']:
        try:
            pagina = StealthyFetcher.fetch(url, solve_cloudflare=True, headless=True)
            meta = extraer_meta(pagina)
            if tiene_contenido_util(meta):
                resultado.update(metodo='stealthy_fetcher', exito=True, meta=meta, error=None)
            else:
                resultado['error'] = (resultado['error'] or '') + ' | stealthy_fetcher: tampoco trajo meta tags utiles'
        except Exception as e:
            resultado['error'] = (resultado['error'] or '') + f' | stealthy_fetcher fallo: {e}'

    with open(salida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(json.dumps(resultado, ensure_ascii=False, indent=2))
    return 0 if resultado['exito'] else 2


if __name__ == '__main__':
    sys.exit(main())
