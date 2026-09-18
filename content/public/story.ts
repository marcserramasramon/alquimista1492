/**
 * Story Log Entries - Public Content
 *
 * Narrative entries shown to the player in the "Història" tab. The first
 * entry (the intro) is always unlocked; the rest unlock as the team solves
 * the station whose narrative they belong to.
 */

export interface StoryEntry {
  id: string
  /** Station id that unlocks this entry when solved. Omit for always-unlocked entries. */
  stationId?: string
  /** Optional secondary or alias station ids that can also unlock this entry */
  stationAliases?: string[]
  eyebrow: string
  title: string
  icon: string
  /** Paragraphs of the entry. Wrap text in **double asterisks** for emphasis. */
  paragraphs: string[]
}

export const STORY_ENTRIES: StoryEntry[] = [
  {
    id: 'intro',
    eyebrow: 'Nit del 16 de maig de 1705 · La Guixa',
    title: 'EL PACTE TRAÏT',
    icon: '📖',
    paragraphs: [
      "Demà, a l'alba, un grup de vigatans signarà en secret un pacte a l'ermita de Sant Sebastià a favor de l'arxiduc Carles. És traïció contra Felip V, i qui hi signi s'hi juga el coll.",
      "Mossèn Ramon, el rector de la Guixa, ha caigut malalt de febres just quan més falta feia. Per les fogueres dels vigies ha rebut un avís: algú ha escrit al virrei Velasco amb els noms dels conjurats.",
      "Sense poder-se moure del llit, mossèn Ramon ha coordinat un grup de joves de confiança que investigui abans que la carta sigui entregada.",
      '**Vosaltres sou aquest grup.**',
      "Recorreu les fites del terme — el Serrat de les Bruixes, la Font del Ferro, Planes Bones i el Cementiri — per reunir proves, trobeu el traïdor i feu sonar el sometent abans que trenqui l'alba.",
    ],
  },
  {
    id: 'alerta-vigies',
    stationId: 'serrat-bruixes',
    stationAliases: ['serrat', 'serrat_bruixes'],
    eyebrow: 'Estació 1 · Serrat de les Bruixes',
    title: "L'Alerta dels Vigies",
    icon: '🔥',
    paragraphs: [
      "Així parlen els serrats de nit quan no es pot enviar cap emissari pel camí ral. La nit del 15 de maig de 1705, des del Serrat de les Bruixes van albirar senyals de foc procedents de la Plana.",
      "Desxifrant les fogueres amb la taula de Polibi, el missatge secret és contundent: **SAP DE LLETRA**.",
      "Això vol dir que qui ens ha traït no és analfabet: sap llegir i escriure. **En Pere del Molí i en Joan el traginer, que signen amb una creu, queden completament descartats**.",
      "Xifra elemental descoberta: **FOC = 4**.",
    ],
  },
  {
    id: 'tinta-negra',
    stationId: 'font-ferro',
    stationAliases: ['font_ferro'],
    eyebrow: 'Estació 2 · Font del Ferro',
    title: "L'Aigua que no Menteix",
    icon: '💧',
    paragraphs: [
      "La carta trobada que delata la reunió dels Vigatans està escrita amb **tinta ferrosa de gales**, l'emprada pels escrivans i notaris.",
      "A tot el terme de Sentfores i la Guixa només hi ha un brollador amb prou ferro per ennegrir les gales de roure: **la Font del Ferro**.",
      "Comprovant la recepta (que demana tres dies sencers en remull) i la data de redacció, l'aigua es va recollir el **dia 12 de maig**. Aquell dia, la Marianna de l'Hostal era a mercat a Vic: **la Marianna queda lliure de sospita**.",
      "En canvi, el registre de càntirs demostra que **es van lliurar dos càntirs d'aigua per a l'escola de la Guixa**.",
      "Xifra elemental descoberta: **AIGUA = 2**.",
    ],
  },
  {
    id: 'ronda-patrulla',
    stationId: 'planes-bones',
    stationAliases: ['planes_bones'],
    eyebrow: 'Estació 3 · Planes Bones',
    title: 'La Ronda de la Patrulla',
    icon: '🗺️',
    paragraphs: [
      "A Planes Bones es creuen els camins nocturns i les rondes de vigilància. Reconstruint els moviments de la nit del 15, la coartada de l'Isidre el ferrer queda corroborada pas a pas.",
      "En Joan el traginer el va veure al paller a les 22:20, en Pere el va saludar al molí a les 22:40, i la patrulla armada el va trobar treballant a la farga a les 23:00 en punt. **L'Isidre queda totalment descartat**.",
      "Però un testimoni aporta un detall inquietant: mentre la plana era fosca, **hi havia llum encesa a l'aula de l'escola a deshores**.",
      "Xifra elemental descoberta: **TERRA = 3**.",
    ],
  },
  {
    id: 'signatura-difunt',
    stationId: 'cementiri',
    eyebrow: 'Estació 4 · Cementiri de la Guixa',
    title: 'La Signatura del Difunt',
    icon: '🪦',
    paragraphs: [
      "La carta del delator anava signada amb un nom estrany. Examinant les làpides del cementiri i creuant-les amb el llibre de difunts de la parròquia, la veritat surt a la llum:",
      "El delator va copiar el nom de **Joseph Coromines (difunt el 1698)**, però el va escriure malament a la làpida: **Corminas**.",
      "Qui té accés als registres parroquials per copiar noms antics? Tothom mira **l'Anton, el jove escolà**, que en guarda la clau... A més, el document porta una marca personal: un **segell de ploma i clau** i paper amb **filigrana d'àncora**.",
      "Xifra elemental descoberta: **PEDRA = 1**.",
    ],
  },
  {
    id: 'gir-masset',
    stationId: 'pla-masset',
    stationAliases: ['pla_masset', 'pla-masset-accusation', 'pla-masset-control', 'acusacio'],
    eyebrow: 'Estació 5/6 · Pla de Masset',
    title: 'El Gir: La Ferida del Rector',
    icon: '⚡',
    paragraphs: [
      "Al Pla de Masset, mentre tothom sospita de l'Anton, l'escolà arriba esbufegant i amb les robes esquinçades: **mossèn Ramon ha estat atacat a la rectoria!**",
      "Un intrús ha colpejat el vell rector i ha intentat prendre-li la clau de la caixa de les almoines. L'Anton porta la **declaració signada pel rector**: la nit del 15 va passar sencera vetllant mossèn Ramon malalt. **L'Anton és innocent!**",
      "De sobte, totes les peces s'ajunten i assenyalen una sola persona:",
      "El segell de ploma i clau és el del mestre. L'escola va rebre els càntirs de tinta. Hi havia llum a l'escola a deshores. I els nens aprenen cal·ligrafia copiant noms del registre de difunts. **El traïdor és en Bernat, el mestre d'escola!**",
    ],
  },
  {
    id: 'caixa-almoines',
    stationId: 'caixa-almoines',
    stationAliases: ['caixa_almoines', 'rectoria-caixa', 'rectoria'],
    eyebrow: 'Estació 7 · Rectoria i Caixa de les Almoines',
    title: 'La Caixa i el Rescat del Fill',
    icon: '🪎',
    paragraphs: [
      "La clau que el rector va llençar a la foscor abans de desmaiar-se permet obrir la caixa de les almoines sota el porxo, amb el codi dels quatre elements: **4 - 2 - 3 - 1** (Foc, Aigua, Terra, Pedra).",
      "A dins hi ha la carta autèntica de Bernat i una nota terrible del capità de la guarnició de Vic: **«Els noms a trenc d'alba, i el vostre fill dorm a casa»**.",
      "Ara s'entén tot: **en Jaume, el fill de dinou anys de Bernat, està pres a la guarnició de Vic**. El mestre no actuava per cobdícia, sinó desesperat per salvar la vida del seu fill.",
      "Mossèn Ramon havia preparat una **carta falsa** amb noms ficticis. Segellada amb el segell autèntic de Bernat, l'entregareu a l'Emissari sota la contrasenya: **«L'alba ve de Vic»**.",
    ],
  },
  {
    id: 'sometent-campanar',
    stationId: 'sometent-campanar',
    stationAliases: ['campanar', 'bells-sometent', 'bells_sometent', 'campanar-sometent'],
    eyebrow: "Estació 8 · Campanar de Sant Sebastià",
    title: "El Sometent de l'Alba",
    icon: '🔔',
    paragraphs: [
      "Enganyat l'Emissari amb la carta falsa, arriba la darrera súplica d'en Bernat abans de tocar la campana: «Vosaltres què hauríeu fet?». La decisió entre compassió i justícia quedarà per a la història.",
      "Amb el codi dels quatre elements s'obre l'escala del campanar. El batall colpeja el bronze amb força: **el sometent repica sobre tota la plana d'Osona**.",
      "A l'ermita de Sant Sebastià, els patriotes senten l'avís i es dispersen pels camins segurs abans que els dragons de Felip V arribin a encerclar-los.",
      "Aquella nit, **el Pacte dels Vigatans s'ha salvat gràcies al vostre equip**.",
    ],
  },
]

/**
 * Get all story entries in reading order.
 */
export function getAllStoryEntries(): StoryEntry[] {
  return STORY_ENTRIES
}
