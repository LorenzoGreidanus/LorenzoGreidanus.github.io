---
title: "PMT: aanwezig of afwezig per afspraak, met een reden"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 4, tokens: 37017 }
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
- Elke afspraak heeft komst (leeg, aanwezig, afwezig) en bij afwezig een reden: kolommen op tabel afspraak, gezet met PUT /api/pmt/afspraken/ID/komst. De reden is een van de vaste knoppen (Ziek, Weigerde, Vergeten, Toets of andere les, Afgemeld door ouders, Niet op school) of een eigen tekst van hooguit 60 tekens.
- Een bouwsteen komstVak(a, klaar) in pmt/index.html tekent het op drie plekken: de regel van vandaag op het hoofdscherm, het paneel van een afspraak in het rooster, en het vak Aanwezigheid in het dossier (laatste acht afspraken, met de telling "5 van de 6 keer aanwezig"). Het verslag noemt de telling.
- Op het hoofdscherm is de regel geen knop meer maar een rij: de naam opent het dossier, rechts staat de aanwezigheid.
- In het logboek komt dat er iets genoteerd is, niet de reden.

## Tried and ruled out
- De reden versleuteld in het dossier bewaren: de afspraak hoort bij het rooster en heeft alleen het dossiernummer; een korte reden daar is genoeg en houdt het rooster snel.

## Watch out
- Afmelden vooraf kan: de knoppen staan ook bij een afspraak die nog moet komen.
- haal() geeft nu ook d.geweest (afspraken tot en met vandaag); de pagina haalt dat weg voor een PUT.
