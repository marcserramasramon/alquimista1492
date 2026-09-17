# SCENE-09 — Patrulla Nocturna: Vigilància del Poble

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | scene-09-patrulla-nocturna |
| **Categoria** | Webapp Scene (Card/Modal Background) |
| **Acte** | I — La Investigació |
| **Estació** | Planes Bones |
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
| **Ubicació Webapp** | Card de stació (Planes Bones intro) |

---

## Descripció Narrativa

**Context Narratiu:**
Les Planes Bones són la zona de vigilància nocturna del poble. Cada nit, els joves fa la ronda verificant que no hi ha intrusos. La nit del 15 de maig, algun va esquivar la patrulla. Els jugadors investiguen els passos de la ronda i els itineraris, reconstruint qui estava on i qui va tenir ocasió per colar-se fins a l'escola. Les pistes estan en els testimonis dels vigilants.

**Visió de l'Escena:**
Escena nocturna medieval vista en plana elevada. Planes Bones és una clara seca en els boscos d'Osona. Boira espes nocturna que cau sobre els arbres de la vora. Torxes de fusta encesa en punts de vigilància estratègics. Figura d'un vigilant silhuetada lluny, quasi invisible entre la boira. Camins de terra ben pisats connectant punts de control. Senyals de roc empilar per marcar la ronda. Sense figures clares—només presència fantasmal de la vigilància.

**Detalls Visuals:**
- **Foreground:** Camí principal de la ronda, terra i herba trepitjada
- **Midground:** Punts de vigilància amb torxes (llum ambre difosa per boira)
- **Background:** Arbres silhuetats, boira espes, negror del bosc llunyà
- **Atmosfera:** Boira espessa, senzill del fum de torxes, tensió silenciosa de la guàrdia
- **Llum:** Torxes (or ambre), boira que dispersa la llum, ombres fantasmals

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan night watch scene, 1705. Mountain clearing (Planes Bones) used as village patrol route. 
Nighttime surveillance zone with thick mist rolling through pine forest.
Multiple torch-lit watch points positioned strategically across the plain—wooden torches burning with amber light, 
diffused through heavy fog creating ghostly halos. Well-worn earth path (patrol route) snaking through the clearing, 
marked with stacked rocks at checkpoints. A single figure of watchman barely visible as a silhouette in distant fog, 
suggesting constant but unseen vigilance.

Artistic style: Medieval engraving, woodcut-like aesthetic with strong atmospheric perspective. 
Colors: sepia and gray earth, amber firelight softened by fog, deep charcoal shadows, muted ochre highlights.
Lighting: Torchlight (amber 2000K) diffused by thick fog—creates soft glowing halos around each torch. 
Mist illuminated from within by torch glow. Silhouettes of trees and watch figure against lighter fog. 
Long atmospheric shadows cast downward into mist.

Atmosphere: Vigilant, tense, medieval authenticity. Silent night watch. Sense of hidden movement just beyond sight. 
Historical patrol documentation style—no fantasy, no modern elements.

Mood: Suspenseful observation. Hidden activity. Strategic surveillance.

Negative: human figures visible, clear faces, modern elements, text, contemporary technology, 
bright neon colors, cartoon style, 3D rendering, photorealism, dramatic storms, animals in foreground.

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
  <img src="/scenes/patrulla-nocturna.jpg" 
       className="w-full h-auto rounded-lg shadow-md" />
```

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 9:16 (verificat)
- [ ] Mòbil 375×667 px visible sense distorsió
- [ ] Imatge generada escalable (mínimo 1500px width)

**Visual i Atmosfera:**
- [ ] Torxes amb llum ambre visible (punts de vigilància)
- [ ] Boira espes difosa (capa ambiental principal)
- [ ] Camí de terra ben marcat (ronda de patrulla)
- [ ] Figura de vigilant silhuetada (vaga, fantasmal)
- [ ] Arbres silhuetats (bosc de la vora)

**Estil Medieval:**
- [ ] Gravat medieval visible (linies de boira, texture)
- [ ] Paleta: sèpia, gris, ambre difós, negre profund
- [ ] Sense tecnologia moderna
- [ ] Clarobscur i atmosfera autentics

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AA (imatge és background d'ambient)
- [ ] Torxes destaquen contra boira grisenca

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
- **Gravats medievals:** Bruegel (night scenes), Callot (military camps)
- **Atmosfera nocturna:** Rembrandt clarobscur amb fog
- **Aesthetic reference:** Historical vigilance, atmospheric mystery

### Context en Webapp
- **Pàgina:** Detall d'estació Planes Bones
- **Text overlay:** Instructions del joc de la patrulla
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
