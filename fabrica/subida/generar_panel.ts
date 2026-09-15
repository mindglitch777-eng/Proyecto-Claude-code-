/**
 * Genera panel/torre-de-control.html con datos REALES de
 * state/uploads.json + state/carruseles.json -- reemplaza la maqueta
 * con datos de ejemplo. Alcance definido por el operador 2026-09-14
 * ("el panel tendría que ser solamente para la llegada de los videos
 * con el link de descarga, descripción, hashtags, etc. y listo"):
 * SOLO la cola de contenido para bajar y subir a mano vía TikTok
 * Studio / YouTube Studio -- nada de calendario ni métricas todavía
 * (quedan para módulos aparte).
 *
 * Cruza el estado (Publicacion, en state/*.json) con el contenido real
 * (descripción/hashtags/música, en lote_21_publicacion.ts/
 * lote_42_datos.ts) -- el estado no duplica ese texto, lo referencia
 * por id.
 *
 * Publicación 2026-09-15: se sacó del sitio de Netlify de El Corte
 * (mismo sitio causó confusión real de rutas/redirects que casi hace
 * parecer que se había roto el producto pago) -- decisión explícita
 * del operador ("no tiene nada que ver una cosa con la otra"). Se
 * probó GitHub Pages primero, pero la creación inicial del sitio
 * requiere un permiso que el token automático de Actions no tiene
 * (límite real de la plataforma, no arreglable desde acá) -- el
 * operador prefirió quedarse en la MISMA cuenta de Netlify que ya usa,
 * pero un SITIO nuevo y separado, no el de El Corte. Por eso este
 * script escribe panel/index.html además de panel/torre-de-control.html
 * -- un sitio nuevo de Netlify apuntado a la carpeta panel/ como
 * publish directory sirve panel/index.html en la raíz sin necesitar
 * ninguna regla de redirect.
 *
 * El botón "Ya lo subí" dejó de pegarle a una Netlify Function con
 * secreto -- ahora es un link que abre un Issue de GitHub prellenado
 * (el operador ya está logueado en GitHub, no hace falta ningún
 * secreto nuevo); un workflow aparte (marcar-subido-por-issue.yml) lo
 * procesa y cierra el issue solo.
 *
 * Uso: npx tsx subida/generar_panel.ts
 */
import {writeFileSync} from 'fs';
import {resolve} from 'path';
import {RUTA_UPLOADS, RUTA_CARRUSELES, leerLog, type Publicacion} from './publicacion';
import {VIDEOS} from '../ejemplos/lote_21_datos';
import {PUBLICACION_LOTE21} from '../ejemplos/lote_21_publicacion';
import {CARRUSELES_42, MUSICA_CATEGORIA} from '../carrusel/lote_42_datos';

const RAIZ = resolve(__dirname, '../..');
const RUTA_SALIDA = resolve(RAIZ, 'panel/torre-de-control.html');
const RUTA_INDEX = resolve(RAIZ, 'panel/index.html');
const REPO_ISSUES_NUEVO = 'https://github.com/mindglitch777-eng/Proyecto-Claude-code-/issues/new';

type ItemPanel = {
  id: string;
  tipo: 'video' | 'carrusel';
  tema: string;
  horario?: string;
  vencido: boolean;
  link?: string;
  descripcion: string;
  hashtags: string[];
  musica: string;
};

function armarItemsVideo(entradas: Publicacion[]): ItemPanel[] {
  return entradas
    .filter((e) => e.estado === 'pendiente' || e.estado === 'vencido')
    .map((e): ItemPanel | null => {
      const video = VIDEOS.find((v) => v.id === e.id);
      const pub = PUBLICACION_LOTE21.find((p) => p.id === e.id);
      if (!video || !pub) return null;
      return {
        id: e.id,
        tipo: 'video',
        tema: e.tema ?? video.titulo,
        horario: e.scheduledFor,
        vencido: e.estado === 'vencido',
        link: e.link,
        descripcion: pub.descripcion,
        hashtags: pub.hashtags,
        musica: MUSICA_CATEGORIA[pub.categoria],
      };
    })
    .filter((x): x is ItemPanel => x !== null);
}

