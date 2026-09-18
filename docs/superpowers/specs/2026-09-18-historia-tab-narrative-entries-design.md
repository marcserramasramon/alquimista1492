# Disseny del Sistema d'Entrades Narratives a la Pestanya Història

Data: 2026-09-18  
Estat: Aprovat

## 1. Context i Objectiu
A la barra inferior de navegació del Hub de joc (`BottomNav`), hi ha la pestanya **Història** (`IntroTab`), que recull la narrativa d'investigació que es va lliurant als jugadors a mesura que superen els enigmes de les diferents estacions de l'escape room exterior *El Traïdor de la Guixa*.

Aquest disseny estableix:
1. La inclusió de les **8 entrades narratives completes** del guió històric oficial.
2. La mecànica de bloqueig anònim per a les estacions que encara no s'han superat.
3. La visualització i desbloqueig dinàmic tant en la partida real (via Supabase Realtime) com en l'entorn de desenvolupament (`/preview`).

---

## 2. Model de Dades Narratives (`content/public/story.ts`)

Cada entrada narrativa segueix la interfície `StoryEntry`:
```typescript
export interface StoryEntry {
  id: string
  stationId?: string // Omet per a l'entrada inicial (sempre desbloquejada)
  eyebrow: string
  title: string
  icon: string
  paragraphs: string[]
}
```

### Relació de les 8 Entrades Oficials

1. **`intro` (Pròleg - Sempre desbloquejat)**
   * `stationId`: cap (sempre accessible)
   * `eyebrow`: *Nit del 16 de maig de 1705 · La Guixa*
   * `title`: *EL PACTE TRAÏT*
   * `icon`: 📖
   * Contingut: La malaltia de mossèn Ramon, la conspiració del pacte a Sant Sebastià, i la carta encarregada als joves del poble per trobar el delator abans que la carta arribi a Vic.

2. **`alerta-vigies` (Estació 1: Serrat de les Bruixes)**
   * `stationId`: `serrat-bruixes` (suporta àlies `serrat`, `serrat_bruixes`)
   * `eyebrow`: *Estació 1 · Serrat de les Bruixes*
   * `title`: *L'Alerta dels Vigies*
   * `icon`: 🔥
   * Contingut: Desxiframent de les fogueres dels vigies entre turons. Descobriment que el delator sap de lletra, descartant en Pere del Molí i en Joan el traginer. Xifra revelada: `FOC = 4`.

3. **`tinta-negra` (Estació 2: Font del Ferro)**
   * `stationId`: `font-ferro` (suporta àlies `font_ferro`)
   * `eyebrow`: *Estació 2 · Font del Ferro*
   * `title`: *L'Aigua que no Menteix*
   * `icon`: 💧
   * Contingut: Anàlisi de la tinta ferrosa de gales i càntirs collits a la font. Es descarta la Marianna de l'Hostal. Pista sobre els dos càntirs collits per l'escola. Xifra revelada: `AIGUA = 2`.

4. **`ronda-patrulla` (Estació 3: Planes Bones)**
   * `stationId`: `planes-bones` (suporta àlies `planes_bones`)
   * `eyebrow`: *Estació 3 · Planes Bones*
   * `title`: *La Ronda de la Patrulla*
   * `icon`: 🗺️
   * Contingut: Reconstrucció del recorregut nocturn dels soldats. L'Isidre el ferrer queda descartat perquè treballava a la farga a les onze. Pista clau del sergent: llum a l'escola a les 22:15. Xifra revelada: `TERRA = 3`.

5. **`signatura-difunt` (Estació 4: Cementiri)**
   * `stationId`: `cementiri`
   * `eyebrow`: *Estació 4 · Cementiri de la Guixa*
   * `title`: *La Signatura del Difunt*
   * `icon`: 🪦
   * Contingut: La carta és signada amb el nom d'un difunt d'una làpida (Josep Vilardell i Puig). Només qui té accés al registre de defuncions podia saber-ho. Les sospites recauen sobre l'Anton, l'escolà. Xifra revelada: `PEDRA = 1`.

6. **`gir-masset` (Estació 6: Pla de Masset / Acusació)**
   * `stationId`: `pla-masset` (suporta `pla-masset-accusation`, `pla-masset-control`)
   * `eyebrow`: *Acte II · Pla de Masset*
   * `title`: *El Gir: L'Engany Descobert*
   * `icon`: ⚖️
   * Contingut: L'Anton arriba corrents amb la coartada signada: ha passat la nit vetllant el rector ferit. Totes les proves del poble coincideixen: el traïdor és el mestre d'escola Bernat.

7. **`secret-rectoria` (Estació 8: Caixa de les Almoines)**
   * `stationId`: `caixa-almoines` (suporta `rectoria`, `rectoria-caixa`, `caixa_almoines`)
   * `eyebrow`: *Acte III · Caixa de les Almoines*
   * `title`: *El Secret de la Rectoria*
   * `icon`: 🗝️
   * Contingut: Obertura de la caixa de fusta amb la clau recuperada. Troballa de la carta original i la nota del capità de Vic: en Jaume, fill de Bernat, és presoner. Contrasenya obtinguda: *"L'alba ve de Vic"*.

8. **`sometent-campanar` (Estació 9: Campanar de Sant Sebastià)**
   * `stationId`: `sometent-campanar` (suporta `campanar`, `bells-sometent`, `bells_sometent`)
   * `eyebrow`: *Acte III · Campanar de Sant Sebastià*
   * `title`: *El Sometent i la Llibertat*
   * `icon`: 🔔
   * Contingut: L'Emissari és enganyat amb la carta falsa segellada. Obertura del mecanisme amb el codi dels quatre elements i toc general de sometent que avisa els conjurats de Sant Sebastià.

---

## 3. Comportament i Interfície (`IntroTab.tsx`)

### Resolució d'Àlies i Comprovació de Resolució
Per evitar problemes si a la base de dades o al codi s'utilitza una variant del nom d'estació (p. ex. `serrat` vs `serrat-bruixes`), la funció de comprovació normalitza l'ID usant el diccionari d'àlies de `content/public/stations.ts` o compara qualsevol coincidència amb les estacions superades (`s.solved === true`).

### Estats Visuals
1. **Capçalera:**
   * Títol "Història" i "Recull de Fets".
   * Indicador del tipus "X de 8 entrades desbloquejades" acompanyat d'una barra d'estil vintage que mostra el progrés de desbloqueig.
2. **Entrada Bloquejada (Anònima):**
   * Icona: 🔒
   * Títol: `Entrada bloquejada`
   * Subtítol: `Resol l’estació corresponent per desbloquejar-la`
   * Botó deshabilitat, estètica atenuada (`opacity-60 cursor-not-allowed bg-[#EAE0CA]/40`).
3. **Entrada Desbloquejada:**
   * Icona temàtica específica.
   * Títol del capítol i subtítol visible.
   * Clicable, obre la vista de lectura individual en format pergamí.

---

## 4. Integració amb les Pantalles
* **`app/preview/page.tsx`**:
  * Es passa la propietat `stations={PREVIEW_STATIONS}` al component `<IntroTab />` perquè pugui calcular l'estat de desbloqueig.
* **`app/(player)/joc/page.tsx`**:
  * Ja passa `stations={teamState.stations}`, garantint que en producció es sincronitza a l'instant en temps real per a tots els dispositius de l'equip.
