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
| `CNAME` | Koppelt de site aan meneergreidanus.nl |
| `wereld.json` | Kustlijnen voor de wereldbol op de startpagina (Natural Earth, publiek domein) |
| `rijken.json` | Grenzen van tien rijken op hun hoogtepunt, geknipt en vereenvoudigd uit [historical-basemaps](https://github.com/aourednik/historical-basemaps) (GPL-3; dit bestand valt onder dezelfde licentie) |
| `tijdlagen.json` | Per moment van de wereldbol de drie grootste rijken (26 jaarkaarten, 1942 met de hand getekend), vereenvoudigd uit [historical-basemaps](https://github.com/aourednik/historical-basemaps) (GPL-3; dit bestand valt onder dezelfde licentie); wordt pas geladen als de bol in beeld komt |
| `leermiddelen/index.html` | Leeromgeving: voorpagina voor leerlingen met niveaukeuze |
| `leermiddelen/basis.css` | Gedeelde afwerking van alle spellen (kleuren uit het merkboek, knoppen, beweging, focus, spelgevoel) en de donkere stand; wordt na de eigen stijl van elk spel geladen |
| `leermiddelen/adaptief.js` | Meegroeiend niveau: wie de vragen te goed weet, krijgt ze een stap zwaarder (tl naar havo, havo naar vwo); alleen in Torenverdediging en Zwaardvechter |
| `leermiddelen/thema.js` | De schakelaar licht/donker van de leeromgeving; deelt de keuze (`localStorage` sleutel `thema`) met de hoofdpagina's |
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

## Nieuw spel toevoegen

1. Zet het bestand in `leermiddelen/`.
2. Voeg het toe aan de lijst `SPELLEN` bovenin `leermiddelen/index.html`.
3. Maak een kaart aan in de sectie materiaal van `over.html`, met `href="leermiddelen/naam.html"`.

## Uitleg per spel

Bovenin elk spelbestand staat de inhoud (bronnen, gebeurtenissen, gebouwen, havens) met commentaar erboven, gescheiden van de motor eronder. Zo kun je inhoud toevoegen zonder aan de werking te komen.
