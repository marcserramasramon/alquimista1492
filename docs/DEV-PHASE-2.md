# 🎨 Fase 2: UI Base Jugador

**Status:** 📋 Planejament  
**Durada:** 3 hores  
**Inici:** Setmana 2  
**Dependency:** Fase 1 completada  
**Branch:** `phase/2-ui-base`

---

## 🎯 Objectiu

Layout mobile-first amb hub, mapa, quadern, cronometre real-time.

---

## 📋 Checklist

### 1. Layout Principal
- [ ] `components/layout/PlayerLayout.tsx`
  - Navbar (logo, nom equip, cronometre, salconduits)
  - Main content area
  - Footer amb navigation buttons
- [ ] Responsive: mobile-first, 100vh layout
- [ ] Tailwind per a styling

### 2. Hub Page
- [ ] `app/(player)/joc/page.tsx`
  - Salutació "Benvinguts, Equip [Code]"
  - Status actual (Acte I/II/III)
  - Estacions resoltes (progress: 4/4)
  - Botons: "Scanejar QR", "Mapa", "Quadern"
  - Cronometre visual (90min countdown)

### 3. Mapa Interactiu
- [ ] `app/(player)/joc/mapa.tsx`
  - Leaflet + React-Leaflet setup
  - SVG mapa La Guixa (o OSM tiles)
  - 7 markers (4 Acte I + 3 Acte II/III)
  - Color: gris (no accesible), verd (resolt)
  - Click → navigate to station (si accesible)

### 4. Quadern
- [ ] `app/(player)/joc/quadern/page.tsx`
  - 3 tabs: Sospitosos | Evidències | Codi
  - **Tab 1 - Sospitosos:**
    - 6 fitxes (cards)
    - Status: sospitós, descartat (✗), traïdor (⚠️)
  - **Tab 2 - Evidències:**
    - 0 inizialment (desbloquejan al resoldre)
    - Títol, descripció, icona, data
  - **Tab 3 - Codi:**
    - 4 caselles vacies: _ _ _ _

### 5. Cronometre Real-Time
- [ ] Subscripció Realtime a BD
- [ ] Hook: `useCountdown()` → remaining seconds
- [ ] Navbar mostra temps (MM:SS)
- [ ] Color: verd (>30), taronja (15-30), vermell (<15)
- [ ] Al arribar a 0: "S'ha acabat el temps"

### 6. Salconduits (Vides)
- [ ] Navbar mostra 3 icones braçal
- [ ] Cada intent fallit: −1 icon
- [ ] Color: vermell quan consumit
- [ ] No bloqueja joc (visible info sols)

### 7. Styling + Accessibility
- [ ] Contrast (WCAG AA)
- [ ] Text ≥16px
- [ ] Botons ≥48px
- [ ] Touch-friendly (no hover)
- [ ] Responsive 375px–2560px

---

## ✅ Criteris d'Èxit

- ✅ Hub page renderitza correctament
- ✅ Mapa carrega i mostra markers
- ✅ Quadern mostra 3 tabs
- ✅ Cronometre countdown visible
- ✅ Salconduits mostra 3 icones
- ✅ Accessible (WCAG AA)
- ✅ Mobile responsive

---

## 🚀 Pròxim Pas

→ **[Fase 3: Jocs 1–4](./DEV-PHASE-3.md)** (~12 hores)
