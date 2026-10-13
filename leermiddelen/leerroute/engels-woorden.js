/* De leerroute Engels: woorden en spelling.
   A1: het meervoud, hoofdletters, getallen in woorden en rangtelwoorden.
   A2: bezit met 's en s', woorden met un-, dis- en im-, en nieuwe woorden maken
   met -ness, -ment, -ful en -less. Uitleg en stappen in het Nederlands, de woorden
   en zinnen in Brits Engels. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R = LEERROUTE.R;
  function kies(l){ return R.kies(l); }
  function kans(p){ return Math.random() < p; }
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
  function engels(h){ return '<div lang="en">' + h + '</div>'; }

  /* ---------- het meervoud ---------- */
  var MV = { gewoon:'book books, car cars, dog dogs, friend friends, house houses, apple apples, girl girls, shop shops, pen pens, teacher teachers, boy boys, day days, key keys, toy toys, monkey monkeys',
    es:'bus buses, box boxes, glass glasses, dish dishes, watch watches, church churches, class classes, fox foxes, brush brushes, beach beaches, sandwich sandwiches, dress dresses',
    ies:'baby babies, city cities, country countries, party parties, story stories, family families, library libraries, dictionary dictionaries, lady ladies, butterfly butterflies',
    ves:'leaf leaves, wolf wolves, knife knives, wife wives, half halves, shelf shelves, life lives, loaf loaves, thief thieves' };
  var MVL = {};
  Object.keys(MV).forEach(function(c){ MVL[c] = MV[c].split(',').map(function(x){ var p = x.trim().split(' '); return { e:p[0], m:p[1], c:c }; }); });
  var MV_EIND = { es:'op s, ss, sh, ch of x', ies:'op een medeklinker + y', ves:'op f of fe', gewoon:'op iets anders' };
  var MV_UIT = { gewoon:'-s', es:'-es', ies:'y wordt -ies', ves:'f of fe wordt -ves' };
  function opgMeervoud(){
    var c = kies(['gewoon', 'es', 'ies', 'ves']), W = kies(MVL[c]), e = W.e;
    var eind = { es:e + ' eindigt op ' + (/(ss|sh|ch)$/.test(e) ? e.slice(-2) : e.slice(-1)) + '.', ies:e + ' eindigt op een medeklinker + y.', ves:e + ' eindigt op ' + (/fe$/.test(e) ? 'fe' : 'f') + '.',
      gewoon:/[aeiou]y$/.test(e) ? e + ' eindigt op een klinker + y: dat telt als iets anders.' : e + ' eindigt niet op s, sh, ch, x, y of f.' }[c];
    var fout = {};
    if (c !== 'gewoon') fout[e + 's'] = 'Let op de spelling: ' + MV_UIT[c] + '.';
    if (c === 'gewoon' && /[aeiou]y$/.test(e)) fout[e.slice(0, -1) + 'ies'] = 'Voor de y staat een klinker: de y blijft, en je zet er alleen -s achter.';
    if (c === 'ies') fout[e + 'es'] = 'De y wordt i: ' + W.m + '.';
    if (c === 'ves') fout[e + 'es'] = 'De f wordt een v: ' + W.m + '.';
    var st = [ vast('Waar eindigt ' + en(e) + ' op?', [MV_EIND.es, MV_EIND.ies, MV_EIND.ves, MV_EIND.gewoon], MV_EIND[c], eind),
      vast('Hoe maak je het meervoud?', [MV_UIT.gewoon, MV_UIT.es, MV_UIT.ies, MV_UIT.ves], MV_UIT[c], { gewoon:'Bij de meeste woorden zet je gewoon -s erachter.', es:'Na s, ss, sh, ch en x zet je -es erachter.', ies:'Medeklinker + y: de y wordt -ies.', ves:'Bij deze woorden op f of fe wordt het -ves.' }[c]),
      invul('Het meervoud van ' + en(e) + ' is', W.m, e + ' wordt ' + W.m + '.', { fout:fout }) ];
    /* het plaatje: het woord in stukken, het nieuwe stuk gekleurd */
    var vast_ = c === 'ies' ? e.slice(0, -1) : c === 'ves' ? e.replace(/fe?$/, '') : e, nieuw = W.m.slice(vast_.length);
    var v = 'one ' + e + ', two ___';
    return { context:'Schrijf het meervoud.', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(n){
      return engels(n >= 3 ? R.teken.woord([{ t:vast_, k:1 }, { t:nieuw, k:2, label:MV_UIT[c] }]) : R.teken.woord([{ t:e, k:1, label:'enkelvoud' }])); } };
  }

  /* ---------- hoofdletters ---------- */
  var HL = [['We go swimming on {}.', 'Monday', 'd'], ['My birthday is in {}.', 'March', 'd'], ['School starts again in {}.', 'September', 'd'],
    ['The party is on {}.', 'Saturday', 'd'], ['We have a test on {}.', 'Friday', 'd'], ['Christmas is in {}.', 'December', 'd'],
    ['I visit my grandma every {}.', 'Sunday', 'd'], ['The shop is closed on {}.', 'Wednesday', 'd'], ['It is often hot in {}.', 'July', 'd'],
    ['Do you speak {}?', 'French', 't'], ['My cousin is learning {}.', 'Spanish', 't'], ['We went to {} last summer.', 'Italy', 't'],
    ['She has a {} car.', 'German', 't'], ['I love {} food.', 'Chinese', 't'], ['Our first lesson today is {}.', 'English', 't'],
    ['They live in {}.', 'Scotland', 't'], ['My neighbour is {}.', 'Dutch', 't'],
    ['Tom and {} went to the cinema.', 'I', 'i'], ['Yesterday {} played football.', 'I', 'i'], ['Can {} help you?', 'I', 'i'], ['My sister and {} like pizza.', 'I', 'i'],
    ['It is very cold in {}.', 'winter', 'k'], ['We go to the beach in {}.', 'summer', 'k'], ['The leaves fall in {}.', 'autumn', 'k'],
    ['Our first lesson today is {}.', 'maths', 'k'], ['I have {} after lunch.', 'history', 'k'], ['My favourite subject is {}.', 'geography', 'k'],
    ['We have {} on Tuesdays.', 'science', 'k'], ['The flowers come out in {}.', 'spring', 'k'], ['I am good at {}.', 'art', 'k']];
  var HL_SOORT = { d:'een dag of een maand', t:'een taal, een land of een nationaliteit', i:'het woord I (ik)', k:'een seizoen of een schoolvak (geen taal)' };
  function opgHoofdletter(){
    var H = kies(HL), w = H[1], klein = w.toLowerCase(), hoofd = H[2] !== 'k';
    var zin = H[0].replace('{}', klein), html = S(H[0]).replace('{}', '<b><u>' + S(klein) + '</u></b>');
    var waarom = { d:'Dagen en maanden krijgen in het Engels altijd een hoofdletter.', t:'Talen, landen en nationaliteiten krijgen in het Engels altijd een hoofdletter.', i:'Het woord I (ik) is in het Engels altijd een hoofdletter.', k:'Seizoenen en schoolvakken (behalve talen) krijgen geen hoofdletter.' }[H[2]];
    var controle = function(v){ return String(v).trim() === w; };
    var fout = {}; fout[hoofd ? klein : cap(w)] = waarom;
    var st = [ vast('Wat voor woord is ' + en(klein) + '?', [HL_SOORT.d, HL_SOORT.t, HL_SOORT.i, HL_SOORT.k], HL_SOORT[H[2]], 'Wat betekent ' + klein + '? Is het een dag, een maand, een taal, een land, ik, een seizoen of een vak?'),
      vast('Krijgt het een hoofdletter?', ['ja', 'nee'], hoofd ? 'ja' : 'nee', waarom),
      invul('Schrijf het woord goed:', w, waarom + ' Je schrijft: ' + w + '.', { controle:controle, fout:fout, invoer:'tekst' }) ];
    return { context:'Moet het gemarkeerde woord een hoofdletter? Schrijf het goed.', vraag:zin, vraagHtml:'<span lang="en">' + html + '</span>', stappen:st, controle:controle, invoer:'tekst',
      beeld:function(n){ return n >= 3 ? engels('<p class="lr-zin"><span class="los">' + S(H[0]).replace('{}', '<b>' + S(w) + '</b>') + '</span></p>') : ''; } };
  }

  /* ---------- getallen in woorden ---------- */
  var EEN = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TIEN = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function onder100(n){ return n < 20 ? EEN[n] : TIEN[Math.floor(n / 10)] + (n % 10 ? '-' + EEN[n % 10] : ''); }
  function varianten(t){ return t.indexOf('-') >= 0 ? [t, t.replace(/-/g, ' ')] : t; }
  var TIEN_FOUT = { forty:{ fourty:'Let op: four heeft een u, maar forty niet.' }, fifty:{ fivety:'Five wordt fif: fifty.' }, twenty:{ twoty:'Twee tientallen is twenty.' },
    thirty:{ threety:'Drie tientallen is thirty.', thirdy:'Je schrijft thirty, met een t.' }, eighty:{ eightty:'Eight + ty heeft maar één t: eighty.' }, ninety:{ ninty:'Ninety schrijf je met een e: nine + ty.' } };
  function opgGetal(){
    var groot = kans(.5), n, st = [], ant;
    if (!groot){
      do { n = R.heel(21, 99); } while (n % 10 === 0);
      var t = Math.floor(n / 10), e = n % 10;
      ant = onder100(n);
      st.push(invul('De tientallen: ' + (t * 10) + ' =', TIEN[t], (t * 10) + ' is ' + TIEN[t] + '. Let op de spelling.', { fout:TIEN_FOUT[TIEN[t]] || {} }));
      st.push(invul('De eenheden: ' + e + ' =', EEN[e], e + ' is ' + EEN[e] + '.'));
      var f = {}; f[TIEN[t] + EEN[e]] = 'Zet een streepje tussen de tientallen en de eenheden.';
      st.push(invul('Samen, met een streepje ertussen:', varianten(ant), TIEN[t] + ' + ' + EEN[e] + ' = ' + ant + '.', { fout:f }));
    } else {
      var h, r;
      do { n = R.heel(101, 999); h = Math.floor(n / 100); r = n % 100; } while (r === 0);
      var hw = EEN[h] + ' hundred', rw = onder100(r);
      ant = hw + ' and ' + rw;
      var f1 = {}; f1[EEN[h] + ' hundreds'] = 'Hundred krijgt geen -s.';
      st.push(invul('De honderdtallen: ' + (h * 100) + ' =', h === 1 ? [hw, 'a hundred'] : hw, h + ' keer honderd: ' + hw + '. Hundred krijgt geen -s.', { fout:f1 }));
      var f2 = {}; if (r > 20 && r % 10) f2[TIEN[Math.floor(r / 10)] + EEN[r % 10]] = 'Zet een streepje tussen de tientallen en de eenheden.';
      st.push(invul('De rest: ' + r + ' =', varianten(rw), r + ' is ' + rw + '.', { fout:f2 }));
      var f3 = {}; f3[hw + ' ' + rw] = 'In het Brits Engels zet je and na hundred.'; f3[(hw + ' ' + rw).replace(/-/g, ' ')] = 'In het Brits Engels zet je and na hundred.';
      var alle = [].concat(varianten(ant));
      if (h === 1) alle = alle.concat(alle.map(function(x){ return x.replace(/^one /, 'a '); }));
      st.push(invul('Samen, met and na hundred:', alle, hw + ' + and + ' + rw + ' = ' + ant + '.', { fout:f3 }));
    }
    return { context:'Schrijf het getal in woorden (Brits Engels).', vraag:String(n), stappen:st, beeld:function(k){
      var cijfers = String(n).split(''), kop = cijfers.length === 3 ? ['honderdtallen', 'tientallen', 'eenheden'] : ['tientallen', 'eenheden'];
      var w = cijfers.length === 3 ? [k >= 1 ? EEN[+cijfers[0]] + ' hundred' : '', k >= 2 ? onder100(n % 100) : '', ''] : [k >= 1 ? TIEN[+cijfers[0]] : '', k >= 2 ? EEN[+cijfers[1]] : ''];
      if (cijfers.length === 3) { kop = ['honderdtallen', 'de rest']; cijfers = [cijfers[0] + '00', String(n % 100)]; w = w.slice(0, 2); }
      else cijfers = [cijfers[0] + '0', cijfers[1]];
      return R.teken.tabel([kop, cijfers, w], { kop:true }); } };
  }

  /* ---------- rangtelwoorden ---------- */
  var RANG = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth',
    'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];
  function rangWoord(n){ if (n <= 20) return RANG[n]; if (n === 30) return 'thirtieth'; return TIEN[Math.floor(n / 10)] + '-' + RANG[n % 10]; }
  function rangAfk(n){ var e = n % 10, t = n % 100; if (t >= 11 && t <= 13) return n + 'th'; return n + (e === 1 ? 'st' : e === 2 ? 'nd' : e === 3 ? 'rd' : 'th'); }
  var MAAND = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var RANG_FOUT = { fifth:'fiveth', eighth:'eightth', ninth:'nineth', twelfth:'twelveth', twentieth:'twentyth', thirtieth:'thirtyth', first:'oneth', second:'twoth', third:'threeth' };
  function opgRang(){
    var n = kies([1, 2, 3, 5, 8, 9, 11, 12, 13, 15, 20, 21, 22, 23, 25, 28, 29, 30, 31, R.heel(4, 31)]), maand = kies(MAAND);
    if (n > 29 && maand === 'February') maand = 'March';
    var w = rangWoord(n), afk = rangAfk(n), e = n % 10, laatste = n > 20 && n % 10 ? RANG[e] : w;
    var hintAfk = n >= 11 && n <= 13 ? n + ' is een bijzonder getal: ' + w + '. Daarom -th.' : e === 1 ? n + ' eindigt op 1, zoals first: -st.' : e === 2 ? n + ' eindigt op 2, zoals second: -nd.' : e === 3 ? n + ' eindigt op 3, zoals third: -rd.' : 'Alle andere getallen krijgen -th.';
    var st = [ vast('Welke afkorting schrijf je?', [n + 'st', n + 'nd', n + 'rd', n + 'th'], afk, hintAfk) ];
    var fout = {}, fw = RANG_FOUT[laatste];
    if (n > 20 && n % 10){
      var fl = {}; if (fw) fl[fw] = 'Let op de spelling: ' + laatste + '.';
      st.push(invul('Alleen het laatste deel wordt een rangtelwoord. ' + en(EEN[e]) + ' wordt', laatste, EEN[e] + ' wordt ' + laatste + '.', { fout:fl }));
      if (fw) fout[TIEN[Math.floor(n / 10)] + '-' + fw] = 'Let op de spelling: ' + laatste + '.';
      fout[TIEN[Math.floor(n / 10)] + '-' + EEN[e]] = 'Het laatste deel wordt een rangtelwoord: ' + laatste + '.';
    } else if (fw) fout[fw] = 'Let op de spelling: ' + w + '.';
    st.push(invul('In woorden:', varianten(w), n > 20 && n % 10 ? TIEN[Math.floor(n / 10)] + ' + ' + laatste + ' = ' + w + '.' : n + ' is ' + w + '.', { fout:fout }));
    var v = 'the ___ of ' + maand + ' (' + n + ')';
    return { context:'Schrijf de datum in woorden, zoals je hem uitspreekt.', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(k){
      return engels(R.teken.zin([{ t:n + ' ' + maand, k:1, label:'datum' }, '=', { t:k >= 1 ? afk + ' ' + maand : '...', k:2, label:'afkorting' }, '=', { t:k >= st.length ? 'the ' + w + ' of ' + maand : '...', k:3, label:'zo zeg je het' }])); } };
  }

  /* ---------- bezit: 's of s' ---------- */
  /* lidwoord, eigenaar, wat, meervoud van wat, soort (e een eigenaar, m meer op -s, o meer zonder -s) */
  var BEZIT = [['my', 'brother', 'bike', 0, 'e'], ['my', 'sister', 'room', 0, 'e'], ['the', 'teacher', 'car', 0, 'e'], ['my', 'friend', 'phone', 0, 'e'],
    ['the', 'dog', 'bowl', 0, 'e'], ['', 'Tom', 'bag', 0, 'e'], ['', 'Emma', 'birthday party', 0, 'e'], ['my', 'neighbour', 'garden', 0, 'e'], ['my', 'cousin', 'house', 0, 'e'],
    ['my', 'parents', 'car', 0, 'm'], ['the', 'teachers', 'room', 0, 'm'], ['the', 'girls', 'changing room', 0, 'm'], ['the', 'boys', 'football team', 0, 'm'],
    ['my', 'brothers', 'bedroom', 0, 'm'], ['our', 'neighbours', 'dog', 0, 'm'], ['the', 'students', 'canteen', 0, 'm'],
    ['the', 'children', 'toys', 1, 'o'], ['the', 'men', 'toilets', 1, 'o'], ['the', 'women', 'team', 0, 'o'], ['the', 'children', 'playground', 0, 'o']];
  function opgBezit(){
    var B = kies(BEZIT), w = B[1], soort = B[4], ant = soort === 'm' ? w + "'" : w + "'s";
    var tpl = (B[3] ? 'These are ' : 'This is ') + (B[0] ? B[0] + ' ' : '') + '___ ' + B[2] + '.';
    var v = tpl.replace('___', '___ (' + w + ')');
    var EEN_MEER = ['één eigenaar', 'meer eigenaren'];
    var hint1 = soort === 'e' ? w + ' is enkelvoud: één eigenaar.' : soort === 'm' ? w + ' is meervoud: meer eigenaren.' : w + ' is een meervoud zonder -s: meer eigenaren.';
    var AP = ["'s erachter", "alleen ' erachter"];
    var hint2 = soort === 'e' ? "Eén eigenaar: 's erachter." : soort === 'm' ? "Meervoud op -s: er staat al een s, dus alleen ' erachter." : "Het meervoud eindigt niet op -s: dan gewoon 's erachter.";
    var fout = {}; fout[soort === 'm' ? w + "'s" : w + "'"] = hint2; fout[w] = "Je mist de apostrof (').";
    if (soort === 'm') fout[w + "s'"] = w + ' eindigt al op s. Zet alleen een apostrof erachter.';
    var st = [ vast('Is het één eigenaar of zijn het er meer? Kijk naar ' + en(w) + '.', EEN_MEER, soort === 'e' ? EEN_MEER[0] : EEN_MEER[1], hint1),
      vast('Waar komt de apostrof?', AP, soort === 'm' ? AP[1] : AP[0], hint2),
      invul('Dus je schrijft', ant, hint2 + ' Dus: ' + ant + '.', { fout:fout, invoer:'tekst' }) ];
    return { context:'Maak er een bezitsvorm van met \'s of s\'.', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(n){
      return n >= 3 ? engels(R.teken.woord([{ t:w, k:1, label:soort === 'e' ? 'één' : 'meer' }, { t:soort === 'm' ? "'" : "'s", k:2, label:'van' }])) : ''; } };
  }

  /* ---------- un-, dis- en im- ---------- */
  /* woord, voorvoegsel, stam, betekenis, betekenis van de stam, een andere betekenis, zin */
  var VV = [['unhappy', 'un', 'happy', 'ongelukkig', 'gelukkig', 'vrolijk', 'She was very unhappy at her new school.'],
    ['unfriendly', 'un', 'friendly', 'onvriendelijk', 'vriendelijk', 'eenzaam', 'The shop assistant was unfriendly.'],
    ['unkind', 'un', 'kind', 'onaardig', 'aardig', 'kinderachtig', 'It was unkind to laugh at him.'],
    ['untidy', 'un', 'tidy', 'slordig', 'netjes', 'schoon', "My brother's room is always untidy."],
    ['unfair', 'un', 'fair', 'oneerlijk', 'eerlijk', 'onbekend', "The referee's decision was unfair."],
    ['unhealthy', 'un', 'healthy', 'ongezond', 'gezond', 'moe', 'Too much sugar is unhealthy.'],
    ['unusual', 'un', 'usual', 'ongewoon', 'gewoon', 'ongeduldig', 'It is unusual to see snow in May.'],
    ['unknown', 'un', 'known', 'onbekend', 'bekend', 'vergeten', 'The singer was unknown ten years ago.'],
    ['unsafe', 'un', 'safe', 'onveilig', 'veilig', 'kluis', 'The old bridge is unsafe.'],
    ['unimportant', 'un', 'important', 'onbelangrijk', 'belangrijk', 'verplicht', 'This detail is unimportant.'],
    ['dislike', 'dis', 'like', 'een hekel hebben aan', 'leuk vinden', 'lijken op', 'I dislike cold weather.'],
    ['disagree', 'dis', 'agree', 'het oneens zijn', 'het eens zijn', 'afspreken', 'I disagree with you.'],
    ['disappear', 'dis', 'appear', 'verdwijnen', 'verschijnen', 'verdelen', 'The sun disappeared behind the clouds.'],
    ['dishonest', 'dis', 'honest', 'oneerlijk', 'eerlijk', 'ongeduldig', 'It is dishonest to cheat in a test.'],
    ['disobey', 'dis', 'obey', 'niet gehoorzamen', 'gehoorzamen', 'niet horen', 'The dog often disobeys its owner.'],
    ['disconnect', 'dis', 'connect', 'loskoppelen', 'verbinden', 'opladen', 'Disconnect the charger before you leave.'],
    ['disadvantage', 'dis', 'advantage', 'nadeel', 'voordeel', 'oplossing', 'One disadvantage of the city is the noise.'],
    ['impossible', 'im', 'possible', 'onmogelijk', 'mogelijk', 'onzichtbaar', 'It is impossible to swim across the sea.'],
    ['impolite', 'im', 'polite', 'onbeleefd', 'beleefd', 'ongezellig', 'It is impolite to talk with your mouth full.'],
    ['impatient', 'im', 'patient', 'ongeduldig', 'geduldig', 'patiënt', "Don't be so impatient!"],
    ['imperfect', 'im', 'perfect', 'niet perfect', 'perfect', 'onbekend', 'The old painting is imperfect.'],
    ['immature', 'im', 'mature', 'onvolwassen', 'volwassen', 'ongeduldig', 'He is still a bit immature.'],
    ['impractical', 'im', 'practical', 'onpraktisch', 'praktisch', 'onbetaalbaar', 'High heels are impractical for a long walk.']];
  function opgVoorvoegsel(){
    var V = kies(VV), w = V[0], vv = V[1], stam = V[2];
    var zinHtml = S(V[6]).replace(new RegExp('\\b(' + w + '\\w*)', 'i'), '<b>$1</b>');
    var fout = {}; fout[w] = 'Haal het voorvoegsel ' + vv + '- eraf.';
    var st = [ vast('Welk voorvoegsel staat voor in ' + en(w) + '?', ['un-', 'dis-', 'im-'], vv + '-', 'Kijk naar de eerste letters van ' + w + '.'),
      invul('Haal het voorvoegsel eraf. Wat blijft er over?', stam, 'Haal ' + vv + ' weg: ' + w + ' wordt ' + stam + '.', { fout:fout, invoer:'tekst' }),
      keuze('Wat betekent ' + en(w) + ' dus?', V[3], [V[4], V[5]], stam + ' betekent ' + V[4] + '. ' + vv + '- maakt er het tegenovergestelde van: ' + V[3] + '.') ];
    return eindKeuze({ context:'<span lang="en">' + zinHtml + '</span><br>Wat betekent het vetgedrukte woord?', vraag:w, vraagHtml:'<span lang="en">' + S(w) + '</span>', stappen:st, beeld:function(n){
      return engels(n >= 2 ? R.teken.woord([{ t:vv, k:2, label:'niet' }, { t:stam, k:1, label:n >= 3 ? V[4] : 'stam' }]) : R.teken.woord([{ t:w, k:1 }])); } });
  }

  /* ---------- -ness en -ment ---------- */
  /* stam, soort (bn of ww), betekenis, nieuw woord, zin */
  var NM = [['kind', 'bn', 'aardig', 'kindness', 'Thank you for your ___.'], ['happy', 'bn', 'blij', 'happiness', "Money doesn't always bring ___."],
    ['dark', 'bn', 'donker', 'darkness', 'The room was in complete ___.'], ['sad', 'bn', 'verdrietig', 'sadness', 'I could see the ___ in her eyes.'],
    ['ill', 'bn', 'ziek', 'illness', 'He missed school because of a long ___.'], ['weak', 'bn', 'zwak', 'weakness', 'Chocolate is my biggest ___.'],
    ['fit', 'bn', 'fit', 'fitness', 'Swimming is good for your ___.'], ['lazy', 'bn', 'lui', 'laziness', 'His ___ is a real problem.'],
    ['polite', 'bn', 'beleefd', 'politeness', 'We were surprised by the ___ of the staff.'],
    ['enjoy', 'ww', 'genieten', 'enjoyment', 'Reading gives me a lot of ___.'], ['move', 'ww', 'bewegen', 'movement', 'There was a sudden ___ in the bushes.'],
    ['agree', 'ww', 'het eens zijn', 'agreement', 'The two teams reached an ___.'], ['develop', 'ww', 'ontwikkelen', 'development', 'The ___ of the new app took two years.'],
    ['pay', 'ww', 'betalen', 'payment', 'We are still waiting for your ___.'], ['improve', 'ww', 'verbeteren', 'improvement', 'There is a big ___ in your work.'],
    ['equip', 'ww', 'uitrusten', 'equipment', 'We need new sports ___.'], ['announce', 'ww', 'aankondigen', 'announcement', 'The head teacher made an ___.'],
    ['govern', 'ww', 'regeren', 'government', 'The ___ announced new rules.'], ['treat', 'ww', 'behandelen', 'treatment', 'The new ___ helped him to get better quickly.']];
  function opgNessMent(){
    var N = kies(NM), bn = N[1] === 'bn', uit = bn ? '-ness' : '-ment';
    var v = N[4].replace('___', '___ (' + N[0] + ')');
    var SRT = ['een bijvoeglijk naamwoord: het zegt hoe iets is', 'een werkwoord: het zegt wat je doet'];
    var fout = {}; fout[N[0] + (bn ? 'ment' : 'ness')] = bn ? N[0] + ' is een bijvoeglijk naamwoord: -ness.' : N[0] + ' is een werkwoord: -ment.';
    if (/y$/.test(N[0]) && bn) fout[N[0] + 'ness'] = 'De y wordt i: ' + N[3] + '.';
    fout[N[0]] = 'Op de puntjes hoort een zelfstandig naamwoord: zet er ' + uit + ' achter.';
    var st = [ vast('Wat voor woord is ' + en(N[0]) + '? Het betekent ' + S(N[2]) + '.', SRT, bn ? SRT[0] : SRT[1], N[0] + ' betekent ' + N[2] + '. ' + (bn ? 'Dat zegt hoe iemand of iets is.' : 'Dat is iets wat je doet.')),
      vast('Welk achtervoegsel maakt er een zelfstandig naamwoord van?', ['-ness', '-ment'], uit, 'Bijvoeglijk naamwoord + -ness. Werkwoord + -ment.'),
      invul('Dus je schrijft', N[3], N[0] + ' + ' + uit + ' = ' + N[3] + (/y$/.test(N[0]) && bn ? ' (de y wordt i).' : '.'), { fout:fout, invoer:'tekst' }) ];
    return { context:'Maak van het woord tussen haakjes een zelfstandig naamwoord.', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(n){
      return engels(n >= 3 ? R.teken.woord([{ t:N[3].slice(0, N[3].length - uit.length + 1), k:1, label:bn ? 'bijv. nw.' : 'werkwoord' }, { t:N[3].slice(N[3].length - uit.length + 1), k:2, label:'zelfst. nw.' }]) : R.teken.woord([{ t:N[0], k:1 }])); } };
  }

  /* ---------- -ful en -less ---------- */
  /* stam, betekenis, met (1) of zonder (0), nieuw woord, zin */
  var FL = [['help', 'hulp', 1, 'helpful', 'The shop assistant was very ___. She answered all my questions.'],
    ['care', 'zorg', 1, 'careful', 'Be ___ when you cross the road.'],
    ['care', 'zorg', 0, 'careless', 'He made a ___ mistake. He did not check his work.'],
    ['use', 'nut', 0, 'useless', 'This knife is ___. It cannot cut anything.'],
    ['use', 'nut', 1, 'useful', 'A dictionary is very ___ when you learn a language.'],
    ['colour', 'kleur', 1, 'colourful', 'The garden is full of ___ flowers.'],
    ['harm', 'schade', 0, 'harmless', "Don't be afraid. This spider is ___."],
    ['home', 'thuis', 0, 'homeless', 'Many ___ people sleep on the streets.'],
    ['hope', 'hoop', 1, 'hopeful', 'We are ___ that the weather will be good.'],
    ['hope', 'hoop', 0, 'hopeless', 'The situation is ___. Nothing can be done.'],
    ['end', 'einde', 0, 'endless', 'The lesson was so boring. It felt ___.'],
    ['wonder', 'wonder', 1, 'wonderful', 'We had a ___ holiday in Italy.'],
    ['peace', 'rust', 1, 'peaceful', 'The lake was calm and ___ this morning.'],
    ['success', 'succes', 1, 'successful', 'Our team was very ___ this year.'],
    ['cloud', 'wolken', 0, 'cloudless', 'The sky was ___, so we could see all the stars.'],
    ['beauty', 'schoonheid', 1, 'beautiful', 'We saw a ___ sunset.'],
    ['pain', 'pijn', 0, 'painless', 'The injection was ___. I did not feel anything.'],
    ['pain', 'pijn', 1, 'painful', 'My broken arm was very ___.']];
  function opgFulLess(){
    var F = kies(FL), met = !!F[2], uit = met ? '-ful' : '-less';
    var v = F[4].replace('___', '___ (' + F[0] + ')');
    var MZ = ['met ' + F[1] + ': -ful', 'zonder ' + F[1] + ': -less'];
    var fout = {}; fout[F[0] + (met ? 'less' : 'ful')] = met ? 'Lees de zin nog eens: het gaat om met ' + F[1] + ', dus -ful.' : 'Lees de zin nog eens: het gaat om zonder ' + F[1] + ', dus -less.';
    if (met) fout[F[3] + 'l'] = 'Het achtervoegsel -ful heeft maar één l.';
    if (F[0] === 'beauty') fout.beautyful = 'De y wordt i: beautiful.';
    var st = [ vast('Gaat het hier om met ' + S(F[1]) + ' of zonder ' + S(F[1]) + '?', MZ, met ? MZ[0] : MZ[1], F[0] + ' betekent ' + F[1] + '. Lees de hele zin: is er ' + F[1] + ', of is er juist geen ' + F[1] + '?'),
      invul('Dus je schrijft', F[3], F[0] + ' + ' + uit + ' = ' + F[3] + (F[0] === 'beauty' ? ' (de y wordt i).' : '.') + (met ? ' Let op: -ful heeft één l.' : ''), { fout:fout, invoer:'tekst' }) ];
    return { context:'Maak van het woord tussen haakjes een bijvoeglijk naamwoord met -ful of -less.', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(n){
      var stam = F[0] === 'beauty' ? 'beauti' : F[0];
      return engels(n >= 2 ? R.teken.woord([{ t:stam, k:1, label:F[1] }, { t:met ? 'ful' : 'less', k:2, label:met ? 'met' : 'zonder' }]) : R.teken.woord([{ t:F[0], k:1, label:F[1] }])); } };
  }

  /* ================= de doelen ================= */
  LEERROUTE.voeg('engels', [
    { groep:{ id:'en-a1-woorden', niveau:'A1', domein:'woorden', naam:'Spelling, hoofdletters en getallen', uit:'Het meervoud, wanneer je een hoofdletter schrijft, en getallen en data in woorden: de spelling die je bij elke Engelse tekst nodig hebt.' },
      doelen:[
        { id:'en-meervoud', naam:'Het meervoud: -s, -es, -ies of -ves', kort:'Kijk naar het eind van het woord: daar hangt de uitgang van af',
          uit:'<p>Het <b>meervoud</b> maak je meestal met <b>-s</b>: ' + E('book, books') + '.</p><p>Eindigt het woord op <b>s, ss, sh, ch of x</b>, dan schrijf je <b>-es</b>: ' + E('box, boxes') + '. Eindigt het op een <b>medeklinker + y</b>, dan wordt de y <b>-ies</b>: ' + E('baby, babies') + '. Klinker + y krijgt gewoon -s: ' + E('boy, boys') + '.</p><p>Bij een aantal woorden op <b>f of fe</b> wordt het <b>-ves</b>: ' + E('leaf, leaves') + '; ' + E('knife, knives') + '.</p>',
          wanneer:'je van één ding er meer maakt.', maak:opgMeervoud },
        { id:'en-hoofdletters', naam:'Hoofdletters in het Engels', kort:'Dagen, maanden, talen, landen, nationaliteiten en I krijgen een hoofdletter',
          uit:'<p>In het Engels krijgen meer woorden een <b>hoofdletter</b> dan in het Nederlands.</p><p><b>Dagen en maanden</b>: ' + E('Monday, March') + '. <b>Talen, landen en nationaliteiten</b>: ' + E('English, Spain, Dutch') + '. En het woord <b>I</b> (ik), waar het ook staat.</p><p>Geen hoofdletter krijgen <b>seizoenen</b> (' + E('summer') + ') en <b>schoolvakken</b> die geen taal zijn (' + E('maths, history') + ').</p>',
          wanneer:'je een Engelse zin schrijft met een dag, maand, taal, land of het woord I.', maak:opgHoofdletter },
        { id:'en-getallen', naam:'Getallen in woorden', kort:'Tientallen en eenheden met een streepje (forty-five); na hundred komt and',
          uit:'<p>Een getal tot honderd schrijf je met de <b>tientallen</b>, een <b>streepje</b> en de <b>eenheden</b>: ' + E('45 = forty-five') + '.</p><p>Let op de spelling: ' + E('twenty, thirty, forty, fifty, eighty, ninety') + '. Forty heeft geen u.</p><p>Boven de honderd zet je in het Brits Engels <b>and</b> na hundred: ' + E('345 = three hundred and forty-five') + '. Hundred krijgt geen -s.</p>',
          wanneer:'je een getal voluit moet schrijven, bijvoorbeeld op een cheque of in een verhaal.', maak:opgGetal },
        { id:'en-rangtelwoorden', naam:'Rangtelwoorden en data', kort:'1st, 2nd, 3rd en de rest -th: first, second, third, fourth',
          uit:'<p>Met een <b>rangtelwoord</b> zeg je de hoeveelste: ' + E('first, second, third') + '. Je gebruikt ze ook bij <b>data</b>: ' + E('the twenty-first of May') + '.</p><p>De afkorting: <b>1st, 2nd, 3rd</b> en verder <b>-th</b>. Let op: 11, 12 en 13 krijgen -th (' + E('11th, 12th, 13th') + ').</p><p>Lastige spelling: ' + E('fifth, eighth, ninth, twelfth, twentieth') + '. Bij 21 en verder verandert alleen het laatste deel: ' + E('twenty-first') + '.</p>',
          wanneer:'je een datum noemt of zegt de hoeveelste iets is.', maak:opgRang }
      ] },
    { groep:{ id:'en-a2-woorden', niveau:'A2', domein:'woorden', naam:'Bezit en woorden maken', uit:'Bezit met \'s of s\', en nieuwe woorden maken met voorvoegsels en achtervoegsels: zo begrijp en schrijf je veel meer woorden.' },
      doelen:[
        { id:'en-bezit', naam:"Bezit: 's of s'", kort:"Eén eigenaar: 's. Meervoud op -s: alleen '. Meervoud zonder -s: 's",
          uit:'<p>Bezit laat je zien met een <b>apostrof</b>: ' + E("my brother's bike") + ' is de fiets van mijn broer.</p><p>Bij <b>één eigenaar</b> zet je <b>\'s</b> erachter: ' + E("the teacher's car") + '. Bij een <b>meervoud op -s</b> zet je alleen een <b>apostrof</b> erachter: ' + E("my parents' car") + '.</p><p>Een meervoud <b>zonder -s</b> krijgt weer <b>\'s</b>: ' + E("the children's toys") + '.</p>',
          wanneer:'je wilt zeggen van wie iets is.', maak:opgBezit },
        { id:'en-voorvoegsels', naam:'Un-, dis- en im-: het tegenovergestelde', kort:'Haal het voorvoegsel eraf, zoek de betekenis en draai hem om',
          uit:'<p>Met de <b>voorvoegsels</b> un-, dis- en im- maak je het <b>tegenovergestelde</b> van een woord: ' + E('happy, unhappy') + '; ' + E('like, dislike') + '; ' + E('possible, impossible') + '.</p><p>Ken je een woord niet? Haal dan het voorvoegsel eraf. Wat overblijft ken je vaak wel. ' + E('unfriendly') + ' is ' + E('friendly') + ' (vriendelijk) met un- ervoor: onvriendelijk.</p>',
          wanneer:'je in een tekst een onbekend woord tegenkomt dat begint met un-, dis- of im-.', maak:opgVoorvoegsel },
        { id:'en-ness-ment', naam:'Zelfstandige naamwoorden met -ness en -ment', kort:'Bijvoeglijk naamwoord + -ness (kindness). Werkwoord + -ment (payment)',
          uit:'<p>Met een <b>achtervoegsel</b> maak je van een woord een ander soort woord.</p><p>Van een <b>bijvoeglijk naamwoord</b> maak je met <b>-ness</b> een zelfstandig naamwoord: ' + E('kind, kindness') + '. Een y wordt i: ' + E('happy, happiness') + '.</p><p>Van een <b>werkwoord</b> maak je met <b>-ment</b> een zelfstandig naamwoord: ' + E('pay, payment') + '; ' + E('improve, improvement') + '.</p>',
          wanneer:'er in een zin een zelfstandig naamwoord nodig is, bijvoorbeeld na the, a of your.', maak:opgNessMent },
        { id:'en-ful-less', naam:'Bijvoeglijke naamwoorden met -ful en -less', kort:'-ful betekent met (helpful), -less betekent zonder (homeless)',
          uit:'<p>Met <b>-ful</b> en <b>-less</b> maak je van een zelfstandig naamwoord een bijvoeglijk naamwoord.</p><p><b>-ful</b> betekent <b>met</b>: ' + E('help, helpful') + ' (behulpzaam). <b>-less</b> betekent <b>zonder</b>: ' + E('home, homeless') + ' (dakloos).</p><p>Let op: -ful heeft maar <b>één l</b>: ' + E('careful') + '. En een y wordt i: ' + E('beauty, beautiful') + '.</p>',
          wanneer:'je wilt zeggen dat iets iets heeft, of het juist mist.', maak:opgFulLess }
      ] }
  ]);
})();
