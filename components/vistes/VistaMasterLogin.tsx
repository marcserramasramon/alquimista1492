"use client";

import { AvisError, Marca, Pantalla } from "@/components/ui/Pantalla";

export interface VistaMasterLoginProps {
  pin: string;
  error: string | null;
  enviant: boolean;
  onPinChange: (valor: string) => void;
  onSubmit: () => void;
}

export function VistaMasterLogin({ pin, error, enviant, onPinChange, onSubmit }: VistaMasterLoginProps) {
  return (
    <Pantalla centrat>
      <div className="mb-8">
        <Marca petita />
      </div>
      <div className="targeta animate-entrar bg-ink p-6 text-paper shadow-[0_6px_0_var(--gold-deep)]">
        <p className="etiqueta text-gold">accés restringit</p>
        <h1 className="mb-5 text-5xl font-extrabold">Màster</h1>
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
            aria-label="PIN"
            className={`camp text-center text-3xl tracking-[0.5em] ${error ? "animate-tremolar border-blood" : ""}`}
          />
          {error && <AvisError>{error}</AvisError>}
          <button type="submit" disabled={enviant} className="btn btn-primari">
            {enviant ? "Entrant..." : "Entrar"}
          </button>
        </form>
      </div>
    </Pantalla>
  );
}
