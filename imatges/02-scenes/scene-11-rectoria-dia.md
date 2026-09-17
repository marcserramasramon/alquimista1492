# SCENE-11 — Rectoria de Dia: L'Escena del Crim

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | scene-11-rectoria-dia |
| **Categoria** | Webapp Scene (Card/Modal Background) |
| **Acte** | I — La Investigació |
| **Estació** | Rectoria de la Guixa |
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
| **Ubicació Webapp** | Card de stació (Rectoria intro) o Hero modal |

---

## Descripció Narrativa

**Context Narratiu:**
La Rectoria de la Guixa és on viu el mossèn Ramon, i on es guarda la caixa de les almoines amb la carta deladora. La matinada del 16 de maig, l'Emissari va entrar per robar la carta però el rector es va despertar. Va tenir lloc una lluita silenciosa: el rector va ser ferit i va llençar la clau al porxo. Els jugadors investiguen la rectoria de dia, buscant rastres de la lluita i pistes sobre qui va atacar el rector.

**Visió de l'Escena:**
Escena de dia medieval a la Rectoria de la Guixa. Casa de pedra dels segles XVI-XVII, amb façana sober i finestres gòtiques petites. Porta d'entrada de fusta fosc amb pany de ferro. Porxo amb banca de pedra. Senyal de la lluita: taula tombada dins la sala, vidres trencats (visible per la finestra), claus espargides. Finestres amb gelosia de fusta. Campanari de l'église visible al fons. Llum de dia forta però fria (tardor medieval). Senyals de sang seca a la porta (molt discreta, històrica).

**Detalls Visuals:**
- **Foreground:** Porxo, banca de pedra, porta de fusta fosc
- **Midground:** Façana de la rectoria (pedra gris-ocre), finestres amb gelosia
- **Background:** Campanari, altres cases del poble, arbres (absence de full—tardor)
- **Atmosfera:** Dia clar però fred, silenci pesat, sensació de recent atropellament
- **Llum:** Llum solar rasant (matinada), ombres agudes de geolosia a la façana, contrasts forts

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan rectory building, 1705. Stone church residence (Rectoria de la Guixa) in a small Osona village. 
Daytime scene, clear morning light, early autumn aesthetic.
Austere stone façade (16th-17th century), gray-ochre weathered stone blocks, small Gothic windows with wooden jalousies. 
Dark wooden door with iron lock, slightly ajar showing recent disturbance. 
Covered porch (porxo) with stone bench. Signs of recent struggle inside—glimpsed through window: 
overturned table visible, scattered objects, broken glass, keys scattered on floor. Small streak of dried blood on door frame (very subtle, historical).
Church bell tower visible in distant background. Surrounding medieval houses and bare autumn trees.
Wooden gelosia shutters casting sharp shadows across the façade.

Artistic style: Medieval engraving, woodcut aesthetic, realistic historical documentation. 
Colors: gray-ochre stone, dark brown wood, rust-colored iron, sepia-brown details, autumn bareness. 
Lighting: Raking morning sunlight creating strong geometric shadows from jalousies. 
Clear but cold daylight (autumn, 6-7 AM). Sharp contrast between lit and shadowed areas. 
No bright colors—muted, historical medieval palette only.

Atmosphere: Solemn aftermath, crime scene investigation aesthetic, medieval authenticity. Quiet resolution. 
Evidence of recent violence but no bodies, no dramatic elements—pure historical documentation.

Mood: Discovery of betrayal. Investigation of hidden events. Tension and consequence.

Negative: human figures, people, faces, modern elements, text, contemporary technology, bright neon colors, 
cartoon style, 3D rendering, photorealism, dramatic weather, crosses glowing, fantasy elements.

Aspect ratio: 9:16 (portrait, vertical mobile)
```

---

## Paràmetres Midjourney

```
/imagine --ar 9:16 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Amb Master Style Diurna Medieval:**
```
/imagine --ar 9:16 --sref [MASTER_STYLE_DIURNA_URL] --niji 6 [PROMPT]
```

---

## Renderització en Webapp

```
Viewport: 375×812 px
Card altura: ~400 px (scalable)
Image display: 375×667 px (full width, proporció 9:16)
Comportament: Static, no scroll, no zoom (crime scene context)
CSS:
  <img src="/scenes/rectoria-dia.jpg" 
       className="w-full h-auto rounded-lg shadow-md" />
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 9:16 (verificat)
- [ ] Mòbil 375×667 px visible sense distorsió
- [ ] Imatge generada escalable (mínimo 1500px width)

**Visual i Atmosfera:**
- [ ] Façana de rectoria de pedra (gris-ocre, medieval)
- [ ] Porta de fusta fosc (lleugerament oberta)
- [ ] Porxo amb banca de pedra visible
- [ ] Finestres amb gelosia (ombres agudes)
- [ ] Campanari visible al fons
- [ ] Senyal de lluita dins (taula tombada visible per finestra)

**Estil Medieval:**
- [ ] Gravat medieval visible (linies de gelosia, texture de pedra)
- [ ] Paleta: gris, ocre, marró fosc, sepia
- [ ] Sense tecnologia moderna
- [ ] Llum diurna autentica (matinada, tardor)

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AA (daytime scene amb ombres)
- [ ] Façana destaca clarament contra fons

**Comportament Webapp:**
- [ ] No scroll necessari
- [ ] No zoom necessari (context de crime scene)
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
- **Gravats medievals:** Dürer (architecture), Callot (crime scenes)
- **Referència:**Ponderous documentation of historical sites, Catalan rural architecture
- **Aesthetic reference:** Criminal investigation, aftermath, solemn historical record

### Context en Webapp
- **Pàgina:** Context d'Acte I, revelació de l'atac al rector
- **Text overlay:** Narració de mossèn Ramon explicant l'atac
- **Durada:** Visible durant l'escena de revelació del gir de trama

### Optimització d'Imatge
- **Generar:** 1875×3328 px (5× mòbil)
- **Redimensionar:** 375×667 px per web
- **Comprimir:** JPG 70% quality (~350 KB)
- **Cache:** Service Worker (offline available)

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Optimitzar → Upload webapp
