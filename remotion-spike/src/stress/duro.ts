// Entrada "seca" NO quiere decir sin movimiento. El operador lo aclaro:
// lo que no quiere es una curva suave tipo spring() que rebota. Lo que
// SI quiere es golpe, giro, escala -- rapido y lineal, sin rebote.
//
// Esta funcion da un golpe de 0.11s: arranca girado y agrandado, y cae
// en linea recta (no en curva) a su lugar. Es la diferencia entre
// "aparecio" y "aparecio con fuerza".
export function golpeSeco(t: number, t0: number, dur = 0.11) {
  const p = Math.max(0, Math.min(1, (t - t0) / dur));
  const activo = t >= t0;
  // el signo del giro alterna segun el propio t0, para que dos golpes
  // seguidos no roten siempre para el mismo lado
  const signo = Math.round(t0 * 100) % 2 === 0 ? 1 : -1;
  return {
    opacity: activo ? 1 : 0,
    escala: activo ? 1.22 - 0.22 * p : 1,
    giro: activo ? (1 - p) * 5 * signo : 0,
    // el lavado de color: fuerte en el primer instante, se apaga rapido
    lavado: activo ? Math.max(0, 1 - (t - t0) / 0.16) ** 2 : 0,
  };
}
