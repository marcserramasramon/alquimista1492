# JSON Schema — El Traïdor de la Guixa

Plantilles i especificació per a tota la configuració del joc en JSON.

**Objectiu:** Estructura agnòstica que permeti reutilitzar components genèrics per a qualsevol joc d'escape room.

---

## Visió General

Un joc es defineix per 5 fitxers JSON:

| Fitxer | Contingut | Visible Client? | Format |
|--------|-----------|-----------------|--------|
| `game-config.json` | Meta: títol, durada, actes | ✅ | Pública |
| `narrative.json` | Trama, personatges, diàlegs | ✅ | Pública |
| `stations.json` | Els 9 jocs amb paràmetres | ✅ | Pública |
| `evidence.json` | Evidències i desbloqueigs | ✅ | Pública |
| `solutions.json` | Respostes vàlides | ❌ | **Server-only** |

**Ubicació:**
```
content/games/traidor-guixa/
├── game-config.json
├── narrative.json
├── stations.json
├── evidence.json
└── private/
    └── solutions.json
```

---

## 1. `game-config.json`

**Propòsit:** Metadades del joc: títol, durada, estructura d'actes, configuració general.

**Camps Obligatoris:**
- `id` (string): Identificador únic (ex: `traidor-guixa`)
- `title` (string): Nom del joc
- `year` (number): Any de la trama
- `duration_minutes` (number): Durada estimada total
- `acts` (array): Array d'actes amb estacions

**Exemple complet:**
```json
{
  "id": "traidor-guixa",
  "title": "El Traïdor de la Guixa",
  "subtitle": "Escape room exterior a Sentfores–La Guixa",
  "year": 1705,
  "duration_minutes": 90,
  "difficulty": "3/5",
  "location": {
    "name": "La Guixa, Osona",
    "region": "Catalunya"
  },
  "acts": [
    {
      "number": 1,
      "name": "Investigació",
      "description": "Els jugadors visiten 4 estacions en ordre lliure",
      "stations": [
        "serrat-bruixes",
        "font-ferro",
        "planes-bones",
        "cementiri"
      ],
      "prerequisites": []
    },
    {
      "number": 2,
      "name": "Traïció",
      "description": "El gir de la trama: descobriment del traïdor",
      "stations": [
        "pla-masset-control",
        "pla-masset-accusation"
      ],
      "prerequisites": ["all_act1_stations_solved"]
    },
    {
      "number": 3,
      "name": "Alba",
      "description": "Fase final: engany, decisió moral, sometent",
      "stations": [
        "rectoria-caixa",
        "campanar-sometent"
      ],
      "prerequisites": ["bernat_accused"]
    }
  ],
  "themes": ["mystery", "historical", "moral_choice"],
  "language": "ca",
  "author": "Marc Serra Masramon",
  "version": "1.0.0",
  "created": "2026-09-16"
}
```

**Notas:**
- `acts[].stations` és array d'IDs de `stations.json`
- `acts[].prerequisites` ajuda engine a controlar flux (opcional per a Traïdor, important per a Joc 2)

---

## 2. `narrative.json`

**Propòsit:** Trama narrativa, personatges, diàlegs, finals.

**Estructura Principal:**
- `characters` (array): Tots els personatges amb rol, veu, diàlegs
- `timeline` (array): Events importants de la trama
- `epilogues` (array): Els 2 finals + text
- `lore` (object): Context històric, motivacions secretes

**Exemple: Un Personatge (Bernat)**
```json
{
  "id": "bernat",
  "name": "Bernat",
  "fullName": "Bernat, Mestre d'Escola de la Guixa",
  "role": "traitor",
  "born": 1664,
  "description": "Vidu, respectat, educat. Té un fill pres a Vic.",
  "motivation": "Salvar el seu fill en Jaume a canvi dels noms dels conjurats.",
  "secret": "S'ha posat a la llista de sospitosos per semblar innocent.",
  "voice": {
    "actor": "TBD",
    "audioFile": "audio/bernat/voice.mp3",
    "tone": "Educat, càlid, cansat. Paternal amb els joves."
  },
  "dialogue": {
    "act1_introduction": "Confio en vosaltres. Jo ja no tinc cames per córrer.",
    "act1_redirection": "Ho sabia. Aquell foraster no m'ha agradat mai.",
    "act2_revelation": "Vosaltres què hauríeu fet?",
    "act3_final_question": "Sabeu per on vénen els dragons..."
  },
  "evidence_against": [
    "evidence_firebeacons",
    "evidence_water_ledger",
    "evidence_seal",
    "evidence_school_light",
    "evidence_calligraphy",
    "evidence_watermark"
  ],
  "appearsInActs": [1, 2, 3]
}
```

