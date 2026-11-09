---
title: "Beheer als dashboard met Nu bezig, accounts en mededeling"
author: LorenzoGreidanus
date: 2026-11-09
branch: Live-branch
touches:
  - leermiddelen/beheer.html
  - privacy.html
  - server/account.js
  - server/beheer.js
  - server/index.js
  - server/kamer.js
  - sw.js
  - vangnet.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
---

## Decided
- beheer.html is een dashboard: zijbalk (op de telefoon een balk onderin met Meer), per onderdeel een pagina via #hash. Bron staat in de scratchpad (beheer/kop.html, nav.js, ov.js, tools.js); bouw.js plakt die aan de oude scripts van commit 10cdf64 met vervangingen.
- Kamers melden zich bij Beheer (POST /kamer) vanuit Kamer.bewaar() en webSocketClose, hoogstens om de 5 s, zonder wijziging om de minuut; weg bij opruimen en opheffen. Klascodes gaan naar klas:<code>, spelkamers naar live (20 min stil = weg).
- Accounts melden zich vanuit Account.bewaar() hoogstens per uur (of als docent verandert) onder ctx.id.slice(0,24): alleen eerste/laatst/docent, geen naam. Daarom geen zoeken op naam in beheer.
- De mededeling: Beheer bewaart hem, /api/mededeling is openbaar (max-age 60), mededeling.js toont hem; vangnet.js laadt mededeling.js omdat vangnet op bijna elke pagina staat (thema.js niet op de voorpagina).

## Tried and ruled out
- Spelers tellen met getWebSockets("speler").length: telt in webSocketClose de sluitende socket nog mee. Filter op readyState === 1.

## Watch out
- server/beheer.js bevat letterlijke stuurtekens in een regex: de Edit-tool weigert het bestand, pas het aan met een node-script.
- Lokaal testen met een eigen sleutel: launch-config worker-proef (wrangler dev --var BEHEER:proefsleutel, poort 8789); de --var wint van .dev.vars, die je niet leest.
- Klasse .onder bestond al (regel onder een kerncijfer): de telefoonbalk heet .onderbalk.
