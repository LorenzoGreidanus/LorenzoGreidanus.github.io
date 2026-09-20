---
target: meneergreidanus.nl
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\loren\\Documents\\GitHub\\LorenzoGreidanus.github.io\\meneergreidanus.nl"
timestamp: 2026-09-20T10-54-42Z
slug: meneergreidanus-nl
---
Methode: twee agenten. A deed de ontwerpreview zonder de meetcijfers te zien, B deed de detector en de browsermeting zonder de review te zien. De scherpste beweringen zijn daarna in de code nagerekend.

Onderzocht: index.html (voorpagina), leermiddelen/index.html (leeromgeving), leermiddelen/klas.html (docentgedeelte), leermiddelen/voortgang.html, leermiddelen/toren.html (spel), leermiddelen/lesbrieven.html, leermiddelen/handleiding.html. Licht en donker, en telefoonbreedte.

## Ontwerpscore

| # | Heuristiek | Score | Kern |
|---|---|---|---|
| 1 | Zichtbaarheid van de status | 3 | Gekozen filterchips en de 35 spelschakelaars in het docentgedeelte hebben alleen een `.on`-klasse, geen `aria-pressed` |
| 2 | Aansluiting bij de echte wereld | 4 | Bijna voorbeeldig; op Mijn voortgang lekken interne codes naar de leerling ("Vragenrace ges kgt") |
| 3 | Controle en vrijheid | 3 | Beide onomkeerbare docentacties waarschuwen eerlijk; een kwijtgeraakte speelcode is met opzet onherstelbaar en de site dwingt nooit af dat je hem opschrijft |
| 4 | Consistentie | 3 | Kleurkeuze op drie plekken; "Voor docenten" wijst vanuit de leeromgeving naar klas.html en vanuit klas.html naar over.html; de voorpagina heet "Lorenzo Greidanus", de rest "meneer Greidanus" |
| 5 | Fouten voorkomen | 3 | Codecontrole en naamfilter zijn goed; een lege klasnaam wordt geaccepteerd en de uitgeschakelde knop legt zichzelf alleen uit in een `title` |
| 6 | Herkennen boven onthouden | 2 | De enige handeling die een leerling moet doen zit achter een rondje van 38 bij 38 met een tekening erin |
| 7 | Snelheid voor de geoefende gebruiker | 2 | Het docentgedeelte blijft een handleiding: stap 1 en stap 2 staan boven het klasoverzicht, elk bezoek opnieuw, 12.010 px op een telefoon |
| 8 | Rust in het beeld | 2 | lesbrieven.html is 12.748 px hoog met 34 volledig uitgeklapte kaarten en nul `<details>`; het venstertje achter het gezichtje doet vijf dingen tegelijk |
| 9 | Herstel na een fout | 3 | Uitleg bij elk fout antwoord, de foutenmap en het vangnet zijn uitstekend; het nul-sterrenscherm doet ze teniet |
| 10 | Hulp en documentatie | 4 | De handleiding is het beste stuk van de site |
| **Totaal** | | **29/40** | **Goed: stevig fundament, duidelijke zwakke plekken** |

## Ontwerpspecificiteit

**Voorpagina: onmiskenbaar van dit product.** Acht taferelen met bronvermelding in het bijschrift, een draaibare wereldbol met historische grenzen, "vandaag in de geschiedenis", en zevenendertig getekende SVG's met nul `<img>`. Niemand kan dit oppakken en er schoenen mee verkopen. Eén scherpe fout: de pagina zet een product van negen vakken neer als een geschiedenissite. De titel is "Geschiedenis die leeft", de kop "Die leeft", de inleiding "van een docent geschiedenis". Erachter zitten negen biologiespellen, negen wiskunde, elf aardrijkskunde, tien Engels. Een collega wiskunde leest dit en klikt weg.

