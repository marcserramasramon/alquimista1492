import type { ImageSegmenter } from "@mediapipe/tasks-vision";

/**
 * Llum difuminada sobre les persones que surten a la càmera. Un model de segmentació de persones
 * (MediaPipe, tot dins del mòbil: la imatge no surt ni es grava) dóna una màscara. D'aquesta en fem un
 * filtre fluix de color taronja-vermell sobre el cos, que s'esvaeix cap a fora, i una llum més càlida
 * que realça els nuclis (les parts més gruixudes: el tors) sense cap vora rígida.
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
/** Respiració lenta de la llum (0-1), amb un cicle d'uns 5 segons. */
function respiracio(ara: number): number {
  return 0.5 + 0.5 * Math.sin((ara / 5000) * Math.PI * 2);
}

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
  /** Silueta plena de les persones. */
  private ple: HTMLCanvasElement;
  /** Resplendor ample i difús (taronja-vermell), dins i fora del cos. */
  private difus: HTMLCanvasElement;
  /** Llum càlida només a dins del cos: més forta on el cos és més gruixut (els nuclis). */
  private nuclis: HTMLCanvasElement;
  private suau: Float32Array | null = null;
  private llis: Float32Array | null = null;
  private ultim = 0;
  private hiHaCos = false;
  private tancat = false;
  /** Resum de l'últim fotograma i de l'últim error, per a ?debug=1. */
  info = "";
  private error = "";
  private fotogrames = 0;
  private llumEntrada = -1;

  constructor() {
    this.entrada = document.createElement("canvas");
    this.ple = document.createElement("canvas");
    this.difus = document.createElement("canvas");
    this.nuclis = document.createElement("canvas");
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
      this.hiHaCos = false;
      this.error = `segmenta: ${e instanceof Error ? e.message : String(e)}`;
      this.info = this.error;
    }
  }

  private processa(valors: Float32Array, mw: number, mh: number, nMasques: number) {
    if (!this.suau || this.suau.length !== valors.length) this.suau = new Float32Array(valors.length);
    const suau = this.suau;
    let max = 0;
    let suma = 0;
    for (let i = 0; i < valors.length; i++) {
      if (valors[i] > max) max = valors[i];
      suma += valors[i];
    }
    if (max === 0) {
      if (++this.zeros === 20) void this.canviaDelegat();
    } else this.zeros = 0;
    // Llindar normal 0,5; si el model dóna valors baixos (màxim < 0,5) s'abaixa a la meitat del màxim.
    const llindar = max >= 0.5 ? 0.5 : Math.max(0.05, max * 0.5);
    // Mitjana amb el fotograma anterior: la llum no tremola.
    let dins = 0;
    for (let i = 0; i < valors.length; i++) {
      suau[i] += (valors[i] - suau[i]) * 0.6;
      if (suau[i] > llindar) dins++;
    }
    // Si el model dóna el fons en lloc de la persona (gairebé tot ple), s'inverteix.
    const invertir = dins > valors.length * 0.85;

    if (this.ple.width !== mw || this.ple.height !== mh) {
      this.ple.width = mw;
      this.ple.height = mh;
    }
    const gp = this.ple.getContext("2d");
    if (!gp) return;
    const imatgePle = gp.createImageData(mw, mh);
    const pp = imatgePle.data;
    // Mitjana 3x3 de la màscara abans de tallar-la: la silueta surt arrodonida i no a graons.
    if (!this.llis || this.llis.length !== suau.length) this.llis = new Float32Array(suau.length);
    const llis = this.llis;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        let t = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= mh) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= mw) continue;
            t += suau[yy * mw + xx];
            n++;
          }
        }
        llis[y * mw + x] = t / n;
      }
    }
    let cos = 0;
    for (let i = 0; i < llis.length; i++) {
      if (llis[i] > llindar !== invertir) {
        pp[i * 4 + 3] = 255;
        cos++;
      }
    }
    gp.putImageData(imatgePle, 0, 0);
    this.hiHaCos = cos > 0;
    if (cos > 0) this.creaLlum(mw, mh);
    this.info = `fot ${this.fotogrames} · masques ${nMasques} · ${mw}x${mh} · persona ${Math.round(
      (dins / valors.length) * 100,
    )}%${invertir ? " (invertit)" : ""} · cos ${cos}px · ${this.delegat} · entrada llum ${this.llumEntrada} · val max ${max.toFixed(2)} mitja ${(suma / valors.length).toFixed(2)} llindar ${llindar.toFixed(2)}`;
  }

  /**
   * Les dues llums, calculades una vegada per màscara i a mida petita (els desenfocaments són cars:
   * fer-los a pantalla completa a cada fotograma ofega un mòbil). El truc de l'ombra: la silueta es
   * dibuixa fora del llenç i només en entra l'ombra, que és la silueta de color i desenfocada.
   */
  private creaLlum(mw: number, mh: number) {
    for (const c of [this.difus, this.nuclis]) {
      if (c.width !== mw || c.height !== mh) {
        c.width = mw;
        c.height = mh;
      }
    }
    const ombra = (c: HTMLCanvasElement, color: string, desenfocament: number) => {
      const g = c.getContext("2d");
      if (!g) return null;
      g.clearRect(0, 0, mw, mh);
      g.shadowColor = color;
      g.shadowBlur = desenfocament;
      g.shadowOffsetX = mw * 3;
      g.drawImage(this.ple, -mw * 3, 0);
      g.shadowColor = "transparent";
      g.shadowBlur = 0;
      g.shadowOffsetX = 0;
      return g;
    };
    // Resplendor taronja-vermell, ample i suau: tenyeix el cos i s'esvaeix cap a fora.
    ombra(this.difus, "rgba(255,85,15,1)", 30);
    // Nuclis: una ombra més estreta de to or; a dins del cos és més intensa on hi ha més massa.
    const g = ombra(this.nuclis, "rgba(255,190,80,1)", 26);
    if (g) {
      g.globalCompositeOperation = "destination-in";
      g.drawImage(this.ple, 0, 0);
      g.globalCompositeOperation = "source-over";
    }
  }

  /** Dibuixa el filtre taronja i els nuclis, amb una lleu respiració i un moviment lent. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, ara: number) {
    if (!this.hiHaCos) return;
    const respira = respiracio(ara);
    const respira2 = respiracio(ara + 2200);
    // Petit vaivé perquè no es vegi rígid.
    const dx = Math.sin(ara / 2300) * 0.004 * w;
    const dy = Math.cos(ara / 2900) * 0.003 * h;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 0.34 + 0.1 * respira;
    ctx.drawImage(this.difus, dx, dy, w, h);
    ctx.globalAlpha = 0.14 + 0.06 * respira2;
    ctx.drawImage(this.difus, -dx * 1.6, -dy * 1.6, w, h);
    ctx.globalAlpha = 0.5 + 0.18 * respira2;
    ctx.drawImage(this.nuclis, dx * 0.6, dy * 0.6, w, h);
    ctx.restore();
  }
}
