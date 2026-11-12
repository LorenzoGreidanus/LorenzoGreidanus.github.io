---
title: "PMT: venster Nieuw na het inloggen, en markering van wat nieuw is ingevuld"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 12, tokens: 46055 }
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
- Na het inloggen komt er een venster Nieuw (toonNieuw in pmt/index.html, een dialog) met twee delen: wat een leerling of mentor heeft ingevuld en nog niet bekeken is, en wat er nieuw is in PMT zelf. Wegklikken onthoudt hij op het apparaat (localStorage pmt-nieuws en pmt-nieuw-ingevuld): hetzelfde komt niet opnieuw.
- Wat er nieuw is in PMT staat in NIEUWS in pmt/index.html (een id en een lijst punten). Bij een wijziging die de moeite van het melden waard is: nieuwe id en nieuwe punten.
- Nieuw ingevuld: kolom gezien op tabel meting, 0 bij invullen met een code, 1 bij invoeren door de therapeut. De lijst geeft per dossier het aantal mee, GET /api/pmt/dossiers ook de lijst nieuw. Een dossier openen zet alles van die leerling op bekeken (POST /api/pmt/dossiers/ID/gezien).
- Zolang het niet bekeken is staat er een stip in de zijbalk, een regel op de leerlingkaart en nieuw op het tabblad en bij de meting.

## Tried and ruled out
- Het venster wegklikken laten gelden als bekeken: dan raakt de therapeut het overzicht kwijt als ze snel doorklikt. De stip en de regel op de kaart blijven tot het dossier open is geweest.

## Watch out
- Het onthouden gaat per apparaat en browser: op een andere laptop komt het venster nog een keer.
- De demo deelt een account, maar ieder apparaat onthoudt zijn eigen wegklikken.
