---
title: "PMT rooster: vast paneel rechts en instellingen in een lade"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 20, tokens: 552686 }
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
Het PMT-rooster volgt het ontwerp op https://claude.ai/artifact/FmxubtCpAUNJdauzTXTbPH: links het raster, rechts een vast paneel (.zijpaneel). Daarin staat #planpaneel (inplannen, een afspraak) en daaronder .rust (leerlingen en wachtrij om te slepen); css verbergt .rust zodra #planpaneel niet leeg is. De drie instellingen (dagindeling, vakanties, agenda) staan in een lade (.instlaag) achter een knop Instellingen. De duur van een blok staat in de tijdkolom; een leeg blok is leeg en een pauze heet alleen Pauze. Keuzes met weinig opties zijn knoppen (pillen(select, label): de select blijft verborgen de waarde houden).

## Watch out
Onder 1180 breed staat het paneel boven het raster, onder 760 is de rustlijst weg. Met een eigen indeling per dag (perDagAnders) is er geen tijdkolom en staan tijd en duur weer in het blok. De schakelaar Leerling, EF-les, Dicht is gestijld op #planpaneel .filter, niet op .planpaneel, anders pakt hij de dagkiezer in de instellingen mee. In testscripts na navigeren minstens 3 seconden wachten voor het rooster er staat.
