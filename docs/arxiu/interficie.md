# Interfície de la Webapp — El Traïdor de la Guixa

## Estructura General

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ 01:23:45                        │
├─────────────────────────────────────┤
│                                     │
│  [contingut de la pantalla activa]  │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  📍    │  📔   │   ⭕   │  📖   │ 🎖️  │
│ MAPA  │QUADERN│ ESCAN. │HIST. │SALVOS│
└─────────────────────────────────────┘
```

## Menú Inferior (5 Botons) — ESTÀTIC, ADAPTATIU AL CONTEXT

### Context 1: HUB PRINCIPAL (fora de joc)

| Posició | Botó | Icona | Funció | Mida |
|---------|------|-------|--------|------|
| 1 | MAPA | 📍 | Mostra les 4 estacions del joc | 48px |
| 2 | QUADERN | 📔 | Evidències, sospitosos, pistes | 48px |
| 3 | **ESCANEJA QR** | 🔍 | Obri la càmera per escaneja cartells | **60px** (rodó) |
| 4 | HISTÓRIA | 📖 | Narrativa, missatges rebuts | 48px |
| 5 | SALVOS | 🎖️ | Salconduits (barres de vida) | 48px |

### Context 2: DINS D'UN JOC (estació obert)

| Posició | Botó | Icona | Funció | Mida |
|---------|------|-------|--------|------|
| 1 | MAPA | 📍 | Mostra les estacions (sense perdre progés) | 48px |
| 2 | QUADERN | 📔 | Veu evidències mentre juga | 48px |
| 3 | **JOC OBERT** | 🎮 | Torna al joc actiu (alterna) | **60px** (rodó) |
| 4 | HISTÓRIA | 📖 | Llegeix narrativa sense sortir del joc | 48px |
| 5 | SALVOS | 🎖️ | Veu salconduits | 48px |

**Canvi automàtic del botó central:**
- Quan escaneja QR d'estació → botó canvia de 🔍 a 🎮
- Queda persistent mentre el joc estigui obert
- Clic 🎮 → torna a la vista del joc (on estava)
- Si surt del joc (tap "Tornar al mapa" definitiu) → botó torna a 🔍

**Estil del botó central:**
- Forma: cercle (border-radius: 50%)
- Diàmetre: 60px
- Color: or vell (#D4AF37)
- Sombra: ombra suau per destacar
- Sempre visible i accessible
- Text interior canvia (🔍 o 🎮) amb transició suau

---

## Pantalla 1: MAPA

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ Temps restant: 01:23:45         │
│                                     │
├─────────────────────────────────────┤
│        📍 MAPA DE LA GUIXA          │
│                                     │
│    🔥 Serrat de les Bruixes        │
│       (50 min)  ✓ RESOLT           │
│                                     │
│    💧 Font del Ferro               │
│       (45 min)  ⏳ DESCOBERTA      │
│                                     │
│    🌾 Planes Bones                 │
│       (25 min)  ⚪ BLOQUEADA       │
│                                     │
│    ⚰️  Cementiri                    │
│       (10 min)  ⚪ BLOQUEADA       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Codi actual: 4-2-?-?        │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  📍    │  📔   │   ⭕   │  📖   │ 🎖️  │
└─────────────────────────────────────┘
```

**Funcionalitat:**
- Mostra les 4 estacions (cartell físic de cada una)
- Cada estació és clicable → obri el joc
- Indicadors: ✓ resolt, ⏳ descobert, ⚪ bloqueada
- Cronometre comptat enrere al capdamunt (40% de la pantalla)
- Codi actual (les xifres obtingudes fins ara)

---

## Pantalla 2: QUADERN

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ Temps restant: 01:23:45         │
│                                     │
├─────────────────────────────────────┤
│     📔 QUADERN D'EVIDÈNCIES         │
│                                     │
│ DESCARTATS:                         │
│  ✗ Pere del Molí   (no sap escriu.)│
│  ✗ Joan            (no sap escriu.)│
│                                     │
│ SOSPITOSOS ACTIUS:                  │
│  • Bernat (mestre escola)  ⚠️⚠️⚠️   │
│  • Marianna (hostalera)    ⚠️       │
│  • Isidre (ferrer)         ⚠️       │
│  • Anton (escolà)          ⚠️       │
│                                     │
│ PISTES TROBAES:                     │
│  • "Sap de lletra"                  │
│  • Segell: ploma + clau             │
│  • Llum a l'escola (nit 15)          │
│  • Dois càntirs per a l'escola      │
│                                     │
├─────────────────────────────────────┤
│  📍    │  📔   │   ⭕   │  📖   │ 🎖️  │
└─────────────────────────────────────┘
```

**Funcionalitat:**
- Llistat de sospitosos descartats (amb motiu)
- Sospitosos actius (amb risc visual ⚠️)
- Pistes recopilades de les estacions
- Scroll si hi ha molt contingut

---

## Pantalla 3: HISTÓRIA

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ Temps restant: 01:23:45         │
│                                     │
├─────────────────────────────────────┤
│      📖 LA TRAMA - QUE SABEM        │
│                                     │
│ 📜 MISSATGE INICIAL (Bernat):       │
│                                     │
│ "Mossèn Ramon ha caigut malalt.     │
│  He rebut notícia per les fogueres  │
│  que algú ha traït els conjurats.   │
│  Confio en vosaltres. Investigueu." │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ 🔥 SERRAT DE LES BRUIXES:           │
│ "El traïdor sap de lletra."         │
│                                     │
│ 💧 FONT DEL FERRO:                  │
│ "Qui va recollir aigua el dia 12?"  │
│                                     │
│ 🌾 PLANES BONES:                    │
│ "Llum a l'escola a quart d'onze."  │
│                                     │
│ ⚰️  CEMENTIRI:                      │
│ "El nom va copiat de la làpida."   │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ 🎙️ VOZ DEL RECTOR (feble):          │
│ "La clau... la vaig llençar a      │
│ la foscor. Trobeu-la..."           │
│                                     │
├─────────────────────────────────────┤
│  📍    │  📔   │   ⭕   │  📖   │ 🎖️  │
└─────────────────────────────────────┘
```

