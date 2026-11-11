---
title: "PMT vragenlijst op papier: printen met bolletjes en invoeren"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 3, tokens: 29686 }
touches:
  - server/account.js
  - server/index.js
  - wrangler.jsonc
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- In het dossier staan naast Klaarzetten twee knoppen: "Printen met bolletjes" (tekenPapier: naam, datumlijn, uitleg, legenda en per zin een rij genummerde bolletjes) en "Papier invoeren" (tekenInvoer: de therapeut neemt de bolletjes over, een cijfer tikken kiest en springt naar de volgende zin).
- Server: POST /api/pmt/dossiers/ID/meting rekent met dezelfde reken() als het leerlingscherm en zet papier:true op de meting; de meting krijgt de datum van het papier (voerIn in pmt.js).

## Tried and ruled out
- Het papier laten inlezen met een scan of foto: niet gebouwd, overnemen met het toetsenbord is voor een enkele leerling sneller en zonder leesfouten.

## Watch out
- Invoeren rekent met de lijst zoals die nu is. Is de lijst na het printen aangepast, dan kloppen de zinnen op papier niet meer met het invoerscherm.
- De printopmaak is alleen op het scherm bekeken, niet op papier.
