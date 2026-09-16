# 🎨 Fase 2: UI Base Jugador

**Status:** 📋 Planejament  
**Durada:** 3 hores  
**Inici:** Setmana 2  
**Dependency:** Fase 1 completada (BD + auth)  
**Branch:** `phase/2-ui-base`

---

## 🎯 Objectiu

Construir UI mobile-first per a jugadors: hub d'entrada, navegació, cronometre real-time, quadern de sospitosos/evidències/codi.

**Post-Fase 2 Estado:** Webapp és navegable però sense jocs (estacions buits).

---

## 🏗️ Arquitectura Visual

```
(player)/joc/
├── layout.tsx              (PlayerLayout wrapper)
├── page.tsx                (Hub — entrada + informació)
├── mapa.tsx                (Mapa interactiu La Guixa)
├── quadern/
│   ├── layout.tsx
│   └── page.tsx            (3 tabs: Sospitosos | Evidències | Codi)
└── s/[token]/
    └── page.tsx            (Placeholder per a estacions — Fase 3)

components/
├── layout/
│   ├── PlayerLayout.tsx    (Navbar + main + footer)
│   ├── Navbar.tsx          (Logo + nom equip + cronometre + salconduits)
│   ├── Footer.tsx          (Navigation buttons)
│   └── MobileNav.tsx       (Tab buttons)
├── player/
│   ├── HubCard.tsx         (Status card)
│   ├── SuspectCard.tsx     (Fitxa sospitós)
│   ├── EvidenceCard.tsx    (Fitxa evidència)
│   ├── Map.tsx             (Leaflet mapa)
│   └── CodeDisplay.tsx     (4 xifres vacies)
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Tabs.tsx
    └── Badge.tsx           (status badges)

lib/
├── realtime/
│   ├── useCountdown.ts     (Subscripció countdown)
│   ├── useSession.ts       (Subscripció dades equip)
│   └── useEvidences.ts     (Subscripció evidències desbloquejan)
└── ui/
    └── theme.ts            (Tailwind colors + sizes)
```

---

## 📋 Checklist Detallat

### 1. PlayerLayout — Wrapper Principal
- [ ] Fitxer: `components/layout/PlayerLayout.tsx`
- [ ] Estructura:
  ```
  <div className="flex flex-col h-screen">
    <Navbar />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
    <Footer />
  </div>
  ```
- [ ] 100vh height (full viewport)
- [ ] Flex layout: navbar + content + footer
- [ ] Mobile-first: responsive padding (16px gutter)

### 2. Navbar Component
- [ ] Fitxer: `components/layout/Navbar.tsx`
- [ ] Elements:
  - Logo / Títol "El Traïdor de la Guixa" (text-based)
  - **Centro:** Nom equip (ex: "GRUP 1") + badge variant (ex: "Variant A")
  - **Dreta:**
    - Cronometre (MM:SS) — color dinàmic
    - 3 icones salconduit (braçal) — gris si consumit
- [ ] Altura: 64px
- [ ] Background: semi-transparent fosc (backdrop-blur)
- [ ] Sticky top
- [ ] Realtime update: cronometre cada segon

### 3. Footer Component
- [ ] Fitxer: `components/layout/Footer.tsx`
- [ ] 4 botons equidistants (flex space-around):
  - 🏠 Hub (active indicator)
  - 🗺️ Mapa
  - 📖 Quadern
  - 🎫 Salvaconductes
- [ ] Altura: 60px
- [ ] Sticky bottom
- [ ] Actiu: highlight + underline
- [ ] Links: `useRouter` navigation

### 4. Hub Page (`/joc`)
- [ ] Fitxer: `app/(player)/joc/page.tsx`
- [ ] Estructura:
  ```
  <PlayerLayout>
    <div className="p-4 space-y-6">
      <Greeting />           {/* "Benvinguts, Grup X" */}
      <ActStatus />          {/* "Acte I — Investigació" */}
      <StationsProgress />   {/* Progress: 4/4 estacions */}
      <ActionButtons />      {/* Scanejar QR, Mapa, Quadern */}
    </div>
  </PlayerLayout>
  ```
- [ ] **Greeting:** Títol dinàmic "Benvinguts, [nom_equip]"
- [ ] **Act Status:** Card "ACTE I - INVESTIGACIÓ" (color: blue)
- [ ] **Progress:** Barreta progreso 0–4 estacions (+ text "0/4 resoltes")
- [ ] **Buttons:** 3 grans botons (48px min height)
  - "🔍 Escaneja QR d'estació" → `/joc/s/[token]`
  - "🗺️ Veure Mapa" → `/joc/mapa`
  - "📖 Obrir Quadern" → `/joc/quadern`
- [ ] Responsiu: stack vertical a mobile, 2 col a tablet+

### 5. Map Page (`/joc/mapa`)
- [ ] Fitxer: `app/(player)/joc/mapa.tsx`
- [ ] Setup Leaflet:
  ```typescript
  npm install react-leaflet leaflet
  ```
