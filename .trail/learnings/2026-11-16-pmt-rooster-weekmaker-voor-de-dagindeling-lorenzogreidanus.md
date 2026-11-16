---
title: "PMT rooster: weekmaker voor de dagindeling"
author: LorenzoGreidanus
date: 2026-11-16
branch: Live-branch
cost: { minutes: 13, tokens: 115902 }
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
De instellingen van het PMT-rooster zijn een brede lade met tabbladen (zetInstTab: dag, vrij, agenda). De dagindeling is een weekmaker: links vullen uit begin, eind, bloklengte en pauzes; in het midden vijf dagen op een tijdas waarin je blokken kiest, versleept (grepen, stappen van 5 minuten) en toevoegt; rechts de gekozen dag (standaard, eigen, uit) en het gekozen blok. Wat er wordt opgeslagen is niet veranderd (blokken, perDag).
## Watch out
Standaarddagen delen dezelfde blokobjecten; een keuze op maandag licht dus op elke standaarddag op, en alleen de gekozen dag (.wm-baan.aan) heeft grepen. De automatische lijst (autoLijst) mag alleen in vers() opnieuw gemaakt worden, niet in tekenWeek: anders is het gekozen blok na elke klik weg. eigenLijst(i) maakt van de automatische lijst een vaste zodra je iets verandert.
