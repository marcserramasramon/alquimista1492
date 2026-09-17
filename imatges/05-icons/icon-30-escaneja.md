# icon-30 — Escaneja QR (Botó Central Principal)

## Informació Bàsica

| Camp | Valor |
|------|-------|
| **ID** | icon-30 |
| **Categoria** | Icon |
| **Acte** | I / II / III |
| **Estació** | N/A |
| **Rol en Gameplay** | UI — Botó central prominent (escanejador QR) |

---

## Especificacions Tècniques

| Paràmetre | Valor |
|-----------|-------|
| **Aspecte Ratio** | 1:1 |
| **Dimensions** | 60×60 px (central nav button, larger) |
| **Format** | SVG / PNG |
| **Comportament** | Static |
| **Ubicació Webapp** | Center bottom navigation (floating action button style) |

---

## Descripció Narrativa

Icona de codi QR amb símbol d'escanejament per accedir a l'escanejador de QR de les estacions. Representa la tecnologia moderna integrada en la narrativa medieval: els equips han de trobar i escanejar QR físics al poble per accedir als jocs. Símbol simple d'un quadrat QR amb línies de lectura o un visor de câmera, inspirat en medieval + tecnologia. La imatge és prominent i atractiva per ser el botó principal.

Detalls: codi QR visible, línies de lectura radiants, símbol de camera o láser, textura medieval combinada amb modern, colors contrastants.

---

## PROMPT PER GENERAR (Midjourney/Flux)

```
Medieval QR scanner icon, 1:1 aspect ratio, 60x60 pixels, prominent central button.
Simple iconic design of a QR code with scanning lines or camera viewfinder.
Blend medieval and modern: parchment texture meets technological symbol.
Materials: aged parchment background, sharp digital QR pattern, scanning beam effect.
Style: flat iconography with sharp edges, technological aesthetic with historical touch.
Colors: antique cream background, deep black QR code, gold or amber scanning lines.
Bold, legible design for prominent mobile central button.
No people, no text, no anachronistic modern UI.
Perfect for primary action button in medieval escape room app.
1705 Catalan village exploration through technology.
```

---

## Paràmetres Motor IA

### Midjourney
```
/imagine --ar 1:1 --niji 6 --stylize 200 --quality 2 --size 60x60 Medieval QR scanner icon, simple iconic design of QR code with scanning lines. Materials: aged parchment, sharp black QR, gold scanning beam. Style: flat, sharp edges, medieval meets technology. Colors: cream, black, gold. No people, text, or anachronistic elements.
```

### Amb Master Style
```
/imagine --ar 1:1 --sref [MASTER_STYLE_URL] --niji 6 Medieval QR scanner icon, 60x60px, prominent central button, sharp edges.
```

---

## Renderització en Webapp

```jsx
import { QRScanIcon } from '@/components/ui/icons';

export function QRScannerButton() {
  return (
    <button className="nav-button nav-button--central nav-button--large">
      <QRScanIcon size={60} />
      <span>Escaneja</span>
    </button>
  );
}
```

---

## Checklist Validació

- [ ] Aspecte ratio 1:1 correcte
- [ ] Mida 60×60 px (més gran que altres)
- [ ] Clarament reconeixible com QR
- [ ] Linies de lectura ben definides
- [ ] Contrast alt per botó central
- [ ] Atractiu i prominent visualment
- [ ] Estil medieval + modern equilibrat
- [ ] Zero text
- [ ] Zero anacronismes purs
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

Aquest és el botó més important de la navegació: l'acció principal per escannejar QR de les estacions. Ha de ser visualment prominent i atractiu. Més gran que les altres icones (60×60 vs 48×48). Considerar efecte de "escanejament" amb línies radiants o feix de llum. Equilibri entre aesthetic medieval i funcionalitat tecnològica.

---

**Última revisió:** 17/9/2026  
**Status:** PER_DISSENYAR  
**Próxim:** Generar amb Midjourney
