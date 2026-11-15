---
title: "Tafeltoets als wekelijkse opdracht, nieuw overzicht van de klasresultaten"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
touches:
  - leermiddelen/beheer.html
  - leermiddelen/index.html
  - leermiddelen/klas.html
  - leermiddelen/werkblad.html
  - server/kamer.js
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
- De tafeltoets is een opdracht in de klas, net als het dictee van de week: spel tafeltoets in server/kamer.js (tafelOpdracht, tafelVelden, tafelPast, tafelScore). Met auto komt hij elke week terug (opdrachtNu geeft de week van vandaag, zonder rooster). Een uitslag bewaart tg (goed), tn (aantal), ts (seconden), tf (foute sommen als 6x7 of 42:6) en wk.
- De leerling maakt hem op tafeltoets.html (kop van oefen.html, eigen.css): een som per scherm, geen terugkoppeling tot het eind, de tijd loopt mee zonder limiet. Los geopend is het oefenen met eigen keuzes.
- In klas.html: het formulier (opTafel, tVorm), Aanpassen haalt de oude opdracht weg en zet de nieuwe erbij; tafelStuk toont per leerling de eerste keer van de week, de vaakst foute sommen en een tabel met alle weken. In index.html toont tafelStuk de opdracht bij de leerling.
- Op papier: SPELBLAD.tafeltoets in werkblad-tafeltoets.js (deel=t6,t7,delen).
- Het tabblad Overzicht van de resultaten is opnieuw ontworpen (tekenKort, klassen ko-): vier kerncijfers met verloop per week, wat aandacht vraagt bovenaan met Werkblad en Zet als opdracht, de vakken met het laagste bovenaan, en een leerlingentabel met wie de meeste hulp nodig heeft bovenaan. Het ontwerp staat op een canvas (Klasstatistieken herontwerp); scherm 2 (rooster per onderdeel) en 3 (een leerling) zijn nog niet gebouwd.
- Status in de statistieken: beheerst diepblauw met vinkje, bijna lichtblauw, nog niet koraal met uitroepteken. Geen groen en rood, en nooit alleen kleur.

## Tried and ruled out
- Een tempotoets met een tijdslimiet: de gebruiker koos een vast aantal sommen met de tijd erbij.
- Een eigen rooster per week voor de tafeltoets, zoals bij het dictee: de docent past de lopende opdracht aan.
- De categorieen per vak op het overzicht laten staan: ze staan na het aantikken van een vak in het tabblad Per vak.

## Watch out
- De server stuurt uitslagen veld voor veld naar de docent: een nieuw veld moet ook in de lijst resultaten onderaan kamer.js.
- klas.html heeft een algemene regel voor th (hoofdletters, plakkend, kaart2): een nieuwe tabel moet die uitzetten.
- dVorm is omwikkeld zodat tVorm na elke wissel van spel draait.
- Zet als opdracht vanuit het overzicht zet het onderdeel alleen als het in de keuzelijst van het formulier staat (onderdelen uit vakspellen staan er niet in).
- Testen: scratchpad tafel/api.js (tien servercontroles), ui.js en keten.js op de preview worker (8787), stat/nieuw.js voor het overzicht.
- Niet getest: de overgang naar een nieuwe week, een echte of lege klas in het nieuwe overzicht.
