# Joc 4: Cementiri — Document de Desenvolupament

**Estació:** Cementiri exterior  
**Versió:** 2.0 (Comparador visual 9 làpides)  
**Estat:** Llest per codificar  
**Durada:** 3–4 min de joc  
**Dificultat:** 2/5  

---

## 📋 Visió General

El jugador ha d'**identificar de quina làpida va copiar la signatura el traïdor**, comparant l'errada de la carta amb les 9 làpides fictícies del cementiri. Descobrirà que l'Escolà (qui escriu el registre parroquial) coneixia el nom correcte, cosa que el fa sospitós de tenir accés a informació secreta.

**Narrativa:**
- La carta va signada amb un nom que coincideix amb una LÀPIDA (amb errada del picapedrer)
- Però el REGISTRE PARROQUIAL té el nom correcte
- L'Escolà va escriure el registre → coneixia el nom correcte → podia copiar l'errada a propòsit

---

## 🎮 Mecànica del Joc

### Flux General

```
Pantalla 0 (Menú) →
Pantalla 1 (Intro) →
Pantalla 2 (Làpides) →
Pantalla 3 (Registre) →
Pantalla 3B (La Carta) →
Pantalla 4 (Joc: Selecciona Làpida) →
Pantalla 7A/7B (Resultat)
```

### Mecanisme: Comparador Visual 9 Làpides

1. **Pantalla 1-3:** Context (intro, làpides físiques, registre parroquial)
2. **Pantalla 3B:** Mostra el **fragment de la carta** amb la **signatura errada**
3. **Pantalla 4:** Mostra **9 làpides en grilla 3×3**
   - Jugador ha de **recordar la signatura errada** de la pantalla anterior
   - Clica la làpida que coincideix amb aquella errada
4. **Validació:** Compara làpida seleccionada (nº) amb resposta correcta (sempre 1)
5. **Correcte:** Descobreix que l'Escolà tenia accés al registre
6. **Incorrecte:** Torna a intentar

---

## 📊 Dades de Làpides

### Per Variant (Dinàmic)

| Variant | Signatura Errada | Any | Registre (Correcte) | Resposta | Descarta |
|---------|-----------------|-----|---------------------|----------|----------|
| **A** | Corminas | 1698 | Joseph Coromines | Làpida 1 | Anton |
| **B** | Sarrat | 1701 | Maria Serrat | Làpida 1 | Anton |
| **C** | Puch | 1695 | Antoni Puig | Làpida 1 | Anton |

### Estructura: 9 Làpides per Variant

**Variant A (9 làpides):**
1. **Corminas** (1698) ← RESPOSTA CORRECTA
2. Corbella (1705)
3. Mas (1700)
4. Coromines (1702) ← Trampa: nom correcte, però any diferent
5. Corminelles (1697) ← Trampa: nom similar
6. Carrió (1704)
7. Solà (1699)
8. Puig (1703)
9. Molí (1701)

**Registre Parroquial (9 entrades):**
- 1697: Joan Corminelles
- 1698: Joseph Coromines ← Correcte (signatura errada = Corminas)
- 1699: Miquel Solà
- 1700: Pere Mas
- 1701: Gabriel Molí
- 1702: Maria Coromines
- 1703: Antoni Puig
- 1704: Jaume Carrió
- 1705: Jaume Corbella

**La Trampa:** 
- Làpida 1: Corminas (1698) = errada ✓
- Làpida 4: Coromines (1702) = correcte, però ANY diferent
- Jugador ha de comparar: signatura "Corminas" → Làpida 1, no 4

---

## 📱 Pantalles

### Pantalla 0: Títol + Menú

```
CEMENTIRI
═════════════════════
La Signatura del Difunt

[1] INTRODUCCIÓ
[2] LÀPIDES
[3] REGISTRE
[4] LA CARTA
[5] EL JOC
```

---

### Pantalla 1: Introducció

```
CEMENTIRI
═════════════════════

"La carta va signada amb el nom d'un mort fa sis anys. 
Només qui consulta el registre de difunts podia saber 
aquell nom.

Els picapedrers fan errors: alguns noms a les làpides 
no van escrits tal com es van enterrar.

Compareu la signatura errada de la carta amb les làpides 
fictícies. Descobrireu qui tenia accés al registre real."

[CONTINUAR]
```

---

### Pantalla 2: Làpides (9 opcions)

Mostra grid 3×3 amb les **9 làpides fictícies**:

