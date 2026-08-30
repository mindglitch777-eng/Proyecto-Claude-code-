#!/usr/bin/env python3
"""
Product Factory — linea de comandos del laboratorio.

RESEARCH MODE. Este programa NO construye productos ni elige ganadores.
Recibe investigacion de tres fuentes, la deduplica, la puntua y la
ordena para que la decision la tome una persona mirando evidencia.

    python3 laboratorio.py estado
    python3 laboratorio.py importar archivo.json --fuente chatgpt
    python3 laboratorio.py importar demo.json --demo
    python3 laboratorio.py ranking [--limite 20] [--sin-demo]
    python3 laboratorio.py ficha 3
    python3 laboratorio.py recalcular
    python3 laboratorio.py promover 3 RESEARCHING
    python3 laboratorio.py rechazar 3
    python3 laboratorio.py reporte [--salida REPORTE.md]
    python3 laboratorio.py pesos [--set demand=20]
    python3 laboratorio.py duplicados
    python3 laboratorio.py fusionar 5 3
    python3 laboratorio.py purgar-demo
    python3 laboratorio.py bloqueo "Hotmart marketplace" "requiere JavaScript"
"""
import argparse
import json
import sys
from pathlib import Path

from factory import esquema as E
from factory import importar as I
from factory import puntaje as P
from factory import reporte as R


def cmd_estado(con, args):
    r = E.resumen(con)
    print(json.dumps(r, indent=2, ensure_ascii=False))
    if r["demo"]:
        print(f"\nAVISO: {r['demo']} fila(s) de DEMO en la base. "
              f"Borralas con: python3 laboratorio.py purgar-demo")
    if r["total"] and not r["con_observacion"]:
        print("\nAVISO: ninguna oportunidad tiene evidencia DIRECT/INDIRECT. "
              "Todo lo que hay son hipotesis sin verificar.")


def cmd_importar(con, args):
    res = I.importar(con, args.archivo, I.normalizar_fuente(args.fuente),
                     es_demo=args.demo)
    con.commit()
    resumen = I.resumen_importacion(res)
    print(json.dumps(resumen, indent=2, ensure_ascii=False))
    for r in res:
        if not r.get("ok"):
            print(f"  RECHAZADO: {r['motivo']}")
        elif r["fusionada"]:
            print(f"  fusionada con #{r['id']} (similitud {r['similitud']}) "
                  f"— fuentes ahora: {', '.join(r['fuentes'])}")
    if resumen["degradadas_por_falta_de_url"]:
        print(f"\nAVISO: {resumen['degradadas_por_falta_de_url']} evidencia(s) "
              f"venian como DIRECT/INDIRECT sin URL y se guardaron como "
              f"INFERENCE. Sin fuente no se puede verificar.")
    # puntuar lo recien importado
    for r in res:
        if r.get("ok"):
            P.calcular(con, r["id"])
    con.commit()


def cmd_ranking(con, args):
    filas = R.ranking(con, limite=args.limite, incluir_demo=not args.sin_demo,
                      min_confianza=args.min_confianza)
    if not filas:
        print("No hay oportunidades cargadas todavia.")
        return
    print(R.tabla_ranking(filas))


def cmd_ficha(con, args):
    print(R.ficha(con, args.id))


def cmd_recalcular(con, args):
    n = P.recalcular_todo(con)
    con.commit()
    print(f"Recalculadas {n} oportunidad(es).")


def cmd_promover(con, args):
    ok, msg = E.promover(con, args.id, args.estado.upper())
    con.commit()
    print(("OK: " if ok else "BLOQUEADO: ") + msg)
    return 0 if ok else 1


def cmd_rechazar(con, args):
    ok, msg = E.promover(con, args.id, E.RECHAZADA)
    con.commit()
    print(("OK: " if ok else "BLOQUEADO: ") + msg)


def cmd_reporte(con, args):
    texto = R.reporte_general(con, incluir_demo=not args.sin_demo)
    if args.salida:
        Path(args.salida).write_text(texto, encoding="utf-8")
        print(f"Escrito {args.salida}")
    else:
        print(texto)


def cmd_pesos(con, args):
    pesos = P.cargar_pesos()
    if args.set:
        for par in args.set:
            k, _, v = par.partition("=")
            k = k.strip()
            if k not in P.PESOS_POR_DEFECTO:
                print(f"ERROR: '{k}' no es una dimension. "
                      f"Validas: {', '.join(P.PESOS_POR_DEFECTO)}")
                return 1
            pesos[k] = float(v)
        P.guardar_pesos(pesos)
        print("Pesos guardados. Corre 'recalcular' para aplicarlos.")
    total = sum(pesos.values())
    print(json.dumps(pesos, indent=2, ensure_ascii=False))
    print(f"\nSuma: {total}")
    if abs(total - 100) > 0.01:
        print("AVISO: no suman 100. El calculo re-normaliza igual, pero "
              "conviene revisarlo para que los pesos signifiquen porcentajes.")


