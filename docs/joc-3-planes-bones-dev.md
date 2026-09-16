# Joc 3: Planes Bones — Document de Desenvolupament

**Estació:** Planes Bones  
**Versió:** 2.0 (Mecànica visual interactiva)  
**Estat:** Llest per codificar  
**Durada:** 4–5 min de joc (interactiu)  
**Dificultat:** 1–2/5  

---

## 📋 Visió General

El jugador ha de **traçar el camí de la patrulla nocturna** des de la Plaça fins a les 23:00, respectant les normes de moviment. Descobrirà que la patrulla arriba a la Farga exactament quan el ferrer diu que estava allà, provant que té coartada.

---

## 🎮 Mecànica del Joc

### Flux General

```
Pantalla 0 (Menú) →
Pantalla 1 (Intro) →
Pantalla 2 (Regles) →
Pantalla 4 (Joc Interactiu) →
Pantalla 7A/7B (Resultat)
```

### Normes Estrictes (Jugador Ha de Seguir)

1. **Inici:** Plaça a les 22:00 (hora inicial fixa)
2. **Cada casella = +1 quart d'hora (15 min)**
3. **Prioritat de moviment:** NORD → EST → OEST → SUD
4. **Prohibits:** Bosc, Riera (gual), Cementiri
5. **No repetir caselles**
6. **Objectiu:** Arribar a FARGA exactament a les 23:00

---

## 🗺️ Mapa: Quadrícula 4×4

### Estructura Física

```
Fila 1: [1:Plaça]  [2:buida]  [3:buida]  [4:Bosc]
Fila 2: [5:Hostal] [6:Pou]    [7:buida]  [8:Bosc]
Fila 3: [9:Escola] [10:Rectoria] [11:Hort] [12:Font]
Fila 4: [13:Cementiri] [14:Plaça-2] [15:Paller] [16:Riera]
```

**ESPERA, mirar més bé el document:**

D'acord amb la documentació original:
```
Col  N  1            2          3          4
Fila
1       Camí de Vic  Molí       Farga      Bosc
2       Hostal       Pou        Era        Bosc
3       Escola       Rectoria   Hort       Font
4       Cementiri    Plaça      Paller     Riera
```

### Coordinates (fila, col)

| ID | Fila | Col | Nom | Tipus | Accessible |
|----|------|-----|-----|-------|-----------|
| 1 | 1 | 1 | Camí Vic | Lloc | ✅ |
| 2 | 1 | 2 | Molí | Lloc | ✅ |
| 3 | 1 | 3 | Farga | **DESTÍ** | ✅ |
| 4 | 1 | 4 | Bosc | Prohibit | ❌ |
| 5 | 2 | 1 | Hostal | Lloc | ✅ |
| 6 | 2 | 2 | Pou | Lloc | ✅ |
| 7 | 2 | 3 | Era | Lloc | ✅ |
| 8 | 2 | 4 | Bosc | Prohibit | ❌ |
| 9 | 3 | 1 | Escola | Lloc | ✅ |
| 10 | 3 | 2 | Rectoria | Lloc | ✅ |
| 11 | 3 | 3 | Hort | Lloc | ✅ |
| 12 | 3 | 4 | Font | Lloc | ✅ |
| 13 | 4 | 1 | Cementiri | Prohibit | ❌ |
| 14 | 4 | 2 | Plaça | **INICI** | ✅ |
| 15 | 4 | 3 | Paller | Lloc | ✅ |
| 16 | 4 | 4 | Riera | Prohibit | ❌ |

---

## 📱 Pantalles

### Pantalla 0: Títol + Menú

```html
<div class="screen-title">
  <h1>PLANES BONES</h1>
  <h2>La Ronda de la Patrulla</h2>
  
  <div class="menu">
    <button>[1] INTRODUCCIÓ</button>
    <button>[2] REGLES</button>
    <button>[3] MAPA</button>
    <button>[4] EL JOC</button>
  </div>
</div>
```

---

### Pantalla 1: Introducció

```html
<div class="screen-intro">
  <h2>PLANES BONES</h2>
  
  <p>
    "El traginer va espiar la ronda de la patrulla 
    des del paller i en va memoritzar les regles.
    
    La nit del 15 de maig, la patrulla surt de la 
    Plaça a les deu (22:00). Cada quart d'hora 
    avança un tram. Sempre el mateix camí:
    
    • Mai en diagonal
    • No trepitja bosc, riera ni cementiri
    • Prioritat: NORD, EST, OEST, SUD
    
    El ferrer diu que la nit del 15 estava al Mas 
    de l'Om. Un pagès el va veure tornar a casa a 
    les onze (23:00).
    
    Marca el camí que va seguir la patrulla i 
    descobreix on estava realment a aquella hora."
  </p>
  
  <button>[CONTINUAR]</button>
</div>
```

---

### Pantalla 2: Regles i Mapa

