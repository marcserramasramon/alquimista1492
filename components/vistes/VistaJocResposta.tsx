"use client";

export interface VistaJocRespostaProps {
  resposta: string;
  missatge: string | null;
  correcte: boolean;
  enviant: boolean;
  pista: string | null;
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
  pista,
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

      <div className="pt-2 text-center">
        {pista && <p className="mb-2 rounded-lg bg-gold/20 p-3 text-sm italic text-ink">💡 {pista}</p>}
        <button
          type="button"
          onClick={onDemanarPista}
          disabled={carregantPista}
          className="text-sm font-semibold text-leather underline underline-offset-4"
        >
          {carregantPista ? "Carregant pista..." : "Necessito una pista"}
        </button>
      </div>
    </form>
  );
}
