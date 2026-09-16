# Jocs de les Estacions — El Traïdor de la Guixa

## Estructura

**Acte I (4 estacions físiques, ordre lliure):** Desxifra i descarta sospitosos. Obtenen 4 xifres: 4-2-3-1.

**Acte II (Pla del Masset):**
- Jog 5 (física): Control de l'Emissari
- Jog 6 (webapp): Acusació de Bernat

**Acte II/III (webapp):**
- Jog 7: Caixa de les Almoines
- Jogs 8+9 fusionats: Lliurar carta falsa + Tracte moral + Sometent

---

## 1. Serrat de les Bruixes — El Codi de Fogueres

**Joc:** Desxifrar un codi de parells (quadrat de Polibi)  
**Dificultat:** 2/5  
**Temps previst:** 8 min + desplaçament  
**Descarta:** Pere del Molí i Joan  
**Xifra:** 4  

### Què veu el jugador a la pantalla

Seqüència d'il·lustracions de fogueres (grups a l'esquerra i a la dreta) vistes la nit del 15 des del Serrat.  
Casella de text: "Què diuen les fogueres?"

### Què hi ha al cartell físic

**SENYALS DE FOC DE LA PLANA**

> Així parlen els serrats de nit quan no es pot enviar ningú.
> Fogueres a l'esquerra: la fila. Fogueres a la dreta: la columna.

Taula 5×5:

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1 | A | B | C | D | E |
| 2 | F | G | H | I | J |
| 3 | L | M | N | O | P |
| 4 | Q | R | S | T | U |
| 5 | V | X | Z | Ç | · |

(El punt "·" representa un espai.)

### Mecànica

1. Els vigies dels turons es passen avisos amb fogueres.
2. Un informador de dins de Vic ha avisat que la carta del delator és de mà pròpia: el delator sap de lletra.
3. Desxifrar el codi de parells per obtenir el missatge.

**Ambientació opcional:**
- Sons ambients suaus a la webapp: vent, crida de corb. Volum baix, no distreu.

### Solució (Variant A)

**Seqüència:** 4-3 · 1-1 · 3-5 / 3-1 · 3-1 · 1-5 · 4-4 · 4-2 · 1-1 + 4 fogueres al turó esquerre

**Missatge:** SAP DE LLETRA

**Conclusió:** Pere del Molí i Joan signen amb una creu → descartats.  
**Xifra FOC:** 4

### Solucions altres variants

| Variant | Missatge | Seqüència | Xifra |
|---------|----------|-----------|-------|
| B | ESCRIU | 1-5 · 4-3 · 1-3 · 4-2 · 2-4 · 4-5 | **4** |
| C | LLEGEIX | 3-1 · 3-1 · 1-5 · 2-2 · 1-5 · 2-4 · 5-2 | **4** |

### Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Cada missatge són parells de fogueres." |
| 2 | −2 | "El primer parell és una sola lletra: fila i columna." |
| 3 | −5 | Solució. |

### Validació webapp

- Escriure el missatge correcte
- Marcar els dos sospitosos descartats

---

## 2. Font del Ferro — Tinta i Torns d'Aigua

**Joc:** Creuar dades amb un càlcul de temps  
**Dificultat:** 4/5 (la més exigent)  
**Temps previst:** 10 min + desplaçament  
**Descarta:** Marianna de l'Hostal  
**Xifra:** 2  

### Què veu el jugador a la pantalla

L'esborrany de la carta (amb data de la variant).  
Llibreta de torns de la font (dies 10–16 de maig).  
Pregunta: "Qui no podia haver fet la tinta?"

### Què hi ha al cartell físic

**TINTA DE GALES, A LA MANERA DELS NOTARIS**

> Esclafeu gales de roure. Poseu-les en remull amb aigua rovellada d'aquesta font, tres nits senceres, fins que l'aigua es torni negra i violàcia. Coleu-ho i afegiu-hi goma.
> Aquesta és l'única font del terme que dona l'aigua de ferro.

### Mecànica

