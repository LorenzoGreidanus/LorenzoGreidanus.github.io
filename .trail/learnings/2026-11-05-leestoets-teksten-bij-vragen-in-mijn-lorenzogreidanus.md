---
title: "Leestoets: teksten bij vragen in Mijn materiaal"
author: LorenzoGreidanus
date: 2026-11-05
branch: Live-branch
touches:
  - leermiddelen/eigen.css
  - leermiddelen/leesblad.js
  - leermiddelen/maken.html
  - leermiddelen/oefen.html
  - leermiddelen/opdrachtenboek.js
  - leermiddelen/papier.js
  - leermiddelen/papieren-toets.html
  - leermiddelen/uitslag.js
  - leermiddelen/werkblad-lezen.js
  - server/materiaal.js
---

## Decided
- A toets or oefening can carry reading texts: `m.teksten` (max 6, id A-F, either `bank` = leesbank id or own `tekst`). Questions point to a text with `item.tekst` and carry `item.doel` (leesvaardigheid). Texts are not items: they never count as a question or a point.
- server/materiaal.js remaps text letters in order (tekstenVan) and turns trek off when there are texts, so every student gets every question of a text.
- leermiddelen/leestoets.js converts leesbank tasks into EIGEN items (raster rows become separate mk, open/schema become self-graded open questions with the model answer in the uitleg) and holds ready-made tests in LEESTOETS.KLAAR, opened with maken.html?leestoets=<id>. The teacher clicks Bewaren so the edit key stays in their own browser.
- Ready-made: strategie-signaal-verwijs-2f (38 vragen) and strategie-signaal-verwijs-1f (32 vragen, vmbo-bb, 3 options per own MC).

## Watch out
- A leesbank text is stored by id: changing leesteksten.js later changes the text in existing tests too.
- oefen.html klaarVoorNakijken must guard against huidig being null (a sleep question as the first question).
- Papier versie B shuffles only within a text group, never across texts.
