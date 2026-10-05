# Inventari d'àudios i vídeos (2026-10-02)

Objectiu: que **tot el que sona a l'app sigui un vídeo**. Aquí hi ha tot el que hi ha a `public/audio/` (19 mp3) i `public/video/` (7 mp4), organitzat per fita i moment del joc, amb el que ja és vídeo i el que falta convertir.

Durades llegides dels fitxers. Narrador = Fra Francesc (veu Matxa-TTS) tret que s'indiqui el contrari.

**Resum:** 7 vídeos existents · 19 àudios · **14 vídeos nous per fer** (§ 8) · 3 àudios de música/efecte que no són narració (§ 7).

---

## 1. Introducció

| Fitxer | Tipus | Durada | Contingut | On sona | Estat |
|---|---|---|---|---|---|
| `video/intro-carta.mp4` | vídeo | 1:34 | La carta de Fra Francesc | `MissatgeSecret.tsx` | ✅ ja és vídeo |
| `audio/intro.mp3` | àudio | 1:15 | Narració del missatge secret (`MISSATGE_SECRET`) | `MissatgeSecret` (botó veu) | ⚠️ duplicat: el vídeo ja el cobreix. Comprovar que el vídeo duu aquesta veu i retirar l'mp3 |

## 2. Fites — Arribada (en obrir la fita)