**De leeromgeving: niet specifiek, en dat is de pijnlijkste uitkomst.** Haal de Nederlandse woorden weg en dit is een catalogus met een filterkolom, chips met tellertjes, een zoekveld met een `/`-badge en een raster kaarten. Vervang "Geschiedenis 22" door "JavaScript 22" en het is een cursusbibliotheek. Het handgeschreven regeltje en het getekende gezichtje zijn de enige dingen die verraden welk product dit is, en dat handgeschreven regeltje is op deze pagina besteed aan een teller ("6 dagen op rij") in plaats van aan de stem van de docent. Dit is de pagina die een leerling elke les opent: de meest bezochte plek is de minst eigen plek.

**De spellen: verdeeld.** Voor de rollenspellen klopt de belofte uit PRODUCT.md dat het mechanisme van de stof het spel ís: Wie beslist, Stem per stand, De vergadering van de klas, Berlijn, Verdeel je rijk, De handelsroute, Ontwerp je stad. Die bestaan nergens anders. Voor de drie spellen met het meeste verkeer — Torenverdediging, Zwaardvechter, Vragenrace — klopt hij niet: alle drie putten uit dezelfde `bank-*.js`, en de lesbrief van Zwaardvechter zegt het zelf ("Dezelfde vragenbank als Torenverdediging, in een actiespel"). Dat zijn goede spellen met een goede vragenbank, maar het is één quiz met drie jassen.

**Deterministische scan.** 233 bevindingen over zeventien bestanden, alle van niveau "waarschuwing" of lager. Daarvan zijn er **151 aantoonbaar onjuist**: de 64 contrastmeldingen op de handleiding, het klasoverzicht en de lesbrieven combineren donkere-modus-letterkleuren met lichte-modus-vlakken (in de echte pagina komt `#b3bbd0` op `#ffffff` nul keer voor), en de 56 "tight-leading"-meldingen van 0,14x zijn een leesfout van de statische analyse: de laagste gemeten regelhoogte in de echte pagina is 1,0 en lopende tekst zit op 1,55. De 43 "dark-glow"-meldingen zijn de navyschaduw uit het eigen merkboek. Wat overblijft en wél klopt: contrastfouten binnen de spellen (zie P1 hieronder), vier stukjes tekst onder de 11 px in Zwaardvechter en Torenverdediging, en acht kaarten-in-kaarten op de voorpagina.

**Browsermeting.** Nul horizontale overloop op 320 en 375 px. Nul consolefouten buiten de verwachte `/api/`-404's. Elk element dat met de tab-toets bereikt wordt heeft de amberen ring — zeventig keer gecontroleerd, geen uitzondering. Geen enkele `<img>` zonder alt. De koppenvolgorde klopt overal behalve op toren.html, waar h1 rechtstreeks naar h3 springt.

## Wat werkt

**De handleiding is geschreven door iemand die een collega heeft zien vastlopen.** De woordenlijst van zes termen is het bewijs: *Klikken* wordt uitgelegd als "één keer op de linkerknop van de muis drukken. Op een aanraakscherm: tikken met je vinger". Stap 4 zegt **"Zeg dit letterlijk tegen je klas"** en geeft de zinnen. De schermafbeeldingen hebben genummerde rode kadertjes die naar de tekst verwijzen. Dit veronderstelt nul voorkennis zonder ooit neerbuigend te worden — precies de toon die de site naar leerlingen gebruikt, toegepast op volwassenen.

**voorlezen.js is het meest eigen stuk code op de site.** De kop noemt de reden: lezen is voor een deel van de leerlingen het werk, niet de stof. De uitvoering volgt die redenering exact: alleen `speechSynthesis`, dus de belofte "geen volgen" blijft heel en het werkt zonder netwerk; drie standen zodat wie élke vraag voorgelezen wil nooit hoeft te drukken; en kan de browser het niet, dan komt de knop er niet. Een standaardoplossing had één knop en een cloud-dienst opgeleverd.

**De discipline rond thema en beweging is meetbaar echt.** Vijfenvijftig elementen in de leeromgeving door donker → licht → donker: nul verschil in afmeting. Elk bestand met meer dan drie animaties heeft een `prefers-reduced-motion`-regel, zonder uitzondering. En in het donker is het contrast op de zeven onderzochte pagina's schoon. De meeste producten beweren dit; dit product haalt het als je meet.

