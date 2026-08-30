#!/usr/bin/env python3
"""
Motor de contenido — linea de comandos. La norma esta en MOTOR.md.

El ciclo de §25, cada paso un comando:

    IDEA          motor.py idea "titulo" --conflicto "..." --desarrollo C
    EVALUARLA     motor.py evaluar 1 comercial=8 viral=7 ...
    ANGULOS+HOOKS motor.py hooks 1                 (genera muchos, §9)
    HOOK SCORE    motor.py hooks 1 --ver           (ordenados, §10)
    ELEGIR        motor.py elegir 12               (lo decide una persona)
    ESTRUCTURA    motor.py estructura C --dur 32   (§5/§6)
    CIFRAS        motor.py cifra 1 "67 de demanda" VERIFICADO --fuente "..."
    BRIEF         motor.py brief 1 q6_payoff "..."
    PUERTA        motor.py listo 1                 (§24: se puede o no)
    ESQUELETO     motor.py esqueleto 1 --salida guiones/x.json
    MEDIR         motor.py publicar 1 --vistas 12000 --ret-3s 0.44
    APRENDER      motor.py aprender                (§23)

Todo determinista. Ningun LLM, ninguna API paga. Lo que el programa no
puede medir lo deja vacio y lo pide; no lo inventa.
"""
import argparse
import json
import sys

from motor import base as B
from motor import brief as BR
from motor import estructura as E
from motor import hooks as HK
from motor import ideas as ID


def _idea(con, i):
    f = con.execute("SELECT * FROM ideas WHERE id=?", (i,)).fetchone()
    if f is None:
        print(f"No existe la idea {i}.")
        sys.exit(1)
    return f


def cmd_estado(con, a):
    r = B.resumen(con)
    print(json.dumps(r, indent=2, ensure_ascii=False))
    if r["sin_conflicto"]:
        print(f"\n§4: {r['sin_conflicto']} idea(s) sin conflicto declarado. "
              f"No se pueden producir hasta reformularlas.")
    if r["hooks"] and not r["hooks_elegidos"]:
        print("\n§10: hay hooks puntuados y ninguno elegido. El puntaje "
              "ordena; la eleccion la hace una persona.")


def cmd_idea(con, a):
    i, nueva = ID.crear(con, a.titulo, a.conflicto, a.desarrollo, a.objetivo,
                        a.escalon, a.variable,
                        dict(p.split("=", 1) for p in (a.slot or [])),
                        a.notas, a.serie)
    con.commit()
    print(f"{'Creada' if nueva else 'Ya existia'} la idea #{i}: {a.titulo}")
    if not (a.conflicto or "").strip():
        print("  §4 AVISO: sin conflicto declarado. Reformulala o "
              "rechazala; asi no se produce.")


def cmd_evaluar(con, a):
    idea = _idea(con, a.id)
    if not ID.tiene_conflicto(dict(idea)):
        print("§4 BLOQUEADO: la idea no declara conflicto. Primero eso.")
        return 1
    dims = {}
    for par in a.dim:
        k, _, v = par.partition("=")
        k = k.strip()
        if k not in ID.PESOS:
            print(f"'{k}' no es una dimension. Validas:")
            for d in ID.DIMENSIONES:
                print(f"  {d:16} peso {ID.PESOS[d]:2}  {ID.DESCRIPCION[d]}")
            return 1
        dims[k] = int(v)
    anterior = con.execute("SELECT * FROM idea_scores WHERE idea_id=?",
                           (a.id,)).fetchone()
    if anterior:
        for d in ID.DIMENSIONES:
            if d not in dims and anterior[d] is not None:
                dims[d] = anterior[d]
    total, cob = ID.guardar(con, a.id, dims)
    _, _, aj = ID.calcular(dims)
    con.execute("UPDATE ideas SET estado='EVALUADA' WHERE id=?", (a.id,))
    con.commit()
    print(f"Idea #{a.id}: total {total} | cobertura {int(cob*100)}% | "
          f"ajustado {aj}")
    faltan = [d for d in ID.DIMENSIONES if dims.get(d) is None]
    if faltan:
        print(f"  sin puntuar: {', '.join(faltan)}")


