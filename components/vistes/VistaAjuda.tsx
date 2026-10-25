"use client";

import { useState } from "react";

interface PreguntaFreqüent {
  id: string;
  pregunta: string;
  resposta: string;
}

const PREGUNTES: PreguntaFreqüent[] = [
  {
    id: "no-trobem-fita",
    pregunta: "Què fem si no trobem la fita?",
    resposta:
      "Repasseu el mapa: la fita s'obre sola en arribar-hi (GPS). Si ja hi sou i no s'obre, escanegeu el QR del cartell. Si continueu perduts, escriviu-ho al màster amb el botó de sota.",
  },
  {
    id: "acaba-temps",
    pregunta: "Què fem si s'acaba el temps?",
    resposta:
      "Quan el compte enrere arribi a zero, la partida s'acaba sola i us portem al Pla de Masset. No cal fer res: seguiu jugant fins llavors.",
  },
  {
    id: "algu-fet-mal",
    pregunta: "Què fem si algú s'ha fet mal?",
    resposta:
      "Atureu el joc i escriviu-ho al màster de seguida amb el botó de sota. Si és greu, truqueu al 112.",
  },
];

export interface VistaAjudaProps {
  /** Nom de l'equip d'aquest mòbil, perquè sàpiga de qui parla si escriu al màster. */
  nomEquip?: string;
  /** Torna a obrir el manual d'ús. */
  onManual: () => void;
  onEscriureMissatge: () => void;
  onTancar: () => void;
  /** Fa sortir aquest mòbil del grup. Retorna el missatge d'error, o null si ha anat bé. */
  onSortirGrup?: () => Promise<string | null>;
}

/**
 * Pop-up del botó "?" del mapa: primer les preguntes freqüents (es responen soles, sense
 * amoïnar el màster); si cap no encaixa, el botó de sota porta al formulari real (VistaEnviarAvis).
 */
export function VistaAjuda({ nomEquip, onManual, onEscriureMissatge, onTancar, onSortirGrup }: VistaAjudaProps) {
  const [obertaId, setObertaId] = useState<string | null>(null);
  const [confirmantSortir, setConfirmantSortir] = useState(false);
  const [enviantSortir, setEnviantSortir] = useState(false);
  const [errorSortir, setErrorSortir] = useState<string | null>(null);

  async function sortir() {
    if (!onSortirGrup) return;
    setEnviantSortir(true);
    setErrorSortir(null);
    const error = await onSortirGrup();
    if (error) {
      setErrorSortir(error);
      setEnviantSortir(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ajuda-titol"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="targeta flex max-h-full w-full max-w-md animate-segellar flex-col gap-4 overflow-y-auto bg-[#fffdf7] p-6">
        <div className="flex items-center justify-between gap-3">
          <p id="ajuda-titol" className="etiqueta text-gold-deep">
            ✦ ajuda ✦
          </p>
          <button type="button" onClick={onTancar} aria-label="Tancar" className="btn btn-secundari btn-rodo text-xl">
            ✕
          </button>
        </div>

        {nomEquip && (
          <p className="text-center text-lg font-extrabold leading-snug">
            <span className="etiqueta text-gold-deep">El vostre equip</span>
            <br />
            {nomEquip}
          </p>
        )}

        <button type="button" onClick={onManual} className="btn btn-secundari">
          📖 Manual d&apos;ús
        </button>

        <div className="flex flex-col gap-2.5">
          {PREGUNTES.map((p) => {
            const oberta = obertaId === p.id;
            return (
              <div key={p.id} className="rounded-2xl border-[3px] border-ink bg-paper-2/60">
                <button
                  type="button"
                  onClick={() => setObertaId(oberta ? null : p.id)}
                  aria-expanded={oberta}
                  className="flex w-full min-h-[3.5rem] items-center justify-between gap-3 px-4 py-2.5 text-left text-lg font-extrabold leading-snug"
                >
                  {p.pregunta}
                  <span aria-hidden className="shrink-0 text-xl">
                    {oberta ? "−" : "+"}
                  </span>
                </button>
                {oberta && <p className="px-4 pb-3 text-base leading-snug text-ink-soft">{p.resposta}</p>}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={onEscriureMissatge} className="btn btn-primari">
          ✉️ Escriure un missatge al màster
        </button>

        {onSortirGrup && (
          <div className="flex flex-col items-center gap-2 border-t-2 border-ink/20 pt-3">
            {confirmantSortir ? (
              <>
                <p className="text-center text-base font-extrabold">Estàs segur que vols sortir del grup?</p>
                {errorSortir && <p className="text-center text-sm text-blood">{errorSortir}</p>}
                <div className="flex w-full gap-2">
                  <button type="button" onClick={() => setConfirmantSortir(false)} className="btn btn-secundari flex-1">
                    No
                  </button>
                  <button type="button" onClick={sortir} disabled={enviantSortir} className="btn btn-perill flex-1">
                    {enviantSortir ? "Sortint..." : "Sí, surt"}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmantSortir(true)}
                className="min-h-11 px-3 text-sm text-ink-soft underline"
              >
                sortir del grup
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
