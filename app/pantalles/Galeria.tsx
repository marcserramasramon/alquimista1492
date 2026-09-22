"use client";

import { useState, useSyncExternalStore } from "react";
import { GRUPS, PANTALLES, type GrupPantalla, type Pantalla } from "./pantalles";

const MOBIL_W = 390;
const MOBIL_H = 844;
const VORA = 10; // gruix del marc fosc
const GUTTER = 16;

const MIDES = [
  { valor: 1, nom: "100%" },
  { valor: 0.75, nom: "75%" },
  { valor: 0.5, nom: "50%" },
] as const;

// --- Pestanya activa, recordada al hash (#fites) ---------------------------

function subscriureHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function llegirGrup(hash: string): GrupPantalla {
  const id = hash.replace(/^#/, "");
  return GRUPS.find((g) => g.id === id)?.id ?? GRUPS[0].id;
}

// --- Amplada de finestra, per escalar els marcs en pantalla estreta --------

function subscriureMida(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function Galeria() {
  const hash = useSyncExternalStore(
    subscriureHash,
    () => window.location.hash,
    () => "",
  );
  const ampladaFinestra = useSyncExternalStore(
    subscriureMida,
    () => window.innerWidth,
    () => MOBIL_W + 2 * VORA + 2 * GUTTER,
  );
  const [mida, setMida] = useState<number>(1);

  const grupActiu = llegirGrup(hash);
  const pantalles = PANTALLES.filter((p) => p.grup === grupActiu);

  // Si el marc no hi cap, s'escala per encaixar a l'amplada disponible.
  const ampladaMarc = MOBIL_W + 2 * VORA;
  const escala = Math.min(mida, (ampladaFinestra - 2 * GUTTER) / ampladaMarc);

  return (
    <div className="min-h-dvh bg-parchment text-ink">
      <header className="sticky top-0 z-10 border-b-2 border-leather/30 bg-vellum/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <h1 className="font-serif text-lg font-bold">Pantalles</h1>
          <label className="flex items-center gap-2 text-sm text-leather">
            Mida
            <select
              value={mida}
              onChange={(e) => setMida(Number(e.target.value))}
              className="min-h-10 rounded-lg border-2 border-leather/40 bg-parchment px-2 text-ink"
            >
              {MIDES.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.nom}
                </option>
              ))}
            </select>
          </label>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pt-2" role="tablist">
          {GRUPS.map((g) => {
            const actiu = g.id === grupActiu;
            const recompte = PANTALLES.filter((p) => p.grup === g.id).length;
            return (
              <a
                key={g.id}
                href={`#${g.id}`}
                role="tab"
                aria-selected={actiu}
                className={`flex min-h-12 shrink-0 items-center gap-2 rounded-t-lg border-b-4 px-4 font-semibold ${
                  actiu ? "border-prussian text-prussian" : "border-transparent text-leather"
                }`}
              >
                {g.nom}
                <span
                  className={`rounded-full px-2 text-xs ${actiu ? "bg-prussian text-parchment" : "bg-leather/20 text-leather"}`}
                >
                  {recompte}
                </span>
              </a>
            );
          })}
        </nav>
      </header>

      <main className="flex flex-wrap justify-center gap-8 px-4 py-6">
        {pantalles.map((p) => (
          <MarcMobil key={p.id} pantalla={p} escala={escala} />
        ))}
      </main>
    </div>
  );
}

function MarcMobil({ pantalla, escala }: { pantalla: Pantalla; escala: number }) {
  const ampladaMarc = MOBIL_W + 2 * VORA;
  const alcadaMarc = MOBIL_H + 2 * VORA;
  const src = `/pantalles/vista/${pantalla.id}`;

  return (
    <figure className="flex flex-col items-center gap-2" style={{ width: ampladaMarc * escala }}>
      <div style={{ width: ampladaMarc * escala, height: alcadaMarc * escala }}>
        <div
          className="origin-top-left overflow-hidden rounded-[44px] bg-ink shadow-xl"
          style={{ width: ampladaMarc, height: alcadaMarc, padding: VORA, transform: `scale(${escala})` }}
        >
          <iframe
            src={src}
            title={pantalla.titol}
            loading="lazy"
            width={MOBIL_W}
            height={MOBIL_H}
            className="block rounded-[34px] bg-parchment"
          />
        </div>
      </div>
      <figcaption className="text-center">
        <a href={src} target="_blank" rel="noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
          {pantalla.titol}
        </a>
        {pantalla.descripcio && <p className="text-sm text-leather">{pantalla.descripcio}</p>}
        <p className="font-mono text-xs text-leather/70">{pantalla.id}</p>
      </figcaption>
    </figure>
  );
}
