---
title: Plan PMT-omgeving op pmt.meneergreidanus.nl
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 4, tokens: 92289 }
touches:
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-26T11-59-34Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-26T18-38-29Z__leermiddelen-familie-vakspellen.md"
  - ".impeccable/critique/2026-09-26T18-38-30Z__leermiddelen-familie-actiespellen.md"
---

## Decided
- Voorstel (11 nov 2026) staat als Claude-artifact, niet in de repo: https://claude.ai/artifact/NWXsHKxsRFNvEJCL4n4295. Er is nog niets gebouwd.
- Drie onderdelen: vragenlijsten (zelf maken, klaarzetten met eenmalige code, leerling zonder account), dossiers per leerling (metingen, grafiek per schaal, notities, doelen, bestanden), EF-monitor (wekelijkse check van zes vragen, raster per domein, melding bij terugval).
- Inlog: de bestaande Microsoft-inlog uit server/account.js als basis, maar strenger: alleen de huurder van de school plus een toegangslijst. PMT krijgt een eigen adres, eigen opslag en eigen sessie, los van de spellen.
- Bouwen en testen met verzonnen leerlingen. Echte leerlingen pas na akkoord van de privacyfunctionaris van de school en een verwerkersovereenkomst.

## Tried and ruled out
- Entree-inlog: vraagt een aansluiting bij Kennisnet met contract en toetsing, te zwaar voor een gebruiker die al een Microsoft-account heeft.
- Vragenlijsten van uitgevers (zoals de BRIEF) overtypen: auteursrecht en normtabellen onder licentie. Alleen schaalscores invoeren of toestemming vragen.

## Watch out
- Het gaat om gezondheidsgegevens van minderjarigen: opslag in de EU, versleuteld, logboek van inzage, zo weinig mogelijk persoonsgegevens, export en verwijderen per dossier.
- EF is gelezen als executieve functies; dat is nog niet bevestigd.
- Welke vragenlijsten de collega nu gebruikt is nog onbekend en bepaalt het ontwerp van de lijstenmaker.
