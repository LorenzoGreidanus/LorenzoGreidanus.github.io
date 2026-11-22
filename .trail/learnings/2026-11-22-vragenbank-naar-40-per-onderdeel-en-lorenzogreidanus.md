---
title: "Vragenbank naar 40 per onderdeel en niveau, open antwoorden (v475)"
author: LorenzoGreidanus
date: 2026-11-22
branch: Live-branch
touches:
  - leermiddelen/bank-aard.js
  - leermiddelen/bank-bio.js
  - leermiddelen/bank-burg.js
  - leermiddelen/bank-eco.js
  - leermiddelen/bank-eng.js
  - leermiddelen/bank-ges.js
  - leermiddelen/bank-ned.js
  - leermiddelen/bank-wis.js
  - leermiddelen/bank.js
  - leermiddelen/maken.html
---

## Decided
- De vragenbank is uitgebreid tot 40 vragen per onderdeel en niveau. Per vak hangt achteraan in bank-<vak>.js een blok <VAK>_MEER, een vraag per regel, met w per foute optie.
- Niet aangevuld: rekenen, vlaggen, landvormen, topografie, irregular verbs en de lege dynamische onderdelen. Examenonderdelen, staat en nl1900 alleen bb en kgt.
- Open versies van de nieuwe vragen staan in open/<vak>.json met alle goede antwoorden. Alleen vragen met een kort goed antwoord vanaf niveau 2 zijn bekeken.
- typen.js knipt een antwoord niet meer midden in een getal: 0,5 en 1/6 blijven heel. Eerder telde bij 1/6 ook alleen 6 als goed.
- Nieuwe werkbladen: Eigen schema (werkblad-schema.js, vinkjes TE tot en met zes kolommen) en Zinsdeelstrepen (werkblad-zinsdelen.js). Nieuwe onderdelen: bio levensfasen, eco bescherming en verzekeren, wis piramide.

## Tried and ruled out
- Dubbelen alleen binnen het eigen onderdeel controleren: de bankcontrole vond daarna nog 42 dubbelen met andere onderdelen. Die zijn uit de blokken gehaald.
- Een leesteken als open antwoord: norm haalt leestekens weg, dus het antwoord wordt leeg. Die tien vragen blijven meerkeuze.

## Watch out
- maak-stadvragen.js schrijft ook reken.json opnieuw; terugzetten als rekenen niet veranderd is.
- Open antwoorden altijd nalopen met de echte TYPEN.keur: elk goed antwoord goed, elke foute optie fout. Een getal met eenheid telt ook als het kale getal, dus een foute optie die alleen het getal is, wordt dan goedgekeurd.
- Een sed over de hele repo raakt ook .claude/worktrees en de graft-cache.
