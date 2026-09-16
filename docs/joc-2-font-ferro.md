# Joc 2: Font del Ferro — Tinta i Torns d'Aigua

**Estació:** Font del Ferro (41.914870, 2.227445)  
**Joc:** Càlcul de temps + taula de dades  
**Acte:** I — La investigació  
**Durada:** 10 min (joc) + 17 min total (desplaçament)  
**Dificultat:** 4/5 (LA MÉS EXIGENT)  

---

## Narrativa

La carta del delator està escrita amb **tinta de gales** (tinta medieval). Per fer-la, les gales de roure es remullen en aigua durant **3 dies complets**.

La Font del Ferro és l'**única font del terme que porta ferro natural**, imprescindible per a aquesta tinta. Els jugadors han de descubrir **quin dia es va recollir l'aigua**, i llavors veure **qui no hi va anar aquell dia**.

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

## Pantalla 4: El Joc (Principal)

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│  PREGUNTA:                      │
│  ─────────                      │
│  "La tinta es va fer el 15.     │
│   Es remulla 3 dies.            │
│   L'aigua es va recollir el     │
│   ___ de maig."                 │
│                                 │
│  [INPUT: Dia (número 1-31)]     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ☐ PERE del Molí        │    │
│  │ ☐ JOAN el traginer      │    │
│  │ ☐ MARIANNA de l'Hostal  │    │
│  │ ☐ ISIDRE el Ferrer      │    │
│  │ ☐ BERNAT el mestre      │    │
│  │ ☐ ANTON l'escolà        │    │
│  └─────────────────────────┘    │
│                                 │
│    [VALIDAR]  [PISTA (−5)]      │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Solucions per Variant

| Variant | Esborrany | Dia Recull (−3 dies) | Qui Hi Va | Descartada |
|---------|-----------|-----------------|----------|-----------|
| A | Nit 15 | Dia 12 | Escolà, Ferrer, Benat | Marianna (mercat Vic) |
| B | Nit 14 | Dia 11 | Moliner, Escolà, Benat | Marianna |
| C | Nit 16 | Dia 13 | Moliner, Ferrer, Benat | Marianna |

---

## La Trampa

**Error comú:** Miren el dia 15 (dia de l'esborrany), on l'Hostalera **sí que hi és**. No la descarten.

**Pista nivell 2:** "_Compteu les nits cap enrere_" empeny a calcular −3 dies correctament.

---

## Pantalla 7A: Correcte ✅

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│          ✓ CORRECTE!            │
│                                 │
│  Dia 12 de maig (−3 nits)       │
│  l'Escola, Ferrer, Bernat       │
│  van recollir aigua.            │
│                                 │
│  MARIANNA de l'Hostal           │
│  estava al mercat de Vic.       │
│  ─────────────────────────────  │
│  ✓ DESCARTADA                   │
│                                 │
│  ┌─────────────────────────┐    │
│  │ XIFRA: AIGUA = 2        │    │
│  │ (càntirs de l'escola    │    │
│  │  el dia 12)             │    │
│  └─────────────────────────┘    │
│                                 │
│  ✓ +100 punts                   │
│  ✓ Evidència desbloqueïda:      │
│    "Llibreta de torns"          │
│                                 │
│    [SIGUIENTE ESTACIÓ]          │
│                                 │
└─────────────────────────────────┘
```

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "La tinta no es fa el mateix dia." |
| 2 | −2 | "Compteu les nits cap enrere." |
| 3 | −5 | "El dia 12 (−3 nits). Marianna estava al mercat: descartada. AIGUA = 2." |

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

## Checklist de Sessió

- [ ] Variant del dia (A/B/C) activada
- [ ] Cartell llegible, QR intacte
- [ ] Taula de torns visible (webapp precarregada)
- [ ] Rellotge sincronitzat
- [ ] Cobertura mòbil correcta

