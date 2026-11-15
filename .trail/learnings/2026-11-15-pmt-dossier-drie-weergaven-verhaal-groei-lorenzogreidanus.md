---
title: "PMT dossier: drie weergaven (Verhaal, Groei, Gegevens)"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 25, tokens: 323593 }
touches:
  - pmt/index.html
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-26T11-59-34Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-26T18-38-29Z__leermiddelen-familie-vakspellen.md"
---

## Decided
- Het dossier in pmt/index.html heeft drie weergaven via #dossier[data-tab]: verhaal, groei, gegevens. Kinderen dragen p-verhaal, p-groei of p-gegevens (p-afspraken hoort bij gegevens).
- De oude tabnamen (overzicht, notities, lijsten, week, afspraken) werken nog via TABNAAR in kiesTab en openDossier; kiesTab scrolt naar het juiste vak (vak-lijsten, vak-week, .p-afspraken, doel-nieuw).
- Verhaal: tekenTraject (svg op een tijdlijn), tekenTijdlijn (een kaart per dag, notities bewerk je ter plekke met notitieBlok), tekenNu (volgende sessie, doelen, hulpvraag, open punten uit fasenData).
- Groei: tekenGroei vult #groeibox (kerncijfers, lijvenRij, halterVak, Wat valt op); zelfZien toont alleen beelden aan de leerling. De vaste vakken eronder (#grafieken, #klaarzet, #metingen, #monitor) vult tekenMetingen nog steeds.
- Zonder toestemming opent een dossier op Gegevens; Verhaal en Groei tonen dan een slot.

## Tried and ruled out
- Het trajectbeeld met viewBox 900 breed: de letters werden op een laptop te klein. Nu 640.

## Watch out
- Flex- en gridkinderen met een brede svg duwen de pagina breder: min-width:0 en max-width:100% op de kinderen van .verhaal, .verhaalhoofd, .traject en #groeibox.
- Op smal scherm is .nukolom display:contents, zodat de volgende sessie boven het verhaal komt en de rest eronder (order).
- tekenKort tekent alleen nog de schakelaar; tegels bestaan niet meer.
