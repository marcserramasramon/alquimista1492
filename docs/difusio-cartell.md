# Difusió — Cartell / Post per a xarxes

> **Estat:** ESBORRANY DE TREBALL. Disseny i textos per generar amb Gemini (imatge) i acabar de compondre a mà (Canva/Figma). No toca cap fitxer de l'app — és material de màrqueting, no `content/public/` ni `content/private/`.
> Depèn de `docs/historia-nova.md`, `docs/fites-nova.md` i `docs/MASTER-PROMPT-IMATGES-NOVA.md`.
>
> **Historial:** v1 (pergamí/segell en primer pla) descartat — renderitzava com un sobre de carta. v2 (vista aèria del pentagrama, sense figura) descartat per l'usuari. **v3 (actual, 2026-09-26):** el cartell mostra la figura encaputxada de Fra Francesc i el camí de les 5 fites cap a la Pedra Filosofal — confirmat directament per l'usuari, veure §2.

---

## 1. Objectiu i formats

Un sol concepte, adaptat a tres mides (mateixa il·lustració de fons, diferent enquadrament/marge per al text):

| Format | Mida | Ús |
|---|---|---|
| Cartell imprimible | A3 vertical (297×420 mm, 300 dpi) | Taulell d'anuncis, comerços, ajuntament |
| Post quadrat | 1080×1080 px | Instagram/Facebook feed |
| Story/Reel cover | 1080×1920 px | Instagram/Facebook Stories, WhatsApp |

## 2. Restriccions

