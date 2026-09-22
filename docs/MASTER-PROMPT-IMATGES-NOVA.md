# 🎨 MASTER PROMPT — L'Alquimista de Sentfores — Generació d'Imatges (v2)

> **Estat:** ESBORRANY DE TREBALL. Substitueix `docs/MASTER-PROMPT-IMATGES.md` (obsolet: era per a la trama del Traïdor/1705, barroc). Depèn de `docs/historia-nova.md` i `docs/fites-nova.md`, encara oberts — algunes seccions d'aquí queden marcades PENDENT perquè depenen de decisions de trama que no es prenen en aquest document.
>
> Origen del canvi d'època: `historia-nova.md` punt 12 — la cronologia passa de 1705 (Guerra de Successió) a **1472** (Guerra dels Remences), fet que obliga a canviar tota l'estètica visual de barroc a baixa edat mitjana catalana.

---

## 1. CONTEXT NARRATIU

**Títol:** L'Alquimista de Sentfores
**Any:** 1472 — Guerra dels Remences / Guerra Civil Catalana (el mateix any de la destrucció real del Castell de Sentfores)
**Lloc:** Sentfores i La Guixa, comarca d'Osona, Catalunya
**Trama:** Fra Francesc de Sentfores, alquimista i membre de l'Orde del Testament, va amagar cinc fragments d'una fórmula (la Pedra Filosofal) arreu del poble, un per element. Els jugadors els busquen mentre un comissari inquisitorial —en realitat el mateix Fra Francesc, disfressat— els vigila.
**Gènere:** Escape room exterior, misteri hermètic/alquímic, NO thriller polític bèl·lic (el rerefons de guerra és context, no protagonista).

---

## 2. PALETA DE COLORS (PROPOSTA — a confirmar, no és trama)

