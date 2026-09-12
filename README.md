# meneergreidanus.nl

Een site, twee kanten: de voorkant voor collega's en een aparte leeromgeving voor leerlingen.

## Structuur

| Pad | Waarvoor |
|---|---|
| `index.html` | Startpagina: acht levende taferelen (grot, kleitablet, Pnyx, drukkerij, VOC-schip, Februaristaking, Apollo 11, de klas) met canvas-animatie, daarna "Vandaag in de geschiedenis" en de wereldbol |
| `over.html` | Over mij, mijn aanpak, materiaal en contact |
| `404.html` | Foutpagina |
| `privacy.html` | Privacy: geen accounts, geen volgcookies, geen analytics; wat er in de browser bewaard wordt |
| `voorwaarden.html` | Gebruiksvoorwaarden: vrij gebruiken in de les met bronvermelding, niet verkopen |
| `robots.txt`, `sitemap.xml` | Voor zoekmachines; de sitemap noemt alle pagina's |
| `fonts.css`, `fonts/` | Poppins en Caveat, zelf gehost (Open Font License), zodat er geen verzoek naar Google gaat |
| `CNAME` | Overblijfsel van GitHub Pages; de site draait nu op Cloudflare (zie onderaan) |
| `wrangler.jsonc` | De Cloudflare-configuratie: de map is de site, `/api/`, `/ws/` en `/q` gaan naar de server, elke spelkamer is een Durable Object |
| `server/index.js` | De server: kamers aanmaken (`POST /api/kamer`), de stand opvragen, WebSockets doorzetten naar de kamer, de korte link `/q/CODE` |
| `server/kamer.js` | Een spelkamer: spelers, WebSockets, de spelstand en de regels van de Klasquiz; de kamer is de baas over de score |
| `server/maak-bank.js` | Controleert `leermiddelen/bank.js` na een wijziging aan de vragen (aantallen per niveau, complete vragen, de rekengenerator): `node server/maak-bank.js` |
| `server/klassement.js` | Het klassement van de hele site (Durable Object per spel): top honderd, naamfilter, een inzending per apparaat per twintig seconden |
| `server/naamfilter.js` | Het naamfilter tegen racistische en haatdragende bijnamen, ook met cijfers, tekens en herhaalde letters; `server/maak-filter.js` maakt er `leermiddelen/naamfilter.js` van voor de browser |
| `server/sets.js` | Eigen vragensets van de Klasquiz (Durable Object): een docent bewaart zijn getypte vragen onder een code van zes tekens en haalt ze op elk apparaat weer op, een half jaar lang |
| `server/poort.js` | De poortwachter (Durable Object): telt per adres hoe vaak er kamers gemaakt en scores ingestuurd worden en remt een stroom af |
| `_headers` | Koppen die Cloudflare bij elk bestand meegeeft: niet in een frame van een andere site, geen raden naar bestandstype, en lange bewaartijd voor lettertypen en kaartgegevens |
| `.assetsignore` | Wat er niet als website wordt uitgedeeld (servermap, configuratie) |
| `wereld.json` | Kustlijnen voor de wereldbol op de startpagina (Natural Earth, publiek domein) |
| `rijken.json` | Grenzen van tien rijken op hun hoogtepunt, geknipt en vereenvoudigd uit [historical-basemaps](https://github.com/aourednik/historical-basemaps) (GPL-3; dit bestand valt onder dezelfde licentie) |
| `tijdlagen.json` | Per moment van de wereldbol de drie grootste rijken (26 jaarkaarten, 1942 met de hand getekend), vereenvoudigd uit [historical-basemaps](https://github.com/aourednik/historical-basemaps) (GPL-3; dit bestand valt onder dezelfde licentie); wordt pas geladen als de bol in beeld komt |
| `leermiddelen/index.html` | Leeromgeving: voorpagina voor leerlingen met niveaukeuze |
| `leermiddelen/basis.css` | Gedeelde afwerking van alle spellen (kleuren uit het merkboek, knoppen, beweging, focus, spelgevoel) en de donkere stand; wordt na de eigen stijl van elk spel geladen |
| `leermiddelen/adaptief.js` | Meegroeiend niveau: wie de vragen te goed weet, krijgt ze een stap zwaarder (tl naar havo, havo naar vwo); alleen in Torenverdediging en Zwaardvechter |
| `leermiddelen/thema.js` | De schakelaar licht/donker van de leeromgeving; deelt de keuze (`localStorage` sleutel `thema`) met de hoofdpagina's |
| `leermiddelen/klasquiz.html` | Klasquiz: de docent opent een kamer op het digibord met vragen uit de bank of met eigen getypte vragen (een vraag, de antwoorden eronder, een sterretje voor het goede; te bewaren als set met een code), leerlingen doen mee op hun telefoon via `meneergreidanus.nl/q` |
| `leermiddelen/bank.js` | De vragenbank: vakken, niveaus, de vragen per vak (NED, ENG, GES, AARD en de vervolgen), de onderdelen en de rekengenerator. Gedeeld door Torenverdediging, Zwaardvechter en de Klasquiz; vragen pas je hier aan (bovenin staat per vak een lijst, met ernaast een lijst met het niveau 1 tot 4 per vraag) |
| `leermiddelen/strijd.html` | Klasstrijd: Torenverdediging of Zwaardvechter met de hele klas, de docent start en ziet de stand, goede reeksen sturen fouten naar de anderen |
| `leermiddelen/strijd.js` | Samen spelen vanuit Torenverdediging en Zwaardvechter: het duel tegen een vriend (kamer voor twee, begint vanzelf), de klasstrijd (`?kamer=CODE`, haakjes `STRIJD.klaar`, `STRIJD.reeks`, `STRIJD.af`) en het klassement van de site op start- en eindscherm. Samen met een vriend is echt samen, in de pas (lockstep): allebei rekenen precies hetzelfde spel uit. In Zwaardvechter in vaste stappen van een zestigste seconde, met de toetsen, het ontwijken en het klaar-zijn in de winkel als opdrachten die de gastheer per stap bevestigt (`STRIJD.stuurNet`, haakje `net`), en de maat die met een kleine voorraad stappen achter hem aan loopt en zijn tempo iets bijstelt om die voorraad te houden; de klok van de gastheer tikt vanuit een Web Worker, zodat hij doorrekent als zijn tabblad niet zichtbaar is. In Torenverdediging net zo: allebei rekenen precies hetzelfde spel uit, tik voor tik, met hetzelfde toeval (`zaai`/`toeval`, het zaad komt van de gastheer), en alles wat een speler doet (bouwen, versterken, verplaatsen, een slot kopen, een ronde vervroegen, een antwoord) is een opdracht die bij allebei in dezelfde tik wordt uitgevoerd (`voerUit`); de gastheer bevestigt om de twee tikken welke opdrachten erin zaten, met af en toe een vingerafdruk van de stand, en de maat loopt een paar tikken achter hem aan. Klopt de vingerafdruk niet meer (verschil in rekenwerk tussen browsers), dan valt het terug op het doorsturen van een compacte stand acht keer per seconde |
| `leermiddelen/klas.html` | Klasoverzicht voor de docent: maak een klascode (een week geldig), leerlingen koppelen zich in de leeromgeving met code en bijnaam, en na elk potje Torenverdediging of Zwaardvechter staat de uitslag hier, per leerling en als tabel, te downloaden als CSV; de sleutel staat alleen in de browser van de docent |
| `leermiddelen/klas.js` | De koppeling met de klas aan de kant van de leerling (`KLAS.lees/zet/wis/meld`); de spellen melden hun einduitslag via `/api/klas/CODE/meld` |
| `leermiddelen/bronnenlab.html` | Bronnenonderzoek met drie vaste vragen |
| `leermiddelen/tijdvakken.html` | Gebeurtenissen sorteren naar tijdvak |
| `leermiddelen/feodalisme.html` | Heer, ridder of boer: keuzes met gevolgen |
| `leermiddelen/handel.html` | Handelsroute met een markt die reageert op vraag en aanbod |
| `leermiddelen/vergadering.html` | Onderhandelen met de zeven gewesten, 1672 |
| `leermiddelen/stad.html` | Bouw je stad, staat nu op binnenkort |

De leeromgeving is dus gewoon een map in dezelfde repository. Bezoekers komen uit op `meneergreidanus.nl/leermiddelen/`.

## Kant-en-klare links voor in de les

- `meneergreidanus.nl/leermiddelen/?n=bb` opent de leerlingpagina met vmbo-bb al gekozen
- `meneergreidanus.nl/leermiddelen/bronnenlab.html?n=kgt` start meteen het juiste spel op het juiste niveau
- `feodalisme.html?n=hv&rol=boer` en `handel.html?n=kgt&r=hanze` zetten ook de rol of route vast

In het spel verdwijnt de keuzeknop dan, met de melding dat je docent die keuze al gemaakt heeft.

## Hosting en server

De site draait op Cloudflare Workers. Elke push naar `Live-branch` wordt door Cloudflare gebouwd en live gezet (`npx wrangler deploy`). De HTML-bestanden zijn gewoon de site; alleen `/api/`, `/ws/` en `/q` gaan naar de server in `server/`. Lokaal testen, inclusief de spelkamers:

```
npm install
npm run dev
```

Dat geeft http://localhost:8787. De status van de lokale server staat bewust buiten de map (`../.wrangler-state`): in de map zelf zet hij de bestandswaker in een lus, en een lang pad maakt de opslag van de kamers op Windows kapot.

### Wat de server tegenhoudt

- Een klascode is een kamer zonder spel: leerlingen melden er uitslagen (hoogstens dertig per leerling per spel, drieduizend per klas, veertig meldingen per minuut per adres), alleen de docent leest ze met de sleutel, en na een week is alles weg.
- Kamers maken, scores insturen en verbinden kan alleen vanaf de site zelf (de browser stuurt de herkomst mee); een andere site kan dat niet namens een bezoeker doen.
- De poortwachter laat per adres hoogstens vijftien kamers per tien minuten en twaalf scores per twee minuten door.
- In een kamer kent een speler alleen zijn eigen kenmerk; naar buiten toe heet iedereen bij een kort openbaar nummer, dus niemand kan zich voor een ander uitgeven. Wie meer dan driehonderd berichten per tien seconden stuurt wordt genegeerd, boven de twaalfhonderd afgesloten.
- Het plaatje bij een quizvraag mag alleen eenvoudige vormen bevatten (geen scripts, verwijzingen of gebeurtenissen); de kamer en de pagina kijken er allebei naar.
- Het klassement kapt verzonnen scores af (hoogstens ronde 250 en 5000 punten) en een rij is weg te halen met de beheersleutel: zet die eenmalig met `npx wrangler secret put BEHEER` en stuur dan `DELETE /api/klassement/toren` met de kop `x-beheer` en `{"naam":"..."}` of `{"id":"..."}` als inhoud.

## Nieuw spel toevoegen

1. Zet het bestand in `leermiddelen/`.
2. Voeg het toe aan de lijst `SPELLEN` bovenin `leermiddelen/index.html`.
3. Maak een kaart aan in de sectie materiaal van `over.html`, met `href="leermiddelen/naam.html"`.

## Uitleg per spel

Bovenin elk spelbestand staat de inhoud (bronnen, gebeurtenissen, gebouwen, havens) met commentaar erboven, gescheiden van de motor eronder. Zo kun je inhoud toevoegen zonder aan de werking te komen. De vragen van Torenverdediging, Zwaardvechter en de Klasquiz staan sinds september 2026 in het gedeelde `leermiddelen/bank.js`; daardoor is Torenverdediging van 900 naar 400 kB gegaan en Zwaardvechter van 530 naar 100 kB, en laadt de bank één keer voor alle drie.
