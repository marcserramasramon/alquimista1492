import { Narracio } from "@/components/ui/Narracio";
import { Marca, Pantalla } from "@/components/ui/Pantalla";
import { MISSATGE_SECRET } from "@/content/public/textos";

export interface VistaMissatgeProps {
  onContinuar: () => void;
  /** Rètol del botó: "Comencem" la primera vegada, "Tornar al mapa" si s'hi torna des del hub. */
  textContinuar?: string;
}

/** 1. El missatge secret de Fra Francesc: es llegeix abans d'entrar al hub. */
export function VistaMissatge({ onContinuar, textContinuar = "Comencem →" }: VistaMissatgeProps) {
  return (
    <Pantalla className="gap-6">
      <div className="animate-entrar">
        <Marca petita />
      </div>
      <Narracio text={MISSATGE_SECRET} etiqueta="missatge secret" className="animate-entrar [animation-delay:120ms]">
        <p className="mt-4 text-right font-display text-2xl font-extrabold">{MISSATGE_SECRET.signatura}</p>
      </Narracio>
      <button type="button" onClick={onContinuar} className="btn btn-primari animate-entrar [animation-delay:240ms]">
        {textContinuar}
      </button>
    </Pantalla>
  );
}