- [ ] Mapa:
  - SVG base (La Guixa outline — 800×600px escalat)
  - Coordenades SVG per a cada estació (ficar-les a `content/public/coordinates.json`)
  - 7 markers (CircleMarker):
    - 4 Acte I (Serrat, Font, Planes, Cementiri)
    - 3 Acte II/III (Masset, Rectoria, Campanar)
- [ ] Colors de marker:
  - Gris clar (#999): no accessible
  - Verd (#4ade80): resolt
  - Taronja (#facc15): descobert (accessible pero no resolt)
- [ ] Click marker: redirecció a estació (si accesible)
- [ ] Légende: "Legenda" botó que mostra colors

### 6. Salvaconductes Page (`/joc/salvaconductes`)
- [ ] Fitxer: `app/(player)/joc/salvaconductes/page.tsx`
- [ ] **Informació:**
  - Títol: "Salvaconductes (Salconduits)"
  - Descripció narrativa: "Els salconduits us permeten passar pel Control de l'Emissari sense que us dubti. Cada vegada que falleu el control, en perdreu un."
- [ ] **Visual:**
  - 3 braçals (icons o imatges)
  - Cada braçal mostra status:
    - Verd/complet: "Disponible"
    - Gris/consult: "Perdut el [hora]"
  - Contador: "X/3 restants"
- [ ] **Timeline (Log):**
  - Llista d'events:
    - "15:32 — Control de l'Emissari: FALLIT. Perdut 1 salconduit."
    - "14:20 — Control de l'Emissari: PASSAT. Salconduits mantinguts."
  - Realtime updates
- [ ] **Info Box:**
  - "Quan n'arribes a 0: pots continuar jugant, però perdràs salconduits adicionals com a penalització."
- [ ] Responsive: mobile-first

---

### 7. Quadern Page (`/joc/quadern`)
- [ ] Fitxer: `app/(player)/joc/quadern/page.tsx`
- [ ] 3 tabs (shadcn Tabs):
  - **Tab 1: Sospitosos**
    - 6 cards (3 col mobile, 2 col tablet, 3 col desktop)
    - Cada card:
      - Foto (placeholder o gravat)
      - Nom (ex: "Pere del Molí")
      - Rol (ex: "Moliner")
      - Status badge:
        - "🔍 Sospitós" (initial)
        - "✗ Descartat" (grayed out)
        - "⚠️ Traïdor" (red, revealed jog 6)
    - Ordre: 6 sospitosos + (futur) traïdor reveal
  - **Tab 2: Evidències**
    - 0 initially (mostrar "sense evidències desbloquejan")
    - Al resoldre estacions: evidències apareixen (real-time)
    - Cada card:
      - Icona (ex: 🔥 per firebeacons)
      - Títol (ex: "Senyals dels vigies")
      - Data desbloqueig (ex: "Descoberta: 14:32")
      - Click → expand (full descripció)
  - **Tab 3: Codi**
    - Títol "Codi del Campanar"
    - 4 digits: [ _ ][ _ ][ _ ][ _ ]
    - Al resoldre Jogs 1–4: digits omplits real-time
    - Font gran (24px+)
- [ ] Realtime updates: subscripció BD per a evidències + code_digits

### 7. Data Flow & State Management

#### Real-Time Subscriptions (Zustand + Supabase)
- [ ] Store: `lib/store/gameStore.ts`
  ```typescript
  type GameStore = {
    session: Session | null
    countdown: number
    solvedStations: string[]
    codeDigits: string[]
    evidences: Evidence[]
    suspects: Suspect[]
  }
  ```
- [ ] Hook: `useCountdown()`
  - Subscripció Realtime a `sessions` table
  - Emits countdown cada segon
  - Format: MM:SS
- [ ] Hook: `useSession()`
  - Subscripció Realtime a `sessions.solved_stations[]`
  - Subscripció a `sessions.code_digits[]`
- [ ] Hook: `useEvidences()`
  - Subscripció Realtime a `sessions.evidence_unlocked[]`
  - Subscripció a suspect descartats

### 8. Styling & Theme

#### Tailwind Configuration
- [ ] Paleta (de PRD secció 16):
  - Primary: `#8B4513` (marró medieval)
  - Secondary: `#D4AF37` (or medieval)
  - Status colors:
    - Green (resolved): `#22c55e`
    - Gray (unavailable): `#9ca3af`
    - Orange (discovered): `#f97316`
    - Red (traitor/failed): `#ef4444`
- [ ] Typography:
  - Heading: 24px+ (mobile), 32px (desktop)
  - Body: 16px minimum
  - Small: 14px
- [ ] Spacing: 4px base unit (Tailwind default)
- [ ] Border radius: 8px (cards), 4px (buttons)

#### Accessibility (WCAG AA)
- [ ] Contrast: all text ≥4.5:1 (heading), ≥3:1 (decorative)
- [ ] Touch targets: all buttons ≥48px × 48px
- [ ] Focus states: visible outline (2px)
- [ ] Keyboard nav: Tab order logical (header → main → footer)
- [ ] Color not sole indicator: text + icon + badge
- [ ] Alt text: `<img alt="..." />`
- [ ] ARIA labels: `aria-label` per a icon buttons

### 9. Responsive Design
- [ ] Breakpoints:
  - Mobile: 375px (iphone SE)
  - Tablet: 768px (ipad)
  - Desktop: 1024px+
- [ ] Mobile-first: base styles mobile, add desktop at breakpoints
- [ ] No horizontal scroll (ever)
- [ ] Images: `<Image>` component (Next.js) amb `max-w-full`
- [ ] Maps: responsive container (aspect-ratio 4/3)

### 10. Testing Manual
- [ ] **Device 1: iPhone SE (375px)**
  - [ ] Hub page: all buttons visible, no truncation
  - [ ] Mapa: cargas and pans
  - [ ] Quadern: tabs switchable, cards stack
  - [ ] Navbar: cronometre visible, salconduits visible
- [ ] **Device 2: iPad (768px)**
  - [ ] Layout 2-col where appropriate
  - [ ] Map: larger, usable
- [ ] **Device 3: Desktop (1920px)**
  - [ ] Layout 3-col (sospitosos)
  - [ ] Comfortable spacing
- [ ] **Dark mode:** if enabled in system, page respects
- [ ] **Realtime:**
  - [ ] Open 2 windows, verify countdown synced
  - [ ] Trigger Fase 1 test (mark station solved), verify progress updates

---

## 📊 Components Checklist

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| PlayerLayout | `components/layout/PlayerLayout.tsx` | [ ] | Wrapper principal |
| Navbar | `components/layout/Navbar.tsx` | [ ] | Sticky top, realtime |
| Footer | `components/layout/Footer.tsx` | [ ] | Sticky bottom, 4 nav buttons |
| Hub Page | `app/(player)/joc/page.tsx` | [ ] | Entrada principal |
| Hub Greeting | `components/player/HubGreeting.tsx` | [ ] | Title dinàmic |
| Hub Status | `components/player/HubStatus.tsx` | [ ] | Act + progress |
| Map | `app/(player)/joc/mapa.tsx` | [ ] | Leaflet map |
| Map Marker | `components/player/MapMarker.tsx` | [ ] | SVG circle markers |
| Salvaconductes | `app/(player)/joc/salvaconductes/page.tsx` | [ ] | Salconduits page |
| Salconduit Card | `components/player/SalconduitCard.tsx` | [ ] | Visual braçal |
| Event Timeline | `components/player/EventTimeline.tsx` | [ ] | Salconduit log |
| Quadern | `app/(player)/joc/quadern/page.tsx` | [ ] | 3 tabs |
| Suspect Card | `components/player/SuspectCard.tsx` | [ ] | Photo + status |
| Evidence Card | `components/player/EvidenceCard.tsx` | [ ] | Expandable |
| Code Display | `components/player/CodeDisplay.tsx` | [ ] | 4 xifres |

---

## 🎬 Implementation Order

1. **Setup & Config** (30 min)
   - [ ] Tailwind config actualitzat (colors, spacing)
   - [ ] Leaflet + React-Leaflet installed
   - [ ] Zustand store setup

2. **Layout Base** (45 min)
   - [ ] PlayerLayout
   - [ ] Navbar
   - [ ] Footer
   - [ ] Test: navigation between pages

3. **Hub & Status** (45 min)
   - [ ] Hub page
   - [ ] HubGreeting
   - [ ] HubStatus (progress bar)
   - [ ] Test: displays correctly, responsive

4. **Mapa** (30 min)
   - [ ] Leaflet map carrega
   - [ ] 7 markers amb colors
   - [ ] Click handlers (future: redirect)
   - [ ] Test: markers visible, responsive

5. **Quadern** (30 min)
   - [ ] 3 tabs structure
   - [ ] Suspect cards (6)
   - [ ] Evidence cards (empty initially)
   - [ ] Code display (4 slots)
   - [ ] Test: tabs switchable, realtime suscriptions work

---

## ✅ Criteris d'Èxit

- ✅ Hub page renderitza correctament (mobile + desktop)
- ✅ Mapa carrega i markers visible
- ✅ Quadern mostra 3 tabs funcionals
- ✅ Cronometre countdown visible i real-time
- ✅ Salconduits mostra 3 icones dinàmiques
- ✅ Accessibility: WCAG AA (contrast, touch targets, keyboard nav)
- ✅ Mobile responsive (375px–1920px sense horizontal scroll)
- ✅ Realtime updates: sincronitzats entre sessions
- ✅ No console errors o warnings

---

## 🔧 Stack & Dependencies

```bash
npm install react-leaflet leaflet zustand
npm install -D @tailwindcss/forms @tailwindcss/typography
```

- **Layouts:** Tailwind flexbox
- **State:** Zustand + Supabase Realtime
- **Maps:** Leaflet + React-Leaflet
- **UI Components:** shadcn/ui (Button, Card, Tabs, Badge)

---

## 🚀 Pròxim Pas

→ **[Fase 3: Jocs 1–4](./DEV-PHASE-3.md)** (~12 hores)

Una vegada Fase 2 completada, la webapp és navegable però estacions són buits. Fase 3 connecta els jocs amb validació al servidor.
