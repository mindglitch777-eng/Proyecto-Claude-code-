/**
 * Genera panel/artifact-fragmento.html -- el MISMO contenido de
 * generar_panel.ts (mapa de 7 días + catálogo completo), pero SIN el
 * wrapper <!doctype>/<html>/<head>/<body> -- listo para pegar como
 * contenido de un Claude Artifact (el host arma su propio wrapper).
 *
 * Existe porque el panel en Netlify (sparkling-manatee-cf6529.netlify.app)
 * no se le actualizaba al operador -- el código en `main` estaba
 * correcto (confirmado con diff real), pero no hay forma de diagnosticar
 * desde acá si es caché de Netlify, del navegador, o un problema real de
 * redeploy sin acceso al dashboard de Netlify. El operador pidió pasar a
 * un Claude Artifact en su lugar (2026-09-16): mismo contenido, un canal
 * que se puede verificar publicado de punta a punta desde la sesión.
 *
 * Uso: npx tsx subida/generar_panel_artifact.ts
 * Luego: publicar RUTA_SALIDA con la herramienta Artifact (mismo `url`
 * en cada corrida para que actualice el mismo link, no cree uno nuevo).
 */
import {writeFileSync} from 'fs';
import {resolve} from 'path';
import {construirCatalogoVideos, construirCatalogoCarruseles, construirCuerpo, ESTILOS_PANEL} from './generar_panel';

const RAIZ = resolve(__dirname, '../..');
const RUTA_SALIDA = resolve(RAIZ, 'panel/artifact-fragmento.html');

function main(): void {
  const catalogo = [...construirCatalogoVideos(), ...construirCatalogoCarruseles()];
  const {cuerpoHtml} = construirCuerpo(catalogo);
  const fragmento = `<title>Torre de Control</title>
<style>${ESTILOS_PANEL}</style>${cuerpoHtml}`;
  writeFileSync(RUTA_SALIDA, fragmento);
  console.log(`Listo -- fragmento para Artifact en ${RUTA_SALIDA} (${catalogo.length} items).`);
}

main();
