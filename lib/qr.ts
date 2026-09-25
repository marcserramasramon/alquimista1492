import "server-only";
import QRCode from "qrcode";

/** QR dels cartells com a SVG, generat al servidor (la llibreria no arriba al client). */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    // Q: aguanta una mica de brutícia o d'aigua sobre el plàstic del cartell.
    errorCorrectionLevel: "Q",
    margin: 2,
    color: { dark: "#1b1511", light: "#ffffff" },
  });
}