```
1698: Corminas       1705: Corbella       1700: Mas
1702: Coromines      1697: Corminelles    1704: Carrió
1699: Solà           1703: Puig           1701: Molí
```

---

### Pantalla 3: Registre Parroquial (9 entrades)

Taula amb els **9 noms CORRECTES** signats per l'Escolà.

---

### Pantalla 3B: La Carta (NOVA)

Fragment de la carta trobada al paller:

```
15 de maig de 1705

"Si el Pacte cau, els homes de Sentfoses hauran de fugir. 
Només l'Emissari pot salvar-nos si li donem la clau de la 
Rectoria.

Els conjurats sabran qui ha triat deixar morir el Pacte..."

Signada: Corminas (ERRADA)

---

La signatura diu "Corminas", però el Rector no es diu així. 
Qui tenia accés a aquest nom?

[COMPARAR AMB LES LÀPIDES]
```

---

### Pantalla 4: El Joc (Seleccionar Làpida)

```
DE QUINA LÀPIDA VA COPIAR EL NOM?
═════════════════════════════════

Selecciona la làpida:

[1] Corminas (1698)
[2] Corbella (1705)
[3] Mas (1700)
[4] Coromines (1702)
[5] Corminelles (1697)
[6] Carrió (1704)
[7] Solà (1699)
[8] Puig (1703)
[9] Molí (1701)

[PISTA (−5)]  [VALIDAR]
```

**Nota:** NO es mostra la signatura ni el registre. El jugador ha de **recordar** que la signatura deia "Corminas".

---

### Pantalla 7A: Correcte ✅

```
✓ CORRECTE!

Has seleccionat: Làpida nº 1 (Corminas, 1698)

Però el registre parroquial diu:
Joseph Coromines (any 1698)

L'Escolà SABIA el nom correcte, perquè 
ell va escriure el registre de difunts.

Per tant:
• Tenia ACCÉS al registre ✓
• Podia COPIAR errades ✓
• Per tant, podia ser el TRAÏDOR

XIFRA: PEDRA = 1
(Pedra del cementiri)

+100 punts
Evidència desbloqueïda: "Fragment de la carta i Làpides"

[SEGÜENT ESTACIÓ]
```

---

### Pantalla 7B: Incorrecte ❌

```
✗ INCORRECTE

Has seleccionat: Làpida nº [N°] ([NOM])

Però la signatura de la carta diu "Corminas", 
no "[NOM]".

Compara la lletra un cop més.

−10 punts
Intent 1/3

[PISTA (−5)]  [TORNAR]
```

---

## 🖱️ Interactivitat (JavaScript)

### Clica Làpida

```javascript
function selectLapida(num) {
  // Desmarcar anterior
  document.querySelectorAll('.lapida-option')
    .forEach(b => b.classList.remove('selected'));
  
  // Marcar nova
  document.querySelectorAll('.lapida-option')[num - 1]
    .classList.add('selected');
  
  selectedLapida = num;
}
```

### Validació

```javascript
function validateAnswer() {
  if (selectedLapida === null) {
    alert('Selecciona una làpida!');
    return;
  }

  if (selectedLapida === 1) {
    showScreen('7a');
  } else {
    const names = ['Corminas', 'Corbella', 'Mas', 
                   'Coromines', 'Corminelles', 'Carrió', 
                   'Solà', 'Puig', 'Molí'];
    document.getElementById('selected-num').textContent = selectedLapida;
    document.getElementById('selected-name').textContent = names[selectedLapida - 1];
    showScreen('7b');
  }
}
```

### Pista

```javascript
function showPista() {
  alert('Compareu lletra per lletra.');
  // Backend: penalitza −5 punts
}
```

---

## 📊 Dades (Backend)

### Estructura de Dades per Variant

```javascript
const LAPIDES_BY_VARIANT = {
  A: {
    signature_error: "Corminas",
    correct_name: "Joseph Coromines",
    year: 1698,
    lapidas: [
      { id: 1, name: "Corminas", year: 1698 },
      { id: 2, name: "Corbella", year: 1705 },
      { id: 3, name: "Mas", year: 1700 },
      { id: 4, name: "Coromines", year: 1702 },
      { id: 5, name: "Corminelles", year: 1697 },
      { id: 6, name: "Carrió", year: 1704 },
      { id: 7, name: "Solà", year: 1699 },
      { id: 8, name: "Puig", year: 1703 },
      { id: 9, name: "Molí", year: 1701 }
    ],
    registry: [
      { year: 1697, name: "Joan Corminelles" },
      { year: 1698, name: "Joseph Coromines" },
      { year: 1699, name: "Miquel Solà" },
      { year: 1700, name: "Pere Mas" },
      { year: 1701, name: "Gabriel Molí" },
      { year: 1702, name: "Maria Coromines" },
      { year: 1703, name: "Antoni Puig" },
      { year: 1704, name: "Jaume Carrió" },
      { year: 1705, name: "Jaume Corbella" }
    ],
    correct_answer: 1
  },
  // B i C segueixen el mateix patern
};
```

