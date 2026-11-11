---
title: "PMT rooster: vakanties, studiedagen en feestdagen"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 8, tokens: 48390 }
touches:
  - pmt/index.html
  - server/pmt.js
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
- Vakanties en vrije dagen zijn een lijst van perioden met een naam, bewaard in tabel stand (k vrij). Een studiedag of feestdag is een periode van een dag. Het rooster toont zo'n dag als een vrije kolom met de naam.
- Inplannen op een vrije dag wordt geweigerd; een wekelijkse reeks slaat vrije dagen over en meldt hoeveel. Verplaatsen naar een vrije dag kan ook niet.
- Schoolvakanties ophalen: GET /api/pmt/rooster/vakanties haalt ze bij de Rijksoverheid (opendata.rijksoverheid.nl/v1/infotypes/schoolholidays/schoolyear/JJJJ-JJJJ?output=json) voor regio noord, midden of zuid. De server bewaart niets: de pagina zet ze in de lijst en de therapeut slaat zelf op, want een school kan afwijken.
- Feestdagen rekent de pagina zelf uit vanaf Pasen (Goede Vrijdag, tweede paasdag, Koningsdag, Bevrijdingsdag, Hemelvaart en de dag erna, tweede pinksterdag); wat een gewone schooldag is haalt de therapeut weg.
- Na het opslaan telt de server de afspraken die nog op vrije dagen staan; met ruim haalt hij ze weg.

## Tried and ruled out
- Het adres met /sources/rijksoverheid/ erin uit oudere voorbeelden: geeft 404. Het werkende adres heeft dat stuk niet.

## Watch out
- De namen in die gegevens staan tussen veel witruimte: eerst trimmen en dan pas afkappen, anders blijft er een halve naam over.
- De einddatum staat er als 21:59 of 22:59 UTC: de eerste tien tekens zijn de goede dag.