def cmd_hooks(con, a):
    idea = _idea(con, a.id)
    if a.ver:
        filas = con.execute(
            "SELECT * FROM hooks WHERE idea_id=? ORDER BY "
            "(rechazo IS NOT NULL), total DESC", (a.id,)).fetchall()
        if not filas:
            print("Sin hooks. Generalos con: motor.py hooks {}".format(a.id))
            return
        print(f"{len(filas)} hook(s) para #{a.id}. §10: el puntaje ORDENA, "
              f"no elige.\n")
        for f in filas:
            if f["rechazo"]:
                print(f"  [ X ] {f['id']:4} {f['rechazo']}")
                print(f"        {f['texto']}")
                continue
            m = "*" if f["elegido"] else " "
            print(f"  [{m}{f['total']:5.1f}] {f['id']:4} {f['categoria']:14} "
                  f"{f['texto']}")
            print(f"        vir{f['viral']:2} cur{f['curiosidad']:2} "
                  f"com{f['comercial']:2} cla{f['claridad']:2} "
                  f"cre{f['credibilidad']:2} dif{f['diferenciacion']:2} "
                  f"vis{f['visual']:2}"
                  + ("   (sugerido por el programa)" if f["sugerido"] else ""))
        return

    slots = B.slots(idea)
    if a.texto:
        gen = [("humano", t, HK.rechazo(t)) for t in a.texto]
    else:
        gen = HK.generar(slots)
    if not gen:
        print("No se genero ninguno: la idea no tiene slots suficientes.")
        print("Cargalos con: motor.py idea ... --slot sujeto='...' "
              "--slot precio='...'")
        print(f"Llaves utiles: {', '.join(HK.LLAVES)}")
        return
    n = 0
    for cat, txt, rech in gen:
        dims = HK.puntuar(txt, slots, idea["objetivo"])
        cur = con.execute(
            "INSERT INTO hooks (idea_id, texto, categoria, origen, rechazo,"
            " viral, curiosidad, comercial, claridad, credibilidad,"
            " diferenciacion, visual, total, sugerido) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1) "
            "ON CONFLICT(idea_id, texto) DO NOTHING",
            (a.id, txt, cat, "HUMANO" if a.texto else "PLANTILLA", rech,
             dims["viral"], dims["curiosidad"], dims["comercial"],
             dims["claridad"], dims["credibilidad"], dims["diferenciacion"],
             dims["visual"], HK.total(dims)))
        n += 1 if cur.lastrowid else 0
    con.execute("UPDATE ideas SET estado='CON_HOOKS' WHERE id=?", (a.id,))
    con.commit()
    rech = sum(1 for _, _, r in gen if r)
    print(f"{n} hook(s) nuevo(s) de {len(gen)} generado(s). "
          f"{rech} rechazado(s) por §2/§3.")
    print(f"Verlos: python3 motor.py hooks {a.id} --ver")


def cmd_elegir(con, a):
    f = con.execute("SELECT * FROM hooks WHERE id=?", (a.hook_id,)).fetchone()
    if f is None:
        print("No existe ese hook.")
        return 1
    if f["rechazo"]:
        print(f"BLOQUEADO: ese hook esta rechazado por {f['rechazo']}.")
        return 1
    con.execute("UPDATE hooks SET elegido=0 WHERE idea_id=?", (f["idea_id"],))
    con.execute("UPDATE hooks SET elegido=1 WHERE id=?", (a.hook_id,))
    con.execute("UPDATE briefs SET hook_id=? WHERE idea_id=?",
                (a.hook_id, f["idea_id"]))
    con.commit()
    print(f"Elegido para la idea #{f['idea_id']}: {f['texto']}")


def cmd_estructura(con, a):
    letra = a.letra.upper()
    nombre = B.DESARROLLOS.get(letra, "estructura base §5")
    print(f"{letra} — {nombre} | {a.dur}s\n")
    for beat, que, seg, maquetas in E.plan(letra, a.dur):
        print(f"  {beat:20} {seg:5}s  {', '.join(maquetas)}")
        print(f"  {'':20}        {que}")


def cmd_esqueleto(con, a):
    idea = _idea(con, a.id)
    letra = a.desarrollo or idea["desarrollo"]
    if not letra:
        print("§6: la idea no declara desarrollo (A..I). Pasalo con "
              "--desarrollo.")
        return 1
    g = E.esqueleto_guion(letra, a.dur, flash_ritmo=[1.5, 0.7, 2.5])
    g["tema"] = idea["titulo"]
    h = con.execute("SELECT texto FROM hooks WHERE idea_id=? AND elegido=1",
                    (a.id,)).fetchone()
    if h and g["segmentos"]:
        g["segmentos"][0]["narracion"] = h["texto"]
    with open(a.salida, "w", encoding="utf-8") as fh:
        json.dump(g, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"Escrito {a.salida} — {len(g['segmentos'])} planos con su beat, "
          f"maqueta y duracion.")
    print("Falta: narracion de cada plano y la consulta 'necesita'.")
    if not h:
        print("AVISO §10: no hay hook elegido, el primer plano quedo vacio.")


