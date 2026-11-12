---
title: "PMT rooster: de dagindeling helemaal zelf instellen"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 7, tokens: 59462 }
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
- De instelling van het rooster heeft naast begin, eind, bloklengte en pauzes nu ook blokken (een eigen lijst voor alle dagen: van, tot, vrij, naam) en perDag (per weekdag 0 tot 4 een eigen lijst, of uit: op die dag geen afspraken). Staat blokken leeg, dan maakt het rooster ze zelf uit de tijden en pauzes, zoals voorheen.
- In het scherm Dagindeling instellen neem je de automatische blokken over en pas je ze aan: tijden wijzigen, een blok op Geen afspraak zetten met een naam, blokken toevoegen en weghalen, opnieuw vullen uit de tijden, terug naar automatisch. Per dag kan een eigen indeling of geen afspraken.
- De server laat een afspraak met een leerling alleen toe als die helemaal binnen een blok valt waar een afspraak kan (pastIn in server/pmt.js). Dichtzetten mag overal. Bij verplaatsen neemt de afspraak de lengte van het nieuwe blok over.
- Wijkt er een dag af, dan verdwijnt de tijdkolom links en staat de tijd in elk blok, omdat de rijen van de dagen dan niet meer gelijk lopen.

## Tried and ruled out
- Een agenda waarin elk blok op zijn minuut staat en zo hoog is als het duurt: een blok van tien minuten wordt dan te klein om aan te klikken. De blokken staan als rijen onder elkaar.
- Overlappende blokken stil weglaten: het scherm zegt nu welk blok te vroeg begint en bewaart niet.

## Watch out
- Afspraken die er al staan blijven op hun eigen tijd, ook als ze niet meer in een blok passen; ze verschijnen in elk blok dat ze raken.
- Een dag zonder afspraken toont wat er toch nog gepland staat, zodat het weggehaald kan worden.
