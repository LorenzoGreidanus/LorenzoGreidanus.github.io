---
title: "Grand Prix: racespel van boven in de Klasstrijd (v471)"
author: LorenzoGreidanus
date: 2026-11-18
branch: Live-branch
touches:
  - leermiddelen/beheer.html
  - leermiddelen/index.html
  - leermiddelen/strijd.html
  - server/kamer.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
---

## Decided
- Grand Prix is game "prix" in de Klasstrijd. De regels staan in server/prix.js en komen met Object.assign bij Kamer.prototype (onderaan kamer.js), met de vragenmotor van Dijkbouwers (dijkStapel, dijkGeschikt, raceBereid).
- De kamer rekent zelf uit waar elke auto is: px.d (afstand in rondes) en px.t. Elke twee tellen (alarm "prixtik") rekent hij iedereen door en stuurt de stand met de snelheid erbij; de pagina's rijden daartussen zelf door (PRIX.veld in prix-banen.js).
- Verloop: kwalificatie (8 vragen, 3 s straf per fout), aftellen, race, halverwege een klasvraag (auto's staan stil, het gat naar de koploper halveert), finish. De race stopt als iedereen binnen is, twee minuten na de eerste, of bij de tijdsgrens.
- De banden zijn de moeilijkheid: zacht, medium, hard verschuiven het niveau van de vragen met +1, 0, -1 en bepalen vaart en slijtage. In de pits zet elk goed antwoord een wiel vast; na twee fouten bij hetzelfde wiel helpt de monteur.
- Twaalf eigen banen in vier speelwijzen (tempo, gewoon, precies, herhaal); de speelwijze hoort bij de baan. De banen en rondetijden staan op twee plekken die gelijk moeten blijven: server/prix.js (PRIX_BANEN) en leermiddelen/prix-banen.js.
- Het bord is prix-bord.html in een iframe in strijd.html (h-prix), zoals bij Dijkbouwers. prix.html is het scherm van de leerling.
- De naam is Grand Prix: de gebruiker vond "Grote Prijs" een rare letterlijke vertaling.

## Tried and ruled out
- Open vragen bij elk kort antwoord: bij woorden zijn er te veel goede schrijfwijzen ("Krijgt Nederlandse een hoofdletter?" met als antwoord "een Nederlandse stad"). Zelf typen kan alleen als het goede antwoord een getal is, met hoogstens een eenheid (openDeel).
- De plek bij de finish geven in de volgorde waarin de kamer de auto's doorrekent: dan krijgt een latere tijd een betere plek. De plek gaat op tijd, in de tik.
- Echte circuits of teams overnemen: het blijft een eigen spel met eigen banen en namen.

## Watch out
- wrangler dev herstart een paar tellen na elke wijziging aan een bestand, ook in leermiddelen: een lopende kamer is dan weg. Niets aanpassen terwijl een proef draait.
- Testen: scratchpad prix/bots.js (alleen de server, vier bots over de websocket) en prix/proef.js (docent en vier leerlingen in echte vensters). Een race van vijf rondes duurt vier tot zeven minuten.
- Bots die alleen gokken rijden met lege banden; dat zegt weinig over de balans bij echte leerlingen. De getallen bovenin prix.js (OP, BAND, BOOST) zijn nog niet met een klas afgesteld.
- Een leerling die zijn eigen kenmerk nodig heeft, krijgt het in de stand als jouw.sid.
