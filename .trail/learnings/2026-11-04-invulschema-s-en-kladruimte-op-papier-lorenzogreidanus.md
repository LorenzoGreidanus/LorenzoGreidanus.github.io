---
title: "Invulschema's en kladruimte op papier"
author: LorenzoGreidanus
date: 2026-11-04
branch: Live-branch
touches:
  - leermiddelen/maken-kiezer.js
  - leermiddelen/maken.html
  - leermiddelen/oefen.html
  - leermiddelen/open-papier.css
  - leermiddelen/open-papier.js
  - leermiddelen/papier.js
  - leermiddelen/papieren-toets.html
  - leermiddelen/uitslag.js
  - leermiddelen/werkblad-samen.js
  - server/materiaal.js
---

## Decided
- Nieuwe vraagsoort schema: leermiddelen/schema.js bouwt, tekent en kijkt na; server/materiaal.js (schemaItem, schemaScore, schemaJuist) kijkt met dezelfde regels na. Een cel is tekst of { a:[goede antwoorden] } (m:1 = mag leeg); in een toets wordt dat { i:1 } en gaat bron niet mee.
- Onthoudvakjes tellen mee, maar nakijken mag als ze leeg zijn: anders verraadt de knop waar je iets onthoudt.
- Kladruimte bij printen is een keuze (geen, bij rekenvragen, ruim) plus een kladblad achter de toets; OPENPAPIER.open krijgt o.klad.

## Tried and ruled out
- Een staartdeling als schema: nog niet; Maken zegt dan dat het een open vraag moet worden.

## Watch out
- papieren-toets.html heeft al .bladen .leeg met veel opvulling; de lege vakjes van een schema heten daarom sc-leeg.
- maken-kiezer maakt van cijf-cijferplus/cijfermin/cijfer1/cijfer2 een schema, maar niet op een werkblad (BLAD).
