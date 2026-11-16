---
title: "PMT: rooster op een tijdas, vragenlijst op papier zonder merk"
author: LorenzoGreidanus
date: 2026-11-16
branch: Live-branch
cost: { minutes: 6, tokens: 85306 }
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
PMT-rooster met een eigen dagindeling per dag tekent op een tijdas: var as {van,tot,p} in tekenRooster, hoog(b) geeft dan top en height, en na het tekenen verhuizen de blokken naar .dagbaan. Links staan uur- en halfuurlabels; in lege blokken staat geen tijd meer.
De vragenlijst op papier (tekenPapier) is een zwart-wit .blad zonder merk, met de antwoordwoorden boven de kolommen en een ingevuld voorbeeld.
## Watch out
Het webadres en de datum om een afdruk komen van de browser. @page blad{margin:0} met page:blad op .blad haalt ze weg; het blad heeft daarom zijn eigen marge in millimeters. De echte afdruk is niet in een printvoorbeeld getest.
