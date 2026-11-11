---
title: "Werkbladen: Cornell los van vakken, normen en waarden, signaalwoorden als verkeersborden"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
touches:
  - leermiddelen/bank-burg.js
  - leermiddelen/bank.js
  - leermiddelen/stad-vragen/burg.json
  - leermiddelen/werkblad-cornell.js
  - leermiddelen/werkblad.html
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
- Het Cornell-blad hoort bij geen vak: SPELBLAD.cornell met vak 'los'. In werkblad.html is 'los' een extra optie in de verborgen keuzelijst #vak, met een eigen knop onder het kopje Zonder vak (#los). Bij 'los' is er geen bankblad: tekenBlad kiest het eerste losse blad en tekenSoorten toont alleen de losse bladen. Oude links met blad=cornell-<vak> gaan naar het losse blad.
- Mens en maatschappij heeft een onderdeel normen (normen en waarden): 48 vragen in het blok BURG_NW van bank-burg.js, met w per fout antwoord. Verdeling: 20 op niveau 1, 12 op 2, 10 op 3, 6 op 4, zodat een werkblad van 20 op elk niveau lukt.
- Nieuw werkblad bij Nederlands: SPELBLAD.signaalborden (werkblad-signaalborden.js). Acht zelf getekende borden in merkkleuren, elk een verband, met een bordenkaart bovenaan en twee soorten opgaven (welk bord, welk woord).

## Tried and ruled out
- Het Cornell-blad per vak aanmelden (cornell-<vak>): de gebruiker wil het apart, niet onder een vak.
- 'los' aan VAKKEN in bank.js toevoegen: die lijst gebruiken alle pagina's, dus het staat alleen in werkblad.html.

## Watch out
- De bron van de vragen over normen en waarden staat in de scratchpad (nw/vragen.js, nw/bouw.js); bouw.js vervangt het blok tussen de merktekens BURG_NW: begin en eind.
- node server/maak-stadvragen.js schrijft ook de andere vakken opnieuw (andere volgorde); alleen stad-vragen/burg.json is meegenomen.
- Samenstellen op een blad met vak 'los' is niet doorgeklikt: de vragenkiezer krijgt dan vak 'los'.
- Open gebleven vraag van de gebruiker: figuren uit het opdrachtenboek (DHTE-schema, tabellen) gaan via maken-kiezer.js als jpeg mee (plaatje() en losseSvg); alleen de vier cijf-doelen worden een echt invulschema (alsSchema).
