---
title: "Archief in Mijn materiaal, leesteksten heel op een bladzijde"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
touches:
  - leermiddelen/eigen.js
  - leermiddelen/leesblad.js
  - leermiddelen/leestoets.js
  - leermiddelen/maken.html
  - leermiddelen/opdrachtenboek.js
  - leermiddelen/werkblad-lezen.js
  - server/account.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
---

## Decided
- Mijn materiaal heeft een archief: op het lijstitem in de eigen lijst (lg-materiaal) staan arch (1) en archT (moment van de keuze). EIGEN.archief(code, aan) zet ze en stemt af met het account. maken.html toont gearchiveerde stukken alleen op het tabblad Archief en telt ze nergens anders mee; het menu per rij heeft Naar het archief of Terug uit het archief.
- Het archief verbergt alleen: de code blijft werken en de resultaten blijven staan. Weghalen blijft de enige manier om iets echt te verwijderen.
- Bij afstemmen wint de nieuwste archT, op de server (account.js /materiaal) en in de browser (eigen.js afstemmen). Zo draait een apparaat dat van niets weet het archief niet terug.
- Een leestekst staat op papier in zijn geheel op een bladzijde: in leesblad.js krijgt .lb[class*="lb-v-"] en li.lb-li.tekstblok in print break-inside:avoid. leesblad.js wordt nu geladen met ?v=4.

## Tried and ruled out
- Gearchiveerde stukken uit EIGEN.mijn() filteren: mijn() levert ook de sleutel voor resultaten en bewerken, dus die moet alles blijven geven.
- Het archief alleen in de browser bewaren: de server schreef het lijstitem over zonder onbekende velden, dus het zou bij afstemmen verdwijnen.

## Watch out
- EIGEN.bewaar bouwt het lijstitem opnieuw op: arch en archT gaan uitdrukkelijk mee, een nieuw veld op het lijstitem moet daar ook bij.
- De kiezers bij de klasspellen en in klas.html tonen gearchiveerde stukken nog wel.
- De server maakt van een onbekende soort (ook topo) een oefening en bewaart modus niet; dat was al zo en is niet aangepast.
- .lb-tekst had bewust break-inside:auto. Een tekst die langer is dan een bladzijde loopt nog steeds door.
- Niet getest: het archief met een echt ingelogd account, en een geprinte papieren toets met tekst.
