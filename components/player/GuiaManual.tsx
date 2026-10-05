"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type EscenaManual, type PasManual } from "@/content/public/textos";

export interface GuiaManualProps {
  /** Escenes que aquesta pantalla sap explicar, en ordre; cada una surt sola un cop. */
  escenes: EscenaManual[];
  /** Cada vegada que puja, es torna a veure l'escena que encaixa amb el que hi ha a pantalla. */
  reinici?: number;
  /** Sense recordar res (galeria de pantalles): les escenes surten sempre. */
  sempre?: boolean;
}

const CLAU = "manual-vist-";
const COMPROVAR_CADA_MS = 600;
const INICI_MS = 900;
const SORTIDA_MS = 350;
const MIDA_MAX = 320;
const MARGE = 12;
const CUA = 18;

/** Només és una comoditat: si el navegador no deixa guardar-ho, l'escena simplement torna a sortir. */
function llegirVista(id: string): boolean {
  try {
    return localStorage.getItem(CLAU + id) === "1";
  } catch {
    return false;
  }
}

function recordarVista(id: string) {
  try {
    localStorage.setItem(CLAU + id, "1");
  } catch {}
}

function buscar(objectiu: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-manual="${objectiu}"]`);
}

function trobar(objectiu: string): HTMLElement | null {
  const el = buscar(objectiu);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
}

function durada(text: string): number {
  return Math.min(6500, 3000 + text.length * 30);
}

const espera = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const clauPas = (escenaId: string, index: number) => `${escenaId}:${index}`;

interface PasActual {
  pas: PasManual;
  el: HTMLElement | null;
  sortint: boolean;
  clau: string;
}

/**
 * Manual d'ús sobre l'app real: bombolles que surten una darrere l'altra, amb la cua cap a la peça
 * (marcada amb `data-manual`) que expliquen, i s'esvaeixen soles al cap d'uns segons. Quan una
 * s'esvaeix, al seu lloc queda un botonet que la torna a ensenyar mentre dura aquesta visita (no es recorden). No tapa res ni bloqueja la pantalla.
 */
export function GuiaManual({ escenes, reinici = 0, sempre = false }: GuiaManualProps) {
  const [actual, setActual] = useState<PasActual | null>(null);
  /** Passos que ja s'han ensenyat: cadascun deixa el seu botonet. */
  const [fets, setFets] = useState<string[]>([]);
  /** Cada reproducció té el seu número; una de més nova fa que les antigues s'aturin soles. */
  const generacio = useRef(0);
  const executant = useRef(false);
  const saltar = useRef<(() => void) | null>(null);
  const vistesAra = useRef(new Set<string>());
  const reiniciAnterior = useRef(reinici);
  // Les escenes es comparen pels seus ids: una llista nova amb les mateixes no ha d'aturar res.
  const escenesRef = useRef(escenes);
  useEffect(() => {
    escenesRef.current = escenes;
  });
  const idsEscenes = escenes.map((e) => e.id).join();

  const afegirFet = useCallback((clau: string) => setFets((f) => (f.includes(clau) ? f : [...f, clau])), []);

  /** Ensenya una bombolla i espera que s'esvaeixi. Torna fals si una reproducció més nova l'ha aturada. */
  const mostrarPas = useCallback(async (pas: PasManual, clau: string, meva: number): Promise<boolean> => {
    const el = pas.objectiu ? trobar(pas.objectiu) : null;
    if (pas.objectiu && !el) return true;
    if (el && (await portarALaVista(el))) await espera(450);
    if (generacio.current !== meva) return false;
    setActual({ pas, el, sortint: false, clau });
    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, durada(pas.text));
      saltar.current = () => {
        clearTimeout(t);
        resolve();
      };
    });
    saltar.current = null;
    if (generacio.current !== meva) return false;
    setActual((a) => a && { ...a, sortint: true });
    await espera(SORTIDA_MS);
    return generacio.current === meva;
  }, []);

  const reproduir = useCallback(
    async (escena: EscenaManual, nomesPas?: number) => {
      const meva = ++generacio.current;
      saltar.current?.();
      executant.current = true;
      if (nomesPas === undefined) {
        vistesAra.current.add(escena.id);
        if (!sempre) recordarVista(escena.id);
      }
      try {
        for (const [i, pas] of escena.passos.entries()) {
          if (nomesPas !== undefined && i !== nomesPas) continue;
          const clau = clauPas(escena.id, i);
          if (!(await mostrarPas(pas, clau, meva))) return;
          afegirFet(clau);
        }
      } finally {
        if (generacio.current === meva) {
          executant.current = false;
          setActual(null);
        }
      }
    },
    [afegirFet, mostrarPas, sempre],
  );

  // Cada escena surt sola, una única vegada, quan la pantalla en mostra la primera peça.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const inici = setTimeout(() => {
      interval = setInterval(() => {
        if (executant.current) return;
        const pendent = escenesRef.current.find(
          (e) =>
            !vistesAra.current.has(e.id) &&
            (sempre || !llegirVista(e.id)) &&
            e.passos.some((p) => p.objectiu && trobar(p.objectiu)),
        );
        if (pendent) void reproduir(pendent);
      }, COMPROVAR_CADA_MS);
    }, INICI_MS);
    return () => {
      // És un comptador, no un node de React: ha de pujar en el moment de la neteja.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generacio.current++;
      clearTimeout(inici);
      clearInterval(interval);
      saltar.current?.();
    };
  }, [idsEscenes, reproduir, sempre]);

  // L'ordre de "tornar a veure tot" que arriba de fora (el botó "Com es juga" de l'ajuda): la
  // escena més específica que té la seva peça a pantalla (la fitxa d'una fita abans que el hub sencer).
  useEffect(() => {
    if (reinici === reiniciAnterior.current) return;
    reiniciAnterior.current = reinici;
    const escena = [...escenesRef.current].reverse().find((e) => e.passos.some((p) => p.objectiu && trobar(p.objectiu)));
    if (escena) void reproduir(escena);
  }, [reinici, reproduir]);

  return (
    <>
      {actual && (
        <BombollaSobreLaPantalla
          key={actual.clau}
          pas={actual.pas}
          el={actual.el}
          sortint={actual.sortint}
          onToc={() => saltar.current?.()}
        />
      )}
      {escenes.flatMap((escena) =>
        escena.passos.map((pas, i) => {
          const clau = clauPas(escena.id, i);
          if (!pas.objectiu || !fets.includes(clau)) return null;
          return (
            <Botonet key={clau} pas={pas} amagat={actual?.clau === clau} onToc={() => void reproduir(escena, i)} />
          );
        }),
      )}
    </>
  );
}

/** Si la peça no és sencera a la pantalla, hi fa scroll. Torna si ha hagut de moure's. */
async function portarALaVista(el: HTMLElement): Promise<boolean> {
  if (getComputedStyle(el).position === "fixed") return false;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (r.top >= 56 && r.bottom <= vh - 8) return false;
  el.scrollIntoView({ behavior: "smooth", block: r.height > vh * 0.75 ? "start" : "center" });
  return true;
}

const MIDA_BOTONET = 40;

/**
 * Botonet de paper que queda on havia sortit la bombolla (a la vora de la peça, on hi anava la cua).
 * Segueix la peça si la pantalla fa scroll i s'amaga si la peça no és a la vista.
 */
function Botonet({ pas, amagat, onToc }: { pas: PasManual; amagat: boolean; onToc: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let id = requestAnimationFrame(function fotograma() {
      const boto = ref.current;
      const el = pas.objectiu ? buscar(pas.objectiu) : null;
      if (boto && el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh;
        if (visible) {
          const fraccio = pas.cuaX ?? 0.5;
          const x = r.left + Math.max(20, Math.min(r.width - 20, fraccio * r.width));
          // A la vora de dalt de la peça (on hi anava la cua); si és enganxada a dalt de la pantalla, penja per sota seu.
          const y = Math.max(24, Math.min(vh - 24, r.top >= 28 ? r.top : r.bottom + MIDA_BOTONET / 2 - 4));
          // left/top (no transform): l'animació d'entrada ja fa servir transform.
          boto.style.left = `${x - MIDA_BOTONET / 2}px`;
          boto.style.top = `${y - MIDA_BOTONET / 2}px`;
          boto.style.display = "";
        } else {
          boto.style.display = "none";
        }
      } else if (boto) {
        boto.style.display = "none";
      }
      id = requestAnimationFrame(fotograma);
    });
    return () => cancelAnimationFrame(id);
  }, [pas.objectiu, pas.cuaX]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onToc}
      aria-label={`Tornar a veure: ${pas.titol ?? pas.text}`}
      className={`fixed z-[90] flex items-center justify-center rounded-full border-[3px] border-ink bg-[#fffdf7] text-xl leading-none shadow-[0_3px_0_var(--ink)] transition-opacity duration-300 after:absolute after:-inset-2 after:content-[''] ${
        amagat ? "pointer-events-none opacity-0" : "animate-bombolla"
      }`}
      style={{ width: MIDA_BOTONET, height: MIDA_BOTONET, display: "none" }}
    >
      <span aria-hidden>{pas.emoji}</span>
    </button>
  );
}

function BombollaSobreLaPantalla({
  pas,
  el,
  sortint,
  onToc,
}: {
  pas: PasManual;
  el: HTMLElement | null;
  sortint: boolean;
  onToc: () => void;
}) {
  const posicio = useRef<HTMLDivElement>(null);
  const anell = useRef<HTMLDivElement>(null);
  const cuaRef = useRef<HTMLSpanElement>(null);
  const [cua, setCua] = useState<"avall" | "amunt" | null>(null);
  const cuaAra = useRef<"avall" | "amunt" | null>(null);

  // Segueix la peça a cada fotograma: la pantalla pot fer scroll o canviar de mida mentre es veu la bombolla.
  const situar = useCallback(() => {
    const caixa = posicio.current;
    if (!caixa) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(MIDA_MAX, vw - 2 * MARGE);
    caixa.style.width = `${w}px`;
    const h = caixa.offsetHeight;

    if (!el) {
      // Sense peça: nota solta, al peu de la pantalla.
      caixa.style.left = `${(vw - w) / 2}px`;
      caixa.style.top = `${vh - h - 96}px`;
      if (cuaAra.current !== null) {
        cuaAra.current = null;
        setCua(null);
      }
      return;
    }

    const r = el.getBoundingClientRect();
    let direccio: "avall" | "amunt" | null;
    let top: number;
    if (r.top - h - CUA - 4 >= MARGE) {
      direccio = "avall";
      top = r.top - h - CUA - 4;
    } else if (r.bottom + CUA + 4 + h <= vh - MARGE) {
      direccio = "amunt";
      top = r.bottom + CUA + 4;
    } else {
      direccio = null;
      top = Math.max(MARGE, Math.min(vh - h - MARGE, r.top + r.height / 2 - h / 2));
    }
    const centre = r.left + r.width / 2;
    const left = Math.max(MARGE, Math.min(vw - w - MARGE, centre - w / 2));
    caixa.style.left = `${left}px`;
    caixa.style.top = `${top}px`;
    if (cuaRef.current) {
      const cuaX = pas.cuaX !== undefined ? pas.cuaX * w : centre - left;
      cuaRef.current.style.left = `${Math.max(26, Math.min(w - 26, cuaX))}px`;
    }
    if (cuaAra.current !== direccio) {
      cuaAra.current = direccio;
      setCua(direccio);
    }

    const halo = anell.current;
    if (halo) {
      halo.style.left = `${r.left - 5}px`;
      halo.style.top = `${r.top - 5}px`;
      halo.style.width = `${r.width + 10}px`;
      halo.style.height = `${r.height + 10}px`;
    }
  }, [el, pas.cuaX]);

  useLayoutEffect(() => {
    situar();
  }, [situar]);

  useEffect(() => {
    let id = requestAnimationFrame(function fotograma() {
      if (el && !el.isConnected) {
        onToc();
        return;
      }
      situar();
      id = requestAnimationFrame(fotograma);
    });
    return () => cancelAnimationFrame(id);
  }, [situar, el, onToc]);

  return (
    <>
      {el && (
        <div
          ref={anell}
          aria-hidden
          className={`pointer-events-none fixed z-[94] rounded-2xl border-[3px] border-gold animate-bategar ${
            sortint ? "opacity-0 transition-opacity duration-300" : ""
          }`}
        />
      )}
      <div ref={posicio} className="fixed z-[95]" style={{ top: 0, left: 0 }}>
        <button
          type="button"
          onClick={onToc}
          className={`relative block w-full text-left ${sortint ? "animate-esvair" : "animate-bombolla"} ${
            cua === "amunt" ? "origin-top" : "origin-bottom"
          }`}
        >
          {cua === "amunt" && <Cua direccio="amunt" cuaRef={cuaRef} />}
          <span className="flex items-start gap-3 rounded-2xl border-[3px] border-ink bg-white px-3.5 py-2.5 shadow-[0_4px_0_var(--ink)]">
            <span aria-hidden className="text-3xl leading-none">
              {pas.emoji}
            </span>
            <span className="text-lg leading-snug">
              {pas.titol && <span className="font-extrabold">{pas.titol}. </span>}
              {pas.text}
            </span>
          </span>
          {cua === "avall" && <Cua direccio="avall" cuaRef={cuaRef} />}
        </button>
      </div>
    </>
  );
}

function Cua({ direccio, cuaRef }: { direccio: "avall" | "amunt"; cuaRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <span
      ref={cuaRef}
      aria-hidden
      className="absolute block animate-assenyalar"
      style={
        {
          "--salt": direccio === "avall" ? "6px" : "-6px",
          marginLeft: -17,
          [direccio === "avall" ? "bottom" : "top"]: -CUA + 3,
        } as React.CSSProperties
      }
    >
      <svg width="34" height="20" viewBox="0 0 34 20" className={direccio === "amunt" ? "rotate-180" : ""}>
        <polygon points="0,0 34,0 17,18" fill="#fff" />
        <polyline points="2,0 17,17 32,0" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
