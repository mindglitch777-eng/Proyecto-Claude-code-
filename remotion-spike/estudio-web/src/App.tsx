import {Player} from '@remotion/player';
import React, {useEffect, useMemo, useState} from 'react';
import type {NombreFigura} from '../../src/dibujo/figuras';
import {Caso, CasoConfig, duracionCaso} from '../../src/documental/CasoGenerico';
import {ALTO, ANCHO, FPS} from '../../src/identidad';
import './App.css';

const FIGS: NombreFigura[] = [
  'lupa', 'ojo', 'etiqueta', 'foco', 'notebook', 'mensaje', 'gente', 'billete',
  'chip', 'carpeta', 'documento', 'telefono', 'carrito', 'nube', 'edificio',
  'mapa', 'engranaje', 'cohete', 'persona', 'reloj', 'moneda', 'robot',
  'local', 'barras', 'candado', 'calendario', 'balanza',
];

const CENTRO_TIPOS = [
  {id: 'lineas', nombre: 'Lista de pasos'},
  {id: 'cronologia', nombre: 'Línea de tiempo'},
  {id: 'balanza', nombre: 'Comparación'},
  {id: 'antesDespues', nombre: 'Antes / después'},
] as const;

const CIFRA_TIPOS = [
  {id: 'cifraSeCae', nombre: 'Un número cae a otro'},
  {id: 'contador', nombre: 'Contador que sube'},
] as const;

type CentroTipo = (typeof CENTRO_TIPOS)[number]['id'];
type CifraTipo = (typeof CIFRA_TIPOS)[number]['id'];

type Estado = {
  slug: string;
  hook: string[];
  hookDinero: boolean;
  centroTipo: CentroTipo;
  items: {txt: string; fig: NombreFigura}[];
  hitos: {cuando: string; que: string}[];
  izq: {txt: string; peso: number};
  der: {txt: string; peso: number};
  pie: string;
  antes: {rotulo: string; txt: string};
  despues: {rotulo: string; txt: string};
  cifraActiva: boolean;
  cifraTipo: CifraTipo;
  cifra: {arriba: string; de: string; a: string; abajo: string; hasta: number; prefijo: string; sufijo: string};
  cifraDinero: boolean;
  final: string[];
};

const CLAVE = 'guionador-estudio-v1';

function estadoDefault(): Estado {
  return {
    slug: 'mi-caso',
    hook: ['Facturó $50.000 en un mes.', 'Y no fue con un producto físico.'],
    hookDinero: true,
    centroTipo: 'lineas',
    items: [
      {txt: 'Qué producto hacía parar el scroll', fig: 'lupa'},
      {txt: 'Qué precio no espantaba al comprador', fig: 'etiqueta'},
    ],
    hitos: [{cuando: 'MES 1', que: 'Primeras ventas'}, {cuando: 'MES 6', que: 'Ya no era casualidad'}],
    izq: {txt: 'Un producto para todo el mundo', peso: 3},
    der: {txt: 'Un problema específico, bien resuelto', peso: 8},
    pie: 'La especificidad no te achica: te posiciona',
    antes: {rotulo: 'ANTES', txt: 'Producir era la barrera'},
    despues: {rotulo: 'AHORA', txt: 'Producir es gratis. Elegir es la ventaja'},
    cifraActiva: true,
    cifraTipo: 'cifraSeCae',
    cifra: {arriba: 'De ese total facturado', de: 'Ganancia real', a: '$18.000', abajo: 'Esa es la plata que se lleva a casa', hasta: 0, prefijo: '$', sufijo: '+'},
    cifraDinero: false,
    final: ['Facturar no es ganar. Dejá de confundirlos.'],
  };
}

function cargarEstado(): Estado {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return {...estadoDefault(), ...JSON.parse(crudo)};
  } catch {
    /* localStorage puede fallar (privado, cuota) -- se sigue con el default */
  }
  return estadoDefault();
}

