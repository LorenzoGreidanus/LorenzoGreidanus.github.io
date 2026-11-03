---
title: "Leesbank, dictees met vakthema en toets dupliceren"
author: LorenzoGreidanus
date: 2026-11-03
branch: Live-branch
touches:
  - leermiddelen/bank.js
  - leermiddelen/beheer.html
  - leermiddelen/categorie.js
  - leermiddelen/dictee-opgaven.js
  - leermiddelen/dictee-werkblad.html
  - leermiddelen/dictee.html
  - leermiddelen/index.html
  - leermiddelen/klas.html
  - leermiddelen/leerlijn.js
  - leermiddelen/lesbrieven.html
---

## Decided
- Leesstrategieën: teksten in leermiddelen/leesbank.js (doelen) + leesteksten.js (gegenereerd uit losse bestanden per strategie), opmaak in leesblad.js, gedeeld door werkblad-lezen.js, het opdrachtenboek (paragraaf met lezen:'<doel>') en leesstrategieen.html (vakspel, id leesstrategie).
- Dictees met vakthema hebben thema:'<vak>' en id t-<vak>-<niv>-0N. D.weektekst neemt alleen teksten zonder thema; tag geeft een gewone tekst een vak zonder het rooster te verschuiven.
- Dupliceren en Als oefentoets meegeven in maken.html gebeuren in de browser: volledig ophalen, plaatjes opnieuw uploaden (een plaatje hoort bij een code), norm via instel meenemen.

## Tried and ruled out
- Een oefentoets als tweede link op dezelfde toets: dan zou de toets zelf zijn antwoorden prijsgeven. Het is een kopie met modus oefenen.

## Watch out
- vakspel 'sleep': Nakijken pas als alle kaartjes liggen; een koppel met een extra kopje krijgt een vak Blijft over.
- Uitgeschreven getallen: na duizend een spatie (tweeduizend tweeëntwintig).
- dictee-werkblad .bladen: grid-kolom minmax(0,1fr), anders wordt het blad op een telefoon breder dan het scherm.
- maken-kiezer weigert leesblad-paragrafen: een hele tekst past niet als losse toetsvraag.
