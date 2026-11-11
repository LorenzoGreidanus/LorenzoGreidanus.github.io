---
title: PMT voorbeeldgrafieken bij alle demo-leerlingen en in de lijstenmaker
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 4, tokens: 33101 }
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
- De voorbeeldcijfers staan in VOORBEELDCIJFERS in server/pmt.js, per voornaam: metingen (dagen geleden plus negen antwoorden) en weken van de weekcheck. Elke verzonnen leerling laat iets anders zien: Mila een heel traject, Sam een terugval, Noor een pas begonnen traject, Jesse alleen een beginmeting.
- DEMO_VERSIE: verhoog dit getal als de voorbeelden veranderen, dan vult de demo zich bij de volgende bezoeker opnieuw in plaats van pas na een dag.
- Het voorbeeld in de lijstenmaker heeft een derde stand "In het dossier": de grafiek per schaal met verzonnen cijfers, of het raster als het vinkje wekelijkse check aan staat. grafiek(g, true) tekent een smalle versie voor dat vak.

## Tried and ruled out
- De gewone brede grafiek met een schuifbalk in het smalle voorbeeldvak: je zag maar de helft en de tabel eronder viel weg.

## Watch out
- Kies voorbeeldantwoorden zo dat de schalen niet op dezelfde score eindigen, anders liggen de lijnen op elkaar.
