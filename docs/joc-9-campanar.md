# Joc 9: Campanar — El Sometent (Codi Final)

**Ubicació:** Campanar  
**Joc:** Desxifrar codi dels quatre elements  
**Acte:** III — L'alba  
**Durada:** 2–3 min  
**Dificultat:** 2/5  

---

## Narrativa

Els jugadors han de introduir el **codi dels quatre elements** per obrir el campanar i tocar el sometent.

Sona la campana. L'Emissari fuig. Els conjurats de Sant Sebastià senten el sometent i marxen salvos.

---

## Pantalla 0: Títol

```
CAMPANAR
════════════════════
El Sometent
```

---

## Pantalla 4: El Joc

**Rima:**

```
"Del cim baixa l'avís,
a la font es fa la tinta,
al pla vetlla la ronda
i a la pedra dorm el nom."

Quin és el codi?

[INPUT: 4 xifres]
```

---

## Solució

Desxifrat de la rima:

| Paraula | Estació | Xifra |
|---------|---------|-------|
| Cim | Serrat de les Bruixes | 4 (FOC) |
| Font | Font del Ferro | 2 (AIGUA) |
| Pla | Planes Bones | 3 (TERRA) |
| Pedra | Cementiri | 1 (PEDRA) |

**Codi correcte:** `4231` o `4-2-3-1`

---

## Pantalla 7A: Correcte ✅

```
✓ CORRECTE!

[Sona el sometent - so de campana]

Emissari (àudio): "No… Heu tocat a sometent."
[L'Emissari fuig]

Els conjurats de Sant Sebastià senten 
el sometent i marxen antes que arribin els dragons.

[PANTALLA FINAL]

Rànquing d'equips
Epíleg según decisió (A o B)
Percentatge d'equips que han triat cada opció

FINAL DE LA PARTIDA
```

---

## Pantalla 7B: Error ❌

```
✗ Codi incorrecte

−1 min

[TORNAR A INTENTAR]

[Límit: si temps esgotat, derrota]
```

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Cada vers de la rima és una estació." |
| 2 | −2 | "El cim = Serrat. Font = Font del Ferro." |
| 3 | −5 | "4-2-3-1" |

---

## Pantalla Final

```
┌─────────────────────────────────┐
│                                 │
│    🔔 CAMPANA DE L'ALBA 🔔      │
│                                 │
│  RÀNQUING FINAL D'EQUIPS        │
│  ───────────────────────────    │
│                                 │
│  1. EQUIP XYZ — 485 punts       │
│  2. EQUIP ABC — 430 punts       │
│  3. EQUIP DEF — 380 punts       │
│                                 │
│  ───────────────────────────    │
│                                 │
│  EPÍLEG SEGONS DECISIÓ          │
│                                 │
│  Opció A: [55%] Opció B: [45%]  │
│                                 │
│  "Aquella nit els vau salvar.   │
│   La història no els va salvar  │
│   per sempre."                  │
│                                 │
└─────────────────────────────────┘
```

---

## Dades Capturades

- `codi_entered` (string)
- `solved_at` (timestamp final de partida)
- `time_remaining` (per desempat)
- Estat de sessió: `ended`

---

## Prerequisit

- Joc 8 completat (decisió A o B)
- Cronometre en compte enrere (< 5 min típicament)

---

## Nota Temporal

- Si es acaba temps sense tocar campantet: **DERROTA**
- Els dragoons arriben a Sant Sebastià
- Webapp mostra "Els dragons han capturat el Pacte"
- No es desbloqueja epíleg, rànquing nor

---

## Final

Sona el sometent (so de campana real o simulat).

La partida s'acaba aquí. Tots els mòbils mostren **pantalla final amb rànquing complet**.
