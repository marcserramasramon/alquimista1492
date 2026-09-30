"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPantallaCompleta } from "@/components/ui/VideoPantallaCompleta";
import { VistaMissatge } from "@/components/vistes/VistaMissatge";

const VIDEO_CARTA = "/video/intro-carta.mp4";

export function MissatgeSecret({ tornada }: { tornada: boolean }) {
  const router = useRouter();
  // El vídeo surt sol en obrir la carta per primera vegada; si s'hi torna des del mapa, només amb el botó.
  const [veientVideo, setVeientVideo] = useState(!tornada);

  if (veientVideo) return <VideoPantallaCompleta src={VIDEO_CARTA} onAcabat={() => setVeientVideo(false)} />;

  return (
    <VistaMissatge
      textContinuar={tornada ? "← Tornar al mapa" : undefined}
      onContinuar={() => router.push("/joc")}
      onRepetirVideo={() => setVeientVideo(true)}
    />
  );
}