**Funcionalitat:**
- Missatge inicial de Bernat (context)
- Descobriments de cada estació (es desbloquejan a mesura que es resolen)
- Veu del rector quan entra l'Acte II
- Scroll vertical
- Text narratiu (no interactiu)

---

## Pantalla 4: SALVOS (Salconduits)

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ Temps restant: 01:23:45         │
│                                     │
├─────────────────────────────────────┤
│     🎖️ SALCONDUITS DE L'EMISSARI    │
│                                     │
│   ██████  ██████  ██████            │
│   VALID  │ VALID  │ VALID           │
│    #1   │  #2    │  #3             │
│                                     │
│                                     │
│ ⬜ Perdut al control (nit 15)       │
│                                     │
│                                     │
│                                     │
│ ⚠️  NORMA:                          │
│ "Si perds els 3 salconduits,       │
│  l'Emissari et deté a la Rectoria  │
│  i pierds temps."                   │
│                                     │
├─────────────────────────────────────┤
│  📍    │  📔   │   ⭕   │  📖   │ 🎖️  │
└─────────────────────────────────────┘
```

**Funcionalitat:**
- Representació visual dels 3 salconduits (barres)
- Cada un que es perd → trena gràfica
- Avís si perds els 3
- Només text informatiu (no interactiu)

---

## Estacions (Dins del MAPA)

Quan clica una estació, carrega el joc específic:

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ Temps restant: 00:45:30         │
│                                     │
├─────────────────────────────────────┤
│   🔥 SERRAT DE LES BRUIXES         │
│                                     │
│   Taula 5×5 (quadrat de Polibi)    │
│   Pregunta: "Què diuen les        │
│   fogueres?"                        │
│                                     │
│   [INPUT: _____________]            │
│                                     │
│   [Enviar]  [Pista]                 │
│                                     │
│   [Tornar al mapa]                  │
│                                     │
├─────────────────────────────────────┤
│  📍    │  📔   │   ⭕   │  📖   │ 🎖️  │
└─────────────────────────────────────┘
```

---

## Especificacions Visuals

### Colors
```
Fons principal:      #F5E6D3 (beige)
Text principal:      #1a1a1a (negre fosc)
Accents:             #D4AF37 (or vell)
Fons botó:           #5D4E37 (marró fosca)
Text botó:           #F5E6D3
Perill/Risc:         #A0522D (siena)
Èxit/Resolt:         #6B8E23 (verd oliva)
Blocked:             #999999 (gris)
```

### Tipografia
```
Títols:     Serif d'època (Crimson Text, Cardo, EB Garamond)
            Mida: 24px, pes: bold
Text:       Serif (mateixa que títols, però regular)
            Mida: 14-16px
Botons:     Sans-serif (inter, -apple-system)
            Mida: 14px, pes: 500
Cronometre: Monospace (Courier New, Courier)
            Mida: 48px, pes: bold
```

### Mides
```
Cronometre:     40% de la pantalla superior
Contingut:      60% de la pantalla
Menú inferior:  48px alçada (5 botons de 48px)
Botó QR:        60px diàmetre (cercle, centrat)
Botons altres:  48px alçada × ~18% ample
Marges:         16px a tots els costats
```

### Responsive
```
Mobile:    375×812 (iPhone SE) — full viewport
Tablet:    768×1024 — adaptat però no primari
Desktop:   No suportat (joc físic, mòbil només)
```

---

## Interactivitat i Flux

### FORA DE JOC (botó central = 🔍 ESCANEJA)

