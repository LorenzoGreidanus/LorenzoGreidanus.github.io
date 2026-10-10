/* De leerroute rekenen, verbanden: data en kansen. Gegevens turven en ordenen in tabellen
   en klassen, grafieken kritisch bekijken (as niet bij 0, beeldgrafiek, steekproef, samenhang
   en oorzaak), kansen als breuk, kommagetal en procent, en kansen berekenen met een rooster,
   een boomdiagram en de kansregels. Tabellen aflezen, diagrammen en het gemiddelde staan in
   rekenen-meten.js. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, S = R0.schoon, MIN = '−', X = '×';
  var K = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var KLEUR = { rood:'var(--lr-2)', blauw:'var(--lr-1)', groen:'var(--lr-4)', paars:'var(--lr-5)' };
  var KLEUREN = ['rood', 'blauw', 'groen', 'paars'];
  var BIJV = { rood:'rode', blauw:'blauwe', groen:'groene', paars:'paarse' };

  /* ---------- rekenhulpjes ---------- */
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a || 1; }
  function br(t, n){ return t + '/' + n; }
  function brv(t, n){ if (t === 0) return '0'; var g = ggd(t, n); return n / g === 1 ? String(t / g) : br(t / g, n / g); }
  function eindig(n){ while (n % 2 === 0) n /= 2; while (n % 5 === 0) n /= 5; return n === 1; }
  function r1(x){ return Math.round(x * 10) / 10; }
  function r2(x){ return Math.round(x * 100) / 100; }
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function lijst(l, en){ l = l.map(String); return l.length < 2 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' ' + (en || 'en') + ' ' + l[l.length - 1]; }
  function g2(x){ return T(x, { dec:2, vast:true }); }
  function G(x){ return '€ ' + g2(x); }
  function gAnt(x){ return uniek([g2(x), T(r2(x))]); }
  function macht(a, k){ var p = 1; for (var i = 0; i < k; i++) p *= a; return p; }
  function keten(x, k){ var l = []; for (var i = 0; i < k; i++) l.push(x); return l.join(' ' + X + ' '); }

  /* Een kans controleren. vorm: 'breuk' (ook 1 op 6), 'dec' (kommagetal), 'proc' (procent, met of zonder %),
     of niets: dan is elke gelijkwaardige vorm goed. Een breuk mag vereenvoudigd of niet. */
  function kansC(t, n, vorm){
    var p = t / n;
    function procOk(x){ var q = p * 100; if (Math.abs(q * 10 - Math.round(q * 10)) < 1e-6) return Math.abs(x - q) < 1e-6; return Math.abs(x - q) <= 0.5 + 1e-9; }
    function decOk(x, ruw){ if (Math.abs(p * 1000 - Math.round(p * 1000)) < 1e-6) return Math.abs(x - p) < 1e-9; return (ruw.split('.')[1] || '').length >= 2 && Math.abs(x - p) <= 0.005 + 1e-9; }
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/procent$/, '%'), m;
      if ((m = /^(\d+)(?:\/|op(?:de)?)(\d+)$/.exec(s))) return vorm !== 'dec' && vorm !== 'proc' && +m[2] > 0 && +m[1] * n === +m[2] * t;
      if ((m = /^(\d*\.?\d+)%$/.exec(s))) return vorm !== 'dec' && vorm !== 'breuk' && procOk(+m[1]);
      if ((m = /^(\d*\.?\d+)$/.exec(s))){
        var x = +m[1];
        if (vorm === 'proc') return procOk(x);
        if (vorm === 'breuk') return (x === 0 || x === 1) && Math.abs(x - p) < 1e-9;
        if (vorm === 'dec') return decOk(x, m[1]);
        return decOk(x, m[1]) || (x > 1 && procOk(x));
      }
      return false;
    };
  }
  /* een percentage controleren: met of zonder %, afgerond mag als het niet precies uitkomt */
  function procC(q){
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/(%|procent)$/, '');
      if (!/^\d*\.?\d+$/.test(s)) return false;
      var x = +s;
      if (Math.abs(q * 10 - Math.round(q * 10)) < 1e-6) return Math.abs(x - q) < 1e-6;
      return Math.abs(x - q) <= 0.5 + 1e-9;
    };
  }
  function kansAnt(t, n){
    var l = uniek([brv(t, n), br(t, n)]), g = ggd(t, n);
    if (t && eindig(n / g)){ l.push(T(t / n)); l.push(T(t / n * 100) + '%'); }
    return l;
  }
  function kansOp(op, t, n){ op.antwoord = kansAnt(t, n); op.controle = kansC(t, n); return op; }
  function pAnt(q){ return uniek([T(r1(q)), T(r1(q)) + '%']); }

  /* ---------- stappen ---------- */
  /* foutmeldingen: F(goed, fout1, uitleg1, ...); een sleutel gelijk aan het goede antwoord valt weg */
  function F(goed){
    var o = {}, g = [].concat(goed).map(function(x){ return String(x).toLowerCase(); });
    for (var i = 1; i + 1 < arguments.length; i += 2){ var k = String(arguments[i]).toLowerCase(); if (g.indexOf(k) < 0 && !(k in o)) o[k] = arguments[i + 1]; }
    return o;
  }
  function St(tekst, ant, hint, fout, waarom){
    var s = { tekst:tekst, antwoord:[].concat(ant).map(String), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (waarom) s.waarom = waarom;
    return s;
  }
  /* een kansstap met controle; vorm zoals bij kansC */
  function Kb(tekst, t, n, hint, vorm, fout){
    var ant = vorm === 'dec' ? [T(t / n)] : vorm === 'proc' ? pAnt(t / n * 100) : uniek([br(t, n), brv(t, n)]);
    var s = { tekst:tekst, antwoord:ant, controle:kansC(t, n, vorm), hint:hint };
    if (vorm === 'proc') s.eenheid = '%';
    if (fout && Object.keys(fout).length) s.fout = fout;
    return s;
  }
  /* een procentstap */
  function Pr(tekst, q, hint, fout){ var s = { tekst:tekst, antwoord:pAnt(q), controle:procC(q), hint:hint, eenheid:'%' }; if (fout && Object.keys(fout).length) s.fout = fout; return s; }
  function kz(R, goed, fout){ var l = [goed]; fout.forEach(function(f){ if (l.indexOf(f) < 0) l.push(f); }); l = R.hussel(l); return { opties:l, goed:l.indexOf(goed) }; }
  /* een keuzestap, gehusseld */
  function Ks(R, tekst, goed, fout, hint, waarom){ var k = kz(R, goed, fout), s = { tekst:tekst, opties:k.opties, goed:k.goed, hint:hint }; if (waarom) s.waarom = waarom; return s; }
  /* een keuzestap in vaste volgorde */
  function Kv(tekst, opties, goed, hint, waarom){ var s = { tekst:tekst, opties:opties.slice(), goed:opties.indexOf(goed), hint:hint }; if (waarom) s.waarom = waarom; return s; }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  /* procent van een aantal: een hint om de noemer 100 te maken */
  function naar100(k, N){
    if (100 % N === 0) return 'Maak de noemer 100: ' + N + ' ' + X + ' ' + (100 / N) + ' = 100, dus ook ' + k + ' ' + X + ' ' + (100 / N) + '.';
    if (N % 100 === 0) return 'Maak de noemer 100: ' + N + ' : ' + (N / 100) + ' = 100, dus ook ' + k + ' : ' + (N / 100) + '.';
    return 'Reken eerst 1 van de ' + N + ' uit: 100 : ' + N + ' = ' + T(100 / N) + '%. Dan keer ' + k + '.';
  }

  /* ---------- tekenen ---------- */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + Math.round(max) + 'px"' : '') + ' role="img" aria-label="' + S(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700');
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal ' + (o.groot ? 'groot' : 'klein') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + S(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.stip ? ';stroke-dasharray:6 5' : '') + (o.op ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' style="fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2) + (o.stip ? ';stroke-dasharray:6 5' : '') + '"/>'; }
  /* twee plaatjes naast elkaar (op een telefoon onder elkaar) */
  function duo(a, b){ var c = 'flex:1 1 220px;max-width:360px;display:flex;justify-content:center'; return '<div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-end;width:100%"><div style="' + c + '">' + a + '</div><div style="' + c + '">' + b + '</div></div>'; }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).join('') + '</div>'; }
  /* getallen in rijen van 'per' voor een tabel */
  function rijen(l, per){ var r = []; for (var i = 0; i < l.length; i += per){ var rij = l.slice(i, i + per).map(String); if (l.length > per) while (rij.length < per) rij.push(''); r.push(rij); } return r; }

  /* een turftabel: per rij een naam en de turfjes in bosjes van vijf */
  function turf(cats, tel, nad){
    var rijH = 40, x0 = 112, s = '', W = 470, H = cats.length * rijH + 8;
    cats.forEach(function(c, i){
      var y = 8 + i * rijH;
      if (i === nad) s += rc(2, y - 4, W - 4, rijH - 4, { f:K[0], fo:0.13, w:0, rx:8 });
      s += tx(10, y + 21, c, { a:'start', vet:i === nad });
      for (var j = 0; j < tel[i]; j++){
        var gx = x0 + Math.floor(j / 5) * 58, p = j % 5;
        s += p < 4 ? ln(gx + p * 10, y + 4, gx + p * 10, y + 28, { w:2.4 }) : ln(gx - 6, y + 25, gx + 36, y + 7, { w:2.4 });
      }
    });
    s += ln(x0 - 14, 2, x0 - 14, H - 4, { w:1, op:0.4 });
    return svg(W, H, s, 'turftabel', 560);
  }
  /* een staafdiagram; o: min, max, stap, elke (getal bij elke zoveelste lijn), labels (getal boven de staaf), kleur {i:k}, titel, w, h */
  function staven(cats, vals, o){
    o = o || {};
    var W = o.w || 440, H = o.h || 260, x0 = 58, x1 = W - 12, yT = o.titel ? 40 : 22, yB = H - 30, mn = o.min || 0, mx = o.max, st = o.stap, s = '';
    function Y(v){ return yB - (v - mn) / (mx - mn) * (yB - yT); }
    for (var v = mn, k = 0; v <= mx + 1e-9; v += st, k++){ var vv = Math.round(v * 1000) / 1000; s += ln(x0, Y(vv), x1, Y(vv), { w:1, op:k === 0 ? 1 : 0.28 }); if (k % (o.elke || 1) === 0) s += tx(x0 - 8, Y(vv) + 5, T(vv), { a:'end' }); }
    s += ln(x0, yT - 6, x0, yB);
    var slot = (x1 - x0) / cats.length;
    cats.forEach(function(c, i){
      var cx = x0 + slot * (i + 0.5), bw = slot * 0.56, w = vals[i];
      s += tx(cx, yB + 20, c);
      if (w == null) return;
      var kl = o.kleur && o.kleur[i] != null ? K[o.kleur[i]] : K[0];
      s += rc(cx - bw / 2, Y(w), bw, yB - Y(w), { f:kl, fo:0.72, w:1.5, s:kl });
      if (o.labels) s += tx(cx, Y(w) - 7, T(w), { vet:true });
    });
    if (o.titel) s += tx(W / 2, 16, o.titel, { vet:true });
    return svg(W, H, s, o.aria || o.titel || 'staafdiagram', o.maxW);
  }
  function fijn(x){ var l = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]; for (var i = 0; i < l.length; i++) if (l[i] >= x) return l[i]; return 10000; }
  /* een kleine lijngrafiek met 5 hokjes vanaf mn */
  function lijntje(xs, vals, mn, st, titel){
    var W = 340, H = 250, x0 = 58, x1 = W - 14, yT = 40, yB = H - 34, mx = mn + 5 * st, s = '';
    function Y(v){ return yB - (v - mn) / (mx - mn) * (yB - yT); }
    for (var k = 0; k <= 5; k++){ var v = mn + k * st; s += ln(x0, Y(v), x1, Y(v), { w:1, op:k ? 0.28 : 1 }) + tx(x0 - 8, Y(v) + 5, T(v), { a:'end' }); }
    s += ln(x0, yT - 6, x0, yB);
    var slot = (x1 - x0) / xs.length;
    function Xp(i){ return x0 + slot * (i + 0.5); }
    xs.forEach(function(l, i){ s += tx(Xp(i), yB + 20, l); });
    s += '<polyline points="' + vals.map(function(v, i){ return n1(Xp(i)) + ',' + n1(Y(v)); }).join(' ') + '" style="fill:none;stroke:var(--lr-1);stroke-width:3;stroke-linejoin:round"/>';
    vals.forEach(function(v, i){ s += '<circle cx="' + n1(Xp(i)) + '" cy="' + n1(Y(v)) + '" r="4.5" style="fill:var(--lr-1)"/>'; });
    s += tx(W / 2, 18, titel, { vet:true });
    return svg(W, H, s, titel, 380);
  }
  /* een poppetje en een rij poppetjes: a van de b gekleurd */
  function pop(x, y, kl){ return '<circle cx="' + n1(x + 11) + '" cy="' + n1(y + 7) + '" r="6.5" style="fill:' + kl + '"/><path d="M' + n1(x) + ' ' + n1(y + 38) + ' Q' + n1(x) + ' ' + n1(y + 16) + ' ' + n1(x + 11) + ' ' + n1(y + 16) + ' Q' + n1(x + 22) + ' ' + n1(y + 16) + ' ' + n1(x + 22) + ' ' + n1(y + 38) + ' Z" style="fill:' + kl + '"/>'; }
  function poppen(a, b){
    var s = '', w = 30;
    for (var i = 0; i < b; i++) s += pop(10 + i * w, 8, i < a ? K[1] : 'var(--muted)');
    s += tx(10 + b * w / 2 - 4, 74, a + ' op de ' + b, { groot:true, vet:true, k:K[1] });
    return svg(16 + b * w, 84, s, a + ' op de ' + b, Math.min(560, (16 + b * w) * 1.5));
  }
  /* een huisje voor de beeldgrafiek: links onder op (x, yb), hoogte h */
  function huis(x, yb, h, kl){
    var w = h * 0.86, m = h * 0.42;
    return '<polygon points="' + n1(x) + ',' + n1(yb - h + m) + ' ' + n1(x + w / 2) + ',' + n1(yb - h) + ' ' + n1(x + w) + ',' + n1(yb - h + m) + '" style="fill:' + kl + ';stroke:var(--ink);stroke-width:2;stroke-linejoin:round"/>' +
      rc(x + w * 0.08, yb - h + m, w * 0.84, h - m, { f:kl, fo:0.5, w:2 }) + rc(x + w * 0.4, yb - (h - m) * 0.5, w * 0.2, (h - m) * 0.5, { f:'var(--kaart)', w:1.5 });
  }
  /* de zes kanten van een dobbelsteen; aan: de kanten die gemarkeerd zijn */
  var PIP = { 1:[[.5, .5]], 2:[[.27, .27], [.73, .73]], 3:[[.27, .27], [.5, .5], [.73, .73]], 4:[[.27, .27], [.73, .27], [.27, .73], [.73, .73]],
    5:[[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]], 6:[[.27, .24], [.27, .5], [.27, .76], [.73, .24], [.73, .5], [.73, .76]] };
  function steen(x, y, z, w, aan){
    var s = rc(x, y, z, z, { rx:n1(z * 0.18), f:aan ? K[0] : 'var(--kaart)', fo:aan ? 0.3 : 1, w:aan ? 3.5 : 2, s:aan ? K[0] : 'var(--ink)' });
    PIP[w].forEach(function(p){ s += '<circle cx="' + n1(x + p[0] * z) + '" cy="' + n1(y + p[1] * z) + '" r="' + n1(z * 0.085) + '" style="fill:var(--ink)"/>'; });
    return s;
  }
  function stenen(aan){
    aan = aan || []; var s = '';
    for (var w = 1; w <= 6; w++) s += steen(8 + (w - 1) * 62, 8, 50, w, aan.indexOf(w) >= 0);
    return svg(380, 66, s, 'de zes kanten van een dobbelsteen' + (aan.length ? ', gemarkeerd: ' + aan.join(', ') : ''), 430);
  }
  /* een rad met even grote vakken: vakken = kleurnamen; o.aan = kleuren die oplichten, o.tekst = tekst per vak */
  function rad(vakken, o){
    o = o || {};
    var n = vakken.length, cx = 120, cy = 132, r = 100, s = '';
    vakken.forEach(function(k, i){
      var a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n, am = (a0 + a1) / 2, dim = o.aan && o.aan.indexOf(k) < 0;
      s += '<path d="M' + cx + ' ' + cy + ' L' + n1(cx + r * Math.cos(a0)) + ' ' + n1(cy + r * Math.sin(a0)) + ' A' + r + ' ' + r + ' 0 0 1 ' + n1(cx + r * Math.cos(a1)) + ' ' + n1(cy + r * Math.sin(a1)) + ' Z" style="fill:' + KLEUR[k] + ';fill-opacity:' + (dim ? 0.22 : 0.92) + ';stroke:var(--kaart);stroke-width:2.5"/>';
      var lab = o.tekst ? o.tekst[i] : k.charAt(0).toUpperCase();
      s += '<text x="' + n1(cx + r * 0.66 * Math.cos(am)) + '" y="' + n1(cy + r * 0.66 * Math.sin(am) + 5) + '" class="getal" style="fill:' + (dim ? 'var(--ink)' : 'var(--kaart)') + '">' + S(lab) + '</text>';
    });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:none;stroke:var(--ink);stroke-width:2.5"/><circle cx="' + cx + '" cy="' + cy + '" r="5" style="fill:var(--ink)"/>';
    s += '<polygon points="' + (cx - 11) + ',' + (cy - r - 20) + ' ' + (cx + 11) + ',' + (cy - r - 20) + ' ' + cx + ',' + (cy - r + 6) + '" style="fill:var(--ink)"/>';
    if (o.onder) s += tx(cx, cy + r + 26, o.onder, { vet:true });
    return svg(240, cy + r + (o.onder ? 36 : 10), s, 'rad met ' + n + ' even grote vakken', 270);
  }
  /* een zak met knikkers: paren = [[kleur, aantal], ...]; o.aan = kleur die oplicht, o.naam = tekst eronder */
  function zak(paren, o){
    o = o || {};
    var N = som(paren.map(function(p){ return p[1]; })), cols = N > 16 ? 5 : 4, rows = Math.max(1, Math.ceil(N / cols)), d = 27, bw = cols * d + 28, bh = rows * d + 24, x0 = 8, y0 = 30, s = '', mid = x0 + bw / 2;
    s += '<path d="M' + n1(mid - 18) + ' ' + (y0 + 2) + ' L' + n1(mid - 9) + ' ' + (y0 - 16) + ' L' + n1(mid + 9) + ' ' + (y0 - 16) + ' L' + n1(mid + 18) + ' ' + (y0 + 2) + '" style="fill:var(--kaart);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/>';
    s += ln(mid - 13, y0 - 8, mid + 13, y0 - 8, { w:3, k:K[2] });
    s += rc(x0, y0, bw, bh, { rx:24, f:'var(--kaart)', w:2.5 });
    var i = 0;
    paren.forEach(function(p){
      for (var j = 0; j < p[1]; j++, i++){
        var cx = x0 + 14 + (i % cols) * d + d / 2, cy = y0 + 12 + Math.floor(i / cols) * d + d / 2, dim = o.aan && p[0] !== o.aan;
        s += '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="11.5" style="fill:' + KLEUR[p[0]] + ';fill-opacity:' + (dim ? 0.22 : 1) + ';stroke:' + (o.aan && !dim ? 'var(--ink)' : 'none') + ';stroke-width:2.5"/>';
        s += '<text x="' + n1(cx) + '" y="' + n1(cy + 4.5) + '" class="getal klein" style="fill:' + (dim ? 'var(--ink)' : 'var(--kaart)') + '">' + p[0].charAt(0).toUpperCase() + '</text>';
      }
    });
    if (o.naam) s += tx(mid, y0 + bh + 22, o.naam, { vet:true });
    return svg(bw + 16, y0 + bh + (o.naam ? 30 : 8), s, 'zak met ' + N + ' knikkers', Math.round((bw + 16) * 1.45));
  }
  /* de kanslijn van 0 tot 1, met een stip bij p */
  function kanslijn(p, label){
    var W = 640, L = 56, Rr = 584, Y = 62, s = '';
    function x(v){ return L + v * (Rr - L); }
    s += ln(L, Y, Rr, Y, { w:3 });
    [[0, '0'], [0.5, '1/2'], [1, '1']].forEach(function(q){ s += ln(x(q[0]), Y - 10, x(q[0]), Y + 10, { w:2.5 }) + tx(x(q[0]), Y - 16, q[1], { vet:true }); });
    [0.25, 0.75].forEach(function(q){ s += ln(x(q), Y - 5, x(q), Y + 5, { w:1.5 }); });
    [[0, 'onmogelijk'], [0.25, 'kleine kans'], [0.5, 'even grote kans'], [0.75, 'grote kans'], [1, 'zeker']].forEach(function(q){ s += tx(x(q[0]), Y + 32, q[1]); });
    if (p != null){ s += '<circle cx="' + n1(x(p)) + '" cy="' + Y + '" r="9" style="fill:var(--lr-2);stroke:var(--kaart);stroke-width:2"/>'; if (label && [0, 0.5, 1].indexOf(p) < 0) s += tx(x(p), Y - 34, label, { k:K[1], vet:true, groot:true }); }
    return svg(W, 104, s, 'kanslijn van 0 tot 1');
  }
  /* een liggend boomdiagram. niv = [[takken niveau 1], [takken niveau 2], ...]
     o.d: aantal niveaus getekend; o.kans: per niveau de kans bij elke tak; o.nadruk(pad): route oplichten; o.blad(pad): tekst achter een eindje */
  function boom(niv, o){
    o = o || {};
    var d = Math.max(1, Math.min(o.d == null ? niv.length : o.d, niv.length)), maat = [], i, maxL = 1, kansL = 0;
    for (i = 0; i < d; i++){ maat.push(niv[i].length); niv[i].forEach(function(l){ maxL = Math.max(maxL, String(l).length); }); }
    if (o.kans) for (i = 0; i < d; i++) (o.kans[i] || []).forEach(function(l){ kansL = Math.max(kansL, String(l).length); });
    var kolW = Math.max(84, maxL * 7.6 + 34 + kansL * 6), rijH = o.kans ? 46 : 30, x0 = 12, s = '', bladW = 0;
    function onder(l){ var p = 1; for (var j = l; j < d; j++) p *= maat[j]; return p; }
    function Y(p){ var e = 0; for (var j = 0; j < p.length; j++) e += p[j] * onder(j + 1); return 10 + (e + onder(p.length) / 2) * rijH; }
    function hw(t){ return String(t).length * 3.9 + 9; }
    function X(l){ return x0 + l * kolW; }
    function nad(p){ return !!(o.nadruk && o.nadruk(p)); }
    var lijnen = '', vakjes = '';
    function teken(p){
      var l = p.length, ya = Y(p), xa = l === 0 ? X(0) + 4 : X(l) + hw(niv[l - 1][p[l - 1]]);
      if (l === d){
        var bt = o.blad ? o.blad(p) : '';
        if (bt){ vakjes += tx(xa + 8, ya + 5, bt, { a:'start', vet:nad(p), k:nad(p) ? K[1] : null }); bladW = Math.max(bladW, String(bt).length * 8 + 14); }
        return;
      }
      for (var c = 0; c < maat[l]; c++){
        var q = p.concat([c]), yb = Y(q), lab = String(niv[l][c]), xb = X(l + 1) - hw(lab), hl = nad(q);
        lijnen += ln(xa, ya, xb, yb, { k:hl ? K[1] : 'var(--ink)', w:hl ? 3.5 : 1.6, op:o.nadruk && !hl ? 0.5 : null });
        if (o.kans && o.kans[l]) vakjes += tx((xa + xb) / 2, (ya + yb) / 2 - 7, o.kans[l][c], { k:K[0], vet:true });
        vakjes += rc(X(l + 1) - hw(lab), yb - 12, 2 * hw(lab), 24, { f:hl ? K[1] : 'var(--kaart)', fo:hl ? 0.22 : 1, rx:8, w:hl ? 2.5 : 1.5, s:hl ? K[1] : 'var(--ink)' });
        vakjes += tx(X(l + 1), yb + 5, lab, { vet:hl });
        teken(q);
      }
    }
    teken([]);
    var lastL = 1; niv[d - 1].forEach(function(l){ lastL = Math.max(lastL, String(l).length); });
    s = '<circle cx="' + X(0) + '" cy="' + n1(Y([])) + '" r="4.5" style="fill:var(--ink)"/>' + lijnen + vakjes;
    var W = X(d) + hw('x'.repeat(lastL)) + 10 + bladW, H = onder(0) * rijH + 20;
    return svg(W, H, s, 'boomdiagram', Math.min(640, W * 1.3));
  }

  /* ---------- kansexperimenten ---------- */
  var DOB = [
    { wat:'een 6', set:[6], k:'6', kn:'geen 6' }, { wat:'een 1', set:[1], k:'1', kn:'geen 1' }, { wat:'een 4', set:[4], k:'4', kn:'geen 4' },
    { wat:'een even getal', set:[2, 4, 6], k:'even', kn:'oneven' }, { wat:'een oneven getal', set:[1, 3, 5], k:'oneven', kn:'even' },
    { wat:'meer dan 4', set:[5, 6], k:'5 of 6', kn:'1 t/m 4' }, { wat:'minder dan 3', set:[1, 2], k:'1 of 2', kn:'3 t/m 6' },
    { wat:'meer dan 2', set:[3, 4, 5, 6], k:'3 t/m 6', kn:'1 of 2' }, { wat:'hoogstens 4', set:[1, 2, 3, 4], k:'1 t/m 4', kn:'5 of 6' },
    { wat:'een getal uit de tafel van 3', set:[3, 6], k:'3 of 6', kn:'geen 3 of 6' }, { wat:'meer dan 3', set:[4, 5, 6], k:'4, 5 of 6', kn:'1, 2 of 3' },
    { wat:'minstens 2', set:[2, 3, 4, 5, 6], k:'2 t/m 6', kn:'1' } ];
  var DOB_RAND = [ { wat:'een 7', set:[] }, { wat:'een 0', set:[] }, { wat:'minder dan 7', set:[1, 2, 3, 4, 5, 6] }, { wat:'een getal van 1 tot en met 6', set:[1, 2, 3, 4, 5, 6] } ];
  function verdeel(R, N, k){ var d = [], i; for (i = 0; i < k; i++) d.push(1); for (i = k; i < N; i++) d[R.heel(0, k - 1)]++; return d; }
  function maakDob(R, o){
    var g = R.kies(o.rand && R.heel(0, 2) === 0 ? DOB_RAND : DOB.filter(o.dobFilter || function(){ return true; })), set = g.set;
    return { soort:'dob', n:6, t:set.length, wat:g.wat, set:set, k:g.k, kn:g.kn,
      ctx:'Je gooit één keer met een gewone dobbelsteen.',
      hTot:'Een dobbelsteen heeft 6 kanten: 1, 2, 3, 4, 5 en 6.',
      hGun:set.length ? 'Welke kanten horen bij ' + g.wat + '? Dat zijn: ' + lijst(set) + '.' : 'Een dobbelsteen heeft alleen de getallen 1 tot en met 6.',
      herhaal:function(M){ return 'Je gooit ' + M + ' keer met een gewone dobbelsteen.'; },
      niet:/^een /.test(g.wat) ? 'geen ' + g.wat.slice(4) : 'niet ' + g.wat,
      beeld:function(aan){ return stenen(aan ? set : []); } };
  }
  function maakKleur(R, o, soort){
    var lijstN = soort === 'zak' ? [4, 5, 6, 8, 9, 10, 12, 15, 20] : [4, 5, 6, 8, 10];
    if (o.noemers) lijstN = lijstN.filter(function(x){ return o.noemers.indexOf(x) >= 0; });
    if (!lijstN.length) return null;
    var N = R.kies(lijstN), kk = o.rand && R.heel(0, 4) === 0 ? 1 : R.heel(2, Math.min(o.maxKleur || 3, N));
    var kl = R.hussel(KLEUREN).slice(0, kk), aant = verdeel(R, N, kk), c;
    c = o.rand && R.heel(0, 3) === 0 ? KLEUREN.filter(function(x){ return kl.indexOf(x) < 0; })[0] : R.kies(kl);
    var t = kl.indexOf(c) >= 0 ? aant[kl.indexOf(c)] : 0, paren = kl.map(function(x, i){ return [x, aant[i]]; });
    if (soort === 'zak'){
      var zin = kk === 1 ? 'In een zak zitten ' + N + ' ' + BIJV[kl[0]] + ' knikkers, verder niets.' : 'In een zak zitten ' + lijst(paren.map(function(q){ return q[1] + ' ' + BIJV[q[0]]; })) + ' knikkers.';
      return { soort:'zak', n:N, t:t, wat:'een ' + BIJV[c] + ' knikker', kleur:c, paren:paren, k:c, kn:'niet ' + c, zin:zin,
        ctx:zin + ' Je pakt zonder te kijken één knikker.',
        hTot:kk === 1 ? 'Er zitten ' + N + ' knikkers in de zak.' : 'Tel alle knikkers: ' + aant.join(' + ') + '.',
        hGun:t ? 'Hoeveel ' + BIJV[c] + ' knikkers zitten er in de zak?' : 'Zitten er ' + BIJV[c] + ' knikkers in de zak?',
        herhaal:function(M){ return zin + ' Je pakt zonder te kijken een knikker, kijkt welke kleur hij heeft en legt hem terug. Dat doe je ' + M + ' keer.'; },
        niet:'geen ' + BIJV[c] + ' knikker',
        beeld:function(aan){ return zak(paren, { aan:aan ? c : null }); } };
    }
    var vakken = []; kl.forEach(function(x, i){ for (var j = 0; j < aant[i]; j++) vakken.push(x); });
    vakken = R.hussel(vakken);
    var zinR = kk === 1 ? 'Een rad heeft ' + N + ' even grote vakken, allemaal ' + kl[0] + '.' : 'Een rad heeft ' + N + ' even grote vakken: ' + lijst(paren.map(function(q){ return q[1] + ' ' + q[0]; })) + '.';
    return { soort:'rad', n:N, t:t, wat:c, kleur:c, paren:paren, vakken:vakken, k:c, kn:'niet ' + c, zin:zinR,
      ctx:zinR + ' Je draait één keer.', hTot:'Tel alle vakken van het rad.', hGun:t ? 'Tel de vakken met ' + c + '.' : 'Heeft het rad vakken met ' + c + '?',
      herhaal:function(M){ return zinR + ' Je draait ' + M + ' keer.'; }, niet:'niet ' + c,
      beeld:function(aan){ return rad(vakken, { aan:aan ? [c] : null }); } };
  }
  /* o: soorten ['dob','zak','rad'], rand (ook kans 0 of 1), noemers (toegestane totalen), ok(e), dobFilter */
  function experiment(R, o){
    o = o || {};
    for (var p = 0; p < 500; p++){
      var soort = R.kies(o.soorten || ['dob', 'zak', 'rad']), e;
      if (soort === 'dob'){ if (o.noemers && o.noemers.indexOf(6) < 0) continue; e = maakDob(R, o); }
      else e = maakKleur(R, o, soort);
      if (!e || (o.ok && !o.ok(e))) continue;
      if (!o.rand && (e.t === 0 || e.t === e.n)) continue;
      return e;
    }
    return maakDob(R, {});
  }

  /* ================= data verzamelen en ordenen (1F) ================= */
  var TURF = [
    { ctx:'De klas turfde de antwoorden op de vraag: "Hoe kom je naar school?"', cats:['fiets', 'bus', 'lopend', 'auto'] },
    { ctx:'De klas turfde de antwoorden op de vraag: "Wat is je lievelingssport?"', cats:['voetbal', 'hockey', 'zwemmen', 'dansen'] },
    { ctx:'De klas turfde de antwoorden op de vraag: "Welk fruit eet je het liefst?"', cats:['appel', 'banaan', 'mandarijn', 'peer'] },
    { ctx:'De klas turfde de antwoorden op de vraag: "Welk huisdier heb je?"', cats:['hond', 'kat', 'konijn', 'vis'] },
    { ctx:'Bij de school turfde je de kleur van de auto\'s die langsreden.', cats:['grijs', 'zwart', 'wit', 'rood'] },
    { ctx:'In de tuin turfde je welke vogels je zag.', cats:['mus', 'merel', 'duif', 'koolmees'] } ];
  var FREQ = [
    { wat:'hoeveel huisdieren ze thuis hebben', kop:'huisdieren', w:[0, 1, 2, 3, 4] },
    { wat:'hoeveel broers en zussen ze hebben', kop:'broers en zussen', w:[0, 1, 2, 3, 4] },
    { wat:'hun rapportcijfer voor rekenen', kop:'cijfer', w:[5, 6, 7, 8, 9] },
    { wat:'hun schoenmaat', kop:'schoenmaat', w:[37, 38, 39, 40, 41] },
    { wat:'op hoeveel dagen per week ze sporten', kop:'dagen sport', w:[0, 1, 2, 3, 4] } ];
  var KLAS = [
    { wat:'de lengte van leerlingen, in cm', lo:140, eenh:'cm' }, { wat:'het gewicht van leerlingen, in kg', lo:40, eenh:'kg' },
    { wat:'de punten van leerlingen bij een toets', lo:10, eenh:'punten' }, { wat:'de reistijd van leerlingen naar school, in minuten', lo:0, eenh:'minuten' },
    { wat:'de lengte van planten na een proef, in mm', lo:60, eenh:'mm' } ];
  var STAAF = [
    { cats:['ma', 'di', 'wo', 'do'], kop:'dag', wat:'het aantal bezoekers van de bibliotheek' }, { cats:['1A', '1B', '1C', '1D'], kop:'klas', wat:'het aantal ingeleverde flessen' },
    { cats:['appel', 'peer', 'banaan', 'kiwi'], kop:'fruit', wat:'het aantal verkochte stuks fruit' }, { cats:['jan', 'feb', 'mrt', 'apr'], kop:'maand', wat:'het aantal geleende boeken' } ];
  var RELA = [
    { vr:'Hoe kom je naar school?', cats:['fiets', 'bus', 'lopend', 'auto'], wie:'leerlingen' },
    { vr:'Wat is je lievelingsvak?', cats:['gym', 'rekenen', 'Engels', 'tekenen'], wie:'leerlingen' },
    { vr:'Welke smaak ijs vind je het lekkerst?', cats:['vanille', 'aardbei', 'chocolade', 'citroen'], wie:'mensen' },
    { vr:'Welk seizoen vind je het mooist?', cats:['lente', 'zomer', 'herfst', 'winter'], wie:'mensen' } ];
  var VERG = [
    { a:'klas 2A', b:'klas 2B', wie:'leerlingen', doen:'fietsen naar school', groot:false },
    { a:'klas 3A', b:'klas 3B', wie:'leerlingen', doen:'hebben een huisdier', groot:false },
    { a:'school De Brug', b:'school Het Anker', wie:'leerlingen', doen:'hebben een bijbaantje', groot:true },
    { a:'dorp Oosterend', b:'dorp Westerend', wie:'inwoners', doen:'hebben zonnepanelen', groot:true },
    { a:'sportclub Snel', b:'sportclub Sterk', wie:'leden', doen:'deden mee aan het toernooi', groot:false } ];
  var ENQ = [
    { over:'de kantine', goed:'Wat vind je van de prijzen in de kantine: te duur, precies goed of goedkoop?', stuur:'Vind jij ook dat de kantine veel te duur is?', vaag:'Hoe vind je de kantine?' },
    { over:'sport', goed:'Hoeveel uur per week sport je buiten school?', stuur:'Je sport toch zeker wel elke week?', vaag:'Sport je veel?' },
    { over:'telefoongebruik', goed:'Hoeveel uur zit je op een schooldag op je telefoon?', stuur:'Zit jij ook veel te lang op je telefoon?', vaag:'Gebruik je je telefoon vaak?' },
    { over:'huiswerk', goed:'Hoeveel minuten besteed je per dag aan huiswerk?', stuur:'Vind je ook dat we veel te veel huiswerk krijgen?', vaag:'Doe je veel huiswerk?' },
    { over:'het schoolreisje', goed:'Waar wil je heen met het schoolreisje: pretpark, museum of strand?', stuur:'Het pretpark is het leukst, of wil je toch naar een saai museum?', vaag:'Wat wil je met het schoolreisje?' },
    { over:'slapen', goed:'Hoe laat ga je op een schooldag naar bed?', stuur:'Ga jij ook veel te laat naar bed?', vaag:'Slaap je genoeg?' },
    { over:'ontbijten', goed:'Op hoeveel dagen per week ontbijt je voordat je naar school gaat?', stuur:'Ontbijten is gezond, dus jij ontbijt toch elke dag?', vaag:'Hoe zit het met je ontbijt?' },
    { over:'hoe leerlingen naar school komen', goed:'Hoe kom je meestal naar school: lopend, met de fiets, met de bus of met de auto?', stuur:'Kom je met de fiets, zoals een gezonde leerling?', vaag:'Hoe reis je?' },
    { over:'zakgeld', goed:'Hoeveel zakgeld krijg je per maand?', stuur:'Krijg jij ook veel te weinig zakgeld?', vaag:'Krijg je veel zakgeld?' },
    { over:'lezen', goed:'Hoeveel boeken heb je dit jaar uitgelezen?', stuur:'Lezen is saai, toch?', vaag:'Lees je weleens wat?' },
    { over:'muziek', goed:'Naar welke soort muziek luister je het meest: pop, hiphop, rock of iets anders?', stuur:'Hiphop is toch de beste muziek?', vaag:'Wat vind je van muziek?' },
    { over:'de pauze', goed:'Hoe lang moet de grote pauze volgens jou zijn: 15, 20 of 30 minuten?', stuur:'Vind je ook dat de pauze veel te kort is?', vaag:'Wat vind je van de pauze?' },
    { over:'computerspelletjes', goed:'Hoeveel uur per week speel je computerspelletjes?', stuur:'Computerspelletjes zijn slecht voor je, hoeveel uur speel jij ze?', vaag:'Speel je veel spelletjes?' },
    { over:'het schoolplein', goed:'Wat wil je het liefst op het schoolplein: meer bankjes, een voetbalveldje of meer groen?', stuur:'Wil jij ook eindelijk een voetbalveldje op het schoolplein?', vaag:'Wat moet er anders?' },
    { over:'huisdieren', goed:'Hoeveel huisdieren zijn er bij jou thuis?', stuur:'Iedereen houdt van dieren, hoeveel huisdieren heb jij?', vaag:'Heb je veel dieren?' },
    { over:'groente eten', goed:'Op hoeveel dagen per week eet je groente bij het avondeten?', stuur:'Jij eet toch zeker elke dag groente?', vaag:'Eet je gezond?' } ];

  /* ================= grafieken kritisch bekijken (2F) ================= */
  var INFO = [
    { ev:'slaapt te weinig', mv:'slapen te weinig' }, { ev:'sport elke week', mv:'sporten elke week' }, { ev:'heeft een bijbaantje', mv:'hebben een bijbaantje' },
    { ev:'ontbijt niet', mv:'ontbijten niet' }, { ev:'speelt elke dag een computerspel', mv:'spelen elke dag een computerspel' }, { ev:'fietst naar school', mv:'fietsen naar school' },
    { ev:'heeft een huisdier', mv:'hebben een huisdier' }, { ev:'leest elke week een boek', mv:'lezen elke week een boek' } ];
  var ASTOP = [
    { titel:'leerlingen per school', a:'De Brug', b:'Het Anker', ww:'heeft', u:[5, 10, 20] },
    { titel:'verkochte fietsen', a:'winkel A', b:'winkel B', ww:'verkocht', u:[1, 2, 5] },
    { titel:'bezoekers per dag', a:'museum A', b:'museum B', ww:'kreeg', u:[10, 20, 50] },
    { titel:'prijs per maand in euro', a:'Belbel', b:'Praatnet', ww:'kost', u:[1] } ];
  var SCHAAL = [
    { wat:'leden van twee sportclubs', a:'club Oost', b:'club West' }, { wat:'bezoekers van twee musea, per dag', a:'museum A', b:'museum B' },
    { wat:'verkochte ijsjes bij twee kramen, per week', a:'kraam A', b:'kraam B' }, { wat:'leerlingen van twee scholen', a:'De Brug', b:'Het Anker' } ];
  var BEELDG = [
    { wat:'nieuwe huizen in {a} en {b}', a:'2015', b:'2025' }, { wat:'verkochte huizen in Zeewijk en Bergdorp', a:'Zeewijk', b:'Bergdorp' },
    { wat:'huizen met zonnepanelen in {a} en {b}', a:'2018', b:'2024' }, { wat:'huizen met een groen dak in {a} en {b}', a:'2020', b:'2025' } ];
  var PROCZ = [
    { a:'Voetbalclub Oost', b:'Voetbalclub West', wie:'leden', ww:'groeit' }, { a:'Webshop Snel', b:'Webshop Groot', wie:'klanten', ww:'groeit' },
    { a:'Vlogger Sam', b:'Vlogger Fleur', wie:'abonnees', ww:'groeit' }, { a:'School De Brug', b:'School Het Anker', wie:'leerlingen', ww:'groeit' } ];
  var CONCL = [
    { ctx:'De klas stemde over het schoolreisje.', cats:['het pretpark', 'de dierentuin', 'het strand', 'het museum'], lab:['pretpark', 'dierentuin', 'strand', 'museum'], eenh:'stemmen', ww:'kreeg', wm:'kregen' },
    { ctx:'De uitslag van de verkiezing voor klassenvertegenwoordiger.', cats:['Noor', 'Daan', 'Sami', 'Lotte'], eenh:'stemmen', ww:'kreeg', wm:'kregen' },
    { ctx:'De uitslag van de quiz.', cats:['team Rood', 'team Blauw', 'team Groen', 'team Geel'], lab:['Rood', 'Blauw', 'Groen', 'Geel'], eenh:'punten', ww:'kreeg', wm:'kregen' },
    { ctx:'De punten van de klassen op de sportdag.', cats:['klas 1A', 'klas 1B', 'klas 1C', 'klas 1D'], lab:['1A', '1B', '1C', '1D'], eenh:'punten', ww:'kreeg', wm:'kregen' },
    { ctx:'De doelpunten van vier spelers dit seizoen.', cats:['Emma', 'Milan', 'Yara', 'Jesse'], eenh:'doelpunten', ww:'maakte', wm:'maakten' } ];
  var OORZ = [
    { zin:'In maanden waarin veel ijsjes worden verkocht, verdrinken er meer mensen.', concl:'Ijs eten zorgt ervoor dat mensen verdrinken.', goed:'Bij warm weer eten mensen meer ijs én gaan ze vaker zwemmen.', x:'verkochte ijsjes', y:'verdrinkingen' },
    { zin:'Kinderen met grotere voeten kunnen beter lezen.', concl:'Grote voeten maken je een betere lezer.', goed:'Oudere kinderen hebben grotere voeten én lezen beter.', x:'schoenmaat', y:'leesniveau' },
    { zin:'Hoe meer brandweerlieden er bij een brand zijn, hoe meer schade er is.', concl:'Brandweerlieden zorgen voor schade.', goed:'Bij een grote brand komen er meer brandweerlieden én is er meer schade.', x:'brandweerlieden', y:'schade' },
    { zin:'Mensen met een paraplu bij zich hebben vaker natte schoenen.', concl:'Een paraplu zorgt voor natte schoenen.', goed:'Als het regent, nemen mensen een paraplu mee én worden hun schoenen nat.', x:'paraplu\'s', y:'natte schoenen' },
    { zin:'Op dagen dat er veel zonnebrillen worden verkocht, worden er ook veel barbecues verkocht.', concl:'Zonnebrillen zorgen ervoor dat mensen gaan barbecueën.', goed:'Bij zonnig weer kopen mensen zonnebrillen én gaan ze barbecueën.', x:'zonnebrillen', y:'barbecues' },
    { zin:'Wie veel ijs eet, verbrandt vaker in de zon.', concl:'Ijs eten maakt je huid gevoeliger voor de zon.', goed:'Op zonnige dagen eten mensen meer ijs én zitten ze langer in de zon.', x:'ijsjes', y:'zonnebrand' },
    { zin:'In weken waarin veel warme chocolademelk wordt verkocht, gaan er meer mensen schaatsen.', concl:'Warme chocolademelk zorgt ervoor dat mensen gaan schaatsen.', goed:'Als het vriest, drinken mensen meer warme chocolademelk én kunnen ze schaatsen.', x:'chocolademelk', y:'schaatsers' },
    { zin:'Hoe meer kerken een stad heeft, hoe meer cafés er zijn.', concl:'Kerken zorgen voor meer cafés.', goed:'In een grote stad is van alles meer: meer kerken én meer cafés.', x:'kerken', y:'cafés' },
    { zin:'In landen waar meer chocolade wordt gegeten, winnen mensen vaker een Nobelprijs.', concl:'Chocolade eten maakt je slimmer.', goed:'Rijke landen kopen meer chocolade én geven meer geld uit aan onderzoek.', x:'chocolade', y:'Nobelprijzen' },
    { zin:'Steden met meer politieagenten hebben meer misdaad.', concl:'Politieagenten zorgen voor misdaad.', goed:'Waar veel misdaad is, zet de gemeente meer politie in.', x:'agenten', y:'misdaad', om:true },
    { zin:'Mensen in het ziekenhuis zijn vaker ziek dan mensen thuis.', concl:'Het ziekenhuis maakt mensen ziek.', goed:'Zieke mensen gaan naar het ziekenhuis, niet andersom.', x:'in het ziekenhuis', y:'ziek', om:true },
    { zin:'Leerlingen die bijles krijgen, hebben vaak lagere cijfers dan leerlingen zonder bijles.', concl:'Bijles zorgt voor lagere cijfers.', goed:'Leerlingen met lage cijfers krijgen vaker bijles.', x:'bijles', y:'lage cijfers', om:true },
    { zin:'Mensen met een brandblusser in huis hebben vaker brand gehad.', concl:'Een brandblusser zorgt voor brand.', goed:'Wie al eens brand heeft gehad, koopt eerder een brandblusser.', x:'brandblussers', y:'branden', om:true } ];
  var STEEK = [
    { wil:'welke sport de leerlingen van de school het leukst vinden', wie:'leerlingen', eerlijk:'Ze lootten leerlingen uit alle klassen.', oneerlijk:'Ze vroegen het aan leerlingen bij de ingang van de voetbalclub.' },
    { wil:'hoe tevreden de inwoners van de stad zijn over de bus', wie:'inwoners', eerlijk:'Ze kozen willekeurig adressen uit de hele stad.', oneerlijk:'Ze vroegen het aan mensen die al een uur bij een bushalte wachtten.' },
    { wil:'hoeveel uur jongeren per week computerspelletjes spelen', wie:'jongeren', eerlijk:'Ze kozen willekeurig leerlingen van verschillende scholen.', oneerlijk:'Ze vroegen het aan bezoekers van een spellenbeurs.' },
    { wil:'welk ijs mensen in Nederland het lekkerst vinden', wie:'mensen', eerlijk:'Ze kozen willekeurig mensen uit het hele land.', oneerlijk:'Ze vroegen het aan klanten van een ijswinkel die vooral chocolade-ijs verkoopt.' },
    { wil:'hoeveel leerlingen met de fiets naar school komen', wie:'leerlingen', eerlijk:'Ze lootten leerlingen uit de hele leerlingenlijst.', oneerlijk:'Ze vroegen het aan leerlingen in de fietsenstalling.' },
    { wil:'hoe vaak mensen een boek lezen', wie:'mensen', eerlijk:'Ze belden willekeurige mensen uit het hele land.', oneerlijk:'Ze vroegen het aan bezoekers van de bibliotheek.' },
    { wil:'wat de leerlingen van het schoolkamp vonden', wie:'leerlingen', eerlijk:'Ze lootten leerlingen uit alle groepen die mee waren.', oneerlijk:'Ze vroegen het alleen aan de leerlingen die het kamp hadden helpen organiseren.' },
    { wil:'hoeveel uur jongeren per nacht slapen', wie:'jongeren', eerlijk:'Ze kozen willekeurig jongeren uit het hele land.', oneerlijk:'Ze vroegen het om twee uur \'s nachts aan jongeren die nog op een feest waren.' } ];

  /* claims bij een staafdiagram (Klopt de conclusie?) */
  function claim(R, th, v, soort, waar){
    var c = th.cats, e = th.eenh, i, j, kand = [], tot = som(v), mx = Math.max.apply(null, v), mn = Math.min.apply(null, v);
    if (soort === 'max' || soort === 'min'){
      var doel = soort === 'max' ? mx : mn;
      for (i = 0; i < 4; i++) if ((v[i] === doel) === waar) kand.push(i);
      if (!kand.length) return null;
      i = R.kies(kand);
      return { t:c[i] + ' ' + th.ww + ' de ' + (soort === 'max' ? 'meeste ' : 'minste ') + e, h:cap(c[i]) + ' heeft ' + v[i] + '. Het ' + (soort === 'max' ? 'meeste' : 'minste') + ' is ' + doel + '.' };
    }
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++){
      if (i === j) continue;
      if (soort === 'meer' && (v[i] > v[j]) === waar) kand.push([i, j]);
      if (soort === 'dubbel' && v[i] > v[j] && (v[i] === 2 * v[j]) === waar) kand.push([i, j]);
      if (soort === 'helft' && i < j && 2 * (v[i] + v[j]) !== tot && (2 * (v[i] + v[j]) > tot) === waar) kand.push([i, j]);
    }
    if (!kand.length) return null;
    var p = R.kies(kand); i = p[0]; j = p[1];
    if (soort === 'meer') return { t:c[i] + ' ' + th.ww + ' meer ' + e + ' dan ' + c[j], h:cap(c[i]) + ' heeft ' + v[i] + ' en ' + c[j] + ' heeft ' + v[j] + '.' };
    if (soort === 'dubbel') return { t:c[i] + ' ' + th.ww + ' twee keer zoveel ' + e + ' als ' + c[j], h:'2 ' + X + ' ' + v[j] + ' = ' + (2 * v[j]) + '. ' + cap(c[i]) + ' heeft ' + v[i] + '.' };
    return { t:c[i] + ' en ' + c[j] + ' ' + th.wm + ' samen meer dan de helft van alle ' + e, h:'Samen ' + v[i] + ' + ' + v[j] + ' = ' + (v[i] + v[j]) + '. Alles samen is ' + tot + ', de helft is ' + T(tot / 2) + '.' };
  }

  /* ================= kansen berekenen (3F): de manieren, ook voor "Kies de handigste manier" ================= */
  function mRooster(R){
    var th = R.kies([
      { a:6, b:6, zin:'Je gooit met twee dobbelstenen.', links:'de eerste dobbelsteen', boven:'de tweede dobbelsteen' },
      { a:6, b:6, zin:'Je gooit met een rode en een blauwe dobbelsteen.', links:'de rode dobbelsteen', boven:'de blauwe dobbelsteen' },
      { a:6, b:4, zin:'Je gooit met een dobbelsteen en draait aan een rad met de getallen 1 tot en met 4.', links:'de dobbelsteen', boven:'het rad' },
      { a:4, b:4, zin:'Je draait twee keer aan een rad met de getallen 1 tot en met 4.', links:'de eerste keer', boven:'de tweede keer' } ]);
    var a = th.a, b = th.b, ops = [], i, j, s0;
    for (s0 = 3; s0 <= a + b - 1; s0++) ops.push({ soort:'som', s:s0, wat:'de som ' + s0 + ' is', hfd:'is de som ' + s0, lijn:true, f:function(x, y, s){ return x + y === s; } });
    for (s0 = 5; s0 <= a + b - 3; s0++) ops.push({ soort:'som', s:s0, wat:'de som meer dan ' + s0 + ' is', hfd:'is de som meer dan ' + s0, f:function(x, y, s){ return x + y > s; } });
    for (s0 = 1; s0 <= Math.min(a, b) - 2; s0++) ops.push({ soort:'verschil', s:s0, wat:'het verschil ' + s0 + ' is', hfd:'is het verschil ' + s0, f:function(x, y, s){ return Math.abs(x - y) === s; } });
    var op = R.kies(ops), cel = [], c = 0;
    for (i = 1; i <= a; i++) for (j = 1; j <= b; j++) if (op.f(i, j, op.s)){ c++; cel.push([i, j]); }
    var waarde = function(x, y){ return op.soort === 'som' ? x + y : Math.abs(x - y); };
    function tab(n){
      var rows = [[op.soort === 'som' ? '+' : MIN].concat(Array.apply(null, { length:b }).map(function(_, k){ return String(k + 1); }))];
      for (var x = 1; x <= a; x++){ var r = [String(x)]; for (var y = 1; y <= b; y++) r.push(String(waarde(x, y))); rows.push(r); }
      return R.teken.tabel(rows, { kop:true, zijkop:true, nadruk:n >= 2 ? cel : [] });
    }
    var ab = a * b;
    return kansOp({ vraag:'Kans dat ' + op.wat + '?', context:th.zin + ' Hoe groot is de kans dat ' + op.wat + '?' + (op.soort === 'verschil' ? ' Het verschil is het grootste getal min het kleinste.' : ''),
      beeld:tab, zelfBeeld:tab(0), stappen:[
        St('Links ' + th.links + ', boven ' + th.boven + '. Hoeveel vakjes heeft het rooster? ' + a + ' ' + X + ' ' + b + ' =', ab, 'Er staan ' + a + ' getallen links en ' + b + ' bovenaan. Elk vakje is een uitkomst.', F(ab, a + b, 'Je telde op. Elk getal links hoort bij elk getal boven: vermenigvuldig.')),
        St('In hoeveel vakjes ' + op.hfd + '?', c, (op.lijn ?'De vakjes met ' + op.s + ' liggen op een schuine lijn. ' : '') + 'Zoek ze in het rooster en tel ze.'),
        Kb('De kans is gunstig gedeeld door totaal:', c, ab, c + ' van de ' + ab + ' vakjes: ' + br(c, ab) + '.', 'breuk', F(br(c, ab), br(ab, c), 'Andersom: het gunstige aantal komt boven de streep.')) ] }, c, ab);
  }
  function mBoomMunt(R, n){
    n = n || R.heel(2, 3);
    var k = R.heel(0, n), tot = macht(2, n), paden = [], i, j;
    for (i = 0; i < tot; i++){ var p = []; for (j = n - 1; j >= 0; j--) p.push((i >> j) & 1); paden.push(p); }
    var goed = paden.filter(function(p){ return p.filter(function(x){ return x === 0; }).length === k; });
    function str(p){ return p.map(function(x){ return x ? 'M' : 'K'; }).join(''); }
    var c = goed.length, niv = []; for (i = 0; i < n; i++) niv.push(['K', 'M']);
    var wat = k === 0 ? 'geen enkele keer kop' : k === n ? n + ' keer kop' : 'precies ' + k + ' keer kop';
    function pl(m){
      return boom(niv, { blad:function(p){ return str(p); }, nadruk:m >= 2 ? function(q){ return goed.some(function(g){ return q.every(function(x, z){ return g[z] === x; }); }); } : null });
    }
    return kansOp({ vraag:'Kans op ' + wat + '?', context:'Je gooit ' + n + ' keer met een munt. K is kop, M is munt. Hoe groot is de kans op ' + wat + '?', beeld:pl, stappen:[
      St('Hoeveel uitkomsten zijn er? ' + keten(2, n) + ' =', tot, 'Elke worp splitst elke tak in 2: kop of munt. Tel de eindjes van de boom.', F(tot, 2 * n, 'Je telde op. Elke worp verdubbelt het aantal takken: vermenigvuldig.')),
      St('Hoeveel eindjes hebben ' + wat + '?', c, c ? 'Het zijn: ' + lijst(goed.map(str)) + '.' : 'Zoek eindjes met alleen M.'),
      Kb('De kans is …', c, tot, c + ' van de ' + tot + ' eindjes: ' + br(c, tot) + '.', 'breuk') ] }, c, tot);
  }
  function enDeel(R, soort, al){
    if (soort === 'munt') return { t:1, n:2, wat:'kop', k:'kop', kn:'munt' };
    if (soort === 'dob'){ var g = R.kies(DOB); return { t:g.set.length, n:6, wat:g.wat, k:g.k, kn:g.kn }; }
    if (soort === 'rad'){ var n = R.kies([4, 5, 8, 10]), t = R.heel(1, n - 1), c = R.kies(KLEUREN.slice(0, 3)); return { t:t, n:n, wat:c, k:c, kn:'niet ' + c, zin:'een rad met ' + n + ' even grote vakken, waarvan ' + t + ' ' + c };
    }
    return null;
  }
  function mEn(R){
    var vorm = R.kies(['dob-munt', 'dob-dob', 'rad-munt', 'rad-dob', 'zak']), e1, e2, ctx, vraag;
    if (vorm === 'zak'){
      var N = R.kies([5, 6, 8, 10]), r = R.heel(1, N - 1), bl = N - r, kl = R.hussel(['rood', 'blauw', 'groen']).slice(0, 2);
      var zin = 'In een zak zitten ' + r + ' ' + BIJV[kl[0]] + ' en ' + bl + ' ' + BIJV[kl[1]] + ' knikkers. Je pakt een knikker, kijkt welke kleur hij heeft en legt hem terug. Dan pak je er nog een.';
      var c1 = 0, c2 = R.heel(0, 1);
      e1 = { t:r, n:N, wat:kl[0], k:kl[0], kn:kl[1] };
      e2 = c2 === 0 ? { t:r, n:N, wat:kl[0], k:kl[0], kn:kl[1] } : { t:bl, n:N, wat:kl[1], k:kl[1], kn:kl[0] };
      e1.wat = BIJV[kl[c1]]; e2.wat = BIJV[kl[c2]];
      vraag = 'Kans op eerst ' + kl[c1] + ' en dan ' + kl[c2] + '?';
      ctx = zin + ' Hoe groot is de kans op eerst een ' + e1.wat + ' en dan een ' + e2.wat + ' knikker?';
      e1.wat = 'een ' + e1.wat + ' knikker'; e2.wat = 'een ' + e2.wat + ' knikker';
    } else {
      var d = vorm.split('-');
      e1 = enDeel(R, d[0]); e2 = enDeel(R, d[1]);
      if (vorm === 'dob-munt'){ ctx = 'Je gooit een dobbelsteen en een munt.'; vraag = 'Kans op ' + e1.wat + ' én ' + e2.wat + '?'; }
      else if (vorm === 'dob-dob'){ ctx = 'Je gooit twee keer met een dobbelsteen.'; vraag = 'Kans op eerst ' + e1.wat + ' en dan ' + e2.wat + '?'; }
      else if (vorm === 'rad-munt'){ ctx = 'Je draait aan ' + e1.zin + '. Daarna gooi je een munt.'; vraag = 'Kans op ' + e1.wat + ' én ' + e2.wat + '?'; }
      else { ctx = 'Je draait aan ' + e1.zin + '. Daarna gooi je een dobbelsteen.'; vraag = 'Kans op ' + e1.wat + ' én ' + e2.wat + '?'; }
      ctx += ' Hoe groot is de kans op ' + (vorm === 'dob-dob' ? 'eerst ' + e1.wat + ' en dan ' + e2.wat : e1.wat + ' én ' + e2.wat) + '?';
    }
    var t = e1.t * e2.t, n = e1.n * e2.n, twee = vorm === 'zak' || vorm === 'dob-dob';
    function pl(m){
      return boom([[e1.k, e1.kn], [e2.k, e2.kn]], { kans:[[br(e1.t, e1.n), br(e1.n - e1.t, e1.n)], [br(e2.t, e2.n), br(e2.n - e2.t, e2.n)]],
        nadruk:m >= 3 ? function(q){ return q.every(function(x){ return x === 0; }); } : null, blad:m >= 3 ? function(p){ return p[0] === 0 && p[1] === 0 ? br(t, n) : ''; } : null });
    }
    return kansOp({ vraag:vraag, context:ctx, beeld:pl, zelfBeeld:pl(0), stappen:[
      Kb((twee ? 'De eerste keer: kans op ' : 'Kans op ') + e1.wat + ':', e1.t, e1.n, 'Gunstig gedeeld door totaal: ' + e1.t + ' van de ' + e1.n + '.', 'breuk'),
      Kb((twee ? 'De tweede keer: kans op ' : 'Kans op ') + e2.wat + ':', e2.t, e2.n, 'Gunstig gedeeld door totaal: ' + e2.t + ' van de ' + e2.n + '.', 'breuk'),
      Kb('Allebei: ' + br(e1.t, e1.n) + ' ' + X + ' ' + br(e2.t, e2.n) + ' =', t, n, 'Teller keer teller: ' + e1.t + ' ' + X + ' ' + e2.t + '. Noemer keer noemer: ' + e1.n + ' ' + X + ' ' + e2.n + '.', 'breuk',
        F(uniek([br(t, n), brv(t, n)]), br(e1.t + e2.t, e1.n + e2.n), 'Je telde op. Bij én vermenigvuldig je de kansen.', br(e1.t * e2.n + e2.t * e1.n, n), 'Dat is optellen. Bij én vermenigvuldig je.')) ] }, t, n);
  }
  var DOB_OF = [ { wat:'een 1', set:[1] }, { wat:'een 2', set:[2] }, { wat:'een 3', set:[3] }, { wat:'een 5', set:[5] }, { wat:'een 6', set:[6] },
    { wat:'een even getal', set:[2, 4, 6] }, { wat:'meer dan 4', set:[5, 6] }, { wat:'minder dan 3', set:[1, 2] }, { wat:'meer dan 3', set:[4, 5, 6] }, { wat:'een oneven getal', set:[1, 3, 5] } ];
  function mOf(R, alleenApart){
    var vorm = alleenApart ? R.kies(['kleur', 'kleur', 'dob']) : R.kies(['kleur', 'kleur', 'dob', 'samen', 'proc']), A, B, i;
    if (vorm === 'proc'){
      var p = [5 * R.heel(2, 8), 0, 0]; p[1] = 5 * R.heel(1, (100 - p[0]) / 5 - 2); p[2] = 100 - p[0] - p[1];
      var kl = R.hussel(['rood', 'blauw', 'groen']), ia = R.heel(0, 2), ib = (ia + R.heel(1, 2)) % 3, q = p[ia] + p[ib];
      var zinP = 'Een rad heeft vakken die niet even groot zijn. De kans op ' + kl[0] + ' is ' + p[0] + '%, op ' + kl[1] + ' ' + p[1] + '% en op ' + kl[2] + ' ' + p[2] + '%.';
      var vakP = []; for (i = 0; i < 20; i++) vakP.push(kl[i < p[0] / 5 ? 0 : i < (p[0] + p[1]) / 5 ? 1 : 2]);
      var plP = function(m){ return rad(vakP, { aan:m >= 1 ? [kl[ia], kl[ib]] : null, tekst:vakP.map(function(){ return ''; }) }); };
      return { vraag:'Kans op ' + kl[ia] + ' of ' + kl[ib] + '?', context:zinP + ' Je draait één keer. Hoe groot is de kans op ' + kl[ia] + ' of ' + kl[ib] + '?', eenheid:'%', antwoord:pAnt(q), controle:kansC(q, 100), beeld:plP, zelfBeeld:plP(0), stappen:[
        Kv('Kan het rad in één keer op ' + kl[ia] + ' én op ' + kl[ib] + ' stoppen?', ['ja', 'nee'], 'nee', 'Het rad stopt op één vak, en dat heeft één kleur.'),
        Pr('Kans op ' + kl[ia] + ' of ' + kl[ib] + ': ' + p[ia] + '% + ' + p[ib] + '% =', q, 'Ze kunnen niet tegelijk, dus tel de kansen op: ' + p[ia] + ' + ' + p[ib] + '.') ] };
    }
    if (vorm === 'kleur'){
      var soort = R.kies(['zak', 'rad']), N = R.kies(soort === 'zak' ? [8, 10, 12, 15, 20] : [6, 8, 10]), kk = R.heel(3, Math.min(4, N)), kls = R.hussel(KLEUREN).slice(0, kk), aant = verdeel(R, N, kk);
      var x = R.heel(0, kk - 1), y = (x + R.heel(1, kk - 1)) % kk, paren = kls.map(function(c, z){ return [c, aant[z]]; }), tA = aant[x], tB = aant[y];
      var zinK, plK, wA, wB, vakken = [];
      if (soort === 'zak'){
        zinK = 'In een zak zitten ' + lijst(paren.map(function(q2){ return q2[1] + ' ' + BIJV[q2[0]]; })) + ' knikkers. Je pakt zonder te kijken één knikker.';
        wA = 'een ' + BIJV[kls[x]] + ' knikker'; wB = 'een ' + BIJV[kls[y]];
        plK = function(m){ return zak(paren, { aan:m >= 4 ? null : null }); };
      } else {
        kls.forEach(function(c, z){ for (var j = 0; j < aant[z]; j++) vakken.push(c); }); vakken = R.hussel(vakken);
        zinK = 'Een rad heeft ' + N + ' even grote vakken: ' + lijst(paren.map(function(q2){ return q2[1] + ' ' + q2[0]; })) + '. Je draait één keer.';
        wA = kls[x]; wB = kls[y];
        plK = function(m){ return rad(vakken, { aan:m >= 4 ? [kls[x], kls[y]] : null }); };
      }
      A = { t:tA, n:N, wat:soort === 'zak' ? 'een ' + BIJV[kls[x]] + ' knikker' : kls[x] }; B = { t:tB, n:N, wat:soort === 'zak' ? 'een ' + BIJV[kls[y]] + ' knikker' : kls[y] };
      var wat = soort === 'zak' ? 'een ' + BIJV[kls[x]] + ' of een ' + BIJV[kls[y]] + ' knikker' : kls[x] + ' of ' + kls[y];
      return kansOp({ vraag:'Kans op ' + (soort === 'zak' ? kls[x] + ' of ' + kls[y] : wat) + '?', context:zinK + ' Hoe groot is de kans op ' + wat + '?', beeld:plK, zelfBeeld:plK(0), stappen:[
        Kv('Kun je in één keer ' + A.wat + ' én ' + B.wat + ' krijgen?', ['ja', 'nee'], 'nee', soort === 'zak' ? 'Je pakt één knikker, en die heeft één kleur.' : 'Het rad stopt op één vak, en dat heeft één kleur.'),
        Kb('Kans op ' + A.wat + ':', tA, N, tA + ' van de ' + N + (soort === 'zak' ? ' knikkers ' + (tA === 1 ? 'is ' : 'zijn ') : ' vakken ' + (tA === 1 ? 'is ' : 'zijn ')) + (soort === 'zak' ? '' + kls[x] + '.' : kls[x] + '.'), 'breuk'),
        Kb('Kans op ' + B.wat + ':', tB, N, tB + ' van de ' + N + (soort === 'zak' ? ' knikkers ' + (tB === 1 ? 'is ' : 'zijn ') : ' vakken ' + (tB === 1 ? 'is ' : 'zijn ')) + (soort === 'zak' ? '' + kls[y] + '.' : kls[y] + '.'), 'breuk'),
        Kb('Samen: ' + br(tA, N) + ' + ' + br(tB, N) + ' =', tA + tB, N, 'De noemers zijn gelijk: tel de tellers op. ' + tA + ' + ' + tB + ' = ' + (tA + tB) + '.', 'breuk', F(uniek([br(tA + tB, N), brv(tA + tB, N)]), br(tA + tB, 2 * N), 'De noemer blijft ' + N + '. Je telt alleen de tellers op.', br(tA * tB, N * N), 'Dat is vermenigvuldigen. Bij of tel je op.')) ] }, tA + tB, N);
    }
    /* dobbelsteen: twee gebeurtenissen, apart of met overlap */
    var paar, ov;
    for (var tries = 0; tries < 200; tries++){
      A = R.kies(DOB_OF); B = R.kies(DOB_OF);
      if (A === B) continue;
      ov = A.set.filter(function(z){ return B.set.indexOf(z) >= 0; });
      var uni = uniek(A.set.concat(B.set));
      if (uni.length >= 6) continue;
      if ((vorm === 'samen') === (ov.length > 0)) break;
    }
    var u = uniek(A.set.concat(B.set)).sort(), wd = A.wat + ' of ' + B.wat;
    var plD = function(m){ return stenen(m >= 2 ? u : []); };
    if (ov.length){
      return kansOp({ vraag:'Kans op ' + wd + '?', context:'Je gooit één keer met een dobbelsteen. Hoe groot is de kans op ' + wd + '?', beeld:plD, zelfBeeld:plD(0), stappen:[
        Kv('Kan een worp tegelijk ' + A.wat + ' én ' + B.wat + ' zijn?', ['ja', 'nee'], 'ja', 'Kijk of een getal bij allebei hoort: ' + lijst(ov) + '.'),
        St('Welke getallen horen bij ' + A.wat + ' of ' + B.wat + ', of bij allebei? Hoeveel zijn het?', u.length, cap(A.wat) + ': ' + lijst(A.set) + '. ' + cap(B.wat) + ': ' + lijst(B.set) + '. Samen, zonder dubbel te tellen: ' + lijst(u) + '.', F(u.length, A.set.length + B.set.length, 'Je telde ' + lijst(ov) + ' dubbel. Tel elk getal maar één keer.')),
        Kb('De kans is …', u.length, 6, u.length + ' van de 6 kanten: ' + br(u.length, 6) + '.', 'breuk', F(uniek([br(u.length, 6), brv(u.length, 6)]), br(A.set.length + B.set.length, 6), 'Je telde ' + lijst(ov) + ' dubbel.')) ] }, u.length, 6);
    }
    var a = A.set.length, b = B.set.length;
    return kansOp({ vraag:'Kans op ' + wd + '?', context:'Je gooit één keer met een dobbelsteen. Hoe groot is de kans op ' + wd + '?', beeld:function(m){ return stenen(m >= 3 ? u : m >= 2 ? A.set.concat(m >= 3 ? B.set : []) : []); }, zelfBeeld:stenen([]), stappen:[
      Kv('Kan een worp tegelijk ' + A.wat + ' én ' + B.wat + ' zijn?', ['ja', 'nee'], 'nee', cap(A.wat) + ': ' + lijst(A.set) + '. ' + cap(B.wat) + ': ' + lijst(B.set) + '. Geen enkel getal hoort bij allebei.'),
      Kb('Kans op ' + A.wat + ':', a, 6, (a === 1 ? 'Dat is alleen de ' : 'Dat zijn: ') + lijst(A.set) + '.', 'breuk'),
      Kb('Kans op ' + B.wat + ':', b, 6, (b === 1 ? 'Dat is alleen de ' : 'Dat zijn: ') + lijst(B.set) + '.', 'breuk'),
      Kb('Samen: ' + br(a, 6) + ' + ' + br(b, 6) + ' =', a + b, 6, 'Gelijke noemers: tel de tellers op. ' + a + ' + ' + b + ' = ' + (a + b) + '.', 'breuk', F(uniek([br(a + b, 6), brv(a + b, 6)]), br(a + b, 12), 'De noemer blijft 6. Je telt alleen de tellers op.')) ] }, a + b, 6);
  }
  function mComp(R){
    var vorm = R.kies(['dob', 'dob', 'munt', 'zak', 'rad']), t, n, k, een, geen, minst, ctx, kort, kortN;
    if (vorm === 'dob'){ var d = R.kies([{ w:'6', t:1 }, { w:'1', t:1 }, { w:'5', t:1 }]); t = d.t; n = 6; k = R.kies([2, 2, 3]); een = 'een ' + d.w; geen = 'geen ' + d.w; minst = 'minstens één ' + d.w; kort = d.w; kortN = 'geen ' + d.w; ctx = 'Je gooit ' + k + ' keer met een dobbelsteen.'; }
    else if (vorm === 'munt'){ t = 1; n = 2; k = R.heel(2, 3); een = 'kop'; geen = 'geen kop'; minst = 'minstens één keer kop'; kort = 'K'; kortN = 'M'; ctx = 'Je gooit ' + k + ' keer met een munt.'; }
    else if (vorm === 'zak'){ n = R.kies([4, 5, 6, 8, 10]); t = R.heel(1, n - 2); var kz2 = R.hussel(['rood', 'blauw', 'groen']).slice(0, 2); k = 2; een = 'een ' + BIJV[kz2[0]] + ' knikker'; geen = 'geen ' + BIJV[kz2[0]] + ' knikker'; minst = 'minstens één ' + BIJV[kz2[0]] + ' knikker'; kort = kz2[0]; kortN = kz2[1];
      ctx = 'In een zak zitten ' + t + ' ' + BIJV[kz2[0]] + ' en ' + (n - t) + ' ' + BIJV[kz2[1]] + ' knikkers. Je pakt een knikker, kijkt en legt hem terug. Dat doe je 2 keer.'; }
    else { n = R.kies([4, 5, 8]); t = R.heel(1, n - 2); var c = R.kies(['rood', 'blauw', 'groen']); k = 2; een = c; geen = 'geen ' + c; minst = 'minstens één keer ' + c; kort = c; kortN = 'niet ' + c;
      ctx = 'Een rad heeft ' + n + ' even grote vakken, waarvan ' + t + ' ' + c + '. Je draait 2 keer.'; }
    var q = n - t, qk = macht(q, k), nk = macht(n, k), qs = []; for (var i = 0; i < k; i++) qs.push(br(q, n));
    var niv = [], kans = []; for (i = 0; i < k; i++){ niv.push([kort, kortN]); kans.push([br(t, n), br(q, n)]); }
    function pl(m){ return boom(niv, { kans:kans, nadruk:m >= 2 ? function(p){ return p.every(function(x){ return x === 1; }); } : null, blad:m >= 2 ? function(p){ return p.every(function(x){ return x === 1; }) ? geen + ': ' + br(qk, nk) : ''; } : null }); }
    return kansOp({ vraag:'Kans op ' + minst + '?', context:ctx + ' Hoe groot is de kans op ' + minst + '?', beeld:pl, zelfBeeld:pl(0), stappen:[
      Kb('Kans op ' + geen + ' bij één keer:', q, n, 'Van de ' + n + ' uitkomsten zijn er ' + q + ' zonder ' + een + '.', 'breuk', F(uniek([br(q, n), brv(q, n)]), br(t, n), 'Dat is de kans dat het wel gebeurt. Je wilt de kans op ' + geen + '.')),
      Kb('Kans op ' + geen + ', ' + k + ' keer achter elkaar: ' + qs.join(' ' + X + ' ') + ' =', qk, nk, 'Teller keer teller: ' + keten(q, k) + ' = ' + qk + '. Noemer keer noemer: ' + keten(n, k) + ' = ' + nk + '.', 'breuk'),
      Kb('Kans op ' + minst + ': 1 ' + MIN + ' ' + br(qk, nk) + ' =', nk - qk, nk, '1 is ' + br(nk, nk) + '. ' + nk + ' ' + MIN + ' ' + qk + ' = ' + (nk - qk) + '.', 'breuk', F(uniek([br(nk - qk, nk), brv(nk - qk, nk)]), br(qk, nk), 'Dat is de kans op ' + geen + '. Trek hem nog af van 1.')) ] }, nk - qk, nk);
  }

  LEERROUTE.voeg('rekenen', [
    /* ================= 1. Data verzamelen en ordenen (1F) ================= */
    { groep:{ id:'data-tel', niveau:'1F', domein:'verbanden', naam:'Data verzamelen en ordenen', kd:['rw11A.a', 'rw11A.c', 'rw11A.j'],
        uit:'Gegevens tellen met turfjes, ordenen in een frequentietabel of in klassen, er een staafdiagram van tekenen en twee groepen eerlijk vergelijken. En: hoe stel je een goede vraag voor een enquête?' },
      doelen:[
        { id:'data-turven', naam:'Turven en tellen', kort:'Tel de bosjes van vijf en tel de losse streepjes erbij',
          uit:'<p>Bij <b>turven</b> zet je voor elk antwoord een streepje. Het vijfde streepje zet je schuin door de vier andere. Zo krijg je <b>bosjes van vijf</b>.</p><p>Tellen gaat dan snel: tel de bosjes en doe keer 5. Tel daarna de losse streepjes erbij.</p><p>Drie bosjes en twee losse streepjes is 3 × 5 + 2 = 17.</p>',
          wanneer:'je tijdens het tellen bijhoudt hoe vaak iets voorkomt.',
          beeld:turf(['fiets', 'bus'], [17, 8], 0),
          maak:function(R){
            var th = R.kies(TURF), tel = th.cats.map(function(){ return R.heel(3, 27); }), k = R.heel(0, th.cats.length - 1), b = R.heel(1, 5), r = R.heel(1, 4);
            tel[k] = 5 * b + r;
            var pl = function(m){ return turf(th.cats, tel, m >= 1 ? k : -1); };
            return { vraag:'Hoeveel keer ' + th.cats[k] + '?', context:th.ctx, beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Hoeveel hele bosjes van vijf staan er bij ' + th.cats[k] + '?', b, 'Een bosje is vier streepjes rechtop met één schuin erdoor. Tel alleen de bosjes.'),
              St(b + ' ' + X + ' 5 =', 5 * b, 'Elk bosje is 5 streepjes. Tel in sprongen van 5.', F(5 * b, 4 * b, 'Een bosje is 5 streepjes: vier rechtop en één schuin.')),
              St('Tel de losse streepjes erbij: ' + (5 * b) + ' + ' + r + ' =', 5 * b + r, 'Achter de bosjes staan nog ' + r + ' losse streepjes.') ] };
          } },
        { id:'data-freq', naam:'Een frequentietabel maken', kort:'Tel per waarde hoe vaak hij voorkomt; samen is het precies het totaal',
          uit:'<p>Een <b>frequentietabel</b> zegt bij elke waarde hoe vaak hij voorkomt. Dat aantal heet de <b>frequentie</b>. Je telt het met turfjes.</p><p>Controleer altijd: alle frequenties samen zijn het <b>totaal</b> aantal gegevens.</p><p>Mis je er één? Dan reken je hem uit: het totaal min de andere frequenties. Tel daarna even na in de rij.</p>',
          wanneer:'je veel losse gegevens overzichtelijk wilt maken.',
          maak:function(R){
            var th = R.kies(FREQ), f, N;
            do { f = th.w.map(function(){ return R.heel(1, 6); }); N = som(f); } while (N < 14 || N > 24);
            var data = []; th.w.forEach(function(w, i){ for (var j = 0; j < f[i]; j++) data.push(w); }); data = R.hussel(data);
            var j = R.heel(0, th.w.length - 1), bekend = f.filter(function(_, i){ return i !== j; }), sb = som(bekend), rij = rijen(data, 8);
            var pl = function(m){
              return stapel(R.teken.tabel(rij), R.teken.tabel([[th.kop].concat(th.w.map(String)), ['frequentie'].concat(f.map(function(x, i){ return i === j && m < 3 ? '?' : String(x); }))], { zijkop:true, nadruk:m >= 3 ? [[1, j + 1]] : [] }));
            };
            return { vraag:'Hoe vaak komt ' + th.w[j] + ' voor?', context:'Leerlingen noemden ' + th.wat + '. Maak de frequentietabel af.', beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Hoeveel gegevens staan er in de rij?', N, 'Tel per rij: ' + rij.map(function(r){ return r.filter(function(x){ return x !== ''; }).length; }).join(' + ') + '.'),
              St('Tel de frequenties op die al in de tabel staan: ' + bekend.join(' + ') + ' =', sb, 'Tel ze een voor een bij elkaar op.'),
              St('Dus ' + th.w[j] + ' komt ' + N + ' ' + MIN + ' ' + sb + ' keer voor. Hoeveel is dat?', f[j], 'Alles samen is ' + N + '. Tel ter controle in de rij elke ' + th.w[j] + '.', F(f[j], sb, 'Dat zijn de andere waarden samen. Haal ze af van het totaal.', N, 'Dat is het totaal. Haal de andere frequenties ervan af.')) ] };
          } },
        { id:'data-klassen', naam:'Gegevens in klassen indelen', kort:'Maak groepen die even breed zijn, zoals 150-159 en 160-169, en tel per groep',
          uit:'<p>Zijn er veel verschillende getallen, zoals lengtes in cm? Dan maak je <b>klassen</b>: groepen die even breed zijn, zoals 150-159, 160-169 en 170-179.</p><p>Elk getal hoort in <b>precies één</b> klasse. 159 hoort bij 150-159, en 160 hoort al bij 160-169.</p><p>Tel daarna per klasse hoeveel getallen erin vallen.</p>',
          wanneer:'er zoveel verschillende getallen zijn dat een gewone frequentietabel te lang wordt.',
          maak:function(R){
            var th = R.kies(KLAS), lo = th.lo, c = R.heel(0, 3), cs = lo + 10 * c, data = [], i, N = R.heel(14, 19);
            var vast = [cs, cs + 9]; if (c < 3) vast.push(cs + 10); if (c > 0) vast.push(cs - 1);
            vast.forEach(function(x){ data.push(x); });
            for (i = 0; i < 4; i++) data.push(lo + 10 * i + R.heel(0, 9));
            while (data.length < N) data.push(R.heel(lo, lo + 39));
            data = R.hussel(data);
            var lab = [0, 1, 2, 3].map(function(z){ return (lo + 10 * z) + '-' + (lo + 10 * z + 9); });
            function kl(x){ return Math.floor((x - lo) / 10); }
            function tel(a, b){ return data.filter(function(x){ return x >= a && x <= b; }).length; }
            var cnt = tel(cs, cs + 9), g = R.kies(vast), rij = rijen(data, 8);
            var pl = function(m){ return stapel(R.teken.tabel(rij, { nadruk:[] }), R.teken.tabel([['klasse'].concat(lab), ['aantal'].concat(lab.map(function(_, z){ return z === c ? (m >= 2 ? String(cnt) : '?') : ''; }))], { zijkop:true, nadruk:m >= 2 ? [[1, c + 1]] : [] })); };
            var fo = {}; if (c < 3) fo[String(cnt + tel(cs + 10, cs + 10))] = 'Let op: ' + (cs + 10) + ' hoort al bij de volgende klasse.'; if (c > 0) fo[String(cnt + tel(cs - 1, cs - 1))] = 'Let op: ' + (cs - 1) + ' hoort nog bij de klasse ervoor.';
            delete fo[String(cnt)];
            return { vraag:'Hoeveel in de klasse ' + lab[c] + '?', context:'Hieronder staat ' + th.wat + '. Je deelt ze in klassen in van 10 breed.', beeld:pl, zelfBeeld:pl(0), stappen:[
              Ks(R, 'In welke klasse hoort ' + g + '?', lab[kl(g)], lab, 'De klasse ' + lab[kl(g)] + ' loopt van ' + (lo + 10 * kl(g)) + ' tot en met ' + (lo + 10 * kl(g) + 9) + '.'),
              St('Hoeveel getallen liggen in de klasse ' + lab[c] + ', dus van ' + cs + ' tot en met ' + (cs + 9) + '?', cnt, 'Ga de rij langs en zet een turfje bij elk getal van ' + cs + ' tot en met ' + (cs + 9) + '. Vergeet ' + cs + ' en ' + (cs + 9) + ' zelf niet.', fo) ] };
          } },
        { id:'data-staaf', naam:'Een staafdiagram tekenen', kort:'Kies eerst een handige schaal; dan weet je hoe hoog elke staaf wordt',
          uit:'<p>Bij een tabel met aantallen teken je een <b>staafdiagram</b>. Elke groep krijgt een staaf: hoe meer, hoe hoger.</p><p>Kies eerst de <b>schaal</b>: hoeveel is één hokje? Kijk naar het grootste getal. Heb je 10 hokjes en is het grootste getal 46? Neem dan 5 per hokje: 10 hokjes is 50, en daar past 46 in.</p><p>Een staaf van 30 wordt dan 30 : 5 = <b>6 hokjes</b> hoog.</p>',
          wanneer:'je zelf een diagram maakt bij een tabel.',
          maak:function(R){
            var th = R.kies(STAAF), s = R.kies([2, 5, 10, 20, 50]), vorig = { 2:1, 5:2, 10:5, 20:10, 50:20 }[s], volg = { 2:5, 5:10, 10:20, 20:50, 50:100 }[s];
            var mx = s * R.heel(Math.floor(10 * vorig / s) + 1, 10), vals = th.cats.map(function(){ return s * R.heel(1, mx / s); }), im = R.heel(0, 3), k;
            vals[im] = mx; do { k = R.heel(0, 3); } while (k === im && R.heel(0, 3));
            vals = vals.map(function(v, i){ return i === im ? v : Math.min(v, mx); });
            var pl = function(m){
              var tab = R.teken.tabel([[th.kop].concat(th.cats), ['aantal'].concat(vals.map(String))], { zijkop:true, nadruk:m >= 1 ? [[1, im + 1]] : m >= 3 ? [[1, k + 1]] : [] });
              if (m < 2) return tab;
              return stapel(tab, staven(th.cats, vals.map(function(v, i){ return i === k && m < 3 ? null : v; }), { max:10 * s, stap:s, elke:2, kleur:m >= 3 ? (function(){ var o = {}; o[k] = 1; return o; })() : null, w:420, maxW:520 }));
            };
            return { vraag:'Hoeveel hokjes hoog wordt de staaf van ' + th.cats[k] + '?', context:'Je tekent een staafdiagram bij de tabel: ' + th.wat + '. De verticale as is 10 hokjes hoog.', eenheid:'hokjes', beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Wat is het grootste getal in de tabel?', mx, 'Zoek het hoogste aantal in de onderste rij.'),
              Ks(R, 'Je hebt 10 hokjes. Hoeveel per hokje is het handigst?', String(s), [String(vorig), String(volg)], '10 hokjes ' + X + ' ' + s + ' = ' + (10 * s) + ': daar past ' + mx + ' in. Met ' + vorig + ' per hokje kom je maar tot ' + (10 * vorig) + '. Met ' + volg + ' worden de staven onnodig klein.'),
              St(vals[k] + ' : ' + s + ' =', vals[k] / s, 'Hoe vaak past ' + s + ' in ' + vals[k] + '?', F(vals[k] / s, vals[k], 'Dat is het aantal zelf. Deel door ' + s + ' per hokje.')) ] };
          } },
        { id:'data-relatief', naam:'Relatieve frequentie: welk deel van het totaal', kort:'Deel de frequentie door het totaal en maak er procenten van',
          uit:'<p>De <b>frequentie</b> zegt hoe vaak iets voorkomt. De <b>relatieve frequentie</b> zegt welk deel van het totaal dat is, meestal in procenten.</p><p>Van de 25 leerlingen komen er 10 met de fiets. Dat is 10/25 van de klas. Maak de noemer 100: 10/25 = 40/100 = <b>40%</b>.</p>',
          wanneer:'je wilt weten hoe groot een groep is vergeleken met het geheel.',
          maak:function(R){
            var th = R.kies(RELA), N, c, k;
            do { N = R.kies([20, 25, 40, 50, 200]); c = verdeel(R, N, 4); k = R.heel(0, 3); } while ((c[k] * 100) % N !== 0 || c.some(function(x){ return x < 2; }));
            var p = c[k] * 100 / N, tab = R.teken.tabel([['antwoord'].concat(th.cats), ['aantal'].concat(c.map(String))], { zijkop:true });
            return { vraag:'Hoeveel procent koos ' + th.cats[k] + '?', context:'De uitslag van de enquêtevraag: "' + th.vr + '"', eenheid:'%', antwoord:pAnt(p), controle:procC(p), beeld:tab, stappen:[
              St('Hoeveel ' + th.wie + ' zijn er in totaal? ' + c.join(' + ') + ' =', N, 'Tel alle aantallen in de tabel op.'),
              Kb('Welk deel koos ' + th.cats[k] + '? Schrijf als breuk.', c[k], N, c[k] + ' van de ' + N + ' ' + th.wie + '. Het aantal komt boven de streep, het totaal eronder.', 'breuk'),
              Pr('In procenten: ' + br(c[k], N) + ' = …%', p, naar100(c[k], N), F(pAnt(p), c[k], 'Dat is het aantal. Reken uit hoeveel procent van ' + N + ' dat is.')) ] };
          } },
        { id:'data-vergelijk', naam:'Twee groepen eerlijk vergelijken', kort:'Zijn de groepen niet even groot? Vergelijk dan in procenten, niet in aantallen',
          uit:'<p>In klas A sporten 15 van de 25 leerlingen. In klas B sporten er 18 van de 30. In klas B sporten er meer, maar klas B is ook groter.</p><p>Vergelijk daarom het <b>deel</b> van elke groep: 15/25 = 60% en 18/30 = 60%. Evenveel dus!</p><p>Zijn de groepen niet even groot? Reken dan eerst om naar <b>procenten</b>.</p>',
          wanneer:'twee groepen niet even groot zijn.',
          maak:function(R){
            var th = R.kies(VERG), maten = th.groot ? [200, 250, 400, 500] : [20, 25, 40, 50], NA, NB, pA, pB, kA, kB;
            function pcts(N){ var l = []; for (var p = 15; p <= 85; p++) if ((p * N) % 100 === 0) l.push(p); return l; }
            for (var t = 0; t < 300; t++){
              NA = R.kies(maten); do { NB = R.kies(maten); } while (NB === NA);
              pA = R.kies(pcts(NA)); pB = R.heel(0, 6) === 0 && pcts(NB).indexOf(pA) >= 0 ? pA : R.kies(pcts(NB));
              kA = pA * NA / 100; kB = pB * NB / 100;
              if (pA !== pB && kA === kB) continue;
              if (pA !== pB && R.heel(0, 9) < 7 && ((kA > kB) === (pA > pB))) continue;
              break;
            }
            var goed = pA > pB ? th.a : pB > pA ? th.b : 'even groot';
            var tab = R.teken.tabel([['', th.doen, 'totaal'], [th.a, String(kA), String(NA)], [th.b, String(kB), String(NB)]], { kop:true, zijkop:true });
            return eindKeuze({ vraag:'Waar is het deel het grootst?', context:cap(th.a) + ': ' + kA + ' van de ' + NA + ' ' + th.wie + ' ' + th.doen + '. ' + cap(th.b) + ': ' + kB + ' van de ' + NB + ' ' + th.wie + '.', beeld:tab, stappen:[
              Pr(cap(th.a) + ': ' + br(kA, NA) + ' = …%', pA, naar100(kA, NA)),
              Pr(cap(th.b) + ': ' + br(kB, NB) + ' = …%', pB, naar100(kB, NB)),
              Kv('Waar is het deel het grootst?', [th.a, th.b, 'even groot'], goed, 'Vergelijk de procenten: ' + pA + '% en ' + pB + '%. Niet de aantallen ' + kA + ' en ' + kB + '.') ] });
          } },
        { id:'data-enquete', naam:'Een goede vraag voor een enquête', kort:'Een goede vraag is duidelijk en stuurt niet: elk antwoord is even makkelijk',
          uit:'<p>Met een <b>enquête</b> verzamel je zelf gegevens: je stelt veel mensen dezelfde vraag.</p><p>Een goede vraag is <b>duidelijk</b>: iedereen begrijpt hem op dezelfde manier. Woorden als "veel" of "vaak" zijn <b>vaag</b>: wat is veel?</p><p>En hij is <b>niet sturend</b>: hij duwt je niet naar één antwoord. Sturend is: "Vind jij ook dat de kantine te duur is?" Beter: "Wat vind je van de prijzen: te duur, precies goed of goedkoop?"</p>',
          wanneer:'je zelf een onderzoek of enquête opzet.',
          maak:function(R){
            var e = R.kies(ENQ), slecht = R.heel(0, 1) ? 'stuur' : 'vaag', mis = { stuur:'hij is sturend', vaag:'hij is vaag' };
            return eindKeuze({ vraag:'Welke vraag kies je?', context:'Je houdt een enquête over ' + e.over + '.', stappen:[
              Kv('Wat is er mis met deze vraag: "' + e[slecht] + '"', ['hij is sturend', 'hij is vaag', 'er is niets mis mee'], mis[slecht], slecht === 'stuur' ? 'Duwt de vraag je naar één antwoord? Woorden als "ook", "toch" of "veel te" sturen.' : 'Kan iedereen de vraag op een andere manier opvatten? Wat is "veel", wat bedoel je precies? Dan is hij vaag.'),
              Ks(R, 'Welke vraag is het beste voor de enquête?', e.goed, [e.stuur, e.vaag], 'Kies de vraag die duidelijk is en niet stuurt: elk antwoord moet even makkelijk zijn.') ] });
          } }
      ] },

    /* ================= 2. Grafieken kritisch bekijken (2F) ================= */
    { groep:{ id:'data-kritisch', niveau:'2F', domein:'verbanden', naam:'Grafieken kritisch bekijken', kd:['rw11A.d', 'rw11A.e', 'rw11A.f', 'rw11A.k', 'rw17A.d', 'rw17A.e'],
        uit:'Een grafiek of bericht kan iets mooier of erger laten lijken dan het is. Hier leer je de trucs herkennen: een as die niet bij 0 begint, plaatjes die te groot zijn, procenten zonder aantallen, een oneerlijke steekproef en samenhang die geen oorzaak is.' },
      doelen:[
        { id:'data-info', naam:'Een infographic lezen', kort:'"1 op de 4" is een breuk: 1/4 van de groep',
          uit:'<p>Een <b>infographic</b> laat cijfers zien met plaatjes en korte zinnen, zoals: "1 op de 4 jongeren slaapt te weinig".</p><p>"1 op de 4" betekent: <b>1/4</b> van de groep, dus 25%.</p><p>Wil je weten hoeveel dat is in jouw klas van 28? Reken 28 : 4 = <b>7</b>.</p>',
          wanneer:'je in de krant of online cijfers ziet zoals "3 op de 10".',
          maak:function(R){
            var it = R.kies(INFO), fr = R.kies([[1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [3, 4], [3, 10], [1, 10], [2, 3], [3, 5], [7, 10]]), a = fr[0], b = fr[1];
            var quote = a + ' op de ' + b + ' jongeren ' + (a === 1 ? it.ev : it.mv), pl = poppen(a, b);
            if ((100 % b === 0) && R.heel(0, 2) === 0){
              var p = a * 100 / b;
              return { vraag:'Hoeveel procent is dat?', context:'Op een infographic staat: "' + quote + '." Hoeveel procent van de jongeren ' + it.mv + '?', eenheid:'%', antwoord:pAnt(p), controle:procC(p), beeld:pl, stappen:[
                Kb('Schrijf "' + a + ' op de ' + b + '" als breuk.', a, b, 'Het eerste getal komt boven de streep, het tweede eronder.', 'breuk'),
                Pr('Maak de noemer 100: ' + br(a, b) + ' = …/100, dus …%', p, b + ' ' + X + ' ' + (100 / b) + ' = 100, dus ook ' + a + ' ' + X + ' ' + (100 / b) + '.') ] };
            }
            var school = R.heel(0, 1) === 1, N = school ? b * 10 * R.heel(Math.ceil(30 / b), Math.floor(90 / b)) : b * R.heel(Math.ceil(20 / b), Math.floor(32 / b));
            var groep = school ? 'Op jouw school zitten ' + T(N) + ' leerlingen.' : 'In jouw klas zitten ' + N + ' leerlingen.', st = [
              Kb('Schrijf "' + a + ' op de ' + b + '" als breuk.', a, b, 'Het eerste getal komt boven de streep, het tweede eronder.', 'breuk'),
              St('Hoeveel is ' + br(1, b) + ' van ' + T(N) + '? ' + T(N) + ' : ' + b + ' =', T(N / b), 'Verdeel ' + T(N) + ' in ' + b + ' gelijke groepjes.') ];
            if (a > 1) st.push(St(T(N / b) + ' ' + X + ' ' + a + ' =', T(a * N / b), 'Je hebt ' + a + ' van die groepjes nodig.', F(T(a * N / b), T(N / b), 'Dat is ' + br(1, b) + '. Je wilt ' + br(a, b) + ': nog keer ' + a + '.')));
            return { vraag:'Hoeveel van de ' + T(N) + '?', context:'Op een infographic staat: "' + quote + '." ' + groep + ' Hoeveel leerlingen ' + it.mv + ', als het bij jullie net zo is?', beeld:pl, stappen:st };
          } },
        { id:'data-as', naam:'Een as die niet bij 0 begint', kort:'Kijk waar de as begint: begint hij niet bij 0, dan lijkt een verschil veel groter',
          uit:'<p>Kijk bij een staafdiagram altijd eerst naar de <b>as</b>. Begint die niet bij 0, maar bijvoorbeeld bij 90? Dan zie je alleen het bovenste stukje van de staven.</p><p>Een staaf van 100 lijkt dan <b>twee keer zo hoog</b> als een staaf van 95. Maar 100 is maar een klein beetje meer dan 95.</p><p>Zo laat een grafiek een verschil groter lijken dan het is. Eerlijk is: de as begint bij 0.</p>',
          wanneer:'je een grafiek ziet waarin het verschil heel groot lijkt.',
          beeld:duo(staven(['A', 'B'], [95, 100], { min:90, max:100, stap:2, titel:'misleidend', w:260, h:220 }), staven(['A', 'B'], [95, 100], { min:0, max:100, stap:20, titel:'eerlijk', w:260, h:220 })),
          maak:function(R){
            var th0 = R.kies(ASTOP), jr = R.heel(2018, 2025), th = { titel:th0.titel + ' in ' + jr, a:th0.a, b:th0.b, ww:th0.ww, u:th0.u }, u = R.kies(th.u), kk = R.kies([2, 3, 4]), d = kk === 2 ? R.heel(1, 2) : 1, s = u * R.heel(25, 60), a = s + d * u, b = s + kk * d * u, top = s + (kk * d + 1) * u;
            var f = fijn(b / 4), fmax = Math.ceil(b / f) * f;
            var pl = function(m){
              var mis = staven([th.a, th.b], [a, b], { min:s, max:top, stap:u, titel:th.titel, w:280, h:240 });
              return m >= 4 ? duo(mis, staven([th.a, th.b], [a, b], { min:0, max:fmax, stap:f, elke:fmax / f > 6 ? 2 : 1, titel:'eerlijk, vanaf 0', w:280, h:240 })) : mis;
            };
            var ww = th.ww, goed = cap(th.b) + ' ' + ww + ' maar iets meer dan ' + th.a;
            return eindKeuze({ vraag:'Welke conclusie klopt?', context:'Kijk naar de grafiek: ' + th.titel + '. De staaf van ' + th.b + ' lijkt veel hoger.', beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Bij welk getal begint de verticale as?', T(s), 'Kijk naar het onderste getal op de as, links.', F(T(s), '0', 'Kijk goed: de as begint hier niet bij 0.')),
              St('Lees af: ' + th.a + ' =', T(a), 'Ga van de bovenkant van de staaf naar links. Elke lijn is ' + u + ' meer.'),
              St('Lees af: ' + th.b + ' =', T(b), 'Ga van de bovenkant van de staaf naar links. Elke lijn is ' + u + ' meer.'),
              St('Hoeveel is ' + th.b + ' echt meer dan ' + th.a + '? ' + T(b) + ' ' + MIN + ' ' + T(a) + ' =', T(b - a), 'Trek de twee getallen van elkaar af.'),
              Ks(R, 'Welke conclusie klopt?', goed, [cap(th.b) + ' ' + ww + ' ongeveer ' + kk + ' keer zoveel als ' + th.a, cap(th.a) + ' ' + ww + ' meer dan ' + th.b], 'Een verschil van ' + T(b - a) + ' bij ' + T(a) + ' is klein. De staaf lijkt ' + kk + ' keer zo hoog, omdat de as pas bij ' + T(s) + ' begint.') ] });
          } },
        { id:'data-schaal', naam:'Twee grafieken met een andere schaal', kort:'Vergelijk de getallen op de assen, niet hoe steil de lijnen lijken',
          uit:'<p>Twee grafieken naast elkaar lijken makkelijk te vergelijken. Maar kijk eerst naar de <b>schaal</b> op de assen.</p><p>Gaat de ene as in stappen van 2 en de andere in stappen van 50? Dan kan een <b>vlakke</b> lijn toch de grootste stijging zijn.</p><p>Lees dus bij allebei het begin en het eind af en reken de stijging uit.</p>',
          wanneer:'twee grafieken naast elkaar staan.',
          maak:function(R){
            var th = R.kies(SCHAAL), j0 = R.heel(2014, 2022), jaren = [j0, j0 + 1, j0 + 2, j0 + 3].map(String), uS, uV, hS, dS, dV, t;
            for (t = 0; t < 200; t++){ uS = R.kies([1, 2, 5, 10]); hS = R.heel(3, 4); uV = R.kies([20, 50, 100]); dS = uS * hS; dV = uV; if (dS !== dV) break; }
            var steilA = R.heel(0, 1) === 1;
            function reeks(u, start, dd){ return [start, start + Math.round(dd * 0.3 / u * 2) * u / 2, start + Math.round(dd * 0.65 / u * 2) * u / 2, start + dd]; }
            var mnS = uS * R.heel(2, 10), mnV = uV * R.heel(2, 10), stS = mnS + uS * (hS === 4 ? 1 : R.heel(1, 2)), stV = mnV + uV * R.heel(1, 3);
            var S1 = { mn:mnS, u:uS, v:reeks(uS, stS, dS), d:dS }, V1 = { mn:mnV, u:uV, v:reeks(uV, stV, dV), d:dV };
            var A = steilA ? S1 : V1, B = steilA ? V1 : S1;
            var pl = duo(lijntje(jaren, A.v, A.mn, A.u, th.a), lijntje(jaren, B.v, B.mn, B.u, th.b));
            var goed = A.d > B.d ? th.a : th.b;
            return eindKeuze({ vraag:'Welke stijgt het meest?', context:'De twee grafieken laten zien: ' + th.wat + ', van ' + jaren[0] + ' tot ' + jaren[3] + '.', beeld:pl, zelfBeeld:pl, stappen:[
              St('Hoeveel is één hokje bij ' + th.a + '?', T(A.u), 'Kijk naar twee getallen naast elkaar op de as van ' + th.a + ': ' + T(A.mn) + ' en ' + T(A.mn + A.u) + '.'),
              St('Hoeveel stijgt ' + th.a + ' van ' + jaren[0] + ' tot ' + jaren[3] + '?', T(A.d), 'Lees het begin en het eind af: ' + T(A.v[3]) + ' ' + MIN + ' ' + T(A.v[0]) + '.'),
              St('Hoeveel stijgt ' + th.b + ' van ' + jaren[0] + ' tot ' + jaren[3] + '?', T(B.d), 'Lees het begin en het eind af: ' + T(B.v[3]) + ' ' + MIN + ' ' + T(B.v[0]) + '. Eén hokje is hier ' + T(B.u) + '.'),
              Kv('Welke stijgt het meest?', [th.a, th.b], goed, 'Vergelijk de getallen, niet hoe steil het lijkt: ' + T(A.d) + ' tegen ' + T(B.d) + '.') ] });
          } },
        { id:'data-beeld', naam:'Een misleidende beeldgrafiek', kort:'Twee keer zo hoog én twee keer zo breed is vier keer zo groot',
          uit:'<p>Soms laat een grafiek een getal zien met een <b>plaatje</b>. Is het getal twee keer zo groot, dan maken ze het plaatje twee keer zo hoog.</p><p>Maar dan wordt het plaatje ook twee keer zo <b>breed</b>. De oppervlakte wordt dan 2 × 2 = <b>4 keer</b> zo groot. Het verschil lijkt dus veel groter dan het is.</p><p>Eerlijk is: plaatjes van dezelfde grootte naast elkaar, of een staafdiagram.</p>',
          wanneer:'een grafiek grote en kleine plaatjes gebruikt.',
          maak:function(R){
            var th = R.kies(BEELDG), kk = R.kies([2, 3]), a = R.kies([20, 30, 40, 50, 60, 80, 120, 150, 200, 250]), b = a * kk, h0 = kk === 3 ? 46 : 60;
            var wat = th.wat.replace('{a}', th.a).replace('{b}', th.b);
            var pl = function(m){
              var w0 = h0 * 0.86, xb = 30 + w0 + 46, H = kk * h0 + 64, yb = kk * h0 + 18, s = '';
              s += huis(30, yb, h0, K[0]) + huis(xb, yb, h0 * kk, K[1]);
              s += tx(30 + w0 / 2, yb + 20, th.a, { vet:true }) + tx(30 + w0 / 2, yb + 38, T(a)) + tx(xb + w0 * kk / 2, yb + 20, th.b, { vet:true }) + tx(xb + w0 * kk / 2, yb + 38, T(b));
              if (m >= 2) s += ln(xb, yb + 4 - 2, xb + w0 * kk, yb + 4 - 2, { k:K[1], w:3 });
              var beeld = svg(xb + w0 * kk + 24, H, s, 'beeldgrafiek met twee huizen', 360);
              if (m < 3) return beeld;
              var f = fijn(b / 4);
              return duo(beeld, staven([th.a, th.b], [a, b], { max:Math.ceil(b / f) * f, stap:f, titel:'eerlijk', w:260, h:240, labels:true }));
            };
            return { vraag:'Hoeveel keer zo groot lijkt het?', context:'Een beeldgrafiek over ' + wat + '. Het getal bij ' + th.b + ' is ' + kk + ' keer zo groot, en het huis is ' + kk + ' keer zo hoog getekend. Hoeveel keer zo groot lijkt het grote huis?', beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Hoeveel keer zo groot is het getal? ' + T(b) + ' : ' + T(a) + ' =', kk, 'Hoe vaak past ' + T(a) + ' in ' + T(b) + '?'),
              St('Het grote huis is ' + kk + ' keer zo hoog. Hoeveel keer zo breed is het?', kk, 'Het huis heeft dezelfde vorm, alleen groter. Dus ook de breedte gaat keer ' + kk + '.'),
              St('Hoeveel keer zo groot is de oppervlakte van het grote huis? ' + kk + ' ' + X + ' ' + kk + ' =', kk * kk, 'Hoogte keer ' + kk + ' en breedte keer ' + kk + ': de oppervlakte gaat keer ' + kk + ' ' + X + ' ' + kk + '.', F(kk * kk, kk, 'Let op: de hoogte én de breedte worden groter.')) ] };
          } },
        { id:'data-procent', naam:'Procenten zonder aantallen', kort:'Vraag altijd: procent van hoeveel? Reken de aantallen uit',
          uit:'<p>"Club A groeit met 50%! Club B maar met 10%." Het klinkt alsof club A veel harder groeit. Maar <b>procent van hoeveel</b>?</p><p>Had club A 20 leden? Dan komen er 10 bij. Had club B 400 leden? Dan komen er 40 bij. Club B kreeg dus veel meer nieuwe leden.</p><p>Een percentage zonder het <b>aantal</b> erbij zegt niet alles. Reken de aantallen uit.</p>',
          wanneer:'je in een bericht procenten ziet, maar geen aantallen.',
          maak:function(R){
            var th = R.kies(PROCZ), pA, NA, pB, NB, iA, iB;
            do { pA = R.kies([25, 50, 75, 100]); NA = 4 * R.heel(2, 15); pB = R.kies([5, 10, 15, 20]); NB = 20 * R.heel(5, 40); iA = pA * NA / 100; iB = pB * NB / 100; } while (iA === iB || (iA > iB && R.heel(0, 3)));
            var goed = iA > iB ? th.a : th.b;
            return eindKeuze({ vraag:'Wie kreeg er de meeste ' + th.wie + ' bij?', context:'In een bericht staat: "' + th.a + ' ' + th.ww + ' met ' + pA + '%! ' + th.b + ' maar met ' + pB + '%." ' + th.a + ' had ' + NA + ' ' + th.wie + ', ' + th.b + ' had er ' + NB + '.', stappen:[
              St(pA + '% van ' + NA + ' =', iA, pA === 100 ? '100% is alles: evenveel als ' + NA + '.' : pA === 50 ? '50% is de helft van ' + NA + '.' : pA === 25 ? '25% is een kwart: ' + NA + ' : 4.' : '75% is drie kwart: ' + NA + ' : 4 ' + X + ' 3.'),
              St(pB + '% van ' + NB + ' =', iB, '10% van ' + NB + ' is ' + (NB / 10) + '. ' + (pB === 10 ? '' : pB === 5 ? '5% is de helft daarvan.' : pB === 20 ? '20% is twee keer zoveel.' : '15% is 10% plus 5%.')),
              Kv('Wie kreeg er de meeste ' + th.wie + ' bij?', [th.a, th.b], goed, 'Vergelijk de aantallen die erbij kwamen: ' + iA + ' tegen ' + iB + '. Niet de procenten.') ] });
          } },
        { id:'data-conclusie', naam:'Klopt de conclusie?', kort:'Controleer elk deel van de bewering apart: klopt hij wel, niet of deels?',
          uit:'<p>Bij een grafiek staat vaak een <b>conclusie</b>. Klopt die? Controleer het met de getallen.</p><p>Bestaat de conclusie uit twee delen? Controleer dan <b>elk deel apart</b>.</p><p>Kloppen ze allebei, dan klopt de conclusie <b>wel</b>. Klopt er geen een, dan klopt hij <b>niet</b>. Klopt er maar één, dan klopt hij <b>deels</b>.</p>',
          wanneer:'je een conclusie bij een grafiek of tabel moet beoordelen.',
          maak:function(R){
            var th = R.kies(CONCL), v, c1, c2, w1, w2, t;
            for (t = 0; t < 400; t++){
              v = []; while (v.length < 4){ var x = R.heel(3, 30); if (v.indexOf(x) < 0) v.push(x); }
              if (R.heel(0, 1)){ var i0 = R.heel(0, 3), j0 = (i0 + R.heel(1, 3)) % 4, h = R.heel(3, 15); if (v.indexOf(2 * h) < 0 && v.indexOf(h) < 0){ v[i0] = 2 * h; v[j0] = h; } }
              var soorten = R.hussel(['max', 'min', 'meer', 'dubbel', 'helft']);
              w1 = R.heel(0, 1) === 1; w2 = R.heel(0, 1) === 1;
              c1 = claim(R, th, v, soorten[0], w1); c2 = claim(R, th, v, soorten[1], w2);
              if (c1 && c2) break;
            }
            var uit = w1 && w2 ? 'wel' : !w1 && !w2 ? 'niet' : 'deels', lab = th.lab || th.cats;
            var pl = staven(lab, v, { max:Math.ceil(Math.max.apply(null, v) / 10) * 10, stap:5, elke:2, labels:true, titel:th.eenh, w:440 });
            return eindKeuze({ vraag:'Klopt de conclusie?', context:th.ctx + ' <b>Conclusie:</b> "' + cap(c1.t) + ' en ' + c2.t + '."', beeld:pl, zelfBeeld:pl, stappen:[
              Kv('Deel 1: "' + cap(c1.t) + '." Klopt dat?', ['klopt', 'klopt niet'], w1 ? 'klopt' : 'klopt niet', c1.h),
              Kv('Deel 2: "' + cap(c2.t) + '." Klopt dat?', ['klopt', 'klopt niet'], w2 ? 'klopt' : 'klopt niet', c2.h),
              Kv('Klopt de hele conclusie wel, niet of deels?', ['wel', 'niet', 'deels'], uit, 'Allebei waar: wel. Allebei niet waar: niet. Eén van de twee: deels.') ] });
          } },
        { id:'data-oorzaak', naam:'Samenhang is geen oorzaak', kort:'Gaan twee dingen samen op en neer? Dan hoeft het ene niet het andere te veroorzaken',
          uit:'<p>In maanden waarin meer ijsjes verkocht worden, verdrinken er ook meer mensen. Er is <b>samenhang</b>: ze stijgen en dalen samen. Dat heet ook <b>correlatie</b>.</p><p>Maar ijs eten zorgt niet voor verdrinken. De echte <b>oorzaak</b> is iets anders: warm weer. Dan eten mensen meer ijs én gaan ze vaker zwemmen.</p><p>Samenhang is dus nog geen oorzaak (<b>causaliteit</b>). Zoek altijd naar een andere verklaring. Soms is het zelfs <b>andersom</b>: niet A zorgt voor B, maar B zorgt voor A.</p>',
          wanneer:'iemand uit cijfers concludeert dat het ene het andere veroorzaakt.',
          maak:function(R){
            var o = R.kies(OORZ), pts = [], i;
            for (i = 0; i < 12; i++){ var xx = 0.08 + 0.84 * i / 11 + (R.heel(0, 10) - 5) / 200; pts.push([xx, Math.min(0.95, Math.max(0.05, xx + (R.heel(0, 20) - 10) / 70))]); }
            var s = ln(50, 16, 50, 196) + ln(50, 196, 330, 196);
            pts.forEach(function(p){ s += '<circle cx="' + n1(50 + p[0] * 270) + '" cy="' + n1(196 - p[1] * 170) + '" r="5" style="fill:var(--lr-1)"/>'; });
            s += tx(190, 222, o.x + ' →', { vet:true }) + '<text x="20" y="106" class="getal klein" style="font-weight:700" transform="rotate(-90 20 106)">' + S(o.y + ' →') + '</text>';
            var pl = svg(350, 232, s, 'spreidingsdiagram: ' + o.x + ' en ' + o.y + ' gaan samen omhoog', 400);
            return eindKeuze({ vraag:'Wat is de beste verklaring?', context:'<b>Onderzoek:</b> ' + o.zin + ' <b>Conclusie:</b> "' + o.concl + '"', beeld:pl, zelfBeeld:pl, stappen:[
              Kv('Bewijst het onderzoek dat de conclusie klopt?', ['ja', 'nee, het laat alleen samenhang zien'], 'nee, het laat alleen samenhang zien', 'Het onderzoek laat zien dat twee dingen samen voorkomen. Het zegt niet wat de oorzaak is.'),
              Ks(R, 'Wat is de beste verklaring?', o.goed, [o.concl, 'Het is toeval: de twee hebben niets met elkaar te maken.'], o.om ? 'Kijk of het andersom kan: zorgt het tweede misschien voor het eerste?' : 'Zoek iets anders dat voor allebei zorgt.') ] });
          } },
        { id:'data-steekproef', naam:'Is het onderzoek eerlijk?', kort:'Een steekproef moet groot genoeg zijn en eerlijk gekozen',
          uit:'<p>Je kunt niet iedereen iets vragen. Daarom vraag je het aan een deel: een <b>steekproef</b>.</p><p>Een goede steekproef is <b>groot genoeg</b>. Vraag je maar 6 mensen, dan kan het toeval zijn wat je hoort.</p><p>En hij is <b>eerlijk gekozen</b>: iedereen moet evenveel kans hebben om gevraagd te worden. Vraag je bij de ingang van het zwembad naar de lievelingssport, dan hoor je vooral "zwemmen".</p>',
          wanneer:'je een onderzoek of peiling beoordeelt.',
          maak:function(R){
            var o = R.kies(STEEK), klein = R.heel(0, 1) === 1, eerlijk = R.heel(0, 1) === 1, n = klein ? R.heel(4, 12) : 10 * R.heel(12, 40);
            var goed = klein && !eerlijk ? 'te klein en niet eerlijk gekozen' : klein ? 'te klein' : !eerlijk ? 'niet eerlijk gekozen' : 'niets: het is een goed onderzoek';
            return eindKeuze({ vraag:'Wat is er mis met dit onderzoek?', context:'Onderzoekers willen weten ' + o.wil + '. ' + (eerlijk ? o.eerlijk : o.oneerlijk) + ' In totaal vroegen ze het aan ' + n + ' ' + o.wie + '.', stappen:[
              St('Hoeveel ' + o.wie + ' zijn er gevraagd?', n, 'Het getal staat in de laatste zin.'),
              Kv('Is dat genoeg om iets te zeggen over de hele groep?', ['ja', 'nee'], klein ? 'nee' : 'ja', klein ? 'Bij ' + n + ' ' + o.wie + ' kan het antwoord gewoon toeval zijn.' : n + ' ' + o.wie + ' is genoeg om een goed beeld te krijgen.'),
              Kv('Had iedereen evenveel kans om gevraagd te worden?', ['ja', 'nee'], eerlijk ? 'ja' : 'nee', eerlijk ? 'Ze kozen willekeurig: iedereen had evenveel kans.' : 'Ze vroegen het op een plek waar vooral één soort ' + o.wie + ' is. Dat kleurt de uitkomst.'),
              Kv('Wat is er mis met het onderzoek?', ['te klein', 'niet eerlijk gekozen', 'te klein en niet eerlijk gekozen', 'niets: het is een goed onderzoek'], goed, 'Combineer je twee antwoorden: genoeg mensen, en eerlijk gekozen?') ] });
          } }
      ] },

    /* ================= 3. Kansen (2F) ================= */
    { groep:{ id:'kans-basis', niveau:'2F', domein:'verbanden', naam:'Kansen', kd:['rw11B.a', 'rw11B.b', 'rw11B.c'],
        uit:'Hoe groot is de kans? Van onmogelijk tot zeker, als breuk, kommagetal en procent. Kansen vergelijken en uitrekenen hoe vaak je iets mag verwachten.' },
      doelen:[
        { id:'kans-lijn', naam:'Onmogelijk, zeker of daartussen', kort:'Een kans ligt tussen 0 (onmogelijk) en 1 (zeker)',
          uit:'<p>Een <b>kans</b> zegt hoe groot de mogelijkheid is dat iets gebeurt. Je zet hem op een <b>kanslijn</b> van 0 tot 1.</p><p><b>0</b> is onmogelijk: met een dobbelsteen gooi je nooit een 7. <b>1</b> is zeker: je gooit altijd minder dan 7.</p><p>Precies in het midden, bij <b>1/2</b>, is de kans even groot dat het wel of niet gebeurt, zoals kop of munt. Minder dan de helft is een kleine kans, meer dan de helft een grote kans.</p>',
          wanneer:'je wilt inschatten hoe waarschijnlijk iets is.',
          beeld:kanslijn(null),
          maak:function(R){
            var cats = ['onmogelijk', 'kleine kans', 'even grote kans', 'grote kans', 'zeker'], doel = R.kies(cats);
            function cat(t, n){ return t === 0 ? cats[0] : t === n ? cats[4] : 2 * t === n ? cats[2] : 2 * t < n ? cats[1] : cats[3]; }
            var e = experiment(R, { rand:true, ok:function(x){ return cat(x.t, x.n) === doel; } }), t = e.t, n = e.n;
            var pl = function(m){ return stapel(e.beeld(m >= 2), kanslijn(m >= 3 ? t / n : null, m >= 3 ? brv(t, n) : '')); };
            var h = t === 0 ? 'Het kan nooit gebeuren.' : t === n ? 'Het gebeurt altijd.' : 2 * t === n ? 'Precies de helft.' : 2 * t < n ? 'Minder dan de helft: ' + t + ' is minder dan ' + T(n / 2) + '.' : 'Meer dan de helft: ' + t + ' is meer dan ' + T(n / 2) + '.';
            return eindKeuze({ vraag:'Kans op ' + e.wat + '?', context:e.ctx + ' Hoe groot is de kans op ' + e.wat + '?', beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Hoeveel uitkomsten zijn er?', n, e.hTot),
              St('Bij hoeveel daarvan krijg je ' + e.wat + '?', t, e.hGun),
              Kv('Waar hoort de kans op de kanslijn?', cats, cat(t, n), t + ' van de ' + n + '. ' + h) ] });
          } },
        { id:'kans-breuk', naam:'Kans als breuk', kort:'Kans = aantal gunstige uitkomsten gedeeld door het totaal aantal uitkomsten',
          uit:'<p>Zijn alle uitkomsten even waarschijnlijk? Dan reken je de kans zo uit:</p><p><b>kans = gunstig / totaal</b></p><p><b>Gunstig</b> zijn de uitkomsten die je wilt. Met een dobbelsteen een even getal gooien: 2, 4 en 6 zijn gunstig. Dat zijn er 3 van de 6. De kans is 3/6 = 1/2.</p><p>Je mag de breuk vereenvoudigen, maar dat hoeft niet.</p>',
          wanneer:'alle uitkomsten even grote kans hebben, zoals bij een dobbelsteen, een rad of een zak knikkers.',
          maak:function(R){
            var e = experiment(R), t = e.t, n = e.n, pl = function(m){ return e.beeld(m >= 2); };
            return kansOp({ vraag:'Kans op ' + e.wat + '?', context:e.ctx + ' Hoe groot is de kans op ' + e.wat + '? Schrijf als breuk.', beeld:pl, zelfBeeld:pl(0), stappen:[
              St('Hoeveel uitkomsten zijn er in totaal?', n, e.hTot),
              St('Hoeveel uitkomsten zijn gunstig?', t, e.hGun),
              Kb('Kans = gunstig / totaal =', t, n, t + ' gunstig van de ' + n + ': ' + br(t, n) + '.', 'breuk', F(uniek([br(t, n), brv(t, n)]), br(n, t), 'Andersom: gunstig boven de streep, totaal eronder.', br(t, n - t), 'De noemer is het totaal, niet wat overblijft.')) ] }, t, n);
          } },
        { id:'kans-procent', naam:'Kans als kommagetal en procent', kort:'Teller gedeeld door noemer is het kommagetal; keer 100 is het procent',
          uit:'<p>Een kans kun je op vier manieren schrijven. De kans op kop is <b>1/2</b>, of <b>1 op 2</b>, of <b>0,5</b>, of <b>50%</b>.</p><p>Van breuk naar kommagetal: <b>deel</b> de teller door de noemer. 3/4 = 3 : 4 = 0,75.</p><p>Van kommagetal naar procent: <b>keer 100</b>. 0,75 = 75%.</p>',
          wanneer:'je kansen wilt vergelijken of een kans in procenten wilt geven.',
          maak:function(R){
            var e = experiment(R, { soorten:['zak', 'rad'], noemers:[4, 5, 8, 10, 20] }), t = e.t, n = e.n, d = t / n, p = d * 100, pl = function(m){ return e.beeld(m >= 1); };
            return { vraag:'Kans op ' + e.wat + ' in procenten?', context:e.ctx + ' Hoe groot is de kans op ' + e.wat + ', in procenten?', eenheid:'%', antwoord:pAnt(p), controle:kansC(t, n), beeld:pl, zelfBeeld:pl(0), stappen:[
              Kb('De kans als breuk:', t, n, t + ' gunstig van de ' + n + '.', 'breuk'),
              Kb('Als kommagetal: ' + t + ' : ' + n + ' =', t, n, n === 4 || n === 8 ? '1/' + n + ' is ' + T(1 / n) + '. Dan keer ' + t + '.' : n === 5 ? '1/5 is 0,2. Dan keer ' + t + '.' : 'Deel ' + t + ' door ' + n + '. ' + br(t, n) + ' = ' + T(t * 100 / n) + '/100.', 'dec'),
              Kb('In procenten: ' + T(d) + ' ' + X + ' 100 =', t, n, 'Bij keer 100 schuift de komma twee plaatsen naar rechts.', 'proc', F(pAnt(p), T(d), 'Dat is het kommagetal. Doe nog keer 100.')) ] };
          } },
        { id:'kans-niet', naam:'De kans dat iets niet gebeurt', kort:'Kans op niet = 1 min de kans op wel (of 100% min de kans)',
          uit:'<p>Iets gebeurt, of het gebeurt niet. Die twee kansen zijn samen altijd <b>1</b>, of 100%.</p><p>De kans op een 6 is 1/6. Dan is de kans op <b>geen</b> 6: 1 − 1/6 = <b>5/6</b>.</p><p>De kans op regen is 30%? Dan is de kans dat het droog blijft 100% − 30% = <b>70%</b>.</p>',
          wanneer:'je de kans weet dat iets wel gebeurt, en je wilt weten dat het niet gebeurt.',
          maak:function(R){
            if (R.heel(0, 2) === 0){
              var th = R.kies([
                { zin:'Volgens het weerbericht is de kans op regen morgen {p}%.', vr:'Hoe groot is de kans dat het droog blijft?', kort:'Kans op droog?' },
                { zin:'Een keeper stopt {p}% van de strafschoppen.', vr:'Hoe groot is de kans op een doelpunt bij een strafschop?', kort:'Kans op een doelpunt?' },
                { zin:'De kans dat de bus te laat is, is {p}%.', vr:'Hoe groot is de kans dat de bus op tijd is?', kort:'Kans op op tijd?' },
                { zin:'De kans dat je wint met een kraslot, is {p}%.', vr:'Hoe groot is de kans dat je niet wint?', kort:'Kans op niet winnen?' } ]), p = R.heel(1, 9) * 5;
              return { vraag:th.kort, context:th.zin.replace('{p}', p) + ' ' + th.vr, eenheid:'%', antwoord:pAnt(100 - p), controle:procC(100 - p), stappen:[
                St('Het gebeurt, of het gebeurt niet. Samen is dat …%', 100, 'Alles samen is altijd 100%.', null),
                Pr('100 ' + MIN + ' ' + p + ' =', 100 - p, 'Vul aan van ' + p + ' tot 100.', F(pAnt(100 - p), p, 'Dat is de kans dat het wel gebeurt.')) ] };
            }
            var e = experiment(R, { dobFilter:function(g){ return !/^geen/.test(g.wat); } }), t = e.t, n = e.n, pl = function(m){ return e.beeld(m >= 1); };
            return kansOp({ vraag:'Kans op ' + e.niet + '?', context:e.ctx + ' Hoe groot is de kans op ' + e.niet + '?', beeld:pl, zelfBeeld:pl(0), stappen:[
              Kb('Eerst de kans dat het wel gebeurt: de kans op ' + e.wat + ' is', t, n, e.hGun + ' Van de ' + n + '.', 'breuk'),
              Kb('De kans op ' + e.niet + ': 1 ' + MIN + ' ' + br(t, n) + ' =', n - t, n, '1 is ' + br(n, n) + '. ' + n + ' ' + MIN + ' ' + t + ' = ' + (n - t) + '.', 'breuk', F(uniek([br(n - t, n), brv(n - t, n)]), br(t, n), 'Dat is de kans dat het wel gebeurt. Trek hem af van 1.')) ] }, n - t, n);
          } },
        { id:'kans-vergelijk', naam:'Kansen vergelijken', kort:'Niet de meeste, maar de grootste kans: vergelijk in procenten',
          uit:'<p>Zak A heeft 3 rode knikkers van de 10. Zak B heeft 5 rode van de 20. Uit welke zak pak je het makkelijkst een rode?</p><p>Niet de zak met de <b>meeste</b> rode, maar de zak met de <b>grootste kans</b>. Zak A: 3/10 = 30%. Zak B: 5/20 = 25%. Zak A dus!</p>',
          wanneer:'je moet kiezen waar je de meeste kans hebt.',
          maak:function(R){
            var c = R.kies(['rood', 'blauw', 'groen']), ander = R.kies(KLEUREN.filter(function(x){ return x !== c; })), NA, NB, a, b, t;
            for (t = 0; t < 300; t++){
              NA = R.kies([4, 5, 8, 10, 20]); NB = R.kies([4, 5, 8, 10, 20]); if (NA === NB) continue;
              a = R.heel(1, NA - 1); b = R.heel(1, NB - 1);
              if (a * NB === b * NA && R.heel(0, 3)) continue;
              if (a * NB !== b * NA && a !== b && (a > b) === (a * NB > b * NA) && R.heel(0, 2)) continue;
              break;
            }
            var pA = a * 100 / NA, pB = b * 100 / NB, goed = pA > pB ? 'zak A' : pB > pA ? 'zak B' : 'even grote kans';
            var pl = function(m){ return duo(zak([[c, a], [ander, NA - a]], { naam:'zak A' + (m >= 1 ? ': ' + T(pA) + '%' : ''), aan:m >= 1 ? c : null }), zak([[c, b], [ander, NB - b]], { naam:'zak B' + (m >= 2 ? ': ' + T(pB) + '%' : ''), aan:m >= 2 ? c : null })); };
            return eindKeuze({ vraag:'Uit welke zak is de kans op ' + c + ' het grootst?', context:'Zak A: ' + a + ' ' + BIJV[c] + ' en ' + (NA - a) + ' ' + BIJV[ander] + ' knikkers. Zak B: ' + b + ' ' + BIJV[c] + ' en ' + (NB - b) + ' ' + BIJV[ander] + ' knikkers. Je pakt zonder te kijken één knikker.', beeld:pl, zelfBeeld:pl(0), stappen:[
              Pr('Zak A: ' + br(a, NA) + ' = …%', pA, naar100(a, NA)),
              Pr('Zak B: ' + br(b, NB) + ' = …%', pB, naar100(b, NB)),
              Kv('Uit welke zak is de kans het grootst?', ['zak A', 'zak B', 'even grote kans'], goed, 'Vergelijk de procenten: ' + T(pA) + '% en ' + T(pB) + '%. Niet het aantal ' + BIJV[c] + ' knikkers.') ] });
          } },
        { id:'kans-verwacht', naam:'Hoe vaak verwacht je het?', kort:'Verwachting = kans × aantal keer',
          uit:'<p>Je gooit 60 keer met een dobbelsteen. Hoe vaak verwacht je een 6? De kans is 1/6, dus ongeveer 1/6 deel van de keren: 60 : 6 = <b>10 keer</b>.</p><p><b>Verwachting = kans × aantal keer.</b></p><p>Het is een schatting: het kunnen er ook 8 of 13 worden. Hoe vaker je het doet, hoe beter de schatting klopt.</p>',
          wanneer:'je wilt schatten hoe vaak iets gebeurt als je iets vaak herhaalt.',
          maak:function(R){
            if (R.heel(0, 3) === 0){
              var th = R.kies([
                { zin:'Een basketballer scoort {p}% van zijn vrije worpen. Hij neemt {N} vrije worpen.', wat:'een score', vr:'Hoeveel keer verwacht je dat hij scoort?' },
                { zin:'Een boogschutter raakt de roos in {p}% van de pijlen. Ze schiet {N} pijlen.', wat:'de roos', vr:'Hoeveel keer verwacht je dat ze de roos raakt?' },
                { zin:'Bij een zaadje komt in {p}% van de gevallen een plantje op. Je plant {N} zaadjes.', wat:'een plantje', vr:'Hoeveel plantjes verwacht je?' } ]), p = 10 * R.heel(2, 9), N = 10 * R.heel(2, 15);
              return { vraag:p + '% van ' + N + '?', context:th.zin.replace('{p}', p).replace('{N}', N) + ' ' + th.vr, stappen:[
                St('10% van ' + N + ' =', N / 10, 'Deel door 10.'),
                St(p + '% is ' + (p / 10) + ' keer zoveel: ' + (p / 10) + ' ' + X + ' ' + (N / 10) + ' =', p * N / 100, 'Vermenigvuldig ' + (N / 10) + ' met ' + (p / 10) + '.') ] };
            }
            var e = experiment(R, { soorten:['dob', 'dob', 'zak', 'rad'], noemers:[4, 5, 6, 8, 10] }), t = e.t, n = e.n, M = n * R.heel(3, 20), pl = function(m){ return e.beeld(m >= 1); };
            var st = [ Kb('De kans op ' + e.wat + ' bij één keer:', t, n, e.hGun + ' Van de ' + n + '.', 'breuk'),
              St('Hoeveel is ' + br(1, n) + ' deel van ' + M + '? ' + M + ' : ' + n + ' =', M / n, 'Verdeel ' + M + ' in ' + n + ' gelijke stukken.') ];
            if (t > 1) st.push(St(br(t, n) + ' deel: ' + (M / n) + ' ' + X + ' ' + t + ' =', M * t / n, 'Je hebt ' + t + ' van die stukken nodig.', F(M * t / n, M / n, 'Dat is ' + br(1, n) + ' deel. Doe nog keer ' + t + '.')));
            return { vraag:'Hoe vaak ' + e.wat + ' bij ' + M + ' keer?', context:e.herhaal(M) + ' Hoe vaak verwacht je ' + e.wat + '?', eenheid:'keer', beeld:pl, zelfBeeld:pl(0), stappen:st };
          } }
      ] },

    /* ================= 4. Kansen berekenen (3F) ================= */
    { groep:{ id:'kans-reken', niveau:'3F', domein:'verbanden', naam:'Kansen berekenen', kd:['rw11B.c', 'rw11B.d', 'rw11B.e'],
        uit:'Kansen bij twee of meer dingen tegelijk: tellen met een rooster of een boomdiagram, kansen uit een kruistabel, de rekenregels voor "en", "of" en "minstens één", empirische kansen en de verwachtingswaarde.' },
      doelen:[
        { id:'kans-rooster', naam:'Uitkomsten tellen met een rooster', kort:'Zet het ene ding links en het andere boven, en tel de vakjes',
          uit:'<p>Je gooit met twee dobbelstenen. Hoe groot is de kans dat de som 7 is?</p><p>Maak een <b>rooster</b>: de ene dobbelsteen links (1 tot en met 6), de andere bovenaan. In elk vakje zet je de som. Er zijn 6 × 6 = <b>36 vakjes</b>, en elk vakje is even waarschijnlijk.</p><p>Tel de vakjes met som 7: dat zijn er 6. De kans is 6/36 = <b>1/6</b>.</p>',
          wanneer:'je twee dingen tegelijk doet, zoals met twee dobbelstenen gooien.',
          maak:function(R){ return mRooster(R); } },
        { id:'kans-boom', naam:'Uitkomsten tellen met een boomdiagram', kort:'Elke keuze splitst de takken; het aantal eindjes is het aantal mogelijkheden',
          uit:'<p>Bij een <b>boomdiagram</b> teken je elke keuze als een splitsing. Twee shirts en drie broeken: eerst 2 takken (de shirts), dan aan elke tak 3 takken (de broeken).</p><p>Het aantal <b>eindjes</b> is het aantal mogelijkheden: 2 × 3 = 6.</p><p>Twee keer een munt gooien geeft 2 × 2 = 4 uitkomsten: KK, KM, MK en MM. Precies één keer kop is KM of MK: 2 van de 4.</p>',
          wanneer:'je meerdere keuzes of worpen na elkaar hebt.',
          maak:function(R){
            if (R.heel(0, 1)) return mBoomMunt(R);
            var th = R.kies([
              { niv:[{ zin:'een shirt', mv:'shirts', l:['wit', 'zwart', 'rood'] }, { zin:'een broek', mv:'broeken', l:['spijkerbroek', 'korte broek', 'joggingbroek'] }, { zin:'schoenen', mv:'paar schoenen', l:['gympen', 'sandalen'] }], wat:'combinaties' },
              { niv:[{ zin:'een voorgerecht', mv:'voorgerechten', l:['soep', 'salade', 'brood'] }, { zin:'een hoofdgerecht', mv:'hoofdgerechten', l:['pasta', 'vis', 'kip', 'curry'] }, { zin:'een toetje', mv:'toetjes', l:['ijs', 'fruit'] }], wat:'menu\'s' },
              { niv:[{ zin:'een bakje of een hoorntje', vast:true, mv:'keuzes bakje en hoorntje', l:['bakje', 'hoorntje'] }, { zin:'één smaak', mv:'smaken', l:['vanille', 'aardbei', 'chocolade', 'citroen', 'mango'] }], wat:'ijsjes' },
              { niv:[{ zin:'een broodje', mv:'soorten broodjes', l:['wit', 'bruin', 'meergranen'] }, { zin:'beleg', mv:'soorten beleg', l:['kaas', 'ham', 'ei', 'hummus'] }], wat:'broodjes' } ]);
            var niv, maat, tot;
            do {
              niv = th.niv.map(function(l, i){ return { zin:l.zin, vast:l.vast, mv:l.mv, l:R.hussel(l.l).slice(0, i === 0 && th.wat === 'ijsjes' ? 2 : R.heel(2, l.l.length)) }; });
              if (niv.length === 3 && R.heel(0, 1)) niv = niv.slice(0, 2);
              maat = niv.map(function(l){ return l.l.length; }); tot = maat.reduce(function(a, b){ return a * b; }, 1);
            } while (tot > 12 || tot < 4);
            var pl = function(m){ return boom(niv.map(function(l){ return l.l; }), { d:Math.min(niv.length, m + 1), blad:m >= niv.length ? (function(){ var nr = 0; return function(){ nr++; return String(nr); }; })() : null }); };
            var st = [ St('Hoeveel takken heeft de eerste splitsing? Dat zijn de ' + niv[0].mv + '.', maat[0], 'Tel: ' + lijst(niv[0].l) + '.'),
              St('Aan elke tak komen ' + maat[1] + ' takken: de ' + niv[1].mv + '. Hoeveel eindjes? ' + maat[0] + ' ' + X + ' ' + maat[1] + ' =', maat[0] * maat[1], 'Elke tak van de eerste splitsing krijgt ' + maat[1] + ' nieuwe takken. Vermenigvuldig.', F(maat[0] * maat[1], maat[0] + maat[1], 'Je telde op. Elke tak splitst weer: vermenigvuldig.')) ];
            if (niv.length === 3) st.push(St('Aan elk eindje komen er nog ' + maat[2] + ' takken bij: de ' + niv[2].mv + '. ' + (maat[0] * maat[1]) + ' ' + X + ' ' + maat[2] + ' =', tot, 'Elke combinatie tot nu toe kan met elk van de ' + maat[2] + ' ' + niv[2].mv + '.', F(tot, maat[0] * maat[1] + maat[2], 'Je telde op. Vermenigvuldig.')));
            return { vraag:'Hoeveel ' + th.wat + '?', context:'Je kiest ' + lijst(niv.map(function(l){ return l.vast ? l.zin : l.zin + ' (' + lijst(l.l, 'of') + ')'; })) + '. Hoeveel verschillende ' + th.wat + ' kun je maken?', beeld:pl, stappen:st };
          } },
        { id:'kans-kruistabel', naam:'Kansen uit een kruistabel', kort:'Deel door het totaal van de groep waaruit je kiest',
          uit:'<p>In een <b>kruistabel</b> staan twee dingen tegelijk, bijvoorbeeld: jongen of meisje, en wel of geen bril.</p><p>Kies je willekeurig iemand uit de <b>hele groep</b>? Deel dan door het totaal van iedereen.</p><p>Kies je alleen uit de <b>meisjes</b>? Deel dan door het aantal meisjes. Let dus goed op uit welke groep je kiest.</p>',
          wanneer:'gegevens in een tabel met rijen en kolommen staan.',
          maak:function(R){
            var th = R.kies([
              { rij:[{ mv:'jongens', ev:'jongen' }, { mv:'meisjes', ev:'meisje' }], kol:[{ kop:'met bril', bij:'met bril' }, { kop:'zonder bril', bij:'zonder bril' }], ctx:'De leerlingen van de brugklas.' },
              { rij:[{ mv:'brugklassers', ev:'brugklasser' }, { mv:'tweedeklassers', ev:'tweedeklasser' }], kol:[{ kop:'fietst', bij:'die fietst', mvbij:'die fietsen' }, { kop:'fietst niet', bij:'die niet fietst', mvbij:'die niet fietsen' }], ctx:'Hoe de leerlingen van de onderbouw naar school komen.' },
              { rij:[{ mv:'volwassenen', ev:'volwassene' }, { mv:'kinderen', ev:'kind' }], kol:[{ kop:'met abonnement', bij:'met een abonnement' }, { kop:'zonder abonnement', bij:'zonder abonnement' }], ctx:'De bezoekers van het zwembad op zaterdag.' } ]);
            var c = [[R.heel(3, 15), R.heel(3, 15)], [R.heel(3, 15), R.heel(3, 15)]], r = R.heel(0, 1), k = R.heel(0, 1), rt = [c[0][0] + c[0][1], c[1][0] + c[1][1]], kt = [c[0][0] + c[1][0], c[0][1] + c[1][1]], tot = rt[0] + rt[1];
            var deel = R.heel(0, 1) === 1, noem = deel ? rt[r] : tot, cel = c[r][k], kol = th.kol[k], mvbij = kol.mvbij || kol.bij;
            var tab = function(m){
              var nad = []; if (m >= 1) nad.push(deel ? [r + 1, 3] : [3, 3]); if (m >= 2) nad.push([r + 1, k + 1]);
              return R.teken.tabel([['', th.kol[0].kop, th.kol[1].kop, 'totaal'], [th.rij[0].mv, String(c[0][0]), String(c[0][1]), String(rt[0])], [th.rij[1].mv, String(c[1][0]), String(c[1][1]), String(rt[1])], ['totaal', String(kt[0]), String(kt[1]), String(tot)]], { kop:true, zijkop:true, nadruk:nad });
            };
            var vr = deel ? 'Je kiest willekeurig iemand uit de ' + th.rij[r].mv + '. Hoe groot is de kans op iemand ' + kol.bij + '?' : 'Je kiest willekeurig iemand uit de hele groep. Hoe groot is de kans op een ' + th.rij[r].ev + ' ' + kol.bij + '?';
            return kansOp({ vraag:deel ? 'Uit de ' + th.rij[r].mv + ': iemand ' + kol.bij + '?' : 'Een ' + th.rij[r].ev + ' ' + kol.bij + '?', context:th.ctx + ' ' + vr, beeld:tab, zelfBeeld:tab(0), stappen:[
              St(deel ? 'Je kiest alleen uit de ' + th.rij[r].mv + '. Hoeveel zijn dat er?' : 'Je kiest uit iedereen. Hoeveel zijn dat er?', noem, deel ? 'Kijk in de rij ' + th.rij[r].mv + ', in de kolom totaal.' : 'Kijk rechtsonder in de tabel: het totaal van iedereen.', deel ? F(noem, tot, 'Dat is iedereen. Je kiest alleen uit de ' + th.rij[r].mv + '.') : null),
              St('Hoeveel ' + th.rij[r].mv + ' ' + mvbij + ' zijn er?', cel, 'Zoek waar de rij ' + th.rij[r].mv + ' en de kolom ' + kol.kop + ' elkaar kruisen.'),
              Kb('De kans is …', cel, noem, cel + ' van de ' + noem + ': ' + br(cel, noem) + '.', 'breuk', deel ? F(uniek([br(cel, noem), brv(cel, noem)]), br(cel, tot), 'Je kiest alleen uit de ' + th.rij[r].mv + '. Deel door ' + noem + ', niet door ' + tot + '.') : F(uniek([br(cel, noem), brv(cel, noem)]), br(cel, rt[r]), 'Je kiest uit iedereen. Deel door ' + tot + '.')) ] }, cel, noem);
          } },
        { id:'kans-en', naam:'De vermenigvuldigregel: A én B', kort:'Beïnvloeden ze elkaar niet? Kans op A én B = kans op A × kans op B',
          uit:'<p>Je gooit een dobbelsteen en een munt. Hoe groot is de kans op een 6 <b>én</b> kop?</p><p>De dobbelsteen en de munt hebben niets met elkaar te maken. Dan geldt de <b>vermenigvuldigregel</b>: kans op 6 én kop = 1/6 × 1/2 = <b>1/12</b>.</p><p>Breuken vermenigvuldigen gaat zo: teller keer teller, noemer keer noemer. In een boomdiagram vermenigvuldig je de kansen langs de takken.</p>',
          wanneer:'je de kans wilt op twee dingen die allebei moeten gebeuren.',
          maak:function(R){ return mEn(R); } },
        { id:'kans-of', naam:'De somregel: A óf B', kort:'Kunnen ze niet tegelijk? Kans op A of B = kans op A + kans op B',
          uit:'<p>Je pakt één knikker uit een zak met 3 rode, 5 blauwe en 2 groene. Hoe groot is de kans op rood <b>of</b> groen?</p><p>Rood en groen kunnen niet tegelijk: één knikker heeft één kleur. Dan mag je de kansen <b>optellen</b>: 3/10 + 2/10 = <b>5/10</b> = 1/2.</p><p>Let op: kunnen A en B wel tegelijk, zoals "een even getal" of "meer dan 3" bij een dobbelsteen? Dan tel je 4 en 6 dubbel. Tel dan gewoon alle gunstige uitkomsten één keer.</p>',
          wanneer:'de ene of de andere uitkomst goed is.',
          maak:function(R){ return mOf(R); } },
        { id:'kans-complement', naam:'De complementregel: minstens één', kort:'Kans op minstens één = 1 − kans op geen enkele',
          uit:'<p>Je gooit twee keer met een dobbelsteen. Hoe groot is de kans op <b>minstens één</b> 6? Dat kan op veel manieren: eerst een 6, later een 6, of allebei.</p><p>Makkelijker is het <b>omgekeerde</b>: de kans op <b>geen enkele</b> 6. Per worp is dat 5/6, dus twee keer: 5/6 × 5/6 = 25/36.</p><p>De kans op minstens één 6 is dan 1 − 25/36 = <b>11/36</b>.</p>',
          wanneer:'er "minstens één" of "ten minste één keer" staat.',
          maak:function(R){ return mComp(R); } },
        { id:'kans-empirisch', naam:'Empirische en theoretische kans', kort:'Een experiment geeft een schatting van de kans; hoe vaker je het doet, hoe beter',
          uit:'<p>De <b>theoretische kans</b> reken je uit: de kans op kop is 1/2 = 50%.</p><p>De <b>empirische kans</b> haal je uit een experiment: je gooit 100 keer en krijgt 40 keer kop. De empirische kans is dan 40/100 = 40%.</p><p>Bij <b>weinig</b> worpen is een verschil gewoon toeval. Bij <b>heel veel</b> worpen komt de empirische kans dicht bij de theoretische. Is het verschil dan nog groot? Dan is er iets vreemds, bijvoorbeeld een valse dobbelsteen.</p><p>Soms kun je een kans alleen met een experiment vinden, zoals bij een punaise.</p>',
          wanneer:'je een kans uit een proef haalt, of een proef vergelijkt met wat je verwacht.',
          maak:function(R){
            if (R.heel(0, 2) === 0){
              var ding = R.kies([{ d:'een punaise', hij:'Hij', w:'met de punt omhoog' }, { d:'een flessendop', hij:'Hij', w:'met de opening omhoog' }, { d:'een plastic bekertje', hij:'Het', w:'op zijn kant' }, { d:'een wasknijper', hij:'Hij', w:'op zijn kant' }]);
              var N = R.kies([50, 100, 200, 400]), p = R.heel(8, 17) * 5, k = p * N / 100, M = R.kies([20, 40, 60, 80, 200]), ex = p * M / 100;
              return { vraag:'Hoe vaak ' + ding.w + ' bij ' + M + ' keer?', context:'Je gooit ' + ding.d + ' ' + N + ' keer. ' + ding.hij + ' valt ' + k + ' keer ' + ding.w + '. Hoe vaak verwacht je dat bij ' + M + ' keer gooien?', eenheid:'keer', stappen:[
                Pr('Empirische kans: ' + k + ' van de ' + N + ' = …%', p, naar100(k, N)),
                Kv('Kun je deze kans ook uitrekenen zonder experiment?', ['ja', 'nee'], 'nee', 'De kanten zijn niet even groot of even zwaar. De uitkomsten zijn dus niet even waarschijnlijk.'),
                St(p + '% van ' + M + ' =', ex, '1% van ' + M + ' is ' + T(M / 100) + '. Doe dat keer ' + p + '.') ] };
            }
            var obj = R.kies([{ d:'munt', lw:'De', wat:'kop', p:1 / 2, ww:'gegooid', zin:'Je gooit {N} keer met een munt.' }, { d:'dobbelsteen', lw:'De', wat:'een 6', p:1 / 6, ww:'gegooid', zin:'Je gooit {N} keer met een dobbelsteen.' }, { d:'rad', lw:'Het', wat:'rood', p:1 / 4, ww:'gedraaid', zin:'Een rad heeft 4 even grote vakken, waarvan 1 rood. Je draait {N} keer.' }]);
            var soort = R.kies(['toeval', 'klopt', 'vals']), N2, dev;
            if (soort === 'toeval'){ N2 = R.kies([20, 50]); dev = (R.heel(0, 1) ? 1 : -1) * R.heel(10, 20) / 100; }
            else if (soort === 'klopt'){ N2 = R.kies([1000, 2000, 5000, 10000]); dev = (R.heel(-8, 8)) / 1000; }
            else { N2 = R.kies([1000, 2000, 5000, 10000]); dev = (R.heel(0, 1) ? 1 : -1) * R.heel(8, 15) / 100; }
            var k2 = Math.round(N2 * Math.max(0.02, obj.p + dev)), emp = k2 * 100 / N2, th2 = obj.p * 100;
            var opt = { toeval:'Het verschil kan toeval zijn: er is maar weinig ' + obj.ww + '.', klopt:'De empirische kans is bijna gelijk aan de theoretische kans.', vals:obj.lw + ' ' + obj.d + ' is waarschijnlijk vals: na heel vaak ' + obj.ww + ' is het verschil nog groot.' };
            return eindKeuze({ vraag:'Wat kun je zeggen?', context:obj.zin.replace('{N}', T(N2)) + ' Je krijgt ' + T(k2) + ' keer ' + obj.wat + '. Vergelijk de empirische kans met de theoretische kans.', stappen:[
              Pr('Empirische kans: ' + T(k2) + ' van de ' + T(N2) + ' = …%', emp, naar100(k2, N2)),
              Pr('Theoretische kans op ' + obj.wat + ' = …%', th2, obj.p === 0.5 ? '1/2 = 50%.' : obj.p === 0.25 ? '1 van de 4 vakken: 1/4 = 25%.' : '1/6 = 1 : 6 = 0,1666... Dat is ongeveer 16,7%.'),
              Kv('Wat kun je zeggen?', [opt.toeval, opt.klopt, opt.vals], opt[soort], 'Kijk naar twee dingen: is er weinig of heel vaak ' + obj.ww + '? En is het verschil tussen ' + T(r1(emp)) + '% en ' + T(r1(th2)) + '% klein of groot?') ] });
          } },
        { id:'kans-verwachting', naam:'De verwachtingswaarde bij een spel', kort:'Wat je gemiddeld per keer krijgt: tel alle uitkomsten één keer en deel door het aantal',
          uit:'<p>Bij een spel op de kermis draai je aan een rad met 10 vakken. Op 1 vak win je € 5, op 2 vakken € 2. Op de rest niets. Een keer draaien kost € 1.</p><p>Stel je speelt 10 keer en elk vak komt één keer. Dan krijg je 5 + 2 + 2 = € 9. Gemiddeld per keer is dat 9 : 10 = <b>€ 0,90</b>. Dat is de <b>verwachtingswaarde</b>.</p><p>Je betaalt € 1 en krijgt gemiddeld € 0,90 terug. Op den duur verlies je dus 10 cent per keer.</p>',
          wanneer:'je wilt weten of een spel op den duur voordelig is.',
          maak:function(R){
            var n, P, p, m, inzet, E, delen, ctx, pl, t;
            if (R.heel(0, 2) === 0){
              var pr = R.kies([[2, 1], [4, 2], [5, 1], [10, 2], [8, 1], [3, 3]]); n = 6; P = pr[0]; p = pr[1]; m = 1; E = (P + p) / 6;
              do { inzet = R.kies([0.5, 1, 1.5, 2]); } while (inzet === E);
              delen = [P, p];
              ctx = 'Bij een spel gooi je één keer met een dobbelsteen. Gooi je een 6, dan krijg je ' + G(P) + '. Gooi je een 5, dan krijg je ' + G(p) + '. Anders krijg je niets. Een keer spelen kost ' + G(inzet) + '.';
              pl = null;
            } else {
              for (t = 0; t < 400; t++){
                n = R.kies([4, 5, 8, 10]); P = R.kies([2, 3, 4, 5, 10]); p = R.kies([0.5, 1]); m = R.heel(1, Math.min(3, n - 2)); E = (P + m * p) / n; inzet = R.kies([0.5, 1, 2]);
                if (Math.abs(E * 100 - Math.round(E * 100)) < 1e-9 && inzet !== E && Math.abs(E - inzet) < 1.5) break;
              }
              delen = [P]; for (var i = 0; i < m; i++) delen.push(p);
              var vak = ['rood']; for (i = 0; i < m; i++) vak.push('blauw'); while (vak.length < n) vak.push('groen');
              var tekst = vak.map(function(v){ return v === 'rood' ? T(P) : v === 'blauw' ? T(p) : '0'; });
              ctx = 'Op de kermis draai je aan een rad met ' + n + ' even grote vakken. Op 1 vak win je ' + G(P) + ', op ' + m + (m === 1 ? ' vak ' : ' vakken ') + G(p) + '. Op de andere vakken win je niets. Een keer draaien kost ' + G(inzet) + '.';
              pl = rad(vak, { tekst:tekst, onder:'bedragen in euro' });
            }
            var tot = som(delen), w = E - inzet, verlies = w < 0;
            var op = { vraag:'Hoeveel ' + (verlies ? 'verlies' : 'win') + ' je gemiddeld per keer?', context:ctx, eenheid:'euro', antwoord:gAnt(Math.abs(w)), stappen:[
              St('Stel: je speelt ' + n + ' keer en elke uitkomst komt precies één keer. Hoeveel krijg je dan samen? ' + delen.map(T).join(' + ') + ' =', gAnt(tot), 'Tel alle prijzen op. De uitkomsten zonder prijs tellen voor 0.'),
              St('Gemiddeld per keer: ' + g2(tot) + ' : ' + n + ' =', gAnt(E), 'Deel het totaal door ' + n + '. Dit is de verwachtingswaarde.', F(gAnt(E), g2(tot), 'Dat is voor ' + n + ' keer samen. Deel nog door ' + n + '.')),
              St('Je betaalt ' + G(inzet) + ' per keer. ' + (verlies ? 'Hoeveel verlies je gemiddeld per keer? ' + g2(inzet) + ' ' + MIN + ' ' + g2(E) : 'Hoeveel win je gemiddeld per keer? ' + g2(E) + ' ' + MIN + ' ' + g2(inzet)) + ' =', gAnt(Math.abs(w)), verlies ? 'Je betaalt meer dan je gemiddeld terugkrijgt. Het verschil is je verlies.' : 'Je krijgt gemiddeld meer terug dan je betaalt. Het verschil is je winst.') ] };
            op.stappen.forEach(function(s){ s.eenheid = 'euro'; });
            if (pl){ op.beeld = pl; op.zelfBeeld = pl; }
            return op;
          } },
        { id:'kans-kies', naam:'Kies de handigste manier', kort:'Kijk eerst wat er gevraagd wordt: een som van twee dingen, drie keer na elkaar, én, of, of minstens één?',
          uit:'<p>Je kent nu vijf manieren om een kans uit te rekenen. Welke is hier het handigst?</p><ul><li>Twee dingen en een <b>som of verschil</b>: een <b>rooster</b>.</li><li>Drie keer na elkaar, of precies zoveel keer: een <b>boomdiagram</b>.</li><li>A <b>én</b> B, die elkaar niet beïnvloeden: <b>vermenigvuldigen</b>.</li><li>A <b>of</b> B, die niet tegelijk kunnen: <b>optellen</b>.</li><li><b>Minstens één</b>: 1 min de kans op geen enkele.</li></ul>',
          wanneer:'je een kansvraag krijgt en zelf moet kiezen hoe je hem aanpakt.',
          maak:function(R){
            var M = [
              { naam:'een rooster', maak:mRooster, hint:'Twee dingen tegelijk en een som of verschil: zet ze in een rooster en tel de vakjes.' },
              { naam:'een boomdiagram', maak:function(R2){ return mBoomMunt(R2, 3); }, hint:'Drie worpen na elkaar en "precies zoveel keer": teken een boom en tel de eindjes.' },
              { naam:'vermenigvuldigen (én)', maak:mEn, hint:'Er moeten twee dingen allebei gebeuren, en ze beïnvloeden elkaar niet: vermenigvuldig.' },
              { naam:'optellen (of)', maak:function(R2){ return mOf(R2, true); }, hint:'Eén keer pakken of draaien, en het ene of het andere is goed: tel de kansen op.' },
              { naam:'1 min de kans op geen enkele', maak:mComp, hint:'Er staat "minstens één": reken de kans op geen enkele uit en haal die van 1 af.' } ];
            var k = R.heel(0, M.length - 1), op = M[k].maak(R), b = op.beeld;
            op.stappen.unshift(Kv('Welke manier is hier het handigst?', M.map(function(x){ return x.naam; }), M[k].naam, M[k].hint));
            op.beeld = b ? function(n){ return n < 1 ? '' : typeof b === 'function' ? b(n - 1) : b; } : null;
            if (!op.beeld) delete op.beeld;
            delete op.zelfBeeld;
            return op;
          } }
      ] }
  ]);
})();
