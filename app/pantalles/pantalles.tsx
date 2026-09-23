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
import { VistaSeleccioEquip } from "@/components/vistes/VistaSeleccioEquip";
import { VistaEspera } from "@/components/vistes/VistaEspera";
import { EQUIPS } from "@/content/public/equips";
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
import { VistaMissatgeMaster } from "@/components/vistes/VistaMissatgeMaster";
import { MISSATGES_MASTER, TITOL_TEXT_LLIURE } from "@/content/public/missatgesMaster";
import type { MissatgeEnviat } from "@/components/vistes/PanellMissatgesMaster";
import { IndicadorTemps } from "@/components/ui/IndicadorTemps";
import type { DadesRecorregut } from "@/components/vistes/PanellRecorregut";

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

const NOM_EQUIP = EQUIPS[0].nom;

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
    <VistaEstacio {...JOC_BUIT} {...joc} estacio={estacio} error={null} pasInicial="prova" onTornar={noop} />
  );

  return [
    {
      ...base,
      id: `fita-${estacio.id}`,
      titol: estacio.nom,
      descripcio: "Pas 1: narració de Fra Francesc amb la veu; el botó dona pas a la prova.",
      render: () => <VistaEstacio {...JOC_BUIT} estacio={estacio} error={null} onTornar={noop} />,
    },
    {
      ...base,
      id: `fita-${estacio.id}-prova`,
      titol: `${estacio.nom} · prova`,
      descripcio: "Pas 2: la prova i el camp de resposta.",
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
    name: EQUIPS[0].nom,
    imatge: EQUIPS[0].imatge,
    agafat: true,
    status: "joc",
    guardians: false,
    resoltes: 2,
    total: TOTAL_MASTER,
    ubicacio: POSICIO_EQUIP && { ...POSICIO_EQUIP, faMinuts: 0 },
  },
  {
    id: "2",
    name: EQUIPS[1].nom,
    imatge: EQUIPS[1].imatge,
    agafat: false,
    status: "espera",
    guardians: false,
    resoltes: 0,
    total: TOTAL_MASTER,
    ubicacio: null,
  },
  {
    id: "3",
    name: EQUIPS[2].nom,
    imatge: EQUIPS[2].imatge,
    agafat: true,
    status: "final",
    guardians: true,
    resoltes: TOTAL_MASTER,
    total: TOTAL_MASTER,
    ubicacio: propDe("aire") && { ...propDe("aire")!, faMinuts: 4 },
  },
];

const ESTACIONS_MASTER = estacionsAmbProgres([]);

// Els exemples del màster mostren la partida en marxa (fa 47 min de 90); "master-abans-inici", l'espera.
const INICI_PARTIDA = new Date(Date.now() - 47 * 60_000).toISOString();
const FI_PARTIDA = new Date(Date.parse(INICI_PARTIDA) + 90 * 60_000).toISOString();

const MASTER_BASE = {
  partidaIniciadaAt: INICI_PARTIDA,
  partidaAcabaAt: FI_PARTIDA,
  onIniciarPartida: noop,
  onAjustarTemps: noop,
  onAcabarTemps: noop,
  onReiniciarPartida: noop,
  onConsagrar: noop,
  onAlliberar: noop,
  onReiniciar: noop,
  estacions: ESTACIONS_MASTER,
  onComparteixoChange: noop,
};

// Missatges del màster (punt 9): enviaments recents d'exemple, un "a tots" i un a un sol equip.
const ARA_MISSATGES = Date.parse("2026-11-14T19:40:00Z");
const MISSATGES_RECENTS: MissatgeEnviat[] = [
  ...EQUIPS_MASTER.map((e, i) => ({
    id: `r1-${e.id}`,
    team_id: e.id,
    titol: MISSATGES_MASTER[0].titol,
    created_at: new Date(ARA_MISSATGES).toISOString(),
    llegit_at: i < 2 ? new Date(ARA_MISSATGES + 30_000).toISOString() : null,
  })),
  {
    id: "r2",
    team_id: "1",
    titol: MISSATGES_MASTER[3].titol,
    created_at: new Date(ARA_MISSATGES - 12 * 60_000).toISOString(),
    llegit_at: new Date(ARA_MISSATGES - 11 * 60_000).toISOString(),
  },
];
const enviarFals = async () => ({ ok: true, enviats: EQUIPS_MASTER.length });

