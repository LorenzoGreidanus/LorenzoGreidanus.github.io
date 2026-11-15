---
title: "PMT vragenlijsten: wat uitstaat en klaarzetten voor meer leerlingen"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 15, tokens: 136877 }
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
De pagina Vragenlijsten van PMT volgt het ontwerp op https://claude.ai/artifact/SJuzF29CoHfFVDVhfoRc8n: Nieuw ingevuld (uit S.nieuw), Staat uit (GET /api/pmt/afnames, server: uitstaand) en Mijn lijsten, met rechts het vaste paneel om klaar te zetten. In het paneel kies je een of meer leerlingen; bij een wekelijkse check ook wie invult (leerling, mentor, allebei). De codes worden een voor een gemaakt met de bestaande POST /dossiers/ID/afname. In de maker staan terug en opslaan bovenaan, volgt het voorbeeld de vraag waar je op staat, en maakt Enter een nieuwe vraag.

## Tried and ruled out
Een gewone meting door de mentor laten invullen of langer dan vandaag laten gelden: de server kent dat alleen voor de wekelijkse check (vaste code, twaalf weken). Het paneel biedt het daarom alleen daar aan.

## Watch out
Een vaste code die deze week al is ingevuld telt niet als uitstaand. Het paneel in rust is op smalle schermen verborgen (.wachtpaneel.rustig). In de browserpane vuurt element.focus() geen focus-event af als de pane geen focus heeft: test met dispatchEvent(new FocusEvent).
