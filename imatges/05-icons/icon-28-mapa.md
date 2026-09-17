# icon-28 — Mapa (Navegació)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | icon-28 |
| **Categoria** | Icon |
| **Acte** | I / II / III |
| **Estació** | N/A |
| **Rol en Gameplay** | UI — Botó navegació (pestanya mapa) |

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

Icona de mapa medieval per accedir a la vista geogràfica del poble de Sentfoses. Representa la terra, els camins i els territoris a descobrir. Símbol simple d'un mapa plegat o desenrotllat amb línies de demarcació, inspirat en pergamins medievals de 1705. La imatge suggereix exploració, navegació i georeferenciació, essencial per localitzar les estacions de joc.

Detalles: línies de camins creuats, fronteres de territori, textura de paper antic, colors ocre i marró.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval map icon, 1:1 aspect ratio, 48x48 pixels.
Simple iconic design of a parchment map with territory lines and paths.
Materials: aged parchment, ink lines, faded texture.
Style: flat iconography with sharp edges, medieval cartography aesthetic.
Colors: antique beige, sepia brown, faded black ink.
Minimalist design, maximum legibility at small size.
No people, no text, no modern elements.
Perfect for mobile navigation button.
Ancient 1705 Catalan territory map inspiration.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 200 --quality 2 --size 48x48 Medieval map icon, simple iconic design of a parchment map with territory lines and paths. Materials: aged parchment, ink lines. Style: flat iconography, sharp edges. Colors: antique beige, sepia brown, black ink. No people, text, or modern elements.
```

### Amb Master Style
```
/imagine --ar 1:1 --sref [MASTER_STYLE_URL] --niji 6 Medieval parchment map icon, 48x48px, sharp edges, medieval cartography.
```

---

## Renderització en Webapp

```jsx
import { MapIcon } from '@/components/ui/icons';

export function MapTab() {
  return (
    <button className="nav-button">
      <MapIcon size={48} />
      <span>Mapa</span>
    </button>
  );
}
```

---

## Checklist Validació

- [ ] Aspecte ratio 1:1 correcte
- [ ] Mida 48×48 px
- [ ] Legible a petit tamany
- [ ] Línies clares, nítides
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

Icona central per a la funcionalitat de navegació cartogràfica. Ha de ser clarament reconeixible com a mapa fins i tot en resolució molt petita. Considerar disseny de mapa plegat amb esquines doblades (element medieval).

---

**Última revisió:** 17/9/2026  
**Status:** PER_DISSENYAR  
**Próxim:** Generar amb Midjourney
