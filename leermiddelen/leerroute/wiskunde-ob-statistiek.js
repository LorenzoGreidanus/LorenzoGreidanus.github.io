/* De leerroute wiskunde: statistiek en kans voor de onderbouw en het vmbo.
   Onderbouw: gemiddelde, mediaan, modus en spreidingsbreedte (en welke centrummaat past),
   turven, relatieve frequentie, frequentietabellen en klassen, staaf-, lijn- en
   cirkeldiagrammen, kansen met een dobbelsteen en een rooster, en aantallen tellen met
   een wegendiagram, een boomdiagram of de vermenigvuldigingsregel.
   Vmbo: cumulatieve frequentie, de somfrequentiepolygoon, het steelbladdiagram, het
   histogram, kansen uit een kruistabel, de complementregel en de verwachting.
   Het gemiddelde bij klassen, kwartielen, de boxplot en kansbomen staan in wiskunde-statistiek.js.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '·';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.02; }
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a || 1; }
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }
  function opv(l){ return l.slice().sort(function(a, b){ return a - b; }); }
  function med(a){ var m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; }
  function macht(a, k){ var p = 1; for (var i = 0; i < k; i++) p *= a; return p; }
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
  /* afronden op 1 decimaal: 7 mag ook als 7,0 */
  function d1(x){ var r = rnd(x, 1); return uniek([T(r), T(r, { dec:1, vast:true })]); }
  function pAnt(p){ var a = d1(p); return uniek(a.concat(a.map(function(x){ return x + '%'; })).concat(a.map(function(x){ return x + ' %'; }))); }
  function gAnt(x, eh){ return uniek([T(x), T(x) + eh]); }
  /* s : n als tekst, met ... als het niet precies uitkomt */
  function deel(s, n){ var g = s / n, r = rnd(g, 4); return T(r) + (Math.abs(g - r) > 1e-9 ? '…' : ''); }
  function metPunt(t){ return /…$/.test(t) ? t : t + '.'; }
  function lopend(l){ var t = l[0], u = []; for (var i = 1; i < l.length; i++){ u.push(T(t) + ' + ' + T(l[i]) + ' = ' + T(t + l[i])); t += l[i]; } return u.join(', '); }
  /* breuken en kansen */
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
  /* een kans als kommagetal (precies), maar een gelijke breuk mag ook */
  function decStap(tekst, t, n, hint, fout){ return S(tekst, [T(t / n)].concat(brAnt(t, n)), hint, fout, { controle:kansC(t, n) }); }
  function kansOp(op, t, n){ op.antwoord = brAnt(t, n); op.controle = kansC(t, n); op.invoer = 'tekst'; return op; }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  function rij(l){ return l.map(T).join('   '); }
  /* een getal N verdelen in k stukken van minstens lo */
  function verdeel(R, N, k, lo){
    for (var t = 0; t < 400; t++){
      var p = [], rest = N, ok = true;
      for (var i = 0; i < k - 1; i++){ var hi = Math.floor((rest - lo * (k - 1 - i)) * 0.6); if (hi < lo){ ok = false; break; } var x = R.heel(lo, hi); p.push(x); rest -= x; }
      if (ok && rest >= lo){ p.push(rest); return R.hussel(p); }
    }
    var b = Math.floor(N / k), q = []; for (var j = 0; j < k; j++) q.push(b); q[0] += N - b * k; return q;
  }
  function rijen(l, per){ var r = []; for (var i = 0; i < l.length; i += per){ var x = l.slice(i, i + per).map(String); if (l.length > per) while (x.length < per) x.push(''); r.push(x); } return r; }
  function plekken(l, per, f){ var p = []; l.forEach(function(v, i){ if (f(v, i)) p.push([Math.floor(i / per), i % per]); }); return p; }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">' + Array.prototype.slice.call(arguments).join('') + '</div>'; }
  function notitie(t){ return '<p style="margin:0;font-size:.92em">' + t + '</p>'; }
  var MATEN = ['het gemiddelde', 'de mediaan', 'de modus'];

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + Math.round(max) + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600)];
    if (o.k) st.push('fill:' + o.k);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" style="' + st.join(';') + '">' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + '"/>'; }
  function cirk(x, y, r, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + (o.f || 'var(--ink)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'none') + ';stroke-width:' + (o.w || 0) + '"/>'; }

  /* het raster met een verticale as: van 0 tot max, een lijn per stap, een getal per 'elk' stappen */
  var AS = { L:62, T:30, PW:470, PH:230 };
  function raster(max, stap, elk, yas){
    var s = '';
    function y(v){ return AS.T + AS.PH - v / max * AS.PH; }
    for (var v = 0, i = 0; v <= max + 1e-9; v += stap, i++){
      s += ln(AS.L, y(v), AS.L + AS.PW, y(v), { w:1, op:v === 0 ? 1 : 0.2 });
      if (i % elk === 0) s += ln(AS.L - 6, y(v), AS.L, y(v), { w:2 }) + tx(AS.L - 10, y(v) + 5, T(v), { fs:13, a:'end' });
    }
    s += ln(AS.L, AS.T - 8, AS.L, AS.T + AS.PH, { w:2 }) + ln(AS.L, AS.T + AS.PH, AS.L + AS.PW, AS.T + AS.PH, { w:2 });
    if (yas) s += tx(6, 14, yas, { fs:12, a:'start' });
    return { s:s, y:y };
  }
  function leeslijn(x, yv, v, o){ o = o || {}; return ln(AS.L, yv, x, yv, { k:KL[1], w:2, dash:'5 4' }) + (o.omlaag ? ln(x, yv, x, AS.T + AS.PH, { k:KL[1], w:2, dash:'5 4' }) : '') + tx(AS.L + 6, yv - 6, T(v), { fs:13, vet:true, k:KL[1], a:'start' }); }
  /* staafdiagram: cats, vals; o: max, stap, elk, nad:[i], lees:[i], yas */
  function staaf(cats, vals, o){
    o = o || {};
    var r = raster(o.max, o.stap, o.elk || 1, o.yas), s = r.s, n = cats.length, bw = AS.PW / n;
    cats.forEach(function(c, j){
      var x = AS.L + j * bw + bw * 0.2, w = bw * 0.6, nad = (o.nad || []).indexOf(j) >= 0;
      s += rc(x, r.y(vals[j]), w, r.y(0) - r.y(vals[j]), { f:nad ? KL[1] : KL[0], fo:nad ? 0.8 : 0.5, w:1.5 });
      s += tx(x + w / 2, AS.T + AS.PH + 22, c, { fs:13 });
      if ((o.lees || []).indexOf(j) >= 0) s += leeslijn(x, r.y(vals[j]), vals[j]);
    });
    return svg(AS.L + AS.PW + 20, AS.T + AS.PH + 40, s, o.aria || 'staafdiagram', 600);
  }
  /* lijndiagram: labels op de x-as, waarden; o.lees:[i] */
  function lijnD(xs, vals, o){
    o = o || {};
    var r = raster(o.max, o.stap, o.elk || 1, o.yas), s = r.s, n = xs.length;
    function x(j){ return AS.L + 24 + j * (AS.PW - 48) / (n - 1); }
    xs.forEach(function(t, j){ s += ln(x(j), AS.T, x(j), AS.T + AS.PH, { w:1, op:0.12 }) + ln(x(j), AS.T + AS.PH, x(j), AS.T + AS.PH + 6, { w:2 }) + tx(x(j), AS.T + AS.PH + 24, t, { fs:13 }); });
    s += '<polyline points="' + vals.map(function(v, j){ return n1(x(j)) + ',' + n1(r.y(v)); }).join(' ') + '" style="fill:none;stroke:' + KL[0] + ';stroke-width:3;stroke-linejoin:round"/>';
    (o.lees || []).forEach(function(j){ s += leeslijn(x(j), r.y(vals[j]), vals[j], { omlaag:true }); });
    vals.forEach(function(v, j){ s += cirk(x(j), r.y(v), 5, { f:(o.lees || []).indexOf(j) >= 0 ? KL[1] : KL[0] }); });
    return svg(AS.L + AS.PW + 20, AS.T + AS.PH + 40, s, o.aria || 'lijndiagram', 600);
  }
  /* histogram: grenzen g0..gk, frequenties; o.nad:[i] */
  function histo(g, f, o){
    o = o || {};
    var r = raster(o.max, o.stap, o.elk || 1, o.yas), s = r.s, g0 = g[0], gk = g[g.length - 1];
    function x(v){ return AS.L + 10 + (v - g0) / (gk - g0) * (AS.PW - 30); }
    f.forEach(function(v, j){ var nad = (o.nad || []).indexOf(j) >= 0; s += rc(x(g[j]), r.y(v), x(g[j + 1]) - x(g[j]), r.y(0) - r.y(v), { f:nad ? KL[1] : KL[0], fo:nad ? 0.75 : 0.45, w:1.8 }); });
    (o.lees || []).forEach(function(j){ s += leeslijn(x(g[j]), r.y(f[j]), f[j]); });
    g.forEach(function(v){ s += ln(x(v), AS.T + AS.PH, x(v), AS.T + AS.PH + 6, { w:2 }) + tx(x(v), AS.T + AS.PH + 24, T(v), { fs:13 }); });
    if (o.xas) s += tx(AS.L + AS.PW + 14, AS.T + AS.PH + 40, o.xas, { fs:12, a:'end' });
    return svg(AS.L + AS.PW + 20, AS.T + AS.PH + 46, s, o.aria || 'histogram', 600);
  }
  /* somfrequentiepolygoon: grenzen g0..gk, cumulatief c0..ck (c0 = 0); o.lees:[index van een grens] */
  function somPoly(g, c, o){
    o = o || {};
    var r = raster(o.max, o.stap, o.elk || 1, o.yas), s = r.s, g0 = g[0], gk = g[g.length - 1];
    function x(v){ return AS.L + 10 + (v - g0) / (gk - g0) * (AS.PW - 30); }
    g.forEach(function(v){ s += ln(x(v), AS.T, x(v), AS.T + AS.PH, { w:1, op:0.2 }) + ln(x(v), AS.T + AS.PH, x(v), AS.T + AS.PH + 6, { w:2 }) + tx(x(v), AS.T + AS.PH + 24, T(v), { fs:13 }); });
    s += '<polyline points="' + g.map(function(v, j){ return n1(x(v)) + ',' + n1(r.y(c[j])); }).join(' ') + '" style="fill:none;stroke:' + KL[0] + ';stroke-width:3;stroke-linejoin:round"/>';
    (o.lees || []).forEach(function(j){ s += leeslijn(x(g[j]), r.y(c[j]), c[j], { omlaag:true }); });
    g.forEach(function(v, j){ s += cirk(x(v), r.y(c[j]), 4.5, { f:(o.lees || []).indexOf(j) >= 0 ? KL[1] : KL[0] }); });
    if (o.xas) s += tx(AS.L + AS.PW + 14, AS.T + AS.PH + 40, o.xas, { fs:12, a:'end' });
    return svg(AS.L + AS.PW + 20, AS.T + AS.PH + 46, s, o.aria || 'somfrequentiepolygoon', 600);
  }
  /* cirkeldiagram: delen in graden (samen 360), legenda-teksten; o.nad:[i] */
  function cirkel(delen, leg, o){
    o = o || {};
    var cx = 120, cy = 120, r = 104, a = -90, s = '';
    function pt(g){ var rad = g * Math.PI / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; }
    delen.forEach(function(d, i){
      var a2 = a + d, p1 = pt(a), p2 = pt(a2), nad = (o.nad || []).indexOf(i) >= 0;
      s += '<path d="M' + cx + ' ' + cy + ' L' + n1(p1[0]) + ' ' + n1(p1[1]) + ' A' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 1 ' + n1(p2[0]) + ' ' + n1(p2[1]) + ' Z" style="fill:' + KL[i % 5] + ';fill-opacity:' + (nad ? 0.95 : 0.55) + ';stroke:var(--kaart);stroke-width:2.5"/>';
      a = a2;
    });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    leg.forEach(function(t, i){ var y = 52 + i * 36, nad = (o.nad || []).indexOf(i) >= 0;
      s += rc(256, y - 14, 20, 20, { rx:4, f:KL[i % 5], fo:nad ? 0.95 : 0.55, w:1.5 }) + tx(286, y + 2, t, { fs:15, a:'start', vet:nad, k:nad ? KL[1] : null }); });
    return svg(480, 244, s, o.aria || 'cirkeldiagram', 540);
  }
  /* zes dobbelsteenvlakken; nad: lijst van ogen die opvallen */
  var PIPS = { 1:[[1, 1]], 2:[[0, 0], [2, 2]], 3:[[0, 0], [1, 1], [2, 2]], 4:[[0, 0], [2, 0], [0, 2], [2, 2]], 5:[[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6:[[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  function stenen(nad){
    var s = '';
    for (var k = 1; k <= 6; k++){
      var x = 8 + (k - 1) * 68, y = 8, h = (nad || []).indexOf(k) >= 0;
      s += rc(x, y, 56, 56, { rx:10, f:h ? KL[1] : 'var(--kaart)', fo:h ? 0.25 : 1, s:h ? KL[1] : 'var(--ink)', w:h ? 3 : 2 });
      PIPS[k].forEach(function(p){ s += cirk(x + 12 + p[0] * 16, y + 12 + p[1] * 16, 5); });
    }
    return svg(8 + 6 * 68, 72, s, 'de zes kanten van een dobbelsteen', 460);
  }
  /* turftabel: rijen [{naam, n}], nad = index die opvalt */
  function turf(rijenT, nad){
    var s = '', mg = 0;
    rijenT.forEach(function(r, i){
      var y = 8 + i * 40, h = nad === i, k = h ? KL[1] : null;
      s += tx(112, y + 24, r.naam, { fs:15, a:'end', vet:h, k:k });
      for (var j = 0; j < r.n; j++){ var g = Math.floor(j / 5), p = j % 5, x0 = 128 + g * 52;
        if (p < 4) s += ln(x0 + p * 9, y + 8, x0 + p * 9, y + 32, { w:2.4, k:k });
        else s += ln(x0 - 5, y + 28, x0 + 32, y + 12, { w:2.4, k:k });
      }
      mg = Math.max(mg, Math.ceil(r.n / 5));
    });
    return svg(128 + mg * 52 + 16, rijenT.length * 40 + 12, s, 'turftabel', 460);
  }
  /* rooster van twee dobbelstenen: f(a, b) is de tekst in het vakje, nad(a, b) valt op */
  function rooster2(teken, f, nad){
    var r = [[teken, '1', '2', '3', '4', '5', '6']], p = [];
    for (var a = 1; a <= 6; a++){ var x = [String(a)]; for (var b = 1; b <= 6; b++){ x.push(String(f(a, b))); if (nad && nad(a, b)) p.push([a, b]); } r.push(x); }
    return R0.teken.tabel(r, { kop:true, zijkop:true, nadruk:p });
  }
  /* wegen tussen punten: elke weg een boogje */
  var OFF = { 1:[0], 2:[-30, 30], 3:[-50, 0, 50], 4:[-66, -22, 22, 66] };
  function weg(p, q, off){ var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L, ny = dx / L;
    return '<path d="M' + n1(p[0]) + ' ' + n1(p[1]) + ' Q' + n1(mx + nx * off) + ' ' + n1(my + ny * off) + ' ' + n1(q[0]) + ' ' + n1(q[1]) + '" style="fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round"/>'; }
  function bundel(p, q, k, offs){ return (offs || OFF[k]).map(function(o){ return weg(p, q, o); }).join(''); }
  function punt(p, naam, lab, onder){
    var s = cirk(p[0], p[1], 17, { f:'var(--kaart)', s:'var(--ink)', w:2.5 }) + tx(p[0], p[1] + 6, naam, { fs:17, vet:true });
    if (lab != null){ var y = onder ? p[1] + 26 : p[1] - 52; s += rc(p[0] - 24, y, 48, 26, { rx:8, f:'var(--kaart)', s:KL[1], w:2 }) + tx(p[0], y + 19, String(lab), { fs:15, vet:true, k:KL[1] }); }
    return s;
  }
  /* v: { soort:'direct'|'twee'|'keten', a, b, c, d, e }; lab: de getallen bij de punten (of null) */
  function wegen(v, lab){
    lab = lab || {};
    var s = '', A, B, C, D;
    if (v.soort === 'direct'){
      A = [60, 145]; B = [270, 145]; C = [480, 145];
      s += bundel(A, B, v.a) + bundel(B, C, v.b) + bundel(A, C, v.d, v.d === 1 ? [-250] : [-250, 250]);
      s += punt(A, 'A', lab.A) + punt(B, 'B', lab.B) + punt(C, 'C', lab.C);
      return svg(540, 290, s, 'wegenkaart van A via B naar C', 560);
    }
    if (v.soort === 'twee'){
      A = [60, 150]; B = [270, 64]; C = [270, 236]; D = [480, 150];
      s += bundel(A, B, v.a) + bundel(B, D, v.b) + bundel(A, C, v.c) + bundel(C, D, v.e);
      s += punt(A, 'A', lab.A) + punt(B, 'B', lab.B) + punt(C, 'C', lab.C, true) + punt(D, 'D', lab.D);
      return svg(540, 300, s, 'wegenkaart van A via B of C naar D', 560);
    }
    A = [50, 140]; B = [200, 140]; C = [350, 140]; D = [500, 140];
    s += bundel(A, B, v.a) + bundel(B, C, v.b) + bundel(C, D, v.c);
    s += punt(A, 'A', lab.A) + punt(B, 'B', lab.B) + punt(C, 'C', lab.C) + punt(D, 'D', lab.D);
    return svg(550, 200, s, 'wegenkaart van A naar D', 560);
  }
  /* boomdiagram om te tellen: niv = labels per niveau; o.tot = hoeveel niveaus getekend; o.nad(pad) = eindtak valt op; o.blad = uitkomst achter elk eindje */
  function boomT(niv, o){
    o = o || {};
    var d = niv.length, tot = o.tot == null ? d : o.tot, maat = niv.map(function(l){ return l.length; });
    var bladen = maat.reduce(function(a, b){ return a * b; }, 1), rijH = bladen > 8 ? 26 : 32;
    var bw = niv.map(function(l){ return Math.max.apply(null, l.map(function(t){ return String(t).length; })) * 8.4 + 4; });
    var Xs = [18]; for (var l = 0; l < d; l++) Xs.push(Xs[l] + (l === 0 ? 8 : bw[l - 1]) + 44);
    function onder(l){ var p = 1; for (var j = l; j < d; j++) p *= maat[j]; return p; }
    function Y(p){ var e = 0; for (var j = 0; j < p.length; j++) e += p[j] * onder(j + 1); return 16 + (e + onder(p.length) / 2) * rijH; }
    var s = '';
    function teken(p){
      var l = p.length;
      if (l === d){ if (o.blad && tot === d){ var h = o.nad && o.nad(p); s += tx(Xs[d] + bw[d - 1] + 22, Y(p) + 5, p.map(function(c, j){ return niv[j][c]; }).join(''), { fs:14, a:'start', vet:!!h, k:h ? KL[1] : null }); } return; }
      if (l >= tot) return;
      var ya = Y(p), xa = l === 0 ? Xs[0] + 5 : Xs[l] + bw[l - 1];
      for (var c = 0; c < maat[l]; c++){
        var q = p.concat([c]), yb = Y(q), hl = o.nad && q.length === d && o.nad(q);
        s += ln(xa, ya, Xs[l + 1] - 6, yb, { w:hl ? 3 : 1.6, k:hl ? KL[1] : null });
        s += tx(Xs[l + 1], yb + 5, niv[l][c], { a:'start', fs:14, vet:true, k:hl ? KL[1] : null });
        teken(q);
      }
    }
    s += cirk(Xs[0], Y([]), 4.5);
    teken([]);
    var W = Xs[d] + bw[d - 1] + (o.blad ? 70 : 16), H = bladen * rijH + 30;
    return svg(W, H, s, o.aria || 'boomdiagram', Math.min(560, W * 1.3));
  }

  /* ================= de verhalen ================= */
  var GEM_IT = [
    { wat:'de aantallen doelpunten per wedstrijd van een voetbalteam', eh:'doelpunten', lo:0, hi:6 },
    { wat:'de temperaturen om 12 uur op een paar dagen', eh:'°C', lo:8, hi:22 },
    { wat:'de scores van een groep leerlingen bij een quiz', eh:'punten', lo:10, hi:40 },
    { wat:'de fietstijden van een groep leerlingen naar school', eh:'minuten', lo:5, hi:35 },
    { wat:'de lengtes van een paar zonnebloemen na een maand', eh:'cm', lo:12, hi:30 },
    { wat:'de aantallen appjes die een paar vrienden op een dag sturen', eh:'appjes', lo:10, hi:60 } ];
  var WOORD_IT = [
    { vr:'Hoe kom je naar school?', w:['fiets', 'bus', 'lopend', 'auto', 'scooter'] },
    { vr:'Wat is je lievelingsdier?', w:['hond', 'kat', 'konijn', 'paard', 'vis'] },
    { vr:'Welke sport doe je?', w:['voetbal', 'hockey', 'tennis', 'judo', 'zwemmen'] },
    { vr:'Welk fruit eet je het liefst?', w:['appel', 'banaan', 'aardbei', 'peer', 'mango'] } ];
  var KLAS_IT = [
    { wat:'de lengtes van leerlingen', eh:'cm', lo:146, hi:183, w:10, s:140 },
    { wat:'de reistijden naar school', eh:'minuten', lo:3, hi:47, w:10, s:0 },
    { wat:'de punten bij een toets', eh:'punten', lo:21, hi:78, w:10, s:20 },
    { wat:'de gewichten van leerlingen', eh:'kg', lo:38, hi:69, w:10, s:30 } ];

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= centrummaten (onderbouw) ================= */
    { groep:{ id:'wst-centrum', niveau:'onderbouw', domein:'statistiek', naam:'Gemiddelde, mediaan en modus',
        uit:'De drie centrummaten en de spreidingsbreedte: hoe je ze uitrekent en welke het beste past bij een rij gegevens.' },
      doelen:[
        { id:'wst-gem', naam:'Het gemiddelde', kort:'Tel alle getallen op en deel de som door hoeveel getallen het zijn',
          uit:'<p>Het <b>gemiddelde</b> reken je zo uit: tel <b>alle getallen op</b> en deel de som door <b>hoeveel getallen</b> het zijn.</p><p>Voorbeeld: 4, 7, 6 en 7. Samen is dat 24. Het zijn 4 getallen. 24 : 4 = <b>6</b>.</p><p>Het gemiddelde is wat iedereen krijgt als je alles <b>eerlijk verdeelt</b>. Het hoeft zelf niet in de rij te staan.</p>',
          wanneer:'je wilt weten hoeveel het per keer of per persoon is als je alles eerlijk verdeelt.',
          maak:function(R){
            var it = R.kies(GEM_IT), n = R.heel(5, 8), l, s, g;
            do { l = []; for (var i = 0; i < n; i++) l.push(R.heel(it.lo, it.hi)); s = som(l); g = s / n; } while (grens(g, 1));
            return { vraag:rij(l), context:'Dit zijn ' + it.wat + '. Bereken het gemiddelde. Rond af op 1 decimaal.', eenheid:it.eh, antwoord:d1(g), stappen:[
              S('Hoeveel getallen zijn het?', n, 'Tel ze een voor een: het zijn er ' + n + '.'),
              S('Tel ze op: ' + l.map(T).join(' + ') + ' =', s, 'Tel ze een voor een op: ' + lopend(l) + '.', F(s, n, 'Dat is het aantal getallen. Tel nu de getallen zelf op.')),
              S('Het gemiddelde: ' + T(s) + ' : ' + n + ' ≈ (rond af op 1 decimaal)', d1(g), T(s) + ' : ' + n + ' = ' + metPunt(deel(s, n)) + ' Rond af op 1 decimaal.', F(d1(g), rnd(s / (n - 1), 1), 'Deel door ' + n + ': zoveel getallen zijn het.', rnd(s / (n + 1), 1), 'Deel door ' + n + ': zoveel getallen zijn het.'), { e:it.eh }) ] };
          } },
        { id:'wst-med-oneven', naam:'De mediaan bij een oneven aantal', kort:'Zet de getallen op volgorde; de mediaan is het getal precies in het midden',
          uit:'<p>De <b>mediaan</b> is het <b>middelste getal</b>. Zet de getallen eerst <b>op volgorde</b>, van klein naar groot.</p><p>Bij een oneven aantal is er precies één getal in het midden. Bij 7 getallen is dat nummer 4: (7 + 1) : 2 = 4. Er staan dan 3 getallen voor en 3 na.</p><p>Voorbeeld: 8, 3, 5, 9, 4. Op volgorde: 3, 4, <b>5</b>, 8, 9. De mediaan is 5.</p>',
          wanneer:'je het middelste getal zoekt en het aantal getallen oneven is.',
          maak:function(R){
            var it = R.kies(GEM_IT), n = R.kies([5, 7, 9]), m = (n + 1) / 2, l, o, M;
            do { l = []; for (var i = 0; i < n; i++) l.push(R.heel(it.lo, it.hi)); o = opv(l); M = o[m - 1]; } while (l[m - 1] === M || l.join() === o.join());
            function bl(k){ return R0.teken.tabel([k >= 1 ? o.map(T) : l.map(T)], { nadruk:k >= 3 ? [[0, m - 1]] : [] }); }
            return { vraag:rij(l), context:'Dit zijn ' + it.wat + '. Wat is de mediaan?', eenheid:it.eh, beeld:bl, stappen:[
              S('Zet de getallen op volgorde, van klein naar groot. Welk getal komt vooraan?', o[0], 'Zoek het kleinste getal. Op volgorde: ' + o.map(T).join(', ') + '.'),
              S('Bij ' + n + ' getallen staat het middelste op plek nummer', m, '(' + n + ' + 1) : 2 = ' + m + '. Dan staan er ' + (m - 1) + ' getallen voor en ' + (m - 1) + ' na.', F(m, M, 'Je zoekt hier eerst de plek, nog niet het getal.', n / 2, 'Bij een oneven aantal: (' + n + ' + 1) : 2.')),
              S('Getal nummer ' + m + ' in de rij op volgorde. De mediaan is:', M, 'Op volgorde: ' + o.map(T).join(', ') + '. Tel tot nummer ' + m + '.', F(M, l[m - 1], 'Dat is het middelste getal van de rij zoals hij er stond. Zet de getallen eerst op volgorde.'), { e:it.eh }) ] };
          } },
        { id:'wst-med-even', naam:'De mediaan bij een even aantal', kort:'Bij een even aantal staan er twee getallen in het midden; de mediaan ligt precies ertussen',
          uit:'<p>Bij een <b>even aantal</b> getallen is er geen getal precies in het midden. Er staan er <b>twee</b> in het midden.</p><p>Bij 8 getallen zijn dat nummer 4 en nummer 5. De mediaan ligt <b>precies ertussen</b>: tel ze op en deel door 2.</p><p>Voorbeeld: 2, 4, 5, <b>7</b>, <b>9</b>, 10, 12, 15. De mediaan is (7 + 9) : 2 = <b>8</b>.</p>',
          wanneer:'je het middelste getal zoekt en het aantal getallen even is.',
          maak:function(R){
            var it = R.kies(GEM_IT), n = R.kies([6, 8, 10]), h = n / 2, l, o;
            do { l = []; for (var i = 0; i < n; i++) l.push(R.heel(it.lo, it.hi)); o = opv(l); } while (l.join() === o.join() || o[h - 1] === o[h] && R.heel(0, 2));
            var a = o[h - 1], b = o[h], M = (a + b) / 2;
            function bl(k){ return R0.teken.tabel([k >= 1 ? o.map(T) : l.map(T)], { nadruk:k >= 2 ? [[0, h - 1]].concat(k >= 3 ? [[0, h]] : []) : [] }); }
            return { vraag:rij(l), context:'Dit zijn ' + it.wat + '. Wat is de mediaan?', eenheid:it.eh, beeld:bl, stappen:[
              S('Zet de getallen op volgorde, van klein naar groot. Welk getal komt vooraan?', o[0], 'Zoek het kleinste getal. Op volgorde: ' + o.map(T).join(', ') + '.'),
              S('Bij ' + n + ' getallen staan nummer ' + h + ' en nummer ' + (h + 1) + ' in het midden. Wat is getal nummer ' + h + '?', a, 'Op volgorde: ' + o.map(T).join(', ') + '. Tel tot nummer ' + h + '.'),
              S('En getal nummer ' + (h + 1) + '?', b, 'Het getal direct na ' + T(a) + ' in de rij op volgorde.'),
              S('De mediaan ligt precies ertussen: (' + T(a) + ' + ' + T(b) + ') : 2 =', M, T(a) + ' + ' + T(b) + ' = ' + T(a + b) + ', en dat gedeeld door 2.', F(M, a + b, 'Deel de som nog door 2.'), { e:it.eh }) ] };
          } },
        { id:'wst-modus', naam:'De modus', kort:'De modus is wat het vaakst voorkomt; dat kan een getal zijn, maar ook een woord',
          uit:'<p>De <b>modus</b> is de waarde die <b>het vaakst</b> voorkomt. Tel hoe vaak elke waarde er staat. Turven helpt.</p><p>Voorbeeld: 3, 5, 5, 2, 5, 3. De 5 staat er drie keer, vaker dan de rest. De modus is <b>5</b>.</p><p>Let op: de modus is de waarde zelf, niet hoe vaak hij voorkomt. Bij woorden, zoals fiets of bus, is de modus de <b>enige</b> centrummaat die je kunt gebruiken.</p>',
          wanneer:'je wilt weten wat het meest voorkomt, of als de gegevens woorden zijn.',
          maak:function(R){
            var woord = R.heel(0, 2) === 0, l, mo, c, telT;
            if (woord){
              var w = R.kies(WOORD_IT), ws = R.hussel(w.w).slice(0, 4), n = R.heel(10, 14), tel;
              do { tel = verdeel(R, n, 4, 1); } while (tel.filter(function(x){ return x === Math.max.apply(null, tel); }).length > 1);
              c = Math.max.apply(null, tel); mo = ws[tel.indexOf(c)]; l = [];
              ws.forEach(function(x, i){ for (var j = 0; j < tel[i]; j++) l.push(x); }); l = R.hussel(l);
              telT = ws.map(function(x, i){ return x + ' ' + tel[i] + ' keer'; }).join(', ');
              var tab = R0.teken.tabel(rijen(l, 5));
              return { vraag:'De modus?', context:'Aan ' + n + ' leerlingen is gevraagd: "' + w.vr + '" Dit zijn de antwoorden.', beeld:tab, zelfBeeld:tab, stappen:[
                S('Tel hoe vaak elk antwoord voorkomt. Hoe vaak komt het antwoord voor dat het vaakst voorkomt?', c, 'Turf de antwoorden: ' + telT + '.'),
                S('De modus is het antwoord dat het vaakst voorkomt:', mo, 'Welk antwoord staat er ' + c + ' keer? Typ het woord.', F(mo, c, 'Dat is hoe vaak het voorkomt. De modus is het antwoord zelf.')) ] };
            }
            var it = R.kies([{ wat:'de cijfers voor een toets', lo:4, hi:9, eh:'' }, { wat:'de schoenmaten in een klas', lo:36, hi:43, eh:'' }, { wat:'het aantal huisdieren van een groep leerlingen', lo:0, hi:4, eh:'' }, { wat:'het aantal doelpunten per wedstrijd', lo:0, hi:5, eh:'' }]);
            var waarden = [], k = it.hi - it.lo + 1, cnt;
            do { mo = R.heel(it.lo, it.hi); c = R.heel(3, 4); cnt = {}; l = []; for (var j = 0; j < c; j++) l.push(mo); cnt[mo] = c;
              var m = R.heel(7, 9) - c;
              for (j = 0; j < m; j++){ var x; do { x = R.heel(it.lo, it.hi); } while (x === mo || (cnt[x] || 0) >= c - 1); cnt[x] = (cnt[x] || 0) + 1; l.push(x); }
            } while (mo === c || k < 3);
            l = R.hussel(l);
            telT = Object.keys(cnt).map(Number).sort(function(a, b){ return a - b; }).map(function(v){ return T(v) + ' komt ' + cnt[v] + ' keer voor'; }).join(', ');
            return { vraag:rij(l), context:'Dit zijn ' + it.wat + '. Wat is de modus?', stappen:[
              S('Tel hoe vaak elk getal voorkomt. Hoe vaak komt het getal voor dat het vaakst voorkomt?', c, 'Turf de getallen: ' + telT + '.'),
              S('De modus is het getal dat het vaakst voorkomt:', mo, 'Welk getal staat er ' + c + ' keer?', F(mo, c, 'Dat is hoe vaak het voorkomt. De modus is het getal zelf.')) ] };
          } },
        { id:'wst-spreiding', naam:'De spreidingsbreedte', kort:'Spreidingsbreedte = het grootste getal min het kleinste getal',
          uit:'<p>De <b>spreidingsbreedte</b> zegt hoe ver de getallen uit elkaar liggen.</p><p>Zoek het <b>grootste</b> en het <b>kleinste</b> getal. De spreidingsbreedte is het grootste <b>min</b> het kleinste.</p><p>Voorbeeld: 12, 7, 15, 9. Grootste 15, kleinste 7. Spreidingsbreedte: 15 − 7 = <b>8</b>.</p>',
          wanneer:'je wilt weten hoe ver de gegevens uit elkaar liggen.',
          maak:function(R){
            var it = R.kies(GEM_IT), n = R.heel(6, 9), l, mx, mn;
            do { l = []; for (var i = 0; i < n; i++) l.push(R.heel(it.lo, it.hi)); mx = Math.max.apply(null, l); mn = Math.min.apply(null, l); } while (mx - mn < 4);
            return { vraag:rij(l), context:'Dit zijn ' + it.wat + '. Wat is de spreidingsbreedte?', eenheid:it.eh, stappen:[
              S('Het grootste getal:', mx, 'Loop de rij langs en onthoud steeds het grootste getal.', null, { e:it.eh }),
              S('Het kleinste getal:', mn, 'Loop de rij langs en onthoud steeds het kleinste getal.', null, { e:it.eh }),
              S('De spreidingsbreedte: ' + T(mx) + ' ' + MIN + ' ' + T(mn) + ' =', mx - mn, 'Grootste min kleinste.', F(mx - mn, mx, 'Trek het kleinste getal er nog vanaf.', mx + mn, 'Je moet aftrekken, niet optellen.'), { e:it.eh }) ] };
          } },
        { id:'wst-centrum-kies', naam:'Kies de centrummaat die past', kort:'Woorden of het vaakst: de modus. Een uitschieter: de mediaan. Eerlijk verdelen: het gemiddelde',
          uit:'<p>Welke centrummaat past, hangt af van de gegevens en van wat je wilt weten. Stel jezelf deze vragen.</p><p><b>Zijn het woorden?</b> Of wil je weten wat het <b>vaakst</b> voorkomt? Neem de <b>modus</b>.</p><p><b>Is er een uitschieter</b>, een getal dat veel groter of kleiner is dan de rest? Neem de <b>mediaan</b>. De uitschieter trekt het gemiddelde scheef, de mediaan niet.</p><p>Wil je weten wat ieder krijgt als je <b>alles eerlijk verdeelt</b>? Neem het <b>gemiddelde</b>.</p>',
          wanneer:'je moet kiezen welke centrummaat het beste beeld geeft.',
          maak:function(R){
            var soort = R.kies(['woord', 'uit', 'uit', 'vaak', 'eerlijk']), st, ctx, l, i;
            var getal = function(goed){ return K(R, 'Zijn de gegevens getallen of woorden?', goed ? 'getallen' : 'woorden', [goed ? 'woorden' : 'getallen'], goed ? 'Het zijn getallen: daar kun je mee rekenen.' : 'Het zijn woorden: daar kun je niet mee rekenen.', { orde:['getallen', 'woorden'] }); };
            if (soort === 'woord'){
              var w = R.kies(WOORD_IT), ws = R.hussel(w.w).slice(0, 4), tel = verdeel(R, R.heel(22, 30), 4, 2);
              ctx = 'Aan ' + som(tel) + ' leerlingen is gevraagd: "' + w.vr + '" De antwoorden: ' + ws.map(function(x, j){ return x + ' ' + tel[j]; }).join(', ') + '.';
              st = [getal(false), K(R, 'Welke centrummaat past?', 'de modus', [], 'Met woorden kun je niet rekenen en ze ook niet op volgorde zetten. Je kunt wel kijken welk antwoord het vaakst voorkomt.', { orde:MATEN })];
            } else if (soort === 'uit'){
              var u = R.kies([{ wat:'de zakgelden per maand van een paar vrienden, in euro', eh:'euro', lo:15, hi:30, x:[180, 250], gew:'een gewoon zakgeld' }, { wat:'de aantallen volgers van een paar leerlingen', eh:'', lo:80, hi:200, x:[4000, 9000], gew:'een gewoon aantal volgers' }, { wat:'de huizenprijzen in een straat, in duizenden euro', eh:'', lo:250, hi:400, x:[2500, 3500], gew:'een gewone huizenprijs' }, { wat:'de reistijden van een groep leerlingen, in minuten', eh:'', lo:5, hi:20, x:[90, 120], gew:'een gewone reistijd' }]);
              l = []; var n = R.heel(6, 8); for (i = 0; i < n - 1; i++) l.push(R.heel(u.lo, u.hi)); var ux = R.heel(u.x[0], u.x[1]); if (ux > 1000) ux = Math.round(ux / 100) * 100; else if (ux > 100) ux = Math.round(ux / 10) * 10; l.splice(R.heel(0, l.length), 0, ux);
              ctx = 'Dit zijn ' + u.wat + ': ' + l.map(T).join(', ') + '. Welke centrummaat geeft het beste beeld van ' + u.gew + '?';
              st = [getal(true), K(R, 'Is er een uitschieter: een getal dat veel groter of kleiner is dan de rest?', 'ja, ' + T(ux), ['nee, ze liggen dicht bij elkaar'], T(ux) + ' is veel groter dan de andere getallen.', { orde:['ja, ' + T(ux), 'nee, ze liggen dicht bij elkaar'] }),
                K(R, 'Welke centrummaat past?', 'de mediaan', [], 'Een uitschieter trekt het gemiddelde scheef. De mediaan is het middelste getal en heeft geen last van één uitschieter.', { orde:MATEN })];
            } else if (soort === 'vaak'){
              var v = R.kies([{ wat:'De schoenenwinkel verkocht deze week deze schoenmaten', lo:37, hi:44, doel:'welke maat hij het meest moet inkopen', wie:'De winkel' }, { wat:'Een kledingwinkel verkocht deze maand deze kindermaten', lo:0, hi:5, m:[110, 116, 122, 128, 134, 140], doel:'welke maat hij het meest moet bestellen', wie:'De winkel' }, { wat:'De bakker telde hoeveel broden elke klant kocht', lo:1, hi:4, doel:'welk aantal broden klanten het vaakst kopen', wie:'De bakker' }]);
              var mo = R.heel(v.lo, v.hi), nOv = Math.min(R.heel(6, 8), 2 * (v.hi - v.lo)); l = [mo, mo, mo, mo]; for (i = 0; i < nOv; i++){ var x; do { x = R.heel(v.lo, v.hi); } while (x === mo || l.filter(function(y){ return y === x; }).length >= 2); l.push(x); }
              l = R.hussel(l); if (v.m) l = l.map(function(j){ return v.m[j]; });
              ctx = v.wat + ': ' + l.map(T).join(', ') + '. ' + v.wie + ' wil weten ' + v.doel + '.';
              st = [getal(true), K(R, 'Wat wil ' + v.wie.toLowerCase() + ' weten?', 'wat het vaakst voorkomt', ['wat het middelste getal is', 'wat ieder krijgt als je eerlijk verdeelt'], v.wie + ' wil weten ' + v.doel + ': dat is wat het vaakst voorkomt.'),
                K(R, 'Welke centrummaat past?', 'de modus', [], 'Wat het vaakst voorkomt, is de modus.', { orde:MATEN })];
            } else {
              var e = R.kies([{ wie:'Vijf vrienden', n:5, wat:'verdienen met klusjes', eh:' euro', lo:8, hi:22, deel:'Ze doen al het geld bij elkaar en verdelen het eerlijk.', vr:'hoeveel ieder dan krijgt' }, { wie:'Zes kinderen', n:6, wat:'hebben een zakje snoep. Het aantal snoepjes per zakje', eh:'', lo:9, hi:16, deel:'Ze doen alle snoepjes bij elkaar en verdelen ze eerlijk.', vr:'hoeveel snoepjes ieder dan krijgt' }, { wie:'Vier teams', n:4, wat:'zamelen flessen in. Het aantal flessen per team', eh:'', lo:30, hi:60, deel:'Ze doen alle flessen bij elkaar en verdelen ze eerlijk over de teams.', vr:'hoeveel flessen ieder team dan heeft' }]);
              var nn = e.n; l = []; for (i = 0; i < nn; i++) l.push(R.heel(e.lo, e.hi));
              ctx = e.wie + ' ' + e.wat + ': ' + l.map(function(y){ return T(y) + e.eh; }).join(', ') + '. ' + e.deel + ' Je wilt weten ' + e.vr + '.';
              st = [getal(true), K(R, 'Wat wil je weten?', 'wat ieder krijgt als je eerlijk verdeelt', ['wat het vaakst voorkomt', 'wat het middelste getal is'], 'Alles bij elkaar doen en eerlijk verdelen.'),
                K(R, 'Welke centrummaat past?', 'het gemiddelde', [], 'Eerlijk verdelen is: alles optellen en delen door het aantal. Dat is het gemiddelde.', { orde:MATEN })];
            }
            return eindKeuze({ vraag:'Welke centrummaat past?', context:ctx, stappen:st });
          } }
      ] },

    /* ================= frequentietabellen (onderbouw) ================= */
    { groep:{ id:'wst-freq', niveau:'onderbouw', domein:'statistiek', naam:'Frequentietabellen',
        uit:'Turven, de relatieve frequentie in procenten, gegevens in klassen indelen, en het gemiddelde en de mediaan uit een frequentietabel.' },
      doelen:[
        { id:'wst-turven', naam:'Turven en tellen', kort:'Een bosje is vijf streepjes; tel de bosjes keer vijf en tel de losse streepjes erbij',
          uit:'<p>Bij <b>turven</b> zet je voor elk antwoord een streepje. Het vijfde streepje zet je <b>schuin</b> door de vier andere: zo krijg je <b>bosjes van vijf</b>.</p><p>Tellen gaat dan snel: tel de bosjes en doe <b>keer 5</b>. Tel daarna de <b>losse streepjes</b> erbij.</p><p>Voorbeeld: 3 bosjes en 2 losse streepjes. 3 · 5 + 2 = <b>17</b>. Dat getal heet de <b>frequentie</b>.</p>',
          wanneer:'je antwoorden telt bij een enquête of een telling.',
          maak:function(R){
            var w = R.kies(WOORD_IT), ws = R.hussel(w.w).slice(0, R.heel(3, 4)), rr = ws.map(function(x){ return { naam:x, n:R.heel(3, 18) }; }), j = R.heel(0, ws.length - 1);
            while (rr[j].n < 6) rr[j].n = R.heel(6, 19);
            var f = rr[j].n, b = Math.floor(f / 5), l = f % 5, pic = turf(rr, j);
            return { vraag:'Hoe vaak ' + ws[j] + '?', context:'De klas turfde de antwoorden op de vraag "' + w.vr + '" Een bosje is vijf streepjes: vier rechtop en één schuin erdoor.', beeld:pic, zelfBeeld:pic, stappen:[
              S('Hoeveel hele bosjes van vijf staan er bij ' + ws[j] + '?', b, 'Tel alleen de bosjes met een schuine streep erdoor.'),
              S('Hoeveel losse streepjes staan er nog achter?', l, 'Tel de streepjes die niet in een bosje zitten.' + (l ? '' : ' Zijn er geen, dan is het 0.')),
              S('De frequentie: ' + b + ' ' + X + ' 5 + ' + l + ' =', f, (b === 1 ? 'Eén bosje van vijf is 5 streepjes.' : b + ' bosjes van vijf zijn ' + (b * 5) + ' streepjes.') + (l ? ' Tel de losse streepjes erbij: ' + l + '.' : ' Er zijn geen losse streepjes.'), F(f, b + l, 'Een bosje telt voor vijf, niet voor één.')) ] };
          } },
        { id:'wst-relfreq', naam:'Relatieve frequentie in procenten', kort:'Deel de frequentie door het totaal en doe keer 100',
          uit:'<p>De <b>frequentie</b> zegt hoe vaak iets voorkomt. De <b>relatieve frequentie</b> zegt welk <b>deel van het totaal</b> dat is, meestal in procenten.</p><p>Zo reken je hem uit: <b>frequentie : totaal · 100</b>.</p><p>Voorbeeld: 6 van de 24 leerlingen komen met de bus. 6 : 24 = 0,25. Keer 100 is <b>25%</b>.</p><p>Met procenten kun je groepen van een andere grootte eerlijk vergelijken.</p>',
          wanneer:'je wilt weten welk deel van de groep iets heeft gekozen.',
          maak:function(R){
            var w = R.kies(WOORD_IT), k = R.heel(3, 5), ws = R.hussel(w.w).slice(0, k), N, tel, j, p;
            do { N = R.kies([20, 24, 25, 30, 32, 40, 48, 50, 60, 64, 75, 80]); tel = verdeel(R, N, k, 2); j = R.heel(0, k - 1); p = tel[j] / N * 100; } while (grens(p, 1));
            var f = tel[j];
            function tab(n){ return R0.teken.tabel([['antwoord', 'frequentie'].concat(n >= 3 ? ['relatieve frequentie'] : [])].concat(ws.map(function(x, i){ return [x, String(tel[i])].concat(n >= 3 ? [i === j ? T(rnd(p, 1)) + '%' : ''] : []); })).concat(n >= 1 ? [['totaal', String(N)].concat(n >= 3 ? ['100%'] : [])] : []), { kop:true, nadruk:[[j + 1, 1]] }); }
            return { vraag:'Hoeveel procent ' + ws[j] + '?', context:'De tabel laat de antwoorden zien op de vraag "' + w.vr + '" Bereken de relatieve frequentie van ' + ws[j] + '. Rond af op 1 decimaal.', eenheid:'%', antwoord:pAnt(p), beeld:tab, zelfBeeld:tab(0), stappen:[
              S('Het totaal: ' + tel.join(' + ') + ' =', N, 'Tel alle frequenties op.'),
              S('Het deel dat ' + ws[j] + ' antwoordde, als breuk:', brAnt(f, N), 'De frequentie boven de streep, het totaal eronder: ' + br(f, N) + '.', F(brAnt(f, N), br(f, N - f), 'Onder de streep komt het totaal, ' + N + '.'), { controle:kansC(f, N) }),
              S('In procenten: ' + f + ' : ' + N + ' ' + X + ' 100 ≈ (rond af op 1 decimaal)', pAnt(p), f + ' : ' + N + ' = ' + metPunt(deel(f, N)) + ' Keer 100 is ' + metPunt(deel(f * 100, N)) + ' Rond af op 1 decimaal.', F(pAnt(p), f, 'Dat is de frequentie. Deel door het totaal en doe keer 100.'), { e:'%' }) ] };
          } },
        { id:'wst-klassen', naam:'Gegevens in klassen indelen', kort:'Maak groepen die even breed zijn; een getal op de grens hoort bij de klasse die daar begint',
          uit:'<p>Zijn er veel verschillende getallen, dan deel je ze in <b>klassen</b> in: groepen die <b>even breed</b> zijn, zoals 150 tot 160, 160 tot 170, enzovoort.</p><p>"150 tot 160" betekent: <b>vanaf 150, tot 160</b>. Het getal 160 hoort er dus niet bij. Dat hoort in de volgende klasse, 160 tot 170.</p><p>Tel daarna per klasse hoeveel getallen erin vallen. Dat is de frequentie van die klasse.</p>',
          wanneer:'er veel verschillende getallen zijn en een gewone frequentietabel te lang wordt.',
          maak:function(R){
            var it = R.kies(KLAS_IT), n = R.heel(16, 20), l, kl, cnt, w = it.w;
            function klas(v){ var a = it.s + Math.floor((v - it.s) / w) * w; return T(a) + ' tot ' + T(a + w); }
            var x, g, a0;
            do { l = []; for (var i = 0; i < n; i++) l.push(R.heel(it.lo, it.hi));
              x = R.kies(l); g = it.s + w * R.heel(1, Math.floor((it.hi - it.s) / w));
              a0 = it.s + w * R.heel(1, Math.floor((it.hi - it.s) / w) - 1); cnt = l.filter(function(v){ return v >= a0 && v < a0 + w; }).length;
            } while ((x - it.s) % w === 0 || cnt < 2 || g <= it.lo || g >= it.hi);
            var alle = []; for (var a = it.s; a <= it.hi; a += w) alle.push(T(a) + ' tot ' + T(a + w));
            function opties(goed){ var i0 = alle.indexOf(goed), o = alle.slice(Math.max(0, i0 - 1), i0 + 3); if (o.length < 3) o = alle.slice(Math.max(0, alle.length - 4)); return o; }
            kl = T(a0) + ' tot ' + T(a0 + w);
            function bl(k){ return R0.teken.tabel(rijen(l.map(T), 6), { nadruk:k >= 3 ? plekken(l, 6, function(v){ return v >= a0 && v < a0 + w; }) : [] }); }
            return { vraag:'Hoeveel in ' + kl + '?', context:'Dit zijn ' + it.wat + ', in ' + it.eh + '. Je deelt ze in klassen in: ' + alle.slice(0, 2).join(', ') + ', enzovoort. Hoeveel getallen vallen in de klasse ' + kl + '?', beeld:bl, zelfBeeld:bl(0), stappen:[
              K(R, 'In welke klasse hoort ' + T(x) + '?', klas(x), opties(klas(x)).filter(function(o){ return o !== klas(x); }), T(x) + ' ligt tussen ' + klas(x).replace(' tot ', ' en ') + '.', { orde:opties(klas(x)) }),
              K(R, 'In welke klasse hoort ' + T(g) + '? Let op: dat is precies een grens.', klas(g), [T(g - w) + ' tot ' + T(g)], '"' + T(g - w) + ' tot ' + T(g) + '" gaat tot ' + T(g) + ', maar ' + T(g) + ' zelf hoort er niet bij. ' + T(g) + ' is het begin van de volgende klasse.', { orde:[T(g - w) + ' tot ' + T(g), klas(g)] }),
              S('Tel: hoeveel getallen vallen in de klasse ' + kl + '?', cnt, 'Zoek de getallen vanaf ' + T(a0) + ' tot ' + T(a0 + w) + ' (zonder ' + T(a0 + w) + ' zelf). Het zijn: ' + l.filter(function(v){ return v >= a0 && v < a0 + w; }).map(T).join(', ') + '.', F(cnt, cnt + l.filter(function(v){ return v === a0 + w; }).length, 'Je telde ' + T(a0 + w) + ' mee. Dat hoort bij de volgende klasse.')) ] };
          } },
        { id:'wst-gem-freq', naam:'Het gemiddelde uit een frequentietabel', kort:'Doe elke waarde keer zijn frequentie, tel op en deel door het totaal aantal',
          uit:'<p>In een <b>frequentietabel</b> staat elke waarde maar één keer, met erachter <b>hoe vaak</b> hij voorkomt.</p><p>Voor het gemiddelde doe je elke waarde <b>keer de frequentie</b> en tel je alles op. Deel die som door het <b>totaal aantal</b>: alle frequenties samen.</p><p>Voorbeeld: cijfer 6 komt 3 keer voor en cijfer 8 komt 2 keer voor. 6 · 3 + 8 · 2 = 34. Het totaal aantal is 5. 34 : 5 = <b>6,8</b>.</p>',
          wanneer:'de gegevens in een frequentietabel staan.',
          maak:function(R){
            var it = R.kies([{ zin:'In de tabel staat hoeveel broers en zussen {N} leerlingen hebben.', kop:'broers en zussen', lo:0, k:5 }, { zin:'In de tabel staan de cijfers van {N} leerlingen voor een toets.', kop:'cijfer', lo:4, k:6 }, { zin:'In de tabel staat hoeveel doelpunten een team maakte in {N} wedstrijden.', kop:'doelpunten', lo:0, k:5 }, { zin:'In de tabel staan de schoenmaten van {N} leerlingen.', kop:'schoenmaat', lo:R.heel(36, 38), k:5 }]);
            var v = [], f, N, sv, g, i;
            for (i = 0; i < it.k; i++) v.push(it.lo + i);
            do { f = v.map(function(){ return R.heel(1, 9); }); N = som(f); sv = som(v.map(function(x, j){ return x * f[j]; })); g = sv / N; } while (grens(g, 1) || N < 12);
            function tab(n){ return R0.teken.tabel([[it.kop, 'frequentie'].concat(n >= 2 ? [it.kop + ' ' + X + ' freq.'] : [])].concat(v.map(function(x, j){ return [T(x), String(f[j])].concat(n >= 2 ? [T(x * f[j])] : []); })).concat(n >= 1 ? [['totaal', String(N)].concat(n >= 2 ? [T(sv)] : [])] : []), { kop:true }); }
            return { vraag:'Het gemiddelde?', context:it.zin.replace('{N}', N) + ' Bereken het gemiddelde. Rond af op 1 decimaal.', antwoord:d1(g), beeld:tab, zelfBeeld:tab(0), stappen:[
              S('Het totaal aantal (tel de frequenties op):', N, f.join(' + ') + ' = ' + N + '.'),
              S('Doe elke waarde keer de frequentie en tel op:', sv, v.map(function(x, j){ return T(x) + ' ' + X + ' ' + f[j]; }).join(' + ') + ' = ' + T(sv) + '.', F(sv, som(v), 'Je telde alleen de waarden op. Doe elke waarde keer de frequentie.', N, 'Dat is het totaal aantal.')),
              S('Het gemiddelde: ' + T(sv) + ' : ' + N + ' ≈ (rond af op 1 decimaal)', d1(g), T(sv) + ' : ' + N + ' = ' + metPunt(deel(sv, N)) + ' Rond af op 1 decimaal.', F(d1(g), rnd(sv / it.k, 1), 'Deel door het totaal aantal (' + N + '), niet door het aantal rijen.')) ] };
          } },
        { id:'wst-med-freq', naam:'De mediaan uit een frequentietabel', kort:'Zoek de plek van het middelste getal en tel de frequenties op tot je die plek bereikt',
          uit:'<p>In een frequentietabel staan de waarden al <b>op volgorde</b>. Je hoeft ze dus niet allemaal op te schrijven.</p><p>Zoek eerst het <b>totaal aantal</b> en de <b>plek</b> van het middelste getal. Bij 25 getallen is dat nummer 13. Bij 24 getallen zijn het nummer 12 en 13.</p><p>Tel dan de frequenties op, van boven naar beneden, tot je bij die plek bent. Bij die waarde staat de <b>mediaan</b>.</p>',
          wanneer:'je de mediaan zoekt en de gegevens in een frequentietabel staan.',
          maak:function(R){
            var it = R.kies([{ zin:'In de tabel staat hoeveel broers en zussen {N} leerlingen hebben.', kop:'broers en zussen', lo:0 }, { zin:'In de tabel staan de cijfers van {N} leerlingen voor een toets.', kop:'cijfer', lo:4 }, { zin:'In de tabel staat hoeveel doelpunten een team maakte in {N} wedstrijden.', kop:'doelpunten', lo:0 }, { zin:'In de tabel staat hoeveel boeken {N} leerlingen deze maand lazen.', kop:'boeken', lo:0 }]);
            var k = 5, v = [], f, N, cum, i, M, m1, m2, p1, p2, mo;
            for (i = 0; i < k; i++) v.push(it.lo + i);
            function op(p){ for (var j = 0; j < k; j++) if (cum[j] >= p) return v[j]; }
            do { f = v.map(function(){ return R.heel(1, 9); }); N = som(f); cum = []; f.reduce(function(a, x, j){ cum[j] = a + x; return cum[j]; }, 0);
              if (N % 2){ p1 = p2 = (N + 1) / 2; } else { p1 = N / 2; p2 = N / 2 + 1; }
              m1 = op(p1); m2 = op(p2); M = (m1 + m2) / 2; mo = v[f.indexOf(Math.max.apply(null, f))];
            } while (N < 11 || (N % 2 === 0 && m1 === m2 && R.heel(0, 1)));
            var oneven = N % 2 === 1, rijM = v.indexOf(m2);
            var cumT = v.map(function(x, j){ return 't/m ' + T(x) + ': ' + cum[j]; }).join(', ');
            function tab(n){ return R0.teken.tabel([[it.kop, 'frequentie'].concat(n >= 2 ? ['geteld t/m hier'] : [])].concat(v.map(function(x, j){ return [T(x), String(f[j])].concat(n >= 2 ? [String(cum[j])] : []); })), { kop:true, nadruk:n >= 3 ? [[rijM + 1, 0]].concat(m1 !== m2 ? [[v.indexOf(m1) + 1, 0]] : []) : [] }); }
            var st = [S('Het totaal aantal (tel de frequenties op):', N, f.join(' + ') + ' = ' + N + '.')];
            if (oneven){
              st.push(S('Het middelste getal staat op plek nummer', p1, '(' + N + ' + 1) : 2 = ' + p1 + '.', F(p1, N / 2, 'Bij een oneven aantal: (' + N + ' + 1) : 2.')));
              st.push(S('Tel de frequenties op tot je bij nummer ' + p1 + ' bent. De mediaan is:', M, 'Opgeteld: ' + cumT + '. Nummer ' + p1 + ' valt bij ' + T(m1) + '.', F(M, mo, 'Dat is de modus: die komt het vaakst voor. Zoek nummer ' + p1 + '.', v[2], 'Dat is de middelste rij van de tabel. Je zoekt het middelste getal, nummer ' + p1 + '.')));
            } else {
              st.push(S('Er zijn twee middelste getallen: nummer ' + p1 + ' en nummer ' + p2 + '. Welk getal staat op plek ' + p1 + '?', m1, 'Opgeteld: ' + cumT + '. Nummer ' + p1 + ' valt bij ' + T(m1) + '.', F(m1, p1, 'Dat is de plek. Welke waarde staat daar?')));
              st.push(S('Nummer ' + p2 + ' is ' + (m1 === m2 ? 'ook ' : '') + T(m2) + '. De mediaan: (' + T(m1) + ' + ' + T(m2) + ') : 2 =', M, m1 === m2 ? 'Allebei ' + T(m1) + ', dus de mediaan is ' + T(m1) + '.' : 'Precies tussen ' + T(m1) + ' en ' + T(m2) + '.', F(M, m1 + m2, 'Deel nog door 2.')));
            }
            return { vraag:'De mediaan?', context:it.zin.replace('{N}', N) + ' Wat is de mediaan?', beeld:tab, zelfBeeld:tab(0), stappen:st };
          } }
      ] },

    /* ================= diagrammen (onderbouw) ================= */
    { groep:{ id:'wst-diagram', niveau:'onderbouw', domein:'statistiek', naam:'Diagrammen aflezen',
        uit:'Een staafdiagram, een lijndiagram en een cirkeldiagram aflezen, en een cirkeldiagram uitrekenen met procenten en graden.' },
      doelen:[
        { id:'wst-staaf', naam:'Een staafdiagram aflezen', kort:'Kijk eerst hoeveel één hokje op de as is, en lees dan af waar de staaf ophoudt',
          uit:'<p>In een <b>staafdiagram</b> is elke staaf even breed. De <b>hoogte</b> zegt hoeveel het is.</p><p>Kijk eerst naar de <b>verticale as</b>: welke getallen staan erbij en hoeveel is <b>één hokje</b>? Staat er 0, 10, 20 met een lijn ertussen, dan is één hokje 5.</p><p>Ga dan vanaf de bovenkant van de staaf <b>recht naar links</b> naar de as en lees het getal af.</p>',
          wanneer:'je aantallen per groep wilt aflezen en vergelijken.',
          maak:function(R){
            var it = R.kies([
              { wat:'de lievelingssport van de leerlingen van klas 1B', yas:'leerlingen', eh:'leerlingen', cats:['voetbal', 'hockey', 'tennis', 'dansen', 'zwemmen'], st:1 },
              { wat:'het aantal verkochte ijsjes per dag', yas:'ijsjes', eh:'ijsjes', cats:['ma', 'di', 'wo', 'do', 'vr'], st:5 },
              { wat:'het aantal bezoekers van de bibliotheek per maand', yas:'bezoekers', eh:'bezoekers', cats:['jan', 'feb', 'mrt', 'apr', 'mei'], st:20 },
              { wat:'het aantal gelezen boeken per klas', yas:'boeken', eh:'boeken', cats:['1A', '1B', '1C', '1D'], st:2 },
              { wat:'het aantal flessen dat elke klas inzamelde', yas:'flessen', eh:'flessen', cats:['1A', '1B', '1C', '1D', '1E'], st:10 } ]);
            var n = it.cats.length, max = it.st * 10, vals, a, b, soort = R.kies(['verschil', 'verschil', 'samen']), drie;
            do { vals = it.cats.map(function(){ return it.st * R.heel(1, 10); }); a = R.heel(0, n - 1); b = R.heel(0, n - 1); } while (a === b || vals[a] <= vals[b] || vals[a] % (2 * it.st) === 0 && vals[b] % (2 * it.st) === 0);
            drie = R.hussel(it.cats.map(function(c, i){ return i; })).slice(0, 3).sort();
            var lees = soort === 'verschil' ? [a, b] : drie;
            var bl = function(k){ return staaf(it.cats, vals, { max:max, stap:it.st, elk:2, yas:it.yas, nad:lees, lees:lees.slice(0, Math.min(k, lees.length)), aria:'staafdiagram van ' + it.wat }); };
            var hint = 'Tussen twee getallen op de as liggen twee hokjes. Eén hokje is ' + it.st + '.';
            var st, ant, vraag;
            if (soort === 'verschil'){
              vraag = 'Hoeveel meer bij ' + it.cats[a] + ' dan bij ' + it.cats[b] + '?'; ant = vals[a] - vals[b];
              st = [S('Lees af: ' + it.cats[a] + '.', vals[a], hint, null, { e:it.eh }), S('Lees af: ' + it.cats[b] + '.', vals[b], hint, null, { e:it.eh }),
                S('Het verschil: ' + T(vals[a]) + ' ' + MIN + ' ' + T(vals[b]) + ' =', ant, 'Trek de kleinste van de grootste af.', F(ant, vals[a] + vals[b], 'Je zoekt hoeveel meer: trek af.'), { e:it.eh })];
            } else {
              vraag = 'Hoeveel bij ' + drie.map(function(i){ return it.cats[i]; }).join(', ').replace(/, ([^,]*)$/, ' en $1') + ' samen?'; ant = vals[drie[0]] + vals[drie[1]] + vals[drie[2]];
              st = drie.map(function(i){ return S('Lees af: ' + it.cats[i] + '.', vals[i], hint, null, { e:it.eh }); }).concat([S('Samen: ' + drie.map(function(i){ return T(vals[i]); }).join(' + ') + ' =', ant, 'Tel de drie getallen op.', null, { e:it.eh })]);
            }
            return { vraag:vraag, context:'Het staafdiagram laat zien: ' + it.wat + '.', eenheid:it.eh, beeld:bl, zelfBeeld:bl(0), stappen:st, antwoord:T(ant) };
          } },
        { id:'wst-lijn', naam:'Een lijndiagram aflezen', kort:'Zoek het moment op de horizontale as, ga omhoog naar de lijn en dan naar links naar de as',
          uit:'<p>Een <b>lijndiagram</b> laat zien hoe iets <b>verandert</b>, bijvoorbeeld de temperatuur over een dag. Op de horizontale as staat de tijd.</p><p>Aflezen: zoek het moment op de <b>horizontale as</b>, ga recht <b>omhoog</b> naar de stip en dan recht <b>naar links</b> naar de verticale as.</p><p>Kijk ook hier eerst hoeveel <b>één hokje</b> is. Gaat de lijn omhoog, dan <b>stijgt</b> het. Gaat hij omlaag, dan <b>daalt</b> het.</p>',
          wanneer:'je wilt zien hoe iets verandert in de tijd.',
          maak:function(R){
            var it = R.kies([
              { wat:'de temperatuur op een zomerdag', zelf:'de temperatuur', yas:'°C', eh:'°C', xs:['8 uur', '10 uur', '12 uur', '14 uur', '16 uur', '18 uur'], st:2, mx:14, b:[5, 8] },
              { wat:'het aantal bezoekers van het zwembad per maand', zelf:'het aantal bezoekers', yas:'bezoekers', eh:'bezoekers', xs:['mei', 'jun', 'jul', 'aug', 'sep'], st:50, mx:10, b:[1, 3] },
              { wat:'de lengte van een plant, elke week gemeten', zelf:'de lengte', yas:'cm', eh:'cm', xs:['week 0', 'week 1', 'week 2', 'week 3', 'week 4', 'week 5'], st:2, mx:10, b:[1, 2], groei:true } ]);
            var n = it.xs.length, max = it.st * it.mx, vals = [], i;
            /* de lijn loopt eerst omhoog en daarna omlaag (een plant groeit alleen) */
            do { vals = []; var h = R.heel(it.b[0], it.b[1]), top = it.groei ? n : R.heel(2, n - 2);
              for (i = 0; i < n; i++){ vals.push(h * it.st); h += i < top - 1 ? R.heel(0, 3) : -R.heel(0, 3); }
            } while (Math.max.apply(null, vals) > max || Math.min.apply(null, vals) < it.st || new Set(vals).size < 4);
            var soort = R.kies(['verschil', 'hooglaag']), st, ant, vraag, lees, hint = 'Eén hokje op de verticale as is ' + it.st + '.';
            if (soort === 'verschil'){
              var a, b; do { a = R.heel(0, n - 2); b = R.heel(a + 1, n - 1); } while (vals[a] === vals[b]);
              var stijg = vals[b] > vals[a]; ant = Math.abs(vals[b] - vals[a]); lees = [a, b];
              vraag = 'Hoeveel ' + (stijg ? 'steeg' : 'daalde') + ' ' + it.zelf + ' van ' + it.xs[a] + ' tot ' + it.xs[b] + '?';
              st = [S('Lees af bij ' + it.xs[a] + '.', vals[a], hint, null, { e:it.eh }), S('Lees af bij ' + it.xs[b] + '.', vals[b], hint, null, { e:it.eh }),
                S('Het verschil: ' + (stijg ? T(vals[b]) + ' ' + MIN + ' ' + T(vals[a]) : T(vals[a]) + ' ' + MIN + ' ' + T(vals[b])) + ' =', ant, 'Trek de kleinste van de grootste af.', null, { e:it.eh })];
            } else {
              var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals); ant = mx - mn; lees = [vals.indexOf(mx), vals.indexOf(mn)];
              vraag = 'Hoeveel verschil tussen de hoogste en de laagste stip?';
              st = [S('De hoogste stip: lees af.', mx, 'Zoek de stip die het hoogst staat. ' + hint, null, { e:it.eh }), S('De laagste stip: lees af.', mn, 'Zoek de stip die het laagst staat. ' + hint, null, { e:it.eh }),
                S('Het verschil: ' + T(mx) + ' ' + MIN + ' ' + T(mn) + ' =', ant, 'Hoogste min laagste.', null, { e:it.eh })];
            }
            var bl = function(k){ return lijnD(it.xs, vals, { max:max, stap:it.st, elk:max / it.st > 10 ? 2 : 1, yas:it.yas, lees:lees.slice(0, Math.min(k, 2)), aria:'lijndiagram van ' + it.wat }); };
            return { vraag:vraag, context:'Het lijndiagram laat zien: ' + it.wat + '.', eenheid:it.eh, beeld:bl, zelfBeeld:bl(0), stappen:st, antwoord:T(ant) };
          } },
        { id:'wst-cirkel-proc', naam:'Een cirkeldiagram met procenten', kort:'Het hele cirkeldiagram is 100%; reken een procent om naar een aantal via 1%',
          uit:'<p>In een <b>cirkeldiagram</b> is de hele cirkel de hele groep: <b>100%</b>. Elk stuk is een deel ervan.</p><p>Wil je weten <b>hoeveel</b> mensen bij een stuk horen, dan reken je via <b>1%</b>: deel het totaal door 100 en doe dat keer het procent.</p><p>Voorbeeld: 35% van 400 leerlingen. 1% is 400 : 100 = 4. 35% is 35 · 4 = <b>140</b>.</p>',
          wanneer:'je aantallen wilt uitrekenen uit een cirkeldiagram met procenten.',
          maak:function(R){
            var w = R.kies([{ vr:'Hoe kom je naar school?', cats:['fiets', 'bus', 'lopend', 'auto'], wie:'leerlingen' }, { vr:'Wat doe je het liefst in je vrije tijd?', cats:['sporten', 'gamen', 'lezen', 'muziek'], wie:'jongeren' }, { vr:'Welk fruit eet je het liefst?', cats:['appel', 'banaan', 'aardbei', 'druiven'], wie:'kinderen' }]);
            var k = R.heel(3, 4), cats = w.cats.slice(0, k), pr = verdeel(R, 20, k, 2).map(function(x){ return x * 5; }), N = R.kies([200, 240, 300, 360, 400, 480, 500, 600, 800, 1200]), j = R.heel(0, k - 1), p = pr[j], een = N / 100, ant = p * een;
            var bl = function(n){ return cirkel(pr.map(function(x){ return x * 3.6; }), cats.map(function(c, i){ return c + ' ' + pr[i] + '%'; }), { nad:[j], aria:'cirkeldiagram' }); };
            return { vraag:'Hoeveel ' + w.wie + ': ' + cats[j] + '?', context:'Aan ' + T(N) + ' ' + w.wie + ' is gevraagd: "' + w.vr + '" Het cirkeldiagram laat de antwoorden zien. Hoeveel ' + w.wie + ' antwoordden "' + cats[j] + '"?', eenheid:w.wie, beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Lees af: hoeveel procent antwoordde "' + cats[j] + '"?', gAnt(p, '%'), 'Kijk in de legenda naast het cirkeldiagram.', null, { e:'%' }),
              S('1% van ' + T(N) + ' = ' + T(N) + ' : 100 =', een, 'Delen door 100: de komma twee plaatsen naar links.'),
              S(p + '% is ' + p + ' ' + X + ' ' + T(een) + ' =', ant, 'Doe het procent keer 1%.', F(ant, p, 'Dat is het procent. Reken het om naar een aantal.'), { e:w.wie }) ] };
          } },
        { id:'wst-cirkel-graden', naam:'Een cirkeldiagram tekenen: graden uitrekenen', kort:'De hele cirkel is 360°; reken uit hoeveel graden één persoon is en doe dat keer de frequentie',
          uit:'<p>Een hele cirkel is <b>360°</b>. Wil je een cirkeldiagram tekenen, dan reken je voor elk stuk uit hoeveel graden het wordt.</p><p>Deel eerst <b>360 door het totaal</b>: zoveel graden krijgt één persoon. Doe dat daarna <b>keer de frequentie</b> van het stuk.</p><p>Voorbeeld: 30 leerlingen, 8 komen met de bus. 360 : 30 = 12° per leerling. De bus krijgt 8 · 12 = <b>96°</b>. Dat stuk teken je met een geodriehoek.</p>',
          wanneer:'je zelf een cirkeldiagram moet tekenen uit een tabel.',
          maak:function(R){
            var w = R.kies(WOORD_IT), k = R.heel(3, 4), ws = R.hussel(w.w).slice(0, k), N = R.kies([20, 24, 30, 36, 40, 45, 60, 72, 90]), tel = verdeel(R, N, k, 2), j = R.heel(0, k - 1), per = 360 / N, ant = tel[j] * per;
            function bl(n){ var t = R0.teken.tabel([['antwoord', 'frequentie'].concat(n >= 3 ? ['graden'] : [])].concat(ws.map(function(x, i){ return [x, String(tel[i])].concat(n >= 3 ? [T(tel[i] * per) + '°'] : []); })), { kop:true, nadruk:[[j + 1, 0]] });
              return n >= 3 ? stapel(t, cirkel(tel.map(function(x){ return x * per; }), ws.map(function(x, i){ return x + ' ' + T(tel[i] * per) + '°'; }), { nad:[j] })) : t; }
            return { vraag:'Hoeveel graden voor ' + ws[j] + '?', context:'Je tekent een cirkeldiagram bij de antwoorden van een groep leerlingen op de vraag "' + w.vr + '" Hoeveel graden wordt het stuk van ' + ws[j] + '?', eenheid:'°', antwoord:gAnt(ant, '°'), beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Het totaal: ' + tel.join(' + ') + ' =', N, 'Tel alle frequenties op.'),
              S('De hele cirkel is 360°. Eén leerling krijgt 360 : ' + N + ' =', gAnt(per, '°'), '360 gedeeld door ' + N + '.', null, { e:'°' }),
              S('Het stuk van ' + ws[j] + ': ' + tel[j] + ' ' + X + ' ' + T(per) + ' =', gAnt(ant, '°'), 'Doe de frequentie keer het aantal graden per leerling.', F(gAnt(ant, '°'), tel[j], 'Dat is de frequentie. Reken het om naar graden.'), { e:'°' }) ] };
          } },
        { id:'wst-cirkel-terug', naam:'Een cirkeldiagram met graden aflezen', kort:'Deel de graden door 360 en reken dat om naar procent; neem dan dat procent van het totaal',
          uit:'<p>Staan er bij een cirkeldiagram <b>graden</b>, dan reken je eerst uit welk <b>deel</b> van de cirkel het is: <b>graden : 360</b>.</p><p>Maak er procenten van. 90° is 90 : 360 = 0,25 = <b>25%</b>, een kwart van de cirkel.</p><p>Neem daarna dat procent van het <b>totaal</b>. 25% van 200 leerlingen is 50 leerlingen.</p>',
          wanneer:'er graden bij een cirkeldiagram staan en je het aantal zoekt.',
          maak:function(R){
            var w = R.kies(WOORD_IT), k = R.heel(3, 4), ws = R.hussel(w.w).slice(0, k), del = verdeel(R, 20, k, 2).map(function(x){ return x * 18; }), N = R.kies([200, 240, 300, 360, 400, 480, 500, 600, 800]), j = R.heel(0, k - 1), g = del[j], p = g / 3.6, ant = p * N / 100;
            p = Math.round(p); ant = Math.round(ant);
            var bl = function(n){ return cirkel(del, ws.map(function(x, i){ return x + ' ' + del[i] + '°'; }), { nad:[j], aria:'cirkeldiagram met graden' }); };
            return { vraag:'Hoeveel: ' + ws[j] + '?', context:'Aan ' + T(N) + ' leerlingen is gevraagd: "' + w.vr + '" In het cirkeldiagram staat bij elk stuk hoeveel graden het is. Hoeveel leerlingen antwoordden "' + ws[j] + '"?', eenheid:'leerlingen', beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Welk deel van de cirkel is ' + ws[j] + '? ' + g + ' : 360 = (in procenten)', gAnt(p, '%'), g + ' : 360 = ' + T(g / 360) + '. Keer 100 is ' + p + '%.', F(gAnt(p, '%'), g, 'Dat zijn de graden. Deel door 360 en maak er procenten van.'), { e:'%' }),
              S(p + '% van ' + T(N) + ' =', ant, '1% is ' + T(N / 100) + '. Doe dat keer ' + p + '.', F(ant, g, 'Dat zijn de graden, geen leerlingen.'), { e:'leerlingen' }) ] };
          } }
      ] },

    /* ================= kansen (onderbouw) ================= */
    { groep:{ id:'wst-kans', niveau:'onderbouw', domein:'statistiek', naam:'Kansen',
        uit:'Een kans als breuk en als procent, de kans bij een dobbelsteen en de kans bij twee dobbelstenen met een rooster.' },
      doelen:[
        { id:'wst-kans-breuk', naam:'Kans als breuk', kort:'Kans = het aantal gunstige uitkomsten gedeeld door het totaal aantal uitkomsten',
          uit:'<p>Een <b>kans</b> schrijf je als breuk: <b>gunstig</b> boven de streep, <b>totaal</b> eronder.</p><p><b>Gunstig</b> zijn de uitkomsten die je wilt. Het <b>totaal</b> zijn alle uitkomsten die kunnen, als ze allemaal even makkelijk gebeuren.</p><p>Voorbeeld: in een zak zitten 3 rode en 5 blauwe knikkers. Je pakt er blind één. De kans op rood is <b>3/8</b>.</p>',
          wanneer:'alle uitkomsten even grote kans hebben, zoals bij blind pakken of loten.',
          maak:function(R){
            var kl = R.hussel([['rood', 'rode'], ['blauw', 'blauwe'], ['groen', 'groene'], ['geel', 'gele'], ['wit', 'witte']]).slice(0, 3), a = [R.heel(2, 9), R.heel(2, 9), R.heel(2, 9)], N = som(a);
            var soort = R.kies(['een', 'een', 'twee', 'niet']), g, wat, ding = R.kies([['knikkers', 'knikker'], ['snoepjes', 'snoepje'], ['ballen', 'bal']]);
            if (soort === 'een'){ g = a[0]; wat = 'een ' + kl[0][1] + ' ' + ding[1]; }
            else if (soort === 'twee'){ g = a[0] + a[1]; wat = 'een ' + kl[0][1] + ' of een ' + kl[1][1] + ' ' + ding[1]; }
            else { g = a[0] + a[1]; wat = 'geen ' + kl[2][1] + ' ' + ding[1]; }
            var zin = 'In een zak zitten ' + a[0] + ' ' + kl[0][1] + ', ' + a[1] + ' ' + kl[1][1] + ' en ' + a[2] + ' ' + kl[2][1] + ' ' + ding[0] + '. Je pakt er blind één.';
            var hint2 = soort === 'een' ? 'Er zitten ' + a[0] + ' ' + kl[0][1] + ' ' + ding[0] + ' in.' : soort === 'twee' ? kl[0][1] + ' en ' + kl[1][1] + ' samen: ' + a[0] + ' + ' + a[1] + '.' : 'Geen ' + kl[2][0] + ' is ' + kl[0][0] + ' of ' + kl[1][0] + ': ' + a[0] + ' + ' + a[1] + '.';
            return kansOp({ vraag:'Kans op ' + wat + '?', context:zin + ' Hoe groot is de kans op ' + wat + '? Geef je antwoord als breuk.', stappen:[
              S('Hoeveel ' + ding[0] + ' zitten er in totaal in de zak?', N, a.join(' + ') + ' = ' + N + '.'),
              S('Hoeveel daarvan zijn gunstig (' + wat + ')?', g, hint2),
              kansStap('De kans: gunstig : totaal =', g, N, 'Gunstig boven de streep, totaal eronder: ' + br(g, N) + '.', F(brAnt(g, N), br(g, N - g), 'Onder de streep komt het totaal: alle ' + N + ' ' + ding[0] + '.', br(N, g), 'Andersom: gunstig boven de streep.')) ] }, g, N);
          } },
        { id:'wst-kans-proc', naam:'Kans als procent', kort:'Deel de teller door de noemer en doe keer 100',
          uit:'<p>Een kans kun je ook als <b>kommagetal</b> of als <b>procent</b> schrijven.</p><p>Deel de <b>teller door de noemer</b>: dat is het kommagetal. Doe dat <b>keer 100</b>: dat is het procent.</p><p>Voorbeeld: kans 3/8. 3 : 8 = 0,375. Keer 100 is <b>37,5%</b>.</p><p>Een kans ligt altijd tussen 0 (kan niet) en 1, ofwel tussen 0% en 100% (zeker).</p>',
          wanneer:'je kansen wilt vergelijken of een kans in procenten moet geven.',
          maak:function(R){
            var n = R.kies([4, 5, 8, 10, 20, 25, 40, 50]), t;
            do { t = R.heel(1, n - 1); } while (n > 10 && ggd(t, n) === n / 2);
            var e = R.kies([
              { zin:'Een rad van fortuin heeft ' + n + ' even grote vakken. ' + (t === 1 ? '1 vak is' : t + ' vakken zijn') + ' rood. Je draait één keer.', wat:'rood' },
              { zin:'In een bak zitten ' + n + ' loten. ' + (t === 1 ? '1 lot wint' : t + ' loten winnen') + ' een prijs. Je trekt één lot.', wat:'een prijs' },
              { zin:'In een zak zitten ' + n + ' knikkers. ' + (t === 1 ? '1 knikker is' : t + ' knikkers zijn') + ' groen. Je pakt er blind één.', wat:'een groene knikker' } ]);
            var d = t / n, p = rnd(d * 100, 4);
            return { vraag:'Kans op ' + e.wat + ' in procenten?', context:e.zin + ' Hoe groot is de kans op ' + e.wat + ', in procenten?', eenheid:'%', antwoord:gAnt(p, '%'), stappen:[
              kansStap('De kans als breuk:', t, n, 'Gunstig boven de streep, totaal eronder: ' + br(t, n) + '.'),
              S('Als kommagetal: ' + t + ' : ' + n + ' =', d, 'Deel ' + t + ' door ' + n + '.', F(d, rnd(n / t, 4), 'Andersom: deel de teller door de noemer.')),
              S('In procenten: ' + T(d) + ' ' + X + ' 100 =', gAnt(p, '%'), 'Keer 100: de komma twee plaatsen naar rechts.', F(gAnt(p, '%'), d, 'Doe het kommagetal nog keer 100.'), { e:'%' }) ] };
          } },
        { id:'wst-kans-dobbel', naam:'Kans bij een dobbelsteen', kort:'Een dobbelsteen heeft 6 uitkomsten; tel welke ogen erbij horen',
          uit:'<p>Een gewone <b>dobbelsteen</b> heeft <b>6 uitkomsten</b>: 1, 2, 3, 4, 5 en 6. Ze hebben allemaal even veel kans.</p><p>Schrijf op welke ogen <b>gunstig</b> zijn en tel ze. Let goed op de woorden: <b>meer dan 4</b> is 5 en 6 (de 4 telt niet mee). <b>Minstens 4</b> is 4, 5 en 6 (de 4 telt wel mee).</p><p>Voorbeeld: de kans op een even getal. Gunstig zijn 2, 4 en 6. De kans is <b>3/6</b> = 1/2.</p>',
          wanneer:'je de kans zoekt bij één worp met een dobbelsteen.',
          maak:function(R){
            var k = R.heel(2, 5), e = R.kies([
              { wat:'een even getal', o:[2, 4, 6] }, { wat:'een oneven getal', o:[1, 3, 5] }, { wat:'meer dan ' + k, o:[], f:'mt' }, { wat:'minder dan ' + k, o:[], f:'mn' },
              { wat:'minstens ' + k, o:[], f:'ms' }, { wat:'hoogstens ' + k, o:[], f:'hs' }, { wat:'een getal uit de tafel van 3', o:[3, 6] }, { wat:'geen zes', o:[1, 2, 3, 4, 5] } ]);
            var ogen = [1, 2, 3, 4, 5, 6], fout = null;
            if (e.f === 'mt'){ e.o = ogen.filter(function(x){ return x > k; }); fout = F(e.o.length, e.o.length + 1, 'Meer dan ' + k + ': de ' + k + ' zelf telt niet mee.'); }
            if (e.f === 'mn'){ e.o = ogen.filter(function(x){ return x < k; }); fout = F(e.o.length, e.o.length + 1, 'Minder dan ' + k + ': de ' + k + ' zelf telt niet mee.'); }
            if (e.f === 'ms'){ e.o = ogen.filter(function(x){ return x >= k; }); fout = F(e.o.length, e.o.length - 1, 'Minstens ' + k + ': de ' + k + ' zelf telt wel mee.'); }
            if (e.f === 'hs'){ e.o = ogen.filter(function(x){ return x <= k; }); fout = F(e.o.length, e.o.length - 1, 'Hoogstens ' + k + ': de ' + k + ' zelf telt wel mee.'); }
            var g = e.o.length, bl = function(n){ return stenen(n >= 2 ? e.o : []); };
            return kansOp({ vraag:'Kans op ' + e.wat + '?', context:'Je gooit één keer met een gewone dobbelsteen. Hoe groot is de kans op ' + e.wat + '? Geef je antwoord als breuk.', beeld:bl, stappen:[
              S('Hoeveel uitkomsten heeft een dobbelsteen?', 6, 'Een dobbelsteen heeft zes kanten: 1 tot en met 6.'),
              S('Welke ogen zijn gunstig voor ' + e.wat + '? Hoeveel zijn dat?', g, 'Gunstig zijn: ' + e.o.join(', ') + '.', fout),
              kansStap('De kans:', g, 6, 'Gunstig boven de streep, 6 eronder: ' + br(g, 6) + '.') ] }, g, 6);
          } },
        { id:'wst-kans-rooster', naam:'Kans bij twee dobbelstenen: het rooster', kort:'Zet de ene dobbelsteen links en de andere boven; er zijn 36 vakjes en je telt de gunstige',
          uit:'<p>Gooi je met <b>twee dobbelstenen</b>, dan zijn er 6 · 6 = <b>36 uitkomsten</b>. Die zet je in een <b>rooster</b>: de ene dobbelsteen links, de andere boven.</p><p>In elk vakje schrijf je wat je zoekt, bijvoorbeeld de <b>som</b> van de twee. Kleur de vakjes die <b>gunstig</b> zijn en tel ze.</p><p>Voorbeeld: som 4 komt voor bij 1 en 3, 2 en 2, 3 en 1. Dat zijn 3 vakjes. De kans is <b>3/36</b>.</p>',
          wanneer:'je met twee dobbelstenen gooit en de kans zoekt op een som, een verschil of dubbel.',
          maak:function(R){
            var soort = R.kies(['som', 'som', 'meer', 'minder', 'dubbel', 'verschil']), s, f, tek = '+', wat, fun = function(a, b){ return a + b; };
            if (soort === 'som'){ s = R.heel(3, 11); wat = 'een som van ' + s; f = function(a, b){ return a + b === s; }; }
            else if (soort === 'meer'){ s = R.heel(7, 10); wat = 'een som van meer dan ' + s; f = function(a, b){ return a + b > s; }; }
            else if (soort === 'minder'){ s = R.heel(4, 7); wat = 'een som van minder dan ' + s; f = function(a, b){ return a + b < s; }; }
            else if (soort === 'dubbel'){ wat = 'twee dezelfde ogen (dubbel)'; f = function(a, b){ return a === b; }; }
            else { s = R.heel(1, 3); tek = MIN; wat = 'een verschil van ' + s; fun = function(a, b){ return Math.abs(a - b); }; f = function(a, b){ return Math.abs(a - b) === s; }; }
            var g = 0; for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) if (f(a, b)) g++;
            var bl = function(n){ return rooster2(tek, fun, n >= 2 ? f : null); };
            var uitleg = soort === 'dubbel' ? 'De dubbele staan op de schuine lijn: 1 en 1, 2 en 2, enzovoort.' : soort === 'verschil' ? 'In het rooster staat in elk vakje het grootste min het kleinste getal. Zoek de vakjes met ' + s + '.' : 'Zoek in het rooster de vakjes met ' + (soort === 'som' ? 'som ' + s : soort === 'meer' ? 'een som groter dan ' + s + ' (' + s + ' zelf niet)' : 'een som kleiner dan ' + s + ' (' + s + ' zelf niet)') + '.';
            return kansOp({ vraag:'Kans op ' + wat + '?', context:'Je gooit met twee dobbelstenen. Hoe groot is de kans op ' + wat + '? Gebruik het rooster. Geef je antwoord als breuk.', beeld:bl, zelfBeeld:bl(0), stappen:[
              S('Hoeveel vakjes heeft het rooster?', 36, '6 rijen en 6 kolommen: 6 ' + X + ' 6.', F(36, 12, 'Het zijn 6 rijen van 6 vakjes: vermenigvuldig.')),
              S('Hoeveel vakjes zijn gunstig voor ' + wat + '?', g, uitleg + ' Het zijn er ' + g + '.'),
              kansStap('De kans:', g, 36, 'Gunstig boven de streep, 36 eronder: ' + br(g, 36) + '.', F(brAnt(g, 36), br(g, 12), 'Er zijn 36 uitkomsten, niet 12.', br(g, 11), 'Er zijn 36 uitkomsten.')) ] }, g, 36);
          } }
      ] },

    /* ================= aantallen tellen (onderbouw) ================= */
    { groep:{ id:'wst-tellen', niveau:'onderbouw', domein:'statistiek', naam:'Aantallen tellen',
        uit:'Tellen hoeveel routes, combinaties of uitkomsten er zijn: met een wegendiagram, met een boomdiagram of met de vermenigvuldigingsregel. En kiezen welke manier het handigst is.' },
      doelen:[
        { id:'wst-tel-wegen', naam:'Routes tellen met een wegendiagram', kort:'Schrijf bij elk punt hoeveel routes erheen gaan; vermenigvuldig langs de weg en tel op waar wegen samenkomen',
          uit:'<p>Bij een <b>wegendiagram</b> schrijf je bij elk punt hoeveel <b>routes</b> er naartoe gaan. Bij het begin is dat 1.</p><p>Gaan er 3 wegen van A naar B, dan schrijf je bij B een 3. Gaan er daarna 2 wegen van B naar C, dan kan elke route op 2 manieren verder: bij C komt <b>3 · 2 = 6</b>.</p><p>Komen er bij een punt routes van <b>twee kanten</b> samen, dan <b>tel</b> je ze op.</p>',
          wanneer:'je routes telt op een kaart met wegen die splitsen en weer samenkomen.',
          maak:function(R){ return wegOp(R, R.kies(['direct', 'twee', 'keten'])); } },
        { id:'wst-tel-boom', naam:'Mogelijkheden tellen met een boomdiagram', kort:'Elke keuze splitst de takken; tel de eindjes, of tel alleen de eindjes die passen',
          uit:'<p>Bij een <b>boomdiagram</b> teken je voor de eerste keuze een tak per mogelijkheid. Aan het eind van elke tak teken je de takken voor de volgende keuze.</p><p>Elk <b>eindje</b> van de boom is één mogelijkheid. Tel de eindjes en je weet hoeveel mogelijkheden er zijn.</p><p>Het mooie: je ziet ze ook <b>allemaal</b>. Zoek je bijvoorbeeld de uitkomsten met <b>precies twee keer kop</b> bij drie keer gooien, dan wijs je die eindjes aan en tel je ze.</p>',
          wanneer:'er niet te veel mogelijkheden zijn en je ze allemaal wilt zien.',
          maak:function(R){ return R.heel(0, 1) ? boomOp(R) : boomCombi(R); } },
        { id:'wst-tel-regel', naam:'De vermenigvuldigingsregel', kort:'Doe het aantal mogelijkheden van elke keuze keer elkaar',
          uit:'<p>Moet je een paar keer na elkaar kiezen, dan vermenigvuldig je de aantallen: dat is de <b>vermenigvuldigingsregel</b>.</p><p>Voorbeeld: 4 broeken, 5 shirts en 3 paar schoenen. Je kunt 4 · 5 · 3 = <b>60</b> verschillende outfits maken.</p><p>Let op als iets <b>niet twee keer</b> kan. Bij 8 lopers kan iedereen eerste worden, maar daarna zijn er nog 7 over voor de tweede plaats: 8 · 7 = 56.</p>',
          wanneer:'er veel mogelijkheden zijn en je alleen het aantal wilt weten.',
          maak:function(R){ return regelOp(R, false); } },
        { id:'wst-tel-kies', naam:'Kies de handigste manier', kort:'Wegen op een kaart: wegendiagram. Weinig uitkomsten die je moet zien: boomdiagram. Veel en alleen het aantal: de regel',
          uit:'<p>Je kent drie manieren om te tellen. Kijk eerst wat voor opgave het is.</p><p>Een <b>kaart met wegen</b> die splitsen en samenkomen? Gebruik een <b>wegendiagram</b>.</p><p><b>Weinig uitkomsten</b> en je moet zien welke passen, zoals precies twee keer kop? Teken een <b>boomdiagram</b>.</p><p><b>Heel veel</b> mogelijkheden en je wilt alleen het aantal? Gebruik de <b>vermenigvuldigingsregel</b>.</p>',
          wanneer:'je de drie manieren kent en zelf moet kiezen.',
          maak:function(R){
            var soort = R.kies(['wegen', 'boom', 'regel']), op, goed, hint;
            if (soort === 'wegen'){ op = wegOp(R, R.kies(['direct', 'twee'])); goed = 'een wegendiagram'; hint = 'Er is een kaart met wegen die splitsen en weer samenkomen. Schrijf bij elk punt hoeveel routes erheen gaan.'; }
            else if (soort === 'boom'){ op = boomOp(R); goed = 'een boomdiagram'; hint = 'Er zijn maar 8 uitkomsten en je moet zien welke passen. Schrijf ze allemaal op in een boom.'; }
            else { op = regelOp(R, true); goed = 'de vermenigvuldigingsregel'; hint = 'Er zijn heel veel mogelijkheden en je wilt alleen het aantal. Een boom wordt veel te groot: vermenigvuldig.'; }
            var b = op.beeld;
            if (typeof b === 'function') op.beeld = function(n){ return b(Math.max(0, n - 1)); };
            op.stappen.unshift(K(R, 'Welke manier is hier het handigst?', goed, [], hint, { orde:['een wegendiagram', 'een boomdiagram', 'de vermenigvuldigingsregel'] }));
            return op;
          } }
      ] },

    /* ================= frequenties en diagrammen (vmbo) ================= */
    { groep:{ id:'wst-vfreq', niveau:'vmbo', domein:'statistiek', naam:'Cumulatief, steelblad en histogram',
        uit:'Cumulatieve frequenties uitrekenen, een somfrequentiepolygoon, een steelbladdiagram en een histogram aflezen. Het gemiddelde bij klassen, kwartielen en de boxplot staan bij Klassen, kwartielen en de boxplot.' },
      doelen:[
        { id:'wst-cumfreq', naam:'Cumulatieve frequentie', kort:'Tel de frequenties steeds op: de cumulatieve frequentie zegt hoeveel er tot en met die klasse zijn',
          uit:'<p><b>Cumulatief</b> betekent: steeds <b>optellen</b>. De cumulatieve frequentie van een klasse is de frequentie van die klasse plus alle klassen ervoor.</p><p>Bij de eerste klasse is het gewoon de frequentie. Daarna tel je steeds de volgende frequentie erbij.</p><p>Zo zie je meteen hoeveel er <b>minder dan</b> een grens zijn. Staat bij "20 tot 30" cumulatief 18, dan zijn er 18 met minder dan 30.</p>',
          wanneer:'je wilt weten hoeveel er onder een grens zitten.',
          maak:function(R){
            var it = R.kies([{ wat:'de reistijden van leerlingen naar school', eh:'minuten', s:0, w:10, wie:'leerlingen' }, { wat:'de lengtes van leerlingen', eh:'cm', s:150, w:5, wie:'leerlingen' }, { wat:'de wachttijden bij de kassa', eh:'minuten', s:0, w:2, wie:'klanten' }, { wat:'de punten bij een toets', eh:'punten', s:20, w:10, wie:'leerlingen' }]);
            var k = 5, f = [], c = [], i, t = 0;
            for (i = 0; i < k; i++){ f.push(R.heel(2, 15)); t += f[i]; c.push(t); }
            var N = t, j = R.heel(1, 3), meer = R.heel(0, 2) === 0, G = it.s + (j + 1) * it.w;
            function kl(i2){ return T(it.s + i2 * it.w) + ' tot ' + T(it.s + (i2 + 1) * it.w); }
            function tab(n){ return R0.teken.tabel([[it.eh, 'frequentie', 'cumulatief']].concat(f.map(function(x, i2){ return [kl(i2), String(x), i2 < n && i2 <= j ? String(c[i2]) : '']; })), { kop:true, nadruk:n > j ? [[j + 1, 2]] : [] }); }
            var st = [S('De eerste klasse, ' + kl(0) + ': de cumulatieve frequentie is gewoon de frequentie:', c[0], 'Er is nog niets om bij op te tellen.')];
            for (i = 1; i <= j; i++) st.push(S('Tel de frequentie van ' + kl(i) + ' erbij: ' + c[i - 1] + ' + ' + f[i] + ' =', c[i], 'De vorige cumulatieve frequentie plus de frequentie van deze klasse.', F(c[i], f[i], 'Dat is alleen de frequentie. Tel de cumulatieve frequentie van de klasse ervoor erbij.')));
            var vraag = meer ? 'Hoeveel ' + it.wie + ': ' + T(G) + ' ' + it.eh + ' of meer?' : 'Hoeveel ' + it.wie + ': minder dan ' + T(G) + ' ' + it.eh + '?';
            if (meer) st.push(S('In totaal zijn er ' + N + ' ' + it.wie + '. ' + T(G) + ' of meer: ' + N + ' ' + MIN + ' ' + c[j] + ' =', N - c[j], 'Alle ' + it.wie + ' min de ' + it.wie + ' met minder dan ' + T(G) + '.', F(N - c[j], c[j], 'Dat zijn er minder dan ' + T(G) + '. Je zoekt de rest.')));
            return { vraag:vraag, context:'De tabel laat zien: ' + it.wat + '. "' + kl(0) + '" betekent: vanaf ' + T(it.s) + ' tot ' + T(it.s + it.w) + '. Vul de kolom cumulatief in, tot en met de klasse ' + kl(j) + '.', eenheid:it.wie, beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wst-somfreq', naam:'Een somfrequentiepolygoon aflezen', kort:'Bij een grens lees je af hoeveel er minder dan die grens zijn; het hoogste punt is het totaal',
          uit:'<p>Een <b>somfrequentiepolygoon</b> is de grafiek van de cumulatieve frequentie. Elke stip staat bij de <b>rechtergrens</b> van een klasse.</p><p>Bij een grens lees je af hoeveel er <b>minder dan</b> die grens zijn. Het <b>hoogste punt</b> is het totaal.</p><p>Zoek je hoeveel er <b>meer</b> dan een grens zijn, doe dan het totaal min wat je afleest. Tussen twee grenzen: lees beide af en trek ze van elkaar af.</p>',
          wanneer:'je in een somfrequentiepolygoon wilt aflezen hoeveel er onder, boven of tussen grenzen zitten.',
          maak:function(R){
            var it = R.kies([{ wat:'de reistijden van leerlingen naar school', eh:'minuten', s:0, w:10, wie:'leerlingen' }, { wat:'de lengtes van leerlingen', eh:'cm', s:150, w:5, wie:'leerlingen' }, { wat:'de gewichten van pakketjes', eh:'kg', s:0, w:2, wie:'pakketjes' }, { wat:'de tijden op de 1000 meter', eh:'minuten', s:3, w:1, wie:'lopers' }]);
            var k = 5, f, c, N, g = [], i;
            for (i = 0; i <= k; i++) g.push(it.s + i * it.w);
            do { f = []; for (i = 0; i < k; i++) f.push(5 * R.heel(1, 6)); N = som(f); } while (N > 100 || N < 40);
            c = [0]; for (i = 0; i < k; i++) c.push(c[i] + f[i]);
            var max = Math.ceil(N / 10) * 10, soort = R.kies(['minder', 'meer', 'tussen']), st, ant, vraag, lees, a, b, hint = 'Eén hokje op de verticale as is 5.';
            if (soort === 'minder'){
              a = R.heel(1, k - 1); ant = c[a]; lees = [a];
              vraag = 'Hoeveel ' + it.wie + ': minder dan ' + T(g[a]) + ' ' + it.eh + '?';
              st = [K(R, 'Wat lees je af bij een stip van de somfrequentiepolygoon?', 'hoeveel er minder dan die grens zijn', ['hoeveel er precies op die grens zitten', 'hoeveel er meer dan die grens zijn'], 'De somfrequentie telt alles op tot die grens.'),
                S('Ga bij ' + T(g[a]) + ' recht omhoog naar de lijn en dan naar links. Lees af:', ant, hint, F(ant, f[a - 1], 'Dat is alleen de frequentie van de klasse ervoor. Lees de hoogte van de stip af.'), { e:it.wie })];
            } else if (soort === 'meer'){
              a = R.heel(1, k - 1); ant = N - c[a]; lees = [a, k];
              vraag = 'Hoeveel ' + it.wie + ': ' + T(g[a]) + ' ' + it.eh + ' of meer?';
              st = [S('Lees af bij ' + T(g[a]) + ':', c[a], hint, null, { e:it.wie }), S('Het totaal: lees af bij het hoogste punt.', N, 'De laatste stip, helemaal rechts. ' + hint, null, { e:it.wie }),
                S(T(g[a]) + ' of meer: ' + N + ' ' + MIN + ' ' + c[a] + ' =', ant, 'Het totaal min wat onder ' + T(g[a]) + ' zit.', F(ant, c[a], 'Dat zijn er minder dan ' + T(g[a]) + '. Je zoekt de rest.'), { e:it.wie })];
            } else {
              a = R.heel(1, k - 2); b = R.heel(a + 1, k - 1); ant = c[b] - c[a]; lees = [a, b];
              vraag = 'Hoeveel ' + it.wie + ': van ' + T(g[a]) + ' tot ' + T(g[b]) + ' ' + it.eh + '?';
              st = [S('Lees af bij ' + T(g[a]) + ':', c[a], hint, null, { e:it.wie }), S('Lees af bij ' + T(g[b]) + ':', c[b], hint, null, { e:it.wie }),
                S('Tussen ' + T(g[a]) + ' en ' + T(g[b]) + ': ' + c[b] + ' ' + MIN + ' ' + c[a] + ' =', ant, 'Wat onder ' + T(g[b]) + ' zit, min wat onder ' + T(g[a]) + ' zit.', null, { e:it.wie })];
            }
            var lk = soort === 'minder' ? 1 : 0;
            var bl = function(n){ return somPoly(g, c, { max:max, stap:5, elk:2, yas:'cumulatieve frequentie', xas:it.eh, lees:lees.slice(0, Math.max(0, Math.min(n - lk, lees.length))), aria:'somfrequentiepolygoon van ' + it.wat }); };
            return { vraag:vraag, context:'De somfrequentiepolygoon laat zien: ' + it.wat + ', in ' + it.eh + '.', eenheid:it.wie, beeld:bl, zelfBeeld:bl(0), stappen:st, antwoord:T(ant) };
          } },
        { id:'wst-steelblad', naam:'Een steelbladdiagram aflezen', kort:'Steel en blad samen vormen het getal: 4 | 7 is 47; de blaadjes staan al op volgorde',
          uit:'<p>In een <b>steelbladdiagram</b> staat links de <b>steel</b>: de tientallen. Rechts staan de <b>blaadjes</b>: de eenheden.</p><p>Steel 4 met blad 7 is het getal <b>47</b>. Staan er bij steel 4 de blaadjes 2 5 7, dan zijn dat de getallen 42, 45 en 47.</p><p>De blaadjes staan <b>op volgorde</b>. Zo vind je snel het kleinste en grootste getal, en de mediaan door de blaadjes te tellen.</p>',
          wanneer:'gegevens in een steelbladdiagram staan.',
          maak:function(R){
            var it = R.kies([{ wat:'de lengtes van een groep leerlingen', eh:'cm', s0:R.heel(14, 15) }, { wat:'de punten bij een toets', eh:'punten', s0:R.heel(3, 5) }, { wat:'de hartslag van een groep sporters', eh:'slagen per minuut', s0:R.heel(6, 7) }, { wat:'de gewichten van een groep honden', eh:'kg', s0:R.heel(1, 2) }]);
            var ns = 4, bl = [], i, n, waarden;
            do { bl = []; for (i = 0; i < ns; i++){ var m = R.heel(1, 6), l = []; for (var j = 0; j < m; j++) l.push(R.heel(0, 9)); bl.push(l.sort(function(a, b){ return a - b; })); }
              waarden = []; bl.forEach(function(l, i2){ l.forEach(function(b){ waarden.push((it.s0 + i2) * 10 + b); }); }); n = waarden.length;
            } while (n < 11 || n > 17);
            var soort = R.kies(['mediaan', 'mediaan', 'spreiding']), st, ant, plek = [];
            function pos(idx){ var t = 0; for (var r = 0; r < ns; r++){ if (idx < t + bl[r].length) return [r, idx - t + 1]; t += bl[r].length; } }
            if (soort === 'mediaan'){
              if (n % 2){ var p = (n + 1) / 2; ant = waarden[p - 1]; plek = [pos(p - 1)];
                st = [S('Hoeveel getallen staan er in het diagram? Tel de blaadjes.', n, 'Per steel: ' + bl.map(function(l){ return l.length; }).join(' + ') + ' = ' + n + '.'),
                  S('Het middelste getal staat op plek nummer', p, '(' + n + ' + 1) : 2 = ' + p + '.'),
                  S('Tel de blaadjes vanaf boven tot nummer ' + p + '. De mediaan is:', ant, 'Getal nummer ' + p + ' is ' + ant + '.', F(ant, ant % 10, 'Dat is alleen het blad. Zet de steel ervoor.'), { e:it.eh })];
              } else { var h = n / 2, a = waarden[h - 1], b = waarden[h]; ant = (a + b) / 2; plek = [pos(h - 1), pos(h)];
                st = [S('Hoeveel getallen staan er in het diagram? Tel de blaadjes.', n, 'Per steel: ' + bl.map(function(l){ return l.length; }).join(' + ') + ' = ' + n + '.'),
                  S('De twee middelste zijn nummer ' + h + ' en ' + (h + 1) + '. Wat is getal nummer ' + h + '?', a, 'Tel de blaadjes vanaf boven. Nummer ' + h + ' is ' + a + '.', F(a, a % 10, 'Dat is alleen het blad. Zet de steel ervoor.')),
                  S('Getal nummer ' + (h + 1) + ' is ' + b + '. De mediaan: (' + a + ' + ' + b + ') : 2 =', ant, 'Precies tussen ' + a + ' en ' + b + '.', F(ant, a + b, 'Deel nog door 2.'), { e:it.eh })];
              }
            } else {
              var mn = waarden[0], mx = waarden[n - 1]; ant = mx - mn; plek = [pos(0), pos(n - 1)];
              st = [S('Het kleinste getal (de eerste steel met het eerste blad):', mn, 'Steel ' + it.s0 + ' met blad ' + bl[0][0] + '.', F(mn, bl[0][0], 'Dat is alleen het blad. Zet de steel ervoor.'), { e:it.eh }),
                S('Het grootste getal (de laatste steel met het laatste blad):', mx, 'Steel ' + (it.s0 + ns - 1) + ' met blad ' + bl[ns - 1][bl[ns - 1].length - 1] + '.', F(mx, bl[ns - 1][bl[ns - 1].length - 1], 'Dat is alleen het blad. Zet de steel ervoor.'), { e:it.eh }),
                S('De spreidingsbreedte: ' + mx + ' ' + MIN + ' ' + mn + ' =', ant, 'Grootste min kleinste.', null, { e:it.eh })];
            }
            var maxl = Math.max.apply(null, bl.map(function(l){ return l.length; })), vb = it.s0 * 10 + bl[0][0];
            var tab = function(k){ return stapel(R0.teken.tabel(bl.map(function(l, r){ var x = [String(it.s0 + r)].concat(l.map(String)); while (x.length < maxl + 1) x.push(''); return x; }), { zijkop:true, nadruk:k >= st.length ? plek : [] }), notitie('Lees zo: ' + it.s0 + ' | ' + bl[0][0] + ' betekent ' + vb + ' ' + it.eh + '.')); };
            return { vraag:soort === 'mediaan' ? 'De mediaan?' : 'De spreidingsbreedte?', context:'Het steelbladdiagram laat zien: ' + it.wat + '. Wat is ' + (soort === 'mediaan' ? 'de mediaan' : 'de spreidingsbreedte') + '?', eenheid:it.eh, beeld:tab, zelfBeeld:tab(0), stappen:st, antwoord:T(ant) };
          } },
        { id:'wst-histogram', naam:'Een histogram aflezen', kort:'In een histogram staan de staven tegen elkaar; lees per klasse af en tel de staven op die je nodig hebt',
          uit:'<p>Een <b>histogram</b> is een staafdiagram voor <b>klassen</b>. De staven staan <b>tegen elkaar</b>, want de ene klasse begint waar de vorige ophoudt.</p><p>Onder de staven staan de <b>grenzen</b>. De staaf tussen 10 en 20 is de klasse "10 tot 20". De hoogte is de frequentie.</p><p>Zoek je hoeveel er minder dan 30 zijn, dan <b>tel</b> je alle staven links van 30 op.</p>',
          wanneer:'gegevens in klassen in een histogram staan.',
          maak:function(R){
            var it = R.kies([{ wat:'de reistijden van leerlingen naar school', eh:'minuten', s:0, w:10, wie:'leerlingen', st:2 }, { wat:'de lengtes van leerlingen', eh:'cm', s:150, w:5, wie:'leerlingen', st:2 }, { wat:'de leeftijden van de bezoekers van een concert', eh:'jaar', s:10, w:10, wie:'bezoekers', st:5 }, { wat:'de gametijden van leerlingen per dag', eh:'minuten', s:0, w:30, wie:'leerlingen', st:1 }]);
            var k = R.heel(5, 6), g = [], f = [], i;
            for (i = 0; i <= k; i++) g.push(it.s + i * it.w);
            for (i = 0; i < k; i++) f.push(it.st * R.heel(1, 10));
            var max = it.st * 10, soort = R.kies(['minder', 'meer', 'tussen']), idx, vraag;
            if (soort === 'minder'){ var m = R.heel(2, 3); idx = []; for (i = 0; i < m; i++) idx.push(i); vraag = 'Hoeveel ' + it.wie + ': minder dan ' + T(g[m]) + ' ' + it.eh + '?'; }
            else if (soort === 'meer'){ var m2 = R.heel(2, 3); idx = []; for (i = k - m2; i < k; i++) idx.push(i); vraag = 'Hoeveel ' + it.wie + ': ' + T(g[k - m2]) + ' ' + it.eh + ' of meer?'; }
            else { var a = R.heel(1, k - 3); idx = [a, a + 1]; vraag = 'Hoeveel ' + it.wie + ': van ' + T(g[a]) + ' tot ' + T(g[a + 2]) + ' ' + it.eh + '?'; }
            var ant = som(idx.map(function(j){ return f[j]; })), hint = 'Eén hokje op de verticale as is ' + it.st + '.';
            var st = idx.map(function(j){ return S('Lees af: de staaf van ' + T(g[j]) + ' tot ' + T(g[j + 1]) + '.', f[j], hint, null, { e:it.wie }); });
            st.push(S('Samen: ' + idx.map(function(j){ return f[j]; }).join(' + ') + ' =', ant, 'Tel de staven op.', null, { e:it.wie }));
            var bl = function(n){ return histo(g, f, { max:max, stap:it.st, elk:2, yas:it.wie, xas:it.eh, nad:idx, lees:idx.slice(0, Math.min(n, idx.length)), aria:'histogram van ' + it.wat }); };
            return { vraag:vraag, context:'Het histogram laat zien: ' + it.wat + ', in ' + it.eh + '.', eenheid:it.wie, beeld:bl, zelfBeeld:bl(0), stappen:st, antwoord:T(ant) };
          } }
      ] },

    /* ================= kansen (vmbo) ================= */
    { groep:{ id:'wst-vkans', niveau:'vmbo', domein:'statistiek', naam:'Kansen berekenen',
        uit:'Kansen uit een kruistabel, de kans dat iets niet gebeurt (de complementregel), de kans op minstens één keer, en hoe vaak je iets verwacht. Kansbomen staan bij havo.' },
      doelen:[
        { id:'wst-kruistabel', naam:'Kans met een kruistabel', kort:'Kijk uit welke groep je kiest: het totaal van die groep komt onder de streep',
          uit:'<p>In een <b>kruistabel</b> staan twee kenmerken tegelijk, bijvoorbeeld jongen of meisje en wel of niet sporten. Onderaan en rechts staan de <b>totalen</b>.</p><p>Het belangrijkste: <b>uit welke groep kies je?</b> Kies je uit iedereen, dan komt het grote totaal onder de streep. Kies je alleen uit de meisjes, dan komt het totaal van de meisjes onder de streep.</p><p>Boven de streep staat het getal in het vakje dat je zoekt.</p>',
          wanneer:'gegevens in een tabel met twee kenmerken staan.',
          maak:function(R){
            var c = R.kies(KT), a = [[R.heel(8, 45), R.heel(8, 45)], [R.heel(8, 45), R.heel(8, 45)]];
            var rt = [a[0][0] + a[0][1], a[1][0] + a[1][1]], kt = [a[0][0] + a[1][0], a[0][1] + a[1][1]], N = rt[0] + rt[1];
            var r = R.heel(0, 1), k = R.heel(0, 1), soort = R.kies(['alle', 'rij', 'kol']), cel = a[r][k], noem, zin, goed, opties;
            var oAlle = 'alle ' + N + ' ' + c.alle, oRij = 'de ' + rt[r] + ' ' + c.rijN[r], oKol = 'de ' + kt[k] + ' ' + c.kolN[k];
            if (soort === 'alle'){ noem = N; goed = oAlle; zin = 'Je kiest willekeurig iemand uit alle ' + N + ' ' + c.alle + '. Hoe groot is de kans op ' + c.cel[r][k] + '?'; }
            else if (soort === 'rij'){ noem = rt[r]; goed = oRij; zin = 'Je kiest willekeurig ' + c.rijEen[r] + '. Hoe groot is de kans ' + c.rijVr[r][k] + '?'; }
            else { noem = kt[k]; goed = oKol; zin = 'Je kiest willekeurig ' + c.kolEen[k] + '. Hoe groot is de kans ' + c.kolVr[r] + '?'; }
            opties = [oAlle, oRij, oKol];
            function tab(n){ var rij0 = [''].concat(c.kop).concat(['totaal']), t = [rij0];
              for (var i = 0; i < 2; i++){ t.push([c.rij[i]].concat([0, 1].map(function(j){ return i === r && j === k && n < 1 ? '?' : String(a[i][j]); })).concat([String(rt[i])])); }
              t.push(['totaal', String(kt[0]), String(kt[1]), String(N)]);
              var nd = n >= 1 ? [[r + 1, k + 1]] : [];
              if (n >= 2) nd.push(soort === 'alle' ? [3, 3] : soort === 'rij' ? [r + 1, 3] : [3, k + 1]);
              return R0.teken.tabel(t, { kop:true, zijkop:true, nadruk:nd }); }
            var andere = a[r][1 - k];
            return kansOp({ vraag:'De kans?', context:c.intro + ' Op één plek staat een vraagteken. ' + zin + ' Geef je antwoord als breuk.', beeld:tab, zelfBeeld:tab(0), stappen:[
              S('Het getal op de plek van het vraagteken: ' + rt[r] + ' ' + MIN + ' ' + andere + ' =', cel, 'Het totaal van de rij (' + rt[r] + ') min het andere vakje in die rij (' + andere + ').'),
              K(R, 'Uit welke groep kies je? Dat totaal komt onder de streep.', goed, [], soort === 'alle' ? 'Je kiest uit iedereen: het grote totaal rechtsonder.' : soort === 'rij' ? 'Je kiest alleen uit ' + c.rijN[r] + ': het totaal van hun rij.' : 'Je kiest alleen uit ' + c.kolN[k] + ': het totaal van hun kolom.', { orde:opties }),
              kansStap('De kans: ' + cel + ' : ' + noem + ' =', cel, noem, 'Het vakje boven de streep, het totaal van de groep eronder: ' + br(cel, noem) + '.', F(brAnt(cel, noem), br(cel, N), soort === 'alle' ? '' : 'Je kiest niet uit iedereen. Gebruik het totaal van de groep.', br(cel, soort === 'rij' ? kt[k] : rt[r]), 'Dat is het totaal van de verkeerde groep.')) ] }, cel, noem);
          } },
        { id:'wst-niet', naam:'De kans dat iets niet gebeurt', kort:'Kans op niet = 1 min de kans op wel (of 100% min de kans op wel)',
          uit:'<p>Iets gebeurt <b>wel</b> of <b>niet</b>. Die twee kansen samen zijn altijd <b>1</b>, ofwel <b>100%</b>.</p><p>Dus: <b>kans op niet = 1 − kans op wel</b>. Dat heet de <b>complementregel</b>.</p><p>Voorbeeld: de kans op regen is 0,3. De kans op geen regen is 1 − 0,3 = <b>0,7</b>. Als procent: 100% − 30% = 70%.</p><p>Soms is de kans op niet makkelijker uit te rekenen. Kans op een som van minstens 4 met twee dobbelstenen? Reken de kans op 2 of 3 uit, en doe 1 min dat.</p>',
          wanneer:'je de kans zoekt dat iets niet gebeurt, of als het tegenovergestelde makkelijker te tellen is.',
          maak:function(R){
            var soort = R.kies(['proc', 'dec', 'breuk', 'dob']);
            var zin = R.kies([['De kans dat het morgen regent, is {p}.', 'dat het morgen niet regent', 'geen regen'], ['De kans dat de bus te laat komt, is {p}.', 'dat de bus niet te laat komt', 'niet te laat'], ['De kans dat je met een kraslot wint, is {p}.', 'dat je niet wint', 'niet winnen'], ['De kans dat een zaadje opkomt, is {p}.', 'dat het zaadje niet opkomt', 'niet opkomen'], ['De kans dat een penalty raak is, is {p}.', 'dat de penalty mis is', 'mis']]);
            if (soort === 'proc'){
              var p; do { p = R.heel(3, 97); } while (p === 50);
              return { vraag:'Kans op ' + zin[2] + '?', context:zin[0].replace('{p}', p + '%') + ' Hoe groot is de kans ' + zin[1] + '?', eenheid:'%', antwoord:gAnt(100 - p, '%'), stappen:[
                S('Wel en niet samen hebben de kans:', gAnt(100, '%'), 'Het gebeurt zeker wel of niet. Zeker is 100%.', null, { e:'%' }),
                S('De kans op niet: 100% ' + MIN + ' ' + p + '% =', gAnt(100 - p, '%'), '100 min ' + p + '.', F(gAnt(100 - p, '%'), p, 'Dat is de kans op wel.'), { e:'%' }) ] };
            }
            if (soort === 'dec'){
              var q; do { q = R.heel(1, 99); } while (q === 50 || q % 10 === 0 && R.heel(0, 1));
              var opd = kansOp({ vraag:'Kans op ' + zin[2] + '?', context:zin[0].replace('{p}', T(q / 100)) + ' Hoe groot is de kans ' + zin[1] + '?', stappen:[
                S('Wel en niet samen hebben de kans:', '1', 'Het gebeurt zeker wel of niet. Zeker is een kans van 1.'),
                decStap('De kans op niet: 1 ' + MIN + ' ' + T(q / 100) + ' =', 100 - q, 100, 'Reken 1,00 ' + MIN + ' ' + T(q / 100, { dec:2, vast:true }) + '.', F([T((100 - q) / 100)], T(q / 100), 'Dat is de kans op wel.')) ] }, 100 - q, 100);
              opd.antwoord = [T((100 - q) / 100)].concat(opd.antwoord); return opd;
            }
            if (soort === 'breuk'){
              var n = R.kies([5, 6, 8, 10, 12, 20, 25]), t; do { t = R.heel(1, n - 1); } while (ggd(t, n) !== 1);
              return kansOp({ vraag:'Kans op ' + zin[2] + '?', context:zin[0].replace('{p}', br(t, n)) + ' Hoe groot is de kans ' + zin[1] + '? Geef je antwoord als breuk.', stappen:[
                S('Wel en niet samen hebben de kans 1. Schrijf 1 als breuk met noemer ' + n + ':', [br(n, n), '1'], '1 = ' + br(n, n) + '.', null, { controle:kansC(n, n) }),
                kansStap('De kans op niet: ' + br(n, n) + ' ' + MIN + ' ' + br(t, n) + ' =', n - t, n, n + ' ' + MIN + ' ' + t + ' = ' + (n - t) + '. De noemer blijft ' + n + '.', F(brAnt(n - t, n), br(t, n), 'Dat is de kans op wel.')) ] }, n - t, n);
            }
            var hoog = R.heel(0, 1), k = hoog ? R.heel(10, 11) : R.heel(4, 5), cmp = 0, x, y;
            for (x = 1; x <= 6; x++) for (y = 1; y <= 6; y++) if (hoog ? x + y > k : x + y < k) cmp++;
            var wat = 'een som van ' + (hoog ? 'hoogstens ' : 'minstens ') + k, goed = hoog ? 'een som van meer dan ' + k : 'een som van minder dan ' + k;
            var fout = hoog ? ['een som van minder dan ' + k, 'een som van ' + k] : ['een som van meer dan ' + k, 'een som van ' + k];
            var bl = function(n2){ return rooster2('+', function(a, b){ return a + b; }, n2 >= 2 ? function(a, b){ return hoog ? a + b > k : a + b < k; } : null); };
            return kansOp({ vraag:'Kans op ' + wat + '?', context:'Je gooit met twee dobbelstenen. Hoe groot is de kans op ' + wat + '? Tel het tegenovergestelde, dat is minder werk. Geef je antwoord als breuk.', beeld:bl, zelfBeeld:bl(0), stappen:[
              K(R, 'Wat is het tegenovergestelde van ' + wat + '?', goed, fout, (hoog ? 'Hoogstens ' + k + ' is ' + k + ' of minder. Het tegenovergestelde is alles boven ' + k : 'Minstens ' + k + ' is ' + k + ' of meer. Het tegenovergestelde is alles onder ' + k) + '.'),
              kansStap('De kans op ' + goed + ' (tel in het rooster):', cmp, 36, 'Er zijn ' + cmp + ' vakjes met ' + goed + '.'),
              kansStap('De kans op ' + wat + ': 1 ' + MIN + ' ' + br(cmp, 36) + ' =', 36 - cmp, 36, '1 = 36/36. 36 ' + MIN + ' ' + cmp + ' = ' + (36 - cmp) + '.', F(brAnt(36 - cmp, 36), br(cmp, 36), 'Dat is de kans op het tegenovergestelde. Doe 1 min deze kans.')) ] }, 36 - cmp, 36);
          } },
        { id:'wst-minstens', naam:'De kans op minstens één keer', kort:'Kans op minstens één = 1 min de kans op geen enkele keer',
          uit:'<p>Hoe groot is de kans op <b>minstens één</b> zes als je twee keer gooit? Dat kan op veel manieren. Het <b>tegenovergestelde</b> is veel makkelijker: <b>geen enkele</b> zes.</p><p>De kans op geen zes bij één worp is 5/6. Bij twee worpen is dat 5/6 · 5/6 = 25/36.</p><p>De kans op minstens één zes is dan <b>1 − 25/36 = 11/36</b>.</p>',
          wanneer:'je de kans zoekt dat iets minstens één keer gebeurt.',
          maak:function(R){
            var soort = R.kies(['dob', 'munt', 'knik', 'dec']), k, p, q, n, zin, wat, geen, isDec = false;
            if (soort === 'dob'){ k = R.heel(2, 3); q = 5; n = 6; zin = 'Je gooit ' + k + ' keer met een dobbelsteen.'; wat = 'minstens één zes'; geen = ['De kans op geen zes bij één worp:', 'De kans op ' + k + ' keer geen zes:', '5 van de 6 ogen zijn geen zes.']; }
            else if (soort === 'munt'){ k = R.heel(3, 4); q = 1; n = 2; zin = 'Je gooit ' + k + ' keer met een munt.'; wat = 'minstens één keer kop'; geen = ['De kans op munt (geen kop) bij één worp:', 'De kans op ' + k + ' keer munt:', 'Kop of munt: 1 van de 2.']; }
            else if (soort === 'knik'){ var rd = R.heel(1, 4), bl = R.heel(2, 6); k = 2; q = bl; n = rd + bl; zin = 'In een zak zitten ' + rd + ' rode en ' + bl + ' blauwe knikkers. Je pakt twee keer een knikker en legt hem steeds terug.'; wat = 'minstens één rode knikker'; geen = ['De kans op een blauwe (geen rode) bij één keer pakken:', 'De kans op 2 keer een blauwe:', bl + ' van de ' + n + ' knikkers zijn blauw.']; }
            else { isDec = true; p = R.heel(1, 4); k = R.heel(2, 3); q = 10 - p; n = 10; zin = 'De kans dat de bus te laat komt, is ' + T(p / 10) + '. Je neemt ' + k + ' dagen de bus.'; wat = 'minstens één keer te laat'; geen = ['De kans dat de bus op tijd is, op één dag:', 'De kans dat de bus ' + k + ' dagen op tijd is:', '1 ' + MIN + ' ' + T(p / 10) + ' = ' + T(q / 10) + '.']; }
            var Q = macht(q, k), Nk = macht(n, k), Sx = isDec ? decStap : kansStap;
            var keten = []; for (var i = 0; i < k; i++) keten.push(isDec ? T(q / n) : br(q, n));
            var op = kansOp({ vraag:'Kans op ' + wat + '?', context:zin + ' Hoe groot is de kans op ' + wat + '?' + (isDec ? ' Geef je antwoord als kommagetal.' : ' Geef je antwoord als breuk.'), stappen:[
              Sx(geen[0], q, n, geen[2]),
              Sx(geen[1] + ' ' + keten.join(' ' + X + ' ') + ' =', Q, Nk, isDec ? 'Vermenigvuldig: ' + keten.join(' ' + X + ' ') + '.' : 'Teller keer teller en noemer keer noemer: ' + Q + '/' + Nk + '.', F(isDec ? [T(Q / Nk)] : brAnt(Q, Nk), isDec ? T(q * k / n) : br(q * k, n), 'Langs de takken vermenigvuldig je, je telt niet op.')),
              Sx('De kans op ' + wat + ': 1 ' + MIN + ' ' + (isDec ? T(Q / Nk) : br(Q, Nk)) + ' =', Nk - Q, Nk, isDec ? '1 min ' + T(Q / Nk) + '.' : '1 = ' + br(Nk, Nk) + '. ' + Nk + ' ' + MIN + ' ' + Q + ' = ' + (Nk - Q) + '.', F(isDec ? [T((Nk - Q) / Nk)] : brAnt(Nk - Q, Nk), isDec ? T(Q / Nk) : br(Q, Nk), 'Dat is de kans op geen enkele keer. Doe 1 min deze kans.')) ] }, Nk - Q, Nk);
            if (isDec) op.antwoord = [T((Nk - Q) / Nk)].concat(op.antwoord);
            return op;
          } },
        { id:'wst-verwacht', naam:'Hoe vaak verwacht je het?', kort:'Verwachting = kans · aantal keer',
          uit:'<p>Doe je iets heel vaak, dan kun je uitrekenen hoe vaak je een uitkomst <b>verwacht</b>: <b>kans · aantal keer</b>.</p><p>Voorbeeld: je gooit 300 keer met een dobbelsteen. De kans op een zes is 1/6. Je verwacht 1/6 · 300 = 300 : 6 = <b>50</b> zessen.</p><p>Het echte aantal is meestal net iets anders. De verwachting is wat je <b>gemiddeld</b> zou krijgen.</p>',
          wanneer:'je iets vaak herhaalt en wilt weten hoe vaak een uitkomst ongeveer voorkomt.',
          maak:function(R){
            var soort = R.kies(['dob', 'munt', 'rad', 'proc', 'dec']), st, ant, ctx, vraag, eh = 'keer';
            if (soort === 'dob'){
              var e = R.kies([{ w:'een zes', t:1 }, { w:'een even getal', t:3 }, { w:'meer dan 4', t:2 }, { w:'een 1 of een 2', t:2 }]), n = R.kies([60, 90, 120, 150, 180, 240, 300, 360, 600]);
              ant = n * e.t / 6; vraag = 'Hoe vaak ' + e.w + '?'; ctx = 'Je gooit ' + n + ' keer met een dobbelsteen. Hoe vaak verwacht je ' + e.w + '?';
              st = [kansStap('De kans op ' + e.w + ' bij één worp:', e.t, 6, 'Tel de gunstige ogen: ' + e.t + ' van de 6.'),
                S('Verwachting: ' + br(e.t, 6) + ' ' + X + ' ' + n + ' =', ant, n + ' : 6 = ' + (n / 6) + (e.t > 1 ? ', en dat keer ' + e.t : '') + '.', e.t > 1 ? F(ant, n / 6, 'Dat is 1/6 deel. Doe nog keer ' + e.t + '.') : null, { e:'keer' })];
            } else if (soort === 'munt'){
              var nm = 2 * R.heel(15, 250); ant = nm / 2; vraag = 'Hoe vaak kop?'; ctx = 'Je gooit ' + nm + ' keer met een munt. Hoe vaak verwacht je kop?';
              st = [kansStap('De kans op kop bij één keer:', 1, 2, 'Kop of munt: 1 van de 2.'), S('Verwachting: ' + br(1, 2) + ' ' + X + ' ' + nm + ' =', ant, 'De helft van ' + nm + '.', null, { e:'keer' })];
            } else if (soort === 'rad'){
              var m = R.kies([4, 5, 8, 10]), k = R.heel(1, m - 1), nr = m * R.heel(5, 30); ant = nr * k / m; vraag = 'Hoe vaak rood?';
              ctx = 'Een rad heeft ' + m + ' even grote vakken, waarvan ' + k + ' rood. Je draait ' + nr + ' keer. Hoe vaak verwacht je rood?';
              st = [kansStap('De kans op rood bij één keer:', k, m, k + ' van de ' + m + ' vakken.'), S('Verwachting: ' + br(k, m) + ' ' + X + ' ' + nr + ' =', ant, nr + ' : ' + m + ' = ' + (nr / m) + (k > 1 ? ', en dat keer ' + k : '') + '.', null, { e:'keer' })];
            } else if (soort === 'proc'){
              var c = R.kies([{ z:'De kans dat een zaadje opkomt, is {p}%. Je zaait {n} zaadjes.', v:'Hoeveel zaadjes verwacht je dat opkomen?', eh:'zaadjes', k:'zaadjes' }, { z:'De kans dat een penalty raak is, is {p}%. Een speler neemt {n} penalty\'s.', v:'Hoeveel verwacht je er raak?', eh:'penalty\'s', k:'raak' }, { z:'De kans dat een lamp binnen een jaar kapotgaat, is {p}%. In een school hangen {n} lampen.', v:'Hoeveel lampen verwacht je dat binnen een jaar kapotgaan?', eh:'lampen', k:'lampen kapot' }]);
              var pp = 5 * R.heel(1, 19), np = 20 * R.heel(2, 30); ant = pp * np / 100; eh = c.eh; vraag = 'Hoeveel ' + c.k + '?';
              ctx = c.z.replace('{p}', pp).replace('{n}', np) + ' ' + c.v;
              st = [S(pp + '% als kommagetal:', pp / 100, 'Deel door 100: ' + pp + ' : 100.'), S('Verwachting: ' + T(pp / 100) + ' ' + X + ' ' + np + ' =', ant, '1% van ' + np + ' is ' + T(np / 100) + '. Keer ' + pp + '.', F(ant, pp * np, 'Reken met ' + T(pp / 100) + ', niet met ' + pp + '.'), { e:eh })];
            } else {
              var pd = R.kies([5, 10, 15, 20, 25, 30, 40]), nd = 20 * R.heel(2, 25); ant = pd * nd / 100; eh = 'prijzen'; vraag = 'Hoeveel prijzen?';
              ctx = 'De kans op een prijs bij een kraslot is ' + T(pd / 100) + '. Een club verkoopt ' + nd + ' kraslotten. Hoeveel prijzen verwacht je?';
              st = [S('De kans op een prijs bij één lot:', pd / 100, 'Die staat in de tekst.'), S('Verwachting: ' + T(pd / 100) + ' ' + X + ' ' + nd + ' =', ant, 'Kans keer aantal keer.', null, { e:eh })];
            }
            return { vraag:vraag, context:ctx, eenheid:eh, antwoord:T(ant), stappen:st };
          } }
      ] }
  ]);

  /* ================= tellen: de opgaven, ook voor Kies de handigste manier ================= */
  function wegOp(R, soort){
    var v = { soort:soort, a:R.heel(2, 4), b:R.heel(2, 4), c:R.heel(2, 4), d:R.heel(1, 2), e:R.heel(2, 3) }, st, ant, doel;
    if (soort === 'direct'){
      ant = v.a * v.b + v.d; doel = 'C';
      st = [S('Bij A schrijf je 1. Hoeveel routes gaan er van A naar B?', v.a, 'Tel de wegen tussen A en B.'),
        S('Elke route naar B kan op ' + v.b + ' manieren verder naar C. Hoeveel routes gaan er via B naar C?', v.a * v.b, v.a + ' ' + X + ' ' + v.b + ' = ' + (v.a * v.b) + '.', F(v.a * v.b, v.a + v.b, 'Bij elke route naar B horen ' + v.b + ' wegen verder. Vermenigvuldig.')),
        S('Er ' + (v.d > 1 ? 'gaan ook ' + v.d + ' wegen' : 'gaat ook 1 weg') + ' direct van A naar C. Hoeveel routes zijn er in totaal van A naar C?', ant, 'De routes via B en de directe wegen komen bij C samen: ' + (v.a * v.b) + ' + ' + v.d + '.', F(ant, v.a * v.b, 'Vergeet de ' + v.d + ' directe weg' + (v.d > 1 ? 'en' : '') + ' van A naar C niet.'))];
    } else if (soort === 'twee'){
      ant = v.a * v.b + v.c * v.e; doel = 'D';
      st = [S('Bij A schrijf je 1. Hoeveel routes gaan er van A naar B?', v.a, 'Tel de wegen tussen A en B.'),
        S('Hoeveel routes gaan er van A naar C?', v.c, 'Tel de wegen tussen A en C.'),
        S('Via B: elke route naar B kan op ' + v.b + ' manieren verder naar D. Hoeveel routes zijn dat?', v.a * v.b, v.a + ' ' + X + ' ' + v.b + ' = ' + (v.a * v.b) + '.', F(v.a * v.b, v.a + v.b, 'Vermenigvuldig: bij elke route naar B horen ' + v.b + ' wegen verder.')),
        S('Via C komen er ' + v.c + ' ' + X + ' ' + v.e + ' = ' + (v.c * v.e) + ' routes bij D aan. Hoeveel routes zijn er in totaal van A naar D?', ant, 'Bij D komen de routes via B en via C samen: tel op. ' + (v.a * v.b) + ' + ' + (v.c * v.e) + '.', F(ant, (v.a * v.b) * (v.c * v.e), 'Waar routes samenkomen, tel je op.'))];
    } else {
      ant = v.a * v.b * v.c; doel = 'D';
      st = [S('Bij A schrijf je 1. Hoeveel routes gaan er van A naar B?', v.a, 'Tel de wegen tussen A en B.'),
        S('Hoeveel routes gaan er van A naar C?', v.a * v.b, 'Elke route naar B kan op ' + v.b + ' manieren verder: ' + v.a + ' ' + X + ' ' + v.b + '.', F(v.a * v.b, v.a + v.b, 'Vermenigvuldig, niet optellen.')),
        S('Hoeveel routes gaan er van A naar D?', ant, 'Elke route naar C kan op ' + v.c + ' manieren verder: ' + (v.a * v.b) + ' ' + X + ' ' + v.c + '.', F(ant, v.a + v.b + v.c, 'Vermenigvuldig, niet optellen.'))];
    }
    var bl = function(n){
      var lab = { A:1 };
      if (soort === 'direct'){ if (n >= 1) lab.B = v.a; if (n >= 3) lab.C = ant; }
      else if (soort === 'twee'){ if (n >= 1) lab.B = v.a; if (n >= 2) lab.C = v.c; if (n >= 4) lab.D = ant; }
      else { if (n >= 1) lab.B = v.a; if (n >= 2) lab.C = v.a * v.b; if (n >= 3) lab.D = ant; }
      return wegen(v, lab);
    };
    return { vraag:'Hoeveel routes van A naar ' + doel + '?', context:'Op de kaart staan de wegen tussen een paar dorpen' + (soort === 'direct' ? ', met ' + v.d + ' directe weg' + (v.d > 1 ? 'en' : '') + ' van A naar C' : '') + '. ' + wegZin(v) + ' Je rijdt steeds verder naar rechts, nooit terug. Hoeveel verschillende routes zijn er van A naar ' + doel + '?', eenheid:'routes', beeld:bl, zelfBeeld:bl(0), stappen:st, antwoord:T(ant) };
  }
  function wegZin(v){
    var w = function(k){ return k + ' weg' + (k > 1 ? 'en' : ''); };
    if (v.soort === 'direct') return 'Van A naar B gaan ' + w(v.a) + ', van B naar C ' + w(v.b) + '.';
    if (v.soort === 'twee') return 'Van A naar B gaan ' + w(v.a) + ', van B naar D ' + w(v.b) + ', van A naar C ' + w(v.c) + ' en van C naar D ' + w(v.e) + '.';
    return 'Van A naar B gaan ' + w(v.a) + ', van B naar C ' + w(v.b) + ' en van C naar D ' + w(v.c) + '.';
  }
  function boomOp(R){
    var c = R.kies([{ zin:'Je gooit drie keer met een munt. K is kop, M is munt.', l:['K', 'M'], d:['kop', 'keer kop'], dm:['munt', 'keer munt'] }, { zin:'Een gezin heeft drie kinderen. J is een jongen, M is een meisje.', l:['J', 'M'], d:['jongen', 'jongens'], dm:['meisje', 'meisjes'] }]);
    var welk = R.heel(0, 1), soort = R.kies(['precies', 'precies', 'minstens', 'hoogstens']), x = soort === 'precies' ? R.heel(1, 2) : soort === 'minstens' ? 2 : 1;
    var munt = c.l[0] === 'K', naam = welk ? c.dm : c.d, telw = ['geen', 'één', 'twee', 'drie'];
    var wat = soort + ' ' + telw[x] + ' ' + (munt ? (welk ? 'keer munt' : 'keer kop') : (x === 1 ? naam[0] : naam[1]));
    function past(p){ var t = p.filter(function(z){ return z === welk; }).length; return soort === 'precies' ? t === x : soort === 'minstens' ? t >= x : t <= x; }
    var alle = []; [0, 1].forEach(function(a){ [0, 1].forEach(function(b){ [0, 1].forEach(function(e){ alle.push([a, b, e]); }); }); });
    var goed = alle.filter(past).map(function(p){ return p.map(function(z){ return c.l[z]; }).join(''); }), g = goed.length;
    var niv = [c.l, c.l, c.l];
    var bl = function(n){ return boomT(niv, { blad:true, nad:n >= 2 ? past : null, aria:'boomdiagram met drie keer twee takken' }); };
    return { vraag:'Hoeveel uitkomsten: ' + wat + '?', context:c.zin + ' Hoeveel uitkomsten hebben ' + wat + '?', eenheid:'uitkomsten', beeld:bl, zelfBeeld:bl(0), stappen:[
      S('Hoeveel eindjes heeft de boom? Dat zijn alle uitkomsten.', 8, 'Elke keer splitst de tak in twee: 2 ' + X + ' 2 ' + X + ' 2.', F(8, 6, 'Elke keer splitsen alle takken in twee: 2, dan 4, dan 8.')),
      S('Schrijf de uitkomsten op en wijs aan welke passen bij ' + wat + '. Hoeveel zijn het?', g, 'Deze passen: ' + goed.join(', ') + '.', soort === 'minstens' || soort === 'hoogstens' ? F(g, 3, (soort === 'minstens' ? 'Minstens twee: ook drie telt mee.' : 'Hoogstens één: ook geen telt mee.')) : null) ], antwoord:T(g) };
  }
  function boomCombi(R){
    var c = R.kies([
      { zin:'Je kiest een broek en een shirt.', a:['spijkerbroek', 'joggingbroek', 'korte broek'], b:['wit', 'zwart', 'rood', 'blauw'], an:'broeken', bn:'kleuren shirt', wat:'outfits' },
      { zin:'Je kiest bij de ijssalon een hoorntje of een bakje, en daarna één smaak.', a:['hoorntje', 'bakje'], b:['vanille', 'aardbei', 'chocola', 'citroen'], an:'manieren', bn:'smaken', wat:'ijsjes', vast:2 },
      { zin:'Je maakt een broodje: je kiest soort brood en dan het beleg.', a:['wit', 'bruin', 'spelt'], b:['kaas', 'ham', 'pindakaas', 'jam'], an:'soorten brood', bn:'soorten beleg', wat:'broodjes' } ]);
    var na = c.vast || R.heel(2, c.a.length), nb = R.heel(2, c.b.length), A = c.a.slice(0, na), B = R.hussel(c.b).slice(0, nb), ant = na * nb;
    var bl = function(n){ return boomT([A, B], { tot:n >= 1 ? 2 : 1, aria:'boomdiagram' }); };
    return { vraag:'Hoeveel ' + c.wat + '?', context:c.zin + ' Er zijn ' + na + ' ' + c.an + ' (' + A.join(', ') + ') en ' + nb + ' ' + c.bn + ' (' + B.join(', ') + '). Hoeveel verschillende ' + c.wat + ' kun je maken? Teken een boomdiagram.', eenheid:c.wat, beeld:bl, stappen:[
      S('De eerste keuze: hoeveel takken teken je eerst?', na, 'Voor elke mogelijkheid één tak: ' + A.join(', ') + '.'),
      S('Aan het eind van elke tak komen de takken voor de tweede keuze. Hoeveel takken zijn dat per eindje?', nb, 'Voor elke mogelijkheid één tak: ' + B.join(', ') + '.'),
      S('Tel alle eindjes van de boom:', ant, na + ' groepjes van ' + nb + ' eindjes: ' + na + ' ' + X + ' ' + nb + ' = ' + ant + '.', F(ant, na + nb, 'Elk eindje van de eerste keuze krijgt ' + nb + ' nieuwe takken. Tel de eindjes helemaal rechts.'))
    ], antwoord:T(ant) };
  }
  function regelOp(R, groot){
    var soort = R.kies(['menu', 'kleding', 'slot', 'prijs']), st, ant, ctx, vraag, eh;
    if (soort === 'menu' || soort === 'kleding'){
      var lo = groot ? 4 : 2, a = R.heel(lo, 6), b = R.heel(lo, 8), c = R.heel(lo, 5);
      var w = soort === 'menu' ? ['voorgerechten', 'hoofdgerechten', 'nagerechten', 'menu\'s', 'Een restaurant heeft ' + a + ' voorgerechten, ' + b + ' hoofdgerechten en ' + c + ' nagerechten. Je kiest van elk één.']
        : ['broeken', 'shirts', 'schoenen', 'outfits', 'Je hebt ' + a + ' broeken, ' + b + ' shirts en ' + c + ' paar schoenen. Je trekt van elk één aan.'];
      ant = a * b * c; eh = w[3]; vraag = 'Hoeveel ' + w[3] + '?'; ctx = w[4] + ' Hoeveel verschillende ' + w[3] + ' zijn er mogelijk?';
      st = [S('Hoeveel keuzes heb je voor de ' + w[0] + '?', a, 'Dat staat in de tekst: ' + a + '.'), S('En voor de ' + w[1] + '?', b, 'Dat staat in de tekst: ' + b + '.'), S('En voor de ' + w[2] + '?', c, 'Dat staat in de tekst: ' + c + '.'),
        S('Alles samen: ' + a + ' ' + X + ' ' + b + ' ' + X + ' ' + c + ' =', ant, a + ' ' + X + ' ' + b + ' = ' + (a * b) + ', en dat keer ' + c + '.', F(ant, a + b + c, 'Je moet vermenigvuldigen, niet optellen.'))];
    } else if (soort === 'slot'){
      var k = R.heel(3, 4), lijst = []; for (var i = 0; i < k; i++) lijst.push('10');
      ant = macht(10, k); eh = 'codes'; vraag = 'Hoeveel codes?'; ctx = 'Een fietsslot heeft ' + k + ' ringen met elk de cijfers 0 tot en met 9. Hoeveel verschillende codes zijn er?';
      st = [S('Hoeveel mogelijkheden heeft één ring?', 10, '0, 1, 2, ..., 9: tel ook de 0 mee.', F(10, 9, 'Vergeet de 0 niet.')), S('Hoeveel ringen zijn er?', k, 'Dat staat in de tekst.'),
        S('Alles samen: ' + lijst.join(' ' + X + ' ') + ' =', ant, 'Elke ring keer 10.', F(ant, 10 * k, 'Vermenigvuldig: ' + lijst.join(' ' + X + ' ') + '.'))];
    } else {
      var n = R.heel(groot ? 8 : 5, 12), dr = R.heel(0, 1);
      ant = dr ? n * (n - 1) * (n - 2) : n * (n - 1); eh = 'manieren'; vraag = 'Hoeveel manieren?';
      ctx = n + ' lopers doen mee aan een wedstrijd. Hoeveel verschillende uitslagen zijn er voor ' + (dr ? 'de eerste, tweede en derde plaats' : 'de eerste en de tweede plaats') + '? Niemand eindigt gelijk.';
      st = [S('Hoeveel lopers kunnen er eerste worden?', n, 'Iedereen kan winnen.'), S('De winnaar kan niet ook tweede worden. Hoeveel lopers kunnen er nog tweede worden?', n - 1, 'Eén minder: ' + n + ' ' + MIN + ' 1.', F(n - 1, n, 'De winnaar doet niet meer mee voor de tweede plaats.'))];
      if (dr) st.push(S('Hoeveel kunnen er nog derde worden?', n - 2, 'Weer één minder.'));
      st.push(S('Alles samen: ' + (dr ? n + ' ' + X + ' ' + (n - 1) + ' ' + X + ' ' + (n - 2) : n + ' ' + X + ' ' + (n - 1)) + ' =', ant, 'Vermenigvuldig de aantallen.', F(ant, dr ? n * n * n : n * n, 'Wie al een plaats heeft, kan niet nog een keer.')));
    }
    return { vraag:vraag, context:ctx, eenheid:eh, stappen:st, antwoord:T(ant) };
  }
  /* de kruistabellen */
  var KT = [
    { intro:'In de tabel staat of de leerlingen van klas 3 aan sport doen.', rij:['jongens', 'meisjes'], rijN:['jongens', 'meisjes'], kop:['sport wel', 'sport niet'], alle:'leerlingen',
      kolN:['leerlingen die sporten', 'leerlingen die niet sporten'], cel:[['een jongen die sport', 'een jongen die niet sport'], ['een meisje dat sport', 'een meisje dat niet sport']],
      rijEen:['een jongen', 'een meisje'], rijVr:[['dat hij sport', 'dat hij niet sport'], ['dat ze sport', 'dat ze niet sport']], kolEen:['iemand die sport', 'iemand die niet sport'], kolVr:['dat het een jongen is', 'dat het een meisje is'] },
    { intro:'In de tabel staat hoe de leerlingen van klas 1 en 2 naar school komen.', rij:['klas 1', 'klas 2'], rijN:['leerlingen uit klas 1', 'leerlingen uit klas 2'], kop:['fiets', 'bus'], alle:'leerlingen',
      kolN:['leerlingen die fietsen', 'leerlingen die met de bus komen'], cel:[['een leerling uit klas 1 die fietst', 'een leerling uit klas 1 die met de bus komt'], ['een leerling uit klas 2 die fietst', 'een leerling uit klas 2 die met de bus komt']],
      rijEen:['een leerling uit klas 1', 'een leerling uit klas 2'], rijVr:[['dat deze leerling fietst', 'dat deze leerling met de bus komt'], ['dat deze leerling fietst', 'dat deze leerling met de bus komt']], kolEen:['iemand die fietst', 'iemand die met de bus komt'], kolVr:['dat deze leerling in klas 1 zit', 'dat deze leerling in klas 2 zit'] },
    { intro:'In een dorp is geteld wie een bril draagt.', rij:['volwassenen', 'kinderen'], rijN:['volwassenen', 'kinderen'], kop:['bril', 'geen bril'], alle:'mensen',
      kolN:['mensen met een bril', 'mensen zonder bril'], cel:[['een volwassene met een bril', 'een volwassene zonder bril'], ['een kind met een bril', 'een kind zonder bril']],
      rijEen:['een volwassene', 'een kind'], rijVr:[['dat deze persoon een bril draagt', 'dat deze persoon geen bril draagt'], ['dat dit kind een bril draagt', 'dat dit kind geen bril draagt']], kolEen:['iemand met een bril', 'iemand zonder bril'], kolVr:['dat het een volwassene is', 'dat het een kind is'] } ];
})();
