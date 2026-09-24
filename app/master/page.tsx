"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaMasterEquips, type EquipMaster } from "@/components/vistes/VistaMasterEquips";
import type { EstacioMapa } from "@/components/player/MapaEquip";
import { getEstacionsOrdenades } from "@/content/public/estacions";
import { useCompartirUbicacio } from "@/lib/useCompartirUbicacio";
import type {
  EnviamentMissatge,
  MissatgeEnviat,
  ResultatEnviament,
} from "@/components/vistes/PanellMissatgesMaster";
import type { DadesRecorregut } from "@/components/vistes/PanellRecorregut";
import type { DadesConnexio } from "@/components/ui/EstatConnexio";
import type { Confirmacio } from "@/components/ui/DialegConfirmacio";
import type { FetPartida } from "@/components/vistes/PanellFetsMaster";

/** Cada quant es torna a llegir el recorregut de l'equip triat (els equips envien la posició cada 30 s). */
const INTERVAL_RECORREGUT_MS = 30_000;

/** Vibració quan un equip resol una fita, i quan ja té tots els fragments (més llarga). */
const VIBRACIO_RESOL = 200;
const VIBRACIO_FRAGMENTS = [400, 150, 400, 150, 400];

function vibrar(patro: number | number[]) {
  try {
    navigator.vibrate?.(patro);
  } catch {
    // Sense vibració (iOS, escriptori): l'avís ja surt a la pantalla.
  }
}

/** Quant es queda a la vista l'avís d'error d'una acció sense diàleg. */
const DURADA_AVIS_MS = 6_000;

type Equip = EquipMaster;

interface EquipApi extends Omit<EquipMaster, "ubicacio" | "guardians"> {
  guardians_at: string | null;
  last_lat: number | null;
  last_lng: number | null;
  last_location_at: string | null;
}

interface EquipsResponse {
  equips: EquipApi[];
  master: { sharing: boolean } | null;
  partidaIniciadaAt: string | null;
  partidaAcabaAt: string | null;
  ara: string;
}

// Les fites al mapa del màster, només per situar-se (sense progrés).
const ESTACIONS_MAPA: EstacioMapa[] = getEstacionsOrdenades().map((e) => ({ ...e, progres: { resolta: false } }));

function ambUbicacio(equips: EquipApi[]): Equip[] {
  const ara = Date.now();
  return equips.map(({ last_lat, last_lng, last_location_at, guardians_at, ...equip }) => ({
    ...equip,
    guardians: guardians_at !== null,
    ubicacio:
      last_lat !== null && last_lng !== null && last_location_at
        ? {
            lat: last_lat,
            lng: last_lng,
            faMinuts: Math.floor((ara - new Date(last_location_at).getTime()) / 60_000),
          }
        : null,
  }));
}

