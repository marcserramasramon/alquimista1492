# Joc 5: Pla de Masset — Control de l'Emissari (Desenvolupament)

**Estació:** Pla de Masset (accés)  
**Versió:** 2.0 (Rol social distribuit, 8 frases)  
**Estat:** Llest per codificar  
**Durada:** 2–3 min per equip  
**Dificultat:** 1–2/5  
**Tipus:** Rol social interactiu (equip vs màster)

---

## 📋 Visió General

L'Emissari atura l'equip i els interroga. Els jugadors **han de collaborar i comunicar-se** per sostenir una coartada consistent sense contradir-se.

**Mecànica:**
- Cada **equip rep una coartada única** al inici de la partida
- La coartada es **distribueix entre jugadors** (cada un veu una frase en una pantalla privada)
- L'Emissari (màster) **interroga públicament** verificant que tots resposten igual
- Si **contradiuen o dubten:** perden 1 salconduit (però passen igualment)
- Si **totes les respostes coincideixen:** passen sense penalització

---

## 🎮 Mecànica del Joc

### Flux

```
Pantalla Salvaconducte (Privada per jugador) →
Jugadors memoritzen la seva frase →
L'Emissari interroga el grup (en viu) →
Validació del màster (manual) →
Passen al Pla de Masset
```

### Estructura de Coartada: 8 Frases

Cada coartada es compon de **8 frases distribudes entre jugadors**:

```
1. [ACCIÓ PRINCIPAL]     "Anem a buscar..."
2. [PERSONA]             "La Marianna"
3. [LLOC]                "de l'Hostal"
4. [RAÓ]                 "que està de part"
5. [DETALL EXTRA]        "i ningú més podia anar"
6. [HORA SORTIDA]        "Sortim a les 22:00"
7. [RUTA/DURADA]         "Volem tornar a les 23:30"
8. [CONFIRMACIÓ]         "Així ho vam jurar tots"
```

**Per a grups de 4 jugadors:** es distribueixen 2 frases per jugador (frases 1-2, 3-4, 5-6, 7-8)

**Per a grups de 8 jugadors:** es distribueix 1 frase per jugador (frases 1-8)

**Per a grups de 5-7 jugadors:** es distribueixen dinàmicament, alguns jugadors reben 1 frase, altres reben 2.

---

## 📱 Pantalles

### Pantalla Salvaconducte (Privada per Jugador)

Aquesta pantalla es mostra **només** al jugador del seu mòbil, privat:

```
╔════════════════════════════════════════════╗
║                                            ║
║          SALVACONDUCTE DE L'EMISSARI       ║
║                                            ║
║     Memòria la teva frase exactament:      ║
║                                            ║
║  ┌──────────────────────────────────────┐  ║
║  │                                      │  ║
║  │    "Anem a buscar..."                │  ║
║  │                                      │  ║
║  └──────────────────────────────────────┘  ║
║                                            ║
║     Quan l'Emissari et pregunti,          ║
║     respon amb aquesta frase.             ║
║                                            ║
║     No la canviis, no la tradueixis,      ║
║     i no la passis a ningú.               ║
║                                            ║
║     Si tots diu el mateix, passareu.      ║
║                                            ║
║              [HE MEMÒRIA]                 ║
║                                            ║
╚════════════════════════════════════════════╝
```

**Estil visual:**
- Font gran (1.5em)
- Fons diferent (blau fosc, per destacar que és privada)
- Caixa central amb la frase
- Text motivacional
- Botó "HE MEMÒRIA" (confirma que ha llegit)

---

## 📊 Coartades Predefinides

### Sistema de Generació

Cada coartada es **genera dinàmicament** per equip. Hi ha **5 plantilles** de coartades amb variables:

#### Plantilla 1: Llevadora (Tipus A)

```
1. "Anem a buscar"
2. "la llevadora"
3. "de l'Hostal"
4. "que està de part"
5. "i necessita ajuda ja"
6. "sortim a les 22:00"
7. "volem tornar a les 23:30"
8. "és la veritat i la juramentarem"
```

#### Plantilla 2: Medicament (Tipus B)

```
1. "Anem a portar"
2. "medicament"
3. "al Pagès de la Farga"
4. "que té febre alta"
5. "i podia morir si no l'ajudem"
6. "sortim a les 21:30"
7. "esperem ser de volta a les 23:00"
8. "tots hi estem d'acord i ho juramentarem"
```

