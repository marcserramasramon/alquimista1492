"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { EscenaCarta, type GuiaCarta } from "@/components/ar/carta/EscenaCarta";
import type { ContornPersones } from "@/components/ar/foc/contorn";
import {
  VistaCartaArribada,
  VistaCartaCerca,
  VistaCartaOberta,
  VistaCartaSegell,
  VistaTelefonValidat,
  type EstatMicroCarta,
} from "@/components/vistes/VistaCarta";
import { PROVA_CARTA } from "@/content/public/textos";
import { aturarMicroAr, iniciarMicroAr, nivellMicroAr } from "@/lib/microAr";
import { useOrientacio } from "@/lib/orientacio";
import { aturarSoCarta, iniciarSoCarta, sonarEsquerdaCarta, sonarObrirCarta, sonarTrencaCarta } from "@/lib/sorollCarta";
import { llegirDecisioUbicacio } from "@/lib/ubicacio";

/** Aquest mòbil ja ha fet la prova: no es repeteix en tornar a obrir l'app. */
const CLAU_FETA = "prova-carta-feta";
/** Temps abans d'oferir «No la trobo» i «Trencar-lo amb la mà». */
const ESPERA_RENDIR_MS = 30_000;
const ESPERA_TRENCAR_MS = 10_000;
/** Temps màxim per carregar el model de persones abans de donar-lo per fallat. */
const ESPERA_PERSONES_MS = 25_000;
/** Volum mínim que demostra que el micròfon rep so. */
const SENYAL_MICRO = 0.008;
/** Segons de crit sostingut que calen per trencar el segell. */
const SEGONS_CRIT = 1.1;

type Fase = "arriba" | "cerca" | "segell" | "oberta" | "validat";
type Resultat = "pendent" | "ok" | "no";

const noSubscriure = () => () => {};

function provaFeta(): boolean {
  try {
    return window.localStorage.getItem(CLAU_FETA) === "si";
  } catch {
    return false;
  }
}

/**
 * Prova inicial amb excusa narrativa: Fra Francesc ha enviat una carta que voleia al voltant del
 * jugador. Buscant-la, atrapant-la i trencant-ne el segell es comprova la càmera, els sensors, el 3D, el
 * micròfon i la càrrega de la detecció de persones. Mai bloqueja: tot té una sortida, res no
 * arriba al servidor i el micròfon només mesura el volum.
 */
