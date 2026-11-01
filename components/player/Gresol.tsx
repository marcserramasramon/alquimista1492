"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { preload } from "react-dom";
import { VistaFinal } from "@/components/vistes/VistaFinal";
import { VistaGuardians } from "@/components/vistes/VistaGuardians";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";
import { ConjuncioAR } from "@/components/ar/conjuncio/ConjuncioAR";
import type { Element } from "@/content/public/estacions";
import { GUARDIANS } from "@/content/public/textos";
import { carregarVeu } from "@/lib/so";

const VIDEO_FINAL = "/video/final-guardians.mp4";

/** Si el mòbil recarrega la pàgina enmig del ritual, no torna a la pantalla d'espera. */
const CLAU_RITUAL = "sentfores:gresol-ritual";

/** Cada quant es pregunta si Fra Francesc ja ha consagrat l'equip (quan s'encén el LED del Gresol). */
const INTERVAL_MS = 4_000;

function llegirRitualGuardat(): boolean {
  try {
    return sessionStorage.getItem(CLAU_RITUAL) === "1";
  } catch {
    // Sense emmagatzematge (navegació privada...): es comença per l'arribada.
    return false;
  }
}

const senseSubscripcio = () => () => {};

/** Vídeo final a pantalla completa. En acabar, es crida `onAcabat` (la pantalla següent són els guardians). */
function VideoFinal({ onAcabat }: { onAcabat: () => void }) {
  return (
    <main className="fixed inset-0 bg-black">
      <video
        src={VIDEO_FINAL}
        autoPlay
        playsInline
        preload="auto"
        onEnded={onAcabat}
        onError={onAcabat}
        className="h-full w-full object-contain"
      />
    </main>
  );
}

export function Gresol() {
  const router = useRouter();
  const guardat = useSyncExternalStore(senseSubscripcio, llegirRitualGuardat, () => false);
  const [comencat, setComencat] = useState(false);
  /** L'equip ha passat del ritual (fragments) a l'AR de la Conjunció. */
  const [enAr, setEnAr] = useState(false);
  const [guardians, setGuardians] = useState(false);
  /** Després de l'AR (gema i botó de continuar): el vídeo final, i després la pantalla dels guardians. */
  const [videoFinal, setVideoFinal] = useState(false);
  const [videoAcabat, setVideoAcabat] = useState(false);
  /** undefined = carregant; null = no s'ha pogut saber (es mostren tots). */
  const [aconseguits, setAconseguits] = useState<Element[] | null | undefined>(undefined);

  // Si s'ha acabat el temps abans de trobar-los tots, només surten els elements aconseguits.
  useEffect(() => {
    let cancelat = false;
    fetch("/api/estat", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data: { estacions: { element?: Element; progres: { resolta: boolean } }[] } = await res.json();
        const elements = data.estacions.flatMap((e) => (e.element && e.progres.resolta ? [e.element] : []));
        if (!cancelat) setAconseguits(elements);
      })
      .catch(() => {
        if (!cancelat) setAconseguits(null);
      });
    return () => {
      cancelat = true;
    };
  }, []);

  // El LED s'encén sol amb l'aigua salada; qui fa passar l'equip a la pantalla final és el frare, des del màster.
  useEffect(() => {
    let cancelat = false;
    const consultar = () =>
      fetch("/api/partida", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok || cancelat) return;
          const data: { guardians: boolean } = await res.json();
          if (!cancelat) setGuardians(data.guardians);
        })
        .catch(() => {});
    consultar();
    const interval = setInterval(consultar, INTERVAL_MS);
    return () => {
      cancelat = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (guardians) window.scrollTo({ top: 0 });
  }, [guardians]);

  // Mentre dura l'AR ja es descarrega el vídeo final i la veu dels guardians, perquè sonin a l'instant.
  useEffect(() => {
    if (!enAr) return;
    preload(VIDEO_FINAL, { as: "video" });
    if (GUARDIANS.audio) void carregarVeu(GUARDIANS.audio);
  }, [enAr]);

  function comencarRitual() {
    setComencat(true);
    try {
      sessionStorage.setItem(CLAU_RITUAL, "1");
    } catch {
      // Només és una comoditat.
    }
    window.scrollTo({ top: 0 });
  }

  if (guardians || videoAcabat) return <VistaGuardians videoJaVist={videoAcabat} />;
  if (videoFinal) return <VideoFinal onAcabat={() => setVideoAcabat(true)} />;
  if (enAr) return <ConjuncioAR onContinuar={() => setVideoFinal(true)} />;
  if (aconseguits === undefined) return <VistaCarregant />;
  // Arribada → ritual (fragments i estrelles) → AR de la Conjunció → vídeo → guardians.
  return (
    <VistaFinal
      ritual={comencat || guardat}
      onComencarRitual={comencarRitual}
      onComencarAr={() => setEnAr(true)}
      onTornar={() => router.push("/joc")}
      aconseguits={aconseguits ?? undefined}
    />
  );
}
