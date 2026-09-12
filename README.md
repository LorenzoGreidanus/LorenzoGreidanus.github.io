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
| `server/maak-bank.js` | Maakt `leermiddelen/bank.js` uit `toren.html`; opnieuw draaien na elke wijziging aan de vragen |
| `server/klassement.js` | Het klassement van de hele site (Durable Object per spel): top honderd, naamfilter, een inzending per apparaat per twintig seconden |
| `server/naamfilter.js` | Het naamfilter tegen racistische en haatdragende bijnamen, ook met cijfers, tekens en herhaalde letters; `server/maak-filter.js` maakt er `leermiddelen/naamfilter.js` van voor de browser |
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
| `leermiddelen/klasquiz.html` | Klasquiz: de docent opent een kamer op het digibord, leerlingen doen mee op hun telefoon via `meneergreidanus.nl/q` |
| `leermiddelen/bank.js` | De vragenbanken en de rekengenerator, gemaakt uit `toren.html` door `server/maak-bank.js`; niet met de hand bewerken |
| `leermiddelen/strijd.html` | Klasstrijd: Torenverdediging of Zwaardvechter met de hele klas, de docent start en ziet de stand, goede reeksen sturen fouten naar de anderen |
| `leermiddelen/strijd.js` | Samen spelen vanuit Torenverdediging en Zwaardvechter: het duel tegen een vriend (kamer voor twee, begint vanzelf), de klasstrijd (`?kamer=CODE`, haakjes `STRIJD.klaar`, `STRIJD.reeks`, `STRIJD.af`) en het klassement van de site op start- en eindscherm. Samen met een vriend is echt samen: de eerste speler is gastheer en rekent alles uit, de ander stuurt via de kamer wat hij doet (`STRIJD.stuurNet`, haakje `net`) en tekent de stand die terugkomt. In Zwaardvechter zijn dat zijn toetsen, twaalf keer per seconde een stand; in Torenverdediging spelen ze in de pas (lockstep): allebei rekenen precies hetzelfde spel uit, tik voor tik, met hetzelfde toeval (`zaai`/`toeval`, het zaad komt van de gastheer), en alles wat een speler doet (bouwen, versterken, verplaatsen, een slot kopen, een ronde vervroegen, een antwoord) is een opdracht die bij allebei in dezelfde tik wordt uitgevoerd (`voerUit`); de gastheer bevestigt om de twee tikken welke opdrachten erin zaten, met af en toe een vingerafdruk van de stand, en de maat loopt een paar tikken achter hem aan. Klopt de vingerafdruk niet meer (verschil in rekenwerk tussen browsers), dan valt het terug op het doorsturen van een compacte stand acht keer per seconde |
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

Bovenin elk spelbestand staat de inhoud (bronnen, gebeurtenissen, gebouwen, havens) met commentaar erboven, gescheiden van de motor eronder. Zo kun je inhoud toevoegen zonder aan de werking te komen.
