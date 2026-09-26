"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ELEMENTS, ESTACIONS } from "@/content/public/estacions";

/**
 * Pàgina de prova: ortofoto PNOA girada ~30° a l'esquerra (public/ortofoto-pentagrama.webp)
 * amb les estacions de content/public/estacions.ts a sobre.
 *
 * La imatge es va demanar al WMS amb aquesta BBOX (EPSG:4326), centrada a la fita 6
 * (Pla del Masset), a 2804×2804 px; es va girar +29.846° (antihorari) al voltant del
 * centre i se'n va retallar el quadrat central de 2048×2048 (1040 m de costat, 0,51 m/px).
 */
const MIN_LAT = 41.906727;
const MAX_LAT = 41.919533;
const MIN_LON = 2.221185;
const MAX_LON = 2.238393;
const ORIGINAL = 2804;
const MIDA = 2048;
/** Gir antihorari aplicat a la imatge: deixa la fita 1 i la 2 a la mateixa alçada. */
const ANGLE = (29.846 * Math.PI) / 180;

type Vertex = 1 | 2 | 3 | 4 | 5;

/** Pentagrames a comparar. `mogudes` = fites que no coincideixen amb l'actual (es marquen amb ′). */
const PENTAGRAMES: { id: string; nom: string; mogudes: Vertex[]; punts: Record<Vertex, [number, number]> }[] = [
  {
    // El que traçen les fites tal com són ara (no és regular).
    id: "actual",
    nom: "Fites actuals",
    mogudes: [],
    punts: Object.fromEntries(
      ESTACIONS.filter((e) => e.ordre <= 5).map((e) => [e.ordre, [e.latitud, e.longitud]])
    ) as Record<Vertex, [number, number]>,
  },
  {
    // 1, 2 i 4 actuals · 3 del pentagrama regular ajustat a 1, 2 i 3 · 5 triada a mà.
    // Detall a docs/mapa-proposta-definitiva.md.
    id: "definitiva",
    nom: "Proposta definitiva",
    mogudes: [3, 5],
    punts: {
      1: [41.914816, 2.227479],
      2: [41.912256, 2.233469],
      3: [41.915419, 2.231577],
      4: [41.910894, 2.224434],
      5: [41.910355, 2.230083],
    },
  },
];

const ZOOM_MAX = 6;
/** Píxels que s'ha de moure el dit perquè un toc passi a ser arrossegar. */
const LLINDAR_ARROSSEGAR = 8;

const INK = "#1b1511";
const PAPER = "#fffdf7";
const GOLD = "#eab308";

/** lat/lon → píxel de la imatge girada (0..MIDA). */
function aPixel(lat: number, lon: number) {
  const u = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * ORIGINAL - ORIGINAL / 2;
  const v = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * ORIGINAL - ORIGINAL / 2;
  // Gir antihorari a la pantalla (eix y cap avall).
  const c = Math.cos(ANGLE);
  const s = Math.sin(ANGLE);
  return { x: MIDA / 2 + u * c + v * s, y: MIDA / 2 - u * s + v * c };
}

/** Píxel de la imatge girada → lat/lon (per comprovar punts fent clic). */
function aLatLon(x: number, y: number) {
  const dx = x - MIDA / 2;
  const dy = y - MIDA / 2;
  const c = Math.cos(ANGLE);
  const s = Math.sin(ANGLE);
  const u = dx * c - dy * s + ORIGINAL / 2;
  const v = dx * s + dy * c + ORIGINAL / 2;
  return {
    lat: MAX_LAT - (v / ORIGINAL) * (MAX_LAT - MIN_LAT),
    lon: MIN_LON + (u / ORIGINAL) * (MAX_LON - MIN_LON),
  };
}

