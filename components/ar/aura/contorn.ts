import type { ImageSegmenter } from "@mediapipe/tasks-vision";
import { respiracio } from "@/components/ar/aura/mon";

/**
 * Aura daurada a les persones que surten a la càmera. Un model de segmentació de persones (MediaPipe,
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
  private llis: Float32Array | null = null;
  /** Centre de la silueta (0-1), des d'on creixen els anells d'energia. */
  private centre = { x: 0.5, y: 0.5 };
  private halo2: HTMLCanvasElement;
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
    this.halo2 = document.createElement("canvas");
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
    // Mitjana 3x3 de la màscara abans de tallar-la: la vora surt arrodonida i no a graons.
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
    const persona = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= mw || y >= mh) return true;
      return llis[y * mw + x] > llindar !== invertir;
    };
    let vores = 0;
    let sx = 0;
    let sy = 0;
    let dinsLlis = 0;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        if (!persona(x, y)) continue;
        pp[(y * mw + x) * 4 + 3] = 255;
        sx += x;
        sy += y;
        dinsLlis++;
        if (persona(x - GRUIX, y) && persona(x + GRUIX, y) && persona(x, y - GRUIX) && persona(x, y + GRUIX)) continue;
        const k = (y * mw + x) * 4;
        px[k] = 255;
        px[k + 1] = 238 - ((x * 7 + y * 13) % 30);
        px[k + 2] = 190;
        px[k + 3] = 255;
        vores++;
      }
    }
    g.putImageData(imatge, 0, 0);
    gp.putImageData(imatgePle, 0, 0);
    if (dinsLlis > 0) {
      this.centre = { x: sx / dinsLlis / mw, y: sy / dinsLlis / mh };
    }
    this.creaResplendor(mw, mh);
    this.hiHaVora = vores > 0;
    this.info = `fot ${this.fotogrames} · masques ${nMasques} · ${mw}x${mh} · persona ${Math.round(
      (dins / valors.length) * 100,
    )}%${invertir ? " (invertit)" : ""} · vora ${vores}px · ${this.delegat} · entrada llum ${this.llumEntrada} · val max ${max.toFixed(2)} mitja ${(suma / valors.length).toFixed(2)} llindar ${llindar.toFixed(2)}`;
  }

  /** Esborra de l'escena el que cau darrere de les persones: les llums són un element del fons. */
  tapa(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!this.hiHaVora) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.ple, 0, 0, w, h);
    ctx.restore();
  }

  /**
   * Cos de llum a dins de la silueta: una llum càlida que respira, vetes d'energia que pugen, fils de
   * llum verticals i espurnes. Es dibuixa en una imatge petita i es retalla amb la silueta.
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
    const t = ara / 1000;
    const respira = respiracio(ara);
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, mw, mh);

    // Fons de llum càlida que respira.
    g.fillStyle = `rgba(255,214,120,${0.16 + 0.12 * respira})`;
    g.fillRect(0, 0, mw, mh);

    // Vetes d'energia: franges daurades i blanques que pugen pel cos.
    const periode = mh * 0.6;
    const desplacament = (t * 55) % periode;
    for (let k = -1; k < 3; k++) {
      const y0 = mh - k * periode - desplacament;
      const ones = g.createLinearGradient(0, y0, 0, y0 - periode);
      ones.addColorStop(0, "rgba(255,190,70,0)");
      ones.addColorStop(0.45, "rgba(255,225,140,0.5)");
      ones.addColorStop(0.55, "rgba(255,250,225,0.65)");
      ones.addColorStop(1, "rgba(255,190,70,0)");
      g.fillStyle = ones;
      g.fillRect(0, y0 - periode, mw, periode);
    }

    // Fils de llum verticals que pugen i s'esvaeixen.
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 26; i++) {
      const a = Math.abs(Math.sin(i * 91.7) * 43758.5453) % 1;
      const b = Math.abs(Math.sin(i * 17.31) * 24634.6345) % 1;
      const x = a * mw;
      const llarg = mh * (0.12 + 0.2 * b);
      const cicle = (t * (0.18 + 0.25 * b) + b) % 1;
      const yc = mh - cicle * (mh + llarg);
      const fil = g.createLinearGradient(0, yc, 0, yc + llarg);
      fil.addColorStop(0, "rgba(255,240,190,0)");
      fil.addColorStop(0.7, `rgba(255,236,170,${0.5 * Math.sin(Math.PI * cicle)})`);
      fil.addColorStop(1, "rgba(255,255,230,0)");
      g.fillStyle = fil;
      g.fillRect(x, yc, 1.4, llarg);
    }

    // Resplendor que entra des de la vora.
    g.shadowColor = "rgba(255,215,110,0.95)";
    g.shadowBlur = 10;
    g.globalAlpha = 0.85;
    g.drawImage(this.vora, 0, 0);
    g.shadowBlur = 0;
    g.globalAlpha = 1;

    // Espurnes que pugen i brillen.
    for (let i = 0; i < 80; i++) {
      const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      const b = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
      const x = a * mw + Math.sin(t * 1.2 + i) * 3;
      const velocitat = 10 + b * 24;
      const y = mh - ((t * velocitat + b * mh) % (mh + 10));
      g.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (2 + (i % 5)) + i));
      g.fillStyle = i % 3 === 0 ? "rgb(255,255,235)" : "rgb(255,215,110)";
      const mida = 0.8 + b * 1.8;
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
    ctx.globalAlpha = 0.85;
    ctx.drawImage(this.magia, 0, 0, w, h);
    ctx.restore();
  }

  /**
   * Resplendors de la vora, calculats una vegada per màscara i a mida petita (els desenfocaments són
   * cars: fer-los a pantalla completa a cada fotograma ofega un mòbil). `halo`: or i blanc;
   * `halo2`: un vel ample violeta pàl·lid que fa de segona capa d'aura.
   */
  private creaResplendor(mw: number, mh: number) {
    for (const c of [this.halo, this.halo2]) {
      if (c.width !== mw || c.height !== mh) {
        c.width = mw;
        c.height = mh;
      }
    }
    const dibuixa = (c: HTMLCanvasElement, passes: [string, number, number][]) => {
      const g = c.getContext("2d");
      if (!g) return;
      g.clearRect(0, 0, mw, mh);
      g.globalCompositeOperation = "lighter";
      for (const [color, blur, alfa] of passes) {
        g.shadowColor = color;
        g.shadowBlur = blur;
        g.globalAlpha = alfa;
        g.drawImage(this.vora, 0, 0);
      }
      g.shadowBlur = 0;
      g.globalAlpha = 1;
    };
    dibuixa(this.halo, [
      ["rgba(255,160,30,0.95)", 30, 1],
      ["rgba(255,196,70,1)", 20, 1],
      ["rgba(255,226,140,1)", 11, 1],
      ["rgba(255,252,225,1)", 3, 1],
    ]);
    dibuixa(this.halo2, [
      ["rgba(150,140,255,0.9)", 44, 0.9],
      ["rgba(200,190,255,0.9)", 26, 0.7],
    ]);
  }

  /** Dibuixa un canvas petit a pantalla completa, escalat des del centre de la silueta. */
  private dibuixaEscalat(
    ctx: CanvasRenderingContext2D,
    c: HTMLCanvasElement,
    w: number,
    h: number,
    escala: number,
    dx = 0,
    dy = 0,
  ) {
    ctx.save();
    ctx.translate(this.centre.x * w + dx, this.centre.y * h + dy);
    ctx.scale(escala, escala);
    ctx.translate(-this.centre.x * w, -this.centre.y * h);
    ctx.drawImage(c, 0, 0, w, h);
    ctx.restore();
  }

  /** Aura: vel violeta, resplendor daurat que respira, anells d'energia que s'expandeixen i fils de llum. */
  pinta(ctx: CanvasRenderingContext2D, w: number, h: number, ara: number) {
    if (!this.hiHaVora) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    const respira = respiracio(ara);
    const respira2 = respiracio(ara + 1700);

    // Capa exterior: vel violeta pàl·lid, desfasat del daurat.
    ctx.globalAlpha = 0.35 + 0.3 * respira2;
    this.dibuixaEscalat(ctx, this.halo2, w, h, 1 + 0.03 * respira2);

    // Capa daurada, que respira.
    ctx.globalAlpha = 0.7 + 0.3 * respira;
    this.dibuixaEscalat(ctx, this.halo, w, h, 1 + 0.015 * respira);

    // Anells d'energia que surten del cos i s'allunyen, com un pols.
    for (let k = 0; k < 2; k++) {
      const fase = (ara / 3800 + k * 0.5) % 1;
      ctx.globalAlpha = Math.pow(1 - fase, 2) * 0.65;
      this.dibuixaEscalat(ctx, this.halo, w, h, 1 + fase * 0.5);
    }

    // Fils de llum que pugen del contorn i s'esvaeixen.
    for (let k = 0; k < 6; k++) {
      const fase = (ara / 2600 + k / 6) % 1;
      ctx.globalAlpha = Math.sin(Math.PI * fase) * 0.3;
      const dx = Math.sin(ara / 400 + k * 2.3) * 4 * (w / 400);
      this.dibuixaEscalat(ctx, this.halo, w, h, 1, dx, -fase * h * 0.16);
    }
    ctx.restore();
  }
}
