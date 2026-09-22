"use client";

import { useEffect, useRef, useState } from "react";

const MARGE = 6; // px entre la píndola i les vores de la pantalla
const ALCADA_MIN = 36;

/* Barra de scroll flotant: una píndola petita per sobre del contingut que no
   ocupa amplada. La nativa s'amaga a globals.css. Apareix en fer scroll i
   s'esvaeix quan s'atura; es pot arrossegar. */
export default function BarraScroll() {
  const [geo, setGeo] = useState({ top: 0, alcada: 0, visible: false });
  const [actiu, setActiu] = useState(false);
  const arrossegant = useRef<{ y: number; scroll: number } | null>(null);
  const temps = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const calcular = () => {
      const doc = document.documentElement;
      const vista = window.innerHeight;
      const total = doc.scrollHeight;
      if (total <= vista + 1) {
        setGeo((g) => ({ ...g, visible: false }));
        return;
      }
      const pista = vista - MARGE * 2;
      const alcada = Math.max(ALCADA_MIN, (vista / total) * pista);
      const top = MARGE + (window.scrollY / (total - vista)) * (pista - alcada);
      setGeo({ top, alcada, visible: true });
    };

    const enScroll = () => {
      calcular();
      setActiu(true);
      clearTimeout(temps.current);
      temps.current = setTimeout(() => {
        if (!arrossegant.current) setActiu(false);
      }, 1200);
    };

    calcular();
    const obs = new ResizeObserver(calcular);
    obs.observe(document.body);
    window.addEventListener("scroll", enScroll, { passive: true });
    window.addEventListener("resize", calcular);
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", enScroll);
      window.removeEventListener("resize", calcular);
      clearTimeout(temps.current);
    };
  }, []);

  const inici = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrossegant.current = { y: e.clientY, scroll: window.scrollY };
    setActiu(true);
  };

  const moure = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrossegant.current) return;
    const vista = window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const recorregut = vista - MARGE * 2 - geo.alcada;
    if (recorregut <= 0) return;
    const delta = e.clientY - arrossegant.current.y;
    window.scrollTo({
      top: arrossegant.current.scroll + (delta / recorregut) * (total - vista),
    });
  };

  const fi = () => {
    arrossegant.current = null;
    clearTimeout(temps.current);
    temps.current = setTimeout(() => setActiu(false), 1200);
  };

  if (!geo.visible) return null;

  return (
    <div
      aria-hidden
      data-barra-scroll
      onPointerDown={inici}
      onPointerMove={moure}
      onPointerUp={fi}
      onPointerCancel={fi}
      className="fixed right-1 z-[100] w-1.5 touch-none rounded-full bg-ink/45 transition-[opacity,width] duration-300 hover:w-2.5 hover:opacity-100"
      style={{
        top: geo.top,
        height: geo.alcada,
        opacity: actiu ? 1 : 0,
      }}
    />
  );
}
