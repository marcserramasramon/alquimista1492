# Pantalles i Mecàniques Compartides — El Traïdor de la Guixa

Especificació de les pantalles genèriques reutilitzables entre tots els 9 jocs.

---

## Pantalla 0: Títol + Menú del Joc

**Quan apareix:** Immediately després d'escanejar QR estació  
**Reutilitzable:** Sí, totes les estacions  
**Dades capturades:** `discovered_at` (hora actual)

### Layout

```
┌─────────────────────────────────┐
│ [Cronometre: vermell, dalt]     │
├─────────────────────────────────┤
│                                 │
│     [TÍTOL ESTACIÓ]             │
│     ════════════════            │
│                                 │
│   [Subtítol: nom del joc]       │
│                                 │
│                                 │
│  ┌──────────────────────────┐   │
│  │ [1] [Opció 1]            │   │
│  ├──────────────────────────┤   │
│  │ [2] [Opció 2]            │   │
│  ├──────────────────────────┤   │
│  │ [3] [Opció 3]            │   │
│  ├──────────────────────────┤   │
│  │ [4] EL JOC               │   │
│  └──────────────────────────┘   │
│                                 │
│  [HUB]  [MAPA]  [QUADERN]       │
│                                 │
└─────────────────────────────────┘
```

### Paràmetres Per Estació

| Estació | Títol | Opció 1 | Opció 2 | Opció 3 | Opció 4 |
|---------|-------|---------|---------|---------|---------|
| 1 | Serrat de les Bruixes | Introducció | Taula de fogueres | — | EL JOC |
| 2 | Font del Ferro | Introducció | Recepta | Torns | EL JOC |
| 3 | Planes Bones | Introducció | Cartell | Avís | EL JOC |
| 4 | Cementiri | Introducció | Làpides | Registre | EL JOC |
| 5 | Pla de Masset | — | — | — | EL JOC |
| 6 | Pla de Masset | — | — | — | ACUSACIÓ |
| 7 | Rectoria | — | — | — | CAIXA |
| 8 | Porta Campanar | — | — | — | ENGANY |
| 9 | Campanar | — | — | — | SOMETENT |

### Navegació

- Els jugadors navegen **lliurement** entre opcions 1–3 (ordre lliure)
- Opció 4 ([EL JOC] o nom específic) és el **joc principal**
- Botó [← MENÚ] sempre disponible per tornar

---

## Pantalla Genèrica: Confirmació de Pista

**Quan apareix:** Quan l'usuari fa clic a [PISTA (−X)] en qualsevol joc  
**Reutilitzable:** Sí, tots els 9 jocs  
**Dades capturades:** `hints_used` (niveau, cost, timestamp)

### Layout

```
┌─────────────────────────────────┐
│ [Cronometre: vermell, dalt]     │
├─────────────────────────────────┤
│                                 │
│         ⚠️ CONFIRMACIÓ           │
│                                 │
│  Estàs segur?                   │
│                                 │
│  Aquesta pista et costarà:      │
│                                 │
│      −[COST] PUNTS              │
│                                 │
│  (Tens: [PUNTS_ACTUALS])        │
│                                 │
│                                 │
│   [SÍ, VULL]  [CANCEL·LA]       │
│                                 │
└─────────────────────────────────┘
```

### Variables Dinàmiques

- `[COST]`: Segons el nivell de pista
  - Nivell 1: 0 punts
  - Nivell 2: −2 punts
  - Nivell 3: −5 punts
  
- `[PUNTS_ACTUALS]`: Puntuació actual de l'equip (server)

### Comportament

| Acció | Resultat |
|-------|----------|
| [SÍ, VULL] | Resta punts al servidor, mostra Pantalla Pista específica |
| [CANCEL·LA] | Torna a Pantalla Joc sense canvis |

---

## Pantalla Genèrica: Resposta Correcta ✅

**Quan apareix:** Quan l'usuari envia resposta correcta  
**Reutilitzable:** Sí, tots els jocs  
**Dades capturades:** `solved_at`, `attempts`, xifra, evidència, descartes

### Layout

```
┌─────────────────────────────────┐
│ [Cronometre: vermell, dalt]     │
├─────────────────────────────────┤
│                                 │
│          ✓ CORRECTE!            │
│                                 │
│  [Explicació de la solució]     │
│  [1–3 línies específiques]      │
│                                 │
│  [SOSPITOSOS DESCARTATS]        │
│  ✓ [Nom 1]                      │
│  [i més si n'hi ha]             │
│                                 │
│  ┌─────────────────────────┐    │
│  │ XIFRA: [ID] = [VALOR]   │    │
│  │ ([Descripció curta])    │    │
│  └─────────────────────────┘    │
│                                 │
│  ✓ +100 punts                   │
│  ✓ Evidència desbloqueïda       │
│                                 │
│    [SIGUIENTE ESTACIÓ]          │
│                                 │
└─────────────────────────────────┘
```

### Dades Actualitzades (Temps Real)

- **Hub:** Mostra estació com `solved`, xifra visible
- **Quadern:** Evidència nova apareix
- **Tots els mòbils de l'equip:** Veuen els canvis sincronitzats

