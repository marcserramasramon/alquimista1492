# Difusió — 2 vídeos per a Instagram (Reels/Stories)

> **Estat:** ESBORRANY DE TREBALL (v3 — més acció, més màgia). Guions i prompts per generar els clips amb Gemini/Veo i muntar-los després. No toca cap fitxer de l'app.
> Mateixes restriccions visuals que `difusio-cartell.md` §2 i `MASTER-PROMPT-IMATGES-NOVA.md` §9.
> **Per què la v3:** els clips de la v2 sortien sosos (plans lents i estàtics, sense màgia). Ara cada prompt porta càmera en moviment, una acció clara i un efecte màgic/ocult visible.

---

## 0. Comú als dos vídeos

* **Format:** vertical 9:16, 1080×1920, 24–30 fps. Reels (≤ 30 s) i Stories (15 s).
* **Data de la partida:** diumenge 8 de novembre de 2026, 18:00 (Festa Major de Sentfores). Surt al pla final dels dos vídeos.
* **Rètols:** mai generats per la IA. Es posen al muntatge amb Grenze Gotisch (títols) i Alegreya Sans (text). Zona segura d'Instagram: evitar ~250 px de dalt i ~340 px de baix.
* **Veu en off:** cap.
* **Música:** instrumental, mode menor, corda antiga + percussió de tambors greus, amb un pols que accelera; cors ocults (veus sense paraules) als moments màgics. Sense copyright.
* **Ritme:** talls de **1–2 s**, cap pla estàtic, cada tall amb un moviment de càmera i una cosa que passa. Sincronitzar els talls al ritme dels tambors.

### Com escriure els prompts a Veo (aprenentatges)

1. **Una sola acció forta per clip**, dita amb verbs de moviment (irrompre, sortir disparat, esclatar, arrossegar-se), no descripcions d'ambient.
2. **Dir sempre el moviment de càmera**: *FPV drone*, *whip pan*, *crash zoom*, *orbit*, *dolly zoom*, *handheld tracking*, *low-angle tracking*. «Slow dolly» porta a plans avorrits: evitar-lo.
3. **Dir l'efecte màgic amb detall**: què s'encén, de quin color, en quin ordre, com es mou.
4. **Generar clips curts (4–6 s)** i retallar-ne el tros bo; 8 s surten plans més freds.
5. **Incloure el so** dins del prompt (Veo 3 el genera): *rumbling*, *rune crackle*, *low choir*.
6. Si un clip surt avorrit: repetir-lo afegint «faster, more dynamic camera, more intense» i reduint l'ambient.

### Bloc d'estil (enganxar al final de TOTS els prompts)

```
Dark fantasy occult mood, late medieval Catalonia 1472, high contrast chiaroscuro, deep shadows with vivid glowing magical light (gold, violet, ruby red, ice blue), volumetric fog, floating embers and dust, cinematic anamorphic lens flares, dynamic camera, film grain, no modern elements, no text, no subtitles, no logos, no watermark. Vertical 9:16.
```

### Regla d'or de la figura encaputxada (l'Inquisidor)

Disseny fixat (26/09 i 01/10): home alt amb **capa i caputxa negres**, **cara sempre oculta** (buit d'ombra sota la caputxa, d'esquena o en contrallum), amb un **fanal** a la mà i una **espasa a la cintura**. Cap altre detall de vestuari, cap edat, cap cara. No revelar que és Fra Francesc. Si Veo li genera una cara o detalls, regenerar afegint `face completely hidden in deep shadow, only a black void under the hood`.

**Comportament:** amenaça que **ronda pels camins i pel poble**: camina lent i decidit, mai corre, amb el fanal encès. **Efecte ocult:** allà on passa, el fanal aplana la llum, les ombres s'estiren soles i les runes del lloc es tornen vermelles i s'apaguen; quan s'allunya, tornen a brillar daurades.

### Elements visuals fixats

* **Els cinc cristalls:** un per element, diferenciats només pel color i la llum, **sense cap símbol gravat ni dibuixat**: Aigua = blau glacial, Terra = verd/ambre, Foc = vermell rubí, Aire = blanc transparent (gairebé de vidre), Ànima = violeta. Són **vius**: floten, pulsen, orbiten i deixen estels de llum.
* **Runes:** talla d'unes runes senzilles entallades (sense lletres) als marcs dels arcs de pedra. **S'encenen com un foc daurat**, una darrere una altra, quan hi passa alguna cosa màgica.
* **Amenaça:** l'home de la capa negra (veure dalt).
* Jugadors/figures sempre anònims: d'esquena, de lluny o només mans i peus. Sense cares. Sense flama oberta a l'estació de Foc.

---

## VÍDEO 1 — «El secret» (3 escenes, ~24 s, ~11 talls)

