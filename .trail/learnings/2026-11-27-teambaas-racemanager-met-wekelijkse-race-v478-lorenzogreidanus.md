---
title: "Teambaas: racemanager met wekelijkse race (v478)"
author: LorenzoGreidanus
date: 2026-11-27
branch: Live-branch
touches:
  - index.html
  - leermiddelen/index.html
  - server/index.js
  - sitemap.xml
  - sw.js
  - wrangler.jsonc
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
- Teambaas is een racemanager voor ingelogde leerlingen (Microsoft-account). Durable Object `Teambaas` (binding TEAMBAAS, migratie v12): object `t:<accountKenmerk>` per team en `liga` voor divisies van 10 (aangevuld met computerteams) en de race elke zondag 20.00 Nederlandse tijd op de F1-baan van die week.
- Gedeelde regels en banen in leermiddelen/teambaas-data.js (UMD, ook geïmporteerd door de server). T.profiel(baan) bepaalt per baan snelheid per plek, rechte stukken (st), motor- versus aero-gewicht en de soort (snel/gemengd/bochtig).
- De race wordt server-side gesimuleerd (simuleer in server/teambaas.js): banden, pitstops, gele vlag per sector, safety car na een crash, batterij (laden in de bochten, geven op rechte stukken, laadsnelheid per baan afgesteld), active aero op stukken met st > 0.85 en overtake mode binnen 1 seconde bij het begin van zo'n stuk. Overtake mode staat compact in sim.ot als [begin, auto, eind], de batterij in sim.accu om de 6 s.
- Vragen komen server-side uit de stad-vragen met een eenmalig token; te veel fout geeft meer kans op uitval.
- Homepagina heeft een Teambaas-banier met de baan van de week en aftellen (laadt teambaas-data.js).
## Tried and ruled out
- Pitstraat onder de hele baan tekenen: de uitloopstrook dekte de in- en uitrit af. Nu via baanLagen(opties.voorRand) tussen uitloopstrook en witte rand.
- Gele vlag als doorzichtige laag over het asfalt: werd bruin. Nu als gele randen (opties.voorAsfalt).
- Overtake-gebeurtenissen als losse objecten in gebeurt: maakte de race tot 100 kB.
## Watch out
- Testen lokaal met ?test=naam op de worker (8787) zolang er geen Microsoft-inlog is ingesteld; scratchpad teambaas-bouw/apitest.js, simtest2.js, simtest3.js.
- window.TBRACE geeft de racestand, zodat een test naar een moment kan springen.
- Nieuwe onderdelen moeten op vijf plekken: ONDERDELEN, nieuwTeam, huidig/zetNiveau, snap, de bots en de /lees-uitvoer.
