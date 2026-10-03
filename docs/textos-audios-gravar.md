# Textos dels àudios per gravar

Copiats literalment de `content/public/textos.ts` i `content/public/missatgesMaster.ts`. Si es canvia el text a l'app, s'ha de tornar a gravar l'àudio corresponent.

**Convencions de lectura**
- Dins de cada text, un paràgraf és un bloc: fes una pausa una mica més llarga entre paràgrafs que entre frases.
- Els títols ("El fragment de l'Aigua"…) **no es llegeixen**: només es veuen a pantalla.
- Pronuncia "1472" com *mil quatre-cents setanta-dos*.
- Noms propis a vigilar: Sentfores, Atanor, Planes Bones, Pla del Masset, Pujolar, Serrat del Caçador.
- Veu de **Fra Francesc**: home gran, pausat, català central. L'**Inquisidor** té la seva pròpia veu, més greu i amenaçadora.

**Llegenda de la columna «Format»**
- 🔊 àudio gravat (`public/audio/`)
- 🎬 vídeo (`public/video/`), amb la narració muntada a dins
- 📝 només text a pantalla, **sense veu** (cap fitxer; es pot gravar si es vol)

Els noms de fitxer són els que ha de tenir cada gravació.

---

## 1. Cronologia del joc, per fites

