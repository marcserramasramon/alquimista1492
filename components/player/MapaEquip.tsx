"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ELEMENTS, type Element } from "@/content/public/estacions";

export interface EstacioMapa {
  id: string;
  nom: string;
  entrada: string;
  /** On és exactament la fita (text públic). */
  situacio?: string;
  latitud: number;
  longitud: number;
  tipus: "text" | "especial";
  disponible: boolean;
  element?: Element;
  /** false = l'equip encara no hi ha arribat (GPS o QR del cartell). Sense valor, es pot entrar. */
  oberta?: boolean;
  progres: { resolta: boolean };
}

export interface MapaEquipProps {
  estacions: EstacioMapa[];
  totesResoltes: boolean;
  /** Fita destacada al mapa. */
  seleccionadaId?: string | null;
  /** Es crida en tocar una fita del mapa. Sense aquesta funció, les fites no es poden tocar. */
  onSeleccionar?: (estacio: EstacioMapa) => void;
  /** Posicions en viu (màster, equips, el propi mòbil). */
  marcadors?: MarcadorMapa[];
  /** Camí que ha seguit un equip (només al mapa del màster), en ordre. */
  recorregut?: { lat: number; lng: number }[];
}

export interface MarcadorMapa {
  id: string;
  tipus: "master" | "equip" | "jo";
  lat: number;
  lng: number;
  /** Text al costat del marcador (nom d'equip). El del màster no en porta. */
  etiqueta?: string;
}

/**
 * Fons: ortofoto PNOA (public/ortofoto-pentagrama.webp), 2048×2048 px, 1040 m de costat,
 * centrada al Pla del Masset i girada 29,846° en sentit antihorari (el nord queda cap
 * amunt-esquerra). Es va demanar al WMS aquesta BBOX (EPSG:4326) a ORIGINAL×ORIGINAL px,
 * es va girar i se'n va retallar el quadrat central. Detall a docs/mapa-proposta-definitiva.md.
 */
const MIN_LAT = 41.906727;
const MAX_LAT = 41.919533;
const MIN_LON = 2.221185;
const MAX_LON = 2.238393;
const ORIGINAL = 2804;
/** Costat de la imatge i del viewBox. */
const MIDA = 2048;
const ANGLE_GRAUS = 29.846;
const ANGLE = (ANGLE_GRAUS * Math.PI) / 180;
/** Els marcadors es van dibuixar per a un viewBox de 800 px d'ample. */
const MIDA_MARCADORS = MIDA / 800;
const ZOOM_MAX = 5;
/** Píxels que s'ha de moure el dit perquè un toc passi a ser arrossegar. */
const LLINDAR_ARROSSEGAR = 8;

const INK = "#1b1511";
const PAPER = "#fffdf7";
const GOLD = "#eab308";
const BLOOD = "#b3261e";

/** lat/lon → píxel de la imatge girada (0..MIDA). */
function aPixel(lat: number, lon: number) {
  const u = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * ORIGINAL - ORIGINAL / 2;
  const v = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * ORIGINAL - ORIGINAL / 2;
  // Gir antihorari a la pantalla (eix y cap avall).
  const c = Math.cos(ANGLE);
  const s = Math.sin(ANGLE);
  return { x: MIDA / 2 + u * c + v * s, y: MIDA / 2 - u * s + v * c };
}

function dinsDelMapa(lat: number, lng: number) {
  const { x, y } = aPixel(lat, lng);
  return x >= 0 && x <= MIDA && y >= 0 && y <= MIDA;
}

function centre(pts: { x: number; y: number }[]) {
  return {
    x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
    y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
  };
}

