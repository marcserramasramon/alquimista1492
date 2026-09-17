# PLANTILLA: MASTER STYLE ASSET
## Sistema d'Coherència Visual — El Traïdor de la Guixa

**Versió:** 2.0 | **Data:** 17 de setembre de 2026

---

## PREFACI: ADN Visual del Joc

El **Master Style Asset** és una imatge-referència que fixa l'identitat visual de tot el joc:
- ✓ Escenari neutro (sense protagonistes, sense pistes editables)
- ✓ Paleta de colors coherent (medieval 1705, Osona rural)
- ✓ Tractament de llum consistent (dia/nit/clarobscur)
- ✓ Textures materials (fusta, pedra, ferreria, pergamí)
- ✓ Estil òptic (fotografia de gravat medieval, no 3D sintètic)

**Ús posterior:** Aquesta imatge serveix de **referència visual (--sref en Midjourney)** o d'inspiració per a totes les altres imatges del joc (cartells, items, documents). Assegura coherència sense repetició.

---

## I. PLANTILLA ESTRUCTURADA

```json
{
  "_meta": {
    "identificador_master": "MASTER_STYLE_[ESCENA]_[ACTE]",
    "tipus_escena": "[Nocturna Medieval | Diurna Rural | Clarobscur Narratiu]",
    "acte_associat": "[Acte I: Investigació | Acte II: Traïció | Acte III: Alba]",
    "prioritat": "CRÍTICA",
    "data_creació": "2026-09-17"
  },

  "objectiu_i_principis": {
    "objectiu_principal": "Fixar l'ADN visual, paleta cromàtica, textures i tractament òptic per a totes les imatges derivades",
    "principis": [
      "Medieval autèntic (1705, Osona): sense elements moderns, sense anacronismes",
      "Neutralitat narrativa: espai buit sense objectes resolubels; permet que pistes puntuals destaquin",
      "Coherència entre física (cartells A2) i webapp: paleta idèntica, llum compatible",
      "Estil gravat/aquarel·la medieval: mai fotografia moderna, never sintètic 3D",
      "Llegibilitat garantida: contrast alt per a pistes editables; context suportant sense distreure"
    ]
  },

  "escenari_neutre": {
    "tipus_espai": "[Describir un espai arquitectònic medieval buit, sense objectes de resolució]",
    "exemples": [
      "Rectoria rural: habitació sencera, finestres amb llum natural, parets de pedra bruta",
      "Cementiri de nit: camposant amb làpides, cruces de fusta, arbres nus, sense figures",
      "Plaça de poble de dia: empedrat, casetes al fons desfocades, claustre o arqueria",
      "Serrat nocturn: turons silhuetats, cel estrellat, sense fogueres protagonistes"
    ],
    "estat_arquitectonic": "[Medieval tardà, XVI–XVII, rural català: conservat però gastable per l'edat, sense tecnologia moderna]",
    "elements_estructurals": "[Paredes de pedra/fusta, portes de fusta pesada, finestres petites, sostre de teula, terra de terra/empedrat, canonades de ferro]",
    "absencies_clau": "[NO: cadires, taules, lits, persones, animals, text legible, objectes de primera pla resoluble, portes obertes mostrant interior mysterious]"
  },

  "materialitat_i_superficies": {
    "materials_dominants": [
      {
        "material": "Pedra medieval",
        "acabat": "Porosa, desgastada per la pols i la pluja, líquens verds discrets",
        "color_base": "#8B7D6B (gris terrós medieval)"
      },
      {
        "material": "Fusta de roure envellida",
        "acabat": "Fosc, amb textura visible (anells), crackles subtils, sense vernish",
        "color_base": "#4A3728 (marró medieval fosc)"
      },
      {
        "material": "Ferro forjat / Ferreria",
        "acabat": "Oxidació lleugera (patina), però no rovellat massiu; detalls visibles",
        "color_base": "#5C5C5C (gris acerat envellat)"
      },
      {
        "material": "Terra / Sòl",
        "acabat": "Terrissa compactada, herba baixa, mullada (rosada matinal) o pols seca (estiu)",
        "color_base": "#7A6F63 (ocre clar)"
      }
    ]
  },

  "disseny_de_llum": {
    "escenes_possibles": {
      "nocturna_medieval": {
        "fonts_llum": "Lluna (partial), fogueres llunyanes (warm glow), possiblement fanal amb oli",
        "qualitat": "Clarobscur dramàtic: zones molt negres + punts de llum càlida (or ambre)",
        "temperatura": "Càlida extrema (1500–2000K): flames, oli, cera",
        "volum_atmosferic": "Boira lleugera, partícules de fum visible en claror de lluma, ombres allargades",
        "contrast": "Alt (negre intens vs or brillant)",
        "sensació": "Misteriosa, sinistre, medieval autentic"
      },
      "diurna_rural": {
        "fonts_llum": "Sol directe (matutí suau o hivernal fort)",
        "qualitat": "Difusa a moderada; ombres definides però no extremes",
        "temperatura": "Natural (5000–6500K); lleugerment càlida si matutí (3500–4500K)",
        "volum_atmosferic": "Pols flotant en claror matinal, sense boira; aire clar",
        "contrast": "Moderat; llum i ombra equilibrades",
        "sensació": "Tranquil·la, investigativa, seguretat relativa"
      },
      "clarobscur_narratiu": {
        "fonts_llum": "Combinació: alba freda + claror residual de nit (últim moment de tensió)",
        "qualitat": "Transició: fosc convertint-se en clar, ombres retrocedint",
        "temperatura": "Freda inicial (5500K) + càlida residual (1500K mix)",
        "volum_atmosferic": "Boira/vapor que es dissipa, vapor tèrmic de nit",
        "contrast": "Variable: creixent amb claror",
        "sensació": "Urgència, decisió irreversible, epíleg apocalíptic"
      }
    },
    "principi_unificador": "NUNCA sobresaturació ni colors neon. Els colors deriven de fonts naturals (foc, lluma, sol medieval)."
  },

  "paleta_cromatica_global": {
    "principis": "Derivada de la webapp + materials medievals. Sense gris «neutre» digital; tots els grises són calidats medievals (ocre gris, oxid).",
    "colors_base": [
      {
        "nom": "Beige Pergamí",
        "hex": "#F5E6D3",
        "ús": "Fons sky diurn, paredes interiors llum natural",
        "nota": "Llum matinal reflectida en paredes blancoses"
      },
      {
        "nom": "Or Vell Medieval",
        "hex": "#D4AF37",
        "ús": "Fogueres, punts de llum nocturn, reflectes en metall",
        "nota": "SEMPRE present a nit; símbol de foc/autoritat"
      },
      {
        "nom": "Marró Medieval Fosc",
        "hex": "#4A3728",
        "ús": "Fusta, ombres, textura de parets",
        "nota": "Color neutral medieval, no moderne gris"
      },
      {
        "nom": "Negre Carbó",
        "hex": "#1a1a1a",
        "ús": "Ombres extremes nocturnes, siluetes",
        "nota": "Nit profunda, no gris; clasesobro clar definit"
      },
      {
        "nom": "Verd Oliva Medieval",
        "hex": "#6B8E23",
        "ús": "Vegetació (herba, líquens), punts de vida natural",
        "nota": "Discret, mai dominant; mostra desgast/antiguitat"
      },
      {
        "nom": "Siena Vermell",
        "hex": "#A0522D",
        "ús": "Teula de sostre, accent de perill/traïció",
        "nota": "Molt discret; mai clamant"
      },
      {
        "nom": "Gris Medieval (Patina Ferro)",
        "hex": "#5C5C5C",
        "ús": "Metall envellit, pedra seca",
        "nota": "No és gris «pur»; té tonalitat òxid/cendrosa"
      }
    ],
    "mapa_tonal": {
      "nocturna": "Negre carbó + Or vell + Marró medieval (sombres)",
      "diurna": "Beige pergamí + Marró medieval + Verd oliva + Siena accent",
      "clarobscur": "Gradació: Negre → Beige; Or residual + Verd alba"
    },
    "principi_dessaturació": "Tots els colors un 15–20% dessaturats vs real medieval; evitar posteritat moderna sense perdre calidesa"
  },

  "parametres_optics_i_camera": {
    "tipus_enquadrament": [
      "Pla general (wide-angle equivalent)",
      "Angle eye-level o lleugerament baix (no picat ni contrapicada)",
      "Perspectiva central (punt de fuga marcat) o frontal (simètric medieval)"
    ],
    "lent_i_profunditat": {
      "lent_equivalent": "35mm o 50mm (perspectiva humana natural, no distorsió gran angular)",
      "diafragma": "f/4 o f/5.6 (nitidesa moderada: primer pla nítid, fons visible pero suaument desenfocat)",
      "profunditat_de_camp": "Mitja: permet context sense distreure pista futura en primer pla"
    },
    "textura_imatge": [
      "Gravat medieval o aquarel·la antica (NO fotografia realista moderna)",
      "Gra subtil de pel·lícula analògica (16mm o 35mm cinema envellit)",
      "Acabat fotogràfic «cru» (raw): sense filters, sense saturació artificial",
      "Línies no perfectes: xancletes de gravat manual, pinzellada aquarel·la visible"
    ],
    "movement_i_energia": "Static, tranquil (no motion blur); permet que pistes posterior siguin dinàmiques si cal"
  },

  "clausules_d_exclusio_absoluta": {
    "never_ever": [
      "Persones, cares, mans, figures humanoïdes (silhuetes d'arbres sí, figures vagues sí, però NO rostre definit)",
      "Text llegible, números, rètols moderns (llettering medieval decoratiu sense semàntica sí)",
      "Pistes de trencaclosques visibles (claus, cartes, objectes de resolució)",
      "Estètica cartoon, illustració simplificada o comic",
      "Render 3D sintètic, CGI evident (pot ser 3D foto-realista si la textura medieval és perfecta)",
      "Filtres moderns, efectes cyberpunk, neon, saturació excessiva",
      "Tecnologia post-1800: llamps, canonades metàl·liques modernes, vidre transparent clar, plastic",
      "Animals (gats, parets, ocells): medieval wildlife OK; mascotes fantasy NO",
      "Atmosfera fantasia-dark-fantasy: evitar demoníac/gòtic excessiu; mantenir històrica"
    ],
    "requeriments_positius": [
      "Autenticitat medieval verifiable (arquitectura, materials, llum natural només)",
      "Atmosfera que convida a investigació sense terror extremo",
      "Compatibilitat amb la paleta webapp (colors reconeixables, no aliens)",
      "Contrast suficient per a que pistes editables destacin clarament quan posicioned"
    ]
  },

  "validacio_coherencia": {
    "test_paleta": "Comparar color dominants vs webapp (#F5E6D3, #D4AF37, #4A3728). Match >80%? ✓",
    "test_texture": "Material medieval visible? Pedra/fusta/ferro envellida? ✓",
    "test_llum": "Coherent amb Acte? Nocturn = or+negre, Diurn = beige+marró, Clarobscur = gradació? ✓",
    "test_neutralitat": "Espai sense protagonistes editables? Permès que future pista brilli? ✓",
    "test_estil": "Gravat/aquarel·la medieval visible? Zero 3D sintètic? ✓",
    "test_accessibilitat": "Contrast WCAG suficient? Text futur serà llegible? ✓"
  },

  "metadades_per_motor_IA": {
    "motor_recomanat": "[Midjourney v6 | Flux pro | Stable Diffusion XL]",
    "sref_key": "[Si es genera amb Midjourney, guardar `--sref [URL]` per totes les imatges derivades]",
    "parametres_midjourney": "--ar 16:9 --niji 6 --stylize 200 --quality 2",
    "parametres_flux": "[specs if using Flux]",
    "seed_replicabilitat": "[Opcional: fixar seed per a iteracions]"
  }
}
```

