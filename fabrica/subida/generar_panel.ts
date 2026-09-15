/**
 * Genera panel/torre-de-control.html con datos REALES de
 * state/uploads.json + state/carruseles.json, cruzados contra el
 * CATÁLOGO COMPLETO (VIDEOS de lote_21_datos.ts + CARRUSELES_42 de
 * lote_42_datos.ts) -- no solo lo pendiente de hoy.
 *
 * Rediseño 2026-09-16, pedido explícito del operador tras ver el panel
 * viejo (una lista plana de 7 tarjetas sueltas, ordenadas por un
 * horario exacto que el operador ya había dicho que no iba a seguir al
 * pie de la letra): "no aparecen todas las publicaciones... no hay
 * ningún mapa conceptual... no están organizados en nada... explota tu
 * creatividad y dame una estructura lo más organizada posible". Se
 * reemplaza por un panel de control real:
 *   1. Resumen (subido/pendiente/sin entregar, con barra de progreso
 *      por video y por carrusel).
 *   2. Mapa de 7 "días" (el ritmo real confirmado por el operador: 3
 *      videos + 6 carruseles por día -- 21/3=7 y 42/6=7, se agotan
 *      justo en 7 días) -- cada día es una miniatura clickeable de 9
 *      puntos (3 video + 6 carrusel) coloreados por estado, salta a su
 *      detalle.
 *   3. Detalle por día (acordeón <details>, abierto solo en los días
 *      con algo accionable AHORA): cada item con su estado real. Solo
 *      los "pendiente" (ya armados, listos para bajar) muestran los
 *      botones de Descargar/Copiar/Ya lo subí -- el horario sugerido
 *      queda como dato SECUNDARIO chico (franja, no un reloj exacto
 *      dominando la tarjeta), porque el operador elige la hora real.
 *
 * Cruza el estado (Publicacion, en state/*.json) con el contenido real
 * (descripción/hashtags/música, en lote_21_publicacion.ts/
 * lote_42_datos.ts) -- el estado no duplica ese texto, lo referencia
 * por id.
 *
 * Uso: npx tsx subida/generar_panel.ts
 */
import {writeFileSync, readdirSync, existsSync} from 'fs';
import {resolve} from 'path';
import {RUTA_UPLOADS, RUTA_CARRUSELES, leerLog, type Publicacion} from './publicacion';
import {VIDEOS} from '../ejemplos/lote_21_datos';
import {PUBLICACION_LOTE21} from '../ejemplos/lote_21_publicacion';
import {CARRUSELES_42, MUSICA_CATEGORIA} from '../carrusel/lote_42_datos';

const RAIZ = resolve(__dirname, '../..');
const RUTA_SALIDA = resolve(RAIZ, 'panel/torre-de-control.html');
const RUTA_INDEX = resolve(RAIZ, 'panel/index.html');
const REPO_ISSUES_NUEVO = 'https://github.com/mindglitch777-eng/Proyecto-Claude-code-/issues/new';
// Descarga directa desde el archivo YA commiteado en el repo (público
// desde 2026-09-15) -- raw.githubusercontent.com sirve el archivo real
// sin login de GitHub y sin vencimiento (a diferencia del link al run de
// Actions, que exige entrar a la UI de GitHub y expira a los 3 días).
// Pedido explícito del operador (2026-09-16): "que tenga que ir hasta
// github es bastante pajoso".
// OJO real: apunta a la rama de TRABAJO, no a main -- los videos/imagenes
// reales solo viven ahí (main es un espejo parcial de unos pocos
// archivos para Netlify/Pages, nunca tuvo los binarios de videos/lote21
// ni imagenes/lote42). Probado en vivo (curl -I): la URL sobre main
// devuelve 404, sobre la rama de trabajo devuelve 200.
const RAW_BASE = 'https://raw.githubusercontent.com/mindglitch777-eng/Proyecto-Claude-code-/claude/organize-repo-duplicates-xl042t';
const HORARIOS_VIDEO_ART = ['18:30', '20:00', '21:30']; // mismo orden que preparar_entrega_diaria.ts
export const TOTAL_DIAS = 7; // 21 videos / 3 por día = 7; 42 carruseles / 6 por día = 7 -- coincidencia real, no ajustada

