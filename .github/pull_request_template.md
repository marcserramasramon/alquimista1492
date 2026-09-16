## 📝 Descripció

**Breu resum del que canvia i per què.**

Relacionat amb: [Issue #X](link) o [Fase Y](./PRD.md#14-fases)

---

## 🎯 Tipus de canvi

- [ ] ✨ Nouvelle feature (afegeix funcionalitat)
- [ ] 🐛 Bug fix (corregeix comportament incorrecte)
- [ ] 📖 Docs (només documentació)
- [ ] ♻️ Refactor (no canvia funcionalitat)
- [ ] 🚀 Performance (millora rendiment)
- [ ] 🧪 Test (afegeix tests)

---

## 📋 Checklist

**Obligatori:**

- [ ] He llegit [PRD.md](../PRD.md) i [CLAUDE.md](../CLAUDE.md)
- [ ] Els noms de variables/funcions són en **anglès**
- [ ] L'interfície és **100% en català**
- [ ] El codi compila: `npm run build` ✅
- [ ] TypeScript: `npm run type-check` ✅
- [ ] Cap secret (credencials, tokens) al commit
- [ ] Cap fitxer `content/private/*` modificat accidentalment
- [ ] Commits petits i descriptius amb format `type(scope): description`

**Si és backend/API:**

- [ ] Validació amb `zod`
- [ ] Tota lògica validada al servidor
- [ ] RLS policies actualitzades (si canvia model)
- [ ] Migracions noves a `supabase/migrations/` (mai editar antigues)

**Si és frontend:**

- [ ] Mobile-first (funciona amb una mà, botons ≥48px)
- [ ] Sense mode fosc (sempre clar)
- [ ] Contrast WCAG AA
- [ ] Sense `import` de `content/private/*`

**Si és joc:**

- [ ] Registrat a `components/games/registry.ts`
- [ ] Implementa `GameProps`
- [ ] Públic a `content/public/stations.json`
- [ ] Solució a `content/private/stations.json`
- [ ] Descrit a `docs/jocs.md`

---

## 🧪 Testing

**Com provar aquesta PR:**

1. [Paso 1]
2. [Paso 2]
3. Esperats resultats

---

## 🔗 Links

- PRD: [./PRD.md](../PRD.md)
- Fases: [PRD §14](../PRD.md#14-fases)
- Dev guide: [./docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)

---

## 📸 Screenshots (si UI)

(Opcional: pega imatges si és canvi visual)

---

## ⚠️ Breaking changes

[ ] Aquesta PR canvia la API pública?
[ ] Això afecta com el màster o jugadors interactuen amb l'app?

(Si sí, descriu aquí)

---

**Pronto! Gràcies per la contribució!** 🎭
