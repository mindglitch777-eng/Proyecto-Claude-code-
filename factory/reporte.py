#!/usr/bin/env python3
"""
Ranking y reportes del laboratorio.

EL RANKING NO ORDENA SOLO POR PUNTAJE
    Una oportunidad con 90 de puntaje y 0.1 de confianza esta arriba de
    la tabla por una corazonada bien escrita, no por evidencia. Ordenar
    solo por total_score haria que el laboratorio ascienda justo lo que
    menos se investigo.

    Por eso el orden es por puntaje AJUSTADO:

        ajustado = total_score * (0.4 + 0.6 * confidence)

    Una oportunidad sin nada de evidencia conserva el 40% de su
    puntaje: sigue visible como candidata a investigar, pero no le gana
    a una verificada. Con confianza 1.0 conserva el 100%.

    Y el reporte SIEMPRE muestra las tres columnas (puntaje, confianza,
    ajustado) para que se vea de donde sale el orden.
"""
import time
from pathlib import Path

from . import esquema as E
from . import puntaje as P

RAIZ = Path(__file__).parent.parent


def puntaje_ajustado(total, confidence):
    if total is None:
        return None
    c = confidence if confidence is not None else 0.0
    return round(total * (0.4 + 0.6 * c), 2)


def ranking(con, limite=None, status=None, incluir_demo=True, min_confianza=0.0):
    filas = []
    q = ("SELECT o.*, s.total_score, s.confidence, s.quadrant, s.demand, s.pain, "
         "s.market_size, s.competition, s.spanish_gap, s.factory_score, "
         "s.economics, s.contentability, s.sellerability, s.family_potential "
         "FROM opportunities o LEFT JOIN scores s ON s.opportunity_id=o.id "
         "WHERE o.status != 'REJECTED'")
    p = []
    if status:
        q += " AND o.status=?"
        p.append(status)
    if not incluir_demo:
        q += " AND o.is_demo=0"
    for f in con.execute(q, p):
        d = E.desempaquetar(f)
        conf = d.get("confidence") or 0.0
        if conf < min_confianza:
            continue
        d["ajustado"] = puntaje_ajustado(d.get("total_score"), conf)
        d["fuentes"] = E.fuentes_de(con, d["id"])
        d["n_evidencia"] = con.execute(
            "SELECT COUNT(*) c FROM evidence WHERE opportunity_id=?",
            (d["id"],)).fetchone()["c"]
        d["n_observaciones"] = con.execute(
            "SELECT COUNT(*) c FROM evidence WHERE opportunity_id=? AND "
            "evidence_type IN ('DIRECT','INDIRECT')", (d["id"],)).fetchone()["c"]
        filas.append(d)
    # None al final: lo no puntuado no compite con lo puntuado
    filas.sort(key=lambda x: (x["ajustado"] is not None, x["ajustado"] or 0),
               reverse=True)
    return filas[:limite] if limite else filas


def _marca_demo(fila):
    return " ⚠️ **DEMO**" if fila.get("is_demo") else ""


def tabla_ranking(filas, titulo="Ranking"):
    md = [f"\n## {titulo}\n",
          "| # | Oportunidad | Nicho | Puntaje | Confianza | Ajustado | Cuadrante | Fuentes | Obs. |",
          "|---|---|---|---|---|---|---|---|---|"]
    for i, f in enumerate(filas, 1):
        prob = (f["problem"] or "")[:60] + ("…" if len(f["problem"] or "") > 60 else "")
        md.append(
            f"| {i} | {prob}{_marca_demo(f)} | {f['niche']} | "
            f"{f.get('total_score') if f.get('total_score') is not None else '—'} | "
            f"{f.get('confidence') if f.get('confidence') is not None else '—'} | "
            f"{f.get('ajustado') if f.get('ajustado') is not None else '—'} | "
            f"{f.get('quadrant') or '—'} | {', '.join(f['fuentes']) or '—'} | "
            f"{f['n_observaciones']}/{f['n_evidencia']} |")
    return "\n".join(md)


