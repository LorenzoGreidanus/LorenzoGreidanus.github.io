/* De leerroute aardrijkskunde, kaartvaardigheden: windrichtingen, schaal, het raster,
   hoogtelijnen en NAP, het graadnet en tijdzones. Elke vaardigheid is een eigen doel.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, MIN = '−', G = [];

  /* ---------- hulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function tp(x){ return T.toon(x, { punt:true }); }                 /* 25.000 met een punt */
  function nv(x){ var l = [tn(x), tp(x), String(x)]; return l.filter(function(v, i){ return l.indexOf(v) === i; }); }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function FV(lijst, tekst, o){ o = o || {}; lijst.forEach(function(k){ o[String(k).toLowerCase()] = tekst; }); return o; }
  function kz(tekst, opties, goed, hint, extra){ var o = T.hussel(opties), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function kv(tekst, opties, goed, hint, extra){ var s = { tekst:tekst, opties:opties.slice(), goed:goed, hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; op.opties = s.opties; op.goed = s.goed; return op; }
  function r1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + w + ' ' + h + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + T.schoon(aria) + '">'; }
  function tekst(x, y, t, kl, stijl){ return '<text x="' + r1(x) + '" y="' + r1(y) + '" class="' + (kl || 'getal klein') + '"' + (stijl ? ' style="' + stijl + '"' : '') + '>' + T.schoon(t) + '</text>'; }
  /* een pijl van (x1,y1) naar (x2,y2); kl leeg = in de inktkleur */
  function pijl(x1, y1, x2, y2, kl, dik){
    var a = Math.atan2(y2 - y1, x2 - x1), h = 11 + (dik || 3), w = .5;
    var st = kl ? ' class="boog" style="stroke:' + kl + ';stroke-width:' + (dik || 3) + '"' : ' class="as" style="stroke-width:' + (dik || 2) + ';stroke-linecap:round;stroke-linejoin:round"';
    return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"' + st + '/>' +
      '<path d="M' + r1(x2 - h * Math.cos(a - w)) + ' ' + r1(y2 - h * Math.sin(a - w)) + ' L' + r1(x2) + ' ' + r1(y2) + ' L' + r1(x2 - h * Math.cos(a + w)) + ' ' + r1(y2 - h * Math.sin(a + w)) + '"' + st + '/>';
  }
  function noordpijl(x, y){ return pijl(x, y + 34, x, y + 6, '', 2.5) + tekst(x, y, 'N', 'getal'); }
  /* een label met een vlakje erachter, zodat het leesbaar is boven lijnen */
  function label(x, y, t){ var b = String(t).length * 7.4 + 8; return '<rect x="' + r1(x - b / 2) + '" y="' + r1(y - 13) + '" width="' + r1(b) + '" height="17" rx="4" class="vak" style="stroke:none"/>' + tekst(x, y, t); }

  /* ---------- windrichtingen ---------- */
  var DIR = [
    { c:'N', n:'noord', hoek:0, ns:'noord', ow:'' }, { c:'NO', n:'noordoost', hoek:45, ns:'noord', ow:'oost' },
    { c:'O', n:'oost', hoek:90, ns:'', ow:'oost' }, { c:'ZO', n:'zuidoost', hoek:135, ns:'zuid', ow:'oost' },
    { c:'Z', n:'zuid', hoek:180, ns:'zuid', ow:'' }, { c:'ZW', n:'zuidwest', hoek:225, ns:'zuid', ow:'west' },
    { c:'W', n:'west', hoek:270, ns:'', ow:'west' }, { c:'NW', n:'noordwest', hoek:315, ns:'noord', ow:'west' } ];
  function tegen(d){ return DIR[(DIR.indexOf(d) + 4) % 8]; }
  function opp(w){ return { noord:'zuid', zuid:'noord', oost:'west', west:'oost' }[w]; }
  /* alle schrijfwijzen van een richting; en=true: 'noordoosten' eerst */
  function rv(d, en){
    var b = d.n, l = en ? [b + 'en', b] : [b, b + 'en'];
    l.push('het ' + b + 'en', d.c, d.c.split('').join('.') + '.');
    if (d.ns && d.ow) l.push(d.ns + '-' + d.ow, d.ns + '-' + d.ow + 'en');
    return l;
  }
  function windVar(d){ return [d.n + 'enwind', d.n + 'elijke wind', d.n + 'wind', d.n + 'en wind']; }
  /* de windroos; o.labels: 'alle' | 'hoofd'; o.pijl: richting; o.wind: richting waar de wind vandaan komt; o.tweede: tweede pijl */
  function roos(o){
    o = o || {};
    var c = 130, r = 86, s = svg(260, 260, 'windroos', 280);
    s += '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" class="as dun"/>';
    DIR.forEach(function(d){
      var a = d.hoek * Math.PI / 180, hoofd = d.c.length === 1, len = hoofd ? r : r * .7;
      s += '<line x1="' + c + '" y1="' + c + '" x2="' + r1(c + Math.sin(a) * len) + '" y2="' + r1(c - Math.cos(a) * len) + '" class="as' + (hoofd ? '' : ' dun') + '"/>';
      var toon = o.labels === 'alle' || (o.labels !== 'geen' && hoofd) || (o.toonOok && o.toonOok.indexOf(d) >= 0);
      if (toon) s += tekst(c + Math.sin(a) * (r + 22), c - Math.cos(a) * (r + 22) + 6, d.c, 'getal');
    });
    function straal(d, kl){ var a = d.hoek * Math.PI / 180; return pijl(c, c, c + Math.sin(a) * (r - 6), c - Math.cos(a) * (r - 6), kl, 5); }
    if (o.pijl) s += straal(o.pijl, 'var(--lr-2)');
    if (o.tweede) s += straal(o.tweede, 'var(--lr-1)');
    if (o.wind){ var a = o.wind.hoek * Math.PI / 180; s += pijl(c + Math.sin(a) * (r + 4), c - Math.cos(a) * (r + 4), c - Math.sin(a) * (r - 8), c + Math.cos(a) * (r - 8), 'var(--lr-1)', 5); }
    return s + '<circle cx="' + c + '" cy="' + c + '" r="4" class="stip"/></svg>';
  }
  var PLAATS = ['Akkerdam', 'Bosdal', 'Kerkdijk', 'Lindenoord', 'Meerzicht', 'Riethaven', 'Heidekamp', 'Waterhoeve', 'Duinrade', 'Zandwijk', 'Beekhuizen', 'Veenoord'];

  G.push({ groep:{ id:'ak-richting', niveau:'onderbouw', domein:'kaart', naam:'Windrichtingen',
      uit:'De vier hoofdrichtingen en de vier tussenrichtingen op de windroos. Waar ligt een plaats vanaf een andere plaats, wat is de tegenovergestelde richting, en hoe heet een wind.' },
    doelen:[
      { id:'ak-wind-roos', naam:'De windroos: acht richtingen', kort:'Noord of zuid noem je eerst, daarna oost of west',
        uit:'<p>Op de <b>windroos</b> staan vier hoofdrichtingen: noord (N), oost (O), zuid (Z) en west (W). Op een kaart is het noorden bijna altijd boven.</p><p>Daartussen liggen vier <b>tussenrichtingen</b>: noordoost (NO), zuidoost (ZO), zuidwest (ZW) en noordwest (NW).</p><p>Bij een tussenrichting noem je altijd eerst <b>noord of zuid</b>, en dan oost of west. Dus noordoost, nooit oostnoord.</p>',
        wanneer:'je een richting op een kaart of windroos wilt benoemen.',
        beeld:roos({ labels:'alle' }),
        maak:function(R){
          var d = R.kies(DIR), b = function(n){ return roos({ labels:'hoofd', pijl:d, toonOok:n >= 3 ? [d] : [] }); };
          var zin = R.kies(['Een vogel vliegt in de richting van de pijl.', 'Een boot vaart in de richting van de pijl.', 'Je loopt in de richting van de pijl.', 'Een wegwijzer wijst in de richting van de pijl.', 'Een vliegtuig vliegt in de richting van de pijl.', 'Een fietser rijdt in de richting van de pijl.', 'De rivier stroomt in de richting van de pijl.', 'De kompasnaald van een vriend wijst in de richting van de pijl.']);
          return { vraag:'Welke richting is dat?', context:zin, beeld:b, zelfBeeld:b(0),
            stappen:[
              kv('Wijst de pijl naar boven (noord), naar beneden (zuid) of geen van beide?', ['noord', 'zuid', 'geen van beide'], d.ns === 'noord' ? 0 : d.ns === 'zuid' ? 1 : 2,
                d.ns ? 'De pijl gaat een beetje of helemaal naar ' + (d.ns === 'noord' ? 'boven: dat is noord.' : 'beneden: dat is zuid.') : 'De pijl gaat precies opzij, niet omhoog en niet omlaag.'),
              kv('Wijst de pijl naar rechts (oost), naar links (west) of geen van beide?', ['oost', 'west', 'geen van beide'], d.ow === 'oost' ? 0 : d.ow === 'west' ? 1 : 2,
                d.ow ? 'De pijl gaat een beetje of helemaal naar ' + (d.ow === 'oost' ? 'rechts: dat is oost.' : 'links: dat is west.') : 'De pijl gaat recht omhoog of omlaag, niet opzij.'),
              { tekst:'Welke windrichting is het?', antwoord:rv(d), invoer:'tekst',
                hint:d.ns && d.ow ? 'Eerst ' + d.ns + ', dan ' + d.ow + ': ' + d.n + '.' : 'Het is een hoofdrichting: ' + d.n + '.',
                fout:FV(d.ns && d.ow ? [d.ow + d.ns, d.ow + d.ns + 'en', (d.ow.charAt(0) + d.ns.charAt(0)).toUpperCase()] : [], 'Noem eerst noord of zuid, dan oost of west.', FV(rv(tegen(d)), 'Dat is de tegenovergestelde kant. Kijk waar de punt van de pijl heen wijst.')) } ] };
        } },
      { id:'ak-wind-plaats', naam:'Waar ligt de ene plaats vanaf de andere?', kort:'Ga in gedachten op de eerste plaats staan en kijk naar de tweede',
        uit:'<p>"B ligt ten noorden van A" betekent: als je bij <b>A</b> staat, ligt B in het noorden.</p><p>Begin dus altijd bij de plaats na het woordje <b>van</b>. Kijk dan: ligt de andere plaats hoger (noord) of lager (zuid) op de kaart? En meer naar rechts (oost) of naar links (west)?</p><p>Zet het samen, met noord of zuid eerst: ten noordoosten, ten zuidwesten.</p>',
        wanneer:'je op een kaart moet zeggen waar een plaats ligt vanaf een andere plaats.',
        maak:function(R){
          var d = R.kies(DIR), namen = R.hussel(PLAATS), A = namen[0], B = namen[1];
          var k = R.heel(62, 84), dx = d.ow === 'oost' ? k : d.ow === 'west' ? -k : 0, dy = d.ns === 'noord' ? -k : d.ns === 'zuid' ? k : 0;
          if (!d.ns || !d.ow){ dx *= 1.3; dy *= 1.3; }
          var ax = 190 - dx / 2 + R.heel(-20, 20), ay = 140 - dy / 2 + R.heel(-10, 10), bx = ax + dx, by = ay + dy;
          var kaart = svg(400, 260, 'kaart met ' + A + ' en ' + B, 440) + '<rect x="2" y="2" width="396" height="256" rx="10" class="deel"/>' + noordpijl(366, 26) +
            '<circle cx="' + r1(ax) + '" cy="' + r1(ay) + '" r="7" style="fill:var(--lr-1)"/>' + tekst(ax, ay - 13, A) +
            '<circle cx="' + r1(bx) + '" cy="' + r1(by) + '" r="7" style="fill:var(--lr-2)"/>' + tekst(bx, by - 13, B) + '</svg>';
          return { vraag:'Waar ligt ' + B + ' vanaf ' + A + '?', context:'Op deze kaart is het noorden boven.', beeld:kaart, zelfBeeld:kaart,
            stappen:[
              kv('Begin bij ' + A + '. Ligt ' + B + ' hoger (noord), lager (zuid) of even hoog op de kaart?', ['hoger: noord', 'lager: zuid', 'even hoog'], d.ns === 'noord' ? 0 : d.ns === 'zuid' ? 1 : 2,
                'Vergelijk de hoogte van de twee stippen. ' + B + (d.ns ? ' ligt ' + (d.ns === 'noord' ? 'hoger' : 'lager') + '.' : ' ligt even hoog.')),
              kv('Ligt ' + B + ' rechts (oost), links (west) of recht erboven of eronder?', ['rechts: oost', 'links: west', 'recht erboven of eronder'], d.ow === 'oost' ? 0 : d.ow === 'west' ? 1 : 2,
                d.ow ? B + ' ligt meer naar ' + (d.ow === 'oost' ? 'rechts.' : 'links.') : B + ' ligt recht boven of onder ' + A + '.'),
              { tekst:B + ' ligt ten … van ' + A + '.', antwoord:rv(d, true), invoer:'tekst',
                hint:(d.ns && d.ow ? 'Eerst ' + d.ns + ', dan ' + d.ow + ': ' : '') + 'ten ' + d.n + 'en.',
                fout:FV(rv(tegen(d), true), 'Je keek vanaf ' + B + '. Begin bij ' + A + ', de plaats na "van".') } ] };
        } },
      { id:'ak-wind-tegen', naam:'De tegenovergestelde richting', kort:'Draai elk deel van de richting om: noord wordt zuid, oost wordt west',
        uit:'<p>Ligt B ten noorden van A, dan ligt A ten <b>zuiden</b> van B. Je kijkt dan precies de andere kant op.</p><p>Bij een tussenrichting draai je <b>allebei de delen</b> om: noord wordt zuid en oost wordt west. Ten noordoosten wordt dus ten zuidwesten.</p>',
        wanneer:'je de richting andersom moet geven, van de tweede plaats naar de eerste.',
        maak:function(R){
          var d = R.kies(DIR), t = tegen(d), namen = R.hussel(PLAATS), A = namen[0], B = namen[1], st = [];
          if (d.ns) st.push({ tekst:'Wat is het tegenovergestelde van ' + d.ns + '?', antwoord:[opp(d.ns), opp(d.ns) + 'en'], invoer:'tekst', hint:'Noord en zuid zijn elkaars tegenovergestelde.' });
          if (d.ow) st.push({ tekst:'Wat is het tegenovergestelde van ' + d.ow + '?', antwoord:[opp(d.ow), opp(d.ow) + 'en'], invoer:'tekst', hint:'Oost en west zijn elkaars tegenovergestelde.' });
          st.push({ tekst:A + ' ligt ten … van ' + B + '.', antwoord:rv(t, true), invoer:'tekst',
            hint:(d.ns && d.ow ? 'Zet de twee omgedraaide delen achter elkaar, ' + t.ns + ' eerst: ' : '') + 'ten ' + t.n + 'en.',
            fout:FV(rv(d, true), 'Dat is de richting van ' + A + ' naar ' + B + '. Draai hem om.') });
          var b = function(n){ return roos({ labels:'hoofd', pijl:d, tweede:n >= st.length ? t : null, toonOok:n >= st.length ? [d, t] : [d] }); };
          return { vraag:'Waar ligt ' + A + ' vanaf ' + B + '?', context:B + ' ligt ten ' + d.n + 'en van ' + A + '.', beeld:b, stappen:st };
        } },
      { id:'ak-wind-wind', naam:'Hoe heet de wind?', kort:'Een wind heet naar de kant waar hij vandaan komt',
        uit:'<p>Een wind krijgt de naam van de kant waar hij <b>vandaan komt</b>. Een westenwind komt uit het westen en waait naar het oosten.</p><p>Wil je weten waar de wind naartoe waait? Neem de <b>tegenovergestelde</b> richting. Een noordoostenwind waait dus naar het zuidwesten.</p>',
        wanneer:'je een weerbericht leest of wilt weten waar de wind heen waait.',
        maak:function(R){
          var d = R.kies(DIR), t = tegen(d);
          if (R.heel(0, 1)){
            var b1 = function(n){ return roos({ labels:'hoofd', wind:n >= 2 ? d : null }); };
            return { vraag:'Waar waait een ' + d.n + 'enwind naartoe?', beeld:b1, stappen:[
              { tekst:'Waar komt een ' + d.n + 'enwind vandaan?', antwoord:rv(d, true), invoer:'tekst', hint:'De naam zegt waar de wind vandaan komt: uit het ' + d.n + 'en.',
                fout:FV(rv(t, true), 'Een wind heet naar de kant waar hij vandaan komt, niet waar hij heen gaat.') },
              { tekst:'Waar waait hij naartoe? Dat is de tegenovergestelde kant.', antwoord:rv(t, true), invoer:'tekst', hint:'Draai ' + d.n + ' om: dat is ' + t.n + '.',
                fout:FV(rv(d, true), 'Daar komt hij vandaan. Hij waait naar de andere kant.') } ] };
          }
          var b2 = function(){ return roos({ labels:'hoofd', wind:d }); };
          return { vraag:'Hoe heet deze wind?', context:'De wind komt uit het ' + d.n + 'en en waait naar het ' + t.n + 'en.', beeld:b2, zelfBeeld:b2(),
            stappen:[
              kv('Een wind heet naar de kant waar hij …', ['vandaan komt', 'naartoe waait'], 0, 'Een westenwind komt uit het westen.'),
              { tekst:'Waar komt deze wind vandaan?', antwoord:rv(d, true), invoer:'tekst', hint:'Lees het zinnetje boven de vraag: de wind komt uit het ' + d.n + 'en.' },
              { tekst:'Hoe heet de wind?', antwoord:windVar(d), invoer:'tekst', hint:'Zet "wind" achter de richting waar hij vandaan komt: ' + d.n + 'enwind.',
                fout:FV(windVar(t), 'Dat is de kant waar hij heen waait. De naam komt van waar hij vandaan komt.') } ] };
        } }
    ] });

  /* ---------- schaal ---------- */
  function schaalVar(S){ var l = ['1 : ' + tp(S), '1:' + S, '1 : ' + S, '1:' + tp(S), '1 : ' + tp(S).replace(/\./g, ' ')]; return l.filter(function(v, i){ return l.indexOf(v) === i; }); }
  /* het trapje km, m, cm */
  function trap(){
    var s = svg(420, 130, 'omrekenen: km keer 1000 is m, m keer 100 is cm', 460), xs = [60, 210, 360], nm = ['km', 'm', 'cm'];
    xs.forEach(function(x, i){ s += '<rect x="' + (x - 40) + '" y="45" width="80" height="40" rx="10" class="vak"/>' + tekst(x, 72, nm[i], 'getal groot'); });
    s += pijl(104, 52, 166, 52, 'var(--lr-1)') + tekst(135, 36, '× 1000', 'sprong', 'fill:var(--lr-1)') + pijl(254, 52, 316, 52, 'var(--lr-1)') + tekst(285, 36, '× 100', 'sprong', 'fill:var(--lr-1)');
    s += pijl(166, 78, 104, 78, 'var(--lr-2)') + tekst(135, 108, ': 1000', 'sprong', 'fill:var(--lr-2)') + pijl(316, 78, 254, 78, 'var(--lr-2)') + tekst(285, 108, ': 100', 'sprong', 'fill:var(--lr-2)');
    return s + '</svg>';
  }
  /* een kaartje met twee plaatsen en een gemeten afstand */
  function kaartMaat(S, d, toonD, sch){
    sch = sch || 'schaal 1 : ' + tp(S);
    var s = svg(420, 170, 'kaart met ' + sch, 460) + '<rect x="2" y="2" width="416" height="166" rx="10" class="deel"/>';
    var x1 = 70, x2 = 350;
    s += '<circle cx="' + x1 + '" cy="70" r="7" style="fill:var(--lr-1)"/><circle cx="' + x2 + '" cy="70" r="7" style="fill:var(--lr-2)"/>';
    s += '<line x1="' + x1 + '" y1="100" x2="' + x2 + '" y2="100" class="boog" style="stroke:var(--lr-2)"/><line x1="' + x1 + '" y1="92" x2="' + x1 + '" y2="108" class="boog" style="stroke:var(--lr-2)"/><line x1="' + x2 + '" y1="92" x2="' + x2 + '" y2="108" class="boog" style="stroke:var(--lr-2)"/>';
    s += tekst(210, 92, toonD ? tn(d) + ' cm op de kaart' : '? cm op de kaart', 'getal', 'fill:var(--lr-2)');
    return s + tekst(210, 150, sch, 'getal') + '</svg>';
  }
  /* een lijnschaal: m stukken van u cm, elk stuk v km; en een gemeten lijn van d cm */
  function lijnschaal(u, v, d, eenh){
    var m = Math.max(5, Math.ceil(d / u)), px = Math.min(80, 520 / (m * u)), x0 = 30, y = 46, W = Math.max(420, x0 * 2 + m * u * px + 20);
    var s = svg(W, 150, 'lijnschaal: ' + u + ' cm is ' + v + ' ' + eenh, 560);
    for (var i = 0; i < m; i++) s += '<rect x="' + r1(x0 + i * u * px) + '" y="' + y + '" width="' + r1(u * px) + '" height="12" class="deel' + (i % 2 ? '' : ' vol') + '"/>';
    for (i = 0; i <= m; i++) s += tekst(x0 + i * u * px, y - 10, tn(i * v) + (i === m ? ' ' + eenh : ''));
    s += tekst(x0 + u * px / 2, y + 30, u + ' cm');
    if (!d) return s + '</svg>';
    var yd = 112, x2 = x0 + d * px;
    s += '<line x1="' + x0 + '" y1="' + yd + '" x2="' + r1(x2) + '" y2="' + yd + '" class="boog" style="stroke:var(--lr-2)"/>' +
      '<line x1="' + x0 + '" y1="' + (yd - 8) + '" x2="' + x0 + '" y2="' + (yd + 8) + '" class="boog" style="stroke:var(--lr-2)"/><line x1="' + r1(x2) + '" y1="' + (yd - 8) + '" x2="' + r1(x2) + '" y2="' + (yd + 8) + '" class="boog" style="stroke:var(--lr-2)"/>';
    return s + tekst((x0 + x2) / 2, yd + 26, tn(d) + ' cm op de kaart', 'getal', 'fill:var(--lr-2)') + '</svg>';
  }
  var SCHALEN = [10000, 20000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000];

  G.push({ groep:{ id:'ak-schaal', niveau:'onderbouw', domein:'kaart', naam:'Rekenen met de schaal',
      uit:'Met de schaal reken je een afstand op de kaart om naar de afstand in het echt, en terug. Je rekent om tussen cm, m en km, gebruikt de lijnschaal en de getalschaal, en bepaalt zelf de schaal.' },
    doelen:[
      { id:'ak-schaal-cm', naam:'Omrekenen: cm, m en km', kort:'Van km naar m keer 1000, van m naar cm keer 100; terug deel je',
        uit:'<p>Bij schaal reken je vaak om tussen <b>centimeter, meter en kilometer</b>.</p><p>1 km = 1000 m en 1 m = 100 cm. Dus 1 km = 100.000 cm.</p><p>Van groot naar klein (km naar cm) <b>vermenigvuldig</b> je. Van klein naar groot (cm naar km) <b>deel</b> je. Van cm naar km streep je dus vijf nullen weg.</p>',
        wanneer:'je een afstand van de kaart in km wilt zeggen, of andersom.',
        beeld:trap(),
        maak:function(R){
          var km = R.kies([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 12, 15, 20, 25, 40]), m = Math.round(km * 1000), cm = m * 100;
          if (R.heel(0, 1)) return { vraag:tp(cm) + ' cm = ? km', beeld:trap(), eenheid:'km',
            stappen:[
              { tekst:'Van cm naar m: deel door 100. ' + tp(cm) + ' cm = … m', antwoord:nv(m), eenheid:'m', hint:tp(cm) + ' : 100 = ' + tn(m) + '. Haal twee nullen weg.', fout:F(m / 10, 'Van cm naar m deel je door 100, niet door 1000.') },
              { tekst:'Van m naar km: deel door 1000. Dat is … km', antwoord:nv(km), eenheid:'km', hint:tn(m) + ' : 1000 = ' + tn(km) + '.', fout:F(m / 100, 'Van m naar km deel je door 1000.') } ] };
          return { vraag:tn(km) + ' km = ? cm', beeld:trap(), eenheid:'cm',
            stappen:[
              { tekst:'Van km naar m: keer 1000. ' + tn(km) + ' km = … m', antwoord:nv(m), eenheid:'m', hint:tn(km) + ' × 1000 = ' + tn(m) + '.', fout:F(km * 100, 'Van km naar m is keer 1000, niet keer 100.') },
              { tekst:'Van m naar cm: keer 100. Dat is … cm', antwoord:nv(cm), eenheid:'cm', hint:tn(m) + ' × 100 = ' + tp(cm) + '.', fout:F(m * 1000, 'Van m naar cm is keer 100.') } ] };
        } },
      { id:'ak-schaal-getal', naam:'Van de kaart naar het echt', kort:'1 cm op de kaart is het getal achter de dubbele punt in cm in het echt',
        uit:'<p>Een <b>getalschaal</b> zoals 1 : 50.000 betekent: 1 cm op de kaart is <b>50.000 cm</b> in het echt.</p><p>Meet je 4 cm, dan is dat 4 × 50.000 = 200.000 cm in het echt. Reken dat om: 200.000 cm = 2000 m = 2 km.</p>',
        wanneer:'je op de kaart meet hoe ver iets is en wilt weten hoe ver dat echt is.',
        maak:function(R){
          var S = R.kies(SCHALEN), d = R.kies([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8]), cm = Math.round(d * S), m = cm / 100, km = m / 1000, st;
          st = [
            { tekst:'1 cm op de kaart is in het echt … cm.', antwoord:nv(S), eenheid:'cm', hint:'Dat is het getal achter de dubbele punt: ' + tp(S) + '.' },
            { tekst:tn(d) + ' cm op de kaart is in het echt … cm.', antwoord:nv(cm), eenheid:'cm', hint:tn(d) + ' × ' + tp(S) + ' = ' + tp(cm) + '.' },
            { tekst:'Van cm naar m: deel door 100. Dat is … m.', antwoord:nv(m), eenheid:'m', hint:tp(cm) + ' : 100 = ' + tn(m) + '.', fout:F(cm / 1000, 'Van cm naar m deel je door 100.') } ];
          if (km >= 1) st.push({ tekst:'Van m naar km: deel door 1000. Dat is … km.', antwoord:nv(km), eenheid:'km', hint:tn(m) + ' : 1000 = ' + tn(km) + '.', fout:F(m / 100, 'Van m naar km deel je door 1000.') });
          var b = function(){ return kaartMaat(S, d, true); };
          return { vraag:tn(d) + ' cm op de kaart = ? ' + (km >= 1 ? 'km' : 'm'), context:'De kaart heeft schaal 1 : ' + tp(S) + '.', beeld:b, eenheid:km >= 1 ? 'km' : 'm', stappen:st };
        } },
      { id:'ak-schaal-terug', naam:'Van het echt naar de kaart', kort:'Reken de echte afstand om naar cm en deel door het getal van de schaal',
        uit:'<p>Andersom kan ook: je weet hoe ver iets echt is en wilt weten hoeveel cm dat op de kaart is.</p><p>Reken de echte afstand eerst om naar <b>cm</b>. Deel dan door het getal achter de dubbele punt.</p><p>Voorbeeld bij 1 : 25.000: 3 km = 3000 m = 300.000 cm. 300.000 : 25.000 = <b>12 cm</b> op de kaart.</p>',
        wanneer:'je wilt weten hoe lang een route op de kaart wordt, of je een kaart wilt tekenen.',
        maak:function(R){
          var S = R.kies(SCHALEN), d = R.kies([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12]), cm = Math.round(d * S), m = cm / 100, km = m / 1000;
          if (km < 1) return this.maak(R);
          return { vraag:tn(km) + ' km in het echt = ? cm op de kaart', context:'De kaart heeft schaal 1 : ' + tp(S) + '.', beeld:function(n){ return kaartMaat(S, d, n >= 3); }, eenheid:'cm',
            stappen:[
              { tekst:'Van km naar m: keer 1000. ' + tn(km) + ' km = … m', antwoord:nv(m), eenheid:'m', hint:tn(km) + ' × 1000 = ' + tn(m) + '.' },
              { tekst:'Van m naar cm: keer 100. Dat is … cm.', antwoord:nv(cm), eenheid:'cm', hint:tn(m) + ' × 100 = ' + tp(cm) + '.' },
              { tekst:'Deel door ' + tp(S) + '. Op de kaart is dat … cm.', antwoord:nv(d), eenheid:'cm', hint:tp(cm) + ' : ' + tp(S) + ' = ' + tn(d) + '. Streep evenveel nullen weg en deel dan.', fout:F(d * 10, 'Tel de nullen nog eens na.', d / 10, 'Tel de nullen nog eens na.') } ] };
        } },
      { id:'ak-schaal-lijn', naam:'De lijnschaal gebruiken', kort:'Lees af hoeveel km bij één stuk hoort en reken uit hoeveel km jouw lengte is',
        uit:'<p>Een <b>lijnschaal</b> is een balkje met stukken. Bij elk stuk staat hoeveel km dat in het echt is.</p><p>Kijk eerst hoe lang <b>één stuk</b> is en hoeveel km erbij hoort. Reken uit hoeveel km 1 cm is. Meet dan je afstand en vermenigvuldig.</p>',
        wanneer:'een kaart geen getalschaal heeft, maar een balkje met kilometers.',
        maak:function(R){
          var u = R.kies([1, 1, 2]), v = u === 1 ? R.kies([1, 2, 5, 10, 20, 50, 100]) : R.kies([1, 5, 10, 20, 50, 100]), d = R.kies([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7]);
          if (u === 2 && d < 3) d += 3;
          var per = v / u, km = d * per, st = [{ tekst:'Hoeveel km hoort bij één stuk van ' + u + ' cm?', antwoord:nv(v), eenheid:'km', hint:'Kijk naar het getal aan het eind van het eerste stuk: ' + tn(v) + ' km.' }];
          if (u === 2) st.push({ tekst:'Hoeveel km is dan 1 cm?', antwoord:nv(per), eenheid:'km', hint:'Eén stuk is 2 cm. Deel ' + tn(v) + ' door 2: ' + tn(per) + ' km.' });
          st.push({ tekst:'Je meet ' + tn(d) + ' cm. Hoeveel km is dat?', antwoord:nv(km), eenheid:'km', hint:tn(d) + ' × ' + tn(per) + ' = ' + tn(km) + ' km.', fout:u === 2 ? F(d * v, 'Een stuk is 2 cm. Reken met wat 1 cm is.') : null });
          var b = lijnschaal(u, v, d, 'km');
          return { vraag:tn(d) + ' cm op de kaart = ? km', beeld:b, zelfBeeld:b, eenheid:'km', stappen:st };
        } },
      { id:'ak-schaal-omzet', naam:'Van lijnschaal naar getalschaal', kort:'Reken uit hoeveel cm 1 cm op de kaart in het echt is',
        uit:'<p>Staat er bij de lijnschaal 1 cm = 5 km? Dan kun je de <b>getalschaal</b> maken.</p><p>Reken 5 km om naar cm: 5 km = 5000 m = 500.000 cm. De getalschaal is dus <b>1 : 500.000</b>.</p>',
        wanneer:'je twee kaarten wilt vergelijken of met de getalschaal verder wilt rekenen.',
        maak:function(R){
          var u = R.kies([1, 1, 2]), v = R.kies(u === 1 ? [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50] : [1, 5, 10, 20, 50]), per = v / u, m = Math.round(per * 1000), cm = m * 100, st = [];
          if (u === 2) st.push({ tekst:'Hoeveel km is 1 cm op de kaart?', antwoord:nv(per), eenheid:'km', hint:'2 cm is ' + tn(v) + ' km. Deel door 2: ' + tn(per) + ' km.' });
          st.push({ tekst:'Van km naar m: keer 1000. ' + (u === 2 ? '1 cm' : tn(v) + ' km') + ' is … m', antwoord:nv(m), eenheid:'m', hint:tn(per) + ' × 1000 = ' + tn(m) + '.' });
          st.push({ tekst:'Van m naar cm: dat is … cm', antwoord:nv(cm), eenheid:'cm', hint:tn(m) + ' × 100 = ' + tp(cm) + '.' });
          st.push({ tekst:'De getalschaal is …', antwoord:schaalVar(cm), invoer:'tekst', hint:'Schrijf 1 : en dan het aantal cm: 1 : ' + tp(cm) + '.', fout:FV(nv(cm), 'Schrijf het als schaal: 1 : ' + tp(cm) + '.') });
          var b = lijnschaal(u, v, 0, 'km');
          return { vraag:u + ' cm = ' + tn(v) + ' km. Welke getalschaal?', beeld:b, zelfBeeld:b, stappen:st };
        } },
      { id:'ak-schaal-bepaal', naam:'De schaal zelf bepalen', kort:'Echte afstand in cm gedeeld door de afstand op de kaart',
        uit:'<p>Weet je de afstand op de kaart én in het echt? Dan kun je de schaal uitrekenen.</p><p>Reken de echte afstand om naar <b>cm</b>. Deel door het aantal cm op de kaart. Dan weet je wat 1 cm op de kaart is.</p><p>Voorbeeld: 4 cm op de kaart is 2 km. 2 km = 200.000 cm. 200.000 : 4 = 50.000. De schaal is <b>1 : 50.000</b>.</p>',
        wanneer:'er geen schaal bij een kaart staat, maar je wel een echte afstand weet.',
        maak:function(R){
          var S = R.kies(SCHALEN), d = R.kies([2, 3, 4, 5, 6, 8, 10]), cm = d * S, km = cm / 100000;
          if (km < 1) return this.maak(R);
          return { vraag:tn(d) + ' cm op de kaart = ' + tn(km) + ' km', context:'Wat is de schaal van deze kaart?', beeld:function(n){ return kaartMaat(S, d, true, n >= 3 ? null : 'schaal 1 : ?'); },
            stappen:[
              { tekst:'Reken ' + tn(km) + ' km om naar cm. Dat is … cm.', antwoord:nv(cm), eenheid:'cm', hint:tn(km) + ' km = ' + tn(km * 1000) + ' m = ' + tp(cm) + ' cm.' },
              { tekst:'Deel door ' + tn(d) + ' cm op de kaart. 1 cm op de kaart is … cm in het echt.', antwoord:nv(S), eenheid:'cm', hint:tp(cm) + ' : ' + tn(d) + ' = ' + tp(S) + '.' },
              { tekst:'De schaal is …', antwoord:schaalVar(S), invoer:'tekst', hint:'Schrijf 1 : ' + tp(S) + '.', fout:FV(nv(S), 'Schrijf het als schaal: 1 : ' + tp(S) + '.') } ] };
        } },
      { id:'ak-schaal-groot', naam:'Grote en kleine schaal', kort:'Hoe kleiner het getal achter de dubbele punt, hoe groter de schaal en hoe meer details',
        uit:'<p>Een kaart met schaal 1 : 10.000 heeft een <b>grote schaal</b>: alles is maar 10.000 keer verkleind. Je ziet een klein gebied met veel details, zoals straten.</p><p>Een kaart met schaal 1 : 10.000.000 heeft een <b>kleine schaal</b>: je ziet een groot gebied, zoals een heel land, met weinig details.</p><p>Onthoud: <b>klein getal, grote schaal</b>.</p>',
        wanneer:'je moet kiezen welke kaart past bij een stad, een land of een werelddeel.',
        maak:function(R){
          var lijst = R.hussel([5000, 10000, 25000, 50000, 100000, 250000, 1000000, 2500000, 10000000]).slice(0, 3), K = ['kaart A', 'kaart B', 'kaart C'];
          var klein = lijst.indexOf(Math.min.apply(null, lijst)), groot = lijst.indexOf(Math.max.apply(null, lijst));
          var tab = T.teken.tabel([['kaart', 'schaal']].concat(lijst.map(function(S, i){ return ['ABC'.charAt(i), '1 : ' + tp(S)]; })), { kop:true });
          var soort = R.kies(['grootste schaal', 'kleinste schaal', 'meeste details', 'grootste gebied']), kl = soort === 'grootste schaal' || soort === 'meeste details', doel = kl ? klein : groot;
          var vraag = { 'grootste schaal':'Welke kaart heeft de grootste schaal?', 'kleinste schaal':'Welke kaart heeft de kleinste schaal?', 'meeste details':'Op welke kaart zie je de meeste details?', 'grootste gebied':'Welke kaart laat het grootste gebied zien?' }[soort];
          var regel = soort === 'grootste schaal' ? kv('Hoe kleiner het getal, hoe … de schaal.', ['groter', 'kleiner'], 0, 'Klein getal, grote schaal.')
            : soort === 'kleinste schaal' ? kv('Hoe groter het getal, hoe … de schaal.', ['groter', 'kleiner'], 1, 'Groot getal, kleine schaal.')
            : soort === 'meeste details' ? kv('Een klein getal is een grote schaal. Wat zie je dan?', ['een klein gebied met veel details', 'een groot gebied met weinig details'], 0, 'Bij een grote schaal is alles weinig verkleind: je ziet veel details.')
            : kv('Een groot getal is een kleine schaal. Wat zie je dan?', ['een groot gebied met weinig details', 'een klein gebied met veel details'], 0, 'Bij een kleine schaal is alles sterk verkleind: er past een groot gebied op.');
          return eindKeuze({ vraag:vraag, context:lijst.map(function(S, i){ return 'Kaart ' + 'ABC'.charAt(i) + ': 1 : ' + tp(S); }).join('. ') + '.', beeld:tab, zelfBeeld:tab, stappen:[
            kv('Welke kaart heeft het ' + (kl ? 'kleinste' : 'grootste') + ' getal achter de dubbele punt?', K, doel, 'Vergelijk ' + lijst.map(tp).join(', ') + '. Welk getal is het kleinst en welk het grootst?'),
            regel,
            kv(vraag, K, doel, 'Dat is de kaart met het ' + (kl ? 'kleinste' : 'grootste') + ' getal: ' + K[doel] + '.') ] });
        } }
    ] });

  /* ---------- het raster ---------- */
  var DINGEN = ['kerk', 'molen', 'school', 'station', 'kasteel', 'haven', 'brug', 'boerderij', 'toren', 'camping'], HET = { station:1, kasteel:1 };
  function lw(n){ return (HET[n] ? 'het ' : 'de ') + n; }
  function rasterKaart(items, nadruk){
    var x0 = 34, y0 = 30, w = 62, h = 48, s = svg(34 + 6 * w + 8, 30 + 5 * h + 8, 'kaart met een raster van A tot F en 1 tot 5', 460);
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (6 * w) + '" height="' + (5 * h) + '" class="deel"/>';
    if (nadruk) s += '<rect x="' + (x0 + nadruk[0] * w) + '" y="' + (y0 + nadruk[1] * h) + '" width="' + w + '" height="' + h + '" style="fill:var(--lr-1);opacity:.2"/>';
    for (var i = 1; i < 6; i++) s += '<line x1="' + (x0 + i * w) + '" y1="' + y0 + '" x2="' + (x0 + i * w) + '" y2="' + (y0 + 5 * h) + '" class="as dun"/>';
    for (i = 1; i < 5; i++) s += '<line x1="' + x0 + '" y1="' + (y0 + i * h) + '" x2="' + (x0 + 6 * w) + '" y2="' + (y0 + i * h) + '" class="as dun"/>';
    for (i = 0; i < 6; i++) s += tekst(x0 + i * w + w / 2, y0 - 9, 'ABCDEF'.charAt(i), 'getal');
    for (i = 0; i < 5; i++) s += tekst(x0 - 16, y0 + i * h + h / 2 + 5, String(i + 1), 'getal');
    items.forEach(function(it, k){
      var cx = x0 + it.k * w + w / 2, cy = y0 + it.r * h + h / 2 - 6;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="6" style="fill:var(--lr-' + (1 + k % 5) + ')"/>' + tekst(cx, cy + 19, it.n, 'getal klein');
    });
    return s + '</svg>';
  }
  function rasterItems(R){
    var namen = R.hussel(DINGEN).slice(0, 6), vrij = [];
    for (var k = 0; k < 6; k++) for (var r = 0; r < 5; r++) vrij.push([k, r]);
    vrij = R.hussel(vrij);
    return namen.map(function(n, i){ return { n:n, k:vrij[i][0], r:vrij[i][1] }; });
  }
  G.push({ groep:{ id:'ak-raster', niveau:'onderbouw', domein:'kaart', naam:'Zoeken met het raster',
      uit:'Een kaart in de atlas heeft een raster van letters en cijfers. Daarmee geef je precies aan in welk vak iets ligt, en zoek je snel een plaats op.' },
    doelen:[
      { id:'ak-raster-lees', naam:'Het vak van een plek aangeven', kort:'Eerst de letter van de kolom, dan het cijfer van de rij',
        uit:'<p>Over de kaart ligt een <b>raster</b>: kolommen met een letter en rijen met een cijfer.</p><p>Zoek de letter boven de kolom en het cijfer naast de rij. Schrijf <b>eerst de letter</b>, dan het cijfer. Bijvoorbeeld <b>B4</b>.</p><p>Zo staat het ook in het register achter in de atlas.</p>',
        wanneer:'je iemand precies wilt vertellen waar iets op de kaart ligt.',
        maak:function(R){
          var it = rasterItems(R), d = it[0], L = 'ABCDEF'.charAt(d.k), N = String(d.r + 1);
          return { vraag:'In welk vak ligt ' + lw(d.n) + '?', beeld:function(n){ return rasterKaart(it, n >= 3 ? [d.k, d.r] : null); }, zelfBeeld:rasterKaart(it),
            stappen:[
              { tekst:'Welke letter staat boven de kolom van ' + lw(d.n) + '?', antwoord:L, invoer:'tekst', hint:'Ga vanaf ' + lw(d.n) + ' recht omhoog naar de letters.' },
              { tekst:'Welk cijfer staat naast de rij van ' + lw(d.n) + '?', antwoord:N, hint:'Ga vanaf ' + lw(d.n) + ' recht naar links naar de cijfers.' },
              { tekst:'Het vak is …', antwoord:[L + N, L + ' ' + N], invoer:'tekst', hint:'Eerst de letter, dan het cijfer: ' + L + N + '.', fout:F(N + L, 'Eerst de letter, dan het cijfer.', N + ' ' + L, 'Eerst de letter, dan het cijfer.') } ] };
        } },
      { id:'ak-raster-zoek', naam:'Een vak opzoeken', kort:'Zoek de kolom bij de letter en ga dan naar de rij bij het cijfer',
        uit:'<p>In het register staat bijvoorbeeld <b>D2</b>. Zoek bovenaan de letter <b>D</b> en ga die kolom in.</p><p>Ga in die kolom naar rij <b>2</b>. Waar de kolom en de rij elkaar kruisen, ligt het vak.</p>',
        wanneer:'je in de atlas iets opzoekt met het register.',
        maak:function(R){
          var it = rasterItems(R), d = it[0], L = 'ABCDEF'.charAt(d.k), N = d.r + 1;
          var namen = it.map(function(x){ return x.n; });
          return eindKeuze({ vraag:'Wat ligt er in vak ' + L + N + '?', beeld:function(n){ return rasterKaart(it, n >= 1 ? [d.k, d.r] : null); }, zelfBeeld:rasterKaart(it),
            stappen:[
              { tekst:'Zoek kolom ' + L + '. De hoeveelste kolom van links is dat?', antwoord:String(d.k + 1), hint:'Tel de letters: A is 1, B is 2, C is 3, enzovoort. ' + L + ' is ' + (d.k + 1) + '.' },
              kz('Ga in die kolom naar rij ' + N + '. Wat ligt daar?', namen, d.n, 'Kijk in het vak waar kolom ' + L + ' en rij ' + N + ' elkaar kruisen.') ] });
        } }
    ] });

  /* ---------- hoogte ---------- */
  /* hoogtelijnen: ellipsen rond (210,140); sx/sy: verschuiving per lijn (steil aan die kant) */
  function heuvel(o){
    var cx = 210, cy = 142, k = o.niv.length, s = svg(420, 290, 'kaart met hoogtelijnen', 460);
    s += '<rect x="2" y="2" width="416" height="286" rx="10" class="deel"/>' + noordpijl(390, 22);
    var el = o.niv.map(function(h, i){ return { cx:cx + i * (o.sx || 0), cy:cy + i * (o.sy || 0), rx:172 - i * 30, ry:116 - i * 30, h:h }; });
    el.forEach(function(e, i){ s += '<ellipse cx="' + r1(e.cx) + '" cy="' + r1(e.cy) + '" rx="' + r1(e.rx) + '" ry="' + r1(e.ry) + '" class="as"' + (i === k - 1 ? ' style="stroke:var(--lr-3)"' : '') + '/>'; });
    var onder = !o.sy;
    el.forEach(function(e){ s += onder ? label(e.cx, e.cy + e.ry + 6, e.h) : label(e.cx + e.rx, e.cy + 5, e.h); });
    (o.punten || []).forEach(function(p, j){
      var e = el[p.i], a = p.hoek * Math.PI / 180, x = e.cx + e.rx * Math.cos(a), y = e.cy + e.ry * Math.sin(a);
      s += '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="6" style="fill:var(--lr-' + (j ? 2 : 1) + ')"/>' + label(x + (Math.cos(a) < 0 ? -16 : 16), y - 6, p.n);
    });
    return s + '</svg>';
  }
  function niveaus(R){ var I = R.kies([10, 20, 25, 50, 100]), b = I * R.heel(1, 4), l = []; for (var i = 0; i < 4; i++) l.push(b + i * I); return l; }
  var KANT = [{ n:'de noordkant', sx:0, sy:-17 }, { n:'de oostkant', sx:17, sy:0 }, { n:'de zuidkant', sx:0, sy:17 }, { n:'de westkant', sx:-17, sy:0 }];
  /* een staande meetlat met NAP */
  function peil(a, b){
    var lo = Math.min(a.h, b.h, 0) - 2, hi = Math.max(a.h, b.h, 0) + 2, H = 250, y0 = 15, x = 150;
    function y(h){ return y0 + (hi - h) / (hi - lo) * H; }
    var s = svg(360, 280, 'meetlat met NAP', 360) + '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + (y0 + H) + '" class="as"/>';
    var st = hi - lo > 20 ? 5 : 2;
    for (var h = Math.ceil(lo / st) * st; h <= hi; h += st){ s += '<line x1="' + (x - 6) + '" y1="' + r1(y(h)) + '" x2="' + (x + 6) + '" y2="' + r1(y(h)) + '" class="as"/>' + tekst(x - 28, y(h) + 5, (h < 0 ? MIN : h > 0 ? '+' : '') + Math.abs(h) + ' m'); }
    s += '<line x1="' + (x + 8) + '" y1="' + r1(y(0)) + '" x2="' + (x + 150) + '" y2="' + r1(y(0)) + '" class="boog" style="stroke:var(--lr-1);stroke-dasharray:8 6"/>' + tekst(x + 180, y(0) + 5, 'NAP', 'getal', 'fill:var(--lr-1)');
    [a, b].forEach(function(p, j){ s += '<circle cx="' + x + '" cy="' + r1(y(p.h)) + '" r="7" style="fill:var(--lr-' + (j ? 2 : 3) + ')"/>' + tekst(x + 16, y(p.h) + 5, p.n, 'getal klein', 'text-anchor:start'); });
    return s + '</svg>';
  }
  var PLEKKEN = [['de polder', -7, -2], ['het meer', -5, -1], ['het dorp', -1, 3], ['de dijk', 3, 8], ['het duin', 6, 20], ['de weg', 0, 2], ['de wei', -4, -1]];
  function napTekst(h){ return h === 0 ? 'precies op NAP' : Math.abs(h) + ' m ' + (h < 0 ? 'onder' : 'boven') + ' NAP'; }
  function gv(x){ var t = tn(x); return [t, t.replace(MIN, '-')]; }

  G.push({ groep:{ id:'ak-hoogte', niveau:'onderbouw', domein:'kaart', naam:'Hoogte op de kaart',
      uit:'Hoogtelijnen lezen: hoe hoog ligt een punt, welk punt ligt hoger en waar is een helling steil. En rekenen met hoogtes boven en onder NAP.' },
    doelen:[
      { id:'ak-hoogte-lees', naam:'Hoogtelijnen aflezen', kort:'Een hoogtelijn verbindt plekken die even hoog liggen',
        uit:'<p>Een <b>hoogtelijn</b> verbindt alle plekken die even hoog liggen. Bij de lijn staat hoe hoog: bijvoorbeeld 200 m.</p><p>Hoe verder naar binnen, hoe hoger. De binnenste lijn ligt bij de top.</p><p>Het <b>hoogteverschil</b> tussen twee punten reken je uit met hoogste min laagste.</p>',
        wanneer:'je op een kaart wilt zien hoe hoog iets ligt of hoeveel je moet klimmen.',
        maak:function(R){
          var niv = niveaus(R), i = R.heel(0, 3), j; do { j = R.heel(0, 3); } while (j === i);
          var h1 = R.kies([140, 170, 200]), h2 = h1 + R.kies([60, 90, 120]);
          var nm = R.kies([['A', 'B'], ['P', 'Q'], ['K', 'L'], ['X', 'Y'], ['R', 'S'], ['M', 'N'], ['C', 'D']]), PA = nm[0], PB = nm[1];
          var p = [{ i:i, hoek:h1, n:PA }, { i:j, hoek:h2, n:PB }], hA = niv[i], hB = niv[j], ver = Math.abs(hA - hB), b = heuvel({ niv:niv, punten:p });
          return { vraag:'Wat is het hoogteverschil tussen ' + PA + ' en ' + PB + '?', beeld:b, zelfBeeld:b, eenheid:'m',
            stappen:[
              { tekst:'Op welke hoogtelijn ligt punt ' + PA + '?', antwoord:nv(hA), eenheid:'m', hint:'Volg de lijn door ' + PA + ' tot je het getal ziet: ' + hA + ' m.' },
              { tekst:'Op welke hoogtelijn ligt punt ' + PB + '?', antwoord:nv(hB), eenheid:'m', hint:'Volg de lijn door ' + PB + ' tot je het getal ziet: ' + hB + ' m.' },
              kv('Welk punt ligt hoger?', [PA, PB], hA > hB ? 0 : 1, 'Het grootste getal ligt het hoogst.'),
              { tekst:'Hoeveel meter is het hoogteverschil?', antwoord:nv(ver), eenheid:'m', hint:Math.max(hA, hB) + ' ' + MIN + ' ' + Math.min(hA, hB) + ' = ' + ver + ' m.', fout:F(hA + hB, 'Je telde op. Bij een verschil trek je af.') } ] };
        } },
      { id:'ak-hoogte-steil', naam:'Steil of vlak?', kort:'Lijnen dicht bij elkaar is steil, ver uit elkaar is vlak',
        uit:'<p>Liggen de hoogtelijnen <b>dicht bij elkaar</b>, dan stijgt de grond snel over een korte afstand: de helling is <b>steil</b>.</p><p>Liggen de lijnen <b>ver uit elkaar</b>, dan is de helling <b>flauw</b>: bijna vlak.</p>',
        wanneer:'je een wandelroute of fietsroute zoekt, of wilt weten waar water hard naar beneden stroomt.',
        maak:function(R){
          var kant = R.kies(KANT), tegenk = KANT[(KANT.indexOf(kant) + 2) % 4], vr = R.kies([['Aan welke kant is de helling het steilst?', 1], ['Aan welke kant is de klim naar de top het zwaarst?', 1], ['Aan welke kant stroomt regenwater het snelst naar beneden?', 1], ['Aan welke kant is de helling het minst steil?', 0], ['Aan welke kant loop je het makkelijkst naar de top?', 0], ['Aan welke kant is de helling het flauwst?', 0]]), steil = vr[1], doel = steil ? kant : tegenk;
          var b = heuvel({ niv:niveaus(R), sx:kant.sx, sy:kant.sy }), namen = KANT.map(function(k){ return k.n; });
          return eindKeuze({ vraag:vr[0], context:'Het noorden is boven.', beeld:b, zelfBeeld:b,
            stappen:[
              kv('Waar is een helling ' + (steil ? 'steil' : 'flauw') + '?', ['waar de lijnen dicht bij elkaar liggen', 'waar de lijnen ver uit elkaar liggen'], steil ? 0 : 1, steil ? 'Dicht bij elkaar: je stijgt veel over een korte afstand.' : 'Ver uit elkaar: je stijgt weinig over een lange afstand.'),
              kv('Aan welke kant liggen de lijnen het ' + (steil ? 'dichtst bij elkaar' : 'verst uit elkaar') + '? Dat is je antwoord.', namen, KANT.indexOf(doel), 'Vergelijk de ruimte tussen de lijnen boven, rechts, onder en links. Boven is noord, rechts is oost.') ] });
        } },
      { id:'ak-hoogte-nap', naam:'Rekenen met NAP', kort:'Boven NAP is plus, onder NAP is min; het verschil is hoogste min laagste',
        uit:'<p>In Nederland meet je hoogte vanaf <b>NAP</b> (Normaal Amsterdams Peil). NAP is ongeveer het gemiddelde zeeniveau.</p><p>Boven NAP schrijf je als plus, <b>onder NAP als min</b>: 4 m onder NAP is ' + MIN + '4 m.</p><p>Het hoogteverschil is hoogste min laagste. Ligt het ene punt boven en het andere onder NAP, dan tel je de twee afstanden tot NAP op: van +3 naar ' + MIN + '4 is 3 + 4 = 7 m.</p>',
        wanneer:'je hoogtes in Nederland vergelijkt, zoals een polder en een dijk.',
        maak:function(R){
          var p = R.hussel(PLEKKEN), a = { n:p[0][0], h:R.heel(p[0][1], p[0][2]) }, b = { n:p[1][0], h:R.heel(p[1][1], p[1][2]) };
          if (a.h === b.h) return this.maak(R);
          var hoog = a.h > b.h ? a : b, laag = a.h > b.h ? b : a, ver = hoog.h - laag.h, bb = peil(a, b);
          var cap = function(t){ return t.charAt(0).toUpperCase() + t.slice(1); };
          return { vraag:'Hoeveel meter hoger ligt ' + hoog.n + ' dan ' + laag.n + '?', context:cap(a.n) + ' ligt ' + napTekst(a.h) + '. ' + cap(b.n) + ' ligt ' + napTekst(b.h) + '.', beeld:bb, zelfBeeld:bb, eenheid:'m',
            stappen:[
              { tekst:'Schrijf de hoogte van ' + a.n + ' als getal.', antwoord:gv(a.h), eenheid:'m', hint:napTekst(a.h) + (a.h < 0 ? ': onder NAP is min, dus ' + tn(a.h) + '.' : ' is ' + tn(a.h) + '.'), fout:a.h < 0 ? F(-a.h, 'Onder NAP schrijf je met een min ervoor.') : null },
              { tekst:'Schrijf de hoogte van ' + b.n + ' als getal.', antwoord:gv(b.h), eenheid:'m', hint:napTekst(b.h) + (b.h < 0 ? ': onder NAP is min, dus ' + tn(b.h) + '.' : ' is ' + tn(b.h) + '.'), fout:b.h < 0 ? F(-b.h, 'Onder NAP schrijf je met een min ervoor.') : null },
              { tekst:'Het verschil is hoogste min laagste. Dat is … m', antwoord:nv(ver), eenheid:'m',
                hint:laag.h < 0 && hoog.h > 0 ? 'Het ene punt ligt boven NAP en het andere eronder: tel de afstanden op. ' + hoog.h + ' + ' + (-laag.h) + ' = ' + ver + '.' : 'Tel op de meetlat van ' + tn(laag.h) + ' naar ' + tn(hoog.h) + ': dat is ' + ver + ' m.',
                fout:laag.h < 0 && hoog.h > 0 ? F(Math.abs(Math.abs(hoog.h) - Math.abs(laag.h)), 'Het ene punt ligt onder NAP: tel de afstanden tot NAP op.') : null } ] };
        } }
    ] });

  /* ---------- het graadnet ---------- */
  function bt(lat){ return Math.abs(lat) + '° ' + (lat > 0 ? 'NB' : 'ZB'); }
  function lt(lon){ return Math.abs(lon) + '° ' + (lon > 0 ? 'OL' : 'WL'); }
  function cnorm(s){
    s = String(s == null ? '' : s).toLowerCase().replace(/noorderbreedte/g, 'nb').replace(/zuiderbreedte/g, 'zb').replace(/oosterlengte/g, 'ol').replace(/westerlengte/g, 'wl')
      .replace(/graden|graad/g, '').replace(/[^a-z0-9]/g, '');
    return s.replace(/(\d+)n(?=\d|$)/g, '$1nb').replace(/(\d+)z(?=\d|$)/g, '$1zb').replace(/(\d+)o(?=\d|$)/g, '$1ol').replace(/(\d+)w(?=\d|$)/g, '$1wl');
  }
  function cctrl(doel){ var d = cnorm(doel); return function(v){ return cnorm(v) === d; }; }
  /* het graadnet van 80° WL tot 80° OL en van 60° ZB tot 60° NB; punten [{lat,lon,n}] */
  function graadnet(punten, o){
    o = o || {};
    var L = 72, Tp = 14, px = 2.9, py = 2.5, W = L + 160 * px + 20, H = Tp + 120 * py + 40;
    function x(lon){ return L + (lon + 80) * px; } function y(lat){ return Tp + (60 - lat) * py; }
    var s = svg(W, H, 'graadnet', 560);
    for (var lon = -80; lon <= 80; lon += 10){ var nul = lon === 0;
      s += '<line x1="' + r1(x(lon)) + '" y1="' + y(60) + '" x2="' + r1(x(lon)) + '" y2="' + y(-60) + '" class="' + (nul ? 'boog' : 'as dun') + '"' + (nul ? ' style="stroke:var(--lr-1)"' : '') + '/>';
      if (lon % 20 === 0) s += tekst(x(lon), y(-60) + 20, lon ? lt(lon) : '0°', 'getal klein'); }
    for (var lat = -60; lat <= 60; lat += 10){ var ev = lat === 0;
      s += '<line x1="' + x(-80) + '" y1="' + r1(y(lat)) + '" x2="' + x(80) + '" y2="' + r1(y(lat)) + '" class="' + (ev ? 'boog' : 'as dun') + '"' + (ev ? ' style="stroke:var(--lr-2)"' : '') + '/>';
      if (lat % 20 === 0) s += tekst(L - 32, y(lat) + 5, lat ? bt(lat) : '0°', 'getal klein'); }
    s += tekst(x(-70), y(0) - 6, 'evenaar', 'getal klein', 'fill:var(--lr-2)') + tekst(x(0) + 4, y(58) + 2, 'nulmeridiaan', 'getal klein', 'fill:var(--lr-1);text-anchor:start');
    punten.forEach(function(p, i){
      var kl = o.alleen != null ? (i === o.alleen ? 'var(--lr-2)' : 'var(--lr-3)') : 'var(--lr-' + [2, 4, 5, 3][i % 4] + ')';
      s += '<circle cx="' + r1(x(p.lon)) + '" cy="' + r1(y(p.lat)) + '" r="6" style="fill:' + kl + '"/>' + label(x(p.lon) + 14, y(p.lat) - 6, p.n);
    });
    return s + '</svg>';
  }
  function puntGraad(R){ var lat, lon; do { lat = R.heel(-5, 5) * 10; } while (!lat); do { lon = R.heel(-7, 7) * 10; } while (!lon); return { lat:lat, lon:lon }; }
  function breedteStappen(p, wie){
    return [
      kv('Ligt ' + wie + ' boven of onder de evenaar?', ['boven: noorderbreedte (NB)', 'onder: zuiderbreedte (ZB)'], p.lat > 0 ? 0 : 1, 'De evenaar is de dikke lijn in het midden, van links naar rechts. Boven de evenaar is noorderbreedte.'),
      { tekst:'Op hoeveel graden van de evenaar ligt ' + wie + '?', antwoord:String(Math.abs(p.lat)), eenheid:'°', hint:'Tel de lijnen vanaf de evenaar. Elke lijn is 10°. Het is ' + Math.abs(p.lat) + '°.' } ];
  }
  function lengteStappen(p, wie){
    return [
      kv('Ligt ' + wie + ' links of rechts van de nulmeridiaan?', ['links: westerlengte (WL)', 'rechts: oosterlengte (OL)'], p.lon < 0 ? 0 : 1, 'De nulmeridiaan is de dikke lijn van boven naar beneden. Rechts ervan is oosterlengte.'),
      { tekst:'Op hoeveel graden van de nulmeridiaan ligt ' + wie + '?', antwoord:String(Math.abs(p.lon)), eenheid:'°', hint:'Tel de lijnen vanaf de nulmeridiaan. Elke lijn is 10°. Het is ' + Math.abs(p.lon) + '°.' } ];
  }
  G.push({ groep:{ id:'ak-graadnet', niveau:'bovenbouw', domein:'kaart', naam:'Het graadnet',
      uit:'Met breedte en lengte geef je elke plek op aarde precies aan: noorder- of zuiderbreedte vanaf de evenaar, ooster- of westerlengte vanaf de nulmeridiaan.' },
    doelen:[
      { id:'ak-graad-breedte', naam:'De breedte aflezen', kort:'Boven de evenaar is noorderbreedte, eronder zuiderbreedte',
        uit:'<p>De <b>breedte</b> zegt hoe ver een plek ten noorden of ten zuiden van de <b>evenaar</b> ligt. De evenaar is 0°.</p><p>Boven de evenaar is het <b>noorderbreedte (NB)</b>, eronder <b>zuiderbreedte (ZB)</b>. De lijnen van gelijke breedte heten breedtecirkels.</p><p>Je schrijft eerst het aantal graden en dan NB of ZB: 30° NB.</p>',
        wanneer:'je in de atlas wilt aangeven hoe ver een plek van de evenaar ligt.',
        maak:function(R){
          var pn = R.kies(['P', 'Q', 'R', 'S', 'K', 'M', 'X', 'Y']), p = puntGraad(R), b = graadnet([{ lat:p.lat, lon:p.lon, n:pn }]), ant = bt(p.lat);
          var st = breedteStappen(p, pn);
          st.push({ tekst:'Schrijf de breedte op.', antwoord:[ant], controle:cctrl(ant), invoer:'tekst', hint:'Eerst de graden, dan NB of ZB: ' + ant + '.' });
          return { vraag:'Op welke breedte ligt punt ' + pn + '?', beeld:b, zelfBeeld:b, controle:cctrl(ant), stappen:st };
        } },
      { id:'ak-graad-lengte', naam:'De lengte aflezen', kort:'Rechts van de nulmeridiaan is oosterlengte, links westerlengte',
        uit:'<p>De <b>lengte</b> zegt hoe ver een plek ten oosten of ten westen van de <b>nulmeridiaan</b> ligt. Die lijn loopt door Greenwich bij Londen en is 0°.</p><p>Rechts ervan is het <b>oosterlengte (OL)</b>, links <b>westerlengte (WL)</b>. De lijnen van noord naar zuid heten meridianen.</p><p>Je schrijft het als 20° OL.</p>',
        wanneer:'je wilt aangeven hoe ver een plek naar het oosten of westen ligt.',
        maak:function(R){
          var pn = R.kies(['P', 'Q', 'R', 'S', 'K', 'M', 'X', 'Y']), p = puntGraad(R), b = graadnet([{ lat:p.lat, lon:p.lon, n:pn }]), ant = lt(p.lon);
          var st = lengteStappen(p, pn);
          st.push({ tekst:'Schrijf de lengte op.', antwoord:[ant], controle:cctrl(ant), invoer:'tekst', hint:'Eerst de graden, dan OL of WL: ' + ant + '.' });
          return { vraag:'Op welke lengte ligt punt ' + pn + '?', beeld:b, zelfBeeld:b, controle:cctrl(ant), stappen:st };
        } },
      { id:'ak-graad-punt', naam:'De ligging in breedte en lengte', kort:'Eerst de breedte, dan de lengte: 40° NB, 20° OL',
        uit:'<p>Met breedte én lengte geef je een plek precies aan. Je noemt altijd <b>eerst de breedte</b> en dan de lengte.</p><p>Amsterdam ligt bijvoorbeeld op ongeveer 52° NB, 5° OL.</p>',
        wanneer:'je de precieze ligging van een plek wilt geven, zoals in een atlasregister of bij gps.',
        maak:function(R){
          var pn = R.kies(['P', 'Q', 'R', 'S', 'K', 'M', 'X', 'Y']), p = puntGraad(R), b = graadnet([{ lat:p.lat, lon:p.lon, n:pn }]), ant = bt(p.lat) + ', ' + lt(p.lon);
          var st = [breedteStappen(p, pn)[0], { tekst:'De breedte van ' + pn + ' is …', antwoord:[bt(p.lat)], controle:cctrl(bt(p.lat)), invoer:'tekst', hint:'Tel de lijnen vanaf de evenaar, elke lijn is 10°: ' + bt(p.lat) + '.' },
            lengteStappen(p, pn)[0], { tekst:'De lengte van ' + pn + ' is …', antwoord:[lt(p.lon)], controle:cctrl(lt(p.lon)), invoer:'tekst', hint:'Tel de lijnen vanaf de nulmeridiaan, elke lijn is 10°: ' + lt(p.lon) + '.' },
            { tekst:'De ligging van ' + pn + ' is …', antwoord:[ant], controle:cctrl(ant), invoer:'tekst', hint:'Eerst de breedte, dan de lengte: ' + ant + '.' } ];
          return { vraag:'Wat is de ligging van punt ' + pn + '?', beeld:b, zelfBeeld:b, controle:cctrl(ant), stappen:st };
        } },
      { id:'ak-graad-zoek', naam:'Een plek zoeken in het graadnet', kort:'Zoek eerst de breedtecirkel, dan de meridiaan, en kijk waar ze kruisen',
        uit:'<p>Krijg je een ligging, zoals 30° ZB, 40° WL? Zoek dan eerst de <b>breedte</b>: 30° onder de evenaar.</p><p>Zoek daarna de <b>lengte</b>: 40° links van de nulmeridiaan. Waar die twee lijnen elkaar kruisen, ligt de plek.</p>',
        wanneer:'je een plek met zijn ligging in de atlas moet terugvinden.',
        maak:function(R){
          var p = puntGraad(R), pts = [p], tries = 0;
          /* twee andere punten in hetzelfde kwart, en een ergens anders */
          while (pts.length < 4 && tries++ < 200){
            var q = puntGraad(R), zelf = q.lat * p.lat > 0 && q.lon * p.lon > 0;
            if ((pts.length < 3 ? zelf : !zelf) && !pts.some(function(x){ return x.lat === q.lat && x.lon === q.lon; })) pts.push(q);
          }
          while (pts.length < 4){ var z = puntGraad(R); if (!pts.some(function(x){ return x.lat === z.lat && x.lon === z.lon; })) pts.push(z); }
          var lijst = R.hussel(pts), idx = lijst.indexOf(p), L = ['A', 'B', 'C', 'D'];
          var b = graadnet(lijst.map(function(x, i){ return { lat:x.lat, lon:x.lon, n:L[i] }; }));
          return eindKeuze({ vraag:'Welke stip ligt op ' + bt(p.lat) + ', ' + lt(p.lon) + '?', beeld:b, zelfBeeld:b,
            stappen:[
              kv('Ligt de plek boven of onder de evenaar?', ['boven de evenaar', 'onder de evenaar'], p.lat > 0 ? 0 : 1, (p.lat > 0 ? 'NB' : 'ZB') + ' betekent ' + (p.lat > 0 ? 'boven' : 'onder') + ' de evenaar.'),
              kv('Ligt de plek links of rechts van de nulmeridiaan?', ['links', 'rechts'], p.lon < 0 ? 0 : 1, (p.lon < 0 ? 'WL betekent links (west)' : 'OL betekent rechts (oost)') + ' van de nulmeridiaan.'),
              kv('Welke stip ligt precies op ' + bt(p.lat) + ', ' + lt(p.lon) + '?', L, idx, 'Tel ' + Math.abs(p.lat / 10) + ' lijnen vanaf de evenaar en ' + Math.abs(p.lon / 10) + ' lijnen vanaf de nulmeridiaan. Daar ligt stip ' + L[idx] + '.') ] });
        } }
    ] });

  /* ---------- tijdzones ---------- */
  function lg(lon){ return lon === 0 ? '0°' : lt(lon); }
  function uur(h){ return h + ':00'; }
  function tv(h){ var p = (h < 10 ? '0' : '') + h; return [h + ':00', p + ':00', h + '.00', p + '.00', h + ' uur', String(h)]; }
  function lengteLijn(a, b, sprong){
    return T.teken.lijn({ van:-180, tot:180, streep:15, labels:[-180, -90, 0, 90, 180], stip:[a, b], sprongen:sprong ? [{ van:a, naar:b, tekst:Math.abs(b - a) + '°' }] : [],
      toon:function(n){ return n === 0 ? '0°' : Math.abs(n) + '°' + (n < 0 ? 'W' : 'O'); }, aria:'lengtegraden van west naar oost' });
  }
  var STEDEN = [['Londen', 0], ['Lissabon', 0], ['Reykjavik', 0], ['Amsterdam', 1], ['Lagos', 1], ['Caïro', 2], ['Athene', 2], ['Johannesburg', 2], ['Moskou', 3], ['Nairobi', 3], ['Dubai', 4],
    ['Bangkok', 7], ['Jakarta', 7], ['Peking', 8], ['Singapore', 8], ['Tokio', 9], ['Seoul', 9], ['Rio de Janeiro', -3], ['Buenos Aires', -3], ['New York', -5], ['Lima', -5],
    ['Chicago', -6], ['Mexico-Stad', -6], ['Denver', -7], ['Los Angeles', -8]];
  function utc(o){ return 'UTC' + (o > 0 ? '+' + o : o < 0 ? MIN + (-o) : '+0'); }

  G.push({ groep:{ id:'ak-tijdzone', niveau:'bovenbouw', domein:'kaart', naam:'Tijdzones',
      uit:'De aarde draait in 24 uur een keer rond: 360° in 24 uur, dus 15° per uur. Naar het oosten is het later, naar het westen vroeger. Zo reken je uit hoe laat het ergens anders is.' },
    doelen:[
      { id:'ak-tijd-uren', naam:'Het tijdsverschil uit de lengte', kort:'Elke 15 graden lengte is 1 uur tijdsverschil',
        uit:'<p>De aarde draait in <b>24 uur</b> een keer om haar as: 360°. Per uur is dat 360 : 24 = <b>15°</b>.</p><p>Reken eerst uit hoeveel graden twee plaatsen uit elkaar liggen. Liggen ze aan <b>dezelfde kant</b> van de nulmeridiaan (allebei OL of allebei WL), dan trek je af. Liggen ze aan <b>verschillende kanten</b>, dan tel je op.</p><p>Deel het aantal graden door 15: dat is het aantal uren verschil.</p>',
        wanneer:'je wilt weten hoeveel uur het verschil is tussen twee plaatsen.',
        maak:function(R){
          var a, b; do { a = R.heel(-11, 11) * 15; b = R.heel(-11, 11) * 15; } while (!a || !b || a === b || Math.abs(a - b) > 180);
          var zelfde = a * b > 0, gr = Math.abs(a - b), u = gr / 15;
          return { vraag:'Hoeveel uur tijdsverschil is er tussen ' + lg(a) + ' en ' + lg(b) + '?', beeld:function(n){ return lengteLijn(a, b, n >= 2); }, eenheid:'uur',
            stappen:[
              kv('Liggen de twee plaatsen aan dezelfde kant van de nulmeridiaan?', ['ja, dus aftrekken', 'nee, dus optellen'], zelfde ? 0 : 1, 'Kijk naar de letters: ' + lg(a) + ' en ' + lg(b) + '. ' + (zelfde ? 'Allebei hetzelfde: dezelfde kant.' : 'De een is OL, de ander WL: verschillende kanten.')),
              { tekst:'Hoeveel graden liggen ze uit elkaar?', antwoord:String(gr), eenheid:'°', hint:zelfde ? Math.max(Math.abs(a), Math.abs(b)) + ' ' + MIN + ' ' + Math.min(Math.abs(a), Math.abs(b)) + ' = ' + gr + '°.' : Math.abs(a) + ' + ' + Math.abs(b) + ' = ' + gr + '°.',
                fout:F(zelfde ? Math.abs(a) + Math.abs(b) : Math.abs(Math.abs(a) - Math.abs(b)), zelfde ? 'Ze liggen aan dezelfde kant: trek af.' : 'Ze liggen aan verschillende kanten: tel op.') },
              { tekst:'Deel door 15. Hoeveel uur verschil is dat?', antwoord:String(u), eenheid:'uur', hint:gr + ' : 15 = ' + u + '.' } ] };
        } },
      { id:'ak-tijd-klok', naam:'Hoe laat is het daar?', kort:'Reken het aantal uren uit; naar het oosten tel je op, naar het westen trek je af',
        uit:'<p>In het <b>oosten</b> komt de zon eerder op. Daar is het dus <b>later</b>. In het <b>westen</b> is het <b>vroeger</b>.</p><p>Reken eerst het tijdsverschil uit met 15° per uur. Ligt de andere plaats oostelijker, tel dan de uren op. Ligt hij westelijker, trek ze dan af.</p>',
        wanneer:'je wilt weten hoe laat het is op een plek met een andere lengte.',
        maak:function(R){
          var a, b, t, tb; do { a = R.heel(-10, 10) * 15; b = R.heel(-10, 10) * 15; t = R.heel(6, 20); tb = t + (b - a) / 15; } while (a === b || Math.abs(a - b) > 165 || tb < 1 || tb > 23);
          var gr = Math.abs(a - b), u = gr / 15, oost = b > a;
          return { vraag:'Hoe laat is het in plaats B?', context:'Plaats A ligt op ' + lg(a) + '. Daar is het ' + uur(t) + '. Plaats B ligt op ' + lg(b) + '. We rekenen met 15° per uur.', beeld:function(n){ return lengteLijn(a, b, n >= 1); },
            stappen:[
              { tekst:'Hoeveel graden liggen A en B uit elkaar?', antwoord:String(gr), eenheid:'°', hint:a * b < 0 ? 'Verschillende kanten van de nulmeridiaan: tel op. ' + Math.abs(a) + ' + ' + Math.abs(b) + ' = ' + gr + '.' : 'Trek de getallen van elkaar af: dat is ' + gr + '°.' },
              { tekst:'Hoeveel uur verschil is dat?', antwoord:String(u), eenheid:'uur', hint:gr + ' : 15 = ' + u + '.' },
              kv('Ligt B ten oosten of ten westen van A?', ['oosten, dus later', 'westen, dus vroeger'], oost ? 0 : 1, 'Op de lijn is oost rechts. B ligt ' + (oost ? 'rechts van A: oostelijker, dus later.' : 'links van A: westelijker, dus vroeger.')),
              { tekst:'Hoe laat is het in B?', antwoord:tv(tb), invoer:'tekst', hint:uur(t) + (oost ? ' + ' : ' ' + MIN + ' ') + u + ' uur = ' + uur(tb) + '.', fout:FV(tv(t + (oost ? -u : u)), 'Andersom: naar het oosten is het later, naar het westen vroeger.') } ] };
        } },
      { id:'ak-tijd-zone', naam:'Rekenen met tijdzones', kort:'Het verschil tussen de UTC-getallen is het aantal uren; hoger getal is later',
        uit:'<p>De wereld is verdeeld in <b>tijdzones</b>. Elke zone heeft een tijd ten opzichte van <b>UTC</b>, de tijd bij de nulmeridiaan. Nederland heeft in de winter UTC+1.</p><p>Het verschil tussen de twee getallen is het aantal uren verschil. Een <b>hoger getal is later</b>, een lager getal vroeger.</p><p>Let op met min: van UTC+1 naar UTC' + MIN + '5 is 1 + 5 = 6 uur.</p>',
        wanneer:'je wilt bellen of afspreken met iemand in een ander land.',
        maak:function(R){
          var a, b, t, tb; do { a = R.kies(STEDEN); b = R.kies(STEDEN); t = R.heel(5, 21); tb = t + b[1] - a[1]; } while (a[1] === b[1] || tb < 1 || tb > 23);
          var u = Math.abs(b[1] - a[1]), later = b[1] > a[1];
          return { vraag:'Hoe laat is het in ' + b[0] + '?', context:'Het is januari. In ' + a[0] + ' (' + utc(a[1]) + ') is het ' + uur(t) + '. ' + b[0] + ' heeft ' + utc(b[1]) + '.',
            beeld:T.teken.lijn({ van:-9, tot:10, streep:1, labels:[a[1], b[1], 0], stip:[a[1], b[1]], toon:function(n){ return utc(n); }, aria:'tijdzones' }),
            stappen:[
              { tekst:'Hoeveel uur verschil is er tussen ' + utc(a[1]) + ' en ' + utc(b[1]) + '?', antwoord:String(u), eenheid:'uur', hint:a[1] * b[1] < 0 ? 'De een is plus, de ander min: tel op. ' + Math.abs(a[1]) + ' + ' + Math.abs(b[1]) + ' = ' + u + '.' : 'Trek de getallen van elkaar af: ' + u + '.',
                fout:F(Math.abs(Math.abs(b[1]) - Math.abs(a[1])), a[1] * b[1] < 0 ? 'Let op de min. Van plus naar min tel je de getallen op.' : null) },
              kv('Is het in ' + b[0] + ' later of vroeger?', ['later', 'vroeger'], later ? 0 : 1, utc(b[1]) + ' is ' + (later ? 'hoger' : 'lager') + ' dan ' + utc(a[1]) + ', dus ' + (later ? 'later' : 'vroeger') + '.'),
              { tekst:'Hoe laat is het in ' + b[0] + '?', antwoord:tv(tb), invoer:'tekst', hint:uur(t) + (later ? ' + ' : ' ' + MIN + ' ') + u + ' uur = ' + uur(tb) + '.', fout:FV(tv(t + (later ? -u : u)), 'Andersom: een hoger UTC-getal is later.') } ] };
        } }
    ] });

  LEERROUTE.voeg('aardrijkskunde', G);
})();