1. La carta és escrita amb tinta de gales.
2. La tinta es fa remullant les gales **tres dies**.
3. Qui va fer la tinta va recollir aigua el **dia 12** (−3 nits del 15).
4. La llibreta mostra qui va anar a la font cada dia.
5. Qui no hi va anar el dia 12 no pot haver escrit la carta el 15.

### Solució (Variant A)

**Data de l'esborrany:** Nit del 15  
**Dia de l'aigua:** Dia 12 (−3 nits)  
**Qui va baixar a la font el dia 12:** Escolà, Ferrer, Bernat  
**Conclusió:** Marianna de l'Hostal no hi era (era al mercat de Vic) → descartada  
**Xifra AIGUA:** 2 (càntirs que va portar l'escola)

### Altres variants

| Variant | Esborrany | Dia recull | Qui hi va | Descartat |
|---------|-----------|-----------|-----------|-----------|
| B | Nit 14 | Dia 11 | Moliner, Escolà, Bernat | Hostalera |
| C | Nit 16 | Dia 13 | Moliner, Ferrer, Bernat | Hostalera |

### Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "La tinta no es fa el mateix dia." |
| 2 | −2 | "Compteu les nits cap enrere." |
| 3 | −5 | Solució. |

### Trampa

Qui no resta les tres nits mira el dia de l'esborrany, on l'hostalera sí que hi és. No la descarta i al final li queden dos sospitosos. Bernat apareix en els tres dies bons, coherent amb la resolució final.

### Validació webapp

- Marcar el sospitós descartat
- Escriure quants càntirs va portar l'escola

---

## 3. Planes Bones — La Ronda de la Patrulla

**Joc:** Mapa de camins i càlcul de temps  
**Dificultat:** 3–4/5  
**Temps previst:** 10 min + desplaçament  
**Descarta:** Isidre el Ferrer  
**Xifra:** 3  

### Què veu el jugador a la pantalla

**Masover:** "El ferrer va plegar quan tocaven [X] a Vic."  
**Pagès:** "El vaig veure passar per la cruïlla, cap a casa, quan tocaven [Y]."  
**Dada fixa:** "Per escriure un esborrany i amagar-lo cal, com a mínim, mitja hora a casa."  
Pregunta: "Si hagués passat pel poble, a quina hora hauria arribat a la cruïlla, com a molt aviat?"  
Selector d'hora (en quarts de l'hora tradicional).

### Què hi ha al cartell físic

**CAMINS DE PLANES BONES**

> Temps de pas a peu, de nit i amb fanal. Cada ratlla és un quart d'hora.

Mapa esquemàtic amb trams i taula:

| Tram | Quarts |
|------|--------|
| Cruïlla ↔ La Guixa | 4 |
| Cruïlla ↔ Pont Vell | 3 |
| Cruïlla ↔ Gual de la riera | 2 |
| Pont Vell ↔ Mas de l'Om | 4 |
| Pont Vell ↔ La Guixa | 3 |
| Gual de la riera ↔ Mas de l'Om | 3 |
| La Guixa ↔ Camps de blat | 2 |
| Camps de blat ↔ Mas de l'Om | 2 |
| La Guixa ↔ Molí Vell | 3 |
| Molí Vell ↔ Mas de l'Om | 4 |

**AVÍS DELS JURATS, MAIG DE 1705**

> La riera va crescuda: el gual no es passa.  
> Qui travessi els blats a punt de segar pagarà el mal fet: de nit no hi passa ningú sense deixar rastre, i no n'hi ha.

### Mecànica

1. El ferrer diu que la nit de l'esborrany era al Mas de l'Om ferrant un cavall.
2. Un pagès que vetllava el sembrat el va veure passant per la cruïlla tornant cap a casa.
3. Calcular si li tenia temps de desviarse pel poble, escriure l'esborrany i arribar a temps a la cruïlla.

### Solució (Variant A)

