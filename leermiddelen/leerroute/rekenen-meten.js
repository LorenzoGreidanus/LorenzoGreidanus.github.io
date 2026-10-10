/* De leerroute rekenen: meten en meetkunde (klok en tijd, geld, maten omrekenen, omtrek,
   oppervlakte, inhoud, snelheid en samengestelde eenheden) en verbanden (tabellen,
   grafieken, gemiddelde en formules). Per soort som elke manier als eigen doel.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, S = R0.schoon;
  var K = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ---------- hulpjes ---------- */
  function g2(x){ return T(x, { dec:2, vast:true }); }
  function G(x){ return '€ ' + g2(x); }
  function Gk(x){ return G(x).replace(',00', ''); }
  function pad(m){ return (m < 10 ? '0' : '') + m; }
  function tS(h, m){ return h + ':' + pad(m); }
  function r1(x){ return Math.round(x * 10) / 10; }
  function r2(x){ return Math.round(x * 100) / 100; }
  function uniek(l){ var u = []; l.forEach(function(x){ if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function F(){ var f = {}; for (var i = 0; i < arguments.length; i += 2) f[String(arguments[i]).toLowerCase()] = arguments[i + 1]; return f; }
  /* het antwoord, ook goed als je de eenheid erachter typt */
  function metE(x, e, ook){
    x = String(x);
    var vormen = uniek([x, x.replace(/\./g, ''), x.replace(/\./g, '').replace(',', '.')]), uit = vormen.slice();
    [e].concat(ook || []).forEach(function(eh){
      if (!eh) return;
      var ee = uniek([eh, eh.replace('²', '2').replace('³', '3')]);
      vormen.forEach(function(v){ ee.forEach(function(u){ uit.push(v + ' ' + u, v + u); }); });
    });
    return uniek(uit);
  }
  function kz(R, goed, fout){ var l = [goed]; fout.forEach(function(f){ if (l.indexOf(f) < 0) l.push(f); }); l = R.hussel(l); return { opties:l, goed:l.indexOf(goed) }; }
  function kstap(R, tekst, goed, fout, hint, waarom){ var k = kz(R, goed, fout), s = { tekst:tekst, opties:k.opties, goed:k.goed, hint:hint }; if (waarom) s.waarom = waarom; return s; }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  function tijdC(h, m, streng){
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/uur$/, '').replace(/^(\d{1,2})[.,uh](\d{2})$/, '$1:$2'), r = /^(\d{1,2}):(\d{2})$/.exec(s);
      if (!r) return false;
      var hh = +r[1], mm = +r[2];
      if (mm !== m || hh > 24) return false;
      return streng ? hh % 24 === h % 24 : hh % 12 === h % 12;
    };
  }
  function duurC(min, kaal){
    return function(v){
      var s = String(v).toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim(), r;
      if ((r = /^(\d+) ?(uur|u|h) ?(en )?(\d+) ?(minuten|minuut|min|m)?$/.exec(s))) return +r[1] * 60 + +r[4] === min;
      if ((r = /^(\d+):(\d\d)$/.exec(s))) return +r[1] * 60 + +r[2] === min;
      if ((r = /^(\d+(?:\.\d+)?) ?(minuten|minuut|min|m)$/.exec(s))) return Math.abs(+r[1] - min) < 1e-9;
      if ((r = /^(\d*\.?\d+) ?(uur|u|h)$/.exec(s))) return Math.abs(+r[1] * 60 - min) < 1e-6;
      if ((r = /^(\d*\.?\d+)$/.exec(s))) return Math.abs((kaal === 'uur' ? +r[1] * 60 : +r[1]) - min) < 1e-6;
      return false;
    };
  }
  function duurT(min){ var h = Math.floor(min / 60), m = min % 60; return h && m ? h + ' uur en ' + m + ' minuten' : h ? h + ' uur' : m + ' minuten'; }
  function puntC(x, y){
    return function(v){
      var s = String(v).replace(/[\s()]/g, '').replace(/[−–—]/g, '-'), d = s.split(/[;,]/);
      if (d.length !== 2 || !/^-?\d+$/.test(d[0]) || !/^-?\d+$/.test(d[1])) return false;
      return +d[0] === x && +d[1] === y;
    };
  }
  function punt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }

  /* ---------- tekenen ---------- */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + S(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700');
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal ' + (o.groot ? 'groot' : 'klein') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + S(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.stip ? ';stroke-dasharray:6 5' : '') + (o.op ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' style="fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2) + (o.stip ? ';stroke-dasharray:6 5' : '') + '"/>'; }
  function pg(p, o){ o = o || {}; return '<polygon points="' + p.map(function(q){ return n1(q[0]) + ',' + n1(q[1]); }).join(' ') + '" style="fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2.5) + ';stroke-linejoin:round' + (o.stip ? ';stroke-dasharray:6 5' : '') + '"/>'; }
  function boog(x1, y1, x2, y2, h, kl, tekst){
    var mx = (x1 + x2) / 2, top = Math.min(y1, y2) - h, r = x2 > x1 ? -1 : 1;
    return '<path d="M' + n1(x1) + ' ' + n1(y1) + ' Q' + n1(mx) + ' ' + n1(top) + ' ' + n1(x2) + ' ' + n1(y2) + '" style="fill:none;stroke:' + kl + ';stroke-width:2.5;stroke-linecap:round"/>' +
      '<path d="M' + n1(x2) + ' ' + n1(y2) + ' l' + (r * 8) + ' -7 M' + n1(x2) + ' ' + n1(y2) + ' l' + (r * 1) + ' -10" style="fill:none;stroke:' + kl + ';stroke-width:2.5;stroke-linecap:round"/>' +
      (tekst ? tx(mx, top + h * 0.5 - 4, tekst, { k:kl, vet:true }) : '');
  }
  /* een lijn met gelijke stukken en sprongen erboven (aanvullen) */
  function sprongBeeld(punten, teksten, n, aria){
    var k = punten.length - 1, W = 640, x0 = 50, st = (W - 100) / k, Y = 100, s = ln(x0 - 20, Y, W - 30, Y);
    punten.forEach(function(p, i){ var x = x0 + i * st; s += ln(x, Y - 7, x, Y + 7) + tx(x, Y + 28, p, { vet:i === 0 || i === k }); });
    for (var i = 0; i < Math.min(n, k); i++) s += boog(x0 + i * st + 4, Y - 6, x0 + (i + 1) * st - 4, Y - 6, 52, K[i % 5], teksten[i]);
    s += '<circle cx="' + x0 + '" cy="' + Y + '" r="6" style="fill:var(--lr-2)"/>';
    return svg(W, 140, s, aria || 'aanvullen in sprongen');
  }
  /* de trap van het metriek stelsel: van een trede naar een andere */
  var TRAP = { lengte:['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], gewicht:['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], inhoud:['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'],
    opp:['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'], inh:['km³', 'hm³', 'dam³', 'm³', 'dm³', 'cm³', 'mm³'], ha:['ha', 'a', 'm²'] };
  function trap(lijst, van, naar, basis, pijlen){
    var i1 = lijst.indexOf(van), i2 = lijst.indexOf(naar), lo = Math.min(i1, i2), hi = Math.max(i1, i2), n = lijst.length, bw = 78, bh = 30, dx = 84, dy = 28, s = '';
    for (var i = 0; i < n; i++){
      var x = 8 + i * dx, y = 44 + i * dy, eind = i === i1 || i === i2;
      s += rc(x, y, bw, bh, { f:i === i1 ? K[0] : i === i2 ? K[3] : 'var(--kaart)', fo:eind ? 0.28 : 1, w:eind ? 3 : 1.5, rx:5 });
      s += tx(x + bw / 2, y + 23, lijst[i], { vet:eind, groot:true });
    }
    if (pijlen) for (i = lo; i < hi; i++){
      var a = i1 < i2 ? i : i + 1, b = i1 < i2 ? i + 1 : i;
      s += boog(8 + a * dx + bw / 2, 44 + a * dy - 2, 8 + b * dx + bw / 2, 44 + b * dy - 2, 30, K[1], (i1 < i2 ? '×' : ':') + basis);
    }
    return svg(16 + (n - 1) * dx + bw, 52 + (n - 1) * dy + bh, s, 'de trap van ' + van + ' naar ' + naar, n < 5 ? 340 : 620);
  }
  function trapStappen(R, lijst, van, naar, basis, v){
    var i1 = lijst.indexOf(van), i2 = lijst.indexOf(naar), k = Math.abs(i2 - i1), f = Math.pow(basis, k), omlaag = i2 > i1, keten = [];
    for (var i = 0; i < k; i++) keten.push(basis);
    var uit = omlaag ? v * f : v / f;
    return { f:f, k:k, uit:uit, omlaag:omlaag, stappen:[
      { tekst:'Van ' + van + ' naar ' + naar + ': hoeveel treden op de trap?', antwoord:String(k), hint:'Zoek ' + van + ' en ' + naar + ' op de trap en tel de stappen ertussen.' },
      { tekst:(omlaag ? 'Je gaat naar een kleinere maat, dus het getal wordt groter. Per trede × ' + T(basis) + '. Samen is dat × …' : 'Je gaat naar een grotere maat, dus het getal wordt kleiner. Per trede : ' + T(basis) + '. Samen is dat : …'),
        antwoord:T(f), hint:k === 1 ? 'Eén trede is ' + T(basis) + '.' : k + ' treden: ' + keten.map(T).join(' × ') + '.' },
      { tekst:T(v) + (omlaag ? ' × ' : ' : ') + T(f) + ' =', antwoord:metE(T(uit), naar), eenheid:naar,
        hint:'Bij ' + (omlaag ? '× ' : ': ') + T(f) + ' schuift de komma ' + (String(f).length - 1) + (f === 10 ? ' plaats' : ' plaatsen') + ' naar ' + (omlaag ? 'rechts. Vul aan met nullen als dat nodig is.' : 'links.'),
        fout:F(T(omlaag ? v / f : v * f), 'Verkeerde kant op. ' + (omlaag ? 'Naar een kleinere maat wordt het getal groter.' : 'Naar een grotere maat wordt het getal kleiner.')) } ] };
  }
  function trapMaak(R, lijst, paren, basis, o){
    o = o || {};
    var p = R.kies(paren), omlaag = R.heel(0, 1) === 1, van = omlaag ? p[0] : p[1], naar = omlaag ? p[1] : p[0];
    var k = Math.abs(lijst.indexOf(naar) - lijst.indexOf(van)), f = Math.pow(basis, k);
    if (!omlaag && o.maxOp && k > o.maxOp){ omlaag = true; van = p[0]; naar = p[1]; }
    var q = o.komma && R.heel(0, 2) === 0 ? R.heel(11, 99) / 10 : R.heel(2, 60), v = omlaag ? q : q * f;
    var t = trapStappen(R, lijst, van, naar, basis, v);
    return { vraag:T(v) + ' ' + van + ' = … ' + naar, eenheid:naar,
      beeld:function(n){ return trap(lijst, van, naar, basis, n >= 1); }, stappen:t.stappen };
  }
  /* een rechthoek met maten */
  function rechthoek(l, b, e, o){
    o = o || {};
    var s0 = Math.min(320 / l, 170 / b, 34), w = l * s0, h = b * s0, x0 = 70, y0 = 30, s = '';
    s += rc(x0, y0, w, h, { f:K[0], fo:0.14, w:2.5 });
    if (o.hokjes){ for (var i = 1; i < l; i++) s += ln(x0 + i * s0, y0, x0 + i * s0, y0 + h, { w:1, op:0.35 }); for (i = 1; i < b; i++) s += ln(x0, y0 + i * s0, x0 + w, y0 + i * s0, { w:1, op:0.35 }); }
    s += tx(x0 + w / 2, y0 + h + 24, T(l) + ' ' + e, { vet:true }) + tx(x0 - 10, y0 + h / 2 + 5, T(b) + ' ' + e, { a:'end', vet:true });
    if (o.boven) s += tx(x0 + w / 2, y0 - 10, T(l) + ' ' + e, { k:K[1], vet:true });
    if (o.rechts) s += tx(x0 + w + 10, y0 + h / 2 + 5, T(b) + ' ' + e, { a:'start', k:K[1], vet:true });
    return svg(x0 + w + 80, y0 + h + 40, s, 'rechthoek van ' + T(l) + ' bij ' + T(b) + ' ' + e, 520);
  }
  /* een balk, schuin getekend; o.blokjes tekent het rooster van blokjes */
  function balk(l, b, h, e, o){
    o = o || {};
    var s0 = o.s || Math.min(30, 230 / l, 150 / h), dx = s0 * 0.55, dy = -s0 * 0.42, x0 = 70, y0 = 20 + b * -dy, s = '', i, j;
    var W = l * s0, H = h * s0;
    s += pg([[x0, y0], [x0 + W, y0], [x0 + W + b * dx, y0 + b * dy], [x0 + b * dx, y0 + b * dy]], { f:K[0], fo:0.12 });
    s += pg([[x0 + W, y0], [x0 + W + b * dx, y0 + b * dy], [x0 + W + b * dx, y0 + H + b * dy], [x0 + W, y0 + H]], { f:K[0], fo:0.32 });
    s += rc(x0, y0, W, H, { f:K[0], fo:0.2, w:2.5 });
    if (o.laag) s += rc(x0, y0 + H - s0, W, s0, { f:K[1], fo:0.35, w:0 });
    if (o.blokjes){
      for (i = 1; i < l; i++) s += ln(x0 + i * s0, y0, x0 + i * s0, y0 + H, { w:1, op:0.45 }) + ln(x0 + i * s0, y0, x0 + i * s0 + b * dx, y0 + b * dy, { w:1, op:0.45 });
      for (j = 1; j < h; j++) s += ln(x0, y0 + j * s0, x0 + W, y0 + j * s0, { w:1, op:0.45 }) + ln(x0 + W, y0 + j * s0, x0 + W + b * dx, y0 + j * s0 + b * dy, { w:1, op:0.45 });
      for (i = 1; i < b; i++) s += ln(x0 + i * dx, y0 + i * dy, x0 + W + i * dx, y0 + i * dy, { w:1, op:0.45 }) + ln(x0 + W + i * dx, y0 + i * dy, x0 + W + i * dx, y0 + H + i * dy, { w:1, op:0.45 });
    }
    s += tx(x0 + W / 2, y0 + H + 24, T(l) + ' ' + e, { vet:true });
    s += tx(x0 + W + b * dx + 10, y0 + H / 2 + b * dy + 5, T(h) + ' ' + e, { a:'start', vet:true });
    s += tx(x0 + b * dx / 2 - 8, y0 + b * dy / 2 + 2, T(b) + ' ' + e, { a:'end', vet:true });
    return svg(x0 + W + b * dx + 90, y0 + H + 40, s, 'balk van ' + T(l) + ' bij ' + T(b) + ' bij ' + T(h) + ' ' + e, 480);
  }
  function cirkel(waarde, isStraal, e){
    var cx = 130, cy = 110, r = 86, s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:var(--lr-1);fill-opacity:.14;stroke:var(--ink);stroke-width:2.5"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" style="fill:var(--ink)"/>';
    if (isStraal) s += ln(cx, cy, cx + r, cy, { k:K[1], w:3 }) + tx(cx + r / 2, cy - 10, 'straal ' + T(waarde) + ' ' + e, { k:K[1], vet:true });
    else s += ln(cx - r, cy, cx + r, cy, { k:K[1], w:3 }) + tx(cx, cy - 10, 'diameter ' + T(waarde) + ' ' + e, { k:K[1], vet:true });
    return svg(260, 220, s, (isStraal ? 'cirkel met straal ' : 'cirkel met diameter ') + T(waarde) + ' ' + e, 280);
  }
  /* assen met een rooster; o: { xs:[labels], max, stap, elke } */
  function assen(o){
    var x0 = 64, x1 = 560, yT = 24, yB = 236, s = '', i, max = o.max, st = o.stap;
    function Y(v){ return yB - (v - (o.min || 0)) / (max - (o.min || 0)) * (yB - yT); }
    for (var v = o.min || 0; v <= max + 1e-9; v += st){
      v = Math.round(v * 1000) / 1000;
      s += ln(x0, Y(v), x1, Y(v), { w:1, op:v === (o.min || 0) ? 1 : 0.28 });
      if (Math.round(v / st) % (o.elke || 1) === 0) s += tx(x0 - 10, Y(v) + 5, T(v), { a:'end' });
    }
    s += ln(x0, yT - 6, x0, yB);
    var n = o.xs.length, slot = (x1 - x0) / n;
    function X(i){ return x0 + slot * (i + 0.5); }
    o.xs.forEach(function(l, i){ s += tx(X(i), yB + 22, l); });
    if (o.as) s += tx(x0 - 6, 12, o.as, { a:'start' });
    return { s:s, X:X, Y:Y, slot:slot, x0:x0, x1:x1, yT:yT, yB:yB };
  }
  function staafGrafiek(cats, vals, st, o){
    o = o || {};
    var max = Math.ceil(Math.max.apply(null, vals) / (2 * st)) * 2 * st + (o.extra ? 2 * st : 0), A = assen({ xs:cats, max:max, stap:st, elke:o.elke || 2, as:o.as }), s = A.s;
    vals.forEach(function(v, i){ var w = A.slot * 0.52, k = o.kleur && o.kleur[i] != null ? K[o.kleur[i]] : K[0];
      s += rc(A.X(i) - w / 2, A.Y(v), w, A.yB - A.Y(v), { f:k, fo:o.kleur && o.kleur[i] != null ? 0.85 : 0.6, w:1.5, s:k }); });
    return svg(580, 270, s, o.aria || 'staafdiagram');
  }
  function lijnGrafiek(xs, vals, st, o){
    o = o || {};
    var max = o.max || Math.ceil(Math.max.apply(null, vals) / (2 * st)) * 2 * st + 2 * st, A = assen({ xs:xs, max:max, stap:st, elke:o.elke || 2, as:o.as }), s = A.s;
    s += '<polyline points="' + vals.map(function(v, i){ return n1(A.X(i)) + ',' + n1(A.Y(v)); }).join(' ') + '" style="fill:none;stroke:var(--lr-1);stroke-width:3;stroke-linejoin:round"/>';
    vals.forEach(function(v, i){ s += '<circle cx="' + n1(A.X(i)) + '" cy="' + n1(A.Y(v)) + '" r="' + (o.nadruk && o.nadruk.indexOf(i) >= 0 ? 7 : 4.5) + '" style="fill:' + (o.nadruk && o.nadruk.indexOf(i) >= 0 ? K[1] : K[0]) + '"/>'; });
    if (o.lijnen) o.lijnen.forEach(function(p){ s += ln(A.X(p[0]), A.Y(p[1]), A.x0, A.Y(p[1]), { k:K[1], stip:true }); });
    if (o.vlakken) o.vlakken.forEach(function(p){ s += ln(A.X(p[0]), A.Y(vals[p[0]]), A.X(p[1]), A.Y(vals[p[1]]), { k:K[p[2] || 1], w:5 }); });
    return svg(580, 270, s, o.aria || 'lijngrafiek');
  }
  function taart(delen, o){
    o = o || {};
    var cx = 130, cy = 125, r = 105, hoek = -Math.PI / 2, s = '';
    delen.forEach(function(d, i){
      var a = d.p / 100 * 2 * Math.PI, b = hoek + a, groot = a > Math.PI ? 1 : 0;
      s += '<path d="M' + cx + ' ' + cy + ' L' + n1(cx + r * Math.cos(hoek)) + ' ' + n1(cy + r * Math.sin(hoek)) + ' A' + r + ' ' + r + ' 0 ' + groot + ' 1 ' + n1(cx + r * Math.cos(b)) + ' ' + n1(cy + r * Math.sin(b)) + ' Z" style="fill:' + K[i % 5] + ';fill-opacity:' + (d.nadruk ? 0.9 : 0.45) + ';stroke:var(--kaart);stroke-width:2"/>';
      var m = hoek + a / 2;
      if (d.label) s += tx(cx + r * 0.62 * Math.cos(m), cy + r * 0.62 * Math.sin(m) + 5, d.label, { vet:true });
      hoek = b;
      s += rc(270, 40 + i * 30, 16, 16, { f:K[i % 5], fo:d.nadruk ? 0.9 : 0.45, w:0, rx:3 }) + tx(294, 53 + i * 30, d.naam, { a:'start', vet:d.nadruk });
    });
    return svg(440, 250, s, 'cirkeldiagram', 480);
  }
  function poppetje(x, y, kl, half){
    if (half) return '<path d="M' + (x + 10) + ' ' + y + ' a7 7 0 0 0 0 14 Z M' + (x + 10) + ' ' + (y + 16) + ' h-6 a4 4 0 0 0 -4 4 v14 h10 Z" style="fill:' + kl + '"/>';
    return '<circle cx="' + (x + 10) + '" cy="' + (y + 7) + '" r="7" style="fill:' + kl + '"/><path d="M' + (x + 4) + ' ' + (y + 16) + ' h12 a4 4 0 0 1 4 4 v14 h-20 v-14 a4 4 0 0 1 4 -4 Z" style="fill:' + kl + '"/>';
  }
  function rooster(pnt, o){
    o = o || {};
    var c = 24, x0 = 170, y0 = 160, s = '', i, m = 6;
    for (i = -m; i <= m; i++){ s += ln(x0 + i * c, y0 - m * c, x0 + i * c, y0 + m * c, { w:1, op:i ? 0.22 : 1 }) + ln(x0 - m * c, y0 + i * c, x0 + m * c, y0 + i * c, { w:1, op:i ? 0.22 : 1 }); }
    for (i = -m + 1; i < m; i++){ if (!i) continue; s += tx(x0 + i * c, y0 + 16, T(i)) ; s += tx(x0 - 6, y0 - i * c + 5, T(i), { a:'end' }); }
    s += tx(x0 + m * c + 6, y0 + 5, 'x', { a:'start', vet:true }) + tx(x0 + 8, y0 - m * c - 2, 'y', { a:'start', vet:true });
    if (o.n >= 1) s += ln(x0, y0, x0 + pnt[0] * c, y0, { k:K[1], w:4 });
    if (o.n >= 2) s += ln(x0 + pnt[0] * c, y0, x0 + pnt[0] * c, y0 - pnt[1] * c, { k:K[3], w:4 });
    s += '<circle cx="' + (x0 + pnt[0] * c) + '" cy="' + (y0 - pnt[1] * c) + '" r="6" style="fill:var(--lr-2)"/>' + tx(x0 + pnt[0] * c + 10, y0 - pnt[1] * c - 8, 'A', { a:'start', vet:true, k:K[1] });
    return svg(340, 320, s, 'assenstelsel met punt A', 380);
  }

  /* ---------- klok en tijd ---------- */
  var UUR = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];
  function uw(u){ return UUR[((u % 12) + 12) % 12]; }
  function tijdW(u, m){
    var nu = uw(u), na = uw(u + 1);
    return { 0:nu + ' uur', 5:'vijf over ' + nu, 10:'tien over ' + nu, 15:'kwart over ' + nu, 20:'tien voor half ' + na, 25:'vijf voor half ' + na,
      30:'half ' + na, 35:'vijf over half ' + na, 40:'tien over half ' + na, 45:'kwart voor ' + na, 50:'tien voor ' + na, 55:'vijf voor ' + na }[m];
  }
  function tijdLijn(R, van, tot, labels, sprongen){
    return R.teken.lijn({ van:van, tot:tot, streep:60, labels:labels, sprongen:sprongen, stip:[van], nieuw:true, toon:function(n){ return tS(Math.floor(n / 60), n % 60); }, aria:'tijdlijn' });
  }
  var MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var MKORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var MDAG = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  /* ---------- maten schatten ---------- */
  var IJK = { lengte:['1 meter', 'Eén meter is ongeveer een grote stap.'], gewicht:['1 kilo', 'Eén kilo is een pak suiker.'], inhoud:['1 liter', 'Eén liter is een pak melk.'] };
  var SCHAT = [
    ['lengte', 'de hoogte van een deur', '2 m', ['2 cm', '20 m', '2 km'], 'Een deur is iets hoger dan een volwassene.'],
    ['lengte', 'de lengte van een potlood', '15 cm', ['15 mm', '15 m', '1,5 m'], 'Een potlood past in je etui.'],
    ['lengte', 'de dikte van een munt van 1 euro', '2 mm', ['2 cm', '2 dm', '2 m'], 'Een munt is heel dun, dunner dan je vinger breed is.'],
    ['lengte', 'de lengte van een voetbalveld', '100 m', ['100 cm', '10 m', '100 km'], 'Over een voetbalveld ren je in ongeveer 15 seconden.'],
    ['lengte', 'de breedte van je duim', '2 cm', ['2 mm', '2 dm', '2 m'], 'Een centimeter is ongeveer de breedte van je pink.'],
    ['lengte', 'de lengte van een mier', '5 mm', ['5 cm', '5 dm', '5 m'], 'Een mier is kleiner dan een centimeter.'],
    ['lengte', 'de hoogte van een flat met 10 verdiepingen', '30 m', ['30 cm', '3 m', '3 km'], 'Eén verdieping is ongeveer 3 meter.'],
    ['lengte', 'de lengte van een bus', '12 m', ['12 cm', '1,2 m', '12 km'], 'Een bus is veel langer dan een auto van 4 meter.'],
    ['lengte', 'de afstand die je in een uur fietst', '15 km', ['15 m', '150 m', '150 km'], 'Afstanden tussen plaatsen meet je in kilometers.'],
    ['lengte', 'de lengte van een schrift', '30 cm', ['30 mm', '3 m', '30 m'], 'Een schrift is ongeveer zo lang als een liniaal.'],
    ['gewicht', 'een appel', '150 g', ['150 mg', '15 kg', '1,5 kg'], 'Er gaan zo\'n 6 appels in een kilo.'],
    ['gewicht', 'een volwassen man', '80 kg', ['80 g', '8 kg', '800 kg'], 'Een volwassene weegt zo\'n 80 pakken suiker.'],
    ['gewicht', 'een auto', '1 ton', ['1 kg', '10 kg', '100 ton'], 'Een auto weegt ongeveer 1000 kilo: dat is 1 ton.'],
    ['gewicht', 'een paperclip', '1 g', ['1 mg', '1 kg', '100 g'], 'Een paperclip voel je bijna niet in je hand.'],
    ['gewicht', 'een fiets', '15 kg', ['15 g', '150 g', '150 kg'], 'Een fiets kun je nog net optillen.'],
    ['gewicht', 'een brood', '800 g', ['800 mg', '8 kg', '80 kg'], 'Een brood is iets lichter dan een pak suiker.'],
    ['gewicht', 'een olifant', '5 ton', ['5 kg', '50 kg', '500 g'], 'Een olifant weegt duizenden kilo\'s: dat zijn tonnen.'],
    ['gewicht', 'een schooltas vol boeken', '6 kg', ['6 g', '60 g', '60 kg'], 'Een volle tas weegt een paar pakken suiker.'],
    ['inhoud', 'een emmer', '10 l', ['10 ml', '10 cl', '100 l'], 'In een emmer gaan een paar pakken melk.'],
    ['inhoud', 'een theelepel', '5 ml', ['5 l', '5 dl', '50 cl'], 'Een theelepel is maar een klein slokje.'],
    ['inhoud', 'een blikje frisdrank', '33 cl', ['33 ml', '33 l', '3,3 l'], 'Een blikje is een derde van een pak melk.'],
    ['inhoud', 'een badkuip', '150 l', ['150 ml', '15 cl', '15 dl'], 'In een bad gaan heel veel emmers water.'],
    ['inhoud', 'een glas water', '2 dl', ['2 ml', '2 l', '20 l'], 'Uit een pak melk schenk je zo\'n 5 glazen.'],
    ['inhoud', 'een gieter', '5 l', ['5 ml', '5 cl', '500 l'], 'In een gieter gaan een paar pakken melk.'],
    ['inhoud', 'de tank van een auto', '50 l', ['50 ml', '50 cl', '5 dl'], 'Een tank vol benzine is veel meer dan een emmer.']
  ];

  /* ---------- snelheid ---------- */
  var VOER = [['Een wandelaar', 'loopt', 4, 6], ['Een fietser', 'rijdt', 12, 24], ['Een scooter', 'rijdt', 24, 44], ['Een auto', 'rijdt', 60, 120], ['Een trein', 'rijdt', 80, 160]];
  function snelheid(R, deel){
    var w = R.kies(VOER), v; do { v = R.heel(w[2], w[3]); } while (v % (deel || 2) !== 0);
    return { wie:w[0], doet:w[1], v:v };
  }
  function driehoek(nadruk){
    var s = pg([[150, 14], [272, 186], [28, 186]], { f:K[0], fo:0.1 }) + ln(86, 104, 214, 104) + ln(150, 104, 150, 186);
    s += tx(150, 80, 'afstand', { vet:nadruk === 'afstand', k:nadruk === 'afstand' ? K[1] : null });
    s += tx(104, 156, 'snelheid', { vet:nadruk === 'snelheid', k:nadruk === 'snelheid' ? K[1] : null });
    s += tx(196, 156, 'tijd', { vet:nadruk === 'tijd', k:nadruk === 'tijd' ? K[1] : null });
    return svg(300, 200, s, 'formuledriehoek: afstand boven, snelheid en tijd onder', 300);
  }
  var FORM = { snelheid:'afstand : tijd', afstand:'snelheid × tijd', tijd:'afstand : snelheid' };
  function snelOpgave(R, soort){
    var t = R.kies([2, 3, 4, 5, 1.5, 2.5, 0.5]), w = snelheid(R, 2), d = w.v * t, vr, ctx;
    if (soort === 'snelheid'){ ctx = w.wie + ' ' + w.doet + ' ' + T(d) + ' km in ' + T(t) + ' uur.'; vr = 'Hoe hard gaat hij gemiddeld?'; }
    else if (soort === 'afstand'){ ctx = w.wie + ' ' + w.doet + ' ' + w.v + ' km per uur, ' + T(t) + ' uur lang.'; vr = 'Hoe ver komt hij?'; }
    else { ctx = w.wie + ' ' + w.doet + ' ' + w.v + ' km per uur.'; vr = 'Hoe lang doet hij over ' + T(d) + ' km?'; }
    var reken = soort === 'snelheid' ? { tekst:T(d) + ' : ' + T(t) + ' =', antwoord:metE(T(w.v), 'km/u', ['km per uur']), eenheid:'km/u', hint:t === 0.5 ? 'In een half uur ' + T(d) + ' km. In een heel uur kom je twee keer zo ver.' : t % 1 ? 'Delen door ' + T(t) + ': reken eerst uit hoeveel km in een half uur (' + T(d) + ' : ' + T(t * 2) + '), en verdubbel dat.' : 'Hoe vaak past ' + T(t) + ' in ' + T(d) + '?' }
      : soort === 'afstand' ? { tekst:w.v + ' × ' + T(t) + ' =', antwoord:metE(T(d), 'km'), eenheid:'km', hint:t === 0.5 ? 'Een half uur is de helft van ' + w.v + ' km.' : t % 1 ? T(Math.floor(t)) + ' × ' + w.v + ' = ' + T(Math.floor(t) * w.v) + ', en een half uur is ' + T(w.v / 2) + ' km.' : t + ' keer ' + w.v + ' km.' }
      : { tekst:T(d) + ' : ' + w.v + ' =', antwoord:metE(T(t), 'uur'), controle:duurC(t * 60, 'uur'), eenheid:'uur', hint:'Hoe vaak past ' + w.v + ' in ' + T(d) + '?' + (t % 1 ? ' Past hij er nog een half keer in? Dat is een half uur: 0,5.' : '') };
    return { ctx:ctx, vr:vr, reken:reken, w:w, t:t, d:d };
  }

  /* ---------- gemiddelde ---------- */
  function rij(l){ return l.map(T).join(', '); }
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }

  /* ---------- formules ---------- */
  var HUUR = [
    { ctx:function(a, b){ return 'Een kano huren kost ' + Gk(a) + ' per uur plus ' + Gk(b) + ' borg.'; }, f:'kosten = {a} × uren + {b}', vr:'uur', voor:'Hoeveel uur kun je huren voor ' },
    { ctx:function(a, b){ return 'Een taxi kost ' + Gk(b) + ' instaptarief plus ' + Gk(a) + ' per km.'; }, f:'kosten = {a} × km + {b}', vr:'km', voor:'Hoeveel km kun je rijden voor ' },
    { ctx:function(a, b){ return 'Een sportschool kost ' + Gk(b) + ' inschrijfgeld plus ' + Gk(a) + ' per maand.'; }, f:'kosten = {a} × maanden + {b}', vr:'maanden', voor:'Hoeveel maanden kun je sporten voor ' },
    { ctx:function(a, b){ return 'Een springkussen huren kost ' + Gk(b) + ' bezorgkosten plus ' + Gk(a) + ' per uur.'; }, f:'kosten = {a} × uren + {b}', vr:'uur', voor:'Hoeveel uur kun je huren voor ' }
  ];
  function ketting(a, b, waarden, n){
    var s = '', bx = [40, 230, 420], w = 110, y = 58;
    var tekst = [waarden[0], waarden[1], waarden[2]];
    bx.forEach(function(x, i){ s += rc(x, y, w, 42, { f:'var(--kaart)', rx:10, w:2.5 }) + tx(x + w / 2, y + 28, tekst[i], { groot:true }); });
    s += boog(bx[0] + w / 2 + 20, y - 4, bx[1] + w / 2 - 20, y - 4, 26, K[0], '× ' + T(a)) + boog(bx[1] + w / 2 + 20, y - 4, bx[2] + w / 2 - 20, y - 4, 26, K[0], '+ ' + T(b));
    if (n >= 1) s += '<g transform="translate(0 ' + (2 * y + 42) + ') scale(1 -1)">' + boog(bx[2] + w / 2 - 20, y - 4, bx[1] + w / 2 + 20, y - 4, 26, K[1], '') + '</g>' + tx((bx[1] + bx[2]) / 2 + w / 2, y + 86, '− ' + T(b), { k:K[1], vet:true });
    if (n >= 2) s += '<g transform="translate(0 ' + (2 * y + 42) + ') scale(1 -1)">' + boog(bx[1] + w / 2 - 20, y - 4, bx[0] + w / 2 + 20, y - 4, 26, K[1], '') + '</g>' + tx((bx[0] + bx[1]) / 2 + w / 2, y + 86, ': ' + T(a), { k:K[1], vet:true });
    return svg(570, 160, s, 'pijlenketting heen en terug', 560);
  }

  LEERROUTE.voeg('rekenen', [
    /* ================= klok en tijd ================= */
    { groep:{ id:'tijd-klok', niveau:'basis', domein:'meten', naam:'Klokkijken en tijd', uit:'De wijzerklok, de digitale klok, tijdsduur en de kalender. Bij tijd tel je niet tot 100 maar tot 60: daar gaat het vaak mis.' },
      doelen:[
        { id:'tijd-heel-half', naam:'Hele en halve uren', kort:'Kijk eerst naar de grote wijzer: bij de 12 is het heel, bij de 6 is het half',
          uit:'<p>Een klok heeft twee wijzers. De <b>grote wijzer</b> wijst de minuten aan. De <b>kleine wijzer</b> wijst het uur aan.</p><p>Staat de grote wijzer op de 12, dan is het een heel uur, bijvoorbeeld <b>drie uur</b>. Staat hij op de 6, dan is het <b>half</b>.</p><p>Let op: half vier is een half uur vóór vier uur. De kleine wijzer staat dan tussen de 3 en de 4.</p>',
          wanneer:'je een wijzerklok leest.',
          maak:function(R){
            var u = R.heel(1, 12), m = R.kies([0, 30]), half = m === 30, volg = u % 12 + 1, k = R.teken.klok(u, m);
            var st = [kstap(R, 'Waar staat de grote wijzer?', half ? 'bij de 6' : 'bij de 12', [half ? 'bij de 12' : 'bij de 6'], 'De grote wijzer is de lange. Wijst hij recht omhoog, dan staat hij bij de 12. Recht omlaag is de 6.')];
            if (half) st.push({ tekst:'Het is dus half. De kleine wijzer staat tussen de ' + u + ' en de ' + volg + '. Naar welk uur gaat hij toe?', antwoord:String(volg), hint:'Bij half kijk je vooruit: de kleine wijzer is op weg naar de ' + volg + '.', fout:F(u, 'Het uur ' + u + ' is al voorbij. Half kijkt vooruit naar het volgende uur.') });
            else st.push({ tekst:'Het is dus een heel uur. Bij welk getal staat de kleine wijzer?', antwoord:String(u), hint:'Kijk naar de korte, dikke wijzer. Die wijst precies een getal aan.' });
            st.push(kstap(R, 'Hoe laat is het?', tijdW(u, m), half ? ['half ' + uw(u), uw(u) + ' uur', uw(u + 1) + ' uur'] : ['half ' + uw(u), 'half ' + uw(u + 1), uw(u + 1) + ' uur'],
              half ? 'Half ' + uw(u + 1) + ' is een half uur vóór ' + uw(u + 1) + ' uur.' : 'De grote wijzer op de 12 en de kleine op de ' + u + ': precies ' + uw(u) + ' uur.'));
            return eindKeuze({ vraag:'klok ' + tS(u, m), vraagHtml:'Hoe laat is het?', beeld:k, zelfBeeld:k, stappen:st });
          } },
        { id:'tijd-kwart', naam:'Kwart over en kwart voor', kort:'Grote wijzer bij de 3 is kwart over, bij de 9 is kwart voor het volgende uur',
          uit:'<p>Een uur is 60 minuten. Een <b>kwartier</b> is een kwart daarvan: 15 minuten.</p><p>Staat de grote wijzer bij de 3, dan is het <b>kwart over</b>: een kwartier na het hele uur. Je noemt het uur dat net geweest is.</p><p>Staat de grote wijzer bij de 9, dan is het <b>kwart voor</b>: nog een kwartier tot het hele uur. Je noemt het uur dat eraan komt.</p>',
          wanneer:'de grote wijzer bij de 3 of de 9 staat.',
          maak:function(R){
            var u = R.heel(1, 12), over = R.heel(0, 1) === 1, m = over ? 15 : 45, volg = u % 12 + 1, k = R.teken.klok(u, m);
            var st = [
              kstap(R, 'Waar staat de grote wijzer?', over ? 'bij de 3' : 'bij de 9', [over ? 'bij de 9' : 'bij de 3', 'bij de 6'], 'Kijk naar de lange wijzer. Rechts staat de 3, links de 9.'),
              kstap(R, 'Is het kwart over of kwart voor?', over ? 'kwart over' : 'kwart voor', [over ? 'kwart voor' : 'kwart over'], 'Bij de 3 is de grote wijzer een kwart rond: kwart over. Bij de 9 moet hij nog een kwart: kwart voor.'),
              { tekst:over ? 'Kwart over: welk uur is net voorbij?' : 'Kwart voor: welk uur komt eraan?', antwoord:String(over ? u : volg), hint:'De kleine wijzer staat tussen de ' + u + ' en de ' + volg + '.',
                fout:F(over ? volg : u, over ? 'Dat uur komt nog. Bij kwart over noem je het uur dat net geweest is.' : 'Dat uur is al voorbij. Bij kwart voor noem je het uur dat eraan komt.') },
              kstap(R, 'Hoe laat is het?', tijdW(u, m), ['kwart over ' + uw(u), 'kwart over ' + uw(u + 1), 'kwart voor ' + uw(u), 'kwart voor ' + uw(u + 1)], (over ? 'Kwart over het uur dat net geweest is: ' : 'Kwart voor het uur dat eraan komt: ') + tijdW(u, m) + '.')
            ];
            return eindKeuze({ vraag:'klok ' + tS(u, m), vraagHtml:'Hoe laat is het?', beeld:k, zelfBeeld:k, stappen:st });
          } },
        { id:'tijd-rond-half', naam:'Vijf over half en tien voor half', kort:'Zoek eerst de halve, en kijk dan of je ervoor of erna zit',
          uit:'<p>Tussen twintig over en twintig voor het uur reken je in het Nederlands vanaf <b>half</b>. 3:20 is <b>tien voor half vier</b>, 3:35 is <b>vijf over half vier</b>.</p><p>Zo doe je het: zoek eerst de halve. De kleine wijzer is op weg naar de 4, dus het is rond half vier. Staat de grote wijzer nog vóór de 6? Dan is het voor half. Al voorbij de 6? Dan is het over half.</p>',
          wanneer:'de grote wijzer bij de 4, 5, 7 of 8 staat.',
          maak:function(R){
            var u = R.heel(1, 12), m = R.kies([20, 25, 35, 40]), voor = m < 30, d = Math.abs(30 - m), volg = u % 12 + 1, k = R.teken.klok(u, m);
            var st = [
              kstap(R, 'Zoek eerst de halve. Welk half uur is dichtbij?', 'half ' + uw(u + 1), ['half ' + uw(u), 'half ' + uw(u + 2)], 'De kleine wijzer is op weg naar de ' + volg + '. Dan is het rond half ' + uw(u + 1) + '.'),
              kstap(R, 'Staat de grote wijzer vóór de 6 of al voorbij de 6?', voor ? 'vóór de 6' : 'voorbij de 6', [voor ? 'voorbij de 6' : 'vóór de 6'], 'Bij half staat de grote wijzer op de 6. Nog niet zover? Dan is het vóór half. Verder dan de 6? Dan is het over half.'),
              { tekst:'Hoeveel minuten zit de grote wijzer van de 6 af?', antwoord:String(d), eenheid:'min', hint:'Van de 6 naar de ' + (voor ? 5 : 7) + ' is 5 minuten' + (d === 10 ? ', naar de ' + (voor ? 4 : 8) + ' is 10 minuten.' : '.') },
              kstap(R, 'Hoe laat is het?', tijdW(u, m), [tijdW(u, 60 - m), tijdW(u - 1, m), tijdW(u - 1, 60 - m)], d + ' minuten ' + (voor ? 'vóór' : 'over') + ' half ' + uw(u + 1) + '.')
            ];
            return eindKeuze({ vraag:'klok ' + tS(u, m), vraagHtml:'Hoe laat is het?', beeld:k, zelfBeeld:k, stappen:st });
          } },
        { id:'tijd-minuten', naam:'Minuten precies', kort:'Tel per getal 5 minuten en tel dan de kleine streepjes erbij',
          uit:'<p>Op de klok staan 60 kleine streepjes: één per minuut. Bij elk getal is de grote wijzer <b>5 minuten</b> verder.</p><p>Staat de grote wijzer net voorbij de 4, dan is het 4 × 5 = 20 minuten, plus de <b>kleine streepjes</b> erna. Drie streepjes verder is 23 minuten.</p><p>Het uur lees je af aan de kleine wijzer: neem het getal dat hij net voorbij is.</p>',
          wanneer:'de grote wijzer niet precies op een getal staat.',
          maak:function(R){
            var u = R.heel(1, 12), m; do { m = R.heel(6, 59); } while (m % 5 === 0);
            var g = Math.floor(m / 5), r = m - 5 * g, k = R.teken.klok(u, m), ant = tS(u, m);
            var st = [
              { tekst:'Welk uur is net voorbij? Kijk naar de kleine wijzer.', antwoord:String(u), hint:'De kleine wijzer staat tussen de ' + u + ' en de ' + (u % 12 + 1) + '. Neem het uur dat al geweest is.', fout:F(u % 12 + 1, 'Dat uur komt nog. Neem het getal dat de kleine wijzer net voorbij is.') },
              { tekst:'Voorbij welk getal staat de grote wijzer?', antwoord:String(g), hint:'Kijk welk getal de lange wijzer net gepasseerd is.' },
              { tekst:'Elk getal is 5 minuten. ' + g + ' × 5 =', antwoord:String(5 * g), eenheid:'min', hint:'Tel in sprongen van 5: 5, 10, 15, en zo verder.' },
              { tekst:'Tel de kleine streepjes erbij. Hoeveel minuten is het precies?', antwoord:String(m), eenheid:'min', hint:'Na de ' + g + ' ' + (r === 1 ? 'komt nog 1 klein streepje' : 'komen nog ' + r + ' kleine streepjes') + ': ' + (5 * g) + ' + ' + r + '.' },
              { tekst:'Schrijf de tijd met cijfers, als uur:minuten.', antwoord:ant, controle:tijdC(u, m, false), hint:'Eerst het uur (' + u + '), dan een dubbele punt, dan de minuten met twee cijfers (' + pad(m) + ').' }
            ];
            return { vraag:'klok ' + ant, vraagHtml:'Hoe laat is het?', context:'Schrijf de tijd als uur:minuten.', beeld:k, zelfBeeld:k, stappen:st, antwoord:ant, controle:tijdC(u, m, false) };
          } },
        { id:'tijd-24-uur', naam:'Digitaal en 24 uur', kort:'Na 12 uur \'s middags tel je 12 bij het uur: kwart over drie \'s middags is 15:15',
          uit:'<p>Een digitale klok telt door tot 24 uur. Na 12 uur \'s middags gaat hij verder met 13, 14, 15, en zo verder.</p><p>Van <b>24 uur naar de wijzerklok</b>: haal er 12 af. 15:40 is 3:40, dat is tien over half vier \'s middags. Je mag ook twintig voor vier zeggen.</p><p>Van <b>de wijzerklok naar 24 uur</b>: is het \'s middags of \'s avonds, tel er dan 12 bij. Acht uur \'s avonds is 20:00.</p>',
          wanneer:'je een tijd van een digitale klok, een rooster of een dienstregeling leest.',
          maak:function(R){
            var m = R.kies([0, 5, 10, 15, 20, 30, 40, 45, 50, 55]), h = R.kies([R.heel(1, 11), R.heel(13, 23), R.heel(13, 23)]), h12 = h > 12 ? h - 12 : h;
            var deel = h < 6 ? "'s nachts" : h < 12 ? "'s ochtends" : h < 18 ? "'s middags" : "'s avonds", DEL = ["'s nachts", "'s ochtends", "'s middags", "'s avonds"];
            var dagHint = 'Van 0 tot 6 uur is het nacht, van 6 tot 12 ochtend, van 12 tot 18 middag en van 18 tot 24 avond.';
            if (R.heel(0, 1)){
              var st = [
                h > 12 ? { tekst:'Na 12 uur haal je er 12 af. ' + h + ' − 12 =', antwoord:String(h12), hint:'De wijzerklok gaat maar tot 12. ' + h + ' − 10 = ' + (h - 10) + ', en dan nog 2 eraf.', fout:F(h, 'Op de wijzerklok gaan de uren maar tot 12. Haal er 12 af.') }
                       : { tekst:'Voor 12 uur blijft het uur hetzelfde. Welk uur is het op de wijzerklok?', antwoord:String(h), hint:'Het getal vóór de dubbele punt: ' + h + '.' },
                kstap(R, 'Welk dagdeel is ' + tS(h, m) + '?', deel, DEL, dagHint),
                kstap(R, 'Hoe zeg je ' + tS(h, m) + '?', tijdW(h12, m) + ' ' + deel, [tijdW(h12 + 1, m) + ' ' + deel, tijdW(h12 - 1, m) + ' ' + deel, tijdW(h12, m) + ' ' + DEL[(DEL.indexOf(deel) + 2) % 4]],
                  'Het is ' + h12 + ':' + pad(m) + ' op de wijzerklok' + (m >= 20 ? '. Vanaf twintig over kijk je naar het volgende uur: ' + uw(h12 + 1) + '.' : '.'))
              ];
              return eindKeuze({ vraag:tS(h, m), context:'Hoe zeg je deze tijd?', stappen:st });
            }
            var ant = tS(h, m);
            return { vraag:tijdW(h12, m) + ' ' + deel, context:'Schrijf deze tijd met cijfers, op de 24-uursklok.', antwoord:ant, controle:tijdC(h, m, true), stappen:[
              { tekst:'Welke tijd is dat op de wijzerklok? Schrijf uur:minuten.', antwoord:tS(h12, m), controle:tijdC(h12, m, false), hint:m >= 20 ? '"' + tijdW(h12, m) + '" is vóór ' + uw(h12 + 1) + ' uur. Het uur is dus nog ' + h12 + ', en het is ' + m + ' minuten over.' : 'Het uur is ' + h12 + ' en het is ' + m + ' minuten over.' },
              kstap(R, 'Het is ' + deel + '. Tel je er 12 bij?', h > 12 ? 'ja' : 'nee', [h > 12 ? 'nee' : 'ja'], 'Na 12 uur \'s middags tel je 12 bij het uur. \'s Nachts en \'s ochtends niet.'),
              { tekst:'Schrijf de tijd op de 24-uursklok.', antwoord:ant, controle:tijdC(h, m, true), hint:h > 12 ? h12 + ' + 12 = ' + h + '. De minuten blijven ' + pad(m) + '.' : 'Het uur blijft ' + h + '. De minuten zijn ' + pad(m) + '.' }
            ] };
          } },
        { id:'tijd-duur', naam:'Tijdsduur via het hele uur', kort:'Spring van de begintijd naar het hele uur, dan hele uren, dan de minuten erbij',
          uit:'<p>Hoe lang duurt het van 8:45 tot 11:20? Min-rekenen gaat bij tijd vaak mis, want een uur heeft 60 minuten en geen 100. Daarom <b>vul je aan</b> op een tijdlijn.</p><p>Spring eerst naar het <b>hele uur</b>: van 8:45 naar 9:00 is 15 minuten. Dan de hele uren: van 9:00 naar 11:00 is 2 uur. Dan de rest: van 11:00 naar 11:20 is 20 minuten.</p><p>Samen: 2 uur en 35 minuten.</p>',
          wanneer:'je wilt weten hoe lang iets duurt, van een begintijd tot een eindtijd.',
          maak:function(R){
            var h1 = R.heel(7, 13), m1 = 5 * R.heel(1, 11), h2 = h1 + R.heel(2, 4), m2 = 5 * R.heel(1, 11), van = h1 * 60 + m1, tot = h2 * 60 + m2, min = tot - van, mm = 60 - m1 + m2;
            var wat = R.kies(['De film duurt', 'De schooldag duurt', 'De fietstocht duurt', 'De treinreis duurt', 'Het toernooi duurt', 'De excursie duurt']);
            return { vraag:'van ' + tS(h1, m1) + ' tot ' + tS(h2, m2), context:wat + ' van ' + tS(h1, m1) + ' tot ' + tS(h2, m2) + '. Hoe lang is dat, in uren en minuten?',
              antwoord:duurT(min), controle:duurC(min, 'min'),
              beeld:function(n){ var sp = [];
                if (n >= 1) sp.push({ van:van, naar:(h1 + 1) * 60, tekst:'+' + (60 - m1) + ' min' });
                if (n >= 2) sp.push({ van:(h1 + 1) * 60, naar:h2 * 60, tekst:'+' + (h2 - h1 - 1) + ' uur' });
                if (n >= 3) sp.push({ van:h2 * 60, naar:tot, tekst:'+' + m2 + ' min' });
                return tijdLijn(R, van, tot, [van, (h1 + 1) * 60, h2 * 60, tot], sp); },
              stappen:[
                { tekst:'Van ' + tS(h1, m1) + ' naar het hele uur ' + tS(h1 + 1, 0) + ': hoeveel minuten?', antwoord:String(60 - m1), eenheid:'min', hint:'Vul ' + m1 + ' aan tot 60: ' + m1 + ' + … = 60.' },
                { tekst:'Van ' + tS(h1 + 1, 0) + ' naar ' + tS(h2, 0) + ': hoeveel uur?', antwoord:String(h2 - h1 - 1), eenheid:'uur', hint:'Tel de hele uren: van ' + (h1 + 1) + ' naar ' + h2 + '.' },
                { tekst:'Van ' + tS(h2, 0) + ' naar ' + tS(h2, m2) + ': hoeveel minuten?', antwoord:String(m2), eenheid:'min', hint:'Van het hele uur ' + h2 + ' naar ' + m2 + ' minuten erover.' },
                { tekst:'Tel alles op. Hoe lang duurt het? Schrijf bijvoorbeeld: 2 uur en 10 minuten.', antwoord:duurT(min), controle:duurC(min, 'min'),
                  hint:'De minuten: ' + (60 - m1) + ' + ' + m2 + ' = ' + mm + ' minuten' + (mm >= 60 ? ', dat is 1 uur en ' + (mm - 60) + ' minuten' : '') + '. Tel daar ' + (h2 - h1 - 1) + ' uur bij.' }
              ] };
          } },
        { id:'tijd-erbij', naam:'Tijdsduur erbij optellen', kort:'Tel eerst de hele uren erbij, spring dan naar het hele uur en tel de rest erbij',
          uit:'<p>De trein vertrekt om 9:35 en de reis duurt 1 uur en 40 minuten. Hoe laat kom je aan?</p><p>Tel eerst de <b>hele uren</b> erbij: 9:35 + 1 uur = 10:35. Spring dan naar het <b>hele uur</b>: van 10:35 naar 11:00 is 25 minuten. Van de 40 minuten blijven er dan 15 over. 11:00 + 15 minuten = <b>11:15</b>.</p>',
          wanneer:'je een begintijd hebt en weet hoe lang iets duurt.',
          maak:function(R){
            var h1 = R.heel(6, 16), m1 = 5 * R.heel(2, 11), H = R.heel(1, 3), M; do { M = 5 * R.heel(1, 11); } while (M <= 60 - m1);
            var rest = M - (60 - m1), hA = h1 + H + 1, van = h1 * 60 + m1, tot = hA * 60 + rest, ant = tS(hA, rest);
            var wie = R.kies(['De trein vertrekt om ', 'De bus vertrekt om ', 'Het vliegtuig vertrekt om ', 'Je fietst weg om ', 'De boot vertrekt om ']);
            return { vraag:tS(h1, m1) + ' + ' + duurT(H * 60 + M), context:wie + tS(h1, m1) + '. De reis duurt ' + duurT(H * 60 + M) + '. Hoe laat kom je aan?', antwoord:ant, controle:tijdC(hA, rest, true),
              beeld:function(n){ var sp = [];
                if (n >= 1) sp.push({ van:van, naar:van + H * 60, tekst:'+' + H + ' uur' });
                if (n >= 2) sp.push({ van:van + H * 60, naar:(hA) * 60, tekst:'+' + (60 - m1) + ' min' });
                if (n >= 4) sp.push({ van:hA * 60, naar:tot, tekst:'+' + rest + ' min' });
                return tijdLijn(R, van, tot, [van, van + H * 60, hA * 60, tot], sp); },
              stappen:[
                { tekst:'Eerst de hele uren erbij: ' + tS(h1, m1) + ' + ' + H + ' uur =', antwoord:tS(h1 + H, m1), controle:tijdC(h1 + H, m1, true), hint:'Het uur wordt ' + H + ' meer: ' + h1 + ' + ' + H + '. De minuten blijven ' + pad(m1) + '.' },
                { tekst:'Van ' + tS(h1 + H, m1) + ' naar het hele uur ' + tS(hA, 0) + ': hoeveel minuten?', antwoord:String(60 - m1), eenheid:'min', hint:'Vul ' + m1 + ' aan tot 60.' },
                { tekst:'Je had ' + M + ' minuten. Hoeveel blijven er over? ' + M + ' − ' + (60 - m1) + ' =', antwoord:String(rest), eenheid:'min', hint:'Haal de ' + (60 - m1) + ' minuten die je al gebruikt hebt van de ' + M + ' af.' },
                { tekst:tS(hA, 0) + ' + ' + rest + ' minuten =', antwoord:ant, controle:tijdC(hA, rest, true), hint:'Het hele uur ' + hA + ' en dan ' + rest + ' minuten erover: ' + hA + ':' + pad(rest) + '.' }
              ] };
          } },
        { id:'tijd-omrekenen', naam:'Uren en minuten omrekenen', kort:'Een uur is 60 minuten: een kwartier is 0,25 uur, een half uur 0,5 uur',
          uit:'<p>Een uur heeft <b>60 minuten</b>, geen 100. Daarom is 1 uur en 30 minuten niet 1,30 uur maar <b>1,5 uur</b>.</p><p>Onthoud: 15 minuten = 0,25 uur, 30 minuten = 0,5 uur, 45 minuten = 0,75 uur.</p><p>Zo is 2 uur en 15 minuten = 2,25 uur, en 90 minuten = 1 uur en 30 minuten = 1,5 uur.</p>',
          wanneer:'je met tijd moet rekenen, bijvoorbeeld bij snelheid of uurloon.',
          maak:function(R){
            var Q = R.kies([15, 30, 45]), H = R.heel(1, 4), dec = Q / 60, soort = R.heel(0, 2), N = 60 * H + Q;
            var deelHint = '60 minuten is 1 uur. 15 minuten is een kwart: 0,25. 30 minuten is een half: 0,5. 45 minuten is drie kwart: 0,75.';
            if (soort === 0) return { vraag:H + ' uur en ' + Q + ' minuten = … uur', eenheid:'uur', stappen:[
              { tekst:Q + ' minuten is welk deel van een uur? Schrijf als kommagetal.', antwoord:T(dec), hint:deelHint, fout:F('0,' + Q, 'Een uur heeft 60 minuten, geen 100. ' + Q + ' minuten is dus niet 0,' + Q + ' uur.') },
              { tekst:H + ' + ' + T(dec) + ' =', antwoord:metE(T(H + dec), 'uur'), eenheid:'uur', hint:'De hele uren blijven ' + H + '. Daar komt ' + T(dec) + ' bij.', fout:F(H + ',' + Q, 'Pas op: ' + Q + ' minuten is ' + T(dec) + ' uur, niet 0,' + Q + '.') } ] };
            if (soort === 1) return { vraag:T(H + dec) + ' uur = … minuten', eenheid:'min', stappen:[
              { tekst:H + ' uur = … minuten', antwoord:String(60 * H), eenheid:'min', hint:'Eén uur is 60 minuten. ' + H + ' × 60.' },
              { tekst:T(dec) + ' uur = … minuten', antwoord:String(Q), eenheid:'min', hint:deelHint, fout:F(Math.round(dec * 100), 'Een uur heeft 60 minuten, geen 100.') },
              { tekst:(60 * H) + ' + ' + Q + ' =', antwoord:metE(String(N), 'minuten', ['min']), eenheid:'min', hint:'Tel de minuten van de hele uren en van het stukje op.' } ] };
            return { vraag:N + ' minuten = … uur', eenheid:'uur', stappen:[
              { tekst:'Hoeveel hele uren passen in ' + N + ' minuten?', antwoord:String(H), eenheid:'uur', hint:'1 uur = 60 minuten, 2 uur = 120, 3 uur = 180, 4 uur = 240.' },
              { tekst:'Er blijven ' + Q + ' minuten over. Hoeveel uur is dat?', antwoord:T(dec), eenheid:'uur', hint:deelHint },
              { tekst:H + ' + ' + T(dec) + ' =', antwoord:metE(T(H + dec), 'uur'), eenheid:'uur', hint:'De hele uren en het stukje samen.', fout:F(H + ',' + Q, 'Pas op: ' + Q + ' minuten is ' + T(dec) + ' uur.') } ] };
          } },
        { id:'tijd-kalender', naam:'Kalender en data', kort:'Tel de dagen tot het eind van de maand, en dan de dagen van de nieuwe maand erbij',
          uit:'<p>Hoeveel dagen is het van 18 maart tot 6 april? Tel eerst tot het <b>eind van de maand</b>. Maart heeft 31 dagen: 31 − 18 = 13 dagen.</p><p>Tel dan de dagen van de nieuwe maand erbij: tot 6 april is nog 6 dagen. Samen <b>19 dagen</b>.</p><p>Hoeveel dagen heeft een maand? April, juni, september en november hebben er 30. Februari heeft er 28 (in een schrikkeljaar 29). De rest heeft 31.</p>',
          wanneer:'je wilt weten hoeveel dagen het nog is tot een datum.',
          maak:function(R){
            var m1 = R.heel(0, 10), D = MDAG[m1], d1 = R.heel(5, D - 2), d2 = R.heel(2, 25), tot = D - d1 + d2;
            return { vraag:'Hoeveel dagen tot ' + d2 + ' ' + MAAND[m1 + 1] + '?', context:'Vandaag is het ' + d1 + ' ' + MAAND[m1] + '. Het is geen schrikkeljaar.', eenheid:'dagen',
              beeld:function(n){ var sp = [];
                if (n >= 2) sp.push({ van:d1, naar:D, tekst:'+' + (D - d1) });
                if (n >= 3) sp.push({ van:D, naar:D + d2, tekst:'+' + d2 });
                return R.teken.lijn({ van:d1, tot:D + d2, labels:[d1, D, D + d2], sprongen:sp, stip:[d1], nieuw:true, aria:'dagen op een lijn', toon:function(x){ return x <= D ? x + ' ' + MKORT[m1] : (x - D) + ' ' + MKORT[m1 + 1]; } }); },
              stappen:[
                { tekst:'Hoeveel dagen heeft ' + MAAND[m1] + '?', antwoord:String(D), eenheid:'dagen', hint:'April, juni, september en november hebben 30 dagen. Februari heeft er 28. De rest heeft 31.' },
                { tekst:'Van ' + d1 + ' ' + MAAND[m1] + ' tot het eind van de maand: ' + D + ' − ' + d1 + ' =', antwoord:String(D - d1), eenheid:'dagen', hint:'Haal ' + d1 + ' van ' + D + ' af.' },
                { tekst:'Van ' + D + ' ' + MAAND[m1] + ' tot ' + d2 + ' ' + MAAND[m1 + 1] + ': hoeveel dagen?', antwoord:String(d2), eenheid:'dagen', hint:'De nieuwe maand begint bij 1. Tot de ' + d2 + 'e zijn het ' + d2 + ' dagen.' },
                { tekst:(D - d1) + ' + ' + d2 + ' =', antwoord:metE(String(tot), 'dagen'), eenheid:'dagen', hint:'Tel de dagen van de twee maanden op.' }
              ] };
          } }
      ] },

    /* ================= geld ================= */
    { groep:{ id:'geld-basis', niveau:'1F', domein:'meten', naam:'Geld', uit:'Rekenen in de winkel: wisselgeld, afronden, schatten en de prijs van meer stuks of van één stuk.' },
      doelen:[
        { id:'geld-aanvullen', naam:'Wisselgeld door aan te vullen', kort:'Tel van de prijs omhoog naar het bedrag dat je betaalt, in handige sprongen',
          uit:'<p>Je koopt iets van € 13,65 en betaalt met € 20. Hoeveel krijg je terug? Een kassière rekent niet min, maar <b>vult aan</b>.</p><p>Van € 13,65 naar € 13,70 is 5 cent. Naar € 14,00 is 30 cent. Naar € 20,00 is 6 euro. Samen: <b>€ 6,35</b>.</p><p>Zo hoef je nooit te lenen bij het min-rekenen.</p>',
          wanneer:'je wisselgeld uitrekent of iets aanvult tot een rond bedrag.',
          maak:function(R){
            var bet = R.kies([5, 10, 20, 20, 50]), p; do { p = R.heel(Math.max(101, (bet - 9) * 100), bet * 100 - 120); } while (p % 10 === 0 || p % 100 >= 90);
            var c10 = Math.ceil(p / 10) * 10, c100 = Math.ceil(p / 100) * 100, a = c10 - p, b = c100 - c10, c = bet * 100 - c100, tot = bet * 100 - p;
            function cent(x){ return [g2(x / 100), x + ' cent', x + 'ct', x + ' ct']; }
            return { vraag:'van ' + G(p / 100) + ' naar ' + G(bet), context:'Je betaalt ' + G(p / 100) + ' met een briefje van ' + G(bet).replace(',00', '') + '. Hoeveel wisselgeld krijg je?',
              beeld:function(n){ return sprongBeeld([g2(p / 100), g2(c10 / 100), g2(c100 / 100), g2(bet)], ['+' + g2(a / 100), '+' + g2(b / 100), '+' + c / 100], n, 'aanvullen van ' + g2(p / 100) + ' naar ' + bet + ' euro'); },
              stappen:[
                { tekst:'Van ' + G(p / 100) + ' naar ' + G(c10 / 100) + ': + …', antwoord:cent(a), hint:'Vul de centen aan tot een rond aantal van 10: ' + (p % 10) + ' + … = 10 cent.' },
                { tekst:'Van ' + G(c10 / 100) + ' naar ' + G(c100 / 100) + ': + …', antwoord:cent(b), hint:'Vul aan tot de hele euro: ' + (c10 % 100) + ' cent + … = 100 cent.' },
                { tekst:'Van ' + G(c100 / 100) + ' naar ' + G(bet) + ': + …', antwoord:String(c / 100), hint:'Tel de hele euro\'s: van ' + c100 / 100 + ' naar ' + bet + '.' },
                { tekst:'Tel de sprongen op: ' + G(a / 100) + ' + ' + G(b / 100) + ' + ' + G(c / 100) + ' =', antwoord:G(tot / 100), hint:'Eerst de centen: ' + a + ' + ' + b + ' = ' + (a + b) + ' cent. Dan de ' + (c / 100) + ' euro erbij.' }
              ] };
          } },
        { id:'geld-afronden', naam:'Optellen en afronden op 5 cent', kort:'Tel de bedragen op en rond contant af op 5 cent: 1 en 2 naar beneden, 3 en 4 naar 5',
          uit:'<p>Betaal je <b>contant</b>, dan rondt de kassa het totaal af op <b>5 cent</b>. Kijk naar het laatste cijfer:</p><p>1 of 2: naar beneden, naar 0. 3 of 4: naar boven, naar 5. 6 of 7: naar beneden, naar 5. 8 of 9: naar boven, naar 0.</p><p>Voorbeeld: € 4,73 wordt € 4,75. € 4,72 wordt € 4,70.</p>',
          wanneer:'je contant betaalt in de winkel.',
          maak:function(R){
            var a, b, c, tot; do { a = R.heel(51, 699); b = R.heel(51, 699); c = R.heel(21, 399); tot = a + b + c; } while (tot % 5 === 0);
            var r = Math.round(tot / 5) * 5, ld = tot % 10, lo = Math.floor(tot / 10) * 10;
            var hint = 'Het laatste cijfer is ' + ld + '. ' + (ld <= 2 ? 'Dat ligt dichter bij 0: naar beneden.' : ld <= 4 ? 'Dat ligt dichter bij 5: naar boven, naar 5.' : ld <= 7 ? 'Dat ligt dichter bij 5: naar beneden, naar 5.' : 'Dat ligt dichter bij 10: naar boven.');
            return { vraag:G(a / 100) + ' + ' + G(b / 100) + ' + ' + G(c / 100), context:'Je betaalt contant. De kassa rondt af op 5 cent. Hoeveel betaal je?',
              beeld:function(n){ return R.teken.lijn({ van:lo, tot:lo + 10, streep:1, labels:[lo, lo + 5, lo + 10], stip:n >= 2 ? [tot] : [], sprongen:n >= 3 ? [{ van:tot, naar:r, tekst:'afronden' }] : [], nieuw:true, aria:'afronden op 5 cent', toon:function(x){ return g2(x / 100); } }); },
              stappen:[
                { tekst:G(a / 100) + ' + ' + G(b / 100) + ' =', antwoord:G((a + b) / 100), hint:'Eerst de euro\'s, dan de centen. 100 cent is 1 euro erbij.' },
                { tekst:G((a + b) / 100) + ' + ' + G(c / 100) + ' =', antwoord:G(tot / 100), hint:'Eerst de euro\'s, dan de centen. 100 cent is 1 euro erbij.' },
                { tekst:'Rond ' + G(tot / 100) + ' af op 5 cent:', antwoord:G(r / 100), hint:hint, fout:F(g2(tot / 100), 'Dat is het precieze bedrag. Contant rond je af op 5 cent.') }
              ] };
          } },
        { id:'geld-schatten', naam:'Schatten in de winkel', kort:'Rond elke prijs af op hele euro\'s en tel die op',
          uit:'<p>Heb je genoeg geld bij je? Dat hoef je niet precies uit te rekenen. Je <b>schat</b>.</p><p>Rond elke prijs af op <b>hele euro\'s</b>: € 2,89 wordt € 3, € 1,15 wordt € 1. Minder dan 50 cent gaat naar beneden, 50 cent of meer naar boven.</p><p>Tel daarna de ronde bedragen op. Dat gaat makkelijk uit je hoofd.</p>',
          wanneer:'je snel wilt weten ongeveer hoeveel iets samen kost.',
          maak:function(R){
            var DING = ['een brood', 'kaas', 'melk', 'appels', 'een pak sap', 'koekjes', 'pasta', 'tomaten', 'rijst', 'chips', 'yoghurt', 'eieren'];
            var d = R.hussel(DING).slice(0, 3), p = d.map(function(){ var c; do { c = R.heel(5, 95); } while (c > 40 && c < 60); return R.heel(1, 6) * 100 + c; });
            var rd = p.map(function(x){ return Math.round(x / 100); }), som2 = rd[0] + rd[1] + rd[2];
            function st(i){ var c = p[i] % 100; return { tekst:'Rond ' + G(p[i] / 100) + ' (' + d[i] + ') af op hele euro\'s:', antwoord:String(rd[i]), hint:c < 50 ? c + ' cent is minder dan 50: naar beneden.' : c + ' cent is meer dan 50: naar boven.' }; }
            return { vraag:G(p[0] / 100) + ' + ' + G(p[1] / 100) + ' + ' + G(p[2] / 100) + ' ≈', context:'Je koopt ' + d[0] + ', ' + d[1] + ' en ' + d[2] + '. Ongeveer hoeveel moet je betalen? Schat in hele euro\'s.',
              stappen:[st(0), st(1), st(2),
                { tekst:rd[0] + ' + ' + rd[1] + ' + ' + rd[2] + ' =', antwoord:String(som2), hint:'Tel de ronde bedragen op.', fout:F(g2((p[0] + p[1] + p[2]) / 100), 'Dat is precies uitgerekend. Bij schatten tel je de afgeronde bedragen op.') }] };
          } },
        { id:'geld-keer', naam:'Prijs per stuk keer aantal', kort:'Doe eerst de hele euro\'s keer het aantal, dan de centen, en tel op',
          uit:'<p>Je koopt 6 schriften van € 2,45. Splits de prijs: eerst de <b>hele euro\'s</b>, dan de <b>centen</b>.</p><p>6 × € 2 = € 12. 6 × 45 cent = 270 cent = € 2,70. Samen: <b>€ 14,70</b>.</p>',
          wanneer:'je meer dezelfde dingen koopt.',
          maak:function(R){
            var n = R.heel(3, 9), p; do { p = 5 * R.heel(21, 199); } while (p % 100 === 0);
            var e = Math.floor(p / 100), c = p % 100, wat = R.kies(['schriften', 'pennen', 'broodjes', 'kaartjes', 'bekers', 'tijdschriften', 'zakken chips', 'pakken sap']);
            return { vraag:n + ' × ' + G(p / 100), context:'Je koopt ' + n + ' ' + wat + ' van ' + G(p / 100) + ' per stuk.',
              stappen:[
                { tekst:'Eerst de hele euro\'s: ' + n + ' × € ' + e + ' =', antwoord:String(n * e), hint:n + ' keer ' + e + ' euro.' },
                { tekst:'Dan de centen: ' + n + ' × ' + G(c / 100) + ' =', antwoord:G(n * c / 100), hint:n + ' × ' + c + ' cent = ' + (n * c) + ' cent. 100 cent is € 1.', fout:F(n * c, 'Dat is in centen. Schrijf het in euro\'s: 100 cent is € 1.') },
                { tekst:'€ ' + (n * e) + ' + ' + G(n * c / 100) + ' =', antwoord:G(n * p / 100), hint:'Tel de euro\'s en de centen samen.' }
              ] };
          } },
        { id:'geld-een', naam:'De prijs van één stuk', kort:'Reken het totaal om naar centen en deel door het aantal',
          uit:'<p>4 pakken sap kosten samen € 5,40. Wat kost één pak? Je <b>deelt</b> door 4.</p><p>Delen met een komma is lastig. Reken daarom eerst in <b>centen</b>: € 5,40 = 540 cent. 540 : 4 = 135 cent. Dat is <b>€ 1,35</b>.</p>',
          wanneer:'je weet wat een paar dingen samen kosten en de prijs van één wilt weten.',
          maak:function(R){
            var n = R.heel(2, 8), p = 5 * R.heel(11, 199), tot = n * p, wat = R.kies([['schriften', 'schrift'], ['pennen', 'pen'], ['broodjes', 'broodje'], ['kaartjes', 'kaartje'], ['bekers', 'beker'], ['zakken chips', 'zak chips'], ['pakken sap', 'pak sap']]);
            return { vraag:G(tot / 100) + ' : ' + n, context:n + ' ' + wat[0] + ' kosten samen ' + G(tot / 100) + '. Wat kost één ' + wat[1] + '?',
              stappen:[
                { tekst:'Reken in centen: ' + G(tot / 100) + ' = … cent', antwoord:String(tot), eenheid:'cent', hint:'€ 1 is 100 cent. Haal de komma weg.' },
                { tekst:tot + ' : ' + n + ' =', antwoord:String(p), eenheid:'cent', hint:'Splits ' + tot + ' in stukken die makkelijk door ' + n + ' gaan.' },
                { tekst:p + ' cent = € …', antwoord:G(p / 100), hint:'100 cent is € 1. Zet de komma twee plaatsen naar links.', fout:F(p, 'Dat is in centen. Schrijf het in euro\'s.') }
              ] };
          } }
      ] },

    /* ================= lengte, gewicht en inhoud ================= */
    { groep:{ id:'maat-om', niveau:'1F', domein:'meten', naam:'Lengte, gewicht en inhoud', uit:'De maten kennen, schatten en omrekenen met de trap van het metriek stelsel. Elke trede is keer 10 of gedeeld door 10.' },
      doelen:[
        { id:'maat-schatten', naam:'Maten kennen en schatten', kort:'Vergelijk met iets wat je kent: een grote stap, een pak suiker, een pak melk',
          uit:'<p>Om een maat te schatten heb je een <b>ijkpunt</b> nodig: iets waarvan je de maat kent.</p><p>Lengte: een grote stap is ongeveer <b>1 meter</b>. Gewicht: een pak suiker is <b>1 kilo</b>. Inhoud: een pak melk is <b>1 liter</b>.</p><p>Vraag jezelf af: is het meer of minder dan het ijkpunt? Hoeveel meer of minder?</p>',
          wanneer:'je wilt weten of een maat kan kloppen.',
          maak:function(R){
            var it = R.kies(SCHAT), ijk = IJK[it[0]], meer = /km|ton/.test(it[2]) || (/ m$/.test(it[2]) && parseFloat(it[2].replace(',', '.')) > 1) || (/kg$/.test(it[2]) && parseFloat(it[2]) > 1) || (/ l$/.test(it[2]) && parseFloat(it[2]) > 1);
            return eindKeuze({ vraag:it[1], context:'Schat. Wat past het best?', stappen:[
              kstap(R, 'Is het meer of minder dan ' + ijk[0] + '?', meer ? 'meer' : 'minder', [meer ? 'minder' : 'meer'], ijk[1]),
              kstap(R, 'Wat past het best bij ' + it[1] + '?', it[2], it[3], it[4]) ] });
          } },
        { id:'maat-lengte', naam:'Lengte omrekenen met de trap', kort:'km, hm, dam, m, dm, cm, mm: elke trede naar beneden is × 10',
          uit:'<p>De maten voor lengte staan op een <b>trap</b>: km, hm, dam, m, dm, cm, mm. Tussen twee treden zit steeds <b>10</b>.</p><p>Ga je de trap <b>af</b> naar een kleinere maat, dan wordt het getal groter: per trede × 10. Ga je de trap <b>op</b>, dan wordt het getal kleiner: per trede : 10.</p><p>Van m naar cm is 2 treden: × 100. Dus 3 m = 300 cm.</p>',
          wanneer:'je een lengte in een andere maat moet zetten.',
          maak:function(R){ return trapMaak(R, TRAP.lengte, [['km', 'm'], ['m', 'cm'], ['m', 'mm'], ['cm', 'mm'], ['m', 'dm'], ['dm', 'cm']], 10); } },
        { id:'maat-gewicht', naam:'Gewicht omrekenen', kort:'kg, hg, dag, g, dg, cg, mg op de trap, en 1 ton = 1000 kg',
          uit:'<p>Gewicht heeft ook een trap: <b>kg, hg, dag, g, dg, cg, mg</b>. Elke trede is weer × 10 of : 10.</p><p>Van kg naar g is 3 treden: × 1000. Dus 2 kg = 2000 g. Van mg naar g is 3 treden omhoog: : 1000.</p><p>Zware dingen weeg je in <b>ton</b>: 1 ton = 1000 kg. Die staat niet op de trap.</p>',
          wanneer:'je een gewicht in een andere maat moet zetten.',
          maak:function(R){
            if (R.heel(1, 4) > 1) return trapMaak(R, TRAP.gewicht, [['kg', 'g'], ['g', 'mg'], ['kg', 'hg'], ['g', 'cg']], 10);
            var omlaag = R.heel(0, 1) === 1, q = R.heel(2, 30), v = omlaag ? q : q * 1000, uit = omlaag ? q * 1000 : q, van = omlaag ? 'ton' : 'kg', naar = omlaag ? 'kg' : 'ton';
            return { vraag:T(v) + ' ' + van + ' = … ' + naar, eenheid:naar, stappen:[
              { tekst:'1 ton = … kg', antwoord:'1000', hint:'Een ton is duizend kilo, zo zwaar als een kleine auto.' },
              kstap(R, 'Van ' + van + ' naar ' + naar + ': keer of gedeeld door 1000?', omlaag ? '× 1000' : ': 1000', [omlaag ? ': 1000' : '× 1000'], omlaag ? 'Een kilo is kleiner dan een ton. Er gaan er dus meer in: het getal wordt groter.' : 'Een ton is groter dan een kilo. Er gaan er dus minder in: het getal wordt kleiner.'),
              { tekst:T(v) + (omlaag ? ' × ' : ' : ') + '1000 =', antwoord:metE(T(uit), naar), eenheid:naar, hint:omlaag ? 'Zet drie nullen erachter.' : 'Haal drie nullen weg.' } ] };
          } },
        { id:'maat-inhoud', naam:'Inhoud omrekenen', kort:'kl, hl, dal, l, dl, cl, ml: van liter naar milliliter is × 1000',
          uit:'<p>Voor inhoud gebruik je de trap <b>kl, hl, dal, l, dl, cl, ml</b>. De liter staat in het midden.</p><p>Van l naar dl is 1 trede: × 10. Van l naar cl is 2 treden: × 100. Van l naar ml is 3 treden: × 1000.</p><p>Een blikje van 33 cl is dus 330 ml.</p>',
          wanneer:'je een hoeveelheid vloeistof in een andere maat moet zetten.',
          maak:function(R){ return trapMaak(R, TRAP.inhoud, [['l', 'ml'], ['l', 'dl'], ['l', 'cl'], ['dl', 'ml'], ['cl', 'ml'], ['dl', 'cl']], 10); } },
        { id:'maat-komma', naam:'Omrekenen met kommagetallen', kort:'Per trede schuift de komma één plaats: naar rechts bij ×, naar links bij :',
          uit:'<p>Bij een kommagetal werkt de trap hetzelfde. Bij × 10 schuift de <b>komma</b> één plaats naar rechts, bij × 100 twee plaatsen.</p><p>1,25 m = … cm: van m naar cm is × 100. De komma gaat 2 plaatsen naar rechts: <b>125 cm</b>.</p><p>350 ml = … l: van ml naar l is : 1000. De komma gaat 3 plaatsen naar links: <b>0,35 l</b>.</p>',
          wanneer:'er een komma in het getal staat of komt.',
          maak:function(R){
            var soort = R.kies(['lengte', 'gewicht', 'inhoud']), paren = { lengte:[['km', 'm'], ['m', 'cm'], ['m', 'mm'], ['cm', 'mm']], gewicht:[['kg', 'g'], ['g', 'mg']], inhoud:[['l', 'ml'], ['l', 'cl'], ['l', 'dl']] }[soort];
            var lijst = TRAP[soort], p = R.kies(paren), omlaag = R.heel(0, 1) === 1, van = omlaag ? p[0] : p[1], naar = omlaag ? p[1] : p[0];
            var k = Math.abs(lijst.indexOf(naar) - lijst.indexOf(van)), f = Math.pow(10, k), heel = R.heel(0, 9), fr = f === 10 ? R.heel(1, 9) : R.heel(1, 99) * (f / 100);
            if (!heel && fr * 10 < f) fr = f / 2;
            var groot = heel + fr / f, klein = heel * f + fr, v = omlaag ? groot : klein, uit = omlaag ? klein : groot;
            return { vraag:T(v) + ' ' + van + ' = … ' + naar, eenheid:naar, beeld:function(n){ return trap(lijst, van, naar, 10, n >= 1); }, stappen:[
              { tekst:'Van ' + van + ' naar ' + naar + ': hoeveel treden?', antwoord:String(k), hint:'Zoek ' + van + ' en ' + naar + ' op de trap en tel de stappen ertussen.' },
              kstap(R, 'Is het keer of gedeeld door ' + f + '?', (omlaag ? '× ' : ': ') + f, [(omlaag ? ': ' : '× ') + f], omlaag ? 'Naar een kleinere maat: het getal wordt groter, dus keer.' : 'Naar een grotere maat: het getal wordt kleiner, dus gedeeld door.'),
              { tekst:T(v) + (omlaag ? ' × ' : ' : ') + f + ' =', antwoord:metE(T(uit), naar), eenheid:naar, hint:'Schuif de komma ' + k + (k === 1 ? ' plaats' : ' plaatsen') + ' naar ' + (omlaag ? 'rechts' : 'links') + '.',
                fout:F(T(omlaag ? v / f : v * f), 'De komma ging de verkeerde kant op.') } ] };
          } },
        { id:'maat-vergelijk', naam:'Maten vergelijken', kort:'Zet eerst beide maten in dezelfde eenheid, dan pas vergelijken',
          uit:'<p>Wat is meer: 0,6 l of 550 ml? Het getal 550 lijkt groter, maar de maten zijn verschillend. Je kunt ze zo niet vergelijken.</p><p>Zet ze eerst in <b>dezelfde maat</b>: 0,6 l = 600 ml. Nu zie je het: 600 ml is meer dan 550 ml.</p>',
          wanneer:'twee hoeveelheden in verschillende maten staan.',
          maak:function(R){
            var p = R.kies([['l', 'ml', 1000, 'Wat is meer?', 'even veel'], ['m', 'cm', 100, 'Wat is langer?', 'even lang'], ['kg', 'g', 1000, 'Wat is zwaarder?', 'even zwaar'], ['km', 'm', 1000, 'Wat is verder?', 'even ver'], ['l', 'cl', 100, 'Wat is meer?', 'even veel'], ['m', 'mm', 1000, 'Wat is langer?', 'even lang']]);
            var a = R.heel(2, 30) / 10, aS = Math.round(a * p[2]), wie = R.heel(0, 6), B = wie === 0 ? aS : aS + (wie % 2 ? -1 : 1) * p[2] * R.kies([0.05, 0.1, 0.25]);
            if (B <= 0) B = aS + p[2] / 10;
            var A1 = T(a) + ' ' + p[0], B1 = T(B) + ' ' + p[1], goed = B === aS ? p[4] : aS > B ? A1 : B1;
            return eindKeuze({ vraag:A1 + ' of ' + B1 + '?', context:p[3], stappen:[
              { tekst:'Maak eerst dezelfde maat: ' + A1 + ' = … ' + p[1], antwoord:metE(T(aS), p[1]), eenheid:p[1], hint:'Van ' + p[0] + ' naar ' + p[1] + ' is × ' + p[2] + '.' },
              kstap(R, p[3], goed, [A1, B1, p[4]], 'Vergelijk ' + T(aS) + ' ' + p[1] + ' met ' + T(B) + ' ' + p[1] + '.') ] });
          } },
        { id:'maat-optellen', naam:'Maten optellen', kort:'Maak eerst dezelfde maat en tel dan op',
          uit:'<p>Een plank van 1,2 m en een plank van 45 cm. Hoe lang samen? Je mag 1,2 en 45 niet zomaar optellen: het zijn <b>verschillende maten</b>.</p><p>Maak eerst <b>dezelfde maat</b>: 1,2 m = 120 cm. Dan: 120 cm + 45 cm = <b>165 cm</b>.</p>',
          wanneer:'je maten in verschillende eenheden bij elkaar optelt.',
          maak:function(R){
            var p = R.kies([['m', 'cm', 100], ['kg', 'g', 1000], ['l', 'ml', 1000], ['km', 'm', 1000], ['l', 'cl', 100]]);
            var a = p[2] === 100 ? R.heel(11, 39) / 10 : R.heel(101, 399) / 100, aS = Math.round(a * p[2]), b = R.heel(15, Math.round(p[2] * 0.9));
            return { vraag:T(a) + ' ' + p[0] + ' + ' + b + ' ' + p[1] + ' = … ' + p[1], eenheid:p[1], stappen:[
              { tekst:'Maak eerst dezelfde maat: ' + T(a) + ' ' + p[0] + ' = … ' + p[1], antwoord:metE(T(aS), p[1]), eenheid:p[1], hint:'Van ' + p[0] + ' naar ' + p[1] + ' is × ' + p[2] + '. Schuif de komma ' + (String(p[2]).length - 1) + ' plaatsen naar rechts.' },
              { tekst:T(aS) + ' + ' + b + ' =', antwoord:metE(T(aS + b), p[1]), eenheid:p[1], hint:'Nu zijn het allebei ' + p[1] + '. Tel ze op.', fout:F(T(a + b), 'Je telde ' + p[0] + ' en ' + p[1] + ' zomaar op. Gebruik de ' + T(aS) + ' ' + p[1] + '.') } ] };
          } }
      ] },

    /* ================= omtrek en oppervlakte ================= */
    { groep:{ id:'opp-basis', niveau:'1F', domein:'meten', naam:'Omtrek en oppervlakte', uit:'De omtrek is de rand eromheen, de oppervlakte is het vlak binnenin. Ze lijken op elkaar, maar je rekent ze heel anders uit.' },
      doelen:[
        { id:'opp-omtrek', naam:'Omtrek: alle zijden samen', kort:'Tel alle zijden op; bij een rechthoek zijn de overkanten even lang',
          uit:'<p>De <b>omtrek</b> is de lengte van de rand: alle zijden bij elkaar opgeteld. Stel je voor dat je een touw om de figuur legt.</p><p>Bij een rechthoek zijn de <b>overkanten even lang</b>. Een rechthoek van 8 bij 5 heeft twee zijden van 8 en twee van 5: 16 + 10 = 26.</p>',
          wanneer:'je de lengte van een rand nodig hebt: een hek, een lijst, een rondje lopen.',
          maak:function(R){
            var l = R.heel(4, 15), b = R.heel(2, l - 1), e = R.kies(['cm', 'm']);
            return { vraag:'rechthoek van ' + l + ' ' + e + ' bij ' + b + ' ' + e, context:'Bereken de omtrek.', eenheid:e,
              beeld:function(n){ return rechthoek(l, b, e, { boven:n >= 1, rechts:n >= 2 }); },
              stappen:[
                { tekst:'De twee lange zijden: 2 × ' + l + ' =', antwoord:metE(2 * l, e), eenheid:e, hint:'De overkant is ook ' + l + ' ' + e + '.' },
                { tekst:'De twee korte zijden: 2 × ' + b + ' =', antwoord:metE(2 * b, e), eenheid:e, hint:'De overkant is ook ' + b + ' ' + e + '.' },
                { tekst:(2 * l) + ' + ' + (2 * b) + ' =', antwoord:metE(2 * l + 2 * b, e), eenheid:e, hint:'Alle vier de zijden samen.', fout:F(l * b, 'Dat is de oppervlakte. Voor de omtrek tel je alle zijden op.', l + b, 'Je telde maar twee zijden. Een rechthoek heeft er vier.') }
              ] };
          } },
        { id:'opp-hokjes', naam:'Oppervlakte met hokjes tellen', kort:'Tel de hokjes die binnen de figuur vallen; slim tellen met rijen',
          uit:'<p>De <b>oppervlakte</b> is hoeveel ruimte een figuur inneemt op het platte vlak. Je meet het in <b>hokjes</b>. Is elk hokje 1 cm bij 1 cm, dan heet dat 1 <b>cm²</b> (vierkante centimeter).</p><p>Tel slim: een rij van 6 hokjes, 3 rijen hoog, is 3 × 6 = 18 hokjes. Een figuur met een hoek kun je in twee stukken tellen.</p>',
          wanneer:'de figuur op een rooster staat.',
          maak:function(R){
            var w1 = R.heel(4, 8), h1 = R.heel(2, 4), w2 = R.heel(2, w1 - 1), h2 = R.heel(1, 3), tot = w1 * h1 + w2 * h2;
            function pl(){
              var c = 26, x0 = 20, y0 = 16, Wc = w1 + 2, Hc = h1 + h2 + 2, s = '', i, j;
              for (i = 0; i <= Wc; i++) s += ln(x0 + i * c, y0, x0 + i * c, y0 + Hc * c, { w:1, op:0.25 });
              for (j = 0; j <= Hc; j++) s += ln(x0, y0 + j * c, x0 + Wc * c, y0 + j * c, { w:1, op:0.25 });
              for (i = 0; i < w1; i++) for (j = 0; j < h1; j++) s += rc(x0 + (i + 1) * c, y0 + (Hc - 1 - h1 + j) * c, c, c, { f:K[0], fo:0.5, w:1, s:'var(--kaart)' });
              for (i = 0; i < w2; i++) for (j = 0; j < h2; j++) s += rc(x0 + (i + 1) * c, y0 + (Hc - 1 - h1 - h2 + j) * c, c, c, { f:K[2], fo:0.6, w:1, s:'var(--kaart)' });
              return svg(x0 * 2 + Wc * c, y0 * 2 + Hc * c, s, 'figuur van hokjes', 380);
            }
            var p = pl();
            return { vraag:'hokjes ' + w1 + 'x' + h1 + ' en ' + w2 + 'x' + h2, vraagHtml:'Hoeveel cm² is deze figuur?', context:'Elk hokje is 1 cm².', eenheid:'cm²', beeld:p, zelfBeeld:p,
              stappen:[
                { tekst:'Het onderste, blauwe deel: hoeveel hokjes?', antwoord:String(w1 * h1), hint:'Een rij heeft ' + w1 + ' hokjes. Er zijn ' + h1 + ' rijen: ' + h1 + ' × ' + w1 + '.' },
                { tekst:'Het bovenste, oranje deel: hoeveel hokjes?', antwoord:String(w2 * h2), hint:'Een rij heeft ' + w2 + ' hokjes. Er ' + (h2 === 1 ? 'is 1 rij.' : 'zijn ' + h2 + ' rijen: ' + h2 + ' × ' + w2 + '.') },
                { tekst:'Samen: ' + (w1 * h1) + ' + ' + (w2 * h2) + ' =', antwoord:metE(tot, 'cm²', ['hokjes']), eenheid:'cm²', hint:'Tel de twee delen op.' }
              ] };
          } },
        { id:'opp-rechthoek', naam:'Oppervlakte van een rechthoek', kort:'Lengte × breedte, en het antwoord in vierkante maten zoals m²',
          uit:'<p>Hokjes tellen hoeft niet. Bij een rechthoek reken je: <b>lengte × breedte</b>. Een rechthoek van 7 m bij 4 m heeft 4 rijen van 7 vierkante meters: 28 m².</p><p>Let op de <b>eenheid</b>. Omtrek is een lengte, in m. Oppervlakte is een vlak, in <b>m²</b>.</p>',
          wanneer:'je de oppervlakte van een rechthoekige vloer, tuin of muur zoekt.',
          maak:function(R){
            var l = R.heel(4, 20), b = R.heel(2, 12), e = R.kies(['cm', 'm']);
            return { vraag:'rechthoek van ' + l + ' ' + e + ' bij ' + b + ' ' + e, context:'Bereken de oppervlakte.', eenheid:e + '²',
              beeld:rechthoek(l, b, e, { hokjes:true }),
              stappen:[
                kstap(R, 'In welke eenheid meet je deze oppervlakte?', e + '²', [e, e + '³'], 'Oppervlakte meet je in vierkantjes: ' + e + '². ' + e + ' is voor lengte en ' + e + '³ voor inhoud.'),
                { tekst:'Lengte × breedte: ' + l + ' × ' + b + ' =', antwoord:metE(l * b, e + '²'), eenheid:e + '²', hint:b + ' rijen van ' + l + ' hokjes.', fout:F(2 * l + 2 * b, 'Dat is de omtrek. Oppervlakte is lengte × breedte.') }
              ] };
          } },
        { id:'opp-welke', naam:'Omtrek of oppervlakte kiezen', kort:'Gaat het om de rand? Omtrek. Gaat het om het vlak? Oppervlakte',
          uit:'<p>In een verhaaltje staat niet altijd of je de omtrek of de oppervlakte nodig hebt. Vraag jezelf af:</p><p>Gaat het om de <b>rand</b> eromheen, zoals een hek, een lijst of een rondje? Dan is het de <b>omtrek</b>, in m.</p><p>Gaat het om het <b>vlak</b> zelf, zoals tegels, verf of gras? Dan is het de <b>oppervlakte</b>, in m².</p>',
          wanneer:'je een verhaaltje over een tuin, kamer of veld krijgt.',
          maak:function(R){
            var it = R.kies([['Er moet een hek rond het weiland.', 'omtrek'], ['De vloer van de keuken krijgt tegels.', 'oppervlakte'], ['Er komt een lijst rond een schilderij.', 'omtrek'], ['Het grasveld wordt opnieuw ingezaaid.', 'oppervlakte'],
              ['Je loopt een rondje langs de rand van het schoolplein.', 'omtrek'], ['De muur wordt geverfd.', 'oppervlakte'], ['Langs de rand van het tafelkleed komt een lint.', 'omtrek'], ['De slaapkamer krijgt nieuwe vloerbedekking.', 'oppervlakte'],
              ['Langs het raam komt een slinger lampjes.', 'omtrek'], ['Het sportveld krijgt kunstgras.', 'oppervlakte'], ['Langs de muren van de kamer komen plinten.', 'omtrek'], ['Over de zandbak gaat een zeil.', 'oppervlakte'], ['Het dak krijgt zonnepanelen.', 'oppervlakte'], ['Rond het zwembad komt een hek.', 'omtrek']]);
            var l = R.heel(4, 20), b = R.heel(2, l - 1), om = it[1] === 'omtrek';
            return { vraag:l + ' m bij ' + b + ' m', context:it[0] + ' Het is een rechthoek. Hoeveel heb je nodig?', antwoord:om ? metE(2 * l + 2 * b, 'm') : metE(l * b, 'm²'),
              beeld:rechthoek(l, b, 'm'),
              stappen:[
                kstap(R, 'Heb je hier de omtrek of de oppervlakte nodig?', it[1], [om ? 'oppervlakte' : 'omtrek'], 'Gaat het om de rand eromheen? Dan is het de omtrek. Gaat het om het vlak zelf? Dan is het de oppervlakte.'),
                om ? { tekst:'De omtrek: 2 × ' + l + ' + 2 × ' + b + ' =', antwoord:metE(2 * l + 2 * b, 'm'), eenheid:'m', hint:'Twee lange zijden en twee korte zijden.', fout:F(l * b, 'Dat is de oppervlakte. Hier gaat het om de rand.') }
                   : { tekst:'De oppervlakte: ' + l + ' × ' + b + ' =', antwoord:metE(l * b, 'm²'), eenheid:'m²', hint:'Lengte × breedte.', fout:F(2 * l + 2 * b, 'Dat is de omtrek. Hier gaat het om het vlak.') }
              ] };
          } }
      ] },

    /* ================= oppervlakte 2F ================= */
    { groep:{ id:'opp-reken', niveau:'2F', domein:'meten', naam:'Oppervlakte', uit:'Vierkante maten omrekenen, are en hectare, de driehoek, samengestelde figuren en de cirkel.' },
      doelen:[
        { id:'opp-eenheden', naam:'Vierkante maten omrekenen', kort:'Bij m², dm², cm² is elke trede × 100, niet × 10',
          uit:'<p>Een vierkante decimeter (dm²) is een vierkant van 10 cm bij 10 cm. Daar passen <b>10 × 10 = 100</b> vierkante centimeters in.</p><p>Op de trap van de vierkante maten is daarom elke trede <b>× 100</b>: m², dm², cm², mm².</p><p>3 m² = 300 dm² = 30.000 cm².</p>',
          wanneer:'je een oppervlakte in een andere vierkante maat moet zetten.',
          beeld:(function(){ var c = 18, s = '', i; for (i = 0; i <= 10; i++) s += ln(30 + i * c, 20, 30 + i * c, 20 + 10 * c, { w:i % 10 ? 1 : 2.5, op:i % 10 ? 0.4 : 1 }) + ln(30, 20 + i * c, 30 + 10 * c, 20 + i * c, { w:i % 10 ? 1 : 2.5, op:i % 10 ? 0.4 : 1 });
            s += rc(30, 20, c, c, { f:K[1], fo:0.6, w:0 }) + tx(30 + 5 * c, 20 + 10 * c + 24, '10 cm', { vet:true }) + tx(22, 20 + 5 * c + 5, '10 cm', { a:'end', vet:true }) + tx(30 + 10 * c + 16, 60, '1 dm²', { a:'start', vet:true }) + tx(30 + 10 * c + 16, 86, '= 100 cm²', { a:'start', vet:true, k:K[1] });
            return svg(330, 240, s, '1 dm² is 100 cm²', 360); })(),
          maak:function(R){ return trapMaak(R, TRAP.opp, [['m²', 'dm²'], ['m²', 'cm²'], ['dm²', 'cm²'], ['cm²', 'mm²']], 100, { komma:true }); } },
        { id:'opp-are', naam:'Are en hectare', kort:'1 a = 100 m², 1 ha = 100 a = 10.000 m²',
          uit:'<p>Grote stukken land meet je in <b>are</b> (a) en <b>hectare</b> (ha).</p><p>Een are is een vierkant van 10 m bij 10 m: <b>1 a = 100 m²</b>. Een hectare is 100 m bij 100 m: <b>1 ha = 10.000 m²</b> = 100 a. Een voetbalveld is bijna een hectare.</p><p>Op de trap: ha, a, m², met steeds × 100.</p>',
          wanneer:'het over land, weilanden of bos gaat.',
          maak:function(R){ return trapMaak(R, TRAP.ha, [['ha', 'm²'], ['ha', 'a'], ['a', 'm²']], 100, { komma:true }); } },
        { id:'opp-driehoek', naam:'Oppervlakte van een driehoek', kort:'Een driehoek is de helft van de rechthoek eromheen: basis × hoogte : 2',
          uit:'<p>Teken een <b>rechthoek</b> om de driehoek heen. De driehoek is precies de <b>helft</b> van die rechthoek.</p><p>Dus: oppervlakte driehoek = <b>basis × hoogte : 2</b>. De hoogte is de rechte afstand van de top naar de basis.</p><p>Basis 8 cm en hoogte 5 cm: 8 × 5 = 40, en 40 : 2 = 20 cm².</p>',
          wanneer:'je de oppervlakte van een driehoek zoekt.',
          maak:function(R){
            var b, h; do { b = R.heel(3, 14); h = R.heel(2, 12); } while ((b * h) % 2);
            var e = R.kies(['cm', 'm']), p = R.kies([0.2, 0.35, 0.5, 0.65, 0.8]);
            function pl(n){
              var s0 = Math.min(300 / b, 170 / h), W = b * s0, H = h * s0, x0 = 40, y0 = 20, ax = x0 + p * W, s = '';
              s += rc(x0, y0, W, H, { stip:true, w:1.5, f:n >= 1 ? K[2] : 'none', fo:0.12 });
              s += pg([[x0, y0 + H], [x0 + W, y0 + H], [ax, y0]], { f:K[0], fo:0.35 });
              s += ln(ax, y0, ax, y0 + H, { k:K[1], stip:true }) + tx(p > 0.5 ? ax - 8 : ax + 8, y0 + H / 2, 'hoogte ' + h + ' ' + e, { a:p > 0.5 ? 'end' : 'start', k:K[1], vet:true });
              s += tx(x0 + W / 2, y0 + H + 24, 'basis ' + b + ' ' + e, { vet:true });
              return svg(W + 200, H + 40, s, 'driehoek in een rechthoek', 520);
            }
            return { vraag:'driehoek: basis ' + b + ' ' + e + ', hoogte ' + h + ' ' + e, context:'Bereken de oppervlakte.', eenheid:e + '²', beeld:pl, stappen:[
              { tekst:'De rechthoek eromheen: ' + b + ' × ' + h + ' =', antwoord:metE(b * h, e + '²'), eenheid:e + '²', hint:'Basis × hoogte.' },
              { tekst:'De driehoek is de helft: ' + (b * h) + ' : 2 =', antwoord:metE(b * h / 2, e + '²'), eenheid:e + '²', hint:'De helft van ' + (b * h) + '.', fout:F(b * h, 'Dat is de hele rechthoek. Deel nog door 2.') } ] };
          } },
        { id:'opp-splitsen', naam:'Samengestelde figuur: splitsen', kort:'Knip de figuur in rechthoeken, reken ze uit en tel op',
          uit:'<p>Een figuur in de vorm van een L is geen rechthoek. Je kunt hem wel <b>splitsen</b>: trek een streep, dan heb je twee rechthoeken.</p><p>Soms moet je eerst een <b>ontbrekende maat</b> uitrekenen. Is de hele zijkant 9 m en het onderste stuk 4 m, dan is het bovenste stuk 9 − 4 = 5 m.</p><p>Reken elke rechthoek uit en tel ze op.</p>',
          wanneer:'een figuur uit rechthoeken bestaat, zoals een L-vorm.',
          maak:function(R){
            var W = R.heel(6, 14), H = R.heel(5, 12), a = R.heel(2, W - 2), c = R.heel(2, H - 2), hb = H - c, tot = W * c + a * hb;
            function pl(n){
              var s0 = Math.min(300 / W, 200 / H), x0 = 60, y0 = 20, X = function(u){ return x0 + u * s0; }, Y = function(v){ return y0 + v * s0; }, s = '';
              s += pg([[X(0), Y(0)], [X(a), Y(0)], [X(a), Y(hb)], [X(W), Y(hb)], [X(W), Y(H)], [X(0), Y(H)]], { f:K[0], fo:0.14 });
              if (n >= 2) s += rc(X(0), Y(hb), W * s0, c * s0, { f:K[0], fo:0.35, w:0 });
              if (n >= 3) s += rc(X(0), Y(0), a * s0, hb * s0, { f:K[2], fo:0.4, w:0 });
              if (n >= 1) s += ln(X(0), Y(hb), X(a), Y(hb), { k:K[1], stip:true, w:2.5 }) + tx(X(a) - 8, Y(hb / 2) + 5, hb + ' m', { a:'end', k:K[1], vet:true });
              s += tx(X(W / 2), Y(H) + 24, W + ' m', { vet:true }) + tx(X(0) - 10, Y(H / 2) + 5, H + ' m', { a:'end', vet:true }) + tx(X(a / 2), Y(0) - 8, a + ' m', { vet:true }) + tx(X(W) + 10, Y(hb + c / 2) + 5, c + ' m', { a:'start', vet:true });
              return svg(X(W) + 70, Y(H) + 40, s, 'L-vormige figuur', 460);
            }
            var wat = R.kies(['Een tuin in de vorm van een L.', 'Een kamer met een hoek eruit.', 'Een terras in de vorm van een L.', 'Een schoolplein in de vorm van een L.']);
            return { vraag:'L ' + W + '-' + H + '-' + a + '-' + c, vraagHtml:'Bereken de oppervlakte.', context:wat, eenheid:'m²', beeld:pl, zelfBeeld:pl(0), stappen:[
              { tekst:'Splits met een streep in twee rechthoeken. Hoe hoog is het bovenste stuk? ' + H + ' − ' + c + ' =', antwoord:metE(hb, 'm'), eenheid:'m', hint:'De hele linkerkant is ' + H + ' m. Het onderste stuk is ' + c + ' m hoog.' },
              { tekst:'Onderste rechthoek: ' + W + ' × ' + c + ' =', antwoord:metE(W * c, 'm²'), eenheid:'m²', hint:'Lengte × breedte van het onderste stuk.' },
              { tekst:'Bovenste rechthoek: ' + a + ' × ' + hb + ' =', antwoord:metE(a * hb, 'm²'), eenheid:'m²', hint:'Het bovenste stuk is ' + a + ' m breed en ' + hb + ' m hoog.' },
              { tekst:'Samen: ' + (W * c) + ' + ' + (a * hb) + ' =', antwoord:metE(tot, 'm²'), eenheid:'m²', hint:'Tel de twee rechthoeken op.' } ] };
          } },
        { id:'opp-groot-min', naam:'Samengestelde figuur: groot min weg', kort:'Reken de grote rechthoek uit en haal het stuk dat weg is eraf',
          uit:'<p>Een grasveld met een vijver erin. Hoeveel gras is er? Splitsen geeft hier veel stukjes. Het kan handiger.</p><p>Reken de <b>grote rechthoek</b> uit, alsof de vijver er niet is. Reken dan het stuk uit dat <b>weg</b> moet. Haal dat eraf: <b>groot min weg</b>.</p><p>Veld 12 × 8 = 96 m², vijver 4 × 3 = 12 m². Gras: 96 − 12 = 84 m².</p>',
          wanneer:'er een stuk uit een rechthoek is weggehaald, zoals een gat of een raam.',
          maak:function(R){
            var W = R.heel(8, 20), H = R.heel(6, 14), w = R.heel(2, W - 4), h = R.heel(2, H - 3);
            var c = R.kies([['Een grasveld met een vijver erin.', 'Hoeveel m² gras is er?'], ['Een parkeerterrein met een grasveld in het midden.', 'Hoeveel m² moet je bestraten?'], ['Een plein met een zandbak erin.', 'Hoeveel m² moet je bestraten?'], ['Een tuin met een schuurtje erin.', 'Hoeveel m² tuin blijft er over?'], ['Een weiland met een poel erin.', 'Hoeveel m² gras is er?']]);
            var pl = function(n){ return gatFiguur(W, H, w, h, n); };
            return { vraag:'groot ' + W + '×' + H + ', weg ' + w + '×' + h, vraagHtml:'Bereken de oppervlakte zonder het gat.', context:c[0] + ' ' + c[1], eenheid:'m²', beeld:pl, zelfBeeld:pl(0), stappen:[
              { tekst:'De grote rechthoek: ' + W + ' × ' + H + ' =', antwoord:metE(W * H, 'm²'), eenheid:'m²', hint:'Doe alsof het gat er niet is.' },
              { tekst:'Het stuk dat weg moet: ' + w + ' × ' + h + ' =', antwoord:metE(w * h, 'm²'), eenheid:'m²', hint:'Het gat is ' + w + ' m bij ' + h + ' m.' },
              { tekst:'Groot min weg: ' + (W * H) + ' − ' + (w * h) + ' =', antwoord:metE(W * H - w * h, 'm²'), eenheid:'m²', hint:'Haal het gat van het geheel af.', fout:F(W * H + w * h, 'Het gat moet eraf, niet erbij.') } ] };
          } },
        { id:'opp-kies', naam:'Kies de handigste manier', kort:'Zit er een gat in? Groot min weg. Bestaat hij uit losse rechthoeken met maten? Splitsen',
          uit:'<p>Je kent nu twee manieren voor samengestelde figuren: <b>splitsen</b> en <b>groot min weg</b>.</p><p>Zit er een <b>gat</b> in het midden? Dan is groot min weg het handigst: één rechthoek min één gat.</p><p>Bestaat de figuur uit <b>losse rechthoeken</b> met hun eigen maten erbij? Dan is splitsen het handigst. Voor groot min weg zou je dan maten missen.</p>',
          wanneer:'je een samengestelde figuur krijgt en zelf een manier moet kiezen.',
          maak:function(R){
            if (R.heel(0, 1)){
              var W = R.heel(8, 18), H = R.heel(6, 12), w = R.heel(2, W - 4), h = R.heel(2, H - 3), pl = function(n){ return gatFiguur(W, H, w, h, n - 1); };
              return { vraag:'kies: gat ' + W + '×' + H + '-' + w + '×' + h, vraagHtml:'Bereken de oppervlakte van het gekleurde deel.', eenheid:'m²', beeld:pl, zelfBeeld:pl(0), stappen:[
                kstap(R, 'Welke manier is hier het handigst?', 'groot min weg', ['splitsen'], 'Er zit een gat in het midden. Splitsen geeft vier stukken. Groot min weg is maar één min-som.'),
                { tekst:'De grote rechthoek: ' + W + ' × ' + H + ' =', antwoord:metE(W * H, 'm²'), eenheid:'m²', hint:'Doe alsof het gat er niet is.' },
                { tekst:'Het gat: ' + w + ' × ' + h + ' =', antwoord:metE(w * h, 'm²'), eenheid:'m²', hint:'Lengte × breedte van het gat.' },
                { tekst:(W * H) + ' − ' + (w * h) + ' =', antwoord:metE(W * H - w * h, 'm²'), eenheid:'m²', hint:'Groot min weg.' } ] };
            }
            var W1 = R.heel(6, 14), H1 = R.heel(2, 6), w2 = R.heel(2, W1 - 2), h2 = R.heel(2, 6);
            function pl2(){
              var s0 = Math.min(300 / W1, 200 / (H1 + h2)), x0 = 60, y0 = 26, s = '';
              s += rc(x0, y0 + h2 * s0, W1 * s0, H1 * s0, { f:K[0], fo:0.3, w:2.5 }) + rc(x0, y0, w2 * s0, h2 * s0, { f:K[2], fo:0.35, w:2.5 });
              s += tx(x0 + W1 * s0 / 2, y0 + (h2 + H1) * s0 + 24, W1 + ' m', { vet:true }) + tx(x0 + W1 * s0 + 10, y0 + (h2 + H1 / 2) * s0 + 5, H1 + ' m', { a:'start', vet:true });
              s += tx(x0 + w2 * s0 / 2, y0 - 8, w2 + ' m', { vet:true }) + tx(x0 - 10, y0 + h2 * s0 / 2 + 5, h2 + ' m', { a:'end', vet:true });
              return svg(x0 + W1 * s0 + 70, y0 + (h2 + H1) * s0 + 40, s, 'twee rechthoeken op elkaar', 460);
            }
            var p2 = pl2();
            return { vraag:'kies: blokken ' + W1 + '×' + H1 + '+' + w2 + '×' + h2, vraagHtml:'Bereken de oppervlakte van de hele figuur.', eenheid:'m²', beeld:p2, zelfBeeld:p2, stappen:[
              kstap(R, 'Welke manier is hier het handigst?', 'splitsen', ['groot min weg'], 'De figuur bestaat al uit twee rechthoeken met hun maten erbij. Voor groot min weg mis je de maten van de grote rechthoek.'),
              { tekst:'De onderste rechthoek: ' + W1 + ' × ' + H1 + ' =', antwoord:metE(W1 * H1, 'm²'), eenheid:'m²', hint:'Lengte × breedte van het blauwe stuk.' },
              { tekst:'De bovenste rechthoek: ' + w2 + ' × ' + h2 + ' =', antwoord:metE(w2 * h2, 'm²'), eenheid:'m²', hint:'Lengte × breedte van het oranje stuk.' },
              { tekst:(W1 * H1) + ' + ' + (w2 * h2) + ' =', antwoord:metE(W1 * H1 + w2 * h2, 'm²'), eenheid:'m²', hint:'Tel de twee stukken op.' } ] };
          } },
        { id:'opp-cirkel-omtrek', naam:'Omtrek van een cirkel', kort:'Omtrek = π × diameter, met π ongeveer 3,14',
          uit:'<p>Leg een touw om een cirkel en meet het. Het touw is altijd iets meer dan <b>3 keer</b> zo lang als de diameter. Precies: <b>π</b> (pi) keer, en π is ongeveer <b>3,14</b>.</p><p>Dus: <b>omtrek = π × diameter</b>. De diameter is de lijn dwars door het midden. De straal is de helft daarvan.</p><p>Diameter 10 cm: omtrek = 3,14 × 10 = 31,4 cm.</p>',
          wanneer:'je de rand van iets ronds zoekt: een wiel, een tafel, een vijver.',
          maak:function(R){
            var r = R.heel(2, 15), d = 2 * r, isR = R.heel(0, 1) === 1, e = R.kies(['cm', 'cm', 'm']), ex = 3.14 * d;
            var ant = uniek([].concat(metE(T(r2(ex)), e), metE(T(r1(ex)), e), metE(T(r2(Math.PI * d)), e), metE(T(r1(Math.PI * d)), e)));
            var st = isR ? { tekst:'De diameter is 2 × de straal: 2 × ' + r + ' =', antwoord:metE(d, e), eenheid:e, hint:'De straal gaat van het midden naar de rand. De diameter gaat helemaal door: twee stralen.' }
                         : kstap(R, 'Met welke formule reken je de omtrek uit?', 'π × diameter', ['π × straal × straal', '2 × diameter'], 'Omtrek = π × diameter. π × straal × straal is de oppervlakte.');
            return { vraag:'omtrek bij ' + (isR ? 'straal ' + r : 'diameter ' + d) + ' ' + e, context:'Reken met π ≈ 3,14.', eenheid:e, antwoord:ant, beeld:cirkel(isR ? r : d, isR, e), stappen:[st,
              { tekst:'3,14 × ' + d + ' =', antwoord:ant, eenheid:e, hint:'3 × ' + d + ' = ' + (3 * d) + ', en 0,14 × ' + d + ' = ' + T(0.14 * d) + '.', fout:F(T(3.14 * r), 'Je rekende met de straal. Gebruik de diameter: ' + d + '.') }] };
          } },
        { id:'opp-cirkel', naam:'Oppervlakte van een cirkel', kort:'Oppervlakte = π × straal × straal',
          uit:'<p>De oppervlakte van een cirkel is <b>π × straal × straal</b>. Met π ≈ 3,14.</p><p>Let op: hier heb je de <b>straal</b> nodig, niet de diameter. Staat de diameter gegeven, deel die dan eerst door 2.</p><p>Straal 5 cm: 5 × 5 = 25, en 3,14 × 25 = 78,5 cm².</p>',
          wanneer:'je wilt weten hoeveel ruimte iets ronds inneemt.',
          maak:function(R){
            var r = R.heel(2, 12), d = 2 * r, isR = R.heel(0, 1) === 1, e = R.kies(['cm', 'cm', 'm']), ex = 3.14 * r * r, E = e + '²';
            var ant = uniek([].concat(metE(T(r2(ex)), E), metE(T(r1(ex)), E), metE(T(r2(Math.PI * r * r)), E), metE(T(r1(Math.PI * r * r)), E)));
            var st = isR ? kstap(R, 'Met welke formule reken je de oppervlakte uit?', 'π × straal × straal', ['π × diameter', '2 × π × straal'], 'Oppervlakte = π × straal × straal. π × diameter is de omtrek.')
                         : { tekst:'De straal is de helft van de diameter: ' + d + ' : 2 =', antwoord:metE(r, e), eenheid:e, hint:'De straal gaat van het midden naar de rand: de helft van de diameter.' };
            return { vraag:'oppervlakte bij ' + (isR ? 'straal ' + r : 'diameter ' + d) + ' ' + e, context:'Reken met π ≈ 3,14.', eenheid:E, antwoord:ant, beeld:cirkel(isR ? r : d, isR, e), stappen:[st,
              { tekst:'Straal × straal: ' + r + ' × ' + r + ' =', antwoord:String(r * r), hint:r + ' keer zichzelf.', fout:F(2 * r, 'Dat is 2 × ' + r + '. Je moet ' + r + ' × ' + r + ' doen.') },
              { tekst:'3,14 × ' + (r * r) + ' =', antwoord:ant, eenheid:E, hint:'3 × ' + (r * r) + ' = ' + (3 * r * r) + ', en 0,14 × ' + (r * r) + ' = ' + T(0.14 * r * r) + '.' }] };
          } }
      ] },

    /* ================= inhoud 2F ================= */
    { groep:{ id:'inh-reken', niveau:'2F', domein:'meten', naam:'Inhoud', uit:'Hoeveel er in een doos, bak of aquarium past: de inhoud van een balk, kubieke maten en de liter.' },
      doelen:[
        { id:'inh-balk', naam:'Inhoud van een balk', kort:'Lengte × breedte × hoogte: de blokjes van één laag, keer het aantal lagen',
          uit:'<p>De <b>inhoud</b> is hoeveel blokjes er in een balk passen. Een blokje van 1 cm bij 1 cm bij 1 cm heet 1 <b>cm³</b> (kubieke centimeter).</p><p>Tel slim: de onderste laag heeft <b>lengte × breedte</b> blokjes. Er liggen zoveel lagen op elkaar als de <b>hoogte</b>.</p><p>Dus: inhoud = lengte × breedte × hoogte.</p>',
          wanneer:'je wilt weten hoeveel er in een doos of bak past.',
          maak:function(R){
            var l = R.heel(2, 6), b = R.heel(2, 4), h = R.heel(2, 5);
            return { vraag:'balk van ' + l + ' bij ' + b + ' bij ' + h + ' cm', context:'Elk blokje is 1 cm³. Bereken de inhoud.', eenheid:'cm³',
              beeld:function(n){ return balk(l, b, h, 'cm', { blokjes:true, laag:n === 0 || n === 1 }); }, stappen:[
              { tekst:'De onderste laag: ' + l + ' × ' + b + ' =', antwoord:String(l * b), eenheid:'blokjes', hint:'De laag is ' + l + ' blokjes lang en ' + b + ' blokjes breed.' },
              { tekst:'Hoeveel lagen liggen er op elkaar?', antwoord:String(h), hint:'Zoveel lagen als de hoogte: ' + h + ' cm.' },
              { tekst:(l * b) + ' × ' + h + ' =', antwoord:metE(l * b * h, 'cm³', ['blokjes']), eenheid:'cm³', hint:h + ' lagen van ' + (l * b) + ' blokjes.' } ] };
          } },
        { id:'inh-eenheden', naam:'Kubieke maten omrekenen', kort:'Bij m³, dm³, cm³ is elke trede × 1000',
          uit:'<p>Een kubieke decimeter (dm³) is een kubus van 10 cm bij 10 cm bij 10 cm. Daar passen <b>10 × 10 × 10 = 1000</b> blokjes van 1 cm³ in.</p><p>Op de trap van de kubieke maten is elke trede daarom <b>× 1000</b>: m³, dm³, cm³, mm³.</p><p>2 m³ = 2000 dm³. 4500 cm³ = 4,5 dm³.</p>',
          wanneer:'je een inhoud in een andere kubieke maat moet zetten.',
          maak:function(R){ return trapMaak(R, TRAP.inh, [['m³', 'dm³'], ['dm³', 'cm³'], ['m³', 'cm³'], ['cm³', 'mm³']], 1000, { komma:true, maxOp:1 }); } },
        { id:'inh-liter', naam:'Liter en kubieke maten', kort:'1 dm³ = 1 liter en 1 cm³ = 1 ml',
          uit:'<p>Een pak melk van 1 liter past precies in een kubus van 10 cm bij 10 cm bij 10 cm. Dus <b>1 dm³ = 1 liter</b>.</p><p>En een blokje van 1 cm³ is precies <b>1 ml</b>. Een m³ is 1000 liter.</p><p>Zo spring je van de ene trap naar de andere: 3500 cm³ = 3500 ml = 3,5 l.</p>',
          wanneer:'je van kubieke maten naar liters moet, of terug.',
          beeld:LEERROUTE.R.teken.tabel([['m³', 'dm³', 'cm³'], ['1000 liter', '1 liter', '1 ml']], { kop:true }),
          maak:function(R){
            var s = R.heel(0, 4), x, ant;
            var tab = R.teken.tabel([['m³', 'dm³', 'cm³'], ['1000 liter', '1 liter', '1 ml']], { kop:true });
            if (s === 0){ x = R.heel(2, 40) / 10; ant = x * 1000;
              return { vraag:T(x) + ' m³ = … liter', eenheid:'l', beeld:tab, stappen:[
                { tekst:'Van m³ naar dm³ is × 1000: ' + T(x) + ' m³ = … dm³', antwoord:metE(T(ant), 'dm³'), eenheid:'dm³', hint:'Schuif de komma 3 plaatsen naar rechts.' },
                { tekst:'Een dm³ is een liter. Dus … liter', antwoord:metE(T(ant), 'liter', ['l']), eenheid:'l', hint:T(ant) + ' dm³ is evenveel liter.' } ] }; }
            if (s === 1){ x = R.heel(2, 95) * 50; ant = x / 1000;
              return { vraag:T(x) + ' cm³ = … liter', eenheid:'l', beeld:tab, stappen:[
                { tekst:'Een cm³ is een ml. ' + T(x) + ' cm³ = … ml', antwoord:metE(T(x), 'ml'), eenheid:'ml', hint:'Het getal blijft hetzelfde.' },
                { tekst:'Van ml naar liter is : 1000. ' + T(x) + ' ml = … liter', antwoord:metE(T(ant), 'liter', ['l']), eenheid:'l', hint:'Schuif de komma 3 plaatsen naar links.', fout:F(T(x * 1000), 'Naar een grotere maat wordt het getal kleiner.') } ] }; }
            if (s === 2){ x = R.heel(2, 30) / 10; ant = x * 1000;
              return { vraag:T(x) + ' liter = … cm³', eenheid:'cm³', beeld:tab, stappen:[
                { tekst:'Van liter naar ml is × 1000. ' + T(x) + ' l = … ml', antwoord:metE(T(ant), 'ml'), eenheid:'ml', hint:'Schuif de komma 3 plaatsen naar rechts.' },
                { tekst:'Een ml is een cm³. Dus … cm³', antwoord:metE(T(ant), 'cm³'), eenheid:'cm³', hint:T(ant) + ' ml is evenveel cm³.' } ] }; }
            if (s === 3){ x = R.heel(2, 20); ant = x * 100;
              return { vraag:x + ' dl = … cm³', eenheid:'cm³', beeld:tab, stappen:[
                { tekst:'Van dl naar ml is 2 treden: × 100. ' + x + ' dl = … ml', antwoord:metE(T(ant), 'ml'), eenheid:'ml', hint:'Zet twee nullen erachter.' },
                { tekst:'Een ml is een cm³. Dus … cm³', antwoord:metE(T(ant), 'cm³'), eenheid:'cm³', hint:T(ant) + ' ml is evenveel cm³.' } ] }; }
            x = R.heel(2, 30) / 10; ant = x * 1000;
            return { vraag:T(x) + ' dm³ = … ml', eenheid:'ml', beeld:tab, stappen:[
              { tekst:'Een dm³ is een liter. ' + T(x) + ' dm³ = … liter', antwoord:metE(T(x), 'liter', ['l']), eenheid:'l', hint:'Het getal blijft hetzelfde.' },
              { tekst:'Van liter naar ml is × 1000. ' + T(x) + ' l = … ml', antwoord:metE(T(ant), 'ml'), eenheid:'ml', hint:'Schuif de komma 3 plaatsen naar rechts.' } ] };
          } },
        { id:'inh-context', naam:'Hoeveel liter past erin?', kort:'Zet de maten eerst in dm, dan krijg je meteen dm³ en dat is liter',
          uit:'<p>Een aquarium is 80 cm lang, 40 cm breed en 50 cm hoog. Hoeveel liter water past erin?</p><p>Handig: zet de maten eerst in <b>dm</b>: 8 dm, 4 dm en 5 dm. Dan is de inhoud 8 × 4 × 5 = 160 dm³. En <b>1 dm³ = 1 liter</b>, dus 160 liter.</p><p>Reken je in cm, dan krijg je 160.000 cm³. Dat moet je dan nog omrekenen naar liters.</p>',
          wanneer:'je wilt weten hoeveel liter er in een bak of aquarium past.',
          maak:function(R){
            var l = 10 * R.heel(4, 12), b = 10 * R.heel(2, 6), h = 10 * R.heel(3, 6), V = l * b * h / 1000;
            var wat = R.kies(['Een aquarium', 'Een bak', 'Een koelbox', 'Een plantenbak', 'Een watertank']);
            return { vraag:l + ' × ' + b + ' × ' + h + ' cm', context:wat + ' is ' + l + ' cm lang, ' + b + ' cm breed en ' + h + ' cm hoog. Hoeveel liter past erin?', eenheid:'liter',
              beeld:balk(l / 10, b / 10, h / 10, 'dm', { s:Math.min(26, 260 / (l / 10)) }).replace(/>(\d+) dm</g, function(a, x){ return '>' + (x * 10) + ' cm<'; }),
              stappen:[
                { tekst:l + ' cm = … dm', antwoord:metE(l / 10, 'dm'), eenheid:'dm', hint:'10 cm is 1 dm. Deel door 10.' },
                { tekst:b + ' cm = … dm', antwoord:metE(b / 10, 'dm'), eenheid:'dm', hint:'Deel door 10.' },
                { tekst:h + ' cm = … dm', antwoord:metE(h / 10, 'dm'), eenheid:'dm', hint:'Deel door 10.' },
                { tekst:(l / 10) + ' × ' + (b / 10) + ' × ' + (h / 10) + ' =', antwoord:metE(V, 'liter', ['l', 'dm³']), eenheid:'liter', hint:'Inhoud = lengte × breedte × hoogte, in dm³. En 1 dm³ = 1 liter.', fout:F(l * b * h, 'Dat is in cm³. Reken met de maten in dm.') }
              ] };
          } }
      ] },

    /* ================= snelheid 2F ================= */
    { groep:{ id:'snel-basis', niveau:'2F', domein:'meten', naam:'Snelheid, afstand en tijd', uit:'Snelheid is afstand per tijd, bijvoorbeeld km per uur. Met een verhoudingstabel of met de formule reken je de snelheid, de afstand of de tijd uit.' },
      doelen:[
        { id:'snel-tabel', naam:'Met de verhoudingstabel', kort:'Zet km en uur in een tabel en reken stap voor stap door',
          uit:'<p>Een fietser rijdt 18 km per uur. Hoe ver komt hij in 2,5 uur? Zet het in een <b>verhoudingstabel</b>: boven de km, onder de uren.</p><p>1 uur is 18 km. 2 uur is 36 km. Een half uur is 9 km. Dus 2,5 uur is 36 + 9 = <b>45 km</b>.</p><p>Wat je onder doet, doe je boven ook.</p>',
          wanneer:'de tijd geen heel getal is, zoals 2,5 uur.',
          maak:function(R){
            var w = snelheid(R, 2), n = R.heel(1, 3), t = n + 0.5, v = w.v, tot = v * t;
            function tab(k){
              var km = [String(v)], uur = ['1'], pij = [];
              if (n > 1){ km.push(k >= 1 ? T(n * v) : '?'); uur.push(String(n)); pij.push({ van:1, naar:2, tekst:'× ' + n }); }
              km.push(k >= (n > 1 ? 2 : 1) ? T(v / 2) : '?'); uur.push('0,5'); pij.push({ van:1, naar:km.length, tekst:': 2' });
              km.push(k >= (n > 1 ? 3 : 2) ? T(tot) : '?'); uur.push(T(t)); pij.push({ van:1, naar:km.length, tekst:'+' });
              return R.teken.tabel([['afstand (km)'].concat(km), ['tijd (uur)'].concat(uur)], { zijkop:true, verhouding:true, pijlen:pij });
            }
            var st = [];
            if (n > 1) st.push({ tekst:'In ' + n + ' uur: ' + n + ' × ' + v + ' =', antwoord:metE(T(n * v), 'km'), eenheid:'km', hint:n + ' keer zo lang, dus ' + n + ' keer zo ver.' });
            st.push({ tekst:'In een half uur: ' + v + ' : 2 =', antwoord:metE(T(v / 2), 'km'), eenheid:'km', hint:'Half zo lang, dus half zo ver.' });
            st.push({ tekst:'In ' + T(t) + ' uur: ' + T(n * v) + ' + ' + T(v / 2) + ' =', antwoord:metE(T(tot), 'km'), eenheid:'km', hint:T(t) + ' uur is ' + n + ' uur plus een half uur.' });
            return { vraag:'Hoe ver in ' + T(t) + ' uur?', context:w.wie + ' ' + w.doet + ' ' + v + ' km per uur.', eenheid:'km', beeld:tab, stappen:st };
          } },
        { id:'snel-snelheid', naam:'Snelheid = afstand : tijd', kort:'Deel de afstand door de tijd: zoveel km per uur',
          uit:'<p>Snelheid zegt hoeveel km je in <b>één uur</b> aflegt. Je verdeelt de afstand over de uren: <b>snelheid = afstand : tijd</b>.</p><p>Een auto rijdt 240 km in 3 uur. Snelheid = 240 : 3 = 80 km per uur. Dat schrijf je als <b>80 km/u</b>.</p><p>In de driehoek staat afstand boven. Zoek je de snelheid, dan is het afstand gedeeld door tijd.</p>',
          wanneer:'je de afstand en de tijd weet.',
          beeld:driehoek('snelheid'),
          maak:function(R){
            var o = snelOpgave(R, 'snelheid');
            return { vraag:T(o.d) + ' km in ' + T(o.t) + ' uur', context:o.ctx + ' ' + o.vr, eenheid:'km/u', beeld:driehoek('snelheid'), stappen:[
              kstap(R, 'Je zoekt de snelheid. Welke som hoort daarbij?', FORM.snelheid, [FORM.afstand, 'tijd : afstand'], 'Snelheid is hoeveel km per uur: de afstand verdeeld over de uren.'), o.reken ] };
          } },
        { id:'snel-afstand', naam:'Afstand = snelheid × tijd', kort:'Zoveel km per uur, keer het aantal uren',
          uit:'<p>Rijd je 80 km per uur, dan kom je in 1 uur 80 km ver. In 3 uur kom je 3 keer zo ver.</p><p>Dus: <b>afstand = snelheid × tijd</b>. 80 × 3 = 240 km.</p><p>Is de tijd 1,5 uur? Dan is het 80 + 40 = 120 km.</p>',
          wanneer:'je de snelheid en de tijd weet.',
          beeld:driehoek('afstand'),
          maak:function(R){
            var o = snelOpgave(R, 'afstand');
            return { vraag:o.w.v + ' km/u, ' + T(o.t) + ' uur', context:o.ctx + ' ' + o.vr, eenheid:'km', beeld:driehoek('afstand'), stappen:[
              kstap(R, 'Je zoekt de afstand. Welke som hoort daarbij?', FORM.afstand, [FORM.snelheid, FORM.tijd], 'Elk uur kom je ' + o.w.v + ' km verder. Dus keer het aantal uren.'), o.reken ] };
          } },
        { id:'snel-tijd', naam:'Tijd = afstand : snelheid', kort:'Hoe vaak past de snelheid in de afstand? Zoveel uur',
          uit:'<p>Je moet 240 km rijden en je rijdt 80 km per uur. Hoe lang doe je erover? Elk uur kom je 80 km verder. Hoe vaak past 80 in 240? Drie keer.</p><p>Dus: <b>tijd = afstand : snelheid</b>. 240 : 80 = 3 uur.</p><p>Komt er een half uit, zoals 1,5 uur? Dat is 1 uur en 30 minuten.</p>',
          wanneer:'je de afstand en de snelheid weet.',
          beeld:driehoek('tijd'),
          maak:function(R){
            var o = snelOpgave(R, 'tijd');
            return { vraag:T(o.d) + ' km bij ' + o.w.v + ' km/u', context:o.ctx + ' ' + o.vr, eenheid:'uur', antwoord:o.reken.antwoord, controle:o.reken.controle, beeld:driehoek('tijd'), stappen:[
              kstap(R, 'Je zoekt de tijd. Welke som hoort daarbij?', FORM.tijd, [FORM.afstand, 'snelheid : afstand'], 'Hoe vaak past ' + o.w.v + ' km in ' + T(o.d) + ' km? Zoveel uur.'), o.reken ] };
          } },
        { id:'snel-minuten', naam:'Snelheid met minuten', kort:'Reken eerst uit hoe ver je in een handig stukje van het uur komt',
          uit:'<p>Een auto rijdt 80 km per uur. Hoe ver komt hij in 45 minuten? 45 minuten is geen heel uur. Maak het in stukjes.</p><p>Een uur is 60 minuten. 15 minuten is een <b>kwart</b> uur: 80 : 4 = 20 km. 45 minuten is 3 kwartier: 3 × 20 = <b>60 km</b>.</p><p>Gebruik een verhoudingstabel: boven de km, onder de minuten.</p>',
          wanneer:'de tijd in minuten gegeven is.',
          maak:function(R){
            var c = R.kies([[45, 15], [40, 20], [50, 10], [25, 5], [35, 5], [75, 15], [20, 10], [30, 15]]), m = c[0], b = c[1], d = 60 / b, w, x;
            do { w = snelheid(R, 1); } while (w.v % d !== 0);
            x = w.v / d;
            var tab = function(k){ return R.teken.tabel([['afstand (km)', String(w.v), k >= 1 ? T(x) : '?', k >= 2 ? T(x * m / b) : '?'], ['tijd (min)', '60', String(b), String(m)]], { zijkop:true, verhouding:true, pijlen:[{ van:1, naar:2, tekst:': ' + d }, { van:2, naar:3, tekst:'× ' + (m / b) }] }); };
            return { vraag:'Hoe ver in ' + m + ' minuten?', context:w.wie + ' ' + w.doet + ' ' + w.v + ' km per uur.', eenheid:'km', beeld:tab, stappen:[
              { tekst:'In 60 minuten: ' + w.v + ' km. In ' + b + ' minuten: ' + w.v + ' : ' + d + ' =', antwoord:metE(T(x), 'km'), eenheid:'km', hint:b + ' minuten past ' + d + ' keer in een uur.' },
              { tekst:m + ' minuten is ' + (m / b) + ' × ' + b + ' minuten: ' + T(x) + ' × ' + (m / b) + ' =', antwoord:metE(T(x * m / b), 'km'), eenheid:'km', hint:(m / b) + ' keer zo lang, dus ' + (m / b) + ' keer zo ver.', fout:F(T(w.v * m / 100), 'Een uur heeft 60 minuten, niet 100.') } ] };
          } },
        { id:'snel-kies', naam:'Kies de juiste som', kort:'Kijk eerst wat er gevraagd wordt, en kies dan de som die erbij hoort',
          uit:'<p>Bij snelheid zijn er drie soorten vragen. Kijk eerst <b>wat er ontbreekt</b>.</p><p>Zoek je de <b>snelheid</b>? Afstand : tijd. Zoek je de <b>afstand</b>? Snelheid × tijd. Zoek je de <b>tijd</b>? Afstand : snelheid.</p><p>De driehoek helpt: dek af wat je zoekt, en kijk wat er overblijft.</p>',
          wanneer:'je niet meteen ziet welke som je moet maken.',
          beeld:driehoek(''),
          maak:function(R){
            var soort = R.kies(['snelheid', 'afstand', 'tijd']), o = snelOpgave(R, soort), fs = [FORM.snelheid, FORM.afstand, FORM.tijd];
            var op = { vraag:o.vr, context:o.ctx, eenheid:o.reken.eenheid, beeld:function(n){ return driehoek(n >= 1 ? soort : ''); }, stappen:[
              kstap(R, 'Wat moet je uitrekenen?', 'de ' + soort, ['de snelheid', 'de afstand', 'de tijd'], 'Kijk wat er in de vraag ontbreekt.'),
              kstap(R, 'Welke som hoort daarbij?', FORM[soort], fs, 'Snelheid = afstand : tijd. Afstand = snelheid × tijd. Tijd = afstand : snelheid.'), o.reken ] };
            if (o.reken.controle){ op.controle = o.reken.controle; op.antwoord = o.reken.antwoord; }
            return op;
          } }
      ] },

    /* ================= samengestelde eenheden 3F ================= */
    { groep:{ id:'snel-om', niveau:'3F', domein:'meten', naam:'Samengestelde eenheden', uit:'Eenheden die uit twee maten bestaan: km/u en m/s, prijs per liter, gram per cm³ en verbruik. Plus de inhoud van een cilinder en een prisma.' },
      doelen:[
        { id:'snel-ms', naam:'Van km/u naar m/s', kort:'Km naar m is × 1000, uur naar seconden is : 3600, samen : 3,6',
          uit:'<p>72 km/u betekent: 72 km in een uur. Hoeveel meter is dat per seconde?</p><p>72 km = 72.000 m. Een uur = 60 × 60 = 3600 seconden. 72.000 : 3600 = <b>20 m/s</b>.</p><p>Eerst × 1000 en dan : 3600 is samen <b>: 3,6</b>. Dat is de snelle manier: 72 : 3,6 = 20.</p>',
          wanneer:'je een snelheid in meter per seconde nodig hebt.',
          maak:function(R){
            var k = 5 * R.heel(1, 8), v = 3.6 * k, wie = R.kies(['Een auto rijdt', 'Een trein rijdt', 'Een scooter rijdt', 'Een vogel vliegt']);
            return { vraag:T(v) + ' km/u = … m/s', context:wie + ' ' + T(v) + ' km/u.', eenheid:'m/s', stappen:[
              { tekst:T(v) + ' km = … m', antwoord:metE(T(v * 1000), 'm'), eenheid:'m', hint:'1 km = 1000 m.' },
              { tekst:'1 uur = … seconden', antwoord:'3600', eenheid:'s', hint:'1 uur = 60 minuten en 1 minuut = 60 seconden: 60 × 60.' },
              { tekst:T(v * 1000) + ' : 3600 =', antwoord:metE(T(k), 'm/s'), eenheid:'m/s', hint:'Of sneller: ' + T(v) + ' : 3,6.', waarom:'Eerst × 1000 en dan : 3600 is samen : 3,6. Dus ook: ' + T(v) + ' : 3,6 = ' + k + '.', fout:F(T(v * 3.6), 'Naar m/s wordt het getal kleiner. Je moest delen.') } ] };
          } },
        { id:'snel-kmu', naam:'Van m/s naar km/u', kort:'Keer 3,6: in een uur kom je veel verder dan in een seconde',
          uit:'<p>Van km/u naar m/s is : 3,6. Terug, van <b>m/s naar km/u</b>, is dus <b>× 3,6</b>.</p><p>Controleer met je verstand: in een uur kom je veel verder dan in een seconde. Het getal in km/u is dus groter.</p><p>10 m/s × 3,6 = 36 km/u.</p>',
          wanneer:'je een snelheid in m/s krijgt en wilt weten hoe hard dat in km/u is.',
          maak:function(R){
            var it = R.kies([['Een sprinter loopt', 8, 11], ['De wind waait', 5, 30], ['Een cheeta rent', 25, 30], ['Een duif vliegt', 15, 25], ['Een schaatser rijdt', 10, 15], ['Een bal vliegt', 15, 40]]), k = R.heel(it[1], it[2]);
            return { vraag:k + ' m/s = … km/u', context:it[0] + ' ' + k + ' m/s.', eenheid:'km/u', stappen:[
              kstap(R, 'Van m/s naar km/u: keer of gedeeld door 3,6?', '× 3,6', [': 3,6'], 'In een uur kom je veel verder dan in een seconde. Het getal wordt dus groter: × 3,6.', 'In een uur zitten 3600 seconden: × 3600. Van m naar km is : 1000. Samen × 3,6.'),
              { tekst:k + ' × 3,6 =', antwoord:metE(T(3.6 * k), 'km/u'), eenheid:'km/u', hint:k + ' × 3 = ' + (3 * k) + ' en ' + k + ' × 0,6 = ' + T(0.6 * k) + '.' } ] };
          } },
        { id:'snel-prijs', naam:'Prijs per liter of per kilo', kort:'Reken met een verhoudingstabel door naar 1 liter of 1 kilo',
          uit:'<p>Wat is goedkoper: een grote of een kleine verpakking? Vergelijk de <b>prijs per liter</b> of <b>per kilo</b>.</p><p>Een fles van 1,5 liter kost € 2,10. Zet het in een verhoudingstabel. 1,5 liter : 3 = 0,5 liter, kost € 0,70. Dan × 2: 1 liter kost <b>€ 1,40</b>.</p><p>Kies stappen die makkelijk zijn: eerst naar een handig stukje, dan naar 1.</p>',
          wanneer:'je prijzen van verschillende verpakkingen vergelijkt.',
          maak:function(R){
            var c = R.kies([
              { pak:'Een fles cola van 1,5 liter', maat:'1,5 l', per:'liter', s1:['0,5 l', ':', 3], s2:['1 l', 2], lo:150, hi:300 },
              { pak:'Een fles olie van 0,75 liter', maat:'0,75 l', per:'liter', s1:['0,25 l', ':', 3], s2:['1 l', 4], lo:300, hi:700 },
              { pak:'Een zak appels van 2,5 kilo', maat:'2,5 kg', per:'kilo', s1:['0,5 kg', ':', 5], s2:['1 kg', 2], lo:200, hi:500 },
              { pak:'Een pak koffie van 250 gram', maat:'250 g', per:'kilo', s1:['500 g', '×', 2], s2:['1000 g', 2], lo:250, hi:500 },
              { pak:'Een bakje aardbeien van 400 gram', maat:'400 g', per:'kilo', s1:['100 g', ':', 4], s2:['1000 g', 10], lo:200, hi:400 },
              { pak:'Een pot honing van 750 gram', maat:'750 g', per:'kilo', s1:['250 g', ':', 3], s2:['1000 g', 4], lo:450, hi:900 },
              { pak:'Een fles shampoo van 300 ml', maat:'300 ml', per:'liter', s1:['100 ml', ':', 3], s2:['1000 ml', 10], lo:200, hi:500 } ]);
            var t; do { t = R.heel(c.lo, c.hi); } while (c.s1[1] === ':' && t % c.s1[2] !== 0);
            var mid = c.s1[1] === ':' ? t / c.s1[2] : t * c.s1[2], eind = mid * c.s2[1];
            var tab = function(k){ return R.teken.tabel([['hoeveel', c.maat, c.s1[0], c.s2[0]], ['prijs', G(t / 100), k >= 1 ? G(mid / 100) : '?', k >= 2 ? G(eind / 100) : '?']], { zijkop:true, verhouding:true, pijlen:[{ van:1, naar:2, tekst:c.s1[1] + ' ' + c.s1[2] }, { van:2, naar:3, tekst:'× ' + c.s2[1] }] }); };
            return { vraag:'Wat kost 1 ' + c.per + '?', context:c.pak + ' kost ' + G(t / 100) + '.', beeld:tab, stappen:[
              { tekst:'Prijs voor ' + c.s1[0] + ': ' + G(t / 100) + ' ' + c.s1[1] + ' ' + c.s1[2] + ' =', antwoord:G(mid / 100), hint:c.s1[1] === ':' ? 'Reken in centen: ' + t + ' : ' + c.s1[2] + '.' : 'Twee keer zoveel, dus twee keer zo duur.' },
              { tekst:'Prijs voor ' + c.s2[0] + ': ' + G(mid / 100) + ' × ' + c.s2[1] + ' =', antwoord:G(eind / 100), hint:c.s2[1] + ' keer zoveel, dus ' + c.s2[1] + ' keer zo duur.' } ] };
          } },
        { id:'snel-dichtheid', naam:'Dichtheid: gram per cm³', kort:'Massa = dichtheid × inhoud, daarna omrekenen naar kg',
          uit:'<p>De <b>dichtheid</b> zegt hoeveel 1 cm³ van een stof weegt. IJzer is zwaar: 7,9 gram per cm³. Hout is licht: ongeveer 0,6 gram per cm³.</p><p>Weet je de inhoud, dan reken je het gewicht uit: <b>massa = dichtheid × inhoud</b>. Een blok hout van 2000 cm³ weegt 0,6 × 2000 = 1200 gram = <b>1,2 kg</b>.</p>',
          wanneer:'je het gewicht van een voorwerp wilt weten uit de stof en de inhoud.',
          maak:function(R){
            var it = R.kies([['Hout', 'hout', [0.5, 0.6, 0.7]], ['IJzer', 'ijzer', [7.9]], ['Aluminium', 'aluminium', [2.7]], ['Glas', 'glas', [2.5]], ['IJs', 'ijs', [0.9]], ['Goud', 'goud', [19.3]], ['Beton', 'beton', [2.4]], ['Kurk', 'kurk', [0.2]]]);
            var d = R.kies(it[2]), V = it[1] === 'goud' ? R.heel(1, 10) * 10 : R.heel(2, 40) * 100, g = d * V;
            return { vraag:'Hoeveel kg weegt het blok?', context:it[0] + ' weegt ' + T(d) + ' gram per cm³. Een blok ' + it[1] + ' heeft een inhoud van ' + T(V) + ' cm³.', eenheid:'kg', stappen:[
              { tekst:'De massa in gram: ' + T(d) + ' × ' + T(V) + ' =', antwoord:metE(T(g), 'g', ['gram']), eenheid:'g', hint:'Elke cm³ weegt ' + T(d) + ' gram. Er zijn ' + T(V) + ' cm³.' },
              { tekst:'In kilogram: ' + T(g) + ' : 1000 =', antwoord:metE(T(g / 1000), 'kg'), eenheid:'kg', hint:'1000 gram is 1 kg. Schuif de komma 3 plaatsen naar links.', fout:F(T(g), 'Dat is in gram. Reken nog om naar kg.') } ] };
          } },
        { id:'snel-cilinder', naam:'Inhoud van een cilinder', kort:'Grondvlak × hoogte, en het grondvlak is een cirkel: π × r × r',
          uit:'<p>Een blik is een <b>cilinder</b>. Net als bij een balk is de inhoud: <b>grondvlak × hoogte</b>.</p><p>Het grondvlak is een cirkel: π × straal × straal. Met straal 4 cm: 3,14 × 4 × 4 = 50,24 cm². Is het blik 10 cm hoog, dan is de inhoud 50,24 × 10 = 502,4 cm³.</p>',
          wanneer:'je de inhoud van iets ronds en recht zoekt, zoals een blik of een ton.',
          maak:function(R){
            var r = R.heel(2, 10), h = R.heel(5, 30), gv = 3.14 * r * r, ex = gv * h;
            var ant = uniek([].concat(metE(T(r2(ex)), 'cm³'), metE(T(r1(ex)), 'cm³'), metE(T(Math.round(ex)), 'cm³'), metE(T(r1(Math.PI * r * r * h)), 'cm³'), metE(T(Math.round(Math.PI * r * r * h)), 'cm³')));
            var wat = R.kies(['Een blik soep', 'Een regenton', 'Een kaars', 'Een koker', 'Een vaas']);
            function pl(){
              var cx = 140, rx = 80, ry = 22, top = 52, H = Math.max(60, Math.min(190, rx * h / r)), s = '';
              s += '<path d="M' + (cx - rx) + ' ' + top + ' V' + (top + H) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + (top + H) + ' V' + top + '" style="fill:var(--lr-1);fill-opacity:.18;stroke:var(--ink);stroke-width:2.5"/>';
              s += '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" style="fill:var(--lr-1);fill-opacity:.3;stroke:var(--ink);stroke-width:2.5"/>';
              s += ln(cx, top, cx + rx, top, { k:K[1], w:3 }) + tx(cx + rx / 2, top - ry - 8, 'r = ' + r + ' cm', { k:K[1], vet:true });
              s += ln(cx + rx + 16, top, cx + rx + 16, top + H, { w:1.5 }) + tx(cx + rx + 24, top + H / 2, 'h = ' + h + ' cm', { a:'start', vet:true });
              return svg(330, top + H + ry + 10, s, 'cilinder', 330);
            }
            var p = pl();
            return { vraag:'cilinder: r = ' + r + ' cm, h = ' + h + ' cm', context:wat + ' is een cilinder. Reken met π ≈ 3,14.', eenheid:'cm³', antwoord:ant, beeld:p, stappen:[
              { tekst:'Straal × straal: ' + r + ' × ' + r + ' =', antwoord:String(r * r), hint:r + ' keer zichzelf.' },
              { tekst:'Het grondvlak: 3,14 × ' + (r * r) + ' =', antwoord:metE(T(r2(gv)), 'cm²'), eenheid:'cm²', hint:'3 × ' + (r * r) + ' = ' + (3 * r * r) + ', en 0,14 × ' + (r * r) + ' = ' + T(0.14 * r * r) + '.' },
              { tekst:'Grondvlak × hoogte: ' + T(r2(gv)) + ' × ' + h + ' =', antwoord:ant, eenheid:'cm³', hint:'Het grondvlak keer ' + h + '.' } ] };
          } },
        { id:'snel-prisma', naam:'Inhoud van een prisma', kort:'Grondvlak × lengte, en het grondvlak is een driehoek',
          uit:'<p>Een tent of een dak heeft vaak de vorm van een <b>prisma</b>: voor en achter een driehoek, en daartussen een lange vorm.</p><p>De inhoud is weer <b>grondvlak × lengte</b>. Het grondvlak is de driehoek: basis × hoogte : 2.</p><p>Driehoek met basis 3 m en hoogte 2 m: 3 × 2 : 2 = 3 m². Tent van 4 m lang: 3 × 4 = 12 m³.</p>',
          wanneer:'de voorkant een driehoek is en de vorm daarachter gelijk blijft.',
          maak:function(R){
            var it = R.kies([['Een tent', 'm', [2, 4], [1, 3], [2, 5]], ['Een doos voor chocolade', 'cm', [3, 6], [2, 6], [15, 30]], ['Een zolder', 'm', [4, 8], [2, 4], [5, 12]], ['Een stuk kaas', 'cm', [4, 10], [3, 8], [5, 15]]]);
            var b, h; do { b = R.heel(it[2][0], it[2][1]); h = R.heel(it[3][0], it[3][1]); } while ((b * h) % 2);
            var L = R.heel(it[4][0], it[4][1]), e = it[1], gv = b * h / 2;
            function pl(){
              var s0 = Math.min(150 / b, 110 / h), W = b * s0, H = h * s0, dx = 120, dy = -50, x0 = 30, y0 = 80 + H, s = '';
              s += pg([[x0 + W / 2, y0 - H], [x0 + W / 2 + dx, y0 - H + dy], [x0 + W + dx, y0 + dy], [x0 + W, y0]], { f:K[0], fo:0.18 });
              s += pg([[x0, y0], [x0 + W, y0], [x0 + W / 2, y0 - H]], { f:K[0], fo:0.4 });
              s += ln(x0 + W / 2, y0 - H, x0 + W / 2, y0, { k:K[1], stip:true }) + tx(x0 + W / 2 + 6, y0 - H / 2 + 14, h + ' ' + e, { a:'start', k:K[1], vet:true });
              s += tx(x0 + W / 2, y0 + 22, b + ' ' + e, { vet:true }) + tx(x0 + W + dx / 2 + 14, y0 + dy / 2 + 8, L + ' ' + e, { a:'start', vet:true });
              return svg(x0 + W + dx + 80, y0 + 34, s, 'prisma met een driehoek als grondvlak', 400);
            }
            var p = pl();
            return { vraag:'prisma: ' + b + ' bij ' + h + ', lengte ' + L + ' ' + e, context:it[0] + ' is een prisma. De voorkant is een driehoek met basis ' + b + ' ' + e + ' en hoogte ' + h + ' ' + e + '. Hij is ' + L + ' ' + e + ' lang.', eenheid:e + '³', beeld:p, stappen:[
              { tekst:'Het grondvlak is de driehoek: ' + b + ' × ' + h + ' : 2 =', antwoord:metE(T(gv), e + '²'), eenheid:e + '²', hint:'Basis × hoogte, en dan de helft.' },
              { tekst:'Grondvlak × lengte: ' + T(gv) + ' × ' + L + ' =', antwoord:metE(T(gv * L), e + '³'), eenheid:e + '³', hint:'Het grondvlak keer ' + L + '.', fout:F(T(b * h * L), 'Je vergat de driehoek te halveren.') } ] };
          } },
        { id:'snel-1op', naam:'Verbruik: 1 op 18', kort:'1 op 18 betekent 18 km op 1 liter: deel de afstand door 18',
          uit:'<p>Een auto rijdt <b>1 op 18</b>. Dat betekent: op 1 liter benzine rijdt hij 18 km.</p><p>Voor 270 km heb je dus 270 : 18 = <b>15 liter</b> nodig. Kost een liter € 2,00, dan betaal je 15 × € 2,00 = € 30,00.</p>',
          wanneer:'het verbruik staat als 1 op een getal.',
          maak:function(R){
            var r = R.kies([12, 14, 15, 16, 18, 20, 25]), L = R.heel(5, 40), d = r * L, p = R.heel(185, 215) / 100;
            return { vraag:'Wat kost de benzine?', context:'Een auto rijdt 1 op ' + r + ': op 1 liter rijdt hij ' + r + ' km. Je rijdt ' + d + ' km. Een liter benzine kost ' + G(p) + '.', stappen:[
              { tekst:'Hoeveel liter? ' + d + ' : ' + r + ' =', antwoord:metE(L, 'liter', ['l']), eenheid:'liter', hint:'Hoe vaak past ' + r + ' km in ' + d + ' km?', fout:F(d * r, 'Je deed keer. Op elke liter rijd je ' + r + ' km, dus deel je.') },
              { tekst:'De kosten: ' + L + ' × ' + G(p) + ' =', antwoord:G(L * p), hint:(function(){ var dc = Math.round(p * 100) - 200; return L + ' × € 2 = € ' + (2 * L) + '.' + (dc ? ' Een liter kost ' + Math.abs(dc) + ' cent ' + (dc > 0 ? 'meer' : 'minder') + ' dan € 2: ' + (dc > 0 ? 'tel ' : 'haal ') + L + ' × ' + Math.abs(dc) + ' = ' + (L * Math.abs(dc)) + ' cent ' + (dc > 0 ? 'erbij.' : 'eraf.') : ''); })() } ] };
          } },
        { id:'snel-per100', naam:'Verbruik: liter per 100 km', kort:'Hoeveel keer 100 km rijd je? Zoveel keer het verbruik',
          uit:'<p>In Europa staat het verbruik vaak als <b>liter per 100 km</b>. Bijvoorbeeld 6 liter per 100 km.</p><p>Rijd je 350 km, dan is dat 3,5 keer 100 km. Je hebt dus 3,5 × 6 = <b>21 liter</b> nodig.</p>',
          wanneer:'het verbruik staat als liter per 100 km.',
          maak:function(R){
            var v = R.kies([4, 4.5, 5, 5.5, 6, 6.5, 7, 8]), d = 50 * R.heel(2, 18), L = v * d / 100;
            return { vraag:'Hoeveel liter heb je nodig?', context:'Een auto gebruikt ' + T(v) + ' liter per 100 km. Je rijdt ' + d + ' km.', eenheid:'liter', stappen:[
              { tekst:d + ' km is hoeveel keer 100 km? ' + d + ' : 100 =', antwoord:T(d / 100), hint:'Schuif de komma 2 plaatsen naar links.' },
              { tekst:T(d / 100) + ' × ' + T(v) + ' =', antwoord:metE(T(L), 'liter', ['l']), eenheid:'liter', hint:'Per 100 km ' + T(v) + ' liter, en dat ' + T(d / 100) + ' keer.' } ] };
          } }
      ] },

    /* ================= tabellen en diagrammen ================= */
    { groep:{ id:'graf-lezen', niveau:'1F', domein:'verbanden', naam:'Tabellen en diagrammen', uit:'Getallen aflezen uit een tabel, een staafdiagram, een lijngrafiek en een beeldgrafiek. Kijk altijd eerst goed naar de schaal.' },
      doelen:[
        { id:'graf-tabel', naam:'Een tabel aflezen', kort:'Zoek de rij en de kolom; waar ze elkaar kruisen staat je getal',
          uit:'<p>Een tabel heeft <b>rijen</b> (van links naar rechts) en <b>kolommen</b> (van boven naar beneden). Bovenaan en links staat waar het over gaat.</p><p>Zoek eerst de goede rij, dan de goede kolom. Waar ze <b>elkaar kruisen</b>, staat het getal dat je zoekt.</p>',
          wanneer:'je gegevens in een tabel krijgt.',
          maak:function(R){
            var th = R.kies([
              { rij:['1A', '1B', '1C', '1D'], kol:['voetbal', 'hockey', 'zwemmen'], vr:function(k, a, b){ return 'Hoeveel leerlingen kiezen ' + k + ' meer in ' + a + ' dan in ' + b + '?'; }, over:'Welke sport kiezen de leerlingen?', lo:2, hi:20 },
              { rij:['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag'], kol:['ochtend', 'middag', 'avond'], vr:function(k, a, b){ return 'Hoeveel bezoekers waren er in de ' + k + ' meer op ' + a + ' dan op ' + b + '?'; }, over:'Bezoekers van het zwembad.', lo:20, hi:99 },
              { rij:['januari', 'februari', 'maart', 'april'], kol:['broden', 'taarten', 'koekjes'], vr:function(k, a, b){ return 'Hoeveel meer ' + k + ' zijn er verkocht in ' + a + ' dan in ' + b + '?'; }, over:'Verkoop van de bakker.', lo:30, hi:250 } ]);
            var data = th.rij.map(function(){ return th.kol.map(function(){ return R.heel(th.lo, th.hi); }); });
            var c = R.heel(0, th.kol.length - 1), i = R.heel(0, th.rij.length - 1), j; do { j = R.heel(0, th.rij.length - 1); } while (j === i);
            if (data[i][c] === data[j][c]) data[i][c] += 1; if (data[i][c] < data[j][c]){ var w0 = i; i = j; j = w0; }
            var v1 = data[i][c], v2 = data[j][c];
            var tab = function(n){ var nad = []; if (n >= 1) nad.push([i + 1, c + 1]); if (n >= 2) nad.push([j + 1, c + 1]);
              return R.teken.tabel([[''].concat(th.kol)].concat(th.rij.map(function(r, k){ return [r].concat(data[k].map(String)); })), { kop:true, zijkop:true, nadruk:nad }); };
            return { vraag:th.kol[c] + ': ' + th.rij[i] + ' − ' + th.rij[j], context:th.over + ' ' + th.vr(th.kol[c], th.rij[i], th.rij[j]), beeld:tab, zelfBeeld:tab(0), stappen:[
              { tekst:'Zoek de rij ' + th.rij[i] + ' en de kolom ' + th.kol[c] + '. Welk getal staat daar?', antwoord:String(v1), hint:'Ga in de rij ' + th.rij[i] + ' naar rechts, tot je onder ' + th.kol[c] + ' staat.' },
              { tekst:'Zoek de rij ' + th.rij[j] + ' en de kolom ' + th.kol[c] + '. Welk getal staat daar?', antwoord:String(v2), hint:'Ga in de rij ' + th.rij[j] + ' naar rechts, tot je onder ' + th.kol[c] + ' staat.' },
              { tekst:'Het verschil: ' + v1 + ' − ' + v2 + ' =', antwoord:String(v1 - v2), hint:'Hoeveel meer is ' + v1 + ' dan ' + v2 + '? Vul aan of trek af.' } ] };
          } },
        { id:'graf-staaf', naam:'Een staafdiagram aflezen', kort:'Zoek eerst uit hoeveel één hokje op de as is, dan pas aflezen',
          uit:'<p>In een <b>staafdiagram</b> is elke staaf een getal. Hoe hoger de staaf, hoe meer.</p><p>Kijk eerst naar de <b>schaal</b> op de as. Niet bij elke lijn staat een getal. Staat er 0, 40, 80, met een lijn ertussen? Dan is elke lijn 20.</p><p>Komt een staaf tot halverwege twee lijnen, dan tel je de helft van een hokje erbij.</p>',
          wanneer:'getallen van groepen naast elkaar in staven staan.',
          maak:function(R){
            var st = R.kies([10, 20, 50, 100]), cats = R.kies([['ma', 'di', 'wo', 'do', 'vr'], ['jan', 'feb', 'mrt', 'apr', 'mei'], ['1A', '1B', '1C', '1D', '1E']]);
            var wat = cats[0] === 'ma' ? 'ijsjes er verkocht zijn' : cats[0] === 'jan' ? 'boeken er geleend zijn' : 'flessen er ingeleverd zijn', as = wat.split(' ')[0];
            var vals = cats.map(function(){ return R.heel(2, 15) * st / 2; }), i = R.heel(0, 4), j; do { j = R.heel(0, 4); } while (j === i);
            if (vals[i] === vals[j]) vals[i] += st / 2; if (vals[i] < vals[j]){ var w0 = i; i = j; j = w0; }
            var pl = function(n){ var kl = {}; if (n >= 2) kl[i] = 1; if (n >= 3) kl[j] = 3; return staafGrafiek(cats, vals, st, { kleur:kl, as:'aantal ' + as, aria:'staafdiagram: aantal ' + as }); };
            return { vraag:cats[i] + ' − ' + cats[j], context:'Het staafdiagram laat zien hoeveel ' + wat + '. Hoeveel meer bij ' + cats[i] + ' dan bij ' + cats[j] + '?', beeld:pl, zelfBeeld:pl(0), stappen:[
              { tekst:'Hoeveel is één hokje, van lijn tot lijn, op de as?', antwoord:String(st), hint:'Tussen 0 en ' + (2 * st) + ' zitten twee hokjes. ' + (2 * st) + ' : 2.' },
              { tekst:'Hoeveel is de staaf van ' + cats[i] + '?', antwoord:T(vals[i]), hint:'Kijk tot welke lijn de staaf komt. Halverwege een hokje is ' + T(st / 2) + ' extra.' },
              { tekst:'Hoeveel is de staaf van ' + cats[j] + '?', antwoord:T(vals[j]), hint:'Kijk tot welke lijn de staaf komt. Halverwege een hokje is ' + T(st / 2) + ' extra.' },
              { tekst:T(vals[i]) + ' − ' + T(vals[j]) + ' =', antwoord:T(vals[i] - vals[j]), hint:'Het verschil tussen de twee staven.' } ] };
          } },
        { id:'graf-lijn', naam:'Een lijngrafiek aflezen', kort:'Lees de schaal af, zoek de lijn eronder en schat het stukje erboven',
          uit:'<p>Een <b>lijngrafiek</b> laat zien hoe iets verandert, bijvoorbeeld de temperatuur op een dag.</p><p>Zoek op de onderste as het moment. Ga recht omhoog naar de lijn, en dan opzij naar de as links.</p><p>Valt het punt <b>tussen twee lijnen</b>? Zoek de lijn eronder en schat hoeveel erbij komt. Precies in het midden is een half hokje.</p>',
          wanneer:'je een waarde uit een lijngrafiek wilt halen.',
          maak:function(R){
            var xs = ['8 uur', '10 uur', '12 uur', '14 uur', '16 uur', '18 uur'], vals = [R.heel(6, 14)], i;
            for (i = 1; i < 6; i++) vals.push(Math.max(3, Math.min(29, vals[i - 1] + R.heel(-3, 5))));
            var k = R.heel(1, 5); if (vals[k] % 2 === 0) vals[k] += vals[k] < 29 ? 1 : -1;
            var pl = function(n){ return lijnGrafiek(xs, vals, 2, { max:32, elke:2, as:'°C', nadruk:[k], lijnen:n >= 2 ? [[k, vals[k] - 1]] : [], aria:'temperatuur op een dag' }); };
            return { vraag:'om ' + xs[k] + ' ' + vals.join(','), vraagHtml:'Hoe warm om ' + xs[k] + '?', context:'De grafiek laat de temperatuur op een dag zien. Hoe warm was het om ' + xs[k] + '?', eenheid:'°C', beeld:pl, zelfBeeld:pl(0), stappen:[
              { tekst:'Hoeveel graden is één hokje op de as?', antwoord:'2', eenheid:'°C', hint:'Er staat 0, 4, 8, met steeds een lijn ertussen. 4 : 2.' },
              { tekst:'Om ' + xs[k] + ' ligt het punt tussen twee lijnen. Welke lijn ligt eronder?', antwoord:String(vals[k] - 1), eenheid:'°C', hint:'Ga vanaf het punt recht omlaag naar de dichtstbijzijnde lijn en lees die af.' },
              { tekst:'Het punt ligt precies in het midden. Hoe warm was het?', antwoord:metE(String(vals[k]), '°C', ['graden']), eenheid:'°C', hint:'Een half hokje is 1 graad. ' + (vals[k] - 1) + ' + 1.' } ] };
          } },
        { id:'graf-beeld', naam:'Een beeldgrafiek aflezen', kort:'Kijk wat één plaatje waard is, tel de plaatjes en vergeet het halve niet',
          uit:'<p>In een <b>beeldgrafiek</b> staat elk plaatje voor een aantal. Onder de grafiek staat hoeveel, bijvoorbeeld: één poppetje is 100 mensen.</p><p>Tel de hele poppetjes en doe keer 100. Een <b>half poppetje</b> is de helft: 50.</p><p>Vier en een half poppetje is 400 + 50 = 450 mensen.</p>',
          wanneer:'een grafiek met plaatjes werkt.',
          maak:function(R){
            var dagen = R.kies([['zaterdag', 'zondag', 'maandag'], ['januari', 'februari', 'maart', 'april'], ['groep 1', 'groep 2', 'groep 3']]), per = R.kies(dagen[0] === 'zaterdag' ? [100, 1000] : dagen[0] === 'januari' ? [50, 100] : [10, 20]);
            var tel = dagen.map(function(){ return R.heel(1, 8) + (R.heel(0, 1) ? 0.5 : 0); }), k = R.heel(0, dagen.length - 1); tel[k] = Math.floor(tel[k]) + 0.5;
            var hele = Math.floor(tel[k]), tot = tel[k] * per, wat = dagen[0] === 'zaterdag' ? 'bezoekers van de dierentuin' : dagen[0] === 'januari' ? 'bezoekers van de bibliotheek' : 'deelnemers aan de sportdag';
            function pl(){
              var s = '';
              dagen.forEach(function(d, r){ var y = 14 + r * 46; s += tx(10, y + 24, d, { a:'start', vet:r === k });
                for (var i = 0; i < Math.floor(tel[r]); i++) s += poppetje(120 + i * 28, y, K[0]);
                if (tel[r] % 1) s += poppetje(120 + Math.floor(tel[r]) * 28, y, K[0], true); });
              var y2 = 14 + dagen.length * 46 + 6;
              s += poppetje(10, y2, K[1]) + tx(40, y2 + 24, '= ' + T(per) + ' ' + (wat.split(' ')[0]), { a:'start', vet:true });
              return svg(380, y2 + 44, s, 'beeldgrafiek', 420);
            }
            var p = pl();
            return { vraag:'Hoeveel ' + (dagen[0] === 'zaterdag' ? 'op ' : dagen[0] === 'januari' ? 'in ' : 'bij ') + dagen[k] + '?', context:'De beeldgrafiek laat de ' + wat + ' zien.', beeld:p, zelfBeeld:p, stappen:[
              { tekst:'Hoeveel hele poppetjes staan er bij ' + dagen[k] + '?', antwoord:String(hele), hint:'Tel alleen de hele poppetjes. Het halve komt zo.' },
              { tekst:hele + ' × ' + T(per) + ' =', antwoord:T(hele * per), hint:'Elk poppetje is ' + T(per) + '.' },
              { tekst:'Plus een half poppetje (' + T(per / 2) + '): ' + T(hele * per) + ' + ' + T(per / 2) + ' =', antwoord:T(tot), hint:'Een half poppetje is de helft van ' + T(per) + '.', fout:F(T(hele * per), 'Vergeet het halve poppetje niet.') } ] };
          } },
        { id:'graf-stijgen', naam:'Stijgen en dalen', kort:'Waar de lijn het steilst omhoog gaat, stijgt het het hardst',
          uit:'<p>Een lijn die omhoog gaat, <b>stijgt</b>. Een lijn die omlaag gaat, <b>daalt</b>.</p><p>Waar stijgt het het hardst? Daar waar de lijn het <b>steilst</b> omhoog gaat. Twijfel je? Reken het verschil uit: hoeveel komt erbij van het ene punt naar het volgende?</p>',
          wanneer:'je wilt weten wanneer iets het snelst groeide of daalde.',
          maak:function(R){
            var jaren = ['2019', '2020', '2021', '2022', '2023', '2024'], dif, a, b, vals, i, ok;
            do {
              a = R.heel(0, 4); do { b = R.heel(0, 4); } while (b === a);
              dif = []; for (i = 0; i < 5; i++) dif.push(5 * R.heel(-3, 1));
              dif[a] = 5 * R.heel(6, 8); dif[b] = 5 * R.heel(2, 4);
              vals = [5 * R.heel(4, 10)]; for (i = 0; i < 5; i++) vals.push(vals[i] + dif[i]);
              ok = Math.min.apply(null, vals) >= 5 && Math.max.apply(null, vals) <= 140;
            } while (!ok);
            var eerst = R.heel(0, 1) ? a : b, tweede = eerst === a ? b : a, wat = R.kies(['Het aantal leden van de sportclub', 'Het aantal leerlingen op school', 'Het aantal bezoekers van het museum (in duizendtallen)']);
            function iv(i){ return 'van ' + jaren[i] + ' tot ' + jaren[i + 1]; }
            var pl = function(n){ var v = []; if (n >= 1) v.push([eerst, eerst + 1, 3]); if (n >= 2) v.push([tweede, tweede + 1, 3]); if (n >= 3) v = [[a, a + 1, 1]];
              return lijnGrafiek(jaren, vals, 5, { elke:2, vlakken:v, aria:'lijngrafiek over de jaren' }); };
            return eindKeuze({ vraag:'stijgen ' + vals.join(','), vraagHtml:'Wanneer stijgt het het hardst?', context:wat + ' van ' + jaren[0] + ' tot ' + jaren[5] + '.', beeld:pl, zelfBeeld:pl(0), stappen:[
              { tekst:'Hoeveel stijgt het ' + iv(eerst) + '?', antwoord:String(dif[eerst]), hint:'Lees beide punten af en trek ze van elkaar af: ' + vals[eerst + 1] + ' − ' + vals[eerst] + '.' },
              { tekst:'Hoeveel stijgt het ' + iv(tweede) + '?', antwoord:String(dif[tweede]), hint:'Lees beide punten af en trek ze van elkaar af: ' + vals[tweede + 1] + ' − ' + vals[tweede] + '.' },
              kstap(R, 'Wanneer stijgt de lijn het hardst?', iv(a), [0, 1, 2, 3, 4].map(iv), 'Waar de lijn het steilst omhoog gaat: daar komt het meeste bij (' + dif[a] + ').') ] });
          } }
      ] },

    /* ================= grafieken 2F ================= */
    { groep:{ id:'graf-reken', niveau:'2F', domein:'verbanden', naam:'Grafieken en diagrammen', uit:'Een cirkeldiagram maken en lezen, een grafiek tekenen bij een tabel, de goede soort grafiek kiezen en coördinaten aflezen.' },
      doelen:[
        { id:'graf-graden', naam:'Cirkeldiagram: procent naar graden', kort:'De hele cirkel is 360°, dus 1% is 3,6°',
          uit:'<p>Een <b>cirkeldiagram</b> laat zien hoe een geheel verdeeld is. Het geheel is 100%, en de hele cirkel is <b>360°</b>.</p><p>Dus 1% is 360 : 100 = <b>3,6°</b>. Een stuk van 25% is 25 × 3,6 = 90°: een kwart van de cirkel.</p><p>Met een geodriehoek teken je het stuk dan precies.</p>',
          wanneer:'je zelf een cirkeldiagram tekent.',
          maak:function(R){
            var p = 5 * R.heel(1, 14), rest = 100 - p, a = 5 * R.heel(1, rest / 5 - 1), b = rest - a, cat = R.kies([['fiets', 'bus', 'lopend'], ['voetbal', 'hockey', 'tennis'], ['pizza', 'pasta', 'patat'], ['vanille', 'aardbei', 'chocolade']]);
            var pl = taart([{ p:p, naam:cat[0] + ': ' + p + '%', nadruk:true, label:p + '%' }, { p:a, naam:cat[1] + ': ' + a + '%' }, { p:b, naam:cat[2] + ': ' + b + '%' }]);
            return { vraag:p + '% = … graden', context:'In een cirkeldiagram is ' + cat[0] + ' ' + p + '%. Hoeveel graden is dat stuk?', eenheid:'°', beeld:pl, stappen:[
              { tekst:'De hele cirkel is 360°. Hoeveel graden is 1%? 360 : 100 =', antwoord:metE('3,6', '°', ['graden']), eenheid:'°', hint:'100% is 360°. Deel door 100.' },
              { tekst:p + ' × 3,6 =', antwoord:metE(T(3.6 * p), '°', ['graden']), eenheid:'°', hint:p + ' × 3 = ' + (3 * p) + ' en ' + p + ' × 0,6 = ' + T(0.6 * p) + '.' } ] };
          } },
        { id:'graf-procent', naam:'Cirkeldiagram: graden naar procent', kort:'Deel de graden door 3,6',
          uit:'<p>Andersom kan ook. Je meet een stuk van een cirkeldiagram: 72°. Hoeveel procent is dat?</p><p>1% is 3,6°. Hoe vaak past 3,6 in 72? 72 : 3,6 = <b>20%</b>.</p><p>Of: 72 van de 360 graden is 72/360 = 0,2 = 20%.</p>',
          wanneer:'je een cirkeldiagram leest met een geodriehoek.',
          maak:function(R){
            var p = 5 * R.heel(1, 14), g = 3.6 * p, rest = 100 - p, a = 5 * R.heel(1, rest / 5 - 1), b = rest - a, cat = R.kies([['bus', 'fiets', 'lopend'], ['tennis', 'voetbal', 'hockey'], ['patat', 'pizza', 'pasta'], ['chocolade', 'vanille', 'aardbei']]);
            var pl = taart([{ p:p, naam:cat[0] + ': ' + T(g) + '°', nadruk:true, label:T(g) + '°' }, { p:a, naam:cat[1] }, { p:b, naam:cat[2] }]);
            return { vraag:T(g) + '° = … %', context:'In een cirkeldiagram is het stuk ' + cat[0] + ' ' + T(g) + '°. Hoeveel procent is dat?', eenheid:'%', beeld:pl, stappen:[
              { tekst:'Hoeveel graden is 1%? 360 : 100 =', antwoord:metE('3,6', '°', ['graden']), eenheid:'°', hint:'100% is de hele cirkel: 360°.' },
              { tekst:T(g) + ' : 3,6 =', antwoord:metE(T(p), '%', ['procent']), eenheid:'%', hint:'Hoe vaak past 3,6 in ' + T(g) + '? Probeer ' + (p - p % 10 || 5) + ' × 3,6 = ' + T(3.6 * (p - p % 10 || 5)) + '.', fout:F(T(g * 3.6), 'Je deed keer. Van graden naar procent deel je.') } ] };
          } },
        { id:'graf-tekenen', naam:'Een grafiek tekenen bij een tabel', kort:'Elke kolom van de tabel is een punt: eerst opzij, dan omhoog',
          uit:'<p>Bij een tabel kun je een grafiek tekenen. Op de <b>horizontale as</b> zet je wat gewoon doorloopt, zoals de tijd. Op de <b>verticale as</b> wat daarvan afhangt, zoals de kosten.</p><p>Elke kolom van de tabel wordt een <b>punt</b>: (uren, kosten). Bij (2, 11) ga je 2 opzij en 11 omhoog.</p><p>Liggen de punten op een rechte lijn? Dan mag je ze verbinden.</p>',
          wanneer:'je bij een tabel een grafiek moet maken.',
          maak:function(R){
            var a = R.heel(2, 6), b = R.heel(0, 10), xs = [0, 1, 2, 3, 4], ys = xs.map(function(x){ return a * x + b; }), k = R.heel(1, 4), y0 = ys[k];
            var st = a * 4 + b > 30 ? 5 : 2, max = Math.ceil((a * 4 + b + 1) / (2 * st)) * 2 * st;
            var wat = R.kies([['Een kano huren', 'per uur', 'vaste kosten'], ['Een fiets huren', 'per uur', 'borg'], ['Een bowlingbaan', 'per uur', 'voor schoenen']]);
            function pl(n){
              var tab = R.teken.tabel([['uren'].concat(xs.map(String)), ['kosten (€)'].concat(ys.map(String))], { zijkop:true, nadruk:n >= 2 ? [[1, k + 1]] : [] });
              var A = assen({ xs:xs.map(String), max:max, stap:st, elke:2, as:'kosten (€)' }), s = A.s;
              xs.forEach(function(x, i){ if (i === k && n < 3) return; s += '<circle cx="' + n1(A.X(i)) + '" cy="' + n1(A.Y(ys[i])) + '" r="' + (i === k ? 7 : 5) + '" style="fill:' + (i === k ? K[1] : K[0]) + '"/>'; });
              s += tx(A.x1, A.yB + 40, 'uren', { a:'end' });
              return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + tab + '<div style="width:100%;max-width:640px">' + svg(580, 290, s, 'grafiek bij de tabel') + '</div></div>';
            }
            return { vraag:'Welk punt hoort bij ' + k + ' uur?', context:wat[0] + ' kost ' + G(a).replace(',00', '') + ' ' + wat[1] + ' plus ' + G(b).replace(',00', '') + ' ' + wat[2] + '. Je tekent de grafiek bij de tabel. Schrijf het punt als (uren, kosten).',
              antwoord:punt(k, y0), controle:puntC(k, y0), beeld:pl, zelfBeeld:pl(0), stappen:[
              kstap(R, 'Wat zet je op de horizontale as?', 'de uren', ['de kosten'], 'Op de horizontale as komt wat gewoon doorloopt, zoals de tijd. De kosten hangen daarvan af.'),
              { tekst:'Bij ' + k + ' uur hoort in de tabel …', antwoord:String(y0), hint:'Zoek ' + k + ' in de rij van de uren. Eronder staan de kosten.' },
              { tekst:'Welk punt zet je in de grafiek? Schrijf (uren, kosten).', antwoord:punt(k, y0), controle:puntC(k, y0), hint:'Eerst opzij (' + k + '), dan omhoog (' + y0 + '). Tussen haakjes, met een komma ertussen.' } ] };
          } },
        { id:'graf-kiezen', naam:'De juiste soort grafiek kiezen', kort:'Verloop in de tijd: lijn. Delen van een geheel: cirkel. Groepen vergelijken: staven',
          uit:'<p>Welke grafiek past, hangt af van wat je wilt laten zien.</p><p>Verandert iets <b>in de tijd</b>? Kies een <b>lijngrafiek</b>. Wil je laten zien hoe een <b>geheel verdeeld</b> is, in procenten? Kies een <b>cirkeldiagram</b>. Wil je losse <b>groepen vergelijken</b>? Kies een <b>staafdiagram</b>.</p>',
          wanneer:'je zelf gegevens in een grafiek moet zetten.',
          beeld:(function(){ var s = '';
            s += rc(20, 70, 22, 50, { f:K[0], fo:0.7, w:0 }) + rc(50, 40, 22, 80, { f:K[0], fo:0.7, w:0 }) + rc(80, 90, 22, 30, { f:K[0], fo:0.7, w:0 }) + ln(14, 120, 112, 120) + tx(64, 146, 'staafdiagram', { vet:true });
            s += '<polyline points="160,110 190,90 220,96 250,60 280,40" style="fill:none;stroke:var(--lr-2);stroke-width:3.5;stroke-linejoin:round"/>' + ln(154, 120, 290, 120) + tx(222, 146, 'lijngrafiek', { vet:true });
            s += '<circle cx="380" cy="78" r="44" style="fill:var(--lr-3);fill-opacity:.5"/><path d="M380 78 L380 34 A44 44 0 0 1 418 100 Z" style="fill:var(--lr-4);fill-opacity:.8"/>' + tx(380, 146, 'cirkeldiagram', { vet:true });
            return svg(450, 156, s, 'drie soorten grafieken', 460); })(),
          maak:function(R){
            var B = {
              lijn:['De temperatuur in je tuin, elk uur gemeten.', 'Je lengte op elke verjaardag, van je 1e tot je 12e.', 'Het aantal bezoekers van een website per maand, een jaar lang.', 'De prijs van benzine, elke week van het jaar.', 'Het gewicht van een puppy, elke week gewogen.', 'De waterstand van de rivier, elke dag gemeten.'],
              cirkel:['Hoe de leerlingen van je klas naar school komen, in procenten.', 'Waar je zakgeld aan opgaat, als deel van het geheel.', 'Welk deel van de stemmen elke partij kreeg.', 'Hoe je dag van 24 uur verdeeld is: slapen, school, sport en vrije tijd.', 'Welk deel van de pizza elk gezinslid at.', 'Hoe de inwoners verdeeld zijn over leeftijdsgroepen, in procenten.'],
              staaf:['Hoeveel leerlingen elke klas heeft.', 'Het aantal doelpunten van vijf spelers.', 'Hoeveel ijsjes er van elke smaak verkocht zijn.', 'De lengte van de vijf langste rivieren van Europa.', 'Hoeveel inwoners vier steden hebben.', 'Hoeveel boeken elke leerling las.'] };
            var soort = R.kies(['lijn', 'cirkel', 'staaf']), zin = R.kies(B[soort]);
            var doel = { lijn:'hoe iets verandert in de tijd', cirkel:'hoe een geheel verdeeld is', staaf:'losse groepen vergelijken' }, naam = { lijn:'een lijngrafiek', cirkel:'een cirkeldiagram', staaf:'een staafdiagram' };
            return eindKeuze({ vraag:'Welke grafiek kies je?', context:zin, stappen:[
              kstap(R, 'Wat wil je laten zien?', doel[soort], [doel.lijn, doel.cirkel, doel.staaf], 'Verandert iets in de tijd? Is het een geheel dat je verdeelt? Of vergelijk je losse groepen?'),
              kstap(R, 'Welke grafiek past?', naam[soort], [naam.lijn, naam.cirkel, naam.staaf], 'In de tijd: lijngrafiek. Delen van een geheel: cirkeldiagram. Groepen vergelijken: staafdiagram.') ] });
          } },
        { id:'graf-coord', naam:'Coördinaten aflezen', kort:'Eerst opzij (x), dan omhoog of omlaag (y): (x, y)',
          uit:'<p>In een <b>assenstelsel</b> geef je een punt aan met twee getallen: de <b>coördinaten</b>. Je begint in het midden, bij (0, 0).</p><p>Het eerste getal is <b>opzij</b>: naar rechts is plus, naar links is min. Het tweede getal is <b>omhoog</b> (plus) of <b>omlaag</b> (min).</p><p>Het punt (3, −2) ligt 3 naar rechts en 2 omlaag. Eerst opzij, dan omhoog: zoals je eerst een huis binnenloopt en dan de trap op gaat.</p>',
          wanneer:'je een punt in een assenstelsel moet aflezen of tekenen.',
          maak:function(R){
            var x, y; do { x = R.heel(-5, 5); y = R.heel(-5, 5); } while (!x || !y || (x > 0 && y > 0 && R.heel(0, 2)));
            var pl = function(n){ return rooster([x, y], { n:n }); };
            return { vraag:'A ' + x + ',' + y, vraagHtml:'Wat zijn de coördinaten van punt A?', context:'Schrijf als (x, y).', antwoord:punt(x, y), controle:puntC(x, y), beeld:pl, zelfBeeld:pl(0), stappen:[
              { tekst:'Eerst opzij vanaf (0, 0). Hoeveel stappen? Naar links is min.', antwoord:T(x), hint:'Tel de hokjes van het midden naar ' + (x > 0 ? 'rechts.' : 'links. Naar links schrijf je een min ervoor.'), fout:F(T(-x), 'Let op de richting: ' + (x > 0 ? 'naar rechts is plus.' : 'naar links is min.')) },
              { tekst:'Dan omhoog of omlaag. Hoeveel stappen? Naar beneden is min.', antwoord:T(y), hint:'Tel de hokjes van de x-as naar ' + (y > 0 ? 'boven.' : 'beneden. Naar beneden schrijf je een min ervoor.'), fout:F(T(-y), 'Let op de richting: ' + (y > 0 ? 'omhoog is plus.' : 'omlaag is min.')) },
              { tekst:'De coördinaten van A zijn:', antwoord:punt(x, y), controle:puntC(x, y), hint:'Eerst opzij, dan omhoog of omlaag: (' + T(x) + ', ' + T(y) + ').', fout:F(punt(y, x), 'Je draaide ze om. Eerst opzij, dan pas omhoog of omlaag.') } ] };
          } }
      ] },

    /* ================= gemiddelde 2F ================= */
    { groep:{ id:'gem-basis', niveau:'2F', domein:'verbanden', naam:'Gemiddelde en andere centrummaten', uit:'Het gemiddelde, de mediaan en de modus zeggen elk op een andere manier wat een gewone waarde is. De spreiding zegt hoe ver de getallen uit elkaar liggen.' },
      doelen:[
        { id:'gem-berekenen', naam:'Het gemiddelde berekenen', kort:'Tel alles op en deel door het aantal',
          uit:'<p>Het <b>gemiddelde</b> krijg je door alles eerlijk te verdelen. Tel alle getallen op en <b>deel door het aantal</b> getallen.</p><p>Je cijfers zijn 6, 8, 5 en 7. Samen 26. Het zijn 4 cijfers: 26 : 4 = <b>6,5</b>.</p>',
          wanneer:'je wilt weten wat een getal gemiddeld is, zoals je cijfer voor een vak.',
          maak:function(R){
            var it = R.kies([['je cijfers', 3, 10], ['het aantal doelpunten per wedstrijd', 0, 6], ['de punten van een quiz', 10, 30], ['de temperatuur op vijf dagen', 8, 24]]), n, l, s;
            do { n = R.heel(4, 6); l = []; for (var i = 0; i < n; i++) l.push(R.heel(it[1], it[2])); s = som(l); } while ((s * 10) % n !== 0);
            return { vraag:rij(l), context:'Wat is het gemiddelde van ' + it[0] + '?', stappen:[
              { tekst:'Tel alles op: ' + l.join(' + ') + ' =', antwoord:String(s), hint:'Tel twee aan twee op, of zoek getallen die samen 10 zijn.' },
              { tekst:'Hoeveel getallen zijn het?', antwoord:String(n), hint:'Tel de getallen, niet hun waarde.' },
              { tekst:s + ' : ' + n + ' =', antwoord:T(s / n), hint:'Verdeel ' + s + ' eerlijk over ' + n + '.', fout:F(s, 'Dat is de som. Deel nog door het aantal.') } ] };
          } },
        { id:'gem-frequentie', naam:'Gemiddelde met een tabel', kort:'Doe elke waarde keer hoe vaak hij voorkomt, tel op en deel door het totaal aantal',
          uit:'<p>Soms staan de gegevens in een tabel met <b>aantallen</b>: hoe vaak elk cijfer voorkomt.</p><p>Drie keer een 6 is 3 × 6 = 18. Doe zo <b>elke rij keer het aantal</b> en tel alles op. Deel door het <b>totaal aantal</b>, niet door het aantal rijen.</p>',
          wanneer:'er staat hoe vaak elke waarde voorkomt.',
          maak:function(R){
            var it = R.kies([['cijfer', 'leerlingen', 4, 9, 'De cijfers voor een toets.'], ['broers en zussen', 'leerlingen', 0, 4, 'Hoeveel broers en zussen hebben de leerlingen?'], ['doelpunten', 'wedstrijden', 0, 5, 'Het aantal doelpunten per wedstrijd.']]);
            var w, a, N, S, poging = 0;
            do { var start = R.heel(it[2], it[3] - 3); w = [start, start + 1, start + 2, start + 3]; a = w.map(function(){ return R.heel(1, 8); }); N = som(a); S = som(w.map(function(x, i){ return x * a[i]; })); poging++; } while ((S * 10) % N !== 0 && poging < 300);
            var gem = (S * 10) % N === 0 ? T(S / N) : T(r1(S / N));
            var tab = function(n){ return R.teken.tabel([[it[0], 'aantal ' + it[1]].concat(n >= 2 ? ['samen'] : [])].concat(w.map(function(x, i){ return [String(x), String(a[i])].concat(n >= 2 ? [String(x * a[i])] : []); })), { kop:true }); };
            return { vraag:'gemiddeld ' + it[0] + ': ' + a.join('-') + ' bij ' + w.join('-'), vraagHtml:'Wat is het gemiddelde?', context:it[4] + ((S * 10) % N ? ' Rond af op één decimaal.' : ''), beeld:tab, zelfBeeld:tab(0), stappen:[
              { tekst:'Hoeveel ' + it[1] + ' zijn er in totaal? ' + a.join(' + ') + ' =', antwoord:String(N), hint:'Tel de aantallen op.' },
              { tekst:'Elke waarde keer het aantal, opgeteld: ' + w.map(function(x, i){ return x + ' × ' + a[i]; }).join(' + ') + ' =', antwoord:String(S), hint:'Reken elke rij uit en tel de uitkomsten op.' },
              { tekst:S + ' : ' + N + ' =', antwoord:gem, hint:'Deel het totaal door het aantal ' + it[1] + ': ' + N + '.', fout:F(T(S / 4), 'Je deelde door het aantal rijen. Deel door het totaal aantal ' + it[1] + '.') } ] };
          } },
        { id:'gem-terug', naam:'Terugrekenen: welk cijfer heb je nodig?', kort:'Gemiddelde × aantal is het totaal dat je nodig hebt; haal eraf wat je al hebt',
          uit:'<p>Je hebt een 5, een 7 en een 4. Er komt nog één toets. Welk cijfer heb je nodig voor gemiddeld een 6?</p><p>Reken <b>terug</b>. Voor gemiddeld 6 met 4 cijfers heb je in totaal 6 × 4 = 24 nodig. Je hebt al 5 + 7 + 4 = 16. Je mist dus nog 24 − 16 = <b>8</b>.</p>',
          wanneer:'je wilt weten wat je nog moet halen.',
          maak:function(R){
            var k, l, g, nodig, s;
            do { k = R.heel(2, 4); l = []; for (var i = 0; i < k; i++) l.push(R.heel(3, 9)); g = R.kies([5.5, 6, 6, 6.5, 7]); s = som(l); nodig = g * (k + 1) - s; } while (nodig < 1 || nodig > 10 || (nodig * 2) % 1);
            return { vraag:'Welk cijfer heb je nodig?', context:'Je hebt de cijfers ' + rij(l) + '. Er komt nog één toets bij. Je wilt gemiddeld een ' + T(g) + '.', stappen:[
              { tekst:'Voor gemiddeld ' + T(g) + ' met ' + (k + 1) + ' cijfers heb je in totaal nodig: ' + T(g) + ' × ' + (k + 1) + ' =', antwoord:T(g * (k + 1)), hint:'Het gemiddelde keer het aantal cijfers, met de nieuwe erbij.' },
              { tekst:'Je hebt al: ' + l.join(' + ') + ' =', antwoord:String(s), hint:'Tel je cijfers op.' },
              { tekst:T(g * (k + 1)) + ' − ' + s + ' =', antwoord:T(nodig), hint:'Wat je nodig hebt, min wat je al hebt.' } ] };
          } },
        { id:'gem-mediaan', naam:'De mediaan', kort:'Zet de getallen op volgorde; het middelste getal is de mediaan',
          uit:'<p>De <b>mediaan</b> is het middelste getal. Zet alle getallen eerst <b>op volgorde</b>, van klein naar groot.</p><p>Bij 7 getallen is het 4e getal het middelste: er staan er 3 links en 3 rechts van.</p><p>Bij een even aantal zijn er twee in het midden. Dan neem je het getal precies tussen die twee.</p><p>Eén heel groot getal maakt de mediaan niet groter. Het gemiddelde wel.</p>',
          wanneer:'er een paar uitschieters tussen de getallen zitten.',
          maak:function(R){
            var n = R.kies([5, 7, 9]), l = [], i; for (i = 0; i < n; i++) l.push(R.heel(2, 40));
            var o = l.slice().sort(function(a, b){ return a - b; }), mid = (n + 1) / 2, wat = R.kies(['reistijden in minuten', 'punten bij een spel', 'bedragen zakgeld per maand, in euro', 'lengtes van sprongen, in dm']);
            var tab = function(k){ return R.teken.tabel([k >= 1 ? o.map(String) : l.map(String)], { nadruk:k >= 3 ? [[0, mid - 1]] : [] }); };
            return { vraag:rij(l), context:'Wat is de mediaan van deze ' + wat + '?', beeld:tab, stappen:[
              { tekst:'Zet de getallen op volgorde van klein naar groot. Welk getal komt vooraan?', antwoord:String(o[0]), hint:'Zoek het kleinste getal.' },
              { tekst:'Er zijn ' + n + ' getallen. Het middelste is het …-de getal.', antwoord:String(mid), hint:'Links en rechts van het midden staan evenveel getallen: (' + n + ' + 1) : 2.' },
              { tekst:'Welk getal staat op plek ' + mid + '? Dat is de mediaan.', antwoord:String(o[mid - 1]), hint:'Tel in de rij op volgorde ' + mid + ' plekken van links.', fout:F(l[mid - 1], 'Dat is het middelste getal zonder volgorde. Gebruik de rij op volgorde.') } ] };
          } },
        { id:'gem-modus', naam:'De modus', kort:'Het getal dat het vaakst voorkomt',
          uit:'<p>De <b>modus</b> is het getal dat het <b>vaakst</b> voorkomt. Een winkel wil bijvoorbeeld weten welke schoenmaat het meest verkocht wordt.</p><p>Maak een turftabel: zet bij elk getal een streepje als je het tegenkomt. Het getal met de meeste streepjes is de modus.</p>',
          wanneer:'je wilt weten wat het meest voorkomt.',
          maak:function(R){
            var it = R.kies([['schoenmaten', 36, 44], ['cijfers', 4, 9], ['leeftijden', 12, 17]]), vals = [], i;
            for (i = it[1]; i <= it[2]; i++) vals.push(i);
            vals = R.hussel(vals); var M = vals[0], Sx = vals[1], cm = R.heel(3, 5), lijst = [];
            for (i = 0; i < cm; i++) lijst.push(M); for (i = 0; i < cm - 1; i++) lijst.push(Sx);
            var ander = vals.slice(2, 2 + R.heel(3, 4)); ander.forEach(function(x){ lijst.push(x); if (cm - 1 > 2 && R.heel(0, 1)) lijst.push(x); });
            lijst = R.hussel(lijst);
            var A = R.heel(0, 1) ? M : Sx, B = A === M ? Sx : M;
            function tel(x){ return lijst.filter(function(y){ return y === x; }).length; }
            var soorten = uniek(lijst.slice()).sort(function(a, b){ return a - b; });
            var tab = function(n){ return R.teken.tabel([[it[0]].concat(soorten.map(String)), ['hoe vaak'].concat(soorten.map(function(x){ return (n >= 1 && x === A) || (n >= 2 && x === B) ? String(tel(x)) : ''; }))], { zijkop:true, nadruk:n >= 3 ? [[1, soorten.indexOf(M) + 1]] : [] }); };
            return { vraag:rij(lijst), context:'Wat is de modus van deze ' + it[0] + '?', beeld:tab, stappen:[
              { tekst:'Hoe vaak komt ' + A + ' voor?', antwoord:String(tel(A)), hint:'Zet een streepje bij elke ' + A + ' die je tegenkomt.' },
              { tekst:'Hoe vaak komt ' + B + ' voor?', antwoord:String(tel(B)), hint:'Zet een streepje bij elke ' + B + ' die je tegenkomt.' },
              { tekst:'Welk getal komt het vaakst voor? De modus is', antwoord:String(M), hint:M + ' komt ' + cm + ' keer voor, vaker dan de rest.', fout:F(cm, 'Dat is hoe vaak het voorkomt. De modus is het getal zelf.') } ] };
          } },
        { id:'gem-spreiding', naam:'De spreiding', kort:'Het verschil tussen het hoogste en het laagste getal',
          uit:'<p>Twee klassen kunnen hetzelfde gemiddelde hebben, maar toch heel anders zijn. In de ene klas liggen alle cijfers dicht bij elkaar, in de andere heel ver uit elkaar.</p><p>De <b>spreiding</b> zegt hoe ver de getallen uit elkaar liggen: <b>hoogste min laagste</b>. Van 3 tot 9 is een spreiding van 6.</p><p>Let op bij temperaturen onder nul: van −3 tot 8 is 11 graden.</p>',
          wanneer:'je wilt weten hoe ver getallen uit elkaar liggen.',
          maak:function(R){
            var temp = R.heel(0, 1) === 1, n = R.heel(6, 8), l = [], i;
            for (i = 0; i < n; i++) l.push(temp ? R.heel(-8, 12) : R.heel(10, 95));
            if (temp && Math.min.apply(null, l) >= 0) l[R.heel(0, n - 1)] = -R.heel(1, 8);
            var hi = Math.max.apply(null, l), lo = Math.min.apply(null, l);
            return { vraag:rij(l), context:temp ? 'De laagste temperatuur op ' + n + ' dagen in de winter, in °C. Wat is de spreiding?' : 'De punten van ' + n + ' teams bij een quiz. Wat is de spreiding?', eenheid:temp ? '°C' : '', stappen:[
              { tekst:'Wat is het hoogste getal?', antwoord:T(hi), hint:'Zoek het grootste getal in de rij.' },
              { tekst:'Wat is het laagste getal?', antwoord:T(lo), hint:lo < 0 ? 'Een min-getal is kleiner dan 0. Hoe groter het getal na de min, hoe lager.' : 'Zoek het kleinste getal in de rij.' },
              { tekst:T(hi) + ' − ' + (lo < 0 ? '(' + T(lo) + ')' : T(lo)) + ' =', antwoord:T(hi - lo), hint:lo < 0 ? 'Van ' + T(lo) + ' naar 0 is ' + (-lo) + ', en van 0 naar ' + T(hi) + ' is ' + T(hi) + '. Samen.' : 'Het hoogste min het laagste.', fout:lo < 0 ? F(T(hi + lo), 'Min een min-getal: je moet het verschil over de 0 heen tellen.') : {} } ] };
          } }
      ] },

    /* ================= formules 2F ================= */
    { groep:{ id:'form-basis', niveau:'2F', domein:'verbanden', naam:'Formules', uit:'Een formule is een rekenrecept. Je vult een getal in, rekent in de goede volgorde en krijgt de uitkomst.' },
      doelen:[
        { id:'form-woord', naam:'Een woordformule invullen', kort:'Vul het getal in op de plek van het woord en reken: eerst keer, dan plus',
          uit:'<p>Een <b>woordformule</b> zegt in woorden hoe je iets uitrekent. Bijvoorbeeld: kosten = 8 × aantal dagen + 5.</p><p>Huur je 3 dagen? Zet 3 op de plek van <b>aantal dagen</b>: 8 × 3 + 5.</p><p>Reken in de goede volgorde: eerst <b>keer</b>, dan <b>plus</b>. 8 × 3 = 24, en 24 + 5 = 29.</p>',
          wanneer:'er een formule in woorden staat.',
          maak:function(R){
            var it = R.kies([
              { f:'prijs = 2,50 × aantal km + 4', a:2.5, b:4, x:[3, 20], c:function(x){ return 'Een taxi rekent zo. Je rijdt ' + x + ' km.'; }, e:'euro' },
              { f:'kosten = 8 × aantal dagen + 5', a:8, b:5, x:[2, 10], c:function(x){ return 'Een fiets huren. Je huurt hem ' + x + ' dagen.'; }, e:'euro' },
              { f:'hoogte = 3 × aantal weken + 10', a:3, b:10, x:[2, 12], c:function(x){ return 'Een plant groeit. Hoe hoog is hij na ' + x + ' weken, in cm?'; }, e:'cm' },
              { f:'lengte = 20 − 2 × aantal uren', a:2, b:20, x:[1, 9], min:true, c:function(x){ return 'Een kaars brandt. Hoe lang is hij na ' + x + ' uur, in cm?'; }, e:'cm' },
              { f:'totaal = 12 × aantal personen + 3', a:12, b:3, x:[2, 9], c:function(x){ return 'Bioscoopkaartjes, met servicekosten. Je gaat met ' + x + ' personen.'; }, e:'euro' },
              { f:'loon = 9 × aantal uren + 15', a:9, b:15, x:[3, 12], c:function(x){ return 'Je verdient bij een klus. Je werkt ' + x + ' uur.'; }, e:'euro' } ]);
            var x = R.heel(it.x[0], it.x[1]), ax = it.a * x, uit = it.min ? it.b - ax : ax + it.b;
            return { vraag:it.f, context:it.c(x) + ' Vul de formule in.', stappen:[
              { tekst:'Eerst keer: ' + T(it.a) + ' × ' + x + ' =', antwoord:T(ax), hint:'Vul ' + x + ' in op de plek van het woord achter het keerteken.' },
              { tekst:it.min ? it.b + ' − ' + T(ax) + ' =' : T(ax) + ' + ' + it.b + ' =', antwoord:T(uit), hint:it.min ? 'Haal ' + T(ax) + ' van ' + it.b + ' af.' : 'Tel er ' + it.b + ' bij.', fout:F(T(it.min ? (it.b - it.a) * x : it.a * (x + it.b)), 'Je deed de volgorde verkeerd. Eerst keer, dan plus of min.') } ] };
          } },
        { id:'form-letters', naam:'Een formule met letters invullen', kort:'Een letter is een kort woord: vul het getal in en reken eerst keer, dan plus',
          uit:'<p>In een formule met <b>letters</b> staat elke letter voor iets. Bijvoorbeeld K = 4,5 × u + 20. Hier is K de prijs in euro en u het aantal uren.</p><p>Je rekent precies hetzelfde als bij een woordformule. Is u = 6? Dan K = 4,5 × 6 + 20 = 27 + 20 = <b>47</b>.</p>',
          wanneer:'er een formule met letters staat.',
          maak:function(R){
            var L = R.kies([['K', 'u', 'K is de prijs in euro en u het aantal uren.'], ['P', 'n', 'P is het aantal punten en n het aantal goede antwoorden.'], ['H', 't', 'H is de hoogte in cm en t de tijd in weken.'], ['A', 'x', 'A is het bedrag in euro en x het aantal kaartjes.']]);
            var a = R.kies([1.5, 2, 2.5, 3, 4, 4.5, 6, 12, 0.8]), b = R.kies([5, 10, 12, 20, 25, 50]), x = R.heel(2, 12), min = R.heel(0, 3) === 0 && a * x < b;
            var f = L[0] + ' = ' + (min ? b + ' − ' + T(a) + ' × ' + L[1] : T(a) + ' × ' + L[1] + ' + ' + b), ax = a * x;
            return { vraag:f, context:L[2] + ' Bereken ' + L[0] + ' als ' + L[1] + ' = ' + x + '.', stappen:[
              { tekst:'Vul ' + L[1] + ' = ' + x + ' in. Eerst keer: ' + T(a) + ' × ' + x + ' =', antwoord:T(ax), hint:'Op de plek van ' + L[1] + ' komt ' + x + '.' },
              { tekst:min ? b + ' − ' + T(ax) + ' =' : T(ax) + ' + ' + b + ' =', antwoord:T(min ? b - ax : ax + b), hint:min ? 'Haal ' + T(ax) + ' van ' + b + ' af.' : 'Tel er ' + b + ' bij.' } ] };
          } },
        { id:'form-tabel', naam:'Een tabel maken bij een formule', kort:'Vul elk getal uit de bovenste rij in de formule in',
          uit:'<p>Bij een formule kun je een <b>tabel</b> maken. In de bovenste rij staan de getallen die je invult. Daaronder komt de uitkomst.</p><p>Formule: kosten = 3 × uren + 5. Bij 2 uur: 3 × 2 + 5 = 11. Bij 4 uur: 3 × 4 + 5 = 17.</p><p>Kijk daarna of het klopt: er komt steeds hetzelfde bij.</p>',
          wanneer:'je wilt zien hoe een formule verloopt, of een grafiek wilt tekenen.',
          maak:function(R){
            var c = R.kies([['kosten', 'uren', 'uur'], ['lengte', 'weken', 'weken'], ['prijs', 'kilo', 'kilo'], ['punten', 'rondes', 'rondes']]), a = R.heel(2, 9), b = R.heel(1, 20), xs = [1, 2, 3, 4, 5], leeg = R.kies([[2, 3, 5], [1, 3, 4], [2, 4, 5], [1, 2, 5]]);
            function y(x){ return a * x + b; }
            var tab = function(n){ return R.teken.tabel([[c[1]].concat(xs.map(String)), [c[0]].concat(xs.map(function(x){ var i = leeg.indexOf(x); return i < 0 || i < n ? String(y(x)) : '?'; }))], { zijkop:true }); };
            return { vraag:c[0] + ' = ' + a + ' × ' + c[1] + ' + ' + b, context:'Maak de tabel af. Welk getal komt in het laatste lege vakje, bij ' + leeg[2] + ' ' + c[2] + '?', beeld:tab, zelfBeeld:tab(0),
              stappen:leeg.map(function(x){ return { tekst:'Bij ' + x + ' ' + c[2] + ': ' + a + ' × ' + x + ' + ' + b + ' =', antwoord:String(y(x)), hint:'Eerst ' + a + ' × ' + x + ' = ' + (a * x) + ', dan + ' + b + '.' }; }) };
          } },
        { id:'form-vinden', naam:'De formule uit een tabel halen', kort:'Wat er steeds bijkomt staat voor de letter, het startgetal komt erachter',
          uit:'<p>Uit een tabel kun je de formule halen. Kijk eerst <b>wat er steeds bijkomt</b>. Komt er steeds 3 bij? Dan staat er 3 × uren in de formule.</p><p>Zoek dan het <b>startgetal</b>: wat hoort bij 0? Staat 0 niet in de tabel, reken dan terug: haal één keer de 3 eraf.</p><p>Startgetal 5: kosten = 3 × uren + 5.</p>',
          wanneer:'je bij een tabel de formule zoekt.',
          maak:function(R){
            var c = R.kies([['kosten', 'uren'], ['lengte', 'weken'], ['hoogte', 'dagen'], ['punten', 'rondes']]), a, b; do { a = R.heel(2, 9); b = R.heel(1, 15); } while (a === b);
            var start = R.heel(0, 1), xs = [0, 1, 2, 3, 4].map(function(x){ return x + start; }), ys = xs.map(function(x){ return a * x + b; });
            var tab = R.teken.tabel([[c[1]].concat(xs.map(String)), [c[0]].concat(ys.map(String))], { zijkop:true });
            var goed = c[0] + ' = ' + a + ' × ' + c[1] + ' + ' + b;
            return eindKeuze({ vraag:'tabel ' + c[0] + ' ' + ys.join(' '), vraagHtml:'Welke formule hoort bij de tabel?', beeld:tab, zelfBeeld:tab, stappen:[
              { tekst:'Wat komt er steeds bij?', antwoord:String(a), hint:'Kijk van het ene vakje naar het volgende: ' + ys[0] + ' en ' + ys[1] + '.' },
              { tekst:'Wat hoort bij 0? Dat is het startgetal.', antwoord:String(b), hint:start ? 'Bij 1 hoort ' + ys[0] + '. Ga één stap terug: ' + ys[0] + ' − ' + a + '.' : 'Kijk in de tabel onder 0.', fout:F(ys[0], start ? 'Dat hoort bij 1. Reken één stap terug naar 0.' : '') },
              kstap(R, 'Welke formule hoort bij de tabel?', goed, [c[0] + ' = ' + b + ' × ' + c[1] + ' + ' + a, c[0] + ' = ' + a + ' × ' + c[1], c[0] + ' = ' + (a + b) + ' × ' + c[1]], 'Wat er steeds bijkomt (' + a + ') staat voor de letter. Het startgetal (' + b + ') komt erachter.') ] });
          } },
        { id:'form-haakjes', naam:'Formules met haakjes', kort:'Wat tussen haakjes staat, reken je eerst uit',
          uit:'<p>In een formule kunnen <b>haakjes</b> staan. Wat tussen haakjes staat, reken je <b>eerst</b> uit. Daarna keer en delen, en als laatste plus en min.</p><p>Omtrek = 2 × (lengte + breedte). Lengte 7, breedte 4: eerst 7 + 4 = 11, dan 2 × 11 = 22.</p><p>Zonder haakjes zou je eerst 2 × 7 doen, en dan klopt het niet.</p>',
          wanneer:'er haakjes in een formule staan.',
          maak:function(R){
            var s = R.heel(0, 3), x, y;
            if (s === 0){ x = R.heel(4, 15); y = R.heel(2, x - 1);
              return { vraag:'omtrek = 2 × (lengte + breedte)', context:'Een rechthoek is ' + x + ' cm lang en ' + y + ' cm breed.', eenheid:'cm', stappen:[
                { tekst:'Eerst de haakjes: ' + x + ' + ' + y + ' =', antwoord:String(x + y), hint:'Lengte plus breedte.' },
                { tekst:'Dan keer 2: 2 × ' + (x + y) + ' =', antwoord:metE(2 * (x + y), 'cm'), eenheid:'cm', hint:'Twee keer het antwoord van de haakjes.', fout:F(2 * x + y, 'Je deed eerst keer. Wat tussen haakjes staat, reken je eerst uit.') } ] }; }
            if (s === 1){ x = R.heel(4, 10);
              return { vraag:'hoekensom = (aantal hoeken − 2) × 180', context:'Bereken de som van de hoeken van een figuur met ' + x + ' hoeken.', eenheid:'°', stappen:[
                { tekst:'Eerst de haakjes: ' + x + ' − 2 =', antwoord:String(x - 2), hint:'Het aantal hoeken min 2.' },
                { tekst:'Dan keer 180: ' + (x - 2) + ' × 180 =', antwoord:metE(180 * (x - 2), '°', ['graden']), eenheid:'°', hint:(x - 2) + ' × 18 = ' + (18 * (x - 2)) + ', en dan nog × 10.', fout:F(x - 360, 'Je deed eerst keer. Eerst de haakjes.') } ] }; }
            if (s === 2){ x = R.heel(5, 25); y = R.kies([4, 5, 6, 8]);
              return { vraag:'prijs = (aantal kinderen + 1) × ' + y, context:'Een uitje kost € ' + y + ' per persoon. De begeleider moet ook betalen. Je gaat met ' + x + ' kinderen.', stappen:[
                { tekst:'Eerst de haakjes: ' + x + ' + 1 =', antwoord:String(x + 1), hint:'De kinderen plus de begeleider.' },
                { tekst:'Dan keer ' + y + ': ' + (x + 1) + ' × ' + y + ' =', antwoord:String((x + 1) * y), hint:(x + 1) + ' personen van € ' + y + '.', fout:F(x * y + 1, 'Je deed eerst keer. Eerst de haakjes.') } ] }; }
            x = R.heel(5, 20);
            return { vraag:'K = (a − 3) × 4 + 2', context:'Bereken K als a = ' + x + '.', stappen:[
              { tekst:'Eerst de haakjes: ' + x + ' − 3 =', antwoord:String(x - 3), hint:'Vul ' + x + ' in voor a.' },
              { tekst:'Dan keer 4: ' + (x - 3) + ' × 4 =', antwoord:String(4 * (x - 3)), hint:'Keer gaat voor plus.' },
              { tekst:'Als laatste plus 2: ' + (4 * (x - 3)) + ' + 2 =', antwoord:String(4 * (x - 3) + 2), hint:'Nu nog de plus.', fout:F(4 * (x - 3 + 2), 'Plus 2 staat buiten de haakjes. Die doe je als laatste.') } ] };
          } }
      ] },
    { groep:{ id:'form-om', niveau:'3F', domein:'verbanden', naam:'Formules omdraaien', uit:'Je weet de uitkomst van een formule en zoekt het getal dat je erin moet stoppen. Dan reken je terug.' },
      doelen:[
        { id:'form-om-terug', naam:'Terugrekenen met de pijlenketting', kort:'Draai de formule om: eerst de plus eraf, dan delen',
          uit:'<p>Een kano huren: kosten = 15 × uren + 20. Je hebt € 80. Hoeveel uur kun je huren?</p><p>Teken een <b>pijlenketting</b>: uren → × 15 → + 20 → kosten. Reken nu <b>terug</b>, van achter naar voren. Elke stap draai je om: + wordt −, × wordt :.</p><p>80 − 20 = 60. 60 : 15 = <b>4 uur</b>.</p>',
          wanneer:'je de uitkomst weet en het begin zoekt.',
          maak:function(R){
            var it = R.kies(HUUR), a = R.kies([5, 7.5, 8, 12, 15, 20, 25]), b; do { b = R.kies([10, 15, 20, 25, 30, 50]); } while (b === a); var u = R.heel(2, 10), Kk = a * u + b;
            var f = it.f.replace('{a}', T(a)).replace('{b}', String(b));
            return { vraag:f, context:it.ctx(a, b) + ' ' + it.voor + Gk(Kk) + '?', eenheid:it.vr,
              beeld:function(n){ return ketting(a, b, [n >= 2 ? T(u) : '?', n >= 1 ? T(a * u) : '…', T(Kk)], n); }, stappen:[
              { tekst:'Terug: haal eerst de ' + b + ' eraf. ' + T(Kk) + ' − ' + b + ' =', antwoord:T(a * u), hint:'De laatste stap was + ' + b + '. Terug is dat − ' + b + '.' },
              { tekst:'Dan delen door ' + T(a) + ': ' + T(a * u) + ' : ' + T(a) + ' =', antwoord:metE(T(u), it.vr), eenheid:it.vr, hint:'De eerste stap was × ' + T(a) + '. Terug is dat : ' + T(a) + '.', fout:F(T((Kk) / a), 'Je deelde voordat je de ' + b + ' eraf haalde. Reken van achter naar voren.') } ] };
          } },
        { id:'form-om-max', naam:'Hoeveel kun je maximaal?', kort:'Reken terug en rond af naar beneden: je mag niet over je budget',
          uit:'<p>Een kano kost € 15 per uur plus € 20 borg. Je hebt € 90. 90 − 20 = 70, en 70 : 15 = 4,67. Je kunt geen 4,67 uur huren.</p><p>Je mag niet over je geld heen. Rond daarom <b>naar beneden</b> af: <b>4 uur</b>. Controleer: 15 × 4 + 20 = 80 euro. Past. Vijf uur zou 95 euro zijn: te veel.</p>',
          wanneer:'je terugrekent en er geen heel getal uitkomt.',
          maak:function(R){
            var it = R.kies(HUUR), a = R.kies([6, 7.5, 8, 12, 15, 20, 25]), b; do { b = R.kies([10, 15, 20, 25, 30]); } while (b === a); var u = R.heel(2, 9), extra; do { extra = R.heel(1, Math.floor(a) - 1); } while (extra >= a);
            var B = a * u + b + extra, rest = B - b, f = it.f.replace('{a}', T(a)).replace('{b}', String(b));
            return { vraag:f, context:it.ctx(a, b) + ' ' + it.voor + Gk(B) + '? Je mag niet meer uitgeven.', eenheid:it.vr, antwoord:metE(String(u), it.vr), stappen:[
              { tekst:'Haal eerst de ' + b + ' eraf: ' + T(B) + ' − ' + b + ' =', antwoord:T(rest), hint:'Terug: + ' + b + ' wordt − ' + b + '.' },
              { tekst:'Hoe vaak past ' + T(a) + ' helemaal in ' + T(rest) + '? (hele keren)', antwoord:metE(String(u), it.vr), eenheid:it.vr, hint:T(a) + ' × ' + u + ' = ' + T(a * u) + ' en ' + T(a) + ' × ' + (u + 1) + ' = ' + T(a * (u + 1)) + '. Dat laatste is te veel.', fout:F(u + 1, 'Dan kom je boven je budget: ' + T(a) + ' × ' + (u + 1) + ' = ' + T(a * (u + 1)) + '.') },
              { tekst:'Controleer: ' + T(a) + ' × ' + u + ' + ' + b + ' =', antwoord:G(a * u + b), hint:'Dit moet onder de ' + G(B) + ' blijven.' } ] };
          } }
      ] }
  ]);

  /* een rechthoek met een rechthoekig gat erin */
  function gatFiguur(W, H, w, h, n){
    var s0 = Math.min(300 / W, 200 / H), x0 = 60, y0 = 20, gx = x0 + (W - w) / 2 * s0, gy = y0 + (H - h) / 2 * s0, s = '';
    s += rc(x0, y0, W * s0, H * s0, { f:K[3], fo:n >= 1 ? 0.4 : 0.22, w:2.5 });
    s += rc(gx, gy, w * s0, h * s0, { f:n >= 2 ? K[1] : 'var(--kaart)', fo:n >= 2 ? 0.45 : 1, w:2 });
    s += tx(x0 + W * s0 / 2, y0 + H * s0 + 24, W + ' m', { vet:true }) + tx(x0 - 10, y0 + H * s0 / 2 + 5, H + ' m', { a:'end', vet:true });
    s += tx(gx + w * s0 / 2, gy + h * s0 + 18, w + ' m', { vet:true }) + tx(gx - 6, gy + h * s0 / 2 + 5, h + ' m', { a:'end', vet:true });
    return svg(x0 + W * s0 + 40, y0 + H * s0 + 40, s, 'rechthoek met een gat', 460);
  }
})();
