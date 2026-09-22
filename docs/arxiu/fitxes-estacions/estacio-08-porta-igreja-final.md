# Estació 8: Porta de l'Església — Engany, Tracte i Sometent (WEBAPP)

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Porta de l'Església |
| **Subtítol** | Engany, Tracte i Sometent |
| **Acte** | III - L'Alba |
| **Joc** | Rol de negociació + desxifra + decisió moral (webapp) |
| **Ordre** | Obligatori (fase final) |
| **Ubicació digital** | Webapp sola |
| **Dificultat** | 3/5 |
| **Temps previst** | 8–12 min |
| **Desbloqueig** | Segell A correcte i contrasenya "L'alba ve de Vic" (jog 7) |

---

## Mecànica del Joc

### Part 1: Lliurada de Carta (Rol via Webapp)

**Narració de la webapp:**

> "Arribes a la porta de l'Església. L'Emissari està allà, fanal en mà, esperant. Els seus ulls s'enfoquen en la carta."

**Interacció:**

Casella de text: **"Digues la contrasenya."**

- Input: el jugador escriu la resposta

**Validació:**
- Si correcte (**"L'alba ve de Vic"**):
  > "Està bé. Ja l'ha tocada massa gent."
  > 
  > L'Emissari s'aparta. De sobitons, oïs una veu a la fosca... és en Bernat.

- Si error:
  > "Aquest segell no és el seu. Torneu a provar-ho, si teniu temps."
  > 
  > **+2 minuts** de penalització. Pot intentar de nou.

---

### Part 2: Tracte (Decisió Moral)

**Àudio de Bernat (veu feble, estirada):**

> "Sé per on vénen els dragons. Us ho dic si em deixeu anar a buscar el meu fill. Vosaltres què hauríeu fet?"

**Compte enrere visual:** **60 segons** en pantalla (compte decrescent)

**Dos botons visibles:**

1. **Botó A — Acceptar**
   - Text: "Deixar-lo fugir"
   - Efecte: La webapp mostra el camí segur pels dragons (ruta alternativa)
   - Penalització: **Cap** (sens temps)
   
2. **Botó B — Rebutjar**
   - Text: "Lliurar-lo"
   - Efecte: El gir es tancar al campanar
   - Penalització: **+3 minuts** al temps final

**Si NO decideixen en 60 segons:**
- Compta automàticament com **B (Rebutjar)**
- Aplica penalització de +3 min

---

### Part 3: Sometent (Codi Final)

**Pantalla de desxifra:**

Imatge: Campana medieval amb 4 caselles de número.

**Rima (text visible):**

> "Del cim baixa l'avís,  
> a la font es fa la tinta,  
> al pla vetlla la ronda  
> i a la pedra dorm el nom."

**Pregunta:** "Quin és el codi per tocar el sometent?"

**Mecànica de desxifra:**

Els jugadors han d'associar cada vers amb una estació de l'Acte I:

| Vers | Estació | Xifra |
|------|---------|-------|
| "Del cim baixa l'avís" | Serrat de les Bruixes | **4** |
| "a la font es fa la tinta" | Font del Ferro | **2** |
| "al pla vetlla la ronda" | Planes Bones | **3** |
| "i a la pedra dorm el nom" | Cementiri | **1** |

**Resposta correcta:** **4-2-3-1**

**Validació:**
- Teclat numéric a la webapp per introduir els 4 dígits
- Si correcte → la campana sona (animació + àudio)
- Si error → **+1 minut** de penalització per intent

---

## Solucions i Variants

### Totes les Variants

| Paràmetre | Valor |
|-----------|-------|
| **Contrasenya Part 1** | "L'alba ve de Vic" (idèntic) |
| **Codi Part 3** | 4-2-3-1 (idèntic) |
| **Rima associació** | Serrat (4), Font (2), Pla (3), Cementiri (1) |

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Cada vers de la rima és una estació." |
| 2 | −2 | "El cim és el Serrat, la font és la Font del Ferro, el pla és Planes Bones, la pedra és el Cementiri." |
| 3 | −5 | Codi complet: 4-2-3-1. |

---

## Validació Webapp

✓ **Part 1:** Contrasenya correcta ("L'alba ve de Vic")  
✓ **Part 2:** Decisió binaria (Acceptar o Rebutjar)  
✓ **Part 3:** Codi correcte (4-2-3-1)

---

## Resultat: Someteent Tocat

**Si el codi és correcte:**

Àudio dramàtic: la campana sona sense parar.

**Narració de la webapp:**

> "No… Heu tocat a sometent."
> 
> "L'Emissari fuig en la fosca. Els conjurats de Sant Sebastià la senten i marxen pel camí segur."

**Pantalla de resultats:**
- **Epíleg** segons la decisió (A o B)
- **Percentatge** d'equips per cada decisió
- **Ranking** final