def ficha(con, oid):
    """Ficha completa de una oportunidad, con toda su evidencia
    separada por tipo. Es lo que se lee antes de decidir si pasa a
    DEEP_RESEARCH o se descarta."""
    o = con.execute("SELECT * FROM opportunities WHERE id=?", (oid,)).fetchone()
    if not o:
        return f"No existe la oportunidad {oid}."
    o = E.desempaquetar(o)
    s = con.execute("SELECT * FROM scores WHERE opportunity_id=?", (oid,)).fetchone()
    s = dict(s) if s else {}

    md = [f"# {o['problem']}{_marca_demo(o)}\n"]
    if o.get("is_demo"):
        md.append("> **Esta es una fila de DEMOSTRACION.** Los datos son "
                  "inventados para mostrar el sistema funcionando. NO es "
                  "investigacion real y no debe usarse para decidir nada.\n")
    md += [
        f"- **Nicho:** {o['niche']} › {o.get('subniche') or '—'} › {o.get('hypersubniche') or '—'}",
        f"- **Comprador:** {o.get('target_buyer') or '—'}",
        f"- **Contexto:** {o.get('buyer_context') or '—'}",
        f"- **Dolor:** {o.get('pain') or '—'}",
        f"- **Frecuencia:** {o.get('frequency') or '—'}",
        f"- **Qué hace hoy sin nosotros:** {o.get('current_solution') or '—'}",
        f"- **Producto posible:** {o.get('potential_product') or '—'} "
        f"({o.get('product_format') or 'formato sin definir'})",
        f"- **País:** {o.get('target_country') or '—'}",
        f"- **Estado:** `{o['status']}`  ·  **Fuentes:** {', '.join(E.fuentes_de(con, oid)) or '—'}",
    ]

    if s:
        md.append("\n## Puntajes\n")
        md.append("| Dimensión | Valor |")
        md.append("|---|---|")
        for k in P.DIMENSIONES:
            v = s.get(k)
            extra = " _(no entra en el total)_" if k == "family_potential" else ""
            md.append(f"| {k}{extra} | {v if v is not None else '—'} |")
        md.append(f"| **TOTAL** | **{s.get('total_score') if s.get('total_score') is not None else '—'}** |")
        md.append(f"| Confianza | {s.get('confidence')} |")
        md.append(f"| Ajustado | {puntaje_ajustado(s.get('total_score'), s.get('confidence'))} |")
        md.append(f"| Cuadrante | `{s.get('quadrant') or '—'}` |")

    for tipo in E.TIPOS_EVIDENCIA:
        evs = E.evidencia_de(con, oid, tipo)
        if not evs:
            continue
        md.append(f"\n## Evidencia — {tipo}\n")
        for e in evs:
            linea = f"- **{e['claim']}**"
            if e.get("evidence"):
                linea += f" — {e['evidence']}"
            if e.get("url"):
                linea += f" — [fuente]({e['url']})"
            linea += f" · `{e['source']}`"
            if e.get("confidence") is not None:
                linea += f" · confianza {e['confidence']}"
            if e.get("notes"):
                linea += f" · _{e['notes']}_"
            md.append(linea)

    comps = [dict(f) for f in con.execute(
        "SELECT * FROM competitors WHERE opportunity_id=? ORDER BY id", (oid,))]
    if comps:
        md.append("\n## Competidores\n")
        md.append("| Nombre | Idioma | Precio | Tipo | Señal de ventas | Fuente |")
        md.append("|---|---|---|---|---|---|")
        for c in comps:
            nombre = f"[{c['name']}]({c['url']})" if c.get("url") else c["name"]
            md.append(f"| {nombre} | {c.get('language') or '—'} | "
                      f"{c.get('price') if c.get('price') is not None else '—'} | "
                      f"{c.get('product_type') or '—'} | "
                      f"{c.get('visible_sales_signal') or '—'} | {c['source']} |")

    sigs = [dict(f) for f in con.execute(
        "SELECT * FROM market_signals WHERE opportunity_id=? ORDER BY id", (oid,))]
    if sigs:
        md.append("\n## Señales de mercado\n")
        for g in sigs:
            linea = f"- `{g['signal_type']}` = **{g['value']}**"
            if g.get("source_url"):
                linea += f" — [fuente]({g['source_url']})"
            linea += f" · `{g['source']}`"
            md.append(linea)

    bloqueos = [dict(f) for f in con.execute(
        "SELECT * FROM access_log WHERE opportunity_id=? ORDER BY id", (oid,))]
    if bloqueos:
        md.append("\n## No se pudo consultar (ACCESS_UNAVAILABLE)\n")
        md.append("_Esto NO es evidencia de ausencia. Es una pregunta sin responder._\n")
        for b in bloqueos:
            md.append(f"- **{b['target']}** — {b['reason']} · `{b['source']}`")
    return "\n".join(md)


def reporte_general(con, incluir_demo=True):
    r = E.resumen(con)
    md = ["# Product Factory — estado del laboratorio\n",
          f"_Generado el {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}._\n"]

    if r["demo"]:
        md.append(f"> ⚠️ Hay **{r['demo']} fila(s) de DEMOSTRACION** en la base "
                  f"(datos inventados para probar el sistema). "
                  f"Se borran con `purgar-demo`.\n")

    md += [
        "\n## Resumen\n",
        "| Métrica | Valor |", "|---|---|",
        f"| Oportunidades reales | {r['reales']} |",
        f"| Oportunidades DEMO | {r['demo']} |",
        f"| **Con al menos una observación (DIRECT/INDIRECT)** | **{r['con_observacion']}** |",
        f"| Nichos distintos | {r['nichos']} |",
        f"| Bloqueos registrados (ACCESS_UNAVAILABLE) | {r['bloqueos']} |",
    ]
    md.append("\n_El número que importa es el de observaciones: 'tenemos N "
              "oportunidades' no dice nada si ninguna fue verificada._\n")

    if r["por_estado"]:
        md.append("\n## Por estado\n")
        md.append("| Estado | Cantidad |")
        md.append("|---|---|")
        for est in E.ESTADOS + [E.RECHAZADA]:
            if est in r["por_estado"]:
                md.append(f"| `{est}` | {r['por_estado'][est]} |")

    if r["evidencia_por_fuente"]:
        md.append("\n## Evidencia por fuente\n")
        md.append("| Fuente | Piezas de evidencia |")
        md.append("|---|---|")
        for f, c in sorted(r["evidencia_por_fuente"].items()):
            md.append(f"| `{f}` | {c} |")

    filas = ranking(con, incluir_demo=incluir_demo)
    if filas:
        md.append(tabla_ranking(filas, "Ranking (ordenado por puntaje ajustado)"))
        md.append("\n_Ajustado = puntaje × (0.4 + 0.6 × confianza). Una "
                  "oportunidad sin evidencia conserva el 40% de su puntaje: "
                  "sigue visible para investigar, pero no le gana a una "
                  "verificada._\n")

    bloqueos = [dict(f) for f in con.execute(
        "SELECT * FROM access_log ORDER BY id DESC LIMIT 30")]
    if bloqueos:
        md.append("\n## Lo que NO se pudo consultar\n")
        md.append("_Preguntas abiertas, no respuestas negativas._\n")
        md.append("| Qué | Por qué | Fuente |")
        md.append("|---|---|---|")
        for b in bloqueos:
            md.append(f"| {b['target']} | {b['reason']} | `{b['source']}` |")
    return "\n".join(md) + "\n"
