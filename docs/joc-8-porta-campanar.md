# Joc 8: Porta del Campanar — Engany i Tracte

**Ubicació:** Porta del Campanar (al costat Rectoria, darrera Església)  
**Joc:** Rol de negociació + decisió moral  
**Acte:** III — L'alba  
**Durada:** 3–4 min  
**Dificultat:** 2/5  

---

## Narrativa

Els jugadors es presenten com a enviats del Mestre, diuen la contrasenya i lliuren la carta falsa a l'Emissari.

L'Emissari examina el segell. Si és correcte, se la queda.

Just després, arriba la veu de Bernat oferint un tracte: sap per on vénen els dragons, i els ho diu a canvi que el deixin fugir.

Els jugadors han de decidir: **acceptar o rebutjar el tracte**.

---

## Pantalla 0–2: Títol

```
PORTA DEL CAMPANAR
═══════════════════
Engany i Tracte
```

---

## Pantalla 4: El Joc

**Escena:**

```
L'Emissari: "Ja n'hi ha prou de joc. La carta."

[Els jugadors, silenciosos, lliuren la carta]

L'Emissari: "Contrasenya?"

[Els jugadors reben àudio de l'Emissari a partit]
```

---

## Validació Servidor

| Resposta | Resultat |
|----------|----------|
| Contrasenya correcta + Segell A | ✓ "Està bé. Ja l'ha tocada massa gent." S'aparta. |
| Error | ✗ "Aquest segell no és el seu. +2 min. Torneu a provar." |

---

## Pantalla 4B: El Tracte

**Arriba àudio de Bernat:**

```
"Sé per on vénen els dragons. 
Us ho dic si em deixeu anar 
a buscar el meu fill. 

Vosaltres què hauríeu fet?"

[COMPTE ENRERE: 60 SEGONS]
```

---

## Decisió

```
Opció A: ACCEPTAR (sem penalització)
Opció B: REBUTJAR (+3 min)

[Timeout → compta com B]
```

---

## Resultat

| Decisió | Efecte |
|---------|--------|
| **A — Acceptar** | Webapp mostra camí dels dragons. Camí segur pels conjurats. Final A. |
| **B — Rebutjar** | +3 min. Conjurats se'n surten pels pèls. Final B. |

---

## Dades Capturades

- `decision` (A o B)
- `response_time` (per desempat)
- Activa Joc 9 (Campanar)

---

## Prerequisit

- Joc 7 correcte (segell A)
- Contrasenya memorializada: "L'alba ve de Vic"

---

## Nota Narrativa

Cap dels dos finals puntua més. **És decisió moral.**

Epíleg:
- **A:** Bernat i Jaume reunits (tardor). No torna a Guixa.
- **B:** Jaume busca el pare a l'escola, no el troba.
