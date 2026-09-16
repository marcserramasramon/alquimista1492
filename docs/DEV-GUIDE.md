# 📖 Guia de Desenvolupament — El Traïdor de la Guixa

**Versió:** 1.0.0  
**Data:** 2026-09-16  
**Autor:** Marc Serra Masramon  
**Status:** 🟢 Planejament complet

---

## 📌 Accés Ràpid a les Fases

1. **[Fase 0: Setup Inicial](./DEV-PHASE-0.md)** — Estructura, .env, TypeScript
2. **[Fase 1: Auth + BD](./DEV-PHASE-1.md)** — Supabase, taules, RLS
3. **[Fase 2: UI Base](./DEV-PHASE-2.md)** — Layout, hub, mapa, quadern
4. **[Fase 3: Jocs 1–4](./DEV-PHASE-3.md)** — Investigació, 4 estacions
5. **[Fase 4: Jocs 5–9](./DEV-PHASE-4.md)** — Traïció, decisió moral, sometent
6. **[Fase 5: Dashboard Màster](./DEV-PHASE-5.md)** — Control en temps real
7. **[Fase 6: Polish + QA](./DEV-PHASE-6.md)** — Sound, animacions, tests

---

## 🎯 Objectiu

Crear una webapp d'escape room exterior (90 minuts, 9 jocs) amb:
- ✅ Webapp per a jugadors (mobile-first)
- ✅ Dashboard per a màster (real-time)
- ✅ Trama de 3 actes amb gir de trama
- ✅ Decisió moral amb dos epílegs
- ✅ Arquitectura JSON-driven (reutilitzable per a Joc 2)

---

## 📊 Timeline

**Total:** 37 hores de desenvolupament  
**Durada:** 5–6 setmanes (7 h/dia, 5 dies/setmana)  
**Target:** Beta testing a La Guixa a finals d'octubre de 2026

| Fase | Durada | Inici | Fi |
|------|--------|-------|-------|
| Fase 0 | 2h | Setmana 1 | Setmana 1 |
| Fase 1 | 4h | Setmana 1–2 | Setmana 2 |
| Fase 2 | 3h | Setmana 2 | Setmana 2 |
| Fase 3 | 12h | Setmana 2–3 | Setmana 4 |
| Fase 4 | 8h | Setmana 4–5 | Setmana 5 |
| Fase 5 | 2h | Setmana 5 | Setmana 5 |
| Fase 6 | 6h | Setmana 5–6 | Setmana 6 |

---

## 🏗️ Arquitectura Overview

### Stack Tecnològic
```
Frontend:        Next.js 13+ App Router, TypeScript, Tailwind, shadcn/ui
Backend:         Supabase (PostgreSQL, Realtime, Auth anònima)
Deployment:      Vercel
Audio:           Howler.js
Maps:            Leaflet + React-Leaflet
QR:              @yudiel/react-qr-scanner, qrcode
State:           Zustand
Validation:      Zod
Animations:      Framer Motion
Security:        JWT (jose), server-only imports, RLS
```

### Estructura de Carpetes
```
app/
├── (player)/e/[code]/         entrada per QR d'equip
├── (player)/joc/              hub, mapa, quadern, jocs
├── (player)/s/[token]/        destí dels QR d'estació
├── (master)/master/           dashboard màster
└── api/                        route handlers
components/
├── games/                      components per a cada joc
├── gameTypes/                  components genèrics per type
├── player/
├── master/
└── ui/
content/
├── public/                     texts narratius, coordenades
├── games/traidor-guixa/
│   ├── game-config.json
│   ├── narrative.json
│   ├── stations.json
│   ├── evidence.json
│   └── private/solutions.json
└── games/joc-2/              (futur)
lib/
├── supabase/
├── realtime/                  hooks
├── scoring/
├── game-engine.ts             carrega i valida JSON
└── types.ts
schemas/                       plantilles JSON
docs/
├── SCHEMA.md
├── historia.md
├── jocs.md
├── evidencies.md
├── DEV-GUIDE.md              (aquest)
└── DEV-PHASE-*.md
supabase/migrations/
tests/
└── e2e/
```

---

## 🔑 Principis de Desenvolupament

### 1. **JSON-Driven**
- Trama, jocs, evidències definits en JSON
- Engine carrega i valida automàticament
- Reutilitzable per a Joc 2 (canviar sols JSON, no codi)

### 2. **Server-Only Secrets**
- `content/private/solutions.json` mai al client
- Tota validació al servidor (`import 'server-only'`)
- Resposta vàlida guardada a BD (no al client)

### 3. **Mobile-First**
- Contrast alt (WCAG AA)
- Text ≥16px
- Botons ≥48px
- Flexbox layout responsive
- Sense hover (touch-first)

### 4. **Real-Time Sync**
- Supabase Realtime per a cronometre compartit
- Tots els mòbils de l'equip veuen el mateix estat
- Marca de temps automàtica (`discovered_at`, `solved_at`)

### 5. **Validació Rigorosa**
- Client: Zod per a input
- Servidor: validació duplicada contra `solutions.json`
- RLS: jugadors veuen sols dades del seu equip
- QR: tokens JWT amb caducitat

### 6. **Sense Sobre-Enginyeria**
- Codi específic al Traïdor ara
- Però arquitectura modular (components reutilitzables)
- Refactorització a motor després de Fase 6 (si necessita Joc 2)

---

## 📝 Definicions

### Fase
Unitat de desenvolupament discreta amb objectiu clar, deliverables, checklist.

