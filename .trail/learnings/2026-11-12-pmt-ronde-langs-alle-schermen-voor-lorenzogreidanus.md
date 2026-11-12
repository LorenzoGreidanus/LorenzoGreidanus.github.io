---
title: "PMT: ronde langs alle schermen voor de bediening"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 14, tokens: 62016 }
touches:
  - pmt/index.html
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-26T11-59-34Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-26T18-38-29Z__leermiddelen-familie-vakspellen.md"
---

## Decided
- Het overzicht van een dossier was weer te lang geworden. Afspraken en aanwezigheid hebben nu een eigen tabblad Afspraken (komende afspraken met afmelden vooraf, en de aanwezigheid met de laatste acht of alles). Is de toestemming getekend, dan is dat vak een regel met Wijzigen en Formulier printen.
- Meldingen staan altijd in beeld: toast(tekst, fout) onderin, boven de balk op de telefoon. Fouten gaan er altijd doorheen (meld), en een paar bevestigingen ook: dossier verwijderd, vragenlijst opgeslagen, code klaargezet.
- Bij wachten op de server langer dan een kwart seconde loopt er een balk bovenin (bezigMet in api()).
- Het logboek staat per dag (Vandaag, Gisteren, de datum) met zinnen als "Dossier geopend" in plaats van losse woorden.
- Klein: Escape sluit het paneel in het rooster, Ctrl en Enter voegt een notitie toe, velden in een rij staan onderaan gelijk, de knoppen in de kop van het dossier staan op de telefoon naast elkaar.
- Vijf tegels bovenaan het dossier; de nieuwe is Volgende afspraak met de aanwezigheid erbij.

## Tried and ruled out
- De naam van de leerling in de titel van het browsertabblad: die blijft staan in de geschiedenis en is te zien op een gedeeld scherm.

## Watch out
- Schermafbeeldingen van het browserpaneel lopen soms een stap achter: lees de toestand met een script uit voordat je iets een fout noemt.
- Niet nagelopen in deze ronde: het leerlingscherm, het verslag en het toestemmingsformulier op papier.