export function MapaEquip({
  estacions,
  totesResoltes,
  seleccionadaId = null,
  onSeleccionar,
  marcadors = [],
  recorregut = [],
}: MapaEquipProps) {
  // Fora de la imatge del mapa, un marcador es queda a l'última
  // posició coneguda de dins (app-nova.md §7ter.3).
  const [darreresDins, setDarreresDins] = useState<Record<string, { lat: number; lng: number }>>({});
  const nousDins = marcadors.filter(
    (m) => dinsDelMapa(m.lat, m.lng) && (darreresDins[m.id]?.lat !== m.lat || darreresDins[m.id]?.lng !== m.lng)
  );
  if (nousDins.length > 0) {
    setDarreresDins((actuals) => {
      const seguents = { ...actuals };
      for (const m of nousDins) seguents[m.id] = { lat: m.lat, lng: m.lng };
      return seguents;
    });
  }
  const marcadorsVisibles = marcadors.flatMap((m) => {
    if (dinsDelMapa(m.lat, m.lng)) return [m];
    const darrera = darreresDins[m.id];
    return darrera ? [{ ...m, ...darrera }] : [];
  });

  const vistaRef = useRef<HTMLDivElement | null>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  // Mida de la finestra del mapa (px). La capa del mapa és sempre quadrada.
  const [mida, setMida] = useState({ w: 0, h: 0 });
  // Transformació de la capa: posició a la pantalla = t + z · posició dins la capa.
  const [vista, setVista] = useState({ z: 1, tx: 0, ty: 0 });

  useEffect(() => {
    const el = vistaRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      setMida((m) => (m.w === width && m.h === height ? m : { w: width, h: height }));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // La capa ocupa tota l'amplada (o l'alçada, si no hi cap) sense deformar el mapa.
  const capaW = mida.w > 0 && mida.h > 0 ? Math.min(mida.w, mida.h) : 0;
  const capaH = capaW;

  /** Limita el zoom i evita que el mapa surti de la finestra (o el centra si hi cap sencer). */
  const ajustar = useCallback(
    (z: number, tx: number, ty: number) => {
      const zz = Math.min(Math.max(z, 1), ZOOM_MAX);
      const eix = (t: number, capa: number, finestra: number) => {
        const s = capa * zz;
        if (s <= finestra) return (finestra - s) / 2;
        return Math.min(Math.max(t, finestra - s), 0);
      };
      return { z: zz, tx: eix(tx, capaW, mida.w), ty: eix(ty, capaH, mida.h) };
    },
    [capaW, capaH, mida.w, mida.h]
  );

  // Recol·loca el mapa quan canvia la mida (girar el mòbil, pantalla completa...).
  const [midaAjustada, setMidaAjustada] = useState(mida);
  if (midaAjustada !== mida) {
    setMidaAjustada(mida);
    setVista((v) => ajustar(v.z, v.tx, v.ty));
  }

  const reiniciar = () => setVista(ajustar(1, 0, 0));

  // Gestos amb pointer events: un dit arrossega, dos dits fan zoom (pessic).
  const punters = useRef(new Map<number, { x: number; y: number }>());
  const gest = useRef<{
    z0: number;
    tx0: number;
    ty0: number;
    x0: number;
    y0: number;
    dist0: number;
    mogut: boolean;
  } | null>(null);
  // Després d'arrossegar, el "click" final no ha de seleccionar cap fita.
  const clicBloquejat = useRef(false);

  const posRelativa = (e: { clientX: number; clientY: number }) => {
    const r = vistaRef.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) };
  };

  /** (Re)comença el gest amb els dits que hi ha ara a la pantalla. */
  function iniciarGest() {
    const pts = [...punters.current.values()];
    if (pts.length === 0) {
      gest.current = null;
      return;
    }
    const { x, y } = centre(pts);
    const dist0 = pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gest.current = {
      z0: vista.z,
      tx0: vista.tx,
      ty0: vista.ty,
      x0: x,
      y0: y,
      dist0,
      mogut: gest.current?.mogut ?? false,
    };
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
    const { x, y } = centre(pts);

    if (!g.mogut) {
      if (pts.length < 2 && Math.hypot(x - g.x0, y - g.y0) < LLINDAR_ARROSSEGAR) return;
      g.mogut = true;
      clicBloquejat.current = true;
      // Un cop comença el gest, el capturem perquè no es perdi si el dit surt del mapa.
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
    // El punt del mapa que hi havia sota els dits en començar hi continua.
    const cx = (g.x0 - g.tx0) / g.z0;
    const cy = (g.y0 - g.ty0) / g.z0;
    setVista(ajustar(z, x - cx * z, y - cy * z));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!punters.current.delete(e.pointerId)) return;
    // En aixecar un dels dos dits, el que queda continua arrossegant des d'on és.
    iniciarGest();
  }

  // Roda del ratolí (ordinador): amb Ctrl, o sempre a pantalla completa.
  // Cal un listener no passiu per poder aturar el scroll de la pàgina.
  useEffect(() => {
    const el = vistaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && !pantallaCompleta) return;
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
  }, [ajustar, pantallaCompleta]);

  // Esc tanca la pantalla completa.
  useEffect(() => {
    if (!pantallaCompleta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPantallaCompleta(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pantallaCompleta]);

  const zoom = vista.z;
  // Els marcadors creixen menys que el mapa: continuen al seu lloc però no ho tapen tot.
  const escala = MIDA_MARCADORS / Math.sqrt(zoom);

  return (
    <>
      {/* Mentre el mapa és a pantalla completa, en reserva el lloc a la pàgina. */}
      {pantallaCompleta && (
        <div className="aspect-square w-full rounded-3xl border-[3px] border-dashed border-ink/30" aria-hidden />
      )}
      <div
        className={
          pantallaCompleta
            ? "fixed inset-0 z-[25] flex flex-col bg-ink/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
            : "relative"
        }
        role={pantallaCompleta ? "dialog" : undefined}
        aria-modal={pantallaCompleta ? true : undefined}
        aria-label={pantallaCompleta ? "Mapa de Sentfores" : undefined}
      >
        <div
          ref={vistaRef}
          className={`relative w-full touch-none select-none overflow-hidden border-[3px] border-ink bg-paper-2 ${
            pantallaCompleta ? "min-h-0 flex-1 rounded-2xl" : "aspect-square rounded-3xl shadow-[0_6px_0_var(--ink)]"
          }`}
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
            className="absolute left-0 top-0 origin-top-left will-change-transform"
            style={{
              width: capaW || "100%",
              height: capaH || "100%",
              transform: `translate(${vista.tx}px, ${vista.ty}px) scale(${zoom})`,
            }}
          >
            <svg viewBox={`0 0 ${MIDA} ${MIDA}`} className="block h-full w-full">
              <image href="/ortofoto-pentagrama.webp" x={0} y={0} width={MIDA} height={MIDA} />

              {recorregut.length > 0 && <Cami punts={recorregut} escala={escala} />}

              {estacions
                .filter((e) => e.tipus !== "especial" || totesResoltes)
                // La seleccionada es pinta l'última perquè, en fer-se gran, quedi per sobre de les altres.
                .sort((a, b) => Number(a.id === seleccionadaId) - Number(b.id === seleccionadaId))
                .map((estacio) => {
                  const { x, y } = aPixel(estacio.latitud, estacio.longitud);
                  const element = estacio.element ? ELEMENTS[estacio.element] : null;
                  const seleccionada = estacio.id === seleccionadaId;
                  const resolta = estacio.progres.resolta;
                  const color = element?.color ?? GOLD;
                  return (
                    <g
                      key={estacio.id}
                      transform={`translate(${x} ${y}) scale(${escala * (seleccionada ? 2 : 1)})`}
                      onClick={onSeleccionar ? () => onSeleccionar(estacio) : undefined}
                      style={{ cursor: onSeleccionar ? "pointer" : undefined }}
                      aria-label={element?.nom ?? estacio.nom}
                    >
                      {/* Zona de toc més gran que el dibuix */}
                      <circle r={44} fill="transparent" />
                      {seleccionada && (
                        <circle r={30} fill="none" stroke={GOLD} strokeWidth={6}>
                          <animate attributeName="r" values="30;46" dur="1.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* La seleccionada (el doble de gran) batega */}
                      <g>
                        {seleccionada && (
                          <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="1;1.15;1"
                            dur="1.4s"
                            repeatCount="indefinite"
                          />
                        )}
                        {/* Agulla: cercle amb punta cap avall */}
                        <path d="M -12 20 L 0 38 L 12 20 Z" fill={INK} />
                        <circle
                          r={27}
                          fill={resolta ? color : estacio.disponible ? PAPER : "#d6c7a5"}
                          stroke={INK}
                          strokeWidth={4}
                        />
                        {!resolta && estacio.disponible && <circle r={21} fill="none" stroke={color} strokeWidth={5} />}
                        {element && !resolta ? (
                          <image
                            href={element.icona}
                            x={-15}
                            y={-15}
                            width={30}
                            height={30}
                            opacity={estacio.disponible ? 1 : 0.4}
                          />
                        ) : (
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={28}
                            fontWeight={800}
                            fill={resolta ? "#fff" : INK}
                          >
                            {resolta ? "✓" : "✦"}
                          </text>
                        )}
                      </g>
                    </g>
                  );
                })}

              {marcadorsVisibles.map((m) => {
                const { x, y } = aPixel(m.lat, m.lng);
                if (m.tipus === "jo") {
                  return (
                    <g key={m.id} transform={`translate(${x} ${y}) scale(${escala})`} aria-label="La vostra posició">
                      <circle r={14} fill="#2563eb" opacity={0.25}>
                        <animate attributeName="r" values="14;30" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle r={12} fill="#2563eb" stroke="#fff" strokeWidth={4} />
                    </g>
                  );
                }
                if (m.tipus === "master") {
                  return (
                    <g key={m.id} transform={`translate(${x} ${y}) scale(${escala})`} aria-label="Posició del màster">
                      <circle r={22} fill="none" stroke="#000" strokeWidth={4}>
                        <animate attributeName="r" values="22;40" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle r={22} fill="#000" stroke="#fff" strokeWidth={3} />
                      <text textAnchor="middle" dominantBaseline="central" fontSize={26} y={1}>
                        🧙
                      </text>
                    </g>
                  );
                }
                return (
                  <g key={m.id} transform={`translate(${x} ${y}) scale(${escala})`}>
                    <circle r={14} fill={BLOOD} stroke="#fff" strokeWidth={4} />
                    {m.etiqueta && (
                      <text
                        y={-24}
                        textAnchor="middle"
                        fontSize={22}
                        fontWeight={800}
                        fill={INK}
                        stroke={PAPER}
                        strokeWidth={6}
                        paintOrder="stroke"
                      >
                        {m.etiqueta}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Rosa del nord: fixa a la cantonada, no fa zoom. La imatge està girada. */}
          <svg
            viewBox="-80 -80 160 160"
            className="pointer-events-none absolute right-2.5 top-2.5 h-12 w-12"
            role="img"
            aria-label="Nord"
          >
            <g transform={`rotate(${-ANGLE_GRAUS})`}>
              <circle r={70} fill={PAPER} stroke={INK} strokeWidth={8} opacity={0.9} />
              <path d="M 0 -52 L 22 20 L 0 8 L -22 20 Z" fill={INK} />
              <text y={48} textAnchor="middle" fontSize={34} fontWeight={800} fill={INK}>
                N
              </text>
            </g>
          </svg>

          {/* Controls a l'abast del polze: sempre visibles, mínim 48px */}
          <div className="absolute left-2.5 top-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setPantallaCompleta((p) => !p)}
              aria-label={pantallaCompleta ? "Tancar el mapa gran" : "Veure el mapa en gran"}
              className="btn btn-secundari btn-rodo text-xl"
            >
              {pantallaCompleta ? "✕" : <IconaAmpliar />}
            </button>
            {zoom > 1 && (
              <button
                type="button"
                onClick={reiniciar}
                aria-label="Tornar a veure tot el mapa"
                className="btn btn-secundari btn-rodo text-xl"
              >
                <IconaReiniciar />
              </button>
            )}
          </div>
        </div>
        {pantallaCompleta && (
          <p className="pt-2 text-center text-base font-bold text-paper">
            Pessigueu per apropar · arrossegueu per moure-us
          </p>
        )}
      </div>
    </>
  );
}

function IconaAmpliar() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

function IconaReiniciar() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
    </svg>
  );
}

/** Camí d'un equip: línia vermella amb vora fosca (es veu sobre l'ortofoto) i l'inici marcat. */
function Cami({ punts, escala }: { punts: { lat: number; lng: number }[]; escala: number }) {
  const svg = punts.map((p) => aPixel(p.lat, p.lng));
  const traca = svg.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const inici = svg[0];
  const final = svg[svg.length - 1];
  return (
    <g aria-label="Recorregut de l'equip" pointerEvents="none">
      <polyline points={traca} fill="none" stroke={INK} strokeWidth={10 * escala} strokeLinejoin="round" strokeLinecap="round" />
      <polyline
        points={traca}
        fill="none"
        stroke={BLOOD}
        strokeWidth={5 * escala}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {svg.length > 1 &&
        svg.slice(1, -1).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5 * escala} fill={PAPER} />)}
      <g transform={`translate(${inici.x} ${inici.y}) scale(${escala})`}>
        <circle r={13} fill={PAPER} stroke={INK} strokeWidth={4} />
        <text textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={800} fill={INK}>
          ▶
        </text>
      </g>
      {svg.length > 1 && (
        <g transform={`translate(${final.x} ${final.y}) scale(${escala})`}>
          <circle r={11} fill={BLOOD} stroke={INK} strokeWidth={4} />
        </g>
      )}
    </g>
  );
}
