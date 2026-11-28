---
title: "Clubbaas: voetbalmanager naast Teambaas (v481)"
author: LorenzoGreidanus
date: 2026-11-28
branch: Live-branch
touches:
  - leermiddelen/index.html
  - server/index.js
  - sitemap.xml
  - sw.js
  - wrangler.jsonc
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
---

## Decided
- Clubbaas is de voetbalversie van Teambaas, voor ingelogde leerlingen. Durable Object `Clubbaas` (binding CLUBBAAS, migratie v13): object `c:<account>` per club en `liga` met divisies van 8 (aangevuld met computerclubs). Twee speelrondes per week via het alarm: woensdag 16.00 en zaterdag 14.00 Nederlandse tijd; een seizoen is 14 rondes (iedereen thuis en uit, C.schema).
- Gedeelde regels, shirt en logo in leermiddelen/clubbaas-data.js (UMD, ook door de server geïmporteerd). De wedstrijd wordt server-side gesimuleerd (speelWedstrijd in server/clubbaas.js): per minuut balbezit, soms een schot; elk schot is een moment met het pad van de bal, voor de herhaling op de pagina.
- Fitheid: een wedstrijd kost 14/22/32 (druk laag/midden/hoog), herstel 0,3 per uur. Bij midden blijft een elftal rond de 90; wie altijd hoog druk zet, moet rouleren.
- Transfers alleen tot en met speelronde 2 van een seizoen, van computerclubs en vrije spelers (markt per club en seizoen uit een zaadje), nooit tussen leerlingen.
- Teambaas en Clubbaas staan in leermiddelen/index.html onder het pseudo-vak Competitie (spel met apart:true), niet onder elk vak.
## Tried and ruled out
- Herstel van 1,25 per uur: tussen twee speeldagen was iedereen weer 100% fit, dus fitheid deed er niet toe.
- Botnamen met een stap van 3 door de lijst: twee computerclubs kregen dezelfde naam. Nu opeenvolgende namen.
- Donkerblauwe ringen (verdedigers, blauwe clubs): vallen weg op het blauwe veld. POSKLEUR zonder donkerblauw, en ringVan kiest een zichtbare kleur.
## Watch out
- Testen lokaal met ?test=naam op de worker (8787); scratchpad cbapi.js (API en /test/speel), cbsim.js (balans over 2000 wedstrijden), cbkiek.js (schermen). Testrondes direct na elkaar maken iedereen moe; dat is geen fout.
- window.CBWED geeft de stand van de herhaling, zodat een test kan springen.
- De liga is een gedeeld object: lokale tests delen een divisie.
