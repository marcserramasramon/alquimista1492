# SCENE-08 — Font de l'Aigua: Recerca Nocturna

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | scene-08-font-aigua |
| **Categoria** | Webapp Scene (Card/Modal Background) |
| **Acte** | I — La Investigació |
| **Estació** | Font del Ferro |
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
| **Ubicació Webapp** | Card de stació (Font del Ferro intro) |

---

## Descripció Narrativa

**Context Narratiu:**
La Font del Ferro és on es recull aigua per preparar la tinta de la carta deladora. Durant la nit del 15 de maig, algú va anar fins al font en secret. Els jugadors investiguen la zona per descobrir qui hi va anar i quins utensilis va dur. La font de pedra, l'aigua negra i els rastres del camí són pistes silencioses.

**Visió de l'Escena:**
Escena nocturna medieval vista en clarobscur. Font de pedra seca o semi-seca, amb un brocal de cambres gastades. Arbustos mediterranis silhuetats. Camí de terra compacta que mena fins al font. Atmosfera d'ocupació furtiva: falconderes, xots de ferradura antic, pals reclinats. Cap figure humana visible, però rastres de presència. Boira nocturna baixa de la muntanya. Llum d'una lluna en quart creixent, amb ombres allargades.

**Detalls Visuals:**
- **Foreground:** Camí de terra i boira rastrera
- **Midground:** Font de pedra (oclre, gris pàl·lid) amb brocal desgastat
- **Background:** Arbustos, paret de pedra antiga, arbres nudosos silhuetats
- **Atmosfera:** Boira nocturna, olor imaginat de terra humida i ferrúgena
- **Llum:** Lluna quart creixent (argent feble), ombres profundes, clarobscur dramàtic

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan spring night scene, 1705. Stone water spring (Font del Ferro) in the foothills of Osona. 
Nighttime atmosphere with low-lying mist rolling down from mountains. 
Ancient stone fountain with weathered basin and worn rim, surrounded by scrubland—gorse, low Mediterranean shrubs, bare rocks. 
Dirt path leading to the spring, showing subtle signs of recent passage: footprints, scattered small stones, rusted metal fragments suggesting old ironwork.

Artistic style: Medieval engraving, woodcut-like aesthetic with strong chiaroscuro contrast. 
Colors: sepia earth tones, pale gray stone, deep shadows, argent moonlight highlights.
Lighting: Quarter waning moon (pale silver), long dramatic shadows cast across the ground, mist illuminated from below. 
Foreground mist catches weak silver light. No bright colors—earthy, historical palette only.
Light quality: Moonlight only, no other sources. Temperature: cool silver (4000–5000K).

Atmosphere: Solitude, clandestine investigation, medieval authenticity. Quiet and still. Sense of secret passage and hidden activity.
No sense of fantasy or danger—pure historical documentation aesthetic.

Mood: Investigative discovery. Silent observation. Searching for traces.

Negative: human figures, people, faces, silhouettes of people, modern elements, text, contemporary technology, 
bright colors, cartoon style, 3D rendering, photorealism, animals, dramatic weather effects.

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
  <img src="/scenes/font-aigua.jpg" 
       className="w-full h-auto rounded-lg shadow-md" />
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 9:16 (verificat)
- [ ] Mòbil 375×667 px visible sense distorsió
- [ ] Imatge generada escalable (mínimo 1500px width)

**Visual i Atmosfera:**
- [ ] Font de pedra visible al centre (gris pàl·lid)
- [ ] Boira nocturna subtil (capa bàs)
- [ ] Lluna quart creixent visible (argent feble)
- [ ] Camí de terra amb rastres (no obvios, suggestius)
- [ ] Arbustos mediterranis silhuetats

**Estil Medieval:**
- [ ] Gravat medieval visible (linies de texture)
- [ ] Paleta: grises, sèpia, argent, marró natural
- [ ] Sense tecnologia moderna
- [ ] Clarobscur autentic (no 3D render)

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AA (imatge és background d'ambient)
- [ ] Font de pedra destaca contra fons

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
- **Gravats medievals:** Dürer (rural landscapes), Bruegel (peasant scenes)
- **Fonts històriques:** Cordoba aqueducts, Catalan rural imagery
- **Aesthetic reference:** Atmospheric mystery with historical authenticity

### Context en Webapp
- **Pàgina:** Detall d'estació Font del Ferro
- **Text overlay:** Instructions del joc de l'estació
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
