# Imatges de Segells de Cera (IA)

Pots col·locar aquí les imatges PNG transparents dels 4 segells:
1. `segell-bernat.png` (Segell autèntic de Bernat: Ploma i Clau creuades)
2. `segell-anton.png` (Segell d'Anton: Martell i Enclusa)
3. `segell-jaume.png` (Segell de Jaume: Espiga de blat)
4. `segell-capita.png` (Segell del Capità de Vic: Clau i Espasa)

Un cop guardats a `public/images/seals/`, només cal descomentar la propietat `image` a `components/games/BoxGame.tsx`:
```ts
image: '/images/seals/segell-bernat.png',
```
Mentre no hi hagi fitxer, es mostraran automàticament les icones en format de medalló de cera vermella.
