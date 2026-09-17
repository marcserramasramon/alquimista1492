# 🚀 Pla de Desenvolupament - Fase 7+

**Data:** 2026-09-17  
**Status:** 📋 Pla Preparat  
**Prioritat:** Critical → High → Medium  
**Timeline Total:** 2-3 dies (sprint intensiu)

---

## 📊 Estat Actual

### ✅ Completes
- **Phase 0-6** — Setup, BD, UI, Jocs 1-9, Dashboard, Audio/Animations infraestructura
- **Frontends** — Entry (`/e/[code]`), Hub (`/joc`), QR Station (`/s/[token]`) estructures creades
- **Components** — 5 tabs (Stations, Map, Notebook, Salconduit, Accuse) implementats
- **Games** — 9 components registrats
- **Audio Manager** — Howler.js singleton setup (fitxers placeholder)
- **Real-time** — useTeamState hook creat
- **RLS Security** — Policies SQL preparades, CLI checklist disponible

### ⚠️ Bloqueada (TypeScript Errors)
- **Build:** 14+ TypeScript errors que bloquegen compilació
- **Audio Integration:** Hooks creats pero no integrats a components
- **Animations:** Variants creats pero no integrats
- **E2E Tests:** Escrits pero no executats (selectores placeholder)
- **Mobile Testing:** No ejecutat

### ❌ Pending
- Audio files recording (exterior dev)
- QR scanner integration refinement
- E2E test runs + selector fixes
- Lighthouse audit
- Production deployment

---

## 🎯 Prioritats de Fase 7

### 🔴 **BLOCKER: Fix Errors (Urgent)**
Sense arreglar els 14 TypeScript errors, no es pot compilar ni testejar.

### 🔴 **BLOCKER: Apply RLS Migration**
Sense les policies noves de seguretat, player signup fallarà en producció.

### 🟠 **HIGH: Integrate Audio + Animations**
Audio/animations estan escrits pero no connectats als games.

### 🟡 **MEDIUM: E2E Testing + Mobile**
Tenim tests escrits pero falta executar, ajustar i validar.

---

## 📋 Fase 7.0: Fix TypeScript Errors

### Errors a Solucionar (14 total)

| Error | Fitxer | Causa | Fix |
|-------|--------|-------|-----|
| Property 'team_id' missing | app/(master)/results | Supabase schema mismatch | Add team_id to queries |
| Property 'expires_at' missing | app/api/game/validate-pass | Passes table schema | Verify schema migrations |
| Property 'on' missing (4x) | lib/realtime/useTeamState | Realtime subscription syntax | Use `.on()` from RealtimePostgresChangesPayload |
| MapContainer 'center' prop | components/player/MapTab | react-leaflet prop naming | Use 'initialCenter' or verify leaflet version |
| TileLayer 'attribution' prop | components/player/MapTab | react-leaflet prop naming | Same as MapContainer |
| Audio string type | lib/audio/audioManager | Type mismatch on AudioClip | Fix enum imports |

### Sprint 7.0 (2-3 hores)

```bash
# 1. Analizar i documentar cada error
# 2. Fix cada un secuencialmente
# 3. Verificar build passes
# 4. Commit: "fix: resolve typescript errors and type mismatches"
```

#### 7.0.1: Supabase Schema Validation
```typescript
// lib/db.ts - Add type helpers for all queries
// Verify schema matches actual database
// Check:
// - sessions table has team_id ✓
// - passes table has expires_at, station_id ✓
// - All foreign keys exist
```

#### 7.0.2: Realtime Subscriptions Fix
```typescript
// lib/realtime/useTeamState.ts
// Replace: query.on(...) 
// With: supabase.channel().on('postgres_changes', ...)
// See: https://supabase.com/docs/guides/realtime/postgres-cdc

const channel = supabase.channel(`team:${teamId}`)
channel.on(
  'postgres_changes',
  { event: 'UPDATE', schema: 'public', table: 'team_stations' },
  (payload) => { /* ... */ }
)
```

#### 7.0.3: Leaflet Props Fix
```typescript
// components/player/MapTab.tsx
// MapContainer: use 'initialCenter' not 'center'
// TileLayer: check react-leaflet version compatibility
// Option: Downgrade to known working version or update imports

// Install: npm install leaflet@1.9.x react-leaflet@4.x
```

#### 7.0.4: Audio Type Fix
```typescript
// lib/audio/audioManager.ts
// Ensure AudioClip type is properly exported
// Fix: string → AudioClip enum
```

