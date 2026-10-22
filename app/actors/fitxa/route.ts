import { readFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { COOKIE_ACTORS, fitxaAcces } from "@/lib/actors-acces";

/** Serveix el contingut de la pàgina d'actors només a qui ha posat la contrasenya. */
export async function GET() {
  const esperat = fitxaAcces();
  const store = await cookies();
  if (!esperat || store.get(COOKIE_ACTORS)?.value !== esperat) {
    return new Response("No autoritzat", { status: 401 });
  }
  const html = await readFile(path.join(process.cwd(), "content", "private", "actors.html"), "utf8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
