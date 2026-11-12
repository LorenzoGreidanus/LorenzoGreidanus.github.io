---
title: "PMT: link van een vragenlijst mailen, en een nieuw inlogscherm"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 13, tokens: 93519 }
touches:
  - pmt/index.html
  - pmt/privacy.html
  - server/pmt.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- De link van een vragenlijst mailen gaat via het eigen mailprogramma van de therapeut: de knop Link mailen is een mailto met onderwerp en tekst, Bericht kopieren zet dezelfde tekst op het klembord (voor Teams of webmail). De server verstuurt zelf niets. De code blijft ernaast staan en staat ook in het bericht.
- Het dossier heeft twee nieuwe velden, mail en mentorMail, versleuteld met de rest; de server bewaart alleen een adres dat klopt. In het bericht staat geen uitslag en geen reden, alleen dat er een lijst klaarstaat.
- Het inlogscherm is opnieuw ontworpen: links het merk op deep ocean met drie regels wat het is, rechts Welkom met een grote knop, de link voor Microsoft, een ingang voor leerling of mentor met een code en de privacylink. Op de telefoon staat het merkvlak als band bovenaan.
- Tot bekend is of je bent ingelogd staat er een laadscherm met PMT, in plaats van een leeg scherm.

## Tried and ruled out
- De server zelf laten mailen: dat vraagt een maildienst als extra verwerker, een afzenderdomein en opgeslagen adressen die de server gebruikt. Niet gebouwd; de gebruiker is verteld dat dit de volgende stap zou zijn als ze echt automatisch willen.

## Watch out
- Op een schoollaptop zonder ingesteld mailprogramma doet een mailto niets: dan is Bericht kopieren de weg.
- De knop Inloggen krijgt bij een klik de klasse bezig; komt de pagina uit de bladergeschiedenis terug, dan herlaadt ze.
