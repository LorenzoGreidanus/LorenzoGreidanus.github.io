---
title: "PMT wachtrij: lijst met vast paneel en eerste vrije plekken"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 10, tokens: 103802 }
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
De wachtrij van PMT volgt het ontwerp op https://claude.ai/artifact/9e5GFgPfaXeUDhdAe2rLwa: links een lijst (button.wachtrij met nummer, wachttijd als balk, stand van de toestemming), rechts het vaste paneel (.zijpaneel.wachtpaneel) met drie standen in S.wachtPaneel: detail, aanmelden, klaar. Het paneel toont de eerste vrije plekken uit GET /api/pmt/wachtrij/plekken (server: vrijePlekken en openBlokken) met de knop Intake hier; dat is een gewone POST /afspraken met soort intake, waarna vanWachtrij het dossier op intake zet. Ongedaan maken zoekt de afspraak op in het rooster van die week, haalt hem weg en zet het dossier terug op wacht.

## Watch out
vrijePlekken geeft per schooldag het eerste lege blok van minstens 20 minuten, slaat weekenden en vrije dagen over en kijkt hooguit 90 dagen vooruit. openBlokken op de server moet gelijk blijven aan maakBlokken in het scherm. Van de wachtrij af verwijdert het hele dossier, met een tweede klik als bevestiging.
