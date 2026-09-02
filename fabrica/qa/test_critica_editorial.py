#!/usr/bin/env python3
"""Tests de critica_editorial.py. Fixtures armados a mano (escenas con
`estrategiaEdicion` en la forma real que produce el Director de
Edicion) + una corrida contra el arbol REAL de fabrica-demo-04 (que no
tiene estrategiaEdicion en ninguna escena, por ser de una ronda
anterior) para confirmar que no rompe con arboles viejos."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from critica_editorial import (  # noqa: E402
    ReporteCriticaEditorial,
    _audiovisual_pausa_imperceptible,
    _audiovisual_transicion_sin_motivo,
    _coherencia_cambio_estilo_sin_puente,
    _narrativa_cierre_debil,
    _narrativa_hook_debil,
    _narrativa_sin_revelacion,
    _repeticion_combinacion_estilos,
    _repeticion_intencion_consecutiva,
    _ritmo_energia_plana,
    _ritmo_racha_acelerada,
    _ritmo_tramo_estatico,
    _visual_densidad_sin_espacio,
    _visual_sin_estrategia,
    correr_critica_editorial,
)

RAIZ = Path(__file__).resolve().parents[2]
FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def _est(intencion="contextualizar", energia="media", densidad="moderada", estilos=None,
         microeventos=None, respiracion=False, motivo="algo"):
    return {
        "intencion": intencion, "energia": energia, "densidadVisual": densidad,
        "estilos": estilos or ["documental"],
        "microeventos": microeventos if microeventos is not None else [{"tipo": "entra_elemento_principal", "enSegRelativo": 0}],
        "respiracion": respiracion,
        "transicion": {"motivo": motivo, "funcion": "sin_funcion_especial", "intensidad": "media", "golpe": "corte"},
    }


def _escena(uid, dur=5.0, golpe="corte", comp="punch", estrategia="__default__"):
    e = {"unidadId": uid, "duracionSeg": dur, "golpe": golpe, "componenteId": comp}
    if estrategia == "__default__":
        e["estrategiaEdicion"] = _est()
    elif estrategia is not None:
        e["estrategiaEdicion"] = estrategia
    return e


def test_repeticion_intencion_consecutiva_alerta():
    escenas = [_escena("a", estrategia=_est(intencion="contextualizar")),
               _escena("b", estrategia=_est(intencion="contextualizar"))]
    check("misma intencion seguida alerta", len(_repeticion_intencion_consecutiva(escenas)) == 1)


def test_repeticion_intencion_variada_no_alerta():
    escenas = [_escena("a", estrategia=_est(intencion="contextualizar")),
               _escena("b", estrategia=_est(intencion="acelerar"))]
    check("intenciones distintas: sin alerta", len(_repeticion_intencion_consecutiva(escenas)) == 0)


def test_repeticion_combinacion_estilos_racha():
    escenas = [_escena(f"u{i}", estrategia=_est(estilos=["documental", "data"])) for i in range(3)]
    alertas = _repeticion_combinacion_estilos(escenas)
    check("3 escenas seguidas con la misma combinacion de estilos alertan", len(alertas) == 1)
    check("la alerta menciona las 3 escenas", all(f"u{i}" in alertas[0] for i in range(3)))


def test_repeticion_combinacion_estilos_variada_no_alerta():
    escenas = [_escena("a", estrategia=_est(estilos=["documental"])),
               _escena("b", estrategia=_est(estilos=["agresivo"])),
               _escena("c", estrategia=_est(estilos=["data"]))]
    check("combinaciones de estilos variadas: sin alerta", len(_repeticion_combinacion_estilos(escenas)) == 0)


def test_ritmo_tramo_estatico_alerta():
    escenas = [_escena("larga", dur=10.0, estrategia=_est(microeventos=[{"tipo": "entra_elemento_principal", "enSegRelativo": 0}]))]
    check("escena larga con 1 solo microevento alerta", len(_ritmo_tramo_estatico(escenas)) == 1)


def test_ritmo_tramo_dinamico_no_alerta():
    muchos = [{"tipo": "aparece_dato_apoyo", "enSegRelativo": s} for s in (0, 2, 4, 6)]
    escenas = [_escena("larga", dur=10.0, estrategia=_est(microeventos=muchos))]
    check("escena larga con varios microeventos: sin alerta", len(_ritmo_tramo_estatico(escenas)) == 0)


def test_ritmo_racha_acelerada_alerta():
    escenas = [_escena("a", dur=1.0), _escena("b", dur=1.5), _escena("c", dur=1.2), _escena("d", dur=5.0)]
    check("3+ escenas seguidas muy cortas alertan", len(_ritmo_racha_acelerada(escenas)) == 1)


def test_ritmo_racha_normal_no_alerta():
    escenas = [_escena("a", dur=4.0), _escena("b", dur=5.0), _escena("c", dur=6.0)]
    check("escenas de duracion normal: sin alerta de racha acelerada", len(_ritmo_racha_acelerada(escenas)) == 0)


def test_ritmo_energia_plana_alerta():
    escenas = [_escena(f"u{i}", estrategia=_est(energia="media")) for i in range(4)]
    check("4+ escenas con la misma energia alertan", len(_ritmo_energia_plana(escenas)) == 1)


def test_ritmo_energia_variada_no_alerta():
    energias = ["baja", "media", "alta", "muy_alta"]
    escenas = [_escena(f"u{i}", estrategia=_est(energia=en)) for i, en in enumerate(energias)]
    check("energia variada: sin alerta", len(_ritmo_energia_plana(escenas)) == 0)


def test_visual_densidad_sin_espacio_alerta():
    registro = {"comp-larga": {"capacidadTexto": "larga"}}
    escenas = [_escena("a", comp="comp-larga", estrategia=_est(densidad="densa"))]
    check("densidad densa + capacidadTexto larga alerta", len(_visual_densidad_sin_espacio(escenas, registro)) == 1)


def test_visual_densidad_con_espacio_no_alerta():
    registro = {"comp-corta": {"capacidadTexto": "corta"}}
    escenas = [_escena("a", comp="comp-corta", estrategia=_est(densidad="densa"))]
    check("densidad densa + capacidadTexto corta: sin alerta", len(_visual_densidad_sin_espacio(escenas, registro)) == 0)


def test_visual_sin_estrategia_parcial_alerta():
    escenas = [_escena("a"), _escena("b", estrategia=None), _escena("c")]
    check("una escena sin estrategia entre otras que si tienen: alerta", len(_visual_sin_estrategia(escenas)) == 1)


def test_visual_sin_estrategia_todas_ausentes_no_alerta():
    # Un video ENTERO generado sin Director de Edicion (demo_01..04) no
    # es "parcialmente" nada -- no genera ruido por una capa que
    # simplemente no se uso en absoluto.
    escenas = [_escena("a", estrategia=None), _escena("b", estrategia=None)]
    check("ninguna escena tiene estrategia: sin alerta (consistente, no parcial)", len(_visual_sin_estrategia(escenas)) == 0)


def test_narrativa_hook_debil_alerta():
    escenas = [_escena("hook", estrategia=_est(intencion="contextualizar"))]
    check("primera escena sin intencion enganchar alerta", len(_narrativa_hook_debil(escenas)) == 1)


def test_narrativa_hook_fuerte_no_alerta():
    escenas = [_escena("hook", estrategia=_est(intencion="enganchar"))]
    check("primera escena con intencion enganchar: sin alerta", len(_narrativa_hook_debil(escenas)) == 0)


def test_narrativa_cierre_debil_alerta():
    escenas = [_escena("a"), _escena("cierre", estrategia=_est(intencion="contextualizar"))]
    check("ultima escena sin intencion cerrar alerta", len(_narrativa_cierre_debil(escenas)) == 1)


def test_narrativa_sin_revelacion_alerta():
    escenas = [_escena(f"u{i}", estrategia=_est(intencion="contextualizar")) for i in range(3)]
    check("ninguna escena con intencion revelar alerta", len(_narrativa_sin_revelacion(escenas)) == 1)


def test_narrativa_con_revelacion_no_alerta():
    escenas = [_escena("a", estrategia=_est(intencion="contextualizar")), _escena("b", estrategia=_est(intencion="revelar"))]
    check("hay una escena con intencion revelar: sin alerta", len(_narrativa_sin_revelacion(escenas)) == 0)


def test_audiovisual_transicion_sin_motivo_alerta():
    escenas = [_escena("a", golpe="fogonazo", estrategia=_est(motivo=""))]
    check("golpe real sin motivo registrado alerta", len(_audiovisual_transicion_sin_motivo(escenas)) == 1)


def test_audiovisual_transicion_con_motivo_no_alerta():
    escenas = [_escena("a", golpe="fogonazo", estrategia=_est(motivo="prepara la revelacion"))]
    check("golpe real con motivo: sin alerta", len(_audiovisual_transicion_sin_motivo(escenas)) == 0)


def test_audiovisual_pausa_imperceptible_alerta():
    escenas = [_escena("pausa", dur=0.5, estrategia=_est(respiracion=True))]
    check("pausa muy corta alerta", len(_audiovisual_pausa_imperceptible(escenas)) == 1)


def test_audiovisual_pausa_perceptible_no_alerta():
    escenas = [_escena("pausa", dur=1.8, estrategia=_est(respiracion=True))]
    check("pausa con duracion razonable: sin alerta", len(_audiovisual_pausa_imperceptible(escenas)) == 0)


def test_coherencia_cambio_estilo_sin_puente_alerta():
    escenas = [_escena("a", estrategia=_est(estilos=["cinematico"])),
               _escena("b", estrategia=_est(estilos=["agresivo"]))]
    check("estilos totalmente disjuntos entre escenas seguidas alerta", len(_coherencia_cambio_estilo_sin_puente(escenas)) == 1)


def test_coherencia_estilo_compartido_no_alerta():
    escenas = [_escena("a", estrategia=_est(estilos=["documental", "data"])),
               _escena("b", estrategia=_est(estilos=["data", "agresivo"]))]
    check("estilos con al menos uno en comun: sin alerta", len(_coherencia_cambio_estilo_sin_puente(escenas)) == 0)


def test_correr_critica_editorial_contra_demo_04_real():
    arbol_path = RAIZ / "remotion-spike/src/fabrica_bridge/demo_04.json"
    if not arbol_path.exists():
        return
    reporte = correr_critica_editorial(str(arbol_path))
    check("critica editorial nunca bloquea (ok siempre True)", reporte.ok is True)
    check("id del arbol correcto", reporte.arbol_id == "fabrica-demo-04")
    # demo_04 no tiene estrategiaEdicion en ninguna escena -- las
    # categorias que dependen de ella no deberian generar ruido.
    check("sin estrategiaEdicion en ninguna escena, no hay alertas de vision parcial", len(reporte.visual) == 0)
    # Pero las funciones REUTILIZADAS de checks_composicion.py (que no
    # dependen de estrategiaEdicion) siguen funcionando -- el hallazgo
    # ya conocido del "47" repetido deberia seguir apareciendo aca.
    check("la repeticion de '47' en texto (ya conocida de Ronda 3) sigue detectandose",
          any("47" in a for a in reporte.repeticion))


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
        return 1
    print("Todos los tests de critica editorial pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
