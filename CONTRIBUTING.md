# Guía de Contribució

Merci per ajudar amb **El Traïdor de la Guixa**! Aquesta guía explica com contribuir.

## 🎯 Principis

1. **Llegeix sempre els documents base** abans de treballar:
   - [PRD.md](./PRD.md) — font de veritat funcional i tècnica
   - [CLAUDE.md](./CLAUDE.md) — regles no negociables
   - [docs/historia.md](./docs/historia.md) — trama i personatges
   - [docs/jocs.md](./docs/jocs.md) — definició de jocs

2. **No improvisis:** Si hi ha contradicció entre documents, pregunta primer.

3. **Regles no negociables:**
   - Les solucions **mai arriben al client** (viuen a `content/private/` i só LS servidor)
   - Interfície **100% en català**; codi en anglès
   - **Mobile-first** — funciona amb una mà al sol
   - Tota validació al servidor
   - Codi TypeScript estricte + `zod` per validació

## 📋 Procés de contribució

### 1. Crea una branca

```bash
git checkout -b feature/name-of-feature
# o
git checkout -b fix/name-of-bug
```

Format: `feature/*`, `fix/*`, `docs/*`, `refactor/*`

### 2. Fes els canvis

- **Codi en anglès**, interfície en català
- Commits petits i descriptius
- Format de commit: `<type>(<scope>): <description>`

Exemples:

```bash
git commit -m "feat(games): add SerratBruixes game logic"
git commit -m "fix(auth): validate team_id in RLS policy"
git commit -m "feat(master): add team detail view"
git commit -m "docs: update deployment steps"
```

### 3. Crea una Pull Request

Completa la plantilla:

```markdown
## 📝 Descripció
Breument: què canvia i per què?

## 🎯 Fases afectades
- [x] Fase 5 (Escàner + estació)

## ✅ Checklist
- [ ] He llegit [PRD.md](./PRD.md) i [CLAUDE.md](./CLAUDE.md)
- [ ] Els noms de variables/funcions són en anglès
- [ ] L'interfície és 100% en català
- [ ] Testos afegits (si és backend)
- [ ] El codi compila (`npm run build`)
- [ ] Cap secret a `.env` ni `content/private/`
```

### 4. Revisió

Un mantenidor revisarà la PR. Respon a comentaris i fa ajustos si calen.

## 🗂️ Estructura de fitxers

### App

- `app/(player)/` — Rutes de jugadors
- `app/(master)/` — Rutes de màster
- `app/api/` — Route handlers (validació al servidor)

### Components

```
components/
  games/
    SerratBruixesGame.tsx    # Un component per joc
    RegistryGame.tsx         # Etc.
    registry.ts              # Índex de jocs
  player/
  master/
  ui/
```

### Contingut

```
content/
  public/
    stations.json           # Públic (textos, coords, noms)
  private/
    stations.json           # PRIVAT (solucions, pistes, traïdor)
    scoring.json            # Valors de puntuació
```

### Lib

```
lib/
  supabase/
    client.ts               # Client SSR
    queries.ts              # Funcions de query
  realtime/
    useTeamStations.ts      # Hooks de sincronització
  auth/
    validateMaster.ts       # Validació màster
  scoring/
    calculateScore.ts       # Lògica de punts
```

### Database

```
supabase/
  migrations/
    001_initial.sql         # Numeracions de 3 dígits
    002_add_hints.sql
```

## 🎮 Afegir un joc nou

1. Crea `components/games/MyGameGame.tsx` amb la interfície `GameProps`
2. Registra-ho a `components/games/registry.ts`
3. Afegeix la definició a `docs/jocs.md`
4. Afegeix contingut públic a `content/public/stations.json`
5. Afegeix solució a `content/private/stations.json`
6. Usa `import "server-only"` si valides al servidor

## 🔐 Seguretat

- ❌ Cap secret al client (solucions, traïdor, tokens)
- ✅ Tota validació al servidor
- ✅ RLS activat a totes les taules
- ✅ QR amb tokens aleatoris, sense IDs
- ✅ Rate limit a validació de respostes

Veure [CLAUDE.md#regles-no-negociables](./CLAUDE.md#regles-no-negociables).

## 📊 Database

Canvis al model de dades:

1. **Crea sempre una migració nova**, no editant-ne una d'antiga:

```bash
# Crea supabase/migrations/NNN_description.sql
ALTER TABLE team_stations ADD COLUMN new_field text;
```

2. Executa-la a desenvolupament:

```bash
npx supabase db push
```

3. Testa les RLS policies:

```bash
# Verificar que els jugadors només veuen el seu equip
```

## ✅ Checklist final

Abans de fer push:

- [ ] `npm run build` sense errors
- [ ] TypeScript: `npm run type-check`
- [ ] Linter: `npm run lint` (si configurat)
- [ ] Noms de variables en anglès
- [ ] Interfície en català
- [ ] Cap secret a fitxers
- [ ] Comentaris només si la lògica no és òbvia
- [ ] Git history net (commits atòmics)

## 🤔 Preguntes frecuentes

**P: Puc afegir una nova dependència?**  
R: Justifica-la primer. Veure [CLAUDE.md#stack](./CLAUDE.md#stack).

**P: Quins components ús de shadcn?**  
R: Els que ja estan instal·lats. Demana si en cal un de nou.

**P: Puc editar `content/private/stations.json`?**  
R: Sí, però recorda que es veurà al server logs. Revisa els commits.

**P: Com testtejo amb múltiples dispositius?**  
R: Veure [docs/DEVELOPMENT.md#testing-amb-múltiples-dispositius](./docs/DEVELOPMENT.md).

## 📞 Ajuda

- Issues: Obrir un GitHub Issue
- Discussions: Per a preguntes generals
- Docs: [README.md](./README.md), [PRD.md](./PRD.md)

---

**Gràcies per contribuir!** 🎭
