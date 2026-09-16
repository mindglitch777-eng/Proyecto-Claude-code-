/**
 * "EL ERROR REAL" #1 -- "así fue como casi pierdo 27 videos".
 * Primer video de una sub-serie nueva, en paralelo al documental
 * principal: contar bugs reales de la fábrica encontrados y arreglados,
 * con evidencia real (nunca inventada).
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
 * Dos rondas reales de corrección del operador tras ver la v1:
 *   1. "Nadie va a mirar los logs y entender que hubo un problema" --
 *      se sacó toda la jerga de programador (rutas de archivo, "log",
 *      "registro") y se cambió por lenguaje de todos los días. El
 *      número real sigue siendo el gancho dramático, pero ahora se dice
 *      en criollo: no se perdió ningún video, se perdió el rastro de
 *      cuáles ya estaban subidos.
 *   2. "El hook tiene que ser más potente, tipo 'así fue como casi
 *      pierdo 27 videos', que ocupe toda la pantalla" -- frase exacta
 *      pedida por el operador, ahora el hook literal del video.
 *
 * Componente: `bug-real` (agresivo/BugReal.tsx) -- ninguno del catálogo
 * básico servía para esta estructura (gancho en 3 escalones + prueba
 * breve + count-up real + verificación).
 */
import path from 'node:path';
import {writeFileSync} from 'node:fs';
import {renderizarPorGuion, type EscenaGuion} from '../composicion/renderizador_por_guion';

const RAIZ = path.join(__dirname, '..', '..');
const ID_VIDEO = 'error-real-1';

const escenas: EscenaGuion[] = [
  {
    id: 'err1-todo',
    textoVoz: 'Así fue como casi pierdo 27 videos. '
      + 'No, no se borró nada -- pero por un rato no supe cuáles ya estaban subidos. '
      + 'Subí 32 videos casi al mismo tiempo, y 27 quedaron sin registrarse como subidos, '
      + 'porque el sistema guardaba una lista vieja mientras yo seguía subiendo. '
      + 'Veintiséis se recuperaron a la primera. Uno necesitó un segundo intento. '
      + 'Lo comprobé a mano, línea por línea: quedó todo igual. '
      + 'Esto es lo que no se ve en el video final.',
    componenteId: 'bug-real',
    props: {
      hookIntro: 'Así fue como',
      hookMedio: 'casi pierdo',
      hookImpacto: '27 videos.',
      aclaracion: 'No se borró nada. Pero por un rato no supe qué estaba listo.',
      pruebaTitulo: 'lo que pasó',
      pruebaLineas: [
        'subí 32 videos casi al mismo tiempo',
        '27 quedaron sin registrarse como subidos',
        'el sistema guardaba una lista vieja mientras yo seguía subiendo',
      ],
      resultadoNumero: 27,
      resultadoDetalle: '26 se recuperaron a la primera. 1 necesitó un segundo intento.',
      verificacion: 'Lo comprobé a mano, línea por línea: quedó todo igual.',
      cierre: 'Esto es lo que no se ve en el video final.',
      t: {
        hookIntro: 0,
        hookMedio: 1.2,
        hookImpacto: 2.0,
        hookAclaracion: 3.1,
        pruebaAparece: 8.9,
        lineaSigue: 18.0,
        resultadoCountDesde: 19.5,
        resultadoCountDuracion: 1.5,
        resultadoDetalle: 21.2,
        verificacion: 23.5,
        cierre: 27.5,
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
