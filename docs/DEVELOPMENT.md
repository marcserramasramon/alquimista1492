# Guía de desenvolupament

Setup local, workflow i debugging per a desenvolupadors.

## 🛠️ Setup inicial

### Requisits

- **Node.js** 18+ (recomana 20 LTS)
- **npm** 9+ o **yarn**
- **Git**
- Compte **Supabase** (gratuït per a dev)
- **GitHub CLI** `gh` (opcional, per a PRs)

### 1. Clonar i instalar

```bash
git clone https://github.com/[owner]/traidor-guixa.git
cd traidor-guixa

npm install
# o
yarn install
```

### 2. Variables d'entorn

Copia l'exemple:

```bash
cp .env.local.example .env.local
```

Completa els valors:

```env
# Supabase (dev)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase (server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Auth
MASTER_PIN=1234
MASTER_SESSION_SECRET=random-long-string-min-32-chars
PASS_SECRET=another-random-string-min-32-chars

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Obtenir les credencials Supabase:**

1. Crea un projecte a [supabase.com](https://supabase.com)
2. Vés a Settings → API
3. Copia `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copia `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copia `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Migracions Supabase

Estableix la connexió Supabase local:

```bash
npx supabase init  # Si és la primera vegada
npx supabase db push
```

Això crea les taules i policies RLS.

### 4. Executar desenvolupament

```bash
npm run dev
```

