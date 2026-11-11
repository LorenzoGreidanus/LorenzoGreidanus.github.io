---
title: "Normen en waarden per niveau, open vragen in Stap voor stap en opdrachtenboek"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
touches:
  - leermiddelen/werkblad-boek.js
  - leermiddelen/werkblad-normen.js
  - leermiddelen/werkblad-route.js
  - leermiddelen/werkblad.html
  - sw.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
---

## Decided
- Het werkblad normen en waarden (werkblad-normen.js) heeft vier versies, een per niveau: keuze.rang 1 tot 4. VOLGORDE[rang] bepaalt welke opdrachten erop komen; uitleg(rang) schrijft voor bb kortere zinnen en zet er voor vwo moraal en recht en feit of norm bij. Vwo heeft de opdracht Feit of norm en dilemma's uit de samenleving (DILEMMAS_VWO).
- Stap voor stap (werkblad-route.js) en het opdrachtenboek (werkblad-boek.js) hebben vormen:true en vormStandaard:'mix'. werkblad.html zet de keuze Soort vragen op S.vormStandaard. In beide bestanden bepaalt vormen(w, lijst) per opgave met keuzes of hij open wordt, via OPENVRAAG.vorm; keuzesHtml tekent een lijn, Kies uit met een lijn, of de keuzes.
- Bij door elkaar telt alleen een opgave met keuzes mee: om en om open, te beginnen bij de eerste. Opgaven die al open waren schuiven de telling niet op.

## Tried and ruled out
- Twee versies van normen en waarden (vmbo en havo/vwo): de gebruiker wil het voor alle niveaus.
- De gewone isOpen(vorm, i) van werkblad.html gebruiken voor door elkaar: die telt elke opgave, dus een blad met veel invulopgaven zou te weinig meerkeuze omzetten.

## Watch out
- In het opdrachtenboek staat de vorm per opgave op it.p; teken() zet hem elke keer opnieuw. opgaveHtml en antwoordHtml vallen terug op meerkeuze als it.p ontbreekt.
- Een vraag die zonder keuzes niet te maken is, houdt zijn keuzes ook bij Open (soort omcirkel): het antwoordblad zet daar wel de letter bij.
- Niet getest: Samenstellen op een boek- of routeblad met open vragen, en de vakken wiskunde, aardrijkskunde, biologie en geschiedenis.
