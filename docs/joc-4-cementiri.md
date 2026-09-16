# Joc 4: Cementiri — La Signatura del Difunt

**Estació:** Cementiri exterior (41.912593, 2.227438)  
**Joc:** Comparar escriptures  
**Acte:** I — La investigació  
**Durada:** 7 min + 14 min total  
**Dificultat:** 2/5  

---

## Narrativa

El fragment copiat de la carta va signat amb el nom d'un home mort fa anys. Només qui té accés al **registre de difunts** podia conèixer aquell nom i aquells detalls específics.

Els jugadors han d'identificar la làpida de la qual es va copiar el nom, i llavors descobrir qui tenia accés al registre.

---

## Context Físic

**Ubicació:** Exterior cementiri, cartell fora de reixa  
**Cartell:** A3 amb 3 làpides fictícies numerades (no tombes reals)

---

## Pantalla 0: Títol + Menú

```
CEMENTIRI
════════════════════
La Signatura del Difunt

[1] INTRODUCCIÓ
[2] LÀPIDES
[3] REGISTRE
[4] EL JOC
```

---

## Pantalla 1: Introducció

```
"La carta va signada amb el nom d'un mort 
fa sis anys. Només qui consulta el registre 
de difunts podia saber aquell nom."
```

---

## Pantalla 2: Làpides

Mostra les 3 làpides del cartell físic (amb errades del picapedrer).

---

## Pantalla 3: Registre

Mostra els tres enterraments amb noms ben escrits (signats per l'Escolà).

---

## Pantalla 4: El Joc

**Pregunta:** "De quina làpida va copiar el nom el traïdor?"  
**Selector:** Número de làpida (1, 2 o 3)

---

## Solucions per Variant

| Variant | Signatura Esborrany | Làpida (errada) | Registre (correcte) | Descartada |
|---------|-------------------|-----------------|------------------|-----------|
| A | Joseph Corminas | Corminas (1698) | Joseph Coromines | Anton |
| B | Maria Sarrat | Sarrat (1701) | Maria Serrat | Anton |
| C | Antoni Puch | Puch (1695) | Antoni Puig | Anton |

**Lògica:** La signatura porta la mateixa errada que la làpida. L'Escolà sabria el nom correcte (ell va escriure al registre).

---

## Pantalla 7A: Correcte ✅

```
✓ CORRECTE!

Fragment de la carta signat: [SIGNATURA]
Va copiar de la làpida [N°]

Però el registre parroquial diu [NOM CORRECTE]

L'Escolà sabe el nom correcte perquè ell va 
escriure el registre.

XIFRA: PEDRA = 1

+100 punts
Evidència: "Fragment de la carta i làpides"

[El gir es dona al Pla de Masset: 
l'Anton arriba amb noticia que el rector 
ha estat ferit → innocènt]
```

---

## Pistes

| Nivell | Cost | Text |
|--------|------|------|
| 1 | 0 | "Compareu lletra per lletra." |
| 2 | −2 | "Qui sabia com s'escrivia de debò?" |
| 3 | −5 | "Làpida [N°]. Només l'Escolà i el Rector hi accés." |

---

## Evidència Desbloqueïda

**ID:** `evidence_tombstone`

> **Fragment de la carta i Làpides del cementiri**
>
> Signatura: [Variant]  
> Dades: "pagès de la Guixa, vidu..."
>
> **Làpides (errades del picapedrer)** vs **Registre (correcte)**
>
> Conclusions: El traïdor va copiar la làpida. Només l'Escolà 
> i el Rector tenien accés al registre.

---

## Checklist de Sessió

- [ ] Cartell fora reixa (sense tocar tombes reals)
- [ ] Permís Ajuntament i parròquia confirmats
- [ ] QR intacte
- [ ] Variant activada

