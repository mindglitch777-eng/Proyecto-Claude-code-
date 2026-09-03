import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {PALETA, GROTESCA} from '../identidad';

// R7-25: @remotion/gsap (MIT) -- construye un GSAP timeline PAUSADO y
// lo hace avanzar segun el frame real de Remotion (useGsapTimeline),
// nunca corre en el reloj real de GSAP -- por eso es seguro para
// render (determinista, sin depender de tiempo real). Pregunta real a
// responder: ¿GSAP aporta algo que los easings/springs nativos de
// Remotion (interpolate + Easing, spring()) no den ya? Respuesta tras
// esta prueba: timelines GSAP encadenan MUCHAS propiedades con
// stagger/easing con menos codigo que interpolate() a mano -- vale
// como REFERENCIA/PROBAR para animaciones complejas de muchos
// elementos, no como reemplazo de los golpes/springs actuales
// (mas simples, ya funcionan).
export const DUR_PRUEBA_GSAP = 90;

export const PruebaGsap: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
    timeline
      .from(selector('.caja'), {opacity: 0, y: 80, scale: 0.7, duration: 1, ease: 'back.out(2)'})
      .to(selector('.caja'), {rotation: 8, duration: 0.5, ease: 'power2.inOut'}, '+=0.3')
      .to(selector('.caja'), {rotation: -8, duration: 0.5, ease: 'power2.inOut'})
      .to(selector('.caja'), {rotation: 0, duration: 0.3, ease: 'power2.out'});
  });

  return (
    <AbsoluteFill
      ref={scope}
      style={{backgroundColor: PALETA.fondo, justifyContent: 'center', alignItems: 'center'}}
    >
      <div
        className="caja"
        style={{
          background: PALETA.acento,
          color: '#fff',
          padding: '32px 48px',
          borderRadius: 20,
          fontFamily: GROTESCA,
          fontSize: 56,
          fontWeight: 700,
        }}
      >
        $3.560
      </div>
    </AbsoluteFill>
  );
};
