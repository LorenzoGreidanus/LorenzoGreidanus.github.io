---
title: "PMT weekmaker: links veranderen werkt direct door"
author: LorenzoGreidanus
date: 2026-11-16
branch: Live-branch
cost: { minutes: 5, tokens: 18387 }
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
In de weekmaker van het PMT-rooster werkt de linkerkolom (begin, eind, bloklengte, pauzes) altijd direct door: hervul() maakt de standaarddagen opnieuw uit de tijden. Stonden er met de hand gezette blokken (B.alle), dan bewaart bewaardeAlle ze en zet de knop "Mijn eigen blokken terugzetten" ze terug. Een nieuwe pauze komt op een plek waar nog geen pauze staat.
## Tried and ruled out
Alleen opnieuw vullen na de knop "Vul de dagen zo": met opgeslagen eigen blokken leek het of pauze toevoegen en tijden veranderen niets deden. Dat lag niet aan bestaande afspraken.
