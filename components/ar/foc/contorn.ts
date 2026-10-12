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
const GRUIX = 2;

export type EstatContorn = "carregant" | "actiu" | "no";

export class ContornPersones {
  estat: EstatContorn = "carregant";
  private segmentador: ImageSegmenter | null = null;
  private entrada: HTMLCanvasElement;
  private vora: HTMLCanvasElement;
  private suau: Float32Array | null = null;
  private ultim = 0;
  private hiHaVora = false;
  private tancat = false;

  constructor() {
    this.entrada = document.createElement("canvas");
    this.vora = document.createElement("canvas");
  }

  async iniciar(): Promise<void> {
    try {
      const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
      const fitxers = await FilesetResolver.forVisionTasks(URL_WASM);
      const opcions = (delegate: "GPU" | "CPU") => ({
        baseOptions: { modelAssetPath: URL_MODEL, delegate },
        runningMode: "VIDEO" as const,
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
      let s: ImageSegmenter;
      try {
        s = await ImageSegmenter.createFromOptions(fitxers, opcions("GPU"));
      } catch {
        s = await ImageSegmenter.createFromOptions(fitxers, opcions("CPU"));
      }
      if (this.tancat) {
        s.close();
        return;
      }
      this.segmentador = s;
      this.estat = "actiu";
    } catch {
      this.estat = "no";
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

    try {
      s.segmentForVideo(this.entrada, ara, (res) => {
        const masques = res.confidenceMasks;
        if (!masques || masques.length === 0) return;
        // Dos mapes (fons, persona): el de la persona és el segon. Amb un de sol, és el de la persona.
        const mascara = masques[masques.length > 1 ? 1 : 0];
        this.processa(mascara.getAsFloat32Array(), mascara.width, mascara.height);
      });
    } catch {
      this.estat = "no";
      this.hiHaVora = false;
    }
  }

  private processa(valors: Float32Array, mw: number, mh: number) {
    if (!this.suau || this.suau.length !== valors.length) this.suau = new Float32Array(valors.length);
    const suau = this.suau;
    // Mitjana amb el fotograma anterior: la vora no tremola.
    let dins = 0;
    for (let i = 0; i < valors.length; i++) {
      suau[i] += (valors[i] - suau[i]) * 0.6;
      if (suau[i] > 0.5) dins++;
    }
    // Si el model dóna el fons en lloc de la persona (gairebé tot ple), s'inverteix.
    const invertir = dins > valors.length * 0.85;

    if (this.vora.width !== mw || this.vora.height !== mh) {
      this.vora.width = mw;
      this.vora.height = mh;
    }
    const g = this.vora.getContext("2d");
    if (!g) return;
    const imatge = g.createImageData(mw, mh);
    const px = imatge.data;
    const persona = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= mw || y >= mh) return true;
      return suau[y * mw + x] > 0.5 !== invertir;
    };
    let vores = 0;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        if (!persona(x, y)) continue;
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
    this.hiHaVora = vores > 0;
  }

  /** Dibuixa la vora amb resplendor i flames que pugen, sobre un context transparent. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, ara: number) {
    if (!this.hiHaVora) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    const escala = w / 400;
    const pols = 0.75 + 0.25 * Math.sin(ara / 90) + 0.1 * Math.sin(ara / 37);

    // Resplendor vermell ample, i després un de més estret i més calent.
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = "rgba(255,30,0,0.95)";
    ctx.shadowBlur = 34 * escala * pols;
    ctx.drawImage(this.vora, 0, 0, w, h);
    ctx.shadowColor = "rgba(255,120,0,1)";
    ctx.shadowBlur = 11 * escala;
    ctx.drawImage(this.vora, 0, 0, w, h);

    // Còpies que pugen i s'esvaeixen, com flames que s'enlairen del cos.
    for (let k = 0; k < 4; k++) {
      const fase = (ara / 1100 + k / 4) % 1;
      ctx.globalAlpha = (1 - fase) * 0.55;
      ctx.shadowColor = "rgba(255,50,0,0.9)";
      ctx.shadowBlur = 14 * escala;
      const dx = Math.sin(ara / 230 + k * 2.1) * 5 * escala * fase;
      ctx.drawImage(this.vora, dx, -fase * h * 0.07, w, h);
    }
    ctx.restore();
  }
}
