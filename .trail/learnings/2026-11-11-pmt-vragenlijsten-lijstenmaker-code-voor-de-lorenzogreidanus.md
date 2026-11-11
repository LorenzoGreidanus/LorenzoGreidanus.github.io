---
title: "PMT vragenlijsten: lijstenmaker, code voor de leerling, scores per schaal"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 8, tokens: 78693 }
touches:
  - server/account.js
  - server/index.js
  - wrangler.jsonc
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- Vragenlijsten in server/pmt.js: tabellen lijst (gewone json), afname (code, kopie van de lijst, geldig tot middernacht Nederlandse tijd) en meting (versleuteld). De leerling heeft geen account: GET en POST /api/pmt/afname/CODE staan voor de sessiepoort, met een teller op foute codes.
- Metingen en open codes staan los van het dossier en komen alleen mee bij het lezen (d.metingen, d.afnames). De pagina haalt ze weg voor een PUT. Zo kan een dossier dat openstaat nooit overschrijven wat een leerling net instuurde.
- Bij klaarzetten gaat een kopie van de lijst mee met de code, en de meting bewaart titel, schaalscores en antwoorden. Een lijst later aanpassen of weggooien verandert oude metingen niet.
- Score per schaal is het gemiddelde (1 tot het aantal antwoorden), omgekeerde vragen omgerekend (reken in pmt.js).
- Leerlingscherm: pmt/invullen.html, op het echte adres /invullen, lokaal /pmt/invullen. De code kan in de hash meekomen (samen invullen) en wordt daarna uit het adres gehaald.

## Tried and ruled out
- Metingen in het dossierdocument zelf bewaren: het automatisch opslaan van een open dossier zou ze wissen.

## Watch out
- invullen.html noemt mevrouw Schipper bij naam; bij een tweede therapeut moet de naam uit de afname komen.
- De grafiek en de EF-monitor zijn er nog niet. Het voorbeeld (zaai) geeft Sam drie metingen om de grafiek mee te bouwen.
- Patchscripts met regexen: schrijf ze met Write naar de scratchpad en draai ze met node, dan blijven de backslashes heel.
