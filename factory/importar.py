#!/usr/bin/env python3
"""
Importacion y fusion de las tres fuentes.

EL PROBLEMA QUE RESUELVE
    Claude Code, ChatGPT y el operador van a encontrar, inevitablemente,
    la MISMA oportunidad descrita con otras palabras. Si se cargan como
    dos filas distintas, el laboratorio se llena de duplicados y encima
    se pierde lo mas valioso: que dos investigaciones INDEPENDIENTES
    hayan llegado a lo mismo. Esa coincidencia es una señal fuerte y
    tiene que quedar registrada, no borrada.

COMO FUSIONA (y por que NO fusiona sola cuando duda)
    FUSION AUTOMATICA solo con coincidencia EXACTA de clave normalizada
    (problema + comprador + nicho, sin tildes ni palabras vacias). Ahi
    no hay duda posible: es la misma oportunidad.

      - NO crea fila nueva
      - suma evidencia, señales y competidores a la que ya existia
      - completa campos vacios, NUNCA pisa lo que ya tenia contenido

    PARA TODO LO DEMAS se MARCA el par como sospechoso y se deja que lo
    resuelva una persona. Se midio con casos reales que ninguna
    similitud difusa separa un duplicado verdadero de dos problemas
    parecidos:

        "fotografo no sabe cuanto cobrar" vs
        "fotografos no saben que precio poner"  -> 0.182  (SI es duplicado)
        "manicurista no sabe cuanto cobrar"     -> 0.164  (NO lo es)

    Con 0.018 de diferencia, cualquier umbral se equivoca. Y fusionar
    mal es el peor error posible aca: mezcla la evidencia de dos
    oportunidades distintas y hace desaparecer una, sin dejar rastro.
    Marcar de mas solo cuesta una revision de diez segundos.

        python3 laboratorio.py duplicados     # ver pendientes
        python3 laboratorio.py fusionar 5 3   # fusionar #5 en #3

FORMATOS ACEPTADOS
    JSON (uno o lista) con el formato simple del brief, y CSV plano
    para carga masiva a mano. Los nombres de campo aceptan alias
    (opportunity/titulo, market/target_country...) para que ni ChatGPT
    ni el operador tengan que memorizar el esquema exacto.
"""
import csv
import json
import sys
from pathlib import Path

from . import esquema as E

# Alias -> nombre real de columna. Lo que no este aca y no sea columna
# valida se guarda en notes en vez de descartarse en silencio.
ALIAS = {
    "opportunity": "_label", "oportunidad": "_label", "titulo": "_label",
    "title": "_label", "nombre": "_label",
    "niche": "niche", "nicho": "niche", "mercado": "niche",
    "subniche": "subniche", "subnicho": "subniche",
    "hypersubniche": "hypersubniche", "hipersubnicho": "hypersubniche",
    "problem": "problem", "problema": "problem",
    "target_buyer": "target_buyer", "comprador": "target_buyer",
    "buyer": "target_buyer", "publico": "target_buyer",
    "buyer_context": "buyer_context", "contexto": "buyer_context",
    "pain": "pain", "dolor": "pain",
    "frequency": "frequency", "frecuencia": "frequency",
    "current_solution": "current_solution", "solucion_actual": "current_solution",
    "product_concept": "potential_product", "potential_product": "potential_product",
    "producto": "potential_product", "concepto_producto": "potential_product",
    "product_format": "product_format", "formato": "product_format",
    "formato_producto": "product_format",
    "market": "target_country", "target_country": "target_country",
    "pais": "target_country", "country": "target_country",
    "source": "source", "fuente": "source",
    "notes": "notes", "notas": "notes",
    "date_collected": "date_collected", "fecha": "date_collected",
}

COLUMNAS_OP = {
    "niche", "subniche", "hypersubniche", "problem", "target_buyer",
    "buyer_context", "pain", "frequency", "current_solution",
    "potential_product", "product_format", "target_country", "source",
    "status", "notes", "date_collected", "is_demo",
}

# Alias de fuente: se escribe de mil formas, se guarda de uno solo.
ALIAS_FUENTE = {
    "chatgpt": "CHATGPT", "gpt": "CHATGPT", "openai": "CHATGPT",
    "source_b": "CHATGPT",
    "claude": "CLAUDE_CODE", "claude_code": "CLAUDE_CODE",
    "claudecode": "CLAUDE_CODE", "source_a": "CLAUDE_CODE",
    "human": "HUMAN_RESEARCH", "manual": "HUMAN_RESEARCH",
    "usuario": "HUMAN_RESEARCH", "human_research": "HUMAN_RESEARCH",
    "source_c": "HUMAN_RESEARCH", "operador": "HUMAN_RESEARCH",
}


def normalizar_fuente(valor, por_defecto="HUMAN_RESEARCH"):
    if not valor:
        return por_defecto
    v = str(valor).strip().lower().replace("-", "_").replace(" ", "_")
    if v.upper() in E.FUENTES:
        return v.upper()
    return ALIAS_FUENTE.get(v, por_defecto)


