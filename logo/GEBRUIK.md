# Het logo van meneer Greidanus

Het blobje: hetzelfde gezichtje dat elke leerling op de site ook krijgt, en het kijkt nieuwsgierig omhoog. Leren begint met willen weten.

## De bestanden

| Bestand | Waarvoor |
|---|---|
| `blobje.svg` | het logo in kleur, op een lichte achtergrond |
| `blobje-donker.svg` | op een donkere achtergrond (het lijf in lichtblauw) |
| `blobje-klein.svg` | voor 16 tot 32 pixels: grotere ogen, geen mond (dit is ook `/favicon.svg`) |
| `blobje-navy.svg`, `blobje-wit.svg`, `blobje-mono.svg` | in één kleur (mono volgt `currentColor`); ogen en mond zijn gaten |
| `meneer-greidanus.svg` en `-donker.svg` | het blobje met de naam, liggend |
| `meneer-greidanus-staand.svg` en `-donker.svg` | het blobje met de naam, staand |
| `icoon*.svg`, `/icoon-*.png`, `/apple-touch-icon.png`, `/favicon.ico` | app-iconen en favicons |
| `spel/*.svg`, `spel-pictogrammen.json` | de spellogo's, een per pagina, en hun pictogrammen |
| `spelblob-1.svg` t/m `spelblob-6.svg` | maskers voor de spelkaarten op de startpagina |

De naam is uitgetekend: "meneer" in Caveat 600 (handschrift), "Greidanus" in Poppins 700. Beide lettertypen hebben de Open Font License, dus ze mogen in een logo.

## Kleuren

| | HEX |
|---|---|
| Lijf (oceaan) | `#204ECF` |
| Lijf op donker (vista) | `#83A5F2` |
| Ogen (crème) | `#FBF6F1` |
| Pupillen en mond (navy) | `#14224C` |
| "meneer" | `#D9522F`, op donker `#F58A6E` |
| "Greidanus" | `#14224C`, op donker `#FBF6F1` |

## Zo gebruik je het

- **Vrije ruimte:** houd rondom minstens de hoogte van één oog vrij.
- **Kleinste maat:**
  - het blobje met mond vanaf 32 pixels;
  - daaronder `blobje-klein.svg`;
  - het blobje met de naam vanaf 120 pixels breed.
- **Achtergrond:** op licht het gewone blobje, op donker de donkere versie, op een foto of drukke achtergrond de witte.
- **Niet doen:**
  - uitrekken;
  - het blobje anders laten kijken of een andere mond geven (die zijn voor de gezichtjes van leerlingen, niet voor het merk);
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

## De nagekeken g

Het tweede teken, voor het nakijkwerk. De g van Greidanus in één lijn: de ring loopt in het raakpunt over in de steel, en die eindigt in een vinkje. Het vinkje (oranje) ligt over de O (blauw) en begint daar met een halve ronde. Twee harde kleuren, geen verloop.

| Bestand | Waarvoor |
|---|---|
| `g/nagekeken-g.svg` | in kleur, op licht |
| `g/nagekeken-g-donker.svg` | op donker (de ring in lichtblauw) |
| `g/nagekeken-g-navy.svg`, `-wit.svg`, `-mono.svg` | in één kleur (mono volgt `currentColor`) |

- **Waar:**
  - in de kop van de docentpagina's (klasoverzicht, beheer, maken, werkbladen, lesbrieven, handleiding);
  - bij een goed antwoord (alle vakspellen, Oefenen, de klasquiz);
  - als stempel "nagekeken" op het antwoordblad van een werkblad en het nakijkblad van het dictee.
- **Het blobje blijft het teken voor leerlingen en de spellen.**
- **Beweging:** eerst tekent de ring zich, dan flickt het vinkje erachteraan. Wie minder beweging wil (prefers-reduced-motion), ziet hem meteen staan.
- **In code:** `leermiddelen/nagekeken.js` geeft `NAGEKEKEN.svg({ maat, teken, mono, label })` en `NAGEKEKEN.stempel({ maat })`.