---

## II. VARIANTS DE MASTER STYLE (Per Acte / Escena)

### A) Master Style — Acte I (Investigació Diurna)

```
Identificador: MASTER_STYLE_ACT1_DIURNA

Escenari: 
  Plaça de poble medieval de dia, amb claror matinal. Sense persones.
  Paredes de cases baixes al fons (desfocades), terra de terra compactada,
  petit claustre de fusta o cruz de pedra al centre (sense signatura religiosa cridanera).

Materials: Pedra llisa medieval, fusta marró, terra ocre, herba baixa verda.

Llum: 
  Matinal freda (5500K), rajos solars laterals que creen ombres nítides però no dures.
  Pols flotant en la claror (partícules visibles, medieval realisti).

Paleta Dominant: 
  Beige pergamí (cel i parets clares) + Marró medieval (ombres) + Verd oliva (herba).
  Contrast moderat (no clarobscur).

Atmosfera: Seguretat relativa, calma investigativa, misteriosa però no menaçadora.

Negative: Persones, nits, fogueres, text, pistes resolubles.
```

### B) Master Style — Acte II (Traïció Nocturna)

```
Identificador: MASTER_STYLE_ACT2_NOCTURNA

Escenari:
  Serrat o plaça de nit. Lluna partial visible. Silhuetes de turons o casetes.
  Sense figures humanes; possiblement ombra d'arbre.

Materials: Pedra seca, fusta fosc, terra humida (rosada), atmosfera boirosa.

Llum:
  Clarobscur clamorós: lluna + residual fanal llunyà o foguera distanta.
  Ombres profundes de negre carbó; punts de or ambre (residual del foc medieval).
  Boira lleugera, partícules de fum visible.

Paleta Dominant:
  Negre carbó (ombres) + Or vell (fogueres llunyanes) + Gris ferro (metall envellit).
  Contrast extrem (negre intens vs or brillant).

Atmosfera: Misteriosa, tensa, perillos, revelatoria de traïció.

Negative: Persones, text, pistes resolubles, colors moderns, neon.
```

