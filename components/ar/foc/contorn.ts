import type { ImageSegmenter } from "@mediapipe/tasks-vision";

/**
 * Contorn de foc a les persones que surten a la càmera. Un model de segmentació de persones (MediaPipe,
 * tot dins del mòbil: la imatge no surt ni es grava) dóna una màscara; d'aquesta en traiem la vora i
 * la dibuixem amb un resplendor vermell i flames que pugen. Si el model no es pot carregar (sense
 * xarxa, mòbil massa antic), l'escena continua només amb els arcs.
 *
 * El motor (wasm) i el model es baixen en obrir l'extra des de jsdelivr i Google.
 */

const VERSIO = "0.10.21";
const URL_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSIO}/wasm`;
const URL_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

/** Amplada de la imatge que es dóna al model (l'alçada ve de la proporció de la pantalla). */
const AMPLADA_ENTRADA = 192;
/** Mínim de temps entre dues segmentacions (ms). */
const INTERVAL_MS = 70;
/** Gruix de la vora en píxels de la imatge petita. */
const GRUIX = 1;

/**
 * Baixa per avançat el motor i el model (queden a la memòria cau del navegador), perquè quan es
 * toqui el botó d'entrada el contorn ja estigui gairebé a punt. Si falla, no passa res.
 */
export function precarregaContorn() {
  for (const url of [URL_MODEL, `${URL_WASM}/vision_wasm_internal.js`, `${URL_WASM}/vision_wasm_internal.wasm`]) {
    fetch(url).catch(() => {});
  }
  void import("@mediapipe/tasks-vision").catch(() => {});
}

export type EstatContorn = "carregant" | "actiu" | "no";

export class ContornPersones {
  estat: EstatContorn = "carregant";
  private segmentador: ImageSegmenter | null = null;
  private entrada: HTMLCanvasElement;
  private vora: HTMLCanvasElement;
  /** Silueta plena de les persones, per tapar el que hi ha darrere seu. */
  private ple: HTMLCanvasElement;
  private magia: HTMLCanvasElement;
  private halo: HTMLCanvasElement;
  private suau: Float32Array | null = null;
  private ultim = 0;
  private hiHaVora = false;
  private tancat = false;
  /** Resum de l'últim fotograma i de l'últim error, per a ?debug=1. */
  info = "";
  private error = "";
  private fotogrames = 0;
  private llumEntrada = -1;

  constructor() {
    this.entrada = document.createElement("canvas");
    this.vora = document.createElement("canvas");
    this.ple = document.createElement("canvas");
    this.magia = document.createElement("canvas");
    this.halo = document.createElement("canvas");
  }

  private fitxers: Awaited<ReturnType<typeof import("@mediapipe/tasks-vision").FilesetResolver.forVisionTasks>> | null = null;
  private delegat: "GPU" | "CPU" = "CPU";
  /** Fotogrames seguits amb la màscara a zero (el delegat actual no funciona en aquest mòbil). */
  private zeros = 0;
  private provatAmbTots = false;

  private async creaSegmentador(delegat: "GPU" | "CPU"): Promise<ImageSegmenter> {
    const { ImageSegmenter } = await import("@mediapipe/tasks-vision");
    if (!this.fitxers) throw new Error("sense motor");
    return ImageSegmenter.createFromOptions(this.fitxers, {
      baseOptions: { modelAssetPath: URL_MODEL, delegate: delegat },
      runningMode: "VIDEO",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
  }

  /** Comença amb la CPU (més fiable); si la màscara surt sempre buida, prova l'altre delegat. */
  async iniciar(): Promise<void> {
    try {
      const { FilesetResolver } = await import("@mediapipe/tasks-vision");
      this.fitxers = await FilesetResolver.forVisionTasks(URL_WASM);
      let s: ImageSegmenter;
      try {
        s = await this.creaSegmentador("CPU");
        this.delegat = "CPU";
      } catch {
        s = await this.creaSegmentador("GPU");
        this.delegat = "GPU";
      }
      if (this.tancat) {
        s.close();
        return;
      }
      this.segmentador = s;
      this.estat = "actiu";
    } catch (e) {
      this.estat = "no";
      this.error = `carrega: ${e instanceof Error ? e.message : String(e)}`;
      this.info = this.error;
    }
  }

  /** Canvia de delegat (una sola vegada) quan el actual només dóna màscares buides. */
  private async canviaDelegat() {
    if (this.provatAmbTots) return;
    this.provatAmbTots = true;
    const vell = this.segmentador;
    this.segmentador = null;
    vell?.close();
    try {
      const nou = this.delegat === "CPU" ? "GPU" : "CPU";
      const s = await this.creaSegmentador(nou);
      if (this.tancat) {
        s.close();
        return;
      }
      this.delegat = nou;
      this.zeros = 0;
      this.segmentador = s;
    } catch (e) {
      this.estat = "no";
      this.error = `canvi delegat: ${e instanceof Error ? e.message : String(e)}`;
      this.info = this.error;
    }
  }

  tanca() {
    this.tancat = true;
    this.segmentador?.close();
    this.segmentador = null;
  }

  /** Segmenta el fotograma actual del vídeo (com es veu a pantalla, amb el retall `cover`). */
  actualitza(video: HTMLVideoElement, cw: number, ch: number, ara: number) {
    const s = this.segmentador;
    if (!s || video.readyState < 2 || !video.videoWidth || ara - this.ultim < INTERVAL_MS) return;
    this.ultim = ara;

    const W = AMPLADA_ENTRADA;
    const H = Math.max(16, Math.round((W * ch) / cw));
    if (this.entrada.width !== W || this.entrada.height !== H) {
      this.entrada.width = W;
      this.entrada.height = H;
    }
    const g = this.entrada.getContext("2d");
    if (!g) return;
    // Retall del vídeo igual que `object-cover`, perquè la màscara quadri amb la pantalla.
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    let sw = vw;
    let sh = vh;
    if (vw / vh > cw / ch) sw = vh * (cw / ch);
    else sh = vw / (cw / ch);
    g.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);
    if (this.fotogrames % 20 === 0) {
      const mostra = g.getImageData(0, 0, W, H).data;
      let suma = 0;
      for (let i = 0; i < mostra.length; i += 4 * 97) suma += mostra[i] + mostra[i + 1] + mostra[i + 2];
      this.llumEntrada = Math.round(suma / (3 * Math.ceil(mostra.length / (4 * 97))));
    }

    try {
      s.segmentForVideo(this.entrada, ara, (res) => {
        const masques = res.confidenceMasks;
        if (!masques || masques.length === 0) return;
        // Dos mapes (fons, persona): el de la persona és el segon. Amb un de sol, és el de la persona.
        const mascara = masques[masques.length > 1 ? 1 : 0];
        this.fotogrames++;
        this.processa(mascara.getAsFloat32Array(), mascara.width, mascara.height, masques.length);
      });
    } catch (e) {
      this.estat = "no";
      this.hiHaVora = false;
      this.error = `segmenta: ${e instanceof Error ? e.message : String(e)}`;
      this.info = this.error;
    }
  }

  private processa(valors: Float32Array, mw: number, mh: number, nMasques: number) {
    if (!this.suau || this.suau.length !== valors.length) this.suau = new Float32Array(valors.length);
    const suau = this.suau;
    // Mitjana amb el fotograma anterior: la vora no tremola.
    let max = 0;
    let suma = 0;
    for (let i = 0; i < valors.length; i++) {
      if (valors[i] > max) max = valors[i];
      suma += valors[i];
    }
    // Llindar normal 0,5; si el model dóna valors baixos (màxim < 0,5) s'abaixa a la meitat del màxim.
    if (max === 0) {
      if (++this.zeros === 20) void this.canviaDelegat();
    } else this.zeros = 0;
    const llindar = max >= 0.5 ? 0.5 : Math.max(0.05, max * 0.5);
    let dins = 0;
    for (let i = 0; i < valors.length; i++) {
      suau[i] += (valors[i] - suau[i]) * 0.6;
      if (suau[i] > llindar) dins++;
    }
    // Si el model dóna el fons en lloc de la persona (gairebé tot ple), s'inverteix.
    const invertir = dins > valors.length * 0.85;

    if (this.vora.width !== mw || this.vora.height !== mh) {
      this.vora.width = mw;
      this.vora.height = mh;
    }
    const g = this.vora.getContext("2d");
    if (!g) return;
    if (this.ple.width !== mw || this.ple.height !== mh) {
      this.ple.width = mw;
      this.ple.height = mh;
    }
    const gp = this.ple.getContext("2d");
    if (!gp) return;
    const imatge = g.createImageData(mw, mh);
    const px = imatge.data;
    const imatgePle = gp.createImageData(mw, mh);
    const pp = imatgePle.data;
    const persona = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= mw || y >= mh) return true;
      return suau[y * mw + x] > llindar !== invertir;
    };
    let vores = 0;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        if (!persona(x, y)) continue;
        pp[(y * mw + x) * 4 + 3] = 255;
        if (persona(x - GRUIX, y) && persona(x + GRUIX, y) && persona(x, y - GRUIX) && persona(x, y + GRUIX)) continue;
        const k = (y * mw + x) * 4;
        px[k] = 255;
        px[k + 1] = 190 + ((x * 7 + y * 13) % 50);
        px[k + 2] = 110;
        px[k + 3] = 255;
        vores++;
      }
    }
    g.putImageData(imatge, 0, 0);
    gp.putImageData(imatgePle, 0, 0);
    this.creaResplendor(mw, mh);
    this.hiHaVora = vores > 0;
    this.info = `fot ${this.fotogrames} · masques ${nMasques} · ${mw}x${mh} · persona ${Math.round(
      (dins / valors.length) * 100,
    )}%${invertir ? " (invertit)" : ""} · vora ${vores}px · ${this.delegat} · entrada llum ${this.llumEntrada} · val max ${max.toFixed(2)} mitja ${(suma / valors.length).toFixed(2)} llindar ${llindar.toFixed(2)}`;
  }

  /** Esborra de l'escena el que cau darrere de les persones: les flames són un element del fons. */
  tapa(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!this.hiHaVora) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.ple, 0, 0, w, h);
    ctx.restore();
  }

  /**
   * Efecte màgic a dins de la silueta: energia vermella que puja, espurnes que brillen i un resplendor
   * que entra des de la vora. Es dibuixa en una imatge petita i es retalla amb la silueta.
   */
  pintaMagia(ctx: CanvasRenderingContext2D, w: number, h: number, ara: number) {
    if (!this.hiHaVora) return;
    const mw = this.ple.width;
    const mh = this.ple.height;
    if (this.magia.width !== mw || this.magia.height !== mh) {
      this.magia.width = mw;
      this.magia.height = mh;
    }
    const g = this.magia.getContext("2d");
    if (!g) return;
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, mw, mh);

    // Ones d'energia que pugen pel cos.
    const t = ara / 1000;
    const desplacament = (t * 70) % (mh * 0.5);
    const ones = g.createLinearGradient(0, -desplacament, 0, mh * 0.5 - desplacament);
    ones.addColorStop(0, "rgba(255,60,0,0.05)");
    ones.addColorStop(0.5, "rgba(255,120,20,0.4)");
    ones.addColorStop(1, "rgba(255,60,0,0.05)");
    g.fillStyle = ones;
    g.fillRect(0, 0, mw, mh);
    // El gradient només cobreix mitja alçada: es repeteix movent-lo una alçada més avall.
    g.save();
    g.translate(0, mh * 0.5);
    g.fillRect(0, -mh * 0.5, mw, mh);
    g.restore();

    // Resplendor que entra des de la vora.
    g.globalCompositeOperation = "lighter";
    g.shadowColor = "rgba(255,70,0,0.9)";
    g.shadowBlur = 9;
    g.globalAlpha = 0.8;
    g.drawImage(this.vora, 0, 0);
    g.shadowBlur = 0;
    g.globalAlpha = 1;

    // Espurnes que pugen i brillen.
    for (let i = 0; i < 70; i++) {
      const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      const b = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
      const x = a * mw + Math.sin(t * 1.5 + i) * 3;
      const velocitat = 14 + b * 30;
      const y = mh - ((t * velocitat + b * mh) % (mh + 10));
      const brill = 0.5 + 0.5 * Math.sin(t * (3 + (i % 5)) + i);
      g.globalAlpha = brill;
      g.fillStyle = i % 3 === 0 ? "rgb(255,240,190)" : "rgb(255,150,40)";
      const mida = 0.8 + b * 1.6;
      g.fillRect(x, y, mida, mida);
    }
    g.globalAlpha = 1;

    // Només a dins de la silueta.
    g.globalCompositeOperation = "destination-in";
    g.drawImage(this.ple, 0, 0);
    g.globalCompositeOperation = "source-over";

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(this.magia, 0, 0, w, h);
    ctx.restore();
  }

  /**
   * Resplendor de la vora, calculat una vegada per màscara i a mida petita (els desenfocaments són
   * cars: fer-los a pantalla completa a cada fotograma ofega un mòbil).
   */
  private creaResplendor(mw: number, mh: number) {
    if (this.halo.width !== mw || this.halo.height !== mh) {
      this.halo.width = mw;
      this.halo.height = mh;
    }
    const g = this.halo.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, mw, mh);
    g.globalCompositeOperation = "lighter";
    // Resplendor ample darrere de la persona (vermell fosc), un de mitjà, i la línia fina i calenta.
    const passes: [string, number, number][] = [
      ["rgba(200,10,0,0.9)", 20, 0.9],
      ["rgba(255,35,0,0.95)", 10, 0.9],
      ["rgba(255,120,0,1)", 3, 0.85],
    ];
    for (const [color, blur, alfa] of passes) {
      g.shadowColor = color;
      g.shadowBlur = blur;
      g.globalAlpha = alfa;
      g.drawImage(this.vora, 0, 0);
    }
    g.shadowBlur = 0;
    g.globalAlpha = 1;
  }

  /** Dibuixa la vora amb resplendor i flames que pugen, sobre un context transparent. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, ara: number) {
    if (!this.hiHaVora) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    const pols = 0.8 + 0.2 * Math.sin(ara / 90) + 0.08 * Math.sin(ara / 37);
    ctx.globalAlpha = Math.min(1, pols);
    ctx.drawImage(this.halo, 0, 0, w, h);

    // Còpies que pugen i s'esvaeixen, com flames que s'enlairen del cos.
    for (let k = 0; k < 4; k++) {
      const fase = (ara / 1100 + k / 4) % 1;
      ctx.globalAlpha = (1 - fase) * 0.5;
      const dx = Math.sin(ara / 230 + k * 2.1) * 5 * (w / 400) * fase;
      ctx.drawImage(this.halo, dx, -fase * h * 0.07, w, h);
    }
    ctx.restore();
  }
}
