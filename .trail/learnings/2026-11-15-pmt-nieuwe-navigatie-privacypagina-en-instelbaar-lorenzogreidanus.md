---
title: "PMT: nieuwe navigatie, privacypagina en instelbaar uitloggen"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 15, tokens: 160592 }
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
De navigatie van PMT is vernieuwd naar https://claude.ai/artifact/R14AMk2qEBjZHyjsrCfzJ7. Zijbalk: Vandaag (was Overzicht), tellers bij Wachtrij, Vragenlijsten en Privacy, een zoekveld (S.zijZoek), wie er vandaag komt bovenaan de leerlingen, afgeronde dossiers achter een regel. Telefoon: vijf tabs (Vandaag, Rooster, Leerlingen, Lijsten, Meer); Wachtrij, Privacy en Uitloggen staan in het scherm Meer (tekenMeer), de leerlingentabel staat op de tab Leerlingen (tekenLeerlingen) en niet meer op het overzicht. De privacypagina (tekenLogboek) heeft Te regelen (privacyTaken), bewaartermijn als knoppen, automatisch uitloggen, een logboek met filter en een paneel voor een verzoek van ouders of leerling.
Automatisch uitloggen is instelbaar: 15, 30, 60 of 120 minuten (PUT /api/pmt/sessie, stand sessie in de Durable Object, de duur zit als min in het ondertekende sessiekoekje). De grens van tien uur blijft.

## Watch out
Knoppen met klasse nietintel staan niet in de onderbalk, alleentel alleen daar; de volgorde op de telefoon komt uit css order. S.pv (bewaartermijn en agendalink) wordt na het inloggen opgehaald met laadPv, zonder dat telt de teller bij Privacy alleen de toestemmingen. Het logboek van een dossier bekijken met ?kijk=1 schrijft een eigen regel, anders staat er inzage uitgedraaid.
