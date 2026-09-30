import { Narracio } from "@/components/ui/Narracio";
import { Marca, Pantalla } from "@/components/ui/Pantalla";
import { Pentagrama } from "@/components/ui/Pentagrama";
import { SegellCera } from "@/components/ui/SegellCera";
import { MISSATGE_SECRET } from "@/content/public/textos";

export const IMATGE_MISSATGE: string | null = "/missatge-secret.jpg";

export interface VistaMissatgeProps {
  onContinuar: () => void;
  /** Rètol del botó: "Comencem" la primera vegada, "Tornar al mapa" si s'hi torna des del hub. */
  textContinuar?: string;
  /** Si hi és, surt a la cantonada del text (on abans hi havia la veu) un botó per tornar a veure el vídeo. */
  onRepetirVideo?: () => void;
}

/** 1. El missatge secret de Fra Francesc: es llegeix abans d'entrar al hub. Signat i segellat amb cera. */
export function VistaMissatge({ onContinuar, textContinuar = "Comencem →", onRepetirVideo }: VistaMissatgeProps) {
  return (
    <Pantalla className="gap-6">
      <div className="animate-entrar">
        <Marca petita />
      </div>
      <div className="mx-auto w-full animate-entrar [animation-delay:60ms]">
        {IMATGE_MISSATGE ? (
          <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink shadow-[0_6px_0_var(--ink)]">
            <img src={IMATGE_MISSATGE} alt="" className="h-40 w-full object-cover" />
            {/* Vinyeta per fondre els cantons amb el pergamí */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 26px 10px rgb(27 21 17 / 0.35)" }}
            />
          </div>
        ) : (
          <Pentagrama vius className="mx-auto w-44" />
        )}
      </div>
      <Narracio
        text={MISSATGE_SECRET}
        etiqueta="missatge secret"
        className="animate-entrar [animation-delay:120ms]"
        accio={
          onRepetirVideo && (
            <button
              type="button"
              onClick={onRepetirVideo}
              aria-label="Tornar a veure el vídeo"
              className="btn btn-secundari btn-rodo shrink-0 shadow-[0_3px_0_var(--ink)]"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
              </svg>
            </button>
          )
        }
      >
        <div className="mt-6 flex items-end justify-between gap-3">
          <SegellCera className="w-24 shrink-0 -rotate-12 animate-segellar [animation-delay:700ms]" />
          <div className="min-w-0 text-right">
            <p className="font-display text-4xl font-extrabold italic leading-none">{MISSATGE_SECRET.signatura}</p>
            {/* Rúbrica de ploma sota la signatura */}
            <svg viewBox="0 0 200 34" className="ml-auto mt-1 w-40 text-ink" aria-hidden>
              <path
                d="M6 22 C 38 4, 64 32, 100 18 S 150 2, 176 14 Q 190 21, 170 27 Q 150 31, 196 24"
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                className="animate-tracar [animation-delay:450ms]"
              />
            </svg>
          </div>
        </div>
      </Narracio>
      <button type="button" onClick={onContinuar} className="btn btn-primari animate-entrar [animation-delay:240ms]">
        {textContinuar}
      </button>
    </Pantalla>
  );
}
