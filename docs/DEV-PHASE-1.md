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
  evidence_unlocked TEXT[] DEFAULT '{}',
  suspects_dismissed TEXT[] DEFAULT '{}',
  salconduits_remaining INTEGER DEFAULT 3,
  salconduits_used TEXT[] DEFAULT '{}',
  discovered_at TIMESTAMP,
  solved_at TIMESTAMP,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: Set expires_at to started_at + 90 minutes
CREATE OR REPLACE FUNCTION update_session_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.started_at + INTERVAL '90 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_session_expiry
BEFORE INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_expiry();
```
- [ ] Taula creada
- [ ] Foreign key `team_id`
- [ ] ✅ Array columns: `evidence_unlocked`, `suspects_dismissed`, `salconduits_used`
- [ ] ✅ Integer column: `salconduits_remaining` (starts at 3)
- [ ] ✅ Timestamps: `started_at`, `expires_at` (auto-set by trigger)
- [ ] ✅ Trigger created for auto-expiry (90 min countdown)

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

#### 2.7 Taula `solutions_private` ⭐ (SECRET — RLS protected)
```sql
CREATE TABLE solutions_private (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id VARCHAR(50) NOT NULL,
  variant CHAR(1) NOT NULL CHECK (variant IN ('A', 'B', 'C')),
  solution JSONB NOT NULL,
  hints JSONB DEFAULT '{"level_1": "", "level_2": "", "level_3": ""}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(station_id, variant)
);

-- Example data structure for solution JSONB:
-- Jog 1 (Polybius): { "answer": "SAP DE LLETRA", "digit": 4, "evidence": "fire_beacons", "suspects_dismissed": ["Pere", "Joan"] }
-- Jog 2 (Date): { "day": 13, "digit": 2, "evidence": "water_ledger", "suspects_dismissed": ["Marianna"] }
-- Jog 3 (Map): { "time": "14:45", "digit": 3, "evidence": "patrol_route", "suspects_dismissed": ["Isidre"] }
-- Jog 4 (Text): { "choice": "C", "digit": 1, "evidence": "tombstone", "suspects_dismissed": ["Anton"] }
```
- [ ] Taula creada
- [ ] Índex: UNIQUE(station_id, variant)
- [ ] ⚠️ **CRITICAL:** Activar RLS — per defecte DENY ALL
- [ ] RLS policy: `service_role` (servidor) pot SELECT/INSERT/UPDATE
- [ ] RLS policy: Players/Master NOT pot accedir (denied)

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

#### 3.6 `solutions_private` ⭐ (CRITICAL — Secret answers)
- [ ] **DEFAULT: DENY ALL** (RLS enabled, all policies deny)
- [ ] Server policy: `service_role` can SELECT
  ```sql
  CREATE POLICY "service_role_can_select"
  ON solutions_private
  FOR SELECT
  TO service_role
  USING (true);
  ```
- [ ] Insert policy: `service_role` can INSERT (for seeding)
  ```sql
  CREATE POLICY "service_role_can_insert"
  ON solutions_private
  FOR INSERT
  TO service_role
  WITH CHECK (true);
  ```
- [ ] ⚠️ **Verify:** anon user cannot SELECT (test with cURL)

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
// - ⭐ Load SOLUTIONS from supabase.from('solutions_private').select()
//   Query: station_id = ? AND variant = ? (from session.variant)
// - Validate answer against solutions[variant].solution.answer
// - Return result { success, digit, evidence, suspects_dismissed }
// - ⚠️ Use SERVICE_ROLE key to query solutions_private (RLS allows only service_role)
```
- [ ] Function created (uses service_role client)
- [ ] Deployed to Supabase
- [ ] ✅ Solutions never exposed to client (server-only query)

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
- [ ] `supabase/migrations/YYYY-MM-DD_000000_init.sql` — Tots els creates (6 tables)
- [ ] `supabase/migrations/YYYY-MM-DD_000001_session_columns.sql` — Add evidence/salconduits columns + trigger
  - Evidence tracking: `evidence_unlocked`, `suspects_dismissed`
  - Salconduits: `salconduits_remaining`, `salconduits_used`
  - Countdown: `started_at`, `expires_at` (auto-set by trigger)
- [ ] `supabase/migrations/YYYY-MM-DD_000002_rls_policies.sql` — RLS per a totes les taules
- [ ] Migrations executable: `supabase db push`
- [ ] Verify: `supabase db pull` matches local schema

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

#### 8.5 Manual Test — Session Columns
- [ ] Create session via `/api/auth/signin`
- [ ] Query session: `SELECT started_at, expires_at, evidence_unlocked, salconduits_remaining FROM sessions WHERE id = '...'`
- [ ] Verify:
  - [ ] `started_at` = NOW
  - [ ] `expires_at` = started_at + 90 min ✅ (trigger works)
  - [ ] `evidence_unlocked = '{}'` (empty array)
  - [ ] `salconduits_remaining = 3` (starts at 3)
- [ ] Simulate evidence unlock: `UPDATE sessions SET evidence_unlocked = array_append(evidence_unlocked, 'fire_beacons') WHERE id = '...'`
- [ ] Verify quadern subscription receives update (real-time test in Fase 2)

#### 8.6 Manual Test — Solutions Security (CRITICAL)
- [ ] Insert test solution: `INSERT INTO solutions_private (station_id, variant, solution) VALUES ('jog_1', 'A', '{"answer":"SAP DE LLETRA","digit":4}')`
- [ ] **Try to access as Player (MUST FAIL):**
  - Open browser dev tools
  - Try: `supabase.from('solutions_private').select()` with anon key
  - ✅ Should get error: "403 Forbidden" or "RLS policy violation"
- [ ] **Verify Server can access:**
  - Use `supabase.from('solutions_private').select()` with SERVICE_ROLE key
  - ✅ Should return solution data
- [ ] ⚠️ **If player CAN access:** RLS policy NOT set correctly — FIX immediately

---

## ✅ Criteris d'Èxit

- ✅ 7 taules creades a Supabase (+ `solutions_private`)
- ✅ `sessions` table amb 5 noves columnes:
  - `evidence_unlocked`, `suspects_dismissed`, `salconduits_remaining`, `salconduits_used`
  - `started_at`, `expires_at` (trigger auto-set)
- ✅ `solutions_private` table amb RLS:
  - Players CANNOT SELECT (403 Forbidden) ⭐
  - Server (service_role) CAN SELECT
  - Unique constraint: (station_id, variant)
- ✅ Trigger per a `expires_at` funciona correctament
- ✅ RLS policies actives (verificar que RLS enforced) — especialment 8.6!
- ✅ Player auth funciona (creates session amb noves columnes)
- ✅ Master auth funciona
- ✅ Validation API funciona (loads solutions from table, not file)
- ✅ Manual tests passen (8.1–8.6 incloses)
- ✅ Migrations en git (reproducibles)
- ✅ Schema matches PRD Fase 2 + 3 requirements
- ✅ **Security:** Secrets are protected (solutions only accessible server-side)

---

## 🚀 Pròxim Pas

→ **[Fase 2: UI Base](./DEV-PHASE-2.md)**

Quan Fase 1 completada. ~3 hores.
