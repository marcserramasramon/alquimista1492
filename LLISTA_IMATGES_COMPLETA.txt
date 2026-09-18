# LLISTA COMPLETA D'IMATGES — El Traïdor de la Guixa

**Data:** 17 de setembre de 2026  
**Estat:** Recull complet de descripcions i requisits  
**Actualització:** Basat en docs/historia.md, docs/interficie.md, evidencies.md, jocs dev i cartells

---

## 📋 ÍNDEX

1. [**CARTELLS FÍSICS**](#cartells-físics) — Material A2/A1 per les estacions
2. [**IMATGES WEBAPP**](#imatges-webapp) — Ilustracions per a la webapp
3. [**CARTES I DOCUMENTS**](#cartes-i-documents) — Pergamí, signatures, segells
4. [**AVATARS I PERSONATGES**](#avatars-i-personatges) — Retrats o ombres
5. [**ICONES I UI**](#icones-i-ui) — Elements gràfics de la interfície
6. [**MAPES**](#mapes) — Plànols interactius

---

## CARTELLS FÍSICS

Tots en **format A2 (420×594 mm) o A1 (594×841 mm)**, **300 dpi**, **laminats matt**, resistents a humitat.

### 1. **Cartell Estació 1: Serrat de les Bruixes — El Codi de Fogueres**

**ID:** `cartell_1_serrat_bruixes.png`

**Descripció:**
- Títol: "SENYALS DE FOC DE LA PLANA"
- Quadrat de Polibi 5×5 (A–Z, Ç, punt=espai) amb números 1–5 als eixos
- Text context narratiu (en pseudo-medieval)
- Decoració: Petits símbols de fogueres/flames als marges i cantonades
- Fons: Pergamí envellit amb textura visible
- Text: Tinta marró fosc
- QR placeholder (5×5 cm) a la cantonada inferior dreta

**Prompt:**
```
Medieval Catalan station placard, 1705 era. Mountain pass of Serrat de les Bruixes. 
Historically accurate 5×5 grid decipherment chart (A–Z, Ç, space dot) with numbers 
1–5 on both axes. Header: "SENYALS DE FOC DE LA PLANA" with explanation text in Old Catalan. 
Decorative border of mountain peaks and fire signals (small flame icons, bonfires). 
Aged parchment beige with dark brown ink. Include QR placeholder (white square) at bottom right. 
Clear from 2 meters away. Medieval/XVI–XVII style lettering.
```

---

### 2. **Cartell Estació 2: Font del Ferro — Tinta i Torns d'Aigua**

**ID:** `cartell_2_font_ferro.png`

**Descripció:**
- Títol: "TINTA DE GALES, A LA MANERA DELS NOTARIS"
- Recepte medieval (5–6 línies de text)
- Taula 7×2 (dates 10–16 de maig, noms dels persones per dia)
- Dia clau (**12, 11 o 13 segons variant**) en negreta o destacat
- Decoració: Galls de roure, gots d'aigua, símbol de tinta (tintero)
- Fons: Pergamí envellit, textura "herbari d'apotecari"
- Text: Tinta marró/violàcia
- QR placeholder (5×5 cm) a la cantonada inferior dreta

**Nota:** **3 CARTELLS DIFERENTES** (un per variant A, B, C) o 1 modular amb inserts

**Prompt:**
```
Medieval Catalan water registry placard, 1705. Font del Ferro spring location. 
Aged parchment with historical ink-making recipe at top (5 lines), followed by 
clear table: 7 rows (May 10–16), 2 columns (date, villagers' names). Highlight 
May 12 row (bold, tint, or border). Decorative elements: gall oak leaves, water vials, 
ink bottle. Color: cream parchment with dark brown/violet ink. Include QR placeholder 
at bottom right. Medieval "apothecary ledger" style. Readable from 2 meters.
```

---

### 3. **Cartell Estació 3: Planes Bones — La Ronda de la Patrulla**

**ID:** `cartell_3_planes_bones.png`

**Descripció:**
- Títol: "LA RONDA DE LA PATRULLA"
- Mapa grid 4×4 (esquemàtic, non-geo):
  - Ubicacions: Plaça, Hostal, Escola, Rectoria, Farga, Font, Cementiri, Riera, Bosc, Pou, Era, Hort, Paller, Molí, Camí Vic
  - Marcar zones prohibides (Bosc, Riera, Cementiri) en gris/ratllat
  - Marcar INICI (Plaça, 22:00) amb estrella o marcador
  - Marcar DESTÍ (Farga, 23:00) amb altra marca
- Regles de moviment (text, 5 línies)
- Fons: Pergamí amb grid visible
- Text: Negre/marró
- QR placeholder (5×5 cm) a la cantonada inferior dreta

**Prompt:**
```
Medieval Catalan patrol map placard, 1705. Planes Bones village. Create a 4×4 grid 
showing village locations (text labels): Plaça, Hostal, Escola, Rectoria, Farga, Font, 
Cementiri, Riera, Bosc, Pou, Era, Hort, Paller, Molí, Camí Vic. Mark prohibited zones 
(Bosc, Riera, Cementiri) with diagonal lines or gray tint. Mark START (Plaça, 22:00) 
with star, END (Farga, 23:00) with different symbol. Include movement rules (5 lines 
in Old Catalan). Aged parchment, dark brown/black ink. Include QR placeholder at 
bottom right. Readable from 2 meters.
```

---

### 4. **Cartell Estació 4: Cementiri — Fragments de la Carta i Làpides**

**ID:** `cartell_4_cementiri.png`

**Descripció:**
- Títol: "FRAGMENT COPIAT DE LA CARTA"
- Mostrar 3 còpies del mateix nom (variant A, B o C)
- Imatge de làpida (esquemàtica o foto texturitzada)
- Taula comparació:
  - Còpia de la carta (errada del picapedrer)
  - Làpida (errada visible)
  - Registre parroquial correcte
- Context narratiu (3–4 línies)
- Fons: Pergamí amb textura de pedra o marmol
- Text: Tinta nera
- QR placeholder (5×5 cm) a la cantonada inferior dreta

**Prompt:**
```
Medieval Catalan cemetery placard, 1705. Show a copied name fragment (from letter) with 
three variants of same name, highlighting spelling error (missing accent, wrong letter). 
Include schematic or textured image of a tombstone/gravestone. Create comparison table:
- Copy from letter (with error)
- Tombstone inscription (with same error)
- Church registry (correct spelling)
Include context text (4 lines in Old Catalan). Aged parchment background with subtle 
stone texture. Dark brown/black ink. QR placeholder bottom right. Medieval script style.
```

---

### 5. **Cartell Estació 5: Pla de Masset — Control de l'Emissari**

**ID:** `cartell_5_pla_masset_control.png`

**Descripció:**
- Títol: "CONTROL DEL PLA DE MASSET"
- Imatge de l'Emissari (ombra, silueta, o retrat esquemàtic)
  - Barret de tres puntes, capa, fanal de llum
- Preguntes de verificació (3–4 línies de text narratiu)
- Marca de passaport o "salconduit" visual
- Fons: Pergamí més fosc, més sever
- Text: Tinta nera/vermella
- QR placeholder (5×5 cm) a la cantonada inferior dreta

**Prompt:**
```
Medieval Catalan control checkpoint placard, 1705. Pla de Masset location. Silhouette 
or schematic portrait of l'Emissari (The Messenger) in dark clothing, three-pointed hat, 
cloak, holding an oil lamp (candlelight glow). Include 4 lines of verification questions 
in Old Catalan (narrative, not mechanical). Show visual mark of "salconduit" (pass document). 
Darker parchment background (more austere). Black/red ink. Medieval handwriting style. 
QR placeholder bottom right.
```

---

### 6. **Cartell Estació 6: Rectoria — La Caixa de les Almoines**

**ID:** `cartell_6_rectoria.png`

**Descripció:**
- Títol: "CAIXA DE LES ALMOINES"
- Imatge de la caixa (perspectiva 3D esquemàtica o retrat)
  - Fusta antiga, cadenat visible, serradura
  - Ornaments religiosos discrets
- Context narratiu (3–5 línies): el rector ha estat ferit, la clau està perduda
- Símbol del codi dels 4 elements (4 escuts/quadrants amb els elements: FOC, AIGUA, TERRA, PEDRA)
- Fons: Pergamí envellit
- Text: Tinta nera
- QR placeholder (5×5 cm) a la cantonada inferior dreta

**Prompt:**
```
Medieval Catalan alms box placard, 1705. Rectory chapel. Create detailed schematic 
or 3D perspective of an old wooden donation box (caixa de les almoines) with padlock, 
visible keyhole, and discrete religious ornaments (cross, floral motifs). Include 
4–5 lines of narrative text in Old Catalan (rector wounded, key lost in darkness). 
Below, show 4 elemental shields/quadrants representing the code's four elements: 
FOC (Fire), AIGUA (Water), TERRA (Earth), PEDRA (Stone). Aged parchment background. 
Dark brown/black ink. Medieval script. QR placeholder bottom right.
```

---

## IMATGES WEBAPP

Aquestes imatges es mostren dins la webapp (Next.js). **Format: PNG transparent o JPG**, **resolució: 1024×1024 px** (escalables amb CSS).

### 7. **Imatge Narrativa: Vigies a la Nit (Serrat de les Bruixes)**

**ID:** `image_vigies_fogueres.png`

**Descripció:**
- Escena nocturna: turons silhuetats contra cel estrellat
- Fogueres/flames parpellejant en dos turons
- Figures humanes (silhuetes) observant des del Serrat
- Atmosfera: sinistre, vent, lluny
- Mida: 800×600 px
- Estil: Gravat medieval, tonalitats marró/taronja/negre

**Prompt:**
```
Medieval nighttime vigil scene, mountain pass (Serrat de les Bruixes). 
Silhouetted peaks against starry sky. Two bonfires flickering on distant hilltops 
(orange-red flames, smoke). Human figures (silhouettes) observing from foreground. 
Atmospheric: wind, vast distance, foreboding. Medieval engraving style. 
Colors: sepia, browns, black, orange glow. No modern elements. 
Dimensions: 800×600 px.
```

---

### 8. **Imatge Narrativa: Font de l'Aigua (Font del Ferro)**

**ID:** `image_font_ferro_water.png`

**Descripció:**
- Escena diürna: font rural medieval amb pedra
- Aigua clar/ferrosa (tonalitat brunenca)
- Persones recollint aigua en cants/gerres
- Entorn: arbres, bosc al fons
- Mida: 800×600 px
- Estil: Aquarel·la medieval

**Prompt:**
```
Medieval rural spring scene, Font del Ferro (iron-bearing spring). Daylight. 
Stone spring structure (ornamental basin, water channel). Clear but iron-tinted water 
(brownish tint). Villagers collecting water in clay vessels (cantarelles). Surrounding forest, 
trees, natural landscape. Medieval watercolor style. Colors: browns, greens, ochre, stone gray. 
Historical accuracy (no modern elements). Dimensions: 800×600 px.
```

---

### 9. **Imatge Narrativa: Patrulla Nocturna (Planes Bones)**

**ID:** `image_patrol_night.png`

**Descripció:**
- Escena nocturna: grup de guàrdies/milicians caminant
- Portant llanternes, moixos (sticks?), armes medievals
- Recorregut pels carrers del poble
- Alguns edificis visibles (escola, rectoria)
- Mida: 800×600 px
- Estil: Gravat negre i blanc o sepia

**Prompt:**
```
Medieval night patrol scene, village streets (Planes Bones). Group of guards/militia 
walking in formation, carrying oil lamps and wooden staffs, wearing medieval garb 
(simple armor, cloaks). Buildings visible: church, school, rectory. Cobblestone streets, 
narrow alleys. Night atmosphere: shadowy, moonlit. Medieval engraving or sepia style. 
Black, white, brown tones. No modern elements. Dimensions: 800×600 px.
```

---

### 10. **Imatge Narrativa: Cementiri Nocturn (Cementiri)**

**ID:** `image_cemetery_night.png`

**Descripció:**
- Cementiri medieval de nit
- Làpides, cruces (de pedra)
- Lluna, ombres
- Atmosfera: misteriosa, por
- Mida: 800×600 px
- Estil: Gravat fosc, atmosfèric

**Prompt:**
```
Medieval cemetery at night (Cementiri de la Guixa). Stone graves, crosses, 
weathered tombstones with inscriptions (blurred but visible). Moonlight creating 
long shadows. Bare trees, fence. Atmospheric: eerie, mysterious, foreboding. 
Gothic engraving style. Black, gray, white, dark blue tones. No modern elements. 
Dimensions: 800×600 px.
```

---

### 11. **Imatge Narrativa: La Rectoria de Dia**

**ID:** `image_rectoria_day.png`

**Descripció:**
- Casa solana medieval (rectoria)
- Finestres, porta principal
- Context: poble al fons
- Llum del dia, atmosfera normal (contrast amb altres scenes)
- Mida: 800×600 px
- Estil: Aquarel·la suau

**Prompt:**
```
Medieval rectory house, daylight (Casa de la Rectoria, Guixa). Stone/timber structure, 
rectangular building, slate roof. Large arched door, several windows with shutters. 
Small attached chapel or cross above. Village context in background. Daytime: clear sky, 
soft shadows. Medieval watercolor style. Warm earth tones, grays, greens. Peaceful, normal 
(contrasts with nighttime scenes). Dimensions: 800×600 px.
```

---

### 12. **Icona: Fogueres (Foc)**

**ID:** `icon_fire_beacon.png`

**Descripció:**
- Signe/icona representant FOC
- Foguera/flama esquemàtica
- Mida: 128×128 px
- Estil: Medieval, minimal
- Color: Or/taronja/negre

**Prompt:**
```
Medieval fire beacon icon. Stylized bonfire or flame symbol, simple geometric design. 
Square icon, 128×128 px. Colors: gold, orange, dark brown/black. Flat or engraved style. 
Clean, readable at small size. Can be used as game element marker.
```

---

### 13. **Icona: Aigua (Water)**

**ID:** `icon_water_drop.png`

**Descripció:**
- Signe/icona representant AIGUA
- Gota d'aigua esquemàtica
- Mida: 128×128 px
- Estil: Medieval, minimal
- Color: Blau/violeta/negre

**Prompt:**
```
Medieval water icon. Stylized water drop or spring symbol, simple geometric design. 
Square icon, 128×128 px. Colors: blue, violet, dark brown/black. Flat or engraved style. 
Clean, readable at small size. Medieval aesthetic.
```

---

### 14. **Icona: Terra (Earth)**

**ID:** `icon_earth.png`

**Descripció:**
- Signe/icona representant TERRA
- Rotlle/terra esquemàtica
- Mida: 128×128 px
- Estil: Medieval, minimal
- Color: Verd/marró/negre

**Prompt:**
```
Medieval earth icon. Stylized soil/earth or plowed field symbol, simple geometric design. 
Square icon, 128×128 px. Colors: olive green, brown, dark brown/black. Flat or engraved style. 
Clean, readable at small size. Medieval aesthetic.
```

---

### 15. **Icona: Pedra (Stone)**

**ID:** `icon_stone.png`

**Descripció:**
- Signe/icona representant PEDRA
- Pedra/roca esquemàtica
- Mida: 128×128 px
- Estil: Medieval, minimal
- Color: Gris/marró/negre

**Prompt:**
```
Medieval stone icon. Stylized stone or rock symbol, simple geometric design. 
Square icon, 128×128 px. Colors: gray, taupe, dark brown/black. Flat or engraved style. 
Clean, readable at small size. Medieval aesthetic.
```

---

### 16. **Imatge Caixa de les Almoines (3D esquemàtica)**

**ID:** `image_alms_box_3d.png`

**Descripció:**
- Caixa de donations medieval (perspectiva 3D isomètrica o esquemàtica)
- Fusta antiga, cadenat, detalls religiosos (creu gravada)
- Mida: 600×600 px
- Estil: Esquemàtic medieval, sepia
- Llum/ombra per profunditat

**Prompt:**
```
Medieval alms box (caixa de les almoines), 3D isometric or schematic view. 
Wooden box with padlock, keyhole, engraved cross or religious ornaments. 
Aged, weathered appearance. Perspective shows depth. Sepia/brown tones, 
subtle shading. Square image, 600×600 px. No modern elements. 
Medieval style, technically clean (not photorealistic).
```

---

## CARTES I DOCUMENTS

### 17. **Carta Original de Bernat (Parchment Visual)**

**ID:** `document_berats_original_letter.png`

**Descripció:**
- Pergamí plega, vell, amb doblecs
- Text manuscrit (no legible, però visual d'està)
- Segell de lacre amb símbols (ploma + clau)
- Manchetes, senyals de viatge
- Mida: 800×1000 px
- Estil: Fotografia de pergamí antic, sepia intenso

**Prompt:**
```
Medieval handwritten letter document (Carta de Bernat). Aged parchment with folds and creases. 
Manuscript text (illegible but visible handwriting), signed with wax seal bearing symbols 
(quill and key motif). Spots, stains, travel marks. Sepia/brown tones, worn edges, 
creases from folding and carrying. Looks authentic and old (16–17th century appearance). 
No modern text visible. Dimensions: 800×1000 px.
```

---

### 18. **Carta Falsa del Rector (Parchment Visual)**

**ID:** `document_false_letter_rector.png`

**Descripció:**
- Pergamí similar a l'original de Bernat
- Text manuscrit (no legible)
- Segell IDENTIC al de Bernat (ploma + clau)
- Però noms falsos i lloc falso (sutilment diferent)
- Mida: 800×1000 px
- Estil: Fotografia de pergamí antic, sepia

**Nota:** Visualment quasi idèntica a l'original; els jugadors han de validar el segell.

**Prompt:**
```
Medieval handwritten letter document (Carta Falsa del Rector). Aged parchment, 
nearly identical to Bernat's original letter in appearance. Same wax seal (quill and key motif) 
to fool the Messenger. Manuscript text (illegible but visible). Creases, stains, travel marks 
similar to original. Sepia/brown tones. The deception is visual but text content differs 
(false names, false location). Dimensions: 800×1000 px.
```

---

### 19. **Nota del Capità (Small Parchment)**

**ID:** `document_captains_note.png`

**Descripció:**
- Billet curt, plega
- Text curt (2–3 línies): "Els noms a trenc d'alba, i el vostre fill dorm a casa..."
- Sense segell formal, però signat
- Mida: 400×300 px
- Estil: Fotografia de pergamí/paper oficial, sepia

**Prompt:**
```
Medieval official note/letter (Nota del Capità). Small parchment or heavy paper, folded. 
Short text (2–3 lines in Old Catalan): "Els noms a trenc d'alba, i el vostre fill dorm a casa. 
Qui porti la carta dirà: l'alba ve de Vic." Signed but no formal seal. Stains, folds, 
worn corners. Military/official appearance. Sepia tones, dark ink. Dimensions: 400×300 px.
```

---

### 20. **Declaració del Rector (Parchment with Signature)**

**ID:** `document_rector_declaration.png`

**Descripció:**
- Pergamí formal (més oficial que les cartes)
- Text més llarg (5–6 línies): jurament que l'Anton va vetllar tota la nit
- Signatura manuscrita (Gran firma del Rector)
- Segellet o creus notarials discrets
- Mida: 800×600 px
- Estil: Document notarial, sepia/negre

**Prompt:**
```
Medieval notarial document (Declaració del Rector). Formal parchment, official appearance. 
Text in Old Catalan (5–6 lines), a sworn statement that Antoni (the sacristan) watched 
the rector all night of May 15. Large handwritten signature of Mossèn Ramon (Rector). 
Small notarial marks or crosses. Sepia/brown with black ink. Looks authentic and legally binding 
(medieval style). Dimensions: 800×600 px.
```

---

### 21. **Exercici de Cal·ligrafia (School Parchment)**

**ID:** `document_calligraphy_exercise.png`

**Descripció:**
- Pregamí de nens, pàgina escolar
- Noms repetits (copia/exercici): Josep Vilardell, Maria Rovira, etc. (del registre de difunts)
- Lletra d'infantil, sense corregir, alguns errores
- Taques de tinta, ratllades
- Mida: 800×600 px
- Estil: Fotografia de document medieval infantil

**Prompt:**
```
Medieval school handwriting exercise (Pàgina d'exercici de nens). Simple parchment, 
childish handwriting copying names from church death registry: Josep Vilardell, Maria Rovira, etc. 
Names repeated multiple times. Unpolished, some ink smears, crossed-out letters. 
Looks like genuine student work. Sepia/tan parchment with black/brown ink. 
Authentic appearance of medieval school material. Dimensions: 800×600 px.
```

---

### 22. **Taula dels Vigies (Evidence Sheet)**

**ID:** `evidence_firebeacons_sheet.png`

**Descripció:**
- Pergamí amb taula de senyals de fogueres
- Gràfic o taula de transmissions de fogueres
- Noms de vigies, turons, hores
- Segellet o marca de l'autoritat
- Mida: 800×600 px
- Estil: Document oficial dels vigies

**Prompt:**
```
Medieval watchers' signal log (Taula dels Vigies). Official parchment showing 
fire beacon transmission records. Table or chart format with dates (May 15), beacon locations, 
message content, times. Names of watchers on different peaks. Official seal or mark. 
Sepia/tan parchment, dark brown/black ink. Historical authenticity (medieval signal system). 
Dimensions: 800×600 px.
```

---

### 23. **Llibreta de Torns de la Font (Ledger Page)**

**ID:** `evidence_water_ledger_page.png`

**Descripció:**
- Pàgina de llibreta de registre (més usa que parchment, paper més bast)
- Taula: dates, noms de persones que van a la font
- Anotacions manuscrites, correccions, esmenes
- Taca de tinta/aigua
- Mida: 800×600 px
- Estil: Llibreta d'anotacions medieval

**Prompt:**
```
Medieval water collection ledger (Llibreta de Torns de la Font). Record book page, rougher 
paper than parchment. Table format with dates (May 10–16) and villagers' names who collected 
water. Handwritten entries, corrections, erasures. Water stains, ink smudges, wear marks. 
Looks like working ledger (not formal document). Sepia/tan paper, dark brown ink. 
Authentic medieval record-keeping style. Dimensions: 800×600 px.
```

---

## AVATARS I PERSONATGES

### 24. **Retrat Esquemàtic: Bernat (Mestre d'Escola)**

**ID:** `portrait_bernat_master.png`

**Descripció:**
- Retrat medieval d'home ~60 anys (1664)
- Habillament de mestre: túnica simple, birreta o barret medieval
- Expresió: cansada però digne
- Mida: 300×400 px
- Estil: Miniatura medieval o gravat

**Prompt:**
```
Medieval portrait of Bernat, village schoolmaster (master d'escola), age ~60 (born 1664). 
Simple tunic, school cap or medieval hat. Dignified but weary expression. 
Worn face, intelligent eyes. Medieval miniature or engraving style. 
Sepia/brown tones, fine lines. No modern elements. Dimensions: 300×400 px.
```

---

### 25. **Retrat Esquemàtic: Mossèn Ramon (Rector)**

**ID:** `portrait_ramon_rector.png`

**Descripció:**
- Retrat medieval de clergue/sacerdot (40–50 anys)
- Habillament: sotana, barret de sacerdot o cap descobert (tonsura suggerida)
- Expresió: autoritari però compasiu
- Mida: 300×400 px
- Estil: Miniatura medieval o gravat

**Prompt:**
```
Medieval portrait of Mossèn Ramon, village rector (priest), age 40–50. 
Clerical vestments (cassock or robe), priest's cap or tonsure suggested. 
Authoritative yet compassionate expression. Wise, commanding presence. 
Medieval miniature or engraving style. Sepia/brown tones, fine details. 
No modern elements. Dimensions: 300×400 px.
```

---

### 26. **Retrat Esquemàtic: L'Emissari (Agent del Capità)**

**ID:** `portrait_emissari_agent.png`

**Descripció:**
- Silhueta o retrat sever de l'agent/soldat
- Habillament: capa fosca, barret de tres puntes, autoritat militar
- Expresió: fred, severo, sense emoció
- Mida: 300×400 px
- Estil: Gravat negre/blanc, sever

**Prompt:**
```
Medieval portrait of l'Emissari, military agent/messenger of the Captain of Vic. 
Dark cloak, three-pointed hat, military authority in bearing. Cold, severe expression, 
emotionless face. Mysterious, threatening presence. Black and white engraving style, 
sharp lines. No modern elements. Dimensions: 300×400 px.
```

---

### 27. **Retrat Esquemàtic: Anton (Escolà/Sacristan)**

**ID:** `portrait_anton_sacristan.png`

**Descripció:**
- Retrat de jove (~17–20 anys)
- Habillament: túnica simple d'escolà, gorra o cap descobert
- Expresió: jove, dutxós, amb por
- Mida: 300×400 px
- Estil: Miniatura medieval

**Prompt:**
```
Medieval portrait of Anton, young sacristan (escolà), age ~18–20. 
Simple tunic, youth cap or bare head. Fearful, dutiful expression. 
Young face, worried eyes. Faithful servant appearance. 
Medieval miniature style. Sepia/brown tones, softer lines. 
No modern elements. Dimensions: 300×400 px.
```

---

## ICONES I UI

### 28. **Icona: Mapa**

**ID:** `icon_map.png`

**Descripció:**
- Icona simple per al botó MAPA
- Mapa esquemàtic o símbol de localització
- Mida: 48×48 px
- Estil: Simple, icona UI

---

### 29. **Icona: Quadern**

**ID:** `icon_quadern.png`

**Descripció:**
- Icona simple per al botó QUADERN
- Llibre obert o quadern
- Mida: 48×48 px
- Estil: Simple, icona UI

---

### 30. **Icona: QR Scanner**

**ID:** `icon_scanner.png`

**Descripció:**
- Icona simple per al botó ESCANEJA QR
- Símbol de càmera o codi QR
- Mida: 60×60 px (més gran, central)
- Estil: Simple, icona UI

---

### 31. **Icona: História**

**ID:** `icon_historia.png`

**Descripció:**
- Icona simple per al botó HISTÓRIA
- Llibre obert, pergamí, o símbol narratiu
- Mida: 48×48 px
- Estil: Simple, icona UI

---

### 32. **Icona: Salvos**

**ID:** `icon_salvos.png`

**Descripció:**
- Icona simple per al botó SALVOS/Salconduits
- Medalla, insígnia, o document oficial
- Mida: 48×48 px
- Estil: Simple, icona UI

---

### 33. **Imatge Segell de Bernat (Ploma + Clau)**

**ID:** `seal_bernat_quill_key.png`

**Descripció:**
- Segell de lacre medieval (circular, hexagonal o ovalat)
- Símbol: ploma creuada amb clau
- Textura: lacre envellit, impressió visible
- Mida: 200×200 px
- Estil: Fotografia de segell de lacre antic

**Prompt:**
```
Medieval wax seal impression (Segell de Bernat). Circular or hexagonal seal showing 
symbols of quill (writing instrument) and key (trust/authority). Wax texture, aged appearance, 
deep impression lines. Looks like historical seal stamp. Sepia/red wax tones. 
Authentic medieval sigil appearance. Dimensions: 200×200 px.
```

---

### 34. **Imatge Segells Falsos (Per a Mini-Game)**

**ID:** `seal_options_fake_real.png`

**Descripció:**
- 4 segells mitjà (1 correcte de Bernat, 3 falsos/similars)
- Tots amb variacions petites (símbol diferent, textura diferent, etc.)
- Els jugadors han de triar el correcte per segellar la carta falsa
- Mida: 400×300 px (4 segells en grid 2×2)
- Estil: Fotografia de segells de lacre

**Prompt:**
```
Medieval wax seal options (4 variations). One is Bernat's authentic seal 
(quill and key symbol), three are convincing fakes with minor variations 
(wrong symbol, different wax texture, etc.). All aged, worn appearance. 
Grid format 2×2. Players must recognize the correct seal to use on false letter. 
Sepia/red wax tones. Authentic medieval appearance. Dimensions: 400×300 px.
```

---

## MAPES

### 35. **Mapa Interactiu: La Guixa (4 Estacions)**

**ID:** `map_guixa_interactive.png` / `map_guixa.svg`

**Descripció:**
- Mapa esquemàtic de La Guixa
- Marcar les 4 ubicacions d'estacions:
  1. Serrat de les Bruixes (nord-est, turó)
  2. Font del Ferro (sud-est, font)
  3. Planes Bones (est, pla)
  4. Cementiri (sud-oest, cementiri)
- Mostrar també: rectoria, escola, plaça, hostal
- Rutes entre estacions (opcional)
- Mida: 800×800 px (quadrat)
- Estil: Mapa medieval, pergamí

**Prompt:**
```
Medieval map of village La Guixa, Osona region, 1705. Schematic layout showing four 
game stations: Serrat de les Bruixes (hilltop, NE), Font del Ferro (spring, SE), 
Planes Bones (plains, E), Cementiri (cemetery, SW). Also mark other locations: Rectory, 
School, Plaza, Inn. Show paths between locations. Compass rose. Medieval cartography style. 
Parchment background, brown/sepia ink, ornamental borders. No modern elements. 
Square format, 800×800 px.
```

---

### 36. **Mapa Planes Bones (4×4 Grid)**

**ID:** `map_planes_bones_grid.png` / `map_patrol_interactive.svg`

**Descripció:**
- Grid 4×4 interactiu (Mapa del Joc 3)
- Marcar caselles amb noms: Plaça, Hostal, Escola, Rectoria, Farga (destí), Font, Cementiri (prohibit), etc.
- Color codi: lloc accessible (blanc), prohibit (gris), inici (verd), destí (or)
- Mida: 600×600 px
- Estil: Grid esquemàtic, medieval

**Prompt:**
```
Medieval patrol route game map (Planes Bones). 4×4 grid showing village locations:
- Plaça (START, green)
- Farga (DESTINATION, gold)
- Prohibited zones: Cementiri, Riera, Bosc (gray diagonal lines)
- Accessible locations: Hostal, Escola, Rectoria, Font, Hort, Pou, Era, Paller, 
  Molí, Camí Vic (white/light)
Grid lines clear. Medieval schematic style. Parchment or light background. 
Dark brown/black lines and text. No modern elements. Square, 600×600 px.
```

---

### 37. **Imatge de Fonda: La Rectoria (Per a Context)**

**ID:** `image_rectoria_interior.png`

**Descripció:**
- Interior senzill de la rectoria
- Porta d'entrada, caixa de les almoines visible al porxo
- Taula, cadira (moble medieval)
- Llum suau (foguera o vela)
- Mida: 800×600 px
- Estil: Aquarel·la medieval, atmosfera càlida

**Prompt:**
```
Medieval rectory interior scene (Casa de la Rectoria). Simple, sparse furnishings: 
wooden table, chair, fireplace. Alms box (caixa de les almoines) visible by door/porch 
entrance. Soft candlelight or firelight. Stone walls, small windows. 
Clean, holy atmosphere. Medieval watercolor style. Warm sepia, browns, 
reds from fire. Dimensions: 800×600 px.
```

---

## TAULA RESUM

| ID | Nom | Tipus | Mida | Format | Estil |
|----|-----|------|------|--------|-------|
| 1 | Cartell 1: Serrat Bruixes | Físic A2 | 420×594 mm | PNG/JPG | Medieval |
| 2 | Cartell 2: Font Ferro | Físic A2 | 420×594 mm | PNG/JPG | Medieval |
| 3 | Cartell 3: Planes Bones | Físic A2 | 420×594 mm | PNG/JPG | Medieval |
| 4 | Cartell 4: Cementiri | Físic A2 | 420×594 mm | PNG/JPG | Medieval |
| 5 | Cartell 5: Pla Masset Control | Físic A2 | 420×594 mm | PNG/JPG | Medieval |
| 6 | Cartell 6: Rectoria Caixa | Físic A2 | 420×594 mm | PNG/JPG | Medieval |
| 7 | Vigies a la Nit | Webapp | 800×600 px | PNG | Gravat |
| 8 | Font del Ferro Aigua | Webapp | 800×600 px | PNG | Aquarel·la |
| 9 | Patrulla Nocturna | Webapp | 800×600 px | PNG | Gravat |
| 10 | Cementiri Nocturn | Webapp | 800×600 px | PNG | Gravat |
| 11 | Rectoria de Dia | Webapp | 800×600 px | PNG | Aquarel·la |
| 12 | Icona FOC | Webapp | 128×128 px | PNG | Medieval |
| 13 | Icona AIGUA | Webapp | 128×128 px | PNG | Medieval |
| 14 | Icona TERRA | Webapp | 128×128 px | PNG | Medieval |
| 15 | Icona PEDRA | Webapp | 128×128 px | PNG | Medieval |
| 16 | Caixa 3D | Webapp | 600×600 px | PNG | Esquemàtic |
| 17 | Carta Original Bernat | Webapp | 800×1000 px | PNG | Fotografia Document |
| 18 | Carta Falsa Rector | Webapp | 800×1000 px | PNG | Fotografia Document |
| 19 | Nota Capità | Webapp | 400×300 px | PNG | Fotografia Document |
| 20 | Declaració Rector | Webapp | 800×600 px | PNG | Fotografia Document |
| 21 | Exercici Cal·ligrafia | Webapp | 800×600 px | PNG | Fotografia Document |
| 22 | Taula Vigies | Webapp | 800×600 px | PNG | Fotografia Document |
| 23 | Llibreta Torns Font | Webapp | 800×600 px | PNG | Fotografia Document |
| 24 | Retrat Bernat | Webapp | 300×400 px | PNG | Miniatura Medieval |
| 25 | Retrat Mossèn Ramon | Webapp | 300×400 px | PNG | Miniatura Medieval |
| 26 | Retrat Emissari | Webapp | 300×400 px | PNG | Gravat |
| 27 | Retrat Anton | Webapp | 300×400 px | PNG | Miniatura Medieval |
| 28 | Icona Mapa | Webapp | 48×48 px | PNG | UI Icon |
| 29 | Icona Quadern | Webapp | 48×48 px | PNG | UI Icon |
| 30 | Icona Scanner | Webapp | 60×60 px | PNG | UI Icon |
| 31 | Icona História | Webapp | 48×48 px | PNG | UI Icon |
| 32 | Icona Salvos | Webapp | 48×48 px | PNG | UI Icon |
| 33 | Segell Bernat | Webapp | 200×200 px | PNG | Fotografia Document |
| 34 | Segells Opcions | Webapp | 400×300 px | PNG | Fotografia Document |
| 35 | Mapa Guixa | Webapp | 800×800 px | PNG/SVG | Mapa Medieval |
| 36 | Mapa Planes Bones Grid | Webapp | 600×600 px | PNG/SVG | Grid Esquemàtic |
| 37 | Interior Rectoria | Webapp | 800×600 px | PNG | Aquarel·la |

---

## NOTES GENERALS

### Estil Visual General
- **Épica medieval (1705):** Tots els documents i retrats han de semblar autèntics (XVI–XVII secolo)
- **Parchment/sepia:** Tonalitats marró, taronja, negre; sense colors moderns vius
- **Legibilitat:** Text clarament llegible des de 2 metres (cartells físics)
- **Sense elementos moderns:** Cap símbol, text o estil post-1750

### Producció
1. **Cartells físics:** Imprimir a 300 dpi, laminat mate, suports robust per intempèrie
2. **Imatges webapp:** PNG transparent o JPG, escalables amb CSS, caché al servidor
3. **Documents:** Aparença de pergamí antic (textura, envelliment, taques)
4. **Icones:** Consistència visual, legibles a 48×48 px

### Prioritat de Creació
**ALTA:** Cartells 1–6 (físic, imprescindible pel joc)  
**ALTA:** Cartes i documents (17–23, necessaris per gameplay)  
**MITJANA:** Imatges narratives (7–11, milloren experiència)  
**MITJANA:** Icones (28–32, necessàries per UI)  
**BAIXA:** Retrats personatges (24–27, opcional/mejora)

---

**Data d'actualització:** 17 de setembre de 2026  
**Responsable:** Compilat des de docs/historia.md, docs/interficie.md, evidencies.md, jocs dev, cartells
