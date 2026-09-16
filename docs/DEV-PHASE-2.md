# 🎨 Fase 2: UI Base Jugador + Entry Flow + Realtime

**Status:** 📋 Planejament  
**Durada:** 5–6 hores (expanded: realtime + entry flow + layout + pages)  
**Inici:** Setmana 2–3  
**Dependency:** Fase 1 completada (BD + auth + API routes + Realtime enabled)  
**Branch:** `phase/2-ui-base`

---

## 🎯 Objectiu

Construir UI mobile-first per a jugadors: hub d'entrada, navegació, cronometre real-time, quadern de sospitosos/evidències/codi.

**Post-Fase 2 Estado:** Webapp és navegable però sense jocs (estacions buits).

---

## 🏗️ Arquitectura Visual

```
app/
├── page.tsx                (⭐ Redirect to /enter)
├── enter/
│   └── page.tsx            (⭐ QR scanner + signin flow — NO layout wrapper)
└── (player)/
    ├── layout.tsx          (⭐ Next.js Layout: Navbar + main + Footer persistent)
    ├── page.tsx            (Hub — entrada + informació)
    ├── mapa.tsx            (Mapa interactiu La Guixa)
    ├── quadern/
    │   ├── layout.tsx      (Tabs layout si necessari)
    │   └── page.tsx        (3 tabs: Sospitosos | Evidències | Codi)
    ├── salvaconductes/
    │   └── page.tsx        (Salconduits page)
    └── s/[token]/
        └── page.tsx        (Placeholder per a estacions — Fase 3)

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

### 0. Entry Flow (Signin/QR)
- [ ] Fitxer: `app/page.tsx` (root index)
  - Simple redirect: `redirect('/enter')`
- [ ] Fitxer: `app/enter/page.tsx` (⭐ NOT wrapped by `(player)/layout.tsx`)
- [ ] UI Elements:
  - [ ] Logo "El Traïdor de la Guixa" (centered, prominent)
  - [ ] Subtítol: "Entra al joc"
  - [ ] **Option 1: QR Scanner**
    - [ ] Button "📱 Escaneja QR d'equip"
    - [ ] Click → opens `@yudiel/react-qr-scanner`
    - [ ] Decoder scans GRUP1–GRUP8 codes
    - [ ] Success → proceed to name prompt
  - [ ] **Option 2: Manual Code Entry**
    - [ ] Text input: "Codi d'equip (ex: GRUP1)"
    - [ ] Validator: 4–6 chars alphanumeric
    - [ ] Submit → proceed to name prompt
  - [ ] **Name Prompt (either path)**
    - [ ] Dialog: "Quin és el teu nom?"
    - [ ] Input field (max 50 chars)
    - [ ] Submit button
- [ ] Form Validation (Zod):
  ```typescript
  const entrySchema = z.object({
    teamCode: z.string().min(4).max(6).toUpperCase(),
    playerName: z.string().min(1).max(50)
  })
  ```
- [ ] Submit Handler:
  - [ ] POST `/api/auth/signin` with `{ teamCode, playerName }`
  - [ ] On success: store `session_id` (localStorage or cookie)
  - [ ] Redirect to `/joc` (Hub page)
  - [ ] On error: show error message (team not found, etc.)
- [ ] Error Handling:
  - [ ] "Equip no trovate" (team code invalid)
  - [ ] "Error al connectar" (network error)
  - [ ] Auto-retry or manual retry button
- [ ] Styling:
  - [ ] Mobile-first (full screen)
  - [ ] Center content vertically
  - [ ] Large touch targets (48px+ buttons)
  - [ ] High contrast (PRD colors)
  - [ ] No Navbar/Footer (clean entry)

---

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
- [ ] 4 tabs (shadcn Tabs):
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
  - **Tab 4: Sellos ⭐ (NEW — for Treasure Box)**
    - Títol "Sellos de la Caixa"
    - Descripció: "Cada joc revela un seal (tanca). Necessitarás la seqüència correcta per obrir la caixa!"
    - Llista 4 sellos (es desbloquegen progressivament):
      - [ ] Jog 1 resolt → Seal 1: 🔥 Foc (Digit 4)
      - [ ] Jog 2 resolt → Seal 2: 🪨 Pedra (Digit 2)
      - [ ] Jog 3 resolt → Seal 3: 💨 Aire (Digit 3)
      - [ ] Jog 4 resolt → Seal 4: 💧 Aigua (Digit 1)
    - Display: "Ordre correcte: [4️⃣ 🔥] [2️⃣ 🪨] [3️⃣ 💨] [1️⃣ 💧]"
    - Realtime: Cada seal apareix instantly after jog completion
- [ ] Realtime updates: subscripció BD per a evidències + code_digits + seals

### 7. Realtime Integration (Zustand + Supabase) ⭐

#### 7.1 Zustand Store Setup
- [ ] Fitxer: `lib/store/gameStore.ts`
- [ ] Schema:
  ```typescript
  interface GameStore {
    // Session metadata
    sessionId: string | null
    teamCode: string
    variant: 'A' | 'B' | 'C'
    
    // Game state (synced from BD via Realtime)
    currentAct: number
    solvedStations: string[]      // ["jog_1", "jog_2", ...]
    codeDigits: string[]          // ["4", "2", "3", "1"]
    score: number
    
    // Evidence & suspects
    evidenceUnlocked: string[]    // ["fire_beacons", "water_ledger", ...]
    suspectsDismissed: string[]   // ["Pere", "Joan", ...]
    
    // Countdown
    startedAt: Date
    expiresAt: Date
    remainingSeconds: number
    
    // Salconduits
    salconduits: number           // 0-3
    salconduitUsed: string[]      // ["14:32", "15:45", ...]
    
    // Setters (called by hooks)
    setSession(data: Partial<GameStore>)
    updateCountdown(seconds: number)
    addEvidence(id: string)
    dismissSuspect(name: string)
    useSalconduit(timestamp: string)
  }
  ```
- [ ] Store created: `export const useGameStore = create<GameStore>(...)`
- [ ] Persist to localStorage (optional, for resilience)

#### 7.2 Hook: `useCountdown()` (1h implementation)
- [ ] Fitxer: `lib/hooks/useCountdown.ts`
- [ ] Funcionalitat:
  ```typescript
  export function useCountdown() {
    const { startedAt, expiresAt, remainingSeconds, updateCountdown } = useGameStore()
    const sessionId = useGameStore(s => s.sessionId)
    
    // 1. Interval: update every second (client-side tick)
    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date()
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
        updateCountdown(remaining)
        
        if (remaining === 0) {
          // Game over — redirect or show timeout screen
          window.location.href = '/joc/timeout'
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }, [expiresAt])
    
    // 2. Realtime subscription: sync if server updates expires_at
    useEffect(() => {
      if (!sessionId) return
      
      const channel = supabase
        .channel(`session:${sessionId}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
          (payload) => {
            if (payload.new.expires_at) {
              updateCountdown(Math.max(0, Math.floor((new Date(payload.new.expires_at) - new Date()) / 1000)))
            }
          }
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
    }, [sessionId])
    
    return remainingSeconds
  }
  ```
- [ ] Format display: `MM:SS` (helpers: `secondsToMMSS(seconds)`)
- [ ] Color coding:
  - Green: >30 min remaining
  - Orange: 15–30 min
  - Red: <15 min
  - Gray: 0 (expired)

#### 7.3 Hook: `useSession()` (1h implementation)
- [ ] Fitxer: `lib/hooks/useSession.ts`
- [ ] Funcionalitat:
  ```typescript
  export function useSession() {
    const sessionId = useGameStore(s => s.sessionId)
    const setSession = useGameStore(s => s.setSession)
    
    // 1. Load session once on mount
    useEffect(() => {
      if (!sessionId) return
      
      const loadSession = async () => {
        const { data: session } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single()
        
        if (session) {
          setSession({
            currentAct: session.current_act,
            solvedStations: session.solved_stations || [],
            codeDigits: session.code_digits || ['', '', '', ''],
            score: session.score,
            evidenceUnlocked: session.evidence_unlocked || [],
            suspectsDismissed: session.suspects_dismissed || [],
            startedAt: new Date(session.started_at),
            expiresAt: new Date(session.expires_at),
            salconduits: session.salconduits_remaining,
            salconduitUsed: session.salconduits_used || []
          })
        }
      }
      
      loadSession()
    }, [sessionId])
    
    // 2. Realtime subscription: sync ALL updates
    useEffect(() => {
      if (!sessionId) return
      
      const channel = supabase
        .channel(`session:${sessionId}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
          (payload) => {
            // On INSERT or UPDATE
            if (payload.new) {
              setSession({
                currentAct: payload.new.current_act,
                solvedStations: payload.new.solved_stations || [],
                codeDigits: payload.new.code_digits || [],
                score: payload.new.score,
                evidenceUnlocked: payload.new.evidence_unlocked || [],
                suspectsDismissed: payload.new.suspects_dismissed || [],
                startedAt: new Date(payload.new.started_at),
                expiresAt: new Date(payload.new.expires_at),
                salconduits: payload.new.salconduits_remaining,
                salconduitUsed: payload.new.salconduits_used || []
              })
            }
          }
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
    }, [sessionId])
  }
  ```
- [ ] Error handling: retry on disconnect, log to console
- [ ] No loading state needed (uses cached data during reconnect)

#### 7.4 Hook: `useEvidences()` (1h implementation)
- [ ] Fitxer: `lib/hooks/useEvidences.ts`
- [ ] Funcionalitat:
  ```typescript
  // Evidence metadata (public data — OK to keep on client)
  const EVIDENCE_MAP = {
    'fire_beacons': { title: 'Senyals dels vigies', suspects: ['Pere', 'Joan'], ... },
    'water_ledger': { title: 'Llibre de reg', suspects: ['Marianna'], ... },
    // ...
  }
  
  export function useEvidences() {
    const sessionId = useGameStore(s => s.sessionId)
    const evidenceUnlocked = useGameStore(s => s.evidenceUnlocked)
    const addEvidence = useGameStore(s => s.addEvidence)
    
    // 1. Load unlocked evidence IDs via useSession() (already subscribed)
    // 2. Map IDs to full evidence objects
    const evidences = evidenceUnlocked.map(id => EVIDENCE_MAP[id])
    
    // 3. Realtime subscription (piggyback on useSession channels)
    useEffect(() => {
      if (!sessionId) return
      
      const channel = supabase
        .channel(`session:${sessionId}`)
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
          (payload) => {
            const newEvidence = payload.new.evidence_unlocked || []
            const oldEvidence = payload.old?.evidence_unlocked || []
            
            // Detect new evidence (array diff)
            const added = newEvidence.filter(e => !oldEvidence.includes(e))
            added.forEach(id => addEvidence(id))
            
            // Trigger animation (optional: add to store)
          }
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
    }, [sessionId])
    
    return evidences
  }
  ```
- [ ] Component usage:
  ```typescript
  // In Quadern Evidence tab
  const evidences = useEvidences()
  return (
    <div>
      {evidences.length === 0 ? (
        <p>Cap evidència desbloquejan</p>
      ) : (
        evidences.map(e => <EvidenceCard key={e.id} {...e} />)
      )}
    </div>
  )
  ```

#### 7.5 Channel Management (Optimization)
- [ ] Create shared channel per sessionId (avoid duplicates)
  ```typescript
  // lib/realtime/channels.ts
  const channels = new Map<string, RealtimeChannel>()
  
  export function getSessionChannel(sessionId: string) {
    if (!channels.has(sessionId)) {
      channels.set(sessionId, supabase.channel(`session:${sessionId}`))
    }
    return channels.get(sessionId)
  }
  ```
- [ ] All 3 hooks use same channel (single subscription)
- [ ] Unsubscribe only when sessionId changes or component unmounts

### 7.6 Testing Realtime (Manual)
- [ ] Open 2 browser windows (same team)
- [ ] Window 1: Resolve Jog 1 (submit answer)
- [ ] Window 2: Verify evidence appears instantly (no refresh needed)
- [ ] Verify countdown synced (both show same time)
- [ ] Disconnect internet → reconnect → verify resync works
- [ ] Test 8 players (8 sessions) — no cross-talk

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
| Root Index | `app/page.tsx` | Page | [ ] | Redirect to `/enter` |
| Entry Page | `app/enter/page.tsx` | Page | [ ] | ⭐ QR scanner + signin (no layout) |
| QR Scanner | `components/auth/QRScanner.tsx` | Component | [ ] | @yudiel/react-qr-scanner wrapper |
| Code Input | `components/auth/CodeInput.tsx` | Component | [ ] | Manual team code input |
| Name Prompt | `components/auth/NamePrompt.tsx` | Component | [ ] | Player name dialog |
| Auth Hook | `lib/auth/useSignin.ts` | Hook | [ ] | POST `/api/auth/signin` + redirect |
| **Zustand Store** | **`lib/store/gameStore.ts`** | **Store** | **[ ]** | **⭐ Central state (countdown, evidence, etc)** |
| **useCountdown Hook** | **`lib/hooks/useCountdown.ts`** | **Hook** | **[ ]** | **⭐ MM:SS countdown + Realtime sync** |
| **useSession Hook** | **`lib/hooks/useSession.ts`** | **Hook** | **[ ]** | **⭐ Load/sync session state** |
| **useEvidences Hook** | **`lib/hooks/useEvidences.ts`** | **Hook** | **[ ]** | **⭐ Evidence list + Realtime updates** |
| **Channel Manager** | **`lib/realtime/channels.ts`** | **Utility** | **[ ]** | **Shared Realtime channels (no duplicates)** |
| **Evidence Map** | **`lib/data/evidenceMap.ts`** | **Data** | **[ ]** | Public evidence metadata (titles, suspects) |
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

1. **Setup & Config** (45 min)
   - [ ] Tailwind config actualitzat (colors, spacing)
   - [ ] Leaflet + React-Leaflet installed
   - [ ] QR scanner library (@yudiel/react-qr-scanner)
   - [ ] Create folder structure (`lib/store/`, `lib/hooks/`, `lib/realtime/`, `lib/data/`)
   - [ ] Test Supabase connection (check Realtime enabled)

2. **Realtime Infrastructure** (1h) ⭐ DO EARLY
   - [ ] Zustand store setup (gameStore.ts)
   - [ ] Channel manager (channels.ts)
   - [ ] Evidence metadata (evidenceMap.ts)
   - [ ] useCountdown hook (with Realtime subscription)
   - [ ] useSession hook (with Realtime subscription)
   - [ ] useEvidences hook (with Realtime subscription)
   - [ ] Test: Manual 2-window sync test (7.6)

3. **Entry Flow** (45 min) ⭐ USES REALTIME SETUP
   - [ ] `app/page.tsx` (redirect)
   - [ ] `app/enter/page.tsx` (entry UI)
   - [ ] QRScanner component
   - [ ] CodeInput component
   - [ ] NamePrompt component
   - [ ] useSignin hook (POST /api/auth/signin)
   - [ ] Error handling + validation
   - [ ] Test: QR scan → signin → redirect to /joc

3. **Layout Base** (45 min)
   - [ ] `app/(player)/layout.tsx` (PlayerLayout)
   - [ ] Navbar component
   - [ ] Footer component
   - [ ] Test: navigation between pages (don't reset state)

4. **Hub & Status** (45 min)
   - [ ] Hub page
   - [ ] HubGreeting
   - [ ] HubStatus (progress bar)
   - [ ] Test: displays correctly, responsive

5. **Mapa** (30 min)
   - [ ] Leaflet map carrega
   - [ ] 7 markers amb colors
   - [ ] Click handlers (future: redirect)
   - [ ] Test: markers visible, responsive

6. **Quadern** (30 min)
   - [ ] 3 tabs structure
   - [ ] Suspect cards (6)
   - [ ] Evidence cards (empty initially)
   - [ ] Code display (4 slots)
   - [ ] Test: tabs switchable, realtime subscriptions work

7. **Salvaconductes** (15 min)
   - [ ] Page structure
   - [ ] Braçals visual
   - [ ] Event timeline
   - [ ] Test: responsive

---

## ✅ Criteris d'Èxit

- ✅ **Entry Flow:**
  - Root `/` redirects to `/enter`
  - QR scanner works (captures GRUP1–GRUP8)
  - Manual code input validates format
  - Name prompt collects player name
  - POST `/api/auth/signin` creates session
  - Redirect to `/joc` after signin
  - Error handling displays user-friendly messages

- ✅ **Player Layout:**
  - Hub page renderitza correctament (mobile + desktop)
  - Navbar persistent (countdown doesn't reset on navigation)
  - Footer navigation working

- ✅ **Content Pages:**
  - Mapa carrega i markers visible
  - Quadern mostra 3 tabs funcionals
  - Salvaconductes page structure complete

- ✅ **Realtime Infrastructure:**
  - Zustand store created + Realtime subscriptions working
  - useCountdown hook: countdown updates every second (MM:SS format)
  - useSession hook: session state syncs across windows
  - useEvidences hook: new evidence appears instantly (no refresh needed)
  - 2-window manual test passes (evidence sync verified)
  - Disconnect/reconnect handled gracefully
  - No duplicate Realtime channels (shared channel manager)

- ✅ **Accessibility:** WCAG AA (contrast, touch targets, keyboard nav)
- ✅ **Mobile responsive:** 375px–1920px sense horizontal scroll
- ✅ **No console errors o warnings**

---

## 🔧 Stack & Dependencies

```bash
# Already installed in Fase 0
npm install @supabase/ssr @supabase/supabase-js zustand zod framer-motion

# New for Fase 2 Realtime
# (zustand already installed, just needs to be used)

# Components & UI
npm install react-leaflet leaflet
npm install -D @tailwindcss/forms @tailwindcss/typography
```

- **State Management:** Zustand (local store)
- **Realtime:** Supabase Realtime websockets (channels, subscriptions)
- **Layouts:** Tailwind flexbox
- **Maps:** Leaflet + React-Leaflet
- **UI Components:** shadcn/ui (Button, Card, Tabs, Badge)
- **Realtime Channels:** Supabase `RealtimeChannel` (postgres_changes events)

---

## 🚀 Pròxim Pas

→ **[Fase 3: Jocs 1–4](./DEV-PHASE-3.md)** (~12 hores)

Una vegada Fase 2 completada, la webapp és navegable però estacions són buits. Fase 3 connecta els jocs amb validació al servidor.
