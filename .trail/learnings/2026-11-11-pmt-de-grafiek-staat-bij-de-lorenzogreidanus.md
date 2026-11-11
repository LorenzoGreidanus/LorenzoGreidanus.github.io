---
title: "PMT: de grafiek staat bij de leerling, niet bij de vragenlijst"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 5, tokens: 30711 }
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
- De gebruiker wil de grafiek bij de leerling zien. Hij staat nu op het tabblad Overzicht van het dossier in het vak Ontwikkeling (#grafieken), en klein als lijntje op elke leerlingkaart (vonk). Het tabblad Vragenlijsten heeft alleen nog klaarzetten en de lijst van metingen.
- lijst() op de server ontsleutelt de metingen en geeft per leerling trend (gemiddelde per gewone meting, tussen 0 en 1, laatste acht), metingen en weekchecks apart.

## Tried and ruled out
- Een voorbeeld van de grafiek als derde stand in de lijstenmaker: de gebruiker wilde hem daar niet, hij is weer weg. grafiek(g, smal) bestaat nog maar wordt niet gebruikt.

## Watch out
- Een grafiek in een rastercel duwt de pagina breder op de telefoon als de kolom 1fr is: gebruik minmax(0,1fr) en min-width:0 op de cel en op .grafiek.
- .kaart is ook de klasse van de inlogkaart: zoek leerlingkaarten met #kaarten .kaart.