**Estructura Completa:**
```json
{
  "characters": [
    { /* Bernat com a damunt */ },
    { /* Mossèn Ramon */ },
    { /* L'Emissari */ },
    { /* Anton */ },
    { /* Pere del Molí */ },
    { /* Joan */ },
    { /* Marianna */ },
    { /* Isidre */ }
  ],
  "timeline": [
    {
      "date": "1705-05-15",
      "time": "Tarde",
      "event": "Bernat va a Vic a tancar el tracte amb el Capità",
      "actor": "bernat",
      "visibility": "hidden_until_act2"
    },
    {
      "date": "1705-05-15",
      "time": "Nit",
      "event": "Bernat torna i escriu la carta a l'escola",
      "actor": "bernat",
      "visibility": "hidden_until_act2"
    }
  ],
  "epilogues": [
    {
      "id": "accept_deal",
      "condition": "player_accepts_bernat_offer",
      "title": "Epíleg A: Compassió",
      "text": "A la tardor, quan Vic canvia de mans, obren les presons. En Jaume surt i troba el seu pare esperant-lo a la porta. Bernat no torna mai més a la Guixa.",
      "moral_weight": "compassionate",
      "historical_consequence": "Bernat desapareix, en Jaume es salva."
    },
    {
      "id": "reject_deal",
      "condition": "player_rejects_bernat_offer",
      "title": "Epíleg B: Justícia",
      "text": "A la tardor, en Jaume surt de la presó. Busca el seu pare a l'escola i no el troba.",
      "moral_weight": "justice",
      "historical_consequence": "Bernat queda tancat fins al final de la guerra."
    }
  ],
  "lore": {
    "historical_context": "Guerra de Successió Espanyola. Felip V és rei fa 4 anys. Catalunya resisit.",
    "pact_of_vigatans": "Pacte secret a l'ermita de Sant Sebastià el 17 de maig. Si se signa, Catalunya entra a la guerra per a l'Arxiduc Carles.",
    "captain_motivation": "El Capità de Vic vol els noms dels conjurats per encerclar Sant Sebastià a l'alba.",
    "jaume_backstory": "Jaume, fill de Bernat, de 19 anys. Pres a la guarnició de Vic per portar armes. El Capità l'usa com a palanca."
  }
}
```

**Notas:**
- `dialogue` té claus que l'engine pot cridar (ex: `act1_introduction`)
- `evidence_against` és array d'IDs de `evidence.json`
- `epilogues` controlats per la decisió moral del jugador (Joc 8)

---

## 3. `stations.json`

**Propòsit:** Definir cada estació/joc amb mecànica, paràmetres, validació, pistes.

