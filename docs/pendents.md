# Pendents

Llista viva de feina pendent. Última actualització: 2026-10-06.

## Bugs

- [x] **Fita de l'Aigua: el marcador no es queda al mapa un cop superada**, ni per missatge ni per GPS. Arreglat (confirmat 2026-10-06).

## Àudios

- [ ] Substituir els àudios vells pels nous.

## Webapp

- [x] **Vídeo d'arribada a la fita** (`app/s/[estacioId]/page.tsx`): en obrir una fita no resolta (QR o GPS) es reprodueix `/video/arribada-fita-{element}.mp4` a pantalla completa, una vegada per sessió i fita; després surt la fitxa. Fets els cinc (Foc afegit 2026-10-06). La narració de la fitxa (`ARRIBADES`) manté el text vell: cal alinear-lo amb el que diu cada vídeo.
- [x] **Vídeos i àudio separats (2026-10-06):** tots els vídeos de `public/video/` (menys `intro-carta.mp4`) van sense so i en format lleuger (720p, ~1-2 MB). El so és un fitxer a part: `/video/x.mp4` → `/audio/video/x.mp3` (`lib/useSoVideo.ts`); a les arribades, la veu és `/audio/arribada-fita-{element}.mp3`. Originals a `backup-video-original/` (fora de git). **No provat en mòbil**: cal comprovar sincronia i que l'àudio soni sol.
- [x] **Manual d'ús:** bombolles sobre l'app real (`components/player/GuiaManual.tsx`): surten soles una vegada (hub, fitxa d'una fita, pantalla de resposta), s'esvaeixen i queda una rodona 💬 per tornar-les a veure; l'ajuda («Com es juga») també les reobre. Les peces assenyalades porten `data-manual`. Textos provisionals a `MANUAL_*` (`content/public/textos.ts`): cal validar-los, i confirmar el cost de les pistes a `fites-nova.md`.

## Documentació (detectat 2026-10-05)

- [ ] `fites-nova.md` Terra: la línia 53 encara descriu la mecànica antiga (6 ÷ 2 = 3); la vigent és 666 (6 àmfores repetit tres cops). Treure el «PENDENT» de la línia 13 i actualitzar l'estat de la capçalera.
- [ ] `MASTER-PROMPT-IMATGES-NOVA.md` (línies 75 i 193): encara diu 3 àmfores, n'hi ha 6.
- [ ] Text d'arribada de Terra: **canviat** (2026-10-06) a «…compteu-los tres cops i el conjur farà la resta». Cal regravar `arribada-terra.mp3` (el vigent és del text antic).
