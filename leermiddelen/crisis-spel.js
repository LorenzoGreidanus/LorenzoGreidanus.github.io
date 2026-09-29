/* ============================================================================
   DE CRISIS: de regels en de teksten, gedeeld door het bord (crisis.html) en
   de laptops van de leerlingen (crisis-team.html).

   Koude Oorlog, oktober 1962. De klas speelt in twee teams: de VS en de NAVO
   tegenover de Sovjet-Unie en het Warschaupact. Elk team heeft eigen, geheime
   doelen en eigen inlichtingen. Samen hebben ze één belang: geen kernoorlog.
   Zeven rondes, van dinsdag 16 tot zondag 28 oktober (de dertien dagen).

   Per ronde kiest elk team:
     - een zet (openbaar; het bord laat beide zetten tegelijk zien),
     - hoogstens één bericht aan de andere kant: een vaste zin, een eigen
       zin, of een aanbod (een voorstel voor een afspraak),
     - een antwoord op het aanbod dat de andere kant de vorige ronde deed.
   Het bord rekent met CRISIS.los() uit wat dat samen doet.

   Alles hier is puur: geen pagina, geen verbinding. Zo kan het bord rekenen
   en kan de leerling dezelfde teksten tonen met alleen een id erbij.
   Een zet toevoegen: zet hem in ZETTEN.vs of ZETTEN.ussr, met een
   voorwaarde in kan(), en een regel in COMBOS als hij samen met een zet van
   de ander iets bijzonders doet.
   ============================================================================ */
