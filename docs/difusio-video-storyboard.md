# Difusió — Storyboard del vídeo de teaser

> **Estat:** ESBORRANY DE TREBALL. Guió i prompts per generar clips amb Gemini/Veo i muntar-los després. No toca cap fitxer de l'app.
> Depèn de `docs/historia-nova.md`, `docs/fites-nova.md`, `docs/MASTER-PROMPT-IMATGES-NOVA.md` i `docs/difusio-cartell.md` (mateixa identitat visual).

---

## 1. Objectiu, plataforma i durada

- **Format:** vertical 9:16, sense diàleg (rètols en català + música + so ambient).
- **Durada principal:** ~30 segons (Instagram/TikTok Reels, Stories, WhatsApp).
- **Cutdown:** versió de 15 segons per Stories (§5).
- Veo genera clips curts (uns 8 s cadascun): el guió ja està trossejat en peces d'aquesta durada perquè cada pla sigui una generació independent, per encadenar-les després al muntatge.

## 2. To i so

- **To:** misteriós i contemplatiu, no d'acció ni de terror — un secret d'alquimista, no un thriller.
- **Música:** instrumental, mode menor, corda antiga (llaüt/viola de roda) + drone tens que creix; sense percussió moderna. Cap tema amb copyright — generar-la o usar bancs sense drets.
- **So ambient:** vent, una campana llunyana, cruixit de pergamí, un lleuger degoteig d'aigua al pla 3.
- **Veu en off:** cap (només rètols en pantalla) — més fàcil de generar i evita haver de triar veu/accent.

## 3. Restriccions (les mateixes que el cartell, `difusio-cartell.md` §2)

- ⚠️ **Cap pla amb el rostre o la disfressa de l'Inquisidor/Fra Francesc** — aparença encara PENDENT (`MASTER-PROMPT-IMATGES-NOVA.md` §9). Es pot suggerir la seva presència amb una llanterna llunyana o una ombra, mai un primer pla ni una descripció física.
- ⚠️ No revelar que l'Inquisidor és Fra Francesc disfressat.
- Sense flama oberta a l'estació de Foc.
- Cap text generat per la IA dins del vídeo (els rètols catalans amb accents es fan després, en post-producció) — als prompts de Veo no s'hi demana text a pantalla.

## 4. Storyboard (versió de 30 segons)