```html
<div class="screen-rules">
  <h2>REGLES DE LA PATRULLA</h2>
  
  <div class="rules-box">
    <p>✓ Surt de la Plaça a les 22:00</p>
    <p>✓ Cada casella = +1 quart (15 min)</p>
    <p>✓ Ordre de prioritat: NORD → EST → OEST → SUD</p>
    <p>✗ NO pot entrar: Bosc, Riera, Cementiri</p>
    <p>✗ NO repetir caselles</p>
  </div>
  
  <h2>MAPA</h2>
  
  <div class="map-grid">
    <!-- 4x4 grid with labels -->
    [Mapa visual aquí]
  </div>
  
  <button>[ENTENENT]</button>
</div>
```

---

### Pantalla 4: El Joc (Principal)

```html
<div class="screen-game">
  <h2>TRAÇA EL CAMÍ DE LA PATRULLA</h2>
  
  <div class="game-container">
    <!-- MAPA INTERACTIU (4x4 grid) -->
    <div class="map-game">
      <div class="cell" id="cell-1" data-name="Camí Vic">
        Camí Vic
      </div>
      <div class="cell" id="cell-2" data-name="">
        <!-- Buida -->
      </div>
      <!-- ... 14 més ... -->
    </div>
    
    <!-- DISPLAY DE TEMPS (Part inferior) -->
    <div class="time-display">
      <div class="stat">
        <label>TEMPS TOTAL:</label>
        <value id="total-time">0 min</value>
      </div>
      
      <div class="stat">
        <label>HORA ACTUAL:</label>
        <value id="current-time">22:00</value>
      </div>
      
      <div class="stat">
        <label>CASELLES VISITADES:</label>
        <list id="visited-list">
          <!-- Plaça (22:00), [buida] (22:15), ... -->
        </list>
      </div>
    </div>
  </div>
  
  <div class="buttons">
    <button>[PISTA (−5)]</button>
    <button>[VALIDAR]</button>
  </div>
</div>
```

---

## 🖱️ Interactivitat (JavaScript)

### Clica Casella

```javascript
// Quan clica una casella
function clickCell(cellId) {
  const cell = document.getElementById(cellId);
  const isAccessible = validateMove(cellId);
  
  if (!isAccessible) {
    showError("No pots entrar aquí!");
    return;
  }
  
  // Marca casella com visitada
  cell.classList.add("visited"); // Color verd
  visitedCells.push(cellId);
  
  // Suma temps
  totalMinutes += 15;
  updateTimeDisplay();
  
  // Comprova si ha arribar a 23:00 a FARGA
  if (totalMinutes === 60 && cellId === "farga") {
    showSuccess();
  }
}
```

### Validacions

```javascript
// Comprova si la casella és accessible
function validateMove(cellId) {
  const cell = getCellData(cellId);
  
  // 1. No prohibides
  if (["bosc", "riera", "cementiri"].includes(cell.type)) {
    return false;
  }
  
  // 2. No visitada
  if (visitedCells.includes(cellId)) {
    return false;
  }
  
  // 3. Segueix la prioritat de moviment
  if (!followsPriority(cellId)) {
    return false;
  }
  
  return true;
}

// Comprova si segueix la prioritat NORD → EST → OEST → SUD
function followsPriority(nextCellId) {
  if (visitedCells.length === 0) {
    return nextCellId === "placa"; // Primer ha de ser Plaça
  }
  
  const lastCell = getCellData(visitedCells[visitedCells.length - 1]);
  const nextCell = getCellData(nextCellId);
  
  // Calcular direcció i validar prioritat
  const direction = getDirection(lastCell, nextCell);
  return hasHigherPriority(direction, availableDirections);
}
```

### Actualització de Temps

```javascript
function updateTimeDisplay() {
  const minutes = totalMinutes;
  const hours = 22; // Sempre comença a les 22:00
  const finalHour = hours + Math.floor(minutes / 60);
  const finalMinutes = minutes % 60;
  
  // Actualitza display
  document.getElementById("total-time").textContent = `${minutes} min`;
  document.getElementById("current-time").textContent = 
    `${finalHour}:${String(finalMinutes).padStart(2, '0')}`;
  
  // Actualitza llista de caselles visitades
  updateVisitedList();
}

function updateVisitedList() {
  const list = document.getElementById("visited-list");
  list.innerHTML = visitedCells.map((cellId, index) => {
    const time = 22 * 60 + (index * 15);
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    const cellName = getCellData(cellId).name || "[buida]";
    return `${cellName} (${hours}:${String(mins).padStart(2, '0')})`;
  }).join("<br>");
}
```

---

### Validació Final

```javascript
function validateAnswer() {
  const lastCell = visitedCells[visitedCells.length - 1];
  const lastCellData = getCellData(lastCell);
  const totalTime = visitedCells.length * 15; // Minuts
  
  if (totalTime === 60 && lastCellData.id === "farga") {
    showCorrectScreen();
  } else {
    showIncorrectScreen();
  }
}
```

---

## 📊 Dades (Backend)

### Estructura de Dades

