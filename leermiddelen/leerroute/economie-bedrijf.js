/* De leerroute economie, bedrijf en markt: vaste en variabele kosten, omzet, totale kosten,
   winst, gemiddelde kosten, het break-evenpunt (rekenen en aflezen), afzet voor een gewenste
   winst, vraag en aanbod in een tabel, evenwicht uit twee lijnen, maximum- en minimumprijs,
   en marktaandeel. Alle bedrijven en getallen zijn verzonnen. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, X = '×', MIN = '−', G = [];

  /* ---------- rekenhulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function tp(x){ return T.toon(x, { punt:true }); }
  function rond(x, d){ var f = Math.pow(10, d); return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * f) / f; }
  function r2(x){ return rond(x, 2); }
  function r1(x){ return rond(x, 1); }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function eu(x){ return '€ ' + T.toon(r2(x), { dec:2, vast:true, punt:true }); }
  function kaal(x){ return T.toon(r2(x), { dec:2, vast:true, punt:true }); }
  function bedr(x){ x = r2(x); return uniek([T.toon(x, { dec:2, vast:true, punt:true }), T.toon(x, { dec:2, vast:true }), tn(x)]); }
  function aant(x){ return uniek([tp(x), String(x)]); }
  function pc(p){ var t = tn(p); return [t, t + '%', t + ' %']; }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function FB(x, tekst, o){ o = o || {}; bedr(x).concat(['€ ' + T.toon(r2(x), { dec:2, vast:true })]).forEach(function(k){ o[k.toLowerCase()] = tekst; }); return o; }
  function FA(x, tekst, o){ o = o || {}; aant(x).forEach(function(k){ o[k.toLowerCase()] = tekst; }); return o; }
  function K(R, t, goed, fout, hint, extra){
    var lijst = [goed], gezien = {}; gezien[String(goed).toLowerCase()] = 1;
    fout.forEach(function(f){ if (f == null) return; var k = String(f).toLowerCase(); if (!gezien[k]){ gezien[k] = 1; lijst.push(f); } });
    var opties = R.hussel(lijst), s = { tekst:t, opties:opties, goed:opties.indexOf(goed), hint:hint };
    if (extra){ if (extra.waarom) s.waarom = extra.waarom; if (extra.fout){ s.fout = {}; for (var k in extra.fout) s.fout[k.toLowerCase()] = extra.fout[k]; } }
    return s;
  }
  function OP(o){ var s = o.stappen[o.stappen.length - 1]; if (s.opties){ o.opties = s.opties; o.goed = s.goed; } return o; }
  /* een compacte tabel die ook op een telefoon past: { kop, zijkop, nadruk:[[r,c]], html } */
  function ktabel(rijen, o){
    o = o || {}; var nad = {}; (o.nadruk || []).forEach(function(q){ nad[q[0] + ',' + q[1]] = 1; });
    return '<table class="lr-tabel" style="font-size:.85rem;border-spacing:3px">' + rijen.map(function(r, ri){
      return '<tr>' + r.map(function(c, ci){ var t = (o.kop && ri === 0) || (o.zijkop && ci === 0) ? 'th' : 'td';
        return '<' + t + ' style="padding:5px 8px;min-width:0"' + (nad[ri + ',' + ci] ? ' class="nadruk"' : '') + '>' + (c === '?' ? '<b class="lr-vraagt">?</b>' : (o.html ? c : T.schoon(c))) + '</' + t + '>'; }).join('') + '</tr>';
    }).join('') + '</table>';
  }
  function hoofd(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- een grafiek met rechte lijnen ----------
     o: { xmax, ymax, xstap, ystap, xnaam, ynaam, xtoon, ytoon, lijnen:[{ a:[x,y], b:[x,y], k, naam, bij:[x,y] }],
          punt:{ x, y }, gids:true (stippellijnen naar de assen) } */
  function grafiek(o){
    var W = 600, H = 370, L = 84, Rr = 560, Tp = 30, B = 300;
    function sx(x){ return Math.round((L + x / o.xmax * (Rr - L)) * 10) / 10; }
    function sy(y){ return Math.round((B - y / o.ymax * (B - Tp)) * 10) / 10; }
    var xt = o.xtoon || tp, yt = o.ytoon || tp, x, y;
    var s = '<svg class="lr-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + T.schoon(o.aria || 'grafiek') + '">';
    for (x = 0; x <= o.xmax + 1e-9; x += o.xstap){ var xx = rond(x, 6);
      s += '<line x1="' + sx(xx) + '" y1="' + Tp + '" x2="' + sx(xx) + '" y2="' + B + '" class="as dun"/>';
      s += '<text x="' + sx(xx) + '" y="' + (B + 20) + '" class="getal klein">' + T.schoon(xt(xx)) + '</text>'; }
    for (y = 0; y <= o.ymax + 1e-9; y += o.ystap){ var yy = rond(y, 6);
      s += '<line x1="' + L + '" y1="' + sy(yy) + '" x2="' + Rr + '" y2="' + sy(yy) + '" class="as dun"/>';
      s += '<text x="' + (L - 8) + '" y="' + (sy(yy) + 5) + '" class="getal klein" style="text-anchor:end">' + T.schoon(yt(yy)) + '</text>'; }
    s += '<line x1="' + L + '" y1="' + B + '" x2="' + (Rr + 12) + '" y2="' + B + '" class="as"/><line x1="' + L + '" y1="' + B + '" x2="' + L + '" y2="' + (Tp - 14) + '" class="as"/>';
    s += '<text x="' + (Rr + 12) + '" y="' + (B + 44) + '" class="getal klein" style="text-anchor:end">' + T.schoon(o.xnaam) + '</text>';
    s += '<text x="' + (L - 4) + '" y="' + (Tp - 18) + '" class="getal klein" style="text-anchor:start">' + T.schoon(o.ynaam) + '</text>';
    if (o.punt && o.gids){
      s += '<line x1="' + sx(o.punt.x) + '" y1="' + sy(o.punt.y) + '" x2="' + sx(o.punt.x) + '" y2="' + B + '" class="as" style="stroke:var(--lr-2);stroke-dasharray:6 5"/>';
      s += '<line x1="' + sx(o.punt.x) + '" y1="' + sy(o.punt.y) + '" x2="' + L + '" y2="' + sy(o.punt.y) + '" class="as" style="stroke:var(--lr-2);stroke-dasharray:6 5"/>';
    }
    (o.lijnen || []).forEach(function(l){
      var kl = 'var(--lr-' + (l.k || 1) + ')';
      s += '<line x1="' + sx(l.a[0]) + '" y1="' + sy(l.a[1]) + '" x2="' + sx(l.b[0]) + '" y2="' + sy(l.b[1]) + '" class="boog" style="stroke:' + kl + '"/>';
      if (l.naam){ var bij = l.bij || l.b; s += '<text x="' + (sx(bij[0]) + (l.links ? -8 : 6)) + '" y="' + (sy(bij[1]) - 8) + '" class="getal" style="fill:' + kl + ';text-anchor:' + (l.links ? 'end' : 'start') + '">' + T.schoon(l.naam) + '</text>'; }
    });
    if (o.punt) s += '<circle cx="' + sx(o.punt.x) + '" cy="' + sy(o.punt.y) + '" r="7" class="stip"/>';
    return s + '</svg>';
  }
  /* een mooie stap voor een as tot max, met ongeveer n streepjes */
  function mooi(max, n){ var ruw = max / n, m = Math.pow(10, Math.floor(Math.log(ruw) / Math.LN10)), f = ruw / m; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * m; }

  /* ---------- bedrijven ---------- */
  /* [bedrijf, product (meervoud), prijs laag, hoog (centen), afzet laag, hoog, variabele kosten in % van de prijs] */
  var BEDRIJF = [['een snackbar', 'porties friet', 250, 420, 1500, 6000], ['een bakkerij', 'broden', 220, 460, 2000, 9000], ['een ijssalon', 'bekers ijs', 250, 600, 1500, 7000],
    ['een fietsenmaker', 'fietslampjes', 800, 2500, 200, 1500], ['een webwinkel', 'telefoonhoesjes', 900, 2200, 500, 4000], ['een bioscoop', 'kaartjes', 900, 1400, 2000, 9000],
    ['een drukkerij', 'bedrukte T-shirts', 1200, 2500, 300, 2500], ['een kaasboer', 'hele kazen', 1100, 1900, 300, 2000], ['een sportschool', 'dagkaarten', 600, 1200, 400, 2500],
    ['een broodjeszaak', 'broodjes', 350, 700, 1500, 6000]];
  /* vaste en variabele kosten per soort bedrijf */
  var KOSTEN = [
    ['een bakkerij', ['de huur van de winkel', 'de verzekering van het pand', 'het abonnement voor het kassasysteem', 'de rente over de lening voor de oven'], ['het meel', 'de suiker en de boter', 'de papieren zakken', 'de eieren']],
    ['een fietsenmaker', ['de huur van de werkplaats', 'de verzekering van de werkplaats', 'de kosten van de website per maand'], ['de binnenbanden die hij verkoopt', 'de remblokjes die hij verkoopt', 'de fietsbellen die hij verkoopt']],
    ['een webwinkel', ['de kosten van de website per maand', 'de huur van het magazijn', 'de verzekering van het magazijn'], ['de inkoop van de producten', 'de verzendkosten per pakket', 'de dozen om pakketten in te versturen']],
    ['een snackbar', ['de huur van het pand', 'de lease van de frituur', 'de verzekering van het pand'], ['de aardappelen', 'de bakjes en vorkjes', 'de sauzen', 'de inkoop van de kroketten']],
    ['een drukkerij van T-shirts', ['de huur van de drukmachine per maand', 'de huur van het pand', 'het abonnement op het ontwerpprogramma'], ['de blanco T-shirts', 'de inkt', 'de verzendzakken']],
    ['een ijssalon', ['de huur van het pand', 'de lease van de ijsmachine', 'de verzekering van het pand'], ['de melk en de room', 'de hoorntjes en bekers', 'het fruit voor het ijs']]];

  /* ================= 1 OMZET, KOSTEN EN WINST (onderbouw) ================= */
  function bedrijfOpgave(R, metKosten){
    var b = R.kies(BEDRIJF), p = R.heel(b[2] / 5, b[3] / 5) * 5, q = R.heel(b[4] / 10, b[5] / 10) * 10;
    var v = Math.round(p * R.heel(25, 60) / 100 / 5) * 5, omzet = p * q;
    var FK = Math.round(omzet / 100 * R.heel(15, 55) / 100 / 100) * 100;
    if (FK < 500) FK = 500;
    return { b:b, p:p, q:q, v:v, FK:FK, omzet:omzet };
  }
  G.push({ groep:{ id:'ec-winst', niveau:'onderbouw', domein:'bedrijf', naam:'Omzet, kosten en winst',
      uit:'Wat een bedrijf verdient en uitgeeft: vaste en variabele kosten, de omzet, de totale kosten en de winst of het verlies.' },
    doelen:[
      { id:'ec-vast-variabel', naam:'Vaste of variabele kosten', kort:'Worden de kosten hoger als het bedrijf meer maakt of verkoopt? Dan zijn het variabele kosten',
        uit:'<p>Een bedrijf heeft twee soorten kosten.</p><p><b>Vaste kosten</b> blijven hetzelfde, hoeveel je ook verkoopt. De huur van de winkel betaal je ook als er geen klant komt.</p><p><b>Variabele kosten</b> worden hoger als je meer maakt of verkoopt. Een bakker die meer broden bakt, heeft meer meel nodig.</p><p>Stel jezelf de vraag: <b>wordt het meer als het bedrijf meer verkoopt?</b></p>',
        wanneer:'je de kosten van een bedrijf moet indelen.',
        maak:function(R){
          var b = R.kies(KOSTEN), vast = R.heel(0, 1) === 1, wat = R.kies(vast ? b[1] : b[2]);
          return OP({ context:'Je bekijkt de kosten van ' + b[0] + '.', vraag:hoofd(wat) + ': vast of variabel?',
            stappen:[
              K(R, 'Worden de kosten voor ' + wat + ' hoger als ' + b[0] + ' meer verkoopt of maakt?', vast ? 'nee' : 'ja', [vast ? 'ja' : 'nee'], vast ? 'Deze kosten betaal je per maand of per jaar, ook als er weinig verkocht wordt.' : 'Voor elk product dat je maakt of verkoopt, heb je hier weer iets van nodig.'),
              K(R, 'Dus ' + wat + ' zijn', vast ? 'vaste kosten' : 'variabele kosten', [vast ? 'variabele kosten' : 'vaste kosten'], 'Hoger bij meer verkopen: variabel. Altijd hetzelfde: vast.') ] });
        } },
      { id:'ec-omzet', naam:'De omzet', kort:'Omzet is de prijs keer de afzet (het aantal verkochte producten)',
        uit:'<p>De <b>afzet</b> is het aantal producten dat een bedrijf verkoopt. De <b>omzet</b> is het geld dat daarvoor binnenkomt.</p><p>omzet = prijs ' + X + ' afzet</p><p>Een bakker verkoopt 500 broden van € 3: de omzet is 500 ' + X + ' € 3 = € 1.500. Let op: omzet is nog geen winst, want de bakker heeft ook kosten.</p>',
        wanneer:'je wilt weten hoeveel geld een bedrijf ontvangt.',
        maak:function(R){
          var o = bedrijfOpgave(R);
          return { context:hoofd(o.b[0]) + ' verkoopt in een maand ' + tp(o.q) + ' ' + o.b[1] + ' voor ' + eu(o.p / 100) + ' per stuk. Wat is de omzet?', vraag:'Omzet: ' + tp(o.q) + ' ' + X + ' ' + eu(o.p / 100),
            stappen:[
              { tekst:'De afzet (het aantal verkochte ' + o.b[1] + ') =', antwoord:aant(o.q), hint:'Hoeveel ' + o.b[1] + ' worden er verkocht?' },
              { tekst:'Omzet = ' + eu(o.p / 100) + ' ' + X + ' ' + tp(o.q) + ' =', antwoord:bedr(o.omzet / 100), hint:'Prijs keer afzet. Reken eventueel eerst ' + tp(o.q) + ' ' + X + ' ' + tn(Math.floor(o.p / 100)) + ' en dan het deel achter de komma.' } ] };
        } },
      { id:'ec-kosten', naam:'De totale kosten', kort:'Totale kosten = vaste kosten + variabele kosten per stuk ' + X + ' de afzet',
        uit:'<p>De <b>totale kosten</b> zijn de vaste kosten plus alle variabele kosten.</p><p>De variabele kosten weet je vaak <b>per stuk</b>. Doe die keer het aantal stuks. Tel daar de vaste kosten bij op.</p><p>Vaste kosten € 2.000, variabele kosten € 1,50 per brood, 800 broden: 800 ' + X + ' € 1,50 = € 1.200, totaal € 3.200.</p>',
        wanneer:'je wilt weten wat een bedrijf in totaal uitgeeft.',
        maak:function(R){
          var o = bedrijfOpgave(R), TVK = o.v * o.q;
          return { context:hoofd(o.b[0]) + ' heeft ' + eu(o.FK) + ' vaste kosten per maand. De variabele kosten zijn ' + eu(o.v / 100) + ' per stuk. Deze maand verkoopt het bedrijf ' + tp(o.q) + ' ' + o.b[1] + '. Wat zijn de totale kosten?', vraag:'Totale kosten bij ' + tp(o.q) + ' stuks',
            stappen:[
              { tekst:'Variabele kosten samen: ' + tp(o.q) + ' ' + X + ' ' + eu(o.v / 100) + ' =', antwoord:bedr(TVK / 100), hint:'Het aantal keer de kosten per stuk.' },
              { tekst:'Totale kosten: ' + eu(o.FK) + ' + ' + eu(TVK / 100) + ' =', antwoord:bedr(o.FK + TVK / 100), hint:'Vaste kosten plus variabele kosten.', fout:FB(TVK / 100, 'Vergeet de vaste kosten niet.') } ] };
        } },
      { id:'ec-winst', naam:'Winst of verlies', kort:'Winst = omzet ' + MIN + ' totale kosten. Is de uitkomst negatief, dan is het verlies',
        uit:'<p>De <b>winst</b> is wat er overblijft van de omzet als je alle kosten hebt betaald.</p><p>winst = omzet ' + MIN + ' totale kosten</p><p>Zijn de kosten hoger dan de omzet, dan is de uitkomst negatief. Dan maakt het bedrijf <b>verlies</b>.</p>',
        wanneer:'je wilt weten of een bedrijf geld verdient.',
        maak:function(R){
          var o = bedrijfOpgave(R), TVK = o.v * o.q, TK = o.FK * 100 + TVK, W = o.omzet - TK;
          if (R.heel(0, 3) === 0){ o.FK = Math.ceil((o.omzet - TVK) / 100 / 1000) * 1000 + R.heel(1, 3) * 500; TK = o.FK * 100 + TVK; W = o.omzet - TK; }
          return { context:hoofd(o.b[0]) + ' verkoopt deze maand ' + tp(o.q) + ' ' + o.b[1] + ' voor ' + eu(o.p / 100) + ' per stuk. De vaste kosten zijn ' + eu(o.FK) + '. De variabele kosten zijn ' + eu(o.v / 100) + ' per stuk. Wat is de winst? (Verlies krijgt een min.)', vraag:'Winst bij ' + tp(o.q) + ' stuks',
            stappen:[
              { tekst:'Omzet: ' + tp(o.q) + ' ' + X + ' ' + eu(o.p / 100) + ' =', antwoord:bedr(o.omzet / 100), hint:'Prijs keer afzet.' },
              { tekst:'Variabele kosten: ' + tp(o.q) + ' ' + X + ' ' + eu(o.v / 100) + ' =', antwoord:bedr(TVK / 100), hint:'Afzet keer variabele kosten per stuk.' },
              { tekst:'Totale kosten: ' + eu(o.FK) + ' + ' + eu(TVK / 100) + ' =', antwoord:bedr(TK / 100), hint:'Vaste plus variabele kosten.' },
              { tekst:'Winst: ' + eu(o.omzet / 100) + ' ' + MIN + ' ' + eu(TK / 100) + ' =', antwoord:bedr(W / 100), hint:W < 0 ? 'De kosten zijn hoger dan de omzet. De uitkomst is negatief: verlies.' : 'Omzet min totale kosten.', fout:W < 0 ? FB(-W / 100, 'De kosten zijn hoger dan de omzet: het is verlies. Zet er een min voor.') : FB(o.omzet / 100 - o.FK, 'Je trok alleen de vaste kosten af. Trek de totale kosten af.') } ] };
        } }
    ] });

  /* ================= 2 BREAK-EVEN EN GEMIDDELDE KOSTEN (bovenbouw) ================= */
  G.push({ groep:{ id:'ec-breakeven', niveau:'bovenbouw', domein:'bedrijf', naam:'Gemiddelde kosten en break-even',
      uit:'De gemiddelde kosten per product, het break-evenpunt uitrekenen en aflezen in een grafiek, en uitrekenen hoeveel je moet verkopen voor een bepaalde winst.' },
    doelen:[
      { id:'ec-gem-kosten', naam:'Gemiddelde totale kosten per stuk', kort:'Deel de totale kosten door het aantal producten',
        uit:'<p>De <b>gemiddelde totale kosten</b> (GTK) zijn wat één product het bedrijf gemiddeld kost.</p><p>Reken eerst de totale kosten uit: vaste kosten + variabele kosten. Deel dan door het aantal producten.</p><p>Vaste kosten € 2.000, variabel € 1,50 per stuk, 800 stuks: totaal € 3.200, gemiddeld € 3.200 : 800 = € 4 per stuk.</p>',
        wanneer:'je wilt weten wat één product kost, of welke prijs je minstens moet vragen.',
        maak:function(R){
          var o, TVK, TK;
          for (var i = 0; i < 300; i++){ o = bedrijfOpgave(R); TVK = o.v * o.q; TK = o.FK * 100 + TVK; if (TK % o.q === 0) break; }
          var g = TK / o.q / 100;
          return { context:hoofd(o.b[0]) + ' verkoopt deze maand ' + tp(o.q) + ' ' + o.b[1] + '. De vaste kosten zijn ' + eu(o.FK) + ', de variabele kosten ' + eu(o.v / 100) + ' per stuk. Wat zijn de gemiddelde totale kosten per stuk? Rond af op centen.', vraag:'GTK bij ' + tp(o.q) + ' stuks',
            stappen:[
              { tekst:'Variabele kosten samen: ' + tp(o.q) + ' ' + X + ' ' + eu(o.v / 100) + ' =', antwoord:bedr(TVK / 100), hint:'Afzet keer variabele kosten per stuk.' },
              { tekst:'Totale kosten: ' + eu(o.FK) + ' + ' + eu(TVK / 100) + ' =', antwoord:bedr(TK / 100), hint:'Vaste plus variabele kosten.' },
              { tekst:'Per stuk: ' + eu(TK / 100) + ' : ' + tp(o.q) + ' =', antwoord:bedr(g), hint:'Deel de totale kosten door het aantal.', fout:FB(o.FK / o.q, 'Dat zijn alleen de vaste kosten per stuk. Deel de totale kosten.') } ] };
        } },
      { id:'ec-breakeven', naam:'Het break-evenpunt uitrekenen', kort:'Vaste kosten gedeeld door wat je per stuk overhoudt (prijs min variabele kosten), naar boven afgerond',
        uit:'<p>Bij het <b>break-evenpunt</b> is de omzet precies gelijk aan de totale kosten. De winst is dan 0. Verkoop je meer, dan maak je winst.</p><p>Per verkocht product houd je de prijs min de variabele kosten over. Daarmee betaal je de vaste kosten.</p><p>break-evenafzet = vaste kosten : (prijs ' + MIN + ' variabele kosten per stuk)</p><p>Komt er een kommagetal uit, dan rond je <b>naar boven</b> af: je verkoopt alleen hele producten.</p>',
        wanneer:'je wilt weten hoeveel je minstens moet verkopen om geen verlies te maken.',
        maak:function(R){
          var o = bedrijfOpgave(R), m = o.p - o.v, FKc = o.FK * 100, q = FKc / m, be = Math.ceil(q - 1e-9);
          if (R.heel(0, 1) === 0){ var k = Math.max(1, Math.round(FKc / m / 100)) * 100; o.FK = k * m / 100; FKc = k * m; q = k; be = k; }
          var rest = Math.abs(q - Math.round(q)) > 1e-9;
          return { context:hoofd(o.b[0]) + ' verkoopt ' + o.b[1] + ' voor ' + eu(o.p / 100) + ' per stuk. De variabele kosten zijn ' + eu(o.v / 100) + ' per stuk. De vaste kosten zijn ' + eu(o.FK) + ' per maand. Hoeveel moet het bedrijf minstens verkopen om geen verlies te maken?', vraag:'Break-evenafzet',
            stappen:[
              { tekst:'Per stuk houd je over: ' + eu(o.p / 100) + ' ' + MIN + ' ' + eu(o.v / 100) + ' =', antwoord:bedr(m / 100), hint:'Prijs min variabele kosten per stuk.' },
              { tekst:'Vaste kosten : wat je per stuk overhoudt = ' + eu(o.FK) + ' : ' + eu(m / 100) + ' =' + (rest ? ' (rond af op twee decimalen)' : ''), antwoord:rest ? [tn(r2(q)), tn(r1(q)), tn(Math.round(q * 1000) / 1000)] : aant(q), hint:'Hoe vaak past ' + kaal(m / 100) + ' in ' + kaal(o.FK) + '?', fout:FA(Math.round(FKc / o.p), 'Je deelde door de prijs. Deel door wat je per stuk overhoudt: prijs min variabele kosten.') },
              { tekst:'Hoeveel hele stuks minstens?', antwoord:aant(be), hint:rest ? 'Bij ' + Math.floor(q) + ' stuks heb je nog net verlies. Rond naar boven af.' : 'Het komt precies uit.', fout:rest ? FA(Math.floor(q), 'Bij ' + tp(Math.floor(q)) + ' stuks maak je nog net verlies. Rond naar boven af.') : {} } ] };
        } },
      { id:'ec-breakeven-grafiek', naam:'Het break-evenpunt aflezen', kort:'Zoek het snijpunt van de omzetlijn en de kostenlijn en lees de afzet eronder af',
        uit:'<p>In een grafiek zie je twee lijnen. De lijn van de <b>omzet</b> (TO) begint bij 0: zonder verkoop geen geld. De lijn van de <b>totale kosten</b> (TK) begint hoger, bij de vaste kosten.</p><p>Waar de lijnen elkaar <b>snijden</b>, is de omzet gelijk aan de kosten: het <b>break-evenpunt</b>.</p><p>Lees recht onder het snijpunt de afzet af. Links van het snijpunt maak je verlies, rechts winst.</p>',
        wanneer:'je de omzet en de kosten in een grafiek krijgt.',
        maak:function(R){
          var ps = R.kies([[5, [1, 2, 3, 4]], [10, [2, 4, 6, 8]], [15, [3, 6, 9, 12]], [20, [4, 8, 12, 16]], [25, [5, 10, 15, 20]], [40, [8, 16, 24, 32]]]);
          var p = ps[0], v = R.kies(ps[1]), qs = R.kies([200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000]), FK = qs * (p - v), xmax = 2 * qs, ymax = p * xmax;
          var g = function(n){ return grafiek({ xmax:xmax, ymax:ymax, xstap:qs / 5, ystap:ymax / 10, xnaam:'afzet (stuks)', ynaam:'euro', aria:'grafiek met omzet en totale kosten',
            lijnen:[{ a:[0, 0], b:[xmax, ymax], k:1, naam:'TO', bij:[xmax * 0.9, ymax * 0.9], links:true }, { a:[0, FK], b:[xmax, FK + v * xmax], k:2, naam:'TK', bij:[xmax * 0.97, FK + v * xmax * 0.97] }],
            punt:n >= 2 ? { x:qs, y:p * qs } : null, gids:n >= 2 }); };
          return { context:'Een bedrijf verkoopt zijn product voor ' + eu(p) + '. In de grafiek zie je de omzet (TO) en de totale kosten (TK). Bij welke afzet ligt het break-evenpunt?', vraag:'Break-evenafzet aflezen',
            beeld:g, zelfBeeld:g(0), antwoord:aant(qs), eenheid:'stuks',
            stappen:[
              { tekst:'De TK-lijn begint bij de vaste kosten. Hoeveel zijn de vaste kosten?', antwoord:bedr(FK), hint:'Kijk waar de lijn TK de verticale as raakt, bij afzet 0.' },
              { tekst:'Bij welke afzet snijden de twee lijnen elkaar?', antwoord:aant(qs), eenheid:'stuks', hint:'Zoek het punt waar TO en TK elkaar kruisen en kijk recht naar beneden.' },
              { tekst:'Hoeveel is de omzet in het snijpunt?', antwoord:bedr(p * qs), hint:'Kijk vanaf het snijpunt naar links, naar de as met euro\'s. Of reken: ' + tp(qs) + ' ' + X + ' ' + eu(p) + '.' } ] };
        } },
      { id:'ec-doelwinst', naam:'Afzet voor een gewenste winst', kort:'Tel de gewenste winst op bij de vaste kosten en deel door wat je per stuk overhoudt',
        uit:'<p>Een bedrijf wil niet alleen geen verlies, maar ook winst maken. Hoeveel moet het dan verkopen?</p><p>Wat je per stuk overhoudt (prijs ' + MIN + ' variabele kosten) moet nu de vaste kosten <b>en</b> de winst betalen.</p><p>afzet = (vaste kosten + gewenste winst) : (prijs ' + MIN + ' variabele kosten). Rond naar boven af.</p>',
        wanneer:'een bedrijf een winstdoel heeft.',
        maak:function(R){
          var o = bedrijfOpgave(R), m = o.p - o.v, W = R.heel(2, 20) * 500, som = o.FK + W, q = som * 100 / m, be = Math.ceil(q - 1e-9), rest = Math.abs(q - Math.round(q)) > 1e-9;
          return { context:hoofd(o.b[0]) + ' verkoopt ' + o.b[1] + ' voor ' + eu(o.p / 100) + '. De variabele kosten zijn ' + eu(o.v / 100) + ' per stuk en de vaste kosten ' + eu(o.FK) + '. Het bedrijf wil ' + eu(W) + ' winst maken. Hoeveel moet het minstens verkopen?', vraag:'Afzet voor ' + eu(W) + ' winst',
            stappen:[
              { tekst:'Per stuk houd je over: ' + eu(o.p / 100) + ' ' + MIN + ' ' + eu(o.v / 100) + ' =', antwoord:bedr(m / 100), hint:'Prijs min variabele kosten.' },
              { tekst:'Wat je moet verdienen: vaste kosten + winst = ' + eu(o.FK) + ' + ' + eu(W) + ' =', antwoord:bedr(som), hint:'Tel de gewenste winst bij de vaste kosten.' },
              { tekst:eu(som) + ' : ' + eu(m / 100) + ' =' + (rest ? ' (rond af op twee decimalen)' : ''), antwoord:rest ? [tn(r2(q)), tn(r1(q)), tn(Math.round(q * 1000) / 1000)] : aant(q), hint:'Hoe vaak past ' + kaal(m / 100) + ' in ' + kaal(som) + '?', fout:FA(Math.round(o.FK * 100 / m), 'Dat is alleen de break-evenafzet. Tel de winst bij de vaste kosten.') },
              { tekst:'Hoeveel hele stuks minstens?', antwoord:aant(be), hint:rest ? 'Rond naar boven af, anders haal je de winst net niet.' : 'Het komt precies uit.', fout:rest ? FA(Math.floor(q), 'Dan haal je de winst net niet. Rond naar boven af.') : {} } ] };
        } }
    ] });

  /* ================= 3 VRAAG EN AANBOD IN EEN TABEL (onderbouw) ================= */
  var MARKT = [['bekers ijs op het strand', 100, 50], ['concertkaartjes', 500, 500], ['zakken patat op de kermis', 50, 50], ['kilo aardbeien op de markt', 50, 50],
    ['tweedehands fietsen', 500, 1000], ['bossen tulpen', 50, 50], ['kerstbomen', 500, 500], ['pompoenen', 50, 50]];
  /* een vraag-en-aanbodtabel met het evenwicht op rij e */
  function marktTabel(R){
    var m = R.kies(MARKT), start = R.heel(2, 8) * m[1], stap = m[2], e = R.heel(1, 4), Q = R.heel(8, 40) * 50, b = R.heel(1, 4) * 50, d = R.heel(1, 4) * 50;
    var rijen = [];
    for (var i = 0; i < 6; i++) rijen.push({ p:start + i * stap, v:Q + (e - i) * b, a:Q - (e - i) * d });
    if (rijen[5].v <= 0 || rijen[0].a <= 0) return marktTabel(R);
    return { m:m, rijen:rijen, e:e, Q:Q };
  }
  function marktBeeld(t, nad){
    return ktabel([['prijs', 'gevraagd', 'aangeboden']].concat(t.rijen.map(function(r){ return [eu(r.p / 100), tp(r.v), tp(r.a)]; })), { kop:true, nadruk:nad || [] });
  }
  G.push({ groep:{ id:'ec-markt', niveau:'onderbouw', domein:'markt', naam:'Vraag en aanbod',
      uit:'De evenwichtsprijs aflezen in een tabel, en zien of er bij een andere prijs een tekort of een overschot is.' },
    doelen:[
      { id:'ec-evenwicht-tabel', naam:'De evenwichtsprijs in een tabel', kort:'Zoek de prijs waarbij de gevraagde hoeveelheid gelijk is aan de aangeboden hoeveelheid',
        uit:'<p>Op een markt zijn er kopers (de <b>vraag</b>) en verkopers (het <b>aanbod</b>). Hoe hoger de prijs, hoe minder kopers willen kopen. En hoe meer verkopers willen verkopen.</p><p>Bij één prijs willen de kopers precies evenveel kopen als de verkopers willen verkopen. Dat is de <b>evenwichtsprijs</b>.</p><p>Zoek in de tabel de rij waar <b>gevraagd</b> en <b>aangeboden</b> hetzelfde getal hebben.</p>',
        wanneer:'je de prijs zoekt waarbij alles verkocht wordt en niemand met lege handen staat.',
        maak:function(R){
          var t = marktTabel(R), r = t.rijen[t.e];
          return { context:'In de tabel zie je de vraag naar en het aanbod van ' + t.m[0] + ' bij verschillende prijzen. Wat is de evenwichtsprijs?', vraag:'Evenwichtsprijs?',
            beeld:function(n){ return marktBeeld(t, n >= 1 ? [[t.e + 1, 0], [t.e + 1, 1], [t.e + 1, 2]] : []); }, zelfBeeld:marktBeeld(t), antwoord:bedr(r.p / 100),
            stappen:[
              { tekst:'Bij welke prijs is gevraagd gelijk aan aangeboden?', antwoord:bedr(r.p / 100), hint:'Ga de rijen langs en vergelijk de twee getallen in elke rij.' },
              { tekst:'Hoeveel ' + t.m[0] + ' worden er dan verhandeld?', antwoord:aant(r.v), hint:'Lees het getal in die rij af: gevraagd en aangeboden zijn daar gelijk.' } ] };
        } },
      { id:'ec-tekort-overschot', naam:'Tekort of overschot', kort:'Vergelijk bij die prijs de vraag en het aanbod: meer vraag is een tekort, meer aanbod is een overschot',
        uit:'<p>Is de prijs <b>lager</b> dan de evenwichtsprijs, dan willen veel mensen kopen, maar weinig verkopen. Er is een <b>tekort</b>.</p><p>Is de prijs <b>hoger</b>, dan willen veel verkopers verkopen, maar weinig kopers kopen. Er is een <b>overschot</b>.</p><p>Hoe groot? Trek de kleinste van de grootste af: gevraagd ' + MIN + ' aangeboden, of andersom.</p>',
        wanneer:'de prijs niet de evenwichtsprijs is.',
        maak:function(R){
          var t = marktTabel(R), i; do { i = R.heel(0, 5); } while (i === t.e);
          var r = t.rijen[i], tekort = r.v > r.a, verschil = Math.abs(r.v - r.a);
          return OP({ context:'In de tabel zie je de vraag naar en het aanbod van ' + t.m[0] + '. De prijs is ' + eu(r.p / 100) + '. Is er een tekort of een overschot, en hoe groot?', vraag:'Prijs ' + eu(r.p / 100) + ': tekort of overschot?',
            beeld:function(n){ return marktBeeld(t, n >= 1 ? [[i + 1, 1]].concat(n >= 2 ? [[i + 1, 2]] : []) : []); }, zelfBeeld:marktBeeld(t),
            stappen:[
              { tekst:'Gevraagd bij ' + eu(r.p / 100) + ':', antwoord:aant(r.v), hint:'Zoek de rij met prijs ' + eu(r.p / 100) + ', kolom gevraagd.' },
              { tekst:'Aangeboden bij ' + eu(r.p / 100) + ':', antwoord:aant(r.a), hint:'Dezelfde rij, kolom aangeboden.' },
              K(R, 'Dus er is', (tekort ? 'een tekort van ' : 'een overschot van ') + tp(verschil), [(tekort ? 'een overschot van ' : 'een tekort van ') + tp(verschil), (tekort ? 'een tekort van ' : 'een overschot van ') + tp(r.v + r.a), 'evenwicht: geen tekort en geen overschot'],
                tekort ? 'Er wordt meer gevraagd dan aangeboden: niet iedereen kan kopen. Verschil: ' + tp(r.v) + ' ' + MIN + ' ' + tp(r.a) + '.' : 'Er wordt meer aangeboden dan gevraagd: er blijft over. Verschil: ' + tp(r.a) + ' ' + MIN + ' ' + tp(r.v) + '.') ] });
        } }
    ] });

  /* ================= 4 MARKT: EVENWICHT, MAXIMUMPRIJS EN MARKTAANDEEL (bovenbouw) ================= */
  /* Qv = -a P + b en Qa = c P - d, evenwicht bij P* en Q* */
  function lijnen(R){
    for (var i = 0; i < 400; i++){
      var a = R.heel(2, 30) * 10, c = R.heel(2, 30) * 10, P = R.heel(4, 40) / 2, Q = R.heel(10, 200) * 10;
      var b = Q + a * P, d = c * P - Q;
      if (d > 0 && Number.isInteger(b) && Number.isInteger(d) && a !== c) return { a:a, b:b, c:c, d:d, P:P, Q:Q };
    }
    return { a:100, b:2000, c:150, d:500, P:10, Q:1000 };
  }
  function formules(l){ return 'Q<sub>v</sub> = ' + MIN + tp(l.a) + 'P + ' + tp(l.b) + '<br>Q<sub>a</sub> = ' + tp(l.c) + 'P ' + MIN + ' ' + tp(l.d); }
  function vraagAanbod(l, punt, extra){
    var Pmax = l.b / l.a, Qmax = l.b, ys = mooi(Pmax, 8), xs = mooi(Qmax, 6), ym = Math.ceil(Pmax / ys) * ys, xm = Math.ceil(Qmax / xs) * xs;
    var Pa = Math.min(ym, (xm + l.d) / l.c);
    var lj = [{ a:[l.b, 0], b:[0, Pmax], k:1, naam:'vraag', bij:[l.b * 0.9, Pmax * 0.1] }, { a:[0, l.d / l.c], b:[l.c * Pa - l.d, Pa], k:2, naam:'aanbod', bij:[l.c * Pa - l.d, Pa], links:true }];
    if (extra) lj.push(extra);
    return grafiek({ xmax:xm, ymax:ym, xstap:xs, ystap:ys, xnaam:'hoeveelheid (Q)', ynaam:'prijs (P) in euro', ytoon:function(y){ return tn(y); }, aria:'vraaglijn en aanbodlijn',
      lijnen:lj, punt:punt ? { x:l.Q, y:l.P } : null, gids:!!punt });
  }
  G.push({ groep:{ id:'ec-markt-bb', niveau:'bovenbouw', domein:'markt', naam:'Evenwicht, maximumprijs en marktaandeel',
      uit:'Het evenwicht uitrekenen met een vraaglijn en een aanbodlijn, het tekort of overschot bij een maximumprijs of minimumprijs, en het marktaandeel van een bedrijf.' },
    doelen:[
      { id:'ec-evenwicht-lijnen', naam:'Evenwicht uit twee lijnen', kort:'Stel de vraag gelijk aan het aanbod, los P op en vul P in om Q te vinden',
        uit:'<p>De vraag en het aanbod staan vaak als formule: Q<sub>v</sub> = ' + MIN + '100P + 2.000 en Q<sub>a</sub> = 150P ' + MIN + ' 500.</p><p>In het evenwicht is de vraag gelijk aan het aanbod. Stel ze dus <b>gelijk</b>: ' + MIN + '100P + 2.000 = 150P ' + MIN + ' 500. Breng alle P naar één kant: 2.500 = 250P, dus <b>P = 10</b>.</p><p>Vul P = 10 in bij de vraag: Q = ' + MIN + '100 ' + X + ' 10 + 2.000 = <b>1.000</b>. In de grafiek is dat het snijpunt van de lijnen.</p>',
        wanneer:'de vraag en het aanbod als formule of als lijn gegeven zijn.',
        maak:function(R){
          var l = lijnen(R);
          return { context:'Op een markt geldt:<br>' + formules(l) + '<br>(P in euro\'s, Q in stuks.) Hoeveel stuks worden er verhandeld in het evenwicht?', vraag:'Evenwichtshoeveelheid', vraagHtml:'Q<sub>v</sub> = Q<sub>a</sub>: hoeveel stuks?',
            beeld:function(n){ return vraagAanbod(l, n >= 3); }, eenheid:'stuks',
            stappen:[
              { tekst:'Stel Q<sub>v</sub> = Q<sub>a</sub>: ' + MIN + tp(l.a) + 'P + ' + tp(l.b) + ' = ' + tp(l.c) + 'P ' + MIN + ' ' + tp(l.d) + '. Breng alle P naar rechts. Hoeveel P staat er dan?', antwoord:aant(l.a + l.c), hint:MIN + tp(l.a) + 'P naar rechts wordt +' + tp(l.a) + 'P. Samen met ' + tp(l.c) + 'P is dat ' + tp(l.a) + ' + ' + tp(l.c) + '.', fout:FA(Math.abs(l.c - l.a), 'Als je ' + MIN + tp(l.a) + 'P naar de andere kant brengt, wordt het +' + tp(l.a) + 'P. Tel op.') },
              { tekst:'Breng de getallen naar links. Links staat dan ' + tp(l.b) + ' + ' + tp(l.d) + ' =', antwoord:aant(l.b + l.d), hint:'Ook ' + MIN + tp(l.d) + ' gaat naar de andere kant en wordt +' + tp(l.d) + '.' },
              { tekst:'P = ' + tp(l.b + l.d) + ' : ' + tp(l.a + l.c) + ' =', antwoord:bedr(l.P), eenheid:'euro', hint:'Deel door het getal voor P.' },
              { tekst:'Vul P = ' + tn(l.P) + ' in: Q = ' + MIN + tp(l.a) + ' ' + X + ' ' + tn(l.P) + ' + ' + tp(l.b) + ' =', antwoord:aant(l.Q), hint:tp(l.a) + ' ' + X + ' ' + tn(l.P) + ' = ' + tp(l.a * l.P) + '. Haal dat van ' + tp(l.b) + ' af.' } ] };
        } },
      { id:'ec-maxprijs', naam:'Maximumprijs of minimumprijs: tekort of overschot', kort:'Vul de vaste prijs in bij de vraag en bij het aanbod. Meer vraag is een tekort, meer aanbod een overschot',
        uit:'<p>De overheid kan een prijs vastzetten. Een <b>maximumprijs</b> (de prijs mag niet hoger) ligt onder de evenwichtsprijs. Dan willen meer mensen kopen dan er aangeboden wordt: een <b>tekort</b>.</p><p>Een <b>minimumprijs</b> (de prijs mag niet lager) ligt boven de evenwichtsprijs. Dan wordt er meer aangeboden dan gevraagd: een <b>overschot</b>.</p><p>Vul de prijs in bij Q<sub>v</sub> en bij Q<sub>a</sub>. Het verschil is de grootte van het tekort of overschot.</p>',
        wanneer:'de overheid een maximumprijs of minimumprijs instelt.',
        maak:function(R){
          var l, Pm, max, Qv, Qa;
          for (var i = 0; i < 200; i++){ l = lijnen(R); max = R.heel(0, 1) === 1; Pm = max ? l.P - R.heel(1, 4) / 2 : l.P + R.heel(1, 4) / 2; Qv = l.b - l.a * Pm; Qa = l.c * Pm - l.d; if (Pm > 0 && Qv > 0 && Qa > 0) break; }
          var tek = Qv > Qa, vs = Math.abs(Qv - Qa), wat = max ? 'maximumprijs' : 'minimumprijs';
          return OP({ context:'Op een markt geldt:<br>' + formules(l) + '<br>De evenwichtsprijs is ' + eu(l.P) + '. De overheid stelt een ' + wat + ' in van ' + eu(Pm) + '. Wat is het gevolg?', vraag:hoofd(wat) + ' ' + eu(Pm), vraagHtml:hoofd(wat) + ' ' + eu(Pm) + ': tekort of overschot?',
            beeld:function(n){ return vraagAanbod(l, false, { a:[0, Pm], b:[Math.max(l.b, 1), Pm], k:3, naam:wat, bij:[0, Pm] }); },
            stappen:[
              { tekst:'Gevraagd: Q<sub>v</sub> = ' + MIN + tp(l.a) + ' ' + X + ' ' + tn(Pm) + ' + ' + tp(l.b) + ' =', antwoord:aant(Qv), hint:'Vul P = ' + tn(Pm) + ' in bij de vraag.' },
              { tekst:'Aangeboden: Q<sub>a</sub> = ' + tp(l.c) + ' ' + X + ' ' + tn(Pm) + ' ' + MIN + ' ' + tp(l.d) + ' =', antwoord:aant(Qa), hint:'Vul P = ' + tn(Pm) + ' in bij het aanbod.' },
              K(R, 'Dus er is', (tek ? 'een tekort van ' : 'een overschot van ') + tp(vs), [(tek ? 'een overschot van ' : 'een tekort van ') + tp(vs), (tek ? 'een tekort van ' : 'een overschot van ') + tp(Qv + Qa), 'evenwicht: geen tekort en geen overschot'],
                tek ? 'Er wordt meer gevraagd (' + tp(Qv) + ') dan aangeboden (' + tp(Qa) + '): een tekort.' : 'Er wordt meer aangeboden (' + tp(Qa) + ') dan gevraagd (' + tp(Qv) + '): een overschot.') ] });
        } },
      { id:'ec-marktaandeel', naam:'Het marktaandeel', kort:'De afzet van het bedrijf gedeeld door de afzet van de hele markt, keer 100',
        uit:'<p>Het <b>marktaandeel</b> zegt welk deel van de hele markt een bedrijf heeft.</p><p>Tel eerst de afzet van alle bedrijven op: dat is de <b>totale markt</b>. Deel de afzet van het bedrijf door de totale markt en doe keer 100.</p><p>Verkoopt een merk 30.000 van de 120.000 fietsen, dan is het marktaandeel 30.000 : 120.000 ' + X + ' 100 = 25%.</p>',
        wanneer:'je wilt weten hoe groot een bedrijf is vergeleken met de concurrenten.',
        maak:function(R){
          var markt = R.kies([['frisdrank', 'liter', ['Fris&amp;Co', 'Bubbel', 'Zomerdronk', 'Prik']], ['fietsen', 'stuks', ['Trapper', 'Rijwiel', 'Snelfiets', 'Velo']], ['smartphones', 'stuks', ['Pixo', 'Belfoon', 'Zoem', 'Teltop']],
            ['sportschoenen', 'paar', ['Sprint', 'Loper', 'Zool', 'Spring']], ['chips', 'zakken', ['Krokant', 'Knapper', 'Zoutje', 'Chipko']]]);
          var n = markt[2].map(function(){ return R.heel(5, 90) * 1000; }), tot = n.reduce(function(a, x){ return a + x; }, 0), i = R.heel(0, 3), a = r1(n[i] / tot * 100);
          var b = ktabel([['merk', 'afzet (' + markt[1] + ')']].concat(markt[2].map(function(m, k){ return [m, tp(n[k])]; })), { kop:true, html:true });
          var naam = markt[2][i].replace('&amp;', '&');
          return { context:'In de tabel zie je de afzet van ' + markt[0] + ' in een jaar. Er zijn maar vier merken. Wat is het marktaandeel van ' + naam + '? Rond af op één decimaal.', vraag:'Marktaandeel ' + naam, beeld:b, zelfBeeld:b, eenheid:'%',
            stappen:[
              { tekst:'De totale markt: ' + n.map(tp).join(' + ') + ' =', antwoord:aant(tot), hint:'Tel de afzet van alle vier de merken op.' },
              { tekst:'Marktaandeel: ' + tp(n[i]) + ' : ' + tp(tot) + ' ' + X + ' 100 =', antwoord:pc(a), eenheid:'%', hint:'De afzet van ' + naam + ' gedeeld door de totale markt, keer 100. Rond af op één decimaal.' } ] };
        } }
    ] });

  LEERROUTE.voeg('economie', G);
})();
