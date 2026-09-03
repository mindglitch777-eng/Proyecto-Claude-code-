#!/usr/bin/env python3
"""Tests reales del resolver de musica.

Desde R7-22 la biblioteca real (biblioteca.json) YA NO esta vacia: 9
tracks CC0 reales (ver README.md para procedencia/licencia). Estos
tests prueban DOS cosas por separado:
  1. Que la biblioteca REAL de hoy resuelve tracks de verdad (no
     FALTANTE) para un rango normal de intensidad, y que los archivos
     mp3 que declara existen de verdad en disco.
  2. Que la logica de scoring/seleccion funciona de verdad, usando un
     fixture temporal con tracks de mentira (no assets reales
     inventados en el repo -- un archivo temporal que se borra al
     terminar el test) -- esto sigue probando el motor de scoring en
     aislamiento, independiente de que cambie el catalogo real."""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from resolver_musica import resolver_musica  # noqa: E402

FALLOS = []


def check(desc, cond):
    if not cond:
        FALLOS.append(f"FALLO: {desc}")


def test_biblioteca_real_resuelve_un_track_de_verdad():
    r = resolver_musica(intensidad_deseada=0.5)
    check("biblioteca real (9 tracks CC0): encuentra un track, no FALTANTE", r.encontrado is True)
    check("el track resuelto trae licencia CC0 real", r.licencia is not None and "CC0" in r.licencia)
    check("CC0 no exige atribucion", r.atribucion is None)


def test_biblioteca_real_extremos_de_intensidad_devuelven_algo_coherente():
    bajo = resolver_musica(intensidad_deseada=0.1)
    alto = resolver_musica(intensidad_deseada=0.95)
    check("intensidad baja pedida -> resuelve un track calmo real", bajo.encontrado and "calma" in bajo.id)
    check("intensidad alta pedida -> resuelve un track de impacto real", alto.encontrado and "impacto" in alto.id)


def test_biblioteca_real_todos_los_archivos_mp3_existen():
    biblioteca = json.loads((Path(__file__).parent / "biblioteca.json").read_text(encoding="utf-8"))
    check("catalogo real no esta vacio", len(biblioteca) > 0)
    for track in biblioteca:
        ruta = Path(__file__).parent / track["archivo"]
        check(f"archivo real de '{track['id']}' existe en disco", ruta.exists())


def _con_fixture(fn):
    """Arma una biblioteca.json temporal con tracks de mentira + sus
    mp3 (vacios, solo para que Path.exists() de True) en un directorio
    temporal, corre `fn(ruta_biblioteca)` y limpia todo despues."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        (tmp_path / "biblioteca").mkdir()
        tracks = [
            {"id": "motivacional-alto", "archivo": "biblioteca/motivacional-alto.mp3",
             "mood": ["motivacional", "energico"], "intensidad": 0.85, "bpm": 128,
             "duracionSeg": 120.0, "licencia": "CC-BY 4.0", "atribucion": "Autor Ejemplo"},
            {"id": "tenso-bajo", "archivo": "biblioteca/tenso-bajo.mp3",
             "mood": ["tenso", "suspenso"], "intensidad": 0.3, "bpm": 80,
             "duracionSeg": 60.0, "licencia": "dominio publico", "atribucion": None},
            {"id": "motivacional-medio", "archivo": "biblioteca/motivacional-medio.mp3",
             "mood": ["motivacional"], "intensidad": 0.5, "bpm": 100,
             "duracionSeg": 15.0, "licencia": "CC-BY 4.0", "atribucion": "Otro Autor"},
        ]
        for t in tracks:
            (tmp_path / t["archivo"]).write_bytes(b"")  # archivo de verdad, contenido irrelevante para el test
        ruta = tmp_path / "biblioteca.json"
        ruta.write_text(json.dumps(tracks, ensure_ascii=False), encoding="utf-8")
        fn(ruta)


def test_scoring_elige_el_track_mas_cercano_en_intensidad_y_mood():
    def _t(ruta):
        r = resolver_musica(intensidad_deseada=0.8, mood="motivacional", ruta_biblioteca=ruta)
        check("elige 'motivacional-alto' (intensidad Y mood mas cercanos)",
              r.encontrado and r.id == "motivacional-alto")
    _con_fixture(_t)


def test_scoring_respeta_intensidad_por_encima_del_mood_si_no_hay_mood_pedido():
    def _t(ruta):
        r = resolver_musica(intensidad_deseada=0.3, mood=None, ruta_biblioteca=ruta)
        check("sin mood pedido, elige por intensidad mas cercana ('tenso-bajo', 0.3)",
              r.encontrado and r.id == "tenso-bajo")
    _con_fixture(_t)


def test_track_corto_no_se_descarta_solo_se_penaliza():
    # 'motivacional-medio' dura 15s; pedir 60s no debe excluirlo (un
    # loop es una tecnica normal, no un error) -- solo pierde el bonus
    # de "cubre la duracion sin loop" frente a otro con intensidad igual.
    def _t(ruta):
        r = resolver_musica(intensidad_deseada=0.5, duracion_minima_seg=60.0, mood=None, ruta_biblioteca=ruta)
        check("sigue devolviendo un resultado (no lo descarta por ser corto)", r.encontrado is True)
    _con_fixture(_t)


def test_entrada_sin_archivo_real_devuelve_faltante_no_rompe():
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        tracks = [{"id": "fantasma", "archivo": "biblioteca/no-existe.mp3",
                   "mood": ["motivacional"], "intensidad": 0.5, "bpm": 100,
                   "duracionSeg": 30.0, "licencia": "CC-BY 4.0", "atribucion": None}]
        ruta = tmp_path / "biblioteca.json"
        ruta.write_text(json.dumps(tracks, ensure_ascii=False), encoding="utf-8")
        r = resolver_musica(intensidad_deseada=0.5, ruta_biblioteca=ruta)
        check("catalogo sin audio real: FALTANTE explicito, no explota", r.encontrado is False)
        check("razon menciona el archivo faltante", "no existe" in r.razon)


def main():
    for nombre, fn in list(globals().items()):
        if nombre.startswith("test_") and callable(fn):
            fn()
    if FALLOS:
        print(f"\n{len(FALLOS)} FALLO(S):\n")
        for f in FALLOS:
            print(f)
        return 1
    print("Todos los tests del resolver de musica pasaron OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