**Idea:** una tradició mil·lenària que guarda un poder. La guerra i un caçador encaputxat l'amenacen; uns guardians surten a protegir-lo.
**To:** èpic, ocult, místic. Acció i màgia constants.

| # | Temps | Escena / tall | Rètol | So |
| --- | --- | --- | --- | --- |
| 1a | 0:00–0:02 | **Laboratori, crash zoom:** un llibre es tanca de cop i s'aixeca un núvol de pols; s'encén l'arc amb runes. | — | Cop sec, runes cruixint |
| 1b | 0:02–0:04 | Cinc cristalls de colors surten volant d'una caixa i orbiten al voltant de l'atanor, deixant estels de llum. | «Una tradició mil·lenària.» | Cors, brunzit màgic |
| 1c | 0:04–0:07 | Les mans anònimes agafen els cristalls en ple vol i els tanquen al cofre; un flaix daurat travessa les runes de tota la sala. | «Un poder que s'ha de protegir.» | Ressò, campana greu |
| 2a | 0:07–0:09 | **L'amenaça, camí:** FPV drone sobre un camí de nit; al fons, el castell crema; un home de capa negra amb fanal i espasa camina amb calma, l'ombra se li allarga. | «1472.» | Tambors greus |
| 2b | 0:09–0:11 | **Poble:** el fanal escombra portes i finestres; les finestres s'enfosqueixen i les runes d'un arc es tornen vermelles al seu pas. | «La guerra crema el país.» | Portes cloc, passes |
| 2c | 0:11–0:14 | **Arc del laboratori:** el vent apaga els ciris de cop; el cofre brilla; l'ombra del caçador i el fanal omplen l'arc; una mà treu l'espasa mig pam (llampec de metall). | — | Metall, cop de tambor |
| 3a | 0:14–0:16 | **Fuga:** figures encaputxades irrompen per una porta secreta, cofre a les mans, i surten corrent a l'alba. | «Algú ha de protegir-los.» | Passes, tambors accelerats |
| 3b | 0:16–0:18 | Orbit ràpid: cinc figures se separen en cinc camins, cada una amb la llum d'un color als dits. | — | Cors, vent |
| 3c | 0:18–0:20 | El mapa: cinc punts s'encenen en colors, una línia de llum els uneix i forma una estrella; esclata un flaix. | — | Explosió musical |
| 4 | 0:20–0:24 | **Pla final** (muntatge): pergamí + logo + text. | «Els Guardians del Secret de Sentfores» · «Diumenge 8 de novembre · 18:00» · «Inscripcions: [URL/QR PENDENT]» | Música s'apaga, campana |

### Prompts (un per generació; retallar el tros bo)

**1a — Llibre i runes (4 s)**
```
Fast crash zoom into a heavy ancient leather book slamming shut on a stone workbench inside a hidden medieval alchemist's laboratory, a burst of dust explodes outward, and behind it a pointed stone archway whose frame is carved with simple ancient incised notch runes (no letters) ignites with golden fire along every rune, one after another, lighting the room. Rune crackling sound, deep impact. [BLOC D'ESTIL]
```

**1b — Cristalls voladors (5 s)**
```
Dynamic orbiting camera inside a candle-lit alchemist's laboratory: five raw smooth crystals burst out of an open wooden chest and fly into the air, orbiting fast around a glowing athanor furnace and trailing glowing light streaks — one glacial blue, one green-amber, one ruby red, one clear glass-like white, one violet; the crystals have no symbols or engravings. Magic energy pulses, sparks, floating embers, low magical choir. No faces. [BLOC D'ESTIL]
```

**1c — Mans i cofre (4 s)**
```
Fast handheld close-up: anonymous hands (no faces) snatch five glowing crystals out of mid-air one by one and slam the chest lid shut; a shockwave of golden light rushes out through the runes carved on the stone arches around the room, candles flaring. Deep bell hit, magic echo. [BLOC D'ESTIL]
```

**2a — El camí (5 s)**
```
Fast FPV drone shot flying low over a dark dirt road toward a tall man in a long black cloak and black hood walking calmly toward camera with a lit lantern in one hand and a sword sheathed at his waist; face completely hidden in deep shadow, only a black void under the hood. In the background a hilltop medieval castle burns, red smoke and embers fill the sky. His long shadow stretches across the road. Distant war drums, wind. [BLOC D'ESTIL]
```

**2b — El poble (5 s)**
```
Low-angle handheld tracking shot racing down a narrow medieval village street at night behind a tall man in a long black hooded cloak carrying a swinging lantern, sword at his waist, face hidden. His lantern beam sweeps across wooden doors and windows; shutters slam shut one by one in front of him; as he passes under a stone arch its carved runes flicker from gold to angry red and go dark. He walks slowly and deliberately, never runs. Heavy footsteps, slamming shutters, low drum. [BLOC D'ESTIL]
```

