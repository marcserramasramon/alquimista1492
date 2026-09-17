# portrait-26-emissari — L'Emissari, Agent del Capità

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | portrait-26-emissari |
| **Categoria** | Portrait |
| **Acte** | II / III |
| **Estació** | Pla de Masset / Porta del Campanar |
| **Rol en Gameplay** | Antagonista / Caracterització |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 |
| **Dimensions** | 240×320 px (webapp card mòbil) |
| **Format** | JPG / PNG |
| **Comportament** | Static |
| **Ubicació Webapp** | Card perfil antagonista / Quadern d'investigació |

---

## Descripció Narrativa

**L'Emissari** és un home de confiança del capità de la guarnició de Vic. No porta nom propi—només el seu títol i la seva funció defineixen qui és. Home de mitjana edat, amb trets durs marcats per anys al servei militar. Parla poc, en castellà o en català de botifler, però cada paraula és una ordre disfressada.

La nit del 16 al 17 de maig, ha de recollir la carta de traïció a l'alba. Fa guàrdia al Pla de Masset contra la Rectoria, un punt de control entre dos mons. Quan el rector intenta protegir la clau de la caixa de les almoines, l'Emissari el colpeja brutalment a la foscor, cercant l'evidence d'una conspiració.

Físicament, és l'home del poder institucional. Porta una capa fosca o una casaca de soldat, barret de tres puntes, arma al costat. La seva mirada és fria, sense emoció, l'expressió d'un home que compleix ordres sense qüestionaments. Els seus ulls són el primer que veus quan arriba.

**Rol en la trama:** Antagonista. Apareix en tres moments: control d'entrada al Pla de Masset, buscant la clau amb fanal a la foscor, i finalment a la porta del campanar per recollir la carta. Els jugadors han de decidir si accepten el seu joc o el rebutgen.

---

## PROMPT PER GENERAR

```
Medieval engraving, 16th-17th century Iberian military style. Portrait of L'Emissari, a cold, 40-50 year-old military agent.
Narrow face, high cheekbones, dark piercing eyes showing zero emotion. Severe mouth, jaw tight. Expression: predatory calm.
High-contrast black ink on aged parchment. Wears dark soldier's casaca or cape, three-cornered hat barely visible at edge.
Neck shows military collar. Background is shadowed, suggesting stone fortification. Medieval Spanish/Catalan military hierarchy.

Style: Goya-inspired etching technique, cross-hatching, dramatic shadows, strong chiaroscuro.
Pure black ink on cream paper, high contrast, sharp edges. No soft light. Cold authority.
Medieval Iberian military aesthetic, zero fantasy elements. No color, pure engraving.
Aspect ratio 3:4 (portrait vertical). 240×320 px final render.

Mood: A man who has done violence and will do more. Ice water where blood should be. Institutional cruelty embodied.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 3:4 --niji 6 --stylize 200 --quality 2
Medieval engraving, 16th-17th century Iberian military. Portrait of L'Emissari, 40-50 year-old military agent.
Narrow face, high cheekbones, dark piercing eyes, zero emotion. Severe mouth, tight jaw. Predatory calm expression.
High-contrast black ink. Dark soldier's casaca, three-cornered hat edge. Military collar visible.
Shadowed fortification background. Goya-inspired etching, cross-hatching, dramatic shadows, strong chiaroscuro.
Medieval Spanish/Catalan military hierarchy. Pure black ink aesthetic. Ice water where blood should be.
```

### Flux Pro (alternativa)
```
flux --aspect 3:4 --steps 50
Medieval engraving, military style, 16th-17th century Iberia. Portrait of L'Emissari, military agent, 40-50 years old...
[same prompt adapted]
```

---

## Renderització en Webapp

```jsx
// components/player/AntagonistCard.tsx
<Image
  src="/imatges/04-portraits/portrait-26-emissari.jpg"
  alt="L'Emissari, Agent del Capità"
  width={240}
  height={320}
  className="portrait-card antagonist"
/>
```

---

## Checklist Validació

- [ ] Aspecte ratio 3:4 exacte
- [ ] Dimensions 240×320 px sense distorsió
- [ ] Gravat medieval XVI-XVII autèntic
- [ ] Cabells negres o negre-gris, aspecte 40-50
- [ ] Expressió fria, sense emoció, predatòria
- [ ] Contrast alt, tinta negra sobre fons clar
- [ ] Casaca militar o capa fosca visible
- [ ] Barret de tres puntes o suggerit a la vora
- [ ] Sense anachronismes moderns
- [ ] Text llegible a card mòbil
- [ ] Mida d'arxiu optimitzada (<100 KB JPG)

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

**Inspiració artística:** Gravats militars espanyols del XVII, Goya, oficials de la Guarnició de Vic. Mirada: la dels homes que han executat ordres sense preguntar. Sense compassió visible; només deure i frisor.

**Context gameplay:** Els jugadors veuran aquest retrat quan descobreixen al Pla de Masset que hi ha algú controlant l'espai. La seva aparença gelada ha de provocar desconfiança immediata. No és un adversari jove o impulsiu: és l'arquitectura del sistema de poder.

**Variants:** Si es necessita versió més jove (35 anys) o més vella (55 anys), actualitzar aquí.

---

**Última revisió:** 2025-02-17  
**Status:** PER_DISSENYAR  
**Próxim:** Generar a Midjourney i validar contrast WCAG AA