Text a `ARRIBADES` / `ARRIBADES_PAS` (`content/public/textos.ts`). **Els 6 vídeos ja estan fets** (confirmat per l'usuari el 2026-10-05); encara no són a `public/video/` del repo.

| Fita | Àudio | Durada | Vídeo |
|---|---|---|---|
| 💧 Aigua — Font del Lleó | `arribada-aigua.mp3` | 0:14 | ✅ fet |
| 🪨 Terra — Planes Bones | `arribada-terra.mp3` | 0:16 | ✅ fet |
| 🔥 Foc — Serrat del Caçador | `arribada-foc.mp3` | 0:11 | ✅ fet |
| 🌬️ Aire, pas previ — Creu del Pujolar | `arribada-aire-pas.mp3` | 0:18 | ✅ fet |
| 🌬️ Aire — Serrat de la Creu | `arribada-aire.mp3` | 0:14 | ✅ fet |
| ✨ Ànima — Pista skate | `arribada-anima.mp3` | 0:18 | ✅ fet |

## 3. Fites — Fitxa del hub (en tocar una punta del pentagrama)

| Fita | Àudio | Durada | Vídeo |
|---|---|---|---|
| 🔥 Foc | `popup-foc.mp3` | 0:10 | ❌ falta. *(botó de veu encara PENDENT de connectar)* |
| Aigua, Terra, Aire, Ànima | — | — | no tenen àudio de fitxa |

## 4. Fites — En resoldre (fragment)

Text a `FRAGMENTS`. A `docs/video-fites.md` ja hi ha el guió i el prompt de les 5 escenes (POV, 8 s, 9:16) i la proposta de fitxers `fita-*.mp4`; **cap generat encara**. La narració `fragment-*.mp3` s'hauria de muntar dins d'aquests vídeos.

| Fita | Àudio | Durada | Vídeo previst | Estat |
|---|---|---|---|---|
| 💧 Aigua | `fragment-aigua.mp3` | 0:20 | `fita-aigua.mp4` | ❌ falta (escena dictada) |
| 🪨 Terra | `fragment-terra.mp3` | 0:26 | `fita-terra.mp4` | ❌ falta (escena per aprovar) |
| 🔥 Foc | `fragment-foc.mp3` | 0:25 | `fita-foc.mp4` | ❌ falta (escena per aprovar) |
| 🌬️ Aire | `fragment-aire.mp3` | 0:26 | `fita-aire.mp4` | ❌ falta (escena per aprovar) |
| ✨ Ànima | `fragment-anima.mp3` | 0:32 | `fita-anima.mp4` | ❌ falta (escena per aprovar) |

⚠️ Els àudios duren 20–32 s i les escenes planejades 8 s: cal decidir si el vídeo es fa més llarg, si s'encadenen 2–3 clips o si la narració es retalla.

## 5. Vídeos de camí (geofence, es disparen sols)

Definits a `MISSATGES_MASTER` (`content/public/missatgesMaster.ts`). Tots 10 s.

| Vídeo | Lloc | Personatge | Narració inclosa |
|---|---|---|---|
| `aigua-esglesia.mp4` | Església del poble (camí Aigua) | Aigua | ✅ (muntada amb `generate-audio-ambient.py`) |
| `terra-planes-bones.mp4` | Entrada Mas Vinyals (camí Terra) | Terra | ✅ |
| `anima-cami-malla.mp4` | Camí de Malla (camí Ànima) | Ànima | ✅ ? el comentari del codi diu "narració pendent": **verificar** |
| `foc-placa-creu.mp4` | Plaça de la Creu | Foc | ✅ ? idem: **verificar** |
| `alerta-inquisidor.mp4` | Cementiri (camí cap a `aire-pas`) | Inquisidor (veu pròpia) | ✅ amb `audio/alerta-inquisidor.mp3` (0:15, més llarg que el vídeo de 0:10: comprovar que no es talla) |

`alerta-inquisidor.mp3` queda **redundant** un cop confirmat que és dins del vídeo.
Hi ha 4 fitxers `.narrat` a `public/video/` (aigua, terra, anima, foc): marques/restes del procés de muntatge, no s'usen a l'app → es poden esborrar.

## 6. Final i tancament

| Moment | Àudio | Durada | Vídeo | Estat |
|---|---|---|---|---|
| Les 5 fites completades | `estrella.mp3` | 0:49 | `video/estrella-completa.mp4` (0:10, fons del pentagrama, `CelebracioEstrella.tsx`) | ⚠️ el vídeo existeix però dura 10 s i la narració 49 s. Cal vídeo llarg amb la veu dins, o encadenar |
| S'acaba el temps | `temps.mp3` | 0:31 | — | ✅ **decidit (2026-10-05): sense vídeo, només àudio** |
| Pla del Masset (arribada) i ritual del Gresol | — | — | — | sense àudio (`GRESOL_ARRIBADA`, `GRESOL_RITUAL`) |
| Pantalla final «Guardians del Secret» | `guardians.mp3` | 0:20 | — | és **música de fons en bucle** (no narració) |

## 7. Música i efectes (no són narració)

| Fitxer | Durada | Ús | Nota |
|---|---|---|---|
| `musica-entrada.mp3` | 0:18 | Música de benvinguda/ubicació/equips/espera (bucle, `MusicaFons.tsx`) | Fons d'interfície: no té sentit com a vídeo |
| `guardians.mp3` | 0:20 | Pantalla final (bucle, `BotoMusica`) | Idem |
| `so-fragment.mp3` | 0:03 | So d'encert («obrint el fragment») | Efecte curt de `lib/so.ts`; es pot absorbir dins dels vídeos de fragment |
| (`so-arribada`, `so-temps`) | — | Referenciats a `lib/so.ts`, **no existeixen** com a fitxer; sona la versió sintetitzada | |

---

## 8. Feina pendent per fer "només vídeos"

Per ordre de fita:

1. ~~**Arribades (6):** aigua, terra, foc, aire-pas, aire, ànima~~ **Fets (2026-10-05).**
2. **Fitxa Foc (1):** `popup-foc` → 1 vídeo de 10 s (o treure l'àudio, el text ja és a la pantalla).
3. **Fragments (5):** aigua, terra, foc, aire, ànima → 5 vídeos de 20–32 s (guió a `docs/video-fites.md`).
4. **Estrella completa (1):** allargar `estrella-completa.mp4` fins als 49 s de narració.
5. ~~**Temps consumit (1):** `temps.mp3` → 1 vídeo de 31 s.~~ **Descartat (2026-10-05):** aquesta pantalla es queda només amb àudio (`temps.mp3`).
6. **Verificar** que `intro-carta`, `alerta-inquisidor`, `anima-cami-malla` i `foc-placa-creu` duen la narració dins; després retirar `intro.mp3` i `alerta-inquisidor.mp3`.
7. **Decidir** què passa amb la música (`musica-entrada`, `guardians`) i `so-fragment`: o es queden com a àudio de fons, o s'integren als vídeos.

**Vídeos nous que queden:** 5 fragments + 1 estrella = **6** (7 amb el popup de Foc, opcional). Arribades fetes; «S'acaba el temps» només àudio.

Durada total d'àudio de narració per convertir: ≈ 5:20 (arribades 1:31 + popup 0:10 + fragments 2:09 + estrella 0:49 + temps 0:31 + guardians/música apart).

## 9. Preguntes obertes

- Les arribades: vídeo curt amb el lloc real + narració, o només la imatge de la fita amb la veu (vídeo estàtic/Ken Burns)?
- Han de poder-se saltar o repetir? (ara el `BotoVeu` és opcional; un vídeo obligatori canvia el ritme.)
- Pes: els vídeos actuals fan 4–7 MB per 10 s; 14 clips més podrien afegir ~100 MB a `public/` (veure la neteja de Vercel del 2026-09-28) → potser cal hostatjar-los fora de `public/`.