### C) Master Style — Acte III (Alba / Clarobscur Narratiu)

```
Identificador: MASTER_STYLE_ACT3_ALBA

Escenari:
  Transició nit-dia: claror alba incipient al horitzó (no sortida completa).
  Cementiri o rectoria: estructura medieval visible però en transició de llum.
  Sense figures; possiblement vell arbre nu.

Materials: Pedra grisacea (alba freda), fusta negra (ombra residual), vapor tèrmic visible.

Llum:
  Transició: negre carbó convertint en beige alba. Ombres retrocedint.
  Vapor/boira que es dissipa, textura de fin d'alba (30 min pre-sortida sol).
  Color mixed: freda inicial (5500K) + residual calor nit (1500K).

Paleta Dominant:
  Gradació: Negre → Gris → Beige. Or vell residual en ombres.
  Contrast variable: creixent cap a claror.

Atmosfera: Urgència, decisió irreversible, epíleg (batalla moral imminent).

Negative: Persones, text, daylight full, nit completa, pistes editables.
```

---

## III. CHECKLIST DE VALIDACIÓ (Master Style)

Per cada Master Style generada, validar:

- [ ] **Narratiu:** Coherent amb Acte i escenari medieval
- [ ] **Material:** Pedra/fusta/ferro medieval visible; sense plastic, vidre modern, metal sintètic
- [ ] **Llum:** 
  - [ ] Nocturna: or + negre carbó dominant
  - [ ] Diurna: beige + marró moderat, sense contrast extrem
  - [ ] Alba: gradació negre→beige, freda→càlida
