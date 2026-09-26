/* De gegevens van Vraag en aanbod (vraagenaanbod.html): de gebeurtenissen die
   een lijn laten verschuiven en de begrippen. vraagenaanbod.html maakt er
   opgaven van; bank-spellen.js maakt er vragen van voor de vragenbank.
   GEBEURTENISSEN: t = wat er gebeurt, product = de markt, lijn = vraag of
   aanbod, kant = rechts (meer) of links (minder), uit = de uitleg.
   BEGRIPPEN: b = het begrip, u = de uitleg, hv = alleen havo en vwo. */
window.VRAAGAANBOD_DATA = {
  GEBEURTENISSEN: [
    { t:'Het wordt een hete zomer en iedereen wil ijs.', product:'ijsjes', lijn:'vraag', kant:'rechts', uit:'Meer mensen willen ijs bij elke prijs: de vraaglijn schuift naar rechts. De evenwichtsprijs stijgt.' },
    { t:'Een populaire influencer zegt dat dit T-shirt uit de mode is.', product:'T-shirts', lijn:'vraag', kant:'links', uit:'Minder mensen willen het shirt bij elke prijs: de vraaglijn schuift naar links. De prijs daalt.' },
    { t:'Een grote fabriek van flesjes water sluit.', product:'flesjes water', lijn:'aanbod', kant:'links', uit:'Er wordt bij elke prijs minder aangeboden: de aanbodlijn schuift naar links. De prijs stijgt.' },
    { t:'Nieuwe machines maken broodjes bakken goedkoper.', product:'broodjes', lijn:'aanbod', kant:'rechts', uit:'Bakkers kunnen bij elke prijs meer aanbieden: de aanbodlijn schuift naar rechts. De prijs daalt.' },
    { t:'Het inkomen van gezinnen stijgt en concertkaartjes worden populairder.', product:'concertkaartjes', lijn:'vraag', kant:'rechts', uit:'Meer koopkracht en meer belangstelling: de vraaglijn naar rechts, de prijs omhoog.' },
    { t:'Slecht weer verpest de aardbeienoogst.', product:'aardbeien', lijn:'aanbod', kant:'links', uit:'Er zijn minder aardbeien: de aanbodlijn schuift naar links en de prijs stijgt.' },
    { t:'Veel mensen kopen een elektrische fiets in plaats van een tweedehands fiets.', product:'tweedehands fietsen', lijn:'vraag', kant:'links', uit:'De vraag naar tweedehands fietsen daalt: vraaglijn naar links, prijs omlaag.' },
    { t:'De overheid geeft subsidie aan boeren die aardbeien telen.', product:'aardbeien', lijn:'aanbod', kant:'rechts', uit:'Telen wordt goedkoper, dus meer aanbod bij elke prijs: aanbodlijn naar rechts, prijs omlaag.' },
    { t:'De prijs van katoen (de grondstof) verdubbelt.', product:'T-shirts', lijn:'aanbod', kant:'links', uit:'Produceren wordt duurder: de aanbodlijn schuift naar links, de prijs stijgt.' },
    { t:'Een school verplicht een agenda voor alle leerlingen.', product:'schoolagenda’s', lijn:'vraag', kant:'rechts', uit:'Meer vraag bij elke prijs: de vraaglijn naar rechts.' },
    { t:'Naast de ijssalon opent een tweede ijssalon.', product:'ijsjes', lijn:'aanbod', kant:'rechts', uit:'Er zijn meer verkopers, dus bij elke prijs wordt er meer aangeboden: de aanbodlijn schuift naar rechts en de prijs daalt.' },
    { t:'Het is een koude, natte zomer en bijna niemand heeft zin in ijs.', product:'ijsjes', lijn:'vraag', kant:'links', uit:'Minder mensen willen ijs bij elke prijs: de vraaglijn schuift naar links en de prijs daalt.' },
    { t:'De stroomprijs stijgt flink, en ijsmachines verbruiken veel stroom.', product:'ijsjes', lijn:'aanbod', kant:'links', uit:'Ijs maken wordt duurder, dus bij elke prijs wordt er minder aangeboden: de aanbodlijn naar links, de prijs omhoog.' },
    { t:'De overheid voert een extra belasting in op flesjes water.', product:'flesjes water', lijn:'aanbod', kant:'links', uit:'Een belasting maakt verkopen duurder voor de aanbieders: de aanbodlijn schuift naar links en de prijs stijgt.' },
    { t:'Op alle festivals komen gratis kraanwaterpunten.', product:'flesjes water', lijn:'vraag', kant:'links', uit:'Gratis kraanwater is een vervanger (substituut): minder mensen kopen flesjes, de vraaglijn schuift naar links.' },
    { t:'Een goede tarweoogst maakt meel een stuk goedkoper.', product:'broodjes', lijn:'aanbod', kant:'rechts', uit:'De grondstof wordt goedkoper, dus bakkers bieden bij elke prijs meer aan: aanbodlijn naar rechts, prijs omlaag.' },
    { t:'Het minimumloon gaat omhoog en broodjeszaken moeten hun personeel meer betalen.', product:'broodjes', lijn:'aanbod', kant:'links', uit:'Hogere loonkosten maken produceren duurder: de aanbodlijn schuift naar links en de prijs stijgt.' },
    { t:'Een beroemde voetballer draagt dit T-shirt in een interview.', product:'T-shirts', lijn:'vraag', kant:'rechts', uit:'Het shirt wordt populair: meer vraag bij elke prijs, de vraaglijn naar rechts en de prijs omhoog.' },
    { t:'Een populaire band kondigt drie extra concerten aan in dezelfde zaal.', product:'concertkaartjes', lijn:'aanbod', kant:'rechts', uit:'Er zijn veel meer kaartjes beschikbaar: de aanbodlijn schuift naar rechts en de prijs daalt.' },
    { t:'De zanger van de band raakt in opspraak en veel fans haken af.', product:'concertkaartjes', lijn:'vraag', kant:'links', uit:'Minder mensen willen een kaartje: de vraaglijn schuift naar links en de prijs daalt.' },
    { t:'Veel mensen kopen een e-bike en zetten hun oude fiets te koop.', product:'tweedehands fietsen', lijn:'aanbod', kant:'rechts', uit:'Er worden bij elke prijs meer tweedehands fietsen aangeboden: aanbodlijn naar rechts, prijs omlaag.' },
    { t:'Een grote stad maakt het centrum autovrij en veel mensen zoeken een goedkope fiets.', product:'tweedehands fietsen', lijn:'vraag', kant:'rechts', uit:'Meer mensen willen een fiets bij elke prijs: de vraaglijn schuift naar rechts en de prijs stijgt.' },
    { t:'Uit onderzoek blijkt dat aardbeien heel gezond zijn.', product:'aardbeien', lijn:'vraag', kant:'rechts', uit:'Meer mensen willen aardbeien kopen: de vraaglijn naar rechts, de prijs omhoog.' },
    { t:'Omdat de prijs vorig jaar hoog was, gaan veel meer boeren aardbeien telen.', product:'aardbeien', lijn:'aanbod', kant:'rechts', uit:'Meer telers betekent meer aanbod bij elke prijs: de aanbodlijn schuift naar rechts en de prijs daalt.' },
    { t:'Veel leerlingen stappen over op een digitale agenda op hun telefoon.', product:'schoolagenda’s', lijn:'vraag', kant:'links', uit:'De telefoon is een vervanger voor de papieren agenda: de vraag daalt, de vraaglijn schuift naar links.' },
    { t:'De prijs van papier stijgt sterk.', product:'schoolagenda’s', lijn:'aanbod', kant:'links', uit:'De grondstof wordt duurder, dus de aanbodlijn schuift naar links en de prijs van agenda’s stijgt.' }
  ],
  BEGRIPPEN: [
    { b:'vraag', u:'de hoeveelheid die kopers bij een bepaalde prijs willen kopen' },
    { b:'aanbod', u:'de hoeveelheid die verkopers bij een bepaalde prijs willen verkopen' },
    { b:'evenwichtsprijs', u:'de prijs waarbij de gevraagde en de aangeboden hoeveelheid gelijk zijn' },
    { b:'schaarste', u:'er is minder van iets dan mensen zouden willen' },
    { b:'marktmechanisme', u:'de prijs verandert vanzelf tot vraag en aanbod gelijk zijn' },
    { b:'overschot', u:'bij deze prijs wordt er meer aangeboden dan gevraagd' },
    { b:'tekort', u:'bij deze prijs wordt er meer gevraagd dan aangeboden' },
    { b:'markt', u:'alle kopers en verkopers van een product samen, waar de prijs ontstaat' },
    { b:'consument', u:'iemand die producten koopt om ze zelf te gebruiken' },
    { b:'producent', u:'een bedrijf dat producten maakt of aanbiedt' },
    { b:'evenwichtshoeveelheid', u:'de hoeveelheid die bij de evenwichtsprijs wordt gekocht en verkocht' },
    { b:'vraaglijn', u:'de dalende lijn die laat zien hoeveel er bij elke prijs gevraagd wordt' },
    { b:'aanbodlijn', u:'de stijgende lijn die laat zien hoeveel er bij elke prijs aangeboden wordt' },
    { b:'concurrentie', u:'meerdere aanbieders strijden om dezelfde kopers' },
    { b:'koopkracht', u:'hoeveel je met je inkomen kunt kopen' },
    { b:'behoefte', u:'iets wat mensen willen hebben of nodig hebben' },
    { b:'winst', u:'wat een verkoper overhoudt: de opbrengst min de kosten' },
    { b:'omzet', u:'de prijs keer het aantal verkochte producten: al het geld dat binnenkomt' },
    { b:'afzet', u:'het aantal producten dat een bedrijf verkoopt' },
    { b:'monopolie', u:'er is maar één aanbieder van een product, dus geen concurrentie' },
    { b:'inflatie', u:'de prijzen stijgen gemiddeld, zodat je voor hetzelfde geld minder kunt kopen' },
    { b:'veiling', u:'een verkoop waarbij de koper die het meeste biedt het product krijgt' },
    { b:'dienst', u:'iets wat iemand voor je doet en wat je niet kunt vastpakken, zoals een knipbeurt' },
    { b:'reclame', u:'een bedrijf probeert met advertenties de vraag naar zijn product te vergroten' },
    { b:'prijselasticiteit', u:'hoe sterk de gevraagde hoeveelheid reageert op een prijsverandering', hv:true },
    { b:'substituut', u:'een product dat een ander product kan vervangen, zoals thee voor koffie', hv:true },
    { b:'complementair goed', u:'een product dat je samen met een ander gebruikt, zoals een printer en inkt', hv:true },
    { b:'minimumprijs', u:'een prijs die de overheid vaststelt en waar de marktprijs niet onder mag komen', hv:true },
    { b:'maximumprijs', u:'een prijs die de overheid vaststelt en waar de marktprijs niet boven mag komen', hv:true }
  ]
};
