"use client";

import { useEffect, useRef, useState } from "react";
import { BANDA_RUNES_PX, MarcRunes } from "@/components/ui/MarcRunes";
import { estilPapir, FiltresPapir } from "@/components/ui/papir";
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
  /** Tornar a on era (l'app instal·lada no té botó enrere). */
  onTornar?: () => void;
  /** Obre el llibre de receptes (botó "i" de la taula). */
  onReceptes?: () => void;
}

type Origen = { tipus: "menu" } | { tipus: "taula"; id: number };
type EstatPeca = "mesclant" | "error" | "nou" | "descobert";

// Distància mínima abans de considerar que un toc és un arrossegament.
const LLINDAR_PX = 8;
const MIDA_PECA_PX = 64;
// N'hi ha prou que les dues peces es toquin una mica per barrejar-se.
const RADI_MESCLA_PX = 58;
// Les peces no tapen la banda de runes.
const MARGE_PX = MIDA_PECA_PX / 2 + BANDA_RUNES_PX;
// Al menú, la banda de runes és més prima per deixar lloc a les etiquetes.
const RUNES_MENU_PX = 9;
/**
 * Taula on es barregen els elements (només emojis), amb una inscripció de runes que en dona la
 * volta, i a sota el menú amb tots els descoberts (emoji i nom). S'arrossega amb Pointer Events
 * perquè funcioni igual amb el dit que amb el ratolí: al menú, `touch-action: pan-x` deixa que
 * el navegador faci l'scroll horitzontal i només ens arriba el gest quan el dit puja cap a la taula.
 */