function construirCfg(e: Estado): CasoConfig {
  const centro: CasoConfig['centro'] =
    e.centroTipo === 'lineas'
      ? {tipo: 'lineas', items: e.items.filter((i) => i.txt.trim())}
      : e.centroTipo === 'cronologia'
      ? {tipo: 'cronologia', hitos: e.hitos.filter((h) => h.que.trim())}
      : e.centroTipo === 'balanza'
      ? {tipo: 'balanza', izq: e.izq, der: e.der, pie: e.pie || undefined}
      : {tipo: 'antesDespues', antes: e.antes, despues: e.despues};

  const cifra: CasoConfig['cifra'] = e.cifraActiva
    ? e.cifraTipo === 'cifraSeCae'
      ? {tipo: 'cifraSeCae', arriba: e.cifra.arriba, de: e.cifra.de, a: e.cifra.a, abajo: e.cifra.abajo || undefined}
      : {tipo: 'contador', arriba: e.cifra.arriba || undefined, hasta: e.cifra.hasta, prefijo: e.cifra.prefijo || undefined, sufijo: e.cifra.sufijo || undefined, abajo: e.cifra.abajo || undefined}
    : undefined;

  return {
    slug: e.slug || 'sin-nombre',
    hook: e.hook.filter((l) => l.trim()).length ? e.hook.filter((l) => l.trim()) : [' '],
    hookDinero: e.hookDinero,
    centro,
    cifra,
    cifraDinero: e.cifraDinero,
    final: e.final.filter((l) => l.trim()).length ? e.final.filter((l) => l.trim()) : [' '],
  };
}

function Conmutador({activo, titulo, sub, onClick}: {activo: boolean; titulo: string; sub: string; onClick: () => void}) {
  return (
    <div className="conmutador" onClick={onClick}>
      <span className="txt">{titulo}<span className="sub">{sub}</span></span>
      <div className={'interruptor' + (activo ? ' on' : '')} />
    </div>
  );
}

function FilaLista({valor, onCambio, onQuitar, placeholder}: {valor: string; onCambio: (v: string) => void; onQuitar: () => void; placeholder: string}) {
  return (
    <div className="fila-lista">
      <input type="text" value={valor} placeholder={placeholder} onChange={(ev) => onCambio(ev.target.value)} />
      <button type="button" className="icono" onClick={onQuitar}>×</button>
    </div>
  );
}