| # | Temps | Pla (visual) | Rètol en pantalla | So | Prompt per a Gemini/Veo |
|---|---|---|---|---|---|
| 1 | 0:00–0:04 | Pla general aeri, capvespre boirós sobre les teulades de pedra de Sentfores, silueta del campanar, un parell de finestres amb llum càlida que s'apaguen una a una. | "Sentfores, 1472." | Campana llunyana, vent | `Slow aerial dolly-in over a small Catalan stone village at dusk in late autumn, mist settling between rooftops, a bell tower silhouette in the distance, warm candlelight in a couple of windows fading out one by one. Catalan Gothic illuminated-manuscript mood, muted parchment and grey-stone palette, cinematic atmospheric lighting, no visible people, no modern elements. Vertical 9:16, 8 seconds.` |
| 2 | 0:04–0:09 | Primer pla: un pergamí antic segellat amb cera (segell: llibre + ouroboros en "Y") es trenca sol/per una mà fora de camp; el pergamí es desplega revelant un mapa dibuixat a mà amb cinc punts que formen un pentagrama. | "Un testament secret us ha convocat." | Cruixit de pergamí, drone musical entra fluix | `Close-up macro shot: an aged wax seal (a closed book wrapped by an ouroboros serpent forming the letter "Y") cracks open on a folded parchment letter, which then unfurls to reveal a hand-drawn map with five glowing points forming a five-pointed star. Warm candlelight, shallow depth of field, Catalan Gothic illuminated-manuscript texture, no visible hands or faces. Vertical 9:16, slow motion, 5 seconds.` |
| 3 | 0:09–0:16 | Muntatge ràpid dels 5 elements (uns 1,5 s cada tall): aigua rajant d'una font de pedra amb cap de lleó · gerres d'argila entre herba seca · un matràs de vidre amb un resplendor vermell entre símbols · una creu de ferro en un turó amb l'alè condensant-se al vidre gelat · runes liles revelant-se sota llum UV sobre ciment. | "Aigua. Terra. Foc. Aire. Ànima." (un mot per tall) | Aigua, vent, un lleuger espurneig, silenci fred, brunzit UV | 5 prompts curts, un per tall (reaprofitar el mateix bloc d'estil que §5 de `MASTER-PROMPT-IMATGES-NOVA.md`): p. ex. per l'Aigua — `Extreme close-up: clear water flowing from a stone lion-head fountain spout in an old Catalan village lane, autumn daylight, Catalan Gothic illuminated-manuscript mood, no people. Vertical 9:16, 2 seconds.` — repetir canviant el subjecte per Terra (clay jars in dry grass), Foc (a glowing red glass flask among scattered symbols, no open flame), Aire (an iron cross on a hilltop, breath fogging cold glass), Ànima (violet UV light revealing runes on concrete at dusk). |
| 4 | 0:16–0:22 | Pla general nocturn del Pla de Masset: un suport de fusta amb 5 recipients al voltant d'un matràs central; unes mans (sense mostrar cara ni cos sencer) hi aboquen líquids de colors; el matràs comença a resplendir. Al fons, molt lluny i desenfocada, una llanterna es mou lentament (mai nítida). | "Reuniu-los tots al Pla de Masset." | Líquid bombollejant fluix, música puja | `Wide night shot of a rustic wooden stand holding five small glass vessels around a central flask, in an open village square. Anonymous hands (no face, no full body) pour coloured liquids into the vessels, the central flask begins to glow softly. Far in the unfocused background, a single lantern light drifts slowly across the square — small, blurred, unidentifiable. Catalan Gothic illuminated-manuscript mood, cold moonlit night, no modern elements. Vertical 9:16, 6 seconds.` |
| 5 | 0:22–0:27 | El matràs esclata de llum daurada; flaix curt a blanc/or; talla a la revelació del logotip (gemma/pentàgon) sobre fons de pergamí amb el títol. | "Els Guardians del Secret de Sentfores." | Cop musical, la campana torna | `Macro shot of a glass flask flooding with bright golden light, quick flash transition to warm parchment texture. Catalan Gothic illuminated-manuscript mood, no text, no people. Vertical 9:16, 3 seconds.` (el rètol i el logo final es munten en post amb els fitxers ja existents de `public/images/logo/`, no cal que la IA els generi.) |
| 6 | 0:27–0:30 | Cartell final estàtic (pergamí + logo, sense vídeo IA): dades pràctiques. | "Festa Major de Sentfores — [DATA PENDENT] — Inscripcions a [URL/QR PENDENT]" | Música s'apaga, campana final | — (muntatge, no generació; reutilitzar el fons del cartell de `difusio-cartell.md` §5) |

## 5. Versió curta (15 segons, per Stories)

Retallar a l'essencial, sense el muntatge complet dels 5 elements:

1. (0:00–0:03) Pla 1 escurçat.
2. (0:03–0:06) Pla 2 escurçat (el segell trencant-se, sense el desplegament complet).
3. (0:06–0:10) Un sol tall del muntatge de §4.3 (per exemple només Ànima, el més visual) en lloc dels 5.
4. (0:10–0:13) Pla 4 escurçat.
5. (0:13–0:15) Pla 6 (cartell final), sense el flaix de transició del pla 5.

## 6. Muntatge (fora de Gemini)

1. Generar cada pla per separat amb els prompts de §4 (Veo o eina equivalent).
2. Muntar-los en ordre a CapCut/Premiere/DaVinci; afegir:
   - Rètols en català (Alegreya Sans / Grenze Gotisch per coherència amb el cartell), mai generats per la IA.
   - Música i so ambient (§2).
   - Logo final i dades pràctiques com a pla estàtic (pla 6).
3. Exportar en 9:16 (Reels/Stories) i, si cal, retallar un 1:1 o 16:9 per Facebook/YouTube reaprofitant els mateixos plans.

## 7. PENDENT abans de publicar

- [ ] Data, hora, punt de trobada, preu i URL/QR d'inscripció (mateix PENDENT que `difusio-cartell.md` §7)
- [ ] Triar música/banc de so concret
- [ ] Decidir si es vol veu en off (actualment: no)
- [ ] Revisar que cap clip generat per la IA hagi "inventat" una figura humana reconeixible (Inquisidor) — si passa, regenerar amb `no visible people` reforçat al prompt
