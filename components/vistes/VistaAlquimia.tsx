"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PECES, type ElementAlquimia, type ResultatMescla } from "@/content/public/alquimia";

export interface PecaAlquimia {
  id: number;
  element: ElementAlquimia;
  /** Centre de la peça, en fracció del costat de la taula (0–1; el centre del cercle és 0,5). */
  x: number;
  y: number;
}

export interface VistaAlquimiaProps {
  descoberts: readonly ElementAlquimia[];
  total: number;
  onCombinar: (a: ElementAlquimia, b: ElementAlquimia) => Promise<ResultatMescla>;
  /** La galeria hi posa peces per veure la taula plena. */
  pecesInicials?: PecaAlquimia[];
}

type Origen = { tipus: "menu" } | { tipus: "taula"; id: number };
type EstatPeca = "mesclant" | "error" | "nou" | "descobert";

// Distància mínima abans de considerar que un toc és un arrossegament.
const LLINDAR_PX = 8;
const MIDA_PECA_PX = 64;
// N'hi ha prou que les dues peces es toquin una mica per barrejar-se.
const RADI_MESCLA_PX = 58;
// Les peces poden tapar l'anell interior de runes, però no l'exterior (vora interior a 418/500).
const ABAST = 0.84;

/**
 * Taula rodona on es barregen els elements (només emojis), envoltada de dos anells de runes que
 * giren, i a sota el menú amb tots els descoberts (emoji i nom). S'arrossega amb Pointer Events
 * perquè funcioni igual amb el dit que amb el ratolí: al menú, `touch-action: pan-x` deixa que
 * el navegador faci l'scroll horitzontal i només ens arriba el gest quan el dit puja cap a la taula.
 */
