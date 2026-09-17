# portrait-27-anton — Anton l'Escolà

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | portrait-27-anton |
| **Categoria** | Portrait |
| **Acte** | I / II / III |
| **Estació** | Rectoria de la Guixa |
| **Rol en Gameplay** | Sospitós / Innocent / Pista Visual |

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

**Anton l'Escolà** va néixer a Manlleu el 1688 i va arribar a la Guixa el 1701 per servir com a secretari i savi del rector mossèn Ramon. Amb només 18 anys durant la nit del joc, és un jove des d'una altra part de la comarca que ha establert una vida tranquila al costat de l'església. Sap de lletra—habilitat rara—i té accés a la clau del registre de difunts on es copien els noms per a donatius i declaracions.

Inicalment, sembla sospitós: té accés a les plomes, sap d'escriptura, esmorla a la rectoria. Però la veritat és més noble. Anton va passar la nit del 15 vetllant el rector que tenia febre alta. Quan arriba la noticia de l'atac al mestre d'escola, és el primer a arribar amb la declaració signada pel rector, protegia-lo del sospita que cau sobre ell.

Físicament, és jove, amb faccions juvenils però ja marcades per la senyera de qui treballa a l'església. Cabells castanis o negres, mirada oberta però vigilant. Porta la roba senzilla d'un escolà: túnica de tela fosca, cru simple, possiblement marques de tinta a les mans per la feina de mantenir els registres.

**Rol en la trama:** L'esquer. Sospitós principal fins al gir de l'Acte II, quan la seva coartada és verificada. Representa la innocència i la leialtat, però també la vulnerabilitat de qui serveix l'ordre sense entendre el caos que el rodeja.

---

## PROMPT PER GENERAR

```
Medieval engraving, 16th-17th century style. Portrait of Anton, a 18-year-old church sexton from Manlleu, Catalonia 1705.
Young face, open dark eyes showing both innocence and alertness. Light chestnut or dark brown hair, smooth features.
High-contrast black ink on aged parchment. Wears dark sexton's tunic with simple white collar or neck cloth.
Possible ink stains on hands or fingers suggesting work with documents and records. Stone archway church interior background.

Style: Rembrandt-inspired etching, cross-hatching, warm chiaroscuro. Pure black ink on cream paper.
High contrast, soft edges on youth features. Expression: Alert, devoted, slightly worried. Not hardened by age.
Medieval Catalan church servant. Zero anachronisms. Youthful dignity without arrogance.
Aspect ratio 3:4 (portrait vertical). 240×320 px final render.

Mood: A faithful young servant caught in old men's games. Protective and earnest but fragile.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 3:4 --niji 6 --stylize 200 --quality 2
Medieval engraving, 16th-17th century style. Portrait of Anton, 18-year-old church sexton, Manlleu/Catalonia 1705.
Young face, open dark eyes showing innocence and alertness. Light brown or dark hair, smooth features.
High-contrast black ink on parchment. Dark sexton's tunic, simple white collar or neck cloth.
Possible ink stains on hands/fingers. Stone church archway background. Rembrandt-style etching, cross-hatching.
Alert, devoted, slightly worried expression. Medieval Catalan church servant. Pure black ink aesthetic.
```

### Flux Pro (alternativa)
```
flux --aspect 3:4 --steps 50
Medieval engraving, 16th-17th century style. Portrait of Anton, church sexton, 18 years old, 1705 Catalonia...
[same prompt adapted]
```

---

## Renderització en Webapp

```jsx
// components/player/SuspectCard.tsx
<Image
  src="/imatges/04-portraits/portrait-27-anton.jpg"
  alt="Anton l'Escolà"
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
- [ ] Cabells castanys/negres, aspecte 18 anys (jove)
- [ ] Expressió alerta, devota, una mica preocupada
- [ ] Contrast alt, tinta negra sobre fons clar
- [ ] Túnica d'escolà fosca i coll simple visible
- [ ] Possibles taques d'encre a mans/dits (si aplica)
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

**Inspiració artística:** Gravats de joves escrives i escolans de convents del XVII. Rembrandt, retrats de clergats menors. Aspecte: jovialitat intact però amb responsabilitat greu. Innocència defensant una causa que es cau a trossos.

**Context gameplay:** Els jugadors veuran aquest retrat inicialment com a sospitós principal (per accés a plomes, tinta, registres). A partir del gir de l'Acte II, la seva coartada és confirmada i els jugadors comprenen que van estar perseguint la persona equivocada. La seva aparença jove ha de fer-los sentir culpa en retrospectiva.

**Variants:** Si es necessita versió més vella (22 anys) o més jove (15 anys), actualitzar aquí.

---

**Última revisió:** 2025-02-17  
**Status:** PER_DISSENYAR  
**Próxim:** Generar a Midjourney i validar contrast WCAG AA
