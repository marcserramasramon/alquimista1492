"use client";

import { useEffect, useRef, useState } from "react";
import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import type { Element } from "@/content/public/estacions";
import { sonarFragment } from "@/lib/so";

export interface CelebracioEstrellaProps {
  /**
   * Ruta a public/video/ del vídeo de camí cap al Pla del Masset, de fons des del primer
   * fotograma. Sense el fitxer (encara no gravat) o si falla, l'animació del pentagrama
   * crida `onAcabat` tota sola, com fa VistaMissatgeVideo amb els missatges del màster.
   */
  video?: string;
  onAcabat: () => void;
}

/** Mateix ordre que el pentagrama (components/ui/Pentagrama.tsx ORDRE): comença a dalt i va en sentit horari. */
const ORDRE: Element[] = ["foc", "terra", "anima", "aire", "aigua"];

const RETARD_NODE_MS = 260;
const MOMENT_CENTRE_MS = ORDRE.length * RETARD_NODE_MS + 250;
const MOMENT_SORTIDA_MS = MOMENT_CENTRE_MS + 1200 + 2000;
const DURADA_SORTIDA_MS = 650;
/**
 * Últim recurs si el vídeo no arriba mai a acabar ("ended") ni a fallar ("error") — per
 * exemple, autoplay bloquejat sense error. És només una xarxa de seguretat perquè ningú es
 * quedi encallat a la pantalla, no un límit normal: als mòbils dels jugadors, a peu de carrer
 * i amb dades mòbils, el vídeo pot trigar uns segons a arrencar del tot i cal deixar-li marge.
 */
const RESERVA_MAXIMA_MS = 20_000;

/**
 * Celebració en completar les cinc fites elementals (equivalent, per a l'estrella sencera, de
 * CelebracioFragment per a una sola fita): el vídeo de camí cap al Pla del Masset és el fons
 * des del primer fotograma i, a sobre, el pentagrama s'encén punta a punta i el Gresol central
 * s'il·lumina; en acabat, el pentagrama (només ell, el text es queda quiet) fa zoom in i s'esvaeix
 * cap a la càmera, deixant veure el vídeo i el text a sobre fins que s'acaba.
 */
export function CelebracioEstrella({ video = "/video/estrella-completa.mp4", onAcabat }: CelebracioEstrellaProps) {
  const [resolts, setResolts] = useState(0);
  const [centreActiu, setCentreActiu] = useState(false);
  const [sortint, setSortint] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const acabatCridat = useRef(false);

  function acabar() {
    if (acabatCridat.current) return;
    acabatCridat.current = true;
    onAcabat();
  }

  useEffect(() => {
    sonarFragment();
    const temporitzadors = ORDRE.map((_, i) => setTimeout(() => setResolts(i + 1), (i + 1) * RETARD_NODE_MS));
    temporitzadors.push(setTimeout(() => setCentreActiu(true), MOMENT_CENTRE_MS), setTimeout(() => setSortint(true), MOMENT_SORTIDA_MS));
    return () => temporitzadors.forEach(clearTimeout);
  }, []);

  // Igual que VistaMissatgeVideo: els listeners es lliguen abans de fixar `src` perquè un
  // fitxer que encara no existeix (404) pot disparar "error" abans que React l'hagi enllaçat.
  // "error" (sense fitxer, o corrupte) talla de seguida; "ended" és el cas normal. La reserva
  // de RESERVA_MAXIMA_MS és només per si cap dels dos arriba mai a sonar.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const reserva = setTimeout(acabar, RESERVA_MAXIMA_MS);
    const enError = () => {
      clearTimeout(reserva);
      acabar();
    };
    const enAcabar = () => {
      clearTimeout(reserva);
      acabar();
    };
    el.addEventListener("error", enError);
    el.addEventListener("ended", enAcabar);
    el.src = video;
    el.load();
    // So propi del vídeo (ambient) al 33%, sota la veu. Si el navegador bloqueja l'autoplay amb so, es reintenta mut.
    el.volume = 0.33;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
    return () => {
      el.removeEventListener("error", enError);
      el.removeEventListener("ended", enAcabar);
      clearTimeout(reserva);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  const nodes: NodePentagrama[] = ORDRE.map((element, i) => ({
    id: element,
    element,
    resolt: i < resolts,
    disponible: true,
  }));

  return (
    <div
      role="status"
      aria-label="Les cinc fites són resoltes: l'estrella és completa"
      className="fixed inset-0 z-50 overflow-hidden bg-black"
    >
      {/* El vídeo és mut: garanteix que els navegadors el deixin començar sol just en obrir la
          pantalla (l'autoplay amb so no sempre ho fa, i aquí el protagonisme és l'animació). */}
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ background: "radial-gradient(circle at 50% 42%, rgb(0 0 0 / 0.1) 0%, rgb(0 0 0 / 0.55) 100%)" }}
      >
        {/*
          Dues capes a posta, només al voltant del pentagrama: l'animació d'entrada
          (`animate-entrar`, translateY) és una animació CSS amb fill-mode "both", que es
          queda per sempre aplicada al `transform` de l'element que la porta i guanya sobre
          qualsevol `transform` fixat després per estil en línia. Si el zoom de sortida es
          posés a la mateixa capa, mai s'arribaria a veure. Per això l'entrada viu en una capa
          interior i el zoom de sortida en la de fora, que no la porta. El text no en té: es
          queda quiet i visible, només el pentagrama s'esvaeix.
        */}
        <div
          className="transition-all ease-in"
          style={{
            transitionDuration: `${DURADA_SORTIDA_MS}ms`,
            transform: sortint ? "scale(4)" : "scale(1)",
            opacity: sortint ? 0 : 1,
          }}
        >
          <div className="animate-entrar">
            <Pentagrama nodes={nodes} centreActiu={centreActiu} espurnes={centreActiu} girar className="w-64" />
          </div>
        </div>
        <p className="etiqueta animate-entrar text-[#fffdf7]" style={{ textShadow: "0 2px 10px rgb(0 0 0 / 0.65)" }}>
          ✦ l&apos;estrella és completa ✦
        </p>
      </div>
    </div>
  );
}
