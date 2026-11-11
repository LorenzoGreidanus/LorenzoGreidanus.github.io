---
title: "PMT wekelijkse check (EF-monitor): vaste code, raster, melding bij terugval"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 12, tokens: 54699 }
touches:
  - server/account.js
  - server/index.js
  - wrangler.jsonc
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- De EF-monitor is geen apart systeem maar een vragenlijst met monitor aan (vinkje in de lijstenmaker), met een schaal per vraag. Zo'n lijst staat niet bij de gewone vragenlijsten in het dossier maar in het vak Wekelijkse check, als raster van domeinen en weken.
- Vaste code (kolommen vast, door, laatst op afname): twaalf weken geldig, steeds opnieuw te gebruiken, hooguit een keer per zes uur; een voor de leerling en een voor de mentor. Een nieuwe vaste code vervangt de oude van dezelfde lijst en invuller.
- Een meting bewaart door (leerling of mentor) en monitor. Het raster toont de laatste tien keer per invuller. Terugval: de laatste keer twee stappen of meer lager dan de keer ervoor op een schaal van vijf; de melding zegt erbij of de andere invuller ook lager scoort.
- Voorbeeld: voorbeeldMonitor() met zes zelfbedachte zinnen; zaai geeft Sam acht weken van leerling en mentor met een terugval in de laatste week.

## Tried and ruled out
- Elke week een nieuwe eenmalige code laten klaarzetten: te veel werk voor de therapeut, daarom de vaste code.

## Watch out
- De mentor krijgt dezelfde zinnen in de ik-vorm van de leerling, met een regel uitleg erboven. Een eigen formulering per vraag voor de mentor is er niet.
- De afname-tabel krijgt haar nieuwe kolommen met ALTER TABLE in een try/catch in de constructor.
- "let" is een gereserveerd woord in strict mode: niet als naam van een variabele gebruiken in de pagina.
- Het scherm van de mentor is alleen via de api getest, niet doorgeklikt.
