# 👑 Fase 5: Dashboard Màster — Planificació Detallada

**Status:** 📋 Especificació Detallada  
**Durada:** ~2 hores de desenvolupament  
**Inici:** Després de Fase 4 (Jocs 5–9)  
**Dependency:** 
- ✅ Fase 1: Sessions + Autenticació anònima + BD
- ✅ Fase 2: UI Base + Navegació
- ✅ Fase 3: Jocs 1–4 (Estacions d'investigació)
- ✅ Fase 4: Jocs 5–9 (Traïció + Final) + Sistema de resultats

**Branch:** `phase/5-master-dashboard`

---

## 🎯 Objectiu

Implementar la webapp del **Màster** (l'actor que fa d'Emissari):
1. **Login PIN**: Autenticació segura del màster (6 dígits hash)
2. **Dashboard en directe**: Monitoritzar equips en temps real
3. **Pantalla de resultats**: Rànquing final quan acaba la partida
4. **Middleware de seguretat**: Protegir rutes `/master/*` amb JWT

**Sortida:** Màster pot controlar la partida des del mòbil mentre actua a peu.

---

## 📐 Arquitectura

### Estructura de Carpetes (POSTFASE 4)

```
app/
├── (master)/
│   ├── layout.tsx                    # Layout màster (sense player nav)
│   ├── login/
│   │   └── page.tsx                  # Pantalla PIN
│   ├── master/
│   │   └── page.tsx                  # Dashboard principal
│   └── results/
│       └── page.tsx                  # Rànquing final

components/
├── master/
│   ├── MasterDashboard.tsx           # Taula equips + controls
│   ├── MasterTeamRow.tsx             # Una fila d'equip
│   ├── MasterTimer.tsx               # Cronometre global
│   ├── MasterResults.tsx             # Taula resultats
│   ├── MasterActions.tsx             # Bottons accions ràpides
│   └── MasterStats.tsx               # Panel estadístiques (opcional)

lib/
├── auth/
│   ├── master-auth.ts                # JWT + PIN hash
│   └── master-session.ts             # Gestió sesió màster
├── realtime/
│   └── useMasterDashboard.ts         # Hook subscripció Realtime
└── scoring/
    └── calculateFinalScore.ts        # Càlcul puntuació final

app/api/
├── auth/
│   └── master/
│       ├── login/route.ts            # POST: validar PIN → JWT
│       └── logout/route.ts           # GET: clear token
├── master/
│   ├── session/route.ts              # GET: dades sessió actual
│   ├── teams/route.ts                # GET: equips en directe
│   ├── results/route.ts              # GET: resultats finals
│   ├── bell/route.ts                 # POST: setjar hora final (campana automàtica)
│   └── passes/
│       └── validate.ts               # POST: validar QR salconduit → resta 10 punts

middleware.ts                          # Protegir `/master/*` routes
```

---

## 🔑 1. AUTENTICACIÓ I SEGURETAT DEL MÀSTER

### 1.1 Login PIN (Pantalla)

**Ubicació:** `app/(master)/login/page.tsx`

**Requisits:**
- Input de 6 dígits (masked, com a password)
- Botó "Entrar" (tota l'amplada, 48px mínim)
- Missatge d'error si PIN incorrecte (vermell, text clar)
- Sense pre-fill ni autofill (per seguretat)
- Redirect automàtic a `/master` si ja loguejat

**Validació Client:**
```
- Accepta només dígits (0–9)
- Mínim 6 caràcters
- Botó disabled fins que és exactament 6 dígits
- Enter key = botó Entrar
```

**Validació Servidor:**
```
- POST /api/auth/master/login
  Entrada: { pin: string }
  
  1. Validació zod: pin = 6 dígits
  2. Hash PIN rebut: bcrypt(pin)
  3. Comparar vs env:MASTER_PIN_HASH (o setup inicial)
  4. Si correcte:
     - Generar JWT amb hs256:
       * payload: { sub: "master", iat: now, exp: now+12h }
       * secret: env:MASTER_SESSION_SECRET
     - Set cookie httpOnly, secure, sameSite
     - Return: { success: true, redirect: "/master" }
  5. Si incorrecte:
     - Log intentada fallida (timestamp, IP)
     - Return: { success: false, error: "PIN incorrecte" }
     - Rate-limit: màx 5 intents / 15 min (o bannejar IP temporalment)
```

### 1.2 JWT Token

**Token estructura:**
```json
{
  "sub": "master",
  "session_id": "uuid-de-la-sessio-actual",
  "iat": 1234567890,
  "exp": 1234571490,
  "aud": "master-dashboard"
}
```

**Issued at login, expires 12 hores (suficient per una partida de 90 min + temps post-partida).**

### 1.3 Middleware de Protecció

**Ubicació:** `middleware.ts`

**Lògica:**
```
1. Request a /master/* (excepte /master/login)
2. Validar JWT de cookie
3. Si valid:
   - Afegir decoded token a request headers
   - Continue
4. Si invalid/expired/missing:
   - Redirect a /master/login
5. Logout: clear cookie + redirect /master/login
```

### 1.4 Setup Inicial (PIN)

**Primera vegada (env):**
```bash
# .env.local
MASTER_PIN_HASH=<bcrypt_hash_de_6_digits>
MASTER_SESSION_SECRET=<random_256_bits>
```

**Configuració:**
- El PIN es genera offline o a través d'una ruta `/setup` protegida per IP.
- Per producció, usar hash precomputat al `.env`.
- **No guardar PIN en plain text mai.**

---

## 📊 2. DASHBOARD PRINCIPAL

**Ubicació:** `app/(master)/master/page.tsx`

**Navegació:**
- URL: `/master`
- Requereix JWT válid
- Si expired, redirect `/master/login`

### 2.1 Layout Principal

```
┌─────────────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA — CONTROL          │
│  [Hora]  [PIN]  [Logout]                   │
├─────────────────────────────────────────────┤
│                                             │
│  ⏱️  CRONOMETRE GLOBAL: 00:45:30            │  ← Panel 2
│     [████░░░░░░░] 50%                       │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  EQUIPS EN DIRECTE:                         │  ← Panel 1
│  ┌──────────────────────────────────────┐  │
│  │ Nom    │ Codi │ Acte │ Est │ Temps  │  │
│  ├──────────────────────────────────────┤  │
│  │ Titans │ A1X3 │ II   │4/6  │ 45:30  │  │
│  │ Vikes  │ B2K4 │ I    │2/6  │ 45:30  │  │
│  │ Águilas│ C3P7 │ III  │6/6  │ 45:30  │  │
│  └──────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [📋 VEURE RESULTATS]  [🚪 LOGOUT]         │  ← Panel 3
│                                             │
│  Equips: 3  |  En joc: 2  |  Finals: 1     │  ← Panel 4
│                                             │
└─────────────────────────────────────────────┘
```

### 2.2 Panel 1: Taula d'Equips en Directe

**Columnes (ordre prioritari):**

| Columna | Ample | Contingut | Real-time | Ordenació |
|---------|-------|-----------|-----------|-----------|
| Nom equip | 30% | Text + badge color | Sí | ←— prioritari |
| Codi | 15% | 4 caràcters | Estàtic | — |
| Acte | 10% | I / II / III / — | Sí | — |
| Estacions | 15% | "4/6" | Sí | — |
| Temps restant | 12% | MM:SS | Sí (cada sec) | — |
| Salconduits | 10% | 🎫 count (3/3) | Sí | — |
| Status | 8% | Badge: "actiu", "final", "derrota" | Sí | ← color |

**Comportament:**
- **Auto-refresh:** WebSocket Realtime (subscrip a taula `teams`)
- **Fallback:** Si Realtime cau, polling cada 5 seg (HTTP GET `/api/master/teams`)
- **Fila destacada:** L'equip que més rep accions (pista, salconduit, ajust) es ressalta 2 seg
- **Clickable:** Clicar fila → detall d'equip (opcional Panel 5, future phase)
- **Ordre:** Per defecte per punts (descendents); filtrable per status

**Colors de Status:**
- 🟢 **Actiu:** En joc, amb temps restant
- 🟡 **Alertat:** Sense progrés >10 min (opcional tooltip)
- 🔴 **Derrota:** Temps 0 i no han tocat la campana (acusació invalid o no enviada)
- ⚪ **Final:** Acusació enviada, esperant campana

### 2.3 Panel 2: Cronometre Global

**Ubicació:** Dalt, prominent.

**Especificacions:**
- **Format:** `MM:SS` (compte enrere de 90:00 → 00:00)
- **Font:** EB Garamond 400, 48px, color vermell cotxinilla (`#7A1F26`)
- **Fons:** Negre semitransparent 60%
- **Actualització:** Real-time (cada 100ms) via WebSocket
- **Barra de progrés (visual):**
  - 🟢 Verd: >30 min
  - 🟡 Taronja: 10–30 min
  - 🔴 Vermell: <10 min
  
**Comportament:**
- Servidor autoritatiu: `session.started_at + 90*60*1000 = temps_fi`
- Client calcula `temps_restant = temps_fi - Date.now()`
- Si `temps_fi < now`, mostrar "00:00" (no negatives)
- Campana sona (opcional audio feedback) a –5s

**Botó Pausa (Future Phase 6):**
- Per ara: no visible
- Futura: `session.status = paused`, pausa tots els equips

### 2.4 Panel 3: Accions Ràpides

**Ubicació:** Inferior, dos botons.

**Botó 1: "📋 VEURE RESULTATS"**
- **Visible:** Només si `session.status = ended`
- **Acció:** Navega a `/master/results`
- **Estil:** Botó primari gran (full-width, 48px)

**Botó 2: "🚪 LOGOUT"**
- **Visible:** Sempre
- **Acció:** 
  - Clear cookie JWT
  - Redirect a `/master/login`
  - Confirmació doble si sessió en curs
- **Estil:** Botó secundari (full-width, 48px)

### 2.5 Panel 4: Estadístiques (Opcional per Fase 5)

**Ubicació:** Peus de dashboard.

**Dades:**
```
Equips connectats: 3
En joc: 2
Finalitzats: 1
Derrotes: 0
Temps mitja: 67:45
```

**Codi:** Calculat cada vegada que es carrega `/master`, no real-time.

---

## 🔔 2.6 ACCIONS CRÍTICAS DEL MÀSTER: CAMPANA + SALCONDUITS

### 2.6.1 La Campana (Bell) — Activació Automàtica

**Context:** El màster posa una **hora de finalització** que actua com a alarma. Quan arriba l'hora exacta, la campana **sona automàticament a TOTS els jugadors simultàniament**.

**Flux:**

1. **Màster a Dashboard:**
   - Botó gran (o botó dins Panel 3): `[🔔 ACTIVAR CAMPANA A LES...]`
   - Pop-up: "Hora de campana?" + time picker (HH:MM)
   - Confirmació doble: "Sí, sona a les 16:45:00"

2. **Servidor (POST /api/master/bell):**
   - Entrada: `{ session_id, bell_time_unix }`
   - Validació: `bell_time > now` (no pot ser del passat)
   - Actualitza `sessions.bell_at = bell_time_unix`
   - Publica event via Realtime: `"bell:activated"` amb timestamp
   - Registra a `score_events` type `"bell_set"`

3. **A tots els jugadors (WebSocket):**
   - Realtime notifica `bell_at` actualitzat
   - Cronometre jugador s'ajusta: **compte enrere fins a l'hora exacta**
   - Quan `Date.now() >= bell_at`:
     - 🔔 **Sona àudio campana** (1–2 seg, wav o mp3)
     - Pantalla es torna **vermella intensa**
     - Missatge: "CAMPANA SONADA! PARTIDA FINALITZADA!"
     - Tots els équips veuen simultàniament (no hi ha desync si potes client/server sincronitzats)

4. **Màster (Dashboard):**
   - Veu a la taula: `session.bell_at` mostrat en compte enrere
   - Quan campana sona: botó es desactiva
   - Status de tots els équips passa a "🔴 Finalitzat"

**API `/api/master/bell` (POST):**
```typescript
// Request
{
  session_id: string;
  bell_time_unix: number;  // timestamp unix en ms
}

// Response (success)
{
  success: true;
  bell_at: 1234567890000;
  message: "Campana activada per a les 16:45:32";
}

// Response (error)
{
  success: false;
  error: "L'hora ha de ser futura";
  status: 400;
}
```

**Taula BD (sessions) actualizada:**
```sql
ALTER TABLE sessions ADD COLUMN bell_at TIMESTAMP;
```

---

### 2.6.2 Salconduits (Passes) — Validació QR

**Context:** Els jugadors es-escanegen el **QR del seu salconduit** (el qual mostren a pantalla completa a la webapp). El màster (Emissari) escaneja aquest QR des del seu mòbil usant l'escàner del dashboard. El servidor **valida el token**, **resta 10 punts automàticament** i el màster veu la confirmació.

**Flux d'Equip (Jugador):**

1. Equip obri pestanya "Salconduit" a webapp
2. Pantalla completa amb QR rotatiu (renewing cada 5 seg per seguretat)
3. QR conté JWT token signat servidor: 
   ```json
   {
     "team_id": "uuid",
     "pass_token": "xxxxx",
     "iat": 1234567890,
     "exp": 1234567950  // 60 seg
   }
   ```

**Flux del Màster:**

1. **Botó a Dashboard:** `[📱 ESCANEJAR SALCONDUIT]`
   - Abre escàner càmera (live feed)
   - Escaneja el QR del jugador
   - QR conté el token

2. **Servidor valida (POST /api/master/passes/validate):**
   - Entrada: `{ pass_token, session_id }`
   - Validació JWT:
     ```
     a) JWT signat correctament? (secret: PASS_SECRET)
     b) Token expirat? (>60 seg)
     c) team_id existeix i pertany a la sessió?
     d) Cooldown activat? (últim salconduit <10 min)
     ```
   - **Si vàlid:**
     - Registra `score_events`: type `"pass_used"`, points `-10`
     - Actualitza `teams.passes_used += 1`
     - Registra timestamp a `passes_used_at` (per cooldown)
     - Retorna: `{ success: true, team_name, new_score, -10 }`
   
   - **Si falla (cooldown):**
     - Retorna: `{ success: false, error: "Cooldown. Intenta en X min", status: 429 }`
   
   - **Si token expired:**
     - Retorna: `{ success: false, error: "Token expirat. Demana al jugador que mostri de nou", status: 401 }`

3. **Màster veu (al dashboard o pop-up):**
   - ✅ **Sí:** Fitxa ràpida:
     ```
     ✅ SALCONDUIT VÀLID
     Equip: Titans (blau)
     Punts actuals: 1250 → 1240
     -10 punts aplicats
     
     [↩️ DESFER (5s)]  [✓ Confirmar]
     ```
   - ❌ **No:** Missatge d'error amb motiu

4. **Jugadors de l'equip veuen overlay:**
   - Pantalla es "queda" amb overlay semitransparent
   - Missatge: "L'Emissari vos ha interceptat! −10 punts 🎫"
   - Es desmiss automàticament en 3 seg
   - Realtime actualitza punts al dashboard

**Proteccions:**
- **Cooldown 10 min:** Un equip no pot gastar 2 salconduits en <10 min (evita panic abuse)
- **Token JWT 60 seg:** El QR és vàlid només 1 minut (força client a demanar de nou)
- **Rate limiting:** Màx 2 salconduits per equip per partida (o configurable)

**API `/api/master/passes/validate` (POST):**
```typescript
// Request
{
  pass_token: string;  // JWT del QR
  session_id: string;
}

// Response (success)
{
  success: true;
  team_id: string;
  team_name: string;
  new_score: number;
  points_deducted: -10;
  passes_remaining: 1;  // equip tenia 3, ara 2
  undoToken: string;    // per botó Desfer
  undo_expires_in: 5000  // ms fins expirar botó
}

// Response (cooldown)
{
  success: false;
  error: "Cooldown actiu. Intenta en 4 min 32 seg";
  status: 429;
}

// Response (expired)
{
  success: false;
  error: "Token expirat. Demana al jugador que mostri de nou";
  status: 401;
}
```

**Taula BD per salconduits (Opcional, Fase 1 o Fase 5):**
```sql
CREATE TABLE passes_used (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  session_id UUID NOT NULL REFERENCES sessions(id),
  used_at TIMESTAMP DEFAULT now(),
  validated_by_master BOOLEAN DEFAULT true,
  undo_at TIMESTAMP  -- si es desfeu
);
```

---

## 📈 3. PANTALLA DE RESULTATS

**Ubicació:** `app/(master)/results/page.tsx`

**URL:** `/master/results`

**Accessibilitat:**
- Requereix JWT válid
- Visible només si `session.status = ended`
- Si sessió no acabada, botó "Tornar al Dashboard"

### 3.1 Layout

```
┌─────────────────────────────────────────────────────┐
│  RESULTATS FINALS — EL TRAÏDOR DE LA GUIXA          │
│  Sessió finalitzada a les 16:45:32                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  RÀNQUING FINAL:                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🥇 1r │ Titans      │ 67:45 │ 1250 │ A │ 🎫🎫 │ │
│  │ 🥈 2n │ Vikes       │ 72:30 │ 1120 │ B │ 🎫🎫🎫 │ │
│  │ 🥉 3r │ Águilas     │ 89:59 │ 850  │ A │ 🎫🎫 │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ESTADÍSTIQUES:                                     │
│  - Equips que van elegir Epíleg A: 67%              │
│  - Equips que van elegir Epíleg B: 33%              │
│  - Puntuació mitja: 1073                            │
│  - Temps mitja acusació: 72:15                      │
│                                                     │
│  [📥 EXPORTAR CSV]  [🔙 TORNAR AL DASHBOARD]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Taula de Rànquing

**Columnes (ordre de visualització):**

| Columna | Contingut | Forma | Ample |
|---------|-----------|-------|-------|
| **Posició** | 1r, 2n, 3r, ... + 🥇🥈🥉 | Medalles emoji | 10% |
| **Nom equip** | Text + color de l'equip (background) | Badge | 25% |
| **Temps total** | MM:SS (temps fins a acusació) | Monoespai | 12% |
| **Puntuació final** | Nombre | Text gros | 15% |
| **Decisió moral** | A (Compassió) / B (Justícia) | Badge | 10% |
| **Salconduits usats** | Comptat visual 🎫 (1/3, 2/3, 3/3) | Iconografia | 12% |
| **Acusació correcta?** | ✅ Correcta / ❌ Incorrecta | Icon + text | 16% |

**Ordenació:**
- **Primari:** Per puntuació descendent
- **Secundari (desempat):** Per temps ascendent (qui ha acusat primer)

**Comportament:**
- Filtreable per `session_id`
- Exportable a CSV (opcional):
  ```csv
  Posició,Equip,Temps,Punts,Decisió,Salconduits,Correcta
  1r,Titans,67:45,1250,A,2,✓
  ...
  ```

### 3.3 Estadístiques Globals

**Calculades post-partida:**

```typescript
{
  totalTeams: 3,
  epilogueA: 2,        // Equips que van acceptar Bernat
  epilogueB: 1,        // Equips que van rebutjar
  percentageA: 66.7,
  percentageB: 33.3,
  averageScore: 1073,
  averageTime: "72:15",
  maxScore: 1250,
  minScore: 850,
  correctAccusations: 3,  // Tots van acusar Bernat
  wrongAccusations: 0
}
```

---

## 🔌 4. REAL-TIME: WEBSOCKET REALTIME + FALLBACK

### 4.1 Hook `useMasterDashboard()`

**Ubicació:** `lib/realtime/useMasterDashboard.ts`

**Responsabilitats:**
1. Subscribe a taula `sessions` (per sessió_id actual)
2. Subscribe a taula `teams` (totes per sessió)
3. Subscribe a taula `results` (post-partida)
4. Gestionar reconexió (disconnections, timeouts)
5. Retornar state centralitzat

**Signa:**
```typescript
export function useMasterDashboard(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe a Realtime channels
    const sub1 = supabase
      .channel(`sessions:${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, (payload) => {
        setSession(payload.new as Session);
      })
      .subscribe();

    const sub2 = supabase
      .channel(`teams:${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "teams", filter: `session_id=eq.${sessionId}` }, (payload) => {
        setTeams(prev => [...prev.filter(t => t.id !== payload.new.id), payload.new as Team]);
      })
      .subscribe();

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, [sessionId]);

  return { session, teams, results, isConnected, error };
}
```

### 4.2 Fallback a Polling

**Si Realtime cau:**
1. Detectar desconexió (timeout 30 seg)
2. Passar a HTTP GET `/api/master/teams?session_id=XXX` cada 5 seg
3. Mostrar badge "🔄 Sincronització manual" a costat del timer
4. Reintentar Realtime cada 10 seg

### 4.3 Actualitzacions Editorials (Master Action)

**Quan màster fa accions (pista, ajust punts, etc):**
1. Acció → POST `/api/master/actions/...:
2. Servidor actualitza BD
3. Realtime notifica tots els clients (player + master)
4. Dashboard màster es refresha automàticament

---

## 🗄️ 5. MODEL DE DADES (REFERENCIAT DE FASE 1)

### 5.1 Taules Necessàries (Fase 1)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'lobby', 'running', 'paused', 'ended')),
  started_at TIMESTAMP,
  paused_at TIMESTAMP,
  paused_total_ms INTEGER DEFAULT 0,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  name TEXT NOT NULL,
  color TEXT,
  join_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE team_stations (
  team_id UUID NOT NULL REFERENCES teams(id),
  station_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('hidden', 'discovered', 'solved')),
  discovered_at TIMESTAMP,
  solved_at TIMESTAMP,
  errors INTEGER DEFAULT 0,
  game_state JSONB,
  PRIMARY KEY(team_id, station_id)
);

CREATE TABLE results (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  final_score INTEGER,
  time_to_accusation INTEGER,  -- en segons
  moral_choice TEXT CHECK(moral_choice IN ('A', 'B')),
  accusation_correct BOOLEAN,
  passes_used INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE score_events (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  station_id TEXT,
  event_type TEXT,  -- 'station_solved', 'pass_used', 'hint_given', etc
  points INTEGER,
  created_at TIMESTAMP DEFAULT now()
);
```

### 5.2 Queries per Dashboard Màster

**Query 1: Session actual**
```sql
SELECT * FROM sessions WHERE id = $1;
```

**Query 2: Tots els equips + estacions resoltes**
```sql
SELECT 
  t.id, t.name, t.color, t.join_code,
  COUNT(CASE WHEN ts.status = 'solved' THEN 1 END) as solved_count,
  COUNT(ts.*) as total_stations,
  COALESCE(SUM(se.points), 0) as total_score,
  COALESCE(COUNT(CASE WHEN se.event_type = 'pass_used' THEN 1 END), 0) as passes_used,
  MAX(ts.solved_at) as last_activity
FROM teams t
LEFT JOIN team_stations ts ON t.id = ts.team_id
LEFT JOIN score_events se ON t.id = se.team_id
WHERE t.session_id = $1
GROUP BY t.id
ORDER BY total_score DESC;
```

**Query 3: Resultats finals (post-partida)**
```sql
SELECT 
  r.id, r.team_id, t.name, t.color,
  r.final_score,
  r.time_to_accusation,
  r.moral_choice,
  r.accusation_correct,
  r.passes_used,
  ROW_NUMBER() OVER (ORDER BY r.final_score DESC, r.time_to_accusation ASC) as position
FROM results r
JOIN teams t ON r.team_id = t.id
WHERE r.session_id = $1
ORDER BY position ASC;
```

### 5.3 RLS (Row Level Security)

**Màster:**
- Pot llegir totes les sessions, equips, resultats
- Pol editar estatus de sessions

```sql
CREATE POLICY "master_read_all_sessions"
  ON sessions FOR SELECT
  TO public
  USING (
    auth.jwt() ->> 'sub' = 'master'
    OR auth.jwt() ->> 'sub' = current_user_id  -- per testing
  );
```

---

## 🔒 6. SEGURETAT

### 6.1 HTTPS i Cookies Segures

```typescript
// Response header per JWT cookie
response.cookies.set("master_token", jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/master",
  maxAge: 12 * 60 * 60  // 12 hores
});
```

### 6.2 Rate Limiting (PIN Brute Force)

**Implementació:**
- Guardar intents fallits a Redis o BD temporal
- Après 5 intents fallits en 15 min → bannejar IP per 30 min
- Log: timestamp, IP, PIN intentat (sense guardar)

```typescript
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const LOCKOUT_DURATION = 30;  // min

// /api/auth/master/login
const attempts = await redis.get(`master_login_attempts:${ip}`);
if (attempts >= MAX_ATTEMPTS) {
  return { error: "Massa intents. Intenta en 30 min.", status: 429 };
}

if (pinHash !== expectedHash) {
  await redis.incr(`master_login_attempts:${ip}`);
  await redis.expire(`master_login_attempts:${ip}`, LOCKOUT_MINUTES * 60);
  return { error: "PIN incorrecte", status: 401 };
}
```

### 6.3 CSRF Protection (si form)

- Si form tradicional: CSRF token (Vercel maneja automàticament)
- Si API direct: confiar en JWT + httpOnly cookie

### 6.4 Auditoria

Log totes les accions màster:
```typescript
// Taula: master_actions (opcional Phase 6)
CREATE TABLE master_actions (
  id UUID PRIMARY KEY,
  master_session_token TEXT,  -- hash del token
  action TEXT,                -- 'login', 'give_hint', 'adjust_score', etc
  team_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 📱 7. UI/UX — MOBILE-FIRST

### 7.1 Viewport

- **Target:** Mòbil 375–667px (una mà)
- **Màster juga físicament:** accions ràpides, botó grans (48px mínim)
- **Llum natural:** contrast alt, text gran
- **Sense scroll horitzontal**

### 7.2 Tipografia

- **Títol:** EB Garamond 600, 32px, cotxinilla (`#7A1F26`)
- **Body:** Work Sans 400, 16px, negre (`#2c2c2c`)
- **Monoespaciat (timer):** IBM Plex Mono, 48px

### 7.3 Colors

- **Primari:** Vermell cotxinilla (`#7A1F26`)
- **Secundari:** Verd pasqua (`#3d7e3d`)
- **Alert:** Taronja (`#d97706`)
- **Danger:** Vermell viu (`#dc2626`)
- **Fons:** Crema (`#faf8f3`)
- **Text:** Negre sòlit (`#2c2c2c`)
- **Status badges:**
  - Actiu: 🟢 `#10b981`
  - Alerta: 🟡 `#f59e0b`
  - Finalitzat: ⚪ `#9ca3af`
  - Derrota: 🔴 `#ef4444`

### 7.4 Componentes Reutilitzables

```typescript
// components/ui/MasterButton.tsx
<button className="w-full py-3 px-4 bg-cochineal text-white rounded font-semibold text-lg">
  Action
</button>

// components/ui/MasterBadge.tsx
<span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  Actiu
</span>

// components/ui/MasterTimer.tsx
<div className="text-6xl font-mono text-cochineal">00:45:30</div>
```

---

## 🧪 8. TESTING I VERIFICACIÓ

### 8.1 Unit Tests

**Ubicació:** `__tests__/master/`

```
- auth.test.ts          # Hash PIN, JWT generation
- dashboard.test.ts     # Càlculs estadístiques
- scoring.test.ts       # Score events aggregation
```

### 8.2 Integration Tests (E2E)

**Ubicació:** `e2e/master/`

```
1. Login amb PIN correcte → JWT cookie set
2. Dashboard carrega equips en temps real
3. Timer countdown sincronitzat
4. Logout clear cookie → redirect /master/login
5. Accés `/master` sense token → redirect login
```

### 8.3 Manual Testing Checklist

```
LOGIN:
  ☐ PIN correcte → entra, JWT cookie set
  ☐ PIN incorrecte → error, sense cookie
  ☐ Brute force (6+ intents) → rate limit actiu
  ☐ Refresh `/master` sense token → redirect login
  ☐ Logout → cookie clear, redirect login

DASHBOARD:
  ☐ 3+ equips visibles en taula
  ☐ Timer compte enrere correcte
  ☐ Actualitzacions real-time (Realtime websocket)
  ☐ Si cau Realtime → fallback polling 5s
  ☐ Botó "Veure Resultats" visible si sessió ended
  ☐ Botó "Veure Resultats" disabled si sessió running
  ☐ Clicks fila → highlight 2s (opcional)

RESULTATS:
  ☐ Taula ordenada per punts (desc)
  ☐ Desempats per temps (asc)
  ☐ Medalles emoji visibles
  ☐ Percentages A/B correctes
  ☐ Exportar CSV genera fitxer
  ☐ Botó "Tornar" → `/master`

SEGURETAT:
  ☐ Cookie httpOnly + secure flags
  ☐ JWT expires correctament (12h)
  ☐ Rate limit logs visible al servidor
  ☐ No s'exposa secrets al client
  ☐ HTTPS obligatori (Vercel per defecte)
```

---

## 🚀 9. FLUX DE DESENVOLUPAMENT ESTEP-BY-STEP

### Pas 1: Setup Rutes i Layout (15 min)
- [ ] Crear `app/(master)/layout.tsx`
- [ ] Crear `app/(master)/login/page.tsx` (placeholder)
- [ ] Crear `app/(master)/master/page.tsx` (placeholder)
- [ ] Crear `app/(master)/results/page.tsx` (placeholder)
- [ ] Middleware `/master/*` → checks JWT

### Pas 2: Autenticació (30 min)
- [ ] `lib/auth/master-auth.ts` → funcions hash PIN, JWT generation
- [ ] `app/api/auth/master/login/route.ts` → POST PIN → JWT
- [ ] `app/api/auth/master/logout/route.ts` → GET clear cookie
- [ ] Test manual: login correcte/incorrecte

### Pas 3: Dashboard UI (45 min)
- [ ] Component `MasterDashboard.tsx` → layout 4 panells
- [ ] Component `MasterTeamRow.tsx` → una fila taula
- [ ] Component `MasterTimer.tsx` → countdown timer
- [ ] Integrar a `/app/(master)/master/page.tsx`
- [ ] Styling mobile-first

### Pas 4: Real-time Integration (30 min)
- [ ] `lib/realtime/useMasterDashboard.ts` → hook Realtime
- [ ] Connectar a Supabase (sessions, teams channels)
- [ ] Fallback polling si Realtime cau
- [ ] Test manual: Realtime updates

### Pas 5: Resultats (20 min)
- [ ] Component `MasterResults.tsx` → taula rànquing
- [ ] Integrar a `/app/(master)/results/page.tsx`
- [ ] Query BD resultats finals
- [ ] Exportar CSV (opcional)

### Pas 6: Polish i Testing (20 min)
- [ ] Rate limiting brute force
- [ ] Auditoria logs master actions
- [ ] E2E testing
- [ ] Seguretat final review

**Total: ~2 hores**

---

## ✅ 10. CRITERIS D'ÈXIT

**Fase 5 completada quan:**

1. ✅ Login màster: PIN 6 dígits → JWT cookie
2. ✅ Dashboard carrega equips en temps real (Realtime)
3. ✅ Timer countdown 90 min visible i sincronitzat
4. ✅ Taula equips mostra: nom, codi, acte, estacions, temps, salconduits, status
5. ✅ Botó "Veure Resultats" funcionalment
6. ✅ Pantalla resultats: rànquing ordenat + estadístiques
7. ✅ Logout funciona: clear cookie + redirect login
8. ✅ Accés `/master` sense JWT → redirect `/master/login`
9. ✅ Brute force protection actiu (5 intents / 15 min)
10. ✅ All endpoints covered by E2E tests
11. ✅ Mobile-first: >375px viewport, sense scroll horitzontal
12. ✅ Accessibility: ARIA labels, contrast alt, text gran

---

## 📋 11. DEPENDENCIES I ASSUMPTIONS

### Assumptions de Fase 1–4
- ✅ BD Supabase configurada (sessions, teams, team_stations, results)
- ✅ Auth anònima players funcionant
- ✅ Totes les estacions jocs ja estan resolved (Fase 3–4)
- ✅ Score aggregation funcionant (score_events table)
- ✅ Realtime enabled al Supabase projecte

### Llibreries Necessàries
- `jose` — JWT generation/verification
- `bcrypt` o `bcryptjs` — PIN hash
- `@supabase/ssr` — Realtime subscriptions
- `zod` — Validació entrada PIN
- Ja incloses: Tailwind, shadcn/ui, framer-motion (opcional animations)

### Setup .env (Fase 1 ja hauria de tenir)
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Master-specific
MASTER_PIN_HASH=<bcrypt($pin)>
MASTER_SESSION_SECRET=<random_256_bits>

# Opcional
REDIS_URL=...  # Per rate limiting
```

---

## 🎯 12. DELIVERABLES

**Al final de Fase 5:**

```
✅ app/(master)/
   ├── layout.tsx
   ├── login/page.tsx
   ├── master/page.tsx
   └── results/page.tsx

✅ components/master/
   ├── MasterDashboard.tsx
   ├── MasterTeamRow.tsx
   ├── MasterTimer.tsx
   ├── MasterResults.tsx
   ├── MasterActions.tsx
   └── MasterStats.tsx (opcional)

✅ lib/auth/
   ├── master-auth.ts
   └── master-session.ts

✅ lib/realtime/
   └── useMasterDashboard.ts

✅ app/api/auth/master/
   ├── login/route.ts
   └── logout/route.ts

✅ app/api/master/
   ├── session/route.ts
   ├── teams/route.ts
   ├── results/route.ts
   ├── bell/route.ts
   └── passes/
       └── validate.ts

✅ middleware.ts (actualitzat)

✅ __tests__/master/
   ├── auth.test.ts
   ├── dashboard.test.ts
   └── scoring.test.ts

✅ e2e/master/
   └── dashboard.spec.ts

✅ Documentació: docs/DEV-PHASE-5-COMPLETE.md
```

---

## 🔗 13. PRÒXIM PASO: FASE 6 (POLISH)

Després que Fase 5 estigui completa:

- [ ] Settings màster (durada partida, num salconduits, etc)
- [ ] Historial d'accions màster (audit log visual)
- [ ] Pausa/Reanuda partida
- [ ] Exportar tota la sessió a CSV/PDF
- [ ] Dark mode (opcional, PRD diu sense mode fosc)
- [ ] Notificacions push si equip en risc (>15 min sense progrés)
- [ ] QA final, performance tuning

---

## 📞 14. QUESTIONS / DECISIONS PENDENTS

**Mentre heu fet Fase 5, confirmeu:**

1. ☐ Rate limiting: Redis o taula BD temporal?
2. ☐ Audit logs: guardar master_actions a BD?
3. ☐ CSV export: quins camps exactes?
4. ☐ Fallback polling: 5 seg és correcte?
5. ☐ Per Phase 6: Permetre Pausa partida?

---

## 📚 DOCUMENTACIÓ RELACIONADA

- `docs/PRD.md` — Especificació completa joc
- `docs/SCHEMA.md` — Model de dades
- `docs/historia.md` — Trama
- `docs/DEV-PHASE-4.md` — Jocs 5–9 (predeccessor)
- `docs/DEV-PHASE-6.md` — Polish (successor)

---

**Versió:** 1.0.0  
**Data:** 2026-09-16  
**Status:** 📋 Llista per desenvolupament  
**Estimació:** ~2 hores  
**Autor:** Planning  

---

**FI DE PLANIFICACIÓ FASE 5**

Prox: Desenvolupament codi (Fase 5 Implementació)
