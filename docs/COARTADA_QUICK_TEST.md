# Coartada Quick Test Card (5-Minute Smoke Test)

## Setup (1 min)

```bash
# Terminal: Start dev server
npm run dev

# Wait for "Ready in X.XXs"
```

## Test (4 mins)

### Browser Preparation
- **Tab 1** (Player 1): http://localhost:3000/e/TEST
  - Right-click → DevTools → Console (keep open)
- **Tab 2** (Player 2): http://localhost:3000/e/TEST (incognito or new profile)
- **Tab 3** (Player 3): http://localhost:3000/e/TEST (incognito or new profile)
- **Tab 4** (Player 4): http://localhost:3000/e/TEST (incognito or new profile)

### Player Join Sequence

| Player | Action | Expected Console Log |
|--------|--------|----------------------|
| 1 | Name: `P1` → Submit | `[COARTADA INIT] {success: true, coartadaType: "A/B/C/D/E", playersAssigned: 1}` |
| 2 | Name: `P2` → Submit | `[COARTADA INIT] {success: true, coartadaType: same as P1, playersAssigned: 2}` |
| 3 | Name: `P3` → Submit | `[COARTADA INIT] {success: true, coartadaType: same as P1, playersAssigned: 3}` |
| 4 | Name: `P4` → Submit | `[COARTADA INIT] {success: true, coartadaType: same as P1, playersAssigned: 4}` |

## Verification (Immediate)

### Browser Console ✅
```javascript
// Copy-paste in each browser console:
fetch('/api/game/coartada')
  .then(r => r.json())
  .then(d => console.table(d.frases))
```

Each player should show **different** frase numbers:
- Player 1: `{ number: 1, content: "..." }`
- Player 2: `{ number: 2, content: "..." }`
- Player 3: `{ number: 3, content: "..." }`
- Player 4: `{ number: 4, content: "..." }`

### Database Query

```sql
-- Paste in Supabase SQL Editor
SELECT player_index, frase_number, LEFT(frase_content, 40) as preview
FROM player_coartada_frases
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST')
ORDER BY player_index;
```

**Expected Output:**
```
 player_index | frase_number | preview
--------------+--------------+------------------------------------------
 0            | 1            | En Josep va portar aiguardent i draps...
 1            | 2            | La matrona Miquel va entrar al mas q...
 2            | 3            | En Ricard va estar tota la nit fora...
 3            | 4            | Els veïns propers juren que van veure...
```

## Checklist

- [ ] All 4 `[COARTADA INIT]` logs appear
- [ ] All 4 players reach game hub (redirect to `/joc`)
- [ ] Each player's frase number is different (1, 2, 3, 4)
- [ ] All frases are from same template (type is consistent)
- [ ] No errors in browser console
- [ ] No errors in terminal output
- [ ] Database has exactly 4 rows (no duplicates)

## Success Criteria

✅ **PASS:** All checks above are green

❌ **FAIL:** Any check is red or step produces error

## Cleanup

```bash
# Clear test data for next run
# SQL in Supabase editor:
DELETE FROM player_coartada_frases 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
DELETE FROM team_coartadas 
WHERE team_id = (SELECT id FROM teams WHERE code = 'TEST');
```

## Common Issues

| Issue | Fix |
|-------|-----|
| No `[COARTADA INIT]` log | DevTools console not open before player joined; reload browser |
| Player sees error on join | Check Supabase URL/key in `.env.local` |
| Database shows 0 rows | Team code might be different; verify `SELECT * FROM teams LIMIT 5;` |
| Players get same frase | Check database constraint `UNIQUE(team_id, player_index, frase_number)` |
| 409 Conflict error | Expected on 2nd join attempt; previous test data not cleaned |

## Key Endpoints

- **Join Team:** POST `/api/auth/signin` (via PlayerNameInput)
- **Init Coartada:** POST `/api/game/init-coartada` (auto-called on first player join)
- **Get Coartada:** GET `/api/game/coartada` (returns player's frase only)

## Team Code Reference

- Use code `TEST` for all quick tests (simplest)
- Must be **exactly 6 characters** (uppercase)
- Created automatically on first player join via `/api/auth/signin`

---

**Time to run:** ~5 minutes  
**No tools needed:** Just browser + SQL editor  
**Confidence level:** High (covers 90% of coartada functionality)