## Prioriteiten

**1. [P0] Het kopje boven de vraag verklapt het antwoord. 79 vragen, drie spellen.**
`toren.html:1759`, `zwaard.html:1575` en `race.html:296` zetten boven de vraag het onderdeel, en bij geschiedenis is dat de naam van het tijdvak. Nagerekend in de code:

```
kopje   : "tijdvak Grieken en Romeinen"
vraag   : "In welk tijdvak hoort dit? Het christendom wordt in het Romeinse rijk toegestaan"
keuzes  : jagers en boeren | monniken en ridders | Grieken en Romeinen | wereldoorlogen
```

`grep -c "In welk tijdvak hoort dit" bank-ges.js` geeft 79.

*Waarom het telt.* Deze sessie is de hele vragenbank herschreven omdat het langste antwoord het goede was. Dit is dezelfde fout en makkelijker te misbruiken: een leerling heeft drie vragen nodig om te merken dat hij het kopje kan lezen en de vraag kan overslaan. Het verandert een kennisspel stil in een plaatjesspel, en het maakt het onderdeelrooster in het klasoverzicht ruis voor die 79 vragen.

*Oplossing.* Onderdruk het kopje als het onderdeel een van de antwoorden noemt, en zet die controle als regel in `server/audit-bank.js`, naast de lengtecontrole die er al staat. Dan vangt hij de volgende soort lek ook.

**2. [P1] De klascode zit achter een rondje met een gezichtje.**
`#klasCode` en `#klasNaam` zitten in `#gezichtlade`, een lade die alleen opengaat via een knop van 38 bij 38 waarin een tekening staat. De voorpagina zegt tegen docenten "leerlingen gaan naar meneergreidanus.nl/leermiddelen, vullen de code en een bijnaam in", alsof het veld op de pagina staat. Het klasoverzicht zegt "onder klascode van je docent" zonder te zeggen waar dat is. De handleiding heeft er vijf substappen en een schermafbeelding voor nodig, beginnend met "klik rechtsboven op het rondje met het gezichtje".

*Waarom het telt.* Dit is de handeling waar het hele docentgedeelte op rust — geen koppeling, geen overzicht, geen rooster, geen weekopdracht. Hij wordt uitgevoerd door twaalfjarigen, één keer, aan het begin van een les, op dertig apparaten tegelijk. Drie documenten bestaan om te compenseren dat de knop onzichtbaar is. Als documentatie de plek van een knop moet uitleggen, staat de knop verkeerd.

*Oplossing.* Zolang er geen klas en geen speelcode is: zet het veld als één regel onder de inleiding — `[CODE] [Je bijnaam] [Koppelen]` met "Kreeg je een code van je docent?". Zodra koppelen gelukt is verdwijnt hij in de lade, want dan verandert de taak van *invullen* in *beheren*. Eén voorwaarde in de code, en stap 4 van de handleiding kan van vijf substappen naar twee.

**3. [P1] Het nul-sterrenscherm straft en verkoopt.**
`spel.js:171-175`: bij nul sterren krijgt het gezichtje de stemming `'sip'`, het label wordt "Volgende keer beter", en daaronder komt "X munten gemist. Zonder inloggen blijft je voortgang alleen in deze browser" met een inloglink. De knop "Delen" staat op de tweede plaats.

*Waarom het telt.* De zwakste leerling krijgt op zijn laagste moment een verdrietige versie van zichzelf, een troostzin, een aanbieding en een uitnodiging om zijn nul te delen. PRODUCT.md zegt dat de site een leerling aanspreekt als iemand die iets kan, niet als iemand die iets fout doet. Dit scherm doet het omgekeerde, precies bij de leerling voor wie de site bestaat. En het is het ene moment waarop "Oefen je fouten" de juiste volgende stap is; die staat er niet.

*Oplossing.* Laat de stemming `'sip'` vallen (neutraal bij nul, blij bij een record — het gezichtje hoort nooit teleurgesteld in de leerling te zijn). Vervang "Volgende keer beter" door iets wat een handeling noemt. Onderdruk het muntenblok bij nul sterren en zet op de plek van "Delen" een link naar de foutenmap. Delen hoort bij een goede uitslag; een uitweg hoort bij een slechte.

