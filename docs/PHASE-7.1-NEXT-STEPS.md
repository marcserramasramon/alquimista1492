# Phase 7.1: Audio Files + E2E Testing + Deployment

Comprehensive checklist for final validation, audio integration, and production deployment of El Traïdor de la Guixa.

---

## 1. Audio Files Integration

### Files Needed (Outside Development)

Record 9 voice clips as MP3 files, <100KB each:

**Characters (text in `content/private/audio.ts`):**
- `bernat-intro.mp3` — Bernat d'Olzinelles introduces himself
- `bernat-clue.mp3` — Bernat provides a critical clue
- `mossen-intro.mp3` — Mossèn Carrió introduces himself
- `mossen-warning.mp3` — Mossèn warns about the traitor
- `emissari-intro.mp3` — L'Emissari introduces the game
- `emissari-accusation.mp3` — L'Emissari reacts to accusation
- `emissari-victory.mp3` — L'Emissari celebrates if correct accuser
- `emissari-defeat.mp3` — L'Emissari reacts if wrong accusation
- `narrator-finale.mp3` — Historical narrator closes the tale

**Sound Effects:**
- `buzzer.mp3` — Incorrect answer (500ms)
- `unlock.mp3` — Correct answer/station unlock (400ms)
- `bell-ding.mp3` — Single bell ring (200ms)
- `bell-ring.mp3` — Bell sequence for game start (1.5s)

### Directory Structure

```
public/audio/
├── characters/
│   ├── bernat-intro.mp3
│   ├── bernat-clue.mp3
│   ├── mossen-intro.mp3
│   ├── mossen-warning.mp3
│   ├── emissari-intro.mp3
│   ├── emissari-accusation.mp3
│   ├── emissari-victory.mp3
│   ├── emissari-defeat.mp3
│   └── narrator-finale.mp3
└── effects/
    ├── buzzer.mp3
    ├── unlock.mp3
    ├── bell-ding.mp3
    └── bell-ring.mp3
```

### Recording Instructions

1. Use natural Catalan pronunciation (refer to `docs/historia.md` for character voices)
2. Record in quiet environment; normalize audio to -3dB peak
3. Convert to MP3 at 128 kbps, 44.1kHz mono
4. Test playback on mobile before committing
5. Update `lib/audio/audioManager.ts` with file paths if structure differs

---

## 2. E2E Test Execution

### Run All Tests

```bash
npm run test:e2e
```

**Expected output:**
```
✓ 16 passed (2.4s)
  ✓ Player signup flow (0.8s)
  ✓ Station game submission (0.7s)
  ✓ Master login & dashboard (0.5s)
  ✓ [13 more tests...]
```

### Run Specific Test File

```bash
npm run test:e2e -- tests/e2e/happy-path.spec.ts
npm run test:e2e -- tests/e2e/master.spec.ts
npm run test:e2e -- tests/e2e/edge-cases.spec.ts
```

### Troubleshooting Selector Issues

If tests fail with `"element not found"`:

1. **Check if UI updated:** Review `E2E_SELECTOR_FIXES_SUMMARY.md` for known selector changes
2. **Run headed mode:** `npx playwright test --headed` to see what the test sees
3. **Update selectors:** Edit `.spec.ts` files with current selectors from DevTools
4. **Clear browser cache:** `rm -rf test-results/` then retry
5. **Run in isolation:** `npx playwright test tests/e2e/happy-path.spec.ts:50` (line number) to debug one test

---

## 3. Manual QA Checklist

### Player Flow

- [ ] Scan QR code → Redirects to `/e/[code]`
- [ ] Enter player name → Validates non-empty, <50 chars
- [ ] Click "Entrar" → Redirects to `/joc`
- [ ] See 5 tabs visible: **Estacions | Mapa | Quadern | Salconduit | Acusar**
- [ ] Click "Estacions" tab → See 5 stations with lock icons
- [ ] Click locked station → Show "Locked: Scan at location" message
- [ ] Scan station QR → Loads game component
- [ ] Answer game question → See correct/incorrect feedback within 500ms
- [ ] Audio plays on answer (check device speakers unmuted)
- [ ] Animations smooth on answer reveal (no jank)
- [ ] Click "Mapa" tab → See leaflet map centered on La Guixa
- [ ] Click "Quadern" tab → See accumulated clues (starts empty)
- [ ] Click "Salconduit" tab → See team pass/mission statement
- [ ] Click "Acusar" → See suspect list with radio buttons
- [ ] Select suspect → Click "Confirmar acusació" → Submit to server
- [ ] See result page with score and final story

### Master Flow

- [ ] Visit `/master` → See PIN input screen
- [ ] Enter invalid PIN → Show error "PIN incorrecte"
- [ ] Enter correct PIN (from `.env.local`) → Redirect to dashboard
- [ ] See **Real-time Scores** table with all teams
- [ ] Scores update <1s when a player answers on different device
- [ ] See **Station Status** showing completion % per station
- [ ] Click "Results" → See final scores and winning team
- [ ] See **Audit Log** with timestamps for all submissions

---

## 4. Mobile Testing

Test on minimum two devices:

| Device | Dimensions | Checklist |
|--------|-----------|-----------|
| **iPhone 12** | 390×844 | Touch targets >48px, no horizontal scroll, readable fonts |
| **Android Chrome** | 360×720 | Buttons align properly, form inputs accessible, full screen |

