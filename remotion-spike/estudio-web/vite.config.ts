import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';

// publicDir apunta a la carpeta public/ real del proyecto Remotion
// (fuentes, fotos, sfx, metraje) -- asi staticFile() encuentra los
// mismos archivos que usa el render final, sin duplicar nada.
//
// Los componentes que importamos viven en ../src (fuera de esta
// carpeta) y traen su propio node_modules/remotion mas arriba en el
// arbol -- sin resolve.alias, Vite les resuelve ESE remotion en vez
// del de aca, y quedan dos copias del modulo con contextos de React
// distintos ("No video config found" a pesar de estar todo bien
// armado). Forzar el alias a la copia de este proyecto es lo que
// hace que <Player> y el componente Caso compartan el mismo contexto.
const R = (p: string) => path.resolve(__dirname, 'node_modules', p);

export default defineConfig({
  plugins: [react()],
  publicDir: '../public',
  resolve: {
    alias: {
      remotion: R('remotion'),
      react: R('react'),
      'react-dom': R('react-dom'),
    },
    dedupe: ['react', 'react-dom', 'remotion'],
  },
  server: {
    fs: {allow: ['..']},
  },
});
