# Joc 7+8: Caixa de les Almoines + Sometent — Document de Desenvolupament

**Ubicacions:** Rectoria (física) + Campanar (física/webapp)  
**Versió:** 1.0 (Caixa + Carta + Sometent combinats)  
**Estat:** Llest per codificar  
**Durada:** 10–15 min (part física + webapp)  
**Dificultat:** 2–3/5  
**Tipus:** Puzzle + Rol + Decisió moral

---

## 📋 Estructura General

### Component Principal
```
components/games/CaixaAlmoines.tsx
├─ Part 1: Obrir la Caixa (1 input: codi)
├─ Part 2: Canvi de la Carta (webapp: visualitzar, robar, substituir)
└─ Part 3: Sometent + Decisió Moral (contrasenya + escollit moral)
```

### State Management
```javascript
interface CaixaState {
  currentPart: 1 | 2 | 3;
  unlockedParts: number[];
  inputs: {
    gameCode: string;
    selectedCardDate: string | null; // data de la carta substituta
    moralChoice: "A" | "B" | null;
  };
  stolenCards: string[]; // dates de cartes robades
  errors: string[];
  attempts: number;
  score: number;
}
```

### Ubicació App
```
app/(player)/joc/caixa-almoines/
├─ page.tsx
├─ components/
│  ├─ Part1-OpenBox.tsx
│  ├─ Part2-ChangeCard.tsx
│  └─ Part3-Sometent.tsx
└─ lib/
   ├─ validation.ts
   └─ constants.ts
```

---

## 🎮 Part 1: Obrir la Caixa

### Narrativa

```
[ÀUDIO RECTOR - Feble, esgotat]

"La clau... la vaig llençar a la foscor.
Entre el Pla i la Rectoria.

Descobrireu la caixa de les almoines.
Dins trobareu la carta original.

Però necessiteu la CONTRASENYA dels 4 elements
per obrir-la."
```

---

### Pantalla 1: Obrir la Caixa

```
╔════════════════════════════════════════════╗
║                                            ║
║         CAIXA DE LES ALMOINES              ║
║         ════════════════════════            ║
║                                            ║
║  [IMATGE: Caixa antigua de fusta]          ║
║                                            ║
║  La caixa està segellada amb cadenat.      ║
║  Necessites la CONTRASENYA dels 4 elements.║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  Recorda els 4 elements de les estacions   ║
║  que vas investigar:                       ║
║                                            ║
║  CIM (Serrat)      = 4 (FOC)               ║
║  FONT (Font Ferro) = 2 (AIGUA)             ║
║  PLA (Planes Bones)= 3 (TERRA)             ║
║  PEDRA (Cementiri) = 1 (PEDRA)             ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  CONTRASENYA (4 xifres):                  ║
║  ┌────────────────────────────────────┐   ║
║  │ [_] [_] [_] [_]                    │   ║
║  │                                    │   ║
║  │ Forma: 4231 o 4 2 3 1             │   ║
║  └────────────────────────────────────┘   ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║           [OBRIR]                         ║
║           [PISTA (−5)]                    ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Validació (Part 1)

```javascript
const GAME_CODE = "4231"; // o "4-2-3-1", "4 2 3 1"

