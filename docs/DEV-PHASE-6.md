# ✨ Fase 6: Polish + QA

**Status:** 📋 Planejament  
**Durada:** 6 hores  
**Inici:** Setmana 5–6  
**Dependency:** Fase 5 completada  
**Branch:** `phase/6-polish-qa`

---

## 🎯 Objectiu

Audio, animacions, accessibility, E2E testing, optimització performance.

---

## 📋 Checklist

### 1. Audio + Veu
- [ ] `lib/audio/audioManager.ts`
  - Gestió clips: carrega, play, stop, volume
  - Mute setting
- [ ] Àudio personatges (Howler.js)
  - `audio/bernat/voice-act1.mp3`
  - `audio/bernat/voice-act2.mp3`
  - Etc.
- [ ] Efectes sonors
  - Jog correcte: bell ding
  - Jog incorrecte: buzzer
  - Evidència desbloqueig: unlock sound
  - Campanar: bell ring
- [ ] Test manual: àudio a tots els moments clau

### 2. Animacions (Framer Motion)
- [ ] Entrada components: fade-in
- [ ] Desbloquejament evidència: slide-up
- [ ] Transicions actes: fade-out → fade-in
- [ ] Som campana: zoom + vibration
- [ ] Cronometre: pulsing quan <15 min
- [ ] Botó hover: subtle scale

### 3. Accessibility (WCAG AA)
- [ ] **Contrast:**
  - Text foreground vs background ≥4.5:1
  - Test amb aXe/WAVE
- [ ] **Font size:**
  - Body text ≥16px
  - Headings ≥24px
  - Buttons ≥16px
- [ ] **Buttons:**
  - Mínim 48px × 48px (touch target)
  - Clear labels
  - ARIA labels per a iconics
- [ ] **Keyboard Navigation:**
  - Tab order logic (header → main → footer)
  - Enter per a submit
  - Escape per a close
- [ ] **Screen Readers:**
  - `aria-label` per a botons sense text
  - `aria-live` per a actualitzacions dinàmiques
  - Semantic HTML (`<button>`, `<nav>`, etc.)
- [ ] **Color Blindness:**
  - No sols confiar en color (ex: vermell/verd)
  - Usar icones + text
- [ ] Test amb NVDA (Windows) o VoiceOver (Mac)

### 4. E2E Testing (Playwright)
- [ ] `tests/e2e/happy-path.spec.ts`
  - Login jugador
  - 4 jocs (resposta correcta)
  - Acusació Bernat
  - Caixa (obrir)
  - Sometent (codi correcte)
  - Resultats visibles
- [ ] `tests/e2e/edge-cases.spec.ts`
  - Resposta incorrecta → retry
  - Pista (cost punts)
  - Timeout (cronometre)
  - Salconduits (control)
  - Decisió moral (ambdós paths)
- [ ] `tests/e2e/master.spec.ts`
  - Login màster (PIN correcte/incorrecte)
  - Dashboard updates
  - Results visible
- [ ] CI/CD: tests al push (GitHub Actions o similar)

### 5. Performance Optimization
- [ ] **Image Optimization:**
  - `next/image` per a totes les imatges
  - Sizes responsive
  - Lazy loading
- [ ] **Code Splitting:**
  - Jocs carreguen dynamic (lazy)
  - Components reutilitzables
- [ ] **Database:**
  - Índexes en foreign keys
  - Query optimization (no N+1)
  - Connection pooling
- [ ] **Bundle Analysis:**
  - `npm run build` → verifica bundle size
  - Target: <500KB JS
- [ ] **Cache Headers:**
  - Static content: 1 year
  - Dynamic: no-cache
- [ ] **Monitoring:**
  - Vercel analytics
  - Error logging

### 6. Offline Mode (Partial)
- [ ] QR scanner funciona sense xarxa
- [ ] Cache local de preguntes/pistes
- [ ] Validació sincronitza quan es recupera connexió
- [ ] Missatge user si sense conexió

### 7. Browser Compatibility
- [ ] Test a:
  - Chrome/Edge (latest)
  - Safari (latest)
  - Firefox (latest)
  - Mobile (iOS Safari, Chrome Android)

### 8. Bug Hunt + Refining
- [ ] Provar tota la webapp com a jugador
- [ ] Provar com a màster
- [ ] Verificar tots els textos en català
- [ ] Verificar que no hi ha typos
- [ ] Provar variants A/B/C

### 9. Documentation
- [ ] README.md final
- [ ] DEPLOYMENT.md (Vercel)
- [ ] API docs per a Edge Functions
- [ ] User guide (per a màster)

### 10. Release
- [ ] Version bump: v1.0.0
- [ ] Tag git: `v1.0.0`
- [ ] Deploy a Vercel
- [ ] Test URL en viu
- [ ] Backup BD

---

## ✅ Criteris d'Èxit

- ✅ E2E tests verds (100% pass)
- ✅ Accessibility (WCAG AA, aXe no errors)
- ✅ Performance (Lighthouse >85)
- ✅ Audio funciona
- ✅ Animacions smooth
- ✅ Sense console errors/warnings
- ✅ Deployed a Vercel
- ✅ Ready for beta testing

---

## 🚀 Pròxim Pas

→ **COMPLETAT!**

Fase 6 finalizada → webapp ready per a beta testing a La Guixa.

---

## 📝 Post-Release Roadmap

- [ ] Variant B + C testing (cartells físics)
- [ ] Joc 2 (nova trama, reutilitzant components)
- [ ] Dashboard analytics (player behavior)
- [ ] Mobile app (PWA o native)
