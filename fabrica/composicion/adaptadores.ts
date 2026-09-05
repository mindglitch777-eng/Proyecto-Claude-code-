/**
 * Adaptadores de props por categoria (Ronda 2, item pendiente #10):
 * dos componentes de la MISMA categoria pueden tener contratos de
 * props completamente distintos (grafico espera una serie neutral,
 * recibo espera un balance de dinero con timings fijos). Sin esto, un
 * script generador tiene que "adivinar" que forma de props armar
 * DESPUES de que el Director Visual elige un ganador que no se sabe
 * de antemano -- lo que paso de verdad armando fabrica-demo-03
 * (fabrica/ejemplos/generar_demo_03.ts), resuelto ahi con un `if`
 * puntual.
 *
 * Esto generaliza ESE caso puntual a un adaptador real: un modelo de
 * datos neutral por categoria + una funcion que arma la forma de
 * props correcta segun el id del componente ganador. No es magia:
 * cubre los componentes reales de cada categoria que de verdad
 * representan el mismo tipo de dato (una progresion numerica; una
 * comparacion de dos lados) -- los que no encajan en ese concepto
 * (`embudo`, con N pisos en vez de una progresion o dos lados;
 * `explicador`, una tabla de conceptos, no una serie) quedan
 * explicitamente AFUERA, con un error claro si se los pide, en vez de
 * forzar una traduccion que no tiene sentido.
 */