#### Plantilla 3: Avisar Rector (Tipus C)

```
1. "Anem a avisar"
2. "el Rector"
3. "al cementiri"
4. "perquè ha mort el vell Josep"
5. "i no pot esperar fins demà"
6. "sortim a les 22:15"
7. "pensem tornar a les 23:15"
8. "és el que havíem decidit i juramentarem"
```

#### Plantilla 4: Buscar Persona Perduda (Tipus D)

```
1. "Anem a buscar"
2. "en Jaume"
3. "que es va perdre al bosc"
4. "fa dues hores que l'estem buscant"
5. "i la seva mare està desesperada"
6. "sortim a les 21:00"
7. "volem estar de volta a les 23:45"
8. "tothom ho sap i ho juramentarem"
```

#### Plantilla 5: Requerir Mestre (Tipus E)

```
1. "Anem a buscar"
2. "el Mestre"
3. "que viu al Paller"
4. "perquè cal que revisi la casa"
5. "hi ha una gotellada que no pot esperar"
6. "sortim a les 22:30"
7. "serem de volta a les 23:15"
8. "és una emergència i juramentarem"
```

### Selecció de Plantilla

**Per a cada equip:**
1. El servidor **selecciona una plantilla aleatòria** (1-5)
2. Pot **variar alguns detalls menors** (noms, hores) per fer-la més personal
3. **Distribueix les 8 frases** entre els jugadors del grup

---

## 🖱️ Interactivitat

### Flux a la Webapp

```javascript
// 1. Equip inicia partida
// 2. Servidor genera coartada per equip
// 3. Servidor distribueix frases entre jugadors
// 4. Cada jugador veu Pantalla Salvaconducte amb la seva frase
// 5. Jugadors cliquen "HE MEMÒRIA"
// 6. Pantalla es tanca, es mostra Hub (esperant l'Emissari)
// 7. Màster llegeix les frases del coartada (a app màster)
// 8. Emissari interroga en viu
// 9. Màster valida respostes (manual o semiautomàtic)
// 10. Registra si han perdut salconduit
// 11. Passen al Pla de Masset
```

### Pantalla App del Màster (Master View)

Quan el màster ariba al Pla de Masset, veu:

```
┌─────────────────────────────────────┐
│ CONTROL DE L'EMISSARI               │
├─────────────────────────────────────┤
│                                     │
│ EQUIP: Los Jugadores               │
│ JUGADORS: 4                         │
│                                     │
│ COARTADA (Plantilla 1: Llevadora)   │
│ ─────────────────────────────────   │
│                                     │
│ Jugador 1: "Anem a buscar"          │
│ Jugador 2: "la llevadora"           │
│ Jugador 3: "de l'Hostal"            │
│ Jugador 4: "que està de part"       │
│                                     │
│ [Següent frase ▶]                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ VALIDACIÓ:                      │ │
│ │ ☐ Tots responen igual          │ │
│ │ ☑ Algú dubta                   │ │
│ │ ☐ Contradiuen (≥2 versions)    │ │
│ │                                 │ │
│ │ [−1 SALCONDUCTE] [PASSAR]      │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## 📊 Dades (Backend)

### Estructura de Coartada

```javascript
const COARTADAS = {
  A: {
    type: "llevadora",
    template: [
      "Anem a buscar",
      "la llevadora",
      "de l'Hostal",
      "que està de part",
      "i necessita ajuda ja",
      "sortim a les 22:00",
      "volem tornar a les 23:30",
      "és la veritat i la juramentarem"
    ]
  },
  B: { /* ... */ },
  C: { /* ... */ },
  D: { /* ... */ },
  E: { /* ... */ }
};

// Generació per equip
function generateCoartada(teamId, playerCount) {
  const selectedType = ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)];
  const coartada = COARTADAS[selectedType].template;
  const distribution = distributeFrases(coartada, playerCount);
  
  return {
    teamId,
    type: selectedType,
    frases: coartada,
    distribution: distribution // { playerId: [frase_index, ...], ... }
  };
}