def cmd_duplicados(con, args):
    pend = E.duplicados_pendientes(con)
    if not pend:
        print("No hay pares marcados para revisar.")
        return
    print(f"{len(pend)} par(es) marcados como POSIBLE duplicado.\n"
          f"El sistema NO los fusiona solo: ninguna similitud difusa separa "
          f"de forma confiable\nun duplicado real de dos problemas parecidos. "
          f"Decidilo vos.\n")
    for d in pend:
        print(f"  similitud {d['similarity']:.3f}")
        print(f"    #{d['id_a']}: {d['problem_a'][:78]}")
        print(f"    #{d['id_b']}: {d['problem_b'][:78]}")
        print(f"    -> fusionar:  python3 laboratorio.py fusionar {d['id_b']} {d['id_a']}")
        print()


def cmd_fusionar(con, args):
    ok, msg = E.fusionar(con, args.origen, args.destino)
    con.commit()
    print(("OK: " if ok else "ERROR: ") + msg)
    if ok:
        P.calcular(con, args.destino)
        con.commit()
    return 0 if ok else 1


def cmd_purgar_demo(con, args):
    n = E.purgar_demo(con)
    con.commit()
    print(f"Borradas {n} fila(s) de demostracion.")


def cmd_bloqueo(con, args):
    E.registrar_bloqueo(con, args.target, args.motivo, args.fuente.upper(),
                        args.id)
    con.commit()
    print(f"Registrado ACCESS_UNAVAILABLE: {args.target} — {args.motivo}")


def main():
    ap = argparse.ArgumentParser(
        description="Product Factory — laboratorio de oportunidades (RESEARCH MODE)")
    ap.add_argument("--db", help="ruta a la base (por defecto factory/oportunidades.db)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("estado", help="resumen del laboratorio")

    p = sub.add_parser("importar", help="importar JSON o CSV")
    p.add_argument("archivo")
    p.add_argument("--fuente", default="HUMAN_RESEARCH",
                   help="claude_code | chatgpt | human_research")
    p.add_argument("--demo", action="store_true",
                   help="marcar como datos de DEMOSTRACION (no reales)")

    p = sub.add_parser("ranking", help="tabla ordenada por puntaje ajustado")
    p.add_argument("--limite", type=int)
    p.add_argument("--sin-demo", action="store_true")
    p.add_argument("--min-confianza", type=float, default=0.0)

    p = sub.add_parser("ficha", help="ficha completa de una oportunidad")
    p.add_argument("id", type=int)

    sub.add_parser("recalcular", help="recalcular todos los puntajes")

    p = sub.add_parser("promover", help="mover de estado")
    p.add_argument("id", type=int)
    p.add_argument("estado")

    p = sub.add_parser("rechazar", help="marcar como REJECTED")
    p.add_argument("id", type=int)

    p = sub.add_parser("reporte", help="reporte general en Markdown")
    p.add_argument("--salida")
    p.add_argument("--sin-demo", action="store_true")

    p = sub.add_parser("pesos", help="ver o cambiar los pesos del scoring")
    p.add_argument("--set", action="append", metavar="DIM=VALOR")

    sub.add_parser("duplicados", help="pares marcados como posible duplicado")

    p = sub.add_parser("fusionar", help="fusionar una oportunidad en otra")
    p.add_argument("origen", type=int, help="se vacia y se borra")
    p.add_argument("destino", type=int, help="recibe todo")

    sub.add_parser("purgar-demo", help="borrar todas las filas de demostracion")

    p = sub.add_parser("bloqueo", help="registrar un ACCESS_UNAVAILABLE")
    p.add_argument("target")
    p.add_argument("motivo")
    p.add_argument("--fuente", default="CLAUDE_CODE")
    p.add_argument("--id", type=int)

    args = ap.parse_args()
    con = E.conectar(args.db)
    try:
        fn = {
            "estado": cmd_estado, "importar": cmd_importar, "ranking": cmd_ranking,
            "ficha": cmd_ficha, "recalcular": cmd_recalcular,
            "promover": cmd_promover, "rechazar": cmd_rechazar,
            "reporte": cmd_reporte, "pesos": cmd_pesos,
            "duplicados": cmd_duplicados, "fusionar": cmd_fusionar,
            "purgar-demo": cmd_purgar_demo, "bloqueo": cmd_bloqueo,
        }[args.cmd]
        return fn(con, args) or 0
    finally:
        con.commit()
        con.close()


if __name__ == "__main__":
    sys.exit(main())
