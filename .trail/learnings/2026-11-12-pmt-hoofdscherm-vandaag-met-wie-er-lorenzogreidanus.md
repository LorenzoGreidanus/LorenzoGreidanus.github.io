---
title: "PMT hoofdscherm: Vandaag met wie er komt en wie nu aan de beurt is"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 14, tokens: 43660 }
touches:
  - pmt/index.html
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-26T11-59-34Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-26T18-38-29Z__leermiddelen-familie-vakspellen.md"
---

## Decided
- Het hoofdscherm begint met Vandaag: een lijst van de afspraken van vandaag uit het rooster (laadVandaag, tekenVandaag in pmt/index.html), daaronder pas de leerlingkaarten. Het vervangt de oude regel met alleen namen (vandaagStrook, nog in de code maar niet gebruikt).
- Elke regel toont tijd, leerling, soort en klas. De afspraak van nu heeft een rand en "nu, nog N min", de eerstvolgende "over N min", wat geweest is staat gedimd. Dichte blokken staan ertussen, een vrije dag wordt gemeld, en onderaan staat de eerstvolgende dag met leerlingen.
- Een klik op de regel opent het dossier; bij de leerling van nu op het tabblad Notities met de cursor in het veld (openDossier(id, tab)). Zonder toestemming gaat het naar Overzicht.
- De klok loopt mee met een interval van een minuut dat alleen opnieuw tekent en de server niet vraagt, zodat het de sessie niet wakker houdt.

## Tried and ruled out
- Elke minuut het rooster opnieuw ophalen: dat zou de sessie van een kwartier eindeloos verlengen op een onbeheerd scherm.

## Watch out
- De gebruiker wil dat de bediening overal af is; een hele ronde langs alle schermen is nog niet gedaan.
- De tijd komt van het apparaat, de datum van het rooster van de server (Nederland).