- [ ] **Paleta:** Els 4–5 colors de la llista dins ±10% hex; dessaturació medieval visible
- [ ] **Òptica:** Gravat/aquarel·la medieval; zero 3D sintètic, zero fotografia moderna
- [ ] **Neutralitat:** Espai buit sense protagonistes; futura pista pot destacar
- [ ] **Exclusions:** ZERO persones, text, pistes, animals, teknologia >1800, neon, cartoon
- [ ] **Escala Medieval:** Arquitectura verifiable (XVI–XVII), sense anacronismes
- [ ] **Accessibilitat:** Contrast > WCAG AA; si es col·loca text, serà llegible

---

## IV. WORKFLOW DE PRODUCCIÓ

### Pas 1: Definir Variants (5 min)
1. Master Style Nocturna (Acte II)
2. Master Style Diurna (Acte I)
3. Master Style Alba (Acte III)

**Per què 3?** Cada Acte té tonalitat diferent; una single Master Style no cobreix la varietat.

### Pas 2: Omplir Plantilla (15 min per variant)
- Escenari neutre específic (plaça, serrat, rectoria?)
- Materials medievals concrets
- Llum: fonts, temperatura, contrast
- Paleta: 4–5 colors claus

### Pas 3: Generar (30–60 min)
- **Midjourney:** `--sref [master-URL] --ar 16:9 --niji 6 --stylize 200`
- **Flux:** [Paràmetres Flux]
- **Stable Diffusion:** [Paràmetres SD]

