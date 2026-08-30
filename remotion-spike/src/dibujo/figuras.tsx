import React from 'react';

// BIBLIOTECA DE DIBUJOS
//
// Cada figura esta hecha con lineas, dentro de un cuadrado de 100x100.
// Lo importante: NO aparecen de golpe, se DIBUJAN solas, como si alguien
// las estuviera trazando con un marcador. Eso es lo que hace el motor
// nuevo y el viejo no podia.
//
// El truco: a cada linea se le dice "tu largo es 1", se la pinta toda de
// rayitas de largo 1, y se corre esa rayita de 1 a 0. A medio camino se
// ve media linea. Eso da el trazo.

export type NombreFigura =
  | 'persona' | 'gente' | 'reloj' | 'billete' | 'moneda' | 'notebook'
  | 'telefono' | 'chip' | 'nube' | 'robot' | 'engranaje' | 'documento'
  | 'carpeta' | 'local' | 'edificio' | 'lupa' | 'mapa' | 'etiqueta'
  | 'barras' | 'candado' | 'mensaje' | 'calendario' | 'cohete' | 'balanza'
  | 'ojo' | 'foco' | 'carrito' | 'tacho';

type P = {p: number; col: string; grosor: number};

// Cada figura es una lista de trazos. Se dibujan EN ORDEN, no todos
// juntos: primero el contorno, despues los detalles. Asi se lee como
// alguien dibujando y no como una animacion.
const T = ({d, p, col, grosor, orden = 0, total = 1, relleno}: P & {
  d: string; orden?: number; total?: number; relleno?: boolean;
}) => {
  const tramo = 1 / total;
  const local = Math.max(0, Math.min(1, (p - orden * tramo) / tramo));
  return (
    <path
      d={d}
      fill={relleno ? col : 'none'}
      fillOpacity={relleno ? local : 0}
      stroke={col}
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - local}
    />
  );
};

const C = ({cx, cy, r, p, col, grosor, orden = 0, total = 1, relleno}: P & {
  cx: number; cy: number; r: number; orden?: number; total?: number; relleno?: boolean;
}) => {
  const tramo = 1 / total;
  const local = Math.max(0, Math.min(1, (p - orden * tramo) / tramo));
  return (
    <circle
      cx={cx} cy={cy} r={r}
      fill={relleno ? col : 'none'}
      fillOpacity={relleno ? local : 0}
      stroke={col}
      strokeWidth={grosor}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - local}
    />
  );
};

