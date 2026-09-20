import 'server-only';

export type CoartadaType = 'llevadora' | 'medicament' | 'rector' | 'personaPerduda' | 'mestre';

export interface Coartada {
  type: CoartadaType;
  frases: [string, string, string, string]; // Exactly 4 frases
}

export const COARTADAS: Record<string, Coartada> = {
  A: {
    type: 'llevadora',
    frases: [
      'En Josep va portar aiguardent i draps nets al mas de la Carmeta durant la nit quan va arribar la llevadora.',
      'La matrona Miquel va entrar al mas quan els crits de la parturienta es sentien des del camí públic.',
      'En Ricard va estar tota la nit fora del mas portant aigua freda i brasa pel foc que escalfava l\'aigua.',
      'Els veïns propers juren que van veure moviment continu a la casa: anar i venir de dones amb pans i roba blanca.',
    ],
  },

  B: {
    type: 'medicament',
    frases: [
      'La Josepa estava malalta de calentura alta, i en Josep va córrer fins a mossèn Ramon que guarda les herbes medicinals de la rectoria.',
      'En Tomàs va ser vist per quatre persones distintes carregant una bossa amb tònica de sàlvia i mel comprada a la casa de l\'Esteve.',
      'A la finestra de la casa hi havia una carteta clavada amb la recepta escrita per mossèn Ramon per curar la malaltia.',
      'L\'home del molí pot jurar que en Miquel va passar per la riera portant una ampoleta de líquid vermellós lligada a la cinta.',
    ],
  },

  C: {
    type: 'rector',
    frases: [
      'Mossèn Ramon va cridar en Joan pel sacrament per anar a visitar un moribund al mas de Sots que estava morint de febres.',
      'En Valentí pot certificar-ho: era ell qui portava la vela blanca, l\'aigua beneïda i el crucifix del rector pel camí de serena.',
      'Els infants del poble van veure el sacerdot i el seu ajudant pujant cap a la capella de Sant Jaume amb les vestidures.',
      'El rector escriu al llibre de defuncions que va administrar els olis sants aquella nit a tres cases del terme.',
    ],
  },

  D: {
    type: 'personaPerduda',
    frases: [
      'L\'oncle de la Fada va desaparèixer al capvespre, i la seva mare va cridar desesperada a tot el poble demanant gent per buscar-lo.',
      'Més de deu homes es van reunir amb torxes per cercar pels camps foscos, inclòs en Pau i en Miquel, fins ben entrada la matinada.',
      'Van trobar el fugitiu adormit sota el granero de l\'Esteve, confós i desorientat per la foscor i la soletat.',
      'Per això tots aquells homes de la partida van estar junts aquella nit sencera, sota les estrelles, buscant per les roquetes i les passes.',
    ],
  },

  E: {
    type: 'mestre',
    frases: [
      'El mestre havia deixat tancat l\'estudi per pujar a la rectoria portant els comptes de les escoles que mossèn Ramon li demanava urgentment.',
      'Els nens que aprenen lletres van declarar que en Bernat el mestre va arribar molt tard aquell dia, tot suant i assedegat de la pujada.',
      'En Josep, el fill del carnisser, va veure el mestre baixant ràpidament del camí de la rectoria amb papers a la mà i cara de preocupació.',
      'L\'ajuda de mestre, una noia del poble, va haver de tancar ella mateixa els portals de l\'estudi perquè el mestre no tornava aquella tarda.',
    ],
  },
};

/**
 * Selects a random coartada from the available options.
 */
export function selectRandomCoartada(): Coartada {
  const keys = Object.keys(COARTADAS) as Array<keyof typeof COARTADAS>;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return COARTADAS[randomKey];
}
