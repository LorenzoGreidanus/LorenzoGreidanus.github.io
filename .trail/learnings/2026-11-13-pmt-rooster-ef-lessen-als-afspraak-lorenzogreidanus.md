---
title: "PMT rooster: EF-lessen als afspraak zonder leerling"
author: LorenzoGreidanus
date: 2026-11-13
branch: Live-branch
cost: { minutes: 18, tokens: 273390 }
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
Een EF-les in het PMT-rooster is een afspraak met soort "les": geen dossier, de klas of groep in het veld tekst. Hij mag over meer blokken lopen (server: lesPast in server/pmt.js), houdt bij verplaatsen zijn eigen lengte en heeft geen aanwezigheid. In het scherm: derde keuze in toonPlan, eigen blok in het raster (.blok.vol.les), regel in Vandaag. metLeerling(a) zegt of een afspraak een leerling heeft.

## Watch out
Elke plek die a.soort !== "dicht" gebruikt om leerlingafspraken te bedoelen moet ook "les" uitsluiten. Bij een reeks verwijderen zonder leerling telt alleen dezelfde soort mee, anders gaan dichte blokken op hetzelfde tijdstip ook weg. In testscripts: .planpaneel is ook het paneel Dagindeling; zoek het formulier via #plan-wie.
