/**
 * Director Visual (Fase 4). Filtra y puntua el registro de
 * componentes -- nunca "si categoria === X entonces componente Y".
 * Agregar un componente 501 al registro no requiere tocar una linea
 * de este archivo (seccion 5 del prompt maestro).
 *
 * El score es una HEURISTICA declarada como tal (seccion 8): sirve
 * para ordenar candidatos razonablemente, no es una medida de calidad
 * real hasta que haya datos de publicaciones reales que la
 * reemplacen/corrijan (ver fabrica/laboratorio/).
 */
import type {ComponenteRegistrado} from '../componentes/tipos';
import type {CandidatoComponente, ConsultaVisual} from './tipos';

const ORDEN_CAPACIDAD_TEXTO = ['ninguna', 'corta', 'media', 'larga'] as const;

export class DirectorVisual {
  constructor(private registro: ComponenteRegistrado[]) {}

  /** Devuelve los mejores candidatos para una unidad narrativa,
   * ordenados de mayor a menor score, con las razones de cada uno. */
  consultar(q: ConsultaVisual, limite = 5): CandidatoComponente[] {
    const candidatos: CandidatoComponente[] = [];

    for (const c of this.registro) {
      // ─── filtros duros: si no cumple esto, ni se puntua ───
      if (!q.categorias.includes(c.categoria)) continue;
      if (q.requiereAudioSincronizado && !c.soportaAudioSincronizado) continue;
      if (c.requiereAssets.obligatorio && !q.assetsDisponibles.includes(c.requiereAssets.tipo)) continue;

      const razones: string[] = [];
      let score = 0;

      // intensidad: cuanto mas cerca de lo deseado, mejor (peso 2)
      const difIntensidad = Math.abs(c.intensidad - q.intensidadDeseada);
      const puntajeIntensidad = 2 * (1 - difIntensidad);
      score += puntajeIntensidad;
      razones.push(`intensidad ${c.intensidad} vs deseada ${q.intensidadDeseada} -> +${puntajeIntensidad.toFixed(2)}`);

      // capacidad de texto: exacta = full, adyacente = mitad, lejos = penaliza
      const idxNecesaria = ORDEN_CAPACIDAD_TEXTO.indexOf(q.capacidadTextoNecesaria);
      const idxComponente = ORDEN_CAPACIDAD_TEXTO.indexOf(c.capacidadTexto);
      const difCapacidad = Math.abs(idxNecesaria - idxComponente);
      const puntajeCapacidad = difCapacidad === 0 ? 1.5 : difCapacidad === 1 ? 0.5 : -1;
      score += puntajeCapacidad;
      razones.push(`capacidadTexto ${c.capacidadTexto} vs necesaria ${q.capacidadTextoNecesaria} -> ${puntajeCapacidad >= 0 ? '+' : ''}${puntajeCapacidad}`);

      // duracion: si el audio real entra comodo en el rango del
      // componente, suma; si esta muy afuera, resta (pero no excluye
      // -- el rango es aproximado, ver notas del registro).
      const [minS, maxS] = c.duracionMinMaxSeg;
      let puntajeDuracion: number;
      if (q.duracionDisponibleSeg >= minS && q.duracionDisponibleSeg <= maxS) {
        puntajeDuracion = 1;
      } else {
        const distancia = q.duracionDisponibleSeg < minS ? minS - q.duracionDisponibleSeg : q.duracionDisponibleSeg - maxS;
        puntajeDuracion = Math.max(-1.5, -distancia / 5);
      }
      score += puntajeDuracion;
      razones.push(`duracion real ${q.duracionDisponibleSeg}s vs rango [${minS},${maxS}]s -> ${puntajeDuracion >= 0 ? '+' : ''}${puntajeDuracion.toFixed(2)}`);

      // assets: si pide asset opcional y esta disponible, bonus chico
      if (c.requiereAssets.tipo !== 'ninguno' && !c.requiereAssets.obligatorio) {
        if (q.assetsDisponibles.includes(c.requiereAssets.tipo)) {
          score += 0.3;
          razones.push('asset opcional disponible -> +0.3');
        }
      }

      // estado: preferir componentes ya validados (leidos/probados) a
      // los catalogados solo por nombre.
      if (c.estado === 'sin_validar') {
        score -= 0.75;
        razones.push('estado=sin_validar (metadata no confirmada) -> -0.75');
      }

      // anti-repeticion (seccion 16): resta, no descalifica -- si un
      // patron ya demostro resultado real bueno, esa señal (cuando
      // exista, ver fabrica/laboratorio/) debería compensar esto.
      if (q.evitar?.includes(c.id)) {
        score -= 1;
        razones.push('usado recientemente (anti-repeticion) -> -1');
      }

      candidatos.push({componente: c, score, razones});
    }

    candidatos.sort((a, b) => b.score - a.score);
    return candidatos.slice(0, limite);
  }
}
