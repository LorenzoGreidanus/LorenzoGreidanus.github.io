/* De leerroute wiskunde: meetkunde. Hoeken met een letter en de hoekensom van een
   veelhoek, Pythagoras verder (in een assenstelsel, de hoogte van een gelijkbenige
   driehoek, de lichaamsdiagonaal van een balk), sinus, cosinus en tangens, vergroten
   met lengte-, oppervlakte- en inhoudsfactor, en de inhoud van piramide en kegel.
   Elke manier een eigen doel. De losse hoekregels, het stappenplan van Pythagoras en
   de inhoud van prisma en cilinder staan in de leerroute rekenen (rekenen-meetkunde.js,
   rekenen-meten.js). Zie leerroute.js voor het formaat. */
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
  /* afgerond op d decimalen, met of zonder eenheid */
  function af(x, d, e){ var r = rnd(x, d), v = metE(T(r, { dec:d, vast:true }), e), k = metE(T(r), e); return uniek(Math.abs(x - Math.round(x)) < 1e-9 ? k.concat(v) : v.concat(k)); }
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
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  function norm360(a){ return ((a % 360) + 360) % 360; }
  function E(termen){
    var s = '';
    termen.forEach(function(t){
      var c = t[0], v = t[1] || ''; if (!c) return;
      var abs = Math.abs(c), stuk = (v && abs === 1 ? '' : T(abs)) + v;
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }
  /* een vergelijking met x controleren: links min rechts moet a·x + b zijn (of het tegengestelde) */
  function lin(t){
    var s = String(t).toLowerCase().replace(/[−–—]/g, '-').replace(/°/g, '').replace(/\s+/g, '').replace(/,/g, '.').replace(/[×·*]/g, '');
    if (!/^[-+]?[\d.x+-]*$/.test(s) || !s) return null;
    var m = s.replace(/-/g, '+-').split('+').filter(Boolean), a = 0, b = 0;
    for (var i = 0; i < m.length; i++){
      var r = /^(-?)(\d*\.?\d*)(x?)$/.exec(m[i]); if (!r || (!r[2] && !r[3])) return null;
      var c = (r[1] ? -1 : 1) * (r[2] ? +r[2] : 1); if (r[3]) a += c; else b += c;
    }
    return [a, b];
  }
  function vglC(a, b){
    return function(v){
      var d = String(v).split('='); if (d.length !== 2) return false;
      var l = lin(d[0]), r = lin(d[1]); if (!l || !r) return false;
      var p = [l[0] - r[0], l[1] - r[1]];
      return (Math.abs(p[0] - a) < 1e-9 && Math.abs(p[1] - b) < 1e-9) || (Math.abs(p[0] + a) < 1e-9 && Math.abs(p[1] + b) < 1e-9);
    };
  }

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
  function pad(d, o){ return '<path d="' + d + '" style="' + stijl(o || {}) + '"/>'; }
  function cir(cx, cy, r, o){ return '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r) + '" style="' + stijl(o || {}) + '"/>'; }
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
  function draai(p, a){ var r = a * RAD; return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)]; }
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
      s += tx(mx + nv[0] * afst, my + nv[1] * afst, t, { mid:true, vet:true, k:t === '?' ? K[1] : (o.zk && o.zk[i]) || null, fs:16 });
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
  function driePts(al, be){ var t = Math.sin(be * RAD) / Math.sin((al + be) * RAD); return [[0, 0], [1, 0], [t * Math.cos(al * RAD), t * Math.sin(al * RAD)]]; }
  /* stralen vanuit één punt: hoeken (in graden, tegen de klok in vanaf rechts) met labels */
  function stralen(hk, lab, o){
    o = o || {};
    var cx = 200, cy = o.cy || 125, r = 105, s = '', a = o.start || 0, tot = 0;
    var dirs = [a]; hk.forEach(function(h){ tot += h; dirs.push(a + tot); });
    if (o.lijn) s += ln(cx - r - 10, cy, cx + r + 10, cy, { w:3 });
    dirs.forEach(function(d, i){ if (o.lijn && (i === 0 || i === dirs.length - 1)) return; var p = pol(cx, cy, r, d); s += ln(cx, cy, p[0], p[1], { w:3 }); });
    hk.forEach(function(h, i){ s += hoekje(cx, cy, dirs[i], dirs[i + 1], { t:lab[i], k:K[[0, 3, 2, 4][i % 4]], r:h < 40 ? 50 : 34, lr:h < 40 ? 22 : 18 + String(lab[i]).length * 2.5, recht:lab[i] === '' }); });
    s += cir(cx, cy, 4, { f:'var(--ink)', w:0, s:'none' });
    return svg(400, o.lijn ? 150 : 250, s, o.aria || 'hoeken rond een punt', 420);
  }

  /* ---------- ruimtefiguren, scheef getekend ---------- */
  function schuin(p, d){ return [p[0] + p[2] * d * 0.62, p[1] + p[2] * d * 0.42]; }
  function ruimte(punten, ribben, o){
    o = o || {};
    var P = punten.map(function(p){ return schuin(p, o.d || 0.5); }), t = pas(P.concat(o.extra || []), o.W || 360, o.H || 250, 40), Q = P.map(t.f), s = '';
    ribben.forEach(function(rb){ s += ln(Q[rb[0]][0], Q[rb[0]][1], Q[rb[1]][0], Q[rb[1]][1], { w:2.5, stip:rb[2] ? '6 5' : null, op:rb[2] ? 0.6 : null }); });
    (o.lijnen || []).forEach(function(l){ s += ln(Q[l[0]][0], Q[l[0]][1], Q[l[1]][0], Q[l[1]][1], { k:K[l[2] || 1], w:3.5, stip:l[3] ? '7 5' : null }); });
    var cx = 0, cy = 0; Q.forEach(function(q){ cx += q[0] / Q.length; cy += q[1] / Q.length; });
    (o.namen || []).forEach(function(n, i){ if (!n) return; var dx = Q[i][0] - cx, dy = Q[i][1] - cy, L = Math.hypot(dx, dy) || 1; s += tx(Q[i][0] + dx / L * 16, Q[i][1] + dy / L * 16, n, { mid:true, vet:true, fs:15 }); });
    (o.maten || []).forEach(function(m){ var a = Q[m[0]], b = Q[m[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1; s += tx(mx + dx / L * 22, my + dy / L * 22, m[2], { mid:true, vet:true, fs:15, k:m[2] === '?' ? K[1] : null }); });
    return svg(o.W || 360, o.H || 250, s, o.aria || 'ruimtefiguur', o.max || 380);
  }
  /* balk: A B C D onder, E F G H boven; l = AB (breedte), b = BC (diepte), h = AE */
  function balkPts(l, b, h){ return [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [0, h, 0], [l, h, 0], [l, h, b], [0, h, b]]; }
  var BALK_RIBBEN = [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7, 1]];
  function rond(soort, r, h, o){
    o = o || {};
    var W = 300, H = 270, cx = 150, rx = 95, ry = 28, top = 40, bod = 220, s = '';
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + bod, { stip:'6 5', op:0.6, w:2 });
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + bod, { w:2.5, f:K[0], fo:0.08 });
    if (soort === 'cilinder'){ s += '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" style="' + stijl({ w:2.5, f:K[0], fo:0.1 }) + '"/>' + ln(cx - rx, top, cx - rx, bod, { w:2.5 }) + ln(cx + rx, top, cx + rx, bod, { w:2.5 });
      s += ln(cx, top, cx + rx, top, { k:K[1], w:3 }) + tx(cx + rx / 2, top - 8, o.r || '', { vet:true, k:K[1] }) + tx(cx + rx + 12, (top + bod) / 2, o.h || '', { vet:true, a:'start' }); }
    else { s += ln(cx - rx, bod, cx, top, { w:2.5 }) + ln(cx + rx, bod, cx, top, { w:2.5 }) + ln(cx, top, cx, bod, { k:K[3], w:2.5, stip:'6 5' }) + ln(cx, bod, cx + rx, bod, { k:K[1], w:3 });
      s += tx(cx + rx / 2, bod - 8, o.r || '', { vet:true, k:K[1] }) + tx(cx - 8, (top + bod) / 2, o.h || '', { vet:true, a:'end', k:K[3] }); }
    return svg(W + 60, H, s, soort, 340);
  }

  /* ================= de inhoud ================= */
  var G = [];

  /* ================= hoeken (onderbouw) ================= */
  G.push({ groep:{ id:'wi-hoek', niveau:'onderbouw', domein:'meetkunde', naam:'Hoeken berekenen met een vergelijking',
      uit:'Hoeken met een letter erin, en alle hoeken van een veelhoek samen. De losse hoekregels (gestrekte hoek, overstaande hoeken, F- en Z-hoeken, de driehoek) staan in de leerroute rekenen.' },
    doelen:[
      { id:'wi-hoek-x', naam:'Hoeken met een letter', kort:'Schrijf de hoekregel als vergelijking, zoals x + 2x + 30 = 180, en los op',
        uit:'<p>Soms staat er in een hoek een <b>letter</b>: x, 2x of x + 20. Dan maak je met een hoekregel een <b>vergelijking</b>.</p><p>Een driehoek heeft hoeken x, 2x en 30°. De hoeken van een driehoek zijn samen 180°: <b>x + 2x + 30 = 180</b>. Dus 3x = 150 en <b>x = 50</b>.</p><p>Lees goed welke hoek er gevraagd wordt. Wordt 2x gevraagd? Dan is het antwoord 2 × 50 = 100°.</p>',
        wanneer:'er in een figuur hoeken met een letter staan.',
        maak:function(R){
          var v = R.kies(['drie', 'drie', 'lijn', 'rond']), x, k, c, d, hk, lab, regel, a, b, vgl, vraagHoek, waarde, beeld;
          var regels = ['de hoeken van een driehoek zijn samen 180°', 'hoeken op een rechte lijn zijn samen 180°', 'hoeken rond een punt zijn samen 360°'];
          for (var p = 0; p < 200; p++){
            if (v === 'drie'){
              if (R.heel(0, 1)){ k = R.kies([2, 3]); x = R.heel(4, 10) * 5; c = 180 - (1 + k) * x; hk = [x, k * x, c]; lab = ['x', k + 'x', c + '°']; a = 1 + k; b = c; vgl = 'x + ' + k + 'x + ' + c + ' = 180'; vraagHoek = k + 'x'; waarde = k * x; }
              else { d = R.heel(2, 8) * 5; x = R.heel(6, 12) * 5; c = 180 - 2 * x - d; hk = [x, x + d, c]; lab = ['x', 'x + ' + d, c + '°']; a = 2; b = d + c; vgl = 'x + x + ' + d + ' + ' + c + ' = 180'; vraagHoek = 'x + ' + d; waarde = x + d; }
              if (c >= 20 && Math.max.apply(null, hk) < 125) break;
            } else if (v === 'lijn'){
              k = R.kies([2, 3, 4]); d = R.kies([0, 0, 10, 20, 30, -10, -20]); x = (180 - d) / (k + 1);
              hk = [k * x + d, x]; lab = [E([[k, 'x'], [d, '']]), 'x']; a = k + 1; b = d; vgl = E([[k, 'x'], [d, '']]) + ' + x = 180'; vraagHoek = E([[k, 'x'], [d, '']]); waarde = k * x + d;
              if (x === Math.round(x) && x >= 15 && x <= 60 && waarde < 170) break;
            } else {
              k = R.kies([2, 3]); x = R.heel(4, 12) * 5; c = 360 - (1 + k) * x - 90; hk = [x, k * x, 90, c]; lab = ['x', k + 'x', '', c + '°']; a = k + 1; b = c + 90; vgl = 'x + ' + k + 'x + 90 + ' + c + ' = 360'; vraagHoek = k + 'x'; waarde = k * x;
              if (c >= 30 && c <= 150 && k * x <= 160 && k * x !== 90 && c !== 90 && x !== 90) break;
            }
          }
          var som = v === 'rond' ? 360 : 180, ri = v === 'drie' ? 0 : v === 'lijn' ? 1 : 2;
          if (v === 'drie'){ var pts = driePts(hk[0], hk[1]); beeld = tekenFig(pts, { hoek:lab, kl:[K[0], K[3], K[2]], aria:'een driehoek met hoeken ' + lab.join(', ') }); }
          else if (v === 'lijn') beeld = stralen(hk, lab, { lijn:true, aria:'twee hoeken op een rechte lijn' });
          else { lab = ['x', k + 'x', '', c + '°']; beeld = stralen(hk, lab, { start:R.heel(0, 3) * 10, aria:'vier hoeken rond een punt, één is recht' }); }
          var st = [
            kstap(R, 'Welke hoekregel gebruik je?', regels[ri], regels.filter(function(r, i){ return i !== ri; }), v === 'drie' ? 'Het zijn de drie hoeken van één driehoek.' : v === 'lijn' ? 'De twee hoeken liggen samen op een rechte lijn.' : 'De hoeken liggen rond één punt.' + (v === 'rond' ? ' Vergeet de rechte hoek van 90° niet.' : '')),
            { tekst:'Schrijf de vergelijking op (gebruik = ' + som + '):', antwoord:[vgl], controle:vglC(a, b - som), invoer:'tekst', hint:'Tel alle hoeken op en zet = ' + som + ' erachter: ' + vgl + '.' },
            St('Neem samen: ' + E([[a, 'x'], [b, '']]) + ' = ' + som + '. Los op: x =', [String(x), 'x = ' + x], a + 'x = ' + som + (b < 0 ? ' + ' + (-b) : ' ' + MIN + ' ' + b) + ' = ' + (som - b) + ', en ' + (som - b) + ' : ' + a + ' = ' + x + '.', Fz([String(x)], F(String(som - b), 'Dat is ' + a + 'x. Deel nog door ' + a + '.'))),
            St('De gevraagde hoek is ' + vraagHoek + '. Vul x = ' + x + ' in:', gr(waarde), vraagHoek + ' met x = ' + x + ': ' + (v === 'drie' && vraagHoek !== k + 'x' ? x + ' + ' + d : k + ' ' + X + ' ' + x + (v === 'lijn' && d ? (d < 0 ? ' ' + MIN + ' ' + (-d) : ' + ' + d) : '')) + ' = ' + waarde + '°.', Fz(gr(waarde), F(String(x), 'Dat is x. De vraag is de hoek ' + vraagHoek + '.')), { e:'°' }) ];
          return { vraag:'Hoe groot is de hoek ' + vraagHoek + '?', context:'Bereken eerst x met een vergelijking.' + (v === 'drie' ? ' De figuur is niet op schaal.' : ''), eenheid:'°', beeld:beeld, zelfBeeld:beeld, stappen:st };
        } },
      { id:'wi-hoek-veelhoek', naam:'De hoekensom van een veelhoek', kort:'Een n-hoek verdeel je in n − 2 driehoeken: alle hoeken samen zijn (n − 2) × 180°',
        uit:'<p>Trek vanuit één hoekpunt alle diagonalen. Een vijfhoek valt dan uiteen in <b>3 driehoeken</b>, een zeshoek in 4. Altijd <b>2 minder</b> dan het aantal hoeken.</p><p>Elke driehoek is samen 180°. Dus alle hoeken van een n-hoek samen: <b>(n − 2) × 180°</b>. Vijfhoek: 3 × 180 = 540°.</p><p>Bij een <b>regelmatige</b> veelhoek zijn alle hoeken even groot. Deel dan door het aantal hoeken: 540 : 5 = 108°.</p>',
        wanneer:'je de hoeken van een vijfhoek, zeshoek of andere veelhoek zoekt.',
        maak:function(R){
          var NAMEN = { 5:'vijfhoek', 6:'zeshoek', 7:'zevenhoek', 8:'achthoek', 9:'negenhoek', 10:'tienhoek', 12:'twaalfhoek' };
          var regel = R.heel(0, 1) === 1, n = regel ? R.kies([5, 6, 8, 9, 10, 12]) : R.kies([5, 5, 6, 6, 7]), som = (n - 2) * 180, hk = [], i, rest, mis;
          if (!regel){ do { hk = []; for (i = 0; i < n - 1; i++) hk.push(R.heel(Math.floor(som / n / 10) - 3, Math.floor(som / n / 10) + 3) * 10 - R.kies([0, 5])); rest = hk.reduce(function(s, x){ return s + x; }, 0); mis = som - rest; } while (mis < 60 || mis > 175); }
          var pts = []; for (i = 0; i < n; i++) pts.push([Math.cos((90 + 360 * i / n) * RAD), Math.sin((90 + 360 * i / n) * RAD)]);
          var beeld = function(m){
            return tekenFig(pts, { hoek:regel ? ['', m >= 3 ? T(som / n) + '°' : '?'] : hk.map(function(x){ return x + '°'; }).concat(['?']), kl:pts.map(function(p, j){ return j === n - 1 || regel ? K[1] : K[0]; }), markeer:false, W:360, H:300, m:36,
              aria:'een ' + NAMEN[n], na:function(P){ var s = ''; if (m >= 1) for (var j = 2; j < n - 1; j++) s += ln(P[0][0], P[0][1], P[j][0], P[j][1], { k:K[3], w:2, stip:'6 5' }); return s; } });
          };
          var st = [
            St('Trek vanuit één hoekpunt alle diagonalen. Hoeveel driehoeken krijg je? ' + n + ' ' + MIN + ' 2 =', String(n - 2), 'Altijd 2 minder dan het aantal hoeken.', Fz([String(n - 2)], F(String(n), 'Het zijn er 2 minder dan het aantal hoeken.', String(n - 1), 'Het zijn er 2 minder dan het aantal hoeken.'))),
            St('Alle hoeken samen: ' + (n - 2) + ' ' + X + ' 180 =', gr(som), 'Elke driehoek is samen 180°.', Fz(gr(som), F(String(n * 180), 'Je deed ' + n + ' ' + X + ' 180. Het zijn ' + (n - 2) + ' driehoeken.')), { e:'°' }) ];
          if (regel) st.push(St('Alle ' + n + ' hoeken zijn even groot. Eén hoek: ' + som + ' : ' + n + ' =', gr(som / n), 'Verdeel de ' + som + '° eerlijk over ' + n + ' hoeken.', null, { e:'°' }));
          else {
            st.push(St('De andere hoeken samen: ' + hk.join(' + ') + ' =', gr(rest), 'Tel de ' + (n - 1) + ' gegeven hoeken op.', null, { e:'°' }));
            st.push(St('De ontbrekende hoek: ' + som + ' ' + MIN + ' ' + rest + ' =', gr(mis), 'Alle hoeken samen min de hoeken die je al weet.', Fz(gr(mis), F(String(180 * n - rest), 'Gebruik de hoekensom ' + som + '°.')), { e:'°' }));
          }
          return { vraag:regel ? 'Eén hoek van een regelmatige ' + NAMEN[n] + '?' : 'De ontbrekende hoek?', context:regel ? 'In een regelmatige ' + NAMEN[n] + ' zijn alle zijden en alle hoeken even groot. Hoe groot is één hoek?' : 'Van een ' + NAMEN[n] + ' weet je ' + (n - 1) + ' hoeken. Hoe groot is de hoek met het vraagteken? De figuur is niet op schaal.', eenheid:'°', beeld:beeld, zelfBeeld:beeld(0), stappen:st };
        } }
    ] });

  /* ================= Pythagoras verder (vmbo) ================= */
  function assen(o){
    var x0 = -6, x1 = 6, y0 = -6, y1 = 6, u = 26, m = 22, W = (x1 - x0) * u + 2 * m, H = (y1 - y0) * u + 2 * m, s = '', i;
    function Xs(x){ return m + (x - x0) * u; } function Ys(y){ return m + (y1 - y) * u; }
    for (i = x0; i <= x1; i++) s += ln(Xs(i), Ys(y0), Xs(i), Ys(y1), { w:1, op:0.2 }) + ln(Xs(x0), Ys(i), Xs(x1), Ys(i), { w:1, op:0.2 });
    s += ln(Xs(x0), Ys(0), Xs(x1), Ys(0), { w:2 }) + ln(Xs(0), Ys(y0), Xs(0), Ys(y1), { w:2 });
    for (i = x0; i <= x1; i += 2) if (i){ s += tx(Xs(i), Ys(0) + 16, T(i), { fs:12 }); s += tx(Xs(0) - 6, Ys(i) + 4, T(i), { fs:12, a:'end' }); }
    if (o.trap){ var A = o.A, B = o.B, C = [B[0], A[1]];
      s += ln(Xs(A[0]), Ys(A[1]), Xs(C[0]), Ys(C[1]), { k:K[1], w:3, stip:'7 5' }) + ln(Xs(C[0]), Ys(C[1]), Xs(B[0]), Ys(B[1]), { k:K[3], w:3, stip:'7 5' });
      if (o.dx) s += tx((Xs(A[0]) + Xs(C[0])) / 2, Ys(A[1]) + (B[1] > A[1] ? 18 : -8), o.dx, { k:K[1], vet:true, fs:14 });
      if (o.dy) s += tx(Xs(C[0]) + (B[0] > A[0] ? 8 : -8), (Ys(C[1]) + Ys(B[1])) / 2 + 5, o.dy, { k:K[3], vet:true, fs:14, a:B[0] > A[0] ? 'start' : 'end' }); }
    s += ln(Xs(o.A[0]), Ys(o.A[1]), Xs(o.B[0]), Ys(o.B[1]), { k:K[0], w:3.5 });
    [[o.A, 'A', o.B], [o.B, 'B', o.A]].forEach(function(q){ var weg = q[0][0] >= q[2][0] ? 1 : -1, op = q[0][1] >= q[2][1] ? -1 : 1; s += cir(Xs(q[0][0]), Ys(q[0][1]), 6, { f:K[0], s:'var(--kaart)', w:2 }) + tx(Xs(q[0][0]) + weg * 11, Ys(q[0][1]) + (op < 0 ? -9 : 20), q[1], { vet:true, a:weg > 0 ? 'start' : 'end', fs:16 }); });
    return svg(W, H, s, 'assenstelsel met de punten A en B', 380);
  }
  G.push({ groep:{ id:'wi-pyt', niveau:'vmbo', domein:'meetkunde', naam:'Pythagoras verder',
      uit:'De stelling van Pythagoras in een assenstelsel, in een gelijkbenige driehoek en in de ruimte. Het stappenplan zelf (welke zijde is de schuine zijde, kwadrateren, optellen of aftrekken, worteltrekken) staat in de leerroute rekenen.' },
    doelen:[
      { id:'wi-pyt-assen', naam:'De afstand tussen twee punten', kort:'Teken een rechthoekige driehoek: het verschil in x en het verschil in y zijn de rechthoekszijden',
        uit:'<p>Hoe ver liggen A(1, 2) en B(5, 5) uit elkaar? Teken een <b>rechthoekige driehoek</b>: van A recht naar rechts, en dan recht omhoog naar B.</p><p>De rechthoekszijden zijn het <b>verschil in x</b> (5 − 1 = 4) en het <b>verschil in y</b> (5 − 2 = 3). AB is de schuine zijde.</p><p>Pythagoras: AB² = 4² + 3² = 25, dus AB = √25 = <b>5</b>. Een verschil is altijd positief: tel de hokjes.</p>',
        wanneer:'je de lengte van een schuin lijnstuk in een assenstelsel zoekt.',
        maak:function(R){
          var A, B, dx, dy;
          do { A = [R.heel(-5, 5), R.heel(-5, 5)]; B = [R.heel(-5, 5), R.heel(-5, 5)]; dx = Math.abs(B[0] - A[0]); dy = Math.abs(B[1] - A[1]); } while (dx < 2 || dy < 2 || (dx * dx + dy * dy !== 25 && dx * dx + dy * dy !== 100 && R.heel(0, 3) === 0) || grens(Math.sqrt(dx * dx + dy * dy), 1));
          var s2 = dx * dx + dy * dy, c = Math.sqrt(s2), exact = Math.abs(c - Math.round(c)) < 1e-9;
          var bl = function(n){ return assen({ A:A, B:B, trap:n >= 1, dx:n >= 1 ? String(dx) : '', dy:n >= 2 ? String(dy) : '' }); };
          return { vraag:'A' + '(' + T(A[0]) + ', ' + T(A[1]) + ') en B(' + T(B[0]) + ', ' + T(B[1]) + ')', context:'Bereken de lengte van AB. Rond af op 1 decimaal.', beeld:bl, zelfBeeld:bl(0), stappen:[
            St('Het verschil in x: van ' + T(A[0]) + ' naar ' + T(B[0]) + ' is', String(dx), 'Tel de hokjes van links naar rechts, of reken ' + T(Math.max(A[0], B[0])) + ' ' + MIN + ' ' + (Math.min(A[0], B[0]) < 0 ? '(' + T(Math.min(A[0], B[0])) + ')' : T(Math.min(A[0], B[0]))) + '.', Fz([String(dx)], F(String(-dx), 'Een lengte is altijd positief.', String(Math.abs(A[0] + B[0])), 'Min een min-getal is plus. Tel de hokjes.'))),
            St('Het verschil in y: van ' + T(A[1]) + ' naar ' + T(B[1]) + ' is', String(dy), 'Tel de hokjes van onder naar boven.', Fz([String(dy)], F(String(-dy), 'Een lengte is altijd positief.', String(Math.abs(A[1] + B[1])), 'Min een min-getal is plus. Tel de hokjes.'))),
            St('AB is de schuine zijde. AB² = ' + dx + '² + ' + dy + '² =', String(s2), (dx * dx) + ' + ' + (dy * dy) + '.', F(String(dx + dy), 'Eerst kwadrateren, dan optellen.')),
            St('AB = √' + s2 + (exact ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(c, 1), 'Gebruik de wortelknop: √' + s2 + ' = ' + T(c, { dec:4 }) + (exact ? '.' : '…'), F(String(s2), 'Je vergat de wortel te nemen.')) ] };
        } },
      { id:'wi-pyt-hoogte', naam:'De hoogte van een gelijkbenige driehoek', kort:'De hoogte deelt de basis doormidden: reken met de halve basis en het been als schuine zijde',
        uit:'<p>Een <b>gelijkbenige driehoek</b> heeft twee gelijke zijden, de benen. De <b>hoogte</b> vanuit de top staat loodrecht op de basis en deelt die precies <b>doormidden</b>.</p><p>Zo krijg je een rechthoekige driehoek met de <b>halve basis</b>, de hoogte en het <b>been</b>. Het been is de schuine zijde.</p><p>Basis 10, benen 13: halve basis 5. h² = 13² − 5² = 169 − 25 = 144, dus h = <b>12</b>.</p>',
        wanneer:'je de hoogte van een gelijkbenige driehoek nodig hebt, bijvoorbeeld voor de oppervlakte.',
        maak:function(R){
          var b, c, d, h;
          do { if (R.heel(0, 2) === 0){ var t = R.kies([[6, 5], [10, 13], [16, 17], [12, 10], [24, 13], [16, 10], [18, 15], [30, 17]]); b = t[0]; c = t[1]; } else { b = R.kies([6, 8, 10, 12, 14, 16, 20]); c = R.heel(b / 2 + 2, b / 2 + 10); }
            d = c * c - (b / 2) * (b / 2); h = Math.sqrt(d); } while (grens(h, 1));
          var exact = Math.abs(h - Math.round(h)) < 1e-9, pts = [[0, 0], [b, 0], [b / 2, h]];
          var bl = function(n){ return tekenFig(pts, { zijde:[n >= 1 ? '' : b + ' cm', c + ' cm', c + ' cm'], markeer:false, W:340, H:250, aria:'gelijkbenige driehoek met de hoogte',
            na:function(P){ var M = [(P[0][0] + P[1][0]) / 2, P[0][1]], s = ln(P[2][0], P[2][1], M[0], M[1], { k:K[1], w:3, stip:'7 5' }) + tx(M[0] + 10, (M[1] + P[2][1]) / 2, 'h', { vet:true, k:K[1], a:'start', fs:16 }) + hoekje(M[0], M[1], 0, 90, { k:'var(--ink)' });
              if (n >= 1) s += tx((P[0][0] + M[0]) / 2, M[1] + 20, (b / 2) + ' cm', { vet:true, fs:15, k:K[3] }) + tx((P[1][0] + M[0]) / 2, M[1] + 20, (b / 2) + ' cm', { vet:true, fs:15, k:K[3] });
              return s; } }); };
          return { vraag:'Hoe hoog is de driehoek?', context:'Een gelijkbenige driehoek heeft een basis van ' + b + ' cm en twee benen van ' + c + ' cm. Bereken de hoogte h. Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl(0), stappen:[
            St('De hoogte deelt de basis doormidden. De halve basis: ' + b + ' : 2 =', metE(T(b / 2), 'cm'), 'De hoogte komt precies in het midden van de basis.', null, { e:'cm' }),
            kstap(R, 'In de rechthoekige halve driehoek: welke zijde is de schuine zijde?', 'het been van ' + c + ' cm', ['de hoogte h', 'de halve basis van ' + (b / 2) + ' cm'], 'De schuine zijde ligt tegenover de rechte hoek bij de voet van de hoogte. Dat is het been.'),
            St('Je zoekt een rechthoekszijde, dus aftrekken: ' + c + '² ' + MIN + ' ' + (b / 2) + '² =', T(d), (c * c) + ' ' + MIN + ' ' + (b * b / 4) + '.', Fz([T(d)], F(T(c * c - b * b), 'Neem de halve basis, niet de hele: ' + (b / 2) + '.', T(c * c + b * b / 4), 'Je zoekt een rechthoekszijde: aftrekken.'))),
            St('h = √' + T(d) + (exact ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(h, 1, 'cm'), 'Gebruik de wortelknop: √' + T(d) + ' = ' + T(h, { dec:4 }) + (exact ? '.' : '…'), F(T(d), 'Je vergat de wortel te nemen.'), { e:'cm' }) ] };
        } },
      { id:'wi-pyt-ruimte', naam:'De lichaamsdiagonaal van een balk', kort:'Twee keer Pythagoras: eerst de diagonaal van het grondvlak, dan met de hoogte erbij',
        uit:'<p>De <b>lichaamsdiagonaal</b> AG loopt dwars door de balk, van een hoek onder naar de verste hoek boven.</p><p>Gebruik Pythagoras <b>twee keer</b>. Eerst in het grondvlak, driehoek ABC: AC² = AB² + BC². Daarna in driehoek ACG, met de rechte hoek bij C: AG² = AC² + CG².</p><p>Je hoeft AC niet uit te rekenen: je hebt alleen <b>AC²</b> nodig. Zo rond je pas aan het eind af. Balk 4 bij 3 bij 12: AC² = 16 + 9 = 25, AG² = 25 + 144 = 169, AG = 13.</p>',
        wanneer:'je de langste lat zoekt die in een doos of kamer past.',
        maak:function(R){
          var l, b, h, s1, s2, d;
          do { if (R.heel(0, 3) === 0){ var t = R.kies([[4, 3, 12], [3, 4, 12], [6, 2, 3], [2, 3, 6], [8, 4, 1], [6, 6, 7], [2, 6, 9]]); l = t[0]; b = t[1]; h = t[2]; } else { l = R.heel(3, 12); b = R.heel(2, 9); h = R.heel(2, 10); }
            s1 = l * l + b * b; s2 = s1 + h * h; d = Math.sqrt(s2); } while (grens(d, 1));
          var exact = Math.abs(d - Math.round(d)) < 1e-9;
          var bl = function(n){ return ruimte(balkPts(l, b, h), BALK_RIBBEN, { namen:['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], maten:[[0, 1, l + ' cm'], [1, 2, b + ' cm'], [2, 6, h + ' cm']],
            lijnen:[].concat(n >= 2 ? [[0, 2, 3, true]] : []).concat(n >= 4 ? [[0, 6, 1]] : [[0, 6, 1, true]]), aria:'balk ABCD.EFGH met de lichaamsdiagonaal AG' }); };
          return { vraag:'Hoe lang is AG?', context:'Een balk ABCD.EFGH is ' + l + ' cm lang (AB), ' + b + ' cm breed (BC) en ' + h + ' cm hoog (CG). Bereken de lichaamsdiagonaal AG. Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'In welke rechthoekige driehoek reken je eerst?', 'driehoek ABC in het grondvlak', ['driehoek ACG', 'driehoek ABG'], 'Je weet AB en BC. Daarmee vind je eerst AC, de diagonaal van het grondvlak.'),
            St('AC² = AB² + BC² = ' + l + '² + ' + b + '² =', String(s1), (l * l) + ' + ' + (b * b) + '. Neem nog geen wortel: je hebt AC² nodig.', null, { waarom:'Je hoeft AC niet uit te rekenen. Met AC² rond je pas aan het eind af.' }),
            kstap(R, 'Waar zit de rechte hoek in driehoek ACG?', 'bij C', ['bij A', 'bij G'], 'CG staat recht omhoog op het grondvlak. Dus de rechte hoek zit bij C.'),
            St('AG² = AC² + CG² = ' + s1 + ' + ' + h + '² =', String(s2), s1 + ' + ' + (h * h) + '.', Fz([String(s2)], F(String(s1 + h), 'Ook CG moet in het kwadraat: ' + h + '² = ' + (h * h) + '.'))),
            St('AG = √' + s2 + (exact ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(d, 1, 'cm'), 'Gebruik de wortelknop: √' + s2 + ' = ' + T(d, { dec:4 }) + (exact ? '.' : '…'), F(String(s2), 'Je vergat de wortel te nemen.'), { e:'cm' }) ] };
        } }
    ] });

  /* ================= sinus, cosinus en tangens (vmbo) ================= */
  var FN = { sin:'sin', cos:'cos', tan:'tan' };
  var VERH = { sin:'sin = overstaande zijde : schuine zijde', cos:'cos = aanliggende zijde : schuine zijde', tan:'tan = overstaande zijde : aanliggende zijde' };
  /* rechthoekige driehoek: hoekpunt P (met de hoek), R (rechte hoek), Q; zijden PR = aanliggend, RQ = overstaand, PQ = schuin */
  function gonDriehoek(R){
    var nm = R.kies([['A', 'C', 'B'], ['P', 'R', 'Q'], ['K', 'M', 'L'], ['D', 'F', 'E'], ['B', 'C', 'A']]), rot = R.kies([0, 0, 90, 180, 270, 30, 330]);
    return { P:nm[0], Rn:nm[1], Q:nm[2], rot:rot, zijde:{ aan:nm[0] + nm[1], over:nm[1] + nm[2], schuin:nm[0] + nm[2] } };
  }
  function gonBeeld(d, al, lab, hoekLab){
    var pts = [[0, 0], [Math.cos(al * RAD), 0], [Math.cos(al * RAD), Math.sin(al * RAD)]].map(function(p){ return draai(p, d.rot); });
    return tekenFig(pts, { zijde:[lab.aan, lab.over, lab.schuin], hoek:[hoekLab, '', ''], namen:[d.P, d.Rn, d.Q], zk:[K[3], K[2], K[0]], W:360, H:260, aria:'rechthoekige driehoek ' + d.P + d.Rn + d.Q + ' met de rechte hoek bij ' + d.Rn });
  }
  function welkeVerh(a, b){ var s = [a, b].sort().join('+'); return { 'aan+schuin':'cos', 'over+schuin':'sin', 'aan+over':'tan' }[s]; }
  var NAAM = { aan:'aanliggende zijde', over:'overstaande zijde', schuin:'schuine zijde' };
  G.push({ groep:{ id:'wi-gon', niveau:'vmbo', domein:'meetkunde', naam:'Sinus, cosinus en tangens',
      uit:'In een rechthoekige driehoek horen de hoeken en de verhoudingen van de zijden bij elkaar. Met SOS CAS TOA kies je de goede verhouding en reken je een zijde of een hoek uit.' },
    doelen:[
      { id:'wi-gon-kies', naam:'Welke verhouding: SOS CAS TOA', kort:'Kijk vanuit de hoek welke twee zijden je gebruikt: overstaand en schuin is sinus, aanliggend en schuin cosinus, overstaand en aanliggend tangens',
        uit:'<p>Ga in gedachten in de hoek staan. De <b>schuine zijde</b> ligt tegenover de rechte hoek. De <b>overstaande zijde</b> ligt tegenover jouw hoek. De <b>aanliggende zijde</b> raakt jouw hoek, maar is niet de schuine.</p><p>Welke twee zijden gebruik je? Onthoud <b>SOS CAS TOA</b>: <b>S</b>inus = <b>O</b>verstaand : <b>S</b>chuin, <b>C</b>osinus = <b>A</b>anliggend : <b>S</b>chuin, <b>T</b>angens = <b>O</b>verstaand : <b>A</b>anliggend.</p>',
        wanneer:'je met een hoek en zijden in een rechthoekige driehoek gaat rekenen.',
        maak:function(R){
          var d = gonDriehoek(R), al = R.heel(25, 65), soorten = R.hussel(['aan', 'over', 'schuin']).slice(0, 2), lab = { aan:'', over:'', schuin:'' }, wat = R.heel(0, 1) === 1;
          var n1v = R.heel(4, 12), n2v = n1v + R.heel(2, 6);
          if (wat){ soorten.forEach(function(z, i){ lab[z] = (z === 'schuin' ? n2v : soorten.indexOf('schuin') >= 0 ? n1v : (i ? n2v : n1v)) + ' cm'; }); }
          else { lab[soorten[0]] = n1v + ' cm'; lab[soorten[1]] = '?'; if (soorten[1] !== 'schuin' && soorten[0] === 'schuin') lab.schuin = n2v + ' cm'; }
          var f = welkeVerh(soorten[0], soorten[1]), bl = gonBeeld(d, al, lab, wat ? '?' : al + '°'), opties = [VERH.sin, VERH.cos, VERH.tan];
          return eindKeuze({ vraag:'Welke verhouding gebruik je?', context:wat ? 'Je kent twee zijden en zoekt hoek ' + d.P + '.' : 'Je kent hoek ' + d.P + ' en één zijde, en zoekt de zijde met het vraagteken.', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke zijde is de schuine zijde?', d.zijde.schuin, [d.zijde.aan, d.zijde.over], 'De schuine zijde ligt tegenover de rechte hoek bij ' + d.Rn + '.'),
            kstap(R, 'Welke zijde is de overstaande zijde van hoek ' + d.P + '?', d.zijde.over, [d.zijde.aan, d.zijde.schuin], 'Die ligt tegenover hoek ' + d.P + ' en raakt ' + d.P + ' dus niet.'),
            kstap(R, 'Je gebruikt de ' + NAAM[soorten[0]] + ' (' + d.zijde[soorten[0]] + ') en de ' + NAAM[soorten[1]] + ' (' + d.zijde[soorten[1]] + '). Welke verhouding?', VERH[f], [], 'SOS CAS TOA: ' + (f === 'sin' ? 'overstaand en schuin is sinus.' : f === 'cos' ? 'aanliggend en schuin is cosinus.' : 'overstaand en aanliggend is tangens.'), { orde:opties }) ] });
        } },
      { id:'wi-gon-zijde', naam:'Een zijde berekenen', kort:'Kies de verhouding, vul in wat je weet, en reken de onbekende zijde uit: keer als hij boven staat, delen als hij onder staat',
        uit:'<p>Hoek A is 35°, de aanliggende zijde is 8 cm. Hoe lang is de overstaande zijde x? Overstaand en aanliggend: <b>tangens</b>. tan(35°) = x : 8.</p><p>Staat x <b>boven</b> de deelstreep? Dan vermenigvuldig je: x = <b>8 × tan(35°)</b> ≈ 5,6 cm.</p><p>Staat x <b>onder</b> de deelstreep, zoals in tan(35°) = 8 : x? Dan deel je: x = <b>8 : tan(35°)</b>. Zet je rekenmachine in graden (D of DEG).</p>',
        wanneer:'je een hoek en een zijde weet en een andere zijde zoekt.',
        maak:function(R){
          var d, al, L, ken, zoek, f, x, boven;
          do { d = gonDriehoek(R); al = R.heel(20, 70); L = R.heel(3, 15); var p = R.hussel(['aan', 'over', 'schuin']); ken = p[0]; zoek = p[1];
            f = welkeVerh(ken, zoek); var v = { sin:Math.sin(al * RAD), cos:Math.cos(al * RAD), tan:Math.tan(al * RAD) }[f];
            boven = (f === 'sin' && zoek === 'over') || (f === 'cos' && zoek === 'aan') || (f === 'tan' && zoek === 'over');
            x = boven ? L * v : L / v; } while (grens(x, 1) || x > 60);
          var lab = { aan:'', over:'', schuin:'' }; lab[ken] = L + ' cm'; lab[zoek] = '?';
          var bl = gonBeeld(d, al, lab, al + '°'), fs = f + '(' + al + '°)';
          var o1 = 'x = ' + L + ' ' + X + ' ' + fs, o2 = 'x = ' + L + ' : ' + fs, o3 = 'x = ' + fs + ' : ' + L;
          return { vraag:d.zijde[zoek] + ' = ?', context:'Hoek ' + d.P + ' is ' + al + '° en ' + d.zijde[ken] + ' = ' + L + ' cm. Bereken ' + d.zijde[zoek] + '. Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Je kent de ' + NAAM[ken] + ' en zoekt de ' + NAAM[zoek] + '. Welke verhouding?', VERH[f], [], 'SOS CAS TOA. Gebruik de twee zijden die erbij horen.', { orde:[VERH.sin, VERH.cos, VERH.tan] }),
            kstap(R, 'Vul in: ' + fs + ' = ' + (boven ? 'x : ' + L : L + ' : x') + '. Hoe reken je x uit?', boven ? o1 : o2, [o1, o2, o3], boven ? 'x staat boven de deelstreep: vermenigvuldig met ' + L + '.' : 'x staat onder de deelstreep: deel ' + L + ' door ' + fs + '.'),
            St('x ≈ (rond af op 1 decimaal)', af(x, 1, 'cm'), 'Tik in: ' + (boven ? L + ' ' + X + ' ' + fs : L + ' : ' + fs) + ' = ' + T(x, { dec:4 }) + '…', Fz(af(x, 1, 'cm'), F(T(rnd(boven ? L / (x / L) : L * (L / x), 1), { dec:1, vast:true }), boven ? 'Je deelde. x staat boven de deelstreep: vermenigvuldig.' : 'Je vermenigvuldigde. x staat onder de deelstreep: deel.')), { e:'cm' }) ] };
        } },
      { id:'wi-gon-hoek', naam:'Een hoek berekenen', kort:'Kies de verhouding, deel de twee zijden en gebruik sin⁻¹, cos⁻¹ of tan⁻¹',
        uit:'<p>Ken je twee zijden, dan kun je een <b>hoek</b> uitrekenen. Kies eerst de verhouding met SOS CAS TOA.</p><p>Overstaand 5 en aanliggend 8: tan(A) = 5 : 8. Om de hoek te vinden gebruik je de knop <b>tan⁻¹</b> (vaak Shift tan): A = tan⁻¹(5 : 8) ≈ <b>32,0°</b>.</p><p>Bij sinus gebruik je sin⁻¹ en bij cosinus cos⁻¹. Zet je rekenmachine in graden.</p>',
        wanneer:'je twee zijden van een rechthoekige driehoek weet en een hoek zoekt.',
        maak:function(R){
          var d, f, k1, k2, teller, noemer, hoek;
          do { d = gonDriehoek(R); f = R.kies(['sin', 'cos', 'tan']); k1 = f === 'cos' ? 'aan' : 'over'; k2 = f === 'tan' ? 'aan' : 'schuin';
            teller = R.heel(3, 14); noemer = f === 'tan' ? R.heel(3, 14) : teller + R.heel(1, 9);
            hoek = { sin:Math.asin(teller / noemer), cos:Math.acos(teller / noemer), tan:Math.atan(teller / noemer) }[f] / RAD;
          } while (teller === noemer || grens(hoek, 1) || hoek < 10 || hoek > 80);
          var lab = { aan:'', over:'', schuin:'' }; lab[k1] = teller + ' cm'; lab[k2] = noemer + ' cm';
          var bl = gonBeeld(d, hoek, lab, '?'), inv = f + '⁻¹(' + teller + ' : ' + noemer + ')';
          return { vraag:'Hoek ' + d.P + ' = ?', context:d.zijde[k1] + ' = ' + teller + ' cm en ' + d.zijde[k2] + ' = ' + noemer + ' cm. Bereken hoek ' + d.P + '. Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Je kent de ' + NAAM[k1] + ' en de ' + NAAM[k2] + '. Welke verhouding?', VERH[f], [], 'SOS CAS TOA: welke verhouding gebruikt deze twee zijden?', { orde:[VERH.sin, VERH.cos, VERH.tan] }),
            kstap(R, f + '(' + d.P + ') = ' + teller + ' : ' + noemer + '. Wat tik je in?', inv, [f + '(' + teller + ' : ' + noemer + ')', f + '⁻¹(' + noemer + ' : ' + teller + ')'], 'Om van de verhouding naar de hoek te gaan, gebruik je ' + f + '⁻¹. De ' + NAAM[k1] + ' (' + teller + ') staat voor de deelstreep.'),
            St('Hoek ' + d.P + ' ≈ (rond af op 1 decimaal)', af(hoek, 1, '°'), 'Tik in: ' + inv + ' = ' + T(hoek, { dec:4 }) + '…', null, { e:'°' }) ] };
        } }
    ] });

  /* ================= vergroten en inhoud (vmbo) ================= */
  G.push({ groep:{ id:'wi-ruimte', niveau:'vmbo', domein:'meetkunde', naam:'Vergroten en inhoud',
      uit:'Wat er met oppervlakte en inhoud gebeurt als je vergroot, de inhoud van piramide en kegel, en de goede inhoudsformule kiezen. De losse formules voor balk, prisma en cilinder staan in de leerroute rekenen.' },
    doelen:[
      { id:'wi-verg-factor', naam:'Vergroten: lengte, oppervlakte en inhoud', kort:'Lengtes keer k, oppervlakte keer k², inhoud keer k³',
        uit:'<p>Bij een vergroting worden alle lengtes <b>k keer</b> zo groot. k is de <b>lengtefactor</b>: nieuwe lengte : oude lengte.</p><p>De <b>oppervlakte</b> wordt dan <b>k²</b> keer zo groot: een vierkant met zijden 2 keer zo lang heeft 4 keer zoveel hokjes. De <b>inhoud</b> wordt <b>k³</b> keer zo groot: 2 keer zo lang, breed en hoog geeft 8 keer zoveel blokjes.</p><p>Bij verkleinen is k kleiner dan 1, bijvoorbeeld 0,5.</p>',
        wanneer:'een figuur of voorwerp vergroot of verkleind wordt en je de oppervlakte of inhoud zoekt.',
        maak:function(R){
          var it = R.kies([
            { wat:'Een doos', mt:'hoog', oud:[5, 6, 8, 10, 12], soort:'inhoud', ov:[120, 150, 240, 300, 400], e:'cm³' },
            { wat:'Een vaas', mt:'hoog', oud:[10, 12, 15, 20], soort:'inhoud', ov:[500, 800, 900, 1200], e:'cm³' },
            { wat:'Een foto', mt:'breed', oud:[6, 8, 10, 12, 15], soort:'opp', ov:[48, 60, 90, 120, 150], e:'cm²' },
            { wat:'Een logo', mt:'breed', oud:[4, 5, 8, 10], soort:'opp', ov:[12, 20, 30, 45], e:'cm²' },
            { wat:'Een model van een huis', mt:'hoog', oud:[10, 12, 16, 20], soort:'opp', ov:[200, 240, 300], e:'cm²', vlak:'de gevel' },
            { wat:'Een beeldje', mt:'hoog', oud:[8, 10, 12, 20], soort:'lengte', ov:[3, 4, 5, 6], e:'cm', lmaat:'breed' } ]);
          var k = R.kies([2, 3, 4, 1.5, 2.5, 0.5]), oud = R.kies(it.oud), nieuw = oud * k, ov = R.kies(it.ov), f = it.soort === 'inhoud' ? k * k * k : it.soort === 'opp' ? k * k : k, uit = Math.round(ov * f * 1e6) / 1e6;
          var vr = it.soort === 'inhoud' ? 'de inhoud' : it.soort === 'opp' ? 'de oppervlakte' + (it.vlak ? ' van ' + it.vlak : '') : 'hoe ' + it.lmaat + ' het beeldje dan is';
          var ctx = it.wat + ' is ' + oud + ' cm ' + it.mt + (it.soort === 'lengte' ? ' en ' + ov + ' cm ' + it.lmaat : ' en ' + (it.soort === 'inhoud' ? 'heeft een inhoud van ' : 'heeft' + (it.vlak ? ' een gevel met een oppervlakte van ' : ' een oppervlakte van ')) + T(ov) + ' ' + it.e) + '. Je maakt een ' + (k < 1 ? 'verkleining' : 'vergroting') + ' die ' + T(nieuw) + ' cm ' + it.mt + ' is.';
          var keuzes = ['k (een lengte)', 'k² (een oppervlakte)', 'k³ (een inhoud)'], goedK = it.soort === 'inhoud' ? keuzes[2] : it.soort === 'opp' ? keuzes[1] : keuzes[0];
          var st = [
            St('De lengtefactor k = nieuw : oud = ' + T(nieuw) + ' : ' + oud + ' =', T(k), 'Deel de nieuwe lengte door de oude.', Fz([T(k)], F(T(oud / nieuw), 'Andersom: nieuw gedeeld door oud.'))),
            kstap(R, 'Je zoekt ' + vr + '. Met welke factor reken je?', goedK, [], it.soort === 'inhoud' ? 'Inhoud gaat in drie richtingen mee: lengte, breedte en hoogte. Dus k³.' : it.soort === 'opp' ? 'Oppervlakte gaat in twee richtingen mee. Dus k².' : 'Een lengte gaat gewoon keer k.', { orde:keuzes }) ];
          if (it.soort !== 'lengte') st.push(St(it.soort === 'inhoud' ? 'k³ = ' + T(k) + ' ' + X + ' ' + T(k) + ' ' + X + ' ' + T(k) + ' =' : 'k² = ' + T(k) + ' ' + X + ' ' + T(k) + ' =', T(f), 'Vermenigvuldig k ' + (it.soort === 'inhoud' ? 'drie' : 'twee') + ' keer met zichzelf.', Fz([T(f)], F(T(k * (it.soort === 'inhoud' ? 3 : 2)), 'Een macht is keer zichzelf, niet keer ' + (it.soort === 'inhoud' ? 3 : 2) + '.'))));
          st.push(St((it.soort === 'inhoud' ? 'De nieuwe inhoud' : it.soort === 'opp' ? 'De nieuwe oppervlakte' : 'De nieuwe breedte') + ': ' + T(ov) + ' ' + X + ' ' + T(f) + ' =', metE(T(uit), it.e), 'Doe de oude maat keer de factor.', Fz(metE(T(uit), it.e), F(T(ov * k), 'Je deed alleen keer k. Gebruik ' + (it.soort === 'inhoud' ? 'k³' : 'k²') + '.')), { e:it.e }));
          return { vraag:it.soort === 'inhoud' ? 'Nieuwe inhoud?' : it.soort === 'opp' ? 'Nieuwe oppervlakte?' : 'Nieuwe breedte?', context:ctx + (it.soort === 'lengte' ? ' Hoe breed is de ' + (k < 1 ? 'verkleining' : 'vergroting') + '?' : ' Wat is ' + vr + ' van de ' + (k < 1 ? 'verkleining' : 'vergroting') + '?'), eenheid:it.e, stappen:st };
        } },
      { id:'wi-inh-piramide', naam:'Inhoud van piramide en kegel', kort:'Inhoud = ⅓ × grondvlak × hoogte; bij een kegel is het grondvlak een cirkel',
        uit:'<p>Een <b>piramide</b> past precies <b>3 keer</b> in een balk met hetzelfde grondvlak en dezelfde hoogte. Daarom: <b>inhoud = ⅓ × grondvlak × hoogte</b>.</p><p>Piramide met een grondvlak van 6 bij 6 cm en een hoogte van 10 cm: grondvlak 36 cm², inhoud 36 × 10 : 3 = <b>120 cm³</b>.</p><p>Een <b>kegel</b> is een piramide met een rond grondvlak: grondvlak = π × r². Reken door zonder tussendoor af te ronden.</p>',
        wanneer:'een figuur naar een punt toe loopt, zoals een piramide, puntzak of ijshoorntje.',
        maak:function(R){
          var v = R.kies(['vk', 'rh', 'kegel']), st, V, bl, ctx, e = 'cm³';
          if (v === 'kegel'){
            var r = R.heel(2, 10), h = R.heel(4, 20); V = Math.PI * r * r * h / 3;
            if (grens(V, 1)) h++; V = Math.PI * r * r * h / 3;
            bl = rond('kegel', r, h, { r:'r = ' + r, h:'h = ' + h });
            ctx = 'Een kegel heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Rond af op 1 decimaal.';
            st = [
              St('De straal in het kwadraat: r² = ' + r + ' ' + X + ' ' + r + ' =', String(r * r), r + ' keer zichzelf.', Fz([String(r * r)], F(String(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.'))),
              St('Het grondvlak is een cirkel: π ' + X + ' ' + (r * r) + ' ≈ (rond af op 1 decimaal)', af(Math.PI * r * r, 1, 'cm²'), 'Tik in: π ' + X + ' ' + (r * r) + ' = ' + T(Math.PI * r * r, { dec:4 }) + '…', null, { e:'cm²' }),
              St('Inhoud = π ' + X + ' ' + (r * r) + ' ' + X + ' ' + h + ' : 3 ≈ (rond af op 1 decimaal)', af(V, 1, e), 'Tik alles in één keer in: π ' + X + ' ' + (r * r) + ' ' + X + ' ' + h + ' : 3 = ' + T(V, { dec:4 }) + '…', Fz(af(V, 1, e), F(T(rnd(V * 3, 1), { dec:1, vast:true }), 'Vergeet niet te delen door 3.')), { e:e }) ];
          } else {
            var l = R.heel(3, 12), b = v === 'vk' ? l : R.heel(3, 12), hh = R.heel(4, 15), Gv = l * b; V = Gv * hh / 3;
            bl = (function(){ var pts = [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [l / 2, hh, b / 2], [l / 2, 0, b / 2]];
              return ruimte(pts, [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [0, 4], [1, 4], [2, 4], [3, 4, 1]], { maten:[[0, 1, l + ' cm'], [1, 2, b + ' cm'], [5, 4, 'h = ' + hh]], lijnen:[[5, 4, 3, true]], d:0.55, aria:'piramide met de hoogte gestippeld' }); })();
            ctx = 'Een piramide heeft een ' + (v === 'vk' ? 'vierkant grondvlak van ' + l + ' bij ' + l : 'rechthoekig grondvlak van ' + l + ' bij ' + b) + ' cm en is ' + hh + ' cm hoog.' + (V === Math.round(V) ? '' : ' Rond af op 1 decimaal.');
            st = [
              St('Het grondvlak: ' + l + ' ' + X + ' ' + b + ' =', metE(String(Gv), 'cm²'), 'Lengte keer breedte.', null, { e:'cm²' }),
              St('Grondvlak ' + X + ' hoogte: ' + Gv + ' ' + X + ' ' + hh + ' =', String(Gv * hh), Gv + ' keer ' + hh + '.'),
              St('Inhoud = ' + (Gv * hh) + ' : 3 ' + (V === Math.round(V) ? '=' : '≈ (rond af op 1 decimaal)'), af(V, 1, e), 'Een piramide is een derde van de balk eromheen: deel door 3.', Fz(af(V, 1, e), F(String(Gv * hh), 'Dat is de balk eromheen. Deel nog door 3.')), { e:e }) ];
          }
          return { vraag:v === 'kegel' ? 'Inhoud van de kegel?' : 'Inhoud van de piramide?', context:ctx, eenheid:e, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wi-inh-kies', naam:'Kies de juiste inhoudsformule', kort:'Recht omhoog (balk, prisma, cilinder): grondvlak × hoogte. Naar een punt (piramide, kegel): ⅓ × grondvlak × hoogte',
        uit:'<p>Kijk eerst naar de vorm. Is hij boven en onder <b>even groot</b>, zoals een balk, prisma of cilinder? Dan is de inhoud <b>grondvlak × hoogte</b>.</p><p>Loopt hij naar <b>een punt</b>, zoals een piramide of kegel? Dan is het <b>⅓ × grondvlak × hoogte</b>.</p><p>Kies daarna de formule voor het <b>grondvlak</b>: een rechthoek is l × b, een driehoek ½ × basis × hoogte, een cirkel π × r².</p>',
        wanneer:'je de inhoud van een ruimtefiguur zoekt en eerst moet bepalen welke formule past.',
        maak:function(R){
          var v = R.kies(['balk', 'prisma', 'cilinder', 'piramide', 'kegel']), inF = ['grondvlak × hoogte', '⅓ × grondvlak × hoogte'], grF = ['lengte × breedte', '½ × basis × hoogte', 'π × r²'];
          var punt = v === 'piramide' || v === 'kegel', gi = v === 'prisma' ? 1 : v === 'cilinder' || v === 'kegel' ? 2 : 0, Gv, V, gTekst, bl, ctx, d = 1, e = 'cm³';
          if (v === 'balk' || v === 'piramide'){ var l = R.heel(3, 12), b = R.heel(3, 10), h = R.heel(3, 15); Gv = l * b; V = punt ? Gv * h / 3 : Gv * h; gTekst = l + ' ' + X + ' ' + b;
            ctx = v === 'balk' ? 'Een doos is ' + l + ' cm lang, ' + b + ' cm breed en ' + h + ' cm hoog.' : 'Een piramide heeft een rechthoekig grondvlak van ' + l + ' bij ' + b + ' cm en is ' + h + ' cm hoog.';
            bl = v === 'balk' ? ruimte(balkPts(l, b, h), BALK_RIBBEN, { maten:[[0, 1, l + ' cm'], [1, 2, b + ' cm'], [2, 6, h + ' cm']], aria:'balk' })
              : ruimte([[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [l / 2, h, b / 2], [l / 2, 0, b / 2]], [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [0, 4], [1, 4], [2, 4], [3, 4, 1]], { maten:[[0, 1, l + ' cm'], [1, 2, b + ' cm'], [5, 4, 'h = ' + h]], lijnen:[[5, 4, 3, true]], aria:'piramide' }); }
          else if (v === 'prisma'){ var a1 = R.heel(3, 10), a2 = R.heel(3, 10), ll = R.heel(5, 20); if ((a1 * a2) % 2) a1++; Gv = a1 * a2 / 2; V = Gv * ll; gTekst = '½ ' + X + ' ' + a1 + ' ' + X + ' ' + a2;
            ctx = 'Een prisma heeft als grondvlak een rechthoekige driehoek met rechthoekszijden van ' + a1 + ' en ' + a2 + ' cm. Het prisma is ' + ll + ' cm lang.';
            bl = ruimte([[0, 0, 0], [a1, 0, 0], [0, a2, 0], [0, 0, ll], [a1, 0, ll], [0, a2, ll]], [[0, 1], [1, 2], [2, 0], [0, 3, 1], [1, 4], [2, 5], [3, 4, 1], [4, 5], [5, 3, 1]], { maten:[[0, 1, a1 + ' cm'], [0, 2, a2 + ' cm'], [1, 4, ll + ' cm']], d:0.35, aria:'prisma met een driehoek als grondvlak' }); }
          else { var r = R.heel(2, 9), hc = R.heel(4, 20); Gv = Math.PI * r * r; V = punt ? Gv * hc / 3 : Gv * hc; gTekst = 'π ' + X + ' ' + r + '²';
            if (grens(V, 1)){ hc++; V = punt ? Gv * hc / 3 : Gv * hc; }
            ctx = (v === 'cilinder' ? 'Een blik is een cilinder' : 'Een ijshoorntje is een kegel') + ' met een straal van ' + r + ' cm en een hoogte van ' + hc + ' cm.';
            bl = rond(v, r, hc, { r:'r = ' + r, h:'h = ' + hc }); }
          var heel = Math.abs(V - Math.round(V)) < 1e-9;
          ctx += heel ? '' : ' Rond af op 1 decimaal.';
          var hint1 = punt ? 'Een ' + v + ' loopt naar een punt: ⅓ × grondvlak × hoogte.' : 'Een ' + v + ' is boven en onder even groot: grondvlak × hoogte.';
          return { vraag:'Inhoud van de ' + (v === 'balk' ? 'doos' : v === 'cilinder' ? 'cilinder' : v) + '?', context:ctx, eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke inhoudsformule hoort bij een ' + v + '?', inF[punt ? 1 : 0], [], hint1, { orde:inF }),
            kstap(R, 'Het grondvlak is een ' + (gi === 0 ? 'rechthoek' : gi === 1 ? 'driehoek' : 'cirkel') + '. Welke formule?', grF[gi], [], gi === 0 ? 'Een rechthoek: lengte keer breedte.' : gi === 1 ? 'Een driehoek: de helft van basis keer hoogte.' : 'Een cirkel: π keer de straal in het kwadraat.', { orde:grF }),
            St('Grondvlak = ' + gTekst + (gi === 2 ? ' ≈ (rond af op 1 decimaal)' : ' ='), gi === 2 ? af(Gv, 1, 'cm²') : metE(T(Gv), 'cm²'), gi === 2 ? 'Tik in: π ' + X + ' ' + (r * r) + ' = ' + T(Gv, { dec:4 }) + '…' : 'Reken ' + gTekst + ' uit.', null, { e:'cm²' }),
            St('Inhoud = ' + (punt ? '⅓ ' + X + ' ' : '') + 'grondvlak ' + X + ' ' + (v === 'prisma' ? 'lengte' : 'hoogte') + (heel ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(V, 1, e), 'Reken met het grondvlak zonder afronden' + (punt ? ', en deel door 3.' : '.') + ' De inhoud is ' + T(V, { dec:4 }) + (heel ? '.' : '…'), Fz(af(V, 1, e), punt ? F(T(rnd(V * 3, 1), { dec:1, vast:true }), 'Vergeet niet te delen door 3.', T(rnd(V * 3, 1)), 'Vergeet niet te delen door 3.') : F(T(rnd(V / 3, 1), { dec:1, vast:true }), 'Een ' + v + ' loopt niet naar een punt: niet delen door 3.')), { e:e }) ] };
        } }
    ] });

  LEERROUTE.voeg('wiskunde', G);
})();