function validatePart1(inputs) {
  // Validar contrasenya (accepta spaces o guions)
  const normalizedCode = inputs.gameCode
    .replace(/[\s-]/g, "");
  
  if (normalizedCode !== GAME_CODE) {
    return { 
      valid: false, 
      error: "Contrasenya incorrecta. Repassa els 4 elements.", 
      penalty: -10 
    };
  }
  
  return { valid: true };
}
```

---

### Pantalla 1b: Obrir (Animació)

```
╔════════════════════════════════════════════╗
║                                            ║
║  🔓 OBRINT LA CAIXA...                    ║
║                                            ║
║  [Animació: caixa que s'obre gradualment]  ║
║  [Sons: Click, creak, cling de cadenat]    ║
║                                            ║
║  Espera 2-3 segons...                      ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 1c: Correcte ✅ (Desbloqueja Part 2)

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✓ CORRECTE!                               ║
║                                            ║
║  La caixa s'ha obert.                      ║
║                                            ║
║  Dins trobes:                              ║
║  📜 Carta original de BERNAT               ║
║  📜 Carta falsa del RECTOR                 ║
║  📝 Nota del CAPITÀ                        ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  NOTA DEL CAPITÀ:                         ║
║  "Els noms a trenc d'alba,                ║
║   i el vostre fill dorm a casa.           ║
║                                            ║
║   Qui porti la carta dirà:                ║
║   L'ALBA VE DE VIC"                      ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  [CONTINUAR A LA PART 2]                  ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 1d: Incorrecte ❌

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✗ CAIXA NO S'HA OBERT                    ║
║                                            ║
║  La contrasenya que has entrat no és       ║
║  correcta.                                 ║
║                                            ║
║  Recorda els 4 elements:                   ║
║  CIM (Serrat)     = 4                      ║
║  FONT (Font)      = 2                      ║
║  PLA (Planes)     = 3                      ║
║  PEDRA (Cementiri) = 1                     ║
║                                            ║
║  Prova: 4 2 3 1 (o 4231, o 4-2-3-1)      ║
║                                            ║
║  −10 punts                                 ║
║  Intent 1/3                                ║
║                                            ║
║           [PISTA (−5)]                    ║
║           [TORNAR A INTENTAR]             ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 📄 Part 2: Canvi de la Carta

### Narrativa

```
[VEUS DE FONS]

"Dins la caixa trobareu 6 cartes amb dates diferentes.

Una té la MATEIXA DATA que l'original (16-05-1705).
Aquesta carta té la firma i segell correctes de Bernat.
Les altres són falsificacions del Rector.

Buscau la carta amb la mateixa data que l'original.
Robau-la i substitueïu-la dins el sobre."
```

---

### Pantalla 2: Canvi de la Carta (Webapp)

```
╔════════════════════════════════════════════╗
║                                            ║
║  DINS LA CAIXA                             ║
║  ════════════════════════════               ║
║                                            ║
║  📬 SOBRE (orig. de Bernat)               ║
║     Data: 16-05-1705                       ║
║     [CLICAR PER OBRIR] → mostra carta      ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  6 CARTES SOLTES:                          ║
║                                            ║
║  📄 14-05 | 📄 15-05 | 📄 17-05            ║
║  📄 16-05 | 📄 13-05 | 📄 18-05            ║
║                                            ║
║  (Clica cada carta per veure détails)     ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  [PISTA (−5)]                             ║
║                                            ║
╚════════════════════════════════════════════╝
```

**Mecanica de Joc:**

1. **Clica SOBRE** → Pantalla 2b (mostra carta original)
2. **Clica CARTA** → Pantalla 2c (mostra carta + botó ROBAR)
3. **ROBAR CARTA** → s'afegeix a "Cartes robades" (es veu data)
4. **SUBSTITUIR** → Input: selecciona data de carta a substituir
5. Si data correcta (16-05) → Continua a Part 3
6. Si data incorrecta → Error, −2 min

---

### Pantalla 2b: Obrir el Sobre (Carta Original)

```
╔════════════════════════════════════════════╗
║                                            ║
║  SOBRE — CARTA ORIGINAL                    ║
║  ════════════════════════════               ║
║                                            ║
║  [IMATGE: Carta amb segell i firma]        ║
║                                            ║
║  Data: 16-05-1705                          ║
║  Signatura: Bernat                         ║
║  Segell: Ploma + Clau ✓                    ║
║                                            ║
║  Contingut:                                ║
║  "Al Capità... els noms a l'alba..."      ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  [TANCAR]                                  ║
║  [TORNAR A LA CAIXA]                       ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 2c: Veure Carta (una de les 6)

```
╔════════════════════════════════════════════╗
║                                            ║
║  CARTA — 16-05-1705                        ║
║  ════════════════════════════               ║
║                                            ║
║  [IMATGE: Carta amb segell i firma]        ║
║                                            ║
║  Data: 16-05-1705                          ║
║  Signatura: Bernat ✓                       ║
║  Segell: Ploma + Clau ✓                    ║
║                                            ║
║  Contingut:                                ║
║  "Al Capità... els noms a l'alba..."      ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  ⚠️ AQUESTA CARTA SEMBLA SOSPECHOSA       ║
║                                            ║
║           [ROBAR CARTA]                    ║
║           [TORNAR]                         ║
║                                            ║
╚════════════════════════════════════════════╝
```

(La carta 16-05 és la correcta, però totes les cartes es veuen igual en webapp)

---

### Pantalla 2d: Substituir Carta

```
╔════════════════════════════════════════════╗
║                                            ║
║  SUBSTITUIR CARTA                          ║
║  ════════════════════════════               ║
║                                            ║
║  Cartes robades:                           ║
║  ☑️ 14-05   ☑️ 15-05   ☑️ 17-05            ║
║  ☑️ 16-05   ☑️ 13-05   ☑️ 18-05            ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  Quina carta (data) substitueixes          ║
║  la del sobre (16-05-1705)?                ║
║                                            ║
║  ┌────────────────────────────────────┐   ║
║  │ [Dropdown: 14-05 / 15-05 / 17-05   │   ║
║  │           16-05 / 13-05 / 18-05]   │   ║
║  └────────────────────────────────────┘   ║
║                                            ║
║           [SUBSTITUIR]                    ║
║           [PISTA (−5)]                    ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Dades de les 6 Cartes

```javascript
const ORIGINAL_CARD = {
  id: "original",
  date: "16-05-1705", // dins sobre
  signatura: "Bernat",
  segell: "ploma_clau", // Ploma + Clau
  contingut: "Carta de Bernat al Capità"
};

const FAKE_CARDS = [
  {
    id: 1,
    date: "14-05-1705",
    signatura: "Jaume",
    segell: "ploma_clau", // Ploma + Clau (signatura incorrecta!)
    correcte: false
  },
  {
    id: 2,
    date: "15-05-1705",
    signatura: "Bernat",
    segell: "clau_ploma", // Clau + Ploma invertit (segell incorrecte!)
    correcte: false
  },
  {
    id: 3,
    date: "17-05-1705",
    signatura: "Anton",
    segell: "ploma_clau", // Ploma + Clau (signatura incorrecta!)
    correcte: false
  },
  {
    id: 4,
    date: "16-05-1705", // MATEIXA DATA QUE ORIGINAL
    signatura: "Bernat",
    segell: "ploma_clau", // Ploma + Clau ✓
    correcte: true // ✓ ESTA ÉS!
  },
  {
    id: 5,
    date: "13-05-1705",
    signatura: "Jaume",
    segell: "ploma_sola", // Només Ploma (ambdós incorrectes!)
    correcte: false
  },
  {
    id: 6,
    date: "18-05-1705",
    signatura: "Anton",
    segell: "clau_ploma", // Clau + Ploma (ambdós incorrectes!)
    correcte: false
  }
];
```

---

### Validació (Part 2)

```javascript
const ORIGINAL_DATE = "16-05-1705";

function validatePart2(selectedDate) {
  if (selectedDate !== ORIGINAL_DATE) {
    return { 
      valid: false, 
      error: `Data incorrecta. Busca la carta amb la mateixa data que l'original.`,
      penalty: -120 // −2 minuts
    };
  }
  
  return { 
    valid: true, 
    message: "Carta correcta substituda dins el sobre"
  };
}
```

---

### Pantalla 2e: Correcte ✅ (Desbloqueja Part 3)

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✓ CARTA CORRECTA!                         ║
║                                            ║
║  La carta del 16-05-1705 (Bernat +         ║
║  Ploma+Clau) és la correcta.               ║
║                                            ║
║  L'has substituit dins el sobre.           ║
║  La carta original queda a la caixa.       ║
║                                            ║
║  Ara tens la CARTA FALSA PREPARADA         ║
║  per enganyar l'Emissari.                  ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  PRÒXIM PAS:                               ║
║                                            ║
║  Aneu a la PORTA DEL CAMPANAR.            ║
║                                            ║
║  Porteu l'SOBRE amb la carta substituta.  ║
║                                            ║
║  L'Emissari us demana la contrasenya.     ║
║  Resposta: "L'ALBA VE DE VIC"             ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  +100 punts                                ║
║                                            ║
║           [SEGUIR A LA PORTA]              ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 2f: Incorrecte ❌

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✗ CARTA INCORRECTA!                       ║
║                                            ║
║  La data que has escollit no és la del     ║
║  sobre original.                           ║
║                                            ║
║  Recorda:                                  ║
║  - Data de l'ORIGINAL: 16-05-1705         ║
║  - Firma: Bernat                           ║
║  - Segell: Ploma + Clau                    ║
║                                            ║
║  −2 min                                    ║
║  Intent 1/3                                ║
║                                            ║
║           [PISTA (−5)]                    ║
║           [TORNAR A INTENTAR]             ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 🔔 Part 3: Sometent + Decisió Moral

### Narrativa

```
[ÀUDIO BERNAT - Trencat, però digne]

