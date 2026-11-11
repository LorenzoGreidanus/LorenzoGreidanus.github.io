---
title: "PMT-geraamte gebouwd: server/pmt.js en pmt/index.html"
author: LorenzoGreidanus
date: 2026-11-11
branch: Live-branch
cost: { minutes: 9, tokens: 128400 }
touches:
  - server/account.js
  - server/index.js
  - wrangler.jsonc
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
---

## Decided
- PMT is een eigen deel: server/pmt.js (routes onder /api/pmt, Durable Object Pmt, migratie v11) en pmt/index.html. index.js stuurt op hostnaam: op pmt.* bestaat alleen de PMT-pagina en haar api, op het gewone adres bestaat /api/pmt niet en stuurt /pmt/ door. Lokaal (localhost, 127.0.0.1) staat de pagina onder /pmt/.
- Inlog hergebruikt de bouwstenen uit account.js (onderaan geexporteerd), met een eigen koekje pmt_sessie (SameSite Strict, kwartier, schuift mee, maximaal tien uur) en een toegangslijst in het geheim PMT_TOEGANG die bij elk verzoek opnieuw gelezen wordt.
- Dossiers staan versleuteld (AES-GCM, geheim PMT_SLEUTEL) in de sqlite van het object; het logboek bewaart alleen het dossiernummer. Zonder PMT_ECHT=ja is het een proefomgeving met een balk en voorbeelddossiers.
- Testen: launch-configs nep (8793) en worker-pmt (8791, toegang marith@nep.test); eerst /zet?sub=marith op de nep-Microsoft.

## Tried and ruled out
- env.PMT.jurisdiction("eu") lokaal: workerd gooit "Jurisdiction restrictions are not implemented". Daarom alleen op het echte adres, gekozen op hostnaam en niet met een try/catch, zodat het live nooit stil terugvalt.

## Watch out
- Een patchscript via een Bash-heredoc at de backslashes uit een regex op in index.js; daar staan nu gewone vergelijkingen.
- Nog niet getest: echte Microsoft-inlog, de EU-vastzetting op Cloudflare en het verlopen na een kwartier. Nog niet gebouwd: vragenlijsten, grafiek, EF-monitor.
- Live zetten vraagt: adres pmt.meneergreidanus.nl aan de Worker, omleidings-URI /api/pmt/terug bij Microsoft, de geheimen PMT_TOEGANG en PMT_SLEUTEL. Raakt PMT_SLEUTEL kwijt, dan zijn de dossiers onleesbaar.
