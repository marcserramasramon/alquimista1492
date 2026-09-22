"use client";

export type ModeInstallacio = "boto" | "ios" | "installada" | "no-disponible";

export interface VistaBenvingudaProps {
  modeInstallacio: ModeInstallacio;
  installant?: boolean;
  onInstallar: () => void;
  onContinuar: () => void;
}

/** Pantalla de benvinguda: convida a instal·lar l'app i a continuar cap a l'entrada del codi. */
export function VistaBenvinguda({
  modeInstallacio,
  installant = false,
  onInstallar,
  onContinuar,
}: VistaBenvingudaProps) {
  const teBotoInstallar = modeInstallacio === "boto";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-8">
      <h1 className="mb-3 text-center font-serif text-3xl font-bold text-ink">
        Els Guardians del Secret de Sentfores
      </h1>
      {/* TEXT PROVISIONAL */}
      <p className="mb-10 text-center text-lg text-leather">
        Benvinguts! Prepareu-vos per començar l&apos;aventura.
      </p>

      <div className="flex flex-col gap-4">
        {teBotoInstallar && (
          <>
            <button
              type="button"
              onClick={onInstallar}
              disabled={installant}
              className="min-h-12 w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
            >
              {installant ? "Descarregant..." : "Descarregar l'app"}
            </button>
            {/* TEXT PROVISIONAL */}
            <p className="text-center text-sm text-leather">
              Així la tindreu a mà durant tota la partida.
            </p>
          </>
        )}

        {modeInstallacio === "ios" && (
          <div className="rounded-xl border-2 border-leather bg-vellum px-4 py-4 text-center text-ink">
            {/* TEXT PROVISIONAL */}
            <p className="mb-1 font-bold">Descarregueu l&apos;app</p>
            <p>
              Toca <span className="font-bold">Compartir</span> i després{" "}
              <span className="font-bold">&lsquo;Afegeix a la pantalla d&apos;inici&rsquo;</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onContinuar}
          className={
            teBotoInstallar
              ? "min-h-12 w-full rounded-xl border-2 border-prussian bg-transparent px-4 py-4 text-lg font-bold text-prussian"
              : "min-h-12 w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment shadow-md"
          }
        >
          Continuar
        </button>
      </div>
    </main>
  );
}