**Estructura d'Una Estació:**
```json
{
  "id": "serrat-bruixes",
  "number": 1,
  "act": 1,
  "name": "Serrat de les Bruixes",
  "subtitle": "El Codi de Fogueres",
  "description": "Els vigies dels turons es passen avisos amb fogueres.",
  
  "type": "polybiusSquare",
  "difficulty": 2,
  "estimatedTime": 8,
  
  "params": {
    "gridSize": 5,
    "alphabet": "ABCDEFGHIJLMNOPQRSTUVXZÇ·",
    "messageKey": "variants.A.firebeaconMessage",
    "sequenceKey": "variants.A.sequence"
  },
  
  "validation": {
    "method": "exactMatch",
    "fields": [
      {
        "name": "message",
        "type": "string",
        "case_sensitive": false,
        "trim_whitespace": true,
        "solution_key": "solutions.serrat-bruixes.messageVariants.A"
      },
      {
        "name": "suspects_dismissed",
        "type": "array",
        "items": "string",
        "solution_key": "solutions.serrat-bruixes.dismissedSuspects"
      }
    ]
  },
  
  "hints": [
    {
      "level": 1,
      "cost": 0,
      "text": "Cada missatge són parells de fogueres.",
      "trigger": "on_first_hint"
    },
    {
      "level": 2,
      "cost": -2,
      "text": "El primer parell és una sola lletra: fila i columna.",
      "trigger": "on_second_hint"
    },
    {
      "level": 3,
      "cost": -5,
      "text": "La solució és: SAP DE LLETRA",
      "trigger": "on_third_hint"
    }
  ],
  
  "penalties": {
    "wrong_answer": -10,
    "timeout": -15,
    "per_hint": [0, -2, -5]
  },
  
  "rewards": {
    "solved": 100,
    "digit": 4,
    "evidence_unlock": ["evidence_firebeacons"],
    "suspects_dismissed": ["pere-moli", "joan"]
  },
  
  "prerequisite_stations": [],
  "prerequisite_conditions": [],
  
  "variants": {
    "A": {
      "message": "SAP DE LLETRA",
      "sequence": "4-3 · 1-1 · 3-5 / 3-1 · 3-1 · 1-5 · 4-4 · 4-2 · 1-1 + 4 fogueres",
      "dismissedSuspects": ["pere-moli", "joan"]
    },
    "B": {
      "message": "ESCRIU",
      "sequence": "1-5 · 4-3 · 1-3 · 4-2 · 2-4 · 4-5",
      "dismissedSuspects": ["pere-moli", "joan"]
    },
    "C": {
      "message": "LLEGEIX",
      "sequence": "3-1 · 3-1 · 1-5 · 2-2 · 1-5 · 2-4 · 5-2",
      "dismissedSuspects": ["pere-moli", "joan"]
    }
  },
  
  "physical_assets": {
    "sign": "cartells/serrat-bruixes.pdf",
    "qr_code": "qr/serrat-bruixes.svg",
    "illustration": "images/serrat-bruixes.png"
  },
  
  "narrative": {
    "introduction": "Els vigies parlen de nit amb fogueres.",
    "on_solve": "Has descobert que el delator sap escriure.",
    "on_fail": "La foguera no té sentit. Intenta-ho de nou."
  }
}
```

**Estructura Completa: Array de 9 Estacions**
```json
[
  { /* Serrat de les Bruixes */ },
  { /* Font del Ferro */ },
  { /* Planes Bones */ },
  { /* Cementiri */ },
  { /* Pla de Masset - Control */ },
  { /* Pla de Masset - Acusació */ },
  { /* Rectoria - Caixa */ },
  { /* Campanar - Sometent */ }
]
```

**Camps Clau:**
- `type`: Classe de joc (`polybiusSquare`, `dateCalculation`, `mapNavigation`, `textComparison`, `rolePlay`, etc.)
- `params`: Paràmetres específics del tipo de joc
- `validation.fields`: Quins camps s'han de validar al servidor
- `solution_key`: Path a `solutions.json` (ex: `solutions.serrat-bruixes.messageVariants.A`)
- `variants.A/B/C`: Valors que canvien per variant
- `rewards.digit`: La xifra que suma al codi final (4-2-3-1)

---

## 4. `evidence.json`

**Propòsit:** Definir les 10 evidències del quadern, quan es desbloquegen, i com ajuden a acusar.

**Estructura d'Una Evidència:**
```json
{
  "id": "evidence_firebeacons",
  "title": "Senyals dels vigies de la plana",
  "category": "investigation",
  "icon": "fire",
  
  "unlockedAt": {
    "station_id": "serrat-bruixes",
    "condition": "on_correct_solve"
  },
  
  "description": "Avisos de fogueres entre els turons de vigilància. Un informador dins de Vic ha confirmat que la carta del delator és de mà pròpia.",
  "visuals": {
    "image": "evidence/firebeacons.png",
    "illustration": "evidence/firebeacons-drawn.svg"
  },
  
  "clueAgainstCharacters": [
    {
      "character": "pere-moli",
      "strength": "strong",
      "reasoning": "Signa amb creu, no sap escriure"
    },
    {
      "character": "joan",
      "strength": "strong",
      "reasoning": "Signa amb creu, no sap escriure"
    }
  ],
  
  "clueAgainstTraitor": [
    {
      "character": "bernat",
      "strength": "medium",
      "reasoning": "Prova que el delator sap de lletra. Bernat és mestre i sap de lletra."
    }
  ],
  
  "validForAccusation": true,
  "accusationWeight": 0.3
}
```

**Estructura Completa: Array de 10 Evidències**
```json
[
  { /* Taula dels vigies */ },
  { /* Llibreta de torns */ },
  { /* Ruta patrulla */ },
  { /* Fragment i làpides */ },
  { /* Declaració rector */ },
  { /* Cal·ligrafia */ },
  { /* Nota capità */ },
  { /* Carta original */ },
  { /* Carta falsa */ },
  { /* Rima del codi */ }
]
```