---

## Els Dos Epílegs

### Epíleg A — Acceptar el Tracte

**(Si els jugadors van triar: "Deixar-lo fugir")**

> "Els joves saben per on vénen els dragons, i els conjurats fugen pel camí segur de la ronda. Bernat desapareix en la fosca.
> 
> Mesos més tard, quan Vic canvia de mans, obren les presons. En Jaume surt. Espera a la porta i veu el seu pare. S'abraçen sense paraules.
> 
> Bernat no torna mai més a la Guixa. Però en Jaume viu."

**Puntuació:** Sense bonificació addicional (moralitat, no velocitat)

---

### Epíleg B — Rebutjar el Tracte i Lliurar-lo

**(Si els jugadors van triar: "Lliurar-lo")**

> "Els joves toquen a sometent sense saber per on vénen els dragons. Els conjurats se'n surten pels pèls.
> 
> Bernat queda lligat a un mas apartat fins que passa tot.
> 
> Mesos més tard, quan Vic canvia de mans, en Jaume surt de la presó. Busca el seu pare a l'escola i no el troba.
> 
> La campana sona bé. Però el preu va ser més alt."

**Puntuació:** +3 minuts de penalització (aplicat ja durant el jog)

---

## Temps Esgotat

**Si el compte enrere arriba a 0 (qualssevol fase):**

Pantalla de derrota:

> "Els dragons han arribat a Sant Sebastià. Els conjurats sonen a l'ordre de Felip V.
> 
> Aviat executaran els firmants. La carta ha arribat a temps."

L'equip ha perdut.

---

## Pistes en Context Narratiu

### Part 1: Contrasenya

La contrasenya **"L'alba ve de Vic"** apareix a la nota del capità dins la caixa. Els jugadors han de recordar-la i escriure-la textualment. És la clau per enganyar l'Emissari.

### Part 2: Tracte Moral

La pregunta de Bernat — **"Vosaltres què hauríeu fet?"** — és intencionadament oberta. No hi ha resposta «correcta» moralment. Els jugadors decideixen.

**Nota:** Cap decisió puntua millor que l'altra. La webapp mostra quin percentatge d'equips va triar cada opció al final. És un dèbat, no una competició.

### Part 3: Codi Final

Els jugadors ja coneixien el codi (4-2-3-1) de les estacions. Però la rima els obliga a recordar quin vers correspon a cada estació. És una última prova de memòria narrativa.

---

## Context Narratiu Complet

### Escena Física (si s'aplica)

Els jugadors arriben a la **porta de l'Església** (o una seu del joc) físicament. L'Emissari els espera (si es fa en viu) o apareix per veu/text.

### Flux de Convergència

1. Han acusat Bernat (jog 6)
2. Han obtingut la carta falsa i el segell (jog 7)
3. Han memoritzat la contrasenya "L'alba ve de Vic"
4. Ara entreguen la carta amb la contrasenya

L'Emissari examina el segell i la contrasenya. Si són correctes, accepta. Els dragones ja estan en camí, però l'Emissari no sap que la carta és falsa.

### Bernat: Últim Moment

Bernat apareix quan l'Emissari ja s'ha anat. No es defensa per la traïció. Només demana ajuda per salvar el seu fill. Els jugadors decideixen.

### La Campana

El **sometent** (campana de l'Església) és una senyal antiga que els pagesos usaven per alertar-se. Els conjurats de Sant Sebastià l'escolten a la nit i saben que la carta no ha arribat a Vic. Se'n van pel camí segur.

---

## Estructura de Dades (Backend)

```json
{
  "station_id": 8,
  "station_name": "Porta de l'Església",
  "game_type": "someteent-final",
  "variant": "A|B|C",
  "parts": {
    "1_contrasenya": "L'alba ve de Vic",
    "2_tracte_timeout": 60,
    "2_opcions": ["Acceptar", "Rebutjar"],
    "2_penalitat_reject": 180,
    "3_codi": "4-2-3-1"
  },
  "epilogues": {
    "A_accept": "...",
    "B_reject": "..."
  },
  "final_ranking": true
}
```

---

## Objectiu del Joc

El joc final és multi-capa:

1. **Rol:** Presentar-se com a enviats de Bernat davant l'Emissari
2. **Memòria:** Recordar la contrasenya
3. **Decisió:** Acceptar o rebutjar el tracte moral
4. **Desxifra:** Tocar el sometent amb el codi correcte

Tot això dins d'un cronòmetre final que simula l'alba que ve de Vic.

**Tema:** Els jugadors, que van investigar i deduir qui era el traïdor, ara han de decidir si el castigen o si el deixa escapar. No hi ha «fi bona» absoluta. Només dues formes de viure amb allò que varen fer.

