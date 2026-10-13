/* De leerroute Engels: grammatica.
   A1: to be, have got, de present simple en de present continuous.
   A2: vragen en ontkenningen met do, does en did, de past simple, de woordvolgorde,
   some en any, much en many, vergelijken en het bijwoord.
   B1: present perfect, past continuous, de toekomst, if-zinnen, de passieve vorm
   en who, which en whose. B2: if type 3, de indirecte rede en question tags.
   Uitleg en stappen in het Nederlands, de zinnen in Brits Engels. Zie leerroute.js
   voor het formaat.

   Opbouw: een woordenboek van werkwoorden (WW, met alle vormen), zinsraamwerken
   (FR: werkwoord, rest van de zin en waar het raamwerk voor past), onderwerpen,
   dan de opgaven per doel en onderaan de doelen. */
(function(){
  'use strict';
  var R = LEERROUTE.R;
  function kies(l){ return R.kies(l); }
  function kans(p){ return Math.random() < p; }
  function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  function S(t){ return R.schoon(t); }
  function en(t){ return '<i lang="en">' + S(t) + '</i>'; }

  /* ---------- stappen ---------- */
  function keuze(tekst, goed, fout, hint, extra){
    var lijst = [goed];
    (fout || []).forEach(function(f){ if (f != null && f !== '' && lijst.indexOf(f) < 0) lijst.push(f); });
    var o = R.hussel(lijst), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  /* een keuze waarbij de volgorde van de opties vast blijft (bijvoorbeeld am, is, are) */
  function vast(tekst, opties, goed, hint){ return { tekst:tekst, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint }; }
  function invul(tekst, ant, hint, extra){
    var s = { tekst:tekst, antwoord:ant, hint:hint };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; if (s.opties){ op.opties = s.opties; op.goed = s.goed; } return op; }

  /* ---------- het woordenboek: hele werkwoord, -s, -ing, past simple, voltooid deelwoord ---------- */
  var WW = {};
  ('play plays playing played played, walk walks walking walked walked, watch watches watching watched watched,' +
   'cook cooks cooking cooked cooked, clean cleans cleaning cleaned cleaned, help helps helping helped helped,' +
   'visit visits visiting visited visited, listen listens listening listened listened, work works working worked worked,' +
   'wash washes washing washed washed, fix fixes fixing fixed fixed, miss misses missing missed missed,' +
   'finish finishes finishing finished finished, catch catches catching caught caught, teach teaches teaching taught taught,' +
   'go goes going went gone, do does doing did done, study studies studying studied studied, carry carries carrying carried carried,' +
   'cry cries crying cried cried, tidy tidies tidying tidied tidied, try tries trying tried tried, hurry hurries hurrying hurried hurried,' +
   'fly flies flying flew flown, enjoy enjoys enjoying enjoyed enjoyed, stay stays staying stayed stayed, buy buys buying bought bought,' +
   'pay pays paying paid paid, like likes liking liked liked, live lives living lived lived, dance dances dancing danced danced,' +
   'smile smiles smiling smiled smiled, move moves moving moved moved, close closes closing closed closed,' +
   'arrive arrives arriving arrived arrived, make makes making made made, write writes writing wrote written,' +
   'ride rides riding rode ridden, drive drives driving drove driven, take takes taking took taken, come comes coming came come,' +
   'give gives giving gave given, leave leaves leaving left left, bake bakes baking baked baked, stop stops stopping stopped stopped,' +
   'plan plans planning planned planned, shop shops shopping shopped shopped, chat chats chatting chatted chatted,' +
   'drop drops dropping dropped dropped, run runs running ran run, swim swims swimming swam swum, sit sits sitting sat sat,' +
   'get gets getting got got, win wins winning won won, lie lies lying - -, read reads reading read read, eat eats eating ate eaten,' +
   'drink drinks drinking drank drunk, see sees seeing saw seen, sing sings singing sang sung, speak speaks speaking spoke spoken,' +
   'tell tells telling told told, lose loses losing lost lost, break breaks breaking broke broken, bring brings bringing brought brought,' +
   'sleep sleeps sleeping slept slept, wear wears wearing wore worn, find finds finding found found, meet meets meeting met met,' +
   'build builds building built built, send sends sending sent sent, open opens opening opened opened,' +
   'paint paints painting painted painted, phone phones phoning phoned phoned, start starts starting started started,' +
   'wait waits waiting waited waited, call calls calling called called, invite invites inviting invited invited,' +
   'answer answers answering answered answered, grow grows growing grew grown, practise practises practising practised practised,' +
   'have has having had had, pass passes passing passed passed, save saves saving saved saved, feel feels feeling felt felt,' +
   'snow snows snowing snowed snowed, rain rains raining rained rained, ask asks asking asked asked,' +
   'explain explains explaining explained explained, forget forgets forgetting forgot forgotten, water waters watering watered watered,' +
   'deliver delivers delivering delivered delivered, design designs designing designed designed, arrest arrests arresting arrested arrested,' +
   'check checks checking checked checked, bite bites biting bit bitten, prepare prepares preparing prepared prepared,' +
   'sell sells selling sold sold, plant plants planting planted planted, rescue rescues rescuing rescued rescued, use uses using used used,' +
   'fall falls falling fell fallen').split(',').forEach(function(x){
    var p = x.trim().split(/\s+/);
    WW[p[0]] = { b:p[0], s:p[1], ing:p[2], past:p[3], pp:p[4] };
  });
  /* de spellingregel bij he/she/it */
  function sEind(b){ return /(s|sh|ch|x|o)$/.test(b) ? 'es' : /[^aeiou]y$/.test(b) ? 'ies' : /[aeiou]y$/.test(b) ? 'ky' : 'gewoon'; }
  /* de spellingregel bij -ing */
  function ingRegel(V){
    var b = V.b, i = V.ing;
    if (i === b + 'ing') return 'gewoon';
    if (/ie$/.test(b) && i === b.slice(0, -2) + 'ying') return 'ie';
    if (/e$/.test(b) && i === b.slice(0, -1) + 'ing') return 'e';
    if (i === b + b.slice(-1) + 'ing') return 'dubbel';
    return 'anders';
  }
  /* de spellingregel bij -ed; 'onr' is onregelmatig */
  function edRegel(V){
    var b = V.b, p = V.past;
    if (p === b + 'ed') return 'gewoon';
    if (/e$/.test(b) && p === b + 'd') return 'e';
    if (/[^aeiou]y$/.test(b) && p === b.slice(0, -1) + 'ied') return 'y';
    if (p === b + b.slice(-1) + 'ed') return 'dubbel';
    return 'onr';
  }
  function regelmatig(V){ return V.past !== '-' && edRegel(V) !== 'onr'; }

  /* ---------- zinsraamwerken ----------
     werkwoord|rest van de zin|waar het past:
       g gewoonte (present simple), e een keer (verleden, toekomst), n nu bezig (continuous), l past na Look!,
       d past bij elke dag, s toestand (geen tijdwoord), k alleen kinderen, v alleen volwassenen,
       x op een schooldag (niet in het weekend), 1 alleen een onderwerp in het enkelvoud */
  var FR = ('play|football in the park|genlf; play|computer games|gen; play|the guitar|genld; walk|to school|gendkx; walk|the dog|genldf;' +
    'watch|TV|gend; watch|a film|en; cook|dinner|genldf; clean|the kitchen|genlf; clean|the windows|enl; help|the neighbours|genf;' +
    'visit|the museum|ef; visit|London|ef; visit|the zoo|ef; listen|to music|gend; listen|to the radio|gend; work|in the garden|genlf;' +
    'work|in a shop|gv; wash|the car|genlf; wash|the dishes|genld; fix|the bike|enlf; fix|computers|gv; miss|the bus|ge; finish|the project|ef;' +
    'finish|work at five o\'clock|gdv; catch|the bus|gend; catch|the ball|enl; teach|English|gnv; teach|maths|gnv; go|to the cinema|gef;' +
    'go|to school|nkx; go|swimming|gef; do|the shopping|genf; do|yoga|gen; do|the dishes|gend; study|for the test|enkxf; study|French|gn;' +
    'study|in the library|gen; carry|the heavy bags|enl; cry|at sad films|g; tidy|the kitchen|genf; try|a new recipe|genf;' +
    'hurry|to the station|enl; fly|to Spain|ef; enjoy|the party|enf; enjoy|the sunshine|gen; stay|at home|gen; stay|in a hotel|enf;' +
    'buy|bread|ge; buy|a new phone|ef; pay|the bill|ge; like|pizza|gs; live|in London|gs; dance|at the party|enf; smile|at the baby|enl;' +
    'move|to a new house|ef; close|the door|enl; close|the windows|enl; arrive|at school|gdkx; make|a cake|genlf; make|breakfast|genld;' +
    'write|an email|gen; write|a letter|genf; ride|a horse|genl1; ride|a bike|genl1; drive|to work|gendvx; take|the train|gedf;' +
    'take|photos|genl; come|home|gef; give|a presentation|enf; leave|the house|ged; bake|a cake|genlf; bake|bread|gen;' +
    'stop|at the traffic lights|ge; plan|a trip|enf; shop|at the market|gen; chat|with friends|genl; drop|a plate|e;' +
    'run|in the park|genl; run|to the bus stop|enl; swim|in the lake|genl; swim|in the sea|genl; sit|in the garden|genl;' +
    'get|up early|ged; win|the match|ef; lie|on the beach|nl; lie|on the sofa|nl; read|a book|genl; read|the newspaper|gend;' +
    'eat|an apple|genl1; eat|lunch|gend; eat|fish and chips|gen; drink|tea|gend; drink|orange juice|gen; see|a fox|e;' +
    'sing|a song|enl; sing|in a choir|g; speak|French|g; speak|to the head teacher|e; tell|a joke|en1; tell|a story|en1;' +
    'lose|the keys|e; lose|the match|e; break|a glass|e; break|a window|e; bring|a cake|e; sleep|in a tent|enf; wear|a uniform|g;' +
    'wear|a coat|gen1; find|a wallet|e; meet|friends in town|gef; build|a sandcastle|enlf; send|a message|gen; send|a postcard|e;' +
    'open|the window|enl; open|the door|enl; paint|the fence|enlf; phone|the doctor|e1f; start|a new job|evf; wait|for the bus|genld;' +
    'call|the doctor|e1f; invite|friends to the party|ef; answer|the phone|en; answer|the question|e; grow|vegetables|g;' +
    'practise|the piano|gend').split(';').map(function(x){
    var p = x.trim().split('|'), f = p[2];
    return { v:WW[p[0]], x:p[1], g:/g/.test(f), e:/e/.test(f), n:/n/.test(f), f:/f/.test(f), l:/l/.test(f), d:/d/.test(f), s:/s/.test(f),
      w:/k/.test(f) ? 'k' : /v/.test(f) ? 'v' : '', x5:/x/.test(f), een:/1/.test(f) };
  });
  function raam(filter){ return kies(FR.filter(filter)); }
  /* wat je liever niet voorspelt of plant */
  var ONGELUK = /^(lose|break|drop|find|see|miss)$/;

  /* ---------- onderwerpen: p 1 = I, 2 = you, 3 = he/she/it, mv = we/they; pr = het voornaamwoord ---------- */
  var ONDW = [ { t:'I', p:'1' }, { t:'you', p:'2' }, { t:'he', p:'3' }, { t:'she', p:'3' }, { t:'we', p:'mv' }, { t:'they', p:'mv' },
    { t:'Tom', p:'3', pr:'he', w:'k' }, { t:'Emma', p:'3', pr:'she', w:'k' }, { t:'my brother', p:'3', pr:'he', w:'k' },
    { t:'my sister', p:'3', pr:'she', w:'k' }, { t:'the children', p:'mv', pr:'they', w:'k' }, { t:'Lucy and Sam', p:'mv', pr:'they', w:'k' },
    { t:'my dad', p:'3', pr:'he', w:'v' }, { t:'my mum', p:'3', pr:'she', w:'v' }, { t:'Mr Brown', p:'3', pr:'he', w:'v' },
    { t:'Mrs Smith', p:'3', pr:'she', w:'v' }, { t:'my parents', p:'mv', pr:'they', w:'v' }, { t:'our neighbours', p:'mv', pr:'they', w:'v' } ];
  function onderwerp(F, filter){
    var l = ONDW.filter(function(o){
      if (F){ if (F.w === 'k' && o.w === 'v') return false; if (F.w === 'v' && o.w === 'k') return false; if (F.een && o.p === 'mv') return false; }
      return !filter || filter(o);
    });
    return kies(l);
  }
  function is3(o){ return o.p === '3'; }
  function beNu(o){ return o.p === '1' ? 'am' : o.p === '3' ? 'is' : 'are'; }
  function beToen(o){ return o.p === '1' || o.p === '3' ? 'was' : 'were'; }
  function heeft(o){ return is3(o) ? 'has' : 'have'; }
  function doe(o){ return is3(o) ? 'does' : 'do'; }
  /* hoe je het onderwerp vervangt: Tom = he */
  function wie(o){
    if (o.p === '1') return 'Het onderwerp is I.';
    if (!o.pr) return 'Het onderwerp is ' + o.t + '.';
    return cap(o.t) + ' kun je vervangen door ' + o.pr + '.';
  }
  function rijBe(o){ return o.p === '1' ? 'I' : o.p === '3' ? 'he, she, it' : 'you, we, they'; }

  /* ---------- tijdwoorden ---------- */
  function tijdPs(F){
    if (F.s) return null;
    var l = [{ t:'usually', voor:1 }, { t:'often', voor:1 }, { t:'sometimes', voor:1 }];
    if (F.d) l.push({ t:'always', voor:1 }, { t:'every day' }, { t:'every day' });
    return kies(l);
  }
  function tijdPc(F, o){
    var l = [{ t:'now' }, { t:'right now' }, { t:'at the moment' }];
    if (F.l && !(o && (o.p === '1' || o.t === 'we'))) l.push({ t:'Look!', start:1 }, { t:'Look!', start:1 });
    return kies(l);
  }
  function tijdPast(F){ return kies(['yesterday', 'two days ago', 'last week'].concat(F.x5 ? [] : ['last Saturday', 'last weekend'])); }
  function tijdToek(F){ return kies(['tomorrow', 'tomorrow', 'next week'].concat(F.x5 ? [] : ['next Saturday'])); }

  /* ---------- een zin in stukken ---------- */
  /* delen: { t, rol }; rol 'gat' is het gat, met ww: wat er tussen haakjes staat */
  function zTekst(z, vul){
    var uit = [];
    z.delen.forEach(function(d, i){
      var t = d.rol === 'gat' ? (vul != null ? vul : '___' + (d.ww ? ' (' + d.ww + ')' : '')) : d.t;
      if (i === 0 || /[.!?]$/.test(uit[i - 1])) t = cap(t);
      uit.push(t + (d.na || ''));
    });
    return uit.join(' ') + z.slot;
  }
  /* de zin als plaatje: merk = { rol:{ k, label } }; vul vult het gat */
  function zBeeld(z, merk, vul){
    merk = merk || {};
    var vorige = '';
    return '<div lang="en">' + R.teken.zin(z.delen.map(function(d, i){
      var m = merk[d.rol], t = d.rol === 'gat' ? (vul != null ? vul : '___') : d.t;
      if (i === 0 || /[.!?]$/.test(vorige)) t = cap(t);
      t += d.na || '';
      vorige = t;
      if (i === z.delen.length - 1) t += z.slot;
      return m ? { t:t, k:m.k, label:m.label } : t;
    })) + '</div>';
  }
  /* een raamwerk als tekst met ___: 'Tom is ___ than his sister.' */
  function zVan(tpl, ww){
    var m = /^(.*?)\s*___\s*(.*?)([.?!])$/.exec(tpl), d = [];
    if (m[1]) d.push({ t:m[1], rol:'a' });
    d.push({ t:'___', rol:'gat', ww:ww });
    if (m[2]) d.push({ t:m[2], rol:'b' });
    return { delen:d, slot:m[3] };
  }
  function opg(context, z, stappen, beeld){
    var v = zTekst(z);
    return { context:context, vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:stappen, beeld:beeld };
  }
  /* een gewone zin: onderwerp, (tijdwoord), gat, rest, (tijdwoord) */
  function zinMet(o, gat, x, tijd){
    var d = [];
    if (tijd && tijd.start) d.push({ t:tijd.t, rol:'sw' });
    d.push({ t:o.t, rol:'o' });
    if (tijd && tijd.voor) d.push({ t:tijd.t, rol:'sw' });
    d.push(gat);
    if (x) d.push({ t:x, rol:'x' });
    if (tijd && !tijd.voor && !tijd.start) d.push({ t:tijd.t, rol:'sw' });
    return { delen:d, slot:'.' };
  }
  /* de woorden van de zin waaruit je het onderwerp of het signaalwoord kiest */
  function stukken(z){ return z.delen.filter(function(d){ return d.rol !== 'gat'; }).map(function(d){ return d.t; }); }

  /* ================= A1 ================= */
  var BE_X = ['at home', 'in the garden', 'very tired', 'hungry', 'at school', 'from Manchester', 'good at football', 'in the kitchen',
    'late again', 'ill today', 'on holiday', 'very happy'];
  function opgBe(){
    var o = onderwerp(null), x = kies(BE_X), soort = kies(['bev', 'bev', 'ont', 'vraag']);
    if (soort === 'vraag' && o.p === '1') soort = 'bev';
    var vorm = beNu(o), z, ant, tekst, hint, fout = {};
    if (soort === 'vraag'){
      z = { delen:[{ t:'___', rol:'gat', ww:'be' }, { t:o.t, rol:'o' }, { t:x, rol:'x' }], slot:'?' };
      ant = cap(vorm); tekst = 'Het is een vraag: de vorm staat vooraan. Je schrijft';
      hint = 'Bij ' + rijBe(o) + ' hoort ' + vorm + '. Schrijf het met een hoofdletter: ' + cap(vorm) + '.';
    } else if (soort === 'ont'){
      z = zinMet(o, { t:'___', rol:'gat', ww:'be + not' }, x);
      ant = vorm === 'am' ? ['am not'] : [vorm + "n't", vorm + ' not']; tekst = 'Zet not achter de vorm. Je schrijft';
      hint = 'Bij ' + rijBe(o) + ' hoort ' + vorm + '. Met not erachter: ' + ant[0] + '.';
      fout['not'] = 'Je mist nog de vorm van to be: ' + vorm + '.';
    } else {
      z = zinMet(o, { t:'___', rol:'gat', ww:'be' }, x);
      ant = vorm; tekst = 'Dus de vorm van to be is';
      hint = 'Bij I hoort am, bij he, she en it hoort is, bij you, we en they hoort are.';
    }
    ['am', 'is', 'are'].forEach(function(f){ if (f !== vorm) fout[f] = f === 'am' ? 'Am hoort alleen bij I.' : f === 'is' ? 'Is hoort bij he, she en it.' : 'Are hoort bij you, we en they.'; });
    var st = [ vast('Bij welk rijtje hoort het onderwerp ' + en(o.t) + '?', ['I', 'he, she, it', 'you, we, they'], rijBe(o), wie(o)),
      invul(tekst, ant, hint, { fout:fout }) ];
    return opg('Vul de goede vorm van <i lang="en">to be</i> in: am, is of are.', z, st, function(n){
      return zBeeld(z, n >= 1 ? { o:{ k:1, label:rijBe(o) } } : {}, n >= 2 ? (soort === 'vraag' ? cap(vorm) : [].concat(ant)[0]) : null); });
  }

  var HG_X = ['a new bike', 'two brothers', 'a cat', 'blue eyes', 'a cold', 'long hair', 'a lot of homework', 'a big garden', 'a new phone', 'a dog', 'three cousins'];
  function opgHaveGot(){
    var o = onderwerp(null), x = kies(HG_X), soort = kies(['bev', 'bev', 'ont', 'vraag']);
    if (soort === 'vraag' && o.p === '1') soort = 'bev';
    var h = heeft(o), z, ant, tekst, fout = {};
    if (soort === 'vraag'){
      z = { delen:[{ t:'___', rol:'gat', ww:'have' }, { t:o.t, rol:'o' }, { t:'got ' + x, rol:'x' }], slot:'?' };
      ant = cap(h); tekst = 'Het is een vraag: ' + h + ' staat vooraan, got blijft achter het onderwerp. Je schrijft';
    } else if (soort === 'ont'){
      z = zinMet(o, { t:'___', rol:'gat', ww:'not + have got' }, x);
      ant = [h + "n't got", h + ' not got']; tekst = 'Met not erbij schrijf je';
    } else {
      z = zinMet(o, { t:'___', rol:'gat', ww:'have got' }, x);
      ant = h + ' got'; tekst = 'Dus je schrijft';
    }
    var ander = h === 'has' ? 'have' : 'has';
    fout[[].concat(ant)[0].replace(h, ander).toLowerCase()] = h === 'has' ? 'Bij he, she en it wordt have: has.' : 'Has hoort alleen bij he, she en it.';
    var st = [ vast('Is het onderwerp ' + en(o.t) + ' he, she of it?', ['ja: he, she of it', 'nee: I, you, we of they'], is3(o) ? 'ja: he, she of it' : 'nee: I, you, we of they', wie(o)),
      invul(tekst, ant, (is3(o) ? 'He, she en it krijgen has.' : 'I, you, we en they krijgen have.') + ' Het wordt ' + [].concat(ant)[0] + '.', { fout:fout }) ];
    return opg('Vul de goede vorm van <i lang="en">have got</i> in.', z, st, function(n){
      return zBeeld(z, n >= 1 ? { o:{ k:1, label:is3(o) ? 'he/she/it' : 'geen he/she/it' } } : {}, n >= 2 ? [].concat(ant)[0] : null); });
  }

  /* present simple: welk onderwerp, he/she/it, de vorm */
  function opgPsS(){
    var F = raam(function(f){ return f.g && sEind(f.v.b) === 'gewoon' && f.v.b !== 'have'; });
    var o = onderwerp(F), V = F.v, tijd = tijdPs(F), vorm = is3(o) ? V.s : V.b;
    var z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, F.x, tijd);
    var fout = {}; if (is3(o)) fout[V.b] = 'Het onderwerp is he, she of it: dan komt er een -s achter.'; else fout[V.s] = 'Bij I, you, we en they komt er geen -s achter.';
    var st = [ keuze('Wat is het onderwerp van de zin?', o.t, [F.x].concat(tijd ? [tijd.t] : []), 'Het onderwerp is wie of wat het doet. Wie doet hier ' + V.b + '?'),
      vast('Is het onderwerp he, she of it?', ['ja', 'nee'], is3(o) ? 'ja' : 'nee', wie(o)),
      invul('Dus ' + en(V.b) + ' wordt', vorm, is3(o) ? 'Bij he, she en it zet je -s achter het werkwoord: ' + V.s + '.' : 'Bij ' + (o.pr || o.t) + ' blijft het werkwoord zoals het is: ' + V.b + '.', { fout:fout }) ];
    return opg('Vul de present simple in.', z, st, function(n){
      var m = {}; if (n >= 1) m.o = { k:1, label:'onderwerp' }; if (n >= 2) m.o.label = is3(o) ? 'he/she/it' : 'geen he/she/it';
      if (n >= 3) m.gat = { k:2, label:is3(o) ? '+ s' : 'zonder s' };
      return zBeeld(z, m, n >= 3 ? vorm : null); });
  }
  var S_EIND = { es:'op s, sh, ch, x of o', ies:'op een medeklinker + y', ky:'op een klinker + y', gewoon:'op iets anders' };
  var S_UIT = { es:'-es', ies:'y wordt -ies', ky:'-s', gewoon:'-s' };
  function opgPsSpel(){
    var cat = kies(['es', 'es', 'ies', 'ies', 'ky', 'gewoon']);
    var F = raam(function(f){ return f.g && f.v.b !== 'have' && sEind(f.v.b) === cat; });
    var o = onderwerp(F, is3), V = F.v, tijd = tijdPs(F);
    var z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, F.x, tijd), b = V.b;
    var fout = {};
    if (cat === 'es') fout[b + 's'] = 'Na ' + (/(sh|ch)$/.test(b) ? b.slice(-2) : b.slice(-1)) + ' schrijf je -es, niet alleen -s.';
    if (cat === 'ies'){ fout[b + 's'] = 'Voor de y staat een medeklinker: de y wordt -ies.'; fout[b + 'es'] = 'De y verandert: ' + V.s + '.'; }
    if (cat === 'ky') fout[b.slice(0, -1) + 'ies'] = 'Voor de y staat een klinker: dan blijft de y staan en komt er alleen -s achter.';
    if (cat === 'gewoon') fout[b + 'es'] = 'Alleen na s, sh, ch, x en o schrijf je -es.';
    fout[b] = 'Het onderwerp is he, she of it: het werkwoord krijgt een -s.';
    var eindHint = { es:b + ' eindigt op ' + (/(sh|ch)$/.test(b) ? b.slice(-2) : b.slice(-1)) + '.', ies:b + ' eindigt op een medeklinker + y.', ky:b + ' eindigt op een klinker + y.', gewoon:b + ' eindigt niet op s, sh, ch, x, o of y.' }[cat];
    var st = [ vast('Het onderwerp ' + en(o.t) + ' is he, she of it. Waar eindigt ' + en(b) + ' op?', [S_EIND.es, S_EIND.ies, S_EIND.ky, S_EIND.gewoon], S_EIND[cat], eindHint),
      vast('Welke uitgang krijgt ' + en(b) + '?', ['-s', '-es', 'y wordt -ies'], S_UIT[cat], { es:'Na s, sh, ch, x en o schrijf je -es.', ies:'Medeklinker + y: haal de y weg en schrijf -ies.', ky:'Klinker + y: de y blijft, en er komt -s achter.', gewoon:'Bij de meeste werkwoorden komt er gewoon -s achter.' }[cat]),
      invul('Dus je schrijft', V.s, { es:'Je zet -es erachter: ', ies:'De y wordt -ies: ', ky:'De y blijft staan en je zet -s erachter: ', gewoon:'Je zet -s erachter: ' }[cat] + V.s + '.', { fout:fout }) ];
    return opg('Vul de present simple in. Let op de spelling.', z, st, function(n){
      var m = { o:{ k:1, label:'he/she/it' } };
      if (n >= 3) m.gat = { k:2, label:S_UIT[cat] };
      return zBeeld(z, m, n >= 3 ? V.s : null); });
  }
  var ING = { gewoon:'gewoon -ing erachter', e:'de e valt weg', dubbel:'de laatste medeklinker dubbel', ie:'ie wordt y' };
  function ingHint(V){
    var c = ingRegel(V), b = V.b;
    return { gewoon:b + ' eindigt niet op een e en niet op één klinker + één medeklinker: gewoon -ing.',
      e:b + ' eindigt op een e. Die valt weg: ' + V.ing + '.',
      dubbel:b + ' is kort en eindigt op één klinker + één medeklinker. De ' + b.slice(-1) + ' komt dubbel: ' + V.ing + '.',
      ie:b + ' eindigt op ie. Dat wordt y: ' + V.ing + '.' }[c];
  }
  function ingFout(V){
    var f = {}, b = V.b, c = ingRegel(V);
    if (c !== 'gewoon') f[b + 'ing'] = 'Let op de spelling: ' + ING[c] + '.';
    if (c === 'gewoon' && /e$/.test(b)) f[b.slice(0, -1) + 'ing'] = 'De e blijft hier staan.';
    if (c === 'dubbel') f[b + 'ing'] = 'De ' + b.slice(-1) + ' komt dubbel: ' + V.ing + '.';
    return f;
  }
  function opgPc(){
    var cat = kies(['gewoon', 'e', 'dubbel', 'dubbel', 'ie']);
    var F = raam(function(f){ return f.n && ingRegel(f.v) === cat; });
    var o = onderwerp(F), V = F.v, tijd = tijdPc(F, o), be = beNu(o), ant = be + ' ' + V.ing;
    var z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, F.x, tijd);
    var fout = {}; fout[V.ing] = 'Je mist nog ' + be + ' voor het werkwoord.'; fout[be + ' ' + V.b] = 'Het werkwoord krijgt -ing.';
    var st = [ vast('Welke vorm van to be hoort bij ' + en(o.t) + '?', ['am', 'is', 'are'], be, wie(o) + ' Bij I hoort am, bij he, she en it is, bij you, we en they are.'),
      vast('Hoe maak je de -ing-vorm van ' + en(V.b) + '?', [ING.gewoon, ING.e, ING.dubbel, ING.ie], ING[cat], ingHint(V)),
      invul('De -ing-vorm van ' + en(V.b) + ' is', V.ing, ingHint(V), { fout:ingFout(V) }),
      invul('Samen:', ant, be + ' + ' + V.ing + ' = ' + ant + '.', { fout:fout }) ];
    return opg('Vul de present continuous in.', z, st, function(n){
      var m = {}; if (n >= 1) m.o = { k:1, label:be }; if (tijd) m.sw = { k:3, label:'nu' };
      if (n >= 4) m.gat = { k:2, label:'am/is/are + -ing' };
      return zBeeld(z, m, n >= 4 ? ant : n >= 3 ? be + ' ' + V.ing : n >= 1 ? be + ' ...' : null); });
  }

  /* ================= A2 ================= */
  function opgDoDoes(){
    var F = raam(function(f){ return f.g && f.v.b !== 'have'; });
    var vraag = kans(.5), o = onderwerp(F, vraag ? function(x){ return x.p !== '1'; } : null), V = F.v, d = doe(o), tijd = F.s ? null : kans(.5) ? { t:'every day' } : null;
    if (tijd && !F.d) tijd = null;
    var z, ant;
    if (vraag){
      z = { delen:[{ t:'___', rol:'gat', ww:o.t + ' / ' + V.b }, { t:F.x, rol:'x' }].concat(tijd ? [{ t:tijd.t, rol:'sw' }] : []), slot:'?' };
      ant = cap(d) + ' ' + o.t + ' ' + V.b;
    } else {
      z = zinMet(o, { t:'___', rol:'gat', ww:'not / ' + V.b }, F.x, tijd);
      ant = [d + "n't " + V.b, d + ' not ' + V.b];
    }
    var fout = {}; fout[(vraag ? d + ' ' + o.t + ' ' + V.s : d + "n't " + V.s).toLowerCase()] = 'Na do of does komt het werkwoord zonder -s.';
    var st = [ vast('Hoort bij ' + en(o.t) + ' do of does?', ['do', 'does'], d, wie(o) + ' Bij he, she en it hoort does, bij de rest do.'),
      invul('Na do of does komt het hele werkwoord, zonder -s. ' + en(V.b) + ' wordt', V.b, 'De -s zit al in does. Het werkwoord blijft ' + V.b + '.', { fout:(function(){ var f = {}; f[V.s] = 'Geen -s: die zit al in does.'; return f; })() }),
      invul(vraag ? 'Maak de vraag: do of does, dan het onderwerp, dan het werkwoord.' : 'Maak de ontkenning: ' + d + ' + not + het werkwoord.', ant,
        vraag ? 'Begin met ' + cap(d) + ', dan ' + o.t + ', dan ' + V.b + ': ' + ant + '.' : d + ' + not wordt ' + d + "n't. Dan " + V.b + ': ' + [].concat(ant)[0] + '.', { fout:fout }) ];
    return opg(vraag ? 'Maak er een vraag van in de present simple.' : 'Maak de zin ontkennend in de present simple.', z, st, function(n){
      return zBeeld(z, n >= 1 && !vraag ? { o:{ k:1, label:d } } : {}, n >= 3 ? [].concat(ant)[0] : null); });
  }
  function opgPsPc(){
    var nu = kans(.5);
    var F = raam(function(f){ return f.g && f.n && !f.s; });
    var o = onderwerp(F), V = F.v, tijd = nu ? tijdPc(F, o) : tijdPs(F);
    var vorm = nu ? beNu(o) + ' ' + V.ing : is3(o) ? V.s : V.b;
    var z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, F.x, tijd);
    var PS = 'een gewoonte: present simple', PC = 'nu bezig: present continuous';
    var fout = {};
    if (nu){ fout[is3(o) ? V.s : V.b] = 'Het gebeurt nu: gebruik am, is of are + -ing.'; fout[V.ing] = 'Je mist nog ' + beNu(o) + '.'; }
    else { fout[beNu(o) + ' ' + V.ing] = 'Het is een gewoonte: gebruik de present simple, zonder -ing.'; if (is3(o)) fout[V.b] = 'Het onderwerp is he, she of it: zet er -s achter.'; }
    var st = [ keuze('Welk woord zegt iets over de tijd? Dat is het signaalwoord.', tijd.t, [o.t, F.x], 'Zoek een woord als ' + (nu ? 'now of Look!' : 'usually, often of every day') + '.'),
      vast('Wat zegt dat signaalwoord?', [PS, PC], nu ? PC : PS, nu ? tijd.t + ' zegt dat het nu bezig is.' : tijd.t + ' zegt dat het vaker gebeurt.'),
      invul('Dus ' + en(V.b) + ' wordt', vorm, nu ? 'Present continuous: ' + beNu(o) + ' + ' + V.ing + '.' : 'Present simple. ' + (is3(o) ? wie(o) + ' Dus met -s: ' + V.s + '.' : 'Zonder -s: ' + V.b + '.'), { fout:fout }) ];
    return opg('Present simple of present continuous? Vul de goede vorm in.', z, st, function(n){
      var m = {}; if (n >= 1) m.sw = { k:3, label:'signaalwoord' }; if (n >= 2) m.sw.label = nu ? 'nu' : 'gewoonte';
      if (n >= 3) m.gat = { k:2, label:nu ? 'present continuous' : 'present simple' };
      return zBeeld(z, m, n >= 3 ? vorm : null); });
  }
  var WAS_X = ['at home', 'in the garden', 'very tired', 'at the cinema', 'ill', 'at the beach', 'on holiday in Spain', 'at a party', 'in London'];
  function opgWasWere(){
    var o = onderwerp(null), x = kies(WAS_X), tijd = kies(['yesterday', 'last Saturday', 'last weekend', 'two days ago']), soort = kies(['bev', 'bev', 'ont', 'vraag']);
    if (soort === 'vraag' && o.p === '1') soort = 'bev';
    var vorm = beToen(o), z, ant, tekst;
    if (soort === 'vraag'){ z = { delen:[{ t:'___', rol:'gat', ww:'be' }, { t:o.t, rol:'o' }, { t:x, rol:'x' }, { t:tijd, rol:'sw' }], slot:'?' }; ant = cap(vorm); tekst = 'Het is een vraag: de vorm staat vooraan. Je schrijft'; }
    else if (soort === 'ont'){ z = zinMet(o, { t:'___', rol:'gat', ww:'be + not' }, x, { t:tijd }); ant = [vorm + "n't", vorm + ' not']; tekst = 'Met not erachter schrijf je'; }
    else { z = zinMet(o, { t:'___', rol:'gat', ww:'be' }, x, { t:tijd }); ant = vorm; tekst = 'Dus je schrijft'; }
    var fout = {}; fout[vorm === 'was' ? 'were' : 'was'] = vorm === 'was' ? 'Bij I, he, she en it hoort was.' : 'Bij you, we en they hoort were.';
    fout[beNu(o)] = 'Het is verleden tijd (' + tijd + '): was of were.';
    var rij = vorm === 'was' ? 'I, he, she, it' : 'you, we, they';
    var st = [ vast('Bij welk rijtje hoort ' + en(o.t) + '?', ['I, he, she, it', 'you, we, they'], rij, wie(o)),
      invul(tekst, ant, 'Bij ' + rij + ' hoort ' + vorm + '.' + (soort === 'ont' ? ' Met not: ' + vorm + "n't." : ''), { fout:fout }) ];
    return opg('Vul was of were in.', z, st, function(n){ return zBeeld(z, n >= 1 ? { o:{ k:1, label:rij }, sw:{ k:3, label:'verleden' } } : { sw:{ k:3, label:'verleden' } }, n >= 2 ? [].concat(ant)[0] : null); });
  }
  var ED = { gewoon:'gewoon -ed erachter', e:'eindigt op e: alleen -d', dubbel:'laatste medeklinker dubbel + -ed', y:'y wordt -ied' };
  function edHint(V){
    var b = V.b;
    return { gewoon:b + ' eindigt niet op e, niet op medeklinker + y en niet op één klinker + één medeklinker: gewoon -ed.',
      e:b + ' eindigt al op een e: je zet er alleen -d achter.',
      dubbel:b + ' is kort en eindigt op één klinker + één medeklinker: de ' + b.slice(-1) + ' komt dubbel.',
      y:b + ' eindigt op een medeklinker + y: de y wordt -ied.' }[edRegel(V)];
  }
  function opgPastRegel(){
    var cat = kies(['gewoon', 'e', 'dubbel', 'y']);
    var F = raam(function(f){ return f.e && regelmatig(f.v) && edRegel(f.v) === cat; });
    var o = onderwerp(F), V = F.v, tijd = tijdPast(F), b = V.b;
    var z = zinMet(o, { t:'___', rol:'gat', ww:b }, F.x, { t:tijd });
    var fout = {}; if (cat === 'y') fout[b + 'ed'] = 'Medeklinker + y: de y wordt -ied.';
    if (cat === 'e') fout[b + 'ed'] = 'Er staat al een e: alleen -d erachter.';
    if (cat === 'dubbel') fout[b + 'ed'] = 'De ' + b.slice(-1) + ' komt dubbel: ' + V.past + '.';
    if (cat === 'gewoon' && /[aeiou]y$/.test(b)) fout[b.slice(0, -1) + 'ied'] = 'Voor de y staat een klinker: de y blijft.';
    fout[b] = 'Het is verleden tijd: het werkwoord krijgt -ed.';
    if (V.s !== b) fout[V.s] = 'Dat is de present simple. Het is verleden tijd.';
    var st = [ keuze('Welk woord laat zien dat het in het verleden gebeurde?', tijd, [o.t, F.x], 'Zoek een tijdwoord zoals yesterday, ago of last.'),
      vast('Hoe schrijf je de past simple van ' + en(b) + '?', [ED.gewoon, ED.e, ED.dubbel, ED.y], ED[cat], edHint(V)),
      invul('Dus je schrijft', V.past, ED[cat] + ': ' + b + ' wordt ' + V.past + '.', { fout:fout }) ];
    return opg('Vul de past simple in.', z, st, function(n){
      var m = { }; if (n >= 1) m.sw = { k:3, label:'verleden' }; if (n >= 3) m.gat = { k:2, label:'-ed' };
      return zBeeld(z, m, n >= 3 ? V.past : null); });
  }
  function opgPastOnr(){
    var F = raam(function(f){ return f.e && !regelmatig(f.v) && f.v.past !== '-'; });
    var o = onderwerp(F), V = F.v, tijd = tijdPast(F), b = V.b;
    var z = zinMet(o, { t:'___', rol:'gat', ww:b }, F.x, { t:tijd });
    var fout = {}; fout[b + 'ed'] = b + ' is onregelmatig: geen -ed, maar ' + V.past + '.'; fout[b + 'd'] = b + ' is onregelmatig: geen -d, maar ' + V.past + '.';
    if (V.pp !== V.past) fout[V.pp] = 'Dat is de derde vorm. De past simple is de middelste: ' + V.past + '.';
    var st = [ keuze('Welk woord laat zien dat het in het verleden gebeurde?', tijd, [o.t, F.x], 'Zoek een tijdwoord zoals yesterday, ago of last.'),
      vast('Is ' + en(b) + ' regelmatig of onregelmatig?', ['regelmatig: -ed erachter', 'onregelmatig: kijk in het rijtje'], 'onregelmatig: kijk in het rijtje', b + ' staat in de lijst met onregelmatige werkwoorden: ' + b + ', ' + V.past + ', ' + V.pp + '.'),
      invul('Het rijtje is ' + en(b) + ', ___, ' + en(V.pp) + '. De middelste vorm is', V.past, 'Het rijtje is ' + b + ', ' + V.past + ', ' + V.pp + '. De middelste vorm is ' + V.past + '.', { fout:fout }) ];
    return opg('Vul de past simple in. Het werkwoord is onregelmatig.', z, st, function(n){
      var m = {}; if (n >= 1) m.sw = { k:3, label:'verleden' }; if (n >= 3) m.gat = { k:2, label:'2e vorm' };
      return zBeeld(z, m, n >= 3 ? V.past : null) + (n >= 2 ? R.teken.tabel([['hele werkwoord', 'past simple', 'voltooid deelwoord'], [b, n >= 3 ? V.past : '?', V.pp]], { kop:true, nadruk:[[1, 1]] }) : ''); });
  }
  function opgDid(){
    var F = raam(function(f){ return f.e && f.v.past !== '-'; });
    var vraag = kans(.5), o = onderwerp(F, vraag ? function(x){ return x.p !== '1'; } : null), V = F.v, tijd = tijdPast(F), z, ant;
    if (vraag){ z = { delen:[{ t:'___', rol:'gat', ww:o.t + ' / ' + V.b }, { t:F.x, rol:'x' }, { t:tijd, rol:'sw' }], slot:'?' }; ant = 'Did ' + o.t + ' ' + V.b; }
    else { z = zinMet(o, { t:'___', rol:'gat', ww:'not / ' + V.b }, F.x, { t:tijd }); ant = ["didn't " + V.b, 'did not ' + V.b]; }
    var fout = {}; fout[(vraag ? 'did ' + o.t + ' ' + V.past : "didn't " + V.past).toLowerCase()] = 'Na did komt het hele werkwoord. De verleden tijd zit al in did.';
    var f2 = {}; f2[V.past] = 'Na did komt het hele werkwoord: ' + V.b + '. De verleden tijd zit al in did.';
    var st = [ vast('Het is verleden tijd (' + en(tijd) + '). Welk hulpwerkwoord gebruik je?', ['do', 'does', 'did'], 'did', 'In de past simple maak je vragen en ontkenningen met did, voor iedereen.'),
      invul('Na did komt het hele werkwoord. ' + en(V.b) + ' wordt', V.b, 'Gebruik het werkwoord zoals in het woordenboek: ' + V.b + '.', { fout:f2 }),
      invul(vraag ? 'Maak de vraag: did, het onderwerp, het werkwoord.' : 'Maak de ontkenning: did + not + het werkwoord.', ant,
        vraag ? 'Did, dan ' + o.t + ', dan ' + V.b + ': ' + ant + '.' : "Did + not wordt didn't. Dan " + V.b + ': ' + [].concat(ant)[0] + '.', { fout:fout }) ];
    return opg(vraag ? 'Maak er een vraag van in de past simple.' : 'Maak de zin ontkennend in de past simple.', z, st, function(n){
      return zBeeld(z, { sw:{ k:3, label:'verleden' } }, n >= 3 ? [].concat(ant)[0] : null); });
  }

  /* woordvolgorde */
  var VOLG = [['play', 'football', 'in the park', 'every Saturday|after school|on Sundays'], ['play', 'tennis', 'at the sports club', 'every Sunday|on Wednesdays|twice a week'],
    ['eat', 'lunch', 'in the canteen', 'every day|on Mondays'], ['read', 'books', 'in the library', 'after school|every week'],
    ['buy', 'bread', 'at the market', 'every Saturday|on Fridays'], ['meet', 'friends', 'in town', 'on Saturdays|every weekend'],
    ['watch', 'films', 'at home', 'on Friday evenings|every weekend'], ['cook', 'dinner', 'in the kitchen', 'every evening|on Sundays'],
    ['speak', 'English', 'at school', 'every day|on Tuesdays'], ['practise', 'the piano', 'at home', 'every evening|after school'],
    ['do', 'homework', 'in the library', 'after school|on Mondays'], ['take', 'photos', 'in the park', 'in the spring|on Sundays']];
  function opgVolgorde(){
    var v = kies(VOLG), o = onderwerp({ w:'k' }), V = WW[v[0]], vorm = is3(o) ? V.s : V.b, ob = v[1], pl = v[2], tijd = kies(v[3].split('|'));
    var Ot = o.t === 'I' ? 'I' : o.t;
    var goed = cap(Ot) + ' ' + vorm + ' ' + ob + ' ' + pl + ' ' + tijd + '.';
    var fout = [cap(tijd) + ' ' + vorm + ' ' + Ot + ' ' + ob + ' ' + pl + '.', cap(Ot) + ' ' + vorm + ' ' + pl + ' ' + ob + ' ' + tijd + '.', cap(Ot) + ' ' + ob + ' ' + vorm + ' ' + pl + ' ' + tijd + '.'];
    var los = R.hussel([Ot, vorm, ob, pl, tijd]);
    var st = [ keuze('Wie doet het? Dat is het onderwerp: het komt vooraan.', Ot, [ob, tijd], 'Het onderwerp is wie het doet: een persoon of een groep mensen. Het is geen tijd en geen ding.'),
      keuze('Na het onderwerp komt het werkwoord ' + en(vorm) + '. Wat komt direct daarna?', ob, [pl, tijd], 'Na het werkwoord komt eerst wat er gedaan wordt (het voorwerp): ' + ob + '.'),
      vast('Wat komt aan het eind: eerst de plaats of eerst de tijd?', ['eerst de plaats: ' + pl, 'eerst de tijd: ' + tijd], 'eerst de plaats: ' + pl, 'Onthoud: wie, doet, wat, waar, wanneer. De plaats (' + pl + ') komt voor de tijd (' + tijd + ').'),
      keuze('Welke zin is goed?', goed, R.hussel(fout).slice(0, 2), 'Onderwerp, werkwoord, voorwerp, plaats, tijd: ' + goed) ];
    var vr = los.join(' / ');
    return eindKeuze({ context:'Zet de stukken in de goede volgorde.', vraag:vr, vraagHtml:'<span lang="en">' + S(vr) + '</span>', stappen:st, beeld:function(n){
      var d = [{ t:Ot, k:1, label:'wie' }, { t:vorm, k:2, label:'doet' }, { t:ob, k:3, label:'wat' }, { t:pl, k:4, label:'waar' }, { t:tijd + '.', k:5, label:'wanneer' }];
      var zien = n >= 4 ? 5 : n >= 3 ? 5 : n >= 2 ? 3 : n >= 1 ? 1 : 0;
      if (!zien) return '<div lang="en">' + R.teken.zin(los.map(function(t){ return { t:t, k:0 }; })) + '</div>';
      d[0].t = cap(d[0].t);
      return '<div lang="en">' + R.teken.zin(d.slice(0, zien).concat(zien < 5 ? ['...'] : [])) + '</div>'; } });
  }

  /* some/any en much/many: n zelfstandig naamwoord, u ontelbaar, plek, h past bij "we have" */
  var NW = [['milk', 1, 'in the fridge', 1], ['bread', 1, 'in the kitchen', 1], ['water', 1, 'in the bottle', 1], ['cheese', 1, 'in the fridge', 1],
    ['sugar', 1, 'in the cupboard', 1], ['juice', 1, 'in the fridge', 1], ['money', 1, 'in my wallet', 1], ['rice', 1, 'in the cupboard', 1],
    ['apples', 0, 'in the bowl', 1], ['eggs', 0, 'in the fridge', 1], ['books', 0, 'on the shelf', 1], ['chairs', 0, 'in the classroom', 0],
    ['biscuits', 0, 'in the tin', 1], ['tomatoes', 0, 'in the fridge', 1], ['people', 0, 'in the park', 0], ['cars', 0, 'in the street', 0]].map(function(x){
    return { n:x[0], u:!!x[1], plek:x[2], h:!!x[3] }; });
  function opgSomeAny(){
    var N = kies(NW), soort = kies(['bev', 'ont', 'vraag']), have = N.h && kans(.4), tpl;
    var is = N.u ? 'is' : 'are';
    if (have){ var w = kies(soort === 'vraag' ? ['we', 'you', 'they'] : ['we', 'I', 'they']); tpl = soort === 'bev' ? cap(w) + ' have ___ ' + N.n + '.' : soort === 'ont' ? cap(w) + " don't have ___ " + N.n + '.' : 'Do ' + w + ' have ___ ' + N.n + '?'; }
    else tpl = soort === 'bev' ? 'There ' + is + ' ___ ' + N.n + ' ' + N.plek + '.' : soort === 'ont' ? 'There ' + is + "n't ___ " + N.n + ' ' + N.plek + '.' : cap(is) + ' there ___ ' + N.n + ' ' + N.plek + '?';
    var z = zVan(tpl, 'some/any'), ant = soort === 'bev' ? 'some' : 'any';
    var SRT = { bev:'een bevestigende zin', ont:'een ontkennende zin (met not)', vraag:'een vraag' };
    var fout = {}; fout[ant === 'some' ? 'any' : 'some'] = ant === 'some' ? 'De zin is bevestigend: dan some.' : soort === 'ont' ? 'De zin is ontkennend: dan any.' : 'Het is een vraag: dan any.';
    var st = [ vast('Wat voor zin is het?', [SRT.bev, SRT.ont, SRT.vraag], SRT[soort], soort === 'vraag' ? 'De zin eindigt met een vraagteken.' : soort === 'ont' ? "Er staat n't (not) in de zin." : 'Er staat geen not in en geen vraagteken.'),
      invul('Dus je kiest', ant, 'Bevestigend: some. Ontkennend of een vraag: any.', { fout:fout }) ];
    return opg('Vul some of any in.', z, st, function(n){ return zBeeld(z, n >= 2 ? { gat:{ k:2, label:ant } } : {}, n >= 2 ? ant : null); });
  }
  function opgMuchMany(){
    var N = kies(NW), soort = kies(['hoe', 'hoe', 'er', 'have']), tpl;
    if (soort === 'have' && !N.h) soort = 'er';
    var is = N.u ? 'is' : 'are';
    if (soort === 'hoe') tpl = 'How ___ ' + N.n + ' ' + is + ' there ' + N.plek + '?';
    else if (soort === 'er') tpl = 'There ' + is + "n't ___ " + N.n + ' ' + N.plek + '.';
    else tpl = kans(.5) ? "We don't have ___ " + N.n + '.' : 'Do you have ___ ' + N.n + '?';
    var z = zVan(tpl, 'much/many'), ant = N.u ? 'much' : 'many';
    var tel = N.u ? 'nee: je kunt het niet tellen' : 'ja: je kunt ze tellen';
    var fout = {}; fout[N.u ? 'many' : 'much'] = N.u ? 'Je kunt ' + N.n + ' niet tellen: much.' : 'Je kunt ' + N.n + ' tellen: many.';
    var st = [ vast('Kun je ' + en(N.n) + ' tellen?', ['ja: je kunt ze tellen', 'nee: je kunt het niet tellen'], tel, N.u ? 'Kun je zeggen: three ' + N.n + 's? Nee, dat zeg je niet. Dan is het niet telbaar.' : 'Kun je zeggen: three ' + N.n + '? Ja. Dan is het telbaar.'),
      invul('Dus je kiest', ant, 'Telbaar (meervoud): many. Niet telbaar: much.', { fout:fout }) ];
    return opg('Vul much of many in.', z, st, function(n){ return zBeeld(z, n >= 2 ? { gat:{ k:2, label:N.u ? 'niet telbaar' : 'telbaar' } } : {}, n >= 2 ? ant : null); });
  }

  /* vergelijken: bijvoeglijk naamwoord, -er, -est, soort, zin met -er, zin met -est */
  var BN = [['tall', 'taller', 'tallest', 'kort', 'My brother is ___ than my dad.', 'Tom is the ___ boy in our class.'],
    ['old', 'older', 'oldest', 'kort', 'My grandma is ___ than my grandpa.', 'This is the ___ building in the town.'],
    ['young', 'younger', 'youngest', 'kort', 'Emma is ___ than her sister.', 'Sam is the ___ player in the team.'],
    ['fast', 'faster', 'fastest', 'kort', 'A cheetah is ___ than a horse.', 'The cheetah is the ___ land animal in the world.'],
    ['small', 'smaller', 'smallest', 'kort', 'A mouse is ___ than a cat.', 'This is the ___ room in the house.'],
    ['cheap', 'cheaper', 'cheapest', 'kort', 'The bus is ___ than the train.', 'This is the ___ phone in the shop.'],
    ['cold', 'colder', 'coldest', 'kort', 'January is ___ than May.', 'It was the ___ day of the year.'],
    ['strong', 'stronger', 'strongest', 'kort', 'My dad is ___ than me.', 'He is the ___ man in the village.'],
    ['nice', 'nicer', 'nicest', 'e', 'This café is ___ than that one.', 'She is the ___ teacher in the school.'],
    ['large', 'larger', 'largest', 'e', 'Our new house is ___ than our old one.', 'London is the ___ city in the UK.'],
    ['wide', 'wider', 'widest', 'e', 'This river is ___ than that one.', 'This is the ___ street in the town.'],
    ['big', 'bigger', 'biggest', 'dubbel', 'An elephant is ___ than a horse.', 'This is the ___ pizza on the menu.'],
    ['hot', 'hotter', 'hottest', 'dubbel', 'Today is ___ than yesterday.', 'July is usually the ___ month of the year.'],
    ['thin', 'thinner', 'thinnest', 'dubbel', 'This book is ___ than that one.', 'This is the ___ phone in the shop.'],
    ['sad', 'sadder', 'saddest', 'dubbel', 'The end of the film was ___ than the beginning.', 'It was the ___ day of my life.'],
    ['wet', 'wetter', 'wettest', 'dubbel', 'This summer was ___ than last summer.', 'November was the ___ month of the year.'],
    ['happy', 'happier', 'happiest', 'y', 'Emma looks ___ than yesterday.', 'It was the ___ day of my life.'],
    ['easy', 'easier', 'easiest', 'y', 'This test is ___ than the last one.', 'This is the ___ exercise in the book.'],
    ['busy', 'busier', 'busiest', 'y', 'The shops are ___ on Saturdays than on Mondays.', 'Saturday is the ___ day of the week.'],
    ['funny', 'funnier', 'funniest', 'y', 'This film is ___ than the first one.', 'Tom is the ___ boy in our class.'],
    ['heavy', 'heavier', 'heaviest', 'y', 'My bag is ___ than yours.', 'This is the ___ box in the room.'],
    ['dirty', 'dirtier', 'dirtiest', 'y', 'My shoes are ___ than yours.', 'This is the ___ room in the house.'],
    ['expensive', 'more expensive', 'most expensive', 'lang', 'A car is ___ than a bike.', 'This is the ___ hotel in the city.'],
    ['beautiful', 'more beautiful', 'most beautiful', 'lang', 'This park is ___ than the one near our school.', 'This is the ___ beach in Spain.'],
    ['difficult', 'more difficult', 'most difficult', 'lang', 'Maths is ___ than drawing for me.', 'This is the ___ question in the test.'],
    ['interesting', 'more interesting', 'most interesting', 'lang', 'This book is ___ than the film.', 'History is the ___ subject at school.'],
    ['dangerous', 'more dangerous', 'most dangerous', 'lang', 'A shark is ___ than a dolphin.', 'This is the ___ road in the area.'],
    ['comfortable', 'more comfortable', 'most comfortable', 'lang', 'This chair is ___ than that one.', 'This is the ___ bed in the shop.'],
    ['famous', 'more famous', 'most famous', 'lang', 'This singer is ___ than her brother.', 'He is the ___ footballer in the world.'],
    ['popular', 'more popular', 'most popular', 'lang', 'Football is ___ than hockey in England.', 'Football is the ___ sport in England.'],
    ['important', 'more important', 'most important', 'lang', 'Health is ___ than money.', 'This is the ___ day of the year.'],
    ['good', 'better', 'best', 'onr', 'This pizza is ___ than the last one.', 'She is the ___ player in the team.'],
    ['bad', 'worse', 'worst', 'onr', 'The weather is ___ today than yesterday.', 'It was the ___ film I have ever seen.']];
  var BN_SOORT = { kort:'kort: één lettergreep', e:'kort: één lettergreep', dubbel:'kort: één lettergreep', y:'twee lettergrepen, eindigt op -y', lang:'lang: twee of meer lettergrepen', onr:'onregelmatig: good of bad' };
  function opgVergelijk(sup){
    var cat = kies(['kort', 'e', 'dubbel', 'y', 'lang', 'lang', 'onr']), A = kies(BN.filter(function(a){ return a[3] === cat; }));
    var adj = A[0], vorm = sup ? A[2] : A[1], z = zVan(sup ? A[5] : A[4], adj);
    var uitg = sup ? '-est' : '-er', meer = sup ? 'most' : 'more';
    var SP = sup ? { kort:'niets: gewoon -est', e:'eindigt op e: alleen -st', dubbel:'laatste medeklinker dubbel', y:'y wordt i' } : { kort:'niets: gewoon -er', e:'eindigt op e: alleen -r', dubbel:'laatste medeklinker dubbel', y:'y wordt i' };
    var manier = cat === 'lang' ? meer + ' ervoor' : cat === 'onr' ? 'een eigen vorm' : uitg + ' erachter';
    var soortHint = { kort:adj + ' heeft één lettergreep.', e:adj + ' heeft één lettergreep.', dubbel:adj + ' heeft één lettergreep.', y:adj + ' heeft twee lettergrepen en eindigt op -y.', lang:adj + ' heeft twee of meer lettergrepen en eindigt niet op -y.', onr:adj + ' is onregelmatig.' }[cat];
    var st = [ vast('Wat voor woord is ' + en(adj) + '?', [BN_SOORT.kort, BN_SOORT.y, BN_SOORT.lang, BN_SOORT.onr], BN_SOORT[cat], soortHint),
      vast('Hoe maak je de ' + (sup ? 'overtreffende' : 'vergrotende') + ' trap?', [uitg + ' erachter', meer + ' ervoor', 'een eigen vorm'], manier,
        cat === 'lang' ? 'Lange woorden krijgen ' + meer + ' ervoor.' : cat === 'onr' ? adj + ' wordt ' + vorm + '. Die vorm moet je kennen.' : 'Korte woorden en woorden op -y krijgen ' + uitg + '.') ];
    var fout = {};
    if (cat === 'lang') fout[adj + (sup ? 'est' : 'er')] = adj + ' is een lang woord: ' + vorm + '.';
    if (cat !== 'lang' && cat !== 'onr') fout[meer + ' ' + adj] = adj + ' is kort: ' + uitg + ' erachter.';
    if (cat === 'onr'){ fout[adj + (sup ? 'est' : 'er')] = adj + ' is onregelmatig: ' + vorm + '.'; fout[meer + ' ' + adj] = adj + ' is onregelmatig: ' + vorm + '.'; }
    if (cat === 'dubbel') fout[adj + (sup ? 'est' : 'er')] = 'De ' + adj.slice(-1) + ' komt dubbel.';
    if (cat === 'y') fout[adj + (sup ? 'est' : 'er')] = 'De y wordt een i.';
    if (cat === 'e') fout[adj + (sup ? 'est' : 'er')] = 'Er staat al een e: ' + vorm + '.';
    if (cat !== 'lang' && cat !== 'onr'){
      st.push(vast('Let op de spelling. Wat gebeurt er met ' + en(adj) + '?', [SP.kort, SP.e, SP.dubbel, SP.y], SP[cat],
        { kort:'Er verandert niets: ' + vorm + '.', e:adj + ' eindigt op e: er komt alleen ' + (sup ? '-st' : '-r') + ' achter.', dubbel:adj + ' eindigt op één klinker + één medeklinker: de ' + adj.slice(-1) + ' komt dubbel.', y:adj + ' eindigt op medeklinker + y: de y wordt i.' }[cat]));
    }
    st.push(invul('Dus je schrijft', vorm, adj + ' wordt ' + vorm + '.', { fout:fout }));
    return opg(sup ? 'Vul de overtreffende trap in (the ... -est of the most ...).' : 'Vul de vergrotende trap in (-er of more).', z, st, function(n){
      return zBeeld(z, n >= st.length ? { gat:{ k:2, label:sup ? 'overtreffend' : 'vergrotend' } } : {}, n >= st.length ? vorm : null); });
  }

  /* bijvoeglijk naamwoord of bijwoord: bn, bw, zin met bn, waar het bij hoort, zin met bw, werkwoord */
  var BW = [['careful', 'carefully', 'My mum is a ___ driver.', 'driver', 'My mum drives very ___.', 'drives'],
    ['quick', 'quickly', 'Tom is a ___ learner.', 'learner', 'Tom learns ___.', 'learns'],
    ['slow', 'slowly', 'This is a ___ train.', 'train', 'The old man walks ___.', 'walks'],
    ['quiet', 'quietly', 'Emma has a ___ voice.', 'voice', 'Emma speaks very ___.', 'speaks'],
    ['loud', 'loudly', 'He has a ___ voice.', 'voice', 'He laughs ___.', 'laughs'],
    ['beautiful', 'beautifully', 'She is a ___ singer.', 'singer', 'She sings ___.', 'sings'],
    ['bad', 'badly', 'He is a ___ player.', 'player', 'He plays ___.', 'plays'],
    ['good', 'well', 'Emma is a ___ swimmer.', 'swimmer', 'Emma swims very ___.', 'swims'],
    ['easy', 'easily', 'It was an ___ test.', 'test', 'We won the match ___.', 'won'],
    ['happy', 'happily', 'They are a ___ family.', 'family', 'The children played ___ in the garden.', 'played'],
    ['angry', 'angrily', 'An ___ man shouted at us.', 'man', 'The man shouted ___.', 'shouted'],
    ['polite', 'politely', 'Sam is a ___ boy.', 'boy', 'Sam answered the question ___.', 'answered'],
    ['dangerous', 'dangerously', 'He is a ___ driver.', 'driver', 'He drives ___.', 'drives'],
    ['patient', 'patiently', 'She is a ___ teacher.', 'teacher', 'We waited ___ for the bus.', 'waited'],
    ['neat', 'neatly', 'Lucy has ___ handwriting.', 'handwriting', 'Lucy writes very ___.', 'writes'],
    ['heavy', 'heavily', 'There was ___ rain last night.', 'rain', 'It rained ___ last night.', 'rained'],
    ['nervous', 'nervously', 'She gave a ___ smile.', 'smile', 'She smiled ___.', 'smiled']];
  function opgBijwoord(){
    var A = kies(BW), bw = kans(.55), adj = A[0], woord = bw ? A[5] : A[3], z = zVan(bw ? A[4] : A[2], adj), vorm = bw ? A[1] : adj;
    var BIJ = ['een zelfstandig naamwoord: wie of wat is het?', 'een werkwoord: hoe doet iemand het?'];
    var SOORT = ['bijvoeglijk naamwoord: zonder -ly', 'bijwoord: meestal met -ly'];
    var spel = adj === 'good' ? 'onregelmatig: good wordt well' : /y$/.test(adj) ? 'y wordt i + -ly' : 'gewoon -ly erachter';
    var st = [ vast('Waar zegt ' + en(adj) + ' iets over? Het hoort bij ' + en(woord) + '.', BIJ, bw ? BIJ[1] : BIJ[0], bw ? woord + ' is een werkwoord. Het woord zegt hoe iemand het doet.' : woord + ' is een zelfstandig naamwoord. Het woord zegt hoe ' + woord + ' is.'),
      vast('Wat gebruik je dus?', SOORT, bw ? SOORT[1] : SOORT[0], 'Bij een zelfstandig naamwoord: bijvoeglijk naamwoord. Bij een werkwoord: bijwoord.') ];
    if (bw) st.push(vast('Hoe maak je het bijwoord van ' + en(adj) + '?', ['gewoon -ly erachter', 'y wordt i + -ly', 'onregelmatig: good wordt well'], spel,
      adj === 'good' ? 'Good is onregelmatig: het bijwoord is well.' : /y$/.test(adj) ? adj + ' eindigt op y: die wordt i, dan -ly.' : 'Bij ' + adj + ' zet je gewoon -ly erachter.'));
    var fout = {};
    if (bw){ fout[adj] = 'Het hoort bij het werkwoord ' + woord + ': je hebt het bijwoord nodig.'; if (adj === 'good') fout.goodly = 'Good is onregelmatig: well.'; if (/y$/.test(adj)) fout[adj + 'ly'] = 'De y wordt i: ' + vorm + '.'; }
    else fout[A[1]] = 'Het hoort bij ' + woord + ', een zelfstandig naamwoord: geen -ly.';
    st.push(invul('Dus je schrijft', vorm, bw ? 'Bijwoord: ' + vorm + '.' : 'Bijvoeglijk naamwoord: ' + adj + '.', { fout:fout }));
    return opg('Bijvoeglijk naamwoord of bijwoord? Vul de goede vorm in.', z, st, function(n){
      var d = z.delen.map(function(x){ return x; }), m = {};
      var h = zBeeld(z, n >= st.length ? { gat:{ k:2, label:bw ? 'bijwoord' : 'bijv. nw.' } } : {}, n >= st.length ? vorm : null);
      return h + (n >= 1 ? '<p class="lr-context" style="text-align:center">' + en(adj) + ' hoort bij ' + en(woord) + ' (' + (bw ? 'werkwoord' : 'zelfstandig naamwoord') + ')</p>' : ''); });
  }

  /* ================= B1 ================= */
  /* present perfect: werkwoord, rest, soort (s since/for, a already/yet, n never), w */
  var PPX = [['live', 'in London', 's'], ['work', 'in this shop', 's', 'v'], ['play', 'the guitar', 's'], ['have', 'a dog', 's'], ['study', 'French', 's'], ['live', 'in this house', 's'], ['play', 'in the school band', 's'],
    ['clean', 'the kitchen', 'a'], ['finish', 'the project', 'a'], ['eat', 'lunch', 'a'], ['do', 'the shopping', 'a'], ['buy', 'the tickets', 'a'],
    ['send', 'the message', 'a'], ['make', 'breakfast', 'a'], ['read', 'the book', 'a'], ['write', 'the email', 'a'], ['pay', 'the bill', 'a'],
    ['tidy', 'the kitchen', 'a'], ['ride', 'a horse', 'n'], ['eat', 'sushi', 'n'], ['see', 'a fox', 'n'], ['fly', 'in a plane', 'n'], ['visit', 'London', 'n'],
    ['swim', 'in the sea', 'n'], ['win', 'a match', 'n'], ['break', 'a bone', 'n'], ['meet', 'a famous person', 'n']].map(function(x){
    return { v:WW[x[0]], x:x[1], soort:x[2], w:x[3] || '', since:x[4] || ['since 2018', 'since last summer', 'since January', 'since 2020'], voor:x[5] || ['for three years', 'for six months', 'for a long time', 'for two years'] };
  });
  function ppHint(V){ return V.pp === V.past && regelmatig(V) ? V.b + ' is regelmatig: -ed erachter, dus ' + V.pp + '.' : V.b + ' is onregelmatig: neem de derde vorm uit het rijtje (' + V.b + ', ' + V.past + ', ' + V.pp + ').'; }
  /* een present perfect-zin: signaal (since, for, already, yet of never) en het antwoord */
  function ppZin(P, o, sig){
    var V = P.v, h = heeft(o), gat, ant, x = P.x, tijd = null;
    if (sig === 'never'){ gat = { t:'___', rol:'gat', ww:'never / ' + V.b }; ant = h + ' never ' + V.pp; }
    else if (sig === 'yet'){ gat = { t:'___', rol:'gat', ww:'not / ' + V.b }; ant = [h + "n't " + V.pp, h + ' not ' + V.pp]; tijd = { t:'yet' }; }
    else { gat = { t:'___', rol:'gat', ww:V.b }; ant = h + ' ' + V.pp; tijd = { t:sig }; }
    return { z:zinMet(o, gat, x, tijd), ant:ant };
  }
  function ppSignaal(P){ return P.soort === 's' ? kies(kans(.5) ? P.since : P.voor) : P.soort === 'a' ? kies(['already', 'yet']) : 'never'; }
  function opgPp(){
    var P = kies(PPX), o = onderwerp({ w:P.w }), V = P.v, h = heeft(o), sig = ppSignaal(P), r = ppZin(P, o, sig);
    var fout = {}; fout[V.pp] = 'Je mist nog ' + h + ' voor het voltooid deelwoord.';
    if (V.past !== V.pp) fout[[].concat(r.ant)[0].replace(V.pp, V.past)] = 'Na ' + h + ' komt het voltooid deelwoord (de derde vorm): ' + V.pp + '.';
    var f2 = {}; if (V.past !== V.pp) f2[V.past] = 'Dat is de past simple. Je hebt de derde vorm nodig: ' + V.pp + '.'; if (!regelmatig(V)) f2[V.b + 'ed'] = V.b + ' is onregelmatig: ' + V.pp + '.';
    var st = [ vast('Have of has? Het onderwerp is ' + en(o.t) + '.', ['have', 'has'], h, wie(o) + ' Bij he, she en it hoort has, bij de rest have.'),
      invul('Het voltooid deelwoord van ' + en(V.b) + ' is', V.pp, ppHint(V), { fout:f2 }),
      invul(sig === 'never' ? 'Samen, met never ertussen:' : sig === 'yet' ? "Samen, ontkennend met n't:" : 'Samen:', r.ant,
        sig === 'never' ? h + ' + never + ' + V.pp + '.' : sig === 'yet' ? h + "n't + " + V.pp + '.' : h + ' + ' + V.pp + '.', { fout:fout }) ];
    return opg('Vul de present perfect in.', r.z, st, function(n){
      var m = {}; if (n >= 1) m.o = { k:1, label:h }; if (r.z.delen.some(function(d){ return d.rol === 'sw'; })) m.sw = { k:3, label:'signaalwoord' };
      return zBeeld(r.z, m, n >= 3 ? [].concat(r.ant)[0] : n >= 2 ? h + ' ... ' + V.pp : n >= 1 ? h + ' ...' : null); });
  }
  function opgSinceFor(){
    var P = kies(PPX.filter(function(p){ return p.soort === 's'; })), o = onderwerp({ w:P.w }), V = P.v, since = kans(.5);
    var tijd = kies(since ? P.since : P.voor), rest = tijd.replace(/^(since|for) /, ''), woord = since ? 'since' : 'for';
    var z = { delen:[{ t:o.t, rol:'o' }, { t:heeft(o) + ' ' + V.pp + ' ' + P.x, rol:'x' }, { t:'___', rol:'gat' }, { t:rest, rol:'sw' }], slot:'.' };
    var KEUS = ['een beginpunt: vanaf wanneer?', 'een tijdsduur: hoe lang?'];
    var fout = {}; fout[since ? 'for' : 'since'] = since ? rest + ' is een beginpunt: since.' : rest + ' is een tijdsduur: for.';
    var st = [ vast('Wat staat er na het gat: ' + en(rest) + '. Is dat een beginpunt of een tijdsduur?', KEUS, since ? KEUS[0] : KEUS[1],
        since ? rest + ' is een moment: daar begon het. Vanaf ' + rest + '.' : rest + ' zegt hoe lang het al duurt.'),
      invul('Dus je kiest', woord, 'Beginpunt: since. Tijdsduur: for.', { fout:fout }) ];
    return opg('Vul since of for in.', z, st, function(n){ return zBeeld(z, n >= 1 ? { sw:{ k:3, label:since ? 'beginpunt' : 'tijdsduur' } } : {}, n >= 2 ? woord : null); });
  }
  function opgPastPp(){
    var P = kies(PPX), o = onderwerp({ w:P.w }), V = P.v, pp = kans(.5), z, ant, sig;
    if (pp){ sig = P.soort === 's' ? kies(P.since) : P.soort === 'a' ? kies(['already', 'yet']) : 'never'; var r = ppZin(P, o, sig); z = r.z; ant = r.ant; }
    else {
      sig = P.soort === 'a' ? kies(['yesterday', 'last Saturday', 'two days ago']) : P.soort === 'n' ? kies(['last summer', 'two years ago', 'in 2019']) : kies(['in 2019', 'last year', 'two years ago']);
      z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, P.x, { t:sig }); ant = V.past;
    }
    var signaal = sig === 'never' ? 'never' : sig;
    var KEUS = ['past simple: afgelopen, op een bekend moment', 'present perfect: tot nu toe, het moment is niet belangrijk'];
    var fout = {};
    if (pp) fout[V.past] = signaal + ' hoort bij de present perfect: ' + heeft(o) + ' + ' + V.pp + '.';
    else fout[heeft(o) + ' ' + V.pp] = signaal + ' noemt een moment in het verleden: past simple.';
    var st = [ keuze('Welk woord zegt iets over de tijd? Dat is het signaalwoord.', signaal, [o.t, P.x], pp ? 'Zoek een woord zoals already, yet, never of since.' : 'Zoek een woord zoals yesterday, last of ago, of een jaartal.'),
      vast('Welke tijd hoort bij dat signaalwoord?', KEUS, pp ? KEUS[1] : KEUS[0], pp ? signaal + ' is een signaalwoord van de present perfect.' : signaal + ' noemt een afgelopen moment: past simple.'),
      invul('Dus je schrijft', ant, pp ? 'Present perfect: ' + [].concat(ant)[0] + '.' : 'Past simple: ' + V.past + '.', { fout:fout }) ];
    return opg('Past simple of present perfect? Vul de goede vorm in.', z, st, function(n){
      var m = {}; if (n >= 1) m.sw = { k:3, label:'signaalwoord' }; if (n >= 2) m.sw.label = pp ? 'present perfect' : 'past simple';
      return zBeeld(z, sig === 'never' ? {} : m, n >= 3 ? [].concat(ant)[0] : null); });
  }
  function opgPastCont(){
    var F = raam(function(f){ return f.n; }), o = onderwerp(F), V = F.v, w = beToen(o), ant = w + ' ' + V.ing;
    var tijd = kies(['at this time yesterday', 'when it started to rain'].concat(F.x5 || F.w === 'v' ? [] : ["at four o'clock yesterday afternoon"]));
    var z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, F.x, { t:tijd });
    var fout = {}; fout[beNu(o) + ' ' + V.ing] = 'Het is verleden tijd: was of were.'; fout[V.past] = 'Het was op dat moment bezig: was of were + -ing.'; fout[(w === 'was' ? 'were' : 'was') + ' ' + V.ing] = 'Bij ' + o.t + ' hoort ' + w + '.';
    var st = [ vast('Was of were? Het onderwerp is ' + en(o.t) + '.', ['was', 'were'], w, wie(o) + ' Bij I, he, she en it hoort was, bij you, we en they were.'),
      invul('De -ing-vorm van ' + en(V.b) + ' is', V.ing, ingHint(V), { fout:ingFout(V) }),
      invul('Samen:', ant, w + ' + ' + V.ing + ' = ' + ant + '.', { fout:fout }) ];
    return opg('Vul de past continuous in: het was op dat moment bezig.', z, st, function(n){
      return zBeeld(z, n >= 1 ? { o:{ k:1, label:w }, sw:{ k:3, label:'toen bezig' } } : { sw:{ k:3, label:'toen bezig' } }, n >= 3 ? ant : null); });
  }
  function opgWill(){
    var F = raam(function(f){ return f.f && !ONGELUK.test(f.v.b); }), o = onderwerp(F), V = F.v;
    var tijd = tijdToek(F), voor = kies(['I think', "I'm sure", 'Maybe', '', '']), neg = !voor && kans(.5);
    var z = zinMet(o, { t:'___', rol:'gat', ww:(neg ? 'not / ' : '') + V.b }, F.x, { t:tijd });
    if (voor) z.delen.unshift({ t:voor, rol:'v' });
    var ant = neg ? ["won't " + V.b, 'will not ' + V.b] : 'will ' + V.b;
    var NA = ['het hele werkwoord', 'het werkwoord met -s', 'het werkwoord met -ing'];
    var fout = {}; fout['will ' + V.s] = 'Na will komt het hele werkwoord, ook bij he, she en it: geen -s.'; fout['will ' + V.ing] = 'Na will komt het hele werkwoord, zonder -ing.'; fout[V.b] = 'Je mist nog will.';
    if (neg) fout["willn't " + V.b] = "Will + not schrijf je kort als won't.";
    var st = [ keuze('Welk woord laat zien dat het in de toekomst gebeurt?', tijd, [o.t, F.x], 'Zoek een tijdwoord zoals tomorrow of next.'),
      vast('Wat komt er na will?', NA, NA[0], 'Na will komt altijd het hele werkwoord: will ' + V.b + '.'),
      invul(neg ? "Maak de ontkenning: won't + het werkwoord." : 'Dus je schrijft', ant, neg ? "Will + not = won't. Dan " + V.b + ': ' + [].concat(ant)[0] + '.' : 'Will + ' + V.b + ' = will ' + V.b + '.', { fout:fout }) ];
    return opg('Vul de toekomende tijd met will in.', z, st, function(n){ return zBeeld(z, n >= 1 ? { sw:{ k:3, label:'toekomst' } } : {}, n >= 3 ? [].concat(ant)[0] : null); });
  }
  function opgGoingTo(){
    var F = raam(function(f){ return f.f && !ONGELUK.test(f.v.b); }), o = onderwerp(F), V = F.v, tijd = tijdToek(F), be = beNu(o);
    var ant = be + ' going to ' + V.b, z = zinMet(o, { t:'___', rol:'gat', ww:V.b }, F.x, { t:tijd });
    var NA = ['het hele werkwoord', 'het werkwoord met -ing', 'het werkwoord met -s'];
    var fout = {}; fout['going to ' + V.b] = 'Je mist nog ' + be + ' voor going to.'; fout[be + ' going to ' + V.ing] = 'Na going to komt het hele werkwoord, zonder -ing.'; if (V.s !== V.b) fout[be + ' going to ' + V.s] = 'Na going to komt het hele werkwoord, zonder -s.';
    var st = [ vast('Am, is of are? Het onderwerp is ' + en(o.t) + '.', ['am', 'is', 'are'], be, wie(o)),
      vast('Wat komt er na going to?', NA, NA[0], 'Na going to komt het hele werkwoord: going to ' + V.b + '.'),
      invul('Dus je schrijft', ant, be + ' + going to + ' + V.b + ' = ' + ant + '.', { fout:fout }) ];
    return opg('Het is al gepland. Vul de vorm met <i lang="en">going to</i> in.', z, st, function(n){ return zBeeld(z, n >= 1 ? { o:{ k:1, label:be } } : {}, n >= 3 ? ant : null); });
  }
  var WG = [["We have booked a hotel. We ___ in Rome for a week.", 'stay', 'are going to stay', 'plan'],
    ["Tom has bought some paint. He ___ his bedroom this weekend.", 'paint', 'is going to paint', 'plan'],
    ["My sister has saved a lot of money. She ___ a new laptop.", 'buy', 'is going to buy', 'plan'],
    ["I have already decided. I ___ French next year.", 'study', 'am going to study', 'plan'],
    ["They have sent the invitations. They ___ a party on Saturday.", 'have', 'are going to have', 'plan'],
    ["Emma has packed her bags. She ___ to Spain tomorrow.", 'fly', 'is going to fly', 'plan'],
    ["Look at those dark clouds! It ___.", 'rain', 'is going to rain', 'bewijs'],
    ["Watch out! That glass ___ off the table.", 'fall', 'is going to fall', 'bewijs'],
    ["Look at the score! Our team ___ the match.", 'win', 'is going to win', 'bewijs'],
    ["The phone is ringing. Wait, I ___ it.", 'answer', 'will answer', 'nu'],
    ["Oh no, I have missed the bus! I ___ a taxi.", 'take', 'will take', 'nu'],
    ["Those bags look heavy. I ___ them for you.", 'carry', 'will carry', 'aanbod'],
    ["You look cold. I ___ the window.", 'close', 'will close', 'aanbod'],
    ["Don't worry. I ___ you with your homework.", 'help', 'will help', 'aanbod'],
    ["I promise I ___ you tonight.", 'call', 'will call', 'aanbod'],
    ["Thanks for the money. I ___ it back next week, I promise.", 'pay', 'will pay', 'aanbod']];
  var WG_SOORT = { plan:'een plan dat al vaststaat', bewijs:'je ziet het nu al aankomen', nu:'een besluit van dit moment', aanbod:'een aanbod of een belofte' };
  function opgWillGoing(){
    var W = kies(WG), z = zVan(W[0], W[1]), going = W[3] === 'plan' || W[3] === 'bewijs';
    var hint = { plan:'De eerste zin laat zien dat het al besloten is.', bewijs:'Je ziet nu al dat het gaat gebeuren.', nu:'Je besluit het nu, op dit moment.', aanbod:'Je biedt iets aan of je belooft iets.' }[W[3]];
    var fout = {}; if (going) fout['will ' + W[1]] = 'Het is al gepland of je ziet het aankomen: going to.'; else fout[W[2].replace('will', 'am going to')] = 'Het is een besluit van nu, een aanbod of een belofte: will.';
    var st = [ vast('Wat voor situatie is het?', [WG_SOORT.plan, WG_SOORT.bewijs, WG_SOORT.nu, WG_SOORT.aanbod], WG_SOORT[W[3]], hint),
      vast('Kies je will of going to?', ['will', 'going to'], going ? 'going to' : 'will', 'Plan of bewijs: going to. Besluit van nu, aanbod of belofte: will.'),
      invul('Dus je schrijft', W[2], going ? 'Am, is of are + going to + het hele werkwoord: ' + W[2] + '.' : 'Will + het hele werkwoord: ' + W[2] + '.', { fout:fout }) ];
    return opg('Will of going to? Vul de goede vorm in.', z, st, function(n){ return zBeeld(z, n >= 3 ? { gat:{ k:2, label:going ? 'going to' : 'will' } } : {}, n >= 3 ? W[2] : null); });
  }

  /* if-zinnen: if-onderwerp, werkwoord, rest, ander onderwerp, werkwoord, rest */
  var IF = [['it', 'rain', '', 'we', 'stay', 'at home'], ['I', 'have', 'time', 'I', 'help', 'you'], ['you', 'study', 'hard', 'you', 'pass', 'the test'],
    ['we', 'leave', 'early', 'we', 'catch', 'the train'], ['Tom', 'miss', 'the bus', 'he', 'arrive', 'late'], ['she', 'save', 'her money', 'she', 'buy', 'a new bike'],
    ['they', 'win', 'the match', 'they', 'play', 'in the final'], ['you', 'eat', 'all that cake', 'you', 'feel', 'ill'], ['I', 'find', 'your keys', 'I', 'call', 'you'],
    ['it', 'snow', '', 'the children', 'build', 'a snowman'], ['Emma', 'practise', 'every day', 'she', 'play', 'in the concert'],
    ['we', 'take', 'a taxi', 'we', 'get', 'there faster'], ['you', 'ask', 'the teacher', 'she', 'explain', 'it again'], ['he', 'forget', 'his homework', 'he', 'get', 'a detention'],
    ['they', 'invite', 'us', 'we', 'come', 'to the party'], ['I', 'get', 'up early', 'I', 'go', 'for a run'], ['my parents', 'buy', 'a dog', 'I', 'walk', 'it every day'],
    ['you', 'water', 'the plants', 'they', 'grow', 'faster']];
  var DERDE = /^(he|she|it|Tom|Emma)$/;
  function opgIf(type){
    var I = kies(IF), Vi = WW[I[1]], Vm = WW[I[4]], gatIf = kans(.5);
    var ifV = type === 1 ? (DERDE.test(I[0]) ? Vi.s : Vi.b) : type === 2 ? Vi.past : 'had ' + Vi.pp;
    var mV = type === 1 ? 'will ' + Vm.b : type === 2 ? 'would ' + Vm.b : 'would have ' + Vm.pp;
    var VORM = { 1:['present simple', 'will + hele werkwoord'], 2:['past simple', 'would + hele werkwoord'], 3:['had + voltooid deelwoord', 'would have + voltooid deelwoord'] }[type];
    var d = [{ t:'If', rol:'if' }, { t:I[0], rol:'o1' }];
    if (gatIf) d.push({ t:'___', rol:'gat', ww:I[1] }); else d.push({ t:ifV, rol:'w1' });
    if (I[2]) d.push({ t:I[2], rol:'r1' });
    /* de komma komt achter het laatste stuk van het if-deel */
    d[d.length - 1].na = ',';
    d.push({ t:I[3], rol:'o2' });
    if (!gatIf) d.push({ t:'___', rol:'gat', ww:I[4] }); else d.push({ t:mV, rol:'w2' });
    d.push({ t:I[5], rol:'r2' });
    var z = { delen:d, slot:'.' };
    var ant = gatIf ? ifV : mV, V = gatIf ? Vi : Vm;
    var DEEL = ['in het if-deel', 'in het andere deel'];
    var hint3 = gatIf ? (type === 1 ? (DERDE.test(I[0]) ? 'Present simple. Het onderwerp ' + I[0] + ' is he, she of it: met -s. ' + ifV : 'Present simple: ' + ifV) + '.' : type === 2 ? 'Past simple van ' + V.b + ': ' + ifV + '.' : 'Had + voltooid deelwoord van ' + V.b + ': ' + ifV + '.')
      : (type === 1 ? 'Will + ' + V.b + ' = ' + mV + '.' : type === 2 ? 'Would + ' + V.b + ' = ' + mV + '.' : 'Would have + ' + V.pp + ' = ' + mV + '.');
    var fout = {};
    if (gatIf && type === 1) fout['will ' + V.b] = 'Na if komt nooit will. In het if-deel staat de present simple.';
    if (gatIf && type === 2) fout['would ' + V.b] = 'Na if komt geen would. In het if-deel staat de past simple.';
    if (gatIf && type === 3) fout['would have ' + V.pp] = 'Na if komt geen would. In het if-deel staat had + voltooid deelwoord.';
    if (!gatIf && type === 3) fout['would ' + V.pp] = 'Het is would have + voltooid deelwoord.';
    var st = [ vast('Staat het gat in het if-deel of in het andere deel?', DEEL, gatIf ? DEEL[0] : DEEL[1], gatIf ? 'Het gat staat direct na if ' + I[0] + '.' : 'Het gat staat in het deel zonder if.'),
      vast('Welke vorm hoort daar bij type ' + type + '?', VORM, gatIf ? VORM[0] : VORM[1], 'Type ' + type + ': if + ' + VORM[0] + ', en in het andere deel ' + VORM[1] + '.'),
      invul('Dus ' + en(V.b) + ' wordt', ant, hint3, { fout:fout }) ];
    return opg('Vul de goede vorm in (if-zin type ' + type + ').', z, st, function(n){
      /* het if-deel en het andere deel elk als een blok, met de vorm die erbij hoort */
      var gat = n >= 3 ? ant : '___';
      var deel1 = 'If ' + I[0] + ' ' + (gatIf ? gat : ifV) + (I[2] ? ' ' + I[2] : '') + ',';
      var deel2 = I[3] + ' ' + (gatIf ? mV : gat) + ' ' + I[5] + '.';
      return '<div lang="en">' + R.teken.zin([{ t:deel1, k:4, label:n >= 2 ? 'if-deel: ' + VORM[0] : 'if-deel' }, { t:deel2, k:2, label:n >= 2 ? 'ander deel: ' + VORM[1] : 'ander deel' }]) + '</div>'; });
  }

  /* passief: wie het doet, enkelvoud, werkwoord, wat (nieuw onderwerp), enkelvoud, tijd, rest; eigennaam blijft met hoofdletter */
  var PAS = [['Shakespeare', 1, 'write', 'Hamlet', 1, 'past', ''], ['the postman', 1, 'deliver', 'the letters', 0, 'present', 'every morning'],
    ['a famous architect', 1, 'design', 'this building', 1, 'past', ''], ['millions of people', 0, 'watch', 'the final', 1, 'past', ''],
    ['the police', 0, 'arrest', 'two men', 0, 'past', ''], ['our teacher', 1, 'check', 'the tests', 0, 'perfect', ''],
    ['the cleaner', 1, 'clean', 'the classrooms', 0, 'present', 'every evening'], ['a dog', 1, 'bite', 'the postman', 1, 'past', ''],
    ['the mayor', 1, 'open', 'the new library', 1, 'future', 'next week'], ['thousands of tourists', 0, 'visit', 'the museum', 1, 'present', 'every year'],
    ['the students', 0, 'paint', 'these pictures', 0, 'past', ''], ['my grandfather', 1, 'build', 'this house', 1, 'past', 'in 1950'],
    ['the chef', 1, 'prepare', 'the meals', 0, 'present', 'every day'], ['the head teacher', 1, 'send', 'the letters', 0, 'future', 'tomorrow'],
    ['lots of people', 0, 'use', 'this app', 1, 'present', ''], ['a robot', 1, 'make', 'these cars', 0, 'present', ''],
    ['the students', 0, 'plant', 'the trees', 0, 'perfect', ''], ['the firefighters', 0, 'rescue', 'the cat', 1, 'past', ''],
    ['the government', 1, 'build', 'a new hospital', 1, 'future', 'next year'], ['over a million people', 0, 'read', 'this book', 1, 'perfect', '']];
  var TIJD_NAAM = { present:'present simple', past:'past simple', perfect:'present perfect', future:'will (toekomst)' };
  function opgPassief(){
    var P = kies(PAS), V = WW[P[2]], wie_ = P[0], ev = !!P[1], obj = P[3], oev = !!P[4], tijd = P[5], rest = P[6];
    var act = tijd === 'present' ? (ev ? V.s : V.b) : tijd === 'past' ? V.past : tijd === 'perfect' ? (ev ? 'has ' : 'have ') + V.pp : 'will ' + V.b;
    var be = tijd === 'present' ? (oev ? 'is' : 'are') : tijd === 'past' ? (oev ? 'was' : 'were') : tijd === 'perfect' ? (oev ? 'has been' : 'have been') : 'will be';
    var ant = be + ' ' + V.pp;
    var actief = cap(wie_) + ' ' + act + ' ' + obj + (rest ? ' ' + rest : '') + '.';
    var z = { delen:[{ t:obj, rol:'o' }, { t:'___', rol:'gat' }, { t:'by ' + wie_ + (rest ? ' ' + rest : ''), rol:'by' }], slot:'.' };
    var BE_H = { present:'In de present simple is to be: is of are.', past:'In de past simple is to be: was of were.', perfect:'In de present perfect is to be: has been of have been.', future:'Bij will is to be: will be.' }[tijd];
    var fout = {}; fout[V.pp] = 'Je mist nog de vorm van to be: ' + be + '.'; if (V.past !== V.pp) fout[be + ' ' + V.past] = 'Na to be komt het voltooid deelwoord: ' + V.pp + '.';
    var st = [ vast('In welke tijd staat de actieve zin?', [TIJD_NAAM.present, TIJD_NAAM.past, TIJD_NAAM.perfect, TIJD_NAAM.future], TIJD_NAAM[tijd], 'Kijk naar het werkwoord: ' + act + '.'),
      invul('Het nieuwe onderwerp is ' + en(obj) + '. De vorm van to be in die tijd is', be, BE_H + ' ' + cap(obj) + (oev ? ' is enkelvoud.' : ' is meervoud.')),
      invul('Het voltooid deelwoord van ' + en(V.b) + ' is', V.pp, ppHint(V)),
      invul('Samen:', ant, be + ' + ' + V.pp + ' = ' + ant + '.', { fout:fout }) ];
    var v = actief;
    return { context:'Maak de zin passief: <span lang="en">' + S(zTekst(z)) + '</span>', vraag:v, vraagHtml:'<span lang="en">' + S(v) + '</span>', stappen:st, beeld:function(n){
      var m = { o:{ k:1, label:'nieuw onderwerp' } }; if (n >= 4) m.gat = { k:2, label:'to be + volt. deelw.' };
      return zBeeld(z, m, n >= 4 ? ant : n >= 3 ? be + ' ' + V.pp : n >= 2 ? be + ' ...' : null); } };
  }

  /* who, which, whose: zin, waar het op slaat, soort */
  var WIE = [['The girl ___ lives next door is my best friend.', 'the girl', 'p'], ['The man ___ fixed our car was very friendly.', 'the man', 'p'],
    ['I have a friend ___ speaks three languages.', 'a friend', 'p'], ['The woman ___ works in the bakery is my aunt.', 'the woman', 'p'],
    ['The boy ___ won the race is only twelve.', 'the boy', 'p'], ['Do you know the people ___ live in that house?', 'the people', 'p'],
    ['The teacher ___ helped me was very patient.', 'the teacher', 'p'], ['The book ___ I am reading is very exciting.', 'the book', 'd'],
    ['This is the bike ___ I got for my birthday.', 'the bike', 'd'], ['The cake ___ she made was delicious.', 'the cake', 'd'],
    ['I lost the phone ___ my parents gave me.', 'the phone', 'd'], ['The film ___ we saw last night was boring.', 'the film', 'd'],
    ['We have a cat ___ sleeps all day.', 'a cat', 'd'], ['The bus ___ goes to the station leaves at ten.', 'the bus', 'd'],
    ['That is the boy ___ bike was stolen.', 'bike', 'b'], ['I know a girl ___ father is a pilot.', 'father', 'b'],
    ['The man ___ car broke down called a taxi.', 'car', 'b'], ['This is the woman ___ dog bit my brother.', 'dog', 'b'],
    ['We met a family ___ house is near the beach.', 'house', 'b'], ['She is the singer ___ songs are always on the radio.', 'songs', 'b']];
  function opgWho(){
    var W = kies(WIE), z = zVan(W[0], 'who/which/whose'), s = W[2];
    var SRT = { p:'een persoon', d:'een ding of dier', b:'van wie iets is (bezit)' };
    var ant = s === 'p' ? ['who', 'that'] : s === 'd' ? ['which', 'that'] : 'whose';
    var hint = s === 'b' ? 'Na het gat staat ' + W[1] + ': van wie is dat? Het gaat om bezit.' : 'Het woord voor het gat is ' + W[1] + '. Is dat een persoon of een ding of dier?';
    var fout = {};
    if (s === 'p') fout.which = W[1] + ' is een persoon: who.';
    if (s === 'd') fout.who = W[1] + ' is een ding of dier: which.';
    if (s === 'b'){ fout.who = 'Het gaat om bezit: van wie is de ' + W[1] + '? Dan whose.'; fout.which = 'Het gaat om bezit: whose.'; }
    if (s !== 'b') fout.whose = 'Whose gebruik je alleen bij bezit (van wie).';
    var st = [ vast('Waar gaat het om?', [SRT.p, SRT.d, SRT.b], SRT[s], hint),
      invul('Dus je kiest', ant, 'Persoon: who. Ding of dier: which. Bezit: whose.' + (s === 'b' ? '' : ' (That mag hier ook.)'), { fout:fout }) ];
    return opg('Vul in: who, which of whose.', z, st, function(n){ return zBeeld(z, n >= 2 ? { gat:{ k:2, label:SRT[s] } } : {}, n >= 2 ? [].concat(ant)[0] : null); });
  }

  /* ================= B2 ================= */
  /* indirecte rede: zin, directe rede, raamwerk, antwoord, tijd */
  var REP = [['Tom said,', 'I live in Leeds.', 'Tom said that he ___ in Leeds.', 'lived', 'ps', 'live'],
    ['Emma said,', 'I like horror films.', 'Emma said that she ___ horror films.', 'liked', 'ps', 'like'],
    ['My dad said,', 'I work in a hospital.', 'My dad said that he ___ in a hospital.', 'worked', 'ps', 'work'],
    ['The children said,', 'We play football every day.', 'The children said that they ___ football every day.', 'played', 'ps', 'play'],
    ['Lucy said,', 'I am tired.', 'Lucy said that she ___ tired.', 'was', 'ps', 'am'],
    ['Sam said,', 'My brother is ill.', 'Sam said that his brother ___ ill.', 'was', 'ps', 'is'],
    ['They said,', 'We are hungry.', 'They said that they ___ hungry.', 'were', 'ps', 'are'],
    ['Mum said,', 'I am cooking dinner.', 'Mum said that she ___ dinner.', 'was cooking', 'pc', 'am cooking'],
    ['Tom said,', 'I am reading a book.', 'Tom said that he ___ a book.', 'was reading', 'pc', 'am reading'],
    ['The boys said,', 'We are watching a match.', 'The boys said that they ___ a match.', 'were watching', 'pc', 'are watching'],
    ['Emma said,', 'I will help you.', 'Emma said that she ___ me.', 'would help', 'will', 'will help'],
    ['My parents said,', 'We will buy a new car.', 'My parents said that they ___ a new car.', 'would buy', 'will', 'will buy'],
    ['Mr Brown said,', 'I will call you.', 'Mr Brown said that he ___ me.', 'would call', 'will', 'will call'],
    ['Lucy said,', 'I can play the piano.', 'Lucy said that she ___ the piano.', 'could play', 'can', 'can play'],
    ['Sam said,', 'I can swim very fast.', 'Sam said that he ___ very fast.', 'could swim', 'can', 'can swim'],
    ['Tom said,', 'I have lost my keys.', 'Tom said that he ___ his keys.', 'had lost', 'pp', 'have lost'],
    ['Emma said,', 'I have finished my homework.', 'Emma said that she ___ her homework.', 'had finished', 'pp', 'have finished']];
  var REP_T = { ps:['present simple', 'past simple'], pc:['present continuous', 'past continuous'], will:['will', 'would'], can:['can', 'could'], pp:['present perfect', 'past perfect'] };
  function opgReported(){
    var P = kies(REP), T = REP_T[P[4]], z = zVan(P[2], P[5]);
    var dir = P[0] + ' "' + P[1] + '"';
    var fout = {}; fout[P[5]] = 'Zet de tijd een stap terug: ' + T[0] + ' wordt ' + T[1] + '.';
    var st = [ vast('In welke tijd staat het werkwoord ' + en(P[5]) + '?', ['present simple', 'present continuous', 'will', 'can', 'present perfect'], T[0], { ps:'Het is de present simple.', pc:'Am, is of are + -ing: de present continuous.', will:'Er staat will.', can:'Er staat can.', pp:'Have of has + voltooid deelwoord: de present perfect.' }[P[4]]),
      vast('Zet de tijd een stap terug. Wat wordt het?', ['past simple', 'past continuous', 'would', 'could', 'past perfect'], T[1], T[0] + ' wordt ' + T[1] + '.'),
      invul('Dus ' + en(P[5]) + ' wordt', P[3], T[0] + ' wordt ' + T[1] + ': ' + P[3] + '.', { fout:fout }) ];
    return { context:'Maak er indirecte rede van: <span lang="en">' + S(zTekst(z)) + '</span>', vraag:dir, vraagHtml:'<span lang="en">' + S(dir) + '</span>', stappen:st, beeld:function(n){
      return zBeeld(z, n >= 3 ? { gat:{ k:2, label:T[1] } } : {}, n >= 3 ? P[3] : null); } };
  }

  /* question tags */
  var TAG_O = [{ t:'Tom', pr:'he', p:'3' }, { t:'Emma', pr:'she', p:'3' }, { t:'your parents', pr:'they', p:'mv' }, { t:'you', pr:'you', p:'2' },
    { t:'your sister', pr:'she', p:'3' }, { t:'Mr Brown', pr:'he', p:'3' }, { t:'the children', pr:'they', p:'mv' }];
  var TAG = { be:['tired', 'from London', 'at home', 'good at maths', 'very busy'], was:['at the party', 'ill yesterday', 'late this morning'],
    ps:[['play', 'the piano'], ['like', 'pizza'], ['live', 'near the school'], ['speak', 'French']],
    past:[['go', 'to the cinema yesterday'], ['see', 'the match last night'], ['finish', 'the project'], ['win', 'the game']],
    can:['swim', 'speak Spanish', 'play chess'], will:['come to the party', 'help us', 'be at home tonight'],
    pp:[['finish', 'the project'], ['see', 'this film'], ['lose', 'the keys']] };
  function opgTag(){
    var o = kies(TAG_O), soort = kies(['be', 'was', 'ps', 'past', 'can', 'will', 'pp']), neg = kans(.4), x, aux, zin;
    var drie = o.p === '3';
    if (soort === 'be'){ x = kies(TAG.be); aux = drie ? 'is' : 'are'; zin = aux + (neg ? "n't " : ' ') + x; }
    else if (soort === 'was'){ x = kies(TAG.was); aux = drie ? 'was' : 'were'; zin = aux + (neg ? "n't " : ' ') + x; }
    else if (soort === 'ps'){ x = kies(TAG.ps); var V = WW[x[0]]; aux = drie ? 'does' : 'do'; zin = (neg ? aux + "n't " + V.b : drie ? V.s : V.b) + ' ' + x[1]; }
    else if (soort === 'past'){ x = kies(TAG.past); V = WW[x[0]]; aux = 'did'; zin = (neg ? "didn't " + V.b : V.past) + ' ' + x[1]; }
    else if (soort === 'can'){ x = kies(TAG.can); aux = 'can'; zin = (neg ? "can't " : 'can ') + x; }
    else if (soort === 'will'){ x = kies(TAG.will); aux = 'will'; zin = (neg ? "won't " : 'will ') + x; }
    else { x = kies(TAG.pp); V = WW[x[0]]; aux = drie ? 'has' : 'have'; zin = aux + (neg ? "n't " : ' ') + V.pp + ' ' + x[1]; }
    var kort = { will:"won't", can:"can't" }[aux] || aux + "n't";
    var tag = (neg ? aux : kort) + ' ' + o.pr;
    var tekst = cap(o.t) + ' ' + zin + ', ___?';
    var z = zVan(tekst, '');
    var ANDER = ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'will', 'has', 'have'].filter(function(a){ return a !== aux; });
    var auxHint = soort === 'ps' || soort === 'past' ? (neg ? 'In de zin staat ' + aux + "n't." : 'Er staat geen hulpwerkwoord in de zin. Dan gebruik je ' + (soort === 'past' ? 'did (verleden tijd).' : aux + ' (present simple, ' + o.t + ').')) : 'Het hulpwerkwoord staat direct na ' + o.t + ': ' + aux + '.';
    var BO = ['bevestigend: de tag wordt ontkennend', 'ontkennend: de tag wordt bevestigend'];
    var fout = {}; fout[(neg ? kort : aux) + ' ' + o.pr] = neg ? 'De zin is ontkennend: de tag wordt bevestigend.' : 'De zin is bevestigend: de tag wordt ontkennend.';
    if (o.t !== o.pr) fout[(neg ? aux : kort) + ' ' + o.t.toLowerCase()] = 'In de tag komt een voornaamwoord: ' + o.pr + '.';
    var st = [ keuze('Welk hulpwerkwoord hoort bij deze zin?', aux, R.hussel(ANDER).slice(0, 2), auxHint),
      vast('Is de zin bevestigend of ontkennend?', BO, neg ? BO[1] : BO[0], neg ? "Er staat n't (not) in de zin." : 'Er staat geen not in de zin.'),
      invul('Welk voornaamwoord hoort bij ' + en(o.t) + '?', o.pr, o.t === o.pr ? 'Het onderwerp is al een voornaamwoord: ' + o.pr + '.' : o.t + ' vervang je door ' + o.pr + '.'),
      invul('De tag is', [tag, tag + '?'], (neg ? aux : kort) + ' + ' + o.pr + ' = ' + tag + '.', { fout:fout }) ];
    return opg('Maak de question tag af.', z, st, function(n){ return zBeeld(z, n >= 4 ? { gat:{ k:2, label:'tag' } } : {}, n >= 4 ? tag : null); });
  }

  /* ================= de doelen ================= */
  function E(t){ return '<i lang="en">' + t + '</i>'; }
  LEERROUTE.voeg('engels', [
    { groep:{ id:'en-a1-ww', niveau:'A1', domein:'grammatica', naam:'De eerste werkwoorden', uit:'To be, have got en de present simple en continuous: met deze vier maak je je eerste Engelse zinnen. Bij elk werkwoord kijk je eerst naar het onderwerp.' },
      doelen:[
        { id:'en-to-be', naam:'To be: am, is, are', kort:'Kijk naar het onderwerp: I am, he/she/it is, you/we/they are',
          uit:'<p><b>To be</b> betekent zijn. Het heeft drie vormen: <b>am</b>, <b>is</b> en <b>are</b>.</p><p>Welke je kiest, hangt af van het <b>onderwerp</b>: ' + E('I am') + ', ' + E('he/she/it is') + ', ' + E('you/we/they are') + '. Een naam is he of she: ' + E('Tom is') + '. Twee mensen samen zijn they: ' + E('my parents are') + '.</p><p>Ontkennen doe je met <b>not</b>: ' + E("she isn't") + '. In een vraag staat de vorm vooraan: ' + E('Are you hungry?') + '</p>',
          wanneer:'je wilt zeggen hoe iemand is, waar iemand is of hoe oud iemand is.', maak:opgBe },
        { id:'en-have-got', naam:'Have got en has got', kort:'Bij he, she en it: has got. Bij I, you, we en they: have got',
          uit:'<p>Met <b>have got</b> zeg je wat iemand heeft: ' + E('I have got a dog.') + '</p><p>Bij <b>he, she en it</b> wordt het <b>has got</b>: ' + E('Emma has got a cat.') + ' Bij I, you, we en they blijft het have got.</p><p>Ontkennen: ' + E("haven't got") + ' of ' + E("hasn't got") + '. Een vraag begint met have of has: ' + E('Have you got a pet?') + '</p>',
          wanneer:'je wilt vertellen wat iemand heeft.', maak:opgHaveGot },
        { id:'en-ps-s', naam:'Present simple: he, she, it + s', kort:'Is het onderwerp he, she of it, dan komt er een -s achter het werkwoord',
          uit:'<p>De <b>present simple</b> gebruik je voor dingen die vaak of altijd gebeuren: ' + E('I play football every Saturday.') + '</p><p>Het werkwoord blijft zoals het is, behalve bij <b>he, she en it</b>. Dan komt er een <b>-s</b> achter: ' + E('she plays') + ', ' + E('Tom walks') + '.</p><p>Zo ga je te werk: zoek het onderwerp, kijk of het he, she of it is, en zet dan wel of geen -s achter het werkwoord.</p>',
          wanneer:'het gaat om een gewoonte of iets wat altijd zo is.', maak:opgPsS },
        { id:'en-ps-spelling', naam:'Present simple: -s, -es of -ies', kort:'Na s, sh, ch, x en o: -es. Medeklinker + y: -ies. Anders: -s',
          uit:'<p>Bij he, she en it krijgt het werkwoord een <b>-s</b>. Soms verandert de spelling.</p><p>Eindigt het werkwoord op <b>s, sh, ch, x of o</b>, dan schrijf je <b>-es</b>: ' + E('watches, fixes, goes') + '.</p><p>Eindigt het op een <b>medeklinker + y</b>, dan wordt de y <b>-ies</b>: ' + E('study, studies') + '. Staat er een klinker voor de y, dan alleen -s: ' + E('play, plays') + '.</p>',
          wanneer:'het onderwerp he, she of it is en het werkwoord op s, sh, ch, x, o of y eindigt.', maak:opgPsSpel },
        { id:'en-pres-cont', naam:'Present continuous: am/is/are + -ing', kort:'Iets wat nu bezig is: am, is of are en het werkwoord met -ing',
          uit:'<p>De <b>present continuous</b> gebruik je voor iets wat <b>nu</b> bezig is: ' + E('Look! Emma is running.') + '</p><p>Je maakt hem met <b>am, is of are</b> en het werkwoord met <b>-ing</b>.</p><p>Let op de spelling: een e aan het eind valt weg (' + E('make, making') + '). Een kort woord dat eindigt op één klinker + één medeklinker krijgt een dubbele medeklinker (' + E('run, running') + '), maar niet bij w, x of y. En ie wordt y (' + E('lie, lying') + ').</p>',
          wanneer:'iets op dit moment bezig is, met signaalwoorden als now en Look!', maak:opgPc }
      ] },

    { groep:{ id:'en-a2-tijden', niveau:'A2', domein:'grammatica', naam:'Vragen, ontkenningen en de verleden tijd', uit:'Vragen en ontkenningen met do, does en did, het verschil tussen gewoonte en nu, en de past simple: regelmatig en onregelmatig.' },
      doelen:[
        { id:'en-do-does', naam:'Do en does: vragen en ontkenningen', kort:'Vraag of ontkenning met do of does; daarna het werkwoord zonder -s',
          uit:'<p>In de present simple maak je een <b>vraag</b> of een <b>ontkenning</b> met <b>do</b> of <b>does</b>.</p><p>Bij he, she en it gebruik je <b>does</b>, bij de rest <b>do</b>: ' + E('Does Tom play football?') + ' ' + E("We don't play football.") + '</p><p>Na do of does komt het <b>hele werkwoord, zonder -s</b>. De -s zit al in does: ' + E("she doesn't play") + '.</p>',
          wanneer:'je in de present simple iets vraagt of ontkent.', maak:opgDoDoes },
        { id:'en-ps-of-pc', naam:'Present simple of present continuous?', kort:'Gewoonte: present simple. Nu bezig: present continuous. Het signaalwoord helpt',
          uit:'<p>Is het een <b>gewoonte</b>, iets wat vaker gebeurt? Dan de <b>present simple</b>. Signaalwoorden: ' + E('usually, often, sometimes, always, every day') + '.</p><p>Gebeurt het <b>nu</b>? Dan de <b>present continuous</b>. Signaalwoorden: ' + E('now, right now, at the moment, Look!') + '</p><p>Zoek eerst het signaalwoord, kies dan de tijd en maak daarna de vorm.</p>',
          wanneer:'je moet kiezen tussen een gewoonte en iets wat nu bezig is.', maak:opgPsPc },
        { id:'en-was-were', naam:'Was en were', kort:'De past simple van to be: I/he/she/it was, you/we/they were',
          uit:'<p>De verleden tijd van to be heeft twee vormen: <b>was</b> en <b>were</b>.</p><p><b>Was</b> hoort bij ' + E('I, he, she, it') + '. <b>Were</b> hoort bij ' + E('you, we, they') + '.</p><p>Ontkennen: ' + E("wasn't, weren't") + '. Een vraag: ' + E('Were you at home?') + '</p>',
          wanneer:'je vertelt hoe of waar iemand was.', maak:opgWasWere },
        { id:'en-past-regelmatig', naam:'Past simple: regelmatig (-ed)', kort:'Zet -ed achter het werkwoord en let op de spelling',
          uit:'<p>De <b>past simple</b> gebruik je voor iets wat <b>voorbij</b> is. Signaalwoorden: ' + E('yesterday, last week, two days ago') + '.</p><p>Bij een regelmatig werkwoord zet je <b>-ed</b> erachter: ' + E('walk, walked') + '. Eindigt het al op e, dan alleen <b>-d</b>: ' + E('like, liked') + '.</p><p>Een kort woord met één klinker + één medeklinker krijgt een <b>dubbele medeklinker</b>: ' + E('stop, stopped') + '. Medeklinker + y wordt <b>-ied</b>: ' + E('cry, cried') + '. Klinker + y blijft: ' + E('play, played') + '.</p>',
          wanneer:'iets voorbij is en het werkwoord regelmatig is.', maak:opgPastRegel },
        { id:'en-past-onregelmatig', naam:'Past simple: onregelmatig', kort:'Onregelmatige werkwoorden: neem de middelste vorm uit het rijtje',
          uit:'<p>Veel werkwoorden krijgen in de past simple <b>geen -ed</b>. Ze zijn <b>onregelmatig</b>: ' + E('go, went') + ', ' + E('see, saw') + '.</p><p>Die vormen leer je uit de lijst met onregelmatige werkwoorden. Elk werkwoord heeft daar een <b>rijtje van drie</b>: ' + E('go, went, gone') + '. De <b>middelste</b> vorm is de past simple.</p><p>De vorm is voor iedereen hetzelfde: ' + E('I went, she went, they went') + '.</p>',
          wanneer:'iets voorbij is en het werkwoord in de lijst met onregelmatige werkwoorden staat.', maak:opgPastOnr },
        { id:'en-did', naam:'Did: vragen en ontkenningen in het verleden', kort:"Did en daarna het hele werkwoord: did you go, I didn't go",
          uit:'<p>In de past simple maak je vragen en ontkenningen met <b>did</b>, voor iedereen hetzelfde.</p><p>Na did komt het <b>hele werkwoord</b>: ' + E('Did you see the match?') + ' ' + E("I didn't see it.") + '</p><p>De verleden tijd zit al in did. Dus niet ' + E("didn't saw") + ', maar ' + E("didn't see") + '.</p>',
          wanneer:'je in de verleden tijd iets vraagt of ontkent.', maak:opgDid }
      ] },

    { groep:{ id:'en-a2-zin', niveau:'A2', domein:'grammatica', naam:'Zinnen bouwen en vergelijken', uit:'De vaste volgorde van een Engelse zin, some en any, much en many, vergelijken met -er en more, en het verschil tussen quick en quickly.' },
      doelen:[
        { id:'en-woordvolgorde', naam:'Woordvolgorde: wie, doet, wat, waar, wanneer', kort:'Onderwerp, werkwoord, voorwerp, plaats, tijd: het werkwoord blijft na het onderwerp',
          uit:'<p>Een Engelse zin heeft een vaste <b>volgorde</b>: <b>onderwerp, werkwoord, voorwerp, plaats, tijd</b>. Onthoud: wie, doet, wat, waar, wanneer.</p><p>' + E('Tom plays football in the park on Saturdays.') + '</p><p>Anders dan in het Nederlands blijft het werkwoord <b>direct na het onderwerp</b>. ' + E('On Saturdays plays Tom football') + ' is dus fout. En de plaats komt voor de tijd.</p>',
          wanneer:'je zelf een Engelse zin maakt.', maak:opgVolgorde },
        { id:'en-some-any', naam:'Some of any', kort:'Bevestigende zin: some. Ontkenning of vraag: any',
          uit:'<p><b>Some</b> en <b>any</b> betekenen allebei een beetje of een paar.</p><p>In een <b>bevestigende</b> zin gebruik je <b>some</b>: ' + E('There is some milk.') + '</p><p>In een <b>ontkenning</b> en in een <b>vraag</b> gebruik je <b>any</b>: ' + E("There isn't any milk.") + ' ' + E('Is there any milk?') + '</p>',
          wanneer:'je wilt zeggen dat er een beetje of een paar van iets is.', maak:opgSomeAny },
        { id:'en-much-many', naam:'Much of many', kort:'Telbaar (meervoud): many. Niet telbaar: much',
          uit:'<p><b>Much</b> en <b>many</b> betekenen allebei veel. Je gebruikt ze vooral in vragen en ontkenningen.</p><p>Kun je het <b>tellen</b> (three apples)? Dan <b>many</b>: ' + E('How many apples?') + '</p><p>Kun je het <b>niet tellen</b> (milk, money)? Dan <b>much</b>: ' + E('How much milk?') + '</p>',
          wanneer:'je vraagt of zegt hoeveel van iets er is.', maak:opgMuchMany },
        { id:'en-vergrotend', naam:'Vergelijken: -er of more', kort:'Kort woord: -er (bigger). Lang woord: more (more expensive). Good wordt better',
          uit:'<p>Met de <b>vergrotende trap</b> vergelijk je twee dingen, met <b>than</b>: ' + E('Tom is taller than Emma.') + '</p><p>Korte woorden (één lettergreep) en woorden op -y krijgen <b>-er</b>: ' + E('tall, taller') + '; ' + E('happy, happier') + '. Lange woorden krijgen <b>more</b>: ' + E('more expensive') + '.</p><p>Let op de spelling: ' + E('nice, nicer') + '; ' + E('big, bigger') + '; ' + E('easy, easier') + '. Onregelmatig: ' + E('good, better') + ' en ' + E('bad, worse') + '.</p>',
          wanneer:'je twee mensen of dingen met elkaar vergelijkt.', maak:function(){ return opgVergelijk(false); } },
        { id:'en-overtreffend', naam:'Vergelijken: the -est of the most', kort:'Kort woord: the -est (the biggest). Lang woord: the most. Good wordt the best',
          uit:'<p>Met de <b>overtreffende trap</b> zeg je wie of wat het meest is van allemaal: ' + E('Tom is the tallest boy in the class.') + '</p><p>Korte woorden en woorden op -y krijgen <b>-est</b>: ' + E('the tallest, the happiest') + '. Lange woorden krijgen <b>most</b>: ' + E('the most expensive') + '.</p><p>De spelling gaat net als bij -er: ' + E('the nicest, the biggest, the easiest') + '. Onregelmatig: ' + E('the best') + ' en ' + E('the worst') + '.</p>',
          wanneer:'je zegt wie of wat het meest is van een groep.', maak:function(){ return opgVergelijk(true); } },
        { id:'en-bijwoord', naam:'Quick of quickly?', kort:'Bij een zelfstandig naamwoord: quick. Bij een werkwoord: quickly',
          uit:'<p>Een <b>bijvoeglijk naamwoord</b> zegt iets over een persoon of ding: ' + E('a careful driver') + '.</p><p>Een <b>bijwoord</b> zegt <b>hoe</b> iemand iets doet. Het hoort bij een werkwoord en krijgt meestal <b>-ly</b>: ' + E('she drives carefully') + '.</p><p>Spelling: y wordt i (' + E('happy, happily') + '). Onregelmatig: ' + E('good, well') + '.</p>',
          wanneer:'je twijfelt tussen een woord met of zonder -ly.', maak:opgBijwoord }
      ] },

    { groep:{ id:'en-b1-tijden', niveau:'B1', domein:'grammatica', naam:'De present perfect, de past continuous en de toekomst', uit:'De present perfect en wanneer je hem kiest, since en for, de past continuous en de toekomst met will en going to.' },
      doelen:[
        { id:'en-pres-perfect', naam:'Present perfect: have/has + voltooid deelwoord', kort:'Have of has, en dan het voltooid deelwoord (regelmatig -ed, anders de derde vorm)',
          uit:'<p>De <b>present perfect</b> maak je met <b>have of has</b> en het <b>voltooid deelwoord</b>: ' + E('I have finished') + ', ' + E('she has eaten') + '.</p><p>Bij he, she en it gebruik je <b>has</b>. Een regelmatig werkwoord krijgt -ed; bij een onregelmatig werkwoord neem je de <b>derde vorm</b> uit het rijtje (' + E('eat, ate, eaten') + ').</p><p>Signaalwoorden: ' + E('already, yet, never, since, for') + '.</p>',
          wanneer:'iets tot nu toe is gebeurd, of nog steeds zo is.', maak:opgPp },
        { id:'en-since-for', naam:'Since of for', kort:'Since + een beginpunt (since 2018). For + een tijdsduur (for three years)',
          uit:'<p>Bij de present perfect zeg je vaak hoe lang iets al zo is.</p><p><b>Since</b> zet je voor een <b>beginpunt</b>: het moment waarop het begon. ' + E('since 2018, since January, since last summer') + '.</p><p><b>For</b> zet je voor een <b>tijdsduur</b>: hoe lang het al duurt. ' + E('for three years, for two weeks') + '.</p>',
          wanneer:'je zegt hoe lang iets al zo is.', maak:opgSinceFor },
        { id:'en-past-of-perfect', naam:'Past simple of present perfect?', kort:'Een afgelopen moment (yesterday, ago): past simple. Tot nu toe (already, yet, never, since): present perfect',
          uit:'<p>Noem je een <b>moment in het verleden</b>? Dan de <b>past simple</b>. Signaalwoorden: ' + E('yesterday, last week, two years ago, in 2019') + '.</p><p>Loopt het <b>door tot nu</b>, of is het moment niet belangrijk? Dan de <b>present perfect</b>. Signaalwoorden: ' + E('already, yet, never, ever, since') + '.</p><p>' + E('I visited London last year.') + ' ' + E('I have never visited London.') + '</p>',
          wanneer:'je moet kiezen tussen twee tijden over het verleden.', maak:opgPastPp },
        { id:'en-past-cont', naam:'Past continuous: was/were + -ing', kort:'Was of were en het werkwoord met -ing: het was op dat moment bezig',
          uit:'<p>De <b>past continuous</b> gebruik je voor iets wat <b>op een moment in het verleden bezig was</b>: ' + E('At this time yesterday, I was reading.') + '</p><p>Je maakt hem met <b>was of were</b> en het werkwoord met <b>-ing</b>. Was bij I, he, she en it; were bij you, we en they.</p><p>Vaak onderbreekt iets anders de handeling: ' + E('We were walking when it started to rain.') + '</p>',
          wanneer:'iets in het verleden bezig was op een bepaald moment.', maak:opgPastCont },
        { id:'en-will', naam:'De toekomst met will', kort:'Will + het hele werkwoord, voor iedereen hetzelfde',
          uit:'<p>Met <b>will</b> praat je over de <b>toekomst</b>: ' + E('I think it will rain tomorrow.') + '</p><p>Na will komt het <b>hele werkwoord</b>, ook bij he, she en it: ' + E('she will help') + ', niet ' + E('she will helps') + '.</p><p>Ontkennen: ' + E("won't") + ' (' + E('will not') + '). Signaalwoorden: ' + E('tomorrow, next week') + '.</p>',
          wanneer:'je iets over de toekomst zegt of verwacht.', maak:opgWill },
        { id:'en-going-to', naam:'De toekomst met going to', kort:'Am/is/are + going to + het hele werkwoord: voor plannen',
          uit:'<p>Met <b>going to</b> praat je over een <b>plan</b> voor de toekomst: ' + E('We are going to visit London next week.') + '</p><p>Je maakt het met <b>am, is of are</b>, dan <b>going to</b> en dan het <b>hele werkwoord</b>.</p><p>' + E('I am going to') + ', ' + E('he is going to') + ', ' + E('they are going to') + '.</p>',
          wanneer:'iets al gepland is.', maak:opgGoingTo },
        { id:'en-will-of-going-to', naam:'Will of going to?', kort:'Plan of je ziet het aankomen: going to. Besluit van nu, aanbod of belofte: will',
          uit:'<p>Kies <b>going to</b> als het al een <b>plan</b> is (' + E('We have booked a hotel. We are going to stay in Rome.') + '), of als je het <b>nu al ziet aankomen</b> (' + E("Look at those clouds! It's going to rain.") + ').</p><p>Kies <b>will</b> bij een <b>besluit van dit moment</b>, een <b>aanbod</b> of een <b>belofte</b>: ' + E("The phone is ringing. I'll answer it.") + '</p>',
          wanneer:'je moet kiezen hoe je over de toekomst praat.', maak:opgWillGoing }
      ] },

    { groep:{ id:'en-b1-zin', niveau:'B1', domein:'grammatica', naam:'If-zinnen, de passieve vorm en who/which', uit:'Voorwaardezinnen type 1 en 2, de passieve vorm in vier tijden en zinnen met who, which en whose.' },
      doelen:[
        { id:'en-if-1', naam:'If-zin type 1: het kan echt gebeuren', kort:'If + present simple, en in het andere deel will + het hele werkwoord',
          uit:'<p>Een <b>if-zin type 1</b> gaat over iets wat <b>echt kan gebeuren</b>: ' + E('If it rains, we will stay at home.') + '</p><p>In het <b>if-deel</b> staat de <b>present simple</b> (nooit will). In het <b>andere deel</b> staat <b>will + het hele werkwoord</b>.</p><p>Let op de -s bij he, she en it: ' + E('If Tom misses the bus, he will arrive late.') + '</p>',
          wanneer:'je zegt wat er gebeurt als iets anders gebeurt.', maak:function(){ return opgIf(1); } },
        { id:'en-if-2', naam:'If-zin type 2: het is niet echt zo', kort:'If + past simple, en in het andere deel would + het hele werkwoord',
          uit:'<p>Een <b>if-zin type 2</b> gaat over iets wat <b>niet echt zo is</b> of <b>niet waarschijnlijk</b> is: ' + E('If I had time, I would help you.') + ' (Maar ik heb geen tijd.)</p><p>In het <b>if-deel</b> staat de <b>past simple</b>. In het <b>andere deel</b> staat <b>would + het hele werkwoord</b>.</p>',
          wanneer:'je je iets voorstelt wat nu niet zo is.', maak:function(){ return opgIf(2); } },
        { id:'en-passief', naam:'De passieve vorm', kort:'To be in de tijd van de zin + het voltooid deelwoord: the letters are delivered',
          uit:'<p>In een <b>passieve zin</b> is het onderwerp niet degene die iets doet: ' + E('Hamlet was written by Shakespeare.') + '</p><p>Je maakt hem met <b>to be</b> in de tijd van de actieve zin en het <b>voltooid deelwoord</b>: present simple ' + E('is/are written') + ', past simple ' + E('was/were written') + ', present perfect ' + E('has/have been written') + ', will ' + E('will be written') + '.</p><p>Wie het doet, komt achter <b>by</b>.</p>',
          wanneer:'het belangrijker is wat er gebeurt dan wie het doet.', maak:opgPassief },
        { id:'en-who-which-whose', naam:'Who, which of whose', kort:'Persoon: who. Ding of dier: which. Bezit (van wie): whose',
          uit:'<p>Met <b>who, which en whose</b> zeg je meer over een woord in de zin.</p><p><b>Who</b> gebruik je bij een <b>persoon</b>: ' + E('the girl who lives next door') + '. <b>Which</b> bij een <b>ding of dier</b>: ' + E('the book which I am reading') + '.</p><p><b>Whose</b> gebruik je bij <b>bezit</b>: ' + E('the boy whose bike was stolen') + ' (de fiets van de jongen). In plaats van who of which mag je hier ook <b>that</b> schrijven.</p>',
          wanneer:'je twee zinnen aan elkaar wilt maken met een woord als die of dat.', maak:opgWho }
      ] },

    { groep:{ id:'en-b2', niveau:'B2', domein:'grammatica', naam:'Lastige constructies', uit:'If-zinnen type 3, de indirecte rede en question tags: constructies die in examenteksten veel voorkomen.' },
      doelen:[
        { id:'en-if-3', naam:'If-zin type 3: het is niet gebeurd', kort:'If + had + voltooid deelwoord, en in het andere deel would have + voltooid deelwoord',
          uit:'<p>Een <b>if-zin type 3</b> gaat over het <b>verleden</b>, over iets wat <b>niet gebeurd</b> is: ' + E('If I had had time, I would have helped you.') + ' (Maar ik had geen tijd.)</p><p>In het <b>if-deel</b> staat <b>had + voltooid deelwoord</b>. In het <b>andere deel</b> staat <b>would have + voltooid deelwoord</b>.</p>',
          wanneer:'je zegt wat er gebeurd zou zijn als het verleden anders was geweest.', maak:function(){ return opgIf(3); } },
        { id:'en-indirecte-rede', naam:'Indirecte rede: een stap terug in de tijd', kort:'Vertel je na wat iemand zei, zet het werkwoord dan een tijd terug',
          uit:'<p>In de <b>indirecte rede</b> vertel je na wat iemand gezegd heeft: ' + E('Tom said, "I am tired."') + ' wordt ' + E('Tom said that he was tired.') + '</p><p>Het werkwoord gaat <b>een stap terug in de tijd</b>: present simple wordt past simple, present continuous wordt past continuous, present perfect wordt past perfect, will wordt would en can wordt could.</p>',
          wanneer:'je navertelt wat iemand gezegd heeft.', maak:opgReported },
        { id:'en-question-tags', naam:'Question tags', kort:"Herhaal het hulpwerkwoord, draai bevestigend en ontkennend om, en zet het voornaamwoord erachter: isn't he?",
          uit:'<p>Een <b>question tag</b> is een vraagje achter een zin, zoals toch? of hè?: ' + E("Tom is tired, isn't he?") + '</p><p>Je neemt het <b>hulpwerkwoord</b> uit de zin. Staat er geen, dan gebruik je <b>do, does of did</b>. Is de zin <b>bevestigend</b>, dan is de tag <b>ontkennend</b>, en andersom: ' + E("You can't swim, can you?") + '</p><p>Achter het hulpwerkwoord komt het <b>voornaamwoord</b> van het onderwerp: Tom wordt he.</p>',
          wanneer:'je in een gesprek bevestiging vraagt.', maak:opgTag }
      ] }
  ]);
})();
