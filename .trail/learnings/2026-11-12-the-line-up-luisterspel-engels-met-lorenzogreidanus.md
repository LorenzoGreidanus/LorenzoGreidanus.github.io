---
title: "The Line-up: luisterspel Engels met acht verdachten"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
touches:
  - leermiddelen/beheer.html
  - leermiddelen/index.html
  - leermiddelen/klas.html
  - leermiddelen/leerlijn.js
  - leermiddelen/lesbrieven.html
  - logo/spel-pictogrammen.json
  - server/kamer.js
  - sitemap.xml
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
---

## Decided
- Nieuw klassenspel voor Engels luisteren: The Line-up (leermiddelen/lineup.html, game lineup). Een getuige beschrijft de dader, op het bord staan acht verdachten (gezichtjes uit avatar.js), elke leerling kiest een nummer. De tekst staat niet op het bord tot na het onthullen.
- De naam is niet "Wie is het?": dat is de naam van een bestaand bordspel.
- Opbouw in de scratchpad (lineup/): inhoud.js (LU: kenmerken, zes zaken, maakZaak met een zaadje), motor.js, stijl.css, body.html en bouw.js, dat de kop en de gedeelde stijl uit arrivals.html haalt. check.js rekent 7200 zaken na.
- Regel van een zaak: precies een verdachte past, en voor elk genoemd kenmerk is er een verdachte die alleen daarop afwijkt. Op havo verbetert de getuige zichzelf met een waarde die een andere verdachte wel heeft.
- Aangemeld op: index.html (entry en soort samen), klas.html (twee lijsten), beheer.html, lesbrieven.html (entry en kerndoelen), spel-pictogrammen.json, sitemap.xml, leerlijn.js en server/kamer.js.
- Nog te bouwen, in deze volgorde: De bestelling (restaurant), De radio (nieuws en weer), De weg wijzen.

## Tried and ruled out
- De gezichtjes als keuzes op de telefoon: de telefoonkaart kent alleen tekstkeuzes. De rij staat op het bord, de telefoon kiest een nummer.
- Iedereen standaard blij laten kijken: dan lijken alle verdachten op elkaar. Wie niet genoemd wordt, kijkt rustig (stem calm).

## Watch out
- Niet aangemeld in spelthema.js: de lobby en de telefoon gebruiken het oude blauwe vak. Ook geen uitleg/lineup.js en geen entry in nieuw.html.
- Niet getest: de echte stem, herladen midden in een spel, een laatkomer, en de bordstand op een digibord.
- Goed te onderscheiden kenmerken van een gezichtje: kleur (k en c), hoed h 1, 2, 4, 8, 15, 16, 17, 19, bril q 1, 3, 5, 6, 7, extra e 3 en 7, vorm v 0, 8, 10 en de stemming.
- bouw.js niet met Bash-heredoc patchen: backslashes in regexen verdwijnen.
