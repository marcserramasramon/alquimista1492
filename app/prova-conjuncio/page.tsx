import { notFound } from "next/navigation";
import { ProvaConjuncio } from "./ProvaConjuncio";

/** Pàgina de prova (404 en producció): prototip visual de «La Conjunció dels Astres». */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ProvaConjuncio />;
}
