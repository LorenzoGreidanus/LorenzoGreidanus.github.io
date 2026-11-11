---
title: "PMT nieuw ontwerp: overzicht met kaarten, dossier in tabbladen, telefoon"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 37, tokens: 153492 }
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
- Het beginscherm is een overzicht met een kaart per leerling, zoeken en een filter op status (tekenLeeg, tekenKaarten). De server geeft per dossier het aantal metingen, de laatste meting en het aantal open codes mee in lijst().
- Het dossier heeft tabbladen (Overzicht, Notities, Vragenlijsten, Wekelijkse check). Alle delen staan in #dossier en de css toont er een per data-tab, zodat velden hun inhoud houden bij wisselen. Bovenaan het overzicht vier tegels; tekenKort ververst tegels en tellers bij elke wijziging.
- Telefoon (tot 860 breed): de zijbalk wordt een balk onderin met Overzicht, Vragenlijsten, Logboek en Uitloggen (display:contents op .nav en .zijvoet); de leerlingen staan dan alleen op het overzicht en het dossier heeft een terugknop.
- De grafiek en het raster schuiven op een smal scherm zijwaarts in hun eigen vak; de eerste kolom van het raster blijft staan.

## Tried and ruled out
- Het dossier als een lange pagina met alle vakken onder elkaar: te veel schuiven, vooral op de telefoon.

## Watch out
- Het aantal op de leerlingkaart telt gewone lijsten en wekelijkse checks samen: de server kan ze niet uit elkaar houden zonder elke meting te ontsleutelen.
- tekenKort draait bij elke toetsaanslag (via wijzig): houd het licht en laat het de pagina niet verticaal schuiven.
