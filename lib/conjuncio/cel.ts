/**
 * Geometria del cel virtual del prototip «La Conjunció dels Astres» (només local, mai publicat).
 *
 * Tots els vectors són [est, amunt, nord]. Una direcció del cel es descriu amb dos números de 3 xifres:
 *   X (est–oest)  i  Z (nord–sud), tots dos de 0 a 999 amb 500 = zero  →  components de −1 a +1.
 * L'alçada surt sola: amunt = √(1 − X² − Z²). Així «127 · 233» és un punt concret del cel.
 */

export type V3 = [number, number, number];

/** Base de la càmera del mòbil al món: cap a on mira, la dreta i el «dalt» de la pantalla. */
export interface Base {
  f: V3;
  r: V3;
  u: V3;
}

const RAD = Math.PI / 180;

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Direcció des d'un azimut (graus des del nord, sentit horari) i una elevació (graus sobre l'horitzó). */
export function dirDesAzEl(az: number, el: number): V3 {
  const c = Math.cos(el * RAD);
  return [Math.sin(az * RAD) * c, Math.sin(el * RAD), Math.cos(az * RAD) * c];
}

export function azEl(d: V3): { az: number; el: number } {
  return { az: (Math.atan2(d[0], d[2]) / RAD + 360) % 360, el: Math.asin(clamp(d[1], -1, 1)) / RAD };
}

/** Els dos números (X, Z) que descriuen una direcció del cel. */
export function codisDesDir(d: V3): [number, number] {
  return [clamp(Math.round(500 + 500 * d[0]), 0, 999), clamp(Math.round(500 + 500 * d[2]), 0, 999)];
}

/** Direcció del cel a partir dels números X i Z (poden portar decimals mentre s'arrossega un dial). */
export function dirDesCodis(X: number, Z: number): V3 {
  const x = (X - 500) / 500;
  const z = (Z - 500) / 500;
  const r2 = x * x + z * z;
  if (r2 > 1) {
    const s = 1 / Math.sqrt(r2);
    return [x * s, 0, z * s];
  }
  return [x, Math.sqrt(1 - r2), z];
}

/** Angle (graus) entre dues direccions. */
export function errorAngular(a: V3, b: V3): number {
  return Math.acos(clamp(dot(a, b), -1, 1)) / RAD;
}

/** Diferència d'azimut curta, en (−180, 180]. */
export function diffAz(a: number, b: number): number {
  const d = ((((a - b) % 360) + 540) % 360) - 180;
  return d === -180 ? 180 : d;
}

/**
 * Base de la càmera a partir dels angles del mòbil (W3C: Z·X'·Y''). Eix X del mòbil = dreta de la pantalla,
 * eix Y = dalt, i la càmera del darrere mira pel −Z. Inclou el gir lateral (roll) sense cap aproximació.
 */
export function baseDesAngles(alpha: number, beta: number, gamma: number): Base {
  const cA = Math.cos(alpha * RAD);
  const sA = Math.sin(alpha * RAD);
  const cB = Math.cos(beta * RAD);
  const sB = Math.sin(beta * RAD);
  const cG = Math.cos(gamma * RAD);
  const sG = Math.sin(gamma * RAD);
  // Components (est, nord, amunt) → es reordenen a [est, amunt, nord].
  const r: V3 = [cA * cG - sA * sB * sG, -cB * sG, sA * cG + cA * sB * sG];
  const u: V3 = [-sA * cB, sB, cA * cB];
  const f: V3 = [-(cA * sG + sA * sB * cG), -(cB * cG), -(sA * sG - cA * sB * cG)];
  return { f, r, u };
}

/** Base sense gir lateral, mirant cap a un rumb i una elevació (per al mode de simulació amb ratolí). */
export function baseDesMirada(rumb: number, elev: number): Base {
  const f = dirDesAzEl(rumb, elev);
  const r = norm([f[2], 0, -f[0]]);
  return { f, r, u: cross(f, r) };
}

/** Barreja suau entre dues bases (filtre passabaixos) i la torna ortonormal. */
export function suavitza(prev: Base, nova: Base, k: number): Base {
  const mix = (a: V3, b: V3): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const f = norm(mix(prev.f, nova.f));
  const r0 = mix(prev.r, nova.r);
  const r = norm([r0[0] - f[0] * dot(r0, f), r0[1] - f[1] * dot(r0, f), r0[2] - f[2] * dot(r0, f)]);
  return { f, r, u: cross(f, r) };
}

/** Components d'una direcció del cel en el sistema de la càmera: [dreta, dalt, endavant]. */
export function enCamera(d: V3, b: Base): V3 {
  return [dot(d, b.r), dot(d, b.u), dot(d, b.f)];
}

/** Gir lateral del mòbil en graus (0 = dret). */
export function rollGraus(b: Base): number {
  return Math.atan2(b.r[1], b.u[1]) / RAD;
}

/** Projecció d'una direcció del cel a la pantalla (centre cx, cy). `vis` és fals si és darrere la càmera. */
export function projecta(d: V3, b: Base, focal: number, cx: number, cy: number): { x: number; y: number; vis: boolean } {
  const fons = dot(d, b.f);
  if (fons < 0.05) return { x: -9999, y: -9999, vis: false };
  return { x: cx + (focal * dot(d, b.r)) / fons, y: cy - (focal * dot(d, b.u)) / fons, vis: true };
}

/** Elevació sobre l'horitzó dels cinc vèrtexs del pentagrama (graus) i separació d'azimut (72°). */
export const ELEVACIO_PENTAGRAMA = 50;
export const AZIMUT_PENTAGRAMA = 72;