// Mismo formato que `plata()` en remotion-spike/src/escenas/plata.tsx
// ('$' + separador de miles es-AR) -- no se importa de ahi porque
// fabrica/ es un paquete Node standalone, independiente de
// remotion-spike/ (ver fabrica/README.md).
function formatearPlata(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

export type PuntoProgresion = {etiqueta: string; valor: number};

export type DatosProgresion = {
  titulo?: string;
  puntos: PuntoProgresion[]; // 2+ puntos, orden cronologico
  etiqueta?: string; // ej. "ventas/semana"
  fuente?: string;
  esDinero?: boolean; // si true, los valores se formatean y tratan como moneda
};

const COMPONENTES_CIFRA_SOPORTADOS = [
  'grafico', 'recibo', 'contador', 'cifra-se-cae', 'torre-3d',
  'cataclismo-datos',
] as const;

export function propsParaCifra(componenteId: string, datos: DatosProgresion): Record<string, unknown> {
  if (datos.puntos.length < 2) {
    throw new Error('propsParaCifra: se necesitan al menos 2 puntos para representar una progresion');
  }
  const primero = datos.puntos[0];
  const ultimo = datos.puntos[datos.puntos.length - 1];

  switch (componenteId) {
    case 'grafico':
      return {
        idea: {
          titulo: datos.titulo ?? '',
          datos: datos.puntos.map((p) => ({etiqueta: p.etiqueta, valor: p.valor})),
          etiqueta: datos.etiqueta ?? '',
          fuente: datos.fuente ?? '',
        },
      };

    case 'recibo': {
      // Solo tiene sentido narrativo si los valores SON dinero de
      // verdad -- un "recibo" mostrando cantidades sin unidad de
      // moneda confundiria al espectador (seccion 7: representar mal
      // el concepto es peor que no representarlo).
      if (!datos.esDinero) {
        throw new Error('propsParaCifra: "recibo" solo tiene sentido para progresiones de dinero (esDinero=true)');
      }
      const separacionSeg = 1.6;
      const entra = datos.puntos.map((p, i) => ({txt: p.etiqueta, monto: p.valor, t: 0.6 + i * separacionSeg}));
      return {
        titulo: datos.titulo ?? '',
        entra,
        sale: [],
        total: {txt: 'Total', t: 0.6 + datos.puntos.length * separacionSeg},
      };
    }

    case 'contador':
      return {
        arriba: datos.titulo,
        desde: primero.valor,
        hasta: ultimo.valor,
        abajo: datos.etiqueta,
        prefijo: datos.esDinero ? '$' : '',
      };

    case 'cifra-se-cae': {
      const fmt = (v: number) => (datos.esDinero ? formatearPlata(v) : String(v));
      return {arriba: datos.titulo, de: fmt(primero.valor), a: fmt(ultimo.valor), abajo: datos.etiqueta};
    }

    // R7-21: bug real encontrado generando fabrica-demo-06 -- Torre3D
    // (R6-10, primer componente 3D real de la fabrica, categoria
    // 'cifra') nunca se conecto a este adaptador. Mismo contrato que
    // 'contador' (cuenta desde 0 real hasta un valor final unico, no
    // "desde/hasta" como cifra-se-cae) -- ver Torre3D.tsx, props
    // {arriba?, hasta, abajo?, prefijo?}.
    case 'torre-3d':
      return {
        arriba: datos.titulo,
        hasta: ultimo.valor,
        abajo: datos.etiqueta,
        prefijo: datos.esDinero ? '$' : '',
      };

    // R8: cataclismo-datos (remotion-spike/effects/CataclimoData.tsx) es
    // una transicion violenta ANTES->DESPUES entre exactamente dos
    // cifras -- toma el primer y ultimo punto de la progresion, ignora
    // los intermedios si los hubiera (igual que cifra-se-cae).
    case 'cataclismo-datos': {
      const fmt = (v: number) => (datos.esDinero ? formatearPlata(v) : String(v));
      return {oldNumber: fmt(primero.valor), newNumber: fmt(ultimo.valor)};
    }

    default:
      throw new Error(
        `propsParaCifra: no hay adaptador para "${componenteId}" -- componentes soportados: ${COMPONENTES_CIFRA_SOPORTADOS.join(', ')}. ` +
          `Si es un componente real nuevo de categoria 'cifra' que SI representa una progresion numerica, agregar un caso aca.`
      );
  }
}

export type LadoComparacion = {rotulo: string; texto: string; peso?: number};

export type DatosComparacion = {
  izquierda: LadoComparacion;
  derecha: LadoComparacion;
  remate?: string;
};

const COMPONENTES_COMPARACION_SOPORTADOS = [
  'antes-despues', 'balanza', 'duelo', 'devorador-realidad', 'bar-brawl',
] as const;

export function propsParaComparacion(componenteId: string, datos: DatosComparacion): Record<string, unknown> {
  switch (componenteId) {
    case 'antes-despues':
      return {
        antes: {rotulo: datos.izquierda.rotulo, txt: datos.izquierda.texto},
        despues: {rotulo: datos.derecha.rotulo, txt: datos.derecha.texto},
      };

    case 'balanza':
      return {
        izq: {txt: datos.izquierda.rotulo, peso: datos.izquierda.peso ?? 5},
        der: {txt: datos.derecha.rotulo, peso: datos.derecha.peso ?? 5},
        pie: datos.remate,
      };

    case 'duelo':
      return {
        izq: {rotulo: datos.izquierda.rotulo, valor: datos.izquierda.texto},
        der: {rotulo: datos.derecha.rotulo, valor: datos.derecha.texto},
        remate: datos.remate,
      };

    // R8: devorador-realidad y bar-brawl (remotion-spike/effects/) SI
    // tienen un ganador explicito (uno "pierde" contra el otro), a
    // diferencia de antes-despues/balanza/duelo que solo contrastan sin
    // declarar vencedor. El ganador sale del peso declarado -- mayor
    // peso gana; si no hay peso o estan empatados, gana la derecha
    // (misma convencion que balanza: el lado derecho es el destino/lo
    // deseado en la mayoria de los guiones de venta).
    case 'devorador-realidad': {
      const derechaGana = (datos.derecha.peso ?? 0) >= (datos.izquierda.peso ?? 0);
      return {
        loserObject: derechaGana ? datos.izquierda.texto : datos.derecha.texto,
        winnerObject: derechaGana ? datos.derecha.texto : datos.izquierda.texto,
      };
    }

    case 'bar-brawl': {
      const derechaGana = (datos.derecha.peso ?? 0) >= (datos.izquierda.peso ?? 0);
      return {
        labelA: datos.izquierda.rotulo,
        labelB: datos.derecha.rotulo,
        winner: derechaGana ? 'B' : 'A',
      };
    }

    default:
      throw new Error(
        `propsParaComparacion: no hay adaptador para "${componenteId}" -- componentes soportados: ${COMPONENTES_COMPARACION_SOPORTADOS.join(', ')}. ` +
          `'embudo' (N pisos) no encaja en el concepto de "dos lados" -- necesitaria su propio adaptador, no forzarlo aca.`
      );
  }
}

// R8: adaptador de categoria 'texto' -- el mas concurrido del catalogo
// (17 componentes). Todos comparten el MISMO concepto neutral: una
// frase corta de impacto (mas 1-2 colores de acento opcionales), asi
// que un solo modelo de datos alcanza. 'remate' queda afuera a
// proposito: requiere video obligatorio (nunca gana si
// assetsDisponibles no trae 'video', pero si algun dia lo trae, su
// forma de props -- d.lineas/d.grande/d.pie con video obligatorio -- es
// bastante distinta de "una frase" como para forzarla aca). 'silueta'
// tiene el mismo acoplamiento a `Idea` de ../guion.ts (motor viejo)
// documentado en componentes/README.md -- se mapea igual porque en la
// practica el arbol viaja como JSON sin chequeo de tipo estricto, pero
// queda anotado por si el tipo real de Idea exige mas campos.
export type DatosTexto = {
  frase: string;
  colorPrincipal?: string;
  colorSecundario?: string;
};

const COMPONENTES_TEXTO_SOPORTADOS = [
  'tres-verdades', 'punch', 'silueta',
  'arquitectura-neon', 'glitch-shatter', 'heartbeat-pulse', 'text-reveal-fire',
  'circle-of-truth', 'gold-rush', 'liquid-metal', 'chromatic-shift',
  'wave-distortion', 'starburst-flare', 'vortex-transport', 'aurora-shine', 'neon-ripple',
] as const;

export function propsParaTexto(componenteId: string, datos: DatosTexto): Record<string, unknown> {
  const c1 = datos.colorPrincipal ?? '#FFFFFF';
  const c2 = datos.colorSecundario ?? c1;

  switch (componenteId) {
    case 'tres-verdades':
      return {frases: [datos.frase]};

    case 'punch':
      return {lineas: [datos.frase], entra: [0.3]};

    case 'silueta':
      return {idea: {tipo: 'silueta', texto: datos.frase, pie: ''}};

    case 'arquitectura-neon':
      return {text: datos.frase, mainColor: c1, sparkColor: c2};

    case 'glitch-shatter':
      return {text: datos.frase, glitchColor: c1};

    case 'heartbeat-pulse':
      return {text: datos.frase, pulseColor: c1};

    case 'text-reveal-fire':
      return {text: datos.frase, fireColor: c1, textColor: c2};

    case 'circle-of-truth':
      return {content: datos.frase, circleColor: c1};

    case 'gold-rush':
      return {achievementText: datos.frase, goldColor: c1};

    case 'liquid-metal':
      return {text: datos.frase, metalColor: c1, glowColor: c2};

    case 'chromatic-shift':
      return {text: datos.frase};

    case 'wave-distortion':
      return {text: datos.frase, waveColor: c1};

    case 'starburst-flare':
      return {text: datos.frase, starColor: c1};

    case 'vortex-transport':
      return {text: datos.frase, vortexColor: c1};

    case 'aurora-shine':
      return {text: datos.frase, auroraColor1: c1, auroraColor2: c2};

    case 'neon-ripple':
      return {text: datos.frase, rippleColor: c1, coreColor: c2};

    default:
      throw new Error(
        `propsParaTexto: no hay adaptador para "${componenteId}" -- componentes soportados: ${COMPONENTES_TEXTO_SOPORTADOS.join(', ')}. ` +
          `'remate' queda afuera (requiere video obligatorio, forma de props d.lineas/d.grande/d.pie distinta de "una frase").`
      );
  }
}

// R8: adaptador de categoria 'lista' -- solo cubre los componentes que
// de verdad representan "varios items cortos, en fila/cascada", NO
// TODOS los de la categoria: 'pasos'/'logos-herramientas' requieren
// iconos obligatorios (quedan afuera del Director si no hay
// assetsDisponibles con 'icono'), y 'ranking' necesita un VALOR
// numerico por fila -- forzar nombres de pasos ahi como si fueran
// puntajes representaria mal el concepto (seccion 7 del principio de
// adaptadores). 'lista-tachada' tampoco entra: su narrativa es
// "varios items se tachan, uno queda en pie", no "N pasos secuenciales".
export type DatosLista = {
  items: string[]; // 2 a 5 items cortos
  color?: string;
};

const COMPONENTES_LISTA_SOPORTADOS = ['flip-cards'] as const;

export function propsParaLista(componenteId: string, datos: DatosLista): Record<string, unknown> {
  switch (componenteId) {
    case 'flip-cards':
      return {items: datos.items, cardColor: datos.color ?? '#003366'};

    default:
      throw new Error(
        `propsParaLista: no hay adaptador para "${componenteId}" -- componentes soportados: ${COMPONENTES_LISTA_SOPORTADOS.join(', ')}. ` +
          `'lista-tachada' (tachar items) y 'ranking' (valor numerico por fila) representan otro concepto -- no forzarlos aca.`
      );
  }
}

// R8: adaptador de categoria 'logos' -- reveal de marca/logo/cuenta al
// cierre de un video. Ambos componentes reales aceptan imagen Y color
// de acento; solo spotlight-reveal tambien acepta texto/nombre de
// cuenta por separado de la imagen.
export type DatosLogo = {
  texto?: string;
  imagenUrl?: string; // opcional -- nunca inventar una URL real si no la dio el operador
  colorDestacado: string;
};

const COMPONENTES_LOGOS_SOPORTADOS = ['mercurio-revelador', 'spotlight-reveal'] as const;

export function propsParaLogos(componenteId: string, datos: DatosLogo): Record<string, unknown> {
  switch (componenteId) {
    case 'mercurio-revelador':
      return {logoImage: datos.imagenUrl ?? '', highlightColor: datos.colorDestacado};

    case 'spotlight-reveal':
      return {
        text: datos.texto,
        logoImage: datos.imagenUrl,
        spotColor: datos.colorDestacado,
      };

    default:
      throw new Error(
        `propsParaLogos: no hay adaptador para "${componenteId}" -- componentes soportados: ${COMPONENTES_LOGOS_SOPORTADOS.join(', ')}.`
      );
  }
}
