/* De leerroute Nederlands, lezen: woordenschat, teksten begrijpen (onderwerp, hoofdgedachte,
   tekstdoel, alinea's, signaalwoorden, verwijswoorden, argumenten, structuren, samenvatten,
   drogredenen) en verhalen en gedichten. Elke strategie een eigen doel.
   Alle teksten zijn voor deze leerroute geschreven. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';

  /* ---------- hulpjes ---------- */
  function q(w){ return '‘' + w + '’'; }
  /* [woord] wordt <mark>woord</mark> */
  function mk(s){ return String(s).replace(/\[([^\]]+)\]/g, '<mark>$1</mark>'); }
  function kaal(s){ return String(s).replace(/\[([^\]]+)\]/g, '$1').replace(/<[^>]+>/g, ''); }
  /* een leestekst: alinea's (lijst of een tekst), met een titel als je wilt */
  function tekst(alineas, titel){
    return '<div class="lr-tekst">' + (titel ? '<p><b>' + titel + '</b></p>' : '') +
      [].concat(alineas).map(function(p){ return '<p>' + mk(p) + '</p>'; }).join('') + '</div>';
  }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  /* een keuzestap: goed en de foute opties, gehusseld; extra: { fout:{}, waarom } */
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst);
    var s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){
      if (extra.waarom) s.waarom = extra.waarom;
      if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; }
    }
    return s;
  }
  /* de opgave: de laatste stap is ook de vraag bij Zelf */
  function OP(vraag, context, stappen){
    var l = stappen[stappen.length - 1];
    return { vraag:vraag, context:context, stappen:stappen, opties:l.opties, goed:l.goed };
  }
  /* n dingen uit een lijst, niet die in 'niet' */
  function ander(R, lijst, niet, n){
    niet = [].concat(niet); var uit = [];
    R.hussel(lijst).forEach(function(x){ if (uit.length < n && niet.indexOf(x) < 0 && uit.indexOf(x) < 0) uit.push(x); });
    return uit;
  }
  /* n woorden uit een zin om tussen te kiezen (geen woorden uit 'niet') */
  function woordenUit(R, zin, niet, n){
    var verboden = niet.map(function(x){ return String(x).toLowerCase(); }), gezien = {};
    var w = kaal(zin).split(/[\s.,!?:;()"‘’]+/).filter(function(x){
      var k = x.toLowerCase();
      if (x.length < 4 || gezien[k] || verboden.indexOf(k) >= 0 || /\d|'/.test(x)) return false;
      gezien[k] = 1; return true;
    });
    return R.hussel(w).slice(0, n);
  }

  /* ================= WOORDENSCHAT ================= */

  /* betekenis uit de tekst: [tekst, woord, hulpstuk, [foute stukken], betekenis, [foute betekenissen]] */
  var CONTEXT = [
    ['Na de marathon kon Daan geen stap meer zetten. Hij was helemaal [uitgeput]. Hij ging meteen op het gras liggen.', 'uitgeput', 'kon geen stap meer zetten', ['Daan', 'op het gras'], 'heel erg moe', ['heel erg blij', 'heel erg boos']],
    ['De hond keek [gretig] naar het stuk worst op tafel. Hij kwispelde en likte zijn bek af.', 'gretig', 'likte zijn bek af', ['op tafel', 'De hond'], 'met veel zin om het te krijgen', ['bang en verlegen', 'slaperig en lui']],
    ['In sommige landen is water [schaars]. Het regent er bijna nooit en de putten zijn vaak leeg.', 'schaars', 'de putten zijn vaak leeg', ['In sommige landen', 'water'], 'er is weinig van', ['er is heel veel van', 'het is erg vies']],
    ['Mila controleerde haar som heel [nauwkeurig]. Ze keek elk cijfer twee keer na.', 'nauwkeurig', 'keek elk cijfer twee keer na', ['Mila', 'haar som'], 'precies en zorgvuldig', ['snel en slordig', 'met tegenzin']],
    ['Sem had nooit gedacht dat hij zou winnen. Toen zijn naam werd genoemd, was hij [verbouwereerd]. Hij stond met open mond en wist niet wat hij moest zeggen.', 'verbouwereerd', 'stond met open mond', ['zijn naam', 'Sem'], 'heel erg verbaasd', ['heel erg boos', 'heel erg moe']],
    ['Mijn oude laptop is erg [traag]. Een filmpje laden duurt soms wel vijf minuten.', 'traag', 'duurt soms wel vijf minuten', ['een filmpje', 'erg'], 'langzaam', ['snel', 'luid']],
    ['De keeper bleef [kalm], ook toen de spits vlak voor hem stond. Hij ademde rustig en wachtte af.', 'kalm', 'ademde rustig en wachtte af', ['de spits', 'vlak voor hem'], 'rustig', ['zenuwachtig', 'boos']],
    ['Ik vind spinnen [walgelijk]. Als ik er een zie, krijg ik kippenvel en wil ik meteen weg.', 'walgelijk', 'krijg ik kippenvel en wil ik meteen weg', ['Ik vind', 'als ik er een zie'], 'heel vies en naar', ['heel mooi', 'heel grappig']],
    ['Lisa is erg [vrijgevig]. Ze deelt altijd haar snoep en leent graag haar spullen uit.', 'vrijgevig', 'deelt altijd haar snoep', ['Lisa', 'erg'], 'ze geeft graag dingen aan anderen', ['ze houdt alles voor zichzelf', 'ze praat heel veel']],
    ['Het was een [hectische] ochtend. De wekker ging niet af, de bus was te laat en ik vergat mijn gymtas.', 'hectische', 'de bus was te laat en ik vergat mijn gymtas', ['Het was een', 'ochtend'], 'druk en chaotisch', ['rustig en fijn', 'koud en donker']],
    ['De wedstrijd werd [afgelast]. Het veld lag vol sneeuw, dus niemand kon spelen.', 'afgelast', 'niemand kon spelen', ['De wedstrijd', 'Het veld'], 'hij ging niet door', ['hij werd gewonnen', 'hij werd binnen gespeeld']],
    ['Tess is een [fanatieke] hockeyspeler. Ze traint vijf keer per week en baalt enorm als ze verliest.', 'fanatieke', 'traint vijf keer per week', ['hockeyspeler', 'Tess'], 'heel erg gedreven', ['een beetje lui', 'nieuw in het team']],
    ['De zolder was erg [stoffig]. Overal lag een grijze laag en ik moest steeds niezen.', 'stoffig', 'Overal lag een grijze laag', ['De zolder', 'erg'], 'vol stof', ['heel netjes', 'heel donker']],
    ['Joep [aarzelde] bij de duikplank. Hij liep naar voren, stopte en liep weer terug.', 'aarzelde', 'stopte en liep weer terug', ['Joep', 'de duikplank'], 'hij twijfelde', ['hij sprong meteen', 'hij lachte']],
    ['Het nieuwe spel is enorm [populair]. Bijna iedereen in mijn klas speelt het.', 'populair', 'Bijna iedereen in mijn klas speelt het', ['Het nieuwe spel', 'enorm'], 'veel mensen vinden het leuk', ['het is heel duur', 'het is erg moeilijk']],
    ['De twee vriendinnen hadden een [conflict]. Ze schreeuwden tegen elkaar en praatten daarna een week niet meer.', 'conflict', 'schreeuwden tegen elkaar', ['De twee vriendinnen', 'een week'], 'ruzie', ['een feestje', 'een afspraak']]
  ];
  function maakContext(R, it){
    return OP('Wat betekent ' + q(it[1]) + '?', tekst(it[0]), [
      K(R, 'Lees de zin ervoor en erna. Welk stukje tekst helpt je om ' + q(it[1]) + ' te begrijpen?', it[2], it[3],
        'Zoek een stukje dat laat zien wat er gebeurt of hoe iemand zich voelt. Een naam of een los woord als ' + q(it[3][0]) + ' helpt je niet.'),
      K(R, 'Wat betekent ' + q(it[1]) + ' hier?', it[4], it[5], 'In de tekst staat: ' + it[2] + '. Welke betekenis past daarbij?',
        { waarom:'Controle: zet ' + q(it[4]) + ' op de plek van ' + q(it[1]) + '. De tekst klopt nog.' })
    ]);
  }

  /* woorddelen */
  var AFFIX = { on:'niet', her:'opnieuw', mis:'verkeerd', loos:'zonder', baar:'het kan', heid:'het … zijn' };
  var AFFIXHINT = { on:'Denk aan onaardig: niet aardig.', her:'Denk aan herhalen: nog een keer doen.', mis:'Denk aan misgaan: het gaat verkeerd.',
    loos:'Denk aan draadloos: zonder draad.', baar:'Denk aan eetbaar: je kunt het eten.', heid:'Denk aan vrijheid: het vrij zijn.' };
  var VOOR = { on:1, her:1, mis:1 };
  /* [woord, zin, stukken [[stuk, k of voorvoegsel/achtervoegsel]], bekend woord, [foute woorden], betekenis, [foute betekenissen]] */
  var DELEN = [
    ['onbetaalbaar', 'Een vakantie naar Australië is voor ons gezin [onbetaalbaar].', [['on', 'on'], ['betaal', 'k'], ['baar', 'baar']], 'betalen', ['taal', 'baard'], 'zo duur dat je het niet kunt betalen', ['heel goedkoop', 'al betaald']],
    ['hopeloos', 'Toen we met 5-0 achter stonden, was de wedstrijd [hopeloos].', [['hope', 'k'], ['loos', 'loos']], 'hoop', ['hok', 'los'], 'er was geen hoop meer', ['er was veel hoop', 'het was heel spannend']],
    ['herschrijven', 'De docent vindt dat ik mijn verhaal moet [herschrijven].', [['her', 'her'], ['schrijven', 'k']], 'schrijven', ['rijden', 'herfst'], 'opnieuw schrijven', ['verkeerd schrijven', 'niet schrijven']],
    ['misbruiken', 'Sommige mensen [misbruiken] de wifi van de buren.', [['mis', 'mis'], ['bruiken', 'k']], 'gebruiken', ['bruin', 'missen'], 'op een verkeerde of oneerlijke manier gebruiken', ['opnieuw gebruiken', 'niet gebruiken']],
    ['zinloos', 'Ruzie maken over een spelletje vind ik [zinloos].', [['zin', 'k'], ['loos', 'loos']], 'zin', ['zon', 'los'], 'zonder zin: het heeft geen nut', ['heel nuttig', 'met veel plezier']],
    ['onbreekbaar', 'Mijn nieuwe telefoonhoesje is bijna [onbreekbaar].', [['on', 'on'], ['breek', 'k'], ['baar', 'baar']], 'breken', ['beek', 'raar'], 'het kan niet breken', ['het is al gebroken', 'het breekt heel snel']],
    ['eerlijkheid', 'De trainer vindt [eerlijkheid] het belangrijkste in een team.', [['eerlijk', 'k'], ['heid', 'heid']], 'eerlijk', ['eer', 'lijken'], 'het eerlijk zijn', ['niet eerlijk zijn', 'weer eerlijk worden']],
    ['misrekend', 'Ik had me [misrekend]: mijn zakgeld was al na een week op.', [['mis', 'mis'], ['rekend', 'k']], 'rekenen', ['rek', 'missen'], 'een fout gemaakt bij het rekenen', ['heel goed gerekend', 'opnieuw gerekend']],
    ['draagbaar', 'Deze speaker is [draagbaar], dus hij kan mee naar het strand.', [['draag', 'k'], ['baar', 'baar']], 'dragen', ['raar', 'daar'], 'je kunt hem dragen', ['je kunt hem niet dragen', 'hij is heel zwaar']],
    ['werkloos', 'Toen de fabriek dichtging, werd de buurman [werkloos].', [['werk', 'k'], ['loos', 'loos']], 'werk', ['wekker', 'los'], 'zonder werk', ['met veel werk', 'heel lui']],
    ['ongezond', 'Elke dag chips eten is [ongezond].', [['on', 'on'], ['gezond', 'k']], 'gezond', ['zon', 'gong'], 'niet gezond', ['heel gezond', 'weer gezond']],
    ['herstarten', 'Als je laptop vastloopt, moet je hem [herstarten].', [['her', 'her'], ['starten', 'k']], 'starten', ['staart', 'sterren'], 'opnieuw starten', ['uitzetten en laten liggen', 'te laat starten']],
    ['misverstand', 'Het was een [misverstand]: ik dacht dat de training om vier uur begon, maar het was drie uur.', [['mis', 'mis'], ['verstand', 'k']], 'verstand', ['stand', 'versturen'], 'iets wat iemand verkeerd heeft begrepen', ['iets wat iedereen goed begrijpt', 'een slim idee']],
    ['snelheid', 'De trein reed met een [snelheid] van 300 kilometer per uur.', [['snel', 'k'], ['heid', 'heid']], 'snel', ['sneeuw', 'held'], 'hoe snel iets gaat', ['iets wat langzaam gaat', 'opnieuw snel worden']],
    ['ontevreden', 'De klant was [ontevreden] over zijn nieuwe schoenen.', [['on', 'on'], ['tevreden', 'k']], 'tevreden', ['reden', 'tegen'], 'niet tevreden', ['heel tevreden', 'weer tevreden']],
    ['eindeloos', 'De rij voor de achtbaan was [eindeloos].', [['einde', 'k'], ['loos', 'loos']], 'einde', ['enig', 'los'], 'zonder einde: het lijkt nooit op te houden', ['heel kort', 'met een mooi einde']],
    ['bruikbaar', 'Deze oude laptop is nog prima [bruikbaar].', [['bruik', 'k'], ['baar', 'baar']], 'gebruiken', ['bruin', 'raar'], 'je kunt hem gebruiken', ['je kunt hem niet gebruiken', 'hij is nieuw']],
    ['gezondheid', 'Sporten is goed voor je [gezondheid].', [['gezond', 'k'], ['heid', 'heid']], 'gezond', ['zon', 'held'], 'hoe gezond je bent', ['ziek worden', 'gezond eten']]
  ];
  function affixNaam(key){ return VOOR[key] ? key + '-' : '-' + key; }
  function maakDelen(R, it){
    var stukken = it[2], affixen = stukken.filter(function(s){ return s[1] !== 'k'; }).map(function(s){ return s[1]; });
    var kernStuk = stukken.filter(function(s){ return s[1] === 'k'; })[0][0];
    var stappen = [K(R, 'Haal de stukjes ervoor en erachter weg. Welk bekend woord zit in ' + q(it[0]) + '?', it[3], it[4],
      'Kijk naar het middelste stuk: ' + kernStuk + '. Welk woord ken je daarvan?')];
    affixen.forEach(function(a){
      var andere = ander(R, Object.keys(AFFIX), [a], 2).map(function(x){ return AFFIX[x]; });
      stappen.push(K(R, 'Wat betekent ' + q(affixNaam(a)) + '?', AFFIX[a], andere, AFFIXHINT[a]));
    });
    stappen.push(K(R, 'Zet de stukjes bij elkaar. Wat betekent ' + q(it[0]) + '?', it[5], it[6],
      'Plak de betekenissen aan elkaar: ' + affixen.map(function(a){ return affixNaam(a) + ' is ' + AFFIX[a]; }).join(', ') + ', en het bekende woord is ' + it[3] + '.'));
    var nA = affixen.length;
    return { vraag:'Wat betekent ' + q(it[0]) + '?', context:tekst(it[1]), stappen:stappen, opties:stappen[stappen.length - 1].opties, goed:stappen[stappen.length - 1].goed,
      beeld:function(n){
        var ai = 0;
        return R.teken.woord(stukken.map(function(s){
          if (s[1] === 'k') return { t:s[0], k:1, label:n >= 1 ? it[3] : '' };
          var mijn = ai++;
          return { t:s[0], k:VOOR[s[1]] ? 2 : 3, label:n >= 2 + mijn ? AFFIX[s[1]] : '' };
        }));
      } };
  }

  /* synoniemen en tegenstellingen: [zin, woord, omschrijving, synoniem, tegenstelling, ander woord] */
  var SYN = [
    ['De toets was [makkelijk].', 'makkelijk', 'het kost weinig moeite', 'eenvoudig', 'moeilijk', 'vrolijk'],
    ['Daan is een [snelle] loper.', 'snelle', 'hij heeft weinig tijd nodig', 'vlugge', 'langzame', 'lange'],
    ['We gaan zo [beginnen] met de les.', 'beginnen', 'ergens mee starten', 'starten', 'stoppen', 'blijven'],
    ['Mijn oma is erg [aardig].', 'aardig', 'ze doet lief tegen anderen', 'vriendelijk', 'gemeen', 'oud'],
    ['Ik vind dit spel heel [leuk].', 'leuk', 'je hebt er plezier in', 'plezierig', 'saai', 'groot'],
    ['Tijdens de toets is het [stil] in de klas.', 'stil', 'je hoort bijna niets', 'rustig', 'lawaaierig', 'leeg'],
    ['Hij gaf het [goede] antwoord.', 'goede', 'het klopt', 'juiste', 'foute', 'lange'],
    ['Ze was [boos] op haar broer.', 'boos', 'ze vond het helemaal niet goed wat hij deed', 'kwaad', 'blij', 'moe'],
    ['De film was erg [eng].', 'eng', 'je wordt er bang van', 'griezelig', 'gezellig', 'lang'],
    ['Tim is heel [slim].', 'slim', 'hij kan goed nadenken', 'intelligent', 'dom', 'sterk'],
    ['Het steegje is erg [smal].', 'smal', 'het is niet breed', 'nauw', 'breed', 'kort'],
    ['Ze [kreeg] een cadeau van haar tante.', 'kreeg', 'iemand gaf het aan haar', 'ontving', 'gaf', 'zag'],
    ['De opdracht was best [lastig].', 'lastig', 'het kost veel moeite', 'moeilijk', 'makkelijk', 'kort'],
    ['Ze wonen in een [enorm] huis.', 'enorm', 'heel erg groot', 'gigantisch', 'piepklein', 'oud'],
    ['We [besluiten] samen waar we heen gaan.', 'besluiten', 'een keuze maken', 'beslissen', 'twijfelen', 'lopen'],
    ['Na de training was ik erg [moe].', 'moe', 'je hebt geen energie meer', 'vermoeid', 'fit', 'hongerig'],
    ['Het concert was [fantastisch].', 'fantastisch', 'heel erg goed', 'geweldig', 'waardeloos', 'luid'],
    ['Om vijf uur ’s ochtends was de straat helemaal [leeg].', 'leeg', 'er was niemand en niets', 'verlaten', 'vol', 'nat']
  ];
  function omschrijfStap(R, it){
    var andere = ander(R, SYN.filter(function(x){ return x !== it; }).map(function(x){ return x[2]; }), [it[2]], 2);
    return K(R, 'Wat betekent ' + q(it[1]) + ' in deze zin?', it[2], andere, 'Lees de hele zin: ' + kaal(it[0]) + ' Welke uitleg past?');
  }
  function maakSyn(R, it){
    return OP('Welk woord betekent hetzelfde als ' + q(it[1]) + '?', tekst(it[0]), [
      omschrijfStap(R, it),
      K(R, 'Welk woord betekent ook: ' + it[2] + '?', it[3], [it[4], it[5]], 'Zet het woord op de plek van ' + q(it[1]) + '. Betekent de zin dan nog hetzelfde?',
        { fout:(function(){ var f = {}; f[it[4]] = 'Dat is juist het tegenovergestelde.'; return f; })(), waarom:'Controle: ' + kaal(it[0].replace('[' + it[1] + ']', it[3])) })
    ]);
  }
  function maakAnt(R, it){
    return OP('Wat is het tegenovergestelde van ' + q(it[1]) + '?', tekst(it[0]), [
      omschrijfStap(R, it),
      K(R, 'Bedenk het omgekeerde. Welk woord betekent het tegenovergestelde van ' + q(it[1]) + '?', it[4], [it[3], it[5]], 'Zet het woord in de zin. Betekent de zin nu precies het omgekeerde?',
        { fout:(function(){ var f = {}; f[it[3]] = 'Dat betekent juist hetzelfde: een synoniem.'; return f; })(), waarom:'Controle: ' + kaal(it[0].replace('[' + it[1] + ']', it[4])) })
    ]);
  }

  /* een woord met meer betekenissen: per woord twee betekenissen, met onderwerp, en twee zinnen */
  var MEER = [
    ['bank', [['een zitmeubel', 'tv kijken'], ['een bedrijf voor geld', 'geld']],
      [['We zaten met z’n allen op de [bank] een film te kijken.', 0, 'film'], ['Ik heb mijn spaargeld op de [bank] gezet.', 1, 'spaargeld']]],
    ['blad', [['een deel van een boom', 'de natuur'], ['een vel papier', 'school en schrijven']],
      [['In de herfst waait er elke dag wel een [blad] van de boom.', 0, 'boom'], ['Schrijf je naam bovenaan het [blad] voordat je de toets maakt.', 1, 'schrijf']]],
    ['bal', [['een rond ding om mee te spelen', 'sport'], ['een groot feest om te dansen', 'een feest']],
      [['De keeper ving de [bal] met één hand.', 0, 'keeper'], ['Op het [bal] van de school droeg iedereen nette kleren en werd er de hele avond gedanst.', 1, 'gedanst']]],
    ['muis', [['een klein knaagdier', 'dieren'], ['een apparaatje bij de computer', 'de computer']],
      [['Onze kat heeft vannacht een [muis] gevangen.', 0, 'kat'], ['Klik met de [muis] op het kruisje om het venster te sluiten.', 1, 'klik']]],
    ['trap', [['treden om naar boven te lopen', 'een huis'], ['een schop', 'voetbal']],
      [['Mijn kamer is boven, dus ik loop elke avond de [trap] op.', 0, 'boven'], ['Met een harde [trap] schoot hij de bal in het doel.', 1, 'doel']]],
    ['vorst', [['een koning of koningin', 'een koningshuis'], ['strenge kou', 'het weer']],
      [['De [vorst] woonde met zijn familie in een groot paleis.', 0, 'paleis'], ['Door de [vorst] lag er ’s ochtends ijs op de sloot.', 1, 'ijs']]],
    ['kraan', [['het ding waar water uit komt', 'de keuken'], ['een machine om zware dingen op te tillen', 'bouwen']],
      [['Draai de [kraan] goed dicht, anders blijft het water druppen.', 0, 'water'], ['Een grote [kraan] tilde de stalen balken op het dak van het nieuwe gebouw.', 1, 'gebouw']]],
    ['slot', [['iets om je spullen mee af te sluiten', 'een fiets'], ['het einde', 'een film']],
      [['Ik heb een stevig [slot] gekocht, zodat niemand mijn fiets kan stelen.', 0, 'stelen'], ['Aan het [slot] van de film bleek de leraar de dief te zijn.', 1, 'film']]],
    ['noot', [['een teken voor een toon in de muziek', 'muziek'], ['een vrucht met een harde schil', 'eten']],
      [['De zangeres haalde de hoogste [noot] zonder moeite.', 0, 'zangeres'], ['De eekhoorn verstopte de [noot] in de grond voor de winter.', 1, 'eekhoorn']]],
    ['veer', [['een deel van de vacht van een vogel', 'vogels'], ['een metalen spiraal die terugveert', 'techniek']],
      [['In het nest lag een witte [veer] van een duif.', 0, 'duif'], ['In de balpen zit een kleine [veer] die de punt terugduwt.', 1, 'balpen']]],
    ['band', [['een groep muzikanten', 'muziek'], ['de rubberen ring om een wiel', 'fietsen']],
      [['Mijn favoriete [band] geeft volgende maand een concert in Utrecht.', 0, 'concert'], ['Ik moest lopen, want de [band] van mijn fiets was lek.', 1, 'lek']]],
    ['stof', [['kleine vuile korreltjes die overal op komen', 'schoonmaken'], ['materiaal waar kleding van gemaakt is', 'kleding']],
      [['Onder mijn bed ligt een dikke laag [stof].', 0, 'laag'], ['Deze jas is gemaakt van een stevige [stof] die tegen regen kan.', 1, 'jas']]]
  ];
  /* woorden met onderwerpen die te veel op elkaar lijken, komen niet samen als keuze */
  var MEERBOTS = { bal:['trap'], trap:['bal', 'bank'], slot:['band', 'bank'], band:['slot', 'noot'], noot:['band', 'kraan'], kraan:['noot'],
    veer:['muis'], muis:['veer'], bank:['slot', 'trap'], vorst:['blad'], blad:['vorst'] };
  var MEERZINNEN = [];
  MEER.forEach(function(w){ w[2].forEach(function(z){ MEERZINNEN.push({ w:w, z:z[0], i:z[1], c:z[2] }); }); });
  function maakMeer(R, it){
    var w = it.w, mijn = w[1][it.i], andere = w[1][1 - it.i];
    var botst = MEERBOTS[w[0]] || [];
    var vreemd = R.kies(MEER.filter(function(x){ return x !== w && botst.indexOf(x[0]) < 0; }))[1][R.heel(0, 1)];
    var fout = {}; fout[andere[0]] = 'Dat is de andere betekenis van ' + q(w[0]) + '. Die past niet bij ' + mijn[1] + '.';
    return OP('Welke betekenis van ' + q(w[0]) + ' past hier?', tekst(it.z), [
      K(R, q(hoofd(w[0])) + ' heeft meer betekenissen. Kijk naar de andere woorden. Waar gaat de zin over?', mijn[1], [andere[1], vreemd[1]], 'Kijk naar het woord ' + q(it.c) + '. Waar hoort dat bij?'),
      K(R, 'Welke betekenis van ' + q(w[0]) + ' past daarbij?', mijn[0], [andere[0], vreemd[0]], 'De zin gaat over ' + mijn[1] + '. Welke betekenis past daarbij?', { fout:fout })
    ]);
  }

  /* kies de handigste manier */
  var MANIER = { context:'Lees de zin ervoor en erna', delen:'Kijk naar de woorddelen', meer:'Kijk welke betekenis past' };
  function maakKiesWoord(R){
    var soort = R.kies(['context', 'delen', 'meer']), op, w, hint;
    if (soort === 'context'){ var c = R.kies(CONTEXT); op = maakContext(R, c); w = c[1]; hint = q(w) + ' bestaat niet uit stukjes die je kent. De tekst eromheen vertelt meer.'; }
    else if (soort === 'delen'){ var d = R.kies(DELEN); op = maakDelen(R, d); w = d[0]; hint = q(w) + ' bestaat uit stukjes die je kent: ' + d[2].map(function(s){ return s[0]; }).join(' + ') + '.'; }
    else { var m = R.kies(MEERZINNEN); op = maakMeer(R, m); w = m.w[0]; hint = 'Je kent ' + q(w) + ' wel, maar het woord heeft twee betekenissen.'; }
    var l = op.stappen[op.stappen.length - 1];
    var eind = K(R, 'Wat betekent ' + q(w) + ' hier?', l.opties[l.goed], l.opties.filter(function(x, i){ return i !== l.goed; }), l.hint);
    var stappen = [K(R, 'Welke manier is hier het handigst?', MANIER[soort], ander(R, [MANIER.context, MANIER.delen, MANIER.meer], [MANIER[soort]], 2), hint)];
    stappen.push(op.stappen[0]);
    stappen.push(eind);
    return OP('Wat betekent ' + q(w) + '?', op.context, stappen);
  }

  /* uitdrukkingen: [voor, uitdrukking, na, betekenis, [foute betekenissen]] */
  var UITDR = [
    ['Toen de juf vroeg wie de ruit had gebroken,', 'keek Tim de kat uit de boom.', 'Hij wachtte eerst af wat de anderen zouden zeggen.', 'afwachten wat er gebeurt', ['wegrennen', 'meteen de waarheid vertellen']],
    ['Sara had haar huiswerk niet gemaakt en', 'zat met de handen in het haar', 'toen de docent langskwam om het te controleren.', 'ze wist niet wat ze moest doen', ['ze was heel blij', 'ze zat haar haar te kammen']],
    ['Je moet niet', 'over één nacht ijs gaan.', 'Denk goed na voordat je zo’n dure telefoon koopt.', 'niet te snel een besluit nemen', ['niet in de winter schaatsen', 'niet te lang opblijven']],
    ['Toen Ravi zijn eerste doelpunt maakte,', 'was hij in de wolken.', 'Hij juichte de hele wedstrijd nog.', 'hij was heel erg blij', ['hij was heel erg moe', 'hij zat in een vliegtuig']],
    ['Mijn broer', 'heeft twee linkerhanden.', 'Als hij een kast in elkaar zet, gaat er altijd iets mis.', 'hij is onhandig', ['hij is linkshandig', 'hij is heel sterk']],
    ['We moesten winnen om kampioen te worden.', 'De spanning was om te snijden.', 'Niemand in de kantine zei een woord.', 'de spanning was heel groot', ['er werd taart gesneden', 'het was er erg gezellig']],
    ['Mijn opa zegt altijd:', 'oefening baart kunst.', 'Daarom speelt hij elke dag een uur piano.', 'als je veel oefent, word je er goed in', ['kunst maken is moeilijk', 'oefenen is saai']],
    ['Ik heb tegen twee vrienden gezegd dat ik op hun feest kom, allebei op zaterdag.', 'Nu zit ik flink in de nesten.', 'Wat moet ik doen?', 'ik zit in de problemen', ['ik zit in een vogelnest', 'ik lig lekker uit te rusten']],
    ['Ik zeg er maar niets van,', 'want spreken is zilver, zwijgen is goud.', 'Ruzie maken heeft geen zin.', 'soms is het beter om niets te zeggen', ['zilver is minder waard dan goud', 'je moet altijd je mening geven']],
    ['Na het verlies', 'liet het team de kop niet hangen.', 'De volgende dag stonden ze gewoon weer op het veld.', 'ze gaven de moed niet op', ['ze waren heel moe', 'ze keken naar de grond']],
    ['Met dat typprogramma', 'sla je twee vliegen in één klap:', 'je leert sneller typen en je oefent je spelling.', 'je bereikt twee dingen tegelijk', ['je vangt insecten', 'je maakt twee fouten']],
    ['Mila', 'heeft een gat in haar hand.', 'Haar zakgeld is altijd binnen een week op.', 'ze geeft snel veel geld uit', ['ze heeft zich bezeerd', 'ze spaart heel veel']],
    ['De nieuwe trainer', 'nam geen blad voor de mond.', 'Hij zei precies wat er mis ging in het team.', 'hij zei eerlijk wat hij dacht', ['hij praatte heel zacht', 'hij at tijdens het praten']],
    ['Toen ik de bal door het raam van de buurman schopte,', 'kreeg ik de wind van voren.', 'Hij was echt woedend.', 'ik kreeg flink op mijn kop', ['ik kreeg het koud', 'ik werd geholpen']],
    ['Bij mijn presentatie', 'ging ik af als een gieter.', 'Ik was alles vergeten wat ik wilde zeggen.', 'het ging helemaal mis en ik schaamde me', ['ik gaf de planten water', 'het ging heel goed']],
    ['Je moet', 'de huid niet verkopen voordat de beer geschoten is.', 'We hebben de finale nog niet gewonnen!', 'niet te vroeg juichen', ['geen dieren jagen', 'geen spullen verkopen']],
    ['Mijn vader', 'stak de draak met', 'mijn nieuwe kapsel. Hij moest er de hele avond om lachen.', 'hij maakte grapjes over', ['hij was boos over', 'hij was blij met']],
    ['Als we op tijd klaar willen zijn,', 'moeten we de handen uit de mouwen steken.', 'Er is nog heel veel te doen.', 'hard aan het werk gaan', ['onze jas uitdoen', 'rustig aan doen']]
  ];
  function zonder(s){ return s.replace(/[.,:;!?]+$/, ''); }
  function maakUitdr(R, it){
    var u = zonder(it[1]);
    return OP('Wat betekent de uitdrukking?', tekst(it[0] + ' ' + it[1] + ' ' + it[2]), [
      K(R, 'Welk stukje is de uitdrukking? Zoek woorden die je niet letterlijk moet nemen.', u, [zonder(it[0]), zonder(it[2])],
        'Welk stukje klinkt vreemd als je het letterlijk neemt? Het begint met ' + q(u.split(' ').slice(0, 2).join(' ')) + '.'),
      K(R, 'Wat betekent ' + q(u) + '?', it[3], it[4], 'Lees wat er verder staat: ' + it[2] + ' Wat past daarbij?',
        { fout:(function(){ var f = {}; f[it[4][0]] = 'Dat is de letterlijke betekenis. Een uitdrukking bedoelt iets anders.'; return f; })() })
    ]);
  }

  /* opdrachtwoorden */
  var OPDR = {
    verklaar:['zeggen waardoor iets zo is: de oorzaak geven', 'Bij verklaren vraag je je af: waardoor komt het?'],
    vergelijk:['de overeenkomsten en de verschillen noemen', 'Bij vergelijken leg je twee dingen naast elkaar.'],
    beschrijf:['vertellen hoe iets eruitziet of hoe het gaat', 'Bij beschrijven maak je met woorden een plaatje.'],
    beargumenteer:['je mening geven, met redenen erbij', 'In beargumenteer zit het woord argument: een reden voor je mening.'],
    noem:['het kort opschrijven, zonder uitleg', 'Bij noemen geef je alleen de namen of de dingen zelf.'],
    orden:['de dingen in de goede volgorde zetten', 'Ordenen is opruimen: alles op de goede plek, in volgorde.']
  };
  var OPDRZIN = [
    ['Verklaar', 'Verklaar waarom ijs op water blijft drijven.'], ['Verklaar', 'Verklaar waardoor de zeespiegel stijgt.'], ['Verklaar', 'Verklaar waarom de hoofdpersoon van huis wegloopt.'],
    ['Vergelijk', 'Vergelijk een kat met een hond als huisdier.'], ['Vergelijk', 'Vergelijk de prijzen van de twee telefoons in de folder.'], ['Vergelijk', 'Vergelijk het begin van het verhaal met het einde.'],
    ['Beschrijf', 'Beschrijf hoe jouw klaslokaal eruitziet.'], ['Beschrijf', 'Beschrijf de route van school naar jouw huis.'], ['Beschrijf', 'Beschrijf het uiterlijk van de hoofdpersoon.'],
    ['Beargumenteer', 'Beargumenteer of scholen mobiele telefoons moeten verbieden.'], ['Beargumenteer', 'Beargumenteer of huiswerk verplicht moet blijven.'], ['Beargumenteer', 'Beargumenteer welke sport het leukst is om te kijken.'],
    ['Noem', 'Noem drie soorten roofvogels.'], ['Noem', 'Noem twee oorzaken van de overstroming.'], ['Noem', 'Noem de namen van de hoofdpersonen.'],
    ['Orden', 'Orden de gebeurtenissen uit het verhaal.'], ['Orden', 'Orden de planeten van klein naar groot.'], ['Orden', 'Orden de stappen van het recept.']
  ];
  function maakOpdr(R, it){
    var key = it[0].toLowerCase(), o = OPDR[key];
    var andere = ander(R, Object.keys(OPDR), [key], 2).map(function(k){ return OPDR[k][0]; });
    return OP('Wat moet je doen?', tekst('<b>Opdracht:</b> ' + it[1]), [
      K(R, 'Zoek het opdrachtwoord: het woord dat zegt wat je moet doen.', it[0], woordenUit(R, it[1], [it[0]], 2), 'Het opdrachtwoord staat meestal vooraan, als eerste woord van de opdracht.'),
      K(R, 'Wat moet je doen bij ' + q(key) + '?', o[0], andere, o[1])
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'woord-strategie', niveau:'1F', domein:'woordenschat', naam:'Woorden begrijpen',
        uit:'Een woord dat je niet kent, hoeft je niet te stoppen. Met een paar trucjes vind je zelf de betekenis: uit de zin, uit de stukjes van het woord, of door te kijken welke betekenis past.' },
      doelen:[
        { id:'woord-context', naam:'Betekenis uit de zin', kort:'Lees de zin ervoor en erna: daar staat vaak wat het woord betekent',
          uit:'<p>Ken je een woord niet? Lees dan <b>de zin ervoor en de zin erna</b>. Daar staat vaak wat er gebeurt of hoe iemand zich voelt.</p><p>Voorbeeld: <i>Hij was helemaal uitgeput. Hij kon geen stap meer zetten.</i> Wie geen stap meer kan zetten, is heel erg moe. Dus <b>uitgeput</b> betekent heel erg moe.</p><p>Controleer daarna: zet je betekenis op de plek van het woord. Klopt de tekst nog?</p>',
          wanneer:'het woord niet uit stukjes bestaat die je kent.',
          maak:function(R){ return maakContext(R, R.kies(CONTEXT)); } },
        { id:'woord-delen', naam:'Betekenis uit woorddelen', kort:'Haal het woord uit elkaar: een bekend woord met een stukje ervoor of erachter',
          uit:'<p>Veel lange woorden bestaan uit <b>stukjes</b>: een bekend woord met iets ervoor of erachter.</p><p><b style="white-space:nowrap">on-</b> betekent niet, <b style="white-space:nowrap">her-</b> opnieuw, <b style="white-space:nowrap">mis-</b> verkeerd, <b style="white-space:nowrap">-loos</b> zonder, <b style="white-space:nowrap">-baar</b> het kan, en <b style="white-space:nowrap">-heid</b> maakt er een ding van (vrijheid: het vrij zijn).</p><p>Voorbeeld: <i>on + breek + baar</i> = het kan niet breken.</p>',
          wanneer:'je in een lang woord een woord herkent dat je al kent.',
          maak:function(R){ return maakDelen(R, R.kies(DELEN)); } },
        { id:'woord-synoniem', naam:'Synoniemen', kort:'Een synoniem is een ander woord dat hetzelfde betekent',
          uit:'<p>Een <b>synoniem</b> is een woord dat (bijna) hetzelfde betekent. <i>Makkelijk</i> en <i>eenvoudig</i> zijn synoniemen.</p><p>Zo zoek je een synoniem: bedenk eerst wat het woord in de zin betekent. Zet dan het nieuwe woord op die plek. Betekent de zin nog hetzelfde? Dan heb je een synoniem.</p>',
          wanneer:'je een woord niet steeds wilt herhalen, of een moeilijk woord wilt uitleggen.',
          maak:function(R){ return maakSyn(R, R.kies(SYN)); } },
        { id:'woord-antoniem', naam:'Tegenstellingen', kort:'Een tegenstelling (antoniem) betekent precies het omgekeerde',
          uit:'<p>Een <b>tegenstelling</b> of <b>antoniem</b> is een woord dat precies het omgekeerde betekent. <i>Makkelijk</i> en <i>moeilijk</i> zijn tegenstellingen.</p><p>Let op: een synoniem betekent juist hetzelfde. Zet het woord in de zin. Betekent de zin nu het omgekeerde? Dan heb je de tegenstelling.</p>',
          wanneer:'je wilt laten zien dat iets juist anders is.',
          maak:function(R){ return maakAnt(R, R.kies(SYN)); } },
        { id:'woord-meer', naam:'Woorden met meer betekenissen', kort:'Kijk waar de zin over gaat en kies de betekenis die daarbij past',
          uit:'<p>Sommige woorden hebben <b>meer betekenissen</b>. Een <i>bank</i> is iets om op te zitten, maar ook een bedrijf voor je geld.</p><p>Kijk naar de andere woorden in de zin. Gaat de zin over thuis of over geld? Kies dan de betekenis die daarbij past.</p>',
          wanneer:'je het woord wel kent, maar de zin vreemd klinkt.',
          maak:function(R){ return maakMeer(R, R.kies(MEERZINNEN)); } },
        { id:'woord-kies', naam:'Kies de handigste manier', kort:'Kies eerst hoe je het woord aanpakt en zoek dan de betekenis',
          uit:'<p>Je kent nu drie manieren. Welke is het handigst?</p><p>Bestaat het woord uit <b>stukjes die je kent</b> (on-, -baar, -loos)? Kijk naar de woorddelen. Ken je het woord wel, maar <b>past de betekenis niet</b>? Kijk welke betekenis past. Lukt geen van beide? Lees dan <b>de zin ervoor en erna</b>.</p>',
          wanneer:'je een woord tegenkomt dat je niet (goed) kent.',
          maak:function(R){ return maakKiesWoord(R); } }
      ] },
    { groep:{ id:'woord-taal', niveau:'2F', domein:'woordenschat', naam:'Uitdrukkingen en schooltaal',
        uit:'Uitdrukkingen kun je niet letterlijk nemen, en in opdrachten staan woorden die precies zeggen wat je moet doen. Hier leer je ze herkennen.' },
      doelen:[
        { id:'woord-uitdrukking', naam:'Uitdrukkingen en spreekwoorden', kort:'Neem het niet letterlijk: kijk wat er in de situatie bedoeld wordt',
          uit:'<p>Een <b>uitdrukking</b> of <b>spreekwoord</b> betekent iets anders dan de woorden zeggen. Wie <i>de kat uit de boom kijkt</i>, kijkt niet naar een kat. Hij wacht eerst af wat er gebeurt.</p><p>Zo pak je het aan: zoek het stukje dat letterlijk niet kan. Lees dan wat er verder gebeurt in de tekst. Wat zou de schrijver bedoelen?</p>',
          wanneer:'een zin letterlijk raar of onmogelijk klinkt.',
          maak:function(R){ return maakUitdr(R, R.kies(UITDR)); } },
        { id:'woord-schooltaal', naam:'Opdrachtwoorden', kort:'Zoek het opdrachtwoord: dat zegt precies wat je moet doen',
          uit:'<p>In een opdracht staat bijna altijd een <b>opdrachtwoord</b>. Dat zegt wat je moet doen.</p><p><b>Noem</b>: kort, zonder uitleg. <b>Beschrijf</b>: vertel hoe iets eruitziet of gaat. <b>Verklaar</b>: zeg waardoor het komt. <b>Vergelijk</b>: overeenkomsten en verschillen. <b>Beargumenteer</b>: je mening met redenen. <b>Orden</b>: zet in de goede volgorde.</p>',
          wanneer:'je een opdracht leest bij een toets of een tekst.',
          maak:function(R){ return maakOpdr(R, R.kies(OPDRZIN)); } }
      ] }
  ]);

  /* ================= LEZEN: de tekst als geheel en alinea's ================= */

  /* korte zakelijke teksten: t titel, z zinnen [zin, rol] (k kernzin, u uitleg, v voorbeeld),
     w woord dat terugkomt, wf andere woorden, o onderwerp, of [detail, te breed], h hoofdgedachte, hf [detail, te breed] */
  var TEKSTEN = [
    { t:'Slapen met je telefoon', z:[['Een telefoon in je slaapkamer is slecht voor je nachtrust.', 'k'], ['Het licht van het scherm zorgt ervoor dat je lichaam minder slaaphormoon maakt.', 'u'], ['Ook kunnen meldingen midden in de nacht je wakker maken.', 'u'], ['Zo ligt Noor vaak tot middernacht filmpjes te kijken op haar telefoon en is ze ’s ochtends doodmoe.', 'v']],
      w:'telefoon', wf:['middernacht', 'licht'], o:'telefoons en slapen', of:['filmpjes kijken', 'techniek'], h:'Een telefoon in je slaapkamer is slecht voor je slaap.', hf:['Noor is ’s ochtends vaak moe.', 'Jongeren gebruiken veel techniek.'] },
    { t:'Waarom bijen belangrijk zijn', z:[['Bijen vliegen van bloem naar bloem om nectar te verzamelen.', 'u'], ['Onderweg nemen bijen stuifmeel mee, waardoor planten vruchten kunnen maken.', 'u'], ['Zonder bijen zouden er bijvoorbeeld veel minder appels en aardbeien zijn.', 'v'], ['Bijen zijn dus heel belangrijk voor ons eten.', 'k']],
      w:'bijen', wf:['nectar', 'appels'], o:'het belang van bijen', of:['appels en aardbeien', 'insecten'], h:'Bijen zijn heel belangrijk voor ons eten.', hf:['Bijen verzamelen nectar.', 'Alle dieren zijn belangrijk.'] },
    { t:'Een bijbaantje', z:[['Een bijbaantje levert je meer op dan alleen geld.', 'k'], ['Bij een bijbaantje leer je op tijd komen en samenwerken.', 'u'], ['Wie bijvoorbeeld vakken vult in de supermarkt, leert snel en netjes werken.', 'v'], ['Ook krijg je door een bijbaantje meer zelfvertrouwen.', 'u']],
      w:'bijbaantje', wf:['supermarkt', 'netjes'], o:'wat een bijbaantje je oplevert', of:['vakken vullen', 'werk'], h:'Een bijbaantje levert je meer op dan alleen geld.', hf:['In de supermarkt leer je netjes werken.', 'Geld verdienen is belangrijk.'] },
    { t:'Plastic in zee', z:[['Elk jaar komt er veel plastic in zee terecht.', 'u'], ['Vissen en vogels zien kleine stukjes plastic aan voor eten.', 'u'], ['Zo vinden onderzoekers vaak plastic in de magen van zeevogels.', 'v'], ['Plastic in zee is dus een groot gevaar voor dieren.', 'k']],
      w:'plastic', wf:['onderzoekers', 'magen'], o:'plastic in zee', of:['zeevogels', 'het milieu'], h:'Plastic in zee is een groot gevaar voor dieren.', hf:['Onderzoekers kijken in de magen van vogels.', 'Het milieu moet beter beschermd worden.'] },
    { t:'Gamen en je hersenen', z:[['Sommige games kunnen je hersenen trainen.', 'k'], ['Bij snelle games moet je in korte tijd veel beslissingen nemen.', 'u'], ['Onderzoekers zagen dat mensen die veel actiegames spelen soms sneller reageren.', 'u'], ['Een speler van een racegame leert bijvoorbeeld snel inschatten waar een bocht komt.', 'v']],
      w:'games', wf:['bocht', 'beslissingen'], o:'games en je hersenen', of:['racegames', 'computers'], h:'Sommige games kunnen je hersenen trainen.', hf:['Een racegame heeft veel bochten.', 'Computers worden steeds slimmer.'] },
    { t:'Waarom katten spinnen', z:[['Bijna iedereen kent het geluid van een spinnende kat.', 'u'], ['Katten spinnen vaak als ze tevreden zijn.', 'u'], ['Maar ze spinnen ook als ze pijn hebben of bang zijn.', 'u'], ['Een kat bij de dierenarts spint bijvoorbeeld soms, misschien om zichzelf te kalmeren.', 'v'], ['Spinnen betekent dus niet altijd dat een kat blij is.', 'k']],
      w:'spinnen', wf:['dierenarts', 'geluid'], o:'waarom katten spinnen', of:['de dierenarts', 'huisdieren'], h:'Als een kat spint, is hij niet altijd blij.', hf:['Katten gaan soms naar de dierenarts.', 'Katten zijn leuke huisdieren.'] },
    { t:'Sporten en je humeur', z:[['Sporten maakt je vrolijker.', 'k'], ['Tijdens het sporten maakt je lichaam stoffen aan waardoor je je beter voelt.', 'u'], ['Ook vergeet je even je zorgen als je met sporten bezig bent.', 'u'], ['Veel leerlingen merken bijvoorbeeld dat ze na een potje voetbal minder gestrest zijn.', 'v']],
      w:'sporten', wf:['zorgen', 'voetbal'], o:'sporten en je humeur', of:['voetbal', 'gezondheid'], h:'Sporten maakt je vrolijker.', hf:['Voetbal is een populaire sport.', 'Gezond leven is belangrijk.'] },
    { t:'Zakgeld', z:[['Veel kinderen in Nederland krijgen zakgeld.', 'u'], ['Met zakgeld leer je kiezen: geef je het meteen uit of spaar je voor iets groters?', 'u'], ['Wie bijvoorbeeld spaart voor een nieuwe fiets, moet maandenlang minder snoep kopen.', 'v'], ['Zakgeld is dus een goede manier om te leren omgaan met geld.', 'k']],
      w:'zakgeld', wf:['fiets', 'snoep'], o:'zakgeld', of:['een nieuwe fiets', 'geld in het algemeen'], h:'Van zakgeld leer je omgaan met geld.', hf:['Een nieuwe fiets is duur.', 'Geld is het belangrijkste in het leven.'] },
    { t:'Een warmere aarde', z:[['De aarde wordt warmer.', 'k'], ['Dat komt vooral doordat mensen veel kolen, olie en gas verbranden.', 'u'], ['Daarbij komt CO2 vrij, een gas dat de aarde nog warmer maakt.', 'u'], ['Zo was 2023 wereldwijd een van de warmste jaren ooit gemeten.', 'v']],
      w:'warmer', wf:['kolen', 'gemeten'], o:'de opwarming van de aarde', of:['het jaar 2023', 'het weer'], h:'De aarde wordt warmer, vooral door mensen.', hf:['2023 was een warm jaar.', 'Het weer is vaak slecht.'] },
    { t:'Hondentaal', z:[['Honden laten met hun lichaam zien hoe ze zich voelen.', 'k'], ['Een bange hond trekt zijn staart tussen zijn poten.', 'u'], ['Een hond die gromt en zijn tanden laat zien, wil dat je afstand houdt.', 'u'], ['Zo weet de hond van mijn buurman precies hoe hij moet kijken als hij een koekje wil.', 'v']],
      w:'hond', wf:['koekje', 'tanden'], o:'de lichaamstaal van honden', of:['koekjes', 'dieren'], h:'Honden laten met hun lichaam zien hoe ze zich voelen.', hf:['De buurman heeft een hond.', 'Dieren kunnen niet praten.'] },
    { t:'Ontbijten', z:[['Veel jongeren slaan ’s ochtends het ontbijt over.', 'u'], ['Ze hebben geen honger of geen tijd.', 'u'], ['Een boterham of een bakje yoghurt is bijvoorbeeld in twee minuten klaar.', 'v'], ['Toch is een goed ontbijt belangrijk, want het geeft je energie voor de hele ochtend.', 'k']],
      w:'ontbijt', wf:['yoghurt', 'honger'], o:'ontbijten', of:['yoghurt', 'eten'], h:'Een goed ontbijt is belangrijk, want het geeft je energie.', hf:['Yoghurt is snel klaar.', 'Gezond eten is belangrijk.'] },
    { t:'Leren zwemmen', z:[['In Nederland is het belangrijk dat kinderen leren zwemmen.', 'k'], ['Ons land heeft veel sloten, rivieren en meren.', 'u'], ['Bijna elk dorp heeft bijvoorbeeld wel een sloot of een vaart in de buurt.', 'v'], ['Wie in het water valt en niet kan zwemmen, kan verdrinken.', 'u']],
      w:'zwemmen', wf:['dorp', 'rivieren'], o:'leren zwemmen in Nederland', of:['sloten', 'sport'], h:'In Nederland is het belangrijk dat kinderen leren zwemmen.', hf:['Nederland heeft veel rivieren.', 'Sporten is gezond.'] },
    { t:'Influencers', z:[['Veel influencers hebben honderdduizenden volgers.', 'u'], ['Bedrijven betalen een influencer om producten te laten zien in filmpjes.', 'u'], ['Een influencer laat bijvoorbeeld een nieuwe sportschoen zien en zegt hoe lekker die zit.', 'v'], ['Wat een influencer aanprijst, is dus vaak gewoon reclame.', 'k']],
      w:'influencer', wf:['sportschoen', 'volgers'], o:'reclame door influencers', of:['sportschoenen', 'sociale media'], h:'Wat influencers aanprijzen, is vaak reclame.', hf:['Een influencer heeft nieuwe schoenen.', 'Sociale media zijn populair.'] },
    { t:'Vleermuizen', z:[['Vleermuizen vinden hun weg in het donker met geluid.', 'k'], ['Ze maken hoge piepjes die wij niet kunnen horen.', 'u'], ['Aan de echo van die piepjes horen vleermuizen waar een muur of een insect is.', 'u'], ['Zo kan een vleermuis in het pikkedonker een mug vangen.', 'v']],
      w:'vleermuizen', wf:['mug', 'muur'], o:'hoe vleermuizen hun weg vinden', of:['muggen', 'dieren in de nacht'], h:'Vleermuizen vinden hun weg in het donker met geluid.', hf:['Vleermuizen eten muggen.', 'Veel dieren leven ’s nachts.'] },
    { t:'Tweedehands kleding', z:[['Steeds meer jongeren kopen tweedehands kleding.', 'u'], ['Dat is goedkoper dan nieuwe kleding.', 'u'], ['Ook is het beter voor het milieu, want voor nieuwe kleding zijn veel water en energie nodig.', 'u'], ['Voor één spijkerbroek zijn bijvoorbeeld duizenden liters water nodig.', 'v'], ['Tweedehands kleding kopen is dus goed voor je portemonnee en voor de aarde.', 'k']],
      w:'kleding', wf:['spijkerbroek', 'energie'], o:'tweedehands kleding', of:['spijkerbroeken', 'mode'], h:'Tweedehands kleding is goedkoop en beter voor het milieu.', hf:['Een spijkerbroek kost veel water.', 'Jongeren houden van mode.'] },
    { t:'Huiswerk plannen', z:[['Wie zijn huiswerk plant, heeft minder stress.', 'k'], ['Met een huiswerkplanning zie je op tijd wanneer je veel moet doen.', 'u'], ['Als je bijvoorbeeld op maandag al weet dat er vrijdag een toets is, kun je elke dag een beetje leren.', 'v'], ['Zo hoef je de avond voor de toets niet in paniek te raken.', 'u']],
      w:'huiswerk', wf:['maandag', 'paniek'], o:'huiswerk plannen', of:['een toets op vrijdag', 'school'], h:'Wie zijn huiswerk plant, heeft minder stress.', hf:['Op vrijdag is er een toets.', 'School is belangrijk.'] }
  ];
  function zinnen(T, rol){ return T.z.filter(function(z){ return z[1] === rol; }).map(function(z){ return z[0]; }); }
  function kernVan(T){ return zinnen(T, 'k')[0]; }
  function vbVan(T){ return zinnen(T, 'v')[0]; }
  function vbSignaal(T){ var v = vbVan(T); return /bijvoorbeeld/.test(v) ? 'bijvoorbeeld' : 'Zo'; }
  function heleTekst(T, titel){ return tekst(T.z.map(function(z){ return z[0]; }).join(' '), titel ? T.t : null); }
  function onderwerpStap(R, T, t){
    var f = {}; f[T.of[0]] = 'Dat is maar een detail uit de tekst.'; f[T.of[1]] = 'Dat is te breed: de tekst gaat over iets kleiners.';
    return K(R, t || 'Wat is het onderwerp? Zeg het in een paar woorden.', T.o, T.of, 'Het onderwerp past bij de hele tekst, niet bij één zin. Denk aan de titel: ' + T.t + '.', { fout:f });
  }

  /* tekstdoelen: korte teksten per doel */
  var DOELEN5 = ['informeren', 'overtuigen', 'amuseren', 'instrueren', 'activeren'];
  var DOELKENM = {
    informeren:'feiten zonder mening: je leert er iets van',
    overtuigen:'een mening met argumenten: je moet het met de schrijver eens worden',
    amuseren:'een grappig of spannend verhaaltje: je moet ervan genieten',
    instrueren:'stappen achter elkaar: je leert hoe je iets doet',
    activeren:'een oproep: je moet iets gaan doen'
  };
  var TDOEL = {
    informeren:[
      'Een giraffe slaapt heel weinig: vaak niet meer dan een paar uur per dag. Hij slaapt meestal staand, in korte stukjes.',
      'De zomervakantie begint in Nederland niet overal tegelijk. Het land is verdeeld in drie regio’s: noord, midden en zuid.',
      'Een zonnepaneel zet zonlicht om in elektriciteit. Ook als het bewolkt is, wekt het nog een beetje stroom op.',
      'In Nederland mag je vanaf 16 jaar op een brommer rijden. Je hebt dan wel een rijbewijs AM nodig.',
      'Een octopus heeft acht armen en drie harten. Zijn bloed is blauw.',
      'De Afsluitdijk is ongeveer 32 kilometer lang. Hij werd in 1932 gesloten en scheidt de Waddenzee van het IJsselmeer.',
      'Een voetbalwedstrijd voor volwassenen duurt twee keer 45 minuten. Daartussen zit een rust van een kwartier.',
      'Honing bederft bijna nooit. Er zit zo weinig water in dat bacteriën er niet in kunnen groeien.',
      'Een schrikkeljaar heeft 366 dagen. Er komt dan een dag bij in februari.',
      'Pinguïns leven bijna allemaal op het zuidelijk halfrond. Op de Noordpool komen ze in het wild niet voor.',
      'Je hart klopt in rust ongeveer 60 tot 100 keer per minuut. Als je sport, gaat het veel sneller.',
      'Een slak heeft duizenden piepkleine tandjes op zijn tong. Daarmee schraapt hij stukjes van bladeren af.'
    ],
    overtuigen:[
      'Elke school zou een moestuin moeten hebben. Leerlingen leren dan waar hun eten vandaan komt, en buiten bezig zijn is gezond.',
      'Huiswerk in het weekend is een slecht idee. Jongeren hebben hun vrije tijd nodig om uit te rusten.',
      'Lezen is veel leuker dan series kijken. In een boek bedenk je zelf hoe alles eruitziet.',
      'Een schooluniform is eerlijker dan gewone kleding. Niemand wordt dan nog gepest om zijn kleren.',
      'Katten zijn de beste huisdieren. Ze zijn schoon en zelfstandig, en je hoeft ze niet uit te laten.',
      'De zomervakantie zou korter moeten zijn. Na zes weken vrij zijn leerlingen veel vergeten van wat ze geleerd hebben.',
      'Gamen is helemaal niet slecht voor je. Je traint er je reactiesnelheid mee en je leert samenwerken.',
      'Vlees zou duurder moeten worden. Dan eten mensen minder vlees, en dat is beter voor het klimaat.',
      'Scholen zouden later moeten beginnen. Tieners zijn ’s ochtends vroeg nog niet goed wakker.',
      'E-sports zijn net zo goed echte sport als voetbal. Topgamers trainen elke dag urenlang.',
      'Telefoons horen niet in de klas. Ze leiden af, ook als ze alleen maar op tafel liggen.',
      'Tweedehands kleding is de beste keus. Het is goedkoper en er is geen nieuw water voor nodig.'
    ],
    amuseren:[
      'Toen mijn opa voor het eerst een selfie wilde maken, hield hij de telefoon verkeerd om. Hij heeft nu veertig foto’s van zijn eigen oor.',
      'Onze hond denkt dat hij een kat is. Hij slaapt op de vensterbank en schrikt van zijn eigen blaf.',
      'Gisteren liep ik vol zelfvertrouwen de klas binnen. Pas na het eerste uur zag ik dat ik twee verschillende schoenen aanhad.',
      'Mijn broertje sprong stoer het zwembad in om indruk te maken. Hij was alleen vergeten dat hij nog zijn spijkerbroek aanhad.',
      'Mijn moeder praat tegen haar planten. Gisteren hoorde ik haar zeggen: ‘Jij krijgt pas water als je je kamer hebt opgeruimd.’',
      'Mijn zus heeft drie wekkers. De eerste zet ze uit, de tweede gooit ze onder haar bed, en bij de derde roept ze: ‘Nog vijf minuutjes!’',
      'Bij de schoolfoto moest iedereen lachen. Behalve Daan: die had net zijn tong gebrand aan zijn chocolademelk. Op de foto lijkt hij een boze pinguïn.',
      'Ik gooide de pannenkoek stoer omhoog om hem om te draaien. Hij kwam niet meer naar beneden. Hij hangt nog steeds aan het plafond.',
      'Mijn vader zegt dat hij vroeger de snelste van de klas was. Toen we gingen hardlopen, hing hij na tweehonderd meter hijgend tegen een lantaarnpaal.',
      'Tijdens een online les vergat de juf haar microfoon uit te zetten. De hele klas hoorde haar keihard meezingen met de radio.',
      'Onze kat heeft een hekel aan maandag. Elke maandagochtend gaat ze precies op mijn schoolspullen liggen.',
      'Mijn oom wilde laten zien hoe goed hij kon jongleren. Na tien seconden lagen er drie kapotte eieren op de keukenvloer.'
    ],
    instrueren:[
      'Zo maak je een tosti: beboter twee sneetjes brood aan de buitenkant. Leg er kaas tussen. Bak de tosti drie minuten in het tosti-ijzer.',
      'Zet je telefoon op stil: veeg het menu bovenaan je scherm open. Tik op het belletje. Er komt nu een streep door het belletje.',
      'Plak je fietsband zo: haal de binnenband eruit en zoek het gaatje. Maak die plek ruw met schuurpapier. Smeer er lijm op en druk de plakker erop.',
      'Een goede warming-up gaat zo: loop eerst vijf minuten rustig. Zwaai daarna je armen en benen los. Eindig met een paar korte sprintjes.',
      'Was je handen zo: maak ze nat en doe er zeep op. Wrijf twintig seconden, ook tussen je vingers. Spoel ze af en droog ze goed.',
      'Een papieren vliegtuigje vouwen: vouw een vel papier in de lengte dubbel. Vouw de bovenhoeken naar het midden. Vouw daarna de vleugels naar beneden.',
      'Zo maak je een sterk wachtwoord: kies vier losse woorden die niet bij elkaar horen. Zet er een cijfer en een teken tussen. Gebruik het voor maar één account.',
      'Kook een ei zo: leg het ei voorzichtig in kokend water. Laat het zes minuten koken. Spoel het daarna af met koud water.',
      'Zo mail je je mentor: typ het mailadres bij ‘Aan’. Schrijf een duidelijk onderwerp. Begin met ‘Beste’ en eindig met je naam.',
      'Zo zet je een tent op: leg het grondzeil plat neer. Steek de stokken door de tent. Zet de haringen schuin in de grond.',
      'Een smoothie maken: snijd een banaan in stukjes. Doe er een handje aardbeien en een glas melk bij. Mix alles een minuut in de blender.',
      'Zo leer je woordjes: dek de ene kant van de lijst af. Zeg het woord hardop en kijk of het klopt. Oefen de foute woorden de volgende dag nog een keer.'
    ],
    activeren:[
      'Doe mee met de sponsorloop op vrijdag! Vraag je familie om je te sponsoren. Alles wat we ophalen, gaat naar het dierenasiel.',
      'Meld je nu aan voor het schoolorkest! Iedereen is welkom, ook als je nog geen instrument speelt.',
      'Kom zaterdag helpen bij de opruimactie in het park! Wij zorgen voor de vuilniszakken.',
      'Stem op jouw favoriete schoolband! Stemmen kan nog tot en met vrijdag in de aula.',
      'Gooi je lege blikjes en flesjes in de nieuwe bak in de kantine! Doe mee en houd het schoolplein schoon.',
      'Geef je op voor de leerlingenraad! Laat je stem horen en praat mee over jouw school.',
      'Doneer je oude speelgoed aan de speelgoedbank! Breng het voor 1 december naar de receptie.',
      'Zet je handtekening onder de petitie voor een zebrapad bij de school! Hoe meer handtekeningen, hoe beter.',
      'Kom naar de open dag van onze hockeyclub en doe gratis mee met een training!',
      'Schrijf je in voor de schrijfwedstrijd van de bibliotheek! Stuur je verhaal op voor 1 maart.',
      'Fiets deze week elke dag naar school en spaar stempels voor een gratis ijsje!',
      'Help mee op de kerstmarkt van school! Zet je naam op de lijst bij je mentor.'
    ]
  };
  function maakTdoelPer(R, doel){
    var anderen = ander(R, DOELEN5, [doel], 2);
    var stukken = R.hussel([{ d:doel, t:R.kies(TDOEL[doel]) }, { d:anderen[0], t:R.kies(TDOEL[anderen[0]]) }, { d:anderen[1], t:R.kies(TDOEL[anderen[1]]) }]);
    var L = ['A', 'B', 'C'], goed = '', alineas = stukken.map(function(s, i){ if (s.d === doel) goed = 'Tekst ' + L[i]; return '<b>Tekst ' + L[i] + '.</b> ' + s.t; });
    var fout = {}; stukken.forEach(function(s, i){ if (s.d !== doel) fout['Tekst ' + L[i]] = 'Die tekst wil ' + s.d + ': ' + DOELKENM[s.d] + '.'; });
    return OP('Welke tekst wil ' + doel + '?', tekst(alineas), [
      K(R, 'Wat is het kenmerk van een tekst die wil ' + doel + '?', DOELKENM[doel], ander(R, DOELEN5, [doel], 2).map(function(d){ return DOELKENM[d]; }), 'Denk aan het woord ' + doel + ' zelf. Wat moet de lezer na het lezen weten, vinden of doen?'),
      K(R, 'Lees de drie teksten. Welke tekst heeft dat kenmerk?', goed, L.map(function(l){ return 'Tekst ' + l; }), 'Zoek de tekst met ' + DOELKENM[doel] + '.', { fout:fout })
    ]);
  }
  function maakTdoelMix(R){
    var doel = R.kies(DOELEN5), t = R.kies(TDOEL[doel]);
    return OP('Wat is het tekstdoel?', tekst(t), [
      K(R, 'Wat valt op aan deze tekst?', DOELKENM[doel], ander(R, DOELEN5, [doel], 2).map(function(d){ return DOELKENM[d]; }), 'Staan er feiten, een mening, een grap, stappen of een oproep in?'),
      K(R, 'Welk tekstdoel hoort daarbij?', doel, ander(R, DOELEN5, [doel], 3), 'De tekst heeft ' + DOELKENM[doel].split(':')[0] + '.')
    ]);
  }

  /* tekstsoorten */
  var SOORTKENM = {
    nieuwsbericht:'iets wat net gebeurd is: wie, wat, waar en wanneer',
    recept:'ingrediënten en stappen om eten te maken',
    betoog:'een mening met argumenten en een conclusie',
    reclame:'een product, een aanbieding en wervende woorden',
    verhaal:'personages en wat ze meemaken'
  };
  var SOORT = [
    ['nieuwsbericht', 'Gisteren is in een dierentuin in Brabant een giraffe geboren. Het jong is bijna twee meter lang en staat al op zijn eigen poten. De verzorgers zijn heel blij met de geboorte.'],
    ['nieuwsbericht', 'Door de gladheid zijn vanochtend in Overijssel tientallen leerlingen te laat op school gekomen. Veel bussen reden niet. Morgen wordt het weer iets warmer.'],
    ['nieuwsbericht', 'Een middelbare school in Groningen heeft deze week alle telefoons in de klas verboden. Leerlingen moeten hun telefoon voortaan in een kluisje leggen. De school wil zo meer rust in de lessen.'],
    ['nieuwsbericht', 'Bij een basisschool in Zeeland is gisteren een zwerm bijen neergestreken op het klimrek. Een imker heeft de bijen opgehaald. Niemand werd gestoken.'],
    ['recept', 'Pannenkoeken voor 4 personen. Je hebt nodig: 250 gram bloem, 2 eieren en een halve liter melk. Klop alles tot een glad beslag. Bak de pannenkoeken in een hete pan met een beetje boter.'],
    ['recept', 'Wraps met kip. Nodig: 4 wraps, 200 gram kipreepjes, sla en saus. Bak de kip gaar. Leg kip, sla en saus op een wrap en rol hem op.'],
    ['recept', 'Bananenbrood. Prak 3 rijpe bananen. Meng ze met 2 eieren, 200 gram zelfrijzend bakmeel en een snufje zout. Bak het brood 50 minuten op 180 graden.'],
    ['recept', 'Tomatensoep. Nodig: 1 kilo tomaten, een ui en een liter bouillon. Snijd de groente en kook alles twintig minuten. Pureer de soep met een staafmixer.'],
    ['betoog', 'Een pauze van twintig minuten is te kort. Je staat de helft van de tijd in de rij bij de kantine. Bovendien leer je beter als je echt even hebt kunnen ontspannen. De pauze moet dus langer.'],
    ['betoog', 'Iedereen zou met een fietshelm moeten fietsen. Bij een val beschermt een helm je hoofd. Artsen zeggen dat een helm ernstig hoofdletsel kan voorkomen. Kortom: zet die helm op.'],
    ['betoog', 'Dieren horen niet in een circus. Ze kunnen er niet leven zoals in de natuur. Ze reizen het hele jaar rond in kleine hokken. Een circus is dus geen plek voor dieren.'],
    ['betoog', 'Schoolkantines zouden alleen gezond eten moeten verkopen. Veel jongeren eten nu al te veel suiker. Als er geen snoep te koop is, kiezen ze vanzelf iets gezonders. Een gezonde kantine is dus een goed idee.'],
    ['reclame', 'Nieuw: de SuperSprint-sneaker! Rent lichter dan ooit. Nu met 20 procent korting, alleen deze week!'],
    ['reclame', 'Zin in iets fris? Probeer de nieuwe Fruitknaller-smoothie! Twee halen, één betalen, alleen in de kantine.'],
    ['reclame', 'Kom naar Zwemparadijs De Golf! Vier glijbanen en een golfslagbad. Met deze bon krijg je één euro korting.'],
    ['reclame', 'De GameBox Ultra: de snelste console van dit moment. Vandaag besteld, morgen in huis. Op is op!'],
    ['verhaal', 'Lotte keek de donkere gang in. Ergens kraakte een deur. ‘Is daar iemand?’ fluisterde ze. Niemand antwoordde.'],
    ['verhaal', 'Er was eens een jongen die niet kon stoppen met gamen. Op een ochtend werd hij wakker in zijn eigen spel.'],
    ['verhaal', 'Toen Ahmed de brief opende, begonnen zijn handen te trillen. Hij was aangenomen bij de jeugdopleiding van zijn favoriete club.'],
    ['verhaal', 'De hond van mevrouw De Vries liep elke dag om vier uur naar het hek. Daar wachtte hij op het meisje dat altijd een koekje voor hem had.']
  ];
  function maakSoort(R, it){
    var s = it[0], namen = Object.keys(SOORTKENM);
    return OP('Wat voor tekst is dit?', tekst(it[1]), [
      K(R, 'Wat valt op aan deze tekst?', SOORTKENM[s], ander(R, namen, [s], 2).map(function(x){ return SOORTKENM[x]; }), 'Kijk naar de vorm: staan er ingrediënten, een aanbieding, een mening, personages of een gebeurtenis van gisteren in?'),
      K(R, 'Welke tekstsoort hoort daarbij?', s, ander(R, namen, [s], 3), 'Een tekst met ' + SOORTKENM[s] + ' is een ' + s + '.')
    ]);
  }

  /* leesstrategieën: [strategie, situatie] */
  var STRAT = {
    'oriënterend lezen':['je bekijkt de titel, de kopjes en de plaatjes', 'of de tekst bruikbaar is'],
    'globaal lezen':['je leest snel door om de hoofdzaken te kennen', 'waar de tekst ongeveer over gaat'],
    'zoekend lezen':['je zoekt snel naar één stukje informatie', 'één bepaald ding'],
    'intensief lezen':['je leest alles nauwkeurig, zin voor zin', 'alles precies']
  };
  var SITUATIE = [
    ['oriënterend lezen', 'Je moet een werkstuk maken over haaien. In de bibliotheek pak je vijf boeken. Welk boek kun je gebruiken?'],
    ['oriënterend lezen', 'Je zoekt informatie voor je spreekbeurt. Je zoekmachine geeft tien websites. Welke is de moeite waard?'],
    ['oriënterend lezen', 'Je bladert in de wachtkamer door een tijdschrift. Staat er iets in wat je leuk vindt?'],
    ['oriënterend lezen', 'Je krijgt een folder van een sportclub. Je wilt weten of die over jouw sport gaat.'],
    ['globaal lezen', 'De docent vraagt: waar gaat dit artikel ongeveer over? Je hebt twee minuten.'],
    ['globaal lezen', 'Je wilt een nieuwsbericht snel doorlezen om te weten wat er gebeurd is.'],
    ['globaal lezen', 'Je krijgt een lange brief van school en wilt weten waar die in grote lijnen over gaat.'],
    ['globaal lezen', 'Een vriend stuurt je een lang artikel over een nieuwe game. Je wilt de hoofdpunten weten.'],
    ['zoekend lezen', 'Je wilt weten hoe laat het zwembad zaterdag opengaat.'],
    ['zoekend lezen', 'Je zoekt in het rooster in welk lokaal je het derde uur wiskunde hebt.'],
    ['zoekend lezen', 'Je wilt in de handleiding vinden hoeveel batterijen de controller nodig heeft.'],
    ['zoekend lezen', 'Bij een leesvraag moet je het jaartal vinden waarin de brug werd gebouwd.'],
    ['intensief lezen', 'Je hebt morgen een toets over een tekst uit je geschiedenisboek.'],
    ['intensief lezen', 'Je moet een moeilijk recept precies volgen, anders mislukt de taart.'],
    ['intensief lezen', 'Je doet mee aan een wedstrijd en leest de regels. Je wilt geen enkele fout maken.'],
    ['intensief lezen', 'Je moet een samenvatting maken van een lastig artikel.']
  ];
  function maakStrat(R, it){
    var s = it[0], namen = Object.keys(STRAT);
    return OP('Welke leesstrategie kies je?', tekst(it[1]), [
      K(R, 'Wat wil je hier weten?', STRAT[s][1], ander(R, namen, [s], 2).map(function(x){ return STRAT[x][1]; }), 'Lees de situatie nog eens: ' + it[1]),
      K(R, 'Welke leesstrategie past daarbij?', s, ander(R, namen, [s], 3), 'Wil je ' + STRAT[s][1] + ' weten? Dan geldt: ' + STRAT[s][0] + '.')
    ]);
  }

  /* teksten met vier alinea's: inleiding, uitleg, voorbeeld, conclusie; kern per alinea, onderwerp en samenvattingen */
  var FUNCTIES = ['inleiding', 'uitleg', 'voorbeeld', 'conclusie'];
  var FUNCKENM = {
    inleiding:'het is de eerste alinea: hij noemt het onderwerp en maakt je nieuwsgierig',
    uitleg:'hij legt uit hoe of waarom iets zo is',
    voorbeeld:'er staat ‘bijvoorbeeld’ of ‘zo’: hij laat één geval zien',
    conclusie:'het is de laatste alinea: er staat ‘dus’ of ‘kortom’'
  };
  var ALINEA = [
    { t:'De Elfstedentocht', a:['De Elfstedentocht is een beroemde schaatstocht door Friesland. Toch is hij al heel lang niet meer verreden.', 'Voor de tocht moet het ijs overal minstens vijftien centimeter dik zijn. Daarvoor moet het dagenlang hard vriezen.', 'De laatste tocht was bijvoorbeeld in 1997. Sindsdien is het nooit lang genoeg koud geweest.', 'Door de warmere winters wordt de kans op een nieuwe Elfstedentocht dus steeds kleiner.'],
      k:['De Elfstedentocht is al lang niet verreden.', 'Voor de tocht moet het ijs overal heel dik zijn.', 'De laatste tocht was in 1997.', 'Door warmere winters wordt een nieuwe tocht steeds minder waarschijnlijk.'],
      o:'de Elfstedentocht', of:['het jaar 1997', 'sport in de winter'], sg:'De Elfstedentocht kan alleen bij heel dik ijs en wordt door warmere winters steeds minder waarschijnlijk.', sf:['De laatste Elfstedentocht was in 1997.', 'Schaatsen is de populairste sport in Friesland.'] },
    { t:'Een moestuin op school', a:['Steeds meer scholen hebben een eigen moestuin. Leerlingen kweken daar zelf groente.', 'In de moestuin leer je hoe groente groeit en hoeveel werk dat is. Ook ben je lekker buiten bezig.', 'Bij ons op school oogsten de brugklassers bijvoorbeeld elk najaar zelf hun pompoenen.', 'Een moestuin is dus een leerzame en gezonde plek op school.'],
      k:['Steeds meer scholen hebben een moestuin.', 'In een moestuin leer je hoe groente groeit en ben je buiten bezig.', 'Brugklassers oogsten zelf pompoenen.', 'Een moestuin is leerzaam en gezond.'],
      o:'moestuinen op school', of:['pompoenen', 'tuinieren'], sg:'Steeds meer scholen hebben een moestuin: daar leer je hoe groente groeit en ben je gezond buiten bezig.', sf:['Brugklassers oogsten elk najaar pompoenen.', 'Alle scholen moeten een moestuin aanleggen, want groente is gezond.'] },
    { t:'Waarom de zee zout is', a:['Wie in zee zwemt en water binnenkrijgt, proeft meteen dat het zout is. Maar hoe komt dat zout daar?', 'Regenwater lost kleine beetjes zout op uit stenen. Rivieren brengen dat zout naar zee. Daar verdampt het water, maar het zout blijft achter.', 'Zo brengt een grote rivier als de Rijn bijvoorbeeld elke dag zout naar de Noordzee.', 'Kortom: het zout in zee komt van het land en hoopt zich al miljoenen jaren op.'],
      k:['Zeewater is zout. Hoe komt dat?', 'Rivieren brengen zout naar zee en het water verdampt.', 'De Rijn brengt zout naar de Noordzee.', 'Het zout in zee komt van het land.'],
      o:'waarom de zee zout is', of:['de Rijn', 'water'], sg:'De zee is zout doordat rivieren zout van het land naar zee brengen, waar het achterblijft als het water verdampt.', sf:['De Rijn stroomt naar de Noordzee.', 'Zeewater is zout, en daarom kun je het niet drinken.'] },
    { t:'Altijd op je pootjes', a:['Een kat die van een kast valt, komt bijna altijd op zijn pootjes terecht. Hoe doet hij dat?', 'Een kat voelt met zijn evenwichtsorgaan in het oor waar boven en onder is. Tijdens de val draait hij eerst zijn kop en dan de rest van zijn lijf.', 'Op filmpjes in slow motion zie je bijvoorbeeld hoe een kat zich in een fractie van een seconde omdraait.', 'Een kat landt dus op zijn pootjes doordat hij zich razendsnel omdraait tijdens de val.'],
      k:['Een kat landt bijna altijd op zijn pootjes.', 'De kat voelt waar boven is en draait zich om.', 'In slow motion zie je de kat draaien.', 'De kat landt goed doordat hij zich snel omdraait.'],
      o:'hoe katten op hun pootjes landen', of:['filmpjes in slow motion', 'huisdieren'], sg:'Een kat landt bijna altijd op zijn pootjes, doordat hij voelt waar boven is en zich tijdens de val snel omdraait.', sf:['Op filmpjes zie je katten in slow motion.', 'Katten zijn slimmer dan honden.'] },
    { t:'Muziek bij het leren', a:['Veel leerlingen zetten muziek op als ze huiswerk maken. Helpt dat eigenlijk?', 'Muziek met tekst kan je afleiden, omdat je hersenen de woorden willen volgen. Rustige muziek zonder zang stoort minder.', 'Wie bijvoorbeeld woordjes leert terwijl er een liedje met tekst speelt, onthoudt er vaak minder.', 'Kortom: kies bij het leren liever stilte of muziek zonder tekst.'],
      k:['Veel leerlingen leren met muziek aan.', 'Muziek met tekst kan je afleiden.', 'Met een liedje erbij onthoud je minder woordjes.', 'Kies bij het leren stilte of muziek zonder tekst.'],
      o:'muziek bij het leren', of:['woordjes leren', 'muziek'], sg:'Muziek met tekst kan je afleiden bij het leren, dus kies liever stilte of muziek zonder zang.', sf:['Met een liedje erbij onthoud je minder woordjes.', 'Muziek luisteren is het leukste wat er is.'] },
    { t:'Fietsland', a:['Nederland is een echt fietsland. Er zijn hier meer fietsen dan mensen.', 'Dat komt doordat ons land plat is en de afstanden klein zijn. Ook zijn er veel aparte fietspaden, zodat je veilig kunt fietsen.', 'Zo fietsen veel leerlingen bijvoorbeeld elke dag vijf kilometer of meer naar school.', 'Door het vlakke land en de goede fietspaden is de fiets dus heel populair in Nederland.'],
      k:['Nederland is een fietsland.', 'Het land is plat en er zijn veel fietspaden.', 'Veel leerlingen fietsen ver naar school.', 'Daardoor is de fiets hier heel populair.'],
      o:'fietsen in Nederland', of:['fietspaden', 'verkeer'], sg:'In Nederland wordt veel gefietst, doordat het land plat is en er veel fietspaden zijn.', sf:['Veel leerlingen fietsen elke dag naar school.', 'Fietsen is veel gezonder dan met de auto gaan.'] },
    { t:'Gekleurde bladeren', a:['In de herfst worden de bladeren aan de bomen geel, oranje en rood. Hoe komt dat?', 'In de zomer zit er veel bladgroen in de bladeren. In de herfst breekt de boom dat bladgroen af. Dan zie je de gele en oranje kleuren die er al die tijd in zaten.', 'Bij een berk zie je bijvoorbeeld in oktober opeens felgele bladeren.', 'Bladeren verkleuren dus doordat het groen verdwijnt en de andere kleuren tevoorschijn komen.'],
      k:['In de herfst krijgen bladeren andere kleuren.', 'De boom breekt het bladgroen af, zodat andere kleuren zichtbaar worden.', 'Een berk krijgt gele bladeren.', 'Bladeren verkleuren doordat het groen verdwijnt.'],
      o:'waarom bladeren verkleuren', of:['de berk', 'de herfst'], sg:'In de herfst verkleuren bladeren, doordat de boom het bladgroen afbreekt en de andere kleuren zichtbaar worden.', sf:['In oktober heeft een berk gele bladeren.', 'In de herfst waait het vaak hard en vallen de bladeren.'] },
    { t:'Energiedrankjes', a:['Energiedrankjes zijn populair bij jongeren. Maar ze zijn niet zo onschuldig als ze lijken.', 'In een blikje zit veel cafeïne en vaak ook veel suiker. Daardoor kun je onrustig worden en slecht slapen.', 'Een blikje van een halve liter bevat bijvoorbeeld ongeveer net zoveel cafeïne als twee koppen koffie.', 'Kortom: met energiedrankjes kun je beter voorzichtig zijn.'],
      k:['Energiedrankjes zijn populair, maar niet onschuldig.', 'Door de cafeïne en suiker word je onrustig en slaap je slecht.', 'Een groot blikje heeft net zoveel cafeïne als twee koppen koffie.', 'Wees voorzichtig met energiedrankjes.'],
      o:'energiedrankjes', of:['koffie', 'drinken'], sg:'Energiedrankjes bevatten veel cafeïne en suiker, waardoor je onrustig wordt en slecht slaapt. Wees er dus voorzichtig mee.', sf:['Een groot blikje heeft net zoveel cafeïne als twee koppen koffie.', 'Jongeren drinken liever energiedrankjes dan water.'] },
    { t:'Zweten', a:['Na een potje voetbal ben je vaak helemaal bezweet. Waarom zweet je eigenlijk?', 'Zweten is de manier van je lichaam om af te koelen. Het zweet verdampt op je huid en neemt daarbij warmte mee.', 'Op een hete zomerdag kun je bijvoorbeeld een paar liter vocht verliezen door te zweten.', 'Zweten is dus heel nuttig: het voorkomt dat je lichaam te warm wordt.'],
      k:['Na het sporten ben je bezweet.', 'Zweten koelt je lichaam af doordat het zweet verdampt.', 'Op een hete dag verlies je liters vocht.', 'Zweten voorkomt dat je te warm wordt.'],
      o:'waarom je zweet', of:['hete zomerdagen', 'sport'], sg:'Je zweet om af te koelen: het zweet verdampt en neemt warmte mee, zodat je niet te warm wordt.', sf:['Op een hete dag verlies je veel vocht.', 'Na het voetballen moet je altijd douchen.'] },
    { t:'Cyberpesten', a:['Pesten gebeurt niet alleen op het schoolplein, maar ook online. Dat heet cyberpesten.', 'Online pesten kan de hele dag doorgaan, ook als je thuis bent. Bovendien zien vaak veel mensen de berichten.', 'Een gemene foto in een groepsapp wordt bijvoorbeeld binnen een paar minuten door de hele klas gezien.', 'Cyberpesten kan dus extra hard aankomen, omdat je er bijna niet aan kunt ontsnappen.'],
      k:['Pesten gebeurt ook online.', 'Online pesten gaat de hele dag door en veel mensen zien het.', 'Een gemene foto gaat snel rond in de groepsapp.', 'Cyberpesten komt hard aan, omdat je er niet aan ontsnapt.'],
      o:'cyberpesten', of:['groepsapps', 'school'], sg:'Cyberpesten komt extra hard aan, omdat het de hele dag doorgaat en veel mensen het zien.', sf:['Een gemene foto gaat snel rond in de groepsapp.', 'Op het schoolplein wordt veel meer gepest dan online.'] },
    { t:'Vulkanen', a:['Diep onder de grond is het zo heet dat steen smelt. Soms komt dat hete gesteente naar boven bij een vulkaan.', 'Het gesmolten gesteente heet magma. Als de druk onder de grond te groot wordt, komt het magma met kracht naar buiten. Dan noemen we het lava.', 'Zo kwam er in 2010 bij een vulkaan op IJsland zoveel as vrij dat er dagenlang bijna geen vliegtuigen konden vliegen boven Europa.', 'Een vulkaan is dus een plek waar heet gesteente uit het binnenste van de aarde naar buiten komt.'],
      k:['Diep in de aarde is het heel heet.', 'Door hoge druk komt magma naar buiten als lava.', 'In 2010 legde een vulkaan op IJsland het vliegverkeer stil.', 'Bij een vulkaan komt heet gesteente naar buiten.'],
      o:'hoe een vulkaan werkt', of:['IJsland', 'de natuur'], sg:'Bij een vulkaan komt heet, gesmolten gesteente door hoge druk uit het binnenste van de aarde naar buiten.', sf:['In 2010 konden er door een vulkaan geen vliegtuigen vliegen.', 'Vulkanen zijn gevaarlijk en je mag er nooit dichtbij komen.'] },
    { t:'Sparen voor iets groots', a:['Wil je iets duurs kopen, zoals een spelcomputer? Dan moet je meestal sparen.', 'Het helpt om een doel te kiezen en uit te rekenen hoeveel je per week opzij moet zetten. Zet dat geld meteen apart, dan geef je het niet per ongeluk uit.', 'Wie bijvoorbeeld 300 euro nodig heeft en elke week 15 euro spaart, heeft het geld na twintig weken bij elkaar.', 'Met een duidelijk doel en een vast bedrag per week lukt sparen dus veel beter.'],
      k:['Voor iets duurs moet je sparen.', 'Kies een doel en zet elke week een vast bedrag apart.', 'Met 15 euro per week heb je in twintig weken 300 euro.', 'Met een doel en een vast bedrag lukt sparen beter.'],
      o:'sparen', of:['een spelcomputer', 'geld'], sg:'Sparen voor iets duurs lukt beter als je een doel kiest en elke week een vast bedrag apart zet.', sf:['Wie 15 euro per week spaart, heeft na twintig weken 300 euro.', 'Een spelcomputer is veel te duur voor jongeren.'] }
  ];
  function alineaTekst(A, nadruk){
    return '<div class="lr-tekst"><p><b>' + A.t + '</b></p>' + A.a.map(function(p, i){
      return '<p><b>' + (i + 1) + '</b> ' + (i === nadruk ? '<mark>' + p + '</mark>' : p) + '</p>'; }).join('') + '</div>';
  }
  function functieStap(R, A, i, t){
    var f = FUNCTIES[i];
    return K(R, t || 'Welke functie heeft alinea ' + (i + 1) + '?', f, FUNCTIES.filter(function(x){ return x !== f; }), 'Kenmerk van een ' + f + ': ' + FUNCKENM[f] + '.');
  }
  function maakFunctie(R){
    var A = R.kies(ALINEA), i = R.heel(0, 3), f = FUNCTIES[i];
    return OP('Welke functie heeft alinea ' + (i + 1) + '?', alineaTekst(A, i), [
      K(R, 'Waar let je op bij alinea ' + (i + 1) + '?', FUNCKENM[f], ander(R, FUNCTIES, [f], 2).map(function(x){ return FUNCKENM[x]; }),
        i === 0 ? 'Het is de eerste alinea van de tekst.' : i === 3 ? 'Het is de laatste alinea. Zoek ‘dus’ of ‘kortom’.' : 'Staat er ‘bijvoorbeeld’ of ‘zo’ in? Of legt de alinea iets uit?'),
      functieStap(R, A, i)
    ]);
  }
  function maakKernzin(R){
    var T = R.kies(TEKSTEN), z = T.z.map(function(x){ return x[0]; }), kern = kernVan(T), eerst = z[0] === kern;
    var u = R.kies(zinnen(T, 'u'));
    return OP('Wat is de kernzin?', tekst(z.join(' ')), [
      K(R, 'De kernzin staat meestal vooraan of achteraan. Lees de eerste en de laatste zin. Welke zegt het belangrijkste?', eerst ? 'de eerste zin' : 'de laatste zin', [eerst ? 'de laatste zin' : 'de eerste zin', 'een zin in het midden'],
        'Welke zin vat de hele alinea samen? De andere zinnen gaan daarover. Eerste zin: ' + z[0]),
      K(R, 'Welke zin is de kernzin?', kern, [vbVan(T), u], 'De kernzin is de ' + (eerst ? 'eerste' : 'laatste') + ' zin. Een voorbeeld is nooit de kernzin.')
    ]);
  }
  function maakHoofdzaak(R){
    var T = R.kies(TEKSTEN), u = R.kies(zinnen(T, 'u')), sig = vbSignaal(T);
    var f = {}; f[u] = 'Die zin legt iets uit over de hoofdzaak. Een voorbeeld kun je makkelijker missen.';
    return OP('Welke zin is een bijzaak?', heleTekst(T), [
      K(R, 'Wat is de hoofdzaak? Zoek de kernzin.', kernVan(T), [vbVan(T), u], 'Kijk naar de eerste en de laatste zin.'),
      K(R, 'Een voorbeeld is altijd een bijzaak. Welk woord laat zien dat er een voorbeeld komt?', sig, woordenUit(R, T.z.map(function(x){ return x[0]; }).join(' '), [sig, 'bijvoorbeeld', 'dus', 'maar', 'toch', 'want'], 2), 'Zoek ‘bijvoorbeeld’ of ‘zo’.'),
      K(R, 'Welke zin is een bijzaak: die kun je missen zonder dat de boodschap verandert?', vbVan(T), [kernVan(T), u], 'Het is de zin met ' + q(sig) + '.', { fout:f })
    ]);
  }
  function maakOnderwerp(R){
    var T = R.kies(TEKSTEN);
    return OP('Wat is het onderwerp?', heleTekst(T, true), [
      K(R, 'Kijk naar de titel en naar wat steeds terugkomt. Welk woord zie je steeds?', T.w, T.wf, 'De titel is: ' + T.t + '. Welk woord daaruit komt ook in de tekst steeds terug?'),
      onderwerpStap(R, T)
    ]);
  }
  function maakHoofdgedachte(R){
    var T = R.kies(TEKSTEN), u = R.kies(zinnen(T, 'u'));
    var f = {}; f[T.hf[0]] = 'Dat is een detail, niet het belangrijkste.'; f[T.hf[1]] = 'Dat is te algemeen: het staat niet zo in de tekst.';
    return OP('Wat is de hoofdgedachte?', heleTekst(T, true), [
      onderwerpStap(R, T, 'Wat is eerst het onderwerp van de tekst?'),
      K(R, 'Welke zin zegt het belangrijkste over ' + T.o + '?', kernVan(T), [vbVan(T), u], 'Kijk vooral naar de eerste en de laatste zin. Een voorbeeld is nooit het belangrijkste.'),
      K(R, 'Wat is de hoofdgedachte van de tekst?', T.h, T.hf, 'De hoofdgedachte is de belangrijkste zin over het onderwerp: ' + T.o + '.', { fout:f })
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lees-geheel', niveau:'1F', domein:'lezen', naam:'De tekst als geheel',
        uit:'Voordat je een tekst in stukjes bekijkt, kijk je naar het geheel: waar gaat hij over, wat is het belangrijkste, waarom is hij geschreven, wat voor tekst is het en hoe lees je hem?' },
      doelen:[
        { id:'lees-onderwerp', naam:'Het onderwerp', kort:'Kijk naar de titel en naar het woord dat steeds terugkomt',
          uit:'<p>Het <b>onderwerp</b> is waar de tekst over gaat, in een paar woorden. Bijvoorbeeld: <i>plastic in zee</i>.</p><p>Zo vind je het: kijk naar de <b>titel</b> en zoek het woord dat <b>steeds terugkomt</b>. Let op: een detail is te klein, en iets als <i>het milieu</i> is te breed.</p>',
          wanneer:'je een tekst voor het eerst leest.',
          maak:function(R){ return maakOnderwerp(R); } },
        { id:'lees-hoofdgedachte', naam:'De hoofdgedachte', kort:'De hoofdgedachte is het belangrijkste dat de schrijver over het onderwerp zegt',
          uit:'<p>Het onderwerp zegt <i>waarover</i> de tekst gaat. De <b>hoofdgedachte</b> zegt <i>wat</i> de schrijver daarover vindt of vertelt: de belangrijkste zin.</p><p>Voorbeeld: onderwerp <i>plastic in zee</i>, hoofdgedachte <i>plastic in zee is een groot gevaar voor dieren</i>.</p><p>Zoek eerst het onderwerp. Kijk dan vooral naar de eerste en de laatste zin.</p>',
          wanneer:'je moet zeggen wat de schrijver vooral duidelijk wil maken.',
          maak:function(R){ return maakHoofdgedachte(R); } },
        { id:'lees-doel-informeren', naam:'Tekstdoel: informeren', kort:'Een informerende tekst geeft feiten, zonder mening',
          uit:'<p>Een tekst die wil <b>informeren</b>, vertelt je iets wat je nog niet wist. Er staan <b>feiten</b> in, geen mening.</p><p>Voorbeeld: <i>Een octopus heeft acht armen en drie harten.</i></p><p>Denk aan een schoolboek, een nieuwsbericht of een uitleg op een website.</p>',
          wanneer:'je wilt weten waarom een tekst geschreven is.',
          maak:function(R){ return maakTdoelPer(R, 'informeren'); } },
        { id:'lees-doel-overtuigen', naam:'Tekstdoel: overtuigen', kort:'Een overtuigende tekst geeft een mening met argumenten',
          uit:'<p>Een tekst die wil <b>overtuigen</b>, wil dat jij het met de schrijver eens wordt. Er staat een <b>mening</b> in, met <b>argumenten</b>.</p><p>Voorbeeld: <i>Telefoons horen niet in de klas. Ze leiden af.</i></p><p>Let op woorden als <i>moeten, beter, slecht, de beste</i>.</p>',
          wanneer:'een schrijver iets vindt en jou dat ook wil laten vinden.',
          maak:function(R){ return maakTdoelPer(R, 'overtuigen'); } },
        { id:'lees-doel-amuseren', naam:'Tekstdoel: amuseren', kort:'Een amuserende tekst wil dat je geniet: grappig, spannend of ontroerend',
          uit:'<p>Een tekst die wil <b>amuseren</b>, wil dat je plezier hebt bij het lezen. Hij is <b>grappig</b>, spannend of ontroerend.</p><p>Voorbeeld: <i>Mijn opa hield de telefoon verkeerd om. Hij heeft nu veertig foto’s van zijn eigen oor.</i></p><p>Denk aan moppen, verhalen en strips.</p>',
          wanneer:'een tekst je laat lachen of meeleven.',
          maak:function(R){ return maakTdoelPer(R, 'amuseren'); } },
        { id:'lees-doel-instrueren', naam:'Tekstdoel: instrueren', kort:'Een instruerende tekst legt in stappen uit hoe je iets doet',
          uit:'<p>Een tekst die wil <b>instrueren</b>, leert je <b>hoe</b> je iets doet. Er staan <b>stappen</b> in, vaak in de gebiedende wijs: <i>leg, vouw, bak</i>.</p><p>Voorbeeld: <i>Vouw het vel dubbel. Vouw de hoeken naar het midden.</i></p><p>Denk aan een recept, een handleiding of spelregels.</p>',
          wanneer:'je iets moet maken of doen en wilt weten hoe.',
          maak:function(R){ return maakTdoelPer(R, 'instrueren'); } },
        { id:'lees-doel-activeren', naam:'Tekstdoel: activeren', kort:'Een activerende tekst roept je op om iets te gaan doen',
          uit:'<p>Een tekst die wil <b>activeren</b>, wil dat jij <b>in actie komt</b>: meedoen, je aanmelden, stemmen of iets geven.</p><p>Voorbeeld: <i>Meld je nu aan voor het schoolorkest!</i></p><p>Het verschil met instrueren: activeren zegt <i>dat</i> je iets moet doen, instrueren legt uit <i>hoe</i>.</p>',
          wanneer:'een tekst je vraagt om mee te doen of iets te doen.',
          maak:function(R){ return maakTdoelPer(R, 'activeren'); } },
        { id:'lees-doel-mix', naam:'Tekstdoelen door elkaar', kort:'Kijk wat de tekst met jou wil: weten, vinden, genieten, kunnen of doen',
          uit:'<p>Elke tekst heeft een <b>doel</b>. Vraag je af: wat wil de schrijver dat ik na het lezen ...</p><p><b>weet</b> (informeren), <b>vind</b> (overtuigen), <b>voel</b> of geniet (amuseren), <b>kan</b> (instrueren), of <b>ga doen</b> (activeren)?</p>',
          wanneer:'je een onbekende tekst leest en het doel moet noemen.',
          maak:function(R){ return maakTdoelMix(R); } },
        { id:'lees-soort', naam:'Tekstsoorten', kort:'Kijk naar de vorm: elke tekstsoort heeft eigen kenmerken',
          uit:'<p>Elke <b>tekstsoort</b> herken je aan de vorm.</p><p>Een <b>nieuwsbericht</b>: wie, wat, waar en wanneer. Een <b>recept</b>: ingrediënten en stappen. Een <b>betoog</b>: een mening met argumenten. <b>Reclame</b>: een product en een aanbieding. Een <b>verhaal</b>: personages en wat ze meemaken.</p>',
          wanneer:'je moet zeggen wat voor tekst je voor je hebt.',
          maak:function(R){ return maakSoort(R, R.kies(SOORT)); } },
        { id:'lees-strategie', naam:'Leesstrategieën', kort:'Kies hoe je leest bij wat je wilt weten',
          uit:'<p>Je leest niet elke tekst op dezelfde manier. Vraag je eerst af wat je wilt weten.</p><p><b>Oriënterend</b>: is de tekst bruikbaar? Kijk naar titel, kopjes en plaatjes. <b>Globaal</b>: waar gaat het over? Lees snel. <b>Zoekend</b>: je zoekt één ding. <b>Intensief</b>: je wilt alles precies weten, zin voor zin.</p>',
          wanneer:'je een tekst moet lezen voor een opdracht, een toets of jezelf.',
          maak:function(R){ return maakStrat(R, R.kies(SITUATIE)); } }
      ] },
    { groep:{ id:'lees-alinea', niveau:'1F', domein:'lezen', naam:'Alinea’s en kernzinnen',
        uit:'Een tekst bestaat uit alinea’s. Elke alinea heeft een kernzin en een eigen taak in de tekst. Wie dat ziet, ziet ook wat belangrijk is en wat niet.' },
      doelen:[
        { id:'lees-kernzin', naam:'De kernzin van een alinea', kort:'De kernzin is de belangrijkste zin: meestal de eerste, soms de laatste',
          uit:'<p>De <b>kernzin</b> is de belangrijkste zin van een alinea. De andere zinnen gaan erover: ze leggen uit of geven een voorbeeld.</p><p>Meestal is de kernzin de <b>eerste zin</b>. Soms is het de <b>laatste zin</b>, vaak met <i>dus</i>.</p><p>Een voorbeeld is nooit de kernzin.</p>',
          wanneer:'je wilt weten wat een alinea vooral zegt.',
          maak:function(R){ return maakKernzin(R); } },
        { id:'lees-functie', naam:'De functie van een alinea', kort:'Kijk wat de alinea doet: inleiden, uitleggen, een voorbeeld geven of afsluiten',
          uit:'<p>Elke alinea heeft een <b>functie</b>: een taak in de tekst.</p><p>De <b>inleiding</b> noemt het onderwerp. De <b>uitleg</b> vertelt hoe of waarom. Een <b>voorbeeld</b> laat één geval zien (<i>bijvoorbeeld, zo</i>). De <b>conclusie</b> sluit af (<i>dus, kortom</i>).</p>',
          wanneer:'een vraag zegt: wat is de functie van alinea 3?',
          maak:function(R){ return maakFunctie(R); } },
        { id:'lees-hoofdzaak', naam:'Hoofdzaak en bijzaak', kort:'Hoofdzaken heb je nodig, bijzaken zoals voorbeelden kun je missen',
          uit:'<p>Een <b>hoofdzaak</b> is belangrijke informatie: zonder die zin begrijp je de tekst niet. Een <b>bijzaak</b> kun je missen.</p><p>Een <b>voorbeeld</b> is altijd een bijzaak. Je herkent het aan <i>bijvoorbeeld</i> of <i>zo</i>.</p>',
          wanneer:'je moet kiezen wat belangrijk is, bijvoorbeeld bij samenvatten.',
          maak:function(R){ return maakHoofdzaak(R); } }
      ] }
  ]);

  /* ================= LEZEN: signaalwoorden en verwijswoorden ================= */

  /* alle signaalwoorden: die komen nooit als foute keuze bij 'zoek het signaalwoord' */
  var ALLESIG = ['ook', 'bovendien', 'eerste', 'tweede', 'daarnaast', 'verder', 'tevens', 'maar', 'echter', 'toch', 'hoewel', 'doordat', 'daardoor', 'waardoor', 'hierdoor',
    'omdat', 'want', 'daarom', 'zodat', 'als', 'mits', 'tenzij', 'indien', 'dus', 'kortom', 'concluderend', 'bijvoorbeeld', 'zoals', 'daarna', 'eerst', 'toen', 'nadat', 'voordat',
    'terwijl', 'sinds', 'vervolgens', 'evenals', 'even', 'net', 'door', 'eens'];
  /* per verband: wat het signaalwoord doet, een hint bij de laatste stap, en de opgaven [tekst, signaalwoord, vraag, goed, [fout (eerst het andere stuk), fout]] */
  var VERB = {
    opsomming:{ doet:'er komt nog iets bij: een extra punt', hint:'Het extra punt staat na het signaalwoord.', fout:'Dat stond er al voor het signaalwoord. Wat komt erbij?', o:[
      ['Fietsen naar school is gezond. Bovendien bespaar je er geld mee.', 'Bovendien', 'Welk tweede voordeel noemt de schrijver?', 'je bespaart geld', ['fietsen is gezond', 'je bent sneller op school']],
      ['Een hond moet je elke dag uitlaten. Daarnaast moet je hem goed opvoeden.', 'Daarnaast', 'Welke tweede taak noemt de schrijver?', 'de hond goed opvoeden', ['de hond elke dag uitlaten', 'de hond elke dag borstelen']],
      ['Ten eerste is de kantine te klein. Ten tweede is het eten er te duur.', 'Ten tweede', 'Wat is het tweede probleem?', 'het eten is te duur', ['de kantine is te klein', 'de kantine is te vies']],
      ['In de zomer kun je zwemmen in het meer. Ook kun je er kanoën.', 'Ook', 'Wat kun je nog meer doen bij het meer?', 'kanoën', ['zwemmen', 'vissen']],
      ['Mijn telefoon is traag. Verder is de batterij snel leeg.', 'Verder', 'Welk tweede probleem noemt de schrijver?', 'de batterij is snel leeg', ['de telefoon is traag', 'het scherm is kapot']],
      ['In de pauze kun je basketballen op het plein. Bovendien is de bibliotheek dan open.', 'Bovendien', 'Wat kun je in de pauze nog meer doen?', 'naar de bibliotheek gaan', ['basketballen op het plein', 'naar huis gaan']],
      ['Een kat is makkelijk te verzorgen. Hij is ook heel gezellig.', 'ook', 'Welk tweede voordeel van een kat noemt de schrijver?', 'een kat is gezellig', ['een kat is makkelijk te verzorgen', 'een kat is goedkoop']],
      ['Op de camping zijn een zwembad en een speeltuin. Daarnaast kun je er fietsen huren.', 'Daarnaast', 'Wat kun je op de camping nog meer doen?', 'fietsen huren', ['zwemmen in het zwembad', 'paardrijden']],
      ['Voor de schoolreis moet je een lunchpakket meenemen. Vergeet ook je regenjas niet.', 'ook', 'Wat moet je nog meer meenemen?', 'je regenjas', ['een lunchpakket', 'je zwemspullen']],
      ['Gamen is leuk om samen te doen. Bovendien train je er je reactievermogen mee.', 'Bovendien', 'Welk tweede voordeel van gamen noemt de schrijver?', 'je traint je reactievermogen', ['het is leuk om samen te doen', 'het is goedkoop']],
      ['Groente bevat veel vitamines. Verder zitten er veel vezels in.', 'Verder', 'Wat zit er nog meer in groente?', 'veel vezels', ['veel vitamines', 'veel suiker']],
      ['Wie een bijbaantje heeft, verdient geld. Daarnaast leer je er samenwerken.', 'Daarnaast', 'Wat levert een bijbaantje nog meer op?', 'je leert samenwerken', ['je verdient geld', 'je krijgt vrij van school']],
      ['De nieuwe sporthal heeft een klimwand. Ook is er een groot zwembad.', 'Ook', 'Wat heeft de sporthal nog meer?', 'een groot zwembad', ['een klimwand', 'een ijsbaan']],
      ['Ten eerste is een schooluniform goedkoop. Ten tweede ziet iedereen er hetzelfde uit.', 'Ten tweede', 'Wat is het tweede argument?', 'iedereen ziet er hetzelfde uit', ['een uniform is goedkoop', 'een uniform is mooi']]
    ] },
    tegenstelling:{ doet:'er komt iets wat ertegenin gaat', hint:'Wat na het signaalwoord staat, gaat in tegen het eerste stuk.', fout:'Dat is het eerste stuk. Wat gaat daartegenin?', o:[
      ['Ik wilde graag naar het concert, maar de kaartjes waren uitverkocht.', 'maar', 'Wat ging er tegen de wens in?', 'de kaartjes waren uitverkocht', ['ik wilde naar het concert', 'het concert was saai']],
      ['Daan had hard geleerd. Toch haalde hij een onvoldoende.', 'Toch', 'Wat had je niet verwacht?', 'Daan haalde een onvoldoende', ['Daan had hard geleerd', 'Daan haalde een tien']],
      ['Katten zijn heel zelfstandig. Honden hebben echter veel aandacht nodig.', 'echter', 'Wat is het verschil tussen katten en honden?', 'honden hebben veel aandacht nodig, katten niet', ['katten hebben veel aandacht nodig, honden niet', 'katten en honden zijn allebei zelfstandig']],
      ['Het regende hard, maar de wedstrijd ging gewoon door.', 'maar', 'Wat gebeurde er ondanks de regen?', 'de wedstrijd ging door', ['het regende hard', 'de wedstrijd werd afgelast']],
      ['Het nieuwe spel is duur. Toch kopen veel jongeren het.', 'Toch', 'Wat gebeurt er, ook al is het spel duur?', 'veel jongeren kopen het', ['het spel is duur', 'niemand koopt het']],
      ['Mila is heel goed in wiskunde, maar met Frans heeft ze moeite.', 'maar', 'Waar heeft Mila moeite mee?', 'Frans', ['wiskunde', 'gym']],
      ['Energiedrankjes geven je even een oppepper. Ze zijn echter slecht voor je slaap.', 'echter', 'Wat is het nadeel van energiedrankjes?', 'ze zijn slecht voor je slaap', ['ze geven je een oppepper', 'ze zijn duur']],
      ['Ik was doodmoe na de training. Toch ging ik nog even hardlopen.', 'Toch', 'Wat deed de schrijver, ook al was hij moe?', 'nog even hardlopen', ['meteen naar bed gaan', 'stoppen met trainen']],
      ['De film kreeg slechte recensies, maar wij vonden hem geweldig.', 'maar', 'Wat vonden wij van de film?', 'geweldig', ['slecht', 'saai']],
      ['In de zomer is het strand vol. In de winter is het er echter heel rustig.', 'echter', 'Hoe is het strand in de winter?', 'heel rustig', ['heel vol', 'gesloten']],
      ['Ons team speelde slecht. Toch wonnen we met 2-1.', 'Toch', 'Wat is verrassend?', 'het team won', ['het team speelde slecht', 'het team verloor']],
      ['Lisa wil heel graag een hond, maar haar vader is allergisch.', 'maar', 'Wat staat de wens van Lisa in de weg?', 'haar vader is allergisch', ['Lisa wil een hond', 'honden zijn duur']],
      ['Zonnepanelen zijn duur om te kopen. Je bespaart echter veel op je energierekening.', 'echter', 'Wat staat tegenover de hoge prijs?', 'je bespaart op je energierekening', ['zonnepanelen zijn duur', 'zonnepanelen gaan snel kapot']],
      ['Het was al laat, maar niemand wilde naar huis.', 'maar', 'Wat gebeurde er, ook al was het laat?', 'niemand wilde naar huis', ['het was al laat', 'iedereen ging naar huis']]
    ] },
    'oorzaak en gevolg':{ doet:'het ene gebeurt door het andere: een oorzaak en een gevolg', hint:'De oorzaak gebeurt eerst. Het gevolg komt daar vanzelf uit voort.', fout:'Dat is juist het andere stuk. Lees de vraag nog eens: oorzaak of gevolg?', o:[
      ['Doordat het hard had gevroren, lag er ijs op de sloot.', 'Doordat', 'Wat is het gevolg?', 'er lag ijs op de sloot', ['het had hard gevroren', 'de sloot was leeg']],
      ['Het regende de hele nacht. Daardoor stond het veld onder water.', 'Daardoor', 'Wat is de oorzaak?', 'het regende de hele nacht', ['het veld stond onder water', 'de wedstrijd ging door']],
      ['De bus had pech, waardoor ik te laat op school kwam.', 'waardoor', 'Wat is het gevolg?', 'ik kwam te laat op school', ['de bus had pech', 'ik ging lopen']],
      ['Doordat de batterij leeg was, kon ik niemand bellen.', 'Doordat', 'Wat is de oorzaak?', 'de batterij was leeg', ['ik kon niemand bellen', 'ik had geen beltegoed']],
      ['De aarde wordt warmer. Daardoor smelt het ijs op de Noordpool.', 'Daardoor', 'Wat is het gevolg?', 'het ijs op de Noordpool smelt', ['de aarde wordt warmer', 'het wordt kouder']],
      ['Een storm blies een boom om, waardoor de weg werd geblokkeerd.', 'waardoor', 'Wat is het gevolg?', 'de weg werd geblokkeerd', ['een storm blies een boom om', 'er stond file']],
      ['Doordat Sem zijn enkel verstuikte, kon hij niet meedoen aan de finale.', 'Doordat', 'Wat is het gevolg?', 'Sem kon niet meedoen aan de finale', ['Sem verstuikte zijn enkel', 'Sem won de finale']],
      ['De verwarming in de klas was kapot. Daardoor zat iedereen met zijn jas aan.', 'Daardoor', 'Wat is de oorzaak?', 'de verwarming was kapot', ['iedereen had zijn jas aan', 'het raam stond open']],
      ['Er kwamen veel bezoekers op het festival, waardoor er lange rijen ontstonden.', 'waardoor', 'Wat is het gevolg?', 'er ontstonden lange rijen', ['er kwamen veel bezoekers', 'het festival werd afgelast']],
      ['Doordat de wifi uitviel, kon de klas de digitale toets niet maken.', 'Doordat', 'Wat is de oorzaak?', 'de wifi viel uit', ['de klas kon de toets niet maken', 'de toets was te moeilijk']],
      ['Mijn broertje at een hele zak snoep. Daardoor had hij buikpijn.', 'Daardoor', 'Wat is het gevolg?', 'hij had buikpijn', ['hij at een zak snoep', 'hij had honger']],
      ['Het was erg glad op de weg, waardoor veel mensen uitgleden.', 'waardoor', 'Wat is de oorzaak?', 'het was erg glad', ['veel mensen gleden uit', 'het was donker']],
      ['De koelkast stond de hele dag open. Hierdoor was de melk zuur geworden.', 'Hierdoor', 'Wat is het gevolg?', 'de melk was zuur', ['de koelkast stond open', 'de melk was op']],
      ['Doordat er minder bijen zijn, krijgen sommige fruitbomen minder vruchten.', 'Doordat', 'Wat is de oorzaak?', 'er zijn minder bijen', ['fruitbomen krijgen minder vruchten', 'het is te koud']]
    ] },
    reden:{ doet:'er komt een reden: waarom iemand iets doet of vindt', hint:'Na ‘want’ en ‘omdat’ staat de reden. Bij ‘daarom’ staat de reden juist ervoor.', fout:'Dat is wat er gebeurt, niet waarom.', o:[
      ['Ik neem een paraplu mee, want het gaat regenen.', 'want', 'Wat is de reden?', 'het gaat regenen', ['ik neem een paraplu mee', 'ik heb het koud']],
      ['Noor gaat vroeg naar bed, omdat ze morgen een wedstrijd heeft.', 'omdat', 'Wat is de reden?', 'ze heeft morgen een wedstrijd', ['ze gaat vroeg naar bed', 'ze is ziek']],
      ['Het zwembad is dicht. Daarom gaan we naar het strand.', 'Daarom', 'Waarom gaan we naar het strand?', 'het zwembad is dicht', ['we gaan naar het strand', 'het is mooi weer']],
      ['Tim spaart zijn zakgeld, want hij wil een nieuwe fiets.', 'want', 'Wat is de reden?', 'hij wil een nieuwe fiets', ['hij spaart zijn zakgeld', 'hij heeft geen zakgeld']],
      ['We eten vanavond pizza, omdat mijn zus jarig is.', 'omdat', 'Wat is de reden?', 'mijn zus is jarig', ['we eten pizza', 'er is niets anders in huis']],
      ['Ravi wil beter worden in voetbal. Daarom traint hij elke dag.', 'Daarom', 'Waarom traint Ravi elke dag?', 'hij wil beter worden in voetbal', ['hij traint elke dag', 'zijn trainer wil het']],
      ['Ik draag een helm, want ik wil mijn hoofd beschermen.', 'want', 'Wat is de reden?', 'ik wil mijn hoofd beschermen', ['ik draag een helm', 'het is verplicht']],
      ['Lisa leest graag fantasy, omdat ze dan in een andere wereld stapt.', 'omdat', 'Wat is de reden?', 'ze stapt dan in een andere wereld', ['Lisa leest graag fantasy', 'fantasyboeken zijn dik']],
      ['De docent was ziek. Daarom kregen we een tussenuur.', 'Daarom', 'Waarom kregen we een tussenuur?', 'de docent was ziek', ['we kregen een tussenuur', 'de klas was te druk']],
      ['Joep gaat met de trein, want zijn fiets is kapot.', 'want', 'Wat is de reden?', 'zijn fiets is kapot', ['Joep gaat met de trein', 'de trein is snel']],
      ['Mijn moeder wil gezonder leven. Daarom fietst ze voortaan naar haar werk.', 'Daarom', 'Waarom fietst ze naar haar werk?', 'ze wil gezonder leven', ['ze fietst naar haar werk', 'haar auto is kapot']],
      ['Ik zet mijn telefoon op stil, want ik moet me concentreren.', 'want', 'Wat is de reden?', 'ik moet me concentreren', ['ik zet mijn telefoon op stil', 'mijn batterij is bijna leeg']],
      ['Sara koos voor biologie, omdat ze later dierenarts wil worden.', 'omdat', 'Wat is de reden?', 'ze wil later dierenarts worden', ['Sara koos voor biologie', 'biologie is makkelijk']]
    ] },
    doel:{ doet:'er komt wat iemand wil bereiken', hint:'Na ‘zodat’ of ‘om … te’ staat wat iemand wil bereiken.', fout:'Dat is wat iemand doet, niet wat hij wil bereiken.', o:[
      ['Ik zet een wekker, zodat ik niet te laat kom.', 'zodat', 'Wat wil de schrijver bereiken?', 'niet te laat komen', ['een wekker zetten', 'vroeg naar bed gaan']],
      ['Mila oefent elke dag om haar zwemdiploma te halen.', 'om … te', 'Wat wil Mila bereiken?', 'haar zwemdiploma halen', ['elke dag oefenen', 'leren duiken']],
      ['We fluisteren, zodat de baby niet wakker wordt.', 'zodat', 'Wat willen we bereiken?', 'de baby blijft slapen', ['we fluisteren', 'de baby wordt wakker']],
      ['Daan spaart om een nieuwe spelcomputer te kopen.', 'om … te', 'Wat wil Daan bereiken?', 'een nieuwe spelcomputer kopen', ['sparen', 'een baantje vinden']],
      ['De gemeente legt een zebrapad aan, zodat kinderen veilig kunnen oversteken.', 'zodat', 'Wat is het doel van het zebrapad?', 'kinderen kunnen veilig oversteken', ['de gemeente legt een zebrapad aan', 'auto’s kunnen sneller rijden']],
      ['Ik schrijf de woordjes op kaartjes om ze beter te onthouden.', 'om … te', 'Wat is het doel?', 'de woordjes beter onthouden', ['woordjes op kaartjes schrijven', 'kaartjes verzamelen']],
      ['Smeer je goed in, zodat je niet verbrandt in de zon.', 'zodat', 'Wat is het doel van insmeren?', 'niet verbranden', ['je insmeren', 'bruin worden']],
      ['Joep traint extra om in het eerste elftal te komen.', 'om … te', 'Wat wil Joep bereiken?', 'in het eerste elftal komen', ['extra trainen', 'aanvoerder worden']],
      ['We doen de ramen open, zodat er frisse lucht binnenkomt.', 'zodat', 'Wat is het doel?', 'er komt frisse lucht binnen', ['de ramen gaan open', 'het wordt warmer']],
      ['Veel mensen nemen zonnepanelen om minder te betalen voor stroom.', 'om … te', 'Wat is het doel?', 'minder betalen voor stroom', ['zonnepanelen nemen', 'meer stroom gebruiken']],
      ['De docent schrijft het huiswerk op het bord, zodat niemand het vergeet.', 'zodat', 'Wat wil de docent bereiken?', 'niemand vergeet het huiswerk', ['het huiswerk op het bord schrijven', 'de klas is stil']],
      ['Sara staat vroeg op om nog even te kunnen hardlopen.', 'om … te', 'Wat wil Sara bereiken?', 'nog even kunnen hardlopen', ['vroeg opstaan', 'op tijd op school zijn']],
      ['Zet je fiets op slot, zodat hij niet gestolen wordt.', 'zodat', 'Wat is het doel?', 'de fiets wordt niet gestolen', ['de fiets op slot zetten', 'de fiets wordt gerepareerd']]
    ] },
    tijd:{ doet:'er komt een volgorde in de tijd: wat eerst en wat daarna gebeurt', hint:'Bij ‘nadat’ gebeurt het stuk erna eerst. Bij ‘voordat’ gebeurt het andere stuk eerst. Bij ‘terwijl’ gebeurt alles tegelijk.', fout:'Kijk goed naar het signaalwoord: dat bepaalt de volgorde.', o:[
      ['Nadat ik mijn huiswerk had gemaakt, ging ik gamen.', 'Nadat', 'Wat gebeurde er eerst?', 'huiswerk maken', ['gamen', 'eten']],
      ['Voordat je gaat zwemmen, moet je douchen.', 'Voordat', 'Wat moet je eerst doen?', 'douchen', ['zwemmen', 'afdrogen']],
      ['Eerst kookten we de pasta. Daarna maakten we de saus.', 'Daarna', 'Wat deden we als laatste?', 'de saus maken', ['de pasta koken', 'de tafel dekken']],
      ['De bel ging. Toen renden alle leerlingen naar buiten.', 'Toen', 'Wat gebeurde er eerst?', 'de bel ging', ['de leerlingen renden naar buiten', 'de docent ging naar huis']],
      ['Terwijl ik de afwas deed, luisterde ik naar een podcast.', 'Terwijl', 'Hoe zit het met de tijd?', 'de twee dingen gebeurden tegelijk', ['eerst de afwas, daarna de podcast', 'eerst de podcast, daarna de afwas']],
      ['Sinds we een hond hebben, wandel ik elke dag.', 'Sinds', 'Wanneer begon het elke dag wandelen?', 'toen we een hond kregen', ['voordat we een hond hadden', 'toen de hond oud werd']],
      ['Ik pakte mijn tas in. Vervolgens fietste ik naar school.', 'Vervolgens', 'Wat gebeurde er als tweede?', 'naar school fietsen', ['de tas inpakken', 'ontbijten']],
      ['Nadat de scheidsrechter had gefloten, juichte het hele stadion.', 'Nadat', 'Wat gebeurde er eerst?', 'de scheidsrechter floot', ['het stadion juichte', 'de spelers gingen naar huis']],
      ['Voordat de film begon, kochten we popcorn.', 'Voordat', 'Wat gebeurde er eerst?', 'we kochten popcorn', ['de film begon', 'we gingen naar huis']],
      ['Mijn opa werkte veertig jaar als bakker. Daarna ging hij met pensioen.', 'Daarna', 'Wat kwam er na het werken als bakker?', 'hij ging met pensioen', ['hij werd bakker', 'hij ging leren bakken']],
      ['Toen het donker werd, gingen de straatlantaarns aan.', 'Toen', 'Wat gebeurde er eerst?', 'het werd donker', ['de lantaarns gingen aan', 'het werd licht']],
      ['Terwijl de docent uitleg gaf, maakte Tim aantekeningen.', 'Terwijl', 'Hoe zit het met de tijd?', 'de twee dingen gebeurden tegelijk', ['eerst de uitleg, daarna de aantekeningen', 'eerst de aantekeningen, daarna de uitleg']],
      ['Lees eerst de vragen. Lees daarna pas de tekst.', 'daarna', 'Wat moet je eerst doen?', 'de vragen lezen', ['de tekst lezen', 'de antwoorden opschrijven']],
      ['Sinds de nieuwe trainer er is, wint ons team bijna elke week.', 'Sinds', 'Wanneer begon het winnen?', 'toen de nieuwe trainer kwam', ['voordat de nieuwe trainer kwam', 'toen de oude trainer terugkwam']]
    ] },
    voorbeeld:{ doet:'er komt een voorbeeld bij iets wat al gezegd is', hint:'Kijk naar de zin vóór het voorbeeld: die zegt iets algemeens.', fout:'Lees de zin voor het voorbeeld nog eens. Waar gaat die over?', o:[
      ['Veel dieren houden een winterslaap. De egel slaapt bijvoorbeeld de hele winter.', 'bijvoorbeeld', 'Waarvan is de egel een voorbeeld?', 'van een dier dat een winterslaap houdt', ['van een dier dat in het water leeft', 'van een huisdier']],
      ['Sommige sporten zijn best gevaarlijk. Zo kun je bij skiën lelijk vallen.', 'Zo', 'Waarvan is skiën een voorbeeld?', 'van een sport die gevaarlijk kan zijn', ['van een sport in de zomer', 'van een sport met een bal']],
      ['In de kantine liggen veel ongezonde dingen, zoals chips en snoep.', 'zoals', 'Waarvan zijn chips en snoep een voorbeeld?', 'van ongezonde dingen', ['van gezond eten', 'van dranken']],
      ['Je kunt op veel manieren geld besparen. Je kunt bijvoorbeeld je eigen lunch meenemen.', 'bijvoorbeeld', 'Waarvan is je eigen lunch meenemen een voorbeeld?', 'van een manier om geld te besparen', ['van een manier om geld te verdienen', 'van een manier om sneller te werken']],
      ['Sommige vogels kunnen niet vliegen. Zo kan een struisvogel alleen maar rennen.', 'Zo', 'Waarvan is de struisvogel een voorbeeld?', 'van een vogel die niet kan vliegen', ['van een vogel die heel hoog vliegt', 'van een vogel die in het water leeft']],
      ['Veel apps zijn gratis, zoals de meeste spelletjes en chatapps.', 'zoals', 'Waarvan zijn spelletjes en chatapps een voorbeeld?', 'van gratis apps', ['van dure apps', 'van apps voor school']],
      ['Plastic kun je op allerlei manieren hergebruiken. Van oude flessen worden bijvoorbeeld fleecetruien gemaakt.', 'bijvoorbeeld', 'Waarvan zijn de fleecetruien een voorbeeld?', 'van hergebruik van plastic', ['van warme kleding', 'van plastic in zee']],
      ['Sommige dieren gebruiken gereedschap. Zo gebruiken chimpansees takjes om termieten uit een heuvel te vissen.', 'Zo', 'Waarvan is de chimpansee een voorbeeld?', 'van een dier dat gereedschap gebruikt', ['van een dier dat in het water leeft', 'van een dier dat in bomen slaapt']],
      ['Je kunt in de pauze veel doen, zoals tafeltennissen of lezen in de bibliotheek.', 'zoals', 'Waarvan zijn tafeltennissen en lezen een voorbeeld?', 'van dingen die je in de pauze kunt doen', ['van sporten', 'van huiswerk']],
      ['Sommige planten eten insecten. De zonnedauw vangt bijvoorbeeld vliegjes met zijn plakkerige blaadjes.', 'bijvoorbeeld', 'Waarvan is de zonnedauw een voorbeeld?', 'van een plant die insecten eet', ['van een plant met grote bloemen', 'van een insect']],
      ['Groente kun je op veel manieren lekker maken. Zo kun je wortels in de oven roosteren met honing.', 'Zo', 'Waarvan is wortels roosteren een voorbeeld?', 'van een manier om groente lekker te maken', ['van een toetje', 'van een manier om honing te maken']],
      ['Er zijn veel beroepen waarin je met dieren werkt, zoals dierenarts en boswachter.', 'zoals', 'Waarvan zijn dierenarts en boswachter een voorbeeld?', 'van beroepen waarin je met dieren werkt', ['van beroepen in een ziekenhuis', 'van dieren']],
      ['Kleine dingen kunnen het klimaat helpen. Je kunt bijvoorbeeld korter douchen.', 'bijvoorbeeld', 'Waarvan is korter douchen een voorbeeld?', 'van iets kleins wat het klimaat helpt', ['van iets wat veel geld kost', 'van een manier om schoner te worden']],
      ['Sommige games zijn heel leerzaam. In een bouwspel leer je bijvoorbeeld vooruit plannen.', 'bijvoorbeeld', 'Waarvan is het bouwspel een voorbeeld?', 'van een leerzame game', ['van een spannende game', 'van een dure game']]
    ] },
    voorwaarde:{ doet:'er komt iets wat eerst moet gelden', hint:'Na ‘als’ en ‘mits’ staat wat er moet gelden. Na ‘tenzij’ staat wanneer het niet doorgaat.', fout:'Dat is wat er gebeurt. Wat moet er eerst gelden?', o:[
      ['Je mag mee naar het feest, als je om elf uur thuis bent.', 'als', 'Wat is de voorwaarde?', 'om elf uur thuis zijn', ['mee naar het feest gaan', 'een cadeau meenemen']],
      ['De wedstrijd gaat door, tenzij het gaat onweren.', 'tenzij', 'Wanneer gaat de wedstrijd niet door?', 'als het gaat onweren', ['als de wedstrijd doorgaat', 'als het mooi weer is']],
      ['Je mag je telefoon in de pauze gebruiken, mits hij in de les in je tas zit.', 'mits', 'Wat is de voorwaarde?', 'de telefoon zit in de les in je tas', ['je gebruikt je telefoon in de pauze', 'je telefoon staat op stil']],
      ['Als het morgen mooi weer is, gaan we naar het strand.', 'Als', 'Wat moet er gelden om naar het strand te gaan?', 'het moet mooi weer zijn', ['we gaan naar het strand', 'we moeten op tijd zijn']],
      ['We vertrekken om tien uur, tenzij de trein vertraging heeft.', 'tenzij', 'Wanneer vertrekken we niet om tien uur?', 'als de trein vertraging heeft', ['als we om tien uur vertrekken', 'als de trein op tijd is']],
      ['Je krijgt een tien, mits alle antwoorden goed zijn.', 'mits', 'Wat is de voorwaarde voor een tien?', 'alle antwoorden zijn goed', ['je krijgt een tien', 'je bent als eerste klaar']],
      ['Als je elke dag tien minuten leest, wordt lezen steeds makkelijker.', 'Als', 'Wat moet je doen om makkelijker te lezen?', 'elke dag tien minuten lezen', ['lezen wordt makkelijker', 'hardop lezen voor de klas']],
      ['In dit park mogen honden los lopen, tenzij er een bord met een rode streep staat.', 'tenzij', 'Wanneer moet een hond aan de lijn?', 'als er een bord met een rode streep staat', ['als honden los lopen', 'als de hond groot is']],
      ['Indien je ziek bent, moet je je voor acht uur afmelden.', 'Indien', 'Wanneer moet je je afmelden?', 'als je ziek bent', ['voor acht uur', 'elke ochtend']],
      ['De klas gaat op schoolreis naar een pretpark, mits er genoeg geld is opgehaald.', 'mits', 'Wat is de voorwaarde voor de schoolreis?', 'er moet genoeg geld zijn opgehaald', ['de klas gaat naar een pretpark', 'het moet mooi weer zijn']],
      ['Als je je wachtwoord drie keer fout invult, wordt je account geblokkeerd.', 'Als', 'Wanneer wordt je account geblokkeerd?', 'na drie keer een fout wachtwoord', ['als je account geblokkeerd is', 'als je je wachtwoord verandert']],
      ['Je mag de film kijken, tenzij je huiswerk nog niet af is.', 'tenzij', 'Wanneer mag je de film niet kijken?', 'als je huiswerk nog niet af is', ['als je de film kijkt', 'als je huiswerk af is']],
      ['Planten groeien goed, mits ze genoeg licht en water krijgen.', 'mits', 'Wat is de voorwaarde om goed te groeien?', 'genoeg licht en water', ['planten groeien goed', 'een grote pot']]
    ] },
    conclusie:{ doet:'er komt een slotsom van wat ervoor staat', hint:'Na ‘dus’, ‘kortom’ of ‘al met al’ staat de conclusie. Wat ervoor staat, zijn de redenen.', fout:'Dat staat voor het signaalwoord: het is een reden, niet de conclusie.', o:[
      ['De bus is te laat en de trein rijdt niet. We gaan dus op de fiets.', 'dus', 'Wat is de conclusie?', 'we gaan op de fiets', ['de bus is te laat', 'we blijven thuis']],
      ['Het eten is lekker, de prijzen zijn laag en het personeel is aardig. Kortom: een aanrader!', 'Kortom', 'Wat is de conclusie?', 'het restaurant is een aanrader', ['het eten is lekker', 'de prijzen zijn te hoog']],
      ['Alle kaartjes zijn verkocht. Er kunnen dus geen mensen meer bij.', 'dus', 'Wat is de conclusie?', 'er kunnen geen mensen meer bij', ['alle kaartjes zijn verkocht', 'er komen meer kaartjes']],
      ['Mijn sleutels zitten niet in mijn tas en niet in mijn jas. Ze liggen dus nog thuis.', 'dus', 'Wat is de conclusie?', 'de sleutels liggen thuis', ['de sleutels zitten niet in de tas', 'de sleutels zijn gestolen']],
      ['Lezen vergroot je woordenschat en het helpt bij elk vak. Kortom: lezen loont.', 'Kortom', 'Wat is de conclusie?', 'lezen loont', ['lezen vergroot je woordenschat', 'lezen is saai']],
      ['Het team won alle wedstrijden en verloor er geen één. Al met al was het een topseizoen.', 'Al met al', 'Wat is de conclusie?', 'het was een topseizoen', ['het team won alle wedstrijden', 'het team moet beter trainen']],
      ['Een kat is schoon en zelfstandig, en je hoeft hem niet uit te laten. Een kat is dus een handig huisdier.', 'dus', 'Wat is de conclusie?', 'een kat is een handig huisdier', ['een kat is schoon', 'een hond is beter']],
      ['De zon schijnt, het is 25 graden en er staat geen wind. Concluderend: perfect strandweer.', 'Concluderend', 'Wat is de conclusie?', 'het is perfect strandweer', ['de zon schijnt', 'het gaat regenen']],
      ['Mila heeft de hele week geoefend en ze kent alle woordjes. Ze is dus goed voorbereid op de toets.', 'dus', 'Wat is de conclusie?', 'Mila is goed voorbereid', ['Mila kent alle woordjes', 'Mila haalt een onvoldoende']],
      ['Fietsen is gezond, goedkoop en goed voor het milieu. Kortom: pak vaker de fiets.', 'Kortom', 'Wat is de conclusie?', 'pak vaker de fiets', ['fietsen is goedkoop', 'fietsen is gevaarlijk']],
      ['De winkel gaat om zes uur dicht en het is nu kwart over zes. We zijn dus te laat.', 'dus', 'Wat is de conclusie?', 'we zijn te laat', ['de winkel gaat om zes uur dicht', 'we zijn precies op tijd']],
      ['De film was spannend, grappig en mooi gemaakt. Al met al een film om nooit te vergeten.', 'Al met al', 'Wat is de conclusie?', 'de film is onvergetelijk', ['de film was spannend', 'de film was te lang']],
      ['De plant kreeg weken geen water en stond in het donker. Hij is dus doodgegaan.', 'dus', 'Wat is de conclusie?', 'de plant is doodgegaan', ['de plant kreeg geen water', 'de plant groeit goed']]
    ] },
    vergelijking:{ doet:'twee dingen worden naast elkaar gezet: ze lijken op elkaar', hint:'Bij ‘net als’, ‘evenals’ en ‘net zo … als’ lijken twee dingen op elkaar. Wat hebben ze gemeen?', fout:'Dat staat niet in de tekst. Wat wordt er precies vergeleken?', o:[
      ['Mijn zus is gek op paarden, net als mijn moeder.', 'net als', 'Wat hebben mijn zus en mijn moeder gemeen?', 'ze zijn allebei gek op paarden', ['ze hebben allebei een paard', 'ze werken allebei op een manege']],
      ['Evenals vorig jaar won onze school de voetbalcompetitie.', 'Evenals', 'Wat wordt hier vergeleken?', 'dit jaar en vorig jaar', ['onze school en een andere school', 'voetbal en hockey']],
      ['Een dolfijn ademt met longen, net als een mens.', 'net als', 'Wat hebben een dolfijn en een mens gemeen?', 'ze ademen allebei met longen', ['ze hebben allebei kieuwen', 'ze leven allebei in zee']],
      ['De nieuwe telefoon is net zo duur als de oude.', 'net zo … als', 'Wat wordt er vergeleken?', 'de prijs van de nieuwe en de oude telefoon', ['de kleur van de telefoons', 'twee merken']],
      ['Tim is even lang als zijn vader.', 'even … als', 'Wat hebben Tim en zijn vader gemeen?', 'ze zijn even lang', ['ze zijn even oud', 'ze zijn even sterk']],
      ['Net als planten hebben schimmels water nodig om te groeien.', 'Net als', 'Wat hebben planten en schimmels gemeen?', 'ze hebben water nodig om te groeien', ['ze hebben zonlicht nodig', 'ze zijn groen']],
      ['Evenals haar broer speelt Noor in het jeugdorkest.', 'Evenals', 'Wat hebben Noor en haar broer gemeen?', 'ze spelen allebei in het jeugdorkest', ['ze spelen allebei viool', 'ze zitten in dezelfde klas']],
      ['Deze zomer was net zo warm als de vorige.', 'net zo … als', 'Wat wordt er vergeleken?', 'deze zomer en de vorige zomer', ['de zomer en de winter', 'twee landen']],
      ['Een vleermuis kan vliegen, net als een vogel.', 'net als', 'Wat hebben een vleermuis en een vogel gemeen?', 'ze kunnen allebei vliegen', ['ze leggen allebei eieren', 'ze zijn allebei zoogdieren']],
      ['Online lessen duren net zo lang als lessen in de klas.', 'net zo … als', 'Wat wordt er vergeleken?', 'hoe lang online lessen en gewone lessen duren', ['de docenten van de lessen', 'het huiswerk']],
      ['Mijn hond is even nieuwsgierig als een kat.', 'even … als', 'Wat hebben de hond en een kat gemeen?', 'ze zijn allebei nieuwsgierig', ['ze zijn allebei lui', 'ze spinnen allebei']],
      ['Evenals in Nederland wordt er in Denemarken veel gefietst.', 'Evenals', 'Wat hebben Nederland en Denemarken gemeen?', 'er wordt veel gefietst', ['het is er heel bergachtig', 'er wordt veel geskied']],
      ['Een tomaat is eigenlijk een vrucht, net als een appel.', 'net als', 'Wat hebben een tomaat en een appel gemeen?', 'ze zijn allebei een vrucht', ['ze zijn allebei groente', 'ze groeien allebei aan een boom']]
    ] }
  };
  var VERBNAMEN = Object.keys(VERB);
  var BUREN = { 'oorzaak en gevolg':['reden', 'conclusie'], reden:['oorzaak en gevolg', 'doel'], doel:['reden'], conclusie:['oorzaak en gevolg'], voorbeeld:['vergelijking'], vergelijking:['voorbeeld'] };
  function signaalStap(R, zin, sig){
    var delen = sig.split(/[\s…]+/).filter(Boolean);
    var plek = new RegExp('(^|[.!?]\\s+)' + delen[0]).test(zin) ? 'aan het begin van een zin' : 'midden in een zin';
    return K(R, 'Zoek het signaalwoord.', sig, woordenUit(R, zin, ALLESIG.concat(delen), 2),
      'Een signaalwoord koppelt twee stukken aan elkaar. Hier staat het ' + plek + '.');
  }
  function verbandOpties(R, naam, n){ return ander(R, VERBNAMEN, [naam].concat(BUREN[naam] || []), n); }
  function maakVerband(R, naam){
    var V = VERB[naam], it = R.kies(V.o), f = {}; f[it[4][0]] = V.fout;
    return OP(it[2], tekst(it[0]), [
      signaalStap(R, it[0], it[1]),
      K(R, 'Wat doet ' + q(it[1]) + '?', V.doet, verbandOpties(R, naam, 2).map(function(x){ return VERB[x].doet; }), q(it[1]) + ' is een signaalwoord van ' + naam + '.'),
      K(R, it[2], it[3], it[4], V.hint, { fout:f })
    ]);
  }
  function maakWelkVerband(R){
    var naam = R.kies(VERBNAMEN), it = R.kies(VERB[naam].o);
    return OP('Welk verband?', tekst(it[0]), [
      signaalStap(R, it[0], it[1]),
      K(R, 'Welk verband geeft ' + q(it[1]) + ' aan?', naam, verbandOpties(R, naam, 3), q(it[1]) + ' betekent: ' + VERB[naam].doet + '.')
    ]);
  }
  /* invullen: [voor, signaalwoord, na, [twee woorden die niet passen], verband] */
  var INVUL = [
    ['Ik had hard geleerd.', 'Toch', 'had ik een onvoldoende.', ['Bovendien', 'Bijvoorbeeld'], 'tegenstelling'],
    ['Het regende de hele dag,', 'waardoor', 'het veld onder water stond.', ['zoals', 'tenzij'], 'oorzaak en gevolg'],
    ['Ik neem een jas mee,', 'want', 'het wordt koud vanavond.', ['maar', 'bijvoorbeeld'], 'reden'],
    ['Fietsen is gezond.', 'Bovendien', 'is het goedkoop.', ['Daardoor', 'Bijvoorbeeld'], 'opsomming'],
    ['', 'Nadat', 'ik mijn huiswerk had gemaakt, ging ik gamen.', ['Tenzij', 'Bijvoorbeeld'], 'tijd'],
    ['Je mag mee naar het feest,', 'als', 'je om elf uur thuis bent.', ['want', 'maar'], 'voorwaarde'],
    ['Ik zet een wekker,', 'zodat', 'ik niet te laat kom.', ['tenzij', 'maar'], 'doel'],
    ['Veel dieren houden een winterslaap.', 'Zo', 'slaapt de egel de hele winter.', ['Toch', 'Maar'], 'voorbeeld'],
    ['De bus is te laat en de trein rijdt niet.', 'Dus', 'gaan we op de fiets.', ['Want', 'Bijvoorbeeld'], 'conclusie'],
    ['Een dolfijn ademt met longen,', 'net als', 'een mens.', ['doordat', 'want'], 'vergelijking'],
    ['De batterij was leeg.', 'Daardoor', 'kon ik niemand bellen.', ['Toch', 'Bijvoorbeeld'], 'oorzaak en gevolg'],
    ['Katten zijn heel zelfstandig,', 'maar', 'honden hebben veel aandacht nodig.', ['want', 'daardoor'], 'tegenstelling'],
    ['Ravi wil beter worden in voetbal.', 'Daarom', 'traint hij elke dag.', ['Toch', 'Tenzij'], 'reden'],
    ['Ik ging douchen.', 'Daarna', 'trok ik schone kleren aan.', ['Want', 'Toch'], 'tijd'],
    ['Je krijgt een tien,', 'mits', 'alle antwoorden goed zijn.', ['want', 'toch'], 'voorwaarde'],
    ['Het eten was lekker en de bediening was vriendelijk.', 'Kortom', ': het was een geslaagde avond.', ['Toch', 'Bijvoorbeeld'], 'conclusie'],
    ['Daan spaart', 'om', 'een nieuwe fiets te kopen.', ['want', 'maar'], 'doel'],
    ['Mijn zus is gek op paarden,', 'net als', 'mijn moeder.', ['omdat', 'zodat'], 'vergelijking']
  ];
  function maakInvul(R, it){
    var zin = (it[0] ? it[0] + ' ' : '') + '[……]' + (/^[,:;.]/.test(it[2]) ? '' : ' ') + it[2];
    var naam = it[4];
    return OP('Welk signaalwoord past?', tekst(zin), [
      K(R, 'Lees de twee stukken. Welk verband is er tussen de stukken?', naam, verbandOpties(R, naam, 2), 'Bij ' + naam + ' geldt: ' + VERB[naam].doet + '.'),
      K(R, 'Welk signaalwoord past op de puntjes?', it[1], it[3], 'Je zoekt een signaalwoord voor ' + naam + '. Lees de zin met het woord erin hardop: klopt hij?')
    ]);
  }

  /* verwijswoorden */
  var VWSOORT = {
    hij:'één jongen, man, dier of de-woord', vrouw:'één meisje of vrouw', meervoud:'meer mensen of dingen', het:'een het-woord',
    de:'een de-woord of meervoud', zin:'een hele zin of gebeurtenis', plaats:'een plaats'
  };
  /* [tekst, verwijswoord, soort, waarnaar, [foute keuzes]] */
  var VW_PERSOON = [
    ['Sem en Daan gingen naar de bioscoop. Na afloop vonden [ze] de film allebei geweldig.', 'ze', 'meervoud', 'Sem en Daan', ['de film', 'de bioscoop']],
    ['Lisa kreeg een puppy voor haar verjaardag. [Ze] noemde hem Bolletje.', 'Ze', 'vrouw', 'Lisa', ['de puppy', 'de verjaardag']],
    ['De docent gaf Tim een nieuw boek. [Het] was dik en zwaar.', 'Het', 'het', 'het boek', ['de docent', 'Tim']],
    ['Noor belde haar opa. [Hij] was die dag jarig.', 'Hij', 'hij', 'haar opa', ['Noor', 'die dag']],
    ['De leerlingen moesten een spreekbeurt houden. [Ze] mochten zelf een onderwerp kiezen.', 'Ze', 'meervoud', 'de leerlingen', ['de spreekbeurt', 'het onderwerp']],
    ['Ravi gaf de bal aan Sara. [Zij] schoot hem meteen in het doel.', 'Zij', 'vrouw', 'Sara', ['Ravi', 'de bal']],
    ['Het meisje zag een eekhoorn in de tuin. [Hij] rende snel de boom in.', 'Hij', 'hij', 'de eekhoorn', ['het meisje', 'de tuin']],
    ['Mijn ouders kochten een nieuwe auto. [Ze] zijn er heel blij mee.', 'Ze', 'meervoud', 'mijn ouders', ['de nieuwe auto', 'de garage']],
    ['Joep vond een oud schilderij op zolder. [Het] bleek veel geld waard te zijn.', 'Het', 'het', 'het schilderij', ['Joep', 'de zolder']],
    ['Mila stuurde Daan een berichtje. [Hij] reageerde meteen.', 'Hij', 'hij', 'Daan', ['Mila', 'het berichtje']],
    ['De hond van de buren blaft elke nacht. [Hij] houdt de hele straat wakker.', 'Hij', 'hij', 'de hond', ['de buren', 'de straat']],
    ['Oma bakte een taart voor het feest. Iedereen vond [hem] heerlijk.', 'hem', 'hij', 'de taart', ['oma', 'het feest']],
    ['De meisjes van het hockeyteam wonnen de finale. Na afloop vierden [ze] feest in de kantine.', 'ze', 'meervoud', 'de meisjes van het hockeyteam', ['de finale', 'de kantine']],
    ['Sara leende een fiets van haar buurvrouw. [Ze] bracht hem de volgende dag netjes terug.', 'Ze', 'vrouw', 'Sara', ['de buurvrouw', 'de fiets']],
    ['Het nieuwe zwembad is eindelijk open. [Het] heeft drie glijbanen.', 'Het', 'het', 'het zwembad', ['de glijbanen', 'de opening']]
  ];
  var VW_AANWIJS = [
    ['Daan kocht een nieuwe telefoon in de winkel bij het station. [Die] is veel sneller dan zijn oude.', 'Die', 'de', 'de nieuwe telefoon', ['de winkel', 'het station']],
    ['We gaan in de zomer naar Spanje. [Daar] is het dan meestal erg warm.', 'Daar', 'plaats', 'Spanje', ['de zomer', 'wij']],
    ['Mila heeft haar zwemdiploma gehaald. [Dat] had ze nooit gedacht.', 'Dat', 'zin', 'dat ze haar zwemdiploma heeft gehaald', ['Mila', 'de zwemles']],
    ['In de kantine staat een nieuwe automaat. [Deze] verkoopt alleen gezonde snacks.', 'Deze', 'de', 'de nieuwe automaat', ['de kantine', 'de snacks']],
    ['Joep fietst elke dag naar het sportpark. [Daar] traint hij met zijn team.', 'Daar', 'plaats', 'het sportpark', ['zijn team', 'Joep']],
    ['Mijn oma heeft een groot huis met een tuin. [Dat] staat aan de rand van het dorp.', 'Dat', 'het', 'het huis', ['de tuin', 'mijn oma']],
    ['Er hangt een poster in de gang. [Die] gaat over het schoolfeest.', 'Die', 'de', 'de poster', ['de gang', 'het schoolfeest']],
    ['De docent zei dat de toets een week later is. [Dit] vond de hele klas fijn.', 'Dit', 'zin', 'dat de toets een week later is', ['de docent', 'de klas']],
    ['We hebben een nieuw klaslokaal gekregen. [Dat] is veel groter dan het oude.', 'Dat', 'het', 'het nieuwe klaslokaal', ['de docent', 'de gang']],
    ['Sara verloor haar sleutels in het park. [Daar] heeft ze de hele middag gezocht.', 'Daar', 'plaats', 'het park', ['haar sleutels', 'de middag']],
    ['Veel jongeren spelen het spel Bouwland. [Dat] is gratis te downloaden.', 'Dat', 'het', 'het spel Bouwland', ['veel jongeren', 'de computer']],
    ['Mijn broer heeft een nieuwe hobby. [Die] kost hem veel vrije tijd.', 'Die', 'de', 'de nieuwe hobby', ['mijn broer', 'het geld']],
    ['De bakker op de hoek verkoopt heerlijke appeltaart. [Deze] is elke ochtend vers.', 'Deze', 'de', 'de appeltaart', ['de bakker', 'de hoek']],
    ['Ravi ging met zijn klas naar Amsterdam. [Daar] bezochten ze het Rijksmuseum.', 'Daar', 'plaats', 'Amsterdam', ['zijn klas', 'het Rijksmuseum']],
    ['Tijdens de les viel opeens de stroom uit. [Dat] gebeurde al voor de tweede keer deze week.', 'Dat', 'zin', 'dat de stroom uitviel', ['de les', 'de week']]
  ];
  function maakVerwijs(R, it, soorten){
    return OP('Waar verwijst ' + q(it[1]) + ' naar?', tekst(it[0]), [
      K(R, q(hoofd(it[1])) + ' is een verwijswoord. Wat voor woord zoek je?', VWSOORT[it[2]], ander(R, soorten, [it[2]], 2).map(function(s){ return VWSOORT[s]; }),
        it[2] === 'zin' ? 'Past een los woord niet? Dan verwijst het naar wat er in de vorige zin gebeurt.' : 'Lees de zin met ' + q(it[1]) + ' en zoek terug in de vorige zin.'),
      K(R, 'Zoek terug in de vorige zin. Waar verwijst ' + q(it[1]) + ' naar?', it[3], it[4], 'Vul het in op de plek van ' + q(it[1]) + '. Klopt de zin dan?')
    ]);
  }
  /* kies het verwijswoord: [eerste zin, woord met lidwoord, rest van de tweede zin, dichtbij] */
  var VW_KIES = [
    ['Ik heb een nieuwe fiets.', 'de fiets', 'is knalrood.', false],
    ['We hebben een nieuw huis.', 'het huis', 'heeft een grote tuin.', false],
    ['Kijk eens naar mijn horloge.', 'het horloge', 'heb ik van mijn oma gekregen.', true],
    ['Mijn zus las een spannend boek.', 'het boek', 'wil ik ook lezen.', false],
    ['Proef eens van mijn soep.', 'de soep', 'heb ik zelf gemaakt.', true],
    ['In de klas staat een nieuwe computer.', 'de computer', 'is supersnel.', false],
    ['Daan kreeg een puppy.', 'de puppy', 'slaapt de hele dag.', false],
    ['Hier, pak aan: mijn nieuwe spel.', 'het spel', 'moet je echt eens spelen.', true],
    ['Mila zag een film over haaien.', 'de film', 'was erg spannend.', false],
    ['We hebben gisteren een liedje geschreven.', 'het liedje', 'zingen we op het schoolfeest.', false],
    ['Kijk, hier hangt mijn nieuwe jas.', 'de jas', 'is helemaal waterdicht.', true],
    ['Mijn opa heeft een oud schaakbord.', 'het schaakbord', 'is meer dan honderd jaar oud.', false],
    ['Ik hoorde een vreemd geluid.', 'het geluid', 'kwam van zolder.', false],
    ['Voel eens aan mijn kussen.', 'het kussen', 'is heerlijk zacht.', true],
    ['Sara heeft een nieuwe hobby.', 'de hobby', 'kost veel tijd.', false],
    ['Kijk naar mijn tekening.', 'de tekening', 'heb ik in de les gemaakt.', true]
  ];
  function maakVwKies(R, it){
    var de = it[1].indexOf('de ') === 0, dicht = it[3], kaalW = it[1].replace(/^(de|het) /, '');
    var goed = de ? (dicht ? 'Deze' : 'Die') : (dicht ? 'Dit' : 'Dat');
    var fout = de ? (dicht ? ['Dit', 'Dat'] : ['Dat', 'Dit']) : (dicht ? ['Deze', 'Die'] : ['Die', 'Deze']);
    var andere = ander(R, VW_KIES.filter(function(x){ return x !== it; }).map(function(x){ return x[1]; }), [it[1]], 2);
    var f = {}; f[fout[0]] = q(fout[0]) + ' hoort bij een ' + (de ? 'het' : 'de') + '-woord.';
    return OP('Welk verwijswoord past?', tekst(it[0] + ' [……] ' + it[2]), [
      K(R, 'Zoek terug in de eerste zin. Naar welk woord verwijst het ontbrekende woord?', it[1], andere, 'Wat ' + it[2].replace(/\.$/, '') + '? Dat staat in de eerste zin.'),
      K(R, 'Is ' + q(kaalW) + ' een de-woord of een het-woord?', it[1], [(de ? 'het ' : 'de ') + kaalW], 'Zeg het hardop. Klinkt de ' + kaalW + ' of het ' + kaalW + ' goed?'),
      K(R, 'Welk verwijswoord past?', goed, fout, de ? 'Bij een de-woord hoort die of deze.' : 'Bij een het-woord hoort dat of dit.', { fout:f, waarom:dicht ? 'Het ding is dichtbij (kijk, hier), daarom ' + goed.toLowerCase() + '.' : '' })
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lees-signaal', niveau:'1F', domein:'lezen', naam:'Signaalwoorden en verbanden',
        uit:'Signaalwoorden zijn de wegwijzers in een tekst. Ze laten zien hoe twee stukken bij elkaar horen: er komt iets bij, iets tegenin, een oorzaak, een reden, een doel, een volgorde of een voorbeeld.' },
      doelen:[
        { id:'lees-signaal-opsomming', naam:'Opsomming', kort:'Ook, bovendien, daarnaast, ten eerste: er komt nog iets bij',
          uit:'<p>Bij een <b>opsomming</b> komt er nog een punt bij. Signaalwoorden: <b>ook, bovendien, daarnaast, verder, ten eerste, ten tweede</b>.</p><p>Voorbeeld: <i>Fietsen is gezond. <b>Bovendien</b> bespaar je geld.</i> Dat zijn twee voordelen.</p>',
          wanneer:'je wilt weten hoeveel punten of argumenten een schrijver noemt.',
          maak:function(R){ return maakVerband(R, 'opsomming'); } },
        { id:'lees-signaal-tegenstelling', naam:'Tegenstelling', kort:'Maar, echter, toch: er komt iets wat ertegenin gaat',
          uit:'<p>Bij een <b>tegenstelling</b> gaat het tweede stuk in tegen het eerste. Signaalwoorden: <b>maar, echter, toch</b>.</p><p>Voorbeeld: <i>Daan had hard geleerd. <b>Toch</b> haalde hij een onvoldoende.</i> Dat had je niet verwacht.</p>',
          wanneer:'een tekst twee kanten laat zien of iets onverwachts vertelt.',
          maak:function(R){ return maakVerband(R, 'tegenstelling'); } },
        { id:'lees-signaal-oorzaak', naam:'Oorzaak en gevolg', kort:'Doordat, daardoor, waardoor: het ene gebeurt door het andere',
          uit:'<p>Bij <b>oorzaak en gevolg</b> gebeurt het ene vanzelf door het andere. Signaalwoorden: <b>doordat, daardoor, waardoor, hierdoor</b>.</p><p>Voorbeeld: <i><b>Doordat</b> het vroor, lag er ijs.</i> De oorzaak is de vorst, het gevolg is het ijs.</p><p>Let op: na <i>doordat</i> staat de oorzaak, na <i>daardoor</i> en <i>waardoor</i> het gevolg.</p>',
          wanneer:'je moet uitleggen hoe iets komt of wat ervan komt.',
          maak:function(R){ return maakVerband(R, 'oorzaak en gevolg'); } },
        { id:'lees-signaal-reden', naam:'Reden', kort:'Omdat, want, daarom: waarom iemand iets doet',
          uit:'<p>Een <b>reden</b> legt uit waarom iemand iets doet of vindt. Signaalwoorden: <b>omdat, want, daarom</b>.</p><p>Voorbeeld: <i>Ik neem een paraplu mee, <b>want</b> het gaat regenen.</i></p><p>Het verschil met een oorzaak: bij een reden kiest iemand zelf. Na <i>want</i> en <i>omdat</i> staat de reden. Bij <i>daarom</i> staat de reden ervoor.</p>',
          wanneer:'je wilt weten waarom iemand iets doet.',
          maak:function(R){ return maakVerband(R, 'reden'); } },
        { id:'lees-signaal-doel', naam:'Doel', kort:'Om … te, zodat: wat iemand wil bereiken',
          uit:'<p>Een <b>doel</b> zegt wat iemand wil bereiken. Signaalwoorden: <b>om … te, zodat</b>.</p><p>Voorbeeld: <i>Ik zet een wekker, <b>zodat</b> ik niet te laat kom.</i> Het doel: niet te laat komen.</p>',
          wanneer:'je wilt weten waarvoor iemand iets doet.',
          maak:function(R){ return maakVerband(R, 'doel'); } },
        { id:'lees-signaal-tijd', naam:'Tijd', kort:'Eerst, daarna, toen, nadat, voordat, terwijl: de volgorde in de tijd',
          uit:'<p>Bij <b>tijd</b> gaat het om de volgorde. Signaalwoorden: <b>eerst, daarna, toen, vervolgens, nadat, voordat, terwijl, sinds</b>.</p><p>Let op: <i><b>Nadat</b> ik had gegeten, ging ik gamen.</i> Het eten kwam eerst, ook al staat het niet vooraan in je hoofd. Bij <i>terwijl</i> gebeurt alles tegelijk.</p>',
          wanneer:'je moet weten wat eerst gebeurde en wat later.',
          maak:function(R){ return maakVerband(R, 'tijd'); } },
        { id:'lees-signaal-voorbeeld', naam:'Voorbeeld', kort:'Bijvoorbeeld, zo, zoals: er komt een voorbeeld',
          uit:'<p>Bij een <b>voorbeeld</b> maakt de schrijver iets duidelijk met één geval. Signaalwoorden: <b>bijvoorbeeld, zo, zoals</b>.</p><p>Voorbeeld: <i>Veel dieren houden een winterslaap. De egel slaapt <b>bijvoorbeeld</b> de hele winter.</i> De egel is een voorbeeld van een dier met een winterslaap.</p>',
          wanneer:'je wilt weten waarvan iets een voorbeeld is.',
          maak:function(R){ return maakVerband(R, 'voorbeeld'); } }
      ] },
    { groep:{ id:'lees-signaal-2f', niveau:'2F', domein:'lezen', naam:'Meer verbanden',
        uit:'Nog drie verbanden: voorwaarde, conclusie en vergelijking. Daarna oefen je alle verbanden door elkaar en vul je zelf het goede signaalwoord in.' },
      doelen:[
        { id:'lees-signaal-voorwaarde', naam:'Voorwaarde', kort:'Als, mits, tenzij: wat er eerst moet gelden',
          uit:'<p>Bij een <b>voorwaarde</b> gebeurt iets alleen als iets anders klopt. Signaalwoorden: <b>als, mits, tenzij, indien</b>.</p><p><i>Je mag mee, <b>mits</b> je om elf uur thuis bent.</i> Dat is de voorwaarde.</p><p><b>Tenzij</b> werkt andersom: <i>We gaan, tenzij het onweert.</i> Bij onweer gaan we niet.</p>',
          wanneer:'een tekst regels of afspraken geeft.',
          maak:function(R){ return maakVerband(R, 'voorwaarde'); } },
        { id:'lees-signaal-conclusie', naam:'Conclusie', kort:'Dus, kortom, al met al: de slotsom',
          uit:'<p>Een <b>conclusie</b> is de slotsom van wat ervoor staat. Signaalwoorden: <b>dus, kortom, al met al, concluderend</b>.</p><p>Voorbeeld: <i>Het eten is lekker en goedkoop. <b>Kortom</b>: een aanrader.</i></p><p>Wat voor het signaalwoord staat, zijn de redenen. Wat erna staat, is de conclusie.</p>',
          wanneer:'je de belangrijkste uitkomst van een tekst zoekt.',
          maak:function(R){ return maakVerband(R, 'conclusie'); } },
        { id:'lees-signaal-vergelijking', naam:'Vergelijking', kort:'Net als, evenals, net zo … als: twee dingen lijken op elkaar',
          uit:'<p>Bij een <b>vergelijking</b> zet de schrijver twee dingen naast elkaar die op elkaar lijken. Signaalwoorden: <b>net als, evenals, net zo … als, even … als</b>.</p><p>Voorbeeld: <i>Een dolfijn ademt met longen, <b>net als</b> een mens.</i> Ze hebben gemeen dat ze met longen ademen.</p>',
          wanneer:'je wilt weten wat twee dingen gemeen hebben.',
          maak:function(R){ return maakVerband(R, 'vergelijking'); } },
        { id:'lees-signaal-welk', naam:'Welk verband?', kort:'Zoek het signaalwoord en noem het verband',
          uit:'<p>Nu door elkaar. Zoek eerst het <b>signaalwoord</b>. Vraag je dan af wat het doet: komt er iets bij, iets tegenin, een oorzaak, een reden, een doel, een volgorde, een voorbeeld, een voorwaarde, een conclusie of een vergelijking?</p><p>Let op het verschil tussen <b>oorzaak</b> (het gebeurt vanzelf) en <b>reden</b> (iemand kiest zelf).</p>',
          wanneer:'een toetsvraag zegt: welk verband is er tussen deze zinnen?',
          maak:function(R){ return maakWelkVerband(R); } },
        { id:'lees-signaal-invullen', naam:'Het goede signaalwoord invullen', kort:'Bedenk eerst het verband en kies dan het signaalwoord',
          uit:'<p>Soms moet je zelf een signaalwoord kiezen. Lees eerst de twee stukken en bedenk het <b>verband</b>. Kies dan een signaalwoord dat bij dat verband hoort.</p><p>Lees de zin daarna hardop met het woord erin. Klinkt hij goed en klopt de betekenis? Dan heb je het.</p>',
          wanneer:'je een tekst schrijft of een invuloefening maakt.',
          maak:function(R){ return maakInvul(R, R.kies(INVUL)); } }
      ] },
    { groep:{ id:'lees-verwijs', niveau:'1F', domein:'lezen', naam:'Verwijswoorden',
        uit:'Woorden als hij, zij, het, die, dat en daar verwijzen naar iets wat al eerder genoemd is. Wie terugzoekt, begrijpt de tekst.' },
      doelen:[
        { id:'lees-verwijs-persoon', naam:'Hij, zij, ze en het', kort:'Zoek terug in de vorige zin naar wie of wat er bedoeld wordt',
          uit:'<p><b>Hij, zij, ze, het</b> en <b>hem</b> verwijzen naar iets wat al genoemd is. Zoek terug in de vorige zin.</p><p><i>Hij</i> past bij een jongen, een man, een dier of een de-woord (<i>de laptop: hij doet het</i>). <i>Zij</i> bij een meisje of vrouw, <i>ze</i> ook bij meer mensen. <i>Het</i> bij een het-woord.</p><p>Controle: zet het woord op de plek van het verwijswoord.</p>',
          wanneer:'je in een tekst niet zeker weet over wie het gaat.',
          maak:function(R){ return maakVerwijs(R, R.kies(VW_PERSOON), ['hij', 'vrouw', 'meervoud', 'het']); } },
        { id:'lees-verwijs-aanwijs', naam:'Die, dat, deze, dit en daar', kort:'Die en deze bij de-woorden, dat en dit bij het-woorden of een hele zin, daar bij een plaats',
          uit:'<p><b>Die</b> en <b>deze</b> verwijzen naar een de-woord of meervoud. <b>Dat</b> en <b>dit</b> naar een het-woord, of naar alles wat er in de vorige zin gebeurt. <b>Daar</b> verwijst naar een plaats.</p><p>Voorbeeld: <i>Mila haalde haar diploma. <b>Dat</b> had ze nooit gedacht.</i> Dat = dat ze haar diploma haalde.</p>',
          wanneer:'een vraag zegt: waar verwijst dit woord naar?',
          maak:function(R){ return maakVerwijs(R, R.kies(VW_AANWIJS), ['de', 'het', 'zin', 'plaats']); } },
        { id:'lees-verwijs-kies', naam:'Het goede verwijswoord kiezen', kort:'Bij een de-woord die of deze, bij een het-woord dat of dit',
          uit:'<p>Zelf een verwijswoord kiezen? Zoek eerst het woord waar je naar verwijst. Is het een <b>de-woord</b>, gebruik dan <b>die</b> of <b>deze</b>. Is het een <b>het-woord</b>, gebruik dan <b>dat</b> of <b>dit</b>.</p><p>Deze en dit gebruik je als iets dichtbij is: <i>Kijk, mijn jas. Deze is waterdicht.</i></p>',
          wanneer:'je zelf schrijft en een woord niet wilt herhalen.',
          maak:function(R){ return maakVwKies(R, R.kies(VW_KIES)); } }
      ] }
  ]);

  /* ================= LEZEN: feiten, meningen, argumenten, structuren en samenvatten ================= */

  var FEITEN = [
    'Nederland heeft twaalf provincies.', 'Water kookt bij 100 graden Celsius.', 'De Rijn stroomt door Duitsland en Nederland.', 'Een voetbalteam heeft elf spelers in het veld.',
    'Een spin heeft acht poten.', 'De zomervakantie duurt op middelbare scholen zes weken.', 'Een octopus heeft drie harten.', 'Deze telefoon kost 299 euro.',
    'Het hockeyteam heeft dit seizoen acht wedstrijden gewonnen.', 'De Afsluitdijk is ongeveer 32 kilometer lang.', 'Pinguïns kunnen niet vliegen.', 'De film duurt twee uur.',
    'Er zitten 28 leerlingen in onze klas.', 'In 2024 werden de Olympische Spelen gehouden in Parijs.', 'Bananen groeien in warme landen.', 'De bibliotheek is op zondag gesloten.'
  ];
  var MENINGEN = [
    'Voetbal is de leukste sport die er is.', 'Spinnen zijn eng.', 'Wiskunde is het moeilijkste vak.', 'Die nieuwe film is echt geweldig.', 'Katten zijn mooier dan honden.',
    'Deze telefoon is veel te duur.', 'Ons hockeyteam speelt dit seizoen fantastisch.', 'De zomervakantie is te kort.', 'Pizza is het lekkerste eten.', 'Schooluniformen zien er saai uit.',
    'Gamen is een zinloze hobby.', 'Rap is mooier dan popmuziek.', 'De nieuwe kantine is erg gezellig.', 'Lezen is saai.', 'Iedereen zou een huisdier moeten hebben.', 'Huiswerk is zonde van je tijd.'
  ];
  var JA = 'Ja, je kunt het nakijken: een feit', NEE = 'Nee, iemand vindt het: een mening';
  function maakFeit(R){
    var zoek = R.kies(['feit', 'mening']);
    var een = zoek === 'feit' ? R.kies(FEITEN) : R.kies(MENINGEN), twee = ander(R, zoek === 'feit' ? MENINGEN : FEITEN, [], 2);
    var zinnen3 = R.hussel([{ t:een, f:zoek === 'feit' }, { t:twee[0], f:zoek !== 'feit' }, { t:twee[1], f:zoek !== 'feit' }]);
    var L = ['A', 'B', 'C'], goed = '';
    var stappen = zinnen3.map(function(z, i){
      if ((z.f ? 'feit' : 'mening') === zoek) goed = 'Zin ' + L[i];
      return K(R, 'Zin ' + L[i] + ': ' + q(z.t) + ' Kun je dit nakijken?', z.f ? JA : NEE, [z.f ? NEE : JA],
        z.f ? 'Je kunt dit opzoeken, tellen of meten. Het hangt niet af van wat iemand vindt.' : 'Staat er een oordeel in, zoals leuk, eng, mooi, te duur of moeten? Dat vindt iemand.');
    });
    stappen.push(K(R, 'Welke zin is ' + (zoek === 'feit' ? 'een feit' : 'een mening') + '?', goed, L.map(function(l){ return 'Zin ' + l; }), 'Kijk naar je antwoorden hierboven.'));
    return OP('Welke zin is ' + (zoek === 'feit' ? 'een feit' : 'een mening') + '?', tekst(zinnen3.map(function(z, i){ return '<b>' + L[i] + '</b> ' + z.t; })), stappen);
  }

  /* [tekst, signaalwoord, standpunt, argument, ander argument (staat er niet), andere mening] */
  var ARGU = [
    ['Scholen moeten later beginnen, want tieners hebben ’s ochtends meer slaap nodig.', 'want', 'scholen moeten later beginnen', 'tieners hebben ’s ochtends meer slaap nodig', 'dan is er minder file', 'huiswerk moet worden afgeschaft'],
    ['Telefoons horen niet in de klas, omdat ze leerlingen afleiden.', 'omdat', 'telefoons horen niet in de klas', 'telefoons leiden leerlingen af', 'telefoons gaan snel kapot', 'tablets zijn beter dan boeken'],
    ['Plastic tasjes zijn slecht voor dieren in zee. Daarom moeten ze helemaal verboden worden.', 'Daarom', 'plastic tasjes moeten verboden worden', 'plastic tasjes zijn slecht voor dieren in zee', 'plastic tasjes zijn lelijk', 'iedereen moet vaker fietsen'],
    ['Je leert veel van een bijbaantje. Iedere jongere zou dus een bijbaantje moeten nemen.', 'dus', 'iedere jongere zou een bijbaantje moeten nemen', 'je leert veel van een bijbaantje', 'je verdient er veel geld mee', 'het zakgeld moet omhoog'],
    ['Een hond is een beter huisdier dan een kat, want met een hond kom je elke dag buiten.', 'want', 'een hond is een beter huisdier dan een kat', 'met een hond kom je elke dag buiten', 'honden zijn slimmer dan katten', 'cavia’s zijn lieve dieren'],
    ['De kantine moet gezonder eten verkopen, omdat veel leerlingen te veel suiker eten.', 'omdat', 'de kantine moet gezonder eten verkopen', 'veel leerlingen eten te veel suiker', 'gezond eten is goedkoper', 'de pauze moet langer'],
    ['Lezen vergroot je woordenschat. Daarom zou elke leerling elke dag moeten lezen.', 'Daarom', 'elke leerling zou elke dag moeten lezen', 'lezen vergroot je woordenschat', 'lezen is ontspannend', 'de bibliotheek moet langer open'],
    ['Gamen is goed voor je, want je leert er snel beslissingen nemen.', 'want', 'gamen is goed voor je', 'je leert snel beslissingen nemen', 'je maakt vrienden online', 'buiten spelen is gezonder'],
    ['Fietsen is goed voor het klimaat. Je moet dus vaker de fiets pakken in plaats van de auto.', 'dus', 'je moet vaker de fiets pakken', 'fietsen is goed voor het klimaat', 'fietsen is goedkoop', 'auto’s moeten elektrisch worden'],
    ['Huiswerk in het weekend moet verboden worden, omdat jongeren tijd nodig hebben om te ontspannen.', 'omdat', 'huiswerk in het weekend moet verboden worden', 'jongeren hebben tijd nodig om te ontspannen', 'docenten hoeven dan minder na te kijken', 'school moet om negen uur beginnen'],
    ['Een schooluniform is een goed idee, want dan wordt niemand gepest om zijn kleding.', 'want', 'een schooluniform is een goed idee', 'dan wordt niemand gepest om zijn kleding', 'uniformen zijn goedkoop', 'de school moet een zwembad krijgen'],
    ['Vlees eten is slecht voor het klimaat. We moeten dus minder vlees eten.', 'dus', 'we moeten minder vlees eten', 'vlees eten is slecht voor het klimaat', 'vlees is duur', 'iedereen moet meer sporten'],
    ['Zwemles moet gratis zijn, omdat elk kind in Nederland moet kunnen zwemmen.', 'omdat', 'zwemles moet gratis zijn', 'elk kind in Nederland moet kunnen zwemmen', 'zwemmen is leuk', 'zwembaden moeten groter worden'],
    ['Dieren horen niet in een circus. Ze kunnen daar namelijk niet leven zoals in de natuur.', 'namelijk', 'dieren horen niet in een circus', 'ze kunnen daar niet leven zoals in de natuur', 'circussen zijn saai', 'dierentuinen moeten groter worden']
  ];
  function maakStandpunt(R, it){
    var f1 = {}, f2 = {};
    f1[it[3]] = 'Dat is het argument: het zegt waarom.'; f2[it[2]] = 'Dat is het standpunt: wat de schrijver vindt.'; f2[it[4]] = 'Dat zou kunnen, maar het staat niet in de tekst.';
    return OP('Wat is het argument?', tekst(it[0]), [
      K(R, 'Wat vindt de schrijver? Zoek het standpunt.', it[2], [it[3], it[5]], 'Het standpunt is de mening van de schrijver, vaak met moeten, beter of goed erin.', { fout:f1 }),
      K(R, 'Vraag: waarom vindt de schrijver dat? Wat is het argument?', it[3], [it[2], it[4]], 'Het argument is het antwoord op de vraag: waarom ' + it[2] + '?', { fout:f2 })
    ]);
  }
  function maakArgSignaal(R, it){
    var sig = it[1], naArg = /^(want|omdat|namelijk)$/i.test(sig);
    var f = {}; f[it[3]] = 'Dat is het argument. Het standpunt is wat de schrijver vindt.';
    return OP('Wat is het standpunt?', tekst(it[0]), [
      K(R, 'Zoek het signaalwoord.', sig, woordenUit(R, it[0], ALLESIG.concat([sig, 'namelijk', 'moeten', 'moet']), 2), 'Zoek ‘want’, ‘omdat’, ‘namelijk’, ‘daarom’ of ‘dus’.'),
      K(R, 'Wat komt er na ' + q(sig) + '?', naArg ? 'het argument' : 'het standpunt', [naArg ? 'het standpunt' : 'het argument', 'een voorbeeld'],
        naArg ? 'Na want, omdat en namelijk volgt waarom: het argument.' : 'Na daarom en dus volgt wat de schrijver vindt: het standpunt.'),
      K(R, 'Wat is dus het standpunt?', it[2], [it[3], it[5]], naArg ? 'Het standpunt staat vóór ' + q(sig) + '.' : 'Het standpunt staat na ' + q(sig) + '.', { fout:f })
    ]);
  }

  /* conclusies trekken: [tekst, staat erin, [staat er niet in], conclusie, [foute conclusies]] */
  var CONCL = [
    ['Mila heeft vandaag om half vier zwemles. Haar laatste les op school duurt tot vier uur.', 'De zwemles begint om half vier.', ['De zwemles duurt een uur.', 'Mila zwemt elke dag.'], 'Mila kan niet op tijd bij de zwemles zijn als ze de hele les blijft.', ['Mila heeft vandaag geen zwemles.', 'Mila vindt zwemmen niet leuk.']],
    ['Alle leerlingen van 2B gingen mee op excursie. Tim zit in 2B.', 'Alle leerlingen van 2B gingen mee.', ['Tim vond de excursie leuk.', 'De excursie ging naar een museum.'], 'Tim ging mee op excursie.', ['Tim bleef op school.', 'Alle klassen gingen mee op excursie.']],
    ['De winkel sluit om zes uur. Sara komt er om kwart over zes aan.', 'De winkel sluit om zes uur.', ['Sara wil schoenen kopen.', 'De winkel is groot.'], 'Sara staat voor een dichte deur.', ['Sara kan nog snel iets kopen.', 'De winkel gaat later dicht.']],
    ['Daan is allergisch voor noten. In de taart op het verjaardagsfeest zitten walnoten.', 'In de taart zitten walnoten.', ['Daan is jarig.', 'De taart komt van de bakker.'], 'Daan kan beter geen taart eten.', ['Daan vindt taart niet lekker.', 'Niemand op het feest eet taart.']],
    ['In de klas zitten 28 leerlingen. Er staan maar 25 stoelen.', 'Er staan 25 stoelen.', ['Er zijn drie leerlingen ziek.', 'De klas is nieuw.'], 'Er moeten drie stoelen bij.', ['Er zijn te veel stoelen.', 'Iedereen kan zitten.']],
    ['Noor heeft een tien gehaald voor haar toets. Ze had er twee weken lang elke dag voor geleerd.', 'Noor leerde twee weken lang elke dag.', ['Noor is de slimste van de klas.', 'De toets was makkelijk.'], 'Het leren heeft Noor waarschijnlijk geholpen.', ['Noor hoeft nooit meer te leren.', 'Iedereen in de klas haalde een tien.']],
    ['Een kaartje voor de bioscoop kost 12 euro. Ravi heeft nog 10 euro in zijn portemonnee.', 'Ravi heeft 10 euro.', ['Ravi gaat met vrienden.', 'De film is spannend.'], 'Ravi heeft te weinig geld voor een kaartje.', ['Ravi kan ook nog popcorn kopen.', 'Ravi wil de film niet zien.']],
    ['Sinds de school een watertappunt heeft, kopen leerlingen minder frisdrank in de kantine.', 'Leerlingen kopen minder frisdrank.', ['Water is gezonder dan frisdrank.', 'Het tappunt staat bij de gymzaal.'], 'Het watertappunt heeft waarschijnlijk invloed op wat leerlingen drinken.', ['Leerlingen drinken nooit meer frisdrank.', 'De kantine gaat dicht.']],
    ['Alle vogels in deze vogelopvang kunnen niet vliegen. De opvang heeft ook een uil.', 'Alle vogels in de opvang kunnen niet vliegen.', ['Uilen jagen ’s nachts.', 'De opvang ligt in het bos.'], 'De uil in de opvang kan niet vliegen.', ['Uilen kunnen nooit vliegen.', 'De opvang heeft geen vogels.']],
    ['Joep had zijn fiets niet op slot gezet. Toen hij terugkwam, was zijn fiets weg.', 'Joep zette zijn fiets niet op slot.', ['Joep had een dure fiets.', 'De fiets stond bij het station.'], 'Waarschijnlijk is de fiets gestolen, omdat hij niet op slot stond.', ['Joep krijgt een nieuwe fiets.', 'Alle fietsen in de stad worden gestolen.']],
    ['Er komen vijf mensen ontbijten en iedereen wil een glas melk. In de koelkast staat nog één pak. Uit één pak gaan vier glazen.', 'Uit één pak gaan vier glazen.', ['Er is ook nog yoghurt.', 'De melk is bijna over de datum.'], 'Er is te weinig melk voor iedereen.', ['Er blijft melk over.', 'Niemand wil melk.']],
    ['De bibliotheek is op zondag gesloten. Vandaag is het zondag.', 'De bibliotheek is op zondag gesloten.', ['Vandaag regent het.', 'De bibliotheek heeft nieuwe boeken.'], 'Je kunt vandaag geen boek lenen in de bibliotheek.', ['De bibliotheek is morgen ook dicht.', 'De bibliotheek gaat nooit meer open.']],
    ['Lisa is ouder dan Sem. Sem is ouder dan Noor.', 'Lisa is ouder dan Sem.', ['Noor is twaalf jaar.', 'Sem is de broer van Lisa.'], 'Lisa is ouder dan Noor.', ['Noor is ouder dan Lisa.', 'Sem is de oudste.']]
  ];
  function maakConclusie(R, it){
    return OP('Welke conclusie kun je trekken?', tekst(it[0]), [
      K(R, 'Wat staat er echt in de tekst?', it[1], it[2], 'Kies alleen iets wat letterlijk in de tekst staat, niet wat je zelf denkt.'),
      K(R, 'Zet de zinnen naast elkaar. Wat volgt daar logisch uit?', it[3], it[4], 'Wat moet er wel waar zijn als alle zinnen kloppen? Pas op met woorden als nooit, altijd en iedereen.')
    ]);
  }

  /* tekststructuren: per structuur twee vragen en de teksten [tekst, goed1, [fout1, fout1b], goed2, [fout2, fout2b]] */
  var STRUCT = {
    'probleem en oplossing':{ vraag:'Wat is het probleem en wat kun je eraan doen?', v1:'Wat is het probleem?', v2:'Welke oplossing noemt de schrijver?',
      h1:'Het probleem is wat er mis is. Vaak staat het vooraan.', h2:'Zoek woorden als oplossing, helpen of gaat … doen.', f2:'Dat is het probleem, niet de oplossing.', o:[
      ['Op veel scholen ligt na de pauze afval op het plein. Leerlingen gooien blikjes en papiertjes gewoon op de grond. Een oplossing is om meer afvalbakken neer te zetten. Ook kan elke klas om de beurt het plein opruimen.', 'er ligt afval op het schoolplein', ['er zijn te veel afvalbakken', 'de pauze is te kort'], 'meer afvalbakken en om de beurt opruimen', ['leerlingen gooien afval op de grond', 'de pauze afschaffen']],
      ['Veel jongeren slapen te weinig doordat ze ’s avonds lang op hun telefoon zitten. Ze zijn daardoor moe in de les. Je kunt dit oplossen door je telefoon een uur voor het slapen weg te leggen.', 'jongeren slapen te weinig door hun telefoon', ['jongeren hebben geen telefoon', 'de lessen zijn te lang'], 'de telefoon een uur voor het slapen wegleggen', ['jongeren zijn moe in de les', 'later naar school gaan']],
      ['In de fietsenstalling van school is te weinig plek. Fietsen staan kriskras door elkaar en vallen om. De school wil daarom een tweede stalling bouwen achter de gymzaal.', 'er is te weinig plek in de fietsenstalling', ['er zijn te weinig fietsen', 'de gymzaal is te klein'], 'een tweede fietsenstalling bouwen', ['fietsen vallen om', 'fietsen verbieden']],
      ['Veel mensen gooien eten weg dat nog goed is. Dat is zonde van het geld en slecht voor het milieu. Een oplossing: maak een boodschappenlijst en koop niet meer dan je nodig hebt.', 'mensen gooien eten weg dat nog goed is', ['eten is te duur', 'mensen eten te veel'], 'een boodschappenlijst maken en niet te veel kopen', ['eten weggooien', 'vaker uit eten gaan']],
      ['In de bibliotheek van school is het vaak te druk om te leren. Leerlingen praten en lopen steeds in en uit. De school heeft nu een stiltelokaal ingericht waar niemand mag praten.', 'het is te druk in de bibliotheek om te leren', ['er zijn te weinig boeken', 'leerlingen lezen te weinig'], 'een stiltelokaal inrichten', ['leerlingen praten en lopen in en uit', 'de bibliotheek sluiten']],
      ['Op de kruising bij school gebeuren vaak bijna-ongelukken. Auto’s rijden er veel te hard. De gemeente gaat er daarom drempels aanleggen.', 'auto’s rijden te hard bij de kruising', ['er rijden te weinig auto’s', 'de school is te groot'], 'drempels aanleggen', ['er gebeuren bijna-ongelukken', 'de school verhuizen']],
      ['Veel leerlingen vergeten hun huiswerk. Ze schrijven het niet op of kijken niet in hun agenda. Een handige oplossing is een vaste huiswerktijd elke dag, met een checklist.', 'leerlingen vergeten hun huiswerk', ['er is te veel huiswerk', 'agenda’s zijn te duur'], 'een vaste huiswerktijd met een checklist', ['het huiswerk niet opschrijven', 'geen huiswerk meer geven']],
      ['In de zomer wordt het in sommige klaslokalen meer dan dertig graden. Leerlingen kunnen zich dan slecht concentreren. Zonneschermen en ventilatoren kunnen helpen.', 'het wordt te warm in de klaslokalen', ['de lokalen zijn te klein', 'het is te koud in de winter'], 'zonneschermen en ventilatoren', ['leerlingen concentreren zich slecht', 'de zomervakantie verlengen']],
      ['Steeds minder kinderen kunnen goed fietsen in het verkeer. Ze worden vaak met de auto gebracht. Daarom geven sommige basisscholen nu verkeerslessen op de fiets.', 'kinderen kunnen niet goed fietsen in het verkeer', ['er zijn te veel fietsen', 'auto’s zijn te duur'], 'verkeerslessen op de fiets', ['kinderen worden met de auto gebracht', 'een nieuwe weg aanleggen']],
      ['In de groepsapp van de klas worden soms gemene berichten gestuurd. Sommige leerlingen voelen zich daardoor buitengesloten. De mentor heeft samen met de klas regels voor de app gemaakt.', 'er worden gemene berichten gestuurd in de groepsapp', ['de app werkt niet goed', 'er worden te weinig berichten gestuurd'], 'samen regels voor de app maken', ['leerlingen voelen zich buitengesloten', 'telefoons verbieden']],
      ['Bijen vinden in de stad weinig bloemen om voedsel te halen. Daardoor gaat het slecht met veel soorten. Je kunt helpen door bloemen te zaaien op je balkon of in de tuin.', 'bijen vinden in de stad te weinig bloemen', ['er zijn te veel bijen', 'bloemen zijn duur'], 'bloemen zaaien op je balkon of in de tuin', ['het gaat slecht met veel soorten', 'bijen naar het bos brengen']],
      ['Bij de kantine staan in de pauze lange rijen. Veel leerlingen hebben daardoor geen tijd meer om te eten. De school opent nu een tweede kassa.', 'er staan lange rijen bij de kantine', ['het eten is te duur', 'de pauze is te lang'], 'een tweede kassa openen', ['leerlingen hebben geen tijd om te eten', 'de kantine sluiten']]
    ] },
    'oorzaak en gevolg':{ vraag:'Waardoor komt iets en wat zijn de gevolgen?', v1:'Wat is de oorzaak?', v2:'Welk gevolg noemt de schrijver?',
      h1:'De oorzaak komt eerst: daardoor gebeurt de rest.', h2:'Een gevolg komt na woorden als daardoor, waardoor en hierdoor.', f2:'Dat is de oorzaak, niet het gevolg.', o:[
      ['De aarde warmt op. Daardoor smelt het ijs op de polen en in de bergen. Het smeltwater komt in zee terecht, waardoor de zeespiegel stijgt.', 'de aarde warmt op', ['de zeespiegel stijgt', 'er rijden te veel auto’s'], 'de zeespiegel stijgt', ['de aarde warmt op', 'het wordt kouder op de polen']],
      ['Doordat veel mensen thuiswerken, staan er minder auto’s in de file. Hierdoor is de lucht in de stad schoner geworden.', 'veel mensen werken thuis', ['de lucht is schoner', 'er zijn nieuwe wegen'], 'minder files en schonere lucht', ['mensen werken thuis', 'meer ongelukken']],
      ['Door te veel schermtijd bewegen veel kinderen te weinig. Daardoor worden ze minder fit.', 'te veel schermtijd', ['minder fit zijn', 'te veel sporten'], 'kinderen worden minder fit', ['te veel schermtijd', 'kinderen gaan beter slapen']],
      ['In 1953 brak tijdens een zware storm op veel plaatsen in Zeeland de dijk door. Daardoor overstroomde een groot deel van de provincie. Er kwamen meer dan 1800 mensen om.', 'een zware storm waardoor dijken doorbraken', ['de overstroming van Zeeland', 'een aardbeving'], 'een groot deel van Zeeland overstroomde', ['er was een zware storm', 'er werd een nieuwe stad gebouwd']],
      ['Als je te weinig water drinkt, droogt je lichaam uit. Daardoor krijg je hoofdpijn en kun je je slecht concentreren.', 'te weinig water drinken', ['hoofdpijn', 'te veel eten'], 'hoofdpijn en slecht concentreren', ['te weinig water drinken', 'beter slapen']],
      ['Door de droogte van afgelopen zomer stond er weinig water in de rivieren. Schepen konden daardoor minder lading vervoeren.', 'de droogte', ['de schepen', 'te veel regen'], 'schepen konden minder lading vervoeren', ['het was droog', 'er kwamen meer schepen']],
      ['Doordat er steeds meer huizen en wegen worden gebouwd, verdwijnt er natuur. Veel dieren hebben daardoor geen plek meer om te leven.', 'er worden steeds meer huizen en wegen gebouwd', ['dieren hebben geen plek', 'er komen meer bossen'], 'dieren hebben geen plek meer om te leven', ['er worden huizen gebouwd', 'er komen meer dieren']],
      ['Mijn broer kreeg een nieuwe spelcomputer. Sindsdien gamet hij elke avond tot laat. Hierdoor komt hij ’s ochtends zijn bed niet meer uit.', 'tot laat gamen', ['niet uit bed komen', 'vroeg naar bed gaan'], 'hij komt ’s ochtends zijn bed niet uit', ['hij gamet tot laat', 'hij gaat beter slapen']],
      ['Er drijft veel plastic in de oceaan. Zeeschildpadden zien plastic zakken aan voor kwallen en eten ze op. Hierdoor worden ze ziek.', 'plastic in de oceaan', ['zieke schildpadden', 'te veel kwallen'], 'zeeschildpadden worden ziek', ['er drijft plastic in zee', 'er komen meer kwallen']],
      ['Doordat het internet uitviel, konden veel winkels niet meer pinnen. Klanten moesten contant betalen of weggaan zonder iets te kopen.', 'het internet viel uit', ['klanten gingen weg', 'de winkels waren dicht'], 'winkels konden niet meer pinnen', ['het internet viel uit', 'alles werd goedkoper']],
      ['Door de regen van de afgelopen week is het voetbalveld een modderpoel. Hierdoor gaat de wedstrijd van zaterdag niet door.', 'de regen van de afgelopen week', ['de afgelaste wedstrijd', 'een kapot doel'], 'de wedstrijd gaat niet door', ['het regende veel', 'er wordt op kunstgras gespeeld']],
      ['Veel jongeren eten ’s ochtends niets. Daardoor hebben ze in het tweede uur al honger en kunnen ze zich slecht concentreren.', 'niet ontbijten', ['honger in het tweede uur', 'te laat naar bed gaan'], 'ze kunnen zich slecht concentreren', ['ze eten ’s ochtends niets', 'ze leren beter']]
    ] },
    'voor- en nadelen':{ vraag:'Wat zijn de voordelen en de nadelen?', v1:'Welk voordeel noemt de schrijver?', v2:'Welk nadeel noemt de schrijver?',
      h1:'Een voordeel is iets goeds. Let op: het moet ook echt in de tekst staan.', h2:'Een nadeel komt vaak na maar, toch of een nadeel is.', f2:'Dat is juist een voordeel.', o:[
      ['Een elektrische fiets heeft voordelen. Je komt makkelijker tegen de wind in en je bent sneller op school. Er zijn ook nadelen: een e-bike is duur en de accu moet je steeds opladen.', 'je bent sneller op school', ['een e-bike is duur', 'je wordt er fitter van'], 'de accu moet je steeds opladen', ['je komt makkelijker tegen de wind in', 'hij is te zwaar om te tillen']],
      ['Online lessen hebben voordelen: je hoeft niet te reizen en je kunt de les later terugkijken. Een nadeel is dat je je minder goed kunt concentreren. Ook zie je je klasgenoten niet.', 'je kunt de les terugkijken', ['je ziet je klasgenoten niet', 'de lessen zijn korter'], 'je kunt je minder goed concentreren', ['je hoeft niet te reizen', 'de wifi is duur']],
      ['Een huisdier is gezellig en je leert er goed voor zorgen. Maar een huisdier kost ook geld, en je moet er elke dag tijd voor hebben.', 'je leert er goed voor zorgen', ['een huisdier kost geld', 'je wordt er slimmer van'], 'een huisdier kost geld', ['een huisdier is gezellig', 'een huisdier maakt veel lawaai']],
      ['Een bijbaantje levert geld op en je leert er veel van. Het nadeel is dat je minder tijd hebt voor huiswerk en vrienden.', 'je leert er veel van', ['je hebt minder tijd voor huiswerk', 'je krijgt korting in de winkel'], 'je hebt minder tijd voor huiswerk en vrienden', ['het levert geld op', 'het werk is gevaarlijk']],
      ['Sociale media hebben voor- en nadelen. Je houdt makkelijk contact met vrienden en je ziet snel nieuws. Maar je kunt er ook verslaafd aan raken, en niet alles wat je ziet, klopt.', 'je houdt makkelijk contact met vrienden', ['niet alles wat je ziet, klopt', 'het is gratis'], 'niet alles wat je ziet, klopt', ['je ziet snel nieuws', 'het kost veel geld']],
      ['Een schooluniform is handig: je hoeft ’s ochtends niet na te denken over je kleren. Een nadeel is dat je niet kunt laten zien wie je bent.', 'je hoeft niet na te denken over je kleren', ['je kunt niet laten zien wie je bent', 'een uniform is warm'], 'je kunt niet laten zien wie je bent', ['je hoeft niet na te denken over je kleren', 'een uniform is duur']],
      ['Met de trein op vakantie gaan is goed voor het klimaat. Bovendien kun je onderweg lezen of slapen. Een nadeel is dat het vaak langer duurt dan vliegen.', 'je kunt onderweg lezen of slapen', ['het duurt langer dan vliegen', 'de trein is goedkoop'], 'het duurt langer dan vliegen', ['het is goed voor het klimaat', 'de trein is altijd vol']],
      ['Tweedehands kleding kopen is goedkoop en beter voor het milieu. Je moet alleen langer zoeken, en je maat is er niet altijd.', 'het is beter voor het milieu', ['je moet langer zoeken', 'de kleding is altijd nieuw'], 'je moet langer zoeken', ['het is goedkoop', 'de kleding ruikt raar']],
      ['Een tablet in de klas is handig: je hebt al je boeken bij je en je kunt filmpjes kijken bij de uitleg. Toch zijn er nadelen. Je raakt snel afgeleid en je ogen worden moe van het scherm.', 'je hebt al je boeken bij je', ['je raakt snel afgeleid', 'je hoeft geen huiswerk te maken'], 'je raakt snel afgeleid', ['je kunt filmpjes kijken', 'een tablet is zwaar']],
      ['Zonnepanelen leveren gratis stroom op zodra ze er liggen. Ze zijn wel duur om te kopen, en in de winter leveren ze weinig op.', 'ze leveren gratis stroom op', ['ze zijn duur om te kopen', 'ze werken ook ’s nachts'], 'ze zijn duur om te kopen', ['ze leveren gratis stroom op', 'ze gaan snel kapot']],
      ['Wonen in een grote stad heeft voordelen: alles is dichtbij en er is veel te doen. Nadelen zijn de drukte en de hoge huur.', 'alles is dichtbij', ['de huur is hoog', 'er is veel natuur'], 'de huur is hoog', ['er is veel te doen', 'er zijn geen winkels']],
      ['Samen huiswerk maken is gezellig en je kunt elkaar helpen. Maar je praat ook snel over andere dingen, waardoor je minder af krijgt.', 'je kunt elkaar helpen', ['je krijgt minder af', 'je krijgt hogere cijfers'], 'je krijgt minder af', ['het is gezellig', 'het kost geld']]
    ] },
    'verschijnsel en verklaring':{ vraag:'Wat valt er te zien en hoe komt dat?', v1:'Welk verschijnsel beschrijft de schrijver?', v2:'Hoe verklaart de schrijver het?',
      h1:'Een verschijnsel is iets wat je kunt zien of merken. Vaak staat het vooraan.', h2:'De verklaring staat na woorden als dat komt doordat.', f2:'Dat is het verschijnsel zelf. Hoe komt het?', o:[
      ['Waarom is de lucht overdag blauw? Zonlicht bestaat uit alle kleuren. Als het licht door de lucht gaat, wordt vooral het blauwe licht alle kanten op verstrooid. Daardoor zie je overal blauw.', 'de lucht is blauw', ['zonlicht bestaat uit kleuren', 'de zon is geel'], 'blauw licht wordt het meest alle kanten op verstrooid', ['de lucht is blauw', 'de zee weerspiegelt in de lucht']],
      ['Na een flinke bui zie je soms een regenboog. Dat komt doordat zonlicht in de regendruppels wordt gebroken. Het witte licht valt dan uiteen in alle kleuren.', 'een regenboog na een bui', ['zonlicht valt uiteen', 'onweer'], 'zonlicht wordt in regendruppels gebroken en valt uiteen in kleuren', ['er is een regenboog', 'de wolken zijn gekleurd']],
      ['Als je een glas ijswater buiten zet, wordt de buitenkant nat. Dat komt doordat de lucht vlak bij het glas afkoelt. Koude lucht kan minder waterdamp vasthouden, dus die damp wordt weer water.', 'een glas ijswater wordt aan de buitenkant nat', ['lucht koelt af', 'het ijs smelt'], 'waterdamp uit de lucht wordt water op het koude glas', ['het glas wordt nat', 'het water lekt door het glas']],
      ['Bij onweer zie je eerst de bliksem en hoor je pas later de donder. Dat komt doordat licht veel sneller gaat dan geluid.', 'je ziet bliksem eerder dan je donder hoort', ['licht is snel', 'het regent'], 'licht gaat sneller dan geluid', ['je ziet de bliksem eerst', 'de donder begint later']],
      ['Een ijsblokje drijft in je limonade. Dat komt doordat water uitzet als het bevriest. IJs is daardoor lichter dan hetzelfde stuk vloeibaar water.', 'een ijsblokje drijft', ['water zet uit', 'limonade is zoet'], 'water zet uit bij bevriezen, waardoor ijs lichter is', ['het ijsblokje drijft', 'er zit lucht in limonade']],
      ['In de herfst trekken veel vogels naar het zuiden. Dat doen ze omdat er hier in de winter te weinig voedsel is.', 'vogels trekken in de herfst naar het zuiden', ['er is weinig voedsel', 'vogels bouwen nesten'], 'in de winter is er hier te weinig voedsel', ['vogels trekken naar het zuiden', 'het is in het zuiden mooier']],
      ['Je oren ploppen soms als een vliegtuig opstijgt. Dat komt doordat de luchtdruk buiten je oor snel verandert. Je oor moet de druk dan gelijktrekken.', 'je oren ploppen in een vliegtuig', ['de luchtdruk verandert', 'het vliegtuig maakt lawaai'], 'de luchtdruk verandert snel en je oor trekt hem gelijk', ['je oren ploppen', 'het vliegtuig is te luid']],
      ['Het water in zee stijgt en daalt twee keer per dag: eb en vloed. Dat komt vooral door de aantrekkingskracht van de maan.', 'het zeewater stijgt en daalt twee keer per dag', ['de maan', 'golven op het strand'], 'de aantrekkingskracht van de maan', ['het water stijgt en daalt', 'de wind blaast het water weg']],
      ['Als je lang in bad zit, krijg je rimpelige vingers. Wetenschappers denken dat dit een reactie van je zenuwen is. Met rimpels heb je meer grip op natte dingen.', 'rimpelige vingers na een lang bad', ['meer grip', 'koud water'], 'het is een reactie van je zenuwen, voor meer grip', ['je vingers worden rimpelig', 'het badwater is te warm']],
      ['Een ballon blijft soms aan je haar plakken als je ermee wrijft. Door het wrijven krijgen de ballon en je haar een elektrische lading. Tegengestelde ladingen trekken elkaar aan.', 'een ballon plakt aan je haar', ['ladingen trekken elkaar aan', 'een ballon is van rubber'], 'door wrijven krijgen ballon en haar een tegengestelde lading', ['de ballon plakt', 'er zit lijm op de ballon']],
      ['Een ijsbeer ziet er wit uit, maar hij heeft een zwarte huid. Zijn haren zijn doorzichtig en hol. Doordat ze het licht weerkaatsen, lijkt de vacht wit.', 'een ijsbeer ziet er wit uit', ['een zwarte huid', 'ijsberen leven op de Noordpool'], 'zijn doorzichtige haren weerkaatsen het licht', ['de ijsbeer ziet er wit uit', 'de sneeuw kleurt zijn vacht wit']],
      ['In de winter lijken fietsbanden sneller zacht te worden. Dat komt doordat koude lucht minder ruimte inneemt. Daardoor daalt de druk in de band.', 'fietsbanden worden in de winter zachter', ['lucht neemt ruimte in', 'fietsen gaan sneller kapot'], 'koude lucht neemt minder ruimte in, dus de druk daalt', ['de banden worden zachter', 'er zit een gat in de band']]
    ] },
    'betoog':{ vraag:'Wat vindt de schrijver en waarom?', v1:'Wat is het standpunt van de schrijver?', v2:'Welk tegenargument weerlegt de schrijver?',
      h1:'Het standpunt is wat de schrijver vindt. Het staat vaak in de eerste of de laatste zin.', h2:'Een tegenargument is wat anderen vinden: ‘sommigen zeggen’. Daarna komt ‘maar’ met de weerlegging.', f2:'Dat is een argument van de schrijver zelf, geen tegenargument.', o:[
      ['De pauze moet langer. Leerlingen hebben tijd nodig om te eten en even te ontspannen. Sommige mensen zeggen dat de schooldag dan te lang wordt. Maar tien minuten extra maakt bijna geen verschil.', 'de pauze moet langer', ['leerlingen hebben tijd nodig om te eten', 'de schooldag wordt te lang'], 'de schooldag wordt dan te lang', ['leerlingen hebben tijd nodig om te ontspannen', 'de pauze moet langer']],
      ['Elke school zou een moestuin moeten hebben. Leerlingen leren er waar hun eten vandaan komt. Je zou kunnen denken dat een moestuin te veel werk is. Maar als elke klas een stukje doet, valt dat reuze mee.', 'elke school zou een moestuin moeten hebben', ['leerlingen leren waar hun eten vandaan komt', 'een moestuin is te veel werk'], 'een moestuin is te veel werk', ['leerlingen leren waar hun eten vandaan komt', 'elke school moet een moestuin hebben']],
      ['Telefoons horen niet in de klas. Ze leiden af, ook als ze alleen op tafel liggen. Sommigen zeggen dat je een telefoon nodig hebt om dingen op te zoeken. Maar daarvoor heeft de school laptops.', 'telefoons horen niet in de klas', ['telefoons leiden af', 'je hebt een telefoon nodig om dingen op te zoeken'], 'je hebt een telefoon nodig om dingen op te zoeken', ['telefoons leiden af', 'telefoons horen niet in de klas']],
      ['Gamen is een prima hobby. Je leert er samenwerken en snel beslissen. Veel ouders vinden gamen zonde van de tijd. Maar dat geldt voor elke hobby als je hem de hele dag doet.', 'gamen is een prima hobby', ['je leert er samenwerken', 'gamen is zonde van de tijd'], 'gamen is zonde van de tijd', ['je leert er snel beslissen', 'gamen is een prima hobby']],
      ['Vlees zou duurder moeten worden. Dan eten mensen minder vlees, en dat is beter voor het klimaat. Tegenstanders zeggen dat mensen met weinig geld dan geen vlees meer kunnen kopen. Maar met het extra geld kan de overheid groente juist goedkoper maken.', 'vlees zou duurder moeten worden', ['minder vlees eten is beter voor het klimaat', 'mensen met weinig geld kunnen dan geen vlees kopen'], 'mensen met weinig geld kunnen dan geen vlees meer kopen', ['minder vlees eten is beter voor het klimaat', 'vlees zou duurder moeten worden']],
      ['Scholen zouden later moeten beginnen. Tieners zijn ’s ochtends vroeg nog niet goed wakker. Sommigen zeggen dat leerlingen dan ’s middags te laat thuis zijn. Maar een half uur later beginnen betekent maar een half uur later thuis.', 'scholen zouden later moeten beginnen', ['tieners zijn ’s ochtends nog niet goed wakker', 'leerlingen zijn dan te laat thuis'], 'leerlingen zijn dan ’s middags te laat thuis', ['tieners zijn ’s ochtends nog niet goed wakker', 'scholen zouden later moeten beginnen']],
      ['Iedereen zou met een fietshelm moeten fietsen. Een helm beschermt je hoofd bij een val. Veel jongeren vinden een helm niet stoer. Maar hersenletsel is nog veel minder stoer.', 'iedereen zou met een fietshelm moeten fietsen', ['een helm beschermt je hoofd', 'een helm is niet stoer'], 'een helm is niet stoer', ['een helm beschermt je hoofd', 'iedereen zou een helm moeten dragen']],
      ['Huiswerk moet blijven. Door te oefenen onthoud je de lesstof beter. Sommige leerlingen vinden huiswerk zonde van hun vrije tijd. Maar wie in de les goed doorwerkt, heeft er vaak maar weinig.', 'huiswerk moet blijven', ['door te oefenen onthoud je beter', 'huiswerk is zonde van je vrije tijd'], 'huiswerk is zonde van je vrije tijd', ['door te oefenen onthoud je beter', 'huiswerk moet blijven']],
      ['Dieren horen niet in een circus. Ze reizen het hele jaar rond in kleine hokken. Sommigen zeggen dat kinderen in het circus van dieren leren houden. Maar dat kan ook op een kinderboerderij of in de natuur.', 'dieren horen niet in een circus', ['dieren reizen rond in kleine hokken', 'kinderen leren in het circus van dieren houden'], 'kinderen leren in het circus van dieren houden', ['dieren reizen rond in kleine hokken', 'dieren horen niet in een circus']],
      ['Een schooluniform is een goed idee. Dan wordt niemand gepest om zijn kleren. Sommigen zeggen dat je dan niet kunt laten zien wie je bent. Maar dat kun je ook met je kapsel, je tas of je hobby’s.', 'een schooluniform is een goed idee', ['niemand wordt gepest om zijn kleren', 'je kunt niet laten zien wie je bent'], 'je kunt dan niet laten zien wie je bent', ['niemand wordt gepest om zijn kleren', 'een schooluniform is een goed idee']],
      ['Zwemles zou gratis moeten zijn. Elk kind in Nederland moet kunnen zwemmen, want er is overal water. Sommigen zeggen dat de overheid daar geen geld voor heeft. Maar verdrinking voorkomen is veel belangrijker dan geld.', 'zwemles zou gratis moeten zijn', ['elk kind moet kunnen zwemmen', 'de overheid heeft er geen geld voor'], 'de overheid heeft er geen geld voor', ['elk kind moet kunnen zwemmen', 'zwemles zou gratis moeten zijn']],
      ['Leerlingen zouden zelf hun mentor moeten kiezen. Met een mentor die je vertrouwt, praat je makkelijker over problemen. Sommigen denken dat dan iedereen dezelfde populaire docent kiest. Maar je kunt ook drie voorkeuren laten opgeven.', 'leerlingen zouden zelf hun mentor moeten kiezen', ['met een mentor die je vertrouwt, praat je makkelijker', 'iedereen kiest dezelfde docent'], 'iedereen kiest dan dezelfde populaire docent', ['met een mentor die je vertrouwt, praat je makkelijker', 'leerlingen zouden zelf hun mentor moeten kiezen']]
    ] }
  };
  var STRUCTNAMEN = Object.keys(STRUCT);
  var STRUCTBUUR = { 'oorzaak en gevolg':['verschijnsel en verklaring'], 'verschijnsel en verklaring':['oorzaak en gevolg'] };
  function maakStructuur(R, naam){
    var S = STRUCT[naam], it = R.kies(S.o), f = {}; f[it[4][0]] = S.f2;
    return OP(S.v2, tekst(it[0]), [
      K(R, S.v1, it[1], it[2], S.h1),
      K(R, S.v2, it[3], it[4], S.h2, { fout:f })
    ]);
  }
  function maakWelkeStructuur(R){
    var naam = R.kies(STRUCTNAMEN), it = R.kies(STRUCT[naam].o), weg = [naam].concat(STRUCTBUUR[naam] || []);
    var andere = ander(R, STRUCTNAMEN, weg, 2);
    return OP('Welke tekststructuur?', tekst(it[0]), [
      K(R, 'Welke vraag beantwoordt de tekst?', STRUCT[naam].vraag, andere.map(function(x){ return STRUCT[x].vraag; }), 'Kijk waar de tekst mee begint en wat er daarna komt.'),
      K(R, 'Welke tekststructuur hoort daarbij?', naam, ander(R, STRUCTNAMEN, weg, 2), 'De vraag ' + q(STRUCT[naam].vraag) + ' hoort bij ' + naam + '.')
    ]);
  }

  /* samenvatten */
  function zinLijst(nummers){
    var n = nummers.map(function(x){ return x + 1; });
    return 'Zin ' + (n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' en ' + n[n.length - 1]);
  }
  function maakSchrappen(R){
    var T = R.kies(TEKSTEN), alle = T.z.map(function(z, i){ return i; });
    var vi = 0, ki = 0, ui = [];
    T.z.forEach(function(z, i){ if (z[1] === 'v') vi = i; else if (z[1] === 'k') ki = i; else ui.push(i); });
    var u = R.kies(ui), zonder = function(x){ return alle.filter(function(i){ return i !== x; }); };
    var nummers = alle.map(function(i){ return 'Zin ' + (i + 1); });
    var f = {}; f[zinLijst(zonder(ki))] = 'Dan schrap je de kernzin, en die is juist het belangrijkst.';
    return OP('Welke zinnen houd je over?', tekst(T.z.map(function(z, i){ return '<b>' + (i + 1) + '</b> ' + z[0]; }).join(' '), T.t), [
      K(R, 'Welke zin geeft alleen een voorbeeld? Zoek ‘bijvoorbeeld’ of ‘zo’.', 'Zin ' + (vi + 1), ander(R, nummers, ['Zin ' + (vi + 1)], 2), 'Het voorbeeld staat in de zin met ' + q(vbSignaal(T)) + '.'),
      K(R, 'Welke zin is de kernzin? Die moet zeker blijven.', 'Zin ' + (ki + 1), ander(R, nummers, ['Zin ' + (ki + 1)], 2), 'Kijk naar de eerste en de laatste zin.'),
      K(R, 'Je schrapt de bijzaak. Welke zinnen houd je over voor je samenvatting?', zinLijst(zonder(vi)), [zinLijst(zonder(ki)), zinLijst(zonder(u))], 'Schrap alleen het voorbeeld: zin ' + (vi + 1) + '.', { fout:f })
    ]);
  }
  function maakPerAlinea(R){
    var A = R.kies(ALINEA), i = R.kies([0, 1, 3]), andere = [0, 1, 2, 3].filter(function(x){ return x !== i; });
    var fout = ander(R, andere, [], 2).map(function(x){ return A.k[x]; });
    return OP('Wat is de kern van alinea ' + (i + 1) + '?', alineaTekst(A, i), [
      functieStap(R, A, i, 'Wat doet alinea ' + (i + 1) + ' in de tekst?'),
      K(R, 'Vat alinea ' + (i + 1) + ' samen in één zin. Welke zin past?', A.k[i], fout, 'Gebruik alleen wat in alinea ' + (i + 1) + ' staat. De andere zinnen horen bij andere alinea’s.')
    ]);
  }
  function maakBesteSamenvatting(R){
    var A = R.kies(ALINEA), f1 = {}, f2 = {};
    f1[A.of[0]] = 'Dat is maar een detail.'; f1[A.of[1]] = 'Dat is te breed.';
    f2[A.sf[0]] = 'Dat is alleen een voorbeeld uit de tekst.'; f2[A.sf[1]] = 'Dat staat niet in de tekst: het is een eigen mening of iets nieuws.';
    return OP('Welke samenvatting is het best?', alineaTekst(A, -1), [
      K(R, 'Wat is het onderwerp van de tekst?', A.o, A.of, 'Kijk naar de titel: ' + A.t + '.', { fout:f1 }),
      K(R, 'Welke samenvatting is het best? Hij noemt de hoofdzaken en voegt niets toe.', A.sg, A.sf, 'Een goede samenvatting gaat over ' + A.o + ', noemt de uitleg en de conclusie, en laat voorbeelden weg.', { fout:f2 })
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lees-argument', niveau:'2F', domein:'lezen', naam:'Feiten, meningen en argumenten',
        uit:'In veel teksten probeert een schrijver je iets te laten vinden. Wie feiten en meningen uit elkaar houdt en standpunten en argumenten herkent, laat zich niet zomaar overtuigen.' },
      doelen:[
        { id:'lees-feit-mening', naam:'Feit of mening', kort:'Kun je het nakijken? Dan is het een feit. Vindt iemand het? Dan is het een mening',
          uit:'<p>Een <b>feit</b> kun je nakijken: opzoeken, tellen of meten. <i>Een spin heeft acht poten.</i></p><p>Een <b>mening</b> is wat iemand vindt. Een ander kan het oneens zijn. <i>Spinnen zijn eng.</i></p><p>Let op woorden die een oordeel geven: <i>leuk, eng, mooi, te duur, de beste, moeten</i>.</p>',
          wanneer:'je wilt weten of je een tekst zomaar kunt geloven.',
          maak:function(R){ return maakFeit(R); } },
        { id:'lees-standpunt', naam:'Standpunt en argument', kort:'Het standpunt is wat de schrijver vindt, het argument zegt waarom',
          uit:'<p>Het <b>standpunt</b> is de mening van de schrijver. <i>Scholen moeten later beginnen.</i></p><p>Een <b>argument</b> is de reden voor die mening. Je vindt het met de vraag: <b>waarom</b> vindt de schrijver dat? <i>Omdat tieners ’s ochtends meer slaap nodig hebben.</i></p>',
          wanneer:'je een betoog, een column of een reactie leest.',
          maak:function(R){ return maakStandpunt(R, R.kies(ARGU)); } },
        { id:'lees-arg-signaal', naam:'Signaalwoorden bij argumenten', kort:'Na want, omdat en namelijk komt het argument, na daarom en dus het standpunt',
          uit:'<p>Signaalwoorden wijzen je de weg. Na <b>want</b>, <b>omdat</b> en <b>namelijk</b> volgt het <b>argument</b>.</p><p>Na <b>daarom</b> en <b>dus</b> volgt het <b>standpunt</b>. Het argument staat dan ervoor.</p><p><i>Lezen vergroot je woordenschat. <b>Daarom</b> moet je elke dag lezen.</i></p>',
          wanneer:'je snel het standpunt in een tekst wilt vinden.',
          maak:function(R){ return maakArgSignaal(R, R.kies(ARGU)); } },
        { id:'lees-conclusie', naam:'Een conclusie trekken', kort:'Zet wat er staat naast elkaar en kijk wat daar logisch uit volgt',
          uit:'<p>Soms staat het antwoord niet letterlijk in de tekst. Dan moet je <b>tussen de regels lezen</b>: wat volgt er logisch uit?</p><p><i>De winkel sluit om zes uur. Sara komt om kwart over zes.</i> Conclusie: Sara staat voor een dichte deur.</p><p>Pas op: trek geen conclusie die verder gaat dan de tekst, met woorden als <i>nooit</i>, <i>altijd</i> of <i>iedereen</i>.</p>',
          wanneer:'een vraag zegt: wat kun je uit de tekst afleiden?',
          maak:function(R){ return maakConclusie(R, R.kies(CONCL)); } }
      ] },
    { groep:{ id:'lees-structuur', niveau:'2F', domein:'lezen', naam:'Tekststructuren',
        uit:'Veel zakelijke teksten volgen een vast patroon. Als je het patroon herkent, weet je wat je kunt verwachten en vind je sneller de belangrijkste informatie.' },
      doelen:[
        { id:'lees-struct-probleem', naam:'Probleem en oplossing', kort:'Eerst wat er mis is, dan wat je eraan kunt doen',
          uit:'<p>Bij <b>probleem en oplossing</b> beschrijft de schrijver eerst wat er mis is. Daarna komt wat je eraan kunt doen.</p><p>Let op woorden als <i>probleem, last van, oplossing, helpen, daarom gaat … doen</i>.</p>',
          wanneer:'een tekst over een probleem gaat, bijvoorbeeld op school of in de buurt.',
          maak:function(R){ return maakStructuur(R, 'probleem en oplossing'); } },
        { id:'lees-struct-oorzaak', naam:'Oorzaak en gevolg', kort:'Waardoor iets komt en wat er daarna door gebeurt',
          uit:'<p>Bij <b>oorzaak en gevolg</b> vertelt de tekst waardoor iets gebeurt en wat de gevolgen zijn. Vaak is het een ketting: het ene leidt tot het andere.</p><p>Signaalwoorden: <i>doordat, daardoor, waardoor, hierdoor</i>.</p>',
          wanneer:'een tekst uitlegt wat er gebeurt door iets.',
          maak:function(R){ return maakStructuur(R, 'oorzaak en gevolg'); } },
        { id:'lees-struct-voornadeel', naam:'Voor- en nadelen', kort:'Wat is er goed aan, en wat is er minder goed aan?',
          uit:'<p>Bij <b>voor- en nadelen</b> zet de schrijver de goede en de minder goede kanten van iets op een rij.</p><p>Het voordeel staat vaak eerst. Het nadeel komt na <i>maar, toch, een nadeel is</i>.</p>',
          wanneer:'je twee kanten van een keuze wilt zien.',
          maak:function(R){ return maakStructuur(R, 'voor- en nadelen'); } },
        { id:'lees-struct-verschijnsel', naam:'Verschijnsel en verklaring', kort:'Iets wat je ziet of merkt, en hoe dat komt',
          uit:'<p>Bij <b>verschijnsel en verklaring</b> beschrijft de schrijver eerst iets wat je kunt zien of merken, zoals een regenboog. Daarna legt hij uit hoe dat komt.</p><p>Vaak begint de tekst met een vraag: <i>Waarom is de lucht blauw?</i> De verklaring komt na <i>dat komt doordat</i>.</p>',
          wanneer:'een tekst iets uit de natuur of de techniek uitlegt.',
          maak:function(R){ return maakStructuur(R, 'verschijnsel en verklaring'); } },
        { id:'lees-struct-betoog', naam:'Het betoog met weerlegging', kort:'Standpunt, argumenten, een tegenargument en de weerlegging',
          uit:'<p>Een <b>betoog</b> heeft een standpunt en argumenten. Een goed betoog noemt ook een <b>tegenargument</b>: wat anderen vinden. Daarna volgt de <b>weerlegging</b>: waarom dat tegenargument niet klopt.</p><p><i>Sommigen zeggen dat … Maar …</i></p>',
          wanneer:'je een betoog leest of zelf een betoog schrijft.',
          maak:function(R){ return maakStructuur(R, 'betoog'); } },
        { id:'lees-struct-welke', naam:'Welke structuur?', kort:'Kijk welke vraag de tekst beantwoordt',
          uit:'<p>Herken de <b>structuur</b> aan de vraag die de tekst beantwoordt.</p><p>Wat is het probleem en wat doe je eraan? Waardoor komt het en wat zijn de gevolgen? Wat zijn de voor- en nadelen? Wat zie je en hoe komt dat? Wat vindt de schrijver en waarom?</p>',
          wanneer:'een toetsvraag vraagt naar de tekststructuur.',
          maak:function(R){ return maakWelkeStructuur(R); } }
      ] },
    { groep:{ id:'lees-samenvat', niveau:'3F', domein:'lezen', naam:'Samenvatten',
        uit:'Een samenvatting is kort en bevat alleen de hoofdzaken. Je schrapt wat bijzaak is, vat elke alinea in één zin samen, en controleert of je niets toevoegt.' },
      doelen:[
        { id:'lees-samen-schrap', naam:'Bijzaken schrappen', kort:'Schrap voorbeelden en details, houd de kernzin en de uitleg',
          uit:'<p>Begin met <b>schrappen</b>. Voorbeelden, herhalingen en details zijn <b>bijzaken</b>: die laat je weg.</p><p>De <b>kernzin</b> en de belangrijke uitleg houd je. Zo blijft er een korte tekst over met alleen de hoofdzaken.</p>',
          wanneer:'je een samenvatting moet maken van een tekst.',
          maak:function(R){ return maakSchrappen(R); } },
        { id:'lees-samen-alinea', naam:'Per alinea de kern', kort:'Vat elke alinea samen in één zin',
          uit:'<p>Bij een langere tekst vat je <b>elke alinea</b> samen in <b>één zin</b>. Kijk eerst wat de alinea doet: inleiden, uitleggen of afsluiten.</p><p>Gebruik alleen wat in die alinea staat. Een voorbeeldalinea sla je meestal over.</p>',
          wanneer:'een tekst uit meer alinea’s bestaat.',
          maak:function(R){ return maakPerAlinea(R); } },
        { id:'lees-samen-kies', naam:'De beste samenvatting kiezen', kort:'Een goede samenvatting noemt de hoofdzaken en voegt niets toe',
          uit:'<p>Een goede <b>samenvatting</b> gaat over het onderwerp en noemt de hoofdzaken. Ze is kort en in je eigen woorden.</p><p>Een slechte samenvatting noemt alleen een <b>voorbeeld</b>, of voegt iets toe wat <b>niet in de tekst</b> staat, zoals een eigen mening.</p>',
          wanneer:'je bij een toets uit een paar samenvattingen moet kiezen.',
          maak:function(R){ return maakBesteSamenvatting(R); } }
      ] }
  ]);

  /* ================= LEZEN: argumentatie en drogredenen ================= */

  var DROG = {
    persoon:{ naam:'op de persoon spelen', kenm:'de spreker valt de persoon aan in plaats van diens argument', id:'lees-drog-persoon', titel:'Op de persoon spelen',
      uit:'<p>Bij <b>op de persoon spelen</b> reageer je niet op het argument, maar val je de persoon aan.</p><p><i>Je hoeft niet naar Tim te luisteren over gezond eten. Hij eet zelf elke dag patat.</i> Of gezond eten belangrijk is, hangt niet af van wat Tim eet.</p>', o:[
      'Je hoeft niet naar Tim te luisteren over gezond eten. Hij eet zelf elke dag patat.',
      'Het plan van Sara voor de schoolkrant is vast slecht. Ze is pas veertien.',
      'Waarom zou ik naar die klimaatwetenschapper luisteren? Hij heeft een rare bril.',
      'Daan zegt dat de toets te moeilijk was, maar Daan haalt altijd onvoldoendes, dus dat telt niet.',
      'De nieuwe trainer wil vaker trainen. Maar hij heeft zelf nooit in het eerste elftal gespeeld, dus zijn idee deugt niet.',
      'Mijn buurman zegt dat we minder vlees moeten eten, maar hij rijdt in een grote auto. Dus hij heeft ongelijk.',
      'Je kunt het voorstel van de leerlingenraad wel vergeten. Die zitten daar alleen maar om onder de les uit te komen.',
      'Noor vindt dat de pauze langer moet. Logisch, ze is gewoon lui.',
      'Die youtuber zegt dat de game slecht is, maar hij is gewoon jaloers.',
      'De wethouder wil een nieuw zwembad. Maar zij kan zelf niet eens zwemmen, dus dat plan is niks.',
      'Lisa zegt dat het pesten in de groepsapp moet stoppen. Maar Lisa is zelf ook niet altijd aardig.',
      'Wat weet jij nou van gamen? Jij bent al veertig.',
      'Je moet niet luisteren naar wat Ravi over sparen zegt. Hij heeft zelf nooit geld.'
    ] },
    vergelijking:{ naam:'verkeerde vergelijking', kenm:'de spreker vergelijkt twee dingen die niet echt op elkaar lijken', id:'lees-drog-vergelijking', titel:'Verkeerde vergelijking',
      uit:'<p>Bij een <b>verkeerde vergelijking</b> vergelijk je twee dingen die in het belangrijkste punt niet op elkaar lijken.</p><p><i>Een vis hoeft ook niet te sporten, dus ik hoef niet naar gym.</i> Een vis en een leerling lijken niet op elkaar als het om gym gaat.</p>', o:[
      'Een hond mag ook de hele dag spelen. Waarom moet ik dan huiswerk maken?',
      'Een telefoon op school verbieden is net zoiets als lucht verbieden.',
      'Volwassenen mogen zelf weten hoe laat ze naar bed gaan. Dus ik als twaalfjarige ook.',
      'Een auto heeft ook geen helm nodig, dus een fietser ook niet.',
      'Planten hebben ook geen ontbijt nodig, dus ik kan het ontbijt best overslaan.',
      'Een kat leert ook niet lezen, en die is toch gelukkig. Dus waarom zou ik lezen?',
      'Een vis hoeft ook niet te sporten, dus ik hoef niet naar gym.',
      'Een uur gamen is hetzelfde als een uur sporten: je bent allebei een uur bezig.',
      'In een dierentuin zitten dieren achter een hek. Een school met een hek is dus een gevangenis.',
      'Een boom groeit ook zonder les. Waarom zou ik dan naar school moeten?',
      'Een robot werkt ook dag en nacht, dus jongeren kunnen best twintig uur per week werken naast school.',
      'Een profvoetballer traint ook maar een paar uur per dag. Dus een paar uur per dag naar school is genoeg.',
      'Een goudvis zit ook de hele dag binnen, dus het is prima als ik de hele dag binnen zit.'
    ] },
    generalisatie:{ naam:'overhaaste generalisatie', kenm:'de spreker trekt een algemene conclusie uit te weinig gevallen', id:'lees-drog-generalisatie', titel:'Overhaaste generalisatie',
      uit:'<p>Bij een <b>overhaaste generalisatie</b> trek je een conclusie over <i>alle</i> gevallen, terwijl je er maar een paar kent.</p><p><i>Ik had twee keer een slechte pizza bij die pizzeria. Alle pizza’s daar zijn slecht.</i> Twee pizza’s zeggen niets over alle pizza’s.</p><p>Let op woorden als <i>altijd, nooit, iedereen, alle</i>.</p>', o:[
      'Mijn neef is gepest op die school. Op die school wordt dus iedereen gepest.',
      'Ik heb twee keer een slechte pizza gegeten bij die pizzeria. Alle pizza’s daar zijn dus slecht.',
      'Mijn opa heeft nooit gesport en werd negentig. Sporten is dus niet nodig om oud te worden.',
      'Ik kende een kat die beet. Katten zijn dus gevaarlijk.',
      'Twee jongens uit mijn klas gamen te veel. Alle jongeren zijn verslaafd aan games.',
      'Ik had één keer een onvoldoende voor Frans. Ik ben dus slecht in talen.',
      'De elektrische auto van mijn buurman gaat steeds kapot. Elektrische auto’s deugen niet.',
      'Gisteren was de trein te laat. De trein is altijd te laat.',
      'Ik ken drie mensen die van rap houden. Iedereen houdt dus van rap.',
      'Mijn zus las één boek dat saai was. Lezen is dus saai.',
      'In de eerste week van de vakantie regende het twee dagen. Het regent daar altijd.',
      'Een speler van die voetbalclub schold de scheidsrechter uit. Die hele club is onsportief.',
      'Ik heb één filmpje van die youtuber gezien en dat was dom. Al zijn filmpjes zijn dom.'
    ] },
    cirkel:{ naam:'cirkelredenering', kenm:'het argument van de spreker zegt hetzelfde als zijn standpunt', id:'lees-drog-cirkel', titel:'Cirkelredenering',
      uit:'<p>Bij een <b>cirkelredenering</b> is het argument eigenlijk hetzelfde als het standpunt, in andere woorden. Je draait in een rondje.</p><p><i>Deze game is de beste, omdat er geen betere game is.</i> Waarom is hij de beste? Dat hoor je niet.</p>', o:[
      'Deze game is de beste, omdat er geen betere game is.',
      'Pizza is het lekkerste eten, want niets is lekkerder dan pizza.',
      'Spinnen zijn eng, omdat ze zo griezelig zijn.',
      'Dit boek is saai, want het is gewoon niet boeiend.',
      'Hij is de beste voetballer van het team, want niemand in het team voetbalt beter.',
      'Huiswerk is nuttig, omdat je er iets aan hebt.',
      'Die regel is eerlijk, want het is een rechtvaardige regel.',
      'Gamen is ongezond, omdat het niet goed is voor je gezondheid.',
      'Wiskunde is moeilijk, want het is gewoon een lastig vak.',
      'Onze school is de beste school, omdat geen enkele school beter is.',
      'Katten zijn leuker dan honden, omdat honden minder leuk zijn dan katten.',
      'Die film is grappig, want het is een komische film.',
      'Je moet naar de juf luisteren, omdat je naar de juf moet luisteren.'
    ] },
    autoriteit:{ naam:'verkeerd beroep op autoriteit', kenm:'de spreker verwijst naar iemand die geen deskundige is op dit onderwerp', id:'lees-drog-autoriteit', titel:'Verkeerd beroep op autoriteit',
      uit:'<p>Een deskundige noemen is prima: een tandarts over tanden. Bij een <b>verkeerd beroep op autoriteit</b> noem je iemand die <b>geen deskundige</b> is op dit onderwerp, of die er belang bij heeft.</p><p><i>Deze tandpasta is de beste, want een bekende voetballer gebruikt hem.</i> Een voetballer weet niet meer van tandpasta dan jij.</p>', o:[
      'Deze tandpasta is de beste, want een bekende voetballer gebruikt hem.',
      'Mijn favoriete zanger zegt dat vaccins niet werken, dus het is waar.',
      'Een beroemde youtuber zegt dat je van dit drankje slimmer wordt. Dan klopt het.',
      'Mijn oom is piloot en hij zegt dat dit medicijn niet helpt.',
      'Een bekende acteur vindt deze telefoon de beste. Ik koop hem dus.',
      'Mijn buurvrouw is kapper en zij zegt dat de aarde helemaal niet opwarmt.',
      'Die influencer met een miljoen volgers zegt dat ontbijten ongezond is. Dus ik ontbijt niet meer.',
      'Een wereldberoemde rapper zegt dat school zinloos is, dus ik stop ermee.',
      'De beste schaatser van Nederland zegt dat deze verzekering het voordeligst is.',
      'Mijn gymdocent zegt dat dit geschiedenisboek vol fouten staat, dus ik lees het niet.',
      'Een bekende tv-kok zegt dat je van deze vitaminepillen nooit meer ziek wordt.',
      'Een popster zegt dat dit spel het leerzaamste spel is. Dan is het vast waar.',
      'Mijn tante is bakker en zij zegt dat elektrische auto’s gevaarlijk zijn.'
    ] },
    meerderheid:{ naam:'beroep op de meerderheid', kenm:'de spreker zegt dat iets klopt omdat veel mensen het vinden of doen', id:'lees-drog-meerderheid', titel:'Beroep op de meerderheid',
      uit:'<p>Bij een <b>beroep op de meerderheid</b> zeg je dat iets goed of waar is, omdat <b>veel mensen</b> het vinden of doen.</p><p><i>Iedereen in mijn klas heeft deze sneakers, dus ze zijn goed.</i> Of de sneakers goed zijn, hangt niet af van hoeveel mensen ze dragen.</p>', o:[
      'Iedereen in mijn klas heeft deze sneakers, dus ze zijn goed.',
      'Deze app is de beste, want hij is al tien miljoen keer gedownload.',
      'Bijna iedereen vindt dat het mag, dus het is niet erg.',
      'De meeste mensen geloven het, dus het zal wel waar zijn.',
      'Al mijn vrienden gaan naar dat feest, dus het wordt vast leuk en veilig.',
      'Iedereen spiekt weleens, dus het is niet zo erg.',
      'Dit liedje staat bovenaan de hitlijst. Het is dus het beste liedje van het jaar.',
      'Duizenden mensen hebben dit dieet geprobeerd. Het werkt dus zeker.',
      'Iedereen fietst hier door rood, dus het is wel veilig.',
      'De helft van de school heeft al een account op die site. Dan is die site vast betrouwbaar.',
      'Bijna alle leerlingen vinden de nieuwe regel stom, dus de regel is fout.',
      'Iedereen in de straat zet zijn afval naast de container. Dan mag ik dat ook.',
      'Zoveel mensen kunnen zich niet vergissen: deze film moet wel goed zijn.'
    ] },
    dilemma:{ naam:'vals dilemma', kenm:'de spreker doet alsof er maar twee keuzes zijn, terwijl er meer zijn', id:'lees-drog-dilemma', titel:'Vals dilemma',
      uit:'<p>Bij een <b>vals dilemma</b> doe je alsof er maar <b>twee keuzes</b> zijn, terwijl er meer mogelijkheden zijn.</p><p><i>Of je bent voor ons team, of je bent tegen ons.</i> Je kunt ook neutraal zijn, of voor allebei.</p><p>Let op: <i>of … of …</i></p>', o:[
      'Of je bent voor ons team, of je bent tegen ons.',
      'Je gaat naar de universiteit, of je wordt niks.',
      'Of we verbieden alle telefoons, of niemand leert meer iets.',
      'Of je doet mee met de sponsorloop, of je vindt dieren niet belangrijk.',
      'Als je niet elke dag traint, kun je net zo goed meteen stoppen.',
      'Of we gaan naar het strand, of de hele dag is verpest.',
      'Of je koopt de nieuwste telefoon, of je hoort er niet bij.',
      'Je stemt op mij, of je wilt dat de school slechter wordt.',
      'Of we bouwen hier een parkeergarage, of alle winkels gaan dicht.',
      'Of je eet nooit meer vlees, of het klimaat kan je niets schelen.',
      'Of je haalt een tien, of je hebt niet geleerd.',
      'Of we schaffen huiswerk helemaal af, of alle leerlingen raken overwerkt.',
      'Of je zit op sociale media, of je hebt geen vrienden.'
    ] },
    bewijslast:{ naam:'ontduiken van de bewijslast', kenm:'de spreker geeft zelf geen bewijs, maar laat de ander bewijzen dat het niet klopt', id:'lees-drog-bewijslast', titel:'Ontduiken van de bewijslast',
      uit:'<p>Wie iets beweert, moet het zelf bewijzen. Bij <b>ontduiken van de bewijslast</b> geef je geen bewijs, maar schuif je het naar de ander.</p><p><i>Er spookt het in de gymzaal. Bewijs maar eens dat het niet zo is.</i> Wie zegt dat het spookt, moet dat zelf aantonen.</p>', o:[
      'Er wonen buitenaardse wezens op de maan. Bewijs maar eens dat het niet zo is.',
      'Dit drankje maakt je slimmer. Kun jij aantonen dat het niet werkt?',
      '‘Waarom denk je dat de docent je niet mag?’ ‘Laat jij maar eens zien dat ze me wel mag.’',
      'Er spookt het in de gymzaal. Zolang niemand het tegendeel bewijst, blijf ik dat zeggen.',
      'Ik weet zeker dat Daan mijn pen heeft gepakt. Hij moet maar bewijzen dat hij het niet was.',
      '‘Waarom is dat merk beter?’ ‘Dat is gewoon zo. Noem jij maar een beter merk.’',
      'Deze steen brengt geluk. Niemand heeft ooit bewezen dat het niet zo is.',
      '‘Hoe weet je dat de toets is uitgelekt?’ ‘Laat jij maar zien dat hij niet is uitgelekt.’',
      'Mijn kat kan het weer voorspellen. Bewijs jij maar dat hij dat niet kan.',
      '‘Waarom moet de pauze korter?’ ‘Zeg jij eerst maar eens waarom hij zo lang moet blijven.’',
      'Er zit een geheime kamer onder de school. Zoek jij maar uit dat het niet zo is.',
      'Ik heb gelijk, tot jij bewijst dat ik ongelijk heb.',
      'Die oude boom is betoverd. Toon jij maar aan dat hij dat niet is.'
    ] },
    oorzaak:{ naam:'verkeerd oorzakelijk verband', kenm:'de spreker denkt dat het ene door het andere komt, alleen omdat ze na elkaar of samen gebeuren', id:'lees-drog-oorzaak', titel:'Verkeerd oorzakelijk verband',
      uit:'<p>Bij een <b>verkeerd oorzakelijk verband</b> denk je dat het ene door het andere komt, alleen omdat ze <b>na elkaar</b> of <b>tegelijk</b> gebeuren.</p><p><i>Ik droeg mijn gelukssokken en we wonnen. Die sokken laten ons winnen.</i> Dat de wedstrijd gewonnen werd, kwam door het spel, niet door de sokken.</p>', o:[
      'Ik droeg mijn gelukssokken en we wonnen. Die sokken laten ons winnen.',
      'Sinds de nieuwe directeur er is, regent het vaker. Dat komt door hem.',
      'Ik at een banaan en daarna haalde ik een tien. Bananen maken je slim.',
      'Na de vakantie werd ik verkouden. Van vakantie word je ziek.',
      'Ik stapte met mijn linkerbeen eerst uit bed en de hele dag ging mis. Dat kwam door dat linkerbeen.',
      'In de zomer eten mensen meer ijs en zijn er meer mensen met zonnebrand. Van ijs eten krijg je dus zonnebrand.',
      'Sinds ik een nieuwe telefoon heb, haal ik betere cijfers. Die telefoon maakt me slimmer.',
      'Er liep een zwarte kat voorbij en toen viel ik van mijn fiets. Die kat bracht ongeluk.',
      'Toen ik mijn haar had laten knippen, verloor ons team. Ik laat het nooit meer knippen voor een wedstrijd.',
      'Ik riep ‘niet regenen!’ en het bleef droog. Ik kan dus het weer bepalen.',
      'Sinds het nieuwe zwembad open is, zijn er meer verkeersongelukken. Het zwembad is gevaarlijk.',
      'Ik kreeg een onvoldoende op de dag dat ik een rode trui droeg. Rode truien brengen pech.',
      'Ik nam een vitaminepil en de volgende dag was mijn verkoudheid over. Die pil heeft me genezen.'
    ] }
  };
  var DROGKEYS = Object.keys(DROG);
  var DROGBUUR = { autoriteit:['meerderheid'], meerderheid:['autoriteit'], generalisatie:['oorzaak', 'vergelijking'], oorzaak:['generalisatie'], vergelijking:['generalisatie'] };
  var GOEDARG = [
    'Fietsen is gezond, want je beweegt elke dag een half uur.',
    'Je moet een helm dragen, want artsen zeggen dat een helm ernstig hoofdletsel kan voorkomen.',
    'De pauze moet langer, want nu staat iedereen tien minuten in de rij bij de kantine.',
    'Zwemles is belangrijk, omdat Nederland heel veel water heeft.',
    'Je kunt bij het leren beter je telefoon wegleggen, want meldingen leiden je af.',
    'Tweedehands kleding is goed voor het milieu, omdat er geen nieuwe kleding voor gemaakt hoeft te worden.',
    'Plastic in zee is gevaarlijk, want vogels eten de stukjes plastic op.',
    'Ontbijten is slim, want dan heb je energie voor de ochtend.',
    'Een moestuin op school is leerzaam, want je ziet zelf hoe groente groeit.',
    'Lezen vergroot je woordenschat, want je komt steeds nieuwe woorden tegen.',
    'Er moet een fietspad langs de drukke weg komen, want daar gebeuren nu vaak ongelukken.',
    'Water is beter voor je tanden dan frisdrank, want er zit geen suiker in.',
    'Huiswerk plannen helpt, want dan zie je op tijd wanneer het druk wordt.'
  ];
  function drogNiet(k){ return [k].concat(DROGBUUR[k] || []); }
  function maakDrogPer(R, k){
    var D = DROG[k], ander1 = R.kies(DROGKEYS.filter(function(x){ return drogNiet(k).indexOf(x) < 0; }));
    var stukken = R.hussel([{ s:k, t:R.kies(D.o) }, { s:ander1, t:R.kies(DROG[ander1].o) }, { s:'goed', t:R.kies(GOEDARG) }]);
    var L = ['A', 'B', 'C'], goed = '', f = {};
    stukken.forEach(function(s, i){
      if (s.s === k) goed = 'Uitspraak ' + L[i];
      else f['Uitspraak ' + L[i]] = s.s === 'goed' ? 'Dat is een gewoon, redelijk argument.' : 'Dat is ook een drogreden, maar een andere: ' + DROG[s.s].naam + '.';
    });
    return OP('Welke uitspraak is: ' + D.naam + '?', tekst(stukken.map(function(s, i){ return '<b>' + L[i] + '</b> ' + s.t; })), [
      K(R, 'Waar let je op bij ' + D.naam + '?', hoofd(D.kenm) + '.', ander(R, DROGKEYS, drogNiet(k), 2).map(function(x){ return hoofd(DROG[x].kenm) + '.'; }), 'Denk aan de naam: ' + D.naam + '.'),
      K(R, 'Welke uitspraak past daarbij?', goed, L.map(function(l){ return 'Uitspraak ' + l; }), 'Zoek de uitspraak waarin ' + D.kenm + '.', { fout:f })
    ]);
  }
  function maakDrogWelk(R){
    var k = R.kies(DROGKEYS), D = DROG[k], niet = drogNiet(k);
    return OP('Welke drogreden?', tekst(R.kies(D.o)), [
      K(R, 'Wat doet de spreker?', hoofd(D.kenm) + '.', ander(R, DROGKEYS, niet, 2).map(function(x){ return hoofd(DROG[x].kenm) + '.'; }), 'Kijk wat er mis is met het argument. Is het een aanval, een vergelijking, een paar gevallen, een rondje, iemand die geen deskundige is, de massa, twee keuzes, geen bewijs, of iets wat toevallig samen gebeurt?'),
      K(R, 'Welke drogreden is dat?', D.naam, ander(R, DROGKEYS, niet, 3).map(function(x){ return DROG[x].naam; }), 'Als ' + D.kenm + ', heet dat ' + D.naam + '.')
    ]);
  }

  /* soorten argumenten: [tekst, soort] */
  var ARGSOORT = {
    feit:['feitelijk argument', 'iets wat je kunt nakijken, zoals een getal of een gebeurtenis'],
    voorbeeld:['voorbeeld', 'één geval van iemand anders dat het laat zien'],
    gezag:['gezagsargument', 'wat een deskundige of een bekende organisatie zegt'],
    ervaring:['ervaringsargument', 'wat de schrijver zelf heeft meegemaakt']
  };
  var ARGVB = [
    ['Nederland moet zuinig zijn met water. In de zomer van 2022 stond het water in de Rijn extreem laag.', 'feit'],
    ['Scholen moeten zwemles geven. Nederland heeft duizenden kilometers aan sloten, rivieren en kanalen.', 'feit'],
    ['De kantine moet gratis water aanbieden. In een flesje frisdrank zitten vaak meer dan zeven suikerklontjes.', 'feit'],
    ['Je kunt beter met de trein naar Parijs dan met het vliegtuig. Met de trein stoot je veel minder CO2 uit.', 'feit'],
    ['Sporten maakt je zelfverzekerder. Neem Noor: sinds ze op judo zit, durft ze veel meer.', 'voorbeeld'],
    ['Een bijbaantje is leerzaam. Mijn neef leerde in de supermarkt hoe je met lastige klanten omgaat.', 'voorbeeld'],
    ['Gamen kan je op ideeën brengen. Kijk maar naar Sem uit 2B: door een bouwspel wil hij nu architect worden.', 'voorbeeld'],
    ['Een huisdier maakt mensen vrolijker. Mijn oma kreeg een kat en sindsdien lacht ze veel meer.', 'voorbeeld'],
    ['Je moet genoeg slapen. Volgens slaapdeskundigen hebben tieners acht tot tien uur slaap per nacht nodig.', 'gezag'],
    ['Energiedrankjes zijn niet goed voor jongeren. Het Voedingscentrum raadt ze af voor kinderen.', 'gezag'],
    ['Elke dag bewegen is belangrijk. Artsen adviseren jongeren om elke dag minstens een uur te bewegen.', 'gezag'],
    ['Je moet je handen goed wassen. Volgens het RIVM voorkom je daarmee veel ziektes.', 'gezag'],
    ['Je kunt beter niet met muziek leren. Ik merk zelf dat ik dan veel minder onthoud.', 'ervaring'],
    ['Een bijbaantje is goed voor je. Sinds ik in de bakkerij werk, kan ik veel beter plannen.', 'ervaring'],
    ['Ontbijten helpt. Sinds ik ontbijt, heb ik in het derde uur geen honger meer.', 'ervaring'],
    ['Een huiswerkplanning werkt. Ik heb er dit jaar zelf veel minder stress door.', 'ervaring']
  ];
  function maakArgSoort(R, it){
    var s = it[1], keys = Object.keys(ARGSOORT);
    return OP('Wat voor argument is dit?', tekst(it[0]), [
      K(R, 'Wat gebruikt de schrijver als steun voor zijn mening?', ARGSOORT[s][1], ander(R, keys, [s], 2).map(function(x){ return ARGSOORT[x][1]; }), 'Lees de tweede zin. Gaat het over de schrijver zelf (ik), over iemand anders, over een deskundige of over iets wat je kunt nakijken?'),
      K(R, 'Hoe heet zo’n argument?', ARGSOORT[s][0], ander(R, keys, [s], 3).map(function(x){ return ARGSOORT[x][0]; }), 'Een argument met ' + ARGSOORT[s][1] + ' heet een ' + ARGSOORT[s][0] + '.')
    ]);
  }
  /* sterkte: [standpunt, sterk, zwak (één geval), gaat er niet over] */
  var STERK = [
    ['Je moet een fietshelm dragen.', 'Artsen zeggen dat een helm ernstig hoofdletsel kan voorkomen.', 'Mijn buurjongen viel een keer en had geen helm op.', 'Helmen zijn er in veel mooie kleuren.'],
    ['Scholen moeten later beginnen.', 'Slaapdeskundigen zeggen dat tieners ’s avonds pas laat slaperig worden.', 'Ik ben ’s ochtends altijd moe.', 'Mijn favoriete docent geeft het eerste uur les.'],
    ['De kantine moet gezonder eten verkopen.', 'Veel jongeren eten nu meer suiker dan goed voor ze is.', 'Ik vind gezonde broodjes zelf lekkerder.', 'De kantine is vorig jaar nog geverfd.'],
    ['Je moet zuinig zijn met water.', 'In droge zomers is er in Nederland soms een tekort aan water.', 'Mijn moeder zegt altijd dat ik te lang douche.', 'Water is doorzichtig.'],
    ['Ontbijten is belangrijk.', 'Wie ontbijt, heeft energie voor de ochtend en kan zich beter concentreren.', 'Mijn vriend ontbijt altijd en hij is heel slim.', 'Hagelslag is een Nederlandse uitvinding.'],
    ['Iedereen moet leren zwemmen.', 'Nederland heeft zoveel water dat je makkelijk ergens in kunt vallen.', 'Ik vond zwemmen vroeger leuk.', 'Het zwembad heeft een nieuwe glijbaan.'],
    ['Tweedehands kleding kopen is beter.', 'Voor nieuwe kleding zijn veel water en energie nodig.', 'Mijn tante heeft een mooie tweedehands jas.', 'Er zijn veel kledingwinkels in de stad.'],
    ['Telefoons horen niet in de klas.', 'Meldingen leiden af, ook als je ze niet opent.', 'Ik zag een keer iemand gamen in de les.', 'Telefoons worden steeds duurder.'],
    ['Lezen is goed voor je.', 'Door te lezen leer je veel nieuwe woorden.', 'Mijn opa leest elke dag en hij is heel vrolijk.', 'De bibliotheek heeft een nieuwe kleur gekregen.'],
    ['Er moet een zebrapad komen bij de school.', 'Elke ochtend steken daar honderden leerlingen een drukke weg over.', 'Ik vind oversteken eng.', 'Zebra’s zijn zwart met wit.'],
    ['Energiedrankjes zijn slecht voor jongeren.', 'Er zit veel cafeïne in, waardoor je slecht kunt slapen.', 'Mijn broer werd een keer misselijk van een blikje.', 'De blikjes hebben vrolijke kleuren.'],
    ['Sporten is goed voor je humeur.', 'Bij het sporten maakt je lichaam stoffen aan waardoor je je beter voelt.', 'Na voetbal ben ik altijd blij.', 'Voetbal is in Nederland een populaire sport.'],
    ['Huiswerk plannen is slim.', 'Met een planning zie je op tijd wanneer je veel moet doen.', 'Mijn zus plant alles en zij is altijd vrolijk.', 'Een agenda kost maar een paar euro.']
  ];
  function maakSterk(R, it){
    var f = {}; f[it[2]] = 'Dat is maar één persoonlijk geval. Dat zegt weinig over iedereen.'; f[it[3]] = 'Dat gaat niet over het standpunt.';
    return OP('Welk argument is het sterkst?', tekst('<b>Standpunt:</b> ' + it[0]), [
      K(R, 'Welk argument gaat niet eens over het standpunt?', it[3], [it[1], it[2]], 'Vraag bij elk argument: is dit een reden voor ' + q(it[0].replace(/\.$/, '').toLowerCase()) + '?'),
      K(R, 'Welk argument is het sterkst?', it[1], [it[2], it[3]], 'Een argument dat voor iedereen geldt of van een deskundige komt, is sterker dan één persoonlijk geval.', { fout:f })
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'lees-drog', niveau:'3F', domein:'lezen', naam:'Argumentatie en drogredenen',
        uit:'Niet elk argument is een goed argument. Een drogreden lijkt een argument, maar klopt niet. Hier leer je elke drogreden herkennen, en je leert hoe sterk een argument is.' },
      doelen:DROGKEYS.map(function(k){
        var D = DROG[k];
        return { id:D.id, naam:D.titel, kort:hoofd(D.kenm), uit:D.uit,
          wanneer:'je een betoog, een reactie of reclame kritisch leest.',
          maak:function(R){ return maakDrogPer(R, k); } };
      }).concat([
        { id:'lees-drog-welke', naam:'Welke drogreden?', kort:'Kijk wat er mis is met het argument en noem de drogreden',
          uit:'<p>Nu alle <b>drogredenen</b> door elkaar. Vraag je af: wat is er mis met dit argument?</p><p>Valt hij de persoon aan? Vergelijkt hij appels met peren? Trekt hij een conclusie uit een paar gevallen? Draait hij in een rondje? Noemt hij iemand die er niets van weet? Zegt hij: iedereen doet het? Geeft hij maar twee keuzes? Moet de ander het bewijs leveren? Of komt het ene toevallig na het andere?</p>',
          wanneer:'een vraag zegt: welke drogreden zit in deze uitspraak?',
          maak:function(R){ return maakDrogWelk(R); } },
        { id:'lees-arg-soort', naam:'Soorten argumenten', kort:'Een feit, een voorbeeld, een deskundige of je eigen ervaring',
          uit:'<p>Er zijn verschillende <b>soorten argumenten</b>.</p><p>Een <b>feitelijk argument</b>: iets wat je kunt nakijken. Een <b>voorbeeld</b>: één geval van iemand anders. Een <b>gezagsargument</b>: wat een deskundige of een organisatie zegt. Een <b>ervaringsargument</b>: wat de schrijver zelf heeft meegemaakt.</p>',
          wanneer:'je wilt beoordelen waar een schrijver zijn mening op baseert.',
          maak:function(R){ return maakArgSoort(R, R.kies(ARGVB)); } },
        { id:'lees-arg-sterkte', naam:'De sterkte van een argument', kort:'Een sterk argument gaat over het standpunt en geldt niet alleen voor één persoon',
          uit:'<p>Een argument is <b>sterk</b> als het echt over het standpunt gaat en voor veel mensen geldt: een feit of wat een deskundige zegt.</p><p>Een argument is <b>zwak</b> als het maar over één persoon gaat, zoals <i>mijn buurjongen</i>. En een argument dat niet over het standpunt gaat, telt helemaal niet mee.</p>',
          wanneer:'je moet kiezen welk argument het best is, ook in je eigen betoog.',
          maak:function(R){ return maakSterk(R, R.kies(STERK)); } }
      ]) }
  ]);

  /* ================= FICTIE: verhalen ================= */

  /* de verteller: [fragment, ik of hij, woord voor de hoofdpersoon, hoofdpersoon, ander personage] */
  var VERTELLER = [
    ['‘Sam, kom je eten?’ riep mijn moeder. Ik zette snel mijn game op pauze. Eigenlijk had ik helemaal geen honger.', 'ik', 'ik', 'Sam', 'zijn moeder'],
    ['Noor fietste zo hard als ze kon. Ze was al tien minuten te laat. Bij het hek van school stond de conciërge met zijn armen over elkaar.', 'hij', 'ze', 'Noor', 'de conciërge'],
    ['Ik heet Lotte en ik ben bang voor honden. Toen de hond van de buren op me af kwam rennen, bleef ik stokstijf staan.', 'ik', 'ik', 'Lotte', 'de buren'],
    ['Ravi keek naar het scorebord. Nog één minuut. Toen de trainer ‘nu!’ riep, voelde hij zijn hart bonken.', 'hij', 'hij', 'Ravi', 'de trainer'],
    ['‘Mila, wakker worden!’ Ik trok het dekbed over mijn hoofd. Mijn broer bleef op de deur bonzen.', 'ik', 'ik', 'Mila', 'haar broer'],
    ['Daan opende voorzichtig de zolderdeur. Het rook er muf. In de hoek stond de oude kist waarin zijn opa vroeger alles bewaarde.', 'hij', 'hij', 'Daan', 'zijn opa'],
    ['Mijn oma zegt altijd: ‘Joep, je bent net je vader.’ Ik weet nooit of dat een compliment is.', 'ik', 'ik', 'Joep', 'zijn oma'],
    ['Sara stond voor de klas. Haar handen trilden. Ze keek naar haar spiekbriefje en haalde diep adem.', 'hij', 'ze', 'Sara', 'haar klasgenoten'],
    ['Ik had het nog nooit gedaan: alleen met de trein naar Amsterdam. ‘Pas goed op, Tess,’ zei papa op het perron. Ik knikte, maar mijn knieën knikten mee.', 'ik', 'ik', 'Tess', 'haar vader'],
    ['Yusuf keek uit het raampje van het vliegtuig. Onder hem lag het land waar hij geboren was. Over een uur zou hij zijn opa na vijf jaar weer zien.', 'hij', 'hij', 'Yusuf', 'zijn opa'],
    ['‘Liv, jij bent aan de beurt,’ fluisterde de juf. Ik liep naar het podium en tikte op de microfoon. Het werd doodstil.', 'ik', 'ik', 'Liv', 'de juf'],
    ['Emma vond de brief onder haar kussen. Er stond maar één zin op. Ze las hem drie keer en snapte er niets van.', 'hij', 'ze', 'Emma', 'de schrijver van de brief'],
    ['Ik ben Bram en ik ben de kleinste van mijn klas. Maar op het hockeyveld ben ik de snelste.', 'ik', 'ik', 'Bram', 'zijn klasgenoten'],
    ['Fleur rende de trap af. Haar zus zat al aan de ontbijttafel en grijnsde naar haar.', 'hij', 'ze', 'Fleur', 'haar zus']
  ];
  function maakVerteller(R, it){
    var ik = it[1] === 'ik', soort = it[2] === 'ze' ? 'zij' : 'hij';
    var IK = it[3] + ' zelf: een ik-verteller', HIJ = 'een verteller die over ' + it[3] + ' vertelt: een ' + (ik ? 'hij' : soort) + '-verteller';
    return OP('Wie vertelt het verhaal?', tekst(it[0]), [
      K(R, 'Welk woord gebruikt de verteller voor de hoofdpersoon? Kijk niet in de stukjes tussen aanhalingstekens.', it[2], ['ik', 'hij', 'ze'].filter(function(x){ return x !== it[2]; }),
        ik ? 'De verteller zegt steeds ‘ik’ en ‘mijn’.' : 'De verteller noemt de hoofdpersoon bij de naam: ' + it[3] + '.'),
      K(R, 'Wie vertelt het verhaal?', ik ? IK : HIJ, [ik ? HIJ : IK, it[4]], ik ? 'Wie ‘ik’ zegt, vertelt zelf. Uit de tekst blijkt dat ‘ik’ ' + it[3] + ' heet.' : 'De verteller praat over ' + it[3] + ' als ' + it[2] + '. ' + hoofd(it[3]) + ' vertelt dus niet zelf.')
    ]);
  }

  /* perspectief: [zinnen, welke zin gedachten geeft, wiens ogen, [andere personages]] */
  var PERSP = [
    [['Tim en Ayla liepen samen naar huis.', 'Ayla praatte de hele tijd over de musical van haar zus.', 'Tim vond het eigenlijk maar saai, maar dat durfde hij niet te zeggen.'], 2, 'Tim', ['Ayla', 'de zus van Ayla']],
    [['De docent deelde de toetsen uit.', 'Sanne keek naar het rode cijfer bovenaan.', 'Hoe moest ze dit thuis vertellen?'], 2, 'Sanne', ['de docent', 'haar ouders']],
    [['Opa zat in zijn stoel bij het raam.', 'Ruben kwam binnen met een bos bloemen.', 'Hij schrok: opa leek ineens zo oud.'], 2, 'Ruben', ['opa', 'oma']],
    [['In de kantine was het een herrie.', 'Jesse zag hoe het nieuwe meisje alleen aan een tafel zat.', 'Hij voelde een steek van medelijden.'], 2, 'Jesse', ['het nieuwe meisje', 'de conciërge']],
    [['De keeper stond klaar.', 'Lieke legde de bal op de stip.', 'Haar benen voelden als pudding en ze dacht maar aan één ding: niet missen.'], 2, 'Lieke', ['de keeper', 'de trainer']],
    [['Mama zette de pan op tafel.', 'Daan keek naar de spruitjes.', 'Hij haatte spruitjes, en vandaag waren het er wel heel veel.'], 2, 'Daan', ['mama', 'papa']],
    [['Zijn broer stond al bij de deur met de autosleutels.', 'Milan zocht nog steeds zijn andere schoen.', 'Waarom overkwam dit hem nou altijd?'], 2, 'Milan', ['zijn broer', 'zijn moeder']],
    [['De hond rende blaffend door de tuin.', 'Ilse keek vanaf het terras toe.', 'Ze wist zeker dat hij weer een kat had gezien.'], 2, 'Ilse', ['de hond', 'de kat']],
    [['Iedereen zong ‘Lang zal ze leven’.', 'Fenna blies de kaarsjes uit.', 'Ze voelde zich de gelukkigste persoon van de wereld.'], 2, 'Fenna', ['haar vriendinnen', 'haar moeder']],
    [['De trainer floot.', 'Omar sprintte naar de bal, maar de verdediger was sneller.', 'Wat speelde hij vandaag slecht, dacht Omar.'], 2, 'Omar', ['de verdediger', 'de trainer']],
    [['Juf Anja schreef de opdracht op het bord.', 'Merel begreep er niets van.', 'Ze hoopte maar dat de juf haar niets zou vragen.'], 2, 'Merel', ['juf Anja', 'haar klasgenoten']],
    [['De bus stopte bij de halte.', 'Kees stapte in en zag zijn oude vriend Bas achterin zitten.', 'Zou Bas hem na al die jaren nog herkennen?'], 2, 'Kees', ['Bas', 'de buschauffeur']],
    [['Papa las de krant.', 'Nina zat op de bank en staarde naar haar telefoon.', 'Waarom stuurde Ilona nou niets terug?'], 2, 'Nina', ['papa', 'Ilona']]
  ];
  function maakPersp(R, it){
    var z = it[0], gedachte = z[it[1]];
    return OP('Door wiens ogen kijk je mee?', tekst(z.join(' ')), [
      K(R, 'Zoek de zin waarin je leest wat iemand denkt of voelt.', gedachte, z.filter(function(x, i){ return i !== it[1]; }), 'Zoek woorden als vond, dacht, voelde, hoopte, of een vraag die iemand zichzelf stelt.'),
      K(R, 'Van wie lees je de gedachten? Door wiens ogen kijk je mee?', it[2], it[3], 'De gedachten in die zin zijn van ' + it[2] + '. Van de anderen weet je alleen wat ze doen.')
    ]);
  }

  /* personages: [fragment, naam, wat iemand doet, [anders], eigenschap, [foute eigenschappen]] */
  var PERSONAGE = [
    ['Toen Sem zag dat een jongen zijn boeken liet vallen, hielp hij meteen alles oprapen. ‘Gebeurt mij ook vaak,’ zei hij.', 'Sem', 'hij helpt de jongen met oprapen', ['hij lacht de jongen uit', 'hij loopt snel door'], 'behulpzaam', ['verlegen', 'gemeen']],
    ['Lisa had al drie keer gevraagd of ze de nieuwe telefoon mocht vasthouden. Nu griste ze hem gewoon uit Mila’s handen.', 'Lisa', 'ze pakt de telefoon zonder te wachten', ['ze wacht netjes op haar beurt', 'ze geeft de telefoon terug'], 'ongeduldig', ['geduldig', 'bescheiden']],
    ['Bij de spreekbeurt keek Joep alleen naar zijn schoenen. Hij praatte zo zacht dat niemand hem verstond.', 'Joep', 'hij praat zacht en kijkt naar de grond', ['hij maakt grappen', 'hij praat heel hard'], 'verlegen', ['brutaal', 'zelfverzekerd']],
    ['Elke dag stond Fatima om zes uur op om te trainen. Ook als het regende of als ze spierpijn had.', 'Fatima', 'ze traint elke dag, ook als het regent', ['ze slaat trainingen over', 'ze slaapt lang uit'], 'vastberaden', ['lui', 'vergeetachtig']],
    ['‘Mooi kapsel,’ zei Daan tegen zijn zus. Toen ze zich omdraaide, trok hij een gek gezicht naar zijn vrienden.', 'Daan', 'hij zegt iets aardigs en lacht haar daarna uit', ['hij geeft echt een gemeend compliment', 'hij knipt haar haar'], 'vals', ['eerlijk', 'verlegen']],
    ['Opa vergat zijn bril, zijn sleutels en zijn jas. Bij de voordeur draaide hij zich om: ‘Waar ging ik ook alweer naartoe?’', 'opa', 'hij vergeet steeds dingen', ['hij is altijd overal op tijd', 'hij ruimt alles netjes op'], 'vergeetachtig', ['nauwkeurig', 'boos']],
    ['Niemand durfde het, maar Ayla klom als eerste naar de hoogste duikplank en sprong.', 'Ayla', 'ze springt als eerste van de hoogste plank', ['ze blijft aan de kant staan', 'ze gaat huilen'], 'moedig', ['bang', 'lui']],
    ['Toen de juf vroeg wie het raam had gebroken, stak Bram meteen zijn vinger op. ‘Dat was ik. Sorry.’', 'Bram', 'hij geeft meteen toe wat hij deed', ['hij geeft een ander de schuld', 'hij zegt niets'], 'eerlijk', ['stiekem', 'verlegen']],
    ['Ravi brak zijn laatste koek in vier stukjes, zodat al zijn vrienden er iets van kregen.', 'Ravi', 'hij deelt zijn laatste koek', ['hij eet de koek alleen op', 'hij verkoopt de koek'], 'vrijgevig', ['gierig', 'hebberig']],
    ['Noor schreeuwde tegen de scheidsrechter en schopte de bal daarna de tribune in.', 'Noor', 'ze schreeuwt en schopt de bal weg', ['ze geeft de scheidsrechter een hand', 'ze blijft rustig'], 'driftig', ['kalm', 'verlegen']],
    ['Tess had haar kamer opgeruimd, haar tas ingepakt en haar kleren voor morgen klaargelegd. Daarna zette ze nog drie wekkers.', 'Tess', 'ze bereidt alles heel goed voor', ['ze vergeet haar tas', 'ze laat alles slingeren'], 'georganiseerd', ['slordig', 'lui']],
    ['‘Ik ben de beste van de klas,’ zei Kevin. ‘Niemand kan zo goed voetballen, rekenen en tekenen als ik.’', 'Kevin', 'hij zegt dat hij overal de beste in is', ['hij helpt anderen met rekenen', 'hij zegt dat hij niets kan'], 'opschepperig', ['bescheiden', 'verlegen']],
    ['De nieuwe jongen zat alleen. Sanne pakte haar dienblad en ging naast hem zitten. ‘Hoi, ik ben Sanne.’', 'Sanne', 'ze gaat naast de nieuwe jongen zitten', ['ze negeert de nieuwe jongen', 'ze gaat bij haar vrienden zitten'], 'vriendelijk', ['onverschillig', 'gemeen']]
  ];
  function maakPersonage(R, it){
    return OP('Wat voor iemand is ' + it[1] + '?', tekst(it[0]), [
      K(R, 'Wat doet of zegt ' + it[1] + '?', it[2], it[3], 'Lees precies wat ' + it[1] + ' doet. Kies alleen wat echt in de tekst staat.'),
      K(R, 'Wat zegt dat over ' + it[1] + '? Wat voor iemand is dit?', it[4], it[5], 'De schrijver zegt het niet letterlijk. Je leidt het af uit wat er gebeurt: ' + it[2] + '.')
    ]);
  }

  /* tijd en plaats: [fragment, plaatswoord, [geen plaats], tijdwoord, [geen tijd], waar en wanneer, [fout]] */
  var TIJDPLAATS = [
    ['De kerstboom twinkelde in de woonkamer. Buiten lag een dikke laag sneeuw en oma schonk warme chocolademelk in.', 'woonkamer', ['chocolademelk', 'twinkelde'], 'kerstboom', ['woonkamer', 'oma'], 'thuis, in de kersttijd', ['op school, in de zomer', 'op het strand, met Kerst']],
    ['De bel van het eerste uur ging. Meneer Bakker zette zijn koffie neer en schreef de opdracht op het bord.', 'bord', ['koffie', 'Bakker'], 'het eerste uur', ['koffie', 'Bakker'], 'in een klaslokaal, ’s ochtends', ['in een klaslokaal, ’s avonds', 'in een café, ’s ochtends']],
    ['De zon brandde op het zand. Overal lagen handdoeken en een ijscoman riep zijn prijzen. Het was de warmste dag van juli.', 'zand', ['prijzen', 'warmste'], 'juli', ['zand', 'handdoeken'], 'op het strand, in de zomer', ['op het strand, in de winter', 'in het zwembad, in de zomer']],
    ['Het was midden in de nacht. Lena sloop de trap af naar de keuken, waar de koelkast zachtjes zoemde.', 'keuken', ['nacht', 'zoemde'], 'midden in de nacht', ['keuken', 'koelkast'], 'in een huis, ’s nachts', ['in een huis, ’s middags', 'in een restaurant, ’s nachts']],
    ['In 1944 zat Jan al maanden verstopt op een zolder in Amsterdam. Beneden hoorde hij soldaten praten.', 'zolder in Amsterdam', ['soldaten', 'maanden'], '1944', ['zolder', 'soldaten'], 'in Amsterdam, in de Tweede Wereldoorlog', ['in Amsterdam, in deze tijd', 'in Parijs, in de Tweede Wereldoorlog']],
    ['De bladeren dwarrelden over het schoolplein. Het was nog maar half acht en de eerste fietsers kwamen door het hek.', 'schoolplein', ['bladeren', 'fietsers'], 'half acht', ['schoolplein', 'hek'], 'bij school, op een herfstochtend', ['bij school, op een zomeravond', 'in het bos, op een herfstochtend']],
    ['Het ruimteschip landde met een schok op de rode vlakte van Mars. Het was het jaar 2150 en Zara was de eerste mens hier.', 'Mars', ['schok', 'mens'], '2150', ['vlakte', 'ruimteschip'], 'op Mars, in de toekomst', ['op Mars, in het verleden', 'op aarde, in de toekomst']],
    ['Na het laatste fluitsignaal liepen de spelers het veld af. De lampen van het stadion gingen één voor één uit. Het was al bijna middernacht.', 'stadion', ['spelers', 'fluitsignaal'], 'middernacht', ['veld', 'lampen'], 'in een stadion, laat in de avond', ['in een stadion, ’s ochtends vroeg', 'in een zwembad, laat in de avond']],
    ['De ridder reed op zijn paard over de ophaalbrug het kasteel binnen. De koning wachtte hem op in de grote zaal.', 'kasteel', ['paard', 'koning'], 'ridder', ['zaal', 'wachtte'], 'in een kasteel, in de middeleeuwen', ['in een kasteel, in deze tijd', 'in een stadion, in de middeleeuwen']],
    ['Op de camping in Frankrijk was het nog stil. Alleen de vogels floten. Iedereen sliep nog, want het was pas zes uur ’s ochtends.', 'camping in Frankrijk', ['vogels', 'sliep'], 'zes uur ’s ochtends', ['camping', 'vogels'], 'op een camping, vroeg in de ochtend', ['op een camping, laat in de avond', 'in een hotel, vroeg in de ochtend']],
    ['In de sporthal klonk het gepiep van schoenen op de vloer. Buiten sneeuwde het al de hele dag en verschenen de eerste sneeuwpoppen.', 'sporthal', ['gepiep', 'schoenen'], 'sneeuwpoppen', ['vloer', 'schoenen'], 'in een sporthal, in de winter', ['in een sporthal, in de zomer', 'op een ijsbaan, in de winter']],
    ['Ik zat in het vliegtuig naar Curaçao. Over een uur zouden we landen, precies op de eerste dag van de kerstvakantie.', 'vliegtuig', ['landen', 'precies'], 'kerstvakantie', ['vliegtuig', 'Curaçao'], 'in een vliegtuig, aan het begin van de kerstvakantie', ['in een vliegtuig, aan het eind van de zomervakantie', 'op Curaçao, aan het begin van de kerstvakantie']]
  ];
  function maakTijdPlaats(R, it){
    return OP('Waar en wanneer speelt dit?', tekst(it[0]), [
      K(R, 'Zoek een woord dat zegt waar het verhaal speelt.', it[1], it[2], 'Zoek een plek: een ruimte, een gebouw, een stad of een landschap.'),
      K(R, 'Zoek een woord dat zegt wanneer het speelt.', it[3], it[4], 'Zoek een tijd: een uur, een seizoen, een feest, een jaartal, of iets wat bij een tijd hoort.'),
      K(R, 'Waar en wanneer speelt dit fragment?', it[5], it[6], 'Zet de twee woorden samen: ' + it[1] + ' en ' + it[3] + '.')
    ]);
  }

  /* flashback en vooruitwijzing: [fragment met [zin], soort, tijdwoord, [niet als keuze]] */
  var TIJDSPRONG = {
    flashback:'een flashback: terug in de tijd', vooruit:'een vooruitwijzing: een hint over later', nu:'gewoon het verhaal van nu'
  };
  var SPRONG = [
    ['Lotte stond op het podium en keek de zaal in. [Twee jaar geleden had ze hier ook gestaan, en toen was ze haar tekst vergeten.] Nu ging het anders.', 'flashback', 'geleden', ['toen']],
    ['Daan stopte het oude sleuteltje in zijn zak. [Hij wist toen nog niet dat het hem later nog zou redden.]', 'vooruit', 'later', ['toen']],
    ['Sara opende het fotoalbum. [Vroeger, toen haar vader nog thuis woonde, gingen ze elke zomer kamperen.] Ze slikte.', 'flashback', 'Vroeger', ['toen', 'zomer']],
    ['Ze liepen vrolijk het bos in. [Het zou de laatste keer zijn dat ze met z’n drieën waren.]', 'vooruit', 'laatste', []],
    ['Mila pakte haar tas en rende naar de bus. [Ze ging meteen op de achterste bank zitten.] De bus reed weg.', 'nu', 'meteen', []],
    ['Ravi keek naar het litteken op zijn knie. [Hij was acht jaar toen hij met zijn fiets in de sloot reed.] Hij moest er nu om lachen.', 'flashback', 'toen', ['jaar']],
    ['Joep zwaaide naar zijn opa. [Hij had geen idee dat hij hem nooit meer zou zien.]', 'vooruit', 'nooit', ['meer']],
    ['In de pauze zat Noor alleen op een bankje. [Een jaar eerder namen haar vriendinnen haar nog overal mee naartoe.] Waar waren ze nu?', 'flashback', 'eerder', ['jaar']],
    ['Tim schopte de bal hard weg. [Die schop zou hem later nog veel problemen bezorgen.]', 'vooruit', 'later', []],
    ['Fenna draaide de sleutel om. [Nu stapte ze de donkere gang in.] Alles was stil.', 'nu', 'Nu', []],
    ['Opa vertelde over de winter van 1963. [Toen had het zo hard gevroren dat hij naar school kon schaatsen.] Ik kon het me bijna niet voorstellen.', 'flashback', 'Toen', ['winter']],
    ['Tess kocht het oude dagboek op de rommelmarkt. [Wat erin stond, zou haar hele zomer op zijn kop zetten.]', 'vooruit', 'zou', ['zomer', 'hele']],
    ['Bram stond bij de kassa en telde zijn geld. [Daarna betaalde hij en liep hij de winkel uit.] Buiten regende het.', 'nu', 'Daarna', []],
    ['Lieke keek naar de lege stoel naast haar. [Vorig jaar zat Sanne daar nog, haar beste vriendin.] Sanne was verhuisd naar Groningen.', 'flashback', 'Vorig', ['jaar']]
  ];
  function maakSprong(R, it){
    var zin = (it[0].match(/\[([^\]]+)\]/) || ['', ''])[1], soort = it[1];
    var hint = soort === 'flashback' ? q(it[2]) + ' laat zien dat dit eerder gebeurde dan de rest van het verhaal.' :
      soort === 'vooruit' ? q(it[2]) + ' laat zien dat het over iets gaat wat nog moet komen.' : q(it[2]) + ' hoort bij wat er nu gebeurt, gewoon in de volgorde van het verhaal.';
    return OP('Wat is de gemarkeerde zin?', tekst(it[0]), [
      K(R, 'Zoek in de gemarkeerde zin het woord dat iets zegt over de tijd.', it[2], woordenUit(R, zin, [it[2]].concat(it[3]), 2), 'Zoek een woord als vroeger, toen, geleden, later, zou of nu.'),
      K(R, 'Wat is de gemarkeerde zin?', TIJDSPRONG[soort], Object.keys(TIJDSPRONG).filter(function(x){ return x !== soort; }).map(function(x){ return TIJDSPRONG[x]; }), hint)
    ]);
  }

  /* open of gesloten einde: [slot, open of gesloten, wat je weet, [fout]] */
  var EINDE = [
    ['Na weken zoeken vond Daan zijn hond eindelijk terug, bij de boerderij van de buren. Samen liepen ze naar huis, en die avond sliep de hond weer op zijn bed.', 'gesloten', 'de hond is terug en alles is weer goed', ['je weet niet of de hond terugkomt', 'de hond is nog steeds zoek']],
    ['Sara keek naar de twee brieven op tafel: één van de dansschool in Amsterdam, één van haar oude school. Ze pakte een pen. Welke zou ze tekenen?', 'open', 'je weet niet welke keuze Sara maakt', ['Sara kiest de dansschool', 'Sara gaat terug naar haar oude school']],
    ['De dief werd gepakt en de gestolen fietsen kwamen allemaal terug bij hun eigenaars. Ravi kreeg zelfs een beloning van de politie.', 'gesloten', 'de dief is gepakt en de fietsen zijn terug', ['je weet niet wie de dief is', 'de fietsen zijn nog steeds weg']],
    ['Noor stond voor de deur van haar vader, die ze tien jaar niet had gezien. Ze stak haar hand uit naar de bel.', 'open', 'je weet niet of ze aanbelt en wat er dan gebeurt', ['haar vader doet open en is blij', 'Noor gaat weer naar huis']],
    ['De finale eindigde in 3-2. Het team van Mila werd kampioen, en die avond vierde het hele dorp feest.', 'gesloten', 'het team van Mila werd kampioen', ['je weet niet wie er wint', 'het team verloor de finale']],
    ['Het licht in de kelder ging uit. Tim hoorde voetstappen achter zich. Hij draaide zich langzaam om.', 'open', 'je weet niet wie of wat er achter Tim staat', ['Tim ziet zijn moeder staan', 'er staat niemand']],
    ['Na de ruzie praatten Lisa en Emma het uit. Ze beloofden elkaar nooit meer zo boos uit elkaar te gaan, en ze bleven beste vriendinnen.', 'gesloten', 'de vriendinnen hebben het goedgemaakt', ['je weet niet of ze weer vrienden worden', 'ze praten nooit meer met elkaar']],
    ['Joep zat in de trein, op weg naar een stad die hij niet kende. Hij keek naar buiten en vroeg zich af wat hem daar zou wachten.', 'open', 'je weet niet wat Joep in de nieuwe stad meemaakt', ['Joep vindt er nieuwe vrienden', 'Joep gaat terug naar huis']],
    ['De verdwenen ring bleek al die tijd in de zak van opa’s jas te zitten. Iedereen lachte opgelucht, en oma droeg hem weer trots aan haar vinger.', 'gesloten', 'de ring is gevonden', ['de ring is nog steeds weg', 'je weet niet waar de ring is']],
    ['‘Ik moet je iets vertellen,’ zei Bram. Hij haalde diep adem. Op dat moment ging de bel.', 'open', 'je weet niet wat Bram wilde vertellen', ['Bram vertelt een geheim', 'Bram had niets te vertellen']],
    ['Na een lange zoektocht vond Fenna haar oudere zus terug, die als baby was geadopteerd. Ze omhelsden elkaar en spraken af om elke week te bellen.', 'gesloten', 'Fenna heeft haar zus gevonden en ze houden contact', ['je weet niet of ze haar zus vindt', 'Fenna stopt met zoeken']],
    ['De brief lag nog steeds ongeopend op het bureau. Tess keek ernaar, zette haar tas neer en liep de kamer uit.', 'open', 'je weet niet wat er in de brief staat', ['Tess leest de brief voor', 'de brief is van haar oma']]
  ];
  var EINDNAAM = { open:'een open einde: je weet niet hoe het afloopt', gesloten:'een gesloten einde: alles is opgelost' };
  function maakEinde(R, it){
    var open = it[1] === 'open';
    return OP('Wat voor einde is dit?', tekst(it[0]), [
      K(R, 'Lees het slot. Wat weet je aan het eind?', it[2], it[3], open ? 'Staat er echt in de tekst hoe het afloopt? Of blijft er een vraag over?' : 'Lees de laatste zin: daar staat hoe het afloopt.'),
      K(R, 'Wat voor einde is dit?', EINDNAAM[it[1]], [EINDNAAM[open ? 'gesloten' : 'open']], open ? 'Er blijft een vraag over: ' + it[2] + '.' : 'Alles is opgelost: ' + it[2] + '.')
    ]);
  }

  /* spanning: [fragment, techniek, [technieken die er niet in zitten]] */
  var SPAN = {
    kort:'korte zinnen: het tempo gaat omhoog',
    cliff:'stoppen op het spannendste moment',
    vooruit:'een vooruitwijzing: er komt iets ergs aan',
    sfeer:'een enge sfeer: donker, kou en vreemde geluiden'
  };
  var OPVAL = {
    kort:'de zinnen zijn heel kort, soms maar een of twee woorden',
    cliff:'het fragment stopt net voordat je hoort wat er gebeurt',
    vooruit:'er staat iets in over wat er later gaat gebeuren',
    sfeer:'er staan veel donkere details en enge geluiden in'
  };
  var SPANNING = [
    ['Nog tien seconden. Ravi kreeg de bal. Hij draaide. Hij schoot. Raak! Het hele veld juichte.', 'kort', ['vooruit', 'sfeer']],
    ['De bel ging. Iedereen rende. Tas pakken. Jas aan. Fiets van het slot. Vakantie!', 'kort', ['vooruit', 'sfeer']],
    ['Mila sprintte. Nog vijftig meter. Ze haalde één loopster in. Toen nog één. De finish! Ze was eerste.', 'kort', ['vooruit', 'sfeer']],
    ['Drie. Twee. Eén. De raket trilde. Vuur. Rook. Hij steeg op!', 'kort', ['vooruit', 'sfeer']],
    ['De oude boerderij lag in het donker. De wind gierde om het dak, ergens kraakte een luik, en uit de schuur kwam een vreemd, schrapend geluid.', 'sfeer', ['vooruit', 'kort']],
    ['In de kelder was het koud en vochtig. Het enige licht kwam van een flikkerende lamp, en overal hoorde je het druppen van water.', 'sfeer', ['vooruit', 'kort']],
    ['Het bos was pikdonker. Takken kraakten onder hun voeten, een uil riep en de mist kroop tussen de bomen door.', 'sfeer', ['vooruit', 'kort']],
    ['Het huis stond al jaren leeg. Door de kapotte ramen floot de wind, en op de trap lag een dikke laag stof waarin vreemde voetsporen stonden.', 'sfeer', ['vooruit', 'kort']],
    ['Lotte stapte vrolijk in de bus naar het schoolkamp. Als ze had geweten wat er die nacht zou gebeuren, was ze thuisgebleven.', 'vooruit', ['kort', 'sfeer']],
    ['Het was een zonnige dag en de familie zat gezellig te picknicken aan het meer. Niemand had door dat dit de laatste rustige middag van de zomer zou zijn.', 'vooruit', ['kort', 'sfeer']],
    ['Joep kocht het oude kistje op de markt, omdat het zo mooi glansde in de zon. Hij zou er later nog vaak spijt van krijgen.', 'vooruit', ['kort', 'sfeer']],
    ['Mila zwaaide nog één keer naar haar moeder op de kade. Ze zou haar heel lang niet meer zien.', 'vooruit', ['kort', 'sfeer']],
    ['Daan schoof het zware deksel van de kist en keek erin. Wat hij zag, kon onmogelijk waar zijn.', 'cliff', ['vooruit', 'kort']],
    ['De directeur stond op het podium met de envelop in zijn hand. ‘En de winnaar van de schrijfwedstrijd is …’ Hij scheurde de envelop open.', 'cliff', ['vooruit', 'sfeer']],
    ['Sanne las het berichtje van haar beste vriendin en werd lijkbleek. Er stond maar één zin: ‘Ik weet wat je hebt gedaan.’', 'cliff', ['vooruit', 'sfeer']],
    ['Tim pakte de hand van zijn opa en vroeg: ‘Wie is eigenlijk mijn echte vader?’ Opa keek hem lang aan en opende zijn mond.', 'cliff', ['vooruit', 'sfeer']]
  ];
  var SPANHINT = {
    kort:'Kijk naar de lengte van de zinnen. Soms zijn het maar een of twee woorden.',
    cliff:'Kijk naar het einde. Hoor je wat er gebeurt, of stopt het net daarvoor?',
    vooruit:'Staat er iets over later, met zou of als ze had geweten?',
    sfeer:'Wat hoor, zie en voel je? Is het donker, koud of hoor je vreemde geluiden?'
  };
  function maakSpanning(R, it){
    return OP('Hoe maakt de schrijver het spannend?', tekst(it[0]), [
      K(R, 'Wat valt op in dit fragment?', OPVAL[it[1]], it[2].map(function(x){ return OPVAL[x]; }), SPANHINT[it[1]]),
      K(R, 'Hoe maakt de schrijver het spannend?', SPAN[it[1]], it[2].map(function(x){ return SPAN[x]; }), 'Het fragment valt op doordat ' + OPVAL[it[1]] + '.')
    ]);
  }

  /* ================= FICTIE: beeldspraak en gedichten ================= */

  var STIJL = {
    vergelijking:{ naam:'vergelijking', kenm:'twee dingen worden met elkaar vergeleken, met als of zoals', niet:['metafoor', 'personificatie', 'herhaling'], o:[
      'Hij is zo sterk als een beer.', 'Haar ogen glinsterden als sterren.', 'De gang was zo donker als de nacht.', 'Hij rende als een haas naar huis.',
      'Het water was zo koud als ijs.', 'Zijn handen waren zo ruw als schuurpapier.', 'Ze zong als een nachtegaal.', 'Het kussen was zo zacht als een wolk.',
      'De klas was zo stil als een muis.', 'Hij at als een wolf.', 'Het meer lag er glad als een spiegel bij.', 'Ze is zo trots als een pauw.', 'Hij sliep als een roos.'] },
    metafoor:{ naam:'metafoor', kenm:'iets wordt iets anders genoemd, zonder als', niet:['vergelijking', 'overdrijving', 'herhaling'], o:[
      'Mijn opa is een wandelende encyclopedie.', 'Die keeper is een muur.', 'Zij is het zonnetje in huis.', 'Mijn kamer is een zwijnenstal.',
      'De zee was een glinsterende spiegel.', 'Mijn broertje is een kleine aap: hij klimt overal in.', 'Het leven is een achtbaan.', 'De sterren waren lampjes aan de hemel.',
      'Zijn woorden waren messen.', 'Tim is de motor van het team.', 'De snelweg was een lange, glimmende slang.', 'Mijn zus is een echte nachtuil.', 'De maan was een zilveren munt.'] },
    personificatie:{ naam:'personificatie', kenm:'een ding of dier doet iets wat alleen mensen kunnen', niet:['vergelijking', 'overdrijving', 'herhaling'], o:[
      'De wind huilde om het huis.', 'De zon lachte ons toe.', 'De bladeren dansten in de wind.', 'Mijn wekker schreeuwde me wakker.',
      'De oude deur kreunde toen ik hem openduwde.', 'De regen tikte ongeduldig tegen het raam.', 'De bomen fluisterden in het donker.', 'Mijn maag knorde boos.',
      'De zee was woedend en sloeg tegen de dijk.', 'Mijn telefoon smeekte om opgeladen te worden.', 'De sneeuw trok een witte jas aan over de stad.', 'Het huis keek ons aan met donkere ramen.', 'De tijd kroop voorbij in de saaie les.'] },
    overdrijving:{ naam:'overdrijving', kenm:'iets wordt veel groter of erger gemaakt dan het is', niet:['personificatie', 'herhaling'], o:[
      'Ik heb je al duizend keer gezegd dat je moet opruimen.', 'Mijn tas weegt wel een ton.', 'Ik sterf van de honger.', 'Die rij was kilometers lang.',
      'Ik heb dit liedje een miljoen keer gehoord.', 'Het was zo warm dat je een ei op de stoep kon bakken.', 'Mijn broer slaapt wel honderd uur per dag.', 'Er stonden wel een miljard mensen bij het concert.',
      'Ik heb deze week wel vijftig toetsen.', 'Die les duurde een eeuwigheid.', 'Mijn oma is zo oud, die heeft de dinosaurussen nog gezien.', 'Ik heb het zo koud dat ik mijn tenen al een week niet meer voel.', 'Hij heeft wel tweehonderd paar sneakers.'] },
    herhaling:{ naam:'herhaling', kenm:'een woord of zinsdeel komt steeds terug', niet:['vergelijking', 'metafoor', 'personificatie', 'overdrijving'], o:[
      'Lopen, lopen, lopen, en nog steeds zagen we geen huis.', 'Nooit, nooit, nooit geef ik op.', 'Wachten. Wachten. Altijd maar wachten.', 'Het regende en regende en regende.',
      'Ik wil naar huis, naar huis, naar huis!', 'Stil was het, stil, zo stil.', 'Sneller, sneller, sneller, riep de trainer.', 'Hoger en hoger en hoger klom de vlieger.',
      'Elke dag hetzelfde: opstaan, school, huiswerk. Elke dag hetzelfde.', 'Weg, weg, alles was weg.', 'Dag na dag na dag zat hij bij het raam te wachten.', 'Ze zocht en zocht en zocht, maar de sleutel was nergens.', 'Altijd die regen, altijd die wind, altijd die kou.'] }
  };
  var STIJLKEYS = Object.keys(STIJL);
  var GEWOON = ['Ik fiets elke dag naar school.', 'De bus vertrekt om half acht.', 'Mijn zus heeft een nieuwe jas.', 'We eten vanavond soep.', 'De les begint om negen uur.',
    'Hij heeft een rode fiets.', 'De hond ligt in zijn mand.', 'Ze leest een boek over paarden.', 'Het regent vandaag.', 'Mijn opa woont in Utrecht.', 'We hebben morgen een toets.', 'De winkel is op zondag dicht.'];
  function maakStijlPer(R, k){
    var S = STIJL[k], anderK = R.kies(S.niet);
    var stukken = R.hussel([{ s:k, t:R.kies(S.o) }, { s:anderK, t:R.kies(STIJL[anderK].o) }, { s:'gewoon', t:R.kies(GEWOON) }]);
    var L = ['A', 'B', 'C'], goed = '', f = {};
    stukken.forEach(function(s, i){
      if (s.s === k) goed = 'Zin ' + L[i];
      else f['Zin ' + L[i]] = s.s === 'gewoon' ? 'Dat is een gewone zin, zonder stijlmiddel.' : 'Daar zit een ander stijlmiddel in: een ' + STIJL[s.s].naam + '.';
    });
    return OP('Welke zin bevat een ' + S.naam + '?', tekst(stukken.map(function(s, i){ return '<b>' + L[i] + '</b> ' + s.t; })), [
      K(R, 'Wat is het kenmerk van een ' + S.naam + '?', hoofd(S.kenm) + '.', ander(R, STIJLKEYS, [k], 2).map(function(x){ return hoofd(STIJL[x].kenm) + '.'; }), 'Denk aan het voorbeeld uit de uitleg.'),
      K(R, 'Welke zin heeft dat kenmerk?', goed, L.map(function(l){ return 'Zin ' + l; }), 'Zoek de zin waarin ' + S.kenm + '.', { fout:f })
    ]);
  }
  function maakStijlWelk(R){
    var k = R.kies(STIJLKEYS), S = STIJL[k];
    return OP('Welk stijlmiddel?', tekst(R.kies(S.o)), [
      K(R, 'Wat valt op aan deze zin?', hoofd(S.kenm) + '.', ander(R, STIJLKEYS, [k], 2).map(function(x){ return hoofd(STIJL[x].kenm) + '.'; }), 'Staat er als? Doet een ding iets menselijks? Is het veel te groot? Komt er iets steeds terug?'),
      K(R, 'Welk stijlmiddel is dat?', S.naam, ander(R, STIJLKEYS, [k], 3).map(function(x){ return STIJL[x].naam; }), 'Als ' + S.kenm + ', heet dat een ' + S.naam + '.')
    ]);
  }

  /* gedichtjes met vier regels en hun rijmschema */
  var VERSJES = [
    [['De kat zat op de mat,', 'hij was een beetje nat.', 'Toen kwam de zon tevoorschijn,', 'dat vond de kat heel fijn.'], 'aabb'],
    [['Ik fiets door weer en wind,', 'de regen in mijn haar.', 'Ik ben echt geen klein kind,', 'ik kom op tijd, echt waar.'], 'abab'],
    [['Op school is het weer druk,', 'mijn pen is ook nog stuk.', 'De juf zegt: ‘Kijk eens hier,’', 'en geeft me een vel papier.'], 'aabb'],
    [['De zon gaat langzaam onder,', 'de vogels zijn nu stil.', 'Ik kijk naar dit wonder', 'en weet niet wat ik wil.'], 'abab'],
    [['Mijn hond rent heel snel,', 'hij rent door het gras,', 'hij springt in een plas,', 'dat vindt hij een spel.'], 'abba'],
    [['In de winter valt de sneeuw,', 'ik hoor gejuich, geschreeuw', 'van kinderen op een slee,', 'en ik doe natuurlijk mee.'], 'aabb'],
    [['Mijn telefoon is leeg,', 'ik zit hier zonder licht.', 'Het bericht dat ik kreeg,', 'blijft dus nog even dicht.'], 'abab'],
    [['Wie zit daar in de boom?', 'Een eekhoorn, grijs en klein.', 'Hij eet in de zonneschijn,', 'het lijkt wel een droom.'], 'abba'],
    [['Ik heb een nieuwe bal,', 'die neem ik mee naar de stal.', 'Daar speel ik met mijn paard,', 'dat is het echt wel waard.'], 'aabb'],
    [['De bus is weer te laat,', 'het regent op mijn jas.', 'Ik sta hier op de straat', 'en stap in elke plas.'], 'abab'],
    [['Ik lees een boek in bed,', 'het is al heel erg laat.', 'Ik hoor iets op de straat.', 'Mijn lamp gaat uit: wat pret!'], 'abba'],
    [['De klas gaat op reis,', 'we krijgen allemaal ijs.', 'De bus rijdt heel snel,', 'het voelt als een spel.'], 'aabb'],
    [['Een spin maakt zijn web,', 'heel fijn en heel licht.', 'Ik zie dat ik pech heb:', 'het hangt voor mijn gezicht.'], 'abab'],
    [['Het is weer tijd voor gym,', 'we rennen door de zaal.', 'De bal gaat langs de paal,', 'en ik klim en ik klim.'], 'abba']
  ];
  function laatste(regel){ var w = regel.replace(/[.,:;!?’‘]+/g, ' ').trim().split(/\s+/); return w[w.length - 1].toLowerCase(); }
  function versTekst(v){ return '<div class="lr-tekst"><p>' + v[0].map(function(r){ return R_schoon(r); }).join('<br>') + '</p></div>'; }
  function R_schoon(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function rijmtMet(v, i){ var s = v[1]; for (var j = 0; j < 4; j++) if (j !== i && s[j] === s[i]) return j; return -1; }
  function maakEindrijm(R, v){
    var i = R.heel(0, 3), j = rijmtMet(v, i), w = v[0].map(laatste);
    var fout = [0, 1, 2, 3].filter(function(x){ return x !== i && x !== j; }).map(function(x){ return w[x]; });
    return OP('Op welk woord rijmt ' + q(w[i]) + '?', versTekst(v), [
      K(R, 'Bij eindrijm vergelijk je ...', 'de laatste woorden van de regels', ['de eerste woorden van de regels', 'de langste woorden van het gedicht'], 'Eindrijm zit aan het eind van de regel.'),
      K(R, 'Op welk woord rijmt ' + q(w[i]) + '?', w[j], fout, 'Zeg de laatste woorden hardop. Welk woord klinkt aan het eind hetzelfde als ' + q(w[i]) + '?')
    ]);
  }
  var JAR = 'ja, ze rijmen', NEER = 'nee, ze rijmen niet';
  function maakRijmschema(R, v){
    var s = v[1], w = v[0].map(laatste);
    return OP('Welk rijmschema?', versTekst(v), [
      K(R, 'Rijmt regel 1 (' + w[0] + ') op regel 2 (' + w[1] + ')?', s[0] === s[1] ? JAR : NEER, [s[0] === s[1] ? NEER : JAR], 'Zeg ' + q(w[0]) + ' en ' + q(w[1]) + ' hardop.'),
      K(R, 'Rijmt regel 1 (' + w[0] + ') op regel 3 (' + w[2] + ')?', s[0] === s[2] ? JAR : NEER, [s[0] === s[2] ? NEER : JAR], 'Zeg ' + q(w[0]) + ' en ' + q(w[2]) + ' hardop.'),
      K(R, 'Welk rijmschema heeft het gedicht?', s, ['aabb', 'abab', 'abba'].filter(function(x){ return x !== s; }), 'Geef de eerste regel een a. Een regel die daarop rijmt, krijgt ook een a. De andere klank wordt b.')
    ]);
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'fic-verhaal', niveau:'1F', domein:'fictie', naam:'Verhalen lezen',
        uit:'Een verhaal heeft een verteller, personages, een tijd en een plaats. Wie daar goed naar kijkt, begrijpt een verhaal beter en kan er ook over praten.' },
      doelen:[
        { id:'fic-verteller', naam:'De verteller', kort:'Zegt de verteller ik? Dan vertelt de hoofdpersoon zelf',
          uit:'<p>Elk verhaal heeft een <b>verteller</b>. Bij een <b>ik-verteller</b> vertelt de hoofdpersoon zelf: <i>Ik zette mijn game op pauze.</i></p><p>Bij een <b>hij- of zij-verteller</b> vertelt iemand anders over de hoofdpersoon: <i>Noor fietste zo hard als ze kon.</i></p><p>Let op: kijk niet naar de stukjes tussen aanhalingstekens. Daar praten de personages zelf.</p>',
          wanneer:'je een verhaal of een fragment leest.',
          maak:function(R){ return maakVerteller(R, R.kies(VERTELLER)); } },
        { id:'fic-perspectief', naam:'Het perspectief', kort:'Van wie lees je de gedachten? Door die ogen kijk je mee',
          uit:'<p>Het <b>perspectief</b> is: door wiens ogen kijk je mee? Dat is het personage van wie je de <b>gedachten en gevoelens</b> leest.</p><p><i>Tim vond het eigenlijk maar saai.</i> Je weet wat Tim vindt, dus je kijkt mee door de ogen van Tim. Van de anderen weet je alleen wat ze doen.</p>',
          wanneer:'je wilt weten met wie je meeleeft in een verhaal.',
          maak:function(R){ return maakPersp(R, R.kies(PERSP)); } },
        { id:'fic-personage', naam:'Personages', kort:'Leid het karakter af uit wat iemand doet of zegt',
          uit:'<p>Een schrijver zegt meestal niet: <i>Sem is behulpzaam.</i> Hij laat het zien: <i>Sem hielp de jongen meteen zijn boeken oprapen.</i></p><p>Je leidt het <b>karakter</b> af uit wat iemand <b>doet</b> en <b>zegt</b>. Vraag je af: wat voor iemand doet zoiets?</p>',
          wanneer:'een vraag zegt: wat voor iemand is dit personage?',
          maak:function(R){ return maakPersonage(R, R.kies(PERSONAGE)); } },
        { id:'fic-tijd-plaats', naam:'Tijd en plaats', kort:'Zoek woorden die zeggen waar en wanneer het verhaal speelt',
          uit:'<p>Elk verhaal speelt op een <b>plaats</b> en in een <b>tijd</b>. Vaak staat het er niet letterlijk, maar zie je het aan details.</p><p>Plaats: <i>keuken, zand, kasteel</i>. Tijd: <i>half acht, juli, kerstboom, 1944, ridder</i>.</p><p>Een ridder hoort bij de middeleeuwen, een kerstboom bij december.</p>',
          wanneer:'je een verhaal begint te lezen.',
          maak:function(R){ return maakTijdPlaats(R, R.kies(TIJDPLAATS)); } }
      ] },
    { groep:{ id:'fic-verhaal-2f', niveau:'2F', domein:'fictie', naam:'Hoe een verhaal is gebouwd',
        uit:'Een schrijver kan spelen met de tijd, met het einde en met spanning. Zo houdt hij je aan het lezen.' },
      doelen:[
        { id:'fic-flashback', naam:'Flashback en vooruitwijzing', kort:'Terug in de tijd, of een hint over wat er later gebeurt',
          uit:'<p>Een <b>flashback</b> gaat terug in de tijd: <i>Twee jaar geleden had ze hier ook gestaan.</i> Let op woorden als <i>vroeger, toen, geleden</i>.</p><p>Een <b>vooruitwijzing</b> geeft een hint over later: <i>Hij wist nog niet dat het sleuteltje hem later zou redden.</i> Let op <i>later, zou, nooit meer</i>.</p>',
          wanneer:'de tijd in een verhaal opeens verspringt.',
          maak:function(R){ return maakSprong(R, R.kies(SPRONG)); } },
        { id:'fic-einde', naam:'Open of gesloten einde', kort:'Weet je hoe het afloopt? Dan is het gesloten. Blijft er een vraag? Dan is het open',
          uit:'<p>Bij een <b>gesloten einde</b> is alles opgelost: je weet hoe het afloopt.</p><p>Bij een <b>open einde</b> blijft er een vraag over. Je moet zelf bedenken hoe het verder gaat: <i>Ze stak haar hand uit naar de bel.</i> Belt ze aan?</p>',
          wanneer:'je aan het eind van een verhaal of film bent.',
          maak:function(R){ return maakEinde(R, R.kies(EINDE)); } },
        { id:'fic-spanning', naam:'Spanning', kort:'Korte zinnen, stoppen op het spannendste moment, een vooruitwijzing of een enge sfeer',
          uit:'<p>Een schrijver maakt het <b>spannend</b> op verschillende manieren.</p><p><b>Korte zinnen</b>: het tempo gaat omhoog. <b>Stoppen op het spannendste moment</b>: je hoort net niet hoe het afloopt. Een <b>vooruitwijzing</b>: je weet dat er iets ergs komt. Een <b>enge sfeer</b>: donker, kou en vreemde geluiden.</p>',
          wanneer:'je wilt uitleggen waarom een fragment spannend is.',
          maak:function(R){ return maakSpanning(R, R.kies(SPANNING)); } }
      ] },
    { groep:{ id:'fic-beeld', niveau:'2F', domein:'fictie', naam:'Beeldspraak en gedichten',
        uit:'Schrijvers en dichters maken hun taal sterker met stijlmiddelen: vergelijkingen, metaforen, personificaties, overdrijvingen, herhalingen en rijm.' },
      doelen:[
        { id:'fic-vergelijking', naam:'Vergelijking', kort:'Twee dingen vergeleken met als of zoals',
          uit:'<p>Bij een <b>vergelijking</b> zeg je dat iets op iets anders lijkt. Je gebruikt <b>als</b>, <b>zo … als</b> of <b>zoals</b>.</p><p><i>Hij is zo sterk als een beer.</i> Hij is geen beer, maar hij is net zo sterk.</p>',
          wanneer:'je een beschrijving levendiger wilt maken of herkennen.',
          maak:function(R){ return maakStijlPer(R, 'vergelijking'); } },
        { id:'fic-metafoor', naam:'Metafoor', kort:'Iets wordt iets anders genoemd, zonder als',
          uit:'<p>Bij een <b>metafoor</b> noem je iets meteen iets anders, <b>zonder als</b>.</p><p><i>Die keeper is een muur.</i> Hij is natuurlijk geen muur, maar er komt niets langs hem.</p><p>Vergelijk: <i>Die keeper is zo sterk als een muur</i> is een vergelijking.</p>',
          wanneer:'een zin letterlijk niet kan kloppen.',
          maak:function(R){ return maakStijlPer(R, 'metafoor'); } },
        { id:'fic-personificatie', naam:'Personificatie', kort:'Een ding of dier doet iets wat alleen mensen kunnen',
          uit:'<p>Bij een <b>personificatie</b> doet een ding, een dier of de natuur iets wat alleen <b>mensen</b> kunnen: lachen, huilen, fluisteren, boos zijn.</p><p><i>De wind huilde om het huis.</i> Wind kan niet huilen, maar zo hoor je hoe hij klinkt.</p>',
          wanneer:'een ding in een tekst tot leven lijkt te komen.',
          maak:function(R){ return maakStijlPer(R, 'personificatie'); } },
        { id:'fic-overdrijving', naam:'Overdrijving', kort:'Iets wordt veel groter of erger gemaakt dan het is',
          uit:'<p>Bij een <b>overdrijving</b> maak je iets veel groter, langer of erger dan het echt is.</p><p><i>Mijn tas weegt wel een ton.</i> Zo zwaar is hij niet, maar je snapt dat hij heel zwaar voelt.</p>',
          wanneer:'iemand iets extra sterk wil laten voelen.',
          maak:function(R){ return maakStijlPer(R, 'overdrijving'); } },
        { id:'fic-herhaling', naam:'Herhaling', kort:'Een woord of zinsdeel komt steeds terug, voor de nadruk',
          uit:'<p>Bij <b>herhaling</b> komt een woord of zinsdeel <b>steeds terug</b>. Dat geeft nadruk, of laat voelen hoe lang iets duurt.</p><p><i>Wachten. Wachten. Altijd maar wachten.</i></p>',
          wanneer:'je in een tekst of gedicht hetzelfde woord vaak ziet.',
          maak:function(R){ return maakStijlPer(R, 'herhaling'); } },
        { id:'fic-stijl-welk', naam:'Welk stijlmiddel?', kort:'Kijk wat er opvalt en noem het stijlmiddel',
          uit:'<p>Nu door elkaar. Vraag je af wat er opvalt.</p><p>Staat er <b>als</b>? Een vergelijking. Wordt iets iets anders <b>genoemd</b>? Een metafoor. Doet een ding iets <b>menselijks</b>? Een personificatie. Is het <b>veel te groot</b>? Een overdrijving. Komt iets <b>steeds terug</b>? Een herhaling.</p>',
          wanneer:'een vraag zegt: welk stijlmiddel gebruikt de schrijver?',
          maak:function(R){ return maakStijlWelk(R); } },
        { id:'fic-eindrijm', naam:'Eindrijm', kort:'De laatste woorden van de regels klinken aan het eind hetzelfde',
          uit:'<p>Bij <b>eindrijm</b> rijmen de <b>laatste woorden</b> van de regels: ze klinken aan het eind hetzelfde.</p><p><i>De kat zat op de <b>mat</b>, / hij was een beetje <b>nat</b>.</i></p><p>Let op de klank, niet op de spelling: <i>reis</i> en <i>ijs</i> rijmen ook.</p>',
          wanneer:'je een gedicht of een liedtekst leest.',
          maak:function(R){ return maakEindrijm(R, R.kies(VERSJES)); } },
        { id:'fic-rijmschema', naam:'Rijmschema', kort:'Geef rijmende regels dezelfde letter: aabb, abab of abba',
          uit:'<p>Met een <b>rijmschema</b> laat je zien welke regels op elkaar rijmen. De eerste klank krijgt een <b>a</b>, de tweede een <b>b</b>.</p><p><b>aabb</b>: gepaard rijm (1 en 2, 3 en 4). <b>abab</b>: gekruist rijm (1 en 3, 2 en 4). <b>abba</b>: omarmend rijm (1 en 4, 2 en 3).</p>',
          wanneer:'een vraag zegt: welk rijmschema heeft dit gedicht?',
          maak:function(R){ return maakRijmschema(R, R.kies(VERSJES)); } }
      ] }
  ]);
})();
