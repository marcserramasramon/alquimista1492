# PRD — El Traïdor de la Guixa (webapp)

Versió 0.1 · Estat: llest per començar desenvolupament

## 1. Visió

Webapp mòbil per a un escape room exterior de 90 minuts a Sentfores–La Guixa. Diversos equips (4–6 persones) competeixen alhora per descobrir el traïdor que ha delatat el Pacte dels Vigatans. La partida s'acaba quan sona la campana real del poble.

Components del joc:
- **Cartells físics** a 6 estacions, amb QR
- **Webapp jugadors**: narrativa, jocs, evidències, acusació
- **Webapp màster**: control de la partida. El màster és també l'Emissari (actor), situat a la zona Pla de Masset–Rectoria

## 2. Rols

| Rol | Accés | Dispositiu |
|---|---|---|
| Jugador | QR d'equip + nom. Sessió anònima Supabase | El seu mòbil |
| Màster / Emissari | PIN → cookie signada | Mòbil (una mà, mentre actua) |

## 3. Decisions preses

- Una sola trama: El Traïdor de la Guixa
- Una sola sessió activa alhora
- Puntuació d'equip; el salconduit resta 10 punts (cooldown 10 min)
- Acusació a la Plaça de l'Església amb mínim 4 estacions resoltes
- Diversos equips alhora, competint
- Tots els mòbils d'un equip sincronitzats en temps real
- Estacions en ordre lliure
- Validació estació: QR per arribar + resposta per resoldre (o joc que es completa sol)
- Bona cobertura mòbil a tot el recorregut (no cal mode offline)
- Victòria per punts; desempat per temps
- Tot en català

## 4. Estacions i punts del mapa

| id | Nom | Tipus | Lat | Lng |
|---|---|---|---|---|
| `serrat-bruixes` | Serrat de les Bruixes | estació | 41.910870 | 2.224520 |
| `font-ferro` | Font del Ferro | estació | 41.914870 | 2.227445 |
| `planes-bones` | Planes Bones | estació | 41.912311 | 2.233423 |
| `cementiri` | Cementiri | estació | 41.912593 | 2.227438 |
| `pla-masset` | Pla del Masset | estació | 41.913152 | 2.229791 |
| `rectoria` | Rectoria | estació | 41.913121 | 2.228085 |
| `placa-esglesia` | Plaça de l'Església | punt d'acusació (inici i final) | 41.913860 | 2.227806 |

- Plaça de l'Església no és una estació amb joc: és on es fa l'acusació i on sona la campana. Al mapa té una icona pròpia i sempre és visible.
- Mapa centrat automàticament per encabir tots els punts (`fitBounds`) amb marge.
- Textos i jocs: `content/public/stations.json`, `content/private/stations.json`, `docs/jocs.md`.

## 5. Fluxos principals

### 5.1 Entrada d'un jugador
1. **Benvinguda** (navegador, app no instal·lada): títol + botó "Descarrega l'app" (PWA: `beforeinstallprompt` a Android/Chrome; instruccions manuals "Comparteix → Afegeix a pantalla d'inici" a iOS Safari, que no té prompt natiu). Enllaç petit "Accés màster" cap a `/login`. Botó secundari "Continua sense instal·lar" per no bloquejar la partida si la instal·lació falla
2. **Pantalla d'inici de l'app instal·lada**: títol, subtítol, instruccions curtes i botó "Escanejar". L'escaneig del QR d'equip es fa **dins l'app** (càmera in-app), no amb la càmera nativa del mòbil, perquè el jugador no surti mai del mode standalone
3. El QR d'equip segueix codificant `${origin}/e/[code]` (el mateix format que ja genera el màster); l'escàner in-app en detecta el codi de 6 caràcters i navega a `/e/[code]` sense sortir de l'app
4. Si no té sessió anònima, se'n crea una
5. Pantalla de nom. Si l'equip ja té jugadors, es mostren i pot triar "sóc jo" (reconnexió) o afegir-se com a nou
6. Sala d'espera fins que el màster inicia

