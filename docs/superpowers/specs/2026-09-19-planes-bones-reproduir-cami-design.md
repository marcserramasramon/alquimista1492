# Especificació de Disseny: Nou Joc de Planes Bones (La Ruta del Ferrer i la Clau Perduda)

**Data:** 2026-09-19  
**Estació:** Estació 3 · Planes Bones  
**Recompensa d'Element:** 🌍 TERRA = 3  
**Sospitós Descartat:** Isidre el Ferrer  
**Codi de Reserva Físic:** `CLAU-FORJA`  

---

## 1. Visió General i Objectiu
Aquesta especificació defineix el redisseny complet del joc de l'**Estació 3 (Planes Bones)**.  
L'objectiu és convertir l'estació en una experiència fortament cooperativa i física:
1. Els jugadors reben testimonis fragmentats en exclusiva al seu telèfon mòbil (com si cadascun hagués interrogat un habitant diferent de la zona).
2. Combinant la informació verbalment, han de **reproduir sobre un mapa hexagonal interactiu ampliat** el recorregut exacte que va fer Isidre el ferrer la nit dels fets.
3. En deduir la ruta, descobreixen el lloc exacte on el ferrer va perdre la clau de la forja: **la pedra gran que marca el camí a l'entrecreuament amb Can Vinyals, al costat de les nogueres**.
4. Els jugadors es desplacen físicament al punt indicat, localitzen la pedra i validen la troballa mitjançant l'escaneig del **QR físic** o introduint el codi de seguretat imprès a sota: **`CLAU-FORJA`**.

---

## 2. Narrativa Històrica i Itinerari
### L'Itinerari d'Isidre
Isidre el ferrer tornava al capvespre del poble de **Malla** en direcció a **La Guixa** pel camí vell de Planes Bones, portant una càrrega d'eines i la clau mestra de la seva forja penjada al cinturó.

La seqüència real del trajecte és:
1. **Sortida de Malla:** Deixa el poble amb les eines i la clau penjada.
2. **Cruïlla Direcció a Vic:** Ignora el trencall principal cap a Vic i segueix pel camí rural.
3. **Masia El Blanc:** Saluda els masovers mentre comprova la càrrega.
4. **Pas de la Riera:** Travessa el gual d'aigua passant per sobre les pedres seques.
5. **Masia de Planes Bones:** Passa pel davant a pas viu quan comença a fer-se fosc.
6. **Camí de les Nogueres:** Passa pel tram de camí on les nogueres fan una ombra espessa.
7. **Entrecreuament de Can Vinyals (La Pedra Gran):**
   - Vora la bifurcació cap a Can Vinyals, sota les nogueres que flanquegen el camí, recolza el sac a la gran pedra fita per recuperar l'alè.
   - En moure's, se sent un soroll metàl·lic: la clau de la forja rellisca i queda amagada a la pedra gran.
8. **Pou d'Aigua:** S'atura a beure i s'adona esverat que ja no porta la clau.
9. **Arribada a La Guixa:** Arriba a la forja sense poder entrar fins l'endemà.

---

## 3. Mecànica 1: Cooperació dels Testimonis (Pistes Repartides)
### Assignació de Pistes per Mòbil
- Cada jugador de l'equip veu a la seva pantalla exclusivament la pista que li correspon, segons la seva posició a l'equip (`player_index`), distribuïdes cíclicament per a equips de qualsevol mida:
  - **Jugador 1 (Testimoni de Malla, Vic i Masia El Blanc):**
    > *«Vaig veure sortir el ferrer de Malla al capvespre. Va deixar a mà dreta el trencall de Vic i va enfilar cap a la Masia El Blanc per comprovar la càrrega abans d'anar cap a l'aigua.»*
  - **Jugador 2 (Testimoni del Pas de la Riera i Masia de Planes Bones):**
    > *«Va travessar la riera saltant per les pedres seques i va passar ràpid per davant de la Masia de Planes Bones abans que fos fosc del tot.»*
  - **Jugador 3 (Testimoni del Camí de les Nogueres i Can Vinyals):**
    > *«Va agafar el camí on les nogueres fan ombra fins a l'entrecreuament de Can Vinyals. Allà el vaig veure recolzar el sac a la gran pedra del camí i es va sentir un cop sec de ferro contra la roca!»*
  - **Jugador 4 (Testimoni del Pou i La Guixa):**
    > *«Va arribar esbufegant al pou d'aigua per beure abans d'entrar a la Guixa. Es tocava el cinturó desesperat: deia que entre les nogueres i el pou havia perdut la clau mestra de la seva forja!»*
