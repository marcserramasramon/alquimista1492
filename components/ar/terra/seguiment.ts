/**
 * Estat del golem:
 * - "seguint": camina per mantenir-se davant i a l'esquerra del jugador.
 * - "gest": fa el senyal de venir (una vegada, 3 s).
 * - "quiet": s'està quiet (mirant el jugador o a la fita).
 */
export type EstatGolem = "seguint" | "gest" | "quiet";

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
/** Un jugador es considera parat si en 3 mostres seguides (1,5 s) no s'ha mogut més de 0,3 m. */
const MOVIMENT_MIN_M = 0.3;
const MOSTRES_PARAT = 3;
/** Si el jugador és més lluny que això (m), el golem s'espera quiet. */
const DISTANCIA_MAX = 12;
/** Si el jugador és a menys d'això de la fita (m), el golem s'hi queda quiet. */
const RADI_ARRIBADA = 3;

/**
 * Seqüència quan el jugador està parat, en mil·lisegons des que s'ha parat:
 * senyal (0–3 s), quiet (3–8 s), senyal (8–11 s) i quiet (11–21 s).
 * Després avança un tros cap a la fita, es gira, fa el senyal una vegada i es queda quiet.
 */
const SENYAL_1_FI = 3000;
const QUIET_1_FI = 8000;
const SENYAL_2_FI = 11000;
const QUIET_2_FI = 21000;
/** Distància (m) del jugador on s'atura en l'avanç final. */
const DISTANCIA_AVANC = 3;
/** Durada del senyal final, en mil·lisegons. */
const SENYAL_FINAL_MS = 3000;

/**
 * Seguiment del golem: cada 0,5 s es mira on és el jugador. El golem es manté uns metres davant seu, en la
 * direcció de la fita, i un poc a la seva esquerra. Quan el jugador s'atura, fa la seqüència de senyal i
 * espera. Quan el jugador arriba a la fita, el golem es queda quiet.
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
  private historial: { x: number; z: number }[] = [];

  constructor(private readonly fx: number, private readonly fz: number) {}

  /** `ara` en mil·lisegons; (`jx`, `jz`) és la posició actual del jugador. */
  update(ara: number, jx: number, jz: number): PasGolem {
    // Segons des de l'última crida, limitats: un salt de pestanya no fa caminar el golem de cop.
    const dt = this.ultimTemps < 0 ? 0 : Math.min(0.1, (ara - this.ultimTemps) / 1000);
    this.ultimTemps = ara;

    if (ara - this.ultimaMostra >= MOSTREIG_MS) {
      this.ultimaMostra = ara;
      this.historial.push({ x: jx, z: jz });
      if (this.historial.length > MOSTRES_PARAT) this.historial.shift();
    }
    const mostra = this.historial[this.historial.length - 1] ?? { x: jx, z: jz };

    if (!this.iniciat) {
      const a = this.ancora(mostra);
      this.gx = a.x;
      this.gz = a.z;
      this.iniciat = true;
    }

    const mirarJugador = Math.atan2(mostra.x - this.gx, mostra.z - this.gz);
    const dFitaJugador = Math.hypot(this.fx - mostra.x, this.fz - mostra.z);
    if (this.arribat || dFitaJugador < RADI_ARRIBADA) {
      this.arribat = true;
      this.estat = "quiet";
      this.yaw = mirarJugador;
      return this.pas();
    }

    if (this.jugadorParat()) {
      if (this.tParat < 0) this.tParat = ara;
      const e = ara - this.tParat;
      if (e < SENYAL_1_FI) {
        this.estat = "gest";
        this.yaw = mirarJugador;
      } else if (e < QUIET_1_FI) {
        this.estat = "quiet";
        this.yaw = mirarJugador;
      } else if (e < SENYAL_2_FI) {
        this.estat = "gest";
        this.yaw = mirarJugador;
      } else if (e < QUIET_2_FI) {
        this.estat = "quiet";
        this.yaw = mirarJugador;
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
          this.estat = ara - this.tSenyalFinal < SENYAL_FINAL_MS ? "gest" : "quiet";
          this.yaw = mirarJugador;
        }
      }
      return this.pas();
    }

    // El jugador es mou: es reinicia la seqüència.
    this.tParat = -1;
    this.tSenyalFinal = -1;
    const dJugador = Math.hypot(mostra.x - this.gx, mostra.z - this.gz);
    if (dJugador > DISTANCIA_MAX) {
      // Massa lluny: el golem espera quiet que el jugador s'acosti.
      this.estat = "quiet";
      this.yaw = mirarJugador;
      return this.pas();
    }

    // El golem es manté davant i a l'esquerra del jugador.
    const a = this.ancora(mostra);
    const dx = a.x - this.gx;
    const dz = a.z - this.gz;
    const dA = Math.hypot(dx, dz);
    if (dA > 0.3) {
      this.estat = "seguint";
      const pas = Math.min(dA, VELOCITAT * dt);
      this.gx += (dx / dA) * pas;
      this.gz += (dz / dA) * pas;
      this.yaw = Math.atan2(dx, dz);
    } else {
      this.estat = "quiet";
      this.yaw = mirarJugador;
    }
    return this.pas();
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

  private jugadorParat(): boolean {
    if (this.historial.length < MOSTRES_PARAT) return false;
    const primera = this.historial[0];
    const darrera = this.historial[this.historial.length - 1];
    return Math.hypot(darrera.x - primera.x, darrera.z - primera.z) < MOVIMENT_MIN_M;
  }
}
