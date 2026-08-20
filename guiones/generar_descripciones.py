#!/usr/bin/env python3
"""
Genera las descripciones/caption listas para pegar en TikTok, una por
guion, en guiones/descripciones-tiktok.md.

Regla de MARCA.md: el caption ES SEO (la busqueda que queres capturar,
no un texto de venta), 1-2 hashtags, nunca mas de 5, nada de #fyp.

El link real todavia no existe (falta que el operador cree la cuenta
de Hotmart y conecte Netlify) -- se deja un placeholder bien marcado
para reemplazar en cuanto exista. TikTok no deja poner un link
clickeable en el caption salvo cuenta habilitada; aun asi conviene
escribirlo como texto (contexto + copiable) mas "link en bio".
"""
import glob
import json
from pathlib import Path

RAIZ = Path(__file__).parent

# 1-2 hashtags por tema, del pool chico y consistente de MARCA.md.
HASHTAGS = {
    "01": ["#insomnio", "#ansiedad"], "02": ["#relaciones", "#ansiedad"],
    "03": ["#decisiones", "#ansiedad"], "04": ["#ansiedad", "#estres"],
    "05": ["#ansiedad", "#estres"], "06": ["#relaciones", "#autoestima"],
    "07": ["#ansiedad", "#autoestima"], "08": ["#ansiedad", "#autoestima"],
    "09": ["#parejas", "#confianza"], "10": ["#autoestima", "#ansiedad"],
    "11": ["#trabajo", "#ansiedad"], "12": ["#relaciones", "#autoestima"],
    "13": ["#autoestima", "#ansiedad"], "14": ["#relaciones", "#autoestima"],
    "15": ["#relaciones", "#ansiedad"], "16": ["#autoestima", "#relaciones"],
    "17": ["#parejas", "#relaciones"], "18": ["#parejas", "#confianza"],
    "19": ["#familia", "#ansiedad"], "20": ["#ansiedad", "#autoestima"],
    "21": ["#trabajo", "#ansiedad"], "22": ["#relaciones", "#ansiedad"],
    "23": ["#ansiedad", "#estres"], "24": ["#relaciones", "#ansiedad"],
    "25": ["#confianza", "#relaciones"], "26": ["#parejas", "#confianza"],
    "27": ["#ansiedad", "#autoestima"],
}

LINK_PLACEHOLDER = "🔗 [LINK PENDIENTE — se completa cuando esté la cuenta de Hotmart] Comunidad El Corte, en Hotmart"


def hook_texto(cfg):
    seg = cfg["segmentos"][0]
    return seg.get("texto") or seg.get("narracion") or cfg.get("tema", "")


def main():
    filas = ["# Descripciones/caption para TikTok — listas para pegar\n",
             "Generado de `guiones/*.json`. El caption es SEO (la búsqueda que "
             "querés capturar, no venta) — regla de `MARCA.md`. Reemplazar el "
             "link placeholder apenas exista la cuenta de Hotmart.\n"]
    for f in sorted(glob.glob(str(RAIZ / "*.json"))):
        stem = Path(f).stem
        if stem.startswith(("generar_", "_demo")) or stem.endswith("-con-voz"):
            continue
        num = stem.split("-")[0]
        cfg = json.loads(Path(f).read_text(encoding="utf-8"))
        caption = hook_texto(cfg)
        tags = " ".join(HASHTAGS.get(num, ["#ansiedad", "#autoestima"]))
        filas.append(f"## {stem}\n")
        filas.append(f"```\n{caption}\n\n{tags}\n\n{LINK_PLACEHOLDER}\n```\n")
    out = RAIZ / "descripciones-tiktok.md"
    out.write_text("\n".join(filas), encoding="utf-8")
    print(f"OK: {out} ({len(filas)} bloques)")


if __name__ == "__main__":
    main()
