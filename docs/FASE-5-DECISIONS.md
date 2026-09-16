# 🎯 Fase 5: Decisions Confirmades

**Data:** 16 setembre 2026  
**Status:** ✅ 4/5 decisions confirmades

---

## ✅ CONFIRMADES

### 1. Rate Limiting
- **Decisió:** BD temporal (més simple)
- **Implementació:** Taula `master_login_attempts` a Supabase
- **Lògica:** Après 5 intents fallits en 15 min → bannejar IP per 30 min

### 2. Audit Logs
- **Decisió:** No, logs només a servidor (stderr)
- **Implementació:** Console logs + Vercel's built-in logging
- **Justificació:** Fase 5 simple; taula BD per audit es pot afegir a Fase 6 si necessari

### 3. Pausa Partida
- **Decisió:** Fase 6 (deixar per a polish)
- **Justificació:** Mantenir Fase 5 simple (2h). Funcionalitat afegida post-MVP.

### 4. Polling Fallback Interval
- **Decisió:** 30 segons
- **Implementació:** Si Realtime cau, fer polling GET `/api/master/teams` cada 30s
- **Justificació:** Middle ground entre responsiveness (5s) i tràfic (10s+)

---

### 5. CSV Export Format
- **Decisió:** Una fila per equip (opció A)
- **Camps:** Posició, Nom Equip, Temps Total, Puntuació Final, Decisió Moral (A/B), Salconduits Usats, Acusació Correcta
- **Ordenació:** Per puntuació descendents (mateixa que taula resultats)

---

## 🚀 READY TO DEVELOP

✅ **100% decisions confirmades.** Fase 5 está llista per desenvolupar.

**Estimació:** 2 hores de desenvolupament lineal  
**Breakdown:**
- Sprint 1: Setup + JWT autenticació (30 min)
- Sprint 2: Dashboard UI + Real-time (45 min)
- Sprint 3: Results + API routes + testing (30 min)

**Branch:** `phase/5-master-dashboard`
