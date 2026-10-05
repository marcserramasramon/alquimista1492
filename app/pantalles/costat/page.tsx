/** Les escenes del manual d'ús, una al costat de l'altra, en marcs de mòbil (eina de desenvolupament). */
const ESCENES = [
  { id: "manual-hub", titol: "1 · El hub" },
  { id: "manual-arribar", titol: "2 · Arribar a la fita" },
  { id: "manual-resoldre", titol: "3 · Resoldre la fita" },
];

const ESCALA = 0.5;
const AMPLE = 375;
const ALCADA = 812;

export default function CostatPage() {
  return (
    <main className="flex h-dvh items-start justify-center gap-6 overflow-clip bg-[#2a2420] p-6">
      {ESCENES.map((escena) => (
        <figure key={escena.id} className="flex flex-col items-center gap-2">
          <figcaption className="font-sans text-base font-extrabold text-white">{escena.titol}</figcaption>
          <div style={{ width: AMPLE * ESCALA + 16, height: ALCADA * ESCALA + 16 }}>
            <iframe
              src={`/pantalles/vista/${escena.id}`}
              title={escena.titol}
              className="rounded-[2rem] border-8 border-black bg-white"
              style={{
                width: AMPLE + 16,
                height: ALCADA + 16,
                transform: `scale(${ESCALA})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        </figure>
      ))}
    </main>
  );
}
