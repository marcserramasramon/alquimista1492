/**
 * Textos dels cartells físics de les fites (docs/fites-nova.md).
 * Van impresos al cartell que hi ha a cada lloc, per tant són públics.
 *
 * `pendent`: el text encara no quadra amb la fita. La vista d'impressió ho
 * avisa a la pantalla (no al paper) perquè no s'imprimeixi per error.
 */

export interface PoemaCartell {
  /** Text en prosa poètica, un element per paràgraf. */
  paragrafs: string[];
  /** Il·lustració del cartell (public/images/cartells/). */
  imatge: string;
  /** Il·lustració vertical per a la versió amb la imatge de fons (public/images/cartells/fons/). */
  fons: string;
  /** background-position del fons quan el centre no és el que s'ha de veure (per defecte, centrat). */
  fonsPosicio?: string;
  pendent?: string;
}

export const POEMES_CARTELLS: Record<string, PoemaCartell> = {
  "font-ferro": {
    imatge: "/images/cartells/font-ferro.jpg",
    fons: "/images/cartells/fons/font-ferro.jpg",
    // El cap de lleó és a dalt de tot: si es centra, el tapa la capçalera.
    fonsPosicio: "50% 20%",
    pendent: "El text diu que el número \"doblarà la seva força\", però la resposta és 1 (no hi ha cap doble).",
    paragrafs: [
      "Tres puntes governen el curs del misteri, el batec sagrat que obre la senda. On la bèstia de bronze guarda el corrent i la roda desafia el repòs, l'origen es desvetlla davant d'aquell qui sap aturar el pas i escoltar la primera vibració.",
      "El pergamí roman cec sota la volta celeste, esperant la carícia del bateig. Deixa que el raig del guardià amari el buit silenciós: allò que s'havia ocultat doblarà la seva força quan la humitat trenqui el vel.",
    ],
  },
  "planes-bones": {
    imatge: "/images/cartells/planes-bones.jpg",
    fons: "/images/cartells/fons/planes-bones.jpg",
    paragrafs: [
      "El fang ancestral reposa en l'obaga, bressol dels tres principis de la Gran Obra. Entre la sal que fixa, el sofre que crema sense flama i el mercuri volàtil, la matèria jeu silent esperant l'ull atent de l'iniciat.",
      "Oblida els vells tractats i cerca el testimoni dels cossos d'argila. Quants recipients custodien el recer? Compta cada alè de terra que vetlla el racó; en la totalitat dels seus guardians trobaràs la clau mineral.",
    ],
  },
  foc: {
    imatge: "/images/cartells/foc.jpg",
    fons: "/images/cartells/fons/foc.jpg",
    pendent: "El text porta al número del \"brot naixent\" (verd), però el cartell el posa en vermell.",
    paragrafs: [
      "Un alè incandescent dorm empresonat en el vidre, foc que no crema la pell ni desprèn cendra. A les portes del recinte s'estén un mar de confusions cromàtiques, on les ombres i les llums lluiten per enganyar la mirada ingènua.",
      "Interposa la gemma carmesí entre els teus ulls i el laberint vibrant. Quan la flama domi el miratge i devori el fals reflex, només el rastre del brot naixent s'alçarà victoriós entre la tenebra.",
    ],
  },
  aire: {
    imatge: "/images/cartells/aire.jpg",
    fons: "/images/cartells/fons/aire.jpg",
    pendent: "El text demana restar el número del vidre del gravat de la creu, però la resposta és 4, el número del vidre, sense resta.",
    paragrafs: [
      "Al cim ventós, el ferro immòbil sosté la memòria dels segles, custodiant quatre marques a la seva base. Però l'esperit volàtil requereix quelcom més subtil: una mirada sobre la transparència freda que roman muda a la llum ordinària.",
      "Ofrena el caliu del teu propi alè sobre la làmina gelada perquè l'efímer es faci visible. Resta el missatge que la boira desvetlli d'allò gravat a la soca; la diferència serà el tribut que l'aire et concedeix.",
    ],
  },
  anima: {
    imatge: "/images/cartells/anima.jpg",
    fons: "/images/cartells/fons/anima.jpg",
    paragrafs: [
      "Onades petrificades tracen un laberint de runa i falses aparences. Incomptables glifs dormen escampats com estels caiguts a la pols; però la quintaessència no habita el fons del cresol, sinó l'àpex que desafia el buit.",
      "Només la cresta dominant custodia el batec vertader. Desperta la teva flama porpra sobre la roca més alta, i la runa coronada revelarà l'últim misteri.",
    ],
  },
};