Obrir [http://localhost:3000](http://localhost:3000)

## 📱 Workflow diari

### Crear una feature

```bash
# Crear branca
git checkout -b feature/my-feature

# Fer canvis, commits petits
git commit -m "feat(games): add new game logic"

# Push a GitHub
git push origin feature/my-feature

# Crear PR (manual o via GitHub CLI)
gh pr create --title "Add new game" --body "Descripció..."
```

### Testos locals

```bash
# Build (detecta errors TypeScript)
npm run build

# Type checking
npm run type-check

# Lint (si configurat)
npm run lint

# (Opcional) Test jest
npm run test
```

### Debugging

#### Next.js dev server

Ja surt a la consola. Errors a `localhost:3000` → la tab Network del navegador.

#### Supabase Realtime

Obrir [Supabase Studio](https://supabase.com/dashboard) → `Realtime` → veure eventos en directe.

Pots debug manualment:

```typescript
import { createClient } from '@supabase/supabase-js'

const client = createClient(url, key)

// Subscriu-te a un canal
const subscription = client
  .channel('team:123')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'team_stations' }, (payload) => {
    console.log('Change:', payload)
  })
  .subscribe()
```

#### Errors de RLS

Supabase mostra errors de RLS a la consola del navegador. Si un jugador no pot llegir taules:

1. Verifica RLS policies a [Supabase Studio](https://supabase.com/dashboard) → Policies
2. Assegura't que la `auth.uid()` matcheja amb `player_id`
3. Comprueba que `team_id` és correcte

## 🎮 Testing amb múltiples dispositius

### Simulació local

```bash
# Terminal 1
npm run dev

# Terminal 2: Simula un altre jugador a IP de la màquina
# Busca la IP local:
ipconfig getifaddr en0  # macOS
# o
hostname -I             # Linux
# o
ipconfig                # Windows

# Obrir a un altre navegador:
http://[IP-LOCAL]:3000
```

### Dispositiu físic (Android)

1. Assegura't que el PC i Android estan a la mateixa xarxa WiFi
2. Obrir a Android: `http://[IP-PC]:3000`
3. HTTPS necessita certificat autosignat o usar Vercel preview

### Dispositiu físic (iOS)

iOS requereix HTTPS per a càmera QR.

Opcions:

1. **Vercel preview:** Push a branch, Vercel auto-deploy → comparteix link
2. **ngrok:** `ngrok http 3000` → https URL pública
3. **Localhost.run:** `ssh -R 80:localhost:3000 localhost.run`

## 🗂️ Estructura de codi

### Componentes

```typescript
// components/games/MyGame.tsx
import { GameProps } from '@/types/games'
import 'server-only' // Opcional, si ussa secrets

export function MyGameGame(props: GameProps) {
  const { stationId, content, submit, solved } = props

  return (
    <div>
      {/* Joc aquí */}
    </div>
  )
}
```

Registra a `components/games/registry.ts`:

```typescript
export const GAMES_REGISTRY: Record<string, React.ComponentType<GameProps>> = {
  'my-game': MyGameGame,
  // ...
}
```

### Route handlers

```typescript
// app/api/stations/[id]/submit/route.ts
import { createClient } from '@/lib/supabase/server'
import 'server-only'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { answer } = await req.json()

  // Validar resposta
  const isCorrect = answer === 'secret-answer'

  if (isCorrect) {
    // Actualizar BD
    // Retornar èxit
  }

  return Response.json({ correct: isCorrect })
}
```

### Hooks Realtime

```typescript
// lib/realtime/useTeamStations.ts
'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase/client'

export function useTeamStations(teamId: string) {
  const supabase = useSupabaseClient()
  const [stations, setStations] = useState([])

  useEffect(() => {
    // Subscriure's al canal
    const subscription = supabase
      .channel(`team:${teamId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_stations' }, (payload) => {
        setStations((s) => [...s, payload.new])
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [teamId, supabase])

  return stations
}
```

## 🔐 Secrets i `.env`

### Local development

Usa `.env.local` (gitignored):

```
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### Production (Vercel)

Configura a [Vercel Dashboard](https://vercel.com) → Settings → Environment Variables.

### Private content

`content/private/` conté solucions i no s'importa a client (verificar amb `build`):

```bash
grep -r "import.*content/private" src/  # No hauria de sortir res
```

## 📊 Dades de test

### Crear equips de test

Script SQL a Supabase Studio:

```sql
-- Crear sessió
INSERT INTO sessions (name, status) VALUES ('Test Session', 'draft') RETURNING id;

-- Crear equips (canvia session_id)
INSERT INTO teams (session_id, name, join_code, color) VALUES 
  ('SESSION_ID', 'Team 1', 'T1', 'blue'),
  ('SESSION_ID', 'Team 2', 'T2', 'red');

-- Crear jugadors
INSERT INTO players (team_id, name) VALUES 
  ('TEAM_ID_1', 'Alice'),
  ('TEAM_ID_1', 'Bob');
```

## 🚀 Desplegament a Vercel

Automàtic: cada push a `main` es desplegua.

Staging: branca `develop` pre-deploy.

Veure [docs/DEPLOYMENT.md](./DEPLOYMENT.md).

## 📚 Comandos útils

```bash
# Build producció
npm run build

# Type check
npm run type-check

# Format (si prettier configurat)
npm run format

# Database push (migracions)
npx supabase db push

# Veure logs Supabase
supabase functions download

# Reset database (⚠️ esborrar tot)
npx supabase db reset
```

## ❓ Troubleshooting

### Error: `SUPABASE_SERVICE_ROLE_KEY not found`

Verifica `.env.local` i que npm run dev la carrega.

### RLS errors al client

1. Verifica que l'usuari té `auth.uid()`
2. Comprueba policies a Supabase Studio
3. Assegura't que `player_id` matcheja

### Realtime no sincronitza

1. Verifica que Realtime està activat a Supabase (Settings → Replication)
2. Mira la consola del navegador per errors
3. Revisa el canal a que estàs subscrit

### QR scanner no funciona a iOS

- HTTPS requerida (Vercel preview o ngrok)
- Permissions: `<NSCameraUsageDescription>` a info.plist (Next.js auto-genera)

## 📞 Ajuda

- Docs: [README.md](../README.md), [PRD.md](../PRD.md)
- Issues: GitHub
- Discussions: Per a preguntes generals

---

**Happy coding!** 🎭
