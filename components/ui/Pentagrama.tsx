import { ELEMENTS, type Element } from "@/content/public/estacions";

export interface NodePentagrama {
  id: string;
  element: Element;
  resolt: boolean;
  disponible: boolean;
}

export interface PentagramaProps {
  /** Les cinc fites elementals, en l'ordre del recorregut. */
  nodes?: NodePentagrama[];
  /** El Gresol del centre s'encén quan totes les fites estan resoltes. */
  centreActiu?: boolean;
  /** Anell exterior girant (decoratiu). */
  girar?: boolean;
  seleccionatId?: string | null;
  onTriar?: (id: string) => void;
  /** Elements amb color encara que no estiguin resolts (ús decoratiu). */
  vius?: boolean;
  className?: string;
}

const MIDA = 300;
const C = MIDA / 2;
const R_NODE = 100;
const R_ANELL = 136;
const MIDA_NODE = 27;

const ORDRE: Element[] = ["aigua", "terra", "foc", "aire", "anima"];
const DECORATIU: NodePentagrama[] = ORDRE.map((element) => ({
  id: element,
  element,
  resolt: false,
  disponible: true,
}));

function vertex(i: number, r = R_NODE) {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return { x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) };
}

/**
 * El pentagrama dels cinc elements al voltant del Pla de Masset: fa de segell
 * de l'app i de marcador de progrés. Cada fita resolta pren el seu color i,
 * quan dues puntes veïnes de l'estrella estan resoltes, la línia s'encén d'or.
 */
export function Pentagrama({
  nodes = DECORATIU,
  centreActiu = false,
  girar = false,
  seleccionatId = null,
  onTriar,
  vius = false,
  className = "",
}: PentagramaProps) {
  const punts = nodes.map((_, i) => vertex(i));

  return (
    <svg
      viewBox={`0 0 ${MIDA} ${MIDA}`}
      className={`block ${className}`}
      role="img"
      aria-label={`Pentagrama: ${nodes.filter((n) => n.resolt).length} de ${nodes.length} elements`}
    >
      <defs>
        <path
          id="anell-text"
          d={`M ${C} ${C - R_ANELL + 12} a ${R_ANELL - 12} ${R_ANELL - 12} 0 1 1 -0.01 0`}
        />
        <radialGradient id="brillantor">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
        </radialGradient>
        <filter id="gris">
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* Anell exterior amb el lloc i l'any */}
      <g className={girar ? "animate-girar" : undefined} style={{ transformOrigin: `${C}px ${C}px` }}>
        <circle cx={C} cy={C} r={R_ANELL} fill="none" stroke="#1b1511" strokeWidth={3} />
        <circle cx={C} cy={C} r={R_ANELL - 24} fill="none" stroke="#1b1511" strokeWidth={1.5} />
        <text
          fontFamily="var(--font-alegreya-sans-sc), sans-serif"
          fontWeight={700}
          fontSize={13}
          letterSpacing={3}
          fill="#5a4a3c"
        >
          <textPath href="#anell-text" textLength={2 * Math.PI * (R_ANELL - 12) - 6}>
            sentfores ✦ mcdlxxii ✦ sentfores ✦ mcdlxxii ✦
          </textPath>
        </text>
      </g>

      {centreActiu && <circle cx={C} cy={C} r={110} fill="url(#brillantor)" />}

      {/* Estrella: cada punta es connecta amb la de dues posicions més enllà */}
      {punts.map((p, i) => {
        const j = (i + 2) % punts.length;
        const q = punts[j];
        const encesa = nodes[i].resolt && nodes[j].resolt;
        return (
          <line
            key={`l${i}`}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke={encesa ? "#eab308" : "#1b1511"}
            strokeWidth={encesa ? 6 : 2}
            strokeOpacity={encesa ? 1 : 0.35}
            strokeDasharray={encesa ? undefined : "6 6"}
            strokeLinecap="round"
          />
        );
      })}

      {/* Gresol central */}
      <g>
        <circle
          cx={C}
          cy={C}
          r={30}
          fill={centreActiu ? "#eab308" : "#e9d5a6"}
          stroke="#1b1511"
          strokeWidth={3}
        />
        <path
          d={`M ${C - 14} ${C - 8} L ${C + 14} ${C - 8} L ${C + 9} ${C + 12} L ${C - 9} ${C + 12} Z`}
          fill={centreActiu ? "#1b1511" : "none"}
          stroke="#1b1511"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <line x1={C - 18} y1={C - 8} x2={C + 18} y2={C - 8} stroke="#1b1511" strokeWidth={3} strokeLinecap="round" />
      </g>

      {/* Puntes elementals */}
      {nodes.map((node, i) => {
        const { x, y } = punts[i];
        const element = ELEMENTS[node.element];
        const seleccionat = node.id === seleccionatId;
        const clicable = Boolean(onTriar);
        const viu = node.resolt || vius;
        return (
          <g
            key={node.id}
            onClick={clicable ? () => onTriar?.(node.id) : undefined}
            onKeyDown={
              clicable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") onTriar?.(node.id);
                  }
                : undefined
            }
            role={clicable ? "button" : undefined}
            tabIndex={clicable ? 0 : undefined}
            aria-label={clicable ? `${element.nom}${node.resolt ? ", resolta" : ""}` : undefined}
            style={{ cursor: clicable ? "pointer" : undefined }}
          >
            {seleccionat && (
              <circle cx={x} cy={y} r={MIDA_NODE + 9} fill="none" stroke="#eab308" strokeWidth={5} />
            )}
            <circle
              cx={x}
              cy={y}
              r={MIDA_NODE}
              fill={viu ? "#fffdf7" : "#f3e5c4"}
              stroke={viu ? element.color : "#1b1511"}
              strokeWidth={viu ? 6 : 3}
              strokeDasharray={node.disponible ? undefined : "4 4"}
            />
            <image
              href={element.icona}
              x={x - 17}
              y={y - 17}
              width={34}
              height={34}
              opacity={viu ? 1 : node.disponible ? 0.55 : 0.3}
              filter={viu ? undefined : "url(#gris)"}
            />
            {node.resolt && (
              <g>
                <circle cx={x + 19} cy={y - 19} r={11} fill="#1f7a3a" stroke="#1b1511" strokeWidth={2.5} />
                <path
                  d={`M ${x + 14} ${y - 19} l 4 4 l 7 -8`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