export function VistaAlquimia({ descoberts, total, onCombinar, pecesInicials = [] }: VistaAlquimiaProps) {
  const [peces, setPeces] = useState<PecaAlquimia[]>(pecesInicials);
  const [estats, setEstats] = useState<Record<number, EstatPeca>>({});
  const [fantasma, setFantasma] = useState<{
    element: ElementAlquimia;
    origen: Origen;
    x: number;
    y: number;
    /** Peça sobre la qual es barrejaria si es deixés anar ara. */
    objectiu: number | null;
  } | null>(null);
  const [destacat, setDestacat] = useState<string | null>(null);
  const [senseConnexio, setSenseConnexio] = useState(false);

  const taulaRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pecesRef = useRef(peces);
  const estatsRef = useRef(estats);
  const seguentId = useRef(pecesInicials.reduce((max, p) => Math.max(max, p.id), 0) + 1);
  const arrossegant = useRef(false);
  // Després d'un arrossegament tàctil el navegador pot disparar igualment el clic del botó.
  const fiArrossegament = useRef(0);

  useEffect(() => {
    pecesRef.current = peces;
    estatsRef.current = estats;
  }, [peces, estats]);

  useEffect(() => {
    if (!destacat) return;
    menuRef.current
      ?.querySelector(`[data-nom="${CSS.escape(destacat)}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    const t = setTimeout(() => setDestacat(null), 2500);
    return () => clearTimeout(t);
  }, [destacat]);

  useEffect(() => {
    if (!senseConnexio) return;
    const t = setTimeout(() => setSenseConnexio(false), 2500);
    return () => clearTimeout(t);
  }, [senseConnexio]);

  const nouId = () => seguentId.current++;

  function marcar(ids: number[], estat: EstatPeca | null, duradaMs?: number) {
    setEstats((prev) => {
      const seg = { ...prev };
      for (const id of ids) {
        if (estat) seg[id] = estat;
        else delete seg[id];
      }
      return seg;
    });
    if (estat && duradaMs) setTimeout(() => marcar(ids, null), duradaMs);
  }

  function pecaSota(r: DOMRect, cx: number, cy: number, excepte: number | null) {
    let millor: PecaAlquimia | null = null;
    let distMillor = RADI_MESCLA_PX;
    for (const p of pecesRef.current) {
      if (p.id === excepte || estatsRef.current[p.id] === "mesclant") continue;
      const d = Math.hypot(r.left + p.x * r.width - cx, r.top + p.y * r.height - cy);
      if (d < distMillor) {
        millor = p;
        distMillor = d;
      }
    }
    return millor;
  }

  async function deixar(element: ElementAlquimia, origen: Origen, cx: number, cy: number) {
    const taula = taulaRef.current;
    if (!taula) return;
    const r = taula.getBoundingClientRect();
    const dins = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)) <= r.width / 2;
    const idOrigen = origen.tipus === "taula" ? origen.id : null;
    const desti = dins ? pecaSota(r, cx, cy, idOrigen) : null;
    const pos = posicio(r, (cx - r.left) / r.width, (cy - r.top) / r.height);

    if (!desti) {
      if (idOrigen === null) {
        if (dins) {
          const id = nouId();
          setPeces((p) => retallar([...p, { id, element, ...pos }], [id]));
        }
      } else if (dins) {
        setPeces((p) => p.map((q) => (q.id === idOrigen ? { ...q, ...pos } : q)));
      } else {
        // Treure una peça de la taula la fa desaparèixer.
        setPeces((p) => p.filter((q) => q.id !== idOrigen));
      }
      return;
    }

    const id = idOrigen ?? nouId();
    setPeces((p) =>
      idOrigen === null ? [...p, { id, element, ...pos }] : p.map((q) => (q.id === id ? { ...q, ...pos } : q)),
    );
    marcar([id, desti.id], "mesclant");

    const resultat = await onCombinar(element, desti.element);

    if (resultat.tipus === "nou" || resultat.tipus === "conegut") {
      const nova = { id: nouId(), element: resultat.element, x: desti.x, y: desti.y };
      setPeces((p) => [...p.filter((q) => q.id !== id && q.id !== desti.id), nova]);
      marcar([id, desti.id], null);
      if (resultat.tipus === "nou") {
        marcar([nova.id], "descobert", 1600);
        setDestacat(resultat.element.nom);
        navigator.vibrate?.(40);
      } else {
        marcar([nova.id], "nou", 700);
      }
      return;
    }

    // No hi ha recepta: tremolen i la peça arrossegada queda al costat.
    setPeces((p) =>
      retallar(
        p.map((q) => (q.id === id ? { ...q, ...alCostat(r, desti, p.filter((o) => o.id !== id)) } : q)),
        [id, desti.id],
      ),
    );
    marcar([id, desti.id], "error", 450);
    if (resultat.tipus === "error") setSenseConnexio(true);
  }

  /** Un toc al menú (sense arrossegar) posa l'element en un lloc lliure de la taula. */
  function posarLliure(element: ElementAlquimia) {
    const taula = taulaRef.current;
    if (!taula) return;
    const r = taula.getBoundingClientRect();
    const id = nouId();
    setPeces((p) => retallar([...p, { id, element, ...llocLliure(r, p) }], [id]));
    marcar([id], "nou", 700);
  }

  function iniciar(e: React.PointerEvent, element: ElementAlquimia, origen: Origen) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (arrossegant.current) return;
    if (origen.tipus === "taula" && estatsRef.current[origen.id] === "mesclant") return;

    const pointerId = e.pointerId;
    const inici = { x: e.clientX, y: e.clientY };
    let actiu = false;

    const moure = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!actiu) {
        if (Math.hypot(ev.clientX - inici.x, ev.clientY - inici.y) < LLINDAR_PX) return;
        actiu = true;
        arrossegant.current = true;
      }
      const r = taulaRef.current?.getBoundingClientRect();
      const objectiu = r ? pecaSota(r, ev.clientX, ev.clientY, origen.tipus === "taula" ? origen.id : null) : null;
      setFantasma({ element, origen, x: ev.clientX, y: ev.clientY, objectiu: objectiu?.id ?? null });
    };

    const acabar = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", moure);
      window.removeEventListener("pointerup", acabar);
      window.removeEventListener("pointercancel", acabar);
      arrossegant.current = false;
      if (actiu) fiArrossegament.current = Date.now();
      setFantasma(null);
      if (actiu && ev.type === "pointerup") void deixar(element, origen, ev.clientX, ev.clientY);
    };

    window.addEventListener("pointermove", moure);
    window.addEventListener("pointerup", acabar);
    window.addEventListener("pointercancel", acabar);
  }

  const idArrossegat = fantasma?.origen.tipus === "taula" ? fantasma.origen.id : null;
  const complet = descoberts.length >= total;
  const celebrant = Object.values(estats).includes("descobert");

  return (
    <main
      className="mx-auto flex h-dvh w-full max-w-md select-none flex-col overflow-hidden [-webkit-touch-callout:none]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <div>
          <h1 className="font-display text-4xl font-extrabold">El Gresol</h1>
          <p className={`etiqueta ${complet ? "text-gold-deep" : ""}`} aria-live="polite">
            {senseConnexio ? (
              <span className="text-blood">sense connexió</span>
            ) : complet ? (
              "✦ ho has descobert tot! ✦"
            ) : (
              `${descoberts.length} de ${total} descoberts`
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPeces([])}
          disabled={peces.length === 0}
          className="btn btn-secundari btn-rodo shrink-0"
          aria-label="Buida la taula"
        >
          ✕
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-2 [container-type:size]">
        <div
          ref={taulaRef}
          className="relative aspect-square touch-none rounded-full border-[3px] border-ink shadow-[0_6px_0_var(--ink),0_0_70px_12px_rgb(234_179_8/0.22)]"
          style={{
            width: "min(100cqw, 100cqh)",
            background: "radial-gradient(circle, #f8eed6 0%, var(--paper-2) 55%, var(--paper-3) 100%)",
          }}
        >
          <div
            className={`pointer-events-none absolute inset-0 transition-[filter] duration-500 ${
              celebrant ? "drop-shadow-[0_0_6px_rgb(234_179_8)] brightness-125" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/runes-exterior.svg" alt="" draggable={false} className="absolute inset-0 size-full animate-girar" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/runes-interior.svg"
              alt=""
              draggable={false}
              className="absolute inset-0 size-full animate-girar"
              style={{ animationDuration: "100s", animationDirection: "reverse" }}
            />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/gresol.webp"
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 m-auto size-[58%] object-contain opacity-30"
          />

          {peces.length === 0 && !fantasma && (
            <p className="pointer-events-none absolute top-[66%] left-1/2 w-3/5 -translate-x-1/2 text-center text-base leading-tight font-bold text-ink-soft">
              Arrossega aquí dos elements i ajunta&apos;ls
            </p>
          )}

          {peces.map((p) => {
            const estat = estats[p.id];
            return (
              <div
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, opacity: p.id === idArrossegat ? 0 : 1 }}
              >
                {estat === "descobert" && (
                  <span className="pointer-events-none absolute inset-0 animate-ona rounded-full bg-gold/70" />
                )}
                <div
                  role="img"
                  aria-label={p.element.nom}
                  onPointerDown={(e) => iniciar(e, p.element, { tipus: "taula", id: p.id })}
                  className={`relative flex size-[64px] cursor-grab items-center justify-center rounded-full border-[3px] border-ink text-[2.3rem] leading-none shadow-[0_4px_0_var(--ink)] transition-transform ${
                    fantasma?.objectiu === p.id ? "scale-125 bg-[#fde68a] ring-4 ring-gold" : "bg-paper"
                  } ${
                    estat === "mesclant"
                      ? "animate-bategar"
                      : estat === "error"
                        ? "animate-tremolar"
                        : estat === "nou" || estat === "descobert"
                          ? "animate-segellar"
                          : ""
                  }`}
                >
                  {p.element.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <nav
        ref={menuRef}
        aria-label="Elements descoberts"
        onWheel={(e) => {
          if (menuRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) menuRef.current.scrollLeft += e.deltaY;
        }}
        className="overflow-x-auto border-t-[3px] border-ink bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="grid auto-cols-[calc((100%-2rem)/5)] grid-flow-col grid-rows-2 gap-2">
          {descoberts.map((el) => (
            <li key={el.nom}>
              <button
                type="button"
                data-nom={el.nom}
                onPointerDown={(e) => iniciar(e, el, { tipus: "menu" })}
                onClick={() => {
                  if (Date.now() - fiArrossegament.current > 400) posarLliure(el);
                }}
                className={`flex h-[4.75rem] w-full touch-pan-x cursor-grab flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-ink bg-paper-2 px-0.5 ${
                  destacat === el.nom ? "animate-bategar border-gold-deep bg-gold/30" : ""
                }`}
              >
                <span className="text-3xl leading-none">{el.emoji}</span>
                <span className="line-clamp-2 text-center text-[0.7rem] leading-tight font-bold">{el.nom}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {fantasma && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: fantasma.x, top: fantasma.y }}
        >
          <div className="flex size-[64px] scale-110 items-center justify-center rounded-full border-[3px] border-ink bg-paper text-[2.3rem] leading-none shadow-[0_10px_0_var(--ink)]">
            {fantasma.element.emoji}
          </div>
        </div>
      )}
    </main>
  );
}

/** Distància màxima del centre de la taula al centre d'una peça, en fracció del costat. */
function radiMaxim(r: DOMRect) {
  return (ABAST * r.width) / 2 / r.width - MIDA_PECA_PX / 2 / r.width;
}

/** Porta el punt (fracció del costat) dins del cercle on hi caben les peces. */
function posicio(r: DOMRect, fx: number, fy: number) {
  const dx = fx - 0.5;
  const dy = fy - 0.5;
  const d = Math.hypot(dx, dy);
  const max = radiMaxim(r);
  const k = d > max ? max / d : 1;
  return { x: 0.5 + dx * k, y: 0.5 + dy * k };
}

/** D'entre els candidats, el més allunyat de les peces que ja hi ha. */
function mesLliure(r: DOMRect, candidats: { x: number; y: number }[], peces: PecaAlquimia[]) {
  let millor = candidats[0];
  let espaiMillor = -1;
  for (const c of candidats) {
    const espai = Math.min(Infinity, ...peces.map((p) => Math.hypot(p.x - c.x, p.y - c.y) * r.width));
    if (espai > espaiMillor) {
      millor = c;
      espaiMillor = espai;
    }
  }
  return millor;
}

function llocLliure(r: DOMRect, peces: PecaAlquimia[]) {
  const max = radiMaxim(r);
  const candidats = Array.from({ length: 24 }, () => {
    const angle = Math.random() * 2 * Math.PI;
    const radi = Math.sqrt(Math.random()) * max;
    return { x: 0.5 + Math.cos(angle) * radi, y: 0.5 + Math.sin(angle) * radi };
  });
  return mesLliure(r, candidats, peces);
}

/** On deixar la peça que no s'ha pogut barrejar: al voltant de la de destí, on hi hagi més lloc. */
function alCostat(r: DOMRect, desti: PecaAlquimia, altres: PecaAlquimia[]) {
  const pas = (MIDA_PECA_PX + 10) / r.width;
  const candidats = Array.from({ length: 8 }, (_, i) =>
    posicio(r, desti.x + Math.cos((i * Math.PI) / 4) * pas, desti.y + Math.sin((i * Math.PI) / 4) * pas),
  );
  return mesLliure(r, candidats, altres);
}

/** Si n'hi ha més de MAX_PECES, fa fora les més antigues (les que no estan protegides). */
function retallar(peces: PecaAlquimia[], protegits: number[]) {
  const sobren = peces.length - MAX_PECES;
  if (sobren <= 0) return peces;
  const fora = new Set(
    peces
      .filter((p) => !protegits.includes(p.id))
      .sort((a, b) => a.id - b.id)
      .slice(0, sobren)
      .map((p) => p.id),
  );
  return peces.filter((p) => !fora.has(p.id));
}
