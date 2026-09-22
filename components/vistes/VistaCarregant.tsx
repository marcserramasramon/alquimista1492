export interface VistaCarregantProps {
  text?: string;
}

/** Pantalla genèrica de càrrega a pantalla completa. */
export function VistaCarregant({ text = "Carregant..." }: VistaCarregantProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-leather">{text}</p>
    </main>
  );
}
