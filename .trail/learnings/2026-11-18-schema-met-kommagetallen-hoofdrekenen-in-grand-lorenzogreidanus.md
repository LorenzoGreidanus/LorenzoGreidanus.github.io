---
title: "Schema met kommagetallen, hoofdrekenen in Grand Prix, inhalen (v472)"
author: LorenzoGreidanus
date: 2026-11-18
branch: Live-branch
touches:
  - leermiddelen/leerroute/rekenen-getallen.js
  - leermiddelen/maken-kiezer.js
  - leermiddelen/maken.html
  - leermiddelen/opdrachtenboek.js
  - leermiddelen/prix-banen.js
  - leermiddelen/prix.html
  - leermiddelen/schema.js
  - leermiddelen/strijd.html
  - server/kamer.js
  - server/materiaal.js
---

## Decided
- Het DHTE-schema en Onder elkaar (schema.js) kunnen kommagetallen: leesSom geeft dan a en b zonder komma en dec (het aantal cijfers achter de komma). kommaErin zet in de kop en in elke rij een vast vakje met de komma; de kolommen heten dan T E , t h.
- Twee nieuwe doelen in de leerroute: komma-onderplus en komma-ondermin (cijferend, kolom voor kolom, met aanvullen met een nul). Ze staan in de paragraaf komma-plusmin van het opdrachtenboek en worden in een toets een echt invulschema (SCHEMADOEL in maken-kiezer.js).
- Grand Prix bij rekenen en wiskunde: standaard alleen hoofdrekenvragen (hoofdreken in server/prix.js, een schatting uit de tekst van de vraag); de docent kan Met rekenmachine kiezen, dan doen alle sommen mee en staat er een rekenmachine op het scherm van de leerling (st.rm).
- Inhalen op de baan (PRIX.veld): twee rijstroken. Een auto blijft in zijn strook tot hij een ander nadert, wijkt dan uit, en sluit achteraan als beide stroken bezet zijn.

## Tried and ruled out
- Keersommen met een komma in het schema: de tussenrijen kloppen dan niet meer met de kolommen. Alleen optellen en aftrekken.
- Drie stroken naast elkaar: de baan is te smal, de auto's overlappen dan toch.
- Alle sommen van het onderdeel cijferen weglaten bij hoofdrekenen: "Welk cijfer staat bij de tientallen" is wel hoofdrekenen. Alleen de sommen met "onder elkaar" vallen af.

## Watch out
- In de tekst van een vraag is 12:45 een tijd en 1 op 100 een schaal, geen deelsom: hoofdreken haalt die eerst weg.
- De komma is een vast vakje in de rij, geen invulvak: de antwoorden van de leerling tellen dus niet anders. juist en antwoordTekst (ook op de server, schemaJuist) zetten de komma terug in de tekst.
- In het beeld van de leerroute (onder) neemt de komma een plek in: kPos rekent een cijferplek om naar een tekenplek.
