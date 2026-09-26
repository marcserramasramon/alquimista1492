import { Pantalla } from "@/components/ui/Pantalla";
import { getEstacio } from "@/content/public/estacions";
import { POEMES_CARTELLS } from "@/content/public/cartells";

/**
 * Pantalla de revisió (dev): tots els textos de la fita de l'Aire que s'han
 * tocat en moure la coordenada al cim del turó (2026-09-26). Llegeix el
 * contingut real de content/public/, no una còpia: si es torna a editar el
 * text, aquesta pantalla ja mostra la versió nova.
 */
export function VistaTextosEditats() {
  const estacio = getEstacio("aire");
  const poema = POEMES_CARTELLS.aire;
  if (!estacio) return null;

  return (
    <Pantalla className="max-w-lg gap-5">
      <header>
        <p className="etiqueta text-ink-soft">Pantalla de revisió · només dev</p>
        <h1 className="font-display text-3xl font-extrabold">Textos editats · Fita de l&apos;Aire</h1>
        <p className="mt-2 text-sm leading-snug text-ink-soft">
          Coordenades noves (2026-09-26, v2): la creu física no es mou, però el punt de joc (i el
          truc del vidre) puja al cim del turó. Aquí sota, tots els textos que calia revisar
          després d&apos;aquest canvi.
        </p>
      </header>

      <Bloc font="content/public/estacions.ts" etiqueta="situacio — el 📍 sota el nom de la fita a l'app" nou>
        {estacio.situacio}
      </Bloc>
      <Bloc font="content/public/estacions.ts" etiqueta="entrada — missatge d'obertura (sense canvis)">
        {estacio.entrada}
      </Bloc>
      <Bloc font="content/public/cartells.ts" etiqueta="lema — cartells de propaganda (sense canvis)">
        {poema.lema}
      </Bloc>
      <Bloc font="content/public/cartells.ts" etiqueta="paragrafs[0] — NOU: excusa perquè continuïn fins al cim" nou>
        {poema.paragrafs[0]}
      </Bloc>
      <Bloc font="content/public/cartells.ts" etiqueta="paragrafs[1] — mecànica del truc del vidre (sense canvis)">
        {poema.paragrafs[1]}
      </Bloc>

      {poema.pendent && (
        <p className="rounded-2xl border-[3px] border-blood bg-[#fde8e6] p-3 text-sm font-bold text-blood">
          ⚠️ Pendent, sense relació amb la ubicació: {poema.pendent}
        </p>
      )}
    </Pantalla>
  );
}

function Bloc({
  font,
  etiqueta,
  nou = false,
  children,
}: {
  font: string;
  etiqueta: string;
  nou?: boolean;
  children: string;
}) {
  return (
    <div className={`rounded-2xl border-[3px] p-3 ${nou ? "border-gold-deep bg-[#fff7df]" : "border-ink bg-paper"}`}>
      <p className="etiqueta text-ink-soft">{font}</p>
      <p className="text-sm font-bold">{etiqueta}</p>
      <p className="mt-1 text-base leading-snug">{children}</p>
    </div>
  );
}
