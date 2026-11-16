---
title: "PMT beveiliging: CSP, strenge rem, uitloggen sluit alle sessies"
author: LorenzoGreidanus
date: 2026-11-16
branch: Live-branch
cost: { minutes: 4, tokens: 57325 }
touches:
  - server/index.js
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
Beveiliging van PMT aangescherpt op 16 november. De PMT-paginas krijgen in pmtPagina (server/index.js) een content-security-policy die alleen eigen script, stijl, lettertypen en verbindingen toelaat, plus nosniff, HSTS en een permissions-policy. De rem (magDoor) valt voor PMT dicht als het tellen mislukt (streng). Op verkeerde invulcodes staat naast de grens per adres ook een grens voor alle adressen samen (CODE_MIS_ALLE, 1500 per tien minuten), met een regel in het logboek. Uitloggen zet uit:<mail> in stand; wie() weigert elke sessie die daarvoor begon.
## Watch out
De CSP staat alleen inline script toe en geen script van een adres: een los js-bestand of een lettertype van buiten wordt op de PMT-paginas geblokkeerd. Niet getest: het intrekken van een echte sessie (lokaal is er alleen de demo, en die slaat de controle over), de grens voor alle adressen, en het dichtvallen bij een storing. Organisatorisch open: PMT_TENANT zetten zodat alleen accounts van de school meetellen.
