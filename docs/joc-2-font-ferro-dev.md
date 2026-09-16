# Joc 2: Font del Ferro — Tinta i Torns d'Aigua (Taula Interactiva)

**Estació:** Font del Ferro (41.914870, 2.227445)  
**Joc:** Taula interactiva clickable de torns  
**Acte:** I — La investigació  
**Durada:** 8–10 min  
**Dificultat:** 2–3/5 (Mecànica clara, més divertida)  
**Tipus:** Deducció + Lògica visual

---

## Narrativa

La carta del delator està escrita amb **tinta de gales** (tinta medieval). Per fer-la, les gales de roure es remullen en aigua durant **3 dies complets**.

La Font del Ferro és l'**única font del terme que porta ferro natural**, imprescindible per a aquesta tinta. Els jugadors han de descobrir **quin dia es va recollir l'aigua**, examinant interactivament **la taula de torns**: qui va venir a la font cada dia?

---

## Context Físic

**Ubicació:** Punt d'aigua del terme de la Guixa  
**Cartell:** A3 plastificat amb recepta medieval

**Ambientació:**
- Recepta de tinta antiga (format "full d'escrivà")
- Taula de torns d'aigua completa (7 dies, molts noms)
- Context: "Qui va recollir l'aigua per a la tinta que va escriure la carta?"

---

## Pantalla 0: Títol + Menú

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│       FONT DEL FERRO            │
│       ═════════════════         │
│                                 │
│   Tinta i Torns d'Aigua         │
│                                 │
│  ┌──────────────────────────┐   │
│  │ [1] INTRODUCCIÓ          │   │
│  ├──────────────────────────┤   │
│  │ [2] RECEPTA DE TINTA     │   │
│  ├──────────────────────────┤   │
│  │ [3] TORNS DE LA FONT     │   │
│  ├──────────────────────────┤   │
│  │ [4] EL JOC               │   │
│  └──────────────────────────┘   │
│                                 │
│  [HUB]  [MAPA]  [QUADERN]       │
│                                 │
└─────────────────────────────────┘
```

---

## Pantalla 1: Introducció

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│  FONT DEL FERRO                 │
│                                 │
│  "Aquesta font és l'única del   │
│   terme que porta ferro natural.│
│   La tinta de gales es fa       │
│   remullant tres dies senceres. │
│                                 │
│   Qui va venir a buscar aigua   │
│   el dia que es va preparar la  │
│   tinta que va escriure la      │
│   carta?"                        │
│                                 │
│          [ENTENENT]             │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Pantalla 2: Recepta de Tinta

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│  RECEPTA DE TINTA               │
│  De la manera dels notaris      │
│  ─────────────────────────      │
│                                 │
│  "Esclafeu gales de roure.      │
│   Poseu-les en remull amb       │
│   aigua rovellada d'aquesta     │
│   font, TRES DIES SENCERES,    │
│   fins que l'aigua es torni     │
│   negra i violàcia.             │
│   Coleu-ho i afegiu-hi goma."   │
│                                 │
│  [Imatge: pergamí vell, tinta   │
│   violàcia]                     │
│                                 │
│          [ENTENENT]             │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Pantalla 3: Torns de la Font

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│  TORNS DE LA FONT               │
│  10–16 de maig de 1705          │
│                                 │
│  DIA 10: Hostalera, Ferrer      │
│  DIA 11: Moliner, Escolà, Benat │
│  DIA 12: Escolà, Ferrer, Benat  │
│  DIA 13: Moliner, Ferrer, Benat │
│  DIA 14: Hostalera, Traginer    │
│  DIA 15: Hostalera, Escolà      │
│  DIA 16: Hostalera, Benat       │
│                                 │
│  ⚠️ El dia 12 hi havia mercat   │
│     a Vic. L'Hostal no va venir.│
│                                 │
│          [ENTENENT]             │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Pantalla 4a: Taula Interactiva de Torns

```
╔════════════════════════════════════════════╗
║                                            ║
║  EL JOC: TORNS DE LA FONT                  ║
║  ════════════════════════════               ║
║                                            ║
║  "La tinta es va fer el 15 de maig.        ║
║   Es remulla 3 dies.                       ║
║   L'aigua es va recollir 3 dies abans.     ║
║                                            ║
║   Clica als noms per marcar qui va         ║
║   recollir l'aigua AQUELL dia."            ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  TORNS DE LA FONT (10–16 de maig)          ║
║  ─────────────────────────────────         ║
║                                            ║
║  DIA 10: [Pere] [Isidre]                   ║
║  DIA 11: [Pere] [Anton] [Benat]            ║
║  DIA 12: [Anton] [Isidre] [Benat] ← ???    ║
║  DIA 13: [Pere] [Isidre] [Benat]           ║
║  DIA 14: [Marianna] [Joan]                 ║
║  DIA 15: [Marianna] [Anton]                ║
║  DIA 16: [Marianna] [Benat]                ║
║                                            ║
║  ⚠️  El dia 12 havia mercat a Vic           ║
║      (Marianna no va venir)                ║
║                                            ║
║  [CONFIRMAR DIA 12]  [PISTA (−5)]         ║
║                                            ║
╚════════════════════════════════════════════╝
```

**Mecànica Webapp:**
1. Els jugadors **cliquen noms** per marcar-los
2. Clic = **verd/seleccionat**, al clicar altre cop = **gris/deseleccionat**
3. Els noms que van venir aquell dia es ressalten
4. Sistema en temps real: "Has triat dia 12 → Escolà, Ferrer, Benat van venir"
5. Marianna **no apareix al dia 12** (ho mostra el sistema: "Ocupada al mercat de Vic")

---

## Pantalla 4b: Validació Visual

```
╔════════════════════════════════════════════╗
║                                            ║
║  DIA CORRECTE: 12 DE MAIG ✓                ║
║  ════════════════════════════               ║
║                                            ║
║  Els qui van recollir l'aigua:             ║
║  ✓ ANTON l'escolà                          ║
║  ✓ ISIDRE el ferrer                        ║
║  ✓ BERNAT el mestre                        ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  Els qui NO van anar aquell dia:           ║
║  ✗ PERE del Molí                           ║
║  ✗ JOAN el traginer                        ║
║  ✗ MARIANNA de l'Hostal                    ║
║     (Al mercat de Vic)                     ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║         [CONTINUAR]                        ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## Solucions per Variant

