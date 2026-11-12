---
title: "Arrivals: drie omroepberichten per kwartier; plan voor vier luisterspellen"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
touches:
  - leermiddelen/arrivals.html
  - sw.js
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
- Arrivals heeft per kwartier drie korte omroepberichten in plaats van een: ARR.BERICHTEN[ronde].delen is een lijst van drie, elk met noemt (de feiten) en een tekst per niveau (bb, kgt, havo). Ze gaan over verschillende vluchten, ook over nummers die op elkaar lijken, zodat elke reiziger zijn eigen vlucht eruit moet halen.
- spreek() zegt ze na elkaar via de klaar-melding van VOORLEES.spreek, met 1,3 seconde stilte; spreekBeurt breekt een lopende beurt af bij herhalen of een nieuw kwartier. Het bericht dat klinkt krijgt de klasse nu.
- De gebruiker wil vier nieuwe luisterspellen voor Engels als klassenspel: Wie is het (getuige, met gezichtjes), De bestelling (restaurant), De radio (nieuws en weer) en De weg wijzen. Volgorde: Wie is het eerst, van elk eerst schermafbeeldingen.

## Tried and ruled out
- Een luistervraag voor iedereen op de telefoon, en eerst horen dan zien (tekst van het bord af, vertrekbord een kwartier achter): voorgesteld, de gebruiker koos alleen meer berichten per ronde.

## Watch out
- De controle staat in de scratchpad (arr/check.js): elk feit in noemt moet kloppen met stand(), elk vluchtnummer in een tekst moet in noemt staan, en gate en tijd moeten in de tekst staan.
- #obericht wordt alleen opnieuw getekend als ronde of niveau verandert (data-sig), anders verdwijnt het lichtje van het lopende bericht.
- Testen zonder geluid: een nepstem via een setter op window.VOORLEES (arr/proef.js). De echte stem en de telefoonmodus zijn niet getest.