type Estado = 'subido' | 'pendiente' | 'sin_entregar';

type ItemPanel = {
  id: string;
  tipo: 'video' | 'carrusel';
  dia: number; // 1..7
  tema: string;
  estado: Estado;
  vencido: boolean;
  descripcion: string;
  cta?: string;
  hashtags: string[];
  musica: string;
  franjaSugerida: string; // texto chico, ej "Noche · sugerido 21:30 ART"
  subidoEn?: string;
  descargaVideo?: string; // solo video -- raw.githubusercontent.com, descarga directa
  descargaImagenes?: {numero: number; url: string}[]; // solo carrusel -- una por slide
};

function estadoDesdeLog(entrada: Publicacion | undefined): {estado: Estado; vencido: boolean} {
  if (!entrada) return {estado: 'sin_entregar', vencido: false};
  if (entrada.estado === 'subido') return {estado: 'subido', vencido: false};
  return {estado: 'pendiente', vencido: entrada.estado === 'vencido'};
}

export function construirCatalogoVideos(): ItemPanel[] {
  const log = leerLog(RUTA_UPLOADS);
  return VIDEOS.map((v, idx): ItemPanel | null => {
    const pub = PUBLICACION_LOTE21.find((p) => p.id === v.id);
    if (!pub) return null;
    const entrada = log.find((e) => e.id === v.id);
    const {estado, vencido} = estadoDesdeLog(entrada);
    const dia = Math.floor(idx / 3) + 1;
    const hora = HORARIOS_VIDEO_ART[idx % 3];
    return {
      id: v.id,
      tipo: 'video',
      dia,
      tema: entrada?.tema ?? v.titulo,
      estado,
      vencido,
      descripcion: pub.descripcion,
      cta: pub.cta,
      hashtags: pub.hashtags,
      musica: MUSICA_CATEGORIA[pub.categoria],
      franjaSugerida: `sugerido ${hora} ART`,
      subidoEn: entrada?.subidoEn,
      descargaVideo: `${RAW_BASE}/videos/lote21/lote21-${v.id}.mp4`,
    };
  }).filter((x): x is ItemPanel => x !== null);
}

/** Lista las imágenes reales de un carrusel ya renderizado y arma sus
 * URLs de descarga directa -- vacío si la carpeta todavía no existe
 * (item sin entregar). */
function descargaImagenesCarrusel(id: string): {numero: number; url: string}[] {
  const carpeta = resolve(RAIZ, `imagenes/lote42/${id}`);
  if (!existsSync(carpeta)) return [];
  return readdirSync(carpeta)
    .filter((f) => f.endsWith('.png'))
    .sort()
    .map((archivo, i) => ({numero: i + 1, url: `${RAW_BASE}/imagenes/lote42/${id}/${archivo}`}));
}