| Variant | Dia Redacció | Dia Recull (−3 nits) | Qui Va Aquell Dia | Descartada |
|---------|-------------|----------------------|------------------|-----------|
| A | 15 de maig | 12 de maig | Escolà, Ferrer, Benat | Marianna (Mercat Vic) |
| B | 14 de maig | 11 de maig | Pere, Escolà, Benat | Marianna |
| C | 16 de maig | 13 de maig | Pere, Ferrer, Benat | Marianna |

---

## La Trampa / Clau del Joc

**Error comú:** Els jugadors miren el dia 15 (dia de redacció), on Marianna **sí que hi és** als torns. No la descarten correctament.

**Com evitar-ho:**
- La taula interactiva mostra clarament: **"Dia 12 → Marianna no va venir (Mercat Vic)"**
- El sistema no deixa marcar Marianna al dia 12
- Feedback visual immediat: vermell = no va, verd = va

**Pista nivell 2:** "_La tinta es va fer el 15, però l'aigua es va recollir 3 dies abans._"

---

## Pantalla 7A: Correcte ✅

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✓ CORRECTE!                               ║
║                                            ║
║  Els qui van recollir l'aigua (dia 12):    ║
║  ✓ ANTON l'escolà                          ║
║  ✓ ISIDRE el ferrer                        ║
║  ✓ BERNAT el mestre                        ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  MARIANNA de l'Hostal estava al             ║
║  MERCAT DE VIC aquell dia.                  ║
║                                            ║
║  ✓ DESCARTADA                              ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  🔑 XIFRA DESCOBERTA: AIGUA = 2             ║
║                                            ║
║  +100 punts                                ║
║  ✓ Evidència desbloqueïda:                 ║
║    "Llibreta de Torns de la Font"          ║
║                                            ║
║           [SEGÜENT ESTACIÓ]                ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

## Pantalla 7B: Incorrecte ❌

```
╔════════════════════════════════════════════╗
║                                            ║
║  ✗ DIA INCORRECTE                          ║
║                                            ║
║  Has triat dia ___, però:                  ║
║                                            ║
║  ⚠️  La tinta es va fer el [15]             ║
║     Es remulla 3 NITS cap enrere            ║
║     (no 3 dies).                           ║
║                                            ║
║  Nits enrere desde el 15:                  ║
║  Nit 15 → nit 14 → nit 13                   ║
║  (3 nits = dia 12)                         ║
║                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                            ║
║  Recorda: Marianna estava al Mercat         ║
║  de Vic el dia 12. No pot haber fet        ║
║  la tinta.                                  ║
║                                            ║
║  −2 min                                    ║
║  Intent 1/3                                ║
║                                            ║
║           [PISTA (−5)]                    ║
║           [TORNAR A INTENTAR]              ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

---

## 🔧 Validació (Backend)

```javascript
const WATER_DATES_BY_VARIANT = {
  A: "12-05-1705", // dia 15 − 3 nits
  B: "11-05-1705", // dia 14 − 3 nits
  C: "13-05-1705"  // dia 16 − 3 nits
};

const WATER_COLLECTORS = {
  A: ["anton", "isidre", "benat"],
  B: ["pere", "anton", "benat"],
  C: ["pere", "isidre", "benat"]
};

