---
target: meneergreidanus.nl
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:C:\\Users\\loren\\Documents\\GitHub\\LorenzoGreidanus.github.io\\meneergreidanus.nl"
timestamp: 2026-09-13T20-03-11Z
slug: meneergreidanus-nl
closed: true
---
Methode: twee onafhankelijke agenten. A deed de ontwerpreview zonder de meetcijfers te zien, B deed de detector en de browsermeting zonder de review te zien. De vier scherpste beweringen zijn daarna in de code geverifieerd.

Onderzochte pagina's: index.html (voorpagina), leermiddelen/index.html (leeromgeving), leermiddelen/breukenbakker.html (oefenspel), leermiddelen/standen.html (klassikaal spel), leermiddelen/klas.html (klasoverzicht), leermiddelen/lesbrieven.html (voor collega's).

## Ontwerpscore

| # | Heuristiek | Score | Kern |
|---|---|---|---|
| 1 | Zichtbaarheid van de status | 2 | Het bord meldde "Derde Stand voor" terwijl de knop Tegen opgelicht stond |
| 2 | Aansluiting bij de echte wereld | 3 | Sterke metaforen, maar teller en noemer krijgen geen uitleg voor vmbo-bb |
| 3 | Controle en vrijheid | 3 | Na het tellen bleven de stemknoppen actief ogen maar deden niets |
| 4 | Consistentie | 2 | basis.css bereikt 26 van de 39 leermiddelenpagina's, focusring amber tegenover blauw |
| 5 | Fouten voorkomen | 2 | De waarschuwing over verdwijnende klasresultaten staat in kleine grijze tekst |
| 6 | Herkennen boven onthouden | 3 | In het spel staat nergens op welk niveau je speelt |
| 7 | Snelheid voor de geoefende gebruiker | 4 | Zoeksneltoets, Verras me, niveau in deelbare links, echte printstijl |
| 8 | Rust in het beeld | 2 | Het eerste telefoonscherm van de leeromgeving was volledig instelwerk |
| 9 | Herstel na een fout | 3 | Uitstekende uitleg, maar de foutmelding haalde 4,47:1 |
| 10 | Hulp en documentatie | 4 | Het paneel Doel, Tijd, Bediening is voorbeeldig |
| Totaal | | 28/40 | Goed: stevig fundament, zwakke plekken aanpakken |

## Ontwerpspecificiteit

Authentiek waar het handwerk zit: acht met de hand gebouwde taferelen met bronvermelding op de voorpagina, en een openingsbeeld bij Stem per stand dat de les vertelt voordat er een woord gelezen is. Het zakt weg waar de site software moet zijn: de catalogus is een filterkolom met kaartjes zoals elke cursusbibliotheek, en het klasoverzicht zou bij elk zakelijk product kunnen horen.

Mechanische scan: 36 bevindingen over zes pagina's. 18 keer te weinig contrast, 7 keer een samengestelde illustratie, 4 keer een gloed in de donkere stand, 3 keer krappe binnenruimte, 2 keer een stuiterende curve, 1 keer een overgang op een breedte. Een daarvan reproduceert niet in een echte browser.

## Prioriteiten

1. [P0] De tik van de docent besliste de stemming niet in Stem per stand. Een handmatige tik telde voor 20 procent mee; 456 voor tegenover 144 tegen terwijl de docent Tegen aantikte. HERSTELD.
2. [P1] Wit op crab haalde 3,08:1 op elke primaire knop, wit op vista 2,43:1, blauwe links in de donkere stand 2,12 tot 2,47:1. HERSTELD.
3. [P1] Twee ontwerpgeneraties: basis.css ontbreekt op 13 van de 39 pagina's; focusring en gekozen-stijl liepen uiteen. DEELS HERSTELD, zie hieronder.
4. [P1] Het eerste telefoonscherm van de leeromgeving bevatte geen enkel spel. HERSTELD.
5. [P1] Voor een collega bestond er geen route vanaf de voorpagina, en de lesbrief van Langs de meetlat beschreef een ander spel dan het spel zelf. HERSTELD.

## Wat werkt

De uitgeschreven rekenweg bij elk fout antwoord. Het paneel met Doel, Tijd en Bediening, dat in 31 spellen op dezelfde plek staat en daarna verdwijnt. De lege toestand van de catalogus, met diagnose, oorzaak en een knop om te herstellen.

## Blijft open

De focusring is nu overal amber en de letterkleuren op gekleurde vlakken staan vast, maar basis.css is niet alsnog aan de 13 pagina's gekoppeld: dat herstyleert dertien pagina's in een keer en past niet in een ronde die te verifieren is. De dubbele donkere kleurblokken staan er dus nog. Verder: de taart in de breukenbakker verklapt bij optelsommen de uitkomst en staat op aria-hidden; de catalogus genereert 44 pictogrammen zonder naam; drie invoervelden zetten hun focusring uit; de twee spelpagina's bevatten elk twee h1; de voorpagina is 234 kilobyte opmaak.
