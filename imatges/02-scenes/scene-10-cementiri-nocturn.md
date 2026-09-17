# SCENE-10 — Cementiri Nocturn: Noms de les Llàpides

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | scene-10-cementiri-nocturn |
| **Categoria** | Webapp Scene (Card/Modal Background) |
| **Acte** | I — La Investigació |
| **Estació** | Cementiri |
| **Rol en Gameplay** | Ambientació Narrativa + Context d'Estació |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 9:16 (portrait vertical, mòbil) |
| **Dimensions Mòbil** | 375×667 px |
| **Dimensions Genere IA** | 1875×3328 px (escalat 5×) |
| **Format** | JPG |
| **Compressió** | 70% quality |
| **Mida Fitxer** | ~300–400 KB |
| **Comportament** | Static (no scroll, no zoom) |
| **Ubicació Webapp** | Card de stació (Cementiri intro) |

---

## Descripció Narrativa

**Context Narratiu:**
El cementiri de la Guixa guarda els noms de tots els habitants morts del poble. La nit del 15 de maig, algú va copiar noms de les làpides medievals per forjar la firma de l'avis del sospitós. Això dona una pista clau: la font dels noms és el registre de difunts. Els jugadors investigen les làpides, comparen caligrafies i descobreixen que alguns noms de la carta deladora van ser copiats del cementiri.

**Visió de l'Escena:**
Escena nocturna medieval dins el cementiri de la Guixa. Làpides de pedra antiga, erosionades pel temps, amb noms tallats que són quasi illegibles a la fosca. Creu de ferro a l'entrada. Arbres nodes i vellosos rodejant el tancat. Boira baixa que toca les còpules de les llàpides. Porta medieval del cementiri (ferro i fusta). Cap figura humana, però sensació de presència passada—els morts són testimonis. Lluny, l'église silhuetada. Llum d'una ximbomba amb espelma de sorgió (poca llum).

**Detalls Visuals:**
- **Foreground:** Làpides altes de pedra calcària (sèpia grisenc)
- **Midground:** Més làpides, creu de ferro, porta de tancada
- **Background:** Arbres nodes, es eclesia silhuetada, boira
- **Atmosfera:** Boira rastrera, humitat nocturna, quietud de la mort, silenci absolut
- **Llum:** Ximbomba amb espelma feble (naranja molt tènue), ombres profundes, gairebé completa fosca

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan cemetery at night, 1705. Graveyard of La Guixa surrounded by ancient stone walls. 
Nighttime atmosphere with thick low-lying mist touching the ground and gravestones.
Old weathered stone gravestones (llàpides) scattered throughout—carved with names barely visible in darkness, 
worn and eroded by centuries. Iron cross at entrance. Wooden cemetery gate (ferrat, locked). 
Gnarled ancient trees at boundaries, bare branches reaching skyward. Church silhouette distant in fog.
Faint candlelight from single old lamp (ximbomba with tallow candle) casting weak orange glow and long shadows across tombs.

Artistic style: Medieval engraving, woodcut aesthetic with high chiaroscuro drama. 
Colors: pale gray stone, deep charcoal shadows, sèpia earth tones, weak orange candlelight highlights, white fog.
Lighting: Single faint tallow candle (very warm 2000K, low lux) creating dramatic long shadows of gravestones. 
Mist illuminated faintly from below. Names on stones almost illegible but shadows suggest carved text. 
Most of scene in deep darkness—only candle-touched areas dimly visible.

Atmosphere: Solemn, mysterious, historical authenticity. Sense of the past. Quiet introspection. Medieval funerary space.
No sense of horror or fantasy—pure historical documentation of sacred ground at night.

Mood: Investigative discovery of secrets. Silent witnesses of the past. Sorrow and mystery.

Negative: human figures, people, faces, modern elements, text legible, contemporary technology, 
bright colors, cartoon style, 3D rendering, photorealism, demons, angels, crosses glowing, dramatic weather.

Aspect ratio: 9:16 (portrait, vertical mobile)
```

---

## Paràmetres Midjourney

```
/imagine --ar 9:16 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Amb Master Style Nocturna Medieval:**
```
/imagine --ar 9:16 --sref [MASTER_STYLE_NOCTURNA_URL] --niji 6 [PROMPT]
```

---

## Renderització en Webapp

```
Viewport: 375×812 px
Card altura: ~400 px (scalable)
Image display: 375×667 px (full width, proporció 9:16)
Comportament: Static, no scroll, no zoom (ambient context)
CSS:
  <img src="/scenes/cementiri-nocturn.jpg" 
       className="w-full h-auto rounded-lg shadow-md" />
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 9:16 (verificat)
- [ ] Mòbil 375×667 px visible sense distorsió
- [ ] Imatge generada escalable (mínimo 1500px width)

**Visual i Atmosfera:**
- [ ] Làpides de pedra visibles (sèpia grisenc, erosionades)
- [ ] Boira rastrera tocant les làpides
- [ ] Ximbomba amb espelma (naranja molt feble)
- [ ] Porta de cementiri (ferro i fusta, tancada)
- [ ] Arbres nodes (silhuetats)
- [ ] Església silhuetada al fons

**Estil Medieval:**
- [ ] Gravat medieval visible (carving shadows en pedra)
- [ ] Paleta: gris pàl·lid, sèpia, negre profund, naranja molt tènue
- [ ] Sense tecnologia moderna
- [ ] Clarobscur autentic (llum mínima, ombres llargues)

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AA global (imatge és background d'ambient)
- [ ] Làpides destaquen contra negre (siluetes)

**Comportament Webapp:**
- [ ] No scroll necessari
- [ ] No zoom necessari (context ambiental)
- [ ] Carrega ràpida (<400KB)

---

## Status Producció

- [ ] **PER_DISSENYAR**
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] INSTAL·LAT WEBAPP (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- **Gravats medievals:** Goya (cemetery studies), Dürer (funerary art)
- **Atmosfera:**Ponderous, respectful treatment of sacred space
- **Aesthetic reference:** Historical documentation of medieval funerary traditions

### Context en Webapp
- **Pàgina:** Detall d'estació Cementiri
- **Text overlay:** Instructions del joc de recerca de noms
- **Durada:** Visible mentre jugador està resolent el joc

### Optimització d'Imatge
- **Generar:** 1875×3328 px (5× mòbil)
- **Redimensionar:** 375×667 px per web
- **Comprimir:** JPG 70% quality (~350 KB)
- **Cache:** Service Worker (offline available)

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Optimitzar → Upload webapp
