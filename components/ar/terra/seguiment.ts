/**
 * Estat del golem:
 * - "seguint": camina per mantenir-se davant i a l'esquerra del jugador.
 * - "gest": fa el senyal de venir (una vegada, 3 s).
 * - "quiet": s'està quiet (mirant el jugador o a la fita).
 * - "assenyala": s'està quiet i assenyala amb el braç esquerre cap a la fita (mirant cap a ella).
 */
export type EstatGolem = "seguint" | "gest" | "quiet" | "assenyala";

export interface PasGolem {
  x: number;
  z: number;
  /** Rumb del golem (radiants): cap a on camina, o cap al jugador quan està parat. */
  yaw: number;
  estat: EstatGolem;
}

/** Cada quant es mostreja la posició del jugador, en mil·lisegons. */
const MOSTREIG_MS = 500;
/** El golem es manté aquests metres més enllà del jugador, en la direcció de la fita... */
const DISTANCIA_DAVANT = 7;
/** ...i aquests metres a la seva esquerra, perquè no tapi el punt final. */
const DESPLA_ESQUERRA = 2;
/** Velocitat del golem quan camina, en metres per segon. */
const VELOCITAT = 1.4;
/** Si el jugador és a menys d'això de la fita (m), el golem s'hi queda quiet. */
const RADI_ARRIBADA = 3;

/**
 * Filtre del GPS: el GPS és lent i sorollós, així que la posició del jugador es suavitza. Un salt que implica
 * més de VEL_MAX_M_S es descarta (soroll), però si se n'acumulen REBUTJOS_MAX seguits es dona per bona
 * (el jugador s'ha desplaçat de veritat).
 */
const FILTRE_ALFA = 0.4;
const VEL_MAX_M_S = 8;
const REBUTJOS_MAX = 4;
/**
 * Histèresi de parat: el jugador es considera parat quan la velocitat suavitzada és < VEL_PARAT durant
 * TEMPS_PARAT_MS, i es considera en moviment quan és > VEL_MOURE durant TEMPS_MOURE_MS. Entre els dos
 * llindars es manté l'estat anterior, així el golem no oscil·la.
 */
const VEL_PARAT = 0.4;
const VEL_MOURE = 0.8;
const TEMPS_PARAT_MS = 2000;
const TEMPS_MOURE_MS = 1000;

/**
 * Seqüència quan el jugador està parat, en mil·lisegons des que s'ha parat:
 * senyal (0–3 s), assenyala (3–8 s), senyal (8–11 s) i assenyala (11–21 s).
 * Després avança un tros cap a la fita, es gira, fa el senyal una vegada i assenyala.
 */
const SENYAL_1_FI = 3000;
const QUIET_1_FI = 8000;
const SENYAL_2_FI = 11000;
const QUIET_2_FI = 21000;
/** Distància (m) del jugador on s'atura en l'avanç final. */
const DISTANCIA_AVANC = 3;
/** Durada del senyal final, en mil·lisegons. */
const SENYAL_FINAL_MS = 3000;
/** Quan assenyala, el golem es gira com a màxim aquests radiants des de la direcció del jugador (60°), perquè el braç es vegi. */
const GIR_ASSENYALAR = Math.PI / 3;

/**
 * Seguiment del golem: cada 0,5 s es mira on és el jugador (filtrat). El golem es manté uns metres davant seu, en
 * la direcció de la fita, i un poc a la seva esquerra. Quan el jugador s'atura, fa la seqüència de senyal i
 * assenyalar. Quan el jugador arriba a la fita, el golem es queda quiet.
 */
export class SeguimentGolem {
  private gx = 0;
  private gz = 0;
  private yaw = 0;
  private estat: EstatGolem = "quiet";
  private iniciat = false;
  private arribat = false;
  private ultimaMostra = -Infinity;
  private ultimTemps = -1;
  private tParat = -1;
  private tSenyalFinal = -1;

