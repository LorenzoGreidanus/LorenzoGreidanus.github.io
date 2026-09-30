# Het logo van meneer Greidanus

De nagekeken g: de g van Greidanus in één lijn. De ring (blauw) loopt in het raakpunt over in de steel, en die eindigt in een vinkje (oranje) dat over de O ligt en daar met een halve ronde begint. Nagekeken, en goed is goed. Twee harde kleuren, geen verloop.

## De bestanden

| Bestand | Waarvoor |
|---|---|
| `g/nagekeken-g.svg` | het teken in kleur, op licht |
| `g/nagekeken-g-donker.svg` | op donker (de ring in lichtblauw) |
| `g/nagekeken-g-navy.svg`, `-wit.svg`, `-mono.svg` | in één kleur (mono volgt `currentColor`) |
| `meneer-greidanus.svg` en `-donker.svg` | de g met de naam, liggend |
| `meneer-greidanus-staand.svg` en `-donker.svg` | de g met de naam, staand |
| `/favicon.svg` | het tabbladicoon; volgt licht en donker van het apparaat |
| `icoon*.svg`, `/icoon-*.png`, `/apple-touch-icon.png`, `/favicon.ico` | app-iconen: de g in crème en oranje op een blauw vlak |
| `spel/*.svg`, `spel-pictogrammen.json` | de spellogo's, een per pagina, en hun pictogrammen |
| `spelblob-1.svg` t/m `spelblob-6.svg` | maskers voor de spelkaarten op de startpagina |
| `blobje*.svg` | het vorige logo; het blobje is nu alleen nog het gezichtje van een leerling |

De naam is uitgetekend: "meneer" in Caveat 600 (handschrift), "Greidanus" in Poppins 700. Beide lettertypen hebben de Open Font License, dus ze mogen in een logo.

## Kleuren

| | HEX |
|---|---|
| Ring (oceaan) | `#204ECF` |
| Ring op donker (vista) | `#83A5F2` |
| Vinkje | `#F26749` |
| Crème (op een blauw vlak) | `#FBF6F1` |
| "meneer" | `#D9522F`, op donker `#F58A6E` |
| "Greidanus" | `#14224C`, op donker `#FBF6F1` |

## Zo gebruik je het

- **Vrije ruimte:** houd rondom minstens de dikte van de lijn vrij.
- **Kleinste maat:** de g vanaf 16 pixels; de g met de naam vanaf 120 pixels breed.
- **Achtergrond:** op licht de gewone g, op donker de donkere versie, op een foto of drukke achtergrond de witte.
- **Beweging:** eerst tekent de ring zich, dan flickt het vinkje erachteraan. In de kop gebeurt dat bij het openen van de pagina en opnieuw als je er met de muis overheen gaat (`leermiddelen/merk.js`). Wie minder beweging wil (prefers-reduced-motion), ziet hem meteen staan.
- **Waar nog meer:** bij een goed antwoord (alle vakspellen, Oefenen, de klasquiz) en als stempel "nagekeken" op het antwoordblad van een werkblad en het nakijkblad van het dictee. In code: `leermiddelen/nagekeken.js` geeft `NAGEKEKEN.svg({ maat, teken, mono, label })` en `NAGEKEKEN.stempel({ maat })`.
- **Niet doen:**
  - uitrekken of draaien;
  - het vinkje onder de O leggen, of een verloop tussen de twee kleuren;
  - een schaduw of rand eromheen;
  - een andere kleur dan hierboven.

## De spellogo's

- **Opbouw:** elk spel is een eigen blobje in de kleur van het spel, met een lijnpictogram erin.
  - De vorm varieert een klein beetje per spel, vast uit de naam van het bestand, net als de gezichtjes van de leerlingen.
  - Het pictogram is crème op een donkere blob en navy op een lichte (het script kiest wat het meeste contrast geeft).
- **Stijl van de pictogrammen:** allemaal op een raster van 24, zoals de lijniconen van de startpagina.
  - Alleen lijnen, overal even dik (2,25 op 24), met ronde uiteinden en hoeken.
  - De enige vlakjes zijn punten (`<circle class="punt">`), hooguit twee.
  - Binnen 3 tot 21 blijven, rond het midden, en ongeveer 16 tot 18 groot, zodat ze allemaal even groot lijken.
  - Lijnen die naast elkaar lopen minstens 4 uit elkaar, anders lopen ze op 16 pixels dicht.
  - Elk spel een eigen motief: geen twee spellen met hetzelfde plaatje.
- **Gebruik:** het spellogo is ook de favicon van de pagina, en het startscherm van het spel laat het zien.
- **Startpagina:** de spelkaarten gebruiken dezelfde blobvormen (`spelblob-*.svg`), maar houden de kleur van het vak.

**Nieuw spel of ander pictogram?** Zet de kleur en het pictogram in `logo/spel-pictogrammen.json` en draai:

```
node logo/maak-spellogos.js
```

Het script controleert de stijl, zet het logo als favicon in de pagina en schrijft ook `logo/spel/<pagina>.svg`. Het noemt pagina's die nog een favicon in de oude vorm hebben (een vierkant) en nog geen pictogram.