export function construirCatalogoCarruseles(): ItemPanel[] {
  const log = leerLog(RUTA_CARRUSELES);
  return CARRUSELES_42.map((c): ItemPanel => {
    const entrada = log.find((e) => e.id === c.id);
    const {estado, vencido} = estadoDesdeLog(entrada);
    return {
      id: c.id,
      tipo: 'carrusel',
      dia: c.dia,
      tema: entrada?.tema ?? c.titulo,
      estado,
      vencido,
      descripcion: c.descripcion,
      hashtags: c.hashtags,
      musica: c.musica,
      franjaSugerida: `${c.horario} · sugerido ${c.horaSugerida} ART`,
      subidoEn: entrada?.subidoEn,
      descargaImagenes: descargaImagenesCarrusel(c.id),
    };
  });
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlMarcarSubido(id: string): string {
  const params = new URLSearchParams({title: `Ya subido: ${id}`});
  return `${REPO_ISSUES_NUEVO}?${params.toString()}`;
}

function renderizarItem(item: ItemPanel): string {
  const copy = `${item.descripcion}${item.cta ? `\n\n${item.cta}` : ''}\n\n${item.hashtags.join(' ')}`;
  const iconoTipo = item.tipo === 'video' ? '🎬' : '🖼️';
  const claseEstado = item.estado === 'subido' ? 'item-subido' : item.estado === 'sin_entregar' ? 'item-espera' : 'item-pendiente';

  if (item.estado === 'sin_entregar') {
    return `
          <article class="item ${claseEstado}">
            <div class="item-cabecera">
              <span class="item-tipo">${iconoTipo} ${item.tipo === 'video' ? 'Video' : 'Carrusel'}</span>
              <span class="item-estado-badge badge-espera">⚪ Todavía no le toca turno</span>
            </div>
            <h3>${escaparHtml(item.tema)}</h3>
            <p class="item-nota">Se arma y se entrega solo cuando le toque el turno (ritmo: 3 videos + 6 carruseles por día hábil).</p>
          </article>`;
  }

  if (item.estado === 'subido') {
    return `
          <article class="item ${claseEstado}">
            <div class="item-cabecera">
              <span class="item-tipo">${iconoTipo} ${item.tipo === 'video' ? 'Video' : 'Carrusel'}</span>
              <span class="item-estado-badge badge-subido">✅ Ya subido</span>
            </div>
            <h3>${escaparHtml(item.tema)}</h3>
          </article>`;
  }

  // Descarga directa del archivo ya commiteado en el repo (público) --
  // ver RAW_BASE arriba. Para video es un solo botón; para carrusel son
  // 6 botones numerados (uno por imagen) en vez de un zip: TikTok arma
  // el post de fotos seleccionando varias imágenes de la galería del
  // celular, no importando un zip, así que bajarlas sueltas es lo que
  // realmente hace falta, no un paso extra de descomprimir.
  const botonesDescarga = item.tipo === 'video'
    ? (item.descargaVideo ? `<a class="boton-descarga" href="${item.descargaVideo}" target="_blank" rel="noopener">Descargar video</a>` : '')
    : (item.descargaImagenes ?? []).map((img) => `<a class="boton-descarga boton-descarga-img" href="${img.url}" target="_blank" rel="noopener">Img ${img.numero}</a>`).join('');

  return `
          <article class="item ${claseEstado}${item.vencido ? ' item-vencido' : ''}" data-id="${item.id}" data-tipo="${item.tipo}">
            <div class="item-cabecera">
              <span class="item-tipo">${iconoTipo} ${item.tipo === 'video' ? 'Video' : 'Carrusel'}</span>
              <span class="item-estado-badge badge-pendiente">⏳ Listo para bajar</span>
            </div>
            <p class="item-franja">${escaparHtml(item.franjaSugerida)}</p>
            <h3>${escaparHtml(item.tema)}</h3>
            <p class="item-copy">${escaparHtml(copy)}</p>
            <p class="item-musica">🎵 ${escaparHtml(item.musica)}</p>
            <div class="item-acciones">
              ${botonesDescarga}
              <button class="boton-copiar" type="button" onclick="copiarTexto(this)" data-texto="${escaparHtml(copy)}">Copiar texto</button>
              <button class="boton-listo" type="button" onclick="marcarSubido(this)" data-fallback-url="${urlMarcarSubido(item.id)}">Ya lo subí</button>
            </div>
          </article>`;
}

function puntoMapa(item: ItemPanel): string {
  const clase = item.estado === 'subido' ? 'punto-subido' : item.estado === 'sin_entregar' ? 'punto-espera' : 'punto-pendiente';
  const titulo = `${item.tipo === 'video' ? '🎬' : '🖼️'} ${item.tema} -- ${item.estado === 'subido' ? 'subido' : item.estado === 'sin_entregar' ? 'sin entregar' : 'pendiente'}`;
  return `<span class="punto ${clase}" data-id="${item.id}" title="${escaparHtml(titulo)}"></span>`;
}

export function renderizarMapa(porDia: Map<number, ItemPanel[]>): string {
  const tarjetas: string[] = [];
  for (let dia = 1; dia <= TOTAL_DIAS; dia++) {
    const items = porDia.get(dia) ?? [];
    const videos = items.filter((i) => i.tipo === 'video');
    const carruseles = items.filter((i) => i.tipo === 'carrusel');
    const listos = items.filter((i) => i.estado === 'subido').length;
    const accionables = items.filter((i) => i.estado === 'pendiente').length;
    tarjetas.push(`
        <a class="mapa-tarjeta" href="#dia-${dia}">
          <div class="mapa-tarjeta-cabecera">
            <span class="mapa-dia">Día ${dia}</span>
            <span class="mapa-fraccion">${listos}/${items.length}</span>
          </div>
          <div class="mapa-puntos">
            ${videos.map(puntoMapa).join('')}
          </div>
          <div class="mapa-puntos mapa-puntos-carrusel">
            ${carruseles.map(puntoMapa).join('')}
          </div>
          ${accionables > 0 ? `<span class="mapa-accion">${accionables} para bajar ahora</span>` : ''}
        </a>`);
  }
  return tarjetas.join('\n');
}

export function renderizarDia(dia: number, items: ItemPanel[]): string {
  const accionables = items.filter((i) => i.estado === 'pendiente').length;
  const listos = items.filter((i) => i.estado === 'subido').length;
  const abierto = accionables > 0 ? ' open' : '';
  const videos = items.filter((i) => i.tipo === 'video');
  const carruseles = items.filter((i) => i.tipo === 'carrusel');
  return `
      <details class="dia" id="dia-${dia}"${abierto}>
        <summary>
          <span class="dia-titulo">Día ${dia}</span>
          <span class="dia-resumen">${listos}/${items.length} subido${accionables > 0 ? ` · ${accionables} para bajar ahora` : ''}</span>
        </summary>
        <div class="dia-cuerpo">
          <div class="dia-columna">
            <h4>Videos</h4>
            ${videos.map(renderizarItem).join('\n')}
          </div>
          <div class="dia-columna">
            <h4>Carruseles</h4>
            ${carruseles.map(renderizarItem).join('\n')}
          </div>
        </div>
      </details>`;
}

// CSS compartido entre el doc standalone (Netlify) y el fragmento para
// Claude Artifact (generar_panel_artifact.ts) -- una sola fuente, nunca
// se desincronizan los dos estilos.
export const ESTILOS_PANEL = `
  :root {
    --bg: #faf9f7; --tinta: #1a1a1a; --muted: #6b6b6b; --card: #ffffff;
    --borde: #e5e2dc; --copper: #d43d15; --verde: #1a7a3c; --verde-bg: #e8f5ec;
    --gris-bg: #f0efec; --copper-bg: #fdeee9;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #0a0a0c; --tinta: #f2f0ec; --muted: #9a9a9a; --card: #17171a;
      --borde: #2a2a2e; --copper: #ff6a45; --verde: #4ade80; --verde-bg: #123420;
      --gris-bg: #1e1e22; --copper-bg: #3a1f18;
    }
  }
  :root[data-theme="dark"] {
    --bg: #0a0a0c; --tinta: #f2f0ec; --muted: #9a9a9a; --card: #17171a;
    --borde: #2a2a2e; --copper: #ff6a45; --verde: #4ade80; --verde-bg: #123420;
    --gris-bg: #1e1e22; --copper-bg: #3a1f18;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--tinta);
    font-family: 'Archivo', system-ui, sans-serif; padding: 20px 16px 56px;
  }
  .envoltorio { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 2px; }
  .subtitulo { color: var(--muted); margin: 0 0 4px; font-size: 0.9rem; }
  .actualizado { color: var(--muted); margin: 0 0 20px; font-size: 0.78rem; }

  /* -- Resumen -- */
  .resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; }
  .resumen-tile { background: var(--card); border: 1px solid var(--borde); border-radius: 10px; padding: 12px 14px; }
  .resumen-numero { font-size: 1.5rem; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .resumen-label { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }
  .resumen-tile.acento .resumen-numero { color: var(--copper); }
  .resumen-tile.ok .resumen-numero { color: var(--verde); }
  .barras { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .barra-fila { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; }
  .barra-etiqueta { width: 76px; flex-shrink: 0; color: var(--muted); }
  .barra-pista { flex: 1; height: 8px; border-radius: 999px; background: var(--gris-bg); overflow: hidden; }
  .barra-relleno { height: 100%; background: var(--verde); border-radius: 999px; }
  .barra-pct { width: 38px; text-align: right; font-variant-numeric: tabular-nums; color: var(--muted); flex-shrink: 0; }

  /* -- Mapa -- */
  h2 { font-size: 1rem; margin: 0 0 10px; }
  .mapa { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; margin-bottom: 28px; }
  .mapa-tarjeta {
    background: var(--card); border: 1px solid var(--borde); border-radius: 10px;
    padding: 10px; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 6px;
  }
  .mapa-tarjeta-cabecera { display: flex; justify-content: space-between; align-items: baseline; }
  .mapa-dia { font-size: 0.82rem; font-weight: 700; }
  .mapa-fraccion { font-size: 0.72rem; color: var(--muted); font-variant-numeric: tabular-nums; }
  .mapa-puntos { display: flex; gap: 3px; flex-wrap: wrap; }
  .mapa-puntos-carrusel { margin-top: -2px; }
  .punto { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
  .punto-subido { background: var(--verde); }
  .punto-pendiente { background: var(--copper); }
  .punto-espera { background: var(--borde); }
  .mapa-accion { font-size: 0.68rem; color: var(--copper); font-weight: 600; }

  /* -- Acordeón por día -- */
  .dia {
    background: var(--card); border: 1px solid var(--borde); border-radius: 10px;
    margin-bottom: 10px; overflow: hidden;
  }
  .dia summary {
    list-style: none; cursor: pointer; padding: 14px 16px;
    display: flex; justify-content: space-between; align-items: center; gap: 8px;
  }
  .dia summary::-webkit-details-marker { display: none; }
  .dia summary::after { content: '▾'; color: var(--muted); transition: transform 0.15s; }
  .dia[open] summary::after { transform: rotate(180deg); }
  .dia-titulo { font-weight: 700; }
  .dia-resumen { font-size: 0.78rem; color: var(--muted); }
  .dia-cuerpo { padding: 0 14px 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 620px) { .dia-cuerpo { grid-template-columns: 1fr; } }
  .dia-columna { display: flex; flex-direction: column; gap: 10px; }
  .dia-columna h4 { margin: 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }

  /* -- Item -- */
  .item {
    border: 1px solid var(--borde); border-radius: 10px;
    padding: 12px; display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem;
  }
  .item-subido { background: var(--verde-bg); border-color: var(--verde); opacity: 0.75; }
  .item-pendiente { background: var(--copper-bg); border-color: var(--copper); }
  .item-espera { background: var(--gris-bg); }
  .item-vencido { border-style: dashed; }
  .item-cabecera { display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; }
  .item-tipo { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
  .item-estado-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
  .badge-subido { color: var(--verde); background: color-mix(in srgb, var(--verde) 15%, transparent); }
  .badge-pendiente { color: var(--copper); background: color-mix(in srgb, var(--copper) 15%, transparent); }
  .badge-vencido { color: var(--copper); background: color-mix(in srgb, var(--copper) 15%, transparent); }
  .badge-espera { color: var(--muted); background: var(--borde); }
  .item h3 { margin: 0; font-size: 0.95rem; }
  .item-franja { margin: 0; font-size: 0.75rem; color: var(--muted); }
  .item-copy { margin: 0; white-space: pre-wrap; font-size: 0.85rem; line-height: 1.4; }
  .item-musica { margin: 0; font-size: 0.78rem; color: var(--muted); }
  .item-nota { margin: 0; font-size: 0.78rem; color: var(--muted); }
  .item-acciones { display: flex; gap: 8px; margin-top: 2px; flex-wrap: wrap; }
  .boton-descarga, .boton-listo, .boton-copiar {
    border-radius: 8px; padding: 8px 14px; font-size: 0.84rem; font-weight: 600;
    text-decoration: none; border: none; cursor: pointer; text-align: center;
    font-family: inherit;
  }
  .boton-descarga { background: var(--copper); color: #fff; }
  .boton-descarga-img { padding: 8px 10px; min-width: 44px; }
  .boton-listo, .boton-copiar { background: var(--card); border: 1px solid var(--borde); color: var(--tinta); }
  .boton-listo:disabled { opacity: 0.6; cursor: default; }

  /* -- Aviso flotante (confirmación de "Ya lo subí") -- */
  .aviso-flotante {
    position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%);
    background: var(--tinta); color: var(--bg); padding: 10px 16px; border-radius: 999px;
    font-size: 0.82rem; font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.25); z-index: 100;
    max-width: calc(100% - 32px); text-align: center;
  }
`;

// Contenido compartido (mapa + resumen + acordeón + script de copiar) --
// usado por generarHtml (doc standalone) y por generar_panel_artifact.ts
// (fragmento sin wrapper para publicar como Claude Artifact).
export function construirCuerpo(catalogo: ItemPanel[]): {cuerpoHtml: string; actualizado: string} {
  const porDia = new Map<number, ItemPanel[]>();
  for (const item of catalogo) {
    const lista = porDia.get(item.dia) ?? [];
    lista.push(item);
    porDia.set(item.dia, lista);
  }
  for (const lista of porDia.values()) {
    lista.sort((a, b) => (a.tipo === b.tipo ? a.id.localeCompare(b.id, 'es', {numeric: true}) : a.tipo === 'video' ? -1 : 1));
  }

  const totalVideos = catalogo.filter((i) => i.tipo === 'video').length;
  const totalCarruseles = catalogo.filter((i) => i.tipo === 'carrusel').length;
  const subidoVideos = catalogo.filter((i) => i.tipo === 'video' && i.estado === 'subido').length;
  const subidoCarruseles = catalogo.filter((i) => i.tipo === 'carrusel' && i.estado === 'subido').length;
  const totalAccionable = catalogo.filter((i) => i.estado === 'pendiente').length;
  const totalSinEntregar = catalogo.filter((i) => i.estado === 'sin_entregar').length;
  const totalSubido = subidoVideos + subidoCarruseles;
  const pctVideos = totalVideos ? Math.round((subidoVideos / totalVideos) * 100) : 0;
  const pctCarruseles = totalCarruseles ? Math.round((subidoCarruseles / totalCarruseles) * 100) : 0;

  const mapaHtml = renderizarMapa(porDia);
  const diasHtml = Array.from({length: TOTAL_DIAS}, (_, i) => i + 1)
    .map((dia) => renderizarDia(dia, porDia.get(dia) ?? []))
    .join('\n');

  const actualizado = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date());

  const cuerpoHtml = `
  <div class="envoltorio">
    <h1>Torre de Control</h1>
    <p class="subtitulo">Ritmo real: 3 videos + 6 carruseles por día hábil. 21 videos + 42 carruseles = 7 días.</p>
    <p class="actualizado">Actualizado ${actualizado} ART</p>

    <div class="resumen">
      <div class="resumen-tile ok"><div class="resumen-numero" id="resumen-subidos">${totalSubido}</div><div class="resumen-label">Ya subidos</div></div>
      <div class="resumen-tile acento"><div class="resumen-numero" id="resumen-pendientes">${totalAccionable}</div><div class="resumen-label">Para bajar ahora</div></div>
      <div class="resumen-tile"><div class="resumen-numero" id="resumen-sin-entregar">${totalSinEntregar}</div><div class="resumen-label">Sin entregar todavía</div></div>
      <div class="resumen-tile"><div class="resumen-numero">${catalogo.length}</div><div class="resumen-label">Total (video+carrusel)</div></div>
    </div>
    <div class="barras">
      <div class="barra-fila">
        <span class="barra-etiqueta">🎬 Videos</span>
        <span class="barra-pista"><span class="barra-relleno" id="barra-video-relleno" style="width:${pctVideos}%"></span></span>
        <span class="barra-pct" id="barra-video-pct">${subidoVideos}/${totalVideos}</span>
      </div>
      <div class="barra-fila">
        <span class="barra-etiqueta">🖼️ Carruseles</span>
        <span class="barra-pista"><span class="barra-relleno" id="barra-carrusel-relleno" style="width:${pctCarruseles}%"></span></span>
        <span class="barra-pct" id="barra-carrusel-pct">${subidoCarruseles}/${totalCarruseles}</span>
      </div>
    </div>

    <h2>Mapa (tocá un día para ver el detalle)</h2>
    <div class="mapa">${mapaHtml}
    </div>

    <h2>Detalle por día</h2>
    ${diasHtml}
  </div>
  <div id="aviso-flotante" class="aviso-flotante" hidden></div>
  <script>
    function copiarTexto(boton) {
      const texto = boton.getAttribute('data-texto');
      navigator.clipboard.writeText(texto).then(() => {
        const original = boton.textContent;
        boton.textContent = 'Copiado ✓';
        setTimeout(() => { boton.textContent = original; }, 1500);
      }).catch(() => {
        alert('No se pudo copiar solo -- mantené presionado el texto de arriba para copiarlo a mano.');
      });
    }
    // Si se entra con un #dia-N (desde el mapa u otro link), asegura que
    // ese <details> esté abierto antes de saltar -- si no, el navegador
    // hace scroll al bloque pero queda colapsado y parece que no pasó nada.
    (function () {
      const id = location.hash.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el && el.tagName === 'DETAILS') el.open = true;
    })();

    // "Ya lo subí" -- marca el item YA en pantalla (efecto real e
    // inmediato, sin depender de un segundo paso en github.com) y, si
    // corre dentro de un Claude Artifact, guarda el cambio con
    // claude.use('artifact') para que quede al recargar/reabrir. Si no
    // hay esa capacidad (panel estático en Netlify/GitHub Pages), cae al
    // link de Issue de GitHub de siempre como respaldo.
    function setTexto(id, valor) {
      const el = document.getElementById(id);
      if (el) el.textContent = String(valor);
    }
    function setBarra(tipo, subido, total) {
      const pct = total ? Math.round((subido / total) * 100) : 0;
      const relleno = document.getElementById('barra-' + tipo + '-relleno');
      const pctEl = document.getElementById('barra-' + tipo + '-pct');
      if (relleno) relleno.style.width = pct + '%';
      if (pctEl) pctEl.textContent = subido + '/' + total;
    }
    function recalcularResumen() {
      const items = document.querySelectorAll('.item[data-tipo]');
      let totalVideos = 0, totalCarruseles = 0, subidoVideos = 0, subidoCarruseles = 0;
      let totalAccionable = 0, totalSinEntregar = 0;
      items.forEach((it) => {
        const esVideo = it.dataset.tipo === 'video';
        const subido = it.classList.contains('item-subido');
        const espera = it.classList.contains('item-espera');
        if (esVideo) { totalVideos++; if (subido) subidoVideos++; } else { totalCarruseles++; if (subido) subidoCarruseles++; }
        if (!subido && !espera) totalAccionable++;
        if (espera) totalSinEntregar++;
      });
      setTexto('resumen-subidos', subidoVideos + subidoCarruseles);
      setTexto('resumen-pendientes', totalAccionable);
      setTexto('resumen-sin-entregar', totalSinEntregar);
      setBarra('video', subidoVideos, totalVideos);
      setBarra('carrusel', subidoCarruseles, totalCarruseles);

      document.querySelectorAll('.dia').forEach((dia) => {
        const itemsDia = dia.querySelectorAll('.item[data-tipo]');
        let listos = 0, accionables = 0;
        itemsDia.forEach((it) => {
          if (it.classList.contains('item-subido')) listos++;
          else if (!it.classList.contains('item-espera')) accionables++;
        });
        const resumen = dia.querySelector('.dia-resumen');
        if (resumen) resumen.textContent = listos + '/' + itemsDia.length + ' subido' + (accionables > 0 ? ' · ' + accionables + ' para bajar ahora' : '');
        const tarjeta = document.querySelector('.mapa-tarjeta[href="#' + dia.id + '"]');
        if (!tarjeta) return;
        const fraccion = tarjeta.querySelector('.mapa-fraccion');
        if (fraccion) fraccion.textContent = listos + '/' + itemsDia.length;
        let accion = tarjeta.querySelector('.mapa-accion');
        if (accionables > 0) {
          if (!accion) {
            accion = document.createElement('span');
            accion.className = 'mapa-accion';
            tarjeta.appendChild(accion);
          }
          accion.textContent = accionables + ' para bajar ahora';
        } else if (accion) {
          accion.remove();
        }
      });
    }
    function avisar(mensaje) {
      const el = document.getElementById('aviso-flotante');
      if (!el) return;
      el.textContent = mensaje;
      el.hidden = false;
      clearTimeout(el._t);
      el._t = setTimeout(() => { el.hidden = true; }, 3200);
    }
    function marcarSubido(boton) {
      const item = boton.closest('.item');
      if (!item || item.dataset.marcando === '1') return;
      item.dataset.marcando = '1';
      boton.disabled = true;
      boton.textContent = 'Guardando…';

      const id = item.dataset.id;
      const tipo = item.dataset.tipo;
      const tema = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
      const fallbackUrl = boton.getAttribute('data-fallback-url');

      item.className = 'item item-subido';
      item.innerHTML = '<div class="item-cabecera"><span class="item-tipo">' + (tipo === 'video' ? '🎬 Video' : '🖼️ Carrusel') + '</span><span class="item-estado-badge badge-subido">✅ Ya subido</span></div><h3>' + tema + '</h3>';
      item.dataset.id = id;
      item.dataset.tipo = tipo;

      const punto = document.querySelector('.punto[data-id="' + id + '"]');
      if (punto) {
        punto.classList.remove('punto-pendiente');
        punto.classList.add('punto-subido');
        punto.title = punto.title.replace('pendiente', 'subido');
      }

      recalcularResumen();

      if (window.claude && window.claude.use) {
        window.claude.use('artifact').then((artifact) => {
          if (!artifact) { avisar('Marcado ✓ -- no se guardó solo, si recargás vuelve a pendiente.'); return null; }
          return artifact.publish('<!doctype html>' + document.documentElement.outerHTML);
        }).then((ok) => {
          if (ok !== null) avisar('Guardado ✅');
        }).catch(() => {
          avisar('Marcado ✓ -- no se guardó solo, si recargás vuelve a pendiente.');
        });
      } else if (fallbackUrl) {
        avisar('Abriendo GitHub para confirmar -- tocá "Submit new issue" ahí.');
        window.open(fallbackUrl, '_blank', 'noopener');
      }
    }
  </script>`;

  return {cuerpoHtml, actualizado};
}

function generarHtml(catalogo: ItemPanel[]): string {
  const {cuerpoHtml} = construirCuerpo(catalogo);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Torre de Control</title>
<style>${ESTILOS_PANEL}</style>
</head>
<body>${cuerpoHtml}
</body>
</html>
`;
}

function main(): void {
  const catalogo = [...construirCatalogoVideos(), ...construirCatalogoCarruseles()];
  const html = generarHtml(catalogo);
  writeFileSync(RUTA_SALIDA, html);
  // Copia idéntica como index.html: un sitio nuevo de Netlify con
  // publish directory = "panel" sirve esto directo en la raíz, sin
  // ninguna regla de redirect.
  writeFileSync(RUTA_INDEX, html);
  const accionables = catalogo.filter((i) => i.estado === 'pendiente').length;
  const subidos = catalogo.filter((i) => i.estado === 'subido').length;
  console.log(`Listo -- ${catalogo.length} item(s) en el catálogo (${subidos} subido(s), ${accionables} para bajar ahora) en ${RUTA_SALIDA} y ${RUTA_INDEX}.`);
}

// Guardia para que importar construirCuerpo/ESTILOS_PANEL desde
// generar_panel_artifact.ts no dispare esta escritura de más.
if (require.main === module) main();
