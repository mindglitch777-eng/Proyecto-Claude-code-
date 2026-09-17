/**
 * "EL ERROR REAL" #1 -- 3ra vuelta: "se rompió en vivo, y se
 * autogestionó sola". Primer video de una sub-serie nueva, en paralelo
 * al documental principal: contar bugs reales de la fábrica
 * encontrados y arreglados, con evidencia real (nunca inventada).
 *
 * Caso real usado (ver fabrica/ESTADO.md, bloque "Zernio abandonado del
 * todo... + fix real de carrera de git", 2026-09-15): al disparar 32
 * entregas casi simultáneas, se perdieron 27 entradas del registro en
 * `state/uploads.json`/`state/carruseles.json` -- cada corrida leía/
 * escribía el log completo desde una foto vieja en memoria, y la que
 * perdía la carrera de `git push` reintentaba el mismo diff
 * desactualizado. Arreglado con un patrón de pendientes idempotentes
 * (`aplicar_pendiente.ts`) + `git fetch` + `reset --hard` antes de cada
 * intento. Re-disparadas las 27: 26 entraron a la primera, 1
 * (carrusel-11) necesitó un segundo intento. Verificado a mano que los
 * archivos quedaron idénticos entre la rama y main.
 *
 * Historial de correcciones reales del operador:
 *   1. (v1->v2) "Nadie va a mirar los logs y entender que hubo un
 *      problema" -- se sacó la jerga de programador.
 *   2. (v2->v3, ESTA vuelta) Tras debatir el ángulo con el operador
 *      (ver "Test de ángulo comercial" en CLAUDE.md, regla agregada
 *      por esta misma corrección): "a quién le va a interesar que casi
 *      se me pierden 27 videos, a nadie" -- el drama personal no tenía
 *      apuesta real para el espectador. Se reencuadra el MISMO caso
 *      real como prueba de fiabilidad/autocorrección ("¿puedo confiar
 *      en que esto no me rompa todo?"), con hook directo y agresivo
 *      ("SE ROMPIÓ EN VIVO.", pedido textual) y la evidencia reemplazada
 *      por una grilla visual (sin texto técnico) en vez de una tarjeta
 *      de log. Frase pedida textual: "armé un sistema que se
 *      autogestiona solo... y recuperé todos". CTA real agregado:
 *      comunidad exclusiva, 20 cupos gratis.
 *
 * Componente: `auto-arreglo` (agresivo/AutoArreglo.tsx), reemplaza a
 * `bug-real` para este video -- ver notas de reemplazo en
 * fabrica/componentes/registro.json.
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'error-real-1';

const escenas: EscenaGuion[] = [
  {
    id: 'err1-todo',
    textoVoz: 'Mi fábrica de contenido se rompió en vivo. '
      + 'Subí 32 videos casi al mismo tiempo, y en segundos, mi sistema estaba a punto '
      + 'de perder el rastro de 27. '
      + 'Así que armé un sistema que se autogestiona solo. Y recuperé todos. '
      + 'Veintiséis se arreglaron a la primera. Uno necesitó un segundo intento. '
      + 'Lo comprobé a mano: quedó todo igual. '
      + 'Así se cuida sola mi fábrica. '
      + 'Entrá a la comunidad exclusiva. Quedan veinte lugares gratis.',
    componenteId: 'auto-arreglo',
    props: {
      hookIntro: 'Mi fábrica de contenido',
      hookImpacto: 'SE ROMPIÓ EN VIVO.',
      clipsGrid: ['doc-v01.mp4', 'doc-v03.mp4', 'doc-v05.mp4', 'doc-v06.mp4', 'doc-v08.mp4', 'doc-v09.mp4'],
      resultadoNumero: 27,
      resultadoDetalle: '26 se arreglaron a la primera. 1 necesitó un segundo intento.',
      verificacion: 'Lo comprobé a mano: quedó todo igual.',
      cierre: 'Así se cuida sola mi fábrica.',
      cta: 'Entrá a la comunidad exclusiva. Quedan 20 lugares gratis.',
      // Anclajes ajustados a la duracion real del audio (23.94s),
      // alineados a las pausas reales detectadas con ffmpeg
      // silencedetect sobre err1-todo.wav (no estimados a ojo).
      t: {
        hookIntro: 0,
        hookImpacto: 1.38,
        gridAparece: 2.9,
        autoarregloDesde: 9.34,
        lineaSigue: 12.9,
        resultadoCountDesde: 13.2,
        resultadoCountDuracion: 1.3,
        resultadoDetalle: 15.1,
        verificacion: 16.98,
        cierre: 19.23,
        cta: 21.0,
      },
    },
    intensidad: 8,
    esPrimera: true,
    esCierre: true,
  },
];

function main() {
  const resultado = renderizarPorGuion(ID_VIDEO, escenas, {
    audioOrigenDir: 'capturas_voz/audio_pilotos',
    carpetaPublica: 'fabrica_error_real_1',
  }, RAIZ);

  const destino = path.join(RAIZ, 'remotion-spike/src/fabrica_bridge', `${ID_VIDEO}.json`);
  writeFileSync(destino, JSON.stringify(resultado.arbol, null, 2));

  console.log(`Escrito: ${destino}`);
  console.log(`Duracion total: ${resultado.arbol.duracionTotalSeg.toFixed(2)}s`);
  for (const u of resultado.resumen) {
    console.log(`  ${u.id.padEnd(20)} componente=${u.componenteId.padEnd(14)} golpe=${u.golpe}${u.golpeExplicito ? ' (explicito)' : ''}`);
  }
}

main();
