# ⚙️ Fase 0: Setup Inicial

**Status:** 📋 Planejament  
**Durada:** 2 hores  
**Inici:** Setmana 1  
**Dependency:** Cap  
**Branch:** `phase/0-setup`

---

## 🎯 Objectiu

Estructura de projecte funcional amb TypeScript, Tailwind, variables d'entorn i git repositori preparat.

---

## 📋 Checklist

### 1. Repositori Git
- [ ] Git init (si no existeix)
- [ ] `.gitignore` (Node, .env, .DS_Store)
- [ ] `README.md` inicial
- [ ] First commit: "chore: initialize git repo"

### 2. Next.js Project
- [ ] `npm create next-app@latest` (si no existeix)
  - App Router: **SÍ**
  - TypeScript: **SÍ**
  - Tailwind: **SÍ**
  - ESLint: **SÍ**
  - Src dir: **NO**
- [ ] `npm install` completat
- [ ] `npm run dev` funciona (localhost:3000)

### 3. TypeScript Config
- [ ] `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    }
  }
  ```
- [ ] `npm run build` sense errors

### 4. Tailwind Setup
- [ ] `tailwind.config.ts` configurat
- [ ] `globals.css` creat
- [ ] Font personalitzada (de PRD secció 16)
- [ ] Paleta de colors (PRD)
- [ ] `npm run dev` — Tailwind compila

### 5. shadcn/ui Setup
- [ ] `npx shadcn-ui@latest init`
- [ ] Seleccionar components necessaris (Button, Input, Dialog, etc.)
- [ ] Test import: `import { Button } from '@/components/ui/button'`

### 6. Variables d'Entorn
- [ ] Crear `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  MASTER_PIN=
  MASTER_SESSION_SECRET=
  PASS_SECRET=
  NEXT_PUBLIC_APP_URL=
  ```
- [ ] `.env.local` a `.gitignore`
- [ ] `.env.example` creat (sense valors)

### 7. Estructura de Carpetes
- [ ] `app/` — App Router pages
  - `(player)/` — Jugador routes
    - `e/[code]/` — QR entrada equip
    - `joc/` — Hub, mapa, quadern, jocs
    - `s/[token]/` — Destí QR estació
  - `(master)/` — Master routes
    - `master/` — Dashboard
  - `api/` — API routes / Route handlers
- [ ] `components/`
  - `games/` — Components per a cada joc
  - `gameTypes/` — Components genèrics
  - `player/` — Player-specific components
  - `master/` — Master-specific components
  - `ui/` — shadcn/ui components
- [ ] `lib/`
  - `supabase/` — Supabase client/server
  - `realtime/` — Realtime hooks
  - `scoring/` — Scoring logic
  - `game-engine.ts` — JSON loader + validator
  - `types.ts` — TypeScript interfaces
  - `utils.ts` — Utilities
- [ ] `content/`
  - `public/` — Texts, coordinates
  - `games/traidor-guixa/` — Game config (creat per Fase 2)
  - `private/` — solutions.json (server-only)
- [ ] `schemas/` — JSON plantilles (ja creades)
- [ ] `docs/` — Documentació
- [ ] `supabase/migrations/` — DB migrations
- [ ] `public/` — Static assets (imatges, icons)
- [ ] `tests/` — E2E tests (per a Fase 6)

### 8. Dependencies Base
- [ ] Instal·lar:
  ```bash
  npm install @supabase/ssr @supabase/supabase-js
  npm install zustand zod framer-motion jose
  npm install @yudiel/react-qr-scanner qrcode
  npm install react-leaflet leaflet
  npm install howler
  npm install -D typescript @types/node @types/react
  npm install -D tailwindcss postcss autoprefixer
  npm install -D @typescript-eslint/eslint-plugin eslint
  ```

### 9. Carpeta de Projecte
- [ ] `C:\Users\mini-\Downloads\Scaperoom\` — Root
- [ ] Tots els subdirectories creats
- [ ] `package.json` amb scripts

### 10. First Commit
- [ ] Tots els fitxers afegits
- [ ] Commit message:
  ```
  chore: initial project setup with Next.js, TypeScript, Tailwind

  - App Router configured
  - TypeScript strict mode enabled
  - Tailwind CSS with custom theme
  - shadcn/ui initialized
  - Folder structure created
  - Environment variables template

  Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
  ```

---

## 🎬 Accions Detallades

### Pas 1: Crear Projecte Next.js
```bash
npm create next-app@latest scaperoom --typescript --tailwind
cd scaperoom
git init
```

### Pas 2: Configurar TypeScript
Editar `tsconfig.json`:
```json
{
  "extends": "next/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Pas 3: Instal·lar Dependencies
```bash
npm install @supabase/ssr @supabase/supabase-js zustand zod framer-motion jose
npm install @yudiel/react-qr-scanner qrcode react-leaflet leaflet howler
npm install -D @shadcn-ui/cli
npx shadcn-ui@latest init
```

### Pas 4: Crear Estructura
```bash
mkdir -p app/{player/e,player/joc,player/s,master/master,api}
mkdir -p components/{games,gameTypes,player,master,ui}
mkdir -p lib/{supabase,realtime,game-engine}
mkdir -p content/{public,games/traidor-guixa/private}
mkdir -p supabase/migrations
mkdir -p tests/e2e
mkdir -p public/{images,audio,qr}
```

### Pas 5: Crear .env.local
```bash
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MASTER_PIN=
MASTER_SESSION_SECRET=
PASS_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### Pas 6: Crear .env.example
```bash
cp .env.local .env.example
# Eliminar valors de .env.example (deixar buits)
```

### Pas 7: Crear .gitignore
```bash
cat > .gitignore << EOF
node_modules/
.env.local
.env.*.local
.DS_Store
.next/
out/
build/
dist/
*.log
EOF
```

### Pas 8: Test Build
```bash
npm run build
# Ha de completar sense errors
```

### Pas 9: Commit
```bash
git add .
git commit -m "chore: initial project setup..."
```

---

## ✅ Criteris d'Èxit

- ✅ `npm run dev` funciona sense errors
- ✅ `npm run build` sense errors TypeScript
- ✅ Estructura de carpetes completa
- ✅ `.env.local` creat (no a git)
- ✅ Git repository amb first commit
- ✅ Tailwind + shadcn/ui funcionant

---

## 📊 Metrics

| Métrica | Target |
|---------|--------|
| Temps real | 2h |
| Lines of code | ~0 (setup sols) |
| Dependencies | ~15 base |
| Build time | <30s |

---

## 🚀 Pròxim Pas

→ **[Fase 1: Auth + BD](./DEV-PHASE-1.md)**

Quan Fase 0 completada, comenceu Fase 1. ~4 hores.
