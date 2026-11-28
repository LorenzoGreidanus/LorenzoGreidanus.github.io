---
title: "Clubbaas: echte spelersnamen, tenues en een breder naamfilter (v482)"
author: LorenzoGreidanus
date: 2026-11-28
branch: Live-branch
touches:
  - leermiddelen/clubbaas-data.js
  - leermiddelen/clubbaas.html
  - leermiddelen/clubbaas.js
  - leermiddelen/naamfilter.js
  - server/clubbaas.js
  - server/naamfilter.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
---

## Decided
- De gebruiker wil namen van echte voetballers. NAMEN in clubbaas-data.js per positie (KEE/VER/MID/AAN), elk met ster en rest; sterren alleen vanaf kwaliteit 74 (STER), zodat je ze niet goedkoop koopt. Kwaliteit en fitheid zijn verzonnen, geen foto's of echte clubs (beeldrecht is aan de gebruiker gemeld). Oude clubs krijgen bij /lees nieuwe namen via NAMEN_VERSIE.
- Tenues: C.tenues(club) geeft thuis, uit en keeper (k1, k2, patroon, mouw, kraag, broek, sok), ook voor clubs van voor de tenues. 12 patronen (4 gratis) en 5 logovormen (2 gratis) koop je een keer (club.bezit p:/v:). Logo kan letters krijgen (lettersOk, door vies), en een stadionnaam. De uitploeg draagt in de herhaling zijn uittenue als ring (uitK1/uitK2).
- Naamfilter: veel termen erbij (NL schelden en seks, Engels, Turks en Marokkaans-Arabisch schelden, haat). Woorden die in gewone woorden zitten in HEEL (sex, dick, anal, pik, kont, zamel, pijpen).
## Tried and ruled out
- Zelfverzonnen namen met jongens- en meisjesnamen door elkaar: niet realistisch. Daarna voor- en achternaam per land: de gebruiker wilde echte voetballers.
- "zemel", "pijpen", "penis" als losse delen: vals alarm op Zemelen, Pijpenstraat, Peniscola.
## Watch out
- Na een wijziging aan server/naamfilter.js altijd node server/maak-filter.js draaien; testen met scratchpad filtertest.mjs (361 gewone namen, alle spelers, botnamen).
- De uitslagen worden opgehaald op volgorde in lg.dagen, niet met een tekstvergelijking: testdagen "-t10" kwamen voor "-t9".
