/* De leerroute biologie, het leven: de microscoop, determineren, voedselketens en
   voedselwebben, rekenen in de ecologie, erfelijkheid (monohybride en X-chromosomaal)
   en rekenen aan het lichaam. Elke vaardigheid is een eigen doel. Zie leerroute.js. */
(function(){
  'use strict';
  var T = LEERROUTE.R, MIN = '−', G = [];

  /* ---------- hulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function tp(x){ return T.toon(x, { punt:true }); }
  function nv(x){ var a = tn(x), l = [a, tp(x), String(x), a.replace(MIN, '-')]; return l.filter(function(v, i){ return l.indexOf(v) === i; }); }
  function pv(x){ return nv(x).concat(nv(x).map(function(v){ return v + '%'; })); }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function kz(tekst, opties, goed, hint, extra){ var o = T.hussel(opties), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function kv(tekst, opties, goed, hint, extra){ var s = { tekst:tekst, opties:opties.slice(), goed:goed, hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; op.opties = s.opties; op.goed = s.goed; return op; }
  function r1(x){ return Math.round(x * 10) / 10; }
  function rnd(x, d){ var f = Math.pow(10, d || 0); return Math.round(x * f) / f; }
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }
  function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  function svg(w, h, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + w + ' ' + h + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + T.schoon(aria) + '">'; }
  function tekst(x, y, t, kl, stijl){ return '<text x="' + r1(x) + '" y="' + r1(y) + '" class="' + (kl || 'getal klein') + '"' + (stijl ? ' style="' + stijl + '"' : '') + '>' + T.schoon(t) + '</text>'; }
  function pijl(x1, y1, x2, y2, kl, dik){
    var a = Math.atan2(y2 - y1, x2 - x1), h = 10 + (dik || 2), w = .5;
    var st = ' class="boog" style="stroke:' + (kl || 'var(--lr-1)') + ';stroke-width:' + (dik || 2) + '"';
    return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"' + st + '/>' +
      '<path d="M' + r1(x2 - h * Math.cos(a - w)) + ' ' + r1(y2 - h * Math.sin(a - w)) + ' L' + r1(x2) + ' ' + r1(y2) + ' L' + r1(x2 - h * Math.cos(a + w)) + ' ' + r1(y2 - h * Math.sin(a + w)) + '"' + st + '/>';
  }

  /* ---------- de microscoop ---------- */
  /* een cel met een maatlijn; label onder de lijn */
  function cel(lab){
    var s = svg(360, 170, 'cel met een maatlijn', 380);
    s += '<ellipse cx="180" cy="72" rx="120" ry="52" class="deel" style="fill:var(--lr-4);fill-opacity:.18"/><circle cx="205" cy="66" r="18" style="fill:var(--lr-5);opacity:.55"/>';
    s += '<line x1="60" y1="140" x2="300" y2="140" class="boog" style="stroke:var(--lr-2)"/><line x1="60" y1="132" x2="60" y2="148" class="boog" style="stroke:var(--lr-2)"/><line x1="300" y1="132" x2="300" y2="148" class="boog" style="stroke:var(--lr-2)"/>';
    return s + tekst(180, 164, lab, 'getal', 'fill:var(--lr-2)') + '</svg>';
  }
  G.push({ groep:{ id:'bi-micro', niveau:'onderbouw', domein:'cel', naam:'De microscoop',
      uit:'Hoe sterk een microscoop vergroot, welk objectief je nodig hebt, en hoe je van een foto of tekening terugrekent naar de echte grootte van een cel.' },
    doelen:[
      { id:'bi-micro-vergr', naam:'De vergroting uitrekenen', kort:'Vergroting = oculair × objectief',
        uit:'<p>Een microscoop heeft twee lenzen. Het <b>oculair</b> zit bovenaan, waar je doorkijkt. Het <b>objectief</b> zit vlak boven het preparaat.</p><p>Op elke lens staat hoe sterk hij vergroot, bijvoorbeeld 10× en 40×. De <b>totale vergroting</b> = oculair × objectief. Hier: 10 × 40 = <b>400 keer</b>.</p>',
        wanneer:'je wilt weten hoe sterk je iets vergroot ziet.',
        maak:function(R){
          var oc = R.kies([5, 10, 10, 15]), ob = R.kies([4, 10, 40, 100]), v = oc * ob;
          return { vraag:'Hoeveel keer is de vergroting?', context:'Op het oculair staat ' + oc + '×. Op het objectief staat ' + ob + '×.', eenheid:'×',
            stappen:[
              kv('Hoe reken je de totale vergroting uit?', ['oculair × objectief', 'oculair + objectief'], 0, 'De vergrotingen werken na elkaar: je vermenigvuldigt.'),
              { tekst:oc + ' × ' + ob + ' = …', antwoord:nv(v).concat([v + 'x']), hint:oc + ' × ' + ob + ' = ' + v + '.', fout:F(oc + ob, 'Je telde op. De vergrotingen vermenigvuldig je.') } ] };
        } },
      { id:'bi-micro-obj', naam:'Welk objectief heb je nodig?', kort:'Objectief = totale vergroting : oculair',
        uit:'<p>Wil je een bepaalde vergroting en weet je het oculair? Dan reken je terug welk <b>objectief</b> je nodig hebt.</p><p>Objectief = <b>totale vergroting : oculair</b>. Wil je 400 keer vergroten met een oculair van 10×, dan heb je een objectief van 400 : 10 = <b>40×</b> nodig.</p>',
        wanneer:'je een bepaalde vergroting nodig hebt voor een preparaat.',
        maak:function(R){
          var oc = R.kies([5, 10, 10, 15]), ob = R.kies([4, 10, 40, 100]), v = oc * ob;
          return { vraag:'Welk objectief heb je nodig?', context:'Je wilt ' + v + ' keer vergroten. Het oculair is ' + oc + '×.', eenheid:'×',
            stappen:[
              kv('Welke som past?', ['totale vergroting : oculair', 'totale vergroting × oculair'], 0, 'Oculair × objectief = vergroting. Dus objectief = vergroting : oculair.'),
              { tekst:v + ' : ' + oc + ' = …', antwoord:nv(ob).concat([ob + 'x']), hint:v + ' : ' + oc + ' = ' + ob + '.' } ] };
        } },
      { id:'bi-micro-echt', naam:'De echte grootte uitrekenen', kort:'Echte grootte = grootte op de foto : vergroting; daarna mm naar µm',
        uit:'<p>Op een foto of tekening is een cel vergroot. De <b>echte grootte</b> = grootte op de foto <b>: vergroting</b>.</p><p>Cellen zijn klein. Je schrijft hun grootte meestal in <b>micrometer (µm)</b>. 1 mm = <b>1000 µm</b>.</p><p>Voorbeeld: op de foto is een cel 30 mm. De foto is 600 keer vergroot. 30 : 600 = 0,05 mm = <b>50 µm</b>.</p>',
        wanneer:'je wilt weten hoe groot een cel echt is.',
        maak:function(R){
          var b, v, um; do { b = R.kies([12, 15, 20, 24, 30, 36, 40, 45, 48, 60]); v = R.kies([40, 100, 200, 300, 400, 600, 1000]); um = b * 1000 / v; } while (um !== Math.round(um));
          /* een cel die ongeveer zo groot is */
          var mm = rnd(b / v, 6), lab = b + ' mm op de foto', wat = R.kies(um <= 10 ? ['een rode bloedcel', 'een gistcel'] : um <= 40 ? ['een bladcel', 'een witte bloedcel'] : um <= 100 ? ['een wangcel', 'een bladcel'] : ['een cel van een ui', 'een pantoffeldiertje']);
          return { vraag:'Hoe groot is de cel echt, in µm?', context:'Op een foto is ' + wat + ' ' + b + ' mm lang. De foto is ' + v + ' keer vergroot.', beeld:cel(lab), eenheid:'µm',
            stappen:[
              { tekst:'Deel de grootte op de foto door de vergroting. ' + b + ' : ' + v + ' = … mm', antwoord:nv(mm), eenheid:'mm', hint:b + ' : ' + v + ' = ' + tn(mm) + ' mm.', fout:F(b * v, 'Je vermenigvuldigde. Terugrekenen naar het echt is delen.') },
              { tekst:'Van mm naar µm: keer 1000. Dat is … µm', antwoord:nv(um), eenheid:'µm', hint:tn(mm) + ' × 1000 = ' + tn(um) + ' µm.' } ] };
        } },
      { id:'bi-micro-beeld', naam:'Hoe groot wordt het op de foto?', kort:'Grootte op de foto = echte grootte × vergroting',
        uit:'<p>Andersom: weet je hoe groot een cel echt is, dan reken je uit hoe groot hij op de foto of in je tekening wordt.</p><p>Grootte op de foto = <b>echte grootte × vergroting</b>. Reken daarna om van µm naar mm: <b>deel door 1000</b>.</p>',
        wanneer:'je een tekening op schaal maakt van wat je door de microscoop ziet.',
        maak:function(R){
          var um, v, mm; do { um = R.kies([8, 10, 20, 25, 40, 50, 60, 80, 100, 150, 200]); v = R.kies([40, 100, 200, 400, 500, 1000]); mm = um * v / 1000; } while (mm < 2 || mm > 150 || mm * 10 !== Math.round(mm * 10));
          return { vraag:'Hoe groot is de cel op de foto, in mm?', context:'Een cel is ' + um + ' µm lang. De foto is ' + v + ' keer vergroot.', beeld:cel(um + ' µm in het echt'), eenheid:'mm',
            stappen:[
              { tekst:'Vermenigvuldig met de vergroting. ' + um + ' × ' + v + ' = … µm', antwoord:nv(um * v), eenheid:'µm', hint:um + ' × ' + v + ' = ' + tp(um * v) + ' µm.' },
              { tekst:'Van µm naar mm: deel door 1000. Dat is … mm', antwoord:nv(mm), eenheid:'mm', hint:tp(um * v) + ' : 1000 = ' + tn(mm) + ' mm.' } ] };
        } },
      { id:'bi-micro-factor', naam:'Hoe sterk is de foto vergroot?', kort:'Vergroting = grootte op de foto : echte grootte, in dezelfde eenheid',
        uit:'<p>Weet je de grootte op de foto én de echte grootte? Dan reken je de <b>vergroting</b> uit: grootte op de foto <b>:</b> echte grootte.</p><p>Let op: zet eerst allebei in <b>dezelfde eenheid</b>. Reken de mm van de foto om naar µm (keer 1000).</p>',
        wanneer:'je bij een foto wilt weten hoe sterk hij vergroot is.',
        maak:function(R){
          var um, v, mm; do { um = R.kies([10, 20, 25, 40, 50, 80, 100]); v = R.kies([100, 200, 250, 400, 500, 600, 800, 1000]); mm = um * v / 1000; } while (mm < 5 || mm > 120 || mm !== Math.round(mm));
          return { vraag:'Hoeveel keer is de foto vergroot?', context:'Op een foto is een cel ' + mm + ' mm lang. In het echt is de cel ' + um + ' µm.', beeld:cel(mm + ' mm op de foto'), eenheid:'×',
            stappen:[
              { tekst:'Reken ' + mm + ' mm om naar µm. Dat is … µm', antwoord:nv(mm * 1000), eenheid:'µm', hint:mm + ' × 1000 = ' + tp(mm * 1000) + ' µm.' },
              { tekst:'Deel door de echte grootte (' + um + ' µm). De vergroting is …', antwoord:nv(v).concat([v + 'x']), hint:tp(mm * 1000) + ' : ' + um + ' = ' + v + '.', fout:F(rnd(mm / um, 4), 'Reken eerst om naar dezelfde eenheid.') } ] };
        } }
    ] });

  /* ---------- determineren ---------- */
  var SLEUTEL = {
    gew:{ naam:'gewervelde dieren', regels:[
      ['1a', 'Het dier heeft veren.', 'vogels'], ['1b', 'Het dier heeft geen veren.', '2'],
      ['2a', 'Het dier heeft haren.', 'zoogdieren'], ['2b', 'Het dier heeft geen haren.', '3'],
      ['3a', 'Het dier heeft vinnen en ademt met kieuwen.', 'vissen'], ['3b', 'Het dier heeft geen vinnen.', '4'],
      ['4a', 'De huid is droog en bedekt met schubben.', 'reptielen'], ['4b', 'De huid is vochtig en glad, zonder schubben.', 'amfibieën'] ],
      dier:{ vogels:['heeft veren en een snavel', 'legt eieren met een harde schaal'], zoogdieren:['heeft geen veren', 'heeft een vacht van haren'], vissen:['heeft geen veren en geen haren', 'heeft vinnen en ademt met kieuwen'],
        reptielen:['heeft geen veren en geen haren', 'heeft geen vinnen', 'heeft een droge huid met schubben'], 'amfibieën':['heeft geen veren en geen haren', 'heeft geen vinnen', 'heeft een vochtige, gladde huid zonder schubben'] } },
    gel:{ naam:'geleedpotigen', regels:[
      ['1a', 'Het dier heeft 6 poten.', 'insecten'], ['1b', 'Het dier heeft meer dan 6 poten.', '2'],
      ['2a', 'Het dier heeft 8 poten.', 'spinachtigen'], ['2b', 'Het dier heeft meer dan 8 poten.', '3'],
      ['3a', 'Het lichaam is lang en bestaat uit veel gelijke stukjes met poten.', 'duizendpoten en miljoenpoten'], ['3b', 'Het dier heeft een harde schaal en twee paar voelsprieten.', 'kreeftachtigen'] ],
      dier:{ insecten:['heeft 6 poten', 'heeft 2 voelsprieten'], spinachtigen:['heeft 8 poten', 'heeft geen voelsprieten'],
        'duizendpoten en miljoenpoten':['heeft {n} poten', 'heeft een lang lichaam van veel gelijke stukjes'], kreeftachtigen:['heeft {k} poten', 'heeft een harde schaal en twee paar voelsprieten'] } } };
  function sleutelHtml(S, pad){
    return '<div class="lr-tekst"><p><b>Determineertabel ' + S.naam + '</b></p>' + S.regels.map(function(r){
      var t = '<b>' + r[0] + '</b> ' + T.schoon(r[1]) + ' → ' + (/^\d$/.test(r[2]) ? 'ga naar ' + r[2] : '<b>' + T.schoon(r[2]) + '</b>');
      return '<p style="margin:0 0 4px">' + (pad.indexOf(r[0]) >= 0 ? '<mark>' + t + '</mark>' : t) + '</p>'; }).join('') + '</div>';
  }
  function determineer(R, sl){
    var S = SLEUTEL[sl], groepen = Object.keys(S.dier), doel = R.kies(groepen), pad = [], st = [], stap = '1';
    while (/^\d$/.test(stap)){
      var a = S.regels.filter(function(r){ return r[0] === stap + 'a'; })[0], b = S.regels.filter(function(r){ return r[0] === stap + 'b'; })[0];
      /* in deze tabellen wijst a steeds naar een groep; wijst a niet naar de goede groep, dan is het b */
      var neem = a[2] === doel ? a : b;
      pad.push(neem[0]);
      st.push(kv('Stap ' + stap + ': welke zin past bij het dier?', [a[0] + ': ' + a[1], b[0] + ': ' + b[1]], neem === a ? 0 : 1, 'Lees de beschrijving van het dier nog eens. ' + (neem === a ? a[1] : b[1])));
      stap = neem[2];
    }
    var beschr = S.dier[doel].map(function(z){ return z.replace('{n}', R.kies([30, 40, 56, 70, 100])).replace('{k}', R.kies([10, 14])); });
    st.push(kz('Bij welke groep hoort het dier?', groepen, doel, 'Volg de stappen tot je bij een naam uitkomt: ' + doel + '.'));
    var ln = R.kies(['P', 'Q', 'R', 'S', 'T', 'X', 'Y', 'Z']);
    return eindKeuze({ vraag:'Bij welke groep hoort dier ' + ln + '?', context:'Dier ' + ln + ' ' + beschr.join('. Het ') + '.', beeld:function(n){ return sleutelHtml(S, pad.slice(0, n)); }, zelfBeeld:sleutelHtml(S, []), stappen:st });
  }
  G.push({ groep:{ id:'bi-det', niveau:'onderbouw', domein:'ecologie', naam:'Determineren',
      uit:'Met een determineertabel zoek je stap voor stap uit tot welke groep een organisme hoort. Bij elke stap kies je tussen twee zinnen.' },
    doelen:[
      { id:'bi-det-gewerveld', naam:'Determineren: gewervelde dieren', kort:'Kies bij elke stap a of b en ga naar het volgende nummer tot je een naam vindt',
        uit:'<p>Een <b>determineertabel</b> bestaat uit stappen. Bij elke stap staan twee zinnen: <b>a</b> en <b>b</b>. Je kiest de zin die past bij het dier.</p><p>Achter de zin staat waar je heen gaat: naar een volgend nummer, of de naam van de groep. Zo ga je door tot je bij een <b>naam</b> uitkomt.</p><p>Begin altijd bij <b>stap 1</b>.</p>',
        wanneer:'je wilt weten tot welke groep een gewerveld dier hoort.',
        beeld:sleutelHtml(SLEUTEL.gew, []),
        maak:function(R){ return determineer(R, 'gew'); } },
      { id:'bi-det-geleed', naam:'Determineren: geleedpotigen', kort:'Tel de poten en volg de tabel van stap 1 tot een naam',
        uit:'<p><b>Geleedpotigen</b> zijn dieren met een uitwendig skelet en poten met geledingen, zoals insecten en spinnen.</p><p>Met de determineertabel zoek je de groep. Tel eerst de <b>poten</b>. Kies bij elke stap zin a of b, en ga door tot je bij een naam uitkomt.</p>',
        wanneer:'je een klein beestje uit de tuin of de sloot op naam wilt brengen.',
        beeld:sleutelHtml(SLEUTEL.gel, []),
        maak:function(R){ return determineer(R, 'gel'); } }
    ] });

  /* ---------- voedselketens en voedselwebben ---------- */
  var MV = { sprinkhaan:'sprinkhanen', veldmuis:'veldmuizen', konijn:'konijnen', kikker:'kikkers', watervlo:'watervlooien', slak:'slakken', libellenlarve:'libellenlarven', stekelbaars:'stekelbaarzen',
    eekhoorn:'eekhoorns', bosmuis:'bosmuizen', rups:'rupsen', koolmees:'koolmezen', gras:'gras', klaver:'klaver', algen:'algen', waterplanten:'waterplanten', braam:'bramen',
    vos:'vossen', ooievaar:'ooievaars', buizerd:'buizerds', eend:'eenden', snoek:'snoeken', reiger:'reigers', sperwer:'sperwers', havik:'haviken', bosuil:'bosuilen', eik:'eiken' };
  /* "Alle konijnen verdwijnen", maar "Al het gras verdwijnt" */
  function verdwijn(n){ return n === 'gras' ? 'Al het gras verdwijnt' : n === 'klaver' ? 'Alle klaver verdwijnt' : 'Alle ' + MV[n] + ' verdwijnen'; }
  var HET = { gras:1, konijn:1 };
  var WEB = [
    { naam:'een weiland', pos:{ gras:[190, 270], klaver:[380, 270], sprinkhaan:[70, 190], veldmuis:[230, 190], konijn:[400, 190], kikker:[70, 110], ooievaar:[100, 30], vos:[280, 30], buizerd:[420, 30] },
      eet:[['gras', 'sprinkhaan'], ['gras', 'veldmuis'], ['gras', 'konijn'], ['klaver', 'konijn'], ['sprinkhaan', 'kikker'], ['kikker', 'ooievaar'], ['veldmuis', 'ooievaar'], ['veldmuis', 'vos'], ['konijn', 'vos'], ['veldmuis', 'buizerd'], ['konijn', 'buizerd']], prod:['gras', 'klaver'] },
    { naam:'een sloot', pos:{ algen:[120, 270], waterplanten:[350, 270], watervlo:[100, 190], slak:[330, 190], libellenlarve:[70, 110], stekelbaars:[230, 110], eend:[410, 110], snoek:[170, 30], reiger:[320, 30] },
      eet:[['algen', 'watervlo'], ['waterplanten', 'slak'], ['waterplanten', 'eend'], ['slak', 'eend'], ['watervlo', 'libellenlarve'], ['watervlo', 'stekelbaars'], ['libellenlarve', 'stekelbaars'], ['stekelbaars', 'snoek'], ['stekelbaars', 'reiger']], prod:['algen', 'waterplanten'] },
    { naam:'een bos', pos:{ eik:[180, 270], braam:[390, 270], rups:[60, 190], eekhoorn:[220, 190], bosmuis:[380, 190], koolmees:[60, 110], sperwer:[90, 30], havik:[230, 30], bosuil:[340, 30], vos:[440, 110] },
      eet:[['eik', 'rups'], ['eik', 'eekhoorn'], ['eik', 'bosmuis'], ['braam', 'bosmuis'], ['rups', 'koolmees'], ['koolmees', 'sperwer'], ['eekhoorn', 'havik'], ['bosmuis', 'bosuil'], ['bosmuis', 'vos']], prod:['eik', 'braam'] } ];
  function lw(n){ return (HET[n] ? 'het ' : 'de ') + n; }
  function wat(food, eater){ return food === 'eik' ? (eater === 'rups' ? 'eikenbladeren' : 'eikels') : MV[food] || food; }
  function bw(n){ return n.length * 7.6 + 18; }
  function webTeken(W, o){
    o = o || {};
    var s = svg(500, 300, 'voedselweb van ' + W.naam, 540);
    W.eet.forEach(function(e){
      var a = W.pos[e[0]], b = W.pos[e[1]], dx = b[0] - a[0], dy = b[1] - a[1];
      function rand(p, n, teken){ var hw = bw(n) / 2, hh = 14, t = Math.min(dx ? hw / Math.abs(dx) : 1e9, dy ? hh / Math.abs(dy) : 1e9); return [p[0] + teken * dx * t, p[1] + teken * dy * t]; }
      var p1 = rand(a, e[0], 1), p2 = rand(b, e[1], -1), nad = o.pijlen && o.pijlen.some(function(x){ return x[0] === e[0] && x[1] === e[1]; });
      s += pijl(p1[0], p1[1], p2[0], p2[1], nad ? 'var(--lr-2)' : 'var(--lr-1)', nad ? 3 : 2);
    });
    Object.keys(W.pos).forEach(function(n){
      var p = W.pos[n], w = bw(n), nad = o.nadruk && o.nadruk.indexOf(n) >= 0, weg = o.weg === n;
      s += '<rect x="' + r1(p[0] - w / 2) + '" y="' + (p[1] - 14) + '" width="' + r1(w) + '" height="28" rx="8" class="vak"' + (nad ? ' style="stroke:var(--lr-2);stroke-width:3"' : W.prod.indexOf(n) >= 0 ? ' style="stroke:var(--lr-4)"' : '') + '/>' + tekst(p[0], p[1] + 5, n, 'getal klein');
      if (weg) s += '<line x1="' + r1(p[0] - w / 2) + '" y1="' + (p[1] + 14) + '" x2="' + r1(p[0] + w / 2) + '" y2="' + (p[1] - 14) + '" class="boog" style="stroke:var(--lr-2);stroke-width:3"/>';
    });
    return s + '</svg>';
  }
  function ketenTeken(k, nad){
    var x = 10, s = '', ws = k.map(bw), W = som(ws) + (k.length - 1) * 40 + 20;
    k.forEach(function(n, i){
      s += '<rect x="' + r1(x) + '" y="12" width="' + r1(ws[i]) + '" height="30" rx="8" class="vak"' + (nad === i ? ' style="stroke:var(--lr-2);stroke-width:3"' : '') + '/>' + tekst(x + ws[i] / 2, 32, n, 'getal klein');
      x += ws[i];
      if (i < k.length - 1){ s += pijl(x + 5, 27, x + 35, 27); x += 40; }
    });
    return svg(W, 54, 'voedselketen: ' + k.join(', '), Math.min(560, W * 1.3)) + s + '</svg>';
  }
  function eters(W, n){ return W.eet.filter(function(e){ return e[0] === n; }).map(function(e){ return e[1]; }); }
  function voer(W, n){ return W.eet.filter(function(e){ return e[1] === n; }).map(function(e){ return e[0]; }); }
  function keten(R, W, min){
    for (var p = 0; p < 100; p++){
      var k = [R.kies(W.prod)];
      while (k.length < 4){ var e = eters(W, k[k.length - 1]); if (!e.length) break; k.push(R.kies(e)); if (R.heel(0, 3) === 0 && k.length >= (min || 3)) break; }
      if (k.length >= (min || 3)) return k;
    }
    return null;
  }
  var ROL = ['producent', 'consument van de 1e orde', 'consument van de 2e orde', 'consument van de 3e orde'];
  G.push({ groep:{ id:'bi-voedsel', niveau:'onderbouw', domein:'ecologie', naam:'Voedselketens en voedselwebben',
      uit:'Een voedselketen lezen en maken: wie is producent en wie consument. In een voedselweb tellen wie wie eet, en voorspellen wat er gebeurt als een soort verdwijnt.' },
    doelen:[
      { id:'bi-keten-rol', naam:'Producent of consument?', kort:'De producent staat vooraan; tel de pijlen vanaf de producent voor de orde van de consument',
        uit:'<p>Een <b>voedselketen</b> begint altijd bij een <b>producent</b>: een plant of alg die zelf voedsel maakt.</p><p>De pijl betekent: <b>wordt gegeten door</b>. Gras → konijn → vos: het gras wordt gegeten door het konijn.</p><p>Wie de producent eet, is <b>consument van de 1e orde</b>. Wie die eet, is consument van de 2e orde, en zo verder. Tel dus de pijlen vanaf de producent.</p>',
        wanneer:'je bij een voedselketen moet zeggen welke rol een organisme heeft.',
        maak:function(R){
          var W = R.kies(WEB), k = keten(R, W), i = R.heel(0, k.length - 1), n = k[i], b = function(m){ return ketenTeken(k, i); };
          var st = [kv('Maakt ' + lw(n) + ' zelf voedsel? Is het een plant of alg?', ['ja', 'nee'], i ? 1 : 0, i ? cap(lw(n)) + ' eet andere organismen.' : cap(lw(n)) + ' staat vooraan: het is een plant of alg.')];
          if (i) st.push({ tekst:'Hoeveel pijlen zitten er tussen de producent en ' + lw(n) + '?', antwoord:String(i), hint:'Tel vanaf ' + lw(k[0]) + ' de pijlen tot ' + lw(n) + ': ' + i + '.' });
          st.push(kv('Wat is ' + lw(n) + ' in deze voedselketen?', ROL, i, i ? i + ' pijl' + (i > 1 ? 'en' : '') + ' na de producent: consument van de ' + i + 'e orde.' : 'Wie zelf voedsel maakt, is de producent.'));
          return eindKeuze({ vraag:'Wat is ' + lw(n) + ' in deze voedselketen?', context:'Een voedselketen uit ' + W.naam + ': ' + k.join(' → ') + '.', beeld:b, zelfBeeld:b(0), stappen:st });
        } },
      { id:'bi-keten-maak', naam:'Een voedselketen maken', kort:'Begin bij de producent en zet steeds de eter erachter, met de pijl naar de eter',
        uit:'<p>Uit zinnen over wie wat eet, maak je een voedselketen.</p><p>Zoek eerst de <b>producent</b>: de plant of alg. Die zet je vooraan. Zoek dan wie de producent eet, en zet die erachter. Ga zo door.</p><p>De pijl wijst altijd <b>naar de eter</b>: gras → konijn.</p>',
        wanneer:'je een voedselketen moet opschrijven of tekenen.',
        maak:function(R){
          var W = R.kies(WEB), k = keten(R, W), zinnen = [];
          for (var i = 1; i < k.length; i++) zinnen.push('Een ' + k[i] + ' eet ' + wat(k[i - 1], k[i]) + '.');
          var st = [kz('Welk organisme is de producent?', k, k[0], 'De producent is de plant of alg: ' + lw(k[0]) + '.')];
          for (i = 1; i < k.length - 1; i++) st.push(kz('Wie eet ' + lw(k[i - 1]) + '?', k, k[i], 'Zoek de zin met "' + wat(k[i - 1], k[i]) + '": ' + lw(k[i]) + '.'));
          var goed = k.join(' → '), om = k.slice().reverse().join(' → '), wis = [k[1], k[0]].concat(k.slice(2)).join(' → ');
          st.push(kz('Welke voedselketen is goed?', [goed, om, wis], goed, 'Begin bij de producent, de pijl wijst naar wie eet: ' + goed + '.'));
          return eindKeuze({ vraag:'Welke voedselketen hoort bij deze zinnen?', context:T.hussel(zinnen).join(' '), beeld:function(n){ return n >= st.length ? ketenTeken(k) : ''; }, stappen:st });
        } },
      { id:'bi-web-tel', naam:'Wie eet wie in een voedselweb?', kort:'Pijlen naar een soort toe: wat hij eet; pijlen van hem af: wie hem eet',
        uit:'<p>Een <b>voedselweb</b> bestaat uit voedselketens die door elkaar lopen. Een soort kan meer dingen eten en door meer soorten gegeten worden.</p><p>Kijk naar één soort. De pijlen die <b>naar die soort toe</b> wijzen, komen van <b>wat hij eet</b>. De pijlen die <b>van hem af</b> gaan, wijzen naar <b>wie hem eet</b>.</p>',
        wanneer:'je een voedselweb moet lezen.',
        maak:function(R){
          var W = R.kies(WEB), eet = R.heel(0, 1), kand = Object.keys(W.pos).filter(function(n){ return (eet ? voer(W, n) : eters(W, n)).length > 0; }), n = R.kies(kand);
          var l = eet ? voer(W, n) : eters(W, n), b = function(m){ return webTeken(W, { nadruk:[n], pijlen:m >= 1 ? l.map(function(x){ return eet ? [x, n] : [n, x]; }) : [] }); };
          return { vraag:eet ? 'Van hoeveel soorten eet ' + lw(n) + '?' : 'Door hoeveel soorten wordt ' + lw(n) + ' gegeten?', context:'Het voedselweb van ' + W.naam + '. De pijl wijst van wie gegeten wordt naar wie eet.', beeld:b, zelfBeeld:b(0),
            stappen:[
              kv(eet ? 'Welke pijlen laten zien wat ' + lw(n) + ' eet?' : 'Welke pijlen laten zien door wie ' + lw(n) + ' gegeten wordt?', ['de pijlen naar ' + lw(n) + ' toe', 'de pijlen van ' + lw(n) + ' af'], eet ? 0 : 1, 'De pijl wijst altijd naar de eter.'),
              { tekst:'Tel die pijlen. Hoeveel soorten zijn het?', antwoord:String(l.length), hint:'Het zijn: ' + l.join(', ') + '.', fout:F((eet ? eters(W, n) : voer(W, n)).length || null, 'Je telde de pijlen de andere kant op.') } ] };
        } },
      { id:'bi-web-weg', naam:'Wat gebeurt er als een soort verdwijnt?', kort:'Wat hij at, neemt toe; wie hem at, neemt af',
        uit:'<p>Verdwijnt een soort uit een voedselweb, dan merken andere soorten dat.</p><p>Soorten die door hem <b>gegeten werden</b>, worden minder opgegeten. Die <b>nemen toe</b>.</p><p>Soorten die hem <b>aten</b>, hebben minder voedsel. Die <b>nemen af</b>.</p>',
        wanneer:'je moet voorspellen wat een verandering in een voedselweb doet.',
        maak:function(R){
          var W = R.kies(WEB), e = R.kies(W.eet), weg = R.heel(0, 1) ? e[0] : e[1], y = weg === e[0] ? e[1] : e[0], yEet = y === e[1];
          var b = webTeken(W, { weg:weg, nadruk:[y] });
          return eindKeuze({ vraag:verdwijn(weg) + '. Wat gebeurt er met ' + lw(y) + '?', context:'Het voedselweb van ' + W.naam + '. De pijl wijst van wie gegeten wordt naar wie eet.', beeld:b, zelfBeeld:b,
            stappen:[
              kv('Wat is het verband tussen ' + lw(weg) + ' en ' + lw(y) + '?', [cap(lw(y)) + ' eet ' + lw(weg) + '.', cap(lw(weg)) + ' eet ' + lw(y) + '.'], yEet ? 0 : 1, 'Kijk naar de pijl tussen de twee. Hij wijst naar de eter: ' + lw(yEet ? y : weg) + '.'),
              kv('Wat gebeurt er met ' + lw(y) + '?', ['neemt toe', 'neemt af'], yEet ? 1 : 0, yEet ? cap(lw(y)) + ' heeft minder voedsel: neemt af.' : cap(lw(y)) + ' wordt minder opgegeten: neemt toe.') ] });
        } }
    ] });

  /* ---------- rekenen in de ecologie ---------- */
  G.push({ groep:{ id:'bi-ecoreken', niveau:'bovenbouw', domein:'ecologie', naam:'Rekenen in de ecologie',
      uit:'Hoeveel energie naar de volgende schakel gaat, en hoe je de grootte van een populatie schat: met vangen, merken en terugvangen, of met proefvlakken.' },
    doelen:[
      { id:'bi-eco-energie', naam:'Energie in een voedselketen', kort:'Van elke schakel gaat ongeveer 10% van de energie naar de volgende',
        uit:'<p>Van alle energie in een schakel komt maar een klein deel in de volgende schakel. De rest gaat verloren als warmte, of wordt niet opgegeten of niet verteerd.</p><p>Als vuistregel rekenen we met <b>10%</b>: per schakel deel je de energie door 10.</p><p>Voorbeeld: de planten bevatten 100.000 kJ. De consumenten van de 1e orde krijgen 10.000 kJ, die van de 2e orde 1000 kJ.</p>',
        wanneer:'je wilt begrijpen waarom een voedselketen maar een paar schakels heeft.',
        maak:function(R){
          var E = R.kies([10000, 20000, 50000, 100000, 250000, 500000, 1000000]), n = R.heel(1, 3), st = [], e = E;
          for (var i = 1; i <= n; i++){ var vorig = e; e = rnd(e / 10, 3); st.push({ tekst:'Consument van de ' + i + 'e orde: 10% van de schakel ervoor is … kJ', antwoord:nv(e), eenheid:'kJ', hint:'10% van ' + tp(vorig) + ' = ' + tp(vorig) + ' : 10 = ' + tp(e) + ' kJ.' }); }
          if (n === 1) st.unshift(kv('Welk deel van de energie gaat naar de volgende schakel?', ['ongeveer 10%', 'ongeveer 50%', 'ongeveer 90%'], 0, 'De vuistregel is 10%.'));
          return { vraag:'Hoeveel energie komt bij de consument van de ' + n + 'e orde?', context:'De producenten in een voedselketen bevatten ' + tp(E) + ' kJ. Reken met 10% per schakel.', eenheid:'kJ', stappen:st };
        } },
      { id:'bi-eco-vangst', naam:'Vangen, merken en terugvangen', kort:'Populatie = gemerkt × tweede vangst : gemerkt teruggevangen',
        uit:'<p>Je kunt niet alle dieren in een gebied tellen. Daarom vang je er een aantal, je <b>merkt</b> ze en laat ze vrij.</p><p>Later vang je opnieuw. Het deel van de tweede vangst dat gemerkt is, is even groot als het deel van de hele populatie dat gemerkt is.</p><p>Populatie = <b>aantal gemerkt × aantal tweede vangst : aantal gemerkt in de tweede vangst</b>.</p>',
        wanneer:'je de grootte van een populatie dieren wilt schatten.',
        maak:function(R){
          var M = R.kies([20, 25, 30, 40, 50, 60, 80]), r = R.kies([2, 4, 5, 6, 8, 10]), k = R.kies([3, 4, 5, 6, 8, 10]), C = r * k, N = M * k;
          var dier = R.kies(['pissebedden in een tuin', 'kikkers in een vijver', 'veldmuizen in een weiland', 'loopkevers in een bos', 'slakken in een moestuin', 'vlinders in een veld']);
          return { vraag:'Hoe groot is de populatie ongeveer?', context:'Je vangt ' + M + ' ' + dier + ', merkt ze en laat ze vrij. Een week later vang je er ' + C + '. Daarvan zijn er ' + r + ' gemerkt.', eenheid:'dieren',
            stappen:[
              { tekst:'Van de tweede vangst is 1 op de … gemerkt.', antwoord:nv(k), hint:C + ' : ' + r + ' = ' + k + '. Dus 1 op de ' + k + '.' },
              { tekst:'Van de hele populatie is hetzelfde deel gemerkt. Vermenigvuldig het aantal gemerkte dieren daarmee. De populatie is dus … dieren.', antwoord:nv(N), eenheid:'dieren', hint:M + ' gemerkte dieren × ' + k + ' = ' + N + '.', fout:F(rnd(M * r / C, 3), 'Andersom: de populatie is groter dan het aantal gemerkte dieren.') } ] };
        } },
      { id:'bi-eco-kwadrant', naam:'Tellen in proefvlakken', kort:'Gemiddeld aantal per m² keer de oppervlakte',
        uit:'<p>Planten of langzame dieren tel je in een paar <b>proefvlakken</b> van 1 m². Zo hoef je niet het hele gebied te tellen.</p><p>Reken het <b>gemiddelde</b> per m² uit: tel alles op en deel door het aantal proefvlakken. Vermenigvuldig met de <b>oppervlakte</b> van het hele gebied.</p>',
        wanneer:'je wilt schatten hoeveel planten of dieren er in een gebied leven.',
        maak:function(R){
          var n = R.kies([4, 5]), g, l, s; do { l = []; for (var i = 0; i < n; i++) l.push(R.heel(2, 18)); s = som(l); } while (s % n);
          g = s / n; var A = R.kies([50, 120, 200, 250, 400, 600, 1000]), wat = R.kies(['paardenbloemen', 'madeliefjes', 'slakken', 'klavers', 'mierenhopen']);
          return { vraag:'Hoeveel ' + wat + ' zijn er ongeveer in het hele gebied?', context:'In ' + n + ' proefvlakken van 1 m² tel je: ' + l.join(', ') + '. Het gebied is ' + A + ' m².', eenheid:wat,
            stappen:[
              { tekst:'Tel alle getallen op. Samen zijn dat …', antwoord:nv(s), hint:l.join(' + ') + ' = ' + s + '.' },
              { tekst:'Deel door het aantal proefvlakken. Gemiddeld per m² is dat …', antwoord:nv(g), hint:s + ' : ' + n + ' = ' + g + '.' },
              { tekst:'Keer de oppervlakte. In het hele gebied zijn het er ongeveer …', antwoord:nv(g * A), eenheid:wat, hint:g + ' × ' + A + ' = ' + tp(g * A) + '.', fout:F(s * A, 'Gebruik het gemiddelde per m², niet de som.') } ] };
        } }
    ] });

  /* ---------- erfelijkheid ---------- */
  var EIG = [
    { org:'erwtenplant', jong:'nakomelingen', L:'G', dom:'gele zaden', rec:'groene zaden' },
    { org:'erwtenplant', jong:'nakomelingen', L:'R', dom:'ronde zaden', rec:'gerimpelde zaden' },
    { org:'tomatenplant', jong:'nakomelingen', L:'R', dom:'rode tomaten', rec:'gele tomaten' },
    { org:'cavia', jong:'jongen', L:'A', dom:'een zwarte vacht', rec:'een witte vacht' },
    { org:'muis', jong:'jongen', L:'B', dom:'een zwarte vacht', rec:'een bruine vacht' },
    { org:'fruitvlieg', jong:'nakomelingen', L:'N', dom:'normale vleugels', rec:'stompe vleugels' },
    { org:'fruitvlieg', jong:'nakomelingen', L:'G', dom:'een grijs lichaam', rec:'een zwart lichaam' },
    { org:'mens', jong:'kinderen', L:'A', dom:'een normale huidskleur', rec:'albinisme' } ];
  function allel(E){ return { A:E.L, a:E.L.toLowerCase() }; }
  function geno(E, n){ var a = allel(E); return n === 2 ? a.A + a.A : n === 1 ? a.A + a.a : a.a + a.a; }     /* n = aantal dominante allelen */
  function gameten(E, n){ var a = allel(E); return n === 2 ? [a.A, a.A] : n === 1 ? [a.A, a.a] : [a.a, a.a]; }
  function gamOpt(E){ var a = allel(E); return ['alleen ' + a.A, 'alleen ' + a.a, a.A + ' en ' + a.a + ', elk de helft']; }
  function gamGoed(n){ return n === 2 ? 0 : n === 0 ? 1 : 2; }
  function cel2(x, y){ return x < y ? x + y : y + x; }   /* hoofdletter eerst: 'G' < 'g' */
  function punnett(E, p1, p2, o){
    o = o || {};
    var g1 = gameten(E, p1), g2 = gameten(E, p2), rijen = [[o.kop ? '' : '', o.boven ? g1[0] : '?', o.boven ? g1[1] : '?']], nad = [];
    for (var r = 0; r < 2; r++){
      var rij = [o.zij ? g2[r] : '?'];
      for (var c = 0; c < 2; c++){ var gt = cel2(g1[c], g2[r]); rij.push(o.cellen ? gt : '?'); if (o.cellen && o.markeer && o.markeer(gt)) nad.push([r + 1, c + 1]); }
      rijen.push(rij);
    }
    return T.teken.tabel(rijen, { kop:true, zijkop:true, nadruk:nad });
  }
  function isDom(E, gt){ return gt.indexOf(E.L) >= 0; }
  function heeft(E, dom){ return dom ? E.dom : E.rec; }
  function lijdw(o){ return o === 'mens' ? 'een persoon' : 'een ' + o; }
  G.push({ groep:{ id:'bi-erf', niveau:'bovenbouw', domein:'erfelijkheid', naam:'Erfelijkheid',
      uit:'Genotype en fenotype, dominant en recessief, geslachtscellen, het kruisingsschema en de verhouding van de nakomelingen. Ook terugredeneren naar de ouders en kruisingen met een gen op het X-chromosoom.' },
    doelen:[
      { id:'bi-erf-feno', naam:'Van genotype naar fenotype', kort:'Zit er een dominant allel in, dan zie je het dominante kenmerk',
        uit:'<p>Van elk gen heb je <b>twee allelen</b>: een van je vader en een van je moeder. Samen heten ze het <b>genotype</b>, bijvoorbeeld Gg. Wat je ervan ziet, is het <b>fenotype</b>.</p><p>Zijn de twee allelen gelijk (GG of gg), dan is het genotype <b>homozygoot</b>. Zijn ze verschillend (Gg), dan <b>heterozygoot</b>.</p><p>Een <b>dominant</b> allel (hoofdletter) is altijd te zien. Een <b>recessief</b> allel (kleine letter) zie je alleen als er twee zijn: gg.</p>',
        wanneer:'je bij een genotype wilt zeggen wat je ziet.',
        maak:function(R){
          var E = R.kies(EIG), n = R.heel(0, 2), gt = geno(E, n), a = allel(E);
          return eindKeuze({ vraag:'Welk fenotype hoort bij ' + gt + '?', context:'Bij ' + lijdw(E.org) + ' is ' + a.A + ' het allel voor ' + E.dom + ' (dominant) en ' + a.a + ' het allel voor ' + E.rec + ' (recessief).',
            stappen:[
              kv('Is het genotype ' + gt + ' homozygoot of heterozygoot?', ['homozygoot', 'heterozygoot'], n === 1 ? 1 : 0, n === 1 ? 'De twee letters zijn verschillend: heterozygoot.' : 'De twee letters zijn gelijk: homozygoot.'),
              kv('Zit er een dominant allel (' + a.A + ') in?', ['ja', 'nee'], n ? 0 : 1, n ? 'Er staat een hoofdletter ' + a.A + ' in.' : 'Er staan alleen kleine letters in.'),
              kv('Welk fenotype heeft ' + lijdw(E.org) + ' met ' + gt + '?', [E.dom, E.rec], n ? 0 : 1, n ? 'Een dominant allel is altijd te zien: ' + E.dom + '.' : 'Twee recessieve allelen: ' + E.rec + '.') ] });
        } },
      { id:'bi-erf-geno', naam:'Van fenotype naar genotype', kort:'Recessief fenotype: altijd twee kleine letters; dominant: twee mogelijkheden',
        uit:'<p>Zie je het <b>recessieve</b> kenmerk, dan weet je het genotype zeker: twee kleine letters, bijvoorbeeld gg.</p><p>Zie je het <b>dominante</b> kenmerk, dan zijn er twee mogelijkheden: GG of Gg. Aan het fenotype zie je niet welke het is.</p>',
        wanneer:'je bij een kenmerk dat je ziet het genotype wilt bepalen.',
        maak:function(R){
          var E = R.kies(EIG), dom = R.heel(0, 1), a = allel(E), opt = [geno(E, 2), geno(E, 1), geno(E, 0), geno(E, 2) + ' of ' + geno(E, 1)];
          return eindKeuze({ vraag:'Welk genotype kan ' + lijdw(E.org) + ' met ' + heeft(E, dom) + ' hebben?', context:a.A + ' = ' + E.dom + ' (dominant), ' + a.a + ' = ' + E.rec + ' (recessief).',
            stappen:[
              kv('Is ' + heeft(E, dom) + ' het dominante of het recessieve fenotype?', ['dominant', 'recessief'], dom ? 0 : 1, 'Kijk wat er achter ' + (dom ? a.A : a.a) + ' staat.'),
              kv('Welk genotype kan het zijn?', opt, dom ? 3 : 2, dom ? 'Eén dominant allel is genoeg om het te zien: ' + opt[3] + '.' : 'Een recessief kenmerk zie je alleen met twee recessieve allelen: ' + opt[2] + '.') ] });
        } },
      { id:'bi-erf-gameet', naam:'Welke geslachtscellen?', kort:'In een geslachtscel komt één allel van elk gen',
        uit:'<p>Bij het maken van <b>geslachtscellen</b> (eicellen en zaadcellen) gaan de twee allelen uit elkaar. In elke geslachtscel komt <b>één allel</b>.</p><p>Bij GG zijn alle geslachtscellen G. Bij gg zijn ze allemaal g. Bij <b>Gg</b> is de helft G en de helft g.</p>',
        wanneer:'je een kruisingsschema gaat maken.',
        maak:function(R){
          var E = R.kies(EIG), n = R.heel(0, 2), gt = geno(E, n);
          return eindKeuze({ vraag:'Welke geslachtscellen maakt ' + lijdw(E.org) + ' met genotype ' + gt + '?',
            stappen:[
              kv('Hoeveel allelen van dit gen komen in één geslachtscel?', ['één', 'twee'], 0, 'De twee allelen gaan uit elkaar: één per geslachtscel.'),
              kv('Welke geslachtscellen zijn er?', gamOpt(E), gamGoed(n), n === 1 ? 'Het ene allel is ' + gt.charAt(0) + ', het andere ' + gt.charAt(1) + ': de helft van elk.' : 'Beide allelen zijn ' + gt.charAt(0) + ': alleen ' + gt.charAt(0) + '.') ] });
        } },
      { id:'bi-erf-schema', naam:'Een kruisingsschema invullen', kort:'Geslachtscellen van de ene ouder boven, van de andere links; combineer ze in de vakjes',
        uit:'<p>Met een <b>kruisingsschema</b> zie je welke nakomelingen er kunnen komen.</p><p>Zet de geslachtscellen van de ene ouder <b>bovenaan</b> en die van de andere ouder <b>links</b>. Combineer in elk vakje de letter van boven met de letter links.</p><p>Elk vakje is een even grote kans: <b>25%</b>. Tel de vakjes met het kenmerk dat je zoekt.</p>',
        wanneer:'je wilt voorspellen hoe de nakomelingen van twee ouders eruitzien.',
        maak:function(R){
          var E = R.kies(EIG), kr = R.kies([[2, 0], [1, 1], [1, 1], [1, 0], [0, 1], [2, 1], [1, 2]]), p1 = kr[0], p2 = kr[1], dom = R.heel(0, 1), a = allel(E);
          var g1 = gameten(E, p1), g2 = gameten(E, p2), cellen = [cel2(g1[0], g2[0]), cel2(g1[1], g2[0]), cel2(g1[0], g2[1]), cel2(g1[1], g2[1])];
          var aantal = cellen.filter(function(c){ return isDom(E, c) === !!dom; }).length;
          var b = function(n){ return punnett(E, p1, p2, { boven:n >= 1, zij:n >= 2, cellen:n >= 2, markeer:n >= 3 ? function(gt){ return isDom(E, gt) === !!dom; } : null }); };
          return { vraag:'Hoeveel procent van de ' + E.jong + ' heeft ' + heeft(E, dom) + '?', context:'Je kruist ' + lijdw(E.org) + ' met genotype ' + geno(E, p1) + ' met ' + lijdw(E.org) + ' met genotype ' + geno(E, p2) + '. ' + a.A + ' = ' + E.dom + ' (dominant), ' + a.a + ' = ' + E.rec + '.',
            beeld:b, zelfBeeld:b(0), eenheid:'%',
            stappen:[
              kv('Welke geslachtscellen maakt de ouder met ' + geno(E, p1) + '? Die komen bovenaan.', gamOpt(E), gamGoed(p1), 'Eén allel per geslachtscel: ' + gamOpt(E)[gamGoed(p1)] + '.'),
              kv('Welke geslachtscellen maakt de ouder met ' + geno(E, p2) + '? Die komen links.', gamOpt(E), gamGoed(p2), 'Eén allel per geslachtscel: ' + gamOpt(E)[gamGoed(p2)] + '.'),
              { tekst:'Combineer in elk vakje boven en links. In hoeveel van de vier vakjes zie je ' + heeft(E, dom) + '?', antwoord:String(aantal),
                hint:dom ? 'Tel de vakjes met minstens één ' + a.A + '.' : 'Tel de vakjes met twee keer ' + a.a + '.' },
              { tekst:'Elk vakje is 25%. Hoeveel procent is dat?', antwoord:pv(aantal * 25), eenheid:'%', hint:aantal + ' × 25% = ' + aantal * 25 + '%.' } ] };
        } },
      { id:'bi-erf-verh', naam:'De verhouding van de nakomelingen', kort:'Tel de vakjes per fenotype: dominant staat voor, recessief achter',
        uit:'<p>In een kruisingsschema tel je hoeveel vakjes elk <b>genotype</b> hebben. Daaruit volgt de <b>fenotypeverhouding</b>.</p><p>Bij Gg × Gg krijg je 1 GG, 2 Gg en 1 gg. GG en Gg zien er hetzelfde uit (dominant). De fenotypeverhouding is dus <b>3 : 1</b>.</p><p>Bij Gg × gg krijg je 2 Gg en 2 gg: de verhouding is <b>1 : 1</b>.</p>',
        wanneer:'je wilt voorspellen in welke verhouding de kenmerken bij de nakomelingen voorkomen.',
        maak:function(R){
          var E = R.kies(EIG), kr = R.kies([[1, 1], [1, 1], [1, 0], [0, 1]]), p1 = kr[0], p2 = kr[1], a = allel(E);
          var g1 = gameten(E, p1), g2 = gameten(E, p2), cellen = [cel2(g1[0], g2[0]), cel2(g1[1], g2[0]), cel2(g1[0], g2[1]), cel2(g1[1], g2[1])];
          var nAA = cellen.filter(function(c){ return c === geno(E, 2); }).length, nAa = cellen.filter(function(c){ return c === geno(E, 1); }).length, naa = cellen.filter(function(c){ return c === geno(E, 0); }).length;
          var d = nAA + nAa, r = naa, ver = d === 3 ? '3 : 1' : '1 : 1', vv = d === 3 ? ['3 : 1', '3:1', '3 op 1'] : ['1 : 1', '1:1', '1 op 1', '2 : 2', '2:2'];
          var b = punnett(E, p1, p2, { boven:true, zij:true, cellen:true });
          return { vraag:'Wat is de fenotypeverhouding ' + E.dom + ' : ' + E.rec + '?', context:'Je kruist ' + geno(E, p1) + ' met ' + geno(E, p2) + '. Het kruisingsschema staat hieronder. ' + a.A + ' = ' + E.dom + ' (dominant).', beeld:b, zelfBeeld:b,
            stappen:[
              { tekst:'Hoeveel vakjes hebben ' + geno(E, 2) + '?', antwoord:String(nAA), hint:'Zoek vakjes met twee hoofdletters: ' + nAA + '.' },
              { tekst:'Hoeveel vakjes hebben ' + geno(E, 1) + '?', antwoord:String(nAa), hint:'Zoek vakjes met een hoofdletter en een kleine letter: ' + nAa + '.' },
              { tekst:'Hoeveel vakjes hebben ' + geno(E, 0) + '?', antwoord:String(naa), hint:'Zoek vakjes met twee kleine letters: ' + naa + '.' },
              { tekst:geno(E, 2) + ' en ' + geno(E, 1) + ' hebben allebei ' + E.dom + '. De verhouding ' + E.dom + ' : ' + E.rec + ' is …', antwoord:vv, invoer:'tekst', hint:(nAA + nAa) + ' vakjes dominant en ' + naa + ' recessief: ' + ver + '.', fout:F('1 : 2 : 1', 'Dat is de genotypeverhouding. Tel ' + geno(E, 2) + ' en ' + geno(E, 1) + ' samen.', '1:2:1', 'Dat is de genotypeverhouding. Tel ' + geno(E, 2) + ' en ' + geno(E, 1) + ' samen.', '1:3', 'Andersom: het dominante fenotype staat voor.') } ] };
        } },
      { id:'bi-erf-ouders', naam:'Terugredeneren naar de ouders', kort:'Een nakomeling met het recessieve kenmerk kreeg van elke ouder een recessief allel',
        uit:'<p>Soms weet je het fenotype van de ouders en van een nakomeling, en wil je de genotypen van de ouders weten.</p><p>Heeft een nakomeling het <b>recessieve</b> kenmerk, dan is zijn genotype bijvoorbeeld gg. Hij kreeg dus van <b>elke ouder een g</b>.</p><p>Heeft een ouder het dominante kenmerk en gaf hij toch een g door? Dan is die ouder <b>heterozygoot</b>: Gg.</p>',
        wanneer:'je bij een stamboom of een kruising het genotype van de ouders zoekt.',
        maak:function(R){
          var E = R.kies(EIG), a = allel(E), AA = geno(E, 2), Aa = geno(E, 1), aa = geno(E, 0), beide = R.heel(0, 1), kind = E.org === 'mens' ? 'kind' : 'nakomeling';
          var ouders = E.org === 'mens' ? 'twee ouders' : 'twee ' + (E.org === 'muis' ? 'muizen' : E.org === 'cavia' ? "cavia's" : E.org === 'fruitvlieg' ? 'fruitvliegen' : E.org + 'en');
          var st = [kv('Welk genotype heeft de ' + kind + ' met ' + E.rec + '?', [AA, Aa, aa], 2, cap(E.rec) + ' is recessief: twee kleine letters, ' + aa + '.'),
            kv('Van wie kreeg de ' + kind + ' de twee allelen ' + a.a + '?', ['één van elke ouder', 'allebei van één ouder'], 0, 'Van elke ouder krijg je één allel.')];
          if (beide){
            st.push(kv('Welk genotype hebben de ouders?', ['allebei ' + AA, 'allebei ' + Aa, 'de een ' + AA + ', de ander ' + Aa], 1, 'Ze hebben ' + E.dom + ', dus minstens één ' + a.A + '. Ze gaven ook allebei een ' + a.a + ' door: ' + Aa + '.'));
            return eindKeuze({ vraag:'Welk genotype hebben de ouders?', context:'Van ' + ouders + ' met ' + E.dom + ' heeft een ' + kind + ' ' + E.rec + '. ' + a.A + ' = ' + E.dom + ' (dominant), ' + a.a + ' = ' + E.rec + '.', stappen:st });
          }
          st.push(kv('Welk genotype heeft de ouder met ' + E.dom + '?', [AA, Aa, aa], 1, 'Deze ouder heeft ' + E.dom + ' (een ' + a.A + ') en gaf een ' + a.a + ' door: ' + Aa + '.'));
          return eindKeuze({ vraag:'Welk genotype heeft de ouder met ' + E.dom + '?', context:'Een ouder met ' + E.dom + ' en een ouder met ' + E.rec + ' krijgen een ' + kind + ' met ' + E.rec + '. ' + a.A + ' = ' + E.dom + ' (dominant), ' + a.a + ' = ' + E.rec + '.', stappen:st });
        } },
      { id:'bi-erf-x', naam:'Een gen op het X-chromosoom', kort:'Een zoon krijgt zijn X van zijn moeder; heeft die X het recessieve allel, dan heeft hij het kenmerk',
        uit:'<p>Sommige genen liggen op het <b>X-chromosoom</b>. Een vrouw heeft XX, een man XY. Op het Y-chromosoom ligt dit gen niet.</p><p>Een <b>zoon</b> krijgt zijn X altijd van zijn <b>moeder</b> en zijn Y van zijn vader. Heeft zijn X het recessieve allel, dan heeft hij het kenmerk: er is geen tweede X om het te verbergen.</p><p>Je schrijft het allel klein boven de X: X<sup>H</sup> en X<sup>h</sup>. In het kruisingsschema zet je de geslachtscellen van de vader bovenaan en die van de moeder links.</p>',
        wanneer:'je kruisingen maakt met kleurenblindheid of hemofilie.',
        maak:function(R){
          var K = R.kies([{ L:'H', a:'normale bloedstolling', z:'hemofilie', bn:'hemofilie heeft', kind:'heeft het kind hemofilie', mv:'hebben hemofilie' }, { L:'N', a:'normaal kleuren zien', z:'kleurenblind', bn:'kleurenblind is', kind:'is het kind kleurenblind', mv:'zijn kleurenblind' }]);
          var kr = R.kies([[[1, 0], 1], [[1, 0], 0], [[1, 1], 0], [[0, 0], 1]]), m = kr[0], v = kr[1], vraag = R.kies(['zoon', 'zoon', 'kind', 'dochter']);
          function X(d){ return 'X<sup>' + (d ? K.L : K.L.toLowerCase()) + '</sup>'; }
          if (vraag === 'dochter' && !(m[0] === 0 || m[1] === 0) ) vraag = 'zoon';
          var vk = [X(v), 'Y'], cel = [], ziek = 0, zonen = 0, zz = 0, dochters = 0, dz = 0;
          for (var r = 0; r < 2; r++) for (var c = 0; c < 2; c++){
            var zoon = c === 1, z = zoon ? !m[r] : (!m[r] && !v);
            cel.push(zoon ? X(m[r]) + 'Y' : X(m[r]) + X(v)); if (z) ziek++; if (zoon){ zonen++; if (z) zz++; } else { dochters++; if (z) dz++; }
          }
          var b = function(n){ return T.teken.tabel([['', vk[0], vk[1]], [X(m[0]), n >= 1 ? cel[0] : '?', n >= 1 ? cel[1] : '?'], [X(m[1]), n >= 1 ? cel[2] : '?', n >= 1 ? cel[3] : '?']], { kop:true, zijkop:true, html:true }); };
          var moeder = 'De moeder is ' + X(m[0]) + X(m[1]) + ', de vader is ' + X(v) + 'Y.';
          var st = [{ tekst:'Vul het schema in: combineer in elk vakje de geslachtscel boven met die links.', info:true }], pct;
          if (vraag === 'kind'){
            pct = ziek * 25;
            st.push({ tekst:'In hoeveel van de vier vakjes ' + K.kind + '?', antwoord:String(ziek), hint:'Een dochter heeft het als ze twee keer ' + X(0).replace(/<[^>]+>/g, '') + ' heeft, een zoon met één. Het zijn er ' + ziek + '.' });
            st.push({ tekst:'Elk vakje is 25%. Hoe groot is de kans in procenten?', antwoord:pv(pct), eenheid:'%', hint:ziek + ' × 25% = ' + pct + '%.' });
          } else {
            var tot = vraag === 'zoon' ? zonen : dochters, aan = vraag === 'zoon' ? zz : dz; pct = aan / tot * 100;
            st.push({ tekst:'Hoeveel van de vier vakjes zijn een ' + vraag + '?', antwoord:String(tot), hint:vraag === 'zoon' ? 'Zonen hebben een Y: de rechter kolom, ' + tot + ' vakjes.' : 'Dochters hebben twee X: de linker kolom, ' + tot + ' vakjes.' });
            st.push({ tekst:'Hoeveel van die ' + (vraag === 'zoon' ? 'zonen' : 'dochters') + ' ' + K.mv + '?', antwoord:String(aan), hint:vraag === 'zoon' ? 'Een zoon heeft het als zijn X het kleine letter-allel heeft: ' + aan + '.' : 'Een dochter heeft het alleen met twee keer de kleine letter: ' + aan + '.' });
            st.push({ tekst:'Hoe groot is de kans voor een ' + vraag + ', in procenten?', antwoord:pv(pct), eenheid:'%', hint:aan + ' van de ' + tot + ' = ' + pct + '%.', fout:F(aan * 25, 'Reken alleen met de ' + (vraag === 'zoon' ? 'zonen' : 'dochters') + ': ' + aan + ' van de ' + tot + '.') });
          }
          return { vraag:'Hoe groot is de kans dat een ' + vraag + ' ' + K.bn + '?', vraagHtml:'Hoe groot is de kans dat een ' + vraag + ' ' + K.bn + '?',
            context:X(1) + ' = ' + K.a + ' (dominant), ' + X(0) + ' = ' + K.z + ' (recessief). ' + moeder, beeld:b, zelfBeeld:b(0), eenheid:'%', stappen:st };
        } }
    ] });

  /* ---------- het lichaam ---------- */
  var BMI = [[0, 18.5, 'ondergewicht'], [18.5, 25, 'gezond gewicht'], [25, 30, 'overgewicht'], [30, 99, 'ernstig overgewicht']];
  G.push({ groep:{ id:'bi-lichaam', niveau:'bovenbouw', domein:'lichaam', naam:'Rekenen aan het lichaam',
      uit:'De hartslag per minuut uit een korte telling, hoeveel bloed het hart per minuut rondpompt, en de BMI van een volwassene uitrekenen en beoordelen.' },
    doelen:[
      { id:'bi-lich-pols', naam:'De hartslag per minuut', kort:'Tel een deel van een minuut en vermenigvuldig tot 60 seconden',
        uit:'<p>Je meet je <b>hartslag</b> door je pols te voelen. Je hoeft niet een hele minuut te tellen.</p><p>Tel bijvoorbeeld <b>15 seconden</b>. In een minuut passen 4 keer 15 seconden. Vermenigvuldig dus met <b>4</b>. Tel je 20 seconden, dan keer 3. Tel je 10 seconden, dan keer 6.</p>',
        wanneer:'je je hartslag meet in rust of na het sporten.',
        maak:function(R){
          var t = R.kies([10, 15, 20, 30]), f = 60 / t, hs; do { hs = R.heel(55, 180); } while (hs % f);
          var c = hs / f;
          return { vraag:'Wat is de hartslag per minuut?', context:'Je telt je pols ' + t + ' seconden lang. Je telt ' + c + ' slagen.', eenheid:'slagen per minuut',
            stappen:[
              { tekst:'Hoe vaak past ' + t + ' seconden in een minuut?', antwoord:String(f), hint:'60 : ' + t + ' = ' + f + '.' },
              { tekst:'Vermenigvuldig de ' + c + ' slagen daarmee. Per minuut is dat …', antwoord:nv(hs), eenheid:'slagen per minuut', hint:c + ' × ' + f + ' = ' + hs + '.' } ] };
        } },
      { id:'bi-lich-minuut', naam:'Het hartminuutvolume', kort:'Slagvolume × hartslag = bloed per minuut',
        uit:'<p>Bij elke slag pompt het hart een hoeveelheid bloed weg: het <b>slagvolume</b>, in mL.</p><p>Het <b>hartminuutvolume</b> is hoeveel bloed het hart per minuut wegpompt: <b>slagvolume × hartslag</b>. Deel door 1000 voor liters.</p><p>Bij sport stijgen de hartslag en het slagvolume allebei.</p>',
        wanneer:'je wilt begrijpen hoeveel bloed er in rust en bij sport rondgaat.',
        maak:function(R){
          var sport = R.heel(0, 1), sv = sport ? R.kies([100, 110, 120, 125, 130]) : R.kies([60, 65, 70, 75, 80, 90]), hf = sport ? R.kies([120, 140, 150, 160, 180]) : R.kies([60, 64, 70, 72, 75, 80]), ml = sv * hf, l = ml / 1000;
          return { vraag:'Hoeveel liter bloed pompt het hart per minuut?', context:(sport ? 'Tijdens het sporten' : 'In rust') + ' is het slagvolume ' + sv + ' mL en de hartslag ' + hf + ' slagen per minuut.', eenheid:'liter',
            stappen:[
              { tekst:'Slagvolume × hartslag: ' + sv + ' × ' + hf + ' = … mL', antwoord:nv(ml), eenheid:'mL', hint:sv + ' × ' + hf + ' = ' + tp(ml) + ' mL.' },
              { tekst:'Van mL naar liter: deel door 1000. Dat is … liter', antwoord:nv(l), eenheid:'liter', hint:tp(ml) + ' : 1000 = ' + tn(l) + ' liter.' } ] };
        } },
      { id:'bi-lich-bmi', naam:'De BMI van een volwassene', kort:'BMI = gewicht : (lengte × lengte); 18,5 tot 25 is een gezond gewicht',
        uit:'<p>De <b>BMI</b> (Body Mass Index) zegt of het gewicht van een <b>volwassene</b> past bij zijn lengte. Voor kinderen en jongeren gelden andere grenzen.</p><p>BMI = <b>gewicht in kg : (lengte in m × lengte in m)</b>.</p><p>Onder 18,5 is ondergewicht. Van 18,5 tot 25 is een <b>gezond gewicht</b>. Van 25 tot 30 is overgewicht. 30 of hoger is ernstig overgewicht.</p>',
        wanneer:'je de BMI van een volwassene wilt uitrekenen en beoordelen.',
        maak:function(R){
          var l, kg, bmi, k; do { l = R.kies([1.5, 1.6, 1.7, 1.8, 1.9]); kg = R.heel(45, 120); bmi = rnd(kg / (l * l), 1); }
          while (bmi < 16 || bmi > 40 || BMI.some(function(g){ return Math.abs(bmi - g[0]) < 0.6 && g[0] > 0; }));
          k = BMI.filter(function(g){ return bmi >= g[0] && bmi < g[1]; })[0][2];
          var l2 = rnd(l * l, 2);
          return eindKeuze({ vraag:'Wat is de BMI, en wat betekent die?', context:'Een volwassene is ' + tn(l) + ' m lang en weegt ' + kg + ' kg.',
            stappen:[
              { tekst:'Lengte × lengte: ' + tn(l) + ' × ' + tn(l) + ' = …', antwoord:nv(l2), hint:tn(l) + ' × ' + tn(l) + ' = ' + tn(l2) + '.' },
              { tekst:'Gewicht gedeeld door die uitkomst, op één decimaal: de BMI is …', antwoord:nv(bmi), hint:kg + ' : ' + tn(l2) + ' = ' + tn(bmi) + '.', fout:F(rnd(kg / l, 1), 'Deel door lengte × lengte, niet door de lengte.') },
              kv('Wat betekent een BMI van ' + tn(bmi) + '?', BMI.map(function(g){ return g[2]; }), BMI.map(function(g){ return g[2]; }).indexOf(k), 'Kijk tussen welke grenzen ' + tn(bmi) + ' ligt: 18,5, 25 en 30.') ] });
        } }
    ] });

  LEERROUTE.voeg('biologie', G);
})();
