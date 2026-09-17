# CARTELL-05 — Pla del Masset: Control de l'Emissari

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | cartell-05-pla-masset |
| **Categoria** | Cartell Físic A3 |
| **Acte** | II — La Traïció |
| **Estació** | Pla del Masset |
| **Rol en Gameplay** | Rol Social + Document Actor |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 3:4 (portrait) |
| **Dimensions** | 297×420 mm (A3) — cartell petit, portable |
| **DPI** | 300 (impressió) |
| **Format** | JPG color |
| **Laminat** | Sí, mate (protecció humitat, portabilitat) |
| **Ús** | Físic (l'Emissari porta el cartell o fixa vora seu) |
| **Comportament Web** | N/A (no es renderitza webapp, peça de rol social) |
| **Confidencialitat** | Part de les instruccions és PER A L'ACTOR NOMÉS |

---

## Descripció Narrativa

**Context:**
L'Emissari és un agent del capità de Vic. La nit del 16 de maig controla el Pla del Masset per evitar moviments no autoritzats. El cartell combina instruccions públiques (títol, context) i privades (per a l'actor: coartada, preguntes, resolució). Els jugadors no han de veure la secció privada, però l'actor sí.

**Contingut del Cartell:**
- **Títol (Públic):** "CONTROL DEL PLA DEL MASSET" (negre bold sobre pergamí)
- **Subtítol (Públic):** "Nit del 16 de maig. L'Emissari, agent del capità de Vic, fa guàrdia. Cap de moviment sense coartada."
- **Secció 1 (Privada per Actor):** Coartada dels jugadors, preguntes suggerides, resolució (sí/no)
- **Secció 2 (Privada per Actor):** Notes de comportament, vestuari recomanat, seguretat
- **Decoració:** Corona reial, símbol de reialesa, espases creuades (autoritat)
- **QR (Webapp):** Accés a joc 6 (pantalla d'acusació)

**Atmosfera:**
Cartell oficial, autoritat, format de document reial. Tinta marró, pergamí crem. Text petit per a l'actor (instruccions detallades), text gran per a jugadors (títol i context). Seguretat i inclusió: no asustar infants, ser generos amb grups familiars.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval Catalan garrison checkpoint placard, 1705. Create an official 
authority notice styled as a royal decree from the Viceroy's garrison 
command at Pla del Masset. 

FRONT/PUBLIC SECTION:
- Large bold header: "CONTROL DEL PLA DEL MASSET" with royal seal (simple crown, not ornate)
- Context line: "Nit del 16 de maig. L'Emissari, agent del capità de Vic, fa guàrdia. Cap de moviment sense coartada."
- Decorative border: medieval crown, garrison symbols, crossed swords (authority)
- Color: aged parchment, brown medieval ink, subtle gold/red accents for authority

PRIVATE/ACTOR SECTION (smaller text, lower half, visually distinct):
- Visible but not immediately obvious: Instructions for the actor playing the Emissary
- Bold text: "COARTADA DELS JUGADORS: 'Anem a buscar la llevadora per a la Marianna de l'Hostal, que està de part.'"
- Suggested questions (checkbox style) for the actor to ask players
- Resolution rules (✓ accept coartada / ✗ confiscate pass but let through)
- Behavior notes: "Autoritat silenciosa, gairebé susurrant"
- Costuming suggestions: "Capa fosca, barret de tres puntes, fanal, arma sense desenvainar"
- Safety warnings: "No agredir físicament, ser generós amb famílies petites, amable amb adolescents"

QR PLACEHOLDER: 5×5 cm, top-right, for webapp unlock (game 6 access).

Visual style: Aged parchment (cream), dark brown ink (serif for official tone). 
Small red accents for warnings/security notes. No digital elements, purely medieval 
official document. Text hierarchy: large for public (title), small for private (actor).

Dimensions: A3 (297×420 mm). Ready for 300 DPI print, matte lamination (weatherproof for outdoor actor).

Negative: modern fonts, photography, people visible, bright colors, digital interface, 
3D rendering, contemporary symbols, corporate design.
```

---

## Paràmetres Midjourney

```
/imagine --ar 3:4 --niji 6 --stylize 200 --quality 2 [PROMPT]
```

**Alternativa amb Master Style Nocturna:**
```
/imagine --ar 3:4 --sref [MASTER_STYLE_NOCTURNA_URL] --niji 6 [PROMPT]
```

---

## Paràmetres Altres Motors

### Flux Pro
```
flux --aspect 3:4 --seed 0 --steps 50 [PROMPT]
```

### Stable Diffusion XL
```
--sampler euler --steps 30 --guidance_scale 7.5 --aspect 3:4 [PROMPT]
```

---

## Comportament en Joc

1. **Físic:** L'Emissari porta el cartell o el fixa vora seu
2. **Rol Social:** Els jugadors arriben al Pla del Masset de nit, l'Emissari els atura
3. **Diàleg:** L'Emissari llegeix les instruccions (públiques + privades) per determinar si els deixa passar
4. **Coartada:** Els jugadors declaren "Anem a buscar la llevadora per a la Marianna de l'Hostal"
5. **Preguntes:** L'Emissari fa preguntes suggeri desdes (qui va, on, quina casa, per què tants)
6. **Resolució:**
   - **Si sustenen la coartada:** "Passeu. I que no us torni a veure."
   - **Si dubten/es contraduu:** "Mentiu malament. Doneu-me un paper." (Perden 1 salconduit, però passen igualment)
7. **Webapp:** Accés a joc 6 (pantalla d'acusació) via QR

---

## Distribució de Contingut

### PÚBLICA (tots veuen)
- Títol: "CONTROL DEL PLA DEL MASSET"
- Context: "Nit del 16, Emissari, guàrdia"
- Decoració: corona, espases
- QR codi (webapp unlock)

### PRIVADA/ACTOR (només l'actor llegeix)
- Coartada dels jugadors
- Preguntes suggerides (checkbox style, flexible)
- Resolució: bé/malament + accions
- Comportament: "autoritat silenciosa, gairebé susurrant"
- Vestuari: capa, barret, fanal, arma sense desenvainar
- Seguretat: NO asustar infants, ser generós, amable, sempre deixar passar

---

## Checklist Validació

**Aspecte i Dimensions:**
- [ ] Aspecte ratio 3:4 (A3 297×420 mm)
- [ ] Resolució 300 DPI
- [ ] Portable (A3 és plegable, cabe dins bossa actor)
- [ ] Text públic llegible des de 1 metre (título, context)
- [ ] Text privat llegible a ~50cm (instruccions actor)

**Visual i Estil:**
- [ ] Pergamí envellit
- [ ] Títol negre bold, oficial
- [ ] Subtítol narratiu clar
- [ ] Secció privada subtilment destacada (text petit, però clara)
- [ ] Corona reial i espases (autoritat, no agressivitat)
- [ ] Coartada en BOLD (actor recordi "Llevadora de la Marianna")
- [ ] Preguntes suggerides amb checkbox (format referència)
- [ ] Resolució clara (sí/no, accions específiques)
- [ ] Comportament: "silenciosa", "susurrant", "silencis llargs"
- [ ] Vestuari visible: capa, barret, fanal, arma

**Contrast i Llegibilitat:**
- [ ] Contrast WCAG AAA (#F5E6D3 beige vs #1a1a1a negre)
- [ ] Títol: 24pt bold, negre
- [ ] Context: 16pt, negre
- [ ] Privada actor: 12pt, negre (llegible però subtil)
- [ ] Coartada: 14pt bold, marcar-la
- [ ] Preguntes: 11pt (referència ràpida)

**Contingut Rol Social:**
- [ ] Coartada dels jugadors clara (llevadora Marianna hostal)
- [ ] Preguntes flexibles (no obligatòries, actor pot improvitzar)
- [ ] Resolució que permet passar sempre (joc col·laboratiu)
- [ ] Tons de comportament: autoritat però no agresió
- [ ] Vestuari: medieval 1705 (capa, barret, fanal, arma)

**Seguretat:**
- [ ] Advertències clares: "No agredir físicament"
- [ ] "Ser generós amb equips familiars petits"
- [ ] "Ser amable amb adolescents que riumeixen"
- [ ] "Final sempre amable: deixar passar l'equip"
- [ ] Arma sense desenvainar (props, sense perill)

**QR Técnic:**
- [ ] QR blanc quadrat, 5×5 cm
- [ ] URL correcta (verificar token joc 6)
- [ ] Contrast QR negre/blanc
- [ ] Ubicació: top-right

**Impressió i Laminat:**
- [ ] JPG color (CMYK per print)
- [ ] Mida archivo: < 8 MB
- [ ] Laminat mate (protecció humitat, exterior)
- [ ] Sense artefactes de compressió

---

## Status Producció

- [ ] **PER_DISSENYAR** ← Estado inicial
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] IMPRÈS I LAMINAT (data: _____)
- [ ] ENTREGAR A L'ACTOR (data: _____)

---

## Notas Addicionals

### Inspiració Artística
- Documents oficials 1700s: decrets reials, edictos de magistrats
- Estil: "format de butifarra", oficial i seriós
- Referència: documents del Viceregnat de Catalunya (arxius)

### Variants
**Una única versió** — igual per a totes les variants.

### Material Físic Recomanat
- Cartó rígid 250gsm (més lleuger, portable)
- Plastificat mate 125 microns
- Format A3 plegat si necessari (cabe dins butxaca actor)
- Rialgó/clip si necessari (treure del borsa ràpidament)

### Distribució i Confidencialitat
1. **Imprimir 2 còpies:** una per usar, una de recanvi
2. **Entregar a l'actor amb PRIVACITAT:** els jugadores NO han de veure les instruccions
3. **Briefing verbal:** revisar amb l'actor dia anterior del joc (redundancia per seguretat)
4. **Guardar después del joc:** retornar cartell a l'organitzador (reutilitzable)

### Comportament de l'Emissari
**Tom de veu:** Autoritat silenciosa. Preguntes directes, sense simpatia al primer.
```
"Alto. Qui va? A aquestes hores no hi ha res bo al carrer."
"Tu, el del vermell! Quiet!"
[Silencis llargs, incòmodos, intencionats — crear tensió teatral]
```

**Resolució amable:** Permet que els jugadors passin sempre, fins i tot si "menteixen". No és antagonista, és actor que crea tensió.

### Cost Estimat
- Impressió A3 300 dpi: €3–5
- Laminat mate: €2–3
- Codi/clip si necessari: €1–2
- **Total per cartell:** €6–10 (× 2 còpies = €12–20)

### Alternativa: Cartell Simple + Briefing Verbal
Si temps limitat: cartell només públic (títol, context) + instruccions privades als actor verbalment + paper de referència (menor risc).

---

## Arxius Relacionats

- `docs/cartells/cartell-05-pla-masset.md` — Especificacions estació/rol
- `GUIA_ASPECTE_RATIOS_MOBIL_v2_SIMPLIFIED.md` — Dimensions
- `PLANTILLA_MASTER_STYLE_ASSET.md` — Coherència visual

---

**Última revisió:** 17 de setembre de 2026  
**Status:** Llist per generar  
**Próxim:** Generar amb Midjourney → Imprimir 2 còpies → Laminat → Briefing actor