**Camps Clau:**
- `unlockedAt`: Quan es desbloqueja (estació + condició)
- `clueAgainstCharacters`: Proves que descarten sospitosos
- `clueAgainstTraitor`: Proves que acusen Bernat
- `validForAccusation`: Si compta per a Joc 6 (acusació)
- `accusationWeight`: Quant pesa (0–1) per a validació

---

## 5. `solutions.json` (Server-Only)

**Propòsit:** Respostes vàlides, tokens, secrets. **Només al servidor, mai al client.**

**Ubicació:** `content/games/traidor-guixa/private/solutions.json`

**Estructura:**
```json
{
  "traitor": "bernat",
  "traitorId": "bernat",
  
  "stations": {
    "serrat-bruixes": {
      "type": "polybiusSquare",
      "messageVariants": {
        "A": "SAP DE LLETRA",
        "B": "ESCRIU",
        "C": "LLEGEIX"
      },
      "dismissedSuspects": ["pere-moli", "joan"],
      "digit": 4
    },
    
    "font-ferro": {
      "type": "dateCalculation",
      "waterRecollectionDay": {
        "A": "1705-05-12",
        "B": "1705-05-11",
        "C": "1705-05-13"
      },
      "dismissedSuspect": "marianna-hostal",
      "digit": 2,
      "waterskinCount": 2
    },
    
    "planes-bones": {
      "type": "mapNavigation",
      "blacksmithDeparture": {
        "A": "23:00",
        "B": "22:00",
        "C": "00:00"
      },
      "peasantSighting": {
        "A": "01:30",
        "B": "00:30",
        "C": "02:30"
      },
      "dismissedSuspect": "isidre-ferrer",
      "correctAnswer": {
        "A": "02:15",
        "B": "01:15",
        "C": "03:15"
      },
      "digit": 3
    },
    
    "cementiri": {
      "type": "textComparison",
      "stonestoneName": {
        "A": "Joseph Corminas",
        "B": "Maria Sarrat",
        "C": "Antoni Puch"
      },
      "tombstoneWrongSpelling": {
        "A": "Corminas",
        "B": "Sarrat",
        "C": "Puch"
      },
      "properSpelling": {
        "A": "Joseph Coromines",
        "B": "Maria Serrat",
        "C": "Antoni Puig"
      },
      "dismissedSuspect": "anton",
      "digit": 1
    },
    
    "pla-masset-accusation": {
      "correctTraitor": "bernat",
      "minEvidenceRequired": 3,
      "validEvidences": [
        "evidence_firebeacons",
        "evidence_water_ledger",
        "evidence_patrol_route",
        "evidence_tombstone",
        "evidence_calligraphy_sheet",
        "evidence_watermark",
        "evidence_seal"
      ]
    },
    
    "rectoria-caixa": {
      "codeParts": ["4", "2", "3", "1"],
      "correctSealOption": "A",
      "passwordPhrase": "L'alba ve de Vic"
    },
    
    "campanar-sometent": {
      "correctCode": "4-2-3-1",
      "rhyme": "Del cim baixa l'avís, a la font es fa la tinta, al pla vetlla la ronda i a la pedra dorm el nom.",
      "codeMeaning": {
        "4": "Serrat de les Bruixes (FOC)",
        "2": "Font del Ferro (AIGUA)",
        "3": "Planes Bones (TERRA)",
        "1": "Cementiri (PEDRA)"
      }
    }
  },
  
  "tokens": {
    "stationQRToken": "JWT_ALGO_HS256",
    "tokenExpiry": 60,
    "tokenSecret": "env:PASS_SECRET"
  },
  
  "scoring": {
    "stationSolved": 100,
    "wrongAnswer": -10,
    "hintPenalties": [0, -2, -5],
    "timeBonus": "5_points_per_minute_under_90",
    "moralChoiceBonus": "no_bonus_both_choices_equivalent"
  }
}
```

**Notas:**
- `solutions.ts` es importat amb `import 'server-only'` al servidor
- Client **mai** veu aquests valors
- Cada validació passa per server action que compara input vs `solutions.json`

---

## Flux de Carrega (Engine)

### 1. Al crear sessió:
```
1. Carrega game-config.json → engine sap estructura d'actes
2. Tria variant random (A/B/C)
3. Crea registre a BD amb variant_id
```

