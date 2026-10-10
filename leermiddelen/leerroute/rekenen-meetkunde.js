/* De leerroute rekenen: meetkunde en meetinstrumenten. Meetinstrumenten aflezen,
   hoeken (soorten, meten, berekenen), vlakke figuren en symmetrie, verschuiven,
   draaien en vergroten, ruimtefiguren (aanzichten, uitslagen, kijklijnen) en de
   stelling van Pythagoras. Elke manier een eigen doel. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, S = R0.schoon;
  var K = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var RAD = Math.PI / 180;

  /* ---------- hulpjes ---------- */
  function r1(x){ return Math.round(x * 10) / 10; }
  function r2(x){ return Math.round(x * 100) / 100; }
  function r6(x){ return Math.round(x * 1e6) / 1e6; }
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
  function gr(x){ return metE(T(x), '°', ['graden']); }
  /* afgerond op 1 decimaal, 2 decimalen mag ook */
  function rond(x, e){ x = r6(x); if (Math.abs(x - Math.round(x)) < 1e-9) return metE(T(Math.round(x)), e); return uniek(metE(T(r1(x), { dec:1, vast:true }), e).concat(metE(T(r1(x)), e), metE(T(r2(x)), e))); }
  function kz(R, goed, fout){ var l = [goed]; fout.forEach(function(f){ if (l.indexOf(f) < 0) l.push(f); }); l = R.hussel(l); return { opties:l, goed:l.indexOf(goed) }; }
  function kstap(R, tekst, goed, fout, hint, waarom){ var k = kz(R, goed, fout), s = { tekst:tekst, opties:k.opties, goed:k.goed, hint:hint }; if (waarom) s.waarom = waarom; return s; }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  function puntC(x, y){
    return function(v){
      var s = String(v).replace(/[\s()]/g, '').replace(/[−–—]/g, '-'), d = s.split(/[;,]/);
      if (d.length !== 2 || !/^-?\d+$/.test(d[0]) || !/^-?\d+$/.test(d[1])) return false;
      return +d[0] === x && +d[1] === y;
    };
  }
  function punt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  function norm360(a){ return ((a % 360) + 360) % 360; }

  /* ---------- tekenen ---------- */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + S(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {};
    var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600)];
    if (o.k) st.push('fill:' + o.k);
    if (o.op != null) st.push('opacity:' + o.op);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '"' + (o.mid ? ' dy=".35em"' : '') + ' style="' + st.join(';') + '">' + S(t) + '</text>';
  }
  function stijl(o){
    return 'fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2) +
      (o.stip ? ';stroke-dasharray:' + (o.stip === true ? '6 5' : o.stip) : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round;stroke-linejoin:round';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="' + stijl({ s:o.k || 'var(--ink)', w:o.w || 2, stip:o.stip, op:o.op }) + '"/>'; }
  function pg(p, o){ return '<polygon points="' + p.map(function(q){ return n1(q[0]) + ',' + n1(q[1]); }).join(' ') + '" style="' + stijl(o || {}) + '"/>'; }
  function pad(d, o){ return '<path d="' + d + '" style="' + stijl(o || {}) + '"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' style="' + stijl(o) + '"/>'; }
  function cir(cx, cy, r, o){ return '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r) + '" style="' + stijl(o || {}) + '"/>'; }
  function ell(cx, cy, rx, ry, o){ return '<ellipse cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '" style="' + stijl(o || {}) + '"/>'; }
  function stip(x, y, kl, naam, o){ o = o || {}; return cir(x, y, o.r || 6, { f:kl, s:'none', w:0 }) + (naam ? tx(x + (o.dx != null ? o.dx : 11), y + (o.dy != null ? o.dy : -9), naam, { k:kl, vet:true, a:'start', fs:17 }) : ''); }
  /* een punt op een cirkel; hoek a in graden, tegen de klok in vanaf rechts (zoals in de wiskunde) */
  function pol(cx, cy, r, a){ return [cx + r * Math.cos(a * RAD), cy - r * Math.sin(a * RAD)]; }
  function rich(V, Q){ return Math.atan2(-(Q[1] - V[1]), Q[0] - V[0]) / RAD; }
  function boogPad(cx, cy, r, a1, a2){
    var p1 = pol(cx, cy, r, a1), p2 = pol(cx, cy, r, a2), groot = norm360(a2 - a1) > 180 ? 1 : 0;
    return 'M' + n1(p1[0]) + ' ' + n1(p1[1]) + ' A' + r + ' ' + r + ' 0 ' + groot + ' 0 ' + n1(p2[0]) + ' ' + n1(p2[1]);
  }
  /* een hoek met een boogje (of een vierkantje bij 90°), van a1 tegen de klok in naar a2 */
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
  /* wiskundige punten (y omhoog) passend maken voor het scherm */
  function pas(pts, W, H, m, extra){
    var alle = pts.concat(extra || []), x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    alle.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    var sc = Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * m) / ((y1 - y0) || 1)), ox = (W - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
    return { sc:sc, f:function(p){ return [ox + (p[0] - x0) * sc, H - oy - (p[1] - y0) * sc]; } };
  }
  function draai(p, a, c){ c = c || [0, 0]; var r = a * RAD, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(r) - y * Math.sin(r), c[1] + x * Math.sin(r) + y * Math.cos(r)]; }
  /* een veelhoek op het scherm (punten tegen de klok in) met hoeken, streepjes, namen en maten */
  function figuur(P, o){
    o = o || {};
    var n = P.length, s = '', i, cx = 0, cy = 0;
    P.forEach(function(p){ cx += p[0] / n; cy += p[1] / n; });
    s += pg(P, { f:o.vul || K[0], fo:o.fo != null ? o.fo : 0.1, w:2.5 });
    for (i = 0; i < n; i++){
      var V = P[i], N = P[(i + 1) % n], Q = P[(i + n - 1) % n], a1 = rich(V, N), d = norm360(rich(V, Q) - a1);
      var lab = o.hoek ? o.hoek[i] : null, recht = Math.abs(d - 90) < 0.5;
      if (lab != null && lab !== '') s += hoekje(V[0], V[1], a1, a1 + d, { t:lab, k:(o.kl && o.kl[i]) || K[0], r:d < 50 ? 36 : 26, lr:d < 50 ? 20 : 17 });
      else if (recht && o.markeer !== false) s += hoekje(V[0], V[1], a1, a1 + d, { k:'var(--ink)' });
    }
    (o.streep || []).forEach(function(z){
      var A = P[z[0]], B = P[(z[0] + 1) % n], L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], nv = [-u[1], u[0]], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      for (var j = 0; j < z[1]; j++){ var off = (j - (z[1] - 1) / 2) * 7, px = mx + u[0] * off, py = my + u[1] * off; s += ln(px - nv[0] * 8, py - nv[1] * 8, px + nv[0] * 8, py + nv[1] * 8, { w:2.5, k:K[1] }); }
    });
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
    var W = o.W || 380, H = o.H || 240, t = pas(pts, W, H, o.m || 42, o.extra), P = pts.map(t.f);
    return svg(W, H, figuur(P, o) + (o.na ? o.na(P, t.f) : ''), o.aria || 'figuur', o.max || W);
  }
  /* een rooster met assen van 0 tot n */
  function rooster(n, o){
    o = o || {};
    var c = o.c || 30, x0 = 34, y0 = 14, s = '', i;
    function X(x){ return x0 + x * c; }
    function Y(y){ return y0 + (n - y) * c; }
    for (i = 0; i <= n; i++) s += ln(X(i), Y(0), X(i), Y(n), { w:1, op:0.28 }) + ln(X(0), Y(i), X(n), Y(i), { w:1, op:0.28 });
    s += ln(X(0), Y(0), X(n) + 10, Y(0), { w:2 }) + ln(X(0), Y(0), X(0), Y(n) - 10, { w:2 });
    for (i = 0; i <= n; i++){ s += tx(X(i), Y(0) + 21, String(i), { fs:14 }); if (i) s += tx(X(0) - 9, Y(i) + 5, String(i), { fs:14, a:'end' }); }
    return { s:s, X:X, Y:Y, w:X(n) + 22, h:Y(0) + 30 };
  }

  var G = [];

  /* ================= meetinstrumenten aflezen (fundament) ================= */
  var SCHALEN = [[10, 5], [10, 2], [10, 10], [20, 4], [20, 10], [20, 5], [50, 5], [50, 2], [50, 10], [100, 4], [100, 5], [100, 10], [100, 2], [200, 4], [200, 10], [1, 10], [1, 4], [2, 4], [500, 5], [1000, 4], [1000, 5], [2, 10], [5, 10]];
  function lat(van, L, k, o){
    o = o || {};
    var N = 2 * k, x0 = 30, x1 = 370, Y = 112, dx = (x1 - x0) / N, s = '', i;
    if (o.stukjes) for (i = 0; i < k; i++){
      var a = x0 + i * dx, b = a + dx;
      s += pad('M' + n1(a + 2) + ' ' + (Y - 28) + ' Q' + n1((a + b) / 2) + ' ' + (Y - 46) + ' ' + n1(b - 2) + ' ' + (Y - 28), { s:K[3], w:2 });
      if (dx >= 16) s += tx((a + b) / 2, Y - 46, String(i + 1), { k:K[3], fs:14 });
    }
    s += ln(x0 - 12, Y, x1 + 12, Y, { w:2.5 });
    for (i = 0; i <= N; i++){ var x = x0 + i * dx, groot = i % k === 0; s += ln(x, Y, x, Y - (groot ? 24 : 13), { w:groot ? 2.5 : 1.6 }); if (groot) s += tx(x, Y + 26, T(r6(van + (i / k) * L)), { fs:16, vet:true }); }
    if (o.haak) s += pad('M' + x0 + ' ' + (Y - 58) + ' L' + x0 + ' ' + (Y - 68) + ' L' + n1(x0 + k * dx) + ' ' + (Y - 68) + ' L' + n1(x0 + k * dx) + ' ' + (Y - 58), { s:K[1], w:2.5 }) +
      tx(x0 + k * dx / 2, Y - 76, 'verschil ' + T(L), { k:K[1], vet:true });
    return svg(400, 150, s, 'schaalverdeling', 460);
  }
  /* een liniaal van 0 tot 6 cm met een strook van begin tot eind (in mm) */
  function liniaal(begin, eind, o){
    o = o || {};
    var mm = 6, x0 = 22, Y = 70, s = '', i;
    s += rc(x0 - 12, Y, 60 * mm + 24, 58, { f:'var(--kaart)', w:2, rx:4 });
    for (i = 0; i <= 60; i++){
      var x = x0 + i * mm, h = i % 10 === 0 ? 20 : i % 5 === 0 ? 14 : 8;
      s += ln(x, Y, x, Y + h, { w:i % 10 === 0 ? 2 : 1.1 });
      if (i % 10 === 0) s += tx(x, Y + 42, String(i / 10), { fs:15 });
    }
    s += tx(x0 + 60 * mm - 4, Y + 55, 'cm', { fs:13, a:'end' });
    s += rc(x0 + begin * mm, 24, (eind - begin) * mm, 30, { f:K[0], fo:0.45, s:K[0], w:2, rx:3 });
    if (o.b) s += ln(x0 + begin * mm, 18, x0 + begin * mm, Y + 24, { k:K[1], w:2.5, stip:'4 3' });
    if (o.e) s += ln(x0 + eind * mm, 18, x0 + eind * mm, Y + 24, { k:K[3], w:2.5, stip:'4 3' });
    return svg(x0 * 2 + 60 * mm, Y + 66, s, 'liniaal met een strook', 480);
  }
  function cmL(mm){ var c = T(mm / 10); return [c, c + ' cm', c + 'cm', mm + ' mm', mm + 'mm']; }
  /* een maatbeker van 0 tot max ml */
  function beker(max, L, st, v, o){
    o = o || {};
    var top = 46, bod = 336, x1 = 96, x2 = 236, H = bod - top, s = '', i, N = Math.round(max / st), per = Math.round(L / st);
    function Y(w){ return bod - w / max * H; }
    s += rc(x1, Y(v), x2 - x1, bod - Y(v), { f:K[0], fo:0.28, s:'none', w:0 }) + ln(x1, Y(v), x2, Y(v), { k:K[0], w:3 });
    if (o.tel) for (i = Math.round(o.lab / st) + 1; i <= Math.round(v / st); i++) s += ln(x1, Y(i * st), x1 + 18, Y(i * st), { k:K[1], w:4 });
    for (i = 1; i <= N; i++){
      var y = Y(i * st), groot = i % per === 0, nadruk = o.lab != null && Math.abs(i * st - o.lab) < 1e-9;
      s += ln(x1, y, x1 + (groot ? 30 : 16), y, { w:groot ? 2.2 : 1.5, k:nadruk ? K[1] : null });
      if (groot) s += tx(x1 + 38, y + 5, T(i * st), { a:'start', vet:nadruk, k:nadruk ? K[1] : null });
    }
    s += pad('M' + (x1 - 8) + ' ' + (top - 24) + ' L' + x1 + ' ' + (top - 14) + ' L' + x1 + ' ' + bod + ' L' + x2 + ' ' + bod + ' L' + x2 + ' ' + (top - 14), { w:3 });
    s += tx(x2 - 8, bod - 12, 'ml', { a:'end', fs:15 });
    return svg(300, 352, s, 'maatbeker', 300);
  }
  /* een weegschaal met een wijzer: de schaal loopt over 270 graden */
  function wijzerschaal(max, L, st, v, e, o){
    o = o || {};
    var cx = 200, cy = 190, R1 = 158, s = '', i, N = Math.round(max / st), per = Math.round(L / st);
    function P(w, r){ var a = (-135 + 270 * w / max) * RAD; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
    s += cir(cx, cy, R1 + 16, { f:'var(--kaart)', w:3 });
    for (i = 0; i <= N; i++){
      var w = r6(i * st), groot = i % per === 0, nadruk = o.lab != null && Math.abs(w - o.lab) < 1e-9, p1 = P(w, R1), p2 = P(w, R1 - (groot ? 22 : 12));
      s += ln(p1[0], p1[1], p2[0], p2[1], { w:groot ? 2.5 : 1.4, k:nadruk ? K[1] : null });
      if (groot){ var q = P(w, R1 - 42); s += tx(q[0], q[1], T(w), { mid:true, fs:15, vet:nadruk, k:nadruk ? K[1] : null }); }
    }
    if (o.tel) for (i = Math.round(o.lab / st) + 1; i <= Math.round(v / st); i++){ var a1 = P(i * st, R1 + 3), a2 = P(i * st, R1 - 13); s += ln(a1[0], a1[1], a2[0], a2[1], { k:K[1], w:4 }); }
    s += tx(cx, cy + 66, e, { fs:18, vet:true });
    var pw = P(v, R1 - 8);
    s += ln(cx, cy, pw[0], pw[1], { k:K[0], w:4 }) + cir(cx, cy, 8, { f:'var(--ink)', s:'none', w:0 });
    return svg(400, 370, s, 'weegschaal met een wijzer', 340);
  }
  /* een thermometer van lo tot lo + 40 graden */
  function thermo(lo, st, v, o){
    o = o || {};
    var top = 40, bod = 340, x1 = 112, x2 = 134, s = '', i;
    function Y(t){ return bod - (t - lo) / 40 * (bod - top); }
    s += rc(x1, top - 14, x2 - x1, bod - top + 34, { f:'var(--kaart)', w:2.5, rx:11 });
    s += rc(x1 + 5, Y(v), x2 - x1 - 10, bod + 22 - Y(v), { f:K[1], s:'none', w:0 });
    s += cir((x1 + x2) / 2, bod + 34, 20, { f:K[1], w:2.5 });
    if (o.tel){ var van = Math.min(o.lab, v), tot = Math.max(o.lab, v); for (i = van; i <= tot + 1e-9; i += st) if (Math.abs(i - o.lab) > 1e-9) s += ln(x2, Y(i), x2 + 13, Y(i), { k:K[0], w:4 }); }
    for (i = lo; i <= lo + 40; i += st){
      var groot = i % 10 === 0, nadruk = o.lab != null && i === o.lab;
      s += ln(x2, Y(i), x2 + (groot ? 22 : 11), Y(i), { w:groot ? 2.2 : 1.3, k:nadruk ? K[0] : null });
      if (groot) s += tx(x2 + 30, Y(i) + 5, T(i), { a:'start', vet:i === 0 || nadruk, k:nadruk ? K[0] : null, fs:i === 0 ? 17 : 15 });
    }
    s += tx(x1 - 14, top, '°C', { a:'end', fs:16, vet:true });
    return svg(250, 392, s, 'thermometer', 230);
  }
  /* meten en controleren: [wat, schatting, fout, fout, meting, goede meting, fout, fout, te groot of te klein] */
  var CONTROLE = [
    ['de lengte van een potlood', 'ongeveer 15 cm', 'ongeveer 15 mm', 'ongeveer 1,5 m', '17 m', '17 cm', '1,7 m', '170 cm', 'groot'],
    ['de hoogte van een deur', 'ongeveer 2 m', 'ongeveer 20 cm', 'ongeveer 20 m', '2,1 m', '2,1 m', '21 cm', '21 m', ''],
    ['het gewicht van een appel', 'ongeveer 150 g', 'ongeveer 15 g', 'ongeveer 1,5 kg', '1,6 kg', '160 g', '16 g', '16 kg', 'groot'],
    ['het gewicht van een volwassen man', 'ongeveer 80 kg', 'ongeveer 8 kg', 'ongeveer 800 kg', '78 kg', '78 kg', '7,8 kg', '780 kg', ''],
    ['de inhoud van een glas', 'ongeveer 250 ml', 'ongeveer 25 ml', 'ongeveer 2,5 l', '2,5 l', '250 ml', '25 ml', '25 l', 'groot'],
    ['de inhoud van een emmer', 'ongeveer 10 l', 'ongeveer 1 l', 'ongeveer 100 l', '10 ml', '10 l', '100 ml', '1 l', 'klein'],
    ['de temperatuur in de klas', 'ongeveer 20 °C', 'ongeveer 2 °C', 'ongeveer 60 °C', '21 °C', '21 °C', '2,1 °C', '210 °C', ''],
    ['de breedte van een schrift', 'ongeveer 17 cm', 'ongeveer 17 mm', 'ongeveer 1,7 m', '1,7 cm', '17 cm', '170 cm', '17 mm', 'klein'],
    ['de lengte van een fiets', 'ongeveer 1,8 m', 'ongeveer 18 cm', 'ongeveer 18 m', '18 m', '1,8 m', '18 cm', '180 m', 'groot'],
    ['het gewicht van een pak suiker', 'ongeveer 1 kg', 'ongeveer 100 g', 'ongeveer 10 kg', '1 kg', '1 kg', '100 g', '10 kg', ''],
    ['de lengte van een klaslokaal', 'ongeveer 8 m', 'ongeveer 80 cm', 'ongeveer 80 m', '8 cm', '8 m', '80 cm', '80 m', 'klein'],
    ['de lengte van een mier', 'ongeveer 5 mm', 'ongeveer 5 cm', 'ongeveer 50 cm', '6 mm', '6 mm', '6 cm', '60 mm', ''],
    ['de inhoud van een fles frisdrank', 'ongeveer 1,5 l', 'ongeveer 15 ml', 'ongeveer 15 l', '150 l', '1,5 l', '15 l', '150 ml', 'groot'],
    ['de hoogte van een tafel', 'ongeveer 75 cm', 'ongeveer 7,5 cm', 'ongeveer 7,5 m', '75 cm', '75 cm', '7,5 m', '75 mm', ''],
    ['het gewicht van een pasgeboren baby', 'ongeveer 3,5 kg', 'ongeveer 350 g', 'ongeveer 35 kg', '35 kg', '3,5 kg', '350 g', '0,35 kg', 'groot'],
    ['de temperatuur van hete thee', 'ongeveer 70 °C', 'ongeveer 7 °C', 'ongeveer 170 °C', '7 °C', '70 °C', '17 °C', '700 °C', 'klein'],
    ['de afstand van Amsterdam naar Utrecht', 'ongeveer 40 km', 'ongeveer 4 km', 'ongeveer 400 km', '43 km', '43 km', '4,3 km', '430 km', ''],
    ['de lengte van een voetbalveld', 'ongeveer 100 m', 'ongeveer 10 m', 'ongeveer 1 km', '10,5 km', '105 m', '10,5 m', '1050 m', 'groot'],
    ['de hoogte van een flat van tien verdiepingen', 'ongeveer 30 m', 'ongeveer 3 m', 'ongeveer 300 m', '30 m', '30 m', '3 m', '300 m', ''],
    ['het gewicht van een fiets', 'ongeveer 15 kg', 'ongeveer 1,5 kg', 'ongeveer 150 kg', '1,4 kg', '14 kg', '140 kg', '140 g', 'klein']
  ];
  var NAMEN = ['Sanne', 'Daan', 'Noor', 'Yusuf', 'Lotte', 'Milan', 'Fatima', 'Jesse', 'Eva', 'Omar', 'Sem', 'Lina'];

  G.push({ groep:{ id:'instr-lezen', niveau:'basis', domein:'meten', naam:'Meetinstrumenten aflezen', kd:['rw15B.c', 'rw15B.d', 'rw15B.b', 'rw17A.b'],
    uit:'Een liniaal, maatbeker, weegschaal of thermometer goed aflezen. Het geheim: zoek eerst uit hoeveel één streepje is, en schat vooraf wat er ongeveer uit moet komen.' },
    doelen:[
      { id:'instr-schaal', naam:'Wat is één streepje waard?', kort:'Neem het verschil tussen twee getallen en deel door het aantal stukjes ertussen',
        uit:'<p>Op een meetinstrument staat niet bij elk streepje een getal. Daarom zoek je eerst uit hoeveel <b>één streepje</b> waard is.</p><p>Neem twee getallen die naast elkaar staan, bijvoorbeeld 100 en 200. Het <b>verschil</b> is 100. Tel de <b>stukjes</b> ertussen, niet de streepjes. Zijn het 4 stukjes? Dan is één streepje 100 : 4 = 25.</p>',
        wanneer:'je een meetinstrument voor het eerst ziet.',
        maak:function(R){
          var c = R.kies(SCHALEN), L = c[0], k = c[1], st = r6(L / k), a = r6(L * R.heel(0, 4)), b = r6(a + L);
          var wat = R.kies(L <= 5 ? ['een meetlat', 'een thermometer', 'een meetlint'] : L <= 10 ? ['een thermometer', 'een maatbeker', 'een snelheidsmeter', 'een weegschaal'] : L <= 50 ? ['een maatbeker', 'een snelheidsmeter', 'een weegschaal'] : L <= 200 ? ['een maatbeker', 'een weegschaal', 'een snelheidsmeter'] : ['een weegschaal', 'een maatbeker']);
          var pl = function(n){ return lat(a, L, k, { haak:n >= 1, stukjes:n >= 2 }); };
          var f = {}; f[String(k + 1)] = 'Je telde de streepjes, ook die bij de getallen. Tel de stukjes ertussen.'; if (k > 2) f[String(k - 1)] = 'Je telde alleen de streepjes tussen de getallen. Er is altijd één stukje meer.';
          return { vraag:'streepjes ' + T(a) + ' tot ' + T(b) + ' in ' + k + ' (' + wat + ')', vraagHtml:'Hoeveel is één streepje?', context:'Dit is de schaalverdeling van ' + wat + '.', beeld:pl, zelfBeeld:pl(0), stappen:[
            { tekst:'Neem twee getallen naast elkaar: ' + T(a) + ' en ' + T(b) + '. Het verschil is', antwoord:T(L), hint:T(b) + ' − ' + T(a) + '.' },
            { tekst:'Hoeveel stukjes zitten er tussen ' + T(a) + ' en ' + T(b) + '?', antwoord:String(k), hint:'Tel de ruimtes tussen de streepjes, niet de streepjes zelf. Begin bij ' + T(a) + '.', fout:f },
            { tekst:T(L) + ' : ' + k + ' =', antwoord:T(st), hint:'Verdeel het verschil van ' + T(L) + ' eerlijk over ' + k + ' stukjes.', fout:F(T(L / (k + 1)), 'Je deelde door het aantal streepjes. Deel door het aantal stukjes: ' + k + '.') }
          ] };
        } },
      { id:'instr-liniaal', naam:'Een liniaal aflezen', kort:'Eerst de hele centimeters, dan de millimeterstreepjes erbij',
        uit:'<p>Op een liniaal staan de <b>centimeters</b> met een getal. Tussen twee getallen zitten 10 kleine stukjes: de <b>millimeters</b>. Het iets langere streepje in het midden is een halve centimeter: 5 mm.</p><p>Lees zo af: eerst het laatste getal dat je voorbij bent, dan tel je de millimeters erbij. 7 cm en 4 mm is <b>7,4 cm</b> of 74 mm.</p>',
        wanneer:'je iets meet met een liniaal of geodriehoek.',
        maak:function(R){
          var len = R.heel(12, 58); if (len % 10 === 0) len += R.kies([-3, 4, 5, -5]);
          var c = Math.floor(len / 10), m = len % 10;
          var pl = function(n){ return liniaal(0, len, { e:n >= 1 }); };
          return { vraag:'liniaal ' + len, vraagHtml:'Hoe lang is de strook?', context:'De strook begint precies bij de 0.', eenheid:'cm', beeld:pl, zelfBeeld:pl(0), antwoord:cmL(len), stappen:[
            { tekst:'Welke hele centimeter is de strook net voorbij?', antwoord:String(c), eenheid:'cm', hint:'Kijk naar het laatste getal op de liniaal vóór het eind van de strook.', fout:F(c + 1, 'Dat getal haalt de strook net niet. Neem het getal ervoor.') },
            { tekst:'Hoeveel millimeterstreepjes komen er daarna nog bij?', antwoord:String(m), eenheid:'mm', hint:m === 5 ? 'Het eind staat precies bij het iets langere streepje in het midden: dat is 5 mm.' : 'Tel de kleine stukjes na de ' + c + '. Het iets langere streepje in het midden is 5.' },
            { tekst:c + ' cm en ' + m + ' mm is', antwoord:cmL(len), eenheid:'cm', hint:'Hele centimeters, een komma, en dan de millimeters: ' + c + ',' + m + ' cm.', fout:F(String(len), 'Dat zijn millimeters. In centimeters zet je een komma: ' + c + ',' + m + '.') }
          ] };
        } },
      { id:'instr-verschoven', naam:'Meten als je niet bij 0 begint', kort:'Lees het begin en het eind af en trek ze van elkaar af',
        uit:'<p>Soms ligt iets niet bij de 0, bijvoorbeeld omdat het begin van de liniaal kapot is. Dan lees je twee keer af: waar het <b>begint</b> en waar het <b>eindigt</b>.</p><p>De lengte is <b>eind min begin</b>. Begint de strook bij 2 cm en eindigt hij bij 6,5 cm? Dan is hij 6,5 − 2 = 4,5 cm lang.</p>',
        wanneer:'het voorwerp niet bij de 0 begint.',
        maak:function(R){
          var b = R.kies([10, 15, 20, 25]), len = R.heel(14, 58 - b), e = b + len;
          var pl = function(n){ return liniaal(b, e, { b:n >= 1, e:n >= 2 }); };
          return { vraag:'van ' + b + ' tot ' + e, vraagHtml:'Hoe lang is de strook?', context:'Let op: de strook begint niet bij de 0.', eenheid:'cm', beeld:pl, zelfBeeld:pl(0), antwoord:cmL(len), stappen:[
            { tekst:'Bij welke maat begint de strook?', antwoord:cmL(b), eenheid:'cm', hint:b % 10 ? 'De strook begint bij het langere streepje tussen ' + (b - 5) / 10 + ' en ' + (b + 5) / 10 + ': een halve centimeter.' : 'Kijk waar de linkerkant van de strook op de liniaal staat.', fout:F('0', 'De strook begint niet bij 0. Kijk waar de linkerkant staat.') },
            { tekst:'Bij welke maat eindigt de strook?', antwoord:cmL(e), eenheid:'cm', hint:e % 10 ? 'Het eind is voorbij de ' + Math.floor(e / 10) + ', en dan nog ' + (e % 10) + ' millimeterstreepjes.' : 'Het eind staat precies bij de ' + e / 10 + '.' },
            { tekst:'De lengte: ' + T(e / 10) + ' − ' + T(b / 10) + ' =', antwoord:cmL(len), eenheid:'cm', hint:'Eind min begin.', fout:F(T(e / 10), 'Dat is waar de strook eindigt. Hij begint niet bij 0: trek het begin eraf.') }
          ] };
        } },
      { id:'instr-maatbeker', naam:'Een maatbeker aflezen', kort:'Bepaal wat één streepje is, en tel vanaf het getal onder het water',
        uit:'<p>Op een maatbeker staat niet bij elk streepje een getal. Kijk eerst hoeveel <b>één streepje</b> is: tussen 100 en 200 ml zitten bijvoorbeeld 4 stukjes, dan is één streepje 25 ml.</p><p>Zoek daarna het <b>getal net onder</b> het water en tel de streepjes erbij. Kijk recht van opzij naar de bovenkant van het water.</p>',
        wanneer:'je vloeistof afmeet voor een recept of een proef.',
        maak:function(R){
          var c = R.kies([[500, 100, 2], [500, 100, 4], [1000, 200, 4], [1000, 200, 2], [250, 50, 5], [1000, 100, 2], [400, 100, 4], [300, 50, 2]]);
          var max = c[0], L = c[1], per = c[2], st = L / per, lab = L * R.heel(1, max / L - 1), j = R.heel(1, per - 1), v = lab + j * st;
          var pl = function(n){ return beker(max, L, st, v, { lab:n >= 2 ? lab : null, tel:n >= 3 }); };
          var f1 = {}; if (st !== 10) f1['10'] = 'Niet elk streepje is 10. Kijk hoeveel stukjes er tussen ' + L + ' en ' + 2 * L + ' zitten.';
          return { vraag:'maatbeker ' + v + ' (' + max + '/' + st + ')', vraagHtml:'Hoeveel ml zit erin?', eenheid:'ml', beeld:pl, zelfBeeld:pl(0), stappen:[
            { tekst:'Hoeveel ml is één streepje?', antwoord:T(st), eenheid:'ml', hint:'Tussen ' + L + ' en ' + 2 * L + ' zitten ' + per + ' stukjes. Deel ' + L + ' door ' + per + '.', fout:f1 },
            { tekst:'Welk getal staat net onder het water?', antwoord:String(lab), eenheid:'ml', hint:'Kijk naar de bovenkant van het water. Zoek het getal dat net lager staat.', fout:F(lab + L, 'Dat getal staat boven het water. Neem het getal eronder.') },
            { tekst:'Hoeveel streepjes komt het water daarboven?', antwoord:String(j), hint:'Tel vanaf de ' + lab + ' de streepjes omhoog tot de bovenkant van het water.' },
            { tekst:lab + ' + ' + j + ' × ' + T(st) + ' =', antwoord:metE(T(v), 'ml'), eenheid:'ml', hint:j + ' × ' + T(st) + ' = ' + T(j * st) + '. Tel dat bij ' + lab + ' op.', fout:F(lab + j, 'Je telde elk streepje als 1 ml. Eén streepje is ' + T(st) + ' ml.') }
          ] };
        } },
      { id:'instr-weegschaal', naam:'Een weegschaal met een wijzer', kort:'Bepaal wat één streepje is, en tel vanaf het getal vóór de wijzer',
        uit:'<p>Een weegschaal met een wijzer lees je af zoals een maatbeker. Zoek eerst uit hoeveel <b>één streepje</b> is. Kijk ook naar de <b>eenheid</b>: gram of kilogram.</p><p>Zoek dan het <b>getal vóór de wijzer</b> en tel de streepjes erbij. Staat de wijzer 3 streepjes na de 400, en is een streepje 20 gram? Dan weegt het 400 + 60 = 460 gram.</p>',
        wanneer:'je iets weegt op een keukenweegschaal of personenweegschaal.',
        maak:function(R){
          var c = R.kies([[1000, 100, 5, 'gram'], [1000, 100, 4, 'gram'], [1000, 200, 4, 'gram'], [2000, 500, 5, 'gram'], [5, 1, 10, 'kg'], [5, 1, 4, 'kg'], [10, 2, 4, 'kg'], [3, 1, 5, 'kg']]);
          var max = c[0], L = c[1], per = c[2], e = c[3], st = r6(L / per), lab = r6(L * R.heel(0, max / L - 1)), j = R.heel(1, per - 1), v = r6(lab + j * st), eh = e === 'gram' ? 'g' : 'kg';
          var pl = function(n){ return wijzerschaal(max, L, st, v, e, { lab:n >= 2 ? lab : null, tel:n >= 3 }); };
          return { vraag:'weegschaal ' + T(v) + ' ' + eh + ' (' + max + '/' + T(st) + ')', vraagHtml:'Hoeveel weegt het?', eenheid:eh, beeld:pl, zelfBeeld:pl(0), stappen:[
            { tekst:'Hoeveel ' + e + ' is één streepje?', antwoord:T(st), eenheid:eh, hint:'Tussen ' + T(L) + ' en ' + T(2 * L) + ' zitten ' + per + ' stukjes. Deel ' + T(L) + ' door ' + per + '.' },
            { tekst:'Welk getal staat net vóór de wijzer?', antwoord:T(lab), eenheid:eh, hint:'De getallen worden groter met de klok mee. Welk getal heeft de wijzer net gehad?' },
            { tekst:'Hoeveel streepjes staat de wijzer verder?', antwoord:String(j), hint:'Tel vanaf de ' + T(lab) + ' de streepjes tot de wijzer.' },
            { tekst:T(lab) + ' + ' + j + ' × ' + T(st) + ' =', antwoord:metE(T(v), eh, [e]), eenheid:eh, hint:j + ' × ' + T(st) + ' = ' + T(r6(j * st)) + '. Tel dat bij ' + T(lab) + ' op.', fout:F(T(r6(lab + j)), 'Je telde elk streepje als 1. Eén streepje is ' + T(st) + ' ' + e + '.') }
          ] };
        } },
      { id:'instr-thermometer', naam:'Een thermometer aflezen, ook onder nul', kort:'Boven nul tel je omhoog vanaf het getal eronder, onder nul tel je omlaag vanaf het getal erboven',
        uit:'<p>Een thermometer is een staande getallenlijn. Boven de 0 is het warm, onder de 0 vriest het: dan zet je een <b>min</b> voor het getal.</p><p>Bepaal eerst wat <b>één streepje</b> is. Boven 0 tel je omhoog vanaf het getal eronder. <b>Onder 0</b> tel je omlaag vanaf het getal erboven: 3 streepjes onder de 0 is <b>−3 °C</b>.</p>',
        wanneer:'je de temperatuur afleest, binnen of buiten.',
        maak:function(R){
          var lo = R.kies([-20, -10]), st = R.kies([1, 2]), neg = R.heel(0, 1) === 1, v;
          do { v = st * R.heel(neg ? Math.ceil((lo + 2) / st) : 1, neg ? -1 : Math.floor((lo + 38) / st)); } while (v % 10 === 0 || v === 0);
          var lab = neg ? Math.ceil(v / 10) * 10 : Math.floor(v / 10) * 10; if (lab === 0) lab = 0;
          var j = Math.abs(v - lab) / st;
          var pl = function(n){ return thermo(lo, st, v, { lab:n >= 3 ? lab : null, tel:n >= 4 }); };
          var laatst = { tekst:T(lab) + (neg ? ' − ' : ' + ') + j + ' × ' + st + ' =', antwoord:metE(T(v), '°C', ['graden', '°']), eenheid:'°C', hint:j + ' × ' + st + ' = ' + (j * st) + '. ' + (neg ? 'Ga vanaf ' + T(lab) + ' zoveel omlaag.' : 'Tel dat bij ' + T(lab) + ' op.') };
          if (neg) laatst.fout = F(T(-v), 'Onder 0 is de temperatuur negatief: zet er een min voor.');
          return { vraag:'thermometer ' + T(v) + ' (' + lo + '/' + st + ')', vraagHtml:'Hoe warm is het?', eenheid:'°C', beeld:pl, zelfBeeld:pl(0), stappen:[
            { tekst:'Hoeveel graden is één streepje?', antwoord:String(st), eenheid:'°C', hint:'Tussen 0 en 10 zitten ' + (10 / st) + ' stukjes. Deel 10 door ' + (10 / st) + '.' },
            kstap(R, 'Staat het eind van de rode vloeistof boven of onder de 0?', neg ? 'onder de 0' : 'boven de 0', [neg ? 'boven de 0' : 'onder de 0'], 'Zoek de 0 op de thermometer. Komt de vloeistof hoger of lager?'),
            neg ? { tekst:'Welk getal staat net boven het eind van de vloeistof?', antwoord:T(lab), hint:'Onder 0 tel je vanaf het getal erboven naar beneden. Welk getal staat net boven het rode eind?' }
                : { tekst:'Welk getal staat net onder het eind van de vloeistof?', antwoord:T(lab), hint:'Zoek het getal dat net lager staat dan het rode eind.' },
            { tekst:'Hoeveel streepjes ' + (neg ? 'lager' : 'hoger') + ' staat het eind?', antwoord:String(j), hint:'Tel vanaf de ' + T(lab) + ' de streepjes ' + (neg ? 'omlaag' : 'omhoog') + ' tot het eind van de vloeistof.' },
            laatst
          ] };
        } },
      { id:'instr-controle', naam:'Schatten en controleren', kort:'Schat eerst wat er ongeveer uit moet komen, en kijk dan of de meting kan kloppen',
        uit:'<p>Een meting kan fout gaan: een verkeerde <b>eenheid</b> erachter, of de <b>komma</b> op de verkeerde plek. Daarom <b>schat</b> je eerst wat er ongeveer uit moet komen.</p><p>Vergelijk de meting met je schatting. Een potlood van 17 m kan niet: een potlood is ongeveer 15 cm. Er had <b>17 cm</b> moeten staan.</p>',
        wanneer:'je een meting opschrijft en wilt weten of hij kan kloppen.',
        maak:function(R){
          var it = R.kies(CONTROLE), wie = R.kies(NAMEN), klopt = it[4] === it[5];
          return eindKeuze({ vraag:it[0] + ': ' + it[4], vraagHtml:'Welke meting is goed?', context:wie + ' meet ' + it[0] + ' en schrijft op: <b>' + S(it[4]) + '</b>.', stappen:[
            kstap(R, 'Schat eerst: wat is ' + it[0] + ' ongeveer?', it[1], [it[2], it[3]], 'Vergelijk met iets wat je kent: een grote stap is 1 m, een pak suiker 1 kg, een pak melk 1 liter.'),
            kstap(R, 'Kan ' + it[4] + ' kloppen?', klopt ? 'ja' : 'nee', [klopt ? 'nee' : 'ja'], klopt ? 'De meting ligt dicht bij je schatting van ' + it[1].replace('ongeveer ', '') + '.' : 'Je schatting was ' + it[1] + '. Dan is ' + it[4] + ' veel te ' + it[8] + '.'),
            kstap(R, 'Welke meting is goed?', it[5], [it[6], it[7], klopt ? null : it[4]].filter(function(x){ return x; }), klopt ? 'De meting klopte al.' : 'Zoek de meting die past bij je schatting van ' + it[1].replace('ongeveer ', '') + '.')
          ] });
        } }
    ] });

  /* ================= hoeken (1F) ================= */
  function hoekTek(deg, rot, o){
    o = o || {};
    var cx = 150, cy = 150, L = 125, s = '', p1 = pol(cx, cy, L, rot), p2 = pol(cx, cy, L, rot + deg);
    if (o.ref){ var q = pol(cx, cy, 90, rot + 90); s += ln(cx, cy, q[0], q[1], { w:2, stip:'5 5', op:0.55 }) + hoekje(cx, cy, rot, rot + 90, { k:'var(--muted)' }); }
    s += hoekje(cx, cy, rot, rot + deg, { r:42, t:o.t, k:K[0] });
    s += ln(cx, cy, p1[0], p1[1], { w:3.5 }) + ln(cx, cy, p2[0], p2[1], { w:3.5 }) + cir(cx, cy, 4, { f:'var(--ink)', s:'none', w:0 });
    return svg(300, 300, s, 'een hoek', 300);
  }
  /* een draai vanaf boven, met de klok mee */
  function draaiTek(deg, o){
    o = o || {};
    var cx = 150, cy = 150, r = 100, s = cir(cx, cy, r, { w:1.5, stip:'5 5', op:0.6 }), d = Math.min(deg, 360);
    if (d >= 360) s += cir(cx, cy, r, { f:K[0], fo:0.16, s:K[0], w:3 });
    else if (d > 0){ s += hoekje(cx, cy, 90 - d, 90, { r:r, k:K[0], recht:false }); var e = pol(cx, cy, r + 2, 90 - d); s += ln(cx, cy, e[0], e[1], { w:3, k:K[0] }); }
    var t = pol(cx, cy, r + 2, 90);
    s += ln(cx, cy, t[0], t[1], { w:3 }) + cir(cx, cy, 5, { f:'var(--ink)', s:'none', w:0 });
    if (o.t) s += tx(cx, cy + r + 30, o.t, { vet:true, fs:17, k:K[0] });
    return svg(300, o.t ? 300 : 280, s, 'een draai', 280);
  }
  var WIND = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW'], WINDN = ['noorden', 'noordoosten', 'oosten', 'zuidoosten', 'zuiden', 'zuidwesten', 'westen', 'noordwesten'];
  function windroos(start, eind, o){
    o = o || {};
    var cx = 170, cy = 165, r = 110, s = cir(cx, cy, r, { w:1.5, op:0.5 }), i;
    for (i = 0; i < 8; i++){
      var a = 90 - i * 45, p = pol(cx, cy, r, a), q = pol(cx, cy, r + 30, a);
      s += ln(cx, cy, p[0], p[1], { w:i % 2 ? 1.2 : 2, op:i % 2 ? 0.45 : 0.7 });
      s += tx(q[0], q[1], WIND[i], { mid:true, fs:17, vet:i === start || i === eind, k:i === start ? K[0] : i === eind ? K[1] : null });
    }
    if (eind != null && o.boog){ var d = o.rechtsom ? norm360((eind - start) * 45) : norm360((start - eind) * 45); s += o.rechtsom ? hoekje(cx, cy, 90 - start * 45 - d, 90 - start * 45, { r:56, k:K[3], recht:false }) : hoekje(cx, cy, 90 - start * 45, 90 - start * 45 + d, { r:56, k:K[3], recht:false }); }
    var ps = pol(cx, cy, r - 6, 90 - start * 45);
    s += ln(cx, cy, ps[0], ps[1], { w:4, k:K[0] });
    if (eind != null && o.eind){ var pe = pol(cx, cy, r - 6, 90 - eind * 45); s += ln(cx, cy, pe[0], pe[1], { w:4, k:K[1] }); }
    s += cir(cx, cy, 6, { f:'var(--ink)', s:'none', w:0 });
    return svg(340, 330, s, 'windroos', 320);
  }
  /* de geodriehoek: buitenste rij (blauw) 0 rechts, binnenste rij (oranje) 0 links */
  function geo(deg, links, o){
    o = o || {};
    var cx = 200, cy = 215, R1 = 170, s = '', a;
    s += pad('M' + (cx - R1) + ' ' + cy + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + (cx + R1) + ' ' + cy + ' Z', { f:'var(--kaart)', w:2 });
    for (a = 0; a <= 180; a += 5){ var p = pol(cx, cy, R1, a), q = pol(cx, cy, R1 - (a % 10 ? 8 : 15), a); s += ln(p[0], p[1], q[0], q[1], { w:a % 10 ? 1.2 : 2 }); }
    for (a = 0; a <= 180; a += 20){
      var al = a === 0 ? 5 : a === 180 ? 175 : a, pb = pol(cx, cy, R1 - 30, al), pi = pol(cx, cy, R1 - 60, al);
      s += tx(pb[0], pb[1], String(a), { mid:true, fs:15, k:K[0], vet:o.rij === 'b', op:o.rij === 'i' ? 0.35 : 1 });
      s += tx(pi[0], pi[1], String(180 - a), { mid:true, fs:15, k:K[1], vet:o.rij === 'i', op:o.rij === 'b' ? 0.35 : 1 });
    }
    var b1 = links ? 180 : 0, b2 = links ? 180 - deg : deg, e1 = pol(cx, cy, R1 + 24, b1), e2 = pol(cx, cy, R1 + 24, b2);
    s += hoekje(cx, cy, links ? b2 : b1, links ? b1 : b2, { r:34, k:K[2] });
    s += ln(cx, cy, e1[0], e1[1], { w:3.5 }) + ln(cx, cy, e2[0], e2[1], { w:3.5 });
    s += ln(cx - 8, cy, cx + 8, cy, { w:2 }) + ln(cx, cy - 8, cx, cy, { w:2 });
    return svg(400, 236, s, 'geodriehoek op een hoek', 480);
  }

  G.push({ groep:{ id:'hoek-basis', niveau:'1F', domein:'meten', naam:'Hoeken', kd:['rw13A.e', 'rw15B.c'],
    uit:'Soorten hoeken, draaien in graden, windrichtingen, hoeken schatten en hoeken meten met de geodriehoek. Een hele draai is 360°, een kwartslag is 90°.' },
    doelen:[
      { id:'hoek-soorten', naam:'Soorten hoeken', kort:'Vergelijk met een rechte hoek: kleiner is scherp, groter is stomp, een rechte lijn is gestrekt',
        uit:'<p>Een hoek meet je in <b>graden</b> (°). Er zijn vier soorten:</p><p><b>Scherp</b>: kleiner dan 90°. <b>Recht</b>: precies 90°, zoals de hoek van een blaadje papier. Die teken je met een vierkantje. <b>Stomp</b>: tussen 90° en 180°. <b>Gestrekt</b>: precies 180°, een rechte lijn.</p><p>Twijfel je? Leg in gedachten de hoek van een blaadje papier ertegen.</p>',
        wanneer:'je een hoek moet benoemen of wilt weten of hij groter of kleiner is dan 90°.',
        maak:function(R){
          var soort = R.kies(['scherp', 'recht', 'stomp', 'gestrekt', 'scherp', 'stomp']);
          var deg = soort === 'scherp' ? 5 * R.heel(4, 15) : soort === 'recht' ? 90 : soort === 'stomp' ? 5 * R.heel(21, 34) : 180;
          var rot = R.kies([0, 0, 15, 30, -20, 60, 100, 200, -45, 160]), vgl = deg < 90 ? 'kleiner dan 90°' : deg === 90 ? 'precies 90°' : 'groter dan 90°';
          var b = hoekTek(deg, rot);
          return eindKeuze({ vraag:'hoek ' + deg + ' ' + rot, vraagHtml:'Wat voor hoek is dit?', beeld:b, zelfBeeld:b, stappen:[
            kstap(R, 'Vergelijk met een rechte hoek, de hoek van een blaadje papier. De hoek is', vgl, ['kleiner dan 90°', 'precies 90°', 'groter dan 90°'].filter(function(x){ return x !== vgl; }), 'Een rechte hoek teken je met een vierkantje. Past de hoek van een blaadje papier er precies in, of steekt er iets uit?'),
            kstap(R, 'Wat voor hoek is het?', soort, ['scherp', 'recht', 'stomp', 'gestrekt'].filter(function(x){ return x !== soort; }), 'Kleiner dan 90° is scherp. Precies 90° is recht. Tussen 90° en 180° is stomp. Een rechte lijn, 180°, is gestrekt.')
          ] });
        } },
      { id:'hoek-draaien', naam:'Draaien in graden', kort:'Een hele draai is 360°, een halve 180° en een kwartslag 90°',
        uit:'<p>Draai je helemaal rond, dan draai je <b>360°</b>. Een <b>halve draai</b> is 180°: je kijkt dan de andere kant op. Een <b>kwartslag</b> is 90°.</p><p>Drie kwartslagen is 3 × 90 = 270°. De grote wijzer van de klok draait in 60 minuten 360°, dus in één minuut 360 : 60 = 6°.</p>',
        wanneer:'je een draai of een stuk van een rondje in graden wilt zeggen.',
        maak:function(R){
          var t = R.heel(0, 2), k, m, d;
          if (t === 0){ k = R.heel(2, 4); var nm = { 2:'twee kwartslagen', 3:'drie kwartslagen', 4:'vier kwartslagen' }[k];
            return { vraag:nm + ' = … graden', context:'Je draait ' + nm + '.', eenheid:'°', beeld:function(n){ return draaiTek(n >= 2 ? 90 * k : n >= 1 ? 90 : 0); }, stappen:[
              { tekst:'Eén kwartslag is', antwoord:gr(90), eenheid:'°', hint:'Een hele draai is 360°. Een kwartslag is een kwart daarvan: 360 : 4.' },
              { tekst:k + ' × 90 =', antwoord:gr(90 * k), eenheid:'°', hint:k + ' keer een kwartslag.' } ] }; }
          if (t === 1){ m = R.kies([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
            return { vraag:'grote wijzer in ' + m + ' minuten', context:'Hoeveel graden draait de grote wijzer van de klok in ' + m + ' minuten?', eenheid:'°', beeld:function(n){ return draaiTek(n >= 3 ? 6 * m : 0); }, stappen:[
              { tekst:'In 60 minuten draait de grote wijzer één hele rondje:', antwoord:gr(360), eenheid:'°', hint:'Een heel rondje is een hele draai.' },
              { tekst:'In 1 minuut: 360 : 60 =', antwoord:gr(6), eenheid:'°', hint:'Verdeel 360° over 60 minuten.' },
              { tekst:m + ' × 6 =', antwoord:gr(6 * m), eenheid:'°', hint:'Elke minuut 6°, en het zijn ' + m + ' minuten.' } ] }; }
          d = R.kies([90, 180, 270, 360]);
          return { vraag:d + '° = … kwartslagen', context:'Hoeveel kwartslagen is een draai van ' + d + '°?', eenheid:'kwartslagen', beeld:function(n){ return draaiTek(d); }, stappen:[
            { tekst:'Eén kwartslag is', antwoord:gr(90), eenheid:'°', hint:'Een kwart van 360°.' },
            { tekst:d + ' : 90 =', antwoord:metE(String(d / 90), 'kwartslagen', ['kwartslag']), eenheid:'kwartslagen', hint:'Hoe vaak past 90 in ' + d + '?' } ] };
        } },
      { id:'hoek-wind', naam:'Windrichtingen en draaien', kort:'Tussen twee windrichtingen naast elkaar zit 45°, tussen noord en oost 90°',
        uit:'<p>De windroos heeft vier <b>hoofdwindrichtingen</b>: noord (N), oost (O), zuid (Z) en west (W). Daartussen liggen noordoost (NO), zuidoost (ZO), zuidwest (ZW) en noordwest (NW).</p><p>Van noord naar oost is een kwartslag: <b>90°</b>. Tussen twee richtingen naast elkaar zit <b>45°</b>. <b>Rechtsom</b> is met de klok mee: N, NO, O, ZO, Z, ZW, W, NW.</p>',
        wanneer:'je een route beschrijft of een kaart leest.',
        maak:function(R){
          var s0 = R.heel(0, 7), rechtsom = R.heel(0, 1) === 1, stap = R.heel(1, 6), e = norm360(rechtsom ? s0 + stap : s0 - stap) % 8, d = 45 * stap, kant = rechtsom ? 'rechtsom (met de klok mee)' : 'linksom (tegen de klok in)';
          if (R.heel(0, 2) === 0){
            var r2 = norm360(s0 + stap) % 8; if (!rechtsom) r2 = norm360(s0 - stap) % 8;
            return { vraag:'van ' + WIND[s0] + ' naar ' + WIND[r2], context:'Je kijkt naar het ' + WINDN[s0] + '. Je draait ' + kant + ' tot je naar het ' + WINDN[r2] + ' kijkt. Hoeveel graden draai je?', eenheid:'°',
              beeld:function(n){ return windroos(s0, r2, { eind:true, boog:n >= 1, rechtsom:rechtsom }); }, stappen:[
                { tekst:'Hoeveel stappen van 45° tel je ' + (rechtsom ? 'rechtsom' : 'linksom') + '?', antwoord:String(stap), hint:'Tel de richtingen op de windroos, ' + (rechtsom ? 'met de klok mee' : 'tegen de klok in') + ', vanaf ' + WIND[s0] + ' tot ' + WIND[r2] + '.', fout:F(8 - stap, 'Je telde de andere kant op.') },
                { tekst:stap + ' × 45 =', antwoord:gr(d), eenheid:'°', hint:'Elke stap is 45°.' } ] };
          }
          var fout = [WINDN[norm360(rechtsom ? s0 - stap : s0 + stap) % 8], WINDN[(e + 4) % 8], WINDN[(e + 1) % 8], WINDN[(e + 7) % 8]].filter(function(x){ return x !== WINDN[e]; });
          return eindKeuze({ vraag:WIND[s0] + ' ' + (rechtsom ? '+' : '−') + d, vraagHtml:'Waar kijk je nu?', context:'Je kijkt naar het ' + WINDN[s0] + '. Je draait ' + d + '° ' + kant + '.',
            beeld:function(n){ return windroos(s0, e, { eind:n >= 2, boog:n >= 2, rechtsom:rechtsom }); }, zelfBeeld:windroos(s0, null), stappen:[
              { tekst:'Hoeveel stappen van 45° is ' + d + '°? ' + d + ' : 45 =', antwoord:String(stap), hint:'Tussen twee richtingen naast elkaar op de windroos zit 45°.' },
              kstap(R, 'Tel ' + stap + (stap === 1 ? ' stap ' : ' stappen ') + (rechtsom ? 'rechtsom' : 'linksom') + ' vanaf ' + WIND[s0] + '. Waar kijk je nu?', WINDN[e], uniek(fout).slice(0, 3), rechtsom ? 'Rechtsom gaat: N, NO, O, ZO, Z, ZW, W, NW.' : 'Linksom gaat: N, NW, W, ZW, Z, ZO, O, NO.')
            ] });
        } },
      { id:'hoek-schatten', naam:'Hoeken schatten', kort:'Is hij scherp of stomp? Zit hij dichter bij 0°, 45°, 90°, 135° of 180°?',
        uit:'<p>Een hoek schatten gaat in twee stappen. Eerst: is hij <b>kleiner of groter dan 90°</b>? Leg in gedachten een rechte hoek ertegen.</p><p>Dan: zit hij in de <b>eerste of tweede helft</b>? Een scherpe hoek ligt tussen 0° en 45° of tussen 45° en 90°. Een stompe hoek ligt tussen 90° en 135° of tussen 135° en 180°.</p>',
        wanneer:'je een meting wilt controleren of geen geodriehoek bij je hebt.',
        maak:function(R){
          var scherp = R.heel(0, 1) === 1, deg = scherp ? R.kies([20, 25, 30, 35, 55, 60, 65, 70, 75, 80]) : R.kies([100, 105, 110, 115, 120, 125, 145, 150, 155, 160, 165, 170]);
          var rot = R.kies([0, 0, 10, 20, -15, 30, 45, 90, 180]), band = scherp ? (deg < 45 ? 'tussen 0° en 45°' : 'tussen 45° en 90°') : (deg < 135 ? 'tussen 90° en 135°' : 'tussen 135° en 180°');
          var andere = scherp ? (deg < 45 ? 'tussen 45° en 90°' : 'tussen 0° en 45°') : (deg < 135 ? 'tussen 135° en 180°' : 'tussen 90° en 135°');
          var kand = R.hussel([deg - 30, deg + 30, deg - 60, deg + 60, 180 - deg].filter(function(x){ return x >= 10 && x <= 175 && Math.abs(x - deg) >= 25 && x !== 90; }));
          var b = function(n){ return hoekTek(deg, rot, { ref:n >= 1 }); };
          return eindKeuze({ vraag:'schat ' + deg + ' ' + rot, vraagHtml:'Hoe groot is deze hoek ongeveer?', beeld:b, zelfBeeld:b(0), stappen:[
            kstap(R, 'Is de hoek scherp of stomp?', scherp ? 'scherp' : 'stomp', [scherp ? 'stomp' : 'scherp'], 'Leg in gedachten een rechte hoek tegen het onderste been. Valt de hoek erbinnen? Dan is hij scherp.'),
            kstap(R, 'In welke helft ligt hij?', band, [andere], scherp ? 'Een hoek van 45° is precies een halve rechte hoek. Is de hoek kleiner of groter dan de helft?' : 'Een hoek van 135° is een rechte hoek plus een halve. Is de hoek kleiner of groter?'),
            kstap(R, 'Welke schatting past het best?', deg + '°', kand.slice(0, 3).map(function(x){ return x + '°'; }), 'De hoek is ' + (scherp ? 'scherp' : 'stomp') + ' en ligt ' + band + '. Welke schatting past daarbij?')
          ] });
        } },
      { id:'hoek-meten', naam:'Een hoek meten met de geodriehoek', kort:'Leg het midden op het hoekpunt, één been op de nullijn, en lees af op de rij die daar bij 0 begint',
        uit:'<p>Leg het <b>midden</b> van de geodriehoek precies op het hoekpunt. Leg de onderrand langs één been.</p><p>Op de geodriehoek staan <b>twee rijen</b> getallen. Kies de rij die bij dat been met <b>0</b> begint. Tel van daaruit tot het andere been.</p><p>Controleer met een schatting: is de hoek scherp, dan moet er minder dan 90° uitkomen. Is hij stomp, dan meer.</p>',
        wanneer:'je een hoek precies wilt weten.',
        maak:function(R){
          var deg; do { deg = 5 * R.heel(3, 33); } while (deg === 90);
          var links = R.heel(0, 1) === 1, rij = links ? 'de binnenste rij (oranje)' : 'de buitenste rij (blauw)', ander = links ? 'de buitenste rij (blauw)' : 'de binnenste rij (oranje)';
          var lo = Math.floor(deg / 20) * 20, scherp = deg < 90;
          var b = function(n){ return geo(deg, links, { rij:n >= 1 ? (links ? 'i' : 'b') : null }); };
          return { vraag:'geo ' + deg + (links ? ' links' : ' rechts'), vraagHtml:'Hoeveel graden is de hoek?', eenheid:'°', beeld:b, zelfBeeld:b(0), stappen:[
            kstap(R, 'Het ene been ligt langs de onderrand naar ' + (links ? 'links' : 'rechts') + '. Welke rij begint daar bij 0?', rij, [ander], 'Kijk naar het eind van de onderrand aan de ' + (links ? 'linker' : 'rechter') + 'kant. Welke rij heeft daar een 0?'),
            kstap(R, 'Is de hoek scherp of stomp?', scherp ? 'scherp' : 'stomp', [scherp ? 'stomp' : 'scherp'], 'Het streepje bij 90 staat recht omhoog. Ligt het schuine been daarvoor of daarna?'),
            { tekst:'Lees af op ' + rij + '. De hoek is', antwoord:gr(deg), eenheid:'°', hint:'De hoek is ' + (scherp ? 'scherp, dus kleiner' : 'stomp, dus groter') + ' dan 90°. ' + (deg % 20 ? 'Het been staat tussen de ' + lo + ' en de ' + (lo + 20) + '. Elk klein streepje is 5°, elk lang streepje 10°.' : 'Het been staat precies bij een getal.'),
              fout:F(180 - deg, 'Je las de andere rij. Die hoort bij een been dat naar de andere kant ligt.') }
          ] };
        } },
      { id:'hoek-klok', naam:'Hoeken op de klok', kort:'Van getal tot getal op de klok is 30°: tel de stappen tussen de wijzers',
        uit:'<p>De klok is een cirkel van 360° met <b>12 getallen</b>. Van het ene getal naar het volgende is dus 360 : 12 = <b>30°</b>.</p><p>Om 3 uur staan de wijzers 3 getallen uit elkaar: 3 × 30 = 90°. Tel altijd de <b>kortste kant</b>: om 10 uur is dat 2 stappen, dus 60°.</p>',
        wanneer:'je hoeken wilt oefenen met iets wat je elke dag ziet.',
        maak:function(R){
          var u = R.heel(1, 11), k = Math.min(u, 12 - u), b = R0.teken.klok(u, 0);
          return { vraag:'hoek om ' + u + ' uur', vraagHtml:'Hoe groot is de hoek tussen de wijzers?', context:'Het is precies ' + u + ' uur.', eenheid:'°', beeld:b, zelfBeeld:b, stappen:[
            { tekst:'Van het ene getal naar het volgende: 360 : 12 =', antwoord:gr(30), eenheid:'°', hint:'Een hele cirkel is 360° en er staan 12 getallen op de klok.' },
            { tekst:'Hoeveel stappen van getal tot getal zitten er tussen de wijzers? Neem de kortste kant.', antwoord:String(k), hint:'De grote wijzer staat op de 12, de kleine op de ' + u + '. Tel ' + (u > 6 ? 'van de ' + u + ' verder naar de 12.' : 'van de 12 naar de ' + u + '.'), fout:u > 6 ? F(u, 'Dat is de lange kant. Tel de kortste kant: van de ' + u + ' naar de 12.') : {} },
            { tekst:k + ' × 30 =', antwoord:gr(30 * k), eenheid:'°', hint:'Elke stap is 30°.' }
          ] };
        } }
    ] });

  /* ================= hoeken berekenen (2F) ================= */
  function som(l){ return l.reduce(function(a, b){ return a + b; }, 0); }
  function kleurX(lab, i){ return lab[i] === 'x' ? K[1] : [K[0], K[3], K[2], K[4]][i % 4]; }
  function rechteLijn(h, lab){
    var cx = 200, cy = 178, L = 182, s = '', a = 0;
    h.forEach(function(v, i){ s += hoekje(cx, cy, a, a + v, { r:i % 2 ? 54 : 40, t:lab[i], k:kleurX(lab, i) }); a += v; });
    s += ln(cx - L, cy, cx + L, cy, { w:3 });
    a = 0; h.forEach(function(v, i){ a += v; if (i < h.length - 1){ var p = pol(cx, cy, 160, a); s += ln(cx, cy, p[0], p[1], { w:3 }); } });
    return svg(400, 196, s + cir(cx, cy, 4, { f:'var(--ink)', s:'none', w:0 }), 'hoeken op een rechte lijn', 460);
  }
  function rondPunt(h, lab, rot){
    var cx = 160, cy = 150, s = '', a = rot;
    h.forEach(function(v, i){ s += hoekje(cx, cy, a, a + v, { r:i % 2 ? 46 : 36, t:lab[i], k:kleurX(lab, i) }); a += v; });
    a = rot; h.forEach(function(v){ var p = pol(cx, cy, 128, a); s += ln(cx, cy, p[0], p[1], { w:3 }); a += v; });
    return svg(320, 300, s + cir(cx, cy, 4, { f:'var(--ink)', s:'none', w:0 }), 'hoeken rond een punt', 320);
  }
  function kruis(r0, a, g, q, val){
    var cx = 200, cy = 140, s = '', grens = [r0, r0 + a, r0 + 180, r0 + 180 + a, r0 + 360];
    s += hoekje(cx, cy, grens[g], grens[g + 1], { r:36, t:val + '°', k:K[0] }) + hoekje(cx, cy, grens[q], grens[q + 1], { r:36, t:'x', k:K[1] });
    [r0, r0 + a].forEach(function(d){ var p = pol(cx, cy, 175, d), p2 = pol(cx, cy, 175, d + 180); s += ln(p[0], p[1], p2[0], p2[1], { w:3 }); });
    return svg(400, 280, s, 'twee lijnen die elkaar snijden', 440);
  }
  function driePts(al, be){ var t = Math.sin(be * RAD) / Math.sin((al + be) * RAD); return [[0, 0], [1, 0], [t * Math.cos(al * RAD), t * Math.sin(al * RAD)]]; }
  function vierMet(R){
    for (var poging = 0; poging < 300; poging++){
      var al = 5 * R.heel(13, 27), be = 5 * R.heel(13, 27), ga = 5 * R.heel(13, 27), de = 360 - al - be - ga;
      if (de < 65 || de > 135) continue;
      var q = 0.5 + Math.random() * 0.6, dBC = 180 - be, C = [1 + q * Math.cos(dBC * RAD), q * Math.sin(dBC * RAD)], dCD = dBC + 180 - ga;
      var ax = Math.cos(al * RAD), ay = Math.sin(al * RAD), bx = Math.cos(dCD * RAD), by = Math.sin(dCD * RAD), det = -ax * by + bx * ay;
      if (Math.abs(det) < 1e-6) continue;
      var s = (-C[0] * by + bx * C[1]) / det, u = (ax * C[1] - ay * C[0]) / det;
      if (s < 0.45 || s > 1.4 || u < 0.35 || u > 1.4) continue;
      return { ang:[al, be, ga, de], pts:[[0, 0], [1, 0], C, [s * ax, s * ay]] };
    }
    return { ang:[90, 90, 90, 90], pts:[[0, 0], [1, 0], [1, 0.7], [0, 0.7]] };
  }
  function pijltje(x, y){ return pad('M' + (x - 6) + ' ' + (y - 7) + ' L' + (x + 4) + ' ' + y + ' L' + (x - 6) + ' ' + (y + 7), { w:2.5 }); }
  function evenwijdig(th, p, q, tp, tq){
    var y1 = 95, y2 = 205, cot = 1 / Math.tan(th * RAD), S1 = [200 + 55 * cot, y1], S2 = [200 - 55 * cot, y2], s = '', u = [Math.cos(th * RAD), -Math.sin(th * RAD)];
    var vak = [[0, th], [th, 180], [180, 180 + th], [180 + th, 360]];
    s += hoekje(S1[0], S1[1], vak[p][0], vak[p][1], { r:30, t:tp, k:K[0] }) + hoekje(S2[0], S2[1], vak[q][0], vak[q][1], { r:30, t:tq, k:K[1] });
    s += ln(20, y1, 380, y1, { w:3 }) + ln(20, y2, 380, y2, { w:3 }) + pijltje(352, y1) + pijltje(352, y2);
    s += ln(S1[0] + u[0] * 82, S1[1] + u[1] * 82, S2[0] - u[0] * 82, S2[1] - u[1] * 82, { w:3 });
    return svg(400, 300, s, 'twee evenwijdige lijnen en een snijlijn', 440);
  }

  G.push({ groep:{ id:'hoek-reken', niveau:'2F', domein:'meten', naam:'Hoeken berekenen', kd:['rw13A.e', 'rw13A.a'],
    uit:'Hoeken uitrekenen zonder te meten: met de regels voor een rechte lijn, rond een punt, in een driehoek of vierhoek en bij evenwijdige lijnen.' },
    doelen:[
      { id:'hoek-gestrekt', naam:'Hoeken op een rechte lijn', kort:'Hoeken naast elkaar op een rechte lijn zijn samen 180°',
        uit:'<p>Een rechte lijn is een <b>gestrekte hoek</b>: 180°. Staan er hoeken naast elkaar op een rechte lijn, dan zijn ze <b>samen 180°</b>.</p><p>Is de ene hoek 130°? Dan is de hoek ernaast 180 − 130 = 50°. Bij drie hoeken tel je eerst de bekende op.</p>',
        wanneer:'een lijn een rechte lijn raakt of snijdt.',
        maak:function(R){
          var h, a, b;
          if (R.heel(0, 2) === 0){ do { a = 5 * R.heel(5, 24); b = 5 * R.heel(5, 24); } while (a + b > 150); h = [a, b, 180 - a - b]; }
          else { a = 5 * R.heel(5, 31); h = [a, 180 - a]; }
          var x = R.heel(0, h.length - 1), lab = h.map(function(v, i){ return i === x ? 'x' : v + '°'; }), bek = h.filter(function(v, i){ return i !== x; }), sb = som(bek);
          var st = [{ tekst:'Hoeken op een rechte lijn zijn samen', antwoord:gr(180), eenheid:'°', hint:'Een rechte lijn is een gestrekte hoek: een halve draai.', fout:F(360, 'Dat is een hele draai, rond een punt. Een rechte lijn is een halve draai.') }];
          if (bek.length > 1) st.push({ tekst:'De bekende hoeken samen: ' + bek[0] + ' + ' + bek[1] + ' =', antwoord:gr(sb), eenheid:'°', hint:'Tel de twee hoeken op die je al weet.' });
          st.push({ tekst:'180 − ' + sb + ' =', antwoord:gr(180 - sb), eenheid:'°', hint:'Wat er van de 180° overblijft, is hoek x.' });
          var bl = rechteLijn(h, lab);
          return { vraag:'x bij ' + lab.join(', '), vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'hoek-rond', naam:'Hoeken rond een punt', kort:'Hoeken rond een punt zijn samen 360°',
        uit:'<p>Rond een punt kun je één keer helemaal ronddraaien: <b>360°</b>. Alle hoeken rond een punt zijn dus <b>samen 360°</b>.</p><p>Weet je alle hoeken behalve één? Tel de bekende op en haal ze van 360 af.</p>',
        wanneer:'er meer lijnen uit één punt komen.',
        maak:function(R){
          var h, a, b, c;
          if (R.heel(0, 1)){ do { a = 5 * R.heel(10, 30); b = 5 * R.heel(10, 30); c = 360 - a - b; } while (c < 50 || c > 200); h = [a, b, c]; }
          else { do { a = 5 * R.heel(8, 24); b = 5 * R.heel(8, 24); c = 5 * R.heel(8, 24); } while (360 - a - b - c < 40 || 360 - a - b - c > 150); h = [a, b, c, 360 - a - b - c]; }
          var x = R.heel(0, h.length - 1), lab = h.map(function(v, i){ return i === x ? 'x' : v + '°'; }), bek = h.filter(function(v, i){ return i !== x; }), sb = som(bek), rot = R.heel(0, 11) * 30;
          var bl = rondPunt(h, lab, rot);
          return { vraag:'rond ' + lab.join(', '), vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:'Hoeken rond een punt zijn samen', antwoord:gr(360), eenheid:'°', hint:'Eén keer helemaal rond.', fout:F(180, 'Dat is een rechte lijn. Rond een punt is een hele draai.') },
            { tekst:'De bekende hoeken samen: ' + bek.join(' + ') + ' =', antwoord:gr(sb), eenheid:'°', hint:'Tel de hoeken op die je al weet.' },
            { tekst:'360 − ' + sb + ' =', antwoord:gr(360 - sb), eenheid:'°', hint:'Wat er van de 360° overblijft, is hoek x.', fout:F(180 - sb, 'Rond een punt is het samen 360°, niet 180°.') }
          ] };
        } },
      { id:'hoek-overstaand', naam:'Overstaande hoeken', kort:'Tegenover elkaar: even groot. Naast elkaar: samen 180°',
        uit:'<p>Twee rechte lijnen die elkaar snijden, maken vier hoeken. Hoeken die <b>tegenover</b> elkaar liggen, heten <b>overstaande hoeken</b>. Die zijn <b>even groot</b>.</p><p>Hoeken die <b>naast</b> elkaar liggen, vormen samen een rechte lijn: <b>samen 180°</b>.</p>',
        wanneer:'twee lijnen elkaar kruisen.',
        maak:function(R){
          var a; do { a = 5 * R.heel(7, 29); } while (a === 90);
          var r0 = R.kies([-15, 0, 10, 20, -25, 5]), g = R.heel(0, 3), q = (g + R.heel(1, 3)) % 4, val = g % 2 ? 180 - a : a, tegen = (q - g + 4) % 4 === 2, x = tegen ? val : 180 - val;
          var bl = kruis(r0, a, g, q, val);
          return { vraag:'kruis ' + val + ' ' + g + q + ' ' + r0, vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Ligt hoek x tegenover de hoek van ' + val + '°, of ernaast?', tegen ? 'tegenover' : 'ernaast', [tegen ? 'ernaast' : 'tegenover'], 'Tegenover betekent: aan de andere kant van het snijpunt, met de punten naar elkaar toe.'),
            tegen ? { tekst:'Overstaande hoeken zijn even groot. x =', antwoord:gr(x), eenheid:'°', hint:'x is net zo groot als de hoek tegenover hem.', fout:F(180 - val, 'Deze hoeken liggen tegenover elkaar, niet naast elkaar. Ze zijn gelijk.') }
                  : { tekst:'Naast elkaar samen 180°: 180 − ' + val + ' =', antwoord:gr(x), eenheid:'°', hint:'De twee hoeken vormen samen een rechte lijn.', fout:F(val, 'Deze hoeken liggen naast elkaar. Alleen hoeken tegenover elkaar zijn gelijk.') }
          ] };
        } },
      { id:'hoek-driehoek', naam:'Hoeken in een driehoek', kort:'De drie hoeken van een driehoek zijn samen 180°',
        uit:'<p>Knip je de drie hoeken van een driehoek af en leg je ze naast elkaar, dan krijg je een rechte lijn. De hoeken van een driehoek zijn dus <b>samen 180°</b>.</p><p>Weet je twee hoeken? Tel ze op en haal ze van 180 af. Hoeken van 50° en 70°: de derde is 180 − 120 = 60°.</p>',
        wanneer:'je twee hoeken van een driehoek weet.',
        maak:function(R){
          var al, be, ga; do { al = 5 * R.heel(5, 20); be = 5 * R.heel(5, 20); ga = 180 - al - be; } while (ga < 25);
          var h = [al, be, ga], x = R.heel(0, 2), lab = h.map(function(v, i){ return i === x ? 'x' : v + '°'; }), bek = h.filter(function(v, i){ return i !== x; }), sb = bek[0] + bek[1];
          var bl = tekenFig(driePts(al, be), { hoek:lab, kl:[0, 1, 2].map(function(i){ return kleurX(lab, i); }), aria:'driehoek met hoeken' });
          return { vraag:'driehoek ' + lab.join(', '), vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:'De hoeken van een driehoek zijn samen', antwoord:gr(180), eenheid:'°', hint:'Leg de drie hoeken naast elkaar: dat wordt een rechte lijn.', fout:F(360, 'Dat is bij een vierhoek. Een driehoek heeft samen 180°.') },
            { tekst:'De bekende hoeken samen: ' + bek[0] + ' + ' + bek[1] + ' =', antwoord:gr(sb), eenheid:'°', hint:'Tel de twee hoeken op die erbij staan.' },
            { tekst:'180 − ' + sb + ' =', antwoord:gr(180 - sb), eenheid:'°', hint:'Wat er van de 180° overblijft, is hoek x.', fout:F(360 - sb, 'In een driehoek is het samen 180°, niet 360°.') }
          ] };
        } },
      { id:'hoek-gelijkbenig', naam:'Gelijkbenige en gelijkzijdige driehoek', kort:'Twee gelijke zijden geven twee gelijke basishoeken; gelijkzijdig: alle hoeken 60°',
        uit:'<p>Een <b>gelijkbenige</b> driehoek heeft twee even lange zijden (de benen). De twee hoeken onderaan, de <b>basishoeken</b>, zijn dan even groot. De hoek bovenaan heet de <b>tophoek</b>.</p><p>Tophoek 40°? Dan zijn de basishoeken samen 180 − 40 = 140°, dus elk 70°. In een <b>gelijkzijdige</b> driehoek zijn alle zijden gelijk en alle hoeken 180 : 3 = 60°.</p>',
        wanneer:'er streepjes op twee of drie zijden van een driehoek staan.',
        maak:function(R){
          var soort = R.kies(['top', 'top', 'basis', 'basis', 'gz']), t, b, lab, st;
          if (soort === 'top'){ t = R.kies([20, 30, 40, 50, 70, 80, 100, 110, 120, 130, 140]); b = (180 - t) / 2; lab = ['x', '', t + '°'];
            st = [{ tekst:'De twee basishoeken samen: 180 − ' + t + ' =', antwoord:gr(180 - t), eenheid:'°', hint:'Haal de tophoek van 180° af.' },
              { tekst:'Ze zijn even groot: ' + (180 - t) + ' : 2 =', antwoord:gr(b), eenheid:'°', hint:'Verdeel eerlijk over de twee basishoeken.', fout:F(180 - t, 'Dat zijn de twee basishoeken samen. Deel nog door 2.') }]; }
          else if (soort === 'basis'){ do { b = 5 * R.heel(5, 17); } while (b === 60); t = 180 - 2 * b; lab = [b + '°', '', 'x'];
            st = [{ tekst:'De andere basishoek is ook ' + b + '°. Samen: 2 × ' + b + ' =', antwoord:gr(2 * b), eenheid:'°', hint:'De twee basishoeken zijn even groot.' },
              { tekst:'De tophoek: 180 − ' + (2 * b) + ' =', antwoord:gr(t), eenheid:'°', hint:'Wat er van de 180° overblijft.', fout:F(180 - b, 'Er zijn twee basishoeken van ' + b + '°. Trek ze allebei af.') }]; }
          else { b = 60; t = 60; lab = ['x', '', ''];
            st = [kstap(R, 'Alle drie de zijden zijn even lang. Hoe zit het met de hoeken?', 'alle drie even groot', ['twee even groot', 'alle drie verschillend'], 'Gelijke zijden geven gelijke hoeken.'),
              { tekst:'180 : 3 =', antwoord:gr(60), eenheid:'°', hint:'Verdeel 180° eerlijk over drie hoeken.' }]; }
          var bl = tekenFig(driePts(b, b), { hoek:lab, kl:[K[soort === 'basis' ? 0 : 1], K[0], K[soort === 'basis' ? 1 : 0]], streep:soort === 'gz' ? [[0, 1], [1, 1], [2, 1]] : [[1, 1], [2, 1]], aria:'gelijkbenige driehoek' });
          return { vraag:soort + ' ' + lab.join(', '), vraagHtml:'Hoe groot is hoek x?', context:soort === 'gz' ? 'De driehoek is gelijkzijdig: alle zijden hebben een streepje.' : 'De driehoek is gelijkbenig: de zijden met een streepje zijn even lang.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'hoek-vierhoek', naam:'Hoeken in een vierhoek', kort:'De vier hoeken van een vierhoek zijn samen 360°',
        uit:'<p>Een vierhoek kun je met één diagonaal in <b>twee driehoeken</b> verdelen. Elke driehoek heeft 180°, dus een vierhoek heeft samen <b>2 × 180 = 360°</b>.</p><p>Weet je drie hoeken? Tel ze op en haal ze van 360 af.</p>',
        wanneer:'je drie hoeken van een vierhoek weet.',
        maak:function(R){
          var v = vierMet(R), x = R.heel(0, 3), lab = v.ang.map(function(a, i){ return i === x ? 'x' : a + '°'; }), bek = v.ang.filter(function(a, i){ return i !== x; }), sb = som(bek);
          var bl = tekenFig(v.pts, { hoek:lab, kl:[0, 1, 2, 3].map(function(i){ return kleurX(lab, i); }), aria:'vierhoek met hoeken' });
          return { vraag:'vierhoek ' + lab.join(', '), vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:'De hoeken van een vierhoek zijn samen', antwoord:gr(360), eenheid:'°', hint:'Een vierhoek is twee driehoeken: 2 × 180.', fout:F(180, 'Dat is bij een driehoek. Een vierhoek is twee driehoeken.') },
            { tekst:'De bekende hoeken samen: ' + bek.join(' + ') + ' =', antwoord:gr(sb), eenheid:'°', hint:'Tel de drie hoeken op die erbij staan.' },
            { tekst:'360 − ' + sb + ' =', antwoord:gr(360 - sb), eenheid:'°', hint:'Wat er van de 360° overblijft, is hoek x.' }
          ] };
        } },
      { id:'hoek-fz', naam:'F-hoeken en Z-hoeken', kort:'Bij evenwijdige lijnen: F-hoeken en Z-hoeken zijn gelijk',
        uit:'<p>Een lijn die twee <b>evenwijdige</b> lijnen snijdt, maakt bij elk snijpunt dezelfde hoeken. De pijltjes op de lijnen betekenen: evenwijdig.</p><p><b>F-hoeken</b> zitten op dezelfde plek bij elk snijpunt; je kunt er een F langs tekenen. <b>Z-hoeken</b> zitten tussen de evenwijdige lijnen, aan verschillende kanten van de snijlijn; je kunt er een Z langs tekenen. F-hoeken en Z-hoeken zijn <b>gelijk</b>.</p><p>Geen F en geen Z? Zoek dan eerst de F-hoek, en gebruik dat hoeken naast elkaar samen 180° zijn.</p>',
        wanneer:'een lijn twee evenwijdige lijnen snijdt.',
        maak:function(R){
          var th = R.kies([50, 55, 60, 65, 70, 110, 115, 120, 125, 130]), p = R.heel(0, 3), soort = R.kies(['F', 'Z', 'naast']), q;
          if (soort === 'Z' && p < 2) soort = 'F';
          q = soort === 'F' ? p : soort === 'Z' ? p - 2 : (p + R.kies([1, 3])) % 4;
          var val = p % 2 ? 180 - th : th, x = q % 2 ? 180 - th : th, vorm = soort === 'naast' ? 'geen van beide' : soort;
          var bl = evenwijdig(th, p, q, val + '°', 'x');
          var st = [kstap(R, 'Welke letter kun je langs de twee hoeken tekenen?', vorm, ['F', 'Z', 'geen van beide'].filter(function(v){ return v !== vorm; }), 'F: de hoeken zitten op dezelfde plek bij elk snijpunt. Z: ze zitten allebei tussen de evenwijdige lijnen, aan verschillende kanten van de schuine lijn.')];
          if (soort !== 'naast') st.push({ tekst:soort + '-hoeken zijn gelijk. x =', antwoord:gr(x), eenheid:'°', hint:'x is net zo groot als de hoek van ' + val + '°.', fout:F(180 - val, 'Deze hoeken zijn gelijk. Ze vullen elkaar niet aan tot 180°.') });
          else st.push({ tekst:'Zoek eerst de F-hoek van ' + val + '° bij het onderste snijpunt. Die is', antwoord:gr(val), eenheid:'°', hint:'Op dezelfde plek bij het onderste snijpunt zit een hoek die even groot is.' },
            { tekst:'x ligt daarnaast op een rechte lijn: 180 − ' + val + ' =', antwoord:gr(x), eenheid:'°', hint:'Hoeken naast elkaar op een rechte lijn zijn samen 180°.', fout:F(val, 'x ligt naast de F-hoek, niet op dezelfde plek. Samen zijn ze 180°.') });
          return { vraag:'fz ' + th + ' ' + p + q, vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'hoek-combi', naam:'Twee regels na elkaar', kort:'Gebruik eerst de ene regel voor een tussenhoek, en dan de volgende',
        uit:'<p>Soms heb je <b>twee regels</b> nodig. Bijvoorbeeld een driehoek met een <b>buitenhoek</b>: de zijde is verlengd, en de hoek buiten de driehoek is gegeven.</p><p>Stap 1: de buitenhoek en de hoek in de driehoek liggen op een rechte lijn, dus samen 180°. Stap 2: de hoeken in de driehoek zijn samen 180°.</p><p>Schrijf elke tussenhoek op, dan raak je het overzicht niet kwijt.</p>',
        wanneer:'je hoek x niet in één keer kunt vinden.',
        maak:function(R){
          var al, be, ga; do { al = 5 * R.heel(6, 16); be = 5 * R.heel(8, 20); ga = 180 - al - be; } while (ga < 30);
          var e = 180 - be, v1 = R.heel(0, 1) === 1, pts = driePts(al, be), E = [1.55, 0];
          var bl = tekenFig(pts, { hoek:[al + '°', '', v1 ? 'x' : ga + '°'], kl:[K[0], K[0], v1 ? K[1] : K[3]], extra:[E], aria:'driehoek met een buitenhoek',
            na:function(P, f){ var Bs = P[1], Es = f(E); return ln(Bs[0], Bs[1], Es[0], Es[1], { w:2.5, stip:'7 5' }) + hoekje(Bs[0], Bs[1], rich(Bs, Es), rich(Bs, P[2]), { r:30, t:v1 ? e + '°' : 'x', k:v1 ? K[3] : K[1] }); } });
          var st = v1 ? [
            { tekst:'De hoek in de driehoek bij de buitenhoek: 180 − ' + e + ' =', antwoord:gr(be), eenheid:'°', hint:'De buitenhoek en de hoek ernaast liggen op een rechte lijn.' },
            { tekst:'De twee hoeken onderaan samen: ' + al + ' + ' + be + ' =', antwoord:gr(al + be), eenheid:'°', hint:'Tel de hoeken van de driehoek op die je nu weet.' },
            { tekst:'x = 180 − ' + (al + be) + ' =', antwoord:gr(ga), eenheid:'°', hint:'De hoeken van een driehoek zijn samen 180°.', fout:F(180 - al - e, 'Gebruik de hoek in de driehoek, niet de buitenhoek.') } ] : [
            { tekst:'De twee bekende hoeken samen: ' + al + ' + ' + ga + ' =', antwoord:gr(al + ga), eenheid:'°', hint:'Tel de hoeken van de driehoek op die erbij staan.' },
            { tekst:'De derde hoek van de driehoek: 180 − ' + (al + ga) + ' =', antwoord:gr(be), eenheid:'°', hint:'De hoeken van een driehoek zijn samen 180°.' },
            { tekst:'De buitenhoek x: 180 − ' + be + ' =', antwoord:gr(e), eenheid:'°', hint:'x en de hoek in de driehoek liggen samen op een rechte lijn.', fout:F(be, 'Dat is de hoek in de driehoek. x ligt erbuiten, ernaast.') } ];
          return { vraag:'buiten ' + al + ' ' + (v1 ? e : ga) + (v1 ? ' a' : ' b'), vraagHtml:'Hoe groot is hoek x?', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  /* ================= figuren en symmetrie (1F) ================= */
  var VIERNAMEN = ['vierkant', 'rechthoek', 'ruit', 'parallellogram', 'trapezium', 'vlieger'];
  var VIER = {
    vierkant:{ ev:2, recht:true, gelijk:true, rot:[0, 0, 15, 45], hint:'Rechte hoeken en alle zijden even lang: dat is een vierkant.' },
    rechthoek:{ ev:2, recht:true, gelijk:false, rot:[0, 0, 10, -12, 90], hint:'Rechte hoeken, maar niet alle zijden even lang: een rechthoek.' },
    ruit:{ ev:2, recht:false, gelijk:true, rot:[0, 0, 90, 20], hint:'Alle zijden even lang, maar geen rechte hoeken: een ruit.' },
    parallellogram:{ ev:2, recht:false, gelijk:false, rot:[0, 0, 15, -10], hint:'Twee paar evenwijdige zijden, geen rechte hoeken en niet alle zijden even lang: een parallellogram.' },
    trapezium:{ ev:1, recht:false, gelijk:false, rot:[0, 0, 180, 10], hint:'Precies één paar evenwijdige zijden: een trapezium.' },
    vlieger:{ ev:0, recht:false, gelijk:false, rot:[0, 0, 90, -20, 180], hint:'Geen evenwijdige zijden, wel twee paar even lange zijden naast elkaar: een vlieger.' } };
  function vierPts(t, R){
    var k = R ? R.kies : function(l){ return l[0]; };
    if (t === 'vierkant') return { pts:[[0, 0], [1, 0], [1, 1], [0, 1]], streep:[[0, 1], [1, 1], [2, 1], [3, 1]] };
    if (t === 'rechthoek'){ var h = k([0.5, 0.45, 0.55, 0.6]); return { pts:[[0, 0], [1, 0], [1, h], [0, h]], streep:[[0, 1], [2, 1], [1, 2], [3, 2]] }; }
    if (t === 'ruit'){ var d = k([0.6, 0.55, 0.7]); return { pts:[[-0.5, 0], [0, -d / 2], [0.5, 0], [0, d / 2]], streep:[[0, 1], [1, 1], [2, 1], [3, 1]] }; }
    if (t === 'parallellogram'){ var o = k([0.3, 0.25, 0.4]), hp = k([0.5, 0.45, 0.55]); return { pts:[[0, 0], [1, 0], [1 + o, hp], [o, hp]], streep:[[0, 1], [2, 1], [1, 2], [3, 2]] }; }
    if (t === 'trapezium'){ var a = k([0.2, 0.1, 0.3]), b = k([0.7, 0.6, 0.75]); return { pts:[[0, 0], [1, 0], [b, 0.5], [a, 0.5]], streep:[] }; }
    var w = k([0.4, 0.35, 0.45]); return { pts:[[0, -0.75], [w, 0], [0, 0.3], [-w, 0]], streep:[[0, 2], [3, 2], [1, 1], [2, 1]] };
  }
  /* de kaart met alle vierhoeken en hun diagonalen */
  function vierKaart(){
    var s = '';
    VIERNAMEN.forEach(function(nm, i){
      var v = vierPts(nm), ox = (i % 3) * 136, oy = Math.floor(i / 3) * 118, t = pas(v.pts, 124, 84, 14), P = v.pts.map(function(p){ var q = t.f(p); return [q[0] + ox + 4, q[1] + oy + 4]; });
      s += ln(P[0][0], P[0][1], P[2][0], P[2][1], { w:1.5, stip:'4 4', op:0.6 }) + ln(P[1][0], P[1][1], P[3][0], P[3][1], { w:1.5, stip:'4 4', op:0.6 });
      s += figuur(P, { streep:v.streep }) + tx(ox + 66, oy + 108, nm, { fs:14, vet:true });
    });
    return svg(408, 236, s, 'de vierhoeken met hun diagonalen', 460);
  }
  var TIPS = {
    ev2:['Ik heb twee paar evenwijdige zijden.', ['vierkant', 'rechthoek', 'ruit', 'parallellogram'], 'Kijk bij elke vierhoek naar de overkanten. Bij een trapezium is maar één paar evenwijdig, bij een vlieger geen.'],
    recht:['Ik heb vier rechte hoeken.', ['vierkant', 'rechthoek'], 'Zoek de vierhoeken met een vierkantje in elke hoek.'],
    gelijk:['Al mijn zijden zijn even lang.', ['vierkant', 'ruit'], 'Zoek de vierhoeken met hetzelfde streepje op alle vier de zijden.'],
    diagGelijk:['Mijn diagonalen zijn even lang.', ['vierkant', 'rechthoek'], 'De diagonalen zijn de stippellijnen. Bij welke vierhoeken zijn ze allebei even lang?'],
    diagLood:['Mijn diagonalen snijden elkaar loodrecht.', ['vierkant', 'ruit', 'vlieger'], 'Loodrecht is in een hoek van 90°. Bij welke vierhoeken vormen de stippellijnen een recht kruis?'],
    nietRecht:['Niet al mijn hoeken zijn recht.', ['ruit', 'parallellogram', 'trapezium', 'vlieger'], 'Streep de vierhoeken met vier rechte hoeken weg.'],
    nietGelijk:['Niet al mijn zijden zijn even lang.', ['rechthoek', 'parallellogram', 'trapezium', 'vlieger'], 'Streep de vierhoeken met vier even lange zijden weg.'],
    ev1:['Ik heb precies één paar evenwijdige zijden.', ['trapezium'], 'Bij welke vierhoek is maar één paar overkanten evenwijdig?'],
    ev0:['Ik heb geen evenwijdige zijden.', ['vlieger'], 'Bij welke vierhoek lopen geen twee overkanten dezelfde kant op?'],
    midden:['Mijn diagonalen delen elkaar middendoor.', ['vierkant', 'rechthoek', 'ruit', 'parallellogram'], 'Bij een parallellogram, en alles wat erop lijkt, snijden de diagonalen elkaar precies in hun midden.'] };
  var RAADSELS = [['ev2', 'recht', 'gelijk'], ['ev2', 'recht', 'nietGelijk'], ['ev2', 'gelijk', 'nietRecht'], ['ev2', 'nietRecht', 'nietGelijk'], ['diagLood', 'gelijk', 'nietRecht'], ['diagLood', 'nietGelijk'],
    ['diagGelijk', 'gelijk'], ['diagGelijk', 'nietGelijk'], ['midden', 'diagLood', 'nietRecht'], ['midden', 'diagGelijk', 'gelijk'], ['midden', 'diagGelijk', 'nietGelijk'], ['nietRecht', 'ev1'], ['nietGelijk', 'ev0'], ['diagLood', 'recht']];
  function lijstTekst(l){ return VIERNAMEN.filter(function(n){ return l.indexOf(n) >= 0; }).join(', '); }
  /* driehoeken: hoeken bij A, B en C */
  var DRIE = { gz:[[60, 60, 60]], 'gb-s':[[70, 70, 40], [65, 65, 50], [55, 55, 70], [75, 75, 30], [50, 50, 80]], 'gb-r':[[45, 45, 90]], 'gb-st':[[40, 40, 100], [35, 35, 110], [30, 30, 120], [25, 25, 130], [20, 20, 140]],
    'og-s':[[50, 60, 70], [45, 65, 70], [40, 65, 75], [55, 80, 45], [35, 70, 75]], 'og-r':[[30, 60, 90], [35, 55, 90], [25, 65, 90], [40, 50, 90]], 'og-st':[[30, 40, 110], [25, 35, 120], [35, 45, 100], [20, 30, 130], [30, 45, 105]] };
  var COMBI = ['scherphoekig en ongelijkzijdig', 'scherphoekig en gelijkbenig', 'scherphoekig en gelijkzijdig', 'rechthoekig en gelijkbenig', 'rechthoekig en ongelijkzijdig', 'stomphoekig en gelijkbenig', 'stomphoekig en ongelijkzijdig'];
  function regel(n, start){ var l = []; for (var i = 0; i < n; i++) l.push([Math.cos((start + 360 * i / n) * RAD), Math.sin((start + 360 * i / n) * RAD)]); return l; }
  var SYM = [
    { nm:'vierkant', pts:regel(4, 45), as:[0, 90, 45, 135], c:[0, 0], rot:[0, 45, 20] },
    { nm:'rechthoek', pts:[[-0.6, -0.35], [0.6, -0.35], [0.6, 0.35], [-0.6, 0.35]], as:[0, 90], c:[0, 0], rot:[0, 0, 30, 90], fout:F(4, 'De diagonalen van een rechthoek zijn geen symmetrieassen. Vouw je langs een diagonaal, dan vallen de hoeken niet op elkaar.') },
    { nm:'ruit', pts:[[-0.6, 0], [0, -0.35], [0.6, 0], [0, 0.35]], as:[0, 90], c:[0, 0], rot:[0, 0, 25], fout:F(4, 'Vouw je een ruit verticaal of horizontaal door het midden, dan past het niet. Alleen de diagonalen zijn assen.') },
    { nm:'parallellogram', pts:[[-0.6, -0.3], [0.4, -0.3], [0.6, 0.3], [-0.4, 0.3]], as:[], c:[0, 0], rot:[0, 15], fout:F(2, 'Een parallellogram is niet lijnsymmetrisch. Vouw je hem, dan vallen de punten niet op elkaar.') },
    { nm:'gelijkbenige driehoek', pts:[[-0.45, -0.4], [0.45, -0.4], [0, 0.55]], as:[90], c:[0, 0.05], rot:[0, 90, 30] },
    { nm:'gelijkzijdige driehoek', pts:regel(3, 90), as:[90, 30, 150], c:[0, 0], rot:[0, 0, 30] },
    { nm:'regelmatige vijfhoek', pts:regel(5, 90), as:[90, 162, 54, 126, 18], c:[0, 0], rot:[0, 0, 18] },
    { nm:'regelmatige zeshoek', pts:regel(6, 90), as:[0, 30, 60, 90, 120, 150], c:[0, 0], rot:[0, 0, 15] },
    { nm:'regelmatige achthoek', pts:regel(8, 22.5), as:[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5], c:[0, 0], rot:[0] },
    { nm:'vlieger', pts:[[0, -0.6], [0.35, 0.1], [0, 0.35], [-0.35, 0.1]], as:[90], c:[0, -0.1], rot:[0, 90, 40] },
    { nm:'gelijkbenig trapezium', pts:[[-0.6, -0.3], [0.6, -0.3], [0.3, 0.3], [-0.3, 0.3]], as:[90], c:[0, 0], rot:[0, 0, 90] },
    { nm:'rechthoekige driehoek', pts:[[0, 0], [0.8, 0], [0, 0.5]], as:[], c:[0.3, 0.2], rot:[0, 30] }];
  function isRecht(a){ var m = norm360(a) % 180; return Math.abs(m) < 0.5 || Math.abs(m - 90) < 0.5 || Math.abs(m - 180) < 0.5; }
  var DRAAI = [
    { nm:'vierkant', orde:4, pts:regel(4, 45), hint:'Na elke kwartslag staat het vierkant er weer precies zo.' },
    { nm:'rechthoek', orde:2, pts:[[-0.65, -0.35], [0.65, -0.35], [0.65, 0.35], [-0.65, 0.35]], hint:'Na een halve draai staat hij er weer zo. Na een kwartslag ligt hij op zijn kant.', fout:F(4, 'Na een kwartslag staat de rechthoek rechtop: dan past hij niet.') },
    { nm:'ruit', orde:2, pts:[[-0.65, 0], [0, -0.38], [0.65, 0], [0, 0.38]], hint:'Na een halve draai past hij. Na een kwartslag staat de lange diagonaal rechtop.', fout:F(4, 'Na een kwartslag staat de ruit rechtop: dan past hij niet.') },
    { nm:'parallellogram', orde:2, pts:[[-0.6, -0.3], [0.4, -0.3], [0.6, 0.3], [-0.4, 0.3]], hint:'Een parallellogram past na een halve draai, maar niet na een kwartslag.', fout:F(1, 'Een parallellogram is niet lijnsymmetrisch, maar wel draaisymmetrisch: na een halve draai past hij.') },
    { nm:'gelijkzijdige driehoek', orde:3, pts:regel(3, 90), hint:'Bij een regelmatige figuur past hij net zo vaak als hij hoekpunten heeft.' },
    { nm:'regelmatige vijfhoek', orde:5, pts:regel(5, 90), hint:'Bij een regelmatige figuur past hij net zo vaak als hij hoekpunten heeft.' },
    { nm:'regelmatige zeshoek', orde:6, pts:regel(6, 90), hint:'Bij een regelmatige figuur past hij net zo vaak als hij hoekpunten heeft.' },
    { nm:'regelmatige achthoek', orde:8, pts:regel(8, 22.5), hint:'Bij een regelmatige figuur past hij net zo vaak als hij hoekpunten heeft.' },
    { nm:'molen met 3 wieken', orde:3, molen:3, hint:'Tel de wieken: na elke draai van één wiek naar de volgende past hij weer.' },
    { nm:'molen met 4 wieken', orde:4, molen:4, hint:'Tel de wieken: na elke draai van één wiek naar de volgende past hij weer.' },
    { nm:'molen met 5 wieken', orde:5, molen:5, hint:'Tel de wieken: na elke draai van één wiek naar de volgende past hij weer.' },
    { nm:'molen met 6 wieken', orde:6, molen:6, hint:'Tel de wieken: na elke draai van één wiek naar de volgende past hij weer.' },
    { nm:'ster met 5 punten', orde:5, ster:5, hint:'Tel de punten van de ster.' },
    { nm:'ster met 6 punten', orde:6, ster:6, hint:'Tel de punten van de ster.' }];
  function draaiFig(f, rot){
    var s = '', cx = 150, cy = 140, R1 = 110, i;
    if (f.molen){ for (i = 0; i < f.molen; i++){ var th = rot + 90 + 360 * i / f.molen; s += pg([pol(cx, cy, 14, th - 60), pol(cx, cy, R1, th), pol(cx, cy, 72, th + 32)], { f:K[0], fo:0.45, w:2.5 }); } s += cir(cx, cy, 14, { f:'var(--kaart)', w:2.5 }); }
    else if (f.ster){ var p = []; for (i = 0; i < 2 * f.ster; i++) p.push(pol(cx, cy, i % 2 ? 46 : R1, rot + 90 + 180 * i / f.ster)); s += pg(p, { f:K[0], fo:0.3, w:2.5 }); }
    else { var t = pas(f.pts.map(function(q){ return draai(q, rot); }), 300, 280, 40); s += pg(f.pts.map(function(q){ return t.f(draai(q, rot)); }), { f:K[0], fo:0.3, w:2.5 }); }
    return svg(300, 280, s + cir(cx, cy, 4, { f:'var(--ink)', s:'none', w:0 }), f.nm, 280);
  }

  G.push({ groep:{ id:'mk-figuur', niveau:'1F', domein:'meten', naam:'Figuren en symmetrie', kd:['rw13A.a', 'rw13A.d'],
    uit:'Vierhoeken en driehoeken herkennen aan hun eigenschappen, symmetrieassen tellen, spiegelen op roosterpapier en draaisymmetrie.' },
    doelen:[
      { id:'mk-vierhoek', naam:'Vierhoeken herkennen', kort:'Kijk naar evenwijdige zijden, rechte hoeken en even lange zijden',
        uit:'<p>Vierhoeken herken je aan drie dingen. Hoeveel paar <b>evenwijdige</b> zijden? Zijn de hoeken <b>recht</b>? Zijn alle zijden <b>even lang</b>?</p><p>Twee paar evenwijdig: vierkant, rechthoek, ruit of parallellogram. Eén paar: trapezium. Geen: vlieger.</p><p>Streepjes op zijden betekenen: even lang. Een vierkantje in een hoek betekent: 90°. Een vierkant is ook een rechthoek, maar je kiest de naam die het <b>meest</b> zegt.</p>',
        wanneer:'je een vierhoek een naam moet geven.',
        maak:function(R){
          var nm = R.kies(VIERNAMEN), e = VIER[nm], v = vierPts(nm, R), rot = R.kies(e.rot);
          var bl = tekenFig(v.pts.map(function(p){ return draai(p, rot); }), { streep:v.streep, W:340, H:240, aria:'een vierhoek' });
          var st = [{ tekst:'Hoeveel paar evenwijdige zijden heeft deze vierhoek?', antwoord:String(e.ev), hint:'Kijk steeds naar twee overkanten. Lopen ze dezelfde kant op, zodat ze elkaar nooit raken als je ze verlengt? Dan zijn ze evenwijdig.' }];
          if (e.ev === 2) st.push(kstap(R, 'Zijn de hoeken recht?', e.recht ? 'ja' : 'nee', [e.recht ? 'nee' : 'ja'], 'Een vierkantje in een hoek betekent 90°.'),
            kstap(R, 'Zijn alle vier de zijden even lang?', e.gelijk ? 'ja' : 'nee', [e.gelijk ? 'nee' : 'ja'], 'Zijden met hetzelfde aantal streepjes zijn even lang.'));
          if (e.ev === 0) st.push(kstap(R, 'Zijn er twee paar even lange zijden naast elkaar?', 'ja', ['nee'], 'Kijk naar de streepjes: de twee bovenste zijden zijn even lang, en de twee onderste ook.'));
          st.push(kstap(R, 'Welke naam past het best?', nm, R.hussel(VIERNAMEN.filter(function(x){ return x !== nm; })).slice(0, 3), e.hint));
          return eindKeuze({ vraag:nm + ' ' + rot + ' ' + v.pts[2].join(','), vraagHtml:'Welke vierhoek is dit?', beeld:bl, zelfBeeld:bl, stappen:st });
        } },
      { id:'mk-driehoek', naam:'Soorten driehoeken', kort:'Bekijk de grootste hoek en tel de gelijke zijden',
        uit:'<p>Een driehoek krijgt een naam naar zijn <b>hoeken</b>: alle hoeken scherp heet <b>scherphoekig</b>, een hoek van 90° <b>rechthoekig</b>, een hoek groter dan 90° <b>stomphoekig</b>. Kijk dus naar de grootste hoek.</p><p>En naar zijn <b>zijden</b>: geen gelijke zijden heet <b>ongelijkzijdig</b>, twee gelijke zijden <b>gelijkbenig</b>, drie gelijke zijden <b>gelijkzijdig</b>.</p>',
        wanneer:'je een driehoek precies wilt beschrijven.',
        maak:function(R){
          var sk = R.kies(Object.keys(DRIE)), a = R.kies(DRIE[sk]).slice();
          if (sk.indexOf('og') === 0) a = R.hussel(a);
          var mx = Math.max.apply(null, a), hs = mx < 90 ? 'scherphoekig' : mx === 90 ? 'rechthoekig' : 'stomphoekig';
          var zs = sk === 'gz' ? 'gelijkzijdig' : sk.indexOf('gb') === 0 ? 'gelijkbenig' : 'ongelijkzijdig', aantal = { ongelijkzijdig:'geen', gelijkbenig:'twee', gelijkzijdig:'drie' }[zs];
          var tegen = [a[2], a[0], a[1]], streep = [];
          if (zs === 'gelijkzijdig') streep = [[0, 1], [1, 1], [2, 1]];
          else if (zs === 'gelijkbenig') for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) if (tegen[i] === tegen[j]) streep.push([i, 1], [j, 1]);
          var bl = tekenFig(driePts(a[0], a[1]), { hoek:a.map(function(v){ return v + '°'; }), kl:[K[0], K[3], K[2]], streep:streep, aria:'een driehoek' });
          var naam = hs + ' en ' + zs, weg = zs === 'gelijkzijdig' ? ['scherphoekig en gelijkbenig'] : [];
          return eindKeuze({ vraag:'driehoek ' + a.join(','), vraagHtml:'Hoe heet deze driehoek?', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'De grootste hoek is ' + mx + '°. Wat voor driehoek is het dan?', hs, ['scherphoekig', 'rechthoekig', 'stomphoekig'].filter(function(x){ return x !== hs; }), 'Kleiner dan 90° is scherp, precies 90° is recht, groter dan 90° is stomp.'),
            kstap(R, 'Hoeveel zijden zijn even lang? Zijden met een streepje zijn even lang.', aantal, ['geen', 'twee', 'drie'].filter(function(x){ return x !== aantal; }), 'Tel de zijden met een streepje. Geen streepjes betekent: alle zijden verschillend.'),
            kstap(R, 'Hoe heet de driehoek?', naam, R.hussel(COMBI.filter(function(x){ return x !== naam && weg.indexOf(x) < 0; })).slice(0, 3), 'Eerst de naam van de hoeken (' + hs + '), dan van de zijden (' + zs + ').')
          ] });
        } },
      { id:'mk-raadsel', naam:'Eigenschappen van vierhoeken', kort:'Streep na elke eigenschap de vierhoeken weg die er niet bij passen',
        uit:'<p>Elke vierhoek heeft zijn eigen <b>eigenschappen</b>: evenwijdige zijden, rechte hoeken, even lange zijden en <b>diagonalen</b> (de lijnen van hoek naar overkant-hoek).</p><p>Bij een raadsel streep je na elke tip de vierhoeken weg die niet passen. Let op: een vierkant heeft alles van een rechthoek én van een ruit.</p><p>Gebruik de kaart met alle vierhoeken. De stippellijnen zijn de diagonalen.</p>',
        wanneer:'je moet uitleggen waarom een figuur een bepaalde vierhoek is.',
        maak:function(R){
          var rd = R.kies(RAADSELS), set = VIERNAMEN.slice(), st = [], kaart = vierKaart();
          rd.forEach(function(c, i){
            var tip = TIPS[c]; set = set.filter(function(n){ return tip[1].indexOf(n) >= 0; });
            if (i === rd.length - 1) return;
            var fout = [];
            VIERNAMEN.forEach(function(n){ if (set.indexOf(n) < 0) fout.push(lijstTekst(set.concat([n]))); else if (set.length > 1) fout.push(lijstTekst(set.filter(function(x){ return x !== n; }))); });
            st.push(kstap(R, 'Na tip ' + (i + 1) + ': welke vierhoeken kunnen het nog zijn?', lijstTekst(set), R.hussel(uniek(fout)).slice(0, 2), tip[2]));
          });
          var doel = set[0];
          st.push(kstap(R, 'Welke vierhoek ben ik?', doel, R.hussel(VIERNAMEN.filter(function(x){ return x !== doel; })).slice(0, 3), TIPS[rd[rd.length - 1]][2]));
          return eindKeuze({ vraag:'raadsel ' + rd.join('-'), vraagHtml:'Welke vierhoek ben ik?', context:rd.map(function(c, i){ return '<b>Tip ' + (i + 1) + '</b>: ' + TIPS[c][0]; }).join('<br>'), beeld:kaart, zelfBeeld:kaart, stappen:st });
        } },
      { id:'mk-symas', naam:'Symmetrieassen tellen', kort:'Vouw in gedachten: vallen de helften precies op elkaar? Dan is de vouwlijn een symmetrieas',
        uit:'<p>Een figuur is <b>lijnsymmetrisch</b> als je hem zo kunt vouwen dat de twee helften precies op elkaar vallen. De vouwlijn heet de <b>symmetrieas</b>.</p><p>Zoek eerst rechte assen: van boven naar beneden en van links naar rechts. Zoek dan schuine assen: door twee hoekpunten of door het midden van twee zijden.</p><p>Een regelmatige veelhoek heeft evenveel assen als hoeken. Een parallellogram heeft er geen.</p>',
        wanneer:'je wilt weten hoe symmetrisch een figuur is.',
        maak:function(R){
          var f = R.kies(SYM), rot = R.kies(f.rot), pts = f.pts.map(function(p){ return draai(p, rot); }), c = draai(f.c, rot), as = f.as.map(function(a){ return a + rot; });
          var recht = as.filter(isRecht), schuin = as.filter(function(a){ return !isRecht(a); });
          var bl = function(n){
            var W = 320, H = 290, t = pas(pts, W, H, 58), P = pts.map(t.f), C = t.f(c), s = pg(P, { f:K[0], fo:0.22, w:2.5 });
            if (n >= 1) recht.forEach(function(a){ s += ln(C[0] - 145 * Math.cos(a * RAD), C[1] + 145 * Math.sin(a * RAD), C[0] + 145 * Math.cos(a * RAD), C[1] - 145 * Math.sin(a * RAD), { k:K[1], w:2.5, stip:'8 6' }); });
            if (n >= 2) schuin.forEach(function(a){ s += ln(C[0] - 140 * Math.cos(a * RAD), C[1] + 140 * Math.sin(a * RAD), C[0] + 140 * Math.cos(a * RAD), C[1] - 140 * Math.sin(a * RAD), { k:K[3], w:2.5, stip:'8 6' }); });
            return svg(W, H, s, f.nm, 300);
          };
          var reg = /regelmatig|gelijkzijdig/.test(f.nm);
          return { vraag:f.nm + ' ' + rot, vraagHtml:'Hoeveel symmetrieassen heeft deze figuur?', context:'Dit is een ' + f.nm + '.', beeld:bl, zelfBeeld:bl(0), stappen:[
            { tekst:'Hoeveel symmetrieassen lopen recht: precies van boven naar beneden of van links naar rechts?', antwoord:String(recht.length), hint:'Vouw in gedachten langs een staande lijn en langs een liggende lijn door het midden. Vallen de helften precies op elkaar?' },
            { tekst:'Hoeveel schuine symmetrieassen zijn er?', antwoord:String(schuin.length), hint:'Probeer schuine vouwlijnen door twee hoekpunten, of door het midden van twee zijden.' + (reg ? ' Een regelmatige veelhoek heeft evenveel assen als hoeken.' : '') },
            { tekst:'Samen: ' + recht.length + ' + ' + schuin.length + ' =', antwoord:String(as.length), hint:'Tel de rechte en de schuine assen op.', fout:f.fout || {} }
          ] };
        } },
      { id:'mk-spiegel', naam:'Spiegelen op roosterpapier', kort:'Tel de hokjes tot de spiegellijn, en ga even ver door aan de andere kant',
        uit:'<p>Bij <b>spiegelen</b> klap je een figuur om over de <b>spiegellijn</b>. Elk punt komt aan de andere kant, <b>even ver</b> van de lijn, recht tegenover zichzelf.</p><p>Op roosterpapier tel je de hokjes van het punt tot de lijn. Daarna tel je hetzelfde aantal hokjes door aan de andere kant. Het beeld van A heet <b>A′</b> (spreek uit: A-accent).</p>',
        wanneer:'je een figuur moet spiegelen in een lijn.',
        maak:function(R){
          var staand = R.heel(0, 1) === 1, m = R.heel(3, 7), max = Math.min(m, 10 - m), zij = R.kies([-1, 1]), pts, opp;
          do {
            pts = [0, 1, 2].map(function(){ var d = R.heel(1, max), w = R.heel(1, 9); return staand ? [m + zij * d, w] : [w, m + zij * d]; });
            opp = Math.abs((pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[1][1] - pts[0][1]) * (pts[2][0] - pts[0][0]));
          } while (opp < 4);
          var A = pts[0], dA = Math.abs((staand ? A[0] : A[1]) - m), beeldA = staand ? [2 * m - A[0], A[1]] : [A[0], 2 * m - A[1]], sp = function(p){ return staand ? [2 * m - p[0], p[1]] : [p[0], 2 * m - p[1]]; };
          var bl = function(n){
            var g = rooster(10), s = g.s, P = pts.map(function(p){ return [g.X(p[0]), g.Y(p[1])]; });
            s += staand ? ln(g.X(m), g.Y(0) + 6, g.X(m), g.Y(10) - 6, { k:K[1], w:3.5, stip:'10 6' }) : ln(g.X(0) - 6, g.Y(m), g.X(10) + 6, g.Y(m), { k:K[1], w:3.5, stip:'10 6' });
            s += pg(P, { f:K[0], fo:0.25, s:K[0], w:2.5 }) + stip(P[0][0], P[0][1], K[0], 'A');
            if (n >= 1) s += staand ? ln(P[0][0], P[0][1], g.X(m), P[0][1], { k:K[2], w:4 }) : ln(P[0][0], P[0][1], P[0][0], g.Y(m), { k:K[2], w:4 });
            if (n >= 3){ var Q = pts.map(sp).map(function(p){ return [g.X(p[0]), g.Y(p[1])]; }); s += pg(Q, { f:K[3], fo:0.2, s:K[3], w:2.5, stip:'6 4' }); }
            if (n >= 2) s += (staand ? ln(g.X(m), P[0][1], g.X(beeldA[0]), P[0][1], { k:K[2], w:4 }) : ln(P[0][0], g.Y(m), P[0][0], g.Y(beeldA[1]), { k:K[2], w:4 })) + stip(g.X(beeldA[0]), g.Y(beeldA[1]), K[3], 'A′');
            return svg(g.w, g.h, s, 'driehoek en spiegellijn op roosterpapier', 380);
          };
          var as = staand ? 'x' : 'y', kant = staand ? (beeldA[0] > m ? 'rechts' : 'links') : (beeldA[1] > m ? 'omhoog' : 'omlaag');
          return { vraag:'spiegel A' + punt(A[0], A[1]) + ' in ' + as + ' = ' + m, vraagHtml:'Waar komt A′?', context:'Spiegel de driehoek in de ' + (staand ? 'staande' : 'liggende') + ' lijn ' + as + ' = ' + m + '. Schrijf het punt als (x, y).',
            antwoord:punt(beeldA[0], beeldA[1]), controle:puntC(beeldA[0], beeldA[1]), beeld:bl, zelfBeeld:bl(0), stappen:[
              { tekst:'Hoeveel hokjes ligt A van de spiegellijn?', antwoord:String(dA), hint:'Tel recht naar de lijn toe. A heeft ' + as + ' = ' + (staand ? A[0] : A[1]) + ' en de lijn ligt bij ' + as + ' = ' + m + '.' },
              { tekst:'A′ ligt even ver aan de andere kant. Welke ' + as + ' heeft A′?', antwoord:String(staand ? beeldA[0] : beeldA[1]), hint:'Vanaf de lijn nog ' + dA + ' hokjes ' + kant + ': ' + m + (/rechts|omhoog/.test(kant) ? ' + ' : ' − ') + dA + '.', fout:F(staand ? A[0] : A[1], 'Dat is A zelf. Het beeld ligt aan de andere kant van de lijn.') },
              { tekst:'Het beeld A′ is het punt', antwoord:punt(beeldA[0], beeldA[1]), controle:puntC(beeldA[0], beeldA[1]), hint:'De ' + (staand ? 'y' : 'x') + ' blijft hetzelfde: ' + (staand ? A[1] : A[0]) + '. Schrijf eerst x, dan y: (x, y).' }
            ] };
        } },
      { id:'mk-draaisym', naam:'Draaisymmetrie', kort:'Tel hoe vaak de figuur op zichzelf past in één hele draai, en deel 360° daardoor',
        uit:'<p>Een figuur is <b>draaisymmetrisch</b> als hij na een stukje draaien om het midden weer precies op zichzelf past.</p><p>Tel hoe vaak dat gebeurt in één hele draai. Dat heet de <b>orde</b>. De kleinste <b>draaihoek</b> is 360° gedeeld door de orde. Een vierkant past 4 keer: 360 : 4 = 90°.</p>',
        wanneer:'je een logo, wiel of patroon bekijkt.',
        maak:function(R){
          var f = R.kies(DRAAI), rot = R.kies([0, 0, 10, 20, 35]), bl = draaiFig(f, rot);
          return { vraag:f.nm + ' ' + rot, vraagHtml:'Wat is de kleinste draaihoek?', context:'Dit is een ' + f.nm + '. Hij draait om het midden.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:'Hoe vaak past de figuur precies op zichzelf bij één hele draai?', antwoord:String(f.orde), hint:f.hint, fout:f.fout || {} },
            { tekst:'De kleinste draaihoek: 360 : ' + f.orde + ' =', antwoord:gr(360 / f.orde), eenheid:'°', hint:'Een hele draai is 360°. Verdeel die in ' + f.orde + ' gelijke stukken.' }
          ] };
        } }
    ] });

  /* ================= verschuiven, draaien en vergroten (2F) ================= */
  function beweging(dx, dy){
    var d = [];
    if (dx) d.push(Math.abs(dx) + ' naar ' + (dx > 0 ? 'rechts' : 'links'));
    if (dy) d.push(Math.abs(dy) + ' ' + (dy > 0 ? 'omhoog' : 'omlaag'));
    return d.join(' en ');
  }
  function binnen(p){ return p[0] >= 0 && p[0] <= 10 && p[1] >= 0 && p[1] <= 10; }
  function pijl(x1, y1, x2, y2, kl){
    var L = Math.hypot(x2 - x1, y2 - y1) || 1, u = [(x2 - x1) / L, (y2 - y1) / L];
    return ln(x1, y1, x2, y2, { k:kl, w:3.5 }) + pad('M' + n1(x2 - u[0] * 11 - u[1] * 6) + ' ' + n1(y2 - u[1] * 11 + u[0] * 6) + ' L' + n1(x2) + ' ' + n1(y2) + ' L' + n1(x2 - u[0] * 11 + u[1] * 6) + ' ' + n1(y2 - u[1] * 11 - u[0] * 6), { s:kl, w:3.5 });
  }
  function paral(p, q, al, k, oud, nieuw){
    var c = Math.cos(al * RAD), sn = Math.sin(al * RAD), w = p + q * c, gap = Math.max(2, 0.45 * w);
    var A = [[0, 0], [p, 0], [p + q * c, q * sn], [q * c, q * sn]], B = A.map(function(v){ return [w + gap + v[0] * k, v[1] * k]; });
    var t = pas(A.concat(B), 400, 230, 46), PA = A.map(t.f), PB = B.map(t.f);
    return svg(400, 230, figuur(PA, oud) + figuur(PB, nieuw), 'een figuur en zijn vergroting', 460);
  }

  G.push({ groep:{ id:'mk-transf', niveau:'2F', domein:'meten', naam:'Verschuiven, draaien en vergroten', kd:['rw13A.d'],
    uit:'Figuren verplaatsen op een rooster en vergroten of verkleinen met een factor. Bij verschuiven en draaien blijft de figuur even groot; bij vergroten blijft de vorm hetzelfde.' },
    doelen:[
      { id:'mk-verschuif', naam:'Verschuiven op een rooster', kort:'Naar rechts of links verandert de x, omhoog of omlaag verandert de y',
        uit:'<p>Bij <b>verschuiven</b> gaat elk punt van de figuur even ver dezelfde kant op. De figuur draait niet en blijft even groot.</p><p>Een punt schrijf je als (x, y): eerst opzij, dan omhoog. <b>Naar rechts</b> komt erbij bij de x, naar links gaat eraf. <b>Omhoog</b> komt erbij bij de y, omlaag gaat eraf.</p><p>P(2, 3) drie naar rechts en één omlaag wordt P′(5, 2).</p>',
        wanneer:'je een figuur op een rooster moet verplaatsen.',
        maak:function(R){
          var P, dx, dy, o1, o2, pts, nw, opp, rk = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
          do {
            P = [R.heel(1, 9), R.heel(1, 9)]; dx = R.kies(rk); dy = R.kies(rk); o1 = [R.heel(-3, 3), R.heel(-3, 3)]; o2 = [R.heel(-3, 3), R.heel(-3, 3)];
            pts = [P, [P[0] + o1[0], P[1] + o1[1]], [P[0] + o2[0], P[1] + o2[1]]]; nw = pts.map(function(p){ return [p[0] + dx, p[1] + dy]; });
            opp = Math.abs(o1[0] * o2[1] - o1[1] * o2[0]);
          } while (opp < 3 || !pts.concat(nw).every(binnen));
          var Q = nw[0], bw = beweging(dx, dy);
          var bl = function(n){
            var g = rooster(10), s = g.s, f = function(p){ return [g.X(p[0]), g.Y(p[1])]; }, A = pts.map(f), B = nw.map(f);
            s += pg(A, { f:K[0], fo:0.25, s:K[0], w:2.5 }) + stip(A[0][0], A[0][1], K[0], 'P');
            if (n >= 1) s += pijl(A[0][0], A[0][1], g.X(Q[0]), A[0][1], K[2]);
            if (n >= 2) s += pijl(g.X(Q[0]), A[0][1], B[0][0], B[0][1], K[2]) + stip(B[0][0], B[0][1], K[3], 'P′');
            if (n >= 3) s += pg(B, { f:K[3], fo:0.2, s:K[3], w:2.5, stip:'6 4' });
            return svg(g.w, g.h, s, 'driehoek op een rooster', 380);
          };
          return { vraag:'P' + punt(P[0], P[1]) + ' ' + bw, vraagHtml:'Waar komt P′?', context:'Verschuif de driehoek ' + bw + '. Schrijf P′ als (x, y).', antwoord:punt(Q[0], Q[1]), controle:puntC(Q[0], Q[1]), beeld:bl, zelfBeeld:bl(0), stappen:[
            { tekst:Math.abs(dx) + ' naar ' + (dx > 0 ? 'rechts' : 'links') + ': de x wordt ' + P[0] + (dx > 0 ? ' + ' : ' − ') + Math.abs(dx) + ' =', antwoord:String(Q[0]), hint:(dx > 0 ? 'Naar rechts komt erbij.' : 'Naar links gaat eraf.') + ' De x van P is ' + P[0] + '.', fout:F(P[0] - dx, 'Verkeerde kant op. ' + (dx > 0 ? 'Naar rechts wordt de x groter.' : 'Naar links wordt de x kleiner.')) },
            { tekst:Math.abs(dy) + ' ' + (dy > 0 ? 'omhoog' : 'omlaag') + ': de y wordt ' + P[1] + (dy > 0 ? ' + ' : ' − ') + Math.abs(dy) + ' =', antwoord:String(Q[1]), hint:(dy > 0 ? 'Omhoog komt erbij.' : 'Omlaag gaat eraf.') + ' De y van P is ' + P[1] + '.', fout:F(P[1] - dy, 'Verkeerde kant op. ' + (dy > 0 ? 'Omhoog wordt de y groter.' : 'Omlaag wordt de y kleiner.')) },
            { tekst:'P′ is het punt', antwoord:punt(Q[0], Q[1]), controle:puntC(Q[0], Q[1]), hint:'Eerst de x, dan de y, tussen haakjes met een komma ertussen.' }
          ] };
        } },
      { id:'mk-draai', naam:'Een kwartslag draaien om een punt', kort:'Kijk hoe je van het draaipunt naar het punt komt, en draai die beweging een kwartslag',
        uit:'<p>Bij <b>draaien</b> draait de figuur om een vast punt: het <b>draaipunt</b> C. Elk punt blijft even ver van C.</p><p>Zo draai je een punt P een kwartslag: kijk hoe je van C naar P loopt, bijvoorbeeld 3 naar rechts en 1 omhoog. Draai die beweging. <b>Linksom</b> (tegen de klok in) wordt rechts: omhoog, en omhoog: links. Dus 3 omhoog en 1 naar links.</p>',
        wanneer:'je een figuur een kwartslag moet draaien.',
        maak:function(R){
          var C = [R.heel(3, 7), R.heel(3, 7)], dx, dy;
          do { dx = R.heel(-3, 3); dy = R.heel(-3, 3); } while (!dx && !dy);
          var links = R.heel(0, 1) === 1, nd = links ? [-dy, dx] : [dy, -dx], ad = links ? [dy, -dx] : [-dy, dx], P = [C[0] + dx, C[1] + dy], Q = [C[0] + nd[0], C[1] + nd[1]];
          var b0 = beweging(dx, dy), b1 = beweging(nd[0], nd[1]);
          var f1 = uniek([beweging(dy, dx), beweging(-dx, dy), beweging(dx, -dy), beweging(-dx, -dy)]).filter(function(x){ return x && x !== b0; });
          var f2 = uniek([beweging(ad[0], ad[1]), beweging(-dx, -dy), beweging(dy, dx), b0]).filter(function(x){ return x && x !== b1; });
          var kant = links ? 'linksom (tegen de klok in)' : 'rechtsom (met de klok mee)';
          var bl = function(n){
            var g = rooster(10), s = g.s, Cs = [g.X(C[0]), g.Y(C[1])], Ps = [g.X(P[0]), g.Y(P[1])], Qs = [g.X(Q[0]), g.Y(Q[1])];
            if (n >= 1) s += ln(Cs[0], Cs[1], g.X(P[0]), Cs[1], { k:K[0], w:3 }) + ln(g.X(P[0]), Cs[1], Ps[0], Ps[1], { k:K[0], w:3 });
            if (n >= 2){
              s += ln(Cs[0], Cs[1], g.X(Q[0]), Cs[1], { k:K[3], w:3 }) + ln(g.X(Q[0]), Cs[1], Qs[0], Qs[1], { k:K[3], w:3 });
              var r = Math.hypot(Ps[0] - Cs[0], Ps[1] - Cs[1]), aP = rich(Cs, Ps);
              s += pad(links ? boogPad(Cs[0], Cs[1], r, aP, aP + 90) : boogPad(Cs[0], Cs[1], r, aP - 90, aP), { s:K[2], w:2.5, stip:'6 5' }) + stip(Qs[0], Qs[1], K[3], 'P′');
            }
            s += stip(Cs[0], Cs[1], K[1], 'C') + stip(Ps[0], Ps[1], K[0], 'P');
            return svg(g.w, g.h, s, 'punt P en draaipunt C', 380);
          };
          return { vraag:'C' + punt(C[0], C[1]) + ' P' + punt(P[0], P[1]) + (links ? ' linksom' : ' rechtsom'), vraagHtml:'Waar komt P′?', context:'Draai punt P een kwartslag ' + kant + ' om punt C. Schrijf P′ als (x, y).', antwoord:punt(Q[0], Q[1]), controle:puntC(Q[0], Q[1]), beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'Hoe loop je van C naar P?', b0, R.hussel(f1).slice(0, 2), 'Begin bij C. Tel eerst de hokjes opzij en dan de hokjes omhoog of omlaag tot P.'),
            kstap(R, 'Draai die beweging een kwartslag ' + (links ? 'linksom' : 'rechtsom') + '. Hoe loop je dan van C naar P′?', b1, R.hussel(f2).slice(0, 2), links ? 'Linksom wordt rechts: omhoog, omhoog: links, links: omlaag en omlaag: rechts.' : 'Rechtsom wordt rechts: omlaag, omlaag: links, links: omhoog en omhoog: rechts.'),
            { tekst:'P′ is het punt', antwoord:punt(Q[0], Q[1]), controle:puntC(Q[0], Q[1]), hint:'Begin bij C' + punt(C[0], C[1]) + ' en loop ' + b1 + '.' }
          ] };
        } },
      { id:'mk-vergroot', naam:'Vergroten en verkleinen met een factor', kort:'Zoek de factor met nieuw : oud, doe alle lengtes keer de factor, en laat de hoeken gelijk',
        uit:'<p>Bij <b>vergroten</b> worden alle lengtes even veel keer zo groot. Dat getal heet de <b>factor</b>. Een factor kleiner dan 1, zoals 0,5, is <b>verkleinen</b>.</p><p>De factor vind je met <b>nieuw : oud</b>. Daarna doe je elke andere lengte keer de factor. Let op: je telt er niet hetzelfde bij op.</p><p>De <b>hoeken</b> blijven bij vergroten en verkleinen gelijk.</p>',
        wanneer:'je een tekening groter of kleiner maakt, zoals een plattegrond of een foto.',
        maak:function(R){
          var k = R.kies([2, 3, 1.5, 2.5, 0.5, 4]), p, q, al, hoekVr = R.heel(0, 2) === 0;
          var opties = k === 0.5 ? [4, 6, 8] : k === 4 ? [2, 3, 4] : [2, 3, 4, 5, 6, 7, 8];
          do { p = R.kies(opties); q = R.kies(opties); } while (p === q && R.heel(0, 1));
          al = hoekVr ? R.kies([50, 55, 60, 65, 70, 75]) : R.kies([55, 60, 65, 70, 90, 90]);
          var kp = r6(k * p), kq = r6(k * q), wat = k > 1 ? 'vergroting' : 'verkleining';
          var oud = { zijde:[p + ' cm', '', '', q + ' cm'], hoek:hoekVr ? [al + '°', '', '', ''] : null, namen:['A', '', '', ''] };
          var nw = { zijde:[T(kp) + ' cm', '', '', hoekVr ? '' : '?'], hoek:hoekVr ? ['?', '', '', ''] : null, kl:[K[1]], namen:['A′', '', '', ''], vul:K[3] };
          var bl = paral(p, q, al, k, oud, nw);
          var st = [{ tekst:'De factor: ' + T(kp) + ' : ' + p + ' =', antwoord:T(k), hint:'Hoeveel keer zo groot is de onderkant geworden? Deel nieuw door oud.', fout:F(T(r6(kp - p)), 'Je trok af. Bij vergroten gaat het om keer, niet om erbij.') }];
          if (hoekVr) st.push({ tekst:'Bij vergroten en verkleinen blijven de hoeken gelijk. Hoek A′ =', antwoord:gr(al), eenheid:'°', hint:'Alleen de lengtes veranderen. De vorm, en dus de hoeken, blijven hetzelfde.', fout:F(T(r6(al * k)), 'Hoeken worden niet groter of kleiner. Alleen de lengtes gaan keer de factor.') });
          else st.push({ tekst:'De schuine zijde: ' + q + ' × ' + T(k) + ' =', antwoord:metE(T(kq), 'cm'), eenheid:'cm', hint:'Elke lengte gaat keer de factor ' + T(k) + '.', fout:F(T(r6(q + kp - p)), 'Je telde er hetzelfde bij als bij de onderkant. Bij vergroten doe je keer de factor.') });
          return { vraag:wat + ' ' + p + '-' + q + '-' + al + ' x' + T(k) + (hoekVr ? ' hoek' : ''), vraagHtml:hoekVr ? 'Hoe groot is hoek A′?' : 'Hoe lang is de zijde met het vraagteken?', context:'De rechter figuur is een ' + wat + ' van de linker.', eenheid:hoekVr ? '°' : 'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  /* ================= ruimtefiguren (2F) ================= */
  /* schuine projectie: diepte z gaat schuin naar rechtsboven */
  function proj(p){ return [p[0] + 0.45 * p[2], p[1] + 0.3 * p[2]]; }
  function veelvlak(V, Fc, o){
    o = o || {};
    var G0 = [0, 0, 0], vv = [-0.45, -0.3, 1], zicht = [], rand = {}, s = '';
    V.forEach(function(p){ G0[0] += p[0] / V.length; G0[1] += p[1] / V.length; G0[2] += p[2] / V.length; });
    Fc.forEach(function(f, i){
      var a = V[f[0]], b = V[f[1]], c = V[f[2]], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      var nn = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], m = [0, 0, 0];
      f.forEach(function(j){ m[0] += V[j][0] / f.length; m[1] += V[j][1] / f.length; m[2] += V[j][2] / f.length; });
      if (nn[0] * (m[0] - G0[0]) + nn[1] * (m[1] - G0[1]) + nn[2] * (m[2] - G0[2]) < 0) nn = [-nn[0], -nn[1], -nn[2]];
      zicht[i] = nn[0] * vv[0] + nn[1] * vv[1] + nn[2] * vv[2] < -1e-9;
      f.forEach(function(j, t){ var k2 = f[(t + 1) % f.length], key = Math.min(j, k2) + '-' + Math.max(j, k2); (rand[key] = rand[key] || []).push(i); });
    });
    var t = pas(V.map(proj), o.W || 300, o.H || 250, 30), P = V.map(function(p){ return t.f(proj(p)); });
    Fc.forEach(function(f, i){ if (zicht[i]) s += pg(f.map(function(j){ return P[j]; }), { f:K[0], fo:0.1 + 0.1 * (i % 3), s:'none', w:0 }); });
    Object.keys(rand).forEach(function(key){ if (!rand[key].some(function(i){ return zicht[i]; })){ var e = key.split('-'); s += ln(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { w:1.8, stip:'6 5', op:0.7 }); } });
    Object.keys(rand).forEach(function(key){ if (rand[key].some(function(i){ return zicht[i]; })){ var e = key.split('-'); s += ln(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { w:2.5 }); } });
    if (o.punten) P.forEach(function(p){ s += cir(p[0], p[1], 4.5, { f:K[1], s:'none', w:0 }); });
    return svg(o.W || 300, o.H || 250, s, o.aria || 'ruimtefiguur', 300);
  }
  function prisma(n, h, th0, sx, o){
    var V = [], Fc = [[], []], i;
    for (i = 0; i < n; i++){ var a = (th0 + 360 * i / n) * RAD; V.push([sx * Math.cos(a), 0, Math.sin(a)]); }
    for (i = 0; i < n; i++) V.push([V[i][0], h, V[i][2]]);
    for (i = 0; i < n; i++){ Fc[0].push(i); Fc[1].push(n + i); Fc.push([i, (i + 1) % n, n + (i + 1) % n, n + i]); }
    return veelvlak(V, Fc, o);
  }
  function piramide(n, h, th0, o){
    var V = [], Fc = [[]], i;
    for (i = 0; i < n; i++){ var a = (th0 + 360 * i / n) * RAD; V.push([Math.cos(a), 0, Math.sin(a)]); Fc[0].push(i); }
    V.push([0, h, 0]);
    for (i = 0; i < n; i++) Fc.push([i, (i + 1) % n, n]);
    return veelvlak(V, Fc, o);
  }
  function rondLijf(soort){
    var cx = 150, s = '', vul = { f:K[0], fo:0.18, s:'none', w:0 };
    function half(cy, rx, ry, voor, o){ return pad('M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 ' + (voor ? 0 : 1) + ' ' + (cx + rx) + ' ' + cy, o); }
    if (soort === 'cilinder'){
      s += pad('M' + (cx - 70) + ' 70 L' + (cx - 70) + ' 200 A70 22 0 0 0 ' + (cx + 70) + ' 200 L' + (cx + 70) + ' 70 Z', vul) + ell(cx, 70, 70, 22, { f:K[0], fo:0.3, w:2.5 });
      s += half(200, 70, 22, false, { w:1.8, stip:'6 5', op:0.6 }) + half(200, 70, 22, true, { w:2.5 }) + ln(cx - 70, 70, cx - 70, 200, { w:2.5 }) + ln(cx + 70, 70, cx + 70, 200, { w:2.5 });
    } else if (soort === 'kegel'){
      s += pad('M' + cx + ' 40 L' + (cx - 75) + ' 200 A75 24 0 0 0 ' + (cx + 75) + ' 200 Z', vul);
      s += half(200, 75, 24, false, { w:1.8, stip:'6 5', op:0.6 }) + half(200, 75, 24, true, { w:2.5 }) + ln(cx, 40, cx - 75, 200, { w:2.5 }) + ln(cx, 40, cx + 75, 200, { w:2.5 });
    } else {
      s += cir(cx, 125, 92, { f:K[0], fo:0.18, w:2.5 }) + half(125, 92, 24, false, { w:1.8, stip:'6 5', op:0.6 }) + half(125, 92, 24, true, { w:2 });
    }
    return svg(300, 250, s, soort, 300);
  }
  var LICHAAM = [
    { nm:'kubus', gebogen:false, top:false, teken:function(){ return prisma(4, Math.SQRT2, -45, 1); } },
    { nm:'balk', gebogen:false, top:false, teken:function(R){ return prisma(4, R.kies([0.8, 1, 1.9]), -45, R.kies([1.7, 2.2])); } },
    { nm:'prisma', gebogen:false, top:false, teken:function(R){ return R.heel(0, 1) ? prisma(3, R.kies([1.3, 1.8]), -90, 1) : prisma(6, 1.4, -90, 1); } },
    { nm:'piramide', gebogen:false, top:true, teken:function(R){ return R.heel(0, 1) ? piramide(4, R.kies([1.4, 1.8]), -45) : piramide(3, 1.6, -90); } },
    { nm:'cilinder', gebogen:true, plat:2, teken:function(){ return rondLijf('cilinder'); } },
    { nm:'kegel', gebogen:true, plat:1, teken:function(){ return rondLijf('kegel'); } },
    { nm:'bol', gebogen:true, plat:0, teken:function(){ return rondLijf('bol'); } }];
  var LNAMEN = ['kubus', 'balk', 'prisma', 'piramide', 'cilinder', 'kegel', 'bol'];
  /* blokkenbouwsels: H[rij][kolom], rij 0 is achter */
  function plattegrond(H, o){
    o = o || {};
    var cs = 44, x0 = o.x || 16, y0 = o.y || 16, s = '', r, c;
    for (r = 0; r < H.length; r++) for (c = 0; c < H[0].length; c++){
      var nad = (o.kol != null && o.kol === c) || (o.rij != null && o.rij === r);
      s += rc(x0 + c * cs, y0 + r * cs, cs, cs, { f:nad ? K[2] : 'var(--kaart)', fo:nad ? 0.3 : 1, w:2 }) + tx(x0 + c * cs + cs / 2, y0 + r * cs + cs / 2, String(H[r][c]), { mid:true, fs:20, vet:true });
    }
    s += tx(x0 + H[0].length * cs / 2, y0 + H.length * cs + 22, 'voorkant', { fs:14 });
    return s;
  }
  function blok3d(H, x0, y0, sz){
    var rows = H.length, cols = H[0].length, dx = 0.5 * sz, dy = 0.35 * sz, s = '', mx = 0, r, l, c;
    H.forEach(function(rij){ rij.forEach(function(v){ mx = Math.max(mx, v); }); });
    for (r = 0; r < rows; r++){ var d = rows - 1 - r; for (l = 0; l < mx; l++) for (c = 0; c < cols; c++) if (H[r][c] > l){
      var X = x0 + c * sz + d * dx, Y = y0 - l * sz - d * dy;
      [[[X, Y - sz], [X + sz, Y - sz], [X + sz + dx, Y - sz - dy], [X + dx, Y - sz - dy]], [[X + sz, Y], [X + sz + dx, Y - dy], [X + sz + dx, Y - sz - dy], [X + sz, Y - sz]], [[X, Y], [X + sz, Y], [X + sz, Y - sz], [X, Y - sz]]].forEach(function(f, i){
        s += pg(f, { f:'var(--kaart)', s:'none', w:0 }) + pg(f, { f:K[0], fo:[0.15, 0.5, 0.32][i], w:1.6 });
      });
    } }
    return s;
  }
  function maakH(R){ var rows = R.heel(2, 3), H = []; for (var r = 0; r < rows; r++){ var rij = []; for (var c = 0; c < 3; c++) rij.push(R.heel(1, 3)); H.push(rij); } return H; }
  var RIJNAAM = { 2:['achter', 'voor'], 3:['achter', 'midden', 'voor'] };
  /* uitslagen: vouwen over een kubus */
  function vouw(cel){
    var idx = {}, st = [], rij = [0];
    cel.forEach(function(c, i){ idx[c[0] + ',' + c[1]] = i; });
    function neg(v){ return [-v[0], -v[1], -v[2]]; }
    st[0] = { n:[0, 0, -1], r:[1, 0, 0], u:[0, 1, 0] };
    while (rij.length){
      var i0 = rij.shift(), c = cel[i0], s = st[i0];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){
        var j = idx[(c[0] + d[0]) + ',' + (c[1] + d[1])], t;
        if (j == null || st[j]) return;
        if (d[0] === 1) t = { n:s.r, r:neg(s.n), u:s.u };
        else if (d[0] === -1) t = { n:neg(s.r), r:s.n, u:s.u };
        else if (d[1] === 1) t = { n:s.u, r:s.r, u:neg(s.n) };
        else t = { n:neg(s.u), r:s.r, u:s.n };
        st[j] = t; rij.push(j);
      });
    }
    return st.map(function(x){ return x.n.join(','); });
  }
  function groei(R, maxB){
    for (;;){
      var cel = [[0, 0]];
      while (cel.length < 6){ var c = R.kies(cel), d = R.kies([[1, 0], [-1, 0], [0, 1], [0, -1]]), nw = [c[0] + d[0], c[1] + d[1]]; if (!cel.some(function(x){ return x[0] === nw[0] && x[1] === nw[1]; })) cel.push(nw); }
      var mx = Math.min.apply(null, cel.map(function(x){ return x[0]; })), my = Math.min.apply(null, cel.map(function(x){ return x[1]; }));
      cel = cel.map(function(x){ return [x[0] - mx, x[1] - my]; }).sort(function(a, b){ return a[1] - b[1] || a[0] - b[0]; });
      var w = Math.max.apply(null, cel.map(function(x){ return x[0]; })) + 1, h = Math.max.apply(null, cel.map(function(x){ return x[1]; })) + 1;
      if (w <= maxB[0] && h <= maxB[1]) return cel;
    }
  }
  function isNet(cel){ return uniek(vouw(cel)).length === 6; }
  function heeftVierkant(cel){ return cel.some(function(c){ return [[1, 0], [0, 1], [1, 1]].every(function(d){ return cel.some(function(x){ return x[0] === c[0] + d[0] && x[1] === c[1] + d[1]; }); }); }); }
  function netSleutel(cel){ return cel.map(function(c){ return c.join(''); }).join('.'); }

  G.push({ groep:{ id:'mk-ruimte', niveau:'2F', domein:'meten', naam:'Ruimtefiguren', kd:['rw13A.c', 'rw13A.b'],
    uit:'Ruimtefiguren herkennen en tellen, blokkenbouwsels en aanzichten, uitslagen van een kubus en een balk, en kijklijnen: wat kun je wel en niet zien?' },
    doelen:[
      { id:'mk-ruimte-naam', naam:'Ruimtefiguren herkennen', kort:'Gebogen of niet? Een top of niet? Dan weet je bijna altijd welke figuur het is',
        uit:'<p>Ruimtefiguren met <b>gebogen</b> vlakken zijn de <b>cilinder</b> (twee platte rondjes), de <b>kegel</b> (één plat rondje en een punt) en de <b>bol</b> (geen plat vlak).</p><p>Zonder gebogen vlakken: loopt hij naar één punt, de <b>top</b>? Dan is het een <b>piramide</b>. Is hij boven en onder hetzelfde? Dan is het een <b>prisma</b>. Een <b>balk</b> is een prisma met alleen rechthoeken, een <b>kubus</b> een balk met alleen vierkanten.</p><p>Stippellijnen zijn ribben die je van voren niet kunt zien.</p>',
        wanneer:'je een voorwerp of tekening een wiskundige naam moet geven.',
        maak:function(R){
          var L = R.kies(LICHAAM), bl = L.teken(R), weg = L.nm === 'kubus' ? ['balk', 'prisma'] : L.nm === 'balk' ? ['prisma'] : [];
          var st = [kstap(R, 'Heeft de figuur een gebogen vlak?', L.gebogen ? 'ja' : 'nee', [L.gebogen ? 'nee' : 'ja'], 'Kijk of je ergens een ronde rand of een bolle kant ziet.')];
          if (L.gebogen) st.push(kstap(R, 'Hoeveel platte vlakken heeft hij?', String(L.plat), ['0', '1', '2'].filter(function(x){ return x !== String(L.plat); }), 'Een plat vlak is helemaal vlak, zoals een tafelblad. Een cilinder heeft er boven en onder een.'));
          else st.push(kstap(R, 'Loopt de figuur naar één punt, een top?', L.top ? 'ja' : 'nee', [L.top ? 'nee' : 'ja'], 'Een piramide loopt naar een top. Een prisma, balk of kubus is boven en onder hetzelfde.'));
          st.push(kstap(R, 'Hoe heet deze figuur?', L.nm, R.hussel(LNAMEN.filter(function(x){ return x !== L.nm && weg.indexOf(x) < 0; })).slice(0, 3),
            L.gebogen ? 'Gebogen met twee platte vlakken: cilinder. Met één plat vlak en een punt: kegel. Zonder plat vlak: bol.' : L.top ? 'Hij loopt naar een top: een piramide.' : L.nm === 'kubus' ? 'Alle vlakken zijn even grote vierkanten: een kubus.' : L.nm === 'balk' ? 'Alle vlakken zijn rechthoeken, maar niet allemaal even groot: een balk.' : 'Boven en onder hetzelfde vlak, en dat is geen rechthoek: een prisma.'));
          return eindKeuze({ vraag:L.nm + ' ' + bl.length + ' ' + R.heel(1, 3), vraagHtml:'Welke ruimtefiguur is dit?', beeld:bl, zelfBeeld:bl, stappen:st });
        } },
      { id:'mk-ruimte-tel', naam:'Vlakken, ribben en hoekpunten tellen', kort:'Tel de hoeken van het grondvlak en reken de rest uit',
        uit:'<p>Een <b>vlak</b> is een kant van de figuur, een <b>ribbe</b> is een rand, een <b>hoekpunt</b> is een punt waar ribben samenkomen.</p><p>Tellen gaat makkelijker als je het <b>grondvlak</b> gebruikt. Heeft het grondvlak n hoeken, dan heeft een <b>prisma</b> n + 2 vlakken, 3 × n ribben en 2 × n hoekpunten. Een <b>piramide</b> heeft n + 1 vlakken, 2 × n ribben en n + 1 hoekpunten.</p>',
        wanneer:'je een ruimtefiguur precies wilt beschrijven.',
        maak:function(R){
          var n = R.heel(3, 6), pr = R.heel(0, 1) === 1, wat = R.kies(['vlakken', 'ribben', 'hoekpunten']), th0 = n === 4 ? -45 : -90;
          var bl = pr ? prisma(n, R.kies([1.3, 1.6]), th0, 1, { punten:wat === 'hoekpunten' }) : piramide(n, 1.6, th0, { punten:wat === 'hoekpunten' });
          var st = [{ tekst:'Hoeveel hoeken heeft het grondvlak?', antwoord:String(n), hint:pr ? 'Kijk naar het bovenvlak: het grondvlak onderaan is precies hetzelfde.' : 'Het grondvlak is het vlak onderaan. Tel ook de hoek achter, bij de stippellijnen.' }], uit;
          if (pr){
            if (wat === 'vlakken'){ uit = n + 2; st.push({ tekst:n + ' zijvlakken, plus boven en onder: ' + n + ' + 2 =', antwoord:String(uit), hint:'Bij elke zijde van het grondvlak hoort één zijvlak.' }); }
            else if (wat === 'ribben'){ uit = 3 * n; st.push({ tekst:'De ribben van het grondvlak en het bovenvlak: 2 × ' + n + ' =', antwoord:String(2 * n), hint:'Onder ' + n + ' ribben en boven ook ' + n + '.' }, { tekst:'Plus de ' + n + ' staande ribben: ' + 2 * n + ' + ' + n + ' =', antwoord:String(uit), hint:'Bij elk hoekpunt van het grondvlak gaat één ribbe omhoog.' }); }
            else { uit = 2 * n; st.push({ tekst:n + ' hoekpunten onder en ' + n + ' boven: 2 × ' + n + ' =', antwoord:String(uit), hint:'Boven en onder hebben evenveel hoekpunten.' }); }
          } else {
            if (wat === 'vlakken'){ uit = n + 1; st.push({ tekst:'Het grondvlak plus ' + n + ' schuine zijvlakken: 1 + ' + n + ' =', antwoord:String(uit), hint:'Bij elke zijde van het grondvlak hoort een driehoek naar de top.' }); }
            else if (wat === 'ribben'){ uit = 2 * n; st.push({ tekst:n + ' ribben in het grondvlak en ' + n + ' naar de top: ' + n + ' + ' + n + ' =', antwoord:String(uit), hint:'Van elk hoekpunt van het grondvlak gaat één ribbe naar de top.' }); }
            else { uit = n + 1; st.push({ tekst:'De hoekpunten van het grondvlak plus de top: ' + n + ' + 1 =', antwoord:String(uit), hint:'De top is ook een hoekpunt.' }); }
          }
          st[st.length - 1].antwoord = metE(String(uit), wat);
          return { vraag:(pr ? 'prisma ' : 'piramide ') + n + ' ' + wat, vraagHtml:'Hoeveel ' + wat + '?', context:'Dit is een ' + (pr ? 'prisma' : 'piramide') + '. Hoeveel ' + wat + ' heeft hij?', eenheid:wat, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'mk-blokjes', naam:'Blokjes tellen met een plattegrond', kort:'Op de plattegrond staat per vakje hoeveel blokjes erop staan: tel per rij op',
        uit:'<p>Bij een bouwsel van blokjes zie je niet alle blokjes: sommige zitten verstopt. Daarom gebruik je een <b>plattegrond</b>: het bovenaanzicht met in elk vakje een <b>getal</b>. Dat getal zegt hoeveel blokjes er op elkaar staan.</p><p>Tel de getallen per rij op, en dan alle rijen samen.</p>',
        wanneer:'je wilt weten hoeveel blokjes er in een bouwsel zitten.',
        maak:function(R){
          var H = maakH(R), nm = RIJNAAM[H.length], sommen = H.map(som), st = [];
          H.forEach(function(rij, r){ st.push({ tekst:'Rij ' + nm[r] + ': ' + rij.join(' + ') + ' =', antwoord:String(sommen[r]), hint:'Tel de getallen in de rij ' + nm[r] + ' op de plattegrond op.' }); });
          st.push({ tekst:'Samen: ' + sommen.join(' + ') + ' =', antwoord:metE(String(som(sommen)), 'blokjes'), hint:'Tel de rijen op.', fout:F(3 * H.length, 'Je telde de vakjes. Elk getal zegt hoeveel blokjes er op elkaar staan.') });
          var bl = function(n){ return svg(370, 210, plattegrond(H, { rij:n >= 1 && n <= H.length ? n - 1 : null, y:30 }) + blok3d(H, 200, 190 - (3 - H.length) * 10, 34), 'plattegrond en bouwsel', 420); };
          return { vraag:'blokjes ' + H.map(function(r){ return r.join(''); }).join('-'), vraagHtml:'Hoeveel blokjes zijn het?', context:'Links de plattegrond, rechts het bouwsel. Sommige blokjes zie je niet.', eenheid:'blokjes', beeld:bl, zelfBeeld:bl(0), stappen:st };
        } },
      { id:'mk-aanzicht', naam:'Vooraanzicht en zijaanzicht', kort:'In elke kolom zie je alleen de hoogste stapel: neem per kolom het hoogste getal',
        uit:'<p>Een <b>aanzicht</b> is wat je ziet als je recht van één kant kijkt. Het <b>bovenaanzicht</b> is de plattegrond. Bij het <b>vooraanzicht</b> kijk je van de voorkant.</p><p>Van voren zie je in elke kolom alleen de <b>hoogste stapel</b>: de lagere stapels erachter vallen erachter weg. Neem dus per kolom het hoogste getal. Bij het <b>zijaanzicht</b> van rechts doe je hetzelfde per rij.</p>',
        wanneer:'je een bouwsel van een kant moet tekenen of beschrijven.',
        maak:function(R){
          var H = maakH(R), voor = R.heel(0, 1) === 1, nm = RIJNAAM[H.length], hts = [], st = [], i;
          if (voor) for (i = 0; i < 3; i++){ var kol = H.map(function(r){ return r[i]; }); hts.push(Math.max.apply(null, kol)); st.push({ tekst:'Kolom ' + (i + 1) + ' van links: de hoogste stapel is', antwoord:String(hts[i]), hint:'In kolom ' + (i + 1) + ' staan de getallen ' + kol.join(', ') + '. Je ziet alleen de hoogste.', fout:F(som(kol), 'Je telde de kolom op. Van voren zie je alleen de hoogste stapel.') }); }
          else for (i = H.length - 1; i >= 0; i--){ hts.push(Math.max.apply(null, H[i])); st.push({ tekst:'Rij ' + nm[i] + ': de hoogste stapel is', antwoord:String(hts[hts.length - 1]), hint:'In de rij ' + nm[i] + ' staan de getallen ' + H[i].join(', ') + '. Van rechts zie je alleen de hoogste.', fout:F(som(H[i]), 'Je telde de rij op. Van opzij zie je alleen de hoogste stapel.') }); }
          st.push({ tekst:'Hoeveel vierkantjes heeft het ' + (voor ? 'vooraanzicht' : 'zijaanzicht') + '? ' + hts.join(' + ') + ' =', antwoord:metE(String(som(hts)), 'vierkantjes'), hint:'Tel de hoogtes van alle kolommen in het aanzicht op.' });
          var bl = function(n){
            var s = plattegrond(H, { kol:voor && n < 3 ? n : null, rij:!voor && n < H.length ? H.length - 1 - n : null, y:30 }), x0 = 200, base = 180, j, l;
            s += voor ? pijl(16 + 66, 30 + H.length * 44 + 44, 16 + 66, 30 + H.length * 44 + 28, K[1]) : pijl(16 + 132 + 34, 30 + H.length * 22, 16 + 132 + 10, 30 + H.length * 22, K[1]);
            for (j = 0; j < Math.min(n, hts.length); j++) for (l = 0; l < hts[j]; l++) s += rc(x0 + j * 32, base - (l + 1) * 32, 32, 32, { f:K[3], fo:0.35, w:2 });
            s += tx(x0 + 48, base + 22, voor ? 'vooraanzicht' : 'zijaanzicht', { fs:14 });
            return svg(370, 220, s, 'plattegrond en aanzicht', 420);
          };
          return { vraag:(voor ? 'voor ' : 'zij ') + H.map(function(r){ return r.join(''); }).join('-'), vraagHtml:'Hoeveel vierkantjes heeft het ' + (voor ? 'vooraanzicht' : 'zijaanzicht') + '?', context:'Dit is de plattegrond van een bouwsel. Je kijkt ' + (voor ? 'recht van de voorkant' : 'recht van de rechterkant') + ' (de pijl).', eenheid:'vierkantjes', beeld:bl, zelfBeeld:bl(0), stappen:st };
        } },
      { id:'mk-uitslag-tegen', naam:'Uitslag van een kubus: wat ligt tegenover?', kort:'In een rechte rij van drie vlakjes liggen het eerste en het derde tegenover elkaar',
        uit:'<p>Een <b>uitslag</b> is een ruimtefiguur die je openknipt en plat neerlegt. Een kubus heeft een uitslag van zes vierkantjes.</p><p>Welk vlak ligt <b>tegenover</b> een ander vlak? Zoek een <b>rechte rij van drie</b> vlakjes. Bij het vouwen gaat het middelste omhoog, en het derde vlakje komt precies tegenover het eerste.</p><p>Vlakjes die naast elkaar liggen, liggen nooit tegenover elkaar.</p>',
        wanneer:'je een dobbelsteen of doos in gedachten wilt vouwen.',
        maak:function(R){
          var cel, nrm, kand, i, keuzes;
          var at = function(x, y){ for (var j = 0; j < cel.length; j++) if (cel[j][0] === x && cel[j][1] === y) return j; return -1; };
          do {
            cel = groei(R, [5, 4]); keuzes = [];
            if (!isNet(cel)) continue;
            cel.forEach(function(c, j){ var k2 = []; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var m = at(c[0] + d[0], c[1] + d[1]), e = at(c[0] + 2 * d[0], c[1] + 2 * d[1]); if (m >= 0 && e >= 0) k2.push([m, e]); }); if (k2.length) keuzes.push([j, k2]); });
          } while (!keuzes.length);
          nrm = vouw(cel);
          kand = R.kies(keuzes); i = kand[0];
          var lt = R.hussel(['A', 'B', 'C', 'D', 'E', 'F']), mid = uniek(kand[1].map(function(x){ return lt[x[0]]; })), eind = lt[kand[1][0][1]];
          var tegen = cel.map(function(c, j){ return j; }).filter(function(j){ return nrm[j] === nrm[i].split(',').map(function(v){ return String(-v); }).join(','); })[0];
          eind = lt[tegen];
          var fout = {}; mid.forEach(function(m){ fout[m.toLowerCase()] = 'Dat is het middelste vlakje. Dat ligt naast ' + lt[i] + '. Neem het vlakje erna.'; });
          var bl = function(n){
            var cs = 50, x0 = 20, y0 = 16, s = '';
            cel.forEach(function(c, j){
              var kl = j === i ? K[0] : (n >= 2 && j === tegen) ? K[1] : (n >= 1 && kand[1].some(function(x){ return x[0] === j; })) ? K[3] : null;
              s += rc(x0 + c[0] * cs, y0 + c[1] * cs, cs, cs, { f:kl || 'var(--kaart)', fo:kl ? 0.35 : 1, w:2.5 }) + tx(x0 + c[0] * cs + cs / 2, y0 + c[1] * cs + cs / 2, lt[j], { mid:true, fs:22, vet:true });
            });
            return svg(x0 * 2 + 5 * cs, y0 * 2 + 4 * cs, s, 'uitslag van een kubus', 330);
          };
          return { vraag:'tegenover ' + lt[i] + ' ' + netSleutel(cel) + lt.join(''), vraagHtml:'Welk vlak ligt tegenover ' + lt[i] + '?', context:'Dit is een uitslag van een kubus. Je vouwt hem dicht.', invoer:'tekst', beeld:bl, zelfBeeld:bl(0), stappen:[
            { tekst:'Zoek een rechte rij van drie vlakjes die begint bij ' + lt[i] + '. Welk vlakje zit in het midden?', antwoord:mid, invoer:'tekst', hint:'Ga vanaf ' + lt[i] + ' recht naar links, rechts, boven of onder. Er moeten twee vlakjes achter elkaar liggen.' },
            { tekst:'Het derde vlakje van die rij komt tegenover ' + lt[i] + '. Welk vlakje is dat?', antwoord:eind, invoer:'tekst', hint:'Neem het vlakje aan het eind van je rij van drie.', fout:fout }
          ] };
        } },
      { id:'mk-uitslag-welk', naam:'Welke uitslag is een kubus?', kort:'Vouw in gedachten: komt elk vlakje op een andere kant, dan is het een kubus',
        uit:'<p>Niet elke figuur van zes vierkantjes vouwt tot een kubus. Vouw in gedachten: komt elk vlakje op een <b>andere kant</b>, dan klopt het. Komen er <b>twee vlakjes op dezelfde plek</b>, dan niet.</p><p>Handige regels: vier vlakjes in een <b>vierkant</b> (2 bij 2) kan nooit. Vijf of zes op een rij ook niet. Een rij van vier met aan elke kant één vlakje kan altijd.</p>',
        wanneer:'je een doos wilt maken van karton.',
        maak:function(R){
          var goed, f1, f2;
          do { goed = groei(R, [4, 4]); } while (!isNet(goed));
          do { f1 = groei(R, [4, 4]); } while (isNet(f1));
          do { f2 = groei(R, [4, 4]); } while (isNet(f2) || netSleutel(f2) === netSleutel(f1));
          var nets = R.hussel([goed, f1, f2]), g = nets.indexOf(goed);
          var botst = nets.map(function(cel){ var nn = vouw(cel); return cel.map(function(c, j){ return nn.filter(function(x){ return x === nn[j]; }).length > 1; }); });
          function hint(k){ var c = nets[k]; return isNet(c) ? 'Vouw uitslag ' + (k + 1) + ' in gedachten: elk vlakje komt op een andere kant van de kubus.' : heeftVierkant(c) ? 'In uitslag ' + (k + 1) + ' liggen vier vlakjes in een vierkant. Dat kun je niet om een kubus vouwen.' : 'Vouw uitslag ' + (k + 1) + ' in gedachten: twee vlakjes komen op dezelfde plek, en een kant blijft open.'; }
          var bl = function(n){
            var cs = 28, s = '';
            nets.forEach(function(cel, k){
              var x0 = 12 + k * 132, y0 = 14;
              cel.forEach(function(c, j){
                var kl = (n > k && k < 2) || n >= 3 ? (k === g ? K[3] : botst[k][j] ? K[1] : null) : null;
                s += rc(x0 + c[0] * cs, y0 + c[1] * cs, cs, cs, { f:kl || 'var(--kaart)', fo:kl ? 0.45 : 1, w:2 });
              });
              s += tx(x0 + 2 * cs, y0 + 4 * cs + 24, 'uitslag ' + (k + 1), { fs:16, vet:true });
            });
            return svg(400, 164, s, 'drie uitslagen', 460);
          };
          var opt = ['uitslag 1', 'uitslag 2', 'uitslag 3'];
          var st = [0, 1].map(function(k){ var ok = k === g; return kstap(R, 'Vouwt uitslag ' + (k + 1) + ' tot een kubus?', ok ? 'ja' : 'nee', [ok ? 'nee' : 'ja'], hint(k)); });
          st.push({ tekst:'Welke uitslag vouwt tot een kubus?', opties:opt, goed:g, hint:hint(g) });
          return eindKeuze({ vraag:'welke ' + nets.map(netSleutel).join(' '), vraagHtml:'Welke uitslag vouwt tot een kubus?', context:'Precies één van deze uitslagen kun je vouwen tot een kubus.', beeld:bl, zelfBeeld:bl(0), stappen:st });
        } },
      { id:'mk-uitslag-balk', naam:'De uitslag van een balk', kort:'Een balk heeft drie paar gelijke vlakken: reken elk paar uit en tel op',
        uit:'<p>De uitslag van een balk bestaat uit <b>zes rechthoeken</b>, in <b>drie paren</b>: voor en achter, boven en onder, links en rechts. De twee vlakken van een paar zijn even groot.</p><p>De oppervlakte van de uitslag is hoeveel karton je nodig hebt. Reken elk paar uit (2 × lengte × breedte van één vlak) en tel de drie paren op.</p>',
        wanneer:'je wilt weten hoeveel karton, papier of verf je nodig hebt voor een doos.',
        maak:function(R){
          var l = R.heel(8, 20), b = R.heel(3, 8), h = R.heel(3, 10), A = 2 * l * h, B = 2 * l * b, C = 2 * b * h, tot = A + B + C;
          var bl = function(n){
            var u = Math.min(300 / (2 * b + l), 330 / (2 * b + 2 * h)), x0 = 40, y0 = 30, s = '';
            var vl = [['boven', b, 0, l, b, K[2], 2], ['voor', b, b, l, h, K[0], 1], ['onder', b, b + h, l, b, K[2], 2], ['achter', b, 2 * b + h, l, h, K[0], 1], ['links', 0, b, b, h, K[3], 3], ['rechts', b + l, b, b, h, K[3], 3]];
            vl.forEach(function(v){ var aan = n >= v[6]; s += rc(x0 + v[1] * u, y0 + v[2] * u, v[3] * u, v[4] * u, { f:aan ? v[5] : 'var(--kaart)', fo:aan ? 0.35 : 1, w:2 }); if (v[3] * u > 44 && v[4] * u > 22) s += tx(x0 + (v[1] + v[3] / 2) * u, y0 + (v[2] + v[4] / 2) * u, v[0], { mid:true, fs:14, op:0.75 }); });
            s += tx(x0 + (b + l / 2) * u, y0 - 9, l + ' cm', { vet:true }) + tx(x0 + b * u / 2, y0 + b * u - 9, b + ' cm', { vet:true }) + tx(x0 - 6, y0 + (b + h / 2) * u, h + ' cm', { vet:true, a:'end', mid:true });
            return svg(x0 + (2 * b + l) * u + 20, y0 + (2 * b + 2 * h) * u + 12, s, 'uitslag van een balk', 380);
          };
          return { vraag:'doos ' + l + ' × ' + b + ' × ' + h, vraagHtml:'Hoeveel cm² karton?', context:'Een doos is ' + l + ' cm lang, ' + b + ' cm breed en ' + h + ' cm hoog. Hoeveel cm² karton zit er in de uitslag? Plakranden tellen niet mee.', eenheid:'cm²', beeld:bl, zelfBeeld:bl(0), stappen:[
            { tekst:'Voor- en achterkant: 2 × ' + l + ' × ' + h + ' =', antwoord:metE(String(A), 'cm²'), eenheid:'cm²', hint:'Eén vlak is ' + l + ' bij ' + h + ': ' + (l * h) + ' cm². Er zijn er twee.' },
            { tekst:'Boven- en onderkant: 2 × ' + l + ' × ' + b + ' =', antwoord:metE(String(B), 'cm²'), eenheid:'cm²', hint:'Eén vlak is ' + l + ' bij ' + b + ': ' + (l * b) + ' cm². Er zijn er twee.' },
            { tekst:'Linker- en rechterkant: 2 × ' + b + ' × ' + h + ' =', antwoord:metE(String(C), 'cm²'), eenheid:'cm²', hint:'Eén vlak is ' + b + ' bij ' + h + ': ' + (b * h) + ' cm². Er zijn er twee.' },
            { tekst:'Samen: ' + A + ' + ' + B + ' + ' + C + ' =', antwoord:metE(String(tot), 'cm²'), eenheid:'cm²', hint:'Tel de drie paren op.', fout:F(l * b * h, 'Dat is de inhoud van de doos. Hier gaat het om de oppervlakte van alle zes de vlakken.', tot / 2, 'Je telde elk vlak maar één keer. Een balk heeft zes vlakken.') }
          ] };
        } },
      { id:'mk-kijklijn', naam:'Kijklijnen', kort:'Trek lijnen van het oog langs de randen van de muur: daarachter zie je niets',
        uit:'<p>Een <b>kijklijn</b> is een rechte lijn vanaf je oog. Wat achter een muur staat, kun je niet altijd zien.</p><p>Trek twee kijklijnen: vanaf de persoon langs <b>allebei de uiteinden</b> van de muur. Het gebied achter de muur, tussen die twee lijnen, is de <b>dode hoek</b>: daar kun je niets zien. Alles daarbuiten zie je wel.</p>',
        wanneer:'je wilt weten wat iemand achter een muur, auto of gebouw wel of niet kan zien.',
        maak:function(R){
          var P = [R.heel(130, 270), 336], wy = 236, ww = R.heel(70, 110), wx = R.heel(Math.max(60, P[0] - 120), Math.min(330 - ww, P[0] + 40)), pts, verb;
          function snij(p){ return P[0] + (p[0] - P[0]) * (P[1] - wy) / (P[1] - p[1]); }
          function staat(p){ var x = snij(p); return x > wx + 12 && x < wx + ww - 12 ? 1 : (x < wx - 14 || x > wx + ww + 14) ? 0 : -1; }
          do {
            pts = [0, 1, 2].map(function(){ return [R.heel(30, 370), R.heel(40, 180)]; });
            verb = pts.map(staat);
          } while (verb.filter(function(v){ return v === 1; }).length !== 1 || verb.indexOf(-1) >= 0 || pts.some(function(p, i){ return pts.some(function(q, j){ return i < j && Math.hypot(p[0] - q[0], p[1] - q[1]) < 50; }); }));
          var lt = ['A', 'B', 'C'], weg = lt[verb.indexOf(1)];
          var bl = function(n){
            var s = '';
            if (n >= 1){
              var e1 = [wx, wy], e2 = [wx + ww, wy], top = 16, f = function(e){ return P[0] + (e[0] - P[0]) * (P[1] - top) / (P[1] - wy); };
              s += pg([e1, e2, [f(e2), top], [f(e1), top]], { f:K[1], fo:0.12, s:'none', w:0 }) + ln(P[0], P[1], f(e1), top, { k:K[1], w:2, stip:'7 5' }) + ln(P[0], P[1], f(e2), top, { k:K[1], w:2, stip:'7 5' });
            }
            s += ln(wx, wy, wx + ww, wy, { w:9 }) + tx(wx + ww / 2, wy + 24, 'muur', { fs:14 });
            pts.forEach(function(p, i){ s += stip(p[0], p[1], K[0], lt[i]); });
            s += cir(P[0], P[1], 10, { f:K[3], s:'none', w:0 }) + tx(P[0] + 16, P[1] + 6, 'P', { a:'start', vet:true, fs:17, k:K[3] });
            return svg(400, 356, s, 'bovenaanzicht met een muur', 420).replace('style="max-width:420px"', 'style="max-width:420px;overflow:hidden"');
          };
          return eindKeuze({ vraag:'kijklijn ' + P[0] + ' ' + wx + ' ' + pts.map(function(p){ return p.join(','); }).join(' '), vraagHtml:'Welk punt kan P niet zien?', context:'Je kijkt van bovenaf. P staat voor een muur.', beeld:bl, zelfBeeld:bl(0), stappen:[
            { tekst:'Trek twee kijklijnen: van P langs het linker- en het rechteruiteinde van de muur. Achter de muur, tussen die lijnen, kan P niets zien.', info:true },
            kstap(R, 'Ligt A achter de muur, tussen de kijklijnen?', verb[0] ? 'ja' : 'nee', [verb[0] ? 'nee' : 'ja'], 'Kijk of A in het gekleurde gebied ligt.'),
            kstap(R, 'Ligt B achter de muur, tussen de kijklijnen?', verb[1] ? 'ja' : 'nee', [verb[1] ? 'nee' : 'ja'], 'Kijk of B in het gekleurde gebied ligt.'),
            kstap(R, 'Welk punt kan P niet zien?', weg, lt.filter(function(x){ return x !== weg; }), 'Het punt in het gekleurde gebied achter de muur.')
          ] });
        } }
    ] });

  /* ================= de stelling van Pythagoras (3F) ================= */
  var TRIPELS = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [20, 21, 29], [15, 20, 25], [10, 24, 26]];
  function benen(R){
    if (R.heel(0, 2) === 0){ var t = R.kies(TRIPELS); return R.heel(0, 1) ? [t[0], t[1]] : [t[1], t[0]]; }
    var a, b; do { a = R.heel(3, 15); b = R.heel(3, 15); } while (a / b > 2.5 || b / a > 2.5);
    return [a, b];
  }
  /* rechthoekige driehoek met de rechte hoek bij punt 0: zijde 0 = a, zijde 1 = schuine zijde, zijde 2 = b */
  function rhd(a, b, lab, rot, o){
    o = o || {};
    var pts = [[0, 0], [a, 0], [0, b]].map(function(p){ return draai(p, rot || 0); });
    return tekenFig(pts, { zijde:lab, namen:o.namen, W:o.W || 340, H:o.H || 240, m:46, aria:'rechthoekige driehoek', max:o.max });
  }
  function wortelHint(x){ return 'Gebruik de wortelknop: √' + T(r6(x)) + ' = ' + T(Math.sqrt(x), { dec:4 }) + (Math.abs(Math.sqrt(x) - Math.round(Math.sqrt(x))) < 1e-9 ? '.' : '… Rond af op 1 decimaal.'); }
  function wStap(tekst, x, e, extraFout){ var c = Math.sqrt(x), exact = Math.abs(c - Math.round(c)) < 1e-9; return { tekst:tekst + (exact ? ' =' : ' ≈'), antwoord:rond(c, e), eenheid:e, hint:wortelHint(x), fout:extraFout || F(T(r6(x)), 'Je vergat de wortel te nemen.') }; }

  G.push({ groep:{ id:'mk-pyth', niveau:'3F', domein:'meten', naam:'De stelling van Pythagoras', kd:['rw13A.a', 'rw17A.a'],
    uit:'In een rechthoekige driehoek geldt: a² + b² = c², met c de schuine zijde. Daarmee reken je een zijde uit als je de andere twee weet, en controleer je of een hoek recht is.' },
    doelen:[
      { id:'mk-pyth-kwadraat', naam:'Kwadraat en wortel', kort:'Een kwadraat is een getal keer zichzelf; de wortel gaat terug',
        uit:'<p>Het <b>kwadraat</b> van een getal is dat getal keer zichzelf. 7² = 7 × 7 = 49. Het is de oppervlakte van een vierkant met zijde 7.</p><p>De <b>wortel</b> (√) gaat terug: √49 is het getal dat keer zichzelf 49 is, dus 7.</p><p>Is het geen mooi getal, zoals √50? Die ligt tussen 7 (want 7² = 49) en 8 (want 8² = 64). De rekenmachine geeft 7,07…</p>',
        wanneer:'je Pythagoras gaat gebruiken: daar heb je kwadraten en wortels nodig.',
        maak:function(R){
          var t = R.heel(0, 2), n, m, f;
          if (t === 0){ n = R.heel(3, 20);
            return { vraag:n + '² =', stappen:[
              kstap(R, 'Wat betekent ' + n + '²?', n + ' × ' + n, [n + ' × 2', n + ' + ' + n], 'Het kleine 2-tje betekent: het getal keer zichzelf.'),
              { tekst:n + ' × ' + n + ' =', antwoord:String(n * n), hint:'Reken ' + n + ' keer ' + n + ' uit.', fout:F(2 * n, 'Dat is ' + n + ' × 2. Een kwadraat is ' + n + ' × ' + n + '.') } ] }; }
          if (t === 1){ n = R.heel(2, 15); m = n * n;
            return { vraag:'√' + m + ' =', stappen:[
              kstap(R, 'Wat betekent √' + m + '?', 'het getal dat keer zichzelf ' + m + ' is', [m + ' gedeeld door 2', m + ' keer ' + m], 'De wortel is het omgekeerde van een kwadraat.'),
              { tekst:'Welk getal keer zichzelf is ' + m + '?', antwoord:String(n), hint:'Probeer: ' + (n - 1) + ' × ' + (n - 1) + ' = ' + (n - 1) * (n - 1) + '. Is dat te klein? Probeer een getal hoger.', fout:F(T(m / 2), 'Je deelde door 2. De wortel is het getal dat keer zichzelf ' + m + ' is.') } ] }; }
          do { m = R.heel(10, 200); f = Math.floor(Math.sqrt(m)); } while (f * f === m);
          return { vraag:'√' + m + ' ≈', context:'Rond af op 1 decimaal.', stappen:[
            { tekst:'Het kwadraat net onder ' + m + ' is', antwoord:String(f * f), hint:'Probeer ' + f + ' × ' + f + ' en ' + (f + 1) + ' × ' + (f + 1) + '.' },
            { tekst:'Dus √' + m + ' ligt tussen ' + f + ' en', antwoord:String(f + 1), hint:(f + 1) + ' × ' + (f + 1) + ' = ' + (f + 1) * (f + 1) + ', en dat is meer dan ' + m + '.' },
            { tekst:'De rekenmachine geeft √' + m + ' = ' + T(Math.sqrt(m), { dec:5 }) + '… Afgerond op 1 decimaal:', antwoord:rond(Math.sqrt(m)), hint:'Kijk naar het tweede cijfer na de komma. Is dat 5 of meer, dan rond je naar boven af.' } ] };
        } },
      { id:'mk-pyth-schuin', naam:'De schuine zijde berekenen', kort:'Kwadrateer de twee rechthoekszijden, tel op en neem de wortel',
        uit:'<p>In een <b>rechthoekige driehoek</b> heet de zijde tegenover de rechte hoek de <b>schuine zijde</b>. Het is altijd de langste zijde. De andere twee heten <b>rechthoekszijden</b>.</p><p>De stelling van Pythagoras: <b>a² + b² = c²</b>. Zijden van 6 en 8: 36 + 64 = 100, en √100 = 10. De schuine zijde is 10.</p><p>Komt er geen mooi getal uit? Rond af op 1 decimaal.</p>',
        wanneer:'je de twee rechthoekszijden weet en de schuine zijde zoekt.',
        maak:function(R){
          var ab = benen(R), a = ab[0], b = ab[1], e = R.kies(['cm', 'm']), s2 = a * a + b * b, rot = R.kies([0, 0, 90, 180, 270, 30]);
          var bl = rhd(a, b, [a + ' ' + e, '?', b + ' ' + e], rot);
          return { vraag:'schuin ' + a + ' en ' + b + ' ' + e, vraagHtml:'Hoe lang is de schuine zijde?', context:'De rechthoekszijden zijn ' + a + ' ' + e + ' en ' + b + ' ' + e + '. Rond af op 1 decimaal.', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:a + '² =', antwoord:String(a * a), hint:a + ' × ' + a + '.', fout:F(2 * a, 'Kwadraat is keer zichzelf: ' + a + ' × ' + a + '.') },
            { tekst:b + '² =', antwoord:String(b * b), hint:b + ' × ' + b + '.', fout:F(2 * b, 'Kwadraat is keer zichzelf: ' + b + ' × ' + b + '.') },
            { tekst:'Schuine zijde in het kwadraat: ' + (a * a) + ' + ' + (b * b) + ' =', antwoord:String(s2), hint:'Voor de schuine zijde tel je de kwadraten op.' },
            wStap('Schuine zijde = √' + s2, s2, e, F(s2, 'Je vergat de wortel te nemen.', a + b, 'Zo werkt het niet: eerst kwadrateren, dan optellen, dan de wortel.'))
          ] };
        } },
      { id:'mk-pyth-tabel', naam:'Pythagoras met een tabel', kort:'Zet de zijden en hun kwadraten in een tabel; de schuine zijde staat onderaan',
        uit:'<p>Met een <b>tabel</b> houd je overzicht. Zet in de eerste kolom de namen van de zijden, in de tweede de lengtes en in de derde de <b>kwadraten</b>.</p><p>Zet de <b>schuine zijde onderaan</b>: dat is de zijde tegenover de rechte hoek. De twee kwadraten erboven tel je op. Zo vind je het kwadraat van de schuine zijde, en met de wortel de lengte.</p>',
        wanneer:'je de berekening netjes wilt opschrijven, zoals in een toets.',
        maak:function(R){
          var ab = benen(R), a = ab[0], b = ab[1], s2 = a * a + b * b, nm = R.kies([['C', 'A', 'B'], ['R', 'P', 'Q'], ['M', 'K', 'L'], ['A', 'B', 'C'], ['P', 'Q', 'R']]), rot = R.kies([0, 90, 180, 270]);
          var z1 = nm[0] + nm[1], z2 = nm[0] + nm[2], sz = nm[1] + nm[2], c = Math.sqrt(s2), ce = rond(c, 'cm')[0];
          var bl = function(n){
            var tab = R0.teken.tabel([['zijde', 'lengte', 'kwadraat'], [z1, String(a), n >= 2 ? String(a * a) : ''], [z2, String(b), n >= 3 ? String(b * b) : ''], [n >= 1 ? sz : '?', n >= 5 ? ce : '?', n >= 4 ? String(s2) : '']],
              { kop:true, nadruk:{ 1:[[3, 0]], 2:[[1, 2]], 3:[[2, 2]], 4:[[3, 2]], 5:[[3, 1]] }[n] || [] });
            return '<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center"><div style="flex:1 1 220px;max-width:280px">' + rhd(a, b, [a + ' cm', '?', b + ' cm'], rot, { namen:nm, W:300, H:220 }) + '</div>' + tab + '</div>';
          };
          return { vraag:'tabel ' + nm.join('') + ' ' + a + ' ' + b + ' ' + rot, vraagHtml:'Hoe lang is ' + sz + '?', context:'Driehoek ' + nm[1] + nm[2] + nm[0] + ' heeft een rechte hoek bij ' + nm[0] + '. Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'Welke zijde is de schuine zijde?', sz, [z1, z2], 'De schuine zijde ligt tegenover de rechte hoek bij ' + nm[0] + '. Hij raakt punt ' + nm[0] + ' niet.'),
            { tekst:'Vul de tabel in. ' + z1 + '² = ' + a + '² =', antwoord:String(a * a), hint:a + ' × ' + a + '.' },
            { tekst:z2 + '² = ' + b + '² =', antwoord:String(b * b), hint:b + ' × ' + b + '.' },
            { tekst:sz + '² = ' + (a * a) + ' + ' + (b * b) + ' =', antwoord:String(s2), hint:'Onderaan staat de schuine zijde: tel de twee kwadraten erboven op.' },
            wStap(sz + ' = √' + s2, s2, 'cm')
          ] };
        } },
      { id:'mk-pyth-rhz', naam:'Een rechthoekszijde berekenen', kort:'Kwadraat van de schuine zijde min het kwadraat van de andere zijde, en dan de wortel',
        uit:'<p>Weet je de <b>schuine zijde</b> en één rechthoekszijde? Dan zoek je de andere rechthoekszijde. De schuine zijde is de langste, dus nu trek je af: <b>c² − a² = b²</b>.</p><p>Schuine zijde 13, andere zijde 5: 169 − 25 = 144, en √144 = 12.</p>',
        wanneer:'je de schuine zijde weet en een van de andere zijden zoekt.',
        maak:function(R){
          var a, c, e = R.kies(['cm', 'm']);
          if (R.heel(0, 2) === 0){ var t = R.kies(TRIPELS); a = R.heel(0, 1) ? t[0] : t[1]; c = t[2]; }
          else { a = R.heel(3, 12); c = R.heel(a + 2, a + 9); }
          var d = c * c - a * a, b = Math.sqrt(d), rot = R.kies([0, 0, 90, 180, 270, 30]);
          var bl = rhd(a, b, [a + ' ' + e, c + ' ' + e, '?'], rot);
          return { vraag:'rhz ' + c + ' en ' + a + ' ' + e, vraagHtml:'Hoe lang is de zijde met het vraagteken?', context:'De schuine zijde is ' + c + ' ' + e + ', een rechthoekszijde is ' + a + ' ' + e + '. Rond af op 1 decimaal.', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:'De schuine zijde in het kwadraat: ' + c + '² =', antwoord:String(c * c), hint:c + ' × ' + c + '.' },
            { tekst:a + '² =', antwoord:String(a * a), hint:a + ' × ' + a + '.' },
            { tekst:'De schuine zijde is de langste, dus aftrekken: ' + (c * c) + ' − ' + (a * a) + ' =', antwoord:String(d), hint:'Groot kwadraat min klein kwadraat.', fout:F(c * c + a * a, 'Je telde op. De schuine zijde is al de langste: dan trek je af.') },
            wStap('De zijde = √' + d, d, e)
          ] };
        } },
      { id:'mk-pyth-check', naam:'Is de driehoek rechthoekig?', kort:'Vergelijk het kwadraat van de langste zijde met de som van de andere twee kwadraten',
        uit:'<p>Met Pythagoras kun je ook <b>controleren</b> of een hoek recht is. Neem de <b>langste zijde</b>: alleen die kan de schuine zijde zijn.</p><p>Is het kwadraat van de langste zijde <b>precies gelijk</b> aan de twee andere kwadraten samen? Dan is de driehoek rechthoekig. Zijden 5, 12 en 13: 25 + 144 = 169 = 13². Rechthoekig!</p>',
        wanneer:'je wilt weten of iets echt haaks is, zoals een hoek van een schuur of een tuin.',
        maak:function(R){
          var t = R.kies(TRIPELS).slice(), ja = R.heel(0, 1) === 1, p = t[0], q = t[1], c = t[2];
          if (!ja){ do { var w = R.heel(0, 2); p = t[0]; q = t[1]; c = t[2]; if (w === 0) c = c + 1; else if (w === 1) c = c - 1; else p = p + 1; } while (c <= Math.max(p, q) || p * p + q * q === c * c); }
          var zij = R.hussel([p, q, c]), x = (c * c + p * p - q * q) / (2 * c), y = Math.sqrt(Math.max(1e-6, p * p - x * x));
          var bl = tekenFig([[0, 0], [c, 0], [x, y]], { zijde:[c + ' cm', q + ' cm', p + ' cm'], markeer:false, W:340, H:220, aria:'een driehoek' });
          return eindKeuze({ vraag:'check ' + zij.join(', '), vraagHtml:'Is de driehoek rechthoekig?', context:'Een driehoek heeft zijden van ' + zij[0] + ' cm, ' + zij[1] + ' cm en ' + zij[2] + ' cm.', beeld:bl, zelfBeeld:bl, stappen:[
            { tekst:'Welke zijde is de langste?', antwoord:String(c), eenheid:'cm', hint:'Alleen de langste zijde kan de schuine zijde zijn.' },
            { tekst:c + '² =', antwoord:String(c * c), hint:c + ' × ' + c + '.' },
            { tekst:'De andere twee samen: ' + p + '² + ' + q + '² =', antwoord:String(p * p + q * q), hint:(p * p) + ' + ' + (q * q) + '.' },
            kstap(R, 'Is de driehoek rechthoekig?', ja ? 'ja' : 'nee', [ja ? 'nee' : 'ja'], 'Rechthoekig als ' + (p * p + q * q) + ' precies gelijk is aan ' + (c * c) + '. Bijna gelijk is niet genoeg.')
          ] });
        } },
      { id:'mk-pyth-context', naam:'Pythagoras in het echt', kort:'Zoek de rechthoekige driehoek in het verhaal en bepaal welke zijde je zoekt',
        uit:'<p>In het echt zie je de driehoek niet altijd meteen. Een ladder tegen een muur, de diagonaal van een veld of scherm, een vliegertouw: overal zit een <b>rechte hoek</b>.</p><p>Teken de driehoek en zoek de rechte hoek. Wat ligt <b>tegenover</b> de rechte hoek? Dat is de schuine zijde: de ladder, de diagonaal, het touw. Zoek je de schuine zijde, dan tel je de kwadraten op. Zoek je een andere zijde, dan trek je af.</p>',
        wanneer:'je een afstand zoekt die je niet kunt meten, zoals schuin of omhoog.',
        maak:function(R){
          var k = R.heel(0, 5), x, y, e, ctx, schuin, lab, sl;
          if (k === 0){ x = R.kies([3, 3.5, 4, 4.5, 5, 6]); y = R.kies([0.8, 1, 1.2, 1.5]); e = 'm'; schuin = false; sl = 'de ladder'; ctx = 'Een ladder van ' + T(x) + ' m staat schuin tegen een muur. De voet staat ' + T(y) + ' m van de muur. Hoe hoog komt de ladder tegen de muur?'; }
          else if (k === 1){ x = R.kies([48, 60, 72, 88, 96, 110]); y = Math.round(x * 0.5625); e = 'cm'; schuin = true; sl = 'de diagonaal'; ctx = 'Een beeldscherm is ' + x + ' cm breed en ' + y + ' cm hoog. Hoe lang is de diagonaal van het scherm?'; }
          else if (k === 2){ x = 5 * R.heel(6, 16); y = 5 * R.heel(4, Math.min(10, x / 5 - 1)); e = 'm'; schuin = true; sl = 'de schuine route'; ctx = 'Je loopt schuin over een rechthoekig grasveld van ' + x + ' m bij ' + y + ' m, van hoek naar hoek. Hoe ver loop je?'; }
          else if (k === 3){ x = R.kies([40, 50, 60, 75, 80]); y = 5 * R.heel(4, x / 5 - 2); e = 'm'; schuin = false; sl = 'het touw'; ctx = 'Het touw van een vlieger is ' + x + ' m lang en strak gespannen. De vlieger hangt precies boven een punt dat ' + y + ' m van je hand af ligt. Hoe hoog hangt de vlieger boven je hand?'; }
          else if (k === 4){ x = R.heel(5, 15); y = R.heel(3, 12); e = 'km'; schuin = true; sl = 'de afstand hemelsbreed'; ctx = 'Een boot vaart ' + x + ' km naar het noorden en daarna ' + y + ' km naar het oosten. Hoe ver is de boot hemelsbreed van het begin?'; }
          else { x = R.kies([3, 4, 5, 6]); y = R.kies([0.4, 0.5, 0.6, 0.8]); e = 'm'; schuin = false; sl = 'de hellingbaan'; ctx = 'Een hellingbaan is ' + T(x) + ' m lang (de schuine kant) en gaat ' + T(y) + ' m omhoog. Hoe ver komt hij horizontaal?'; }
          var xx = r6(x * x), yy = r6(y * y), uit = schuin ? r6(xx + yy) : r6(xx - yy);
          lab = schuin ? [T(x) + ' ' + e, '?', T(y) + ' ' + e] : [T(y) + ' ' + e, T(x) + ' ' + e, '?'];
          var bl = schuin ? rhd(x, y, lab, 0) : rhd(y, Math.sqrt(uit), lab, 0);
          return { vraag:'ctx ' + k + ' ' + x + ' ' + y, vraagHtml:'Hoeveel ' + e + '?', context:ctx + ' Rond af op 1 decimaal.', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Wat zoek je?', schuin ? 'de schuine zijde' : 'een rechthoekszijde', [schuin ? 'een rechthoekszijde' : 'de schuine zijde'], 'De schuine zijde ligt tegenover de rechte hoek. Hier is dat ' + sl + '.'),
            { tekst:T(x) + '² =', antwoord:T(xx), hint:T(x) + ' × ' + T(x) + '.' },
            { tekst:T(y) + '² =', antwoord:T(yy), hint:T(y) + ' × ' + T(y) + '.' },
            schuin ? { tekst:'Optellen: ' + T(xx) + ' + ' + T(yy) + ' =', antwoord:T(uit), hint:'Je zoekt de schuine zijde: tel de kwadraten op.' }
                   : { tekst:'Aftrekken: ' + T(xx) + ' − ' + T(yy) + ' =', antwoord:T(uit), hint:'Je zoekt een rechthoekszijde: groot kwadraat min klein kwadraat.', fout:F(T(r6(xx + yy)), 'Je telde op. ' + sl.charAt(0).toUpperCase() + sl.slice(1) + ' is al de langste zijde: trek af.') },
            wStap('√' + T(uit), uit, e)
          ] };
        } },
      { id:'mk-pyth-kies', naam:'Optellen of aftrekken?', kort:'Zoek je de schuine zijde? Optellen. Zoek je een rechthoekszijde? Aftrekken',
        uit:'<p>Bij Pythagoras moet je steeds kiezen: <b>optellen of aftrekken</b>?</p><p>Kijk waar het <b>vraagteken</b> staat. Staat het bij de schuine zijde, tegenover de rechte hoek? Dan <b>tel je op</b>: het antwoord wordt de langste zijde. Staat het bij een rechthoekszijde? Dan <b>trek je af</b>: grootste kwadraat min kleinste.</p><p>Controleer: de schuine zijde moet altijd de langste zijn.</p>',
        wanneer:'de driehoek gedraaid staat en je moet kiezen hoe je rekent.',
        maak:function(R){
          var ab = benen(R), a = ab[0], b = ab[1], schuin = R.heel(0, 1) === 1, rot = R.kies([0, 90, 180, 270, 25, 200, 120]), c = Math.sqrt(a * a + b * b);
          if (!schuin && Math.abs(c - Math.round(c)) > 1e-9){ c = Math.round(c) + 1; }
          var hyp = schuin ? null : c, lab = schuin ? [a + ' cm', '?', b + ' cm'] : [a + ' cm', T(hyp) + ' cm', '?'], bb = schuin ? b : Math.sqrt(hyp * hyp - a * a);
          var bl = rhd(a, bb, lab, rot), P = schuin ? a : hyp, Q = schuin ? b : a, val = schuin ? P * P + Q * Q : P * P - Q * Q;
          return { vraag:'kies ' + lab.join(' ') + ' ' + rot, vraagHtml:'Hoe lang is de zijde met het vraagteken?', context:'Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Is de zijde met het vraagteken de schuine zijde?', schuin ? 'ja' : 'nee', [schuin ? 'nee' : 'ja'], 'De schuine zijde ligt tegenover de rechte hoek, het vierkantje. Hij raakt de rechte hoek niet.'),
            kstap(R, 'Tel je de kwadraten op of trek je ze af?', schuin ? 'optellen' : 'aftrekken', [schuin ? 'aftrekken' : 'optellen'], 'De schuine zijde zoeken: optellen. Een rechthoekszijde zoeken: aftrekken.'),
            { tekst:P + '² ' + (schuin ? '+' : '−') + ' ' + Q + '² =', antwoord:String(val), hint:P + '² = ' + P * P + ' en ' + Q + '² = ' + Q * Q + '.', fout:F(schuin ? P * P - Q * Q : P * P + Q * Q, schuin ? 'Je trok af, maar je zoekt de schuine zijde: optellen.' : 'Je telde op, maar je zoekt een rechthoekszijde: aftrekken.') },
            wStap('? = √' + val, val, 'cm')
          ] };
        } }
    ] });

  /* @@MEER@@ */

  LEERROUTE.voeg('rekenen', G);
})();
