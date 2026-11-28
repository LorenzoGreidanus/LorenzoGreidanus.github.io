---
title: "Tijdlijnmaker (v479): opslag, opmaak en opdracht"
author: LorenzoGreidanus
date: 2026-11-28
branch: Live-branch
touches:
  - leermiddelen/beheer.html
  - leermiddelen/index.html
  - leermiddelen/klas.html
  - leermiddelen/lesbrieven.html
  - server/index.js
  - server/kamer.js
  - sitemap.xml
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
---

## Decided
- leermiddelen/tijdlijn.html + tijdlijn.js (UI), tijdlijn-motor.js (window.TIJDLIJN: datums, opmaak, schoonModel) en tijdlijn-pdf.js (eigen PDF-schrijver, Helvetica WinAnsi, JPEG via DCTDecode). Server: server/tijdlijn.js, routes /api/klas/XXXX/tijdlijn/(inlever|lijst|een|startzet|start).
- Ingeleverde tijdlijnen staan niet in de klas-stand (te klein) maar in stukken van 96000 tekens: tl:<sid>:m en tl:<sid>:<i>, plus tl:lijst; starttijdlijnen voor opdrachten als tlo:<id>.
- De PDF bevat het model als base64 tussen TLJSON: en :TLJSON, zodat een PDF weer geopend kan worden (ook een stapel PDF's als klasset).
- Opdracht gaat via het generieke opdrachtpad: spel tijdlijn, vak ges, kz tl=<id>; leerlinglink tijdlijn.html?tl=<id>&start=1. meld() bij inleveren telt als gehaald.
- Eenvoudig staat vanzelf aan bij lg-niveau bb.
- Kaartjes rechts naar links plaatsen, eerst rechteranker over alle rijen, dan links; stelen mogen geen kaartje kruisen.

## Tried and ruled out
- Kaartjes links naar rechts plaatsen: stelen kruisten andere kaartjes.

## Watch out
- [hidden] op .tl-knop werkte niet door display van de knopklasse: er staat een globale [hidden]{display:none!important}.
- De Write-tool zette een echte U+2028 in een regex in tijdlijn-pdf.js: syntaxfout. Gebruik String.fromCharCode.
- Foto's alleen als data:image jpeg/png/webp onder 400k; server begrenst 1,5M tekens, 24 foto's, 60 tijdlijnen, 20 opdrachten.
