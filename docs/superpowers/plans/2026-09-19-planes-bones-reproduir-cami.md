# Nou Joc de Planes Bones (La Ruta del Ferrer i la Clau Perduda) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redissenyar l'Estació 3 (Planes Bones) perquè cada jugador rebi una declaració exclusiva d'un testimoni, reprodueixin el camí d'Isidre sobre un mapa hexagonal ampliat de 24 caselles amb camps i camins, dedueixin que la clau de la forja va caure a la pedra gran de Can Vinyals vora les nogueres, i validin la troballa mitjançant l'escaneig del QR físic o el codi de seguretat `CLAU-FORJA`.

**Architecture:** 
1. Mòdul de dades (`content/public/planesBonesData.ts`) amb els 4 testimonis distribuïts per `player_index`, la xarxa cartogràfica de 24 hexàgons (amb 9 nodes de camí i 15 de terreny/camps/alternatives) i la seqüència exacta de navegació.
2. Component de joc (`components/games/PlaneBonesGame.tsx`) interactiu en React/SVG que assigna el testimoni al jugador connectat, permet traçar el camí amb animació daurada, destaca la pedra gran de Can Vinyals en completar la ruta, i obre l'escàner de càmera (`@yudiel/react-qr-scanner`) amb camp de text de reserva (`CLAU-FORJA`).
3. Endpoint de validació (`app/api/game/validate-answer/route.ts`) preparat per acceptar les respostes de la clau.
4. Panell del Màster (`app/(master)/master/qr/page.tsx`) amb el nou cartell/QR imprimible per enganxar a la pedra física.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, `@yudiel/react-qr-scanner`, Supabase.

---

### Task 1: Crear el mòdul de dades i configuració del camí de Planes Bones

**Files:**
- Create: `content/public/planesBonesData.ts`

- [ ] **Step 1: Escriure el fitxer amb els testimonis, nodes hexagonals i definicions de ruta**
  - Definir `HEX_MAP_NODES`: 24 caselles hexagonals (9 de ruta + 15 de paisatge/camps/camins alternatius).
  - Definir `CORRECT_PATH_SEQUENCE`: `['malla', 'cruilla-vic', 'masia-el-blanc', 'pas-riera', 'masia-planes-bones', 'cami-nogueres', 'can-vinyals', 'pou-aigua', 'la-guixa']`.
  - Definir `WITNESS_CLUES`: Les 4 declaracions històriques amb icones i instruccions per a cada jugador.
  - Definir funcions auxiliars de validació de codi (`isValidClauCode`).

- [ ] **Step 2: Verificar la sintaxi i exportacions de TypeScript**
  - Executar: `npx tsc --noEmit` per assegurar que els tipus encaixen perfectament.

- [ ] **Step 3: Commit**
  - `git add content/public/planesBonesData.ts && git commit -m "feat(planes-bones): add data models, hex nodes, and witness clues"`

---

### Task 2: Actualitzar l'API de validació de resposta per a Planes Bones

**Files:**
- Modify: `app/api/game/validate-answer/route.ts`

- [ ] **Step 1: Afegir variants vàlides per a `planes-bones`**
  - Incloure `clau-forja`, `CLAU-FORJA`, `CLAU FORJA`, `can-vinyals`, `pedra-vinyals`, així com URLs `/s/clau-forja`.
  - Mantenir retrocompatibilitat amb intents anteriors si calgués.

- [ ] **Step 2: Comprovar el comportament amb un test manual o curl**
  - Verificar que la petició a `/api/game/validate-answer` per `planes-bones` amb `CLAU-FORJA` respon `{ correct: true }`.

- [ ] **Step 3: Commit**
  - `git add app/api/game/validate-answer/route.ts && git commit -m "feat(api): accept CLAU-FORJA solution for planes-bones"`

---

### Task 3: Redissenyar el Component de Joc `PlaneBonesGame.tsx`

**Files:**
- Modify: `components/games/PlaneBonesGame.tsx`

