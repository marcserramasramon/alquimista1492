# El Traïdor de la Guixa

Una webapp mòbil per a un escape room exterior de 90 minuts ambientat al maig de 1705, a Sentfores–La Guixa (Osona).

## 📖 Descripció

Els equips recorren el poble, escanegen QR a les estacions, resolen jocs a la webapp i han de descobrir qui és el traïdor que ha delatat el Pacte dels Vigatans. El màster fa alhora d'actor (l'Emissari) i controla la partida des del mòbil.

### Características principals

- ✅ Jocs d'estació interactius sincronitzats en temps real
- ✅ Puntuació d'equip amb sistema d'evidències
- ✅ Dashboard en viu per al màster
- ✅ Narrativa immersiva en català de l'era barroca
- ✅ Mobile-first (disseny per una mà, a ple sol)
- ✅ Interfície 100% en català
- ✅ Mapa de Leaflet amb les 6 estacions

## 🚀 Tech Stack

- **Frontend:** Next.js 15+ (App Router) + TypeScript estricte
- **Estils:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Realtime, Auth anònima)
- **Desplegament:** Vercel
- **Llibreries clau:**
  - `@supabase/ssr` — SSR autenticació
  - `@yudiel/react-qr-scanner` — Escàner QR
  - `leaflet` + `react-leaflet` — Mapa
  - `zod` — Validació
  - `zustand` — State management
  - `framer-motion` — Animacions
  - `jose` — JWT
  - `howler` — Audio

## 📋 Documents essencials

- **[PRD.md](./PRD.md)** — Especificació funcional i tècnica (font de veritat)
- **[CLAUDE.md](./CLAUDE.md)** — Regles no negociables i estil de desenvolupament
- **[docs/historia.md](./docs/historia.md)** — Trama, personatges, sospitosos, evidències
- **[docs/jocs.md](./docs/jocs.md)** — Definició de cada joc d'estació
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** — Setup del desenvolupador
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — Com desplegar a Vercel

## 🛠️ Setup ràpid

### Requisits

- Node.js 18+ + npm/yarn
- Compte Supabase
- Compte Vercel (per desplegament)

### Instal·lació

```bash
# Clonar repositori
git clone https://github.com/[owner]/traidor-guixa.git
cd traidor-guixa

# Instal·lar dependències
npm install

# Setup variables d'entorn
cp .env.local.example .env.local
# Emplena amb les teves credencials Supabase i Vercel

# Executar servidor de desenvolupament
npm run dev

# Obre http://localhost:3000
```

Veure **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** per a instruccions completes.

## 📂 Estructura de carpetes

```
app/
  (player)/           # Rutes de jugadors
    e/[code]/        # Entrada per QR d'equip
    joc/             # Hub, mapa, quadern, salconduit, estacions
    s/[token]/       # Destí dels QR d'estació
  (master)/          # Rutes de màster
    master/          # Dashboard i eines del màster
  api/               # Route handlers (validació, accions)

components/
  games/             # Un component per joc + registry.ts
  player/            # Componts de jugador
  master/            # Componts de màster
  ui/                # Componts ui genèrics

content/
  public/            # Dades públiques (textos, coordenades, noms)
  private/           # Dades privades (solucions, pistes, traïdor) — SERVIDOR NOMÉS

lib/
  supabase/          # Client Supabase i queries
  scoring/           # Lògica de puntuació
  realtime/          # Hooks de sincronització temps real
  auth/              # Autenticació

supabase/
  migrations/        # Migracions Postgres

docs/                # Documentació
```

## 🎮 Jocs d'estació

Cada joc és un component a `components/games/` registrat a `registry.ts`. Interfície comuna:

```typescript
type GameProps = {
  stationId: string
  content: PublicStationContent
  sharedState: unknown
  setSharedState: (s: unknown) => void
  submit: (answer: unknown) => Promise<SubmitResult>
  solved: boolean
}
```

Veure [docs/jocs.md](./docs/jocs.md) per a la definició de cada joc.

## 🔐 Seguretat

- **Solucions no arriben al client:** Tota validació al servidor (`import "server-only"`)
- **RLS activat:** Els jugadors només veuen dades del seu equip
- **QR amb tokens:** Aleatoris i amb caducitat
- **Salconduit:** Cooldown de 10 minuts per equip

Veure [CLAUDE.md](./CLAUDE.md#regles-no-negociables) per a més detalls.

## 🎨 Estil visual

Estètica **segle XVIII barroc tardà**: pergamí envellit, tinta ferrogàl·lica, blau de Prússia, vermell de cotxinilla.

**Sense mode fosc** (es juga a l'exterior). Contrast WCAG AA, text base ≥ 19px.

Tokens CSS a `app/globals.css` → Tailwind.

## 📱 Mobile-first

- Botons mínim 48px per a dits
- Res important només amb hover
- Disseny per una mà mentre actua el màster
- Funciona a Safari iOS 16+ i Chrome Android

## ⏱️ Fases de desenvolupament

| Fase | Abast | Estat |
|---|---|---|
| 0 | Setup Next + Supabase + Vercel | ✅ |
| 1 | Migracions, RLS, contingut JSON | |
| 2 | Màster: PIN, sessions, equips, QR | |
| 3 | Jugador: entrada, nom, sala d'espera | |
| 4 | Hub, mapa, temps real | |
| 5 | Escàner, estació, resposta, punts | |
| 6 | Dashboard màster, detall equip | |
| 7 | Pistes, quadern evidències | |
| 8 | Salconduit, cooldown | |
| 9 | Acusació, campana, final | |
| 10 | Jocs propis | |
| 11 | Poliment, proves amb dispositius reals | |

Veure [PRD.md#14-fases](./PRD.md#14-fases) per a més detalls.

## 🤝 Contribució

Llegeix [CONTRIBUTING.md](./CONTRIBUTING.md) abans de contribuir.

**Regles clau:**
- **Commits petits i descriptius** en anglès
- **Codi en anglès**, interfície en català
- **Fases:** No saltar fases; esperar confirmació
- **Migracions:** Sempre noves, mai editant-ne antigues
- **Tests:** Necessaris per a backend (API)

## 📝 Commits

Format: `<type>(<scope>): <description>`

```bash
git commit -m "feat(games): add SerratBruixes game logic"
git commit -m "fix(auth): validate session token on station visit"
git commit -m "docs: update deployment instructions"
```

## 🚢 Desplegament

- **Staging:** Branca `develop` auto-desplegada a Vercel
- **Producció:** Branca `main` auto-desplegada
- Veure [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## ❓ Preguntes frequents

**P: Puc afegir una nova dependència?**  
R: Justifica-la. Veure [CLAUDE.md#stack](./CLAUDE.md#stack).

**P: Quin és l'ordre de les estacions?**  
R: Ordre lliure. Els jugadors escanegen els QR en l'ordre que vulguin.

**P: Puc editar un fitxer de migració antiga?**  
R: No. Crea una de nova. Veure [CLAUDE.md#manera-de-treballar](./CLAUDE.md#manera-de-treballar).

**P: A on viu la solució de cada joc?**  
R: A `content/private/stations.json` importat només a servidor.

## 📞 Contacte

- Responsable: [Informació del projecte]
- Issues: GitHub Issues
- Docs: Dins aquest repo

## 📄 Llicència

[Especificar llicència]

---

**Última actualització:** 2026-09-16  
**Versió:** 0.1-dev  
**Estat:** 🟡 En desenvolupament (Fase 0-1)
