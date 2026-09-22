"use client";

export interface VistaMasterLoginProps {
  pin: string;
  error: string | null;
  enviant: boolean;
  onPinChange: (valor: string) => void;
  onSubmit: () => void;
}

export function VistaMasterLogin({ pin, error, enviant, onPinChange, onSubmit }: VistaMasterLoginProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-8">
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-ink">Màster</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => onPinChange(e.target.value)}
          placeholder="PIN"
          className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-4 text-center text-2xl tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-prussian"
        />
        <button
          type="submit"
          disabled={enviant}
          className="w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment disabled:opacity-50"
        >
          Entrar
        </button>
        {error && <p className="text-center font-semibold text-cochineal">{error}</p>}
      </form>
    </main>
  );
}