La paleta de `MASTER-PROMPT-IMATGES.md` (or vell #D4AF37, beige pergamí #F5E6D3) estava pensada per a estampes barroques del XVIII. Amb el salt a 1472, proposo una paleta inspirada en **manuscrits il·luminats i retaules gòtics catalans** (més austera, menys daurada, amb accents alquímics):

```
Fons principal:        #EDE3CE (pergamí envellit, més grisós que l'anterior)
Text principal:        #1A1A1A (negre fosc)
Pedra / arquitectura:  #8C8574 (pedra calcària grisa d'Osona)
Fusta / ferro forjat:  #4A3B2A (marró fosc, biga i reixes)
Accent daurat (or de fulla, NOMÉS a l'emblema de l'Orde i moments clau): #C9A227
Accent alquímic verd:  #4A6B4A (verdet, coure oxidat, vas alquímic)
Perill / Inquisició:   #6B1F1F (vermell fosc, sagnant, mai vermell viu)
Èxit / revelació:      #3E5C3E (verd oliva fosc)
Llum UV / Ànima:       #7B5EA7 (lila apagat, NOMÉS per a l'element Ànima — únic ús de lila permès, ja que forma part de la mecànica real de llanterna UV)

RESTRICCIÓ: sense grocs vius, sense rosa, sense colors saturats moderns,
sense mode fosc. Cap element "brillant" excepte l'emblema de l'Orde
(fulla d'or, moment d'excepció narrativa) i l'efecte UV de l'estació Ànima.
```

⚠️ **A confirmar amb l'usuari** abans de generar res en massa: si es vol mantenir un toc d'or vell (continuïtat visual amb el material ja produït) o anar més sobri/medieval del tot.

---

## 3. ESTIL ARTÍSTIC I ATMOSFERA (PROPOSTA)

- **Referència:** miniatures de manuscrits il·luminats catalans i retaules gòtics (p. ex. Bernat Martorell, Lluís Borrassà) — figures planes, contorns marcats en tinta, camps de color sòlid, pa d'or només en detalls puntuals.
- **Tècnica:** tremp a l'ou / aiguada sobre pergamí envellit, línia de contorn negra (com un vitrall o un gravat en fusta), sense el difuminat aquarel·lat del document anterior.
- **Textura:** pergamí desgastat, no paper industrial; vores lleugerament irregulars.
- **To emocional:** hermètic i contemplatiu més que bèl·lic — misteri d'alquimista, no thriller d'espies. La guerra (Remences) és rerefons llunyà, no protagonista visual.
- **Llum:** diürna freda de tardor/hivern català (l'esdeveniment real és a la Festa Major de **novembre**) o llum de teia/espelma a l'interior. Evitar la calidesa de foguera nocturna que dominava el document anterior (ja no hi ha foc obert a l'estació FOC — veure `fites-nova.md`).

---

## 4. LLOCS — Prompts per estació

Totes les ubicacions són reals (La Guixa/Sentfores). L'objectiu és una **il·lustració narrativa de l'indret**, no un retrat fotogràfic — ha de ser reconeixible sobre el terreny mentre manté l'estil de manuscrit il·luminat.

Plantilla base a reutilitzar per a cadascuna:

```
"L'Alquimista de Sentfores, 1472. [NOM DEL LLOC] — [DESCRIPCIÓ FÍSICA REAL].
Catalan Gothic illuminated-manuscript style, flat color fields, bold
black ink outlines, aged parchment texture, restrained gold leaf only
on small symbolic details.
Palette: aged parchment #EDE3CE, grey limestone #8C8574, dark wood/iron
#4A3B2A, oxidised copper-green #4A6B4A accents. No bright yellow, no
pink, no modern elements, no dark mode, high contrast for outdoor
mobile reading.
Autumn/winter Catalan daylight, slightly overcast.
[DETALLS ESPECÍFICS DE L'ELEMENT — veure taula]. 1024×1024px."
```

| Estació | Element | Detalls específics a incloure al prompt |
|---|---|---|
| Font del Ferro (Carrer del Call) | 💧 Aigua | Font de pedra amb sortidor en forma de cap de lleó, manovella de ferro amb **4 braços/radis visibles** (detall real, ha de comptar-se), aigua rajant |
| Planes Bones | 🪨 Terra | Terreny obert, **3 àmfores/gerres d'argila** disposades a la vista (detall real i comptable), herba i pedra seca |
| Entrada del poble | 🔥 Foc | Portal/entrada del nucli, un vell **pal de fusta de telèfon** com a element de referència, sense flama oberta (ja no hi ha foc real a l'estació — evitar-hi qualsevol flama visible per no confondre) |
| Creu del Pujolar | 🌬️ Aire | Creu de ferro sobre pedestal, amb **el número "1246" gravat/pintat a la base** llegible a la imatge, situada en un serrat/turó obert |
| Pista skate (Camí Antic de Malla) | ✨ Ànima | Pista d'skate de ciment amb rampes/turons, punt més alt destacat, ambient nocturn o crepuscular (l'estació es revela amb llanterna UV) |
| Pla de Masset (estació central) | ⚗️ Gresol | Suport de fusta amb un matràs Erlenmeyer central i **5 recipients marcats amb símbols alquímics al voltant**, en un pla obert del poble — veure §5 per als símbols |

⚠️ Pendent confirmar coordenades exactes finals de 3 d'aquestes estacions (`fites-nova.md` assenyala petites diferències respecte a `v2/content/public/estacions.ts`) — no afecta el prompt visual, però sí quina foto de referència in situ es fa servir de base.

---

## 5. SÍMBOLS ALQUÍMICS DELS 5 ELEMENTS (icones)

Per a "La Gran Obra" (nodes del pentagrama a l'app), els pins del mapa, i els recipients del Gresol. Fer servir els **símbols alquímics històrics reals** (no inventar-ne de nous):

| Element | Símbol clàssic | Nom narratiu (Gresol) |
|---|---|---|
| 🪨 Terra | Triangle invertit amb barra horitzontal (🜃) | *Cendra de la Creació* |
| 🔥 Foc | Triangle amb vèrtex amunt (🜂) | *Espurna de Rubí* |
| 🌬️ Aire | Triangle amb vèrtex amunt i barra horitzontal (🜁) | *L'Alè d'Eòl* |
| 💧 Aigua | Triangle invertit (🜄) | *Aigua de Lluna* |
| ✨ Ànima (Quinta Essència) | Cercle simple, o cercle amb els altres 4 inscrits | *La Quinta Essència* |

**Prompt base (icona única, repetir per cada element):**

```
"Alchemical symbol icon for [ELEMENT] — [SÍMBOL DE LA TAULA].
Catalan Gothic illuminated-manuscript style, thick black ink outline,
single flat color fill ([COLOR DE L'ELEMENT]), aged parchment or
transparent background, no gradients, no 3D effects, no drop shadow.
Simple, legible at small size (readable at 48×48px on a mobile screen).
Square canvas, 512×512px, centered composition."
```

---

## 6. OROBORUS (serp mossegant-se la cua)

Necessari per al centre de "La Gran Obra" quan es completen les 5 fites, i com a component de l'emblema de l'Orde (§7).

```
"Ouroboros — a serpent devouring its own tail, forming a perfect
circle. Catalan Gothic illuminated-manuscript style, bold black ink
outline, scales suggested with simple hatching, minimal flat color
(dark oxidised copper-green #4A6B4A or plain black line art),
aged parchment or transparent background. Symmetrical, centered,
legible as a small icon. Square canvas, 512×512px."
```

---

## 7. EMBLEMA DE L'ORDE DEL TESTAMENT

**Descripció confirmada a `historia-nova.md` (no és invenció):** un llibre tancat envoltat per un ouroboros que forma una "Y".

```
"Emblem of a secret order: a closed book wrapped by an ouroboros
serpent whose coiled body forms the shape of the letter 'Y'.
Catalan Gothic illuminated-manuscript / heraldic seal style, bold
black ink outline, restrained gold leaf accent on the book's clasp
only, otherwise flat dark tones. Symmetrical, seal-like composition,
aged parchment background. Square canvas, 1024×1024px."
```

Ús previst: materials físics (cartells, contrasenya de reconeixement), i possiblement pantalla de desemmascarament/final a l'app.

---

## 8. MAPA IL·LUSTRAT DEL POBLE

`v2/public/map-test.webp` és la base tècnica actual (bounds i `latLonToSVG` ja calibrats — no tocar la geometria). **Cal refer només l'estil visual**, no les coordenades:

```
"Illustrated top-down map of a small Catalan medieval village
(La Guixa / Sentfores, Osona) and its surrounding countryside —
stone houses with terracotta roofs, dirt paths, a central square,
scattered fields and low hills. Catalan Gothic illuminated-manuscript
map style (cartography as seen in period manuscripts), flat color
fields, bold black ink outlines for paths and buildings, aged
parchment background. No modern roads, no modern buildings, no text
labels (labels are added separately in the app). Landscape
orientation, high resolution for pan/zoom use."
```

⚠️ Mantenir els mateixos bounds geogràfics que `map-test.webp` actual perquè `latLonToSVG` no es desquadri — donar aquest fitxer com a referència de composició/enquadrament a qui generi la imatge nova, no només el prompt de text.

---

## 9. PERSONATGE — Fra Francesc / "l'Inquisidor" ⚠️ BLOQUEJAT, NO GENERAR ENCARA

`docs/fitxes-personatges/11-fra-francesc-de-sentfores.md` marca explícitament com a **PENDENT, no inventar sense confirmar**:
- Aparença física (edat concreta representada, cara, complexió)
- Vestuari de la disfressa de comissari inquisitorial
- Vestuari/aparença quan es desemmascara com a Fra Francesc

**No generis cap prompt de personatge fins que això es tanqui explícitament** (regla del CLAUDE.md: "No improvisis trama ni solucions"). Quan es decideixi, aquesta secció s'ompliria seguint el mateix format que `docs/MASTER-PROMPT-IMATGES.md` §4 (edat, roba, cabells, detalls, expressió) però amb l'estil visual d'aquest document (§3), no el barroc antic.

---

## 10. MIDA I FORMAT

| Ús | Mida |
|---|---|
| Il·lustració d'estació (hub, targeta) | 1024×1024px |
| Icona d'element / pin de mapa | 512×512px, fons transparent |
| Oroborus / emblema de l'Orde | 512–1024px, fons transparent quan sigui icona |
| Mapa il·lustrat | mida gran horitzontal, mantenir proporció de `map-test.webp` actual |
| Icones d'app (PWA) | ja existents (`icon-192.png`, `icon-512.png`) — revisar si cal actualitzar l'estil quan es tanqui la resta |

---

## 11. CHECKLIST PER A CADA IMATGE NOVA

- [ ] Menciona "L'Alquimista de Sentfores, 1472"
- [ ] Estil: manuscrit il·luminat gòtic català, no barroc del XVIII (l'estil antic queda obsolet)
- [ ] Paleta de §2 (pergamí, pedra, ferro, verdet — or només en detalls puntuals)
- [ ] Sense flama oberta a l'estació de Foc (ja no forma part de la mecànica)
- [ ] Detalls físics reals inclosos quan n'hi ha (4 radis, 3 àmfores, "1246" a la creu — són pistes jugables, han de ser llegibles a la imatge si el cartell physical se'n serveix)
- [ ] Sense elements moderns, sense mode fosc
- [ ] Cap personatge (Fra Francesc/Inquisidor) fins que §9 es desbloquegi

---

## PENDENT abans de generar en massa

- [ ] Confirmar paleta de §2 (or vell continu vs. estil més sobri)
- [ ] Tancar aparença de Fra Francesc/Inquisidor (§9) — bloqueja qualsevol imatge de personatge
- [ ] Confirmar si es vol reaprofitar `font-ferro.webp`/`planes-bones.webp`/`serrat-bruixes.webp` existents (estil antic, barroc) o regenerar-les totes amb l'estil nou per coherència
- [ ] Decidir si el mapa nou es genera per IA o s'il·lustra a mà (per mantenir precisió geogràfica exacta)

---

**Data:** 2026-09-22
**Versió:** 0.1 (esborrany)
