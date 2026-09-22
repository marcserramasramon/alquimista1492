"use client";

import { useState } from "react";
import { VistaFinal } from "@/components/vistes/VistaFinal";

export function Gresol() {
  const [ritual, setRitual] = useState(false);
  return <VistaFinal ritual={ritual} onComencarRitual={() => setRitual(true)} />;
}
