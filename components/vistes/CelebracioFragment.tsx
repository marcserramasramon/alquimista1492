"use client";

import { useEffect, type CSSProperties } from "react";
import { RESPOSTA_CORRECTA } from "@/content/public/textos";
import { sonarFragment } from "@/lib/so";

export interface CelebracioFragmentProps {
  nomElement?: string;
  frase?: string;
  icona?: string;
  color: string;
  missatge: string | null;
}

/** Espurnes que surten del segell. Deterministes: el servidor i el client pinten el mateix. */
const ESPURNES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i * 20 + (i % 2) * 9) * (Math.PI / 180);
  const distancia = 120 + (i % 3) * 38;
  return {
    dx: Math.round(Math.cos(angle) * distancia),
    dy: Math.round(Math.sin(angle) * distancia),
    mida: 7 + (i % 4) * 3,
    estel: i % 3 === 0,
    retard: 280 + (i % 5) * 45,
    tipus: i % 3, // 0 = color de l'element, 1 = or, 2 = blanc
  };
});

/** Llumetes que pugen poc a poc mentre dura la pantalla. */
const LLUMETES = [-120, -80, -40, 0, 40, 80, 120, -100, 100].map((x, i) => ({
  x,
  retard: 500 + i * 190,
  mida: 5 + (i % 3) * 2,
}));

/**
 * Pantalla d'encert ("obrint el fragment"): el segell de l'element cau, esclata
 * de llum, el símbol passa de silueta a color i en surten espurnes. Sona una
 * campanada màgica (lib/so.ts). Després es mostra el fragment.
 */
export function CelebracioFragment({ nomElement, frase, icona, color, missatge }: CelebracioFragmentProps) {
  useEffect(() => {
    sonarFragment();
  }, []);

  const colors = [color, "var(--gold)", "#ffffff"];

  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex animate-entrar flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center"
      style={{ background: `radial-gradient(circle at 50% 42%, #fffdf7 0%, #fbf4e4 35%, ${color} 140%)` }}
    >
      <div className="relative">
        {/* Raigs: dues corones que giren en sentits contraris */}
        <div
          aria-hidden
          className="absolute -inset-16 animate-girar rounded-full opacity-50 [animation-duration:12s]"
          style={{
            background: `repeating-conic-gradient(${color} 0deg 8deg, transparent 8deg 24deg)`,
            maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -inset-10 animate-girar rounded-full opacity-40 [animation-direction:reverse] [animation-duration:18s]"
          style={{
            background: "repeating-conic-gradient(var(--gold) 0deg 3deg, transparent 3deg 15deg)",
            maskImage: "radial-gradient(circle, black 35%, transparent 68%)",
          }}
        />

        {/* Esclat de llum i ones quan el segell toca terra */}
        <div aria-hidden className="absolute inset-0 animate-esclat rounded-full bg-white [animation-delay:320ms]" />
        {[340, 620].map((retard) => (
          <div
            key={retard}
            aria-hidden
            className="absolute inset-0 animate-ona rounded-full border-[5px]"
            style={{ borderColor: color, animationDelay: `${retard}ms` }}
          />
        ))}

        {/* Espurnes */}
        {ESPURNES.map((e, i) => (
          <span
            key={i}
            aria-hidden
            className={`pointer-events-none absolute left-1/2 top-1/2 animate-espurna leading-none ${
              e.estel ? "" : "rounded-full"
            }`}
            style={
              {
                "--dx": `${e.dx}px`,
                "--dy": `${e.dy}px`,
                animationDelay: `${e.retard}ms`,
                width: e.estel ? undefined : e.mida,
                height: e.estel ? undefined : e.mida,
                fontSize: e.estel ? e.mida * 2.4 : undefined,
                color: colors[e.tipus],
                background: e.estel ? undefined : colors[e.tipus],
                boxShadow: e.estel ? undefined : `0 0 ${e.mida}px ${colors[e.tipus]}`,
                textShadow: e.estel ? `0 0 8px ${colors[e.tipus]}` : undefined,
              } as CSSProperties
            }
          >
            {e.estel ? "✦" : null}
          </span>
        ))}

        {/* Llumetes que pugen */}
        {LLUMETES.map((l, i) => (
          <span
            key={`l${i}`}
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-1/2 animate-elevar rounded-full"
            style={{
              marginLeft: l.x,
              width: l.mida,
              height: l.mida,
              background: i % 2 ? "var(--gold)" : color,
              boxShadow: `0 0 10px ${i % 2 ? "var(--gold)" : color}`,
              animationDelay: `${l.retard}ms`,
            }}
          />
        ))}

        {/* El segell */}
        <div className="relative animate-segellar">
          <div
            className="flex h-44 w-44 animate-resplendir items-center justify-center rounded-full border-[4px] border-ink bg-[#fffdf7] shadow-[0_8px_0_var(--ink)] [animation-delay:900ms]"
            style={{ outline: `10px solid ${color}`, outlineOffset: -20, "--c": color } as CSSProperties}
          >
            {icona ? (
              <img src={icona} alt="" className="h-24 w-24 animate-revelar object-contain [animation-delay:250ms]" />
            ) : (
              <span className="animate-revelar text-7xl [animation-delay:250ms]">✦</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative animate-entrar [animation-delay:450ms]">
        <p className="font-display text-6xl font-extrabold leading-none">{missatge ?? RESPOSTA_CORRECTA}</p>
        {nomElement && (
          <p className="etiqueta mt-3 text-lg" style={{ color }}>
            ✦ {nomElement} ✦
          </p>
        )}
        {frase && <p className="mt-4 text-2xl font-bold">{frase}</p>}
      </div>
      <p className="etiqueta relative animate-pulse">obrint el fragment...</p>
    </div>
  );
}