"Vosaltres què hauríeu fet?

El meu fill pres. Només tenia una opció.
Però... vosaltres heu salvat el Pacte.

Ara... quin fate em doni?"
```

---

### Pantalla 3: Entrada Campanar

```
╔════════════════════════════════════════════╗
║                                            ║
║         PORTA DEL CAMPANAR                 ║
║         ════════════════════════            ║
║                                            ║
║  [L'Emissari està aquí, amb fanal]         ║
║                                            ║
║  Emissari: "Qui va? On aneu?"              ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  [INPUT TEXT]                             ║
║  Introduir CONTRASENYA:                    ║
║  ┌────────────────────────────────────┐   ║
║  │ [________________]                 │   ║
║  │ (Expected: "L'ALBA VE DE VIC")    │   ║
║  └────────────────────────────────────┘   ║
║                                            ║
║           [ENTREGAR CARTA]                ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 3b: L'Emissari Accepta la Carta

```
╔════════════════════════════════════════════╗
║                                            ║
║  [L'Emissari examina la carta]             ║
║                                            ║
║  [SILENCI... 3 segons]                     ║
║                                            ║
║  Emissari: "Està bé. Ja l'ha tocada       ║
║            massa gent. Se la quedo."       ║
║                                            ║
║  [S'aparta, guardant l'sobre]              ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  [ÀUDIO BERNAT - Feble, esmaperdut]        ║
║                                            ║
║  "Sé per on vénen els dragons.            ║
║   Us ho dic si em deixeu anar              ║
║   a buscar el meu fill.                    ║
║                                            ║
║   Vosaltres... què hauríeu fet?"           ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  ⏱️ COMPTE ENRERE: 60 SEGONS               ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 3c: Decisió Moral

```
╔════════════════════════════════════════════╗
║                                            ║
║  DECISIÓ MORAL                             ║
║  ═════════════════════════════              ║
║                                            ║
║  Bernat espera la resposta...              ║
║                                            ║
║  Quin és el teu veredicte?                 ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  OPCIÓ A: ACCEPTAR TRACTE                 ║
║  ┌────────────────────────────────────┐   ║
║  │ "Dons el camí als dragoons.        │   ║
║  │ Deixa que fugis a buscar            │   ║
║  │ el teu fill."                       │   ║
║  │                                     │   ║
║  │ → Els conjurats fugen salvos        │   ║
║  │ → Bernat fuig amb Jaume             │   ║
║  │ → No toquen el sometent             │   ║
║  │ → FINAL A (Moral: Compassió)        │   ║
║  └────────────────────────────────────┘   ║
║                                            ║
║  OPCIÓ B: REBUTJAR TRACTE                 ║
║  ┌────────────────────────────────────┐   ║
║  │ "No. Toquem el sometent             │   ║
║  │ sense saber el camí segur.          │   ║
║  │ Bernat, estás detingut."            │   ║
║  │                                     │   ║
║  │ → Els conjurats fugen pels pèls     │   ║
║  │ → Bernat queda tancat               │   ║
║  │ → Jaume surt de presó però el       │   ║
║  │   pare no és a l'escola             │   ║
║  │ → FINAL B (Moral: Justicia)         │   ║
║  └────────────────────────────────────┘   ║
║                                            ║
║  ⏱️ TEMPS: 45 SEGONS                      ║
║                                            ║
║           [OPCIÓ A]        [OPCIÓ B]       ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 3d: Sometent Final

```
╔════════════════════════════════════════════╗
║                                            ║
║  🔔 SONA EL SOMETENT 🔔                    ║
║                                            ║
║  [SÓN DE CAMPANA: DONG... DONG... DONG]    ║
║                                            ║
║  Els conjurats de Sant Sebastià            ║
║  senten el senyal.                         ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  [Si OPCIÓ A:]                             ║
║  Els dragoons arriben tard.                ║
║  Els conjurats fugen pel camí segur        ║
║  que Bernat els ha indicat.                ║
║                                            ║
║  [Si OPCIÓ B:]                             ║
║  Els dragoons arriben ràpid.               ║
║  Els conjurats se'n surten pels pèls.      ║
║  Bernat queda tancat al mas.               ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  L'Emissari entén que l'ha enganyat        ║
║  i fuig apressadament.                     ║
║                                            ║
║           [RÀNQUING FINAL]                 ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Pantalla 3e: Pantalla Final (Rànquing)

```
╔════════════════════════════════════════════╗
║                                            ║
║         🔔 CAMPANA DE L'ALBA 🔔             ║
║                                            ║
║  RÀNQUING FINAL D'EQUIPS                   ║
║  ═════════════════════════════              ║
║                                            ║
║  1. EQUIP XYZ — 485 punts ⭐⭐⭐            ║
║  2. EQUIP ABC — 430 punts ⭐⭐              ║
║  3. EQUIP DEF — 380 punts ⭐                ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  LA VOSTRA DECISIÓ:                        ║
║                                            ║
║  [Si OPCIÓ A - Compassió:]                 ║
║  "Bernat i Jaume es reuniren a l'estiu.   ║
║   No tornaren mai més a la Guixa.          ║
║                                            ║
║   Però els conjurats van salvos."          ║
║                                            ║
║  [Si OPCIÓ B - Justicia:]                  ║
║  "Jaume surt de presó tardor.              ║
║   Busca el seu pare a l'escola.            ║
║   No el troba.                             ║
║                                            ║
║   Els conjurats es salvaren.               ║
║   Però al preu de la familia de Bernat."   ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  PERCENTATGE D'EQUIPS:                     ║
║  Opció A (Compassió): 55%                  ║
║  Opció B (Justicia): 45%                   ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  "Aquella nit els vau salvar.              ║
║   La història no els va salvar             ║
║   per sempre."                             ║
║                                            ║
║           [FINAL DE LA PARTIDA]            ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## 📊 Dades (Backend)

### Estructura de Dades

```javascript
const CAIXA_CONSTANTS = {
  gameCode: "4231", // accepta spaces/guions
  originalCardDate: "16-05-1705",
  emissariPassword: "L'ALBA VE DE VIC"
};

interface Part3Decision {
  teamId: string;
  choice: "A" | "B"; // Compassió vs Justicia
  timestamp: Date;
  finalScore: number;
}
```

### Score Events

```javascript
{
  team_id: "abc123",
  station_id: "caixa-almoines",
  type: "SOLVED",
  
  // Part 1
  part1_attempts: 1,
  traitor_name_correct: true,
  game_code_correct: true,
  
  // Part 2
  part2_attempts: 1,
  seal_selected: "A",
  seal_correct: true,
  
  // Part 3
  moral_choice: "A", // o "B"
  time_remaining_part3: 45, // segons
  
  // Final
  solved_at: "2025-05-16T04:00:00Z",
  total_duration: 900, // segons
  final_score: 285,
  evidence_unlocked: "evidence_final_decision",
  
  points_awarded: 100
}
```

---

## 💡 Pistes

| Part | Cost | Text |
|------|------|------|
| 1 | −5 | "Els 4 elements de les 4 estacions = les 4 xifres" |
| 2 | −5 | "El segell correcte és el que coincideix amb la carta original" |
| 3 | −5 | "Vosaltres... quin fate en doni al traïdor?" |

---

## 🛠️ Checklist de Desenvolupament

### Front-end

- [ ] Component `CaixaAlmoines.tsx` (3 parts)
- [ ] Part 1 (Obrir caixa)
  - [ ] 2 inputs (nom + codi)
  - [ ] Validació client side (format)
  - [ ] Botó [OBRIR]
  - [ ] Animació obertura
  - [ ] Pantalla correcte/incorrecte
- [ ] Part 2 (Carta falsa)
  - [ ] Mostrar sobre (icona) + 6 cartes (icones amb dates)
  - [ ] Clica sobre → mostra carta original amb data 16-05-1705
  - [ ] Clica carta → mostra carta (signatura + segell + data)
  - [ ] Botó "Robar carta" per cada carta
  - [ ] Pantalla de substitució (dropdown amb dates robades)
  - [ ] Validació: data seleccionada = 16-05-1705
- [ ] Part 3 (Sometent + Decisió)
  - [ ] Emissari deu contrasenya
  - [ ] Input contrasenya
  - [ ] Emissari verifica segell
  - [ ] Bernat ofereix tracte
  - [ ] 2 botons decisió moral
  - [ ] Compte enrere (60 seg)
  - [ ] Somenyent (àudio + animació)
  - [ ] Pantalla final rànquing
- [ ] Cronometre (compte enrere Part 3)
- [ ] Responsive (mòbil, tablet)

### Backend

- [ ] Validar Part 1: nom traïdor + codi
  - [ ] Endpoint POST /game/caixa-almoines/part1
  - [ ] Retorna correcte/incorrecte + penalty
- [ ] Validar Part 2: segell correcte
  - [ ] Endpoint POST /game/caixa-almoines/part2
  - [ ] Retorna correcte/incorrecte + penalty (−2 min)
- [ ] Validar Part 3: contrasenya + decisió moral
  - [ ] Endpoint POST /game/caixa-almoines/part3
  - [ ] Retorna correcte/incorrecte
  - [ ] Registra decisió moral (A o B)
  - [ ] Registra temps restant
  - [ ] Calcula punts finals
- [ ] Registrar score event
- [ ] Desbloquear evidència final
- [ ] Actualitzar rànquing global

### QA

- [ ] Testejar Part 1: accepta "4231", "4-2-3-1", "4 2 3 1"
- [ ] Testejar Part 1: rebutja altres codis (error −10)
- [ ] Testejar Part 2: es veuen les 6 cartes amb dates
- [ ] Testejar Part 2: clica sobre mostra carta original (16-05)
- [ ] Testejar Part 2: clica cada carta mostra signatura + segell + data
- [ ] Testejar Part 2: botó "Robar" afegeix data a dropdown
- [ ] Testejar Part 2: dropdown només mostra cartes robades
- [ ] Testejar Part 2: data correcta (16-05) desbloqueja Part 3
- [ ] Testejar Part 2: data incorrecta (altres) dona error −2 min
- [ ] Testejar Part 3: contrasenya correcta és "L'ALBA VE DE VIC"
- [ ] Testejar Part 3: compte enrere funciona (60 seg)
- [ ] Testejar Part 3: timeout → FINAL B (default)
- [ ] Testejar decisió moral A: text specific (compassió)
- [ ] Testejar decisió moral B: text specific (justicia)
- [ ] Testejar rànquing final (percentatge)
- [ ] Testejar que no es pot saltar parts

---

## 📈 Mètriques

| Mètrica | Valor |
|---------|-------|
| Durada total | 12–18 min |
| Durada Part 1 | 2–3 min |
| Durada Part 2 | 5–8 min (buscar + robar + substituir) |
| Durada Part 3 | 5–8 min (decisió moral) |
| Punts máxim | 100 |
| Dificultat | 2–3/5 |
| Pantalles | 12 (1-1b-1c-1d-2-2b-2c-2d-2e-2f-3-3b-3c-3d-3e) |

---

**Status:** Llest per desenvolupar. Revisar estructura de Part 3 quan estigui complet.
