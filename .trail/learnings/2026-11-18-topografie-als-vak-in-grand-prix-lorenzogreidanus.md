---
title: Topografie als vak in Grand Prix en Dijkbouwers (v474)
author: LorenzoGreidanus
date: 2026-11-18
branch: Live-branch
touches:
  - leermiddelen/dijk.html
  - leermiddelen/prix-bord.html
  - leermiddelen/prix.html
  - leermiddelen/strijd.html
  - server/kamer.js
  - server/prix.js
  - server/stadvragen.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
---

## Decided
- Topografie is een vak (vak "topo", de kaart in deel) in Grand Prix en Dijkbouwers. raceBereid in kamer.js laadt dan laadTopo (stadvragen.js) in plaats van de vragenbank.
- Elke plek geeft twee vragen in de vorm van de bank: soort "naam" (de plek licht op, vier namen) en soort "wijs" (de leerling klikt de plek aan en de pagina stuurt de naam terug in m.naam). De kamer vergelijkt de naam met het goede antwoord.
- De namen en niveaus per kaart staan in leermiddelen/stad-vragen/topo.json, gemaakt door server/maak-topovragen.js uit topo-kaarten.js. Alleen kaarten met vlakken of stippen.
- De kaart tekent de pagina met topo-vraag.js (TOPOVRAAG.toon en merk); topo-kaarten.js komt pas binnen bij de eerste vraag.
- Het niveau van de docent is hier hoeveel plekken: bb is Basis, kgt Uitgebreid, havo Alles.
- Voor de nabespreking heeft een topovraag een eigen sleutel (sl), want "Welk land licht op?" is voor elke plek dezelfde tekst.

## Tried and ruled out
- De kaart over het circuit heen leggen met het circuit in een hoek: de hoek dekte Zuid-Afrika en Madagaskar af. Het circuit staat nu smal naast de kaart.
- De naam laten typen: in een race kosten spelfouten plekken. Vier namen om uit te kiezen.

## Watch out
- Verandert topo-kaarten.js, draai dan node server/maak-topovragen.js opnieuw, anders kloppen de nummers van de plekken niet meer met de kaart.
- Een vraag zonder antwoorden (aanwijzen) werd door de pagina van Grand Prix weggegooid: de controle op b.o moet topo wijs doorlaten.
- Bij een naamvraag krijgt de pagina het nummer van de plek die oplicht; wie in de code kijkt kan het antwoord dus vinden.
