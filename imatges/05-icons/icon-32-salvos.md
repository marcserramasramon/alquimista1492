# icon-32 — Salvos (Emblema Equip i Proteccions)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | icon-32 |
| **Categoria** | Icon |
| **Acte** | I / II / III |
| **Estació** | N/A |
| **Rol en Gameplay** | UI — Botó navegació (salconduits, proteccions, emblemàtica d'equip) |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 1:1 |
| **Dimensions** | 48×48 px (mobile nav) |
| **Format** | SVG / PNG |
| **Comportament** | Static |
| **Ubicació Webapp** | Bottom navigation bar |

---

## Descripció Narrativa

Icona d'emblema, escut o segell medieval per accedir als "salvos" o salconduits del joc (proteccions que l'equip pot utilitzar, emblema del bàndol, marques d'identitat). Representa la protecció, la identitat del grup i l'autoritat medieval. Símbol simple d'un escut heràldic, segell oficia, o creu medieval, inspirat en heràldica de 1705 d'Osona. La imatge suggereix defensa, aliança i poder polític dins la trama del Pacte dels Vigatans.

Detalls: escut amb línia de contorn, heràldica simple, possiblement creu o símbol de poder, textura de ferro o pedra, colors heràldics.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval heraldic shield or seal icon, 1:1 aspect ratio, 48x48 pixels.
Simple iconic design of a shield or official seal with heraldic elements.
Materials: wrought iron edges, stone texture, wax seal impression, metal studs.
Style: flat iconography with sharp edges, heraldic aesthetic, 1705 Catalan noble style.
Colors: natural stone gray, dark iron, deep red or deep blue field, gold accents.
Minimalist design, maximum legibility at small size.
No people, no text, no modern elements.
Perfect for mobile navigation button.
Medieval 1705 Catalan heraldry and Pacte dels Vigatans inspiration.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 200 --quality 2 --size 48x48 Medieval heraldic shield icon, simple iconic design of shield or seal. Materials: iron, stone, wax. Style: flat iconography, sharp edges, heraldic. Colors: gray stone, iron, deep blue or red, gold. No people, text, or modern elements.
```

### Amb Master Style
```
/imagine --ar 1:1 --sref [MASTER_STYLE_URL] --niji 6 Medieval heraldic shield icon, 48x48px, sharp edges, noble emblem.
```

---

## Renderització en Webapp

```jsx
import { ShieldIcon } from '@/components/ui/icons';

export function SalvosTab() {
  return (
    <button className="nav-button">
      <ShieldIcon size={48} />
      <span>Salvos</span>
    </button>
  );
}
```

---

## Checklist Validació

- [ ] Aspecte ratio 1:1 correcte
- [ ] Mida 48×48 px
- [ ] Legible a petit tamany
- [ ] Escut o segell clarament visible
- [ ] Contrast suficient per a nav button
- [ ] Estil medieval 1705
- [ ] Heràldica autentica (Osona/Catunya)
- [ ] Zero text
- [ ] Zero anacronismes
- [ ] SVG optimitzat o PNG crip

---

## Status Producció

- [ ] PER_DISSENYAR
- [ ] EN_CURS
- [ ] REVISAT
- [ ] APROVAT
- [ ] GENERAT (data: _____)
- [ ] OPTIMITZAT (data: _____)
- [ ] INSTAL·LAT (data: _____)

---

## Notas Addicionals

Icona per accedir a la funcionalitat de salvos/salconduits (proteccions o recursos que l'equip pot utilitzar durant la partida). Ha de transmetre la idea de "poder", "protecció", "identitat de grup" i "autoritat medieval". Considerar escut heràldic, segell oficia, creu de poder, o marques de bàndol medieval. Els colors haurien de reflectir la heràldica catalan/osonenca de 1705.

---

**Última revisió:** 17/9/2026  
**Status:** PER_DISSENYAR  
**Próxim:** Generar amb Midjourney