  // Posició del jugador suavitzada i velocitat estimada.
  private jugadorIniciat = false;
  private jx = 0;
  private jz = 0;
  private tAcceptada = -1;
  private velocitat = 0;
  private rebutjos = 0;
  private aturat = false;
  private tBaixa = -1;
  private tAlt = -1;

  constructor(private readonly fx: number, private readonly fz: number) {}

  /** `ara` en mil·lisegons; (`jx`, `jz`) és la darrera posició crua del jugador (GPS). */
  update(ara: number, rawX: number, rawZ: number): PasGolem {
    // Segons des de l'última crida, limitats: un salt de pestanya no fa caminar el golem de cop.
    const dt = this.ultimTemps < 0 ? 0 : Math.min(0.1, (ara - this.ultimTemps) / 1000);
    this.ultimTemps = ara;

    if (ara - this.ultimaMostra >= MOSTREIG_MS) {
      this.ultimaMostra = ara;
      this.actualitzaJugador(ara, rawX, rawZ);
    }
    const mostra = { x: this.jx, z: this.jz };

    if (!this.iniciat) {
      const a = this.ancora(mostra);
      this.gx = a.x;
      this.gz = a.z;
      this.iniciat = true;
    }

    const mirarJugador = Math.atan2(mostra.x - this.gx, mostra.z - this.gz);
    // Assenyalant: gira només fins a GIR_ASSENYALAR cap a la fita, des de la direcció del jugador.
    const angleFita = Math.atan2(this.fx - this.gx, this.fz - this.gz);
    const diferenciaFita = Math.atan2(Math.sin(angleFita - mirarJugador), Math.cos(angleFita - mirarJugador));
    const mirarFita = mirarJugador + Math.max(-GIR_ASSENYALAR, Math.min(GIR_ASSENYALAR, diferenciaFita));
    const dFitaJugador = Math.hypot(this.fx - mostra.x, this.fz - mostra.z);
    if (this.arribat || dFitaJugador < RADI_ARRIBADA) {
      this.arribat = true;
      this.estat = "quiet";
      this.yaw = mirarJugador;
      return this.pas();
    }

    if (this.aturat) {
      if (this.tParat < 0) this.tParat = ara;
      const e = ara - this.tParat;
      if (e < SENYAL_1_FI) {
        this.estat = "gest";
        this.yaw = mirarJugador;
      } else if (e < QUIET_1_FI) {
        this.estat = "assenyala";
        this.yaw = mirarFita;
      } else if (e < SENYAL_2_FI) {
        this.estat = "gest";
        this.yaw = mirarJugador;
      } else if (e < QUIET_2_FI) {
        this.estat = "assenyala";
        this.yaw = mirarFita;
      } else {
        // Avança un tros cap a la fita, es para a uns metres del jugador, es gira i fa el senyal una vegada.
        const tgt = this.puntLateral(mostra, DISTANCIA_AVANC);
        const dx = tgt.x - this.gx;
        const dz = tgt.z - this.gz;
        const dT = Math.hypot(dx, dz);
        if (this.tSenyalFinal < 0 && dT > 0.3) {
          this.estat = "seguint";
          const pas = Math.min(dT, VELOCITAT * dt);
          this.gx += (dx / dT) * pas;
          this.gz += (dz / dT) * pas;
          this.yaw = Math.atan2(dx, dz);
        } else {
          if (this.tSenyalFinal < 0) this.tSenyalFinal = ara;
          this.estat = ara - this.tSenyalFinal < SENYAL_FINAL_MS ? "gest" : "assenyala";
          this.yaw = ara - this.tSenyalFinal < SENYAL_FINAL_MS ? mirarJugador : mirarFita;
        }
      }
      return this.pas();
    }

    // El jugador es mou: es reinicia la seqüència.
    this.tParat = -1;
    this.tSenyalFinal = -1;
    // El golem es manté davant i a l'esquerra del jugador.
    const a = this.ancora(mostra);
    const dx = a.x - this.gx;
    const dz = a.z - this.gz;
    const dA = Math.hypot(dx, dz);
    if (dA > 0.3) {
      this.estat = "seguint";
      // Si el jugador va ràpid i el golem es queda enrere, accelera per posar-se a la posició (fins a 6 m/s).
      const velocitatGolem = Math.min(6, VELOCITAT + dA * 0.5);
      const pas = Math.min(dA, velocitatGolem * dt);
      this.gx += (dx / dA) * pas;
      this.gz += (dz / dA) * pas;
      this.yaw = Math.atan2(dx, dz);
    } else {
      this.estat = "quiet";
      this.yaw = mirarJugador;
    }
    return this.pas();
  }

