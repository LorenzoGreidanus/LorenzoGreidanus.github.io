---
title: "PMT: de echte omgeving zonder demo-onderdelen, de demo als tijdelijke knop"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 14, tokens: 37014 }
touches:
  - pmt/index.html
  - server/pmt.js
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
- Wie met Microsoft inlogt komt in de echte omgeving zonder demo-onderdelen: geen oranje balk, geen knop voor voorbeelddossiers of een voorbeeldlijst, geen chip voorbeeld bij nieuwe dossiers. In /api/pmt is proef nu gelijk aan demo, en de voorbeelden (POST /api/pmt/proef) kunnen alleen in een demosessie.
- De openbare demo is terug als tijdelijke, tweede knop op het inlogscherm (Demo bekijken), in zijn eigen opslag. De hoofdknop is altijd Inloggen met Microsoft. De demo gaat uit met PMT_DEMO=nee.
- PMT_ECHT en proef(env) worden niet meer gebruikt; de functie staat er nog.

## Tried and ruled out
- De demo helemaal uit en de voorbeelden na het inloggen (een dag eerder zo gezet): de gebruiker wil dat de therapeut een schone omgeving ziet en dat anderen de demo los kunnen bekijken.

## Watch out
- Er is nu niets meer in beeld dat de therapeut zegt alleen verzonnen leerlingen in te voeren. Of er echte gegevens in mogen is nog steeds aan de school; dat is de gebruiker gezegd.
- De demoknop is bedoeld als tijdelijk: weghalen kan met PMT_DEMO=nee, zonder nieuwe code.