- [ ] **Step 1: Integrar la detecció del testimoni assignat al jugador**
  - Obtenir el `player_index` o nom del jugador des de la sessió / Supabase.
  - Mostrar una targeta destacada estil pergamí: *"El teu interrogatori exclusiu"* amb el testimoni assignat i la indicació de comunicar-se en veu alta amb els companys.
  - Afegir un selector/desplegable de socors per si cal canviar de testimoni manualment (ex: equips de menys persones o dispositiu que falla).

- [ ] **Step 2: Implementar el mapa hexagonal ampliat interactiu (24 caselles)**
  - Renderitzar les 24 caselles hexagonals amb les seves coordenades, icones medievals i tipus (camí, masia, camp, riera, bosc).
  - Estat del traçat: llista de nodes seleccionats en ordre.
  - Si el jugador toca el següent node correcte: es ressalta i es dibuixa la línia daurada de connexió.
  - Si toca un node incorrecte: feedback sonor/visual i botó per desfer l'últim pas o reiniciar.
  - En completar el node 7 (`can-vinyals`) o la ruta sencera: ressaltar amb un halo brillant la Pedra Gran de Can Vinyals i activar el bloc de cerca física.

- [ ] **Step 3: Integrar l'escàner de càmera i el camp de text de reserva**
  - Afegir modal o botó desplegable amb `@yudiel/react-qr-scanner` per escanejar el QR de la pedra.
  - Afegir camp de text per introduir manualment `CLAU-FORJA`.
  - Executar `props.submit()` amb la solució per sincronitzar Supabase.

- [ ] **Step 4: Pantalla d'èxit i revelació d'elements**
  - En validar: animació d'èxit, so `evidence-unlock`, targeta d'evidència *"La Clau Mestra de la Forja"*, descart d'Isidre i revelació de **🌍 TERRA = 3**.

- [ ] **Step 5: Provar el component a la pàgina de preview `/preview`**
  - Obrir el navegador a `http://localhost:3000/preview` i provar la pestanya de Planes Bones: seleccionar nodes del mapa, provar la validació de `CLAU-FORJA` i comprovar l'estat d'èxit.

- [ ] **Step 6: Commit**
  - `git add components/games/PlaneBonesGame.tsx && git commit -m "feat(planes-bones): implement interactive map, witness cards, and QR/manual key validation"`

---

### Task 4: Afegir el QR Físic de la Clau al Panell del Màster

**Files:**
- Modify: `app/(master)/master/qr/page.tsx`
- Modify: `scripts/generate-qrs.js`

- [ ] **Step 1: Afegir la targeta física de la Pedra de Can Vinyals**
  - Incloure el nou QR `clau-forja` a la llista d'elements imprimibles del màster (`STATIONS_METADATA`).
  - Mostrar el títol: *«Objecte Perdut: La Clau de la Forja»*, ubicació: *«Entrecreuament Can Vinyals, sota les nogueres (Pedra Gran)»* i codi manual de reserva: `CLAU-FORJA`.

- [ ] **Step 2: Verificar la generació i impressió del codi QR**
  - Comprovar que a `/master/qr` apareix la targeta amb el codi QR generat i els botons de descàrrega/impressió.

- [ ] **Step 3: Commit**
  - `git add app/(master)/master/qr/page.tsx scripts/generate-qrs.js && git commit -m "feat(master): add printable QR card for Can Vinyals lost key"`

---

### Task 5: Verificació Integral de l'Experiència

- [ ] **Step 1: Prova de flux complet**
  - 1. Connectar-se com a jugador o anar a `/preview`.
  - 2. Comprovar que es veu el testimoni assignat.
  - 3. Traçar la ruta al mapa: Malla ➔ Cruïlla Vic ➔ Masia El Blanc ➔ Pas de la Riera ➔ Masia Planes Bones ➔ Camí Nogueres ➔ Can Vinyals ➔ Pou d'Aigua ➔ La Guixa.
  - 4. Comprovar que Can Vinyals s'il·lumina i indica la troballa a la pedra gran.
  - 5. Introduir `CLAU-FORJA` al camp de text o escanejar.
  - 6. Comprovar que s'activa l'èxit, l'evidència i la xifra TERRA = 3.
- [ ] **Step 2: Commit final de neteja**
