# El Traïdor de la Guixa — Canvis a la Webapp (Redisseny)

> **Estat:** ESBORRANY DE TREBALL. Document tècnic: què cal canviar/construir a la implementació actual per suportar `docs/historia-nova.md` i `docs/fites-nova.md`.
>
> No implementis res d'aquest document fins que `historia-nova.md` i `fites-nova.md` estiguin tancats — molts detalls (codi final de N xifres, mecànica d'ÀNIMA, si sobreviu l'acusació) depenen de decisions encara pendents allà.

---

## 1. Sistema de pistes genèric (3 nivells, cost 0/−2/−5)

**Ja dissenyat a la base de dades, no implementat a l'app.** Verificat el 2026-09-21:
- `solutions_private.hints` (JSONB `{level_1, level_2, level_3}`) — existeix, ja té contingut sembrat per als jocs actuals.
- Taula `hints_used` (team_id, hint_id) — existeix, pensada per no cobrar dues vegades la mateixa pista.
- `score_events` — existeix, pot registrar la penalització.
- **NO existeix:** cap ruta API per demanar una pista, ni cap component que mostri el flux "confirmació → pista revelada" descrit a `docs/pantalles-i-mecaniques-compartides.md`.

**A construir:**
- `app/api/game/hint/route.ts`: rep `stationId` + `level`, valida equip actiu, comprova a `hints_used` si ja s'ha pagat aquest nivell (si sí, retorna el text sense tornar a cobrar), si no resta punts via `score_events` i insereix a `hints_used`, retorna el text del nivell demanat.
- `lib/hints/useHints.ts`: hook client que crida la ruta, gestiona l'estat de confirmació.
- `components/player/HintPanel.tsx`: UI compartida (botó `[PISTA (−X)]` → confirmació → text), seguint el layout ja especificat a `docs/pantalles-i-mecaniques-compartides.md`.
- Ampliar `GameProps` (`components/gameTypes/index.ts`) amb el que calgui perquè els jocs puguin muntar el `HintPanel` (probablement només cal `stationId`, que ja hi és).

**Abast d'aquesta fase:** connectar-ho només al joc d'AIGUA (Font del Ferro) primer. Els altres jocs (existents i els 4 elements nous) l'adopten després sense refer la infraestructura.

---

## 2. Patró genèric "joc de revelació" (Aigua/Terra/Foc/Aire)

Les 4 fites elementals comparteixen la mateixa forma: text/poema + instrucció del truc físic + input d'un número + 3 pistes. Val la pena un component compartit en lloc de 4-5 còpies gairebé idèntiques (com passava amb el `FontFerroGame.tsx` actual, que és molt més gran del que caldria per aquest nou disseny).

**Proposta:**
- Un sol component `components/games/RevealGame.tsx` (nom provisional), parametritzat per estació via `content/public/stations.ts` (poema, imatge, text ambientació) + resposta validada al servidor (com ja fan la resta de jocs, via `props.submit`).
- `registry.ts` mapeja cada estació elemental (`font-ferro`, i les noves de terra/foc/aire) a aquest mateix component.
- ÀNIMA probablement necessita component propi (mecànica diferent — mirall o cambra, no "escriu un número").

**No dissenyar els camps exactes fins que `fites-nova.md` estigui tancat** (falta saber, per exemple, si totes demanen un dígit o alguna demana text).

---

## 2bis. Estat del disseny d'app per element — què falta (Terra/Foc/Aire/Ànima)

> Això és disseny tècnic/UI, no trama: **no hi ha cap poema, resposta ni pista escrits aquí** — segueixen pendents a `docs/fites-nova.md`, que es tanca en un altre xat. El que segueix és què li falta a l'app per poder acollir cada element un cop aquell document es tanqui.