export function ProvaCarta() {
  const router = useRouter();
  const jaFeta = useSyncExternalStore(noSubscriure, provaFeta, () => false);
  const [fase, setFase] = useState<Fase>("arriba");
  const [camera, setCamera] = useState<Resultat>("pendent");
  const [tresD, setTresD] = useState<Resultat>("pendent");
  const [persones, setPersones] = useState<Resultat>("pendent");
  const [microOk, setMicroOk] = useState<Resultat>("pendent");
  const [guia, setGuia] = useState<GuiaCarta | null>(null);
  const [fugida, setFugida] = useState(false);
  const [potRendirSe, setPotRendirSe] = useState(false);
  const [micro, setMicro] = useState<EstatMicroCarta>("esperant");
  const [progres, setProgres] = useState(0);
  const [nivell, setNivell] = useState(0);
  const [trencat, setTrencat] = useState(false);
  const [potTrencarAMa, setPotTrencarAMa] = useState(false);

  const { mirada, estat: estatSensors, demanar } = useOrientacio();
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const contorn = useRef<ContornPersones | null>(null);
  const picMicro = useRef(0);

  useEffect(() => {
    if (jaFeta) router.replace("/equips");
  }, [jaFeta, router]);

  useEffect(() => {
    return () => {
      flux.current?.getTracks().forEach((t) => t.stop());
      contorn.current?.tanca();
      aturarMicroAr();
      aturarSoCarta();
    };
  }, []);

  useEffect(() => {
    if (camera === "ok" && video.current && flux.current) {
      video.current.srcObject = flux.current;
      video.current.play().catch(() => {});
    }
  }, [camera, fase]);

  useEffect(() => {
    if (fase !== "cerca") return;
    const temps = setTimeout(() => setPotRendirSe(true), ESPERA_RENDIR_MS);
    return () => clearTimeout(temps);
  }, [fase]);

  /** Baixa i arrenca el model de persones en segon pla, sense ensenyar res. */
  function provarPersones() {
    const limit = setTimeout(() => setPersones((r) => (r === "pendent" ? "no" : r)), ESPERA_PERSONES_MS);
    void import("@/components/ar/foc/contorn")
      .then(async ({ ContornPersones }) => {
        const c = new ContornPersones();
        contorn.current = c;
        await c.iniciar();
        setPersones(c.estat === "actiu" ? "ok" : "no");
        c.tanca();
      })
      .catch(() => setPersones("no"))
      .finally(() => clearTimeout(limit));
  }

  // Tot es demana en tocar el botó (iOS ho exigeix), i els sensors primer de tot.
  async function buscar() {
    iniciarSoCarta();
    navigator.vibrate?.([60, 60, 60]);
    setFase("cerca");
    provarPersones();
    await demanar();
    try {
      flux.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCamera("ok");
    } catch {
      setCamera("no");
    }
  }

  const alFugir = useCallback(() => setFugida(true), []);
  const alAtrapar = useCallback(() => {
    setTresD("ok");
    setFase("segell");
  }, []);
  const alError3D = useCallback(() => {
    setTresD("no");
    setFase("segell");
  }, []);

  async function tocarSegell() {
    setMicro("demanant");
    if (await iniciarMicroAr()) {
      setMicro("actiu");
    } else {
      setMicroOk("no");
      setMicro("no");
      setPotTrencarAMa(true);
    }
  }

  const trencar = useCallback(() => {
    setTrencat(true);
    setProgres(1);
    setNivell(0);
    setMicroOk((r) => (r === "no" ? r : picMicro.current > SENYAL_MICRO ? "ok" : "no"));
    sonarTrencaCarta();
    navigator.vibrate?.([80, 40, 160]);
    aturarMicroAr();
  }, []);

  /** Amb el segell trencat, la carta s'obre quan la toquen. */
  function obrir() {
    sonarObrirCarta();
    flux.current?.getTracks().forEach((t) => t.stop());
    flux.current = null;
    setFase("oberta");
  }

  // El crit: com el dels extres, ha de ser molt més fort que el soroll de fons i sostingut.
  useEffect(() => {
    if (micro !== "actiu" || trencat) return;
    let raf = 0;
    let anterior = performance.now();
    let fons = 0.01;
    let acumulat = 0;
    let esquerdes = 0;
    let ultimaPintada = 0;
    const temps = setTimeout(() => setPotTrencarAMa(true), ESPERA_TRENCAR_MS);
    const bucle = (ara: number) => {
      const dt = Math.min(0.1, (ara - anterior) / 1000);
      anterior = ara;
      const n = nivellMicroAr();
      picMicro.current = Math.max(picMicro.current, n);
      fons += (Math.min(n, fons * 3 + 0.01) - fons) * 0.003;
      if (n > Math.max(0.12, fons * 5)) acumulat += dt;
      const p = Math.min(1, acumulat / SEGONS_CRIT);
      const noves = Math.floor(p * 4);
      if (noves > esquerdes) {
        esquerdes = noves;
        sonarEsquerdaCarta();
        navigator.vibrate?.(40);
      }
      if (ara - ultimaPintada > 60) {
        ultimaPintada = ara;
        setProgres(p);
        setNivell(n);
      }
      if (p >= 1) {
        trencar();
        return;
      }
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(temps);
    };
  }, [micro, trencat, trencar]);

  function acabar() {
    try {
      window.localStorage.setItem(CLAU_FETA, "si");
    } catch {
      // Navegació privada: es repetirà la prova, i prou.
    }
    router.push("/equips");
  }

  if (jaFeta) return null;

  if (fase === "arriba") return <VistaCartaArribada onBuscar={buscar} onSaltar={acabar} />;
  if (fase === "oberta") return <VistaCartaOberta onContinuar={() => setFase("validat")} />;

  if (fase === "validat") {
    const noms = PROVA_CARTA.comprovacions;
    const fallades = [
      camera === "no" && noms.camera,
      estatSensors !== "actiu" && noms.moviment,
      tresD === "no" && noms.tresD,
      microOk === "no" && noms.micro,
      llegirDecisioUbicacio() !== "si" && noms.ubicacio,
      persones === "no" && noms.persones,
    ].filter((f): f is string => Boolean(f));
    return (
      <VistaTelefonValidat
        fallades={fallades}
        comprovant={persones === "pendent"}
        onContinuar={acabar}
        onRepetir={() => window.location.reload()}
      />
    );
  }

  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "ok" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}
      {fase === "cerca" && (
        <>
          <EscenaCarta
            mirada={mirada}
            arrossegar={sensorsFallen}
            alGuia={setGuia}
            alFugir={alFugir}
            alAtrapar={alAtrapar}
            alError={alError3D}
          />
          <VistaCartaCerca
            guia={guia}
            fugida={fugida}
            esperantPermisos={camera === "pendent" || estatSensors === "inactiu"}
            arrossegar={sensorsFallen}
            potRendirSe={potRendirSe}
            onRendirSe={() => setFase("segell")}
          />
        </>
      )}
      {fase === "segell" && (
        <VistaCartaSegell
          progres={progres}
          nivell={nivell}
          micro={micro}
          trencat={trencat}
          potTrencarAMa={potTrencarAMa}
          onTocarSegell={tocarSegell}
          onTrencarAMa={trencar}
          onObrir={obrir}
        />
      )}
    </div>
  );
}