**4. [P1] Binnen de spellen haalt het contrast de norm niet.**
Gemeten in de echte pagina, in beide standen: het niveaubadgetje in Torenverdediging is wit op amber (**2,32:1**) en wit op crab (**3,08:1**); de pauzeknop en de snelheidsknop in het donker zijn crème op amber (**2,03:1**); in de Vragenrace dezelfde twee; in Zwaardvechter wit op groen (3,3:1) plus vier stukjes bediening­stekst onder de 11 px ("dichtbij, hard", "· Q, E of rechtsklik", "spatie of shift", "houd shift vast").

*Waarom het telt.* Deze sessie is precies deze regel overal buiten de spellen rechtgezet: donkere letters op crab en amber, want wit haalt de norm niet. Binnen de drie meest gespeelde spellen staat hij er nog. Het is dezelfde fout, op de plek waar leerlingen de meeste tijd doorbrengen.

*Oplossing.* Dezelfde als elders: `color:var(--navy)` op crab, amber en vista, en de bedieningstekst in Zwaardvechter naar minimaal 11 px.

**5. [P2] De site haalt zijn eigen toegankelijkheidsbeloftes niet helemaal.**
Twee dingen die deze sessie zijn gebouwd of beloofd, en die net niet af zijn.

De amberen focusring is `#EA9836` met drie beeldpunten afstand, dus hij wordt op de achtergrond getekend. Op het lichte `--room` (`#FBF6F1`) is dat **2,16:1** — onder de 3:1 die voor een focusaanduiding geldt. In het donker is het 7,33:1, ruim voldoende. Licht is de stand van de meeste schoollaptops.

En de tikdoelen: PRODUCT.md zegt 44 px. Op 375 px gemeten zitten er **23 van de 74** bedienbare dingen in de leeromgeving onder die maat, waaronder alle tien de vakchips (35 px), het gezichtje (38) en de knop "Lees voor" (38) — de knop die juist gebouwd is voor leerlingen die moeizaam lezen. Op lesbrieven.html zijn het er 51, op het klasoverzicht 55 als je de 35 spelschakelaars meetelt.

*Oplossing.* Een eigen `--focus`-token: `#B4701A` in het licht (4,4:1 op crème), amber in het donker. En `min-height:44px` op `.rij`, `.leesvak button`, `.klasvak input`, `.klasvak button` en `.gezichtknop` binnen het telefoonblok; de binnenruimte blijft, alleen het vak groeit.

## Persona's

**De collega van een andere school, twee minuten voor de bel.** Leest op de voorpagina "Geschiedenis die leeft" en "van een docent geschiedenis"; geeft hij biologie, dan concludeert hij dat dit niet voor hem is, terwijl 29 van de 34 spellen een vak bevatten dat hij kan gebruiken. Klikt hij door naar de lesbrieven, dan krijgt hij zeventien schermen volledig uitgeklapte lesbrieven; het filter "hoeveel tijd heb je" stelt precies de goede vraag en geeft een onleesbaar antwoord terug. Gaat hij naar /docent, dan ziet hij een grijze knop "Maak klascode" waarvan de uitleg in een `title` zit die hij nooit ziet. Wat wél goed staat: "demoklas bekijken" wordt vroeg en in gewone woorden aangeboden.

**De leerling op zijn eigen telefoon in een rumoerig lokaal.** Krijgt te horen "ga naar de link en vul de code in", vindt geen codeveld; het zit achter een tekening van een gezichtje. Tikt met zijn duim op chips van 35 px in een horizontale rail; een misser verandert het vak en het hele raster tekent opnieuw. Ziet voor het eerste spel: streak, kop, drie zinnen inleiding, docentlink, tien vakchips, een soortfilter, een zoekveld en drie snelknoppen — en het breedste knopje in de kopbalk heet "Voor docenten" en wijst van hem weg. Zit hij in een privévenster op een geleende telefoon, dan speelt hij een hele sessie voordat hij hoort dat er niets bewaard blijft.