function validateGame2(selectedDate, variant) {
  const correctDate = WATER_DATES_BY_VARIANT[variant];
  
  if (selectedDate !== correctDate) {
    return { 
      valid: false, 
      error: `Data incorrecta. Recalcula −3 nits desde el dia de redacció.`,
      penalty: -120 // −2 minuts
    };
  }
  
  return { 
    valid: true, 
    message: "Correcte! Marianna estava al Mercat de Vic.",
    xifra: 2, // AIGUA
    descartedSuspect: "Marianna" 
  };
}
```

---

## 💡 Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "La tinta es remulla 3 nits, no 3 dies." |
| 2 | −2 | "Dia 15 − 3 nits = Dia 12 de maig." |
| 3 | −5 | "Dia 12: Escolà, Ferrer, Benat van venir. Marianna al Mercat Vic. AIGUA = 2." |

---

## Evidència Desbloqueïda

**ID:** `evidence_water_ledger`  
**Nom:** Llibreta de torns de la Font

> **Torrns diaris de recollida d'aigua**  
> Font del Ferro · 10–16 de maig de 1705.
>
> Control diàri de qui va baixar a recollir l'aigua per a la tinta. L'ingredient principal és l'aigua de ferro d'aquesta font, que només aquí es pot trobar.
>
> Tinta de gales: 3 dies de remull  
> Carta escrita: 15 de maig (nit)  
> Aigua recollida: 12 de maig (−3 dies)
>
> **Conclusió:** Marianna de l'Hostal estava al mercat de Vic el dia 12. No pot haver fet la tinta.

---

## Dades Capturades

| Camp | Exemple | Ús |
|------|---------|-----|
| `discovered_at` | 12:34:56 | Escaneja QR |
| `solved_at` | 12:44:30 | Envia dia correcte |
| `duration` | 10 min | Temps dedicat |
| `attempts` | 2 | Intents fallits |

---

## Material Físic

**Cartell A3 plastificat:**
- Recepta medieval en format "full d'escrivà"
- Text en tinta ferrogàl·lica (negra/marró)
- Contrast alt, llegible amb llanterna
- QR estació
- Ubicació: Visible i segura prop de la font (però no en seca de font)

---

---

## 🛠️ Checklist de Desenvolupament

### Frontend
- [ ] Component `FontDeFerroGame.tsx`
  - [ ] Pantalla 1: Introducció (menú navegable)
  - [ ] Pantalla 2: Recepta de tinta (text antic)
  - [ ] Pantalla 3: Torns precarregats (taula estàtica)
  - [ ] Pantalla 4a: Taula interactiva
    - [ ] Clickeable noms (clic = verd, clic altre cop = gris)
    - [ ] Mostrar "No va venir (Mercat Vic)" per Marianna dia 12
    - [ ] Botó [CONFIRMAR DIA XX]
  - [ ] Pantalla 4b: Validació visual (qui va/no va)
  - [ ] Pantalla 7A: Correcte ✅ (descartació + xifra)
  - [ ] Pantalla 7B: Incorrecte ❌ (pista re-càlcul)

### Backend
- [ ] Endpoint POST `/game/font-ferro/validate`
  - [ ] Validar data correcta per variant
  - [ ] Retornar: `{ valid, xifra: 2, descartedSuspect }`
  - [ ] Penalty: −2 min si error
- [ ] Desbloquear evidència: `evidence_water_ledger`
- [ ] Registrar score event

### QA
- [ ] Testejar clickeable noms (verd/gris)
- [ ] Testejar Marianna "no seleccionable" dia 12
- [ ] Testejar 3 variants (A/B/C) donen dies correctes
- [ ] Testejar pistes funcionan
- [ ] Testejar que día incorrecte mostra error −2 min

---

## 📊 Mètriques

| Mètrica | Valor |
|---------|-------|
| Durada | 8–10 min |
| Dificultat | 2–3/5 |
| Punts | 100 |
| Pantalles | 6 (0-1-2-3-4a-4b-7a-7b) |
| Xifra | AIGUA = 2 |
| Descartació | Marianna |

---

## 📌 Material Físic

**Cartell A3 plastificat:**
- Recepta medieval en format "full d'escrivà"
- Text en tinta ferrogàl·lica (negra/marró)
- Contrast alt, llegible amb llanterna de nit
- QR estació integrat
- Ubicació: Visible i segura prop de la font del Ferro

---

## Checklist de Sessió

- [ ] Variant del dia (A/B/C) activada al master
- [ ] Cartell llegible, QR intacte
- [ ] Taula de torns precarregada a webapp (descàrrega al xarxer)
- [ ] Rellotge sincronitzat entre mòbils
- [ ] Cobertura 4G/5G correcta a ubicació

