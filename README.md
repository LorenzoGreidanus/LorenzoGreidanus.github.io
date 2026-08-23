# meneergreidanus.nl

Een site, twee kanten: de voorkant voor collega's en een aparte leeromgeving voor leerlingen.

## Structuur

| Pad | Waarvoor |
|---|---|
| `index.html` | Startpagina: het scrollverhaal met de tijdbalk |
| `over.html` | Over mij, mijn aanpak, materiaal en contact |
| `404.html` | Foutpagina |
| `CNAME` | Koppelt de site aan meneergreidanus.nl |
| `leermiddelen/index.html` | Leeromgeving: voorpagina voor leerlingen met niveaukeuze |
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
