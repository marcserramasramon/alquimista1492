# portrait-24-bernat — Bernat Mestre d'Escola

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | portrait-24-bernat |
| **Categoria** | Portrait |
| **Acte** | I / II / III |
| **Estació** | Escola de la Guixa |
| **Rol en Gameplay** | Pista Visual / Caracterització |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 |
| **Dimensions** | 240×320 px (webapp card mòbil) |
| **Format** | JPG / PNG |
| **Comportament** | Static |
| **Ubicació Webapp** | Card perfil sospitós / Quadern d'investigació |

---

## Descripció Narrativa

**Bernat Mestre d'Escola** (1664–?) és un home educat arribat a la Guixa el 1703 des d'indrets desconeguts. Vidu, amb un fill anomenat Jaume pres a la guarnició de Vic, aparenta ser un home respectat i discret que ensenya lletres i números als infants del poble. La seva educació i el seu to paternal generen confiança.

Però sota aquesta aparença de dignitat es congria un home desesperat. Els dragofoners de Vic li han fet una proposició: els noms dels conjurats que pensen signar el Pacte dels Vigatans a canvi de l'alliberament del seu fill. La nit del 15 de maig va anar a Vic a tancar el tracte. Va tornar aquell vespre i, amagat a l'escola, va escriure la carta de traïció amb una ploma que no hauria de tenir.

Físicament, mostra els seus 41 anys amb seny gris beguda, faccions dures i una mirada que alterna entre la calidesa pedagogia i la desemparada desesperació. Porta la roba d'un home de lletres: túnica de tela fosca, símbol del seu estatus.

**Rol en la trama:** Mentressor. El mestre condueix l'equip per la webapp durant l'Acte I, repartint pistes falses i dirigint les sospites cap a Anton. Només apareix per veu i text. Al final, quan és descobert, es presenta sense defensa moral, només demanant al jugadors que deixini fugir perquè busqui el seu fill.

---

## PROMPT PER GENERAR

```
Medieval engraving, 16th-17th century style. Portrait of Bernat, a 41-year-old school master from Catalonia, 1705. 
Grey-brown receding hairline, severe angular face with deep-set dark eyes expressing both paternal warmth and hidden desperation. 
High-contrast black ink on aged parchment aesthetic. Wears dark scholar's tunic with a subtle cross pattern. 
Collar plain, linen worn. Background is a blurred medieval stone archway suggesting a schoolroom.

Style: Rembrandt-inspired etching technique, cross-hatching, strong chiaroscuro. 
High contrast, no soft edges. Expressionless dignity masking internal torment. 
Medieval Catalan dignity. No anachronisms. No color, pure black ink on cream paper effect. 
Aspect ratio 3:4 (portrait vertical). Dimensions 240×320 px final render.

Mood: Grave, authoritative yet broken. A man of education brought low by love and desperation.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 3:4 --niji 6 --stylize 200 --quality 2 
Medieval engraving, 16th-17th century style. Portrait of Bernat, 41-year-old school master from Catalonia 1705. 
Grey-brown receding hair, severe angular face, deep-set eyes showing paternal warmth and hidden desperation. 
High-contrast black ink on parchment. Dark scholar's tunic, plain linen collar. Stone archway background. 
Rembrandt-style etching, cross-hatching, strong chiaroscuro. Medieval Catalan dignity. 
Pure black ink aesthetic. Grave, authoritative, broken expression.
```

### Flux Pro (alternativa)
```
flux --aspect 3:4 --steps 50
Medieval engraving, 16th-17th century style. Portrait of Bernat, school master, 41 years old, 1705 Catalonia...
[same prompt adapted]
```

---

## Renderització en Webapp

```jsx
// components/player/SuspectCard.tsx
<Image
  src="/imatges/04-portraits/portrait-24-bernat.jpg"
  alt="Bernat Mestre d'Escola"
  width={240}
  height={320}
  className="portrait-card"
/>
```

---

## Checklist Validació

- [ ] Aspecte ratio 3:4 exacte
- [ ] Dimensions 240×320 px sense distorsió
- [ ] Gravat medieval XVI-XVII autèntic (no modern)
- [ ] Cabell ros-castany-gris autèntic d'edat 41
- [ ] Expressió severa però amb fermesa educada
- [ ] Contrast alt, tinta negra sobre fons clar
- [ ] Sense anachronismes moderns
- [ ] Text llegible a mida de card mòbil (contrast WCAG AA)
- [ ] Mida d'arxiu optimitzada (<100 KB JPG)
- [ ] Aparença coherent amb arquitectura medieval 1705

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

**Inspiració artística:** Grava del XVII de Rembrandt, retrats de mestres d'escola de l'era baroque. Recerca visual: dignitaris educats de la Contrarreforma hispànica. Evitar aspecte teatral; mantenir austeritat monàstica.

**Context gameplay:** Els jugadors veuran aquest retrat al quadern d'investigació, a la card de sospitosos. La seva expressió ha de comunicar autoritat i respectabilitat, perquè els primer enganyi. Però, en retrospectiva (després del gir de l'Acte II), els jugadors reconeixeran la desesperació amagada.

**Variants:** Si es necessita una versió altada (45 anys, més gris) o una més bé jove (35 anys, menys marcada), actualitzar-la aquí.

---

**Última revisió:** 2025-02-17  
**Status:** PER_DISSENYAR  
**Próxim:** Generar a Midjourney i validar contrast WCAG AA