```javascript
const CELLS = {
  1: { id: 1, name: "Camí Vic", type: "location", fila: 1, col: 1 },
  2: { id: 2, name: "", type: "empty", fila: 1, col: 2 },
  3: { id: 3, name: "Farga", type: "location", fila: 1, col: 3, isDestination: true },
  4: { id: 4, name: "Bosc", type: "prohibit", fila: 1, col: 4 },
  // ... 12 més
  14: { id: 14, name: "Plaça", type: "location", fila: 4, col: 2, isStart: true },
  // ... etc
};

const ADJACENCY = {
  // Defineix quina casella és adjacent a quina (per a validació prioritat)
  1: { N: null, E: 2, O: null, S: 5 },
  2: { N: null, E: 3, O: 1, S: 6 },
  // ... etc
};
```

### Score Events

```javascript
{
  team_id: "abc123",
  station_id: "planes-bones",
  type: "SOLVED",
  solved_at: "2025-05-15T23:45:30Z",
  duration_minutes: 5,
  attempts: 1,
  evidence_unlocked: "evidence_patrol_route",
  suspect_discarded: "Isidre",
  xifra: 3,
  points_awarded: 100
}
```

---

## 🎯 Pantalles de Resultat

### Pantalla 7A: Correcte ✅

```html
<div class="screen-correct">
  <h1>✓ CORRECTE!</h1>
  
  <p>
    La patrulla va arribar a FARGA exactament 
    a les 23:00.
  </p>
  
  <p>
    ISIDRE EL FERRER ESTAVA TREBALLANT A LA FARGA 
    EN AQUELL MOMENT.
  </p>
  
  <p>
    Per tant:
    • NO podia estar al poble escrivint la carta
    • TÉ COARTADA ✓
    • DESCARTAT ✓
  </p>
  
  <div class="xifra-box">
    <label>XIFRA: TERRA = 3</label>
    <p>(Casella de la Farga)</p>
  </div>
  
  <p>+100 punts</p>
  <p>Evidència desbloqueïda: "Ruta de la patrulla"</p>
  
  <button>[SIGUIENTE ESTACIÓ]</button>
</div>
```

---

### Pantalla 7B: Incorrecte ❌

```html
<div class="screen-incorrect">
  <h1>✗ INCORRECTE</h1>
  
  <p>Has marcat: [CASELLA] a les [HORA]</p>
  
  <p>
    La patrulla ha de arribar a FARGA exactament 
    a les 23:00 (60 minuts).
  </p>
  
  <p>−10 punts</p>
  <p>Intent [N]/3</p>
  
  <button>[PISTA (−5 pts)]</button>
  <button>[TORNAR A INTENTAR]</button>
</div>
```

---

## 💡 Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "No tots els camins es poden fer aquella nit. Hi ha caselles que no pots visitar." |
| 2 | −2 | "La prioritat és NORD, EST, OEST, SUD. Descarta caselles prohibides (bosc, riera, cementiri)." |
| 3 | −5 | "Plaça → [buida] → Pou → [buida] → Farga = 23:00. La patrulla arriba a FARGA a l'hora que Isidre estava allà." |

---

## 🛠️ Checklist de Desenvolupament

### Front-end

- [ ] Pantalla 0: Menú (navegació entre pantalles)
- [ ] Pantalla 1: Introducció (text)
- [ ] Pantalla 2: Regles + Mapa estàtic
- [ ] Pantalla 4: Mapa interactiu 4×4
  - [ ] Grid render amb caselles clickables
  - [ ] Colorejar caselles visitades (verd)
  - [ ] Display de temps (dalt/baix)
  - [ ] Display de caselles visitades (nom/hora)
  - [ ] Botó [PISTA], [VALIDAR]
- [ ] Pantalla 7A: Correcte ✅
- [ ] Pantalla 7B: Incorrecte ❌
- [ ] Pantalla Confirmació Pista (genèrica)
- [ ] Cronometre visible (vermell dalt centrat)

### Backend

- [ ] Definir estructura CELLS (16 caselles)
- [ ] Definir ADJACENCY (direccions nord/est/oest/sud)
- [ ] Validar cada clica: accessible? prioritat? ja visitat?
- [ ] Actualitzar temps real-time (+15 min per casella)
- [ ] Validar resposta final: 60 min + FARGA = correcte
- [ ] Registrar score event
- [ ] Desbloquear evidència
- [ ] Descartar sospitós (Isidre)

### QA

- [ ] Testejar totes les caselles prohibides (no es pot clicar)
- [ ] Testejar repetició (2a vegada no es pot clicar)
- [ ] Testejar prioritat (ha de respectar nord/est/oest/sud)
- [ ] Testejar validació (60 min exactes + FARGA)
- [ ] Testejar pistes (descompten punts)
- [ ] Testejar replay (reset + intent de nou)

---

## 📈 Mètriques Estimades

| Mètrica | Valor |
|---------|-------|
| Temps joc | 4–5 min |
| Durada implementació | 6–8 h |
| Caselles interactives | 16 |
| Validacions | 5 crítica |
| Dificultat | 1–2/5 |
| Punts màxim | 100 |

---

**Status:** Llest per desenvolupar. Contactar si hi ha dubtes.
