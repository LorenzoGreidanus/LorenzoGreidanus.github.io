/* De leerroute wiskunde: statistiek en kans. Het gemiddelde bij klassen, kwartielen
   en de kwartielafstand, een boxplot aflezen, en kansbomen: meer takken optellen,
   pakken zonder terugleggen en precies zoveel keer bij drie pogingen.
   Gemiddelde, mediaan, modus, frequentietabel, kans als breuk en de eerste kansregels
   staan in de leerroute rekenen (rekenen-meten.js, rekenen-data.js).
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '×';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.02; }
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function S(tekst, ant, hint, fout, o){
    o = o || {};
    var s = { tekst:tekst, antwoord:uniek([].concat(ant).map(function(a){ return typeof a === 'number' ? T(a) : String(a); })), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (o.e) s.eenheid = o.e;
    if (o.waarom) s.waarom = o.waarom;
    if (o.controle){ s.controle = o.controle; s.invoer = 'tekst'; }
    return s;
  }
  function K(R, tekst, goed, fout, hint, o){
    o = o || {};
    var l = o.orde ? o.orde.map(String) : R.hussel(uniek([goed].concat(fout || [])));
    var s = { tekst:tekst, opties:l, goed:l.indexOf(String(goed)), hint:hint };
    if (o.waarom) s.waarom = o.waarom;
    return s;
  }
  function F(goed){
    var o = {}, g = [].concat(goed).map(function(x){ return String(typeof x === 'number' ? T(x) : x).toLowerCase(); });
    for (var i = 1; i + 1 < arguments.length; i += 2){ var k = String(typeof arguments[i] === 'number' ? T(arguments[i]) : arguments[i]).toLowerCase(); if (g.indexOf(k) < 0 && !(k in o)) o[k] = arguments[i + 1]; }
    return o;
  }
  /* breuken */
  function br(t, n){ return t + '/' + n; }
  function brv(t, n){ if (t === 0) return '0'; var g = ggd(t, n); return n / g === 1 ? String(t / g) : br(t / g, n / g); }
  function brAnt(t, n){ return uniek([br(t, n), brv(t, n)]); }
  /* een kans: elke gelijke breuk, of een kommagetal met minstens 3 decimalen (afgerond mag) */
  function kansC(t, n){
    var w = t / n;
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-'), m;
      if ((m = /^(\d+)\/(\d+)$/.exec(s))) return +m[2] > 0 && Math.abs(+m[1] / +m[2] - w) < 1e-12;
      if ((m = /^(\d+)[.,](\d+)$/.exec(s))){ var d = m[2].length, x = +(m[1] + '.' + m[2]); if (Math.abs(x - w) < 1e-12) return true; return d >= 3 && Math.abs(x - w) <= 0.5 * Math.pow(10, -d) + 1e-12; }
      if (/^\d+$/.test(s)) return Math.abs(+s - w) < 1e-12;
      return false;
    };
  }
  function kansStap(tekst, t, n, hint, fout){ return S(tekst, brAnt(t, n), hint, fout, { controle:kansC(t, n) }); }
  function rij(l){ return l.map(T).join('   '); }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600)];
    if (o.k) st.push('fill:' + o.k);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" style="' + st.join(';') + '">' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + '"/>'; }
  /* een boxplot op een getallenas: v = [min, Q1, mediaan, Q3, max]; lab: de waarden erbij schrijven; nad: index die opvalt */
  function boxplot(v, o){
    o = o || {};
    var lo = o.van, hi = o.tot, W = 580, L = 30, Rr = 550, Y = 70, s = '';
    function x(t){ return L + (t - lo) / (hi - lo) * (Rr - L); }
    s += ln(x(lo) - 6, Y + 50, x(hi) + 6, Y + 50, { w:2 });
    for (var t = lo; t <= hi; t++){ var groot = t % 5 === 0; s += ln(x(t), Y + 50, x(t), Y + 50 + (groot ? 9 : 5), { w:groot ? 2 : 1.2 }); if (groot) s += tx(x(t), Y + 76, T(t), { fs:13 }); }
    if (o.raster) for (t = lo; t <= hi; t++) s += ln(x(t), 18, x(t), Y + 50, { w:1, op:0.12 });
    s += ln(x(v[0]), Y, x(v[1]), Y, { w:2.5 }) + ln(x(v[3]), Y, x(v[4]), Y, { w:2.5 });
    s += ln(x(v[0]), Y - 12, x(v[0]), Y + 12, { w:2.5 }) + ln(x(v[4]), Y - 12, x(v[4]), Y + 12, { w:2.5 });
    s += rc(x(v[1]), Y - 22, x(v[3]) - x(v[1]), 44, { f:KL[0], fo:0.15, w:2.5 }) + ln(x(v[2]), Y - 22, x(v[2]), Y + 22, { w:3.5, k:KL[1] });
    (o.nad || []).forEach(function(i){ s += ln(x(v[i]), 22, x(v[i]), Y + 50, { k:KL[3], w:2.5, dash:'5 4' }); });
    if (o.lab) v.forEach(function(t, i){ s += tx(x(t), Y - 30 - (i % 2) * 14, T(t), { fs:13, vet:true, k:i === 2 ? KL[1] : null }); });
    return svg(W, Y + 86, s, o.aria || 'boxplot', 620);
  }
  /* een kansboom: niv = labels per niveau; kans(pad, c) = de kans op de tak; nad(pad) = deze eindtak valt op; blad(pad) = tekst achter een eindtak */
  function boom(niv, o){
    o = o || {};
    var d = niv.length, maat = niv.map(function(l){ return l.length; }), rijH = d > 2 ? 40 : 46, kolW = d > 2 ? 125 : 150, x0 = 14, vak = '', lijn = '';
    function onder(l){ var p = 1; for (var j = l; j < d; j++) p *= maat[j]; return p; }
    function Y(p){ var e = 0; for (var j = 0; j < p.length; j++) e += p[j] * onder(j + 1); return 14 + (e + onder(p.length) / 2) * rijH; }
    function X(l){ return x0 + l * kolW; }
    function teken(p){
      var l = p.length, ya = Y(p), xa = l === 0 ? X(0) + 4 : X(l) + 14;
      if (l === d){ var bt = o.blad ? o.blad(p) : ''; if (bt) vak += tx(xa + 8, ya + 5, bt, { a:'start', fs:14, vet:!!(o.nad && o.nad(p)), k:o.nad && o.nad(p) ? KL[1] : null }); return; }
      for (var c = 0; c < maat[l]; c++){
        var q = p.concat([c]), yb = Y(q), xb = X(l + 1) - 14, hl = o.nad && q.length === d && o.nad(q), pad = o.nad && o.pad && o.pad(q);
        lijn += ln(xa, ya, xb, yb, { k:hl || pad ? KL[1] : 'var(--ink)', w:hl || pad ? 3.2 : 1.6 });
        if (o.kans){ var kt = o.kans(p, c); if (kt) vak += tx((xa + xb) / 2 - 4, (ya + yb) / 2 + (c === 0 ? -7 : 16), kt, { fs:13, vet:true, k:KL[0] }); }
        vak += rc(xb - 2, yb - 12, 28, 24, { rx:7, f:hl ? KL[1] : 'var(--kaart)', fo:hl ? 0.2 : 1, w:1.5, s:hl ? KL[1] : 'var(--ink)' }) + tx(xb + 12, yb + 5, niv[l][c], { fs:14, vet:true });
        teken(q);
      }
    }
    teken([]);
    var W = X(d) + 30 + (o.blad ? 90 : 0), H = onder(0) * rijH + 28;
    return svg(W, H, '<circle cx="' + X(0) + '" cy="' + n1(Y([])) + '" r="4.5" style="fill:var(--ink)"/>' + lijn + vak, o.aria || 'kansboom', Math.min(620, W * 1.25));
  }

  /* ================= kansen: de verhalen ================= */
  var KLEUR = [['rood', 'rode', 'R'], ['blauw', 'blauwe', 'B'], ['groen', 'groene', 'G'], ['wit', 'witte', 'W'], ['zwart', 'zwarte', 'Z']];
  function zak(R, Nmax){
    var k = R.hussel(KLEUR).slice(0, 2), N = R.heel(4, Nmax || 10), a = R.heel(1, N - 1);
    return { k:k, a:a, b:N - a, N:N, zin:'In een zak zitten ' + a + ' ' + k[0][1] + ' en ' + (N - a) + ' ' + k[1][1] + ' knikkers.' };
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= klassen, kwartielen en de boxplot (vmbo) ================= */
    { groep:{ id:'wi-stat', niveau:'vmbo', domein:'statistiek', naam:'Klassen, kwartielen en de boxplot',
        uit:'Het gemiddelde als de gegevens in klassen staan, de kwartielen en de kwartielafstand, en een boxplot aflezen. Gemiddelde, mediaan en modus van een gewone rij staan in de leerroute rekenen.' },
      doelen:[
        { id:'wi-st-klassen', naam:'Het gemiddelde bij klassen', kort:'Neem per klasse het klassenmidden, doe keer de frequentie, tel op en deel door het totaal',
          uit:'<p>Staan de gegevens in <b>klassen</b>, zoals 10 tot 20 minuten, dan weet je de precieze getallen niet meer. Je rekent dan met het <b>klassenmidden</b>: het getal precies in het midden, hier 15.</p><p>Doe per klasse het klassenmidden <b>keer de frequentie</b>. Tel alles op en deel door het <b>totaal aantal</b>.</p><p>Het antwoord is een <b>schatting</b>: je doet alsof iedereen in een klasse precies in het midden zit.</p>',
          wanneer:'de gegevens in een tabel met klassen staan.',
          maak:function(R){
            var it = R.kies([
              { wat:'de reistijd naar school', eh:'minuten', s:[0], w:[10], k:[4, 5] },
              { wat:'de lengte van de leerlingen', eh:'cm', s:[145, 150], w:[5], k:[4, 5] },
              { wat:'het zakgeld per maand', eh:'euro', s:[0], w:[5, 10], k:[4, 5] },
              { wat:'het gewicht van appels', eh:'gram', s:[100, 120], w:[20], k:[4, 5] },
              { wat:'het aantal minuten sporten per week', eh:'minuten', s:[0], w:[30, 60], k:[4] } ]);
            var s0, w, k, fr, mid, som, N, gem;
            do { s0 = R.kies(it.s); w = R.kies(it.w); k = R.kies(it.k); fr = []; for (var i = 0; i < k; i++) fr.push(R.heel(1, 12));
              mid = fr.map(function(f, i){ return s0 + i * w + w / 2; }); som = fr.reduce(function(a, f, i){ return a + f * mid[i]; }, 0); N = fr.reduce(function(a, f){ return a + f; }, 0); gem = som / N; } while (grens(gem, 1) || N < 12);
            function tab(n){
              var kop = ['klasse', 'frequentie'].concat(n >= 1 ? ['klassenmidden'] : []).concat(n >= 2 ? ['midden ' + X + ' freq.'] : []);
              return R0.teken.tabel([kop].concat(fr.map(function(f, i){ return [T(s0 + i * w) + ' tot ' + T(s0 + (i + 1) * w), String(f)].concat(n >= 1 ? [T(mid[i])] : []).concat(n >= 2 ? [T(f * mid[i])] : []); }))
                .concat(n >= 3 ? [['totaal', String(N)].concat(n >= 1 ? [''] : []).concat(n >= 2 ? [T(som)] : [])] : []), { kop:true, nadruk:n === 1 ? [[1, 2]] : [] });
            }
            var gr = rnd(gem, 1);
            return { vraag:'Het gemiddelde?', context:'De tabel laat ' + it.wat + ' zien, in ' + it.eh + '. "' + T(s0) + ' tot ' + T(s0 + w) + '" betekent: vanaf ' + T(s0) + ' tot net onder ' + T(s0 + w) + '. Bereken het gemiddelde met de klassenmiddens. Rond af op 1 decimaal.', eenheid:it.eh,
              beeld:tab, zelfBeeld:tab(0), stappen:[
                S('Het klassenmidden van de eerste klasse, ' + T(s0) + ' tot ' + T(s0 + w) + ':', mid[0], 'Precies tussen ' + T(s0) + ' en ' + T(s0 + w) + ': (' + T(s0) + ' + ' + T(s0 + w) + ') : 2.', F(mid[0], s0 + w, 'Dat is de grens. Het midden ligt tussen ' + T(s0) + ' en ' + T(s0 + w) + '.', s0, 'Dat is de grens. Het midden ligt tussen ' + T(s0) + ' en ' + T(s0 + w) + '.')),
                S('Doe elk klassenmidden keer de frequentie en tel alles op:', som, fr.map(function(f, i){ return T(mid[i]) + ' ' + X + ' ' + f; }).join(' + ') + ' = ' + T(som) + '.', F(som, N, 'Dat is het totaal aantal. Je zoekt de som van midden keer frequentie.')),
                S('Het totaal aantal: ' + fr.join(' + ') + ' =', N, 'Tel de frequenties op.'),
                S('Het gemiddelde: ' + T(som) + ' : ' + N + ' ≈ (rond af op 1 decimaal)', uniek([T(gr, { dec:1, vast:true }), T(gr)]), T(som) + ' : ' + N + ' = ' + T(gem, { dec:4 }) + '…', F(T(gr, { dec:1, vast:true }), T(rnd(som / k, 1), { dec:1, vast:true }), 'Deel door het totaal aantal (' + N + '), niet door het aantal klassen.'), { e:it.eh }) ] };
          } },
        { id:'wi-st-kwartiel', naam:'Kwartielen en de kwartielafstand', kort:'De mediaan deelt de rij in twee helften; het eerste kwartiel is de mediaan van de onderste helft, het derde kwartiel van de bovenste',
          uit:'<p>Zet de getallen op <b>volgorde</b> en zoek de <b>mediaan</b>: het midden. Die deelt de rij in een onderste en een bovenste helft.</p><p>Het <b>eerste kwartiel</b> Q1 is de mediaan van de <b>onderste helft</b>. Het <b>derde kwartiel</b> Q3 is de mediaan van de <b>bovenste helft</b>. Tussen Q1 en Q3 zit de middelste helft van de getallen.</p><p>De <b>kwartielafstand</b> is Q3 − Q1. Hoe kleiner, hoe dichter de middelste getallen bij elkaar liggen.</p>',
          wanneer:'je de spreiding van gegevens wilt weten, of een boxplot gaat tekenen.',
          maak:function(R){
            var n = R.kies([8, 10, 12]), it = R.kies([{ wat:'punten bij een toets', lo:20, hi:60 }, { wat:'reistijden in minuten', lo:5, hi:45 }, { wat:'aantallen bezoekers per dag', lo:40, hi:90 }, { wat:'cijfers keer tien bij een proefwerk', lo:30, hi:95 }]);
            function med(a){ var m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; }
            var l, i, o, h = n / 2, M, lo, bo, Q1, Q3, ka;
            do { l = []; for (i = 0; i < n; i++) l.push(R.heel(it.lo, it.hi));
              o = l.slice().sort(function(a, b){ return a - b; }); M = med(o); lo = o.slice(0, h); bo = o.slice(h); Q1 = med(lo); Q3 = med(bo); ka = Q3 - Q1;
            } while (!(o[0] < Q1 && Q1 < M && M < Q3 && Q3 < o[n - 1]));
            function plek(m, off){ return m % 2 ? [off + (m - 1) / 2] : [off + m / 2 - 1, off + m / 2]; }
            function nadr(n2){ var p = []; if (n2 >= 2) plek(n, 0).forEach(function(j){ p.push([0, j]); }); if (n2 >= 3) plek(h, 0).forEach(function(j){ p.push([0, j]); }); if (n2 >= 4) plek(h, h).forEach(function(j){ p.push([0, j]); }); return p; }
            function bl(n2){
              var t = R0.teken.tabel([n2 >= 1 ? o.map(String) : l.map(String)], { nadruk:nadr(n2) });
              if (n2 < 5) return t;
              var van = Math.floor(o[0] / 5) * 5, tot = Math.ceil(o[n - 1] / 5) * 5; if (tot - van < 10) tot = van + 10;
              return '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">' + t + '<div style="width:100%;max-width:600px">' + boxplot([o[0], Q1, M, Q3, o[n - 1]], { van:van, tot:tot, lab:true, aria:'boxplot van de rij' }) + '</div></div>';
            }
            function uitleg(m){ return m % 2 ? 'Bij ' + m + ' getallen is het middelste getal nummer ' + ((m + 1) / 2) + '.' : 'Bij ' + m + ' getallen zijn er twee in het midden: nummer ' + (m / 2) + ' en ' + (m / 2 + 1) + '. Neem het getal precies ertussen.'; }
            return { vraag:rij(l), context:'Dit zijn ' + n + ' ' + it.wat + '. Bereken de kwartielafstand.', antwoord:T(ka), beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Zet de getallen op volgorde van klein naar groot. Welk getal komt vooraan?', o[0], 'Zoek het kleinste getal.'),
              S('De mediaan van alle ' + n + ' getallen:', M, uitleg(n) + ' Dat zijn ' + o[h - 1] + ' en ' + o[h] + '.', F(M, l[h - 1], 'Zet de getallen eerst op volgorde.')),
              S('Q1 is de mediaan van de onderste ' + h + ' getallen (' + lo.join(', ') + '):', Q1, uitleg(h), F(Q1, M, 'Dat is de mediaan van alles. Neem alleen de onderste helft.')),
              S('Q3 is de mediaan van de bovenste ' + h + ' getallen (' + bo.join(', ') + '):', Q3, uitleg(h)),
              S('De kwartielafstand: Q3 ' + MIN + ' Q1 = ' + T(Q3) + ' ' + MIN + ' ' + T(Q1) + ' =', ka, 'Het derde kwartiel min het eerste.', F(ka, o[n - 1] - o[0], 'Dat is de spreidingsbreedte: grootste min kleinste. Neem Q3 min Q1.')) ] };
          } },
        { id:'wi-st-boxplot', naam:'Een boxplot aflezen', kort:'De doos loopt van Q1 tot Q3, de streep is de mediaan, de snorharen gaan naar het kleinste en grootste getal; elk stuk is een kwart',
          uit:'<p>Een <b>boxplot</b> laat vijf getallen zien: het <b>minimum</b> (links), het <b>eerste kwartiel</b> Q1 (begin van de doos), de <b>mediaan</b> (de streep in de doos), het <b>derde kwartiel</b> Q3 (eind van de doos) en het <b>maximum</b> (rechts).</p><p>Tussen elke twee strepen zit <b>een kwart</b> (25%) van de waarnemingen. In de doos zit dus de middelste helft.</p><p>De <b>kwartielafstand</b> is Q3 − Q1, de lengte van de doos. De <b>spreidingsbreedte</b> is maximum − minimum.</p>',
          wanneer:'je gegevens moet aflezen of vergelijken met een boxplot.',
          maak:function(R){
            var it = R.kies([{ wat:'de reistijden van een klas', eh:'minuten' }, { wat:'de lengtes van een groep planten', eh:'cm' }, { wat:'de scores bij een spel', eh:'punten' }, { wat:'de temperaturen in een maand', eh:'°C' }]);
            var van = R.kies([0, 10, 20]), v; do { v = [0, 1, 2, 3, 4].map(function(){ return van + R.heel(1, 29); }).sort(function(a, b){ return a - b; }); } while (v[1] - v[0] < 2 || v[2] - v[1] < 2 || v[3] - v[2] < 2 || v[4] - v[3] < 2);
            var soort = R.kies(['ka', 'sb', 'proc', 'proc']), st, ant, vraag, eh = it.eh === '°C' ? '°C' : it.eh;
            var namen = ['het minimum', 'het eerste kwartiel Q1', 'de mediaan', 'het derde kwartiel Q3', 'het maximum'];
            var bl = function(n){ return boxplot(v, { van:van, tot:van + 30, raster:true, nad:soort === 'proc' ? (n >= 1 ? [pi] : []) : soort === 'ka' ? [1, 3].slice(0, n) : [0, 4].slice(0, n), aria:'boxplot van ' + it.wat }); };
            var pi = R.kies([1, 2, 3]), boven = R.heel(0, 1) === 1, pr = boven ? (4 - pi) * 25 : pi * 25;
            if (soort === 'ka'){ vraag = 'De kwartielafstand?'; st = [
              S('Lees af: het eerste kwartiel Q1 (het begin van de doos):', v[1], 'Kijk waar de doos links begint. Elk streepje op de as is 1.', null, { e:eh }),
              S('Lees af: het derde kwartiel Q3 (het eind van de doos):', v[3], 'Kijk waar de doos rechts ophoudt.', null, { e:eh }),
              S('De kwartielafstand: ' + v[3] + ' ' + MIN + ' ' + v[1] + ' =', v[3] - v[1], 'Q3 min Q1: de lengte van de doos.', F(v[3] - v[1], v[4] - v[0], 'Dat is de spreidingsbreedte. Neem alleen de doos.'), { e:eh }) ]; ant = v[3] - v[1]; }
            else if (soort === 'sb'){ vraag = 'De spreidingsbreedte?'; st = [
              S('Lees af: het minimum (het eind van de linker snorhaar):', v[0], 'Het kleinste getal staat helemaal links.', null, { e:eh }),
              S('Lees af: het maximum (het eind van de rechter snorhaar):', v[4], 'Het grootste getal staat helemaal rechts.', null, { e:eh }),
              S('De spreidingsbreedte: ' + v[4] + ' ' + MIN + ' ' + v[0] + ' =', v[4] - v[0], 'Maximum min minimum.', F(v[4] - v[0], v[3] - v[1], 'Dat is de kwartielafstand. Neem het hele stuk van minimum tot maximum.'), { e:eh }) ]; ant = v[4] - v[0]; }
            else { vraag = 'Hoeveel procent ligt ' + (boven ? 'boven ' : 'onder ') + v[pi] + '?'; st = [
              K(R, 'Welke streep van de boxplot ligt bij ' + v[pi] + '?', namen[pi], namen.filter(function(x, j){ return j !== pi; }), 'Kijk waar ' + v[pi] + ' op de as staat en welke streep daar is.'),
              S('Hoeveel kwarten van de waarnemingen liggen ' + (boven ? 'rechts' : 'links') + ' van ' + namen[pi] + '?', boven ? 4 - pi : pi, 'Tussen twee strepen zit steeds een kwart. Tel de stukken ' + (boven ? 'rechts' : 'links') + ' van de streep.'),
              S('Dat is in procenten:', [T(pr), T(pr) + '%'], 'Een kwart is 25%.', F(pr, 100 - pr, 'Dat is de andere kant. Je zoekt wat ' + (boven ? 'erboven' : 'eronder') + ' ligt.'), { e:'%' }) ]; ant = pr; }
            return { vraag:vraag, context:'De boxplot laat ' + it.wat + ' zien, in ' + it.eh + '. Elk streepje op de as is 1.', antwoord:soort === 'proc' ? [T(ant), T(ant) + '%'] : T(ant), eenheid:soort === 'proc' ? '%' : eh, beeld:bl, zelfBeeld:bl(0), stappen:st };
          } }
      ] },

    /* ================= kansbomen (havo) ================= */
    { groep:{ id:'wi-kans', niveau:'havo', domein:'statistiek', naam:'Kansbomen',
        uit:'Kansen bij twee of drie keer na elkaar: vermenigvuldigen langs een tak, de takken die passen optellen, en pakken zonder terugleggen. Kans als breuk en de vermenigvuldigregel staan in de leerroute rekenen.' },
      doelen:[
        { id:'wi-kans-paden', naam:'Meer takken: vermenigvuldigen en optellen', kort:'Vermenigvuldig de kansen langs elke tak die past, en tel die takken daarna op',
          uit:'<p>Je pakt twee keer een knikker en legt hem steeds terug. Hoe groot is de kans op <b>precies één rode</b>? Dat kan op twee manieren: eerst rood en dan blauw (RB), of eerst blauw en dan rood (BR).</p><p>Reken elke tak uit door te <b>vermenigvuldigen</b> langs de tak. Bij 3 rode en 2 blauwe: RB = 3/5 × 2/5 = 6/25 en BR = 2/5 × 3/5 = 6/25.</p><p><b>Tel</b> de takken daarna op: 6/25 + 6/25 = <b>12/25</b>.</p>',
          wanneer:'er meer takken in de kansboom bij de vraag passen.',
          maak:function(R){
            var z, p, q, n, namen, zin, vraagT, wat, paden;
            if (R.heel(0, 2) === 0){ p = 1; q = 5; n = 6; namen = ['6', 'n']; zin = 'Je gooit twee keer met een dobbelsteen. 6 is een zes, n is geen zes.'; wat = R.kies(['een', 'zelfde']); vraagT = wat === 'een' ? 'precies één keer een zes' : 'twee keer hetzelfde: twee zessen of twee keer geen zes'; }
            else { z = zak(R, 9); p = z.a; q = z.b; n = z.N; namen = [z.k[0][2], z.k[1][2]]; zin = z.zin + ' Je pakt een knikker, legt hem terug en pakt er nog een. ' + z.k[0][2] + ' is ' + z.k[0][0] + ', ' + z.k[1][2] + ' is ' + z.k[1][0] + '.'; wat = R.kies(['een', 'zelfde']); vraagT = wat === 'een' ? 'precies één ' + z.k[0][1] + ' knikker' : 'twee knikkers van dezelfde kleur'; }
            paden = wat === 'een' ? [[0, 1], [1, 0]] : [[0, 0], [1, 1]];
            var pk = [p, q], t1 = pk[paden[0][0]] * pk[paden[0][1]], t2 = pk[paden[1][0]] * pk[paden[1][1]], N2 = n * n, tot = t1 + t2;
            var pn = paden.map(function(pa){ return namen[pa[0]] + namen[pa[1]]; }), alle = [namen[0] + namen[0], namen[0] + namen[1], namen[1] + namen[0], namen[1] + namen[1]];
            var goed = pn.join(' en '), fouten = wat === 'een' ? ['alleen ' + pn[0], alle[0] + ' en ' + alle[3]] : ['alleen ' + pn[0], alle[1] + ' en ' + alle[2]];
            function isPad(q2){ return paden.some(function(pa){ return pa[0] === q2[0] && pa[1] === q2[1]; }); }
            var bl = function(m){ return boom([namen, namen], { kans:function(pp, c){ return br(pk[c], n); }, nad:m >= 1 ? isPad : null, pad:function(q2){ return q2.length === 1 && m >= 1 && paden.some(function(pa){ return pa[0] === q2[0]; }); },
              blad:function(pp){ var s = namen[pp[0]] + namen[pp[1]]; if (m >= 2 && isPad(pp)) s += ': ' + br(pk[pp[0]] * pk[pp[1]], N2); return s; }, aria:'kansboom met twee keer twee takken' }); };
            return { vraag:'Kans op ' + vraagT + '?', context:zin + ' Geef je antwoord als breuk.', antwoord:brAnt(tot, N2), controle:kansC(tot, N2), invoer:'tekst', beeld:bl, zelfBeeld:bl(0), stappen:[
              K(R, 'Welke takken horen bij ' + vraagT + '?', goed, fouten, wat === 'een' ? 'Precies één: eerst wel en dan niet, of eerst niet en dan wel.' : 'Twee hetzelfde: allebei de ene soort, of allebei de andere.'),
              kansStap('Kans op ' + pn[0] + ': ' + br(pk[paden[0][0]], n) + ' ' + X + ' ' + br(pk[paden[0][1]], n) + ' =', t1, N2, 'Teller keer teller en noemer keer noemer: ' + pk[paden[0][0]] + ' ' + X + ' ' + pk[paden[0][1]] + ' en ' + n + ' ' + X + ' ' + n + '.', F(brAnt(t1, N2), br(pk[paden[0][0]] + pk[paden[0][1]], 2 * n), 'Langs een tak vermenigvuldig je, je telt niet op.')),
              kansStap('Kans op ' + pn[1] + ': ' + br(pk[paden[1][0]], n) + ' ' + X + ' ' + br(pk[paden[1][1]], n) + ' =', t2, N2, pk[paden[1][0]] + ' ' + X + ' ' + pk[paden[1][1]] + ' en ' + n + ' ' + X + ' ' + n + '.'),
              kansStap('Samen: ' + br(t1, N2) + ' + ' + br(t2, N2) + ' =', tot, N2, 'Tel de tellers op. De noemer blijft ' + N2 + '.', F(brAnt(tot, N2), br(tot, 2 * N2), 'Bij optellen blijft de noemer hetzelfde.')) ] };
          } },
        { id:'wi-kans-zonder', naam:'Pakken zonder terugleggen', kort:'Na elke greep zit er één minder in: de noemer gaat 1 omlaag, en de teller ook als je die kleur pakte',
          uit:'<p>In een zak zitten 4 rode en 3 blauwe knikkers. Je pakt er twee, <b>zonder terug te leggen</b>. Hoe groot is de kans op twee rode?</p><p>Eerste keer: 4 van de 7 zijn rood, kans 4/7. Daarna zit er <b>één knikker minder</b> in, en ook één rode minder: nog 3 rode van de 6. Kans 3/6.</p><p>Langs de tak vermenigvuldigen: 4/7 × 3/6 = <b>12/42</b> = 2/7. In de kansboom staan op de tweede takken dus andere kansen dan op de eerste.</p>',
          wanneer:'je iets pakt en niet teruglegt: knikkers, kaarten, loten of mensen kiezen.',
          maak:function(R){
            var z = zak(R, 10), a = z.a, b = z.b, N = z.N, soort, e1, e2;
            do { soort = R.kies(['aa', 'ab', 'ba', 'bb']); } while ((soort === 'aa' && a < 2) || (soort === 'bb' && b < 2));
            var k0 = z.k[0], k1 = z.k[1], eerst = soort[0] === 'a' ? 0 : 1, dan = soort[1] === 'a' ? 0 : 1, aant = [a, b];
            var t1 = aant[eerst], n1v = N, rest = aant.slice(); rest[eerst]--; var t2 = rest[dan], n2v = N - 1, T2 = t1 * t2, N2 = n1v * n2v;
            var kn = [k0, k1], vr = eerst === dan ? 'twee ' + kn[eerst][1] + ' knikkers' : 'eerst een ' + kn[eerst][1] + ' en dan een ' + kn[dan][1] + ' knikker';
            var bl = function(m){ return boom([[k0[2], k1[2]], [k0[2], k1[2]]], { kans:function(pp, c){ if (!pp.length) return br(aant[c], N); var r2 = aant.slice(); r2[pp[0]]--; return m >= 2 || pp[0] !== eerst ? br(r2[c], N - 1) : (c === dan ? '?' : br(r2[c], N - 1)); },
              nad:function(q2){ return q2[0] === eerst && q2[1] === dan; }, pad:function(q2){ return q2.length === 1 && q2[0] === eerst; },
              blad:function(pp){ return pp[0] === eerst && pp[1] === dan && m >= 3 ? br(T2, N2) : ''; }, aria:'kansboom zonder terugleggen' }); };
            return { vraag:'Kans op ' + vr + '?', context:z.zin + ' Je pakt er twee, zonder terug te leggen. ' + k0[2] + ' is ' + k0[0] + ', ' + k1[2] + ' is ' + k1[0] + '. Geef je antwoord als breuk.', antwoord:brAnt(T2, N2), controle:kansC(T2, N2), invoer:'tekst', beeld:bl, zelfBeeld:bl(0), stappen:[
              kansStap('De eerste keer: kans op ' + kn[eerst][0] + ' =', t1, n1v, aant[eerst] + ' van de ' + N + ' knikkers zijn ' + kn[eerst][0] + '.'),
              kansStap('Je legt de ' + kn[eerst][1] + ' knikker niet terug. Er zitten nog ' + (N - 1) + ' knikkers in, waarvan ' + rest[dan] + ' ' + kn[dan][0] + '. De tweede keer: kans op ' + kn[dan][0] + ' =', t2, n2v, 'Noemer: één knikker minder. Teller: ' + (eerst === dan ? 'ook één ' + kn[dan][1] + ' minder.' : 'de ' + kn[dan][1] + ' knikkers zijn er nog allemaal.'),
                F(brAnt(t2, n2v), br(aant[dan], N), 'Je legde niet terug. Er zit nu één knikker minder in.', br(aant[dan], N - 1), eerst === dan ? 'Er zit ook één ' + kn[dan][1] + ' minder in.' : 'Goed gedacht, maar kijk nog eens naar de teller.')),
              kansStap('Langs de tak: ' + br(t1, n1v) + ' ' + X + ' ' + br(t2, n2v) + ' =', T2, N2, 'Teller keer teller: ' + t1 + ' ' + X + ' ' + t2 + '. Noemer keer noemer: ' + n1v + ' ' + X + ' ' + n2v + '.', F(brAnt(T2, N2), br(t1 * aant[dan], N * N), 'Dat is met terugleggen. Gebruik de kansen van de tweede keer.')) ] };
          } },
        { id:'wi-kans-drie', naam:'Drie keer: tel de takken', kort:'Reken de kans op één tak uit en doe die keer het aantal takken dat past',
          uit:'<p>Je gooit drie keer met een dobbelsteen. Hoe groot is de kans op <b>precies twee zessen</b>?</p><p>Dat kan op <b>3</b> manieren: 66n, 6n6 en n66 (n is geen zes). Elke tak heeft dezelfde kans: 1/6 × 1/6 × 5/6 = 5/216.</p><p>Je hoeft ze niet los op te tellen: doe de kans van één tak <b>keer het aantal takken</b>. 3 × 5/216 = <b>15/216</b>.</p>',
          wanneer:'je drie keer iets doet en de kans zoekt op precies één of precies twee keer.',
          maak:function(R){
            var p, q, n, nm, zin, wat;
            if (R.heel(0, 1)){ p = 1; q = 5; n = 6; nm = ['6', 'n']; zin = 'Je gooit drie keer met een dobbelsteen. 6 is een zes, n is geen zes.'; wat = 'zes'; }
            else { var z = zak(R, 8); p = z.a; q = z.b; n = z.N; nm = [z.k[0][2], z.k[1][2]]; zin = z.zin + ' Je pakt drie keer een knikker en legt hem steeds terug. ' + z.k[0][2] + ' is ' + z.k[0][0] + ', ' + z.k[1][2] + ' is ' + z.k[1][0] + '.'; wat = z.k[0][1] + ' knikker'; wat = 'keer ' + z.k[0][0]; }
            var k = R.kies([1, 2]), tel = p * (k === 2 ? p * q : q * q), N3 = n * n * n, tot = 3 * tel;
            var takken = k === 2 ? [nm[0] + nm[0] + nm[1], nm[0] + nm[1] + nm[0], nm[1] + nm[0] + nm[0]] : [nm[0] + nm[1] + nm[1], nm[1] + nm[0] + nm[1], nm[1] + nm[1] + nm[0]];
            var vr = 'precies ' + (k === 2 ? 'twee' : 'één') + ' ' + (wat === 'zes' ? (k === 2 ? 'zessen' : 'zes') : wat);
            function past(pp){ return pp.filter(function(c){ return c === 0; }).length === k; }
            var keten = takken[0].split('').map(function(c){ return br(c === nm[0] ? p : q, n); }).join(' ' + X + ' ');
            var bl = function(m){ return boom([nm, nm, nm], { kans:function(pp, c){ return br(c ? q : p, n); }, nad:m >= 1 ? past : null, blad:function(pp){ return pp.map(function(c){ return nm[c]; }).join(''); }, aria:'kansboom met drie keer twee takken' }); };
            return { vraag:'Kans op ' + vr + '?', context:zin + ' Geef je antwoord als breuk.', antwoord:brAnt(tot, N3), controle:kansC(tot, N3), invoer:'tekst', beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Hoeveel takken hebben ' + vr + '?', 3, 'Schrijf ze op: ' + takken.join(', ') + '.', F(3, 1, 'Er zijn meer volgordes. Het kan ook op een andere plek.', 8, 'Dat zijn alle takken. Tel alleen de takken die passen.')),
              kansStap('De kans op één tak, bijvoorbeeld ' + takken[0] + ': ' + keten + ' =', tel, N3, 'Teller keer teller keer teller, en ' + n + ' ' + X + ' ' + n + ' ' + X + ' ' + n + ' = ' + N3 + '.'),
              kansStap('Alle passende takken samen: 3 ' + X + ' ' + br(tel, N3) + ' =', tot, N3, 'Elke tak heeft dezelfde kans. Doe de teller keer 3.', F(brAnt(tot, N3), br(tel, N3), 'Dat is één tak. Er zijn er 3.', br(3 * tel, 3 * N3), 'Alleen de teller gaat keer 3.')) ] };
          } }
      ] }
  ]);
})();
