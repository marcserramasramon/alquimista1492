"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { VistaBenvinguda, type ModeInstallacio } from "@/components/vistes/VistaBenvinguda";

/** Event no estàndard de Chrome/Android per oferir la instal·lació de la PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Modes en què s'obre la PWA instal·lada (el manifest demana fullscreen). */
const MODES_INSTALLADA = ["(display-mode: fullscreen)", "(display-mode: standalone)"];

/** Canvis de display-mode (p.ex. si l'app s'obre instal·lada). */
function subscriureDisplayMode(onChange: () => void) {
  const mqs = MODES_INSTALLADA.map((m) => window.matchMedia?.(m));
  mqs.forEach((mq) => mq?.addEventListener("change", onChange));
  return () => mqs.forEach((mq) => mq?.removeEventListener("change", onChange));
}

function detectarModeInicial(): ModeInstallacio {
  if (typeof window === "undefined") return "no-disponible";
  const standalone =
    MODES_INSTALLADA.some((m) => window.matchMedia?.(m).matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installada";
  const ua = navigator.userAgent;
  const esIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const esSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  if (esIOS && esSafari) return "ios";
  return "no-disponible";
}

export function Benvinguda() {
  const router = useRouter();
  // La detecció depèn del navegador; al servidor (i a la hidratació) és "no-disponible".
  const modeDetectat = useSyncExternalStore(
    subscriureDisplayMode,
    detectarModeInicial,
    () => "no-disponible" as ModeInstallacio,
  );
  const [modeForcat, setModeForcat] = useState<ModeInstallacio | null>(null);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installant, setInstallant] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setPromptEvent(null);
      setModeForcat("installada");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installar() {
    if (!promptEvent || installant) return;
    setInstallant(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      setPromptEvent(null);
      setModeForcat(outcome === "accepted" ? "installada" : "no-disponible");
    } catch {
      setModeForcat("no-disponible");
    } finally {
      setInstallant(false);
    }
  }

  const mode: ModeInstallacio =
    modeForcat ??
    (modeDetectat === "installada" ? "installada" : promptEvent ? "boto" : modeDetectat);

  function continuar() {
    router.push("/ubicacio");
  }

  return (
    <VistaBenvinguda
      modeInstallacio={mode}
      installant={installant}
      onInstallar={installar}
      onContinuar={continuar}
    />
  );
}