export function VistaAlquimia({
  descoberts,
  total,
  onCombinar,
  pecesInicials = [],
  onTornar,
  onReceptes,
}: VistaAlquimiaProps) {
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
  const [rotul, setRotul] = useState<{ id: number; nom: string; segons: 3 | 4 } | null>(null);
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

  /** Mostra el nom a la taula: 1 s d'entrada, `segons` visible i 1 s de sortida. */
  function mostrarNom(nom: string, segons: 3 | 4) {
    const id = nouId();
    setRotul({ id, nom, segons });
    setTimeout(() => setRotul((r) => (r?.id === id ? null : r)), (segons + 2) * 1000);
  }

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
    const dins = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    const idOrigen = origen.tipus === "taula" ? origen.id : null;
    const desti = dins ? pecaSota(r, cx, cy, idOrigen) : null;
    const pos = posicio(r, (cx - r.left) / r.width, (cy - r.top) / r.height);

    if (!desti) {
      if (idOrigen === null) {
        if (dins) {
          const id = nouId();
          setPeces((p) => retallar([...p, { id, element, ...pos }], [id]));
          mostrarNom(element.nom, 3);
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
      mostrarNom(resultat.element.nom, 4);
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
    // Si venia del grimori, l'element acaba de posar-se a la taula.
    if (idOrigen === null) mostrarNom(element.nom, 3);
  }

  /** Un toc al menú (sense arrossegar) posa l'element en un lloc lliure de la taula. */
  function posarLliure(element: ElementAlquimia) {
    const taula = taulaRef.current;
    if (!taula) return;
    const r = taula.getBoundingClientRect();
    const id = nouId();
    setPeces((p) => retallar([...p, { id, element, ...llocLliure(r, p) }], [id]));
    marcar([id], "nou", 700);
    mostrarNom(element.nom, 3);
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
      <FiltresPapir />
      <header className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        {onTornar && (
          <button type="button" onClick={onTornar} className="btn btn-secundari btn-rodo shrink-0" aria-label="Torna al joc">
            ←
          </button>
        )}
        <div className="mr-auto">
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

      <div
        ref={taulaRef}
        className="relative mx-4 mb-2 flex-1 touch-none overflow-hidden rounded-3xl border-[3px] border-ink bg-paper-2 shadow-[inset_0_4px_0_rgb(27_21_17/0.08)]"
        style={{
          backgroundImage: "var(--gra), radial-gradient(ellipse at center, #f8eed6 0%, var(--paper-2) 60%, var(--paper-3) 100%)",
        }}
      >
        <MarcRunes brillant={celebrant} />
        <div
          className="pointer-events-none absolute rounded-2xl border-2 border-gold-deep/40"
          style={{ inset: BANDA_RUNES_PX }}
        />
        {onReceptes && (
          // Just a dins de la línia daurada, perquè no tapi les runes; la zona de toc fa 44 px.
          <button
            type="button"
            onClick={onReceptes}
            aria-label="Receptes"
            className="absolute z-20 flex size-11 items-center justify-center"
            style={{ top: BANDA_RUNES_PX, right: BANDA_RUNES_PX }}
          >
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-gold-deep bg-paper font-display text-lg leading-none font-extrabold text-gold-deep">
              i
            </span>
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/gresol.webp"
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 m-auto h-[70%] w-[70%] object-contain opacity-30"
        />

        {peces.length === 0 && !fantasma && (
          <p className="pointer-events-none absolute inset-x-10 bottom-10 text-center leading-tight font-bold text-ink-soft">
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
                  style={estilPapir(p.element.nom)}
                  className={`fitxa-papir w-16 cursor-grab text-[2.3rem] transition-[scale] ${
                    fantasma?.objectiu === p.id ? "scale-125 brightness-110 outline-4 outline-offset-2 outline-gold" : ""
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
                  <span>{p.element.emoji}</span>
                </div>
              </div>
            );
          })}

        {rotul && (
          <p
            key={rotul.id}
            aria-live="polite"
            className="pointer-events-none absolute inset-x-8 top-[75%] -translate-y-1/2 text-center font-display text-5xl leading-none font-extrabold text-ink [text-shadow:0_0_10px_var(--paper),0_0_4px_var(--paper),0_0_2px_var(--paper)]"
            style={{ animation: `rotul-${rotul.segons} ${rotul.segons + 2}s ease-in-out both` }}
          >
            {rotul.nom}
          </p>
        )}
      </div>

      <div
        className="pergami relative mx-4 mb-[max(0.75rem,env(safe-area-inset-bottom))] rounded-3xl border-[3px] border-ink shadow-[inset_0_3px_0_rgb(255_255_255/0.45)]"
        style={{ backgroundColor: "var(--paper-3)" }}
      >
        <MarcRunes alcada={11} distanciaVora={RUNES_MENU_PX} invers brillant={celebrant} />
        <div
          className="pointer-events-none absolute rounded-2xl border-2 border-gold-deep/40"
          style={{ inset: RUNES_MENU_PX * 2 }}
        />
        <nav
          ref={menuRef}
          aria-label="Elements descoberts"
          onWheel={(e) => {
            if (menuRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) menuRef.current.scrollLeft += e.deltaY;
          }}
          className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ margin: RUNES_MENU_PX * 2 + 4 }}
        >
          <ul className="grid auto-cols-[calc((100%-1.5rem)/3.2)] grid-flow-col grid-rows-2 gap-2">
            {descoberts.map((el) => (
              <li key={el.nom} className="flex justify-center">
                <button
                  type="button"
                  data-nom={el.nom}
                  aria-label={el.nom}
                  onPointerDown={(e) => iniciar(e, el, { tipus: "menu" })}
                  onClick={() => {
                    if (Date.now() - fiArrossegament.current > 400) posarLliure(el);
                  }}
                  style={estilPapir(el.nom)}
                  className={`fitxa-papir h-[4.6rem] touch-pan-x cursor-grab text-[2.4rem] ${
                    destacat === el.nom ? "animate-bategar" : ""
                  }`}
                >
                  <span>{el.emoji}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {fantasma && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: fantasma.x, top: fantasma.y }}
        >
          <div className="fitxa-papir w-16 scale-110 text-[2.3rem]" style={estilPapir(fantasma.element.nom)}>
            <span>{fantasma.element.emoji}</span>
          </div>
        </div>
      )}
    </main>
  );
}

/** Porta el punt (fracció de l'amplada i de l'alçada) a la zona on caben les peces, dins les runes. */
function posicio(r: DOMRect, fx: number, fy: number) {
  const mx = Math.min(MARGE_PX / r.width, 0.5);
  const my = Math.min(MARGE_PX / r.height, 0.5);
  return { x: Math.min(Math.max(fx, mx), 1 - mx), y: Math.min(Math.max(fy, my), 1 - my) };
}

/** D'entre els candidats, el més allunyat de les peces que ja hi ha. */
function mesLliure(r: DOMRect, candidats: { x: number; y: number }[], peces: PecaAlquimia[]) {
  let millor = candidats[0];
  let espaiMillor = -1;
  for (const c of candidats) {
    const espai = Math.min(
      Infinity,
      ...peces.map((p) => Math.hypot((p.x - c.x) * r.width, (p.y - c.y) * r.height)),
    );
    if (espai > espaiMillor) {
      millor = c;
      espaiMillor = espai;
    }
  }
  return millor;
}

function llocLliure(r: DOMRect, peces: PecaAlquimia[]) {
  const candidats = Array.from({ length: 24 }, () => posicio(r, Math.random(), Math.random()));
  return mesLliure(r, candidats, peces);
}

/** On deixar la peça que no s'ha pogut barrejar: al voltant de la de destí, on hi hagi més lloc. */
function alCostat(r: DOMRect, desti: PecaAlquimia, altres: PecaAlquimia[]) {
  const pas = MIDA_PECA_PX + 10;
  const candidats = Array.from({ length: 8 }, (_, i) =>
    posicio(
      r,
      desti.x + (Math.cos((i * Math.PI) / 4) * pas) / r.width,
      desti.y + (Math.sin((i * Math.PI) / 4) * pas) / r.height,
    ),
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
