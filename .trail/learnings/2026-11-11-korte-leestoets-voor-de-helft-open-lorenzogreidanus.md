---
title: Korte leestoets voor de helft open vragen
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
touches:
  - leermiddelen/leestoets.js
  - sw.js
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
- De korte leestoets (strategie-signaal-verwijs-1f-kort) is voor de helft open: 7 van de 14. Vier meerkeuzevragen met een antwoord van een woord of naam zijn open geworden (de eieren, tegenstelling, zodat, Lisa).
- In leestoets.js maakt alsOpen(x, antwoorden) van een meerkeuzevraag een open vraag. Een los item gaat via pak(i, antwoorden); een vraag bij een tekst via d.open in het deel: { nummer: antwoorden }, met het nummer uit vragen(t, doelen), hetzelfde als in kies.
- De gebruiker wil in het algemeen meer open vragen en minder meerkeuze, ook in toetsen.

## Tried and ruled out
- Alle meerkeuzevragen open maken: bij "Wat duurt twee minuten?" en "Welk verband geeft daardoor?" schrijven leerlingen het antwoord op te veel manieren op om eerlijk automatisch na te kijken.

## Watch out
- Een toets die de docent al bewaarde verandert niet mee met KLAAR: opnieuw openen via de link en bewaren.
- De lange toetsen en de oefentoetsen zijn niet aangepast (70 tot 75 procent meerkeuze).
