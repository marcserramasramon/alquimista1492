# Estació 1: Serrat de les Bruixes — El Codi de Fogueres

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Serrat de les Bruixes |
| **Subtítol** | El Codi de Fogueres |
| **Acte** | I - La Investigació |
| **Joc** | Desxifra de codi (webapp) |
| **Ordre** | Lliure (una de les 4 primeres estacions) |
| **Ubicació física** | Serrat de les Bruixes (punt alt) |
| **Dificultat** | 2/5 |
| **Temps previst** | 8 min + desplaçament |

---

## Cartell Físic

**SENYALS DE FOC DE LA PLANA**

> Així parlen els serrats de nit quan no es pot enviar ningú.
> Fogueres a l'esquerra: la fila. Fogueres a la dreta: la columna.

### Taula de Desxifra (Quadrat de Polibi 5×5)

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1 | A | B | C | D | E |
| 2 | F | G | H | I | J |
| 3 | L | M | N | O | P |
| 4 | Q | R | S | T | U |
| 5 | V | X | Z | Ç | · |

*El punt "·" representa un espai.*

### QR

QR que apunta a: `/s/[token-station-1]`

---

## Mecànica del Joc

### Què Veu el Jugador a la Webapp

1. Seqüència d'il·lustracions de fogueres (grups a l'esquerra i a la dreta)
2. Context narratiu: vistes la nit del 15 des del Serrat
3. Casella de text: "Què diuen les fogueres?"
4. Ambientació opcional: sons suaus de vent i crida de corb

### Flux

1. Escaneja QR → es desbloqueja l'estació
2. Introdueix la resposta (desxifra)
3. Marca els sospitosos descartats
4. Validació servidor
5. Obté la xifra **4 (FOC)** i evidències

---

## Solucions i Variants

### Variant A

| Paràmetre | Valor |
|-----------|-------|
| **Seqüència de fogueres** | 4-3 · 1-1 · 3-5 / 3-1 · 3-1 · 1-5 · 4-4 · 4-2 · 1-1 + 4 fogueres al turó esquerre |
| **Missatge desxifrat** | SAP DE LLETRA |
| **Xifra obtinguda** | 4 (FOC) |

### Variant B

| Paràmetre | Valor |
|-----------|-------|
| **Seqüència de fogueres** | 1-5 · 4-3 · 1-3 · 4-2 · 2-4 · 4-5 |
| **Missatge desxifrat** | ESCRIU |
| **Xifra obtinguda** | 4 (FOC) |

### Variant C

| Paràmetre | Valor |
|-----------|-------|
| **Seqüència de fogueres** | 3-1 · 3-1 · 1-5 · 2-2 · 1-5 · 2-4 · 5-2 |
| **Missatge desxifrat** | LLEGEIX |
| **Xifra obtinguda** | 4 (FOC) |

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Cada missatge són parells de fogueres." |
| 2 | −2 | "El primer parell és una sola lletra: fila i columna." |
| 3 | −5 | Solució completa (missatge + xifra). |

---

## Validació Webapp

✓ **Camp 1:** Escriure el missatge correcte  
✓ **Camp 2:** Marcar els dos sospitosos descartats (Pere del Molí, Joan)

---

## Conclusió de l'Estació

**Descobriment:** El delator sap de lletra (escriu, llegeix).

**Sospitosos descartats:**
- Pere del Molí (signa amb una creu)
- Joan (signa amb una creu)

**Sospitosos restants:** Bernat, Marianna de l'Hostal, Isidre, Anton (escolà)

---

## Evidències Desbloqueades en Resolució

Després de resoldre correctament, es desbloqueja a la webapp:

1. **Missatge inicial de Bernat**: "Assumptes de família a Vic."
   - *Nota:* Porta el segell de ploma i clau (pista per a posterior).
2. **Fitxa de Pere del Molí**: Descartada (signa amb creu)
3. **Fitxa de Joan**: Descartada (signa amb creu)

---

## Contexte Narratiu

Un informador de dins de Vic ha avisat que la carta del delator és de mà pròpia: qui l'ha escrit sap de lletra. Els vigies dels turons de la plana es passen avisos de nit amb fogueres quan no es pot enviar un missatger. Cada parell de fogueres representa una lletra, usant el sistema dels patrullers.

**Àudio opcional (màster):** "Els vigies havien vist les fogueres la nit del 15. Els pagesos les recorden bé: quatre fogueres al turó esquerre, tres al dret..."

