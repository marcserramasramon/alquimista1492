# Joc 6: Pla de Masset — L'Acusació (El Gir)

**Ubicació:** Pla de Masset  
**Joc:** Lògica i deducció  
**Acte:** II — La traïció  
**Durada:** 8–10 min  
**Dificultat:** 3/5  

---

## Narrativa

Els jugadors han de acusar el traïdor amb 3 proves vàlides del Quadern.

Gir: Si primer acusen l'Anton, arriba l'àudio que el neteja. Llavors descobreixen que Bernat és el traïdor.

---

## Pantalla 0–2: Títol i Introducció

```
PLA DE MASSET
═══════════════════
L'Acusació
```

---

## Pantalla 4: El Joc

```
Pregunta: "Qui és el traïdor?"

Selector: Persona (6 botons sospitosos)

[Marcar jusqu a 3 evidències del Quadern]

[VALIDAR]
```

---

## Primer Intent (Gir)

**Si acusen l'Anton:**

```
[Àudio de l'Anton]
"El rector! L'han ferit! He estat vetllant-lo 
tota la nit del 15."

[Es desbloqueja]
- Declaració del Rector: "L'Anton va vetllar-me"
- Full de cal·ligrafia: exercicis d'escola amb 
  noms del registre de difunts (Josep Vilardell...)
```

---

## Segon Intent (Correcte)

**Bernat + 3 proves vàlides:**

```
Proves vàlides contra Bernat:
- Segell ploma i clau (missatge = carta)
- Llum a l'escola (Planes Bones)
- Dos càntirs escola (Font del Ferro)
- Full cal·ligrafia (desbloquejat aquí)
- Sap de lletra (Serrat)
- Filigrana àncora (idèntica)
```

---

## Pantalla 7A: Correcte ✅

```
✓ CORRECTE!

BERNAT, el Mestre d'Escola, és el traïdor.

[Explicació de les proves marcades]

✓ Desbloqueja:
- Àudio del Rector: "La clau està a la foscor"
- Rima del codi: "Del cim baixa l'avís..."

+100 punts (o variable según proves)
```

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Compareu el segell del primer missatge amb carta" |
| 2 | −2 | "Qui tenia llum, aigua dia 12, i accés noms registre?" |
| 3 | −5 | "Bernat. Proves: segell, llum escola, cal·ligrafia" |

---

## Dades Capturades

- `suspect_accused` (nom)
- `evidence_selected` (array de 3 ids)
- `attempts` (int)
- `solved_at` (timestamp) → Per desempat final

---

## Prerequisit

- 4 estacions I resoltes (4 xifres al panel)
- Control de l'Emissari passat
