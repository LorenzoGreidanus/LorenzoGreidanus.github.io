---
title: Donkertoets (server/audit-donker.js) en de toets-workflow
author: LorenzoGreidanus
date: 2026-10-20
branch: Live-branch
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
- Tikdoelen zijn minstens 44 bij 44 (min-height/min-width), ook pillen en jaartallen. Een ::after om het tikvlak te vergroten ziet de toets niet: maak het element zelf 44.
- De uitslag van de donkertoets staat in de samenvatting van de run ($GITHUB_STEP_SUMMARY), want het log van een run kan alleen wie op GitHub is ingelogd.
- De toets slaat over: spring-links buiten beeld of van 1x1, tekst op een uitgeschakelde knop (WCAG 1.4.3), tekst direct op een canvas (pixels onbekend), links midden in een zin (ouder met eigen tekst).
- Een kleurverloop telt als achtergrond: de slechtste kleur van het verloop telt.

## Tried and ruled out
- Het aftellen van Poortrace donkerblauw maken omdat de toets wit op de lucht afkeurde: de cijfers staan op de grijze weg (canvas), daar is wit juist goed.

## Watch out
- METEN in audit-donker.js is een template literal: elke backslash in een regex moet dubbel (\d, \().
- color(srgb r g b / a) heeft een doorzichtigheid achter de schuine streep.
- De hele toets duurt ruim 40 minuten; lokaal draai je hem op een paar pagina's: node server/audit-donker.js http://localhost:8765 pagina1 pagina2 (./index.html voor de voorpagina, anders pakt hij leermiddelen/index.html).
- Merkkleuren als --ocean kantelen niet mee in donker: een link of accent in --ocean heeft een eigen donkerregel nodig (#9FB8FF).