// Recorregut d'exemple: del Pla de Masset a Aigua, Terra i cap a Foc, amb una mica de soroll de GPS.
const RECORREGUT_EXEMPLE: DadesRecorregut = (() => {
  const parades = ["gresol", "font-ferro", "planes-bones", "foc"].map((id) => getEstacio(id)!);
  const inici = Date.parse(INICI_PARTIDA);
  const punts: DadesRecorregut["punts"] = [];
  parades.slice(1).forEach((desti, i) => {
    const origen = parades[i];
    for (let k = 0; k < 8; k++) {
      const f = k / 8;
      punts.push({
        lat: origen.latitud + (desti.latitud - origen.latitud) * f + Math.sin(k * 1.7 + i) * 0.00008,
        lng: origen.longitud + (desti.longitud - origen.longitud) * f + Math.cos(k * 1.3 + i) * 0.00008,
        t: new Date(inici + (punts.length * 60_000)).toISOString(),
      });
    }
  });
  const minut = (m: number) => new Date(inici + m * 60_000).toISOString();
  return {
    iniciAt: INICI_PARTIDA,
    guardiansAt: null,
    punts,
    fites: [
      { estacioId: "font-ferro", obertaAt: minut(8), resoltaAt: minut(14) },
      { estacioId: "planes-bones", obertaAt: minut(16), resoltaAt: minut(25) },
      { estacioId: "foc", obertaAt: null, resoltaAt: null },
    ],
  };
})();

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
    id: "equips",
    grup: "entrada",
    titol: "Tria de l'equip",
    descripcio: "Les 8 icones, totes lliures.",
    render: () => <VistaSeleccioEquip agafats={[]} triant={null} error={null} onTriar={noop} />,
  },
  {
    id: "equips-agafats",
    grup: "entrada",
    titol: "Tria · equips ja triats",
    descripcio: "Tres equips bloquejats per altres mòbils.",
    render: () => (
      <VistaSeleccioEquip agafats={[EQUIPS[1].id, EQUIPS[4].id, EQUIPS[6].id]} triant={null} error={null} onTriar={noop} />
    ),
  },
  {
    id: "equips-triant",
    grup: "entrada",
    titol: "Tria · agafant l'equip",
    render: () => <VistaSeleccioEquip agafats={[EQUIPS[1].id]} triant={EQUIPS[2].id} error={null} onTriar={noop} />,
  },
  {
    id: "equips-error",
    grup: "entrada",
    titol: "Tria · un altre mòbil s'hi ha avançat",
    render: () => (
      <VistaSeleccioEquip
        agafats={[EQUIPS[1].id, EQUIPS[2].id]}
        triant={null}
        error="Aquest equip ja l'ha triat un altre mòbil"
        onTriar={noop}
      />
    ),
  },
  {
    id: "espera",
    grup: "entrada",
    titol: "Espera",
    descripcio: "Fins que el màster inicia la partida.",
    render: () => <VistaEspera equip={EQUIPS[4]} />,
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
    id: "hub-temps",
    grup: "hub",
    titol: "Hub · compte enrere",
    descripcio: "El temps que queda, sempre a dalt de les pantalles de joc (components/player/TempsPartida).",
    render: () => (
      <>
        <IndicadorTemps acabaAt={new Date(Date.now() + 43 * 60_000).toISOString()} />
        {hub(RESOLTES_MITJA_PARTIDA)}
      </>
    ),
  },
  {
    id: "hub-temps-alerta",
    grup: "hub",
    titol: "Hub · últims minuts",
    descripcio: "Per sota de 10 minuts el compte enrere es posa vermell i batega.",
    render: () => (
      <>
        <IndicadorTemps acabaAt={new Date(Date.now() + 6 * 60_000).toISOString()} />
        {hub(RESOLTES_MITJA_PARTIDA)}
      </>
    ),
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

  {
    id: "missatge-master",
    grup: "hub",
    titol: "Missatge del màster",
    descripcio: "Pop-up a qualsevol pantalla de joc. Missatges d'exemple: ESBORRANY a content/public/missatgesMaster.ts.",
    render: (dades) => (
      <>
        {getPantalla("hub-mitja-partida")?.render(dades)}
        <VistaMissatgeMaster titol={MISSATGES_MASTER[3].titol} text={MISSATGES_MASTER[3].text} onAcceptar={noop} />
      </>
    ),
  },
  {
    id: "missatge-master-lliure",
    grup: "hub",
    titol: "Missatge del màster · text lliure, 3 pendents",
    descripcio: "El màster ha escrit el text; en queden més per llegir.",
    render: (dades) => (
      <>
        {getPantalla("hub-mitja-partida")?.render(dades)}
        <VistaMissatgeMaster
          titol={TITOL_TEXT_LLIURE}
          text="Us heu deixat una motxilla a la font. Passeu-la a buscar quan pugueu."
          pendents={3}
          onAcceptar={noop}
        />
      </>
    ),
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
    descripcio: "Arribada: esperant la contrasenya (abans del desemmascarament).",
    render: () => <VistaFinal ritual={false} onComencarRitual={noop} />,
  },
  {
    id: "final-ritual",
    grup: "final",
    titol: "Pla de Masset · ritual",
    descripcio: "El Gresol: imatge, recipients en ordre i passos. Resultat PENDENT (content/public/gresol.ts).",
    render: () => <VistaFinal ritual onComencarRitual={noop} />,
  },
  {
    id: "final-una-pantalla",
    grup: "final",
    titol: "Pla de Masset · tot en una pantalla",
    descripcio: "Variant si GRESOL_CONFIG.transicio = \"una-pantalla\" (arribada i ritual sense botó).",
    render: () => <VistaFinal ritual={false} onComencarRitual={noop} transicio="una-pantalla" />,
  },
  {
    id: "guardians",
    grup: "final",
    titol: "Guardians del Secret",
    descripcio: "Pantalla final (/final): hi arriben quan Fra Francesc els consagra des del màster.",
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
    descripcio: "Compte enrere en marxa i tres equips en estats diferents (un ja consagrat).",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        connexio={{ ultimaLecturaAt: Date.now(), errorsSeguits: 0 }}
      />
    ),
  },
  {
    id: "master-abans-inici",
    grup: "master",
    titol: "Màster · abans d'iniciar",
    descripcio: "Triar la durada; el botó arrenca el compte enrere de tothom.",
    render: () => (
      <VistaMasterEquips
        pestanyaInicial="partida"
        {...MASTER_BASE}
        partidaIniciadaAt={null}
        equips={EQUIPS_MASTER.map((e) => ({ ...e, status: "espera" as const, resoltes: 0 }))}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
      />
    ),
  },
  {
    id: "master-temps-esgotat",
    grup: "master",
    titol: "Màster · temps esgotat",
    descripcio: "El compte enrere ha arribat a zero: encara es poden afegir minuts.",
    render: () => (
      <VistaMasterEquips
        pestanyaInicial="partida"
        {...MASTER_BASE}
        partidaIniciadaAt={new Date(Date.now() - 92 * 60_000).toISOString()}
        partidaAcabaAt={new Date(Date.now() - 2 * 60_000).toISOString()}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
      />
    ),
  },
  {
    id: "master-recorregut",
    grup: "master",
    titol: "Màster · recorregut d'un equip",
    descripcio: "Camí que ha fet l'equip (GPS desat cada 30 s) i hora de cada fita. Només el veu el màster.",
    render: () => (
      <VistaMasterEquips
        pestanyaInicial="mapa"
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        recorregut={{ triatId: "1", dades: RECORREGUT_EXEMPLE, onTriar: noop }}
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
        pestanyaInicial="mapa"
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
        pestanyaInicial="mapa"
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo
        estatUbicacio="denegat"
      />
    ),
  },
  {
    id: "master-connexio-lenta",
    grup: "master",
    titol: "Màster · dades endarrerides",
    descripcio: "Fa més de 15 s que no arriba res del servidor: la píndola ho diu.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        connexio={{ ultimaLecturaAt: Date.now() - 25_000, errorsSeguits: 1 }}
      />
    ),
  },
  {
    id: "master-sense-connexio",
    grup: "master",
    titol: "Màster · sense connexió",
    descripcio: "Tres lectures fallides seguides (o el mòbil sense xarxa): franja vermella a dalt.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        connexio={{ ultimaLecturaAt: Date.now() - 3 * 60_000, errorsSeguits: 3 }}
      />
    ),
  },
  {
    id: "master-zona-perillosa",
    grup: "master",
    titol: "Màster · zona perillosa",
    descripcio: "Reiniciar la partida és a baix de tot de la pestanya Partida, lluny dels ajustos de temps.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        pestanyaInicial="partida"
      />
    ),
  },
  {
    id: "master-confirmar",
    grup: "master",
    titol: "Màster · confirmar una acció",
    descripcio: "Diàleg propi en lloc del confirm() del navegador; el focus va a Enrere.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        confirmacio={{
          titol: `Alliberar ${EQUIPS_MASTER[0].name}?`,
          text: "El mòbil que el té en perdrà l'accés i l'equip quedarà lliure perquè l'agafi un altre mòbil. El progrés es conserva.",
          boto: "🔓 Alliberar",
          perill: true,
          accio: async () => null,
        }}
      />
    ),
  },
  {
    id: "master-confirmar-reinici",
    grup: "master",
    titol: "Màster · reiniciar partida (2a confirmació)",
    descripcio: "Segon pas: els botons canvien de lloc i el vermell no respon fins al cap d'un moment.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        pestanyaInicial="partida"
        confirmacio={{
          titol: "Reiniciar tota la partida?",
          text: "",
          boto: "Continuar",
          perill: true,
          segonPas: {
            titol: "N'estàs segur?",
            text: "No es pot desfer. Els equips que juguen perdran tot el que han fet i hauran de tornar a triar equip.",
            boto: "↺ Sí, reiniciar",
          },
          pasInicial: 2,
          accio: async () => null,
        }}
      />
    ),
  },
  {
    id: "master-avis-error",
    grup: "master",
    titol: "Màster · error d'una acció",
    descripcio: "Si falla una acció sense diàleg (p.ex. +5 min), l'avís surt a sobre de les pestanyes i marxa sol.",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        pestanyaInicial="partida"
        avis="Sense connexió. Torna-ho a provar."
      />
    ),
  },
  {
    id: "master-consagrar-llest",
    grup: "master",
    titol: "Màster · equip amb tots els fragments",
    descripcio: "El botó de consagrar només es destaca quan l'equip ho té tot (o s'ha esgotat el temps).",
    render: () => (
      <VistaMasterEquips
        {...MASTER_BASE}
        equips={EQUIPS_MASTER.map((e) => (e.id === "1" ? { ...e, resoltes: e.total } : e))}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
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
    titol: "Màster · equips no trobats",
    descripcio: "Només si falta la migració dels 8 equips.",
    render: () => (
      <VistaMasterEquips {...MASTER_BASE} equips={[]} posicioMaster={null} comparteixo={false} estatUbicacio="inactiu" />
    ),
  },
  {
    id: "master-missatges",
    grup: "master",
    titol: "Màster · enviar missatge",
    descripcio: "Triar equip (o tots) i missatge; a sota, si els equips l'han llegit.",
    render: () => (
      <VistaMasterEquips
        pestanyaInicial="missatges"
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        missatges={{
          recents: MISSATGES_RECENTS,
          onEnviar: enviarFals,
          inicial: { desti: "1", clau: MISSATGES_MASTER[2].id },
        }}
      />
    ),
  },
  {
    id: "master-missatges-enviat",
    grup: "master",
    titol: "Màster · missatge enviat",
    descripcio: "Confirmació després d'enviar un text lliure a tots.",
    render: () => (
      <VistaMasterEquips
        pestanyaInicial="missatges"
        {...MASTER_BASE}
        equips={EQUIPS_MASTER}
        posicioMaster={null}
        comparteixo={false}
        estatUbicacio="inactiu"
        missatges={{
          recents: MISSATGES_RECENTS,
          onEnviar: enviarFals,
          inicial: { desti: "tots", resultat: { ok: true, enviats: EQUIPS_MASTER.length } },
        }}
      />
    ),
  },
];

export function getPantalla(id: string): Pantalla | undefined {
  return PANTALLES.find((p) => p.id === id);
}