### Acceptance Criteria
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] `npm run type-check` passes
- [ ] All 9 game components compile
- [ ] `pages/joc` loads without errors
- [ ] No console errors on startup

---

## 📋 Fase 7.1: Apply RLS Security Migration

### What's Needed
- Migration file: `supabase/migrations/20260916000004_secure_rls.sql` ✓ Ready
- Code fix: `lib/auth/player.ts` (use serviceClient) ⏳ Pending
- Testing: Player signup flow validation ⏳ Pending

### Sprint 7.1 (1 hora)

```bash
# 1. Apply migration locally
supabase migration up --local

# 2. Fix lib/auth/player.ts (lines 120-147)
# Replace: supabase.from('sessions').insert(...)
# With: serviceClient.from('sessions').insert(...)

# 3. Test player signup
npm run dev
# Visit http://localhost:3000/e/TEST01
# Enter name → Verify redirect to /joc

# 4. Verify audit logging
# Check Supabase Studio: audit_log table has INSERT entry
```

### Code Change (5 min)
**File:** `lib/auth/player.ts`

```typescript
// Add import at top
import { getServiceRoleClient } from '@/lib/db'

// Replace lines 120-147 with:
} else {
  const serviceClient = getServiceRoleClient()
  const { data: session, error: sessionError } = await serviceClient
    .from('sessions')
    .insert({
      team_id: team.id,
      current_act: 1,
      current_station: null,
      solved_stations: [],
      code_digits: ['', '', '', ''],
      evidence_unlocked: [],
      suspects_dismissed: [],
      salconduits_remaining: 3,
      salconduits_used: [],
    })
    .select()
    .single()
  
  if (sessionError || !session?.id) {
    return { code: 'SESSION_CREATE_FAILED', message: 'Failed' }
  }
  sessionId = session.id
}
```

### Acceptance Criteria
- [ ] Migration applies cleanly
- [ ] Player signup flow works
- [ ] Audit log records session creation
- [ ] No RLS violation errors in console
- [ ] Code change committed

---

## 📋 Fase 7.2: Integrate Audio + Animations

### Infrastructure Ready ✅
- `lib/audio/audioManager.ts` — Howler.js singleton
- `lib/audio/useAudio.ts` — React hook
- `lib/animations/useAnimations.ts` — Framer Motion variants

### Pending: Integration into 9 Games

| Game | File | Audio Events | Animations |
|------|------|--------------|------------|
| **Serrat Bruixes** | SerratBruixesGame.tsx | buzzer (wrong), unlock (right) | fade-in, shake (wrong) |
| **Font Ferro** | FontFerroGame.tsx | buzzer, unlock | slide-up evidence |
| **Planes Bones** | PlaneBonesGame.tsx | buzzer, unlock | pulse timer |
| **Cementiri** | CementiriGame.tsx | buzzer, unlock | scale buttons |
| **Control** | ControlGame.tsx | bell-ding (select), unlock | fade-in |
| **Accusation** | AccusationGame.tsx | buzzer (wrong), bell-ring (right) | stagger list |
| **Box** | BoxGame.tsx | unlock (open) | zoom in |
| **Bell** | BellGame.tsx | bell-ring | pulse |
| **Moral Choice** | MoralChoiceGame.tsx | buzzer, unlock | scale hover |

### Sprint 7.2a: Audio Integration (2 hores)

```bash
# 1. Create placeholder audio files (silence, <1KB each)
mkdir -p public/audio/effects public/audio/voices
echo "" > public/audio/effects/buzzer.mp3
echo "" > public/audio/effects/unlock.mp3
echo "" > public/audio/effects/bell-ding.mp3
echo "" > public/audio/effects/bell-ring.mp3

# 2. For each game component:
#    - Import useAudio hook
#    - Add audio calls on events
#    - Test audio fires

# 3. Example integration pattern:
```

```typescript
'use client'
import { useAudio } from '@/lib/audio/useAudio'

export function SerratBruixesGame(props: GameProps) {
  const { play } = useAudio()
  
  const handleAnswer = async (answer: string) => {
    const result = await submit(answer)
    if (result.correct) {
      play('unlock') // plays unlock sound
    } else {
      play('buzzer') // plays buzzer
    }
  }
  
  return (
    // Game UI
  )
}
```

### Sprint 7.2b: Animation Integration (2 hores)