### Estació
Un joc físic (QR al poble) o webapp que jugadors visiten en ordre.

### Joc
Component interactiu (Polibi, dateCalculation, etc.) dins d'una estació.

### Evidència
Element del quadern que es desbloqueja al resoldre estacions.

### Digit
Número (4, 2, 3, 1) que contribueix al codi final del campanar.

### Variant
Permutació (A, B, C) que canvia dades (dates, noms, missatges) però NO mecànica.

---

## ✅ Checklist Global

### Pre-Inici
- [ ] Confirmar timeline (5–6 setmanes)
- [ ] Confirmar stack (Next.js, Supabase, Vercel)
- [ ] Confirmar accés a Supabase project
- [ ] Confirmar secrets (.env)
- [ ] Git repository creat

### Fase 0
- [ ] Projecte Next.js setup
- [ ] TypeScript strict mode
- [ ] Tailwind + shadcn/ui
- [ ] Estructura de carpetes
- [ ] .gitignore, .env.local

### Fase 1
- [ ] Supabase project creat
- [ ] Taules creades (teams, players, sessions, attempts, results)
- [ ] RLS policies actives
- [ ] Auth anònima funcionant
- [ ] Auth màster funcionant
- [ ] Migracions a git

### Fase 2
- [ ] Layout mobile-first
- [ ] Hub page
- [ ] Mapa leaflet
- [ ] Quadern (3 tabs)
- [ ] Cronometre real-time

### Fase 3
- [ ] Jog 1: Serrat (Polibi)
- [ ] Jog 2: Font (dateCalculation)
- [ ] Jog 3: Planes (mapNavigation)
- [ ] Jog 4: Cementiri (textComparison)
- [ ] Validació servidor funcionant
- [ ] Evidències desbloquejan

### Fase 4
- [ ] Jog 5: Control (física + webapp)
- [ ] Jog 6: Acusació (lògica)
- [ ] Jog 7: Caixa (segells)
- [ ] Jog 8–9: Sometent (codi final)
- [ ] Decidió moral (2 epílegs)
- [ ] Pantalla de resultats

### Fase 5
- [ ] Login màster (PIN)
- [ ] Dashboard (taula equips, cronometre)
- [ ] Real-time updates
- [ ] Pantalla resultats (màster)

### Fase 6
- [ ] Audio personatges
- [ ] Efectes sonors
- [ ] Animacions (Framer)
- [ ] Accessibility (WCAG)
- [ ] E2E tests (Playwright)
- [ ] Performance optimization

---

## 🔄 Flux de Desenvolupament per Fase

### 1. Pla Fase X
Revisar objectiu, accions, dependencies.

### 2. Crear Branches
```bash
git checkout -b phase/X-nom
```

### 3. Implementar
Seguir checklist de la fase.

### 4. Test
- Manual: provar en dispositiu real (tablet)
- Automàtic: pytest, Playwright si aplicable

### 5. Commit
Commits petits i descriptius:
```
feat: add hub page layout

- Mobile-first responsive design
- Equipment code display
- Navigation buttons
- Real-time countdown timer

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### 6. PR + Merge
- Crear PR a develop
- Review + approve
- Merge a develop
- Merge a main (si fase completada)

### 7. Release
Cada fase = release candidate (RC-X)

---

## 🛠️ Comandos Útils

### Develop
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run lint             # Check TypeScript + ESLint
```

### Database
```bash
supabase db push         # Push migrations
supabase db pull         # Pull remote schema
supabase functions deploy  # Deploy Edge Functions
```

### Testing
```bash
npm run test:e2e         # Run Playwright tests
npm run test:unit        # Run unit tests (si existeixen)
```

### Git
```bash
git log --oneline        # View commit history
git diff main phase/X    # View phase changes
```

---

## 📚 Documentació Relacionada

- **[SCHEMA.md](./SCHEMA.md)** — Estructura JSON de configuració
- **[historia.md](./historia.md)** — Trama, personatges, finals
- **[jocs.md](./jocs.md)** — Definició de 9 jocs
- **[evidencies.md](./evidencies.md)** — 10 evidències + desbloqueigs
- **[CLAUDE.md](../CLAUDE.md)** — Regles del projecte

---

## 🆘 Troubleshooting

### "Supabase no connecta"
- Verificar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verificar que Supabase project és actiu
- Verificar firewall/VPN

### "Jog no valida correctament"
- Verificar que `solutions.json` está al lloc correcte
- Verificar variant (A/B/C) de la sessió
- Verificar que server action importa `'server-only'`

### "Realtime no sincronitza"
- Verificar que Realtime está enabled a Supabase
- Verificar webhook subscriptions
- Mirar console logs del servidor

### "Variant no canvia entre partides"
- Verificar que variant es tria random al crear sessió
- Verificar que variant_id es guarda a BD
- Verificar que component carrega variant correcte de JSON

---

## 📞 Contacte

**Responsable Projecte:** Marc Serra Masramon (marcserramasramon@gmail.com)

Per a preguntes de desenvolupament, revisar la fase corresponent o [crear una issue a GitHub](https://github.com/...).

---

## 📋 Historial de Versions

| Versió | Data | Canvis |
|--------|------|--------|
| 1.0.0 | 2026-09-16 | Inicial — planejament complet, 7 fases definides |

---

## ✨ Pròxim Pas

→ **Fase 0: Setup Inicial** ([DEV-PHASE-0.md](./DEV-PHASE-0.md))

Comenceu per aquí. ~2 hores.
