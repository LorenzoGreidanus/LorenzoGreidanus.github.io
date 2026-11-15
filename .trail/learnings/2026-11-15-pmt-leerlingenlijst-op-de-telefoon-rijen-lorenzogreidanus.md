---
title: "PMT leerlingenlijst: op de telefoon rijen in drie lagen"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 7, tokens: 25241 }
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
De leerlingenlijst van PMT (table.ltabel) is op de telefoon geen tabel meer: onder 760 breed is elke rij een raster van drie lagen (naam en status, de afspraak, het label Let op). De initialen staan midden in het vakje.

## Tried and ruled out
Op de telefoon de tabel houden en twee kolommen verbergen: de labels werden afgekapt, de tekst brak in drie regels en de tabel schoof opzij.

## Watch out
Een regel als .lknop span raakt ook span.avatar: het vakje met de initialen verloor daardoor zijn centrering. Gebruik .lknop > span:not(.avatar). Op de laptop blijft het een gewone tabel met zes kolommen.