def cmd_cifra(con, a):
    if a.etiqueta.upper() not in B.ETIQUETAS_CIFRA:
        print(f"§17: etiqueta invalida. Validas: {', '.join(B.ETIQUETAS_CIFRA)}")
        return 1
    con.execute("INSERT INTO cifras (idea_id, cifra, etiqueta, fuente) "
                "VALUES (?,?,?,?) ON CONFLICT(idea_id, cifra) DO UPDATE SET "
                "etiqueta=excluded.etiqueta, fuente=excluded.fuente",
                (a.id, a.cifra, a.etiqueta.upper(), a.fuente))
    con.commit()
    print(f"Registrada: {a.cifra} [{a.etiqueta.upper()}]")
    if a.etiqueta.upper() == "VERIFICADO" and not a.fuente:
        print("  §17 AVISO: dice VERIFICADO y no tiene fuente. Asi no pasa "
              "la puerta de produccion.")


def cmd_brief(con, a):
    con.execute("INSERT INTO briefs (idea_id) VALUES (?) "
                "ON CONFLICT(idea_id) DO NOTHING", (a.id,))
    if a.pregunta:
        claves = [k for k, _ in BR.PREGUNTAS]
        if a.pregunta not in claves:
            print(f"Preguntas: {', '.join(claves)}")
            return 1
        con.execute(f"UPDATE briefs SET {a.pregunta}=? WHERE idea_id=?",
                    (a.respuesta, a.id))
        con.commit()
    f = con.execute("SELECT * FROM briefs WHERE idea_id=?", (a.id,)).fetchone()
    idea = _idea(con, a.id)
    print(f"BRIEF idea #{a.id} — {idea['titulo']}\n")
    for k, t in BR.PREGUNTAS:
        v = (f[k] or "").strip() if f else ""
        print(f"  {t}\n     {v or '— sin responder —'}")
    if idea["objetivo"]:
        print(f"\n§8 CTA que le corresponde a un video de "
              f"'{idea['objetivo']}':")
        for c in BR.sugerir_cta(idea["objetivo"]):
            print(f"  - {c}")


def cmd_listo(con, a):
    ok, motivos = BR.listo(con, a.id)
    if ok:
        print(f"Idea #{a.id}: SE PUEDE PRODUCIR. Las diez de §24 respondidas, "
              f"conflicto declarado, hook elegido y cifras etiquetadas.")
        return 0
    print(f"Idea #{a.id}: NO PRODUCIR TODAVIA (§24). Falta:\n")
    for m in motivos:
        print(f"  - {m}")
    return 1


def cmd_publicar(con, a):
    con.execute(
        "INSERT INTO publicaciones (idea_id, plataforma, publicada, vistas,"
        " ret_3s, guardados, clics_perfil, leads, ventas, analisis, hipotesis)"
        " VALUES (?,?,datetime('now'),?,?,?,?,?,?,?,?)",
        (a.id, a.plataforma, a.vistas, a.ret_3s, a.guardados, a.clics_perfil,
         a.leads, a.ventas, a.analisis, a.hipotesis))
    con.execute("UPDATE ideas SET estado='PUBLICADA' WHERE id=?", (a.id,))
    con.commit()
    print(f"Resultado guardado para la idea #{a.id}.")


