---
title: "PMT lijstenmaker: antwoordvormen (woorden of bolletjes) en een voorbeeld ernaast"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 10, tokens: 51784 }
touches:
  - pmt/index.html
  - pmt/invullen.html
  - server/pmt.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- Een lijst heeft een vorm: knoppen (woorden) of bollen (cijfers 1 tot n, twee tot tien). Bij bollen zijn de antwoorden de cijfers zelf als tekst en hebben alleen de uiteinden een betekenis (laag en hoog). De server maakt dat in schoonLijst en geeft vorm, laag en hoog mee aan het leerlingscherm.
- In de lijstenmaker kies je uit acht vormen (VORMEN in pmt/index.html): vier vaste rijen woorden, bolletjes 1 tot 4, 5 en 10, en eigen antwoorden. De oude vrije tekstvelden voor antwoorden zijn alleen nog bij Eigen antwoorden te zien.
- Naast de maker staat een voorbeeld dat bij elke toets meeloopt, met twee standen: op het scherm (een vraag, doorbladeren kan) en op papier (de eerste vijf zinnen met bolletjes).
- legendaDelen(l) maakt de legenda voor papier, invoeren en het voorbeeld.

## Tried and ruled out
- De uiteinden links en rechts onder de rij bolletjes zetten: bij tien bolletjes op een telefoon loopt de rij over twee regels en klopt dat niet meer; daarom staat de betekenis als regel erboven.

## Watch out
- Het voorbeeld is nagebouwd in de pagina van de therapeut, het is niet het echte leerlingscherm in een kader. Verandert invullen.html, pas dan ook .vbscherm aan.