def _mapear(registro):
    """Traduce alias a columnas reales. Lo desconocido NO se tira: se
    acumula en notes, porque un campo que una fuente considero digno de
    mandar puede ser justo el dato que despues explique algo."""
    campos, extras, label = {}, [], None
    for k, v in registro.items():
        if v in (None, "", [], {}):
            continue
        destino = ALIAS.get(str(k).strip().lower())
        if destino == "_label":
            label = v
        elif destino in COLUMNAS_OP:
            campos[destino] = v
        elif str(k).lower() in ("evidence", "evidencia", "competitors",
                                "competidores", "prices", "precios",
                                "signals", "senales", "señales",
                                "blocked", "access_unavailable"):
            continue  # se procesan aparte
        else:
            extras.append(f"{k}: {v}")
    if label:
        extras.insert(0, f"oportunidad: {label}")
    if extras:
        campos["notes"] = ((campos.get("notes", "") + "\n") if campos.get("notes")
                           else "") + "\n".join(str(e) for e in extras)
    return campos


def _cargar_evidencia(con, oid, registro, fuente):
    """Carga la evidencia de un registro. Una evidencia que se declara
    DIRECT/INDIRECT sin URL NO se descarta: se degrada a INFERENCE y se
    deja anotado. Tirarla perderia informacion; aceptarla como
    observacion seria mentir sobre su solidez."""
    cargadas, degradadas = 0, 0
    for ev in (registro.get("evidence") or registro.get("evidencia") or []):
        if isinstance(ev, str):
            ev = {"claim": ev, "evidence_type": "HYPOTHESIS"}
        tipo = (ev.get("evidence_type") or ev.get("tipo") or "HYPOTHESIS").upper()
        url = ev.get("url") or ev.get("source_url")
        nota = ev.get("notes") or ev.get("notas")
        if tipo in E.EXIGEN_URL and not url:
            nota = ((nota + " | ") if nota else "") + \
                f"degradada de {tipo} a INFERENCE: vino sin URL"
            tipo = "INFERENCE"
            degradadas += 1
        if tipo not in E.TIPOS_EVIDENCIA:
            tipo = "HYPOTHESIS"
        E.agregar_evidencia(
            con, oid,
            claim=ev.get("claim") or ev.get("afirmacion") or "(sin afirmacion)",
            evidence_type=tipo,
            source=normalizar_fuente(ev.get("source"), fuente),
            evidence=ev.get("evidence") or ev.get("prueba"),
            url=url,
            dimension=ev.get("dimension") or ev.get("dimension_"),
            confidence=ev.get("confidence"),
            notes=nota,
            date_collected=ev.get("date_collected") or ev.get("fecha"))
        cargadas += 1
    return cargadas, degradadas


def _cargar_resto(con, oid, registro, fuente):
    n_sig = n_comp = 0
    for s in (registro.get("signals") or registro.get("senales")
              or registro.get("señales") or []):
        if isinstance(s, str):
            s = {"signal_type": "nota", "value": s}
        E.agregar_senal(
            con, oid,
            signal_type=s.get("signal_type") or s.get("tipo") or "desconocida",
            value=s.get("value") if s.get("value") is not None else s.get("valor"),
            source=normalizar_fuente(s.get("source"), fuente),
            source_url=s.get("source_url") or s.get("url"),
            confidence=s.get("confidence"),
            evidence_type=(s.get("evidence_type") or "").upper() or None,
            notes=s.get("notes"),
            date_collected=s.get("date_collected"))
        n_sig += 1

    # 'prices' sueltos entran como señales de precio: son datos de
    # mercado aunque no vengan atados a un competidor concreto.
    for p in (registro.get("prices") or registro.get("precios") or []):
        if isinstance(p, (int, float, str)):
            p = {"value": p}
        E.agregar_senal(
            con, oid, signal_type="price",
            value=p.get("value") if p.get("value") is not None else p.get("precio"),
            source=normalizar_fuente(p.get("source"), fuente),
            source_url=p.get("url"), notes=p.get("notes"))
        n_sig += 1

    for c in (registro.get("competitors") or registro.get("competidores") or []):
        if isinstance(c, str):
            c = {"name": c}
        E.agregar_competidor(
            con, oid, name=c.get("name") or c.get("nombre") or "(sin nombre)",
            source=normalizar_fuente(c.get("source"), fuente),
            country=c.get("country") or c.get("pais"),
            language=c.get("language") or c.get("idioma"),
            url=c.get("url"),
            product_type=c.get("product_type") or c.get("tipo"),
            price=c.get("price") if c.get("price") is not None else c.get("precio"),
            features=c.get("features") or c.get("caracteristicas") or [],
            reviews=c.get("reviews"),
            visible_sales_signal=c.get("visible_sales_signal") or c.get("ventas"),
            strengths=c.get("strengths") or c.get("fortalezas") or [],
            weaknesses=c.get("weaknesses") or c.get("debilidades") or [],
            confidence=c.get("confidence"))
        n_comp += 1

    # bloqueos declarados por la fuente
    for b in (registro.get("blocked") or registro.get("access_unavailable") or []):
        if isinstance(b, str):
            b = {"target": b}
        E.registrar_bloqueo(
            con, target=b.get("target") or "(sin detalle)",
            reason=b.get("reason") or "ACCESS_UNAVAILABLE",
            source=normalizar_fuente(b.get("source"), fuente), oid=oid)
    return n_sig, n_comp


