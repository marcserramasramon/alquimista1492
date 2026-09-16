# Joc 1: Serrat de les Bruixes — El Codi de Fogueres

**Estació:** Serrat de les Bruixes (41.910870, 2.224520)  
**Joc:** Desxifrar un codi de parells (Quadrat de Polibi)  
**Acte:** I — La investigació  
**Durada:** 8 min (joc) + 15 min total (desplaçament)  
**Dificultat:** 2/5  

---

## Narrativa

Els vigies dels turons de vigilància es passen avisos amb fogueres quan no es pot enviar missatges en persona. La nit del 15 de maig de 1705, els vigies van transmetre un missatge de fogueres que ningú del poble ha sabut llegir.

Un informador secret de dins de Vic avisa: **la carta del delator és de mà pròpia**. El delator sap escriure.

Els jugadors han de desxifrar el missatge de fogueres per confirmar aquesta pista.

---

## Context Físic

**Ubicació:** Punt alt del Serrat amb vista a la plana  
**Cartell:** A3 plastificat

**Ambientació:**
- Lloc allunyat, fa por
- Sons opcionals: vent, crida de corb
- Necessitat de llanterna per llegir cartell de nit (contrast alt)
- Presència narrativa: "Aquí parlaven els vigies de nit"
- Cartell pot tindre marca discreta (taca vermell apagat)

---

## Pantalla 0: Títol + Menú

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│    SERRAT DE LES BRUIXES        │
│    ═══════════════════════      │
│                                 │
│   El Codi de Fogueres           │
│                                 │
│  ┌──────────────────────────┐   │
│  │ [1] INTRODUCCIÓ          │   │
│  ├──────────────────────────┤   │
│  │ [2] TAULA DE FOGUERES    │   │
│  ├──────────────────────────┤   │
│  │ [3] —                    │   │
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
│  SERRAT DE LES BRUIXES          │
│                                 │
│  "Els vigies dels turons de     │
│   vigilància parlen de nit amb  │
│   fogueres quan no es pot       │
│   enviar ningú.                 │
│                                 │
│   La nit del 15 de maig, els    │
│   vigies van veure un missatge  │
│   des de Vic. Nadie sap com     │
│   llegir-lo.                    │
│                                 │
│   Un informador secret diu que  │
│   la carta del delator és de    │
│   mà pròpia: el delator sap     │
│   escriure."                    │
│                                 │
│          [ENTENENT]             │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Pantalla 2: Taula de Fogueres

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│  SENYALS DE FOC DE LA PLANA     │
│  ───────────────────────────    │
│                                 │
│  Fogueres a l'esquerra = FILA   │
│  Fogueres a la dreta = COLUMNA  │
│                                 │
│  ┌───────────────────────────┐  │
│  │    1  2  3  4  5          │  │
│  │ 1  A  B  C  D  E          │  │
│  │ 2  F  G  H  I  J          │  │
│  │ 3  L  M  N  O  P          │  │
│  │ 4  Q  R  S  T  U          │  │
│  │ 5  V  X  Z  Ç  ·          │  │
│  │                           │  │
│  │ (· = espai)               │  │
│  └───────────────────────────┘  │
│                                 │
│          [ENTENENT]             │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Pantalla 4: El Joc

**Visualització:** Seqüència d'il·lustracions de fogueres (grups a esquerra i dreta)

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│  DESXIFRA EL MISSATGE           │
│  ─────────────────────────      │
│                                 │
│  [Animació: fogueres intermitents│
│   grups esquerra i dreta]       │
│                                 │
│  "Vistes la nit del 15 des del  │
│   Serrat."                      │
│                                 │
│  [INPUT TEXT]                   │
│  "Què diuen les fogueres?"      │
│  ________________________        │
│                                 │
│    [VALIDAR]  [PISTA (−5)]      │
│                                 │
│  [← MENÚ]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Solucions per Variant

| Variant | Data Esborrany | Missatge | Seqüència Parells | Xifra FOC |
|---------|--------------|----------|------------------|-----------|
| A | Nit del 15 | SAP LLETRA | 4-3·1-1·3-5 / 3-1·3-1·1-5·4-4·4-2·1-1 | 4 |
| B | Nit del 14 | ESCRIU | 1-5·4-3·1-3·4-2·2-4·4-5 | 4 |
| C | Nit del 16 | LLEGEIX | 3-1·3-1·1-5·2-2·1-5·2-4·5-2 | 4 |

---

## Pantalla 7A: Correcte ✅

```
┌─────────────────────────────────┐
│ [12:34:56 vermell dalt]         │
├─────────────────────────────────┤
│                                 │
│          ✓ CORRECTE!            │
│                                 │
│  Els vigies han transmès:       │
│  "SAP DE LLETRA"                │
│                                 │
│  DESCARTATS:                    │
│  ✓ Pere del Molí (signa creu)  │
│  ✓ Joan el traginer (signa creu)│
│                                 │
│  ┌─────────────────────────┐    │
│  │ XIFRA: FOC = 4          │    │
│  │ (4 fogueres senyal final)│   │
│  └─────────────────────────┘    │
│                                 │
│  ✓ +100 punts                   │
│  ✓ Evidència desbloqueïda:      │
│    "Taula dels vigies"          │
│                                 │
│    [SIGUIENTE ESTACIÓ]          │
│                                 │
└─────────────────────────────────┘
```

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Cada missatge són parells de fogueres." |
| 2 | −2 | "El primer parell és una sola lletra: fila i columna." |
| 3 | −5 | "SAP DE LLETRA. Pere i Joan signen amb una creu: descartats. FOC = 4." |

---

## Evidència Desbloqueïda

**ID:** `evidence_firebeacons`  
**Nom:** Taula dels vigies

> **Senyals dels vigies de la plana**  
> Nit del 15 de maig de 1705.
>
> Avisos de fogueres entre els turons de vigilància. Un informador dins de Vic ha confirmat que la carta del delator és de mà pròpia.
>
> **Conclusió:** El traïdor sap escriure.
>
> **Descartats:**
> - Pere del Molí (signa amb creu)
> - Joan el traginer (signa amb creu)
>
> ---
>
> **Nota històrica dels vigies:**  
> Els vigies transmeten des del Serrat de les Bruixes, on dones de lletres eren cremades a la foguera, segons diuen les històries. Que la seva saviesa ajudi a desxifrar el codi.

---

## Dades Capturades

| Camp | Exemple | Ús |
|------|---------|-----|
| `discovered_at` | 12:34:56 | Escaneja QR |
| `solved_at` | 12:43:21 | Envia resposta correcta |
| `duration` | 8 min 25 s | Temps dedicat |
| `attempts` | 1 | Intents fallits |

---

## Material Físic

**Cartell A3 plastificat:**
- Títol: "SENYALS DE FOC DE LA PLANA"
- Taula 5×5 (A–Z, Ç, espai)
- Il·lustració de dos turons amb fogueres
- QR que obri la webapp a aquesta estació
- Contrast alt (negre i or apagat)

**Nota de seguretat:**
- Allotjar-se en lloc visible però segur (no pas a la riera, no obstrucció via)
- Fanal de l'Emissari pot estar visible de lluny (augmenta tensió)

---

## Checklist de Sessió

- [ ] Variant del dia (A/B/C) activada a webapp
- [ ] Cartell llegible i QR intacte
- [ ] Cobertura mòbil correcta (o webapp precarregada offline)
- [ ] Sons ambients opcionals (vent, corb) activats si desitjat
- [ ] Rellotge sincronitzat amb compte enrere

