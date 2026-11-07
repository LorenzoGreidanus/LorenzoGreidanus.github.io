---
title: Opdrachtenboek voor economie en Engels
author: LorenzoGreidanus
date: 2026-11-07
branch: Live-branch
touches:
  - leermiddelen/maken-kiezer.js
  - leermiddelen/opdrachtenboek.js
  - leermiddelen/werkblad-boek.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
---

## Decided
- BOEK.economie (5 themes, 25 paragraphs) and BOEK.engels (5 themes, 31 paragraphs) are built from the existing leerroute goals plus the vak's question bank; every leerroute goal and every bank question of both vakken lands in at least one paragraph.
- The engine is no longer Nederlands-only: BANKVAK maps a book vak to its bank code (ned, eco, eng); a bank spec is { t (omit = all onderdelen), zoek (regex on the question), nivo:[..] (exact bank levels) }; PERSCHOOL has an entry per vak (Engels: bb A1/A2, kgt A2/B1, havo/vwo B1/B2; economie: no split).
- werkblad-boek.js VAKKEN and maken-kiezer.js BOEKVAK/TOETSVAK know eco and eng; the kiezer vak buttons wrap in a grid.
- The user chose "only the books" for now; more exercises for the small vakken (vmbo first, more topics, more exercise types, real contexts) is still open.

## Watch out
- A new bank question only shows up in the book if a paragraph's zoek matches it; run a coverage check (goals in the book, paragraphs with fewer than 6 exercises, bank questions in no paragraph) after adding questions.
- Paragraph ids end up in werkblad links (deel=), so do not rename them.
