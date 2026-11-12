---
title: "Gemeenteraad: leerlingen per fractie op het bord, eerst alle fracties dan inwoners"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
touches:
  - leermiddelen/gemeenteraad.html
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
- Gemeenteraad, bord bij de formatie: bij elke fractie staan de leerlingen die erin zitten (ledenHtml, met gezichtje), en daaronder wie inwoner is. Alleen in de telefoonmodus.
- Rolverdeling (deelRollen): eerst krijgt elke fractie een leerling. Inwoners komen er pas vanaf de zesde leerling bij: inw = max(0, min(n - 5, n < 12 ? 2 : min(6, rond(n * 0,2)))).
- De formatiekaart op de telefoon heeft als kopje "jij bent raadslid van X"; een inwoner ziet "Jij bent inwoner van Molenveen".
- Een laatkomer tijdens de formatie: iedereen krijgt zijn rolkaart opnieuw (stuurRollen), want de namen in de fractie zijn veranderd.

## Tried and ruled out
- De klacht "leerlingen weten hun rol niet bij de coalitiebouwer" op de telefoon zoeken: daar stond de rol al sinds v455. Het bord toonde alleen "1 leerling" per fractie; dat was het gat.

## Watch out
- Testen: scratchpad dijkspel/raad.js met zes nep-leerlingen op de preview "worker" (8787). Alleen de klas van zes is in de browser gespeeld; de andere groottes zijn nagerekend.
- Bij de start staat er al een coalitie aangevinkt (Lokaal en Ondernemend); dat was al zo.
