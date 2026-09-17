# El Traïdor de la Guixa — webapp

Escape room exterior a Sentfores–La Guixa (Osona), ambientat el maig de 1705 (Pacte dels Vigatans). Els equips recorren el poble, escanegen QR a les estacions, resolen jocs a la webapp i han de descobrir qui és el traïdor. El màster fa alhora d'actor (l'Emissari) i controla la partida des del mòbil.

Llegeix sempre abans de treballar:
- `docs/PRD.md` — especificació funcional i tècnica (font de veritat)
- `docs/historia.md` — trama, personatges, sospitosos, evidències
- `docs/jocs.md` — definició de cada joc d'estació

Si hi ha contradicció entre documents, pregunta. No improvisis trama ni solucions.

## Stack

- Next.js (App Router) + TypeScript estricte
- Tailwind + shadcn/ui
- Supabase: Postgres, Realtime, Auth anònima (jugadors)
- Desplegament a Vercel
- Estil visual: PRD secció 16 (paleta i tipografies d'època, sense mode fosc)
- Llibreries: @supabase/ssr, @yudiel/react-qr-scanner, qrcode, leaflet + react-leaflet, jose, zustand, framer-motion, zod, howler, server-only

No afegeixis dependències noves sense dir-ho i justificar-ho.

## Regles no negociables

1. **Les solucions mai arriben al client.** Respostes, pistes no desbloquejades, identitat del traïdor i tokens d'estació viuen a `content/private/` i només s'importen des de codi de servidor (amb `import "server-only"`). Tota validació es fa al servidor.
2. **El servidor és l'autoritat**: punts, temps, estat de la partida. El client només mostra.
3. **Interfície 100% en català.** Codi, noms de variables, taules i commits en anglès.
4. **Mobile-first.** Es juga a ple sol amb una mà: contrast alt, text gran, botons mínim 48px, res important només amb hover.
5. **Temps real**: tots els mòbils d'un equip han de veure el mateix estat. Mai confiïs que un sol dispositiu té la versió bona.
6. Tot input validat amb zod, a client i servidor.
7. RLS activat a totes les taules. Els jugadors només llegeixen dades del seu equip.

## Estructura

```
app/
  (player)/e/[code]/        entrada per QR d'equip
  (player)/joc/             hub, mapa, quadern, salconduit, estacions
  (player)/s/[token]/       destí dels QR d'estació
  (master)/master/          dashboard i eines del màster
  api/                      route handlers (validació, accions)
components/
  games/                    un component per joc + registry.ts
  player/  master/  ui/
content/
  public/                   textos narratius, coordenades, noms (es pot enviar al client)
  private/                  solucions, pistes, tokens, traïdor (només servidor)
lib/
  supabase/  scoring/  realtime/  auth/
supabase/migrations/
docs/
```

## Jocs d'estació

Cada joc és un component a `components/games/`, registrat a `registry.ts` amb l'id de l'estació. Tots reben la mateixa interfície (vegeu PRD, secció Jocs). Un joc no accedeix mai directament a Supabase: fa servir els hooks de `lib/realtime` i la funció `submit`.

## Manera de treballar

- Treballa per fases (PRD, secció Fases). No passis a la següent sense que la fase actual funcioni.
- Abans d'una fase, fes un pla breu i espera confirmació.
- Canvis al model de dades: sempre via migració nova a `supabase/migrations/`, mai editant-ne una d'antiga.
- Quan una decisió estigui marcada com a PENDENT al PRD, no la inventis: deixa-la configurable o pregunta.
- Commits petits i descriptius.

## Variables d'entorn

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MASTER_PIN=
MASTER_SESSION_SECRET=
PASS_SECRET=
NEXT_PUBLIC_APP_URL=
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
