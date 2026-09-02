import {DirectorAudio} from './audio';

const FALLOS: string[] = [];
function check(desc: string, cond: boolean) {
  if (!cond) FALLOS.push(`FALLO: ${desc}`);
}

const d = new DirectorAudio();

{
  const r = d.decidirParaUnidad({indice: 0, total: 5, intensidadVisual: 0.8});
  check('primera unidad: sin golpe (no hay corte que marcar)', r.golpeSugerido === 'ninguno');
}
{
  const r = d.decidirParaUnidad({indice: 2, total: 5, intensidadVisual: 0.9});
  check('intensidad visual alta -> nivel impacto', r.nivel === 'impacto');
  check('impacto -> golpe fogonazo', r.golpeSugerido === 'fogonazo');
}
{
  const r = d.decidirParaUnidad({indice: 4, total: 5, intensidadVisual: 0.2, esCierre: true});
  check('cierre -> nivel pausa sin importar intensidad visual baja', r.nivel === 'pausa');
}
{
  const r = d.decidirParaUnidad({indice: 3, total: 5, intensidadVisual: 0.5, esRevelacion: true});
  check('revelacion marcada -> nivel revelacion siempre', r.nivel === 'revelacion');
}
{
  const r = d.decidirParaUnidad({indice: 1, total: 5, intensidadVisual: 0.9});
  check('musica siempre null (bloqueado, no inventado)', r.musicaSugerida === null);
}

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Director de Audio pasaron OK.');
