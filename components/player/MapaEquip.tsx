"use client";

import { useRef, useState } from "react";
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
const ZOOM_MAX = 3;

const INK = "#1b1511";
const PAPER = "#fffdf7";
const GOLD = "#eab308";
const BLOOD = "#b3261e";

function latLonToSVG(lat: number, lon: number) {
  const x = ((lon - BOUND_MIN_LON) / (BOUND_MAX_LON - BOUND_MIN_LON)) * SVG_W;
  const y = ((BOUND_MAX_LAT - lat) / (BOUND_MAX_LAT - BOUND_MIN_LAT)) * SVG_H;
  return { x, y };
}

export function MapaEquip({
  estacions,
  totesResoltes,
  seleccionadaId = null,
  onSeleccionar,
  marcadors = [],
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const getMaxPan = (z: number) => {
    const el = containerRef.current;
    if (!el || z <= 1) return { maxX: 0, maxY: 0 };
    const { width, height } = el.getBoundingClientRect();
    return { maxX: (width * (z - 1)) / (2 * z), maxY: (height * (z - 1)) / (2 * z) };
  };

  const clampPan = (x: number, y: number, z: number) => {
    const { maxX, maxY } = getMaxPan(z);
    return { x: Math.min(Math.max(x, -maxX), maxX), y: Math.min(Math.max(y, -maxY), maxY) };
  };

  function canviarZoom(z: number) {
    const seguent = Math.min(Math.max(z, 1), ZOOM_MAX);
    setZoom(seguent);
    setPan((p) => clampPan(p.x, p.y, seguent));
  }

  const dragState = useRef({ mode: null as "pan" | "pinch" | null, startX: 0, startY: 0, startPanX: 0, startPanY: 0, startDist: 0, startZoom: 1 });

  function handleTouchStart(e: React.TouchEvent<SVGSVGElement>) {
    if (e.touches.length === 1) {
      dragState.current = { ...dragState.current, mode: "pan", startX: e.touches[0].clientX, startY: e.touches[0].clientY, startPanX: pan.x, startPanY: pan.y };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      dragState.current = { mode: "pinch", startX: 0, startY: 0, startPanX: pan.x, startPanY: pan.y, startDist: dist, startZoom: zoom };
    }
  }

  function handleTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    const s = dragState.current;
    if (s.mode === "pan" && e.touches.length === 1) {
      const dx = e.touches[0].clientX - s.startX;
      const dy = e.touches[0].clientY - s.startY;
      setPan(clampPan(s.startPanX + dx / zoom, s.startPanY + dy / zoom, zoom));
    } else if (s.mode === "pinch" && e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const nextZoom = Math.min(Math.max(s.startZoom * (dist / s.startDist), 1), ZOOM_MAX);
      setZoom(nextZoom);
      setPan(clampPan(s.startPanX, s.startPanY, nextZoom));
    }
  }

  // Els marcadors mantenen la mida a la pantalla encara que s'hi faci zoom.
  const escala = 1 / Math.sqrt(zoom);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border-[3px] border-ink bg-paper-2 shadow-[0_6px_0_var(--ink)]"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="block h-full w-full touch-none"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "center",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onDoubleClick={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
      >
        <image href="/map-test.webp" x="0" y="0" width={SVG_W} height={SVG_H} preserveAspectRatio="none" />

        {estacions
          .filter((e) => e.tipus !== "especial" || totesResoltes)
          .map((estacio) => {
            const { x, y } = latLonToSVG(estacio.latitud, estacio.longitud);
            const element = estacio.element ? ELEMENTS[estacio.element] : null;
            const seleccionada = estacio.id === seleccionadaId;
            const resolta = estacio.progres.resolta;
            const color = element?.color ?? GOLD;
            return (
              <g
                key={estacio.id}
                transform={`translate(${x} ${y}) scale(${escala * (seleccionada ? 1.25 : 1)})`}
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

      {/* Zoom amb una mà: botons grans a la cantonada */}
      <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => canviarZoom(zoom + 0.75)}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Apropar"
          className="btn btn-secundari btn-rodo"
        >
          +
        </button>
        {zoom > 1 && (
          <button
            type="button"
            onClick={() => canviarZoom(zoom - 0.75)}
            aria-label="Allunyar"
            className="btn btn-secundari btn-rodo"
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}
