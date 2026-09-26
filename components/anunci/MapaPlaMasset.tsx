import Image from "next/image";

/**
 * Mapa estàtic per a la landing de difusió: només mostra on és el Pla del
 * Masset, sense fites ni interacció (a diferència de `components/player/MapaEquip.tsx`,
 * que és el mapa complet del joc). Fa servir la mateixa imatge il·lustrada i el
 * mateix gir que el mapa del joc (`docs/mapa-proposta-definitiva.md`); el Pla del
 * Masset és el centre exacte de la imatge, així que no cal cap conversió lat/lon.
 */
const MIDA = 2048;
const ANGLE_GRAUS = 29.846;
const INK = "#1b1511";
const PAPER = "#fffdf7";
const GOLD = "#eab308";

export function MapaPlaMasset() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-[3px] border-ink shadow-[0_6px_0_var(--ink)]">
      <Image
        src="/mapa-sentfores.webp"
        alt="Mapa de Sentfores amb la ubicació del Pla del Masset"
        fill
        sizes="(min-width: 640px) 576px, 100vw"
        className="object-cover"
      />
      <svg viewBox={`0 0 ${MIDA} ${MIDA}`} className="absolute inset-0 h-full w-full">
        <g transform={`translate(${MIDA / 2} ${MIDA / 2})`} aria-label="Pla del Masset">
          <circle r={70} fill="none" stroke={GOLD} strokeWidth={14}>
            <animate attributeName="r" values="70;110" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <path d="M -34 56 L 0 106 L 34 56 Z" fill={INK} />
          <circle r={70} fill={GOLD} stroke={INK} strokeWidth={12} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={78} y={2}>
            📍
          </text>
        </g>
      </svg>
      <svg
        viewBox="-80 -80 160 160"
        className="pointer-events-none absolute right-2.5 top-2.5 h-10 w-10"
        role="img"
        aria-label="Nord"
      >
        <g transform={`rotate(${-ANGLE_GRAUS})`}>
          <circle r={70} fill={PAPER} stroke={INK} strokeWidth={8} opacity={0.9} />
          <path d="M 0 -52 L 22 20 L 0 8 L -22 20 Z" fill={INK} />
          <text y={48} textAnchor="middle" fontSize={34} fontWeight={800} fill={INK}>
            N
          </text>
        </g>
      </svg>
    </div>
  );
}
