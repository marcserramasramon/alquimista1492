import { useId } from "react";
import { Roboto } from "next/font/google";
import { AMPLADA_VORA_CAMUFLATGE } from "@/lib/sorollFoc";
import type { FormaSimbol, PecaSoroll, Soroll } from "@/lib/sorollFoc";

/** Tipografia del número amagat (la resposta). */
const roboto = Roboto({ weight: ["400", "700"], subsets: ["latin"] });

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

/** Una xifra o un símbol del soroll, sense cap vora ni efecte afegit. */
function PecaNoise({ p, color = p.color }: { p: PecaSoroll; color?: string }) {
  return p.xifra ? (
    <text
      x={p.x}
      y={p.y}
      fill={color}
      fontSize={p.mida}
      fontWeight={800}
      textAnchor="middle"
      dominantBaseline="central"
      transform={`rotate(${p.rotacio.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
      style={{ fontFamily: "var(--font-alegreya-sans), sans-serif" }}
    >
      {p.xifra}
    </text>
  ) : (
    <g
      transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rotacio.toFixed(1)}) scale(${(p.mida * 0.85).toFixed(1)})`}
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    >
      <g color={color} stroke="currentColor" strokeWidth={0.1}>
        <Simbol forma={p.simbol!} />
      </g>
    </g>
  );
}

/** Triangle del símbol del Foc (🜂), el mateix de `Simbol` però ple i amb mida i posició pròpies: serveix de forma de la resposta quan no és un número. */
const TRIANGLE_FOC = "M0,-0.42 L0.4,0.3 L-0.4,0.3 Z";

/** La forma de la resposta (número o símbol), per retallar-hi la trama (clipPath) o emmascarar-ne la vora (mask). */
function FormaObjectiu({ p, negreta, ...resta }: { p: PecaSoroll; negreta: boolean } & Record<string, unknown>) {
  if (p.simbol === "foc") {
    // Un pèl avall perquè el triangle (que va de -0,42 a 0,3) quedi centrat visualment.
    return (
      <path
        d={TRIANGLE_FOC}
        transform={`translate(${p.x.toFixed(1)} ${(p.y + p.mida * 0.06).toFixed(1)}) rotate(${p.rotacio.toFixed(1)}) scale(${p.mida.toFixed(1)})`}
        {...resta}
        strokeWidth={typeof resta.strokeWidth === "number" ? resta.strokeWidth / p.mida : undefined}
      />
    );
  }
  return (
    <text
      x={p.x}
      y={p.y}
      fontSize={p.mida}
      fontWeight={negreta ? 700 : 400}
      textAnchor="middle"
      dominantBaseline="central"
      transform={`rotate(${p.rotacio.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
      style={{ fontFamily: `${roboto.style.fontFamily}, sans-serif` }}
      {...resta}
    >
      {p.xifra}
    </text>
  );
}

/** Vèrtexs d'un triangle equilàter de radi `r` (circumscrit) centrat a (x, y) i girat `angle` graus. */
function puntsTriangle(x: number, y: number, r: number, angle: number) {
  return [0, 120, 240]
    .map((a) => {
      const rad = ((a + angle - 90) * Math.PI) / 180;
      return `${(x + r * Math.cos(rad)).toFixed(1)},${(y + r * Math.sin(rad)).toFixed(1)}`;
    })
    .join(" ");
}

/**
 * La composició de números i símbols del cartell de Foc (lib/sorollFoc.ts).
 * Un 30% del soroll (`sotaObjectiu`) es dibuixa abans que la resposta, per
 * quedar-hi per sota en lloc de per sobre.
 */
export function SorollFocSvg({
  soroll,
  className,
  objectiuDamunt = false,
  negreta = false,
  nomesInterseccio = false,
}: {
  soroll: Soroll;
  className?: string;
  /** Dibuixa el número per sobre de tot el soroll, en lloc de quedar-hi tapat. */
  objectiuDamunt?: boolean;
  /** El número de la resposta en negreta (la trama de punts el segueix). */
  negreta?: boolean;
  /** El número només es pinta on s'encreua amb les peces del soroll (la trama es retalla amb la forma del soroll). */
  nomesInterseccio?: boolean;
}) {
  const idBase = useId().replace(/:/g, "");
  const clipObjectiu = `${idBase}-clip-objectiu`;
  const maskSoroll = `${idBase}-mask-soroll`;
  const maskVora = `${idBase}-mask-vora`;
  const objectiu = soroll.peces.find((p) => p.objectiu);
  const sotaObjectiu = soroll.peces.filter((p) => !p.objectiu && p.sotaObjectiu);
  const sobreObjectiu = soroll.peces.filter((p) => !p.objectiu && !p.sotaObjectiu);

  const trama =
    objectiu && soroll.puntsObjectiu.length > 0 ? (
      <g clipPath={`url(#${clipObjectiu})`}>
        {soroll.puntsObjectiu.map((p, i) => (
          p.angle === undefined ? (
            <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r.toFixed(2)} fill={p.color} />
          ) : (
            <polygon key={i} points={puntsTriangle(p.x, p.y, p.r, p.angle)} fill={p.color} />
          )
        ))}
      </g>
    ) : null;

  const puntFons = (p: (typeof soroll.puntsObjectiu)[number], i: number, color: string) => (
    <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r.toFixed(2)} fill={color} />
  );
  const tramaFons =
    soroll.puntsFons && objectiu ? (
      <>
        {soroll.puntsFons.map((p, i) => puntFons(p, i, p.color))}
        <g mask={`url(#${maskVora})`}>{soroll.puntsFons.map((p, i) => p.barreja && puntFons(p, i, objectiu.color))}</g>
      </>
    ) : null;

  const tramaFinal = nomesInterseccio && trama ? <g mask={`url(#${maskSoroll})`}>{trama}</g> : trama;

  return (
    <svg
      viewBox={`0 0 ${soroll.amplada} ${soroll.alcada}`}
      className={className}
      role="img"
      aria-label="Composició de números i símbols de colors"
    >
      {objectiu && nomesInterseccio && (
        <defs>
          <mask id={maskSoroll} maskUnits="userSpaceOnUse" x={0} y={0} width={soroll.amplada} height={soroll.alcada}>
            {soroll.peces
              .filter((p) => !p.objectiu)
              .map((p, i) => (
                <PecaNoise key={i} p={p} color="#fff" />
              ))}
          </mask>
        </defs>
      )}
      {objectiu && soroll.puntsFons && (
        <defs>
          <mask id={maskVora} maskUnits="userSpaceOnUse" x={0} y={0} width={soroll.amplada} height={soroll.alcada}>
            <FormaObjectiu p={objectiu} negreta={negreta} fill="#fff" stroke="#fff" strokeWidth={AMPLADA_VORA_CAMUFLATGE} strokeLinejoin="round" />
          </mask>
        </defs>
      )}
      {objectiu && (
        <defs>
          <clipPath id={clipObjectiu}>
            <FormaObjectiu p={objectiu} negreta={negreta} />
          </clipPath>
        </defs>
      )}
      {tramaFons}
      {sotaObjectiu.map((p, i) => (
        <PecaNoise key={`sota-${i}`} p={p} />
      ))}
      {!objectiuDamunt && tramaFinal}
      {sobreObjectiu.map((p, i) => (
        <PecaNoise key={`sobre-${i}`} p={p} />
      ))}
      {objectiuDamunt && tramaFinal}
    </svg>
  );
}
