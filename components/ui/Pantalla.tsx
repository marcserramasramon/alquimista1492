/** Contenidor de pantalla mòbil: amplada màxima, marges i zones segures del notch. */
export function Pantalla({
  children,
  centrat = false,
  className = "",
}: {
  children: React.ReactNode;
  centrat?: boolean;
  className?: string;
}) {
  return (
    <main
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
        centrat ? "justify-center" : ""
      } ${className}`}
    >
      {children}
    </main>
  );
}

/** Rètol del joc: "Els Guardians del Secret de / Sentfores / 1472". */
export function Marca({ petita = false, sobreFosc = false }: { petita?: boolean; sobreFosc?: boolean }) {
  return (
    <div className="text-center">
      <p className={`etiqueta ${sobreFosc ? "text-paper-3!" : ""}`}>els guardians del secret de</p>
      <p
        className={`font-display font-extrabold leading-none ${sobreFosc ? "text-paper" : "text-ink"} ${petita ? "text-4xl" : "text-6xl"}`}
      >
        Sentfores
      </p>
      <p className={`etiqueta mt-1 ${sobreFosc ? "text-gold!" : "text-gold-deep"}`}>✦ mcdlxxii ✦</p>
    </div>
  );
}

/** Missatge d'error visible a ple sol. */
export function AvisError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="animate-entrar rounded-2xl border-[3px] border-blood bg-[#fde8e6] px-4 py-3 text-center font-bold text-blood"
    >
      {children}
    </p>
  );
}