**El ferrer plega a:** Les onze (23:00)  
**El pagès el veu a cruïlla a:** Dos quarts de dues (01:30)  
**Via més ràpida (poble):** Mas → Pont Vell → La Guixa (7 quarts) + **mitja hora a casa** (2 quarts) + La Guixa → Cruïlla (4 quarts) = **13 quarts = 3 h 15 min**  
**Camí directe:** Mas → Pont Vell → Cruïlla = 7 quarts (1 h 45 min). Això deixaria 40 minuts de diferència.

**Conclusió:** Si hagués passat pel poble, hauria arribat a la cruïlla **un quart de tres (02:15)**, molt més tard que la 01:30 que diu el pagès. El ferrer té coartada → descartat.

**Xifra TERRA:** 3

### Altres variants

| Variant | Ferrer plega | Pagès el veu | Resposta correcta | Resultat |
|---------|-------------|--------------|------------------|----------|
| B | Les deu (22:00) | Dos quarts d'una (00:30) | Un quart de dues (01:15) | Ferrer descartat |
| C | Mitjanit (00:00) | Dos quarts de tres (02:30) | Un quart de quatre (03:15) | Ferrer descartat |

### Trampa

Qui passa pels blats (Mas → Blat → Guixa = 4 quarts) suma 10 quarts, que coincideix exactament amb el temps fins que el pagès el veu. Semblarà que el ferrer sí que hi podia ser. Cal rellegir l'avís dels jurats.

### Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "No tots els camins es poden fer aquella nit." |
| 2 | −2 | "Descarteu el gual i els blats, i no us oblideu de la mitja hora a casa." |
| 3 | −5 | Solució. |

### Validació webapp

- Escriure el número de casella correcte o l'hora en format de quarts
- Marcar el sospitós descartat

---

## 4. Cementiri — La Signatura del Difunt

**Joc:** Comparar escriptures  
**Dificultat:** 2/5  
**Temps previst:** 7 min + desplaçament  
**Descarta:** Escolà (anton)  
**Xifra:** 1  

### Què veu el jugador a la pantalla

Fragment de la carta: "[Signatura] DE l'ESBORRANY, pagès de la Guixa, vidu des de l'any 98."  
Registre parroquial dels tres enterraments (noms ben escrits).  
Pregunta: "De quina làpida va copiar el nom el traïdor?"

### Què hi ha al cartell físic

**LÀPIDES VELLES DEL FOSSAR**

> Còpia de les inscripcions, tal com les va gravar el picapedrer.

Variant A:
```
AQUÍ IAU ANTONI PUCH · MORÍ LO ANY 1695
AQUÍ IAU JOSEPH CORMINAS, PAGÈS · MORÍ LO ANY 1698
AQUÍ IAU MARIA SARRAT · MORÍ LO ANY 1701
```

Variant B:
```
AQUÍ IAU ANTONI PUCH · MORÍ LO ANY 1695
AQUÍ IAU JOSEPH CORMINAS, PAGÈS · MORÍ LO ANY 1698
AQUÍ IAU MARIA SARRAT · MORÍ LO ANY 1701
```

Variant C:
```
AQUÍ IAU ANTONI PUQ · MORÍ LO ANY 1695
AQUÍ IAU JOSEPH CORMINES, PAGÈS · MORÍ LO ANY 1698
AQUÍ IAU MARIA SERRAT · MORÍ LO ANY 1701
```

**Nota:** Ubicació fora de la reixa del cementiri. No s'utilitzen tombes reals.

### Mecànica

