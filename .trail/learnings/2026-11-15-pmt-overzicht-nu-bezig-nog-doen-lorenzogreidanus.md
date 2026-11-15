---
title: "PMT overzicht: nu bezig, nog doen en leerlingen als tabel"
author: LorenzoGreidanus
date: 2026-11-15
branch: Live-branch
cost: { minutes: 10, tokens: 128927 }
touches:
  - pmt/index.html
  - server/pmt.js
  - ".impeccable/critique/2026-09-23T19-57-02Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-24T15-01-37Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T16-36-26Z__leermiddelen-index-html.md"
  - ".impeccable/critique/2026-09-24T19-38-45Z__leermiddelen-beheer-html.md"
  - ".impeccable/critique/2026-09-24T19-42-42Z__leermiddelen-maken-html.md"
  - ".impeccable/critique/2026-09-26T11-03-31Z__leermiddelen-democratie-html.md"
  - ".impeccable/critique/2026-09-26T11-24-37Z__leermiddelen-klas-html.md"
  - ".impeccable/critique/2026-09-26T11-59-34Z__leermiddelen-index-html.md"
---

## Decided
Het overzicht van PMT volgt het ontwerp op https://claude.ai/artifact/Ptve3NVnke1RKMw4dN6Zuq. Bovenaan staat wie er nu is (#heldvak, gebouwd in tekenVandaag: nu bezig, anders hierna, anders de volgende dag), met het punt voor de volgende keer uit de laatste notitie. Rechts staat Nog doen (nogDoenVak): de signalen plus een notitie die ontbreekt en wat er nieuw is ingevuld. Leerlingen staan in een tabel (tekenKaarten vult tbody#kaarten) met fase, volgende afspraak, doelen, laatste meting en Let op. lijst() op de server geeft daarvoor per dossier sessies, punt, zonderNotitie, doelen en doelGem.

## Tried and ruled out
node --check op server/pmt.js als controle: een haakje te veel kwam erdoor en de build van wrangler brak. De echte controle is preview_logs met level error na een wijziging, of een aanroep van de api.

## Watch out
Elk signaal heeft een veld kort: dat is het label in de kolom Let op. Een notitie ontbreekt als er de laatste 14 dagen een afspraak was (niet afwezig) zonder notitie op die datum; de afspraak van vandaag telt pas mee als hij voorbij is. Aanwezig of afwezig staat in de lijst van vandaag alleen bij wie er is of geweest is.
