---
title: "Werkblad als Word-bestand, ruimtefiguren een voor een, DHTE-tegel met vinkjes (v476)"
author: LorenzoGreidanus
date: 2026-11-23
branch: Live-branch
touches:
  - leermiddelen/leerroute.js
  - leermiddelen/opdrachtenboek.js
  - leermiddelen/werkblad-spellen.js
  - leermiddelen/werkblad.html
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
---

## Decided
- Een werkblad als Word-bestand komt uit werkblad-word.js (WORDBLAD.download). De omzetter bouwt het blad niet opnieuw op, maar loopt door het blad zoals het in het meetvak staat (688 px, de breedte van A4) en vertaalt op grond van de berekende stijl: tekst wordt runs, een tabel een Word-tabel met de randen per cel, wat naast elkaar staat een tabel zonder randen, een leeg element met alleen een rand eronder een schrijflijn, een svg een png. Zo werkt elk bestaand en nieuw werkblad zonder eigen code.
- De .docx is een zip zonder samenpersen, zelf geschreven; er is geen bibliotheek bij gekomen en er gaat niets naar de server.
- Lettertype Calibri, niet Poppins: dat staat op elke computer.
- De Word-knop gebruikt hetzelfde keuzevenster als Printen (keusDoel).
- Ruimtefiguren een voor een: leerroute/wiskunde-ob-ruimtefiguren.js, groep wob-m-fig, zeven doelen die kenmerken, oppervlakte en inhoud afwisselen.
- De tegel DHTE-schema heeft vinkjes voor T E, H T E en D H T E; het schema wisselt per rondje soorten sommen.

## Tried and ruled out
- Het breukvak als los leeg element behandelen: het heeft zelf geen rand, dus het verdween. Het krijgt nu een eigen regel in inline().

## Watch out
- Nakijken kan echt: Word staat op deze computer. scratchpad word/maak.js maakt de bestanden in headless Edge, naarpdf.ps1 opent ze onzichtbaar in Word (zonder herstel) en bewaart een pdf, kiekpdf.js maakt daar een schermafbeelding van.
- Een test die op de Word-knop klikt, zet het bestand in de map Downloads van de gebruiker: daarna opruimen.
- De volgorde van elementen in pPr, rPr en tcPr ligt vast in het schema van Word; houd de volgorde in rpr() en parXml() aan.
- visibility niet meekopiëren naar de svg: het meetvak is verborgen en dat erft door.
