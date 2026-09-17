# icon-31 — Historia (Narrativa i Context)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | icon-31 |
| **Categoria** | Icon |
| **Acte** | I / II / III |
| **Estació** | N/A |
| **Rol en Gameplay** | UI — Botó navegació (historia, trama, context) |

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

Icona de pergamí o rotlle medieval per accedir a la historia, trama i context del joc (el Pacte dels Vigatans, maig de 1705, personatges, sospitosos). Representa la narrativa, la saviesa antiga i els secrets guardats en documents. Símbol simple d'un pergamí desenrotllat o un rotlle amb text/segells medievals, inspirat en documents de 1705 d'Osona. La imatge suggereix revelació de la trama, coneixement historic i resolució de misteris.

Detalls: rotlle desenrotllat, segells o forats medievals, textura de pergamí, possiblement una cinta o precinte, tinta antiga.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval scroll or parchment icon, 1:1 aspect ratio, 48x48 pixels.
Simple iconic design of an unrolled scroll with medieval seals or text marks.
Materials: aged parchment, wax seals, ribbon, medieval paper.
Style: flat iconography with sharp edges, historical scroll aesthetic.
Colors: aged cream parchment, deep red wax seals, dark brown ribbon, black ink.
Minimalist design, maximum legibility at small size.
No people, no text, no modern elements.
Perfect for mobile navigation button.
Medieval 1705 Catalan historical narrative inspiration.
Pacte dels Vigatans era.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 200 --quality 2 --size 48x48 Medieval scroll icon, simple iconic design of an unrolled parchment scroll. Materials: aged parchment, wax seals, ribbon. Style: flat iconography, sharp edges. Colors: cream, red wax, brown ribbon, black ink. No people, text, or modern elements.
```

### Amb Master Style
```
/imagine --ar 1:1 --sref [MASTER_STYLE_URL] --niji 6 Medieval scroll icon, 48x48px, sharp edges, parchment and seals.
```

---

## Renderització en Webapp

```jsx
import { ScrollIcon } from '@/components/ui/icons';

export function HistoriaTab() {
  return (
    <button className="nav-button">
      <ScrollIcon size={48} />
      <span>Historia</span>
    </button>
  );
}
```

---

## Checklist Validació

- [ ] Aspecte ratio 1:1 correcte
- [ ] Mida 48×48 px
- [ ] Legible a petit tamany
- [ ] Rotlle o pergamí clarament visible
- [ ] Contrast suficient per a nav button
- [ ] Estil medieval 1705
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

Icona per accedir a la informació narrativa i contextual del joc. Ha de transmetre la idea de "saviesa antiga", "secrets medievals" i "documents importants". Considerar rotlle desenrotllat, pergamí, segells de cera, cinta medieval. Aquesta pestanya mostrarà la trama principal, els personatges i el context historic del Pacte dels Vigatans.

---

**Última revisió:** 17/9/2026  
**Status:** PER_DISSENYAR  
**Próxim:** Generar amb Midjourney
