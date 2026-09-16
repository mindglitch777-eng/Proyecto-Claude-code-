/**
 * "EL ERROR REAL" #1 -- "27 registros se perdieron".
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
 * (carrusel-11) necesitó un segundo intento. Verificado con `diff`
 * real que los archivos quedaron idénticos entre la rama y main.
 *
 * Pedido explícito del operador tras ver el piloto documental: "nadie
 * va a mirar los logs y entender que hubo un problema" -- el NÚMERO
 * real es el gancho dramático (grande, rojo), el log queda como
 * evidencia breve y secundaria, nunca como protagonista.
 *
 * Componente nuevo: `bug-real` (agresivo/BugReal.tsx) -- ninguno del
 * catálogo básico servía para esta estructura (gancho numérico + prueba
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
    textoVoz: '27 registros se perdieron. No los videos -- el registro de qué ya subí. '
      + 'Esto es lo que pasó: cada entrega escribía el registro desde una foto vieja en memoria, '
      + 'y la que perdía la carrera de git se pisaba con la otra. '
      + 'Veintiséis entraron a la primera. Uno necesitó un segundo intento. '
      + 'Verificado con diff real: idéntico entre la rama y main. '
      + 'Esto es lo que no se ve en el video final.',
    componenteId: 'bug-real',
    props: {
      numeroGrande: '27',
      numeroEtiqueta: 'registros se perdieron',
      aclaracion: 'No los videos. El registro de qué ya subí.',
      pruebaTitulo: 'el log real',
      pruebaLineas: [
        '32 entregas casi simultáneas',
        'state/uploads.json: 27 entradas sin guardar',
        'causa: cada corrida escribía desde una foto vieja',
      ],
      resultadoNumero: 27,
      resultadoDetalle: '26 entraron a la primera. 1 necesitó un segundo intento.',
      verificacion: 'Verificado con diff real: idéntico entre la rama y main.',
      cierre: 'Esto es lo que no se ve en el video final.',
      t: {
        hookNumero: 0,
        hookAclaracion: 1.9,
        pruebaAparece: 3.8,
        lineaSigue: 7.7,
        resultadoCountDesde: 9.5,
        resultadoCountDuracion: 1.5,
        resultadoDetalle: 11.5,
        verificacion: 13.9,
        cierre: 16.6,
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
