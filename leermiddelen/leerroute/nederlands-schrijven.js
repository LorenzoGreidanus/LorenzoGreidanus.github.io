/* De leerroute Nederlands: leestekens, schrijven en spreken en luisteren.
   Leestekens aan het eind, de komma (elke regel een doel), directe rede, andere leestekens;
   goede zinnen, de alinea, de e-mail, register en doel, het betoog; gesprekken en presentaties.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  /* een keuzestap met gehusselde opties */
  function K(R, tekst, goed, fout, hint, x){
    var lijst = [goed];
    fout.forEach(function(f){ if (f != null && lijst.indexOf(f) < 0) lijst.push(f); });
    var o = R.hussel(lijst), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint };
    if (x) for (var k in x) s[k] = x[k];
    return s;
  }
  /* een keuzestap met vaste volgorde (ja/nee, de/het) */
  function V(tekst, opties, goed, hint, x){
    var s = { tekst:tekst, opties:opties.slice(), goed:typeof goed === 'number' ? goed : opties.indexOf(goed), hint:hint };
    if (x) for (var k in x) s[k] = x[k];
    return s;
  }
  /* is de laatste stap een keuze, dan is dat ook de eindvraag bij Zelf */
  function af(op){ var l = op.stappen[op.stappen.length - 1]; if (l.opties){ op.opties = l.opties; op.goed = l.goed; } return op; }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function klein(s){ return s.charAt(0).toLowerCase() + s.slice(1); }
  function zonder(s){ return s.replace(/[.!?]$/, ''); }
  function trek(R, lijst, n, niet){ niet = [].concat(niet || []); return R.hussel(lijst.filter(function(x){ return niet.indexOf(x) < 0; })).slice(0, n); }
  function ander(R, lijst, x){ var y; do { y = R.kies(lijst); } while (y === x); return y; }
  function waarden(o, niet){ return Object.keys(o).filter(function(k){ return k !== niet; }).map(function(k){ return o[k]; }); }
  function blok(R, delen){ return '<div class="lr-tekst" style="font-size:1rem;font-weight:400;letter-spacing:0;margin:0 auto">' + delen.map(function(p){ return '<p>' + p + '</p>'; }).join('') + '</div>'; }
  function S(R, t){ return R.schoon(t); }
  var GAT = '___';
  var TK = { '.':'. (punt)', '?':'? (vraagteken)', '!':'! (uitroepteken)', ',':', (komma)', ':':': (dubbele punt)', ';':'; (puntkomma)' };

  /* ================= leestekens aan het eind ================= */
  var MED = [ ['Mijn broer speelt elke zaterdag voetbal', 0], ['De bus naar school was vanochtend te laat', 0], ['We hebben morgen een toets over de Romeinen', 0],
    ['Mijn oma woont in een klein huis aan zee', 0], ['De winkel op de hoek is op zondag dicht', 0], ['Sara heeft een nieuwe fiets gekregen', 0],
    ['In de herfst vallen de bladeren van de bomen', 0], ['Het concert begint om acht uur', 0], ['Onze kat slaapt de hele dag op de bank', 0],
    ['De leraar legt de som nog een keer uit', 0],
    ['Ik vraag me af hoe laat de film begint', 1], ['Ze vroeg waar het station was', 1], ['Mijn moeder wil weten of je blijft eten', 1],
    ['Hij vroeg waarom we zo laat waren', 1], ['Ik weet niet wie de taart heeft opgegeten', 1], ['De juf vroeg of iedereen zijn boek bij zich had', 1],
    ['Niemand weet hoeveel snoepjes er in de pot zitten', 1], ['Tim vroeg wanneer de vakantie begint', 1] ];
  var VRG = [ ['Hoe laat begint de film', 'vw'], ['Waar is het station', 'vw'], ['Blijf je vanavond eten', 'pv'], ['Waarom waren jullie zo laat', 'vw'],
    ['Heb je je boek bij je', 'pv'], ['Hoeveel snoepjes zitten er in de pot', 'vw'], ['Wanneer begint de vakantie', 'vw'], ['Ga je mee naar het zwembad', 'pv'],
    ['Welke kleur vind jij het mooist', 'vw'], ['Kun jij me even helpen', 'pv'], ['Wat eten we vanavond', 'vw'], ['Heeft iemand mijn sleutels gezien', 'pv'],
    ['Hoe heet jouw nieuwe hond', 'vw'], ['Mag ik naast je zitten', 'pv'], ['Waarom is de lucht blauw', 'vw'], ['Speel jij ook een instrument', 'pv'] ];
  var UIT = [ ['Wat een mooie dag', 0], ['Au, dat doet pijn', 0], ['Hoera, we hebben gewonnen', 0], ['Wat ben jij groot geworden', 1],
    ['Wat een prachtig schilderij', 0], ['Wat is het hier koud', 1], ['Wat een lekkere taart', 0], ['Help, mijn fiets is gestolen', 0],
    ['Gefeliciteerd met je verjaardag', 0], ['Jammer, de wedstrijd is afgelast', 0], ['Wat zingt zij mooi', 1], ['Wat een herrie', 0],
    ['Oei, ik ben mijn tas vergeten', 0], ['Wat heb jij een mooie jas', 1], ['Wat een geluk', 0], ['Bah, wat een vieze soep', 0] ];
  var BEV = ['Doe de deur dicht', 'Pak je boek maar', 'Ruim je kamer op', 'Kom even hier', 'Zet je telefoon uit', 'Lees de tekst goed',
    'Was je handen voor het eten', 'Wacht op het groene licht', 'Geef mij die pen eens', 'Schrijf je naam op het blad', 'Loop niet zo hard',
    'Neem een jas mee', 'Hang je jas aan de kapstok', 'Wees stil in de bibliotheek', 'Ga naar de kantine'];
  var DOET = { med:'iets vertellen', vraag:'iets vragen', uitroep:'een gevoel uitroepen' };
  var EIND = { med:'.', vraag:'?', uitroep:'!', bevel:'.' };
  var SOORTNAAM = { med:'mededeling', vraag:'vraag', uitroep:'uitroep', bevel:'bevel' };
  var KLEUR = { med:1, vraag:2, uitroep:3, bevel:4 };
  function hintDoet(s, x){
    if (s === 'med') return x[1] ? 'Er staat een vraagwoord in, maar de zin vraagt jou niets. Hij vertelt wat iemand vroeg of wil weten.' : 'Moet je hier antwoord op geven? Nee: de zin vertelt je gewoon iets.';
    if (s === 'vraag') return 'Je kunt hier antwoord op geven. De zin wil iets van je weten.';
    return x[1] ? 'Het lijkt een vraag, maar je hoeft geen antwoord te geven. De spreker is verbaasd of blij.' : 'De spreker juicht, schrikt, klaagt of is verbaasd. Een antwoord hoeft niet.';
  }
  function eindBeeld(R, zin, s){ return R.teken.zin([{ t:zin, k:KLEUR[s], label:SOORTNAAM[s] }, { t:EIND[s], k:5, label:TK[EIND[s]].replace(/^. \(|\)$/g, '') }]); }
  function eindOpgave(R, s, x, extra){
    var zin = x[0], e = EIND[s];
    var st = [K(R, 'Wat doet deze zin?', DOET[s], waarden(DOET, s), hintDoet(s, x), s === 'med' && x[1] ? { fout:{ 'iets vragen':'Er staat wel een vraagwoord in, maar de zin zelf vraagt niets.' } } : s === 'uitroep' && x[1] ? { fout:{ 'iets vragen':'Kun je er antwoord op geven? Nee, de spreker roept iets uit.' } } : null)];
    if (extra) st = extra.concat(st);
    st.push(K(R, 'Welk leesteken komt aan het eind?', TK[e], [TK['.'], TK['?'], TK['!']], 'Iets vertellen: een punt. Iets vragen: een vraagteken. Een gevoel uitroepen: een uitroepteken.',
      s === 'med' && x[1] ? { fout:{ '? (vraagteken)':'De zin vertelt wat iemand vroeg. Zelf is hij geen vraag, dus geen vraagteken.' } } : null));
    return af({ vraag:zin + ' ' + GAT, context:'Welk leesteken hoort aan het eind van deze zin?',
      beeld:function(n){ return n >= st.length ? eindBeeld(R, zin, s) : ''; }, stappen:st });
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'teken-eind', niveau:'basis', domein:'leestekens', naam:'Leestekens aan het eind', uit:'Elke zin eindigt met een leesteken. Welk teken het is, hangt af van wat de zin doet: iets vertellen, iets vragen, iets uitroepen of iemand iets laten doen.' },
      doelen:[
        { id:'teken-eind-soort', naam:'Vier soorten zinnen', kort:'Een zin vertelt iets, vraagt iets, roept iets uit of zegt dat je iets moet doen',
          uit:'<p>Er zijn vier soorten zinnen. Een <b>mededeling</b> vertelt iets. Een <b>vraag</b> wil een antwoord. Een <b>uitroep</b> laat een gevoel horen. Een <b>bevel</b> zegt dat iemand iets moet doen.</p><p>Vraag jezelf af: wat wil de spreker? Dan weet je welke soort zin het is.</p><p>Een bevel krijgt meestal een punt. Zeg je het met veel nadruk, dan mag er een uitroepteken staan.</p>',
          wanneer:'je twijfelt welk leesteken er aan het eind van een zin hoort.',
          maak:function(R){
            var s = R.kies(['med', 'vraag', 'uitroep', 'bevel']), x = s === 'med' ? R.kies(MED) : s === 'vraag' ? R.kies(VRG) : s === 'uitroep' ? R.kies(UIT) : [R.kies(BEV), 0];
            var WIL = { med:'iets vertellen', vraag:'een antwoord krijgen', bevel:'dat iemand iets doet', uitroep:'laten horen wat hij voelt' };
            var NAAM = { med:'een mededeling', vraag:'een vraag', bevel:'een bevel', uitroep:'een uitroep' };
            var h = s === 'bevel' ? 'De zin begint met een werkwoord en zegt wat jij moet doen.' : hintDoet(s, x);
            var zin = x[0];
            return af({ vraag:zin, context:'Wat voor zin is dit?',
              beeld:function(n){ return n >= 2 ? eindBeeld(R, zin, s) : ''; },
              stappen:[ K(R, 'Wat wil de spreker met deze zin?', WIL[s], waarden(WIL, s), h),
                K(R, 'Wat voor zin is het dus?', NAAM[s], waarden(NAAM, s), 'Iets vertellen is een mededeling. Een antwoord willen is een vraag. Iemand iets laten doen is een bevel. Een gevoel laten horen is een uitroep.') ] });
          } },
        { id:'teken-eind-punt', naam:'De punt', kort:'Een zin die iets vertelt, krijgt een punt, ook als er een vraagwoord in staat',
          uit:'<p>Een zin die iets <b>vertelt</b>, eindigt met een <b>punt</b>: <i>Het concert begint om acht uur.</i></p><p>Pas op met zinnen als <i>Ze vroeg waar het station was.</i> Er staat een vraagwoord in, maar de zin vraagt jou niets. Hij vertelt wat iemand vroeg. Dus: een punt.</p>',
          wanneer:'een zin iets vertelt, ook over een vraag van iemand anders.',
          maak:function(R){ return Math.random() < 0.7 ? eindOpgave(R, 'med', R.kies(MED)) : eindOpgave(R, 'vraag', R.kies(VRG)); } },
        { id:'teken-eind-vraag', naam:'Het vraagteken', kort:'Een zin die zelf iets vraagt, krijgt een vraagteken',
          uit:'<p>Een <b>vraag</b> eindigt met een <b>vraagteken</b>. Een vraag begint meestal met een <b>vraagwoord</b> (<i>Waar is het station?</i>) of met de <b>persoonsvorm</b> (<i>Ga je mee?</i>).</p><p>Begint de zin met het onderwerp, zoals <i>Ik vraag me af waar het station is</i>, dan vertelt de zin alleen iets. Daar komt een punt.</p>',
          wanneer:'je wilt weten of een zin echt een vraag is.',
          maak:function(R){
            var s = Math.random() < 0.6 ? 'vraag' : 'med', x = s === 'vraag' ? R.kies(VRG) : R.kies(MED.filter(function(m){ return m[1]; }));
            var begin = s === 'med' ? 'met het onderwerp' : x[1] === 'vw' ? 'met een vraagwoord' : 'met de persoonsvorm';
            var w1 = x[0].split(' ')[0];
            return eindOpgave(R, s, x, [
              K(R, 'Hoe begint de zin?', begin, ['met een vraagwoord', 'met de persoonsvorm', 'met het onderwerp'], 'Kijk naar het eerste woord: "' + w1 + '". Is het een vraagwoord (wie, wat, waar, hoe), een werkwoord, of wie of wat iets doet?') ]);
          } },
        { id:'teken-eind-uitroep', naam:'Het uitroepteken', kort:'Een zin die een gevoel uitroept, krijgt een uitroepteken',
          uit:'<p>Een <b>uitroep</b> laat een gevoel horen: blijdschap, schrik, pijn of verbazing. Hij eindigt met een <b>uitroepteken</b>: <i>Wat een mooie dag!</i></p><p>Let op: <i>Wat ben jij groot geworden!</i> lijkt een vraag, maar je hoeft er geen antwoord op te geven. De spreker is verbaasd. Het is een uitroep.</p>',
          wanneer:'iemand iets uitroept, vooral bij zinnen die met "Wat" beginnen.',
          maak:function(R){ var r = Math.random(); return r < 0.6 ? eindOpgave(R, 'uitroep', R.kies(UIT)) : r < 0.8 ? eindOpgave(R, 'vraag', R.kies(VRG)) : eindOpgave(R, 'med', R.kies(MED)); } }
      ] }
  ]);

  /* ================= de komma ================= */
  var OPS = [ ['In mijn tas zitten', ['een pen', 'een schrift', 'mijn agenda', 'een appel', 'een liniaal', 'mijn sleutels'], 'en', '', '.'],
    ['Op de markt kocht mama', ['appels', 'peren', 'kaas', 'vis', 'bloemen', 'eieren'], 'en', '', '.'],
    ['Voor de taart heb je', ['bloem', 'suiker', 'boter', 'eieren', 'melk'], 'en', ' nodig', '.'],
    ['In de dierentuin zagen we', ['leeuwen', 'giraffen', 'apen', 'olifanten', 'pinguïns', "zebra's"], 'en', '', '.'],
    ['Mijn lievelingsvakken zijn', ['gym', 'tekenen', 'biologie', 'muziek', 'geschiedenis'], 'en', '', '.'],
    ['Je mag kiezen uit', ['thee', 'koffie', 'limonade', 'water', 'chocolademelk'], 'of', '', '.'],
    ['Op de camping kun je', ['zwemmen', 'fietsen', 'vissen', 'wandelen', 'tennissen'], 'en', '', '.'],
    ['Neem voor de excursie', ['een lunchpakket', 'een regenjas', 'je pas', 'een flesje water', 'goede schoenen'], 'en', ' mee', '.'],
    ['Wil je', ['een broodje kaas', 'een tosti', 'een kom soep', 'een salade'], 'of', '', '?'],
    ['Op het schoolplein spelen', ['Sara', 'Mo', 'Daan', 'Lisa', 'Noor', 'Jesse'], 'en', '', '.'],
    ['In onze straat wonen', ['een bakker', 'een dokter', 'een kunstenaar', 'een politieagent', 'een leraar'], 'en', '', '.'] ];
  var AANSP = [ ['v', '', 'kom je ook naar het feest?'], ['v', '', 'wil je het raam dichtdoen?'], ['v', '', 'je bent aan de beurt.'], ['v', '', 'heb jij mijn pen gezien?'],
    ['v', '', 'ruim je spullen op.'], ['v', '', 'wat een mooie tekening!'],
    ['a', 'Kom je ook', '?'], ['a', 'Goed gedaan', '!'], ['a', 'Wat vind jij ervan', '?'], ['a', 'Doe je jas maar aan', '.'], ['a', 'Dank je wel', '.'], ['a', 'Heb je je huiswerk af', '?'],
    ['m', 'Weet je', 'dat ik morgen jarig ben?'], ['m', 'Luister', 'dit is belangrijk.'], ['m', 'Kom', 'we gaan.'], ['m', 'Pas op', 'de vloer is nat.'], ['m', 'Morgen', 'gaan we naar de dierentuin.'], ['m', 'Ik denk', 'dat je gelijk hebt.'] ];
  var NAMEN = ['Sara', 'Mo', 'Daan', 'Lisa', 'Noor', 'Jesse', 'Fatima', 'Bram', 'Yara', 'Kevin', 'mam', 'pap', 'opa'];
  var MAARWANT = [ ['Ik wilde naar buiten', 'maar', 'het regende'], ['Hij is klein', 'maar', 'hij is heel sterk'], ['Het boek is dik', 'maar', 'het leest snel'],
    ['We hebben hard gerend', 'maar', 'we hebben de bus toch gemist'], ['Ze heeft geen honger', 'maar', 'ze eet toch een koekje'], ['De soep is lekker', 'maar', 'hij is te heet'],
    ['Ik ken hem niet goed', 'maar', 'hij lijkt me aardig'], ['Mijn telefoon is oud', 'maar', 'hij doet het nog prima'], ['Het was een moeilijke toets', 'maar', 'ik heb een acht gehaald'],
    ['Tom wil een hond', 'maar', 'zijn ouders willen een kat'],
    ['Ik neem een paraplu mee', 'want', 'het gaat regenen'], ['We blijven binnen', 'want', 'het is te koud'], ['Sanne lacht', 'want', 'ze heeft een grap gehoord'],
    ['Ik ga vroeg naar bed', 'want', 'morgen heb ik een toets'], ['Hij draagt een jas', 'want', 'het waait hard'], ['De winkel is dicht', 'want', 'het is zondag'],
    ['Ik eet een appel', 'want', 'ik heb honger'], ['Ze fietst snel', 'want', 'ze is laat'], ['We gaan naar binnen', 'want', 'de les begint'], ['Mijn broer is blij', 'want', 'hij heeft een nieuwe fiets'] ];
  var PVZIN = [ 'Toen de bel *ging| *renden we naar buiten', 'Als je hulp nodig *hebt| *kun je mij bellen', 'Wie te laat *komt| *moet zich melden bij de conciërge',
    'Nadat we gegeten *hadden| *gingen we naar het strand', 'Omdat het zo hard *regende| *bleven we binnen', 'Zodra de film *begint| *gaat je telefoon uit',
    'Wat je vandaag *kunt doen| *moet je niet uitstellen tot morgen', 'Hoewel hij moe *was| *liep hij de hele route uit', 'Voordat je *gaat zwemmen| *moet je douchen',
    'Terwijl mama *kookte| *dekte ik de tafel', 'Wie de quiz *wint| *krijgt een prijs', 'Toen ik thuis *was| *ging ik meteen slapen',
    'Als het morgen *sneeuwt| *maken we een sneeuwpop', 'Omdat de trein vertraging *had| *kwam ik te laat op school', 'Wat hij *zei| *klopte niet',
    'Nu de zon *schijnt| *gaan we buiten spelen', 'Als je goed *oefent| *word je vanzelf beter', 'Wie *wil meedoen| *kan zich opgeven bij de mentor',
    'Na de lange les in de gymzaal| *gingen we naar huis', 'Op de tweede verdieping van ons huis| *slaapt mijn broer', 'Elke zaterdagochtend om negen uur| *train ik bij de voetbalclub',
    'Tijdens de pauze op het schoolplein| *speelden we tikkertje', 'Mijn oudste zus met het rode haar| *werkt bij de bakker', 'Na het avondeten| *maak ik mijn huiswerk',
    'Door de harde wind| *viel de boom om', 'Volgende week dinsdag| *hebben we een toets', 'In de grote vakantie| *gaan we naar Frankrijk', 'De nieuwe leraar van biologie| *heet meneer Bakker' ];
  var BIJZIN = [ ['Als het regent', 'blijf ik thuis'], ['Toen de film afgelopen was', 'gingen we naar huis'], ['Omdat ik ziek was', 'kon ik niet naar school'],
    ['Terwijl ik mijn huiswerk maakte', 'luisterde ik muziek'], ['Hoewel het koud was', 'gingen we zwemmen'], ['Nadat de bel was gegaan', 'liep iedereen naar buiten'],
    ['Zodra je klaar bent', 'mag je naar huis'], ['Voordat je de straat oversteekt', 'kijk je goed uit'], ['Als je wilt', 'mag je mijn fiets lenen'],
    ['Doordat de bus te laat was', 'miste ik de trein'], ['Omdat het zo warm was', 'aten we een ijsje'], ['Toen ik klein was', 'woonden we in Utrecht'],
    ['Zolang het licht is', 'mogen we buiten spelen'], ['Als je de tekst hebt gelezen', 'beantwoord je de vragen'], ['Hoewel hij hard had geleerd', 'haalde hij een vijf'],
    ['Nadat ze haar huiswerk had gemaakt', 'ging ze gamen'], ['Sinds hij een hond heeft', 'wandelt hij elke dag'], ['Terwijl wij aan het eten waren', 'ging de telefoon'],
    ['Wanneer het onweert', 'moet je niet onder een boom gaan staan'], ['Zodra de zon schijnt', 'zitten we op het terras'] ];
  var BIJST_M = [ ['Amsterdam', 'de hoofdstad van Nederland', 'is een drukke stad'], ['Mijn buurman', 'een echte vogelkenner', 'heeft een verrekijker gekocht'],
    ['De Nijl', 'de langste rivier van Afrika', 'stroomt door Egypte'], ['Meneer Bakker', 'onze leraar biologie', 'neemt een slang mee naar de les'],
    ['Max', 'mijn beste vriend', 'woont naast de school'], ['Het Rijksmuseum', 'het bekendste museum van Nederland', 'trekt veel toeristen'],
    ['Sara', 'de jongste van de klas', 'won de schaakwedstrijd'], ['Mevrouw Peters', 'de directeur van onze school', 'hield een toespraak'],
    ['Rembrandt', 'een beroemde schilder', 'woonde in Amsterdam'], ['Mijn tante', 'een echte kok', 'bakt de lekkerste taarten'], ['Fikkie', 'onze oude hond', 'slaapt de hele dag'] ];
  var BIJST_E = [ ['Ik sprak met meneer Jansen', 'meneer Jansen', 'onze nieuwe mentor'], ['We bezochten Utrecht', 'Utrecht', 'de stad van de Dom'], ['Dit is Noor', 'Noor', 'mijn zus'],
    ['Hij las een boek van Roald Dahl', 'Roald Dahl', 'een bekende schrijver'], ['Ze speelt piano bij juf Anna', 'juf Anna', 'een goede pianolerares'],
    ['Op vakantie zagen we de Mont Blanc', 'de Mont Blanc', 'de hoogste berg van de Alpen'], ['Ik heb een cadeau gekocht voor Lisa', 'Lisa', 'mijn beste vriendin'],
    ['We gingen zwemmen in de Noordzee', 'de Noordzee', 'de zee bij ons in de buurt'] ];
  var GEENK = [ ['De jongen met de rode jas', 'rent', 'naar huis'], ['Alle leerlingen van klas 2B', 'gaan', 'morgen op excursie'], ['Mijn oudere broer en zijn vriend', 'spelen', 'samen in een band'],
    ['De oude man op het bankje', 'voert', 'de eenden'], ['Het grote rode huis op de hoek', 'staat', 'al jaren leeg'], ['Een van de leukste dingen van de zomer', 'is', 'zwemmen in het meer'],
    ['De bus van half acht', 'was', 'vanochtend te laat'], ['Iedereen in de klas', 'moet', 'een spreekbeurt houden'], ['De nieuwe telefoon van mijn zus', 'is', 'al kapot'],
    ['Het team met de meeste punten', 'wint', 'een beker'], ['De lange tocht door het bos', 'duurde', 'drie uur'], ['Mijn opa en oma uit Groningen', 'komen', 'zondag op bezoek'],
    ['De leraar van geschiedenis', 'vertelt', 'mooie verhalen'], ['Het boek over de Tweede Wereldoorlog', 'ligt', 'op tafel'], ['De kinderen uit groep acht', 'zingen', 'een lied'],
    ['De winkel naast het station', 'verkoopt', 'tweedehands fietsen'], ['Twee van mijn klasgenoten', 'hebben', 'griep'] ];
  function leesPv(t){
    return t.split(' ').map(function(w){ return { w:w.replace(/[*|]/g, ''), pv:w.charAt(0) === '*', knip:/\|$/.test(w) }; });
  }
  function plak(ws, komma){ return ws.map(function(x, i){ return x.w + (komma[i] ? ',' : ''); }).join(' '); }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'teken-komma', niveau:'1F', domein:'leestekens', naam:'De komma', uit:'De komma laat zien hoe een zin in elkaar zit. Er zijn vaste regels voor, en er zijn plekken waar hij juist niet mag. Leer de regels een voor een.' },
      doelen:[
        { id:'teken-komma-opsomming', naam:'Bij een opsomming', kort:'Tussen de dingen in een rijtje komt een komma, maar niet voor en of of',
          uit:'<p>Noem je een rijtje dingen op, dan is dat een <b>opsomming</b>. Tussen de dingen zet je een <b>komma</b>.</p><p>Voor het laatste ding staat meestal <i>en</i> of <i>of</i>. Daar komt <b>geen komma</b>: <i>In mijn tas zitten een pen, een schrift en een appel.</i></p><p>Tel dus: bij drie dingen één komma, bij vier dingen twee komma\'s.</p>',
          wanneer:'je in een zin een rijtje van drie of meer dingen noemt.',
          maak:function(R){
            var f = R.kies(OPS), n = R.kies([3, 3, 4]), it = R.hussel(f[1]).slice(0, n), vw = f[2];
            var lijst = function(k){ return it.slice(0, n - 1).join(k ? ', ' : ' ') + (k === 2 ? ', ' : ' ') + vw + ' ' + it[n - 1]; };
            var goed = f[0] + ' ' + lijst(1) + f[3] + f[4], geen = f[0] + ' ' + lijst(0) + f[3] + f[4];
            var voorEn = f[0] + ' ' + lijst(2) + f[3] + f[4], naBegin = f[0] + ', ' + lijst(1) + f[3] + f[4];
            var laatste = f[0].split(' ').pop();
            var fout = {}; fout[String(n - 1)] = 'Je telde ook de plek voor "' + vw + '" mee. Daar komt geen komma.';
            return af({ vraag:geen, context:'Zet de komma\'s goed in deze opsomming.',
              beeld:function(k){
                if (k < 1) return '';
                var d = [f[0]];
                it.forEach(function(x, i){ d.push({ t:x, k:(i % 3) + 1, label:'ding ' + (i + 1) }); if (i < n - 2 && k >= 2) d.push({ t:',', k:5, label:'komma' }); if (i === n - 2) d.push(vw); });
                d.push(zonder(f[3] + f[4]) + f[4]);
                return R.teken.zin(d.filter(function(x){ return x !== '' && x !== '.'; }));
              },
              stappen:[
                { tekst:'Hoeveel dingen worden er opgesomd?', antwoord:String(n), hint:'Tel alles wat er na "' + laatste + '" genoemd wordt. Het laatste ding staat na "' + vw + '".' },
                { tekst:'Hoeveel komma\'s komen er in de zin?', antwoord:String(n - 2), hint:'Tussen ' + n + ' dingen zijn ' + (n - 1) + ' plekken. Op één plek staat "' + vw + '", en daar komt geen komma.', fout:fout },
                K(R, 'Welke zin is goed?', goed, [voorEn, naBegin], 'Een komma tussen de dingen, maar niet voor "' + vw + '" en niet voor het eerste ding.') ] });
          } },
        { id:'teken-komma-aanspreking', naam:'Bij een aanspreking', kort:'Spreek je iemand aan, dan zet je die naam tussen komma\'s',
          uit:'<p>Noem je de naam van iemand tegen wie je praat, dan is dat een <b>aanspreking</b>. Die zet je los van de rest met een <b>komma</b>.</p><p>Vooraan: <i>Sara, kom je ook?</i> Achteraan: <i>Kom je ook, Sara?</i> In het midden komen er twee: <i>Luister, Sara, dit is belangrijk.</i></p>',
          wanneer:'je in een zin iemand roept of aanspreekt, ook met mam, pap of juf.',
          maak:function(R){
            var t = R.kies(AANSP), N = R.kies(NAMEN), goed, geen, half, p = t[0];
            if (p === 'v'){ goed = hoofd(N) + ', ' + t[2]; geen = hoofd(N) + ' ' + t[2]; var w = t[2].split(' '); half = hoofd(N) + ' ' + w[0] + ', ' + w.slice(1).join(' '); }
            else if (p === 'a'){ goed = t[1] + ', ' + N + t[2]; geen = t[1] + ' ' + N + t[2]; var w2 = t[1].split(' '); half = w2.length > 1 ? w2[0] + ', ' + w2.slice(1).join(' ') + ' ' + N + t[2] : t[1] + ' ' + N + ',' + t[2]; }
            else { goed = t[1] + ', ' + N + ', ' + t[2]; geen = t[1] + ' ' + N + ' ' + t[2]; half = t[1] + ', ' + N + ' ' + t[2]; }
            var plek = p === 'v' ? 'vooraan' : p === 'a' ? 'achteraan' : 'in het midden';
            return af({ vraag:geen, context:'Zet de komma\'s goed. Iemand wordt aangesproken.',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:goed, k:1, label:'aanspreking ' + plek }]) : ''; },
              stappen:[
                { tekst:'Tegen wie praat de spreker?', antwoord:N, hint:'Zoek de naam of het woord waarmee de spreker iemand roept.' },
                V('Waar staat de aanspreking?', ['vooraan', 'in het midden', 'achteraan'], plek, 'Kijk waar "' + N + '" in de zin staat.'),
                K(R, 'Welke zin is goed?', goed, [geen, half], p === 'm' ? 'Staat de aanspreking in het midden, dan komt er een komma voor én na.' : 'De naam staat los van de rest, met een komma ertussen.') ] });
          } },
        { id:'teken-komma-maar', naam:'Voor maar en want', kort:'Verbind je twee zinnen met maar of want, dan komt er een komma voor',
          uit:'<p>Met <b>maar</b> en <b>want</b> plak je twee zinnen aan elkaar. Voor <i>maar</i> en <i>want</i> zet je een <b>komma</b>.</p><p><i>Ik wilde naar buiten, maar het regende.</i> <i>We blijven binnen, want het is te koud.</i></p><p>De komma komt dus vóór het voegwoord, niet erachter.</p>',
          wanneer:'je twee zinnen verbindt met maar of want.',
          maak:function(R){
            var x = R.kies(MAARWANT), vw = x[1];
            var goed = x[0] + ', ' + vw + ' ' + x[2] + '.', na = x[0] + ' ' + vw + ', ' + x[2] + '.', geen = x[0] + ' ' + vw + ' ' + x[2] + '.';
            return af({ vraag:geen, context:'Zet de komma goed.',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0], k:1, label:'zin 1' }, { t:',', k:5, label:'komma' }, { t:vw, k:2, label:'voegwoord' }, { t:x[2] + '.', k:3, label:'zin 2' }]) : ''; },
              stappen:[
                K(R, 'Welk voegwoord verbindt de twee zinnen?', vw, trek(R, ['maar', 'want', 'en', 'omdat'], 2, vw), 'Zoek het woord tussen "' + x[0] + '" en "' + x[2] + '".'),
                K(R, 'Waar komt de komma?', 'voor "' + vw + '"', ['na "' + vw + '"', 'nergens'], 'Bij maar en want staat de komma vóór het voegwoord.'),
                K(R, 'Welke zin is goed?', goed, [na, geen], 'De komma staat aan het eind van de eerste zin, vlak voor "' + vw + '".') ] });
          } },
        { id:'teken-komma-pv', naam:'Tussen twee persoonsvormen', kort:'Twee persoonsvormen betekent twee zinnen: tussen die zinnen komt een komma',
          uit:'<p>Elke zin heeft een <b>persoonsvorm</b>. Staan er <b>twee</b> persoonsvormen in, dan zijn het eigenlijk twee zinnen in één. Tussen die twee zinnen zet je een <b>komma</b>.</p><p>De proef: tel de persoonsvormen. Zoek dan waar de eerste zin ophoudt. Daar komt de komma: <i>Toen de bel ging, renden we naar buiten.</i></p><p>Staat er maar één persoonsvorm, dan is het één zin. Ook met een lang stuk vooraan komt er dan geen komma: <i>Na de lange les in de gymzaal gingen we naar huis.</i></p>',
          wanneer:'je twijfelt of er midden in een lange zin een komma moet.',
          maak:function(R){
            var t = R.kies(PVZIN), ws = leesPv(t), pvs = ws.filter(function(x){ return x.pv; }), twee = pvs.length === 2;
            var ki = -1; ws.forEach(function(x, i){ if (x.knip) ki = i; });
            var leeg = ws.map(function(){ return false; });
            var plain = plak(ws, leeg) + '.';
            var kGoed = leeg.slice(); kGoed[ki] = true;
            var pv2i = -1; ws.forEach(function(x, i){ if (x.pv) pv2i = i; });
            var kAnder = leeg.slice(); kAnder[pv2i] = true;
            var goed, fouten, st = [];
            var fout1 = {}; if (twee) fout1['1'] = 'Kijk ook in het eerste stuk van de zin. Daar staat ook een persoonsvorm.'; else fout1['2'] = 'Alleen het werkwoord dat verandert als je de zin in een andere tijd zet, telt. Dat is er hier maar één.';
            st.push({ tekst:'Hoeveel persoonsvormen staan er in de zin?', antwoord:String(pvs.length), hint:'Zet de zin in een andere tijd (nu of vroeger). De werkwoorden die dan veranderen, zijn de persoonsvormen.', fout:fout1 });
            if (twee){
              goed = plak(ws, kGoed) + '.'; fouten = [plain, plak(ws, kAnder) + '.'];
              var opt = [ws[ki + 1].w, ws[Math.max(0, ki - 1)].w].filter(function(w){ return w !== ws[ki].w; });
              st.push(K(R, 'Na welk woord eindigt de eerste zin?', ws[ki].w, opt, 'De eerste zin loopt tot vlak voor de tweede persoonsvorm: "' + pvs[1].w + '".'));
            } else {
              goed = plain; fouten = [plak(ws, kGoed) + '.', plak(ws, kAnder) + '.'];
              st.push(V('Er is maar één persoonsvorm, dus maar één zin. Komt er dan een komma in?', ['ja', 'nee'], 1, 'Een komma tussen twee zinnen kan alleen als er twee zinnen zijn. Een lang stuk vooraan is nog geen zin.'));
            }
            st.push(K(R, 'Welke zin is goed?', goed, fouten, twee ? 'De komma komt op de plek waar de eerste zin ophoudt: na "' + ws[ki].w + '".' : 'Eén persoonsvorm, één zin: geen komma.'));
            return af({ vraag:plain, context:'Moet er een komma in deze zin? Kies de goede zin.',
              beeld:function(k){
                if (k < 1) return '';
                if (twee && k >= 2) return R.teken.zin([{ t:plak(ws.slice(0, ki + 1), leeg) + ',', k:1, label:'zin 1' }, { t:plak(ws.slice(ki + 1), leeg) + '.', k:3, label:'zin 2' }]);
                var d = [], los = [];
                ws.forEach(function(x){ if (x.pv){ if (los.length) d.push(los.join(' ')); los = []; d.push({ t:x.w, k:2, label:'pv' }); } else los.push(x.w); });
                if (los.length) d.push(los.join(' '));
                return R.teken.zin(d);
              }, stappen:st });
          } },
        { id:'teken-komma-bijzin', naam:'Na een bijzin vooraan', kort:'Begint de zin met een bijzin, dan komt er een komma na die bijzin',
          uit:'<p>Een <b>bijzin</b> begint met een voegwoord, zoals <i>als, toen, omdat, terwijl, hoewel, nadat</i> of <i>zodra</i>. Een bijzin kan niet alleen staan.</p><p>Staat de bijzin <b>vooraan</b>, dan zet je er een <b>komma</b> achter. Daarna komt de hoofdzin, die begint met zijn persoonsvorm: <i>Als het regent, blijf ik thuis.</i></p><p>Je ziet het aan de twee persoonsvormen die naast elkaar staan: <i>regent, blijf</i>.</p>',
          wanneer:'een zin begint met als, toen, omdat, terwijl of een ander voegwoord.',
          maak:function(R){
            var x = R.kies(BIJZIN), b = x[0].split(' '), h = x[1].split(' '), vw = b[0].toLowerCase();
            var goed = x[0] + ', ' + x[1] + '.', geen = x[0] + ' ' + x[1] + '.', naVw = b[0] + ', ' + b.slice(1).join(' ') + ' ' + x[1] + '.';
            var mid = b[Math.floor(b.length / 2)];
            return af({ vraag:geen, context:'Zet de komma goed.',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0] + ',', k:1, label:'bijzin' }, { t:x[1] + '.', k:3, label:'hoofdzin' }]) : ''; },
              stappen:[
                { tekst:'Met welk voegwoord begint de bijzin?', antwoord:vw, hint:'Een bijzin begint met een voegwoord, zoals als, toen, omdat of terwijl. Kijk naar het eerste woord.' },
                K(R, 'Na welk woord eindigt de bijzin?', b[b.length - 1], [h[0], mid], 'De bijzin houdt op vlak voor de persoonsvorm van de hoofdzin: "' + h[0] + '".'),
                K(R, 'Welke zin is goed?', goed, [geen, naVw], 'De komma komt na de hele bijzin, vlak voor "' + h[0] + '".') ] });
          } },
        { id:'teken-komma-bijstelling', naam:'Bij een bijstelling', kort:'Een stukje dat nog eens zegt wie of wat iets is, staat tussen komma\'s',
          uit:'<p>Een <b>bijstelling</b> zegt nog eens wie of wat iemand of iets is: <i>Amsterdam, de hoofdstad van Nederland, is een drukke stad.</i></p><p>Een bijstelling staat tussen <b>twee komma\'s</b>. Staat hij aan het eind van de zin, dan is het één komma en sluit de punt hem af: <i>Dit is Noor, mijn zus.</i></p><p>Proef: laat het stukje weg. Is de zin dan nog goed? Dan is het een bijstelling.</p>',
          wanneer:'je extra uitleg geeft over een persoon, plaats of ding in de zin.',
          maak:function(R){
            var mid = Math.random() < 0.6, x, goed, geen, half, ref, bij, opt;
            if (mid){ x = R.kies(BIJST_M); ref = x[0]; bij = x[1]; goed = x[0] + ', ' + x[1] + ', ' + x[2] + '.'; geen = x[0] + ' ' + x[1] + ' ' + x[2] + '.'; half = x[0] + ', ' + x[1] + ' ' + x[2] + '.'; opt = [x[2], x[0] + ' ' + x[1]]; }
            else { x = R.kies(BIJST_E); ref = x[1]; bij = x[2]; goed = x[0] + ', ' + x[2] + '.'; geen = x[0] + ' ' + x[2] + '.'; var w = x[0].split(' '); half = w.slice(0, -1).join(' ') + ', ' + w[w.length - 1] + ' ' + x[2] + '.'; opt = [x[0], 'er is geen bijstelling']; }
            return af({ vraag:geen, context:'Zet de komma\'s goed.',
              beeld:function(k){ return k >= 1 ? (mid ? R.teken.zin([x[0] + ',', { t:x[1], k:2, label:'bijstelling' }, ',' + ' ' + x[2] + '.']) : R.teken.zin([x[0] + ',', { t:x[2] + '.', k:2, label:'bijstelling' }])) : ''; },
              stappen:[
                K(R, 'Welk stukje zegt nog eens wie of wat "' + ref + '" is?', bij, opt, 'Zoek het stukje dat je ook kunt weglaten en dat iets zegt over "' + ref + '".'),
                { tekst:'Hoeveel komma\'s komen er in de zin?', antwoord:mid ? '2' : '1', hint:'Een bijstelling staat tussen komma\'s. Staat hij aan het eind, dan sluit de punt hem af en heb je één komma.' },
                K(R, 'Welke zin is goed?', goed, [geen, half], 'Zet "' + bij + '" los van de rest' + (mid ? ', met een komma ervoor en erna.' : ', met een komma ervoor.')) ] });
          } },
        { id:'teken-komma-geen', naam:'Waar de komma niet mag', kort:'Tussen het onderwerp en de persoonsvorm komt nooit een komma',
          uit:'<p>Een komma mag niet overal. Tussen het <b>onderwerp</b> en de <b>persoonsvorm</b> komt <b>nooit</b> een komma, ook niet als het onderwerp lang is.</p><p>Fout: <i>De jongen met de rode jas, rent naar huis.</i><br>Goed: <i>De jongen met de rode jas rent naar huis.</i></p><p>Zoek dus eerst het onderwerp en de persoonsvorm. Staat er een komma tussen, dan moet hij weg.</p>',
          wanneer:'een zin met een lang onderwerp begint en je zin wil laten ademen.',
          maak:function(R){
            var x = R.kies(GEENK), ow = x[0].split(' ');
            var goed = x[0] + ' ' + x[1] + ' ' + x[2] + '.', fout = x[0] + ', ' + x[1] + ' ' + x[2] + '.', na = x[0] + ' ' + x[1] + ', ' + x[2] + '.';
            return af({ vraag:fout, context:'Iemand zette een komma in deze zin. Kies de goede zin.',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0], k:1, label:'onderwerp' }, { t:x[1], k:2, label:'pv' }, x[2] + '.']) : k >= 1 ? R.teken.zin([{ t:x[0], k:1, label:'onderwerp' }, x[1] + ' ' + x[2] + '.']) : ''; },
              stappen:[
                K(R, 'Wat is het onderwerp?', x[0], [ow.slice(0, 2).join(' '), x[2]], 'Vraag: wie of wat ' + x[1] + ' ' + x[2] + '? Het hele stuk dat daar antwoord op geeft, is het onderwerp.'),
                { tekst:'Wat is de persoonsvorm?', antwoord:x[1], hint:'Het werkwoord dat verandert als je de zin in een andere tijd zet.' },
                K(R, 'Welke zin is goed?', goed, [fout, na], 'Tussen het onderwerp en de persoonsvorm komt nooit een komma, hoe lang het onderwerp ook is.') ] });
          } }
      ] }
  ]);

  /* ================= directe rede ================= */
  /* spreker (zoals midden in een zin), werkwoord, citaat, leesteken */
  var RD = [ ['Sara', 'zei', 'Ik ben moe', '.'], ['Tim', 'vroeg', 'Ga je mee naar de film', '?'], ['de juf', 'zei', 'Pak je schrift maar', '.'],
    ['mijn moeder', 'riep', 'Het eten is klaar', '!'], ['opa', 'vroeg', 'Wie wil er thee', '?'], ['de trainer', 'riep', 'Rennen, jongens', '!'],
    ['Noor', 'zei', 'Ik heb mijn sleutels vergeten', '.'], ['Mo', 'vroeg', 'Hoe laat begint de les', '?'], ['de buurvrouw', 'zei', 'Jullie kat zit in mijn tuin', '.'],
    ['Daan', 'riep', 'Wat een goal', '!'], ['de conducteur', 'zei', 'De trein vertrekt over twee minuten', '.'], ['Lisa', 'vroeg', 'Mag ik je gum lenen', '?'],
    ['papa', 'zei', 'Morgen gaan we naar het strand', '.'], ['de agent', 'vroeg', 'Waar woont u', '?'], ['Yara', 'riep', 'Help, mijn fiets is weg', '!'],
    ['mijn broer', 'zei', 'Ik heb de wedstrijd gewonnen', '.'], ['meneer Bakker', 'vroeg', 'Wie weet het antwoord', '?'], ['oma', 'riep', 'Wat ben je groot geworden', '!'],
    ['Jesse', 'zei', 'Ik kom straks', '.'], ['de kok', 'vroeg', 'Wilt u nog een toetje', '?'] ];
  var ZOORT = { '.':'een mededeling', '?':'een vraag', '!':'een uitroep' };
  function rdVoor(x){ return hoofd(x[0]) + ' ' + x[1] + ': "' + x[2] + x[3] + '"'; }
  function rdNa(x){ return '"' + x[2] + (x[3] === '.' ? ',' : x[3]) + '" ' + x[1] + ' ' + x[0] + '.'; }
  function kaal(x, na){ return na ? klein(x[2]) + ' ' + x[1] + ' ' + x[0] : hoofd(x[0]) + ' ' + x[1] + ' ' + klein(x[2]); }
  /* indirecte rede: spreker, m/v, citaat, leesteken, soort (d=dat, o=of, of het vraagwoord), goed na het voegwoord, foute woordvolgorde */
  var ID = [ ['Sara', 'v', 'Ik ben moe', '.', 'd', 'ze moe is', 'ze is moe'], ['Tim', 'm', 'Ik heb honger', '.', 'd', 'hij honger heeft', 'hij heeft honger'],
    ['Noor', 'v', 'Ik woon in Leiden', '.', 'd', 'ze in Leiden woont', 'ze woont in Leiden'], ['Mo', 'm', 'Ik speel op zaterdag voetbal', '.', 'd', 'hij op zaterdag voetbal speelt', 'hij speelt op zaterdag voetbal'],
    ['Lisa', 'v', 'Ik heb mijn huiswerk af', '.', 'd', 'ze haar huiswerk af heeft', 'ze heeft haar huiswerk af'], ['Daan', 'm', 'Ik kom morgen niet', '.', 'd', 'hij morgen niet komt', 'hij komt morgen niet'],
    ['Yara', 'v', 'Ik vind de film saai', '.', 'd', 'ze de film saai vindt', 'ze vindt de film saai'], ['Jesse', 'm', 'Ik ben mijn fiets kwijt', '.', 'd', 'hij zijn fiets kwijt is', 'hij is zijn fiets kwijt'],
    ['Fatima', 'v', 'Ik wil later dokter worden', '.', 'd', 'ze later dokter wil worden', 'ze wil later dokter worden'], ['Bram', 'm', 'Ik kan goed zwemmen', '.', 'd', 'hij goed kan zwemmen', 'hij kan goed zwemmen'],
    ['Kevin', 'm', 'Mag ik naar de wc', '?', 'o', 'hij naar de wc mag', 'mag hij naar de wc'], ['Sara', 'v', 'Moet ik mijn boek meenemen', '?', 'o', 'ze haar boek moet meenemen', 'moet ze haar boek meenemen'],
    ['Tim', 'm', 'Ben ik te laat', '?', 'o', 'hij te laat is', 'is hij te laat'], ['Noor', 'v', 'Kan ik morgen langskomen', '?', 'o', 'ze morgen kan langskomen', 'kan ze morgen langskomen'],
    ['Mo', 'm', 'Heb ik de toets gehaald', '?', 'o', 'hij de toets heeft gehaald', 'heeft hij de toets gehaald'],
    ['Lisa', 'v', 'Hoe laat begint de film', '?', 'hoe laat', 'hoe laat de film begint', 'hoe laat begint de film'], ['Daan', 'm', 'Waar is mijn jas', '?', 'waar', 'waar zijn jas is', 'waar is zijn jas'],
    ['Yara', 'v', 'Wanneer krijg ik mijn cijfer', '?', 'wanneer', 'wanneer ze haar cijfer krijgt', 'wanneer krijgt ze haar cijfer'], ['Jesse', 'm', 'Wie heeft mijn pen gepakt', '?', 'wie', 'wie zijn pen heeft gepakt', 'wie heeft zijn pen gepakt'],
    ['Fatima', 'v', 'Waarom is de les uitgevallen', '?', 'waarom', 'waarom de les is uitgevallen', 'waarom is de les uitgevallen'] ];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'teken-rede', niveau:'1F', domein:'leestekens', naam:'Directe rede', uit:'Schrijf je op wat iemand letterlijk zei, dan gebruik je aanhalingstekens. Daar horen vaste regels bij voor de dubbele punt, de komma en de hoofdletter. En je kunt het ook navertellen, in indirecte rede.' },
      doelen:[
        { id:'teken-rede-aanhaling', naam:'Aanhalingstekens', kort:'Wat iemand letterlijk zegt, zet je tussen aanhalingstekens',
          uit:'<p>Schrijf je precies op wat iemand zei, dan heet dat <b>directe rede</b>. De letterlijke woorden heten het <b>citaat</b>.</p><p>Om het citaat zet je <b>aanhalingstekens</b>: <i>Sara zei: "Ik ben moe."</i> Alleen de woorden die Sara zelf zei, staan ertussen. <i>Sara zei</i> staat erbuiten.</p>',
          wanneer:'je in een verhaal of verslag opschrijft wat iemand letterlijk zei.',
          maak:function(R){
            var x = R.kies(RD), wie = hoofd(x[0]) + ' ' + x[1], andere = trek(R, RD.map(function(r){ return hoofd(r[0]); }), 2, hoofd(x[0]));
            var goed = rdVoor(x), alles = '"' + wie + ': ' + x[2] + x[3] + '"', geen = wie + ': ' + x[2] + x[3];
            return af({ vraag:kaal(x), context:'Zet de aanhalingstekens goed.',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:wie + ':', k:1, label:'wie het zegt' }, { t:'"' + x[2] + x[3] + '"', k:3, label:'citaat' }]) : ''; },
              stappen:[
                K(R, 'Wie zegt er iets?', hoofd(x[0]), andere, 'Wie ' + x[1] + ' het? Dat staat vlak voor of na het werkwoord "' + x[1] + '".'),
                K(R, 'Welke woorden zegt ' + x[0] + ' letterlijk?', x[2], [wie, wie + ' ' + klein(x[2])], 'Het citaat zijn alleen de woorden die ' + x[0] + ' zelf uitspreekt.'),
                K(R, 'Welke zin is goed?', goed, [alles, geen], 'Alleen het citaat staat tussen de aanhalingstekens.') ] });
          } },
        { id:'teken-rede-dubbelepunt', naam:'De dubbele punt ervoor', kort:'Staat wie het zegt vooraan, dan komt er een dubbele punt voor het citaat',
          uit:'<p>Staat eerst <b>wie het zegt</b>, dan zet je na het werkwoord een <b>dubbele punt</b>: <i>Tim vroeg: "Ga je mee?"</i></p><p>Het leesteken aan het eind van het citaat, de punt, het vraagteken of het uitroepteken, staat <b>binnen</b> de aanhalingstekens.</p>',
          wanneer:'de zin begint met wie er iets zegt, zoals "Sara zei" of "Tim vroeg".',
          maak:function(R){
            var x = R.kies(RD), wie = hoofd(x[0]) + ' ' + x[1];
            var goed = rdVoor(x), pk = wie + '; "' + x[2] + x[3] + '"', buiten = wie + ': "' + x[2] + '"' + x[3];
            return af({ vraag:kaal(x), context:'Zet de leestekens goed.',
              beeld:function(k){ return k >= 1 ? R.teken.zin([wie, { t:':', k:5, label:'dubbele punt' }, { t:'"' + x[2] + x[3] + '"', k:3, label:'citaat' }]) : ''; },
              stappen:[
                K(R, 'Welk teken komt na "' + x[1] + '"?', TK[':'], [TK[';'], TK['.']], 'Wie het zegt staat vooraan. Het citaat wordt aangekondigd, en daarvoor gebruik je een dubbele punt.'),
                V('Waar komt het leesteken aan het eind van het citaat?', ['binnen de aanhalingstekens', 'buiten de aanhalingstekens'], 0, 'Het leesteken hoort bij het citaat zelf, dus het staat binnen de aanhalingstekens.'),
                K(R, 'Welke zin is goed?', goed, [pk, buiten], 'Een dubbele punt na "' + x[1] + '" en het leesteken binnen de aanhalingstekens.') ] });
          } },
        { id:'teken-rede-hoofdletter', naam:'De hoofdletter in het citaat', kort:'Een citaat begint met een hoofdletter, het werkwoord erna niet',
          uit:'<p>Een citaat is een eigen zin. Daarom begint het met een <b>hoofdletter</b>, ook midden in de zin: <i>Sara zei: "Ik ben moe."</i></p><p>Staat het citaat vooraan, dan loopt de zin daarna door. Het werkwoord erna krijgt <b>geen</b> hoofdletter: <i>"Ik ben moe," zei Sara.</i></p>',
          wanneer:'je een citaat opschrijft en twijfelt over de hoofdletters.',
          maak:function(R){
            var x = R.kies(RD), na = Math.random() < 0.5, eerste = x[2].split(' ')[0].replace(/,$/, ''), goed, f1, f2, st = [];
            if (na){ goed = rdNa(x); f1 = rdNa(x).replace('" ' + x[1], '" ' + hoofd(x[1])); f2 = '"' + klein(x[2]) + goed.slice(1 + x[2].length); }
            else { goed = rdVoor(x); f1 = hoofd(x[0]) + ' ' + x[1] + ': "' + klein(x[2]) + x[3] + '"'; f2 = hoofd(x[0]) + ' ' + hoofd(x[1]) + ': "' + klein(x[2]) + x[3] + '"'; }
            st.push({ tekst:'Met welk woord begint het citaat?', antwoord:eerste.toLowerCase(), hint:'Het citaat zijn de woorden die ' + x[0] + ' letterlijk zegt.' });
            st.push(V('Krijgt "' + eerste.toLowerCase() + '" een hoofdletter?', ['ja', 'nee'], 0, 'Een citaat is een eigen zin. Een zin begint altijd met een hoofdletter.'));
            if (na) st.push(V('En "' + x[1] + '", na het citaat?', ['hoofdletter', 'kleine letter'], 1, 'Na het citaat loopt de zin gewoon door. Midden in een zin schrijf je geen hoofdletter.'));
            st.push(K(R, 'Welke zin is goed?', goed, [f1, f2], 'Hoofdletter aan het begin van het citaat' + (na ? ', kleine letter bij "' + x[1] + '".' : '.')));
            return af({ vraag:kaal(x, na), context:'Zet de hoofdletters en leestekens goed.', stappen:st,
              beeld:function(k){ return k >= 2 ? R.teken.zin(na ? [{ t:'"' + x[2] + (x[3] === '.' ? ',' : x[3]) + '"', k:3, label:'hoofdletter' }, { t:x[1], k:1, label:'kleine letter' }, x[0] + '.'] : [hoofd(x[0]) + ' ' + x[1] + ':', { t:'"' + x[2] + x[3] + '"', k:3, label:'hoofdletter' }]) : ''; } });
          } },
        { id:'teken-rede-erna', naam:'Het citaat vooraan', kort:'Staat het citaat vooraan, dan wordt de punt een komma en draait het werkwoord om',
          uit:'<p>Je kunt het citaat ook <b>vooraan</b> zetten. Dan komt <i>wie het zegt</i> erachter, met het werkwoord eerst: <i>zei Sara</i>.</p><p>Is het citaat een mededeling, dan wordt de punt een <b>komma</b> binnen de aanhalingstekens: <i>"Ik kom," zei ze.</i> Een vraagteken of uitroepteken blijft staan: <i>"Ga je mee?" vroeg Tim.</i></p>',
          wanneer:'je een verhaal schrijft en het citaat eerst zet.',
          maak:function(R){
            var x = R.kies(RD), t = x[3] === '.' ? ',' : x[3];
            var goed = rdNa(x), f1 = x[3] === '.' ? '"' + x[2] + '." ' + x[1] + ' ' + x[0] + '.' : '"' + x[2] + x[3] + '," ' + x[1] + ' ' + x[0] + '.';
            var f2 = '"' + x[2] + t + '" ' + hoofd(x[0]) + ' ' + x[1] + '.';
            if (/^[a-z]/.test(x[0])) f2 = '"' + x[2] + t + '" ' + x[0] + ' ' + x[1] + '.';
            return af({ vraag:kaal(x, true), context:'Zet de leestekens goed. Het citaat staat vooraan.',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:'"' + x[2] + t + '"', k:3, label:'citaat' }, { t:x[1] + ' ' + x[0] + '.', k:1, label:'wie het zegt' }]) : ''; },
              stappen:[
                K(R, 'Wat voor zin is het citaat?', ZOORT[x[3]], waarden(ZOORT, x[3]), 'Vertelt "' + x[2] + '" iets, vraagt het iets, of roept het iets uit?'),
                K(R, 'Welk teken komt aan het eind van het citaat, binnen de aanhalingstekens?', TK[t], [TK[','], TK['.'], TK['?'], TK['!']], x[3] === '.' ? 'Het citaat is een mededeling, maar de hele zin is nog niet af. Daarom wordt de punt een komma.' : 'Een vraagteken of uitroepteken blijft gewoon staan. Er komt geen komma bij.'),
                K(R, 'Welke zin is goed?', goed, [f1, f2], 'Na het citaat komt eerst het werkwoord: "' + x[1] + ' ' + x[0] + '".') ] });
          } },
        { id:'teken-rede-indirect', naam:'Van directe naar indirecte rede', kort:'Vertel je na wat iemand zei, dan gebruik je dat, of of een vraagwoord en geen aanhalingstekens',
          uit:'<p>Bij <b>indirecte rede</b> vertel je na wat iemand zei, zonder aanhalingstekens. <i>Sara zegt: "Ik ben moe."</i> wordt <i>Sara zegt dat ze moe is.</i></p><p>Bij een mededeling gebruik je <b>dat</b>, bij een ja-neevraag <b>of</b>, en bij een vraag met een vraagwoord blijft het <b>vraagwoord</b> staan.</p><p>Let op twee dingen: <i>ik</i> wordt <i>hij</i> of <i>ze</i> (en <i>mijn</i> wordt <i>zijn</i> of <i>haar</i>), en de persoonsvorm schuift naar achteren.</p>',
          wanneer:'je in een verslag of samenvatting navertelt wat iemand zei of vroeg.',
          maak:function(R){
            var x = R.kies(ID), vb = x[3] === '?' ? 'vraagt' : 'zegt', conn = x[4] === 'd' ? 'dat' : x[4] === 'o' ? 'of' : x[4];
            var voor = x[0] + ' ' + vb + ' ' + (x[4] === 'd' || x[4] === 'o' ? conn + ' ' : '');
            var goed = voor + x[5] + '.', orde = voor + x[6] + '.', fc = x[4] === 'd' ? x[0] + ' ' + vb + ' of ' + x[5] + '.' : x[4] === 'o' ? x[0] + ' ' + vb + ' dat ' + x[5] + '.' : x[0] + ' ' + vb + ' of ' + x[5] + '.';
            var st = [K(R, 'Welk woord verbindt de twee zinnen?', conn, x[4] === 'd' ? ['of', 'als'] : x[4] === 'o' ? ['dat', 'als'] : ['dat', 'of'],
              x[4] === 'd' ? 'Het citaat is een mededeling. Daarbij gebruik je "dat".' : x[4] === 'o' ? 'Het citaat is een vraag zonder vraagwoord, een ja-neevraag. Daarbij gebruik je "of".' : 'Het citaat is een vraag met een vraagwoord. Dat vraagwoord blijft staan.')];
            if (/\b(ik|mijn)\b/i.test(x[2])) st.push(K(R, 'Wat wordt "ik" in de indirecte rede?', x[1] === 'm' ? 'hij' : 'ze', ['ik', x[1] === 'm' ? 'ze' : 'hij'], 'Jij vertelt nu wat ' + x[0] + ' zei. "Ik" is dan ' + x[0] + '. En "mijn" wordt "' + (x[1] === 'm' ? 'zijn' : 'haar') + '".'));
            st.push(K(R, 'Welke zin is goed?', goed, [orde, fc], 'Na "' + conn + '" schuift de persoonsvorm naar achteren.'));
            return af({ vraag:x[0] + ' ' + vb + ': "' + x[2] + x[3] + '"', context:'Maak er indirecte rede van.', stappen:st });
          } }
      ] }
  ]);

  /* ================= andere leestekens ================= */
  var DP = [ ['Voor de pannenkoeken heb je drie dingen nodig', 'meel, melk en eieren', 'o'], ['Neem voor de excursie het volgende mee', 'een lunchpakket, een regenjas en je pas', 'o'],
    ['In onze klas zitten kinderen uit vier landen', 'Nederland, Turkije, Marokko en Polen', 'o'], ['Op de boodschappenlijst staan vier dingen', 'brood, kaas, appels en melk', 'o'],
    ['Je kunt kiezen uit drie sporten', 'hockey, judo of tennis', 'o'], ['Dit heb je nodig voor de proef', 'een glas, water en zout', 'o'], ['Ze heeft twee huisdieren', 'een kat en een konijn', 'o'],
    ['De winnaars krijgen het volgende', 'een beker, een medaille en een tegoedbon', 'o'], ['Ik ben in drie landen geweest', 'België, Duitsland en Spanje', 'o'],
    ['Er is één probleem', 'de bus rijdt vandaag niet', 'u'], ['Onthoud één regel', 'eerst kijken, dan oversteken', 'u'], ['Mijn advies is dit', 'begin op tijd met leren', 'u'],
    ['De reden is eenvoudig', 'we hebben geen geld meer', 'u'], ['Het geheim van een goede taart is simpel', 'gebruik echte boter', 'u'], ['Er was maar één oplossing', 'we moesten opnieuw beginnen', 'u'],
    ['Ik heb goed nieuws voor je', 'je bent geslaagd', 'u'], ['Het weerbericht voor morgen is duidelijk', 'het wordt warm en zonnig', 'u'] ];
  var PK = [ ['Mijn broer houdt van voetbal', 'mijn zus houdt van hockey'], ['Ik kook vandaag', 'jij doet morgen de afwas'], ['In de zomer is het hier druk', 'in de winter is er bijna niemand'],
    ['Sanne leest graag boeken', 'haar broer kijkt liever films'], ['De ochtend was koud en grijs', 'de middag was warm en zonnig'], ['Oma drinkt koffie', 'opa drinkt thee'],
    ['Op maandag hebben we gym', 'op dinsdag hebben we zwemmen'], ['Het eerste deel van de film was spannend', 'het tweede deel was saai'], ['Tim fietst naar school', 'Noor gaat met de bus'],
    ['Jij ruimt de tafel af', 'ik zet de borden in de vaatwasser'], ['Het rode team won de eerste ronde', 'het blauwe team won de tweede'], ['Mijn vader werkt in een ziekenhuis', 'mijn moeder werkt op een school'],
    ['Sommige leerlingen waren blij met de uitslag', 'anderen waren teleurgesteld'], ['Vroeger schreven mensen brieven', 'nu sturen ze appjes'], ['Het huis is oud', 'de keuken is gloednieuw'],
    ['Mijn kamer is klein', 'de kamer van mijn zus is groot'] ];
  var HK = [ ['Lees de tekst op bladzijde 12', 'zie ook het plaatje', ''], ['Je hebt een rekenmachine', 'geen telefoon', 'nodig'], ['Het concert duurt twee uur', 'met een pauze', ''],
    ['Mijn oom woont in Zwolle', 'de hoofdstad van Overijssel', ''], ['De NOS', 'Nederlandse Omroep Stichting', 'maakt het journaal'], ['Hij heeft drie broers', 'allemaal ouder dan hij', ''],
    ['De wedstrijd', 'de laatste van het seizoen', 'eindigde in een gelijkspel'], ['Vincent van Gogh', '1853 tot 1890', 'was een Nederlandse schilder'], ['Mijn opa', 'hij is tachtig', 'fietst nog elke dag'],
    ['De toets gaat over hoofdstuk 3', 'bladzijde 40 tot 55', ''], ['Het museum is op maandag dicht', 'behalve in de vakantie', ''], ['Water kookt bij 100 graden', 'op zeeniveau', ''],
    ['De bewoonde Waddeneilanden', 'Texel, Vlieland, Terschelling, Ameland en Schiermonnikoog', 'liggen in het noorden van ons land'], ['De vergadering', 'in lokaal 12', 'begint om drie uur'],
    ['De Tweede Wereldoorlog', '1939 tot 1945', 'duurde bijna zes jaar'], ['Mijn zus', 'die in Groningen studeert', 'komt dit weekend thuis'] ];
  var WL = [ ["'s avonds", 'des', 'We eten ' + GAT + ' om zes uur.'], ["'s avonds", 'des', 'Ik lees ' + GAT + ' in bed.'], ["'s morgens", 'des', 'Ik douche ' + GAT + ' voor school.'],
    ["'s nachts", 'des', 'Uilen jagen ' + GAT + ' op muizen.'], ["'s middags", 'des', 'Op woensdag zijn we ' + GAT + ' vrij.'], ["'s winters", 'des', 'Het meer is ' + GAT + ' soms bevroren.'],
    ["'s zomers", 'des', 'Het is hier ' + GAT + ' erg druk.'], ["'s ochtends", 'des', 'Ik heb ' + GAT + ' altijd honger.'], ["zo'n", 'zo een', 'Ik wil ook ' + GAT + ' fiets.'],
    ["zo'n", 'zo een', 'Ik heb nog nooit ' + GAT + ' grote hond gezien.'], ["m'n", 'mijn', 'Ik ben ' + GAT + ' sleutels kwijt.'], ["m'n", 'mijn', 'Heb jij ' + GAT + ' jas gezien?'],
    ["z'n", 'zijn', 'Hij is ' + GAT + ' jas vergeten.'], ["z'n", 'zijn', 'Tim fietst met ' + GAT + ' broer naar school.'], ["'t", 'het', 'Hoe gaat ' + GAT + ' met je?'],
    ["'t", 'het', 'Ik weet ' + GAT + ' niet.'], ["'n", 'een', 'Heb je ' + GAT + ' pen voor mij?'], ["'n", 'een', 'Wat ' + GAT + ' mooie dag!'] ];
  function wlFout(v){
    if (/^'s /.test(v)) return ["s'" + v.slice(3), "'s" + v.slice(3)];
    return { "zo'n":['zo,n', "z'on"], "m'n":["mn'", 'm,n'], "z'n":["zn'", 'z,n'], "'t":["t'", "'t'"], "'n":["n'", "'n'"] }[v];
  }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'teken-ander', niveau:'2F', domein:'leestekens', naam:'Andere leestekens', uit:'De dubbele punt, de puntkomma, haakjes en het weglatingsteken. Je ziet ze minder vaak dan de punt en de komma, maar ze hebben elk een eigen taak.' },
      doelen:[
        { id:'teken-ander-dubbelepunt', naam:'De dubbele punt', kort:'Een dubbele punt kondigt een opsomming of een uitleg aan',
          uit:'<p>Een <b>dubbele punt</b> zegt: let op, nu komt het. Erna volgt een <b>opsomming</b> of een <b>uitleg</b>.</p><p>Opsomming: <i>Je hebt drie dingen nodig: meel, melk en eieren.</i><br>Uitleg: <i>Er is één probleem: de bus rijdt vandaag niet.</i></p><p>Na de dubbele punt schrijf je gewoon verder met een kleine letter.</p>',
          wanneer:'het eerste stuk van de zin iets aankondigt, zoals "drie dingen" of "één probleem".',
          maak:function(R){
            var x = R.kies(DP), soort = x[2] === 'o' ? 'een opsomming' : 'een uitleg van het eerste stuk';
            var goed = x[0] + ': ' + x[1] + '.';
            return af({ vraag:x[0] + ' ' + GAT + ' ' + x[1] + '.', context:'Welk leesteken hoort op de plek van het gat?',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0], k:1, label:'aankondiging' }, { t:':', k:5, label:'dubbele punt' }, { t:x[1] + '.', k:3, label:x[2] === 'o' ? 'opsomming' : 'uitleg' }]) : ''; },
              stappen:[
                K(R, 'Wat komt er na de plek van het gat?', soort, ['een opsomming', 'een uitleg van het eerste stuk', 'een tegenstelling'], x[2] === 'o' ? 'Na het gat volgt een rijtje dingen.' : 'Het tweede stuk zegt wat "' + x[0].split(' ').slice(-2).join(' ') + '" precies is.'),
                K(R, 'Welke zin is goed?', goed, [x[0] + '; ' + x[1] + '.', x[0] + ', ' + x[1] + '.'], 'Het eerste stuk kondigt iets aan. Daarna komt een dubbele punt.') ] });
          } },
        { id:'teken-ander-puntkomma', naam:'De puntkomma', kort:'Een puntkomma zet twee zinnen die bij elkaar horen naast elkaar',
          uit:'<p>Een <b>puntkomma</b> staat tussen <b>twee hele zinnen</b> die bij elkaar horen, bijvoorbeeld omdat ze iets vergelijken: <i>Oma drinkt koffie; opa drinkt thee.</i></p><p>Een komma mag hier niet: twee hele zinnen plak je niet aan elkaar met alleen een komma. Een dubbele punt past ook niet, want de tweede zin legt de eerste niet uit.</p>',
          wanneer:'je twee korte zinnen hebt die naast elkaar staan of elkaar tegenspreken.',
          maak:function(R){
            var x = R.kies(PK), goed = x[0] + '; ' + x[1] + '.';
            return af({ vraag:x[0] + ' ' + GAT + ' ' + x[1] + '.', context:'Welk leesteken hoort op de plek van het gat?',
              beeld:function(k){ return k >= 1 ? R.teken.zin([{ t:x[0], k:1, label:'zin 1' }, { t:k >= 3 ? ';' : '?', k:5, label:k >= 3 ? 'puntkomma' : 'teken' }, { t:x[1] + '.', k:3, label:'zin 2' }]) : ''; },
              stappen:[
                { tekst:'Hoeveel persoonsvormen staan er?', antwoord:'2', hint:'Zoek in elk stuk het werkwoord dat verandert als je de tijd verandert. Twee persoonsvormen zijn twee hele zinnen.' },
                V('Legt de tweede zin de eerste uit?', ['ja', 'nee'], 1, 'De tweede zin vertelt iets wat naast de eerste staat. Hij legt niets uit, dus een dubbele punt past niet.'),
                K(R, 'Welke zin is goed?', goed, [x[0] + ', ' + x[1] + '.', x[0] + ': ' + x[1] + '.'], 'Twee hele zinnen plak je niet aan elkaar met alleen een komma. Hier past een puntkomma.') ] });
          } },
        { id:'teken-ander-haakjes', naam:'Haakjes', kort:'Extra informatie die je ook kunt weglaten, zet je tussen haakjes',
          uit:'<p>Tussen <b>haakjes</b> zet je <b>extra informatie</b>: iets wat handig is om te weten, maar wat je ook kunt weglaten. <i>Water kookt bij 100 graden (op zeeniveau).</i></p><p>Proef: lees de zin zonder het stukje tussen haakjes. Klopt de zin nog? Dan staan de haakjes goed.</p><p>Staan de haakjes aan het eind, dan komt de punt <b>na</b> het sluithaakje.</p>',
          wanneer:'je een jaartal, een afkorting of een kleine uitleg wilt toevoegen.',
          maak:function(R){
            var x = R.kies(HK), na = x[2], goed = x[0] + ' (' + x[1] + ')' + (na ? ' ' + na : '') + '.', kaalZin = x[0] + ' ' + x[1] + (na ? ' ' + na : '') + '.';
            var w = x[0].split(' '), staart = w.slice(-2).join(' '), kop = w.slice(0, -2).join(' ');
            var fA = na ? x[0] + ' ' + x[1] + ' (' + na + ').' : (kop ? kop + ' ' : '') + '(' + staart + ') ' + x[1] + '.';
            var fB = na ? x[0] + ' (' + x[1] + ' ' + na + ').' : x[0] + ' (' + x[1] + '.)';
            var zonderZin = x[0] + (na ? ' ' + na : '') + '.';
            return af({ vraag:kaalZin, context:'Zet de haakjes goed.',
              beeld:function(k){ return k >= 1 ? R.teken.zin([x[0], { t:'(' + x[1] + ')', k:2, label:'extra' }].concat(na ? [na + '.'] : ['.'])) : ''; },
              stappen:[
                K(R, 'Welk stukje is extra informatie die je ook kunt weglaten?', x[1], na ? [na, x[0]] : [x[0], staart], 'Welk stukje kun je missen zonder dat de zin kapotgaat?'),
                V('Lees de zin zonder dat stukje: "' + zonderZin + '" Klopt die zin nog?', ['ja', 'nee'], 0, 'Als de zin zonder het stukje nog goed is, was het extra informatie.'),
                K(R, 'Welke zin is goed?', goed, [fA, fB], 'De haakjes staan precies om "' + x[1] + '". ' + (na ? '' : 'De punt komt na het sluithaakje.')) ] });
          } },
        { id:'teken-ander-weglating', naam:'Het weglatingsteken', kort:'Laat je letters weg, dan zet je een weglatingsteken op die plek',
          uit:'<p>Soms laat je letters weg: <i>zo een</i> wordt <i>zo\'n</i>, <i>mijn</i> wordt <i>m\'n</i>, <i>het</i> wordt <i>\'t</i>. Op de plek van de weggelaten letters zet je een <b>weglatingsteken</b> (\').</p><p>In <i>\'s avonds</i> en <i>\'s morgens</i> is <i>\'s</i> een oude vorm van <i>des</i>. De letters <i>de</i> zijn weg, dus het teken staat vóór de s.</p>',
          wanneer:'je woorden als \'s avonds, zo\'n of m\'n schrijft.',
          maak:function(R){
            var x = R.kies(WL), f = wlFout(x[0]);
            return af({ vraag:x[2], context:'Welke schrijfwijze is goed?',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0], k:2, label:'van: ' + x[1] }]) : ''; },
              stappen:[
                K(R, 'Welk woord is hier ingekort?', x[1], trek(R, ['des', 'het', 'een', 'mijn', 'zijn', 'zo een'], 2, x[1]), x[0].charAt(0) === "'" && x[1] === 'des' ? '\'s is een oude vorm van een woord dat we nu bijna nooit meer gebruiken.' : 'Lees het woord hardop en maak het weer heel.'),
                K(R, 'Hoe schrijf je het?', x[0], f, 'Vergelijk ' + x[0] + ' met ' + x[1] + '. Het weglatingsteken staat precies op de plek van de letters die weg zijn.') ] });
          } },
        { id:'teken-ander-kies', naam:'Kies het goede leesteken', kort:'Komma, dubbele punt of puntkomma: kijk wat er na de plek komt',
          uit:'<p>Nu door elkaar. Kijk steeds wat er na de plek van het leesteken komt.</p><p>Een <b>opsomming of uitleg</b> die wordt aangekondigd: <b>dubbele punt</b>. Een <b>tweede hele zin</b> die naast de eerste staat: <b>puntkomma</b>. De <b>hoofdzin na een bijzin</b> vooraan: <b>komma</b>.</p>',
          wanneer:'je twijfelt tussen een komma, een dubbele punt en een puntkomma.',
          maak:function(R){
            var r = Math.random(), a, b, t, wat;
            if (r < 0.34){ var x = R.kies(DP); a = x[0]; b = x[1]; t = ':'; wat = 'een opsomming of uitleg die wordt aangekondigd'; }
            else if (r < 0.67){ var y = R.kies(PK); a = y[0]; b = y[1]; t = ';'; wat = 'een tweede zin die naast de eerste staat'; }
            else { var z = R.kies(BIJZIN); a = z[0]; b = z[1]; t = ','; wat = 'de hoofdzin, na een bijzin vooraan'; }
            return af({ vraag:a + ' ' + GAT + ' ' + b + '.', context:'Welk leesteken hoort op de plek van het gat?',
              beeld:function(k){ return k >= 2 ? R.teken.zin([a, { t:t, k:5, label:TK[t].replace(/^. \(|\)$/g, '') }, b + '.']) : ''; },
              stappen:[
                K(R, 'Wat komt er na de plek van het gat?', wat, ['een opsomming of uitleg die wordt aangekondigd', 'een tweede zin die naast de eerste staat', 'de hoofdzin, na een bijzin vooraan'], t === ',' ? 'Het eerste stuk begint met een voegwoord: "' + a.split(' ')[0] + '". Het is een bijzin.' : t === ':' ? 'Het eerste stuk kondigt iets aan.' : 'Beide stukken zijn hele zinnen die naast elkaar staan.'),
                K(R, 'Welk leesteken past?', TK[t], [TK[':'], TK[';'], TK[',']], 'Aankondiging: dubbele punt. Twee zinnen naast elkaar: puntkomma. Na een bijzin vooraan: komma.') ] });
          } }
      ] }
  ]);

  /* ================= goede zinnen ================= */
  var JOUW = [ ['Is dit ' + GAT + ' fiets?', 1], ['Ik heb een cadeau voor ' + GAT + '.', 0], ['Ik zag ' + GAT + ' gisteren in de stad.', 0], ['Is dit ' + GAT + ' jas?', 1],
    ['Ik ga met ' + GAT + ' mee.', 0], ['Wat is ' + GAT + ' lievelingskleur?', 1], ['Ik bel ' + GAT + ' straks.', 0], ['Ik vind ' + GAT + ' hond erg lief.', 1],
    ['Ik denk vaak aan ' + GAT + '.', 0], ['Mag ik ' + GAT + ' pen lenen?', 1], ['Wie zit er naast ' + GAT + '?', 0], ['Ik vind ' + GAT + ' tekening het mooist.', 1],
    ['Dit briefje is van ' + GAT + '.', 0], ['Hoe heet ' + GAT + ' broer?', 1], ['Ik wacht op ' + GAT + ' bij het hek.', 0], ['Ik heb ' + GAT + ' moeder net gesproken.', 1],
    ['Ze heeft ' + GAT + ' geholpen met wiskunde.', 0], ['Is ' + GAT + ' huiswerk af?', 1], ['Dit cadeau is voor ' + GAT + ' verjaardag.', 1], ['Ik hoorde ' + GAT + ' zingen.', 0] ];
  /* woord waarnaar verwezen wordt, lidwoord, meervoud, rest van de zin */
  var DD = [ ['Het boek', 'ik lees is spannend.'], ['De fiets', 'ik heb gekocht is rood.'], ['Het meisje', 'naast mij zit heet Noor.'], ['De man', 'daar loopt is mijn oom.'],
    ['Het huis', 'op de hoek staat is te koop.'], ['De film', 'we gisteren zagen was eng.'], ['Het liedje', 'op de radio is ken ik niet.'], ['De boeken', 'op tafel liggen zijn van mij.'],
    ['Het paard', 'in de wei staat heet Bles.'], ['De juf', 'ons Engels geeft komt uit Engeland.'], ['Het spel', 'we spelen is nieuw.'], ['De meisjes', 'daar staan zitten bij mij in de klas.'],
    ['Het cadeau', 'ik kreeg was een horloge.'], ['De hond', 'zo hard blaft is van de buren.'], ['Het dorp', 'we bezochten was heel klein.'], ['De trein', 'om acht uur vertrekt is altijd vol.'],
    ['Het kind', 'huilt is zijn knuffel kwijt.'], ['De huizen', 'aan de gracht staan zijn heel oud.'], ['Het raam', 'kapot is wordt morgen gemaakt.'], ['De stad', 'ik het mooist vind is Utrecht.'],
    ['Het water', 'uit de kraan komt kun je drinken.'], ['De appel', 'ik at was zuur.'], ['Het museum', 'we bezoeken is groot.'], ['De tas', 'op de grond ligt is van Sara.'] ];
  var MV = ['boeken', 'meisjes', 'huizen'];
  var VGL = [ ['Mijn broer is groter ' + GAT + ' ik.', 'dan'], ['Ze is even oud ' + GAT + ' haar nicht.', 'als'], ['Hij rent net zo snel ' + GAT + ' zijn vader.', 'als'],
    ['Deze toets was moeilijker ' + GAT + ' de vorige.', 'dan'], ['Het is hier anders ' + GAT + ' thuis.', 'dan'], ['Een olifant is zwaarder ' + GAT + ' een paard.', 'dan'],
    ['Mijn tas is net zo zwaar ' + GAT + ' jouw tas.', 'als'], ['Vandaag is het warmer ' + GAT + ' gisteren.', 'dan'], ['Hij is twee keer zo oud ' + GAT + ' zij.', 'als'],
    ['Ik lees liever een boek ' + GAT + ' dat ik tv kijk.', 'dan'], ['Ze zingt even mooi ' + GAT + ' haar zus.', 'als'], ['Een fiets is goedkoper ' + GAT + ' een auto.', 'dan'],
    ['Dit boek is minder spannend ' + GAT + ' dat boek.', 'dan'], ['Amsterdam is groter ' + GAT + ' Utrecht.', 'dan'], ['Tim is zo sterk ' + GAT + ' een beer.', 'als'],
    ['Ik heb meer snoep ' + GAT + ' jij.', 'dan'], ['Het water was even koud ' + GAT + ' ijs.', 'als'], ['Mijn kamer is kleiner ' + GAT + ' die van mijn zus.', 'dan'] ];
  var VW = [ ['Ik blijf vandaag thuis', 'ik ziek ben', 'omdat'], ['We gaan niet naar het strand', 'het te koud is', 'omdat'], ['Sara is blij', 'ze een tien haalde', 'omdat'],
    ['De wedstrijd gaat niet door', 'het veld te nat is', 'omdat'], ['Hij komt te laat', 'zijn fiets kapot is', 'omdat'], ['Ik neem een jas mee', 'het misschien regent', 'omdat'],
    ['Ik blijf vandaag thuis', 'ik ben ziek', 'want'], ['We gaan niet naar het strand', 'het is te koud', 'want'], ['Hij rent naar de bushalte', 'hij is laat', 'want'],
    ['Ik eet een boterham', 'ik heb honger', 'want'], ['Ze doet het licht aan', 'het is donker', 'want'], ['Tim lacht', 'de film is grappig', 'want'],
    ['Ik wilde naar het feest', 'ik was ziek', 'maar'], ['Het was koud', 'we gingen toch zwemmen', 'maar'], ['De toets was moeilijk', 'ik haalde een acht', 'maar'],
    ['Hij rende hard', 'hij miste de bus', 'maar'], ['Ze heeft een hond', 'ze heeft geen kat', 'maar'],
    ['Ik zet een wekker', 'ik op tijd wakker word', 'zodat'], ['Hij praat heel zacht', 'niemand hem verstaat', 'zodat'], ['We vertrekken vroeg', 'we de trein niet missen', 'zodat'],
    ['Ik schrijf het op', 'ik het niet vergeet', 'zodat'], ['Het regende de hele dag', 'de straten onder water stonden', 'zodat'],
    ['Ik maak mijn huiswerk', 'ik naar muziek luister', 'terwijl'], ['Mama kookt', 'papa de tafel dekt', 'terwijl'], ['Hij zingt altijd', 'hij onder de douche staat', 'terwijl'],
    ['De kinderen spelen buiten', 'de ouders koffie drinken', 'terwijl'], ['Ze belde haar oma', 'ze door het park liep', 'terwijl'] ];
  var VWVB = { omdat:'een reden', want:'een reden', maar:'een tegenstelling', zodat:'een gevolg of doel', terwijl:'iets wat tegelijk gebeurt' };
  var VWAF = { omdat:['want', 'zodat'], want:['omdat', 'maar'], maar:['want', 'omdat'], zodat:['omdat', 'maar'], terwijl:['omdat', 'want'] };
  /* eerste zin, voegwoord, onderwerp, persoonsvorm, rest */
  var VO = [ ['Ik ga vroeg naar bed', 'omdat', 'ik', 'ben', 'moe'], ['Ik ga vroeg naar bed', 'want', 'ik', 'ben', 'moe'], ['We blijven binnen', 'omdat', 'het', 'is', 'erg koud'],
    ['We blijven binnen', 'want', 'het', 'is', 'erg koud'], ['Ze zegt', 'dat', 'ze', 'komt', 'morgen'], ['Ik weet niet', 'of', 'hij', 'heeft', 'tijd'],
    ['Bel me even', 'als', 'je', 'bent', 'thuis'], ['Hij lachte', 'toen', 'hij', 'zag', 'de foto'], ['Ik luister muziek', 'terwijl', 'ik', 'maak', 'mijn huiswerk'],
    ['Ze ging naar buiten', 'hoewel', 'het', 'was', 'koud'], ['Hij oefent elke dag', 'zodat', 'hij', 'wordt', 'beter'], ['Ik wil naar buiten', 'maar', 'het', 'is', 'te koud'],
    ['Neem een paraplu mee', 'want', 'het', 'gaat', 'regenen'], ['Ik kom niet', 'omdat', 'ik', 'heb', 'griep'], ['De les begint', 'als', 'iedereen', 'is', 'stil'],
    ['Mijn moeder vraagt', 'of', 'je', 'hebt', 'honger'], ['Ik ben blij', 'dat', 'de vakantie', 'begint', 'bijna'], ['Hij was moe', 'want', 'hij', 'had', 'slecht geslapen'] ];
  var KORT = [ ['ik kwam thuis', 'ik pakte een appel', 'ik ging op de bank zitten', 'ik keek tv'], ['we gingen naar het strand', 'we bouwden een zandkasteel', 'mijn broer zwom in zee', 'we aten een ijsje'],
    ['de bel ging', 'iedereen rende naar buiten', 'Tim pakte de bal', 'we speelden voetbal'], ['ik werd wakker', 'ik douchte snel', 'ik at een boterham', 'ik fietste naar school'],
    ['de hond zag een kat', 'hij rende door de tuin', 'hij sprong over het hek', 'hij was weg'], ['oma bakte een taart', 'ik mocht helpen', 'we deden er aardbeien op', 'de taart was heerlijk'],
    ['het begon te regenen', 'we schuilden onder een boom', 'het ging onweren', 'we renden naar huis'], ['Sara kocht een kaartje', 'ze stapte in de trein', 'ze ging bij het raam zitten', 'ze las een boek'],
    ['de leraar kwam binnen', 'hij legde zijn tas op tafel', 'hij schreef de opdracht op het bord', 'we begonnen te werken'], ['mijn fiets had een lekke band', 'ik moest lopen', 'ik kwam te laat', 'de mentor was boos'],
    ['we kwamen bij de dierentuin', 'we kochten kaartjes', 'we gingen eerst naar de apen', 'daarna aten we patat'], ['de wekker ging niet af', 'ik sliep door', 'ik miste de bus', 'mijn vader bracht me met de auto'],
    ['het was feest', 'de muziek stond hard', 'iedereen danste', 'de buren klaagden'], ['ik opende mijn tas', 'mijn boek zat er niet in', 'ik had het thuis laten liggen', 'ik moest het lenen'],
    ['we liepen door het bos', 'we zagen een hert', 'het hert keek ons aan', 'het rende weg'], ['de trein stopte', 'de deuren gingen open', 'veel mensen stapten uit', 'wij stapten in'] ];
  /* fout, goed, met de betekenis omgedraaid, de twee ontkenningen, welke blijft */
  var ONT = [ ['Ik heb nooit geen tijd', 'Ik heb nooit tijd', 'Ik heb altijd tijd', 'nooit', 'geen'], ['Er was nergens geen plek', 'Er was nergens plek', 'Er was overal plek', 'nergens', 'geen'],
    ['Niemand heeft niks gezegd', 'Niemand heeft iets gezegd', 'Iedereen heeft iets gezegd', 'niemand', 'niks'], ['Hij zegt nooit niks', 'Hij zegt nooit iets', 'Hij zegt altijd iets', 'nooit', 'niks'],
    ['Zij heeft nergens geen zin in', 'Zij heeft nergens zin in', 'Zij heeft overal zin in', 'nergens', 'geen'], ['Er kwam niemand niet', 'Er kwam niemand', 'Iedereen kwam', 'niemand', 'niet'],
    ['Hij heeft nooit geen geld', 'Hij heeft nooit geld', 'Hij heeft altijd geld', 'nooit', 'geen'], ['Niemand heeft geen huiswerk gemaakt', 'Niemand heeft huiswerk gemaakt', 'Iedereen heeft huiswerk gemaakt', 'niemand', 'geen'],
    ['We hebben niemand niks verteld', 'We hebben niemand iets verteld', 'We hebben iedereen iets verteld', 'niemand', 'niks'], ['Ze eet nooit geen groente', 'Ze eet nooit groente', 'Ze eet altijd groente', 'nooit', 'geen'],
    ['Ik heb mijn sleutels nergens niet kunnen vinden', 'Ik heb mijn sleutels nergens kunnen vinden', 'Ik heb mijn sleutels gevonden', 'nergens', 'niet'],
    ['Niemand weet niks van de toets', 'Niemand weet iets van de toets', 'Iedereen weet iets van de toets', 'niemand', 'niks'], ['Ik ga nooit niet meer naar die winkel', 'Ik ga nooit meer naar die winkel', 'Ik ga vaak naar die winkel', 'nooit', 'niet'],
    ['Er is hier nergens geen wifi', 'Er is hier nergens wifi', 'Er is hier overal wifi', 'nergens', 'geen'], ['Hij heeft nooit niemand geholpen', 'Hij heeft nooit iemand geholpen', 'Hij heeft iedereen geholpen', 'nooit', 'niemand'] ];
  var NEG = ['niet', 'geen', 'nooit', 'niemand', 'niks', 'niets', 'nergens'];
  var HH = [ ['Morgen hebben ' + GAT + ' een toets.', 'zij'], ['Gisteren gingen ' + GAT + ' naar de film.', 'zij'], ['Mijn buren zijn op vakantie, maar zondag komen ' + GAT + ' terug.', 'zij'],
    ['Weet jij of ' + GAT + ' ook komen?', 'zij'], ['De spelers waren moe, want ' + GAT + ' hadden hard gelopen.', 'zij'], ['Wonen ' + GAT + ' al lang in Rotterdam?', 'zij'],
    ['Ik ga met ' + GAT + ' naar het strand.', 'hen'], ['Dit cadeau is voor ' + GAT + '.', 'hen'], ['Ik heb ' + GAT + ' gisteren gezien.', 'hen'], ['We wachten op ' + GAT + '.', 'hen'],
    ['De juf heeft ' + GAT + ' geholpen.', 'hen'], ['Ik zat naast ' + GAT + ' in de bus.', 'hen'], ['Kun je ' + GAT + ' even bellen?', 'hen'], ['Zonder ' + GAT + ' was het saai.', 'hen'],
    ['Waar staan ' + GAT + ' fietsen?', 'hun'], ['Mijn neven vergaten ' + GAT + ' jassen.', 'hun'], ['De kinderen pakten ' + GAT + ' tassen.', 'hun'], ['Ik ken ' + GAT + ' ouders niet.', 'hun'],
    ['De buren hebben ' + GAT + ' huis geverfd.', 'hun'], ['Waar is ' + GAT + ' hond?', 'hun'] ];
  var HHROL = { zij:'het is het onderwerp', hen:'het staat na een voorzetsel of is lijdend voorwerp', hun:'het zegt van wie iets is' };
  var HZ = [ ['Het bedrijf heeft ' + GAT + ' winst verdubbeld.', 'het bedrijf', 'het'], ['Het team vierde ' + GAT + ' overwinning.', 'het team', 'het'], ['Het museum opent ' + GAT + ' deuren om tien uur.', 'het museum', 'het'],
    ['Het land heeft ' + GAT + ' grenzen gesloten.', 'het land', 'het'], ['Het orkest speelde ' + GAT + ' mooiste stuk.', 'het orkest', 'het'], ['Het restaurant heeft ' + GAT + ' menukaart veranderd.', 'het restaurant', 'het'],
    ['Het ziekenhuis opent ' + GAT + ' nieuwe kinderafdeling.', 'het ziekenhuis', 'het'],
    ['Mijn zus zoekt ' + GAT + ' telefoon.', 'mijn zus', 'v'], ['De juf pakt ' + GAT + ' tas.', 'de juf', 'v'], ['Oma viert ' + GAT + ' verjaardag.', 'oma', 'v'], ['Sara fietst met ' + GAT + ' vriendin naar school.', 'Sara', 'v'],
    ['Mijn opa leest ' + GAT + ' krant.', 'mijn opa', 'm'], ['Tim is ' + GAT + ' sleutels kwijt.', 'Tim', 'm'], ['Meneer Bakker opent ' + GAT + ' winkel om zeven uur.', 'meneer Bakker', 'm'],
    ['De leerlingen pakken ' + GAT + ' boeken.', 'de leerlingen', 'mv'], ['Mijn ouders verkopen ' + GAT + ' auto.', 'mijn ouders', 'mv'], ['De spelers krijgen ' + GAT + ' nieuwe shirts.', 'de spelers', 'mv'],
    ['De buren laten ' + GAT + ' hond uit.', 'de buren', 'mv'] ];
  var HZCAT = { m:'een man of jongen', v:'een vrouw of meisje', mv:'meer mensen of dingen (meervoud)', het:'één ding of groep met "het"' };
  var HZANT = { m:'zijn', v:'haar', mv:'hun', het:'zijn' };
  /* fout, goed, de twee uitdrukkingen, nog een foute zin */
  var CON = [ ['Ze zijn allebei beide ziek.', 'Ze zijn allebei ziek.', 'allebei + beide', 'Ze zijn allebeide ziek.'],
    ['Volgens mij vind ik dat een goed plan.', 'Ik vind dat een goed plan.', 'volgens mij + ik vind', 'Volgens mij vind dat een goed plan.'],
    ['Qua het eten wat betreft was het prima.', 'Qua eten was het prima.', 'qua + wat betreft', 'Qua het eten was het wat prima.'],
    ['Dat doet niet uit.', 'Dat maakt niet uit.', 'dat maakt niet uit + dat doet er niet toe', 'Dat doet er niet uit.'],
    ['De reden is omdat ik ziek was.', 'De reden is dat ik ziek was.', 'de reden is dat + omdat', 'De reden is want ik ziek was.'],
    ['Deze mail betreft over de excursie.', 'Deze mail gaat over de excursie.', 'het betreft + het gaat over', 'Deze mail gaat betreft de excursie.'],
    ['Zowel Tim als ook Sara doen mee.', 'Zowel Tim als Sara doen mee.', 'zowel ... als + niet alleen ... maar ook', 'Zowel Tim maar ook Sara doen mee.'],
    ['Daar heb ik geen behoefte in.', 'Daar heb ik geen behoefte aan.', 'behoefte aan + zin in', 'Daar heb ik geen behoefte op.'],
    ['Volgens mijn moeder zegt ze dat het gaat regenen.', 'Volgens mijn moeder gaat het regenen.', 'volgens mijn moeder + mijn moeder zegt', 'Volgens mijn moeder zegt het dat het gaat regenen.'],
    ['Wegens het feit omdat het regende, ging de wedstrijd niet door.', 'Omdat het regende, ging de wedstrijd niet door.', 'wegens het feit dat + omdat', 'Wegens omdat het regende, ging de wedstrijd niet door.'],
    ['Ik ben het ermee eens met jou.', 'Ik ben het met jou eens.', 'het ermee eens zijn + het met iemand eens zijn', 'Ik ben het eens ermee met jou.'],
    ['Dat hangt ervan af van het weer.', 'Dat hangt af van het weer.', 'het hangt ervan af + het hangt af van', 'Dat hangt ervan van het weer.'],
    ['Mijn mening is dat ik vind dat school later moet beginnen.', 'Ik vind dat school later moet beginnen.', 'mijn mening is + ik vind', 'Mijn mening vind ik dat school later moet beginnen.'],
    ['In mijn ogen vind ik het te duur.', 'In mijn ogen is het te duur.', 'in mijn ogen + ik vind', 'In mijn ogen vind het te duur.'],
    ['Hij lijkt sprekend op zijn vader als twee druppels water.', 'Hij lijkt sprekend op zijn vader.', 'sprekend lijken op + lijken als twee druppels water', 'Hij lijkt sprekend als zijn vader.'] ];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'schrijf-zin', niveau:'1F', domein:'schrijven', naam:'Goede zinnen', uit:'Een goede zin is duidelijk en klopt. Hier oefen je wat in zinnen vaak misgaat: jou en jouw, verwijswoorden, vergelijkingen, voegwoorden, woordvolgorde, lange zinnen, ontkenningen en uitdrukkingen die door elkaar lopen.' },
      doelen:[
        { id:'schrijf-zin-jouw', naam:'Jou of jouw', kort:'Past mijn, dan is het jouw; past mij, dan is het jou',
          uit:'<p><b>Jouw</b> zegt dat iets van iemand is: <i>jouw fiets</i>. <b>Jou</b> gebruik je in alle andere gevallen: <i>voor jou, ik zie jou</i>.</p><p>Het trucje: zet <b>mij</b> of <b>mijn</b> op de plek. Past <i>mijn</i>, dan schrijf je <i>jouw</i>. Past <i>mij</i>, dan schrijf je <i>jou</i>.</p>',
          wanneer:'je twijfelt tussen jou en jouw.',
          maak:function(R){
            var x = R.kies(JOUW), van = x[1] === 1;
            return af({ vraag:x[0], context:'Jou of jouw?',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0].replace(GAT, van ? 'jouw' : 'jou'), k:van ? 2 : 1, label:van ? 'van jou: jouw' : 'jou' }]) : ''; },
              stappen:[
                V('Zet "mij" of "mijn" op de plek van het gat. Wat past?', ['mij', 'mijn'], van ? 1 : 0, 'Lees de zin twee keer: één keer met mij, één keer met mijn. Welke klinkt goed?'),
                V('Jou of jouw?', ['jou', 'jouw'], van ? 1 : 0, 'Past mijn, dan schrijf je jouw. Past mij, dan schrijf je jou.') ] });
          } },
        { id:'schrijf-zin-dietdat', naam:'Die of dat', kort:'Bij een het-woord schrijf je dat, bij een de-woord en bij meervoud die',
          uit:'<p>Met <b>die</b> en <b>dat</b> verwijs je terug naar een woord: <i>het boek dat ik lees</i>, <i>de fiets die ik kocht</i>.</p><p>Kijk naar het lidwoord van dat woord. <b>Het</b>-woord: <b>dat</b>. <b>De</b>-woord: <b>die</b>. Meervoud krijgt altijd <i>de</i>, dus ook <b>die</b>: <i>de boeken die op tafel liggen</i>.</p>',
          wanneer:'je in een zin terugverwijst naar iets of iemand.',
          maak:function(R){
            var x = R.kies(DD), w = x[0].split(' '), lw = w[0].toLowerCase(), n = w[1], mv = MV.indexOf(n) >= 0, ans = lw === 'het' ? 'dat' : 'die';
            var zin = x[0] + ' ' + GAT + ' ' + x[1];
            return af({ vraag:zin, context:'Die of dat?',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0], k:1, label:lw + '-woord' + (mv ? ', meervoud' : '') }, { t:ans, k:2, label:'verwijst terug' }, x[1]]) : ''; },
              stappen:[
                { tekst:'Naar welk woord verwijst het gat?', antwoord:[n, x[0].toLowerCase()], hint:'Het woord dat vlak voor het gat staat.' },
                V('Welk lidwoord hoort bij "' + n + '"?', ['de', 'het'], lw, mv ? 'Meervoud krijgt altijd de.' : 'Zeg het hardop: de ' + n + ' of het ' + n + '?'),
                V('Die of dat?', ['die', 'dat'], ans, 'Het-woord: dat. De-woord of meervoud: die.') ] });
          } },
        { id:'schrijf-zin-vergelijken', naam:'Groter dan, even groot als', kort:'Na een woord op -er en na anders komt dan; na even, net zo en zo komt als',
          uit:'<p>Zijn twee dingen <b>niet gelijk</b>, dan gebruik je <b>dan</b>: <i>groter dan, zwaarder dan, anders dan, meer dan</i>.</p><p>Zijn twee dingen <b>gelijk</b>, dan gebruik je <b>als</b>: <i>even groot als, net zo snel als, zo sterk als</i>.</p><p>Het trucje: staat er even, net zo of zo, dan komt er als.</p>',
          wanneer:'je twee dingen of mensen met elkaar vergelijkt.',
          maak:function(R){
            var x = R.kies(VGL), gelijk = x[1] === 'als';
            return af({ vraag:x[0], context:'Dan of als?',
              stappen:[
                V('Wat voor vergelijking is het?', ['ze zijn niet gelijk', 'ze zijn gelijk'], gelijk ? 1 : 0, 'Kijk naar de woorden voor het gat. Een woord op -er (groter, zwaarder), meer, minder of anders: niet gelijk. Even, net zo of zo: gelijk.'),
                V('Welk woord past?', ['dan', 'als'], x[1], 'Niet gelijk: dan. Gelijk: als.', { fout:gelijk ? { dan:'Er staat even, net zo of zo. Dan zijn ze gelijk en schrijf je als.' } : { als:'Ze zijn niet gelijk. Na groter, meer of anders komt dan.' } }) ] });
          } },
        { id:'schrijf-zin-voegwoord', naam:'Het juiste voegwoord', kort:'Kies het voegwoord dat past bij het verband en bij de woordvolgorde',
          uit:'<p>Met een <b>voegwoord</b> verbind je twee zinnen. Elk voegwoord heeft een eigen verband: <i>omdat</i> en <i>want</i> geven een <b>reden</b>, <i>maar</i> een <b>tegenstelling</b>, <i>zodat</i> een <b>gevolg</b> en <i>terwijl</i> iets wat <b>tegelijk</b> gebeurt.</p><p>Ook de woordvolgorde helpt. Na <i>want</i> en <i>maar</i> volgt een gewone zin: <i>want ik ben ziek</i>. Na <i>omdat, zodat</i> en <i>terwijl</i> staat de persoonsvorm achteraan: <i>omdat ik ziek ben</i>.</p>',
          wanneer:'je twee zinnen aan elkaar wilt maken en twijfelt welk woord ertussen moet.',
          maak:function(R){
            var x = R.kies(VW), vw = x[2], hoofdzin = vw === 'want' || vw === 'maar';
            return af({ vraag:x[0] + ' ' + GAT + ' ' + x[1] + '.', context:'Welk voegwoord past op de plek van het gat?',
              beeld:function(k){ return k >= 3 ? R.teken.zin([{ t:x[0], k:1, label:'zin 1' }, { t:vw, k:2, label:VWVB[vw] }, { t:x[1] + '.', k:3, label:'zin 2' }]) : ''; },
              stappen:[
                K(R, 'Wat is het verband tussen de twee stukken?', VWVB[vw], trek(R, ['een reden', 'een tegenstelling', 'een gevolg of doel', 'iets wat tegelijk gebeurt'], 2, VWVB[vw]), 'Lees beide stukken. Is het tweede de reden, het gevolg, een tegenstelling of iets wat op hetzelfde moment gebeurt?'),
                V('Kijk naar het tweede stuk: "' + x[1] + '". Waar staat de persoonsvorm?', ['vooraan, vlak na het onderwerp', 'achteraan'], hoofdzin ? 0 : 1, 'Zoek het werkwoord dat verandert als je de tijd verandert. Staat het direct na het onderwerp of helemaal aan het eind?'),
                K(R, 'Welk voegwoord past?', vw, VWAF[vw], hoofdzin ? 'Persoonsvorm vooraan: dan past want of maar.' : 'Persoonsvorm achteraan: dan past omdat, zodat of terwijl.') ] });
          } },
        { id:'schrijf-zin-volgorde', naam:'Woordvolgorde na een voegwoord', kort:'Na omdat, dat, of, als en toen gaat de persoonsvorm naar het eind',
          uit:'<p>Na veel voegwoorden verandert de <b>woordvolgorde</b>. Na <i>omdat, dat, of, als, toen, terwijl, hoewel</i> en <i>zodat</i> gaat de <b>persoonsvorm naar achteren</b>: <i>omdat ik moe ben</i>, niet <i>omdat ik ben moe</i>.</p><p>Na <i>want</i> en <i>maar</i> blijft alles zoals in een gewone zin: <i>want ik ben moe</i>.</p>',
          wanneer:'je een zin maakt met omdat, dat, of of als.',
          maak:function(R){
            var x = R.kies(VO), hz = x[1] === 'want' || x[1] === 'maar';
            var bij = x[1] + ' ' + x[2] + ' ' + x[4] + ' ' + x[3], hoofdz = x[1] + ' ' + x[2] + ' ' + x[3] + ' ' + x[4], om = x[1] + ' ' + x[3] + ' ' + x[2] + ' ' + x[4];
            var sep = hz ? ', ' : ' ', goed = x[0] + sep + (hz ? hoofdz : bij) + '.', fout = x[0] + sep + (hz ? bij : hoofdz) + '.';
            return af({ vraag:x[0] + (hz ? ', ' : ' ') + x[1] + ' …', context:'Hoe gaat de zin goed verder?',
              stappen:[
                V('Gaat na "' + x[1] + '" de persoonsvorm naar achteren?', ['ja', 'nee'], hz ? 1 : 0, 'Na want en maar volgt een gewone zin. Na omdat, dat, of, als, toen, terwijl, hoewel en zodat gaat de persoonsvorm naar achteren.'),
                { tekst:'Wat is de persoonsvorm in het tweede stuk?', antwoord:x[3], hint:'Het werkwoord dat hoort bij "' + x[2] + '".' },
                K(R, 'Welke zin is goed?', goed, [fout, x[0] + sep + om + '.'], hz ? 'Na "' + x[1] + '" blijft de gewone volgorde: ' + hoofdz + '.' : 'Na "' + x[1] + '" staat "' + x[3] + '" achteraan.') ] });
          } },
        { id:'schrijf-zin-splitsen', naam:'Een te lange zin opsplitsen', kort:'Knip een lange en-en-en-zin bij een en tussen twee korte zinnen',
          uit:'<p>Een zin met steeds <i>en ... en ... en</i> is moeilijk te lezen. Maak er <b>kortere zinnen</b> van.</p><p>Tel eerst de persoonsvormen: elke persoonsvorm hoort bij een eigen korte zin. <b>Knip</b> dan bij een <i>en</i> tussen twee zinnen, zet er een punt en begin met een hoofdletter.</p><p>Knip nooit midden in een zin, en plak zinnen niet aan elkaar met alleen komma\'s.</p>',
          wanneer:'je merkt dat je zin maar doorgaat met en, en, en.',
          maak:function(R){
            var c = R.kies(KORT), lang = hoofd(c[0]) + ' en ' + c[1] + ' en ' + c[2] + ' en ' + c[3] + '.';
            var goed = hoofd(c[0]) + ' en ' + c[1] + '. ' + hoofd(c[2]) + ' en ' + c[3] + '.';
            var w = c[1].split(' '), knip = hoofd(c[0]) + ' en ' + w.slice(0, 2).join(' ') + '. ' + hoofd(w.slice(2).join(' ')) + ' en ' + c[2] + ' en ' + c[3] + '.';
            var komma = hoofd(c[0]) + ', ' + c[1] + ', ' + c[2] + ', ' + c[3] + '.';
            return af({ vraag:lang, context:'Deze zin is te lang. Welke versie is goed gesplitst?',
              beeld:function(k){ return k >= 1 ? R.teken.zin(c.map(function(z, i){ return { t:i ? z : hoofd(z), k:i + 1, label:'zin ' + (i + 1) }; })) : ''; },
              stappen:[
                { tekst:'Uit hoeveel korte zinnen bestaat deze lange zin?', antwoord:'4', hint:'Tel de persoonsvormen: elke korte zin heeft er één.', fout:{ '3':'Kijk nog eens: na elke "en" begint een nieuwe korte zin.' } },
                K(R, 'Waar mag je knippen?', 'bij een "en" tussen twee korte zinnen', ['midden in een korte zin', 'nergens, de zin is goed zo'], 'Een korte zin moet heel blijven. Knip op de plek waar de ene zin ophoudt en de volgende begint.'),
                K(R, 'Welke versie is goed?', goed, [knip, komma], 'Elke zin is heel, en twee hele zinnen plak je niet met alleen een komma aan elkaar.') ] });
          } },
        { id:'schrijf-zin-ontkenning', naam:'Geen dubbele ontkenning', kort:'Gebruik maar één ontkenning, anders zeg je het omgekeerde',
          uit:'<p>Woorden als <i>niet, geen, nooit, niemand, niks</i> en <i>nergens</i> zijn <b>ontkenningen</b>. Gebruik er maar <b>één</b> tegelijk.</p><p><i>Ik heb nooit geen tijd</i> is fout. Twee ontkenningen heffen elkaar eigenlijk op. Goed is: <i>Ik heb nooit tijd.</i></p><p>Laat de eerste ontkenning staan. De tweede haal je weg, of je maakt hem gewoon: <i>niks</i> wordt <i>iets</i>, <i>niemand</i> wordt <i>iemand</i>.</p>',
          wanneer:'je een zin met nooit, niemand, nergens of niks schrijft.',
          maak:function(R){
            var x = R.kies(ONT), woorden = x[0].replace(/[.!?]/, '').split(' ').filter(function(w){ return NEG.indexOf(w.toLowerCase()) < 0; });
            var a = R.kies(woorden).toLowerCase(), b = ander(R, woorden, a).toLowerCase();
            if (a === b) b = woorden[0].toLowerCase() === a ? woorden[woorden.length - 1].toLowerCase() : woorden[0].toLowerCase();
            return af({ vraag:x[0] + '.', context:'In deze zin staan twee ontkenningen. Kies de goede zin.',
              stappen:[
                K(R, 'Welke twee woorden zijn ontkenningen?', x[3] + ' en ' + x[4], [x[3] + ' en ' + a, b + ' en ' + x[4]], 'Ontkenningen zijn woorden als niet, geen, nooit, niemand, niks en nergens.'),
                V('Welke ontkenning laat je staan?', [x[3], x[4]], 0, 'Laat de eerste ontkenning staan. De tweede haal je weg of maak je gewoon.'),
                K(R, 'Welke zin is goed?', x[1] + '.', [x[0] + '.', x[2] + '.'], 'Eén ontkenning, en de betekenis blijft hetzelfde. Twee ontkenningen heffen elkaar op.') ] });
          } },
        { id:'schrijf-zin-hunhen', naam:'Zij, hen of hun', kort:'Zij is het onderwerp, hen staat na een voorzetsel of is lijdend voorwerp, hun is van hen',
          uit:'<p>Verwijs je naar meer mensen, dan kies je tussen <b>zij</b>, <b>hen</b> en <b>hun</b>.</p><p><b>Zij</b> is het onderwerp: <i>Morgen hebben zij een toets.</i> (Nooit: <i>hun hebben</i>.)<br><b>Hen</b> staat na een voorzetsel of is lijdend voorwerp: <i>met hen, ik zie hen</i>.<br><b>Hun</b> zegt van wie iets is: <i>hun fietsen</i>.</p>',
          wanneer:'je in een formele tekst naar een groep mensen verwijst.',
          maak:function(R){
            var x = R.kies(HH), a = x[1];
            return af({ vraag:x[0], context:'Zij, hen of hun?',
              beeld:function(k){ return k >= 2 ? R.teken.zin([{ t:x[0].replace(GAT, a), k:a === 'zij' ? 1 : a === 'hen' ? 2 : 3, label:a }]) : ''; },
              stappen:[
                K(R, 'Wat doet het woord op de plek van het gat?', HHROL[a], waarden(HHROL, a), a === 'zij' ? 'Vraag: wie doet hier iets? Dat is het onderwerp.' : a === 'hen' ? 'Staat er een voorzetsel voor het gat, zoals met, voor, op of naast? Of ondergaat de groep de handeling?' : 'Staat er na het gat iets wat van de groep is?'),
                K(R, 'Welk woord past?', a, waarden({ zij:'zij', hen:'hen', hun:'hun' }, a), 'Onderwerp: zij. Na een voorzetsel of lijdend voorwerp: hen. Van wie iets is: hun.', { fout:a === 'zij' ? { hun:'Hun kan nooit het onderwerp zijn. Het onderwerp is zij.' } : null }) ] });
          } },
        { id:'schrijf-zin-haarzijn', naam:'Zijn, haar of hun', kort:'Verwijs met het goede bezittelijk woord: een team of bedrijf is zijn, niet hun',
          uit:'<p>Het woord dat zegt van wie iets is, moet passen bij het woord waar het naar verwijst.</p><p>Een man of jongen: <b>zijn</b>. Een vrouw of meisje: <b>haar</b>. Meer mensen: <b>hun</b>.</p><p>Let op bij een groep met <b>het</b>, zoals <i>het team</i> of <i>het bedrijf</i>. Dat is één ding, dus: <i>Het team vierde <b>zijn</b> overwinning</i>, niet <i>hun</i>.</p>',
          wanneer:'je schrijft over een bedrijf, een team of een groep mensen.',
          maak:function(R){
            var x = R.kies(HZ), c = x[2], ans = HZANT[c], andere = trek(R, HZ.map(function(h){ return h[1]; }), 2, x[1]);
            return af({ vraag:x[0], context:'Zijn, haar of hun?',
              stappen:[
                K(R, 'Naar wie of wat verwijst het woord op de plek van het gat?', x[1], andere, 'Zoek het onderwerp van de zin.'),
                K(R, 'Wat voor woord is "' + x[1] + '"?', HZCAT[c], waarden(HZCAT, c), c === 'het' ? 'Zeg het met het lidwoord: ' + x[1] + '. Het is één ding of één groep.' : 'Is het een man, een vrouw, of zijn het er meer?'),
                K(R, 'Welk woord past?', ans, waarden({ zijn:'zijn', haar:'haar', hun:'hun' }, ans), 'Man of het-woord: zijn. Vrouw: haar. Meervoud: hun.', { fout:c === 'het' ? { hun:'"' + hoofd(x[1]) + '" is één ding met het. Dan schrijf je zijn, niet hun.' } : null }) ] });
          } },
        { id:'schrijf-zin-contaminatie', naam:'Uitdrukkingen niet door elkaar', kort:'Haal twee uitdrukkingen niet door elkaar: kies er één',
          uit:'<p>Soms lopen twee goede uitdrukkingen door elkaar. Dat heet een <b>contaminatie</b>. <i>Ze zijn allebei beide ziek</i> komt van <i>allebei</i> en <i>beide</i>.</p><p>Herken de twee uitdrukkingen en <b>kies er één</b>: <i>Ze zijn allebei ziek.</i></p><p>Bekende voorbeelden: <i>volgens mij vind ik</i>, <i>de reden is omdat</i>, <i>qua ... wat betreft</i> en <i>zowel ... als ook</i>.</p>',
          wanneer:'een zin dubbel klinkt, alsof je hetzelfde twee keer zegt.',
          maak:function(R){
            var x = R.kies(CON), andere = trek(R, CON.map(function(c){ return c[2]; }), 2, x[2]);
            return af({ vraag:x[0], context:'In deze zin zijn twee uitdrukkingen door elkaar gehaald. Kies de goede zin.',
              stappen:[
                K(R, 'Welke twee uitdrukkingen zijn hier door elkaar gehaald?', x[2], andere, 'Welke woorden in de zin zeggen eigenlijk twee keer hetzelfde?'),
                K(R, 'Welke zin is goed?', x[1], [x[0], x[3]], 'Kies één van de twee uitdrukkingen en laat de andere weg.') ] });
          } }
      ] }
  ]);

  /* ================= de alinea ================= */
  /* kernzin, uitwerking 1, uitwerking 2, slotzin, zin die er niet in hoort, onderwerp */
  var AL = [
    ['Een hond is een goed huisdier voor een gezin.', 'Ten eerste is een hond trouw en speels.', 'Bovendien zorgt hij ervoor dat je elke dag buiten komt.', 'Kortom, met een hond heb je er een echte vriend bij.', 'Katten slapen ongeveer zestien uur per dag.', 'een hond als huisdier'],
    ['Fietsen naar school is gezond.', 'Ten eerste beweeg je elke dag een half uur.', 'Daarnaast krijg je frisse lucht, waardoor je beter kunt opletten in de les.', 'Daarom is fietsen een goede manier om naar school te gaan.', 'Een nieuwe fiets kost al snel vijfhonderd euro.', 'fietsen naar school'],
    ['Water drinken is belangrijk voor je lichaam.', 'Ten eerste bestaat je lichaam voor meer dan de helft uit water.', 'Bovendien kun je je slechter concentreren als je te weinig drinkt.', 'Drink dus elke dag genoeg water.', 'Cola werd meer dan honderd jaar geleden in Amerika bedacht.', 'water drinken'],
    ['Een schooluniform heeft voordelen.', 'Ten eerste ziet iedereen er hetzelfde uit, zodat niemand wordt gepest om zijn kleding.', 'Daarnaast hoef je \'s ochtends niet na te denken over wat je aantrekt.', 'Kortom, een uniform maakt het schoolleven makkelijker.', 'In Engeland drinken veel mensen thee met melk.', 'een schooluniform'],
    ['Lezen is goed voor je taal.', 'Ten eerste leer je veel nieuwe woorden als je leest.', 'Ten tweede zie je steeds hoe woorden goed geschreven worden.', 'Wie veel leest, wordt dus beter in taal.', 'De bibliotheek in onze stad is op zondag gesloten.', 'lezen'],
    ['Huiswerk maken kun je het best op een vast moment doen.', 'Ten eerste wordt het dan een gewoonte.', 'Bovendien vergeet je het dan minder snel.', 'Kies dus een vaste tijd, bijvoorbeeld meteen na het eten.', 'Veel leerlingen hebben een eigen laptop.', 'huiswerk maken'],
    ['Afval scheiden is goed voor het milieu.', 'Ten eerste kun je van oud papier weer nieuw papier maken.', 'Daarnaast kun je van oud plastic weer nieuwe spullen maken.', 'Kortom, wie afval scheidt, helpt de aarde.', 'De vuilniswagen komt bij ons op dinsdag.', 'afval scheiden'],
    ['Ontbijten is belangrijk.', 'Ten eerste krijg je energie voor de ochtend.', 'Bovendien kun je dan beter opletten in de les.', 'Sla je ontbijt dus nooit over.', 'Mijn lievelingseten is pizza.', 'ontbijten'],
    ['Sporten in een team heeft veel voordelen.', 'Ten eerste leer je samenwerken.', 'Daarnaast maak je nieuwe vrienden.', 'Daarom is een teamsport een goede keuze.', 'Een voetbalveld is ongeveer honderd meter lang.', 'sporten in een team'],
    ['Te veel op je telefoon zitten is niet goed voor je.', 'Ten eerste slaap je slechter als je laat nog op je scherm kijkt.', 'Bovendien heb je minder tijd voor vrienden en sport.', 'Leg je telefoon dus op tijd weg.', 'De eerste mobiele telefoon was zo groot als een baksteen.', 'je telefoon'],
    ['Een moestuin op school is een goed idee.', 'Ten eerste leren leerlingen hoe groente groeit.', 'Daarnaast kunnen ze de groente zelf opeten.', 'Kortom, met een moestuin leer je ook buiten de klas.', 'Onze school heeft drie verdiepingen.', 'een moestuin op school'],
    ['Vrijwilligerswerk is leerzaam.', 'Ten eerste leer je omgaan met allerlei mensen.', 'Bovendien kun je het later op je cv zetten.', 'Vrijwilligerswerk is dus goed voor jezelf en voor anderen.', 'Mijn buurman heeft een nieuwe auto gekocht.', 'vrijwilligerswerk'],
    ['Op tijd naar bed gaan is slim.', 'Ten eerste groeit je lichaam vooral als je slaapt.', 'Daarnaast onthoud je beter wat je overdag hebt geleerd.', 'Ga dus op tijd slapen, vooral voor een toets.', 'Sommige mensen dromen in kleur.', 'slapen'],
    ['Met de trein reizen is beter voor het milieu dan met de auto.', 'Ten eerste stoot een trein per reiziger veel minder uit.', 'Bovendien staan er minder auto\'s in de file als meer mensen de trein nemen.', 'Kortom, wie de trein neemt, helpt het milieu.', 'Op het station kun je ook koffie kopen.', 'de trein'],
    ['Een spreekbeurt goed voorbereiden is belangrijk.', 'Ten eerste weet je dan precies wat je wilt vertellen.', 'Daarnaast ben je minder zenuwachtig als je goed hebt geoefend.', 'Begin dus op tijd met je voorbereiding.', 'Mijn klas heeft dertig leerlingen.', 'een spreekbeurt'] ];
  function alAnder(R, a){ return ander(R, AL, a); }
  /* zin 1, zin 2 (na het signaalwoord), signaalwoord */
  var SG = [ ['Het regende de hele dag', 'bleven we binnen', 'Daarom'], ['Ik had mijn huiswerk niet af', 'kreeg ik strafwerk', 'Daarom'], ['De bus was te laat', 'kwam ik niet op tijd', 'Daarom'],
    ['Hij had slecht geslapen', 'was hij moe in de les', 'Daarom'],
    ['Het was ijskoud', 'gingen we naar het strand', 'Toch'], ['Ik had goed geleerd', 'haalde ik een onvoldoende', 'Toch'], ['De film had slechte recensies', 'vond ik hem leuk', 'Toch'],
    ['Ze was erg moe', 'ging ze nog naar training', 'Toch'],
    ['Deze telefoon is goedkoop', 'is de batterij erg goed', 'Bovendien'], ['Fietsen is gezond', 'is het goed voor het milieu', 'Bovendien'], ['Het hotel was erg schoon', 'was het personeel heel vriendelijk', 'Bovendien'],
    ['Onze trainer is heel aardig', 'legt hij alles goed uit', 'Bovendien'],
    ['Veel dieren houden een winterslaap', 'slaapt de egel van november tot maart', 'Zo'], ['In Nederland zijn veel musea', 'kun je in Amsterdam naar het Rijksmuseum', 'Zo'],
    ['Je kunt op veel manieren sporten', 'kun je zwemmen, fietsen of hardlopen', 'Zo'], ['Sommige woorden komen uit het Engels', 'zeggen we computer en weekend', 'Zo'],
    ['Eerst maakten we ons huiswerk', 'gingen we buiten spelen', 'Daarna'], ['We aten eerst soep', 'kregen we pannenkoeken', 'Daarna'], ['De les begon met een filmpje', 'moesten we vragen maken', 'Daarna'],
    ['Eerst kook je het water', 'doe je de pasta erin', 'Daarna'] ];
  var SGVB = { Daarom:'oorzaak en gevolg', Toch:'een tegenstelling', Bovendien:'er komt nog iets bij', Zo:'een voorbeeld', Daarna:'de volgorde in tijd' };
  var SGAF = { Daarom:['Toch', 'Zo'], Toch:['Daarom', 'Bovendien'], Bovendien:['Daarom', 'Daarna'], Zo:['Toch', 'Daarna'], Daarna:['Toch', 'Zo'] };
  var ROL = ['de kernzin', 'een zin uit de uitwerking', 'een zin uit de uitwerking', 'de slotzin'];
  var SIGROL = ['geen signaalwoord', 'een opsommend signaalwoord, zoals ten eerste of bovendien', 'een opsommend signaalwoord, zoals ten eerste of bovendien', 'een signaalwoord van een conclusie, zoals kortom, dus of daarom'];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'schrijf-alinea', niveau:'2F', domein:'schrijven', naam:'Een alinea', uit:'Een alinea is een blokje tekst over één onderwerp. Hij heeft een kernzin, een uitwerking en een slotzin. Signaalwoorden houden de zinnen bij elkaar.' },
      doelen:[
        { id:'schrijf-alinea-delen', naam:'De drie delen van een alinea', kort:'Een alinea heeft een kernzin, een uitwerking en een slotzin',
          uit:'<p>Een goede alinea heeft drie delen. De <b>kernzin</b> zegt waar de alinea over gaat. Meestal is dat de eerste zin.</p><p>De <b>uitwerking</b> geeft uitleg, voorbeelden of redenen. Die zinnen beginnen vaak met <i>ten eerste, bovendien</i> of <i>daarnaast</i>.</p><p>De <b>slotzin</b> rondt af, vaak met <i>kortom, dus</i> of <i>daarom</i>.</p>',
          wanneer:'je een tekst leest of schrijft en wilt zien hoe een alinea is opgebouwd.',
          maak:function(R){
            var a = R.kies(AL), i = R.kies([0, 1, 2, 3]), zinnen = a.slice(0, 4);
            var tekst = blok(R, [zinnen.map(function(z, j){ return j === i ? '<mark>' + S(R, z) + '</mark>' : S(R, z); }).join(' ')]);
            return af({ vraag:a[i], vraagHtml:tekst, context:'Welke rol heeft de gemarkeerde zin in de alinea?',
              stappen:[
                K(R, 'Wat voor signaalwoord staat er in de zin?', SIGROL[i], [SIGROL[0], SIGROL[1], SIGROL[3]], 'Kijk naar woorden als ten eerste, bovendien, daarnaast, kortom, dus en daarom.'),
                K(R, 'Wat is deze zin dus?', ROL[i], ['de kernzin', 'een zin uit de uitwerking', 'de slotzin'], 'Geen signaalwoord en het onderwerp van de hele alinea: kernzin. Opsommend: uitwerking. Conclusie: slotzin.') ] });
          } },
        { id:'schrijf-alinea-kernzin', naam:'De kernzin', kort:'De kernzin zegt in één zin waar de hele alinea over gaat',
          uit:'<p>De <b>kernzin</b> is de belangrijkste zin van de alinea. Hij zegt waar <b>alle</b> zinnen over gaan.</p><p>Zoek eerst het onderwerp: waar gaan alle zinnen over? Kies dan de zin die dat onderwerp noemt én zegt wat de schrijver ervan vindt. Een losse feitje is geen kernzin.</p>',
          wanneer:'je een alinea schrijft of de hoofdgedachte van een alinea zoekt.',
          maak:function(R){
            var a = R.kies(AL), b = alAnder(R, a), c; do { c = alAnder(R, a); } while (c === b);
            var tekst = blok(R, ['<mark>…</mark> ' + S(R, a[1] + ' ' + a[2] + ' ' + a[3])]);
            return af({ vraag:a[1], vraagHtml:tekst, context:'Deze alinea mist de eerste zin: de kernzin. Welke kernzin past?',
              stappen:[
                K(R, 'Waar gaan alle zinnen over?', a[5], [b[5], c[5]], 'Lees de zinnen. Welk onderwerp komt in alle zinnen terug?'),
                K(R, 'Welke kernzin past?', a[0], [b[0], a[4]], 'De kernzin gaat over ' + a[5] + ' en zegt wat de schrijver daarvan vindt. Een los feitje is geen kernzin.') ] });
          } },
        { id:'schrijf-alinea-slot', naam:'De slotzin', kort:'De slotzin rondt af met een conclusie over het onderwerp, zonder iets nieuws',
          uit:'<p>De <b>slotzin</b> rondt de alinea af. Hij herhaalt de kern in andere woorden, als <b>conclusie</b>. Vaak begint hij met <i>kortom</i>, of staat er <i>dus</i> of <i>daarom</i> in.</p><p>In de slotzin komt <b>niets nieuws</b>: geen nieuw argument en geen nieuw onderwerp.</p>',
          wanneer:'je een alinea wilt afmaken.',
          maak:function(R){
            var a = R.kies(AL), b = alAnder(R, a);
            var tekst = blok(R, [S(R, a[0] + ' ' + a[1] + ' ' + a[2]) + ' <mark>…</mark>']);
            return af({ vraag:a[0], vraagHtml:tekst, context:'Deze alinea mist de slotzin. Welke slotzin past?',
              stappen:[
                K(R, 'Wat doet een slotzin?', 'de alinea afronden met een conclusie', ['een nieuw argument geven', 'een nieuw onderwerp beginnen'], 'De slotzin is het einde: hij vat samen wat je al hebt gezegd.'),
                K(R, 'Welke slotzin past?', a[3], [b[3], a[4]], 'Zoek de conclusie over ' + a[5] + '. Een zin over iets anders past niet.') ] });
          } },
        { id:'schrijf-alinea-volgorde', naam:'De goede volgorde', kort:'Kernzin eerst, dan de uitwerking in de goede volgorde, de slotzin als laatste',
          uit:'<p>Zet de zinnen van een alinea in de goede <b>volgorde</b>. Begin met de <b>kernzin</b>. Dan de <b>uitwerking</b>: signaalwoorden als <i>ten eerste</i> en <i>bovendien</i> laten zien wat eerst komt. Eindig met de <b>slotzin</b>.</p><p>Een zin met <i>bovendien</i> of <i>ten tweede</i> kan nooit vooraan staan: er moet al iets vóór zijn gezegd.</p>',
          wanneer:'je zinnen hebt bedacht en ze in een logische volgorde wilt zetten.',
          maak:function(R){
            var a = R.kies(AL), lt = R.hussel(['A', 'B', 'C', 'D']), L = function(i){ return lt[i]; };
            var regels = [0, 1, 2, 3].map(function(i){ return [lt[i], a[i]]; }).sort(function(p, q){ return p[0] < q[0] ? -1 : 1; });
            var tekst = blok(R, regels.map(function(r){ return '<b>' + r[0] + '.</b> ' + S(R, r[1]); }));
            var rij = function(v){ return v.map(L).join(', '); };
            return af({ vraag:regels.map(function(r){ return r[0] + r[1]; }).join(' '), vraagHtml:tekst, context:'Zet de zinnen in de goede volgorde.',
              stappen:[
                K(R, 'Welke zin is de kernzin?', 'zin ' + L(0), ['zin ' + L(1), 'zin ' + L(2), 'zin ' + L(3)], 'De kernzin noemt het onderwerp en heeft geen signaalwoord als ten eerste of kortom.'),
                K(R, 'Welke zin is de slotzin?', 'zin ' + L(3), ['zin ' + L(0), 'zin ' + L(1), 'zin ' + L(2)], 'Zoek de conclusie, met kortom, dus of daarom.'),
                K(R, 'Welke volgorde is goed?', rij([0, 1, 2, 3]), [rij([0, 2, 1, 3]), rij([1, 0, 2, 3])], 'Kernzin, dan ' + a[1].split(' ').slice(0, 2).join(' ') + ', dan ' + a[2].split(' ')[0] + ', en de slotzin als laatste.') ] });
          } },
        { id:'schrijf-alinea-signaal', naam:'Signaalwoorden kiezen', kort:'Een signaalwoord laat zien hoe twee zinnen met elkaar te maken hebben',
          uit:'<p><b>Signaalwoorden</b> laten zien wat het <b>verband</b> is tussen twee zinnen.</p><p><i>Daarom</i>: oorzaak en gevolg. <i>Toch</i>: een tegenstelling. <i>Bovendien</i>: er komt nog iets bij. <i>Zo</i>: een voorbeeld. <i>Daarna</i>: de volgorde in tijd.</p><p>Bedenk eerst het verband, kies dan het woord.</p>',
          wanneer:'je twee zinnen soepel aan elkaar wilt laten aansluiten.',
          maak:function(R){
            var x = R.kies(SG), w = x[2], vb = SGVB[w];
            return af({ vraag:x[0] + '. ' + GAT + ' ' + x[1] + '.', context:'Welk signaalwoord past op de plek van het gat?',
              stappen:[
                K(R, 'Wat is het verband tussen de twee zinnen?', vb, SGAF[w].map(function(a){ return SGVB[a]; }), 'Vraag je af: is de tweede zin een gevolg, een tegenstelling, iets extra, een voorbeeld of wat er daarna gebeurde?'),
                K(R, 'Welk signaalwoord past?', w, SGAF[w], 'Bij ' + vb + ' past "' + klein(w) + '".') ] });
          } },
        { id:'schrijf-alinea-weg', naam:'Wat hoort er niet in?', kort:'Elke zin in een alinea gaat over hetzelfde onderwerp',
          uit:'<p>Alle zinnen in een alinea gaan over <b>één onderwerp</b>. Een zin over iets anders hoort er <b>niet</b> in, ook al is hij waar of interessant.</p><p>Bepaal eerst het onderwerp met de kernzin. Kijk dan bij elke zin: gaat deze zin daarover?</p>',
          wanneer:'je je eigen tekst naleest en wilt schrappen wat er niet bij hoort.',
          maak:function(R){
            var a = R.kies(AL), b = alAnder(R, a), c; do { c = alAnder(R, a); } while (c === b);
            var plek = R.kies([2, 3]), zinnen = a.slice(0, 4); zinnen.splice(plek, 0, a[4]);
            var tekst = blok(R, [zinnen.map(function(z){ return S(R, z); }).join(' ')]);
            return af({ vraag:a[4], vraagHtml:tekst, context:'Eén zin hoort niet in deze alinea. Welke?',
              stappen:[
                K(R, 'Waar gaat de alinea over?', a[5], [b[5], c[5]], 'Lees de kernzin, de eerste zin.'),
                K(R, 'Welke zin hoort er niet in?', a[4], [a[1], a[2]], 'Zoek de zin die niet over ' + a[5] + ' gaat.') ] });
          } }
      ] }
  ]);

  /* ================= de e-mail ================= */
  var LEZER = [ ['Je mailt de gemeente over een kapotte lantaarnpaal in je straat.', 1], ['Je mailt een bedrijf waar je stage wilt lopen.', 1], ['Je mailt de klantenservice van een webwinkel over een kapotte koptelefoon.', 1],
    ['Je mailt de directeur van je school over een idee voor de kantine.', 1], ['Je mailt de secretaris van een sportclub waar je lid wilt worden.', 1], ['Je mailt de supermarkt waar je wilt solliciteren voor een bijbaan.', 1],
    ['Je mailt de eigenaar van een camping of er nog plek is.', 1], ['Je mailt een museum om een rondleiding voor je klas te vragen.', 1], ['Je mailt de bibliotheek over een boete.', 1], ['Je mailt de redactie van de krant over een artikel.', 1],
    ['Je mailt je beste vriend over het feest van zaterdag.', 0], ['Je mailt je oma om haar te bedanken voor je cadeau.', 0], ['Je mailt je neef over zijn verjaardag.', 0],
    ['Je mailt een klasgenoot over het huiswerk.', 0], ['Je mailt je teamgenoot van voetbal over de training.', 0], ['Je mailt je tante die in Spanje woont.', 0], ['Je mailt een vriendin die je op vakantie hebt leren kennen.', 0] ];
  /* beschrijving, formeel, naam voor de aanhef (heer/mevrouw + achternaam), voornaam */
  var AANH = [ ['Je mailt mevrouw Bakker van de dierentuin over een rondleiding.', 1, 'mevrouw Bakker', 'Anna'], ['Je mailt meneer De Vries, de eigenaar van de camping.', 1, 'heer De Vries', 'Peter'],
    ['Je mailt mevrouw Jansen van de bibliotheek over je boete.', 1, 'mevrouw Jansen', 'Els'], ['Je mailt meneer Peters van het bedrijf waar je stage wilt lopen.', 1, 'heer Peters', 'Mark'],
    ['Je mailt mevrouw El Amrani, de directeur van je school.', 1, 'mevrouw El Amrani', 'Samira'], ['Je mailt meneer Smit van de gemeente.', 1, 'heer Smit', 'Jan'],
    ['Je mailt de klantenservice van een webwinkel. Je weet niet wie je mail leest.', 1, '', ''], ['Je mailt een bedrijf om te vragen of ze een vakantiebaan hebben. Je kent geen naam.', 1, '', ''],
    ['Je mailt de gemeente over een kapotte stoep. Je weet niet wie je mail leest.', 1, '', ''],
    ['Je mailt je neef Daan over zijn verjaardag.', 0, '', 'Daan'], ['Je mailt je vriendin Sanne over het huiswerk.', 0, '', 'Sanne'], ['Je mailt je teamgenoot Mo over de wedstrijd.', 0, '', 'Mo'],
    ['Je mailt je tante Ellen om haar te bedanken.', 0, '', 'Ellen'], ['Je mailt je vriend Bram over de vakantie.', 0, '', 'Bram'] ];
  /* situatie, goede onderwerpregel, te vaag, te lang */
  var ONDW = [ ['Je bent morgen ziek en mailt je mentor.', 'Ziekmelding voor morgen', 'Hoi', 'Ik ben morgen ziek want ik heb koorts en ik blijf daarom de hele dag thuis'],
    ['Je wilt je aanmelden voor de schoolband.', 'Aanmelding schoolband', 'Vraagje', 'Ik wil graag meedoen met de schoolband want ik speel al drie jaar gitaar'],
    ['Je hebt een kapotte koptelefoon gekocht bij een webwinkel.', 'Klacht over kapotte koptelefoon', 'Help!!!', 'De koptelefoon die ik vorige week bij jullie heb gekocht doet het niet meer aan de linkerkant'],
    ['Je wilt stage lopen bij een dierenarts.', 'Vraag om een stageplek', 'Hallo', 'Ik ben een leerling uit de derde klas en ik wil graag twee weken bij u stage lopen'],
    ['Je vraagt de bibliotheek of je je boek langer mag houden.', 'Verlengen van een boek', 'Boek', 'Ik heb een boek geleend dat ik nog niet uit heb en ik wil het graag nog twee weken houden'],
    ['Je stuurt je werkstuk naar je docent geschiedenis.', 'Werkstuk geschiedenis klas 2B', 'Hier is het', 'In de bijlage zit mijn werkstuk over de Romeinen dat ik vrijdag moest inleveren'],
    ['Je wilt weten hoe laat de open dag begint.', 'Vraag over de open dag', 'Belangrijk!!', 'Ik wil graag weten hoe laat de open dag van jullie school begint en tot hoe laat hij duurt'],
    ['Je zegt af voor de training van zaterdag.', 'Afmelding training zaterdag', 'Sorry', 'Ik kan zaterdag niet naar de training komen want mijn oma is jarig en we gaan naar haar toe'],
    ['Je vraagt een museum om een rondleiding voor je klas.', 'Aanvraag rondleiding klas 2B', 'Museum', 'Onze klas wil graag in april een rondleiding in uw museum en ik wil vragen of dat kan'],
    ['Je solliciteert naar een bijbaan bij de supermarkt.', 'Sollicitatie bijbaan vakkenvuller', 'Baan', 'Ik zag uw advertentie en ik wil graag bij u komen werken als vakkenvuller op zaterdag'],
    ['Je mailt de gemeente over een kapotte lantaarnpaal.', 'Melding kapotte lantaarnpaal Dorpsstraat', 'Probleem', 'In onze straat is al twee weken een lantaarnpaal kapot en het is daardoor heel donker'],
    ['Je vraagt je mentor om een gesprek over je cijfers.', 'Verzoek om een gesprek over mijn cijfers', 'Even praten?', 'Ik wil graag een keer met u praten over mijn cijfers want die gaan niet zo goed'],
    ['Je vraagt de camping of er nog plek is in juli.', 'Vraag over een plek in juli', 'Camping', 'Wij willen in juli twee weken komen kamperen met vier personen en een tent'],
    ['Je wilt een fout in je rapport laten verbeteren.', 'Fout in mijn rapport', 'Rapport', 'Op mijn rapport staat bij Engels een 4 maar volgens mijn cijferlijst moet het een 6 zijn'],
    ['Je vraagt de sportschool wat een abonnement kost.', 'Vraag over de prijs van een abonnement', 'Info', 'Ik ben vijftien jaar en ik wil graag weten wat een abonnement bij jullie kost per maand'] ];
  /* aanleiding, kern, afsluiting */
  var MAIL = [ ['Ik schrijf u omdat ik mijn bestelling nog niet heb ontvangen.', 'Ik heb op 3 mei een koptelefoon besteld, maar het pakketje is nog niet bezorgd.', 'Kunt u mij laten weten wanneer het wordt bezorgd?'],
    ['Op uw website las ik dat u stagiairs zoekt.', 'Ik zit in de derde klas en ik wil graag twee weken bij u stage lopen in maart.', 'Ik hoop dat u mij wilt uitnodigen voor een gesprek.'],
    ['Ik mail u over de excursie naar Amsterdam van volgende week.', 'Ik heb een allergie voor noten en kan dus niet alles eten.', 'Wilt u hier rekening mee houden?'],
    ['Ik stuur deze mail omdat ik morgen niet op school kan zijn.', 'Ik moet om tien uur naar het ziekenhuis voor een controle.', 'Wilt u mij laten weten welk huiswerk ik moet inhalen?'],
    ['Vorige week heb ik bij u een fiets gekocht.', 'De remmen werken niet goed en de bel is kapot.', 'Kan ik de fiets deze week bij u laten maken?'],
    ['Onze klas doet mee aan een project over het milieu.', 'Wij willen graag een rondleiding bij uw afvalbedrijf om te zien wat er met ons afval gebeurt.', 'Kunt u ons laten weten of dat in april kan?'],
    ['Ik heb uw advertentie voor een bijbaan in de krant gezien.', 'Ik ben vijftien jaar en ik kan op zaterdag en op woensdagmiddag werken.', 'Ik hoor graag van u.'],
    ['Ik mail je omdat ik het huiswerk voor wiskunde niet snap.', 'Bij opgave 12 weet ik niet hoe je de oppervlakte uitrekent.', 'Kun je me vanavond even helpen?'],
    ['In onze straat is al twee weken een lantaarnpaal kapot.', 'Het is daardoor \'s avonds erg donker op de stoep, en dat is gevaarlijk.', 'Wilt u de lamp zo snel mogelijk laten repareren?'],
    ['Ik schrijf u namens de leerlingenraad.', 'Wij willen graag dat er in de kantine ook gezonde broodjes worden verkocht.', 'Kunnen we hier binnenkort met u over praten?'],
    ['Ik heb een boek geleend dat ik volgende week moet inleveren.', 'Ik heb het nog niet uit, en ik heb het nodig voor mijn boekverslag.', 'Mag ik het boek twee weken langer houden?'],
    ['Ik heb gisteren mijn rapport gekregen.', 'Bij Engels staat een 4, maar volgens mijn cijferlijst moet het een 6 zijn.', 'Kunt u dit voor mij nakijken?'] ];
  var MAILDOET = ['vertelt waarom je schrijft', 'vertelt wat je precies wilt of weet', 'sluit af met een vraag, een actie of een bedankje'];
  var MAILDEEL = ['de aanleiding', 'de kern', 'de afsluiting'];
  /* eis, beleefde vraag, onbeleefd */
  var TOON = [ ['Stuur mij nu mijn geld terug.', 'Wilt u mijn geld terugstorten?', 'Geef gewoon mijn geld terug, ja!'], ['Ik wil morgen vrij.', 'Zou ik morgen vrij mogen hebben?', 'Morgen kom ik niet, dat is gewoon zo.'],
    ['Verleng mijn boek.', 'Kunt u mijn boek verlengen?', 'Mijn boek moet verlengd, regel dat even.'], ['U moet mij een nieuwe koptelefoon sturen.', 'Wilt u mij een nieuwe koptelefoon sturen?', 'Stuur meteen een nieuwe, anders zet ik een slechte recensie online.'],
    ['Geef mij een stageplek.', 'Zou ik bij u stage mogen lopen?', 'Ik kom bij jullie stage lopen, oké?'], ['Mail me de antwoorden.', 'Zou u mij de antwoorden willen mailen?', 'Stuur die antwoorden even door.'],
    ['Repareer de lantaarnpaal.', 'Wilt u de lantaarnpaal laten repareren?', 'Doe eens wat aan die lamp!'], ['Ik wil een gesprek.', 'Zou ik een afspraak met u mogen maken?', 'We moeten praten, morgen om negen uur.'],
    ['Zet mijn cijfer goed.', 'Wilt u mijn cijfer nog eens nakijken?', 'Mijn cijfer is fout, dat moet u nu veranderen.'], ['Bel mij terug.', 'Kunt u mij terugbellen?', 'Bel me terug, nu.'],
    ['Ik wil mijn bestelling vandaag nog.', 'Kunt u mijn bestelling vandaag nog versturen?', 'Ik verwacht mijn bestelling vandaag, anders ben ik boos.'], ['Stuur me de folder.', 'Wilt u mij de folder sturen?', 'Folder sturen graag, snel.'],
    ['Ik moet langer de tijd krijgen voor mijn werkstuk.', 'Zou ik een paar dagen langer aan mijn werkstuk mogen werken?', 'Ik lever mijn werkstuk later in, succes ermee.'],
    ['Laat me weten of er plek is.', 'Kunt u mij laten weten of er nog plek is?', 'Is er plek of niet?'], ['Geef me de uitslag.', 'Wilt u mij de uitslag laten weten?', 'Wat is de uitslag nou?'] ];
  function formeelStap(f){ return V('Schrijf je formeel of informeel?', ['formeel', 'informeel'], f ? 0 : 1, 'Ken je de lezer niet persoonlijk, of is het een bedrijf of iemand met een functie? Dan schrijf je formeel.'); }

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'schrijf-mail', niveau:'2F', domein:'schrijven', naam:'Een e-mail of brief', uit:'Een goede e-mail of brief past bij de lezer. Je kiest formeel of informeel, een passende aanhef en afsluiting, een duidelijk onderwerp, een vaste opbouw en een beleefde toon.' },
      doelen:[
        { id:'schrijf-mail-formeel', naam:'Formeel of informeel', kort:'Ken je de lezer niet persoonlijk, dan schrijf je formeel en zeg je u',
          uit:'<p>Schrijf je aan iemand die je <b>niet persoonlijk kent</b>, zoals een bedrijf, de gemeente of een directeur? Dan schrijf je <b>formeel</b>. Je zegt <b>u</b>.</p><p>Schrijf je aan een vriend, een klasgenoot of familie? Dan schrijf je <b>informeel</b>. Je zegt <b>je</b> of <b>jij</b>.</p>',
          wanneer:'je een e-mail of brief begint en moet kiezen tussen u en je.',
          maak:function(R){
            var x = R.kies(LEZER), f = x[1] === 1;
            return af({ vraag:x[0], context:'Spreek je de lezer in deze mail aan met u of met je?',
              stappen:[
                V('Ken je de lezer persoonlijk en goed?', ['ja', 'nee'], f ? 1 : 0, 'Is het familie, een vriend of een klasgenoot? Of een bedrijf, een organisatie of iemand met een functie?'),
                formeelStap(f),
                V('Spreek je de lezer aan met u of met je?', ['u', 'je'], f ? 0 : 1, 'Formeel: u. Informeel: je.') ] });
          } },
        { id:'schrijf-mail-aanhef', naam:'De aanhef', kort:'Formeel: Geachte mevrouw Bakker of Geachte heer, mevrouw. Informeel: Hoi Daan',
          uit:'<p>De <b>aanhef</b> is de begroeting boven je mail. Hij hangt af van de lezer.</p><p>Formeel en je weet de naam: <i>Geachte mevrouw Bakker,</i> of <i>Geachte heer De Vries,</i>. Formeel en je weet de naam niet: <i>Geachte heer, mevrouw,</i>.</p><p>Informeel: <i>Hoi Daan,</i> of <i>Beste Daan,</i>. Na de aanhef komt een komma.</p>',
          wanneer:'je een e-mail of brief begint.',
          maak:function(R){
            var x = R.kies(AANH), f = x[1] === 1, naam = !!(x[2] || x[3]), goed, fout;
            if (f && x[2]){ goed = 'Geachte ' + x[2] + ','; fout = ['Hoi ' + x[2].replace('heer', 'meneer') + ',', 'Geachte ' + x[3] + ','];
            } else if (f){ goed = 'Geachte heer, mevrouw,'; fout = ['Hoi allemaal,', 'Lieve klantenservice,'];
            } else { goed = 'Hoi ' + x[3] + ','; fout = ['Geachte ' + x[3] + ',', 'Geachte heer, mevrouw,']; }
            return af({ vraag:x[0], context:'Welke aanhef past?',
              stappen:[
                formeelStap(f),
                V('Weet je de naam van de lezer?', ['ja', 'nee'], naam ? 0 : 1, 'Kijk of er een naam in de opdracht staat.'),
                K(R, 'Welke aanhef past?', goed, fout, f ? (x[2] ? 'Formeel met naam: Geachte, dan mevrouw of heer en de achternaam.' : 'Formeel zonder naam: Geachte heer, mevrouw.') : 'Informeel: Hoi of Beste met de voornaam.') ] });
          } },
        { id:'schrijf-mail-afsluiting', naam:'De afsluiting', kort:'Formeel: Met vriendelijke groet en je hele naam. Informeel: Groetjes en je voornaam',
          uit:'<p>Onder je mail zet je een <b>groet</b> en je naam.</p><p>Formeel: <i>Met vriendelijke groet,</i> en daaronder je <b>voor- en achternaam</b>.</p><p>Informeel: <i>Groetjes,</i> en daaronder alleen je <b>voornaam</b>.</p>',
          wanneer:'je een e-mail of brief afmaakt.',
          maak:function(R){
            var x = R.kies(AANH), f = x[1] === 1;
            return af({ vraag:x[0], context:'Hoe sluit je deze mail af?',
              stappen:[
                formeelStap(f),
                V('Wat zet je onder de groet?', ['je voor- en achternaam', 'alleen je voornaam'], f ? 0 : 1, 'Formeel: je hele naam, zodat de lezer weet wie je bent. Informeel: je voornaam is genoeg.'),
                K(R, 'Welke groet past?', f ? 'Met vriendelijke groet,' : 'Groetjes,', f ? ['Groetjes,', 'Doei!'] : ['Hoogachtend,', 'Met de meeste hoogachting,'], f ? 'Een formele mail sluit je af met Met vriendelijke groet.' : 'Aan iemand die je goed kent, schrijf je Groetjes.') ] });
          } },
        { id:'schrijf-mail-onderwerp', naam:'De onderwerpregel', kort:'Een goede onderwerpregel is kort en zegt precies waar de mail over gaat',
          uit:'<p>De <b>onderwerpregel</b> is het eerste wat de lezer ziet. Hij moet <b>kort</b> zijn en <b>precies</b> zeggen waar de mail over gaat.</p><p>Te vaag: <i>Hoi</i> of <i>Vraagje</i>. Te lang: een hele zin met alle details. Goed: <i>Ziekmelding voor morgen</i>.</p>',
          wanneer:'je een e-mail verstuurt.',
          maak:function(R){
            var x = R.kies(ONDW);
            return af({ vraag:x[0], context:'Welke onderwerpregel is het best?',
              stappen:[
                K(R, 'Welke onderwerpregel is te vaag?', x[2], [x[1], x[3]], 'Bij welke weet de lezer nog steeds niet waar de mail over gaat?'),
                K(R, 'Welke is veel te lang?', x[3], [x[1], x[2]], 'Welke is een hele zin met details die in de mail zelf horen?'),
                K(R, 'Welke onderwerpregel is het best?', x[1], [x[2], x[3]], 'Kort, en de lezer weet meteen waar het over gaat.') ] });
          } },
        { id:'schrijf-mail-opbouw', naam:'De opbouw', kort:'Een mail heeft een aanleiding, een kern en een afsluiting met een vraag of actie',
          uit:'<p>Een goede mail heeft drie delen. De <b>aanleiding</b>: waarom schrijf je? De <b>kern</b>: wat wil je precies, of wat moet de lezer weten? De <b>afsluiting</b>: wat moet de lezer nu doen? Vaak is dat een vraag.</p><p><i>Ik heb een boek geleend.</i> (aanleiding) <i>Ik heb het nog niet uit.</i> (kern) <i>Mag ik het langer houden?</i> (afsluiting)</p>',
          wanneer:'je een mail schrijft en wilt dat de lezer snel snapt wat je wilt.',
          maak:function(R){
            var m = R.kies(MAIL), i = R.kies([0, 1, 2]);
            return af({ vraag:m[i], context:'Uit welk deel van een mail komt deze zin?',
              beeld:function(k){ return k >= 2 ? blok(R, m.map(function(z, j){ return '<b>' + MAILDEEL[j] + ':</b> ' + (j === i ? '<mark>' + S(R, z) + '</mark>' : S(R, z)); })) : ''; },
              stappen:[
                K(R, 'Wat doet deze zin?', MAILDOET[i], MAILDOET, i === 2 ? 'Vraagt de zin de lezer om iets te doen, of rondt hij af?' : i === 0 ? 'Zegt de zin waarom je deze mail stuurt?' : 'Geeft de zin de details: wat er precies is of wat je precies wilt?'),
                K(R, 'Bij welk deel hoort de zin?', MAILDEEL[i], MAILDEEL, 'Waarom je schrijft: aanleiding. Wat je precies wilt: kern. Een vraag of actie aan het eind: afsluiting.') ] });
          } },
        { id:'schrijf-mail-toon', naam:'Een beleefde toon', kort:'Vraag beleefd met Wilt u, Kunt u of Zou ik, in plaats van te eisen',
          uit:'<p>In een formele mail <b>vraag</b> je iets, je <b>eist</b> het niet. Een eis klinkt bot: <i>Bel mij terug.</i></p><p>Maak er een <b>beleefde vraag</b> van met <i>Wilt u</i>, <i>Kunt u</i> of <i>Zou ik</i>: <i>Kunt u mij terugbellen?</i></p><p>Ook als je boos bent, blijf je beleefd. Dan wil de lezer je eerder helpen.</p>',
          wanneer:'je in een mail iets van iemand wilt.',
          maak:function(R){
            var x = R.kies(TOON);
            return af({ vraag:x[0], context:'Je schrijft een formele mail. Welke zin is beleefd?',
              stappen:[
                V('Is dit een beleefde vraag of een eis?', ['een beleefde vraag', 'een eis'], 1, 'Vraagt de zin iets, of zegt hij wat de lezer moet doen?'),
                K(R, 'Hoe maak je er een beleefde vraag van?', 'begin met Wilt u, Kunt u of Zou ik', ['zet er een uitroepteken achter', 'schrijf het in hoofdletters'], 'Een beleefde vraag begint vaak met Wilt u, Kunt u of Zou ik.'),
                K(R, 'Welke zin is beleefd?', x[1], [x[0], x[2]], 'Zoek de vraag met Wilt u, Kunt u of Zou ik.') ] });
          } }
      ] }
  ]);

  /* ================= register en doel ================= */
  /* zin, formeelste woord, minder formeel, spreektaal */
  var REG = [ ['Ik heb uw brief in goede orde ' + GAT + '.', 'ontvangen', 'gekregen', 'gehad'], ['Ik ' + GAT + ' niet wat u bedoelt.', 'begrijp', 'snap', 'vat'],
    ['De lift in ons gebouw is ' + GAT + '.', 'defect', 'kapot', 'stuk'], ['Wilt u de gegevens ' + GAT + '?', 'controleren', 'nakijken', 'checken'],
    ['Ik vond de presentatie ' + GAT + ' interessant.', 'zeer', 'echt', 'super'], [GAT + ' voor de late reactie.', 'Mijn excuses', 'Sorry', 'Sorry hoor'],
    ['Ik ga ' + GAT + ' met uw voorstel.', 'akkoord', 'prima', 'oké'], ['Wij zijn ' + GAT + ' op zoek naar een nieuwe trainer.', 'momenteel', 'nu', 'nou'],
    ['Ik heb het formulier ' + GAT + ' opgestuurd.', 'reeds', 'al', 'allang'], ['Ik hoop ' + GAT + ' van u te horen.', 'spoedig', 'snel', 'gauw'],
    [GAT + ' heer Jansen,', 'Geachte', 'Beste', 'Hoi'], ['Eerst vulde ik het formulier in. ' + GAT + ' stuurde ik het op.', 'Vervolgens', 'Toen', 'En toen'],
    ['De cursus is leuk. ' + GAT + ' is hij goedkoop.', 'Bovendien', 'Ook', 'En ook nog'], [GAT + ' u vragen heeft, kunt u mij bellen.', 'Indien', 'Als', 'As'],
    ['Wij willen een nieuwe computer ' + GAT + '.', 'aanschaffen', 'kopen', 'scoren'], ['Uw service was ' + GAT + '.', 'uitstekend', 'goed', 'vet goed'] ];
  var ONTV = ['de directeur van een bedrijf', 'de gemeente', 'de klantenservice van een webwinkel', 'een museum', 'de schoolleiding', 'een sportclub waar je lid wilt worden'];
  /* zin, spreektaal, beter (leeg = weglaten) */
  var SPR = [ ['Ik vond de rondleiding super leuk.', 'super', 'erg'], ['Ik heb effe een vraag over de cursus.', 'effe', ''], ['Ik kom morgen ff langs om het boek op te halen.', 'ff', 'even'],
    ['Mijn ouders zeggen dat hun het formulier al hebben opgestuurd.', 'hun', 'zij'], ['Ik wil graag weten wanneer de cursus begint ofzo.', 'ofzo', ''], ['De printer is al de hele week kapot, zeg maar.', 'zeg maar', ''],
    ["Ik heb m'n huiswerk op tijd ingeleverd.", "m'n", 'mijn'], ['Ik heb het boek gister teruggebracht.', 'gister', 'gisteren'], ['Het was een vette ervaring.', 'vette', 'mooie'],
    ["Da's geen probleem voor mij.", "Da's", 'Dat is'], ['Ik wil u bedanken voor de toffe dag.', 'toffe', 'leuke'], ['Ik heb uw mail gelezen en het is prima hoor.', 'hoor', ''],
    ['Ik stuur u mijn cv en zo.', 'en zo', ''], ['De bus kwam weer eens hartstikke laat.', 'hartstikke', 'erg'], ['Ik heb een paar vraagjes over de excursie.', 'vraagjes', 'vragen'],
    ['Ik vond het jammer dat de les uitviel, maar ja.', 'maar ja', ''], ['Wanneer kan ik mijn spullen ophalen? Groetjes, Sanne', 'Groetjes', 'Met vriendelijke groet'],
    ['Ik heb gisteren eventjes met uw collega gebeld.', 'eventjes', ''] ];
  var SPRPOOL = ['effe', 'super', 'toffe', 'hartstikke', 'ofzo', 'vet', 'gister'];
  var DOEL = [ ['een verslag van de schoolreis voor de schoolkrant', 'i'], ['een werkstuk over walvissen', 'i'], ['een nieuwsbericht over de nieuwe directeur', 'i'],
    ['een folder met de openingstijden van het zwembad', 'i'], ['een artikel over de geschiedenis van je dorp', 'i'],
    ['een brief aan de directeur dat er meer fietsenrekken moeten komen', 'o'], ['een betoog dat school later moet beginnen', 'o'], ['een advertentie voor de schoolmusical, zodat er veel mensen komen', 'o'],
    ['een brief aan de gemeente dat er een skatebaan moet komen', 'o'], ['een recensie waarin je iedereen aanraadt de film te gaan zien', 'o'],
    ['een recept voor pannenkoeken', 'n'], ['een handleiding voor het nieuwe printsysteem op school', 'n'], ['een routebeschrijving naar je huis', 'n'], ['uitleg over hoe je een tent opzet', 'n'],
    ['de spelregels van een bordspel', 'n'], ['een grappig verhaal over je kat voor de schoolkrant', 'a'], ['een rubriek met moppen', 'a'], ['een spannend verhaal voor je kleine broertje', 'a'],
    ['een grappig gedicht voor Sinterklaas', 'a'] ];
  var DOELNAAM = { i:'informeren', o:'overtuigen', n:'instrueren', a:'amuseren' };
  var DOELLEZER = { i:'iets weten wat hij nog niet wist', o:'iets vinden of doen wat jij wilt', n:'iets kunnen doen, stap voor stap', a:'zich vermaken en ontspannen' };
  var PLAN = [ ['een verslag van de schoolreis', 'waar we heen gingen en met wie', 'wat we de hele dag hebben gedaan', 'wat ik er uiteindelijk van vond'],
    ['een werkstuk over walvissen', 'waarom ik dit onderwerp koos en wat mijn hoofdvraag is', 'hoe walvissen leven, eten en zwemmen', 'het antwoord op mijn hoofdvraag'],
    ['een brief aan de directeur over fietsenrekken', 'wie ik ben en waarom ik schrijf', 'mijn argumenten: er is te weinig plek en fietsen vallen om', 'mijn vraag om nieuwe rekken te plaatsen'],
    ['een boekverslag', 'de titel, de schrijver en waar het boek over gaat', 'de personages en wat er gebeurt', 'mijn mening over het boek'],
    ['een betoog over schooltijden', 'een opvallend feit over slaap en mijn standpunt', 'mijn argumenten en een tegenargument', 'mijn standpunt nog een keer in andere woorden'],
    ['een recept voor de schoolkrant', 'wat je gaat maken en voor hoeveel mensen', 'de stappen een voor een', 'een tip voor het opdienen'],
    ['een nieuwsbericht over de sportdag', 'wat er gebeurde, wanneer en waar', 'de uitslagen en wat leerlingen ervan zeiden', 'wanneer de volgende sportdag is'],
    ['een tekst over je hobby', 'wat je hobby is en hoe je eraan kwam', 'wat je nodig hebt en hoe het werkt', 'waarom anderen het ook eens moeten proberen'],
    ['een klachtbrief aan een webwinkel', 'wat ik heb besteld en wanneer', 'wat er mis is met het product', 'wat ik van de winkel verwacht'],
    ['een verhaal over een spannende nacht', 'wie de hoofdpersoon is en waar het verhaal begint', 'het probleem en hoe het steeds spannender wordt', 'hoe het afloopt'],
    ['een verslag van een proef bij biologie', 'wat we wilden onderzoeken', 'wat we hebben gedaan en gemeten', 'wat de uitkomst is'],
    ['een sollicitatiebrief voor een bijbaan', 'op welke baan ik reageer en waar ik de vacature zag', 'waarom ik geschikt ben', 'dat ik graag op gesprek kom'],
    ['een artikel over afval scheiden', 'waarom afval een groot probleem is', 'hoe je thuis afval kunt scheiden', 'een oproep om vandaag te beginnen'] ];
  var PLANDOET = ['het stuk beginnen en zeggen waar het over gaat', 'de details, uitleg en argumenten geven', 'afronden met een conclusie, mening of vraag'];
  var PLANDEEL = ['inleiding', 'kern', 'slot'];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'schrijf-register', niveau:'2F', domein:'schrijven', naam:'Register en doel', uit:'Voor wie schrijf je, en waarom? Dat bepaalt welke woorden je kiest en hoe je je tekst opbouwt.' },
      doelen:[
        { id:'schrijf-register-woorden', naam:'Formele woorden', kort:'In een formele tekst kies je het deftigste woord: ontvangen in plaats van krijgen',
          uit:'<p>Schrijf je aan iemand die je niet kent, dan kies je <b>formele woorden</b>. Dat zijn wat deftigere woorden dan je in het dagelijks leven gebruikt.</p><p><i>krijgen</i> wordt <i>ontvangen</i>, <i>kapot</i> wordt <i>defect</i>, <i>sorry</i> wordt <i>mijn excuses</i>, <i>als</i> wordt <i>indien</i>.</p>',
          wanneer:'je een brief of mail schrijft aan een bedrijf, school of instantie.',
          maak:function(R){
            var x = R.kies(REG), o = R.kies(ONTV);
            return af({ vraag:x[0], context:'Je schrijft een brief aan ' + o + '. Welk woord past het best?',
              stappen:[
                V('Ken je de lezer, ' + o + ', persoonlijk en goed?', ['ja', 'nee'], 1, 'Een bedrijf, school of instantie ken je niet persoonlijk. Dan schrijf je formeel.'),
                K(R, 'Welk woord is het formeelst?', x[1], [x[2], x[3]], 'Kies het deftigste woord, het woord dat je niet zo snel tegen een vriend zou zeggen.') ] });
          } },
        { id:'schrijf-register-spreektaal', naam:'Spreektaal herkennen', kort:'Woorden als effe, super en ofzo horen niet in een formele tekst',
          uit:'<p><b>Spreektaal</b> zijn woorden die je zegt, maar die niet in een formele tekst horen: <i>effe, ff, super, toffe, hartstikke, ofzo, zeg maar, gister</i>.</p><p>Lees je tekst na en zoek die woorden. Vervang ze door een gewoon woord, of laat ze weg.</p>',
          wanneer:'je een formele mail of brief naleest voordat je hem verstuurt.',
          maak:function(R){
            var x = R.kies(SPR), w = x[1];
            var woorden = x[0].replace(/[.,?!]/g, '').split(' ').filter(function(v){ return v.length > 2 && w.split(' ').indexOf(v) < 0 && v !== w; });
            var a = R.kies(woorden), b = ander(R, woorden, a);
            var beter = x[2] ? x[2] : 'laat "' + w + '" weg';
            return af({ vraag:x[0], context:'Deze zin staat in een formele brief. Er staat één stukje spreektaal in. Wat schrijf je daar beter?',
              stappen:[
                K(R, 'Welk stukje is spreektaal?', w, [a, b], 'Zoek het woord dat je wel zegt tegen een vriend, maar niet schrijft aan een bedrijf.'),
                K(R, 'Wat schrijf je beter?', beter, [w, ander(R, SPRPOOL.filter(function(p){ return p !== w; }), w)], x[2] ? 'Kies een gewoon woord dat hetzelfde betekent.' : 'Dit stukje voegt niets toe. Je kunt het beter weglaten.') ] });
          } },
        { id:'schrijf-register-doel', naam:'Doel en lezer', kort:'Bedenk wat de lezer moet weten, vinden, kunnen of voelen: dat is je schrijfdoel',
          uit:'<p>Elke tekst heeft een <b>doel</b>. Bedenk wat de lezer na het lezen moet weten, vinden, kunnen of voelen.</p><p><b>Informeren</b>: de lezer weet iets nieuws. <b>Overtuigen</b>: de lezer gaat iets vinden of doen. <b>Instrueren</b>: de lezer kan iets doen, stap voor stap. <b>Amuseren</b>: de lezer vermaakt zich.</p>',
          wanneer:'je aan een schrijfopdracht begint.',
          maak:function(R){
            var x = R.kies(DOEL), d = x[1];
            return af({ vraag:hoofd(x[0]), context:'Wat is je schrijfdoel bij deze tekst?',
              stappen:[
                K(R, 'Wat moet de lezer na het lezen?', DOELLEZER[d], waarden(DOELLEZER, d), 'Stel je de lezer voor die klaar is met lezen. Weet hij iets, vindt hij iets, kan hij iets, of heeft hij zich vermaakt?'),
                K(R, 'Wat is dus je schrijfdoel?', DOELNAAM[d], waarden(DOELNAAM, d), 'Weten: informeren. Vinden of doen: overtuigen. Kunnen: instrueren. Vermaken: amuseren.') ] });
          } },
        { id:'schrijf-register-plan', naam:'Een schrijfplan', kort:'Verdeel je punten over inleiding, kern en slot voordat je gaat schrijven',
          uit:'<p>Maak een <b>schrijfplan</b> voordat je begint. Verdeel wat je wilt zeggen over drie delen.</p><p>De <b>inleiding</b> begint het stuk en zegt waar het over gaat. De <b>kern</b> geeft de details, uitleg en argumenten. Het <b>slot</b> rondt af met een conclusie, een mening of een vraag.</p>',
          wanneer:'je een langere tekst moet schrijven en niet weet waar je moet beginnen.',
          maak:function(R){
            var p = R.kies(PLAN), i = R.kies([0, 1, 2]);
            return af({ vraag:hoofd(p[i + 1]), context:'Je maakt een schrijfplan voor ' + p[0] + '. Waar hoort dit punt?',
              stappen:[
                K(R, 'Wat doet dit punt?', PLANDOET[i], PLANDOET, 'Begint het iets, geeft het de details, of rondt het af?'),
                K(R, 'Waar hoort het dus?', PLANDEEL[i], PLANDEEL, 'Beginnen: inleiding. Details: kern. Afronden: slot.') ] });
          } }
      ] }
  ]);

  /* ================= het betoog ================= */
  /* st standpunt, ond onderwerp, feit, vr vraag, sterk, mid, zwak, tegen, weer weerlegging, herh herhaling, anders, inl inleiding, slot */
  var T = [
    { st:'School moet later beginnen.', ond:'later beginnen op school', feit:'Veel middelbare scholen beginnen om half negen.', vr:'Hoe laat begint jouw school?',
      sterk:'Uit onderzoek blijkt dat jongeren pas laat moe worden en daardoor beter leren als ze later beginnen.', mid:'In de winter fiets je dan minder vaak in het donker naar school.', zwak:'Ik vind vroeg opstaan gewoon stom.',
      tegen:'Dan ben je later uit school en heb je minder tijd voor sport.', weer:'Dat klopt, maar uitgeruste leerlingen werken sneller, dus ze zijn eerder klaar met hun huiswerk.', herh:'Toch moet school gewoon later beginnen.', anders:'Sport is trouwens ook heel gezond.',
      inl:'Om half negen zitten veel leerlingen gapend in de klas. Ze kunnen slecht opletten. Daarom vind ik dat school later moet beginnen.', slot:'Uitgeruste leerlingen leren beter en fietsen minder in het donker. Daarom blijf ik erbij: school moet later beginnen.' },
    { st:'Er moet een verbod komen op vuurwerk.', ond:'een vuurwerkverbod', feit:'Met oud en nieuw wordt in Nederland veel vuurwerk afgestoken.', vr:'Steek jij vuurwerk af?',
      sterk:'Elk jaar raken honderden mensen gewond door vuurwerk.', mid:'Huisdieren worden erg bang van de harde knallen.', zwak:'Mijn buurman steekt altijd heel lelijk vuurwerk af.',
      tegen:'Vuurwerk is een mooie traditie.', weer:'Dat is waar, maar met een grote vuurwerkshow van de gemeente blijft de traditie bestaan zonder dat er mensen gewond raken.', herh:'Vuurwerk moet echt verboden worden.', anders:'Kerst is ook een mooie traditie.',
      inl:'Elk jaar op nieuwjaarsdag zitten de ziekenhuizen vol met mensen met brandwonden en oogletsel. Dat kan anders. Ik vind dat er een verbod op vuurwerk moet komen.', slot:'Vuurwerk zorgt voor gewonden en bange dieren. Een verbod is daarom de beste oplossing.' },
    { st:'Mobieltjes horen niet in de klas.', ond:'mobieltjes in de klas', feit:'Bijna alle leerlingen op de middelbare school hebben een mobiele telefoon.', vr:'Heb jij een mobiele telefoon?',
      sterk:'Leerlingen halen hogere cijfers als ze niet worden afgeleid door hun telefoon.', mid:'Er wordt in de les dan minder stiekem gefilmd.', zwak:'Mijn mentor zegt het ook altijd.',
      tegen:'Met een telefoon kun je in de les snel iets opzoeken.', weer:'Dat kan ook op de laptops van school, en daarop krijg je geen berichtjes van vrienden.', herh:'Telefoons horen gewoon niet in de klas.', anders:'Laptops zijn wel duur.',
      inl:'Een piepje, een trilling, en de halve klas kijkt onder de tafel. Zo gaat het in veel lessen. Ik vind dat mobieltjes niet in de klas horen.', slot:'Zonder telefoon letten leerlingen beter op en halen ze hogere cijfers. Mobieltjes horen dus niet in de klas.' },
    { st:'Er moeten meer fietspaden komen.', ond:'fietspaden', feit:'In Nederland zijn meer fietsen dan mensen.', vr:'Fiets jij naar school?',
      sterk:'Op een apart fietspad gebeuren veel minder ongelukken.', mid:'Mensen gaan dan vaker fietsen in plaats van met de auto.', zwak:'Fietsen is gewoon leuker dan lopen.',
      tegen:'Fietspaden kosten veel geld.', weer:'Dat is zo, maar minder ongelukken en minder files besparen later juist veel geld.', herh:'Er moeten gewoon meer fietspaden komen.', anders:'Auto\'s kosten ook veel geld.',
      inl:'Elke ochtend fietsen duizenden leerlingen tussen de auto\'s door naar school. Dat is gevaarlijk. Daarom vind ik dat er meer fietspaden moeten komen.', slot:'Fietspaden zorgen voor minder ongelukken en meer fietsers. Er moeten er dus meer komen.' },
    { st:'Snoep moet uit de schoolkantine.', ond:'snoep in de kantine', feit:'In veel schoolkantines worden snoep en broodjes verkocht.', vr:'Wat koop jij in de kantine?',
      sterk:'Te veel suiker is slecht voor je tanden en je gezondheid.', mid:'Leerlingen geven dan minder geld uit.', zwak:'Ik houd zelf niet zo van snoep.',
      tegen:'Leerlingen kopen dan gewoon snoep in de supermarkt.', weer:'Sommigen wel, maar als snoep niet vlakbij ligt, kopen de meeste leerlingen minder vaak iets zoets.', herh:'Snoep hoort niet in een kantine.', anders:'De supermarkt verkoopt ook groente.',
      inl:'In de pauze staat er een lange rij bij het snoeprek. Bij het fruit staat bijna niemand. Ik vind dat snoep uit de schoolkantine moet.', slot:'Zonder snoep in de kantine eten leerlingen gezonder en geven ze minder uit. Snoep moet er dus uit.' },
    { st:'Iedereen moet minder vlees eten.', ond:'minder vlees eten', feit:'Voor vlees zijn veel water en landbouwgrond nodig.', vr:'Eet jij elke dag vlees?',
      sterk:'Vlees maken kost veel water en land, en dat is slecht voor het klimaat.', mid:'Groenten en bonen zijn vaak goedkoper dan vlees.', zwak:'Mijn zus is ook vegetariër.',
      tegen:'Vlees bevat belangrijke eiwitten.', weer:'Dat klopt, maar eiwitten zitten ook in bonen, noten en eieren.', herh:'We moeten echt minder vlees eten.', anders:'Eiwitten zijn ook goed voor sporters.',
      inl:'Een hamburger lijkt klein, maar er zijn duizenden liters water nodig om hem te maken. Daarom vind ik dat iedereen minder vlees moet eten.', slot:'Minder vlees is beter voor het klimaat en voor je portemonnee. Laten we dus allemaal minder vlees eten.' },
    { st:'Elke school moet een moestuin hebben.', ond:'een moestuin op school', feit:'Sommige scholen hebben al een moestuin.', vr:'Heeft jouw school een moestuin?',
      sterk:'Leerlingen leren zo waar hun eten vandaan komt en gaan daardoor gezonder eten.', mid:'Het schoolplein wordt er groener van.', zwak:'Mijn opa had vroeger ook een moestuin.',
      tegen:'Een moestuin kost veel tijd en geld.', weer:'Dat valt mee: leerlingen doen het werk zelf in de les biologie, en zaadjes zijn goedkoop.', herh:'Een moestuin is gewoon een goed plan.', anders:'Tijd is geld, zeggen ze.',
      inl:'Veel leerlingen weten niet hoe een aardappel groeit. Dat is jammer. Daarom vind ik dat elke school een moestuin moet hebben.', slot:'Met een moestuin leren leerlingen gezonder eten en wordt de school groener. Elke school moet er dus een hebben.' },
    { st:'De bibliotheek moet ook op zondag open zijn.', ond:'de bibliotheek op zondag', feit:'Veel bibliotheken zijn op zondag gesloten.', vr:'Ga jij weleens naar de bibliotheek?',
      sterk:'Veel leerlingen hebben door de week geen tijd om te lenen of te studeren.', mid:'Op zondag is het rustig op straat, dus je komt er makkelijk.', zwak:'Ik ga op zondag graag ergens heen.',
      tegen:'Het personeel wil op zondag vrij zijn.', weer:'Er zijn genoeg mensen, zoals studenten, die graag op zondag werken.', herh:'Op zondag moet de bibliotheek gewoon open.', anders:'Zondag is voor veel mensen een rustdag.',
      inl:'Zondagmiddag heb je eindelijk tijd om aan je werkstuk te werken, maar de bibliotheek is dicht. Daarom vind ik dat de bibliotheek ook op zondag open moet zijn.', slot:'Zo kan iedereen lenen en studeren, ook wie door de week geen tijd heeft. De bibliotheek moet dus ook op zondag open.' },
    { st:'Huisdieren moeten mee mogen naar kantoor.', ond:'huisdieren op kantoor', feit:'Op de meeste kantoren zijn huisdieren niet toegestaan.', vr:'Heb jij een huisdier?',
      sterk:'Uit onderzoek blijkt dat mensen minder stress hebben als er een dier in de buurt is.', mid:'De dieren zijn dan niet de hele dag alleen thuis.', zwak:'Honden zijn gewoon superschattig.',
      tegen:'Sommige collega\'s zijn allergisch voor dieren.', weer:'Voor hen kan er een kamer zijn waar geen dieren mogen komen.', herh:'Dieren op kantoor zijn een goed idee.', anders:'Allergieën komen veel voor.',
      inl:'Veel honden zitten de hele dag alleen thuis, terwijl hun baasje op kantoor zit. Dat kan beter. Ik vind dat huisdieren mee moeten mogen naar kantoor.', slot:'Met een dier op kantoor hebben mensen minder stress en zijn dieren minder alleen. Laat ze dus mee naar kantoor.' },
    { st:'Jongeren moeten verplicht een EHBO-cursus doen.', ond:'een EHBO-cursus voor jongeren', feit:'Een EHBO-cursus duurt meestal een paar middagen.', vr:'Heb jij al eens een EHBO-cursus gedaan?',
      sterk:'Wie EHBO kan, kan bij een ongeluk een leven redden.', mid:'Je leert ook rustig te blijven als er iets misgaat.', zwak:'Mijn vriend heeft het ook gedaan.',
      tegen:'Jongeren hebben al genoeg te doen.', weer:'De cursus duurt maar een paar middagen en kan gewoon onder schooltijd.', herh:'EHBO is gewoon belangrijk.', anders:'Jongeren slapen ook al te weinig.',
      inl:'Stel je voor: je vriend valt op het schoolplein en blijft liggen. Weet jij wat je moet doen? Ik vind dat elke jongere verplicht een EHBO-cursus moet doen.', slot:'Met EHBO kun je levens redden en blijf je rustig als het misgaat. Een EHBO-cursus moet dus verplicht worden.' },
    { st:'Scholieren moeten gratis met de bus mogen.', ond:'gratis busvervoer voor scholieren', feit:'Een busabonnement kost honderden euro\'s per jaar.', vr:'Neem jij de bus naar school?',
      sterk:'Dan kan elke leerling naar school, ook als zijn ouders weinig geld hebben.', mid:'Er rijden dan minder ouders met de auto naar school.', zwak:'Ik heb geen zin om te fietsen.',
      tegen:'Dan worden de bussen te vol.', weer:'Dat is op te lossen door in de spits extra bussen te laten rijden.', herh:'Een gratis bus is gewoon eerlijk.', anders:'Treinen zijn ook vaak vol.',
      inl:'Voor sommige leerlingen is de bus naar school te duur. Zij fietsen elke dag kilometers, ook in de regen. Daarom vind ik dat scholieren gratis met de bus moeten mogen.', slot:'Een gratis bus maakt school bereikbaar voor iedereen en zorgt voor minder auto\'s. Maak de bus dus gratis voor scholieren.' },
    { st:'Er moet meer groen in de stad komen.', ond:'groen in de stad', feit:'In de stad is het in de zomer vaak warmer dan op het platteland.', vr:'Woon jij in een stad?',
      sterk:'Bomen maken de lucht schoner en zorgen voor koelte als het heet is.', mid:'Een groene straat ziet er mooier uit.', zwak:'Ik hou van de kleur groen.',
      tegen:'Bomen nemen parkeerplaatsen in.', weer:'Dat klopt, maar op plekken zonder parkeerplaatsen, zoals daken en pleinen, kan ook groen komen.', herh:'De stad moet groener, dat is duidelijk.', anders:'Parkeren is in de stad ook duur.',
      inl:'Op hete zomerdagen is het in de stad soms vijf graden warmer dan daarbuiten. Bomen kunnen daar iets aan doen. Ik vind dat er meer groen in de stad moet komen.', slot:'Groen maakt de stad koeler, schoner en mooier. Er moet dus meer groen komen.' },
    { st:'Elke klas moet een week op kamp.', ond:'een schoolkamp', feit:'Veel scholen gaan in de brugklas op kamp.', vr:'Ben jij weleens op schoolkamp geweest?',
      sterk:'Op kamp leren leerlingen elkaar beter kennen, waardoor er minder wordt gepest.', mid:'Je leert dingen die je in de klas niet leert, zoals samen koken.', zwak:'Kamp is altijd lachen.',
      tegen:'Niet alle ouders kunnen een kamp betalen.', weer:'Daarom moet de school een potje hebben waaruit het kamp wordt betaald voor wie het zelf niet kan.', herh:'Kamp is gewoon belangrijk.', anders:'Ouders werken vaak hard.',
      inl:'Na een week kamp ken je je klasgenoten beter dan na een heel jaar lessen. Daarom vind ik dat elke klas een week op kamp moet.', slot:'Op kamp leer je elkaar kennen en wordt er minder gepest. Elke klas moet dus op kamp.' },
    { st:'In woonwijken moet je maximaal dertig kilometer per uur mogen rijden.', ond:'de snelheid in woonwijken', feit:'In sommige woonwijken mag je nog vijftig kilometer per uur rijden.', vr:'Woon jij in een drukke straat?',
      sterk:'Bij een botsing met dertig kilometer per uur overleven veel meer voetgangers dan bij vijftig.', mid:'Het wordt rustiger en stiller in de straat.', zwak:'Mijn moeder rijdt toch al langzaam.',
      tegen:'Je bent dan langer onderweg.', weer:'Dat is maar een paar minuten per rit, en dat is het waard als er minder kinderen worden aangereden.', herh:'Dertig is gewoon veiliger.', anders:'Files zorgen ook voor vertraging.',
      inl:'In mijn straat spelen elke dag kinderen buiten, maar auto\'s rijden er vaak hard. Dat is gevaarlijk. Ik vind dat je in woonwijken maximaal dertig kilometer per uur mag rijden.', slot:'Langzamer rijden redt levens en maakt de straat rustiger. In woonwijken moet dertig dus de regel worden.' },
    { st:'Leerlingen moeten zelf hun mentor kunnen kiezen.', ond:'een mentor kiezen', feit:'Op de meeste scholen wijst de school de mentor aan.', vr:'Wie is jouw mentor?',
      sterk:'Leerlingen vertellen eerder over hun problemen als ze hun mentor vertrouwen.', mid:'De mentor weet dan dat zijn leerlingen graag bij hem zijn.', zwak:'Ik wil gewoon meneer Bakker.',
      tegen:'Dan wil iedereen dezelfde populaire mentor.', weer:'Daarom kies je een eerste, tweede en derde keus, zodat de groepen eerlijk verdeeld kunnen worden.', herh:'Zelf kiezen is gewoon beter.', anders:'Populaire docenten hebben het vaak druk.',
      inl:'Een mentor is de eerste die je helpt als het niet goed gaat. Dan moet je die persoon wel vertrouwen. Daarom vind ik dat leerlingen zelf hun mentor moeten kunnen kiezen.', slot:'Een mentor die je zelf kiest, vertrouw je meer. Daarom moeten leerlingen hun mentor zelf kunnen kiezen.' } ];
  var ZWAKSLOT = ['Maar misschien is het ook niet zo belangrijk.', 'Maar ja, iedereen mag natuurlijk vinden wat hij wil.', 'Eigenlijk twijfel ik er zelf ook nog over.'];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'schrijf-betoog', niveau:'3F', domein:'schrijven', naam:'Een betoog schrijven', uit:'In een betoog probeer je de lezer te overtuigen. Je hebt een duidelijk standpunt en goede argumenten in een slimme volgorde. Je weerlegt een tegenargument, en je schrijft een sterke inleiding en een sterk slot.' },
      doelen:[
        { id:'schrijf-betoog-standpunt', naam:'Een standpunt', kort:'Een standpunt is een mening die je met argumenten kunt verdedigen, geen feit en geen vraag',
          uit:'<p>Een <b>standpunt</b> is een <b>mening</b> die je met argumenten kunt verdedigen. Het is een stellige zin, vaak met <i>moet</i> of <i>moeten</i>: <i>School moet later beginnen.</i></p><p>Een <b>feit</b> is geen standpunt: dat kun je gewoon controleren. Een <b>vraag</b> ook niet: daarin zeg je niet wat je vindt.</p>',
          wanneer:'je een betoog begint en je mening in één zin wilt zetten.',
          maak:function(R){
            var t = R.kies(T);
            return af({ vraag:'Onderwerp: ' + t.ond, context:'Welke zin is een standpunt?',
              stappen:[
                K(R, 'Welke zin is een feit dat je kunt controleren?', t.feit, [t.st, t.vr], 'Een feit is waar of niet waar. Je kunt het opzoeken.'),
                K(R, 'Welke zin is een standpunt: een mening die je met argumenten kunt verdedigen?', t.st, [t.feit, t.vr], 'Zoek de zin waarin iemand zegt wat er moet gebeuren.') ] });
          } },
        { id:'schrijf-betoog-argument', naam:'Argumenten ordenen', kort:'Laat zwakke argumenten weg en zet je sterkste argument als laatste',
          uit:'<p>Niet elk argument is even sterk. Een <b>zwak</b> argument is alleen jouw smaak of wat één persoon zegt: <i>Ik vind het stom.</i> Laat zo\'n argument weg.</p><p>Een <b>sterk</b> argument is een feit of een belangrijk gevolg voor veel mensen.</p><p>Zet je <b>sterkste argument als laatste</b>. Dat onthoudt de lezer het best.</p>',
          wanneer:'je argumenten hebt verzameld en ze in je betoog wilt zetten.',
          maak:function(R){
            var t = R.kies(T), lt = R.hussel(['A', 'B', 'C']), args = [t.sterk, t.mid, t.zwak];
            var regels = [0, 1, 2].map(function(i){ return [lt[i], args[i]]; }).sort(function(p, q){ return p[0] < q[0] ? -1 : 1; });
            var tekst = blok(R, ['<b>Standpunt:</b> ' + S(R, t.st)].concat(regels.map(function(r){ return '<b>Argument ' + r[0] + ':</b> ' + S(R, r[1]); })));
            var s = lt[0], m = lt[1], z = lt[2];
            return af({ vraag:t.st, vraagHtml:tekst, context:'Welke argumenten gebruik je, en in welke volgorde?',
              stappen:[
                K(R, 'Welk argument is zwak en laat je weg?', 'argument ' + z, ['argument ' + s, 'argument ' + m], 'Welk argument is alleen een eigen smaak of wat één persoon zegt?'),
                K(R, 'Welk van de andere twee is het sterkst?', 'argument ' + s, ['argument ' + m], 'Welk argument is een feit of heeft gevolgen voor veel mensen?'),
                K(R, 'Welke volgorde kies je?', m + ' en dan ' + s, [s + ' en dan ' + m, z + ', ' + m + ' en dan ' + s], 'Laat het zwakke argument weg en zet het sterkste als laatste.') ] });
          } },
        { id:'schrijf-betoog-tegen', naam:'Een tegenargument weerleggen', kort:'Noem een tegenargument en laat met een reden zien waarom het niet klopt',
          uit:'<p>Een sterk betoog noemt ook een <b>tegenargument</b>: wat zeggen mensen die het niet met je eens zijn?</p><p>Daarna <b>weerleg</b> je het: je laat met een reden zien waarom het tegenargument niet klopt, of hoe je het oplost. <i>Dat klopt, maar ...</i></p><p>Alleen je standpunt herhalen is geen weerlegging. Over iets anders beginnen ook niet.</p>',
          wanneer:'je in je betoog laat zien dat je ook aan de andere kant hebt gedacht.',
          maak:function(R){
            var t = R.kies(T), tekst = blok(R, ['<b>Standpunt:</b> ' + S(R, t.st), '<b>Tegenargument:</b> ' + S(R, t.tegen)]);
            return af({ vraag:t.tegen, vraagHtml:tekst, context:'Welke reactie weerlegt het tegenargument het best?',
              stappen:[
                K(R, 'Welke reactie gaat over iets anders, of helpt het tegenargument zelfs?', t.anders, [t.weer, t.herh], 'Welke reactie zegt niets over waarom het tegenargument niet klopt?'),
                K(R, 'Welke reactie herhaalt alleen je standpunt, zonder reden?', t.herh, [t.weer, t.anders], 'Welke reactie zegt alleen nog eens wat je vindt?'),
                K(R, 'Welke weerlegging is het best?', t.weer, [t.herh, t.anders], 'Een goede weerlegging gaat over het tegenargument en geeft een reden of oplossing.') ] });
          } },
        { id:'schrijf-betoog-inleiding', naam:'Een goede inleiding', kort:'Begin met iets wat de lezer pakt en noem dan je standpunt',
          uit:'<p>Een goede <b>inleiding</b> maakt de lezer nieuwsgierig. Begin met een opvallend feit, een voorbeeld of een vraag. Noem daarna je <b>standpunt</b>.</p><p>Saai is: <i>In dit betoog ga ik het hebben over ...</i> En begin niet al met je conclusie: die hoort in het slot.</p>',
          wanneer:'je de eerste alinea van je betoog schrijft.',
          maak:function(R){
            var t = R.kies(T), saai = 'In dit betoog ga ik het hebben over ' + t.ond + '.', concl = 'Kortom, ' + klein(t.st);
            return af({ vraag:t.st, context:'Kies de beste inleiding voor een betoog met dit standpunt.',
              stappen:[
                K(R, 'Welke inleiding begint al met de conclusie?', concl, [t.inl, saai], 'Kortom hoort bij het slot.'),
                K(R, 'Welke inleiding is saai en noemt alleen het onderwerp?', saai, [t.inl, concl], 'Welke inleiding maakt je niet nieuwsgierig?'),
                K(R, 'Welke inleiding is het best?', t.inl, [saai, concl], 'Een pakkend begin en daarna het standpunt.') ] });
          } },
        { id:'schrijf-betoog-slot', naam:'Een sterk slot', kort:'Vat je argumenten samen en herhaal je standpunt, zonder nieuwe argumenten',
          uit:'<p>In het <b>slot</b> vat je je belangrijkste argumenten kort samen en herhaal je je <b>standpunt</b>, in andere woorden.</p><p>Kom in het slot <b>niet</b> met een nieuw argument: dat hoort in de kern. En maak je standpunt niet zwakker met twijfel.</p>',
          wanneer:'je de laatste alinea van je betoog schrijft.',
          maak:function(R){
            var t = R.kies(T), nieuw = 'Daarnaast is er nog een argument: ' + klein(t.mid), zw = R.kies(ZWAKSLOT);
            return af({ vraag:t.st, context:'Kies het beste slot voor een betoog met dit standpunt.',
              stappen:[
                K(R, 'Welk slot komt nog met een nieuw argument?', nieuw, [t.slot, zw], 'Een nieuw argument hoort in de kern, niet in het slot.'),
                K(R, 'Welk slot maakt je standpunt zwakker?', zw, [t.slot, nieuw], 'Welk slot laat twijfel zien?'),
                K(R, 'Welk slot is het best?', t.slot, [nieuw, zw], 'Een samenvatting van je argumenten en je standpunt nog een keer.') ] });
          } }
      ] }
  ]);

  /* ================= spreken en luisteren ================= */
  var GESL = ['Vond je de film leuk?', 'Heb je een huisdier?', 'Kom je morgen ook?', 'Ben je weleens in Parijs geweest?', 'Speel je een instrument?', 'Hoe oud ben je?',
    'Woon je in Utrecht?', 'Heb je je huiswerk af?', 'Wil je thee of koffie?', 'Doe je aan sport?', 'Hoe laat begint de les?', 'Heb je broers of zussen?'];
  var OPEN = ['Wat vond je van de film?', 'Hoe ziet jouw ideale vakantie eruit?', 'Waarom koos je voor deze school?', 'Wat doe je het liefst in het weekend?',
    'Hoe ging je eerste dag op je bijbaan?', 'Wat vind je lastig aan wiskunde?', 'Hoe ben je op dit idee gekomen?', 'Wat maakt jouw huisdier zo bijzonder?',
    'Waarom ben je met voetbal begonnen?', 'Hoe bereid jij je voor op een toets?', 'Wat heb je allemaal gedaan in de vakantie?', 'Hoe denk jij over het nieuwe rooster?'];
  /* uitspraak, goede doorvraag, gesloten vraag, vraag over iets anders */
  var DOOR = [ ['Ik ben dit weekend naar een concert geweest.', 'Wat vond je het mooiste moment?', 'Was het leuk?', 'Wat ga jij volgende week doen?'],
    ['Ik wil later dierenarts worden.', 'Waarom wil je dat graag?', 'Hou je van dieren?', 'Heb jij al een bijbaan?'],
    ['Ik heb een nieuwe bijbaan bij de bakker.', 'Wat moet je daar allemaal doen?', 'Is het leuk?', 'Hoe laat is het eigenlijk?'],
    ['Ik vond de toets heel moeilijk.', 'Welk deel vond je het lastigst, en waarom?', 'Heb je geleerd?', 'Heb jij al gegeten?'],
    ['We gaan verhuizen naar Groningen.', 'Hoe denk je dat het wordt om daar te wonen?', 'Is dat ver?', 'Ken jij de nieuwe leraar al?'],
    ['Mijn opa is ziek.', 'Hoe gaat het nu met hem?', 'Is hij oud?', 'Ga je mee naar de kantine?'],
    ['Ik ben begonnen met gitaar spelen.', 'Hoe ben je daarop gekomen?', 'Is het moeilijk?', 'Wat is jouw lievelingseten?'],
    ['Ik heb ruzie met mijn beste vriendin.', 'Wat is er gebeurd?', 'Is het erg?', 'Zullen we gaan voetballen?'],
    ['We hebben een hond uit het asiel gehaald.', 'Hoe gaat het met hem in zijn nieuwe huis?', 'Is hij groot?', 'Heb jij een fiets?'],
    ['We hebben de finale gewonnen.', 'Hoe voelde het toen het eindsignaal klonk?', 'Was het spannend?', 'Wanneer begint de vakantie?'],
    ['Ik ga in de zomer naar Spanje.', 'Wat wil je daar allemaal gaan doen?', 'Ga je met het vliegtuig?', 'Wat heb jij voor wiskunde gehaald?'],
    ['Ik doe mee aan een toneelstuk.', 'Hoe is het om op het podium te staan?', 'Ben je zenuwachtig?', 'Heb je mijn pen gezien?'],
    ['Ik vind de nieuwe mentor heel aardig.', 'Wat vind je zo aardig aan hem?', 'Is hij jong?', 'Hoe laat begint de les?'],
    ['Ik heb een werkstuk over vulkanen gemaakt.', 'Wat heb je allemaal ontdekt over vulkanen?', 'Heb je een goed cijfer?', 'Wat doe jij vanmiddag?'],
    ['Ik ben gestopt met hockey.', 'Waarom ben je gestopt?', 'Vind je dat jammer?', 'Wie is jouw lievelingszanger?'] ];
  /* wat de ander zegt, goede samenvatting, alleen een detail, verandert de bedoeling */
  var SAMV = [ ['Ik vind dat we het schoolfeest beter in de gymzaal kunnen houden. De aula is veel te klein en er is geen plek om te dansen.', 'Dus jij vindt de gymzaal beter, omdat de aula te klein is.', 'Dus jij vindt dansen leuk.', 'Dus jij wilt geen schoolfeest.'],
    ['Ik kom morgen niet naar training. Mijn oma is jarig, en dat is maar één keer per jaar.', 'Dus je komt morgen niet, omdat je oma jarig is.', 'Dus je oma wordt ouder.', 'Dus je hebt geen zin in training.'],
    ['Volgens mij moeten we eerst de taken verdelen en pas daarna beginnen met schrijven. Anders doen we dingen dubbel.', 'Dus jij wilt eerst de taken verdelen, zodat we niets dubbel doen.', 'Dus jij wilt gaan schrijven.', 'Dus jij wilt alles alleen doen.'],
    ['Ik vond de film te lang. Het begin was spannend, maar in het midden gebeurde er een uur lang bijna niets.', 'Dus jij vond de film te lang, omdat het midden saai was.', 'Dus jij vond het begin spannend.', 'Dus jij houdt niet van films.'],
    ['Ik wil graag een andere plek in de klas. Ik zit nu achterin en ik kan het bord niet goed lezen.', 'Dus je wilt verder naar voren, omdat je het bord niet goed kunt lezen.', 'Dus je zit achterin.', 'Dus je wilt naast je vriend zitten.'],
    ['Ik heb het druk deze week. Ik heb drie toetsen en op woensdag moet ik ook nog werken.', 'Dus je hebt deze week weinig tijd door je toetsen en je werk.', 'Dus je werkt op woensdag.', 'Dus je vindt toetsen leuk.'],
    ['Ik denk dat we beter met de trein kunnen gaan. Die is sneller dan de bus, en in de trein kunnen we naast elkaar zitten.', 'Dus jij wilt met de trein, omdat die sneller en gezelliger is.', 'Dus de bus is langzaam.', 'Dus jij wilt niet mee.'],
    ['Ik vind dat er meer prullenbakken op het schoolplein moeten komen. Nu ligt er overal afval, omdat mensen niet weten waar ze het kwijt kunnen.', 'Dus jij wilt meer prullenbakken, zodat er minder afval rondslingert.', 'Dus er ligt afval.', 'Dus jij wilt zelf het schoolplein schoonmaken.'],
    ['Mijn fiets is gestolen. Ik had hem op slot gezet bij het station, maar toen ik terugkwam was hij weg.', 'Dus je fiets is gestolen bij het station, ook al stond hij op slot.', 'Dus je was bij het station.', 'Dus je had hem niet op slot gezet.'],
    ['Ik vind het nieuwe rooster lastig. We hebben nu twee keer per week het eerste uur gym, en dan zit ik de rest van de dag bezweet in de klas.', 'Dus het rooster is lastig, omdat je na gym de hele dag bezweet bent.', 'Dus je hebt gym.', 'Dus je wilt helemaal geen gym meer.'],
    ['Ik wil graag stage lopen bij een dierenarts. Ik hou van dieren en ik wil later ook met dieren werken.', 'Dus je wilt stage lopen bij een dierenarts, omdat je later met dieren wilt werken.', 'Dus je houdt van dieren.', 'Dus je wilt dokter worden.'],
    ['Ik vind dat de pauze langer moet. In twintig minuten kun je niet eten en ook nog even naar buiten.', 'Dus jij wilt een langere pauze, omdat twintig minuten te kort is om te eten en buiten te zijn.', 'Dus jij eet in de pauze.', 'Dus jij wilt dat de lessen korter worden.'],
    ['Ik ga niet mee naar het feest. Ik ken daar bijna niemand en ik moet de volgende ochtend vroeg op.', 'Dus je gaat niet, omdat je er weinig mensen kent en vroeg op moet.', 'Dus je moet vroeg op.', 'Dus je houdt niet van feestjes.'],
    ['Ik wil dat we de presentatie samen oefenen. Vorige keer liep het mis, omdat niemand wist wie wat zou zeggen.', 'Dus je wilt samen oefenen, zodat iedereen weet wat hij moet zeggen.', 'Dus het liep vorige keer mis.', 'Dus je wilt de presentatie alleen doen.'],
    ['Ik vind dat de kantine gezonder eten moet verkopen. Nu kun je bijna alleen kiezen uit patat en snoep.', 'Dus jij wilt gezonder eten in de kantine, omdat er nu bijna alleen ongezonde dingen zijn.', 'Dus er is patat.', 'Dus jij wilt dat de kantine dichtgaat.'] ];
  /* situatie, goede reactie, onbeleefde reactie, reactie die niet helpt */
  var BEURT = [ ['Je wilt iets zeggen, maar je klasgenoot is nog aan het praten.', 'Je wacht tot hij klaar is en zegt dan: "Mag ik daar iets op zeggen?"', 'Je begint gewoon hard door hem heen te praten.', 'Je zegt niets en denkt er de rest van de les aan.'],
    ['In een groepsgesprek heeft Noor nog niets gezegd.', 'Je vraagt: "Noor, wat vind jij ervan?"', 'Je zegt: "Noor, jij doet ook nooit mee."', 'Je laat het zo, Noor zegt het vanzelf wel als ze iets wil.'],
    ['Iemand praat al vijf minuten en jullie moeten over tien minuten klaar zijn.', 'Je zegt: "Sorry dat ik je onderbreek, maar we moeten nog twee punten bespreken."', 'Je zegt: "Kun je nou eens je mond houden?"', 'Je zegt niets en hoopt dat het vanzelf ophoudt.'],
    ['Je hebt je punt gemaakt en wilt weten wat de ander denkt.', 'Je zegt: "Dat was mijn idee. Wat vind jij?"', 'Je zegt: "Ik heb gelijk, klaar."', 'Je gaat meteen verder met je volgende punt.'],
    ['Twee klasgenoten praten tegelijk.', 'Je zegt: "Zullen we om de beurt praten? Eerst Sam, dan Lisa."', 'Je roept: "Stil, allebei!"', 'Je wacht tot ze vanzelf stoppen.'],
    ['De docent stelt een vraag aan de klas en jij weet het antwoord.', 'Je steekt je vinger op en wacht tot je de beurt krijgt.', 'Je roept het antwoord door de klas.', 'Je fluistert het antwoord tegen je buurman.'],
    ['Je merkt dat je zelf al heel lang aan het woord bent.', 'Je rondt af en vraagt: "Wie wil er nog iets zeggen?"', 'Je zegt: "Jullie hebben toch niks te zeggen."', 'Je stopt midden in je zin en zegt niets meer.'],
    ['Iemand onderbreekt jou terwijl je nog niet klaar bent.', 'Je zegt rustig: "Mag ik even mijn zin afmaken?"', 'Je zegt: "Jij bent echt irritant."', 'Je stopt en laat je verhaal maar zitten.'],
    ['In een discussie wil je reageren op wat Mo net zei.', 'Je wacht tot Mo klaar is en zegt: "Ik wil graag reageren op Mo."', 'Je praat al terwijl Mo nog bezig is.', 'Je begint over een ander onderwerp.'],
    ['Je groepje vergadert en de voorzitter geeft jou het woord.', 'Je zegt kort wat je wilt zeggen en geeft het woord terug.', 'Je zegt: "Wat een stomme vraag."', 'Je vertelt een lang verhaal over iets anders.'],
    ['Je wilt een vraag stellen tijdens de presentatie van een klasgenoot.', 'Je wacht tot het einde, of tot de spreker om vragen vraagt.', 'Je roept je vraag midden in de presentatie.', 'Je stelt je vraag aan je buurman.'],
    ['Een klasgenoot zegt iets wat jij niet goed hebt gehoord.', 'Je vraagt: "Sorry, kun je dat nog een keer zeggen?"', 'Je zegt: "Praat eens duidelijker, joh!"', 'Je doet alsof je het hebt gehoord.'],
    ['Je belt een bedrijf en de medewerker is nog aan het uitleggen.', 'Je luistert tot hij klaar is en stelt dan je vraag.', 'Je begint door hem heen te praten.', 'Je zegt niets en vergeet je vraag.'],
    ['Iemand in je groepje wil iets zeggen, maar komt er niet tussen.', 'Je zegt: "Ik denk dat Yara ook iets wil zeggen."', 'Je lacht om haar.', 'Je praat snel verder.'],
    ['Je bent het niet eens met de spreker en wilt dat zeggen.', 'Je wacht op een pauze en zegt: "Ik zie het anders. Mag ik uitleggen waarom?"', 'Je roept: "Onzin!"', 'Je zegt niets, al ben je het er niet mee eens.'] ];
  /* onderwerp, weetje, kern */
  var PRES = [ ['de Romeinen', 'de Romeinen tweeduizend jaar geleden al in Nederland woonden', 'de Romeinen hebben in Nederland wegen, forten en steden gebouwd'],
    ['vulkanen', 'er op aarde honderden actieve vulkanen zijn', 'vulkanen zijn gevaarlijk, maar ze maken de grond ook heel vruchtbaar'],
    ['schaken', 'er meer mogelijke schaakpartijen zijn dan sterren in het heelal', 'schaken is een spel van vooruitdenken dat iedereen kan leren'],
    ['de olifant', 'een olifant wel honderd liter water per dag kan drinken', 'olifanten zijn slimme dieren die in families leven'],
    ['Anne Frank', 'het dagboek van Anne Frank in meer dan zeventig talen is vertaald', 'het dagboek van Anne Frank laat zien hoe het was om ondergedoken te leven'],
    ['plastic in zee', 'er elk jaar miljoenen kilo\'s plastic in zee terechtkomen', 'plastic in zee is gevaarlijk voor dieren, en we kunnen er zelf iets aan doen'],
    ['de geschiedenis van de fiets', 'er in Nederland meer fietsen zijn dan mensen', 'de fiets is in tweehonderd jaar veranderd van een loopfiets in een elektrische fiets'],
    ['haaien', 'haaien al langer bestaan dan dinosaurussen', 'haaien zijn minder gevaarlijk dan veel mensen denken'],
    ['Japan', 'Japan uit meer dan zesduizend eilanden bestaat', 'Japan is een land van oude tradities en moderne techniek'],
    ['gezond eten', 'de Schijf van Vijf al sinds 1953 bestaat', 'met de Schijf van Vijf kun je makkelijk gezond eten'],
    ['de maan', 'de maan elk jaar een paar centimeter verder van de aarde af gaat', 'de maan zorgt voor eb en vloed en beweegt langzaam van ons af'],
    ['zonne-energie', 'de zon in één uur meer energie naar de aarde stuurt dan alle mensen samen in een jaar gebruiken', 'zonne-energie is schoon en raakt nooit op'],
    ['de honingbij', 'een honingbij voor één pot honing duizenden bloemen moet bezoeken', 'bijen zijn heel belangrijk, omdat ze bloemen en planten bestuiven'],
    ['politiehonden', 'een hond wel tienduizend keer beter kan ruiken dan een mens', 'politiehonden helpen met hun neus bij het zoeken naar mensen en spullen'] ];
  var PRESWAT = ['een begroeting, je onderwerp en iets wat nieuwsgierig maakt', 'een korte samenvatting en een bedankje', 'nog een nieuw feitje'];
  var WEL = ['Je kijkt de ander aan en knikt af en toe.', 'Je vraagt door als iets niet duidelijk is.', 'Je vat kort samen wat de ander zei.', 'Je laat de ander rustig uitpraten.',
    'Je zegt af en toe "o ja?" of "hm-hm".', 'Je legt je telefoon weg.', 'Je stelt een open vraag over wat de ander vertelde.'];
  var NIET = ['Je kijkt ondertussen op je telefoon.', 'Je onderbreekt de ander steeds.', 'Je denkt alvast na over wat jij straks gaat zeggen.', 'Je begint meteen over je eigen verhaal.',
    'Je kijkt de hele tijd uit het raam.', 'Je maakt de zinnen van de ander af.', 'Je geeft meteen advies zonder door te vragen.', 'Je hangt onderuit en gaapt.'];
  var LSIT = ['Je vriend vertelt over zijn eerste dag op zijn bijbaan.', 'Je klasgenoot legt uit hoe zij de opdracht heeft aangepakt.', 'Je oma vertelt over vroeger.',
    'Je mentor bespreekt je rapport met je.', 'Een nieuwe leerling vertelt waar hij vandaan komt.', 'Je zus vertelt dat ze een slechte dag had.', 'Een gastspreker vertelt over zijn beroep.',
    'Je teamgenoot vertelt waarom hij wil stoppen.', 'Een klasgenoot legt uit wat ze van het boek vond.', 'Je buurman vertelt over zijn reis.'];

  LEERROUTE.voeg('nederlands', [
    { groep:{ id:'spreek-gesprek', niveau:'1F', domein:'mondeling', naam:'Spreken en luisteren', uit:'Een goed gesprek voer je samen. Je stelt goede vragen, luistert echt, vat samen, geeft elkaar de beurt en zegt je mening met een argument. Ook een presentatie open en sluit je op een vaste manier.' },
      doelen:[
        { id:'spreek-gesprek-open', naam:'Open en gesloten vragen', kort:'Op een gesloten vraag antwoord je kort, op een open vraag vertel je meer',
          uit:'<p>Een <b>gesloten vraag</b> beantwoord je met ja, nee of een paar woorden: <i>Vond je de film leuk?</i> <i>Hoe oud ben je?</i></p><p>Een <b>open vraag</b> nodigt uit om te vertellen: <i>Wat vond je van de film?</i> Open vragen beginnen vaak met <i>wat, hoe</i> of <i>waarom</i>.</p><p>Wil je dat iemand veel vertelt, stel dan open vragen.</p>',
          wanneer:'je een gesprek of interview voert en de ander aan het praten wilt krijgen.',
          maak:function(R){
            var open = Math.random() < 0.5, v = R.kies(open ? OPEN : GESL);
            return af({ vraag:v, context:'Is dit een open of een gesloten vraag?',
              stappen:[
                V('Kun je deze vraag beantwoorden met ja, nee of een paar woorden?', ['ja', 'nee'], open ? 1 : 0, 'Bedenk een antwoord. Is dat één woord of een kort feit, of moet je echt iets vertellen?'),
                V('Wat voor vraag is het dus?', ['een gesloten vraag', 'een open vraag'], open ? 1 : 0, 'Kort antwoord: gesloten. Je moet iets vertellen: open.') ] });
          } },
        { id:'spreek-gesprek-doorvragen', naam:'Doorvragen', kort:'Vraag met een open vraag door op wat de ander net vertelde',
          uit:'<p><b>Doorvragen</b> betekent: je stelt een vraag over wat de ander net vertelde. Zo laat je zien dat je luistert, en hoor je meer.</p><p>Een goede doorvraag is <b>open</b> en gaat over <b>hetzelfde onderwerp</b>: <i>Ik ben naar een concert geweest.</i> <i>Wat vond je het mooiste moment?</i></p><p>Begin niet over iets anders, en stel geen vraag waar alleen ja of nee op komt.</p>',
          wanneer:'iemand je iets vertelt en je meer wilt weten.',
          maak:function(R){
            var x = R.kies(DOOR);
            return af({ vraag:x[0], context:'Je klasgenoot vertelt je dit. Welke doorvraag is het best?',
              stappen:[
                K(R, 'Welke vraag gaat over iets anders?', x[3], [x[1], x[2]], 'Welke vraag heeft niets te maken met wat je klasgenoot vertelde?'),
                K(R, 'Welke van de andere twee kun je met ja of nee beantwoorden?', x[2], [x[1]], 'Bedenk bij elke vraag een antwoord. Is het alleen ja of nee?'),
                K(R, 'Welke doorvraag is het best?', x[1], [x[2], x[3]], 'Een open vraag over wat je klasgenoot net vertelde.') ] });
          } },
        { id:'spreek-gesprek-samenvatten', naam:'Samenvatten wat de ander zei', kort:'Zeg in je eigen woorden wat de kern was: Dus jij bedoelt ...',
          uit:'<p>Met <b>samenvatten</b> controleer je of je de ander goed hebt begrepen. Je zegt in je eigen woorden wat de <b>kern</b> was: <i>Dus jij bedoelt ...</i></p><p>Een goede samenvatting noemt wat de ander wil of vindt, en waarom. Niet alleen één klein detail. En je verandert niets aan wat de ander bedoelde.</p>',
          wanneer:'je in een gesprek wilt checken of je iemand goed begrijpt.',
          maak:function(R){
            var x = R.kies(SAMV);
            return af({ vraag:x[0], context:'Je klasgenoot zegt dit. Welke samenvatting is goed?',
              stappen:[
                K(R, 'Welke samenvatting noemt maar één klein detail?', x[2], [x[1], x[3]], 'Welke samenvatting mist wat je klasgenoot eigenlijk wil of vindt?'),
                K(R, 'Welke samenvatting verandert wat de ander bedoelt?', x[3], [x[1], x[2]], 'Welke samenvatting zegt iets wat je klasgenoot helemaal niet zei?'),
                K(R, 'Welke samenvatting is goed?', x[1], [x[2], x[3]], 'De kern: wat de ander wil of vindt, en waarom.') ] });
          } },
        { id:'spreek-gesprek-beurt', naam:'De beurt nemen en geven', kort:'Laat de ander uitpraten, neem beleefd de beurt en geef de beurt door',
          uit:'<p>In een goed gesprek <b>wissel je de beurt</b> af. Je laat de ander uitpraten en neemt dan beleefd de beurt: <i>Mag ik daar iets op zeggen?</i></p><p>Moet je iemand <b>onderbreken</b>, doe het dan beleefd: <i>Sorry dat ik je onderbreek, maar ...</i></p><p>Ben je zelf lang aan het woord, <b>geef</b> dan de beurt door: <i>Wat vind jij?</i></p>',
          wanneer:'je in een groepje of discussie samen praat.',
          maak:function(R){
            var x = R.kies(BEURT);
            return af({ vraag:x[0], context:'Wat doe je?',
              stappen:[
                K(R, 'Welke reactie is onbeleefd?', x[2], [x[1], x[3]], 'Welke reactie kwetst de ander of praat door de ander heen?'),
                K(R, 'Welke reactie is het best?', x[1], [x[2], x[3]], 'Beleefd en het gesprek gaat verder: iedereen krijgt zijn beurt.') ] });
          } },
        { id:'spreek-gesprek-presentatie', naam:'Een presentatie openen en afsluiten', kort:'Open met een begroeting, je onderwerp en iets pakkends; sluit af met een samenvatting en een bedankje',
          uit:'<p>Een presentatie <b>open</b> je met een begroeting, je onderwerp en iets wat nieuwsgierig maakt, zoals een verrassend feit: <i>Wist je dat ...?</i></p><p>Je <b>sluit af</b> met een korte samenvatting van je belangrijkste punt, een bedankje, en de vraag of er nog vragen zijn.</p><p>Niet doen: beginnen met <i>eh, ja, ik ga het dus hebben over ...</i>, of eindigen met <i>dat was het</i> of met een nieuw feitje.</p>',
          wanneer:'je een spreekbeurt of presentatie voorbereidt.',
          maak:function(R){
            var p = R.kies(PRES), begin = Math.random() < 0.5, goed, f1, f2, wat;
            if (begin){ wat = PRESWAT[0]; goed = 'Goedemorgen allemaal. Wist je dat ' + p[1] + '? Vandaag vertel ik jullie over ' + p[0] + '.'; f1 = 'Eh, ja, nou, ik ga het dus hebben over ' + p[0] + ', denk ik.'; f2 = 'Dat was mijn presentatie over ' + p[0] + '. Zijn er nog vragen?'; }
            else { wat = PRESWAT[1]; goed = 'Kortom: ' + p[2] + '. Bedankt voor het luisteren! Zijn er nog vragen?'; f1 = 'Nou, dat was het wel zo\'n beetje.'; f2 = 'O ja, ik vergat nog te zeggen dat ' + p[1] + '.'; }
            return af({ vraag:'Presentatie over ' + p[0], context:begin ? 'Hoe begin je deze presentatie het best?' : 'Hoe sluit je deze presentatie het best af?',
              stappen:[
                K(R, begin ? 'Wat hoort er in een goede opening?' : 'Wat hoort er in een goede afsluiting?', wat, PRESWAT, begin ? 'Aan het begin wil je de aandacht van je publiek pakken.' : 'Aan het eind wil je dat je publiek de kern onthoudt.'),
                K(R, begin ? 'Welke opening is het best?' : 'Welke afsluiting is het best?', goed, [f1, f2], begin ? 'Een begroeting, het onderwerp en iets wat nieuwsgierig maakt.' : 'Een korte samenvatting, een bedankje en ruimte voor vragen.') ] });
          } },
        { id:'spreek-gesprek-mening', naam:'Je mening geven met een argument', kort:'Zeg wat je vindt en geef er een sterk argument bij',
          uit:'<p>In een discussie zeg je niet alleen wat je vindt, je geeft er ook een <b>argument</b> bij: <i>Ik ben het ermee eens, want ...</i></p><p>Kies een <b>sterk</b> argument: een feit of een gevolg voor veel mensen. <i>Ik vind het gewoon stom</i> overtuigt niemand.</p>',
          wanneer:'je in een discussie of kringgesprek reageert op een stelling.',
          maak:function(R){
            var t = R.kies(T), goed = 'Ik ben het ermee eens, want ' + klein(t.sterk), zwak = 'Ik ben het ermee eens, want ' + klein(t.zwak), alleen = R.kies(['Ik ben het er helemaal mee eens.', 'Ja, dat vind ik ook.', 'Daar ben ik het mee eens, zeker weten.']);
            return af({ vraag:'Stelling: ' + zonder(t.st), context:'In een discussie reageer je op deze stelling. Welke reactie is het best?',
              stappen:[
                K(R, 'Welke reactie geeft alleen een mening, zonder argument?', alleen, [goed, zwak], 'Zoek de reactie zonder "want".'),
                K(R, 'Welke reactie heeft een zwak argument?', zwak, [goed, alleen], 'Welk argument is alleen een eigen smaak of wat één persoon zegt?'),
                K(R, 'Welke reactie is het best?', goed, [zwak, alleen], 'Een mening met een sterk argument: een feit of een gevolg voor veel mensen.') ] });
          } },
        { id:'spreek-gesprek-luisteren', naam:'Actief luisteren', kort:'Laat zien dat je luistert: kijk de ander aan, laat uitpraten, vraag door en vat samen',
          uit:'<p><b>Actief luisteren</b> is laten zien dat je echt luistert. Je kijkt de ander aan, knikt, laat hem uitpraten, vraagt door en vat samen wat hij zei.</p><p>Wat je <b>niet</b> doet: op je telefoon kijken, steeds onderbreken, meteen over jezelf beginnen of alvast bedenken wat jij gaat zeggen.</p>',
          wanneer:'iemand je iets belangrijks vertelt.',
          maak:function(R){
            var s = R.kies(LSIT), w = R.kies(WEL), n = trek(R, NIET, 2);
            return af({ vraag:s, context:'Wat doe je als je actief luistert?',
              stappen:[
                V('Is dit actief luisteren: "' + klein(zonder(n[0])) + '"?', ['ja', 'nee'], 1, 'Merkt de ander dan dat je echt naar hem luistert?'),
                K(R, 'Wat doe je als actieve luisteraar?', w, n, 'Kies wat laat zien dat je aandacht hebt voor de ander.') ] });
          } }
      ] }
  ]);
})();
