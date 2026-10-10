/* De leerroute Nederlands, taal: klank en betekenis, woorden bouwen, taal om je heen
   (streektaal, jongerentaal, vaktaal, leenwoorden, taalverandering), hoe je overkomt,
   creatief met taal, en zakelijke genres en overtuigen. Elke strategie een eigen doel.
   Alle zinnen en teksten zijn voor deze leerroute geschreven. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';

  /* ---------- hulpjes ---------- */
  function q(w){ return '‘' + w + '’'; }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  /* een keuzestap: goed en de foute opties, gehusseld; x: { fout:{}, waarom } */
  function K(R, t, goed, fout, hint, x){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    (fout || []).forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var o = R.hussel(lijst), s = { tekst:t, opties:o, goed:o.indexOf(goed), hint:hint };
    if (x){
      if (x.waarom) s.waarom = x.waarom;
      if (x.fout){ s.fout = {}; for (var k in x.fout) s.fout[k.toLowerCase()] = x.fout[k]; }
    }
    return s;
  }
  /* een keuzestap met vaste volgorde (ja/nee) */
  function V(t, opties, goed, hint){ return { tekst:t, opties:opties.slice(), goed:goed, hint:hint }; }
  /* de opgave: is de laatste stap een keuze, dan is dat ook de vraag bij Zelf */
  function OP(o){ var l = o.stappen[o.stappen.length - 1]; if (l.opties){ o.opties = l.opties; o.goed = l.goed; } return o; }
  /* n dingen uit een lijst, niet die in 'niet' */
  function ander(R, lijst, niet, n){
    niet = [].concat(niet); var uit = [];
    R.hussel(lijst).forEach(function(x){ if (uit.length < n && niet.indexOf(x) < 0 && uit.indexOf(x) < 0) uit.push(x); });
    return uit;
  }
  /* een leestekst in een kader */
  function blok(delen){ return '<div class="lr-tekst">' + [].concat(delen).map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>'; }
  /* een zin met ___, het gat ingevuld en gekleurd (leesteken erna blijft aan het woord vast) */
  function vulZin(R, zin, w, label){
    var p = zin.split('___'), voor = p[0].replace(/\s+$/, ''), m = /^([.,!?;:]*)\s*([\s\S]*)$/.exec(p[1] || ''), d = [];
    if (voor) d.push(voor);
    d.push({ t:w + m[1], k:1, label:label });
    if (m[2]) d.push(m[2]);
    return R.teken.zin(d);
  }
  function vulIn(zin, w){ return zin.replace('___', w); }
  var NAMEN = ['Noor', 'Sem', 'Lisa', 'Daan', 'Yara', 'Ahmed', 'Mila', 'Jesse', 'Sara', 'Ravi', 'Lotte', 'Tim'];

  /* ================= KLANK EN BETEKENIS ================= */

  /* klanknabootsing: [zin, goed, hoe het klinkt, soort geluid, [foute woorden]] */
  var KLANK = [
    ['De bij ___ om mijn hoofd.', 'zoemt', 'een laag, trillend geluid dat maar doorgaat', 'laag', ['knalt', 'tjilpt']],
    ['Het vuur ___ in de open haard.', 'knettert', 'korte, droge knalletjes', 'klap', ['piept', 'klotst']],
    ['De slang ___ naar de muis.', 'sist', 'een scherp ssss-geluid', 'droog', ['blaft', 'rommelt']],
    ['De oude deur ___ als je hem opendoet.', 'kraakt', 'een droog, schurend geluid', 'droog', ['tjilpt', 'plonst']],
    ['Een muis ___ in de hoek van de schuur.', 'piept', 'een heel hoog, kort geluidje', 'hoog', ['dendert', 'loeit']],
    ['In de verte ___ het onweer.', 'rommelt', 'een laag, dof geluid dat lang doorgaat', 'laag', ['piept', 'tjilpt']],
    ['Het water ___ in de emmer als je loopt.', 'klotst', 'water dat heen en weer gaat en tegen de rand slaat', 'water', ['knettert', 'blaft']],
    ['De fietsbel ___ als ik erop druk.', 'rinkelt', 'een helder, hoog belgeluid', 'hoog', ['sist', 'loeit']],
    ['De ballon ___ met een harde klap.', 'knalt', 'één harde, korte klap', 'klap', ['zoemt', 'ritselt']],
    ['De mus ___ vrolijk in de boom.', 'tjilpt', 'een kort, hoog vogelgeluidje', 'hoog', ['knort', 'dendert']],
    ['De soep ___ zachtjes in de pan.', 'pruttelt', 'een zacht, borrelend geluid', 'water', ['knalt', 'blaft']],
    ['De regen ___ tegen het raam.', 'klettert', 'veel harde tikken vlak achter elkaar', 'klap', ['zoemt', 'loeit']],
    ['De hond ___ naar de postbode.', 'blaft', 'een kort, hard geluid van een hond', 'dier', ['sist', 'tjilpt']],
    ['De koe ___ in de wei.', 'loeit', 'een lang, laag boe-geluid', 'laag', ['piept', 'knettert']],
    ['De steen ___ in het water.', 'plonst', 'het geluid van iets wat in het water valt', 'water', ['rinkelt', 'sist']],
    ['Mijn maag ___ van de honger.', 'knort', 'een laag, brommend geluid in je buik', 'laag', ['tjilpt', 'rinkelt']],
    ['De droge bladeren ___ onder mijn voeten.', 'ritselen', 'een zacht, droog geschuifel', 'droog', ['blaffen', 'loeien']],
    ['De klok ___ aan de muur.', 'tikt', 'korte, zachte tikjes, steeds in hetzelfde ritme', 'klap', ['loeit', 'plonst']],
    ['De zware vrachtwagen ___ over de brug.', 'dendert', 'een zwaar, trillend lawaai', 'laag', ['piept', 'tjilpt']]
  ];
  function maakKlank(R){
    var x = R.kies(KLANK);
    var andere = ander(R, KLANK.filter(function(y){ return y[3] !== x[3]; }).map(function(y){ return y[2]; }), [], 2);
    return OP({ vraag:x[0], context:'Kies het woord dat klinkt als het geluid.',
      beeld:function(n){ return n >= 2 ? vulZin(R, x[0], x[1], 'klinkt zoals het geluid') : ''; },
      stappen:[
        K(R, 'Wat voor geluid hoor je hier?', x[2], andere, 'Stel je de zin voor alsof je erbij bent. Is het geluid hoog of laag, kort of lang, hard of zacht?'),
        K(R, 'Welk woord klinkt zelf als dat geluid?', x[1], x[4], 'Zeg de woorden hardop. Welk woord klinkt als ' + x[2] + '?') ] });
  }

  /* homofonen: [woord, betekenis, zin, woord, betekenis, zin, ezelsbruggetje] */
  var HOMO = [
    ['hart', 'het orgaan dat je bloed rondpompt', 'Mijn ___ klopt snel na het rennen.', 'hard', 'snel of met veel kracht', 'Hij rende heel ___ naar de bus.', 'Verleng het woord: harder hoor je met een d, harten met een t.'],
    ['lijden', 'pijn of verdriet hebben', 'De dieren ___ onder de hitte.', 'leiden', 'de weg wijzen of de baas zijn', 'De gids gaat ons door het museum ___.', 'Een leider leidt, met ei. Wie pijn heeft, lijdt, met ij.'],
    ['rijst', 'korrels die je kookt en eet', 'We eten vanavond ___ met kip.', 'reist', 'gaat op reis', 'Mijn tante ___ graag door Azië.', 'Reist is een werkwoord: hij reist, van reizen. Rijst is iets wat je eet.'],
    ['ijs', 'bevroren water, of een ijsje', 'Ik wil een ___ met aardbeiensmaak.', 'eis', 'iets wat je beslist wilt hebben', 'De spelers hadden één ___: meer trainingen.', 'Eis hoort bij eisen. IJs eet je of je schaatst erop.'],
    ['steil', 'met een hoge, schuine helling', 'Die trap naar de zolder is erg ___.', 'stijl', 'een eigen manier van doen of eruitzien', 'Zij heeft een heel eigen ___ van kleden.', 'Stijl hoort bij stijlvol. Steil zeg je van een helling of trap.'],
    ['hout', 'het materiaal van bomen', 'De tafel is van ___ gemaakt.', 'houd', 'vind fijn (ik ... van)', 'Ik ___ veel van pannenkoeken.', 'Houd is een werkwoord: ik houd, van houden. Hout komt van een boom.'],
    ['bot', 'een been in je lichaam', 'Hij heeft een ___ in zijn arm gebroken.', 'bod', 'het bedrag dat je wilt betalen', 'Mijn ouders hebben een ___ gedaan op het huis.', 'Verleng het woord: botten met een t. Bod hoort bij bieden, met een d.'],
    ['laat', 'niet op tijd', 'Je bent al tien minuten te ___.', 'laad', 'vul met stroom (ik ... op)', 'Ik ___ mijn telefoon elke nacht op.', 'Laad hoort bij laden: ik laad op. Laat hoort bij te laat komen.'],
    ['nood', 'een gevaarlijke of moeilijke situatie', 'In ___ bel je 112.', 'noot', 'een vrucht met een harde dop', 'De eekhoorn verstopt een ___ in de grond.', 'Verleng het woord: noten, met een t. Nood hoort bij noodgeval.'],
    ['kou', 'lage temperatuur', 'Doe een sjaal om tegen de ___.', 'kauw', 'maal fijn met je tanden', 'Ik ___ altijd kauwgom op de fiets.', 'Kauw hoort bij kauwen en kauwgom. Kou hoort bij koud.'],
    ['rauw', 'niet gekookt of gebakken', 'Sushi wordt vaak gemaakt met ___ vis.', 'rouw', 'verdriet om iemand die is overleden', 'De familie is in de ___ om opa.', 'Rouw hoort bij rouwen en rouwkaart. Rauw zeg je van eten dat niet gaar is.'],
    ['lach', 'maak een vrolijk geluid', 'Ik ___ altijd om die grap.', 'lag', 'rustte plat (verleden tijd van liggen)', 'De kat ___ de hele middag in de zon.', 'Lach hoort bij lachen. Lag hoort bij liggen: wij lagen, met een g.'],
    ['licht', 'iets wat schijnt, zodat je kunt zien', 'Doe het ___ eens aan, het is donker.', 'ligt', 'rust plat op iets', 'Mijn boek ___ op tafel.', 'Ligt is een werkwoord: lig + t, van liggen. Licht is het tegenovergestelde van donker.'],
    ['wei', 'een grasveld voor koeien', 'De koeien staan in de ___.', 'wij', 'ik en anderen', 'Morgen gaan ___ naar de film.', 'Wij gebruik je voor ik en anderen. Wei hoort bij weiland.'],
    ['meiden', 'meisjes', 'De ___ spelen samen voetbal.', 'mijden', 'ergens uit de buurt blijven', 'Hij probeert drukke plekken te ___.', 'Mijden is een werkwoord, net als vermijden. Meiden zijn meisjes.'],
    ['raad', 'een tip of advies', 'Kun jij mij wat ___ geven?', 'raat', 'het bouwsel van bijen met honing', 'De bijen maken honing in de ___.', 'Raad hoort bij raden en raadgever. Raat hoort bij honingraat.'],
    ['pijl', 'een teken dat de richting wijst', 'Volg de ___ naar de uitgang.', 'peil', 'hoogte of niveau', 'Het water staat op een hoog ___.', 'Pijl hoort bij pijl en boog. Peil hoort bij waterpeil en peilen.'],
    ['rijzen', 'omhoog komen, groter worden', 'Het deeg moet een uur ___.', 'reizen', 'op reis gaan', 'In de zomer gaan we door Frankrijk ___.', 'Reizen hoort bij reis en reiziger. Rijzen zegt wat deeg doet: omhoog komen.'],
    ['hei', 'een open veld met heide', 'Op de ___ grazen schapen.', 'hij', 'die jongen of man', 'Tom is er niet, want ___ is ziek.', 'Hij gebruik je voor een jongen of man. Hei hoort bij heide.'],
    ['wet', 'een regel van de overheid', 'Volgens de ___ moet je op een brommer een helm dragen.', 'wed', 'zeg dat je het bijna zeker weet (van wedden)', 'Ik ___ dat het morgen gaat regenen.', 'Wed hoort bij wedden: ik wed. Wet hoort bij wetten en regels.']
  ];
  function maakHomo(R){
    var p = R.kies(HOMO), i = R.heel(0, 1);
    var w = i ? p[3] : p[0], b = i ? p[4] : p[1], z = i ? p[5] : p[2], w2 = i ? p[0] : p[3], b2 = i ? p[1] : p[4];
    return OP({ vraag:z, context:'De woorden ' + q(p[0]) + ' en ' + q(p[3]) + ' klinken precies hetzelfde. Welk woord hoort in de zin?',
      beeld:function(n){ return n >= 2 ? vulZin(R, z, w, b) : ''; },
      stappen:[
        K(R, 'Welke betekenis past in deze zin?', b, [b2], 'Lees de woorden om het gat heen en stel je voor wat er gebeurt.'),
        K(R, 'Hoe schrijf je het woord met die betekenis?', w, [w2], p[6]) ] });
  }

  /* intonatie: dezelfde woorden als mededeling, vraag of uitroep */
  var INTO = ['Je hebt de hele taart opgegeten', 'Het is al tien uur', 'Jij hebt gewonnen', 'De les gaat niet door', 'Je hebt een nieuwe telefoon',
    'Hij komt morgen niet', 'Ze is vandaag jarig', 'We hebben morgen vrij', 'Je hebt je huiswerk al af', 'Het regent alweer', 'De bus is al weg',
    'Die jas kost twintig euro', 'Je hebt een slang als huisdier', 'Lisa gaat verhuizen', 'Je broer zit bij mij in de klas', 'Het is morgen al vakantie'];
  var INTOSIT = { med:'Ze weet het zeker en vertelt het gewoon.', vraag:'Ze weet het niet zeker en wil dat de ander zegt of het klopt.', uitroep:'Ze hoort het net en kan het bijna niet geloven.' };
  var INTODOEL = { med:'iets vertellen', vraag:'iets vragen', uitroep:'laten horen dat ze verbaasd is' };
  var INTOSTEM = { med:'de stem gaat aan het eind omlaag', vraag:'de stem gaat aan het eind omhoog', uitroep:'de stem gaat hoog en krijgt veel nadruk' };
  var INTOTEKEN = { med:'. (punt)', vraag:'? (vraagteken)', uitroep:'! (uitroepteken)' };
  function waarden(o, niet){ return Object.keys(o).filter(function(k){ return k !== niet; }).map(function(k){ return o[k]; }); }
  function maakInto(R){
    var zin = R.kies(INTO), s = R.kies(['med', 'vraag', 'uitroep']), naam = R.kies(['Noor', 'Lisa', 'Yara', 'Mila', 'Sara', 'Lotte', 'Fleur', 'Eva']);
    return OP({ vraag:zin + ' ___', context:naam + ' zegt deze zin. ' + INTOSIT[s],
      beeld:function(n){ return n >= 3 ? R.teken.zin([{ t:zin, k:s === 'med' ? 1 : s === 'vraag' ? 2 : 3, label:INTOSTEM[s].replace('de stem ', '') }, { t:INTOTEKEN[s].charAt(0), k:5 }]) : ''; },
      stappen:[
        K(R, 'Wat wil ' + naam + ' met deze zin?', INTODOEL[s], waarden(INTODOEL, s), 'Lees wat er over ' + naam + ' staat. Weet ze het zeker, twijfelt ze, of is ze verrast?'),
        K(R, 'Welk leesteken zet je aan het eind?', INTOTEKEN[s], waarden(INTOTEKEN, s), 'Iets vertellen: een punt. Iets vragen: een vraagteken. Verbazing: een uitroepteken.'),
        K(R, 'Hoe klinkt de stem aan het eind?', INTOSTEM[s], waarden(INTOSTEM, s), 'Zeg de zin hardop zoals ' + naam + ' hem bedoelt. Bij een vraag gaat je stem aan het eind omhoog, bij een mededeling omlaag.') ] });
  }

  /* nadruk: [zin, [[woord, vervolg, tegenover, soort], ...]] */
  var NADRUK = [
    ['Ik heb dat niet gezegd', [['Ik', 'maar Tom wel', 'Tom', 'wie'], ['dat', 'ik zei iets anders', 'iets anders', 'wat'], ['gezegd', 'ik heb het alleen gedacht', 'gedacht', 'doen']]],
    ['Ik wil een rode fiets', [['Ik', 'mijn broer niet', 'mijn broer', 'wie'], ['rode', 'geen blauwe', 'blauwe', 'hoe'], ['fiets', 'geen rode scooter', 'scooter', 'wat']]],
    ['Mijn zus heeft de taart gebakken', [['Mijn', 'niet jouw zus', 'jouw', 'van'], ['zus', 'niet mijn broer', 'broer', 'wie'], ['taart', 'niet de koekjes', 'koekjes', 'wat'], ['gebakken', 'ze heeft hem niet gekocht', 'gekocht', 'doen']]],
    ['Wij gaan morgen naar het strand', [['Wij', 'jullie niet', 'jullie', 'wie'], ['morgen', 'niet vandaag', 'vandaag', 'wanneer'], ['strand', 'niet naar het bos', 'bos', 'waar']]],
    ['Ik heb jouw boek gelezen', [['Ik', 'niet mijn moeder', 'mijn moeder', 'wie'], ['jouw', 'niet dat van Sem', 'dat van Sem', 'van'], ['boek', 'niet je verslag', 'verslag', 'wat']]],
    ['Tim heeft de ruit gebroken', [['Tim', 'niet ik', 'ik', 'wie'], ['ruit', 'niet de lamp', 'lamp', 'wat'], ['gebroken', 'hij heeft hem niet alleen bekrast', 'bekrast', 'doen']]],
    ['Ze komt vanavond eten', [['Ze', 'haar broer niet', 'haar broer', 'wie'], ['vanavond', 'niet morgen', 'morgen', 'wanneer'], ['eten', 'niet alleen koffie drinken', 'koffie drinken', 'doen']]],
    ['Ik vind die film saai', [['Ik', 'maar jij misschien niet', 'jij', 'wie'], ['film', 'het boek niet', 'boek', 'wat'], ['saai', 'niet eng', 'eng', 'hoe']]],
    ['Hij heeft twee katten', [['Hij', 'zij niet', 'zij', 'wie'], ['twee', 'niet drie', 'drie', 'hoeveel'], ['katten', 'geen honden', 'honden', 'wat']]],
    ['De bus vertrekt om acht uur', [['bus', 'niet de trein', 'trein', 'wat'], ['acht', 'niet om negen uur', 'negen', 'wanneer'], ['vertrekt', 'hij komt dan niet aan', 'aankomen', 'doen']]],
    ['Lotte zingt in een band', [['Lotte', 'niet Femke', 'Femke', 'wie'], ['zingt', 'ze speelt geen gitaar', 'gitaar spelen', 'doen'], ['band', 'niet in een koor', 'koor', 'waar']]],
    ['Mijn opa woont in Utrecht', [['Mijn', 'niet jouw opa', 'jouw', 'van'], ['woont', 'hij werkt er niet', 'werken', 'doen'], ['Utrecht', 'niet in Amersfoort', 'Amersfoort', 'waar']]],
    ['Sara heeft gisteren gebeld', [['Sara', 'niet Noor', 'Noor', 'wie'], ['gisteren', 'niet vandaag', 'vandaag', 'wanneer'], ['gebeld', 'ze heeft niet geappt', 'geappt', 'doen']]],
    ['Wij hebben op dinsdag gym', [['Wij', 'jullie niet', 'jullie', 'wie'], ['dinsdag', 'niet op maandag', 'maandag', 'wanneer'], ['gym', 'geen tekenen', 'tekenen', 'wat']]],
    ['Ik eet geen vlees', [['Ik', 'maar mijn broer wel', 'mijn broer', 'wie'], ['eet', 'maar ik kook het wel voor mijn broer', 'koken', 'doen'], ['vlees', 'wel vis', 'vis', 'wat']]],
    ['Hij fietst naar school', [['Hij', 'zijn zus niet', 'zijn zus', 'wie'], ['fietst', 'hij loopt niet', 'lopen', 'doen'], ['school', 'niet naar de sportclub', 'sportclub', 'waar']]]
  ];
  var NADRUKSOORT = { wie:'om wie het is', wat:'om welk ding het gaat', doen:'om wat er gedaan wordt', wanneer:'om wanneer het is', waar:'om waar het is',
    hoeveel:'om hoeveel het er zijn', hoe:'om hoe iets is', van:'om van wie het is' };
  var NAAMWOORD = ['Tim', 'Lotte', 'Sara', 'Utrecht'];
  function klein(w, zin){ return zin.indexOf(w) === 0 && NAAMWOORD.indexOf(w) < 0 ? w.toLowerCase() : w; }
  function maakNadruk(R){
    var x = R.kies(NADRUK), zin = x[0], e = R.kies(x[1]), woorden = zin.split(' ');
    var met = x[1].map(function(y){ return y[0]; });
    if (R.heel(0, 1)){
      /* het vervolg staat er: welk woord krijgt de nadruk? */
      var los = woorden.filter(function(w){ return met.indexOf(w) < 0; });
      var foutW = ander(R, met, [e[0]], 2); if (foutW.length < 2) foutW = foutW.concat(ander(R, los, foutW, 2 - foutW.length));
      return OP({ vraag:zin + ', ' + e[1] + '.', context:'Lees de zin hardop. Op welk woord leg je de nadruk?',
        beeld:function(n){ return n >= 2 ? R.teken.zin(woorden.map(function(w, k){ var t = k === woorden.length - 1 ? ',' : ''; return w === e[0] ? { t:w.toUpperCase() + t, k:1, label:'nadruk' } : w + t; }).concat([e[1] + '.'])) : ''; },
        stappen:[
          K(R, 'Wat zet de spreker tegenover elkaar?', klein(e[0], zin) + ' en ' + e[2], x[1].filter(function(y){ return y !== e; }).map(function(y){ return klein(y[0], zin) + ' en ' + y[2]; }).concat(ander(R, ['de zin en het vervolg', 'het begin en het eind'], [], 1)),
            'Kijk wat er in het tweede deel nieuw is: ' + q(e[1]) + '. Met welk woord uit het eerste deel heeft dat te maken?'),
          K(R, 'Op welk woord leg je dus de nadruk?', e[0], foutW, 'Het woord dat je tegenover iets anders zet, krijgt de nadruk. Hier is dat ' + q(e[2]) + ' tegenover een woord uit de zin.') ] });
    }
    /* de nadruk staat er: wat bedoelt de spreker? */
    var vraagZin = woorden.map(function(w){ return w === e[0] ? w.toUpperCase() : w; }).join(' ') + '.';
    var andere = x[1].filter(function(y){ return y !== e; });
    var foutV = andere.map(function(y){ return y[1]; });
    return OP({ vraag:vraagZin, vraagHtml:woorden.map(function(w){ return w === e[0] ? '<b style="color:var(--lr-1)">' + R.schoon(w.toUpperCase()) + '</b>' : R.schoon(w); }).join(' ') + '.',
      context:'Het woord in hoofdletters krijgt de nadruk. Wat bedoelt de spreker?',
      stappen:[
        K(R, 'Waar gaat het de spreker om?', NADRUKSOORT[e[3]], ander(R, waarden(NADRUKSOORT, e[3]).filter(function(v){ return andere.every(function(y){ return NADRUKSOORT[y[3]] !== v; }); }), [], 1).concat(andere.filter(function(y){ return y[3] !== e[3]; }).map(function(y){ return NADRUKSOORT[y[3]]; })),
          'Het woord met nadruk zet je tegenover iets anders. Waar staat ' + q(e[0].toUpperCase()) + ' voor: een persoon, een ding, een tijd, een plek of een handeling?'),
        K(R, 'Hoe gaat de zin dus verder?', e[1], foutV, 'Het vervolg moet iets tegenover ' + q(e[0]) + ' zetten.') ] });
  }

  /* klemtoon: woorden die met een andere klemtoon iets anders betekenen */
  var KLEM = [
    { lg:['voor', 'ko', 'men'], a:[0, 'VOORkomen', 'gebeuren of te vinden zijn', ['Zo’n fout kan bij iedereen voorkomen.', 'Dat woord kan in elke tekst voorkomen.']],
      b:[1, 'voorKOmen', 'zorgen dat iets niet gebeurt', ['Met een helm kun je hoofdletsel voorkomen.', 'Door goed op te letten kun je ongelukken voorkomen.']] },
    { lg:['o', 'ver', 'ko', 'men'], a:[0, 'OVERkomen', 'een bepaalde indruk maken', ['Hij wil in het gesprek rustig en vriendelijk overkomen.', 'Met die harde stem kun je boos overkomen.']],
      b:[2, 'overKOmen', 'met iemand gebeuren', ['Zoiets vervelends kan iedereen overkomen.', 'Ik hoop dat jou nooit zo’n ongeluk zal overkomen.']] },
    { lg:['door', 'lo', 'pen'], a:[0, 'DOORlopen', 'verder lopen zonder te stoppen', ['We moeten flink doorlopen, anders missen we de trein.', 'De agent zei dat we moesten doorlopen.']],
      b:[1, 'doorLOpen', 'van begin tot eind afmaken of afgaan', ['Zij heeft de havo in vijf jaar doorlopen.', 'Je moet eerst alle stappen van het plan doorlopen.']] },
    { lg:['on', 'der', 'gaan'], a:[0, 'ONdergaan', 'zakken achter de horizon of zinken', ['Vanavond om negen uur zal de zon ondergaan.', 'We bleven op het strand tot de zon zou ondergaan.']],
      b:[2, 'onderGAAN', 'iets meemaken wat met je gebeurt', ['Mijn oma moet volgende week een operatie ondergaan.', 'Hij moest de straf rustig ondergaan.']] },
    { lg:['door', 'bre', 'ken'], a:[0, 'DOORbreken', 'tevoorschijn komen, of in stukken breken', ['Na de regen zal de zon snel doorbreken.', 'Pas op, die dunne plank kan doorbreken.']],
      b:[1, 'doorBREken', 'iets stoppen wat steeds zo ging', ['Het is moeilijk om een slechte gewoonte te doorbreken.', 'De leraar wilde de stilte in de klas doorbreken.']] },
    { lg:['o', 'ver', 'trek', 'ken'], a:[0, 'OVERtrekken', 'natekenen door dun papier heen', ['Je kunt de kaart op dun papier overtrekken.', 'Voor biologie moest ik een tekening van een blad overtrekken.']],
      b:[2, 'overTREKken', 'groter of erger maken dan het is', ['Je moet dat kleine probleem niet zo overtrekken.', 'Laten we dat ene foutje niet overtrekken.']] },
    { lg:['o', 'ver', 'drij', 'ven'], a:[0, 'OVERdrijven', 'voorbijtrekken, zoals een bui', ['Wacht even met fietsen, de bui zal zo overdrijven.', 'Het onweer zal over een uur wel overdrijven.']],
      b:[2, 'overDRIJven', 'iets groter of erger maken dan het is', ['Je moet niet zo overdrijven, het is maar een schrammetje.', 'Mijn broer heeft de neiging om alles te overdrijven.']] },
    { lg:['o', 'ver', 'leg', 'gen'], a:[0, 'OVERleggen', 'samen praten om iets te beslissen', ['We moeten even overleggen wie wat gaat doen.', 'Ik wil eerst met mijn ouders overleggen.']],
      b:[2, 'overLEGgen', 'laten zien als bewijs', ['Bij de balie moet je je paspoort overleggen.', 'Bij ziekte moet je een briefje van de dokter overleggen.']] },
    { lg:['om', 'va', 'ren'], a:[0, 'OMvaren', 'een omweg varen', ['Doordat de brug dicht was, moesten we een heel stuk omvaren.', 'Bij laag water moet de boot omvaren.']],
      b:[1, 'omVAren', 'helemaal rond iets varen', ['Zij wil in haar eentje de wereld omvaren.', 'De zeiler hoopt de hele aarde te omvaren.']] }
  ];
  function maakKlem(R){
    var x = R.kies(KLEM), i = R.heel(0, 1), e = i ? x.b : x.a, o = i ? x.a : x.b, zin = R.kies(e[3]), woord = x.lg.join('');
    var re = new RegExp('(' + woord + ')');
    var html = R.schoon(zin).replace(re, '<mark>$1</mark>'), kl = R.hussel([e[1], o[1]]);
    return OP({ vraag:zin, vraagHtml:html, context:'Het woord ' + q(woord) + ' heeft twee betekenissen. De klemtoon zegt welke.',
      beeld:function(n){ return n >= 2 ? R.teken.woord(x.lg.map(function(l, k){ return k === e[0] ? { t:l.toUpperCase(), k:1, label:'klemtoon' } : { t:l, k:5 }; })) : ''; },
      stappen:[
        K(R, 'Wat betekent ' + q(woord) + ' in deze zin?', e[2], [o[2]], 'Lees de rest van de zin. Welke betekenis maakt er een logische zin van?'),
        V('Waar ligt dan de klemtoon?', kl, kl.indexOf(e[1]), 'Zeg de zin twee keer hardop: één keer met de nadruk vooraan en één keer verder naar achteren. Welke klinkt goed bij ' + q(e[2]) + '?') ] });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'taal-klank', niveau:'1F', domein:'woordenschat', naam:'Klank en betekenis', kd:['nl6A.a'],
        uit:'Hoe je iets zegt, verandert wat je bedoelt. Een woord kan klinken als het geluid dat het noemt, twee woorden kunnen hetzelfde klinken, en de klemtoon, de toon van je stem en de nadruk veranderen de betekenis.' },
      doelen:[
        { id:'taal-klank-nabootsing', naam:'Woorden die klinken als het geluid', kort:'Sommige woorden klinken zelf als het geluid dat ze noemen: zoemen, knallen, sissen',
          uit:'<p>Sommige woorden <b>klinken als het geluid</b> dat ze noemen. Dat heet <b>klanknabootsing</b>. Een bij <i>zoemt</i>, een ballon <i>knalt</i>, een slang <i>sist</i>.</p><p>Zo kies je het goede woord: stel je eerst het geluid voor. Is het hoog of laag, kort of lang? Zeg de woorden dan hardop en kies het woord dat net zo klinkt.</p>',
          wanneer:'je een geluid levendig wilt beschrijven in een verhaal.',
          maak:maakKlank },
        { id:'taal-klank-homofoon', naam:'Hetzelfde klinken, anders schrijven', kort:'Klinken twee woorden hetzelfde, kijk dan naar de betekenis om te weten hoe je schrijft',
          uit:'<p>Sommige woorden <b>klinken precies hetzelfde</b>, maar betekenen iets anders en schrijf je anders. Je hoort geen verschil tussen <i>hart</i> en <i>hard</i>, of tussen <i>lijden</i> en <i>leiden</i>.</p><p>Zo pak je het aan: bedenk eerst wat het woord in de zin <b>betekent</b>. Kies daarna de schrijfwijze die bij die betekenis hoort. Soms helpt het om het woord langer te maken: <i>harder</i> heeft een d, <i>harten</i> een t.</p>',
          wanneer:'je twijfelt tussen twee woorden die hetzelfde klinken.',
          maak:maakHomo },
        { id:'taal-klank-intonatie', naam:'Vraag, mededeling of verbazing', kort:'Dezelfde woorden worden een vraag, een mededeling of een uitroep door de toon van je stem',
          uit:'<p>Met precies dezelfde woorden kun je iets <b>vertellen</b>, iets <b>vragen</b> of laten horen dat je <b>verbaasd</b> bent. Het verschil zit in de <b>intonatie</b>: hoe je stem gaat.</p><p><i>Je hebt gewonnen.</i> Je stem gaat aan het eind omlaag: je vertelt het. <i>Je hebt gewonnen?</i> Je stem gaat aan het eind omhoog: je vraagt het. <i>Je hebt gewonnen!</i> Je stem gaat hoog, met veel nadruk: je bent verrast.</p><p>Op papier laat het leesteken zien welke toon je bedoelt.</p>',
          wanneer:'je een zin voorleest of zelf iets zegt en je wilt dat de ander begrijpt wat je bedoelt.',
          maak:maakInto },
        { id:'taal-klank-nadruk', naam:'Nadruk verandert wat je bedoelt', kort:'Het woord met nadruk zet je tegenover iets anders',
          uit:'<p>Leg je de <b>nadruk</b> op een ander woord, dan bedoel je iets anders. Het woord met nadruk zet je <b>tegenover iets anders</b>.</p><p><i>IK heb dat niet gezegd</i>: iemand anders wel. <i>Ik heb DAT niet gezegd</i>: ik zei iets anders. <i>Ik heb dat niet GEZEGD</i>: ik heb het misschien alleen gedacht.</p>',
          wanneer:'je voorleest, een presentatie geeft, of wilt begrijpen wat iemand precies bedoelt.',
          maak:maakNadruk },
        { id:'taal-klank-klemtoon', naam:'Klemtoon verandert de betekenis', kort:'Bij sommige woorden hoort bij elke klemtoon een andere betekenis: VOORkomen of voorKOmen',
          uit:'<p>De <b>klemtoon</b> is de lettergreep die je het hardst zegt. Bij sommige woorden verandert de betekenis als de klemtoon verschuift.</p><p><i>Zo’n fout kan VOORkomen</i>: dat kan gebeuren. <i>Een ongeluk voorKOmen</i>: zorgen dat het niet gebeurt.</p><p>Zo pak je het aan: kijk eerst wat het woord in de zin moet betekenen. Zeg de zin dan hardop met allebei de klemtonen en kies wat past.</p>',
          wanneer:'je een tekst voorleest en een woord tegenkomt met twee betekenissen.',
          maak:maakKlem }
      ] }
  ]);

  /* ================= WOORDEN BOUWEN ================= */

  /* samenstellingen: [woord, eerste deel, kern, goede uitleg, omgekeerde uitleg] */
  var KERN = [
    ['voetbalschoen', 'voetbal', 'schoen', 'een schoen om mee te voetballen', 'een voetbal in de vorm van een schoen'],
    ['melkchocolade', 'melk', 'chocolade', 'chocolade gemaakt met melk', 'melk met chocoladesmaak'],
    ['chocolademelk', 'chocolade', 'melk', 'melk met chocoladesmaak', 'chocolade gemaakt met melk'],
    ['zakgeld', 'zak', 'geld', 'geld dat je krijgt om zelf uit te geven', 'een zak om geld in te bewaren'],
    ['geldzak', 'geld', 'zak', 'een zak om geld in te bewaren', 'geld dat je krijgt om zelf uit te geven'],
    ['potplant', 'pot', 'plant', 'een plant die in een pot groeit', 'een pot om een plant in te zetten'],
    ['plantenpot', 'planten', 'pot', 'een pot om een plant in te zetten', 'een plant die in een pot groeit'],
    ['vogelkooi', 'vogel', 'kooi', 'een kooi voor een vogel', 'een vogel die in een kooi woont'],
    ['kooivogel', 'kooi', 'vogel', 'een vogel die in een kooi woont', 'een kooi voor een vogel'],
    ['bloemkool', 'bloem', 'kool', 'een kool met een kop die op een bloem lijkt', 'een bloem die naar kool ruikt'],
    ['ijsbeer', 'ijs', 'beer', 'een beer die op het ijs leeft', 'een ijsje in de vorm van een beer'],
    ['schoolplein', 'school', 'plein', 'het plein bij een school', 'een school die aan een plein staat'],
    ['zandkasteel', 'zand', 'kasteel', 'een kasteel van zand', 'zand dat bij een kasteel ligt'],
    ['tandenborstel', 'tanden', 'borstel', 'een borstel voor je tanden', 'tanden die op een borstel lijken'],
    ['appeltaart', 'appel', 'taart', 'een taart met appels', 'een appel met de smaak van taart'],
    ['boomhut', 'boom', 'hut', 'een hut in een boom', 'een boom in de vorm van een hut'],
    ['fietspad', 'fiets', 'pad', 'een pad voor fietsers', 'een fiets die je op een pad gebruikt'],
    ['zonnebril', 'zonne', 'bril', 'een bril tegen de zon', 'een zon in de vorm van een bril'],
    ['dierenarts', 'dieren', 'arts', 'een arts voor dieren', 'een dier dat voor arts speelt'],
    ['kinderboek', 'kinder', 'boek', 'een boek voor kinderen', 'een kind uit een boek'],
    ['speeltuin', 'speel', 'tuin', 'een tuin om in te spelen', 'een spel dat je in de tuin doet'],
    ['waterfles', 'water', 'fles', 'een fles voor water', 'water dat uit een fles komt'],
    ['rugzak', 'rug', 'zak', 'een tas die je op je rug draagt', 'een rug met een zak eraan'],
    ['regenjas', 'regen', 'jas', 'een jas tegen de regen', 'regen die op een jas valt']
  ];
  function maakKern(R){
    var x = R.kies(KERN), fb = {}; fb[x[4]] = 'Bij deze uitleg is ' + q(x[1]) + ' de kern geworden. Maar de kern staat achteraan: ' + q(x[2]) + '.';
    return OP({ vraag:x[0], context:'Dit woord is een samenstelling: twee woorden aan elkaar. Wat betekent het?',
      beeld:function(n){ return n >= 1 ? R.teken.woord([{ t:x[1], k:2, label:'extra info' }, { t:x[2], k:1, label:'kern' }]) : R.teken.woord([{ t:x[0], k:5 }]); },
      stappen:[
        K(R, 'Welk deel is de kern?', x[2], [x[1]], 'De kern staat in een samenstelling altijd achteraan. Het deel ervoor vertelt iets extra’s over de kern.'),
        K(R, 'Welke uitleg past bij ' + q(x[0]) + '?', x[3], [x[4]], 'De kern is ' + q(x[2]) + '. Zoek de uitleg die over ' + q(x[2]) + ' gaat.', { fout:fb }) ] });
  }

  /* woordfamilies: [basis, betekenis, [familie], [[lijkt erop, uitleg], ...]] */
  var FAM = [
    ['bakken', 'iets gaar maken in een oven', ['bakker', 'bakkerij', 'gebak', 'bakplaat'], [['bank', 'Een bank is iets om op te zitten, of een bedrijf voor je geld.'], ['baken', 'Een baken is een teken dat de weg wijst, bijvoorbeeld voor schepen.']]],
    ['schrijven', 'letters en woorden op papier of een scherm zetten', ['schrijver', 'schrift', 'beschrijving', 'handschrift'], [['schrikken', 'Schrikken doe je als iets je ineens bang maakt.'], ['schrapen', 'Schrapen is iets met een scherpe rand eraf halen.']]],
    ['lezen', 'een tekst met je ogen volgen en begrijpen', ['lezer', 'leesboek', 'voorlezen', 'gelezen'], [['lepel', 'Een lepel gebruik je om te eten.'], ['leeuw', 'Een leeuw is een wild dier.']]],
    ['spelen', 'iets doen voor je plezier, zoals een spel', ['speler', 'speelgoed', 'speeltuin', 'toneelspel'], [['spiegel', 'In een spiegel zie je jezelf.'], ['speld', 'Met een speld zet je stof vast.']]],
    ['zwemmen', 'je in het water voortbewegen', ['zwemmer', 'zwembad', 'zwemles', 'zwemvest'], [['zweten', 'Zweten doe je als je het warm hebt.'], ['zwaaien', 'Zwaaien doe je met je hand als je gedag zegt.']]],
    ['wonen', 'ergens je huis hebben', ['woning', 'bewoner', 'woonkamer', 'inwoner'], [['wonder', 'Een wonder is iets wat bijna niet kan.'], ['wond', 'Een wond is een plek waar je huid kapot is.']]],
    ['slapen', 'rusten met je ogen dicht', ['slaapkamer', 'slaper', 'slaperig', 'uitslapen'], [['slang', 'Een slang is een dier zonder poten.'], ['slager', 'Een slager verkoopt vlees.']]],
    ['denken', 'iets in je hoofd bedenken of vinden', ['gedachte', 'nadenken', 'denker', 'bedenken'], [['deken', 'Een deken ligt op je bed.'], ['dennenboom', 'Een dennenboom is een boom met naalden.']]],
    ['wassen', 'iets schoonmaken met water', ['wasmachine', 'afwas', 'wasbak', 'wasgoed'], [['wachten', 'Wachten doe je tot iets gebeurt.'], ['wapen', 'Met een wapen kun je vechten.']]],
    ['huis', 'een gebouw waarin je woont', ['huisje', 'thuis', 'huiswerk', 'huiselijk'], [['huid', 'Je huid zit om je hele lichaam.'], ['huilen', 'Huilen doe je als je verdrietig bent.']]],
    ['vriend', 'iemand die je graag mag en vertrouwt', ['vriendin', 'vriendschap', 'vriendelijk', 'bevriend'], [['vriezen', 'Het vriest als het onder nul is.'], ['vrachtwagen', 'Een vrachtwagen vervoert spullen.']]],
    ['koken', 'eten gaar maken op het vuur', ['kok', 'kookboek', 'kookplaat', 'gekookt'], [['kokosnoot', 'Een kokosnoot is een vrucht met een harde schil.'], ['kogel', 'Een kogel komt uit een geweer.']]],
    ['rijden', 'je verplaatsen met een fiets, auto of paard', ['rijbewijs', 'rijles', 'autorijden', 'paardrijden'], [['rijst', 'Rijst is een graan dat je kookt en eet.'], ['rijk', 'Wie rijk is, heeft veel geld.']]],
    ['vliegen', 'door de lucht gaan', ['vliegtuig', 'vlieger', 'vliegveld', 'gevlogen'], [['vlag', 'Een vlag hangt aan een stok.'], ['vlees', 'Vlees komt van een dier.']]],
    ['eten', 'voedsel in je mond stoppen en doorslikken', ['etenstijd', 'gegeten', 'opeten', 'avondeten'], [['etiket', 'Een etiket is een plakker met informatie.'], ['etalage', 'In een etalage liggen de spullen van een winkel.']]],
    ['kopen', 'iets krijgen in ruil voor geld', ['verkoper', 'aankoop', 'koopje', 'koopavond'], [['kop', 'Een kop is een beker, of je hoofd.'], ['kopie', 'Een kopie is een afdruk van iets.']]]
  ];
  function maakFam(R){
    var x = R.kies(FAM), indr = x[3].filter(function(y){ return y[1] && y[0] !== x[0]; }), betAnder = ander(R, FAM.filter(function(y){ return y !== x; }).map(function(y){ return y[1]; }), [], 2);
    var st1 = K(R, 'Wat betekent ' + q(x[0]) + '?', x[1], betAnder, 'Maak een zin met ' + q(x[0]) + '. Waar gaat die zin over?');
    if (R.heel(0, 1)){
      var i = R.kies(indr), fam = ander(R, x[2], [], 3), rij = R.hussel(fam.concat([i[0]]));
      return OP({ vraag:rij.join(' · '), context:'Deze woorden lijken allemaal op <b>' + R.schoon(x[0]) + '</b>. Eén woord hoort niet bij de woordfamilie.',
        stappen:[ st1,
          K(R, 'Welk woord heeft niets met ' + q(x[0]) + ' te maken?', i[0], fam, 'Alle woorden lijken op ' + q(x[0]) + '. Bij welk woord gaat het niet over ' + x[1] + '?', { waarom:i[1] }) ] });
    }
    var goed = R.kies(x[2]), nep = indr.map(function(y){ return y[0]; });
    return OP({ vraag:x[0], context:'Welk woord hoort bij de <b>woordfamilie</b> van ' + R.schoon(x[0]) + '?',
      stappen:[ st1,
        K(R, 'Welk woord hoort bij de familie?', goed, nep, 'Het lijken allemaal op ' + q(x[0]) + '. Bij welk woord gaat het echt over ' + x[1] + '?', { waarom:indr.map(function(y){ return y[1]; }).join(' ') }) ] });
  }

  /* wie het doet: [werkwoord, stam, uitgang, persoon] */
  var PERS = [
    ['lopen', 'loop', 'er', 'loper'], ['bakken', 'bak', 'er', 'bakker'], ['zwemmen', 'zwem', 'er', 'zwemmer'], ['schrijven', 'schrijf', 'er', 'schrijver'],
    ['lezen', 'lees', 'er', 'lezer'], ['spelen', 'speel', 'er', 'speler'], ['fietsen', 'fiets', 'er', 'fietser'], ['verliezen', 'verlies', 'er', 'verliezer'],
    ['dansen', 'dans', 'er', 'danser'], ['sporten', 'sport', 'er', 'sporter'], ['voetballen', 'voetbal', 'er', 'voetballer'], ['schaatsen', 'schaats', 'er', 'schaatser'],
    ['duiken', 'duik', 'er', 'duiker'], ['vissen', 'vis', 'er', 'visser'], ['jagen', 'jaag', 'er', 'jager'], ['bezoeken', 'bezoek', 'er', 'bezoeker'],
    ['gebruiken', 'gebruik', 'er', 'gebruiker'], ['verkopen', 'verkoop', 'er', 'verkoper'], ['kijken', 'kijk', 'er', 'kijker'],
    ['luisteren', 'luister', 'aar', 'luisteraar'], ['tekenen', 'teken', 'aar', 'tekenaar'], ['wandelen', 'wandel', 'aar', 'wandelaar'],
    ['handelen', 'handel', 'aar', 'handelaar'], ['bewonderen', 'bewonder', 'aar', 'bewonderaar'], ['twijfelen', 'twijfel', 'aar', 'twijfelaar'], ['bedelen', 'bedel', 'aar', 'bedelaar']
  ];
  function hijVorm(stam){ return /t$/.test(stam) ? stam : stam + 't'; }
  function maakPers(R){
    var x = R.kies(PERS), kaal = x[0].slice(0, -2), fb = {};
    if (kaal !== x[1]) fb[kaal] = 'Je haalde -en eraf, maar de stam schrijf je zoals de ik-vorm: ik ' + x[1] + '.';
    var fb2 = {}; fb2[kaal + (x[2] === 'er' ? 'aar' : 'er')] = 'Kijk nog eens naar de stam: eindigt die op -el, -er of -en?';
    return OP({ vraag:x[0] + ' → iemand die ' + hijVorm(x[1]), context:'Maak van het werkwoord een woord voor de persoon die het doet.',
      beeld:function(n){ return n >= 4 ? R.teken.woord([{ t:kaal, k:2, label:'werkwoord zonder -en' }, { t:x[2], k:1, label:'persoon' }]) : ''; },
      stappen:[
        { tekst:'Wat is de stam van <i>' + x[0] + '</i>?', antwoord:x[1], hint:'De stam is de ik-vorm. Maak af: ik ... elke dag.', fout:fb },
        V('Eindigt de stam op -el, -er of -en?', ['ja', 'nee'], x[2] === 'aar' ? 0 : 1, 'Kijk naar de laatste twee letters van ' + q(x[1]) + '.'),
        K(R, 'Welke uitgang krijgt het woord dus?', '-' + x[2], ['-er', '-aar', '-ing'], 'Eindigt de stam op -el, -er of -en, dan wordt het -aar. Anders wordt het -er.', { fout:{ '-ing':'Met -ing maak je een handeling, zoals een wandeling. Je zoekt hier een persoon.' } }),
        { tekst:'Hoe heet iemand die ' + hijVorm(x[1]) + '?', antwoord:x[3], hint:'Plak de uitgang aan het werkwoord zonder -en: ' + kaal + ' + ' + x[2] + '.', fout:fb2 } ] });
  }

  /* van werkwoord naar ding of handeling: [werkwoord, soort, woord, zin] */
  var HAND = [
    ['wandelen', 'ing', 'wandeling', 'Na het eten maken we een lange ___ door het bos.'],
    ['tekenen', 'ing', 'tekening', 'Mijn zusje heeft een mooie ___ van een paard gemaakt.'],
    ['oefenen', 'ing', 'oefening', 'De laatste ___ van het hoofdstuk is het moeilijkst.'],
    ['betalen', 'ing', 'betaling', 'De ___ met je pinpas gaat snel.'],
    ['bestellen', 'ing', 'bestelling', 'Mijn ___ wordt morgen bezorgd.'],
    ['uitnodigen', 'ing', 'uitnodiging', 'Ik kreeg een ___ voor het feest van Mila.'],
    ['beslissen', 'ing', 'beslissing', 'De scheidsrechter nam een moeilijke ___.'],
    ['waarschuwen', 'ing', 'waarschuwing', 'Op het pakje staat een ___: niet voor kinderen onder drie jaar.'],
    ['verzamelen', 'ing', 'verzameling', 'Mijn broer heeft een grote ___ voetbalplaatjes.'],
    ['ontmoeten', 'ing', 'ontmoeting', 'De ___ met de burgemeester duurde maar vijf minuten.'],
    ['vergaderen', 'ing', 'vergadering', 'De leraren hebben vanmiddag een ___.'],
    ['verwarmen', 'ing', 'verwarming', 'Het is koud, zet de ___ maar hoger.'],
    ['herhalen', 'ing', 'herhaling', 'Voor de toets doen we een ___ van alle lessen.'],
    ['openen', 'ing', 'opening', 'Bij de ___ van het nieuwe zwembad waren veel mensen.'],
    ['voorbereiden', 'ing', 'voorbereiding', 'Een goede ___ is het halve werk.'],
    ['lachen', 'ge', 'gelach', 'Uit het lokaal kwam luid ___.'],
    ['huilen', 'ge', 'gehuil', 'Het ___ van de baby hield ons wakker.'],
    ['praten', 'ge', 'gepraat', 'Door al dat ___ kon ik me niet concentreren.'],
    ['blaffen', 'ge', 'geblaf', 'Het ___ van de hond was in de hele straat te horen.'],
    ['schreeuwen', 'ge', 'geschreeuw', 'Op het schoolplein klonk ___.'],
    ['toeteren', 'ge', 'getoeter', 'Het ___ van de auto’s in de file was oorverdovend.'],
    ['zeuren', 'ge', 'gezeur', 'Ik heb geen zin in jouw ___.'],
    ['fluiten', 'ge', 'gefluit', 'In het bos hoorden we het ___ van vogels.'],
    ['kletsen', 'ge', 'geklets', 'Stop met dat ___ en ga aan het werk.'],
    ['mopperen', 'ge', 'gemopper', 'Na veel ___ over het eten at hij toch zijn bord leeg.']
  ];
  var HANDSOORT = { ing:'één handeling, of het ding of de uitkomst ervan', ge:'een geluid of iets wat steeds maar doorgaat' };
  function maakHand(R){
    var x = R.kies(HAND), ing = x[1] === 'ing', kaal = x[0].slice(0, -2), stam = ing ? kaal : x[2].slice(2);
    return OP({ vraag:x[3], context:'Maak van het werkwoord <b>' + x[0] + '</b> een zelfstandig naamwoord dat in de zin past.',
      beeld:function(n){ return n >= 3 ? vulZin(R, x[3], x[2], ing ? 'werkwoord + ing' : 'ge + stam') : ''; },
      stappen:[
        K(R, 'Waar gaat het woord in deze zin over?', HANDSOORT[x[1]], [HANDSOORT[ing ? 'ge' : 'ing']], 'Lees de zin. Hoor je een geluid dat maar doorgaat, of gaat het om één handeling of een ding?'),
        K(R, 'Welk stukje maakt er een zelfstandig naamwoord van?', ing ? '-ing' : 'ge-', ['-ing', 'ge-', '-er'], 'Een geluid dat maar doorgaat krijgt ge- ervoor: gelach. Eén handeling of een ding krijgt -ing erachter: tekening.',
          { fout:{ '-er':'Met -er maak je een persoon, zoals een wandelaar of een lezer. Hier zoek je geen persoon.' } }),
        { tekst:'Schrijf het woord.', antwoord:x[2], hint:ing ? 'Plak -ing aan het werkwoord zonder -en: ' + kaal + ' + ing.' : 'Zet ge- voor de stam, de ik-vorm: ge + ' + stam + '.' } ] });
  }

  /* nieuwe woorden: [woord, hoe het gemaakt is, soort] */
  var NIEUW = [
    ['deelscooter', 'deel + scooter: een scooter die je met anderen deelt', 'samen'],
    ['laadpaal', 'laad + paal: een paal waar je een elektrische auto oplaadt', 'samen'],
    ['appgroep', 'app + groep: een groep in een chatapp', 'samen'],
    ['plofkraak', 'plof + kraak: een kraak waarbij dieven een geldautomaat opblazen', 'samen'],
    ['zonnepaneel', 'zonne + paneel: een paneel dat stroom maakt van zonlicht', 'samen'],
    ['thuiswerkdag', 'thuis + werk + dag: een dag dat je thuis werkt', 'samen'],
    ['Benelux', 'Be(lgië) + Ne(derland) + Lux(emburg)', 'trek'],
    ['Eurovisie', 'Euro(pa) + (tele)visie: een samenwerking van televisiezenders in Europa', 'trek'],
    ['vlog', 'v(ideo) + (b)log: een dagboek met filmpjes', 'trek'],
    ['Nexit', 'N(ederland) + exit: Nederland dat uit de Europese Unie stapt', 'trek'],
    ['tv', 't(ele)v(isie): je zegt de letters t en v', 'afk'],
    ['pinnen', 'van pin: p(ersoonlijk) i(dentificatie)n(ummer)', 'afk'],
    ['ov-kaart', 'van ov: o(penbaar) v(ervoer)', 'afk'],
    ['btw', 'b(elasting) t(oegevoegde) w(aarde)', 'afk'],
    ['havo', 'h(oger) a(lgemeen) v(oortgezet) o(nderwijs)', 'afk'],
    ['BN’er', 'een B(ekende) N(ederlander)', 'afk'],
    ['selfie', 'uit het Engels: een foto die je van jezelf maakt', 'leen'],
    ['chillen', 'uit het Engels: rustig aan doen, ontspannen', 'leen'],
    ['swipen', 'uit het Engels: met je vinger over een scherm vegen', 'leen'],
    ['emoji', 'uit het Japans: een plaatje in een bericht', 'leen'],
    ['streamen', 'uit het Engels: online kijken of luisteren zonder te downloaden', 'leen'],
    ['gamen', 'uit het Engels: spelletjes spelen op een computer of console', 'leen']
  ];
  var NIEUWHOE = { samen:'twee hele woorden aan elkaar geplakt', trek:'stukjes van woorden in elkaar geschoven', afk:'de eerste letters van een paar woorden', leen:'een woord uit een andere taal overgenomen' };
  var NIEUWNAAM = { samen:'samenstelling', trek:'samentrekking', afk:'afkorting die een woord werd', leen:'leenwoord' };
  function maakNieuw(R){
    var x = R.kies(NIEUW), s = x[2], niet = s === 'trek' ? ['leen', s] : s === 'leen' ? ['trek', s] : [s];
    var rest = Object.keys(NIEUWHOE).filter(function(k){ return niet.indexOf(k) < 0; });
    return OP({ vraag:x[0], context:'Een nieuw woord: <b>' + R.schoon(x[0]) + '</b><br>' + R.schoon(x[1]),
      stappen:[
        K(R, 'Hoe is het woord gemaakt?', NIEUWHOE[s], rest.map(function(k){ return NIEUWHOE[k]; }), 'Kijk naar de uitleg. Zie je twee hele woorden, stukjes van woorden, losse beginletters of een woord uit een andere taal?'),
        K(R, 'Hoe heet zo’n nieuw woord?', NIEUWNAAM[s], rest.map(function(k){ return NIEUWNAAM[k]; }), 'Hele woorden aan elkaar: samenstelling. Stukjes in elkaar: samentrekking. Beginletters: afkorting. Uit een andere taal: leenwoord.') ] });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'taal-bouw', niveau:'2F', domein:'woordenschat', naam:'Woorden bouwen', kd:['nl6A.b', 'nl7B.e'],
        uit:'Lange woorden zijn vaak gebouwd uit kleinere stukken. Als je weet hoe dat bouwen gaat, snap je nieuwe woorden sneller en maak je ze zelf.' },
      doelen:[
        { id:'taal-bouw-kern', naam:'De kern van een samenstelling', kort:'In een samenstelling staat de kern achteraan: een voetbalschoen is een schoen',
          uit:'<p>Een <b>samenstelling</b> is een woord dat uit twee woorden bestaat. Het laatste deel is de <b>kern</b>: dat zegt wat het is. Het eerste deel vertelt er iets extra’s over.</p><p>Een <i>voetbalschoen</i> is een <b>schoen</b>, om mee te voetballen. <i>Chocolademelk</i> is <b>melk</b>, maar <i>melkchocolade</i> is <b>chocolade</b>.</p>',
          wanneer:'je een lang woord tegenkomt en wilt weten wat het precies is.',
          maak:maakKern },
        { id:'taal-bouw-familie', naam:'Woordfamilies', kort:'Woorden met dezelfde kern en betekenis horen bij één familie; erop lijken is niet genoeg',
          uit:'<p>Woorden die bij elkaar horen, vormen een <b>woordfamilie</b>: <i>bakken, bakker, bakkerij, gebak</i>. Ze hebben hetzelfde stuk én ze gaan over hetzelfde.</p><p>Let op: een woord dat er alleen op <b>lijkt</b>, hoort er niet bij. Een <i>bank</i> heeft niets met bakken te maken. Kijk dus altijd naar de <b>betekenis</b>.</p>',
          wanneer:'je de betekenis van een woord wilt raden via een woord dat je al kent.',
          maak:maakFam },
        { id:'taal-bouw-persoon', naam:'Van werkwoord naar persoon', kort:'Plak -er of -aar aan het werkwoord zonder -en: lopen wordt loper, wandelen wordt wandelaar',
          uit:'<p>Van een werkwoord maak je een woord voor <b>de persoon die het doet</b>. Iemand die loopt, is een <i>loper</i>. Iemand die wandelt, is een <i>wandelaar</i>.</p><p>Zo doe je het: zoek de stam (de ik-vorm). Eindigt die op <b>-el, -er of -en</b>? Dan komt er <b>-aar</b> achter. Anders <b>-er</b>.</p><p>Spelling: plak de uitgang aan het werkwoord zonder -en. <i>bakk + er = bakker</i>, <i>lez + er = lezer</i>.</p>',
          wanneer:'je wilt zeggen wie iets doet.',
          maak:maakPers },
        { id:'taal-bouw-handeling', naam:'Van werkwoord naar ding of geluid', kort:'Met -ing maak je een handeling of ding (wandeling), met ge- een geluid dat doorgaat (gelach)',
          uit:'<p>Van een werkwoord kun je ook een <b>zelfstandig naamwoord</b> maken.</p><p>Met <b>-ing</b> erachter krijg je één handeling, of het ding dat eruit komt: <i>wandelen, de wandeling</i> en <i>tekenen, de tekening</i>.</p><p>Met <b>ge-</b> ervoor krijg je een geluid of iets wat maar doorgaat: <i>lachen, het gelach</i> en <i>blaffen, het geblaf</i>.</p>',
          wanneer:'je in een zin een zelfstandig naamwoord nodig hebt en alleen het werkwoord kent.',
          maak:maakHand },
        { id:'taal-bouw-nieuw', naam:'Hoe nieuwe woorden ontstaan', kort:'Nieuwe woorden zijn samenstellingen, samentrekkingen, afkortingen of leenwoorden',
          uit:'<p>Er komen steeds <b>nieuwe woorden</b> bij. Ze ontstaan op een paar manieren.</p><p><b>Samenstelling</b>: twee hele woorden aan elkaar (<i>laadpaal</i>). <b>Samentrekking</b>: stukjes van woorden in elkaar geschoven (<i>Benelux</i>). <b>Afkorting</b>: beginletters die een woord worden (<i>tv, pinnen</i>). <b>Leenwoord</b>: een woord uit een andere taal (<i>selfie</i>).</p>',
          wanneer:'je een nieuw woord tegenkomt en wilt snappen waar het vandaan komt.',
          maak:maakNieuw }
      ] }
  ]);

  /* ================= TAAL OM JE HEEN ================= */

  /* streektaal: [zin, betekenis in standaardtaal, streek, herkenning] */
  var STREEK = [
    ['Hoe giet it?', 'Hoe gaat het?', 'fries', 'giet en it'],
    ['Tige tank!', 'Hartelijk dank!', 'fries', 'tige'],
    ['Goeie moarn!', 'Goedemorgen!', 'fries', 'moarn'],
    ['It is kâld hjoed.', 'Het is koud vandaag.', 'fries', 'it, kâld en hjoed'],
    ['Ik bin wurch.', 'Ik ben moe.', 'fries', 'bin en wurch'],
    ['Houdoe!', 'Dag, tot ziens!', 'brabants', 'houdoe'],
    ['Hedde gij da gezien?', 'Heb jij dat gezien?', 'brabants', 'hedde en gij'],
    ['Ajuu!', 'Dag!', 'limburgs', 'ajuu'],
    ['Ich höb honger.', 'Ik heb honger.', 'limburgs', 'ich en höb'],
    ['Wat sjoen!', 'Wat mooi!', 'limburgs', 'sjoen'],
    ['Moi!', 'Hallo!', 'gronings', 'moi'],
    ['Ik wait ’t nait.', 'Ik weet het niet.', 'gronings', 'wait en nait'],
    ['Ik heb goesting in friet.', 'Ik heb zin in friet.', 'vlaams', 'goesting'],
    ['Amai, dat is schoon!', 'Wauw, dat is mooi!', 'vlaams', 'amai'],
    ['Zet de melk in de frigo.', 'Zet de melk in de koelkast.', 'vlaams', 'frigo'],
    ['Dat was een plezante avond.', 'Dat was een leuke avond.', 'vlaams', 'plezant'],
    ['Bel me op mijn gsm.', 'Bel me op mijn mobiele telefoon.', 'vlaams', 'gsm']
  ];
  var STREEKNAAM = { fries:'Fries', brabants:'Brabants', limburgs:'Limburgs', gronings:'Gronings', vlaams:'Vlaams (Nederlands in België)' };
  var STREEKTIP = { fries:'Fries herken je aan woorden als it, bin, tige, moarn en hjoed.', brabants:'Brabants herken je aan houdoe, gij en hedde.',
    limburgs:'Limburgs herken je aan ich, sjoen en ajuu.', gronings:'Gronings herken je aan moi, nait en wait.', vlaams:'Vlaams herken je aan woorden als goesting, amai, frigo en plezant.' };
  function maakStreek(R){
    var x = R.kies(STREEK), fout = ander(R, STREEK.filter(function(y){ return y[1] !== x[1]; }).map(function(y){ return y[1]; }), [], 2);
    return OP({ vraag:x[0], context:'Deze zin is geen standaardtaal. Wat betekent hij, en waar hoor je hem?',
      stappen:[
        K(R, 'Wat betekent de zin in standaardtaal?', x[1], fout, 'Zeg de zin hardop. Welke Nederlandse woorden hoor je erin?'),
        K(R, 'Uit welke streek of taal komt de zin?', STREEKNAAM[x[2]], ander(R, waarden(STREEKNAAM, x[2]), [], 2), STREEKTIP[x[2]], { waarom:'Herken je aan: ' + x[3] + '.' }) ] });
  }

  /* jongerentaal en straattaal: [zin, woord, betekenis, standaardzin] */
  var JONG = [
    ['Ik heb geen doekoe meer voor de bioscoop.', 'doekoe', 'geld', 'Ik heb geen geld meer voor de bioscoop.'],
    ['Zaterdag is er een fissa bij Sem.', 'fissa', 'feest', 'Zaterdag is er een feest bij Sem.'],
    ['Mijn matti komt zo langs.', 'matti', 'vriend', 'Mijn vriend komt zo langs.'],
    ['Zijn broer heeft een nieuwe waggi.', 'waggi', 'auto', 'Zijn broer heeft een nieuwe auto.'],
    ['Ik ga zo naar osso.', 'osso', 'huis', 'Ik ga zo naar huis.'],
    ['Ik ben skeer deze maand.', 'skeer', 'zonder geld, blut', 'Ik heb deze maand geen geld.'],
    ['Wat een mooie patta’s heb je aan.', 'patta’s', 'sneakers', 'Wat een mooie sneakers heb je aan.'],
    ['Die soep is tantoe lekker.', 'tantoe', 'heel erg', 'Die soep is heel erg lekker.'],
    ['Na de toets ga ik lekker chillen.', 'chillen', 'ontspannen, rustig aan doen', 'Na de toets ga ik lekker ontspannen.'],
    ['Hij loopt de hele dag te flexen met zijn nieuwe horloge.', 'flexen', 'opscheppen', 'Hij loopt de hele dag op te scheppen over zijn nieuwe horloge.'],
    ['Dat filmpje was echt cringe.', 'cringe', 'gênant', 'Dat filmpje was echt gênant.'],
    ['Boeie, ik ga toch niet.', 'boeie', 'het kan me niet schelen', 'Het kan me niet schelen, ik ga toch niet.'],
    ['Die pizza is kapot lekker.', 'kapot', 'heel erg', 'Die pizza is heel erg lekker.'],
    ['Wat een vette schoenen!', 'vette', 'mooie, gave', 'Wat een mooie schoenen!'],
    ['Ik fix morgen de kaartjes.', 'fix', 'regel', 'Ik regel morgen de kaartjes.'],
    ['Het feest gisteren was echt lit.', 'lit', 'geweldig', 'Het feest gisteren was echt geweldig.']
  ];
  var JONGWEL = ['in een appje aan een vriend', 'als je met vrienden kletst op het schoolplein', 'in een berichtje in de groepsapp van je klas'];
  var JONGNIET = ['in een mail aan je mentor', 'in een sollicitatiegesprek', 'in een werkstuk voor geschiedenis', 'in een brief aan de gemeente', 'bij je spreekbeurt voor de klas'];
  function maakJong(R){
    var x = R.kies(JONG), betAnder = ander(R, JONG.filter(function(y){ return y[2] !== x[2]; }).map(function(y){ return y[2]; }), [], 2);
    var zinAnder = ander(R, JONG.filter(function(y){ return y !== x; }).map(function(y){ return y[3]; }), [], 2);
    var re = new RegExp('(' + x[1] + ')', 'i');
    return OP({ vraag:x[0], vraagHtml:R.schoon(x[0]).replace(re, '<mark>$1</mark>'), context:'In deze zin staat een woord uit jongerentaal of straattaal.',
      stappen:[
        K(R, 'Wat betekent ' + q(x[1]) + '?', x[2], betAnder, 'Lees de rest van de zin. Wat zou er logisch op die plek passen?'),
        K(R, 'Hoe zeg je de zin in standaardtaal?', x[3], zinAnder, 'Zoek de zin die hetzelfde zegt, met ' + q(x[2]) + ' in plaats van ' + q(x[1]) + '.'),
        K(R, 'Waar past de zin met ' + q(x[1]) + ' wel?', R.kies(JONGWEL), ander(R, JONGNIET, [], 2), 'Jongerentaal hoort bij vrienden en leeftijdgenoten die het woord ook kennen. Bij mensen die je minder goed kent, of als het netjes moet, gebruik je standaardtaal.') ] });
  }

  /* vaktaal: [woord, vak, zin in het vak, betekenis in het vak, zin uit het dagelijks leven, betekenis daar] */
  var VAK = [
    ['oplossing', 'scheikunde', 'Als je suiker in water roert, krijg je een oplossing.', 'een vloeistof waarin een stof is opgelost', 'We moeten een oplossing vinden voor de ruzie.', 'een manier om een probleem op te lossen'],
    ['kracht', 'natuurkunde', 'Op de veer werkt een kracht van 5 newton.', 'een duw of trek op iets, gemeten in newton', 'Na de griep had ik nog weinig kracht in mijn armen.', 'hoe sterk je bent'],
    ['product', 'wiskunde', 'Het product van 6 en 7 is 42.', 'de uitkomst van een keersom', 'Dit product is in de aanbieding.', 'iets wat je kunt kopen'],
    ['verschil', 'wiskunde', 'Het verschil tussen 20 en 8 is 12.', 'de uitkomst van een minsom', 'Zie jij het verschil tussen die twee tassen?', 'waarin twee dingen niet hetzelfde zijn'],
    ['spanning', 'natuurkunde', 'De batterij heeft een spanning van 9 volt.', 'de elektrische druk, gemeten in volt', 'Bij de penalty’s was de spanning niet te harden.', 'een spannend, gespannen gevoel'],
    ['weerstand', 'natuurkunde', 'Een lange, dunne draad heeft een grote weerstand.', 'hoe moeilijk stroom door iets heen gaat', 'Het plan kreeg veel weerstand van de ouders.', 'verzet tegen iets'],
    ['cel', 'biologie', 'Onder de microscoop zie je dat een blad uit cellen bestaat.', 'de kleinste bouwsteen van een levend wezen', 'De dief zat een nacht in de cel.', 'een kleine kamer in een gevangenis'],
    ['bron', 'geschiedenis', 'Deze brief uit 1944 is een belangrijke bron over de oorlog.', 'een tekst of voorwerp waaruit je informatie over vroeger haalt', 'Uit de bron in het bos komt helder water.', 'een plek waar water uit de grond komt'],
    ['reactie', 'scheikunde', 'Bij deze reactie ontstaat een nieuw gas.', 'het veranderen van stoffen in nieuwe stoffen', 'Op mijn bericht kwam geen reactie.', 'een antwoord op iets'],
    ['massa', 'natuurkunde', 'De massa van het blok is 2 kilogram.', 'hoeveel stof iets heeft, gemeten in kilogram', 'Er stond een massa mensen voor het podium.', 'een grote groep'],
    ['stroom', 'natuurkunde', 'Als de schakelaar dicht is, loopt er stroom door de lamp.', 'elektriciteit die door een draad gaat', 'De boot dreef mee met de stroom van de rivier.', 'water dat in één richting beweegt'],
    ['macht', 'wiskunde', 'Twee tot de macht drie is acht.', 'een getal dat een aantal keer met zichzelf wordt vermenigvuldigd', 'De koning had veel macht.', 'de kracht om te bepalen wat er gebeurt'],
    ['breuk', 'wiskunde', 'Driekwart schrijf je als breuk: 3/4.', 'een getal met een teller en een noemer', 'Na de val had hij een breuk in zijn pols.', 'een gebroken bot'],
    ['wortel', 'wiskunde', 'De wortel van 49 is 7.', 'het getal dat keer zichzelf het andere getal geeft', 'Het konijn knabbelt aan een wortel.', 'een oranje groente'],
    ['schaal', 'aardrijkskunde', 'Deze kaart heeft een schaal van 1 : 50.000.', 'hoeveel keer kleiner de kaart is dan de werkelijkheid', 'Doe de chips maar in een schaal.', 'een open bak of kom'],
    ['zin', 'Nederlands', 'In deze zin is hij het onderwerp.', 'een groep woorden met een persoonsvorm', 'Ik heb zin in een ijsje.', 'iets graag willen']
  ];
  function maakVak(R){
    var x = R.kies(VAK), vak = R.heel(0, 1) === 1, zin = vak ? x[2] : x[4], bet = vak ? x[3] : x[5], ob = vak ? x[5] : x[3];
    var plek = vak ? 'over ' + x[1] : 'over het dagelijks leven', anderPlek = vak ? 'over het dagelijks leven' : 'over ' + x[1];
    var re = new RegExp('(' + x[0] + ')', 'i');
    return OP({ vraag:zin, vraagHtml:R.schoon(zin).replace(re, '<mark>$1</mark>'), context:'Het woord ' + q(x[0]) + ' betekent bij ' + x[1] + ' iets anders dan in het dagelijks leven.',
      stappen:[
        K(R, 'Gaat deze zin over een schoolvak of over het dagelijks leven?', plek, [anderPlek], 'Kijk naar de andere woorden in de zin. Staan er vakwoorden of eenheden in, zoals newton, volt of getallen? Dan gaat het over het vak.'),
        K(R, 'Wat betekent ' + q(x[0]) + ' hier?', bet, [ob, R.kies(VAK.filter(function(y){ return y !== x; }))[vak ? 3 : 5]], 'Je weet nu waar de zin over gaat. Kies de betekenis die daarbij hoort.') ] });
  }

  /* leenwoorden: [woord, taal, Nederlands woord, zin] */
  var LEEN = [
    ['deadline', 'en', 'uiterste datum', 'De deadline voor het werkstuk is vrijdag.'],
    ['meeting', 'en', 'vergadering', 'Mijn moeder zit de hele middag in een meeting.'],
    ['skills', 'en', 'vaardigheden', 'Bij deze bijbaan leer je veel nieuwe skills.'],
    ['feedback', 'en', 'terugkoppeling', 'De docent gaf feedback op mijn verslag.'],
    ['challenge', 'en', 'uitdaging', 'Tien kilometer hardlopen is een flinke challenge.'],
    ['shoppen', 'en', 'winkelen', 'Op zaterdag gaan we shoppen in de stad.'],
    ['sale', 'en', 'uitverkoop', 'In de sale was die jas veel goedkoper.'],
    ['team', 'en', 'ploeg', 'Ons team won de finale.'],
    ['cadeau', 'fr', 'geschenk', 'Ik kreeg een mooi cadeau voor mijn verjaardag.'],
    ['trottoir', 'fr', 'stoep', 'Loop maar op het trottoir, niet op de weg.'],
    ['chauffeur', 'fr', 'bestuurder', 'De chauffeur van de bus stopte bij de halte.'],
    ['portemonnee', 'fr', 'beurs', 'Mijn portemonnee zit in mijn jaszak.'],
    ['horloge', 'fr', 'uurwerk', 'Op mijn horloge is het al half negen.'],
    ['souvenir', 'fr', 'aandenken', 'Ik nam een souvenir mee uit Parijs.'],
    ['enquête', 'fr', 'vragenlijst', 'Wil je deze enquête over de kantine invullen?'],
    ['paraplu', 'fr', 'regenscherm', 'Neem een paraplu mee, het gaat regenen.'],
    ['pienter', 'ml', 'slim', 'Wat ben jij een pienter meisje.'],
    ['piekeren', 'ml', 'tobben', 'Lig niet de hele nacht te piekeren over die toets.'],
    ['toko', 'ml', 'winkeltje', 'Bij de toko op de hoek koop ik kroepoek.'],
    ['senang', 'ml', 'op je gemak', 'In het nieuwe huis voel ik me helemaal senang.'],
    ['mazzel', 'jd', 'geluk', 'Wat een mazzel dat je de bus nog haalde.'],
    ['gabber', 'jd', 'vriend', 'Hij gaat met zijn gabbers naar de film.'],
    ['jatten', 'jd', 'stelen', 'Wie heeft mijn pen gejat?'],
    ['tof', 'jd', 'leuk', 'Dat was een toffe dag.'],
    ['bajes', 'jd', 'gevangenis', 'De inbreker zit nu in de bajes.'],
    ['sowieso', 'de', 'in elk geval', 'Ik kom sowieso naar je feest.']
  ];
  var TAAL = { en:'Engels', fr:'Frans', ml:'Maleis (uit Indonesië)', jd:'Jiddisch of Hebreeuws', de:'Duits' };
  var TAALTIP = { en:'Engelse woorden herken je aan klanken en letters als ea, ee, sh en -ing, en aan de uitspraak.', fr:'Franse woorden herken je aan letters als eau, oi, ou en é, en de klemtoon achteraan.',
    ml:'Woorden als pienter, piekeren en toko kwamen in de koloniale tijd uit Indonesië naar het Nederlands.', jd:'Woorden als mazzel, gabber en jatten kwamen via Joodse Nederlanders uit het Jiddisch en Hebreeuws.',
    de:'Dit woord komt uit het Duits, de buurtaal in het oosten.' };
  function maakLeen(R){
    var x = R.kies(LEEN), re = new RegExp('(' + (x[0] === 'tof' ? 'toffe' : x[0] === 'jatten' ? 'gejat' : x[0] === 'gabber' ? 'gabbers' : x[0]) + ')', 'i');
    var ned = ander(R, LEEN.filter(function(y){ return y[2] !== x[2]; }).map(function(y){ return y[2]; }), [], 2);
    return OP({ vraag:x[0], context:R.schoon(x[3]).replace(re, '<mark>$1</mark>'),
      stappen:[
        K(R, 'Uit welke taal komt ' + q(x[0]) + '?', TAAL[x[1]], ander(R, waarden(TAAL, x[1]), [], 2), TAALTIP[x[1]]),
        K(R, 'Welk Nederlands woord betekent hetzelfde?', x[2], ned, 'Zet het woord op de plek van ' + q(x[0]) + ' in de zin. Betekent de zin dan nog hetzelfde?') ] });
  }

  /* taalverandering: [zin, woord, soort, juist, [fout]] ; soort oud, nieuw of anders (juist = de betekenis nu, fout[0] = de betekenis vroeger) */
  var VERANDER = [
    ['Hij stapte op zijn rijwiel.', 'rijwiel', 'oud', 'fiets', ['auto', 'paard']],
    ['Gaarne ontvang ik uw antwoord.', 'gaarne', 'oud', 'graag', ['snel', 'nooit']],
    ['Thans woont zij in Utrecht.', 'thans', 'oud', 'nu', ['vroeger', 'misschien']],
    ['Heden is de winkel gesloten.', 'heden', 'oud', 'vandaag', ['morgen', 'altijd']],
    ['Derhalve gaat de les niet door.', 'derhalve', 'oud', 'daarom', ['toch', 'ook']],
    ['Dat is geenszins de bedoeling.', 'geenszins', 'oud', 'helemaal niet', ['zeker wel', 'een beetje']],
    ['Weleer stond hier een molen.', 'weleer', 'oud', 'vroeger', ['straks', 'nu']],
    ['Ik app je vanavond.', 'app', 'nieuw', 'stuur een bericht via een chatapp', ['bel je met de vaste telefoon', 'schrijf je een brief']],
    ['Ze heeft me geghost.', 'geghost', 'nieuw', 'ze liet ineens niets meer van zich horen', ['ze heeft me laten schrikken', 'ze heeft me een spookverhaal verteld']],
    ['We huren een deelscooter.', 'deelscooter', 'nieuw', 'een scooter die je via een app met anderen deelt', ['een scooter met twee zadels', 'een kapotte scooter']],
    ['De auto staat aan de laadpaal.', 'laadpaal', 'nieuw', 'een paal waar je een elektrische auto oplaadt', ['een paal om je fiets aan vast te zetten', 'een paal voor de vuilnisbak']],
    ['Mijn zus vlogt elke dag.', 'vlogt', 'nieuw', 'ze zet filmpjes over haar leven online', ['ze schrijft in een dagboek', 'ze sport elke dag']],
    ['Wat een vette sneakers!', 'vette', 'anders', 'gaaf, mooi', ['met veel vet erin', 'heel groot']],
    ['Klik met de muis op de knop.', 'muis', 'anders', 'een apparaatje om je computer te bedienen', ['een klein knaagdier', 'een stuk kaas']],
    ['Ik surf een uurtje op internet.', 'surf', 'anders', 'van de ene website naar de andere gaan', ['op een plank over de golven glijden', 'zwemmen in zee']],
    ['Je kunt de foto delen met je vrienden.', 'delen', 'anders', 'online laten zien aan anderen', ['in stukken verdelen', 'weggooien']],
    ['Mijn computer heeft een virus.', 'virus', 'anders', 'een programma dat je computer kapotmaakt', ['een ziekteverwekker bij mensen', 'een stofje']],
    ['Die film was echt gaaf.', 'gaaf', 'anders', 'heel leuk, geweldig', ['heel, zonder beschadiging', 'saai']],
    ['Wat een slim idee!', 'slim', 'anders', 'verstandig, knap bedacht', ['scheef of slecht', 'dom']],
    ['Wat ben jij stout geweest!', 'stout', 'anders', 'ondeugend', ['dapper, moedig', 'netjes']],
    ['Het is hier eng in het donker.', 'eng', 'anders', 'griezelig', ['smal, nauw', 'gezellig']]
  ];
  var VERSOORT = { oud:'het is een oud woord dat bijna niemand meer gebruikt', nieuw:'het is een nieuw woord', anders:'het is een bestaand woord met een nieuwe betekenis' };
  function maakVerander(R){
    var x = R.kies(VERANDER), s = x[2], re = new RegExp('(' + x[1] + ')', 'i');
    var st = [K(R, 'Wat is er met ' + q(x[1]) + ' gebeurd?', VERSOORT[s], waarden(VERSOORT, s),
      'Zou je opa dit woord vroeger al gebruikt hebben? En jij nu? Een oud woord gebruik je zelf niet meer, een nieuw woord bestond vroeger niet, en een veranderd woord bestond al, maar betekende iets anders.')];
    if (s === 'oud') st.push(K(R, 'Welk woord gebruik je nu?', x[3], x[4], 'Zet je woord op de plek van ' + q(x[1]) + '. Klopt de zin nog?'));
    else if (s === 'nieuw') st.push(K(R, 'Wat betekent ' + q(x[1]) + '?', x[3], x[4], 'Denk aan telefoons, apps en internet: daar komen veel nieuwe woorden vandaan.'));
    else {
      st.push(K(R, 'Wat betekende ' + q(x[1]) + ' vroeger?', x[4][0], [x[3], x[4][1]], 'De oude betekenis zie je soms nog in andere woorden of uitdrukkingen. Welke betekenis past niet bij deze zin, maar wel bij vroeger?'));
      st.push(K(R, 'Wat betekent ' + q(x[1]) + ' in deze zin?', x[3], x[4], 'Lees de zin. Welke betekenis past erbij?'));
    }
    return OP({ vraag:x[0], vraagHtml:R.schoon(x[0]).replace(re, '<mark>$1</mark>'), context:'Taal verandert: woorden verdwijnen, komen erbij of krijgen een nieuwe betekenis.', stappen:st });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'taal-variatie', niveau:'2F', domein:'woordenschat', naam:'Taal om je heen', kd:['nl7B.a', 'nl7B.b', 'nl7B.c', 'nl7B.e'],
        uit:'Het Nederlands klinkt niet overal hetzelfde. Er zijn streektalen, jongerentaal en vaktaal, er komen woorden uit andere talen bij, en woorden veranderen in de loop van de tijd.' },
      doelen:[
        { id:'taal-var-streek', naam:'Standaardtaal en streektaal', kort:'Herken een streektaal aan typische woorden en vertaal ze naar standaardtaal',
          uit:'<p><b>Standaardtaal</b> is het Nederlands dat iedereen begrijpt: op school, op het nieuws en in boeken. Daarnaast spreken mensen in veel streken een <b>streektaal</b> of <b>dialect</b>.</p><p><b>Fries</b> is zelfs een eigen taal, met een officiële plek naast het Nederlands. In Brabant zeg je <i>houdoe</i>, in Groningen <i>moi</i>, en in Vlaanderen heb je <i>goesting</i> in iets.</p><p>Streektaal is geen fout Nederlands. Je praat het met mensen uit je eigen streek. Met mensen van ver weg gebruik je standaardtaal, zodat iedereen je begrijpt.</p>',
          wanneer:'je iemand hoort praten met woorden die je niet kent.',
          maak:maakStreek },
        { id:'taal-var-jongeren', naam:'Jongerentaal en straattaal', kort:'Jongerentaal is prima onder vrienden; als het netjes moet, kies je standaardtaal',
          uit:'<p><b>Jongerentaal</b> en <b>straattaal</b> zijn woorden die vooral jongeren gebruiken: <i>fissa, doekoe, chillen, cringe</i>. Veel woorden komen uit het Surinaams, Arabisch, Turks, Papiaments of Engels.</p><p>Het is geen slechte taal: het hoort bij een groep, en je laat ermee zien dat je erbij hoort. Maar niet iedereen begrijpt het.</p><p>Onder vrienden is het prima. Moet het <b>netjes</b>, bij een docent, een bedrijf of in een werkstuk? Dan kies je <b>standaardtaal</b>.</p>',
          wanneer:'je moet kiezen hoe je iets zegt of schrijft, en voor wie.',
          maak:maakJong },
        { id:'taal-var-vaktaal', naam:'Vaktaal en dagelijkse taal', kort:'Een woord kan in een schoolvak iets anders betekenen dan thuis: kijk waar de zin over gaat',
          uit:'<p>In elk schoolvak gebruik je <b>vaktaal</b>. Soms is dat een woord dat je al kent, maar dat in het vak iets anders betekent.</p><p>Bij scheikunde is een <i>oplossing</i> een vloeistof met een stof erin. Thuis is een <i>oplossing</i> een manier om een probleem op te lossen. Bij wiskunde is het <i>product</i> de uitkomst van een keersom.</p><p>Kijk dus altijd <b>waar de zin over gaat</b>: over een vak, of over het dagelijks leven.</p>',
          wanneer:'je in een les of toets een bekend woord tegenkomt dat vreemd lijkt te passen.',
          maak:maakVak },
        { id:'taal-var-leen', naam:'Leenwoorden uit andere talen', kort:'Veel woorden komen uit een andere taal; vaak is er ook een Nederlands woord voor',
          uit:'<p>Het Nederlands heeft veel woorden <b>geleend</b> uit andere talen. Uit het <b>Engels</b> (<i>deadline, team</i>), uit het <b>Frans</b> (<i>cadeau, trottoir</i>), uit het <b>Maleis</b> uit Indonesië (<i>pienter, piekeren</i>) en uit het <b>Jiddisch</b> en Hebreeuws (<i>mazzel, jatten</i>).</p><p>Vaak is er ook een Nederlands woord: een <i>deadline</i> is een <i>uiterste datum</i>, een <i>cadeau</i> is een <i>geschenk</i>. Zo kun je kiezen wat het best past.</p>',
          wanneer:'je een woord tegenkomt dat niet Nederlands klinkt, of een Nederlands woord zoekt.',
          maak:maakLeen },
        { id:'taal-var-verandering', naam:'Taal verandert', kort:'Woorden verdwijnen, komen erbij of krijgen een nieuwe betekenis',
          uit:'<p>Taal blijft niet hetzelfde. Er gebeuren drie dingen.</p><p>Woorden <b>verdwijnen</b>: bijna niemand zegt nog <i>rijwiel</i> of <i>thans</i>. Er komen <b>nieuwe woorden</b> bij: <i>appen, laadpaal</i>. En woorden krijgen een <b>nieuwe betekenis</b>: een <i>muis</i> was alleen een dier, nu ook iets bij je computer. En <i>slim</i> betekende vroeger scheef of slecht.</p>',
          wanneer:'je een oude tekst leest, of een woord dat je opa anders gebruikt dan jij.',
          maak:maakVerander }
      ] }
  ]);

  /* ================= HOE KOM JE OVER ================= */

  /* groepstaal: [zin, groep, de vakwoorden, [gewone woorden uit de zin]] */
  var GROEP = [
    ['Die bal was buitenspel en de scheids gaf toch een penalty.', 'voetballers', 'buitenspel en penalty', ['bal en toch', 'was en gaf']],
    ['Ik moet nog één level halen, dan kan ik de eindbaas verslaan.', 'gamers', 'level en eindbaas', ['moet en halen', 'nog en dan']],
    ['Na de draf ging mijn pony over in galop.', 'ruiters', 'draf en galop', ['na en ging', 'mijn en over']],
    ['In het refrein speel je drie akkoorden.', 'muzikanten', 'refrein en akkoorden', ['speel en drie', 'in en je']],
    ['Blancheer de boontjes en garneer het bord met peterselie.', 'koks', 'blancheren en garneren', ['boontjes en bord', 'het en met']],
    ['De patiënt heeft koorts; ik meet om twaalf uur zijn bloeddruk.', 'verpleegkundigen', 'patiënt en bloeddruk', ['heeft en meet', 'om en zijn']],
    ['Ik rokeer eerst, en dan zet ik hem schaakmat.', 'schakers', 'rokeren en schaakmat', ['eerst en dan', 'zet en hem']],
    ['We gaan overstag en zetten de fok bij.', 'zeilers', 'overstag en fok', ['gaan en zetten', 'we en de']],
    ['Ik doe eerst een ollie en daarna een kickflip.', 'skaters', 'ollie en kickflip', ['doe en daarna', 'eerst en een']],
    ['Er zit een bug in de code, daarom crasht de app.', 'programmeurs', 'bug en code', ['zit en daarom', 'er en de']],
    ['Leg de stenen in halfsteensverband en voeg ze daarna af.', 'metselaars', 'halfsteensverband en voegen', ['leg en daarna', 'stenen en ze']],
    ['De pirouette was mooi, maar je landde niet goed na de sprong.', 'balletdansers', 'pirouette en sprong', ['was en maar', 'mooi en goed']],
    ['De rechter doet over twee weken uitspraak in deze zaak.', 'juristen', 'rechter en uitspraak', ['twee en weken', 'over en deze']]
  ];
  function maakGroep(R){
    var x = R.kies(GROEP), groepen = GROEP.filter(function(y){ return y !== x; }).map(function(y){ return y[1]; });
    return OP({ vraag:x[0], context:'Groepen hebben hun eigen woorden. Aan wie denk je bij deze zin?',
      stappen:[
        K(R, 'Welke woorden horen bij een bepaalde groep?', x[2], x[3], 'Zoek de woorden die je niet in elk gesprek hoort, maar alleen bij één hobby, sport of beroep.'),
        K(R, 'Bij welke groep hoort deze taal?', x[1], ander(R, groepen, [], 2), 'Waar hoor je ' + x[2] + '? Bij welke sport, hobby of welk beroep?') ] });
  }

  /* het goede bericht: [wat je wilt zeggen, aan een vriend, aan je docent, aan een bedrijf] */
  var SITU = [
    ['Je komt later.', 'Ben tien minuutjes later, sorry!', 'Beste meneer Jansen, mijn bus heeft vertraging. Ik kom tien minuten later in de les. Groet, Sam', 'Geachte heer De Vries, door vertraging van de bus ben ik helaas tien minuten later voor ons gesprek. Mijn excuses hiervoor. Met vriendelijke groet, Sam Bakker'],
    ['Je bent ziek.', 'Ben ziek, ik kan vanavond niet mee. Balen!', 'Beste mevrouw Smit, ik ben ziek en kan morgen niet komen voor de toets. Kan ik hem later inhalen? Groet, Noor', 'Geachte mevrouw Visser, helaas ben ik ziek. Daardoor kan ik zaterdag niet komen werken. Ik laat u weten wanneer ik weer beter ben. Met vriendelijke groet, Noor de Wit'],
    ['Je hebt een vraag.', 'Hé, weet jij welke opdracht we voor morgen moeten doen?', 'Beste meneer Ali, ik begrijp opdracht 4 niet goed. Kunt u mij laten weten wat de bedoeling is? Groet, Daan', 'Geachte heer, mevrouw, ik heb een vraag over de vacature voor vakkenvuller. Kunt u mij vertellen hoeveel uur per week ik zou werken? Met vriendelijke groet, Daan Smit'],
    ['Je wilt iemand bedanken.', 'Bedankt voor gisteren, was echt top!', 'Beste mevrouw De Boer, bedankt voor uw hulp bij mijn werkstuk. Ik heb er veel aan gehad. Groet, Mila', 'Geachte heer Peters, hartelijk dank voor het prettige gesprek van vandaag. Ik heb er veel zin in om bij u te beginnen. Met vriendelijke groet, Mila Jansen'],
    ['Je wilt een afspraak maken.', 'Zin om zaterdag bij mij te gamen?', 'Beste meneer Kok, kan ik morgen na de les even met u praten over mijn cijfer? Groet, Yara', 'Geachte mevrouw Mulder, graag maak ik een afspraak voor een kennismakingsgesprek. Ik kan op maandag en woensdag na 15.00 uur. Met vriendelijke groet, Yara Bos'],
    ['Je bent iets kwijt.', 'Heb jij mijn oplader nog? Kan hem nergens vinden.', 'Beste mevrouw Hendriks, ik ben mijn rekenmachine kwijt. Heeft u hem misschien in het lokaal gevonden? Groet, Ravi', 'Geachte heer, mevrouw, ik heb gisteren mijn jas laten liggen in uw restaurant. Is hij misschien gevonden? Met vriendelijke groet, Ravi Kumar'],
    ['Je zegt een afspraak af.', 'Sorry, kan morgen toch niet. Andere keer?', 'Beste meneer De Jong, ik kan morgen helaas niet naar de bijles komen, want ik moet naar de tandarts. Groet, Lotte', 'Geachte mevrouw Kramer, helaas moet ik ons gesprek van donderdag afzeggen. Zou het op een andere dag kunnen? Met vriendelijke groet, Lotte Vermeer'],
    ['Je stuurt iets op.', 'Hier is die foto van het feest!', 'Beste mevrouw Yilmaz, in de bijlage stuur ik mijn verslag. Groet, Jesse', 'Geachte heer Van Dam, in de bijlage vindt u mijn cv en mijn motivatiebrief. Met vriendelijke groet, Jesse Kok']
  ];
  var SITUWIE = ['Je appt je beste vriend.', 'Je mailt je docent.', 'Je mailt een bedrijf waar je graag wilt werken.'];
  var SITULEZER = ['een vriend: je kent hem goed en praat los met hem', 'je docent: je kent hem wel, maar je blijft beleefd', 'iemand van een bedrijf: je kent die persoon niet'];
  var SITUHINT = ['Bij een vriend mag het kort en los, zonder aanhef.', 'Bij je docent schrijf je Beste met de naam, je zegt u, en je zet je voornaam eronder.', 'Bij een bedrijf schrijf je Geachte, je zegt u, en je eindigt met Met vriendelijke groet en je hele naam.'];
  function maakSitu(R){
    var x = R.kies(SITU), i = R.heel(0, 2);
    return OP({ vraag:x[0], context:SITUWIE[i] + ' Welk bericht past?',
      stappen:[
        K(R, 'Wie is de lezer?', SITULEZER[i], SITULEZER.filter(function(y, k){ return k !== i; }), 'Lees aan wie je schrijft. Hoe goed ken je die persoon?'),
        K(R, 'Welk bericht stuur je?', x[i + 1], x.slice(1).filter(function(y, k){ return k !== i; }), SITUHINT[i]) ] });
  }

  /* uitleggen aan verschillende luisteraars: [onderwerp, vak, voor een kind, voor de klas] */
  var PUBL = [
    ['een vulkaan', 'aardrijkskunde', 'Een vulkaan is een berg die van binnen heel heet is. Soms komt er gloeiend heet, vloeibaar steen uit, net als pap die overkookt.', 'Een vulkaan ontstaat waar magma uit de aardmantel door een opening in de aardkorst naar buiten komt.'],
    ['regen', 'aardrijkskunde', 'Water uit de zee wordt warm en gaat de lucht in. Daar worden het wolken. Als een wolk te zwaar wordt, valt het water naar beneden.', 'Door verdamping komt waterdamp in de lucht. Als de damp afkoelt, condenseert hij tot druppels, die als neerslag vallen.'],
    ['fotosynthese', 'biologie', 'Een plant maakt zijn eigen eten. Hij gebruikt daarvoor zonlicht, water en lucht.', 'Bij fotosynthese zet een plant met behulp van zonlicht koolstofdioxide en water om in glucose en zuurstof.'],
    ['verkiezingen', 'maatschappijleer', 'Bij verkiezingen kiezen grote mensen wie er voor het land mag beslissen. Wie de meeste stemmen krijgt, mag meebeslissen.', 'Bij de Tweede Kamerverkiezingen kiezen de kiesgerechtigden 150 volksvertegenwoordigers. De zetels worden verdeeld naar het aantal stemmen.'],
    ['het hart', 'biologie', 'Je hart is een soort pomp. Het duwt je bloed de hele dag door je lijf.', 'Het hart pompt bloed door de bloedvaten. De rechterkant pompt het naar de longen, de linkerkant naar de rest van het lichaam.'],
    ['de seizoenen', 'aardrijkskunde', 'In de zomer staat de zon hoog en is het lang licht. In de winter staat de zon laag en is het vroeg donker.', 'De seizoenen ontstaan doordat de aardas scheef staat. Daardoor vallen de zonnestralen in de loop van het jaar onder een andere hoek op Nederland.'],
    ['een bank', 'economie', 'Een bank bewaart geld voor mensen, net als een hele grote spaarpot.', 'Een bank beheert spaargeld en leent geld uit. Over een lening betaal je rente.'],
    ['eb en vloed', 'aardrijkskunde', 'Het water van de zee komt twee keer per dag een stuk omhoog en gaat dan weer terug.', 'Eb en vloed ontstaan vooral door de aantrekkingskracht van de maan op het water van de oceanen.'],
    ['recyclen', 'biologie', 'Oude flessen en oud papier kun je opnieuw gebruiken. Daar maken ze dan nieuwe dingen van.', 'Bij recycling wordt afval gescheiden ingezameld en verwerkt tot nieuwe grondstoffen.'],
    ['een dijk', 'aardrijkskunde', 'Een dijk is een lange, hoge wal. Die houdt het water tegen, zodat ons land droog blijft.', 'Dijken beschermen het laaggelegen land tegen overstromingen. Een groot deel van Nederland ligt onder zeeniveau.'],
    ['de maan', 'natuurkunde', 'De maan geeft zelf geen licht. De zon schijnt erop, net als een lamp op een bal.', 'De maan weerkaatst zonlicht. Doordat de maan om de aarde draait, zien we steeds een ander deel verlicht: de schijngestalten.'],
    ['spieren', 'biologie', 'Je spieren zijn net elastiekjes in je lijf. Ze trekken aan je botten, zodat je kunt bewegen.', 'Spieren werken in paren. Als de ene spier samentrekt, ontspant de andere, zodat een gewricht kan buigen of strekken.']
  ];
  var PUBLNODIG = ['korte zinnen, makkelijke woorden en een vergelijking met iets wat hij kent', 'de juiste vakwoorden en een precieze uitleg'];
  function maakPubl(R){
    var x = R.kies(PUBL), kind = R.heel(0, 1) === 1, wie = kind ? 'je broertje van zes' : 'je klas, bij een presentatie voor ' + x[1];
    return OP({ vraag:'Leg uit: ' + x[0], context:'Je geeft uitleg over ' + x[0] + ', aan <b>' + wie + '</b>.',
      stappen:[
        K(R, 'Wat heeft deze luisteraar nodig?', PUBLNODIG[kind ? 0 : 1], [PUBLNODIG[kind ? 1 : 0]], 'Kent je luisteraar de vakwoorden al? Een kind van zes niet, je klas bij een presentatie wel.'),
        K(R, 'Welke uitleg kies je?', kind ? x[2] : x[3], [kind ? x[3] : x[2]], kind ? 'Kies de uitleg zonder moeilijke woorden, met iets wat een kind al kent.' : 'Kies de uitleg met de vakwoorden die bij ' + x[1] + ' horen.') ] });
  }

  /* hoe kom je over: [situatie, bericht, soort] */
  var INDRUK = [
    ['Je mailt je docent.', 'Stuur me de opdracht nog een keer.', 'kortaf'],
    ['Je mailt de sportschool.', 'Mijn pas doet het niet. Regel dat even.', 'kortaf'],
    ['Je mailt je mentor.', 'Dit cijfer klopt niet. Verander het.', 'kortaf'],
    ['Je schrijft een briefje aan je buurvrouw.', 'Uw hond blaft te veel. Doe er wat aan.', 'kortaf'],
    ['Je appt je beste vriend.', 'Geachte Daan, hierbij bevestig ik dat ik zaterdag aanwezig zal zijn op uw verjaardag.', 'stijf'],
    ['Je appt je moeder.', 'Geachte moeder, gaarne ontvang ik vanavond een maaltijd zonder spruitjes.', 'stijf'],
    ['Je appt een teamgenoot.', 'Geachte teamgenoot, ik verzoek u vriendelijk mij morgen op te halen voor de training.', 'stijf'],
    ['Je appt je zus.', 'Geachte zuster, mag ik uw oplader lenen? Met vriendelijke groet, Tim', 'stijf'],
    ['Je schrijft een sollicitatiebrief.', 'Ik weet niet of ik goed genoeg ben, maar misschien wil ik het eventueel wel proberen.', 'onzeker'],
    ['Je mailt je docent.', 'Sorry dat ik stoor, misschien is het een domme vraag, maar eigenlijk snap ik het misschien niet helemaal?', 'onzeker'],
    ['Je begint je spreekbeurt.', 'Eh, sorry, ik weet niet of het interessant is, maar ik ga het eigenlijk over honden hebben, denk ik.', 'onzeker'],
    ['Je schrijft een sollicitatiebrief.', 'Ik ben de beste verkoper die u ooit zult vinden. Niemand werkt harder dan ik.', 'opschep'],
    ['Je appt de klassengroep.', 'Ik heb natuurlijk weer het hoogste cijfer van iedereen, zoals altijd.', 'opschep'],
    ['Je stelt jezelf voor bij een nieuw team.', 'Ik ben veel beter dan jullie vorige keeper, dus nu gaan jullie eindelijk winnen.', 'opschep'],
    ['Je mailt je docent.', 'Beste mevrouw Smit, ik begrijp vraag 3 niet goed. Kunt u het morgen nog een keer uitleggen? Alvast bedankt! Groet, Noor', 'passend'],
    ['Je mailt de sportschool.', 'Goedemiddag, mijn pas doet het niet meer. Kunt u mij helpen? Met vriendelijke groet, Sem Bakker', 'passend'],
    ['Je schrijft een briefje aan je buurvrouw.', 'Hallo mevrouw Peters, uw hond blaft overdag vaak. Zullen we samen kijken wat we eraan kunnen doen? Groet, Lisa van nummer 12', 'passend'],
    ['Je schrijft een sollicitatiebrief.', 'Graag werk ik in uw winkel. Ik ben op tijd, vriendelijk en ik leer snel. Ik vertel er graag meer over in een gesprek.', 'passend']
  ];
  var INDRUKKENM = { kortaf:'geen groet, geen vraag en geen bedankje, alleen een bevel', stijf:'heel deftige woorden die je niet tegen iemand zegt die je goed kent',
    onzeker:'veel twijfelwoorden zoals misschien, eigenlijk en sorry', opschep:'de schrijver zegt steeds hoe goed hij zelf is', passend:'een groet, een duidelijke vraag of boodschap en beleefde woorden' };
  var INDRUKNAAM = { kortaf:'kortaf en onbeleefd', stijf:'stijf en afstandelijk', onzeker:'onzeker', opschep:'opschepperig', passend:'vriendelijk en duidelijk' };
  function maakIndruk(R){
    var x = R.kies(INDRUK), s = x[2], rest = ander(R, Object.keys(INDRUKNAAM), [s], 2);
    return OP({ vraag:'Hoe kom je over?', context:x[0] + blok('<i>' + R.schoon(x[1]) + '</i>'),
      stappen:[
        K(R, 'Wat valt op aan de woorden?', INDRUKKENM[s], rest.map(function(k){ return INDRUKKENM[k]; }), 'Lees het bericht alsof jij het krijgt. Staat er een groet en een vraag? Zijn de woorden deftig? Twijfelt de schrijver, of schept hij op?'),
        K(R, 'Hoe komt de schrijver over?', INDRUKNAAM[s], rest.map(function(k){ return INDRUKNAAM[k]; }), 'Stel je voor dat jij dit bericht krijgt. Wat denk je dan over de schrijver?') ] });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'taal-overkomen', niveau:'2F', domein:'schrijven', naam:'Hoe kom je over', kd:['nl7A.a', 'nl7A.b', 'nl7A.c'],
        uit:'Met je woorden laat je zien bij welke groep je hoort en hoe je over wilt komen. Je praat anders tegen een vriend dan tegen een docent of een bedrijf, en anders tegen een kind dan tegen je klas.' },
      doelen:[
        { id:'taal-over-groep', naam:'Groepstaal', kort:'Elke sport, hobby en elk beroep heeft eigen woorden; daaraan herken je de groep',
          uit:'<p>Groepen hebben hun eigen woorden: <b>groepstaal</b>. Voetballers praten over <i>buitenspel</i>, gamers over een <i>level</i>, koks over <i>garneren</i>.</p><p>Met die woorden kun je <b>precies</b> zeggen wat je bedoelt, en je laat horen dat je <b>bij de groep hoort</b>. Iemand van buiten de groep begrijpt ze vaak niet. Leg ze dan even uit.</p>',
          wanneer:'je een gesprek hoort met woorden die bij één hobby, sport of beroep horen.',
          maak:maakGroep },
        { id:'taal-over-situatie', naam:'Het bericht dat past', kort:'Bedenk hoe goed je de lezer kent: vriend, docent of bedrijf, en kies je woorden daarbij',
          uit:'<p>Hetzelfde zeg je op <b>verschillende manieren</b>, afhankelijk van de lezer.</p><p>Aan een <b>vriend</b>: kort en los. Aan je <b>docent</b>: <i>Beste</i> met de naam, <i>u</i>, en je voornaam eronder. Aan een <b>bedrijf</b>: <i>Geachte</i>, <i>u</i>, en <i>Met vriendelijke groet</i> met je hele naam.</p><p>Zo pak je het aan: bedenk eerst hoe goed je de lezer kent. Kies daarna het bericht dat daarbij past.</p>',
          wanneer:'je een appje, mail of brief schrijft.',
          maak:maakSitu },
        { id:'taal-over-publiek', naam:'Uitleggen aan wie luistert', kort:'Voor een kind: korte zinnen en een vergelijking. Voor je klas: de juiste vakwoorden',
          uit:'<p>Leg je iets uit, denk dan aan je <b>luisteraar</b>. Wat weet die al?</p><p>Een <b>jong kind</b> heeft korte zinnen, makkelijke woorden en een <b>vergelijking</b> nodig: <i>je hart is een soort pomp</i>. Bij een <b>presentatie in de klas</b> gebruik je de juiste <b>vakwoorden</b> en ben je precies.</p>',
          wanneer:'je iets moet uitleggen, aan een kind, een volwassene of je klas.',
          maak:maakPubl },
        { id:'taal-over-indruk', naam:'Hoe kom je over?', kort:'Je woorden bepalen hoe je overkomt: kortaf, stijf, onzeker, opschepperig of vriendelijk',
          uit:'<p>Met je woorden bepaal je hoe je <b>overkomt</b>.</p><p>Geen groet en alleen een bevel: <b>kortaf</b>. Deftige woorden tegen je vriend: <b>stijf</b>. Veel <i>misschien</i> en <i>sorry</i>: <b>onzeker</b>. Steeds zeggen hoe goed je bent: <b>opschepperig</b>. Een groet, een duidelijke vraag en beleefde woorden: <b>vriendelijk en duidelijk</b>.</p><p>Lees je bericht na alsof jij het krijgt. Hoe zou jij het vinden?</p>',
          wanneer:'je een bericht naleest voordat je het verstuurt.',
          maak:maakIndruk }
      ] }
  ]);

  /* ================= CREATIEF MET TAAL ================= */

  /* sterke werkwoorden: [zin, sfeer, goed, [past niet], zwak] */
  var WW = [
    ['De inbreker ___ door de donkere gang.', 'stil en voorzichtig: hij wil niet gehoord worden', 'sluipt', ['rent', 'huppelt'], 'loopt'],
    ['Na school ___ Sem op zijn gemak door het park.', 'rustig: hij heeft alle tijd', 'slentert', ['sprint', 'sluipt'], 'loopt'],
    ['De bus vertrekt over een minuut! Eva ___ naar de halte.', 'haast: ze moet heel snel zijn', 'sprint', ['slentert', 'sluipt'], 'gaat'],
    ['Het kleine meisje is blij en ___ over het pad.', 'vrolijk en luchtig', 'huppelt', ['sjokt', 'sluipt'], 'loopt'],
    ['Moe en teleurgesteld ___ de verliezers het veld af.', 'moe en somber', 'sjokken', ['huppelen', 'sprinten'], 'lopen'],
    ['Woedend ___ de man de kamer uit.', 'boos en heftig', 'stormt', ['sluipt', 'slentert'], 'gaat'],
    ['‘Help!’ ___ de jongen.', 'paniek: hij roept zo hard hij kan', 'gilt', ['fluistert', 'mompelt'], 'zegt'],
    ['‘Niet verder vertellen,’ ___ Noor in mijn oor.', 'geheim: niemand anders mag het horen', 'fluistert', ['brult', 'gilt'], 'zegt'],
    ['‘Ik wil niet,’ ___ hij zachtjes en onduidelijk.', 'binnensmonds en chagrijnig', 'mompelt', ['roept', 'gilt'], 'zegt'],
    ['De hongerige hond ___ zijn eten in één keer naar binnen.', 'gulzig en snel', 'schrokt', ['knabbelt', 'proeft'], 'eet'],
    ['Het muisje ___ voorzichtig aan het kaasje.', 'voorzichtig, met kleine hapjes', 'knabbelt', ['schrokt', 'slurpt'], 'eet'],
    ['Het meisje ___ door het sleutelgat, niemand mag haar zien.', 'stiekem kijken', 'gluurt', ['staart', 'tuurt'], 'kijkt'],
    ['Hij ___ uren naar het plafond, want hij kan niet slapen.', 'lang en zonder te bewegen kijken', 'staart', ['gluurt', 'knippert'], 'kijkt'],
    ['Na de val ___ Tim naar de kant, zijn enkel doet pijn.', 'pijn: hij kan niet goed op één been staan', 'strompelt', ['huppelt', 'sprint'], 'loopt'],
    ['De zeeman ___ over het water, op zoek naar land.', 'ingespannen in de verte kijken', 'tuurt', ['gluurt', 'knippert'], 'kijkt']
  ];
  function maakWw(R){
    var x = R.kies(WW), sferen = ander(R, WW.filter(function(y){ return y[2] !== x[2]; }).map(function(y){ return y[1]; }), [], 2), fb = {};
    fb[x[4]] = q(x[4]) + ' past wel, maar zegt bijna niets. Een sterker werkwoord laat de sfeer zien.';
    x[3].forEach(function(f){ fb[f] = q(f) + ' is wel sterk, maar past niet bij de sfeer: ' + x[1] + '.'; });
    return OP({ vraag:x[0], context:'Kies het werkwoord dat het best bij de sfeer past.',
      beeld:function(n){ return n >= 2 ? vulZin(R, x[0], x[2], 'sterk werkwoord') : ''; },
      stappen:[
        K(R, 'Wat is de sfeer van deze zin?', x[1], sferen, 'Lees de woorden om het gat heen. Hoe voelt de persoon zich, en wat wil hij?'),
        K(R, 'Welk werkwoord past het best?', x[2], x[3].concat([x[4]]), 'Kies een werkwoord dat precies laat zien hoe het gaat, passend bij: ' + x[1] + '.', { fout:fb }) ] });
  }

  /* zintuigen. A: [zin, zintuigwoord, zintuig, [gewone woorden]]; B: plekken met een zin per zintuig */
  var ZIN1 = [
    ['De geur van verse broodjes kwam ons bij de bakker tegemoet.', 'geur', 'ruiken', ['bakker', 'kwam']],
    ['Het zand brandde onder mijn blote voeten.', 'brandde', 'voelen', ['zand', 'mijn']],
    ['De soep was zout en een beetje zuur.', 'zout', 'proeven', ['soep', 'beetje']],
    ['In de verte rommelde de donder.', 'rommelde', 'horen', ['verte', 'donder']],
    ['De lucht kleurde oranje en paars boven de zee.', 'oranje', 'zien', ['lucht', 'boven']],
    ['De ijskoude wind sneed in mijn wangen.', 'ijskoude', 'voelen', ['wind', 'mijn']],
    ['Het stonk in de kleedkamer naar oude sokken.', 'stonk', 'ruiken', ['kleedkamer', 'oude']],
    ['De chocolade smolt zoet op mijn tong.', 'zoet', 'proeven', ['chocolade', 'mijn']],
    ['Ergens in het huis kraakte een vloerplank.', 'kraakte', 'horen', ['ergens', 'huis']],
    ['Het gras glinsterde van de dauw.', 'glinsterde', 'zien', ['gras', 'dauw']],
    ['De vacht van de kat was zacht als fluweel.', 'zacht', 'voelen', ['vacht', 'kat']],
    ['De citroen was zo zuur dat ik mijn gezicht vertrok.', 'zuur', 'proeven', ['citroen', 'gezicht']],
    ['Het publiek joelde en floot.', 'joelde', 'horen', ['publiek', 'het']],
    ['Felle lichten flitsten over het podium.', 'flitsten', 'zien', ['podium', 'over']],
    ['De hele straat rook naar barbecue.', 'rook', 'ruiken', ['straat', 'hele']]
  ];
  var ZIN2 = [
    ['het strand', { zien:'De zee glinstert in de felle zon.', horen:'Meeuwen krijsen boven de golven.', ruiken:'Het ruikt naar zout en zonnebrand.', voelen:'Het warme zand kriebelt tussen je tenen.', proeven:'Je proeft zout op je lippen.' }],
    ['de kermis', { zien:'Overal knipperen gekleurde lampjes.', horen:'Harde muziek dreunt uit de botsauto’s.', ruiken:'Het ruikt naar suikerspin en frituur.', voelen:'Je vingers plakken van de suikerspin.', proeven:'De suikerspin smelt zoet op je tong.' }],
    ['het bos in de herfst', { zien:'Rode en gele bladeren dwarrelen naar beneden.', horen:'De bladeren ritselen onder je voeten.', ruiken:'Het ruikt naar natte aarde en paddenstoelen.', voelen:'De koude wind prikt in je gezicht.' }],
    ['de kantine', { zien:'Lange rijen leerlingen staan voor de balie.', horen:'Iedereen praat en lacht door elkaar.', ruiken:'Het ruikt naar tosti’s en patat.', voelen:'Je wordt geduwd in de drukke rij.', proeven:'De tosti is heet en zout.' }],
    ['het zwembad', { zien:'Het blauwe water glinstert onder de lampen.', horen:'Kinderen gillen en de badmeester fluit.', ruiken:'Het ruikt sterk naar chloor.', voelen:'Het koude water prikt op je huid.' }],
    ['de bakkerij', { zien:'In de vitrine liggen glanzende taartjes.', horen:'De deurbel rinkelt bij elke klant.', ruiken:'Het ruikt naar warm brood.', proeven:'Het krentenbroodje is zacht en zoet.' }],
    ['het stadion', { zien:'Overal wapperen rode vlaggen.', horen:'Duizenden fans zingen en klappen.', ruiken:'Het ruikt naar friet en vers gemaaid gras.', voelen:'De tribune trilt als er gescoord wordt.' }],
    ['een onweersbui', { zien:'Een felle flits verlicht de hemel.', horen:'De donder rommelt over het dak.', voelen:'Grote, koude druppels slaan in je gezicht.', ruiken:'Het ruikt naar natte straat.' }]
  ];
  var ZINTUIGEN = ['zien', 'horen', 'ruiken', 'voelen', 'proeven'];
  function maakZintuig(R){
    if (R.heel(0, 1)){
      var x = R.kies(ZIN1), re = new RegExp('\\b(' + x[1] + ')\\b', 'i');
      return OP({ vraag:x[0], context:'Een goede beschrijving laat je iets zien, horen, ruiken, voelen of proeven.',
        beeld:function(n){ return n >= 1 ? '<div class="lr-tekst"><p>' + R.schoon(x[0]).replace(re, '<mark>$1</mark>') + '</p></div>' : ''; },
        stappen:[
          K(R, 'Welk woord gaat over een zintuig?', x[1], x[3], 'Zoek het woord dat zegt hoe iets eruitziet, klinkt, ruikt, voelt of smaakt.'),
          K(R, 'Welk zintuig gebruikt de schrijver?', x[2], ander(R, ZINTUIGEN, [x[2]], 2), 'Met welk deel van je lichaam merk je ' + q(x[1]) + '? Ogen, oren, neus, huid of tong?') ] });
    }
    var p = R.kies(ZIN2), zt = Object.keys(p[1]), z = R.kies(zt), fout = ander(R, zt, [z], 2);
    return OP({ vraag:'Laat de lezer ' + z + ': ' + p[0], context:'Je beschrijft ' + p[0] + '. Je wilt dat de lezer het kan <b>' + z + '</b>. Welke zin kies je?',
      stappen:[
        K(R, 'Met welk deel van je lichaam ' + (z === 'zien' ? 'zie' : z === 'horen' ? 'hoor' : z === 'ruiken' ? 'ruik' : z === 'voelen' ? 'voel' : 'proef') + ' je?', { zien:'je ogen', horen:'je oren', ruiken:'je neus', voelen:'je huid', proeven:'je tong' }[z],
          ander(R, ['je ogen', 'je oren', 'je neus', 'je huid', 'je tong'], [{ zien:'je ogen', horen:'je oren', ruiken:'je neus', voelen:'je huid', proeven:'je tong' }[z]], 2), 'Zien doe je met je ogen, horen met je oren, ruiken met je neus, voelen met je huid en proeven met je tong.'),
        K(R, 'Welke zin laat de lezer ' + z + '?', p[1][z], fout.map(function(k){ return p[1][k]; }), 'Zoek de zin die zegt hoe het ' + { zien:'eruitziet', horen:'klinkt', ruiken:'ruikt', voelen:'voelt', proeven:'smaakt' }[z] + '.') ] });
  }

  /* vergelijkingen: [zin, eigenschap, goed, tegenovergesteld, past niet] */
  var VERGL = [
    ['Hij rende zo snel als ___.', 'snel', 'een cheeta', 'een slak', 'een boom'],
    ['Haar handen waren zo koud als ___.', 'koud', 'ijsblokjes', 'een kachel', 'een boek'],
    ['De gang was zo donker als ___.', 'donker', 'een nacht zonder maan', 'een zonnige dag', 'een stoel'],
    ['Mijn tas is zo zwaar als ___.', 'zwaar', 'een zak cement', 'een veertje', 'een liedje'],
    ['Het meisje was zo stil als ___.', 'stil', 'een muis', 'een fanfare', 'een appel'],
    ['Zijn hoofd werd zo rood als ___.', 'rood', 'een tomaat', 'een wolk', 'een fluit'],
    ['Het water was zo helder als ___.', 'helder', 'glas', 'modder', 'een broodje'],
    ['De vloer was zo glad als ___.', 'glad', 'een ijsbaan', 'schuurpapier', 'een kussen'],
    ['Zijn stem klonk zo hard als ___.', 'luid', 'een misthoorn', 'een fluistering', 'een schoen'],
    ['Haar haar was zo zacht als ___.', 'zacht', 'zijde', 'staalwol', 'een vork'],
    ['Het oude brood was zo hard als ___.', 'hard', 'een baksteen', 'een spons', 'een liedje'],
    ['In de auto was het zo heet als ___.', 'heet', 'een oven', 'een koelkast', 'een potlood'],
    ['De baby was zo licht als ___.', 'licht', 'een veertje', 'een olifant', 'een raam'],
    ['De weg was zo recht als ___.', 'recht', 'een liniaal', 'een kurkentrekker', 'een sok'],
    ['Hij was zo sterk als ___.', 'sterk', 'een beer', 'een rietje', 'een kopje'],
    ['Het kussen was zo wit als ___.', 'wit', 'verse sneeuw', 'roet', 'een fiets']
  ];
  function maakVergl(R){
    var x = R.kies(VERGL), eig = ander(R, VERGL.filter(function(y){ return y[1] !== x[1]; }).map(function(y){ return y[1]; }), [], 2), fb = {};
    fb[x[3]] = q(x[3]) + ' is juist het omgekeerde van ' + x[1] + '.'; fb[x[4]] = q(x[4]) + ' heeft niets met ' + x[1] + ' te maken.';
    return OP({ vraag:x[0], context:'Maak de vergelijking af. Kies wat het best past.',
      beeld:function(n){ return n >= 2 ? vulZin(R, x[0], x[2], 'ook ' + x[1]) : ''; },
      stappen:[
        K(R, 'Welke eigenschap wil de schrijver laten zien?', x[1], eig, 'Kijk naar het woord tussen zo en als.'),
        K(R, 'Wat is ook heel erg ' + x[1] + '?', x[2], [x[3], x[4]], 'Een goede vergelijking kiest iets wat iedereen kent en wat echt ' + x[1] + ' is.', { fout:fb }) ] });
  }

  /* rijm: [regel 1, regel 2 met ___, goed, rijmt niet, rijmt maar klopt niet, rijmt maar te lang (mag null)] */
  var RIJM = [
    ['Mijn hond is klein en heel erg wit,', 'hij slaapt het liefst daar waar ik ___.', 'zit', 'lig', 'pit', null],
    ['In de winter is het koud,', 'dan stook ik vuur met droog ___.', 'hout', 'papier', 'zout', 'eikenhout'],
    ['Ik zit met oma in het café,', 'zij drinkt een kopje warme ___.', 'thee', 'melk', 'zee', 'kamillethee'],
    ['Ik zoek mijn sleutel overal,', 'hij ligt vast ergens in de ___.', 'hal', 'gang', 'bal', null],
    ['De vogel zingt zijn mooiste lied,', 'maar de kat op het dak hoort het ___.', 'niet', 'nooit', 'riet', null],
    ['Ik ren naar huis, het is al laat,', 'mijn vader wacht al op de ___.', 'straat', 'stoep', 'graat', null],
    ['Het regent hard, de lucht is grijs,', 'ik blijf maar thuis, dat is wel ___.', 'wijs', 'slim', 'ijs', null],
    ['In de zomer gaan we naar het strand,', 'we bouwen kastelen van nat ___.', 'zand', 'grind', 'hand', 'strandzand'],
    ['Het is nacht en heel erg stil,', 'ik slaap pas als ik dat zelf ___.', 'wil', 'kies', 'bril', null],
    ['Daar komt de trein, hij is te laat,', 'en iedereen op het perron is ___.', 'kwaad', 'boos', 'zaad', null],
    ['De bakker bakt het lekkerste brood,', 'zijn winkel is niet klein, maar ___.', 'groot', 'enorm', 'boot', 'reuzegroot'],
    ['We spelen buiten op het plein,', 'de zon is warm, het is heel ___.', 'fijn', 'leuk', 'trein', null],
    ['Ik eet een appel, rood en rond,', 'ik neem een hap, hij is ___.', 'gezond', 'lekker', 'hond', 'kerngezond']
  ];
  function maakRijm(R){
    var x = R.kies(RIJM), w1 = x[0].replace(/[.,!?]$/, '').split(' '), eind = w1[w1.length - 1];
    var fb = {}; fb[x[3]] = q(x[3]) + ' past wel bij de betekenis, maar rijmt niet op ' + q(eind) + '.'; fb[x[4]] = q(x[4]) + ' rijmt wel, maar de zin klopt dan niet.';
    if (x[5]) fb[x[5]] = q(x[5]) + ' rijmt en klopt, maar heeft te veel lettergrepen: het ritme loopt niet meer.';
    var anderW = ander(R, w1.slice(0, -1).filter(function(w){ return w.length > 2; }).map(function(w){ return w.replace(/[.,]/g, ''); }), [eind], 2);
    return OP({ vraag:x[0] + ' ' + x[1], vraagHtml:R.schoon(x[0]) + '<br>' + R.schoon(x[1]), context:'Maak het gedichtje af. Het woord moet rijmen, kloppen en in het ritme passen.',
      beeld:function(n){ return n >= 2 ? '<div class="lr-tekst"><p>' + R.schoon(x[0]) + '<br>' + R.schoon(x[1]).replace('___', '<mark>' + R.schoon(x[2]) + '</mark>') + '</p></div>' : ''; },
      stappen:[
        K(R, 'Op welk woord moet het rijmen?', eind, anderW, 'Eindrijm zit aan het eind van de regels. Kijk naar het laatste woord van de eerste regel.'),
        K(R, 'Welk woord rijmt, klopt en past in het ritme?', x[2], [x[3], x[4]].concat(x[5] ? [x[5]] : []), 'Controleer drie dingen: rijmt het op ' + q(eind) + ', klopt de zin, en is het niet langer dan nodig?', { fout:fb }) ] });
  }

  /* laten zien: [wie, gevoel, vertelzin, laat-zien-zin, laat ander gevoel zien] */
  var TONEN = [
    ['Tim', 'zenuwachtig', 'Tim was zenuwachtig.', 'Tims handen trilden en hij beet op zijn nagels.', 'Tim gaapte en rekte zich uit.'],
    ['Lisa', 'boos', 'Lisa was boos.', 'Lisa smeet haar tas in de hoek en sloeg de deur hard dicht.', 'Lisa huppelde zingend de trap op.'],
    ['Ahmed', 'blij', 'Ahmed was heel blij.', 'Ahmed sprong in de lucht en kon niet stoppen met lachen.', 'Ahmed staarde stil naar de grond.'],
    ['Noor', 'moe', 'Noor was moe.', 'Noor gaapte, wreef in haar ogen en liet zich op de bank vallen.', 'Noor balde haar vuisten.'],
    ['Daan', 'bang', 'Daan was bang.', 'Daan hield zijn adem in en durfde niet om te kijken.', 'Daan floot een vrolijk liedje.'],
    ['Sara', 'verdrietig', 'Sara was verdrietig.', 'Een traan rolde over Sara’s wang en ze zei de hele middag niets.', 'Sara klapte enthousiast in haar handen.'],
    ['het weer', 'koud', 'Het was koud.', 'Onze adem maakte wolkjes en mijn vingers werden stijf.', 'Het zweet liep over mijn rug.'],
    ['het weer', 'heel warm', 'Het was heel warm.', 'Het zweet liep over mijn rug en het asfalt was zacht van de hitte.', 'Er lag ijs op de ruiten.'],
    ['Sem', 'hongerig', 'Sem had honger.', 'Sems maag knorde en hij keek steeds naar de klok boven de kantine.', 'Sem schoof zijn bord met een vies gezicht weg.'],
    ['Mila', 'verlegen', 'Mila was verlegen.', 'Mila kreeg een rood hoofd en keek naar haar schoenen toen de docent haar naam noemde.', 'Mila stak meteen haar vinger op en praatte luid.'],
    ['mijn kamer', 'rommelig', 'Mijn kamer was rommelig.', 'Op mijn vloer lagen sokken, lege flesjes en drie stapels kleren.', 'Alles in mijn kamer stond netjes op zijn plek.'],
    ['het huis', 'oud', 'Het huis was oud.', 'De verf bladderde van de muren en de trap kraakte bij elke stap.', 'De muren waren spierwit en alles rook nog naar nieuwe verf.'],
    ['opa', 'verbaasd', 'Opa was verbaasd.', 'Opa’s mond viel open en hij zette zijn bril recht om het nog eens te lezen.', 'Opa gaapte en zette de tv uit.'],
    ['Jesse', 'trots', 'Jesse was trots.', 'Jesse hield zijn diploma omhoog en liet het aan iedereen zien.', 'Jesse verstopte zijn rapport snel in zijn tas.'],
    ['de wedstrijd', 'spannend', 'De wedstrijd was spannend.', 'Het hele publiek stond op en niemand durfde te ademen bij de laatste penalty.', 'Het publiek zat te gapen en sommigen gingen al naar huis.']
  ];
  function maakTonen(R){
    var x = R.kies(TONEN);
    return OP({ vraag:hoofd(x[0]) + ': ' + x[1], context:'Je wilt laten zien dat ' + x[0] + ' ' + x[1] + ' is, zonder het woord ' + q(x[1]) + ' te gebruiken.',
      stappen:[
        K(R, 'Welke zin vertelt het alleen maar?', x[2], [x[3], x[4]], 'Een vertelzin noemt het gevoel of de eigenschap gewoon, met een woord als was of had.'),
        K(R, 'Welke zin laat het zien?', x[3], [x[2], x[4]], 'Zoek de zin waarin je ziet wat er gebeurt, zodat je zelf snapt dat het ' + x[1] + ' is.',
          { fout:(function(){ var f = {}; f[x[2]] = 'Deze zin vertelt het alleen. Je ziet niets gebeuren.'; f[x[4]] = 'Deze zin laat wel iets zien, maar een ander gevoel.'; return f; })() }) ] });
  }

  /* eerste zin: [onderwerp, spannend, verklapt het einde] */
  var BEGIN = [
    ['een inbraak', '‘Er is iemand beneden,’ fluisterde mijn zus midden in de nacht.', 'Uiteindelijk bleek de inbreker gewoon onze kat te zijn.'],
    ['verdwalen in het bos', 'Het pad waarover we gekomen waren, was ineens verdwenen.', 'Na een paar uur vonden we gelukkig de weg terug.'],
    ['een weggelopen hond', 'De riem hing nog aan de haak, maar Max was weg.', 'Gelukkig vonden we Max aan het eind van de dag terug.'],
    ['een finale', 'Nog tien seconden, en de bal lag op mijn voet.', 'We wonnen de finale uiteindelijk met 2 tegen 1.'],
    ['een geheime brief', 'Onder mijn kussen lag een brief die ik niet zelf had neergelegd.', 'De brief bleek van mijn beste vriendin te komen.'],
    ['een stroomstoring', 'Precies om acht uur ging in de hele stad het licht uit.', 'Na twee uur deed het licht het gelukkig weer.'],
    ['de eerste schooldag', 'Ik had nog geen voet in de klas gezet, of iedereen begon te lachen.', 'Uiteindelijk werd het toch een heel leuke dag.'],
    ['een ontsnapte slang', 'Het terrarium in het biologielokaal was leeg.', 'De slang werd gelukkig snel teruggevonden in een la.'],
    ['een verdwenen telefoon', 'Mijn telefoon trilde, maar hij zat niet meer in mijn tas.', 'Mijn broer had mijn telefoon gewoon geleend.'],
    ['een vreemde buurman', 'Onze nieuwe buurman komt alleen naar buiten als het donker is.', 'Onze buurman bleek gewoon nachtdiensten te draaien.'],
    ['een storm op zee', 'De eerste golf sloeg over het dek en sleurde de emmer mee.', 'We kwamen gelukkig allemaal veilig aan land.'],
    ['een schoolreis die misgaat', 'De bus stopte midden op de hei, en de chauffeur stapte uit zonder iets te zeggen.', 'Uiteindelijk kwamen we toch nog op tijd bij het pretpark.']
  ];
  var SLEUR = ['Ik werd wakker en at een boterham met kaas.', 'Het was een gewone dag, net als alle andere dagen.', 'Op een dag gebeurde er iets.'];
  function maakBegin(R){
    var x = R.kies(BEGIN), aank = 'Dit verhaal gaat over ' + x[0] + '.', sl = R.kies(SLEUR);
    var fb = {}; fb[aank] = 'Deze zin zegt alleen waar het over gaat. Daar word je niet nieuwsgierig van.'; fb[x[2]] = 'Deze zin verklapt het einde al. Waarom zou je dan nog verder lezen?'; fb[sl] = 'Deze zin is saai: er gebeurt nog niets.';
    return OP({ vraag:'Een verhaal over ' + x[0], context:'Je schrijft een verhaal over ' + x[0] + '. Met welke zin begin je?',
      stappen:[
        K(R, 'Welke zin verklapt al hoe het afloopt?', x[2], [aank, x[1]], 'Zoek de zin met woorden als uiteindelijk, gelukkig of bleek. Die vertelt al hoe het eindigt.'),
        K(R, 'Welke eerste zin maakt je het nieuwsgierigst?', x[1], [aank, x[2], sl], 'Een spannende eerste zin begint midden in de actie, of roept een vraag op die je beantwoord wilt zien.', { fout:fb }) ] });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'creatief-schrijf', niveau:'1F', domein:'schrijven', naam:'Creatief met taal', kd:['nl3B.b', 'nl3B.c'],
        uit:'Met de juiste woorden maak je een verhaal of gedicht levendig. Hier oefen je met sterke werkwoorden, zintuigen, vergelijkingen, rijm, laten zien in plaats van vertellen, en een spannende eerste zin.' },
      doelen:[
        { id:'creatief-werkwoord', naam:'Een sterker werkwoord', kort:'Kies in plaats van lopen of zeggen een werkwoord dat de sfeer laat zien: sluipen, slenteren, fluisteren',
          uit:'<p>Woorden als <i>lopen, zeggen, eten</i> en <i>kijken</i> zeggen weinig. Een <b>sterk werkwoord</b> laat ook zien <b>hoe</b> iets gebeurt.</p><p>Een inbreker <i>sluipt</i>, iemand met alle tijd <i>slentert</i>, wie haast heeft <i>sprint</i>. Een geheim <i>fluister</i> je, een hongerige hond <i>schrokt</i>.</p><p>Zo kies je: bepaal eerst de <b>sfeer</b> van de zin. Kies dan het werkwoord dat daarbij past.</p>',
          wanneer:'je een verhaal schrijft en het levendiger wilt maken.',
          maak:maakWw },
        { id:'creatief-zintuig', naam:'Schrijven met je zintuigen', kort:'Laat de lezer zien, horen, ruiken, voelen of proeven wat er is',
          uit:'<p>Een beschrijving wordt levendig als je je <b>zintuigen</b> gebruikt. Vertel niet alleen wat je <b>ziet</b>, maar ook wat je <b>hoort</b>, <b>ruikt</b>, <b>voelt</b> en <b>proeft</b>.</p><p><i>Het ruikt naar zout en zonnebrand. Het warme zand kriebelt tussen je tenen.</i> Zo staat de lezer zelf op het strand.</p>',
          wanneer:'je een plek of moment beschrijft en de lezer erbij wilt laten zijn.',
          maak:maakZintuig },
        { id:'creatief-vergelijking', naam:'Zelf een vergelijking maken', kort:'Bepaal welke eigenschap je wilt laten zien, en zoek iets wat die eigenschap heel sterk heeft',
          uit:'<p>Met een <b>vergelijking</b> maak je een eigenschap duidelijk: <i>zo koud als ijsblokjes</i>, <i>zo stil als een muis</i>.</p><p>Zo maak je er zelf een: bepaal eerst de <b>eigenschap</b> die je wilt laten zien (koud). Zoek dan iets wat iedereen kent en wat die eigenschap <b>heel sterk</b> heeft (ijsblokjes).</p>',
          wanneer:'je in een verhaal iets extra duidelijk wilt maken.',
          maak:maakVergl },
        { id:'creatief-rijm', naam:'Een rijmwoord kiezen', kort:'Het woord moet rijmen, de zin moet kloppen en het ritme moet blijven lopen',
          uit:'<p>Bij <b>eindrijm</b> klinken de laatste woorden van twee regels hetzelfde: <i>koud</i> en <i>hout</i>.</p><p>Een goed rijmwoord doet drie dingen. Het <b>rijmt</b> op het woord aan het eind van de vorige regel. De zin <b>klopt</b>. En het <b>past in het ritme</b>: niet te veel lettergrepen.</p>',
          wanneer:'je een gedichtje, rap of liedtekst schrijft.',
          maak:maakRijm },
        { id:'creatief-laten-zien', naam:'Laten zien in plaats van vertellen', kort:'Noem het gevoel niet, maar laat zien wat iemand doet: dan voelt de lezer het zelf',
          uit:'<p><i>Tim was zenuwachtig.</i> Die zin <b>vertelt</b> het alleen. Sterker is het om het <b>te laten zien</b>: <i>Tims handen trilden en hij beet op zijn nagels.</i></p><p>Beschrijf wat iemand <b>doet</b>, wat je <b>ziet</b> of <b>hoort</b>. Dan snapt de lezer zelf hoe het zit, en leeft hij meer mee.</p>',
          wanneer:'je een verhaal schrijft en je personages levendiger wilt maken.',
          maak:maakTonen },
        { id:'creatief-eerste-zin', naam:'Een spannende eerste zin', kort:'Begin midden in de actie of met een vraag; verklap het einde niet',
          uit:'<p>De <b>eerste zin</b> bepaalt of de lezer doorleest. Begin <b>midden in de actie</b>, of met iets wat een <b>vraag oproept</b>: <i>De riem hing nog aan de haak, maar Max was weg.</i></p><p>Vermijd een zin die alleen zegt waar het over gaat (<i>Dit verhaal gaat over ...</i>), een saaie opening waarin niets gebeurt, en een zin die <b>het einde verklapt</b>.</p>',
          wanneer:'je aan een verhaal begint.',
          maak:maakBegin }
      ] }
  ]);

  /* ================= ZAKELIJKE GENRES EN OVERTUIGEN ================= */

  var GENRE = {
    nieuwsbericht:{ context:'staat in de krant of op een nieuwssite, kort nadat iets is gebeurd', doel:'wil de lezer snel en zakelijk op de hoogte brengen',
      inhoud:'vertelt wie, wat, waar en wanneer, zonder mening', vorm:'het belangrijkste staat bovenaan, de details komen later' },
    column:{ context:'staat elke week op dezelfde plek, van dezelfde vaste schrijver', doel:'wil de lezer laten lachen en aan het denken zetten',
      inhoud:'een persoonlijke kijk op iets kleins uit het dagelijks leven of het nieuws', vorm:'kort, in de ik-vorm en vaak met humor' },
    recensie:{ context:'verschijnt kort nadat een film, boek of game uitkomt', doel:'wil de lezer helpen kiezen of iets de moeite waard is',
      inhoud:'vertelt kort waar de film, het boek of de game over gaat, en geeft een oordeel met redenen', vorm:'eindigt vaak met een cijfer of een aantal sterren' },
    betoog:{ context:'wordt geschreven als er discussie is over een onderwerp', doel:'wil de lezer overtuigen van een standpunt',
      inhoud:'een standpunt met argumenten, en soms een weerlegd tegenargument', vorm:'inleiding, argumenten en een conclusie die het standpunt herhaalt' },
    advertentie:{ context:'staat tussen andere teksten, in een folder, op een poster of online', doel:'wil dat de lezer iets koopt of doet',
      inhoud:'een product, een prijs of een aanbieding', vorm:'een opvallende kop, korte zinnen, een slogan en de gebiedende wijs' }
  };
  var ASPECT = { context:'de context', doel:'het doel', inhoud:'de inhoud', vorm:'de vorm' };
  var ASPECTTIP = 'Context: waar en wanneer de tekst verschijnt. Doel: wat de schrijver wil. Inhoud: waar het over gaat. Vorm: hoe de tekst eruitziet en geschreven is.';
  function lidw(g){ return (g === 'nieuwsbericht' || g === 'betoog' ? 'het ' : 'de ') + g; }
  function maakKenmerk(R){
    var namen = Object.keys(GENRE), g = R.kies(namen), asp = Object.keys(ASPECT);
    if (R.heel(0, 1)){
      var a = R.hussel(asp).slice(0, 2), andere = namen.filter(function(n){ return n !== g; });
      return OP({ vraag:hoofd(g), context:'Wat hoort bij ' + lidw(g) + '?',
        stappen:a.map(function(x){
          return K(R, 'Wat is ' + ASPECT[x] + ' van ' + lidw(g) + '?', GENRE[g][x], ander(R, andere, [], 2).map(function(n){ return GENRE[n][x]; }), 'Denk aan een ' + g + ' die je weleens gezien hebt. Wat is daar typisch aan?');
        }) });
    }
    var a2 = R.kies(asp), k = GENRE[g][a2];
    return OP({ vraag:hoofd(k), context:'Bij welk genre hoort dit kenmerk?',
      stappen:[
        K(R, 'Gaat dit kenmerk over de context, het doel, de inhoud of de vorm?', ASPECT[a2], waarden(ASPECT, a2), ASPECTTIP),
        K(R, 'Bij welk genre hoort het?', g, ander(R, namen, [g], 3), 'Nieuwsbericht: feiten. Column: persoonlijk en grappig. Recensie: een oordeel over een film, boek of game. Betoog: overtuigen. Advertentie: verkopen.') ] });
  }

  /* taalgebruik: [fragment, vorm] */
  var TAALG = [
    ['Ik heb een hekel aan maandagochtend. Mijn wekker gaat, en ik doe gewoon alsof ik hem niet hoor.', 'ik'],
    ['Ik zag de film gisteren in de bioscoop, en ik heb me geen minuut verveeld.', 'ik'],
    ['Toen ik vorige week de trein miste, besefte ik hoe afhankelijk ik ben van mijn telefoon.', 'ik'],
    ['Ik vind het onzin dat ik mijn fiets elke dag drie straten verderop moet zetten.', 'ik'],
    ['Wij, de leerlingenraad, willen dat de kantine gezonder wordt.', 'wij'],
    ['Wij zijn al dertig jaar een familiebedrijf. Wij bakken elke ochtend vers brood.', 'wij'],
    ['Op onze camping zorgen wij ervoor dat iedereen een fijne vakantie heeft.', 'wij'],
    ['Wij van de natuurclub planten dit jaar honderd nieuwe bomen.', 'wij'],
    ['Kom nu langs en profiteer van de korting!', 'gebied'],
    ['Bestel vandaag en betaal pas volgende maand.', 'gebied'],
    ['Zet de oven op 180 graden en bak de taart veertig minuten.', 'gebied'],
    ['Doe mee aan de sponsorloop en help de kinderboerderij!', 'gebied'],
    ['Heb jij ook altijd koude handen op de fiets? Met deze handschoenen heb je daar nooit meer last van.', 'jij'],
    ['Jij weet vast ook hoe vervelend het is als je bus te laat is.', 'jij'],
    ['Ben jij tussen de 14 en 18 jaar en hou je van dieren? Dan is dit bijbaantje iets voor jou.', 'jij'],
    ['Wist je dat je met een kwartier lezen per dag al veel nieuwe woorden leert?', 'jij'],
    ['In Zwolle is gisteren een nieuwe brug geopend. De brug is bedoeld voor fietsers en voetgangers.', 'zakelijk'],
    ['Volgens het weerbericht valt er morgen in het noorden van het land veel regen.', 'zakelijk'],
    ['De gemeente gaat volgend jaar twintig nieuwe laadpalen plaatsen.', 'zakelijk'],
    ['Bij een brand in een fabriek in Tilburg is niemand gewond geraakt.', 'zakelijk']
  ];
  var TGVORM = { ik:'de ik-vorm: de schrijver vertelt over zichzelf', wij:'de wij-vorm: de schrijver spreekt namens een groep',
    gebied:'de gebiedende wijs: de lezer krijgt een opdracht', jij:'de lezer wordt direct aangesproken met jij of je', zakelijk:'geen ik en geen jij: alleen feiten over anderen' };
  var TGEFFECT = { ik:'het voelt persoonlijk: je leest de ervaring of mening van één mens', wij:'je hoort een hele groep spreken: dat voelt als samen, en klinkt sterker dan één persoon',
    gebied:'de lezer wordt aangezet om meteen iets te gaan doen', jij:'de lezer voelt zich persoonlijk aangesproken', zakelijk:'de tekst klinkt objectief en betrouwbaar' };
  function maakTaalg(R){
    var x = R.kies(TAALG), s = x[1], rest = ander(R, Object.keys(TGVORM), [s], 2);
    return OP({ vraag:'Welke vorm, en waarom?', context:blok(R.schoon(x[0])),
      stappen:[
        K(R, 'Welke vorm valt op?', TGVORM[s], rest.map(function(k){ return TGVORM[k]; }), 'Kijk naar de persoonsvormen en de voornaamwoorden. Staat er ik, wij, jij of je? Of begint een zin met een werkwoord, als een opdracht?'),
        K(R, 'Wat bereikt de schrijver daarmee?', TGEFFECT[s], rest.map(function(k){ return TGEFFECT[k]; }), 'Bij ' + TGVORM[s].split(':')[0] + ': hoe voelt dat voor jou als lezer?') ] });
  }

  /* gevoel oproepen: [fragment, middel, gevoel, [foute gevoelens]] */
  var GEVOEL = [
    ['Het is schandalig en walgelijk dat kippen nog steeds in piepkleine hokken worden opgepropt.', 'emo', 'boosheid', ['vrolijkheid', 'verlangen']],
    ['Duizenden hulpeloze, uitgehongerde pups wachten in de kou op een liefdevol thuis.', 'emo', 'medelijden', ['jaloezie', 'vrolijkheid']],
    ['Een heerlijk zonnig strand, kristalhelder water en zalige rust: dat is jouw droomvakantie.', 'emo', 'verlangen', ['angst of bezorgdheid', 'boosheid']],
    ['Deze levensgevaarlijke kruising is elke dag een groot risico voor onze kinderen.', 'emo', 'angst of bezorgdheid', ['vrolijkheid', 'verlangen']],
    ['Vorig jaar fietste mijn zusje naar school. Op de kruising werd ze aangereden door een auto die veel te hard reed. Ze lag drie weken in het ziekenhuis.', 'pers', 'angst of bezorgdheid', ['trots', 'verveling']],
    ['Mijn opa woont al jaren alleen. Soms praat hij een hele week met niemand.', 'pers', 'medelijden', ['jaloezie', 'vrolijkheid']],
    ['Toen ik twaalf was, kon ik nog niet zwemmen. Op elk schoolfeest bij het water stond ik alleen aan de kant.', 'pers', 'medelijden', ['boosheid', 'verlangen']],
    ['Mijn moeder werkt in de zorg. Ze komt vaak doodmoe thuis, omdat er te weinig collega’s zijn.', 'pers', 'medelijden', ['vrolijkheid', 'trots']],
    ['Het oude dierenasiel is een gevangenis zonder hoop voor honderden honden.', 'beeld', 'medelijden', ['trots', 'vrolijkheid']],
    ['De nieuwe sportschoen voelt als een wolk onder je voeten.', 'beeld', 'verlangen', ['boosheid', 'medelijden']],
    ['Onze oceanen veranderen langzaam in een soep van plastic.', 'beeld', 'angst of bezorgdheid', ['vrolijkheid', 'verlangen']],
    ['Wil jij dat je kleine broertje straks opgroeit in een wereld zonder bijen?', 'vraag', 'angst of bezorgdheid', ['vrolijkheid', 'verlangen']],
    ['Hoe zou jij je voelen als de hele klas je elke dag uitlachte?', 'vraag', 'medelijden', ['trots', 'verveling']],
    ['Wie wil er nou niet elke ochtend uitgerust wakker worden?', 'vraag', 'verlangen', ['boosheid', 'angst of bezorgdheid']],
    ['Vind jij het normaal dat een gezin hier geen geld heeft voor eten?', 'vraag', 'boosheid', ['vrolijkheid', 'verlangen']]
  ];
  var MIDDEL = { emo:'emotionele woorden', pers:'een persoonlijk verhaal', beeld:'beeldspraak', vraag:'een vraag aan de lezer waarop het antwoord al vastligt' };
  var MIDDELTIP = { emo:'Zoek woorden die een sterk gevoel geven, zoals schandalig, hulpeloos of heerlijk.', pers:'Vertelt de schrijver iets wat hij of iemand die hij kent echt heeft meegemaakt?',
    beeld:'Wordt iets vergeleken met iets anders, of iets anders genoemd dan het is?', vraag:'Stelt de schrijver een vraag waarop jij het antwoord al weet?' };
  function maakGevoel(R){
    var x = R.kies(GEVOEL);
    return OP({ vraag:'Hoe roept de tekst gevoel op?', context:blok(R.schoon(x[0])),
      stappen:[
        K(R, 'Welk middel gebruikt de schrijver?', MIDDEL[x[1]], waarden(MIDDEL, x[1]), MIDDELTIP[x[1]]),
        K(R, 'Welk gevoel wil de schrijver bij de lezer oproepen?', x[2], x[3], 'Hoe voel jij je na het lezen? Dat gevoel wilde de schrijver bij je oproepen.') ] });
  }

  /* de context van een betoog */
  var CTX = [
    { st:'Snoepautomaten moeten uit de school.', bron:'Een stuk in de schoolkrant, geschreven door de schooltandarts, een week nadat een onderzoek naar gaatjes bij leerlingen was verschenen.',
      voor:'leerlingen, ouders en docenten van de school', nu:'er is net een onderzoek naar gaatjes bij leerlingen verschenen', wie:'hij weet als tandarts veel over tanden en suiker' },
    { st:'Er moet een nieuw skatepark in de wijk komen.', bron:'Een brief aan de gemeenteraad van een groep jongeren uit de wijk, vlak nadat het oude skatepark was afgebroken.',
      voor:'de gemeenteraad', nu:'het oude skatepark is net afgebroken', wie:'ze gebruiken het skatepark zelf' },
    { st:'Koop dit jaar geen vuurwerk.', bron:'Een advertentie van een organisatie voor dierenbescherming, eind december.',
      voor:'iedereen die vuurwerk wil kopen', nu:'oud en nieuw komt eraan', wie:'het is een organisatie die opkomt voor dieren' },
    { st:'De supermarkt moet ook op zondag open mogen.', bron:'Een brief in de dorpskrant van de eigenaar van de supermarkt, een week voordat de gemeenteraad over de openingstijden beslist.',
      voor:'de inwoners van het dorp en de gemeenteraad', nu:'de gemeenteraad beslist binnenkort over de openingstijden', wie:'hij verdient zelf geld als de winkel vaker open is' },
    { st:'Leerlingen moeten hun telefoon thuislaten.', bron:'Een mail van de directeur aan alle ouders, aan het begin van het schooljaar.',
      voor:'de ouders van alle leerlingen', nu:'het nieuwe schooljaar begint en er komen nieuwe regels', wie:'zij is de baas van de school en maakt de regels' },
    { st:'De zomervakantie moet korter.', bron:'Een opiniestuk in een landelijke krant van een onderwijsonderzoeker, in de laatste week van de zomervakantie.',
      voor:'krantenlezers die belangstelling hebben voor onderwijs', nu:'de zomervakantie is bijna voorbij', wie:'hij doet onderzoek naar hoe leerlingen leren' },
    { st:'Elke fietser moet een helm dragen.', bron:'Een stuk op de website van een helmenfabrikant, vlak na een nieuwsbericht over fietsongelukken.',
      voor:'bezoekers van de website die misschien een helm willen kopen', nu:'er was net nieuws over fietsongelukken', wie:'het bedrijf verkoopt zelf helmen' },
    { st:'Er moeten meer bankjes in het park komen.', bron:'Een brief in de wijkkrant van een groep ouderen uit de buurt, aan het begin van het voorjaar.',
      voor:'de bewoners van de wijk en de gemeente', nu:'het voorjaar begint en mensen gaan weer naar buiten', wie:'ze lopen vaak in het park en moeten onderweg uitrusten' },
    { st:'Het zwembad mag niet dicht.', bron:'Een stuk in de krant van de voorzitter van de zwemclub, een dag nadat de gemeente had gezegd dat het zwembad misschien sluit.',
      voor:'de inwoners van de stad en de gemeenteraad', nu:'de gemeente zei net dat het zwembad misschien dichtgaat', wie:'zij is voorzitter van de club die het zwembad gebruikt' },
    { st:'Jongeren moeten gaan stemmen.', bron:'Een filmpje op sociale media van een bekende rapper, een week voor de verkiezingen.',
      voor:'jongeren die de rapper volgen', nu:'de verkiezingen zijn over een week', wie:'hij is bekend bij jongeren en zij volgen hem' },
    { st:'De school moet zonnepanelen op het dak leggen.', bron:'Een brief van de leerlingenraad aan de directie, na een projectweek over het klimaat.',
      voor:'de directie van de school', nu:'de leerlingen hadden net een projectweek over het klimaat', wie:'ze zijn leerlingen die namens alle leerlingen spreken' },
    { st:'Melk hoort bij een gezond ontbijt.', bron:'Een advertentie van een zuivelbedrijf, in de week waarin veel scholen samen ontbijten.',
      voor:'ouders die het ontbijt voor hun kinderen klaarmaken', nu:'veel scholen houden die week een gezamenlijk ontbijt', wie:'het bedrijf verkoopt zelf melk en yoghurt' }
  ];
  function maakCtx(R){
    var x = R.kies(CTX), rest = ander(R, CTX.filter(function(y){ return y !== x; }), [], 2);
    return OP({ vraag:x.st, context:'Lees waar en wanneer dit standpunt verscheen.' + blok(R.schoon(x.bron)),
      stappen:[
        K(R, 'Voor wie is de tekst bedoeld?', x.voor, rest.map(function(y){ return y.voor; }), 'Kijk waar de tekst staat, of aan wie hij gestuurd is. Wie leest die krant, mail of site?'),
        K(R, 'Waarom verschijnt de tekst juist nu?', x.nu, rest.map(function(y){ return y.nu; }), 'Zoek in de beschrijving wanneer de tekst verscheen en wat er net gebeurd was.'),
        K(R, 'Wat moet je weten over de schrijver?', x.wie, rest.map(function(y){ return y.wie; }), 'Kijk wie de schrijver is. Weet hij er veel van, verdient hij er zelf aan, of hoort hij bij de groep waar het over gaat?') ] });
  }

  /* vorm en doel: [tekst met vorm, doel, waarom het past] */
  var VORMDOEL = [
    ['Een nieuwsbericht zet het belangrijkste in de eerste zin.', 'informeren', 'veel lezers lezen alleen het begin, en weten dan toch het belangrijkste'],
    ['Een nieuwsbericht heeft geen ik en geen mening.', 'informeren', 'zo komt het nieuws objectief en betrouwbaar over'],
    ['Een voorlichtingsfolder heeft veel tussenkopjes.', 'informeren', 'de lezer vindt snel het stukje dat hij zoekt'],
    ['Een recensie eindigt met een aantal sterren.', 'informeren', 'de lezer ziet in één keer hoe goed de film of het boek is'],
    ['Een advertentie heeft een grote kop en heel korte zinnen.', 'activeren', 'je kijkt er maar even naar, dus de boodschap moet in één oogopslag duidelijk zijn'],
    ['Een advertentie roept: ‘Bestel nu!’', 'activeren', 'de gebiedende wijs zet de lezer aan om meteen iets te doen'],
    ['Een oproep voor een sponsorloop eindigt met een datum en een adres.', 'activeren', 'de lezer weet meteen waar en wanneer hij mee kan doen'],
    ['Een handleiding gebruikt genummerde stappen.', 'instrueren', 'je weet precies wat je in welke volgorde moet doen'],
    ['Een recept begint met een lijstje ingrediënten.', 'instrueren', 'je kunt alles klaarzetten voordat je begint'],
    ['Een betoog eindigt met een conclusie die het standpunt herhaalt.', 'overtuigen', 'de lezer onthoudt goed wat de schrijver vindt'],
    ['Een betoog noemt een tegenargument en weerlegt het.', 'overtuigen', 'de lezer ziet dat de schrijver ook aan de andere kant heeft gedacht'],
    ['Een betoog geeft argumenten met cijfers uit onderzoek.', 'overtuigen', 'feiten maken het standpunt sterker en moeilijker om tegen te spreken'],
    ['Een column begint met een grappig voorval.', 'amuseren', 'de lezer moet lachen en wil meteen verder lezen'],
    ['Een spannend verhaal stopt een hoofdstuk op het spannendste moment.', 'amuseren', 'de lezer wil weten hoe het afloopt en leest door']
  ];
  var DOELEN5 = ['informeren', 'overtuigen', 'amuseren', 'activeren', 'instrueren'];
  function maakVormdoel(R){
    var x = R.kies(VORMDOEL), anderW = ander(R, VORMDOEL.filter(function(y){ return y[1] !== x[1]; }).map(function(y){ return y[2]; }), [], 2);
    return OP({ vraag:x[0], context:'Waarom kiest de schrijver voor deze vorm?',
      stappen:[
        K(R, 'Wat is het doel van deze tekst?', x[1], ander(R, DOELEN5, [x[1]], 3), 'Informeren: de lezer weet iets. Overtuigen: de lezer vindt iets. Amuseren: de lezer vermaakt zich. Activeren: de lezer gaat iets doen. Instrueren: de lezer kan iets.'),
        K(R, 'Waarom past deze vorm bij dat doel?', x[2], anderW, 'Het doel is ' + x[1] + '. Welke uitleg laat zien hoe de vorm daarbij helpt?') ] });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'taal-genre', niveau:'3F', domein:'lezen', naam:'Zakelijke genres en overtuigen', kd:['nl6C.a', 'nl6C.b', 'nl6A.d', 'nl6D.b', 'nl6D.d'],
        uit:'Elk genre heeft eigen kenmerken: een eigen doel, inhoud, vorm en taalgebruik. En wie wil overtuigen, speelt in op je gevoel en schrijft op een bepaald moment voor een bepaald publiek.' },
      doelen:[
        { id:'taal-genre-kenmerk', naam:'Kenmerken van een genre', kort:'Elk genre heeft een eigen context, doel, inhoud en vorm',
          uit:'<p>Een <b>genre</b> is een soort tekst: een <b>nieuwsbericht</b>, <b>column</b>, <b>recensie</b>, <b>betoog</b> of <b>advertentie</b>. Je herkent het aan vier dingen.</p><p>De <b>context</b>: waar en wanneer de tekst verschijnt. Het <b>doel</b>: wat de schrijver wil. De <b>inhoud</b>: waar het over gaat. De <b>vorm</b>: hoe de tekst eruitziet en geschreven is.</p><p>Een column staat bijvoorbeeld elke week op dezelfde plek (context), wil je laten lachen en nadenken (doel), geeft een persoonlijke kijk (inhoud) en is kort, in de ik-vorm (vorm).</p>',
          wanneer:'je moet bepalen wat voor tekst je leest, of zelf een genre moet schrijven.',
          maak:maakKenmerk },
        { id:'taal-genre-taalgebruik', naam:'Taalgebruik van een genre', kort:'Ik-vorm, wij-vorm, jij-vorm, gebiedende wijs of zakelijk: elke keuze heeft een effect',
          uit:'<p>Genres herken je ook aan hun <b>taalgebruik</b>, en elke keuze heeft een <b>effect</b> op de lezer.</p><p>De <b>ik-vorm</b> voelt persoonlijk (column, recensie). De <b>wij-vorm</b> laat een groep spreken. De <b>gebiedende wijs</b> zet je aan tot actie (advertentie, recept). De <b>jij-vorm</b> spreekt je persoonlijk aan. <b>Zakelijk</b>, zonder ik of jij, klinkt objectief (nieuwsbericht).</p>',
          wanneer:'je wilt begrijpen waarom een tekst op jou werkt zoals hij werkt.',
          maak:maakTaalg },
        { id:'taal-genre-gevoel', naam:'Hoe een tekst gevoel oproept', kort:'Emotionele woorden, een persoonlijk verhaal, beeldspraak of een vraag aan de lezer',
          uit:'<p>Wie wil overtuigen, probeert ook je <b>gevoel</b> te raken. Dat gaat op vier manieren.</p><p><b>Emotionele woorden</b>: <i>schandalig, hulpeloos, heerlijk</i>. Een <b>persoonlijk verhaal</b>: <i>Vorig jaar werd mijn zusje aangereden.</i> <b>Beeldspraak</b>: <i>een soep van plastic</i>. Een <b>vraag aan de lezer</b> waarop het antwoord al vastligt: <i>Wie wil er nou niet ...?</i></p><p>Herken je het middel, dan kun je zelf beslissen of je je laat meeslepen.</p>',
          wanneer:'je een betoog, oproep of advertentie leest.',
          maak:maakGevoel },
        { id:'taal-genre-context', naam:'De context van een betoog', kort:'Vraag je af wie schrijft, voor wie, en waarom juist nu',
          uit:'<p>Een betoog staat nooit los. Kijk naar de <b>context</b>: <b>wie</b> schrijft het, <b>voor wie</b>, en <b>waarom juist nu</b>?</p><p>Een supermarkteigenaar die wil dat zijn winkel op zondag open mag, verdient daar zelf aan. Een tandarts die tegen snoep is, weet veel van tanden. Een brief die verschijnt vlak voor de gemeente beslist, wil die beslissing beïnvloeden.</p><p>Met de context begrijp je beter <b>waarom</b> iemand iets vindt.</p>',
          wanneer:'je een mening leest en wilt weten hoe je die moet wegen.',
          maak:maakCtx },
        { id:'taal-genre-vorm', naam:'Vorm past bij het doel', kort:'De schrijver kiest de vorm die het doel van de tekst het best helpt',
          uit:'<p>Een schrijver kiest de <b>vorm</b> die past bij het <b>doel</b>.</p><p>Een nieuwsbericht wil <b>informeren</b>, dus het belangrijkste staat bovenaan. Een advertentie wil je iets laten <b>doen</b>, dus korte zinnen en <i>Bestel nu!</i> Een handleiding wil <b>instrueren</b>, dus genummerde stappen.</p><p>Zo pak je het aan: bepaal eerst het doel. Vraag je dan af hoe de vorm dat doel helpt.</p>',
          wanneer:'je moet uitleggen waarom een tekst zo is opgebouwd.',
          maak:maakVormdoel }
      ] }
  ]);

})();
