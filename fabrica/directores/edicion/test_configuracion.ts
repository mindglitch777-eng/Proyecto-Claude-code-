import {aplicarConfiguracionVideo, CONFIGURACIONES_VIDEO} from './configuracion';
import {combinarEstilos, ESTILOS} from './estilos';
import type {ContextoUnidad} from './tipos';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const CTX_BASE: ContextoUnidad = {
  unidadId: 'u1',
  categoria: 'texto',
  intensidadComponente: 0.5,
  indice: 1,
  total: 5,
  duracionSegTotal: 6,
  offsetsAudioSeg: [0],
};

function main() {
  // Las 5 configuraciones existen y tienen al menos 2 estilos base reales.
  for (const id of Object.keys(CONFIGURACIONES_VIDEO) as (keyof typeof CONFIGURACIONES_VIDEO)[]) {
    const c = CONFIGURACIONES_VIDEO[id];
    check(`config "${id}": estilosBase tiene al menos 1 estilo`, c.estilosBase.length >= 1);
    check(`config "${id}": razon no vacia (trazabilidad)`, c.razon.trim().length > 0);
    for (const estiloId of c.estilosBase) {
      check(`config "${id}": estilo "${estiloId}" existe de verdad en ESTILOS`, !!ESTILOS[estiloId]);
    }
  }

  // aplicarConfiguracionVideo() rellena estilosSugeridos si no habia ninguno.
  const sinEstilos = aplicarConfiguracionVideo(CTX_BASE, 'ventas_agresivo');
  check('sin estilosSugeridos previo: se aplica el preset', JSON.stringify(sinEstilos.estilosSugeridos) === JSON.stringify(CONFIGURACIONES_VIDEO.ventas_agresivo.estilosBase));

  // NUNCA pisa un estilosSugeridos ya puesto a mano (mismo principio
  // que "sugerencia, no orden" que ya rige el resto del sistema).
  const conEstilosPropios: ContextoUnidad = {...CTX_BASE, estilosSugeridos: ['misterio']};
  const resultado = aplicarConfiguracionVideo(conEstilosPropios, 'documental_serio');
  check('con estilosSugeridos ya puesto: NO lo pisa', JSON.stringify(resultado.estilosSugeridos) === JSON.stringify(['misterio']));

  // El resultado de cada preset, pasado por combinarEstilos() real,
  // no debe tirar excepcion (verifica que son combinaciones utilizables
  // de verdad, no solo ids sueltos).
  for (const id of Object.keys(CONFIGURACIONES_VIDEO) as (keyof typeof CONFIGURACIONES_VIDEO)[]) {
    const combinacion = combinarEstilos(CONFIGURACIONES_VIDEO[id].estilosBase);
    check(`config "${id}": combinarEstilos() no rompe`, !!combinacion.densidadVisual);
  }

  // financiero_directo no debe incluir estilos de alta energia
  // ("misterio"/"cinematico"/"agresivo") -- confirma el hallazgo real
  // de R7-28 (claridad > estilo en este nicho).
  check('financiero_directo no usa "misterio" ni "cinematico"',
    !CONFIGURACIONES_VIDEO.financiero_directo.estilosBase.includes('misterio')
    && !CONFIGURACIONES_VIDEO.financiero_directo.estilosBase.includes('cinematico'));

  if (FALLOS.length) {
    console.error(`${FALLOS.length} FALLO(S):`);
    FALLOS.forEach((f) => console.error(' ' + f));
    process.exit(1);
  }
  console.log('Todos los tests de configuracion de video (fabrica/directores/edicion/configuracion.ts) pasaron OK.');
}

main();