**2c — L'arc (5 s)**
```
Sudden whip pan inside a hidden stone laboratory: a gust of wind blows out all the candles at once, darkness, only a chest glowing faintly; then the swaying light of a lantern floods through the archway carved with runes and the silhouette of a tall man in a black hooded cloak fills the doorway, a hand pulls the sword half out of its sheath and the blade flashes. Face completely hidden, only a black void under the hood. Wind whoosh, metal scrape, heartbeat. [BLOC D'ESTIL]
```

**3a — Fuga a l'alba (4 s)**
```
Handheld tracking shot at dawn: a hidden wooden door bursts open in a stone wall and several anonymous figures in dark hooded cloaks rush out carrying a small wooden chest, running down a misty medieval village lane, cold blue light and mist swirling. Seen from behind and from the side only, faces hidden. Fast footsteps, rising drums. [BLOC D'ESTIL]
```

**3b — Es separen (4 s)**
```
Fast orbiting drone shot above a misty crossroads outside a medieval village: five hooded figures split apart in five different directions like a star, each leaving a trail of glowing light in a different color (blue, green-amber, red, white, violet) along the path. Seen from above, faces not visible. Rising choir. [BLOC D'ESTIL]
```

**3c — El mapa (4 s)**
```
Close-up fast push-in on a hand-drawn medieval map on old yellowed parchment with black ink showing a village and its hills: five points ignite one by one with glowing colors (blue, green-amber, red, white, violet), lines of light connect them and draw a five-pointed star, the parchment trembles and a flash of golden light bursts out. No symbols, no hands, no faces. Magic surge, musical explosion. [BLOC D'ESTIL]
```

**4 — Pla final:** muntatge amb el fons del cartell (`cartells-html/propaganda/`) i el logo de `public/images/logo/`.

**Versió 15 s per a Stories:** 1b (3 s) · 2b (3 s) · 2c (3 s) · 3c (3 s) · pla final (3 s).

---

## VÍDEO 2 — «Corre!» (persecució, ~20 s, ~11 talls)

**Idea:** una nit al poble, uns jugadors corren amb un cristall viu que els guia mentre l'home de la capa negra els caça pels carrers i els camins. La màgia els ajuda (runes que s'encenen sota els seus peus, cristall que brilla més quan se li acosten) i ell ho apaga tot al seu pas. Acció contínua, cap pla estàtic.
**To:** tens, ràpid, màgic. Aventura de misteri, no terror.
**Ritme:** talls de 1–2 s sincronitzats amb els tambors, música que accelera sense parar.

| # | Temps | Què es veu | Rètol | So |
| --- | --- | --- | --- | --- |
| 1 | 0:00–0:02 | Peus corrent sobre llambordes mullades; a cada petjada s'encén una runa a terra. | — | Passes, runes crepitant |
| 2 | 0:02–0:04 | Les mans d'un corredor aferren un cristall que pulsa amb llum violeta; el pols va més ràpid. | — | Batec, brunzit |
| 3 | 0:04–0:06 | Al fons del carreró apareix l'home de la capa negra, el fanal apaga la llum de les runes, l'espasa brilla. | «Algú us segueix.» | Crit de metall, tambor |
| 4 | 0:06–0:08 | FPV: els corredors giren una cantonada d'esquena a càmera; l'ombra gegant del caçador creix a la paret. | — | Passes desesperades |
| 5 | 0:08–0:10 | Salten una barana i s'enfilen per una escala de pedra; el cristall deixa un rastre de llum. | — | Esforç, brunzit |
| 6 | 0:10–0:12 | Una porta de fusta es tanca d'un cop; una mà hi traça una línia de llum que la segella (les runes de la porta s'encenen). | — | Cop de porta, sigil |
| 7 | 0:12–0:14 | Fora del poble: un camí entre camps; el fanal del caçador es mou al lluny, cada cop més a prop. | «Cinc pistes. Un secret.» | Vent, tambors |
| 8 | 0:14–0:16 | Crash zoom a un arc amb runes: s'obre una porta de llum i els corredors s'hi llancen. | — | Explosió, cors |
| 9 | 0:16–0:20 | **Pla final** (muntatge): pergamí + logo. | «Corre. Resol. Guarda el secret.» · «Diumenge 8 de novembre · 18:00» · «Inscripcions: [URL/QR PENDENT]» | Música s'atura, una campanada |

### Prompts

**2.1 — Runes als peus (3 s)**
```
Low-angle tracking shot at ground level following boots running fast on wet medieval cobblestones at night; at every footstep a glowing golden rune flares on the stone and fades behind them, sparks fly. Only legs visible, no faces. Fast footsteps, rune crackle. [BLOC D'ESTIL]
```

