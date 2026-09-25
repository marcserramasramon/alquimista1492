# Mapa: proposta definitiva de fites + ortofoto girada

> **Encàrrec:** al mapa de l'app (`components/player/MapaEquip.tsx`) hi ha d'haver
> **les fites de la "Proposta definitiva"** i, de fons, l'**ortofoto girada**
> `public/ortofoto-pentagrama.webp`. Tot el que cal és en aquest document.
>
> Referència que ja funciona: **`/prova-mapa`** (`app/prova-mapa/page.tsx`), botó
> **"Proposta definitiva"**. És una pàgina de prova: s'ha d'esborrar quan el mapa
> real ja estigui fet.

---

## 1. Coordenades definitives de les fites

| Ordre | id (`estacions.ts`) | Nom | Latitud | Longitud | Canvi |
|---|---|---|---|---|---|
| 1 | `font-ferro` | Font del Ferro | 41.914816 | 2.227479 | cap |
| 2 | `planes-bones` | Planes Bones | 41.912256 | 2.233469 | cap |
| 3 | `foc` | Entrada del poble | **41.915419** | **2.231577** | **NOVA**: abans 41.915765, 2.231385 (**42 m** cap al sud) |
| 4 | `aire` | Creu del Pujolar | 41.910894 | 2.224434 | cap |
| 5 | `anima` | Dunes d'asfalt | **41.910355** | **2.230083** | **NOVA**: abans 41.91034, 2.230023 (5 m) |
| 6 | `gresol` | Pla del Masset (centre) | 41.91313 | 2.229789 | cap |

**D'on surten:** l'1, el 2 i el 4 són les fites actuals. El 3 és el vèrtex del
pentagrama regular que millor s'ajusta a l'1, el 2 i el 3 (la "proposta B"). El 5
s'ha triat a mà. El 6 queda al centre del pentagrama i al centre exacte de la imatge.

Mides de l'estrella que resulta. No és regular, perquè la Creu del Pujolar (4)
queda ~200 m fora del lloc ideal i s'ha acceptat així:

- Costats (3→2→5→4→1→3): 385, 351, 471, 504, 346 m
- Diagonals, que són les línies de l'estrella (3→4→2→1→5→3): 776, 763, 572, 541, 577 m

### Què s'ha de canviar

1. **`content/public/estacions.ts`**: actualitzar `latitud`/`longitud` de `foc` (3)
   i `anima` (5) amb els valors de la taula.
2. **`docs/fites-nova.md`**: la taula d'ubicacions i la dels angles des del
   centroide encara porten les coordenades velles de la 3 i la 5. Cal posar-les al dia.
3. **⚠️ Cartell físic de la fita 3:** l'obertura per GPS és a
   `RADI_OBERTURA_M = 50` m (`lib/ubicacio.ts`, `app/api/obrir/route.ts`,
   `app/joc/page.tsx`). Moure la coordenada 42 m sense moure el cartell deixaria
   el cartell just a la vora del radi. **El cartell s'ha de posar a la coordenada
   nova.** La 5 només es mou 5 m i no afecta.

---

## 2. Imatge de fons: `public/ortofoto-pentagrama.webp`

- Ortofoto **PNOA** (IGN, `https://www.ign.es/wms-inspire/pnoa-ma`, capa
  `OI.OrthoimageCoverage`). La llicència és CC-BY 4.0: cal posar **"© PNOA cedido por
  © Instituto Geográfico Nacional"** en algun lloc visible (crèdits o peu del mapa).
- **2048 × 2048 px**, quadrada, **1040 m** de costat (0,508 m/px).
- **Centrada al Pla del Masset (fita 6)**, que cau al píxel (1024, 1024).
- **Girada 29,846° en sentit antihorari**: el nord queda cap amunt-esquerra.
  Aquest angle deixa la fita 1 i la 2 a la mateixa alçada de la pantalla. Cal
  dibuixar la fletxa del nord girada −29,846°, com fa `/prova-mapa`.

Com es va fer: es va demanar al WMS la BBOX de sota a 2804 × 2804 px, es va girar
+29,846° al voltant del centre (Pillow `rotate`, positiu = antihorari) i se'n va
retallar el quadrat central de 2048 px. Així el retall no té cantonades buides.

```
BBOX (EPSG:4326, lat/lon)   MIN_LAT 41.906727   MAX_LAT 41.919533
                            MIN_LON  2.221185   MAX_LON  2.238393
ORIGINAL = 2804 px          MIDA = 2048 px       ANGLE = 29.846° (antihorari)
```

---

## 3. Conversió lat/lon → píxel (substitueix `latLonToSVG`)

Ara `MapaEquip.tsx` fa servir `map-test.webp` (4:3, 800 × 600, sense girar)
amb una conversió lineal i els límits `BOUND_*`. **Amb la imatge nova això ja no
serveix**: cal girar els punts. Aquest és el codi que funciona a `/prova-mapa`:

```ts
const MIN_LAT = 41.906727;
const MAX_LAT = 41.919533;
const MIN_LON = 2.221185;
const MAX_LON = 2.238393;
const ORIGINAL = 2804;
const MIDA = 2048; // viewBox 0 0 2048 2048
const ANGLE = (29.846 * Math.PI) / 180;

/** lat/lon → píxel de la imatge girada (0..MIDA). */
function aPixel(lat: number, lon: number) {
  const u = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * ORIGINAL - ORIGINAL / 2;
  const v = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * ORIGINAL - ORIGINAL / 2;
  const c = Math.cos(ANGLE);
  const s = Math.sin(ANGLE);
  return { x: MIDA / 2 + u * c + v * s, y: MIDA / 2 - u * s + v * c };
}

/** Inversa: píxel → lat/lon. */
function aLatLon(x: number, y: number) {
  const dx = x - MIDA / 2;
  const dy = y - MIDA / 2;
  const c = Math.cos(ANGLE);
  const s = Math.sin(ANGLE);
  const u = dx * c - dy * s + ORIGINAL / 2;
  const v = dx * s + dy * c + ORIGINAL / 2;
  return {
    lat: MAX_LAT - (v / ORIGINAL) * (MAX_LAT - MIN_LAT),
    lon: MIN_LON + (u / ORIGINAL) * (MAX_LON - MIN_LON),
  };
}
```

**Valors de comprovació.** Amb les coordenades definitives, `aPixel` ha de donar:

| Fita | x | y |
|---|---|---|
| 1 | 513.8 | 891.1 |
| 2 | 1639.4 | 891.6 |
| 3 | 1027.3 | 444.3 |
| 4 | 510.8 | 1882.9 |
| 5 | 1367.9 | 1527.2 |
| 6 | 1024.0 | 1024.0 |

### Canvis a `MapaEquip.tsx`

- `SVG_W`/`SVG_H` 800×600 → **2048×2048**. La finestra del mapa passa de
  `aspect-[4/3]` a **`aspect-square`**, també el lloc reservat en pantalla completa.
- `<image href="/map-test.webp">` → **`/ortofoto-pentagrama.webp`**.
- `latLonToSVG` → `aPixel` (i també a `Cami`, el recorregut de l'equip).
- **`dinsDelMapa`**: ara ha de mirar si el punt cau dins el quadrat girat, no dins
  d'un rectangle de lat/lon:
  `const { x, y } = aPixel(lat, lng); return x >= 0 && x <= MIDA && y >= 0 && y <= MIDA;`
- **Mides dels marcadors:** l'agulla, els cercles i els textos estan pensats per a
  un viewBox de 800 px d'ample. Amb 2048 cal multiplicar-les per ~2,5 perquè a la
  pantalla es vegin igual (`/prova-mapa` fa servir agulles de ~34 unitats de radi
  i text de 38).
- La lògica de zoom i gestos no canvia (`/prova-mapa` en té una còpia
  simplificada i funciona igual amb el mapa quadrat).
- `docs/app-nova.md` i `docs/MASTER-PROMPT-IMATGES-NOVA.md` citen `map-test.webp` i
  els límits vells. Cal actualitzar-los.

### Opcional: dibuixar el pentagrama

`/prova-mapa` traça l'estrella unint les fites en l'ordre **3 → 4 → 2 → 1 → 5 → 3**
(`<polyline>` amb `aPixel` de cada fita). Si es vol al mapa del joc (per exemple,
quan totes les fites són resoltes, abans del Gresol), el codi és allà.

---

## 4. Com tornar a generar la imatge

Script de Python (`requests` + `Pillow`). Paràmetres: `CENTRE`, `COSTAT_M`,
`MIDA` i `ANGLE`. Imprimeix les constants de la secció 3.

```python
import io, math, requests
from PIL import Image

CENTRE = (41.91313, 2.229789)   # 6 · Pla del Masset
COSTAT_M = 1040
MIDA = 2048
ANGLE = 29.846                  # antihorari

a = math.radians(ANGLE)
ORIGINAL = math.ceil(MIDA * (math.cos(a) + math.sin(a))) + 8
ORIGINAL += ORIGINAL % 2
mitja_m = COSTAT_M / MIDA * ORIGINAL / 2
R = 6371008.8
dlat = mitja_m / (math.radians(1) * R)
dlon = mitja_m / (math.radians(1) * R * math.cos(math.radians(CENTRE[0])))
bbox = (CENTRE[0] - dlat, CENTRE[1] - dlon, CENTRE[0] + dlat, CENTRE[1] + dlon)

r = requests.get("https://www.ign.es/wms-inspire/pnoa-ma", params={
    "SERVICE": "WMS", "VERSION": "1.3.0", "REQUEST": "GetMap",
    "LAYERS": "OI.OrthoimageCoverage", "STYLES": "", "CRS": "EPSG:4326",
    "BBOX": ",".join(f"{v:.6f}" for v in bbox),
    "WIDTH": ORIGINAL, "HEIGHT": ORIGINAL, "FORMAT": "image/jpeg",
}, headers={"User-Agent": "Mozilla/5.0"}, timeout=180)
assert r.headers.get("Content-Type", "").startswith("image"), r.text[:300]

img = Image.open(io.BytesIO(r.content)).convert("RGB").rotate(ANGLE, resample=Image.Resampling.BICUBIC)
l = (ORIGINAL - MIDA) // 2
img.crop((l, l, l + MIDA, l + MIDA)).save("public/ortofoto-pentagrama.webp", quality=85)
print("MIN_LAT", bbox[0], "MAX_LAT", bbox[2], "MIN_LON", bbox[1], "MAX_LON", bbox[3], "ORIGINAL", ORIGINAL)
```