### Pas 4: Validar Checklist (10 min)
- ✓ Totes 10 validacions
- Si **falla alguna**, redactar nou prompt + reiterar

### Pas 5: Guardar Referència (2 min)
- Guardar URL de `--sref` (Midjourney) o imatge (altres motors)
- Documentar a **MASTER_STYLE_CACHE.md** per a totes les derivades

### Pas 6: Crear Imatges Derivades (Continu)
- Per cada imatge de la **LLISTA_IMATGES_COMPLETA**, usar `--sref [master-style]`
- Assegura coherència visual sense repetició

---

## V. TEMPLATE COMPACT (per copiar-pegar)

```markdown
### MASTER_STYLE_[ACTE]_[ESCENA]

**Identificador:** MASTER_STYLE_ACT[1/2/3]_[NOCTURN/DIURN/ALBA]

**Acte:** [I / II / III]

**Escenari Neutre:**
- [Descripció concreta d'espai medieval buit, sense protagonistes]

**Materials Medievals:**
1. [Material 1: Pedra] — [acabat] — [color]
2. [Material 2: Fusta] — [acabat] — [color]
3. [Material 3: Ferro] — [acabat] — [color]
4. [Material 4: Terra/Natura] — [acabat] — [color]

**Llum:**
- Font: [Lluna / Sol / Foguera / Mix]
- Qualitat: [Clarobscur / Difusa / Transició]
- Temperatura: [Càlida / Freda / Mix]
- Atmosfera: [Boira / Pols / Vapor / Clara]

**Paleta Cromàtica:**
- Dominant 1: [Color] (#HEX)
- Dominant 2: [Color] (#HEX)
- Accent 1: [Color] (#HEX)
- (Mapa tonal: [Resum gradació])

**Òptica:**
- Enquadrament: [Pla general / Eye-level]
- Lent: [35mm / 50mm]
- Diafragma: [f/4 o f/5.6]
- Estil: [Gravat medieval / Aquarel·la / Fotografia analògica]

**Exclusions Estrictes:**
- NO: [llista de coses prohibides]

**Validació:**
- [ ] Material medieval ✓
- [ ] Llum coherent ✓
- [ ] Paleta ±10% hex ✓
- [ ] Neutral (sense protagonistes) ✓
- [ ] Zero 3D sintètic ✓
```

---