| Acció | Resultat |
|-------|----------|
| Clic botó MAPA | Mostra les 4 estacions |
| Clic botó QUADERN | Mostra evidències i sospitosos |
| Clic botó ESCANEJA (🔍) | Obri càmera per escaneja QR |
| Clic botó HISTÓRIA | Mostra narrativa |
| Clic botó SALVOS | Mostra salconduits |
| Escaneja QR d'estació | → Carrega joc de l'estació, botó canvia a 🎮 |

### DINS D'UN JOC (botó central = 🎮 JOC OBERT)

| Acció | Resultat |
|-------|----------|
| Clic botó MAPA | Mostra estacions (joc roman obert en memòria) |
| Clic botó QUADERN | Mostra evidències (joc roman obert) |
| Clic botó JOC OBERT (🎮) | **Torna a la pantalla del joc actual** |
| Clic botó HISTÓRIA | Mostra narrativa (joc roman obert) |
| Clic botó SALVOS | Mostra salconduits (joc roman obert) |
| Clic "Tornar al mapa" (botó fix) | Tanca el joc → botó torna a 🔍 ESCANEJA |

### Flux Exemple

```
1. Hub principal (botó = 🔍)
   ↓ clic "ESCANEJA"
2. Càmera QR
   ↓ escaneja cartell
3. JOC OBERT: Serrat de les Bruixes (botó = 🎮)
   ↓ clic "MAPA"
4. MAPA (joc roman en memòria)
   ↓ clic "🎮 JOC OBERT"
5. JOC OBERT: Serrat de les Bruixes (continua on era)
   ↓ clic "QUADERN"
6. QUADERN (joc roman en memòria)
   ↓ clic "🎮 JOC OBERT"
7. JOC OBERT: Serrat de les Bruixes (continua on era)
   ↓ clic "Tornar al mapa" (botó definitiu dins joc)
8. Hub principal (botó = 🔍)
```

---

## Fases del Joc (Canvis de Layout)

### Acte I: Investigació
- Menu de 5 botons sempre visible
- Pantalla MAPA mostra estacions clicables
- Cronometre visible i comptat enrere
- Quadern es va omplint amb evidències

### Acte II: El Gir (Pla del Masset)
- Pantalla de rol (control de l'Emissari) — menú ocult
- Posterior: pantalla d'acusació — menú ocult
- Es desbloqueja la veu del rector a HISTÓRIA

### Acte III: Obtenir la Carta i Sometent
- Pantalla caixa de les almoines — menú ocult
- Pantalla lliurada de carta + decisió moral — menú ocult
- Pantalla codi del sometent — menú ocult
- Epíleg i ranking — menú ocult

---

## Notas d'Implementació

### Persistència del Joc Obert
1. **State management:** Zustand guarda `currentGameId` i `currentGameState` (el que ha omplert).
2. **Alternança de vistes:** Clic a MAPA/QUADERN/etc. només canvia la vista visual, no tanca el joc.
3. **Botó 🎮 JOC OBERT:** Renderitza el component del joc (amb el state guardat).
4. **Sortida definitiva:** Botó "Tornar al mapa" dins el joc tanca completament (`currentGameId = null`).

### Cronometre i Realtime
1. **Cronometre:** Supabase Realtime actualitza tots els dispositius de l'equip en temps real.
2. **Visibility:** El cronometre és sempre visible al capdamunt (no importa quina vista estàs).
3. **Sincronització:** Tots els mòbils del equip veuen la mateixa hora (servertime).

### QR Scanner
1. **Botó 🔍 ESCANEJA:** Obri la càmera en fullscreen quan clica.
2. **Detecció:** `@yudiel/react-qr-scanner` processa el codi QR.
3. **Validació:** Server verifica que el token és vàlid per a l'equip.
4. **Error:** Si token no és vàlid, mostra missatge i torna al hub.

### Dades i Seguretat
1. **Dades:** Només es carreguen de servidor amb `import "server-only"` — never client-side.
2. **RLS:** Supabase RLS assegura que cada equip veuen només les seves dades.
3. **Solucions:** Les respostes correctes viuen a `content/private/` (servidor només).
4. **Tokens:** Els tokens de QR són aleatòris i no predibles.

### Offline
1. **Càrrega:** Les estacions funcionen offline un cop estàn carregades (Next.js + service worker).
2. **Limitació:** Sense connexió, els jocs no es sincronitzen amb altres dispositius de l'equip.
3. **Avís:** Si cau la connexió, mostra un avís (però el joc continua funcionant).

### Component Structure

```
<GameHub>
  ├── <Header> (cronometre always visible)
  ├── <MainContent>
  │   ├── <MapView>
  │   ├── <QuadernView>
  │   ├── <HistoriaView>
  │   ├── <SalvosView>
  │   └── <CurrentGame> (persistent in Zustand)
  └── <BottomNav>
      ├── MAPA
      ├── QUADERN
      ├── CentralButton (🔍 or 🎮)
      ├── HISTÓRIA
      └── SALVOS
```
