/* De leerroute wiskunde, havo wiskunde A: telproblemen (vermenigvuldigingsregel,
   faculteit, permutaties, combinaties, rijtjes), kansregels (somregel, productregel,
   complementregel, met of zonder terugleggen, tellen met combinaties), de binomiale
   kans en de verwachtingswaarde, de standaardafwijking en de vuistregels van de
   normale verdeling, polygonen en steekproeven, lineaire en exponentiële formules
   (groeifactor omrekenen, verdubbelingstijd, machtsformules) en veranderingen
   (toenamediagram, differentiequotiënt, helling met een raaklijn).
   Alles zonder grafische rekenmachine: de getallen zijn zo gekozen dat het met een
   gewone rekenmachine kan. Kansbomen staan in wiskunde-statistiek.js (wi-kans).
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '×';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* ligt x bij afronden op d decimalen te dicht bij een vijf? (m: marge in delen van de laatste decimaal) */
  function grens(x, d, m){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < (m || 0.02); }
  function rT(x, d){ return T(rnd(x, d), { dec:d, vast:true }); }
  function rAnt(x, d){ return uniek([rT(x, d), T(rnd(x, d))]); }
  function pAnt(x){ return [T(x), T(x) + '%']; }
  function varianten(k){
    k = String(k).toLowerCase().trim(); var a = k.replace(/−/g, '-'), l = [k, k.replace(/\s+/g, ''), a, a.replace(/\s+/g, '')];
    return uniek(l.concat(l.map(function(x){ return x.replace(/,/g, '.'); })));
  }
  function F(goed){
    var o = {}, g = [];
    [].concat(goed).forEach(function(x){ g = g.concat(varianten(typeof x === 'number' ? T(x) : x)); });
    for (var i = 1; i + 1 < arguments.length; i += 2){
      var uitleg = arguments[i + 1], k = arguments[i];
      varianten(typeof k === 'number' ? T(k) : k).forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = uitleg; });
    }
    return o;
  }
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
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function fac(n){ var p = 1; for (var i = 2; i <= n; i++) p *= i; return p; }
  function perm(n, k){ var p = 1; for (var i = 0; i < k; i++) p *= n - i; return p; }
  function comb(n, k){ if (k < 0 || k > n) return 0; return Math.round(perm(n, k) / fac(k)); }
  function keten(n, k){ var l = []; for (var i = 0; i < k; i++) l.push(n - i); return l.join(' ' + X + ' '); }
  function rep(x, k){ var l = []; for (var i = 0; i < k; i++) l.push(x); return l; }
  function opsom(l){ l = l.map(String); return l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' en ' + l[l.length - 1]; }
  function boven(n, k){ return '(' + n + ' boven ' + k + ')'; }
  /* breuken en kansen */
  function br(t, n){ return t + '/' + n; }
  function brv(t, n){ if (t === 0) return '0'; var g = ggd(t, n); return n / g === 1 ? String(t / g) : br(t / g, n / g); }
  function brAnt(t, n){ return uniek([br(t, n), brv(t, n)]); }
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
  /* een kans als kommagetal uit hele procenten of promilles, zonder rekenfouten */
  function dec(teller, noemer){ return Math.round(teller / noemer * 1e9) / 1e9; }
  /* twee getallen, van klein naar groot of andersom: "162 en 178" */
  function paarC(a, b){
    return function(v){
      var m = String(v).replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2').match(/\d+(?:[.,]\d+)?/g);
      if (!m || m.length !== 2) return false;
      var l = m.map(function(x){ return +x.replace(',', '.'); }).sort(function(p, q){ return p - q; });
      return Math.abs(l[0] - a) < 1e-9 && Math.abs(l[1] - b) < 1e-9;
    };
  }

  /* ---------- formules lezen (zoals in wiskunde-verbanden.js) ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
  function norm(t){
    return String(t == null ? '' : t).toLowerCase().replace(/[−–—]/g, '-').replace(/[×·*]/g, '*').replace(/:/g, '/')
      .replace(/,/g, '.').replace(/\s+/g, '').replace(/([a-z])(\d)(?![\d.])/g, '$1^$2');
  }
  function lees(t){
    var s = norm(t); if (!s) return null;
    var tk = s.match(/\d+(?:\.\d+)?|\.\d+|[a-z]|[-+*\/^()]/g);
    if (!tk || tk.join('') !== s) return null;
    var i = 0;
    function kijk(){ return tk[i]; }
    function atoom(){
      var t = tk[i++]; if (t == null) return null;
      if (/^[\d.]/.test(t)) return { '':parseFloat(t) };
      if (/^[a-z]$/.test(t)){ var o = {}; o[t] = 1; return o; }
      if (t === '('){ var p = som(); if (!p || tk[i++] !== ')') return null; return p; }
      return null;
    }
    function macht(){
      var p = atoom(); if (!p) return null;
      if (kijk() === '^'){ i++; var e = tk[i++]; if (!/^\d$/.test(e || '')) return null; var r = { '':1 }; for (var k = 0; k < +e; k++) r = pMaal(r, p); p = r; }
      return p;
    }
    function unair(){
      if (kijk() === '-'){ i++; var p = unair(); return p && pSchaal(p, -1); }
      if (kijk() === '+'){ i++; return unair(); }
      return macht();
    }
    function term(){
      var p = unair(); if (!p) return null;
      for (;;){
        var t = kijk();
        if (t === '*' || t === '/'){ i++; var q = unair(); if (!q) return null;
          if (t === '*') p = pMaal(p, q); else { var c = pConst(q); if (c == null || Math.abs(c) < 1e-12) return null; p = pSchaal(p, 1 / c); } }
        else if (t && (/^[a-z]$/.test(t) || t === '(')){ var q2 = macht(); if (!q2) return null; p = pMaal(p, q2); }
        else return p;
      }
    }
    function som(){
      var p = term(); if (!p) return null;
      while (kijk() === '+' || kijk() === '-'){ var o = tk[i++], q = term(); if (!q) return null; p = pPlus(p, o === '-' ? pSchaal(q, -1) : q); }
      return p;
    }
    var uit = som();
    return uit && i === tk.length ? uit : null;
  }
  /* een lineaire formule y = a·x + b met eigen letters; "y =" mag ook weg */
  function linC(y, x, a, b){
    y = y.toLowerCase(); x = x.toLowerCase();
    var q = {}; q[x] = a; q[''] = b; var yy = {}; yy[y] = 1;
    return function(v){
      var d = String(v).split('='); if (d.length > 2) return false;
      if (d.length === 2){
        var l = lees(d[0]), r = lees(d[1]); if (!l || !r) return false;
        if (pGelijk(l, yy)) return pGelijk(r, q);
        if (pGelijk(r, yy)) return pGelijk(l, q);
        return false;
      }
      var p = lees(d[0]); return !!p && pGelijk(p, q);
    };
  }
  function linS(y, x, a, b){ return y + ' = ' + (a === 1 ? '' : a === -1 ? MIN : T(a)) + x + (b < 0 ? ' ' + MIN + ' ' + T(-b) : ' + ' + T(b)); }
  /* N = b · g^t */
  function getal(t, duizend){ t = String(t); if (duizend && /^\d{1,3}(\.\d{3})+$/.test(t)) return +t.replace(/\./g, ''); if (!/^\d+([.,]\d+)?$/.test(t)) return NaN; return +t.replace(',', '.'); }
  function expC(b, g){
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/^[a-z]=/, '');
      var m = /^([\d.,]+)[×·*x]\(?([\d.,]+)\)?\^t$/.exec(s) || /^([\d.,]+)\(([\d.,]+)\)\^t$/.exec(s);
      return !!m && Math.abs(getal(m[1], true) - b) < 1e-9 && Math.abs(getal(m[2]) - g) < 1e-9;
    };
  }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600)];
    st.push('fill:' + (o.k || 'var(--ink)'));
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" style="' + st.join(';') + '">' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(Math.max(w, 0)) + '" height="' + n1(Math.max(h, 0)) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + '"/>'; }
  function stip(x, y, k, r){ return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + (r || 5) + '" style="fill:' + (k || 'var(--ink)') + ';stroke:var(--kaart);stroke-width:1.5"/>'; }
  function pl(pts, k, w, dash){ return '<polyline points="' + pts.map(function(p){ return n1(p[0]) + ',' + n1(p[1]); }).join(' ') + '" style="fill:none;stroke:' + (k || 'var(--ink)') + ';stroke-width:' + (w || 3) + (dash ? ';stroke-dasharray:' + dash : '') + ';stroke-linejoin:round;stroke-linecap:round"/>'; }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).filter(Boolean).map(function(x){ return /^<svg/.test(x) ? '<div style="width:100%;max-width:600px">' + x + '</div>' : x; }).join('') + '</div>'; }
  /* een assenstelsel met hokjes: x0..x1, y0..y1, gx/gy hokjes, lx/ly getallen, xt/yt namen bij de assen */
  function raster(o){
    var mL = 50, mR = 26, mT = 26, mB = 48, B = o.B || 500, H = o.H || 300, s = '', i, v;
    var Xf = function(x){ return mL + (x - o.x0) / (o.x1 - o.x0) * B; };
    var Yf = function(y){ return mT + (o.y1 - y) / (o.y1 - o.y0) * H; };
    for (i = 0; (v = o.x0 + i * o.gx) <= o.x1 + 1e-9; i++) s += ln(Xf(v), Yf(o.y0), Xf(v), Yf(o.y1), { w:1, op:0.2 });
    for (i = 0; (v = o.y0 + i * o.gy) <= o.y1 + 1e-9; i++) s += ln(Xf(o.x0), Yf(v), Xf(o.x1), Yf(v), { w:1, op:0.2 });
    var ay = o.y0 <= 0 && o.y1 >= 0 ? 0 : o.y0;
    s += ln(Xf(o.x0), Yf(ay), Xf(o.x1) + 6, Yf(ay), { w:2 }) + ln(Xf(o.x0), Yf(o.y0), Xf(o.x0), Yf(o.y1) - 6, { w:2 });
    for (i = 0; (v = o.x0 + i * o.lx) <= o.x1 + 1e-9; i++) s += ln(Xf(v), Yf(o.y0), Xf(v), Yf(o.y0) + 5, { w:1.5 }) + tx(Xf(v), Yf(o.y0) + 21, (o.xf || T)(rnd(v, 6)), { fs:13 });
    for (i = 0; (v = o.y0 + i * o.ly) <= o.y1 + 1e-9; i++) s += tx(Xf(o.x0) - 8, Yf(v) + 5, T(rnd(v, 6)), { fs:13, a:'end' });
    if (o.xt) s += tx(Xf(o.x1) + 6, Yf(o.y0) + 42, o.xt, { fs:13, a:'end', vet:true });
    if (o.yt) s += tx(Xf(o.x0) + 8, mT - 10, o.yt, { fs:13, a:'start', vet:true });
    return { X:Xf, Y:Yf, s:s, W:mL + B + mR, H:mT + H + mB };
  }
  function klaar(g, extra, aria){ return svg(g.W, g.H, g.s + (extra || ''), aria, 600); }
  /* de normale kromme met de vuistregels; o.lab: bij welke k (−2..2) de waarde staat; o.van/o.tot: kleur tussen (in σ) */
  function klok(mu, sg, o){
    o = o || {};
    var L = 30, Rr = 570, base = 168, top = 36, s = '', k, d;
    function Xk(t){ return L + (t + 3.3) / 6.6 * (Rr - L); }
    function Yk(t){ return base - Math.exp(-t * t / 2) * (base - top); }
    if (o.van != null && o.tot > o.van){
      d = 'M' + n1(Xk(o.van)) + ' ' + base;
      for (k = o.van; k <= o.tot + 1e-9; k += 0.05) d += ' L' + n1(Xk(k)) + ' ' + n1(Yk(k));
      d += ' L' + n1(Xk(o.tot)) + ' ' + n1(Yk(o.tot)) + ' L' + n1(Xk(o.tot)) + ' ' + base + ' Z';
      s += '<path d="' + d + '" style="fill:' + KL[1] + ';fill-opacity:0.28;stroke:none"/>';
    }
    d = ''; for (k = -3.3; k <= 3.3 + 1e-9; k += 0.05) d += (d ? ' L' : 'M') + n1(Xk(k)) + ' ' + n1(Yk(k));
    s += '<path d="' + d + '" style="fill:none;stroke:' + KL[0] + ';stroke-width:3"/>' + ln(Xk(-3.3), base, Xk(3.3), base, { w:2 });
    [-2, -1, 0, 1, 2].forEach(function(t){
      s += ln(Xk(t), base, Xk(t), Yk(t), { w:1.5, dash:t ? '5 4' : null });
      s += tx(Xk(t), base + 38, t === 0 ? 'μ' : 'μ ' + (t < 0 ? MIN : '+') + ' ' + (Math.abs(t) === 2 ? '2σ' : 'σ'), { fs:12, k:'var(--muted)' });
      if (!o.lab || o.lab.indexOf(t) >= 0) s += tx(Xk(t), base + 20, T(mu + t * sg), { fs:13, vet:true });
    });
    [[-2.65, '2,5%'], [-1.5, '13,5%'], [-0.5, '34%'], [0.5, '34%'], [1.5, '13,5%'], [2.65, '2,5%']].forEach(function(p){
      var y = Math.abs(p[0]) > 2 ? base - 20 : Math.abs(p[0]) > 1 ? base - 12 : base - 50;
      s += tx(Xk(p[0]), y, p[1], { fs:12, vet:true, k:KL[2] });
    });
    return svg(600, base + 48, s, o.aria || 'normale verdeling met de vuistregels', 600);
  }
  var ONDER = { '-2':2.5, '-1':16, '0':50, '1':84, '2':97.5 };
  var PLEK = ['μ ' + MIN + ' 2σ', 'μ ' + MIN + ' σ', 'μ', 'μ + σ', 'μ + 2σ'];

  /* ================= verhalen ================= */
  var NORMAAL = [
    { wat:'De lengte van volwassen mannen is normaal verdeeld', mu:[180, 182, 183], sg:[6, 7, 8], eh:'cm', meer:'langer dan', minder:'korter dan', wie:'mannen', ev:'is', mv:'zijn', na:' lang', N:[400, 600, 800, 1000] },
    { wat:'Het gewicht van zakken chips is normaal verdeeld', mu:[150, 200, 250], sg:[2, 3, 4, 5], eh:'gram', meer:'meer dan', minder:'minder dan', wie:'zakken', ev:'weegt', mv:'wegen', na:'', N:[200, 400, 1000, 2000] },
    { wat:'De reistijd van een busrit is normaal verdeeld', mu:[30, 35, 40, 45], sg:[3, 4, 5], eh:'minuten', meer:'langer dan', minder:'korter dan', wie:'ritten', ev:'duurt', mv:'duren', na:'', N:[200, 400, 600] },
    { wat:'Het geboortegewicht van baby\'s is normaal verdeeld', mu:[3400, 3500], sg:[400, 450, 500], eh:'gram', meer:'meer dan', minder:'minder dan', wie:'baby\'s', ev:'weegt', mv:'wegen', na:'', N:[400, 800, 1200] },
    { wat:'De brandduur van een soort lamp is normaal verdeeld', mu:[1000, 1200, 1500], sg:[50, 100, 150], eh:'uur', meer:'langer dan', minder:'korter dan', wie:'lampen', ev:'brandt', mv:'branden', na:'', N:[200, 600, 1000, 2000] } ];
  function normaalZin(it, mu, sg){ return it.wat + ', met een gemiddelde van ' + T(mu) + ' ' + it.eh + ' en een standaardafwijking van ' + T(sg) + ' ' + it.eh + '.'; }
  /* de vraag in woorden: rel is "langer dan 187" of "tussen 173 en 187"; aantal: hoeveel mannen in plaats van hoeveel procent */
  function normaalVr(it, rel, tussen, aantal){ return aantal ? 'Hoeveel ' + it.wie + ' ' + it.mv + ' ' + rel + ' ' + it.eh + (tussen ? it.na : '') + '?' : 'Hoeveel procent van de ' + it.wie + ' ' + it.ev + ' ' + rel + ' ' + it.eh + (tussen ? it.na : '') + '?'; }
  var KLASSEN = [
    { wat:'de lengte van leerlingen', eh:'cm', s:[150, 155, 160], w:5, wie:'leerlingen', mv:'een lengte' },
    { wat:'de reistijd naar school', eh:'minuten', s:[0], w:10, wie:'leerlingen', mv:'een reistijd' },
    { wat:'het gewicht van appels', eh:'gram', s:[100, 120], w:20, wie:'appels', mv:'een gewicht' },
    { wat:'de leeftijd van bezoekers van een concert', eh:'jaar', s:[10, 15], w:5, wie:'bezoekers', mv:'een leeftijd' } ];
  function klasT(it, a, b){ return T(a) + ' tot ' + T(b); }
  /* hele procenten die samen 100 zijn, elk minstens min en een veelvoud van stap */
  function verdeel(R, n, min, stap){
    var p;
    do { p = []; var rest = 100; for (var i = 0; i < n - 1; i++){ var x = stap * R.heel(Math.ceil(min / stap), Math.floor((rest - (n - 1 - i) * min) / stap)); p.push(x); rest -= x; } p.push(rest); }
    while (p.some(function(x){ return x < min || x % stap; }) || Math.max.apply(null, p) > 60);
    return R.hussel(p);
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= telproblemen ================= */
    { groep:{ id:'wha-tel', niveau:'havo', domein:'statistiek', naam:'Telproblemen',
        uit:'Wiskunde A: tellen op hoeveel manieren iets kan. Keuzes na elkaar vermenigvuldigen, dingen op volgorde zetten met de faculteit, kiezen met volgorde (permutaties) of zonder volgorde (combinaties), en rijtjes van twee soorten tellen.' },
      doelen:[
        { id:'wha-tel-keer', naam:'De vermenigvuldigingsregel', kort:'Maak je na elkaar een paar keuzes, vermenigvuldig dan de aantallen mogelijkheden per keuze',
          uit:'<p>Een restaurant heeft 3 voorgerechten, 4 hoofdgerechten en 2 nagerechten. Hoeveel menu\'s kun je kiezen?</p><p>Bij elk voorgerecht passen 4 hoofdgerechten: 3 ' + X + ' 4 = 12 combinaties. Bij elk daarvan passen 2 nagerechten: 12 ' + X + ' 2 = <b>24</b>.</p><p>Dat is de <b>vermenigvuldigingsregel</b>: maak je een paar keuzes <b>na elkaar</b>, dan <b>vermenigvuldig</b> je de aantallen. Mag iets vaker voorkomen, zoals cijfers in een pincode, dan heb je bij elke plek weer evenveel keuzes: 10 ' + X + ' 10 ' + X + ' 10 ' + X + ' 10.</p>',
          wanneer:'je een paar keuzes na elkaar maakt: een menu, een outfit, een route of een code.',
          maak:function(R){
            var it = R.kies([
              function(){ var a = R.heel(2, 5), b = R.heel(3, 6), c = R.heel(2, 4); return { zin:'Een restaurant heeft ' + a + ' voorgerechten, ' + b + ' hoofdgerechten en ' + c + ' nagerechten. Je kiest van elk één.', vr:'Hoeveel menu\'s zijn er?', l:[a, b, c] }; },
              function(){ var a = R.heel(3, 7), b = R.heel(2, 5), c = R.heel(2, 4); return { zin:'Je hebt ' + a + ' shirts, ' + b + ' broeken en ' + c + ' paar schoenen. Je trekt van elk één aan.', vr:'Hoeveel outfits zijn er?', l:[a, b, c] }; },
              function(){ var a = R.heel(2, 4), b = R.heel(2, 5), c = R.heel(2, 4); return { zin:'Van A naar B gaan ' + a + ' wegen, van B naar C ' + b + ' wegen en van C naar D ' + c + ' wegen.', vr:'Hoeveel routes van A naar D?', l:[a, b, c] }; },
              function(){ var k = R.heel(3, 4); return { zin:'Een pincode bestaat uit ' + k + ' cijfers van 0 tot en met 9. Een cijfer mag vaker voorkomen.', vr:'Hoeveel pincodes zijn er?', l:rep(10, k) }; },
              function(){ var v = R.heel(3, 5); return { zin:'Een toets heeft ' + v + ' meerkeuzevragen met elk 4 antwoorden. Je kruist bij elke vraag één antwoord aan.', vr:'Op hoeveel manieren kan dat?', l:rep(4, v) }; },
              function(){ var c = R.heel(2, 3); return { zin:'Een code bestaat uit 2 letters (er zijn 26 letters) en daarna ' + c + ' cijfers (0 tot en met 9). Letters en cijfers mogen vaker voorkomen.', vr:'Hoeveel codes zijn er?', l:[26, 26].concat(rep(10, c)) }; } ])();
            var l = it.l, prod = l.reduce(function(a, b){ return a * b; }, 1), p2 = l[0] * l[1], som = l.reduce(function(a, b){ return a + b; }, 0);
            var goed = l.join(' ' + X + ' '), fout = [l.join(' + ')];
            fout.push(Math.max.apply(null, l) + ' ' + X + ' ' + l.length);
            return { vraag:it.vr, context:it.zin, stappen:[
              K(R, 'Welke berekening hoort erbij?', goed, fout, 'Je maakt ' + l.length + ' keuzes na elkaar. Bij elke keuze vermenigvuldig je met het aantal mogelijkheden.'),
              S('Begin met de eerste twee keuzes: ' + l[0] + ' ' + X + ' ' + l[1] + ' =', p2, 'Bij elk van de ' + l[0] + ' mogelijkheden passen er ' + l[1] + '.', F(p2, l[0] + l[1], 'Je telde op. Bij keuzes na elkaar vermenigvuldig je.')),
              S('Het aantal: ' + goed + ' =', prod, p2 + ' ' + X + ' ' + l.slice(2).join(' ' + X + ' ') + ' = ' + T(prod) + '.', F(prod, som, 'Je telde op. Bij keuzes na elkaar vermenigvuldig je.')) ] };
          } },
        { id:'wha-tel-fac', naam:'Alles op volgorde: de faculteit', kort:'n verschillende dingen op een rij zetten kan op n! = n · (n − 1) · … · 1 manieren',
          uit:'<p>Vijf vrienden gaan naast elkaar op een foto. Voor de eerste plek heb je <b>5</b> keuzes. Daarna zijn er nog 4 over voor de tweede plek, dan 3, dan 2 en dan 1.</p><p>Het aantal volgordes is 5 ' + X + ' 4 ' + X + ' 3 ' + X + ' 2 ' + X + ' 1 = <b>120</b>. Dat schrijf je als <b>5!</b> (vijf <b>faculteit</b>).</p><p>Op de rekenmachine zit een knop <b>x!</b>. Let op: de getallen worden snel groot. 8! is al 40.320.</p>',
          wanneer:'je alle dingen of mensen op een volgorde zet.',
          maak:function(R){
            var n = R.heel(4, 8), it = R.kies([
              { zin:n + ' vrienden gaan naast elkaar op een foto.', vr:'Op hoeveel manieren kunnen ze staan?' },
              { zin:'Je zet ' + n + ' verschillende boeken naast elkaar op een plank.', vr:'Hoeveel volgordes zijn er?' },
              { zin:'Bij een race rijden ' + n + ' auto\'s. Er komen er nooit twee tegelijk over de finish.', vr:'Hoeveel uitslagen zijn er?' },
              { zin:'Een afspeellijst heeft ' + n + ' nummers. Je speelt ze allemaal een keer af, in een willekeurige volgorde.', vr:'Hoeveel volgordes zijn er?' } ]);
            var f = fac(n);
            return { vraag:it.vr, context:it.zin, stappen:[
              S('Hoeveel keuzes heb je voor de eerste plek?', n, 'Alle ' + n + ' kunnen nog op de eerste plek.'),
              S('Er is er één weg. Hoeveel keuzes heb je voor de tweede plek?', n - 1, 'Er zijn er nog ' + (n - 1) + ' over.', F(n - 1, n, 'Wie op de eerste plek staat, kan niet ook op de tweede.')),
              S('Ga zo door tot 1. Het aantal: ' + n + '! = ' + keten(n, n) + ' =', f, 'Tik in: ' + n + ' x! of vermenigvuldig ' + keten(n, n) + '.', F(f, n * (n - 1), 'Je stopte na twee plekken. Ga door tot 1.', n * n, 'Je hebt niet elke keer ' + n + ' keuzes: er gaat er steeds een af.', Math.pow(n, n), 'Je hebt niet elke keer ' + n + ' keuzes: er gaat er steeds een af.')) ] };
          } },
        { id:'wha-tel-perm', naam:'Permutaties: kiezen met volgorde', kort:'Kies je er k uit n en telt de volgorde, dan is het aantal n · (n − 1) · … (k getallen), op de rekenmachine n nPr k',
          uit:'<p>Bij een race met 8 lopers krijgen de eerste drie goud, zilver en brons. Hoeveel uitslagen voor het podium zijn er?</p><p>Hier <b>telt de volgorde</b>: goud voor Anna en zilver voor Bo is iets anders dan andersom. Voor goud heb je 8 keuzes, voor zilver nog 7 en voor brons nog 6. Dus 8 ' + X + ' 7 ' + X + ' 6 = <b>336</b>.</p><p>Dit heet een <b>permutatie</b>. Je vermenigvuldigt evenveel getallen als je plekken vult, en elke keer een minder. Op de rekenmachine: <b>8 nPr 3</b>.</p>',
          wanneer:'je er een paar kiest en het uitmaakt wie welke plek of taak krijgt.',
          maak:function(R){
            var n = R.heel(6, 12), it = R.kies([
              { zin:'Bij een hardloopwedstrijd doen ' + n + ' lopers mee. De eerste drie krijgen goud, zilver en brons.', vr:'Hoeveel podiums zijn er mogelijk?', k:3 },
              { zin:'Een club heeft ' + n + ' leden. Ze kiezen een voorzitter, een secretaris en een penningmeester. Niemand krijgt twee taken.', vr:'Op hoeveel manieren kan dat?', k:3 },
              { zin:'Je kiest uit ' + n + ' liedjes je top ' + 2 + ': een eerste en een tweede plaats.', vr:'Hoeveel toplijstjes zijn er?', k:2 },
              { zin:'Je kiest uit ' + n + ' liedjes je top 4, op volgorde.', vr:'Hoeveel toplijstjes zijn er?', k:4 },
              { zin:'Een code bestaat uit 3 verschillende letters uit de letters A tot en met ' + 'ABCDEFGHIJKL'.charAt(n - 1) + ' (' + n + ' letters). De volgorde telt.', vr:'Hoeveel codes zijn er?', k:3 } ]);
            var k = it.k, P = perm(n, k), C = comb(n, k);
            return { vraag:it.vr, context:it.zin, stappen:[
              K(R, 'Telt de volgorde?', 'ja', ['nee'], 'Is A op de eerste plek en B op de tweede iets anders dan andersom? Dan telt de volgorde.', { orde:['ja', 'nee'] }),
              S('Hoeveel plekken vul je?', k, 'Tel de plekken of taken: ' + k + '.'),
              S('Het aantal: ' + keten(n, k) + ' =', P, k + ' getallen, elke keer een minder. Op de rekenmachine: ' + n + ' nPr ' + k + '.', F(P, Math.pow(n, k), 'Iemand kan niet twee plekken krijgen. Er gaat er steeds een af.', C, 'Dat is zonder volgorde. Hier telt de volgorde wel.', fac(n), 'Je zette ze allemaal op volgorde. Je vult maar ' + k + ' plekken.')) ] };
          } },
        { id:'wha-tel-comb', naam:'Combinaties: kiezen zonder volgorde', kort:'Kies je er k uit n en telt de volgorde niet, deel dan het aantal met volgorde door k!; dat is (n boven k), op de rekenmachine n nCr k',
          uit:'<p>Uit 6 leerlingen kies je er 2 voor een commissie. Hoeveel commissies zijn er? Anna en Bo is <b>hetzelfde</b> als Bo en Anna: de <b>volgorde telt niet</b>.</p><p>Met volgorde zou het 6 ' + X + ' 5 = 30 zijn. Maar elk tweetal tel je dan 2! = 2 keer. Dus zijn er 30 : 2 = <b>15</b> commissies.</p><p>Dit heet een <b>combinatie</b>. Je schrijft het als <b>(6 boven 2)</b>, de <b>binomiaalcoëfficiënt</b>. Op de rekenmachine: <b>6 nCr 2</b>.</p>',
          wanneer:'je een groepje kiest en het niet uitmaakt in welke volgorde.',
          maak:function(R){
            var n = R.heel(5, 12), k = R.heel(2, Math.min(4, n - 2)), it = R.kies([
              { zin:'Uit een groep van ' + n + ' leerlingen kies je er ' + k + ' voor de leerlingenraad. Ze hebben allemaal dezelfde taak.', vr:'Hoeveel groepjes zijn er?' },
              { zin:'Je mag ' + k + ' van de ' + n + ' boeken meenemen op vakantie.', vr:'Op hoeveel manieren kun je kiezen?' },
              { zin:'Op een pizza kies je ' + k + ' van de ' + n + ' toppings. Elke topping kies je hoogstens een keer.', vr:'Hoeveel pizza\'s zijn er?' },
              { zin:'Bij een toernooi met ' + n + ' teams speelt elk team een keer tegen elk ander team. Een wedstrijd is een tweetal teams.', vr:'Hoeveel wedstrijden zijn er?', k:2 } ]);
            if (it.k) k = it.k;
            var P = perm(n, k), kf = fac(k), C = comb(n, k);
            return { vraag:it.vr, context:it.zin, stappen:[
              K(R, 'Telt de volgorde?', 'nee', ['ja'], 'Is het groepje A, B hetzelfde als B, A? Dan telt de volgorde niet.', { orde:['ja', 'nee'] }),
              S('Reken eerst alsof de volgorde wel telt: ' + keten(n, k) + ' =', P, k + ' getallen vermenigvuldigen, elke keer een minder.'),
              S('Elk groepje van ' + k + ' tel je zo ' + k + '! keer. ' + k + '! = ' + keten(k, k) + ' =', kf, 'Zoveel volgordes heeft een groepje van ' + k + '.'),
              S('Het aantal: ' + P + ' : ' + kf + ' =', C, 'Deel door ' + kf + '. Op de rekenmachine: ' + n + ' nCr ' + k + ', dat is ' + boven(n, k) + '.', F(C, P, 'Dan telt de volgorde nog mee. Deel door ' + k + '!.', Math.round(P / k), 'Deel door ' + k + '! = ' + kf + ', niet door ' + k + '.')) ] };
          } },
        { id:'wha-tel-rijtjes', naam:'Rijtjes van twee soorten: n boven k', kort:'Een rijtje van n plekken met precies k keer de ene soort: kies de k plekken, dat kan op (n boven k) manieren',
          uit:'<p>Je gooit 5 keer met een munt. Hoeveel rijtjes hebben precies 2 keer kop? Bijvoorbeeld KKMMM of MKMKM.</p><p>Je hoeft alleen te kiezen <b>op welke 2 van de 5 plekken</b> kop staat. Op de andere plekken staat munt. Welke plek je eerst kiest maakt niet uit, dus het is een combinatie: <b>(5 boven 2)</b> = 10.</p><p>Zo tel je ook <b>routes</b> in een rooster: 3 stappen naar rechts en 2 naar boven is een rijtje van 5 stappen met 3 keer R. Dat kan op (5 boven 3) = 10 manieren.</p>',
          wanneer:'je rijtjes telt met precies zoveel keer kop, goed, raak of naar rechts.',
          maak:function(R){
            var soort = R.kies(['munt', 'toets', 'raak', 'route', 'route']), n, k, zin, vr, st1, st2, r, b;
            if (soort === 'route'){ r = R.heel(2, 5); b = R.heel(2, 4); n = r + b; k = r; zin = 'In het rooster loop je van A naar B. Je gaat alleen naar rechts of naar boven, steeds een hokje.'; vr = 'Hoeveel routes zijn er?';
              st1 = S('Hoeveel stappen zet je in totaal?', n, 'Tel de hokjes: ' + r + ' naar rechts en ' + b + ' naar boven.'); st2 = S('Hoeveel van die stappen gaan naar rechts?', r, 'Tel de hokjes in de breedte.'); }
            else {
              n = R.heel(4, 8); k = R.heel(2, n - 2);
              if (soort === 'munt'){ zin = 'Je gooit ' + n + ' keer met een munt. Elke worp is kop of munt.'; vr = 'Hoeveel rijtjes met precies ' + k + ' keer kop?'; st2 = S('Op hoeveel van die plekken staat kop?', k, 'Dat staat in de vraag: precies ' + k + ' keer kop.'); }
              else if (soort === 'toets'){ zin = 'Een toets heeft ' + n + ' vragen. Elke vraag is goed of fout.'; vr = 'Hoeveel rijtjes met precies ' + k + ' goed?'; st2 = S('Op hoeveel van die plekken staat goed?', k, 'Dat staat in de vraag: precies ' + k + ' goed.'); }
              else { zin = 'Een voetballer neemt ' + n + ' strafschoppen. Elke schop is raak of mis.'; vr = 'Hoeveel rijtjes met precies ' + k + ' keer raak?'; st2 = S('Op hoeveel van die plekken staat raak?', k, 'Dat staat in de vraag: precies ' + k + ' keer raak.'); }
              st1 = S('Hoe lang is elk rijtje?', n, 'Elke worp, vraag of schop is een plek: ' + n + '.');
            }
            var C = comb(n, k), alle = Math.pow(2, n);
            var bl = soort !== 'route' ? null : (function(){
              var u = 44, s = '', x0 = 40, y0 = 24 + b * u;
              for (var i = 0; i <= r; i++) s += ln(x0 + i * u, y0, x0 + i * u, y0 - b * u, { w:2 });
              for (var j = 0; j <= b; j++) s += ln(x0, y0 - j * u, x0 + r * u, y0 - j * u, { w:2 });
              s += stip(x0, y0, KL[0], 7) + stip(x0 + r * u, y0 - b * u, KL[1], 7) + tx(x0 - 14, y0 + 20, 'A', { vet:true }) + tx(x0 + r * u + 16, y0 - b * u - 6, 'B', { vet:true });
              return svg(x0 + r * u + 40, y0 + 30, s, 'rooster van ' + r + ' bij ' + b + ' hokjes', 360);
            })();
            var o = { vraag:vr, context:zin, stappen:[st1, st2,
              S('Kies de plekken: ' + boven(n, k) + ' =', C, 'De volgorde van de gekozen plekken telt niet. Op de rekenmachine: ' + n + ' nCr ' + k + '.', F(C, alle, 'Dat zijn alle rijtjes. Je wilt alleen de rijtjes met precies ' + k + '.', perm(n, k), 'Dan telt de volgorde van de plekken mee. Neem nCr, niet nPr.')) ] };
            if (bl){ o.beeld = bl; o.zelfBeeld = bl; }
            return o;
          } },
        { id:'wha-tel-kies', naam:'Kies de telregel', kort:'Keuzes na elkaar: vermenigvuldigen; kiezen met volgorde: nPr; kiezen zonder volgorde: nCr; alles op volgorde: n!',
          uit:'<p>Bij een telprobleem kies je eerst de <b>telregel</b>. Stel jezelf twee vragen.</p><p><b>Mag iets vaker voorkomen?</b> Zoals cijfers in een code of worpen met een dobbelsteen. Dan gebruik je de <b>vermenigvuldigingsregel</b>: 10 ' + X + ' 10 ' + X + ' 10.</p><p>Kies je uit een groep en kan niemand twee keer? Dan: <b>telt de volgorde?</b> Ja: <b>permutaties</b> (nPr), of <b>n!</b> als je iedereen op volgorde zet. Nee: <b>combinaties</b> (nCr).</p>',
          wanneer:'je een telprobleem krijgt en niet weet welke regel past.',
          maak:function(R){
            var REG = ['vermenigvuldigingsregel', 'permutaties (nPr)', 'combinaties (nCr)', 'faculteit (n!)'];
            var soort = R.heel(0, 3), n = R.heel(6, 12), k = R.heel(2, 4), m = R.heel(4, 7), it;
            if (soort === 0) it = R.kies([
              function(){ var q = R.heel(3, 5); return { zin:'Een fietsslot heeft ' + q + ' ringen met elk de cijfers 0 tot en met 9.', vr:'Hoeveel codes zijn er?', a:Math.pow(10, q), h:rep(10, q).join(' ' + X + ' ') }; },
              function(){ var q = R.heel(2, 4); return { zin:'Je gooit ' + q + ' keer met een dobbelsteen en schrijft de ogen op een rij.', vr:'Hoeveel rijtjes zijn er?', a:Math.pow(6, q), h:rep(6, q).join(' ' + X + ' ') }; },
              function(){ var q = R.heel(3, 6); return { zin:'Een toets heeft ' + q + ' vragen met elk de antwoorden A, B, C en D.', vr:'Op hoeveel manieren kun je hem invullen?', a:Math.pow(4, q), h:rep(4, q).join(' ' + X + ' ') }; } ])();
            else if (soort === 1) it = R.kies([
              { zin:'Bij een schaatswedstrijd rijden ' + n + ' schaatsers. De eerste drie krijgen goud, zilver en brons.', vr:'Hoeveel podiums zijn er?', a:perm(n, 3), h:n + ' nPr 3 = ' + keten(n, 3) },
              { zin:'Uit ' + n + ' leden kiest een club een voorzitter, een secretaris en een penningmeester. Niemand krijgt twee taken.', vr:'Op hoeveel manieren kan dat?', a:perm(n, 3), h:n + ' nPr 3 = ' + keten(n, 3) },
              { zin:'Onder ' + n + ' mensen worden een eerste en een tweede prijs verloot. Niemand kan twee prijzen winnen.', vr:'Op hoeveel manieren kan dat?', a:perm(n, 2), h:n + ' nPr 2 = ' + keten(n, 2) } ]);
            else if (soort === 2) it = R.kies([
              { zin:'Uit een groep van ' + n + ' leerlingen kies je er ' + k + ' voor een commissie. Ze hebben allemaal dezelfde taak.', vr:'Hoeveel commissies zijn er?', a:comb(n, k), h:n + ' nCr ' + k },
              { zin:'Bij een toernooi met ' + n + ' teams speelt elk team een keer tegen elk ander team.', vr:'Hoeveel wedstrijden zijn er?', a:comb(n, 2), h:n + ' nCr 2' },
              { zin:'Je mag ' + k + ' van de ' + n + ' vragen kiezen om te beantwoorden.', vr:'Op hoeveel manieren kun je kiezen?', a:comb(n, k), h:n + ' nCr ' + k } ]);
            else it = R.kies([
              { zin:m + ' vrienden gaan naast elkaar op een foto.', vr:'Op hoeveel manieren kunnen ze staan?', a:fac(m), h:m + '! = ' + keten(m, m) },
              { zin:'Je zet ' + m + ' verschillende boeken naast elkaar op een plank.', vr:'Hoeveel volgordes zijn er?', a:fac(m), h:m + '! = ' + keten(m, m) },
              { zin:'Een docent bepaalt de volgorde van de ' + m + ' spreekbeurten van vandaag.', vr:'Hoeveel volgordes zijn er?', a:fac(m), h:m + '! = ' + keten(m, m) } ]);
            var hints = ['Mag iets vaker voorkomen? Dan heb je bij elke plek evenveel keuzes.', 'Niemand kan twee keer, en het maakt uit wie welke plek krijgt.', 'Niemand kan twee keer, en een groepje A, B is hetzelfde als B, A.', 'Je zet ze allemaal op een rij.'];
            return { vraag:it.vr, context:it.zin, stappen:[
              K(R, 'Welke telregel past?', REG[soort], REG.filter(function(x, i){ return i !== soort; }), hints[soort], { orde:REG }),
              S('Reken uit: ' + it.h + ' =', it.a, 'Gebruik de rekenmachine: ' + it.h + '.') ] };
          } }
      ] },

    /* ================= kansregels ================= */
    { groep:{ id:'wha-kregel', niveau:'havo', domein:'statistiek', naam:'Kansregels',
        uit:'Wiskunde A: de somregel, de productregel en de complementregel met kansen als kommagetal, met of zonder terugleggen, en kansen tellen met combinaties. Kansbomen staan bij Kansbomen.' },
      doelen:[
        { id:'wha-kans-som', naam:'De somregel bij een kansverdeling', kort:'Kunnen de uitkomsten niet tegelijk, dan tel je hun kansen op: P(X ≥ 2) = P(X = 2) + P(X = 3) + …',
          uit:'<p>X is het aantal doelpunten van een club in een wedstrijd. In een <b>kansverdeling</b> staat bij elke waarde van X de kans. Samen is dat 1.</p><p>Hoe groot is P(X ≥ 2), de kans op minstens 2 doelpunten? Dat zijn de waarden 2, 3 en 4. Een wedstrijd kan niet tegelijk 2 en 3 doelpunten hebben. Dan geldt de <b>somregel</b>: je <b>telt de kansen op</b>.</p><p>Schrijf eerst op welke waarden erbij horen. Let goed op: <b>minstens 2</b> is 2 of meer, <b>hoogstens 2</b> is 2 of minder.</p>',
          wanneer:'je bij een kansverdeling de kans zoekt op meer waarden samen.',
          maak:function(R){
            var it = R.kies([
              { X:'het aantal doelpunten van een club in een wedstrijd' }, { X:'het aantal keer per week dat de bus te laat is' },
              { X:'het aantal klanten dat in een minuut bij de kassa komt' }, { X:'het aantal fouten in een dictee van een leerling' } ]);
            var p = verdeel(R, 5, 5, 1), soort = R.kies(['min', 'max', 'of']), a, w = [];
            if (soort === 'min'){ a = R.heel(1, 3); for (var i = a; i <= 4; i++) w.push(i); }
            else if (soort === 'max'){ a = R.heel(1, 3); for (i = 0; i <= a; i++) w.push(i); }
            else { var x1 = R.heel(0, 2), x2 = R.heel(x1 + 2, 4); w = [x1, x2]; }
            var not = soort === 'min' ? 'P(X ≥ ' + a + ')' : soort === 'max' ? 'P(X ≤ ' + a + ')' : 'P(X = ' + w[0] + ' of X = ' + w[1] + ')';
            var woord = soort === 'min' ? 'minstens ' + a : soort === 'max' ? 'hoogstens ' + a : 'precies ' + w[0] + ' of precies ' + w[1];
            var somP = w.reduce(function(s, x){ return s + p[x]; }, 0), ant = T(dec(somP, 100));
            var fouten = soort === 'min' ? [opsom(w.slice(1).length ? w.slice(1) : [a + 1]), opsom([0, 1, 2, 3, 4].filter(function(x){ return x < a; }))] : soort === 'max' ? [opsom(w.slice(0, -1)), opsom([0, 1, 2, 3, 4].filter(function(x){ return x > a; }))] : [opsom([0, 1, 2, 3, 4].filter(function(x){ return x >= w[0] && x <= w[1]; })), String(w[1])];
            var termen = w.map(function(x){ return T(dec(p[x], 100)); });
            function tab(n){ return R0.teken.tabel([['x', '0', '1', '2', '3', '4'], ['P(X = x)'].concat(p.map(function(q){ return T(dec(q, 100)); }))], { zijkop:true, nadruk:n >= 1 ? w.map(function(x){ return [1, x + 1]; }) : [] }); }
            var mis = w.length > 1 ? T(dec(somP - p[w[0]], 100)) : null;
            return { vraag:not + ' = ?', context:'X is ' + it.X + '. De tabel geeft de kansverdeling. Bereken de kans op ' + woord + ': ' + not + '.', beeld:tab, zelfBeeld:tab(0), stappen:[
              K(R, 'Welke waarden van X horen erbij?', opsom(w), fouten, soort === 'min' ? 'Minstens ' + a + ' is ' + a + ' of meer. Doe ' + a + ' zelf ook mee.' : soort === 'max' ? 'Hoogstens ' + a + ' is ' + a + ' of minder. Doe 0 ook mee.' : 'Alleen ' + w[0] + ' en ' + w[1] + ', niet wat ertussen ligt.'),
              S('Die uitkomsten kunnen niet tegelijk. Tel de kansen op: ' + termen.join(' + ') + ' =', ant, termen.join(' + ') + ' = ' + ant + '.', mis ? F(ant, mis, 'Je vergat de kans bij X = ' + w[0] + '.') : null) ] };
          } },
        { id:'wha-kans-prod', naam:'De productregel', kort:'Hangen twee gebeurtenissen niet van elkaar af, dan is de kans dat ze allebei gebeuren: de kansen vermenigvuldigd',
          uit:'<p>De kans dat de bus te laat is, is 0,2. De kans dat de trein te laat is, is 0,15. Die twee hangen niet van elkaar af: ze zijn <b>onafhankelijk</b>.</p><p>De kans dat ze <b>allebei</b> te laat zijn: 0,2 ' + X + ' 0,15 = <b>0,03</b>. Dat is de <b>productregel</b>: bij <b>en</b> vermenigvuldig je.</p><p>Gaat het om <b>niet</b>, reken dan eerst die kans uit met 1 min de kans: de kans dat de bus <b>op tijd</b> is, is 1 ' + MIN + ' 0,2 = 0,8.</p>',
          wanneer:'twee dingen los van elkaar gebeuren en je de kans zoekt dat ze allebei (niet) gebeuren.',
          maak:function(R){
            var NAMEN = [['Sam', 'Noor'], ['Daan', 'Lotte'], ['Ayoub', 'Fleur'], ['Milan', 'Sara'], ['Jesse', 'Iris']];
            var nm = R.kies(NAMEN), it = R.kies([
              { zin:function(p, q){ return 'De kans dat ' + nm[0] + ' slaagt voor het rijexamen is ' + T(p) + '. Voor ' + nm[1] + ' is dat ' + T(q) + '. Ze doen los van elkaar examen.'; }, wel:['slaagt', 'slaagt'], niet:['zakt', 'zakt'], wie:nm, r:[8, 18] },
              { zin:function(p, q){ return 'De kans dat ' + nm[0] + ' een strafschop benut is ' + T(p) + '. Voor ' + nm[1] + ' is dat ' + T(q) + '. Ze nemen elk een strafschop.'; }, wel:['scoort', 'scoort'], niet:['mist', 'mist'], wie:nm, r:[10, 18] },
              { zin:function(p, q){ return 'De kans dat de bus te laat is, is ' + T(p) + '. De kans dat de trein te laat is, is ' + T(q) + '. Dat hangt niet van elkaar af.'; }, wel:['te laat is', 'te laat is'], niet:['op tijd is', 'op tijd is'], wie:['de bus', 'de trein'], r:[1, 8] } ]);
            var pa = 5 * R.heel(it.r[0], it.r[1]), pb = 5 * R.heel(it.r[0], it.r[1]), soort = R.heel(0, 3), welA = soort === 0 || soort === 1, welB = soort === 0 || soort === 2;
            var ka = welA ? pa : 100 - pa, kb = welB ? pb : 100 - pb, prod = dec(ka * kb, 10000);
            var vr = 'Kans dat ' + it.wie[0] + ' ' + (welA ? it.wel[0] : it.niet[0]) + ' en ' + it.wie[1] + ' ' + (welB ? it.wel[1] : it.niet[1]) + '?';
            function stapKans(i, wel, p, k){
              return wel ? S('De kans dat ' + it.wie[i] + ' ' + it.wel[i] + ':', T(dec(k, 100)), 'Die kans staat in de tekst.')
                : S('De kans dat ' + it.wie[i] + ' ' + it.niet[i] + ': 1 ' + MIN + ' ' + T(dec(p, 100)) + ' =', T(dec(k, 100)), 'Het is het een of het ander. Dus 1 min de kans dat ' + it.wie[i] + ' ' + it.wel[i] + '.', F(T(dec(k, 100)), T(dec(p, 100)), 'Dat is de kans dat ' + it.wie[i] + ' ' + it.wel[i] + '. Je zoekt het omgekeerde.'));
            }
            return { vraag:vr, context:it.zin(dec(pa, 100), dec(pb, 100)), stappen:[
              stapKans(0, welA, pa, ka), stapKans(1, welB, pb, kb),
              S('Ze hangen niet van elkaar af. Vermenigvuldig: ' + T(dec(ka, 100)) + ' ' + X + ' ' + T(dec(kb, 100)) + ' =', T(prod), 'Bij en vermenigvuldig je de twee kansen.', F(T(prod), T(dec(ka + kb, 100)), 'Je telde op. Bij en vermenigvuldig je.')) ] };
          } },
        { id:'wha-kans-compl', naam:'De complementregel: minstens één', kort:'P(minstens één keer) = 1 − P(geen enkele keer)',
          uit:'<p>De kans op een prijs met een kraslot is 0,1. Je koopt 4 loten. Hoe groot is de kans op <b>minstens één</b> prijs? Dat kan op heel veel manieren: precies 1, 2, 3 of 4 prijzen.</p><p>Het <b>omgekeerde</b> is veel makkelijker: <b>geen enkele</b> prijs. Per lot is de kans op niets 1 ' + MIN + ' 0,1 = 0,9. Vier keer niets: 0,9<sup>4</sup> = 0,6561.</p><p>De <b>complementregel</b>: P(minstens één) = 1 ' + MIN + ' P(geen) = 1 ' + MIN + ' 0,6561 = <b>0,3439</b>, afgerond <b>0,344</b>.</p>',
          wanneer:'er "minstens één" of "ten minste één keer" staat.',
          maak:function(R){
            var it = R.kies([
              { zin:function(e, n){ return 'Bij een kraslot is de kans op een prijs ' + T(e) + '. Je koopt ' + n + ' loten. De loten hangen niet van elkaar af.'; }, ev:'minstens één prijs', niet:'geen prijs', es:[5, 10, 15, 20, 25] },
              { zin:function(e, n){ return 'Lisa gooit een vrije worp raak met kans ' + T(1 - e) + '. Ze gooit ' + n + ' keer.'; }, ev:'minstens één keer mis', niet:'raak', direct:true, es:[10, 15, 20, 25, 30, 35, 40] },
              { zin:function(e, n){ return 'Een machine maakt met kans ' + T(e) + ' een kapot product. Je pakt ' + n + ' producten.'; }, ev:'minstens één kapot product', niet:'heel', es:[5, 10, 15, 20] },
              { zin:function(e, n){ return 'Een zaadje komt op met kans ' + T(e) + '. Je zaait ' + n + ' zaadjes.'; }, ev:'minstens één zaadje dat opkomt', niet:'niet opkomen', es:[40, 50, 60, 70] } ]);
            var e, n, q, geen, ant;
            do { e = R.kies(it.es); n = R.heel(3, 6); q = dec(100 - e, 100); geen = Math.pow(q, n); ant = 1 - geen; } while (grens(ant, 3, 0.1));
            var dg = rnd(geen, 8), exact = T(dg, { dec:8 });
            var g4 = rT(geen, 4), geenAnt = uniek([g4, exact, rT(geen, 5)]);
            return { vraag:'Kans op ' + it.ev + '?', context:it.zin(dec(e, 100), n) + ' Rond af op 3 decimalen.', antwoord:rAnt(ant, 3), stappen:[
              it.direct ? S('Het omgekeerde van minstens één keer mis is: elke keer raak. De kans op raak per worp:', T(q), 'Die kans staat in de tekst.', F(T(q), T(dec(e, 100)), 'Dat is de kans op mis. Je zoekt de kans op raak.'))
                : S('De kans dat het een keer niet gebeurt (' + it.niet + '): 1 ' + MIN + ' ' + T(dec(e, 100)) + ' =', T(q), 'Het omgekeerde: 1 min de kans.', F(T(q), T(dec(e, 100)), 'Dat is de kans dat het wel gebeurt. Je zoekt het omgekeerde.')),
              S(n + ' keer achter elkaar ' + it.niet + ': ' + T(q) + '^' + n + ' = (rond af op 4 decimalen)', geenAnt, 'Tik in: ' + T(q) + ' ^ ' + n + ' = ' + exact + '… Rond af op 4 decimalen.', F(geenAnt, T(rnd(q * n, 4)), 'Je deed keer ' + n + '. Het is ' + n + ' keer na elkaar: tot de macht ' + n + '.')),
              S('Minstens één: 1 ' + MIN + ' ' + g4 + ' ≈ (rond af op 3 decimalen)', rAnt(ant, 3), '1 ' + MIN + ' ' + g4 + ' = ' + T(rnd(1 - rnd(geen, 4), 4)) + '. Rond af op 3 decimalen.', F(rAnt(ant, 3), rT(geen, 3), 'Dat is de kans op geen enkele keer. Doe nog 1 min.')) ] };
          } },
        { id:'wha-kans-metzonder', naam:'Met of zonder terugleggen?', kort:'Leg je terug, dan blijven de kansen gelijk; leg je niet terug, dan gaat de noemer na elke greep 1 omlaag',
          uit:'<p>Bij pakken uit een zak moet je eerst weten: <b>leg je terug</b> of niet?</p><p><b>Met terugleggen</b>: na elke greep is de zak weer zoals eerst. De kansen blijven <b>hetzelfde</b>. Bij 3 rode van de 8: twee rode is 3/8 ' + X + ' 3/8 = 9/64.</p><p><b>Zonder terugleggen</b>: er zit steeds één minder in. Pak je <b>tegelijk</b>, dan is dat ook zonder terugleggen. Twee rode: 3/8 ' + X + ' 2/7 = 6/56. Hoe je zonder terugleggen rekent, oefen je bij Kansbomen.</p>',
          wanneer:'je twee keer pakt en eerst moet zien of je terugleggt.',
          maak:function(R){
            var KLR = [['rood', 'rode'], ['blauw', 'blauwe'], ['groen', 'groene'], ['wit', 'witte'], ['geel', 'gele']];
            var k = R.hussel(KLR).slice(0, 2), N = R.heel(5, 10), a = R.heel(2, N - 2), b = N - a, met = R.heel(0, 1) === 1;
            var zin = 'In een zak zitten ' + a + ' ' + k[0][1] + ' en ' + b + ' ' + k[1][1] + ' knikkers. ' + (met ? R.kies(['Je pakt een knikker, kijkt welke kleur hij heeft en stopt hem terug. Dan pak je er weer een.', 'Je pakt een knikker en legt hem terug voordat je de tweede pakt.'])
              : R.kies(['Je pakt in één keer twee knikkers.', 'Je pakt een knikker, houdt hem in je hand en pakt er nog een.', 'Je pakt twee knikkers na elkaar en legt niets terug.']));
            var twee = R.heel(0, 1) === 1, vr = twee ? 'Kans op twee ' + k[0][1] + '?' : 'Kans op eerst ' + k[0][0] + ', dan ' + k[1][0] + '?';
            var t2 = twee ? (met ? a : a - 1) : b, n2 = met ? N : N - 1, t2a = twee ? (met ? a - 1 : a) : b, n2a = met ? N - 1 : N;
            var T2 = a * t2, N2 = N * n2;
            return { vraag:vr, context:zin + ' Geef je antwoord als breuk.', antwoord:brAnt(T2, N2), controle:kansC(T2, N2), invoer:'tekst', stappen:[
              K(R, 'Is dit met of zonder terugleggen?', met ? 'met terugleggen' : 'zonder terugleggen', [met ? 'zonder terugleggen' : 'met terugleggen'], met ? 'De knikker gaat terug in de zak.' : 'De eerste knikker gaat niet terug. Ook als je tegelijk pakt, leg je niet terug.', { orde:['met terugleggen', 'zonder terugleggen'] }),
              kansStap('De eerste keer: kans op ' + k[0][0] + ' =', a, N, a + ' van de ' + N + ' knikkers zijn ' + k[0][0] + '.'),
              kansStap('De tweede keer: kans op ' + (twee ? k[0][0] : k[1][0]) + ' =', t2, n2, met ? 'Met terugleggen is de zak weer zoals eerst.' : 'Er zit een knikker minder in' + (twee ? ', en een ' + k[0][1] + ' minder.' : '. De ' + k[1][1] + ' zijn er nog allemaal.'),
                F(brAnt(t2, n2), br(t2a, n2a), met ? 'Je legde terug. De zak is weer zoals eerst.' : 'Je legde niet terug. Er zit een knikker minder in.')),
              kansStap('Samen: ' + br(a, N) + ' ' + X + ' ' + br(t2, n2) + ' =', T2, N2, 'Teller keer teller, noemer keer noemer: ' + a + ' ' + X + ' ' + t2 + ' en ' + N + ' ' + X + ' ' + n2 + '.') ] };
          } },
        { id:'wha-kans-vaas', naam:'Zonder terugleggen: tellen met combinaties', kort:'Kans = aantal gunstige groepjes : aantal groepjes; tel allebei met n boven k',
          uit:'<p>In een vaas zitten 4 rode en 6 witte knikkers. Je pakt er <b>in één keer 3</b>. Hoe groot is de kans op precies 2 rode?</p><p><b>Alle groepjes</b> van 3 uit 10: (10 boven 3) = 120. <b>Gunstige groepjes</b>: 2 rode uit de 4 rode, (4 boven 2) = 6, en 1 witte uit de 6 witte, (6 boven 1) = 6. Samen 6 ' + X + ' 6 = 36.</p><p>De kans is <b>gunstig : alle</b> = 36 : 120 = <b>0,3</b>. Zo hoef je geen grote kansboom te tekenen.</p>',
          wanneer:'je een groepje pakt zonder terug te leggen en de kans zoekt op precies zoveel van een soort.',
          maak:function(R){
            var it = R.kies([
              { zin:function(r, b, k){ return 'In een vaas zitten ' + r + ' rode en ' + b + ' witte knikkers. Je pakt er in één keer ' + k + '.'; }, a:['rode', 'rode'], b:['witte', 'witte'], vr:function(j){ return 'Kans op precies ' + j + ' rode?'; } },
              { zin:function(r, b, k){ return 'Een klas heeft ' + r + ' meisjes en ' + b + ' jongens. De docent loot ' + k + ' leerlingen voor een klus.'; }, a:['meisje', 'meisjes'], b:['jongen', 'jongens'], vr:function(j){ return 'Kans op precies ' + j + ' ' + (j === 1 ? 'meisje' : 'meisjes') + '?'; } },
              { zin:function(r, b, k){ return 'In een doos zitten ' + (r + b) + ' lampen, waarvan ' + r + ' kapot. Je pakt er zonder te kijken ' + k + '.'; }, a:['kapotte', 'kapotte'], b:['hele', 'hele'], vr:function(j){ return 'Kans op precies ' + j + ' kapotte?'; } } ]);
            var r, b, k, j, N, tot, c1, c2, g, w;
            do { r = R.heel(3, 8); b = R.heel(3, 10); k = R.heel(3, 4); j = R.heel(1, k - 1); N = r + b; tot = comb(N, k); c1 = comb(r, j); c2 = comb(b, k - j); g = c1 * c2; w = g / tot; } while (grens(w, 3, 0.05) || w < 0.02 || (it.a[0] === 'kapotte' && r > b));
            var naamA = j === 1 ? it.a[0] : it.a[1], naamB = k - j === 1 ? it.b[0] : it.b[1];
            var ant = uniek(rAnt(w, 3).concat(brAnt(g, tot)));
            return { vraag:it.vr(j), context:it.zin(r, b, k) + ' Rond af op 3 decimalen.', antwoord:ant, stappen:[
              S('Alle groepjes van ' + k + ' uit ' + N + ': ' + boven(N, k) + ' =', tot, 'Op de rekenmachine: ' + N + ' nCr ' + k + '.', F(tot, perm(N, k), 'Dan telt de volgorde mee. Neem nCr.')),
              S('Manieren om ' + j + ' ' + naamA + ' te kiezen uit de ' + r + ': ' + boven(r, j) + ' =', c1, r + ' nCr ' + j + '.'),
              S('Manieren om ' + (k - j) + ' ' + naamB + ' te kiezen uit de ' + b + ': ' + boven(b, k - j) + ' =', c2, b + ' nCr ' + (k - j) + '.'),
              S('Gunstige groepjes: ' + c1 + ' ' + X + ' ' + c2 + ' =', g, 'Bij elke keuze van de ene soort passen alle keuzes van de andere soort.', F(g, c1 + c2, 'Je telde op. Vermenigvuldig: bij elke keuze passen alle andere keuzes.')),
              S('De kans: ' + g + ' : ' + tot + ' ≈ (rond af op 3 decimalen)', ant, 'Gunstig gedeeld door alle: ' + g + ' : ' + tot + ' = ' + T(rnd(w, 6), { dec:6 }) + '…', F(ant, rT(tot / g, 3), 'Andersom: gunstig gedeeld door alle.')) ] };
          } },
        { id:'wha-kans-kies', naam:'Kies de kansregel', kort:'Of bij één keer: optellen. En bij los van elkaar: vermenigvuldigen. Minstens één: 1 min de kans op geen',
          uit:'<p>Lees de vraag en kies eerst de <b>kansregel</b>.</p><p>Staat er <b>of</b> bij één keer pakken of gooien, en kunnen de uitkomsten niet tegelijk? Gebruik de <b>somregel</b>: tel de kansen op.</p><p>Moeten twee dingen <b>allebei</b> gebeuren en hangen ze niet van elkaar af? Gebruik de <b>productregel</b>: vermenigvuldig. Staat er <b>minstens één</b>? Gebruik de <b>complementregel</b>: 1 min de kans op geen enkele.</p>',
          wanneer:'je een kansvraag krijgt en niet weet welke regel past.',
          maak:function(R){
            var REG = ['somregel: optellen', 'productregel: vermenigvuldigen', 'complementregel: 1 min de kans op geen'];
            var soort = R.heel(0, 2), st, vr, zin, o = {};
            if (soort === 0){
              var KLR = R.hussel([['rode', 'rood'], ['blauwe', 'blauw'], ['groene', 'groen'], ['gele', 'geel']]).slice(0, 3), a = R.heel(2, 6), b = R.heel(2, 6), c = R.heel(2, 6), N = a + b + c;
              zin = 'In een zak zitten ' + a + ' ' + KLR[0][0] + ', ' + b + ' ' + KLR[1][0] + ' en ' + c + ' ' + KLR[2][0] + ' knikkers. Je pakt er één. Geef je antwoord als breuk.';
              vr = 'Kans op ' + KLR[0][1] + ' of ' + KLR[1][1] + '?';
              st = [kansStap('Tel op: ' + br(a, N) + ' + ' + br(b, N) + ' =', a + b, N, 'De noemer blijft ' + N + '. Tel de tellers op: ' + a + ' + ' + b + '.', F(brAnt(a + b, N), br(a * b, N * N), 'Je vermenigvuldigde. Bij of bij één keer tel je op.'))];
              o = { antwoord:brAnt(a + b, N), controle:kansC(a + b, N), invoer:'tekst' };
            } else if (soort === 1){
              var pa = 5 * R.heel(8, 18), pb = 5 * R.heel(8, 18), wie = R.kies([['Sam', 'Noor'], ['Daan', 'Lotte'], ['Milan', 'Sara']]);
              zin = 'De kans dat ' + wie[0] + ' slaagt voor het rijexamen is ' + T(dec(pa, 100)) + '. Voor ' + wie[1] + ' is dat ' + T(dec(pb, 100)) + '. Ze doen los van elkaar examen.';
              vr = 'Kans dat ze allebei slagen?';
              st = [S('Vermenigvuldig: ' + T(dec(pa, 100)) + ' ' + X + ' ' + T(dec(pb, 100)) + ' =', T(dec(pa * pb, 10000)), 'Bij allebei vermenigvuldig je.', F(T(dec(pa * pb, 10000)), T(dec(pa + pb, 100)), 'Je telde op. Bij allebei vermenigvuldig je.'))];
            } else {
              var e, n, q, geen, ant;
              do { e = R.kies([10, 20, 30]); n = R.heel(3, 5); q = dec(100 - e, 100); geen = Math.pow(q, n); ant = 1 - geen; } while (grens(ant, 3, 0.1));
              zin = 'Bij een spelletje win je met kans ' + T(dec(e, 100)) + '. Je speelt het ' + n + ' keer. Rond af op 3 decimalen.';
              vr = 'Kans dat je minstens één keer wint?';
              var ex = T(rnd(geen, 8), { dec:8 });
              var g4k = rT(geen, 4);
              st = [S('Geen enkele keer winnen: ' + T(q) + '^' + n + ' ≈ (rond af op 4 decimalen)', uniek([g4k, ex, rT(geen, 5)]), 'Per keer niet winnen: 1 ' + MIN + ' ' + T(dec(e, 100)) + ' = ' + T(q) + '. Dat ' + n + ' keer: ' + T(q) + ' ^ ' + n + '.'),
                S('Minstens één keer: 1 ' + MIN + ' ' + g4k + ' ≈ (rond af op 3 decimalen)', rAnt(ant, 3), '1 min de kans op geen enkele keer.', F(rAnt(ant, 3), rT(geen, 3), 'Dat is de kans op geen enkele keer. Doe nog 1 min.'))];
              o = { antwoord:rAnt(ant, 3) };
            }
            var hint = ['Er staat of, en je pakt maar één keer.', 'Er staat allebei, en ze hangen niet van elkaar af.', 'Er staat minstens één.'][soort];
            var uit = { vraag:vr, context:zin, stappen:[K(R, 'Welke kansregel past?', REG[soort], REG.filter(function(x, i){ return i !== soort; }), hint, { orde:REG })].concat(st) };
            for (var key in o) uit[key] = o[key];
            return uit;
          } }
      ] },

    /* ================= de binomiale kans en de verwachtingswaarde ================= */
    { groep:{ id:'wha-binom', niveau:'havo', domein:'statistiek', naam:'De binomiale kans en de verwachtingswaarde',
        uit:'Wiskunde A: een experiment een paar keer herhalen en de kans op precies zoveel keer succes uitrekenen met de formule, hoogstens en minstens, en de verwachtingswaarde bij een kansverdeling.' },
      doelen:[
        { id:'wha-bin-formule', naam:'De binomiale kans met de formule', kort:'P(X = k) = (n boven k) · p^k · (1 − p)^(n − k): het aantal rijtjes keer de kans op één rijtje',
          uit:'<p>Lisa gooit een vrije worp raak met kans 0,7. Ze gooit 4 keer. Hoe groot is de kans op <b>precies 3 keer raak</b>?</p><p>Eén rijtje is bijvoorbeeld RRRM. De kans daarop: 0,7 ' + X + ' 0,7 ' + X + ' 0,7 ' + X + ' 0,3 = 0,7<sup>3</sup> ' + X + ' 0,3<sup>1</sup> = 0,1029. Elk rijtje met 3 keer R heeft dezelfde kans, en er zijn er <b>(4 boven 3) = 4</b>.</p><p>De <b>binomiale kans</b>: P(X = 3) = 4 ' + X + ' 0,1029 = <b>0,4116</b>, afgerond 0,412. Dit mag als je elke keer dezelfde kans hebt en de keren los van elkaar zijn.</p>',
          wanneer:'je n keer hetzelfde doet en de kans zoekt op precies k keer succes.',
          maak:function(R){
            var it = R.kies([
              { zin:function(p, n){ return 'Lisa gooit een vrije worp raak met kans ' + T(p) + '. Ze gooit ' + n + ' keer. De worpen hangen niet van elkaar af.'; }, ps:[5, 6, 7, 8, 9], wat:function(k){ return 'precies ' + k + ' keer raak'; }, niet:'mis' },
              { zin:function(p, n){ return 'Een zaadje komt op met kans ' + T(p) + '. Je zaait ' + n + ' zaadjes.'; }, ps:[6, 7, 8, 9], wat:function(k){ return 'precies ' + k + (k === 1 ? ' zaadje dat opkomt' : ' zaadjes die opkomen'); }, niet:'niet opkomen' },
              { zin:function(p, n){ return 'Een machine maakt met kans ' + T(p) + ' een product met een fout. Je pakt ' + n + ' producten.'; }, ps:[1, 2, 3], wat:function(k){ return 'precies ' + k + (k === 1 ? ' product' : ' producten') + ' met een fout'; }, niet:'geen fout' },
              { zin:function(p, n){ return 'Een verkeerslicht staat met kans ' + T(p) + ' op groen als je aankomt. Je fietst er ' + n + ' dagen langs.'; }, ps:[3, 4, 5, 6], wat:function(k){ return 'precies ' + k + ' keer groen'; }, niet:'niet groen' } ]);
            var p10, n, k, C, een, P;
            do { p10 = R.kies(it.ps); n = R.heel(3, 6); k = R.heel(1, n - 1); C = comb(n, k); een = dec(Math.pow(p10, k) * Math.pow(10 - p10, n - k), Math.pow(10, n)); P = C * een; } while (grens(P, 3, 0.05));
            var p = dec(p10, 10), q = dec(10 - p10, 10), ant = rAnt(P, 3);
            return { vraag:'Kans op ' + it.wat(k) + '?', context:it.zin(p, n) + ' Rond af op 3 decimalen.', antwoord:ant, stappen:[
              S('De kans op ' + it.niet + ' per keer: 1 ' + MIN + ' ' + T(p) + ' =', T(q), '1 min de kans op succes.'),
              S('Hoeveel rijtjes hebben ' + it.wat(k) + '? ' + boven(n, k) + ' =', C, 'Kies de ' + k + ' plekken uit ' + n + ': ' + n + ' nCr ' + k + '.', F(C, perm(n, k), 'Dan telt de volgorde van de plekken mee. Neem nCr.')),
              S('De kans op één zo\'n rijtje: ' + T(p) + '^' + k + ' ' + X + ' ' + T(q) + '^' + (n - k) + ' =', T(een), 'Tik in: ' + T(p) + ' ^ ' + k + ' ' + X + ' ' + T(q) + ' ^ ' + (n - k) + '. Dat is precies ' + T(een) + '.', F(T(een), T(rnd(Math.pow(p, k), 6)), 'Vergeet de keren zonder succes niet: ook ' + T(q) + '^' + (n - k) + '.')),
              S('De kans: ' + C + ' ' + X + ' ' + T(een) + ' ≈ (rond af op 3 decimalen)', ant, C + ' ' + X + ' ' + T(een) + ' = ' + T(rnd(P, 6)) + '.', F(ant, rT(een, 3), 'Dat is één rijtje. Doe keer het aantal rijtjes, ' + C + '.')) ] };
          } },
        { id:'wha-bin-minstens', naam:'Hoogstens en minstens met de binomiale formule', kort:'Tel de binomiale kansen op: P(X ≤ 1) = P(X = 0) + P(X = 1)',
          uit:'<p>Een machine maakt met kans 0,2 een fout product. Je pakt er 4. Hoe groot is de kans op <b>hoogstens 1</b> fout product?</p><p>Hoogstens 1 is <b>0 of 1</b>. Reken beide kansen uit met de binomiale formule. P(X = 0) = 0,8<sup>4</sup> = 0,4096. P(X = 1) = 4 ' + X + ' 0,2 ' + X + ' 0,8<sup>3</sup> = 0,4096.</p><p>Die kunnen niet tegelijk, dus tel ze op (de <b>somregel</b>): 0,4096 + 0,4096 = 0,8192, afgerond <b>0,819</b>. Bij <b>minstens</b> 3 van de 4 tel je P(X = 3) en P(X = 4) op.</p>',
          wanneer:'er hoogstens of minstens staat bij een binomiaal experiment met weinig keren.',
          maak:function(R){
            var it = R.kies([
              { zin:function(p, n){ return 'Een machine maakt met kans ' + T(p) + ' een fout product. Je pakt ' + n + ' producten. X is het aantal foute producten.'; }, ps:[1, 2, 3] },
              { zin:function(p, n){ return 'Lisa gooit een vrije worp raak met kans ' + T(p) + '. Ze gooit ' + n + ' keer. X is het aantal keer raak.'; }, ps:[6, 7, 8, 9] },
              { zin:function(p, n){ return 'Een zaadje komt op met kans ' + T(p) + '. Je zaait ' + n + ' zaadjes. X is het aantal zaadjes dat opkomt.'; }, ps:[6, 7, 8] },
              { zin:function(p, n){ return 'Je gokt bij een quiz. Elke vraag heb je met kans ' + T(p) + ' goed. Er zijn ' + n + ' vragen. X is het aantal goede antwoorden.'; }, ps:[2, 3, 4, 5] } ]);
            var p10, n, laag, P1, P2, tot;
            do { p10 = R.kies(it.ps); n = R.heel(3, 5); laag = R.heel(0, 1) === 1;
              var k1 = laag ? 0 : n, k2 = laag ? 1 : n - 1;
              P1 = dec(comb(n, k1) * Math.pow(p10, k1) * Math.pow(10 - p10, n - k1), Math.pow(10, n)); P2 = dec(comb(n, k2) * Math.pow(p10, k2) * Math.pow(10 - p10, n - k2), Math.pow(10, n)); tot = P1 + P2;
            } while (grens(tot, 3, 0.05));
            var p = dec(p10, 10), q = dec(10 - p10, 10), ant = rAnt(tot, 3);
            var not = laag ? 'P(X ≤ 1)' : 'P(X ≥ ' + (n - 1) + ')';
            var goed = laag ? '0 en 1' : (n - 1) + ' en ' + n, fout = laag ? ['alleen 1', '1 en 2'] : ['alleen ' + (n - 1), (n - 2) + ' en ' + (n - 1)];
            var t1 = laag ? 'P(X = 0) = ' + T(q) + '^' + n + ' =' : 'P(X = ' + n + ') = ' + T(p) + '^' + n + ' =';
            var t2 = laag ? 'P(X = 1) = ' + n + ' ' + X + ' ' + T(p) + ' ' + X + ' ' + T(q) + '^' + (n - 1) + ' =' : 'P(X = ' + (n - 1) + ') = ' + n + ' ' + X + ' ' + T(p) + '^' + (n - 1) + ' ' + X + ' ' + T(q) + ' =';
            return { vraag:not + ' = ?', context:it.zin(p, n) + ' Bereken ' + not + '. Rond af op 3 decimalen.', antwoord:ant, stappen:[
              K(R, 'Welke waarden van X horen bij ' + (laag ? 'hoogstens 1' : 'minstens ' + (n - 1)) + '?', goed, fout, laag ? 'Hoogstens 1 is 1 of minder: 0 en 1.' : 'Minstens ' + (n - 1) + ' is ' + (n - 1) + ' of meer, en meer dan ' + n + ' kan niet.'),
              S(t1, T(P1), laag ? 'Alle ' + n + ' keer geen succes: ' + T(q) + ' tot de macht ' + n + '.' : 'Alle ' + n + ' keer succes: ' + T(p) + ' tot de macht ' + n + '.'),
              S(t2, T(P2), 'Er zijn ' + n + ' rijtjes (' + n + ' nCr 1 = ' + n + '). Dus ' + n + ' keer de kans op één rijtje.', F(T(P2), T(rnd(P2 / n, 8)), 'Dat is één rijtje. Er zijn er ' + n + '.')),
              S('Samen: ' + T(P1) + ' + ' + T(P2) + ' ≈ (rond af op 3 decimalen)', ant, 'Tel op en rond af: ' + T(rnd(tot, 8)) + '.') ] };
          } },
        { id:'wha-verw', naam:'De verwachtingswaarde', kort:'E(X) = elke waarde keer zijn kans, en dat alles opgeteld',
          uit:'<p>De <b>verwachtingswaarde</b> E(X) is wat je <b>gemiddeld per keer</b> verwacht als je iets heel vaak doet.</p><p>Bij een spel is W je winst. W = ' + MIN + '2 met kans 0,7, W = 3 met kans 0,2 en W = 8 met kans 0,1. Doe <b>elke waarde keer zijn kans</b> en tel op: ' + MIN + '2 ' + X + ' 0,7 + 3 ' + X + ' 0,2 + 8 ' + X + ' 0,1 = ' + MIN + '1,4 + 0,6 + 0,8 = <b>0</b>.</p><p>Is E(W) kleiner dan 0, dan verlies je op den duur. Groter dan 0: dan win je op den duur.</p>',
          wanneer:'je bij een kansverdeling wilt weten wat je gemiddeld per keer krijgt.',
          maak:function(R){
            var soort = R.heel(0, 2), w, p, zin, eh = '', letter;
            if (soort === 0){ var e;
              do { e = R.kies([2, 3, 4, 5]); w = [-e, R.heel(1, 4), R.heel(5, 12)]; if (R.heel(0, 1)) w.push(R.heel(15, 30)); p = verdeel(R, w.length, 5, 5).sort(function(a, b){ return b - a; }); }
              while (p[0] < 50 || w.reduce(function(t, x, i){ return t + x * p[i]; }, 0) >= 0);
              letter = 'W';
              zin = 'Bij een spel op de kermis is W je winst in euro. De inzet is er al af, dus ' + T(-e) + ' betekent dat je ' + e + ' euro verliest.'; eh = 'euro'; }
            else if (soort === 1){ w = [0, 1, 2, 3]; p = verdeel(R, 4, 5, 5); letter = 'X'; zin = 'X is het aantal klanten dat in een minuut bij de kassa komt.'; }
            else { w = [0, 1, 2, 3]; p = verdeel(R, 4, 5, 1); letter = 'X'; zin = 'X is het aantal doelpunten van een voetbalclub in een wedstrijd.'; }
            var prod = w.map(function(x, i){ return dec(x * p[i], 100); }), E = dec(w.reduce(function(s, x, i){ return s + x * p[i]; }, 0), 100);
            function tab(n){ return R0.teken.tabel([[letter.toLowerCase()].concat(w.map(T)), ['P(' + letter + ' = ' + letter.toLowerCase() + ')'].concat(p.map(function(q){ return T(dec(q, 100)); }))].concat(n >= 1 ? [[letter.toLowerCase() + ' · P']].map(function(r){ return r.concat(w.map(function(x, i){ return i < n ? T(prod[i]) : ''; })); }) : []), { zijkop:true }); }
            var st = w.map(function(x, i){ return S(T(x) + ' ' + X + ' ' + T(dec(p[i], 100)) + ' =', T(prod[i]), x === 0 ? 'Nul keer iets is 0.' : x < 0 ? 'Min keer plus is min: ' + T(prod[i]) + '.' : T(x) + ' ' + X + ' ' + T(dec(p[i], 100)) + ' = ' + T(prod[i]) + '.'); });
            var somT = prod.map(function(x){ return x < 0 ? '(' + T(x) + ')' : T(x); }).join(' + ');
            st.push(S('E(' + letter + ') = ' + somT + ' =', T(E), 'Tel alle producten op.', F(T(E), T(dec(w.reduce(function(s, x){ return s + x; }, 0), w.length)), 'Je nam het gewone gemiddelde van de waarden. Gebruik de kansen.'), { e:eh }));
            return { vraag:'tabel ' + w.join(' ') + ' kansen ' + p.join(' '), vraagHtml:'E(' + letter + ') = ?', context:zin + ' De tabel geeft de kansverdeling. Bereken de verwachtingswaarde.', eenheid:eh, beeld:tab, zelfBeeld:tab(0), stappen:st };
          } }
      ] },

    /* ================= spreiding en de normale verdeling ================= */
    { groep:{ id:'wha-normaal', niveau:'havo', domein:'statistiek', naam:'Standaardafwijking en normale verdeling',
        uit:'Wiskunde A: de standaardafwijking van een kleine rij getallen uitrekenen, en met de vuistregels van de normale verdeling werken (68% en 95%), zonder grafische rekenmachine.' },
      doelen:[
        { id:'wha-st-sd', naam:'De standaardafwijking', kort:'Bereken het gemiddelde, tel de kwadraten van de afwijkingen op, deel door n en neem de wortel',
          uit:'<p>De <b>standaardafwijking</b> σ zegt hoe ver de getallen gemiddeld van het gemiddelde af liggen. Hoe groter σ, hoe meer spreiding.</p><p>Bij 4, 6, 8, 10: het gemiddelde is 7. De afwijkingen zijn ' + MIN + '3, ' + MIN + '1, 1 en 3. De <b>kwadraten</b> daarvan: 9, 1, 1, 9. Samen 20.</p><p>Deel door het aantal getallen: 20 : 4 = 5. Neem de <b>wortel</b>: σ = √5 ≈ <b>2,2</b>. Op de rekenmachine heet dit σx.</p>',
          wanneer:'je de spreiding van een kleine rij getallen wilt uitrekenen.',
          maak:function(R){
            var it = R.kies([{ wat:'het aantal uur dat vrienden per week sporten', lo:6, hi:12 }, { wat:'de punten van spelers bij een spel', lo:20, hi:60 }, { wat:'de wachttijden in minuten bij een loket', lo:10, hi:25 }, { wat:'het aantal doelpunten van een team per seizoen', lo:30, hi:70 }, { wat:'de temperaturen in °C op een paar dagen', lo:12, hi:24 }]);
            var n, d, mu, SS, va, sg, l;
            do { n = R.kies([4, 5]); d = []; for (var i = 0; i < n - 1; i++) d.push(R.heel(-6, 6)); d.push(-d.reduce(function(a, b){ return a + b; }, 0));
              mu = R.heel(it.lo, it.hi); l = d.map(function(x){ return mu + x; }); SS = d.reduce(function(a, x){ return a + x * x; }, 0); va = SS / n; sg = Math.sqrt(va);
            } while (Math.abs(d[n - 1]) > 8 || SS === 0 || l.some(function(x){ return x < 0; }) || grens(sg, 1, 0.08) || Math.abs(sg - Math.round(sg)) < 1e-9);
            var ant = rAnt(sg, 1), s1 = rT(Math.sqrt(SS / (n - 1)), 1);
            function tab(m){ var rows = [['x'].concat(l.map(String))]; if (m >= 1) rows.push(['x ' + MIN + ' ' + mu].concat(d.map(T))); if (m >= 2) rows.push(['(x ' + MIN + ' ' + mu + ')²'].concat(d.map(function(x){ return T(x * x); }))); return R0.teken.tabel(rows, { zijkop:true }); }
            return { vraag:l.join('   '), context:'Dit zijn ' + it.wat + '. Bereken de standaardafwijking σ. Deel door het aantal getallen, zoals σx op de rekenmachine. Rond af op 1 decimaal.', antwoord:ant, beeld:tab, stappen:[
              S('Het gemiddelde: (' + l.join(' + ') + ') : ' + n + ' =', mu, 'Tel alles op (' + (mu * n) + ') en deel door ' + n + '.'),
              S('Tel de kwadraten van de afwijkingen op: ' + l.map(function(x){ return '(' + x + ' ' + MIN + ' ' + mu + ')²'; }).join(' + ') + ' =', SS, d.map(function(x){ return T(x * x); }).join(' + ') + ' = ' + SS + '. Een negatieve afwijking in het kwadraat is positief.', F(SS, 0, 'Je telde de afwijkingen op zonder kwadraat. Die zijn samen altijd 0.')),
              S('Deel door ' + n + ': ' + SS + ' : ' + n + ' =', T(va), SS + ' : ' + n + ' = ' + T(va) + '.', F(T(va), T(rnd(SS / (n - 1), 4)), 'Deel door het aantal getallen, ' + n + '.')),
              S('Neem de wortel: √' + T(va) + ' ≈ (rond af op 1 decimaal)', ant, 'Tik in: √' + T(va) + ' = ' + T(sg, { dec:4 }) + '…', F(ant, rT(va, 1), 'Dat is nog zonder wortel. Neem de wortel.', s1, 'Je deelde door ' + (n - 1) + '. Deel door het aantal getallen, ' + n + '.')) ] };
          } },
        { id:'wha-st-vuist', naam:'De vuistregels: 68% en 95%', kort:'Bij een normale verdeling ligt 68% tussen μ − σ en μ + σ, en 95% tussen μ − 2σ en μ + 2σ',
          uit:'<p>Veel dingen zijn <b>normaal verdeeld</b>: de meeste waarden liggen rond het gemiddelde μ, en de grafiek is een klok die links en rechts gelijk is.</p><p>De <b>vuistregels</b>: tussen <b>μ ' + MIN + ' σ en μ + σ</b> ligt ongeveer <b>68%</b>. Tussen <b>μ ' + MIN + ' 2σ en μ + 2σ</b> ligt ongeveer <b>95%</b>.</p><p>Voorbeeld: lengte met μ = 180 cm en σ = 7 cm. De middelste 68% ligt tussen 173 en 187 cm. De middelste 95% tussen 166 en 194 cm.</p>',
          wanneer:'een normale verdeling gegeven is met een gemiddelde en een standaardafwijking.',
          maak:function(R){
            var it = R.kies(NORMAAL), mu = R.kies(it.mu), sg = R.kies(it.sg), k = R.kies([1, 2]), soort = R.kies(['grens', 'grens', 'proc']);
            var lo = mu - k * sg, hi = mu + k * sg, pr = k === 1 ? 68 : 95, zin = normaalZin(it, mu, sg);
            var bl = function(m){ return klok(mu, sg, { lab:m >= (soort === 'grens' ? 3 : 1) ? null : [0], van:m >= 1 ? -k : null, tot:k, aria:'normale verdeling' }); };
            if (soort === 'grens') return { vraag:'Waar ligt de middelste ' + pr + '%?', context:zin + ' Tussen welke twee waarden ligt de middelste ' + pr + '%? Typ twee getallen, zoals: 12 en 34.', antwoord:T(lo) + ' en ' + T(hi), controle:paarC(lo, hi), invoer:'tekst', eenheid:it.eh, beeld:bl, zelfBeeld:bl(0), stappen:[
              K(R, 'Hoeveel standaardafwijkingen ga je naar links en naar rechts?', k === 1 ? '1 keer σ' : '2 keer σ', [k === 1 ? '2 keer σ' : '1 keer σ', '3 keer σ'], k === 1 ? '68% hoort bij μ ' + MIN + ' σ tot μ + σ.' : '95% hoort bij μ ' + MIN + ' 2σ tot μ + 2σ.', { orde:['1 keer σ', '2 keer σ', '3 keer σ'] }),
              S('De ondergrens: ' + T(mu) + ' ' + MIN + ' ' + (k === 2 ? '2 ' + X + ' ' : '') + T(sg) + ' =', lo, 'Het gemiddelde min ' + (k === 2 ? 'twee keer ' : '') + 'de standaardafwijking.', F(lo, mu - (3 - k) * sg, k === 1 ? 'Bij 68% ga je maar een σ naar links.' : 'Bij 95% ga je twee σ naar links.'), { e:it.eh }),
              S('De bovengrens: ' + T(mu) + ' + ' + (k === 2 ? '2 ' + X + ' ' : '') + T(sg) + ' =', hi, 'Het gemiddelde plus ' + (k === 2 ? 'twee keer ' : '') + 'de standaardafwijking.', null, { e:it.eh }) ] };
            return { vraag:'Hoeveel procent?', context:zin + ' ' + normaalVr(it, 'tussen ' + T(lo) + ' en ' + T(hi), true) + ' Gebruik de vuistregels.', antwoord:pAnt(pr), eenheid:'%', beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Hoe ver ligt ' + T(hi) + ' boven het gemiddelde? ' + T(hi) + ' ' + MIN + ' ' + T(mu) + ' =', k * sg, 'Trek het gemiddelde eraf.', null, { e:it.eh }),
              S('Hoeveel keer σ is dat? ' + T(k * sg) + ' : ' + T(sg) + ' =', k, 'Deel door de standaardafwijking, ' + T(sg) + '.'),
              S('Tussen μ ' + MIN + ' ' + (k === 2 ? '2σ' : 'σ') + ' en μ + ' + (k === 2 ? '2σ' : 'σ') + ' ligt:', pAnt(pr), k === 1 ? 'Eén σ naar beide kanten: 68%.' : 'Twee σ naar beide kanten: 95%.', F(pAnt(pr), 68 + 95 - pr, 'Kijk goed: is het een of twee keer σ?'), { e:'%' }) ] };
          } },
        { id:'wha-st-grens', naam:'Boven of onder een grens met de vuistregels', kort:'Zoek waar de grens ligt (μ, μ ± σ of μ ± 2σ) en tel de stukken 2,5%, 13,5% en 34% op',
          uit:'<p>Met de vuistregels verdeel je de klok in <b>zes stukken</b>: van links naar rechts 2,5%, 13,5%, 34%, 34%, 13,5% en 2,5%. Samen 100%.</p><p>Bij μ = 180 cm en σ = 7 cm: hoeveel procent is <b>langer dan 187 cm</b>? 187 is μ + σ. Rechts daarvan liggen 13,5% en 2,5%: samen <b>16%</b>.</p><p>Zoek dus eerst <b>waar de grens ligt</b>. Kleur dan het stuk dat je zoekt en tel de procenten op. Wil je een aantal, neem dan dat procent van het totaal.</p>',
          wanneer:'je bij een normale verdeling zoekt hoeveel procent boven, onder of tussen grenzen ligt.',
          maak:function(R){
            var it = R.kies(NORMAAL), mu = R.kies(it.mu), sg = R.kies(it.sg), soort = R.kies(['meer', 'minder', 'tussen']), aantal = R.heel(0, 2) === 0, Nt = R.kies(it.N);
            var a, b, van, tot, pr, vr, st = [];
            function wq(k){ return T(mu + k * sg); }
            function plekK(k){ return K(R, 'Waar ligt ' + wq(k) + '?', PLEK[k + 2], PLEK.filter(function(x, i){ return i !== k + 2; }), wq(k) + ' ' + MIN + ' ' + T(mu) + ' = ' + T(k * sg) + '. Dat is ' + (k === 0 ? 'het gemiddelde zelf.' : Math.abs(k) + ' keer σ ' + (k > 0 ? 'erboven.' : 'eronder.')), { orde:PLEK }); }
            if (soort === 'tussen'){
              do { a = R.heel(-2, 1); b = R.heel(a + 1, 2); } while (a === -b);
              van = a; tot = b; pr = ONDER[b] - ONDER[a]; vr = 'tussen ' + wq(a) + ' en ' + wq(b);
              st.push(plekK(a), plekK(b));
            } else {
              do { a = R.heel(-2, 2); } while (a === 0);
              if (soort === 'meer'){ van = a; tot = 3.3; pr = 100 - ONDER[a]; vr = it.meer + ' ' + wq(a); }
              else { van = -3.3; tot = a; pr = ONDER[a]; vr = it.minder + ' ' + wq(a); }
              st.push(plekK(a));
            }
            var stuk = [[-3.3, -2, 2.5], [-2, -1, 13.5], [-1, 0, 34], [0, 1, 34], [1, 2, 13.5], [2, 3.3, 2.5]].filter(function(s){ return s[0] >= van - 1e-9 && s[1] <= tot + 1e-9; }).map(function(s){ return T(s[2]) + '%'; });
            var nKies = st.length;
            st.push(S(stuk.length > 1 ? 'Tel de stukken op: ' + stuk.join(' + ') + ' =' : 'Hoeveel procent hoort bij dat ene stuk?', pAnt(pr), stuk.length > 1 ? stuk.join(' + ') + ' = ' + T(pr) + '%.' : 'Het is één stuk: ' + stuk[0] + '.', F(pAnt(pr), 100 - pr, 'Dat is de andere kant. Kijk goed welk stuk je zoekt.'), { e:'%' }));
            var bl = function(m){ return klok(mu, sg, { lab:m >= 1 ? null : [0], van:m >= nKies ? van : null, tot:tot, aria:'normale verdeling' }); };
            var o = { vraag:'Hoeveel procent?', context:normaalZin(it, mu, sg) + ' ' + normaalVr(it, vr, soort === 'tussen') + ' Gebruik de vuistregels.', beeld:bl, zelfBeeld:bl(0), stappen:st, antwoord:pAnt(pr), eenheid:'%' };
            if (aantal){
              var n = pr * Nt / 100;
              o.vraag = 'Hoeveel ' + it.wie + '?';
              o.context = normaalZin(it, mu, sg) + ' Het gaat om ' + Nt + ' ' + it.wie + '. ' + normaalVr(it, vr, soort === 'tussen', true) + ' Gebruik de vuistregels.';
              st.push(S(T(pr) + '% van ' + Nt + ' =', n, T(pr) + ' : 100 ' + X + ' ' + Nt + ' = ' + T(n) + '.', F(n, pr, 'Dat is het procent. Reken het aantal uit van de ' + Nt + '.')));
              o.antwoord = T(n); o.eenheid = it.wie;
            }
            return o;
          } }
      ] },

    /* ================= polygonen en steekproeven ================= */
    { groep:{ id:'wha-data', niveau:'havo', domein:'statistiek', naam:'Polygonen en steekproeven',
        uit:'Wiskunde A: een frequentiepolygoon en een cumulatief frequentiepolygoon aflezen, zien of een steekproef aselect is, en van een steekproef terugrekenen naar de populatie.' },
      doelen:[
        { id:'wha-st-poly', naam:'Een frequentiepolygoon aflezen', kort:'Elk punt staat boven het klassenmidden; de hoogte is de frequentie van die klasse',
          uit:'<p>In een <b>frequentiepolygoon</b> staat bij elke klasse een punt <b>boven het klassenmidden</b>. De punten zijn verbonden met rechte lijnen. Aan beide kanten zakt de lijn naar 0.</p><p>Bij de klasse 160 tot 165 cm staat het punt boven <b>162,5</b>. De <b>hoogte</b> van het punt is de <b>frequentie</b>: zoveel waarnemingen zitten in die klasse.</p><p>Wil je weten hoeveel er in twee klassen zitten, lees dan beide punten af en tel op.</p>',
          wanneer:'gegevens in klassen als lijn met punten getekend zijn.',
          maak:function(R){
            var it = R.kies(KLASSEN), s0 = R.kies(it.s), w = it.w, k = 6, f, mx;
            do { f = []; for (var i = 0; i < k; i++) f.push(R.heel(1, 15)); mx = Math.max.apply(null, f); } while (f.filter(function(x){ return x === mx; }).length > 1);
            var ymax = mx + 2 + (mx % 2 ? 1 : 0), mid = f.map(function(x, i){ return s0 + i * w + w / 2; });
            var soort = R.kies(['freq', 'freq', 'samen', 'modaal']), i1 = R.heel(0, k - 2), i2 = i1 + 1;
            if (soort === 'freq') i1 = R.heel(0, k - 1);
            function tek(m, nad){
              var g = raster({ x0:s0 - w, x1:s0 + (k + 1) * w, y0:0, y1:ymax, gx:w / 2, gy:1, lx:w, ly:2, xt:it.eh, yt:'frequentie', B:500, H:280 });
              var pts = [[s0 - w / 2, 0]].concat(mid.map(function(x, i){ return [x, f[i]]; })).concat([[s0 + k * w + w / 2, 0]]);
              var e = pl(pts.map(function(p){ return [g.X(p[0]), g.Y(p[1])]; }), KL[0], 3);
              pts.forEach(function(p, j){ var hl = nad && nad.indexOf(j - 1) >= 0; e += stip(g.X(p[0]), g.Y(p[1]), hl ? KL[1] : KL[0], hl ? 7 : 5); if (hl) e += ln(g.X(p[0]), g.Y(p[1]), g.X(p[0]), g.Y(0), { k:KL[1], w:2, dash:'5 4' }); });
              return klaar(g, e, 'frequentiepolygoon van ' + it.wat);
            }
            var zin = 'Het frequentiepolygoon laat ' + it.wat + ' zien, in ' + it.eh + '. "' + klasT(it, s0, s0 + w) + '" betekent: vanaf ' + T(s0) + ' tot net onder ' + T(s0 + w) + '.';
            function vr1(i){ return 'Hoeveel ' + it.wie + ' hebben ' + it.mv + ' van ' + klasT(it, s0 + i * w, s0 + (i + 1) * w) + ' ' + it.eh + '?'; }
            if (soort === 'freq'){
              var bl = function(m){ return tek(m, m >= 1 ? [i1] : null); };
              return { vraag:vr1(i1), context:zin, beeld:bl, zelfBeeld:tek(0), stappen:[
                S('Het klassenmidden van ' + klasT(it, s0 + i1 * w, s0 + (i1 + 1) * w) + ':', mid[i1], 'Precies tussen ' + T(s0 + i1 * w) + ' en ' + T(s0 + (i1 + 1) * w) + '.', F(mid[i1], s0 + i1 * w, 'Dat is de grens. Het punt staat in het midden van de klasse.', s0 + (i1 + 1) * w, 'Dat is de grens. Het punt staat in het midden van de klasse.'), { e:it.eh }),
                S('Lees de hoogte van het punt bij ' + T(mid[i1]) + ' af:', f[i1], 'Ga recht omhoog vanaf ' + T(mid[i1]) + ' en kijk naar links. Elk hokje is 1.', F(f[i1], i1 > 0 ? f[i1 - 1] : -1, 'Dat is de klasse ervoor.', i1 < k - 1 ? f[i1 + 1] : -1, 'Dat is de klasse erna.')) ] };
            }
            if (soort === 'samen'){
              var bl2 = function(m){ return tek(m, m >= 1 ? [i1, i2].slice(0, m) : null); };
              return { vraag:'Hoeveel ' + it.wie + ' van ' + T(s0 + i1 * w) + ' tot ' + T(s0 + (i2 + 1) * w) + ' ' + it.eh + '?', context:zin + ' Hoeveel ' + it.wie + ' hebben ' + it.mv + ' van ' + T(s0 + i1 * w) + ' tot ' + T(s0 + (i2 + 1) * w) + ' ' + it.eh + '?', beeld:bl2, zelfBeeld:tek(0), stappen:[
                S('De klasse ' + klasT(it, s0 + i1 * w, s0 + i2 * w) + ': lees af bij ' + T(mid[i1]) + ':', f[i1], 'Het punt boven ' + T(mid[i1]) + '.'),
                S('De klasse ' + klasT(it, s0 + i2 * w, s0 + (i2 + 1) * w) + ': lees af bij ' + T(mid[i2]) + ':', f[i2], 'Het punt boven ' + T(mid[i2]) + '.'),
                S('Samen: ' + f[i1] + ' + ' + f[i2] + ' =', f[i1] + f[i2], 'Tel de twee klassen op.') ] };
            }
            var im = f.indexOf(mx), KLS = f.map(function(x, i){ return klasT(it, s0 + i * w, s0 + (i + 1) * w); });
            var opt = R.hussel(KLS.filter(function(x, i){ return i !== im; })).slice(0, 3).concat([KLS[im]]);
            opt = KLS.filter(function(x){ return opt.indexOf(x) >= 0; });
            var bl3 = function(m){ return tek(m, m >= 1 ? [im] : null); };
            return { vraag:'Welke klasse komt het vaakst voor?', context:zin + ' Welke klasse heeft de hoogste frequentie? Dat is de modale klasse.', opties:opt, goed:opt.indexOf(KLS[im]), beeld:bl3, zelfBeeld:tek(0), stappen:[
              S('Hoe hoog is het hoogste punt?', mx, 'Zoek het punt dat het hoogst ligt en kijk naar links.'),
              K(R, 'Bij welke klasse hoort dat punt?', KLS[im], [], 'Het hoogste punt staat boven ' + T(mid[im]) + '. Dat is het midden van ' + KLS[im] + '.', { orde:opt }) ] };
          } },
        { id:'wha-st-cum', naam:'Een cumulatief frequentiepolygoon aflezen', kort:'Bij elke klassengrens lees je af hoeveel waarnemingen kleiner zijn dan die grens',
          uit:'<p>In een <b>cumulatief frequentiepolygoon</b> tel je de frequenties steeds op. De punten staan bij de <b>rechtergrens</b> van elke klasse.</p><p>Bij een grens lees je af <b>hoeveel waarnemingen kleiner zijn</b> dan die grens. Het laatste punt is het <b>totaal</b>.</p><p>Hoeveel zijn er <b>160 of meer</b>? Doe het totaal min wat je bij 160 afleest. Hoeveel liggen er <b>tussen 155 en 165</b>? Lees bij allebei af en trek af.</p>',
          wanneer:'je bij een cumulatief polygoon wilt weten hoeveel er onder, boven of tussen grenzen liggen.',
          maak:function(R){
            var it = R.kies(KLASSEN), s0 = R.kies(it.s), w = it.w, k = 5, f = [], cum = [0];
            for (var i = 0; i < k; i++){ f.push(2 * R.heel(1, 6)); cum.push(cum[i] + f[i]); }
            var N = cum[k], ymax = Math.ceil((N + 1) / 10) * 10, soort = R.kies(['minder', 'meer', 'tussen']), a = R.heel(1, k - 1), b = a;
            if (soort === 'tussen'){ a = R.heel(1, k - 2); b = R.heel(a + 1, k - 1); }
            var ga = s0 + a * w, gb = s0 + b * w;
            function tek(nad){
              var g = raster({ x0:s0, x1:s0 + k * w, y0:0, y1:ymax, gx:w / 2, gy:2, lx:w, ly:10, xt:it.eh, yt:'cumulatieve frequentie', B:500, H:320 });
              var pts = cum.map(function(c, j){ return [s0 + j * w, c]; }), e = pl(pts.map(function(p){ return [g.X(p[0]), g.Y(p[1])]; }), KL[0], 3);
              pts.forEach(function(p, j){ var hl = nad && nad.indexOf(j) >= 0; e += stip(g.X(p[0]), g.Y(p[1]), hl ? KL[1] : KL[0], hl ? 7 : 5); if (hl) e += ln(g.X(s0), g.Y(p[1]), g.X(p[0]), g.Y(p[1]), { k:KL[1], w:2, dash:'5 4' }); });
              return klaar(g, e, 'cumulatief frequentiepolygoon van ' + it.wat);
            }
            var zin = 'Het cumulatief frequentiepolygoon laat ' + it.wat + ' zien, in ' + it.eh + '.', vr, st, nad;
            if (soort === 'minder'){
              vr = 'Hoeveel ' + it.wie + ' hebben ' + it.mv + ' van minder dan ' + T(ga) + ' ' + it.eh + '?';
              st = [K(R, 'Wat lees je af bij een grens?', 'hoeveel er kleiner zijn dan die grens', ['hoeveel er in de klasse ervoor zitten', 'hoeveel er groter zijn dan die grens'], 'Cumulatief betekent: alles tot die grens bij elkaar opgeteld.'),
                S('Lees af bij ' + T(ga) + ':', cum[a], 'Ga recht omhoog vanaf ' + T(ga) + ' tot de lijn en kijk naar links. Elk hokje is 2.', F(cum[a], f[a - 1], 'Dat is alleen de klasse ervoor. Je leest af wat er tot de grens bij elkaar is.', N - cum[a], 'Dat zijn de waarnemingen erboven.'))];
              nad = function(m){ return m >= 2 ? [a] : null; };
            } else if (soort === 'meer'){
              vr = 'Hoeveel ' + it.wie + ' hebben ' + it.mv + ' van ' + T(ga) + ' ' + it.eh + ' of meer?';
              st = [S('Lees af bij ' + T(ga) + ' (zoveel zijn kleiner):', cum[a], 'Ga recht omhoog vanaf ' + T(ga) + ' tot de lijn en kijk naar links. Elk hokje is 2.'),
                S('Het totaal (het laatste punt):', N, 'Het laatste punt staat bij ' + T(s0 + k * w) + '.'),
                S(T(ga) + ' of meer: ' + N + ' ' + MIN + ' ' + cum[a] + ' =', N - cum[a], 'Het totaal min de waarnemingen onder ' + T(ga) + '.', F(N - cum[a], cum[a], 'Dat zijn er minder dan ' + T(ga) + '. Je zoekt de rest.'))];
              nad = function(m){ return m >= 2 ? [a, k] : m >= 1 ? [a] : null; };
            } else {
              vr = 'Hoeveel ' + it.wie + ' hebben ' + it.mv + ' van ' + T(ga) + ' tot ' + T(gb) + ' ' + it.eh + '?';
              st = [S('Lees af bij ' + T(ga) + ':', cum[a], 'Ga recht omhoog vanaf ' + T(ga) + ' tot de lijn. Elk hokje is 2.'),
                S('Lees af bij ' + T(gb) + ':', cum[b], 'Ga recht omhoog vanaf ' + T(gb) + ' tot de lijn.'),
                S('Ertussen: ' + cum[b] + ' ' + MIN + ' ' + cum[a] + ' =', cum[b] - cum[a], 'Wat onder ' + T(gb) + ' ligt, min wat onder ' + T(ga) + ' ligt.', F(cum[b] - cum[a], cum[b] + cum[a], 'Je telde op. Trek af.'))];
              nad = function(m){ return m >= 2 ? [a, b] : m >= 1 ? [a] : null; };
            }
            return { vraag:vr, context:zin, beeld:function(m){ return tek(nad(m)); }, zelfBeeld:tek(null), stappen:st };
          } },
        { id:'wha-st-aselect', naam:'Is de steekproef aselect?', kort:'Een steekproef is aselect als iedereen uit de populatie evenveel kans heeft om gekozen te worden',
          uit:'<p>De <b>populatie</b> is de hele groep waar je iets over wilt weten. Een <b>steekproef</b> is het deel dat je echt onderzoekt.</p><p>Een steekproef is <b>aselect</b> als <b>iedereen uit de populatie evenveel kans</b> heeft om gekozen te worden. Bijvoorbeeld door te loten uit de hele lijst.</p><p>Vraag je alleen je vrienden, de eerste die binnenkomen of wie zelf wil meedoen? Dan heeft niet iedereen evenveel kans. Dan is de steekproef <b>niet aselect</b>.</p>',
          wanneer:'je moet beoordelen of een onderzoek eerlijk mensen of dingen kiest.',
          maak:function(R){
            var it = R.kies([
              { pop:'alle leerlingen van de school', st:'50 geloote leerlingen', zin:'Je laat de computer 50 namen loten uit de lijst met alle leerlingen van de school.', a:true },
              { pop:'alle leerlingen van de school', st:'de eerste 50 leerlingen', zin:'Je vraagt de eerste 50 leerlingen die \'s ochtends de school binnenkomen.', a:false },
              { pop:'alle leerlingen van de school', st:'je klasgenoten', zin:'Je vraagt alle leerlingen uit je eigen klas.', a:false },
              { pop:'alle inwoners van de gemeente', st:'300 geloote inwoners', zin:'De gemeente loot 300 namen uit de lijst met alle inwoners.', a:true },
              { pop:'alle inwoners van de gemeente', st:'de invullers van de enquête', zin:'De gemeente zet een enquête op haar website. Wie wil, vult hem in.', a:false },
              { pop:'alle inwoners van de stad', st:'de bezoekers van de sportschool', zin:'Je ondervraagt mensen bij de ingang van de sportschool over hoe vaak ze sporten.', a:false },
              { pop:'alle lampen in de doos', st:'de bovenste 20 lampen', zin:'Je test de 20 lampen die bovenop in de doos liggen.', a:false },
              { pop:'alle lampen in de doos', st:'20 geloote lampen', zin:'Je geeft alle lampen in de doos een nummer en laat een computer 20 nummers loten.', a:true },
              { pop:'alle leden van de sportclub', st:'20 getrokken leden', zin:'Alle leden doen een briefje met hun naam in een bak. Je trekt er 20 uit.', a:true },
              { pop:'alle leden van de sportclub', st:'de leden op de vergadering', zin:'Je vraagt de leden die op de jaarvergadering zijn.', a:false },
              { pop:'alle klanten van de webwinkel', st:'100 geloote klanten', zin:'De webwinkel loot 100 klanten uit de lijst met alle klanten.', a:true },
              { pop:'alle klanten van de webwinkel', st:'de klanten die een review schreven', zin:'De webwinkel kijkt alleen naar de klanten die zelf een review schreven.', a:false } ]);
            var opt = ['aselect', 'niet aselect'], goed = it.a ? 0 : 1, fpop = 'de mensen die het onderzoek doen';
            return { vraag:'Is de steekproef aselect?', context:'Je wilt iets weten over ' + it.pop + '. ' + it.zin, opties:opt, goed:goed, stappen:[
              K(R, 'Wat is de populatie?', it.pop, [it.st, fpop].filter(function(x){ return x !== it.pop; }), 'De populatie is de hele groep waar je iets over wilt weten.'),
              K(R, 'Heeft iedereen uit de populatie evenveel kans om gekozen te worden?', it.a ? 'ja' : 'nee', [it.a ? 'nee' : 'ja'], it.a ? 'Er wordt geloot uit de hele groep. Iedereen kan getrokken worden.' : 'Niet iedereen kan gekozen worden, of sommigen hebben meer kans.', { orde:['ja', 'nee'] }),
              K(R, 'Is de steekproef aselect?', opt[goed], [], it.a ? 'Iedereen evenveel kans: aselect.' : 'Niet iedereen evenveel kans: niet aselect.', { orde:opt }) ] };
          } },
        { id:'wha-st-steekproef', naam:'Van steekproef naar populatie', kort:'Reken uit welk percentage in de steekproef iets heeft en neem dat percentage van de hele populatie',
          uit:'<p>Een school heeft 1500 leerlingen. Je loot er 200 en vraagt of ze een bijbaan hebben. 46 zeggen ja.</p><p>In de <b>steekproef</b> is dat 46 : 200 ' + X + ' 100% = <b>23%</b>. Is de steekproef aselect, dan verwacht je in de hele <b>populatie</b> ongeveer hetzelfde percentage.</p><p>Schatting: 23% van 1500 = 0,23 ' + X + ' 1500 = <b>345</b> leerlingen met een bijbaan.</p>',
          wanneer:'je uit een steekproef iets wilt zeggen over de hele groep.',
          maak:function(R){
            var it = R.kies([
              { pop:function(P){ return 'alle ' + T(P) + ' leerlingen van de school'; }, st:function(n){ return 'de ' + n + ' geloote leerlingen'; }, zin:function(P, n, k){ return 'Een school heeft ' + T(P) + ' leerlingen. Je loot er ' + n + ' en vraagt of ze een bijbaan hebben. ' + k + ' leerlingen zeggen ja.'; }, wat:'leerlingen met een bijbaan', Ps:[800, 1000, 1200, 1500, 1600, 2000] },
              { pop:function(P){ return 'alle ' + T(P) + ' inwoners van het dorp'; }, st:function(n){ return 'de ' + n + ' ondervraagde inwoners'; }, zin:function(P, n, k){ return 'Een dorp heeft ' + T(P) + ' inwoners. Er worden ' + n + ' inwoners geloot en ondervraagd. ' + k + ' van hen fietsen naar hun werk.'; }, wat:'inwoners die naar hun werk fietsen', Ps:[2400, 3000, 4500, 5000, 6000, 8000] },
              { pop:function(P){ return 'alle ' + T(P) + ' lampen van die dag'; }, st:function(n){ return 'de ' + n + ' geteste lampen'; }, zin:function(P, n, k){ return 'Een fabriek maakt op een dag ' + T(P) + ' lampen. Er worden ' + n + ' lampen aselect getest. ' + k + ' daarvan zijn kapot.'; }, wat:'kapotte lampen', Ps:[5000, 8000, 10000, 12000, 20000] } ]);
            var n, q, k, P;
            do { n = R.kies([50, 80, 100, 150, 200, 250, 400, 500]); q = R.heel(2, 30) * 2; k = q * n / 100; } while (k !== Math.round(k) || k < 3);
            P = R.kies(it.Ps); var A = q * P / 100;
            return { vraag:'Hoeveel ' + it.wat + ' ongeveer?', context:it.zin(P, n, k) + ' Schat het aantal ' + it.wat + ' in de hele populatie.', stappen:[
              K(R, 'Wat is de populatie?', it.pop(P), [it.st(n), 'de ' + it.wat], 'De populatie is de hele groep waar je iets over wilt weten.'),
              S('Welk percentage in de steekproef? ' + k + ' : ' + n + ' ' + X + ' 100% =', pAnt(q), 'Deel ' + k + ' door ' + n + ' en doe keer 100.', F(pAnt(q), T(rnd(n / k, 2)), 'Andersom: het deel gedeeld door het totaal.'), { e:'%' }),
              S('Schatting voor de populatie: ' + q + '% van ' + T(P) + ' =', A, T(q / 100) + ' ' + X + ' ' + T(P) + ' = ' + T(A) + '.', F(A, k, 'Dat is het aantal in de steekproef. Reken het om naar de hele populatie.')) ] };
          } }
      ] },

    /* ================= lineaire en exponentiële formules ================= */
    { groep:{ id:'wha-groei', niveau:'havo', domein:'verbanden', naam:'Lineaire en exponentiële formules',
        uit:'Wiskunde A: zien of een tabel lineair of exponentieel is, formules opstellen, de groeifactor omrekenen naar een andere tijdseenheid, de verdubbelingstijd door te proberen, en machtsformules invullen en terugrekenen.' },
      doelen:[
        { id:'wha-fo-soort', naam:'Lineair of exponentieel?', kort:'Zijn de verschillen steeds gelijk, dan is het lineair; zijn de quotiënten steeds gelijk, dan exponentieel',
          uit:'<p>Bij een tabel met stapjes van 1 kun je zien wat voor verband het is.</p><p>Trek steeds af: <b>verschil</b> = waarde min de waarde ervoor. Is het verschil <b>steeds hetzelfde</b>, dan is het <b>lineair</b>: er komt steeds evenveel bij.</p><p>Zo niet, <b>deel</b> dan steeds: <b>quotiënt</b> = waarde gedeeld door de waarde ervoor. Is het quotiënt steeds hetzelfde, dan is het <b>exponentieel</b>: het wordt steeds evenveel keer zo groot.</p>',
          wanneer:'je een tabel krijgt en wilt weten welke formule erbij past.',
          maak:function(R){
            var lin = R.heel(0, 1) === 1, y = [], i;
            if (lin){ var a, b; do { a = R.kies([-5, -4, -3, -2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]); b = R.heel(10, 60); } while (b + 4 * a <= 0); for (i = 0; i <= 4; i++) y.push(rnd(b + a * i, 6)); }
            else { var c = R.kies([[16, 1.5], [32, 1.5], [64, 1.5], [100, 1.2], [200, 1.1], [1000, 1.1], [1000, 0.9], [625, 0.8], [400, 0.5], [80, 0.5], [5, 2], [3, 2], [12, 2], [2, 3], [5, 3], [256, 1.25], [256, 0.75], [500, 1.2]]); for (i = 0; i <= 4; i++) y.push(rnd(c[0] * Math.pow(c[1], i), 6)); }
            var d1 = rnd(y[1] - y[0], 6), d2 = rnd(y[2] - y[1], 6), q1 = rnd(y[1] / y[0], 6), q2 = rnd(y[2] / y[1], 6), opt = ['lineair', 'exponentieel'];
            function tab(n){ return R0.teken.tabel([['t', '0', '1', '2', '3', '4'], ['N'].concat(y.map(function(v){ return T(v); }))], { zijkop:true }); }
            var st = [S(T(y[1]) + ' ' + MIN + ' ' + T(y[0]) + ' =', d1, 'Het verschil: de tweede waarde min de eerste.'), S(T(y[2]) + ' ' + MIN + ' ' + T(y[1]) + ' =', d2, 'De derde waarde min de tweede.')];
            if (!lin) st.push(S('De verschillen zijn niet gelijk. Deel: ' + T(y[1]) + ' : ' + T(y[0]) + ' =', q1, 'De tweede waarde gedeeld door de eerste.'), S(T(y[2]) + ' : ' + T(y[1]) + ' =', q2, 'De derde waarde gedeeld door de tweede.'));
            st.push(K(R, lin ? 'De verschillen zijn gelijk. Wat voor verband is het?' : 'De quotiënten zijn gelijk. Wat voor verband is het?', lin ? 'lineair' : 'exponentieel', [], lin ? 'Steeds evenveel erbij of eraf: lineair.' : 'Steeds evenveel keer zo groot: exponentieel.', { orde:opt }));
            return { vraag:'tabel ' + y.map(function(x){ return T(x); }).join(' '), vraagHtml:'Lineair of exponentieel?', context:'Bekijk de tabel. Is het verband lineair of exponentieel?', opties:opt, goed:lin ? 0 : 1, beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wha-fo-lin', naam:'Een lineaire formule bij een tabel', kort:'Hellingsgetal = toename van y gedeeld door de toename van t; het startgetal staat bij t = 0',
          uit:'<p>In de tabel gaat t steeds met <b>5</b> omhoog, en K steeds met <b>7,5</b>. Dan is het verband lineair.</p><p>Het <b>hellingsgetal</b> is de toename <b>per 1</b>: 7,5 : 5 = <b>1,5</b>. Het <b>startgetal</b> is de waarde bij t = 0, bijvoorbeeld <b>20</b>.</p><p>De formule is <b>K = 1,5t + 20</b>. Let op: deel altijd door de stap van t, niet alleen aflezen wat erbij komt.</p>',
          wanneer:'je bij een tabel van een lineair verband de formule zoekt en t niet met 1 tegelijk gaat.',
          maak:function(R){
            var it = R.kies([
              { y:'K', x:'t', zin:'De tabel geeft de kosten K in euro van een klus van t minuten.', as:[0.2, 0.4, 0.5, 0.6, 0.8, 1.2, 1.5], bs:[15, 20, 25, 30, 40, 45] },
              { y:'L', x:'t', zin:'Een kaars brandt op. De tabel geeft de lengte L in cm na t uur.', as:[-0.4, -0.5, -0.6, -0.8, -1, -1.2], bs:[20, 24, 25, 30] },
              { y:'W', x:'t', zin:'Een vat loopt vol. De tabel geeft de hoeveelheid water W in liter, t minuten nadat de kraan openging.', as:[1.5, 2, 2.5, 3, 4, 6], bs:[10, 15, 20, 50] },
              { y:'H', x:'t', zin:'De tabel geeft de hoogte H in cm van een plant, t dagen na het meten.', as:[0.3, 0.4, 0.5, 0.6, 0.8, 1.5], bs:[12, 15, 18, 20, 25] } ]);
            var a, h, b, ah;
            do { a = R.kies(it.as); h = R.kies([2, 4, 5, 10]); b = R.kies(it.bs); ah = rnd(a * h, 6); } while (Math.abs(rnd(ah, 1) - ah) > 1e-9 || b + 4 * ah <= 0);
            var ts = [0, h, 2 * h, 3 * h, 4 * h], ys = ts.map(function(t){ return rnd(b + a * t, 6); }), form = linS(it.y, it.x, a, b);
            function tab(n){ return R0.teken.tabel([[it.x].concat(ts.map(String)), [it.y].concat(ys.map(function(v){ return T(v); }))], { zijkop:true, nadruk:n >= 4 ? [[1, 1]] : [] }); }
            return { vraag:'tabel ' + ys.map(function(x){ return T(x); }).join(' '), vraagHtml:it.y + ' = ?', context:it.zin + ' Het verband is lineair. Stel de formule op. Typ bijvoorbeeld ' + linS(it.y, it.x, 0.5, 10) + '.', antwoord:form, controle:linC(it.y, it.x, a, b), invoer:'tekst', beeld:tab, zelfBeeld:tab(0), stappen:[
              S('Hoeveel gaat ' + it.x + ' per kolom omhoog?', h, ts[1] + ' ' + MIN + ' 0 = ' + h + '.'),
              S('Hoeveel verandert ' + it.y + ' per kolom? ' + T(ys[1]) + ' ' + MIN + ' ' + T(ys[0]) + ' =', ah, 'De tweede waarde min de eerste.'),
              S('Het hellingsgetal: ' + T(ah) + ' : ' + h + ' =', a, 'Deel door de stap van ' + it.x + ', want je wilt de verandering per 1.', F(a, ah, 'Dat is de verandering per ' + h + '. Deel nog door ' + h + '.')),
              S('Het startgetal (bij ' + it.x + ' = 0):', b, 'Kijk in de tabel onder ' + it.x + ' = 0.'),
              S('De formule: ' + it.y + ' =', form, 'Hellingsgetal ' + T(a) + ', startgetal ' + T(b) + ': ' + form + '.', null, { controle:linC(it.y, it.x, a, b) }) ] };
          } },
        { id:'wha-fo-exp', naam:'Een exponentiële formule uit twee waarden', kort:'Deel de twee waarden: dat is de groeifactor per n stappen; neem de n-de machtswortel voor de groeifactor per stap',
          uit:'<p>In 2020 wonen er 2000 mensen in een dorp, in 2023 zijn het er 3456. De groei is exponentieel.</p><p>In <b>3 jaar</b> werd het 3456 : 2000 = <b>1,728</b> keer zo groot. Dat is de groeifactor per 3 jaar. Per jaar is het het getal dat je 3 keer met zichzelf vermenigvuldigt: 1,728<sup>1/3</sup> = <b>1,2</b>. Tik in: 1,728 ^ (1 : 3).</p><p>Met beginwaarde 2000 is de formule <b>N = 2000 · 1,2^t</b>, met t in jaren vanaf 2020.</p>',
          wanneer:'je twee waarden van exponentiële groei weet die een paar stappen uit elkaar liggen.',
          maak:function(R){
            var it = R.kies([
              { zin:function(b, n, v){ return 'In 2020 wonen er ' + T(b) + ' mensen in een stad. In ' + (2020 + n) + ' zijn het er ' + T(v) + '. t is de tijd in jaren vanaf 2020.'; }, eh:'jaar', gs:[1.1, 1.2], bs:[1000, 2000, 5000, 10000, 20000] },
              { zin:function(b, n, v){ return 'Om 8.00 uur zijn er ' + T(b) + ' bacteriën. Om ' + (8 + n) + '.00 uur zijn het er ' + T(v) + '. t is de tijd in uren vanaf 8.00 uur.'; }, eh:'uur', gs:[1.5, 2], bs:[200, 400, 800, 1000, 1600] },
              { zin:function(b, n, v){ return 'Een machine kost nieuw € ' + T(b) + '. Na ' + n + ' jaar is hij nog € ' + T(v) + ' waard. t is de tijd in jaren.'; }, eh:'jaar', gs:[0.8, 0.9], bs:[5000, 10000, 20000, 25000] },
              { zin:function(b, n, v){ return 'Er zit ' + T(b) + ' mg van een medicijn in het bloed. Na ' + n + ' uur is dat nog ' + T(v) + ' mg. t is de tijd in uren.'; }, eh:'uur', gs:[0.5, 0.8], bs:[400, 500, 800, 1000] } ]);
            var g, n, b, v, G;
            do { g = R.kies(it.gs); n = R.kies([2, 3]); b = R.kies(it.bs); G = rnd(Math.pow(g, n), 6); v = rnd(b * G, 6); } while (Math.abs(v - Math.round(v)) > 1e-9);
            var form = 'N = ' + T(b) + ' · ' + T(g) + '^t';
            return { vraag:'N = ?', context:it.zin(b, n, v) + ' De groei is exponentieel. Stel de formule N = b · g^t op.', antwoord:form, controle:expC(b, g), invoer:'tekst', stappen:[
              S('De groeifactor per ' + n + ' ' + it.eh + ': ' + T(v) + ' : ' + T(b) + ' =', G, 'Deel de latere waarde door de eerste.', F(G, rnd(v - b, 6), 'Je trok af. Bij exponentiële groei deel je.', rnd(b / v, 6), 'Andersom: de latere waarde gedeeld door de eerste.')),
              S('De groeifactor per ' + it.eh + ': ' + T(G) + '^(1/' + n + ') =', g, 'Tik in: ' + T(G) + ' ^ (1 : ' + n + '). ' + (n === 2 ? 'Dat is hetzelfde als de wortel.' : 'Dat is de derdemachtswortel.') + ' Controle: ' + T(g) + (n === 2 ? '²' : '³') + ' = ' + T(G) + '.', F(g, rnd(G / n, 6), 'Je deelde door ' + n + '. Neem de macht 1/' + n + '.')),
              S('De beginwaarde b (bij t = 0):', b, 'De waarde aan het begin.'),
              S('De formule:', form, 'N = b · g^t met b = ' + T(b) + ' en g = ' + T(g) + '.', null, { controle:expC(b, g) }) ] };
          } },
        { id:'wha-fo-langer', naam:'De groeifactor per langere tijd', kort:'Van per jaar naar per tien jaar: de groeifactor tot de macht 10',
          uit:'<p>Een bedrag groeit met groeifactor <b>1,03 per jaar</b>. Wat is de groeifactor per <b>tien jaar</b>?</p><p>In tien jaar vermenigvuldig je 10 keer met 1,03. Dat is 1,03<sup>10</sup> ≈ <b>1,344</b>. Je doet dus <b>tot de macht</b> het aantal keer dat de korte tijd in de lange past.</p><p>Let op: het is <b>niet</b> 10 ' + X + ' 1,03. Groei per jaar stapelt zich op.</p>',
          wanneer:'je de groeifactor per jaar weet en hem per tien jaar, per week of per dag wilt.',
          maak:function(R){
            var it = R.kies([
              { klein:'jaar', groot:'tien jaar', k:10, gs:[1.02, 1.03, 1.04, 1.05, 1.06, 0.97, 0.98, 0.95, 1.015, 1.025] },
              { klein:'maand', groot:'jaar', k:12, gs:[1.01, 1.02, 1.015, 1.03, 0.99, 0.98, 1.005] },
              { klein:'dag', groot:'week', k:7, gs:[1.05, 1.1, 1.08, 0.9, 0.95, 1.12, 1.15] },
              { klein:'uur', groot:'dag', k:24, gs:[1.02, 1.03, 1.05, 0.98, 0.97, 1.01] } ]);
            var g, G;
            do { g = R.kies(it.gs); G = Math.pow(g, it.k); } while (grens(G, 3, 0.05));
            var ant = rAnt(G, 3), k = it.k;
            return { vraag:'De groeifactor per ' + it.groot + '?', context:'De groeifactor van een hoeveelheid is ' + T(g) + ' per ' + it.klein + '. Bereken de groeifactor per ' + it.groot + '. Rond af op 3 decimalen.', antwoord:ant, stappen:[
              S('Hoe vaak past een ' + it.klein + ' in ' + (it.groot === 'tien jaar' ? '' : 'een ') + it.groot + '?', k, it.groot === 'tien jaar' ? 'Tien jaar is 10 keer een jaar.' : 'Een ' + it.groot + ' heeft ' + k + ' ' + (it.klein === 'jaar' ? 'jaren' : it.klein === 'maand' ? 'maanden' : it.klein === 'dag' ? 'dagen' : 'uur') + '.'),
              K(R, 'Wat doe je met de groeifactor?', 'tot de macht ' + k, ['keer ' + k, 'tot de macht 1/' + k], 'Je vermenigvuldigt ' + k + ' keer achter elkaar met ' + T(g) + '.'),
              S(T(g) + '^' + k + ' ≈ (rond af op 3 decimalen)', ant, 'Tik in: ' + T(g) + ' ^ ' + k + ' = ' + T(G, { dec:5 }) + '…', F(ant, rT(g * k, 3), 'Je deed keer ' + k + '. Het moet tot de macht ' + k + '.', rT(Math.pow(g, 1 / k), 3), 'Dat is per kortere tijd. Naar een langere tijd: tot de macht ' + k + '.')) ] };
          } },
        { id:'wha-fo-korter', naam:'De groeifactor per kortere tijd', kort:'Van per jaar naar per maand: de groeifactor tot de macht 1/12',
          uit:'<p>Een bedrag groeit met groeifactor <b>1,08 per jaar</b>. Wat is de groeifactor per <b>maand</b>?</p><p>Je zoekt een getal g dat je <b>12 keer</b> met zichzelf vermenigvuldigt om 1,08 te krijgen: g<sup>12</sup> = 1,08. Dus g = 1,08<sup>1/12</sup> ≈ <b>1,0064</b>.</p><p>Tik in: 1,08 ^ (1 : 12). Zet <b>haakjes</b> om 1 : 12. Let op: het is <b>niet</b> 1,08 : 12.</p>',
          wanneer:'je de groeifactor per jaar weet en hem per maand, per dag of per uur wilt.',
          maak:function(R){
            var it = R.kies([
              { groot:'jaar', klein:'maand', k:12, gs:[1.06, 1.08, 1.1, 1.12, 1.05, 0.9, 0.85, 0.94] },
              { groot:'week', klein:'dag', k:7, gs:[1.5, 2, 1.4, 0.7, 0.6, 1.75] },
              { groot:'dag', klein:'uur', k:24, gs:[2, 1.5, 3, 0.5, 0.8] },
              { groot:'tien jaar', klein:'jaar', k:10, gs:[1.5, 2, 1.3, 0.8, 0.7, 1.25] } ]);
            var g, G;
            do { g = R.kies(it.gs); G = Math.pow(g, 1 / it.k); } while (grens(G, 4, 0.05));
            var ant = rAnt(G, 4), k = it.k;
            return { vraag:'De groeifactor per ' + it.klein + '?', context:'De groeifactor van een hoeveelheid is ' + T(g) + ' per ' + it.groot + '. Bereken de groeifactor per ' + it.klein + '. Rond af op 4 decimalen.', antwoord:ant, stappen:[
              S('Hoe vaak past een ' + it.klein + ' in ' + (it.groot === 'tien jaar' ? '' : 'een ') + it.groot + '?', k, it.groot === 'tien jaar' ? 'Tien jaar is 10 keer een jaar.' : 'Een ' + it.groot + ' heeft ' + k + ' ' + (it.klein === 'maand' ? 'maanden' : it.klein === 'dag' ? 'dagen' : 'uur') + '.'),
              K(R, 'Wat doe je met de groeifactor?', 'tot de macht 1/' + k, ['delen door ' + k, 'tot de macht ' + k], 'Je zoekt het getal dat ' + k + ' keer met zichzelf vermenigvuldigd ' + T(g) + ' geeft.'),
              S(T(g) + '^(1/' + k + ') ≈ (rond af op 4 decimalen)', ant, 'Tik in: ' + T(g) + ' ^ (1 : ' + k + ') = ' + T(G, { dec:6 }) + '…', F(ant, rT(g / k, 4), 'Je deelde door ' + k + '. Neem de macht 1/' + k + '.', rT(Math.pow(g, k), 4), 'Dat is per langere tijd. Naar een kortere tijd: tot de macht 1/' + k + '.')) ] };
          } },
        { id:'wha-fo-verdub', naam:'Verdubbelingstijd en halveringstijd door te proberen', kort:'Zoek de t waarbij g^t voor het eerst minstens 2 is (of hoogstens 0,5): probeer met de rekenmachine',
          uit:'<p>Een bedrag groeit met 6% per jaar: groeifactor 1,06. Na hoeveel jaar is het <b>verdubbeld</b>? Je zoekt t met 1,06<sup>t</sup> = 2.</p><p><b>Probeer</b> met de rekenmachine. Een handige eerste gok is 70 : 6 ≈ 12. 1,06<sup>11</sup> ≈ 1,90: nog niet. 1,06<sup>12</sup> ≈ 2,01: wel. Na <b>12 jaar</b> is het voor het eerst verdubbeld.</p><p>Bij afname zoek je de <b>halveringstijd</b>: de t waarbij g<sup>t</sup> voor het eerst 0,5 of minder is.</p>',
          wanneer:'je wilt weten wanneer iets twee keer zo groot of half zo groot is.',
          maak:function(R){
            var toe = R.heel(0, 1) === 1, it = toe ? R.kies([
              { zin:function(p){ return 'Een bedrag op een spaarrekening groeit met ' + T(p) + '% per jaar.'; }, per:'jaar', mv:'jaren', ps:[3, 4, 5, 6, 7, 8, 9, 10, 12, 15], wat:'het bedrag' },
              { zin:function(p){ return 'Het aantal bezoekers van een website groeit met ' + T(p) + '% per maand.'; }, per:'maand', mv:'maanden', ps:[5, 8, 10, 12, 15, 20, 25], wat:'het aantal bezoekers' },
              { zin:function(p){ return 'Een kolonie bacteriën groeit met ' + T(p) + '% per uur.'; }, per:'uur', mv:'uren', ps:[10, 15, 20, 25, 30, 40], wat:'het aantal bacteriën' } ])
              : R.kies([
              { zin:function(p){ return 'Een auto wordt elk jaar ' + T(p) + '% minder waard.'; }, per:'jaar', mv:'jaren', ps:[8, 10, 12, 15, 20, 25], wat:'de waarde' },
              { zin:function(p){ return 'De hoeveelheid medicijn in het bloed neemt elk uur met ' + T(p) + '% af.'; }, per:'uur', mv:'uren', ps:[5, 8, 10, 15, 20, 30], wat:'de hoeveelheid medicijn' },
              { zin:function(p){ return 'Een radioactieve stof neemt elke dag met ' + T(p) + '% af.'; }, per:'dag', mv:'dagen', ps:[3, 4, 5, 6, 8, 10], wat:'de hoeveelheid stof' } ]);
            var p, g, t, v1, v2;
            do { p = R.kies(it.ps); g = rnd(toe ? 1 + p / 100 : 1 - p / 100, 6); t = 1; while (toe ? Math.pow(g, t) < 2 : Math.pow(g, t) > 0.5) t++;
              v1 = rnd(Math.pow(g, t - 1), 2); v2 = rnd(Math.pow(g, t), 2); } while (t < 2 || (toe ? v1 >= 2 || v2 <= 2 : v1 <= 0.5 || v2 >= 0.5) || grens(Math.pow(g, t - 1), 2, 0.05) || grens(Math.pow(g, t), 2, 0.05));
            var a = t - 1, doel = toe ? 2 : 0.5, woord = toe ? 'minstens verdubbeld' : 'gehalveerd (of minder)';
            return { vraag:'Na hoeveel hele ' + it.mv + '?', context:it.zin(p) + ' Na hoeveel hele ' + it.mv + ' is ' + it.wat + ' voor het eerst ' + woord + '? Rond in je proberen af op 2 decimalen.', eenheid:it.mv === 'uren' ? 'uur' : it.mv, stappen:[
              S('De groeifactor per ' + it.per + ':', g, toe ? '1 + ' + T(p / 100) + '.' : '1 ' + MIN + ' ' + T(p / 100) + '.', F(g, rnd(toe ? 1 - p / 100 : 1 + p / 100, 6), toe ? 'Het groeit: g is groter dan 1.' : 'Het neemt af: g is kleiner dan 1.')),
              S('Je zoekt ' + T(g) + '^t = ' + T(doel) + '. Probeer t = ' + a + ': ' + T(g) + '^' + a + ' ≈', uniek([rT(Math.pow(g, a), 2), T(v1), rT(Math.pow(g, a), 3)]), 'Tik in: ' + T(g) + ' ^ ' + a + '. Dat is ' + (toe ? 'nog kleiner dan 2.' : 'nog groter dan 0,5.')),
              S('Probeer t = ' + t + ': ' + T(g) + '^' + t + ' ≈', uniek([rT(Math.pow(g, t), 2), T(v2), rT(Math.pow(g, t), 3)]), 'Tik in: ' + T(g) + ' ^ ' + t + '. Dat is ' + (toe ? 'meer dan 2.' : 'minder dan 0,5.')),
              S('Voor het eerst ' + woord + ' na:', t, 'Bij t = ' + a + ' is het ' + (toe ? 'nog geen 2' : 'nog meer dan 0,5') + ', bij t = ' + t + ' wel.', F(t, a, 'Bij t = ' + a + ' is het nog niet ' + (toe ? 'verdubbeld' : 'gehalveerd') + '.'), { e:it.mv === 'uren' ? 'uur' : it.mv }) ] };
          } },
        { id:'wha-fo-macht', naam:'Een machtsformule invullen', kort:'Bij y = a · x^p reken je eerst de macht uit en doe je die daarna keer a',
          uit:'<p>Een <b>machtsformule</b> heeft de vorm y = a · x<sup>p</sup>. Bijvoorbeeld het gewicht van een vis: G = 0,01 · L<sup>3</sup>, met L de lengte in cm en G in gram.</p><p>Bij L = 30: eerst de <b>macht</b>, 30<sup>3</sup> = 27.000. Dan <b>keer 0,01</b>: G = <b>270</b> gram.</p><p>De macht mag ook een kommagetal of negatief zijn, zoals L<sup>0,5</sup> (dat is √L) of G<sup>' + MIN + '0,25</sup>. Tik de macht in met ^ en zet een negatieve macht tussen haakjes.</p>',
          wanneer:'een formule een macht van de variabele heeft en je een waarde invult.',
          maak:function(R){
            var it = R.kies([
              { zin:'Voor een vis geldt G = 0,01 · L³. Daarin is L de lengte in cm en G het gewicht in gram.', a:0.01, p:3, ps:'3', y:'G', x:'L', xs:[20, 24, 25, 28, 30, 32, 35, 36, 40, 45], eh:'gram', d:0 },
              { zin:'Voor de remweg van een auto geldt R = 0,006 · v². Daarin is v de snelheid in km/u en R de remweg in meter.', a:0.006, p:2, ps:'2', y:'R', x:'v', xs:[30, 40, 50, 60, 70, 80, 90, 100, 120], eh:'meter', d:1 },
              { zin:'Voor een kleine windmolen geldt P = 0,3 · v³. Daarin is v de windsnelheid in m/s en P het vermogen in watt.', a:0.3, p:3, ps:'3', y:'P', x:'v', xs:[3, 4, 5, 6, 7, 8, 9, 10, 12], eh:'watt', d:1 },
              { zin:'Voor een slinger geldt T = 2 · L^0,5. Daarin is L de lengte in meter en T de tijd van een slingering in seconden.', a:2, p:0.5, ps:'0,5', y:'T', x:'L', xs:[0.25, 0.64, 1, 1.44, 2.25, 4, 6.25, 0.81], eh:'seconden', d:1 },
              { zin:'Voor de hartslag van een zoogdier geldt H = 240 · G^' + MIN + '0,25. Daarin is G het gewicht in kg en H het aantal slagen per minuut.', a:240, p:-0.25, ps:MIN + '0,25', y:'H', x:'G', xs:[16, 81, 256, 625, 1296], eh:'slagen per minuut', d:0 } ]);
            var x, xp, y;
            do { x = R.kies(it.xs); xp = Math.pow(x, it.p); y = it.a * xp; } while (grens(y, it.d, 0.05));
            var xpT = Math.abs(xp - rnd(xp, 6)) < 1e-12 ? T(rnd(xp, 6)) : null, xpAnt = xpT ? [xpT] : rAnt(xp, 3).concat(rAnt(xp, 4));
            var rk = it.d ? 'op 1 decimaal' : 'op een heel getal', ant = rAnt(y, it.d);
            return { vraag:it.y + ' bij ' + it.x + ' = ' + T(x) + '?', context:it.zin + ' Bereken ' + it.y + ' als ' + it.x + ' = ' + T(x) + '. Rond af ' + rk + '.', antwoord:ant, eenheid:it.eh, stappen:[
              S('Eerst de macht: ' + T(x) + '^' + it.ps + (xpT ? ' =' : ' ≈ (rond af op 3 decimalen)'), uniek(xpAnt), 'Tik in: ' + T(x) + ' ^ ' + (it.p < 0 ? '(' + it.ps + ')' : it.ps) + '.' + (it.p === 0.5 ? ' Dat is hetzelfde als √' + T(x) + '.' : ''), F(uniek(xpAnt), T(rnd(x * it.p, 6)), 'Je deed keer ' + it.ps + '. Het is een macht.')),
              S('Dan keer ' + T(it.a) + ': ' + it.y + ' ≈ (rond af ' + rk + ')', ant, T(it.a) + ' ' + X + ' ' + (xpT || T(rnd(xp, 6))) + ' = ' + T(rnd(y, 4)) + '.', F(ant, rT(Math.pow(it.a * x, it.p), it.d), 'Alleen ' + it.x + ' gaat tot de macht, niet ' + T(it.a) + ' ' + X + ' ' + it.x + '.'), { e:it.eh }) ] };
          } },
        { id:'wha-fo-machtterug', naam:'Terugrekenen bij een machtsformule', kort:'Bij y = a · x^p: deel eerst door a en neem dan de wortel (of de derdemachtswortel)',
          uit:'<p>Voor een vis geldt G = 0,01 · L<sup>3</sup>. Een vis weegt 640 gram. Hoe lang is hij?</p><p><b>Reken terug</b>, in de omgekeerde volgorde. Eerst <b>delen door 0,01</b>: L<sup>3</sup> = 640 : 0,01 = 64.000.</p><p>Dan de <b>derdemachtswortel</b>: L = 64.000<sup>1/3</sup> = <b>40</b> cm. Bij een kwadraat neem je de gewone wortel.</p>',
          wanneer:'je bij een machtsformule de uitkomst weet en zoekt wat je moet invullen.',
          maak:function(R){
            var it = R.kies([
              { zin:'Voor een vis geldt G = 0,01 · L³. Daarin is L de lengte in cm en G het gewicht in gram.', a:0.01, p:3, y:'G', x:'L', xs:[20, 25, 30, 35, 40, 45, 50], ey:'gram', ex:'cm' },
              { zin:'Voor de remweg van een auto geldt R = 0,006 · v². Daarin is v de snelheid in km/u en R de remweg in meter.', a:0.006, p:2, y:'R', x:'v', xs:[40, 50, 60, 70, 80, 90, 100, 110, 120], ey:'meter', ex:'km/u' },
              { zin:'Voor een kleine windmolen geldt P = 0,3 · v³. Daarin is v de windsnelheid in m/s en P het vermogen in watt.', a:0.3, p:3, y:'P', x:'v', xs:[3, 4, 5, 6, 7, 8, 9, 10], ey:'watt', ex:'m/s' },
              { zin:'Voor een cirkelvormig kleed geldt A = 3,14 · r². Daarin is r de straal in meter en A de oppervlakte in m².', a:3.14, p:2, y:'A', x:'r', xs:[0.5, 1, 1.5, 2, 2.5, 3], ey:'m²', ex:'meter' } ]);
            var x = R.kies(it.xs), xp = rnd(Math.pow(x, it.p), 6), y = rnd(it.a * xp, 6);
            return { vraag:it.x + ' bij ' + it.y + ' = ' + T(y) + '?', context:it.zin + ' Bereken ' + it.x + ' als ' + it.y + ' = ' + T(y) + ' ' + it.ey + '.', antwoord:T(x), eenheid:it.ex, stappen:[
              S('Deel door ' + T(it.a) + ': ' + it.x + (it.p === 2 ? '²' : '³') + ' = ' + T(y) + ' : ' + T(it.a) + ' =', xp, 'Het omgekeerde van keer ' + T(it.a) + ' is delen door ' + T(it.a) + '.', F(xp, rnd(y * it.a, 6), 'Je deed keer. Terugrekenen is delen.')),
              S('Neem de ' + (it.p === 2 ? 'wortel: √' + T(xp) : 'derdemachtswortel: ' + T(xp) + '^(1/3)') + ' =', x, it.p === 2 ? 'Tik in: √' + T(xp) + '.' : 'Tik in: ' + T(xp) + ' ^ (1 : 3). Controle: ' + T(x) + '³ = ' + T(xp) + '.', F(x, rnd(xp / it.p, 6), 'Je deelde door ' + it.p + '. Neem de ' + (it.p === 2 ? 'wortel.' : 'derdemachtswortel.')), { e:it.ex }) ] };
          } }
      ] },

    /* ================= veranderingen ================= */
    { groep:{ id:'wha-veran', niveau:'havo', domein:'verbanden', naam:'Toenamediagram en helling',
        uit:'Wiskunde A: veranderingen per stap in een toenamediagram, stijgen en dalen beschrijven, de gemiddelde verandering op een interval (het differentiequotiënt) en de helling in een punt met een raaklijn.' },
      doelen:[
        { id:'wha-ver-toename', naam:'Een toenamediagram maken', kort:'De staaf bij een periode is de waarde aan het eind min de waarde aan het begin',
          uit:'<p>In een <b>toenamediagram</b> zie je per periode hoeveel er <b>bij</b> of <b>af</b> is gekomen. Elke staaf hoort bij een stap, bijvoorbeeld van 2020 tot 2021.</p><p>De hoogte van de staaf is <b>eind min begin</b>. Waren er 60 leden in 2020 en 68 in 2021, dan is de staaf 68 ' + MIN + ' 60 = <b>8</b>.</p><p>Gaat het omlaag, dan is de toename <b>negatief</b> en staat de staaf onder de as.</p>',
          wanneer:'je bij een tabel wilt zien hoeveel er per jaar of per stap bij of af komt.',
          maak:function(R){
            var it = R.kies([{ wat:'het aantal leden van een sportclub', y:'leden' }, { wat:'het aantal bezoekers van een museum, in duizenden', y:'bezoekers' }, { wat:'het aantal leerlingen van een school, in tientallen', y:'leerlingen' }]);
            var j0 = R.heel(2016, 2019), v, i;
            do { v = [R.heel(40, 120)]; for (i = 1; i <= 5; i++){ var s; do { s = R.heel(-8, 15); } while (!s); v.push(v[i - 1] + s); } } while (v.some(function(x){ return x < 5; }));
            var k = R.heel(1, 5), d = v.map(function(x, i2){ return i2 ? x - v[i2 - 1] : 0; }).slice(1);
            function tab(n){ return R0.teken.tabel([['jaar'].concat(v.map(function(x, i2){ return String(j0 + i2); })), [it.y].concat(v.map(String))], { zijkop:true, nadruk:n >= 1 ? [[1, k + 1]].concat(n >= 2 ? [[1, k]] : []) : [] }); }
            function dia(){
              var lo = Math.min(0, Math.min.apply(null, d)) - 1, hi = Math.max(0, Math.max.apply(null, d)) + 1, g = raster({ x0:0, x1:5, y0:lo, y1:hi, gx:1, gy:1, lx:1, ly:hi - lo > 14 ? 2 : 1, xf:function(t){ return String(j0 + t); }, yt:'toename', B:460, H:240 }), e = '';
              d.forEach(function(h, i2){ e += rc(g.X(i2 + 0.2), g.Y(Math.max(h, 0)), g.X(i2 + 0.8) - g.X(i2 + 0.2), Math.abs(g.Y(h) - g.Y(0)), { f:i2 === k - 1 ? KL[1] : KL[0], fo:i2 === k - 1 ? 0.75 : 0.35, w:1.5 }); });
              return klaar(g, e, 'toenamediagram');
            }
            var bl = function(n){ return n >= 3 ? stapel(tab(n), dia()) : tab(n); };
            return { vraag:'De staaf van ' + (j0 + k - 1) + ' tot ' + (j0 + k) + '?', context:'De tabel geeft ' + it.wat + '. Hoe hoog is de staaf in het toenamediagram van ' + (j0 + k - 1) + ' tot ' + (j0 + k) + '?', beeld:bl, zelfBeeld:tab(0), stappen:[
              S('De waarde aan het eind, in ' + (j0 + k) + ':', v[k], 'Kijk in de tabel bij ' + (j0 + k) + '.'),
              S('De waarde aan het begin, in ' + (j0 + k - 1) + ':', v[k - 1], 'Kijk in de tabel bij ' + (j0 + k - 1) + '.'),
              S('De toename: ' + v[k] + ' ' + MIN + ' ' + v[k - 1] + ' =', d[k - 1], 'Eind min begin. Is het eind kleiner, dan is de toename negatief.', F(d[k - 1], -d[k - 1], 'Andersom: eind min begin.', v[k], 'Dat is de waarde zelf. De staaf is wat erbij kwam.')) ] };
          } },
        { id:'wha-ver-terug', naam:'Van toenamediagram naar de waarden', kort:'Begin bij de beginwaarde en tel de staven een voor een op; een staaf onder de as trek je af',
          uit:'<p>Uit een toenamediagram reken je de waarden terug als je de <b>beginwaarde</b> weet.</p><p>Bij t = 0 is de waarde 20. De staven zijn 3, 5 en ' + MIN + '2. Dan is de waarde bij t = 3: 20 + 3 + 5 + ' + MIN + '2 = <b>26</b>.</p><p>Lees elke staaf goed af. Een staaf <b>onder de as</b> is negatief: daar ging het omlaag.</p>',
          wanneer:'je een toenamediagram en een beginwaarde krijgt en een latere waarde zoekt.',
          maak:function(R){
            var n = 5, h = [], i;
            for (i = 0; i < n; i++){ var s; do { s = R.heel(-5, 8); } while (!s); h.push(s); }
            var b = R.heel(10, 40), k = R.heel(3, 4), lo = Math.min(0, Math.min.apply(null, h)) - 1, hi = Math.max(0, Math.max.apply(null, h)) + 1, som = 0;
            for (i = 0; i < k; i++) som += h[i];
            function dia(m){
              var g = raster({ x0:0, x1:n, y0:lo, y1:hi, gx:1, gy:1, lx:1, ly:1, xt:'t', yt:'toename', B:460, H:Math.max(220, (hi - lo) * 22) }), e = '';
              h.forEach(function(x, j){ var hl = j < m && j < k; e += rc(g.X(j + 0.2), g.Y(Math.max(x, 0)), g.X(j + 0.8) - g.X(j + 0.2), Math.abs(g.Y(x) - g.Y(0)), { f:hl ? KL[1] : KL[0], fo:hl ? 0.75 : 0.35, w:1.5 }); });
              return klaar(g, e, 'toenamediagram');
            }
            var st = [];
            for (i = 0; i < k; i++) st.push(S('De staaf van t = ' + i + ' tot t = ' + (i + 1) + ':', h[i], h[i] < 0 ? 'De staaf staat onder de as: het getal is negatief.' : 'Lees af hoe hoog de staaf komt. Elk hokje is 1.', h[i] < 0 ? F(h[i], -h[i], 'De staaf staat onder de as. Dan is hij negatief.') : null));
            st.push(S('De waarde bij t = ' + k + ': ' + b + ' + ' + h.slice(0, k).map(function(x){ return x < 0 ? '(' + T(x) + ')' : T(x); }).join(' + ') + ' =', b + som, 'Begin bij ' + b + ' en tel alle staven op: samen ' + T(som) + '.', F(b + som, som, 'Vergeet de beginwaarde ' + b + ' niet.', b + h.slice(0, k).reduce(function(a, x){ return a + Math.abs(x); }, 0), 'Een staaf onder de as moet je aftrekken.')));
            return { vraag:'De waarde bij t = ' + k + '?', context:'Het toenamediagram hoort bij een grafiek. Bij t = 0 is de waarde ' + b + '. Bereken de waarde bij t = ' + k + '.', beeld:dia, zelfBeeld:dia(0), stappen:st };
          } },
        { id:'wha-ver-soort', naam:'Toenemend of afnemend stijgen en dalen', kort:'Kijk naar de toenames: positief is stijgen, negatief is dalen; worden ze groter of kleiner?',
          uit:'<p>Met de <b>toenames</b> beschrijf je hoe een grafiek loopt. Zijn ze <b>positief</b>, dan <b>stijgt</b> de grafiek. Zijn ze <b>negatief</b>, dan <b>daalt</b> hij.</p><p>Worden de toenames steeds <b>groter</b> (5, 8, 12), dan stijgt hij steeds sneller: <b>toenemend stijgend</b>. Worden ze <b>kleiner</b> (12, 8, 5): <b>afnemend stijgend</b>.</p><p>Bij dalen kijk je naar hoe groot de daling is. ' + MIN + '3, ' + MIN + '6, ' + MIN + '10 daalt steeds sneller: <b>toenemend dalend</b>. ' + MIN + '10, ' + MIN + '6, ' + MIN + '3 daalt steeds langzamer: <b>afnemend dalend</b>.</p>',
          wanneer:'je moet beschrijven hoe een grafiek stijgt of daalt.',
          maak:function(R){
            var OPT = ['toenemend stijgend', 'afnemend stijgend', 'toenemend dalend', 'afnemend dalend'], soort = R.heel(0, 3), m;
            do { m = [R.heel(1, 15), R.heel(1, 15), R.heel(1, 15)].sort(function(a, b){ return a - b; }); } while (m[0] === m[1] || m[1] === m[2]);
            if (soort === 1 || soort === 3) m.reverse();
            var d = m.map(function(x){ return soort >= 2 ? -x : x; }), v = [soort >= 2 ? R.heel(60, 100) : R.heel(10, 50)];
            for (var i = 0; i < 3; i++) v.push(v[i] + d[i]);
            function tab(){ return R0.teken.tabel([['t', '0', '1', '2', '3'], ['y'].concat(v.map(String))], { zijkop:true }); }
            return { vraag:'tabel ' + v.join(' '), vraagHtml:'Hoe loopt de grafiek?', context:'Bekijk de tabel. Bereken de toenames en beschrijf hoe de grafiek loopt.', opties:OPT, goed:soort, beeld:tab, zelfBeeld:tab(), stappen:[
              S('De toename van t = 0 tot t = 1: ' + v[1] + ' ' + MIN + ' ' + v[0] + ' =', d[0], 'Eind min begin.'),
              S('De toename van t = 1 tot t = 2: ' + v[2] + ' ' + MIN + ' ' + v[1] + ' =', d[1], 'Eind min begin.'),
              S('De toename van t = 2 tot t = 3: ' + v[3] + ' ' + MIN + ' ' + v[2] + ' =', d[2], 'Eind min begin.'),
              K(R, 'De toenames zijn ' + d.map(T).join(', ') + '. Hoe loopt de grafiek?', OPT[soort], [], (soort < 2 ? 'De toenames zijn positief: stijgend. ' : 'De toenames zijn negatief: dalend. ') + (soort === 0 || soort === 2 ? 'Ze worden steeds groter (zonder min-teken): toenemend.' : 'Ze worden steeds kleiner (zonder min-teken): afnemend.'), { orde:OPT }) ] };
          } },
        { id:'wha-ver-diff', naam:'Het differentiequotiënt', kort:'De gemiddelde verandering op [a, b]: Δy : Δx = (y bij b − y bij a) : (b − a)',
          uit:'<p>Het <b>differentiequotiënt</b> is de <b>gemiddelde verandering</b> op een interval. Op de grafiek is het de helling van de rechte lijn tussen twee punten.</p><p>Bij h = ' + MIN + '5t² + 20t op het interval [1, 3]: h(1) = 15 en h(3) = 15. Δh = 15 ' + MIN + ' 15 = 0 en Δt = 3 ' + MIN + ' 1 = 2. Het differentiequotiënt is 0 : 2 = <b>0</b>.</p><p>Zo reken je: vul beide grenzen in, trek de uitkomsten af (<b>Δy</b>) en deel door het verschil van de grenzen (<b>Δx</b>).</p>',
          wanneer:'je wilt weten hoe snel iets gemiddeld verandert tussen twee momenten.',
          maak:function(R){
            var soort = R.heel(0, 2), f, form, x1, x2, eh, zin;
            if (soort === 0){ var b = R.kies([20, 25, 30]), c = R.heel(1, 3); f = function(t){ return -5 * t * t + b * t + c; }; form = 'h = ' + MIN + '5t² + ' + b + 't + ' + c;
              zin = 'Een bal wordt omhoog gegooid. De hoogte in meter na t seconden is ' + form + '.'; eh = 'meter per seconde'; x1 = R.heel(0, 2); x2 = R.heel(x1 + 1, 4); }
            else if (soort === 1){ var bb = R.heel(2, 6), cc = R.heel(10, 40); f = function(t){ return 0.5 * t * t + bb * t + cc; }; form = 'N = 0,5t² + ' + bb + 't + ' + cc;
              zin = 'Het aantal bezoekers van een website in honderden is ' + form + ', met t in weken.'; eh = 'honderd bezoekers per week'; do { x1 = R.heel(0, 6); x2 = R.heel(x1 + 2, 10); } while ((x1 + x2) % 2); }
            else { var e = R.kies([[400, 1.5], [50, 2], [100, 3], [200, 1.5], [80, 2.5]]); f = function(t){ return e[0] * Math.pow(e[1], t); }; form = 'N = ' + e[0] + ' · ' + T(e[1]) + '^t';
              zin = 'Het aantal bacteriën in duizenden is ' + form + ', met t in uren.'; eh = 'duizend per uur'; x1 = R.heel(0, 2); x2 = x1 + R.kies([1, 2]); }
            var y1 = rnd(f(x1), 6), y2 = rnd(f(x2), 6), dy = rnd(y2 - y1, 6), dx = x2 - x1, q = dy / dx;
            var L = form.charAt(0);
            return { vraag:'Δ' + L + ' : Δt op [' + x1 + ', ' + x2 + ']?', context:zin + ' Bereken het differentiequotiënt op het interval [' + x1 + ', ' + x2 + '].', eenheid:eh, stappen:[
              S('Vul t = ' + x1 + ' in: ' + L + ' =', y1, 'Reken ' + form + ' uit met t = ' + x1 + '.'),
              S('Vul t = ' + x2 + ' in: ' + L + ' =', y2, 'Reken ' + form + ' uit met t = ' + x2 + '.'),
              S('Δ' + L + ' = ' + T(y2) + ' ' + MIN + ' ' + T(y1) + ' =', dy, 'De waarde aan het eind min de waarde aan het begin.'),
              S('Δ' + L + ' : Δt = ' + T(dy) + ' : ' + dx + ' =', T(rnd(q, 6)), 'Δt = ' + x2 + ' ' + MIN + ' ' + x1 + ' = ' + dx + '. Deel de verandering door ' + dx + '.', F(T(rnd(q, 6)), T(dy), 'Dat is de totale verandering. Deel nog door Δt = ' + dx + '.'), { e:eh }) ] };
          } },
        { id:'wha-ver-raak', naam:'De helling in een punt met een raaklijn', kort:'Lees twee punten op de raaklijn af en bereken Δy : Δx; dat is de helling van de grafiek in dat punt',
          uit:'<p>Een kromme grafiek heeft in elk punt een andere <b>helling</b>. De helling in punt P is de helling van de <b>raaklijn</b>: de rechte lijn die de grafiek in P raakt.</p><p>Lees <b>twee punten op de raaklijn</b> af, het liefst op de hoeken van hokjes. Bijvoorbeeld P(2, 3) en (4, 7). Dan is Δy = 7 ' + MIN + ' 3 = 4 en Δx = 4 ' + MIN + ' 2 = 2.</p><p>De helling is <b>Δy : Δx</b> = 4 : 2 = <b>2</b>. Gaat de raaklijn omlaag, dan is de helling negatief.</p>',
          wanneer:'je de helling of de snelheid van verandering in één punt van een grafiek zoekt.',
          maak:function(R){
            var c, hx, v, p, m, fp, d, y2, ok, f;
            do { c = R.kies([0.5, -0.5, 1, -1, 0.25]); hx = R.heel(2, 8); v = c > 0 ? R.heel(0, 3) : R.heel(8, 11); p = R.heel(1, 9);
              m = 2 * c * (p - hx); fp = c * (p - hx) * (p - hx) + v; d = R.kies([1, 2, 3]); if (p + d > 10) d = -d; y2 = fp + m * d;
              f = function(x){ return c * (x - hx) * (x - hx) + v; };
              ok = m !== 0 && Math.abs(m - Math.round(m)) < 1e-9 && Math.abs(fp - Math.round(fp)) < 1e-9 && Math.abs(y2 - Math.round(y2)) < 1e-9 && fp >= -1 && fp <= 11 && y2 >= -1 && y2 <= 11 && Math.abs(m) <= 4;
            } while (!ok);
            var xb = p + d, X1 = Math.min(p, xb), X2 = Math.max(p, xb), Y1 = d > 0 ? fp : y2, Y2 = d > 0 ? y2 : fp, dy = Y2 - Y1, dxx = X2 - X1;
            function tek(n){
              var g = raster({ x0:0, x1:10, y0:-2, y1:12, gx:1, gy:1, lx:1, ly:2, xt:'x', yt:'y', B:460, H:420 }), e = '', pts = [], segs = [];
              for (var x = 0; x <= 10.0001; x += 0.05){ var yv = f(x); if (yv < -2 || yv > 12){ if (pts.length) segs.push(pts); pts = []; continue; } pts.push([g.X(x), g.Y(yv)]); }
              if (pts.length) segs.push(pts);
              segs.forEach(function(s2){ if (s2.length > 1) e += pl(s2, KL[0], 3); });
              var xa = 0, xe = 10; if (m > 0){ xa = Math.max(0, p + (-2 - fp) / m); xe = Math.min(10, p + (12 - fp) / m); } else { xa = Math.max(0, p + (12 - fp) / m); xe = Math.min(10, p + (-2 - fp) / m); }
              e += ln(g.X(xa), g.Y(fp + m * (xa - p)), g.X(xe), g.Y(fp + m * (xe - p)), { k:KL[1], w:2.5 });
              if (n >= 3) e += ln(g.X(X1), g.Y(Y1), g.X(X2), g.Y(Y1), { k:KL[3], w:2.5, dash:'6 4' }) + ln(g.X(X2), g.Y(Y1), g.X(X2), g.Y(Y2), { k:KL[3], w:2.5, dash:'6 4' });
              e += stip(g.X(p), g.Y(fp), 'var(--ink)', 6) + tx(g.X(p) + (m > 0 ? -10 : 10), g.Y(fp) - 10, 'P', { vet:true, a:m > 0 ? 'end' : 'start' });
              if (n >= 2) e += stip(g.X(xb), g.Y(y2), KL[1], 6);
              return klaar(g, e, 'grafiek met raaklijn in P');
            }
            return { vraag:'De helling in P?', context:'De kromme is een grafiek. De rechte lijn is de raaklijn in punt P (bij x = ' + p + '). Bereken de helling van de grafiek in P.', beeld:tek, zelfBeeld:tek(0), stappen:[
              S('Lees af: de y-coördinaat van P (bij x = ' + p + '):', fp, 'Ga vanaf x = ' + p + ' recht omhoog of omlaag naar het punt P en kijk naar de y-as.'),
              S('Lees op de raaklijn af: y bij x = ' + xb + ':', y2, 'Ga ' + Math.abs(d) + ' hokje' + (Math.abs(d) > 1 ? 's' : '') + ' naar ' + (d > 0 ? 'rechts' : 'links') + ' en kijk waar de raaklijn dan is. Niet de kromme!', F(y2, Math.round(f(xb) * 10) / 10, 'Dat is de kromme. Lees af op de rechte raaklijn.')),
              S('Δy = ' + T(Y2) + ' ' + MIN + ' ' + T(Y1) + ' =', dy, 'Het rechter punt min het linker punt.'),
              S('De helling: Δy : Δx = ' + T(dy) + ' : ' + dxx + ' =', m, 'Δx = ' + X2 + ' ' + MIN + ' ' + X1 + ' = ' + dxx + '.', F(m, -m, 'Let op het teken: gaat de raaklijn omhoog of omlaag?', dy, 'Deel nog door Δx = ' + dxx + '.')) ] };
          } }
      ] }
  ]);
})();