function armarItemsCarrusel(entradas: Publicacion[]): ItemPanel[] {
  return entradas
    .filter((e) => e.estado === 'pendiente' || e.estado === 'vencido')
    .map((e): ItemPanel | null => {
      const c = CARRUSELES_42.find((x) => x.id === e.id);
      if (!c) return null;
      return {
        id: e.id,
        tipo: 'carrusel',
        tema: e.tema ?? c.titulo,
        horario: e.scheduledFor,
        vencido: e.estado === 'vencido',
        link: e.link,
        descripcion: c.descripcion,
        hashtags: c.hashtags,
        musica: c.musica,
      };
    })
    .filter((x): x is ItemPanel => x !== null);
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlMarcarSubido(id: string): string {
  const params = new URLSearchParams({title: `Ya subido: ${id}`});
  return `${REPO_ISSUES_NUEVO}?${params.toString()}`;
}

/** Formatea el horario sugerido en hora de Argentina, legible de un
 * vistazo (ej: "mar. 16/09, 20:00 ART") -- antes se mostraba el ISO
 * crudo o nada, lo que hacía parecer que el panel no tenía fechas. */
function formatearHorario(iso?: string): string {
  if (!iso) return 'Sin horario sugerido todavía -- elegís vos la hora dentro de la franja 18-23 ART';
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return 'Sin horario sugerido todavía -- elegís vos la hora dentro de la franja 18-23 ART';
  const formateado = new Intl.DateTimeFormat('es-AR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(fecha);
  return `${formateado} ART`;
}

/** Ordena por horario sugerido (los que no tienen todavía quedan al
 * final) -- así con varios items pendientes se ve como una agenda, no
 * una lista suelta. */
function ordenarPorHorario(items: ItemPanel[]): ItemPanel[] {
  const conHorario = items.filter((i) => i.horario);
  const sinHorario = items.filter((i) => !i.horario);
  conHorario.sort((a, b) => new Date(a.horario!).getTime() - new Date(b.horario!).getTime());
  return [...conHorario, ...sinHorario];
}

function renderizarItem(item: ItemPanel): string {
  const copy = `${item.descripcion}\n\n${item.hashtags.join(' ')}`;
  return `
        <article class="item${item.vencido ? ' item-vencido' : ''}">
          <div class="item-cabecera">
            <span class="item-tipo">${item.tipo === 'video' ? '🎬 Video' : '🖼️ Carrusel'}</span>
            ${item.vencido ? '<span class="item-badge">VENCIDO -- el link ya expiró, hay que re-entregarlo</span>' : ''}
          </div>
          <p class="item-horario">📅 ${escaparHtml(formatearHorario(item.horario))}</p>
          <h2>${escaparHtml(item.tema)}</h2>
          <p class="item-copy">${escaparHtml(copy)}</p>
          <p class="item-musica">🎵 ${escaparHtml(item.musica)}</p>
          <div class="item-acciones">
            ${item.link && !item.vencido ? `<a class="boton-descarga" href="${item.link}" target="_blank" rel="noopener">Descargar</a>` : ''}
            <button class="boton-copiar" type="button" onclick="copiarTexto(this)" data-texto="${escaparHtml(copy)}">Copiar texto</button>
            <a class="boton-listo" href="${urlMarcarSubido(item.id)}" target="_blank" rel="noopener">Ya lo subí</a>
          </div>
        </article>`;
}

function generarHtml(items: ItemPanel[]): string {
  const cuerpo = items.length
    ? items.map(renderizarItem).join('\n')
    : `<p class="vacio">No hay nada pendiente de subir ahora mismo.</p>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Buzón</title>
<style>
  :root {
    --bg: #faf9f7; --tinta: #1a1a1a; --muted: #6b6b6b; --card: #ffffff;
    --borde: #e5e2dc; --copper: #d43d15;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #0a0a0c; --tinta: #f2f0ec; --muted: #9a9a9a; --card: #17171a;
      --borde: #2a2a2e; --copper: #ff4e24;
    }
  }
  :root[data-theme="dark"] {
    --bg: #0a0a0c; --tinta: #f2f0ec; --muted: #9a9a9a; --card: #17171a;
    --borde: #2a2a2e; --copper: #ff4e24;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--tinta);
    font-family: 'Archivo', system-ui, sans-serif; padding: 24px 16px 48px;
  }
  h1 { font-size: 1.4rem; margin: 0 0 4px; }
  .subtitulo { color: var(--muted); margin: 0 0 24px; font-size: 0.9rem; }
  .lista { display: flex; flex-direction: column; gap: 16px; max-width: 560px; margin: 0 auto; }
  .item {
    background: var(--card); border: 1px solid var(--borde); border-radius: 12px;
    padding: 18px; display: flex; flex-direction: column; gap: 8px;
  }
  .item-vencido { border-color: var(--copper); }
  .item-cabecera { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
  .item-tipo { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .item-badge {
    font-size: 0.75rem; color: var(--copper); border: 1px solid var(--copper);
    border-radius: 999px; padding: 2px 10px; font-weight: 600;
  }
  h2 { margin: 0; font-size: 1.1rem; }
  .item-horario {
    margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--copper);
  }
  .item-copy { margin: 0; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.4; }
  .item-musica { margin: 0; font-size: 0.85rem; color: var(--muted); }
  .item-acciones { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
  .boton-descarga, .boton-listo, .boton-copiar {
    border-radius: 8px; padding: 10px 16px; font-size: 0.9rem; font-weight: 600;
    text-decoration: none; border: none; cursor: pointer; text-align: center;
    font-family: inherit;
  }
  .boton-descarga { background: var(--copper); color: #fff; }
  .boton-listo, .boton-copiar { background: transparent; border: 1px solid var(--borde); color: var(--tinta); }
  .boton-listo.done { opacity: 0.5; pointer-events: none; }
  .vacio { text-align: center; color: var(--muted); padding: 48px 0; }
</style>
</head>
<body>
  <h1>Buzón</h1>
  <p class="subtitulo">Lo que hay para bajar y subir a mano (TikTok Studio / YouTube Studio).</p>
  <div class="lista">${cuerpo}
  </div>
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
  </script>
</body>
</html>
`;
}

function main(): void {
  const items = ordenarPorHorario([...armarItemsVideo(leerLog(RUTA_UPLOADS)), ...armarItemsCarrusel(leerLog(RUTA_CARRUSELES))]);
  const html = generarHtml(items);
  writeFileSync(RUTA_SALIDA, html);
  // Copia idéntica como index.html: un sitio nuevo de Netlify con
  // publish directory = "panel" sirve esto directo en la raíz, sin
  // ninguna regla de redirect.
  writeFileSync(RUTA_INDEX, html);
  console.log(`Listo -- ${items.length} item(s) pendiente(s) en ${RUTA_SALIDA} y ${RUTA_INDEX}.`);
}

main();
