"use client";

/** Tres nivells: cada botó només s'activa si ja s'ha demanat l'anterior. */
export const NOMS_PISTES = ["Pista 1", "Pista 2", "Resposta"] as const;

export interface VistaJocRespostaProps {
  resposta: string;
  missatge: string | null;
  correcte: boolean;
  enviant: boolean;
  /** Pistes ja desbloquejades, en ordre (la tercera és la resposta). */
  pistes: string[];
  carregantPista: boolean;
  onRespostaChange: (valor: string) => void;
  onSubmit: () => void;
  onDemanarPista: () => void;
}

/** Joc d'estació de resposta escrita (presentacional). */
export function VistaJocResposta({
  resposta,
  missatge,
  correcte,
  enviant,
  pistes,
  carregantPista,
  onRespostaChange,
  onSubmit,
  onDemanarPista,
}: VistaJocRespostaProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <input
        type="text"
        value={resposta}
        onChange={(e) => onRespostaChange(e.target.value)}
        placeholder="Escriviu la resposta..."
        autoComplete="off"
        autoCapitalize="characters"
        className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-3 text-lg text-ink placeholder:text-leather/60 focus:outline-none focus:ring-2 focus:ring-prussian"
      />

      <button
        type="submit"
        disabled={enviant || !resposta.trim()}
        className="w-full rounded-xl bg-prussian px-4 py-3 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
      >
        {enviant ? "Comprovant..." : "Comprovar"}
      </button>

      {missatge && (
        <p
          className={`text-center text-lg font-bold ${correcte ? "text-green-700" : "text-cochineal"}`}
          role="status"
        >
          {correcte ? "✅ " : "❌ "}
          {missatge}
        </p>
      )}

      <div className="pt-2">
        <p className="mb-2 text-center font-semibold text-leather">Necessites una pista?</p>
        <div className="grid grid-cols-3 gap-2">
          {NOMS_PISTES.map((nom, index) => {
            const demanada = index < pistes.length;
            const seguent = index === pistes.length;
            return (
              <button
                key={nom}
                type="button"
                onClick={onDemanarPista}
                disabled={!seguent || carregantPista}
                aria-pressed={demanada}
                className={`min-h-12 rounded-xl border-2 px-2 py-2 text-sm font-bold ${
                  demanada
                    ? "border-gold bg-gold/20 text-ink"
                    : "border-leather bg-transparent text-leather disabled:opacity-40"
                }`}
              >
                {seguent && carregantPista ? "..." : nom}
              </button>
            );
          })}
        </div>
        {pistes.length > 0 && (
          <ol className="mt-3 flex flex-col gap-2">
            {pistes.map((text, index) => (
              <li key={index} className="rounded-lg bg-gold/20 p-3 text-sm text-ink">
                <span className="font-bold">{NOMS_PISTES[index] ?? `Pista ${index + 1}`}:</span>{" "}
                <span className="italic">{text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </form>
  );
}
