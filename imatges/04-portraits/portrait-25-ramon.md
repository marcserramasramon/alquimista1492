# portrait-25-ramon — Mossèn Ramon, Rector de la Guixa

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | portrait-25-ramon |
| **Categoria** | Portrait |
| **Acte** | I / II / III |
| **Estació** | Rectoria de la Guixa |
| **Rol en Gameplay** | Pista Visual / Caracterització |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 |
| **Dimensions** | 240×320 px (webapp card mòbil) |
| **Format** | JPG / PNG |
| **Comportament** | Static |
| **Ubicació Webapp** | Card perfil aliat / Quadern d'investigació |

---

## Descripció Narrativa

**Mossèn Ramon** és el rector de la Guixa des del 1690. Home gran, sever i valent, és la figura d'autoritat moral del poble. La nit del 16 de maig cau malalt de febre alta, però no és confusió: és una feina estratègica. Malgrat la malaltia, és el que realment pilota la partida des de l'ombra, preparant contingències amb una previsió gairebé monàstica.

La seva motivació és clara: que el Pacte dels Vigatans es signi i que ningú del poble pateixi represàlies per la traïció. Ell ja sospitava que hi hauria un delator, i per això va preparar una carta falsa com a contingència. La nit que el traïdor ho intenta tot, el rector és atacat al seu llit i colpejat pel Emissari, que busca la clau de la caixa de les almoines.

Físicament, és un home gran de faccions fermes i mirada penetrant. Barba blanca o gris, faccions marcades per dècades de devoció. Porta la vestimenta senzilla però digna d'un capellà de poble: sotana negra, cru blanc al coll, potser un rosari penjant.

**Rol en la trama:** Aliat. Encarrega la missió al principi. A partir del gir de l'Acte II, ell guia l'equip per la webapp amb veu feble però ferm. Només apareix per veu i text. La seva calma i previsió són la clau del triomf final.

---

## PROMPT PER GENERAR

```
Medieval engraving, 16th-17th century style. Portrait of Mossèn Ramon, a 60+ year-old Catholic rector from Catalonia, 1705.
Large, severe face with deep-lined wisdom. White or grey beard, piercing dark eyes full of moral authority and strategic resolve.
High-contrast black ink on aged parchment. Wears black cassock with white starched collar, perhaps a rosary visible.
Stone archway background suggesting a church interior. Medieval austerity, no luxury.

Style: Rembrandt-inspired etching, cross-hatching, strong chiaroscuro. Pure black ink on cream paper effect.
High contrast, no soft edges. Expression: severe, dignified, commanding but compassionate.
Medieval Catalan ecclesiastical authority. Zero anachronisms. 
Aspect ratio 3:4 (portrait vertical). 240×320 px final render.

Mood: A man who has seen suffering and chosen justice. Firm, wise, unbreakable despite illness and violence.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 3:4 --niji 6 --stylize 200 --quality 2
Medieval engraving, 16th-17th century style. Portrait of Mossèn Ramon, 60+ year-old Catholic rector, Catalonia 1705.
Large severe face, deep-lined wisdom, white/grey beard, piercing dark eyes, moral authority and strategic resolve.
High-contrast black ink on parchment. Black cassock, white starched collar, rosary visible.
Stone church archway background. Medieval austerity. Rembrandt-style etching, cross-hatching, strong chiaroscuro.
Severe, dignified, commanding yet compassionate. Pure black ink aesthetic.
```

### Flux Pro (alternativa)
```
flux --aspect 3:4 --steps 50
Medieval engraving, 16th-17th century style. Portrait of Mossèn Ramon, rector, 60+ years old, 1705 Catalonia...
[same prompt adapted]
```

---

## Renderització en Webapp

```jsx
// components/player/AlliedCard.tsx
<Image
  src="/imatges/04-portraits/portrait-25-ramon.jpg"
  alt="Mossèn Ramon, Rector"
  width={240}
  height={320}
  className="portrait-card"
/>
```

---

## Checklist Validació

- [ ] Aspecte ratio 3:4 exacte
- [ ] Dimensions 240×320 px sense distorsió
- [ ] Gravat medieval XVI-XVII autèntic
- [ ] Cabells i barba grisos/blancs, aspecte 60+
- [ ] Expressió severa, sabia, però compassiva
- [ ] Contrast alt, tinta negra sobre fons clar
- [ ] Cassock negra i coll blanc visibles
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

**Inspiració artística:** Grava barroca de rectors i bisbes del XVII. Inspirar-se en Rembrandt, Thomas Eakins, gravats de la Contrarreforma. Aspecte: dignitat immòbil, mirada que veu més que les altres persones.

**Context gameplay:** Els jugadors veuran aquest retrat quan Ramon parli per veu weak a la webapp. La seva aparença ha de comunicar que és l'autoritat moral real malgrat la malaltia. Sense pitança; pure wisdom.

**Variants:** Si es necessita versió més jove (50 anys) o més vella (75 anys), actualitzar aquí.

---

**Última revisió:** 2025-02-17  
**Status:** PER_DISSENYAR  
**Próxim:** Generar a Midjourney i validar contrast WCAG AA
