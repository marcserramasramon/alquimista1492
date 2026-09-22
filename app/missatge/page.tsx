import { MissatgeSecret } from "@/components/player/MissatgeSecret";

/** Missatge secret: després del consentiment d'ubicació. Des del hub s'hi torna amb ?tornada=1. */
export default async function MissatgePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tornada } = await searchParams;
  return <MissatgeSecret tornada={tornada === "1"} />;
}
