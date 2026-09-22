# Estació 7: Caixa de les Almoines (WEBAPP)

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Caixa de les Almoines |
| **Subtítol** | Obrir la caixa + validació de segells |
| **Acte** | II/III - La Traïció / L'Alba |
| **Joc** | Lògica + memorització (webapp) |
| **Ordre** | Obligatori (després de jog 6: acusació) |
| **Ubicació digital** | Webapp sola |
| **Dificultat** | 1/5 |
| **Temps previst** | 5–7 min |
| **Desbloqueig** | Acusació correcta de Bernat (jog 6) |

---

## Mecànica del Joc

### Part 1: Obrir la Caixa

**Escena de la webapp:**

Animació (opcional): la clau es llança a la foscor, s'il·lumina l'àrea de búsqueda.

Àudio del rector (murmuri feble):
> "La clau... és aquí en algun lloc. Entre els escombros."

**Camps de text obligatoris:**

1. **"Nom del traïdor:"** 
   - Resposta correcta: **Bernat**

2. **"Codi de 4 xifres:"** 
   - Resposta correcta: **4-2-3-1**
   - (Els jugadors hauran obtingut aquestes xifres de les 4 estacions I)

**Validació servidor:**
- Si tots dos camps són correctes → caixa s'obri
- Si error → "Intenteu de nou." (sense penalització extra)

---

### Desbloqueig: Caixa S'Obri

Si les respostes són correctes:

**Animació:** La caixa s'obri lentament. Interior visible.

**Àudio del rector (veu més ferma):**
> "La carta és aquí. Una nota del capità diu: «L'alba ve de Vic» i noms inventats d'un altre lloc. Segellar-la bé i porta-la a la porta de l'Església."

**Informació desbloqueada:**
- Imatge de la carta falsa (amb noms inventats, lloc fictici)
- Nota del capità (amenaçadora): "L'alba ve de Vic i el vostre fill dorm a casa. Qui porti la carta dirà: l'alba ve de Vic."

---

### Part 2: Segells Adhesius

**Nova pantalla: Selector de segell**

Imatge: **4 segells adhesius de cera** (il·lustrat):

- **A (CORRECTE):** Ploma i clau creuades (ús de les dues armes)
- **B:** Clau i ploma invertides (ordre erroni)
- **C:** Ploma sola (falta la clau)
- **D:** Clau creuada amb una espasa (segell de guerra, incorrecte)

**Pregunta:** "Quin segell és el correcte per senyar la carta?"

**Validació:**
- Opció A → correcta
- Altres opcions → "No és el segell de Bernat. Intenteu de nou." (sense penalització)

---

## Solucions i Variants

### Totes les Variants

| Paràmetre | Valor |
|-----------|-------|
| **Codi d'obertura (4 xifres)** | 4-2-3-1 (idèntic per a totes les variants) |
| **Traïdor (nom)** | Bernat (idèntic per a totes les variants) |
| **Segell correcte** | A: Ploma i clau (idèntic) |
| **Contrasenya desbloqueig jog 8** | "L'alba ve de Vic" (idèntic) |

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "El codi és el que havíeu descobert a les quatre estacions." |
| 2 | −2 | "4 (FOC), 2 (AIGUA), 3 (TERRA), 1 (PEDRA)." |
| 3 | −5 | Codi complet: 4-2-3-1. |

---

## Validació Webapp

✓ **Camp 1:** Nom correcte del traïdor (Bernat)  
✓ **Camp 2:** Codi de 4 xifres correcte (4-2-3-1)  
✓ **Camp 3:** Segell correcte (A: Ploma i clau)

---

## Desbloqueig en Resoldre Correctament

**Desbloqueig inmediato:**

1. **Càmera de la caixa**: mostra el contingut
   - Carta falsa amb noms inventats
   - Nota del capità (amenaça: "L'alba ve de Vic i el vostre fill dorm a casa")
   
2. **Contrasenya desbloqueig jog 8:** "L'alba ve de Vic"
   - Els jugadors han de memoritzar aquesta contrasenya per la següent fase

3. **Accés a jog 8:** Porta de l'Església

---

## Context Narratiu: Contingent de la Caixa

### La Carta Falsa

Mossèn Ramon, el rector, havia preparat de manera preventiva una **carta falsa** amb:
- Noms inventats de personatges del poble
- Lloc de trobada fals (no Sant Sebastià)
- Mateixa grafia que Bernat (per enganyar l'Emissari)

### La Nota del Capità

Una nota cruel dins la caixa revela el motiu de la traïció de Bernat:

> "L'alba ve de Vic i el vostre fill dorm a casa. Qui porti la carta dirà: l'alba ve de Vic."

**Interpretació:**
- "L'alba ve de Vic" = els dragons sortiran d'alba de la guarnició de Vic
- "El vostre fill dorm a casa" = en Jaume, fill de Bernat, és pres a Vic com a ostatge
- El capità ha promès alliberar el noi a canvi dels noms dels conjurats i la carta

### El Segell Correcte

El segell de ploma i clau és la marca de Bernat (mestre d'escola + notari privat, figuradament). Els jugadors han de trobar el segell correcte entre dues opcions similars per senyar la carta falsa amb autoritat.

---

## Errors Comuns i Penalitzacions

### Codi Incorrecte

Si els jugadors escriuen un codi que no és 4-2-3-1:

> "La clau no encaixa. Repenseu l'ordre de les estacions."
> 
> **−10 punts** (poden intentar de nou)

### Traïdor Incorrecte

Si escriuen un nom incorrecte:

> "Aquesta persona no és la que buscava el rector. Penseu-ho bé."
> 
> **−10 punts** (poden intentar de nou)

### Segell Incorrecte (Part 2)

Si trien una opció incorrecta:

> "No és el segell de Bernat. Els seus símbol és la ploma i la clau juntes."
> 
> **Cap penalització** (si és un error)

---

## Estructura de Dades (Backend)

```json
{
  "station_id": 7,
  "station_name": "Caixa de les Almoines",
  "game_type": "caixa-almoines",
  "variant": "A|B|C",
  "required_code": "4-2-3-1",
  "required_traitor_name": "Bernat",
  "correct_seal": "A",
  "unlock_phrase": "L'alba ve de Vic",
  "next_station": 8
}
```

---

## Objectiu del Joc

La Caixa de les Almoines és la **transició de validació**. Els jugadors han de provar que:
1. Entenen qui és el traïdor
2. Recordar el codi complet (4 xifres)
3. Podem reconèixer el segell correcte

Tot això els prepara per la fase final (jog 8), on han de presentar la carta falsa a l'Emissari i decidir si accepten el tracte de Bernat.