export default function ProvaMapaPage() {
  const [clic, setClic] = useState<{ x: number; y: number; lat: number; lon: number } | null>(null);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [iPenta, setIPenta] = useState(PENTAGRAMES.findIndex((p) => p.id === "definitiva"));
  const penta = PENTAGRAMES[iPenta];
  const IDEAL = penta.punts;

  const nord = aPixel(MAX_LAT, (MIN_LON + MAX_LON) / 2);
  const angleNord = (Math.atan2(nord.x - MIDA / 2, MIDA / 2 - nord.y) * 180) / Math.PI;

  // --- Zoom i desplaçament (mateixa idea que components/player/MapaEquip.tsx) ---
  const vistaRef = useRef<HTMLDivElement | null>(null);
  const [costat, setCostat] = useState(0);
  // Posició a la pantalla = t + z · posició dins la capa.
  const [vista, setVista] = useState({ z: 1, tx: 0, ty: 0 });

  useEffect(() => {
    const el = vistaRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entrada]) => setCostat(entrada.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /** Limita el zoom i evita que el mapa surti de la finestra. */
  const ajustar = useCallback(
    (z: number, tx: number, ty: number) => {
      const zz = Math.min(Math.max(z, 1), ZOOM_MAX);
      const eix = (t: number) => Math.min(Math.max(t, costat - costat * zz), 0);
      return { z: zz, tx: eix(tx), ty: eix(ty) };
    },
    [costat]
  );

  /** Zoom mantenint quiet el punt (px, py) de la finestra. */
  const zoomA = useCallback(
    (z: number, px: number, py: number) =>
      setVista((v) => {
        const zz = Math.min(Math.max(z, 1), ZOOM_MAX);
        return ajustar(zz, px - ((px - v.tx) * zz) / v.z, py - ((py - v.ty) * zz) / v.z);
      }),
    [ajustar]
  );

  const punters = useRef(new Map<number, { x: number; y: number }>());
  const gest = useRef<{ z0: number; tx0: number; ty0: number; x0: number; y0: number; dist0: number; mogut: boolean } | null>(
    null
  );
  const clicBloquejat = useRef(false);

  const posRelativa = (e: { clientX: number; clientY: number }) => {
    const r = vistaRef.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) };
  };

  function iniciarGest() {
    const pts = [...punters.current.values()];
    if (pts.length === 0) {
      gest.current = null;
      return;
    }
    const x = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const y = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const dist0 = pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gest.current = { z0: vista.z, tx0: vista.tx, ty0: vista.ty, x0: x, y0: y, dist0, mogut: gest.current?.mogut ?? false };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    if (punters.current.size === 0) {
      clicBloquejat.current = false;
      gest.current = null;
    }
    punters.current.set(e.pointerId, posRelativa(e));
    iniciarGest();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const g = gest.current;
    if (!g || !punters.current.has(e.pointerId)) return;
    punters.current.set(e.pointerId, posRelativa(e));
    const pts = [...punters.current.values()];
    const x = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const y = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    if (!g.mogut) {
      if (pts.length < 2 && Math.hypot(x - g.x0, y - g.y0) < LLINDAR_ARROSSEGAR) return;
      g.mogut = true;
      clicBloquejat.current = true;
      for (const id of punters.current.keys()) {
        try {
          e.currentTarget.setPointerCapture(id);
        } catch {
          /* el punter ja no existeix */
        }
      }
    }
    let z = g.z0;
    if (pts.length >= 2 && g.dist0 > 0) {
      z = Math.min(Math.max(g.z0 * (Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) / g.dist0), 1), ZOOM_MAX);
    }
    const cx = (g.x0 - g.tx0) / g.z0;
    const cy = (g.y0 - g.ty0) / g.z0;
    setVista(ajustar(z, x - cx * z, y - cy * z));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!punters.current.delete(e.pointerId)) return;
    iniciarGest();
  }

  // Roda del ratolí: aquí sempre fa zoom (és una pàgina de prova, no hi ha scroll a protegir).
  useEffect(() => {
    const el = vistaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      setVista((v) => {
        const z = Math.min(Math.max(v.z * Math.exp(-e.deltaY * 0.002), 1), ZOOM_MAX);
        return ajustar(z, px - ((px - v.tx) * z) / v.z, py - ((py - v.ty) * z) / v.z);
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ajustar]);

  // Els marcadors creixen menys que el mapa.
  const escala = 1 / Math.sqrt(vista.z);

  function onClic(e: React.MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * MIDA;
    const y = ((e.clientY - r.top) / r.height) * MIDA;
    setClic({ x, y, ...aLatLon(x, y) });
  }

  const estacio = ESTACIONS.find((e) => e.id === seleccionada);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-extrabold">Prova de mapa · ortofoto girada</h1>

      <div
        ref={vistaRef}
        className="relative aspect-square w-full touch-none select-none overflow-hidden rounded-3xl border-[3px] border-ink bg-paper-2 shadow-[0_6px_0_var(--ink)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (clicBloquejat.current && !(e.target as HTMLElement).closest("button")) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <div
          className="absolute left-0 top-0 h-full w-full origin-top-left will-change-transform"
          style={{ transform: `translate(${vista.tx}px, ${vista.ty}px) scale(${vista.z})` }}
        >
        <svg viewBox={`0 0 ${MIDA} ${MIDA}`} className="block h-full w-full" onClick={onClic}>
          <image href="/ortofoto-pentagrama.webp" x={0} y={0} width={MIDA} height={MIDA} />

          {/* Pentagrama regular (àpex = 3). Ordre de traç: 3→4→2→1→5→3 */}
          {/* nonzero: s'omple tota l'estrella, també el pentàgon del mig */}
          <polygon
            points={[IDEAL[3], IDEAL[4], IDEAL[2], IDEAL[1], IDEAL[5]]
              .map(([la, lo]) => {
                const p = aPixel(la, lo);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill={GOLD}
            fillOpacity={0.3}
            fillRule="nonzero"
            pointerEvents="none"
            stroke={GOLD}
            strokeWidth={8 * escala}
            strokeDasharray={`${30 * escala} ${18 * escala}`}
            strokeOpacity={0.9}
          />
          {penta.mogudes.map((k) => {
            const p = aPixel(IDEAL[k][0], IDEAL[k][1]);
            return (
              <g key={k} transform={`translate(${p.x} ${p.y}) scale(${escala})`} pointerEvents="none">
                <circle r={26} fill={PAPER} stroke={GOLD} strokeWidth={8} />
                <text textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={800} fill={INK}>
                  {k}′
                </text>
              </g>
            );
          })}

          {ESTACIONS.map((e) => {
            const { x, y } = aPixel(e.latitud, e.longitud);
            const color = e.element ? ELEMENTS[e.element].color : GOLD;
            const sel = e.id === seleccionada;
            return (
              <g
                key={e.id}
                transform={`translate(${x} ${y}) scale(${escala * (sel ? 1.4 : 1)})`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setSeleccionada(sel ? null : e.id);
                }}
                style={{ cursor: "pointer" }}
              >
                {/* La punta de l'agulla és exactament la coordenada */}
                <path d="M 0 0 L -22 -50 A 34 34 0 1 1 22 -50 Z" fill={color} stroke={INK} strokeWidth={7} />
                <circle cy={-80} r={24} fill={PAPER} />
                {e.element ? (
                  <image href={ELEMENTS[e.element].icona} x={-20} y={-100} width={40} height={40} />
                ) : (
                  <text y={-80} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill={INK}>
                    ✦
                  </text>
                )}
                <text
                  y={-130}
                  textAnchor="middle"
                  fontSize={38}
                  fontWeight={800}
                  fill={INK}
                  stroke={PAPER}
                  strokeWidth={10}
                  paintOrder="stroke"
                >
                  {e.ordre}. {e.nom}
                </text>
              </g>
            );
          })}

          {clic && (
            <g transform={`translate(${clic.x} ${clic.y}) scale(${escala})`} pointerEvents="none">
              <circle r={14} fill="#2563eb" stroke="#fff" strokeWidth={5} />
            </g>
          )}
        </svg>
        </div>

        {/* Rosa del nord: fixa a la cantonada, no fa zoom */}
        <svg viewBox="-80 -80 160 160" className="pointer-events-none absolute left-3 top-3 h-14 w-14">
          <g transform={`rotate(${angleNord})`}>
            <circle r={70} fill={PAPER} stroke={INK} strokeWidth={8} opacity={0.9} />
            <path d="M 0 -52 L 22 20 L 0 8 L -22 20 Z" fill={INK} />
            <text y={48} textAnchor="middle" fontSize={34} fontWeight={800} fill={INK}>
              N
            </text>
          </g>
        </svg>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => zoomA(vista.z * 1.6, costat / 2, costat / 2)}
            aria-label="Apropar"
            className="btn btn-secundari btn-rodo text-2xl"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomA(vista.z / 1.6, costat / 2, costat / 2)}
            aria-label="Allunyar"
            className="btn btn-secundari btn-rodo text-2xl"
            disabled={vista.z <= 1}
          >
            −
          </button>
          {vista.z > 1 && (
            <button
              type="button"
              onClick={() => setVista({ z: 1, tx: 0, ty: 0 })}
              aria-label="Tornar a veure tot el mapa"
              className="btn btn-secundari btn-rodo text-xl"
            >
              ⟲
            </button>
          )}
        </div>
      </div>
      <p className="-mt-2 text-center text-sm">Roda del ratolí o pessic per fer zoom · arrossegueu per moure-us</p>

      <div className="grid grid-cols-2 gap-2">
        <span className="col-span-2 text-center text-sm font-bold">Pentagrama:</span>
        {PENTAGRAMES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIPenta(i)}
            aria-pressed={i === iPenta}
            className={`btn ${i === iPenta ? "btn-primari" : "btn-secundari"}`}
          >
            {p.nom}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border-[3px] border-ink bg-paper p-3 text-sm">
        {estacio ? (
          <p>
            <strong>
              {estacio.ordre}. {estacio.nom}
            </strong>{" "}
            — {estacio.situacio} ({estacio.latitud}, {estacio.longitud})
          </p>
        ) : (
          <p>Toqueu una agulla per veure'n les dades.</p>
        )}
        <p className="mt-1">
          {clic
            ? `Clic: ${clic.lat.toFixed(6)}, ${clic.lon.toFixed(6)}`
            : "Feu clic al mapa per llegir-ne les coordenades (per comprovar que les agulles quadren)."}
        </p>
      </div>
    </main>
  );
}
