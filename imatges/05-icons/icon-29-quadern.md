# icon-29 — Quadern (Quadern de Joc)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | icon-29 |
| **Categoria** | Icon |
| **Acte** | I / II / III |
| **Estació** | N/A |
| **Rol en Gameplay** | UI — Botó navegació (quadern de pistes i sospitosos) |

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

Icona de quadern o llibreta medieval per accedir al quadern de joc (pistes, evidències, sospitosos). Representa el paper, l'escriptura i l'acumulació de coneixement. Símbol simple d'un quadern obert o tancat amb línies que representen pàgines, inspirat en pergamins i diaris medievals de 1705. La imatge suggereix recollida d'informació, anotacions i deducció.

Detalls: pàgines visibles, ploma o retolador, textura de paper vell, tinta medieval, encuadernació simple.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval notebook icon, 1:1 aspect ratio, 48x48 pixels.
Simple iconic design of an open or closed notebook with visible pages.
Materials: aged parchment pages, leather binding, medieval ink lines.
Style: flat iconography with sharp edges, book/journal aesthetic.
Colors: cream parchment, dark brown leather, black ink.
Minimalist design, maximum legibility at small size.
No people, no text, no modern elements.
Perfect for mobile navigation button.
Medieval 1705 Catalan writing tradition inspiration.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 200 --quality 2 --size 48x48 Medieval notebook icon, simple iconic design of an open notebook with pages. Materials: aged parchment, leather binding. Style: flat iconography, sharp edges. Colors: cream, brown, black ink. No people, text, or modern elements.
```

### Amb Master Style
```
/imagine --ar 1:1 --sref [MASTER_STYLE_URL] --niji 6 Medieval notebook icon, 48x48px, sharp edges, writing and pages.
```

---

## Renderització en Webapp

```jsx
import { NotebookIcon } from '@/components/ui/icons';

export function NotebookTab() {
  return (
    <button className="nav-button">
      <NotebookIcon size={48} />
      <span>Quadern</span>
    </button>
  );
}
```

---

## Checklist Validació

- [ ] Aspecte ratio 1:1 correcte
- [ ] Mida 48×48 px
- [ ] Legible a petit tamany
- [ ] Pàgines clarament visibles
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

Icona per accedir a la funcionalitat de quadern digital (pistes, sospitosos, evidències). Ha de transmetre la idea de recopilació d'informació i deducció. Considerar quadern obert o llibreta amb encuadernació medieval.

---

**Última revisió:** 17/9/2026  
**Status:** PER_DISSENYAR  
**Próxim:** Generar amb Midjourney
