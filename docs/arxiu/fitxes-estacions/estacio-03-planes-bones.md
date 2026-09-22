# Estació 3: Planes Bones — La Ronda de la Patrulla

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Planes Bones |
| **Subtítol** | La Ronda de la Patrulla |
| **Acte** | I - La Investigació |
| **Joc** | Mapa, temps i deducció (webapp + cartell) |
| **Ordre** | Lliure (una de les 4 primeres estacions) |
| **Ubicació física** | Planes Bones (mas prop del poble) |
| **Dificultat** | 3–4/5 |
| **Temps previst** | 10 min + desplaçament |

---

## Cartell Físic

**CAMINS DE PLANES BONES**

> Temps de pas a peu, de nit i amb fanal. Cada ratlla és un quart d'hora.

### Mapa Esquemàtic amb Trams

| Tram | Quarts d'hora |
|------|---------------|
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

### Avís dels Jurats

**AVÍS DELS JURATS, MAIG DE 1705**

> La riera va crescuda: **el gual no es passa.**
> Qui travessi els blats a punt de segar pagarà el mal fet: de nit no hi passa ningú sense deixar rastre, i **no n'hi ha**.

### QR

QR que apunta a: `/s/[token-station-3]`

---

## Mecànica del Joc

### Què Veu el Jugador a la Webapp

1. Testimoni del masover: "El ferrer va plegar quan tocaven **[HORA X]** a Vic."
2. Testimoni del pagès: "El vaig veure passar per la cruïlla, cap a casa, quan tocaven **[HORA Y]**."
3. Dada fixa: "Per escriure un esborrany i amagar-lo cal, com a mínim, **mitja hora a casa**."
4. Selector d'hora: "Si hagués passat pel poble, a quina hora hauria arribat a la cruïlla, com a molt aviat?"
5. Imatge del mapa amb trams

### Flux de Raonament

1. Ferrer plega del Mas de l'Om a les **[X]**
2. Si va pel poble (via Pont Vell → La Guixa → Cruïlla):
   - Temps: Mas → Pont Vell (4 quarts) + Pont Vell → Guixa (3 quarts) + **mitja hora a casa** (2 quarts) + Guixa → Cruïlla (4 quarts) = **13 quarts = 3 h 15 min**
3. Si va pel camí directe (Mas → Pont Vell → Cruïlla):
   - Temps: 7 quarts = 1 h 45 min (però no pot haver escrit la carta)
4. Pagès el veu a la cruïlla a les **[Y]**
5. Si la diferència entre X + (13 quarts) ≠ Y, el ferrer no hi podia ser → **coartada válida**

### Trampa Común

Qui passa pels blats (Mas → Blat → Guixa = 4 quarts) suma 10 quarts en total, que pot coincidir exactament amb el temps fins que el pagès el veu. Però l'avís dels jurats diu que els blats no es passen de nit sense deixar rastre (i no n'hi ha).

---

## Solucions i Variants

### Variant A

| Paràmetre | Valor |
|-----------|-------|
| **Ferrer plega a** | Les onze (23:00) |
| **Pagès el veu a cruïlla a** | Dos quarts de dues (01:30) |
| **Ruta via poble** | Mas → Pont Vell → Guixa + 30 min a casa + Guixa → Cruïlla = 13 quarts |
| **Hora arrival (via poble)** | Un quart de tres (02:15) |
| **Conclusió** | Ferrer no podia estar al poble (arribaria als 02:15, però lo veuen als 01:30) → **coartada vàlida** |
| **Xifra obtinguda** | 3 (TERRA) |
| **Detall xifra** | Casella del mapa on el ferrer estava (Mas de l'Om = 3) |

### Variant B

| Paràmetre | Valor |
|-----------|-------|
| **Ferrer plega a** | Les deu (22:00) |
| **Pagès el veu a cruïlla a** | Dos quarts d'una (00:30) |
| **Hora arrival (via poble)** | Un quart de dues (01:15) |
| **Conclusió** | Coartada vàlida (millor per al ferrer) |
| **Xifra obtinguda** | 3 (TERRA) |

### Variant C

| Paràmetre | Valor |
|-----------|-------|
| **Ferrer plega a** | Mitjanit (00:00) |
| **Pagès el veu a cruïlla a** | Dos quarts de tres (02:30) |
| **Hora arrival (via poble)** | Un quart de quatre (03:15) |
| **Conclusió** | Coartada vàlida |
| **Xifra obtinguda** | 3 (TERRA) |

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "No tots els camins es poden fer aquella nit." |
| 2 | −2 | "Descarteu el gual i els blats, i no us oblideu de la mitja hora a casa." |
| 3 | −5 | Solució completa (ruta via poble, temps, conclusió). |

---

## Validació Webapp

✓ **Camp 1:** Escriure el número de casella correcta (quart d'hora en que arribar)  
✓ **Camp 2:** Marcar el sospitós descartat (Isidre el Ferrer)

---

## Conclusió de l'Estació

**Descobriment:** El ferrer no podia estar al poble el dia 15 (tenia coartada de les hores del Mas de l'Om + el pagès el va veure a la cruïlla). No podia haver escrit la carta.

**Sospitosos descartats:**
- Isidre el Ferrer (coartada de temps: estava al Mas)

**Sospitosos restants:** Bernat, Anton (escolà)

---

## Evidències Desbloqueades en Resolució

1. **Mapa complet de Planes Bones**: amb noms de masies i cruïlles
2. **Testimoni del masover**: "Isidre va plegar la ferradura al Mas de l'Om."
3. **Testimoni del pagès**: Declaració firmada datada del 16 de maig
4. **Nota sobre llum a l'escola**: "Aquell dia, al quart d'onze, hi havia llum encesa a l'escola de la Guixa." (pista per a jog 6)

---

## Contexte Narratiu

Isidre el Ferrer va dir que la nit del 15 estava al Mas de l'Om ferrant un cavall. Un pagès que vetllava el sembrat de blat (a punt de segar) lo va veure passar per la cruïlla en tornar cap a casa. Però la matemàtica dels camins i els temps de pas revela que Isidre no podia haver estat al poble aquella nit: els trams sumen massa. La riera crescuda bloqueja el gual, i els blats no es passen sense deixar rastre.

**Àudio opcional (màster):** "El pagès jura que el ferrer passava per la cruïlla a una hora exacta. Si en Isidre hagués anat al poble primer, l'hauria vist més tard..."

