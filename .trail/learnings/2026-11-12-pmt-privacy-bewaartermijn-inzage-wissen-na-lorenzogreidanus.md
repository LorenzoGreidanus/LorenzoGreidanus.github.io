---
title: "PMT privacy: bewaartermijn, inzage, wissen na intrekken, privacyverklaring"
author: LorenzoGreidanus
date: 2026-11-12
branch: Live-branch
cost: { minutes: 12, tokens: 69168 }
touches:
  - pmt/index.html
  - pmt/invullen.html
  - server/index.js
  - server/pmt.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
---

## Decided
- Bewaartermijn: een aantal maanden na het afronden (tabel stand, k bewaar; 0 is nooit vanzelf, en dat is de standaard tot de school een termijn kiest). Het opslagobject kijkt elke dag met een alarm of er dossiers over de termijn zijn en verwijdert ze met alles erbij; dat komt in het logboek als "het systeem, na de bewaartermijn".
- De server zet zelf afgerondOp als de status afgerond wordt. Een dossier dat al afgerond was telt vanaf de laatste wijziging (afgerondSinds).
- Inzage: "Alles uitdraaien voor inzage" in het dossier geeft een printbare pagina met alle gegevens, lijsten met antwoorden, afspraken en wie wat met het dossier deed (GET /api/pmt/dossiers/ID/logboek). Het uitdraaien zelf wordt gelogd.
- Toestemming ingetrokken: bij status nee staat er een knop om alles wat verwerkt is te wissen (POST /api/pmt/dossiers/ID/wis): notities, doelen, hulpvraag, metingen, codes en afspraken. De aanmelding blijft.
- Privacyverklaring: pmt/privacy.html op /privacy (lokaal /pmt/privacy), gelinkt vanaf de inlogkaart, het leerlingscherm en de pagina Privacy. Het menu-item Logboek heet nu Privacy; het logboek staat eronder.

## Tried and ruled out
- Een standaardtermijn kiezen: welke termijn geldt is aan de school. Tot die tijd verdwijnt er niets vanzelf.

## Watch out
- De privacyverklaring en het toestemmingsformulier zijn een voorstel en staan zo gemarkeerd; de privacyfunctionaris moet ze vaststellen.
- Het automatisch verwijderen zelf is niet in de praktijk getest (er was geen dossier over de termijn); de datum waarop het weggaat klopt wel.
- Wat code niet kan regelen staat nog open: verwerkersovereenkomst, beoordeling vooraf door de school, een tweede beheerder, een test door een extern bureau.
