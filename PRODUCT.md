# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Leerlingen in het voortgezet onderwijs**, vmbo-basis tot vwo, ongeveer twaalf tot zestien jaar. Ze komen binnen via een link die de docent op het bord zet, op een schoollaptop of hun eigen telefoon, meestal tijdens de les en soms thuis om te oefenen voor een toets. Ze hebben geen account en verwachten geen uitleg vooraf.

**Docenten**, en dat zijn er twee soorten. Lorenzo Greidanus zelf, die het materiaal maakt voor zijn eigen klassen: docent geschiedenis en mens en maatschappij, en mentor in het voortgezet speciaal onderwijs in Emmeloord. En collega's van andere vakken en andere scholen, die een werkvorm zoeken die in hun eigen les past. Een collega kijkt vaak kort voor de bel en moet dan binnen een paar minuten kunnen zien of iets past.

Beide groepen zijn echt. De leerling is de dagelijkse gebruiker, maar de collega is geen bijvangst: als de route voor hem niet werkt, mist het materiaal zijn tweede doel.

## Product Purpose

Lesmateriaal en werkvormen die Lorenzo zelf maakt en gebruikt, op één plek en vrij te gebruiken. De site bestaat om twee dingen mogelijk te maken: een leerling die oefent of iets beleeft zonder drempel, en een docent die dat morgen in zijn eigen les kan gebruiken zonder voorbereiding.

Geslaagd is een les waarin leerlingen niet met een rijtje jaartallen de deur uit gaan, maar met een vraag waar ze thuis nog over doorpraten. Dat staat ook zo op de voorpagina en is de maat die de site aan zichzelf aanlegt.

## Positioning

Gemaakt door een docent die zelf voor de klas staat, met een afgeronde mbo-opleiding Game Developer van daarvoor. Dat is te zien in wat de spellen doen: het zijn geen quizzen met een jasje, maar spellen waarin het mechanisme van de stof zelf het spel is. Stemmen per stand laat je de onmacht van de Derde Stand voelen in plaats van erover lezen. De Conferentie van Berlijn laat je Afrika verdelen en daarna zien hoe het echt liep. Bij elk spel hoort een lesbrief met leerdoel, tijd, niveau, werkvorm en nabespreking.

Een naburig product kan dat niet zomaar overnemen: de spellen en de vragen komen uit de eigen lespraktijk van één docent, en het materiaal is vrij te gebruiken zonder betaalmuur en zonder account.

## Operating Context

- **Digibord met de hele klas.** Klasquiz en Klasstrijd, en de rollenspellen (Stem per stand, De crisis, De vergadering van de klas, Langs de meetlat, De Conferentie van Berlijn, De Griekse wereld) waarbij leerlingen meedoen via een code op hun telefoon of laptop en het bord de rollen verdeelt.
- **Individueel oefenen** op een laptop of telefoon, in de les of thuis.
- **De collega die kort kijkt.** De lesbrieven vermelden per spel hoe lang het duurt en voor welk niveau het is; dat is de vraag vijf minuten voor de bel.
- **Klascode** van vier letters, geldig tot de docent hem opheft, met een bijnaam. De docent ziet daarna in het klasoverzicht wie welk spel tot hoever haalde.
- **Speelcode** van acht letters neemt voortgang mee naar een ander apparaat. Nadrukkelijk geen account.
- Publiceren gaat door te pushen naar `Live-branch`; Cloudflare bouwt en zet live.

## Capabilities and Constraints

- Eenendertig spellen, 2435 vragen in één gedeelde vragenbank (waaronder per vak de examenstof vmbo: geschiedenis, aardrijkskunde, biologie, wiskunde, economie, maatschappijkunde en Engelse examenwoorden), eenendertig lesbrieven.
- Statische HTML, CSS en JavaScript, één zelfstandig bestand per pagina, zonder bouwstap. Gedeelde bestanden staan in `leermiddelen/`: `basis.css`, `spel.css`, `spel.js`, `avatar.js`, `klas.js`, `rollen.js`, `profiel.js`, `bank.js`.
- Cloudflare Workers met Durable Objects voor alles wat samen gebeurt: `Kamer` (spelkamers), `Klassement`, `Poort`, `Sets` (eigen vragensets), `Beheer`, `Profiel` (speelcodes).
- Geen externe scripts en geen CDN's. Alles wordt zelf gehost, ook de lettertypen.
- Niveaus heten vmbo-bb, vmbo-kgt en tl, en havo en vwo. De spellen die uit de vragenbank putten splitsen havo en vwo apart. Sommige spellen schuiven vanzelf een niveau omhoog of omlaag, nooit onder wat de leerling koos.
- **Onbeslist:** of er ooit echte accounts komen. Nu zijn ze er niet, en de speelcode is bewust geen account, maar dat is de huidige stand en geen toezegging.
- **Onbeslist:** offline werken. De site is als app te installeren en een spel dat je een keer opende start ook zonder netwerk, maar dat is niet als belofte vastgelegd.

