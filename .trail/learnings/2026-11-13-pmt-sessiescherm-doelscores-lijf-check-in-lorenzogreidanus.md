---
title: "PMT: sessiescherm, doelscores, lijf-check-in, fasen, signalen, agenda"
author: LorenzoGreidanus
date: 2026-11-13
branch: Live-branch
cost: { minutes: 14, tokens: 187757 }
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
PMT kreeg in een keer: het sessiescherm (tekenSessie/openSessie: links voorbereiden, rechts afronden), doelen met scores 1 tot 5 (doel.scores, DOELSTAP), notities met een veld volgende, de check-in met het lijf (d.lijf, vraagLijf, lijfTabel; de leerling tikt op het apparaat van de therapeut, er is geen openbaar adres voor), het traject in fasen (fasenVak, afgeleid uit het dossier; alleen verslagOp wordt bewaard), Vraagt aandacht (signalen() rekent met extra velden uit lijst() op de server) en het agenda-abonnement (/api/pmt/agenda/SLEUTEL.ics, zonder inloggen, alleen initialen, sleutel in stand agenda).
Weghalen van een notitie of doel gaat direct, met Ongedaan maken in de toast (toast heeft een derde en vierde argument).
De kleuren van het raster van de weekcheck zijn vast (oranje laag, blauw hoog) en gelijk in licht en donker.

## Tried and ruled out
De fase waar een leerling nu is afleiden uit het eerste open punt: een leerling van vier weken stond dan al in Afronding. De fase volgt nu de status.
Een patch met backslashes via node -e in Bash: de escapes gaan stuk. Altijd een patchbestand met Write.

## Watch out
Nieuwe velden in een dossier moeten op vier plekken: schoon() op de server, bewaar() zonder toestemming, wisVerwerkt(), en de uitdraai voor inzage (tekenInzage) plus de privacyverklaring. Oude dossiers hebben lijf en scores niet: toon() en tekenSessie() vullen ze aan.
De drempels van de signalen staan vast in signalen(): 2 keer afwezig, 9 dagen geen weekcheck, 8 weken geen meting, 6 weken wachtrij.
