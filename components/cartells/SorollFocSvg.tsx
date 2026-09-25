import type { FormaSimbol, Soroll } from "@/lib/sorollFoc";

/**
 * Símbols alquímics dibuixats amb traços (no amb fonts, que no sempre tenen
 * el bloc Unicode alquímic). Centrats a (0,0), dins un quadrat de costat 1.
 */
function Simbol({ forma }: { forma: FormaSimbol }) {
  const amunt = "M0,-0.42 L0.4,0.3 L-0.4,0.3 Z";
  const avall = "M0,0.42 L0.4,-0.3 L-0.4,-0.3 Z";
  switch (forma) {
    case "foc":
      return <path d={amunt} />;
    case "aigua":
      return <path d={avall} />;
    case "aire":
      return <path d={`${amunt} M-0.3,0.02 L0.3,0.02`} />;
    case "terra":
      return <path d={`${avall} M-0.3,-0.02 L0.3,-0.02`} />;
    case "sol":
      return (
        <>
          <circle r={0.38} />
          <circle r={0.07} fill="currentColor" />
        </>
      );
    case "lluna":
      return <path d="M0.12,-0.4 A0.4,0.4 0 1,0 0.12,0.4 A0.3,0.3 0 1,1 0.12,-0.4 Z" />;
    case "sofre":
      return <path d="M0,-0.46 L0.24,-0.06 L-0.24,-0.06 Z M0,-0.06 L0,0.46 M-0.2,0.2 L0.2,0.2" />;
    case "sal":
      return <path d="M0.38,0 A0.38,0.38 0 1,1 -0.38,0 A0.38,0.38 0 1,1 0.38,0 Z M-0.38,0 L0.38,0" />;
    case "estrella": {
      const punts = Array.from({ length: 5 }, (_, i) => {
        const a = ((i * 144 - 90) * Math.PI) / 180;
        return `${(0.42 * Math.cos(a)).toFixed(3)},${(0.42 * Math.sin(a)).toFixed(3)}`;
      });
      return <path d={`M${punts.join(" L")} Z`} />;
    }
  }
}

const PAPER = "#fbf4e4";

/**
 * La composició de números i símbols del cartell de Foc (lib/sorollFoc.ts).
 * `halo`: vora de paper al voltant de cada peça, perquè es llegeixi a sobre d'una il·lustració.
 */
export function SorollFocSvg({ soroll, className, halo }: { soroll: Soroll; className?: string; halo?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${soroll.amplada} ${soroll.alcada}`}
      className={className}
      role="img"
      aria-label="Composició de números i símbols de colors"
    >
      {soroll.peces.map((p, i) =>
        p.xifra ? (
          <text
            key={i}
            x={p.x}
            y={p.y}
            fill={p.color}
            fontSize={p.mida}
            fontWeight={800}
            textAnchor="middle"
            dominantBaseline="central"
            {...(halo ? { stroke: PAPER, strokeWidth: p.mida * 0.08, strokeLinejoin: "round" as const, paintOrder: "stroke" } : {})}
            transform={`rotate(${p.rotacio.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
            style={{ fontFamily: "var(--font-alegreya-sans), sans-serif" }}
          >
            {p.xifra}
          </text>
        ) : (
          <g
            key={i}
            transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rotacio.toFixed(1)}) scale(${(p.mida * 0.85).toFixed(1)})`}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          >
            {halo && (
              <g color={PAPER} stroke="currentColor" strokeWidth={0.18}>
                <Simbol forma={p.simbol!} />
              </g>
            )}
            <g color={p.color} stroke="currentColor" strokeWidth={0.1}>
              <Simbol forma={p.simbol!} />
            </g>
          </g>
        ),
      )}
    </svg>
  );
}