### Score Events

```javascript
{
  team_id: "abc123",
  station_id: "cementiri",
  type: "SOLVED",
  solved_at: "2025-05-15T23:32:10Z",
  duration_minutes: 3,
  attempts: 1,
  evidence_unlocked: "evidence_tombstone",
  suspect_discarded: "Anton",
  xifra: 1,
  points_awarded: 100
}
```

---

## 💡 Pista

| Cost | Text |
|------|------|
| −5 | "Compareu lletra per lletra." |

**Només una pista única per joc.**

---

## 🛠️ Checklist de Desenvolupament

### Front-end

- [ ] Pantalla 0: Menú (navegació entre pantalles)
- [ ] Pantalla 1: Introducció (text narratiu)
- [ ] Pantalla 2: 9 Làpides fictícies (grid 3×3)
- [ ] Pantalla 3: Registre parroquial (taula 9 entrades)
- [ ] Pantalla 3B: Fragment de la carta (visualment diferent)
- [ ] Pantalla 4: Comparador
  - [ ] 9 Làpides clickables en grid 3×3
  - [ ] Resalta làpida seleccionada
  - [ ] Botó [PISTA], [VALIDAR]
  - [ ] NO es mostra signatura ni registre
- [ ] Pantalla 7A: Correcte ✅
- [ ] Pantalla 7B: Incorrecte ❌
- [ ] Pantalla Confirmació Pista (genèrica)
- [ ] Cronometre visible (vermell dalt centrat)
- [ ] Responsive design (grid 3×3 → 2×2 en mòbil)

### Backend

- [ ] Carregar dades de làpides per variant (A/B/C)
- [ ] Validar resposta: làpida seleccionada === 1
- [ ] Penalitzar pista: −5 punts si clica
- [ ] Registrar score event
- [ ] Desbloquear evidència (`evidence_tombstone`)
- [ ] Descartar sospitós (Anton)
- [ ] Obtenir xifra (1 = PEDRA)
- [ ] Sincronitzar estat a tots els mòbils de l'equip

### QA

- [ ] Testejar totes les 9 làpides (només 1 és correcta)
- [ ] Testejar que es pot seleccionar una làpida per cop
- [ ] Testejar validació: comparació exacta (1 == 1)
- [ ] Testejar pista (mostra text, costa −5 punts)
- [ ] Testejar replay (reset + intent de nou)
- [ ] Testejar totes les variants A/B/C
- [ ] Testejar responsive en mòbil (grid 2×2)
- [ ] Testejar que pantalla 4 NO mostra signatura ni registre
- [ ] Testejar navegació entre pantalles (0→1→2→3→3B→4)

---

## 📈 Mètriques Estimades

| Mètrica | Valor |
|---------|-------|
| Temps joc | 3–4 min |
| Durada implementació | 5–7 h |
| Opcions clickables | 9 |
| Pantalles | 7 (0, 1, 2, 3, 3B, 4, 7A/7B) |
| Validacions | 2 crítica |
| Variants | 3 (A, B, C) |
| Dificultat | 2/5 |
| Punts màxim | 100 |

---

## 📝 Notes Adicionals

### Trampa Intencionada (Variant A)

Hi ha **dos noms molt similars:**
- Làpida 1: **Corminas** (1698) = errada ← CORRECTA
- Làpida 4: **Coromines** (1702) = correcte ← TRAMPA

L'Escolà sap que "Coromines" és el nom correcte al registre. Els jugadors que llegeixen el registre podrien pensar que Coromines és la resposta. Però han de buscar la **signatura errada** de la carta, que diu "Corminas" (sense la "o").

**Validació correcta:** Comparar exactament la signatura errada de la carta (Corminas) amb la làpida seleccionada.

### Responsabilitat de Memòria

La pantalla 4 NO mostra cap referència. El jugador ha de **recordar** de la pantalla anterior que la signatura deia "Corminas". Això fa el joc més requeridor memòria, que és apropiat per a la dificultat 2/5.

---

**Status:** Llest per desenvolupar. Contactar si hi ha dubtes.