// Distribució de frases entre jugadors
function distributeFrases(frases, playerCount) {
  const distribution = {};
  const fracesPerJugador = Math.ceil(frases.length / playerCount);
  
  for (let i = 0; i < playerCount; i++) {
    const start = i * fracesPerJugador;
    const end = Math.min(start + fracesPerJugador, frases.length);
    distribution[`player_${i}`] = frases.slice(start, end);
  }
  
  return distribution;
}
```

### Score Events

```javascript
{
  team_id: "abc123",
  station_id: "pla-masset-control",
  type: "CONTROL",
  control_passed: true,
  salconduits_lost: 0,
  coartada_type: "A",
  player_count: 4,
  event_at: "2025-05-15T23:25:45Z"
}
```

---

## 💡 Dinàmica de Validació (Màster)

### Preguntes de l'Emissari (Ejemples)

Segons el tipus de coartada, l'Emissari pregunta:

**Tipo A (Llevadora):**
- "On aneu tants?" → Esperada: "Anem a buscar la llevadora de l'Hostal"
- "Per quin motiu?" → Esperada: "Que està de part"
- "A quina hora sortiu?" → Esperada: "Sortim a les 22:00"

**Tipo B (Medicament):**
- "Qui us enviat?" → Esperada: "Anem a portar medicament al Pagès de la Farga"
- "Quina és la situació?" → Esperada: "Que té febre alta"
- "Quan penseu tornar?" → Esperada: "Esperem ser de volta a les 23:00"

### Validació del Màster

El màster escolta i marca:

1. **Tots responen igual:** ✓ Passen sense penalització
2. **Algú dubta o demana ajuda:** −1 Salconducte, passen
3. **Contradiuen (≥2 versions diferents):** −1 Salconducte, passen
4. **Riu o perd el focus:** −1 Salconducte, passen

**Criteris:**
- Generós amb infants i grups joves
- Estricte amb qui es burla o treu el mòbil
- Accepta variacions menors de pronunciació o ordre (p.ex., "de l'Hostal, la llevadora")
- Requereix que **totes les respostes siguin coherents** entre jugadors

---

## 🛠️ Checklist de Desenvolupament

### Front-end

- [ ] Pantalla Salvaconducte (privada, font gran, botó HE MEMÒRIA)
- [ ] Responsive: mòbil, tablet
- [ ] Animació de tancament suau
- [ ] Hub esperant (mentre s'espera Emissari)

### Backend

- [ ] Generar coartada per equip (tipus A-E aleatori)
- [ ] Distribuir frases entre jugadors dinàmicament
- [ ] Servir frase privada per jugador (verificació de permissos)
- [ ] Pantalla màster (veu coartada sencera + validació)
- [ ] Registrar validació (passed, salconduits_lost)
- [ ] Registrar score event
- [ ] **NO penalitza punts**, només salconduits

### QA

- [ ] Testejar amb 4, 5, 6, 7, 8 jugadors
- [ ] Testejar que cada jugador veu NOMÉS la seva frase
- [ ] Testejar que màster veu la coartada sencera
- [ ] Testejar distribució equilibrada de frases
- [ ] Testejar que un jugador no pot veure frases d'altri
- [ ] Testejar validació manual del màster
- [ ] Testejar que els salconduits es decrenten correctament

---

## 📈 Mètriques Estimades

| Mètrica | Valor |
|---------|-------|
| Temps joc | 2–3 min |
| Durada implementació | 4–6 h |
| Pantalles | 2 (Salvaconducte + Hub) |
| Coartades plantilla | 5 (A-E) |
| Frases per coartada | 8 |
| Grups de jugadors | 4–8 |
| Dificultat | 1–2/5 |
| Penalitzacions | Salconduits (−1), no punts |

---

## 📝 Notes Adicionals

### Privacitat de Frases

**CRÍTIC:** La frase d'un jugador **NO pot ser visible** per a altres jugadors del seu grup. Això és essencial perquè:
1. Els jugadors no es copien entre ells
2. Cada un ha de memoritzar i confiar en els altres
3. Si algú veu la frase d'altri, pot canviar-la

**Implementació:** 
- La Pantalla Salvaconducte només es mostra al jugador del seu mòbil
- Backend valida que `teamId` i `playerId` coincideixin amb la petició
- Si algú intenta llegir frase d'altri: retorna error 403

### Variabilitat de Hores

Cada coartada pot tenir **hores lleument variables** per equip (p.ex., ±15 minuts) per a realisme. Però tots els jugadors del mateix equip veuen les **mateixes hores**.

### No és Blocant

L'Emissari sempre deixa passar. Els salconduits perduts es marquen per a l'Acte III (pica-paret amb fanal), però no bloquegen el flux.

---

**Status:** Llest per desenvolupar. Contactar si hi ha dubtes.
