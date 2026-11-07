---
title: "Gemeenteraad: rolkaart al bij de formatie"
author: LorenzoGreidanus
date: 2026-11-07
branch: Live-branch
touches:
  - leermiddelen/gemeenteraad.html
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-26T11-59-34Z__leermiddelen-index-html.md"
---

## Decided
- In gemeenteraad.html stuurt naarFormatie() meteen stuurRollen(): tijdens de formatie moet een leerling al weten in welke fractie die zit. Eerder kwam de rolkaart pas bij formatieKlaar, zodat "jouw fractie" zonder naam op het scherm stond.
- De formatiekaart noemt de fractie in de titel ("Met wie gaat X samen?") en zet "(jouw fractie)" in de lijst.
- De rolkaart van een raadslid noemt de andere leerlingen in dezelfde fractie, of zegt dat je de enige bent.

## Watch out
- De namen op de rolkaart worden bij latere instromers niet opnieuw naar de anderen gestuurd.
- Testen: scratchpad dijkspel/raad.js met zes nep-leerlingen op worker 8787.