**2.2 — Cristall viu (3 s)**
```
Extreme close-up shaking handheld shot: anonymous hands clutch a rough violet crystal that pulses brighter and brighter with magical light, veins of light crawling across the hands, the light flickering on stone walls around while running. No faces, no symbols on the crystal. Heartbeat, magical hum. [BLOC D'ESTIL]
```

**2.3 — El caçador (4 s)**
```
Whip pan down a narrow medieval stone alley at night to reveal, at the far end, a tall man in a long black hooded cloak stepping out of the dark with a swaying lantern in one hand and a sword at his waist; the golden glowing runes carved on the walls around him turn red and go out one by one as he walks. Face completely hidden, only a black void under the hood. He walks slowly, never runs. Metal shriek, deep drum. [BLOC D'ESTIL]
```

**2.4 — FPV cantonada (3 s)**
```
Fast FPV drone shot racing behind several anonymous running figures in dark clothes (seen from behind only) as they skid around a corner of a narrow medieval street at night; on the wall a giant shadow of a hooded man with a lantern and sword rises and spreads over the stones. Panicked footsteps, rising drums. [BLOC D'ESTIL]
```

**2.5 — Escala de pedra (3 s)**
```
Dynamic handheld tracking shot: a runner (legs and hands only, no face) vaults over a low stone railing and climbs a steep medieval stone staircase, a glowing violet crystal in his hand leaving a trail of light in the air. Effort breathing, rune hum. [BLOC D'ESTIL]
```

**2.6 — Porta segellada (3 s)**
```
Fast close-up: a heavy wooden door slams shut on a dark medieval alley, then an anonymous hand traces a line of golden light across it and runes carved into the door frame ignite one by one, sealing it. Loud thud, magical sigil hum. [BLOC D'ESTIL]
```

**2.7 — El camí entre camps (4 s)**
```
Wide low-angle drone shot over a dirt path winding through dark fields outside a medieval village at night: far away a single lantern light moves along the path carried by a tall figure in a black hooded cloak with a sword at the waist, tiny silhouette, face not visible; mist crawls across the ground, drums in the distance. The camera pushes forward fast. [BLOC D'ESTIL]
```

**2.8 — Porta de llum (4 s)**
```
Fast crash zoom toward a pointed stone archway carved with ancient notch runes at the end of a dark alley: the runes flare bright gold, a portal of swirling golden light opens inside the arch and several anonymous figures (seen from behind, faces hidden) leap into it as the light explodes outward. Explosion, rising choir. [BLOC D'ESTIL]
```

**2.9 — Pla final:** muntatge (mateix pla estàtic que el vídeo 1).

**Versió 15 s per a Stories:** 2.1 (2 s) · 2.3 (3 s) · 2.4 (3 s) · 2.6 (2 s) · 2.8 (2 s) · pla final (3 s).

---

## Proposta de textos ("gancho") per a les descripcions d'Instagram

### Vídeo 1 (El Secret — setmana d'intriga)

> 🔒 *Un secret mil·lenari amagat a Sentfores. Cinc cristalls. Una guerra que ho crema tot. Algú ha de protegir-los abans que caiguin en mans equivocades.*
> *Estàs preparat per convertir-te en un dels Guardians?*
> 🗓 Diumenge 8 de novembre de 2026 · 18:00 h
> 📍 Festa Major de Sentfores
> 🔗 Inscripcions i detalls al link de la bio! [PENDENT]
> #Sentfores #FestaMajorSentfores #Alquimia #Ocultisme #Misteri #EdatMitjana #Osona

### Vídeo 2 (Corre! — setmana d'urgència)

> ⏳ *Algú et segueix pels carrers foscos de la vila. No corre, però s'apropa. Tens cinc pistes i molt poc temps.*
> *Corre. Resol. Guarda el secret.*
> 🗓 Diumenge 8 de novembre de 2026 · 18:00 h
> 📍 Festa Major de Sentfores
> 🔗 Assegura la teva plaça abans que sigui massa tard! [PENDENT]
> #Sentfores #EscapeRoom #FestaMajor #Misteri #Alquimia #Osona

---

## Muntatge

1. Generar cada clip per separat (4–6 s) i descarregar-los.
2. Muntar a CapCut/DaVinci: retallar cada clip al tros més intens (1–2 s), tallar al ritme dels tambors.
3. Afegir rètols en català, música i so. Un petit *shake* de càmera i *flash* blanc als cops de tambor donen més energia.
4. Comprovar tots els plans: cap cara reconeixible i cap símbol als cristalls. Si en surt, regenerar.
5. Exportar MP4 H.264, 1080×1920, ≤ 90 s per Reels.
6. Publicar el vídeo 1 primer (intriga) i el vídeo 2 uns dies després (urgència).

---

## PENDENT

* [ ] URL/QR d'inscripció, preu i punt de trobada (mateix pendent que `difusio-cartell.md` §7).
* [ ] Triar la música final i comprovar-ne els drets.
