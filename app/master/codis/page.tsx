import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMasterSessionFromCookies } from "@/lib/auth";
import { codisEquips } from "@/lib/codiEquip";
import { qrSvg } from "@/lib/qr";
import { EQUIPS } from "@/content/public/equips";

/** Els QR i els codis de tots els equips, per imprimir-los i donar-los als jugadors. */
export default async function CodisEquipsPage() {
  if (!(await getMasterSessionFromCookies())) redirect("/master");

  const capcalera = await headers();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? `${capcalera.get("x-forwarded-proto") ?? "https"}://${capcalera.get("host")}`;

  const cartells = await Promise.all(
    codisEquips().map(async ({ equip, codi }) => ({
      nom: EQUIPS.find((e) => e.id === equip)?.nom ?? equip,
      codi,
      svg: await qrSvg(`${base}/e/${codi}`),
    }))
  );

  return (
    <main className="min-h-dvh bg-paper px-4 py-6 text-ink">
      <h1 className="mb-4 text-center text-2xl font-bold print:text-lg">Codis dels equips</h1>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3">
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