  /** Filtra la posició crua del GPS, estima la velocitat i actualitza l'estat de parat amb histèresi. */
  private actualitzaJugador(ara: number, rawX: number, rawZ: number): void {
    if (!this.jugadorIniciat) {
      this.jugadorIniciat = true;
      this.jx = rawX;
      this.jz = rawZ;
      this.tAcceptada = ara;
      return;
    }
    const dt = (ara - this.tAcceptada) / 1000;
    if (dt <= 0) return;

    // Salt impossible: es descarta (soroll del GPS), però si es repeteix es dona per bo.
    const salt = Math.hypot(rawX - this.jx, rawZ - this.jz);
    if (salt / dt > VEL_MAX_M_S && this.rebutjos < REBUTJOS_MAX) {
      this.rebutjos++;
      return;
    }
    this.rebutjos = 0;

    const nx = this.jx + FILTRE_ALFA * (rawX - this.jx);
    const nz = this.jz + FILTRE_ALFA * (rawZ - this.jz);
    const velocitatInstant = Math.hypot(nx - this.jx, nz - this.jz) / dt;
    this.velocitat = 0.7 * this.velocitat + 0.3 * velocitatInstant;
    this.jx = nx;
    this.jz = nz;
    this.tAcceptada = ara;

    // Histèresi: per passar a parat o a moviment cal mantenir la velocitat un temps.
    if (this.aturat) {
      if (this.velocitat > VEL_MOURE) {
        if (this.tAlt < 0) this.tAlt = ara;
        if (ara - this.tAlt >= TEMPS_MOURE_MS) {
          this.aturat = false;
          this.tAlt = -1;
        }
      } else {
        this.tAlt = -1;
      }
    } else {
      if (this.velocitat < VEL_PARAT) {
        if (this.tBaixa < 0) this.tBaixa = ara;
        if (ara - this.tBaixa >= TEMPS_PARAT_MS) {
          this.aturat = true;
          this.tBaixa = -1;
        }
      } else {
        this.tBaixa = -1;
      }
    }
  }

  private pas(): PasGolem {
    return { x: this.gx, z: this.gz, yaw: this.yaw, estat: this.estat };
  }

  /** On ha d'estar el golem mentre el jugador camina: davant seu (cap a la fita) i a l'esquerra. */
  private ancora(j: { x: number; z: number }): { x: number; z: number } {
    return this.puntLateral(j, DISTANCIA_DAVANT);
  }

  /** Punt a `distancia` metres del jugador en la direcció de la fita, desplaçat a l'esquerra. */
  private puntLateral(j: { x: number; z: number }, distancia: number): { x: number; z: number } {
    const lx = this.fx - j.x;
    const lz = this.fz - j.z;
    const ll = Math.hypot(lx, lz);
    if (ll === 0) return { x: j.x, z: j.z };
    const ux = lx / ll;
    const uz = lz / ll;
    const d = Math.min(distancia, ll);
    // Costat esquerre de qui camina cap a la fita.
    return { x: j.x + ux * d + uz * DESPLA_ESQUERRA, z: j.z + uz * d - ux * DESPLA_ESQUERRA };
  }
}
