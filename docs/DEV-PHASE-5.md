# 👑 Fase 5: Dashboard Màster

**Status:** 📋 Planejament  
**Durada:** 2 hores  
**Inici:** Setmana 5  
**Dependency:** Fase 4 completada  
**Branch:** `phase/5-master-dashboard`

---

## 🎯 Objectiu

Interface per a màster: login PIN, monitorització equips en temps real, resultats.

---

## 📋 Checklist

### 1. Login Màster
- [ ] `app/(master)/login.tsx`
  - Input PIN (6 dígits, masked)
  - Botó "Entrar"
  - Validació: hash PIN vs `env:MASTER_PIN`
  - Si correcte: JWT token + redirect `/master`
  - Si incorrecte: Error message

### 2. Dashboard Principal
- [ ] `app/(master)/master/page.tsx`
  - **Panel 1 — Equips en Viu:**
    - Taula amb columnes:
      - Nom equip
      - Codi
      - Acte actual (I/II/III)
      - Estacions resoltes (4/4)
      - Temps restant (MM:SS)
      - Salconduits (3/2/1/0 icones)
      - Status (en joc, acabat, derrota)
    - Real-time updates (Realtime websocket)
  - **Panel 2 — Cronometre Global:**
    - 90-min countdown
    - Indicador color (verd/taronja/vermell)
    - Botó "Pausa" (opcional)
  - **Panel 3 — Accions Ràpides:**
    - Botó "Veure Resultats" → equips acabats
    - Botó "Logout"

### 3. Pantalla Resultats (Master)
- [ ] `app/(master)/results.tsx`
  - Taula equips amb:
    - Rang (1r, 2n, 3r...)
    - Nom equip
    - Temps (HH:MM)
    - Puntuació
    - Decisió moral (A/B)
    - Salconduits usats
  - Ordenat per puntuació descendent
  - Botó "Tornar al Dashboard"

### 4. Real-Time Updates
- [ ] Hook `useMasterDashboard()`
  - Subscripció Realtime a `sessions`, `teams`, `results`
  - Auto-refresh cada 5 seg
  - Disconnect handling

### 5. Autenticació Master
- [ ] Middleware/guard: rutaes `/master` requereixen JWT
- [ ] Si token inválid/expirat: redirect `/master/login`

---

## ✅ Criteris d'Èxit

- ✅ Login màster funciona (PIN correcte)
- ✅ Dashboard mostra equips en temps real
- ✅ Cronometre countdown visible i sincronirat
- ✅ Taula equips es actualitza automàticament
- ✅ Botó "Veure Resultats" → pantalla results
- ✅ Results mostra correctament
- ✅ Logout funciona

---

## 🚀 Pròxim Pas

→ **[Fase 6: Polish + QA](./DEV-PHASE-6.md)** (~6 hores)
