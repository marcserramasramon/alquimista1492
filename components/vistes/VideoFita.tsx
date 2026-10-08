"use client";

import { useEffect, useRef } from "react";
import { marcarEscoltada } from "@/components/ui/Narracio";
import { sonarVeu } from "@/lib/so";
import { useSoVideo } from "@/lib/useSoVideo";

export interface VideoFitaProps {
  /** Ruta a public/video/ del vídeo de la fita (fita-aigua.mp4...). Sense el fitxer, s'obvia. */
  video: string;
  /** Veu del fragment (public/audio/fragment-*.mp3): sona des del primer moment i no s'atura amb el vídeo. */
  veu?: string;
  /** El vídeo té el seu so ambient a part (/audio/video/*.mp3); sona al 33%, sota la veu. Els d'arribada no en tenen: només la veu. */
  ambient?: boolean;
  /** Text per a lectors de pantalla. */
  etiqueta?: string;
  onAcabat: () => void;
}

/** Xarxa de seguretat (autoplay bloquejat sense error): com a CelebracioEstrella. */
const RESERVA_MAXIMA_MS = 20_000;
/** Xarxa de seguretat un cop acabat el vídeo: màxim que s'espera la veu (si el context d'àudio es queda suspès, mai acabaria). */
const RESERVA_VEU_MS = 90_000;

/**
 * Vídeo de la fita resolta, entre la pantalla de fita completa (CelebracioFragment) i la de la fita
 * amb el text del fragment. La veu del fragment arrenca amb el vídeo; quan el vídeo s'acaba, es queda
 * congelat a l'últim fotograma fins que la veu acaba, i només llavors es passa a la pantalla de la fita.
 * Si el fitxer de vídeo no hi és o falla, `onAcabat` es crida de seguida i la veu continua a la fita.
 */
export function VideoFita({ video, veu, ambient = false, etiqueta = "Vídeo del fragment trobat", onAcabat }: VideoFitaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const acabatCridat = useRef(false);
  useSoVideo(videoRef, video, { volum: 0.33, actiu: ambient });

  function acabar() {
    if (acabatCridat.current) return;
    acabatCridat.current = true;
    onAcabat();
  }

  // Mentre la veu no ha acabat (o no se sap si sonarà), el vídeo acabat es queda congelat a l'últim fotograma.
  const veuPendent = useRef(!!veu);
  const videoAcabat = useRef(false);

  function provarAcabar() {
    if (videoAcabat.current && !veuPendent.current) acabar();
  }

  useEffect(() => {
    if (!veu) return;
    veuPendent.current = true;
    marcarEscoltada(veu);
    void sonarVeu(veu, 0, () => {
      veuPendent.current = false;
      provarAcabar();
    }).then((reproduccio) => {
      // Sense fitxer o sense àudio disponible: no hi ha res a esperar.
      if (reproduccio) return;
      veuPendent.current = false;
      provarAcabar();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veu]);

  // Els listeners es lliguen abans de fixar `src`: un 404 pot disparar "error" abans que React l'enllaci.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    let reserva = setTimeout(acabar, RESERVA_MAXIMA_MS);
    // Vídeo fallit (sense fitxer, corrupte): no hi ha fotograma a congelar, es passa de seguida.
    const enError = () => {
      clearTimeout(reserva);
      acabar();
    };
    // Vídeo acabat: es queda l'últim fotograma fins que la veu s'acabi. La reserva cobreix una veu que no arribi mai al final.
    const enAcabar = () => {
      clearTimeout(reserva);
      videoAcabat.current = true;
      reserva = setTimeout(acabar, RESERVA_VEU_MS);
      provarAcabar();
    };
    // Ha arrencat: la reserva inicial (pensada per a un autoplay que no arrenca) ja no val, o tallaria
    // els vídeos de més de RESERVA_MAXIMA_MS. Ara es dona la durada del vídeo més el mateix marge.
    const enReproduir = () => {
      clearTimeout(reserva);
      reserva = setTimeout(acabar, (Number.isFinite(el.duration) ? el.duration * 1000 : 0) + RESERVA_MAXIMA_MS);
    };
    el.addEventListener("error", enError);
    el.addEventListener("ended", enAcabar);
    el.addEventListener("playing", enReproduir, { once: true });
    el.src = video;
    el.load();
    // El vídeo va mut (el so ambient, si en té, el posa useSoVideo): l'autoplay no es pot bloquejar.
    el.play().catch(() => {});
    return () => {
      el.removeEventListener("error", enError);
      el.removeEventListener("ended", enAcabar);
      el.removeEventListener("playing", enReproduir);
      clearTimeout(reserva);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  return (
    <div role="status" aria-label={etiqueta} className="fixed inset-0 z-50 overflow-hidden bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline />
    </div>
  );
}
