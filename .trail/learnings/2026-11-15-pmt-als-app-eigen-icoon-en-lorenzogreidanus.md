---
title: "PMT als app: eigen icoon en manifest op het PMT-adres"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 3, tokens: 19600 }
touches:
  - pmt/index.html
  - pmt/invullen.html
  - pmt/privacy.html
  - server/index.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
---

## Decided
PMT heeft eigen app-iconen (pmt/icoon-180.png, -192, -512, gemaakt met sharp uit het logo op een vol blauw vlak) en een manifest (pmt/app.webmanifest). Op het PMT-adres geeft server/index.js ze op /apple-touch-icon.png, /icoon-192.png, /icoon-512.png en /app.webmanifest; de drie PMT-paginas wijzen ernaar in de head.

## Tried and ruled out
Het icoon als data-URI in link rel=icon alleen: dat werkt voor het tabblad, maar een telefoon pakt voor het beginscherm /apple-touch-icon.png of het manifest, en dat was op het PMT-adres het icoon van de gewone site.

## Watch out
Het PMT-adres lokaal testen kan met curl --resolve pmt.localhost:8791:127.0.0.1. Een telefoon onthoudt het oude icoon: de app eerst van het beginscherm halen en opnieuw toevoegen.