### 2. Al entrar a una estació (escaneja QR):
```
1. QR porta a /joc/[code]/s/[token]
2. Engine busca station_id del token
3. Carrega stations.json[station_id]
4. Obté type (ex: polybiusSquare)
5. Carrega component genèric: PolybiusGame.tsx
6. Component rep params + hints + evidences de JSON
```

### 3. Al resoldre joc:
```
1. Component envia resposta a servidor
2. Servidor carrega solutions.json
3. Valida contra solutions.stations[station_id][variant_id]
4. Si correcte: desbloqueja evidence.json evidence_ids
5. Afegeix digit al codi parcial
6. Actualitza BD
```

### 4. Al Joc 6 (Acusació):
```
1. Jugador acusa Bernat
2. Servidor valida: 3 proves de evidence.json amb validForAccusation=true
3. Si correcte: desbloqueja Joc 7 (rectoria)
4. Si incorrecte: +3 minuts penalització
```

---

## Exemple Complet: Serrat de les Bruixes

**`stations.json[0]`:**
```json
{
  "id": "serrat-bruixes",
  "type": "polybiusSquare",
  "params": { "gridSize": 5, "alphabet": "...", "messageKey": "variants.A.firebeaconMessage" },
  "hints": [ ... ],
  "rewards": { "digit": 4, "evidence_unlock": ["evidence_firebeacons"] }
}
```

**Component carrega:**
```tsx
// En PolybiusGame.tsx
const { messageKey } = stationParams;
const correctMessage = VARIANTS[variant][messageKey]; // "SAP DE LLETRA"
const hints = getHints("serrat-bruixes");

// Validació
validateAnswer(userMessage, correctMessage) {
  // Server call: POST /api/validate-answer
  // Servidor compara contra solutions.json
}
```

**Servidor valida:**
```ts
// /app/api/validate-answer/route.ts
import { SOLUTIONS } from 'content/private/solutions';
import 'server-only';

const expectedMessage = SOLUTIONS.stations["serrat-bruixes"].messageVariants[variant];
if (userMessage.trim().toUpperCase() === expectedMessage) {
  // Correcte
  await unlockEvidence(session_id, "evidence_firebeacons");
  return { success: true, digit: 4 };
}
```

---

## Validació i Testing

### Al cargar JSON al engine:
```ts
// lib/game-engine.ts
import gameConfig from 'content/games/traidor-guixa/game-config.json';
import stations from 'content/games/traidor-guixa/stations.json';
import evidence from 'content/games/traidor-guixa/evidence.json';
import narrative from 'content/games/traidor-guixa/narrative.json';

// Validar que totes les references creuades existeixen
validateGameConfig(gameConfig, stations, evidence, narrative);
// Errors: estació que no existeix, evidència sense desbloqueig, etc.
```

---

## Documentació per Reutilització (Joc 2)

Quando feu "Joc 2", seguiu la mateixa estructura:
```
content/games/joc-2/
├── game-config.json (adapteu títol, durada, actes)
├── narrative.json (nous personatges, nova trama)
├── stations.json (nous jocs, però reutilitzeu types)
├── evidence.json (noves evidències)
└── private/
    └── solutions.json (noves solucions)
```

Si necessiteu un `type` nou (ex: `codebreaking`):
1. Creeu component: `components/gameTypes/CodebreakingGame.tsx`
2. Afegiu a `type` enum a engine
3. Useu al stations.json del Joc 2

**Res de refactorització retroactiva.**

---

## Resum

| Fitxer | Propòsit | Exemple |
|--------|----------|---------|
| `game-config.json` | Meta + estructura actes | Traïdor: 3 actes, 90 min |
| `narrative.json` | Trama + personatges + diàlegs | 8 personatges, 2 finals |
| `stations.json` | 9 jocs amb mecànicas | Serrat: Polibi, hints, pistes |
| `evidence.json` | 10 evidències + desbloqueigs | Firebeacons desbloqueja Serrat |
| `solutions.json` | Respostes (servidor) | "SAP DE LLETRA" = correcte |

**Totes les references creuades passen per IDs:** `station_id`, `evidence_id`, `character_id`.

**Engine resol les references al runtime.**

---

## Pròxim Pas

Omplir els 5 fitxers JSON amb dades del Traïdor. Usar aquestes plantilles com a guia.

Estimació: 3–4 hores (és redacció estructurada, no programació).
