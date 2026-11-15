---
title: "PMT dossier: tijdlijn met lijn en bolletjes, weekcheck zonder schuiven"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 21, tokens: 53754 }
touches:
  - leermiddelen/beheer.html
  - leermiddelen/index.html
  - leermiddelen/klas.html
  - leermiddelen/werkblad.html
  - pmt/index.html
  - server/kamer.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
Het verhaal in het PMT-dossier is een tijdlijn: .dagrij met datum links, .dagspoor met .dagbol (S, N, M, W, kruisje) en de kaart rechts. De wekelijkse check (.raster.past) schuift niet meer: namen lopen over meer regels en op een smal scherm staan er minder weken (5 onder 560 px, 7 onder 900 px, anders 10).
## Watch out
De klasse .sessie hoort bij het sessiescherm (grid met marge). Geef onderdelen elders nooit een kale klasse sessie: de tijdlijn gebruikt daarom d-sessie, d-weg, d-meting, d-week.
