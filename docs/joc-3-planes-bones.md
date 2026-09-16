# Joc 3: Planes Bones — La Ronda de la Patrulla

**Estació:** Planes Bones (42.912311, 2.233423)  
**Joc:** Mapa de camins + càlcul de temps  
**Acte:** I — La investigació  
**Durada:** 10 min + 17 min total  
**Dificultat:** 3–4/5  

---

## Narrativa

El ferrer diu que la nit de l'esborrany era al Mas de l'Om ferrant un cavall. Un pagès que vetllava el sembrat el va veure passant per la cruïlla tornant cap a casa a determinada hora.

Els jugadors han de calcular: **si hagués passat pel poble per escriure l'esborrany i amagar-lo (mitja hora), a quina hora hauria arribat a la cruïlla?**

Si la seva resposta no coincideix amb l'hora que el pagès va veure passar, el ferrer té coartada.

---

## Context Físic

**Ubicació:** Encreuament de camins de Planes Bones  
**Cartells:** A2 plastificat (mapa 4×4 amb trams i temps)

**Ambientació:**
- Mapa esquemàtic del terme (quadrícula 4×4 amb lloc noms)
- Taula de "quarts d'hora" (temps de pas entre trams)
- Avís dels Jurats: "El gual no es passa" (trampa plantada)

---

## Pantalla 0: Títol + Menú

```
Planes Bones
═══════════════════
La Ronda de la Patrulla

[1] INTRODUCCIÓ
[2] CARTELL
[3] AVÍS DELS JURATS
[4] EL JOC
```

---

## Pantalla 1: Introducció

```
"El traginer va espiar la ronda de la patrulla 
des del paller i en va memoritzar les regles.

La nit del 15, a les onze, on era la patrulla?"
```

---

## Pantalla 2: Cartell

Mapa 4×4 quadrícula amb noms (Molí, Farga, Escola, etc.)  
Taula de quarts entre trams.

---

## Pantalla 3: Avís dels Jurats

```
"La riera va crescuda: el gual no es passa.
Qui travessi els blats a punt de segar pagarà
el mal fet: de nit no hi passa ningú."
```

---

## Pantalla 4: El Joc

**Pregunta:** "Si el ferrer va plegar a [X], i el pagès el va veure a cruïlla a [Y], i va emplear mitja hora a casa, a quina hora hauria arribat a cruïlla com a molt aviat?"

**Selector:** Hora (en quarts: "un quart de trois", "02:15", etc.)

---

## Solucions per Variant

| Variant | Plega | Es veu a cruïlla | Resposta correcta | Descartat |
|---------|-------|-----------------|------------------|-----------|
| A | 23:00 | 01:30 | 02:15 (tarda) | Isidre |
| B | 22:00 | 00:30 | 01:15 (tarda) | Isidre |
| C | 00:00 | 02:30 | 03:15 (tarda) | Isidre |

**La trampa:** Passant pels blats (Mas → Blat → Guixa = 4 quarts) suma exactament al temps esperat. Cal rellegir l'avís.

---

## Pantalla 7A: Correcte ✅

```
✓ CORRECTE!

Si el ferrer hagués passat pel poble:
- Mas de l'Om → Pont Vell → La Guixa (7 quarts)
- + mitja hora a casa (2 quarts)
- + Guixa → Cruïlla (4 quarts)
= 13 quarts = 3 h 15 min TARD

ISIDRE el ferrer TIENE COARTADA
La patrulla el va veure a la farga a les onze.
✓ DESCARTAT

XIFRA: TERRA = 3 (casella de la farga)

+100 punts
Evidència: "Ruta de la patrulla"
```

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "No tots els camins es poden fer aquella nit." |
| 2 | −2 | "Descarteu el gual i els blats, i no us oblideu de la mitja hora a casa." |
| 3 | −5 | "A les onze era a la farga. Isidre té coartada. TERRA = 3." |

---

## Evidència Desbloqueïda

**ID:** `evidence_patrol_route`  
**Nom:** Ruta de la patrulla nocturna

> **Registre de la Patrulla de Nit**  
> Planes Bones · 15 de maig de 1705
>
> La patrulla surt de la Plaça cada nit a les deu. Avança cada quart d'hora un tram nou, mai diagonal, evitant bosc, riera i cementiri.
>
> **Hora crítica: 23:00 (les onze)**  
> La patrulla es trobava davant la farga, on Isidre el ferrer estava treballant. Coartada verificada.

---

## Dades Capturades

| Campo | Ejemplo |
|-------|---------|
| `discovered_at` | 12:34:56 |
| `solved_at` | 12:44:30 |
| `duration` | 10 min |
| `attempts` | 2 |

---

## Checklist de Sessió

- [ ] Cartell visible (lluerna de mòbil a nit)
- [ ] Taula de quarts clara
- [ ] Webapp offline precarregada
- [ ] Variant activada (A/B/C)
- [ ] Rellotge sincronitzat

