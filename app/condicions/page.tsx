import type { Metadata } from "next";
import Link from "next/link";
import { Pantalla, Marca } from "@/components/ui/Pantalla";

export const metadata: Metadata = {
  title: "Condicions | Els Guardians del Secret de Sentfores",
  description: "Condicions de participació i privacitat d'Els Guardians del Secret de Sentfores.",
};

function Apartat({ titol, children }: { titol: string; children: React.ReactNode }) {
  return (
    <section className="targeta flex flex-col gap-2 px-5 py-4">
      <h2 className="text-xl font-extrabold">{titol}</h2>
      <div className="flex flex-col gap-2 text-base leading-snug text-ink-soft">{children}</div>
    </section>
  );
}

export default function CondicionsPage() {
  return (
    <Pantalla className="gap-6 pb-10">
      <div className="animate-entrar pt-4">
        <Marca petita />
      </div>

      <p className="etiqueta text-center">condicions de participació i privacitat</p>

      <div className="flex flex-col gap-4">
        <Apartat titol="Una història inventada">
          <p>
            Aquest joc és una obra de ficció. S&apos;ambienta en un fet històric real &mdash; la Guerra dels Remences,
            any 1472 &mdash; però la trama, els personatges, els diàlegs i els noms que hi apareixen són totalment
            inventats. Qualsevol semblança amb persones reals, vives o mortes, és pura coincidència.
          </p>
        </Apartat>

        <Apartat titol="Contingut generat amb IA">
          <p>
            Part dels textos, veus i/o imatges d&apos;aquest joc s&apos;han creat amb el suport d&apos;eines
            d&apos;intel·ligència artificial, com a ajuda en la producció del material.
          </p>
        </Apartat>

        <Apartat titol="Menors d'edat">
          <p>
            És una activitat pensada per jugar-se en família o en grup. Els menors d&apos;edat només hi poden
            participar acompanyats i sota la responsabilitat d&apos;una persona adulta (mare, pare, tutor legal o
            responsable del grup), que dona el consentiment per la seva participació i en supervisa el joc en tot
            moment.
          </p>
        </Apartat>

        <Apartat titol="Activitat física a l'exterior">
          <p>
            El joc es fa caminant pel poble de Sentfores i el seu entorn, en alguns casos de nit i per terreny
            irregular. Cada participant (o, si és menor, la persona adulta responsable) hi pren part sota la seva
            pròpia responsabilitat, i ha d&apos;adaptar el ritme i el recorregut a les seves capacitats físiques.
          </p>
        </Apartat>

        <Apartat titol="Ubicació (GPS)">
          <p>
            Just abans de començar, l&apos;app demana permís per compartir la ubicació del mòbil. És totalment
            opcional: si el denegueu, el joc funciona igual. Si l&apos;accepteu, la posició de l&apos;equip
            s&apos;utilitza únicament per mostrar el vostre recorregut al mapa del joc i al mòbil de l&apos;organització
            durant la partida, i es conserva només mentre dura l&apos;organització d&apos;aquest esdeveniment.
          </p>
        </Apartat>

        <Apartat titol="El vostre nom a la partida">
          <p>
            El nom o identificador que feu servir per identificar l&apos;equip durant el joc el trieu vosaltres: no
            cal &mdash; ni es demana &mdash; el vostre nom real.
          </p>
        </Apartat>

        <Apartat titol="Contacte">
          <p>
            Per qualsevol dubte sobre aquestes condicions o sobre les vostres dades, podeu contactar amb
            l&apos;organització del joc.
          </p>
        </Apartat>
      </div>

      <Link href="/" className="btn btn-secundari">
        ← Tornar
      </Link>
    </Pantalla>
  );
}
