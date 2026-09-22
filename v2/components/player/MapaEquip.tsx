"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ELEMENTS, type Element } from "@/content/public/estacions";

export interface EstacioMapa {
  id: string;
  nom: string;
  entrada: string;
  latitud: number;
  longitud: number;
  tipus: "text" | "imatge" | "especial";
  disponible: boolean;
  element?: Element;
  progres: { resolta: boolean };
}

interface MapaEquipProps {
  estacions: EstacioMapa[];
  totesResoltes: boolean;
}

// Límits geogràfics del mapa il·lustrat (mateixos que l'app v1, "esta bé")
const BOUND_MIN_LON = 2.22288;
const BOUND_MIN_LAT = 41.90974;
const BOUND_MAX_LON = 2.23464;
const BOUND_MAX_LAT = 41.9166;
const SVG_W = 800;
const SVG_H = 600;

function latLonToSVG(lat: number, lon: number) {
  const x = ((lon - BOUND_MIN_LON) / (BOUND_MAX_LON - BOUND_MIN_LON)) * SVG_W;
  const y = ((BOUND_MAX_LAT - lat) / (BOUND_MAX_LAT - BOUND_MIN_LAT)) * SVG_H;
  return { x, y };
}

export function MapaEquip({ estacions, totesResoltes }: MapaEquipProps) {
  const router = useRouter();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
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
      const nextZoom = Math.min(Math.max(s.startZoom * (dist / s.startDist), 1), 3);
      setZoom(nextZoom);
      setPan(clampPan(s.startPanX, s.startPanY, nextZoom));
    }
  }

  const seleccionada = estacions.find((e) => e.id === seleccionadaId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-leather/40 bg-vellum"
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
              const color = estacio.progres.resolta ? "#9CA3AF" : estacio.disponible ? "#1E3A5F" : "#B0B7C3";
              return (
                <g key={estacio.id} onClick={() => setSeleccionadaId(estacio.id)} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r={16} fill={color} stroke="#C99E32" strokeWidth={2} />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={16} fill="white" fontWeight="bold">
                    {estacio.progres.resolta ? "✓" : "?"}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-leather">
          📍 Estacions del joc
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-3">
          {estacions
            .filter((e) => e.tipus !== "especial" || totesResoltes)
            .map((estacio) => {
              const element = estacio.element ? ELEMENTS[estacio.element] : null;
              return (
                <button
                  key={estacio.id}
                  onClick={() => setSeleccionadaId(estacio.id)}
                  className="flex items-center gap-2 rounded-lg border border-leather/20 bg-vellum/80 px-2 py-1.5 text-left shadow-sm transition hover:bg-vellum"
                >
                  {element ? (
                    <img src={element.icona} alt={element.nom} className="h-6 w-6 flex-shrink-0 object-contain drop-shadow-sm" />
                  ) : (
                    <span className="flex-shrink-0">
                      {estacio.progres.resolta ? "✓" : estacio.disponible ? "?" : "🔒"}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink sm:text-sm">
                      {element ? element.nom : estacio.nom}
                    </span>
                    {element && (
                      <span className="block truncate text-[11px] italic text-leather">{estacio.nom}</span>
                    )}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {seleccionada && (
        <div className="rounded-xl border-2 border-leather/40 bg-vellum p-4 shadow-md">
          <h3 className="font-serif text-lg font-bold text-ink">{seleccionada.nom}</h3>
          <p className="mt-1 text-sm text-ink/80">{seleccionada.entrada}</p>
          <button
            onClick={() => {
              if (seleccionada.tipus === "especial") router.push("/final");
              else router.push(`/s/${seleccionada.id}`);
            }}
            disabled={!seleccionada.disponible}
            className="mt-3 w-full rounded-lg bg-prussian px-4 py-3 font-bold text-parchment disabled:opacity-40"
          >
            {!seleccionada.disponible
              ? "Properament"
              : seleccionada.progres.resolta
                ? "Ja resolta ✓"
                : "Anar-hi"}
          </button>
        </div>
      )}
    </div>
  );
}
