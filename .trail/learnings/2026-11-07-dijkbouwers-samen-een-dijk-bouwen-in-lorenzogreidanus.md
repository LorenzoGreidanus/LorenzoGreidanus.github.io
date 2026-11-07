---
title: "Dijkbouwers: samen een dijk bouwen in de Klasstrijd (v452)"
author: LorenzoGreidanus
date: 2026-11-07
branch: Live-branch
touches:
  - leermiddelen/eigen.js
  - leermiddelen/index.html
  - leermiddelen/maken.html
  - leermiddelen/strijd.html
  - server/kamer.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
- Dijkbouwers is game "dijk" in SPELLEN_STRIJD (server/kamer.js). De kamer kiest de vragen (raceBereid voor vak of eigen code, met dijkStapel en dijkGeschikt), kijkt na en telt st.dijkSt: zakken, fouten, doel, dicht en per vraag.
- Het doel is 12 zakken per speler bij de start, minstens 30. De duur kiest de docent (5, 8 of 12 minuten) en loopt af met het alarm "dijkslot".
- Een antwoord telt pas na DIJK_DENK (1,5 s). Na een fout komt daar DIJK_LEES (2,5 s) bij, zodat gokken niet loont.
- Er is geen ranglijst en geen podium. De docent ziet na afloop in dijkEinde de vragen die het vaakst fout gingen.
- Een oefening uit Eigen materiaal kan mee via setVragen: meerkeuze en koppelvragen, zonder leestekst of plaatje. Een toets kan niet, want de bak geeft daarvan geen antwoorden.
- De scène staat in dijk-bord.html, als iframe in strijd.html (h-dijk), en krijgt elke stand via DIJKBORD.zet. dijk.html is het scherm van de leerling.

## Tried and ruled out
- De scène direct in strijd.html zetten: de klassen (.kaart, .laag) botsen met de stijl van de site. Daarom een iframe.

## Watch out
- dijk-bord.html wordt gebouwd uit de sfeerproef met een bouwscript in de scratchpad. Pas je de scène aan, bouw dan opnieuw of pas dijk-bord.html zelf aan.
- De stand moet onder 128 KiB blijven. Daarom houdt de kamer hoogstens 120 vragen per spel bij, met korte teksten, en neemt hij geen svg-vragen.