## VI. EXEMPLE COMPLET (Nocturna, Acte II)

```json
{
  "_meta": {
    "identificador_master": "MASTER_STYLE_ACT2_NOCTURNA_SERRAT",
    "tipus_escena": "Nocturna Medieval",
    "acte_associat": "Acte II: La Traïció",
    "prioritat": "CRÍTICA",
    "data_creació": "2026-09-17"
  },

  "objectiu_i_principis": {
    "objectiu_principal": "Fixar estil nocturn medieval per Acte II (clarobscur dramàtic, revelatoria de traïció)",
    "principis": [
      "Medieval 1705, Osona: fogueres naturals, lluma parcial, sense electric",
      "Neutralitat: Serrat buit sense figures ni pistes",
      "Coherència webapp: Or vell + Negre carbó dominant",
      "Gravat nocturn autentic, no gothic-fantasy",
      "Contrast extrem per a drama sense terror"
    ]
  },

  "escenari_neutre": {
    "tipus_espai": "Serrat de turó, nit medieval. Lluna partial visible. Silhuetes de turons al horitzó. Sense persones, sense fogueres protagonistes, sense edificis.",
    "estat_arquitectonic": "Natural medieval: terra seca, arbres nus (tardor/hivern), pedra bruta de camins.",
    "elements_estructurals": "[Roca natural, terra compactada, herba baixa seca, arbres nus com a silhuetes, possiblement creu de fusta en lany distancia]",
    "absencies_clau": "NO: figures humanes, fogueres grans en primer pla, text, pistes resolubles"
  },

  "materialitat_i_superficies": {
    "materials_dominants": [
      {
        "material": "Roca Natural / Pedra Serrat",
        "acabat": "Bruta, agrietada per erosió, sense pulir",
        "color_base": "#5C5C5C (gris ferro envellat)"
      },
      {
        "material": "Herba Seca Medieval",
        "acabat": "Compactada, sense irigo, amb rosada nocturna",
        "color_base": "#6B8E23 (verd oliva mort)"
      },
      {
        "material": "Arbres Nus",
        "acabat": "Fusta fosc, sense fullatge, branches visibles",
        "color_base": "#4A3728 (marró medieval fosc)"
      }
    ]
  },

  "disseny_de_llum": {
    "escena_nocturna": {
      "fonts_llum": "Lluna (50% visible), residual calor de foguera distanta al poble (llunyà, difusa), estels si cel clar",
      "qualitat": "Clarobscur dramàtic: turons principal en silhueta negre; claror lunar palida en cims; residual or ambre al horitzó (poble)",
      "temperatura": "Freda lunar (6000K) + càlida residual foc (1500–2000K) al fons",
      "volum_atmosferic": "Boira nocturna lleugera, partícules de vapor, ombres allargades des de lluna baxa",
      "contrast": "EXTREM: negre carbó (turons) vs or pàl·lid (claror lunar + foc residual)"
    }
  },

  "paleta_cromatica_global": {
    "mapa_nocturna": "Negre carbó + Or vell (fons) + Gris ferro (media tones)",
    "colors_base": [
      {"nom": "Negre Carbó", "hex": "#1a1a1a", "ús": "Turons silhueta, ombres profundes"},
      {"nom": "Or Vell Medieval", "hex": "#D4AF37", "ús": "Claror lunar pàl·lida, residual foc"},
      {"nom": "Gris Ferro", "hex": "#5C5C5C", "ús": "Mitja tons, roca natural"},
      {"nom": "Marró Medieval", "hex": "#4A3728", "ús": "Arbres, textura terra"}
    ]
  },

  "parametres_optics_i_camera": {
    "tipus_enquadrament": "Pla general (wide), angle baix (observer mira cap a turó o cel)",
    "lent_equivalent": "35mm (perspectiva natural nocturna)",
    "diafragma": "f/2.8 o f/2.0 (aper ampla per a captació nocturna)",
    "textura_imatge": "Gravat nocturn medieval (Dürer, gravats de 'Melancholia'), textura analògica envellida, gra de pel·lícula"
  },

  "clausules_d_exclusio_absoluta": {
    "never_ever": [
      "Figures humanes, cares, mans",
      "Text llegible, rètols, números",
      "Fogueres grans en primer pla (residual OK)",
      "Render 3D, efectes moderns, neon",
      "Atmosfera gothic-dark-fantasy (medieval realista només)",
      "Animals con expressió (silhuetes d'arbres sí)"
    ]
  },

  "validacio_coherencia": {
    "test_paleta": "Negre (#1a1a1a) + Or (#D4AF37) + Gris (#5C5C5C) visible? ✓",
    "test_llum": "Clarobscur nocturn amb or ambre residual? ✓",
    "test_neutralitat": "Espai buit sense pista? ✓",
    "test_estil": "Gravat medieval visible, zero 3D? ✓"
  }
}
```

