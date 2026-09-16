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
app/(player)/
├── layout.tsx              (⭐ Next.js Layout: Navbar + main + Footer persistent)
├── page.tsx                (Hub — entrada + informació)
├── mapa.tsx                (Mapa interactiu La Guixa)
├── quadern/
│   ├── layout.tsx          (Tabs layout si necessari)
│   └── page.tsx            (3 tabs: Sospitosos | Evidències | Codi)
├── salvaconductes/
│   └── page.tsx            (Salconduits page)
└── s/[token]/
    └── page.tsx            (Placeholder per a estacions — Fase 3)

components/layout/
├── Navbar.tsx              (Logo + nom equip + cronometre + salconduits)
├── Footer.tsx              (Navigation buttons — sticky bottom)
└── MobileNav.tsx           (Tab button helpers — optional)

components/player/
├── HubCard.tsx             (Status card)
├── HubGreeting.tsx         (Greeting dinàmic)
├── HubStatus.tsx           (Act + progress)
├── SuspectCard.tsx         (Fitxa sospitós)
├── EvidenceCard.tsx        (Fitxa evidència)
├── SalconduitCard.tsx      (Visual braçal)
├── EventTimeline.tsx       (Salconduit log)
├── Map.tsx                 (Leaflet mapa)
├── MapMarker.tsx           (SVG circle markers)
└── CodeDisplay.tsx         (4 xifres vacies)

components/ui/
├── Button.tsx
├── Card.tsx
├── Tabs.tsx
└── Badge.tsx               (status badges)

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

### 1. PlayerLayout — Next.js Layout File
- [ ] Fitxer: `app/(player)/layout.tsx` ⭐ (NOT a component!)
- [ ] Import: `<Navbar />` + `<Footer />` from components/layout/
- [ ] Estructura:
  ```typescript
  export default function PlayerLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>
    )
  }
  ```
- [ ] ⭐ **IMPORTANT:** This is a Next.js layout — wraps ALL routes in `(player)/`
- [ ] 100vh height (full viewport)
- [ ] Flex layout: navbar + content + footer
- [ ] Mobile-first: responsive padding (16px gutter)
- [ ] State persistence: Navbar countdown/salconduits don't reset on navigation

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
- [ ] Fitxer: `app/(player)/page.tsx` (routes to `/joc` via Next.js routing)
- [ ] ⭐ **NOTE:** Wrapped by `app/(player)/layout.tsx` automatically
- [ ] Content structure (inside layout's `{children}`):
  ```typescript
  export default function JocHub() {
    return (
      <div className="p-4 space-y-6">
        <HubGreeting />        {/* "Benvinguts, Grup X" */}
        <HubStatus />          {/* "Acte I — Investigació" */}
        <StationsProgress />   {/* Progress: 4/4 estacions */}
        <ActionButtons />      {/* Scanejar QR, Mapa, Quadern */}
      </div>
    )
  }
  ```
- [ ] **Greeting:** Títol dinàmic "Benvinguts, [nom_equip]"
- [ ] **Act Status:** Card "ACTE I - INVESTIGACIÓ" (color: blue)
- [ ] **Progress:** Barreta progreso 0–4 estacions (+ text "0/4 resoltes")
- [ ] **Buttons:** 3 grans botons (48px min height)
  - "🔍 Escaneja QR d'estació" → `/joc/s/[token]`
  - "🗺️ Veure Mapa" → `/joc/mapa`
  - "📖 Obrir Quadern" → `/joc/quadern`
- [ ] Responsiu: stack vertical a mobile, 2 col a tablet+

### 5. Map Page (`/mapa`)
- [ ] Fitxer: `app/(player)/mapa.tsx`
- [ ] ⭐ Wrapped by `app/(player)/layout.tsx` (same Navbar/Footer persist)
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

### 6. Salvaconductes Page (`/salvaconductes`)
- [ ] Fitxer: `app/(player)/salvaconductes/page.tsx`
- [ ] ⭐ Wrapped by `app/(player)/layout.tsx` (Navbar/Footer persist)
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

### 7. Quadern Page (`/quadern`)
- [ ] Fitxer: `app/(player)/quadern/page.tsx`
- [ ] ⭐ Wrapped by `app/(player)/layout.tsx` (Navbar/Footer persist)
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

## 📊 Components & Pages Checklist

| Item | File | Type | Status | Notes |
|------|------|------|--------|-------|
| Player Layout | `app/(player)/layout.tsx` | Layout | [ ] | ⭐ Next.js layout (persistent) |
| Navbar | `components/layout/Navbar.tsx` | Component | [ ] | Sticky top, realtime, sticky in layout |
| Footer | `components/layout/Footer.tsx` | Component | [ ] | Sticky bottom, 4 nav buttons |
| Hub Page | `app/(player)/page.tsx` | Page | [ ] | Entrada principal (`/joc`) |
| Hub Greeting | `components/player/HubGreeting.tsx` | Component | [ ] | Title dinàmic |
| Hub Status | `components/player/HubStatus.tsx` | Component | [ ] | Act + progress bar |
| Map Page | `app/(player)/mapa.tsx` | Page | [ ] | Leaflet map full page |
| Map Component | `components/player/Map.tsx` | Component | [ ] | Leaflet wrapper |
| Map Marker | `components/player/MapMarker.tsx` | Component | [ ] | SVG circle markers |
| Salconduits Page | `app/(player)/salvaconductes/page.tsx` | Page | [ ] | Salconduits info |
| Salconduit Card | `components/player/SalconduitCard.tsx` | Component | [ ] | Visual braçal |
| Event Timeline | `components/player/EventTimeline.tsx` | Component | [ ] | Salconduit event log |
| Quadern Page | `app/(player)/quadern/page.tsx` | Page | [ ] | 3 tabs container |
| Suspect Card | `components/player/SuspectCard.tsx` | Component | [ ] | Photo + status badge |
| Evidence Card | `components/player/EvidenceCard.tsx` | Component | [ ] | Expandable item |
| Code Display | `components/player/CodeDisplay.tsx` | Component | [ ] | 4 xifres slots |

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
