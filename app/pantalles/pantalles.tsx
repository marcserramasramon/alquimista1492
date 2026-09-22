/**
 * Registre de pantalles de la galeria de desenvolupament (/pantalles).
 *
 * Cada entrada renderitza una VISTA real de components/vistes/ amb dades
 * d'exemple, de manera que la galeria sempre mostra el producte definitiu.
 * Quan es crea una pantalla nova (o un estat nou d'una pantalla), s'hi ha
 * de registrar aquí.
 *
 * Aquest mòdul no té directiva: el servidor només en llegeix les metadades
 * (id, grup, títol) i la funció `render` només s'executa al client
 * (app/pantalles/vista/[id]/RenderPantalla.tsx), perquè passa callbacks.
 * No importis mai content/private des d'aquí: les dades privades (pistes)
 * arriben per `DadesServidor`, que construeix la pàgina de servidor.
 */

import type { ReactNode } from "react";
import { getEstacionsJugables, getEstacionsOrdenades, type Estacio } from "@/content/public/estacions";
import type { EstacioMapa } from "@/components/player/MapaEquip";
import { VistaBenvinguda } from "@/components/vistes/VistaBenvinguda";
import { VistaEntradaCodi } from "@/components/vistes/VistaEntradaCodi";
import { VistaNomEquip } from "@/components/vistes/VistaNomEquip";
import { VistaHub } from "@/components/vistes/VistaHub";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";
import { VistaEstacio } from "@/components/vistes/VistaEstacio";
import type { VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";
import { VistaFinal } from "@/components/vistes/VistaFinal";
import { VistaMasterLogin } from "@/components/vistes/VistaMasterLogin";
import { VistaMasterEquips, type EquipMaster } from "@/components/vistes/VistaMasterEquips";

export const GRUPS = [
  { id: "entrada", nom: "Entrada" },
  { id: "hub", nom: "Hub" },
  { id: "fites", nom: "Fites" },
  { id: "final", nom: "Final" },
  { id: "master", nom: "Màster" },
] as const;

export type GrupPantalla = (typeof GRUPS)[number]["id"];

/** Dades que només pot llegir el servidor (content/private) i que la vista necessita. */
export interface DadesServidor {
  fites: Record<string, { pistes: string[]; resposta: string | null }>;
}

export interface Pantalla {
  id: string;
  grup: GrupPantalla;
  titol: string;
  descripcio?: string;
  render: (dades: DadesServidor) => ReactNode;
}

// ---------------------------------------------------------------------------
// Dades d'exemple (a partir del contingut real)
// ---------------------------------------------------------------------------

const noop = () => {};

const NOM_EQUIP = "Els Salamandres";
const CODI_EXEMPLE = "K7M2QX";

/** Estacions tal com les retorna /api/estat, amb el progrés simulat. */
function estacionsAmbProgres(resoltes: string[]): EstacioMapa[] {
  return getEstacionsOrdenades().map((e) => ({
    ...e,
    progres: { resolta: resoltes.includes(e.id) },
  }));
}

const JUGABLES = getEstacionsJugables().map((e) => e.id);
const RESOLTES_MITJA_PARTIDA = getEstacionsOrdenades()
  .filter((e) => e.tipus !== "especial" && e.disponible)
  .slice(0, 2)
  .map((e) => e.id);
const SEGUENT_FITA = getEstacionsOrdenades().find(
  (e) => e.tipus !== "especial" && e.disponible && !RESOLTES_MITJA_PARTIDA.includes(e.id),
);

function hub(resoltes: string[], seleccionadaInicialId: string | null = null) {
  const estacions = estacionsAmbProgres(resoltes);
  // Mateix criteri que /api/estat: totes les estacions jugables resoltes.
  const totesResoltes = JUGABLES.every((id) => resoltes.includes(id));
  return (
    <VistaHub
      nomEquip={NOM_EQUIP}
      estacions={estacions}
      totesResoltes={totesResoltes}
      onAnarEstacio={noop}
      onAnarFinal={noop}
      seleccionadaInicialId={seleccionadaInicialId}
    />
  );
}

const JOC_BUIT: VistaJocRespostaProps = {
  resposta: "",
  missatge: null,
  correcte: false,
  enviant: false,
  pistes: [],
  carregantPista: false,
  onRespostaChange: noop,
  onSubmit: noop,
  onDemanarPista: noop,
};

// Missatges iguals que els de /api/resposta.
const MISSATGE_CORRECTE = "Resposta correcta!";
const MISSATGE_INCORRECTE = "Encara no ho és. Torneu-ho a provar.";

function pantallesFita(estacio: Estacio): Pantalla[] {
  const base = { grup: "fites" as const };

  if (!estacio.disponible) {
    // /api/joc/[estacioId] retorna 404 "Estació no disponible": és l'única pantalla possible.
    return [
      {
        ...base,
        id: `fita-${estacio.id}-no-disponible`,
        titol: `${estacio.nom} · no disponible`,
        descripcio: "Estació marcada com a no disponible al contingut.",
        render: () => <VistaEstacio {...JOC_BUIT} estacio={null} error="Estació no disponible" onTornar={noop} />,
      },
    ];
  }

  const fita = (joc: Partial<VistaJocRespostaProps>) => (
    <VistaEstacio {...JOC_BUIT} {...joc} estacio={estacio} error={null} onTornar={noop} />
  );

  return [
    {
      ...base,
      id: `fita-${estacio.id}`,
      titol: estacio.nom,
      descripcio: "Estat inicial.",
      render: () => fita({}),
    },
    {
      ...base,
      id: `fita-${estacio.id}-incorrecta`,
      titol: `${estacio.nom} · incorrecta`,
      render: () => fita({ resposta: "0", missatge: MISSATGE_INCORRECTE, correcte: false }),
    },
    {
      ...base,
      id: `fita-${estacio.id}-correcta`,
      titol: `${estacio.nom} · correcta`,
      descripcio: "Just abans de tornar al mapa.",
      render: (dades) =>
        fita({ resposta: dades.fites[estacio.id]?.resposta ?? "", missatge: MISSATGE_CORRECTE, correcte: true }),
    },
    {
      ...base,
      id: `fita-${estacio.id}-pista`,
      titol: `${estacio.nom} · pista 1`,
      descripcio: "Pista 1 demanada: s'activa Pista 2.",
      render: (dades) => fita({ pistes: dades.fites[estacio.id]?.pistes.slice(0, 1) ?? [] }),
    },
    {
      ...base,
      id: `fita-${estacio.id}-pistes-totes`,
      titol: `${estacio.nom} · totes les pistes`,
      descripcio: "Pista 1, Pista 2 i Resposta demanades.",
      render: (dades) => fita({ pistes: dades.fites[estacio.id]?.pistes ?? [] }),
    },
  ];
}

const TOTAL_MASTER = getEstacionsJugables().filter((e) => e.disponible).length;
const EQUIPS_MASTER: EquipMaster[] = [
  { id: "1", code: "K7M2QX", name: "Els Salamandres", status: "joc", resoltes: 2, total: TOTAL_MASTER },
  { id: "2", code: "P4R9TB", name: "Equip 2", status: "espera", resoltes: 0, total: TOTAL_MASTER },
  { id: "3", code: "W3HZ8N", name: "Les Fènix", status: "final", resoltes: TOTAL_MASTER, total: TOTAL_MASTER },
];

// ---------------------------------------------------------------------------
// Registre
// ---------------------------------------------------------------------------

export const PANTALLES: Pantalla[] = [
  // Entrada
  {
    id: "benvinguda",
    grup: "entrada",
    titol: "Benvinguda",
    descripcio: "Android/Chrome: botó per descarregar l'app.",
    render: () => <VistaBenvinguda modeInstallacio="boto" onInstallar={noop} onContinuar={noop} />,
  },
  {
    id: "benvinguda-descarregant",
    grup: "entrada",
    titol: "Benvinguda · descarregant",
    render: () => <VistaBenvinguda modeInstallacio="boto" installant onInstallar={noop} onContinuar={noop} />,
  },
  {
    id: "benvinguda-ios",
    grup: "entrada",
    titol: "Benvinguda · iOS",
    descripcio: "Safari d'iPhone: instruccions per afegir-la a l'inici.",
    render: () => <VistaBenvinguda modeInstallacio="ios" onInstallar={noop} onContinuar={noop} />,
  },
  {
    id: "benvinguda-installada",
    grup: "entrada",
    titol: "Benvinguda · ja instal·lada",
    render: () => <VistaBenvinguda modeInstallacio="installada" onInstallar={noop} onContinuar={noop} />,
  },
  {
    id: "benvinguda-no-disponible",
    grup: "entrada",
    titol: "Benvinguda · sense instal·lació",
    descripcio: "Navegador que no permet instal·lar.",
    render: () => <VistaBenvinguda modeInstallacio="no-disponible" onInstallar={noop} onContinuar={noop} />,
  },
  {
    id: "codi",
    grup: "entrada",
    titol: "Codi d'equip",
    render: () => <VistaEntradaCodi codi="" error={null} enviant={false} onCodiChange={noop} onSubmit={noop} />,
  },
  {
    id: "codi-qr",
    grup: "entrada",
    titol: "Codi · preomplert pel QR",
    render: () => (
      <VistaEntradaCodi codi={CODI_EXEMPLE} error={null} enviant={false} onCodiChange={noop} onSubmit={noop} />
    ),
  },
  {
    id: "codi-error",
    grup: "entrada",
    titol: "Codi · no existeix",
    render: () => (
      <VistaEntradaCodi
        codi="ZZZ999"
        error="Aquest codi d'equip no existeix"
        enviant={false}
        onCodiChange={noop}
        onSubmit={noop}
      />
    ),
  },
  {
    id: "nom",
    grup: "entrada",
    titol: "Nom de l'equip",
    descripcio: "Preomplert amb el nom que ha posat el màster.",
    render: () => <VistaNomEquip nom="Equip 2" error={null} enviant={false} onNomChange={noop} onSubmit={noop} />,
  },
  {
    id: "nom-error",
    grup: "entrada",
    titol: "Nom · error",
    render: () => (
      <VistaNomEquip
        nom={NOM_EQUIP}
        error="Error de connexió. Torna-ho a provar."
        enviant={false}
        onNomChange={noop}
        onSubmit={noop}
      />
    ),
  },

  // Hub
  {
    id: "hub-carregant",
    grup: "hub",
    titol: "Hub · carregant",
    render: () => <VistaCarregant />,
  },
  {
    id: "hub-inici",
    grup: "hub",
    titol: "Hub · inici",
    descripcio: "Cap fita resolta.",
    render: () => hub([]),
  },
  {
    id: "hub-mitja-partida",
    grup: "hub",
    titol: "Hub · mitja partida",
    descripcio: `${RESOLTES_MITJA_PARTIDA.length} fites resoltes.`,
    render: () => hub(RESOLTES_MITJA_PARTIDA),
  },
  {
    id: "hub-fita-seleccionada",
    grup: "hub",
    titol: "Hub · fita seleccionada",
    descripcio: SEGUENT_FITA ? `Popup de ${SEGUENT_FITA.nom}.` : undefined,
    render: () => hub(RESOLTES_MITJA_PARTIDA, SEGUENT_FITA?.id ?? null),
  },
  {
    id: "hub-totes-resoltes",
    grup: "hub",
    titol: "Hub · totes resoltes",
    descripcio: "Apareix el botó del Pla de Masset.",
    render: () => hub(JUGABLES),
  },

  // Fites
  {
    id: "fita-carregant",
    grup: "fites",
    titol: "Fita · carregant",
    render: () => <VistaEstacio {...JOC_BUIT} estacio={null} error={null} onTornar={noop} />,
  },
  ...getEstacionsOrdenades()
    .filter((e) => e.tipus !== "especial")
    .flatMap(pantallesFita),

  // Final
  {
    id: "final",
    grup: "final",
    titol: "El Gresol",
    descripcio: "Placeholder: el ritual final està PENDENT.",
    render: () => <VistaFinal />,
  },

  // Màster
  {
    id: "master-login",
    grup: "master",
    titol: "Màster · login",
    render: () => <VistaMasterLogin pin="" error={null} enviant={false} onPinChange={noop} onSubmit={noop} />,
  },
  {
    id: "master-login-error",
    grup: "master",
    titol: "Màster · PIN incorrecte",
    render: () => (
      <VistaMasterLogin pin="0000" error="PIN incorrecte" enviant={false} onPinChange={noop} onSubmit={noop} />
    ),
  },
  {
    id: "master-equips",
    grup: "master",
    titol: "Màster · equips",
    descripcio: "Tres equips en estats diferents.",
    render: () => (
      <VistaMasterEquips
        equips={EQUIPS_MASTER}
        nom=""
        creant={false}
        onNomChange={noop}
        onCrear={noop}
        onReiniciar={noop}
      />
    ),
  },
  {
    id: "master-equips-buit",
    grup: "master",
    titol: "Màster · sense equips",
    descripcio: "Abans de crear cap equip.",
    render: () => (
      <VistaMasterEquips equips={[]} nom="" creant={false} onNomChange={noop} onCrear={noop} onReiniciar={noop} />
    ),
  },
];

export function getPantalla(id: string): Pantalla | undefined {
  return PANTALLES.find((p) => p.id === id);
}
