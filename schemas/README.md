# JSON Schemas — Plantilles per a Configuració del Joc

Aquesta carpeta conté 5 plantilles JSON que defineixen la estructura de qualsevol joc d'escape room.

## 📋 Fitxers

### 1. `game-config.schema.json`
**Propòsit:** Metadades generals del joc (títol, durada, estructura d'actes).

**Ubicació de dades reals:** `content/games/traidor-guixa/game-config.json`

**Camps clau:**
- `id` — Identificador únic (ex: `traidor-guixa`)
- `title` — Títol en català
- `acts[]` — Array d'actes amb estacions associades

**Exemple:** 90 minuts, 3 actes, 9 estacions totals.

---

### 2. `narrative.schema.json`
**Propòsit:** Trama, personatges, diàlegs i finals.

**Ubicació de dades reals:** `content/games/traidor-guixa/narrative.json`

**Camps clau:**
- `characters[]` — Array de 8 personatges (traïdor, aliats, sospitosos)
  - `id`, `name`, `role` (traitor/ally/suspect), `description`, `motivation`, `dialogue{}`
- `timeline[]` — Events narratius (opcional)
- `epilogues[]` — Els 2 finals (A: compassió, B: justícia)
- `lore{}` — Context històric

**Nota:** Els diàlegs es citen al gameplay (ex: `dialogue.act1_introduction` es mostra quan el personatge parla).

---

### 3. `stations.schema.json`
**Propòsit:** Els 9 jocs/estacions amb mecànicas, validació i pistes.

**Ubicació de dades reals:** `content/games/traidor-guixa/stations.json`

**Estructura:** Array de 9 objectes (un per estació).

**Camps clau per estació:**
- `id`, `number`, `name` — Identitat
- `type` — Classe de joc (`polybiusSquare`, `dateCalculation`, `mapNavigation`, `textComparison`, etc.)
- `difficulty` — 1–5
- `estimatedTime` — Minuts
- `params` — Paràmetres específics per a cada `type`
- `validation.fields[]` — Quins camps es validen (server-side)
- `hints[]` — 3 pistes amb costs (0, −2, −5)
- `rewards` — Punts, xifra, evidències desbloquejades
- `variants{A, B, C}` — Variants que canvien dades però no mecànica

**Exemple:**
```json
{
  "id": "serrat-bruixes",
  "type": "polybiusSquare",
  "params": {
    "gridSize": 5,
    "alphabet": "ABCDEFGHIJLMNOPQRSTUVXZÇ·"
  },
  "variants": {
    "A": { "message": "SAP DE LLETRA" },
    "B": { "message": "ESCRIU" }
  }
}
```

---

### 4. `evidence.schema.json`
**Propòsit:** Les 10 evidències del quadern que es desbloquegen al resoldre estacions.

**Ubicació de dades reals:** `content/games/traidor-guixa/evidence.json`

**Estructura:** Array de 10 objectes.

**Camps clau:**
- `id` — Identificador (`evidence_firebeacons`, etc.)
- `title` — Títol
- `category` — Tipus (investigation, suspect_profile, document, etc.)
- `unlockedAt` — Quan es desbloqueja (estació + condició)
- `description` — Text complet de l'evidència
- `clueAgainstCharacters[]` — Proves que descarten sospitosos
- `clueAgainstTraitor[]` — Proves que acusen Bernat
- `validForAccusation` — Si compta per a Jog 6 (acusació)

**Nota:** Cada evidència enllaça a personatges i estacions via IDs.

---

### 5. `solutions.schema.json` ⚠️ SERVER-ONLY
**Propòsit:** Respostes vàlides, secrets, configuració de validació.

**Ubicació de dades reals:** `content/games/traidor-guixa/private/solutions.json`

**IMPORTANT:** Aquest fitxer **NUNCA** va al client. S'importa només al servidor amb `import 'server-only'`.

**Camps clau:**
- `traitor` — ID del traïdor (`bernat`)
- `stations{[station_id]}` — Solucions per a cada estació
  - `messageVariants{A, B, C}` — Respostes vàlides
  - `dismissedSuspects` — Qui es descarta
  - `digit` — Xifra que suma al codi final
- `accusations` — Config de l'acusació (min 3 evidències vàlides)
- `treasureBox` — Codi + contrasenya + segell correcte
- `campanile` — Codi del campanar (`4-2-3-1`)
- `moralChoice` — Opcions de decisió moral (accept/reject)

**Exemple:**
```json
{
  "traitor": "bernat",
  "stations": {
    "serrat-bruixes": {
      "messageVariants": {
        "A": "SAP DE LLETRA",
        "B": "ESCRIU",
        "C": "LLEGEIX"
      },
      "digit": 4
    }
  }
}
```

---

## 🔄 Flux de Carrega

### 1. Engine Inicia
Engine llegeix:
1. `game-config.json` → Sap que hi ha 3 actes, 9 estacions
2. Tria variant random (A/B/C)
3. Crea sessió a BD amb `variant_id`

### 2. Jugador Escaneja QR (Estació)
Engine llegeix:
1. `stations.json[i]` → Obté `type` (ex: `polybiusSquare`)
2. Obté `params` de la plantilla
3. Carrega component genèric: `PolybiusGame.tsx`
4. Component rep `hints`, `evidences` del JSON

### 3. Jugador Resol
1. Component envia resposta a servidor
2. Servidor llegeix `solutions.json[variant_id]`
3. Valida: resposta vs `solutions.stations[station_id][variant_id]`
4. Si correcte:
   - Desbloqueja `evidence.json[...]`
   - Suma `digit` al codi parcial
   - Actualitza BD

### 4. Jog 6 (Acusació)
1. Jugador acusa Bernat
2. Servidor valida: ≥3 evidències de `solutions.accusations.validEvidences`
3. Si correcte: desbloqueja Jog 7

### 5. Jog 7 (Caixa)
1. Jugador introdueix codi `solutions.treasureBox.codeParts`
2. Tria segell correcte: `solutions.treasureBox.correctSealOption`

### 6. Jog 8–9 (Sometent)
1. Jog 8: Jugador decideix (accept/reject)
   - Tempo: `solutions.moralChoice.timeoutSeconds`
   - Epileg: `solutions.moralChoice.options[].epilogueId`
2. Jog 9: Codi correcte `solutions.campanile.correctCode` = `4-2-3-1`

---

## 📝 Com Usar les Plantilles

### Per al Traïdor de la Guixa (ara)

1. **Legiu `docs/SCHEMA.md`** per entendre cada plantilla
2. **Copieu les plantilles** a les ubicacions correctes:
   ```
   content/games/traidor-guixa/
   ├── game-config.json          (de game-config.schema.json)
   ├── narrative.json            (de narrative.schema.json)
   ├── stations.json             (de stations.schema.json)
   ├── evidence.json             (de evidence.schema.json)
   └── private/
       └── solutions.json        (de solutions.schema.json)
   ```

3. **Ompliu amb dades del Traïdor** (de historia.md, jocs.md, evidencies.md)
   - Estimació: 3–4 hores (és redacció estructurada)

4. **Engine carrega automàticament** quan inicia

### Per a Joc 2 (futur)

1. Copieu les mateixes plantilles
2. Canvieu:
   - `game-config.json`: títol, durada, actes, estacions
   - `narrative.json`: nous personatges, diàlegs, finals
   - `stations.json`: nous jocs (però reutilitzeu `type` existents)
   - `evidence.json`: noves evidències
   - `solutions.json`: noves respostes

3. Si necessiteu un `type` nou (ex: `codebreaking`):
   - Creeu component: `components/gameTypes/CodebreakingGame.tsx`
   - Afegiu a engine
   - Useu al `stations.json`

---

## ✅ Validació

### Al Cargar JSON
Engine valida:
- Que totes les references creuades existeixen (estació referida exists, evidence exists, etc.)
- Que `stations.json` té X estacions mencionats a `game-config.json`
- Que `evidence.json` té IDs únics
- Que `narrative.json` té tots els personatges referits

### Errors Comuns
```
❌ station_id "serrat-bruixes" referenced in game-config.json
   but not found in stations.json
   → Revisar ID spelling

❌ evidence_id "evidence_firebeacons" has no unlockedAt.station_id
   → Cada evidència ha de saber quan es desbloqueja

❌ character_id "bernat" referenced in evidence but not in narrative.json
   → Personatge falta al narrative.json
```

---

## 📚 References

- **`docs/SCHEMA.md`** — Documentació complet de cada plantilla
- **`docs/historia.md`** — Trama, personatges (fos a narrative.json)
- **`docs/jocs.md`** — Estacions i mecànicas (fos a stations.json)
- **`docs/evidencies.md`** — Evidències (fos a evidence.json)

---

## 🎮 Exemple Complet: Serrat de les Bruixes

### `game-config.json`
```json
{
  "id": "traidor-guixa",
  "acts": [
    {
      "number": 1,
      "name": "Investigació",
      "stations": ["serrat-bruixes", "font-ferro", "planes-bones", "cementiri"]
    }
  ]
}
```

### `stations.json[0]`
```json
{
  "id": "serrat-bruixes",
  "type": "polybiusSquare",
  "params": { "gridSize": 5, "alphabet": "..." },
  "hints": [
    { "level": 1, "cost": 0, "text": "Parells de fogueres..." }
  ],
  "rewards": { "digit": 4, "evidence_unlock": ["evidence_firebeacons"] },
  "variants": {
    "A": { "message": "SAP DE LLETRA" }
  }
}
```

### `solutions.json`
```json
{
  "stations": {
    "serrat-bruixes": {
      "messageVariants": {
        "A": "SAP DE LLETRA"
      },
      "digit": 4
    }
  }
}
```

### Component (Engine)
```tsx
// En components/gameTypes/PolybiusGame.tsx
const station = stations.find(s => s.id === stationId); // "serrat-bruixes"
const { gridSize, alphabet } = station.params;
const hints = station.hints;
const expectedMessage = solutions.stations[stationId].messageVariants[variant];

// Render joc
```

---

## 🤔 FAQ

**P: Per què 5 fitxers separats i no un single JSON?**  
R: Modularitat. Separem trama (narrative), mecànicas (stations), validació (solutions) perquè són responsabilitats diferentes. Facilita reutilització i manteniment.

**P: Quan cree Joc 2, he de copiar tota la carpeta `schemas/`?**  
R: No. Les plantilles (schemas/) són globals. Sols creeu una carpeta nova `content/games/joc-2/` amb els 5 JSON omplerts.

**P: Puc validar els JSON contra els schemas?**  
R: Sí! Els fitxers ja haben JSONSchema (headers `$schema`). Pots usar ajv o similar al TypeScript per validar. El engine pot fer-ho al arrancar.

**P: I si m'equivoco en un ID de referència?**  
R: Engine llança error al arrancar i et diu quina referència falta. No deixa que el joc comenci.

---

## 🚀 Pròxim Pas

1. Llegir `docs/SCHEMA.md` completament
2. Omplir els 5 JSON amb dades del Traïdor (3–4 hores)
3. Engine carrega i valida automàticament

**Estimació total:** Fase 0 (setup) + Fase 1 (omplir JSON) = 5–6 hores.

---

**Creat:** 2026-09-16  
**Versió:** 1.0.0  
**Autor:** Marc Serra Masramon
