---
title: "Leestoets: scènes bij vragen en teksten, oefentoetsen A en B"
author: LorenzoGreidanus
date: 2026-11-05
branch: Live-branch
touches:
  - leermiddelen/leestoets.js
  - leermiddelen/maken-kiezer.js
  - leermiddelen/maken.html
  - leermiddelen/werkblad-samen.js
  - server/materiaal.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
- Pictures in the ready-made reading tests are drawn scenes that show the situation in the question, not icons: the user rejected icons. Files are leermiddelen/beeld/lees/s-<naam>.svg (questions, 480x270) and s-tekst-<leesbank-id>.svg (texts, 480x200). Style: flat shapes, navy outline 2.5, brand colours and their tints, no green, people only as AVATAR faces with a coloured ring.
- A loose question gets `plaatje:'naam'` (or KLAAR[id].beelden in order); LEESTOETS.metPlaatjes(m) turns the svg into a jpeg afbData via KIEZER.plaatje, and saving uploads it like any teacher image. LEESTOETS.html(tk) puts the text scene under the title for ids in TEKSTBEELD.
- Practice tests oefen-strategie-signaal-verwijs-1f-a and -b (modus oefenen) use other leesbank texts and other loose questions than the real 1F test, so students do not practise the test itself.
- MAX_AFB went from 12 to 30 images per test (server/materiaal.js plus maken.html plaatjesVrij, maken-kiezer.js, werkblad-samen.js).

## Watch out
- A test saved before this change keeps its old images; the teacher reopens the ?leestoets= link and saves again.
- A scene must not show an answer from the text (no times, prices or rules from the text).
