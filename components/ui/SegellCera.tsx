/**
 * Segell de cera vermell fosc amb el pentagrama dels cinc elements, en SVG.
 * La vora irregular (degotalls de cera) es calcula una sola vegada i és
 * determinista, perquè el servidor i el client pintin el mateix.
 */

const C = 60;

/** Vora de la cera: un cercle amb ondulacions i tres degotalls més grossos. */
const VORA = (() => {
  const punts = 40;
  const coords: [number, number][] = [];
  for (let i = 0; i < punts; i++) {
    const a = (i / punts) * Math.PI * 2;
    const r =
      50 +
      2.2 * Math.sin(a * 7 + 0.6) +
      1.6 * Math.sin(a * 13 + 2.1) +
      (i === 5 || i === 18 || i === 31 ? 5.5 : 0) +
      (i === 6 || i === 30 ? 2.5 : 0);
    coords.push([C + r * Math.cos(a), C + r * Math.sin(a)]);
  }
  // Corbes suaus que passen pels punts mitjos de cada parell.
  const mig = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const inici = mig(coords[punts - 1], coords[0]);
  let d = `M ${inici[0].toFixed(1)} ${inici[1].toFixed(1)}`;
  for (let i = 0; i < punts; i++) {
    const p = coords[i];
    const m = mig(p, coords[(i + 1) % punts]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d} Z`;
})();

const ESTRELLA = (() => {
  const r = 22;
  const vertexs = Array.from({ length: 5 }, (_, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  });
  return [0, 2, 4, 1, 3].map((i, n) => `${n ? "L" : "M"} ${vertexs[i][0].toFixed(1)} ${vertexs[i][1].toFixed(1)}`).join(" ") + " Z";
})();

export function SegellCera({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`block ${className}`} role="img" aria-label="Segell de cera amb el pentagrama">
      <defs>
        <radialGradient id="segell-cera-cos" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#c8372c" />
          <stop offset="45%" stopColor="#8e1b14" />
          <stop offset="100%" stopColor="#4a0906" />
        </radialGradient>
        <radialGradient id="segell-cera-centre" cx="55%" cy="60%" r="70%">
          <stop offset="0%" stopColor="#7a1510" />
          <stop offset="100%" stopColor="#9e231a" />
        </radialGradient>
      </defs>

      {/* Ombra sobre el paper */}
      <path d={VORA} fill="#1b1511" opacity={0.28} transform="translate(2.5 3.5)" />
      {/* Cos de la cera */}
      <path d={VORA} fill="url(#segell-cera-cos)" stroke="#3a0604" strokeWidth={1} />
      {/* Llum a la vora de dalt */}
      <path d={VORA} fill="none" stroke="#e8756a" strokeOpacity={0.35} strokeWidth={1.2} transform="translate(-0.8 -0.8)" />

      {/* Cavitat premuda pel segell */}
      <circle cx={C} cy={C} r={36} fill="url(#segell-cera-centre)" />
      <circle cx={C} cy={C} r={36} fill="none" stroke="#3a0604" strokeWidth={2.2} strokeOpacity={0.8} />
      <circle cx={C + 0.9} cy={C + 0.9} r={36} fill="none" stroke="#e8756a" strokeOpacity={0.4} strokeWidth={1} />
      <circle cx={C} cy={C} r={30} fill="none" stroke="#3a0604" strokeWidth={1} strokeDasharray="1.5 3" strokeOpacity={0.8} />

      {/* Pentagrama en relleu: ombra fosca i llum desplaçada */}
      <path d={ESTRELLA} fill="none" stroke="#e8756a" strokeOpacity={0.45} strokeWidth={3} strokeLinejoin="round" transform="translate(0.9 0.9)" />
      <path d={ESTRELLA} fill="none" stroke="#3a0604" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={C} cy={C} r={4} fill="#3a0604" />

      {/* Reflex de la cera */}
      <ellipse cx={42} cy={34} rx={11} ry={5} fill="#ffffff" opacity={0.16} transform="rotate(-32 42 34)" />
    </svg>
  );
}
