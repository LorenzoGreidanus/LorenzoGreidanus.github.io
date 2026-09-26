/* De stappen van de tutorial per oefenspel. Elk spel roept bij de start
   TUTORIAL.naStart(...) aan met zijn eigen lijst uit dit bestand; de tekst
   staat hier bij elkaar, zodat hij in een keer na te lezen is.

   Elke stap: { titel, tekst, doel }. doel is een id op het spelscherm, een
   functie die een element geeft, of niets (dan staat het kaartje in het
   midden). De teksten zijn kort en concreet: wat zie je, wat doe je, en
   waarom. Op een aanraakscherm zeggen ze tikken in plaats van klikken. */
window.TUTORIALS = (function(){
  'use strict';
  function vinger(){ return document.documentElement.classList.contains('raak') || !!(window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches); }
  function tik(){ return vinger() ? 'Tik' : 'Klik'; }
  function el(sel){ return function(){ return document.querySelector(sel); }; }
  return {
    race: function(){ return [
      { titel: 'De tijd loopt', doel: 'mTijd', tekst: 'Je hebt een minuut. Een goed antwoord geeft er drie seconden bij, een fout antwoord haalt er vijf af.' },
      { titel: 'De vraag', doel: 'vraagTekst', tekst: 'Lees de vraag en ' + tik().toLowerCase() + ' op het antwoord. Je mag ook de toetsen 1 tot 4 gebruiken.' },
      { titel: 'Op rij', doel: 'mReeks', tekst: 'Drie keer achter elkaar goed en elk antwoord telt dubbel. Eén fout en je begint weer bij nul.' },
      { titel: 'Fout? Dan lees je waarom', doel: 'terug', tekst: 'Hier staat na elk antwoord de uitleg. Even lezen, dan ' + tik().toLowerCase() + ' je verder. De tijd loopt intussen door, dus niet te lang.' }
    ]; },
    dag: function(){ return [
      { titel: 'Tien vragen, iedereen dezelfde', doel: 'mNr', tekst: 'Elke dag krijgt iedereen dezelfde tien vragen. Je mag ze een keer maken, dus denk even na.' },
      { titel: 'Snel is meer', doel: 'mTijd', tekst: 'Antwoord je snel, dan krijg je extra punten. Maar een goed antwoord telt altijd meer dan een snel fout antwoord.' },
      { titel: 'Kiezen', doel: 'opties', tekst: tik() + ' op het antwoord, of gebruik de toetsen 1 tot 4. Daarna lees je of het goed was en waarom.' },
      { titel: 'Het klassement', doel: null, tekst: 'Aan het eind zie je waar je staat tussen iedereen die vandaag speelde. Morgen zijn er weer tien nieuwe.' }
    ]; },
    fouten: function(){ return [
      { titel: 'Jouw eigen fouten', doel: 'mVan', tekst: 'Dit zijn vragen die je eerder fout had in een ander spel. Ze komen terug tot je ze goed hebt.' },
      { titel: 'De klok', doel: 'mOver', tekst: 'Je hebt even de tijd. Goed antwoord? Dan gaat de vraag uit je map. Fout? Dan komt hij nog eens.' },
      { titel: 'Lees de uitleg', doel: 'terug', tekst: 'Na elk antwoord staat hier waarom. Dat is waar je van leert; lees het even voor je verder gaat.' }
    ]; },
    rekenen: function(){ return [
      { titel: 'De klok', doel: 'klok', tekst: 'Je tijd loopt af. Elk goed antwoord geeft tijd erbij, een fout antwoord haalt tijd af.' },
      { titel: 'De som', doel: 'vraag', tekst: 'Reken de som uit en ' + tik().toLowerCase() + ' op het antwoord. Hier staat ook welke soort som het is.' },
      { titel: 'Goed op rij', doel: 'reeksTekst', tekst: 'Meer goed achter elkaar is meer punten per som. Bij een fout begin je opnieuw te tellen.' },
      { titel: 'Punten', doel: 'punten', tekst: 'Hier zie je je score. Aan het eind zie je welke sommen je fout had, met de uitleg erbij.' }
    ]; },
    werkwoorden: function(){ return [
      { titel: 'De zin', doel: 'zin', tekst: 'Er mist een werkwoord. Kijk naar het onderwerp (wie doet het?) en of het nu of vroeger is.' },
      { titel: 'Kies de spelling', doel: 'keuzes', tekst: tik() + ' op de goede vorm. Twijfel je? Denk aan de stam, en aan \'t kofschip voor de verleden tijd.' },
      { titel: 'De regel', doel: 'regel', tekst: 'Na je antwoord staat hier welke regel geldt. Zo leer je niet alleen dit woord, maar de hele regel.' },
      { titel: 'Spieken mag', doel: 'spiekBtn', tekst: 'Weet je het niet meer? Hier staan de regels op een rij. Kijken kost geen punten.' }
    ]; },
    breuken: function(){ return [
      { titel: 'De taart', doel: 'plaatje', tekst: 'Elke breuk zie je als een taart: het onderste getal zegt in hoeveel stukken, het bovenste hoeveel stukken je hebt.' },
      { titel: 'Vul de breuk in', doel: 'invoervak', tekst: 'Typ de teller (boven) en de noemer (onder), of kies uit de knoppen. Vereenvoudigen hoeft niet, gelijkwaardig is ook goed.' },
      { titel: 'Nakijken', doel: 'kijkBtn', tekst: tik() + ' op Kijk na. Fout? Dan zie je aan de taart wat er wel klopt en wat niet.' },
      { titel: 'Goed op rij', doel: 'mReeks', tekst: 'Hier tel je hoeveel je achter elkaar goed had. Dat is je score aan het eind.' }
    ]; },
    dhte: function(){ return [
      { titel: 'Het schema', doel: 'schema', tekst: 'Elk cijfer heeft een eigen kolom: eenheden, tientallen, honderdtallen, duizendtallen. Van rechts naar links.' },
      { titel: 'Vul het vakje in', doel: 'schema', tekst: 'Alleen het vakje dat oplicht kun je invullen. Typ er een cijfer in. Je begint altijd rechts, bij de eenheden.' },
      { titel: 'Onthouden en lenen', doel: 'plaatsuitleg', tekst: 'Komt een kolom boven de 9, dan zet je een 1 in het kleine vakje erboven: onthouden. Kun je niet aftrekken, dan leen je 10 van de kolom links.' },
      { titel: 'Fout? Dan lees je hier waarom', doel: 'reactie', tekst: 'Je krijgt twee kansen per vakje. Daarna staat het goede cijfer erin, met de uitleg. Een som telt als goed als alles in een keer klopte.' }
    ]; },
    tekst: function(){ return [
      { titel: 'Lees de alinea', doel: 'alinea', tekst: 'Eerst lezen, dan pas naar de vraag. Let op signaalwoorden als maar, want, daarom en bijvoorbeeld.' },
      { titel: 'De vraag', doel: 'vraagkop', tekst: 'Er zijn drie soorten vragen: wat is de kernzin, welk signaalwoord past, en wat wil de schrijver (informeren, overtuigen, amuseren).' },
      { titel: 'Kies', doel: 'keuzes', tekst: tik() + ' op je antwoord. Is het fout, dan staat hieronder waarom, met het stukje tekst waar het in zit.' }
    ]; },
    vlakken: function(){ return [
      { titel: 'De figuur', doel: 'beeld', tekst: 'Kijk naar de zijden en de hoeken: hoeveel, even lang, evenwijdig, rechte hoeken? Daaraan herken je de vorm.' },
      { titel: 'Kies de naam', doel: 'opties', tekst: tik() + ' op de naam die erbij hoort. Soms krijg je juist een naam en kies je de figuur.' },
      { titel: 'De uitleg', doel: 'reactie', tekst: 'Na elk antwoord staat hier wat de figuur bijzonder maakt. Zo houd je een ruit en een parallellogram uit elkaar.' }
    ]; },
    irregular: function(){ return [
      { titel: 'Het werkwoord', doel: 'betekenis', tekst: 'Je ziet de Nederlandse betekenis. Typ de drie Engelse vormen: infinitive, past simple en past participle.' },
      { titel: 'Drie vakjes', doel: 'drie', tekst: 'Bijvoorbeeld: go, went, gone. ' + tik() + ' op Kijk na als je alle drie hebt ingevuld.' },
      { titel: 'Hulp', doel: 'hintBtn', tekst: 'Een hint geeft de eerste letter. Overslaan mag ook; het woord komt later terug.' },
      { titel: 'Score', doel: 'scoreLabel', tekst: 'Alle drie goed is een punt. Aan het eind zie je welke werkwoorden je nog moet leren.' }
    ]; },
    zinsbouw: function(){ return [
      { titel: 'De losse woorden', doel: 'voorraad', tekst: 'Hier liggen de woorden van een zin door elkaar. ' + tik() + ' ze in de goede volgorde aan.' },
      { titel: 'De zin groeit', doel: 'zin', tekst: 'Elk woord dat je kiest komt hier te staan. Verkeerd woord? ' + tik() + ' erop en het gaat terug.' },
      { titel: 'Nakijken', doel: 'kijkBtn', tekst: 'Klaar? ' + tik() + ' op Kijk na. Met Toon zie je de goede zin, maar dan telt hij niet mee.' }
    ]; },
    uitverkoop: function(){ return [
      { titel: 'Het prijskaartje', doel: 'kaartvak', tekst: 'Je ziet een prijs en een korting. Reken uit wat je betaalt, of hoeveel procent korting het is.' },
      { titel: 'Typ je antwoord', doel: 'invoerrij', tekst: 'Vul het bedrag of het percentage in. Met Reken uit krijg je een tussenstap als je vastzit.' },
      { titel: 'Kijk na', doel: 'kijkBtn', tekst: tik() + ' op Kijk na. Fout? Dan staat hier de berekening in stappen: eerst 1%, dan het hele deel.' }
    ]; },
    lichaam: function(){ return [
      { titel: 'Het lichaam', doel: 'lijfvak', tekst: 'Je ziet een orgaan of een deel van het lichaam oplichten. Wat is het, en wat doet het?' },
      { titel: 'De vraag', doel: 'vraagTekst', tekst: 'Soms moet je het deel aanwijzen, soms de naam of de taak kiezen. Lees goed wat er gevraagd wordt.' },
      { titel: 'Kiezen', doel: 'opties', tekst: tik() + ' op je antwoord. Hieronder lees je daarna wat dit deel doet en waarom het antwoord klopt.' }
    ]; },
    vlaggen: function(){ return [
      { titel: 'De vlag', doel: 'beeld', tekst: 'Kijk naar de kleuren, de strepen en de tekens. Daaraan herken je het land.' },
      { titel: 'Kies het land', doel: 'opties', tekst: tik() + ' op de naam. Soms krijg je juist het land en kies je de vlag.' },
      { titel: 'De uitleg', doel: 'reactie', tekst: 'Na elk antwoord staat hier iets over de vlag: waar de kleuren vandaan komen. Zo onthoud je hem beter.' }
    ]; },
    landenvormen: function(){ return [
      { titel: 'De vorm van een land', doel: 'beeld', tekst: 'Je ziet de omtrek van een land, zonder naam en zonder buren. Kijk naar de vorm en de kustlijn.' },
      { titel: 'Kies het land', doel: 'opties', tekst: tik() + ' op de naam. Lastig? Denk aan waar het land ligt en hoe groot het is.' },
      { titel: 'De uitleg', doel: 'reactie', tekst: 'Hier staat waaraan je de vorm herkent. De volgende keer zie je het meteen.' }
    ]; },
    topografie: function(){ return [
      { titel: 'De kaart', doel: 'kaartvak', tekst: 'Op de kaart staat een stip. Welke plaats of welk land is dat? Typ de naam.' },
      { titel: 'Typen', doel: 'antwoord', tekst: 'Hoofdletters en accenten zijn niet belangrijk. ' + tik() + ' op Kijk na, of druk op Enter.' },
      { titel: 'Hulp', doel: 'hintBtn', tekst: 'Een hint geeft de eerste letters. Weet je het niet, tik dan op Ik weet het niet: je ziet het goede antwoord en gaat verder.' }
    ]; },
    tijdvakken: function(){ return [
      { titel: 'Kaartjes met gebeurtenissen', doel: 'kaartzone', tekst: 'Elk kaartje is een gebeurtenis, een uitvinding of een persoon. Bij welk tijdvak hoort het?' },
      { titel: 'De bakken', doel: 'bakken', tekst: 'Sleep het kaartje naar de goede bak, of ' + tik().toLowerCase() + ' eerst het kaartje en dan de bak. Kijk naar de kenmerken van het tijdvak, niet alleen naar het jaartal.' },
      { titel: 'Na de ronde', doel: 'melding', tekst: 'Hier lees je wat goed en fout ging, en waarom. Na elke ronde lees je wat de volgende ronde anders maakt.' }
    ]; },
    organisme: function(){ return [
      { titel: 'De ladder', doel: 'ladder', tekst: 'Van klein naar groot: cel, weefsel, orgaan, orgaanstelsel, organisme. Elke sport is een niveau.' },
      { titel: 'De opdracht', doel: 'opdracht', tekst: 'Je bouwt een organisme op door de goede delen te kiezen. Lees wat er gevraagd wordt: welk niveau, of welke taak.' },
      { titel: 'Kiezen', doel: 'opties', tekst: tik() + ' op je antwoord. Fout? Dan lees je hieronder waarom, en waar het deel wel thuishoort.' }
    ]; },
    balans: function(){ return [
      { titel: 'De vergelijking als balans', doel: 'weeg', tekst: 'Links en rechts wegen evenveel. In elk zakje zit x. Zoek uit wat er in een zakje zit.' },
      { titel: 'Aan allebei de kanten hetzelfde', doel: el('.knoppen, #aBlokAf'), tekst: 'Haal aan beide kanten evenveel weg, of deel beide kanten. De balans blijft dan in evenwicht. Dat is de regel van vergelijkingen oplossen.' },
      { titel: 'Zo min mogelijk stappen', doel: 'scoreLabel', tekst: 'Je bent klaar als er nog een zakje over is. Hoe minder stappen, hoe beter. Met Terug haal je een stap ongedaan.' }
    ]; }
  };
})();
