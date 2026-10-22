import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ACTORS, fitxaAcces } from "@/lib/actors-acces";

export const metadata: Metadata = {
  title: "Actors · Els Guardians del Secret",
  robots: { index: false, follow: false },
};

/** Comprova la contrasenya al servidor i, si és bona, deixa la cookie que obre la pàgina. */
async function entrar(formData: FormData) {
  "use server";
  const esperat = fitxaAcces();
  const introduida = String(formData.get("contrasenya") ?? "");
  if (!esperat || introduida !== process.env.ACTORS_PASSWORD) {
    redirect("/actors?error=1");
  }
  const store = await cookies();
  store.set(COOKIE_ACTORS, esperat, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/actors",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/actors");
}

export default async function ActorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const store = await cookies();
  const esperat = fitxaAcces();
  const autoritzat = esperat !== null && store.get(COOKIE_ACTORS)?.value === esperat;

  if (autoritzat) {
    return <iframe src="/actors/fitxa" title="Actors · Els Guardians del Secret" className="h-[100svh] w-full border-0" />;
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#efe7d6] px-5 text-[#1d1b16]">
      <form action={entrar} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[#d9d2c2] bg-white p-7">
        <h1 className="text-2xl font-bold">Pàgina d&apos;actors</h1>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Contrasenya
          <input
            name="contrasenya"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-lg border border-[#d9d2c2] px-3 py-2 text-base font-normal"
          />
        </label>
        {error && <p className="text-sm text-red-700">Contrasenya incorrecta.</p>}
        <button type="submit" className="rounded-lg bg-[#9a4a1f] px-4 py-3 font-bold text-white">
          Entrar
        </button>
      </form>
    </main>
  );
}