export default function MasterPage() {
  const router = useRouter();
  const [equips, setEquips] = useState<Equip[] | null>(null);
  const [partidaIniciadaAt, setPartidaIniciadaAt] = useState<string | null>(null);
  const [partidaAcabaAt, setPartidaAcabaAt] = useState<string | null>(null);
  const [desfasamentMs, setDesfasamentMs] = useState(0);
  const [canviantPartida, setCanviantPartida] = useState(false);
  const [comparteixo, setComparteixo] = useState(false);
  const ubicacio = useCompartirUbicacio({ actiu: comparteixo, endpoint: "/api/master/ubicacio" });
  const [missatgesRecents, setMissatgesRecents] = useState<MissatgeEnviat[]>([]);
  const [recorregutId, setRecorregutId] = useState<string | null>(null);
  const [recorregut, setRecorregut] = useState<DadesRecorregut | null>(null);
  const [connexio, setConnexio] = useState<DadesConnexio>({ ultimaLecturaAt: null, errorsSeguits: 0 });
  const [confirmacio, setConfirmacio] = useState<Confirmacio | null>(null);
  const [avis, setAvis] = useState<string | null>(null);
  const [fets, setFets] = useState<FetPartida[]>([]);
  /** Fets que ja s'han vist a la pestanya Equips. */
  const [vistos, setVistos] = useState<ReadonlySet<string>>(new Set());
  /** Equips que acaben d'aconseguir tots els fragments i encara no s'ha tocat "Entesos". */
  const [avisosFragments, setAvisosFragments] = useState<FetPartida[]>([]);
  /** Fets ja coneguts (null abans de la primera lectura: el que ja havia passat no avisa). */
  const coneguts = useRef<Set<string> | null>(null);
  const tancarConfirmacio = useCallback(() => setConfirmacio(null), []);
  const tancarAvis = useCallback(() => setAvis(null), []);

  // L'avís d'error se'n va sol al cap d'uns segons.
  useEffect(() => {
    if (!avis) return;
    const t = setTimeout(() => setAvis(null), DURADA_AVIS_MS);
    return () => clearTimeout(t);
  }, [avis]);

  useEffect(() => {
    if (!recorregutId) return;
    let cancelat = false;
    const llegir = () =>
      fetch(`/api/master/recorregut?teamId=${encodeURIComponent(recorregutId)}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok || cancelat) return;
          const data: DadesRecorregut = await res.json();
          if (!cancelat) setRecorregut(data);
        })
        .catch(() => {});
    llegir();
    const interval = setInterval(llegir, INTERVAL_RECORREGUT_MS);
    return () => {
      cancelat = true;
      clearInterval(interval);
    };
  }, [recorregutId]);

  function triarRecorregut(teamId: string | null) {
    setRecorregut(null);
    setRecorregutId(teamId);
  }

  const llegirEquips = useCallback(async (): Promise<EquipsResponse | null> => {
    const res = await fetch("/api/master/equips");
    if (res.status === 401) {
      router.push("/master/login");
      return null;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, [router]);

  const aplicar = useCallback((data: EquipsResponse) => {
    setEquips(ambUbicacio(data.equips));
    setPartidaIniciadaAt(data.partidaIniciadaAt);
    setPartidaAcabaAt(data.partidaAcabaAt);
    setDesfasamentMs(Date.parse(data.ara) - Date.now());
  }, []);

  async function carregar() {
    // Si falla, ja ho recollirà el refresc periòdic (i l'indicador de connexió).
    const data = await llegirEquips().catch(() => null);
    if (data) aplicar(data);
  }

  useEffect(() => {
    let primera = true;
    const refresca = () =>
      llegirEquips()
        .then((data) => {
          if (!data) return;
          aplicar(data);
          setConnexio({ ultimaLecturaAt: Date.now(), errorsSeguits: 0 });
          // L'interruptor arrenca amb el que diu el servidor (p.ex. després de recarregar).
          if (primera && data.master?.sharing) setComparteixo(true);
          primera = false;
        })
        .catch(() => setConnexio((c) => ({ ...c, errorsSeguits: c.errorsSeguits + 1 })));
    refresca();
    const interval = setInterval(refresca, 5000);
    return () => clearInterval(interval);
  }, [llegirEquips, aplicar]);

  const carregarMissatges = useCallback(
    () =>
      fetch("/api/master/missatges")
        .then(async (res) => {
          if (!res.ok) return;
          const data: { missatges: MissatgeEnviat[] } = await res.json();
          setMissatgesRecents(data.missatges);
        })
        .catch(() => {}),
    []
  );

  // Estat de lectura dels missatges enviats (el 401 ja el gestiona el refresc dels equips).
  useEffect(() => {
    const inicial = setTimeout(carregarMissatges, 0);
    const interval = setInterval(carregarMissatges, 5000);
    return () => {
      clearTimeout(inicial);
      clearInterval(interval);
    };
  }, [carregarMissatges]);

  // Fets de la partida: els nous vibren i, si un equip ja té tots els fragments, surt l'avís gran.
  useEffect(() => {
    const llegir = () =>
      fetch("/api/master/fets", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) return;
          const data: { fets: FetPartida[] } = await res.json();
          if (coneguts.current === null) {
            coneguts.current = new Set(data.fets.map((f) => f.id));
            setVistos(new Set(coneguts.current));
          } else {
            const nous = data.fets.filter((f) => !coneguts.current!.has(f.id));
            nous.forEach((f) => coneguts.current!.add(f.id));
            const fragments = nous.filter((f) => f.tipus === "fragments");
            if (fragments.length > 0) {
              setAvisosFragments((actuals) => [...actuals, ...fragments]);
              vibrar(VIBRACIO_FRAGMENTS);
            } else if (nous.some((f) => f.tipus === "resol")) {
              vibrar(VIBRACIO_RESOL);
            }
          }
          setFets(data.fets);
        })
        .catch(() => {});
    const inicial = setTimeout(llegir, 0);
    const interval = setInterval(llegir, 5000);
    return () => {
      clearTimeout(inicial);
      clearInterval(interval);
    };
  }, []);

  // La consagració la fa el mateix màster: no compta com a fet nou per veure.
  const noVistos = fets.filter((f) => f.tipus !== "guardians" && !vistos.has(f.id)).length;
  const veureFets = useCallback(() => setVistos(new Set(fets.map((f) => f.id))), [fets]);
  const entesFragments = useCallback(
    (fetId: string) => setAvisosFragments((actuals) => actuals.filter((f) => f.id !== fetId)),
    []
  );

  async function enviarMissatge(enviament: EnviamentMissatge): Promise<ResultatEnviament> {
    const res = await fetch("/api/master/missatges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enviament),
    }).catch(() => null);
    if (!res) return { ok: false, error: "Sense connexió. Torna-ho a provar." };
    if (res.status === 401) {
      router.push("/master/login");
      return { ok: false, error: "Cal tornar a entrar" };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "No s'ha pogut enviar" };
    carregarMissatges();
    return { ok: true, enviats: data.enviats };
  }

  async function canviarComparteixo(valor: boolean) {
    setComparteixo(valor);
    await fetch("/api/master/ubicacio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharing: valor }),
    }).catch(() => {});
  }

  /** POST a una ruta del màster. Retorna el missatge d'error, o null si ha anat bé (i refresca els equips). */
  async function crida(url: string, body: unknown): Promise<string | null> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (!res) return "Sense connexió. Torna-ho a provar.";
    if (res.status === 401) {
      router.push("/master/login");
      return "Cal tornar a entrar.";
    }
    if (!res.ok) return (await res.json().catch(() => ({}))).error ?? "No s'ha pogut fer. Torna-ho a provar.";
    await carregar();
    return null;
  }

  async function canviarPartida(
    peticio:
      | { accio: "iniciar"; durada: number }
      | { accio: "ajustar"; minuts: number }
      | { accio: "acabar" }
      | { accio: "reiniciar" }
  ): Promise<string | null> {
    if (canviantPartida) return null;
    setCanviantPartida(true);
    try {
      return await crida("/api/master/partida", peticio);
    } finally {
      setCanviantPartida(false);
    }
  }

  const nomEquip = (teamId: string) => equips?.find((e) => e.id === teamId)?.name ?? "aquest equip";

  function iniciarPartida(durada: number) {
    const aPunt = equips?.filter((e) => e.agafat).length ?? 0;
    setConfirmacio({
      titol: "Iniciar la partida?",
      text: `${durada} minuts amb ${aPunt} ${aPunt === 1 ? "equip" : "equips"}. El compte enrere arrenca per a tothom en tocar el botó.`,
      boto: "▶ Iniciar",
      accio: () => canviarPartida({ accio: "iniciar", durada }),
    });
  }

  async function ajustarTemps(minuts: number) {
    setAvis(await canviarPartida({ accio: "ajustar", minuts }));
  }

  function acabarTemps() {
    setConfirmacio({
      titol: "Acabar el temps ara?",
      text: "Tots els equips veuran que s'ha acabat el temps i aniran al Pla del Masset. Després encara podràs afegir minuts.",
      boto: "⏹ Acabar ara",
      perill: true,
      accio: () => canviarPartida({ accio: "acabar" }),
    });
  }

  function reiniciarPartida() {
    setConfirmacio({
      titol: "Reiniciar tota la partida?",
      text: "S'aturarà el compte enrere, s'alliberaran tots els equips i s'esborraran el progrés, els recorreguts i els missatges.",
      boto: "Continuar",
      perill: true,
      segonPas: {
        titol: "N'estàs segur?",
        text: "No es pot desfer. Els equips que juguen perdran tot el que han fet i hauran de tornar a triar equip.",
        boto: "↺ Sí, reiniciar",
      },
      accio: () => canviarPartida({ accio: "reiniciar" }),
    });
  }

  function consagrar(teamId: string, valor: boolean) {
    const nom = nomEquip(teamId);
    setConfirmacio(
      valor
        ? {
            titol: `Consagrar ${nom}?`,
            text: "Els consagres com a Guardians del Secret: el seu mòbil passarà a la pantalla final.",
            boto: "✨ Consagrar",
            accio: () => crida("/api/master/guardians", { teamId, consagrar: true }),
          }
        : {
            titol: `Desfer la consagració de ${nom}?`,
            text: "El seu mòbil tornarà al Gresol.",
            boto: "↩ Desfer",
            accio: () => crida("/api/master/guardians", { teamId, consagrar: false }),
          }
    );
  }

  function alliberar(teamId: string) {
    setConfirmacio({
      titol: `Alliberar ${nomEquip(teamId)}?`,
      text: "Tots els mòbils de l'equip en perdran l'accés i hauran de tornar a triar la icona. El progrés es conserva.",
      boto: "🔓 Alliberar",
      perill: true,
      accio: () => crida("/api/master/alliberar", { teamId }),
    });
  }

  function reiniciar(teamId: string) {
    setConfirmacio({
      titol: `Reiniciar ${nomEquip(teamId)}?`,
      text: "S'esborraran les fites resoltes, les pistes, el recorregut i la consagració d'aquest equip. Si la partida corre, torna a començar des de zero.",
      boto: "↺ Reiniciar",
      perill: true,
      accio: () => crida("/api/master/reset", { teamId }),
    });
  }

  return (
    <VistaMasterEquips
      equips={equips}
      partidaIniciadaAt={partidaIniciadaAt}
      partidaAcabaAt={partidaAcabaAt}
      desfasamentMs={desfasamentMs}
      canviantPartida={canviantPartida}
      onIniciarPartida={iniciarPartida}
      onAjustarTemps={ajustarTemps}
      onAcabarTemps={acabarTemps}
      onReiniciarPartida={reiniciarPartida}
      onConsagrar={consagrar}
      onAlliberar={alliberar}
      onReiniciar={reiniciar}
      estacions={ESTACIONS_MAPA}
      posicioMaster={ubicacio.posicio ? { lat: ubicacio.posicio.lat, lng: ubicacio.posicio.lng } : null}
      comparteixo={comparteixo}
      estatUbicacio={ubicacio.estat}
      onComparteixoChange={canviarComparteixo}
      missatges={{ recents: missatgesRecents, onEnviar: enviarMissatge }}
      recorregut={{ triatId: recorregutId, dades: recorregut, onTriar: triarRecorregut }}
      connexio={connexio}
      fets={{ llista: fets, noVistos, onVeure: veureFets, avisos: avisosFragments, onEntes: entesFragments }}
      confirmacio={confirmacio}
      onTancarConfirmacio={tancarConfirmacio}
      avis={avis}
      onTancarAvis={tancarAvis}
    />
  );
}
