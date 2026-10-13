/* De leerroute aardrijkskunde, de wereld: klimaatgrafieken lezen, een klimaat bepalen
   met het stappenplan van Köppen, temperatuur en hoogte, rekenen met bevolking,
   de bevolkingspiramide en rivieren. Elke vaardigheid is een eigen doel.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var T = LEERROUTE.R, MIN = '−', G = [];

  /* ---------- hulpjes ---------- */
  function tn(x){ return T.toon(x); }
  function tp(x){ return T.toon(x, { punt:true }); }
  function nv(x){ var a = tn(x), l = [a, tp(x), String(x), a.replace(MIN, '-'), tp(x).replace(MIN, '-')]; return l.filter(function(v, i){ return l.indexOf(v) === i; }); }
  function pv(x){ return nv(x).concat(nv(x).map(function(v){ return v + '%'; })); }
  function F(){ var o = {}; for (var i = 0; i + 1 < arguments.length; i += 2) if (arguments[i] != null) o[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return o; }
  function FN(x, tekst, o){ o = o || {}; nv(x).forEach(function(k){ o[k.toLowerCase()] = tekst; }); return o; }
  function kz(tekst, opties, goed, hint, extra){ var o = T.hussel(opties), s = { tekst:tekst, opties:o, goed:o.indexOf(goed), hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function kv(tekst, opties, goed, hint, extra){ var s = { tekst:tekst, opties:opties.slice(), goed:goed, hint:hint }; if (extra) for (var k in extra) s[k] = extra[k]; return s; }
  function eindKeuze(op){ var s = op.stappen[op.stappen.length - 1]; op.opties = s.opties; op.goed = s.goed; return op; }
  function r1(x){ return Math.round(x * 10) / 10; }
  function rnd(x, d){ var f = Math.pow(10, d || 0); return Math.round(x * f) / f; }
  function svg(w, h, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + w + ' ' + h + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + T.schoon(aria) + '">'; }
  function tekst(x, y, t, kl, stijl){ return '<text x="' + r1(x) + '" y="' + r1(y) + '" class="' + (kl || 'getal klein') + '"' + (stijl ? ' style="' + stijl + '"' : '') + '>' + T.schoon(t) + '</text>'; }
  function pijl(x1, y1, x2, y2, kl, dik){
    var a = Math.atan2(y2 - y1, x2 - x1), h = 11 + (dik || 3), w = .5;
    var st = kl ? ' class="boog" style="stroke:' + kl + ';stroke-width:' + (dik || 3) + '"' : ' class="as" style="stroke-width:' + (dik || 2) + ';stroke-linecap:round;stroke-linejoin:round"';
    return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"' + st + '/>' +
      '<path d="M' + r1(x2 - h * Math.cos(a - w)) + ' ' + r1(y2 - h * Math.sin(a - w)) + ' L' + r1(x2) + ' ' + r1(y2) + ' L' + r1(x2 - h * Math.cos(a + w)) + ' ' + r1(y2 - h * Math.sin(a + w)) + '"' + st + '/>';
  }
  function smal(){ try { return window.innerWidth < 560; } catch (e){ return false; } }
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }
  function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ---------- klimaatgegevens ---------- */
  var MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var LET = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  function mv(i){ var m = MAAND[i]; return [m, m.slice(0, 3), cap(m)]; }
  function tc(t){ return tn(t) + ' °C'; }
  function golf(m, piek){ return Math.cos(2 * Math.PI * (m - piek) / 12); }
  function uniek(l, max){ var v = max ? Math.max.apply(null, l) : Math.min.apply(null, l); return l.filter(function(x){ return x === v; }).length === 1; }
  /* een plaats van een klimaattype; geeft { T, N, zuid, type } of null (dan opnieuw) */
  function plaatsVan(R, type){
    /* landklimaten, koude woestijnen en poolklimaten met veel neerslag liggen op het noordelijk halfrond */
    var koudB = type === 'B' && R.heel(0, 2) === 0, zuid = type !== 'D' && type !== 'E' && !koudB && R.heel(0, 3) === 0, p = zuid ? 0 : 6, Tm = [], N = [], m, mean, amp;
    function temp(me, am){ for (var i = 0; i < 12; i++) Tm.push(Math.round(me + am * golf(i, p) + R.heel(-4, 4) / 10)); }
    if (type === 'A' || type === 'Aw'){
      temp(R.heel(24, 27), R.heel(5, 25) / 10);
      if (type === 'A') for (m = 0; m < 12; m++) N.push(R.heel(150, 330));
      else { var k = R.heel(3, 6), s = ((zuid ? 5 : 11) - Math.floor(k / 2) + 12) % 12;
        var nat = 12 - k, top = R.heel(170, 260);
        for (m = 0; m < 12; m++){ var q = (m - s + 12) % 12; N.push(q < k ? R.heel(0, 42) : Math.round(85 + (top - 85) * Math.sin(Math.PI * (q - k + 1) / (nat + 1)) + R.heel(-12, 12))); } }
    } else if (type === 'B'){
      if (!koudB) temp(R.heel(20, 27), R.heel(50, 90) / 10); else temp(R.heel(6, 10), R.heel(130, 160) / 10);
      for (m = 0; m < 12; m++) N.push(R.heel(0, 26));
    } else if (type === 'C'){
      temp(R.heel(9, 16), R.heel(50, 90) / 10);
      if (R.heel(0, 2)){ var b = R.heel(55, 85), v = R.heel(5, 30); for (m = 0; m < 12; m++) N.push(Math.max(5, Math.round(b + v * golf(m, R.heel(0, 1) ? p : p + 6) + R.heel(-12, 12)))); }
      else for (m = 0; m < 12; m++) N.push(Math.max(3, Math.round(62 + 55 * golf(m, p + 6) + R.heel(-8, 8))));
    } else if (type === 'D'){
      temp(R.heel(-3, 5), R.heel(130, 180) / 10);
      var b2 = R.heel(45, 70), v2 = R.heel(15, 35); for (m = 0; m < 12; m++) N.push(Math.max(5, Math.round(b2 + v2 * golf(m, p) + R.heel(-8, 8))));
    } else {
      mean = R.heel(-12, -4); amp = R.heel(50, 120) / 10; if (mean + amp > 6.4) amp = 6.4 - mean;
      temp(mean, amp);
      var b3 = R.heel(45, 70), v3 = R.heel(8, 22); for (m = 0; m < 12; m++) N.push(Math.max(5, Math.round(b3 + v3 * golf(m, p) + R.heel(-6, 6))));
    }
    var mx = Math.max.apply(null, Tm), mn = Math.min.apply(null, Tm), tot = som(N), gem = som(Tm) / 12;
    var ok = { A:mn >= 21 && tot >= 1000, Aw:mn >= 21 && tot >= 1000 && N.every(function(x){ return x !== 60; }), B:tot <= 230 && mx >= 15,
      C:mx >= 15 && mn >= 1 && mn <= 14 && tot >= Math.max(650, 20 * gem + 340), D:mx >= 14 && mn <= -8 && tot >= 500, E:mx <= 7 && tot >= 520 }[type];
    if (!ok || !uniek(Tm, true) || !uniek(Tm, false)) return null;
    return { T:Tm, N:N, zuid:zuid, type:type, tot:tot, max:mx, min:mn };
  }
  function plaats(R, typen){ for (var i = 0; i < 400; i++){ var p = plaatsVan(R, R.kies(typen)); if (p) return p; } throw new Error('geen klimaat gevonden'); }
  /* de klimaatgrafiek: staven voor neerslag, een lijn voor temperatuur, en de getallen eronder */
  function klimGraf(P, o){
    o = o || {};
    var sm = smal(), W = sm ? 430 : 640, L = 48, Rr = 48, top = o.kop ? 56 : 34, H = 196, pw = W - L - Rr, cw = pw / 12;
    var tlo = Math.min(0, Math.floor(Math.min.apply(null, P.T) / 10) * 10), thi = Math.max(30, Math.ceil(Math.max.apply(null, P.T) / 10) * 10);
    if (thi - tlo < 40) { if (tlo < 0) thi = tlo + 40; else thi = 40; }
    var nhi = Math.max(o.lijn60 ? 100 : 50, Math.ceil(Math.max.apply(null, P.N) / 50) * 50);
    function yt(t){ return top + (thi - t) / (thi - tlo) * H; } function yn(n){ return top + H - n / nhi * H; } function xm(i){ return L + cw * i + cw / 2; }
    var s = svg(W, top + H + 76, 'klimaatgrafiek', sm ? 430 : 640);
    if (o.kop) s += tekst(W / 2, 22, o.kop, 'getal');
    (o.nadruk || []).forEach(function(i){ s += '<rect x="' + r1(L + cw * i) + '" y="' + top + '" width="' + r1(cw) + '" height="' + (H + 62) + '" style="fill:var(--lr-3);opacity:.2"/>'; });
    for (var t = tlo; t <= thi; t += 10){ s += '<line x1="' + L + '" y1="' + r1(yt(t)) + '" x2="' + (W - Rr) + '" y2="' + r1(yt(t)) + '" class="as dun"/>' + tekst(L - 8, yt(t) + 5, tn(t), 'getal klein', 'text-anchor:end;fill:var(--lr-2)'); }
    var nst = nhi <= 100 ? 20 : nhi <= 250 ? 50 : 100;
    for (var n = 0; n <= nhi; n += nst) s += tekst(W - Rr + 8, yn(n) + 5, String(n), 'getal klein', 'text-anchor:start;fill:var(--lr-1)');
    s += tekst(L - 8, top - 14, '°C', 'getal klein', 'text-anchor:end;fill:var(--lr-2)') + tekst(W - Rr + 8, top - 14, 'mm', 'getal klein', 'text-anchor:start;fill:var(--lr-1)');
    P.N.forEach(function(v, i){ s += '<rect x="' + r1(L + cw * i + cw * .18) + '" y="' + r1(yn(v)) + '" width="' + r1(cw * .64) + '" height="' + r1(H - (yn(v) - top)) + '" style="fill:var(--lr-1);opacity:.65"/>'; });
    if (o.lijn60) s += '<line x1="' + L + '" y1="' + r1(yn(60)) + '" x2="' + (W - Rr) + '" y2="' + r1(yn(60)) + '" class="boog" style="stroke:var(--lr-1);stroke-width:2;stroke-dasharray:7 5"/>' + tekst(W - Rr - 4, yn(60) - 6, '60 mm', 'getal klein', 'text-anchor:end;fill:var(--lr-1)');
    s += '<line x1="' + L + '" y1="' + r1(yt(0)) + '" x2="' + (W - Rr) + '" y2="' + r1(yt(0)) + '" class="as"/>';
    s += '<polyline points="' + P.T.map(function(v, i){ return r1(xm(i)) + ',' + r1(yt(v)); }).join(' ') + '" class="boog" style="stroke:var(--lr-2)"/>';
    P.T.forEach(function(v, i){ s += '<circle cx="' + r1(xm(i)) + '" cy="' + r1(yt(v)) + '" r="3.5" style="fill:var(--lr-2)"/>'; });
    s += '<rect x="' + L + '" y="' + top + '" width="' + r1(pw) + '" height="' + H + '" class="rand" style="stroke-width:1.5"/>';
    var y0 = top + H;
    LET.forEach(function(l, i){ s += tekst(xm(i), y0 + 18, l, 'getal klein') + tekst(xm(i), y0 + 40, tn(P.T[i]), 'getal klein', 'fill:var(--lr-2);font-size:' + (sm ? 12 : 13) + 'px') + tekst(xm(i), y0 + 60, String(P.N[i]), 'getal klein', 'fill:var(--lr-1);font-size:' + (sm ? 12 : 13) + 'px'); });
    s += tekst(L - 8, y0 + 40, '°C', 'getal klein', 'text-anchor:end;fill:var(--lr-2)') + tekst(L - 8, y0 + 60, 'mm', 'getal klein', 'text-anchor:end;fill:var(--lr-1)');
    return s + '</svg>';
  }
  function idx(l, max){ return l.indexOf(max ? Math.max.apply(null, l) : Math.min.apply(null, l)); }
  var PLAATSNAAM = ['plaats A', 'plaats B', 'plaats C', 'plaats D', 'plaats E', 'plaats F', 'plaats G', 'plaats H'];

  G.push({ groep:{ id:'ak-klimgraf', niveau:'onderbouw', domein:'klimaat', naam:'Een klimaatgrafiek lezen',
      uit:'In een klimaatgrafiek zie je per maand de gemiddelde temperatuur (de lijn) en de neerslag (de staven). Je zoekt de warmste en koudste maand, het temperatuurverschil, de totale neerslag, de droge tijd en het halfrond.' },
    doelen:[
      { id:'ak-klim-maand', naam:'De warmste, koudste, natste en droogste maand', kort:'Temperatuur is de lijn, neerslag zijn de staven; zoek het hoogste of laagste punt',
        uit:'<p>Een <b>klimaatgrafiek</b> heeft twee delen. De <b>lijn</b> is de gemiddelde temperatuur per maand (links, in °C). De <b>staven</b> zijn de neerslag per maand (rechts, in mm).</p><p>De warmste maand vind je bij het <b>hoogste punt van de lijn</b>, de koudste bij het laagste. De natste maand heeft de <b>hoogste staaf</b>, de droogste de laagste.</p><p>Onder de grafiek staan de getallen per maand. Daarmee controleer je wat je ziet.</p>',
        wanneer:'je de belangrijkste dingen uit een klimaatgrafiek wilt halen.',
        maak:function(R){
          var soort = R.kies(['warmste', 'koudste', 'natste', 'droogste']), temp = soort === 'warmste' || soort === 'koudste', hoog = soort === 'warmste' || soort === 'natste', P;
          do { P = plaats(R, ['C', 'D', 'Aw', 'B', 'E']); } while (!temp && (!uniek(P.N, hoog)));
          var l = temp ? P.T : P.N, i = idx(l, hoog), naam = R.kies(PLAATSNAAM);
          return { vraag:'Wat is de ' + soort + ' maand?', context:'De klimaatgrafiek van ' + naam + '.', beeld:function(n){ return klimGraf(P, { nadruk:n >= 3 ? [i] : [] }); }, zelfBeeld:klimGraf(P),
            stappen:[
              kv('Kijk je naar de lijn of naar de staven?', ['de lijn: temperatuur', 'de staven: neerslag'], temp ? 0 : 1, temp ? 'Warm en koud gaat over temperatuur: de lijn.' : 'Nat en droog gaat over neerslag: de staven.'),
              kv('Zoek je het hoogste of het laagste punt?', ['het hoogste', 'het laagste'], hoog ? 0 : 1, soort === 'warmste' ? 'Het warmst is waar de lijn het hoogst is.' : soort === 'koudste' ? 'Het koudst is waar de lijn het laagst is.' : soort === 'natste' ? 'De meeste neerslag is de hoogste staaf.' : 'De minste neerslag is de laagste staaf.'),
              { tekst:'Welke maand is dat?', antwoord:mv(i), invoer:'tekst', hint:'Kijk welke letter eronder staat en controleer met de getallen: ' + MAAND[i] + ' met ' + (temp ? tc(l[i]) : l[i] + ' mm') + '.' } ] };
        } },
      { id:'ak-klim-verschil', naam:'Het temperatuurverschil', kort:'Warmste maand min koudste maand',
        uit:'<p>Het <b>temperatuurverschil</b> (de jaarlijkse temperatuurschommeling) is het verschil tussen de warmste en de koudste maand.</p><p>Reken: <b>warmste min koudste</b>. Is de koudste maand onder nul, dan tel je de afstand tot nul erbij op: van ' + MIN + '8 °C naar 22 °C is 8 + 22 = 30 graden.</p><p>Een klein verschil past bij een plaats aan zee of in de tropen, een groot verschil bij een plaats midden op een continent.</p>',
        wanneer:'je twee klimaten wilt vergelijken, bijvoorbeeld een zeeklimaat en een landklimaat.',
        maak:function(R){
          var P = plaats(R, ['C', 'D', 'D', 'B', 'E']), a = idx(P.T, true), b = idx(P.T, false), v = P.max - P.min;
          return { vraag:'Hoe groot is het temperatuurverschil?', context:'De klimaatgrafiek van ' + R.kies(PLAATSNAAM) + '.', beeld:function(n){ return klimGraf(P, { nadruk:(n >= 1 ? [a] : []).concat(n >= 2 ? [b] : []) }); }, zelfBeeld:klimGraf(P), eenheid:'°C',
            stappen:[
              { tekst:'Hoe warm is de warmste maand?', antwoord:nv(P.max), eenheid:'°C', hint:'Het hoogste punt van de lijn is ' + MAAND[a] + ': ' + tc(P.max) + '.' },
              { tekst:'Hoe warm is de koudste maand?', antwoord:nv(P.min), eenheid:'°C', hint:'Het laagste punt van de lijn is ' + MAAND[b] + ': ' + tc(P.min) + '.', fout:P.min < 0 ? FN(-P.min, 'Die maand is onder nul: zet er een min voor.') : null },
              { tekst:'Trek de koudste maand af van de warmste maand. Het verschil is …', antwoord:nv(v), eenheid:'°C',
                hint:P.min < 0 ? 'De koudste maand is onder nul. Tel de afstanden tot nul op: ' + (P.max < 0 ? '' : P.max + ' + ' + (-P.min) + ' = ') + v + '.' : P.max + ' ' + MIN + ' ' + P.min + ' = ' + v + '.',
                fout:P.min < 0 && P.max > 0 ? FN(P.max + P.min, 'Onder nul tel je de afstand tot nul erbij op.') : null } ] };
        } },
      { id:'ak-klim-neerslag', naam:'De totale neerslag', kort:'Tel de neerslag van alle twaalf maanden op',
        uit:'<p>De <b>jaarneerslag</b> is alle neerslag van een jaar bij elkaar. Je telt de twaalf staven op.</p><p>Gebruik de getallen onder de grafiek. Tel eerst januari tot en met juni, dan juli tot en met december, en tel de twee uitkomsten op. Zo maak je minder fouten.</p>',
        wanneer:'je wilt weten of een plaats nat of droog is, of een klimaat wilt bepalen.',
        maak:function(R){
          var P = plaats(R, ['C', 'D', 'Aw', 'B', 'E']), a = som(P.N.slice(0, 6)), b = som(P.N.slice(6)), t = a + b;
          return { vraag:'Hoeveel neerslag valt er per jaar?', context:'De klimaatgrafiek van ' + R.kies(PLAATSNAAM) + '.', beeld:function(n){ return klimGraf(P, { nadruk:n === 0 ? [] : n === 1 ? [0, 1, 2, 3, 4, 5] : n === 2 ? [6, 7, 8, 9, 10, 11] : [] }); }, zelfBeeld:klimGraf(P), eenheid:'mm',
            stappen:[
              { tekst:'Januari tot en met juni: ' + P.N.slice(0, 6).join(' + ') + ' = …', antwoord:nv(a), eenheid:'mm', hint:'Tel de zes getallen op. Het is ' + a + ' mm.' },
              { tekst:'Juli tot en met december: ' + P.N.slice(6).join(' + ') + ' = …', antwoord:nv(b), eenheid:'mm', hint:'Tel de zes getallen op. Het is ' + b + ' mm.' },
              { tekst:'Tel de twee uitkomsten op. Samen is dat …', antwoord:nv(t), eenheid:'mm', hint:a + ' + ' + b + ' = ' + t + ' mm.' } ] };
        } },
      { id:'ak-klim-droog', naam:'De droge tijd in de tropen', kort:'Een maand met minder dan 60 mm neerslag is een droge maand',
        uit:'<p>In de tropen is het altijd warm. Wat verschilt, is de <b>neerslag</b>. Veel tropische plaatsen hebben een <b>natte tijd</b> en een <b>droge tijd</b>.</p><p>Een maand met <b>minder dan 60 mm</b> neerslag noem je in de tropen een droge maand. Zo doet het klimaatsysteem van Köppen het.</p><p>Kijk welke staven onder de stippellijn van 60 mm blijven. Die maanden samen zijn de droge tijd.</p>',
        wanneer:'je een savanneklimaat leest of wilt weten wanneer het regenseizoen is.',
        maak:function(R){
          var P = plaats(R, ['Aw']), droog = [], m;
          for (m = 0; m < 12; m++) if (P.N[m] < 60) droog.push(m);
          var begin = droog.filter(function(x){ return droog.indexOf((x + 11) % 12) < 0; })[0], eind = droog.filter(function(x){ return droog.indexOf((x + 1) % 12) < 0; })[0];
          return { vraag:'Hoeveel droge maanden zijn er?', context:'De klimaatgrafiek van ' + R.kies(PLAATSNAAM) + ', in de tropen.', beeld:function(n){ return klimGraf(P, { lijn60:true, nadruk:n >= 2 ? droog : [] }); }, zelfBeeld:klimGraf(P, { lijn60:true }),
            stappen:[
              { tekst:'In welke maand begint de droge tijd? Dat is de eerste maand onder de 60 mm.', antwoord:mv(begin), invoer:'tekst', hint:'Zoek waar de staven onder de stippellijn zakken: ' + MAAND[begin] + ' met ' + P.N[begin] + ' mm.' + (begin > eind ? ' De droge tijd loopt door over de jaarwisseling.' : '') },
              { tekst:'In welke maand eindigt de droge tijd? Dat is de laatste maand onder de 60 mm.', antwoord:mv(eind), invoer:'tekst', hint:'Daarna komen de staven weer boven de stippellijn. De laatste droge maand is ' + MAAND[eind] + ' met ' + P.N[eind] + ' mm.' },
              { tekst:'Hoeveel droge maanden zijn er?', antwoord:String(droog.length), hint:'Tel van ' + MAAND[begin] + ' tot en met ' + MAAND[eind] + ': ' + droog.length + ' maanden.', fout:F(droog.length - 1, 'Tel de eerste en de laatste maand allebei mee.') } ] };
        } },
      { id:'ak-klim-halfrond', naam:'Noordelijk of zuidelijk halfrond?', kort:'Is het in juni, juli en augustus warm, dan ligt de plaats op het noordelijk halfrond',
        uit:'<p>Als het op het noordelijk halfrond zomer is, is het op het zuidelijk halfrond winter. Dat komt doordat de aarde scheef staat.</p><p>Op het <b>noordelijk halfrond</b> zijn <b>juni, juli en augustus</b> de warmste maanden. Op het <b>zuidelijk halfrond</b> zijn dat <b>december, januari en februari</b>.</p><p>Zoek dus de warmste maand en kijk in welke groep hij valt.</p>',
        wanneer:'je bij een klimaatgrafiek wilt zeggen waar op aarde de plaats ligt.',
        maak:function(R){
          var P = plaats(R, ['C', 'C', 'D', 'B']), a = idx(P.T, true), noord = [5, 6, 7].indexOf(a) >= 0, zd = [11, 0, 1].indexOf(a) >= 0;
          if (!noord && !zd) return this.maak(R);
          return eindKeuze({ vraag:'Op welk halfrond ligt deze plaats?', context:'De klimaatgrafiek van ' + R.kies(PLAATSNAAM) + '.', beeld:function(n){ return klimGraf(P, { nadruk:n >= 1 ? [a] : [] }); }, zelfBeeld:klimGraf(P),
            stappen:[
              { tekst:'Wat is de warmste maand?', antwoord:mv(a), invoer:'tekst', hint:'Zoek het hoogste punt van de lijn: ' + MAAND[a] + '.' },
              kv('In welke groep valt die maand?', ['juni, juli of augustus', 'december, januari of februari'], noord ? 0 : 1, MAAND[a] + ' hoort bij ' + (noord ? 'juni, juli en augustus.' : 'december, januari en februari.')),
              kv('Op welk halfrond ligt de plaats?', ['het noordelijk halfrond', 'het zuidelijk halfrond'], noord ? 0 : 1, noord ? 'Zomer in juni tot augustus: noordelijk halfrond.' : 'Zomer in december tot februari: zuidelijk halfrond.') ] });
        } }
    ] });

  /* ---------- klimaat bepalen ---------- */
  var KLIM = ['A: tropisch klimaat', 'B: droog klimaat', 'C: gematigd klimaat', 'D: landklimaat', 'E: poolklimaat'];
  function kopVan(P){ return 'jaarneerslag ' + P.tot + ' mm'; }
  /* een bergprofiel met de temperatuur onder en boven */
  function berg(h1, h2, t1, t2){
    var s = svg(420, 220, 'berg met de temperatuur onderaan en op de top', 440), yb = 190, yt = 40;
    s += '<path d="M20 ' + yb + ' L150 ' + (yb - 40) + ' L260 ' + yt + ' L330 ' + (yb - 70) + ' L400 ' + yb + ' Z" class="deel" style="fill:var(--lr-4);fill-opacity:.25"/>';
    s += '<circle cx="40" cy="' + (yb - 4) + '" r="6" style="fill:var(--lr-1)"/><circle cx="260" cy="' + yt + '" r="6" style="fill:var(--lr-2)"/>';
    s += tekst(70, yb - 30, tp(h1) + ' m', 'getal klein', 'text-anchor:start') + tekst(70, yb - 12, t1, 'getal klein', 'text-anchor:start;fill:var(--lr-1)');
    s += tekst(276, yt - 4, tp(h2) + ' m', 'getal klein', 'text-anchor:start') + tekst(276, yt + 14, t2, 'getal klein', 'text-anchor:start;fill:var(--lr-2)');
    return s + '</svg>';
  }
  G.push({ groep:{ id:'ak-klimaat', niveau:'bovenbouw', domein:'klimaat', naam:'Een klimaat bepalen',
      uit:'Met het stappenplan van Köppen bepaal je uit een klimaatgrafiek of het een tropisch (A), droog (B), gematigd (C), land- (D) of poolklimaat (E) is. En je rekent uit hoeveel kouder het hoger op een berg is.' },
    doelen:[
      { id:'ak-kop-temp', naam:'Klimaat A, C, D of E uit de temperatuur', kort:'Kijk eerst naar de warmste maand, dan naar de koudste maand',
        uit:'<p>De klimaten A, C, D en E bepaal je met de <b>temperatuur</b>. Valt er genoeg neerslag, dan gaat het zo:</p><p><b>1.</b> Is de warmste maand kouder dan 10 °C? Dan is het <b>E</b>, een poolklimaat.<br><b>2.</b> Is de koudste maand warmer dan 18 °C? Dan is het <b>A</b>, een tropisch klimaat.<br><b>3.</b> Is de koudste maand kouder dan ' + MIN + '3 °C? Dan is het <b>D</b>, een landklimaat. Anders is het <b>C</b>, een gematigd klimaat.</p>',
        wanneer:'je de hoofdgroep van een klimaat wilt bepalen en er genoeg neerslag valt.',
        maak:function(R){
          var P = plaats(R, ['A', 'Aw', 'C', 'C', 'D', 'D', 'E']), k = P.type === 'Aw' ? 'A' : P.type, a = idx(P.T, true), b = idx(P.T, false), kl = KLIM.filter(function(x){ return x.charAt(0) !== 'B'; });
          var st = [
            { tekst:'Hoe warm is de warmste maand?', antwoord:nv(P.max), eenheid:'°C', hint:'Het hoogste punt van de lijn: ' + MAAND[a] + ', ' + tc(P.max) + '.' },
            kv('Is de warmste maand kouder dan 10 °C?', ['ja: E (poolklimaat)', 'nee: kijk naar de koudste maand'], k === 'E' ? 0 : 1, tc(P.max) + ' is ' + (k === 'E' ? 'kouder' : 'warmer') + ' dan 10 °C.') ];
          if (k !== 'E'){
            st.push({ tekst:'Hoe warm is de koudste maand?', antwoord:nv(P.min), eenheid:'°C', hint:'Het laagste punt van de lijn: ' + MAAND[b] + ', ' + tc(P.min) + '.' });
            st.push(kv('Waar ligt de koudste maand?', ['warmer dan 18 °C: A', 'tussen ' + MIN + '3 en 18 °C: C', 'kouder dan ' + MIN + '3 °C: D'], k === 'A' ? 0 : k === 'C' ? 1 : 2, 'De koudste maand is ' + tc(P.min) + '.'));
          }
          st.push(kv('Welk klimaat is het?', kl, ['A', 'C', 'D', 'E'].indexOf(k), 'Volg de stappen hierboven: het is ' + kl[['A', 'C', 'D', 'E'].indexOf(k)] + '.'));
          return eindKeuze({ vraag:'Welk klimaat is dit?', context:'De klimaatgrafiek van ' + R.kies(PLAATSNAAM) + '. Er valt genoeg neerslag.', beeld:klimGraf(P), zelfBeeld:klimGraf(P), stappen:st });
        } },
      { id:'ak-kop-bepaal', naam:'Het stappenplan van Köppen', kort:'E, dan B, dan A, dan D of C: stel de vragen in deze volgorde',
        uit:'<p>Met dit stappenplan bepaal je de hoofdgroep van elk klimaat. Stel de vragen <b>in deze volgorde</b> en stop bij het eerste ja.</p><p><b>1.</b> Is de warmste maand kouder dan 10 °C? Dan <b>E</b> (poolklimaat).<br><b>2.</b> Valt er minder dan 400 mm neerslag per jaar? Dan <b>B</b> (droog klimaat).<br><b>3.</b> Is de koudste maand warmer dan 18 °C? Dan <b>A</b> (tropisch klimaat).<br><b>4.</b> Is de koudste maand kouder dan ' + MIN + '3 °C? Dan <b>D</b> (landklimaat). Anders <b>C</b> (gematigd klimaat).</p><p>Sommige boeken gebruiken bij stap 2 een grens van 500 mm. Bij deze opgaven maakt dat niet uit.</p>',
        wanneer:'je bij een klimaatgrafiek moet zeggen welk klimaat het is.',
        maak:function(R){
          var P = plaats(R, ['A', 'Aw', 'B', 'B', 'C', 'C', 'D', 'D', 'E']), k = P.type === 'Aw' ? 'A' : P.type, st = [];
          st.push(kv('Stap 1: is de warmste maand kouder dan 10 °C?', ['ja: E', 'nee: verder'], k === 'E' ? 0 : 1, 'De warmste maand is ' + tc(P.max) + '.'));
          if (k !== 'E') st.push(kv('Stap 2: valt er minder dan 400 mm neerslag per jaar?', ['ja: B', 'nee: verder'], k === 'B' ? 0 : 1, 'Boven de grafiek staat de jaarneerslag: ' + P.tot + ' mm.'));
          if (k !== 'E' && k !== 'B') st.push(kv('Stap 3: is de koudste maand warmer dan 18 °C?', ['ja: A', 'nee: verder'], k === 'A' ? 0 : 1, 'De koudste maand is ' + tc(P.min) + '.'));
          if (k === 'C' || k === 'D') st.push(kv('Stap 4: is de koudste maand kouder dan ' + MIN + '3 °C?', ['ja: D', 'nee: C'], k === 'D' ? 0 : 1, 'De koudste maand is ' + tc(P.min) + '.'));
          st.push(kv('Welk klimaat is het?', KLIM, 'ABCDE'.indexOf(k), 'Bij de stap waar je ja zei, of na stap 4: ' + KLIM['ABCDE'.indexOf(k)] + '.'));
          var b = klimGraf(P, { kop:kopVan(P) });
          return eindKeuze({ vraag:'Welk klimaat is dit?', context:'De klimaatgrafiek van ' + R.kies(PLAATSNAAM) + '.', beeld:b, zelfBeeld:b, stappen:st });
        } },
      { id:'ak-klim-hoogte', naam:'Temperatuur en hoogte', kort:'Per 100 m hoger wordt het 0,6 °C kouder',
        uit:'<p>Hoe hoger je komt, hoe <b>kouder</b> het wordt. In de lucht daalt de temperatuur ongeveer <b>0,6 °C per 100 meter</b>.</p><p>Reken eerst het hoogteverschil uit. Deel door 100: zo vaak gaat er 0,6 °C af. Trek de daling af van de temperatuur onderaan.</p><p>Voorbeeld: van 0 naar 2000 m is 20 keer 100 m. 20 × 0,6 = 12 °C kouder.</p>',
        wanneer:'je wilt weten hoe koud het op een berg is, of waarom er sneeuw ligt op een hoge berg in de tropen.',
        maak:function(R){
          var h1 = R.kies([0, 0, 100, 200, 300, 500, 800, 1000, 1200]), d = R.kies([500, 800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 4000]), h2 = h1 + d, t1 = R.heel(8, 32);
          var k = d / 100, dl = rnd(k * 0.6, 1), t2 = rnd(t1 - dl, 1);
          return { vraag:'Hoe warm is het op ' + tp(h2) + ' m hoogte?', context:'Onderaan, op ' + tp(h1) + ' m, is het ' + tc(t1) + '. Per 100 m hoger wordt het 0,6 °C kouder.', beeld:function(n){ return berg(h1, h2, tc(t1), n >= 4 ? tc(t2) : '? °C'); }, eenheid:'°C',
            stappen:[
              { tekst:'Hoeveel meter is het hoogteverschil?', antwoord:nv(d), eenheid:'m', hint:tp(h2) + ' ' + MIN + ' ' + tp(h1) + ' = ' + tp(d) + ' m.' },
              { tekst:'Hoe vaak is dat 100 m?', antwoord:nv(k), hint:tp(d) + ' : 100 = ' + k + '.' },
              { tekst:'Hoeveel graden wordt het kouder?', antwoord:nv(dl), eenheid:'°C', hint:k + ' × 0,6 = ' + tn(dl) + ' °C.', fout:FN(k * 6, 'Het is 0,6 per 100 m, niet 6.') },
              { tekst:'Hoe warm is het boven?', antwoord:nv(t2), eenheid:'°C', hint:tn(t1) + ' ' + MIN + ' ' + tn(dl) + ' = ' + tn(t2) + ' °C.', fout:FN(rnd(t1 + dl, 1), 'Hoger is kouder: trek af.') } ] };
        } }
    ] });

  /* ---------- rekenen met bevolking ---------- */
  var GEBIED = [['De gemeente', 'gemeente'], ['De provincie', 'provincie'], ['Het eiland', 'eiland'], ['Het land', 'land'], ['De regio', 'regio']];
  G.push({ groep:{ id:'ak-bevolking', niveau:'onderbouw', domein:'bevolking', naam:'Rekenen met bevolking',
      uit:'Hoe druk is het ergens, hoe groeit een bevolking door geboorte en sterfte, wat doet migratie, en hoeveel mensen wonen in de stad. Elke berekening een eigen doel.' },
    doelen:[
      { id:'ak-bev-dicht', naam:'Bevolkingsdichtheid', kort:'Aantal inwoners gedeeld door de oppervlakte in km²',
        uit:'<p>De <b>bevolkingsdichtheid</b> zegt hoeveel mensen er gemiddeld op 1 km² wonen.</p><p>Reken: <b>inwoners : oppervlakte</b>. De uitkomst schrijf je als inwoners per km².</p><p>Voorbeeld: 60.000 inwoners op 150 km². 60.000 : 150 = 400 inwoners per km².</p>',
        wanneer:'je wilt weten hoe druk bevolkt een gebied is, of twee gebieden wilt vergelijken.',
        maak:function(R){
          var D, A, P; do { D = R.kies([8, 15, 24, 35, 48, 60, 85, 120, 150, 230, 340, 410, 520, 860, 1200]); A = R.kies([40, 75, 120, 160, 250, 400, 600, 1500, 3200, 12000, 45000]); P = D * A; } while (P < 3000 || P > 90000000);
          var g = R.kies(GEBIED);
          return { vraag:'Wat is de bevolkingsdichtheid?', context:g[0] + ' heeft ' + tp(P) + ' inwoners en is ' + tp(A) + ' km² groot.', eenheid:'inwoners per km²',
            stappen:[
              kv('Wat deel je door wat?', ['het aantal inwoners : de oppervlakte', 'de oppervlakte : het aantal inwoners'], 0, 'Je wilt weten hoeveel mensen er op 1 km² wonen: deel de mensen over de km².'),
              { tekst:tp(P) + ' : ' + tp(A) + ' = …', antwoord:nv(D), eenheid:'inwoners per km²', hint:tp(P) + ' : ' + tp(A) + ' = ' + tp(D) + '. Streep eerst evenveel nullen weg als het kan.', fout:F(rnd(A / P, 6), 'Je deelde andersom. Inwoners gedeeld door km².') } ] };
        } },
      { id:'ak-bev-inw', naam:'Inwoners uit de dichtheid', kort:'Dichtheid keer oppervlakte geeft het aantal inwoners',
        uit:'<p>Weet je de bevolkingsdichtheid en de oppervlakte? Dan reken je het aantal <b>inwoners</b> uit.</p><p>Reken: <b>dichtheid × oppervlakte</b>. Wonen er 250 mensen per km² op 80 km², dan zijn dat 250 × 80 = 20.000 inwoners.</p>',
        wanneer:'je de dichtheid kent en wilt weten hoeveel mensen er wonen.',
        maak:function(R){
          var D = R.kies([12, 25, 40, 75, 120, 250, 300, 450, 800, 1500]), A = R.kies([20, 40, 80, 120, 200, 350, 500, 1000, 2400]), P = D * A, g = R.kies(GEBIED);
          return { vraag:'Hoeveel inwoners heeft ' + g[0].toLowerCase() + '?', context:g[0] + ' is ' + tp(A) + ' km² groot. De bevolkingsdichtheid is ' + tp(D) + ' inwoners per km².', eenheid:'inwoners',
            stappen:[
              kv('Wat reken je uit?', ['dichtheid × oppervlakte', 'dichtheid : oppervlakte'], 0, 'Op elke km² wonen ' + D + ' mensen. Je hebt ' + A + ' km²: dus keer.'),
              { tekst:tp(D) + ' × ' + tp(A) + ' = …', antwoord:nv(P), eenheid:'inwoners', hint:tp(D) + ' × ' + tp(A) + ' = ' + tp(P) + '.' } ] };
        } },
      { id:'ak-bev-groei', naam:'Natuurlijke groei', kort:'Geboortecijfer min sterftecijfer, in promille',
        uit:'<p>Het <b>geboortecijfer</b> is het aantal geboorten per 1000 inwoners per jaar. Het <b>sterftecijfer</b> is het aantal sterfgevallen per 1000 inwoners. Per 1000 schrijf je als <b>‰</b> (promille).</p><p>De <b>natuurlijke groei</b> = geboortecijfer ' + MIN + ' sterftecijfer.</p><p>Sterven er meer mensen dan er geboren worden, dan is de uitkomst negatief. Dat heet een natuurlijke afname.</p>',
        wanneer:'je wilt weten of een bevolking groeit door geboorte en sterfte.',
        maak:function(R){
          var g, s; if (R.heel(0, 3)){ g = R.heel(9, 42); s = R.heel(5, Math.min(14, g - 1)); } else { g = R.heel(7, 10); s = R.heel(g + 1, 14); }
          var ng = g - s, land = R.kies(['land A', 'land B', 'land C', 'land D', 'land E']);
          return { vraag:'Wat is de natuurlijke groei van ' + land + '?', context:'Het geboortecijfer is ' + g + ' ‰. Het sterftecijfer is ' + s + ' ‰.', eenheid:'‰',
            stappen:[
              kv('Hoe reken je de natuurlijke groei uit?', ['geboortecijfer ' + MIN + ' sterftecijfer', 'sterftecijfer ' + MIN + ' geboortecijfer', 'geboortecijfer + sterftecijfer'], 0, 'Geboorten komen erbij, sterfgevallen gaan eraf.'),
              { tekst:g + ' ' + MIN + ' ' + s + ' = …', antwoord:nv(ng), eenheid:'‰', hint:g + ' ' + MIN + ' ' + s + ' = ' + tn(ng) + (ng < 0 ? '. Er sterven meer mensen dan er geboren worden: de uitkomst is negatief.' : '.'),
                fout:ng < 0 ? FN(-ng, 'Er sterven meer mensen dan er geboren worden. Zet er een min voor.') : FN(g + s, 'Je telde op. Sterfte gaat eraf.') } ] };
        } },
      { id:'ak-bev-migr', naam:'Het migratiesaldo', kort:'Immigratie min emigratie',
        uit:'<p><b>Immigratie</b> is het aantal mensen dat in een land komt wonen. <b>Emigratie</b> is het aantal mensen dat vertrekt.</p><p>Het <b>migratiesaldo</b> = immigratie ' + MIN + ' emigratie.</p><p>Is het saldo positief, dan komen er meer mensen bij dan er weggaan: een vestigingsoverschot. Is het negatief, dan is er een vertrekoverschot.</p>',
        wanneer:'je wilt weten of een land groeit of krimpt door verhuizingen.',
        maak:function(R){
          var I = R.heel(8, 250) * 1000, E = R.heel(8, 250) * 1000; if (I === E) E += 3000;
          var sd = I - E, land = R.kies(['land A', 'land B', 'land C', 'land D', 'land E']);
          return { vraag:'Wat is het migratiesaldo van ' + land + '?', context:'In een jaar kwamen er ' + tp(I) + ' mensen in ' + land + ' wonen. Er vertrokken ' + tp(E) + ' mensen.', eenheid:'mensen',
            stappen:[
              kv('Welke is de immigratie?', [tp(I) + ' mensen die komen', tp(E) + ' mensen die vertrekken'], 0, 'Immigratie: mensen die in het land komen wonen.'),
              kv('Komen er meer mensen bij dan er vertrekken?', ['ja: het saldo is positief, een vestigingsoverschot', 'nee: het saldo is negatief, een vertrekoverschot'], sd > 0 ? 0 : 1, 'Vergelijk ' + tp(I) + ' en ' + tp(E) + '.'),
              { tekst:tp(I) + ' ' + MIN + ' ' + tp(E) + ' = …', antwoord:nv(sd), eenheid:'mensen', hint:tp(I) + ' ' + MIN + ' ' + tp(E) + ' = ' + tp(sd) + (sd < 0 ? '. Er vertrekken meer mensen dan er komen: negatief.' : '.'),
                fout:sd < 0 ? FN(-sd, 'Er vertrekken meer mensen dan er komen. Zet er een min voor.') : null } ] };
        } },
      { id:'ak-bev-stad', naam:'De verstedelijkingsgraad', kort:'Stedelijke bevolking gedeeld door de hele bevolking, keer 100',
        uit:'<p>De <b>verstedelijkingsgraad</b> is het percentage van de bevolking dat in steden woont.</p><p>Reken: <b>stedelijke bevolking : totale bevolking × 100%</b>.</p><p>Voorbeeld: 6 miljoen van de 8 miljoen mensen wonen in de stad. 6 : 8 = 0,75. Keer 100 is <b>75%</b>.</p>',
        wanneer:'je wilt vergelijken hoe stedelijk landen zijn.',
        maak:function(R){
          var N = R.kies([2, 4, 5, 8, 10, 12, 16, 20, 25, 40, 50, 80]) * 1000000, p = R.heel(15, 92), S = N * p / 100, land = R.kies(['land A', 'land B', 'land C', 'land D', 'land E']);
          return { vraag:'Wat is de verstedelijkingsgraad?', context:land.charAt(0).toUpperCase() + land.slice(1) + ' heeft ' + tp(N) + ' inwoners. Daarvan wonen er ' + tp(S) + ' in een stad.', eenheid:'%',
            stappen:[
              { tekst:tp(S) + ' : ' + tp(N) + ' = …', antwoord:nv(p / 100), hint:'Deel de mensen in de stad door alle mensen: ' + tn(p / 100) + '.', fout:F(rnd(N / S, 4), 'Je deelde andersom. Stad gedeeld door totaal.') },
              { tekst:'Keer 100. De verstedelijkingsgraad is …', antwoord:pv(p), eenheid:'%', hint:tn(p / 100) + ' × 100 = ' + p + '%.' } ] };
        } }
    ] });

  /* ---------- de bevolkingspiramide ---------- */
  var VORM = { piramide:[9.2, 8.2, 7.1, 6.0, 4.8, 3.6, 2.4, 1.4, 0.5], urn:[3.8, 4.6, 5.4, 6.0, 6.6, 6.8, 6.2, 5.0, 3.6], zuil:[6.0, 6.0, 6.0, 5.9, 5.9, 5.8, 5.5, 4.8, 3.4] };
  var LFT = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];
  /* in tienden van procenten; mannen en vrouwen samen 1000 */
  function piramide(R, vorm){
    for (var poging = 0; poging < 200; poging++){
      var b = VORM[vorm], ruis = vorm === 'zuil' ? 1 : 5;
      var m = b.map(function(v){ return v * (1 + R.heel(-ruis, ruis) / 100); }), v = b.map(function(x, i){ return x * (1 + R.heel(-ruis, ruis) / 100) * (i >= 6 ? 1.15 : 1); });
      var tot = som(m) + som(v), M = m.map(function(x){ return Math.round(x / tot * 1000); }), V = v.map(function(x){ return Math.round(x / tot * 1000); });
      var rest = 1000 - som(M) - som(V); V[3] += rest;
      var ok = [M, V].every(function(l){ var q = l[0] / l[1]; return vorm === 'piramide' ? q > 1.07 : vorm === 'urn' ? q < .9 : q > .97 && q < 1.03; });
      if (ok && M.concat(V).every(function(x){ return x > 0; })) return { M:M, V:V };
    }
    return { M:[100, 90, 80, 60, 50, 40, 30, 20, 10], V:[100, 90, 80, 60, 50, 40, 30, 30, 20] };
  }
  function pirTeken(P, o){
    o = o || {};
    var W = 480, mid = W / 2, half = 34, sc = 15, rh = 24, top = 34, s = svg(W, top + 9 * rh + 30, 'bevolkingspiramide', 520);
    s += tekst(mid - 120, 18, 'mannen', 'getal', 'fill:var(--lr-1)') + tekst(mid + 120, 18, 'vrouwen', 'getal', 'fill:var(--lr-2)');
    for (var i = 0; i < 9; i++){
      var y = top + (8 - i) * rh, m = P.M[i] / 10, v = P.V[i] / 10, nad = (o.nadruk || []).indexOf(i) >= 0;
      if (nad) s += '<rect x="4" y="' + (y - 1) + '" width="' + (W - 8) + '" height="' + rh + '" style="fill:var(--lr-3);opacity:.2"/>';
      s += '<rect x="' + r1(mid - half - m * sc) + '" y="' + (y + 2) + '" width="' + r1(m * sc) + '" height="' + (rh - 5) + '" style="fill:var(--lr-1);opacity:.7"/>';
      s += '<rect x="' + (mid + half) + '" y="' + (y + 2) + '" width="' + r1(v * sc) + '" height="' + (rh - 5) + '" style="fill:var(--lr-2);opacity:.7"/>';
      s += tekst(mid, y + 16, LFT[i], 'getal klein');
      if (o.getallen){ s += tekst(mid - half - m * sc - 5, y + 16, tn(m), 'getal klein', 'text-anchor:end') + tekst(mid + half + v * sc + 5, y + 16, tn(v), 'getal klein', 'text-anchor:start'); }
    }
    s += tekst(mid, top + 9 * rh + 20, o.getallen ? 'leeftijd in jaren; getallen in % van de hele bevolking' : 'leeftijd in jaren', 'getal klein');
    return s + '</svg>';
  }
  G.push({ groep:{ id:'ak-piramide', niveau:'onderbouw', domein:'bevolking', naam:'De bevolkingspiramide',
      uit:'Een bevolkingspiramide laat zien hoe oud de mensen in een land zijn. Aan de vorm zie je of de bevolking jong of oud is en of ze groeit of krimpt. Met de getallen reken je uit welk deel jong of oud is.' },
    doelen:[
      { id:'ak-pir-vorm', naam:'Groeit of krimpt de bevolking?', kort:'Vergelijk de onderste balk met de balk erboven',
        uit:'<p>In een <b>bevolkingspiramide</b> staan links de mannen en rechts de vrouwen. Onderaan de jongste mensen, bovenaan de oudste.</p><p>Kijk naar de <b>onderste balk</b> (de kinderen). Is die breder dan de balk erboven? Dan worden er steeds meer kinderen geboren: de bevolking is <b>jong</b> en <b>groeit</b>. Dat is de echte piramidevorm.</p><p>Is de onderste balk smaller? Dan worden er minder kinderen geboren: de bevolking is <b>oud</b> (vergrijsd) en gaat <b>krimpen</b>. Dat heet een urnvorm. Zijn de balken ongeveer even breed, dan blijft de bevolking ongeveer gelijk.</p>',
        wanneer:'je bij een bevolkingspiramide moet zeggen wat er met de bevolking gebeurt.',
        maak:function(R){
          var vorm = R.kies(['piramide', 'piramide', 'urn', 'urn', 'zuil']), P = piramide(R, vorm), land = R.kies(['land A', 'land B', 'land C', 'land D', 'land E', 'land F']);
          var b = function(n){ return pirTeken(P, { nadruk:n === 1 ? [0, 1] : [] }); };
          var bi = vorm === 'piramide' ? 0 : vorm === 'urn' ? 1 : 2;
          if (vorm !== 'zuil' && R.heel(0, 2) === 0) return eindKeuze({ vraag:'Is dit een jonge of een oude bevolking?', context:'De bevolkingspiramide van ' + land + '.', beeld:b, zelfBeeld:b(0),
            stappen:[
              kv('Vergelijk de onderste balk (0 tot 9 jaar) met de balk erboven (10 tot 19 jaar). De onderste balk is …', ['breder', 'smaller'], bi, 'Kijk hoe ver de onderste balken naar links en rechts gaan, en vergelijk met de balken erboven.'),
              kv('Is dit een jonge of een oude bevolking?', ['een jonge bevolking', 'een oude (vergrijsde) bevolking'], bi, bi ? 'Weinig kinderen en relatief veel ouderen: een oude bevolking.' : 'Veel kinderen: een jonge bevolking.') ] });
          return eindKeuze({ vraag:'Groeit of krimpt deze bevolking?', context:'De bevolkingspiramide van ' + land + '.', beeld:b, zelfBeeld:b(0),
            stappen:[
              kv('Vergelijk de onderste balk (0 tot 9 jaar) met de balk erboven (10 tot 19 jaar). De onderste balk is …', ['breder', 'smaller', 'ongeveer even breed'], bi, 'Kijk hoe ver de onderste balken naar links en rechts gaan, en vergelijk met de balken erboven.'),
              kv('Worden er nu meer of minder kinderen geboren dan tien tot twintig jaar geleden?', ['meer', 'minder', 'ongeveer evenveel'], bi, 'Een bredere onderste balk betekent meer kinderen, een smallere minder.'),
              kv('Wat gebeurt er met de bevolking?', ['de bevolking groeit', 'de bevolking krimpt', 'de bevolking blijft ongeveer gelijk'], bi, ['Steeds meer kinderen: de bevolking groeit.', 'Steeds minder kinderen: de bevolking gaat krimpen.', 'Ongeveer evenveel kinderen: de bevolking blijft ongeveer gelijk.'][bi]) ] });
        } },
      { id:'ak-pir-proc', naam:'Percentages uit de piramide', kort:'Tel de balken van de mannen en de vrouwen bij elkaar op',
        uit:'<p>Bij elke balk staat welk <b>percentage van de hele bevolking</b> het is. Alle balken samen zijn 100%.</p><p>Wil je weten hoeveel procent jonger is dan 20? Tel dan de balken van 0 tot 9 en van 10 tot 19 op, van de <b>mannen én de vrouwen</b>.</p>',
        wanneer:'je wilt weten welk deel van de bevolking jong of oud is.',
        maak:function(R){
          var vorm = R.kies(['piramide', 'urn', 'zuil']), P = piramide(R, vorm), jong = R.heel(0, 1), rij = jong ? [0, 1] : [6, 7, 8];
          var sm = som(rij.map(function(i){ return P.M[i]; })) / 10, sv = som(rij.map(function(i){ return P.V[i]; })) / 10, st = rnd(sm + sv, 1);
          sm = rnd(sm, 1); sv = rnd(sv, 1);
          var wie = jong ? 'jonger dan 20 jaar' : '60 jaar of ouder', b = function(n){ return pirTeken(P, { getallen:true, nadruk:n >= 1 ? rij : [] }); };
          var lijstM = rij.map(function(i){ return tn(P.M[i] / 10); }).join(' + '), lijstV = rij.map(function(i){ return tn(P.V[i] / 10); }).join(' + ');
          return { vraag:'Hoeveel procent van de bevolking is ' + wie + '?', context:'De bevolkingspiramide van ' + R.kies(['land A', 'land B', 'land C', 'land D']) + '.', beeld:b, zelfBeeld:b(0), eenheid:'%',
            stappen:[
              { tekst:'De mannen: ' + lijstM + ' = …', antwoord:pv(sm), eenheid:'%', hint:'Tel de getallen links op: ' + tn(sm) + '%.' },
              { tekst:'De vrouwen: ' + lijstV + ' = …', antwoord:pv(sv), eenheid:'%', hint:'Tel de getallen rechts op: ' + tn(sv) + '%.' },
              { tekst:'Tel de mannen en de vrouwen op. Samen is dat …', antwoord:pv(st), eenheid:'%', hint:tn(sm) + ' + ' + tn(sv) + ' = ' + tn(st) + '%.', fout:F(tn(sm), 'Tel de vrouwen er ook bij.') } ] };
        } }
    ] });

  /* ---------- bevolkingsgroei, bovenbouw ---------- */
  G.push({ groep:{ id:'ak-bevgroei', niveau:'bovenbouw', domein:'bevolking', naam:'Bevolkingsgroei berekenen',
      uit:'Van promille naar aantallen en procenten, de totale groei met migratie erbij, en de verdubbelingstijd van een bevolking.' },
    doelen:[
      { id:'ak-bev-aantal', naam:'Van promille naar aantallen', kort:'Deel de bevolking door 1000 en vermenigvuldig met het cijfer',
        uit:'<p>Een geboortecijfer van 12 ‰ betekent: <b>12 geboorten per 1000 inwoners</b>.</p><p>Wil je het aantal geboorten weten? Reken uit hoeveel keer 1000 inwoners er zijn (deel door 1000). Vermenigvuldig dat met het cijfer.</p><p>Voorbeeld: 5.000.000 inwoners en 12 ‰. 5.000.000 : 1000 = 5000. 5000 × 12 = <b>60.000 geboorten</b>.</p>',
        wanneer:'je wilt weten hoeveel mensen er in een jaar geboren worden of sterven.',
        maak:function(R){
          var P = R.kies([2, 4, 5, 8, 10, 12, 17, 20, 30, 45, 60]) * 1000000 + R.kies([0, 0, 500000]), c = R.heel(6, 38), k = P / 1000, a = k * c, wat = R.heel(0, 1) ? ['geboortecijfer', 'geboorten'] : ['sterftecijfer', 'sterfgevallen'];
          return { vraag:'Hoeveel ' + wat[1] + ' zijn er in een jaar?', context:'Een land heeft ' + tp(P) + ' inwoners. Het ' + wat[0] + ' is ' + c + ' ‰.', eenheid:wat[1],
            stappen:[
              { tekst:'Hoe vaak 1000 inwoners zijn er? ' + tp(P) + ' : 1000 = …', antwoord:nv(k), hint:'Haal drie nullen weg: ' + tp(k) + '.' },
              { tekst:'Per 1000 inwoners zijn er ' + c + ' ' + wat[1] + '. Vermenigvuldig met ' + c + '. Dat zijn …', antwoord:nv(a), eenheid:wat[1], hint:tp(k) + ' × ' + c + ' = ' + tp(a) + '.' } ] };
        } },
      { id:'ak-bev-procent', naam:'Natuurlijke groei in procenten', kort:'Promille gedeeld door 10 is procent',
        uit:'<p>Promille is <b>per 1000</b>, procent is <b>per 100</b>. Daarom deel je promille door 10 om procent te krijgen: 15 ‰ = 1,5%.</p><p>Reken eerst de natuurlijke groei uit: geboortecijfer ' + MIN + ' sterftecijfer. Deel dan door 10.</p>',
        wanneer:'je groeicijfers in procenten wilt vergelijken of verder wilt rekenen.',
        maak:function(R){
          var g = R.heel(9, 44), s = R.heel(5, Math.min(15, g - 1)), ng = g - s, p = rnd(ng / 10, 1);
          return { vraag:'Hoeveel procent is de natuurlijke groei?', context:'Het geboortecijfer is ' + g + ' ‰. Het sterftecijfer is ' + s + ' ‰.', eenheid:'%',
            stappen:[
              { tekst:'De natuurlijke groei: ' + g + ' ' + MIN + ' ' + s + ' = … ‰', antwoord:nv(ng), eenheid:'‰', hint:g + ' ' + MIN + ' ' + s + ' = ' + ng + ' ‰.' },
              { tekst:'Van promille naar procent: deel door 10. Dat is … %', antwoord:pv(p), eenheid:'%', hint:ng + ' : 10 = ' + tn(p) + '%.', fout:F(ng * 10, 'Je vermenigvuldigde. Van promille naar procent deel je door 10.') } ] };
        } },
      { id:'ak-bev-totaal', naam:'De totale bevolkingsgroei', kort:'Natuurlijke groei plus migratiesaldo',
        uit:'<p>Een bevolking verandert door geboorte, sterfte en migratie.</p><p><b>Natuurlijke groei</b> = geboorten ' + MIN + ' sterfgevallen. <b>Migratiesaldo</b> = immigratie ' + MIN + ' emigratie.</p><p><b>Totale groei</b> = natuurlijke groei + migratiesaldo. Let op: een van de twee kan negatief zijn.</p>',
        wanneer:'je wilt weten hoeveel inwoners er in een jaar bij komen of af gaan.',
        maak:function(R){
          var gb = R.heel(20, 240) * 1000, sf = R.heel(20, 240) * 1000, im = R.heel(10, 200) * 1000, em = R.heel(10, 200) * 1000;
          if (gb === sf || im === em) return this.maak(R);
          var ng = gb - sf, ms = im - em, tg = ng + ms;
          if (!tg) return this.maak(R);
          return { vraag:'Hoeveel is de totale bevolkingsgroei?', context:'In een jaar: ' + tp(gb) + ' geboorten, ' + tp(sf) + ' sterfgevallen, ' + tp(im) + ' immigranten en ' + tp(em) + ' emigranten.', eenheid:'inwoners',
            stappen:[
              { tekst:'Natuurlijke groei: ' + tp(gb) + ' ' + MIN + ' ' + tp(sf) + ' = …', antwoord:nv(ng), hint:tp(gb) + ' ' + MIN + ' ' + tp(sf) + ' = ' + tp(ng) + '.', fout:ng < 0 ? FN(-ng, 'Er sterven meer mensen dan er geboren worden: negatief.') : null },
              { tekst:'Migratiesaldo: ' + tp(im) + ' ' + MIN + ' ' + tp(em) + ' = …', antwoord:nv(ms), hint:tp(im) + ' ' + MIN + ' ' + tp(em) + ' = ' + tp(ms) + '.', fout:ms < 0 ? FN(-ms, 'Er vertrekken meer mensen dan er komen: negatief.') : null },
              { tekst:'Totale groei: natuurlijke groei + migratiesaldo = …', antwoord:nv(tg), eenheid:'inwoners', hint:(ng < 0 || ms < 0 ? 'Tel de twee op. Een negatief getal optellen is aftrekken: ' : 'Tel de twee op: ') + tp(tg) + '.' } ] };
        } },
      { id:'ak-bev-verdubbel', naam:'De verdubbelingstijd', kort:'70 gedeeld door het groeipercentage',
        uit:'<p>De <b>verdubbelingstijd</b> is het aantal jaren dat een bevolking nodig heeft om twee keer zo groot te worden, als de groei gelijk blijft.</p><p>Je gebruikt de vuistregel: <b>verdubbelingstijd = 70 : groeipercentage</b>.</p><p>Groeit een bevolking 2% per jaar, dan is ze na ongeveer 70 : 2 = 35 jaar verdubbeld. Let op: het groeipercentage moet in procent, niet in promille.</p>',
        wanneer:'je wilt laten zien hoe snel een bevolking groeit.',
        maak:function(R){
          var ng = R.kies([5, 7, 10, 14, 20, 25, 28, 35]), s = R.heel(5, 12), g = ng + s, p = ng / 10, t = rnd(70 / p, 1);
          return { vraag:'Wat is de verdubbelingstijd?', context:'Het geboortecijfer is ' + g + ' ‰ en het sterftecijfer ' + s + ' ‰. Er is geen migratie.', eenheid:'jaar',
            stappen:[
              { tekst:'De natuurlijke groei is … ‰', antwoord:nv(ng), eenheid:'‰', hint:g + ' ' + MIN + ' ' + s + ' = ' + ng + ' ‰.' },
              { tekst:'In procenten is dat … %', antwoord:pv(p), eenheid:'%', hint:ng + ' : 10 = ' + tn(p) + '%.' },
              { tekst:'Deel 70 door het groeipercentage. Dat is … jaar', antwoord:nv(t), eenheid:'jaar', hint:'70 : ' + tn(p) + ' = ' + tn(t) + '.', fout:F(rnd(70 / ng, 1), 'Deel door het percentage, niet door het promillecijfer.') } ] };
        } }
    ] });

  /* ---------- rivieren ---------- */
  var STROOM = [ { n:'het noorden', dx:0, dy:-1 }, { n:'het oosten', dx:1, dy:0 }, { n:'het zuiden', dx:0, dy:1 }, { n:'het westen', dx:-1, dy:0 } ];
  function rivierKaart(st, stad, kant){
    var s = svg(400, 270, 'kaart met een rivier', 440) + '<rect x="2" y="2" width="396" height="266" rx="10" class="deel"/>', hor = st.dy === 0;
    var pad = hor ? 'M14 140 C 90 105, 150 175, 210 135 S 330 110, 386 140' : 'M200 14 C 165 70, 235 120, 195 160 S 170 220, 205 256';
    s += '<path d="' + pad + '" style="fill:none;stroke:var(--lr-1);stroke-width:22;opacity:.35;stroke-linecap:round"/>';
    if (hor) s += st.dx > 0 ? pijl(250, 125, 320, 125) : pijl(320, 125, 250, 125); else s += st.dy > 0 ? pijl(197, 70, 197, 135) : pijl(197, 135, 197, 70);
    /* kant: 'a' = noord (horizontaal) of west (verticaal), 'b' = zuid of oost */
    var x = hor ? 110 : kant === 'a' ? 95 : 300, y = hor ? (kant === 'a' ? 60 : 215) : 200;
    s += '<rect x="' + (x - 9) + '" y="' + (y - 9) + '" width="18" height="18" rx="3" style="fill:var(--lr-2)"/>' + tekst(x, y + 28, stad, 'getal');
    s += pijl(366, 64, 366, 34, '', 2.5) + tekst(366, 26, 'N', 'getal');
    return s + '</svg>';
  }
  function profiel(bron, mond, L, toon){
    var s = svg(420, 180, 'lengteprofiel van een rivier', 440);
    s += '<path d="M40 40 C 120 120, 220 140, 380 150" class="boog" style="stroke:var(--lr-1)"/><line x1="40" y1="160" x2="380" y2="160" class="as dun"/>';
    s += '<circle cx="40" cy="40" r="6" style="fill:var(--lr-1)"/><circle cx="380" cy="150" r="6" style="fill:var(--lr-1)"/>';
    s += tekst(48, 30, 'bron: ' + tp(bron) + ' m', 'getal klein', 'text-anchor:start') + tekst(380, 136, 'monding: ' + tp(mond) + ' m', 'getal klein', 'text-anchor:end');
    s += tekst(210, 178, toon ? 'lengte ' + tp(L) + ' km' : '', 'getal klein');
    return s + '</svg>';
  }
  var STAD = ['Akkerdam', 'Bosdal', 'Kerkdijk', 'Lindenoord', 'Meerzicht', 'Riethaven', 'Heidekamp', 'Zandwijk'];
  G.push({ groep:{ id:'ak-rivier', niveau:'onderbouw', domein:'aarde', naam:'Rivieren',
      uit:'Aan welke oever van een rivier ligt een stad, en hoe groot is het verval van een rivier.' },
    doelen:[
      { id:'ak-riv-oever', naam:'Linkeroever of rechteroever?', kort:'Kijk stroomafwaarts, met het water mee: links is de linkeroever',
        uit:'<p>Een rivier heeft twee oevers. Welke de <b>linkeroever</b> is, hangt af van de stroomrichting.</p><p>Ga in gedachten in de rivier staan en kijk <b>stroomafwaarts</b>: de kant op waar het water naartoe stroomt. Wat links van je ligt, is de linkeroever. Wat rechts ligt, de rechteroever.</p><p>Stroomt een rivier naar het oosten, dan is de noordkant de linkeroever.</p>',
        wanneer:'je in een tekst of op een kaart leest over de linker- of rechteroever van een rivier.',
        maak:function(R){
          var st = R.kies(STROOM), kant = R.kies(['a', 'b']), stad = R.kies(STAD), hor = st.dy === 0;
          /* links als je met de stroom meekijkt: oost -> noord, west -> zuid, zuid -> oost, noord -> west */
          var links = hor ? ((st.dx > 0) === (kant === 'a')) : ((st.dy > 0) === (kant === 'b'));
          var b = rivierKaart(st, stad, kant);
          return eindKeuze({ vraag:'Ligt ' + stad + ' op de linkeroever of de rechteroever?', context:'De pijl laat zien hoe de rivier stroomt. Het noorden is boven.', beeld:b, zelfBeeld:b,
            stappen:[
              kv('Naar welke kant stroomt het water?', STROOM.map(function(x){ return 'naar ' + x.n; }), STROOM.indexOf(st), 'Volg de pijl op de rivier. Boven is noord, rechts is oost.'),
              kv('Je staat in de rivier en kijkt naar ' + st.n + '. Ligt ' + stad + ' dan links of rechts van je?', ['links', 'rechts'], links ? 0 : 1, 'Draai de kaart in gedachten zo dat de pijl van je af wijst. ' + stad + ' ligt dan aan je ' + (links ? 'linkerhand.' : 'rechterhand.')),
              kv(stad + ' ligt op de …', ['linkeroever', 'rechteroever'], links ? 0 : 1, 'Links als je stroomafwaarts kijkt, is de linkeroever.') ] });
        } },
      { id:'ak-riv-verval', naam:'Het verval van een rivier', kort:'Hoogteverschil gedeeld door de lengte',
        uit:'<p>Het <b>verval</b> zegt hoeveel een rivier gemiddeld daalt per kilometer.</p><p>Reken: <b>hoogteverschil : lengte</b>. Het hoogteverschil is de hoogte van de bron min de hoogte van de monding.</p><p>Voorbeeld: een rivier begint op 1200 m en mondt na 600 km uit in zee (0 m). Het verval is 1200 : 600 = 2 m per km. Een groot verval betekent: het water stroomt snel.</p>',
        wanneer:'je rivieren wilt vergelijken: waar stroomt het water snel en waar langzaam.',
        maak:function(R){
          var v = R.kies([0.1, 0.2, 0.25, 0.5, 0.8, 1, 1.5, 2, 2.5, 4, 5]), L = R.kies([80, 120, 200, 250, 400, 500, 800, 1000]), d = rnd(v * L, 2);
          if (d !== Math.round(d) || d < 20) return this.maak(R);
          var mond = R.kies([0, 0, 0, 50, 120, 300]), bron = mond + d, cm = v < 1 && R.heel(0, 1);
          var st = [
            { tekst:'Het hoogteverschil: ' + tp(bron) + ' ' + MIN + ' ' + tp(mond) + ' = … m', antwoord:nv(d), eenheid:'m', hint:tp(bron) + ' ' + MIN + ' ' + tp(mond) + ' = ' + tp(d) + ' m.' },
            { tekst:'Deel het hoogteverschil door de lengte. Het verval is … m per km', antwoord:nv(v), eenheid:'m per km', hint:tp(d) + ' : ' + tp(L) + ' = ' + tn(v) + '.', fout:F(mond ? rnd(bron / L, 4) : null, 'Gebruik het hoogteverschil, niet de hoogte van de bron.', rnd(L / d, 4), 'Je deelde andersom. Hoogteverschil gedeeld door lengte.') } ];
          if (cm) st.push({ tekst:'Reken om naar cm per km: keer 100. Dat is …', antwoord:nv(rnd(v * 100, 2)), eenheid:'cm per km', hint:'1 m = 100 cm: ' + tn(v) + ' × 100 = ' + tn(rnd(v * 100, 2)) + '.' });
          return { vraag:'Wat is het verval in ' + (cm ? 'cm' : 'm') + ' per km?', context:'Een rivier ontspringt op ' + tp(bron) + ' m hoogte en is ' + tp(L) + ' km lang. De monding ligt op ' + tp(mond) + ' m' + (mond ? ', in een meer.' : ', aan zee.'),
            beeld:function(n){ return profiel(bron, mond, L, true); }, eenheid:cm ? 'cm per km' : 'm per km', stappen:st };
        } }
    ] });

  LEERROUTE.voeg('aardrijkskunde', G);
})();
