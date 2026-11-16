---
title: Opdrachten herbouwd en beveiligingsronde (v470)
author: LorenzoGreidanus
date: 2026-11-16
branch: Live-branch
touches:
  - leermiddelen/bank.js
  - leermiddelen/klas.html
  - leermiddelen/topografie.html
  - nieuw.html
  - server/index.js
  - server/kamer.js
  - server/materiaal.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
---

## Decided
- Opdrachten in klas.html heeft vier zichten (opToon): lopend, elke week, afgelopen, nieuw. Elke opdracht gaat door opModel(o) naar een vaste vorm (per leerling klaar, bezig of niet); opKaart, de balk en de tegels bovenaan lezen alleen die vorm. Een nieuw soort opdracht krijgt dus een tak in opModel en niets anders.
- De oude keuzelijst #opSpel bestaat nog, verborgen: de tegels (opTegels) zetten selectedIndex en sturen een change. Zo blijft alle bestaande formulierlogica (dictee, tafeltoets, leerroute, oefeningen) ongemoeid. Hetzelfde voor #opVak met de vakknoppen.
- "Een week langer" is een eigen bericht aan de server ({ sleutel, langer: id }); alleen opdrachten met een eigen datum, nooit verder dan 120 dagen.
- Afgelopen is wat de server nog heeft met tot < nu; ze tellen mee voor de vijf.
- Beveiliging: klas.html nam postMessage van elk venster aan (werkblad-keuzes) en zette aantallen ongefilterd in innerHTML. Nu alleen het eigen kader (origin en source) en alleen getallen.
- Namen en kopjes van Eigen materiaal gaan zonder punthaken de server in en uit (tn in materiaal.js, ook bij haal voor wat er al stond); bank.js en topografie.html halen ze er zelf ook uit.
- eigenSite laat een Origin van localhost alleen toe als de server zelf lokaal draait. klas-mis remt 404 en 403 op /api/klas/CODE en /mijn. Sleutels vergelijken met zelfde().

## Tried and ruled out
- Punthaken overal op de server weghalen (in t of schoon): vragen en antwoorden hebben ze nodig (3 < 5). Alleen namen en kopjes.
- Het formulier opnieuw schrijven rond de tegels: te veel takken; de verborgen keuzelijst is de bron gebleven.
- Een eigen rooster per week voor de tafeltoets: blijft uitgesloten; het weekoverzicht toont "dezelfde tafels, tot je ze aanpast".

## Watch out
- De rem van de poortwachter gaat lokaal (wrangler dev) nooit af, ook de bestaande kamer-mis niet: lokaal kun je hem niet testen.
- De testscripts sturen snel veel berichten: twee keer achter elkaar draaien loopt tegen de rem van 40 per minuut op /opdracht aan en lijkt dan een fout.
- VAKKEN en ONDERDELEN zien eruit als vaste lijsten, maar bank.js vult ze bij ?vak=eigen met tekst van iemand anders; toren.html, zwaard.html en kaarttoren-scherm.js zetten ze zonder schoon in innerHTML.
- De server haalt alleen bij leerlingnamen (naamfilter nette) html-tekens weg; verder moet elke pagina zelf schoon() gebruiken.
