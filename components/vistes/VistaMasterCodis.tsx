import Link from "next/link";
import { ELEMENTS, type Element } from "@/content/public/estacions";

export interface CodiFita {
  id: string;
  nom: string;
  element?: Element;
  codi: string;
  /** El que ha de codificar el QR del cartell. */
  url: string;
}

/** Codis dels cartells per preparar els QR (i per dictar-los si un equip té problemes). */
export function VistaMasterCodis({ fites }: { fites: CodiFita[] }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header>
        <Link href="/master" className="btn btn-secundari mb-4 w-auto px-4 text-base">
          ← Panell
        </Link>
        <p className="etiqueta">màster</p>
        <h1 className="text-5xl font-extrabold">Codis QR</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Cada cartell porta un QR amb l&apos;enllaç i, a sota, el codi escrit per entrar-lo a mà. No els ensenyeu als equips.
        </p>
        <Link href="/master/cartells" className="btn btn-primari mt-4">
          Cartells per imprimir
        </Link>
      </header>

      <ul className="flex flex-col gap-4">
        {fites.map((fita) => {
          const element = fita.element ? ELEMENTS[fita.element] : null;
          return (
            <li key={fita.id} className="targeta p-4">
              <p className="etiqueta" style={{ color: element?.color }}>
                {element?.nom ?? "fita"}
              </p>
              <h2 className="text-2xl font-extrabold">{fita.nom}</h2>
              <p className="mt-2 font-mono text-5xl font-extrabold tracking-[0.3em]">{fita.codi}</p>
              <p className="mt-2 break-all font-mono text-sm text-ink-soft">{fita.url}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
