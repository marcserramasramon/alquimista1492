"use client";

import Image from "next/image";

interface Station {
  name: string;
  element: string;
  coords: [number, number];
  angle: number;
  emoji: string;
  color: string;
}

const STATIONS: Station[] = [
  {
    name: "Entrada del poble",
    element: "Foc",
    coords: [41.915419, 2.231577],
    angle: 59,
    emoji: "🔥",
    color: "bg-red-500",
  },
  {
    name: "Font del Ferro",
    element: "Aigua",
    coords: [41.914816, 2.227479],
    angle: 125,
    emoji: "💧",
    color: "bg-blue-500",
  },
  {
    name: "Creu del Pujolar",
    element: "Aire",
    coords: [41.910894, 2.224434],
    angle: 207,
    emoji: "🌬️",
    color: "bg-sky-400",
  },
  {
    name: "Dunes d'asfalt",
    element: "Ànima",
    coords: [41.910355, 2.230083],
    angle: 282,
    emoji: "✨",
    color: "bg-purple-500",
  },
  {
    name: "Planes Bones",
    element: "Terra",
    coords: [41.912256, 2.233469],
    angle: 351,
    emoji: "🪨",
    color: "bg-amber-700",
  },
];

const CENTER = { coords: [41.913130, 2.229789], name: "Pla del Masset" };

export default function GresolPentagram() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 gap-8">
      {/* Títol */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-300 mb-2">
          El Gresol dels Cinc Elements
        </h1>
        <p className="text-lg md:text-xl text-amber-100">
          Ritual al centre del pentagrama alquímic
        </p>
      </div>

      {/* Contenidor del pentagrama */}
      <div className="relative w-full max-w-2xl aspect-square">
        {/* SVG del pentagrama */}
        <svg
          viewBox="0 0 500 500"
          className="absolute inset-0 w-full h-full"
          style={{
            filter: "drop-shadow(0 0 20px rgba(217, 119, 6, 0.3))",
          }}
        >
          {/* Pentagrama (5 línies que connecten els punts) */}
          <line
            x1="250"
            y1="50"
            x2="80"
            y2="380"
            stroke="#daa520"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="80"
            y1="380"
            x2="190"
            y2="100"
            stroke="#daa520"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="190"
            y1="100"
            x2="420"
            y2="380"
            stroke="#daa520"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="420"
            y1="380"
            x2="310"
            y2="100"
            stroke="#daa520"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="310"
            y1="100"
            x2="250"
            y2="50"
            stroke="#daa520"
            strokeWidth="2"
            opacity="0.5"
          />

          {/* Cercle exterior */}
          <circle
            cx="250"
            cy="250"
            r="180"
            fill="none"
            stroke="#d4af37"
            strokeWidth="2"
            opacity="0.4"
          />

          {/* Marques dels 5 punts (els vèrtexs del pentagrama) */}
          {[
            { x: 250, y: 50 },
            { x: 80, y: 380 },
            { x: 190, y: 100 },
            { x: 420, y: 380 },
            { x: 310, y: 100 },
          ].map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="8"
              fill="#fbbf24"
              opacity="0.7"
            />
          ))}

          {/* Centre del pentagrama */}
          <circle cx="250" cy="250" r="6" fill="#fcd34d" opacity="1" />
        </svg>

        {/* Imatge del Gresol (GIF) al centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src="/gresol-hexaedre.gif"
              alt="Hexaedre animat del Gresol"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Etiquetes dels 5 elements als vèrtexs */}
        <div className="absolute inset-0">
          {/* Foc - dalt dreta */}
          <div className="absolute top-4 right-12 md:top-8 md:right-16 text-center">
            <div className="text-2xl md:text-3xl">🔥</div>
            <div className="text-xs md:text-sm text-red-400 font-semibold">
              Foc
            </div>
            <div className="text-xs text-red-300">1</div>
          </div>

          {/* Aigua - esquerra */}
          <div className="absolute left-4 md:left-8 top-1/3 text-center">
            <div className="text-2xl md:text-3xl">💧</div>
            <div className="text-xs md:text-sm text-blue-400 font-semibold">
              Aigua
            </div>
            <div className="text-xs text-blue-300">1</div>
          </div>

          {/* Aire - esquerra baix */}
          <div className="absolute left-2 md:left-4 bottom-8 md:bottom-12 text-center">
            <div className="text-2xl md:text-3xl">🌬️</div>
            <div className="text-xs md:text-sm text-sky-400 font-semibold">
              Aire
            </div>
            <div className="text-xs text-sky-300">4</div>
          </div>

          {/* Ànima - dreta baix */}
          <div className="absolute right-2 md:right-4 bottom-8 md:bottom-12 text-center">
            <div className="text-2xl md:text-3xl">✨</div>
            <div className="text-xs md:text-sm text-purple-400 font-semibold">
              Ànima
            </div>
            <div className="text-xs text-purple-300">5</div>
          </div>

          {/* Terra - dalt */}
          <div className="absolute top-8 md:top-12 right-16 md:right-20 text-center">
            <div className="text-2xl md:text-3xl">🪨</div>
            <div className="text-xs md:text-sm text-amber-700 font-semibold">
              Terra
            </div>
            <div className="text-xs text-amber-600">3</div>
          </div>
        </div>
      </div>

      {/* Informació de l'estació central */}
      <div className="max-w-2xl bg-slate-800/70 border-2 border-amber-600 rounded-lg p-6 backdrop-blur">
        <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-3">
          Centre del Pentagrama
        </h2>
        <p className="text-sm md:text-base text-amber-100 mb-4 leading-relaxed">
          <strong className="text-amber-300">Pla del Masset</strong> — Aquí es
          reuneixen els Guardians del Secret per realitzar el ritual final. Els
          cinc elements es combinen en ordre: Aigua (1) → Foc (2) → Terra (3) →
          Aire (4) → Ànima (5).
        </p>
        <div className="space-y-2 text-xs md:text-sm text-amber-100">
          <p>
            <span className="text-amber-400 font-semibold">Coordenades:</span>{" "}
            41.9131°N, 2.2298°E
          </p>
          <p>
            <span className="text-amber-400 font-semibold">Ritual:</span> En
            aboquem els 5 líquids dins el gresol en l'ordre correcte, s'il·lumina
            la Pedra Filosofal.
          </p>
          <p>
            <span className="text-amber-400 font-semibold">Desenllaç:</span>{" "}
            Reconeixement final per Fra Francesc de Sentfores.
          </p>
        </div>
      </div>
    </div>
  );
}
