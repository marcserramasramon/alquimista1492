# Joc 7: Rectoria — Caixa de les Almoines (Segell i Carta Falsa)

**Ubicació:** Porxo de la Rectoria  
**Joc:** Validació de segells + carta falsa  
**Acte:** III — L'alba  
**Durada:** 6–8 min  
**Dificultat:** 1/5  

---

## Narrativa

Els jugadors han recuperat la clau i obren la caixa de les almoines. Dins troben la carta original de Bernat i la nota del capità.

Han de segellar correctament la carta falsa (que el Rector els va donar al principi) perquè passi per la de Bernat.

---

## Pantalla 0–2: Títol i Introducció

```
RECTORIA
════════════════════
La Caixa de les Almoines
```

---

## Pantalla 4: El Joc

```
Pregunta: "Quin segell és el correcte?"

[4 botons amb segells:]
A: Ploma i clau (correcte)
B: Clau i ploma (invertit)
C: Ploma sola
D: Clau creuada espasa

[SEGELLAR]
```

---

## Físic: La Caixa

```
Caixa de fusta + cadenat + ranura

Dins:
- Carta original de Bernat (trofeu validació final)
- Nota del Capità: "Els noms a trenc d'alba, 
  i el vostre fill dorm a casa. Qui porti 
  la carta dirà: l'alba ve de Vic."
- Sobre del Rector amb carta falsa + 4 segells
```

---

## Solució

**Segell correcte:** A (ploma i clau, mateixa orientació carta original)  
**Contrasenya:** "L'alba ve de Vic" (a la nota del capità)

---

## Pantalla 7A: Correcte ✅

```
✓ CORRECTE!

Segell A coincideix exactament.

[Imatge: sobre segellat]

Contrasenya: "L'alba ve de Vic"

Motiu de la traïció revelat:
Jaume, fill de Bernat, és pres a la guarnició.

+100 punts
```

---

## Dades Capturades

- `seal_selected` (A/B/C/D)
- `solved_at`
- Permet accedir a Joc 8 (Porta Campanar)

---

## Prerequisit

- Joc 6 correcte (acusació Bernat)
- Clau recuperada de Joc 7a (pica-paret)
