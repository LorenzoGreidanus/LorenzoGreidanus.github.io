---
title: "Werkblad overschrijven, een knop per los blad, blad zonder antwoordblad"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
touches:
  - leermiddelen/werkblad.html
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
- Nieuw los werkblad: SPELBLAD.overschrijven (werkblad-overschrijven.js, vak 'los'). De docent typt een zin (hoogstens 160 tekens) en kiest hoe vaak (5 tot 100). Instelbaar: gewone regels of met hulplijn, regels per keer (vanzelf of 1 tot 4), hoogte van een regel (8, 10 of 13 mm), en onderaan een vraag en ruimte voor handtekeningen.
- Onder Zonder vak staat nu een knop per los blad (#los, data-los): de knop zet vak 'los' en daarna het blad. Een nieuw los blad krijgt vanzelf een knop; LOSNAAM geeft een kortere naam.
- Een blad kan zonder tweede blad: teken() geeft enkel:true terug. werkblad.html zet dan data-enkel op #bladen (het antwoordblad is verborgen op scherm en papier), verbergt de tab en print meteen zonder keuzevenster. zonderAntwoord:true op het blad verbergt het vinkje voor uitleg.
- Typen in een textarea in #delen plant na 700 ms een nieuw blad (input-luisteraar in werkblad.html).

## Tried and ruled out
- Het woord straf op het blad: het blad heet Overschrijven, de docent bepaalt zelf waarvoor.
- De zin in de link zetten: de onderdelen in het adres zijn losse woorden met komma's ertussen. De zin blijft in localStorage (lg-overschrijf-zin).

## Watch out
- De hoogte van een regel komt als stijlregel in boven mee; de regels van het slot (de vraag onderaan) schalen daardoor ook mee.
- Het slot zit in de laatste opgave, zodat het niet los op een nieuwe bladzijde komt.
- Niet getest: Samenstellen op dit blad. De knop Andere vragen doet hier niets zichtbaars.
