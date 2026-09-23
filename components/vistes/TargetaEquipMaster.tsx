"use client";

export interface EquipMaster {
  id: string;
  name: string;
  imatge: string;
  /** Un mòbil ha triat aquest equip. */
  agafat: boolean;
  status: "espera" | "joc" | "final";
  /** Fra Francesc l'ha consagrat: el mòbil de l'equip és a la pantalla final. */
  guardians: boolean;
  resoltes: number;
  total: number;
  /** Última posició coneguda; null si l'equip no n'ha enviat cap. */
  ubicacio: { lat: number; lng: number; faMinuts: number } | null;
}

export interface TargetaEquipMasterProps {
  equip: EquipMaster;
  partidaIniciada: boolean;
  onConsagrar: (teamId: string, consagrar: boolean) => void;
  onAlliberar: (teamId: string) => void;
  onReiniciar: (teamId: string) => void;
}

const ESTATS: Record<EquipMaster["status"], { text: string; classe: string }> = {
  espera: { text: "En espera", classe: "bg-paper-3 text-ink" },
  joc: { text: "Jugant", classe: "bg-aigua text-white" },
  final: { text: "Al Gresol", classe: "bg-gold text-ink" },
};

const GUARDIANS = { text: "✨ Guardians", classe: "bg-anima text-white" };

const LLIURE = { text: "Lliure", classe: "bg-[#fffdf7] text-ink-soft" };

function textEdat(faMinuts: number) {
  return faMinuts < 1 ? "ara" : `fa ${faMinuts} min`;
}

export function TargetaEquipMaster({ equip, partidaIniciada, onConsagrar, onAlliberar, onReiniciar }: TargetaEquipMasterProps) {
  const estat = !equip.agafat ? LLIURE : equip.guardians ? GUARDIANS : ESTATS[equip.status];
  return (
    <li className="targeta p-4">
      <div className="flex items-start justify-between gap-3">
        <img src={equip.imatge} alt="" className={`h-14 w-14 shrink-0 ${equip.agafat ? "" : "opacity-40 grayscale"}`} />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold leading-tight">{equip.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border-2 border-ink px-2.5 text-sm font-extrabold ${estat.classe}`}>
              {estat.text}
            </span>
          </div>
        </div>
        <p className="shrink-0 font-display text-4xl font-extrabold leading-none">
          {equip.resoltes}
          <span className="text-2xl text-ink-soft">/{equip.total}</span>
        </p>
      </div>

      {/* Progrés en segments, un per fita */}
      <div className="mt-3 flex gap-1.5" aria-label={`${equip.resoltes} de ${equip.total} fites`}>
        {Array.from({ length: equip.total }, (_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 rounded-full border-2 border-ink ${i < equip.resoltes ? "bg-gold" : "bg-[#fffdf7]"}`}
          />
        ))}
      </div>

      {equip.agafat && partidaIniciada && (
        <button
          type="button"
          onClick={() => onConsagrar(equip.id, !equip.guardians)}
          className={
            equip.guardians
              ? "mt-4 min-h-12 w-full rounded-xl border-[3px] border-ink/40 px-3 text-base font-extrabold text-ink-soft active:bg-paper-3"
              : "btn btn-fosc mt-4"
          }
        >
          {equip.guardians ? "↩ Desfer la consagració" : "✨ Consagrar Guardians del Secret"}
        </button>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-base text-ink-soft">📍 {equip.ubicacio ? textEdat(equip.ubicacio.faMinuts) : "sense ubicació"}</p>
        <div className="flex gap-2">
          {equip.agafat && (
            <button
              onClick={() => onAlliberar(equip.id)}
              className="min-h-12 rounded-xl border-[3px] border-ink px-3 text-sm font-extrabold active:bg-ink active:text-paper"
            >
              🔓 Alliberar
            </button>
          )}
          <button
            onClick={() => onReiniciar(equip.id)}
            className="min-h-12 rounded-xl border-[3px] border-blood px-3 text-sm font-extrabold text-blood active:bg-blood active:text-white"
          >
            ↺ Reiniciar
          </button>
        </div>
      </div>
    </li>
  );
}
