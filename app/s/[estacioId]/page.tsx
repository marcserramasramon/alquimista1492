"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInputAnswerGame } from "@/components/games/InputAnswerGame";
import { VistaEstacio, type EstacioPublica } from "@/components/vistes/VistaEstacio";
import { CelebracioEstrella } from "@/components/vistes/CelebracioEstrella";
import { VideoFita } from "@/components/vistes/VideoFita";
import { GuiaManual } from "@/components/player/GuiaManual";
import { FRAGMENTS, MANUAL_RESOLDRE } from "@/content/public/textos";
import { aturarVeu } from "@/lib/so";

interface EstacioData {
  estacio: EstacioPublica;
  pistesDesbloquejades: string[];
  resolta: boolean;
}

const ESCENES_MANUAL = [MANUAL_RESOLDRE];

export default function EstacioPage() {
  const params = useParams();
  const router = useRouter();
  const estacioId = params.estacioId as string;

  const [dades, setDades] = useState<EstacioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolta, setResolta] = useState(false);
  // Aquesta resposta ha completat les cinc fites elementals: en tornar al mapa, primer es veu
  // la celebració de l'estrella completa (CelebracioEstrella) en lloc d'anar-hi directes.
  const [estrellaCompletada, setEstrellaCompletada] = useState(false);
  const [mostrarEstrella, setMostrarEstrella] = useState(false);
  // Entre la celebració i el fragment: el vídeo de la fita, amb la veu del fragment sonant.
  const [veientVideo, setVeientVideo] = useState(false);
  // En obrir la fita per primer cop (QR o GPS): el vídeo d'arribada de Fra Francesc, amb la veu dins.
  const [veientArribada, setVeientArribada] = useState(false);
  // La fita té el seu vídeo d'arribada (public/video/arribada-fita-*.mp4): el botó de veu passa a ser un play.
  const [hiHaArribada, setHiHaArribada] = useState(false);

  const { setPistesDesbloquejades, ...joc } = useInputAnswerGame({
    estacioId,
    // Després de la celebració, el vídeo de la fita i, en acabar, la mateixa pantalla mostra el fragment.
    onResolt: (totesResoltes) => {
      setVeientVideo(true);
      setEstrellaCompletada(totesResoltes);
    },
  });

  function acabarArribada() {
    setVeientArribada(false);
    window.scrollTo({ top: 0 });
  }

  function acabarVideo() {
    setVeientVideo(false);
    setResolta(true);
    window.scrollTo({ top: 0 });
  }

  // La veu del fragment la engega VideoFita i continua a la pantalla de la fita: s'atura en marxar.
  useEffect(() => aturarVeu, []);

  useEffect(() => {
    carregarEstacio();

    async function carregarEstacio() {
      // QR del cartell escanejat amb la càmera del mòbil: /s/{id}?c={codi}. Primer s'obre la fita.
      const codi = new URLSearchParams(window.location.search).get("c");
      if (codi) {
        window.history.replaceState(null, "", `/s/${estacioId}`);
        const res = await fetch("/api/obrir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codi, via: "qr" }),
        }).catch(() => null);
        if (res?.status === 401) {
          router.push("/");
          return;
        }
        const data = await res?.json().catch(() => null);
        if (data?.estacioId && data.estacioId !== estacioId) {
          router.replace(`/s/${data.estacioId}`);
          return;
        }
      }

      const res = await fetch(`/api/joc/${estacioId}`).catch(() => null);
      if (!res) {
        setError("Error de connexió");
        return;
      }
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) {
        // Inclou la fita encara tancada (403): cal arribar-hi o escanejar el QR des del mapa.
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No s'ha pogut carregar l'estació");
        return;
      }
      const data: EstacioData = await res.json();
      setDades(data);
      setResolta(data.resolta);
      setPistesDesbloquejades(data.pistesDesbloquejades ?? []);
      engegarArribada(data);
    }

    // Una sola vegada per sessió i fita, i només si encara no està resolta.
    async function engegarArribada(data: EstacioData) {
      const element = data.estacio.element;
      if (!element) return;
      const video = `/video/arribada-fita-${element}.mp4`;
      const hiEs = await fetch(video, { method: "HEAD" })
        .then((r) => r.ok && (r.headers.get("content-type") ?? "").startsWith("video"))
        .catch(() => false);
      if (!hiEs) return;
      setHiHaArribada(true);
      if (data.resolta) return;
      const clau = `arribada-video:${estacioId}`;
      try {
        if (sessionStorage.getItem(clau) === "1") return;
        sessionStorage.setItem(clau, "1");
      } catch {
        // Sense sessionStorage: es veurà cada cop que s'obri la fita.
      }
      setVeientArribada(true);
    }
    // setPistesDesbloquejades és un setter de useState: estable entre renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estacioId, router]);

  return (
    <>
      <VistaEstacio
        {...joc}
        estacio={dades?.estacio ?? null}
        resolta={resolta}
        error={error}
        onRepetirVideo={dades?.estacio.element ? () => setVeientVideo(true) : undefined}
        onRepetirArribada={hiHaArribada ? () => setVeientArribada(true) : undefined}
        onTornar={() => (estrellaCompletada ? setMostrarEstrella(true) : router.push("/joc"))}
      />
      {!resolta && !error && !veientArribada && !veientVideo && !mostrarEstrella && !joc.correcte && <GuiaManual escenes={ESCENES_MANUAL} />}
      {veientArribada && dades?.estacio.element && (
        <VideoFita
          video={`/video/arribada-fita-${dades.estacio.element}.mp4`}
          veu={`/audio/arribada-fita-${dades.estacio.element}.mp3`}
          etiqueta="Vídeo d'arribada: Fra Francesc"
          onAcabat={acabarArribada}
        />
      )}
      {veientVideo && dades?.estacio.element && (
        <VideoFita
          video={`/video/fita-${dades.estacio.element}.mp4`}
          veu={FRAGMENTS[dades.estacio.element].audio}
          ambient
          onAcabat={acabarVideo}
        />
      )}
      {mostrarEstrella &&<CelebracioEstrella onAcabat={() => router.push("/joc")} />}
    </>
  );
}
