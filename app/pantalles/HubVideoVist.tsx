"use client";

import { useState } from "react";
import { VistaHub } from "@/components/vistes/VistaHub";
import { VistaMissatgeVideo } from "@/components/vistes/VistaMissatgeVideo";
import type { EstacioMapa, VideoMapa } from "@/components/player/MapaEquip";
import { MISSATGES_MASTER } from "@/content/public/missatgesMaster";

const noop = () => {};

/**
 * Hub amb la insígnia 🎥 dels vídeos de geofence ja acceptats (app/api/estat/route.ts
 * `videosVistos`): es dibuixen al punt on es van activar i, en tocar-los, es tornen a veure.
 *
 * Component client a part (i no dins de pantalles.tsx) perquè fa servir `useState`:
 * pantalles.tsx no té `"use client"` (el llegeix un Server Component per les metadades).
 */
export function HubVideoVist({ estacions, totesResoltes }: { estacions: EstacioMapa[]; totesResoltes: boolean }) {
  const [reobertId, setReobertId] = useState<string | null>(null);
  const videos: VideoMapa[] = MISSATGES_MASTER.filter((m) => m.geofence && m.video).map((m) => ({
    id: m.id,
    lat: m.geofence!.lat,
    lng: m.geofence!.lng,
    titol: m.titol,
  }));
  const reobert = reobertId ? MISSATGES_MASTER.find((m) => m.id === reobertId) : undefined;
  return (
    <>
      <VistaHub
        estacions={estacions}
        totesResoltes={totesResoltes}
        onAnarEstacio={noop}
        onAnarFinal={noop}
        onLlegirMissatge={noop}
        videos={videos}
        onSeleccionarVideo={setReobertId}
      />
      {reobert?.video && (
        <VistaMissatgeVideo
          titol={reobert.titol}
          text={reobert.text}
          video={reobert.video}
          onAcceptar={() => setReobertId(null)}
        />
      )}
    </>
  );
}
