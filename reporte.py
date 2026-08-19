#!/usr/bin/env python3
"""
Reporte de portafolio - CERO TOKENS.

Consolida ingresos, costos y actividad de cada activo y los ordena por
rendimiento real. Responde la pregunta que importa: ¿donde conviene
poner mas esfuerzo y que conviene archivar?

Logica determinista pura. Ningun LLM involucrado.

Uso:
    python3 reporte.py                          # muestra el reporte
    python3 reporte.py ingreso <activo> <monto> # registra un ingreso real
    python3 reporte.py costo <activo> <monto>   # registra un costo real
    python3 reporte.py horas <activo> <horas>   # registra horas invertidas
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

STATE_DIR = Path(__file__).parent / "state"
STATE_FILE = STATE_DIR / "state.json"


def load_state():
    STATE_DIR.mkdir(exist_ok=True)
    if not STATE_FILE.exists():
        return {"projects": {}, "tasks": [], "costs": []}
    return json.loads(STATE_FILE.read_text())


def save_state(state):
    STATE_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def now():
    return datetime.now(timezone.utc).isoformat()


def registrar(tipo, activo, monto):
    state = load_state()
    state.setdefault("costs", []).append({
        "tipo": tipo,
        "activo": activo,
        "amount": float(monto),
        "fecha": now(),
    })
    save_state(state)
    print(f"Registrado: {tipo} de {monto} en '{activo}'")


def reporte():
    state = load_state()
    registros = state.get("costs", [])
    if not registros:
        print("Sin datos registrados todavia.")
        print("Usa: python3 reporte.py ingreso <activo> <monto>")
        return

    activos = {}
    for r in registros:
        nombre = r.get("activo", "sin-nombre")
        a = activos.setdefault(nombre, {"ingresos": 0.0, "costos": 0.0, "horas": 0.0})
        tipo = r.get("tipo", "costo")
        monto = r.get("amount", 0)
        if tipo == "ingreso":
            a["ingresos"] += monto
        elif tipo == "horas":
            a["horas"] += monto
        else:
            a["costos"] += monto

    filas = []
    for nombre, a in activos.items():
        neto = a["ingresos"] - a["costos"]
        por_hora = (neto / a["horas"]) if a["horas"] > 0 else None
        filas.append((nombre, a["ingresos"], a["costos"], neto, a["horas"], por_hora))

    # Ordenar por neto por hora (el dato que realmente decide donde
    # poner esfuerzo). Los sin horas registradas van al final.
    filas.sort(key=lambda f: (f[5] is None, -(f[5] or 0)))

    print("=== REPORTE DE PORTAFOLIO ===\n")
    print(f"{'Activo':<22}{'Ingr.':>9}{'Costo':>9}{'Neto':>9}{'Hs':>7}{'$/h':>9}")
    print("-" * 65)
    for nombre, ing, cos, neto, hs, ph in filas:
        ph_txt = f"{ph:.2f}" if ph is not None else "s/d"
        print(f"{nombre[:21]:<22}{ing:>9.2f}{cos:>9.2f}{neto:>9.2f}{hs:>7.1f}{ph_txt:>9}")

    total_neto = sum(f[3] for f in filas)
    print("-" * 65)
    print(f"{'TOTAL NETO':<22}{'':>27}{total_neto:>9.2f}")

    # Señales accionables, sin IA: reglas simples.
    print("\n=== SEÑALES ===")
    hubo = False
    for nombre, ing, cos, neto, hs, ph in filas:
        if ing == 0 and hs >= 20:
            print(f"- '{nombre}': {hs:.0f}h invertidas, 0 ingresos. "
                  "Revisar distribucion o considerar archivar.")
            hubo = True
        elif ph is not None and ph > 0 and ph == max(
                (f[5] for f in filas if f[5] is not None), default=0):
            print(f"- '{nombre}': mejor rendimiento por hora (${ph:.2f}/h). "
                  "Candidato a replicar (ver protocolo de replicacion).")
            hubo = True
    if not hubo:
        print("- Sin señales claras todavia. Faltan mas datos reales.")


def main():
    if len(sys.argv) == 1:
        reporte()
    elif len(sys.argv) == 4 and sys.argv[1] in ("ingreso", "costo", "horas"):
        registrar(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
