---
title: "PMT lijf: nieuwe figuur met negen plekken"
author: LorenzoGreidanus
date: 2026-11-16
branch: Live-branch
cost: { minutes: 17, tokens: 126940 }
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
Het PMT-lijf (lijfTekening) bestaat uit dertien paden in viewBox 200x366 en heeft negen plekken: de nek is los van de schouders (LIJF in pmt/index.html en LIJFPLEKKEN in server/pmt.js). Oude check-ins met schouders blijven bij de schouders staan. Het tikvenster heeft knoppen in woorden onder het lijf (lijfchips) en een knop Opnieuw. Geen gezicht op het hoofd: de gebruiker wil dat niet.
## Tried and ruled out
Het lijf tekenen zonder het te bekijken: dat gaf een houten ledenpop met dunne schouders en vier rondes heen en weer. Een proefweergave in de browser (svg in een vaste laag injecteren en een schermafbeelding maken) was in drie rondes goed.
## Watch out
Een nieuwe plek moet op twee plaatsen bij: LIJF in de pagina en LIJFPLEKKEN op de server, anders gooit de server hem stil weg.
