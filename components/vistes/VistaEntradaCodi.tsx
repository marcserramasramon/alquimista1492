"use client";

export interface VistaEntradaCodiProps {
  codi: string;
  error: string | null;
  enviant: boolean;
  onCodiChange: (codi: string) => void;
  onSubmit: () => void;
}

/** Pantalla d'entrada del codi d'equip (6 caràcters). */
export function VistaEntradaCodi({ codi, error, enviant, onCodiChange, onSubmit }: VistaEntradaCodiProps) {
  function enviar(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-8">
      <h1 className="mb-1 text-center font-serif text-3xl font-bold text-ink">
        Els Guardians del Secret de Sentfores
      </h1>
      <p className="mb-8 text-center text-leather">Introduïu el codi del vostre equip</p>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <input
          type="text"
          value={codi}
          onChange={(e) => onCodiChange(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="CODI"
          autoComplete="off"
          autoCapitalize="characters"
          className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] text-ink placeholder:text-leather/50 focus:outline-none focus:ring-2 focus:ring-prussian"
        />
        <button
          type="submit"
          disabled={codi.trim().length !== 6 || enviant}
          className="w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
        >
          {enviant ? "Entrant..." : "Entrar a la partida"}
        </button>
        {error && <p className="text-center font-semibold text-cochineal">{error}</p>}
      </form>
    </main>
  );
}
