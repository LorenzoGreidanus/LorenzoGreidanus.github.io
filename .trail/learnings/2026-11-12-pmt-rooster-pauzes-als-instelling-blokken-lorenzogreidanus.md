---
title: "PMT rooster: pauzes als instelling, blokken passen zich aan"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 10, tokens: 625238 }
touches:
  - leermiddelen/werkblad.html
  - pmt/index.html
  - server/pmt.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- Pauzes horen bij de instelling van het rooster (pauzes: naam, van en tot in minuten, hooguit zes). Standaard de twee van de school: 10.00 tot 10.20 en 12.00 tot 12.35. Ze zijn aan te passen onder Tijden instellen.
- De pagina bouwt de blokken zo: vullen tot aan een pauze, dan de pauze als smalle rij, dan opnieuw beginnen bij het eind van de pauze. Een rest van minder dan tien minuten is geen blok.
- De server weigert een leerling in te plannen of te verplaatsen naar een moment dat een pauze raakt (pauzeOp); dichtzetten mag er wel overheen.
- De pauze stond in de demo eerst als dichte blokken; dat is weg. De voorbeeldafspraken staan op tijden die in het nieuwe raster passen (9.00, 10.20, 13.05).

## Tried and ruled out
- Een pauze als wekelijks dichtgezet blok: dan klopt het raster niet (een blok van 10.00 tot 10.30 bij een pauze tot 10.20) en moet je het elk jaar opnieuw zetten.

## Watch out
- Met blokken van 30 minuten blijven er korte blokken over: 11.50 tot 12.00 en 14.05 tot 14.15. Die zijn gewoon in te plannen.
- Een afspraak die door nieuwe pauzes niet meer op een blokgrens begint, staat in elk blok dat hij raakt.