**De vmbo-bb- of vso-leerling die traag leest.** Krijgt met "Lees voor" het beste wat er voor hem op de site staat, met een automatische stand zodat hij nooit hoeft te drukken — op een knop van 38 px. Moet zichzelf in Torenverdediging publiekelijk op vmbo-bb zetten om vragen te krijgen die hij kan lezen; de docent kan dat niet per klascode instellen. Ziet op Mijn voortgang "0 munten" en "Vragenrace ges kgt — 0" onder het handgeschreven regeltje "kijk eens wat je al hebt staan". En hoort met een schermlezer vijf links die allemaal "Nog een keer" heten.

## Kleine dingen

- "Voor docenten" wijst vanuit de leeromgeving naar het klasoverzicht en vanuit het klasoverzicht naar de pagina over jou. Eén label, twee bestemmingen.
- De voorpagina en de nieuwspagina heten "· Lorenzo Greidanus", alle andere pagina's "· meneer Greidanus". PRODUCT.md is er duidelijk over: de site is meneer Greidanus, de persoon is Lorenzo Greidanus. De voorpagina is de pagina die gedeeld wordt.
- De kleurkeuze staat op drie plekken: de knop in de kopbalk, het venstertje achter het gezichtje en Mijn voortgang. Eén thuis is genoeg.
- `klas.html:741` accepteert een lege klasnaam; twee naamloze klassen heten dan allebei "Klas".
- Het handgeschreven regeltje is het sterkste merkteken van de site en wordt bijna overal mooi gebruikt ("voor collega's", "en in de klas", "elke dag anders"). In de leeromgeving is het besteed aan "6 dagen op rij" — een getal, geen stem.
- Het tellertje op een gekozen filterchip haalt in het donker 4,37:1 bij 12 px, net onder de norm.
- `leermiddelen/handleiding/klas-dashboard.jpg` is 209 kB; veertien bronafbeeldingen in het Bronnenlab zitten tussen 205 en 476 kB.
- toren.html springt van h1 naar h3 zonder h2 ertussen.
- `vangnet.js` en "Klopt deze vraag niet?" zijn allebei stil uitstekend. Een meldknop bij een bank van 2856 vragen die door één persoon wordt onderhouden is geen extraatje maar gereedschap.

## Vragen om over na te denken

1. De leeromgeving is een filterkolom met een raster kaarten, en het is de enige pagina die een concurrent onveranderd zou kunnen gebruiken. De voorpagina bewijst dat je iets kunt bouwen dat niemand anders heeft. Hoe zou het dagelijkse thuis van een leerling eruitzien als het met dezelfde overtuiging was gebouwd — als het opende op het ene spel dat de docent net op het bord zette, in plaats van op een catalogus van vierendertig?
2. Er bestaan drie documenten om uit te leggen waar het codeveld zit. Hoeveel van je eigen documentatie zou je kunnen weggooien als het veld gewoon op de pagina stond?
3. PRODUCT.md zegt dat het mechanisme van de stof het spel ís. Torenverdediging, Zwaardvechter en de Vragenrace delen één vragenbank, en de lesbrief zegt dat hardop. Gaat die belofte over de hele catalogus, of over de zeven rollenspellen waar hij onbetwist klopt — en als het dat laatste is, waarom zijn juist die zeven het moeilijkst te vinden in de leeromgeving?
4. Het klasoverzicht geeft de docent 35 vinkjes voor "wat je klas mag spelen" en één weekopdracht. Het ene is een archiveerklus, het andere verandert wat een klas deze week doet. Welke van de twee is het product, en waarom krijgt de archiveerklus vijf keer zo veel scherm?
5. Het eindscherm weet al dat de leerling nul haalde: het verandert de stemming van het gezichtje en wisselt het label. Het heeft alles in huis om hem naar de foutenmap te sturen en iets waars en bruikbaars te zeggen. Wat zou dat scherm zeggen als het geschreven was door dezelfde persoon die "lezen is voor een deel van de leerlingen het werk, niet de stof" schreef?
