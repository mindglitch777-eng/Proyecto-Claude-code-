/**
 * Arma y exporta los props de render de los 42 carruseles
 * (lote_42_datos.ts) -- UNA VEZ que las fotos/logos reales ya existen
 * (foto-persona.yml modo lote + preparar-assets-lote42.yml). Resuelve
 * los placeholders CREDITO_* y logos/*.EXT contra los CREDITOS.md
 * reales, y escribe un prop JSON por slide (252 en total) listo para
 * `npx remotion still carrusel-slide <out.png> --props=<archivo>`.
 */
import * as fs from 'fs';
import * as path from 'path';
import {armarCarrusel, validarEstructura} from './armar';
import {IDENTIDAD_DEFECTO} from './generar';
import {CARRUSELES_42} from './lote_42_datos';

const RAIZ = path.join(__dirname, '..', '..');

function leerCredito(slugCarpeta: string, base: string): string {
  const creditosPath = path.join(RAIZ, base, slugCarpeta, 'CREDITOS.md');
  if (!fs.existsSync(creditosPath)) {
    throw new Error(`Falta ${creditosPath}. Correr foto-persona.yml (lote) / preparar-assets-lote42.yml primero.`);
  }
  const txt = fs.readFileSync(creditosPath, 'utf-8');
  const autor = /Autor: (.+)/.exec(txt)?.[1]?.trim() ?? 'Wikimedia Commons';
  const licencia = /Licencia: (.+)/.exec(txt)?.[1]?.trim() ?? '';
  return `Foto: ${autor}${licencia ? ` · ${licencia}` : ''} · Wikimedia Commons`;
}

function extLogo(slug: string): string {
  const dir = path.join(RAIZ, 'assets/logos', slug);
  if (!fs.existsSync(dir)) throw new Error(`Falta assets/logos/${slug}/ -- correr preparar-assets-lote42.yml primero.`);
  const archivo = fs.readdirSync(dir).find((f) => f.startsWith('logo.'));
  if (!archivo) throw new Error(`No hay logo.* en assets/logos/${slug}/`);
  return archivo.split('.').pop() as string;
}

const CREDITOS_PERSONA: Record<string, string> = {
  'fotos/elon-musk.jpg': leerCredito('elon-musk', 'assets/personas'),
  'fotos/mrbeast.jpg': leerCredito('mrbeast', 'assets/personas'),
  'fotos/jeff-bezos.jpg': leerCredito('jeff-bezos', 'assets/personas'),
  'fotos/gary-vaynerchuk.jpg': leerCredito('gary-vaynerchuk', 'assets/personas'),
  'fotos/steve-jobs.jpg': leerCredito('steve-jobs', 'assets/personas'),
};

const EXT_LOGO: Record<string, string> = {
  spacex: extLogo('spacex'),
  amazon: extLogo('amazon'),
  apple: extLogo('apple'),
};

const dirSalidaBase = path.join(RAIZ, 'remotion-spike/props_carrusel/lote42');
const resumenSalida = path.join(RAIZ, 'fabrica/carrusel/lote_42_resumen.json');

const resumen: Array<Record<string, unknown>> = [];
let totalSlides = 0;
let advertenciasTotales = 0;

for (const c of CARRUSELES_42) {
  const carrusel = armarCarrusel(c.id, c.titulo, c.slides, IDENTIDAD_DEFECTO, []);
  const advertencias = validarEstructura(carrusel);
  if (advertencias.length > 0) {
    advertenciasTotales += advertencias.length;
    console.log(`[${c.id}] advertencias:`, advertencias);
  }

  const dirSalida = path.join(dirSalidaBase, c.id);
  fs.mkdirSync(dirSalida, {recursive: true});

  carrusel.slides.forEach((slide, i) => {
    const props: Record<string, unknown> = {
      tipo: slide.tipo,
      texto: slide.texto,
      subtexto: slide.subtexto,
      numero: i + 1,
      total: carrusel.slides.length,
    };
    if (slide.resaltar) props.resaltar = slide.resaltar;
    if (slide.imagen) {
      props.imagen = slide.imagen;
      props.estiloImagen = slide.estiloImagen;
      const credito = CREDITOS_PERSONA[slide.imagen];
      if (!credito) throw new Error(`[${c.id}] sin credito resuelto para imagen "${slide.imagen}"`);
      props.credito = credito;
    }
    if (slide.logo) {
      const m = /^logos\/([a-z]+)\.EXT$/.exec(slide.logo);
      if (!m) throw new Error(`[${c.id}] logo con formato inesperado: "${slide.logo}"`);
      const slug = m[1];
      const ext = EXT_LOGO[slug];
      if (!ext) throw new Error(`[${c.id}] sin extension resuelta para logo "${slug}"`);
      props.logo = `logos/${slug}.${ext}`;
    }
    fs.writeFileSync(path.join(dirSalida, `slide-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(props, null, 2));
    totalSlides++;
  });

  resumen.push({
    numero: c.numero, id: c.id, titulo: c.titulo, hashtags: c.hashtags,
    descripcion: c.descripcion, dia: c.dia, horario: c.horario, horaSugerida: c.horaSugerida,
    tieneImagenPersona: Boolean(IDENTIDAD_DEFECTO && c.slides[0].imagen),
  });
}

fs.writeFileSync(resumenSalida, JSON.stringify(resumen, null, 2));

console.log(`\n${CARRUSELES_42.length} carruseles, ${totalSlides} slides exportados a ${dirSalidaBase}`);
console.log(`Resumen (metadata de publicacion) escrito en ${resumenSalida}`);
console.log(`Advertencias de validarEstructura en total: ${advertenciasTotales}`);