**Reconnexió:** en obrir l'app (instal·lada o no), si ja hi ha una sessió de jugador desada localment (Supabase la persisteix sola) i l'equip associat encara és actiu, es salta directament a la pantalla principal (`/joc`) sense passar per les pantalles 1–2. Si la partida ja no és activa (acabada o equip reiniciat pel màster), es descarta la sessió desada i cal tornar a escanejar el QR de grup.

### 5.2 Estació
1. Equip escaneja QR d'estació → `/s/[token]`
2. Servidor valida token + partida en marxa + jugador d'un equip → marca estació com a `discovered` per a l'equip, registra `discovered_at`
3. Tots els mòbils de l'equip obren l'estació
4. Narrativa → joc → resposta
5. **Sistema genèric de desbloqueig (reutilitzable per a tots els jocs):**
   - Servidor valida resposta
   - ✅ **Correcte:** Estació → `solved`, registra `solved_at`, suma punts, desbloqueja evidències, descarta sospitosos, obté xifra
   - ❌ **Incorrecte:** −10 punts, registra a `attempts`, opcional: penalització de temps
6. Tots els mòbils ho veuen en temps real

Alternativa al QR: camp de codi manual (codi curt imprès al cartell).

### 5.3 Pista
Des de l'estació. Pistes per nivells (definides a `docs/jocs.md`). Cada nivell resta punts. Confirmació abans de gastar-la. El màster també pot regalar-ne.

### 5.4 Salconduit
1. Jugador obre la pestanya Salconduit: QR a pantalla completa
2. L'Emissari l'escaneja des del mòbil de màster
3. Servidor valida el token → **resta 10 punts a l'equip** automàticament, ho registra a `passes` i `score_events`
4. Màster veu: nom de l'equip, punts actuals, "−10 aplicat" i botó **Desfer** (5 s, per errors d'escaneig)
5. Tots els mòbils de l'equip reben un overlay: l'Emissari us ha interceptat, −10 punts

Protecció: **cooldown de 10 minuts per equip** (configurable). Si s'escaneja un equip dins el cooldown, no resta i el màster veu el temps que falta. Evita buidar un equip per error o per escanejos repetits.

Les altres accions del màster (pistes, ajustos, missatges) són al detall d'equip, no a l'escaneig.

### 5.5 Acusació final

Condicions per poder acusar:
1. Sessió `running`
2. Mínim **4 de 6 estacions resoltes** (configurable)
3. L'equip escaneja el **QR d'acusació a la Plaça de l'Església**. Obliga a tornar al centre, a prop de l'Emissari, i crea tensió final

Flux:
- Abans de complir condicions, la pantalla d'acusació mostra què falta
- Tria sospitós + fins a 3 evidències que ho demostren
- Confirmació doble al mòbil que acusa; la resta de mòbils de l'equip veuen en directe què s'està triant
- Un sol intent per equip, irreversible
- El resultat (encert o no) **no es revela fins que sona la campana**. L'equip veu "acusació lliurada"
- Servidor calcula punts i registra el moment (desempat)

### 5.6 La campana
- El màster prem "Fer sonar la campana" (confirmació doble)
- Sessió passa a `ended`; tots els mòbils mostren pantalla final amb so de campana i rànquing
- El compte enrere als mòbils és orientatiu; no acaba la partida sol

## 6. Pantalles jugadors

### Cronometre Visible

