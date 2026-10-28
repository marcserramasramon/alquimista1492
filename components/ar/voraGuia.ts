/**
 * Resplendor a la vora de la pantalla que diu cap a on girar-se per trobar una figura: a l'esquerra o a la
 * dreta segons convingui; quan és a la vista, a tots els marges. `dx` són els graus fins a la figura
 * (positiu = a la dreta) i `periodeMs` el ritme del batec. `color` són els tres canals "r, g, b" (vermell
 * per defecte, com als ulls de l'Aire).
 */
export function dibuixaVora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dx: number,
  intensitat: number,
  periodeMs: number,
  ara: number,
  color = "255, 24, 24",
) {
  // A la vista (dins del camp de visió, amb una mica de marge): es il·luminen tots els marges.
  const enVista = Math.max(0, Math.min(1, (30 - Math.abs(dx)) / 8));
  const fora = 1 - enVista;
  const pesos = {
    esquerra: Math.max(enVista, dx < 0 ? fora : 0),
    dreta: Math.max(enVista, dx > 0 ? fora : 0),
    dalt: enVista,
    baix: enVista,
  };
  const batec = 0.75 + 0.25 * Math.sin((ara / periodeMs) * Math.PI * 2);
  const alfa = 0.75 * intensitat * batec;
  const vora = (x0: number, y0: number, x1: number, y1: number, pes: number, rx: number, ry: number, rw: number, rh: number) => {
    if (pes <= 0.01) return;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(${color}, ${alfa * pes})`);
    g.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(rx, ry, rw, rh);
  };
  const ample = w * 0.12;
  const alt = h * 0.05;
  vora(0, 0, ample, 0, pesos.esquerra, 0, 0, ample, h);
  vora(w, 0, w - ample, 0, pesos.dreta, w - ample, 0, ample, h);
  vora(0, 0, 0, alt, pesos.dalt, 0, 0, w, alt);
  vora(0, h, 0, h - alt, pesos.baix, 0, h - alt, w, alt);
}
