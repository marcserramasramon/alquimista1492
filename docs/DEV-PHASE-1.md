# 🔐 Fase 1: Models de Dades + Autenticació

**Status:** 📋 Planejament  
**Durada:** 4 hores  
**Inici:** Setmana 1–2  
**Dependency:** Fase 0 completada  
**Branch:** `phase/1-auth-db`

---

## 🎯 Objectiu

Supabase funcionant amb taules, RLS policies, auth anònima (jugadors) + auth master (PIN).

---

## 📋 Checklist

### 1. Supabase Project
- [ ] Create Supabase project (supabase.com)
- [ ] Anotar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Afegir secrets a `.env.local`
- [ ] Enable Realtime (Settings → Realtime)
- [ ] Test connection: `npm install @supabase/supabase-js` + simple query

### 2. Database Tables

#### 2.1 Taula `teams`
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  variant CHAR(1) NOT NULL DEFAULT 'A' CHECK (variant IN ('A', 'B', 'C')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Taula creada
- [ ] Índex en `code`

#### 2.2 Taula `players`
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  player_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Taula creada
- [ ] Foreign key `team_id`
- [ ] Índex en `team_id`

#### 2.3 Taula `sessions`
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  current_act INTEGER DEFAULT 1,
  current_station VARCHAR(50),
  solved_stations TEXT[] DEFAULT '{}',
  code_digits TEXT[] DEFAULT ARRAY['', '', '', ''],
  discovered_at TIMESTAMP,
  solved_at TIMESTAMP,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Taula creada
- [ ] Foreign key `team_id`

#### 2.4 Taula `attempts`
```sql
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  station_id VARCHAR(50) NOT NULL,
  attempt_number INTEGER NOT NULL,
  answer TEXT,
  is_correct BOOLEAN,
  hints_used TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Taula creada
- [ ] Índex en `session_id`, `station_id`

#### 2.5 Taula `results`
```sql
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL,
  moral_choice VARCHAR(20),
  epilogue_id VARCHAR(50),
  finished_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Taula creada

#### 2.6 Taula `master_sessions`
```sql
CREATE TABLE master_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id VARCHAR(255) NOT NULL,
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```
- [ ] Taula creada

### 3. RLS Policies

#### 3.1 `teams`
- [ ] Players: SELECT own team (team_id matches)
- [ ] Master: SELECT ALL

#### 3.2 `players`
- [ ] Players: SELECT own team members
- [ ] Master: SELECT ALL

#### 3.3 `sessions`
- [ ] Players: SELECT/UPDATE own session
- [ ] Master: SELECT ALL

#### 3.4 `attempts`
- [ ] Players: SELECT/INSERT own session attempts
- [ ] Master: SELECT ALL

#### 3.5 `results`
- [ ] Players: SELECT own result
- [ ] Master: SELECT ALL

### 4. Autenticació Jugadors

#### 4.1 Crear `lib/auth/player.ts`
```typescript
// signInAsPlayer(teamCode: string, playerName: string)
// - Verificar codi equip (exists en BD)
// - Create Supabase Auth user (anònim)
// - Insert player record
// - Create session record
// - Return session token
```
- [ ] Fitxer creat
- [ ] Function implemented
- [ ] Error handling: codi no existeix, jugador duplicat

#### 4.2 Crear `lib/auth/master.ts`
```typescript
// loginMaster(pin: string, secret: string)
// - Validar PIN contra env:MASTER_PIN
// - Generate JWT amb sub: "master"
// - Sign with env:MASTER_SESSION_SECRET
// - Return token
```
- [ ] Fitxer creat
- [ ] Function implemented

### 5. Supabase Edge Functions

#### 5.1 Crear `supabase/functions/validate-answer/index.ts`
```typescript
// POST /validate-answer
// Body: { station_id, answer, session_id, hint_level }
// Response: { success, digit, evidence_unlock, suspects_dismissed, score_delta }
// - Load SOLUTIONS from content/private/solutions.json
// - Validate against solutions[station_id][variant]
// - Return result
```
- [ ] Function created
- [ ] Deployed to Supabase

#### 5.2 Crear `supabase/functions/unlock-evidence/index.ts`
```typescript
// POST /unlock-evidence
// Body: { session_id, evidence_ids }
// - Update session.evidence_unlocked[]
// - Return success
```
- [ ] Function created
- [ ] Deployed

### 6. API Routes (Next.js)

#### 6.1 Crear `app/api/auth/signin/route.ts`
```typescript
// POST /api/auth/signin
// Body: { teamCode, playerName }
// - Call lib/auth/player.signInAsPlayer()
// - Return { session_token, team_id }
```
- [ ] Route created

#### 6.2 Crear `app/api/auth/master/route.ts`
```typescript
// POST /api/auth/master
// Body: { pin }
// - Call lib/auth/master.loginMaster()
// - Return { master_token }
```
- [ ] Route created

#### 6.3 Crear `app/api/validate-answer/route.ts`
```typescript
// POST /api/validate-answer
// Body: { station_id, answer, session_id }
// - import 'server-only'
// - Load SOLUTIONS
// - Validate
// - Update BD
// - Return result
```
- [ ] Route created
- [ ] import 'server-only' present

### 7. Migrations en Git
- [ ] `supabase/migrations/YYYY-MM-DD_000000_init.sql` — Tots els creates
- [ ] `supabase/migrations/YYYY-MM-DD_000001_rls_policies.sql` — RLS
- [ ] Migrations executable: `supabase db push`

### 8. Testing

#### 8.1 Manual Test — Player Auth
- [ ] Create team (manual SQL): `INSERT INTO teams (code, variant) VALUES ('TEST01', 'A')`
- [ ] Call `POST /api/auth/signin` amb `{ teamCode: 'TEST01', playerName: 'Test Player' }`
- [ ] Response: `{ session_token, team_id }`
- [ ] Verify player inserted en BD

#### 8.2 Manual Test — Master Auth
- [ ] Call `POST /api/auth/master` amb PIN correcte
- [ ] Response: `{ master_token }`
- [ ] Verify JWT is signed correctly

#### 8.3 Manual Test — RLS
- [ ] Sign in com a Player 1
- [ ] Query `SELECT * FROM teams` → Should only get own team
- [ ] Verify que NO veu altres equips

#### 8.4 Manual Test — Validation
- [ ] Call `POST /api/validate-answer` amb resposta correcta
- [ ] Response: `{ success: true, digit: 4, ... }`
- [ ] Verify attempt inserta en BD

---

## ✅ Criteris d'Èxit

- ✅ 6 taules creades a Supabase
- ✅ RLS policies actives (verificar que RLS enforced)
- ✅ Player auth funciona
- ✅ Master auth funciona
- ✅ Validation API funciona
- ✅ Manual tests passen
- ✅ Migrations en git (reproducibles)

---

## 🚀 Pròxim Pas

→ **[Fase 2: UI Base](./DEV-PHASE-2.md)**

Quan Fase 1 completada. ~3 hores.
