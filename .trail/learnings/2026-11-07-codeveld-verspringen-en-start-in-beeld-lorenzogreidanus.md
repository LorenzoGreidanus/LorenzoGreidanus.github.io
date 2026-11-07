---
title: "Codeveld, verspringen en Start in beeld op de laptop (v451)"
author: LorenzoGreidanus
date: 2026-11-07
branch: Live-branch
touches:
  - leermiddelen/crisis-team.html
  - leermiddelen/klasquiz.html
  - leermiddelen/leerroute.html
  - leermiddelen/leerroute.js
  - leermiddelen/oefen.html
  - leermiddelen/opdrachtenboek.js
  - leermiddelen/rol.html
  - leermiddelen/spel.css
  - leermiddelen/spel.js
  - leermiddelen/strijd.html
---

## Decided
- Codevelden op rol, crisis-team, tekenslag, klasquiz en strijd nemen 6 tekens: een code van 6 gaat naar oefen.html?code=, een klascode naar index.html?koppel=.
- oefen.html vraagt bij 4 letters /api/kamer/CODE op en stuurt door naar het juiste klassenspel.
- leerroute.js: groepen zijn <details>, open alleen bij het volgende doel, een doel waar je mee bezig bent of de #g=-groep; scripts laden parallel met async=false (ook in opdrachtenboek.js).
- Verspringen (CLS): ruimte reserveren (werkblad .wm-keuzes.laadt, #vakken:empty, voortgang #inlogvak.wacht) en in vakspel.js een onzichtbare plaatshouder .uitlegwacht die spel.js weghaalt.
- spel.css: .startknoppen en .sm-start sticky onderaan vanaf 700px breed, zodat Start op een laptop van 1366x768 in beeld is.

## Tried and ruled out
- Het hidden-attribuut op de .hoe-div: de css display wint, dus inline display:none.

## Watch out
- spel.js zet display van verhuisde uitlegelementen terug voordat het ze verplaatst.
- De reserve van voortgang klapt lokaal in omdat inloggen met Microsoft daar niet kan; meet het live.
