"use client";

import { useEffect, useState } from "react";

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}

/** Temps transcorregut des de `des` (ISO), actualitzat cada segon. */
export function Cronometre({ des, className = "" }: { des: string; className?: string }) {
  const [ara, setAra] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setAra(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    // El servidor i el client el pinten en segons diferents: la diferència és esperada.
    <time dateTime={des} className={`tabular-nums ${className}`} suppressHydrationWarning>
      {format(ara - Date.parse(des))}
    </time>
  );
}
