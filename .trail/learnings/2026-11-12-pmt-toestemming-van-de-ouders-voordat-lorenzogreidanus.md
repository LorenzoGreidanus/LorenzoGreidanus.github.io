---
title: "PMT: toestemming van de ouders voordat er iets verwerkt wordt"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 9, tokens: 59806 }
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
- Elk dossier heeft toestemming: status (geen, gevraagd, ja, nee), datum en door wie getekend. Het vak staat bovenaan het tabblad Overzicht.
- Zonder status ja legt het dossier alleen de aanmelding vast. De server houdt het zelf tegen: bij bewaren blijven notities en doelen zoals ze waren, en een code klaarzetten of een papieren lijst invoeren geeft 403 (magVerwerken in server/pmt.js). De pagina toont die onderdelen dan als een vak op slot.
- Inplannen in het rooster mag wel zonder toestemming, bijvoorbeeld voor het intakegesprek waarin het formulier wordt meegegeven.
- Het formulier om te printen (tekenToestemming) heeft een tekst die voor alle leerlingen geldt en aan te passen is (tabel stand, k toestemming); leeg maken zet de standaardtekst terug. Onderaan aankruisvakjes en tekenregels voor twee ouders en de leerling vanaf 12 jaar.
- De naam van de therapeut is van de inlogkaart gehaald.

## Tried and ruled out
- Notities en doelen wissen als de toestemming wordt teruggezet: dan raakt werk kwijt. Ze blijven staan, er kan alleen niets bij.
- Digitaal tekenen door ouders met een code: niet gebouwd; eerst moet de school bepalen of dat als handtekening telt.

## Watch out
- De standaardtekst is een voorstel en geen juridisch advies: de privacyfunctionaris moet hem nakijken, en ook of toestemming hier de juiste grondslag is.
- invullen.html noemt de therapeut nog bij naam.
- Een dossier van voor deze wijziging heeft geen toestemming en staat dus op slot tot het wordt vastgelegd.
