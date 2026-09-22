# Estació 2: Font del Ferro — Tinta i Torns d'Aigua

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Font del Ferro |
| **Subtítol** | Tinta i Torns d'Aigua |
| **Acte** | I - La Investigació |
| **Joc** | Lògica i cronologia (webapp) |
| **Ordre** | Lliure (una de les 4 primeres estacions) |
| **Ubicació física** | Font del Ferro |
| **Dificultat** | 4/5 (la més exigent) |
| **Temps previst** | 10 min + desplaçament |

---

## Cartell Físic

**TINTA DE GALES, A LA MANERA DELS NOTARIS**

> Esclafeu gales de roure. Poseu-les en remull amb aigua rovellada d'aquesta font, tres nits senceres, fins que l'aigua es torni negra i violàcia. Coleu-ho i afegiu-hi goma.
> 
> Aquesta és l'única font del terme que dona l'aigua de ferro.

### Llibreta de Torns de la Font (Variant A)

Taula de qui va a la font cada dia (10–16 de maig):

| Data | Persona |
|------|---------|
| 10 de maig | Moliner, Ferrer |
| 11 de maig | Escolà, Hostalera, Bernat |
| 12 de maig | **Escolà, Ferrer, Bernat** |
| 13 de maig | Moliner, Hostalera |
| 14 de maig | Ferrer, Bernat |
| 15 de maig | Moliner, Escolà |
| 16 de maig | Bernat |

### QR

QR que apunta a: `/s/[token-station-2]`

---

## Mecànica del Joc

### Què Veu el Jugador a la Webapp

1. Fragment de l'esborrany de la carta (amb data de la variant)
2. Gràfic/taula dels torns de la font (dies 10–16)
3. Explicació del procés de tinta (3 nits de remull)
4. Pregunta: "Qui no podia haver escrit la carta? (Qui no va recollir aigua el dia requerit?)"

### Flux de Raonament

1. Data de l'esborrany: **nit del 15** (variant A)
2. Per fer tinta: cal remullar **3 nits senceres**
3. Dia de recollida d'aigua: **15 − 3 = dia 12**
4. Qui va anar a la font el **dia 12**: Escolà, Ferrer, Bernat
5. Conclusió: **Qui NO hi va anar (Hostalera) no podia escriure la carta**

### Trampa Común

Qui no resta bé les 3 nits mira el dia de l'esborrany (15), on sí que apareix la Hostalera. No la descarta i al final li queden dos sospitosos. (Bernat apareix en tots els días correctes.)

---

## Solucions i Variants

### Variant A

| Paràmetre | Valor |
|-----------|-------|
| **Data de l'esborrany** | Nit del 15 de maig |
| **Dia de recollida d'aigua** | Dia 12 (−3 nits) |
| **Qui va baixar el 12** | Escolà, Ferrer, Bernat |
| **Sospitós descartat** | Marianna de l'Hostal |
| **Xifra obtinguda** | 2 (AIGUA) |
| **Detall xifra** | Càntirs que va portar l'escola (2) |

### Variant B

| Paràmetre | Valor |
|-----------|-------|
| **Data de l'esborrany** | Nit del 14 de maig |
| **Dia de recollida d'aigua** | Dia 11 (−3 nits) |
| **Qui va baixar el 11** | Moliner, Escolà, Bernat |
| **Sospitós descartat** | Marianna de l'Hostal |
| **Xifra obtinguda** | 2 (AIGUA) |

### Variant C

| Paràmetre | Valor |
|-----------|-------|
| **Data de l'esborrany** | Nit del 16 de maig |
| **Dia de recollida d'aigua** | Dia 13 (−3 nits) |
| **Qui va baixar el 13** | Moliner, Ferrer, Bernat |
| **Sospitós descartat** | Marianna de l'Hostal |
| **Xifra obtinguda** | 2 (AIGUA) |

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "La tinta no es fa el mateix dia." |
| 2 | −2 | "Compteu les nits cap enrere desde la data de l'esborrany." |
| 3 | −5 | Solució completa (dia de recollida, qui va, qui es descarta). |

---

## Validació Webapp

✓ **Camp 1:** Marcar el sospitós descartat (Marianna de l'Hostal)  
✓ **Camp 2:** Escriure quants càntirs va portar l'escola (2)

---

## Conclusió de l'Estació

**Descobriment:** La tinta es fa remullant gales 3 nits. Qui va escriure la carta va recollir aigua el dia 12 (variant A). Marianna de l'Hostal era al mercat de Vic → descartat.

**Sospitosos descartats:**
- Marianna de l'Hostal (coartada: era al mercat de Vic)

**Sospitosos restants:** Bernat, Isidre (Ferrer), Anton (escolà)

---

## Evidències Desbloqueades en Resolució

1. **Esborrany de la carta** (complet): revela tinta de gales i data
2. **Declaració de Marianna de l'Hostal**: "Era al mercat de Vic aquell dia."
3. **Full de la font**: registre dels torns amb detalls de qui va i per a quins recipients
4. **Nota sobre els càntirs de l'escola**: "El dia 12, l'escolà va portar dos càntirs." (pista per a jog 6)

---

## Contexte Narratiu

La Font del Ferro és l'única font del terme amb aigua rovellada prou forta per fer tinta de gales (negra i viscuda). Els notaris viatgers i els mestres d'escola l'usen. La tinta no es fa de la nit al dia: cal remullar les gales almenys 3 nits seguides per aconseguir el color i la consistència correctes.

**Àudio opcional (màster):** "Mig poble pujava a la Font del Ferro. Però només tres persones van baixar el dia 12 per als càntirs..."

