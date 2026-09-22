"use client";

import { useEffect, useRef, useState } from "react";
import type { TextNarratiu } from "@/content/public/textos";

/**
 * Botó per escoltar la veu gravada d'un text. Els mòbils no deixen reproduir
 * àudio sense un toc previ, així que sempre és l'usuari qui l'engega.
 * Si el fitxer no existeix (encara no s'ha generat), el botó desapareix.
 */
export function BotoEscoltar({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [sonant, setSonant] = useState(false);
  const [noDisponible, setNoDisponible] = useState(false);

  // Si el fitxer falla abans de la hidratació, onError ja no es dispara: es comprova en muntar.
  useEffect(() => {
    if (audio.current?.error) setNoDisponible(true);
  }, []);

  if (noDisponible) return null;

  function alternar() {
    const el = audio.current;
    if (!el) return;
    if (sonant) {
      el.pause();
      el.currentTime = 0;
      setSonant(false);
    } else {
      el.play().then(
        () => setSonant(true),
        () => setNoDisponible(true),
      );
    }
  }

  return (
    <>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onEnded={() => setSonant(false)}
        onError={() => setNoDisponible(true)}
      />
      <button type="button" onClick={alternar} className="btn btn-secundari" aria-pressed={sonant}>
        {sonant ? "■ Aturar" : "▶ Escoltar"}
      </button>
    </>
  );
}

/** Text de la història (missatge, fragment...) amb el botó d'escoltar si té àudio. */
export function Narracio({
  text,
  etiqueta,
  color,
  children,
  className = "",
}: {
  text: TextNarratiu;
  etiqueta?: string;
  color?: string;
  /** Contingut extra al final (signatura, lema...). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`targeta p-5 ${className}`} style={color ? { borderLeft: `10px solid ${color}` } : undefined}>
      {etiqueta && (
        <p className="etiqueta mb-1" style={color ? { color } : undefined}>
          {etiqueta}
        </p>
      )}
      {text.titol && <h2 className="mb-3 text-3xl font-extrabold">{text.titol}</h2>}
      <div className="flex flex-col gap-3 text-xl leading-snug">
        {text.paragrafs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {children}
      {text.audio && (
        <div className="mt-5">
          <BotoEscoltar src={text.audio} />
        </div>
      )}
    </section>
  );
}