```typescript
'use client'
import { motion } from 'framer-motion'
import { useAnimations } from '@/lib/animations/useAnimations'

export function FontFerroGame(props: GameProps) {
  const animations = useAnimations()
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations.fadeInVariants}
    >
      {/* Game content */}
      <motion.div
        variants={animations.slideUpVariants}
        className="evidence-list"
      >
        {/* Evidence items */}
      </motion.div>
    </motion.div>
  )
}
```

### Acceptance Criteria
- [ ] All 9 games import `useAudio`
- [ ] Audio plays on correct/incorrect answers
- [ ] All 9 games use Framer Motion variants
- [ ] Animations smooth, 60fps
- [ ] No console errors
- [ ] Tests: `npm run build` succeeds

---

## 📋 Fase 7.3: E2E Testing + Validation

### Tests Available
- `tests/e2e/happy-path.spec.ts` — Main flows (4 tests)
- `tests/e2e/edge-cases.spec.ts` — Error handling (6 tests)
- `tests/e2e/master.spec.ts` — Master dashboard (6 tests)

### Sprint 7.3a: Fix Selectors (1 hora)

```bash
# Run tests to see what breaks
npm run test:e2e

# For each failing selector:
# 1. Identify element in component
# 2. Add data-testid attribute (if needed)
# 3. Update selector in .spec.ts file
# 4. Re-run test
```

Example fix pattern:
```typescript
// In component:
<button data-testid="submit-answer">Enviar</button>

// In test:
await page.click('[data-testid="submit-answer"]')
```

### Sprint 7.3b: Run Full Test Suite (1 hora)

```bash
# Run all tests
npm run test:e2e

# Expected: ✓ 16/16 tests pass
# Fix any failures

# Run with UI for debugging:
npx playwright test --ui
```

### Sprint 7.3c: Mobile Responsive Testing (1.5 hores)

```bash
# Test with mobile viewport
npm run dev

# Test both:
# - iPhone 12 (390px width)
# - Android Chrome (360px width)

# Check:
# - Touch targets 48px+ ✓
# - Text readable without zoom ✓
# - No horizontal scroll ✓
# - Buttons responsive to tap ✓
```

### Acceptance Criteria
- [ ] All 16 E2E tests pass
- [ ] Mobile viewport works (390px)
- [ ] No layout shifts
- [ ] Touch targets >48px
- [ ] Performance: Lighthouse >85

---

## 📋 Fase 7.4: Audio Files + Polish

### Deliverables
- 3 voice actors × 3 acts = **9 voice clips** (~30s each)
- 4 sound effects (**buzzer, unlock, bell-ding, bell-ring**)
- Voicing guide: `docs/AUDIO.md` ✓ Ready

### Work (Outside Dev)
1. **Record voices** (1-2 hours)
   - Bernat: 3 medieval Catalan texts (~30s each)
   - Mossèn: 3 religious texts (~30s each)
   - Emissari: 3 cryptic messages (~30s each)

2. **Record effects** (30 min)
   - Bell ding (~110ms)
   - Bell ring (~500ms)
   - Buzzer (~200ms)
   - Unlock (~300ms)

3. **Optimize MP3s** (15 min)
   - Target: <100KB per voice clip
   - Target: <50KB per effect
   - Use: ffmpeg at 128kbps mono

### Sprint 7.4 (Dev Only — 30 min)

```bash
# 1. Organize audio files
mkdir -p public/audio/effects/
mkdir -p public/audio/voices/bernat
mkdir -p public/audio/voices/mossen
mkdir -p public/audio/voices/emissari

# 2. Place files matching audioManager expectations
# lib/audio/audioManager.ts line 1-40 defines audio paths

# 3. Test audio plays
npm run dev
# Play a game with audio enabled ✓

# 4. Verify no console errors
```

### Acceptance Criteria
- [ ] All 9 voice clips added
- [ ] All 4 effects added
- [ ] Audio files <100KB each
- [ ] No 404 errors in console
- [ ] Games play audio correctly

---

## 📋 Fase 7.5: Final QA + Deployment

### Verification Checklist

