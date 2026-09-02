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

// ── Ronda 3: variedad real de golpes (antes: mapa 1:1 fijo, "impacto"
// SIEMPRE daba "fogonazo" sin importar que ya se hubiera usado) ──
{
  const r1 = d.decidirParaUnidad({indice: 2, total: 5, intensidadVisual: 0.9});
  check('impacto sin evitar nada: sigue dando fogonazo (compat con el default viejo)', r1.golpeSugerido === 'fogonazo');
  const r2 = d.decidirParaUnidad({indice: 3, total: 5, intensidadVisual: 0.9, evitarGolpes: ['fogonazo']});
  check('impacto evitando fogonazo: elige otro real del mismo nivel (sacudon), no rompe', r2.golpeSugerido === 'sacudon');
  check('sigue siendo nivel impacto aunque cambie el golpe concreto', r2.nivel === 'impacto');
}
{
  const r = d.decidirParaUnidad({indice: 4, total: 5, intensidadVisual: 0.2, esCierre: true, evitarGolpes: ['negro']});
  check('cierre evitando negro: elige fundido (el otro real de "pausa")', r.golpeSugerido === 'fundido');
}
{
  // si TODOS los golpes del nivel ya se usaron, no rompe -- repite el
  // preferido antes que tirar un error o un tipo invalido.
  const r = d.decidirParaUnidad({indice: 3, total: 5, intensidadVisual: 0.5, esRevelacion: true, evitarGolpes: ['sacudon', 'fogonazo', 'iris']});
  check('revelacion con todos los golpes evitados: no rompe, repite el preferido', r.golpeSugerido === 'sacudon');
}

if (FALLOS.length) {
  console.error(`${FALLOS.length} FALLO(S):`);
  FALLOS.forEach((f) => console.error(' ' + f));
  process.exit(1);
}
console.log('Todos los tests del Director de Audio pasaron OK.');