Durant tota la partida (mentres `session.status = running`):
- **Posició:** Dalt centrat de la pantalla
- **Altura:** 5% de l'alçada de pantalla del mòbil
- **Font:** EB Garamond 400, vermell de cotxinilla (`--cochineal` #7A1F26)
- **Fons:** Negre semitransparent
- **Format:** Compte enrere `HH:MM:SS` fins a l'hora de la campana
- **Actualització:** En temps real
- **Ús:** Genera sensació d'urgència; registra `discovered_at` i `solved_at` per a desempats

### Navegació i Contingut

Navegació inferior fixa (durant la partida): **Hub · Mapa · Quadern · Salconduit**

| # | Pantalla | Contingut |
|---|---|---|
| 1 | Benvinguda | Títol, botó "Descarrega l'app" (PWA), enllaç accés màster |
| 2 | Inici app instal·lada | Títol, subtítol, instruccions, botó "Escanejar" (QR d'equip, in-app) |
| 3 | Entrada | Crea sessió, carrega equip (des de `/e/[code]`) |
| 4 | Nom | Input nom / triar jugador existent |
| 5 | Sala d'espera | Membres en directe, missatge "esperant l'Emissari" |
| 6 | Intro | Narrativa inicial (una vegada, es pot tornar a veure) |
| 7 | Hub | 6 estacions amb estat, punts, temps, botó escanejar |
| 8 | Mapa | Leaflet + OSM, estacions amb color per estat, posició pròpia opcional |
| 9 | Escàner | Càmera + codi manual (estacions) |
| 10 | Estació | Narrativa + joc + resposta, pistes |
| 11 | Quadern | Evidències desbloquejades, fitxes de sospitosos |
| 12 | Pista | Modal de confirmació i contingut |
| 13 | Missatge | Overlay pantalla completa amb missatges del màster |
| 14 | Salconduit | QR rotatiu a pantalla completa |
| 15 | Acusació | Tria sospitós + evidències, confirmació |
| 16 | Final | Campana, resultat equip, rànquing |

Pantalles 1–2: només es veuen si no hi ha una sessió de jugador vàlida desada al dispositiu (vegeu 5.1, Reconnexió).

Estats de les estacions: `hidden` (no descoberta), `discovered`, `solved`.

## 7. Pantalles màster

| # | Pantalla | Contingut |
|---|---|---|
| 1 | Accés | PIN |
| 2 | Sessions | Crear, obrir, tancar |
| 3 | Preparació | Crear equips (nom, color), generar i imprimir QR d'equips i d'estacions |
| 4 | Pre-partida | Jugadors connectats per equip, botó Iniciar |
| 5 | Dashboard | Targeta per equip: punts, estacions, errors, pistes, última activitat, alerta si >15 min sense progrés. Botó gran **Escanejar salconduit** sempre visible |
| 6 | Detall equip | Cronologia d'events, accions: pista, desbloquejar estació, ajustar punts, missatge |
| 7 | Escàner salconduit | Càmera → fitxa ràpida equip + accions |
| 8 | Missatges | A un equip o a tots |
| 9 | Controls globals | Iniciar, pausar/reprendre, fer sonar la campana |
| 10 | Resultats | Rànquing, exportar CSV |

Disseny per a una mà: accions principals a la part inferior, confirmació en accions destructives.

## 8. Puntuació

La puntuació és **de l'equip**: tots els jugadors sumen al mateix marcador. No hi ha puntuació individual.

Valors a `content/private/scoring.json`:

| Concepte | Punts |
|---|---|
| Estació resolta | +100 |
| Resposta incorrecta | −10 |
| Pista nivell 1 / 2 / 3 | 0 / −2 / −5 |
| Interceptat per l'Emissari (salconduit) | −10 |
| Acusació correcta (sospitós) | +300 |
| Cada evidència correcta a l'acusació | +50 |
| Cada evidència incorrecta a l'acusació | −25 |
| Ajust manual màster | lliure |

La puntuació d'equip no baixa mai de 0.
Desempat: moment de l'acusació (abans guanya); si no n'hi ha, moment de l'última estació resolta.

Tota variació de punts es registra a `score_events` (auditable). La puntuació d'equip és la suma.

## 9. Model de dades (Supabase)

```
sessions        id, name, status(draft|lobby|running|paused|ended),
                started_at, paused_at, paused_total_ms, ended_at, created_at

teams           id, session_id, name, color, join_code(unique), created_at

players         id(=auth.uid), team_id, name, last_seen_at, created_at

team_stations   team_id, station_id(text), status(discovered|solved),
                discovered_at, solved_at, errors, game_state(jsonb)
                PK(team_id, station_id)

attempts        id, team_id, station_id, player_id, answer, correct, created_at

hints_used      id, team_id, station_id, level, given_by(player|master), created_at

team_evidences  team_id, evidence_id(text), source, created_at

accusations     team_id(PK), suspect_id, evidence_ids(text[]), correct, created_at

score_events    id, team_id, delta, reason, ref(jsonb), created_at

messages        id, session_id, team_id(null = tots), body, created_at

message_reads   message_id, player_id, read_at

passes          id, team_id, scanned_at, action, notes

events          id, session_id, team_id, type, payload(jsonb), created_at
```

Contingut estàtic (estacions, textos, solucions, sospitosos, evidències) al repo en JSON, no a la base de dades.

### RLS
- Jugadors: lectura només de files del seu equip i de la seva sessió
- Escriptura directa des del client: cap. Tot passa per route handlers amb service role després de validar
- Màster: via route handlers amb cookie de màster

## 10. Temps real

- Canal per equip `team:{team_id}`: canvis a `team_stations`, `team_evidences`, `score_events`, `messages`
- Canal de sessió `session:{session_id}`: estat de la sessió (inici, pausa, campana), rànquing, missatges a tots
- `game_state` compartit dins un joc: Realtime Broadcast per a canvis efímers (moviments), persistit a `team_stations.game_state` en punts clau
- Presence per saber quins jugadors estan connectats (sala d'espera i dashboard)
- En reconnectar, el client sempre recarrega l'estat complet del servidor

## 11. Seguretat i anti-trampes

- QR d'estació i QR d'acusació: URL amb token aleatori llarg (no l'id). Només vàlid amb sessió `running`
- Salconduit: cooldown per equip controlat al servidor (`passes.scanned_at`)
- QR d'equip: `join_code` aleatori curt
- Salconduit: JWT HS256 (`jose`) amb `team_id`, caducitat 60 s, es regenera cada 30 s al client via endpoint
- Rate limit a validació de respostes (ex: 1 intent cada 3 s per equip i estació)
- Cap solució ni id del traïdor al bundle del client (verificar amb build)

## 12. Jocs

Cada joc a `components/games/<StationId>Game.tsx`, registrat a `components/games/registry.ts`.

Interfície comuna:

```ts
type GameProps = {
  stationId: string
  content: PublicStationContent   // només dades públiques
  sharedState: unknown            // estat sincronitzat de l'equip
  setSharedState: (s: unknown) => void
  submit: (answer: unknown) => Promise<SubmitResult>
  solved: boolean
}
```

Si un joc es completa sol (puzle), crida `submit` en acabar i no mostra camp de resposta. La definició de cada joc és a `docs/jocs.md`.

## 13. Requisits no funcionals

- HTTPS (càmera iOS)
- Wake Lock API durant la partida
- Funciona a Safari iOS 16+ i Chrome Android recents
- Càrrega inicial < 3 s amb 4G
- Contrast WCAG AA com a mínim; text base ≥ 19px (vegeu secció 16)
- Domini: subdomini gratuït de Vercel (ex: `traidor-guixa.vercel.app`). Nom curt perquè el QR sigui simple
- Sons amb opció de silenci
- Dades personals: només nom. Botó màster per esborrar sessions antigues

## 14. Fases

| Fase | Abast | Criteri de fet |
|---|---|---|
| 0 | Setup Next + Supabase + Vercel, Tailwind, shadcn, estructura carpetes | Deploy buit funcionant a Vercel |
| 1 | Migracions, RLS, tipus, càrrega de contingut JSON | Taules creades, contingut accessible des del servidor |
| 2 | Màster: PIN, sessions, equips, QR imprimibles | Puc crear sessió i equips i imprimir QR |
| 3 | Jugador: entrada, nom, reconnexió, sala d'espera, presence | 3 mòbils al mateix equip es veuen en directe |
| 4 | Iniciar/pausar partida, hub, mapa, temps | Màster inicia i tots els mòbils canvien |
| 5 | Escàner, pantalla estació, validació resposta genèrica, punts | Resoldre una estació amb resposta de text i veure punts sincronitzats |
| 6 | Dashboard màster en directe, detall equip, missatges | El màster veu progrés i envia missatges |
| 7 | Pistes, quadern d'evidències | Pistes resten punts, evidències apareixen |
| 8 | Salconduit (jugador + escàner màster), −10, cooldown, desfer | Escaneig resta punts, respecta cooldown i es pot desfer |
| 9 | QR d'acusació, condicions, acusació, campana, pantalla final, rànquing | Partida completa de principi a fi |
| 10 | Jocs propis, un per un | Cada joc funciona i sincronitza |
| 11 | Poliment: wake lock, sons, errors, proves amb Android/iPhone | Prova de camp superada |

Les fases 5–9 fan servir un joc "placeholder" (només camp de resposta) perquè el flux complet funcioni abans dels jocs reals.

## 15. Pendents

- [ ] Ajustar valors de puntuació després de la primera prova de camp
- [ ] Verificar coordenades sobre el terreny

## 16. Estil visual

Estètica segle XVIII (barroc tardà, Il·lustració): pergamí envellit, tinta ferrogàl·lica, cuir, blau de Prússia, vermell de cotxinilla, or apagat. **Sense mode fosc**: es juga a l'exterior de dia.

### Paleta (tokens CSS a `app/globals.css`, exposats a Tailwind)

| Token | Nom | HEX | Ús |
|---|---|---|---|
| `--parchment` | Paper de fil | `#F4EBD9` | Fons principal |
| `--vellum` | Vitela clara | `#EAE0CA` | Targetes, panells, navegació inferior |
| `--ink` | Tinta ferrogàl·lica | `#2B2118` | Text principal |
| `--leather` | Cuir envellit | `#8C6D53` | Vores, separadors, ombres |
| `--prussian` | Blau de Prússia | `#1D3557` | Botons principals, enllaços, títols clau |
| `--cochineal` | Vermell de cotxinilla | `#7A1F26` | Errors, alertes, penalitzacions, Emissari |
| `--gold` | Pa d'or apagat | `#C99E32` | Ornaments, icones especials, anell de focus |

Regles:
- `--gold` **mai com a color de text** sobre pergamí (contrast insuficient). Només decoració, vores i focus
- `--leather` només per a text secundari gran (≥ 19px); per a text petit, `--ink`
- Estats d'estació al mapa i hub: no descoberta = `--leather`, descoberta = `--prussian`, resolta = `--gold` amb vora `--ink`. A més del color, icona diferent (no dependre només del color)
- Textura de paper opcional com a imatge de fons lleugera (< 50 KB), mai reflectant ni amb soroll que dificulti la lectura
- Mapa Leaflet amb filtre CSS sèpia suau sobre les tessel·les d'OSM per integrar-lo amb la paleta

### Tipografies (via `next/font/google`, només els pesos necessaris)

| Ús | Font |
|---|---|
| Títols i encapçalaments | Libre Caslon Display |
| Text de cos, narrativa, formularis | EB Garamond (400, 500, 600, cursiva 400) |
| Botons, navegació inferior, etiquetes curtes | Cinzel (600) |
| Opcional: cartes i missatges de l'Emissari | IM Fell English |

Regles:
- EB Garamond té ull petit: cos base **19–20px**, interlineat 1.5
- Narrativa i quadern: `font-variant-numeric: oldstyle-nums`
- Marcador, compte enrere i punts: `font-variant-numeric: lining-nums tabular-nums` (els números antics salten en un comptador)
- Cinzel només en textos curts (és tot majúscules)
- Màxim 3 famílies carregades a la vegada; IM Fell només si s'utilitza

### To de la interfície
- Textos de sistema en veu d'època quan no perjudiqui la claredat ("Escanejar" → "Examinar el senyal"; errors tècnics sempre clars i en llenguatge actual)
- Animacions sòbries: aparició tipus tinta, segells de lacre en resoldre una estació