- ✅ **Confirmat per l'usuari (2026-09-26):** el cartell mostra la figura de Fra Francesc, encaputxada i amb capa fosca, **la cara mai visible** (d'esquena, de tres quarts o en ombra sota la caputxa). Això desbloqueja només la silueta per a material de difusió — vegeu l'actualització a `docs/MASTER-PROMPT-IMATGES-NOVA.md` §9.
- ⚠️ **Encara PENDENT (no inventar):** l'aparença real del personatge — cara, edat concreta, detalls de vestuari de la disfressa de comissari. Cap prompt d'aquest document n'hi mostra cap detall.
- ⚠️ **No revelar el gir de trama** (que l'Inquisidor és Fra Francesc disfressat) — la silueta encaputxada és ambigua a propòsit.
- Sense flama oberta a cap referència a l'estació de Foc.
- Sense anacronismes moderns.
- Interfície i identitat: 100% català als textos.

## 3. Identitat visual a reutilitzar

- **Tipografia:** Grenze Gotisch per al títol (`--font-grenze-gotisch`), Alegreya Sans versaleta (`--font-alegreya-sans-sc`) per al subtítol/etiquetes, Alegreya Sans pel cos.
- **Paleta** (`app/globals.css`): pergamí `#fbf4e4` / `#f3e5c4`, tinta `#1b1511`, or `#eab308` / or fosc `#8a6300`, sang `#b3261e` com a accent puntual. Colors d'element: Aigua `#1d6fd6`, Terra `#5b8a1e`, Foc `#e8541f`, Aire `#0e9bb8`, Ànima `#8b3fb5`.
- **Logo:** variants ja generades a `public/images/logo/` (pentàgon/gemma en blau/lila/vermell/iris) — triar-ne una, no generar-ne una de nova.
- **Emblema de l'Orde** (llibre + ouroboros en "Y"): com a segell petit i decoratiu en un racó del disseny final (a Canva), no dins l'escena il·lustrada.

## 4. Concepte creatiu (v3)

**Eix:** el camí de l'alquimista. Un sender travessa el poble i el terme cap a la Pedra Filosofal, marcat per cinc fites lluminoses (una per element). Al capdavant del camí, d'esquena o amb la cara oculta sota la caputxa, hi ha Fra Francesc — el vigilant del secret.

**Imatge:** composició tipus "mapa il·lustrat" en perspectiva isomètrica/aèria lleugera. Un camí de terra serpenteja pel poble i els camps (Sentfores, capvespre de tardor, boira baixa). Cinc punts del camí resplendeixen, cadascun amb el glif alquímic del seu element en un color tènue distintiu (Aigua/Terra/Foc/Aire/Ànima). El camí acaba en un pla obert (el Pla de Masset) on una gemma resplendent —la Pedra Filosofal— reposa sobre un senzill pedestal de pedra, irradiant llum daurada-vermellosa cap amunt. En primer pla, al començament del camí, **la figura encaputxada de Fra Francesc**, capa fosca ondulant, **cara completament oculta** (d'esquena o de tres quarts, ombra sota la caputxa), observant el camí.

## 5. Textos definitius

**Titular:**
> Els Guardians del Secret de Sentfores

**Frase de suport:**
> El camí de l'alquimista. Cinc fites. Una Pedra Filosofal.

**Subtítol:**
> Un escape room a l'aire lliure — Festa Major de Sentfores, novembre de 2026

**Cos:**
> El vostre equip ha estat convocat. Seguiu el camí que l'alquimista Fra Francesc va traçar fa segles, recorrent Sentfores a la recerca dels cinc fragments amagats — Aigua, Terra, Foc, Aire i Ànima — mentre algú encaputxat vigila cada pas. Reuniu-los al Pla de Masset i completeu el ritual del Gresol per assolir la Pedra Filosofal i esdevenir **Guardians del Secret**.

**Crida a l'acció:**
> Inscriu el teu equip — [PENDENT: URL o QR d'inscripció]

**Peu de cartell (dades pràctiques — ⚠️ PENDENT, no inventar):**
- Data i hora exactes de la Festa Major 2026
- Punt de trobada / hora de convocatòria
- Preu o gratuït, edat mínima, durada aproximada del joc
- Enllaç o QR d'inscripció

## 6. Prompt per a Gemini (imatge de fons, sense text)

Generar només la il·lustració; el text es maqueta després. Prompt en anglès, ajustant `--ar` segons el format:

```
Illustrated fantasy-map-style scene, slightly elevated isometric/aerial
angle, of a winding dirt path through a small Catalan medieval village
and its surrounding countryside (Sentfores, Osona, autumn dusk, 1472).
Low mist in the lanes, a pale moon, stone houses with terracotta roofs,
a church bell tower in the distance. The path passes five glowing
waypoints, each marked with a small classical alchemical glyph
(triangle-based symbols), each in its own muted warm colour, leading
to an open village square where a single radiant gem-like stone (a
Philosopher's Stone) rests on a plain stone pedestal, glowing warm
gold-red light upward.
In the foreground, at the start of the path, stands a solitary figure
wrapped in a long dark hooded cloak, seen from behind or three-quarters
turned away from the viewer, face completely hidden in shadow beneath
the hood — no facial features visible at all, no skin visible. The
cloak moves gently as if in a breeze.
Catalan Gothic illuminated-manuscript style — flat colour fields, bold
black ink outlines, restrained gold leaf accents, aged parchment
texture — combined with atmospheric cinematic lighting. Muted autumn
palette: parchment cream, grey limestone, dark iron and wood, oxidised
copper-green, warm gold/ember light only on the waypoints and the
stone. No other people, no modern elements, no open flame beyond the
stone's glow. High resolution, calm empty area in the upper third for
a title overlay.
```

Variants d'enquadrament:
- **A3 vertical / story (9:16 o 2:3):** afegir *"vertical composition, the hooded figure large in the lower third, the path winding upward through the frame toward the glowing stone, empty sky above for a title lockup"*.
- **Post quadrat (1:1):** afegir *"square composition, hooded figure lower-left, path leading diagonally to the glowing stone upper-right"*.

Si Gemini hi mostra la cara, pell o trets facials de la figura, tornar a generar reforçant *"face completely hidden in shadow, back to camera, no facial features, no skin visible"* — cap resultat amb la cara visible és acceptable (§2).

## 7. Muntatge final (fora de Gemini)

1. Generar el fons amb el prompt de §6 (una versió per format, o una prou gran per requadrar els tres).
2. Portar-lo a Canva/Figma; afegir:
   - Titular en Grenze Gotisch, or `#eab308` o `#8a6300` sobre el cel fosc.
   - Frase de suport i subtítol en Alegreya Sans SC.
   - Cos en Alegreya Sans, pergamí `#fbf4e4` o tinta `#1b1511` segons el contrast del fons.
   - Logo (`public/images/logo/…`) i, opcionalment, el segell de l'emblema, tots dos petits i en un racó.
3. Exportar en els 3 formats de §1.

## 8. PENDENT abans de publicar

- [ ] Data, hora i punt de trobada exactes de la Festa Major 2026
- [ ] Preu/gratuïtat, edat mínima recomanada
- [ ] URL o QR d'inscripció
- [ ] Triar variant de logo (`public/images/logo/`)
