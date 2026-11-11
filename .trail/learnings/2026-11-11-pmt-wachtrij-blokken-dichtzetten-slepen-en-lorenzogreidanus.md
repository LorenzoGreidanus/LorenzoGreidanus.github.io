---
title: "PMT: wachtrij, blokken dichtzetten, slepen en inplannen tot einde schooljaar"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 12, tokens: 94567 }
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
- De wachtrij is geen aparte lijst maar een status van het dossier: wacht. Het dossier heeft aangemeld (datum), door en voorrang. De volgorde is voorrang eerst, daarna wie het langst wacht (wachtrij() in pmt/index.html). Leerlingen met status wacht staan niet tussen de leerlingkaarten en niet in de zijbalk.
- Krijgt iemand van de wachtrij een afspraak (klikken of slepen), dan zet de server het dossier op intake en vult de startdatum (vanWachtrij in server/pmt.js).
- Een dichtgezet blok is een afspraak zonder dossier met soort dicht en een korte tekst (kolom tekst). Het telt als bezet, dus er kan geen leerling op. De hele dag dichtzetten is een blok van begin tot eind van de dag en lukt alleen op een dag zonder afspraken.
- Inplannen kan tot het einde van het schooljaar (instelling eind, standaard 16 juli, zelf in te stellen als Laatste schooldag) of tot een gekozen datum, hooguit 53 weken. Een reeks haal je weg met DELETE ?reeks=1: alle latere van dezelfde leerling op dezelfde weekdag en tijd.
- Slepen: een leerling uit de rij of van de wachtrij naar een leeg blok, een afspraak of dicht blok naar een ander blok (PUT /api/pmt/afspraken/ID). Zonder muis: Verplaatsen en dan een leeg blok aantikken.

## Tried and ruled out
- Vakanties vanzelf overslaan bij een reeks: de vakantiedata verschillen per regio en jaar. De therapeut zet die weken dicht of haalt ze weg; de melding zegt dat erbij.

## Watch out
- De eerste .melding in het document is de verborgen melding van de inlogkaart: zoek meldingen binnen #scherm.
- De balk onderin heeft op de telefoon nu zes knoppen van elk ongeveer 60 pixels; er kan er geen meer bij.
