# El Traïdor de la Guixa — Fites (Redisseny: 5 Elements)

> **Estat:** ESBORRANY DE TREBALL. Substitueix conceptualment `docs/old/jocs.md` i les fitxes a `docs/fitxes-estacions/`. Mentre es treballa aquest document en el seu propi xat, les fitxes existents (`docs/fitxes-estacions/estacio-0X-*.md`) es consideren desactualitzades per a les estacions que canvien.
>
> Depèn de: `docs/historia-nova.md` (especialment els punts PENDENT — sense trama definida, el "per què" de cada estació queda en l'aire).

---

## Mecànica comuna a les 5 fites

Cada fita/estació és un **element**. El jugador hi troba un missatge o número amagat mitjançant un truc físic-químic de "tinta invisible" propi de l'element. El resultat (número/xifra) es valida a la webapp.

**Totes les fites comparteixen:**
- Un cartell físic amb el context narratiu + (quan aplica) un poema/pista que insinua el truc de revelació, sense dir-lo directament.
- Input a la webapp per introduir el resultat trobat.
- **3 pistes estàndard** (mateix patró a totes les estacions, cost 0 / −2 / −5 — veure `docs/app-nova.md` pel sistema de pistes):
  1. **Nivell 1 (0 pts):** vaga, orienta cap a l'element ("El que brolla revela el secret").
  2. **Nivell 2 (−2 pts):** concreta, indica l'acció exacta sense donar la resposta ("La tinta no es mulla, mulla el paper").
  3. **Nivell 3 (−5 pts):** dona la resposta directa ("El número és X").

---

## 💧 AIGUA — Font del Ferro

**Estat: DISSENYAT (aprovat en aquesta conversa)**

| Camp | Valor |
|------|-------|
| Ubicació | Font del Ferro (Carrer del Call) — font real amb manovella i sortidor en forma de cap de lleó. Coordenades confirmades: **41.914816, 2.227479** (⚠️ difereixen lleugerament de les ja carregades a `content/public/stations.ts` per `font-ferro`: 41.915501, 2.227690 — cal actualitzar quan es tanqui aquest document) |
| Tècnica | Cera d'espelma + aigua tintada |
| Material del jugador | Full amb un poema imprès; sota el text, un número dibuixat amb cera d'espelma (invisible fins que es mulla) |
| Acció física | Els jugadors giren la manovella perquè brolli aigua (idealment tenyida amb colorant/aquarel·la) i mullen el paper. La cera repel·leix la tinta/aigua i el número apareix en blanc net sobre el fons mullat |
| Poema | **Confirmat i tancat:**<br>*No cerquis el principi en la unitat ni el dos,*<br>*mira la tríada sagrada, el triangle silenciós:*<br>*són les tres puntes del trident, els passos d'un destí,*<br>*el batec que obre la porta per començar el camí.*<br><br>*Al costat del guardià, la gran roda fa de guia,*<br>*com els punts cardinals que ordenen la nit i el dia;*<br>*compta els braços de ferro, la creu que et fa girar,*<br>*quatre radis ferms que el corrent faran brollar.*<br><br>*El paper és cec i mut sota la llum del cel,*<br>*fins que el raig del lleó en trenca el vel:*<br>*l'aigua amara el blanc i fa brollar el veredicte,*<br>*duplicant la primera xifra per tancar el conflicte.*<br><br>Contingut públic (`content/public`). Estrofa 1 = ambientació alquímica (tria prima) i marca Font del Ferro com a porta d'entrada, sense xifra. Estrofa 2 = **element físic real confirmat**: la manovella de la font té **4 braços/radis de ferro**, a comptar in situ. Estrofa 3 = la cera revela el doble de la xifra dels radis |
| Element físic real aprofitat | La manovella de la Font del Ferro té **4 braços/radis** (confirmat) — mateix patró que el 1246 de la creu d'Aire: cal comptar-los al lloc, no n'hi ha prou amb el truc de la cera |
| Resposta esperada | **Confirmat:** el número dibuixat amb cera, un cop revelat amb l'aigua, és **8** (= 2 × 4 radis). Resposta final a validar al servidor: **8** |
| Pistes | 1. "El que brolla revela el secret." · 2. "Mulla el paper amb aigua per desvelar el número." · 3. "El número és 8." |
| Notes de seguretat | Cap especial (aigua freda, exterior) |

---

## 🪨 TERRA

**Estat: TÈCNICA DEFINIDA, LA RESTA PENDENT**

| Camp | Valor |
|------|-------|
| Ubicació | **Planes Bones** — coordenades confirmades: **41.912256, 2.233469** (reaprofita el nom de l'estació existent, però ~150 m al sud de les coordenades actuals a `stations.ts`: 41.913588, 2.232733 — cal actualitzar) |
| Tècnica | Cola blanca (cola d'escola) + fang/terra |
| Material del jugador | Full amb el missatge escrit amb cola blanca; en assecar-se és invisible |
| Acció física | Els jugadors freguen terra o fang per sobre; la textura s'enganxa a la cola seca i revela el missatge per contrast |
| Element físic real aprofitat | **3 àmfores** a Planes Bones (confirmat) — mateix patró que el 1246 de la creu (Aire) i els 4 radis de la manovella (Aigua): cal comptar-les in situ. Aquí, a diferència dels altres dos, **el recompte és directament la resposta**, sense cap operació addicional |
| Poema/context | **Confirmat i tancat:**<br>*Vasos d'argila vella reposen en el recer,*<br>*marcats pel secret fosc de l'alquimista:*<br>*un guarda el sofre que crema sense encendre's,*<br>*l'altre el mercuri viu, d'argent fugisser,*<br>*i el darrer té la sal que arrela la terra.*<br><br>*No cerquis fórmules vanes ni llibres perduts,*<br>*obre bé els ulls i comença a enumerar:*<br>*quants cossos de fang custodien la matèria?*<br>*Suma cada recipient que vetlla el racó,*<br>*i en la munió de gerres trobaràs la solució.*<br><br>Refereix les 3 àmfores a la tria prima alquímica (sofre, mercuri, sal — mateix univers hermètic que la "tríada sagrada" del poema d'Aigua). No esmenta la xifra 3 explícitament: l'estructura "un / l'altre / el darrer" les enumera, però cal anar a comptar-les físicament |
| Resposta esperada | **Confirmat:** comptar les àmfores. Resposta final a validar al servidor: **3** |
| Pistes | 1. "Busca on guarda els elixirs l'alquimista." · 2. "Compta les àmfores." · 3. "El número és el 3." |
| Notes de seguretat/logística | Cal preveure un punt amb terra/fang disponible (o que se'l portin els jugadors); risc de tacar roba — avisar als equips |

---

## 🔥 FOC

**Estat: MECÀNICA REDEFINIDA (2026-09-21) — ja NO hi ha foc obert, veure historial de git per la versió anterior (suc de llimona + flama)**

| Camp | Valor |
|------|-------|
| Ubicació | **Entrada del poble** — coordenades confirmades: **41.915765, 2.231385** (es manté, confirmat) |
| Tècnica | **"Paper de foc" — cel·lofana vermella com a lent decodificadora, amb nom narratiu propi.** En la ficció, es presenta com un **vidre alquímic especial que té el foc atrapat a dins**. Full imprès amb números de tots colors barrejats (soroll visual); el missatge real hi és escrit en **verd**. Mirant el full a través del "paper de foc" (la cel·lofana vermella), el verd es fa fosc/llegible i la resta de colors es dissolen en el vermell del filtre |
| Material del jugador/equip | Un tros de **"paper de foc" (cel·lofana vermella)** per equip + el full imprès amb el missatge camuflat en verd |
| Acció física | Els jugadors miren el full a través del "paper de foc" fins que el número en verd es distingeix de la resta |
| Element físic real aprofitat | Cap — el **pal vell de telèfon** del lloc queda només com a referència visual/logística (ja no hi ha encenedor a penjar-hi, en desaparèixer el foc) |
| Poema/context | ⚠️ PENDENT reescriure — cal explicar la idea del "paper de foc"/vidre alquímic amb el foc atrapat a dins, i que només mirant-hi a través es desvela el missatge en verd enmig del soroll de colors |
| Resposta esperada | Es manté de moment **8** com a placeholder (no lligat a cap objecte real, es pot canviar quan es vulgui) |
| Pistes | 1. "El vidre de foc desvela el secret." · 2. "Posa el paper vermell davant." · 3. "El número és el 8." |
| Notes de seguretat/logística | Ja NO cal supervisió de foc obert. Cal preparar un tros de cel·lofana vermella per equip (resistent, que no es trenqui) i imprimir/pintar el full amb prou contrast de "soroll" de colors perquè el verd no es llegeixi a ull nu sense el filtre |

---

## 🌬️ AIRE

**Estat: TÈCNICA DEFINIDA, LA RESTA PENDENT**

| Camp | Valor |
|------|-------|
| Ubicació | **Creu del Pujolar** — coordenades confirmades: **41.910894, 2.224434**. (Pràcticament el mateix punt físic que l'antic Serrat de les Bruixes: 41.910887, 2.224452 — probablement el mateix indret amb nom/element canviat) |
| Tècnica | Sabó (mans o plats, transparent) sobre vidre/mirall + alè (baf) |
| Element físic real aprofitat | La creu de ferro de la Creu del Pujolar té un **número real gravat/pintat a la base: 1246**. Es confirma que **no és un distractor**: forma part del càlcul de la resposta (veure "Resposta esperada") |
| Material del jugador | Vidre o mirall amb una capa finíssima de sabó dibuixant **un número de 4 xifres: 1239** (invisible en sec) |
| Acció física | Els jugadors bufen (alè calent) sobre el vidre; s'entela tot excepte el número de sabó (1239), que queda net i llegible un instant. Prèviament (o en paral·lel) han de localitzar i llegir el 1246 gravat a la base de la creu |
| Poema/context | ⚠️ PENDENT escriure els versos, però **concepte confirmat**: el text ha de fer entendre que hi ha dos números de 4 xifres —un gravat a la creu (1246), un altre amagat a l'aire/vidre (1239)— i cal restar-los |
| Resposta esperada | **Confirmat:** resta de dos números de 4 xifres: `1246 − 1239 = 7` |
| Pistes | 1. "El primer número aguanta la creu, el segon número es desvelarà amb l'aire del teu halè." · 2. "Al peu de la creu trobaràs el primer secret, tira el teu halè al vidre." · 3. "1246 − 1239 = 7." |
| Notes de seguretat/logística | El baf es dissipa ràpid — potser cal poder repetir l'acció diverses vegades; vidre ben fixat perquè no es trenqui/caigui; neteja entre partides (el sabó es pot esborrar amb l'ús) |

---

## ✨ ÀNIMA

**Estat: MECÀNICA REDEFINIDA (2026-09-21) — substitueix del tot l'opció de càmera/filtre de color, veure historial de git per la versió anterior**

| Camp | Valor |
|------|-------|
| Ubicació | **Pista skate (Camí Antic de Malla)** — coordenades confirmades: **41.910340, 2.230023**. Punt nou, no reutilitza cap estació existent. Sembla la fita de tancament de l'Acte I (o pont cap a l'Acte II) |
| Tècnica | **Tinta invisible UV pintada al punt més alt de la pista** (dalt de la rampa/turó més alt), **un sol número, sense punts cardinals**. Cada equip porta una **llanterna UV** física (no és un truc de l'app: no cal càmera ni processament d'imatge) |
| Material del jugador/equip | Una **llanterna UV per equip** (material físic a preparar/comprar, no digital) |
| Acció física | Els jugadors pugen fins al **punt més alt** de la pista (la rampa/turó més elevat) i hi passen la llanterna UV pel terra fins a fer aparèixer el número |
| Poema/context | ⚠️ Esborrany proposat, pendent de validació (revisió del poema anterior: es manté l'estrofa 1 i 3, es reescriu l'estrofa 2 perquè ja no parla de 4 punts cardinals sinó del punt més alt com a moment de màxima alegria/plenitud de l'ànima):<br>*Com la vida de l'alquimista, plena d'alts i baixos constants,*<br>*entre turons de ciment i rampes que desafien els teus passos,*<br>*hauràs de grimpar i caure per aprendre a transmudar:*<br>*la recerca del secret s'amaga a terra, sota els teus peus,*<br>*allà on les ones de pedra simulen el viatge de la Gran Obra.*<br><br>*No busquis a la vall, ni al pla més assossegat,*<br>*l'ànima només celebra allà on tot s'ha superat:*<br>*al cim més alt de la pista, on el vol es fa més ample,*<br>*hi bat el punt més àlgid, la glòria de l'instant;*<br>*és allà, dalt de tot, on descansa el seu secret.*<br><br>*Però la llum del dia i la simple mirada et mantindran cec,*<br>*doncs la tinta invisible només respon al raig ultraviolat:*<br>*projecta la teva flama porpra sobre el gris del terra*<br>*i veuràs com el plom del silenci es torna l'or de la veritat,*<br>*revelant, en un instant, el número del teu destí.* |
| Resposta esperada | **Actualitzat:** un sol número, **4** (simplificat respecte al 412 anterior, ja no cal cap derivació de coordenades GPS) |
| Pistes | 1. "El que busques és sota els teus peus." · 2. "Il·lumina el terra amb la llanterna." · 3. "El número és 4." |
| Notes tècniques | **Ja NO cal** accés a `getUserMedia` ni processament de canvas — s'elimina la implicació tècnica que hi havia abans per a `docs/app-nova.md` (permisos de càmera, filtre de color, etc.). L'app només necessita un input de text/número igual que a la resta d'estacions |
| Notes de seguretat/logística | Cal preveure una llanterna UV per equip (comprar-ne prou unitats + piles de recanvi); verificar que la tinta UV escollida sigui prou resistent a la intempèrie (terra exterior, possible humitat/rosada de nit) i seguri per pintar sobre paviment públic (permisos de l'ajuntament si cal); provar-ho in situ de nit abans de l'esdeveniment per confirmar que es veu bé amb les llanternes previstes |

---

## 🔯 Geometria del pentagrama (confirmada 2026-09-21)

Els 5 punts físics, units en l'ordre del seu angle respecte al centroide, dibuixen un **pentàgon gairebé regular** (desviació màxima ~11° respecte als 72° ideals) — prou net per llegir-s'hi un pentagrama si es tracen les diagonals:

| Element | Ubicació | Coordenades | Angle respecte al centroide |
|---|---|---|---|
| 🔥 FOC | Entrada del poble | 41.915765, 2.231385 | 63° |
| 💧 AIGUA | Font del Ferro (Carrer del Call) | 41.914816, 2.227479 | 125° |
| 🌬️ AIRE | Creu del Pujolar | 41.910894, 2.224434 | 208° |
| ✨ ÀNIMA | Pista skate (Camí Antic de Malla) | 41.910340, 2.230023 | 281° |
| 🪨 TERRA | Planes Bones | 41.912256, 2.233469 | 350° |

**Centroide:** 41.912814, 2.229358 — cau pràcticament al mig del nucli on ja passen els Actes II–III (Rectòria, Escola, Pla de Masset, Campanar, tots entre 41.9131–41.9135 / 2.2281–2.2293). És a dir, **el pentagrama que tracen les 5 estacions "assenyala" literalment el cor del poble on es resol la trama**.

⚠️ **PENDENT — decisió narrativa, no inventar-la aquí:**
- Té significat dins la ficció (algú l'ha dibuixat expressament — ward alquímic/hermètic, senyal dels conjurats, mapa amagat) o és una troballa metajoc que només veuen els jugadors en marcar els 5 punts al mapa/quadern?
- Si té significat in-fiction: qui el va traçar i per què assenyala el centre del poble? (Podria ser el mecanisme que indica on és la caixa/carta, substituint o complementant el codi numèric.)
- Mecànica de joc: es dona als jugadors un mapa en blanc perquè hi marquin les 5 estacions i descobreixin la forma pel seu compte (moment "aha"), o se'ls diu explícitament que busquen un pentagrama?

## ⚗️ ESTACIÓ CENTRAL — Pla de Masset: "El Gresol dels Cinc Elements"

**Estat: DISSENYAT (aprovat en aquesta conversa, 2026-09-21)**

Al centre exacte del pentagrama (Pla de Masset, 41.913130, 2.229789 — coincideix amb el centroide geomètric, veure secció anterior). No és una fita més: és on convergeixen els 5 fragments recollits a les altres estacions, i on ronda físicament el personatge del màster (l'"Inquisidor" — ⚠️ veure gir de trama a `historia-nova.md`: en realitat és Fra Francesc mateix).

### Mecànica

Un ritual de combinació alquímica físic i manipulatiu: un suport de fusta amb un matràs Erlenmeyer (o tub de destil·lació) central, i cinc recipients marcats amb símbols alquímics, un per element. Els jugadors introdueixen/activen cada element seguint un ordre (⚠️ PENDENT decidir si l'ordre ve donat pels fragments de les 5 estacions, per les diagonals del pentagrama, o és lliure).

| Element | Manifestació alquímica | Substància / mecanisme real | Efecte visual |
|---|---|---|---|
| 🪨 Terra | *Cendra de la Creació* | Bicarbonat sòdic (+ una mica de carbó actiu per textura fosca/terrosa) | Base sòlida, s'introdueix primer al matràs central |
| 🔥 Foc | *Espurna de Rubí* | Indicador vermell de metil, o pols de col llombarda deshidratada (antocianines) | Tenyeix el fons d'un to vermellós/morat intens en contacte amb la base |
| 🌬️ Aire | *L'Alè d'Eòl* | Vinagre / àcid cítric concentrat, en vial amb símbol d'Aire | Efervescència immediata: escuma i bombolles de CO₂ pujant pel coll del recipient |
| 💧 Aigua | *Aigua de Lluna* | Solució fluorescent (aigua tònica amb quinina, o aigua molt diluïda amb fluoresceïna/rodamina) | Es barreja amb l'escuma, estabilitza la mescla i la torna translúcida |
| ✨ Ànima | *La Quinta Essència* | Llum ultraviolada (365/395 nm), oculta o activada en col·locar l'últim segell | Fluorescència espectral en dipositar l'última peça — blau cel (quinina) o verd maragda (fluoresceïna) |

### Revelació del codi / desllorigador

- Al fons o cara posterior del matràs, un símbol/dígit pintat amb tinta invisible UV, que només es fa visible quan la reacció de l'Ànima activa el feix UV.
- Alternativa/complement: el volum final d'escuma marca un nivell numèric en una columna graduada (p. ex. 4, 7, 2 — exemple, no definitiu).
- Opcional per automatitzar: imant de neodimi a la base del recipient de l'Ànima + sensor *reed* sota la taula que obre un electroimant d'un calaix secret quan es col·loca correctament.

### Seguretat i manteniment

- **Sense reactius tòxics, àcids forts ni foc real** — tot de grau alimentari/domèstic (bicarbonat, vinagre/cítric, tònica). Contrasta amb l'estació de FOC (exterior, amb flama d'espelma real) que sí necessita supervisió estricta — veure secció FOC més amunt.
- Ulleres de protecció "d'època" opcionals, per immersió.
- **Reset ràpid (~2 min):** tubs d'assaig amb tapes pels components 1-4 preparats per lots en una safata de recanvi; el matràs central es buida i s'esbandeix a l'aigüera.

### ⚠️ PENDENT

- [ ] Ordre en què s'introdueixen els 5 elements (lliure, per fragments, o per l'orde del pentagrama)
- [ ] Xifra/símbol final exacte i com es relaciona amb el "codi final" de 5 caràcters (veure secció següent)
- [ ] Disseny físic exacte del calaix/mecanisme de sortida (electroimant vs. obertura manual amb el codi UV)
- [ ] Integració amb el gir de trama: com actua "l'Inquisidor" (Fra Francesc) durant aquest ritual — els vigila, els posa a prova, intervé?

---

## Codi final

Amb 4 elements el codi era **4231** (FOC·AIGUA·TERRA·PEDRA, cada un un dígit 1-4). Amb 5 elements:

⚠️ **PENDENT — cal decidir:**
- El codi final passa a tenir **5 xifres**?
- On s'utilitza aquest codi nou (caixa de les almoines, porta del campanar, o tots dos com ara)?
- Cada element continua donant un **dígit únic** (1-5), o alguna fita dona una altra mena de resposta (lletra, paraula)?

---

## Checklist abans de tancar aquest document

- [ ] Assignar ubicació física a TERRA, FOC, AIRE, ÀNIMA (poden reutilitzar les 4 estacions físiques existents + 1 de nova, o replantejar-se el recorregut sencer)
- [ ] Escriure els 4 poemes/contextos que falten (TERRA, FOC, AIRE, ÀNIMA) — mateix estil que el d'AIGUA
- [ ] Decidir resposta esperada (xifra) de cada element i el format del codi final
- [ ] Escriure les 3 pistes de cada element
- [ ] Revisió de seguretat específica per FOC (obligatòria abans de fer-ho servir amb jugadors)
- [ ] Triar color i patró de camuflatge del cartell d'ÀNIMA, i concretar la implementació del filtre de color + mirall a la webapp (ja triat: opció B, càmera de l'app)
- [ ] Un cop tancat: actualitzar/crear `docs/fitxes-estacions/estacio-0X-*.md` per a cada fita i marcar `docs/old/jocs.md` com a obsolet
