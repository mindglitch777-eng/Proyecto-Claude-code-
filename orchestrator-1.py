#!/usr/bin/env python3
"""
Orquestador Central (Modulo 1) - version minima funcional.

Gestiona una cola de tareas y el estado de proyectos en un JSON local.
Diseñado para que Claude Code lo lea/actualice en cada sesion.

Uso:
    python orchestrator.py status
    python orchestrator.py add "Investigar nicho: planners de productividad"
    python orchestrator.py request-approval "Publicar producto X en Gumroad"
    python orchestrator.py list
    python orchestrator.py complete <task_id>
    python orchestrator.py log "Decision: empezamos con plantillas Notion"
    python orchestrator.py notify "Mensaje libre a Telegram"
"""

import json
import os
import sys
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path

STATE_DIR = Path(__file__).parent / "state"
STATE_FILE = STATE_DIR / "state.json"
LOG_FILE = STATE_DIR / "log.md"

DEFAULT_STATE = {
    "projects": {
        "digital_products": {"status": "active", "phase": "research"}
    },
    "tasks": [],
    "costs": [],
}


def load_state():
    STATE_DIR.mkdir(exist_ok=True)
    if not STATE_FILE.exists():
        save_state(DEFAULT_STATE)
        return dict(DEFAULT_STATE)
    return json.loads(STATE_FILE.read_text())


def save_state(state):
    STATE_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def now():
    return datetime.now(timezone.utc).isoformat()


def notify_telegram(message):
    """Envia un mensaje a Telegram si TELEGRAM_BOT_TOKEN/CHAT_ID estan
    configurados como variables de entorno. Si no estan, no hace nada
    (no rompe el flujo por falta de notificaciones configuradas)."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({"chat_id": chat_id, "text": message}).encode()
    try:
        urllib.request.urlopen(url, data=data, timeout=10)
        return True
    except Exception as e:
        print(f"No se pudo notificar por Telegram: {e}")
        return False


def cmd_status(state):
    pending_approval = [t for t in state["tasks"] if t["status"] == "pending_approval"]
    if pending_approval:
        print("=== NECESITA TU APROBACION ===")
        for t in pending_approval:
            print(f"  [{t['id'][:8]}] {t['title']}")
        print()
    print("=== Estado del sistema ===")
    for name, proj in state["projects"].items():
        print(f"- {name}: {proj['status']} (fase: {proj['phase']})")
    pending = [t for t in state["tasks"] if t["status"] == "pending"]
    print(f"\nTareas pendientes: {len(pending)}")
    for t in pending[:5]:
        print(f"  [{t['id'][:8]}] {t['title']}")
    total_cost = sum(c["amount"] for c in state["costs"])
    print(f"\nCosto acumulado registrado: ${total_cost:.2f}")


def cmd_add(state, title):
    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "status": "pending",
        "created": now(),
    }
    state["tasks"].append(task)
    save_state(state)
    print(f"Tarea agregada [{task['id'][:8]}]: {title}")


def cmd_request_approval(state, title):
    """Crea una tarea marcada como 'necesita aprobacion' y notifica de
    inmediato por Telegram si esta configurado -- para gates reales
    (gastar, publicar, contactar) que no deben esperar a que el
    operador abra la app por su cuenta."""
    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "status": "pending_approval",
        "created": now(),
    }
    state["tasks"].append(task)
    save_state(state)
    notified = notify_telegram(f"⚠️ Necesita tu aprobacion: {title}")
    print(f"Aprobacion solicitada [{task['id'][:8]}]: {title}")
    if not notified:
        print("(Telegram no configurado -- revisa 'status' manualmente)")


def cmd_list(state):
    for t in state["tasks"]:
        print(f"[{t['id'][:8]}] ({t['status']}) {t['title']}")


def cmd_complete(state, task_id_prefix):
    for t in state["tasks"]:
        if t["id"].startswith(task_id_prefix):
            t["status"] = "done"
            t["completed"] = now()
            save_state(state)
            print(f"Completada: {t['title']}")
            return
    print("Tarea no encontrada.")


def cmd_log(entry):
    STATE_DIR.mkdir(exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(f"\n## {now()}\n{entry}\n")
    print("Registrado en log.md")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    state = load_state()
    cmd = sys.argv[1]
    if cmd == "status":
        cmd_status(state)
    elif cmd == "add":
        cmd_add(state, " ".join(sys.argv[2:]))
    elif cmd == "request-approval":
        cmd_request_approval(state, " ".join(sys.argv[2:]))
    elif cmd == "list":
        cmd_list(state)
    elif cmd == "complete":
        cmd_complete(state, sys.argv[2])
    elif cmd == "log":
        cmd_log(" ".join(sys.argv[2:]))
    elif cmd == "notify":
        notify_telegram(" ".join(sys.argv[2:]))
    else:
        print(f"Comando desconocido: {cmd}")
        print(__doc__)


if __name__ == "__main__":
    main()

