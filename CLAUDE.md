# Els Guardians del Secret de Sentfores — webapp

Escape room exterior a Sentfores (Osona), ambientat el 1472 (Guerra dels Remences). Els equips recorren les 5 fites elementals (Aigua, Terra, Foc, Aire, Ànima), que formen un pentagrama al voltant del Pla de Masset, resolen cada repte físic i hi entren la resposta a la webapp. Al final, al Pla de Masset, fan el ritual del Gresol dels Cinc Elements. El màster fa alhora d'actor (l'Inquisidor, que és Fra Francesc disfressat) i controla la partida des del mòbil.

Llegeix sempre abans de treballar:
- `docs/historia-nova.md` — trama, personatges, cronologia
- `docs/fites-nova.md` — definició de cada fita i del Gresol (coordenades, respostes, pistes)
- `docs/app-nova.md` — disseny de l'app (esborrany; part del text descriu l'app antiga)

`docs/arxiu/` és la història antiga (El Traïdor de la Guixa, 1705): només referència, no és vigent.
Si hi ha contradicció entre documents, pregunta. No improvisis trama ni solucions. Els punts marcats PENDENT no es decideixen al codi.

## Stack

- Next.js (App Router) + TypeScript estricte
- Tailwind CSS 4
- Supabase (Postgres) accedit només des del servidor amb la service role key
- Sessions amb cookies JWT signades (`jose`)
- Validació amb `zod`
- Desplegament a Vercel

No afegeixis dependències noves sense dir-ho i justificar-ho.

## Regles no negociables

1. **Les solucions mai arriben al client.** Respostes i pistes viuen a `content/private/` i només s'importen des de codi de servidor (amb `import "server-only"`). Tota validació es fa al servidor.
2. **El servidor és l'autoritat**: progrés, pistes, estat de la partida. El client només mostra.
3. **Interfície 100% en català.** Codi, noms de taules i commits en anglès.
4. **Mobile-first.** Es juga a ple sol amb una mà: contrast alt, text gran, botons mínim 48px, res important només amb hover.
5. **Un o més mòbils per equip.** Cada mòbil tria la icona del seu equip i queda identificat per cookie. Tots els mòbils d'un equip comparteixen el mateix `session_nonce`; si un perd la cookie, torna a tocar la icona.
6. Tot input validat amb zod al servidor.
7. **Cap client parla directament amb Supabase.** Tot passa per `app/api/`. RLS activat a totes les taules sense policies (denegació per defecte).

## Estructura

```
app/
  page.tsx, e/[codi]/       entrada de l'equip (codi manual o QR d'equip)
  joc/                      hub amb el mapa de fites
  s/[estacioId]/            pantalla d'una fita
  final/                    ritual del Gresol (placeholder, PENDENT)
  master/                   login i dashboard del màster
  pantalles/                galeria de dev (404 en producció) amb totes les vistes; cada pantalla nova s'ha de registrar a pantalles/pantalles.tsx
  api/                      route handlers (entrar, estat, joc, resposta, pista, master/*)
components/
  games/  player/
content/
  public/                   estacions: textos, coordenades, elements (es pot enviar al client)
  private/                  solucions i pistes (només servidor)
lib/                        auth (cookies JWT), supabase (client de servidor)
supabase/migrations/        taules v2_teams i v2_progres (les anteriors són de l'app antiga)
docs/
```

## Manera de treballar

- Abans d'una tasca gran, fes un pla breu i espera confirmació.
- Canvis al model de dades: sempre via migració nova a `supabase/migrations/`, mai editant-ne una d'antiga.
- Quan una decisió estigui marcada com a PENDENT, no la inventis: deixa-la configurable o pregunta.
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

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
