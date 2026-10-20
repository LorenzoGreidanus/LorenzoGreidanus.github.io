/* De leerroute wiskunde: meetkunde voor de bovenbouw van het vmbo (kb en gt, het examen).
   Halve en kwart cirkels in samengestelde figuren, schaal en oppervlakte op schaal,
   gelijkvormige driehoeken (snavel en zandloper), inhoud in liters, de inhoud van bol en
   samengestelde ruimtefiguren, de oppervlakte van prisma en cilinder, afstanden in
   ruimtefiguren met twee keer Pythagoras, hellingshoek en hellingspercentage, en
   goniometrie in twee stappen. Pythagoras in een assenstelsel, SOS CAS TOA, vergroten en
   de inhoud van piramide en kegel staan in wiskunde-meetkunde.js. Zie leerroute.js voor
   het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, S = R0.schoon;
  var K = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var MIN = '−', X = '×', RAD = Math.PI / 180;

  /* ================= hulpjes ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* ligt x vlak bij een afrondingsgrens? Dan kiezen we liever andere getallen */
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.02; }
  /* geven twee rekenwegen (met en zonder tussendoor afronden) hetzelfde antwoord? */
  function eens(a, b, d){ return Math.abs(rnd(a, d) - rnd(b, d)) < 1e-9; }
  function metE(x, e, ook){
    x = String(x);
    /* 0,075 niet ook als 0.075: dat leest de motor als vijfenzeventig */
    var punt = x.replace(/\./g, '').replace(',', '.'), vormen = uniek([x, x.replace(/\./g, '')].concat(/^-?\d{1,3}(\.\d{3})+$/.test(punt) ? [] : [punt])), uit = vormen.slice();
    [e].concat(ook || []).forEach(function(eh){
      if (!eh) return;
      var ee = uniek([eh, eh.replace('²', '2').replace('³', '3')]);
      vormen.forEach(function(v){ ee.forEach(function(u){ uit.push(v + ' ' + u, v + u); }); });
    });
    return uniek(uit);
  }
  /* afgerond op d decimalen, met of zonder eenheid */
  function af(x, d, e, ook){ var r = rnd(x, d), v = metE(T(r, { dec:d, vast:true }), e, ook), k = metE(T(r), e, ook); return uniek(Math.abs(x - Math.round(x)) < 1e-9 ? k.concat(v) : v.concat(k)); }
  function r1(x){ return T(rnd(x, 1)); }
  function r2(x){ return T(rnd(x, 2), { dec:2, vast:true }); }
  function St(tekst, ant, hint, fout, o){
    o = o || {};
    var s = { tekst:tekst, antwoord:[].concat(ant).map(String), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (o.e) s.eenheid = o.e;
    if (o.waarom) s.waarom = o.waarom;
    return s;
  }
  function F(){ var f = {}; for (var i = 0; i < arguments.length; i += 2){ var k = String(arguments[i]).toLowerCase(); if (!(k in f)) f[k] = arguments[i + 1]; } return f; }
  /* fouten weg die toevallig goed zijn */
  function Fz(goed, f){ var g = [].concat(goed).map(function(x){ return String(x).toLowerCase(); }), o = {}; for (var k in f) if (g.indexOf(k) < 0) o[k] = f[k]; return o; }
  function kz(R, goed, fout){ var l = [goed]; fout.forEach(function(f){ if (l.indexOf(f) < 0) l.push(f); }); l = R.hussel(l); return { opties:l, goed:l.indexOf(goed) }; }
  function kstap(R, tekst, goed, fout, hint, o){ o = o || {}; var k = o.orde ? { opties:o.orde.slice(), goed:o.orde.indexOf(goed) } : kz(R, goed, fout), s = { tekst:tekst, opties:k.opties, goed:k.goed, hint:hint }; if (o.waarom) s.waarom = o.waarom; return s; }
  function norm360(a){ return ((a % 360) + 360) % 360; }
  var SIN = 'sin = overstaande zijde : schuine zijde', COS = 'cos = aanliggende zijde : schuine zijde', TAN = 'tan = overstaande zijde : aanliggende zijde', VL = [SIN, COS, TAN];
  var LIT = ['l'];

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + S(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {};
    var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600)];
    if (o.k) st.push('fill:' + o.k);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '"' + (o.mid ? ' dy=".35em"' : '') + ' style="' + st.join(';') + '">' + S(t) + '</text>';
  }
  function stijl(o){
    return 'fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2) +
      (o.stip ? ';stroke-dasharray:' + (o.stip === true ? '6 5' : o.stip) : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round;stroke-linejoin:round';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="' + stijl({ s:o.k || 'var(--ink)', w:o.w || 2, stip:o.stip, op:o.op }) + '"/>'; }
  function pg(p, o){ return '<polygon points="' + p.map(function(q){ return n1(q[0]) + ',' + n1(q[1]); }).join(' ') + '" style="' + stijl(o || {}) + '"/>'; }
  function pl(p, o){ return '<polyline points="' + p.map(function(q){ return n1(q[0]) + ',' + n1(q[1]); }).join(' ') + '" style="' + stijl(o || {}) + '"/>'; }
  function pad(d, o){ return '<path d="' + d + '" style="' + stijl(o || {}) + '"/>'; }
  function cir(cx, cy, r, o){ return '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r) + '" style="' + stijl(o || {}) + '"/>'; }
  function rh(x, y, w, h, k){ return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" style="' + stijl({ f:k || K[0], fo:0.12, w:2.5 }) + '"/>'; }
  function pol(cx, cy, r, a){ return [cx + r * Math.cos(a * RAD), cy - r * Math.sin(a * RAD)]; }
  function rich(V, Q){ return Math.atan2(-(Q[1] - V[1]), Q[0] - V[0]) / RAD; }
  function boogPad(cx, cy, r, a1, a2){
    var p1 = pol(cx, cy, r, a1), p2 = pol(cx, cy, r, a2), groot = norm360(a2 - a1) > 180 ? 1 : 0;
    return 'M' + n1(p1[0]) + ' ' + n1(p1[1]) + ' A' + r + ' ' + r + ' 0 ' + groot + ' 0 ' + n1(p2[0]) + ' ' + n1(p2[1]);
  }
  function hoekje(cx, cy, a1, a2, o){
    o = o || {};
    var d = norm360(a2 - a1), kl = o.k || K[0], r = o.r || 30, s = '';
    if (d < 0.01) d = 360;
    if (Math.abs(d - 90) < 0.5 && o.recht !== false){
      var u = pol(0, 0, 16, a1), v = pol(0, 0, 16, a1 + 90);
      s += pg([[cx, cy], [cx + u[0], cy + u[1]], [cx + u[0] + v[0], cy + u[1] + v[1]], [cx + v[0], cy + v[1]]], { f:kl, fo:0.15, s:'none', w:0 });
      s += pad('M' + n1(cx + u[0]) + ' ' + n1(cy + u[1]) + ' L' + n1(cx + u[0] + v[0]) + ' ' + n1(cy + u[1] + v[1]) + ' L' + n1(cx + v[0]) + ' ' + n1(cy + v[1]), { s:kl, w:2 });
    } else {
      var p1 = pol(cx, cy, r, a1), b = boogPad(cx, cy, r, a1, a1 + d);
      s += pad('M' + n1(cx) + ' ' + n1(cy) + ' L' + n1(p1[0]) + ' ' + n1(p1[1]) + ' ' + b.replace(/^M[^A]*/, '') + ' Z', { f:kl, fo:0.16, s:'none', w:0 });
      s += pad(b, { s:kl, w:2.5 });
    }
    if (o.t != null && o.t !== ''){ var m = pol(cx, cy, r + (o.lr || 17), a1 + d / 2); s += tx(m[0], m[1], o.t, { k:kl, vet:true, mid:true, fs:o.fs || 15 }); }
    return s;
  }
  function pas(pts, W, H, m){
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    var sc = Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * m) / ((y1 - y0) || 1)), ox = (W - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
    return { sc:sc, f:function(p){ return [ox + (p[0] - x0) * sc, H - oy - (p[1] - y0) * sc]; } };
  }
  /* tekst naast een lijnstuk (schermpunten P en Q), aan de kant weg van punt w */
  function zl(P, Q, t, w, o){
    o = o || {};
    var mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, L = Math.hypot(Q[0] - P[0], Q[1] - P[1]) || 1, nv = [(Q[1] - P[1]) / L, -(Q[0] - P[0]) / L];
    if (nv[0] * (mx - w[0]) + nv[1] * (my - w[1]) < 0) nv = [-nv[0], -nv[1]];
    var afst = (o.afst || 14) + Math.abs(nv[0]) * 4 * String(t).length;
    return tx(mx + nv[0] * afst, my + nv[1] * afst, t, { mid:true, vet:true, k:o.k || (t === '?' ? K[1] : null), fs:o.fs || 15 });
  }
  /* een veelhoek (punten tegen de klok in) met hoeken, namen en maten */
  function figuur(P, o){
    o = o || {};
    var n = P.length, s = '', i, cx = 0, cy = 0;
    P.forEach(function(p){ cx += p[0] / n; cy += p[1] / n; });
    s += pg(P, { f:o.vul || K[0], fo:o.fo != null ? o.fo : 0.1, w:2.5 });
    for (i = 0; i < n; i++){
      var V = P[i], N = P[(i + 1) % n], Q = P[(i + n - 1) % n], a1 = rich(V, N), d = norm360(rich(V, Q) - a1);
      var lab = o.hoek ? o.hoek[i] : null, recht = Math.abs(d - 90) < 0.5;
      if (lab != null && lab !== '') s += hoekje(V[0], V[1], a1, a1 + d, { t:lab, k:(o.kl && o.kl[i]) || K[0], r:d < 50 ? 36 : 26, lr:d < 50 ? 20 : 17 + String(lab).length * 2 });
      else if (recht && o.markeer !== false) s += hoekje(V[0], V[1], a1, a1 + d, { k:'var(--ink)' });
    }
    (o.zijde || []).forEach(function(t, i){
      if (t == null || t === '') return;
      var A = P[i], B = P[(i + 1) % n], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nv = [(B[1] - A[1]) / L, -(B[0] - A[0]) / L];
      if (nv[0] * (mx - cx) + nv[1] * (my - cy) < 0) nv = [-nv[0], -nv[1]];
      var afst = 16 + Math.abs(nv[0]) * 4 * String(t).length;
      s += tx(mx + nv[0] * afst, my + nv[1] * afst, t, { mid:true, vet:true, k:t === '?' ? K[1] : null, fs:16 });
    });
    (o.namen || []).forEach(function(t, i){
      if (!t) return;
      var V = P[i], dx = V[0] - cx, dy = V[1] - cy, L = Math.hypot(dx, dy) || 1;
      s += tx(V[0] + dx / L * 18, V[1] + dy / L * 18, t, { mid:true, vet:true, fs:16 });
    });
    return s;
  }
  function tekenFig(pts, o){
    o = o || {};
    var W = o.W || 380, H = o.H || 250, t = pas(pts.concat(o.extra || []), W, H, o.m || 44), P = pts.map(t.f);
    return svg(W, H, figuur(P, o) + (o.na ? o.na(P, t.f) : ''), o.aria || 'figuur', o.max || W);
  }
  /* punten op een cirkelboog (wiskundige coördinaten, y omhoog), van hoek a1 naar a2 */
  function boogP(cx, cy, r, a1, a2, n){ n = n || 36; var u = []; for (var i = 0; i <= n; i++){ var a = (a1 + (a2 - a1) * i / n) * RAD; u.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return u; }

  /* ---------- vlakke figuren met cirkeldelen ---------- */
  function fDeel(soort, lab){
    var half = soort === 'half', P = half ? boogP(0, 0, 1, 0, 180) : [[0, 0]].concat(boogP(0, 0, 1, 0, 90)), H = half ? 200 : 250;
    var t = pas(P.concat([[0, -0.3]]), 320, H, 34), Q = P.map(t.f), O = t.f([0, 0]), s = '';
    s += pg(Q, { f:K[0], fo:0.12, w:2.5 });
    if (!half) s += hoekje(O[0], O[1], 0, 90, { k:'var(--ink)' });
    if (lab.d){ var a = t.f([-1, 0]), b = t.f([1, 0]); s += ln(a[0], a[1], b[0], b[1], { k:K[1], w:3.5 }) + tx(O[0], O[1] + 24, lab.d, { vet:true, k:K[1] }); }
    else if (half){ var q = t.f([Math.cos(55 * RAD), Math.sin(55 * RAD)]); s += ln(O[0], O[1], q[0], q[1], { k:K[1], w:3.5 }) + tx((O[0] + q[0]) / 2 + 12, (O[1] + q[1]) / 2 + 10, lab.r, { vet:true, k:K[1], a:'start' }); }
    else { var e = t.f([1, 0]); s += ln(O[0], O[1], e[0], e[1], { k:K[1], w:3.5 }) + tx((O[0] + e[0]) / 2, O[1] + 24, lab.r, { vet:true, k:K[1] }); }
    s += cir(O[0], O[1], 3.5, { f:'var(--ink)', s:'none', w:0 });
    return svg(320, H, s, half ? 'een halve cirkel' : 'een kwart cirkel', 340);
  }
  /* rechthoek of vierkant met een cirkeldeel erbij of eraf */
  function fSamen(v, m, lab){
    var P = [], stip = [], tk = [], l = m.l, b = m.b, s = m.s, r = m.r, d = m.d, mid, straal = null;
    function arc(cx, cy, rr, a1, a2){ boogP(cx, cy, rr, a1, a2).forEach(function(p){ P.push(p); }); }
    if (v === 'raam'){ P.push([0, 0], [l, 0]); arc(l / 2, b, l / 2, 0, 180); stip.push([[0, b], [l, b]]); mid = [l / 2, b / 2];
      tk.push([[0, 0], [l, 0], lab.l, mid], [[l, 0], [l, b], lab.b, mid]); }
    else if (v === 'veld'){ P.push([0, 0], [l, 0]); arc(l, b / 2, b / 2, -90, 90); arc(0, b / 2, b / 2, 90, 270); stip.push([[0, 0], [0, b]], [[l, 0], [l, b]]);
      tk.push([[0, 0], [l, 0], lab.l, [l / 2, b / 2]], [[l, 0], [l, b], lab.b, [l + b, b / 2]]); }
    else if (v === 'kwart'){ P.push([0, 0]); arc(l, 0, b, 0, 90); P.push([0, b]); stip.push([[l, 0], [l, b]]); mid = [l / 2, b / 2];
      tk.push([[0, 0], [l, 0], lab.l, mid], [[l, 0], [l + b, 0], lab.r, [l + b / 2, b]], [[0, 0], [0, b], lab.b, mid]); }
    else if (v === 'gat'){ P.push([0, 0], [l, 0], [l, b]); arc(l / 2, b, d / 2, 0, -180); P.push([0, b]); stip.push([[(l - d) / 2, b], [(l + d) / 2, b]]); mid = [l / 2, b / 2];
      tk.push([[0, 0], [l, 0], lab.l, mid], [[0, 0], [0, b], lab.b, mid], [[(l - d) / 2, b], [(l + d) / 2, b], lab.d, [l / 2, 0]]); }
    else if (v === 'hoeken'){ P.push([r, 0], [s - r, 0]); arc(s, 0, r, 180, 90); P.push([s, s - r]); arc(s, s, r, 270, 180); P.push([r, s]); arc(0, s, r, 0, -90); P.push([0, r]); arc(0, 0, r, 90, 0);
      stip.push([[0, 0], [s, 0]], [[s, 0], [s, s]], [[s, s], [0, s]], [[0, s], [0, 0]]); tk.push([[0, 0], [0, s], lab.s, [s / 2, s / 2]]); straal = [[0, 0], [r, 0], lab.r, [r / 2, s]]; }
    else { P.push([s, 0], [s, s], [0, s]); arc(0, 0, s, 90, 0); stip.push([[0, 0], [s, 0]], [[0, 0], [0, s]]);
      tk.push([[s, 0], [s, s], lab.s, [0, s / 2]]); straal = [[0, 0], [s * Math.cos(45 * RAD), s * Math.sin(45 * RAD)], lab.r, [s, 0]]; }
    var alle = P.slice(); stip.forEach(function(q){ alle.push(q[0], q[1]); });
    var W = 400, H = 250, t = pas(alle, W, H, 50), out = '';
    out += pg(P.map(t.f), { f:K[0], fo:0.14, w:2.5 });
    stip.forEach(function(q){ var a = t.f(q[0]), c = t.f(q[1]); out += ln(a[0], a[1], c[0], c[1], { stip:'6 5', op:0.6, w:2 }); });
    if (straal){ var a0 = t.f(straal[0]), a1 = t.f(straal[1]); out += ln(a0[0], a0[1], a1[0], a1[1], { k:K[1], w:3 }) + zl(a0, a1, straal[2], t.f(straal[3]), { k:K[1] }) + cir(a0[0], a0[1], 3.5, { f:'var(--ink)', s:'none', w:0 }); }
    tk.forEach(function(q){ if (q[2]) out += zl(t.f(q[0]), t.f(q[1]), q[2], t.f(q[3])); });
    var ARIA = { raam:'een rechthoek met een halve cirkel erop', veld:'een rechthoek met aan twee kanten een halve cirkel', kwart:'een rechthoek met een kwart cirkel ernaast',
      gat:'een rechthoek met een halve cirkel eruit', hoeken:'een vierkant met in elke hoek een kwart cirkel eruit', hoek1:'een vierkant met een kwart cirkel eruit' };
    return svg(W, H, out, ARIA[v], 420);
  }

  /* ---------- schaal ---------- */
  function fKaart(o){
    var W = 420, H = 170, px = Math.min(300, Math.max(80, o.t * 22)), x0 = (W - px) / 2, y = 84, s = '';
    s += '<rect x="12" y="12" width="' + (W - 24) + '" height="' + (H - 24) + '" rx="10" style="' + stijl({ f:K[0], fo:0.06, s:'var(--muted)', w:1.5 }) + '"/>';
    s += tx(26, 36, 'schaal 1 : ' + T(o.n, { punt:true }), { a:'start', fs:14 });
    s += ln(x0, y, x0 + px, y, { k:K[1], w:3.5 }) + cir(x0, y, 6, { f:K[1], s:'var(--kaart)', w:2 }) + cir(x0 + px, y, 6, { f:K[1], s:'var(--kaart)', w:2 });
    s += tx(x0, y + 26, 'A', { vet:true }) + tx(x0 + px, y + 26, 'B', { vet:true });
    s += tx(x0 + px / 2, y - 14, o.lab, { vet:true, k:o.lab === '?' ? K[1] : null, fs:16 });
    if (o.onder) s += tx(x0 + px / 2, y + 48, o.onder, { k:K[3], vet:true, fs:14 });
    return svg(W, H, s, 'een lijnstuk AB op een kaart met schaal 1 : ' + o.n, 440);
  }
  function fTwee(k, na, nb, lab1, lab2){
    var s1 = 1, s2 = Math.max(0.4, Math.min(k, 2.5)), f = 2.2 / Math.max(s1, s2); s1 *= f; s2 *= f;
    var w1 = 60 * s1, h1 = 40 * s1, w2 = 60 * s2, h2 = 40 * s2, W = w1 + w2 + 140, H = Math.max(h1, h2) + 74, yb = H - 16, x1 = 50, x2 = x1 + w1 + 44, s = '';
    s += rh(x1, yb - h1, w1, h1, K[0]) + rh(x2, yb - h2, w2, h2, K[1]);
    s += tx(x1 + w1 / 2, yb - h1 - 10, 'oud: 1 : ' + T(na, { punt:true }), { fs:13, vet:true }) + tx(x2 + w2 / 2, yb - h2 - 10, 'nieuw: 1 : ' + T(nb, { punt:true }), { fs:13, vet:true });
    s += tx(x1 + w1 / 2, yb - h1 / 2 + 5, lab1, { vet:true, fs:14 }) + tx(x2 + w2 / 2, yb - h2 / 2 + 5, lab2, { vet:true, fs:15, k:lab2 === '?' ? K[1] : null });
    return svg(W, H, s, 'een oude en een nieuwe tekening op een andere schaal', W + 20);
  }
  function fKamer(a, b, n, la, lb){
    var sc = Math.min(30, 250 / a, 140 / b), w = a * sc, h = b * sc, W = 420, H = h + 96, x0 = Math.max(40, (W - w) / 2 - 20), y0 = 46, s = '';
    s += rh(x0, y0, w, h, K[0]);
    s += tx(x0 + w / 2, y0 + h + 24, la, { vet:true }) + tx(x0 + w + 10, y0 + h / 2 + 5, lb, { vet:true, a:'start' });
    s += tx(20, 28, 'schaal 1 : ' + T(n, { punt:true }), { a:'start', fs:14 });
    return svg(W, H, s, 'een rechthoek op een plattegrond met schaal 1 : ' + n, 440);
  }
  function fMeer(A, n, R){
    var p1 = R.heel(0, 628) / 100, p2 = R.heel(0, 628) / 100, cx = 165, cy = 122, pts = [], i;
    for (i = 0; i < 60; i++){ var a = i / 60 * 2 * Math.PI, rr = 1 + 0.16 * Math.sin(2 * a + p1) + 0.1 * Math.sin(3 * a + p2); pts.push([cx + 105 * rr * Math.cos(a), cy + 60 * rr * Math.sin(a)]); }
    var s = pg(pts, { f:K[0], fo:0.22, s:K[0], w:2.5 });
    s += tx(cx, cy + 6, T(A) + ' cm²', { vet:true, fs:17 });
    s += '<rect x="342" y="100" width="34" height="34" style="' + stijl({ f:K[1], fo:0.18, s:K[1], w:2 }) + '"/>' + tx(359, 154, '1 cm²', { fs:13, vet:true, k:K[1] });
    s += tx(20, 26, 'schaal 1 : ' + T(n, { punt:true }), { a:'start', fs:14 });
    return svg(400, 220, s, 'een gebied op een kaart, met een hokje van 1 cm²', 420);
  }

  /* ---------- gelijkvormige driehoeken ---------- */
  function naam(p, t, dx, dy){ return tx(p[0] + dx, p[1] + dy, t, { mid:true, vet:true, fs:16 }); }
  function fSnavel(k, lab){
    var A = [1.7, 3.2], B = [0, 0], C = [4.2, 0], D = [A[0] + (B[0] - A[0]) / k, A[1] + (B[1] - A[1]) / k], E = [A[0] + (C[0] - A[0]) / k, A[1] + (C[1] - A[1]) / k];
    var t = pas([A, B, C], 380, 270, 46), a = t.f(A), b = t.f(B), c = t.f(C), d = t.f(D), e = t.f(E), s = '';
    s += pg([a, b, c], { f:K[0], fo:0.08, w:2.5 }) + pg([a, d, e], { f:K[1], fo:0.13, s:'none', w:0 }) + ln(d[0], d[1], e[0], e[1], { k:K[1], w:3 });
    if (lab.AD) s += zl(a, d, lab.AD, c);
    if (lab.DB) s += zl(d, b, lab.DB, c);
    if (lab.DE) s += zl(d, e, lab.DE, [(b[0] + c[0]) / 2, b[1]], { k:lab.DE === '?' ? K[1] : K[1] });
    if (lab.BC) s += zl(b, c, lab.BC, a);
    s += naam(a, 'A', 0, -16) + naam(b, 'B', -14, 8) + naam(c, 'C', 14, 8) + naam(d, 'D', -16, -4) + naam(e, 'E', 16, -4);
    return svg(380, 270, s, 'driehoek ABC met DE evenwijdig aan BC', 400);
  }
  function fZand(k, lab){
    var Sx = [0, 0], A = [-1, 1.2], B = [1.5, 1.2], D = [k, -1.2 * k], C = [-1.5 * k, -1.2 * k];
    var t = pas([A, B, C, D], 380, 280, 46), s0 = t.f(Sx), a = t.f(A), b = t.f(B), c = t.f(C), d = t.f(D), s = '';
    s += pg([s0, a, b], { f:K[1], fo:0.13, s:'none', w:0 }) + pg([s0, d, c], { f:K[0], fo:0.08, s:'none', w:0 });
    s += ln(a[0], a[1], d[0], d[1], { w:2.5 }) + ln(b[0], b[1], c[0], c[1], { w:2.5 }) + ln(a[0], a[1], b[0], b[1], { k:K[1], w:3 }) + ln(c[0], c[1], d[0], d[1], { w:3 });
    if (lab.SA) s += zl(s0, a, lab.SA, b); if (lab.SB) s += zl(s0, b, lab.SB, a); if (lab.SC) s += zl(s0, c, lab.SC, d); if (lab.SD) s += zl(s0, d, lab.SD, c);
    if (lab.AB) s += zl(a, b, lab.AB, s0); if (lab.CD) s += zl(c, d, lab.CD, s0);
    s += naam(a, 'A', -12, -12) + naam(b, 'B', 12, -12) + naam(c, 'C', -14, 12) + naam(d, 'D', 14, 12) + naam(s0, 'S', -20, 0);
    return svg(380, 280, s, 'een zandloper: AB evenwijdig aan CD, AD en BC snijden elkaar in S', 400);
  }
  function fSchaduw(r, kd, lab){
    var x1 = r + 1, pts = [[0, 0], [0, 1], [r, 0], [x1, 0], [x1, kd], [x1 + r * kd, 0]];
    var t = pas(pts.concat([[-0.7, -0.35]]), 440, 240, 30), q = pts.map(t.f), s = '';
    s += ln(q[0][0] - 24, q[0][1], q[5][0] + 16, q[0][1], { w:2 });
    s += ln(q[1][0], q[1][1], q[2][0], q[2][1], { k:K[2], w:2, stip:'6 5' }) + ln(q[4][0], q[4][1], q[5][0], q[5][1], { k:K[2], w:2, stip:'6 5' });
    s += ln(q[0][0], q[0][1], q[2][0], q[2][1], { k:K[4], w:6, op:0.6 }) + ln(q[3][0], q[3][1], q[5][0], q[5][1], { k:K[4], w:6, op:0.6 });
    s += ln(q[0][0], q[0][1], q[1][0], q[1][1], { k:K[3], w:4 }) + ln(q[3][0], q[3][1], q[4][0], q[4][1], { k:K[0], w:7 });
    s += tx(q[0][0] - 8, (q[0][1] + q[1][1]) / 2 + 5, lab.p, { a:'end', fs:14, vet:true }) + tx(q[3][0] - 10, (q[3][1] + q[4][1]) / 2 + 5, lab.H, { a:'end', fs:16, vet:true, k:lab.H === '?' ? K[1] : null });
    s += tx((q[0][0] + q[2][0]) / 2, q[0][1] + 20, lab.s, { fs:14, vet:true }) + tx((q[3][0] + q[5][0]) / 2, q[0][1] + 20, lab.S, { fs:14, vet:true });
    return svg(440, 240, s, 'een stok en een hoger voorwerp met hun schaduw', 460);
  }

  /* ---------- ruimtefiguren, scheef getekend ---------- */
  function schuin(p, d){ return [p[0] + p[2] * d * 0.62, p[1] + p[2] * d * 0.42]; }
  function ruimte(punten, ribben, o){
    o = o || {};
    var dd = o.d || 0.5, W = o.W || 360, H = o.H || 250, alle = punten.slice();
    (o.krommen || []).forEach(function(k){ alle = alle.concat(k.pts); });
    var t = pas(alle.map(function(p){ return schuin(p, dd); }), W, H, o.m || 40), f = function(p){ return t.f(schuin(p, dd)); }, Q = punten.map(f), s = '';
    (o.vlakken || []).forEach(function(v){ s += pg(v.pts.map(f), { f:v.k || K[0], fo:v.fo != null ? v.fo : 0.16, s:'none', w:0 }); });
    ribben.forEach(function(rb){ s += ln(Q[rb[0]][0], Q[rb[0]][1], Q[rb[1]][0], Q[rb[1]][1], { w:2.5, stip:rb[2] ? '6 5' : null, op:rb[2] ? 0.6 : null }); });
    (o.krommen || []).forEach(function(k){ s += pl(k.pts.map(f), { s:k.k || 'var(--ink)', w:k.w || 2.5, stip:k.stip ? '6 5' : null, op:k.stip ? 0.7 : null }); });
    (o.lijnen || []).forEach(function(l){ s += ln(Q[l[0]][0], Q[l[0]][1], Q[l[1]][0], Q[l[1]][1], { k:K[l[2] || 1], w:3.5, stip:l[3] ? '7 5' : null }); });
    var cx = 0, cy = 0; Q.forEach(function(q){ cx += q[0] / Q.length; cy += q[1] / Q.length; });
    (o.namen || []).forEach(function(n, i){
      if (!n) return;
      if (Array.isArray(n)){ s += tx(Q[i][0] + n[1], Q[i][1] + n[2], n[0], { mid:true, vet:true, fs:15 }); return; }
      var dx = Q[i][0] - cx, dy = Q[i][1] - cy, L = Math.hypot(dx, dy) || 1; s += tx(Q[i][0] + dx / L * 16, Q[i][1] + dy / L * 16, n, { mid:true, vet:true, fs:15 });
    });
    (o.maten || []).forEach(function(m){ if (!m[2]) return; var a = Q[m[0]], b = Q[m[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1; s += tx(mx + dx / L * 22, my + dy / L * 22, m[2], { mid:true, vet:true, fs:15, k:m[2] === '?' ? K[1] : null }); });
    (o.teksten || []).forEach(function(x){ if (!x.t) return; var q = f(x.p); s += tx(q[0] + (x.dx || 0), q[1] + (x.dy || 0), x.t, { mid:true, vet:true, fs:15, a:x.a, k:x.k || (x.t === '?' ? K[1] : null) }); });
    return svg(W, H, s, o.aria || 'ruimtefiguur', o.max || 380);
  }
  /* balk: A B C D onder, E F G H boven; l = AB, b = BC (de diepte), h = AE */
  function balkPts(l, b, h){ return [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [0, h, 0], [l, h, 0], [l, h, b], [0, h, b]]; }
  var BALK_RIBBEN = [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7, 1]];
  function fBak(l, b, H, w, lab){
    var o = { maten:[[0, 1, lab.l], [0, 4, lab.H]], teksten:[{ p:[l, 0, b / 2], t:lab.b, dx:12, dy:4, a:'start' }], aria:lab.aria || 'een bak in de vorm van een balk' };
    if (w != null){
      o.vlakken = [{ pts:[[0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0]] }, { pts:[[l, 0, 0], [l, 0, b], [l, w, b], [l, w, 0]], fo:0.1 }];
      o.krommen = [{ pts:[[0, w, 0], [l, w, 0], [l, w, b], [0, w, b], [0, w, 0]], k:K[0], w:2.5 }];
      o.teksten.push({ p:[0, w / 2, 0], t:lab.w, dx:-12, a:'end' });
    }
    return ruimte(balkPts(l, b, H), BALK_RIBBEN, o);
  }
  function fPrisma(a1, a2, ll, lab){
    return ruimte([[0, 0, 0], [a1, 0, 0], [0, a2, 0], [0, 0, ll], [a1, 0, ll], [0, a2, ll]], [[0, 1], [1, 2], [2, 0], [0, 3, 1], [1, 4], [2, 5], [3, 4, 1], [4, 5], [5, 3, 1]],
      { maten:[[0, 1, lab.a], [0, 2, lab.b], [1, 4, lab.l]], teksten:[{ p:[a1 / 2, a2 / 2, 0], t:lab.c, dx:10, dy:-10, a:'start', k:lab.c === '?' ? K[1] : null }], d:0.35, aria:'prisma met een rechthoekige driehoek als grondvlak' });
  }
  function fHuis(l, b, h, t, lab){
    var p = balkPts(l, b, h).concat([[0, h + t, b / 2], [l, h + t, b / 2], [l, h, b / 2]]);
    var rb = [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [4, 5], [5, 6], [6, 7, 1], [7, 4, 1], [0, 4], [1, 5], [2, 6], [3, 7, 1], [4, 8], [7, 8, 1], [5, 9], [6, 9], [8, 9]];
    return ruimte(p, rb, { maten:[[0, 1, lab.l], [1, 2, lab.b], [0, 4, lab.h]], lijnen:[[10, 9, 3, true]], teksten:[{ p:[l, h + t / 2, b / 2], t:lab.t, dx:12, a:'start', k:K[3] }], aria:'een schuur: een balk met een dak in de vorm van een prisma' });
  }
  function fBlok(l, b, h, r, lab){
    var top = [], bod = [], i, a;
    for (i = 0; i <= 36; i++){ a = i * 10 * RAD; top.push([l / 2 + r * Math.cos(a), h, b / 2 + r * Math.sin(a)]); bod.push([l / 2 + r * Math.cos(a), 0, b / 2 + r * Math.sin(a)]); }
    var p = balkPts(l, b, h).concat([[l / 2, h, b / 2], [l / 2 + r, h, b / 2]]);
    return ruimte(p, BALK_RIBBEN, { krommen:[{ pts:top, k:K[1], w:2.5 }, { pts:bod, k:K[1], w:2, stip:true }], lijnen:[[8, 9, 1]], maten:[[0, 1, lab.l], [0, 4, lab.h]],
      teksten:[{ p:[l / 2 + r, h, b / 2], t:lab.r, dx:8, dy:-10, a:'start', k:K[1] }, { p:[l, 0, b / 2], t:lab.b, dx:12, dy:4, a:'start' }], aria:'een blok met een rond gat van boven naar beneden' });
  }
  function fBalkM(l, b, h, cg, lab){
    var M = cg ? [l, h / 2, b] : [l / 2, h, b], N = [l / 2, 0, b], p = balkPts(l, b, h).concat([M, N]);
    return ruimte(p, BALK_RIBBEN, { namen:['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', cg ? ['M', 16, 0] : ['M', 0, -15], cg ? '' : ['N', 2, 15]], maten:[[0, 1, lab.l], [0, 4, lab.h]], teksten:[{ p:[l, 0, b / 2], t:lab.b, dx:18, dy:20, a:'start' }],
      lijnen:cg ? [[0, 2, 3, true], [2, 8, 3], [0, 8, 1]] : [[0, 9, 3, true], [9, 8, 3, true], [0, 8, 1]], aria:'balk ABCD.EFGH met het lijnstuk AM' });
  }
  function fPir(l, b, hh, o){
    hh = Math.min(hh, 1.3 * Math.max(l, b)); var pts = [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [l / 2, hh, b / 2], [l / 2, 0, b / 2], [l, 0, b / 2]];
    return ruimte(pts, [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [0, 4], [1, 4], [2, 4], [3, 4, 1]], { namen:['A', 'B', 'C', 'D', 'T', ['M', -13, 12], o.N ? ['N', 16, 4] : ''], maten:o.maten, lijnen:o.lijnen, teksten:o.teksten, d:0.55, aria:'piramide T.ABCD met M het midden van het grondvlak' });
  }
  /* cilinder van voren, eventueel met een halve bol of kegel erop, een gat (buis) of water erin */
  function rondFig(o){
    var r = o.r, extra = o.top === 'bol' ? r : o.top === 'kegel' ? o.th : 0, tot = o.h + extra;
    var sc = Math.min(90 / r, 180 / tot), rx = r * sc, ry = Math.max(9, rx * 0.28), cx = 140, W = 330, s = '';
    var yt = 24 + (o.top ? extra * sc : ry), yb = yt + o.h * sc, H = yb + ry + 20, L = cx - rx, Rr = cx + rx;
    function el(y, achter, a, b){ a = a || rx; b = b || ry; return 'M' + n1(cx - a) + ' ' + n1(y) + ' A' + n1(a) + ' ' + n1(b) + ' 0 0 ' + (achter ? 1 : 0) + ' ' + n1(cx + a) + ' ' + n1(y); }
    s += pad('M' + n1(L) + ' ' + n1(yt) + ' L' + n1(L) + ' ' + n1(yb) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(Rr) + ' ' + n1(yb) + ' L' + n1(Rr) + ' ' + n1(yt) + ' Z', { f:K[0], fo:0.1, s:'none', w:0 });
    s += pad(el(yb, true), { stip:'6 5', op:0.55, w:2 }) + pad(el(yb, false), { w:2.5 });
    if (o.water != null){
      var yw = yb - o.water * sc;
      s += pad('M' + n1(L) + ' ' + n1(yw) + ' L' + n1(L) + ' ' + n1(yb) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(Rr) + ' ' + n1(yb) + ' L' + n1(Rr) + ' ' + n1(yw) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 1 ' + n1(L) + ' ' + n1(yw) + ' Z', { f:K[0], fo:0.18, s:'none', w:0 });
      s += pad(el(yw, true), { s:K[0], w:2, stip:'5 4', op:0.8 }) + pad(el(yw, false), { s:K[0], w:2.5 });
      s += tx(L - 10, (yw + yb) / 2 + 5, o.labW || '?', { a:'end', vet:true, k:K[1], fs:16 });
    }
    s += ln(L, yt, L, yb, { w:2.5 }) + ln(Rr, yt, Rr, yb, { w:2.5 });
    if (!o.top){
      s += '<ellipse cx="' + cx + '" cy="' + n1(yt) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '" style="' + stijl({ w:2.5, f:K[0], fo:0.12 }) + '"/>';
      if (o.ri){ var ri = o.ri * sc, ryi = ry * o.ri / r;
        s += '<ellipse cx="' + cx + '" cy="' + n1(yt) + '" rx="' + n1(ri) + '" ry="' + n1(ryi) + '" style="' + stijl({ w:2.5, f:'var(--kaart)' }) + '"/>';
        s += ln(cx - ri, yt, cx - ri, yb, { stip:'6 5', op:0.5 }) + ln(cx + ri, yt, cx + ri, yb, { stip:'6 5', op:0.5 }) + pad(el(yb, false, ri, ryi), { stip:'6 5', op:0.5, w:2 }); }
    } else {
      s += pad(el(yt, true), { stip:'6 5', op:0.55, w:2 }) + pad(el(yt, false), { w:2 });
      if (o.top === 'bol') s += pad('M' + n1(L) + ' ' + n1(yt) + ' A' + n1(rx) + ' ' + n1(rx) + ' 0 0 1 ' + n1(Rr) + ' ' + n1(yt), { w:2.5, f:K[0], fo:0.1 });
      else { var ya = yt - o.th * sc; s += pg([[L, yt], [cx, ya], [Rr, yt]], { f:K[0], fo:0.1, s:'none', w:0 }) + ln(L, yt, cx, ya, { w:2.5 }) + ln(Rr, yt, cx, ya, { w:2.5 });
        if (o.labT) s += ln(cx, ya, cx, yt, { k:K[3], w:2.5, stip:'6 5' }) + tx(L - 8, (ya + yt) / 2 + 5, o.labT, { a:'end', vet:true, k:K[3], fs:14 }); }
    }
    if (o.ri){ s += ln(cx, yt, L, yt, { k:K[1], w:3 }) + tx(cx - rx / 2 - 6, yt - 9, o.labR, { vet:true, k:K[1], fs:14 }) + ln(cx, yt, cx + o.ri * sc, yt, { k:K[3], w:3 }) + tx(cx + o.ri * sc / 2 + 6, yt - 9, o.labRi, { vet:true, k:K[3], fs:14 }); }
    else if (o.labR) s += ln(cx, yt, Rr, yt, { k:K[1], w:3 }) + (o.top ? tx(Rr + 8, yt + 5, o.labR, { a:'start', vet:true, k:K[1], fs:14 }) : tx(cx + rx / 2, yt - 9, o.labR, { vet:true, k:K[1], fs:14 }));
    s += cir(cx, yt, 3, { f:'var(--ink)', s:'none', w:0 });
    if (o.labH) s += tx(Rr + 10, (yt + yb) / 2 + 5, o.labH, { a:'start', vet:true, fs:14, k:o.labH === '?' ? K[1] : null });
    return svg(W, H, s, o.aria || 'cilinder', 330);
  }
  function fBol(half, lab){
    var cx = 150, R = 92, ry = 22, W = 300, cy = half ? 124 : 118, H = half ? 166 : 236, s = '';
    function el(achter){ return 'M' + (cx - R) + ' ' + cy + ' A' + R + ' ' + ry + ' 0 0 ' + (achter ? 1 : 0) + ' ' + (cx + R) + ' ' + cy; }
    if (half) s += pad('M' + (cx - R) + ' ' + cy + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy, { w:2.5, f:K[0], fo:0.1 });
    else s += cir(cx, cy, R, { w:2.5, f:K[0], fo:0.1 });
    s += pad(el(true), { stip:'6 5', op:0.55, w:2 }) + pad(el(false), { w:half ? 2.5 : 2 });
    if (lab.d) s += ln(cx - R, cy, cx + R, cy, { k:K[1], w:3 }) + tx(cx, cy - 10, lab.d, { vet:true, k:K[1], fs:14 });
    else s += ln(cx, cy, cx + R, cy, { k:K[1], w:3 }) + tx(cx + R / 2, cy - 10, lab.r, { vet:true, k:K[1], fs:14 });
    s += cir(cx, cy, 3.5, { f:'var(--ink)', s:'none', w:0 });
    return svg(W, H, s, half ? 'een halve bol' : 'een bol', 300);
  }
  function fUit(dicht, labD, labH, labR){
    var W = 350, x0 = 40, w = 210, hh = 74, cr = 30, y0 = 12 + 2 * cr, H = y0 + hh + (dicht ? 2 * cr : 0) + 14, s = '';
    s += cir(x0 + w / 2, y0 - cr, cr, { f:K[0], fo:0.12, w:2.5 }) + ln(x0 + w / 2, y0 - cr, x0 + w / 2 + cr, y0 - cr, { k:K[1], w:2.5 }) + tx(x0 + w / 2 + cr + 6, y0 - cr + 5, labR || '', { a:'start', fs:13, vet:true, k:K[1] });
    s += rh(x0, y0, w, hh, K[1]);
    if (dicht) s += cir(x0 + w / 2, y0 + hh + cr, cr, { f:K[0], fo:0.12, w:2.5 });
    s += tx(x0 + w / 2, y0 + hh / 2 + 5, 'lengte = π × ' + labD, { fs:14, vet:true });
    s += tx(x0 + w + 10, y0 + hh / 2 + 5, labH, { a:'start', fs:14, vet:true });
    return svg(W, H, s, 'de uitslag van de cilinder: ' + (dicht ? 'twee cirkels' : 'een cirkel') + ' en een rechthoek', 340);
  }

  /* ---------- hellingen en goniometrie ---------- */
  function fHelling(lab){
    return tekenFig([[0, 0], [3.2, 0], [3.2, 1.05]], { zijde:[lab.a || '', lab.h || '', lab.s || ''], hoek:[lab.hoek || '', '', ''], W:420, H:210, m:62, aria:'een helling als rechthoekige driehoek' });
  }
  function fOog(al, o){
    var W = 440, H = 262, gy = 225, ox = 160, ey = gy - 52, dx = Math.min(230, 150 / Math.tan(al * RAD)), tx0 = ox + dx, ty = ey - dx * Math.tan(al * RAD), s = '';
    s += ln(20, gy, W - 20, gy, { w:2.5 });
    s += '<rect x="' + n1(tx0) + '" y="' + n1(ty) + '" width="16" height="' + n1(gy - ty) + '" style="' + stijl({ f:K[0], fo:0.2, w:2 }) + '"/>';
    s += ln(ox, gy, ox, ey, { k:K[3], w:3 }) + cir(ox, ey, 5, { f:K[3], s:'var(--kaart)', w:2 });
    s += ln(ox, ey, tx0, ey, { stip:'6 5', op:0.7 }) + ln(ox, ey, tx0, ty, { k:K[1], w:3 });
    s += hoekje(ox, ey, 0, al, { t:al + '°', r:44, k:K[0] });
    s += tx(ox - 10, (gy + ey) / 2 + 5, o.oog, { a:'end', k:K[3], vet:true, fs:14 });
    s += tx((ox + tx0) / 2, gy + 24, o.afst, { vet:true });
    s += tx(tx0 + 26, (ty + gy) / 2 + 5, '?', { a:'start', k:K[1], vet:true, fs:18 });
    return svg(W, H, s, 'je kijkt vanaf ooghoogte omhoog naar de top', 460);
  }
  function fBoot(h, d1, d2, lab){
    var W = 440, H0 = 200, t = pas([[0, 0], [0, h], [d2, 0], [-d2 * 0.18, 0]], W, H0, 28), O = t.f([0, 0]), Tt = t.f([0, h]), b1 = t.f([d1, 0]), b2 = t.f([d2, 0]), s = '';
    s += ln(O[0] - 12, O[1], b2[0] + 18, O[1], { k:K[0], w:2.5 });
    s += ln(O[0], O[1], Tt[0], Tt[1], { k:K[3], w:7 });
    s += ln(Tt[0], Tt[1], b1[0], b1[1], { k:K[1], w:2.5 }) + ln(Tt[0], Tt[1], b2[0], b2[1], { k:K[2], w:2.5 });
    s += hoekje(b1[0], b1[1], rich(b1, Tt), 180, { t:lab.be, k:K[1], r:30 }) + hoekje(b2[0], b2[1], rich(b2, Tt), 180, { t:lab.al, k:K[2], r:42 });
    s += cir(b1[0], b1[1], 6, { f:K[1], s:'var(--kaart)', w:2 }) + cir(b2[0], b2[1], 6, { f:K[2], s:'var(--kaart)', w:2 });
    s += tx(O[0] - 12, (O[1] + Tt[1]) / 2 + 5, lab.h, { a:'end', vet:true, fs:14 });
    s += tx(b1[0], O[1] + 22, 'boot 1', { fs:13, vet:true, k:K[1] }) + tx(b2[0], O[1] + 22, 'boot 2', { fs:13, vet:true, k:K[2] });
    s += ln(b1[0], O[1] + 34, b2[0], O[1] + 34, { w:1.5 }) + ln(b1[0], O[1] + 29, b1[0], O[1] + 39, { w:1.5 }) + ln(b2[0], O[1] + 29, b2[0], O[1] + 39, { w:1.5 }) + tx((b1[0] + b2[0]) / 2, O[1] + 54, '?', { vet:true, k:K[1], fs:17 });
    return svg(W, H0 + 62, s, 'een vuurtoren en twee boten op het water', 460);
  }

  /* ================= de inhoud ================= */
  var G = [];

  /* ================= halve en kwart cirkels ================= */
  G.push({ groep:{ id:'wvm-m-cirkel', niveau:'vmbo', domein:'meetkunde', naam:'Halve en kwart cirkels',
      uit:'Oppervlakte en omtrek van figuren met een halve of kwart cirkel erin, zoals een raam met een boog of een sportveld met ronde kanten. De formules voor een hele cirkel staan in de leerroute rekenen.' },
    doelen:[
      { id:'wvm-m-cirk-deel-opp', naam:'Oppervlakte van een halve en een kwart cirkel', kort:'Reken de hele cirkel uit met π × r² en deel door 2 of door 4',
        uit:'<p>Een <b>halve cirkel</b> is de helft van een hele cirkel. Een <b>kwart cirkel</b> is een vierde deel.</p><p>De oppervlakte van een hele cirkel is <b>π × r²</b>. Voor een halve cirkel deel je door 2, voor een kwart cirkel door 4.</p><p>Staat de diameter erbij? Neem eerst de helft: dat is de straal. Halve cirkel met diameter 10 cm: r = 5, π × 25 : 2 ≈ <b>39,3 cm²</b>.</p>',
        wanneer:'een figuur de helft of een kwart van een cirkel is.',
        maak:function(R){
          var soort = R.kies(['half', 'half', 'kwart']), half = soort === 'half', metD = half && R.heel(0, 1) === 1, e = R.kies(['cm', 'cm', 'm']), eh = e + '²', deel = half ? 2 : 4, r, A;
          do { r = R.heel(2, 15); A = Math.PI * r * r / deel; } while (grens(A, 1));
          var d = 2 * r, bl = fDeel(soort, metD ? { d:'d = ' + d + ' ' + e } : { r:'r = ' + r + ' ' + e }), st = [], DL = ['de helft: deel door 2', 'een kwart: deel door 4'];
          if (metD) st.push(St('De straal is de helft van de diameter: ' + d + ' : 2 =', metE(T(r), e), 'De straal loopt van het midden naar de rand: de helft van ' + d + '.', F(T(2 * d), 'Je deed keer 2. De straal is de helft.'), { e:e }));
          st.push(kstap(R, 'Welk deel van een hele cirkel is de figuur?', DL[half ? 0 : 1], [], half ? 'De figuur is een halve ronde: de helft van een cirkel.' : 'De figuur is een taartpunt met een rechte hoek: een kwart van een cirkel.', { orde:DL }));
          st.push(St('r² = ' + r + ' ' + X + ' ' + r + ' =', T(r * r), r + ' keer ' + r + '.', Fz([T(r * r)], F(T(2 * r), 'Een kwadraat is keer zichzelf, niet keer 2.'))));
          st.push(St('Oppervlakte = π ' + X + ' ' + (r * r) + ' : ' + deel + ' ≈ (rond af op 1 decimaal)', af(A, 1, eh), 'Tik in: π × ' + (r * r) + ' : ' + deel + ' = ' + T(A, { dec:4 }) + '…',
            Fz(af(A, 1, eh), F(r1(A * deel), 'Dat is de hele cirkel. Deel nog door ' + deel + '.', r1(Math.PI * d * d / deel), 'Je rekende met de diameter. Gebruik de straal.')), { e:eh }));
          return { vraag:'Oppervlakte van de ' + (half ? 'halve' : 'kwart') + ' cirkel?', context:(half ? 'Een halve' : 'Een kwart') + ' cirkel heeft ' + (metD ? 'een diameter van ' + d : 'een straal van ' + r) + ' ' + e + '. Bereken de oppervlakte. Rond af op 1 decimaal.', eenheid:eh, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-cirk-deel-omtrek', naam:'Omtrek van een halve en een kwart cirkel', kort:'De boog is een deel van π × d; tel daarna de rechte stukken erbij op',
        uit:'<p>De omtrek van een hele cirkel is <b>π × d</b>. De <b>boog</b> van een halve cirkel is π × d : 2, van een kwart cirkel π × d : 4.</p><p>Maar de omtrek is de <b>hele rand</b>. Bij een halve cirkel hoort de rechte diameter er ook bij. Bij een kwart cirkel horen er twee rechte stralen bij.</p><p>Halve cirkel met d = 10 cm: boog = π × 10 : 2 ≈ 15,7 cm. Omtrek ≈ 15,7 + 10 = <b>25,7 cm</b>.</p>',
        wanneer:'je de rand om een halve of kwart cirkel zoekt, bijvoorbeeld voor een hekje of een randje.',
        maak:function(R){
          var soort = R.kies(['half', 'kwart']), half = soort === 'half', e = R.kies(['cm', 'm']), deel = half ? 2 : 4, r, d, boog, om;
          do { r = R.heel(2, 15); d = 2 * r; boog = Math.PI * d / deel; om = boog + d; } while (grens(boog, 1) || grens(om, 1));
          var bl = fDeel(soort, half ? { d:'d = ' + d + ' ' + e } : { r:'r = ' + r + ' ' + e }), st = [];
          if (!half) st.push(St('De diameter is twee keer de straal: 2 ' + X + ' ' + r + ' =', metE(T(d), e), 'Een diameter gaat dwars door het midden: twee stralen.', null, { e:e }));
          st.push(St('De boog: π ' + X + ' ' + d + ' : ' + deel + ' ≈ (rond af op 1 decimaal)', af(boog, 1, e), 'Een hele cirkel heeft omtrek π × d. Neem daarvan ' + (half ? 'de helft' : 'een kwart') + ': ' + T(boog, { dec:4 }) + '…',
            Fz(af(boog, 1, e), F(r1(Math.PI * d), 'Dat is de hele cirkel. Deel nog door ' + deel + '.', r1(Math.PI * r / deel), 'Gebruik de diameter, niet de straal.')), { e:e }));
          var RL = half ? ['de diameter: ' + d + ' ' + e, 'één straal: ' + r + ' ' + e, 'geen: alleen de boog'] : ['twee stralen: ' + r + ' + ' + r + ' = ' + d + ' ' + e, 'één straal: ' + r + ' ' + e, 'geen: alleen de boog'];
          st.push(kstap(R, 'Welke rechte stukken horen ook bij de rand?', RL[0], RL.slice(1), half ? 'Loop met je vinger om de figuur: onder de boog loopt de rechte diameter.' : 'Loop met je vinger om de figuur: aan de boog zitten twee rechte stralen.'));
          st.push(St('Omtrek = ' + r1(boog) + ' + ' + d + ' ≈', af(om, 1, e), 'Tel de boog en de rechte stukken op.', Fz(af(om, 1, e), F(r1(boog), 'Dat is alleen de boog. Tel de rechte stukken erbij op.', r1(boog + r), 'Er zijn twee stralen, samen ' + d + '.')), { e:e }));
          return { vraag:'Omtrek van de ' + (half ? 'halve' : 'kwart') + ' cirkel?', context:(half ? 'Een halve cirkel heeft een diameter van ' + d : 'Een kwart cirkel heeft een straal van ' + r) + ' ' + e + '. Bereken de omtrek: de hele rand eromheen. Rond af op 1 decimaal.', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-cirk-erbij', naam:'Samengestelde figuur: een cirkeldeel erbij', kort:'Verdeel de figuur in een rechthoek en een cirkeldeel, reken ze apart uit en tel op',
        uit:'<p>Een raam met een boog is een <b>rechthoek</b> met een <b>halve cirkel</b> erop. Reken de stukken apart uit en tel ze op.</p><p>Let op de straal: de halve cirkel staat op een zijde van de rechthoek. Die zijde is de <b>diameter</b>, de straal is de helft.</p><p>Twee halve cirkels met dezelfde diameter zijn samen <b>één hele cirkel</b>. Dat scheelt rekenwerk.</p>',
        wanneer:'een figuur bestaat uit een rechthoek met een halve of kwart cirkel ernaast.',
        maak:function(R){
          var v = R.kies(['raam', 'veld', 'kwart']), e = R.kies(['cm', 'm']), eh = e + '²', l, b, r, cd, rect, tot, deel;
          do {
            l = R.heel(4, 16); b = R.heel(3, 12);
            if (v === 'raam'){ if (l % 2) l++; r = l / 2; deel = 2; }
            else if (v === 'veld'){ if (b % 2) b++; if (l < b + 2) l = b + R.heel(2, 10); r = b / 2; deel = 1; }
            else { r = b; deel = 4; }
            cd = Math.PI * r * r / deel; rect = l * b; tot = rect + cd;
          } while (grens(cd, 1));
          var bl = fSamen(v, { l:l, b:b }, { l:l + ' ' + e, b:b + ' ' + e, r:b + ' ' + e });
          var ctx = { raam:'De figuur is een rechthoek met een halve cirkel erop.', veld:'De figuur is een rechthoek met aan twee kanten een halve cirkel.', kwart:'De figuur is een rechthoek met een kwart cirkel ernaast.' }[v];
          var st = [St('De rechthoek: ' + l + ' ' + X + ' ' + b + ' =', metE(T(rect), eh), 'Lengte keer breedte.', null, { e:eh })];
          if (v === 'raam') st.push(St('De halve cirkel staat op de bovenkant van ' + l + ' ' + e + '. De straal: ' + l + ' : 2 =', metE(T(r), e), 'De bovenkant is de diameter. De straal is de helft.', Fz([T(r)], F(T(l), 'Dat is de diameter. Neem de helft.')), { e:e }));
          else if (v === 'veld') st.push(St('De halve cirkels staan op de korte zijden van ' + b + ' ' + e + '. De straal: ' + b + ' : 2 =', metE(T(r), e), 'De korte zijde is de diameter. De straal is de helft.', Fz([T(r)], F(T(b), 'Dat is de diameter. Neem de helft.')), { e:e }));
          else st.push(kstap(R, 'Hoe lang is de straal van de kwart cirkel?', r + ' ' + e, [l + ' ' + e, T(b / 2) + ' ' + e], 'Het midden van de kwart cirkel ligt in de hoek van de rechthoek. De straal is zo lang als de zijde van ' + b + ' ' + e + '.'));
          var form = 'π ' + X + ' ' + (r * r) + (deel > 1 ? ' : ' + deel : ''), voor = v === 'raam' ? 'De halve cirkel: ' : v === 'veld' ? 'Twee halve cirkels zijn samen één hele cirkel: ' : 'De kwart cirkel: ';
          st.push(St(voor + form + ' ≈ (rond af op 1 decimaal)', af(cd, 1, eh), 'Tik in: ' + form + ' = ' + T(cd, { dec:4 }) + '…', Fz(af(cd, 1, eh), v === 'veld' ? F(r1(cd / 2), 'Er zijn twee halve cirkels. Samen zijn ze één hele.') : F(r1(Math.PI * r * r), 'Dat is een hele cirkel. Deel nog door ' + deel + '.')), { e:eh }));
          st.push(St('De hele figuur: ' + rect + ' + ' + r1(cd) + ' ≈', af(tot, 1, eh), 'Tel de rechthoek en het cirkeldeel op.', Fz(af(tot, 1, eh), F(r1(rect - cd), 'Het cirkeldeel komt erbij: optellen.')), { e:eh }));
          return { vraag:'Oppervlakte van de figuur?', context:ctx + ' De rechthoek is ' + l + ' bij ' + b + ' ' + e + '. Bereken de oppervlakte. Rond af op 1 decimaal.', eenheid:eh, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-cirk-eraf', naam:'Samengestelde figuur: een cirkeldeel eraf', kort:'Reken de hele rechthoek of het hele vierkant uit en haal het cirkeldeel eraf',
        uit:'<p>Is er een stuk uit een figuur gehaald? Reken dan eerst de <b>hele figuur</b> uit, zonder gat. Haal daarna het stuk dat <b>weg</b> is eraf.</p><p>Uit elke hoek van een vierkante tegel is een kwart cirkel gehaald? <b>Vier kwarten</b> zijn samen één hele cirkel.</p><p>Vierkant van 10 bij 10 met vier kwart cirkels met r = 3 eruit: 100 − π × 9 ≈ 100 − 28,3 = <b>71,7</b>.</p>',
        wanneer:'er een halve of kwart cirkel uit een figuur is weggehaald.',
        maak:function(R){
          var v = R.kies(['gat', 'hoeken', 'hoek1']), e = 'cm', eh = e + '²', l, b, s, d, r, groot, weg, rest, deel;
          do {
            if (v === 'gat'){ l = R.heel(8, 20); b = R.heel(5, 14); r = R.heel(2, Math.min(Math.floor((l - 2) / 2), b - 2)); d = 2 * r; groot = l * b; deel = 2; }
            else if (v === 'hoeken'){ s = R.heel(8, 20); r = R.heel(2, Math.floor((s - 2) / 2)); groot = s * s; deel = 1; }
            else { s = R.heel(4, 15); r = s; groot = s * s; deel = 4; }
            weg = Math.PI * r * r / deel; rest = groot - weg;
          } while (grens(weg, 1) || grens(rest, 1));
          var bl = v === 'gat' ? fSamen('gat', { l:l, b:b, d:d }, { l:l + ' ' + e, b:b + ' ' + e, d:d + ' ' + e }) : v === 'hoeken' ? fSamen('hoeken', { s:s, r:r }, { s:s + ' ' + e, r:r + ' ' + e }) : fSamen('hoek1', { s:s }, { s:s + ' ' + e, r:'r = ' + s + ' ' + e });
          var ctx = { gat:'Uit een rechthoekige plank is een halve cirkel gezaagd.', hoeken:'Uit de vier hoeken van een vierkante tegel is een kwart cirkel gehaald. De kwart cirkels zijn even groot.', hoek1:'Uit een vierkant is een kwart cirkel geknipt. Het midden van de cirkel ligt in een hoek van het vierkant.' }[v];
          var st = [St('De hele ' + (v === 'gat' ? 'rechthoek: ' + l + ' ' + X + ' ' + b : 'tegel: ' + s + ' ' + X + ' ' + s) + ' =', metE(T(groot), eh), 'Reken eerst alsof er niets uit is.', null, { e:eh })];
          if (v === 'gat') st.push(St('Het gat is een halve cirkel met diameter ' + d + '. De straal: ' + d + ' : 2 =', metE(T(r), e), 'De straal is de helft van de diameter.', F(T(2 * d), 'De straal is de helft, niet het dubbele.'), { e:e }));
          else if (v === 'hoeken') st.push(kstap(R, 'De vier kwart cirkels samen zijn:', 'één hele cirkel', ['een halve cirkel', 'vier hele cirkels'], 'Vier kwarten maken samen één hele cirkel.'));
          else st.push(kstap(R, 'Hoe lang is de straal van de kwart cirkel?', s + ' ' + e, [T(s / 2) + ' ' + e, T(2 * s) + ' ' + e], 'Het midden ligt in een hoek. De boog loopt van hoek tot hoek, dus de straal is de zijde van het vierkant.'));
          var form = 'π ' + X + ' ' + (r * r) + (deel > 1 ? ' : ' + deel : ''), voor = v === 'gat' ? 'Het gat: ' : v === 'hoeken' ? 'Eén hele cirkel: ' : 'De kwart cirkel: ';
          st.push(St(voor + form + ' ≈ (rond af op 1 decimaal)', af(weg, 1, eh), 'Tik in: ' + form + ' = ' + T(weg, { dec:4 }) + '…', Fz(af(weg, 1, eh), v === 'hoeken' ? F(r1(weg / 4), 'Dat is maar één kwart. Er zijn er vier.') : F(r1(Math.PI * r * r), 'Dat is een hele cirkel. Deel nog door ' + deel + '.')), { e:eh }));
          st.push(St('Wat overblijft: ' + groot + ' ' + MIN + ' ' + r1(weg) + ' ≈', af(rest, 1, eh), 'De hele figuur min het stuk dat weg is.', Fz(af(rest, 1, eh), F(r1(groot + weg), 'Het cirkeldeel is weggehaald: aftrekken, niet optellen.')), { e:eh }));
          var mt = v === 'gat' ? ' De plank is ' + l + ' bij ' + b + ' ' + e + ', het gat heeft een diameter van ' + d + ' ' + e + '.' : v === 'hoeken' ? ' De tegel is ' + s + ' bij ' + s + ' ' + e + ', de straal is ' + r + ' ' + e + '.' : ' Het vierkant is ' + s + ' bij ' + s + ' ' + e + '.';
          return { vraag:'Oppervlakte van de figuur?', context:ctx + mt + ' Bereken de oppervlakte van de gekleurde figuur. Rond af op 1 decimaal.', eenheid:eh, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-cirk-omtrek', naam:'Omtrek van een samengestelde figuur', kort:'Loop langs de rand: tel de rechte stukken en de bogen op, maar geen lijnen binnenin',
        uit:'<p>De omtrek is de lengte van de <b>rand</b>. Loop in gedachten om de figuur heen en tel alleen wat je tegenkomt.</p><p>Lijnen <b>binnenin</b> (de stippellijnen) horen er niet bij. Waar een halve cirkel tegen de rechthoek staat, loop je langs de boog en niet langs de rechte lijn.</p><p>Tel eerst alle <b>rechte stukken</b> op, reken dan de <b>bogen</b> uit en tel alles samen.</p>',
        wanneer:'je de rand van een figuur met bogen zoekt, bijvoorbeeld voor een hek of een sierrand.',
        maak:function(R){
          var v = R.kies(['raam', 'veld', 'gat']), e = R.kies(['cm', 'm']); if (v === 'gat') e = 'cm'; var l, b, d, recht, boog, om;
          do {
            l = R.heel(6, 20); b = R.heel(4, 14);
            if (v === 'raam'){ if (l % 2) l++; recht = l + 2 * b; boog = Math.PI * l / 2; }
            else if (v === 'veld'){ if (l < b + 2) l = b + R.heel(2, 10); recht = 2 * l; boog = Math.PI * b; }
            else { d = 2 * R.heel(2, Math.min(Math.floor((l - 2) / 2), b - 2)); recht = l + 2 * b + (l - d); boog = Math.PI * d / 2; }
            om = recht + boog;
          } while (grens(boog, 1) || grens(om, 1));
          var bl = v === 'gat' ? fSamen('gat', { l:l, b:b, d:d }, { l:l + ' ' + e, b:b + ' ' + e, d:d + ' ' + e }) : fSamen(v, { l:l, b:b }, { l:l + ' ' + e, b:b + ' ' + e });
          var ctx = { raam:'De figuur is een rechthoek met een halve cirkel erop.', veld:'De figuur is een rechthoek met aan twee kanten een halve cirkel.', gat:'Uit een rechthoekige plank is een halve cirkel gezaagd.' }[v];
          var rt = v === 'raam' ? 'De rechte stukken: de onderkant en de twee zijkanten: ' + l + ' + ' + b + ' + ' + b + ' ='
            : v === 'veld' ? 'De rechte stukken: de twee lange zijden: ' + l + ' + ' + l + ' ='
            : 'De rechte stukken: de onderkant, de twee zijkanten en de bovenkant zonder het gat (' + l + ' ' + MIN + ' ' + d + ' = ' + (l - d) + '): ' + l + ' + ' + b + ' + ' + b + ' + ' + (l - d) + ' =';
          var rf = v === 'raam' ? F(T(2 * l + 2 * b), 'De stippellijn ligt binnenin. Die hoort niet bij de rand.') : v === 'veld' ? F(T(2 * l + 2 * b), 'De korte zijden zijn stippellijnen binnenin. Die horen niet bij de rand.') : F(T(2 * l + 2 * b), 'Boven zit een gat van ' + d + '. Daar loop je langs de boog.');
          var bt = v === 'raam' ? 'De boog is een halve cirkel met diameter ' + l + ': π ' + X + ' ' + l + ' : 2' : v === 'veld' ? 'Twee halve cirkels zijn samen één hele cirkel met diameter ' + b + ': π ' + X + ' ' + b : 'De boog is een halve cirkel met diameter ' + d + ': π ' + X + ' ' + d + ' : 2';
          var bf = v === 'veld' ? F(r1(boog / 2), 'Er zijn twee bogen. Samen zijn ze een hele cirkel.') : F(r1(boog * 2), 'Dat is een hele cirkel. Deel nog door 2.');
          var st = [
            kstap(R, 'Hoort een stippellijn bij de omtrek?', 'nee, die ligt niet op de rand', ['ja, die hoort erbij'], 'Loop in gedachten om de figuur. Langs de stippellijn kom je niet.'),
            St(rt, metE(T(recht), e), 'Tel alleen de rechte stukken op de buitenrand.', Fz([T(recht)], rf), { e:e }),
            St(bt + ' ≈ (rond af op 1 decimaal)', af(boog, 1, e), 'Omtrek van een cirkel is π × d. ' + T(boog, { dec:4 }) + '…', Fz(af(boog, 1, e), bf), { e:e }),
            St('Omtrek = ' + recht + ' + ' + r1(boog) + ' ≈', af(om, 1, e), 'Tel de rechte stukken en de boog op.', Fz(af(om, 1, e), F(r1(boog), 'Tel de rechte stukken er nog bij.')), { e:e }) ];
          var mt = v === 'gat' ? ' De plank is ' + l + ' bij ' + b + ' ' + e + ', het gat heeft een diameter van ' + d + ' ' + e + '.' : ' De rechthoek is ' + l + ' bij ' + b + ' ' + e + '.';
          return { vraag:'Omtrek van de figuur?', context:ctx + mt + ' Bereken de omtrek van de gekleurde figuur. Rond af op 1 decimaal.', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  /* ================= schaal ================= */
  var KAARTN = [10000, 20000, 25000, 50000, 100000, 200000];
  G.push({ groep:{ id:'wvm-m-schaal', niveau:'vmbo', domein:'meetkunde', naam:'Schaal',
      uit:'Met de schaal van een kaart of plattegrond van de tekening naar het echt en terug, en een tekening op een andere schaal. Hoe een schaal werkt staat ook in de leerroute rekenen.' },
    doelen:[
      { id:'wvm-m-schaal-werk', naam:'Van tekening naar werkelijkheid', kort:'Bij schaal 1 : n is alles in het echt n keer zo groot: doe keer n en reken om',
        uit:'<p>Schaal <b>1 : 25.000</b> betekent: 1 cm op de kaart is <b>25.000 cm</b> in het echt.</p><p>Meet de lengte op de kaart en doe <b>keer 25.000</b>. Dan heb je de echte lengte in cm.</p><p>Reken daarna om naar meters (<b>: 100</b>) of kilometers (<b>: 100.000</b>). 4 cm op de kaart: 4 × 25.000 = 100.000 cm = 1000 m = <b>1 km</b>.</p>',
        wanneer:'je op een kaart of plattegrond meet en wilt weten hoe lang het echt is.',
        maak:function(R){
          var kaart = R.heel(0, 2) > 0, n, t, km;
          if (kaart){ n = R.kies(KAARTN); t = R.heel(2, 24) / 2; km = n >= 50000 || R.heel(0, 1) === 1; }
          else { n = R.kies([50, 100, 200, 250]); t = R.heel(4, 30) / 2; km = false; }
          var cm = rnd(t * n, 6), doel = km ? 'km' : 'm', uit = rnd(km ? cm / 100000 : cm / 100, 6), nT = T(n, { punt:true });
          var bl = fKaart({ t:t, n:n, lab:T(t) + ' cm' });
          return { vraag:'Hoeveel ' + doel + ' in het echt?', context:kaart ? 'Op een kaart met schaal 1 : ' + nT + ' liggen A en B ' + T(t) + ' cm uit elkaar. Hoe ver is dat in het echt, in ' + doel + '?' : 'Op een plattegrond met schaal 1 : ' + nT + ' is de muur AB ' + T(t) + ' cm lang. Hoe lang is de muur in het echt, in m?', eenheid:doel, beeld:bl, zelfBeeld:bl, stappen:[
            St('In het echt is alles ' + nT + ' keer zo groot: ' + T(t) + ' ' + X + ' ' + nT + ' =', metE(T(cm), 'cm'), 'Bij schaal 1 : ' + nT + ' is 1 cm op papier ' + nT + ' cm in het echt.', null, { e:'cm' }),
            St('Reken om naar ' + doel + ': ' + T(cm) + ' : ' + (km ? '100.000' : '100') + ' =', metE(T(uit), doel), km ? 'Van cm naar km deel je door 100.000: eerst : 100 naar meters, dan : 1000 naar km.' : 'Van cm naar m deel je door 100.',
              Fz(metE(T(uit), doel), km ? F(T(rnd(cm / 100, 6)), 'Dat zijn meters. Deel nog door 1000 voor km.', T(rnd(cm / 1000, 6)), 'Van cm naar km is : 100.000.') : F(T(rnd(cm / 1000, 6)), 'Van cm naar m is : 100, niet : 1000.', T(rnd(cm / 10, 6)), 'Van cm naar m is : 100.')), { e:doel }) ] };
        } },
      { id:'wvm-m-schaal-teken', naam:'Van werkelijkheid naar tekening', kort:'Reken de echte lengte om naar cm en deel door n',
        uit:'<p>Andersom: je weet hoe lang iets <b>in het echt</b> is en wilt het tekenen.</p><p>Reken de echte lengte eerst om naar <b>cm</b>. Deel dan door het getal achter <b>1 :</b>.</p><p>Op een kaart met schaal 1 : 50.000 is 3 km: 3 km = 300.000 cm, en 300.000 : 50.000 = <b>6 cm</b>.</p>',
        wanneer:'je iets op schaal moet tekenen of wilt weten hoe groot het op de kaart wordt.',
        maak:function(R){
          var kaart = R.heel(0, 2) > 0, n, t, km;
          if (kaart){ n = R.kies(KAARTN); t = R.heel(2, 24) / 2; km = n >= 50000 || R.heel(0, 1) === 1; }
          else { n = R.kies([50, 100, 200, 250]); t = R.heel(4, 30) / 2; km = false; }
          var cm = rnd(t * n, 6), doel = km ? 'km' : 'm', w = rnd(km ? cm / 100000 : cm / 100, 6), nT = T(n, { punt:true });
          var bl = fKaart({ t:t, n:n, lab:'?', onder:'in het echt ' + T(w) + ' ' + doel });
          return { vraag:'Hoeveel cm op de ' + (kaart ? 'kaart' : 'tekening') + '?', context:kaart ? 'A en B liggen in het echt ' + T(w) + ' ' + doel + ' uit elkaar. Hoe ver liggen ze uit elkaar op een kaart met schaal 1 : ' + nT + '?' : 'Een muur is in het echt ' + T(w) + ' m lang. Hoe lang wordt de muur op een plattegrond met schaal 1 : ' + nT + '?', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            St('Reken om naar cm: ' + T(w) + ' ' + doel + ' = ' + T(w) + ' ' + X + ' ' + (km ? '100.000' : '100') + ' =', metE(T(cm), 'cm'), km ? '1 km = 1000 m = 100.000 cm.' : '1 m = 100 cm.', Fz(metE(T(cm), 'cm'), km ? F(T(rnd(w * 1000, 6)), 'Dat zijn meters. Nog keer 100 voor cm.') : F(T(rnd(w * 10, 6)), '1 m is 100 cm.')), { e:'cm' }),
            St('Op de ' + (kaart ? 'kaart' : 'tekening') + ': ' + T(cm) + ' : ' + nT + ' =', metE(T(t), 'cm'), 'Op papier is alles ' + nT + ' keer zo klein: deel door ' + nT + '.', null, { e:'cm' }) ] };
        } },
      { id:'wvm-m-schaal-verg', naam:'Een tekening op een andere schaal', kort:'De factor is oud getal : nieuw getal; lengtes keer k, oppervlaktes keer k²',
        uit:'<p>Een plattegrond op schaal 1 : 200 teken je opnieuw op schaal 1 : 50. Dan wordt de tekening <b>200 : 50 = 4 keer</b> zo groot. Dat is de factor <b>k</b>.</p><p>Elke <b>lengte</b> op de nieuwe tekening is k keer zo groot. Een <b>oppervlakte</b> wordt k² keer zo groot: 4 × 4 = 16 keer.</p><p>Hoe kleiner het getal achter 1 :, hoe groter de tekening. Van 1 : 50 naar 1 : 100 is k = 0,5: de tekening wordt kleiner.</p>',
        wanneer:'je een tekening of kaart vergroot of verkleint naar een andere schaal.',
        maak:function(R){
          var p, na, nb, k, opp, a, uit;
          do { p = R.kies([[200, 100], [200, 50], [100, 50], [500, 100], [250, 50], [1000, 250], [100, 25], [300, 100], [50, 100], [100, 200], [200, 400], [100, 500]]); na = p[0]; nb = p[1]; k = na / nb; opp = R.heel(0, 2) === 0; } while (opp && k < 0.5);
          if (opp){ a = R.heel(2, 30); uit = rnd(a * k * k, 6); } else { a = R.heel(2, 24) / 2; uit = rnd(a * k, 6); }
          var bl = fTwee(k, na, nb, opp ? a + ' cm²' : T(a) + ' cm', '?');
          var st = [St('Hoeveel keer zo groot wordt de tekening? k = ' + na + ' : ' + nb + ' =', T(k), 'Op de oude tekening is 1 cm in het echt ' + na + ' cm, op de nieuwe ' + nb + ' cm. Deel ' + na + ' door ' + nb + '.', Fz([T(k)], F(T(rnd(nb / na, 2)), 'Andersom: het oude getal gedeeld door het nieuwe.')), { waarom:'Hoe kleiner het getal achter 1 :, hoe groter de tekening.' })];
          if (opp){
            st.push(kstap(R, 'Je zoekt een oppervlakte. Met welke factor reken je?', 'k²', [], 'Een oppervlakte groeit in twee richtingen mee: lengte en breedte. Dus k².', { orde:['k', 'k²', 'k³'] }));
            st.push(St('k² = ' + T(k) + ' ' + X + ' ' + T(k) + ' =', T(rnd(k * k, 6)), 'Keer zichzelf.', Fz([T(rnd(k * k, 6))], F(T(2 * k), 'Een kwadraat is keer zichzelf, niet keer 2.'))));
            st.push(St('De nieuwe oppervlakte: ' + a + ' ' + X + ' ' + T(rnd(k * k, 6)) + ' =', metE(T(uit), 'cm²'), 'De oude oppervlakte keer k².', Fz(metE(T(uit), 'cm²'), F(T(rnd(a * k, 6)), 'Je deed alleen keer k. Een oppervlakte gaat keer k².')), { e:'cm²' }));
          } else st.push(St('De nieuwe lengte: ' + T(a) + ' ' + X + ' ' + T(k) + ' =', metE(T(uit), 'cm'), 'De oude lengte keer de factor.', Fz(metE(T(uit), 'cm'), F(T(rnd(a / k, 2)), 'Keer de factor, niet delen.')), { e:'cm' }));
          return { vraag:opp ? 'Nieuwe oppervlakte?' : 'Nieuwe lengte?', context:'Een plattegrond op schaal 1 : ' + na + ' teken je opnieuw op schaal 1 : ' + nb + '. ' + (opp ? 'Een kamer heeft op de oude tekening een oppervlakte van ' + a + ' cm². Hoe groot is de kamer op de nieuwe tekening?' : 'Een muur is op de oude tekening ' + T(a) + ' cm. Hoe lang is de muur op de nieuwe tekening?'), eenheid:opp ? 'cm²' : 'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  /* ================= oppervlakte op schaal ================= */
  function soppLengte(R, n){
    var a, b, x; do { a = R.heel(4, 16) / 2; b = R.heel(4, 12) / 2; } while ((a * n / 50) % 1 || (b * n / 50) % 1); if (a < b){ x = a; a = b; b = x; }
    var Am = rnd(a * n / 100, 6), Bm = rnd(b * n / 100, 6), opp = rnd(Am * Bm, 6), wat = n >= 250 ? 'tuin' : 'kamer';
    return { a:a, b:b, Am:Am, Bm:Bm, opp:opp, wat:wat, bl:fKamer(a, b, n, T(a) + ' cm', T(b) + ' cm'),
      ctx:'Op een plattegrond met schaal 1 : ' + n + ' is een ' + wat + ' ' + T(a) + ' cm lang en ' + T(b) + ' cm breed. Hoe groot is de ' + wat + ' in het echt, in m²?',
      lStap:function(){ return St('De echte lengte: ' + T(a) + ' ' + X + ' ' + n + ' = ' + T(rnd(a * n, 6)) + ' cm =', metE(T(Am), 'm'), 'Keer ' + n + ' geeft cm. Deel dan door 100 voor meters.', null, { e:'m' }); },
      bStap:function(){ return St('De echte breedte: ' + T(b) + ' ' + X + ' ' + n + ' = ' + T(rnd(b * n, 6)) + ' cm =', metE(T(Bm), 'm'), 'Keer ' + n + ' geeft cm. Deel dan door 100 voor meters.', null, { e:'m' }); },
      oStap:function(){ return St('De oppervlakte in het echt: ' + T(Am) + ' ' + X + ' ' + T(Bm) + ' =', metE(T(opp), 'm²'), 'Lengte keer breedte, met de echte maten.', Fz(metE(T(opp), 'm²'), F(T(rnd(a * b, 6)), 'Dat is de oppervlakte op de tekening. Reken met de echte maten.')), { e:'m²' }); } };
  }
  var GEBIED = ['meer', 'bos', 'natuurgebied', 'eiland'];
  function soppHokje(R, n){
    var km = n >= 50000, e = km ? 'km' : 'm', eh = e + '²', L = rnd(km ? n / 100000 : n / 100, 6), L2 = rnd(L * L, 6), A = R.heel(0, 2) ? R.heel(2, 24) : R.heel(3, 30) / 2, uit = rnd(A * L2, 6), wat = R.kies(GEBIED);
    return { L:L, L2:L2, A:A, uit:uit, e:e, eh:eh, bl:fMeer(A, n, R),
      ctx:'Op een kaart met schaal 1 : ' + T(n, { punt:true }) + ' heeft een ' + wat + ' een oppervlakte van ' + T(A) + ' cm². Hoe groot is het ' + wat + ' in het echt, in ' + eh + '?',
      hStap:function(){ return St('1 cm² op de kaart is een hokje van 1 bij 1 cm. In het echt is dat ' + T(L) + ' ' + e + ' ' + X + ' ' + T(L) + ' ' + e + ' =', metE(T(L2), eh), 'Een hokje van 1 bij 1 cm is in het echt ' + T(L) + ' bij ' + T(L) + ' ' + e + '.', Fz(metE(T(L2), eh), F(T(L), 'Een oppervlakte: ook nog keer ' + T(L) + '.', T(rnd(2 * L, 6)), 'Keer, niet plus.')), { e:eh }); },
      gStap:function(){ return St('Het ' + wat + ': ' + T(A) + ' ' + X + ' ' + T(L2) + ' =', metE(T(uit), eh), 'Elke cm² op de kaart is ' + T(L2) + ' ' + eh + ' in het echt.', Fz(metE(T(uit), eh), F(T(rnd(A * L, 6)), 'Je rekende met de lengte. Neem de oppervlakte van één hokje: ' + T(L2) + '.')), { e:eh }); } };
  }
  var SOPPN = [1000, 2000, 5000, 10000, 20000, 25000, 50000];
  G.push({ groep:{ id:'wvm-m-sopp', niveau:'vmbo', domein:'meetkunde', naam:'Oppervlakte op schaal',
      uit:'Hoe groot is een kamer, tuin of meer in het echt als je de kaart of plattegrond kent? Dat kan op twee manieren: eerst de lengtes omrekenen, of uitrekenen wat 1 cm² in het echt is.' },
    doelen:[
      { id:'wvm-m-sopp-lengte', naam:'Eerst de lengtes omrekenen', kort:'Reken de lengte en de breedte om naar het echt, en vermenigvuldig dan',
        uit:'<p>Een kamer is op een plattegrond met schaal 1 : 100 <b>4 cm</b> lang en <b>3 cm</b> breed. Hoe groot is hij echt?</p><p>Reken eerst <b>elke lengte</b> om: 4 × 100 = 400 cm = 4 m en 3 × 100 = 300 cm = 3 m.</p><p>Vermenigvuldig daarna de echte maten: 4 × 3 = <b>12 m²</b>. Doe niet de oppervlakte op papier keer 100: dat klopt niet.</p>',
        wanneer:'je de lengte en de breedte op de tekening kunt meten.',
        maak:function(R){
          var n = R.kies([50, 100, 200, 250, 500]), o = soppLengte(R, n);
          return { vraag:'Oppervlakte in het echt?', context:o.ctx, eenheid:'m²', beeld:o.bl, zelfBeeld:o.bl, stappen:[o.lStap(), o.bStap(), o.oStap()] };
        } },
      { id:'wvm-m-sopp-hokje', naam:'Wat is 1 cm² in het echt?', kort:'1 cm op de kaart is n cm echt; 1 cm² is dan een vierkant van die lengte bij die lengte',
        uit:'<p>Soms weet je alleen de <b>oppervlakte</b> op de kaart, bijvoorbeeld van een meer. Bedenk dan wat <b>één hokje van 1 cm²</b> in het echt is.</p><p>Schaal 1 : 10.000: 1 cm op de kaart is 10.000 cm = <b>100 m</b>. Een hokje van 1 bij 1 cm is dus 100 m bij 100 m = <b>10.000 m²</b>.</p><p>Een meer van 6 cm² op de kaart is in het echt 6 × 10.000 = <b>60.000 m²</b>.</p>',
        wanneer:'je alleen de oppervlakte op de kaart weet, zoals bij een meer of een bos.',
        maak:function(R){
          var n = R.kies(SOPPN), o = soppHokje(R, n);
          return { vraag:'Oppervlakte in het echt?', context:o.ctx, eenheid:o.eh, beeld:o.bl, zelfBeeld:o.bl, stappen:[
            St('1 cm op de kaart is in het echt ' + T(n, { punt:true }) + ' cm =', metE(T(o.L), o.e), o.e === 'km' ? 'Van cm naar km deel je door 100.000.' : 'Van cm naar m deel je door 100.', null, { e:o.e }),
            o.hStap(), o.gStap() ] };
        } },
      { id:'wvm-m-sopp-kies', naam:'Kies de handigste manier', kort:'Weet je lengte en breedte? Reken die eerst om. Weet je alleen de oppervlakte op de kaart? Reken met 1 cm²',
        uit:'<p>Je kent nu twee manieren om een oppervlakte op schaal uit te rekenen.</p><ul><li><b>Eerst de lengtes omrekenen</b>: handig als je de lengte en de breedte op de tekening weet. De getallen blijven klein.</li><li><b>Wat is 1 cm² in het echt</b>: de enige manier als je alleen de oppervlakte op de kaart weet, zoals bij een meer.</li></ul><p>Kies eerst de manier, reken dan uit.</p>',
        wanneer:'je een oppervlakte op schaal moet uitrekenen en zelf de aanpak kiest.',
        maak:function(R){
          var lengte = R.heel(0, 1) === 1, M = ['eerst de lengte en de breedte omrekenen', 'uitrekenen wat 1 cm² in het echt is'], o, st;
          if (lengte){ o = soppLengte(R, R.kies([50, 100, 200, 250, 500])); st = [kstap(R, 'Welke manier past hier het best?', M[0], [], 'Je kent de lengte en de breedte op de tekening. Reken die om en vermenigvuldig: dan blijven de getallen klein.', { orde:M }), o.lStap(), o.bStap(), o.oStap()]; }
          else { o = soppHokje(R, R.kies(SOPPN)); st = [kstap(R, 'Welke manier past hier het best?', M[1], [], 'Je weet geen lengte en breedte, alleen de oppervlakte op de kaart. Reken uit wat 1 cm² in het echt is.', { orde:M }), o.hStap(), o.gStap()]; }
          return { vraag:'Oppervlakte in het echt?', context:o.ctx, eenheid:lengte ? 'm²' : o.eh, beeld:o.bl, zelfBeeld:o.bl, stappen:st };
        } }
    ] });

  /* ================= gelijkvormige driehoeken ================= */
  var FK = [1.5, 2, 2.5, 3, 4];
  function factorGetallen(R){
    var k = R.kies(FK), a = R.heel(2, 9); if (k % 1 && a % 2) a++;
    return { k:k, a:a, ab:rnd(a * k, 6) };
  }
  G.push({ groep:{ id:'wvm-m-gv', niveau:'vmbo', domein:'meetkunde', naam:'Gelijkvormige driehoeken',
      uit:'Twee driehoeken met dezelfde hoeken zijn gelijkvormig: de ene is een vergroting van de andere. Met de vergrotingsfactor reken je een ontbrekende zijde uit, in de snavel en in de zandloper.' },
    doelen:[
      { id:'wvm-m-gv-snavel', naam:'De snavel', kort:'Zoek de zijde die bij een bekende zijde hoort; factor = grote zijde : kleine zijde',
        uit:'<p>In de figuur is <b>DE evenwijdig aan BC</b>. Driehoek ADE en driehoek ABC hebben dan dezelfde hoeken: ze zijn <b>gelijkvormig</b>. Dit heet een <b>snavel</b>.</p><p>Zoek eerst welke zijden bij elkaar horen: AD hoort bij <b>AB</b> (niet bij DB!), DE hoort bij BC.</p><p>De <b>vergrotingsfactor</b> is grote zijde : kleine zijde, bijvoorbeeld AB : AD. Van klein naar groot doe je <b>keer</b> de factor, van groot naar klein <b>gedeeld door</b>.</p>',
        wanneer:'een lijn in een driehoek evenwijdig loopt aan een zijde.',
        maak:function(R){
          var g = factorGetallen(R), k = g.k, a = g.a, AB = g.ab, db = rnd(AB - a, 6), e = R.heel(2, 10), BC = rnd(e * k, 6), zoekBC = R.heel(0, 1) === 1;
          var bl = fSnavel(k, { AD:a + ' cm', DB:T(db) + ' cm', DE:zoekBC ? e + ' cm' : '?', BC:zoekBC ? '?' : T(BC) + ' cm' });
          var st = [
            kstap(R, 'Welke zijde van de grote driehoek ABC hoort bij AD?', 'AB', ['DB', 'BC'], 'AD ligt in de kleine driehoek ADE. Op dezelfde plek in de grote driehoek ligt de hele zijde AB.'),
            St('AB = AD + DB = ' + a + ' + ' + T(db) + ' =', metE(T(AB), 'cm'), 'AB is AD en DB samen.', null, { e:'cm' }),
            St('De vergrotingsfactor: AB : AD = ' + T(AB) + ' : ' + a + ' =', T(k), 'Deel de grote zijde door de bijbehorende kleine zijde.', Fz([T(k)], F(T(rnd(db / a, 2)), 'Je gebruikte DB. Gebruik de hele zijde AB.', T(rnd(a / AB, 2)), 'Andersom: groot gedeeld door klein.'))) ];
          if (zoekBC) st.push(St('BC = DE ' + X + ' ' + T(k) + ' = ' + e + ' ' + X + ' ' + T(k) + ' =', metE(T(BC), 'cm'), 'Van de kleine naar de grote driehoek: keer de factor.', Fz(metE(T(BC), 'cm'), F(T(rnd(e / k, 2)), 'Van klein naar groot is keer, niet delen.')), { e:'cm' }));
          else st.push(St('DE = BC : ' + T(k) + ' = ' + T(BC) + ' : ' + T(k) + ' =', metE(T(e), 'cm'), 'Van de grote naar de kleine driehoek: deel door de factor.', Fz(metE(T(e), 'cm'), F(T(rnd(BC * k, 2)), 'Van groot naar klein is delen, niet keer.')), { e:'cm' }));
          return { vraag:(zoekBC ? 'BC' : 'DE') + ' = ?', context:'In de figuur is DE evenwijdig aan BC. AD = ' + a + ' cm, DB = ' + T(db) + ' cm en ' + (zoekBC ? 'DE = ' + e : 'BC = ' + T(BC)) + ' cm. Bereken ' + (zoekBC ? 'BC' : 'DE') + '. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-gv-zandloper', naam:'De zandloper', kort:'AB evenwijdig aan CD: driehoek SAB en SDC zijn gelijkvormig, SA hoort bij SD en AB bij CD',
        uit:'<p>Twee lijnen snijden elkaar in S, en <b>AB is evenwijdig aan CD</b>. Dan krijg je twee driehoeken die op elkaar staan als een <b>zandloper</b>: SAB en SDC.</p><p>Ze zijn gelijkvormig. Hoek A en hoek D zijn even groot (Z-hoeken), en de hoeken bij S zijn overstaande hoeken. Dus <b>SA hoort bij SD</b>, SB bij SC en AB bij CD.</p><p>Factor = grote zijde : bijbehorende kleine zijde. Daarna keer of gedeeld door, net als bij de snavel.</p>',
        wanneer:'twee driehoeken met een punt tegen elkaar aan liggen, met twee evenwijdige zijden.',
        maak:function(R){
          var g = factorGetallen(R), k = g.k, a = g.a, SD = g.ab, e = R.heel(2, 9), CD = rnd(e * k, 6), f = R.heel(2, 8), SC = rnd(f * k, 6), v = R.heel(0, 2), lab, st;
          if (v === 0){ lab = { SA:a + ' cm', SD:T(SD) + ' cm', AB:e + ' cm', CD:'?' };
            st = [kstap(R, 'Welke zijde van driehoek SDC hoort bij SA?', 'SD', ['SC', 'CD'], 'Hoek A en hoek D zijn even groot (Z-hoeken). Dus SA hoort bij SD.'),
              St('De factor: SD : SA = ' + T(SD) + ' : ' + a + ' =', T(k), 'Grote zijde gedeeld door de bijbehorende kleine zijde.', Fz([T(k)], F(T(rnd(a / SD, 2)), 'Andersom: groot gedeeld door klein.'))),
              St('CD = AB ' + X + ' ' + T(k) + ' = ' + e + ' ' + X + ' ' + T(k) + ' =', metE(T(CD), 'cm'), 'AB hoort bij CD. Van klein naar groot: keer de factor.', Fz(metE(T(CD), 'cm'), F(T(rnd(e / k, 2)), 'Van klein naar groot is keer.')), { e:'cm' })]; }
          else if (v === 1){ lab = { AB:e + ' cm', CD:T(CD) + ' cm', SB:f + ' cm', SC:'?' };
            st = [kstap(R, 'Welke zijde van driehoek SDC hoort bij AB?', 'CD', ['SD', 'SC'], 'AB en CD zijn de twee evenwijdige zijden. Die horen bij elkaar.'),
              St('De factor: CD : AB = ' + T(CD) + ' : ' + e + ' =', T(k), 'Grote zijde gedeeld door de bijbehorende kleine zijde.', Fz([T(k)], F(T(rnd(e / CD, 2)), 'Andersom: groot gedeeld door klein.'))),
              St('SB hoort bij SC. SC = SB ' + X + ' ' + T(k) + ' = ' + f + ' ' + X + ' ' + T(k) + ' =', metE(T(SC), 'cm'), 'Van klein naar groot: keer de factor.', Fz(metE(T(SC), 'cm'), F(T(rnd(f / k, 2)), 'Van klein naar groot is keer.')), { e:'cm' })]; }
          else { lab = { SA:a + ' cm', SD:T(SD) + ' cm', AB:'?', CD:T(CD) + ' cm' };
            st = [kstap(R, 'Welke zijde van driehoek SDC hoort bij SA?', 'SD', ['SC', 'CD'], 'Hoek A en hoek D zijn even groot (Z-hoeken). Dus SA hoort bij SD.'),
              St('De factor: SD : SA = ' + T(SD) + ' : ' + a + ' =', T(k), 'Grote zijde gedeeld door de bijbehorende kleine zijde.', Fz([T(k)], F(T(rnd(a / SD, 2)), 'Andersom: groot gedeeld door klein.'))),
              St('AB = CD : ' + T(k) + ' = ' + T(CD) + ' : ' + T(k) + ' =', metE(T(e), 'cm'), 'AB hoort bij CD. Van groot naar klein: deel door de factor.', Fz(metE(T(e), 'cm'), F(T(rnd(CD * k, 2)), 'Van groot naar klein is delen.')), { e:'cm' })]; }
          var zoek = v === 0 ? 'CD' : v === 1 ? 'SC' : 'AB', bl = fZand(k, lab);
          return { vraag:zoek + ' = ?', context:'In de figuur is AB evenwijdig aan CD. ' + Object.keys(lab).filter(function(z){ return lab[z] !== '?'; }).map(function(z){ return z + ' = ' + lab[z]; }).join(', ').replace(/, ([^,]*)$/, ' en $1') + '. Bereken ' + zoek + '. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-gv-stuk', naam:'Een stuk van een zijde berekenen', kort:'Reken eerst de hele zijde uit met de factor, en trek dan het stuk eraf dat je al weet',
        uit:'<p>In een snavel wordt soms een <b>stuk</b> van een zijde gevraagd, zoals DB. Daar hoort geen zijde in de kleine driehoek bij.</p><p>Reken daarom eerst de <b>hele zijde</b> AB uit met de vergrotingsfactor. Trek daarna het stuk af dat je al weet: <b>DB = AB − AD</b>.</p><p>AD = 4, DE = 3 en BC = 6: factor 6 : 3 = 2, AB = 4 × 2 = 8, DB = 8 − 4 = <b>4</b>.</p>',
        wanneer:'er in een snavel naar een stuk van een zijde wordt gevraagd.',
        maak:function(R){
          var g = factorGetallen(R), k = g.k, a = g.a, AB = g.ab, db = rnd(AB - a, 6), e = R.heel(2, 10), BC = rnd(e * k, 6);
          var bl = fSnavel(k, { AD:a + ' cm', DB:'?', DE:e + ' cm', BC:T(BC) + ' cm' });
          return { vraag:'DB = ?', context:'In de figuur is DE evenwijdig aan BC. AD = ' + a + ' cm, DE = ' + e + ' cm en BC = ' + T(BC) + ' cm. Bereken DB. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke zijde van driehoek ABC hoort bij DE?', 'BC', ['AB', 'AC'], 'DE en BC zijn evenwijdig: ze liggen op dezelfde plek in de kleine en de grote driehoek.'),
            St('De factor: BC : DE = ' + T(BC) + ' : ' + e + ' =', T(k), 'Grote zijde gedeeld door de bijbehorende kleine zijde.', Fz([T(k)], F(T(rnd(e / BC, 2)), 'Andersom: groot gedeeld door klein.'))),
            St('AD hoort bij AB. AB = AD ' + X + ' ' + T(k) + ' = ' + a + ' ' + X + ' ' + T(k) + ' =', metE(T(AB), 'cm'), 'Van klein naar groot: keer de factor.', null, { e:'cm' }),
            St('DB = AB ' + MIN + ' AD = ' + T(AB) + ' ' + MIN + ' ' + a + ' =', metE(T(db), 'cm'), 'DB is het stuk van AB onder D.', Fz(metE(T(db), 'cm'), F(T(AB), 'Dat is de hele zijde AB. Trek AD er nog af.')), { e:'cm' }) ] };
        } },
      { id:'wvm-m-gv-schaduw', naam:'Schaduwen: gelijkvormig in het echt', kort:'Hoogte en schaduw van een stok en van een hoog voorwerp vormen gelijkvormige driehoeken',
        uit:'<p>De zon schijnt op hetzelfde moment overal onder dezelfde hoek. Een stok en een boom met hun schaduw vormen dan twee <b>gelijkvormige driehoeken</b>.</p><p>Schaduw hoort bij schaduw, hoogte bij hoogte. De factor is <b>grote schaduw : kleine schaduw</b>.</p><p>Stok 2 m, schaduw 3 m. Boom met schaduw 15 m: factor 15 : 3 = 5, dus de boom is 2 × 5 = <b>10 m</b> hoog.</p>',
        wanneer:'je de hoogte van iets hoogs wilt weten zonder erop te klimmen.',
        maak:function(R){
          var obj = R.kies(['de boom', 'de flat', 'de toren', 'de lantaarnpaal', 'de vlaggenmast']), p, s, k, S2, H;
          do { p = R.kies([1, 1.2, 1.5, 2, 2.5]); s = R.kies([0.8, 1.2, 1.5, 2, 2.5, 3, 4]); k = R.kies([2.5, 3, 4, 5, 6, 7.5, 8, 10, 12]); S2 = rnd(s * k, 6); H = rnd(p * k, 6); } while (H > 40 || S2 > 50);
          var bl = fSchaduw(s / p, Math.min(k, 3.2), { p:T(p) + ' m', s:T(s) + ' m', S:T(S2) + ' m', H:'?' });
          return { vraag:'Hoe hoog is ' + obj + '?', context:'Een stok van ' + T(p) + ' m hoog geeft een schaduw van ' + T(s) + ' m. Op hetzelfde moment geeft ' + obj + ' een schaduw van ' + T(S2) + ' m. De figuur is niet op schaal.', eenheid:'m', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke lengte bij ' + obj + ' hoort bij de schaduw van de stok?', 'de schaduw van ' + obj, ['de hoogte van ' + obj, 'de hoogte van de stok'], 'Schaduw hoort bij schaduw en hoogte bij hoogte.'),
            St('De factor: ' + T(S2) + ' : ' + T(s) + ' =', T(k), 'Grote schaduw gedeeld door kleine schaduw.', Fz([T(k)], F(T(rnd(s / S2, 2)), 'Andersom: groot gedeeld door klein.'))),
            St('De hoogte van ' + obj + ': ' + T(p) + ' ' + X + ' ' + T(k) + ' =', metE(T(H), 'm'), 'De hoogte van de stok keer de factor.', Fz(metE(T(H), 'm'), F(T(rnd(p / k, 2)), 'Van klein naar groot is keer.')), { e:'m' }) ] };
        } }
    ] });

  /* ================= inhoud in liters ================= */
  function balkCtx(R){ return R.kies(['Een aquarium', 'Een koelbox', 'Een doos', 'Een bak']); }
  function literCm(R){
    var cil = R.heel(0, 2) === 0, o = {};
    if (cil){
      var r, h, V, Vr, L;
      do { r = R.heel(3, 15); h = R.heel(8, 40); V = Math.PI * r * r * h; Vr = Math.round(V); L = V / 1000; } while (grens(V, 0) || grens(L, 1) || !eens(Vr / 1000, L, 1));
      o.ctx = R.kies(['Een pan', 'Een blik', 'Een vat']) + ' heeft de vorm van een cilinder met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Hoeveel liter past erin? Rond af op 1 decimaal.';
      o.bl = rondFig({ r:r, h:h, labR:'r = ' + r + ' cm', labH:'h = ' + h + ' cm', aria:'een cilinder' });
      o.s1 = St('Inhoud = π ' + X + ' ' + r + '² ' + X + ' ' + h + ' ≈ (rond af op hele cm³)', af(V, 0, 'cm³'), 'Grondvlak keer hoogte: π × ' + (r * r) + ' × ' + h + ' = ' + T(V, { dec:2 }) + '…', Fz(af(V, 0, 'cm³'), F(T(Math.round(Math.PI * 2 * r * h)), 'Gebruik r², niet 2 × r.')), { e:'cm³' });
      o.s3 = St('In liters: ' + T(Vr) + ' : 1000 ≈ (rond af op 1 decimaal)', af(L, 1, 'liter', LIT), 'Deel door 1000.', Fz(af(L, 1, 'liter', LIT), F(r1(Vr / 100), '1 liter is 1000 cm³: deel door 1000, niet door 100.')), { e:'liter' });
    } else {
      var l, b, hh, V2, L2;
      do { l = R.heel(15, 70); b = R.heel(12, 45); hh = R.heel(10, 45); V2 = l * b * hh; L2 = V2 / 1000; } while (l % 10 === 0 || b % 10 === 0 || hh % 10 === 0 || grens(L2, 1));
      o.ctx = balkCtx(R) + ' is ' + l + ' cm lang, ' + b + ' cm breed en ' + hh + ' cm hoog. Hoeveel liter past erin? Rond af op 1 decimaal.';
      o.bl = fBak(l, b, hh, null, { l:l + ' cm', b:b + ' cm', H:hh + ' cm' });
      o.s1 = St('Inhoud = ' + l + ' ' + X + ' ' + b + ' ' + X + ' ' + hh + ' =', metE(T(V2), 'cm³'), 'Lengte keer breedte keer hoogte.', null, { e:'cm³' });
      o.s3 = St('In liters: ' + T(V2) + ' : 1000 ≈ (rond af op 1 decimaal)', af(L2, 1, 'liter', LIT), 'Deel door 1000: ' + T(L2) + '.', Fz(af(L2, 1, 'liter', LIT), F(r1(V2 / 100), '1 liter is 1000 cm³: deel door 1000, niet door 100.')), { e:'liter' });
    }
    return o;
  }
  function literDm(R){
    var inM = R.heel(0, 2) === 0, pool = inM ? [0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3] : [20, 25, 30, 40, 45, 50, 60, 80, 100, 120], m = [R.kies(pool), R.kies(pool), R.kies(pool)];
    var wat = inM ? R.kies([['Een container', 'hoog'], ['Een zandbak', 'diep'], ['Een vijver met rechte wanden', 'diep']]) : [balkCtx(R), 'hoog'];
    if (wat[1] === 'diep') m[2] = R.kies([0.4, 0.5, 0.6, 0.8, 1]);
    var u = inM ? 'm' : 'cm', dm = m.map(function(x){ return rnd(inM ? x * 10 : x / 10, 6); }), V = rnd(dm[0] * dm[1] * dm[2], 6);
    var namen = ['De lengte', 'De breedte', wat[1] === 'diep' ? 'De diepte' : 'De hoogte'];
    return { V:V, dm:dm, ctx:wat[0] + ' is ' + T(m[0]) + ' ' + u + ' lang, ' + T(m[1]) + ' ' + u + ' breed en ' + T(m[2]) + ' ' + u + ' ' + wat[1] + '. Hoeveel liter past erin?',
      bl:fBak(m[0], m[1], m[2], null, { l:T(m[0]) + ' ' + u, b:T(m[1]) + ' ' + u, H:T(m[2]) + ' ' + u }),
      omStap:function(i){ return St(namen[i] + ' in dm: ' + T(m[i]) + ' ' + u + ' =', metE(T(dm[i]), 'dm'), inM ? '1 m = 10 dm: keer 10.' : '10 cm = 1 dm: deel door 10.', Fz(metE(T(dm[i]), 'dm'), inM ? F(T(rnd(m[i] * 100, 6)), '1 m is 10 dm, niet 100.') : F(T(rnd(m[i] * 10, 6)), 'Van cm naar dm deel je door 10.', T(rnd(m[i] / 100, 6)), 'Dat zijn meters. Van cm naar dm is : 10.')), { e:'dm' }); },
      eindStap:function(tekst){ return St(tekst || ('Inhoud = ' + T(dm[0]) + ' ' + X + ' ' + T(dm[1]) + ' ' + X + ' ' + T(dm[2]) + ' dm³. Dat is in liters:'), metE(T(V), 'liter', ['l', 'dm³']), '1 dm³ = 1 liter. ' + T(dm[0]) + ' × ' + T(dm[1]) + ' × ' + T(dm[2]) + ' = ' + T(V) + '.', null, { e:'liter' }); } };
  }
  var LKIES = ['eerst omrekenen naar dm', 'eerst in cm³, dan : 1000'];
  function stapNaarLiter(R){ return kstap(R, 'Hoe reken je cm³ om naar liter?', ': 1000', [], '1 liter = 1 dm³ = 1000 cm³. Van cm³ naar liter deel je dus door 1000.', { orde:[': 1000', X + ' 1000', ': 100'] }); }
  G.push({ groep:{ id:'wvm-m-liter', niveau:'vmbo', domein:'meetkunde', naam:'Inhoud in liters',
      uit:'Hoeveel liter past erin? 1 liter is 1 dm³ en 1000 cm³. Je rekent eerst in cm³ en deelt door 1000, of je rekent eerst alle maten om naar dm.' },
    doelen:[
      { id:'wvm-m-liter-cm', naam:'Liters: eerst in cm³, dan : 1000', kort:'Reken de inhoud uit in cm³ en deel door 1000: 1 liter = 1000 cm³',
        uit:'<p>Reken de inhoud eerst uit met de maten in <b>cm</b>. Je krijgt dan <b>cm³</b>.</p><p>Eén liter is 1 dm³, en dat is een kubus van 10 bij 10 bij 10 cm = <b>1000 cm³</b>. Van cm³ naar liter deel je dus door <b>1000</b>.</p><p>Doos van 37 × 24 × 15 cm: 13.320 cm³ : 1000 = <b>13,3 liter</b>.</p>',
        wanneer:'de maten in cm zijn en geen ronde getallen.',
        maak:function(R){
          var o = literCm(R);
          return { vraag:'Hoeveel liter?', context:o.ctx, eenheid:'liter', beeld:o.bl, zelfBeeld:o.bl, stappen:[o.s1, stapNaarLiter(R), o.s3] };
        } },
      { id:'wvm-m-liter-dm', naam:'Liters: eerst omrekenen naar dm', kort:'Reken alle maten om naar dm; dm³ is precies liter',
        uit:'<p>1 dm³ is precies <b>1 liter</b>. Reken daarom eerst alle maten om naar <b>dm</b>, dan krijg je meteen liters.</p><p>Van cm naar dm deel je door 10: 40 cm = 4 dm. Van m naar dm doe je keer 10: 1,5 m = 15 dm.</p><p>Container van 2 m × 1,5 m × 0,8 m: 20 × 15 × 8 = 2400 dm³ = <b>2400 liter</b>.</p>',
        wanneer:'de maten ronde tientallen cm zijn, of in meters gegeven zijn.',
        maak:function(R){
          var o = literDm(R);
          return { vraag:'Hoeveel liter?', context:o.ctx, eenheid:'liter', beeld:o.bl, zelfBeeld:o.bl, stappen:[o.omStap(0), o.omStap(1), o.omStap(2), o.eindStap()] };
        } },
      { id:'wvm-m-liter-kies', naam:'Kies de handigste manier', kort:'Ronde maten of meters: eerst naar dm. Lastige maten in cm: eerst cm³, dan : 1000',
        uit:'<p>Je kent twee manieren om liters uit te rekenen.</p><ul><li><b>Eerst omrekenen naar dm</b>: handig als de maten ronde tientallen cm zijn (30 cm = 3 dm) of in meters staan. Je krijgt meteen liters.</li><li><b>Eerst in cm³, dan : 1000</b>: handig als de maten in cm niet rond zijn, zoals 37 cm. Dan krijg je anders lastige kommagetallen.</li></ul>',
        wanneer:'je liters moet uitrekenen en zelf de aanpak kiest.',
        maak:function(R){
          var dmM = R.heel(0, 1) === 1, o, st;
          if (dmM){ o = literDm(R); st = [kstap(R, 'Welke manier is hier het handigst?', LKIES[0], [], 'De maten zijn ronde tientallen cm of hele meters. Reken ze om naar dm: dan krijg je meteen liters.', { orde:LKIES }),
            o.omStap(0), o.omStap(1), o.omStap(2), o.eindStap()]; }
          else { do { o = literCm(R); } while (!/cm lang/.test(o.ctx)); st = [kstap(R, 'Welke manier is hier het handigst?', LKIES[1], [], 'De maten zijn geen ronde tientallen. Reken in cm³ en deel door 1000.', { orde:LKIES }), o.s1, o.s3]; }
          return { vraag:'Hoeveel liter?', context:o.ctx, eenheid:'liter', beeld:o.bl, zelfBeeld:o.bl, stappen:st };
        } }
    ] });

  /* ================= inhoud van ruimtefiguren ================= */
  G.push({ groep:{ id:'wvm-m-inhoud', niveau:'vmbo', domein:'meetkunde', naam:'Inhoud van ruimtefiguren',
      uit:'De inhoud van een bol, van figuren die uit twee stukken bestaan, van figuren met een gat, en terugrekenen hoe hoog het water staat. Balk, prisma, cilinder, piramide en kegel staan in de leerroute rekenen en bij Vergroten en inhoud.' },
    doelen:[
      { id:'wvm-m-inh-bol', naam:'Inhoud van een bol', kort:'Inhoud = 4/3 × π × r³; een halve bol is de helft daarvan',
        uit:'<p>De inhoud van een <b>bol</b> staat op het formuleblad: <b>inhoud = 4/3 × π × r³</b>.</p><p>r³ betekent r × r × r. Tik op je rekenmachine: 4 : 3 × π × r³.</p><p>Bol met r = 3 cm: r³ = 27, inhoud = 4 : 3 × π × 27 ≈ <b>113,1 cm³</b>. Een <b>halve bol</b> is de helft: ≈ 56,5 cm³.</p>',
        wanneer:'een voorwerp de vorm heeft van een bal of een halve bal.',
        maak:function(R){
          var half = R.heel(0, 2) === 0, metD = R.heel(0, 1) === 1, it = half ? R.kies([['Een kom in de vorm van een halve bol', 4, 14, 'cm'], ['Een koepel in de vorm van een halve bol', 3, 12, 'm']]) : R.kies([['Een tennisbal', 3, 4, 'cm'], ['Een voetbal', 11, 11, 'cm'], ['Een kerstbal', 3, 6, 'cm'], ['Een bolle lamp', 6, 12, 'cm'], ['Een bal', 4, 15, 'cm']]);
          var e = it[3], eh = e + '³', r, V, r3;
          do { r = R.heel(it[1], it[2]); r3 = r * r * r; V = 4 / 3 * Math.PI * r3 / (half ? 2 : 1); } while (grens(V, 1) && it[1] < it[2]);
          var d = 2 * r, bl = fBol(half, metD ? { d:'d = ' + d + ' ' + e } : { r:'r = ' + r + ' ' + e }), st = [];
          if (metD) st.push(St('De straal: ' + d + ' : 2 =', metE(T(r), e), 'De straal is de helft van de diameter.', null, { e:e }));
          st.push(kstap(R, 'Welke formule hoort bij de inhoud van een bol?', '4/3 ' + X + ' π ' + X + ' r³', ['π ' + X + ' r² ' + X + ' h', '4 ' + X + ' π ' + X + ' r²'], 'Een bol heeft geen grondvlak en geen hoogte. Op het formuleblad staat: inhoud bol = 4/3 × π × r³.'));
          st.push(St('r³ = ' + r + ' ' + X + ' ' + r + ' ' + X + ' ' + r + ' =', T(r3), 'Drie keer ' + r + ' met elkaar vermenigvuldigen.', Fz([T(r3)], F(T(3 * r), 'r³ is r keer r keer r, niet keer 3.', T(r * r), 'Nog een keer keer ' + r + '.'))));
          var form = '4/3 ' + X + ' π ' + X + ' ' + r3 + (half ? ' : 2' : '');
          st.push(St('Inhoud = ' + form + ' ≈ (rond af op 1 decimaal)', af(V, 1, eh), 'Tik in: 4 : 3 × π × ' + r3 + (half ? ' : 2' : '') + ' = ' + T(V, { dec:4 }) + '…', Fz(af(V, 1, eh), half ? F(r1(V * 2), 'Dat is een hele bol. Deel nog door 2.', r1(Math.PI * r3 / 2), 'Vergeet 4/3 niet.') : F(r1(Math.PI * r3), 'Vergeet 4/3 niet.')), { e:eh }));
          return { vraag:'Inhoud van de ' + (half ? 'halve bol' : 'bol') + '?', context:it[0] + ' heeft een ' + (metD ? 'diameter van ' + d : 'straal van ' + r) + ' ' + e + '. Bereken de inhoud. Rond af op 1 decimaal.', eenheid:eh, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-inh-samen', naam:'Samengestelde ruimtefiguur', kort:'Splits de figuur in twee bekende stukken, reken elk stuk uit en tel op',
        uit:'<p>Een silo is een <b>cilinder</b> met een <b>halve bol</b> erop. Een schuur is een <b>balk</b> met een dak in de vorm van een <b>prisma</b>.</p><p>Bepaal eerst uit welke stukken de figuur bestaat. Reken de inhoud van elk stuk apart uit met de juiste formule.</p><p>Tel daarna de stukken op. Let op: het dak heeft als grondvlak een <b>driehoek</b>: basis × hoogte : 2.</p>',
        wanneer:'een ruimtefiguur uit twee bekende figuren bestaat.',
        maak:function(R){
          var v = R.kies(['silo', 'raket', 'huis']), DEL = ['een cilinder en een halve bol', 'een cilinder en een kegel', 'een balk en een prisma'], st, bl, ctx, e, V1, V2, tot;
          if (v !== 'huis'){
            var r, h, th = 0;
            do { r = R.heel(2, 6); h = R.heel(v === 'silo' ? 5 : 8, v === 'silo' ? 15 : 25); if (v === 'raket') th = R.heel(3, 10);
              V1 = Math.PI * r * r * h; V2 = v === 'silo' ? 2 / 3 * Math.PI * r * r * r : Math.PI * r * r * th / 3; tot = V1 + V2;
            } while (grens(V1, 1) || grens(V2, 1) || grens(tot, 1) || !eens(rnd(V1, 1) + rnd(V2, 1), tot, 1));
            e = v === 'silo' ? 'm' : 'cm';
            bl = rondFig({ r:r, h:h, top:v === 'silo' ? 'bol' : 'kegel', th:th, labR:'r = ' + r + ' ' + e, labH:h + ' ' + e, labT:v === 'raket' ? th + ' ' + e : '', aria:v === 'silo' ? 'een cilinder met een halve bol erop' : 'een cilinder met een kegel erop' });
            ctx = v === 'silo' ? 'Een silo is een cilinder met een halve bol erop. De straal is ' + r + ' m en de cilinder is ' + h + ' m hoog.' : 'Een raket van karton is een cilinder met een kegel erop. De straal is ' + r + ' cm, de cilinder is ' + h + ' cm hoog en de kegel ' + th + ' cm.';
            var f2 = v === 'silo' ? 'De halve bol: 4/3 ' + X + ' π ' + X + ' ' + r + '³ : 2' : 'De kegel: π ' + X + ' ' + r + '² ' + X + ' ' + th + ' : 3';
            st = [kstap(R, 'Uit welke stukken bestaat de figuur?', DEL[v === 'silo' ? 0 : 1], [], v === 'silo' ? 'Onder recht omhoog (cilinder), boven een ronde koepel (halve bol).' : 'Onder recht omhoog (cilinder), boven een punt (kegel).', { orde:DEL }),
              St('De cilinder: π ' + X + ' ' + r + '² ' + X + ' ' + h + ' ≈ (rond af op 1 decimaal)', af(V1, 1, e + '³'), 'Grondvlak keer hoogte: π × ' + (r * r) + ' × ' + h + ' = ' + T(V1, { dec:4 }) + '…', null, { e:e + '³' }),
              St(f2 + ' ≈ (rond af op 1 decimaal)', af(V2, 1, e + '³'), v === 'silo' ? 'Tik in: 4 : 3 × π × ' + (r * r * r) + ' : 2 = ' + T(V2, { dec:4 }) + '…' : 'Tik in: π × ' + (r * r) + ' × ' + th + ' : 3 = ' + T(V2, { dec:4 }) + '…', Fz(af(V2, 1, e + '³'), F(r1(V2 * (v === 'silo' ? 2 : 3)), v === 'silo' ? 'Dat is een hele bol. Deel nog door 2.' : 'Vergeet niet te delen door 3.')), { e:e + '³' }),
              St('Samen: ' + r1(V1) + ' + ' + r1(V2) + ' ≈', af(tot, 1, e + '³'), 'Tel de twee stukken op.', null, { e:e + '³' })];
          } else {
            var l, b, hh, t, Gd;
            do { l = R.heel(6, 14); b = R.heel(4, 10); hh = R.heel(3, 7); t = R.heel(2, 5); } while ((b * t) % 2);
            e = 'm'; Gd = b * t / 2; V1 = l * b * hh; V2 = Gd * l; tot = V1 + V2;
            bl = fHuis(l, b, hh, t, { l:l + ' m', b:b + ' m', h:hh + ' m', t:t + ' m' });
            ctx = 'Een schuur is een balk met een dak in de vorm van een prisma. De schuur is ' + l + ' m lang, ' + b + ' m breed en de muren zijn ' + hh + ' m hoog. De nok ligt ' + t + ' m boven de muren.';
            st = [kstap(R, 'Uit welke stukken bestaat de figuur?', DEL[2], [], 'Onder een balk, en het dak is een prisma met een driehoek als voorkant.', { orde:DEL }),
              St('De balk: ' + l + ' ' + X + ' ' + b + ' ' + X + ' ' + hh + ' =', metE(T(V1), 'm³'), 'Lengte keer breedte keer hoogte.', null, { e:'m³' }),
              St('Het grondvlak van het dak is een driehoek: ' + b + ' ' + X + ' ' + t + ' : 2 =', metE(T(Gd), 'm²'), 'Basis keer hoogte gedeeld door 2.', Fz(metE(T(Gd), 'm²'), F(T(b * t), 'Een driehoek is de helft: deel nog door 2.')), { e:'m²' }),
              St('Het dak: ' + T(Gd) + ' ' + X + ' ' + l + ' =', metE(T(V2), 'm³'), 'Grondvlak keer de lengte van het prisma.', null, { e:'m³' }),
              St('Samen: ' + V1 + ' + ' + T(V2) + ' =', metE(T(tot), 'm³'), 'Tel de balk en het dak op.', null, { e:'m³' })];
          }
          var heel = Math.abs(tot - Math.round(tot)) < 1e-9;
          return { vraag:'Inhoud van de hele figuur?', context:ctx + ' Bereken de inhoud.' + (heel ? '' : ' Rond af op 1 decimaal.'), eenheid:e + '³', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-inh-gat', naam:'Inhoud met een gat: groot min weg', kort:'Reken de hele figuur uit alsof er geen gat is, en trek de inhoud van het gat eraf',
        uit:'<p>Een buis of een blok met een gat erin: reken eerst de <b>hele figuur</b> uit, alsof hij dicht is.</p><p>Reken daarna de inhoud van het <b>gat</b> uit. Een rond gat is een cilinder: π × r² × h.</p><p>Trek het gat eraf: <b>inhoud = groot − gat</b>. Zo weet je hoeveel materiaal er echt in zit.</p>',
        wanneer:'er een gat door een figuur loopt, zoals bij een buis of een kraal.',
        maak:function(R){
          var buis = R.heel(0, 1) === 1, Rb, r, h, l, b, V1, V2, rest, bl, ctx, st;
          if (buis){
            do { Rb = R.heel(3, 10); r = R.heel(1, Rb - 1); h = R.heel(5, 30); V1 = Math.PI * Rb * Rb * h; V2 = Math.PI * r * r * h; rest = V1 - V2; } while (grens(V1, 1) || grens(V2, 1) || grens(rest, 1) || !eens(rnd(V1, 1) - rnd(V2, 1), rest, 1));
            bl = rondFig({ r:Rb, h:h, ri:r, labR:'R = ' + Rb, labRi:'r = ' + r, labH:h + ' cm', aria:'een buis: een cilinder met een cilinder eruit' });
            ctx = 'Een buis is ' + h + ' cm lang. De buitenstraal is R = ' + Rb + ' cm en de binnenstraal is r = ' + r + ' cm. Hoeveel cm³ materiaal zit er in de buis? Rond af op 1 decimaal.';
            st = [St('De hele cilinder, met de buitenstraal: π ' + X + ' ' + Rb + '² ' + X + ' ' + h + ' ≈ (rond af op 1 decimaal)', af(V1, 1, 'cm³'), 'Tik in: π × ' + (Rb * Rb) + ' × ' + h + ' = ' + T(V1, { dec:4 }) + '…', null, { e:'cm³' }),
              St('Het gat, met de binnenstraal: π ' + X + ' ' + r + '² ' + X + ' ' + h + ' ≈ (rond af op 1 decimaal)', af(V2, 1, 'cm³'), 'Tik in: π × ' + (r * r) + ' × ' + h + ' = ' + T(V2, { dec:4 }) + '…', null, { e:'cm³' })];
          } else {
            do { l = R.heel(6, 15); b = R.heel(6, 12); h = R.heel(3, 12); r = R.heel(1, Math.floor((Math.min(l, b) - 2) / 2)); V1 = l * b * h; V2 = Math.PI * r * r * h; rest = V1 - V2; } while (grens(V2, 1) || grens(rest, 1));
            bl = fBlok(l, b, h, r, { l:l + ' cm', b:b + ' cm', h:h + ' cm', r:'r = ' + r });
            ctx = 'Door een houten blok van ' + l + ' bij ' + b + ' bij ' + h + ' cm is van boven naar beneden een rond gat geboord. Het gat heeft een straal van ' + r + ' cm. Hoeveel cm³ hout blijft er over? Rond af op 1 decimaal.';
            st = [St('Het hele blok: ' + l + ' ' + X + ' ' + b + ' ' + X + ' ' + h + ' =', metE(T(V1), 'cm³'), 'Lengte keer breedte keer hoogte.', null, { e:'cm³' }),
              St('Het gat is een cilinder, ' + h + ' cm hoog: π ' + X + ' ' + r + '² ' + X + ' ' + h + ' ≈ (rond af op 1 decimaal)', af(V2, 1, 'cm³'), 'Tik in: π × ' + (r * r) + ' × ' + h + ' = ' + T(V2, { dec:4 }) + '…', null, { e:'cm³' })];
          }
          st.unshift(kstap(R, 'Hoe reken je de inhoud uit?', 'de hele figuur min het gat', ['de hele figuur plus het gat', 'alleen het gat'], 'Het gat is leeg. Dat haal je eraf.'));
          st.push(St('Wat overblijft: ' + (buis ? r1(V1) : T(V1)) + ' ' + MIN + ' ' + r1(V2) + ' ≈', af(rest, 1, 'cm³'), 'De hele figuur min het gat.', Fz(af(rest, 1, 'cm³'), F(r1(V1 + V2), 'Het gat is leeg: aftrekken, niet optellen.')), { e:'cm³' }));
          return { vraag:'Hoeveel cm³ ' + (buis ? 'materiaal' : 'hout') + '?', context:ctx, eenheid:'cm³', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-inh-terug', naam:'Terugrekenen: hoe hoog staat het water?', kort:'Reken liters om naar cm³ en deel door het grondvlak: hoogte = inhoud : grondvlak',
        uit:'<p>Inhoud = grondvlak × hoogte. Weet je de inhoud en het grondvlak, dan reken je terug: <b>hoogte = inhoud : grondvlak</b>.</p><p>Staat de inhoud in <b>liters</b>? Maak eerst cm³: 1 liter = 1000 cm³.</p><p>Aquarium van 60 bij 30 cm met 45 liter water: 45.000 cm³ : 1800 cm² = <b>25 cm</b> hoog.</p>',
        wanneer:'je weet hoeveel liter er in een bak zit en wilt weten hoe hoog het staat.',
        maak:function(R){
          var aq = R.heel(0, 2) > 0, V, hw, Gd, bl, ctx, st = [];
          if (aq){
            var mt, l, b, Ht;
            do { mt = R.kies([[60, 30], [80, 35], [100, 40], [50, 25], [120, 50], [40, 25], [70, 30], [90, 45]]); l = mt[0]; b = mt[1]; Ht = R.kies([30, 35, 40, 45, 50, 60]); V = R.heel(Math.ceil(l * b * 8 / 1000), Math.floor(l * b * (Ht - 4) / 1000)); Gd = l * b; hw = V * 1000 / Gd; } while (grens(hw, 1));
            bl = fBak(l, b, Ht, hw, { l:l + ' cm', b:b + ' cm', H:'', w:'?', aria:'een aquarium met water erin' });
            ctx = 'Een aquarium is ' + l + ' cm lang en ' + b + ' cm breed. Er zit ' + V + ' liter water in. Hoe hoog staat het water? Rond af op 1 decimaal.';
            st.push(St('Reken om naar cm³: ' + V + ' liter = ' + V + ' ' + X + ' 1000 =', metE(T(V * 1000), 'cm³'), '1 liter = 1 dm³ = 1000 cm³.', F(T(V * 100), '1 liter is 1000 cm³, niet 100.'), { e:'cm³' }));
            st.push(St('Het grondvlak: ' + l + ' ' + X + ' ' + b + ' =', metE(T(Gd), 'cm²'), 'Lengte keer breedte.', null, { e:'cm²' }));
            var ex = Math.abs(hw * 10 - Math.round(hw * 10)) < 1e-9;
            st.push(St('De hoogte = inhoud : grondvlak = ' + T(V * 1000) + ' : ' + T(Gd) + (ex ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(hw, 1, 'cm'), 'Deel de inhoud door het grondvlak: ' + T(hw, { dec:4 }) + (ex ? '.' : '…'), Fz(af(hw, 1, 'cm'), F(r1(V * 100 / Gd), 'Reken met ' + T(V * 1000) + ' cm³.')), { e:'cm' }));
          } else {
            var r, Gr, Htt;
            do { r = R.heel(15, 35); V = R.heel(20, 150); Gd = Math.PI * r * r; Gr = rnd(Gd, 1); hw = V * 1000 / Gd; } while (grens(Gd, 1) || grens(hw, 1) || !eens(V * 1000 / Gr, hw, 1) || hw < 10);
            Htt = Math.ceil(hw) + R.heel(8, 25);
            bl = rondFig({ r:r, h:Htt, water:hw, labR:'r = ' + r + ' cm', labW:'?', aria:'een regenton met water erin' });
            ctx = 'Een regenton is een cilinder met een straal van ' + r + ' cm. Er zit ' + V + ' liter water in. Hoe hoog staat het water? Rond af op 1 decimaal.';
            st.push(St('Reken om naar cm³: ' + V + ' liter = ' + V + ' ' + X + ' 1000 =', metE(T(V * 1000), 'cm³'), '1 liter = 1 dm³ = 1000 cm³.', F(T(V * 100), '1 liter is 1000 cm³, niet 100.'), { e:'cm³' }));
            st.push(St('Het grondvlak: π ' + X + ' ' + r + '² ≈ (rond af op 1 decimaal)', af(Gd, 1, 'cm²'), 'Tik in: π × ' + (r * r) + ' = ' + T(Gd, { dec:4 }) + '…', null, { e:'cm²' }));
            st.push(St('De hoogte = inhoud : grondvlak = ' + T(V * 1000) + ' : ' + T(Gr) + ' ≈ (rond af op 1 decimaal)', af(hw, 1, 'cm'), 'Deel de inhoud door het grondvlak: ' + T(V * 1000 / Gr, { dec:4 }) + '…', Fz(af(hw, 1, 'cm'), F(r1(V * 100 / Gd), 'Reken met ' + T(V * 1000) + ' cm³.')), { e:'cm' }));
          }
          return { vraag:'Hoe hoog staat het water?', context:ctx, eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  /* ================= oppervlakte van ruimtefiguren ================= */
  G.push({ groep:{ id:'wvm-m-opp', niveau:'vmbo', domein:'meetkunde', naam:'Oppervlakte van ruimtefiguren',
      uit:'De oppervlakte van een prisma en van een cilinder: alle vlakken samen. Denk aan de uitslag: welke vlakken zie je als je de figuur openvouwt?' },
    doelen:[
      { id:'wvm-m-opp-prisma', naam:'Oppervlakte van een prisma', kort:'Twee driehoeken en drie rechthoeken; de rechthoeken samen zijn omtrek van de driehoek × lengte',
        uit:'<p>Een prisma met een driehoek als grondvlak heeft <b>2 driehoeken</b> (voor en achter) en <b>3 rechthoeken</b> (de zijkanten).</p><p>De twee driehoeken samen: 2 × (basis × hoogte : 2) = basis × hoogte. Elke rechthoek is zo lang als het prisma, dus de drie samen: <b>(a + b + c) × lengte</b>.</p><p>Driehoek 3, 4, 5 en lengte 10: 2 × 6 + 12 × 10 = 12 + 120 = <b>132 cm²</b>.</p>',
        wanneer:'je wilt weten hoeveel karton of hout er nodig is voor een prisma.',
        maak:function(R){
          var tr = R.kies([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [8, 6, 10], [4, 3, 5], [12, 5, 13]]), a = tr[0], b = tr[1], c = tr[2], L = R.heel(5, 25), zoekC = R.heel(0, 1) === 1;
          var twee = a * b, rr = (a + b + c) * L, tot = twee + rr, st = [];
          var bl = fPrisma(a, b, L, { a:a + ' cm', b:b + ' cm', c:zoekC ? '?' : c + ' cm', l:L + ' cm' });
          if (zoekC) st.push(St('De schuine zijde van de driehoek: √(' + a + '² + ' + b + '²) = √' + (a * a + b * b) + ' =', metE(T(c), 'cm'), 'Pythagoras: ' + (a * a) + ' + ' + (b * b) + ' = ' + (a * a + b * b) + '.', Fz(metE(T(c), 'cm'), F(T(a + b), 'Eerst kwadrateren, dan optellen, dan de wortel.')), { e:'cm' }));
          st.push(St('De twee driehoeken samen: 2 ' + X + ' (' + a + ' ' + X + ' ' + b + ' : 2) =', metE(T(twee), 'cm²'), 'Eén driehoek is ' + a + ' × ' + b + ' : 2 = ' + T(twee / 2) + '. Er zijn er twee.', Fz(metE(T(twee), 'cm²'), F(T(twee / 2), 'Dat is één driehoek. Er zijn er twee: voor en achter.')), { e:'cm²' }));
          st.push(St('De drie rechthoeken samen: (' + a + ' + ' + b + ' + ' + c + ') ' + X + ' ' + L + ' =', metE(T(rr), 'cm²'), 'Elke rechthoek is ' + L + ' cm lang. De breedtes zijn de zijden van de driehoek.', Fz(metE(T(rr), 'cm²'), F(T((a + b) * L), 'Er zijn drie rechthoeken: vergeet de schuine zijde niet.')), { e:'cm²' }));
          st.push(St('Totaal: ' + twee + ' + ' + rr + ' =', metE(T(tot), 'cm²'), 'Tel de driehoeken en de rechthoeken op.', null, { e:'cm²' }));
          return { vraag:'Oppervlakte van het prisma?', context:'Het grondvlak van het prisma is een rechthoekige driehoek' + (zoekC ? ' met rechthoekszijden van ' + a + ' en ' + b + ' cm' : ' met zijden van ' + a + ', ' + b + ' en ' + c + ' cm') + '. Het prisma is ' + L + ' cm lang. Bereken de oppervlakte van alle vlakken samen.', eenheid:'cm²', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-opp-cil', naam:'Oppervlakte van een cilinder', kort:'Twee cirkels plus de mantel; de mantel is een rechthoek van π × d bij de hoogte',
        uit:'<p>Vouw een blik open. Je krijgt <b>twee cirkels</b> (bodem en deksel) en een <b>rechthoek</b>: de mantel.</p><p>De rechthoek is zo lang als de <b>omtrek</b> van de cirkel, <b>π × d</b>, en zo breed als de hoogte. Mantel = π × d × h.</p><p>Is de cilinder open, zoals een beker zonder deksel? Dan tel je maar <b>één cirkel</b>.</p>',
        wanneer:'je wilt weten hoeveel blik, karton of papier er nodig is voor een cilinder.',
        maak:function(R){
          var dicht = R.heel(0, 2) > 0, n = dicht ? 2 : 1, r, h, C, M, tot;
          do { r = R.heel(2, 12); h = R.heel(3, 25); C = Math.PI * r * r; M = 2 * Math.PI * r * h; tot = n * C + M; } while (grens(C, 1) || grens(M, 1) || grens(tot, 1) || !eens(n * rnd(C, 1) + rnd(M, 1), tot, 1));
          var d = 2 * r, wat = dicht ? R.kies(['Een blik', 'Een koker', 'Een trommel']) : R.kies(['Een beker zonder deksel', 'Een open bak']);
          var cil = rondFig({ r:r, h:h, labR:'r = ' + r + ' cm', labH:'h = ' + h + ' cm', aria:'een cilinder' }), bl = function(k){ return k >= 1 ? fUit(dicht, d, 'h = ' + h, 'r = ' + r) : cil; };
          var U = ['twee cirkels en een rechthoek', 'één cirkel en een rechthoek', 'drie rechthoeken'];
          return { vraag:'Oppervlakte van de cilinder?', context:wat + ' heeft de vorm van een cilinder met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm.' + (dicht ? '' : ' Er zit geen deksel op.') + ' Bereken de oppervlakte. Rond af op 1 decimaal.', eenheid:'cm²', beeld:bl, zelfBeeld:cil, stappen:[
            kstap(R, 'Uit welke delen bestaat de uitslag?', U[dicht ? 0 : 1], [], dicht ? 'Een dichte cilinder heeft een bodem, een deksel en een mantel. Uitgerold is de mantel een rechthoek.' : 'Er is een bodem maar geen deksel. Uitgerold is de mantel een rechthoek.', { orde:U }),
            St('Eén cirkel: π ' + X + ' ' + r + '² ≈ (rond af op 1 decimaal)', af(C, 1, 'cm²'), 'Tik in: π × ' + (r * r) + ' = ' + T(C, { dec:4 }) + '…', Fz(af(C, 1, 'cm²'), F(r1(Math.PI * d * d), 'Gebruik de straal, niet de diameter.')), { e:'cm²' }),
            St('De mantel is π ' + X + ' ' + d + ' lang en ' + h + ' breed: π ' + X + ' ' + d + ' ' + X + ' ' + h + ' ≈ (rond af op 1 decimaal)', af(M, 1, 'cm²'), 'De lengte van de rechthoek is de omtrek van de cirkel: π × ' + d + '. Keer de hoogte: ' + T(M, { dec:4 }) + '…', Fz(af(M, 1, 'cm²'), F(r1(Math.PI * r * h), 'Gebruik de diameter ' + d + ', niet de straal.')), { e:'cm²' }),
            St('Totaal: ' + (dicht ? '2 ' + X + ' ' + r1(C) : r1(C)) + ' + ' + r1(M) + ' ≈', af(tot, 1, 'cm²'), dicht ? 'Twee cirkels en de mantel.' : 'Eén cirkel en de mantel.', Fz(af(tot, 1, 'cm²'), dicht ? F(r1(C + M), 'Er zijn twee cirkels: bodem en deksel.') : F(r1(2 * C + M), 'Er is geen deksel: maar één cirkel.')), { e:'cm²' }) ] };
        } }
    ] });

  /* ================= afstanden in ruimtefiguren ================= */
  var TRIP = [[6, 8], [8, 6], [12, 16], [16, 12], [5, 12], [12, 5], [9, 12], [12, 9], [8, 15], [15, 8]];
  /* grondvlak van een piramide: rechthoek met een mooie diagonaal, of een vierkant (diagonaal afgerond op 1 decimaal) */
  function pirGrond(R){
    var sq = R.heel(0, 1) === 1, l, b;
    if (sq){ l = b = R.heel(4, 14); } else { var t = R.kies(TRIP); l = t[0]; b = t[1]; }
    var AC2 = l * l + b * b, AC = Math.sqrt(AC2), ACr = sq ? rnd(AC, 1) : AC, AMs = rnd(ACr / 2, 6), AMx = AC / 2;
    return { sq:sq, l:l, b:b, AC2:AC2, AC:AC, ACr:ACr, AMs:AMs, AMx:AMx };
  }
  function pirStappen(R, g){
    return [
      St('AC = √(' + g.l + '² + ' + g.b + '²) = √' + g.AC2 + (g.sq ? ' ≈ (rond af op 1 decimaal)' : ' ='), g.sq ? af(g.AC, 1, 'cm') : metE(T(g.AC), 'cm'), 'AC is de diagonaal van het grondvlak: ' + (g.l * g.l) + ' + ' + (g.b * g.b) + ' = ' + g.AC2 + ', en √' + g.AC2 + ' = ' + T(g.AC, { dec:4 }) + (g.sq ? '…' : '.'), F(T(g.l + g.b), 'Eerst kwadrateren, dan optellen, dan de wortel.'), { e:'cm' }),
      St('M is het midden van AC. AM = ' + T(g.ACr) + ' : 2 =', uniek(metE(T(g.AMs), 'cm').concat(g.sq ? af(g.AMx, 2, 'cm') : [])), 'M ligt precies in het midden van de diagonaal.', F(T(g.ACr), 'Dat is AC. AM is de helft.'), { e:'cm' }) ];
  }
  G.push({ groep:{ id:'wvm-m-afst', niveau:'vmbo', domein:'meetkunde', naam:'Afstanden in ruimtefiguren',
      uit:'Lijnstukken in een balk en een piramide berekenen met twee keer Pythagoras: eerst in het grondvlak, dan recht omhoog. De lichaamsdiagonaal van een balk staat bij Pythagoras verder.' },
    doelen:[
      { id:'wvm-m-rp-midden', naam:'Naar het midden van een ribbe in een balk', kort:'Zoek het punt recht onder M, reken eerst in het grondvlak en dan omhoog',
        uit:'<p>Je zoekt AM, met M het midden van een ribbe. Zoek eerst het punt dat <b>recht onder M</b> ligt in het grondvlak.</p><p>Reken met Pythagoras de afstand van A naar dat punt uit, <b>in het grondvlak</b>. Daarna maak je een rechthoekige driehoek die <b>recht omhoog</b> gaat naar M.</p><p>Neem tussendoor geen wortel: reken door met het kwadraat. Pas aan het eind neem je de wortel en rond je af.</p>',
        wanneer:'je een schuine afstand in een balk zoekt die niet van hoek tot hoek loopt.',
        maak:function(R){
          var cg = R.heel(0, 1) === 1, l, b, h, s1, s2, d;
          do { l = R.heel(3, 12); b = R.heel(2, 10); h = R.heel(2, 12); if (cg && h % 2) h++; if (!cg && l % 2) l++;
            s1 = cg ? l * l + b * b : b * b + l * l / 4; s2 = cg ? s1 + h * h / 4 : s1 + h * h; d = Math.sqrt(s2); } while (grens(d, 1));
          var ex = Math.abs(d - Math.round(d)) < 1e-9, bl = fBalkM(l, b, h, cg, { l:l + ' cm', b:b + ' cm', h:h + ' cm' }), st;
          if (cg) st = [
            kstap(R, 'Welk punt ligt recht onder M?', 'C', ['B', 'D'], 'M ligt op de ribbe CG, recht boven C.'),
            St('In het grondvlak: AC² = AB² + BC² = ' + l + '² + ' + b + '² =', T(s1), (l * l) + ' + ' + (b * b) + '. Neem nog geen wortel.', null, { waarom:'Je hebt AC² nodig, niet AC. Zo rond je pas aan het eind af.' }),
            St('CM is de helft van CG: ' + h + ' : 2 =', metE(T(h / 2), 'cm'), 'M is het midden van CG.', F(T(h), 'Dat is de hele ribbe CG. Neem de helft.'), { e:'cm' }),
            St('Driehoek ACM heeft de rechte hoek bij C. AM² = AC² + CM² = ' + T(s1) + ' + ' + T(h / 2) + '² =', T(s2), T(s1) + ' + ' + T(h * h / 4) + '.', Fz([T(s2)], F(T(s1 + h / 2), 'Ook CM moet in het kwadraat.'))),
            St('AM = √' + T(s2) + (ex ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(d, 1, 'cm'), 'Wortelknop: √' + T(s2) + ' = ' + T(d, { dec:4 }) + (ex ? '.' : '…'), F(T(s2), 'Je vergat de wortel.'), { e:'cm' }) ];
          else st = [
            kstap(R, 'Welk punt ligt recht onder M?', 'N, het midden van CD', ['C', 'D'], 'M ligt midden op GH. Recht daaronder ligt het midden van CD.'),
            St('DN is de helft van CD: ' + l + ' : 2 =', metE(T(l / 2), 'cm'), 'CD is even lang als AB. N ligt in het midden.', F(T(l), 'Dat is heel CD. Neem de helft.'), { e:'cm' }),
            St('In het grondvlak, driehoek ADN: AN² = AD² + DN² = ' + b + '² + ' + T(l / 2) + '² =', T(s1), (b * b) + ' + ' + T(l * l / 4) + '. AD is even lang als BC. Neem nog geen wortel.', null, { waarom:'Je hebt AN² nodig, niet AN.' }),
            St('Driehoek ANM heeft de rechte hoek bij N. AM² = AN² + NM² = ' + T(s1) + ' + ' + h + '² =', T(s2), 'NM is zo hoog als de balk: ' + h + '. ' + T(s1) + ' + ' + (h * h) + '.', Fz([T(s2)], F(T(s1 + h), 'Ook NM moet in het kwadraat.'))),
            St('AM = √' + T(s2) + (ex ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(d, 1, 'cm'), 'Wortelknop: √' + T(s2) + ' = ' + T(d, { dec:4 }) + (ex ? '.' : '…'), F(T(s2), 'Je vergat de wortel.'), { e:'cm' }) ];
          return { vraag:'Hoe lang is AM?', context:'Balk ABCD.EFGH heeft AB = ' + l + ' cm, BC = ' + b + ' cm en AE = ' + h + ' cm. M is het midden van ribbe ' + (cg ? 'CG' : 'GH') + '. Bereken AM. Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-rp-pir-hoogte', naam:'De hoogte van een piramide', kort:'Reken eerst AM uit in het grondvlak; dan TM² = TA² − AM²',
        uit:'<p>De top T van een piramide staat recht boven M, het <b>midden van het grondvlak</b>. TM is de hoogte.</p><p>Stap 1: reken in het grondvlak de diagonaal AC uit met Pythagoras. <b>AM is de helft</b> van AC.</p><p>Stap 2: in driehoek TAM zit de rechte hoek bij M. De opstaande ribbe TA is de schuine zijde. Dus <b>TM² = TA² − AM²</b>.</p>',
        wanneer:'je de hoogte van een piramide zoekt en alleen de ribben weet.',
        maak:function(R){
          var g, s, h, hs;
          do { g = pirGrond(R); s = R.heel(Math.ceil(g.AMx) + 2, Math.ceil(g.AMx) + 14); h = Math.sqrt(s * s - g.AMx * g.AMx); hs = Math.sqrt(s * s - g.AMs * g.AMs); } while (grens(h, 1) || !eens(h, hs, 1));
          var bl = fPir(g.l, g.b, h, { maten:[[0, 1, g.l + ' cm'], [1, 2, g.b + ' cm'], [0, 4, s + ' cm']], lijnen:[[0, 2, 3, true], [5, 4, 1, true]], teksten:[{ p:[g.l / 2, Math.min(h, 1.3 * Math.max(g.l, g.b)) / 2, g.b / 2], t:'?', dx:12, a:'start' }] });
          var st = [kstap(R, 'Waar zit de rechte hoek in driehoek TAM?', 'bij M', ['bij A', 'bij T'], 'TM staat recht omhoog vanuit het midden van het grondvlak.')].concat(pirStappen(R, g));
          st.push(St('TM = √(' + s + '² ' + MIN + ' ' + T(g.AMs) + '²) ≈ (rond af op 1 decimaal)', af(h, 1, 'cm'), 'Je zoekt een rechthoekszijde: aftrekken. ' + (s * s) + ' ' + MIN + ' ' + T(rnd(g.AMs * g.AMs, 6)) + ', en dan de wortel: ' + T(hs, { dec:4 }) + '…', Fz(af(h, 1, 'cm'), F(r1(Math.sqrt(s * s + g.AMs * g.AMs)), 'TA is de schuine zijde: aftrekken, niet optellen.')), { e:'cm' }));
          return { vraag:'Hoe hoog is de piramide?', context:'Piramide T.ABCD heeft een ' + (g.sq ? 'vierkant grondvlak met zijden van ' + g.l + ' cm' : 'rechthoekig grondvlak met AB = ' + g.l + ' cm en BC = ' + g.b + ' cm') + '. De opstaande ribben zijn ' + s + ' cm. Bereken de hoogte TM. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-rp-pir-ribbe', naam:'De opstaande ribbe van een piramide', kort:'Reken eerst AM uit in het grondvlak; dan TA² = TM² + AM²',
        uit:'<p>Andersom: je weet hoe hoog de piramide is en zoekt de <b>opstaande ribbe</b> TA.</p><p>Reken weer eerst in het grondvlak: de diagonaal AC, en <b>AM is de helft</b>.</p><p>In driehoek TAM zit de rechte hoek bij M. TA is nu de schuine zijde die je zoekt, dus je telt op: <b>TA² = TM² + AM²</b>.</p>',
        wanneer:'je weet hoe hoog een piramide is en de lengte van een schuine ribbe zoekt.',
        maak:function(R){
          var g, h, s, ss;
          do { g = pirGrond(R); h = R.heel(4, 16); s = Math.sqrt(h * h + g.AMx * g.AMx); ss = Math.sqrt(h * h + g.AMs * g.AMs); } while (grens(s, 1) || !eens(s, ss, 1));
          var bl = fPir(g.l, g.b, h, { maten:[[0, 1, g.l + ' cm'], [1, 2, g.b + ' cm'], [0, 4, '?']], lijnen:[[0, 2, 3, true], [5, 4, 3, true], [0, 4, 1]], teksten:[{ p:[g.l / 2, Math.min(h, 1.3 * Math.max(g.l, g.b)) / 2, g.b / 2], t:h + ' cm', dx:12, a:'start', k:K[3] }] });
          var st = [kstap(R, 'Waar zit de rechte hoek in driehoek TAM?', 'bij M', ['bij A', 'bij T'], 'TM staat recht omhoog vanuit het midden van het grondvlak.')].concat(pirStappen(R, g));
          st.push(St('TA = √(' + h + '² + ' + T(g.AMs) + '²) ≈ (rond af op 1 decimaal)', af(s, 1, 'cm'), 'TA is de schuine zijde: optellen. ' + (h * h) + ' + ' + T(rnd(g.AMs * g.AMs, 6)) + ', en dan de wortel: ' + T(ss, { dec:4 }) + '…', Fz(af(s, 1, 'cm').concat(['0']), F(r1(Math.sqrt(Math.abs(h * h - g.AMs * g.AMs))), 'Je zoekt de schuine zijde: optellen, niet aftrekken.')), { e:'cm' }));
          return { vraag:'Hoe lang is TA?', context:'Piramide T.ABCD heeft een ' + (g.sq ? 'vierkant grondvlak met zijden van ' + g.l + ' cm' : 'rechthoekig grondvlak met AB = ' + g.l + ' cm en BC = ' + g.b + ' cm') + ' en is ' + h + ' cm hoog. Bereken de opstaande ribbe TA. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-rp-pir-zijvlak', naam:'De hoogte van een zijvlak', kort:'MN is de helft van de zijde; de hoogte van het zijvlak is TN, met TN² = TM² + MN²',
        uit:'<p>De hoogte van het <b>zijvlak</b> TBC is het lijnstuk TN, met N het <b>midden van BC</b>. Die heb je nodig voor de oppervlakte van de piramide.</p><p>Van M naar N is de <b>helft van de zijde</b> van het grondvlak.</p><p>In driehoek TMN zit de rechte hoek bij M. Dus <b>TN² = TM² + MN²</b>. Grondvlak 8 bij 8, hoogte 3: MN = 4, TN² = 9 + 16 = 25, TN = <b>5</b>.</p>',
        wanneer:'je de schuine hoogte van een zijvlak van een piramide nodig hebt.',
        maak:function(R){
          var a, h, s2, d;
          do { a = R.heel(4, 16); h = R.heel(3, 15); s2 = h * h + a * a / 4; d = Math.sqrt(s2); } while (grens(d, 1));
          var ex = Math.abs(d - Math.round(d)) < 1e-9;
          var bl = fPir(a, a, h, { N:true, maten:[[0, 1, a + ' cm']], lijnen:[[5, 6, 3, true], [5, 4, 3, true], [6, 4, 1]], teksten:[{ p:[a / 2, Math.min(h, 1.3 * a) / 2, a / 2], t:h + ' cm', dx:-12, a:'end', k:K[3] }, { p:[a * 0.75, Math.min(h, 1.3 * a) / 2, a / 2], t:'?', dx:14, a:'start' }] });
          return { vraag:'Hoe lang is TN?', context:'Piramide T.ABCD heeft een vierkant grondvlak van ' + a + ' bij ' + a + ' cm en is ' + h + ' cm hoog. N is het midden van BC. Bereken TN, de hoogte van zijvlak TBC. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            St('MN is de helft van de zijde: ' + a + ' : 2 =', metE(T(a / 2), 'cm'), 'M ligt in het midden. Van M naar het midden van BC is de helft van de zijde.', F(T(a), 'Dat is de hele zijde. Neem de helft.'), { e:'cm' }),
            kstap(R, 'Waar zit de rechte hoek in driehoek TMN?', 'bij M', ['bij N', 'bij T'], 'TM staat recht omhoog op het grondvlak.'),
            St('TN² = TM² + MN² = ' + h + '² + ' + T(a / 2) + '² =', T(s2), (h * h) + ' + ' + T(a * a / 4) + '.', Fz([T(s2)], F(T(h * h + a * a), 'Gebruik MN = ' + T(a / 2) + ', niet de hele zijde.'))),
            St('TN = √' + T(s2) + (ex ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(d, 1, 'cm'), 'Wortelknop: √' + T(s2) + ' = ' + T(d, { dec:4 }) + (ex ? '.' : '…'), F(T(s2), 'Je vergat de wortel.'), { e:'cm' }) ] };
        } }
    ] });

  /* ================= hellingen ================= */
  function hellingGetallen(R, km){
    var p, a, h;
    do { p = R.kies([2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 12.5, 15, 20]); a = km ? R.kies([1200, 1500, 2000, 2400, 2500, 3000, 4000]) : R.kies([20, 40, 50, 80, 100, 120, 150, 200, 240, 300, 400, 500, 800]); h = rnd(p * a / 100, 6); } while (Math.abs(h * 10 - Math.round(h * 10)) > 1e-6 || h < 0.5);
    return { p:p, a:a, h:h, f:rnd(p / 100, 6) };
  }
  G.push({ groep:{ id:'wvm-m-helling', niveau:'vmbo', domein:'meetkunde', naam:'Hellingshoek en hellingspercentage',
      uit:'Hoe steil is een weg? Dat zeg je met het hellingspercentage of met de hellingshoek. Met de tangens reken je van het een naar het ander. Een helling is een rechthoekige driehoek.' },
    doelen:[
      { id:'wvm-m-hel-proc', naam:'Het hellingspercentage berekenen', kort:'Hellingspercentage = hoogteverschil : horizontale afstand × 100',
        uit:'<p>Een helling van <b>10%</b> betekent: per 100 m <b>horizontaal</b> ga je 10 m omhoog.</p><p>Reken: <b>hoogteverschil : horizontale afstand × 100</b>. Zorg dat beide in dezelfde eenheid staan.</p><p>Een weg stijgt 6 m over 80 m horizontaal: 6 : 80 = 0,075, en × 100 = <b>7,5%</b>.</p>',
        wanneer:'je wilt weten hoe steil een weg, oprit of helling is.',
        maak:function(R){
          var km = R.heel(0, 3) === 0, g = hellingGetallen(R, km), st = [], wat = R.kies(['Een weg', 'Een oprit', 'Een fietspad', 'Een helling']);
          var aTxt = km ? T(g.a / 1000) + ' km' : T(g.a) + ' m', bl = fHelling({ a:aTxt, h:T(g.h) + ' m', hoek:'' });
          if (km) st.push(St('Maak de eenheden gelijk: ' + T(g.a / 1000) + ' km =', metE(T(g.a), 'm'), '1 km = 1000 m.', null, { e:'m' }));
          st.push(St('Hoogteverschil : horizontale afstand = ' + T(g.h) + ' : ' + T(g.a) + ' =', T(g.f), 'Deel het hoogteverschil door de horizontale afstand.', Fz([T(g.f)], F(T(rnd(g.a / g.h, 2)), 'Andersom: het hoogteverschil gedeeld door de afstand.'))));
          st.push(St('Keer 100: ' + T(g.f) + ' ' + X + ' 100 =', metE(T(g.p), '%'), 'Een kommagetal keer 100 geeft het percentage.', null, { e:'%' }));
          return { vraag:'Hellingspercentage?', context:wat + ' stijgt ' + T(g.h) + ' m over een horizontale afstand van ' + aTxt + '. Bereken het hellingspercentage. De figuur is niet op schaal.', eenheid:'%', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wvm-m-hel-hoogte', naam:'Hoogteverschil of afstand uit het percentage', kort:'Maak van het percentage een kommagetal: hoogteverschil = kommagetal × afstand, afstand = hoogteverschil : kommagetal',
        uit:'<p>Een hellingspercentage van 8% betekent: het hoogteverschil is <b>0,08 keer</b> de horizontale afstand.</p><p>Zoek je het <b>hoogteverschil</b>? Doe 0,08 × afstand. Over 250 m: 0,08 × 250 = <b>20 m</b>.</p><p>Zoek je de <b>horizontale afstand</b>? Reken terug: hoogteverschil : 0,08. Een stijging van 20 m: 20 : 0,08 = <b>250 m</b>.</p>',
        wanneer:'je het hellingspercentage weet en een hoogte of afstand zoekt.',
        maak:function(R){
          var zoekH = R.heel(0, 1) === 1, g = hellingGetallen(R, false), goed = zoekH ? T(g.f) + ' ' + X + ' ' + T(g.a) : T(g.h) + ' : ' + T(g.f), fout = zoekH ? T(g.a) + ' : ' + T(g.f) : T(g.h) + ' ' + X + ' ' + T(g.f);
          var bl = fHelling({ a:zoekH ? T(g.a) + ' m' : '?', h:zoekH ? '?' : T(g.h) + ' m', s:T(g.p) + '%' });
          return { vraag:zoekH ? 'Hoogteverschil?' : 'Horizontale afstand?', context:zoekH ? 'Een weg heeft een hellingspercentage van ' + T(g.p) + '%. De horizontale afstand is ' + T(g.a) + ' m. Hoeveel meter stijgt de weg?' : 'Een weg met een hellingspercentage van ' + T(g.p) + '% stijgt ' + T(g.h) + ' m. Hoe groot is de horizontale afstand?', eenheid:'m', beeld:bl, zelfBeeld:bl, stappen:[
            St('Het percentage als kommagetal: ' + T(g.p) + ' : 100 =', T(g.f), 'Procent betekent per honderd: deel door 100.', null),
            kstap(R, 'Hoe reken je ' + (zoekH ? 'het hoogteverschil' : 'de horizontale afstand') + ' uit?', goed, [fout], zoekH ? 'Per meter horizontaal stijg je ' + T(g.f) + ' m. Dus keer de afstand.' : 'Het hoogteverschil is ' + T(g.f) + ' keer de afstand. Terugrekenen is delen.'),
            St(goed + ' =', metE(T(zoekH ? g.h : g.a), 'm'), zoekH ? 'Reken ' + goed + ' uit.' : 'Reken ' + goed + ' uit.', null, { e:'m' }) ] };
        } },
      { id:'wvm-m-hel-hoek', naam:'Van hellingspercentage naar hellingshoek', kort:'tan(hoek) = percentage : 100; de hoek is tan⁻¹ daarvan',
        uit:'<p>In de hellingsdriehoek is de <b>tangens</b> van de hellingshoek: hoogteverschil : horizontale afstand. Dat is precies het percentage gedeeld door 100.</p><p>Dus <b>tan(hoek) = percentage : 100</b>. Een helling van 12%: tan(hoek) = 0,12.</p><p>De hoek vind je met <b>tan⁻¹</b>: tan⁻¹(0,12) ≈ <b>6,8°</b>. Let op: 100% is een hoek van 45°, niet 90°.</p>',
        wanneer:'je wilt weten hoeveel graden een helling met een bepaald percentage is.',
        maak:function(R){
          var p, hk;
          do { p = R.heel(2, 80) / 2; hk = Math.atan(p / 100) / RAD; } while (grens(hk, 1));
          var f = rnd(p / 100, 6), bl = fHelling({ a:'100 m', h:T(p) + ' m', hoek:'?' });
          return { vraag:'Hellingshoek?', context:'Een weg heeft een hellingspercentage van ' + T(p) + '%. Hoe groot is de hellingshoek? Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            St('tan(hoek) = ' + T(p) + ' : 100 =', T(f), 'Op 100 m horizontaal stijg je ' + T(p) + ' m. Tangens = overstaand : aanliggend = ' + T(p) + ' : 100.', Fz([T(f)], F(T(p), 'Deel nog door 100.'))),
            kstap(R, 'Wat tik je in voor de hoek?', 'tan⁻¹(' + T(f) + ')', ['tan(' + T(f) + ')', 'tan⁻¹(' + T(p) + ')'], 'Van een verhouding naar een hoek gebruik je tan⁻¹ (vaak Shift tan).'),
            St('De hellingshoek ≈ (rond af op 1 decimaal)', af(hk, 1, '°', ['graden']), 'Tik in: tan⁻¹(' + T(f) + ') = ' + T(hk, { dec:4 }) + '…', Fz(af(hk, 1, '°'), F(r1(Math.atan(p) / RAD), 'Je vulde ' + T(p) + ' in. Deel eerst door 100.')), { e:'°' }) ] };
        } },
      { id:'wvm-m-hel-perc', naam:'Van hellingshoek naar hellingspercentage', kort:'Hellingspercentage = tan(hoek) × 100',
        uit:'<p>Andersom: je weet de <b>hellingshoek</b> en zoekt het percentage.</p><p>Reken de <b>tangens</b> van de hoek uit. Dat is hoogteverschil : horizontale afstand. Doe dan <b>keer 100</b>.</p><p>Hoek van 5°: tan(5°) ≈ 0,0875, en × 100 ≈ <b>8,7%</b>.</p>',
        wanneer:'je de hoek van een helling weet en wilt weten hoeveel procent dat is.',
        maak:function(R){
          var hk, tn, p;
          do { hk = R.heel(2, 70) / 2; tn = Math.tan(hk * RAD); p = tn * 100; } while (grens(p, 1) || grens(tn, 4) || !eens(rnd(tn, 4) * 100, p, 1));
          var bl = fHelling({ a:'100 m', h:'?', hoek:T(hk) + '°' });
          return { vraag:'Hellingspercentage?', context:'Een helling heeft een hellingshoek van ' + T(hk) + '°. Hoe groot is het hellingspercentage? Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'%', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Wat tik je in?', 'tan(' + T(hk) + '°)', ['tan⁻¹(' + T(hk) + ')', 'sin(' + T(hk) + '°)'], 'Je weet de hoek en zoekt hoogteverschil : afstand. Dat is de tangens.'),
            St('tan(' + T(hk) + '°) ≈ (rond af op 4 decimalen)', af(tn, 4), 'Tik in: tan(' + T(hk) + ') = ' + T(tn, { dec:6 }) + '…', null),
            St('Hellingspercentage = ' + T(rnd(tn, 4)) + ' ' + X + ' 100 ≈ (rond af op 1 decimaal)', af(p, 1, '%'), 'Keer 100 geeft het percentage.', Fz(af(p, 1, '%'), F(T(rnd(tn, 4)), 'Doe nog keer 100.')), { e:'%' }) ] };
        } },
      { id:'wvm-m-hel-weg', naam:'Als je de lengte van de weg weet', kort:'De weg is de schuine zijde: reken eerst de horizontale afstand uit met Pythagoras',
        uit:'<p>Let op: een hellingspercentage reken je met de <b>horizontale afstand</b>, niet met de lengte van de weg zelf.</p><p>De weg loopt schuin: hij is de <b>schuine zijde</b> van de hellingsdriehoek. Reken de horizontale afstand uit met Pythagoras: √(weg² − hoogteverschil²).</p><p>Daarna gewoon: hoogteverschil : horizontale afstand × 100.</p>',
        wanneer:'je weet hoe lang een weg is en hoeveel hij stijgt.',
        maak:function(R){
          var L, h, a, ar, p;
          do { L = R.heel(4, 40) * 25; h = R.heel(Math.ceil(L * 0.08), Math.floor(L * 0.28)); a = Math.sqrt(L * L - h * h); ar = rnd(a, 1); p = h / a * 100; } while (grens(a, 1) || grens(p, 1) || !eens(h / ar * 100, p, 1));
          var bl = fHelling({ a:'?', h:h + ' m', s:L + ' m' });
          return { vraag:'Hellingspercentage?', context:'Een weg is ' + L + ' m lang en stijgt ' + h + ' m. Bereken het hellingspercentage. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'%', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'De weg is ' + L + ' m lang. Is dat de horizontale afstand?', 'nee: de weg is de schuine zijde', ['ja: dat is hetzelfde'], 'De weg loopt schuin omhoog. De horizontale afstand is de zijde onderaan.'),
            St('Horizontale afstand = √(' + L + '² ' + MIN + ' ' + h + '²) ≈ (rond af op 1 decimaal)', af(a, 1, 'm'), 'Je zoekt een rechthoekszijde: aftrekken. ' + (L * L) + ' ' + MIN + ' ' + (h * h) + ' = ' + (L * L - h * h) + '.', Fz(af(a, 1, 'm'), F(r1(Math.sqrt(L * L + h * h)), 'Aftrekken: de weg is de langste zijde.')), { e:'m' }),
            St('Hellingspercentage = ' + h + ' : ' + T(ar) + ' ' + X + ' 100 ≈ (rond af op 1 decimaal)', af(p, 1, '%'), 'Hoogteverschil gedeeld door de horizontale afstand, keer 100.', Fz(af(p, 1, '%'), F(r1(h / L * 100), 'Je deelde door de lengte van de weg. Deel door de horizontale afstand.')), { e:'%' }) ] };
        } }
    ] });

  /* ================= goniometrie in toepassingen ================= */
  G.push({ groep:{ id:'wvm-m-gon', niveau:'vmbo', domein:'meetkunde', naam:'Goniometrie in toepassingen',
      uit:'Sinus, cosinus en tangens in echte situaties en in twee stappen: met je ooghoogte erbij, twee afstanden van elkaar af, twee driehoeken met een gedeelde zijde, en een hoek in een gelijkbenige driehoek. SOS CAS TOA zelf staat bij Sinus, cosinus en tangens.' },
    doelen:[
      { id:'wvm-m-gon-oog', naam:'Een hoogte met de ooghoogte erbij', kort:'Reken het stuk boven je ogen uit met tan, en tel je ooghoogte erbij op',
        uit:'<p>Je kijkt vanaf een afstand omhoog naar de top van een toren. Je ogen zitten niet op de grond, maar op <b>ooghoogte</b>.</p><p>De rechthoekige driehoek begint dus bij je ogen. De afstand ligt aan de hoek, het stuk toren erboven ligt er tegenover: <b>tangens</b>. Stuk = afstand × tan(hoek).</p><p>Tel daarna je <b>ooghoogte</b> erbij op. Dat vergeten veel leerlingen.</p>',
        wanneer:'je de hoogte van een gebouw of boom wilt bepalen met een hoek.',
        maak:function(R){
          var obj = R.kies(['de toren', 'de boom', 'de flat', 'de vlaggenmast']), a, al, e, x, H;
          do { a = R.heel(8, 60); al = R.heel(20, 60); e = R.kies([1.5, 1.6, 1.7, 1.8]); x = a * Math.tan(al * RAD); H = x + e; } while (grens(x, 1) || grens(H, 1) || !eens(rnd(x, 1) + e, H, 1));
          var bl = fOog(al, { oog:'ooghoogte ' + T(e) + ' m', afst:a + ' m' });
          return { vraag:'Hoe hoog is ' + obj + '?', context:'Je staat ' + a + ' m van ' + obj + '. Je kijkt naar de top onder een hoek van ' + al + '° met de horizontale lijn. Je ogen zijn ' + T(e) + ' m boven de grond. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'m', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'In de driehoek bij je oog ken je de afstand en zoek je het stuk erboven. Welke verhouding?', TAN, [], 'De afstand ligt aan de hoek (aanliggend), het stuk erboven ligt tegenover de hoek (overstaand).', { orde:VL }),
            St('Het stuk boven je ooghoogte: ' + a + ' ' + X + ' tan(' + al + '°) ≈ (rond af op 1 decimaal)', af(x, 1, 'm'), 'tan(' + al + '°) = stuk : ' + a + '. Het stuk staat boven de deelstreep: vermenigvuldig. ' + T(x, { dec:4 }) + '…', Fz(af(x, 1, 'm'), F(r1(a / Math.tan(al * RAD)), 'Je deelde. Het stuk staat boven de deelstreep: vermenigvuldig.')), { e:'m' }),
            St('Hoogte = ' + r1(x) + ' + ' + T(e) + ' ≈', af(H, 1, 'm'), 'Tel je ooghoogte erbij op: de driehoek begint bij je ogen.', Fz(af(H, 1, 'm'), F(r1(x), 'Je vergat je ooghoogte erbij te tellen.')), { e:'m' }) ] };
        } },
      { id:'wvm-m-gon-boot', naam:'Het verschil van twee afstanden', kort:'Reken met tan de afstand tot elk punt uit, en trek ze van elkaar af',
        uit:'<p>Vanaf een vuurtoren zie je twee boten achter elkaar. Bij elke boot maakt de lijn naar de top een andere hoek met het water.</p><p>Bij elke boot is er een rechthoekige driehoek: de hoogte van de toren ligt <b>tegenover</b> de hoek, de afstand tot de toren ligt <b>aan</b> de hoek. Dus tangens: <b>afstand = hoogte : tan(hoek)</b>.</p><p>Reken beide afstanden uit en trek ze <b>van elkaar af</b>.</p>',
        wanneer:'je de afstand tussen twee punten zoekt die je vanaf één hoog punt ziet.',
        maak:function(R){
          var h, be, al, d1, d2, df;
          do { h = R.heel(20, 60); be = R.heel(30, 60); al = R.heel(12, Math.min(be - 8, 40)); d1 = h / Math.tan(be * RAD); d2 = h / Math.tan(al * RAD); df = d2 - d1; } while (d1 / d2 > 0.55 || grens(d1, 1) || grens(d2, 1) || grens(df, 1) || !eens(rnd(d2, 1) - rnd(d1, 1), df, 1));
          var bl = fBoot(h, d1, d2, { h:h + ' m', be:be + '°', al:al + '°' });
          return { vraag:'Afstand tussen de boten?', context:'Een vuurtoren is ' + h + ' m hoog. Bij boot 1 maakt de lijn naar de top een hoek van ' + be + '° met het water, bij boot 2 een hoek van ' + al + '°. Hoe ver liggen de boten van elkaar? Rond af op 1 decimaal.', eenheid:'m', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Bij boot 1 ken je de hoogte en zoek je de afstand tot de toren. Welke verhouding?', TAN, [], 'De hoogte ligt tegenover de hoek bij de boot, de afstand ligt eraan.', { orde:VL }),
            St('Afstand tot boot 1: ' + h + ' : tan(' + be + '°) ≈ (rond af op 1 decimaal)', af(d1, 1, 'm'), 'tan(' + be + '°) = ' + h + ' : afstand. De afstand staat onder de deelstreep: delen. ' + T(d1, { dec:4 }) + '…', Fz(af(d1, 1, 'm'), F(r1(h * Math.tan(be * RAD)), 'Je vermenigvuldigde. De afstand staat onder de deelstreep: delen.')), { e:'m' }),
            St('Afstand tot boot 2: ' + h + ' : tan(' + al + '°) ≈ (rond af op 1 decimaal)', af(d2, 1, 'm'), 'Hetzelfde, met de hoek van boot 2: ' + T(d2, { dec:4 }) + '…', Fz(af(d2, 1, 'm'), F(r1(h * Math.tan(al * RAD)), 'Je vermenigvuldigde. Delen.')), { e:'m' }),
            St('Afstand tussen de boten: ' + r1(d2) + ' ' + MIN + ' ' + r1(d1) + ' ≈', af(df, 1, 'm'), 'De verste afstand min de dichtste.', Fz(af(df, 1, 'm'), F(r1(d1 + d2), 'De boten liggen aan dezelfde kant: aftrekken.')), { e:'m' }) ] };
        } },
      { id:'wvm-m-gon-drieh', naam:'Twee driehoeken met een gedeelde zijde', kort:'Reken in de eerste driehoek de gedeelde zijde uit, en gebruik die in de tweede driehoek',
        uit:'<p>De hoogte CD verdeelt driehoek ABC in <b>twee rechthoekige driehoeken</b>: ADC en BDC. Ze delen de zijde <b>CD</b>.</p><p>Stap 1: reken in driehoek ADC de zijde CD uit met de hoek bij A. Rond tussendoor af op 2 decimalen.</p><p>Stap 2: gebruik CD in driehoek BDC, met de hoek bij B. Kies daar opnieuw de goede verhouding met SOS CAS TOA.</p>',
        wanneer:'je in één driehoek niet genoeg weet, maar in de driehoek ernaast wel.',
        maak:function(R){
          var c, al, be, zoekBC, CD, CD2, ans, ans2;
          do { c = R.heel(6, 20); al = R.heel(25, 65); be = R.heel(25, 70); zoekBC = R.heel(0, 1) === 1; CD = c * Math.sin(al * RAD); CD2 = rnd(CD, 2);
            ans = zoekBC ? CD / Math.sin(be * RAD) : CD / Math.tan(be * RAD); ans2 = zoekBC ? CD2 / Math.sin(be * RAD) : CD2 / Math.tan(be * RAD); } while (grens(CD, 2) || grens(ans, 1) || !eens(ans, ans2, 1));
          var xd = c * Math.cos(al * RAD), xb = xd + CD / Math.tan(be * RAD), zoek = zoekBC ? 'BC' : 'DB', fn = zoekBC ? 'sin' : 'tan';
          var bl = tekenFig([[0, 0], [xb, 0], [xd, CD]], { zijde:['', zoekBC ? '?' : '', c + ' cm'], hoek:[al + '°', be + '°', ''], namen:['A', 'B', 'C'], markeer:false, W:400, H:250, aria:'driehoek ABC met de hoogte CD',
            na:function(P, f){ var D = f([xd, 0]), s = ln(P[2][0], P[2][1], D[0], D[1], { k:K[3], w:2.5, stip:'7 5' }) + hoekje(D[0], D[1], 0, 90, { k:'var(--ink)' }) + tx(D[0], D[1] + 22, 'D', { vet:true, fs:16 });
              if (!zoekBC) s += tx((D[0] + P[1][0]) / 2, D[1] + 22, '?', { vet:true, k:K[1], fs:16 }); return s; } });
          return { vraag:zoek + ' = ?', context:'In driehoek ABC staat CD loodrecht op AB. AC = ' + c + ' cm, hoek A = ' + al + '° en hoek B = ' + be + '°. Bereken ' + zoek + '. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'In driehoek ADC ken je AC en hoek A, en zoek je CD. Welke verhouding?', SIN, [], 'CD ligt tegenover hoek A en AC is de schuine zijde: overstaand en schuin.', { orde:VL }),
            St('CD = ' + c + ' ' + X + ' sin(' + al + '°) ≈ (rond af op 2 decimalen)', af(CD, 2, 'cm'), 'sin(' + al + '°) = CD : ' + c + '. CD staat boven de deelstreep: vermenigvuldig. ' + T(CD, { dec:4 }) + '…', Fz(af(CD, 2, 'cm'), F(r2(c / Math.sin(al * RAD)), 'Je deelde. CD staat boven de deelstreep: vermenigvuldig.')), { e:'cm' }),
            kstap(R, 'In driehoek BDC ken je CD en hoek B, en zoek je ' + zoek + '. Welke verhouding?', zoekBC ? SIN : TAN, [], zoekBC ? 'CD ligt tegenover hoek B en BC is de schuine zijde: sinus.' : 'CD ligt tegenover hoek B en DB ligt aan hoek B: tangens.', { orde:VL }),
            St(zoek + ' = ' + T(CD2) + ' : ' + fn + '(' + be + '°) ≈ (rond af op 1 decimaal)', af(ans, 1, 'cm'), fn + '(' + be + '°) = ' + T(CD2) + ' : ' + zoek + '. ' + zoek + ' staat onder de deelstreep: delen. ' + T(ans2, { dec:4 }) + '…', Fz(af(ans, 1, 'cm'), F(r1(CD2 * (zoekBC ? Math.sin(be * RAD) : Math.tan(be * RAD))), 'Je vermenigvuldigde. ' + zoek + ' staat onder de deelstreep: delen.')), { e:'cm' }) ] };
        } },
      { id:'wvm-m-gon-gelijkbenig', naam:'Een hoek in een gelijkbenige driehoek', kort:'Trek de hoogte: dan krijg je een rechthoekige driehoek met de halve basis en het been',
        uit:'<p>Een gelijkbenige driehoek heeft geen rechte hoek. Trek daarom de <b>hoogte</b> vanuit de top: die deelt de basis en de tophoek <b>doormidden</b>.</p><p>In de halve driehoek ken je de <b>halve basis</b> en het <b>been</b> (de schuine zijde).</p><p>Voor de <b>basishoek</b> ligt de halve basis eraan: cosinus. Voor de <b>halve tophoek</b> ligt de halve basis ertegenover: sinus. De hele tophoek is twee keer zo groot.</p>',
        wanneer:'je een hoek zoekt in een driehoek met twee gelijke zijden.',
        maak:function(R){
          var top = R.heel(0, 1) === 1, b, c, half, hb, ht;
          do { b = R.heel(3, 12) * 2; c = R.heel(b / 2 + 1, b / 2 + 12); half = b / 2; hb = Math.acos(half / c) / RAD; ht = Math.asin(half / c) / RAD; }
          while (top ? (grens(ht, 2) || grens(2 * ht, 1) || !eens(2 * rnd(ht, 2), 2 * ht, 1)) : grens(hb, 1));
          var H = Math.sqrt(c * c - half * half), naamH = top ? 'tophoek' : 'basishoek';
          var bl = tekenFig([[0, 0], [b, 0], [half, H]], { zijde:[b + ' cm', c + ' cm', c + ' cm'], hoek:top ? ['', '', '?'] : ['?', '', ''], markeer:false, W:360, H:260, aria:'gelijkbenige driehoek met de hoogte gestippeld',
            na:function(P){ var M = [(P[0][0] + P[1][0]) / 2, P[0][1]]; return ln(P[2][0], P[2][1], M[0], M[1], { k:K[3], w:2.5, stip:'7 5' }) + hoekje(M[0], M[1], 0, 90, { k:'var(--ink)' }); } });
          var st = [St('De hoogte deelt de basis doormidden. De halve basis: ' + b + ' : 2 =', metE(T(half), 'cm'), 'De hoogte komt precies in het midden van de basis.', null, { e:'cm' })];
          if (!top){
            st.push(kstap(R, 'In de halve driehoek: welke verhouding hoort bij de basishoek?', COS, [], 'Vanuit de basishoek ligt de halve basis eraan (aanliggend). Het been is de schuine zijde.', { orde:VL }));
            st.push(St('Basishoek = cos⁻¹(' + T(half) + ' : ' + c + ') ≈ (rond af op 1 decimaal)', af(hb, 1, '°', ['graden']), 'Tik in: cos⁻¹(' + T(half) + ' : ' + c + ') = ' + T(hb, { dec:4 }) + '…', Fz(af(hb, 1, '°'), F(r1(ht), 'Dat is de halve tophoek. Vanuit de basishoek ligt de halve basis eraan: cosinus.')), { e:'°' }));
          } else {
            st.push(kstap(R, 'In de halve driehoek: welke verhouding hoort bij de halve tophoek?', SIN, [], 'Vanuit de top ligt de halve basis tegenover de hoek (overstaand). Het been is de schuine zijde.', { orde:VL }));
            st.push(St('Halve tophoek = sin⁻¹(' + T(half) + ' : ' + c + ') ≈ (rond af op 2 decimalen)', af(ht, 2, '°', ['graden']), 'Tik in: sin⁻¹(' + T(half) + ' : ' + c + ') = ' + T(ht, { dec:4 }) + '…', Fz(af(ht, 2, '°'), F(r2(hb), 'Dat is de basishoek. Vanuit de top ligt de halve basis tegenover de hoek: sinus.')), { e:'°' }));
            st.push(St('Tophoek = 2 ' + X + ' ' + r2(ht) + ' ≈ (rond af op 1 decimaal)', af(2 * ht, 1, '°', ['graden']), 'De hoogte deelt de tophoek in twee gelijke stukken: keer 2.', Fz(af(2 * ht, 1, '°'), F(r1(ht), 'Dat is de halve tophoek. Keer 2.')), { e:'°' }));
          }
          return { vraag:'De ' + naamH + ' = ?', context:'Een gelijkbenige driehoek heeft een basis van ' + b + ' cm en twee benen van ' + c + ' cm. Bereken de ' + naamH + '. Rond af op 1 decimaal. De figuur is niet op schaal.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  LEERROUTE.voeg('wiskunde', G);
})();
