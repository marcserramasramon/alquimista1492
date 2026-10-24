/** Estat del golem: camina cap a la fita, fa el senyal de venir (beckon) o es queda quiet a la fita. */
export type EstatGolem = "seguint" | "bequeig" | "quiet";

export interface PasGolem {
  x: number;
  z: number;
  /** Rumb del golem (radiants): cap a on camina, o cap al jugador quan fa el senyal. */
  yaw: number;
  estat: EstatGolem;
}

/** Cada quant es mostreja la posició del jugador, en mil·lisegons. */
const MOSTREIG_MS = 500;
/** Metres per davant del jugador on es posa el golem en començar. */
const DISTANCIA_INICI = 5;
/** Velocitat del golem quan camina, en metres per segon. */
const VELOCITAT = 1.4;
/** Un jugador es considera parat si en 3 mostres seguides (1,5 s) no s'ha mogut més de 0,3 m. */
const MOVIMENT_MIN_M = 0.3;
const MOSTRES_PARAT = 3;
/** Si el jugador és més lluny que això (m), el golem s'espera i fa el senyal. */
const DISTANCIA_MAX = 12;
/** A partir d'aquesta distància de la fita (m), el golem s'hi queda quiet. */
const RADI_FITA = 1.5;

/**
 * Seguiment del golem: cada 0,5 s es mira on és el jugador. El golem camina cap a la fita mentre el jugador
 * avança. Si el jugador s'atura, o s'allunya més de DISTANCIA_MAX, el golem es gira cap a ell i fa el senyal
 * de venir. Quan arriba a la fita, es queda quiet.
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
      const d = this.puntDavant(mostra);
      this.gx = d.x;
      this.gz = d.z;
      this.iniciat = true;
    }

    const dFita = Math.hypot(this.fx - this.gx, this.fz - this.gz);
    if (this.arribat || dFita < RADI_FITA) {
      this.arribat = true;
      this.estat = "quiet";
      this.yaw = Math.atan2(mostra.x - this.gx, mostra.z - this.gz);
      return this.pas();
    }

    const dJugador = Math.hypot(mostra.x - this.gx, mostra.z - this.gz);
    if (this.jugadorParat() || dJugador > DISTANCIA_MAX) {
      // El jugador no avança (o és massa lluny): el golem es gira cap a ell i fa el senyal.
      this.estat = "bequeig";
      this.yaw = Math.atan2(mostra.x - this.gx, mostra.z - this.gz);
      return this.pas();
    }

    // El jugador avança: el golem camina cap a la fita.
    const dx = this.fx - this.gx;
    const dz = this.fz - this.gz;
    const pas = Math.min(dFita, VELOCITAT * dt);
    this.gx += (dx / dFita) * pas;
    this.gz += (dz / dFita) * pas;
    this.estat = "seguint";
    this.yaw = Math.atan2(dx, dz);
    return this.pas();
  }

  private pas(): PasGolem {
    return { x: this.gx, z: this.gz, yaw: this.yaw, estat: this.estat };
  }

  /** Punt davant del jugador, en la direcció de la fita, a DISTANCIA_INICI metres. */
  private puntDavant(j: { x: number; z: number }): { x: number; z: number } {
    const dx = this.fx - j.x;
    const dz = this.fz - j.z;
    const dd = Math.hypot(dx, dz);
    if (dd <= DISTANCIA_INICI || dd === 0) return { x: this.fx, z: this.fz };
    return { x: j.x + (dx / dd) * DISTANCIA_INICI, z: j.z + (dz / dd) * DISTANCIA_INICI };
  }

  private jugadorParat(): boolean {
    if (this.historial.length < MOSTRES_PARAT) return false;
    const primera = this.historial[0];
    const darrera = this.historial[this.historial.length - 1];
    return Math.hypot(darrera.x - primera.x, darrera.z - primera.z) < MOVIMENT_MIN_M;
  }
}
