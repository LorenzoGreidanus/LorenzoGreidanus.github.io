---
title: "PMT rooster: afspraak uit beeld na slepen, nu-lijn en grijs"
author: LorenzoGreidanus
date: 2026-11-13
branch: Live-branch
cost: { minutes: 13, tokens: 54453 }
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
In het PMT-rooster hoort elke afspraak bij het eerste blok dat hij raakt (thuisIn). Staan er meer in een blok, dan staan ze naast elkaar (.blok.stapel). Wat buiten alle blokken van de dag valt komt onderaan onder Buiten de dagindeling. De nu-lijn is een eigen element (.nulijn) met de tijd erbij en loopt elke minuut mee (S.roosterKlok); dagen die geweest zijn en blokken boven de lijn zijn grijs.

## Tried and ruled out
Per blok de eerste afspraak tonen die het blok raakt: na een andere dagindeling raken twee afspraken hetzelfde blok en is de tweede uit beeld. Zo leek een afspraak te verdwijnen bij het slepen. Op de server verdween er niets: 80 willekeurige sleepbewegingen lieten het aantal afspraken gelijk.

## Watch out
Slepen testen zonder muis: een Event drop met een eigen dataTransfer.getData op een .blok.leeg, en daarna de afspraken van de server vergelijken met de aria-labels in beeld. De stapel heeft klasse blok, anders klopt de telling van zetNu niet.