```
📋 Code Quality
- [ ] npm run build — succeeds, 0 errors
- [ ] npm run type-check — passes
- [ ] npm run lint — no issues
- [ ] All imports resolve correctly

🎮 Player Flows (Manual Testing)
- [ ] Player 1: Scan QR → Enter name → See hub
- [ ] Player 2: Same team → Sees same session
- [ ] Station: Scan QR → See game → Answer → Result
- [ ] All 9 games playable ✓
- [ ] Notebook shows evidence correctly
- [ ] Map loads with markers
- [ ] Salconduit display works
- [ ] Accusation unlocks at station 7+

👮 Master Flows (Manual Testing)
- [ ] Master login works (PIN)
- [ ] Dashboard shows teams/scores real-time
- [ ] Can see live stations
- [ ] Results page shows final scores
- [ ] Can export CSV

📱 Mobile Testing
- [ ] iPhone 12 (390px) responsive
- [ ] Android Chrome (360px) responsive
- [ ] Touch tap works (buttons >48px)
- [ ] No overflow scroll
- [ ] Portrait + landscape both work

🔒 Security
- [ ] RLS policies active
- [ ] Players can't access other team data
- [ ] Solutions.ts not accessible from client
- [ ] All answers validated server-side
- [ ] Audit log records all changes

🔊 Audio + Animations
- [ ] Correct answer → plays sound
- [ ] Wrong answer → plays buzzer
- [ ] Evidence unlock → slide animation
- [ ] Timer <15min → pulse animation
- [ ] Smooth 60fps animations

⚡ Performance
- [ ] Lighthouse score >85
- [ ] First contentful paint <2s
- [ ] Core Web Vitals all green
- [ ] Bundle size <500KB

🧪 E2E Tests
- [ ] Happy path (4 tests) pass
- [ ] Edge cases (6 tests) pass
- [ ] Master flows (6 tests) pass
- [ ] Mobile viewport (390px) passes
```

### Sprint 7.5 (Full Day)

```bash
# 1. Create test checklist document
# 2. Manual testing (2-3 hours)
# 3. Fix any remaining bugs
# 4. Verify audio files included
# 5. Lighthouse audit
# 6. Final build test
```

### Acceptance Criteria
- [ ] All 16 E2E tests pass
- [ ] Manual testing checklist 100% green
- [ ] Lighthouse >85
- [ ] Zero console errors in player flow
- [ ] Zero console errors in master flow
- [ ] Ready for production deployment

---

## 🗓️ Timeline Estimate

| Phase | Tasques | Hores | Dies |
|-------|---------|-------|------|
| **7.0** | Fix TypeScript errors | 2.5 | 0.5 |
| **7.1** | Apply RLS migration | 1 | 0.25 |
| **7.2** | Integrate audio + animations | 4 | 1 |
| **7.3** | E2E testing + mobile | 3 | 0.75 |
| **7.4** | Integrate audio files | 0.5 | 0.25 |
| **7.5** | Final QA + verification | 6 | 1.5 |
| **Total** | | **17 hores** | **4 dies** |

---

## 🎯 Success Criteria (Final)

### Must Have ✅
- [ ] Code compiles (0 TypeScript errors)
- [ ] RLS security applied
- [ ] Player signup → hub → station flow works
- [ ] Master login + dashboard works
- [ ] All 9 games playable
- [ ] E2E tests pass
- [ ] Mobile responsive (390px+)

### Should Have 🔶
- [ ] Audio integrated
- [ ] Animations integrated
- [ ] Lighthouse >85
- [ ] Full QA checklist passed

### Nice to Have 💡
- [ ] Offline fallback
- [ ] Analytics tracking
- [ ] Internationalization (future)

---

## 📌 Next Steps

### Immediate (Today)
1. **Review this plan** — Confirm priorities
2. **Start 7.0** — Fix TypeScript errors
3. **Track progress** — Update status below

### Current Status
```
Phase 7.0 (TypeScript):  ⏳ PENDING
Phase 7.1 (RLS):         ⏳ PENDING
Phase 7.2 (Audio/Anim):  ⏳ PENDING
Phase 7.3 (E2E/Mobile):  ⏳ PENDING
Phase 7.4 (Audio Files): ⏳ PENDING
Phase 7.5 (QA):          ⏳ PENDING
```

---

## 📚 References

- `docs/REQUIRED_CODE_FIX.md` — RLS auth fix (5 min)
- `docs/DEPLOYMENT_CHECKLIST.md` — Full deployment steps
- `docs/INTEGRATION-GUIDE.md` — Audio + animation examples
- `docs/ACCESSIBILITY.md` — WCAG compliance guide
- `playwright.config.ts` — E2E test configuration

---

**Plan Version:** 1.0  
**Created:** 2026-09-17  
**Ready for Execution:** ✅ YES
