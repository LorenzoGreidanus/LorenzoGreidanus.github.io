/* De leerroute Engels: schrijven.
   A1: een zin goed opschrijven (hoofdletters, punt of vraagteken) en samentrekkingen
   met een apostrof. A2: een e-mail beginnen en afsluiten, de datum in een Britse brief,
   en woorden die je verwart (its/it's, your/you're, their/there/they're, to/too/two,
   then/than, whose/who's). B1: zinnen verbinden met and, but, so, because, however en
   although, met de goede leestekens. B2: formeel schrijven: samentrekkingen voluit,
   formele woorden, een beleefd verzoek en de opbouw van een klachtmail.
   Uitleg en stappen in het Nederlands, de zinnen in Brits Engels. Zie leerroute.js
   voor het formaat. */
(function(){
  'use strict';
  var R = LEERROUTE.R;
  function kies(l){ return R.kies(l); }
  function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  function S(t){ return R.schoon(t); }
  function en(t){ return '<i lang="en">' + S(t) + '</i>'; }
  function E(t){ return '<i lang="en">' + t + '</i>'; }
  function keuze(tekst, goed, fout, hint, extra){
    var lijst = [goed];
    (fout || []).forEach(function(f){ if (f != null && f !== '' && lijst.indexOf(f) < 0) lijst.push(f); });
    var o = R.hussel(lijst), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  function vast(tekst, opties, goed, hint){ return { tekst:tekst, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint }; }
  function invul(tekst, ant, hint, extra){
    var s = { tekst:tekst, antwoord:ant, hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; if (s.opties){ op.opties = s.opties; op.goed = s.goed; } return op; }
  /* een Engels tekstblok; regels zijn al veilige html */
  function blok(regels){ return '<div class="lr-tekst" lang="en">' + regels.map(function(r){ return '<p>' + r + '</p>'; }).join('') + '</div>'; }
  function vraagEn(t){ return '<span lang="en">' + S(t) + '</span>'; }
  /* wat iemand typt: gewone apostrof, enkele spaties, geen spatie voor een leesteken */
  function norm(v){ return String(v == null ? '' : v).replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').replace(/\s+([?.!,])/g, '$1').trim(); }
  /* controle voor een hele zin. o.hoofd: hoofdletters tellen mee. o.punt: de punt aan het eind mag weg */
  function zinControle(goed, o){
    o = o || {};
    var maak = function(t){ t = norm(t); if (o.punt) t = t.replace(/\.$/, ''); return o.hoofd ? t : t.toLowerCase(); };
    var lijst = [].concat(goed).map(maak);
    return function(v){ return lijst.indexOf(maak(v)) >= 0; };
  }
  /* de eerste letter klein, behalve bij I en namen */
  function klein(t){ return /^(I|Tom|Emma|Lucy|Sam)\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  function zonderPunt(t){ return t.replace(/[.]$/, ''); }

  /* ================= A1: een zin goed opschrijven ================= */
  /* de goede zin, en twee woorden die je per ongeluk een hoofdletter zou kunnen geven */
  var ZA = [['Where do you live?', 'Live', 'You'], ['My name is Tom.', 'Name', 'Is'], ['Can I sit here?', 'Sit', 'Here'],
    ['We go to school on Monday.', 'School', 'Go'], ['Do you like pizza?', 'Pizza', 'You'], ['I have got two brothers.', 'Brothers', 'Two'],
    ['My sister and I like swimming.', 'Swimming', 'Sister'], ['Is Emma your best friend?', 'Friend', 'Best'], ['What time is it?', 'Time', 'It'],
    ['We live in London.', 'Live', 'In'], ['Are you from Spain?', 'From', 'You'], ['Tom and I play football on Saturday.', 'Football', 'Play'],
    ['How old are you?', 'Old', 'You'], ['My birthday is in May.', 'Birthday', 'Is'], ['Does Lucy speak French?', 'Speak', 'French'],
    ['I am twelve years old.', 'Years', 'Twelve'], ['Where is the bus station?', 'Bus', 'Station'], ['My dad works in a hospital.', 'Hospital', 'Dad'],
    ['Can you help me?', 'Help', 'Me'], ['We have English on Tuesday.', 'Have', 'On'], ['Who is your teacher?', 'Teacher', 'Your'],
    ['My cat is called Max.', 'Cat', 'Called'], ['When can I call you?', 'Call', 'You'], ['Sam lives in Manchester.', 'Lives', 'In'],
    ['Is it cold in Scotland in winter?', 'Winter', 'Cold'], ['I was born in July.', 'Born', 'Was'], ['We play tennis in summer.', 'Summer', 'Tennis'],
    ['Do you speak Dutch?', 'Speak', 'You']];
  var DAGEN = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/, MAANDEN = /^(January|February|March|April|May|June|July|August|September|October|November|December)$/;
  var TALEN = /^(English|French|Dutch|Spanish|German)$/, PLAATS = /^(London|Spain|Manchester|Scotland)$/;
  var VRAAGWOORD = /^(Where|What|Who|How|When|Why|Which)$/;
  function reden(w){ return w === 'I' ? 'ik: altijd een hoofdletter' : DAGEN.test(w) ? 'een dag' : MAANDEN.test(w) ? 'een maand' : TALEN.test(w) ? 'een taal' : PLAATS.test(w) ? 'een plaats of land' : 'een naam'; }
  function rijtje(ws){ return ws.length === 1 ? 'alleen ' + ws[0] : ws.slice(0, -1).join(', ') + ' en ' + ws[ws.length - 1]; }
  function opgZinAf(){
    var Z = kies(ZA), goed = Z[0], eind = goed.slice(-1), vraag = eind === '?';
    var woorden = goed.slice(0, -1).split(' '), hoofd = woorden.filter(function(w){ return /^[A-Z]/.test(w); });
    var kaal = goed.slice(0, -1).toLowerCase();
    var metVal = function(val){ return woorden.filter(function(w){ return /^[A-Z]/.test(w) || w.toLowerCase() === val.toLowerCase(); }).map(cap); };
    var opt2 = rijtje(metVal(Z[1])), opt3 = hoofd.length > 1 ? rijtje([hoofd[0]]) : rijtje(metVal(Z[2]));
    var eerste = woorden[0];
    var hint1 = vraag ? (VRAAGWOORD.test(eerste) ? 'De zin begint met het vraagwoord ' + eerste + '. Dan is het een vraag.' : 'De zin begint met het werkwoord ' + eerste + '. Zo begint een vraag in het Engels.')
      : 'De zin vertelt iets. Hij begint met ' + eerste + ', niet met een vraagwoord of met een werkwoord als do, can of is.';
    var extra = hoofd.slice(1);
    var hint3 = 'Het eerste woord krijgt altijd een hoofdletter.' + (extra.length ? ' Ook ' + extra.map(function(w){ return w + ' (' + reden(w) + ')'; }).join(' en ') + '.' : ' Verder staat er geen naam, dag, maand, taal of I in de zin.');
    var controle = zinControle(goed, { hoofd:true });
    var fout = {}; fout[kaal + eind] = 'Let op de hoofdletters.'; fout[goed.slice(0, -1).toLowerCase()] = 'Let op de hoofdletters en het leesteken aan het eind.';
    var st = [ vast('Is het een vraag of een mededeling?', ['een vraag', 'een mededeling'], vraag ? 'een vraag' : 'een mededeling', hint1),
      vast('Welk leesteken komt aan het eind?', ['een punt (.)', 'een vraagteken (?)'], vraag ? 'een vraagteken (?)' : 'een punt (.)', vraag ? 'Na een vraag komt een vraagteken.' : 'Na een mededeling komt een punt.'),
      keuze('Welke woorden krijgen een hoofdletter?', rijtje(hoofd), [opt2, opt3], hint3),
      invul('Schrijf de zin goed op.', goed, 'Hoofdletters bij ' + rijtje(hoofd).replace(/^alleen /, '') + ', en ' + (vraag ? 'een vraagteken' : 'een punt') + ' aan het eind: ' + goed, { controle:controle, fout:fout, invoer:'tekst' }) ];
    return { context:'Schrijf de zin goed op: met hoofdletters en een punt of vraagteken.', vraag:kaal, vraagHtml:vraagEn(kaal), stappen:st, controle:controle, invoer:'tekst',
      beeld:function(n){
        if (n < 2) return '';
        var h = woorden.map(function(w){ return n >= 3 && /^[A-Z]/.test(w) ? '<mark>' + S(w) + '</mark>' : S(w.toLowerCase()); }).join(' ') + '<mark>' + S(eind) + '</mark>';
        return blok([h]);
      } };
  }

  /* ---------- samentrekkingen ---------- */
  /* voluit, samentrekking, de letters die wegvallen ('' bij won't), een zin met de volle vorm */
  var ST = [['I am', "I'm", 'a', 'I am very hungry.'], ['you are', "you're", 'a', 'I think you are right.'], ['He is', "He's", 'i', 'He is my best friend.'],
    ['she is', "she's", 'i', 'I think she is at home.'], ['It is', "It's", 'i', 'It is very cold today.'], ['We are', "We're", 'a', 'We are late for school.'],
    ['They are', "They're", 'a', 'They are in the garden.'], ['I have', "I've", 'ha', 'I have lost my keys.'], ['I will', "I'll", 'wi', 'I will call you tomorrow.'],
    ['You will', "You'll", 'wi', 'You will love this film.'], ['do not', "don't", 'o', 'I do not like spiders.'], ['does not', "doesn't", 'o', 'My brother does not eat fish.'],
    ['did not', "didn't", 'o', 'We did not see the bus.'], ['is not', "isn't", 'o', 'The shop is not open today.'], ['are not', "aren't", 'o', 'My friends are not here yet.'],
    ['was not', "wasn't", 'o', 'The film was not very good.'], ['were not', "weren't", 'o', 'They were not at school yesterday.'], ['have not', "haven't", 'o', 'I have not finished my homework.'],
    ['has not', "hasn't", 'o', 'She has not called me.'], ['cannot', "can't", 'no', 'I cannot find my phone.'], ['could not', "couldn't", 'o', 'We could not open the door.'],
    ['should not', "shouldn't", 'o', 'You should not eat so much sugar.'], ['will not', "won't", '', 'It will not rain today.'], ['Let us', "Let's", 'u', 'Let us go to the park.'],
    ['What is', "What's", 'i', 'What is your name?'], ['There is', "There's", 'i', 'There is a cat in the garden.'], ['That is', "That's", 'i', 'That is a great idea.'],
    ['I would', "I'd", 'woul', 'I would like a cup of tea.']];
  function opgApostrof(){
    var T = kies(ST), vol = T[0], kort = T[1], weg = T[2];
    var zinHtml = S(T[3]).replace(S(vol), '<b>' + S(vol) + '</b>');
    var st = [], fout = {};
    fout[kort.replace("'", '').toLowerCase()] = 'Je mist de apostrof.';
    if (weg){
      /* afleiders: het hele laatste woord, en de letters die juist blijven staan */
      var lw = vol.split(' ').pop(), andere = [lw, lw.replace(weg, '')];
      if (/n't$/.test(kort)) fout[(kort.slice(0, -3) + "'nt").toLowerCase()] = 'De apostrof komt op de plek van de o die wegvalt: ' + kort + '.';
      st.push(keuze('Welke letters laat je weg uit ' + en(vol) + '?', weg, andere, / not$/.test(vol) ? 'Bij not valt de o weg: n\'t.' : 'Vergelijk ' + vol + ' met ' + kort + ': ' + weg + ' valt weg.'));
      st.push(invul('Zet op die plek een apostrof. Je schrijft', kort, (vol.indexOf(' ') >= 0 ? 'Haal de spatie en ' : 'Haal ') + weg + ' weg. Op de plek van ' + weg + ' komt een apostrof: ' + kort + '.', { fout:fout, invoer:'tekst' }));
    } else {
      st.push({ tekst:'Let op: ' + en('will not') + ' is een uitzondering. ' + en('will') + ' wordt ' + en('wo') + ', en ' + en('not') + ' wordt ' + en("n't") + '.', info:true });
      fout["willn't"] = 'Will not is een uitzondering: won\'t.'; fout["will'nt"] = 'Will not is een uitzondering: won\'t.';
      st.push(invul('Dus je schrijft', kort, 'Will not wordt won\'t.', { fout:fout, invoer:'tekst' }));
    }
    return { context:'Maak een samentrekking van de vetgedrukte woorden.', vraag:T[3], vraagHtml:'<span lang="en">' + zinHtml + '</span>', stappen:st, invoer:'tekst',
      beeld:function(n){
        var a = kort.split("'");
        var na = R.teken.woord([{ t:a[0], k:1 }, { t:"'", k:2, label:'apostrof' }, { t:a[1], k:1 }]);
        if (!weg) return '<div lang="en">' + (n >= 2 ? na : R.teken.woord([{ t:vol, k:1 }])) + '</div>';
        var i = vol.lastIndexOf(weg);
        var voor = R.teken.woord([{ t:vol.slice(0, i), k:1 }, { t:weg, k:4, doorgehaald:n >= 1, label:n >= 1 ? 'weg' : '' }, { t:vol.slice(i + weg.length), k:1 }]);
        return '<div lang="en">' + (n >= 2 ? na : voor) + '</div>';
      } };
  }

  /* ================= A2: een e-mail beginnen en afsluiten ================= */
  var VR_M = [['Tom', 'Wilson'], ['Jack', 'Taylor'], ['Sam', 'Hughes'], ['Ben', 'Walker'], ['Oliver', 'King']];
  var VR_V = [['Emma', 'Clarke'], ['Lucy', 'Evans'], ['Mia', 'Roberts'], ['Chloe', 'Wright'], ['Grace', 'Hill']];
  var FO_M = [['David', 'Brown'], ['Peter', 'Green'], ['James', 'Cooper'], ['Richard', 'Hall'], ['Mark', 'Johnson']];
  var FO_V = [['Sarah', 'Jones'], ['Helen', 'Smith'], ['Karen', 'Baker'], ['Anna', 'Morris'], ['Laura', 'Davies']];
  var ROL = ['de manager van het hotel waar je hebt gelogeerd', 'de directeur van een taalschool in Brighton', 'de eigenaar van een camping in Wales',
    'de organisator van een zomerkamp', 'de eigenaar van een café waar je wilt werken'];
  var ONBEKEND = ['de klantenservice van een webwinkel', 'het toeristenbureau van York', 'een museum in Londen', 'een sportclub in Leeds', 'een hotel in Edinburgh'];
  var REL_M = ['je vriend', 'je neef', 'je penvriend'], REL_V = ['je vriendin', 'je nicht', 'je penvriendin'];
  /* een lezer: soort vriend, naam (formeel met naam) of onbekend */
  function lezer(soort){
    var man = Math.random() < .5, p;
    if (soort === 'vriend'){ p = kies(man ? VR_M : VR_V); return { soort:soort, man:man, vn:p[0], an:p[1], wie:kies(man ? REL_M : REL_V) + ' ' + p[0] + ' ' + p[1] }; }
    if (soort === 'naam'){ p = kies(man ? FO_M : FO_V); return { soort:soort, man:man, vn:p[0], an:p[1], wie:(man ? 'de heer ' : 'mevrouw ') + p[0] + ' ' + p[1], rol:kies(ROL) }; }
    return { soort:soort, wie:kies(ONBEKEND) };
  }
  function aanhefVan(L){ return L.soort === 'vriend' ? kies(['Hi ', 'Dear ']) + L.vn + ',' : L.soort === 'naam' ? 'Dear ' + (L.man ? 'Mr ' : 'Ms ') + L.an + ',' : 'Dear Sir or Madam,'; }
  var ROMP = { vriend:['How are you? I am really looking forward to my visit next month.', 'Thanks for your message. I had a great time at your party!', 'Guess what? We have got a new puppy!'],
    naam:['Thank you for your quick reply to my email.', 'I am writing to thank you for the lovely week at your hotel.', 'I am writing to ask if there are any places left on the course.'],
    onbekend:['I am writing to ask for information about your summer courses.', 'I am writing to complain about the jacket I ordered from your website.', 'I would like to book a room for two nights in July.'] };

  function opgAanhef(){
    var soort = kies(['vriend', 'naam', 'naam', 'onbekend']), L = lezer(soort), goed = aanhefVan(L), andere, st = [];
    var mr = L.man ? 'Mr ' : 'Ms ';
    st.push(vast('Ken je deze persoon goed, zoals een vriend of familielid?', ['ja: je schrijft informeel', 'nee: je schrijft formeel'], soort === 'vriend' ? 'ja: je schrijft informeel' : 'nee: je schrijft formeel',
      soort === 'vriend' ? 'Je schrijft aan ' + L.wie.split(' ').slice(0, 2).join(' ') + '. Die ken je goed.' : 'Je schrijft aan ' + (L.rol || L.wie) + '. Die ken je niet persoonlijk.'));
    if (soort === 'vriend'){
      st.push(vast('Welke naam gebruik je?', ['de voornaam: ' + L.vn, 'de achternaam: ' + L.an], 'de voornaam: ' + L.vn, 'Een vriend of familielid spreek je aan met de voornaam, zonder Mr of Ms.'));
      andere = ['Dear ' + mr + L.an + ',', 'Dear ' + mr + L.vn + ',', 'Dear Sir or Madam,'];
    } else {
      st.push(vast('Weet je de naam van de persoon?', ['ja', 'nee'], soort === 'naam' ? 'ja' : 'nee', soort === 'naam' ? 'Je weet de naam: ' + L.vn + ' ' + L.an + '.' : 'Je schrijft aan een bedrijf of organisatie. Je weet niet wie je e-mail leest.'));
      if (soort === 'naam'){
        st.push(vast('Is het een man of een vrouw?', ['een man: Mr', 'een vrouw: Ms'], L.man ? 'een man: Mr' : 'een vrouw: Ms', L.man ? 'De heer ' + L.an + ' is een man: Mr.' : 'Mevrouw ' + L.an + ' is een vrouw: Ms.'));
        andere = ['Dear ' + mr + L.vn + ',', 'Hi ' + L.vn + ',', 'Dear Sir or Madam,'];
      } else andere = ['Hi there,', 'Dear Mr or Ms,', 'Dear friend,'];
    }
    var hint = soort === 'vriend' ? 'Informeel: Hi of Dear met de voornaam.' : soort === 'naam' ? 'Formeel met een naam: Dear, ' + mr.trim() + ' en de achternaam. Nooit de voornaam na Mr of Ms.' : 'Formeel zonder naam: Dear Sir or Madam.';
    st.push(keuze('Welke aanhef schrijf je?', goed, andere, hint));
    var romp = kies(ROMP[soort]);
    return eindKeuze({ context:(soort === 'naam' ? 'Je schrijft aan ' + S(L.rol) + '. ' : soort === 'onbekend' ? 'Je weet niet wie je e-mail leest. ' : '') + 'Welke aanhef schrijf je?',
      vraag:'Aan: ' + L.wie, stappen:st, beeld:function(n){
        return blok([n >= st.length ? '<mark>' + S(goed) + '</mark>' : '…', S(romp), '…']);
      } });
  }

  var AFS = { vriend:['Love,', 'Best wishes,'] };
  function opgAfsluiting(){
    var soort = kies(['vriend', 'naam', 'onbekend']), L = lezer(soort), aanhef = aanhefVan(L), romp = kies(ROMP[soort]);
    var BEGIN = ['informeel: met Hi of Dear en een voornaam', 'formeel: met Mr of Ms en een achternaam', 'formeel: zonder naam, met Dear Sir or Madam'];
    var goed = soort === 'vriend' ? kies(AFS.vriend) : soort === 'naam' ? 'Yours sincerely,' : 'Yours faithfully,';
    var andere = soort === 'vriend' ? ['Yours sincerely,', 'Yours faithfully,'] : soort === 'naam' ? ['Yours faithfully,', kies(AFS.vriend)] : ['Yours sincerely,', kies(AFS.vriend)];
    var hint1 = 'Kijk naar de aanhef: ' + aanhef;
    var hint2 = soort === 'vriend' ? 'Een informele e-mail sluit je af met Love of Best wishes.' : soort === 'naam' ? 'Je kent de naam van de lezer: Yours sincerely.' : 'Je kent de naam niet: Yours faithfully. Sir en sincerely gaan nooit samen.';
    var st = [ vast('Hoe begint de e-mail?', BEGIN, BEGIN[{ vriend:0, naam:1, onbekend:2 }[soort]], hint1),
      keuze('Welke afsluiting past daarbij?', goed, andere, hint2) ];
    var naam = soort === 'vriend' ? 'Sophie' : 'Sophie de Vries';
    return eindKeuze({ context:'Hoe sluit je deze e-mail af?', vraag:aanhef, vraagHtml:vraagEn(aanhef), stappen:st, beeld:function(n){
      return blok([n >= 1 ? '<mark>' + S(aanhef) + '</mark>' : S(aanhef), S(romp), n >= 2 ? '<mark>' + S(goed) + '</mark>' : '…', S(naam)]);
    } });
  }

  /* ---------- de datum ---------- */
  var MAAND = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MAAND_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  function rangAfk(n){ var e = n % 10, t = n % 100; if (t >= 11 && t <= 13) return n + 'th'; return n + (e === 1 ? 'st' : e === 2 ? 'nd' : e === 3 ? 'rd' : 'th'); }
  function twee(n){ return (n < 10 ? '0' : '') + n; }
  function opgDatum(){
    var m = R.heel(1, 12), d = R.heel(1, m === 2 ? 28 : 30), j = R.heel(2025, 2027), M = MAAND[m - 1];
    var nl = twee(d) + '-' + twee(m) + '-' + j, goed = d + ' ' + M + ' ' + j;
    var mCtrl = function(v){ return norm(v) === M; };
    var f1 = {}; f1[M.toLowerCase()] = 'Maanden krijgen in het Engels een hoofdletter: ' + M + '.';
    if (MAAND_NL[m - 1] !== M.toLowerCase()) f1[MAAND_NL[m - 1]] = 'Dat is het Nederlands. In het Engels: ' + M + '.';
    var dCtrl = zinControle([goed, rangAfk(d) + ' ' + M + ' ' + j], { hoofd:true });
    var f3 = {}; f3[(M + ' ' + d + ' ' + j).toLowerCase()] = 'Zo doen Amerikanen het. In een Britse brief komt de dag eerst.'; f3[(M + ' ' + d + ', ' + j).toLowerCase()] = 'Zo doen Amerikanen het. In een Britse brief komt de dag eerst.';
    f3[goed.toLowerCase()] = 'Let op de hoofdletter van de maand.';
    if (d < 10) f3[('0' + d + ' ' + M + ' ' + j).toLowerCase()] = 'Schrijf de dag zonder 0 ervoor: ' + d + '.';
    f3[(d + '-' + m + '-' + j)] = 'Schrijf de maand voluit in woorden.';
    var st = [ invul('Maand ' + m + ' is ' + MAAND_NL[m - 1] + '. In het Engels:', M, 'Maand ' + m + ' is ' + M + ', met een hoofdletter.', { controle:mCtrl, fout:f1, invoer:'tekst' }),
      vast('In welke volgorde schrijf je de datum in een Britse brief?', ['dag, maand, jaar', 'maand, dag, jaar'], 'dag, maand, jaar', 'In Groot-Brittannië komt eerst de dag, dan de maand, dan het jaar. Amerikanen zetten de maand vooraan.'),
      invul('Schrijf de datum op:', goed, 'Eerst de dag (' + d + '), dan de maand (' + M + '), dan het jaar (' + j + '): ' + goed + '.', { controle:dCtrl, fout:f3, invoer:'tekst' }) ];
    return { context:'Je schrijft een brief naar Engeland. Schrijf de datum zoals in een Britse brief.', vraag:nl, stappen:st, controle:dCtrl, invoer:'tekst',
      beeld:function(n){
        return '<div class="lr-tekst" lang="en"><p style="text-align:right">' + (n >= 3 ? '<mark>' + S(goed) + '</mark>' : '…') + '</p><p>Dear Sir or Madam,</p><p>…</p></div>';
      } };
  }

  /* ================= A2: woorden die je verwart ================= */
  /* zet het gat in de zin; aan het begin van de zin met een hoofdletter */
  function zinBegin(zin){ return /(^|[.!?] )___/.test(zin); }
  function opPlek(zin, w){ return zinBegin(zin) ? cap(w) : w; }
  function vulIn(zin, w){ return zin.replace('___', opPlek(zin, w)); }
  function optVan(zin, lijst){ return zinBegin(zin) ? lijst.map(cap) : lijst; }
  function proef(zin, w, ok){
    return '<div class="lr-tekst"><p lang="en">' + S(zin).replace('___', '<mark>' + S(opPlek(zin, w)) + '</mark>') + '</p><p>' + (ok ? 'Dat klopt.' : 'Dat klopt niet.') + '</p></div>';
  }
  function klaar(zin, w){ return blok([S(zin).replace('___', '<mark>' + S(opPlek(zin, w)) + '</mark>')]); }
  /* de vervangproef: zin, vol (it is), of null als het niet kan; de twee woorden; welke is de samentrekking */
  function vervang(o){
    var zin = o.zin, kan = !!o.vol, w = kan ? o.kort : o.bezit, opties = optVan(zin, o.paar), goedOpt = opPlek(zin, w);
    var toets = kan ? o.vol : o.proef;
    var st = [ vast('Zet ' + o.proefTxt + ' op de plek van het gat. Klopt de zin dan?', ['ja', 'nee'], kan ? 'ja' : 'nee',
        'Lees: ' + vulIn(zin, toets) + (kan ? ' Dat is een goede zin.' : ' Dat is geen goede zin.')),
      { tekst:'Dus schrijf je', opties:opties, goed:opties.indexOf(goedOpt), hint:kan ? cap(o.vol) + ' past: dan schrijf je ' + o.kort + ', met een apostrof.' : cap(o.proef) + ' past niet. Dan gaat het om ' + o.betekenis + ': ' + o.bezit + ', zonder apostrof.' } ];
    return eindKeuze({ context:'Welk woord past in het gat?', vraag:zin, vraagHtml:vraagEn(zin), stappen:st, beeld:function(n){
      if (n >= 2) return klaar(zin, w);
      if (n >= 1) return proef(zin, toets, kan);
      return '';
    } });
  }
  /* its of it's: zin, en 'is', 'has' of '' (dan its) */
  var ITS = [['I think ___ going to rain.', 'is'], ['___ my birthday tomorrow.', 'is'], ['___ been a long day.', 'has'], ['Look at that dog! ___ so cute.', 'is'],
    ['___ too cold to swim today.', 'is'], ['Where is my phone? I think ___ in my bag.', 'is'], ['___ been raining all morning.', 'has'], ['Do you like this song? ___ my favourite.', 'is'],
    ['___ already started.', 'has'], ['I love this book. ___ really funny.', 'is'],
    ['The dog wagged ___ tail.', ''], ['The bird built ___ nest in our garden.', ''], ['The school has ___ own swimming pool.', ''], ['The company changed ___ name.', ''],
    ['The cat is licking ___ paws.', ''], ['This city is famous for ___ old castle.', ''], ['The tree lost all ___ leaves.', ''], ['Every country has ___ own flag.', ''],
    ['The phone fell and ___ screen broke.', ''], ['The hotel is known for ___ friendly staff.', '']];
  function opgIts(){
    var I = kies(ITS);
    return vervang({ zin:I[0], vol:I[1] ? 'it ' + I[1] : null, kort:"it's", bezit:'its', paar:['its', "it's"], proef:'it is', proefTxt:en('it is') + ' of ' + en('it has'), betekenis:'van wie iets is (zijn of haar)' });
  }
  var YOUR = [["___ my best friend.", 1], ['I think ___ right.', 1], ['___ late again!', 1], ["If ___ hungry, there is pizza in the fridge.", 1], ['Tell me when ___ ready.', 1],
    ["___ going to love this film.", 1], ["I know ___ tired, but we have to go.", 1], ['Thank you, ___ very kind.', 1], ['I hope ___ feeling better.', 1],
    ['Is this ___ bag?', 0], ['Please put ___ phone away.', 0], ['What is ___ favourite colour?', 0], ["Don't forget ___ homework.", 0], ['I like ___ new shoes.', 0],
    ['Can I borrow ___ pen?', 0], ['How old is ___ sister?', 0], ['Wash ___ hands before dinner.', 0], ['Thank you for ___ email.', 0]];
  function opgYour(){
    var Y = kies(YOUR);
    return vervang({ zin:Y[0], vol:Y[1] ? 'you are' : null, kort:"you're", bezit:'your', paar:['your', "you're"], proef:'you are', proefTxt:en('you are'), betekenis:'van wie iets is (jouw)' });
  }
  var WHOSE = [['___ coming to the party?', 'is'], ['___ your favourite singer?', 'is'], ['___ that man over there?', 'is'], ['___ been to London?', 'has'], ['___ got a pen?', 'has'],
    ['___ next?', 'is'], ['I know a girl ___ from Spain.', 'is'], ['___ seen my keys?', 'has'],
    ['___ bag is this?', ''], ['___ turn is it?', ''], ['I do not know ___ phone this is.', ''], ['That is the boy ___ dad is a pilot.', ''], ['___ idea was this?', ''],
    ['The girl ___ bike was stolen called the police.', ''], ['___ jacket is on the floor?', '']];
  function opgWhose(){
    var W = kies(WHOSE);
    return vervang({ zin:W[0], vol:W[1] ? 'who ' + W[1] : null, kort:"who's", bezit:'whose', paar:['whose', "who's"], proef:'who is', proefTxt:en('who is') + ' of ' + en('who has'), betekenis:'van wie iets is' });
  }
  /* their, there, they're: zin en soort (k = they're, b = their, p = there) */
  var THEIR = [["___ coming to the party tonight.", 'k'], ['My cousins live in Leeds. ___ very nice.', 'k'], ['Look at those dogs! ___ so big.', 'k'], ['I like my new neighbours. ___ really friendly.', 'k'],
    ['Where are the children? I think ___ in the garden.', 'k'], ['My parents are not home. ___ at work.', 'k'],
    ['The children are playing with ___ toys.', 'b'], ['My parents sold ___ car.', 'b'], ['The students forgot ___ books.', 'b'], ['They are visiting ___ grandparents.', 'b'],
    ['The players thanked ___ fans.', 'b'], ['Many people walk ___ dogs in this park.', 'b'],
    ['Is ___ a bank near here?', 'p'], ['___ are thirty students in my class.', 'p'], ['Put the box over ___.', 'p'], ['I have never been ___.', 'p'],
    ['We went to London and stayed ___ for a week.', 'p'], ['___ is a spider in the bath!', 'p']];
  function opgTheir(){
    var T = kies(THEIR), zin = T[0], s = T[1], w = { k:"they're", b:'their', p:'there' }[s];
    var opties = optVan(zin, ['their', 'there', "they're"]), goed = opPlek(zin, w);
    var st = [ vast('Zet ' + en('they are') + ' op de plek van het gat. Klopt de zin dan?', ['ja', 'nee'], s === 'k' ? 'ja' : 'nee', 'Lees: ' + vulIn(zin, 'they are') + (s === 'k' ? ' Dat is een goede zin.' : ' Dat is geen goede zin.')) ];
    if (s !== 'k') st.push(vast('Betekent het woord hier hun (van hen)?', ['ja', 'nee'], s === 'b' ? 'ja' : 'nee', s === 'b' ? 'Van wie zijn ze? Van hen: hun.' : 'Het gaat niet over van wie iets is. Het betekent daar of er.'));
    st.push({ tekst:'Dus schrijf je', opties:opties, goed:opties.indexOf(goed), hint:{ k:"They are past: they're.", b:'Hun (van hen) is their.', p:'Daar of er is there. Er zit here in: there.' }[s] });
    return eindKeuze({ context:'Welk woord past in het gat?', vraag:zin, vraagHtml:vraagEn(zin), stappen:st, beeld:function(n){
      if (n >= st.length) return klaar(zin, w);
      if (n >= 1) return proef(zin, 'they are', s === 'k');
      return '';
    } });
  }
  /* to, too, two: zin en soort (2 = two, t = too, n = to) */
  var TOO = [['I have ___ brothers.', '2'], ['We waited for ___ hours.', '2'], ['The film starts in ___ minutes.', '2'], ['She bought ___ tickets for the concert.', '2'], ['My little sister is ___ years old.', '2'],
    ['This tea is ___ hot.', 't'], ['I like pizza ___.', 't'], ['You are walking ___ fast.', 't'], ['Can I come ___?', 't'], ['The shoes were ___ small for me.', 't'], ['My brother plays the guitar, and I play it ___.', 't'],
    ['We go ___ school by bike.', 'n'], ['I want ___ learn Spanish.', 'n'], ['Give the book ___ your teacher.', 'n'], ['She is going ___ the cinema.', 'n'], ['I need ___ buy a new phone.', 'n'], ['Welcome ___ London!', 'n']];
  var TOO_BET = ['het getal 2', 'te (te veel) of ook', 'naar, aan of om te'];
  function opgTo(){
    var T = kies(TOO), zin = T[0], s = T[1], w = { '2':'two', t:'too', n:'to' }[s], bet = TOO_BET[{ '2':0, t:1, n:2 }[s]];
    var hint = { '2':'Hoeveel? Er staat een aantal: twee.', t:'Lees de zin in het Nederlands. Je hoort te (te heet, te klein) of ook (ik ook).', n:'Het woord wijst een richting aan (naar school, aan je docent), of staat voor een werkwoord (om te leren).' }[s];
    var st = [ vast('Wat betekent het woord op de plek van het gat?', TOO_BET, bet, hint),
      vast('Dus schrijf je', ['to', 'too', 'two'], w, { '2':'Het getal 2 is two.', t:'Te of ook is too, met twee o\'s.', n:'Naar, aan of om te is to.' }[s]) ];
    return eindKeuze({ context:'Welk woord past in het gat?', vraag:zin, vraagHtml:vraagEn(zin), stappen:st, beeld:function(n){ return n >= 2 ? klaar(zin, w) : ''; } });
  }
  /* then of than: zin en vergelijking (1) of niet (0) */
  var THAN = [['My brother is taller ___ me.', 1], ['A cat is smaller ___ a dog.', 1], ['I like tea more ___ coffee.', 1], ['This test was easier ___ the last one.', 1],
    ['London is bigger ___ Manchester.', 1], ['It is colder today ___ yesterday.', 1], ['She runs faster ___ her sister.', 1], ['A bike is cheaper ___ a car.', 1],
    ['First we had dinner, and ___ we watched a film.', 0], ['Finish your homework. ___ you can play outside.', 0], ['Turn left, and ___ take the second street on the right.', 0],
    ['I was only ten years old ___.', 0], ['If you are tired, ___ go to bed.', 0], ['We went to the beach. ___ we had an ice cream.', 0], ['Wash your hands and ___ sit down.', 0]];
  function opgThan(){
    var T = kies(THAN), zin = T[0], verg = !!T[1], w = verg ? 'than' : 'then', opties = optVan(zin, ['than', 'then']), goed = opPlek(zin, w);
    var st = [ vast('Vergelijk je hier twee dingen (groter dan, liever dan)?', ['ja', 'nee'], verg ? 'ja' : 'nee', verg ? 'Er staat een vergelijking: ' + zin.split(' ___')[0].split(' ').slice(-1)[0] + ' ... dan.' : 'Er wordt niets vergeleken. Het gaat om tijd of volgorde: daarna, toen of dan.'),
      { tekst:'Dus schrijf je', opties:opties, goed:opties.indexOf(goed), hint:verg ? 'Bij een vergelijking: than.' : 'Bij tijd of volgorde (daarna, toen, dan): then.' } ];
    return eindKeuze({ context:'Welk woord past in het gat?', vraag:zin, vraagHtml:vraagEn(zin), stappen:st, beeld:function(n){ return n >= 2 ? klaar(zin, w) : ''; } });
  }

  /* ================= B1: zinnen verbinden ================= */
  var SV = {
    erbij:[['I play the guitar.', 'My sister plays the piano.'], ['The hotel was clean.', 'The staff were friendly.'], ['My mum is a nurse.', 'My dad is a teacher.'],
      ['The food was delicious.', 'The service was fast.'], ['Tom likes swimming.', 'He plays tennis.'], ['We visited a castle.', 'We had lunch by the river.']],
    tegen:[['The test was difficult.', 'Everyone passed it.'], ['I like football.', 'I do not like watching it on TV.'], ['The flat is small.', 'It has a lovely view.'],
      ['We ran to the station.', 'We still missed the train.'], ['He is only ten.', 'He speaks four languages.'], ['It was raining.', 'We went for a walk.'],
      ['She was ill.', 'She went to school.'], ['My phone is very old.', 'It still works perfectly.'], ['We played very well.', 'We lost the match.']],
    gevolg:[['It was raining.', 'We stayed inside.'], ['I was very tired.', 'I went to bed early.'], ['The shop was closed.', 'We went home.'], ['I forgot my lunch.', 'I bought a sandwich.'],
      ['The bus was late.', 'I missed the first lesson.'], ['My phone was broken.', 'I could not call you.'], ['The roads were icy.', 'Many schools were closed.']],
    reden:[['We stayed inside.', 'It was raining.'], ['I went to bed early.', 'I was very tired.'], ['She wore a warm coat.', 'It was freezing outside.'], ['The match was cancelled.', 'The pitch was flooded.'],
      ['Tom was late.', 'He missed the bus.'], ['I am hungry.', 'I did not have breakfast.']] };
  var SV_WOORD = { erbij:'and', tegen:'but', gevolg:'so', reden:'because' };
  var SV_REL = ['iets wat erbij komt', 'een tegenstelling', 'een gevolg', 'een reden'];
  var SV_RELI = { erbij:0, tegen:1, gevolg:2, reden:3 };
  var SV_HINT = { erbij:'De tweede zin vertelt nog iets, zonder dat het tegen de eerste ingaat.', tegen:'De tweede zin is anders dan je na de eerste zou verwachten.',
    gevolg:'De tweede zin is wat er daardoor gebeurde.', reden:'De tweede zin zegt waarom de eerste zin gebeurde.' };
  function opgSamenvoegen(){
    var rel = kies(['erbij', 'tegen', 'gevolg', 'reden']), P = kies(SV[rel]), w = SV_WOORD[rel];
    var a = zonderPunt(P[0]), b = klein(P[1]);
    var komma = a + ', ' + w + ' ' + b, zonder = a + ' ' + w + ' ' + b;
    var goed = rel === 'reden' || rel === 'erbij' ? zonder : komma;
    var controle = zinControle([komma, zonder], { punt:true });
    var fout = {}; fout[(a + '. ' + w + ' ' + b).toLowerCase()] = 'Maak er één zin van: haal de punt na de eerste zin weg.';
    var st = [ vast('Wat zegt de tweede zin over de eerste?', SV_REL, SV_REL[SV_RELI[rel]], SV_HINT[rel]),
      vast('Welk woord past daarbij?', ['and', 'but', 'so', 'because'], w, 'and = en, but = maar, so = dus, because = omdat. Hier: ' + SV_REL[SV_RELI[rel]] + '.'),
      invul('Schrijf het als één zin.', goed, 'Haal de punt na de eerste zin weg, zet ' + w + ' ertussen en begin de tweede zin met een kleine letter: ' + goed, { controle:controle, fout:fout, invoer:'tekst' }) ];
    var v = P[0] + ' ' + P[1];
    return { context:'Maak van de twee zinnen één zin met and, but, so of because.', vraag:v, vraagHtml:vraagEn(v), stappen:st, controle:controle, invoer:'tekst',
      beeld:function(n){
        if (n < 3) return n >= 2 ? blok([S(a) + ' <mark>' + S(w) + '</mark> …']) : '';
        var i = goed.indexOf(' ' + w + ' ');
        return blok([S(goed.slice(0, i)) + ' <mark>' + S(w) + '</mark> ' + S(goed.slice(i + w.length + 2))]);
      } };
  }

  /* however en de andere: een nieuwe zin met een komma erna */
  var HW = { tegen:SV.tegen,
    gevolg:SV.gevolg,
    voorbeeld:[['There are many ways to save energy at home.', 'You can turn off the lights when you leave a room.'], ['Some animals sleep all winter.', 'Bears and hedgehogs sleep until spring.'],
      ['Many fruits contain a lot of vitamin C.', 'Oranges and kiwis are full of it.'], ['Our school offers lots of after-school clubs.', 'You can join the chess club or the drama club.'],
      ['You can do a lot to stay healthy.', 'You can eat more fruit and walk to school.']],
    erbij:[['Cycling is good for your health.', 'It is cheaper than going by car.'], ['The new library has thousands of books.', 'It has a large computer room.'],
      ['Our hotel had a big swimming pool.', 'Breakfast was included in the price.'], ['Learning a language helps you when you travel.', 'It can help you to find a job.']] };
  var HW_WOORD = { tegen:'However', gevolg:'As a result', voorbeeld:'For example', erbij:'In addition' };
  var HW_REL = ['een tegenstelling', 'een gevolg', 'een voorbeeld', 'iets wat erbij komt'];
  var HW_RELI = { tegen:0, gevolg:1, voorbeeld:2, erbij:3 };
  var HW_HINT = { tegen:SV_HINT.tegen, gevolg:SV_HINT.gevolg, voorbeeld:'De tweede zin noemt een voorbeeld bij de eerste zin.', erbij:'De tweede zin noemt nog een punt over hetzelfde onderwerp.' };
  function opgHowever(){
    var rel = kies(['tegen', 'gevolg', 'voorbeeld', 'erbij']), P = kies(HW[rel]), W = HW_WOORD[rel];
    var b = klein(P[1]), bw = b.split(' ');
    var goed = P[0] + ' ' + W + ', ' + b;
    var splice = zonderPunt(P[0]) + ', ' + W.toLowerCase() + ' ' + b;
    var kleinNa = P[0] + ' ' + W.toLowerCase() + ', ' + b;
    var verkeerd = P[0] + ' ' + W + ' ' + bw[0] + ', ' + bw.slice(1).join(' ');
    var st = [ vast('Wat zegt de tweede zin over de eerste?', HW_REL, HW_REL[HW_RELI[rel]], HW_HINT[rel]),
      vast('Welk verbindingswoord past daarbij?', ['However', 'As a result', 'For example', 'In addition'], W, 'However = maar, echter. As a result = daardoor. For example = bijvoorbeeld. In addition = daarnaast. Hier: ' + HW_REL[HW_RELI[rel]] + '.'),
      keuze('Welke zin heeft de goede leestekens?', goed, [splice, kies([kleinNa, verkeerd])], W + ' begint een nieuwe zin: ervoor een punt, ' + W + ' met een hoofdletter, en direct erna een komma.') ];
    var v = P[0] + ' ' + P[1];
    return eindKeuze({ context:'Verbind de twee zinnen met however, as a result, for example of in addition.', vraag:v, vraagHtml:vraagEn(v), stappen:st, beeld:function(n){
      if (n < 2) return '';
      return blok([S(P[0]) + ' <mark>' + S(W) + (n >= 3 ? ',' : '') + '</mark> ' + S(n >= 3 ? b : P[1])]);
    } });
  }

  /* although vooraan */
  function opgAlthough(){
    var P = kies(SV.tegen), a = klein(zonderPunt(P[0])), b = klein(zonderPunt(P[1]));
    var goed = 'Although ' + a + ', ' + b + '.';
    var controle = zinControle(goed, { punt:true });
    var fout = {}; fout[('although ' + a + ' ' + b + '.').toLowerCase()] = 'Zet een komma na het deel met although.'; fout[('although ' + a + ' ' + b).toLowerCase()] = 'Zet een komma na het deel met although.';
    fout[('although ' + b + ', ' + a + '.').toLowerCase()] = 'Na although komt de eerste zin: ' + a + '.';
    var st = [ keuze('Welk deel zet je direct na ' + en('Although') + '?', a, [b], 'Although betekent hoewel. Na although komt het deel waarna je iets anders verwacht: ' + a + '.'),
      vast('Waar komt de komma?', ['na het deel met although', 'direct na although', 'er komt geen komma'], 'na het deel met although', 'Staat although vooraan, dan zet je een komma na dat hele deel: Although ' + a + ', ...'),
      invul('Schrijf de hele zin.', goed, 'Although, dan ' + a + ', een komma, en dan ' + b + ': ' + goed, { controle:controle, fout:fout, invoer:'tekst' }) ];
    var v = P[0] + ' ' + P[1];
    return { context:'Maak van de twee zinnen één zin die begint met Although.', vraag:v, vraagHtml:vraagEn(v), stappen:st, controle:controle, invoer:'tekst',
      beeld:function(n){
        if (n < 1) return '';
        return blok(['<mark>Although</mark> ' + S(a) + (n >= 2 ? '<mark>,</mark> ' + S(b) + '.' : ' …')]);
      } };
  }

  /* kies de manier die bij de zin past: de leestekens bepalen het woord */
  var KV_WOORD = { tegen:{ P:'however', K:'but', V:'although' }, gevolg:{ P:'as a result', K:'so', V:'because' } };
  var KV_VORM = { P:'een punt ervoor en een komma erna: een nieuwe zin', K:'een komma ervoor: het midden van één zin', V:'het gat staat vooraan en er staat een komma in het midden' };
  function opgVerbindKies(){
    var rel = kies(['tegen', 'gevolg']), P = kies(SV[rel]), vorm = kies(rel === 'tegen' ? ['P', 'V'] : ['P', 'K', 'V']), W = KV_WOORD[rel], w = W[vorm];
    var a = zonderPunt(P[0]), b = klein(P[1]), zin;
    if (vorm === 'P') zin = P[0] + ' ___, ' + b;
    else if (vorm === 'K') zin = a + ', ___ ' + b;
    else zin = '___ ' + klein(a) + ', ' + b;
    var opties = [W.P, W.K, W.V];
    var st = [ vast('Wat is het verband tussen de twee delen?', ['een tegenstelling', 'een gevolg'], rel === 'tegen' ? 'een tegenstelling' : 'een gevolg',
        rel === 'tegen' ? 'Het tweede deel is anders dan je verwacht.' : 'Het tweede deel is wat er daardoor gebeurt.'),
      vast('Kijk naar de leestekens rond het gat. Wat zie je?', [KV_VORM.P, KV_VORM.K, KV_VORM.V], KV_VORM[vorm], vorm === 'P' ? 'Voor het gat staat een punt, erna een komma.' : vorm === 'K' ? 'Voor het gat staat een komma.' : 'Het gat is het eerste woord van de zin.'),
      vast('Welk woord past dus?', opties, w, (rel === 'tegen' ? 'However, but en although geven een tegenstelling. ' : 'As a result, so en because horen bij oorzaak en gevolg. ') +
        { P:cap(W.P) + ' begint een nieuwe zin, met een komma erna.', K:cap(W.K) + ' staat midden in de zin, na een komma.', V:cap(W.V) + ' kan vooraan staan, met een komma na het eerste deel.' }[vorm]) ];
    return eindKeuze({ context:'Welk woord past in het gat? Let op de leestekens.', vraag:zin, vraagHtml:vraagEn(zin), stappen:st, beeld:function(n){ return n >= 3 ? klaar(zin, w) : ''; } });
  }

  /* ================= B2: formeel schrijven ================= */
  /* een zin met een samentrekking, de samentrekking, voluit, en bij 's of 'd: wat erna komt en of dat een voltooid deelwoord is */
  var VL = [["I'm writing to ask about your summer courses.", "I'm", 'I am'], ["I don't understand the second part of the bill.", "don't", 'do not'],
    ["The room wasn't clean when we arrived.", "wasn't", 'was not'], ["We didn't receive the tickets.", "didn't", 'did not'], ["I can't attend the meeting on Monday.", "can't", 'cannot'],
    ["I won't be able to come on Friday.", "won't", 'will not'], ["I've already paid for the course.", "I've", 'I have'], ["The heating isn't working.", "isn't", 'is not'],
    ["We haven't heard from you yet.", "haven't", 'have not'], ["I'll send you the documents tomorrow.", "I'll", 'I will'], ["The staff weren't very helpful.", "weren't", 'were not'],
    ["We're looking forward to your visit.", "We're", 'We are'], ["The parcel hasn't arrived yet.", "hasn't", 'has not'], ["They've cancelled my flight.", "They've", 'They have'],
    ["I couldn't find your address on the website.", "couldn't", 'could not'],
    ["I'd like to book a double room.", "I'd", 'I would', 'like', 0], ["I'd be grateful for your help.", "I'd", 'I would', 'be', 0], ["I'd paid for the room before the price went up.", "I'd", 'I had', 'paid', 1],
    ["It's a great opportunity for me.", "It's", 'It is', 'a great opportunity', 0], ["He's the manager of the hotel.", "He's", 'He is', 'the manager', 0],
    ["There's a problem with my order.", "There's", 'There is', 'a problem', 0], ["She's left the office for the day.", "She's", 'She has', 'left', 1],
    ["It's been three weeks since I ordered the jacket.", "It's", 'It has', 'been', 1], ["He's sent me the wrong size.", "He's", 'He has', 'sent', 1]];
  function opgVoluit(){
    var V = kies(VL), zin = V[0], c = V[1], vol = V[2], dubbel = V.length > 3;
    var woorden = zin.replace(/[.,?]/g, '').split(' ').filter(function(x){ return x.length > 3 && x.indexOf("'") < 0; });
    var andere = R.hussel(woorden.filter(function(x, i){ return woorden.indexOf(x) === i; })).slice(0, 2);
    var st = [ keuze('Welk woord is een samentrekking?', c, andere, 'Zoek het woord met een apostrof (\').') ];
    var fout = {};
    if (dubbel){
      var pp = !!V[4], isD = /'d$/.test(c);
      st.push(vast('Komt er na ' + en(c) + ' een voltooid deelwoord (zoals been, left of paid)?', ['ja', 'nee'], pp ? 'ja' : 'nee',
        'Na ' + c + ' komt ' + V[3] + (pp ? ': dat is een voltooid deelwoord.' : ': dat is geen voltooid deelwoord.')));
      var ander = vol.split(' ')[0] + ' ' + (isD ? (pp ? 'would' : 'had') : (pp ? 'is' : 'has'));
      fout[ander.toLowerCase()] = isD ? (pp ? "Na 'd staat een voltooid deelwoord: dan is het had." : "Na 'd staat geen voltooid deelwoord: dan is het would.") : (pp ? "Na 's staat een voltooid deelwoord: dan is het has." : "Na 's staat geen voltooid deelwoord: dan is het is.");
    }
    if (vol === 'cannot') fout['can not'] = 'Cannot schrijf je als één woord.';
    var hint = dubbel ? (/'d$/.test(c) ? "'d + voltooid deelwoord = had. 'd + hele werkwoord = would. " : "'s + voltooid deelwoord = has. Anders is 's = is. ") + c + ' wordt ' + vol + '.'
      : vol === 'will not' ? "Won't is een uitzondering: will not." : vol === 'cannot' ? "Can't is cannot, als één woord." : cap(c) + ' wordt ' + vol + '.';
    st.push(invul('Schrijf voluit:', vol, hint, { fout:fout, invoer:'tekst' }));
    return { context:'In een formele brief gebruik je geen samentrekkingen. Schrijf de samentrekking voluit.', vraag:zin, vraagHtml:vraagEn(zin), stappen:st, invoer:'tekst',
      beeld:function(n){
        if (n < 1) return '';
        if (n < st.length) return blok([S(zin).replace(S(c), '<mark>' + S(c) + '</mark>')]);
        return blok([S(zin).replace(S(c), '<mark>' + S(c.charAt(0) === c.charAt(0).toUpperCase() ? cap(vol) : vol) + '</mark>')]);
      } };
  }

  /* formele woorden: zin met {informeel}, informeel, betekenis, formeel, ander informeel woord, formeel woord met een andere betekenis, twee foute betekenissen */
  var FW = [['I {got} your email yesterday.', 'got', 'ontving', 'received', 'got hold of', 'deleted', ['stuurde', 'vergat']],
    ['I {want} to book a room for two nights.', 'want', 'wil graag', 'would like', 'wanna', 'regret', ['moet', 'probeer']],
    ['I {need} more information about the course.', 'need', 'heb nodig', 'require', 'gotta have', 'provide', ['zoek', 'geef']],
    ['The hotel {said sorry} for the mistake.', 'said sorry', 'bood excuses aan', 'apologised', 'felt bad', 'complained', ['klaagde', 'lachte']],
    ['I would like to {ask for} a refund.', 'ask for', 'vragen om', 'request', 'go for', 'refuse', ['wachten op', 'betalen voor']],
    ['We {bought} the tickets online.', 'bought', 'kochten', 'purchased', 'got hold of', 'cancelled', ['verkochten', 'verloren']],
    ['The room was {really} dirty.', 'really', 'erg', 'extremely', 'super', 'slightly', ['een beetje', 'nooit']],
    ['There were {a lot of} problems with the booking.', 'a lot of', 'veel', 'many', 'loads of', 'few', ['weinig', 'geen']],
    ['I {think} the price is too high.', 'think', 'vind', 'believe', 'reckon', 'doubt', ['betwijfel', 'hoop']],
    ['{Thanks} for your quick reply.', 'Thanks', 'bedankt', 'Thank you', 'Cheers', 'Sorry', ['sorry', 'hallo']],
    ['I have {found out} that the museum is closed on Mondays.', 'found out', 'ontdekt', 'discovered', 'figured out', 'forgotten', ['vergeten', 'gehoord']],
    ['Please {get back to me} as soon as possible.', 'get back to me', 'antwoord me', 'reply', 'drop me a line', 'repeat', ['kom terug', 'bel me op']],
    ['The {kids} enjoyed the trip very much.', 'kids', 'kinderen', 'children', 'kiddies', 'adults', ['volwassenen', 'leraren']],
    ['The service in the restaurant was {bad}.', 'bad', 'slecht', 'poor', 'rubbish', 'excellent', ['goed', 'langzaam']],
    ['The concert was {great}.', 'great', 'geweldig', 'excellent', 'awesome', 'average', ['gemiddeld', 'saai']]];
  function opgFormeelWoord(){
    var F = kies(FW), zin = F[0].replace(/[{}]/g, ''), html = S(F[0]).replace('{', '<b><u>').replace('}', '</u></b>');
    var goedZin = F[0].replace(/\{[^}]*\}/, F[3]);
    var st = [ keuze('Wat betekent ' + en(F[1]) + ' hier?', F[2], F[6], 'Lees de hele zin. ' + cap(F[1]) + ' betekent hier ' + F[2] + '.'),
      keuze('Welk woord is formeel en betekent ook ' + S(F[2]) + '?', F[3], [F[4], F[5]], cap(F[4]) + ' is ook informeel. ' + cap(F[5]) + ' betekent iets anders. ' + cap(F[3]) + ' is formeel en betekent ' + F[2] + '.') ];
    return eindKeuze({ context:'Maak de zin formeel. Welk woord vervangt het onderstreepte woord?', vraag:zin, vraagHtml:'<span lang="en">' + html + '</span>', stappen:st, beeld:function(n){
      return n >= 2 ? blok([S(goedZin).replace(S(F[3]), '<mark>' + S(F[3]) + '</mark>')]) : '';
    } });
  }

  /* een beleefd verzoek: een opdracht, het werkwoord en de -ing-vorm */
  var VZ = [['Send me the brochure.', 'send', 'sending'], ['Tell me the price of the course.', 'tell', 'telling'], ['Book a table for four people.', 'book', 'booking'],
    ['Call me back tomorrow.', 'call', 'calling'], ['Change the date of my booking.', 'change', 'changing'], ['Explain the rules of the competition.', 'explain', 'explaining'],
    ['Send me a new ticket.', 'send', 'sending'], ['Check my order.', 'check', 'checking'], ['Give me some information about the trip.', 'give', 'giving'],
    ['Reply before Friday.', 'reply', 'replying'], ['Confirm my reservation.', 'confirm', 'confirming'], ['Repair the heating in my room.', 'repair', 'repairing'],
    ['Help me with my application.', 'help', 'helping'], ['Send me the documents by email.', 'send', 'sending'], ['Tell me when the course starts.', 'tell', 'telling'],
    ['Move my appointment to Thursday.', 'move', 'moving'], ['Open the gym on Sundays.', 'open', 'opening']];
  function opgVerzoek(vorm){
    var V = kies(VZ), kern = klein(zonderPunt(V[0])), ww = V[1];
    var woorden = zonderPunt(V[0]).split(' ').slice(1).filter(function(x){ return x.length > 3; });
    var andere = R.hussel(woorden.filter(function(x, i){ return woorden.indexOf(x) === i; })).slice(0, 2);
    var VORM = ['het hele werkwoord: ' + ww, 'met -ing: ' + V[2], 'met to: to ' + ww];
    var could = vorm === 'could', goed, varianten, controle, fout = {};
    if (could){
      goed = 'Could you ' + kern + '?';
      varianten = [goed, 'Could you please ' + kern + '?'];
      controle = zinControle(varianten);
      fout[('could you ' + kern + '.').toLowerCase()] = 'Een verzoek met Could you is een vraag: zet er een vraagteken achter.';
      fout[('could you ' + kern).toLowerCase()] = 'Zet er een vraagteken achter.';
    } else {
      goed = 'I would be grateful if you could ' + kern + '.';
      varianten = [goed];
      controle = zinControle(varianten, { punt:true });
      fout[('i would be grateful if you could ' + kern + '?').toLowerCase()] = 'Dit is geen vraag. Zet er een punt achter.';
      fout[("i'd be grateful if you could " + kern + '.').toLowerCase()] = 'In een formele brief schrijf je I would voluit.';
    }
    var na = could ? 'Could you' : 'could';
    var st = [ keuze('Welk woord is het werkwoord: wat moet de ander doen?', ww, andere, 'De opdracht begint met het werkwoord: ' + ww + '.'),
      vast('Welke vorm krijgt het werkwoord na ' + en(na) + '?', VORM, VORM[0], 'Na could komt altijd het hele werkwoord, zonder to en zonder -ing: ' + ww + '.'),
      vast('Welk leesteken komt aan het eind?', ['een punt (.)', 'een vraagteken (?)'], could ? 'een vraagteken (?)' : 'een punt (.)',
        could ? 'Could you ...? is een vraag: een vraagteken.' : 'De zin begint met I would be grateful. Dat is geen vraag: een punt.'),
      invul('Schrijf het verzoek.', goed, (could ? 'Could you, dan de rest van de opdracht met een kleine letter, en een vraagteken: ' : 'I would be grateful if you could, dan de rest van de opdracht, en een punt: ') + goed, { controle:controle, fout:fout, invoer:'tekst' }) ];
    return { context:could ? 'Maak van de opdracht een beleefd verzoek met Could you.' : 'Maak van de opdracht een heel formeel verzoek met I would be grateful if you could.',
      vraag:V[0], vraagHtml:vraagEn(V[0]), stappen:st, controle:controle, invoer:'tekst',
      beeld:function(n){
        if (n < 2) return '';
        var begin = could ? 'Could you' : 'I would be grateful if you could', eind = could ? '?' : '.';
        return blok(['<mark>' + S(begin) + '</mark> ' + S(kern) + (n >= 3 ? '<mark>' + eind + '</mark>' : ' …')]);
      } };
  }

  /* de opbouw van een klachtmail: reden, wat er misging, wat je wilt, slotzin */
  var KL = [['I am writing to complain about the headphones I ordered from your website.', 'When they arrived, the left side did not work.', 'I would like you to send me a new pair.'],
    ['I am writing to complain about my stay at your hotel last weekend.', 'Our room was dirty, and the shower did not work.', 'I would like a refund for one night.'],
    ['I am writing to complain about my train journey to York on 3 May.', 'The train was two hours late, so I missed an important meeting.', 'I would like a refund for my ticket.'],
    ['I am writing to complain about the meal I had in your restaurant on Saturday.', 'We waited an hour for our food, and it was cold when it arrived.', 'I would like a refund for the meal.'],
    ['I am writing to complain about a pair of trainers I bought in your shop.', 'After only two weeks, the sole came off.', 'I would like you to replace them or give me my money back.'],
    ['I am writing to complain about the concert in the City Hall last Friday.', 'The concert started an hour late, and the sound was very poor.', 'I would like a refund for my two tickets.'],
    ['I am writing to complain about the delivery of my order.', 'The parcel arrived a week late, and the box was damaged.', 'I would like a discount on my next order.'],
    ['I am writing to complain about the English course I took at your school in July.', 'There were thirty students in my class, but your website promised ten.', 'I would like a refund of part of the course fee.'],
    ['I am writing to complain about our stay at your campsite in August.', 'The toilets were dirty, and the swimming pool was closed all week.', 'I would like a partial refund.'],
    ['I am writing to complain about the repair of my laptop.', 'You promised to repair it in three days, but it took three weeks.', 'I would like a refund of the repair costs.']];
  var KL_SLOT = ['I look forward to hearing from you.', 'I hope to hear from you soon.'];
  function opgKlacht(){
    var K = kies(KL), zinnen = [K[0], K[1], K[2], kies(KL_SLOT)], lt = R.hussel(['A', 'B', 'C', 'D']), L = function(i){ return lt[i]; };
    var regels = [0, 1, 2, 3].map(function(i){ return [lt[i], zinnen[i], i]; }).sort(function(p, q){ return p[0] < q[0] ? -1 : 1; });
    var rij = function(v){ return v.map(L).join(', '); };
    var ROLNAAM = ['reden', 'wat er misging', 'wat je wilt', 'slotzin'];
    var st = [ keuze('Welke zin noemt de reden van je e-mail? Die komt direct na de aanhef.', 'zin ' + L(0), ['zin ' + L(1), 'zin ' + L(2), 'zin ' + L(3)], 'Zoek de zin die begint met I am writing to.'),
      keuze('Welke zin is de slotzin? Die komt als laatste.', 'zin ' + L(3), ['zin ' + L(0), 'zin ' + L(1), 'zin ' + L(2)], 'Zoek de zin waarin je zegt dat je op een antwoord wacht: ' + zinnen[3]),
      vast('Wat komt eerst: wat er misging, of wat je wilt?', ['eerst wat er misging', 'eerst wat je wilt'], 'eerst wat er misging', 'Je legt eerst uit wat het probleem is. Daarna vraag je om een oplossing (I would like ...).'),
      keuze('Welke volgorde is goed?', rij([0, 1, 2, 3]), [rij([0, 2, 1, 3]), rij([1, 0, 2, 3])], 'Reden (' + L(0) + '), wat er misging (' + L(1) + '), wat je wilt (' + L(2) + '), slotzin (' + L(3) + ').') ];
    return eindKeuze({ context:'Je schrijft een klachtmail. Zet de zinnen in de goede volgorde.', vraag:regels.map(function(r){ return r[0] + '. ' + r[1]; }).join(' '),
      vraagHtml:'<div class="lr-tekst" lang="en">' + regels.map(function(r){ return '<p><b>' + r[0] + '.</b> ' + S(r[1]) + '</p>'; }).join('') + '</div>', stappen:st, beeld:function(n){
        if (n < 4) return '';
        return '<div class="lr-tekst"><p lang="en">Dear Sir or Madam,</p>' + [0, 1, 2, 3].map(function(i){ return '<p><mark>' + L(i) + '</mark> <small>' + ROLNAAM[i] + '</small> <span lang="en">' + S(zinnen[i]) + '</span></p>'; }).join('') + '<p lang="en">Yours faithfully,</p></div>';
      } });
  }

  /* ================= de doelen ================= */
  LEERROUTE.voeg('engels', [
    { groep:{ id:'en-sch-a1-zin', niveau:'A1', domein:'schrijven', naam:'Een zin goed opschrijven', uit:'Een Engelse zin begint met een hoofdletter en eindigt met een punt of vraagteken. En met een apostrof maak je van twee woorden één: I am wordt I\'m.' },
      doelen:[
        { id:'en-sch-zin-af', naam:'Hoofdletters, punt en vraagteken', kort:'Vraag of mededeling? Kies het leesteken en zet hoofdletters bij het eerste woord, I en namen',
          uit:'<p>Een zin begint altijd met een <b>hoofdletter</b>. Ook <b>I</b> (ik), namen, dagen, maanden en talen krijgen een hoofdletter: ' + E('Tom and I play football on Saturday.') + '</p><p>Aan het eind komt een <b>punt</b>, of een <b>vraagteken</b> als het een vraag is. Een vraag begint met een vraagwoord (' + E('where, what, how') + ') of met een werkwoord als ' + E('do, can, is') + ': ' + E('Can I sit here?') + '</p>',
          wanneer:'je een zin, berichtje of antwoord in het Engels opschrijft.', maak:opgZinAf },
        { id:'en-sch-apostrof', naam:"Samentrekkingen: I'm, don't, can't", kort:'Laat de letters weg die je niet uitspreekt en zet op die plek een apostrof',
          uit:'<p>In het gewone Engels plak je vaak twee woorden aan elkaar: een <b>samentrekking</b>. ' + E("I am") + ' wordt ' + E("I'm") + ', ' + E('do not') + ' wordt ' + E("don't") + '.</p><p>Je laat een of meer letters weg. Op die plek komt een <b>apostrof</b> (\'). Bij ' + E('not') + ' valt de o weg: ' + E("isn't, didn't") + '. Let op de plek: ' + E("don't") + ', niet ' + E("do'nt") + '.</p><p>Eén uitzondering: ' + E('will not') + ' wordt ' + E("won't") + '.</p>',
          wanneer:'je een berichtje of informele e-mail schrijft.', maak:opgApostrof }
      ] },
    { groep:{ id:'en-sch-a2-mail', niveau:'A2', domein:'schrijven', naam:'Een e-mail of brief beginnen en afsluiten', uit:'De aanhef en de afsluiting hangen af van aan wie je schrijft: een vriend, iemand van wie je de naam weet, of een bedrijf. En de datum schrijf je in een Britse brief anders dan in het Nederlands.' },
      doelen:[
        { id:'en-sch-aanhef', naam:'De aanhef: Hi, Dear of Dear Sir or Madam', kort:'Vriend: Hi of Dear + voornaam. Naam bekend: Dear Mr of Ms + achternaam. Geen naam: Dear Sir or Madam',
          uit:'<p>De <b>aanhef</b> is de eerste regel van je e-mail. Schrijf je aan een <b>vriend</b> of familielid? Dan schrijf je ' + E('Hi Tom,') + ' of ' + E('Dear Tom,') + '.</p><p>Is het <b>formeel</b> en weet je de naam? Dan ' + E('Dear Mr Brown,') + ' (een man) of ' + E('Dear Ms Jones,') + ' (een vrouw), met de <b>achternaam</b>. Weet je de naam niet? Dan ' + E('Dear Sir or Madam,') + '</p><p>Na de aanhef komt een komma. In het Brits Engels staat er geen punt achter Mr en Ms.</p>',
          wanneer:'je een e-mail of brief in het Engels begint.', maak:opgAanhef },
        { id:'en-sch-afsluiting', naam:'De afsluiting: Love, Yours sincerely of Yours faithfully', kort:'Kijk naar de aanhef: voornaam is Love of Best wishes, achternaam is Yours sincerely, geen naam is Yours faithfully',
          uit:'<p>De <b>afsluiting</b> past bij de aanhef. Begon je informeel met een voornaam? Sluit dan af met ' + E('Love,') + ' of ' + E('Best wishes,') + '</p><p>Begon je met ' + E('Dear Mr Brown') + ' of ' + E('Dear Ms Jones') + '? Dan ' + E('Yours sincerely,') + ' Begon je met ' + E('Dear Sir or Madam') + '? Dan ' + E('Yours faithfully,') + '</p><p>Ezelsbruggetje: <b>Sir</b> en <b>sincerely</b> gaan nooit samen. Onder de afsluiting zet je je naam.</p>',
          wanneer:'je een e-mail of brief in het Engels afsluit.', maak:opgAfsluiting },
        { id:'en-sch-datum', naam:'De datum in een Britse brief', kort:'Eerst de dag, dan de maand voluit met een hoofdletter, dan het jaar: 13 October 2026',
          uit:'<p>In een Britse brief schrijf je de <b>datum</b> als <b>dag, maand, jaar</b>: ' + E('13 October 2026') + '. Je mag ook ' + E('13th October 2026') + ' schrijven.</p><p>De <b>maand</b> schrijf je voluit, met een <b>hoofdletter</b>. Zet geen 0 voor de dag: ' + E('3 May') + ', niet ' + E('03 May') + '.</p><p>Let op: Amerikanen zetten de maand vooraan (' + E('October 13') + '). In een Britse brief doe je dat niet.</p>',
          wanneer:'je bovenaan een brief of formele e-mail de datum zet.', maak:opgDatum }
      ] },
    { groep:{ id:'en-sch-a2-verwar', niveau:'A2', domein:'schrijven', naam:'Woorden die je verwart', uit:'Its en it\'s, your en you\'re, their, there en they\'re: ze klinken hetzelfde, maar je schrijft ze anders. Met een vaste proef kies je altijd het goede woord.' },
      doelen:[
        { id:'en-sch-its', naam:"Its of it's", kort:"Past it is of it has? Dan it's. Anders its (zijn of haar)",
          uit:'<p>' + E("it's") + ' is een samentrekking van <b>it is</b> of <b>it has</b>: ' + E("It's cold.") + ' ' + E('its') + ' zonder apostrof betekent <b>zijn of haar</b>: ' + E('The dog wagged its tail.') + '</p><p>De proef: zet ' + E('it is') + ' of ' + E('it has') + ' op de plek. Klopt de zin? Dan schrijf je ' + E("it's") + '. Klopt hij niet? Dan ' + E('its') + '.</p>',
          wanneer:"je twijfelt tussen its en it's.", maak:opgIts },
        { id:'en-sch-your', naam:"Your of you're", kort:"Past you are? Dan you're. Anders your (jouw)",
          uit:'<p>' + E("you're") + ' is een samentrekking van <b>you are</b>: ' + E("You're late.") + ' ' + E('your') + ' betekent <b>jouw</b>: ' + E('Is this your bag?') + '</p><p>De proef: zet ' + E('you are') + ' op de plek. Klopt de zin? Dan ' + E("you're") + '. Anders ' + E('your') + '.</p>',
          wanneer:"je twijfelt tussen your en you're.", maak:opgYour },
        { id:'en-sch-their', naam:"Their, there of they're", kort:"Past they are? Dan they're. Betekent het hun? Dan their. Anders there (daar, er)",
          uit:'<p>Drie woorden die hetzelfde klinken. ' + E("they're") + ' = <b>they are</b>. ' + E('their') + ' = <b>hun</b>: ' + E('their car') + '. ' + E('there') + ' = <b>daar</b> of <b>er</b>: ' + E('over there, there is') + '.</p><p>Stap 1: past ' + E('they are') + '? Dan ' + E("they're") + '. Stap 2: betekent het hun? Dan ' + E('their') + '. Anders is het ' + E('there') + '. Ezelsbruggetje: in ' + E('there') + ' zit ' + E('here') + ', ook een plek.</p>',
          wanneer:"je twijfelt tussen their, there en they're.", maak:opgTheir },
        { id:'en-sch-to-too', naam:'To, too of two', kort:'Het getal 2 is two. Te of ook is too. Naar, aan of om te is to',
          uit:'<p>' + E('two') + ' is het getal <b>2</b>: ' + E('two brothers') + '.</p><p>' + E('too') + ' met twee o\'s betekent <b>te</b> of <b>ook</b>: ' + E('too hot') + ' (te heet), ' + E('me too') + ' (ik ook).</p><p>' + E('to') + ' betekent <b>naar</b> of <b>aan</b>, of staat voor een werkwoord (<b>om te</b>): ' + E('I go to school. I want to learn.') + '</p>',
          wanneer:'je twijfelt tussen to, too en two.', maak:opgTo },
        { id:'en-sch-then-than', naam:'Then of than', kort:'Vergelijk je iets? Dan than. Gaat het om tijd of volgorde? Dan then',
          uit:'<p>' + E('than') + ' gebruik je bij een <b>vergelijking</b>: ' + E('My brother is taller than me.') + ' (groter dan).</p><p>' + E('then') + ' gaat over <b>tijd of volgorde</b>: daarna, toen of dan. ' + E('First we ate, then we watched a film.') + '</p><p>Let op: het Nederlandse woord dan kan allebei zijn. Vraag je dus af: vergelijk ik hier iets?</p>',
          wanneer:'je twijfelt tussen then en than.', maak:opgThan },
        { id:'en-sch-whose', naam:"Whose of who's", kort:"Past who is of who has? Dan who's. Anders whose (van wie)",
          uit:'<p>' + E("who's") + ' is een samentrekking van <b>who is</b> of <b>who has</b>: ' + E("Who's coming?") + ' ' + E('whose') + ' betekent <b>van wie</b>: ' + E('Whose bag is this?') + '</p><p>De proef: zet ' + E('who is') + ' of ' + E('who has') + ' op de plek. Klopt de zin? Dan ' + E("who's") + '. Anders ' + E('whose') + '.</p>',
          wanneer:"je twijfelt tussen whose en who's.", maak:opgWhose }
      ] },
    { groep:{ id:'en-sch-b1-verbind', niveau:'B1', domein:'schrijven', naam:'Zinnen verbinden', uit:'Korte zinnen achter elkaar lezen stroef. Met and, but, so, because, however en although verbind je ze. Elk woord heeft zijn eigen plek en leestekens.' },
      doelen:[
        { id:'en-sch-samenvoegen', naam:'Samenvoegen met and, but, so of because', kort:'Bepaal het verband, kies het woord en maak er één zin van',
          uit:'<p>Twee korte zinnen maak je één zin met een <b>verbindingswoord</b>. Bepaal eerst het <b>verband</b>.</p><p>Komt er iets bij? <b>and</b>. Een tegenstelling? <b>but</b>. Een gevolg? <b>so</b>. Een reden? <b>because</b>: ' + E('We stayed inside because it was raining.') + '</p><p>Haal de punt na de eerste zin weg en begin het tweede deel met een kleine letter. Voor but en so staat vaak een komma: ' + E('It was raining, so we stayed inside.') + '</p>',
          wanneer:'je tekst uit veel korte zinnetjes bestaat.', maak:opgSamenvoegen },
        { id:'en-sch-however', naam:'However, as a result, for example: punt en komma', kort:'Het verbindingswoord begint een nieuwe zin: punt ervoor, komma erna',
          uit:'<p>' + E('However') + ' (maar), ' + E('As a result') + ' (daardoor), ' + E('For example') + ' (bijvoorbeeld) en ' + E('In addition') + ' (daarnaast) verbinden twee <b>hele zinnen</b>.</p><p>Ervoor staat een <b>punt</b>, het woord krijgt een <b>hoofdletter</b>, en direct erna komt een <b>komma</b>: ' + E('The test was difficult. However, everyone passed it.') + '</p><p>Fout is: ' + E('The test was difficult, however everyone passed it.') + '</p>',
          wanneer:'je in een tekst of opstel zinnen netjes wilt laten aansluiten.', maak:opgHowever },
        { id:'en-sch-although', naam:'Although vooraan, met een komma', kort:'Although + het eerste deel, dan een komma, dan het tweede deel',
          uit:'<p><b>Although</b> betekent hoewel. Je zet het vooraan, voor het deel waarna je iets anders verwacht.</p><p>Na dat hele deel komt een <b>komma</b>, dan volgt de rest: ' + E('Although the test was difficult, everyone passed it.') + '</p><p>Het tweede deel begint met een kleine letter, behalve bij I of een naam.</p>',
          wanneer:'je een tegenstelling in één zin wilt zetten.', maak:opgAlthough },
        { id:'en-sch-verbind-kies', naam:'Kies de manier die bij de zin past', kort:'Kijk naar de leestekens rond het gat: die bepalen welk verbindingswoord past',
          uit:'<p>Voor hetzelfde verband zijn er drie manieren. Welke past, zie je aan de <b>leestekens</b>.</p><p><b>Punt ervoor, komma erna</b>: een nieuwe zin, dus ' + E('However,') + ' of ' + E('As a result,') + '. <b>Komma ervoor</b>, midden in de zin: ' + E('but') + ' of ' + E('so') + '. <b>Vooraan</b>, met een komma in het midden: ' + E('Although') + ' of ' + E('Because') + '.</p><p>Bepaal eerst het verband (tegenstelling of gevolg), kijk dan naar de leestekens.</p>',
          wanneer:'je een invuloefening met verbindingswoorden maakt of je eigen zinnen nakijkt.', maak:opgVerbindKies }
      ] },
    { groep:{ id:'en-sch-b2-formeel', niveau:'B2', domein:'schrijven', naam:'Formeel schrijven', uit:'In een formele e-mail aan een bedrijf of instantie schrijf je zonder samentrekkingen, met formele woorden en beleefde verzoeken. En je bouwt hem op in een vaste volgorde.' },
      doelen:[
        { id:'en-sch-voluit', naam:'Samentrekkingen voluit schrijven', kort:"Zoek de apostrof en schrijf beide woorden voluit; bij 's en 'd kijk je wat erna komt",
          uit:'<p>In een <b>formele</b> brief gebruik je geen samentrekkingen. ' + E("I'm") + ' wordt ' + E('I am') + ', ' + E("don't") + ' wordt ' + E('do not') + ', ' + E("can't") + ' wordt ' + E('cannot') + ' (één woord).</p><p>Let op <b>\'s</b> en <b>\'d</b>. Komt er een <b>voltooid deelwoord</b> achter? Dan is \'s <b>has</b> en \'d <b>had</b>: ' + E("It's been") + ' = ' + E('It has been') + '. Anders is \'s <b>is</b> en \'d <b>would</b>: ' + E("I'd like") + ' = ' + E('I would like') + '.</p>',
          wanneer:'je een formele brief of e-mail schrijft of nakijkt.', maak:opgVoluit },
        { id:'en-sch-formeel-woord', naam:'Formele woorden kiezen', kort:'Bepaal wat het woord betekent en kies het formele woord met dezelfde betekenis',
          uit:'<p>In een formele e-mail vervang je <b>informele woorden</b> door formele: ' + E('get') + ' wordt ' + E('receive') + ', ' + E('want') + ' wordt ' + E('would like') + ', ' + E('a lot of') + ' wordt ' + E('many') + '.</p><p>Stap 1: wat betekent het woord hier? Stap 2: kies het woord dat <b>hetzelfde betekent</b> en <b>formeel</b> is. Pas op voor een ander informeel woord, en voor een formeel woord dat iets anders betekent.</p>',
          wanneer:'je een formele brief of e-mail schrijft.', maak:opgFormeelWoord },
        { id:'en-sch-could-you', naam:'Een beleefd verzoek: Could you ...?', kort:'Could you + het hele werkwoord + de rest + een vraagteken',
          uit:'<p>Een opdracht als ' + E('Send me the brochure.') + ' is onbeleefd in een e-mail. Maak er een <b>vraag</b> van met <b>Could you</b>.</p><p>Na ' + E('Could you') + ' komt het <b>hele werkwoord</b>, zonder to of -ing. Aan het eind staat een <b>vraagteken</b>: ' + E('Could you send me the brochure?') + '</p>',
          wanneer:'je iemand netjes om iets vraagt, in een e-mail of gesprek.', maak:function(){ return opgVerzoek('could'); } },
        { id:'en-sch-grateful', naam:'Heel formeel: I would be grateful if you could ...', kort:'I would be grateful if you could + het hele werkwoord + de rest + een punt',
          uit:'<p>In een heel <b>formele</b> brief vraag je iets met <b>I would be grateful if you could</b> (ik zou het op prijs stellen als u ...).</p><p>Daarna komt het <b>hele werkwoord</b> en de rest van het verzoek. Het is geen vraag, dus je eindigt met een <b>punt</b>: ' + E('I would be grateful if you could send me the brochure.') + '</p><p>Schrijf ' + E('I would') + ' voluit, niet ' + E("I'd") + '.</p>',
          wanneer:'je een sollicitatie, klacht of officiële vraag schrijft.', maak:function(){ return opgVerzoek('grateful'); } },
        { id:'en-sch-klacht', naam:'De opbouw van een klachtmail', kort:'Reden, wat er misging, wat je wilt, slotzin: altijd in die volgorde',
          uit:'<p>Een <b>klachtmail</b> heeft een vaste opbouw. Na de aanhef noem je de <b>reden</b>: ' + E('I am writing to complain about ...') + '</p><p>Dan vertel je <b>wat er misging</b>. Daarna zeg je <b>wat je wilt</b>: ' + E('I would like a refund.') + ' Je eindigt met een <b>slotzin</b>: ' + E('I look forward to hearing from you.') + '</p><p>Let op: ' + E('look forward to') + ' + <b>-ing</b>: ' + E('hearing') + ', niet ' + E('hear') + '.</p>',
          wanneer:'je een klacht schrijft over iets wat je gekocht of geboekt hebt.', maak:opgKlacht }
      ] }
  ]);
})();
