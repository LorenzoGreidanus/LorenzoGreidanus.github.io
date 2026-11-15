---
title: "PMT rooster: vrije begintijd en lengte per afspraak"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 6, tokens: 131695 }
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
Afspraken in het PMT-rooster hebben een vrije begintijd en lengte (5 tot 240 minuten); het blok is alleen het voorstel. lengteVeld() in tekenRooster geeft de pillen plus een eigen aantal minuten. pastIn op de server laat een leerlingafspraak nu over meer open blokken lopen, net als lesPast. Bij slepen of verplaatsen blijft de lengte; alleen PUT met lengte:true (Tijd aanpassen) verandert hem.
## Tried and ruled out
Een afspraak bij slepen de lengte van het nieuwe blok geven: dan raakt een afspraak van 45 minuten zijn lengte kwijt.
## Watch out
Het raster blijft op blokken getekend. Een langere afspraak staat in zijn eerste blok en als "loopt door tot" in de volgende; een kortere laat een plusje (.blok.rest) voor de rest van het blok, vanaf 10 minuten.
