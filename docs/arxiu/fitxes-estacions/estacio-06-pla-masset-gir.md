# Estació 6: Pla del Masset — El Gir (Acusació de Bernat) (WEBAPP)

## Informació General

| Camp | Detall |
|------|--------|
| **Nom** | Pla del Masset |
| **Subtítol** | El Gir (Acusació de Bernat) |
| **Acte** | II - La Traïció |
| **Joc** | Lògica i deducció (webapp) |
| **Ordre** | Obligatori (després de les 4 estacions I) |
| **Ubicació digital** | Webapp sola |
| **Dificultat** | 3/5 |
| **Temps previst** | 8–10 min |
| **Desbloqueig** | Les 4 caselles de xifres plenes (4-2-3-1) |

---

## Mecànica del Joc

### Pantalla Principal: Selector d'Acusació

El jugador veu una pantalla titulada **"ACUSACIÓ"** amb:

1. Dropdown selector: "Qui és el traïdor?"
   - Opcions: Bernat, Pere del Molí, Joan, Marianna de l'Hostal, Isidre el Ferrer, Anton (escolà)

2. Caselles de proves (múltiples): Seleccionar fins a **3 evidències del Quadern**

3. Botó: "Presentar acusació"

### Primer Intent: Acusar L'Anton

Si els jugadors acusen **L'Anton**, la pantalla canvia:

**Àudio de l'Anton (esbufegant, espantat):**
> "El rector! L'han ferit! He estat vetllant-lo tota la nit del 15!"

**Nova informació desbloqueada:**
- Declaració del rector (en text): "L'Anton va passar la nit vetllant-me. Hi puc jurat."
- Full de cal·ligrafia de l'escola: exercicis de nens copiant noms de difunts del registre (Josep Vilardell, Maria Puig, etc.)

**Efecte:** Els jugadors veuen que l'Anton no pot ser el traïdor (coartada del rector). Han d'acusar un altre.

---

## Proves Vàlides Contra Bernat

Una acusació vàlida contra Bernat necessita **3 proves coherents** d'aquesta llista:

| Prova | Estació | Descripció |
|-------|---------|-----------|
| **Segell de ploma i clau** | Quadern (desbloqueig inici) | Idèntic entre el missatge inicial i la carta |
| **Llum a l'escola** | Planes Bones | Vista la nit del 15 a les onze, membre de jog 5 |
| **Dos càntirs per a l'escola** | Font del Ferro | Recollit el dia 12 per fer la tinta |
| **Full de cal·ligrafia amb noms** | Desbloquejat jog 6 | Exercicis de nens copiant del registre (com Bernat) |
| **Sap de lletra** | Serrat de les Bruixes | Descoberta: el delator escriu (no signa amb creu) |
| **Filigrana de l'àncora** | Quadern (opcional) | Idèntica entre missatge inicial i carta |

---

## Solucions i Variants

### Variant A

**Acusació correcta: BERNAT**

Proves vàlides (elegir 3):
1. Segell de ploma i clau (missatge inicial = carta)
2. Llum a l'escola (Planes Bones)
3. Dos càntirs per a l'escola (Font del Ferro)

**Resultado:**
- Acusació acceptada ✓
- Àudio del rector (veu feble, fermant-se):
  > "La carta és a la caixa de les almoines, al porxo de la rectoria, on l'Emissari l'havia de recollir. Abans de desmaiar-me, vaig llençar la clau a la foscor."

- **Desbloqueig:** Rima de l'ordre del codi:
  > "Del cim baixa l'avís, a la font es fa la tinta,  
  > al pla vetlla la ronda i a la pedra dorm el nom."

### Variants B i C

Mateixa mecànica, proves identiques.

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Compareu el segell del primer missatge amb el de la carta que heu vist." |
| 2 | −2 | "Qui tenia llum a un quart d'onze? Qui va portar dos càntirs el dia 12? Qui sap de lletra?" |
| 3 | −5 | "El mestre Bernat. Proves: segell, llum a l'escola i full de cal·ligrafia." |

---

## Validació Webapp

✓ **Camp 1:** Seleccionar el traïdor correcte (Bernat)  
✓ **Camp 2:** Seleccionar 3 proves vàlides  
✓ **Servidor valida:** coherència de les proves + que el traïdor és Bernat

---

## Errades i Penalitzacions

### Acusació Incorrecta (ex: Anton, Pere, etc.)

Si els jugadors no elegeixen Bernat i no trien l'Anton (que té coartada automàtica):

> "Aquesta acusació no se sustenta. Les proves no coincideixen."
> 
> **+3 minuts de penalització**

Poden intentar de nou.

### Proves Vàlides Insuficients

Si trien Bernat però amb només 2 proves o amb proves invàlides:

> "Necessiteu més evidència per acusar el mestre Bernat."
> 
> **−10 punts**

Poden continuar afegint proves.

---

## Desbloqueig en Acusar Correctament

**Desbloqueig inmediato:**

1. Àudio del rector (veu feble però ferma):
   > "La clau... la vaig llençar a la foscor. Troveu-la abans que ell."

2. **Rima de l'ordre del codi:**
   > "Del cim baixa l'avís, a la font es fa la tinta,  
   > al pla vetlla la ronda i a la pedra dorm el nom."
   
   (Els jugadors han de desxifrar aquesta rima per saber l'ordre del codi a jog 8)

3. **Accés a jog 7:** Caixa de les Almoines

---

## Contexto Narrativo: El Gir

Els jugadors han investigat quatre estacions i han recollit peces de puzzle. Però fins ara, els sospitosos eren molts. El Pla del Masset és on els dragones de Vic fan guàrdia, on l'Emissari controla l'entrada al poble.

Quan els jugadors acusen Bernat, **el joc canvia de narrador**. Mossèn Ramon, el rector, prén la veu. Bernat ja no és el guia bondadós de l'Acte I, sinó el traïdor revelat. El rector, ferit però viu, explica el seu pla: hi ha una carta falsa a la caixa de les almoines. Tots els jocs 7 i 8 giren al voltant de recuperar aquesta carta, segellar-la, i enganyar l'Emissari per tocar el sometent.

---

## Proves en Context

### Segell de Ploma i Clau
Apareix dues vegades:
1. **Quadern (inici):** el missatge inicial de Bernat: "Assumptes de família a Vic."
2. **Carta interceptada** (que els jugadors veuen a jog 7): signada pel traïdor

Els jugadors hauran de comparar-les i veure que són idèntiques.

### Llum a l'Escola
De **Planes Bones:** els jugadors van descobrir que hi havia llum a l'escola a las onze de la nit del dia que es va escriure l'esborrany. El mestre d'escola (Bernat) estava allà escrivint la carta, no dormint a casa.

### Dos Càntirs per a l'Escola
De **Font del Ferro:** el dia 12, l'escolà va portar dos càntirs (no un). Perquè? Per tenir prou tinta per dues cartes: l'original falsificada i la que Bernat escriuria.

### Full de Cal·ligrafia
Desbloqueig en jog 6: l'escola és on els nens aprenen de lletra copiant noms del registre de difunts. Els mateixos noms que apareixen malament a la signatura de la carta. Bernat tenia accés a aquests exercicis i al registre.

---

## Objectiu del Joc

El Gir és la transició entre investigació i acció. Els jugadors passen de recopilar peces a **fer una decisió definitiva**. L'acusació de Bernat obreix el camí cap a la caixa de les almoines i el finale.