### 🪨 TERRA
- Encaixa sencer al patró genèric `RevealGame` (§2): text/poema + truc físic (cola blanca + fang) + input d'un dígit + 3 pistes. **Res a dissenyar de nou a l'app.**
- Únic detall UI a considerar: l'avís de logística/seguretat de `fites-nova.md` ("risc de tacar roba") — decidir si es mostra com a text simple dins la pantalla d'introducció de l'estació (Pantalla 0, §`pantalles-i-mecaniques-compartides.md`) o no cal res especial. No bloqueja.

### 🔥 FOC
- També encaixa a `RevealGame` pel que fa a l'input/validació — **però `fites-nova.md` el marca com a CRÍTIC de seguretat** (flama oberta + paper, supervisió obligatòria). Això sí que és un forat de disseny d'app real: ara mateix cap pantalla genèrica cobreix "avís de seguretat obligatori abans de fer l'acció física".
- **Proposta nova:** una pantalla genèrica reutilitzable "Avís de seguretat" (afegir a `docs/pantalles-i-mecaniques-compartides.md` quan es tanqui): apareix un cop, abans de mostrar l'input de resposta, amb el text d'instruccions + una confirmació explícita ("He llegit les instruccions i hi ha un adult supervisant" o similar) abans de deixar continuar. Pensada per FOC ara, però reutilitzable si algun altre repte físic futur ho necessita.
- **PENDENT (trama/operativa, no jo):** si l'acció la fan els jugadors sota supervisió o la fa un monitor/màster i els jugadors només validen el resultat a l'app — canvia si cal aquesta pantalla o no.

### 🌬️ AIRE
- Encaixa al patró genèric. Únic matís: `fites-nova.md` diu que el baf es dissipa ràpid i "potser cal poder repetir l'acció diverses vegades" — **això és físic, no afecta l'app**: el rate limit d'intents ja existent (§ `pantalles-i-mecaniques-compartides.md`, "màx 1 intent cada 3 segons") és sobre l'**enviament de la resposta**, no sobre l'acció física de bufar, així que no cal tocar-lo ni flexibilitzar-lo. **Res a dissenyar de nou.**

### ✨ ÀNIMA
- És l'únic que **no** encaixa al patró genèric — depèn de quina de les dues opcions triï `fites-nova.md`:
  - **Opció A (mirall/escriptura especular):** és físic, com els altres 4 — encaixaria igualment a `RevealGame` (llegir un text reflectit i escriure la resposta). Sense impacte addicional a l'app.
  - **Opció B (mirar a través del mòbil):** té impacte real a l'app, cal dissenyar-ho abans de picar codi:
    - Accés a càmera des del navegador. Ja hi ha precedent al projecte (`@yudiel/react-qr-scanner`, aprovat al PRD, ja usat per escanejar QR), així que **no caldria cap dependència nova** per obtenir un `<video>` de la càmera — reutilitzar el mateix patró d'accés/permisos.
    - **No es proposa AR real** (tracking de marcadors/superfície) — seria una dependència nova no justificada per l'abast d'aquest joc. Versió mínima viable: previsualització de càmera en directe + una imatge/overlay fix posicionat per CSS a sobre (efecte "mira a través i apareix un missatge superposat"), sense seguiment real de moviment. Si es vol AR real caldria justificar-ho explícitament (regla del CLAUDE.md de no afegir dependències sense dir-ho).
    - Necessitaria component propi `components/games/AnimaCameraGame.tsx` (no `RevealGame`), i gestió pròpia de permisos de càmera (denegació → fallback, mateix criteri que la geolocalització a §7ter: mai bloquejant si es pot evitar).
- **PENDENT (trama, no jo):** quina opció (A o B) es tria — decisiu per saber si cal construir res nou o Ànima s'afegeix gratis a `RevealGame`.

---

## 3. Base de dades

- Migració nova a `supabase/migrations/` (mai editar les existents) per:
  - Actualitzar `solutions_private` de `font-ferro`: treure `day`/`suspects_dismissed`/`waterskinCount`, afegir `digit` (o el que calgui) + `hints` amb els 3 nivells nous.
  - Afegir files noves a `solutions_private` per a les estacions terra/foc/aire/ànima quan es defineixin (`fites-nova.md`).
  - Si el codi final passa a 5 xifres: revisar `pla-masset-control`, `rectoria-caixa` i `campanar-sometent` (ara mateix totes esperen `"4231"` / `"4-2-3-1"`).