---

## Pantalla Genèrica: Resposta Incorrecta ❌

**Quan apareix:** Quan l'usuari envia resposta incorrecta  
**Reutilitzable:** Sí, tots els jocs  
**Dades capturades:** Intent registrat, −10 punts

### Layout

```
┌─────────────────────────────────┐
│ [Cronometre: vermell, dalt]     │
├─────────────────────────────────┤
│                                 │
│          ✗ INCORRECTE            │
│                                 │
│  Has marcat: [RESPOSTA_ERRADA]  │
│                                 │
│  [Explicació per a repensar]    │
│  [1–2 línies]                   │
│                                 │
│  ✗ −10 punts                    │
│  Intent [N]/[MÀXIM]             │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [PISTA] (−[COST] pts)   │    │◄── A Pantalla Confirmació
│  └─────────────────────────┘    │
│                                 │
│    [TORNAR A INTENTAR]          │
│                                 │
└─────────────────────────────────┘
```

### Configuració Per Joc

- `[MÀXIM]`: Típicament 3 intents per estació
- `[COST]`: Pista nivell 3 (−5 punts)
- Després de 3 intents fallits: [PISTA NIVELL 3 OBLIGATÒRIA] o desbloqueig automàtic

---

## Pantalla Genèrica: Pista

**Quan apareix:** Després de confirmar pista (Pantalla Confirmació)  
**Reutilitzable:** Sí, tots els jocs  
**Dades:** Contingut específic per a cada joc i nivell

### Layout

```
┌─────────────────────────────────┐
│ [Cronometre: vermell, dalt]     │
├─────────────────────────────────┤
│                                 │
│  PISTA NIVELL [N] — [TIPUS]     │
│  ─────────────────────────────  │
│                                 │
│  "[TEXT PISTA ESPECÍFICA]       │
│   [Pista adaptada al nivell]    │
│   [2–4 línies màxim]"           │
│                                 │
│  ✓ −[COST] punts aplicats       │
│                                 │
│    [TORNAR AL JOC]              │
│                                 │
└─────────────────────────────────┘
```

### Nivells Estàndard (Tots els Jocs)

| Nivell | Tipus | Cost | Que dona |
|--------|-------|------|----------|
| 1 | Orientació | 0 | On cal mirar |
| 2 | Concreta | −2 | El pas que falta |
| 3 | Solució | −5 | Gairebé la resposta |

---

## Cronometre Visible (Tots els Jocs)

**Ubicació:** Dalt centrat (sempre visible)  
**Font:** EB Garamond 400, `--cochineal` (#7A1F26)  
**Fons:** Negre semitransparent  
**Altura:** 5% de la pantalla mòbil  
**Format:** Compte enrere `HH:MM:SS`

```
┌─────────────────────────────────┐
│    12:34:56                     │  ← Vermell sobre negre
├─────────────────────────────────┤
│ [Contingut principal]           │
│                                 │
```

**Dades capturades automatitzades:**
- `discovered_at`: Quan escaneja QR
- `solved_at`: Quan resol correctament
- Durada: `solved_at - discovered_at`

---

## Sistema Genèric de Desbloqueig

Quan un joc es resol correctament:

```
server.validateResponse(userAnswer, variant):
  ✓ Correcte
    ├─ estacio.status = "solved"
    ├─ team.score += 100
    ├─ evidence_list.push(evidence_id)
    ├─ suspects.remove(suspect_names[])
    ├─ xifra_panel.add(xifra_value)
    └─ broadcast(team_id, "ESTACIÓ_RESOLIDA")
       └─ Tots els mòbils de l'equip:
          ├─ Hub: visualitza canvi
          ├─ Quadern: mostra evidència nova
          └─ Pantalla joc: mostra resultat
```

---

## Navegació Inferior (Fixa durant partida)

**Visible en:** Totes les pantalles de joc  
**Botons:** Hub | Mapa | Quadern | Salconduit

```
└─────────────────────────────────┘
│  [HUB]  |  [MAPA]  |  [QUADERN]  |  [SALCONDUIT]
└─────────────────────────────────┘
```

- **Hub:** Veu estacions, punts, xifres
- **Mapa:** Localització en temps real
- **Quadern:** Evidències desbloqueïdes, sospitosos
- **Salconduit:** QR pantalla completa (−10 punts si escanejar)

---

## Taula de Sincronització Temps Real

Quan un equip resol una estació, **tots els mòbils de l'equip reben:**

| Pantalla | Actualitzacions |
|----------|-----------------|
| Hub | Estació `solved`, xifra visible, +100 punts |
| Quadern | Evidència nova, sospitosos descartats |
| Pantalla actual | Pantalla de resultat (correcte/incorrecte) |
| Cronometre | Continua en compte enrere |
| Mapa | Estació marcada com resolida (color `--gold`) |

Latència esperada: < 1 s

---

## Seguretat i Validació (Servidor)

- **Tota validació al servidor:** La webapp client mai confía la resposta
- **Rate limit:** Màx 1 intent cada 3 segons per equip i estació
- **Tokens de session:** Validats a cada acció
- **Punts:** Immutables sense auditoria (registrats a `score_events`)