- Els jugadors no han d'intercanviar mòbils: han de comunicar-se en veu alta per ordenar el camí.

---

## 4. Mecànica 2: Mapa Hexagonal Ampliat i Traçat Interactiu
### Disseny de la Xarxa Cartogràfica
S'amplia el mapa hexagonal en SVG a una graella de 24 caselles (6 columnes × 4 files o configuració equivalent en rusc d'abelles), ambientada en tons pergamí i estil cartogràfic del 1705:
1. **Nodes de la Ruta Correcta (8 nodes):**
   - Malla (Inici)
   - Trencall Direcció a Vic
   - Pas de la Riera
   - Masia El Blanc
   - Masia de Planes Bones
   - Camí Nogueres
   - Entrecreuament Can Vinyals (Nogueres & Pedra Gran) ⭐
   - Pou d'Aigua
   - La Guixa (Arribada)
2. **Caselles de Terreny i Distracció (16 nodes de farciment i camins alternatius):**
   - *Camps i Conreus:* Camps de Blat d'Or, Vinyes de Can Vinyals, Feixes de Regadiu, Oliverar Vell, Prat de Pastura, Erm Pedregós.
   - *Camins i Trencalls:* Camí Ral de Vic, Corriol del Falguerar, Camí Vell de Taradell, Pista de les Feixes.
   - *Elements Naturals:* Bosc de Roures, Bosc Espès, Gual Profund (Intransitable), Marge de Pedra Seca, Paller Aïllat, Forn de Calç.

### Interacció al Mapa
- Els jugadors poden tocar els hexàgons en ordre per anar construint el camí.
- A mesura que toquen els nodes correctes, una línia daurada ressalta el traçat entre ells.
- Si toquen un node incorrecte (ex: desviar-se pel Corriol del Bosc o entrar a les Vinyes), el mapa indica l'error amb una lleugera vibració i permet desfer el pas.
- En completar la ruta fins a La Guixa, el sistema destaca amb un halo brillant el node clau:
  > **«Objectiu Localitzat: Entrecreuament de Can Vinyals (Nogueres i Pedra Gran). La clau d'Isidre és allà!»**

---

## 5. Mecànica 3: Troballa Física i Doble Validació (QR + Codi)
### Acció al Món Real
Els jugadors caminen fins a l'entrecreuament cap al camí de Can Vinyals, localitzen les nogueres i la gran pedra fita que marca el camí.
A la pedra troben l'adhesiu o targeta física:
- **Codi QR:** URL que apunta a la validació de la clau.
- **Text imprès visible:** `Codi de reserva manual: CLAU-FORJA`.

### Interfície a la Webapp
Un cop deduïda la ruta al mapa, la pantalla mostra el panell de troballa:
1. **Botó Càmera:** «📷 Escanejar QR de la Pedra» que obre l'escàner integrat de la webapp (`@yudiel/react-qr-scanner`).
2. **Camp Manual de Reserva:** «O introdueix el codi de la pedra» amb camp de text i botó «Validar».
3. **Lògica de Validació:**
   - Admet l'escaneig directe de la URL (`/s/clau-forja` o variant).
   - Admet la paraula manual: `CLAU-FORJA`, `clau-forja`, `CLAU FORJA` (ignorant espais, guions i majúscules/minúscules).

---

## 6. Recompensa i Estat Compartit
En validar el QR o el codi manual:
1. **Efectes:** So `evidence-unlock` i animació d'èxit.
2. **Evidència Desbloquejada:** *«La Clau Mestra d'Isidre»* — es demostra que tornava de Malla i no va participar en la conspiració.
3. **Sospitós Descartat:** Isidre el Ferrer (100% innocent).
4. **Xifra de l'Element:** **🌍 TERRA = 3** (anotada al quadern d'equip).
5. **Persistència:** S'actualitza `team_stations`, `team_evidences` i `sharedState` a Supabase per sincronitzar tots els jugadors de l'equip.

---

## 7. Materials Físics a Generar
- Generació del QR imprimible a la pantalla de màster (`/master/qr`) per a la Pedra Gran de Can Vinyals:
  - Títol: *Objecte Perdut d'Isidre — La Clau de la Forja*
  - Ubicació: *Entrecreuament cap a Can Vinyals, vora les nogueres (Pedra Gran)*
  - Codi de reserva: `CLAU-FORJA`
