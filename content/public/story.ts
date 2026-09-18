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
      "Sense poder-se moure del llit, mossèn Ramon ha escrit de pròpia mà una nota amb sis noms de sospitosos i us l'ha confiada a vosaltres, perquè reuniu un grup de joves de confiança que investigui abans que la carta sigui entregada.",
      '**Vosaltres sou aquest grup.**',
      "El Mossèn us espera pel poble amb la nota a la mà. Recorreu les quatre fites — el Serrat de les Bruixes, la Font del Ferro, Planes Bones i el Cementiri — per reunir proves, trobeu el traïdor i feu sonar el sometent abans que trenqui l'alba.",
    ],
  },
  {
    id: 'alerta-vigies',
    stationId: 'serrat',
    eyebrow: 'Estació 1 · Serrat de les Bruixes',
    title: "L'Alerta dels Vigies",
    icon: '🔥',
    paragraphs: [
      "Així parlen els serrats de nit quan no es pot enviar cap emissari pel camí ral. La nit del 15 de maig de 1705, des del Serrat de les Bruixes van albirar senyals de foc procedents de la Plana.",
      "Un informador secret de dins de Vic ens ha advertit: **la carta que delata el Pacte està escrita de mà pròpia**. Això vol dir que qui ens ha traït no és analfabet: sap llegir i escriure.",
    ],
  },
  {
    id: 'tinta-negra',
    stationId: 'font_ferro',
    eyebrow: 'Estació 2 · Font del Ferro',
    title: "L'Aigua que no Menteix",
    icon: '💧',
    paragraphs: [
      "La carta trobada que delata la reunió dels Vigatans no està escrita amb una tinta qualsevol. Els perits han comprovat que es tracta de **tinta ferrosa de gales**, l'única emprada pels escrivans i notaris de la plana.",
      "Els nens que l'han trobada tenien les mans brutes de tinta, devia ser fresca. **Havia estat escrita el mateix dia**, pel matí o a primera hora de la tarda.",
      "A tot el terme de Sentfores i la Guixa només hi ha un brollador amb el contingut de ferro suficient per ennegrir les gales de roure: **la Font del Ferro**.",
      "Qui va escriure la carta va haver de venir personalment a cercar aigua a aquesta font, o va enviar algú a omplir els càntirs. Descobrint el dia exacte en què es va collir l'aigua podrem saber qui hi era present... i sobretot, **qui en queda totalment lliure de tota sospita**.",
    ],
  },
]

/**
 * Get all story entries in reading order.
 */
export function getAllStoryEntries(): StoryEntry[] {
  return STORY_ENTRIES
}