1. La signatura de l'esborrany porta errades específiques.
2. El registre parroquial mostra els noms ben escrits (signats per l'escolà).
3. Qui va copiar la signatura va copiar la làpida, no el registre.
4. Només l'escolà (i el rector) saben els noms del registre.
5. L'escolà sabia com s'escrivien de debò, però el traïdor no.

### Solució (Variant A)

**Signatura de l'esborrany:** Joseph Corminas  
**Làpida copiada:** Corminas (1698) — nom mal escrit al cartell  
**Registre:** Joseph Coromines — nom ben escrit  
**Conclusió:** Bernat va copiar la làpida. Però qui tenia accés al registre per saber els noms? L'Anton (escolà) o el rector.  
L'Anton porta la notícia que el rector ha estat ferit, així que no pot ser ell → descartat.  
**Xifra PEDRA:** 1

### Altres variants

| Variant | Signatura Esborrany | Làpida (mal) | Registre (bé) | Descartat |
|---------|-------------------|------------|----------------|-----------|
| B | Maria Sarrat | Sarrat (1701) | Maria Serrat | Anton |
| C | Antoni Puch | Puch (1695) | Antoni Puig | Anton |

### Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Compareu lletra per lletra." |
| 2 | −2 | "Qui sabia com s'escrivia de debò?" |
| 3 | −5 | Solució. |

### Plantat per al final

Els tres morts són anteriors al 1703 (any que Bernat va arribar). Bernat no els va conèixer mai i només en sabia el nom per la pedra. L'Anton, en canvi, va consultar el registre i sabria els noms bé.

### Validació webapp

- Escriure el número de la làpida
- Marcar el sospitós descartat

---

## 5. Pla del Masset — Control de l'Emissari (FÍSICA)

**Joc:** Rol social (simulació)  
**Dificultat:** 1/5  
**Temps previst:** 1–2 min per equip  
**Ubicació:** Porta d'entrada al Pla del Masset  
**Desbloqueig:** Accés al Pla del Masset  

### Què veu el jugador

L'Emissari barrant el pas amb un fanal, vestuari d'época.

### Mecànica

1. L'Emissari interroga: "Qui va? On aneu?"
2. Coartada (donada a l'inici): "Anem a buscar la llevadora per a la Marianna de l'Hostal, que està de part."
3. Preguntes possibles de l'Emissari:
   - "I de quina casa és la Marianna?" → Resposta: "De l'Hostal"
   - "I per què hi aneu tants?" → Resposta: lliure, però coherent

### Criteri

- **Bé:** Sostenen la coartada sense dubtar ni contradir-se → "Passeu. I que no us torni a veure."
- **Malament:** Dubten, es contradiu, atau → "Mentiu malament. Doneu-me un paper." Perden 1 salconduit i passen.

### Generositat

- Sigues generós amb equips familiars i infants
- Estricte amb qui riu o treu el mòbil

### Pistes

No hi ha pistes. És una prova de rol.

---

## 6. Pla del Masset — El Gir (Acusació de Bernat) (WEBAPP)

**Joc:** Lògica i deducció  
**Dificultat:** 3/5  
**Temps previst:** 8–10 min  
**Desbloqueig:** Les 4 caselles de xifres plenes (4-2-3-1)

### Què veu el jugador a la pantalla

Pantalla "Acusació": selector de traïdor + opció de marcar fins a 3 evidències del Quadern.

Primer intent: si trien **l'Anton**, arriba l'àudio:
> "El rector! L'han ferit! He estat vetllant-lo tota la nit del 15."

Es desbloqueja:
- Declaració del rector: "L'Anton va passar la nit vetllant-me."
- Full de cal·ligrafia de l'escola: exercicis de nens copiant noms del registre de difunts, incloent Josep Vilardell i Puig.

### Mecànica

1. Els jugadors han d'acusar el traïdor (Bernat) amb 3 proves vàlides.
2. Si acusen l'Anton, rep l'àudio que el neteja.
3. Han de comparar el segell de la carta amb el del missatge inicial.
4. Han de trobar la connexió entre la tinta, la luz a l'escola, i l'accés als registres.

### Proves Vàlides Contra Bernat

- Segell de ploma i clau (missatge inicial = carta)
- Llum a l'escola (Planes Bones)
- Dos càntirs per a l'escola (Font del Ferro)
- Full de cal·ligrafia amb el nom del difunt (desbloquejat aquí)
- Sap de lletra (Serrat de les Bruixes)
- Filigrana de l'àncora (idèntica entre missatge i carta)

### Solució

**Bernat**, amb qualsevol combinació de 3 proves vàlides.

**Error:** Acusació incorrecta o proves no vàlides → +3 min.

### Desbloqueig en Acusar Correctament

- Àudio del rector: "La carta és a la caixa de les almoines, al porxo de la rectoria, on l'Emissari l'havia de recollir. Abans de desmaiar-me, vaig llençar la clau a la foscor."
- Rima de l'ordre del codi:
  > "Del cim baixa l'avís, a la font es fa la tinta,  
  > al pla vetlla la ronda i a la pedra dorm el nom."

### Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Compareu el segell del primer missatge amb el de la carta." |
| 2 | −2 | "Qui tenia llum a un quart d'onze, aigua el dia 12 i accés a noms del registre?" |
| 3 | −5 | "El mestre Bernat. Proves: segell, llum a l'escola i full de cal·ligrafia." |

---

## 7. Caixa de les Almoines (WEBAPP)

**Joc:** Obrir caixa (simulació) + validació de segells  
**Dificultat:** 1/5  
**Temps previst:** 5–7 min

### Què veu el jugador a la pantalla

**Part 1 — Obrir la caixa:**
- Animació: la clau es llança a la foscor, es buscà entre els escombros
- El rector murmura (àudio feble): "La clau... és aquí en algun lloc"
- Caselles per introduir:
  - Nom del traïdor: **Bernat**
  - Codi de 4 xifres: **4-2-3-1**

Si correcte: la caixa s'obri. El rector parla amb veu més ferma:
> "La carta és aquí. Una nota del capità diu: «L'alba ve de Vic» i noms inventats d'un altre lloc. Segellar-la bé i porta-la a la porta de l'Església."

**Part 2 — Segells:**
- Imatge de 4 segells adhesius
- Pregunta: "Quin segell és el correcte?"
- Opcions A, B, C, D (Opció A és correcta)

### Segells Adhesius

- **A:** Ploma i clau (correcte)
- **B:** Clau i ploma (invertit)
- **C:** Ploma sola
- **D:** Clau creuada amb una espasa

### Solució

**Segell correcte:** A  
**Contrasenya:** "L'alba ve de Vic"  
**Desbloqueig:** Joc 8+9 (Lliurada de carta i Sometent)

---

## 8. Porta de l'Església — Engany, Tracte i Sometent (WEBAPP)

**Joc:** Rol de negociació + desxifra de codi + decisió moral  
**Dificultat:** 3/5  
**Temps previst:** 8–12 min  
**Desbloqueig:** Segell A correcte i contrasenya "L'alba ve de Vic"

### Què veu el jugador a la pantalla

**Part 1 — Lliurada de carta (rol via webapp):**

Narració: "Arribes a la porta de l'Església. L'Emissari està allà, fanal en mà."

Text dinàmic: "Digues la contrasenya."  
- Camp de text per introducir: **"L'alba ve de Vic"**

Si correcte:
> "Està bé. Ja l'ha tocada massa gent."  
> L'Emissari s'aparta. De sobitons, oïs una veu... és en Bernat.

Si error:
> "Aquest segell no és el seu. Torneu a provar-ho, si teniu temps." +2 min. Torna a intentar.

**Part 2 — Tracte (decisió moral):**

Àudio de Bernat (feble, estirat):
> "Sé per on vénen els dragons. Us ho dic si em deixeu anar a buscar el meu fill. Vosaltres què hauríeu fet?"

Compte enrere: **60 segons**

Dos botons:
- **A — Acceptar:** Deixar-lo fugir. La webapp mostra el camí dels dragons. Sense penalització.
- **B — Rebutjar:** Lliurar-lo. +3 minuts.

Si no decideixen en temps: compta com **B**.

**Part 3 — Sometent (codi final):**

Teclat de quatre xifres amb la rima:
> "Del cim baixa l'avís,  
> a la font es fa la tinta,  
> al pla vetlla la ronda  
> i a la pedra dorm el nom."

Pregunta: "Quin és el codi?"

Mecànica:
- Cada vers referencia una estació:
  - **Cim** → Serrat de les Bruixes → **4**
  - **Font** → Font del Ferro → **2**
  - **Pla** → Planes Bones → **3**
  - **Pedra** → Cementiri → **1**

Solució: **4-2-3-1**

### Resultat

**Codi correcte:**
> "No… Heu tocat a sometent."  
> La campana sona. L'Emissari fuig. Els conjurats de Sant Sebastià la senten i marxen.

La webapp mostra:
- Epíleg segons la decisió (A o B)
- Percentatge d'equips per cada decisió
- Ranking final

**Error al codi:** +1 min per intent incorrecte.

**Temps esgotat:** Derrota. Els dragons arriben a Sant Sebastià.

### Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Cada vers de la rima és una estació." |
| 2 | −2 | "El cim és el Serrat, la font és la Font del Ferro." |
| 3 | −5 | "4-2-3-1" |

---

## Resumen de Xifres

| Estació | Xifra | Concepte |
|---------|-------|----------|
| Serrat de les Bruixes | 4 | FOC (fogueres) |
| Font del Ferro | 2 | AIGUA (càntirs) |
| Planes Bones | 3 | TERRA (casella de la farga) |
| Cementiri | 1 | PEDRA (làpida) |

**Codi final:** 4-2-3-1

---

## Sistema Genèric de Desbloqueig (Reutilitzable)

Cada joc segueix el mateix patró d'interacció:

### Flow per a Cada Estació

```
Escaneja QR → Descoberta (discovered_at) → Joc → Resposta → Validació servidor

CORRECTE:
  ✓ Estació resolta (solved_at)
  ✓ +100 punts
  ✓ Desbloqueja evidències específiques
  ✓ Descarta sospitosos (1–2 per estació)
  ✓ Obté xifra del codi final (1–4)
  ✓ Tots els mòbils veuen en temps real

INCORRECTE:
  ✗ −10 punts
  ✗ Registra intent a `attempts`
  ✗ Ofereix pistes (costoses) o retry
```

### Dades Capturades Automàticament

| Camp | Exemple | Ús |
|------|---------|-----|
| `discovered_at` | 12:34:56 | Marca quan s'escaneja QR |
| `solved_at` | 12:43:21 | Marca quan es resol correctament |
| `duration` | 8 min 25 s | Temps dedicat a l'estació |
| `attempts` | 2 | Nombre d'intents fallits |

Aquestes dades s'usen per a desempats finals i estadístiques.

---

## Sistema de Cronometratge

**Visible pels jugadors:**
- Cronometre constant a la webapp: hora actual (compte enrere fins a la campana)
- **Marca de temps automàtica** quan l'equip escaneja QR d'estació → `discovered_at`
- **Marca de temps automàtica** quan resolen l'enigma (estacions I) → `solved_at`
- Diferència = temps dedicat a l'estació

**Usado pels resultats finals:**
- Moment de l'acusació de Bernat (jog 6)
- Moment de l'última estació de desxifra resolta (jogs 1-4)
- Moment en triar decisió moral (jog 8)
- Moment en introduir el codi final (jog 8)

---

## Operativa de Sessió

1. **Variante del dia:** Triar A, B o C. Cada variant canvia: data de l'esborrany, signatura del difunt, missatge de fogueres, hora del ferrer, hora del pagès.
2. **Cartells:** Revisar que tots els 6 cartells (4 estacions + Pla del Masset + Rectoria) estan llegibles, amb el QR intacte.
3. **Braçals i salconduits:** 3 per equip.
4. **Actor (Emissari):** Vestuari, fanal carregat, briefing de seguretat. Segona parada: Porta de l'Església per al joc 8 (simulació webapp).
5. **Sincronitzar:** Rellotges amb l'hora de la campana i la webapp.
6. **Webapp:** Verificar totes les respostes de les variants. Carregar sense connexió en un mòbil de prova.
7. **Cronometre visible:** Verificar que el compte enrere es veu correctament als dispositius dels jugadors.
8. **Nota:** Els jogs 6, 7 i 8 són totalment webapp (no requereixen elements físics adicionals després del Pla del Masset).

