import { Pentagrama } from "@/components/ui/Pentagrama";

export interface VistaCarregantProps {
  text?: string;
}

/** Pantalla genèrica de càrrega a pantalla completa. */
export function VistaCarregant({ text = "Carregant..." }: VistaCarregantProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6" aria-busy="true">
      <Pentagrama girar vius className="w-40 opacity-80" />
      <p className="etiqueta text-base">{text}</p>
    </main>
  );
}
