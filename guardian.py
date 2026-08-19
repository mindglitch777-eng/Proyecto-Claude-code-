#!/usr/bin/env python3
"""
Guardian del proyecto - CERO TOKENS, CERO COSTO.

Este script NO usa ningun modelo de IA. Es logica determinista pura:
cuenta, compara fechas y aplica las reglas del PROJECT_PLAN.
Corre gratis en GitHub Actions y es MAS confiable que un LLM para
esto (un script no alucina un numero).

Todo lo que este script resuelve es trabajo que Claude Code NO tiene
que hacer -- eso libera limite de uso para las decisiones que si
requieren criterio real.

Uso:
    python3 guardian.py check        # revisa todas las reglas
    python3 guardian.py set-start    # marca la fecha de inicio del proyecto
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

STATE_DIR = Path(__file__).parent / "state"
STATE_FILE = STATE_DIR / "state.json"
GUARDIAN_FILE = STATE_DIR / "guardian.json"

MAX_ACTIVOS = 3
CHECKPOINT_1_DIAS = 90    # 3 meses
CHECKPOINT_2_DIAS = 180   # 6 meses


def load_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def now():
    return datetime.now(timezone.utc)


def cmd_set_start():
    STATE_DIR.mkdir(exist_ok=True)
    data = load_json(GUARDIAN_FILE, {})
    if data.get("fecha_inicio"):
        print(f"Ya existe fecha de inicio: {data['fecha_inicio']}")
        return
    data["fecha_inicio"] = now().isoformat()
    GUARDIAN_FILE.write_text(json.dumps(data, indent=2))
    print(f"Fecha de inicio del proyecto: {data['fecha_inicio']}")


def cmd_check():
    state = load_json(STATE_FILE, {"projects": {}, "tasks": [], "costs": []})
    guardian = load_json(GUARDIAN_FILE, {})
    alertas = []

    # --- Regla 1: techo de 3 activos activos ---
    activos = [n for n, p in state.get("projects", {}).items()
               if p.get("status") == "active"]
    if len(activos) > MAX_ACTIVOS:
        alertas.append(
            f"TECHO SUPERADO: {len(activos)} activos activos "
            f"(maximo {MAX_ACTIVOS}). Cerrar o archivar antes de abrir otro."
        )

    # --- Regla 2: gates sin atender ---
    pendientes = [t for t in state.get("tasks", [])
                  if t.get("status") == "pending_approval"]
    for t in pendientes:
        try:
            creada = datetime.fromisoformat(t["created"])
            dias = (now() - creada).days
            if dias >= 3:
                alertas.append(
                    f"GATE SIN ATENDER hace {dias} dias: {t['title']}"
                )
        except Exception:
            pass

    # --- Regla 3: checkpoints de fracaso a nivel proyecto ---
    if guardian.get("fecha_inicio"):
        try:
            inicio = datetime.fromisoformat(guardian["fecha_inicio"])
            dias = (now() - inicio).days
            ingresos = sum(c.get("amount", 0) for c in state.get("costs", [])
                           if c.get("amount", 0) > 0)
            if dias >= CHECKPOINT_2_DIAS and ingresos <= 0:
                alertas.append(
                    f"CHECKPOINT 6 MESES ({dias} dias, ingresos ~0): "
                    "replantear el enfoque completo. No seguir ejecutando "
                    "el mismo plan esperando un resultado distinto."
                )
            elif dias >= CHECKPOINT_1_DIAS and ingresos <= 0:
                alertas.append(
                    f"CHECKPOINT 3 MESES ({dias} dias, ingresos ~0): "
                    "no agregar fases nuevas. Revisar que falla "
                    "(casi siempre es distribucion)."
                )
        except Exception:
            pass
    else:
        alertas.append(
            "Sin fecha de inicio. Corre: python3 guardian.py set-start"
        )

    # --- Reporte ---
    if not alertas:
        print("OK - Ninguna regla del proyecto esta siendo violada.")
        return 0
    print("=== ALERTAS DEL GUARDIAN ===")
    for a in alertas:
        print(f"- {a}")
    return 1


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    if sys.argv[1] == "check":
        sys.exit(cmd_check())
    elif sys.argv[1] == "set-start":
        cmd_set_start()
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
