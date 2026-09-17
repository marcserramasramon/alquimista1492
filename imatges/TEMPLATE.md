# [ID] — [Títol Imatge]

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | [ex: cartell-01, scene-07, document-17, icon-28] |
| **Categoria** | [Cartell / Scene / Document / Portrait / Icon / Map] |
| **Acte** | [I / II / III] |
| **Estació** | [Serrat Bruixes / Font Ferro / Planes Bones / Cementiri / Pla Masset / Rectoria / N/A] |
| **Rol en Gameplay** | [Pista Visual / Ambientació / Document Probatori / UI / Interactiu] |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | [2:3 / 9:16 / 3:4 / 1:1] |
| **Dimensions** | [Cartell: mm + dpi / Webapp: px] |
| **Format** | [JPG / PNG / SVG] |
| **Comportament** | [Static / Scroll / Tap-zoom / Interactive] |
| **Ubicació Webapp** | [Hero banner / Card / Modal / Navbar / Map] |

---

## Descripció Narrativa

[2–3 paràgrafs explicant context medieval, narratiu i visual de la imatge]

[Detalles específics: materials, atmosfera, pista clau si hi ha]

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
[PROMPT complet en anglès, 200–400 paraules]

Inclou:
- Escena medieval 1705
- Materials (pedra, fusta, ferro, terra)
- Llum i atmosfera (diurna/nocturna/clarobscur)
- Estil artístic (gravat/aquarel·la/fotografia document)
- Paleta colors (beige, or vell, marró, negre, etc.)
- Aspecte ratio explícit
- Exclusions (persones, text modern, 3D, etc.)
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar [2:3|9:16|3:4|1:1] --niji 6 --stylize 200 --quality 2 [PROMPT]
```

### Amb Master Style (Referència Visual)
```
/imagine --ar [AR] --sref [MASTER_STYLE_URL] --niji 6 [PROMPT]
```

### Flux Pro (alternativa)
```
flux --aspect [AR] --steps 50 [PROMPT]
```

### Stable Diffusion XL (alternativa)
```
--sampler euler --steps 30 --guidance_scale 7.5 --aspect [AR] [PROMPT]
```

---

## Renderització en Webapp

[Explicar com es mostra en Next.js/React]

```jsx
// Codi d'exemple
```

---

## Checklist Validació

- [ ] Aspecte ratio correcte
- [ ] Resolució adequada
- [ ] Text llegible (si hi ha)
- [ ] Contrast WCAG AA (on aplica)
- [ ] Medieval autentic (1705, Osona)
- [ ] Materials visibles
- [ ] Zero anacronismes
- [ ] Mida archivo optimitzada
- [ ] [Criteri específic de la imatge]

---

## Status Producció

- [ ] PER_DISSENYAR
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] INSTAL·LAT (data: _____)

---

## Notas Addicionals

[Inspiració artística, variants, context gameplay, consideracions especials]

---

**Última revisió:** [data]  
**Status:** [status]  
**Próxim:** [pas següent]