const DIBUJOS: Record<NombreFigura, (a: P) => React.ReactNode> = {
  persona: (a) => (
    <>
      <C cx={50} cy={26} r={15} {...a} orden={0} total={2} />
      <T d="M20 92 C20 66 38 54 50 54 C62 54 80 66 80 92" {...a} orden={1} total={2} />
    </>
  ),
  gente: (a) => (
    <>
      <C cx={30} cy={30} r={12} {...a} orden={0} total={4} />
      <T d="M8 88 C8 66 20 56 30 56 C40 56 52 66 52 88" {...a} orden={1} total={4} />
      <C cx={70} cy={34} r={11} {...a} orden={2} total={4} />
      <T d="M50 88 C50 68 61 59 70 59 C79 59 92 68 92 88" {...a} orden={3} total={4} />
    </>
  ),
  reloj: (a) => (
    <>
      <C cx={50} cy={52} r={38} {...a} orden={0} total={3} />
      <T d="M50 52 L50 28" {...a} orden={1} total={3} />
      <T d="M50 52 L68 62" {...a} orden={2} total={3} />
    </>
  ),
  billete: (a) => (
    <>
      <T d="M8 28 H92 V72 H8 Z" {...a} orden={0} total={3} />
      <C cx={50} cy={50} r={13} {...a} orden={1} total={3} />
      <T d="M50 40 V60 M44 45 H56 M44 55 H56" {...a} orden={2} total={3} />
    </>
  ),
  moneda: (a) => (
    <>
      <C cx={50} cy={50} r={36} {...a} orden={0} total={2} />
      <T d="M50 28 V72 M40 38 H58 A7 7 0 0 1 58 52 H42 A7 7 0 0 0 42 66 H60" {...a} orden={1} total={2} />
    </>
  ),
  notebook: (a) => (
    <>
      <T d="M18 24 H82 V64 H18 Z" {...a} orden={0} total={2} />
      <T d="M6 76 H94 L86 64 H14 Z" {...a} orden={1} total={2} />
    </>
  ),
  telefono: (a) => (
    <>
      <T d="M28 6 H72 A6 6 0 0 1 78 12 V88 A6 6 0 0 1 72 94 H28 A6 6 0 0 1 22 88 V12 A6 6 0 0 1 28 6 Z" {...a} orden={0} total={2} />
      <T d="M42 14 H58" {...a} orden={1} total={2} />
    </>
  ),
  chip: (a) => (
    <>
      <T d="M26 26 H74 V74 H26 Z" {...a} orden={0} total={3} />
      <T d="M42 42 H58 V58 H42 Z" {...a} orden={1} total={3} />
      <T d="M38 26 V10 M62 26 V10 M38 74 V90 M62 74 V90 M26 38 H10 M26 62 H10 M74 38 H90 M74 62 H90" {...a} orden={2} total={3} />
    </>
  ),
  nube: (a) => (
    <T d="M26 72 A18 18 0 0 1 28 37 A24 24 0 0 1 72 34 A16 16 0 0 1 76 72 Z" {...a} />
  ),
  robot: (a) => (
    <>
      <T d="M22 32 H78 V80 H22 Z" {...a} orden={0} total={4} />
      <C cx={38} cy={50} r={6} {...a} orden={1} total={4} />
      <C cx={62} cy={50} r={6} {...a} orden={2} total={4} />
      <T d="M38 66 H62 M50 32 V16 M50 16 A5 5 0 1 0 50 15.9" {...a} orden={3} total={4} />
    </>
  ),
  engranaje: (a) => (
    <>
      <C cx={50} cy={50} r={20} {...a} orden={0} total={2} />
      <T d="M50 12 V26 M50 74 V88 M12 50 H26 M74 50 H88 M23 23 L33 33 M67 67 L77 77 M77 23 L67 33 M33 67 L23 77" {...a} orden={1} total={2} />
    </>
  ),
  documento: (a) => (
    <>
      <T d="M24 8 H62 L78 26 V92 H24 Z" {...a} orden={0} total={3} />
      <T d="M62 8 V26 H78" {...a} orden={1} total={3} />
      <T d="M36 44 H66 M36 58 H66 M36 72 H54" {...a} orden={2} total={3} />
    </>
  ),
  carpeta: (a) => (
    <T d="M10 26 H42 L50 36 H90 V80 H10 Z" {...a} />
  ),
  local: (a) => (
    <>
      <T d="M12 40 L22 18 H78 L88 40 Z" {...a} orden={0} total={3} />
      <T d="M18 40 V86 H82 V40" {...a} orden={1} total={3} />
      <T d="M40 86 V58 H62 V86" {...a} orden={2} total={3} />
    </>
  ),
  edificio: (a) => (
    <>
      <T d="M22 12 H78 V92 H22 Z" {...a} orden={0} total={2} />
      <T d="M34 28 H44 M56 28 H66 M34 46 H44 M56 46 H66 M34 64 H44 M56 64 H66 M42 92 V78 H58 V92" {...a} orden={1} total={2} />
    </>
  ),
  lupa: (a) => (
    <>
      <C cx={44} cy={44} r={28} {...a} orden={0} total={2} />
      <T d="M64 64 L90 90" {...a} orden={1} total={2} />
    </>
  ),
  mapa: (a) => (
    <>
      <T d="M8 24 L36 14 L64 26 L92 16 V76 L64 86 L36 74 L8 84 Z" {...a} orden={0} total={2} />
      <T d="M36 14 V74 M64 26 V86" {...a} orden={1} total={2} />
    </>
  ),
  etiqueta: (a) => (
    <>
      <T d="M8 50 L38 20 H88 V80 H38 Z" {...a} orden={0} total={2} />
      <C cx={68} cy={50} r={7} {...a} orden={1} total={2} />
    </>
  ),
  barras: (a) => (
    <>
      <T d="M12 90 H92" {...a} orden={0} total={4} />
      <T d="M24 90 V64 H38 V90" {...a} orden={1} total={4} />
      <T d="M46 90 V40 H60 V90" {...a} orden={2} total={4} />
      <T d="M68 90 V16 H82 V90" {...a} orden={3} total={4} />
    </>
  ),
  candado: (a) => (
    <>
      <T d="M34 44 V30 A16 16 0 0 1 66 30 V44" {...a} orden={0} total={2} />
      <T d="M20 44 H80 V88 H20 Z" {...a} orden={1} total={2} />
    </>
  ),
  mensaje: (a) => (
    <T d="M12 20 H88 V68 H44 L24 86 V68 H12 Z" {...a} />
  ),
  calendario: (a) => (
    <>
      <T d="M12 22 H88 V88 H12 Z" {...a} orden={0} total={3} />
      <T d="M12 42 H88 M32 22 V10 M68 22 V10" {...a} orden={1} total={3} />
      <T d="M30 58 H42 M58 58 H70 M30 74 H42" {...a} orden={2} total={3} />
    </>
  ),
  cohete: (a) => (
    <>
      <T d="M50 6 C68 26 74 48 74 66 H26 C26 48 32 26 50 6 Z" {...a} orden={0} total={3} />
      <C cx={50} cy={40} r={10} {...a} orden={1} total={3} />
      <T d="M26 60 L12 82 L34 74 M74 60 L88 82 L66 74 M42 76 L50 94 L58 76" {...a} orden={2} total={3} />
    </>
  ),
  balanza: (a) => (
    <>
      <T d="M50 14 V80 M22 80 H78" {...a} orden={0} total={3} />
      <T d="M14 30 H86" {...a} orden={1} total={3} />
      <T d="M14 30 L4 52 H24 Z M86 30 L76 52 H96 Z" {...a} orden={2} total={3} />
    </>
  ),
  ojo: (a) => (
    <>
      <T d="M6 50 C24 24 76 24 94 50 C76 76 24 76 6 50 Z" {...a} orden={0} total={2} />
      <C cx={50} cy={50} r={14} {...a} orden={1} total={2} />
    </>
  ),
  foco: (a) => (
    <>
      <T d="M50 8 A26 26 0 0 1 66 54 V66 H34 V54 A26 26 0 0 1 50 8 Z" {...a} orden={0} total={2} />
      <T d="M36 76 H64 M40 88 H60" {...a} orden={1} total={2} />
    </>
  ),
  carrito: (a) => (
    <>
      <T d="M8 16 H24 L36 66 H80 L90 30 H30" {...a} orden={0} total={2} />
      <C cx={40} cy={84} r={8} {...a} orden={1} total={2} />
      <C cx={74} cy={84} r={8} {...a} orden={1} total={2} />
    </>
  ),
  tacho: (a) => (
    <>
      <T d="M18 24 H82 M38 24 V14 H62 V24" {...a} orden={0} total={2} />
      <T d="M26 24 L32 90 H68 L74 24 M44 40 V76 M56 40 V76" {...a} orden={1} total={2} />
    </>
  ),
};

export const LISTA_FIGURAS = Object.keys(DIBUJOS) as NombreFigura[];

export const Figura: React.FC<{
  nombre: NombreFigura;
  /** 0 = sin dibujar, 1 = dibujada entera */
  p: number;
  col: string;
  tam: number;
  grosor?: number;
}> = ({nombre, p, col, tam, grosor = 4}) => {
  const dibujo = DIBUJOS[nombre];
  if (!dibujo) return null;
  return (
    <svg width={tam} height={tam} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      {dibujo({p: Math.max(0, Math.min(1, p)), col, grosor})}
    </svg>
  );
};
