---
title: "PMT rooster: duur op de blokken en hoogte naar duur"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 8, tokens: 81138 }
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
In het PMT-rooster (tekenRooster in pmt/index.html) staat op elk blok hoe lang het duurt (minTekst) en is de hoogte naar de duur (hoog: 1,6 px per minuut, minimaal 32, maximaal 120). De tijdkolom krijgt dezelfde hoogte per rij.

## Tried and ruled out
Een plusje als ::before in de flex-rij van een leeg blok: de tekst zakte naar onderen en werd afgesneden in korte blokken. Het plusje staat nu absoluut links en verschijnt bij hover.

## Watch out
De vaste hoogtes in de css (.blok 52px, .kort 28px) worden overschreven door de inline style; pas hoog() aan, niet de css.
