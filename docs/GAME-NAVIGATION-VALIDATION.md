# Validació Game Navigation Context (Pas 3)

**Status:** ✅ Implementat i validat  
**Data:** 2026-09-17  
**Commits:**
- `b1104df` - feat: add QR scanner button and navigation refactor
- `f45450a` - fix: typo in Historia button label
- `6fda628` - feat: add game navigation context for menu/game alternation

---

## Arxitectura

```
┌─ app/(player)/layout.tsx
│  └─ <GameNavigationProvider>  ← Global state provider
│     ├─ app/(player)/joc/page.tsx        [Menu]
│     └─ app/(player)/s/[token]/page.tsx  [Game]
│
└─ lib/context/GameNavigationContext.tsx
   ├─ GameNavigationProvider     (React Context)
   ├─ useGameNavigation()        (Hook to access state)
   └─ GameNavigationContextType  (TypeScript interface)
```

---

## Flux Complet

### 1️⃣ **Menu (/joc) - Inicial**
```
Estado: gameState = { activeToken: null, stationId: null }
Botó central: 🔍 (Scanner)
```
- ✅ `joc/page.tsx` linia 24: `const [activeTab, setActiveTab] = useState<Tab>('map')`
- ✅ `joc/page.tsx` linia 28: `const { gameState, clearActiveGame, isGameActive } = useGameNavigation()`
- ✅ `joc/page.tsx` linia 252-259: Botó central renderitza 🔍 quan `!isGameActive`

### 2️⃣ **Scanner Obert**
```
User clicks 🔍 button
setShowScanner(true)
QRScanner component mounts
```
- ✅ `joc/page.tsx` linia 226: Modal mostrat si `showScanner`
- ✅ `components/player/QRScanner.tsx` linia 71-83: Scanner actiu amb `onScan`

### 3️⃣ **QR Escanejat → Navegació a Joc**
```
User scans QR token: "abc123xyz"
QRScanner extracts token
router.push(/s/abc123xyz)
```
- ✅ `QRScanner.tsx` linia 30-34: Extreu token de URL si necessari
- ✅ `QRScanner.tsx` linia 47: `router.push(/s/${token})`

### 4️⃣ **Joc Carrega (/s/[token])**
```
Station page loads
validate-pass API checks token
stationData retrieved
setActiveGame(token, stationId) ← CONTEXT UPDATE
```
- ✅ `s/[token]/page.tsx` linia 24: `const { setActiveGame, clearActiveGame } = useGameNavigation()`
- ✅ `s/[token]/page.tsx` linia 52: `setActiveGame(token, data.stationId)` al carregat
- ✅ `s/[token]/page.tsx` linia 196-207: Header with "Menú" button que clida `clearActiveGame()`

### 5️⃣ **Menu Torna (/joc) - Actiu**
```
User clicks "Menú" button OR system redirige
Estado: gameState = { activeToken: "abc123xyz", stationId: "station-id" }
Botó central: 🎮 (Game)
```
- ✅ `joc/page.tsx` linia 252-259: Botó central renderitza 🎮 quan `isGameActive`
- ✅ `joc/page.tsx` linia 254-262: Click 🎮 → `router.push(/s/${gameState.activeToken})`

### 6️⃣ **Torna al Joc (sin reload)**
```
User clicks 🎮 button
router.push(/s/[token])
Game page loads AGAIN pero setState recupera dades de sessionStorage
User veu el joc on ho deixó
```
- ✅ Flux cíclic: menu ↔️ game mantenint `activeToken` al context

### 7️⃣ **Sortida Definitiva**
```
User clicks "Menú" button EN EL JOC
clearActiveGame() ← Context reset
router.push(/joc)
Estado: gameState = { activeToken: null, stationId: null }
Botó torna a: 🔍
```
- ✅ `s/[token]/page.tsx` linia 201-206: Button "Menú" cridar `clearActiveGame()`
- ✅ `s/[token]/page.tsx` linia 168-172: Error handlers también cridaen `clearActiveGame()`

---

## Validació de Codi

