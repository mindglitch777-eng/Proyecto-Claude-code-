/**
 * Microeventos (orden maestra, seccion 7): cambios significativos
 * DENTRO de una escena. Regla dura de este modulo, no negociable:
 * TODO microevento se ancla a un limite de tiempo REAL (un offset de
 * audio ya medido, o el inicio/fin de la escena) -- nunca un numero
 * inventado a ojo ("a los 2.3s conviene que pase algo"). La voz sigue
 * siendo la fuente de verdad del timing (seccion 8 de esta orden y
 * regla ya establecida en Ronda 2/3): esto no la reemplaza, construye
 * SOBRE ella.
 *
 * Hallazgo real que motiva este modulo (ver analisis de
 * fabrica-demo-04.mp4 en MEJORAS_RONDA4.md): la escena "impacto" tiene
 * DOS clips de audio (antes / despues), pero el componente
 * AntesDespues cambiaba de cara segun una FRACCION FIJA de la
 * duracion TOTAL de la escena (42%-62%), sin importar cuando el audio
 * realmente empezaba a hablar del "despues". Eso genero un desfasaje
 * real medido de ~1.6s (la voz ya decia "47 clientes... $2.209" con la
 * pantalla todavia mostrando "$47"). El microevento
 * 'se_revela_comparacion' anclado al offset real del segundo clip es
 * la correccion: FabricaVideo.tsx lo traduce a la prop real
 * `momentoCambioSeg` de AntesDespues (ver ese componente).
 */
import type {CombinacionEstilos} from './estilos';
import type {ContextoUnidad, ElementoDestacado, MicroEvento} from './tipos';

export function construirMicroeventos(
  ctx: ContextoUnidad,
  combinacion: CombinacionEstilos,
  elementoPrincipal: ElementoDestacado,
  elementoSecundario: ElementoDestacado | undefined,
  respiracion: boolean
): MicroEvento[] {
  const eventos: MicroEvento[] = [];
  const offsets = ctx.offsetsAudioSeg;

  // Respiracion (seccion 18): a proposito, casi nada mas alla de la
  // entrada -- "el sistema tambien debe poder decidir NO poner nada".
  if (respiracion) {
    eventos.push({
      enSegRelativo: 0,
      tipo: 'entra_elemento_principal',
      descripcion: `entra ${elementoPrincipal.descripcion}, sin agregar mas capas`,
      razon: 'unidad de respiracion deliberada -- agregar mas microeventos competiria con el silencio que se busca',
    });
    eventos.push({
      enSegRelativo: 0,
      tipo: 'silencio',
      descripcion: 'la escena se sostiene sin cambios adicionales',
      razon: 'el respiro es la funcion de esta unidad, no un vacio por falta de contenido',
    });
    return eventos;
  }

  // Entrada del elemento principal: siempre en 0 (inicio real de la
  // escena) salvo que la estrategia de entrada sea diferida, en cuyo
  // caso se ancla al primer offset de audio disponible (si existe) en
  // vez de inventar un numero -- si no hay ningun offset, se mantiene
  // en 0 (mejor una entrada inmediata real que una diferida inventada).
  eventos.push({
    enSegRelativo: 0,
    tipo: 'entra_elemento_principal',
    descripcion: `entra ${elementoPrincipal.descripcion}`,
    razon: `elemento principal de la unidad "${ctx.unidadId}"`,
  });

  // Multi-audio real (2+ clips): cada offset siguiente al primero es
  // un limite real donde puede pasar algo nuevo -- que tipo de
  // microevento depende de la categoria/elemento, nunca de una
  // posicion temporal arbitraria.
  for (let i = 1; i < offsets.length; i++) {
    const offset = offsets[i];
    if (ctx.categoria === 'comparacion') {
      eventos.push({
        enSegRelativo: offset,
        tipo: 'se_revela_comparacion',
        descripcion: 'la narracion empieza a describir el lado "despues"/consecuencia de la comparacion',
        razon: `offset real del clip de audio #${i} (${offset.toFixed(2)}s) -- el cambio visual debe ocurrir aca, no a mitad de la duracion total de la escena`,
      });
    } else if (ctx.tipoDatoDestacado && ctx.esRepeticionTratada) {
      eventos.push({
        enSegRelativo: offset,
        tipo: 'cambia_cifra',
        descripcion: 'la cifra protagonista cambia (tratamiento de repeticion ya aplicado)',
        razon: `offset real del clip de audio #${i} (${offset.toFixed(2)}s)`,
      });
    } else if (elementoSecundario) {
      eventos.push({
        enSegRelativo: offset,
        tipo: 'entra_elemento_secundario',
        descripcion: `entra ${elementoSecundario.descripcion}`,
        razon: `offset real del clip de audio #${i} (${offset.toFixed(2)}s) -- la narracion empieza a hablar de esto en este punto`,
      });
    } else {
      eventos.push({
        enSegRelativo: offset,
        tipo: 'aparece_dato_apoyo',
        descripcion: 'informacion de apoyo nueva',
        razon: `offset real del clip de audio #${i} (${offset.toFixed(2)}s)`,
      });
    }
  }

  // SFX de entrada si el estilo combinado lo prefiere Y la unidad no
  // es de energia/densidad minima -- anclado al mismo offset del
  // elemento principal (0), no a un momento nuevo inventado.
  if (combinacion.tiposMicroEventoPreferidos.includes('entra_sfx') && combinacion.densidadVisual !== 'minima') {
    eventos.push({
      enSegRelativo: 0,
      tipo: 'entra_sfx',
      descripcion: 'SFX de entrada acompanando el elemento principal',
      razon: 'estilo combinado incluye enfasis sonoro en la entrada (ver estilos.ts, tiposMicroEventoPreferidos)',
    });
  }

  return eventos;
}
