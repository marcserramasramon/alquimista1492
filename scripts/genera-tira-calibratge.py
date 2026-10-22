# Tira de calibratge del cartell de Foc (impressió d'anul·lació espectral): un fons vermell fix
# (C0 M100 Y90 K0) amb mostres de lila que només varien en Cian. PDF en CMYK real (DeviceCMYK),
# escrit a mà, sense dependències.
#
#   python scripts/genera-tira-calibratge.py   -> cartells-pdf/tira-calibratge-foc.pdf
#
# Imprimeix-lo amb el mateix paper i la mateixa màquina que el treball final, amb la gestió de color
# apagada (que no converteixi el CMYK). Tria la mostra de Cian més baix que, amb el filtre vermell,
# continuï llegint-se fosca, i que a simple vista no es distingeixi del fons.

from pathlib import Path

MM = 72 / 25.4
VERMELL = (0, 100, 90, 0)
MAGENTA, GROC = 92, 28  # del lila; el Cian és el que varia
CIANS = [8, 12, 16, 20, 24, 28, 32]

def k(c, m, y, kk, estroke=False):
    return f"{c/100:.3f} {m/100:.3f} {y/100:.3f} {kk/100:.3f} {'K' if estroke else 'k'}\n"

def rect(x, y, w, h):
    return f"{x*MM:.2f} {y*MM:.2f} {w*MM:.2f} {h*MM:.2f} re f\n"

def text(x, y, mida, s):
    s = s.replace(chr(92), chr(92) * 2).replace("(", chr(92) + "(").replace(")", chr(92) + ")")
    return f"BT /F1 {mida} Tf {x*MM:.2f} {y*MM:.2f} Td ({s}) Tj ET\n"

def pagina():
    W, H = 210, 297
    out = k(0, 0, 0, 100) + text(15, 280, 16, "Tira de calibratge - cartell del Foc")
    out += text(15, 272, 9, "Fons vermell C0 M100 Y90 K0. Lila: M%d Y%d K0, canviant nomes el Cian." % (MAGENTA, GROC))
    out += text(15, 266, 9, "Sense filtre: descarta les mostres que es veuen. Amb filtre vermell: tria la de Cian mes baix que llegeix fosca.")
    # tres fileres: mostres sobre vermell (la prova real)
    cx0, ample, alt, buit = 15, 24, 62, 4
    for fila, (yb, titol) in enumerate([(190, "Mostres sobre fons vermell"), (112, "Mostres sobre fons vermell (repeticio)")]):
        out += k(0, 0, 0, 100) + text(15, yb + alt + 5, 9, titol)
        out += k(*VERMELL) + rect(cx0 - 3, yb - 3, len(CIANS) * (ample + buit) + 2 + buit - 1, alt + 6)
        for i, c in enumerate(CIANS):
            x = cx0 + i * (ample + buit)
            out += k(c, MAGENTA, GROC, 0) + rect(x, yb + 8, ample, alt - 16)
            out += k(0, 0, 0, 0) + rect(x, yb - 2, ample, 7)
            out += k(0, 0, 0, 100) + text(x + 2, yb, 9, "C %d%%" % c)
    # referencia: vermell sol i lila sol
    out += k(0, 0, 0, 100) + text(15, 96, 9, "Referencia: vermell sol i lila al valor orientatiu (C20)")
    out += k(*VERMELL) + rect(15, 60, 50, 30)
    out += k(20, MAGENTA, GROC, 0) + rect(70, 60, 50, 30)
    out += k(0, 0, 0, 100) + text(15, 54, 8, "C0 M100 Y90 K0") + text(70, 54, 8, "C20 M%d Y%d K0" % (MAGENTA, GROC))
    out += text(15, 40, 8, "Valor optim habitual: Cian 18-22%. Si es veu a simple vista, baixa el Cian; si el filtre no el revela, puja'l.")
    return out

def pdf(contingut: str) -> bytes:
    c = contingut.encode("latin-1")
    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Length %d >>\nstream\n" % len(c) + c + b"endstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    out = b"%PDF-1.4\n"
    pos = []
    for i, o in enumerate(objs, 1):
        pos.append(len(out))
        out += b"%d 0 obj\n" % i + o + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
    for p in pos:
        out += b"%010d 00000 n \n" % p
    out += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, xref)
    return out

dest = Path(__file__).resolve().parent.parent / "cartells-pdf" / "tira-calibratge-foc.pdf"
dest.parent.mkdir(exist_ok=True)
dest.write_bytes(pdf(pagina()))
print(dest)