def importar_registro(con, registro, fuente_por_defecto="HUMAN_RESEARCH",
                      es_demo=False, umbral_dedupe=0.12):
    """Importa UN registro. Devuelve un dict con lo que paso."""
    campos = _mapear(registro)
    fuente = normalizar_fuente(campos.get("source") or registro.get("source"),
                               fuente_por_defecto)
    campos["source"] = fuente
    if es_demo:
        campos["is_demo"] = 1
    if not campos.get("problem"):
        return {"ok": False, "motivo": "sin 'problem': no se puede deduplicar "
                                       "ni investigar una oportunidad sin problema"}
    campos.setdefault("niche", "SIN_CLASIFICAR")

    # FUSION AUTOMATICA: solo con coincidencia EXACTA de clave
    # normalizada. Se midio que ninguna similitud difusa separa de
    # forma confiable un duplicado real de dos problemas parecidos
    # (0.182 vs 0.164 en casos reales), y fusionar mal mezcla la
    # evidencia de dos oportunidades distintas y borra una.
    oid = E.buscar_exacto(con, campos["problem"],
                          campos.get("target_buyer", ""), campos["niche"])
    if oid:
        actual = con.execute("SELECT * FROM opportunities WHERE id=?",
                             (oid,)).fetchone()
        completar = {k: v for k, v in campos.items()
                     if k not in ("source", "is_demo", "notes")
                     and not actual[k]}
        if campos.get("notes"):
            completar["notes"] = ((actual["notes"] + "\n---\n") if actual["notes"]
                                  else "") + f"[{fuente}] {campos['notes']}"
        if completar:
            E.actualizar_oportunidad(con, oid, **completar)
        fusionada, sim, sospechosos = True, 1.0, []
    else:
        oid = E.agregar_oportunidad(con, **campos)
        fusionada, sim = False, 1.0
        # MARCAR sin fusionar: queda para que lo mire una persona
        sospechosos = E.candidatos_duplicado(
            con, oid, campos["problem"], campos.get("target_buyer", ""),
            campos["niche"], umbral_dedupe)
        for otro_id, s in sospechosos:
            E.marcar_duplicado(con, oid, otro_id, s)

    n_ev, n_deg = _cargar_evidencia(con, oid, registro, fuente)
    n_sig, n_comp = _cargar_resto(con, oid, registro, fuente)
    return {"ok": True, "id": oid, "fusionada": fusionada,
            "similitud": round(sim, 3), "evidencia": n_ev,
            "degradadas": n_deg, "senales": n_sig, "competidores": n_comp,
            "posibles_duplicados": sospechosos,
            "fuentes": E.fuentes_de(con, oid)}


def importar_json(con, ruta, fuente_por_defecto="HUMAN_RESEARCH", es_demo=False):
    datos = json.loads(Path(ruta).read_text(encoding="utf-8"))
    if isinstance(datos, dict):
        datos = datos.get("opportunities") or datos.get("oportunidades") or [datos]
    return [importar_registro(con, r, fuente_por_defecto, es_demo) for r in datos]


def importar_csv(con, ruta, fuente_por_defecto="HUMAN_RESEARCH", es_demo=False):
    """CSV plano: una oportunidad por fila, sin evidencia anidada.

    Pensado para carga rapida a mano. La evidencia se agrega despues
    por JSON o a mano -- meter evidencia estructurada en CSV obliga a
    columnas tipo evidence_1_url, evidence_2_url... que se vuelve
    ilegible enseguida.
    """
    with open(ruta, newline="", encoding="utf-8") as f:
        return [importar_registro(con, r, fuente_por_defecto, es_demo)
                for r in csv.DictReader(f)]


def importar(con, ruta, fuente_por_defecto="HUMAN_RESEARCH", es_demo=False):
    ruta = Path(ruta)
    if ruta.suffix.lower() == ".csv":
        return importar_csv(con, ruta, fuente_por_defecto, es_demo)
    return importar_json(con, ruta, fuente_por_defecto, es_demo)


def resumen_importacion(resultados):
    ok = [r for r in resultados if r.get("ok")]
    return {
        "recibidos": len(resultados),
        "importados": len(ok),
        "rechazados": len(resultados) - len(ok),
        "nuevos": sum(1 for r in ok if not r["fusionada"]),
        "fusionados": sum(1 for r in ok if r["fusionada"]),
        "evidencia": sum(r["evidencia"] for r in ok),
        "degradadas_por_falta_de_url": sum(r["degradadas"] for r in ok),
        "senales": sum(r["senales"] for r in ok),
        "competidores": sum(r["competidores"] for r in ok),
        "marcados_para_revisar": sum(len(r.get("posibles_duplicados") or [])
                                     for r in ok),
    }
