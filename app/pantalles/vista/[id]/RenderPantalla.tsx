"use client";

import { getPantalla, type DadesServidor } from "@/app/pantalles/pantalles";

/** Renderitza una pantalla del registre al client (les vistes reben callbacks). */
export function RenderPantalla({ id, dades }: { id: string; dades: DadesServidor }) {
  const pantalla = getPantalla(id);
  if (!pantalla) return null;
  return <>{pantalla.render(dades)}</>;
}
