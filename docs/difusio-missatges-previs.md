# Difusió — Missatges d'ambient previs a la partida (comptador enrere)

> **Estat:** ESBORRANY DE TREBALL, aparcat per treballar en un xat separat. Res d'aquest document s'ha de confondre amb `docs/difusio-cartell.md` ni `docs/difusio-video-storyboard.md` (ja tancats/en curs) — aquest és un pla de **calendari i missatges**, no de disseny visual.
>
> Depèn de `docs/historia-nova.md`, `docs/textos-nova.md` (veu i to de Fra Francesc) i reutilitza el pipeline d'àudio ja existent (Matxa-TTS v2, `scripts/generate-audio.py`).
>
> ⚠️ **No confondre amb els missatges dins la partida activats per GPS** (aquests es planifiquen a part, a `docs/app-nova.md` § Obertura de les fites / Passos previs).

---

## Objectiu

Generar expectació abans de la Festa Major (diumenge 8 nov 2026, 18:00) amb una campanya de missatges en veu de Fra Francesc, combinant text + àudio (mateixa veu TTS que dins l'app) + vídeos curts, sense revelar el gir de trama ni cap solució.

**Idea central:** Fra Francesc ja "parla" dins el joc (missatge inicial, arribades, fragments). La campanya és **el mateix personatge parlant-los abans que comenci la partida** — el missatge secret arribant en fases, no tot de cop.

## Restriccions (les mateixes que `difusio-cartell.md` §2 i `difusio-video-storyboard.md` §3)

- Mai revelar que l'Inquisidor és Fra Francesc disfressat.
- Mai mostrar la cara de la figura encaputxada.
- Cap missatge pot donar respostes, l'ordre del Gresol, ni les tècniques de revelació de cada fita.
- Sense flama oberta a res relacionat amb Foc, sense anacronismes.

## Calendari proposat (comptador enrere fins 8/11/2026)

| Quan | Missatge/peça | Canal | To i contingut |
|---|---|---|---|
| **Ara (~T-6 set.)** | Cartell/anunci (`difusio-cartell.md`, ja dissenyat) | IG/FB feed, cartells físics | Presentació oberta: hi ha un secret, un camí, 5 fites. Silueta encaputxada, sense cara. |
| **T-5/4 set.** | Vídeo teaser 30" (`difusio-video-storyboard.md`, ja escrit) | Reels/Stories | El segell que es trenca, el mapa amb el pentagrama, els 5 elements en muntatge ràpid. |
| **T-4 a T-2 set. (un cada ~4-5 dies)** | 5 micro-missatges "d'element" (veure detall sota) | Story IG/FB + WhatsApp equips inscrits | Fra Francesc reflexiona sobre UN element, sense contingut d'estació ni pista + clip curt + àudio. |
| **T-10 dies** | Recordatori pràctic amb embolcall narratiu | WhatsApp equips inscrits | "El temps s'acaba" en to informatiu: hora de convocatòria, què portar, inscripcions properes a tancar-se. |
| **T-3 dies** | Missatge personal de Fra Francesc als equips ja inscrits | WhatsApp/correu | Reprèn el to de la Introducció (`textos-nova.md` §1) ampliat, sense repetir el text exacte que veuran en obrir l'app. |
| **Vespre abans (7/11)** | Missatge curt d'atmosfera, sense info pràctica | Story | Un sol rètol + àudio: p.ex. "Demà es completa l'estrella." |
| **Matí del 8/11** | Últim avís logístic | WhatsApp equips | Hora i punt de trobada, to directe. |

## Els 5 micro-missatges d'element

Angle: **per què Fra Francesc va triar aquell element**, en to de record/confessió — mai el mateix text que el "Fragment" que es desbloqueja dins la partida (`textos-nova.md` §2.2), per no gastar-lo abans d'hora. Sense ubicació ni truc físic.

Exemple de to (Aigua, esborrany, no és text final):

> "Fa anys que escolto l'aigua d'aquesta font i mai no us n'he dit el secret. Ben aviat, si sou dels triats, també vosaltres l'escoltareu."

Cada un acompanyat del color/glif de l'element ja definits (`app/globals.css`, `difusio-video-storyboard.md` §4.3).

## Preguntes obertes (a decidir quan es reprengui aquest document)

1. **Audiència dels missatges "privats":** només equips ja inscrits, o també versió pública per captar gent nova?
2. **Canal real disponible:** ja existeix un grup de WhatsApp/llista de correu d'equips inscrits?
3. **Quantitat de vídeos:** a banda del teaser de 30", 5 clips independents (Stories) o un sol reel encadenat?
4. **Pendents ja coneguts, no inventar aquí:** URL/QR d'inscripció, preu/edat mínima (mateix PENDENT que `difusio-cartell.md` §8).
