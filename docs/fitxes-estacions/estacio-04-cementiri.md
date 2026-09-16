# Estació 4: Cementiri — La Signatura del Difunt

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Cementiri |
| **Subtítol** | La Signatura del Difunt |
| **Acte** | I - La Investigació |
| **Joc** | Comparació d'escriptures (webapp) |
| **Ordre** | Lliure (una de les 4 primeres estacions) |
| **Ubicació física** | Cementiri (fossar vell, fora de la reixa) |
| **Dificultat** | 2/5 |
| **Temps previst** | 7 min + desplaçament |

---

## Cartell Físic

**LÀPIDES VELLES DEL FOSSAR**

> Còpia de les inscripcions, tal com les va gravar el picapedrer.

### Làpides (Variant A)

```
AQUÍ IAU ANTONI PUCH · MORÍ LO ANY 1695
AQUÍ IAU JOSEPH CORMINAS, PAGÈS · MORÍ LO ANY 1698
AQUÍ IAU MARIA SARRAT · MORÍ LO ANY 1701
```

### Làpides (Variant B)

```
AQUÍ IAU ANTONI PUCH · MORÍ LO ANY 1695
AQUÍ IAU JOSEP CORMINAS, PAGÈS · MORÍ LO ANY 1698
AQUÍ IAU MARIA SARRAT · MORÍ LO ANY 1701
```

### Làpides (Variant C)

```
AQUÍ IAU ANTONI PUQ · MORÍ LO ANY 1695
AQUÍ IAU JOSEPH CORMINES, PAGÈS · MORÍ LO ANY 1698
AQUÍ IAU MARIA SERRAT · MORÍ LO ANY 1701
```

**Nota Important:** Aquestes llàpides són ficticios. No corresponen a tombes reals de la Guixa.

### QR

QR que apunta a: `/s/[token-station-4]`

---

## Mecànica del Joc

### Què Veu el Jugador a la Webapp

1. Fragment de la signatura de la carta: "[Nom], pagès de la Guixa, vidu des de l'any 98."
2. Registre parroquial (aparent) dels tres difunts (noms ben escrits)
3. Imatge de les làpides (noms escrits per picapedrer, amb errades)
4. Pregunta: "De quina làpida va copiar el nom el traïdor?"

### Flux de Raonament

1. La signatura de la carta porta el nom d'un pagès vidu des de 1698
2. Comparar la signatura amb:
   - **Registre parroquial** (ben escrit): "Joseph Coromines, pagès" (variant A)
   - **Làpida** (mal escrit): "Joseph Corminas, pagès" (variant A)
3. La signatura de la carta diu "Joseph Corminas" (amb error)
4. Qui va copiar de la làpida, no del registre, no sabia com s'escrivia de debò
5. **Conclusió:** Bernat va copiar la làpida. Però qui tenia accés al registre per saber els noms? L'Anton (escolà) o el rector.
6. L'Anton porta la notícia que el rector ha estat ferit (Acte II) → Anton no pot ser el traïdor

**Pista adicional:** Els tres morts són anteriors al 1703 (any que Bernat va arribar). Bernat no els va conèixer mai i només en sabia el nom per la pedra. L'Anton sabia els noms del registre perquè el consulta tothora.

---

## Solucions i Variants

### Variant A

| Paràmetre | Valor |
|-----------|-------|
| **Signatura a la carta** | Joseph Corminas (amb error) |
| **Làpida copiada** | "JOSEPH CORMINAS, PAGÈS · MORÍ LO ANY 1698" |
| **Registre (correcte)** | "Joseph Coromines, pagès" |
| **Sospitós aparent descartat** | Anton (escolà) — coartada: el rector l'avala |
| **Xifra obtinguda** | 1 (PEDRA) |

### Variant B

| Paràmetre | Valor |
|-----------|-------|
| **Signatura a la carta** | Maria Sarrat (amb error) |
| **Làpida copiada** | "MARIA SARRAT · MORÍ LO ANY 1701" |
| **Registre (correcte)** | "Maria Serrat" |
| **Sospitós aparent descartat** | Anton (escolà) |
| **Xifra obtinguda** | 1 (PEDRA) |

### Variant C

| Paràmetre | Valor |
|-----------|-------|
| **Signatura a la carta** | Antoni Puch (amb error) |
| **Làpida copiada** | "ANTONI PUQ · MORÍ LO ANY 1695" |
| **Registre (correcte)** | "Antoni Puig" |
| **Sospitós aparent descartat** | Anton (escolà) |
| **Xifra obtinguda** | 1 (PEDRA) |

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Compareu lletra per lletra entre la signatura i els registres." |
| 2 | −2 | "Qui sabia com s'escrivia de debò? Qui tenia accés al registre de difunts?" |
| 3 | −5 | Solució completa (làpida copiada, registre correcte, conclusió). |

---

## Validació Webapp

✓ **Camp 1:** Escriure el número de la làpida (1, 2 o 3)  
✓ **Camp 2:** Marcar el sospitós aparent descartat (Anton)

---

## Conclusió de l'Estació

**Descobriment:** Qui va escriure la carta va copiar noms de làpides velles, no del registre parroquial. El traïdor no coneixia els noms bé. Només l'escolà (Anton) i el rector tenien accés al registre de difunts. Anton porta la notícia de l'atac al rector → coartada → **descartat**.

**Sospitosos descartats:**
- Anton (escolà) — coartada: estava vetllant el rector la nit del 15

**Sospitosos restants:** Bernat (és el traïdor!)

---

## Evidències Desbloqueades en Resolució

1. **Registre parroquial complet** (fins a 1705): mostra les tres morts i els noms ben escrits
2. **Imatge de les làpides**: amb les errades del picapedrer
3. **Declaració del rector (feble, en àudio)**: "L'Anton va passar la nit vetllant-me. Estic segur."
4. **Full de cal·ligrafia de l'escola**: exercicis de nens copiant noms del registre de difunts (pista per a jog 6)

---

## Contexte Narratiu

El cementiri de la Guixa té làpides velles, maltretes pel temps i gravades amb errades. El registre parroquial, en canvi, es manté ordenat i correcte, perquè l'escolà (Anton) el copia amb cura cada any. Els noms dels tres difunts són el rastre de qui va escriure la carta.

Bernat va arribar el 1703, quatre anys després que morís el primer dels tres. No els va conèixer. Els únics noms que podia saber eren els de la pedra, que és fàcil de llegir però fàcil d'erro.

**Àudio opcional (màster):** "Les làpides estan a la intemperie, desgastades. Qui va escriure la carta va copiar els noms d'aquí, on els gravar del picapedrer els va fer saltar malament les lletres..."