export function App() {
  const [estado, setEstado] = useState<Estado>(cargarEstado);

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* ignorar */ }
  }, [estado]);

  const cfg = useMemo(() => construirCfg(estado), [estado]);
  const duracion = useMemo(() => duracionCaso(cfg), [cfg]);
  const frames = Math.max(1, Math.round(duracion * FPS));

  function set<K extends keyof Estado>(clave: K, valor: Estado[K]) {
    setEstado((e) => ({...e, [clave]: valor}));
  }

  return (
    <div className="app">
      <div className="eyebrow">El Corte · Serie documental</div>
      <h1>Guionador</h1>
      <p className="subt">
        La vista de la derecha usa el mismo componente que renderiza el video final —
        no es una maqueta. Si acá se ve bien, se ve bien en el video.
      </p>

      <div className="franja-meta">
        <div className="chip dur">Duración real <b>{duracion.toFixed(1)}s</b></div>
        {(estado.hookDinero || estado.cifraDinero) && (
          <div className="chip ok"><b>$</b> lluvia de dinero activa</div>
        )}
      </div>

      <div className="grilla">
        <div>
          <label className="campo">Nombre interno (slug)</label>
          <input type="text" value={estado.slug} onChange={(ev) => set('slug', ev.target.value)} placeholder="ej: nombre-apellido" />

          {/* ---------------- GANCHO ---------------- */}
          <div className="bloque">
            <div className="bloque-cab"><span className="bloque-num">01</span><span className="bloque-nombre">Gancho</span></div>
            <p className="bloque-ayuda">Tenés tres segundos antes del scroll. Nombrá la plata o la pregunta, ya.</p>
            <label className="campo">Líneas del gancho</label>
            {estado.hook.map((l, i) => (
              <FilaLista
                key={i}
                valor={l}
                placeholder="Ej: Facturó $50.000 en un mes"
                onCambio={(v) => { const h = [...estado.hook]; h[i] = v; set('hook', h); }}
                onQuitar={() => { const h = estado.hook.filter((_, j) => j !== i); set('hook', h.length ? h : ['']); }}
              />
            ))}
            {estado.hook.length < 3 && (
              <button type="button" className="agregar" onClick={() => set('hook', [...estado.hook, ''])}>+ Agregar línea</button>
            )}
            <Conmutador
              activo={estado.hookDinero}
              titulo="Lluvia de dinero acá"
              sub="Si el gancho menciona una cifra fuerte"
              onClick={() => set('hookDinero', !estado.hookDinero)}
            />
          </div>

          {/* ---------------- CENTRO ---------------- */}
          <div className="bloque">
            <div className="bloque-cab"><span className="bloque-num">02</span><span className="bloque-nombre">Centro</span></div>
            <p className="bloque-ayuda">Acá explicás CÓMO lo logró. Si esto se entiende de un vistazo, ya ganaste la retención.</p>
            <div className="segmentado">
              {CENTRO_TIPOS.map((t) => (
                <button key={t.id} type="button" className={estado.centroTipo === t.id ? 'activo' : ''} onClick={() => set('centroTipo', t.id)}>{t.nombre}</button>
              ))}
            </div>

            {estado.centroTipo === 'lineas' && (
              <>
                <label className="campo">Pasos</label>
                {estado.items.map((it, i) => (
                  <div className="fila-doble desigual" key={i}>
                    <select value={it.fig} onChange={(ev) => { const arr = [...estado.items]; arr[i] = {...arr[i], fig: ev.target.value as NombreFigura}; set('items', arr); }}>
                      {FIGS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input type="text" value={it.txt} placeholder="Qué pasaba en este paso"
                      onChange={(ev) => { const arr = [...estado.items]; arr[i] = {...arr[i], txt: ev.target.value}; set('items', arr); }} />
                  </div>
                ))}
                {estado.items.length < 6 && (
                  <button type="button" className="agregar" onClick={() => set('items', [...estado.items, {txt: '', fig: 'lupa'}])}>+ Agregar paso</button>
                )}
              </>
            )}

            {estado.centroTipo === 'cronologia' && (
              <>
                <label className="campo">Hitos</label>
                {estado.hitos.map((h, i) => (
                  <div className="fila-doble desigual" key={i}>
                    <input type="text" value={h.cuando} placeholder="Cuándo"
                      onChange={(ev) => { const arr = [...estado.hitos]; arr[i] = {...arr[i], cuando: ev.target.value}; set('hitos', arr); }} />
                    <input type="text" value={h.que} placeholder="Qué pasó"
                      onChange={(ev) => { const arr = [...estado.hitos]; arr[i] = {...arr[i], que: ev.target.value}; set('hitos', arr); }} />
                  </div>
                ))}
                {estado.hitos.length < 4 && (
                  <button type="button" className="agregar" onClick={() => set('hitos', [...estado.hitos, {cuando: '', que: ''}])}>+ Agregar hito</button>
                )}
              </>
            )}

            {estado.centroTipo === 'balanza' && (
              <>
                <label className="campo">Lado izquierdo (el que pierde)</label>
                <input type="text" value={estado.izq.txt} onChange={(ev) => set('izq', {...estado.izq, txt: ev.target.value})} />
                <label className="campo">Lado derecho (el que gana)</label>
                <input type="text" value={estado.der.txt} onChange={(ev) => set('der', {...estado.der, txt: ev.target.value})} />
                <label className="campo">Frase de cierre de la comparación</label>
                <input type="text" value={estado.pie} onChange={(ev) => set('pie', ev.target.value)} />
              </>
            )}

            {estado.centroTipo === 'antesDespues' && (
              <>
                <label className="campo">Antes</label>
                <div className="fila-doble desigual">
                  <input type="text" value={estado.antes.rotulo} onChange={(ev) => set('antes', {...estado.antes, rotulo: ev.target.value})} />
                  <input type="text" value={estado.antes.txt} onChange={(ev) => set('antes', {...estado.antes, txt: ev.target.value})} />
                </div>
                <label className="campo">Después</label>
                <div className="fila-doble desigual">
                  <input type="text" value={estado.despues.rotulo} onChange={(ev) => set('despues', {...estado.despues, rotulo: ev.target.value})} />
                  <input type="text" value={estado.despues.txt} onChange={(ev) => set('despues', {...estado.despues, txt: ev.target.value})} />
                </div>
              </>
            )}
          </div>

          {/* ---------------- CIFRA ---------------- */}
          <div className="bloque">
            <div className="bloque-cab"><span className="bloque-num">03</span><span className="bloque-nombre">Cifra</span></div>
            <p className="bloque-ayuda">El número real. Es lo que hace que esto no suene a cuento chino.</p>
            <Conmutador
              activo={estado.cifraActiva}
              titulo="Incluir una cifra"
              sub="Opcional, pero sin esto pierde peso"
              onClick={() => set('cifraActiva', !estado.cifraActiva)}
            />
            {estado.cifraActiva && (
              <>
                <div className="segmentado">
                  {CIFRA_TIPOS.map((t) => (
                    <button key={t.id} type="button" className={estado.cifraTipo === t.id ? 'activo' : ''} onClick={() => set('cifraTipo', t.id)}>{t.nombre}</button>
                  ))}
                </div>
                <label className="campo">Frase de arriba</label>
                <input type="text" value={estado.cifra.arriba} onChange={(ev) => set('cifra', {...estado.cifra, arriba: ev.target.value})} />
                {estado.cifraTipo === 'cifraSeCae' ? (
                  <div className="fila-doble">
                    <div><label className="campo">De</label><input type="text" value={estado.cifra.de} onChange={(ev) => set('cifra', {...estado.cifra, de: ev.target.value})} /></div>
                    <div><label className="campo">A</label><input type="text" value={estado.cifra.a} onChange={(ev) => set('cifra', {...estado.cifra, a: ev.target.value})} /></div>
                  </div>
                ) : (
                  <>
                    <div className="fila-doble">
                      <div><label className="campo">Prefijo</label><input type="text" value={estado.cifra.prefijo} onChange={(ev) => set('cifra', {...estado.cifra, prefijo: ev.target.value})} /></div>
                      <div><label className="campo">Hasta</label><input type="number" value={estado.cifra.hasta} onChange={(ev) => set('cifra', {...estado.cifra, hasta: +ev.target.value || 0})} /></div>
                    </div>
                    <label className="campo">Sufijo</label>
                    <input type="text" value={estado.cifra.sufijo} onChange={(ev) => set('cifra', {...estado.cifra, sufijo: ev.target.value})} />
                  </>
                )}
                <label className="campo">Frase de abajo</label>
                <input type="text" value={estado.cifra.abajo} onChange={(ev) => set('cifra', {...estado.cifra, abajo: ev.target.value})} />
                <Conmutador
                  activo={estado.cifraDinero}
                  titulo="Lluvia de dinero acá"
                  sub="Si esta es LA cifra fuerte del video"
                  onClick={() => set('cifraDinero', !estado.cifraDinero)}
                />
              </>
            )}
          </div>

          {/* ---------------- CIERRE ---------------- */}
          <div className="bloque">
            <div className="bloque-cab"><span className="bloque-num">04</span><span className="bloque-nombre">Cierre</span></div>
            <p className="bloque-ayuda">La frase con la que se quedan pensando — o la que hace que comenten.</p>
            <label className="campo">Líneas del cierre</label>
            {estado.final.map((l, i) => (
              <FilaLista
                key={i}
                valor={l}
                placeholder="Ej: El número importa cuando entendés qué lo produce"
                onCambio={(v) => { const f = [...estado.final]; f[i] = v; set('final', f); }}
                onQuitar={() => { const f = estado.final.filter((_, j) => j !== i); set('final', f.length ? f : ['']); }}
              />
            ))}
            {estado.final.length < 2 && (
              <button type="button" className="agregar" onClick={() => set('final', [...estado.final, ''])}>+ Agregar línea</button>
            )}
          </div>
        </div>

        <div className="columna-preview">
          <div className="marco-player">
            <Player
              component={Caso}
              inputProps={{cfg}}
              durationInFrames={frames}
              compositionWidth={ANCHO}
              compositionHeight={ALTO}
              fps={FPS}
              style={{width: '100%'}}
              controls
              loop
            />
          </div>
          <p className="nota-preview"><b>Motor real</b>, no una maqueta — mismo componente que el render final.</p>
        </div>
      </div>
    </div>
  );
}