Ordre: entrada → introducció → Aigua → Terra → Foc → Aire → Ànima → final al Pla del Masset. Dins de cada fita: camí, arribada, fitxa del hub, resolució i fragment. (Els equips poden fer les fites en qualsevol ordre; aquest és l'ordre de numeració del joc.)

| # | Moment | Fita | Format | Fitxer | Té vídeo? | Àudio que sona ara (vell/nou) | Pista nova disponible | Text |
|---|---|---|---|---|---|---|---|---|
| 1 | Entrada a l'app (benvinguda) | — | 📝 | — | — | — | — | Sentfores, 1472. Un secret us espera.<br><br>Tingueu-la a mà: us acompanyarà tota la nit. |
| 2 | Introducció: el missatge secret (carta de Fra Francesc) | — | 🎬 + 🔊 | `video/intro-carta.mp4` · `audio/intro.mp3` | ✅ `intro-carta.mp4` (2:49, modificat 3/10) | El vídeo duu el seu propi àudio (no cal afegir-hi res). `intro.mp3` és **nova** (1:20) | ✅ `intro_output.wav` (1:20); també `Enregistrament_net_output.wav` (1:30, versió anterior d'1/10). Sense original | Sentfores, any de Nostre Senyor de 1472.<br><br>Si llegiu aquestes línies, és que us he triat.<br><br>Em dic Fra Francesc de Sentfores. Tota la vida he servit l'Orde del Testament, que guarda una recepta més antiga que les pedres del castell: el camí per obtenir la Pedra Filosofal.<br><br>La guerra ho ha capgirat tot. El castell de Sentfores ha caigut, i amb ell la nostra casa. Hi ha gent que cobeja la recepta per fer-ne mal ús, i el Sant Ofici persegueix tothom qui gosa practicar l'art de la transmutació.<br><br>Per això vaig partir la Gran Obra en cinc fragments — Aigua, Terra, Foc, Aire i Ànima — i els vaig amagar al voltant del poble. Trobeu-los. Demostreu que sou dignes de guardar-los.<br><br>Aquestes pàgines us guiaran: us diran on anar i guardaran cada fragment que trobeu.<br><br>Aneu amb compte: un home del Sant Ofici ronda per aquests carrers. Si se us acosta, no us deixeu espantar i seguiu el camí.<br><br>Que el foc de l'Atanor us guiï.<br><br>*(La signatura "— Fra F." no es llegeix.)* |
| 3 | Camí cap a la fita (geofence, església del poble) | 💧 Aigua | 🎬 | `video/aigua-esglesia.mp4` | ✅ `aigua-esglesia.mp4` (10 s) | **Nova** (muntada al vídeo el 3/10) | ✅ `aigua esglesia_output.wav` (8 s) | Heu vist l'Aigua alçar-se i tornar a caure. Reconeix qui s'hi acosta. Continueu. |
| 4 | Arribada a la fita (Font del Lleó) | 💧 Aigua | 🔊 | `audio/arribada-aigua.mp3` | ❌ | **Nova** (`arribada-aigua.mp3` substituït) | ✅ `aigua intro_output.wav` (15 s, copiat de Descàrregues; sense original a *originals*) | Escolteu. Sentiu l'aigua? Aquesta font ha donat de beure al poble des de sempre, i ningú no s'ha preguntat mai què més hi porta. Busqueu el meu escrit: és mut fins que l'Aigua el toca. |
| 5 | **Fita completa — pantalla** (segell de color de l'element; surt primer) | 💧 Aigua | 📝 | — | — | — | — | Fragment trobat!<br><br>L'Aigua us ha revelat el seu secret. |
| 6 | **Fita completa — vídeo + àudio** (el vídeo para quan s'acaba; l'àudio continua fins al final mentre es veu la pantalla de la fita amb el text) | 💧 Aigua | 🔊 | `audio/fragment-aigua.mp3` | ❌ **Falta** (previst `fita-aigua.mp4`) | **Nova** (`fragment-aigua.mp3` substituït) | ✅ `aigua final_output.wav` (18 s) | L'Aigua és el primer element que vaig aprendre a escoltar. Tot el que brolla porta alguna cosa de dins la terra, i res no s'hi pot amagar gaire temps.<br><br>Per això hi vaig deixar un fragment: l'Aigua dissol, neteja i revela. Qui sap escoltar-la ja ha començat el camí. |
| 7 | Camí cap a la fita (geofence, entrada del Mas Vinyals) | 🪨 Terra | 🎬 | `video/terra-planes-bones.mp4` | ✅ `terra-planes-bones.mp4` (10 s) | **Nova** (muntada al vídeo el 3/10) | ✅ `terra_pas_output.wav` (assignat pel nom, sense verificar) | Heu vist créixer la Terra al vostre pas. Fins i tot ella sap que us acosteu al que busca. |
| 8 | Arribada a la fita (Planes Bones) | 🪨 Terra | 🔊 | `audio/arribada-terra.mp3` | ❌ | **Nova** (`arribada-terra.mp3` substituït) | ✅ `terra intro_output.wav` (15 s) | Heu arribat a Planes Bones. Aquí, uns guardians de pedra vetllen la matèria des de fa molt de temps. La Terra no regala res i no parla amb fórmules: obriu bé els ulls, trobeu on reposen i digueu-me quants són. |
| 9 | **Fita completa — pantalla** (segell de color de l'element; surt primer) | 🪨 Terra | 📝 | — | — | — | — | Fragment trobat!<br><br>La Terra us ha confiat el seu secret. |
| 10 | **Fita completa — vídeo + àudio** (el vídeo para quan s'acaba; l'àudio continua fins al final mentre es veu la pantalla de la fita amb el text) | 🪨 Terra | 🔊 | `audio/fragment-terra.mp3` | ❌ **Falta** (previst `fita-terra.mp4`) | **Nova** (`fragment-terra.mp3` substituït) | ✅ `terra ending_output.wav` (21 s) | Sofre, mercuri i sal: els tres principis de la forja alquimica. Guardats en fang, perquè la terra és pacient i no delata ningú.<br><br>Les heu hagut de buscar una a una per trobar aquest fragment, i així ha de ser: qui vol entendre la matèria, primer s'ha d'embrutar. La Terra és el cos de totes les coses. |
| 11 | Camí cap a la fita (geofence, Plaça de la Creu) | 🔥 Foc | 🎬 | `video/foc-placa-creu.mp4` | ✅ `foc-placa-creu.mp4` (10 s) | **Nova** (muntada al vídeo el 3/10) | ✅ `foc_pas_output.wav` (assignat pel nom, sense verificar) | Heu vist el Foc espurnejar entre les pedres de la plaça i apagar-se en veure-us. Continueu. |
| 12 | Arribada a la fita (Serrat del Caçador) | 🔥 Foc | 🔊 | `audio/arribada-foc.mp3` | ❌ | **Nova** (`arribada-foc.mp3` substituït) | ✅ `foc intro_output.wav` (8 s) | Al Serrat del Caçador vaig deixar el Foc perquè ens protegeixi i ens il·lumini. Mireu a través d'ell i trobareu el fragment. |
| 13 | **Fita completa — pantalla** (segell de color de l'element; surt primer) | 🔥 Foc | 📝 | — | — | — | — | Fragment trobat!<br><br>El Foc us ha mostrat el seu secret. |
| 14 | **Fita completa — vídeo + àudio** (el vídeo para quan s'acaba; l'àudio continua fins al final mentre es veu la pantalla de la fita amb el text) | 🔥 Foc | 🔊 | `audio/fragment-foc.mp3` | ❌ **Falta** (previst `fita-foc.mp4`) | **Nova** (`fragment-foc.mp3` substituït) | ✅ `foc final_output.wav` (23 s). Sobra `foc_ending_output.wav` (16 s, 2/10, sense original): no sé a quin moment correspon | Em van prohibir treballar amb foc. Em van prendre els forns i els alambins. Però el foc no s'apaga perquè ho mani un tribunal: el vaig tancar dins d'un vidre, i ara és ell qui mira per mi.<br><br>Qui entra al poble passa per aquí sense veure res. Vosaltres, amb el foc als ulls, heu vist el que s'amagava enmig del soroll. |
| 15 | Camí cap a l'Aire: alerta de l'Inquisidor (geofence, cementiri) · **veu de l'Inquisidor** | 🌬️ Aire | 🎬 + 🔊 | `video/alerta-inquisidor.mp4` · `audio/alerta-inquisidor.mp3` | ✅ `alerta-inquisidor.mp4` (10 s) | Vídeo: **vella** (28/9). `alerta-inquisidor.mp3`: **nova** (21 s, no hi cap al vídeo de 10 s) | ✅ `inquisidor_alerta_output.wav` (21 s) (+ `inquisidor_alerta.wav` sense convertir). Sense original a *originals* | Sé que rondeu per aquest poble.<br><br>Heretgia! La sento a l'aire, com fum de foguera.<br><br>El Sant Ofici no oblida ni perdona.<br><br>Qui toca l'obra de l'alquimista, crema amb ella.<br><br>Qui hi ha aquí? |
| 16 | Arribada al pas previ (Creu del Pujolar) | 🌬️ Aire | 🔊 | `audio/arribada-aire-pas.mp3` | ❌ | **Nova** (`arribada-aire-pas.mp3` substituït) | ✅ `aire pas_output.wav` (16 s) | Esteu en el camí correcte, que el vent de gregal us empeny per arribar al cim. Camineu amagats seguint el mur, atents a la foscor per si l'Inquisidor hi ronda. Pugeu fins al Serrat de la Creu, on el vent no s'atura, i hi trobareu el que busqueu. |
| 17 | Arribada a la fita (Serrat de la Creu) | 🌬️ Aire | 🔊 | `audio/arribada-aire.mp3` | ❌ | **Nova** (`arribada-aire.mp3` substituït) | ✅ `aire intro_output.wav` (14 s) | Heu pujat fins a la creu. Aquí dalt el vent no para mai i s'emporta les paraules abans que ningú les senti. L'Aire hi amaga un número que l'ull no veu. Només el vostre alè el farà visible. |
| 18 | **Fita completa — pantalla** (segell de color de l'element; surt primer) | 🌬️ Aire | 📝 | — | — | — | — | Fragment trobat!<br><br>L'Aire us ha xiuxiuejat el seu secret. |
| 19 | **Fita completa — vídeo + àudio** (el vídeo para quan s'acaba; l'àudio continua fins al final mentre es veu la pantalla de la fita amb el text) | 🌬️ Aire | 🔊 | `audio/fragment-aire.mp3` | ❌ **Falta** (previst `fita-aire.mp4`) | **Nova** (`fragment-aire.mp3` substituït) | ✅ `aire final_output.wav` (22 s) | Dalt del serrat, el vent ho escampa tot: les paraules, les cendres, els rumors. L'Aire és l'únic element que no es pot tancar en cap gerra.<br><br>El vaig deixar lligat al metall sagrat de la creu, perquè pugui alçar-se als cels. I recordeu-ho: el vostre alè també és Aire. Mentre respireu, la Gran Obra és viva. |
| 20 | Camí cap a la fita (geofence, Camí de Malla) | ✨ Ànima | 🎬 | `video/anima-cami-malla.mp4` | ✅ `anima-cami-malla.mp4` (10 s) | **Nova** (muntada al vídeo el 3/10) | ✅ `anima_pass2_output.wav` (9 s; assignat pel nom i la durada, sense verificar) | Heu vist l'Ànima vibrar entre les ombres del camí, una llum porpra que s'esvaeix en veure-us. Continueu. |
| 21 | Arribada a la fita (Dunes d'asfalt / pista skate) | ✨ Ànima | 🔊 | `audio/arribada-anima.mp3` | ❌ | **Nova** (`arribada-anima.mp3` substituït) | ✅ `anima intro_output.wav` (16 s) | Aquest lloc és com la vida, ple de pujades i caigudes. Qui hi ve cau, s'aixeca i torna a provar-ho, com l'alquimista davant del gresol. L'Ànima no es mostra a la llum del dia: porteu la vostra llum i busqueu-la. |
| 22 | **Fita completa — pantalla** (segell de color de l'element; surt primer) | ✨ Ànima | 📝 | — | — | — | — | Fragment trobat!<br><br>L'Ànima us ha obert el seu secret. |
| 23 | **Fita completa — vídeo + àudio** (el vídeo para quan s'acaba; l'àudio continua fins al final mentre es veu la pantalla de la fita amb el text) | ✨ Ànima | 🔊 | `audio/fragment-anima.mp3` | ❌ **Falta** (previst `fita-anima.mp4`) | **Nova** (`fragment-anima.mp3` substituït) | ✅ `anima ending_output.wav` (28 s) | Aigua, Terra, Foc i Aire fan el món. Però en falta un que els uneixi: la Quinta Essència, l'Ànima.<br><br>L'Ànima no es troba a la vall ni al pla tranquil. S'amaga allà on s'ha pujat més amunt, i per arribar-hi cal caure i tornar-se a aixecar. Així es fa la Gran Obra: cada caiguda és una prova, i cada vegada que us aixequeu, us transformeu una mica. Com la meva vida. Com la vostra, si seguiu aquest camí. |
| 24 | Les cinc fites completades (vídeo de celebració + narració al hub) | ⭐ Estrella | 🎬 + 🔊 | `video/estrella-completa.mp4` · `audio/estrella.mp3` | ✅ `estrella-completa.mp4` (10 s) | `estrella.mp3` al hub: **nova** (42 s). Vídeo de 10 s: sense veu | ✅ `estrella final_output.wav` (42 s); `five_complete_ending_output.wav` (52 s, 2/10) sembla una versió anterior | Els cinc fragments són vostres.<br><br>Mireu el mapa: Aigua, Terra, Foc, Aire i Ànima dibuixen una estrella de cinc puntes. És el signe de l'Orde del Testament: els quatre elements units sota la Quinta Essència. No és cap casualitat. La vaig traçar jo, pas a pas, sobre la terra del poble.<br><br>I tota estrella té un cor. Les seves línies es creuen al Pla del Masset.<br><br>Aneu-hi. Allà s'acaba el camí… i allà trobareu qui us ha vigilat tota la nit.<br><br>Quan hi arribeu, algú us dirà: «El temps es consumeix.» Si sou dignes, sabreu respondre: «Però el foc de l'Atanor es manté.» |
| 25 | **Alternativa:** s'acaba el temps abans de completar-les | ⭐ Estrella | 🔊 | `audio/temps.mp3` | ❌ | **Nova** (`temps.mp3` substituït) | ✅ `temps acabat_output.wav` (28 s) | El temps s'ha consumit. Els astres ja no estan alineats i la Gran Obra no pot esperar més.<br><br>Deixeu el que estigueu fent i aneu al Pla del Masset, al cor de l'estrella. Porteu els fragments que hàgiu trobat. Allà us espera qui us ha vigilat tota la nit.<br><br>Quan hi arribeu, algú us dirà: «El temps es consumeix.» Si sou dignes, sabreu respondre: «Però el foc de l'Atanor es manté.» |
| 26 | Arribada al Pla del Masset (abans del desemmascarament) | ⭐ Gresol | 📝 | — | — | — | — | Sou al cor de l'estrella. Aquí es creuen les cinc línies que heu seguit, de l'Aigua fins a l'Ànima. Aquí s'acaba el camí i comença la Gran Obra.<br><br>Reuniu tot l'equip, guardeu bé els fragments que porteu i espereu aquí. No marxeu.<br><br>Algú vindrà a trobar-vos: qui us ha vigilat tota la nit. Us dirà:<br><br>«El temps es consumeix.»<br><br>Si sou dignes, respondreu sense dubtar:<br><br>«Però el foc de l'Atanor es manté.»<br><br>Llavors tot tindrà sentit. |
| 27 | Botó per passar al ritual (si la transició és `boto-equip`, PENDENT) | ⭐ Gresol | 📝 | — | — | — | — | Premeu-lo només quan us hagin dit «El temps es consumeix» i hàgiu respost.<br><br>*Botó:* Hem respost la contrasenya |
| 28 | Ritual del Gresol dels Cinc Elements | ⭐ Gresol | 📝 | — | — | — | — | Davant vostre hi ha el gresol i cinc recipients, un per cada element que heu recollit: l'Aigua de Lluna, la Cendra de la Creació, l'Espurna de Rubí, l'Alè d'Eòl i la Quinta Essència.<br><br>Fra Francesc us ensenyarà la recepta de la Pedra Filosofal. Uniu els cinc elements tal com us indiqui i observeu bé el gresol: quan hi entri l'Ànima, la matèria parlarà. |
| 29 | Ritual: què han de fer (text provisional) | ⭐ Gresol | 📝 | — | — | — | — | No toqueu res fins que Fra Francesc us ho digui.<br><br>Afegiu cada element al gresol quan us l'indiqui, un darrere l'altre i sense pressa.<br><br>Quan hi entri la Quinta Essència, mireu bé el gresol: la matèria parlarà.<br><br>*Seguretat:* Res del que hi ha a la taula es beu ni es tasta. |
| 30 | Pantalla final «Guardians del Secret» (amb música de fons `guardians.mp3`, bucle) | 🏁 Final | 📝 | — | — | — | — | La matèria ha parlat, i Fra Francesc ha vist el que havia de veure.<br><br>Heu reunit l'Aigua, la Terra, el Foc, l'Aire i l'Ànima. Heu sentit l'amenaça i no us heu aturat. Heu confiat els uns en els altres.<br><br>Des d'avui sou Guardians del Secret de Sentfores i l'Orde del Testament viu en vosaltres. La fórmula de la Pedra Filosofal és vostra: guardeu-la i no la doneu mai a qui en voldria fer mal ús.<br><br>*Lema:* Veritas et Materia in unum vertuntur.<br>*Traducció:* La Veritat i la Matèria es fan una de sola. |
| 31 | Enllaç al laboratori (text provisional) | 🏁 Final | 📝 | — | — | — | — | Ara sou alquimistes: el laboratori de l'Orde és vostre.<br><br>*Botó:* Entrar al laboratori |

---

**Estat de l'àudio nou (3/10, ja aplicat)**

Carpetes de `public/audio/`: `originals marc voice/` = gravacions teves, `new voice/` = ja convertides amb Applio (wav + mp3), `old voice/` = còpia dels mp3 vells que s'han substituït.

- **15 mp3 de l'arrel substituïts per la veu nova**, amb el mateix nom: l'app (`textos.ts`) ja els fa servir sense canviar cap ruta. Són `intro`, `alerta-inquisidor`, `estrella`, `temps`, i `arribada-*` / `fragment-*` de les 5 fites (+ `arribada-aire-pas`). Els vells són a `old voice/`.
- **4 vídeos de camí amb la veu nova muntada** (`aigua-esglesia`, `terra-planes-bones`, `anima-cami-malla`, `foc-placa-creu`), amb la pista nova substituint la vella (sense so ambient, com feia l'script anterior). Els originals són a `backup-video-vell/` (fora de `public/`).
- **Per a la fita de Terra i d'Ànima s'ha usat `terra ending` i `anima ending`** (i no els duplicats `terra final` / `anima final`, que tenen el mateix contingut).
- **No s'ha tocat:** `popup-foc.mp3` (queda obsolet pel flux «Fita completa»), `guardians.mp3`, `musica-entrada.mp3`, `so-fragment.mp3`.
- **Pendents:**
  - `alerta-inquisidor.mp4`: la veu nova dura 21 s i el vídeo 10 s, cal un vídeo més llarg (el mp3 ja és el nou).
  - `estrella-completa.mp4`: la veu nova dura 42 s i el vídeo 10 s (el mp3 ja és el nou).
  - `intro-carta.mp4` (2:49): ja duu el seu propi àudio, no cal afegir-hi res. `intro.mp3` ja és el nou.
  - Sobren: `foc_ending_output.wav` (16 s, sense moment assignat), `Enregistrament_net_output.wav` i `five_complete_ending_output.wav` (versions antigues), `inquisidor_alerta.wav` (sense convertir). Són a `new voice/wav/`.
- **Navegadors:** els fitxers mantenen el nom, així que si algú ha jugat abans pot tenir els vells en memòria cau.


---

**Flux de «Fita completa» (una per cada fita, substitueix el pop-up del Foc):**
1. Pantalla de fita completa, amb el seu color d'element (`CelebracioFragment`).
2. Comença un vídeo i, alhora, l'àudio del fragment.
3. Quan s'acaba el vídeo, aquest para, però l'àudio **no s'atura**: torna la pantalla de la fita (`VistaEstacio`, amb el text del fragment) i l'àudio continua fins al final.

Implementat (3/10): el pas del vídeo és `components/vistes/VideoFita.tsx`, cablejat a `app/s/[estacioId]/page.tsx` (celebració → vídeo → fita). El vídeo és mut, la veu del fragment (`FRAGMENTS[element].audio`) arrenca amb ell i continua a la pantalla de la fita. **Encara no existeixen els 5 vídeos `public/video/fita-{aigua,terra,foc,aire,anima}.mp4`**: mentre no hi siguin, el vídeo s'obvia i només sona la veu. Els vídeos han de ser més curts que l'àudio.

---

## 2. Moments sense lloc fix (poden passar en qualsevol punt del joc)

### 2.1 Respostes del joc (a cada fita)

Només text a pantalla, **sense veu**.

| Moment | Format | Text |
|---|---|---|
| Resposta incorrecta (s'alternen) | 📝 | La matèria no respon. Torneu-ho a provar.<br>Encara no. Mireu-ho amb més calma.<br>Aquest no és el secret. L'element encara calla. |
| Resposta enviada massa de pressa | 📝 | Espereu un moment abans de tornar-ho a provar. |
| Pantalla de pistes | 📝 | **Necessiteu ajuda?**<br>Fra Francesc va deixar tres ajudes per a cada fragment. S'obren d'una en una.<br>Segur que voleu veure la resposta? Us donarà el fragment, però no l'haureu descobert vosaltres.<br>*Botons:* No, seguim buscant · Sí, mostra-la |

(Les pistes en si viuen a `content/private/` i no es copien aquí.)

### 2.2 Missatges que el màster envia a mà (pop-up al mòbil de l'equip)

Cap té veu ni vídeo; surten només com a text. Els 4 amb vídeo i geofence són a la taula de dalt (files 3, 7, 11, 15, 20).

| Id | Títol | Text |
|---|---|---|
| `queden-15` | Queden 15 minuts | Queden quinze minuts. Acabeu la fita on sou i poseu-vos en camí cap al Pla del Masset. |
| `queden-5` | Queden 5 minuts | Només queden cinc minuts. Aneu cap al Pla del Masset sense entretenir-vos. |
| `pla-masset` | Torneu al Pla del Masset | Deixeu el que feu i torneu al Pla del Masset. Us hi esperen. |
| `inquisidor-vigila` | L'Inquisidor us vigila | L'home del Sant Ofici ronda a prop. Parleu baix, no us separeu i no li doneu cap motiu per aturar-vos. |
| `inquisidor-pregunta` | Pregunta per vosaltres | M'han dit que l'Inquisidor pregunta per vosaltres. Seguiu endavant, però amb els ulls ben oberts. |
| `bon-cami` | Aneu per bon camí | Aneu per bon camí. L'Orde del Testament us observa amb bons ulls. |
| `no-separeu` | No us separeu | Mantingueu l'equip unit: ningú no ha d'anar sol, i tothom ha de poder veure el mòbil. |
| `carretera` | Compte amb els cotxes | Si heu de caminar per la carretera, aneu en fila i pel costat. La Gran Obra pot esperar un moment. |
| `tot-be` | Tot en ordre? | Fa estona que no avanceu. Si teniu cap problema, truqueu al màster. |
| `truqueu` | Truqueu al màster | Necessitem parlar amb vosaltres. Truqueu al màster tan aviat com pugueu. |

---

## 3. Música i efectes (no tenen text)

| Fitxer | Quan sona |
|---|---|
| `musica-entrada.mp3` | Benvinguda, ubicació, equips i espera (bucle) |
| `so-fragment.mp3` | En encertar una resposta («obrint el fragment») |
| `guardians.mp3` | Pantalla final (bucle) |

---

## Notes

- Fet el repàs contra `content/public/textos.ts` i `content/public/missatgesMaster.ts`: no hi ha cap altre text amb `audio:` ni `video:` que no surti aquí.
- Si en una fita l'app mostra només el nom i l'entrada (`entrada` d'`estacions.ts`, p. ex. «Cerqueu la boca del lleó que brolla vida.»), no hi ha àudio associat; són textos curts d'interfície.
