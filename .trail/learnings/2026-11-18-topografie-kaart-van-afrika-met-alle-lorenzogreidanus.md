---
title: "Topografie: kaart van Afrika met alle landen en hoofdsteden (v473)"
author: LorenzoGreidanus
date: 2026-11-18
branch: Live-branch
touches:
  - leermiddelen/topo-eigen.js
  - leermiddelen/topo-kaarten.js
  - leermiddelen/werkblad-topo.js
  - server/materiaal.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
---

## Decided
- Topografie heeft een eigen kaart van Afrika: af (alle 54 landen) en afh (de 54 hoofdsteden), in topo-kaarten.js. De wereldkaart blijft zoals hij was (24 Afrikaanse landen).
- De kaart komt uit Natural Earth 50m (publiek domein) en is gemaakt met een bouwscript in de scratchpad (afrika/werk/bouw.js, daarna zet.js). Projectie: Lambert azimutaal gelijkvlakkig, midden 18 graden oost en 1 graad noord, 820 bij 751.
- Somaliland en de Westelijke Sahara zitten in de achtergrond, zoals op de wereldkaart. Congo heet hier Congo-Kinshasa en Congo-Brazzaville, met de lange namen als andere goede antwoorden.
- De niveaus: Basis is dezelfde 24 landen als op de wereldkaart, Uitgebreid 42, Alles 54. Eilandstaten en Gambia zijn een stip (k = 1).
- Een nieuwe kaart aanmelden: topo-kaarten.js, TOPO_KAARTEN in server/materiaal.js, en VOLGORDE in werkblad-topo.js en topo-eigen.js. De rest (gebieden, keuzes) volgt uit de naam "Afrika, landen".

## Tried and ruled out
- De hoofdsteden uit een tweede bestand halen: de coordinaten staan met de hand in bouw.js, en het script kijkt na of elke hoofdstad in of vlak bij zijn land ligt.
- De Prins Edwardeilanden van Zuid-Afrika meenemen: ze liggen ver in de oceaan en maakten de hele kaart kleiner.
- Het label van Zuid-Afrika op het punt verst van de buitenrand: dat viel op Lesotho. Een gat telt nu als rand.

## Watch out
- Hier is elke landsgrens los vereenvoudigd (0,3 pixel), dus buren delen hun grens niet precies, anders dan bij de Europa- en wereldkaart.
- De bron (ne_50m_admin_0_countries.geojson, 3 MB) staat alleen in de scratchpad en is na een herstart weg; opnieuw ophalen vraagt toestemming van de gebruiker.
- Natural Earth noemt Zuid-Soedan SDS in plaats van SSD.
