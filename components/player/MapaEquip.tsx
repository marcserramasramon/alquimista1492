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

function dinsDelMapa(lat: number, lng: number) {
  return lat >= BOUND_MIN_LAT && lat <= BOUND_MAX_LAT && lng >= BOUND_MIN_LON && lng <= BOUND_MAX_LON;
}

// Límits geogràfics del mapa il·lustrat (mateixos que l'app v1, "esta bé")
const BOUND_MIN_LON = 2.22288;
const BOUND_MIN_LAT = 41.90974;
const BOUND_MAX_LON = 2.23464;
const BOUND_MAX_LAT = 41.9166;
const SVG_W = 800;
const SVG_H = 600;
const ZOOM_MAX = 5;
/** Píxels que s'ha de moure el dit perquè un toc passi a ser arrossegar. */
const LLINDAR_ARROSSEGAR = 8;

const INK = "#1b1511";
const PAPER = "#fffdf7";
const GOLD = "#eab308";
const BLOOD = "#b3261e";

function latLonToSVG(lat: number, lon: number) {
  const x = ((lon - BOUND_MIN_LON) / (BOUND_MAX_LON - BOUND_MIN_LON)) * SVG_W;
  const y = ((BOUND_MAX_LAT - lat) / (BOUND_MAX_LAT - BOUND_MIN_LAT)) * SVG_H;
  return { x, y };
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
  // Fora dels límits del mapa il·lustrat, un marcador es queda a l'última
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
  // Mida de la finestra del mapa (px). La capa del mapa manté sempre la proporció 4:3.
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
  const capaW = mida.w > 0 && mida.h > 0 ? Math.min(mida.w, (mida.h * SVG_W) / SVG_H) : 0;
  const capaH = (capaW * SVG_H) / SVG_W;

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
  const escala = 1 / Math.sqrt(zoom);

  return (
    <>
      {/* Mentre el mapa és a pantalla completa, en reserva el lloc a la pàgina. */}
      {pantallaCompleta && (
        <div className="aspect-[4/3] w-full rounded-3xl border-[3px] border-dashed border-ink/30" aria-hidden />
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
            pantallaCompleta ? "min-h-0 flex-1 rounded-2xl" : "aspect-[4/3] rounded-3xl shadow-[0_6px_0_var(--ink)]"
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
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block h-full w-full" preserveAspectRatio="none">
              <image href="/map-test.webp" x="0" y="0" width={SVG_W} height={SVG_H} preserveAspectRatio="none" />

              {recorregut.length > 0 && <Cami punts={recorregut} escala={escala} />}

              {estacions
                .filter((e) => e.tipus !== "especial" || totesResoltes)
                // La seleccionada es pinta l'última perquè, en fer-se gran, quedi per sobre de les altres.
                .sort((a, b) => Number(a.id === seleccionadaId) - Number(b.id === seleccionadaId))
                .map((estacio) => {
                  const { x, y } = latLonToSVG(estacio.latitud, estacio.longitud);
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
                const { x, y } = latLonToSVG(m.lat, m.lng);
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
                      <circle r={18} fill="none" stroke={BLOOD} strokeWidth={4}>
                        <animate attributeName="r" values="18;36" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle r={18} fill={BLOOD} stroke={INK} strokeWidth={4} />
                      <circle r={6} fill={PAPER} />
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

/** Camí d'un equip: línia vermella amb vora fosca (es veu sobre el mapa il·lustrat) i l'inici marcat. */
function Cami({ punts, escala }: { punts: { lat: number; lng: number }[]; escala: number }) {
  const svg = punts.map((p) => latLonToSVG(p.lat, p.lng));
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