## Brand Commitments

- **Namen.** De site heet *meneer Greidanus*; de persoon is *Lorenzo Greidanus*. De voorpagina gebruikt de persoonsnaam, de leeromgeving en de spellen de sitenaam.
- **Toon.** Speels, warm, helder, vakkundig, uitnodigend. Nederlands, korte zinnen, geen jargon richting leerlingen. De site spreekt een leerling aan als iemand die iets kan, niet als iemand die iets fout doet.
- **Het handgeschreven regeltje** boven een kop (Caveat) is de stem van de docent in het ontwerp en hoort bij de site.
- **Vier uitgangspunten** uit de Over-pagina, die in alles terugkomen: geschiedenis die leeft, formatief evalueren, digitaal en mediawijs, mentor en structuur.
- **Twee harde beloftes**, door de maker bevestigd: geen volgen en geen analytics, en altijd gratis en vrij te gebruiken in de eigen klas, met bronvermelding.

## Evidence on Hand

- 2435 vragen in `leermiddelen/bank.js` (negen vakken, met Economie als examenvak); 31 lesbrieven in `leermiddelen/lesbrieven.html`; 31 spellen in de catalogus van `leermiddelen/index.html`. De leeromgeving kent naast het niveau een leerjaar (1-2 of 3-4); in leerjaar 3-4 staat de examenstof van het vmbo erbij: Nederlands (De tekstdetective), geschiedenis, aardrijkskunde, biologie, wiskunde, economie, maatschappijkunde en Engelse examenwoorden. Het klasoverzicht toont per leerling per onderdeel het aandeel goed (formatief). Wie is ingelogd spaart munten (per goed antwoord in elk oefenspel, meer per antwoord in lange spellen) voor cosmetica in de leeromgeving (leermiddelen/cosmetica.js: hoeden, randen, zwaardskins, en trofeeën die je vrijspeelt door in Zwaardvechter een baas te verslaan); het saldo staat op de server in het profiel. Zwaardvechter heeft drie stijlen (ridder, schutter, schildwacht met blokkeren), een critical na drie goed op rij, arenagevaren vanaf ronde 4, elitefouten en een vaardigheidskeuze na elke baas. Het Bronnenlab heeft 46 bronnen: 20 echte (twee per tijdvak, met afbeelding), 14 oefenbronnen en 12 vaardigheidsbronnen.
- Acht met de hand gebouwde taferelen op de voorpagina, met bronvermelding onder elk tafereel (bijvoorbeeld Pike e.a., Science 2012, bij de handen in de grot).
- De Over-pagina met opleiding (tweedegraads lerarenopleiding Geschiedenis, Windesheim Zwolle), werkplek en onderwijsbasis (EDI, formatief evalueren, Positive Behavior Support).
- **Niet aanwezig, en niet te verzinnen:** aanbevelingen van collega's, gebruikscijfers, bezoekersaantallen, namen van scholen buiten de eigen werkplek, prijzen of licenties.
- **Verouderd feit om op te letten:** de Over-pagina spreekt van "negentien spellen" en van niveaukeuze voor leerjaar 1 en 2. Het zijn er nu drieëndertig. Die tekst is niet bijgewerkt; ga er niet van uit dat hij klopt.

## Product Principles

1. **Een link is genoeg.** Geen inloggen, geen installatie, geen instelwerk voordat er iets te spelen valt.
2. **Laten zien gaat voor uitleggen.** Waar een beeld de regel kan dragen, draagt het beeld hem.
3. **De leerling gaat voor, de collega mag niet stranden.** Een keuze die goed is voor de leerling maar de docent laat vastlopen, is geen goede keuze.
4. **Een fout is een les.** Bij elk fout antwoord hoort de uitleg, op het moment dat de leerling hem wil.
5. **Wat de site over zichzelf zegt, is waar.** Geen volgen, gratis, en geen belofte die het product niet nakomt.

## Accessibility & Inclusion

Ontworpen voor het hele voortgezet onderwijs, vmbo-basis tot vwo. De maker werkt in het voortgezet speciaal onderwijs maar heeft daar geen aparte ontwerpeisen aan verbonden: zijn eigen klas is een deel van dat spectrum, geen apart geval.

Bestaande praktijk die werk moet blijven halen: beweging zit overal achter `prefers-reduced-motion`, contrast is gemeten in de lichte en de donkere stand, tikdoelen zijn 44 pixels, en het omschakelen tussen licht en donker verandert kleuren maar nooit maten.