(function(root){
  'use strict';

  /* ---------- de twee teams ----------
     Geen 'Comintern': die bestond in 1962 niet meer (opgeheven in 1943). Het
     bondgenootschap rond Moskou was in 1962 het Warschaupact (1955). */
  var TEAMS = {
    vs: { id:'vs', naam:'VS en de NAVO', kort:'VS / NAVO', plek:'het Witte Huis', leider:'president', leiderNaam:'Kennedy',
      kleur:'#204ECF', licht:'#83A5F2',
      wie:'Jullie zijn de Verenigde Staten, met de NAVO-bondgenoten achter je. President John F. Kennedy overlegt met zijn crisisgroep, ExComm.',
      zin:'Er worden Russische raketten gebouwd op Cuba, 145 kilometer van Florida.' },
    ussr: { id:'ussr', naam:'Sovjet-Unie en het Warschaupact', kort:'USSR / Warschaupact', plek:'het Kremlin', leider:'partijleider', leiderNaam:'Chroesjtsjov',
      kleur:'#c0442c', licht:'#F26749',
      wie:'Jullie zijn de Sovjet-Unie, met de landen van het Warschaupact achter je. Partijleider Nikita Chroesjtsjov overlegt met de partijtop in het Kremlin.',
      zin:'Jullie hebben in het geheim raketten naar Cuba gebracht. Amerika heeft al jaren raketten in Turkije staan, vlak bij jullie grens.' }
  };
  function ander(t){ return t === 'vs' ? 'ussr' : 'vs'; }

  /* ---------- de zeven rondes ----------
     dag: welke van de dertien dagen (16 oktober is dag 1). sp: wat de dag
     zelf aan spanning toevoegt, ook als niemand iets doet. */
  var DAGEN = [
    { d:'dinsdag 16 oktober', dag:1, sp:0, kop:'Foto’s op het bureau van de president',
      tekst:'In het Witte Huis liggen spionagefoto’s op tafel. Kennedy roept zijn adviseurs bij elkaar. In Moskou denkt men dat het geheim nog veilig is.' },
    { d:'maandag 22 oktober', dag:7, sp:2, kop:'Een week van geheim overleg',
      tekst:'Een week lang is er in het geheim vergaderd. Vandaag gaan de Amerikaanse strijdkrachten naar DEFCON 3. Iedereen voelt dat er iets gaat gebeuren.' },
    { d:'woensdag 24 oktober', dag:9, sp:2, kop:'Schepen op weg naar Cuba',
      tekst:'Russische vrachtschepen, begeleid door onderzeeboten, naderen het Caribisch gebied. De Amerikaanse bommenwerpers staan klaar.' },
    { d:'donderdag 25 oktober', dag:10, sp:0, kop:'De wereld kijkt naar de VN',
      tekst:'De Veiligheidsraad van de Verenigde Naties vergadert. Secretaris-generaal U Thant vraagt beide kanten om even pas op de plaats te maken.' },
    { d:'vrijdag 26 oktober', dag:11, sp:2, bouw:1, kop:'Op Cuba wordt doorgewerkt',
      tekst:'Op Cuba wordt dag en nacht gewerkt: de raketbases worden vanzelf klaar. Castro verwacht elk moment een Amerikaanse invasie.' },
    { d:'zaterdag 27 oktober', dag:12, sp:4, kop:'Zwarte zaterdag',
      tekst:'Een Amerikaans spionagevliegtuig raakt de weg kwijt en vliegt boven de Sovjet-Unie. Russische straaljagers stijgen op. Niemand heeft dat bevolen.' },
    { d:'zondag 28 oktober', dag:13, sp:2, kop:'De laatste dag',
      tekst:'De Amerikaanse generaals willen morgen aanvallen als de raketten er dan nog staan. Wat de wereld vanavond op de radio hoort, bepalen jullie.' }
  ];

  /* ---------- de zetten ----------
     sp: spanning, az: aanzien van het eigen team (0 tot 10), nieuws: de
     krantenkop als deze zet op het bord komt. */
  var ZETTEN = {
    vs: [
      { id:'blokkade', t:'Zeeblokkade rond Cuba', u:'De marine houdt schepen met wapens tegen. Kennedy noemt het een ‘quarantaine’: geen aanval, wel een dreiging.',
        sp:8, az:1, nieuws:'Kennedy op televisie: blokkade rond Cuba' },
      { id:'handhaven', t:'Blokkade hard handhaven', u:'Schepen aanhouden en doorzoeken, onderzeeboten dwingen boven te komen.',
        sp:10, az:1, nieuws:'Amerikaanse marine houdt schepen aan' },
      { id:'vn', t:'Foto’s tonen in de VN', u:'Laat in de Veiligheidsraad aan de hele wereld zien wat er op Cuba staat.',
        sp:2, az:2, nieuws:'Bewijs in de VN: foto’s van raketbases' },
      { id:'verkenning', t:'Laag over Cuba vliegen', u:'Verkenningsvliegtuigen fotograferen hoe ver de raketbases zijn. Geeft jullie geheime informatie.',
        sp:5, az:0, nieuws:'Amerikaanse straaljagers scheren over Cuba' },
      { id:'alarm', t:'Troepen naar Florida', u:'Een invasie voorbereiden. Laat zien dat je het meent, zonder te schieten.',
        sp:12, az:1, nieuws:'Tienduizenden soldaten naar Florida' },
      { id:'luchtaanval', t:'Bombardeer de raketbases', u:'Je generaals willen het. Maar niet alle raketten worden geraakt, en er vallen Russische doden.',
        sp:28, az:1, schiet:true, nieuws:'Amerikaanse bommen op Cuba' },
      { id:'invasie', t:'Val Cuba binnen', u:'Honderdduizend soldaten aan land. Geen weg terug.',
        sp:40, az:0, schiet:true, nieuws:'Amerikaanse invasie op Cuba' },
      { id:'wachten', t:'Afwachten en verder overleggen', u:'Geen nieuwe stap vandaag. De klok tikt door, en het ziet er besluiteloos uit.',
        sp:0, az:-1, nieuws:'Het Witte Huis zwijgt' }
    ],
    ussr: [
      { id:'verschepen', t:'Meer schepen met wapens', u:'Nog meer raketten en onderdelen naar Cuba, zolang het nog kan.',
        sp:6, az:0, nieuws:'Russische vrachtschepen op weg naar Cuba' },
      { id:'doorvaren', t:'De schepen varen door', u:'Ze houden ons niet tegen. Wie de blokkade breekt, laat zien dat hij niet bang is.',
        sp:14, az:1, nieuws:'Russische schepen varen op de blokkade af' },
      { id:'omkeren', t:'De schepen keren om', u:'Voor de blokkadelijn omdraaien. Veilig, maar je generaals vinden het zwak.',
        sp:-8, az:-1, nieuws:'Russische schepen keren om' },
      { id:'bouwen', t:'Sneller bouwen op Cuba', u:'Maak de raketbases gebruiksklaar voordat de Amerikanen iets doen.',
        sp:8, az:1, nieuws:'Op Cuba wordt dag en nacht gebouwd' },
      { id:'ontkennen', t:'Ontkennen in de VN', u:'‘Er staan geen aanvalswapens op Cuba.’ Houdt het geheim zo lang mogelijk vol.',
        sp:2, az:1, nieuws:'Moskou: ‘Geen raketten op Cuba’' },
      { id:'onderzeeboot', t:'Onderzeeboten naar de lijn', u:'Onderzeeboten begeleiden de schepen tot aan de blokkade.',
        sp:12, az:1, nieuws:'Russische onderzeeboten bij de blokkadelijn' },
      { id:'u2', t:'Luchtafweer mag vuren', u:'Jullie commandanten op Cuba mogen schieten op Amerikaanse spionagevliegtuigen.',
        sp:16, az:1, schiet:true, nieuws:'Luchtafweer op Cuba opent het vuur' },
      { id:'terugtrekken', t:'Haal de raketten weg', u:'Afbreken en terug naar de Sovjet-Unie. De crisis is dan voorbij, maar wat krijg je ervoor terug?',
        sp:-25, az:-3, nieuws:'Moskou haalt de raketten weg van Cuba' },
      { id:'wachten', t:'Afwachten', u:'Geen nieuwe stap vandaag. Op Cuba gaat het werk gewoon door.',
        sp:0, az:-1, nieuws:'Het Kremlin zwijgt' }
    ]
  };
  function zet(team, id){ return (ZETTEN[team] || []).filter(function(z){ return z.id === id; })[0] || null; }

  /* welke zetten er nu kunnen */
  function kan(st, team, id){
    if (team === 'vs'){
      if (id === 'blokkade') return !st.blokkade;
      if (id === 'handhaven') return st.blokkade;
      return true;
    }
    if (id === 'verschepen') return !st.blokkade && st.raketten > 0 && st.raketten < 3;
    if (id === 'doorvaren' || id === 'omkeren' || id === 'onderzeeboot') return st.blokkade;
    if (id === 'bouwen') return st.raketten > 0 && st.raketten < 3;
    if (id === 'terugtrekken') return st.raketten > 0;
    return true;
  }
  function opties(st, team){ return ZETTEN[team].filter(function(z){ return kan(st, team, z.id); }).map(function(z){ return z.id; }); }

  /* wat twee zetten samen doen, boven op hun eigen gevolgen */
  var COMBOS = [
    { vs:'handhaven', ussr:'doorvaren', sp:14, stop:true, tekst:'Een Russisch vrachtschip vaart recht op de blokkadelijn af. Een Amerikaanse torpedobootjager lost waarschuwingsschoten. Het schip wordt tegengehouden.' },
    { vs:'handhaven', ussr:'onderzeeboot', sp:16, tekst:'Amerikaanse schepen gooien oefendieptebommen op een Russische onderzeeboot, om hem boven te laten komen. Aan boord denkt de kapitein dat de oorlog begonnen is en wil hij een kerntorpedo afvuren. Eén officier, Vasili Archipov, weigert.' },
    { vs:'blokkade', ussr:'verschepen', sp:4, tekst:'Russische schepen varen op de net aangekondigde blokkadelijn af.' },
    { vs:'blokkade', ussr:'omkeren', sp:-8, tekst:'De schepen draaien bij. Het Witte Huis haalt adem.' },
    { vs:'handhaven', ussr:'omkeren', sp:-8, tekst:'De schepen draaien bij, vlak voor de lijn. ‘We stonden oog in oog, en ik denk dat de ander net met zijn ogen knipperde’, zegt de Amerikaanse minister Rusk.' },
    { vs:'vn', ussr:'ontkennen', sp:2, az:{ ussr:-2 }, tekst:'In de VN ontkent de Russische ambassadeur alles. Dan zet de Amerikaanse ambassadeur Stevenson grote foto’s neer: ‘Ik wacht op uw antwoord tot de hel bevriest.’' },
    { vs:'verkenning', ussr:'u2', sp:8, tekst:'Een Amerikaans spionagevliegtuig wordt boven Cuba neergeschoten. De piloot, majoor Rudolf Anderson, komt om.' },
    { vs:'luchtaanval', ussr:'u2', sp:10, tekst:'Amerikaanse bommen en Russische luchtafweer op dezelfde dag. Beide legers staan op scherp.' },
    { vs:'luchtaanval', ussr:'bouwen', sp:10, tekst:'De bommen vallen op bases waar net raketten klaar worden gemaakt. Niet alle raketten worden geraakt.' },
    { vs:'luchtaanval', ussr:'terugtrekken', sp:8, az:{ vs:-2, ussr:2 }, tekst:'Er vallen bommen op bases die al worden afgebroken. De wereld vraagt zich af wie hier de aanvaller is.' },
    { vs:'alarm', ussr:'bouwen', sp:6, tekst:'Beide kanten maken zich klaar voor een oorlog die niemand wil.' },
    { vs:'wachten', ussr:'wachten', sp:2, tekst:'Een dag zonder besluit. Op Cuba wordt dag en nacht doorgewerkt.' }
  ];

  /* ---------- berichten ----------
     Een vaste zin, een aanbod, of een eigen zin (door het naamfilter). Een
     vaste zin doet iets met de spanning: praten koelt af, dreigen niet. */
  var ZINNEN = [
    { id:'praten', sp:-4, t:{ vs:'Wij willen geen oorlog. Laten we praten.', ussr:'Wij willen geen oorlog. Laten we praten.' } },
    { id:'uitweg', sp:-4, t:{ vs:'Wij zoeken een uitweg waarbij niemand zijn gezicht verliest.', ussr:'Laten we niet allebei aan het touw trekken. Hoe harder we trekken, hoe vaster de knoop.' } },
    { id:'tijd', sp:-2, t:{ vs:'Geef ons tijd: wij overleggen met onze NAVO-bondgenoten.', ussr:'Geef ons tijd: wij overleggen met Havana en onze bondgenoten.' } },
    { id:'waarschuwing', sp:5, t:{ vs:'Elke raket die vanaf Cuba wordt afgevuurd, zien wij als een aanval van de Sovjet-Unie.', ussr:'Een aanval op Cuba is een aanval op de Sovjet-Unie.' } },
    { id:'eis', sp:4, t:{ vs:'Haal jullie raketten weg. Dit is een laatste waarschuwing.', ussr:'Haal eerst jullie eigen raketten uit Turkije weg.' } }
  ];
  function zin(id){ return ZINNEN.filter(function(z){ return z.id === id; })[0] || null; }
  /* De aanbiedingen: historisch geïnspireerd. 'kern' is de eerste brief van
     Chroesjtsjov (26 oktober), 'openlijk' de tweede (27 oktober), 'geheim'
     is wat Robert Kennedy en ambassadeur Dobrynin die avond afspraken, en
     'pauze' het voorstel van U Thant. */
  var AANBOD = [
    { id:'kern', kort:'Raketten weg, geen invasie', eind:true, sp:-30, az:{ vs:1, ussr:-1 },
      t:'De Sovjet-raketten gaan weg van Cuba. De VS beloven Cuba niet binnen te vallen, en heffen de blokkade op.' },
    { id:'geheim', kort:'Raketten weg, geen invasie, en geheim Turkije', eind:true, sp:-35, az:{ vs:1, ussr:-1 }, turkije:'geheim',
      t:'Zoals hierboven, en daarbij: de VS halen binnen een paar maanden hun Jupiter-raketten uit Turkije. Dat deel blijft geheim.' },
    { id:'openlijk', kort:'Openlijke ruil: Cuba tegen Turkije', eind:true, sp:-35, az:{ vs:-2, ussr:2 }, turkije:'openlijk',
      t:'Een openlijke ruil: de Sovjet-raketten weg van Cuba, de Amerikaanse raketten weg uit Turkije, en geen invasie van Cuba. Iedereen mag het weten.' },
    { id:'pauze', kort:'Pauze (voorstel van U Thant)', eind:false, sp:-10, az:{},
      t:'Een ronde pauze: geen schepen of bouwwerk richting Cuba, en de VS handhaven de blokkade niet en vallen niet aan. Wie de pauze breekt, verliest aanzien.' }
  ];
  function aanbod(id){ return AANBOD.filter(function(a){ return a.id === id; })[0] || null; }
  /* Op dag 1 weet de wereld nog van niets, en Moskou niet eens dat Washington
     het weet: aanbiedingen kunnen vanaf de tweede ronde. */
  function aanbodMag(st){ return st.r >= 1 && !st.klaar; }
  /* wat de pauze breekt */
  var BREEKT_PAUZE = { vs:['handhaven', 'luchtaanval', 'invasie', 'alarm'], ussr:['doorvaren', 'verschepen', 'bouwen', 'onderzeeboot', 'u2'] };
  /* wat een afspraak op dezelfde dag onmogelijk maakt: wie schiet, breekt hem */
  var BREEKT_AKKOORD = { vs:['luchtaanval', 'invasie'], ussr:['u2'] };

  /* ---------- de geheime doelen ----------
     Samen tellen ze op tot honderd. Bij een kernoorlog krijgt niemand iets. */
  var DOELEN = {
    vs: [
      { id:'weg', p:35, t:'De raketten zijn weg van Cuba', u:'Het belangrijkste: geen Russische kernraketten op 145 kilometer van Florida.' },
      { id:'geenaanval', p:20, t:'Geen bombardement of invasie nodig', u:'Een aanval kost levens en kan uit de hand lopen.' },
      { id:'navo', p:15, t:'Geen openlijke ruil met Turkije', u:'Je bondgenoten in de NAVO (vooral Turkije) moeten erop kunnen rekenen dat je ze niet inruilt.' },
      { id:'eerste', p:15, t:'Niet als eerste schieten', u:'Wie het eerste schot lost, krijgt de schuld.' },
      { id:'gezicht', p:15, t:'Geen gezichtsverlies', u:'Het aanzien van de VS is aan het eind minstens 5 van de 10. Over twee weken zijn er verkiezingen.' }
    ],
    ussr: [
      { id:'cuba', p:30, t:'Cuba is beschermd', u:'De VS beloven Cuba niet binnen te vallen, en er komt geen invasie. Daarvoor stonden de raketten er.' },
      { id:'turkije', p:25, t:'De Amerikaanse raketten gaan weg uit Turkije', u:'Die staan net zo dicht bij Moskou als Cuba bij Washington.' },
      { id:'sterk', p:15, t:'Niet zwak lijken', u:'Het aanzien van de Sovjet-Unie is aan het eind minstens 5 van de 10. China en Castro kijken mee.' },
      { id:'eerste', p:15, t:'Niet als eerste schieten', u:'Wie het eerste schot lost, krijgt de schuld.' },
      { id:'ruil', p:15, t:'Geef de raketten niet voor niets op', u:'Gaan ze weg, dan alleen in ruil voor iets.' }
    ]
  };
  /* haalt dit team dit doel, nu? true, false, of null (hangt nog af van het einde) */
  function doelNu(st, team, id){
    if (team === 'vs'){
      if (id === 'weg') return st.raketten === 0 ? true : (st.klaar ? false : null);
      if (id === 'geenaanval') return !(st.luchtaanval || st.invasie);
      if (id === 'navo') return !st.turkijeOpenlijk;
      if (id === 'eerste') return st.eerste !== 'vs';
      if (id === 'gezicht') return st.aanzien.vs >= 5 ? (st.klaar ? true : null) : (st.klaar ? false : null);
    } else {
      if (id === 'cuba') return st.invasie ? false : st.geenInvasie ? true : (st.klaar ? false : null);
      if (id === 'turkije') return st.turkijeGeheim || st.turkijeOpenlijk ? true : (st.klaar ? false : null);
      if (id === 'sterk') return st.aanzien.ussr >= 5 ? (st.klaar ? true : null) : (st.klaar ? false : null);
      if (id === 'eerste') return st.eerste !== 'ussr';
      if (id === 'ruil') return st.zonderRuil ? false : true;
    }
    return null;
  }
  function doelen(st, team){
    return DOELEN[team].map(function(d){ return { id:d.id, p:d.p, t:d.t, u:d.u, ok:doelNu(st, team, d.id) }; });
  }
  function punten(st, team){
    if (st.oorlog) return 0;
    return doelen(st, team).reduce(function(s, d){ return s + (d.ok === true ? d.p : 0); }, 0);
  }
  /* zo liep het echt, per doel */
  var ECHT_DOELEN = {
    vs:{ weg:true, geenaanval:true, navo:true, eerste:true, gezicht:true },
    ussr:{ cuba:true, turkije:true, sterk:false, eerste:false, ruil:true }
  };
  var ECHT_UITLEG = {
    vs:'Kennedy haalde alles: de raketten gingen weg, zonder aanval, en de NAVO hoorde niets van de ruil. De wereld zag hem als winnaar.',
    ussr:'Chroesjtsjov kreeg de belofte over Cuba en de raketten uit Turkije (april 1963). Maar omdat dat deel geheim bleef, leek het alsof hij had toegegeven. China lachte hem uit, Castro was woedend, en in 1964 werd hij afgezet. En het eerste schot kwam van zijn kant: op 27 oktober schoot de luchtafweer op Cuba een U-2 neer, zonder toestemming uit Moskou.'
  };

  /* ---------- geheime inlichtingen, per ronde en per team ----------
     t voor iedereen, meer als verdieping (havo en vwo). */
  var INTEL = [
    { vs:{ t:'Foto’s van een U-2-spionagevliegtuig (14 oktober): op Cuba worden lanceerplaatsen gebouwd voor Russische raketten. Die kunnen Washington en New York in een paar minuten bereiken.',
           meer:'Het gaat om raketten met een bereik van zo’n 2000 kilometer. De Sovjet-Unie heeft veel minder raketten die Amerika kunnen raken dan andersom. Met Cuba haalt Chroesjtsjov die achterstand in één klap in.' },
      ussr:{ t:'Operatie Anadyr: in het geheim zijn ruim 40.000 soldaten en tientallen raketten naar Cuba gebracht. Moskou denkt dat Washington nog van niets weet.',
           meer:'Er liggen ook kleine kernwapens voor het slagveld op Cuba, voor als de Amerikanen binnenvallen. De Amerikanen weten dat niet; ze horen het pas dertig jaar later.' } },
    { vs:{ t:'Je militairen willen de raketbases bombarderen en Cuba binnenvallen. Maar de luchtmacht zegt: we raken hooguit negen van de tien raketten. Wat overblijft, kan nog vuren.',
           meer:'In ExComm is Robert Kennedy, de broer van de president, tegen een verrassingsaanval. Hij noemt het ‘een Pearl Harbor andersom’.' },
      ussr:{ t:'De Amerikanen weten het: Kennedy spreekt vanavond op televisie. Een deel van jullie schepen met militaire lading is nog onderweg naar Cuba.',
           meer:'Eén schip, de Aleksandrovsk, heeft kernkoppen aan boord en is bijna in de haven.' } },
    { vs:{ t:'Je marine volgt Russische onderzeeboten bij Cuba. Je weet niet welke wapens ze aan boord hebben.',
           meer:'De Strategic Air Command, met de bommenwerpers en de kernraketten, staat vandaag op DEFCON 2. Dat is nog nooit gebeurd.' },
      ussr:{ t:'Vier onderzeeboten varen richting de blokkade. Elk heeft een torpedo met een kernkop aan boord. De kapiteins hebben al dagen geen contact met Moskou.',
           meer:'In de warme onderzeeboten loopt de temperatuur op tot boven de 45 graden. De bemanning is uitgeput.' } },
    { vs:{ t:'Ambassadeur Stevenson heeft grote foto’s klaarstaan voor de Veiligheidsraad. U Thant, de secretaris-generaal van de VN, stelt een pauze voor.',
           meer:'Een pauze geeft tijd, maar ook tijd om op Cuba verder te bouwen.' },
      ussr:{ t:'U Thant (VN) stelt voor: even geen schepen naar Cuba, en de Amerikanen handhaven de blokkade even niet. Dat geeft tijd zonder dat iemand toegeeft.',
           meer:'De wereld kijkt mee. Wie in de VN betrapt wordt op een leugen, verliest aanzien.' } },
    { vs:{ t:'Via een journalist van tv-zender ABC komt een bericht van een Russische diplomaat: ‘Raketten weg, als Amerika belooft Cuba niet binnen te vallen?’ ’s Avonds komt er een lange brief van Chroesjtsjov met hetzelfde voorstel.',
           meer:'De journalist heette John Scali. Niemand in Washington wist zeker of de diplomaat namens Chroesjtsjov sprak.' },
      ussr:{ t:'Castro schrijft: als de Amerikanen Cuba binnenvallen, moet de Sovjet-Unie als eerste toeslaan met kernwapens. De KGB meldt: in Florida staan Amerikaanse troepen klaar.',
           meer:'Chroesjtsjov schreef die dag een lange, persoonlijke brief aan Kennedy: ‘Laten we niet allebei aan het touw trekken.’' } },
    { vs:{ t:'De Jupiter-raketten in Turkije zijn verouderd; Kennedy wilde ze al eerder weg hebben. Maar de NAVO-bondgenoten, vooral Turkije, willen niet dat Amerika ze opgeeft onder druk.',
           meer:'Er kwam die dag een tweede brief uit Moskou, harder van toon en via de radio voor iedereen te horen: ook de raketten in Turkije moeten weg.' },
      ussr:{ t:'Jullie commandanten op Cuba mogen zelf beslissen over de luchtafweer. Ambassadeur Dobrynin kan vanavond in het geheim Robert Kennedy spreken, de broer van de president.',
           meer:'Een geheime afspraak kan wat een openlijke niet kan: niemand hoeft in het openbaar toe te geven.' } },
    { vs:{ t:'Je generaals willen morgen aanvallen als de raketten er dan nog staan. Gisteravond heeft Robert Kennedy de Russische ambassadeur een laatste kans gegeven.',
           meer:'Kennedy’s adviseurs schatten de kans op oorlog op ‘ergens tussen één op drie en fifty-fifty’.' },
      ussr:{ t:'Robert Kennedy heeft Dobrynin gezegd: we willen vóór morgen een antwoord, anders grijpen de militairen in. Hij liet doorschemeren dat de raketten in Turkije later stil kunnen verdwijnen, als niemand dat hoort.',
           meer:'Chroesjtsjov liet zijn antwoord de volgende ochtend voorlezen op Radio Moskou: sneller dan een brief.' } }
  ];
  /* inlichtingen die uit het spel zelf komen: alleen voor het eigen team */
  function intelNu(st, team){
    var l = [];
    if (team === 'ussr' && st.raketten > 0) l.push('Stand op Cuba: ' + st.raketten + ' van de 3 raketbases ' + (st.raketten === 3 ? 'gebruiksklaar. Ze kunnen vuren.' : 'klaar.'));
    if (team === 'ussr' && st.dreiging) l.push('De KGB ziet Amerikaanse troepen en landingsschepen in Florida.');
    if (team === 'vs' && st.gezien >= 0 && st.raketten > 0) l.push('Laatste foto’s: ' + st.gezien + ' van de 3 raketbases waren toen klaar.');
    if (team === 'vs' && st.gezien < 0) l.push('Hoe ver de raketbases zijn, weten jullie niet precies. Laag over Cuba vliegen geeft zekerheid.');
    if (st.pauzeRonde === st.r) l.push('Deze ronde geldt de pauze van U Thant. Wie hem breekt, verliest aanzien.');
    return l;
  }

  /* ---------- de stand ---------- */
  function nieuw(){
    return { r:0, spanning:10, raketten:1, blokkade:false, gezien:-1, bekend:false, aanzien:{ vs:5, ussr:5 },
      eerste:null, luchtaanval:false, invasie:false, dreiging:false, geenInvasie:false, turkijeGeheim:false, turkijeOpenlijk:false,
      zonderRuil:false, pauzeRonde:-1, open:{ vs:null, ussr:null }, oorlog:false, klaar:false, uitkomst:null, akkoord:null,
      vnGedaan:false, geschiedenis:[] };
  }
  function klem(v, a, b){ return Math.max(a, Math.min(b, Math.round(v))); }
  function defcon(sp){ return sp >= 100 ? 0 : sp >= 80 ? 1 : sp >= 60 ? 2 : sp >= 40 ? 3 : sp >= 20 ? 4 : 5; }
  var DEFCON_TEKST = ['kernoorlog', 'vinger aan de knop: de bommenwerpers staan klaar', 'oorlog is heel dichtbij', 'de legers staan op scherp', 'gespannen, maar er wordt gepraat', 'de wereld haalt adem'];

  /* ---------- een ronde uitrekenen ----------
     k = { vs:{ zet, bericht, antwoord }, ussr:{ ... } }
       bericht: null, { soort:'zin', id }, { soort:'aanbod', id } of { soort:'vrij', tekst }
       antwoord: 'ja' of 'nee' op het aanbod dat de ander vorige ronde deed
     Past de stand aan en geeft terug wat er gebeurde, voor het bord. */
  function los(st, k){
    var r = st.r, dag = DAGEN[r], uit = { r:r, zet:{ vs:k.vs.zet, ussr:k.ussr.zet }, sp0:st.spanning, regels:[], nieuws:[], combo:null,
      akkoord:null, afgewezen:[], breuk:[], berichten:[], pauzeBreuk:[] };
    var zv = zet('vs', k.vs.zet) || zet('vs', 'wachten'), zu = zet('ussr', k.ussr.zet) || zet('ussr', 'wachten');
    uit.zet = { vs:zv.id, ussr:zu.id };
    var sp = 0;
    /* 1. de zetten zelf */
    [['vs', zv], ['ussr', zu]].forEach(function(p){
      var t = p[0], z = p[1];
      sp += z.sp;
      var az = z.az;
      if (t === 'vs' && z.id === 'vn'){ if (st.vnGedaan) az = 0; st.vnGedaan = true; }
      if (t === 'ussr' && z.id === 'ontkennen' && st.bekend) az = -1;
      st.aanzien[t] = klem(st.aanzien[t] + az, 0, 10);
      if (z.schiet && !st.eerste) st.eerste = t;
      uit.nieuws.push(z.nieuws);
    });
    /* wat de zetten met de wereld doen */
    var combo = COMBOS.filter(function(c){ return c.vs === zv.id && c.ussr === zu.id; })[0] || null;
    if (zv.id === 'blokkade') st.blokkade = true;
    if (zv.id === 'vn'){ st.bekend = true; if (st.raketten > 0) st.gezien = st.raketten; }
    if (zv.id === 'alarm') st.dreiging = true;
    if (zu.id === 'verschepen' || zu.id === 'bouwen') st.raketten = Math.min(3, st.raketten + 1);
    if (zu.id === 'doorvaren' && !(combo && combo.stop)) st.raketten = Math.min(3, st.raketten + 1);
    if (zv.id === 'luchtaanval'){ st.luchtaanval = true; st.raketten = Math.max(st.raketten > 0 ? 1 : 0, st.raketten - 1); }
    if (zu.id === 'terugtrekken'){ st.raketten = 0; }
    if (zv.id === 'invasie'){
      st.invasie = true;
      /* de kleine kernwapens op Cuba: het team van Moskou weet het, Washington niet */
      if (st.raketten >= 2){ sp += 20; uit.regels.push('Op Cuba liggen kleine kernwapens voor het slagveld. De Russische commandanten gebruiken ze tegen de landingsschepen.'); }
      st.raketten = 0;
    }
    /* verkenning: de foto’s van vandaag, na wat er vandaag gebouwd is */
    if (zv.id === 'verkenning') st.gezien = st.raketten;
    if (combo){
      sp += combo.sp; uit.combo = combo.tekst;
      if (combo.az) Object.keys(combo.az).forEach(function(t){ st.aanzien[t] = klem(st.aanzien[t] + combo.az[t], 0, 10); });
    }
    /* 2. de pauze van vorige ronde: wie hem breekt */
    if (st.pauzeRonde === r){
      ['vs', 'ussr'].forEach(function(t){
        if (BREEKT_PAUZE[t].indexOf(uit.zet[t]) >= 0){
          sp += 8; st.aanzien[t] = klem(st.aanzien[t] - 2, 0, 10); uit.pauzeBreuk.push(t);
          uit.regels.push(TEAMS[t].kort + ' breekt de pauze van U Thant. De wereld ziet het.');
        }
      });
    }
    /* 3. de afspraken: een antwoord op een aanbod van vorige ronde, of
       allebei tegelijk hetzelfde aanbod */
    var akkoorden = [];
    ['vs', 'ussr'].forEach(function(t){
      var o = st.open[ander(t)];
      if (!o) return;
      if (k[t].antwoord === 'ja') akkoorden.push({ id:o, door:ander(t), ja:t });
      else uit.afgewezen.push({ id:o, door:ander(t), nee:t, stil:k[t].antwoord !== 'nee' });
    });
    var bv = k.vs.bericht, bu = k.ussr.bericht;
    if (r < 1){ if (bv && bv.soort === 'aanbod') bv = k.vs.bericht = null; if (bu && bu.soort === 'aanbod') bu = k.ussr.bericht = null; }
    if (bv && bu && bv.soort === 'aanbod' && bu.soort === 'aanbod' && bv.id === bu.id && !akkoorden.some(function(a){ return a.id === bv.id; })){
      akkoorden.push({ id:bv.id, door:'samen', ja:'samen' });
    }
    /* een afspraak die de crisis beëindigt gaat voor een pauze */
    akkoorden.sort(function(a, b){ return (aanbod(b.id).eind ? 1 : 0) - (aanbod(a.id).eind ? 1 : 0); });
    var eindAkkoord = null;
    akkoorden.forEach(function(a){
      var ab = aanbod(a.id);
      if (!ab) return;
      if (ab.eind && eindAkkoord) return;
      /* wie op dezelfde dag schiet, breekt de afspraak */
      var brekers = ['vs', 'ussr'].filter(function(t){ return BREEKT_AKKOORD[t].indexOf(uit.zet[t]) >= 0; });
      if (ab.eind && brekers.length){
        sp += 15;
        brekers.forEach(function(t){ st.aanzien[t] = klem(st.aanzien[t] - 2, 0, 10); });
        uit.breuk.push({ id:a.id, door:brekers });
        uit.regels.push('De afspraak (' + ab.kort.toLowerCase() + ') was bijna rond, maar ' + brekers.map(function(t){ return TEAMS[t].kort; }).join(' en ') + ' schoot op dezelfde dag. Van de afspraak komt niets.');
        return;
      }
      sp += ab.sp;
      Object.keys(ab.az).forEach(function(t){ st.aanzien[t] = klem(st.aanzien[t] + ab.az[t], 0, 10); });
      if (ab.eind){
        eindAkkoord = a;
        st.raketten = 0; st.geenInvasie = true; st.blokkade = false;
        if (ab.turkije === 'geheim') st.turkijeGeheim = true;
        if (ab.turkije === 'openlijk') st.turkijeOpenlijk = true;
        st.akkoord = a.id;
      } else {
        st.pauzeRonde = r + 1;
      }
      uit.akkoord = uit.akkoord || a;
      if (ab.eind) uit.akkoord = a;
    });
    /* de raketten eenzijdig weg: niets ervoor teruggekregen */
    if (zu.id === 'terugtrekken' && !eindAkkoord && !st.geenInvasie) st.zonderRuil = true;
    /* 4. de berichten van deze ronde */
    ['vs', 'ussr'].forEach(function(t){
      var b = k[t].bericht;
      if (!b) return;
      var tekst = '', soort = b.soort;
      if (soort === 'zin'){ var z = zin(b.id); if (!z) return; tekst = z.t[t]; sp += z.sp; }
      else if (soort === 'aanbod'){ var ab = aanbod(b.id); if (!ab) return; tekst = ab.t; sp -= 2; }
      else if (soort === 'vrij'){ tekst = String(b.tekst || '').slice(0, 140); if (!tekst) return; }
      else return;
      uit.berichten.push({ van:t, soort:soort, id:b.id || null, tekst:tekst });
    });
    /* 5. wat de dag zelf doet */
    sp += dag.sp;
    if (dag.bouw && st.raketten > 0 && st.raketten < 3 && !eindAkkoord){ st.raketten = Math.min(3, st.raketten + dag.bouw); uit.regels.push('Op Cuba zijn de bouwploegen verder gekomen.'); }
    if (st.raketten === 3) sp += 2;
    st.spanning = klem(st.spanning + sp, 0, 100);
    uit.delta = st.spanning - uit.sp0;
    /* 5b. de open aanbiedingen voor de volgende ronde */
    st.open = { vs:null, ussr:null };
    ['vs', 'ussr'].forEach(function(t){
      var b = k[t].bericht;
      if (b && b.soort === 'aanbod' && !(uit.akkoord && uit.akkoord.door === 'samen' && uit.akkoord.id === b.id)) st.open[t] = b.id;
    });
    /* 6. afgelopen? */
    if (st.spanning >= 100){ st.oorlog = true; st.klaar = true; st.uitkomst = 'oorlog'; }
    else if (st.invasie){ st.klaar = true; st.uitkomst = 'invasie'; }
    else if (eindAkkoord){ st.klaar = true; st.uitkomst = 'akkoord'; }
    else if (st.raketten === 0){ st.klaar = true; st.uitkomst = 'terug'; }
    else if (r + 1 >= DAGEN.length){ st.klaar = true; st.uitkomst = 'geen'; }
    if (st.klaar) st.open = { vs:null, ussr:null };
    uit.spanning = st.spanning; uit.defcon = defcon(st.spanning); uit.klaar = st.klaar; uit.uitkomst = st.uitkomst;
    st.geschiedenis.push({ r:r, zet:uit.zet, delta:uit.delta, spanning:st.spanning, akkoord:uit.akkoord ? uit.akkoord.id : null,
      berichten:uit.berichten.map(function(b){ return { van:b.van, soort:b.soort, id:b.id }; }) });
    if (!st.klaar) st.r = r + 1;
    return uit;
  }

  /* ---------- de afloop ---------- */
  var UITKOMST = {
    oorlog:{ kop:'Kernoorlog', tekst:'De spanning liep op tot er niets meer te beslissen viel. Niemand haalt zijn doelen: in een kernoorlog wint niemand. In het echt is dit niet gebeurd, maar het scheelde weinig. Op zwarte zaterdag hield één Russische officier op een onderzeeboot een kerntorpedo tegen.' },
    invasie:{ kop:'Oorlog op Cuba', tekst:'De Amerikanen vielen Cuba binnen. De raketten zijn weg, maar er wordt gevochten tussen Amerikaanse en Russische soldaten. In het echt wist Kennedy niet dat er kleine kernwapens op Cuba lagen. Een invasie had bijna zeker een kernoorlog betekend.' },
    akkoord:{ kop:'Een afspraak', tekst:'Er is een afspraak, en de raketten gaan weg van Cuba. Zo liep het op 28 oktober 1962 ook af: Radio Moskou las voor dat de raketten werden afgebroken.' },
    terug:{ kop:'De raketten gaan weg', tekst:'De Sovjet-Unie haalt de raketten weg van Cuba, zonder afspraak. De crisis is voorbij, maar wat kreeg Moskou ervoor terug?' },
    geen:{ kop:'Geen oplossing', tekst:'Zondagavond staan de raketten er nog. Maandag willen de Amerikaanse generaals aanvallen. Een crisis die blijft hangen, is geen oplossing: elk misverstand kan de volgende ochtend alsnog een oorlog worden.' }
  };
  function uitkomstTekst(st){
    var u = UITKOMST[st.uitkomst] || UITKOMST.geen, tekst = u.tekst;
    if (st.uitkomst === 'akkoord'){
      if (st.turkijeGeheim) tekst += ' En net als in het echt verdwenen de Amerikaanse raketten een paar maanden later stil uit Turkije.';
      else if (st.turkijeOpenlijk) tekst += ' Maar anders dan in het echt was de ruil met Turkije openlijk. Dat hadden de NAVO-bondgenoten Kennedy kwalijk genomen.';
      else tekst += ' Alleen ontbreekt hier de geheime ruil met Turkije, die in het echt de doorslag gaf.';
    }
    return { kop:u.kop, tekst:tekst };
  }
  /* zo liep het echt */
  var ECHT = [
    { d:'16 oktober', t:'Kennedy ziet de foto’s. Zijn crisisgroep ExComm begint te vergaderen, een week lang in het geheim.' },
    { d:'22 oktober', t:'Kennedy op televisie: een zeeblokkade (‘quarantaine’) rond Cuba. De strijdkrachten gaan naar DEFCON 3.' },
    { d:'24 oktober', t:'De blokkade gaat in. Schepen met raketten keren om. De bommenwerpers staan op DEFCON 2.' },
    { d:'25 oktober', t:'Ambassadeur Stevenson laat in de VN de foto’s zien. De Russen ontkennen.' },
    { d:'26 oktober', t:'Eerste brief van Chroesjtsjov: de raketten weg, als Amerika belooft Cuba niet binnen te vallen.' },
    { d:'27 oktober', t:'Zwarte zaterdag. Een tweede brief eist ook Turkije. Boven Cuba wordt een U-2 neergeschoten; een onderzeeboot met een kerntorpedo wordt bestookt. ’s Avonds spreken Robert Kennedy en Dobrynin in het geheim af: Turkije later, als niemand het weet.' },
    { d:'28 oktober', t:'Radio Moskou: de raketten gaan weg. In april 1963 verdwijnen de Jupiters uit Turkije. In 1963 komt er een directe telefoonlijn tussen Washington en Moskou: de hotline.' }
  ];
  var VRAGEN = [
    { t:'Welk team haalde zijn geheime doelen? Wist het andere team wat jullie wilden, en had dat iets veranderd?' },
    { t:'Waarom hielp het dat een deel van de afspraak geheim bleef? Wie had daar het meeste aan?' },
    { t:'Wie deed de eerste stap terug? Voelde dat als verliezen?' },
    { t:'Waar kwam de spanning vooral vandaan: van jullie keuzes, of van dingen die niemand wilde, zoals een verdwaald vliegtuig of een onderzeeboot zonder contact?' },
    { t:'Afschrikking: waarom begon niemand een kernoorlog, en waarom was het toch zo gevaarlijk?', vwo:true },
    { t:'Een jaar later kwam er een hotline tussen Washington en Moskou. Waarom juist toen? Hoe verliep het contact in 1962?', vwo:true }
  ];

  /* ---------- het bord speelt een team zonder apparaten ----------
     Speelt het ongeveer zoals het in 1962 ging, maar laat zich niet
     afpersen: bij hoge spanning zoekt het een uitweg. */
  function bordKiest(st, team){
    var l = opties(st, team), r = st.r, sp = st.spanning, o = st.open[ander(team)];
    function eerst(w){ for (var i = 0; i < w.length; i++) if (l.indexOf(w[i]) >= 0) return w[i]; return 'wachten'; }
    var k = { zet:'wachten', bericht:null, antwoord:null };
    if (o) k.antwoord = (o === 'openlijk' && team === 'vs' && sp < 80) ? 'nee' : 'ja';
    if (team === 'vs'){
      k.zet = sp >= 70 ? eerst(['wachten']) : [eerst(['verkenning']), eerst(['blokkade', 'vn']), eerst(['handhaven', 'vn']), eerst(['vn', 'wachten']), 'wachten', eerst(['alarm', 'wachten']), 'wachten'][r] || 'wachten';
      if (r >= 4 || sp >= 60) k.bericht = { soort:'aanbod', id:r >= 5 ? 'geheim' : 'kern' };
      else if (sp >= 40) k.bericht = { soort:'zin', id:'praten' };
    } else {
      k.zet = sp >= 75 ? eerst(['omkeren', 'wachten']) : [eerst(['bouwen', 'wachten']), eerst(['verschepen', 'doorvaren', 'bouwen']), eerst(['omkeren', 'wachten']), eerst(['ontkennen']), 'wachten', eerst(['wachten']), 'wachten'][r] || 'wachten';
      if (r >= 4 || sp >= 60) k.bericht = { soort:'aanbod', id:r >= 5 ? 'geheim' : 'kern' };
      else if (sp >= 40) k.bericht = { soort:'zin', id:'uitweg' };
    }
    return k;
  }

  var CRISIS = { TEAMS:TEAMS, DAGEN:DAGEN, ZETTEN:ZETTEN, COMBOS:COMBOS, ZINNEN:ZINNEN, AANBOD:AANBOD, DOELEN:DOELEN, INTEL:INTEL,
    ECHT:ECHT, ECHT_DOELEN:ECHT_DOELEN, ECHT_UITLEG:ECHT_UITLEG, VRAGEN:VRAGEN, UITKOMST:UITKOMST, DEFCON_TEKST:DEFCON_TEKST,
    ander:ander, zet:zet, zin:zin, aanbod:aanbod, aanbodMag:aanbodMag, kan:kan, opties:opties, nieuw:nieuw, los:los, defcon:defcon,
    doelen:doelen, doelNu:doelNu, punten:punten, intelNu:intelNu, uitkomstTekst:uitkomstTekst, bordKiest:bordKiest };
  root.CRISIS = CRISIS;
  if (typeof module !== 'undefined' && module.exports) module.exports = CRISIS;
})(typeof window !== 'undefined' ? window : this);
