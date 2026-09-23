import { ELEMENTS, getEstacio } from "@/content/public/estacions";
import { distanciaMetres } from "@/lib/ubicacio";

export interface DadesRecorregut {
  iniciAt: string | null;
  guardiansAt: string | null;
  punts: { lat: number; lng: number; t: string }[];
  fites: { estacioId: string; obertaAt: string | null; resoltaAt: string | null }[];
}

export interface PanellRecorregutProps {
  /** Equips que es poden triar (els que tenen mòbil). */
  equips: { id: string; name: string; imatge: string }[];
  /** Equip triat; null = cap recorregut al mapa. */
  triatId: string | null;
  /** null mentre es carrega. */
  dades: DadesRecorregut | null;
  onTriar: (teamId: string | null) => void;
}

interface Fet {
  t: string;
  icona: string;
  text: string;
  destacat?: boolean;
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
}

function minutsDes(inici: string | null, iso: string) {
  if (!inici) return null;
  const min = Math.round((Date.parse(iso) - Date.parse(inici)) / 60_000);
  return min >= 0 ? `+${min} min` : null;
}

function fetsDe(dades: DadesRecorregut): Fet[] {
  const fets: Fet[] = [];
  if (dades.iniciAt) fets.push({ t: dades.iniciAt, icona: "▶", text: "Inici de la partida" });
  for (const fita of dades.fites) {
    const estacio = getEstacio(fita.estacioId);
    const nom = estacio?.element ? ELEMENTS[estacio.element].nom : (estacio?.nom ?? fita.estacioId);
    const icona = estacio?.element ? ELEMENTS[estacio.element].icona : "✦";
    if (fita.obertaAt) fets.push({ t: fita.obertaAt, icona, text: `Arriben a ${nom}` });
    if (fita.resoltaAt) fets.push({ t: fita.resoltaAt, icona, text: `Resolen ${nom}`, destacat: true });
  }
  if (dades.guardiansAt) fets.push({ t: dades.guardiansAt, icona: "✨", text: "Consagrats Guardians del Secret", destacat: true });
  return fets.sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
}

function kmRecorreguts(punts: DadesRecorregut["punts"]) {
  let metres = 0;
  for (let i = 1; i < punts.length; i++) metres += distanciaMetres(punts[i - 1], punts[i]);
  return (metres / 1000).toLocaleString("ca-ES", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

/** Només per al màster: triar un equip per veure'n el camí al mapa i els temps de cada fita. */
export function PanellRecorregut({ equips, triatId, dades, onTriar }: PanellRecorregutProps) {
  const triat = equips.find((e) => e.id === triatId) ?? null;
  const fets = dades ? fetsDe(dades) : [];

  return (
    <div className="flex flex-col gap-3">
      <p className="etiqueta">recorregut d&apos;un equip</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onTriar(null)}
          aria-pressed={triatId === null}
          className={`min-h-12 shrink-0 rounded-xl border-[3px] border-ink px-3 text-base font-extrabold ${
            triatId === null ? "bg-ink text-gold" : "bg-[#fffdf7]"
          }`}
        >
          Cap
        </button>
        {equips.map((equip) => (
          <button
            key={equip.id}
            type="button"
            onClick={() => onTriar(equip.id)}
            aria-pressed={triatId === equip.id}
            aria-label={equip.name}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink ${
              triatId === equip.id ? "bg-ink" : "bg-[#fffdf7]"
            }`}
          >
            <img src={equip.imatge} alt="" className="h-9 w-9" />
          </button>
        ))}
      </div>

      {triat && (
        <div className="targeta p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xl font-extrabold leading-tight">{triat.name}</p>
            {dades && dades.punts.length > 1 && (
              <p className="shrink-0 text-base text-ink-soft">
                <strong className="text-ink">{kmRecorreguts(dades.punts)} km</strong> · {dades.punts.length} punts
              </p>
            )}
          </div>

          {!dades && <p className="etiqueta mt-3">carregant...</p>}
          {dades && dades.punts.length === 0 && (
            <p className="mt-3 text-base text-ink-soft">
              Encara no hi ha cap posició desada (l&apos;equip no comparteix el GPS o la partida no ha començat).
            </p>
          )}
          {fets.length > 0 && (
            <ol className="mt-3 flex flex-col gap-2">
              {fets.map((fet) => (
                <li key={`${fet.t}-${fet.text}`} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-display text-xl font-extrabold tabular-nums">{hora(fet.t)}</span>
                  {fet.icona.startsWith("/") ? (
                    <img src={fet.icona} alt="" className="h-7 w-7 shrink-0" />
                  ) : (
                    <span aria-hidden className="w-7 shrink-0 text-center text-lg">
                      {fet.icona}
                    </span>
                  )}
                  <span className={`flex-1 text-base leading-tight ${fet.destacat ? "font-extrabold" : ""}`}>{fet.text}</span>
                  <span className="shrink-0 text-sm text-ink-soft">{minutsDes(dades?.iniciAt ?? null, fet.t)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
