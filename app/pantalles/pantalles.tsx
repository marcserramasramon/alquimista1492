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
import { getEstacio, getEstacionsJugables, getEstacionsOrdenades, type Estacio } from "@/content/public/estacions";
import type { EstacioMapa, MarcadorMapa } from "@/components/player/MapaEquip";
import { VistaUbicacio } from "@/components/vistes/VistaUbicacio";
import { VistaBenvinguda } from "@/components/vistes/VistaBenvinguda";
import { VistaEntradaCodi } from "@/components/vistes/VistaEntradaCodi";
import { VistaNomEquip } from "@/components/vistes/VistaNomEquip";
import { VistaHub } from "@/components/vistes/VistaHub";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";
import { VistaEstacio } from "@/components/vistes/VistaEstacio";
import type { VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";
import { VistaFinal } from "@/components/vistes/VistaFinal";
import { VistaMissatge } from "@/components/vistes/VistaMissatge";
import { VistaTempsConsumit } from "@/components/vistes/VistaTempsConsumit";
import { VistaGuardians } from "@/components/vistes/VistaGuardians";
import { RESPOSTA_CORRECTA, RESPOSTES_INCORRECTES } from "@/content/public/textos";
import { VistaMasterLogin } from "@/components/vistes/VistaMasterLogin";
import { VistaMasterEquips, type EquipMaster } from "@/components/vistes/VistaMasterEquips";
import { VistaMasterCodis } from "@/components/vistes/VistaMasterCodis";
import { VistaObrirFita, type VistaObrirFitaProps } from "@/components/vistes/VistaObrirFita";

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

/** Estacions tal com les retorna /api/estat, amb el progrés simulat. Només són obertes les resoltes (i les d'`obertes`). */
function estacionsAmbProgres(resoltes: string[], obertes: string[] = []): EstacioMapa[] {
  return getEstacionsOrdenades().map((e) => ({
    ...e,
    oberta: e.tipus === "especial" || resoltes.includes(e.id) || obertes.includes(e.id),
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

function hub(
  resoltes: string[],
  seleccionadaInicialId: string | null = null,
  marcadors: MarcadorMapa[] = [],
  fitaArribadaId: string | null = null,
) {
  const estacions = estacionsAmbProgres(resoltes, fitaArribadaId ? [fitaArribadaId] : []);
  // Mateix criteri que /api/estat: totes les estacions jugables resoltes.
  const totesResoltes = JUGABLES.every((id) => resoltes.includes(id));
  return (
    <VistaHub
      nomEquip={NOM_EQUIP}
      estacions={estacions}
      totesResoltes={totesResoltes}
      onAnarEstacio={noop}
      onAnarFinal={noop}
      onLlegirMissatge={noop}
      seleccionadaInicialId={seleccionadaInicialId}
      marcadors={marcadors}
      fitaArribadaId={fitaArribadaId}
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

const OBRIR_BASE: VistaObrirFitaProps = {
  mode: "camera",
  camera: (
    <div className="flex h-full items-center justify-center p-6 text-center text-lg text-paper/80">
      (aquí es veu la càmera del mòbil)
    </div>
  ),
  codi: "",
  enviant: false,
  error: null,
  onCodiChange: noop,
  onEnviarCodi: noop,
  onMode: noop,
  onTancar: noop,
};

// Missatges iguals que els de /api/resposta.
const MISSATGE_CORRECTE = RESPOSTA_CORRECTA;
const MISSATGE_INCORRECTE = RESPOSTES_INCORRECTES[0];

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
      id: `fita-${estacio.id}-resolta`,
      titol: `${estacio.nom} · fragment`,
      descripcio: "Ja resolta: es mostra el fragment de Fra Francesc.",
      render: () => <VistaEstacio {...JOC_BUIT} estacio={estacio} error={null} resolta onTornar={noop} />,
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
      descripcio: "Celebració, just abans de mostrar el fragment.",
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

/** Posició d'exemple a tocar d'una fita real (una mica desplaçada perquè no la tapi). */
function propDe(estacioId: string, desplacament = 0.0004) {
  const estacio = getEstacio(estacioId);
  return estacio ? { lat: estacio.latitud + desplacament, lng: estacio.longitud + desplacament } : null;
}

const POSICIO_MASTER = propDe("font-ferro", -0.0005);
const POSICIO_EQUIP = propDe("planes-bones");

const TOTAL_MASTER = getEstacionsJugables().filter((e) => e.disponible).length;
const EQUIPS_MASTER: EquipMaster[] = [
  {
    id: "1",
    code: "K7M2QX",
    name: "Els Salamandres",
    status: "joc",
    resoltes: 2,
    total: TOTAL_MASTER,
    ubicacio: POSICIO_EQUIP && { ...POSICIO_EQUIP, faMinuts: 0 },
  },
  { id: "2", code: "P4R9TB", name: "Equip 2", status: "espera", resoltes: 0, total: TOTAL_MASTER, ubicacio: null },
  {
    id: "3",
    code: "W3HZ8N",
    name: "Les Fènix",
    status: "final",
    resoltes: TOTAL_MASTER,
    total: TOTAL_MASTER,
    ubicacio: propDe("aire") && { ...propDe("aire")!, faMinuts: 4 },
  },
];

const ESTACIONS_MASTER = estacionsAmbProgres([]);

const MASTER_BASE = {
  nom: "",
  creant: false,
  onNomChange: noop,
  onCrear: noop,
  onReiniciar: noop,
  estacions: ESTACIONS_MASTER,
  onComparteixoChange: noop,
};

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
  {
    id: "ubicacio",
    grup: "entrada",
    titol: "Ubicació · consentiment",
    descripcio: "Després del nom, abans de demanar el permís de GPS.",
    render: () => <VistaUbicacio demanant={false} onAcceptar={noop} onRebutjar={noop} />,
  },
  {
    id: "ubicacio-demanant",
    grup: "entrada",
    titol: "Ubicació · esperant permís",
    descripcio: "Mentre el navegador mostra el seu diàleg de permís.",
    render: () => <VistaUbicacio demanant onAcceptar={noop} onRebutjar={noop} />,
  },

  {
    id: "missatge",
    grup: "entrada",
    titol: "Missatge secret",
    descripcio: "Després de la ubicació, abans del hub.",
    render: () => <VistaMissatge onContinuar={noop} />,
  },
  {
    id: "missatge-tornada",
    grup: "entrada",
    titol: "Missatge secret · relectura",
    descripcio: "Obert des del botó del hub.",
    render: () => <VistaMissatge onContinuar={noop} textContinuar="← Tornar al mapa" />,
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
    id: "hub-fita-arribada",
    grup: "hub",
    titol: "Hub · heu arribat a una fita",
    descripcio: SEGUENT_FITA
      ? `El GPS situa l'equip a menys de 20 m de ${SEGUENT_FITA.nom}: sona el so i se n'obre la fitxa.`
      : undefined,
    render: () => hub(RESOLTES_MITJA_PARTIDA, null, [], SEGUENT_FITA?.id ?? null),
  },
  {
    id: "hub-totes-resoltes",
    grup: "hub",
    titol: "Hub · totes resoltes",
    descripcio: "Text de l'estrella completa i botó del Pla de Masset.",
    render: () => hub(JUGABLES),
  },
  {
    id: "hub-amb-master",
    grup: "hub",
    titol: "Hub · amb el màster",
    descripcio: "El màster comparteix la ubicació (marcador vermell) i el punt blau és l'equip.",
    render: () =>
      hub(RESOLTES_MITJA_PARTIDA, null, [
        ...(POSICIO_MASTER ? [{ id: "master", tipus: "master" as const, ...POSICIO_MASTER }] : []),
        ...(POSICIO_EQUIP ? [{ id: "jo", tipus: "jo" as const, ...POSICIO_EQUIP }] : []),
      ]),
  },

  // Fites
  {
    id: "fita-carregant",
    grup: "fites",
    titol: "Fita · carregant",
    render: () => <VistaEstacio {...JOC_BUIT} estacio={null} error={null} onTornar={noop} />,
  },
  {
    id: "obrir-fita-camera",
    grup: "fites",
    titol: "Obrir fita · escanejar QR",
    descripcio: "Igual per a totes les fites. En tocar \"Hi som! Obrir la fita\" si el GPS encara no l'ha oberta.",
    render: () => <VistaObrirFita {...OBRIR_BASE} />,
  },
  {
    id: "obrir-fita-manual",
    grup: "fites",
    titol: "Obrir fita · codi manual",
    render: () => <VistaObrirFita {...OBRIR_BASE} mode="manual" codi="TM" />,
  },
  {
    id: "obrir-fita-codi-incorrecte",
    grup: "fites",
    titol: "Obrir fita · codi incorrecte",
    render: () => (
      <VistaObrirFita
        {...OBRIR_BASE}
        mode="manual"
        codi="ABCDE"
        error="Aquest codi no és de cap fita. Reviseu-lo."
      />
    ),
  },
  {
    id: "fita-tancada",
    grup: "fites",
    titol: "Fita · tancada",
    descripcio: "Si s'entra a /s/[id] sense haver-hi arribat.",
    render: () => (
      <VistaEstacio
        {...JOC_BUIT}
        estacio={null}
        error="Aquesta fita encara és tancada. Aneu-hi i escanegeu el QR del cartell."
        onTornar={noop}
      />
    ),
  },
  ...getEstacionsOrdenades()
    .filter((e) => e.tipus !== "especial")
    .flatMap(pantallesFita),

  // Final
  {
    id: "temps-consumit",
    grup: "final",
    titol: "S'acaba el temps",
    descripcio: "Encara no s'activa: no hi ha durada de partida.",
    render: () => <VistaTempsConsumit onAnarPlaMasset={noop} />,
  },
  {
    id: "final",
    grup: "final",
    titol: "Pla de Masset · arribada",
    descripcio: "Esperant Fra Francesc (abans del desemmascarament).",
    render: () => <VistaFinal ritual={false} onComencarRitual={noop} />,
  },
  {
    id: "final-ritual",
    grup: "final",
    titol: "Pla de Masset · ritual",
    descripcio: "El Gresol: ordre i resultat PENDENT.",
    render: () => <VistaFinal ritual onComencarRitual={noop} />,
  },
  {
    id: "guardians",
    grup: "final",
    titol: "Guardians del Secret",
    descripcio: "Pantalla final. Encara sense ruta: depèn del resultat del Gresol.",
    render: () => <VistaGuardians />,
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
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
      />
    ),
  },
  {
    id: "master-comparteix",
    grup: "master",
    titol: "Màster · compartint ubicació",
    descripcio: "El màster (punt blau) comparteix la seva posició amb els equips.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={POSICIO_MASTER}
        comparteixo
        estatUbicacio="actiu"
      />
    ),
  },
  {
    id: "master-gps-denegat",
    grup: "master",
    titol: "Màster · GPS denegat",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo
        estatUbicacio="denegat"
      />
    ),
  },
  {
    id: "master-codis",
    grup: "master",
    titol: "Màster · codis QR",
    descripcio: "Codis d'exemple: els reals només es veuen a /master/codis.",
    render: () => (
      <VistaMasterCodis
        fites={getEstacionsOrdenades()
          .filter((e) => e.tipus !== "especial")
          .map((e, i) => {
            const codi = ["AAAAA", "BBBBB", "CCCCC", "DDDDD", "EEEEE"][i] ?? "XXXXX";
            return { id: e.id, nom: e.nom, element: e.element, codi, url: `https://exemple.cat/s/${e.id}?c=${codi}` };
          })}
      />
    ),
  },
  {
    id: "master-equips-buit",
    grup: "master",
    titol: "Màster · sense equips",
    descripcio: "Abans de crear cap equip.",
    render: () => (
      <VistaMasterEquips {...MASTER_BASE} equips={[]} posicioMaster={null} comparteixo={false} estatUbicacio="inactiu" />
    ),
  },
];

export function getPantalla(id: string): Pantalla | undefined {
  return PANTALLES.find((p) => p.id === id);
}
