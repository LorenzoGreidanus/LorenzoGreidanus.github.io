/* De leerroute Engels: lezen.
   A2: scannen naar een gegeven (een tijd, een prijs, een dag) en een verwijswoord
   terugvinden. B1: het verband dat een signaalwoord aangeeft, zelf het goede
   signaalwoord kiezen en de hoofdgedachte van een alinea. Uitleg en stappen in het
   Nederlands, de teksten in Brits Engels. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R = LEERROUTE.R;
  function kies(l){ return R.kies(l); }
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
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; if (s.opties){ op.opties = s.opties; op.goed = s.goed; } return op; }
  /* zet <mark> om het eerste stuk tekst dat gelijk is aan wat (de tekst is al veilig gemaakt) */
  function markeer(html, wat){
    if (!wat) return html;
    var w = S(wat), i = html.indexOf(w);
    return i < 0 ? html : html.slice(0, i) + '<mark>' + w + '</mark>' + html.slice(i + w.length);
  }
  function tekstblok(titel, alineas, merk){
    var h = alineas.map(function(a){ return '<p>' + S(a) + '</p>'; }).join('');
    (merk || []).forEach(function(m){ h = markeer(h, m); });
    return '<div class="lr-tekst" lang="en">' + (titel ? '<p><b>' + S(titel) + '</b></p>' : '') + h + '</div>';
  }

  /* ---------- scannen ---------- */
  function pond(x){ return '£' + x; }
  /* elke tekst: waarden kiezen, alinea's maken, en vragen met een sleutelwoord, het antwoord en andere gegevens uit de tekst */
  var SCAN = [
    function(){
      var o1 = kies(['6.30 am', '7 am', '7.30 am']), c1 = kies(['9 pm', '9.30 pm', '10 pm']), o2 = kies(['8 am', '8.30 am', '9 am']), c2 = kies(['5 pm', '5.30 pm', '6 pm']), t3 = kies(['2 pm', '3.30 pm', '4 pm']);
      var p1 = pond(kies(['4.50', '5', '5.50'])), p2 = pond(kies(['2', '2.50', '3'])), p3 = pond(kies(['12', '14', '15']));
      return { titel:'Seaview Swimming Pool', alineas:['We are open every day. From Monday to Friday, the pool opens at ' + o1 + ' and closes at ' + c1 + '. At the weekend, we open at ' + o2 + ' and close at ' + c2 + '.',
          'Tickets: adults ' + p1 + ', children under 12 ' + p2 + '. A family ticket costs ' + p3 + '.', 'Swimming lessons for beginners are on Wednesday afternoons at ' + t3 + '.'],
        sleutels:['weekend', 'Monday to Friday', 'children', 'family', 'lessons', 'adults'],
        vragen:[{ v:'Hoe laat gaat het zwembad op zaterdag open?', s:'tijd', k:'weekend', a:o2, f:[o1, t3], h:'Zaterdag valt in het weekend. Zoek het woord weekend.' },
          { v:'Hoe laat gaat het zwembad op dinsdag dicht?', s:'tijd', k:'Monday to Friday', a:c1, f:[c2, o1], h:'Dinsdag valt tussen maandag en vrijdag. Zoek Monday to Friday.' },
          { v:'Wat kost een kaartje voor een kind van acht?', s:'prijs', k:'children', a:p2, f:[p1, p3], h:'Een kind is een child, meervoud children. Zoek children.' },
          { v:'Wat kost een kaartje voor het hele gezin?', s:'prijs', k:'family', a:p3, f:[p1, p2], h:'Een gezin is een family. Zoek family.' },
          { v:'Hoe laat begint de zwemles voor beginners?', s:'tijd', k:'lessons', a:t3, f:[o2, c2], h:'Zwemles is swimming lessons. Zoek lessons.' }] };
    },
    function(){
      var d1 = kies(['Thursday', 'Friday', 'Saturday']), t1 = kies(['5.30 pm', '6 pm']), t2 = kies(['8.15 pm', '8.45 pm', '9 pm']), t3 = kies(['1 pm', '2.30 pm', '3 pm']);
      var p1 = pond(kies(['9.50', '10', '11'])), p2 = pond(kies(['7', '7.50', '8'])), p3 = pond(kies(['5', '6'])), p4 = pond(kies(['3', '3.50'])), p5 = pond(kies(['4.50', '5.50']));
      return { titel:'Riverside Cinema: this week', alineas:['Space Rescue (age 12 and over): ' + d1 + ' at ' + t1 + ' and ' + t2 + '.', 'The Lost Dog (all ages): Sunday at ' + t3 + '.',
          'Tickets: adults ' + p1 + ', students ' + p2 + '. On Tuesdays, every ticket costs ' + p3 + '.', 'Popcorn: small ' + p4 + ', large ' + p5 + '.'],
        sleutels:['The Lost Dog', 'Tuesdays', 'large', 'students', 'Space Rescue', 'small'],
        vragen:[{ v:'Hoe laat draait The Lost Dog?', s:'tijd', k:'The Lost Dog', a:t3, f:[t1, t2], h:'Zoek de titel van de film: The Lost Dog.' },
          { v:'Wat kost een kaartje op dinsdag?', s:'prijs', k:'Tuesdays', a:p3, f:[p1, p2], h:'Dinsdag is Tuesday. Zoek Tuesdays.' },
          { v:'Wat kost een grote bak popcorn?', s:'prijs', k:'large', a:p5, f:[p4, p3], h:'Groot is large. Zoek large.' },
          { v:'Wat betaalt een student voor een kaartje?', s:'prijs', k:'students', a:p2, f:[p1, p3], h:'Zoek het woord students.' },
          { v:'Op welke dag draait Space Rescue?', s:'dag', k:'Space Rescue', a:d1, f:['Sunday', 'Tuesday'], h:'Zoek de titel van de film: Space Rescue.' },
          { v:'Hoe laat begint de laatste voorstelling van Space Rescue?', s:'tijd', k:'Space Rescue', a:t2, f:[t1, t3], h:'Zoek Space Rescue. Er staan twee tijden: neem de laatste.' }] };
    },
    function(){
      var r = kies([['5.15 am', '6.20 am'], ['5.30 am', '6.35 am'], ['5.45 am', '6.50 am']]), t3 = kies(['11.15 pm', '11.30 pm', '11.45 pm']), m = kies([15, 20, 30]);
      var p1 = pond(kies(['18', '19.50', '21'])), p2 = pond(kies(['30', '32.50', '35'])), p3 = pond(kies(['3', '4', '5']));
      var ander = [15, 20, 30].filter(function(x){ return x !== m; });
      return { titel:'Trains from London to Brighton', alineas:['The first train leaves London at ' + r[0] + ' and arrives in Brighton at ' + r[1] + '. After that, there is a train every ' + m + ' minutes. The last train leaves at ' + t3 + '.',
          'A single ticket costs ' + p1 + '. A return ticket costs ' + p2 + '. A seat reservation costs ' + p3 + '. Children under 16 pay half price.'],
        sleutels:['last', 'arrives', 'return', 'every', 'first', 'single'],
        vragen:[{ v:'Hoe laat vertrekt de laatste trein?', s:'tijd', k:'last', a:t3, f:[r[0], r[1]], h:'Laatste is last. Zoek last.' },
          { v:'Hoe laat komt de eerste trein aan in Brighton?', s:'tijd', k:'arrives', a:r[1], f:[r[0], t3], h:'Aankomen is arrive. Zoek arrives.' },
          { v:'Wat kost een retourtje?', s:'prijs', k:'return', a:p2, f:[p1, p3], h:'Een retourtje is a return ticket. Zoek return.' },
          { v:'Wat kost een enkeltje?', s:'prijs', k:'single', a:p1, f:[p2, p3], h:'Een enkeltje is a single ticket. Zoek single.' },
          { v:'Hoeveel minuten zit er tussen twee treinen?', s:'aantal', k:'every', a:m + ' minutes', f:ander.map(function(x){ return x + ' minutes'; }), h:'Elke is every. Zoek every.' },
          { v:'Hoe laat vertrekt de eerste trein uit Londen?', s:'tijd', k:'first', a:r[0], f:[r[1], t3], h:'Eerste is first. Zoek first.' }] };
    },
    function(){
      var o = kies(['9 am', '9.30 am', '10 am']), c = kies(['5 pm', '5.30 pm', '6 pm']), t1 = kies(['1 pm', '2 pm', '2.30 pm']), d = kies([30, 45, 60]);
      var p1 = pond(kies(['8', '9.50', '12'])), p2 = pond(kies(['4.50', '5', '5.50']));
      return { titel:'City Museum', alineas:['Opening hours: Tuesday to Sunday, ' + o + ' to ' + c + '. The museum is closed on Mondays.', 'Entry is free for children. Adults pay ' + p1 + '.',
          'On opening days, the dinosaur tour starts at ' + t1 + '. It takes ' + d + ' minutes.', 'Our café is on the first floor. A sandwich costs ' + p2 + '.'],
        sleutels:['closed', 'dinosaur', 'sandwich', 'Adults', 'Opening hours', 'free'],
        vragen:[{ v:'Op welke dag is het museum dicht?', s:'dag', k:'closed', a:'Monday', f:['Tuesday', 'Sunday'], h:'Dicht is closed. Zoek closed.' },
          { v:'Hoe laat begint de rondleiding over dinosaurussen?', s:'tijd', k:'dinosaur', a:t1, f:[o, c], h:'Zoek het woord dinosaur.' },
          { v:'Wat kost een broodje in het café?', s:'prijs', k:'sandwich', a:p2, f:[p1, 'free'], h:'Een broodje is a sandwich. Zoek sandwich.' },
          { v:'Wat betaalt een volwassene voor de toegang?', s:'prijs', k:'Adults', a:p1, f:[p2, 'free'], h:'Een volwassene is an adult. Zoek Adults.' },
          { v:'Hoe laat gaat het museum dicht?', s:'tijd', k:'Opening hours', a:c, f:[o, t1], h:'Zoek Opening hours. De tweede tijd is de sluitingstijd.' }] };
    },
    function(){
      var d1 = kies([3, 4, 5]), d2 = d1 + 4, t1 = kies(['9 am', '9.30 am']), t2 = kies(['3 pm', '3.30 pm', '4 pm']), t3 = kies(['12.30 pm', '1 pm']), a = kies([10, 11, 12]);
      var b = kies([120, 135, 150]), p1 = pond(b), p2 = pond(b - 20), p3 = pond(kies(['8', '10', '12']));
      return { titel:'Summer Sports Camp', alineas:['The camp runs from ' + d1 + ' to ' + d2 + ' August. Every day starts at ' + t1 + ' and finishes at ' + t2 + '. Lunch is at ' + t3 + '.',
          'You can choose football, tennis or climbing. Climbing is only for children aged ' + a + ' and over.',
          'One week costs ' + p1 + ', and lunch is included. If you book before 1 June, you only pay ' + p2 + '. A camp T-shirt costs ' + p3 + '.'],
        sleutels:['finishes', 'before 1 June', 'One week', 'Climbing', 'runs from', 'T-shirt'],
        vragen:[{ v:'Hoe laat is de dag afgelopen?', s:'tijd', k:'finishes', a:t2, f:[t1, t3], h:'Afgelopen is finished. Zoek finishes.' },
          { v:'Wat kost een week als je in mei boekt?', s:'prijs', k:'before 1 June', a:p2, f:[p1, p3], h:'Mei is voor 1 juni. Zoek before 1 June.' },
          { v:'Wat kost een week als je in juli boekt?', s:'prijs', k:'One week', a:p1, f:[p2, p3], h:'Juli is na 1 juni: dan betaal je de gewone prijs. Zoek One week.' },
          { v:'Hoe oud moet je minstens zijn om te klimmen?', s:'aantal', k:'Climbing', a:a + ' years', f:[(a - 2) + ' years', (a + 2) + ' years'], h:'Klimmen is climbing. Zoek Climbing.' },
          { v:'Op welke datum begint het kamp?', s:'dag', k:'runs from', a:d1 + ' August', f:[d2 + ' August', '1 June'], h:'Het kamp loopt van ... tot ... Zoek runs from.' }] };
    }];
  var SOORT = { tijd:'een tijd', prijs:'een prijs', dag:'een dag of een datum', aantal:'een aantal' };
  function opgScan(){
    var T = kies(SCAN)(), Q = kies(T.vragen);
    var andere = R.hussel(T.sleutels.filter(function(s){ return s !== Q.k; })).slice(0, 2);
    var st = [ vast('Wat zoek je in de tekst?', [SOORT.tijd, SOORT.prijs, SOORT.dag, SOORT.aantal], SOORT[Q.s], { tijd:'Hoe laat? Dan zoek je een tijd.', prijs:'Wat kost het? Dan zoek je een prijs.', dag:'Welke dag of datum? Dan zoek je een dag.', aantal:'Hoeveel of hoe oud? Dan zoek je een getal.' }[Q.s]),
      keuze('Naar welk woord in de tekst zoek je?', Q.k, andere, Q.h),
      keuze('Lees alleen de zin met dat woord. Wat is het antwoord?', Q.a, Q.f, 'Lees de zin met ' + Q.k + ' en zoek daar ' + SOORT[Q.s] + '.') ];
    return eindKeuze({ context:'Zoek het antwoord in de tekst. Je hoeft niet alles te lezen.', vraag:Q.v, stappen:st, beeld:function(n){
      return tekstblok(T.titel, T.alineas, n >= 3 ? [Q.k, Q.a] : n >= 2 ? [Q.k] : []); } });
  }

  /* ---------- verwijswoorden ---------- */
  /* tekst met [verwijswoord], soort (m, v, d, mv), antwoord, twee andere woorden uit de tekst */
  var VW = [['Tom bought a new phone last week. [It] was very expensive.', 'd', 'a new phone', ['Tom', 'last week']],
    ['Emma and Lucy went to the beach. [They] swam in the sea all afternoon.', 'mv', 'Emma and Lucy', ['the beach', 'the sea']],
    ['My grandfather has a small garden. [He] grows tomatoes and beans there.', 'm', 'my grandfather', ['a small garden', 'tomatoes']],
    ['Sarah lost her keys on the bus. Luckily, the driver found [them].', 'mv', 'her keys', ['Sarah', 'the driver']],
    ['Our neighbours have a big dog and a small garden. [It] barks every night.', 'd', 'a big dog', ['our neighbours', 'a small garden']],
    ['Mr Jones teaches maths at our school. [His] lessons are never boring.', 'm', 'Mr Jones', ['maths', 'our school']],
    ['The students visited an old castle. [It] was built in the twelfth century.', 'd', 'an old castle', ['the students', 'the twelfth century']],
    ["Anna's parents run a small hotel by the sea. [They] work very hard in the summer.", 'mv', "Anna's parents", ['a small hotel', 'the sea']],
    ['I gave my sister a book for her birthday, but [she] had already read it.', 'v', 'my sister', ['a book', 'her birthday']],
    ['Jack missed the bus this morning, so [he] was late for school.', 'm', 'Jack', ['the bus', 'school']],
    ['My mum makes delicious pancakes. Everyone in our family loves [them].', 'mv', 'delicious pancakes', ['my mum', 'our family']],
    ['The children found a small bird in the garden. [Its] wing was broken.', 'd', 'a small bird', ['the children', 'the garden']],
    ['Lisa and her brother started a YouTube channel. [Their] videos are about cooking.', 'mv', 'Lisa and her brother', ['a YouTube channel', 'cooking']],
    ["Ben's aunt lives in Canada. [She] sends him a postcard every year.", 'v', "Ben's aunt", ['Canada', 'a postcard']],
    ['We watched a film about penguins. [They] live in very cold places.', 'mv', 'penguins', ['we', 'a film']],
    ['Max lent his bike to Sam. [He] gave it back the next day.', 'm', 'Sam', ['Max', 'his bike']],
    ['Max asked his teacher for help, because [she] always explains things clearly.', 'v', 'his teacher', ['Max', 'help']],
    ['My cousins live on a farm. [They] have cows, sheep and chickens.', 'mv', 'my cousins', ['a farm', 'cows']],
    ['Dad bought new shoes for Tom, but [they] were too small.', 'mv', 'new shoes', ['Dad', 'Tom']]];
  var VW_SOORT = { m:'naar één man of jongen', v:'naar één vrouw of meisje', d:'naar één ding of dier', mv:'naar meer mensen of dingen' };
  var VW_HINT = { m:'He, him en his gaan over één man of jongen.', v:'She en her gaan over één vrouw of meisje.', d:'It en its gaan over één ding of dier.', mv:'They, them en their gaan over meer mensen of dingen.' };
  function opgVerwijs(){
    var V = kies(VW), m = /\[(\w+)\]/.exec(V[0]), w = m[1], kaal = V[0].replace(/[\[\]]/g, '');
    var html = S(V[0]).replace(/\[(\w+)\]/, '<u>$1</u>');
    var st = [ vast('Waar kan ' + en(w) + ' naar verwijzen?', [VW_SOORT.m, VW_SOORT.v, VW_SOORT.d, VW_SOORT.mv], VW_SOORT[V[1]], VW_HINT[V[1]]),
      keuze('Zoek in de tekst ervoor. Waar verwijst ' + en(w) + ' naar?', V[2], V[3], 'Vervang ' + w + ' door elk woord en lees de zin. Welke past bij ' + VW_SOORT[V[1]].replace('naar ', '') + ' en is logisch?') ];
    return eindKeuze({ context:'Lees de tekst. Waar verwijst het gemarkeerde woord naar?', vraag:kaal, vraagHtml:'<span lang="en">' + html + '</span>', stappen:st, beeld:function(n){
      if (n < 2) return '';
      var h = S(V[0]).replace(/\[(\w+)\]/, '<mark>$1</mark>'); h = markeer(h, V[2].charAt(0).toUpperCase() + V[2].slice(1)) === h ? markeer(h, V[2]) : markeer(h, V[2].charAt(0).toUpperCase() + V[2].slice(1));
      return '<div class="lr-tekst" lang="en"><p>' + h + '</p></div>'; } });
  }

  /* ---------- signaalwoorden ---------- */
  /* zin: twee hele zinnen; het signaalwoord komt vooraan in de tweede. k: ook goed als kiesopgave */
  var VB_ZIN = {
    tegenstelling:[['The hotel was very expensive.', 'the rooms were small and dirty.', 1], ['Tom trained hard for months.', 'he did not win the race.', 1],
      ['Most people liked the film.', 'the critics did not like it at all.', 1], ['Smartphones are very useful.', 'they can also be a big distraction.', 1],
      ['It was sunny in the morning.', 'it rained all afternoon.', 1], ['The test looked easy.', 'most students got a low mark.', 1]],
    gevolg:[['The roads were covered in ice.', 'many schools were closed.', 1], ['Emma did not study for the test.', 'she got a very low mark.', 1],
      ['The tickets sold out in ten minutes.', 'many fans could not go to the concert.', 1], ['The bus broke down on the motorway.', 'we arrived two hours late.', 1],
      ['It had not rained for months.', 'the river was almost dry.', 1], ['The shop had very few customers.', 'it closed after a year.', 1]],
    voorbeeld:[['There are many ways to save energy at home.', 'you can turn off the lights when you leave a room.', 1], ['Some animals sleep all winter.', 'bears and hedgehogs sleep until spring.', 1],
      ['Many fruits contain a lot of vitamin C.', 'oranges and kiwis are full of it.', 1], ['Our school offers lots of after-school clubs.', 'you can join the chess club or the drama club.', 0],
      ['Many English words come from French.', 'the words "menu" and "restaurant" are French.', 0], ['You can do a lot to stay healthy.', 'you can eat more fruit and walk to school.', 0]],
    opsomming:[['Cycling is good for your health.', 'it is cheaper than going by car.', 0], ['The new library has thousands of books.', 'it has a large computer room.', 0],
      ['Our hotel had a big swimming pool.', 'breakfast was included in the price.', 0], ['Learning a language helps you when you travel.', 'it can help you to find a job.', 0]] };
  var ZIN_WOORD = { tegenstelling:['However'], gevolg:['Therefore', 'As a result'], voorbeeld:['For example'], opsomming:['Moreover', 'In addition'] };
  /* bijzin: twee delen in een zin, met because, so of but ertussen */
  var VB_BIJ = {
    reden:[['We stayed inside', 'it was raining heavily.'], ['Tom went to bed early', 'he was very tired.'], ['She wore a warm coat', 'it was freezing outside.'],
      ['I could not call you', 'my phone was broken.'], ['The match was cancelled', 'the pitch was flooded.']],
    gevolg:[['It was freezing outside,', 'she wore a warm coat.'], ['My phone was broken,', 'I could not call you.'], ['Tom was very tired,', 'he went to bed early.'],
      ['The shop was closed,', 'we went home.'], ['I forgot my lunch,', 'I bought a sandwich.']],
    tegenstelling:[['The test was difficult,', 'everyone passed it.'], ['I like football,', 'I do not like watching it on TV.'], ['The flat is small,', 'it has a lovely view.'],
      ['He is only ten,', 'he speaks four languages.'], ['We ran to the station,', 'we still missed the train.']] };
  var BIJ_WOORD = { reden:'because', gevolg:'so', tegenstelling:'but' };
  var BETEKENIS = { However:'echter, maar', Therefore:'daarom', 'As a result':'daardoor, met als gevolg', 'For example':'bijvoorbeeld', Moreover:'bovendien', 'In addition':'daarnaast, ook',
    because:'omdat', so:'dus, daarom', but:'maar', Although:'hoewel' };
  var VERBAND = { tegenstelling:'tegenstelling', reden:'oorzaak of reden', gevolg:'gevolg', voorbeeld:'voorbeeld', opsomming:'opsomming' };
  function klein(t){ return /^(I|Tom|Emma)\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  function grootB(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  /* een zin met signaalwoord: { tekst, woord, rel } */
  function maakVerband(){
    if (Math.random() < .5){
      var rel = kies(['tegenstelling', 'gevolg', 'voorbeeld', 'opsomming']), z = kies(VB_ZIN[rel]), w = kies(ZIN_WOORD[rel]);
      return { tekst:z[0] + ' ' + w + ', ' + z[1], woord:w, rel:rel };
    }
    rel = kies(['reden', 'gevolg', 'tegenstelling', 'tegenstelling']);
    var b = kies(VB_BIJ[rel]);
    if (rel === 'tegenstelling' && Math.random() < .5)
      return { tekst:'Although ' + klein(b[0]) + ' ' + b[1], woord:'Although', rel:rel };
    return { tekst:b[0] + ' ' + BIJ_WOORD[rel] + ' ' + b[1], woord:BIJ_WOORD[rel], rel:rel };
  }
  function opgVerband(){
    var V = maakVerband(), woorden = V.tekst.replace(/[.,"]/g, '').split(' ').filter(function(x){ return x.length > 3 && V.woord.split(' ').indexOf(x) < 0 && !/^(they|them|their|there|have|were|with|this|that|from|when|most|many|very)$/i.test(x); });
    var andere = R.hussel(woorden.filter(function(x, i){ return woorden.indexOf(x) === i; })).slice(0, 2);
    var opties = ['tegenstelling', 'oorzaak of reden', 'gevolg', 'voorbeeld', 'opsomming'];
    var st = [ keuze('Welk woord is het signaalwoord?', V.woord, andere, 'Een signaalwoord verbindt twee zinnen of zinsdelen, zoals however, because, so of for example.'),
      vast('Wat betekent het signaalwoord? Welk verband geeft het dus aan?', opties, VERBAND[V.rel], V.woord + ' betekent ' + BETEKENIS[V.woord] + '. Dat geeft een ' + VERBAND[V.rel] + ' aan.') ];
    return eindKeuze({ context:'Welk verband geeft het signaalwoord aan?', vraag:V.tekst, vraagHtml:'<span lang="en">' + S(V.tekst) + '</span>', stappen:st, beeld:function(n){
      return n >= 1 ? '<div class="lr-tekst" lang="en"><p>' + markeer(S(V.tekst), V.woord) + '</p></div>' : ''; } });
  }
  var REL_HINT = { tegenstelling:'Het tweede deel is anders dan je na het eerste deel verwacht.', gevolg:'Het tweede deel is wat er daardoor gebeurde.',
    voorbeeld:'Het tweede deel noemt een voorbeeld bij het eerste deel.', reden:'Het tweede deel zegt waarom het eerste deel gebeurde.' };
  function opgKiesSignaal(){
    var v, opties, goed, rel, relOpties;
    if (Math.random() < .5){
      rel = kies(['tegenstelling', 'gevolg', 'voorbeeld']);
      var z = kies(VB_ZIN[rel].filter(function(x){ return x[2]; }));
      v = z[0] + ' ___, ' + z[1];
      opties = ['However', 'Therefore', 'For example']; goed = { tegenstelling:'However', gevolg:'Therefore', voorbeeld:'For example' }[rel];
      relOpties = ['tegenstelling', 'gevolg', 'voorbeeld'];
    } else {
      rel = kies(['reden', 'gevolg', 'tegenstelling']);
      var b = kies(VB_BIJ[rel]);
      v = b[0] + ' ___ ' + b[1];
      opties = ['because', 'so', 'but']; goed = BIJ_WOORD[rel];
      relOpties = ['oorzaak of reden', 'gevolg', 'tegenstelling'];
    }
    var st = [ vast('Lees beide delen. Wat is het verband tussen de twee delen?', relOpties, VERBAND[rel], REL_HINT[rel]),
      vast('Welk signaalwoord past daarbij?', opties, goed, goed + ' (' + BETEKENIS[goed] + ') geeft een ' + VERBAND[rel] + ' aan.') ];
    return eindKeuze({ context:'Kies het signaalwoord dat in het gat past.', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(n){
      return n >= 2 ? '<div class="lr-tekst" lang="en"><p>' + S(v).replace('___', '<mark>' + S(goed) + '</mark>') + '</p></div>' : ''; } });
  }

  /* ---------- de hoofdgedachte ---------- */
  /* onderwerp, zinnen, kernzin (index), hoofdgedachte, een detail, iets wat er niet staat */
  var HG = [['fietsen', ['Cycling is a very good way to travel in a city.', 'It is cheaper than taking the bus or a taxi.', 'You do not get stuck in traffic jams.', 'And you get some exercise at the same time.'], 0,
      'Fietsen is een goede manier om je in de stad te verplaatsen.', 'Met de fiets sta je niet in de file.', 'In de stad is veel verkeer.'],
    ['egels', ['Hedgehogs are in trouble in Britain.', 'Many of their homes have disappeared because of new roads and houses.', 'Lots of hedgehogs are also killed by cars.', 'Today there are far fewer hedgehogs than fifty years ago.'], 0,
      'Het gaat slecht met de egels in Groot-Brittannië.', 'Veel egels worden doodgereden.', 'Egels leven graag in tuinen.'],
    ['Mia en de honden', ["Last summer, Mia started walking her neighbour's dog every day.", 'Later, two other neighbours asked her to walk their dogs too.', 'Now she walks five dogs a week and gets paid for it.', 'A small favour has turned into a real little business.'], 3,
      'Een kleine gunst is voor Mia een echt bedrijfje geworden.', 'Mia laat nu vijf honden per week uit.', 'Mia houdt meer van honden dan van katten.'],
    ['zwemmen', ['There are many good reasons to learn to swim.', 'Swimming is a great way to stay fit.', 'It is also fun to do with friends.', 'Most importantly, it can save your life if you fall into the water.'], 0,
      'Er zijn veel goede redenen om te leren zwemmen.', 'Zwemmen kan je leven redden.', 'Zwemles is duur.'],
    ['Sam', ['Every morning last week, Sam forgot something.', 'On Monday he left his PE kit at home.', 'On Tuesday he forgot his lunch.', 'On Wednesday he even forgot his school bag.'], 0,
      'Sam vergat vorige week elke ochtend iets.', 'Sam vergat op dinsdag zijn lunch.', 'Sam had geen zin in school.'],
    ['Lucy', ['The bus was late again.', 'Then the train was cancelled because of the snow.', 'When Lucy finally arrived at school, the doors were locked.', 'It was the worst start to a school day she had ever had.'], 3,
      'Lucy had de slechtste start van een schooldag ooit.', 'De trein reed niet door de sneeuw.', 'Lucy komt altijd te laat.'],
    ['plastic in de zee', ['Plastic in the sea is a serious problem for animals.', 'Turtles often think that plastic bags are jellyfish and eat them.', 'Seabirds get stuck in old fishing nets.', 'Many of these animals die.'], 0,
      'Plastic in de zee is een groot probleem voor dieren.', 'Schildpadden eten soms plastic zakken.', 'In de zee leven veel kwallen.'],
    ['de kantine', ['Our school has made some changes to the canteen.', 'There are now more healthy snacks, such as fruit and salads.', 'Fizzy drinks are no longer sold.', 'And students can now pay with their phones.'], 0,
      'De kantine van onze school is veranderd.', 'In de kantine kun je nu met je telefoon betalen.', 'Gezond eten is belangrijk.'],
    ['Jake', ['Jake practised the guitar for an hour every day.', 'He watched online lessons and played with other musicians.', 'He never gave up, even when it was difficult.', 'All that hard work paid off when he played his first concert.'], 3,
      'Door hard te oefenen kon Jake zijn eerste concert geven.', 'Jake keek online gitaarlessen.', 'Gitaar spelen is moeilijk.'],
    ['honden', ['Dogs can help people in many different ways.', 'Guide dogs help blind people to cross the road.', 'Police dogs can find drugs and missing people.', 'Some dogs even visit hospitals to cheer up patients.'], 0,
      'Honden kunnen mensen op veel manieren helpen.', 'Politiehonden zoeken vermiste mensen.', 'Blinde mensen hebben altijd een hond.'],
    ['Londen', ['London has a lot to offer tourists.', 'There are famous museums, and many of them are free.', 'You can visit royal palaces and old castles.', 'And there are theatres, parks and markets everywhere.'], 0,
      'Toeristen kunnen in Londen veel doen.', 'Veel musea in Londen zijn gratis.', 'Londen is een dure stad.'],
    ['televisie', ['In 1950, most families in Britain did not have a television.', 'By 1970, most homes had one.', 'Today, many people watch programmes on their phones or laptops.', 'The way we watch television has changed a lot in the last seventy years.'], 3,
      'De manier waarop we televisie kijken is erg veranderd.', 'In 1970 hadden de meeste huizen een televisie.', 'Televisie kijken is slecht voor je ogen.'],
    ['slaap', ['Getting enough sleep is important for teenagers.', 'Without enough sleep, it is hard to concentrate at school.', 'You can also become moody and tired.', 'Experts say that teenagers need about nine hours of sleep a night.'], 0,
      'Genoeg slaap is belangrijk voor tieners.', 'Tieners hebben ongeveer negen uur slaap nodig.', 'Tieners gaan te laat naar bed.'],
    ['leren voor een toets', ['Some students make notes in different colours.', 'Others record themselves and listen on the bus.', 'Some like to test themselves with flashcards.', 'Everyone has their own way of learning for a test.'], 3,
      'Iedereen leert op een eigen manier voor een toets.', 'Sommige leerlingen overhoren zichzelf met flashcards.', 'Leren met kleuren werkt het best.']];
  function alinea(H, kern){
    return '<div class="lr-tekst" lang="en"><p>' + H[1].map(function(z, i){
      var t = '<sup>' + (i + 1) + '</sup> ' + S(z);
      return kern && i === H[2] ? '<mark>' + t + '</mark>' : t;
    }).join(' ') + '</p></div>';
  }
  function opgHoofd(){
    var H = kies(HG), nr = 'zin ' + (H[2] + 1);
    var st = [ vast('Welke zin is de kernzin: de zin die de hele alinea samenvat?', ['zin 1', 'zin 2', 'zin 3', 'zin 4'], nr, 'De kernzin staat vaak aan het begin of aan het eind. De andere zinnen geven voorbeelden of details bij die zin.'),
      keuze('Wat is dus de hoofdgedachte van de alinea?', H[3], [H[4], H[5]], 'Kies wat de kernzin zegt. Iets uit één andere zin is maar een detail, en sommige dingen staan helemaal niet in de tekst.') ];
    return eindKeuze({ context:'Lees de alinea over ' + S(H[0]) + '.', vraag:'Wat is de hoofdgedachte van deze alinea?', stappen:st, beeld:function(n){ return alinea(H, n >= 1); } });
  }

  /* ================= de doelen ================= */
  LEERROUTE.voeg('engels', [
    { groep:{ id:'en-a2-lezen', niveau:'A2', domein:'lezen', naam:'Gericht zoeken in een tekst', uit:'Een tijd of prijs snel vinden zonder alles te lezen, en weten waar woorden als it en they naar verwijzen.' },
      doelen:[
        { id:'en-scannen', naam:'Scannen: snel een gegeven vinden', kort:'Bedenk wat je zoekt, kies een sleutelwoord en lees alleen rond dat woord',
          uit:'<p>Bij <b>scannen</b> lees je niet de hele tekst. Je zoekt <b>één gegeven</b>, zoals een tijd of een prijs.</p><p>Stap 1: wat zoek je? Een tijd, een prijs, een dag? Stap 2: welk <b>sleutelwoord</b> uit de vraag zoek je in de tekst? Zaterdag is bijvoorbeeld ' + E('weekend') + ', een kind is ' + E('children') + '. Stap 3: lees alleen de zin met dat woord.</p>',
          wanneer:'je in een folder, rooster of website één ding wilt opzoeken.', maak:opgScan },
        { id:'en-verwijswoord', naam:'Verwijswoorden: waar slaat it of they op?', kort:'Kijk wat voor woord het is, zoek terug in de tekst en probeer het uit',
          uit:'<p>Een <b>verwijswoord</b> zoals ' + E('he, she, it, they, his, its, them') + ' verwijst naar iets wat eerder in de tekst staat.</p><p>Stap 1: wat voor woord is het? ' + E('He, his') + ': één man of jongen. ' + E('She, her') + ': één vrouw of meisje. ' + E('It, its') + ': één ding of dier. ' + E('They, them, their') + ': meer mensen of dingen.</p><p>Stap 2: zoek <b>terug</b> in de tekst en vervang het verwijswoord door wat je vindt. Is de zin dan logisch? Dan heb je het.</p>',
          wanneer:'je in een tekst niet zeker weet over wie of wat het gaat.', maak:opgVerwijs }
      ] },
    { groep:{ id:'en-b1-lezen', niveau:'B1', domein:'lezen', naam:'Tekstverbanden en de hoofdgedachte', uit:'Signaalwoorden laten zien hoe zinnen met elkaar verbonden zijn. Met de kernzin vind je de hoofdgedachte van een alinea.' },
      doelen:[
        { id:'en-verband', naam:'Signaalwoorden: welk verband?', kort:'Zoek het signaalwoord, denk aan de betekenis en benoem het verband',
          uit:'<p>Een <b>signaalwoord</b> laat zien hoe twee zinnen of zinsdelen bij elkaar horen.</p><p><b>Tegenstelling</b>: ' + E('however, but, although') + '. <b>Oorzaak of reden</b>: ' + E('because') + '. <b>Gevolg</b>: ' + E('therefore, so, as a result') + '. <b>Voorbeeld</b>: ' + E('for example') + '. <b>Opsomming</b>: ' + E('moreover, in addition') + '.</p><p>Zoek eerst het signaalwoord, bedenk wat het betekent, en kies dan het verband.</p>',
          wanneer:'je wilt begrijpen hoe een tekst in elkaar zit.', maak:opgVerband },
        { id:'en-signaal-kiezen', naam:'Het goede signaalwoord kiezen', kort:'Bepaal eerst het verband tussen de twee delen, kies dan het woord dat daarbij hoort',
          uit:'<p>Moet je zelf een <b>signaalwoord</b> kiezen? Lees dan eerst <b>beide delen</b>.</p><p>Is het tweede deel anders dan je verwacht? <b>Tegenstelling</b>: ' + E('however, but') + '. Zegt het tweede deel waarom? <b>Reden</b>: ' + E('because') + '. Is het tweede deel wat er daardoor gebeurt? <b>Gevolg</b>: ' + E('therefore, so') + '. Noemt het een voorbeeld? ' + E('For example') + '.</p>',
          wanneer:'je een tekst schrijft of een invuloefening met signaalwoorden maakt.', maak:opgKiesSignaal },
        { id:'en-hoofdgedachte', naam:'De hoofdgedachte van een alinea', kort:'Zoek de kernzin (vaak de eerste of de laatste zin) en kies wat die zin zegt',
          uit:'<p>De <b>hoofdgedachte</b> is het belangrijkste wat de schrijver in een alinea wil zeggen.</p><p>Je vindt hem in de <b>kernzin</b>. Die staat vaak <b>aan het begin of aan het eind</b>. De andere zinnen geven voorbeelden of details bij de kernzin.</p><p>Let op: een detail uit één zin is niet de hoofdgedachte. En iets wat niet in de tekst staat, ook niet.</p>',
          wanneer:'je moet zeggen waar een alinea vooral over gaat.', maak:opgHoofd }
      ] }
  ]);
})();
