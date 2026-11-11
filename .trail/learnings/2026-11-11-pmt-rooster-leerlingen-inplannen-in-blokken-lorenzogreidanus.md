---
title: "PMT rooster: leerlingen inplannen in blokken, en vier zwakke plekken dicht"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 25, tokens: 105454 }
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
- Rooster in server/pmt.js: tabel afspraak (dag, begin en duur in minuten, dossier, soort) en de instelling in tabel stand (k rooster). Standaard 8.30 tot 14.15 in blokken van 30 minuten; begin, eind en bloklengte (10 tot 120 minuten) zijn in te stellen.
- Inplannen kan een keer of 4, 8 of 12 weken achter elkaar; een week waar al iets staat wordt overgeslagen en dat wordt gemeld. Dubbel boeken geeft 409.
- De pagina tekent een week (maandag tot vrijdag) met een kolom per dag; op de telefoon een dag tegelijk met een dagkiezer. Het overzicht heeft een regel Vandaag en de kaart en de kop van het dossier tonen de volgende afspraak. De knop Inplannen in het dossier opent het rooster met die leerling voorgekozen (S.planVoor).
- Beveiliging (zelfde dag): het adres voor de toegangslijst komt alleen uit preferred_username of upn, nooit uit email; de demo-ingang laat een echte sessie met rust; het sessiekoekje heet op https __Host-pmt_sessie; grenzen op metingen (400 per dossier, 3000 totaal) en open codes (10 per leerling).

## Tried and ruled out
- De afspraken bij een andere bloklengte verschuiven of opnieuw indelen: ze blijven op hun eigen tijd staan en verschijnen in elk blok dat ze raken, met "vanaf" erbij.

## Watch out
- Een afspraak die twee blokken raakt staat er twee keer; dat is dezelfde afspraak.
- server/account.js:69 gebruikt voor het beheeraccount nog wel het veld email als terugval; dat is bewust niet aangeraakt en staat nog open.
- vandaag op de server is de datum in Nederland (vandaagNL), op de pagina de datum van het apparaat.