---

## VII. VALIDACIÓ DE COHERÈNCIA FINAL

**Una vegada creades les 3 Master Styles (Diurna, Nocturna, Alba):**

```
Test de Coherència Creuada:

1. Paleta: Els 7 colors base apareixen en les 3 escenes? (mapa tonal diferent OK)
2. Material: Pedra/fusta/ferro/terra medieval? Same materials in all 3? ✓
3. Llum: Transició coherent? Diurn → Nocturn (shift or) / Nocturn → Alba (shift beige)? ✓
4. Estil: Gravat/aquarel·la medieval consistent? Zero salts a 3D o fotografia? ✓
5. Neutralitat: Les 3 són espais buits sense protagonistes? ✓
6. Escalabilitat: Pista futura (pla detall primer pla) mantindrà coherència? ✓
```

---

## VIII. RECURSOS I INSPIRACIÓ

### Gravats Medievals Nocturn Referencials
- Albrecht Dürer: "Melancholia" (1514) — clarobscur, contrast negre/blanc, simbolisme medieval
- Lucas Cranach: gravats landscapes (XVI) — fusta, rocamboles, llum natural
- Pieter Bruegel: "Night Scenes" — vida rural medieval de nit

### Aquarel·les Medievals Referencials
- John Singer Sargent: treballs d'arquitectura medieval
- N.C. Wyeth: landscapes rurals (stil medieval-inspired)
- Frederic Remington: nocturnes de lloc (western però medievalitzable)

### Cartografia Medieval Nocturna
- Waldseemüller (1507) — estil de fonts lumíes en mapas
- Ortelius — representacions de llum natural en cartografia XVI

### Paleta Online Reference
- [Coolors.co](https://coolors.co) — medieval palette template
- [Adobe Color](https://color.adobe.com) — explore medieval pigment colors
- [Pinterest](https://pinterest.com) — búsqueda "medieval night light" + "gravat XVI"

---

## IX. CHECKLIST FINAL: ABANS DE GENERAR

```
☐ Escenari neutre definit (sense objectes resolubels)
☐ 4+ materials medievals clarament listats
☐ Llum: font, temperatura, contrast descrits
☐ 5–7 colors claus dins paleta webapp (#hex verificats)
☐ Estil: gravat/aquarel·la medieval (NO 3D, NO modern photo)
☐ Exclusions: ZERO persones, text, pistes, animals, tecnologia >1800
☐ Validació checklist: 8/8 criteris passats
☐ Motor IA seleccionat (Midjourney / Flux / SD)
☐ Paràmetres motor definits (--ar, --stylize, --quality, etc.)
☐ Prompt final redactat (natural language, 200–400 paraules)
☐ Seed (opcional) fixat per replicabilitat
```

---

**Darrera actualització:** 17 de setembre de 2026  
**Responsable:** Coherència visual Master-to-Derivative  
**Próxim pas:** Generar les 3 Master Styles (Diurna, Nocturna, Alba)