**Specific checks:**
- [ ] No text smaller than 14px
- [ ] Tab navigation works with touch (no hover-only elements)
- [ ] Game components responsive below 480px
- [ ] Modals don't overflow viewport
- [ ] QR scanner works on both devices (lighting conditions)

---

## 5. Performance Audit

### Build & Bundle

```bash
npm run build
# Expected: ▲ Next.js 14.2.x
# Build successful in 45s
```

**Bundle size check:**
```bash
npm run build -- --debug
# Should see: app size <500KB
# Total size <800KB
```

### Lighthouse Audit

```bash
npm run build
npm install -g lighthouse
lighthouse http://localhost:3000 --emulated-form-factor=mobile
```

**Target scores:**
- Performance: >85
- Accessibility: >90
- Best Practices: >85
- SEO: >90

**Core Web Vitals:**
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

---

## 6. Pre-Production Checklist

Before deploying to production:

- [ ] **All E2E tests pass:** `npm run test:e2e` (16/16)
- [ ] **Mobile devices tested:** iPhone 12 & Android verified
- [ ] **Audio files added:** All 13 files in `public/audio/`
- [ ] **Lighthouse score >85:** Desktop and mobile
- [ ] **No console errors:** DevTools shows clean console
- [ ] **RLS policies verified:** Query `SELECT * FROM auth.users` on non-master device, expect empty
- [ ] **Environment variables set:** All 7 vars in `NEXT_PUBLIC_*` and server `.env.local`
- [ ] **Database migration tested:** `supabase migration up` runs without errors
- [ ] **Secrets secure:** `MASTER_PIN`, `PASS_SECRET` are strong (>16 chars)
- [ ] **Staging deployment successful:** Full round-trip test on staging branch

---

## 7. Staging Deployment

**Prerequisites:** Staging Vercel project + staging Supabase instance

```bash
# 1. Push to staging branch
git checkout -b staging/release
git push origin staging/release

# 2. Deploy on Vercel (auto-triggered by branch)
# Monitor deployment at https://vercel.com/[project]/staging

# 3. Apply migration on staging database
vercel env pull --environment=staging
supabase migration up --project-ref=[staging-ref]

# 4. Run smoke tests
curl https://[staging-url]/api/health
# Expected: { "status": "ok" }

# 5. Test player signup
# Open https://[staging-url]/joc in mobile browser
# Complete full game flow
# Check for RLS errors in Supabase logs
```

**Success criteria:**
- Deployment status: ✅ Ready
- No RLS violations in logs
- All API responses <200ms
- No 5xx errors in server logs

---

## 8. Production Deployment

```bash
# 1. Create backup (Supabase dashboard)
# → Settings → Backups → Create manual backup

# 2. Apply migration on production
supabase migration up --project-ref=[prod-ref]

# 3. Deploy to production
git push origin master
# Vercel auto-deploys main branch

# 4. Monitor first hour
# → Vercel: Real-time logs for errors
# → Supabase: Audit logs for RLS violations
# → Uptime monitoring: Check API response times

# 5. Verify audit logging
# → Run test game on production
# → Check Supabase: SELECT * FROM game_submissions ORDER BY created_at DESC
```

---

## 9. Success Metrics

Target KPIs for healthy deployment:

| Metric | Target | How to Check |
|--------|--------|------------|
| **E2E Tests Pass Rate** | 100% (16/16) | `npm run test:e2e` |
| **RLS Violations** | 0 | Supabase logs: `grep "violation"` |
| **API Response Time** | <100ms p95 | Vercel Analytics dashboard |
| **Lighthouse Score** | >85 | `npm run build && lighthouse ...` |
| **Player Signup Success** | >95% | Count successful `/e/[code]` entries |
| **Game Submission Success** | >98% | Count valid POST /api/validate-answer |
| **Audit Log Entries** | >50 per test | Supabase: `COUNT(*)` from game_submissions |
| **Mobile 48px Touch Targets** | 100% | Manual inspection |
| **Console Errors** | 0 | DevTools console on staging & production |

---

## 10. Rollback Plan

If critical errors appear in production:

### Immediate Actions (First 5 Minutes)

```bash
# 1. Revert code deployment
git revert HEAD
git push origin master
# Vercel auto-deploys (takes ~2 min)

# 2. Check logs for root cause
# → Vercel: Real-time logs
# → Supabase: Query audit table for patterns
```

### Database Rollback (If Migration Broke Schema)

```bash
# 1. Revert migration
supabase migration down --project-ref=[prod-ref]

# 2. Restore from backup if needed
# → Supabase dashboard → Settings → Backups → Restore
# (Wait 10-30 min for restoration)
```

### Communication

- [ ] Notify QA team via Slack
- [ ] Post status update: "Investigating issue, ETA rollback in 5 min"
- [ ] Document root cause for post-mortem
- [ ] Re-deploy fix after verification on staging

---

## Next Steps

1. **Week 1:** Record audio files, integrate into `lib/audio/`
2. **Week 2:** Run full E2E test suite, fix any selector issues
3. **Week 3:** Manual QA on iPhone 12 + Android Chrome
4. **Week 4:** Performance audit, Lighthouse optimization
5. **Week 5:** Staging deployment, 48-hour smoke test
6. **Week 6:** Production deployment, 24-hour monitoring

**Owner:** QA & DevOps
**Timeline:** 6 weeks from now
**Success:** Zero RLS errors, 16/16 E2E pass, Lighthouse >85
