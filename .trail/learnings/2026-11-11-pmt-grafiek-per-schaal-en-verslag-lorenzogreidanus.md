---
title: PMT grafiek per schaal en verslag om te printen
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 4, tokens: 36488 }
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
- De grafiek wordt in de pagina getekend (pmt/index.html: groepen, grafiek, vergelijk, grafiekVak), een vak per vragenlijst: een lijn per schaal met naam en laatste score aan het eind van de lijn, en eronder de eerste meting naast de laatste met het verschil.
- Elke lijn heeft een eigen puntvorm naast de kleur; kleuren zijn tokens --reeks0 tot --reeks4 met eigen waarden voor donker en voor papier.
- Het verslag is een scherm in dezelfde pagina (tekenVerslag) met een printstijl die de zijbalk en knoppen weglaat. Notities gaan alleen mee als het vinkje aan staat. Elk verslag komt in het logboek via POST /api/pmt/dossiers/ID/verslag.

## Tried and ruled out
- Voorbeeldmetingen waarin twee schalen dezelfde scores hadden: de lijnen lagen precies op elkaar en een verdween. De voorbeeldcijfers verschillen nu; bij echte gegevens kan het nog steeds, de namen aan het eind blijven dan wel alle drie staan.

## Watch out
- Hoe het verslag er op papier uitziet is niet nagekeken, alleen op het scherm.
- Bij meer dan vijf schalen herhalen de kleuren zich (met een streepjeslijn vanaf de zesde).
