"use client";

export interface VistaNomEquipProps {
  nom: string;
  error: string | null;
  enviant: boolean;
  onNomChange: (nom: string) => void;
  onSubmit: () => void;
}

/** Pantalla on l'equip tria el seu nom (primera entrada). */
export function VistaNomEquip({ nom, error, enviant, onNomChange, onSubmit }: VistaNomEquipProps) {
  const nomValid = nom.trim().length >= 2 && nom.trim().length <= 30;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-8">
      {/* TEXT PROVISIONAL */}
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-ink">
        Com es diu el vostre equip?
      </h1>
      {/* TEXT PROVISIONAL */}
      <p className="mb-8 text-center text-leather">Escolliu un nom per a la partida.</p>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <input
          type="text"
          value={nom}
          onChange={(e) => onNomChange(e.target.value.slice(0, 30))}
          placeholder="Nom de l'equip"
          autoComplete="off"
          maxLength={30}
          className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-4 text-center text-2xl font-bold text-ink placeholder:text-leather/50 focus:outline-none focus:ring-2 focus:ring-prussian"
        />
        <button
          type="submit"
          disabled={!nomValid || enviant}
          className="min-h-12 w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
        >
          {enviant ? "Desant..." : "Som-hi"}
        </button>
        {error && <p className="text-center font-semibold text-cochineal">{error}</p>}
      </form>
    </main>
  );
}
