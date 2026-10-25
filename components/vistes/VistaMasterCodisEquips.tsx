import Link from "next/link";

export interface CartellEquip {
  nom: string;
  codi: string;
  /** SVG del QR (generat al servidor amb `qrSvg`). */
  svg: string;
}

/** Els QR i els codis de cada equip: el màster els imprimeix i els dona als jugadors. */
export function VistaMasterCodisEquips({ cartells }: { cartells: CartellEquip[] }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="print:hidden">
        <Link href="/master" className="btn btn-secundari mb-4 w-auto px-4 text-base">
          ← Panell
        </Link>
        <p className="etiqueta">màster</p>
        <h1 className="text-5xl font-extrabold">Codis dels equips</h1>
        <p className="mt-2 text-lg text-ink-soft">
          Cada equip escaneja el seu QR o entra el codi a mà. Imprimiu-los i doneu-los als jugadors; no els compartiu entre equips.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cartells.map((c) => (
          <li key={c.codi} className="flex break-inside-avoid flex-col items-center gap-2 rounded-2xl border-2 border-ink bg-white p-3 text-center">
            <p className="text-sm font-bold leading-tight">{c.nom}</p>
            <div className="w-full max-w-40 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: c.svg }} />
            <p className="font-mono text-lg font-extrabold tracking-[0.2em]">{c.codi}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