- **No tocar** encara `accusacio` ni res lligat a l'acusació d'Anton/Bernat — depèn de `historia-nova.md`.

---

## 4. Codi de validació (`app/api/game/validate-answer/route.ts`)

- Treure la lògica específica de Font del Ferro basada en dies (`stationType.includes('font')` amb `expDay`, línies ~160-168 actuals) i substituir-la per validació genèrica de dígit/xifra (igual que la resta d'estacions ja fan amb `normExpected`).
- `STATION_EVIDENCE` i `CANONICAL_STATION_IDS` (línies ~29-68) necessiten entrades noves per a les estacions terra/foc/aire/ànima quan tinguin ID definitiu.
- Els camps `evidence` lligats a "cantirs"/"ink" per Font del Ferro probablement ja no tenen sentit si es treu la narrativa de sospitosos — revisar juntament amb `evidencies.md`.

---

## 5. Contingut públic vs privat

- Poemes: **contingut públic** (narrativa que es pot ensenyar al jugador) → `content/public/stations.ts` o un fitxer nou `content/public/poemes.ts`.
- Número/resposta esperada + pistes: **privat**, mai al client → `content/private/game-solutions.ts` i/o directament a `solutions_private` (BD). Actualment `game-solutions.ts` és una còpia hardcoded paral·lela a la BD — confirmar si el disseny final vol mantenir aquesta duplicació o consolidar-ho tot a BD.

---

## 6bis. Confirmat des de `historia-nova.md` (2026-09-21): sense app per a les interaccions amb l'antagonista

L'Inquisidor/Alquimista disfressat (personatge del màster) **no té cap component d'app durant l'Acte I** — ni ruta, ni component, ni registre d'estat. Els vigila i els adverteix en viu (interpretació pura, sense digitalitzar-ho). Això confirma que **no cal reconstruir res equivalent a l'antiga estació "Pla de Masset — control"** (`docs/fitxes-estacions/estacio-05-pla-masset-control.md`, ja obsoleta): aquell disseny antic sí validava l'aturada/interrogatori des de l'app; el nou disseny no ho fa. Només el ritual final del Gresol (Pla de Masset) necessita validació d'app (el codi que en resulta) — veure `docs/fites-nova.md` § Estació central.

## 6. Coses NO tocades en aquesta fase (esperen `historia-nova.md`)

- `components/games/AccusationGame.tsx`
- `docs/evidencies.md`
- `app/api/game/dismiss-suspect/route.ts`
- Fitxes de sospitosos (`docs/fitxes-personatges/*.md`)

---

## 7bis. Flux i disseny de pantalles (redisseny del HUB)

> Origen: conversa del 2026-09-21. Substitueix conceptualment `docs/interficie.md`, que descriu el hub antic (5 botons: Mapa/Quadern/**Escaneja**/Història/Salvos) — desactualitzat en els punts que xoquen amb aquest apartat. La resta de `interficie.md` (colors, tipografia, mides, patró de pantalla d'estació) es manté vàlida.
>
> Confirmat en aquesta conversa: la comunicació amb el personatge que volta físicament pel poble és **sempre amb el mateix personatge** (independentment de com acabi tancant-se `historia-nova.md`), via **xat en directe** des de la webapp.

### 7bis.1 Flux d'entrada

**1. ENTRADA — Escanejar codi QR**
Ja implementat: el cartell físic de l'equip porta un QR que codifica `{NEXT_PUBLIC_APP_URL}/e/[code]` (codi de 6 caràcters). No hi ha escàner dins l'app per a aquest pas — s'escaneja amb la càmera nativa del mòbil, que obre l'URL directament (`app/(player)/e/[code]/page.tsx`).

**2. POSAR NOM**
Ja implementat (`components/player/PlayerNameInput.tsx` + `lib/player/useSignIn.ts`): input de 2–30 caràcters, validat a client i servidor. En confirmar, crea sessió d'Auth anònima de Supabase i associa el jugador a l'equip del codi. Cada membre de l'equip pot entrar amb el seu propi mòbil i nom (multi-dispositiu per equip, no 1 sol mòbil — confirma la regla 5 del CLAUDE.md: tots els mòbils d'un equip veuen el mateix estat via Realtime).

Un cop dins → redirigeix al HUB.

⚠️ Nota: la carpeta `v2/` (fora d'abast, veure §7) assumeix "1 sol mòbil per equip" — **contradiu** aquest flux multi-dispositiu ja implementat a l'app actual. Un altre motiu per resoldre el destí de `v2/` (checklist).

### 7bis.2 HUB — 3 pestanyes (MAPA+FITES fusionades, sense botó central d'escaneig)

Els QR d'estació **tampoc** s'escanegen amb un escàner intern: cada cartell d'estació porta un QR que apunta a `{APP_URL}/s/[token]` i obre directament el joc d'aquella estació (`app/(player)/s/[token]/`). Per això el hub ja no necessita el botó central 🔍/🎮 d'`interficie.md` — es treu de la barra inferior.

**Decidit (2026-09-21):** MAPA i FITES **no són pestanyes separades** — són una sola pantalla. Les fites es mostren com una graella de botons sota el mapa, reutilitzant el patró que `StaticMap.tsx` ja té avui a "Estacions del joc a sota" (línies 460–483) i la llegenda de colors de sobre el mapa. El hub queda, doncs, en **3 pestanyes**:

```
┌─────────────────────────────────────┐
│  EL TRAÏDOR DE LA GUIXA             │
│  ⏰ 01:23:45                        │
├─────────────────────────────────────┤
│                                     │
│  [contingut de la pestanya activa]  │
│                                     │
├─────────────────────────────────────┤
│      📍       │   📖    │   💬     │
│  MAPA·FITES   │ HISTÒR. │   XAT    │
└─────────────────────────────────────┘
```

| Pestanya | Substitueix | Contingut |
|---|---|---|
| **MAPA** (amb "La Gran Obra" integrada) | Mapa + Quadern (sospitosos) fusionats | ⚠️ Correcció respecte a una versió anterior d'aquest document: el mapa **no** fa servir Leaflet (no està ni instal·lat — `package.json` no en té). La implementació real és `components/player/StaticMap.tsx`: SVG propi amb la imatge il·lustrada `/map-test.webp`, conversió `latLonToSVG(lat, lon)` sobre uns bounds fixos, i pan/zoom clampat (commit `d3f9359`). A sobre: llegenda de colors (ja existent). Al mig: el mapa amb les 5 fites elementals com a pins — clicar un pin ja descobert/resolt mostra info. A sota, en lloc de la graella plana de botons actual: **"La Gran Obra"**, veure §7bis.2bis. **No hi ha llista de sospitosos** (regla 1 de `historia-nova.md`). Les estacions es descobreixen escanejant el QR físic, no des del mapa. També hi pinta la posició en viu del personatge i (si escau) la pròpia — veure §7ter. |
| **HISTÒRIA** | Història (igual) | Es manté igual que `interficie.md`: missatge inicial + fragments narratius que es desbloquegen per estació, scroll, no interactiu. |
| **XAT** (nom provisional) | Salvos (es treu) | Xat en directe amb el personatge, veure §7bis.3. Substitueix la pestanya SALVOS — pendent confirmar a `historia-nova.md` si la mecànica de salconduits/control se salva d'alguna altra forma; si es manté, necessitarà una pestanya pròpia o integrar-se dins XAT. |

⚠️ Impacte a §7ter (geolocalització): les referències a "la pestanya MAPA" de l'equip continuen sent vàlides tal qual — el marcador del personatge i la posició pròpia es pinten sobre el mateix `StaticMap` combinat.

### 7bis.2bis "La Gran Obra" — visualització de les fites (substitueix el Quadern)

> Decidit en aquesta conversa (2026-09-21). El "Quadern" desapareix del tot com a concepte (era la llista de sospitosos/evidències de l'antic `interficie.md`); el que en queda **no és una llista**, és una peça visual pròpia amb nom narratiu: **"La Gran Obra"**.

**Mecànica:**
- Es mostren les **5 fites elementals** (AIGUA/TERRA/FOC/AIRE/ÀNIMA) com a **nodes** disposats en pentàgon — reutilitzant els angles ja calculats a `docs/fites-nova.md` § Geometria del pentagrama (FOC 63°, AIGUA 125°, AIRE 208°, ÀNIMA 281°, TERRA 350° respecte al centroide). És un diagrama esquemàtic (no cal que coincideixi amb el mapa real), però conservant els mateixos angles perquè la forma final "sigui" literalment la mateixa que dibuixen les 5 ubicacions físiques.
- Estat de cada node: buit/apagat (bloquejada), contorn visible (descoberta), **xifra revelada dins el node** (resolta).
- **A mesura que es resolen fites, es van dibuixant línies** que uneixen els nodes ja resolts (efecte de "dibuix que es va completant", no apareix tot de cop).
- **Quan les 5 estan resoltes:** el diagrama es completa com un **pentàgon regular amb les diagonals traçades → es llegeix un pentagrama** (mateix efecte que descriu `fites-nova.md`: el pentàgon net + diagonals = pentagrama).
- **Al moment de completar-se:** apareix un **OROBOROS** (serp que es mossega la cua) al centre/centroide del diagrama — element visual de tancament, no interactiu (o interactiu per obrir alguna pantalla de resum/celebració, a decidir).

**Relació amb `docs/fites-nova.md`:** aquesta conversa **respon parcialment** una de les preguntes PENDENT d'aquell document ("es dona als jugadors un mapa en blanc... o se'ls diu explícitament que busquen un pentagrama?") — es mostra explícitament i es construeix progressivament a la vista, no és una troballa amagada. La pregunta de **si té significat dins la ficció** (qui el va traçar, per què) segueix oberta i **no es decideix aquí** — és trama, no disseny d'interfície; cal tancar-ho a `historia-nova.md`/`fites-nova.md` en el seu propi xat. El nom "La Gran Obra" (terme alquímic, la *Magnum Opus*) hi encaixa bé si finalment es dona significat in-fiction, però és una decisió de UI/naming, no fixa la trama.

**Implementació (esborrany, no picar codi encara):**
- Nou component `components/player/GranObra.tsx` (nom provisional), rebent les mateixes dades que ja arriben a `StaticMap` (`TeamStationRow[]` — mateix `getTeamStation` helper), no cal cap font de dades nova.
- SVG propi (mateix estil que `StaticMap.tsx`): 5 punts fixos calculats a partir dels angles de `fites-nova.md`, línies `<line>` entre nodes consecutius que ja estan resolts, `<image>` o `<path>` de l'oroborus centrat quan `resolts.length === 5`.
- Assets a preparar: **il·lustració/icona de l'oroborus** (no existeix encara al projecte) — content nou a `content/public/` o `/public/`.
- Tocar-hi obre la mateixa `StationModal` que ja usen els pins del mapa (reutilitzar, no duplicar).

### 7bis.3 Pestanya XAT — interacció amb el personatge

**Mecànica (confirmada en aquesta conversa):** xat de missatges de text en directe, un sol fil per equip, sempre amb el mateix personatge (interpretat pel màster des del seu mòbil — regla ja establerta al CLAUDE.md: "El màster fa alhora d'actor... i controla la partida des del mòbil"). No és un xat lliure obert (el màster no interpreta diversos personatges des d'aquí); és el canal fix d'aquell personatge amb l'equip.

```
┌─────────────────────────────────┐
│ ⏰ 01:23:45                      │
├─────────────────────────────────┤
│      💬 [NOM PERSONATGE]         │
│                                  │
│  ┌────────────────────────┐     │
│  │ "Vigileu, algú ronda    │     │
│  │  pel carrer del Call."  │     │  ← missatge del personatge
│  └────────────────────────┘     │
│                                  │
│         ┌──────────────────┐    │
│         │ D'acord, gràcies │    │  ← missatge de l'equip
│         └──────────────────┘    │
│                                  │
├──────────────────────────────────│
│ [Escriu un missatge...]  [➤]    │
└─────────────────────────────────┘
```

- **Servidor com a autoritat:** els missatges de l'equip s'envien via ruta API (p.ex. `app/api/xat/enviar/route.ts`), mai directament a Supabase des del client (regla del CLAUDE.md sobre `lib/realtime`). El màster respon des d'un panell nou a `(master)/master` (llista d'equips amb missatges no llegits → obrir fil → respondre).
- **Temps real:** tots els mòbils de l'equip veuen el mateix fil (Supabase Realtime, mateix patró que `lib/realtime/useTeamState.ts`).
- **Model de dades (esborrany, NO crear migració encara):** taula `character_messages` (`id`, `team_id`, `sender` — `'team' | 'character'`, `body`, `created_at`), RLS: equip només llegeix/insereix (`sender='team'`) els seus propis missatges; el màster escriu (`sender='character'`) via service role. Nom de taula/camps en anglès (regla 3 del CLAUDE.md) encara que la UI sigui en català.

⚠️ **PENDENT — no inventar aquí:**
- Nom i veu del personatge (probablement l'Emissari, a confirmar quan es tanqui `historia-nova.md` — la conversa d'avui no ho ha fixat explícitament, només que "és sempre el mateix").
- Si el xat és lliure en tot moment o es desbloqueja/tanca en certs actes (p.ex. silenci forçat durant l'Acte II).
- Si el màster pot enviar missatges "pregravats" (plantilles ràpides) a més de text lliure, per poder atendre diversos equips alhora sense escriure-ho tot a mà.
- Notificació al jugador quan arriba un missatge nou estant en una altra pestanya (badge a l'icona 💬? so amb `howler`, ja aprovat al PRD?).
- Si cal conservar alguna versió de "salconduits"/control físic (Acte II) i com convivir amb aquesta pestanya.

---

## 7ter. Geolocalització: el màster veu els equips, els equips veuen el personatge

> Origen: conversa del 2026-09-21 (continuació de §7bis). Dues direccions independents del mateix mecanisme:
> 1. El **màster** veu la posició de **tots els equips** en un mapa al seu dashboard.
> 2. Cada **equip** veu la posició del **personatge** (interpretat pel màster, sempre el mateix — §7bis.3) a la seva pestanya MAPA.
>
> Els equips **no** es veuen entre ells — només el màster té visió de conjunt.

### 7ter.1 Tecnologia

No cal cap llibreria nova: `navigator.geolocation` (API nativa del navegador). Es reutilitza el `StaticMap` existent (§7bis.2) i la seva funció `latLonToSVG` per pintar-hi punts en viu — les fites ja fan servir exactament aquesta conversió, així que un marcador de posició és el mateix patró amb coordenades que canvien.

- Client: `watchPosition` (o `getCurrentPosition` en interval) — **throttle obligatori** (p.ex. cada 10–15 s o llindar de moviment ~10 m) per bateria i per no saturar Realtime.
- Enviament: sempre via ruta API pròpia, mai directe a Supabase des del client (regla ja establerta al CLAUDE.md i reforçada a §7bis.3).
- Difusió: Supabase Realtime, mateix patró que `lib/realtime/useTeamState.ts` / `game_config`.
- El servidor és l'única font de veritat de "on és cadascú ara mateix" (regla 2 del CLAUDE.md) — el client només mostra el que rep.

### 7ter.2 Posició dels equips (per al màster)

- **Model de dades (esborrany, NO crear migració encara):** columnes noves a `teams`: `last_lat`, `last_lng`, `last_location_at` (numeric/timestamptz). Només última posició — no cal historial/traça per l'abast d'aquesta fase.
- Client: `app/api/game/location/route.ts` (POST) — valida sessió del jugador, resol el seu `team_id` al servidor (mai confiar en un `team_id` enviat pel client), aplica throttle també al servidor, actualitza les 3 columnes.
- **RLS:** cap policy de lectura pública sobre aquestes columnes — ni un equip ha de poder llegir la posició d'un altre equip (ni la seva pròpia via client directe, ja que tot passa per API). El màster hi accedeix via ruta pròpia amb service role (p.ex. `app/api/master/equips-mapa/route.ts`) + subscripció Realtime autenticada de màster.
- Dashboard del màster: vista de mapa nova (probablement reutilitzant `StaticMap` en mode "màster", o un component nou `components/master/EquipsMap.tsx`) amb un pin per equip (color per equip, ja existeix `teams.color`), actualització en viu, i el cercle de precisió GPS (`accuracy`) quan sigui rellevant.

### 7ter.3 Posició del personatge (per als equips)

- **Model de dades:** taula singleton `character_location`, mateix patró que `game_config` (§ ja existent al schema): `id=1`, `lat`, `lng`, `sharing boolean not null default false`, `updated_at`. RLS: `USING (true)` en lectura per a tothom (com `game_config`), escriptura només service role.
- **Configuració (nova, a `game_config`):** `location_interval_minutes integer` (interval d'enviament, editable pel màster) i `location_consent_message text` (missatge de consentiment mostrat als jugadors, editable pel màster, amb frase predefinida per defecte) — veure §7ter.4.
- El màster té un interruptor "Comparteixo la meva ubicació" al seu dashboard/mòbil (`sharing`). Quan és actiu, el seu propi mòbil envia posició cada X segons a `app/api/master/location/route.ts`; quan l'apaga, els equips deixen de veure el marcador (no cal esborrar la fila, només no renderitzar-lo o marcar-lo "desconegut").
- A la pestanya MAPA de l'equip (`StaticMap`): un marcador diferenciat (icona pròpia del personatge, no una fita) es pinta a `latLonToSVG(character_location.lat, character_location.lng)`, actualitzat en viu via Realtime.
- Si la posició cau fora dels bounds del mapa il·lustrat (`boundMinLon/Lat`–`boundMaxLon/Lat` a `StaticMap.tsx`): **decidit** — no s'espera que passi a la pràctica (el recorregut del personatge es manté dins el poble), així que el marcador simplement **reté l'última posició coneguda dins els bounds** en lloc de desaparèixer o clampar-se a la vora amb una fletxa. No cal lògica especial de "fora de mapa".

### 7ter.4 Privacitat i UX

- **Freqüència d'enviament — decidit:** configurable pel màster, no fixa al codi. Nou camp a la configuració del màster: **minuts entre enviaments** (input numèric), es desa a `game_config` (mateix singleton que ja controla `duration_minutes` — s'hi afegeix `location_interval_minutes`). El client (equip i personatge) llegeix aquest valor per fixar l'interval del seu `watchPosition`/enviament, en lloc d'un número fix al codi.
- **Missatge de consentiment — decidit:** camp de text **editable pel màster** a la mateixa pantalla de configuració (`game_config.location_consent_message` o similar), amb una **frase predefinida** de partida perquè el màster no l'hagi d'escriure de zero. Es mostra abans de demanar permís de geolocalització al navegador (a "Posar nom" o en entrar per primer cop a MAPA — mantenim aquest punt com a detall d'implementació menor, no bloqueja el disseny).
- **Consentiment (comportament):** si el jugador denega el permís del navegador, el joc continua funcionant igual — la ubicació és una capa opcional, mai bloquejant cap mecànica de joc.
- **Posició fora del mapa:** veure §7ter.3 — reté l'última posició coneguda, no calen fletxes ni clamps.
- **Retenció:** esborrar/buidar `last_lat`/`last_lng` quan `teams.status` passa a `'final'`? Encara **PENDENT**.
- **Qui pot aturar de compartir:** el màster té el toggle `sharing` de §7ter.3 per al personatge. Els jugadors no tenen manera d'aturar-ho des de la UI (més enllà de revocar el permís del navegador) — encara **PENDENT** confirmar si cal.

### Checklist (afegit a §7ter)

- [x] Freqüència d'enviament de posició — configurable pel màster en minuts (`game_config.location_interval_minutes`)
- [x] Text de consentiment de geolocalització — camp editable pel màster amb frase predefinida (`game_config.location_consent_message`)
- [x] Comportament del marcador quan la posició cauria fora dels bounds del mapa — reté l'última posició coneguda (no s'espera que passi)
- [ ] Escriure la frase predefinida per defecte de `location_consent_message`
- [ ] Decidir política de retenció de `last_lat`/`last_lng` un cop acabada la partida
- [ ] Decidir si el jugador pot aturar de compartir la seva pròpia ubicació des de la UI
- [ ] Dissenyar `components/master/EquipsMap.tsx` (o variant de `StaticMap`) per a la vista del màster
- [ ] Afegir el camp de minuts + missatge a la pantalla de configuració del màster (probablement la mateixa on ja tria `duration_minutes` per iniciar la partida)

---

## 7. Nota fora d'abast (trobada durant l'exploració, no urgent)

Hi ha una carpeta `v2/` a l'arrel del repo (Next.js complet, propi `node_modules`, rutes en català diferents: `app/e/[codi]`, `app/joc`, `app/s/[estacioId]`...). **No està trackejada a git** (`git status` la marca com `??`). No l'he tocada ni l'he feta servir de referència. Si és rellevant (una reescriptura anterior, un experiment) digues-ho abans que algú la esborri per error netejant el repo; si no, val la pena esborrar-la o afegir-la a `.gitignore` perquè no aparegui com a canvi pendent.

---

## Checklist abans de tancar aquest document

- [ ] Confirmar disseny final de `fites-nova.md` (estructura de dades per estació)
- [ ] Confirmar si `historia-nova.md` manté cap mecànica d'acusació (afecta si cal tocar `AccusationGame.tsx`)
- [ ] Decidir consolidació `game-solutions.ts` vs BD (evitar mantenir dues fonts de veritat)
- [ ] Resoldre la carpeta `v2/` (mantenir, documentar el seu propòsit, o esborrar) — també xoca amb el flux multi-dispositiu de §7bis.1
- [ ] Confirmar nom/identitat del personatge del XAT (§7bis.3) i si es manté algun equivalent de "salconduits"
- [ ] Decidir si el xat es bloqueja/desbloqueja per actes
- [ ] Un cop tancat: actualitzar `docs/interficie.md` perquè reflecteixi el hub de 3 pestanyes (MAPA+FITES fusionades) (o marcar-lo obsolet i fusionar-lo aquí)
- [ ] Construir "La Gran Obra" (§7bis.2bis): component `GranObra.tsx`, nodes en pentàgon, línies progressives, oroborus al completar-se
- [ ] Encarregar/crear l'asset visual de l'oroborus
- [ ] Tancar a `historia-nova.md`/`fites-nova.md` si el pentagrama té significat in-fiction (qui el va traçar, per què) — NO decidit aquí, només la seva presentació visual
- [ ] Confirmar operativa de FOC (jugadors supervisats vs. ho fa un monitor) per saber si cal la pantalla "Avís de seguretat" (§2bis)
- [ ] Decidir opció d'ÀNIMA (mirall vs. càmera/mòbil) — determina si cal `AnimaCameraGame.tsx` o s'integra a `RevealGame` (§2bis)
