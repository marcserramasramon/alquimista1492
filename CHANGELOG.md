# Changelog

Tots els canvis destacats d'aquest projecte es documenten en aquest fitxer.

El format es basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
i aquest projecte segueix [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fase actual: Setup (Fase 0-1)

#### Added

- [Fase 0] Estructura Next.js amb App Router
- [Fase 0] Setup Supabase (dev + prod)
- [Fase 0] Deploy automàtic a Vercel
- [Fase 0] Tailwind CSS + shadcn/ui
- [Fase 0] TypeScript estricte
- Documentació inicial (PRD, historia, jocs)

#### Pending

- [Fase 1] Migracions Postgres
- [Fase 1] RLS policies
- [Fase 1] Càrrega contingut JSON
- [Fase 2] Dashboard màster
- [Fase 3] Entrada jugadors
- [Fase 4] Hub i mapa
- [Fase 5] Jocs i puntuació
- Etc. (veure PRD, secció Fases)

---

## Versioning

- **0.1.0-dev** → Fase 0 completada (estructura)
- **0.2.0-dev** → Fase 1–2 (data model + màster)
- **0.3.0-dev** → Fase 3–4 (entrada jugadors + hub)
- **0.4.0-dev** → Fase 5–6 (jocs + dashboard)
- **0.5.0-dev** → Fase 7–9 (pistes + acusació)
- **0.6.0-dev** → Fase 10–11 (jocs reals + poliment)
- **1.0.0** → Release estable (llest per producció)

---

## Guidelines per a canvis

Cada PR hauria de documentar:

1. **Fase afectada** (1, 2, etc.)
2. **Added** / **Fixed** / **Changed** / **Removed**
3. **Breaking changes** (si n'hi ha)
4. **Testing notes** (com probar-ho)

Exemple:

```markdown
### [0.3.0-dev] - 2026-09-20

#### Added
- [Fase 3] Entrada d'equip per QR
- [Fase 3] Pantalla de nom
- [Fase 3] Sala d'espera amb presence

#### Fixed
- [Fase 3] RLS policy per a jugadors nous

#### Testing
- Escaneja QR d'equip des d'Android
- Afegeix múltiples jugadors al mateix equip
- Verifica que tots veuen presence en directe
```

---

## Nota de privacitat

**No documentes solucions ni spoilers al changelog públic.**

Si un canvi afecta `content/private/`, descriu el canvi genèricament:

```markdown
#### Changed
- [Fase 5] Updated scoring values in private configuration
```

---

## Links de fases

- [PRD Fase 0](./PRD.md#14-fases)
- [PRD Fase 1](./PRD.md#14-fases)
- Etc.