def cmd_aprender(con, a):
    """§23. Agrupa lo publicado por desarrollo, objetivo y variable, y
    muestra como midio cada grupo. No decide nada: muestra."""
    filas = con.execute("""
        SELECT i.desarrollo, i.objetivo, i.variable, COUNT(*) n,
               AVG(p.vistas) vistas, AVG(p.ret_3s) ret, AVG(p.guardados) guard,
               AVG(p.clics_perfil) clics, SUM(p.leads) leads, SUM(p.ventas) ventas
        FROM publicaciones p JOIN ideas i ON i.id=p.idea_id
        GROUP BY i.desarrollo, i.objetivo, i.variable
        ORDER BY clics DESC NULLS LAST""").fetchall()
    if not filas:
        print("Todavia no hay nada publicado con resultado cargado.")
        print("Cargalo con: python3 motor.py publicar <id> --vistas N ...")
        return
    print(f"{'desarrollo':12} {'objetivo':16} {'variable':11} {'n':>3} "
          f"{'vistas':>9} {'ret3s':>6} {'guard':>6} {'clics':>6} "
          f"{'leads':>6} {'vtas':>5}")
    for f in filas:
        d = B.DESARROLLOS.get(f["desarrollo"] or "", f["desarrollo"] or "—")
        print(f"{d:12} {(f['objetivo'] or '—'):16} {(f['variable'] or '—'):11} "
              f"{f['n']:3} {(f['vistas'] or 0):9.0f} {(f['ret'] or 0):6.2f} "
              f"{(f['guard'] or 0):6.0f} {(f['clics'] or 0):6.0f} "
              f"{(f['leads'] or 0):6.0f} {(f['ventas'] or 0):5.0f}")
    print("\n§23: esto ordena, no concluye. Un grupo con n=1 no dice nada; "
          "\ny 'mejor' depende de para que era la pieza (§19).")


def main():
    ap = argparse.ArgumentParser(description="Motor de contenido (MOTOR.md)")
    ap.add_argument("--db")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("estado")

    p = sub.add_parser("idea", help="alta de idea")
    p.add_argument("titulo")
    p.add_argument("--conflicto", help="§4, la tension. Sin esto no se produce")
    p.add_argument("--desarrollo", help="letra A..I de §6")
    p.add_argument("--objetivo", choices=B.OBJETIVOS, help="§19")
    p.add_argument("--escalon", choices=B.ESCALONES, help="§20")
    p.add_argument("--variable", choices=B.VARIABLES, help="§22")
    p.add_argument("--slot", action="append", metavar="LLAVE=VALOR")
    p.add_argument("--serie")
    p.add_argument("--notas")

    p = sub.add_parser("evaluar", help="§11 IDEA SCORE")
    p.add_argument("id", type=int)
    p.add_argument("dim", nargs="+", metavar="DIMENSION=1..10")

    p = sub.add_parser("hooks", help="§9 generar / §10 ver")
    p.add_argument("id", type=int)
    p.add_argument("--ver", action="store_true")
    p.add_argument("--texto", action="append", help="hook escrito a mano")

    p = sub.add_parser("elegir", help="§10, la eleccion es humana")
    p.add_argument("hook_id", type=int)

    p = sub.add_parser("estructura", help="§5/§6")
    p.add_argument("letra")
    p.add_argument("--dur", type=float, default=32.0)

    p = sub.add_parser("esqueleto", help="guion a medio armar (§12)")
    p.add_argument("id", type=int)
    p.add_argument("--desarrollo")
    p.add_argument("--dur", type=float, default=32.0)
    p.add_argument("--salida", required=True)

    p = sub.add_parser("cifra", help="§17")
    p.add_argument("id", type=int)
    p.add_argument("cifra")
    p.add_argument("etiqueta")
    p.add_argument("--fuente")

    p = sub.add_parser("brief", help="§24")
    p.add_argument("id", type=int)
    p.add_argument("pregunta", nargs="?")
    p.add_argument("respuesta", nargs="?")

    p = sub.add_parser("listo", help="§24, la puerta de produccion")
    p.add_argument("id", type=int)

    p = sub.add_parser("publicar", help="§23, resultado real")
    p.add_argument("id", type=int)
    p.add_argument("--plataforma", default="tiktok")
    p.add_argument("--vistas", type=int)
    p.add_argument("--ret-3s", type=float, dest="ret_3s")
    p.add_argument("--guardados", type=int)
    p.add_argument("--clics-perfil", type=int, dest="clics_perfil")
    p.add_argument("--leads", type=int)
    p.add_argument("--ventas", type=int)
    p.add_argument("--analisis")
    p.add_argument("--hipotesis")

    sub.add_parser("aprender", help="§23, como midio cada grupo")

    a = ap.parse_args()
    con = B.conectar(a.db)
    try:
        return {
            "estado": cmd_estado, "idea": cmd_idea, "evaluar": cmd_evaluar,
            "hooks": cmd_hooks, "elegir": cmd_elegir,
            "estructura": cmd_estructura, "esqueleto": cmd_esqueleto,
            "cifra": cmd_cifra, "brief": cmd_brief, "listo": cmd_listo,
            "publicar": cmd_publicar, "aprender": cmd_aprender,
        }[a.cmd](con, a) or 0
    finally:
        con.commit()
        con.close()


if __name__ == "__main__":
    sys.exit(main())
