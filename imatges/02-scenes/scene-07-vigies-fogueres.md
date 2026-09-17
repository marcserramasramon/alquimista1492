# SCENE-07 — Vigies a la Nit: Fogueres de la Plana

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | scene-07-vigies-fogueres |
| **Categoria** | Webapp Scene (Hero Background) |
| **Acte** | I — La Investigació |
| **Estació** | Serrat de les Bruixes |
| **Rol en Gameplay** | Ambientació Narrativa + Context Atmosfèric |

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
| **Ubicació Webapp** | Hero banner capdamunt pantalla (Acte I intro) |

---

## Descripció Narrativa

**Context Narratiu:**
Els vigies dels turons de vigilància parlen de nit amb fogueres quan no es pot enviar missatges en persona. La nit del 15 de maig de 1705, els vigies van transmetre un missatge que ningú del poble podia llegir. Els jugadors han d'investigar per descobrir què deien.

**Visió de l'Escena:**
Escena nocturna medieval vista des del Serrat. Turons silhuetats contra cel estrellat. Fogueres parpellejant en dos turons propers (símbols de comunicació). Figures humanes vagues (silhuetes) observant des del primer pla. Atmosfera sinistre però medieval autentic. Sense figures clares (privacitat, misteri).

**Detalles Visuals:**
- **Foreground:** Turó primary (primer pla, oscur gris-marró)
- **Midground:** Dos turons secundaris amb fogueres (or ambre, parpelles)
- **Background:** Cel nocturn (negre carbó) amb estels si clar
- **Atmosfera:** Boira lleugera nocturna, partícules de fum visible en claror de foguera
- **Llum:** Clarobscur dramàtic (negre + or ambre, contrast extrem)

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan night vigil scene, 1705. Mountain pass (Serrat de les Bruixes). 
Nighttime atmosphere with silhouetted hilltops against a starry sky. 
Two distant bonfires flickering on secondary hills, emitting orange-amber glow and smoke visible in firelight. 
Silhouetted landscape features and terrain on foreground hilltop—rocky outcrops, turons, ridgelines—creating layered atmospheric depth. 

Artistic style: Medieval engraving, woodcut-like aesthetic with strong chiaroscuro contrast. 
Colors: black shadows, amber fire glow, sepia tones, no bright colors.
Lighting: Dramatic clarobscur (darkest blacks vs warm amber highlights). 
Foreground hilltop in grayscale-sepia. Distant fires casting long, dramatic shadows and smoke particles visible.
Light quality: Candlelight and bonfire only, no other sources. Temperature: warm amber (1500–2000K).

Atmosphere: Mysterious, sinister yet historical. Medieval authenticity. Distant, vast landscape. 
No sense of danger or fantasy—pure historical documentation aesthetic.

Mood: Investigative intrigue. Silent observation. Waiting for a message that never comes clearly.

Negative: human figures, people, silhouettes of people, modern elements, text, contemporary technology, 
bright neon colors, cartoon style, 3D rendering, photorealism, animals, dramatic weather (storms, rain).
```

---

## Paràmetres Midjourney

```
/imagine --ar 9:16 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Amb Master Style Nocturna:**
```
/imagine --ar 9:16 --sref [MASTER_STYLE_NOCTURNA_URL] --niji 6 [PROMPT]
```

---

## Renderització en Webapp

```
Viewport: 375×812 px
Hero banner altura: ~667 px (812 - 145 header/footer)
Image display: 375×667 px (full width, proporció 9:16)
Comportament: Static, no scroll, no zoom
CSS:
  <img src="/scenes/vigies-fogueres.jpg" 
       className="w-full h-auto max-h-[667px]" />
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 9:16 (verificat amb divisor 3328÷375)
- [ ] Mòbil 375×667 px visible sense distorsió
- [ ] Imatge generada escalable sense pixelació (mínimo 1500px width)

**Visual i Atmosfera:**
- [ ] Turons silhuetats (negre carbó dominant)
- [ ] Fogueres visible en dos punts (or ambre clar)
- [ ] Boira nocturna subtil (partícules de fum)
- [ ] Figures vagues (silhuetes, cap rostre visible)
- [ ] Cel estrellat (negre profund amb puntets estels)

**Estil Medieval:**
- [ ] Gravat medieval visible (linies, texture)
- [ ] Paleta: or ambre + negre carbó + sepia marró
- [ ] Sense tecnologia moderna (sense moon/stars que semblen digitals)
- [ ] Clarobscur autentic (no 3D render)

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AA global (imatge és background, no text overlay aquí)
- [ ] Fogueres or destaquen clarament contra negre

**Comportament Webapp:**
- [ ] No scroll necessari (image fits 375×667)
- [ ] No zoom necessari (context purament ambiental)
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
- **Gravats nocturn:** Rembrandt (clarobscur), Goya (Black Paintings)
- **Medieval sources:** Dürer engravings, Lucas Cranach landscape
- **Aesthetic reference:** Atmospheric mystery, not Gothic horror

### Variants
Aquesta és l'única versió (no variants A/B/C).

### Context en Webapp
- **Pàgina:** Introducció Acte I (hub principal, capdamunt)
- **Text overlay:** Text narratiu (el mestre d'escola, Bernat, parla)
- **Durada:** Sempre visible mentre jugador està explorant mapa

### Optimització d'Imatge
- **Generar:** 1875×3328 px (5× mòbil per a sharp rendering)
- **Redimensionar:** 375×667 px per web
- **Comprimir:** JPG 70% quality (~350 KB)
- **Cache:** Service Worker (offline available)

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Optimitzar → Upload webapp
