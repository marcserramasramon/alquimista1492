"use client";

import { useRouter } from "next/navigation";
import { VistaMissatge } from "@/components/vistes/VistaMissatge";

export function MissatgeSecret({ tornada }: { tornada: boolean }) {
  const router = useRouter();
  return (
    <VistaMissatge
      textContinuar={tornada ? "← Tornar al mapa" : undefined}
      onContinuar={() => router.push("/joc")}
    />
  );
}
