---
title: "Werkbladen: apart printen, Cornell-blad, begin van de som in de kladruimte"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
touches:
  - leermiddelen/open-papier.css
  - leermiddelen/open-papier.js
  - leermiddelen/papier.js
  - leermiddelen/papieren-toets.html
  - leermiddelen/werkblad.html
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
---

## Decided
- werkblad.html: Printen opent een dialog (werkblad, antwoorden, allebei); de keuze zet data-print op de body, de print-css verbergt het andere blad, en document.title krijgt " - werkblad" of " - antwoorden" zodat de PDF een eigen naam heeft. afterprint zet alles terug.
- werkblad-cornell.js: SPELBLAD['cornell-<vak>'] bij elk vak; het tweede blad is de uitleg (antwoordKop), geen antwoordblad.
- Het begin van de som in de kladruimte is een keuze van de docent (vinkje somBegin, localStorage lg-som-begin, gedeeld door werkblad.html en papieren-toets.html). Aan: OPENPAPIER.open(it, { begin:true }) geeft elke som kladruimte met RM.beeld(0): staart (of hap als de klas dat koos), anders cijferend. Uit: niets, zoals vroeger.

## Tried and ruled out
- Het begin vanzelf tonen bij delingen vanaf drie cijfers: de gebruiker wil het als keuze, en dan bij elke som.
- Dit is geen schema-vraagsoort: de learning "staartdeling als schema: nog niet" gaat over maken.html en blijft gelden.

## Watch out
- kladBegin herkent alleen een som met spaties om het teken (12:30 is een tijd, 3,5 : 7 een kommagetal) en alleen als er precies een som in de vraag staat.
- papieren-toets.html laadt daarvoor nu rekenmanieren.js voor open-papier.js.