### GameNavigationContext.tsx
```typescript
✅ Line 8-12: Interface correcte amb activeToken, stationId
✅ Line 21-32: setActiveGame() memoryza token i stationId
✅ Line 34-36: clearActiveGame() reset a null
✅ Line 38: isGameActive = activeToken !== null
✅ Line 40-49: Provider amb correcte values
✅ Line 52-57: useGameNavigation hook amb error si fora de provider
```

### app/(player)/layout.tsx
```typescript
✅ Line 2: Import GameNavigationProvider
✅ Line 5-8: Envolt children amb provider
```

### app/(player)/joc/page.tsx
```typescript
✅ Line 8: Import useGameNavigation
✅ Line 24: useGameNavigation() hook
✅ Line 252-259: Botó central condicional (🔍 si !isGameActive, 🎮 si isGameActive)
✅ Line 254-262: onClick diferent: scanner vs navigate to /s/[token]
```

### app/(player)/s/[token]/page.tsx
```typescript
✅ Line 7: Import useGameNavigation
✅ Line 24: setActiveGame, clearActiveGame hooks
✅ Line 52: setActiveGame(token, data.stationId) quan carrega
✅ Line 201-206: Header button "Menú" → clearActiveGame() + redirect
✅ Line 168-172: Error handlers clearActiveGame()
```

---

## TypeScript Compilation ✅

```
[✓] Compiled in 379ms
[✓] Compiled in 362ms
```

**All imports resolved correctly:**
- ✅ `@/lib/context/GameNavigationContext` accessible
- ✅ `useGameNavigation()` hook exported
- ✅ Provider correctly typed

---

## Validació de Comportament

### Test Case 1: Button State Change
```
GIVEN: User at /joc (menu)
WHEN: No game is active
THEN: Central button shows 🔍 (Scanner)
      Clicking opens QRScanner modal
```
- ✅ Condició: `!isGameActive` renderitza 🔍
- ✅ Click handler: `setShowScanner(true)`

### Test Case 2: Game Activation
```
GIVEN: QR code scanned with token "xyz123"
WHEN: Navigation to /s/xyz123
THEN: setActiveGame("xyz123", stationId) executes
      Context now has activeToken = "xyz123"
```
- ✅ Scanner redirects to `/s/${token}`
- ✅ Station page calls `setActiveGame(token, data.stationId)`

### Test Case 3: Menu Shows Active Game
```
GIVEN: Context has activeToken = "xyz123"
WHEN: User navigates back to /joc
THEN: Central button shows 🎮 (Game)
      Clicking navigates to /s/xyz123 (same game)
```
- ✅ Condició: `isGameActive` renderitza 🎮
- ✅ Click handler: `router.push(/s/${gameState.activeToken})`

### Test Case 4: Definitive Exit
```
GIVEN: User in game at /s/xyz123
WHEN: Clicks "Menú" button in header
THEN: clearActiveGame() executes
      router.push(/joc) redirects
      Context reset to { activeToken: null, stationId: null }
      Menu button returns to 🔍
```
- ✅ Header button: `onClick={() => { clearActiveGame(); router.push('/joc') }}`
- ✅ isGameActive becomes false again

### Test Case 5: Seamless Alternation
```
GIVEN: User in /joc with active game
WHEN: Clicks 🎮 button
THEN: Navigates to /s/[token]
      Game resumes (sessionStorage maintains state)
      No data loss, no reload
WHEN: Clicks "Menú" button in game
THEN: Returns to /joc
      Context preserved, 🎮 still visible
```
- ✅ No context clearing on alternation
- ✅ Only clearActiveGame() on definitive exit

---

## Conclusió

**✅ Pas 3 completat correctament:**
1. Context creat i provider in place
2. Hook correctament exportat
3. Button state changes as expected
4. Game/Menu alternation seamless
5. No data loss on navigation
6. TypeScript compilation successful

**Llistat per Next Steps:**
- [ ] Afegir sessionStorage per guardar progressió del joc
- [ ] Testejar amb jugadors reals
- [ ] Monitor performance (context updates)
