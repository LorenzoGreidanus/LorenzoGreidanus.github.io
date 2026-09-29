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
| `spel/*.svg` | de spellogo's, een per pagina |
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

- **Opbouw:** elk spel is een eigen blobje in de kleur van het spel, met het pictogram van dat spel in crème.
  - De vorm varieert een klein beetje per spel, vast uit de naam van het bestand, net als de gezichtjes van de leerlingen.
  - Spellen zonder eigen pictogram hebben het lijnicoon van de startpagina.
- **Gebruik:** het spellogo is ook de favicon van de pagina, en het startscherm van het spel laat het zien.
- **Startpagina:** de spelkaarten gebruiken dezelfde blobvormen (`spelblob-*.svg`), maar houden de kleur van het vak.

**Nieuw spel?** Geef de pagina een favicon in de oude vorm: een vierkant van 100 bij 100 in de kleur van het spel, met het pictogram in crème. Draai dan:

```
node logo/maak-spellogos.js
```

Het script zet het pictogram in een blobje en schrijft ook `logo/spel/<pagina>.svg`.
