"use client";

import { Pentagrama } from "@/components/ui/Pentagrama";
import { Marca, Pantalla } from "@/components/ui/Pantalla";
import { BENVINGUDA } from "@/content/public/textos";

export type ModeInstallacio = "boto" | "ios" | "installada" | "no-disponible";

export interface VistaBenvingudaProps {
  modeInstallacio: ModeInstallacio;
  installant?: boolean;
  onInstallar: () => void;
  onContinuar: () => void;
}

/** Pantalla de benvinguda: convida a instal·lar l'app i a continuar cap a la tria de l'equip. */
export function VistaBenvinguda({
  modeInstallacio,
  installant = false,
  onInstallar,
  onContinuar,
}: VistaBenvingudaProps) {
  const teBotoInstallar = modeInstallacio === "boto";

  return (
    <Pantalla>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Pentagrama girar vius className="w-64 max-w-full animate-entrar" />
        <div className="animate-entrar [animation-delay:120ms]">
          <Marca />
        </div>
        <p className="animate-entrar text-center text-xl text-ink-soft [animation-delay:200ms]">
          {BENVINGUDA.frase}
        </p>
      </div>

      <div className="relative flex animate-entrar flex-col gap-4 pt-6 [animation-delay:280ms]">
        {teBotoInstallar && (
          <>
            <button type="button" onClick={onInstallar} disabled={installant} className="btn btn-primari">
              {installant ? "Descarregant..." : "⬇ Descarregar l'app"}
            </button>
            <p className="-mt-1 text-center text-base text-ink-soft">{BENVINGUDA.installar}</p>
          </>
        )}

        {modeInstallacio === "ios" && (
          <div className="targeta px-4 py-4 text-center">
            {/* TEXT PROVISIONAL */}
            <p className="etiqueta mb-1">descarregueu l&apos;app</p>
            <p className="text-lg">
              Toqueu <span className="font-extrabold">Compartir</span>{" "}
              <span aria-hidden className="inline-block rounded-md border-2 border-ink px-1 text-base leading-tight">
                ⬆
              </span>{" "}
              i després <span className="font-extrabold">&lsquo;Afegeix a la pantalla d&apos;inici&rsquo;</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onContinuar}
          className={teBotoInstallar ? "btn btn-secundari" : "btn btn-primari"}
        >
          Continuar →
        </button>

        <a href="/master" className="absolute bottom-6 left-6 text-ink-disabled hover:text-ink-soft transition-colors text-2xl">
          𖤐
        </a>
      </div>
    </Pantalla>
  );
}
