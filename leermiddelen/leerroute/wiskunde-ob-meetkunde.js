/* De leerroute wiskunde: meetkunde in de onderbouw (klas 1 tot 3).
   Soorten hoeken en hoeken met drie letters, nevenhoeken, overstaande hoeken, F- en
   Z-hoeken, de hoekensom van een (gelijkbenige) driehoek; wat cm² is en welke eenheid
   past, omtrek en oppervlakte van rechthoek, vierkant, driehoek, parallellogram, trapezium,
   ruit en vlieger, vierkante maten omrekenen, de cirkel, samengestelde figuren
   (erbij of eraf); inhoud en oppervlakte van balk, prisma en cilinder, inhoudsmaten;
   Pythagoras; gelijkvormigheid (factor of verhoudingstabel); spiegelen, verschuiven
   en draaien in een assenstelsel. Elke manier een eigen doel.
   Hoeken met een letter en de hoekensom van een veelhoek staan in wiskunde-meetkunde.js.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, S = R0.schoon;
  var K = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var MIN = '−', X = '×', RAD = Math.PI / 180, PI = Math.PI;

  /* ================= hulpjes ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* ligt x vlak bij een afrondingsgrens? Dan kiezen we liever andere getallen */
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.03; }
  function heel(x){ return Math.abs(x - Math.round(x)) < 1e-9; }
  /* p : q is een eindig decimaal getal (zoals 1,875) als q na vereenvoudigen alleen factoren 2 en 5 heeft */
  function eindig(p, q){ var a = p, b = q; while (b){ var t = a % b; a = b; b = t; } q = q / a; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; }
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
  function gr(x){ return metE(T(x), '°', ['graden']); }
  /* afgerond op d decimalen, met of zonder eenheid */
  function af(x, d, e){ var r = rnd(x, d), v = metE(T(r, { dec:d, vast:true }), e), k = metE(T(r), e); return uniek(heel(x) ? k.concat(v) : v.concat(k)); }
  function afT(x, d){ return T(rnd(x, d), { dec:d, vast:true }); }
  function rondTekst(d){ return d === 0 ? 'rond af op een heel getal' : d === 1 ? 'rond af op 1 decimaal' : 'rond af op 2 decimalen'; }
  function Rond(d){ var t = rondTekst(d); return t.charAt(0).toUpperCase() + t.slice(1) + '.'; }
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
  function hk(a, b, c){ return '∠' + a + b + c; }
  function zn(p, q){ return [p, q].sort().join(''); }
  function plus(a, b){ return T(a) + (b < 0 ? ' ' + MIN + ' ' + T(-b) : ' + ' + T(b)); }
  /* coördinaten: (3, −2) en een controle die (3,-2), 3;-2 en A' = (3, -2) goedkeurt */
  function co(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  function coC(x, y){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^[a-z]['′’]*=?/, '');
      var m = /^\(?(-?\d+(?:\.\d+)?)[;,](-?\d+(?:\.\d+)?)\)?$/.exec(s);
      return !!m && Math.abs(+m[1] - x) < 1e-9 && Math.abs(+m[2] - y) < 1e-9;
    };
  }
  function StC(tekst, x, y, hint){ return { tekst:tekst, antwoord:[co(x, y)], controle:coC(x, y), invoer:'tekst', hint:hint }; }

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
      (o.stip ? ';stroke-dasharray:' + (o.stip === true ? '6 5' : o.stip) : '') + (o.op != null ? ';opacity:' + o.op : '') + (o.eo ? ';fill-rule:evenodd' : '') + ';stroke-linecap:round;stroke-linejoin:round';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="' + stijl({ s:o.k || 'var(--ink)', w:o.w || 2, stip:o.stip, op:o.op }) + '"/>'; }
  function lnP(a, b, o){ return ln(a[0], a[1], b[0], b[1], o); }
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
    if (o.t != null && o.t !== ''){ var m = pol(cx, cy, r + (o.lr || 17), a1 + d / 2); s += tx(m[0], m[1], o.t, { k:o.t === '?' ? K[1] : kl, vet:true, mid:true, fs:o.fs || 15 }); }
    return s;
  }
  /* het kleinste hoekje tussen twee richtingen vanuit V */
  function tussen(V, A, B, o){ var a1 = rich(V, A), d = norm360(rich(V, B) - a1); if (d > 180){ a1 = rich(V, B); d = 360 - d; } return hoekje(V[0], V[1], a1, a1 + d, o); }
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
  /* een streepje op het midden van een zijde: die zijden zijn even lang */
  function streepje(A, B){ var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nx = -(B[1] - A[1]) / L * 8, ny = (B[0] - A[0]) / L * 8; return ln(mx - nx, my - ny, mx + nx, my + ny, { w:2.5 }); }
  /* een maat naast een lijnstuk, aan de kant weg van punt C */
  function maatBij(A, B, t, C, o){
    o = o || {};
    var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nv = [(B[1] - A[1]) / L, -(B[0] - A[0]) / L];
    if (C && nv[0] * (C[0] - mx) + nv[1] * (C[1] - my) > 0) nv = [-nv[0], -nv[1]];
    if (o.binnen) nv = [-nv[0], -nv[1]];
    var afst = (o.afst || 14) + Math.abs(nv[0]) * 4 * String(t).length;
    return tx(mx + nv[0] * afst, my + nv[1] * afst, t, { mid:true, vet:true, fs:o.fs || 15, k:t === '?' ? K[1] : o.k || null });
  }
  function pth(P){ return P.map(function(q, i){ return (i ? 'L' : 'M') + n1(q[0]) + ' ' + n1(q[1]); }).join(' ') + ' Z'; }

  /* ---------- ruimtefiguren, scheef getekend ---------- */
  function schuin(p, d){ return [p[0] + p[2] * d * 0.62, p[1] + p[2] * d * 0.42]; }
  function ruimte(punten, ribben, o){
    o = o || {};
    var P = punten.map(function(p){ return schuin(p, o.d || 0.5); }), t = pas(P.concat(o.extra || []), o.W || 360, o.H || 250, 40), Q = P.map(t.f), s = '';
    (o.vlak || []).forEach(function(v){ s += pg(v[0].map(function(i){ return Q[i]; }), { f:v[1], fo:0.22, s:'none', w:0 }); });
    ribben.forEach(function(rb){ s += ln(Q[rb[0]][0], Q[rb[0]][1], Q[rb[1]][0], Q[rb[1]][1], { w:2.5, stip:rb[2] ? '6 5' : null, op:rb[2] ? 0.6 : null }); });
    (o.lijnen || []).forEach(function(l){ s += ln(Q[l[0]][0], Q[l[0]][1], Q[l[1]][0], Q[l[1]][1], { k:K[l[2] || 1], w:3, stip:l[3] ? '7 5' : null }); });
    var cx = 0, cy = 0; Q.forEach(function(q){ cx += q[0] / Q.length; cy += q[1] / Q.length; });
    (o.maten || []).forEach(function(m){ var a = Q[m[0]], b = Q[m[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ref = m[4] != null ? Q[m[4]] : [cx, cy], dx = mx - ref[0], dy = my - ref[1], L = Math.hypot(dx, dy) || 1, af2 = m[3] || 22; s += tx(mx + dx / L * af2, my + dy / L * af2, m[2], { mid:true, vet:true, fs:15, k:m[2] === '?' ? K[1] : null }); });
    return svg(o.W || 360, o.H || 250, s, o.aria || 'ruimtefiguur', o.max || 380);
  }
  /* balk: A B C D onder, E F G H boven; l = AB (breedte), b = BC (diepte), h = AE */
  function balkPts(l, b, h){ return [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [0, h, 0], [l, h, 0], [l, h, b], [0, h, b]]; }
  var BALK_RIBBEN = [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7, 1]];
  function cilinder(o){
    var W = 300, H = 270, cx = 150, rx = 95, ry = 28, top = 40, bod = 220, s = '';
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + bod, { stip:'6 5', op:0.6, w:2 });
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + bod, { w:2.5, f:K[0], fo:0.08 });
    s += '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" style="' + stijl({ w:2.5, f:K[0], fo:0.1 }) + '"/>' + ln(cx - rx, top, cx - rx, bod, { w:2.5 }) + ln(cx + rx, top, cx + rx, bod, { w:2.5 });
    if (o.diam) s += ln(cx - rx, top, cx + rx, top, { k:K[1], w:3 }) + tx(cx, top - 8, o.r, { vet:true, k:K[1] });
    else s += ln(cx, top, cx + rx, top, { k:K[1], w:3 }) + tx(cx + rx / 2, top - 8, o.r, { vet:true, k:K[1] });
    s += cir(cx, top, 3.5, { f:'var(--ink)', s:'none', w:0 }) + tx(cx + rx + 12, (top + bod) / 2, o.h, { vet:true, a:'start' });
    return svg(W + 70, H, s, o.aria || 'cilinder', 340);
  }

  /* ---------- hoeken tekenen ---------- */
  var KL4 = [K[0], K[3], K[2], K[4]];
  function namenRond(cx, cy, r, lijst){ return lijst.map(function(q){ var p = pol(cx, cy, r, q[0]); return tx(p[0], p[1], q[1], { mid:true, vet:true, fs:16 }); }).join(''); }
  /* één hoek: hoekpunt nm[1], benen naar nm[2] (richting rot) en nm[0] (richting rot + a) */
  function hoekBeeld(a, rot, lab, nm){
    var c = [200, 165], r = 132, s = '', pC = pol(c[0], c[1], r, rot), pA = pol(c[0], c[1], r, rot + a);
    s += hoekje(c[0], c[1], rot, rot + a, { t:lab, k:K[0], r:a < 40 ? 58 : 36, lr:a < 40 ? 26 : 24 });
    s += lnP(c, pC, { w:3 }) + lnP(c, pA, { w:3 }) + cir(c[0], c[1], 4, { f:'var(--ink)', s:'none', w:0 });
    s += namenRond(c[0], c[1], r + 15, [[rot + a, nm[0]], [rot, nm[2]]]) + namenRond(c[0], c[1], 20, [[rot + a / 2 + 180, nm[1]]]);
    return svg(400, 260, s, 'hoek ' + nm.join('') + ' van ' + lab, 420);
  }
  /* een rechte lijn A P B met een straal P C; hoek BPC = a */
  function nevenBeeld(rot, a, nm, lab0, lab1){
    var c = [200, 135], r = 112, s = '', pB = pol(c[0], c[1], r, rot), pA = pol(c[0], c[1], r, rot + 180), pC = pol(c[0], c[1], r, rot + a);
    if (lab0) s += hoekje(c[0], c[1], rot, rot + a, { t:lab0, k:lab0 === '?' ? K[1] : K[0], r:a < 40 ? 52 : 32, lr:a < 40 ? 24 : 22 });
    if (lab1) s += hoekje(c[0], c[1], rot + a, rot + 180, { t:lab1, k:lab1 === '?' ? K[1] : K[3], r:a > 140 ? 52 : 32, lr:a > 140 ? 24 : 22 });
    s += lnP(pA, pB, { w:3 }) + lnP(c, pC, { w:3 }) + cir(c[0], c[1], 4, { f:'var(--ink)', s:'none', w:0 });
    s += namenRond(c[0], c[1], r + 14, [[rot, nm[1]], [rot + 180, nm[0]], [rot + a, nm[2]]]) + namenRond(c[0], c[1], 18, [[rot + 180 + a / 2, nm[3]]]);
    return svg(400, 205, s, 'een rechte lijn met een straal erop', 420);
  }
  /* twee lijnen die elkaar snijden in S; hoek i loopt van richting d[i] naar d[i+1] */
  function kruisBeeld(r0, h, nm, lab){
    var c = [200, 130], r = 105, s = '', d = [r0, r0 + h, r0 + 180, r0 + 180 + h, r0 + 360];
    lab.forEach(function(t, i){ if (t){ var sp = d[i + 1] - d[i]; s += hoekje(c[0], c[1], d[i], d[i + 1], { t:t, k:t === '?' ? K[1] : K[0], r:sp < 45 ? 48 : 30, lr:sp < 45 ? 24 : 22 }); } });
    s += lnP(pol(c[0], c[1], r, d[2]), pol(c[0], c[1], r, d[0]), { w:3 }) + lnP(pol(c[0], c[1], r, d[3]), pol(c[0], c[1], r, d[1]), { w:3 }) + cir(c[0], c[1], 4, { f:'var(--ink)', s:'none', w:0 });
    s += namenRond(c[0], c[1], r + 15, [[d[0], nm[1]], [d[1], nm[2]], [d[2], nm[0]], [d[3], nm[3]]]);
    var vrij = lab.indexOf('') >= 0 ? lab.indexOf('') : 0, sp = d[vrij + 1] - d[vrij]; s += namenRond(c[0], c[1], Math.min(44, Math.max(17, 13 / Math.sin(sp / 2 * RAD))), [[(d[vrij] + d[vrij + 1]) / 2, nm[4]]]);
    return svg(400, 260, s, 'twee lijnen die elkaar snijden in ' + nm[4], 420);
  }
  /* twee evenwijdige lijnen k (boven) en l (onder) met een snijlijn m; plek 0 rechtsboven, 1 linksboven, 2 linksonder, 3 rechtsonder */
  var PLEK = ['rechtsboven', 'linksboven', 'linksonder', 'rechtsonder'];
  function evenwBeeld(t, labK, labL){
    var W = 430, H = 290, yP = 100, yQ = 200, dx = (yQ - yP) / Math.tan(t * RAD), xP = 215 + dx / 2, xQ = 215 - dx / 2, s = '';
    var ux = Math.cos(t * RAD), uy = -Math.sin(t * RAD), L1 = 75, d = [0, t, 180, 180 + t, 360];
    [[xP, yP, labK], [xQ, yQ, labL]].forEach(function(q){
      q[2].forEach(function(lb, i){ if (lb){ var sp = d[i + 1] - d[i]; s += hoekje(q[0], q[1], d[i], d[i + 1], { t:lb, k:lb === '?' ? K[1] : K[0], r:sp < 55 ? 40 : 26, lr:sp < 55 ? 24 : 22 }); } });
    });
    s += ln(25, yP, 395, yP, { w:3 }) + ln(25, yQ, 395, yQ, { w:3 }) + ln(xP + ux * L1, yP + uy * L1, xQ - ux * L1, yQ - uy * L1, { w:3 });
    [yP, yQ].forEach(function(y){ s += pad('M62 ' + (y - 7) + ' L71 ' + y + ' L62 ' + (y + 7), { w:2.5 }) + pad('M72 ' + (y - 7) + ' L81 ' + y + ' L72 ' + (y + 7), { w:2.5 }); });
    s += tx(405, yP, 'k', { mid:true, vet:true, fs:17, a:'start' }) + tx(405, yQ, 'l', { mid:true, vet:true, fs:17, a:'start' });
    s += tx(xP + ux * (L1 + 14), yP + uy * (L1 + 14), 'm', { mid:true, vet:true, fs:17 });
    return svg(W, H, s, 'twee evenwijdige lijnen k en l en een snijlijn m', 440);
  }

  /* ---------- gelijkvormige driehoeken ---------- */
  function triPts(a, b, c){ var x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x)); return [[0, 0], [c, 0], [x, y]]; }
  var ZIJ = [[0, 1], [1, 2], [0, 2]];
  function driehoekSvg(Q, nm, lab, extra){
    var s = pg(Q, { f:K[0], fo:0.08, w:2.5 }), cx = (Q[0][0] + Q[1][0] + Q[2][0]) / 3, cy = (Q[0][1] + Q[1][1] + Q[2][1]) / 3;
    [0, 1, 2].forEach(function(i){
      var V = Q[i], A = Q[(i + 1) % 3], B = Q[(i + 2) % 3], kl = [K[0], K[3], K[2]][i];
      s += tussen(V, A, B, { k:kl, r:17, recht:false });
      for (var j = 1; j <= i; j++){ var a1 = rich(V, A), dd = norm360(rich(V, B) - a1); if (dd > 180){ a1 = rich(V, B); dd = 360 - dd; } s += pad(boogPad(V[0], V[1], 17 + 5 * j, a1, a1 + dd), { s:kl, w:2 }); }
      var dx = V[0] - cx, dy = V[1] - cy, L = Math.hypot(dx, dy) || 1;
      s += tx(V[0] + dx / L * 17, V[1] + dy / L * 17, nm[i], { mid:true, vet:true, fs:16 });
    });
    ZIJ.forEach(function(z, i){ if (lab[i]) s += maatBij(Q[z[0]], Q[z[1]], lab[i], [cx, cy], { afst:13 }); });
    return s + (extra || '');
  }
  /* origineel (zijden a = BC, b = AC, c = AB) en beeld met factor k, gedraaid en soms gespiegeld */
  function tweeDriehoeken(o){
    var P1 = triPts(o.a, o.b, o.c), P2 = P1.map(function(p){ var q = [p[0] * o.k, p[1] * o.k]; if (o.spiegel) q[0] = -q[0]; return draai(q, o.rot || 0); });
    function bb(P){ var x = P.map(function(p){ return p[0]; }), y = P.map(function(p){ return p[1]; }); return [Math.min.apply(null, x), Math.max.apply(null, x), Math.min.apply(null, y), Math.max.apply(null, y)]; }
    var b1 = bb(P1), b2 = bb(P2), gap = 0.35 * Math.max(b1[1] - b1[0], b2[1] - b2[0]), sx = b1[1] + gap - b2[0], sy = (b1[2] + b1[3]) / 2 - (b2[2] + b2[3]) / 2;
    P2 = P2.map(function(p){ return [p[0] + sx, p[1] + sy]; });
    var t = pas(P1.concat(P2), 460, 240, 36), Q1 = P1.map(t.f), Q2 = P2.map(t.f);
    return svg(460, 240, driehoekSvg(Q1, o.n1, o.l1) + driehoekSvg(Q2, o.n2, o.l2), 'twee gelijkvormige driehoeken', 480);
  }
  var DRIE = [[4, 5, 6], [5, 6, 8], [6, 7, 9], [4, 6, 7], [5, 7, 8], [6, 8, 9], [3, 5, 6], [4, 7, 8], [5, 8, 9], [6, 6, 8], [5, 6, 6], [3, 4, 6]];

  /* ---------- assenstelsel met roosterpunten ---------- */
  function rooster(o){
    var u = 22, m = 26, Wd = 12 * u + 2 * m, s = '', i;
    function f(p){ return [m + (p[0] + 6) * u, m + (6 - p[1]) * u]; }
    for (i = -6; i <= 6; i++) s += lnP(f([i, -6]), f([i, 6]), { w:1, op:0.2 }) + lnP(f([-6, i]), f([6, i]), { w:1, op:0.2 });
    s += lnP(f([-6, 0]), f([6, 0]), { w:2, k:o.as === 'x' ? K[3] : null }) + lnP(f([0, -6]), f([0, 6]), { w:2, k:o.as === 'y' ? K[3] : null });
    if (o.as === 'x') s += lnP(f([-6, 0]), f([6, 0]), { w:4, k:K[3], op:0.5 });
    if (o.as === 'y') s += lnP(f([0, -6]), f([0, 6]), { w:4, k:K[3], op:0.5 });
    for (i = -6; i <= 6; i += 2) if (i){ var a = f([i, 0]), b = f([0, i]); s += tx(a[0], a[1] + 15, T(i), { fs:11, k:'var(--muted)' }) + tx(b[0] - 6, b[1] + 4, T(i), { fs:11, a:'end', k:'var(--muted)' }); }
    var e1 = f([6, 0]), e2 = f([0, 6]); s += tx(e1[0] + 4, e1[1] - 6, 'x', { fs:13, vet:true, a:'start' }) + tx(e2[0] + 7, e2[1] + 4, 'y', { fs:13, vet:true, a:'start' });
    function drie(P, kl, nm, acc){
      var Q = P.map(f), cx = (Q[0][0] + Q[1][0] + Q[2][0]) / 3, cy = (Q[0][1] + Q[1][1] + Q[2][1]) / 3, t = pg(Q, { f:kl, fo:0.15, s:kl, w:2.5 });
      Q.forEach(function(q, j){ var dx = q[0] - cx, dy = q[1] - cy, L = Math.hypot(dx, dy) || 1; t += cir(q[0], q[1], j === acc ? 5.5 : 3.5, { f:kl, s:'var(--kaart)', w:1.5 }) + tx(q[0] + dx / L * 14, q[1] + dy / L * 14, nm[j], { mid:true, vet:true, fs:14, k:j === acc ? kl : null }); });
      return t;
    }
    if (o.O){ var O = f([0, 0]); s += cir(O[0], O[1], 5, { f:K[4], s:'var(--kaart)', w:1.5 }) + tx(O[0] - 9, O[1] + 14, 'O', { vet:true, fs:13, a:'end' }); }
    s += drie(o.tri, K[0], ['A', 'B', 'C'], o.acc);
    if (o.beeld) s += drie(o.beeld, K[2], ["A'", "B'", "C'"], o.acc);
    if (o.pijl){ var p1 = f(o.pijl[0]), p2 = f(o.pijl[1]), ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      s += lnP(p1, p2, { k:K[3], w:2.5, stip:'6 4' }) + pad('M' + n1(p2[0] - 11 * Math.cos(ang - 0.4)) + ' ' + n1(p2[1] - 11 * Math.sin(ang - 0.4)) + ' L' + n1(p2[0]) + ' ' + n1(p2[1]) + ' L' + n1(p2[0] - 11 * Math.cos(ang + 0.4)) + ' ' + n1(p2[1] - 11 * Math.sin(ang + 0.4)), { s:K[3], w:2.5 }); }
    if (o.punt){ var q = f(o.punt[0]); s += cir(q[0], q[1], 5.5, { f:K[2], s:'var(--kaart)', w:1.5 }) + tx(q[0] + 9, q[1] - 9, o.punt[1], { vet:true, fs:14, a:'start', k:K[2] }); }
    return svg(Wd, Wd, s, o.aria || 'assenstelsel met driehoek ABC', 360);
  }
  function opp2(P){ return (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]); }
  function driePunten(R, lo, hi){
    var P;
    do { P = [0, 1, 2].map(function(){ return [R.heel(lo, hi), R.heel(lo, hi)]; }); } while (Math.abs(opp2(P)) < 6 || Math.abs(opp2(P)) > 40);
    return P;
  }
  function puntTekst(P){ return 'A' + co(P[0][0], P[0][1]) + ', B' + co(P[1][0], P[1][1]) + ' en C' + co(P[2][0], P[2][1]); }

  /* ================= de inhoud ================= */
  var G = [];
  var NAMEN3 = [['A', 'B', 'C'], ['P', 'Q', 'R'], ['K', 'L', 'M'], ['D', 'E', 'F'], ['S', 'T', 'U']];

  /* ================= 1 hoeken ================= */
  G.push({ groep:{ id:'wob-m-hoek', niveau:'onderbouw', domein:'meetkunde', naam:'Hoeken',
      uit:'Soorten hoeken, een hoek opschrijven met drie letters, en de eerste twee hoekregels: nevenhoeken en overstaande hoeken.' },
    doelen:[
      { id:'wob-m-hoek-soort', naam:'Soorten hoeken', kort:'Vergelijk de hoek met 90° en daarna met 180°: scherp, recht, stomp of gestrekt',
        uit:'<p>Een hoek meet je in <b>graden</b>. Er zijn vier soorten.</p><p>Een <b>scherpe</b> hoek is kleiner dan 90°. Een <b>rechte</b> hoek is precies 90°; die teken je met een hokje. Een <b>stompe</b> hoek zit tussen 90° en 180°. Een <b>gestrekte</b> hoek is precies 180°: de benen vormen samen één rechte lijn.</p><p>Vergelijk de hoek dus eerst met 90°. Is hij groter, vergelijk hem dan met 180°.</p>',
        wanneer:'je moet zeggen wat voor hoek iets is.',
        maak:function(R){
          var soort = R.kies([0, 0, 1, 2, 2, 3]), a = soort === 0 ? R.heel(2, 17) * 5 : soort === 1 ? 90 : soort === 2 ? R.heel(19, 35) * 5 : 180;
          var nm = R.kies(NAMEN3), rot = R.kies([0, 5, 10, 15, 20, 25, 30]), h = hk(nm[0], nm[1], nm[2]);
          var SRT = ['een scherpe hoek', 'een rechte hoek', 'een stompe hoek', 'een gestrekte hoek'], V90 = ['kleiner dan 90°', 'precies 90°', 'groter dan 90°'], V180 = ['kleiner dan 180°', 'precies 180°'];
          var bl = hoekBeeld(a, rot, a + '°', nm);
          var st = [kstap(R, 'Vergelijk ' + h + ' = ' + a + '° met 90°. De hoek is', V90[a < 90 ? 0 : a === 90 ? 1 : 2], [], a < 90 ? a + ' is minder dan 90.' : a === 90 ? 'Precies 90°: daarom staat er een hokje.' : a + ' is meer dan 90.', { orde:V90 })];
          if (a > 90) st.push(kstap(R, 'Vergelijk de hoek nu met 180°. De hoek is', V180[a < 180 ? 0 : 1], [], a < 180 ? a + ' is minder dan 180.' : 'Precies 180°: de benen vormen samen één rechte lijn.', { orde:V180 }));
          st.push(kstap(R, 'Wat voor hoek is ' + h + '?', SRT[soort], [], ['Kleiner dan 90° heet scherp.', 'Precies 90° heet recht.', 'Tussen 90° en 180° heet stomp.', 'Precies 180° heet gestrekt.'][soort], { orde:SRT }));
          return eindKeuze({ vraag:h + ' = ' + a + '°', context:'Wat voor hoek is ' + h + '?', beeld:bl, zelfBeeld:bl, stappen:st });
        } },
      { id:'wob-m-hoek-naam', naam:'Een hoek noteren met drie letters', kort:'Het hoekpunt staat in het midden: ∠ABC is de hoek bij B, tussen BA en BC',
        uit:'<p>Komen er bij een punt meer lijnen samen, dan is ∠B niet duidelijk. Je schrijft de hoek dan met <b>drie letters</b>.</p><p>Het <b>hoekpunt</b> staat altijd <b>in het midden</b>. De andere twee letters zijn punten op de twee benen. ∠ABC is de hoek bij B, tussen de benen BA en BC.</p><p>∠ABC en ∠CBA zijn dezelfde hoek. ∠BAC is een andere hoek: die zit bij A.</p>',
        wanneer:'er bij één punt meer dan twee lijnen samenkomen.',
        maak:function(R){
          var L = R.kies([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['K', 'L', 'M', 'N'], ['E', 'F', 'G', 'H']]), pts, ok, i;
          do { pts = [[0, 0], [R.heel(5, 7), R.heel(0, 1)], [R.heel(6, 8), R.heel(4, 5)], [R.heel(0, 2), R.heel(4, 5)]]; ok = true;
            for (i = 0; i < 4; i++){ var a = pts[i], b = pts[(i + 1) % 4], c = pts[(i + 2) % 4]; if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) < 6) ok = false; } } while (!ok);
          var dia = R.heel(0, 1), op = dia === 0 ? [0, 2] : [1, 3], Vi = R.kies(op.concat(op).concat([0, 1, 2, 3]));
          var buren = [(Vi + 3) % 4, (Vi + 1) % 4]; if (op.indexOf(Vi) >= 0) buren.push((Vi + 2) % 4);
          var paren = []; for (i = 0; i < buren.length; i++) for (var j = i + 1; j < buren.length; j++) paren.push([buren[i], buren[j]]);
          var pr = R.kies(paren), V = L[Vi], n1v = L[pr[0]], n2v = L[pr[1]], goed = '∠' + n1v + V + n2v;
          var rest = L.filter(function(x){ return x !== V; }), duo = [[rest[0], rest[1]], [rest[0], rest[2]], [rest[1], rest[2]]].map(function(p){ return p.join(' en '); });
          var goedDuo = [n1v, n2v].sort().join(' en ');
          var t = pas(pts, 380, 250, 40), P = pts.map(t.f), cx = 0, cy = 0; P.forEach(function(p){ cx += p[0] / 4; cy += p[1] / 4; });
          var s = pg(P, { f:K[0], fo:0.06, w:2.5 }) + lnP(P[op[0]], P[op[1]], { w:2.5 }) + tussen(P[Vi], P[pr[0]], P[pr[1]], { k:K[1], r:34, recht:false });
          P.forEach(function(p, k){ var dx = p[0] - cx, dy = p[1] - cy, Ln = Math.hypot(dx, dy) || 1; s += tx(p[0] + dx / Ln * 18, p[1] + dy / Ln * 18, L[k], { mid:true, vet:true, fs:16 }); });
          var bl = svg(380, 250, s, 'vierhoek ' + L.join('') + ' met een diagonaal en een gekleurde hoek', 400);
          return eindKeuze({ vraag:'Hoe schrijf je de gekleurde hoek?', context:'Vierhoek ' + L.join('') + ' heeft de diagonaal ' + L[op[0]] + L[op[1]] + '. Schrijf de gekleurde hoek met drie letters.', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Bij welk punt zit de gekleurde hoek? Dat is het hoekpunt.', V, rest, 'Kijk waar de twee benen van de gekleurde hoek samenkomen.'),
            kstap(R, 'Naar welke twee punten lopen de benen van de hoek?', goedDuo, duo.filter(function(d){ return d !== goedDuo; }), 'Volg elk been vanuit ' + V + ' tot het volgende punt.'),
            kstap(R, 'Hoe schrijf je de hoek?', goed, ['∠' + V + n1v + n2v, '∠' + n1v + n2v + V], 'Het hoekpunt ' + V + ' staat in het midden: ' + goed + '. Ook ∠' + n2v + V + n1v + ' is goed.') ] });
        } },
      { id:'wob-m-hoek-neven', naam:'Nevenhoeken', kort:'Twee hoeken naast elkaar op een rechte lijn zijn samen 180°',
        uit:'<p>Twee hoeken die <b>naast elkaar op een rechte lijn</b> liggen, heten <b>nevenhoeken</b>. Samen vormen ze een gestrekte hoek, dus samen zijn ze <b>180°</b>.</p><p>A, P en B liggen op één lijn en ∠BPC = 70°. Dan is ∠APC = 180 − 70 = <b>110°</b>.</p>',
        wanneer:'een hoek naast een bekende hoek op een rechte lijn ligt.',
        maak:function(R){
          var nm = R.kies([['A', 'B', 'C', 'P'], ['K', 'L', 'M', 'S'], ['D', 'E', 'F', 'O'], ['Q', 'R', 'T', 'M']]), a;
          do { a = R.heel(5, 31) * 5; } while (a === 90);
          var rot = R.kies([0, 0, 10, 20, 350, 340]), welk = R.heel(0, 1);
          var hB = hk(nm[1], nm[3], nm[2]), hA = hk(nm[0], nm[3], nm[2]);
          var gegeven = welk ? hB : hA, gw = welk ? a : 180 - a, gevraagd = welk ? hA : hB, uitk = 180 - gw;
          var bl = nevenBeeld(rot, a, nm, welk ? a + '°' : '?', welk ? '?' : (180 - a) + '°');
          return { vraag:gevraagd + ' = ?', context:nm[0] + ', ' + nm[3] + ' en ' + nm[1] + ' liggen op één rechte lijn. ' + gegeven + ' = ' + gw + '°. Bereken ' + gevraagd + '.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, gegeven + ' en ' + gevraagd + ' liggen samen op de rechte lijn ' + nm[0] + nm[1] + '. Samen zijn ze', '180°', [], 'Samen vormen ze een gestrekte hoek. Die is 180°.', { orde:['90°', '180°', '360°'] }),
            St(gevraagd + ' = 180 ' + MIN + ' ' + gw + ' =', gr(uitk), 'Trek de gegeven hoek af van 180°: 180 ' + MIN + ' ' + gw + '.', Fz(gr(uitk), F(String(gw), 'Dat is de gegeven hoek zelf.', String(360 - gw), 'Op een rechte lijn is het samen 180°, niet 360°.', String(Math.abs(90 - gw)), 'Een rechte lijn is 180°, niet 90°.')), { e:'°' }) ] };
        } },
      { id:'wob-m-hoek-overstaand', naam:'Overstaande hoeken', kort:'Twee lijnen snijden elkaar: de hoeken recht tegenover elkaar zijn even groot',
        uit:'<p>Twee rechte lijnen die elkaar snijden, maken <b>vier hoeken</b>. De hoeken die <b>recht tegenover elkaar</b> liggen, heten <b>overstaande hoeken</b>.</p><p>Overstaande hoeken zijn <b>even groot</b>. Is ∠BSC = 40°, dan is de hoek aan de overkant van S ook 40°.</p><p>Let op: de hoek <b>ernaast</b> is een nevenhoek. Die is 180 − 40 = 140°.</p>',
        wanneer:'twee rechte lijnen elkaar snijden.',
        maak:function(R){
          var nm = R.kies([['A', 'B', 'C', 'D', 'S'], ['K', 'L', 'M', 'N', 'O'], ['P', 'Q', 'R', 'T', 'M'], ['E', 'F', 'G', 'H', 'S']]), h;
          do { h = R.heel(6, 30) * 5; } while (h === 90);
          var r0 = R.kies([0, 10, 20, 30, 340, 350]), i = R.heel(0, 3), j = (i + 2) % 4;
          var NM = [[1, 2], [2, 0], [0, 3], [3, 1]].map(function(p){ return hk(nm[p[0]], nm[4], nm[p[1]]); });
          var w = i % 2 ? 180 - h : h, lab = ['', '', '', '']; lab[i] = w + '°'; lab[j] = '?';
          var bl = kruisBeeld(r0, h, nm, lab);
          return { vraag:NM[j] + ' = ?', context:'De lijnen ' + nm[0] + nm[1] + ' en ' + nm[2] + nm[3] + ' snijden elkaar in ' + nm[4] + '. ' + NM[i] + ' = ' + w + '°. Bereken ' + NM[j] + '.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke hoek ligt recht tegenover ' + NM[i] + '?', NM[j], [NM[(i + 1) % 4], NM[(i + 3) % 4]], 'Ga vanuit ' + NM[i] + ' door het snijpunt ' + nm[4] + ' heen naar de overkant.'),
            kstap(R, 'Overstaande hoeken zijn', 'even groot', [], 'Bij een kruis zijn de hoeken tegenover elkaar steeds gelijk.', { orde:['even groot', 'samen 180°'] }),
            St(NM[j] + ' =', gr(w), NM[j] + ' is even groot als ' + NM[i] + ': ' + w + '°.', Fz(gr(w), F(String(180 - w), 'Dat is de nevenhoek. Overstaande hoeken zijn even groot.')), { e:'°' }) ] };
        } }
    ] });

  /* ================= 2 oppervlakte van vlakke figuren ================= */
  var TRIPEL = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15]];
  /* een hoogtelijn van C naar het voetpunt V met een hokje; kant = 1 als het hokje rechts van de hoogte hoort */
  function hoogteLijn(C, V, kant, lab, lk){
    if (lk == null) lk = -kant;
    return lnP(C, V, { k:K[1], w:3, stip:'7 5' }) + hoekje(V[0], V[1], kant > 0 ? 0 : 90, kant > 0 ? 90 : 180, { k:'var(--ink)' }) +
      tx(V[0] + (lk > 0 ? 8 : -8), (V[1] + C[1]) / 2, lab, { vet:true, k:K[1], a:lk > 0 ? 'start' : 'end', mid:true, fs:15 });
  }
  function rect(x, y, w, h, o){ return pg([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
  function pijl(x1, y1, x2, y2, k){
    var a = Math.atan2(y2 - y1, x2 - x1), p = 9;
    return ln(x1, y1, x2, y2, { k:k, w:2.5 }) + pad('M' + n1(x2 - p * Math.cos(a - 0.45)) + ' ' + n1(y2 - p * Math.sin(a - 0.45)) + ' L' + n1(x2) + ' ' + n1(y2) + ' L' + n1(x2 - p * Math.cos(a + 0.45)) + ' ' + n1(y2 - p * Math.sin(a + 0.45)), { s:k, w:2.5 });
  }
  /* een uitkomst midden in een figuur, op een vlakje zodat de lijnen eronder niet storen */
  function bord(x, y, t){ var w = String(t).length * 9 + 18; return rect(x - w / 2, y - 15, w, 30, { f:'var(--kaart)', s:K[0], w:2 }) + tx(x, y, t, { mid:true, vet:true, k:K[0], fs:16 }); }
  /* lengte, oppervlakte en inhoud naast elkaar: 1, 2 en 3 richtingen; acc (0..2) licht op */
  function richtingen(acc, eh){
    eh = eh || 'cm';
    var s = '', mid = [78, 236, 392], OND = [['lengte', '1 richting'], ['oppervlakte', '2 richtingen'], ['inhoud', '3 richtingen']];
    if (acc >= 0) s += rect(mid[acc] - 74, 6, 148, 200, { f:K[2], fo:0.12, s:K[2], w:2 });
    /* lengte */
    s += ln(30, 112, 126, 112, { w:4 }) + ln(30, 104, 30, 120, { w:2.5 }) + ln(126, 104, 126, 120, { w:2.5 }) + tx(78, 92, '1 ' + eh, { vet:true, fs:16 }) + pijl(30, 136, 126, 136, K[1]);
    /* oppervlakte */
    s += rect(196, 62, 80, 80, { f:K[0], fo:0.18, w:2.5 }) + tx(236, 102, '1 ' + eh + '²', { mid:true, vet:true, fs:16 }) + pijl(196, 158, 276, 158, K[1]) + pijl(182, 142, 182, 62, K[1]);
    /* inhoud: een kubus, scheef getekend */
    var x = 352, y = 76, z = 66, dx = 26, dy = -20;
    s += pg([[x, y], [x + z, y], [x + z + dx, y + dy], [x + dx, y + dy]], { f:K[0], fo:0.3, w:2.5 }) + pg([[x + z, y], [x + z + dx, y + dy], [x + z + dx, y + z + dy], [x + z, y + z]], { f:K[0], fo:0.1, w:2.5 }) +
      rect(x, y, z, z, { f:K[0], fo:0.18, w:2.5 }) + tx(x + z / 2, y + z / 2, '1 ' + eh + '³', { mid:true, vet:true, fs:16 }) +
      pijl(x, y + z + 16, x + z, y + z + 16, K[1]) + pijl(x - 14, y + z, x - 14, y, K[1]) + pijl(x + z + 10, y + z + 6, x + z + 10 + dx, y + z + 6 + dy, K[1]);
    OND.forEach(function(o, i){ s += tx(mid[i], 180, o[0], { vet:true, fs:15, k:i === acc ? K[2] : null }) + tx(mid[i], 198, o[1], { fs:13, k:'var(--muted)' }); });
    return svg(470, 212, s, 'een lengte van 1 ' + eh + ', een vierkant van 1 ' + eh + '² en een kubus van 1 ' + eh + '³', 480);
  }
  /* een rechthoek van k bij r hokjes; o.rij telt de onderste rij, o.rijen nummert de rijen */
  function hokjesFig(k, r, o){
    o = o || {};
    var eh = o.eh || 'cm', u = Math.min(44, 300 / k, 190 / r), W = Math.max(300, k * u + 100), x0 = Math.max(48, (W - k * u) / 2), y0 = Math.max(44, u + 24), H = y0 + r * u + 34, s = '', i;
    /* het voorbeeldhokje is precies zo groot als een hokje in de figuur, anders klopt "= 1 cm²" niet */
    s += rect(14, 8, u, u, { f:K[0], fo:0.25, w:2 }) + tx(22 + u, 8 + u / 2, '= 1 ' + eh + '² (1 ' + eh + ' bij 1 ' + eh + ')', { a:'start', mid:true, fs:15 });
    s += rect(x0, y0, k * u, r * u, { f:K[0], fo:0.1, s:'none', w:0 });
    if (o.rij) s += rect(x0, y0 + (r - 1) * u, k * u, u, { f:K[2], fo:0.35, s:'none', w:0 });
    for (i = 1; i < k; i++) s += ln(x0 + i * u, y0, x0 + i * u, y0 + r * u, { w:1.2, op:0.55 });
    for (i = 1; i < r; i++) s += ln(x0, y0 + i * u, x0 + k * u, y0 + i * u, { w:1.2, op:0.55 });
    s += rect(x0, y0, k * u, r * u, { w:2.5 });
    if (o.rij) for (i = 0; i < k; i++) s += tx(x0 + (i + 0.5) * u, y0 + r * u + 17, String(i + 1), { mid:true, fs:15, k:K[2], vet:true });
    if (o.rijen) for (i = 0; i < r; i++) s += tx(x0 - 10, y0 + (r - i - 0.5) * u, String(i + 1), { mid:true, fs:15, a:'end', k:K[3], vet:true });
    if (o.tot) s += bord(x0 + k * u / 2, y0 + r * u / 2 - (o.rij && r < 3 ? u / 2 : 0), o.tot);
    return svg(W, H, s, 'een rechthoek van ' + k + ' bij ' + r + ' hokjes', W);
  }
  /* een rechthoek (of vierkant) met maten; o.raster tekent de hokjes van 1 bij 1 */
  function rhFig(l, b, e, o){
    o = o || {};
    var W = 420, H = 260, sc = Math.min(280 / l, 170 / b), w = l * sc, h = b * sc, x0 = (W - w) / 2 - 12, y0 = 40 + (180 - h) / 2, s = '', i;
    /* met hokjes: het voorbeeldhokje is precies zo groot als een hokje in de figuur; de figuur schuift zo nodig omlaag */
    if (o.raster){
      y0 = Math.max(y0, 8 + sc + 16); H = Math.max(H, y0 + h + 40);
      s += rect(14, 8, sc, sc, { f:K[0], fo:0.25, w:2 }) + tx(22 + sc, 8 + sc / 2, '= 1 ' + e + '²', { a:'start', mid:true, fs:14 });
    }
    s += rect(x0, y0, w, h, { f:K[0], fo:0.12, s:'none', w:0 });
    if (o.raster){ for (i = 1; i < l; i++) s += ln(x0 + i * sc, y0, x0 + i * sc, y0 + h, { w:1, op:0.4 }); for (i = 1; i < b; i++) s += ln(x0, y0 + i * sc, x0 + w, y0 + i * sc, { w:1, op:0.4 }); }
    s += rect(x0, y0, w, h, { w:2.5 });
    /* de hoekmarkering niet in een raster: daar zou hij een klein hokje lijken */
    if (!o.raster) s += hoekje(x0, y0 + h, 0, 90, { k:'var(--ink)' });
    var ver = o.vk ? 8 : 0;
    s += tx(x0 + w / 2, y0 + h + 20 + ver, l + ' ' + e, { mid:true, vet:true, fs:16 }) + tx(x0 + w + 10 + ver, y0 + h / 2, b + ' ' + e, { mid:true, vet:true, fs:16, a:'start' });
    if (o.vk) s += streepje([x0, y0 + h], [x0 + w, y0 + h]) + streepje([x0 + w, y0], [x0 + w, y0 + h]) + streepje([x0, y0], [x0 + w, y0]) + streepje([x0, y0], [x0, y0 + h]);
    if (o.tot) s += bord(x0 + w / 2, y0 + h / 2, o.tot);
    return svg(W, H, s, (o.vk ? 'een vierkant met zijden van ' : 'een rechthoek van ' + l + ' bij ') + b + ' ' + e, W);
  }
  /* een maat op een lijn, op een vlakje zodat de lijn er niet door loopt */
  function plak(x, y, t, k){ k = k || K[1]; var w = String(t).length * 8.5 + 10; return rect(x - w / 2, y - 11, w, 22, { f:'var(--kaart)', s:k, w:1.5 }) + tx(x, y, t, { mid:true, vet:true, k:k, fs:15 }); }
  /* ruit of vlieger: diagonaal d1 staat rechtop, d2 ligt; ze snijden op t onder de top. o.half kleurt wat er buiten valt */
  function ruitFig(d1, d2, t, o){
    o = o || {};
    var e = o.e || 'cm', tr = pas([[0, 0], [d2, d1]], 420, 250, 36), f = tr.f, s = '';
    var Tp = f([d2 / 2, d1]), Bt = f([d2 / 2, 0]), Lf = f([0, d1 - t]), Rt = f([d2, d1 - t]), M = f([d2 / 2, d1 - t]);
    var H0 = f([0, d1]), H1 = f([d2, d1]), L0 = f([0, 0]), L1 = f([d2, 0]);
    if (o.half) [[H0, Tp, Lf], [Tp, H1, Rt], [Lf, L0, Bt], [Rt, L1, Bt]].forEach(function(q){ s += pg(q, { f:K[3], fo:0.22, s:'none', w:0 }); });
    if (o.rh) s += pg([H0, H1, L1, L0], { stip:'6 5', w:2, op:0.75 }) + tx((L0[0] + L1[0]) / 2, L0[1] + 20, d2 + ' ' + e, { mid:true, fs:14, k:'var(--muted)', vet:true }) + tx(L1[0] + 10, (H1[1] + L1[1]) / 2, d1 + ' ' + e, { mid:true, fs:14, k:'var(--muted)', vet:true, a:'start' });
    s += pg([Tp, Rt, Bt, Lf], { f:K[0], fo:0.18, w:2.5 });
    s += lnP(Tp, Bt, { k:K[1], w:2.5 }) + lnP(Lf, Rt, { k:K[1], w:2.5 }) + hoekje(M[0], M[1], 0, 90, { k:K[1] });
    var wl = String(d2 + ' ' + e).length * 8.5 + 10;
    s += plak(M[0], (M[1] + Bt[1]) / 2, d1 + ' ' + e) + (M[0] - Lf[0] > wl + 16 ? plak((Lf[0] + M[0]) / 2, M[1], d2 + ' ' + e) : plak(H0[0] - 8 - wl / 2, M[1], d2 + ' ' + e));
    if (o.zijde) s += plak((Tp[0] + Rt[0]) / 2, (Tp[1] + Rt[1]) / 2, o.zijde, 'var(--ink)');
    if (o.tot) s += bord(210, 274, o.tot);
    return svg(420, 296, s, (o.vlieger ? 'een vlieger' : 'een ruit') + ' met diagonalen van ' + d1 + ' en ' + d2 + ' ' + e + ' in een rechthoek', 420);
  }
  /* 1 cm² in hokjes van 1 mm², of 1 m² = 100 bij 100 cm */
  function maatFig(m, o){
    o = o || {};
    var x0 = 70, y0 = 24, z = 200, s = '', i, groot = m === 'm', kl = groot ? 'cm' : 'mm', st = groot ? 100 : 10, gr = groot ? 'm' : 'cm';
    s += rect(x0, y0, z, z, { f:K[0], fo:0.1, s:'none', w:0 });
    /* bij 1 m² is een rij hokjes van 1 cm maar een dun streepje: 100 rijen passen erin */
    var rh = groot ? 4 : z / 10;
    if (o.rij) s += rect(x0, y0 + z - rh, z, rh, { f:K[2], fo:groot ? 0.8 : 0.35, s:'none', w:0 });
    if (!groot) for (i = 1; i < 10; i++) s += ln(x0 + i * z / 10, y0, x0 + i * z / 10, y0 + z, { w:1, op:0.5 }) + ln(x0, y0 + i * z / 10, x0 + z, y0 + i * z / 10, { w:1, op:0.5 });
    s += rect(x0, y0, z, z, { w:2.5 });
    if (!groot) s += rect(x0, y0, z / 10, z / 10, { f:K[1], fo:0.55, s:K[1], w:2 }) + pijl(x0 + z + 46, y0 + 6, x0 + z / 10 + 6, y0 + z / 20, K[1]) + tx(x0 + z + 50, y0 + 6, '1 mm²', { a:'start', mid:true, vet:true, k:K[1], fs:15 });
    s += tx(x0 + z / 2, y0 + z + 20, '1 ' + gr + ' = ' + st + ' ' + kl, { mid:true, vet:true, fs:15 }) + tx(x0 - 8, y0 + z / 2, st + ' ' + kl, { mid:true, vet:true, fs:15, a:'end' });
    if (o.rij) s += tx(x0 + z + 12, y0 + z - rh / 2, '1 rij: ' + T(st) + ' ' + kl + '²', { a:'start', mid:true, vet:true, k:K[2], fs:14 });
    if (o.tot) s += tx(x0 + z + 12, y0 + z / 2 - 10, st + ' rijen ' + X + ' ' + st, { a:'start', mid:true, vet:true, fs:15 }) + tx(x0 + z + 12, y0 + z / 2 + 12, '= ' + T(st * st) + ' ' + kl + '²', { a:'start', mid:true, vet:true, k:K[0], fs:16 });
    return svg(440, 260, s, groot ? 'een vierkante meter: 100 cm bij 100 cm' : 'een vierkante centimeter in hokjes van 1 mm²', 440);
  }
  G.push({ groep:{ id:'wob-m-opp', niveau:'onderbouw', domein:'meetkunde', naam:'Omtrek en oppervlakte',
      uit:'Wat een vierkante centimeter is en welke eenheid je kiest. Daarna de oppervlakte van rechthoek, vierkant, driehoek, parallellogram, trapezium, ruit en vlieger, elke vorm apart, en vierkante maten omrekenen.' },
    doelen:[
      { id:'wob-m-opp-cm2', naam:'Wat is een vierkante centimeter?', kort:'Oppervlakte is het aantal hokjes van 1 cm bij 1 cm: rijen × hokjes per rij, in cm²',
        uit:'<p>De <b>oppervlakte</b> zegt hoe groot een vlak is. Je meet dat met <b>hokjes</b>: vierkantjes van 1 cm bij 1 cm. Zo\'n hokje heet <b>één vierkante centimeter</b>, kort <b>1 cm²</b>.</p>' +
          '<p>Waarom cm²? Een hokje is 1 cm lang <b>en</b> 1 cm breed. Je meet dus in <b>twee richtingen</b>: cm × cm = cm². Het kleine tweetje betekent precies dat. Een lengte meet je maar in één richting, daarom staat daar gewoon cm.</p>' +
          '<p>Je hoeft niet elk hokje te tellen. De hokjes liggen in <b>rijen</b>. Tel hoeveel hokjes er in één rij liggen en hoeveel rijen er zijn. Doe dan <b>rijen × hokjes per rij</b>. 3 rijen van 5 hokjes is 3 × 5 = <b>15 cm²</b>.</p>' +
          '<p>Met meters gaat het net zo: een tegel van 1 m bij 1 m is <b>1 m²</b>, één vierkante meter.</p>',
        wanneer:'je wilt snappen wat oppervlakte is en waarom er cm² achter staat.',
        beeld:richtingen(1, 'cm'),
        maak:function(R){
          var k, r; do { k = R.heel(3, 9); r = R.heel(2, 6); } while (k === r);
          var tegel = R.heel(0, 3) === 0, e = tegel ? 'm' : 'cm', e2 = e + '²', A = k * r;
          var bl = function(n){ return hokjesFig(k, r, { eh:e, rij:n >= 1, rijen:n >= 2, tot:n >= 4 ? A + ' ' + e2 : '' }); };
          var tw = R.kies([['Een terras', 'het terras'], ['Een badkamervloer', 'de vloer'], ['Een schoolplein', 'het plein']]);
          var ctx = tegel ? tw[0] + ' ligt vol tegels van 1 m bij 1 m. Elk hokje in de figuur is één tegel. Hoe groot is ' + tw[1] + '?' : R.kies([
            'Elk hokje in de figuur is 1 cm bij 1 cm. Hoe groot is de oppervlakte van de rechthoek?',
            'Een chocoladereep heeft stukjes van 1 cm bij 1 cm. Elk hokje in de figuur is één stukje. Hoe groot is de reep?',
            'Een rechthoek is getekend op ruitjespapier met hokjes van 1 cm bij 1 cm. Hoe groot is de oppervlakte?',
            'Een vel stickers heeft vierkante stickers van 1 cm bij 1 cm, zie de figuur. Hoe groot is het vel?']);
          return { vraag:'Oppervlakte?', context:ctx, eenheid:e2, beeld:bl, zelfBeeld:bl(0), stappen:[
            St('Hoeveel hokjes liggen er in één rij?', metE(String(k), 'hokjes'), 'Tel de hokjes in de onderste rij, van links naar rechts.', Fz([String(k)], F(String(r), 'Dat is het aantal rijen. Tel de hokjes in één rij.'))),
            St('Hoeveel rijen liggen er op elkaar?', metE(String(r), 'rijen'), 'Tel van onder naar boven.', Fz([String(r)], F(String(k), 'Dat zijn de hokjes in één rij. Tel nu de rijen.'))),
            kstap(R, 'Elk hokje is 1 ' + e + ' bij 1 ' + e + '. Welke eenheid hoort bij de oppervlakte?', e2, [], 'Een hokje meet je in twee richtingen: ' + e + ' ' + X + ' ' + e + ' = ' + e2 + '.', { orde:[e, e2, e + '³'], waarom:'Het tweetje betekent: in twee richtingen gemeten, naar rechts en naar boven.' }),
            St('Oppervlakte = ' + r + ' rijen ' + X + ' ' + k + ' hokjes =', metE(String(A), e2), r + ' keer ' + k + '. Dat is evenveel als alle hokjes tellen, maar sneller.', Fz([String(A)], F(String(k + r), 'Dat is plus. Je wilt alle hokjes: doe keer.', String(2 * (k + r)), 'Dat is de omtrek: de rand. Je zoekt de hokjes binnenin.')), { e:e2, waarom:r + ' rijen van ' + k + ' hokjes van 1 ' + e2 + ' is ' + A + ' ' + e2 + '.' }) ] };
        } },
      { id:'wob-m-opp-eenheid', naam:'Welke eenheid: cm, cm² of cm³?', kort:'Tel de richtingen: een lengte zonder tweetje, een oppervlakte met ², een inhoud met ³',
        uit:'<p>Een <b>lengte</b> meet je in <b>één richting</b>: hoe lang, hoe breed, hoe hoog, of de rand eromheen. De eenheid is <b>mm, cm of m</b>, zonder tweetje.</p>' +
          '<p>Een <b>oppervlakte</b> meet je in <b>twee richtingen</b>: hoeveel hokjes erop passen. Denk aan een vloer, een muur of een scherm. De eenheid is <b>mm², cm² of m²</b>.</p>' +
          '<p>Een <b>inhoud</b> meet je in <b>drie richtingen</b>: hoeveel kubusjes erin passen. Denk aan water in een bak of zand in een kar. De eenheid is <b>mm³, cm³ of m³</b>.</p>' +
          '<p>Vraag jezelf dus af: meet ik een rand, een vlak of een ruimte?</p>',
        wanneer:'je twijfelt of er cm, cm² of cm³ achter je antwoord moet.',
        maak:function(R){
          var SIT = [
            ['de omtrek van een fotolijst', 0, 'cm', 'De omtrek is de rand: je meet langs een lijn.'],
            ['hoe hoog een deur is', 0, 'm', 'Hoe hoog: je meet in één richting, van onder naar boven.'],
            ['hoeveel hek je nodig hebt rond een tuin', 0, 'm', 'Een hek staat langs de rand: dat is een lengte.'],
            ['hoe dik een munt is', 0, 'mm', 'Hoe dik: je meet in één richting.'],
            ['hoe lang een mier is', 0, 'mm', 'Hoe lang: je meet in één richting.'],
            ['hoeveel plint je nodig hebt langs de muren van je kamer', 0, 'm', 'Een plint loopt langs de rand van de vloer: een lengte.'],
            ['hoe breed je schrift is', 0, 'cm', 'Hoe breed: je meet in één richting.'],
            ['hoeveel vloerbedekking je nodig hebt voor je kamer', 1, 'm', 'Je bedekt de vloer: een vlak, in de lengte en de breedte.'],
            ['hoeveel gras er op een voetbalveld ligt', 1, 'm', 'Het gras bedekt het veld: een vlak.'],
            ['hoe groot een bladzijde van je schrift is', 1, 'cm', 'Een bladzijde is een vlak: lengte en breedte.'],
            ['hoeveel muur je moet verven', 1, 'm', 'Verf komt op een vlak: lengte en hoogte.'],
            ['hoe groot het scherm van je telefoon is', 1, 'cm', 'Een scherm is een vlak: lengte en breedte.'],
            ['hoe groot het goudkleurige chipje op een bankpas is', 1, 'mm', 'Het chipje is een klein vlak: lengte en breedte.'],
            ['hoeveel karton er nodig is voor een doos', 1, 'cm', 'Karton is een vlak: je meet alle zijkanten in lengte en breedte.'],
            ['hoeveel water er in een aquarium past', 2, 'cm', 'Water vult een ruimte: lengte, breedte en hoogte.'],
            ['hoeveel zand er in een zandbak gaat', 2, 'm', 'Zand vult een ruimte: lengte, breedte en diepte.'],
            ['hoeveel beton er in een fundering gaat', 2, 'm', 'Beton vult een ruimte: drie richtingen.'],
            ['hoeveel drinken er in een pakje past', 2, 'cm', 'Drinken vult een ruimte: drie richtingen.'],
            ['hoeveel lucht er in een klaslokaal zit', 2, 'm', 'Lucht vult de hele ruimte: lengte, breedte en hoogte.'],
            ['hoeveel ruimte een zandkorrel inneemt', 2, 'mm', 'Een korrel neemt ruimte in: lengte, breedte en hoogte.'] ];
          var s = R.kies(SIT), soort = s[1], f = s[2], OPT = [f, f + '²', f + '³'], goed = OPT[soort];
          var SOORT = ['een lengte (1 richting)', 'een oppervlakte (2 richtingen)', 'een inhoud (3 richtingen)'];
          var bl = function(n){ return richtingen(n >= 1 ? soort : -1, f); };
          return eindKeuze({ vraag:'Welke eenheid?', context:'Je wilt weten: ' + s[0] + '. Welke eenheid past daarbij?', beeld:bl, stappen:[
            kstap(R, 'Wat meet je hier?', SOORT[soort], [], s[3], { orde:SOORT }),
            kstap(R, 'Welke eenheid past bij ' + SOORT[soort].replace(/ \(.*$/, '') + '?', goed, [], [
              'Een lengte heeft geen tweetje en geen drietje: ' + f + '.',
              'Twee richtingen: ' + f + ' ' + X + ' ' + f + ' = ' + f + '².',
              'Drie richtingen: ' + f + ' ' + X + ' ' + f + ' ' + X + ' ' + f + ' = ' + f + '³.'][soort], { orde:OPT, waarom:['Je meet in één richting, dus geen klein getal erachter.', 'Het tweetje staat voor twee richtingen.', 'Het drietje staat voor drie richtingen.'][soort] }) ] });
        } },
      { id:'wob-m-opp-rh', naam:'Oppervlakte van een rechthoek', kort:'Oppervlakte = lengte × breedte, in cm² (of m², mm²)',
        uit:'<p>In een rechthoek liggen de hokjes in nette rijen. In één rij liggen er zoveel als de <b>lengte</b>. Er zijn zoveel rijen als de <b>breedte</b>.</p>' +
          '<p>Dus: <b>oppervlakte = lengte × breedte</b>, kort <b>l × b</b>.</p>' +
          '<p>De eenheid krijgt een tweetje, want je doet cm × cm = <b>cm²</b>. Zijn de maten in meter, dan krijg je m². In millimeter: mm².</p>' +
          '<p>Een rechthoek van 6 cm bij 4 cm: 6 × 4 = <b>24 cm²</b>. Er passen 24 hokjes van 1 cm² in.</p>',
        wanneer:'je wilt weten hoe groot een rechthoekig vlak is, zoals een vloer of een blad papier.',
        maak:function(R){
          var groot = R.heel(0, 3) === 0, l, b, e;
          if (groot){ l = R.kies([20, 30, 40, 50, 60]); b = R.heel(2, 9); e = R.kies(['cm', 'mm', 'm']); }
          else { l = R.heel(3, 15); do { b = R.heel(2, 12); } while (b >= l); e = R.kies(['cm', 'cm', 'm']); if (e === 'm' && l > 9){ l = R.heel(4, 9); b = R.heel(2, l - 1); } }
          var e2 = e + '²', A = l * b, FORM = ['oppervlakte = l ' + X + ' b', 'oppervlakte = 2 ' + X + ' (l + b)', 'oppervlakte = l + b'];
          var wat = e === 'm' ? (groot ? R.kies(['Een tuin', 'Een parkeerterrein', 'Een stuk grond']) : R.kies(['Een kamer', 'Een tuin', 'Een terras'])) : e === 'mm' ? 'Een strookje papier' : R.kies(['Een rechthoek', 'Een foto', 'Een kaart']);
          var bl = function(n){ return rhFig(l, b, e, { raster:!groot, tot:n >= 3 ? A + ' ' + e2 : '' }); };
          return { vraag:'Oppervlakte?', context:wat + ' is ' + l + ' ' + e + ' lang en ' + b + ' ' + e + ' breed. Bereken de oppervlakte.', eenheid:e2, beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'Welke formule hoort bij de oppervlakte?', FORM[0], [], 'Zoveel rijen van zoveel hokjes: lengte keer breedte.', { orde:FORM }),
            kstap(R, 'Welke eenheid krijgt het antwoord?', e2, [], 'Je doet ' + e + ' ' + X + ' ' + e + ', dus ' + e2 + '. Elk hokje is 1 ' + e2 + '.', { orde:[e, e2, e + '³'], waarom:'Lengte keer breedte: twee richtingen, dus het tweetje.' }),
            St('Oppervlakte = ' + l + ' ' + X + ' ' + b + ' =', metE(String(A), e2), l + ' keer ' + b + '.', Fz([String(A)], F(String(2 * (l + b)), 'Dat is de omtrek: de rand. Doe lengte keer breedte.', String(l + b), 'Keer, niet plus.')), { e:e2 }) ] };
        } },
      { id:'wob-m-opp-vierkant', naam:'Oppervlakte van een vierkant', kort:'Oppervlakte = zijde × zijde, ook geschreven als zijde²',
        uit:'<p>Een <b>vierkant</b> is een rechthoek waarvan alle vier de zijden even lang zijn. De lengte en de breedte zijn dus gelijk.</p>' +
          '<p>Daarom: <b>oppervlakte = zijde × zijde</b>. Een vierkant met zijden van 5 cm: 5 × 5 = <b>25 cm²</b>.</p>' +
          '<p>Een getal keer zichzelf heet een <b>kwadraat</b>: 5 × 5 = 5². Dat woord betekent eigenlijk "vierkant".</p>' +
          '<p>Let op: doe niet 5 × 2 of 4 × 5. Dat laatste is de omtrek, de rand van het vierkant.</p>',
        wanneer:'je de oppervlakte van een vierkant vlak zoekt, zoals een tegel of een schaakbord.',
        maak:function(R){
          var groot = R.heel(0, 4) === 0, z = groot ? R.kies([20, 30, 40, 50]) : R.heel(2, 15), e = groot ? R.kies(['cm', 'mm']) : R.kies(['cm', 'cm', 'm', 'mm']), e2 = e + '²', A = z * z;
          var wat = e === 'm' ? R.kies(['Een vierkant grasveld', 'Een vierkant plein', 'Een vierkante vijver']) : e === 'mm' ? R.kies(['Een vierkant postzegeltje', 'Een vierkant stickertje']) : R.kies(['Een vierkant', 'Een vierkante tegel', 'Een vierkant notitieblaadje']);
          var bl = function(n){ return rhFig(z, z, e, { vk:true, raster:!groot, tot:n >= 3 ? A + ' ' + e2 : '' }); };
          return { vraag:'Oppervlakte?', context:wat + ' heeft zijden van ' + z + ' ' + e + '. Bereken de oppervlakte.', eenheid:e2, beeld:bl, zelfBeeld:bl(0), stappen:[
            St('Alle zijden zijn even lang. Hoe breed is het vierkant?', metE(String(z), e), 'Lengte en breedte zijn gelijk: allebei ' + z + ' ' + e + '.', null, { e:e }),
            kstap(R, 'Welke eenheid krijgt het antwoord?', e2, [], 'Je doet ' + e + ' ' + X + ' ' + e + ', dus ' + e2 + '.', { orde:[e, e2, e + '³'] }),
            St('Oppervlakte = ' + z + ' ' + X + ' ' + z + ' =', metE(String(A), e2), z + ' keer zichzelf.', Fz([String(A)], F(String(4 * z), 'Dat is de omtrek: vier zijden. Doe zijde keer zijde.', String(2 * z), 'Je deed keer 2. Doe ' + z + ' ' + X + ' ' + z + '.')), { e:e2, waarom:z + ' ' + X + ' ' + z + ' = ' + z + '² = ' + A + ' ' + e2 + '.' }) ] };
        } },
      { id:'wob-m-opp-rechthoek', naam:'Omtrek en oppervlakte van een rechthoek', kort:'Omtrek = 2 × (l + b), oppervlakte = l × b',
        uit:'<p>De <b>omtrek</b> is de lengte van de rand. Een rechthoek heeft twee lengtes en twee breedtes: <b>omtrek = 2 × (l + b)</b>. De eenheid is cm of m.</p><p>De <b>oppervlakte</b> is hoeveel hokjes van 1 cm² erin passen: <b>oppervlakte = l × b</b>. De eenheid is cm² of m², want je doet cm × cm.</p><p>Weet je de oppervlakte en de lengte? Dan vind je de breedte met delen: b = oppervlakte : l.</p>',
        wanneer:'je de rand of de binnenkant van een rechthoek zoekt.',
        maak:function(R){
          var l = R.heel(4, 15), b; do { b = R.heel(2, 12); } while (b >= l);
          var e = R.kies(['cm', 'cm', 'm']), e2 = e + '²', v = R.kies(['om', 'opp', 'terug']), A = l * b;
          var FORM = ['omtrek = 2 × (l + b)', 'oppervlakte = l × b'];
          var bl = tekenFig([[0, 0], [l, 0], [l, b], [0, b]], { zijde:[l + ' ' + e, v === 'terug' ? '?' : b + ' ' + e, '', ''], W:360, H:230, aria:'een rechthoek van ' + l + ' bij ' + (v === 'terug' ? '?' : b),
            na:function(P){ return v === 'terug' ? tx((P[0][0] + P[2][0]) / 2, (P[0][1] + P[2][1]) / 2, A + ' ' + e2, { mid:true, vet:true, k:K[0], fs:16 }) : ''; } });
          if (v === 'om') return { vraag:'Omtrek?', context:'Een rechthoek is ' + l + ' ' + e + ' lang en ' + b + ' ' + e + ' breed. Bereken de omtrek.', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke formule hoort bij de omtrek?', FORM[0], [], 'De omtrek is de rand: twee lengtes en twee breedtes.', { orde:FORM }),
            St('l + b = ' + l + ' + ' + b + ' =', metE(String(l + b), e), 'Eén lengte en één breedte samen.', null, { e:e }),
            St('Omtrek = 2 ' + X + ' ' + (l + b) + ' =', metE(String(2 * (l + b)), e), 'Er zijn twee lengtes en twee breedtes: doe keer 2.', Fz(metE(String(2 * (l + b)), e), F(String(l + b), 'Doe nog keer 2.', String(A), 'Dat is de oppervlakte.')), { e:e }) ] };
          if (v === 'opp') return { vraag:'Oppervlakte?', context:'Een rechthoek is ' + l + ' ' + e + ' lang en ' + b + ' ' + e + ' breed. Bereken de oppervlakte.', eenheid:e2, beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke formule hoort bij de oppervlakte?', FORM[1], [], 'De oppervlakte is de binnenkant: lengte keer breedte.', { orde:FORM }),
            St('Oppervlakte = ' + l + ' ' + X + ' ' + b + ' =', metE(String(A), e2), l + ' keer ' + b + '.', Fz(metE(String(A), e2), F(String(2 * (l + b)), 'Dat is de omtrek.', String(l + b), 'Keer, niet plus.')), { e:e2 }) ] };
          return { vraag:'Hoe breed?', context:'Een rechthoek heeft een oppervlakte van ' + A + ' ' + e2 + ' en is ' + l + ' ' + e + ' lang. Hoe breed is de rechthoek?', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Oppervlakte = l ' + X + ' b. Hoe vind je b?', 'b = oppervlakte : l', ['b = oppervlakte ' + X + ' l', 'b = oppervlakte ' + MIN + ' l'], 'Welk getal keer ' + l + ' is ' + A + '? Dat vind je met delen.'),
            St('b = ' + A + ' : ' + l + ' =', metE(String(b), e), A + ' gedeeld door ' + l + '. Controle: ' + l + ' ' + X + ' ' + b + ' = ' + A + '.', Fz(metE(String(b), e), F(String(A - l), 'Delen, niet aftrekken.')), { e:e }) ] };
        } },
      { id:'wob-m-opp-driehoek', naam:'Oppervlakte van een driehoek', kort:'Oppervlakte = basis × hoogte : 2, met de hoogte loodrecht op de basis',
        uit:'<p>Teken een <b>rechthoek</b> om de driehoek: zo breed als de basis en zo hoog als de hoogte. De hoogtelijn knipt die rechthoek in twee stukken, en elk stuk is voor de helft driehoek. De driehoek is dus precies de <b>helft van de rechthoek</b>. Daarom: <b>oppervlakte = basis × hoogte : 2</b>.</p><p>De <b>hoogte</b> staat <b>loodrecht</b> op de basis: de stippellijn met het hokje. Een schuine zijde is géén hoogte.</p><p>Basis 8 cm, hoogte 5 cm: 8 × 5 = 40, en 40 : 2 = <b>20 cm²</b>.</p>',
        wanneer:'je de oppervlakte van een driehoek zoekt en de hoogte getekend is.',
        maak:function(R){
          var t = R.kies(TRIPEL), p = t[0], h = t[1], s = t[2], q = R.heel(2, 8), b = p + q, mir = R.heel(0, 1) === 1, A = b * h / 2;
          var C = [mir ? b - p : p, h];
          var bl = function(n){ return tekenFig([[0, 0], [b, 0], C], { zijde:[b + ' cm', mir ? s + ' cm' : '', mir ? '' : s + ' cm'], markeer:false, W:380, H:250, extra:[[0, -0.6]], aria:'driehoek met basis ' + b + ' cm en een hoogte' + (n >= 2 ? ', met de rechthoek eromheen' : ''),
            na:function(P, f){ var V = f([C[0], 0]), r = n >= 2 ? pg([P[0], P[1], f([b, h]), f([0, h])], { f:K[3], fo:0.1, stip:'6 5', w:2 }) : ''; return r + hoogteLijn(P[2], V, mir ? -1 : 1, h + ' cm', (b - C[0]) >= C[0] ? 1 : -1); } }); };
          return { vraag:'Oppervlakte?', context:'De basis is ' + b + ' cm, de hoogte (de stippellijn) is ' + h + ' cm en een schuine zijde is ' + s + ' cm. Bereken de oppervlakte van de driehoek.', eenheid:'cm²', beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'Welke maat is de hoogte bij de basis van ' + b + ' cm?', h + ' cm', [s + ' cm'], 'De hoogte staat loodrecht op de basis: de stippellijn met het hokje.'),
            St('basis ' + X + ' hoogte = ' + b + ' ' + X + ' ' + h + ' =', metE(T(b * h), 'cm²'), b + ' keer ' + h + '.', Fz([T(b * h)], F(T(b * s), 'Je nam de schuine zijde. Gebruik de hoogte.')), { waarom:'Dat is de gestippelde rechthoek om de driehoek heen: ' + b + ' cm bij ' + h + ' cm, dus ' + (b * h) + ' cm².' }),
            St('Oppervlakte = ' + (b * h) + ' : 2 =', metE(T(A), 'cm²'), 'Een driehoek is de helft van de rechthoek eromheen.', Fz(metE(T(A), 'cm²'), F(T(b * h), 'Vergeet niet te delen door 2.', T(b * s / 2), 'Je nam de schuine zijde. Gebruik de hoogte.')), { e:'cm²', waarom:'De driehoek vult precies de helft van die rechthoek. De helft van cm² is nog steeds cm².' }) ] };
        } },
      { id:'wob-m-opp-buiten', naam:'Driehoek met de hoogte buiten de driehoek', kort:'Bij een stompe driehoek valt de hoogte buiten de driehoek: de basis blijft de zijde zelf',
        uit:'<p>Bij een <b>stompe</b> driehoek kan de hoogte <b>buiten de driehoek</b> vallen. Je verlengt de basis met een stippellijn, en de hoogte komt daar loodrecht op.</p><p>De <b>basis</b> is nog steeds alleen de zijde van de driehoek. Het verlengde stuk tel je <b>niet</b> mee.</p><p>Oppervlakte = basis × hoogte : 2, net als bij elke driehoek.</p>',
        wanneer:'de hoogte van een driehoek buiten de figuur getekend is.',
        maak:function(R){
          var b = R.heel(3, 10), e = R.heel(2, 6), h = R.heel(3, 9), mir = R.heel(0, 1) === 1, A = b * h / 2;
          var C = mir ? [-e, h] : [b + e, h], voet = [C[0], 0];
          var bl = tekenFig([[0, 0], [b, 0], C], { zijde:[b + ' cm', '', ''], markeer:false, W:380, H:250, extra:[voet, [0, -0.6]], aria:'stompe driehoek met de hoogte buiten de driehoek',
            na:function(P, f){ var V = f(voet), Bk = mir ? P[0] : P[1]; return lnP(Bk, V, { k:K[3], w:2.5, stip:'5 5' }) + tx((Bk[0] + V[0]) / 2, V[1] + 18, e + ' cm', { vet:true, k:K[3], fs:14 }) + hoogteLijn(P[2], V, mir ? 1 : -1, h + ' cm'); } });
          return { vraag:'Oppervlakte?', context:'De basis is ' + b + ' cm en de hoogte is ' + h + ' cm. De hoogte valt buiten de driehoek; het gestippelde stuk van ' + e + ' cm is het verlengde van de basis. Bereken de oppervlakte.', eenheid:'cm²', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Wat is de basis van de driehoek?', b + ' cm', [(b + e) + ' cm'], 'De basis is de zijde van de driehoek zelf. Het gestippelde verlengde hoort er niet bij.'),
            St('basis ' + X + ' hoogte = ' + b + ' ' + X + ' ' + h + ' =', metE(T(b * h), 'cm²'), b + ' keer ' + h + '.', Fz([T(b * h)], F(T((b + e) * h), 'Je telde het verlengde stuk mee. De basis is ' + b + ' cm.'))),
            St('Oppervlakte = ' + (b * h) + ' : 2 =', metE(T(A), 'cm²'), 'Een driehoek is de helft: deel door 2.', Fz(metE(T(A), 'cm²'), F(T(b * h), 'Vergeet niet te delen door 2.', T((b + e) * h / 2), 'Je telde het verlengde stuk mee. De basis is ' + b + ' cm.')), { e:'cm²', waarom:'Twee van deze driehoeken samen vormen een parallellogram van ' + b + ' cm bij ' + h + ' cm, dus ' + (b * h) + ' cm². Eén driehoek is de helft.' }) ] };
        } },
      { id:'wob-m-opp-para', naam:'Oppervlakte van een parallellogram', kort:'Oppervlakte = basis × hoogte; de schuine zijde gebruik je niet',
        uit:'<p>Knip van een <b>parallellogram</b> aan één kant een driehoekje af en leg het aan de andere kant. Dan heb je een <b>rechthoek</b> met dezelfde basis en hoogte.</p><p>Dus: <b>oppervlakte = basis × hoogte</b>. Je deelt niet door 2.</p><p>De hoogte staat loodrecht op de basis. De schuine zijde is langer dan de hoogte; die gebruik je niet.</p>',
        wanneer:'je de oppervlakte van een scheve vierhoek met twee paar evenwijdige zijden zoekt.',
        maak:function(R){
          var t = R.kies(TRIPEL.filter(function(x){ return x[0] <= 9; })), p = t[0], h = t[1], s = t[2], b = R.heel(Math.max(5, p), 14), A = b * h;
          var bl = tekenFig([[0, 0], [b, 0], [b + p, h], [p, h]], { zijde:[b + ' cm', '', '', s + ' cm'], markeer:false, W:400, H:240, extra:[[0, -0.6]], aria:'parallellogram met basis ' + b + ' cm',
            na:function(P, f){ return hoogteLijn(P[3], f([p, 0]), 1, h + ' cm', 1); } });
          return { vraag:'Oppervlakte?', context:'De basis is ' + b + ' cm, de hoogte (de stippellijn) is ' + h + ' cm en de schuine zijde is ' + s + ' cm. Bereken de oppervlakte van het parallellogram.', eenheid:'cm²', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke maat is de hoogte?', h + ' cm', [s + ' cm'], 'De hoogte staat loodrecht op de basis: de stippellijn met het hokje.'),
            St('Oppervlakte = basis ' + X + ' hoogte = ' + b + ' ' + X + ' ' + h + ' =', metE(T(A), 'cm²'), b + ' keer ' + h + '. Niet delen door 2: het is geen driehoek.', Fz(metE(T(A), 'cm²'), F(T(b * s), 'Je nam de schuine zijde. Gebruik de hoogte.', T(A / 2), 'Bij een parallellogram deel je niet door 2.')), { e:'cm²', waarom:'Schuif het driehoekje links naar rechts: een rechthoek van ' + b + ' cm bij ' + h + ' cm. Cm ' + X + ' cm = cm².' }) ] };
        } },
      { id:'wob-m-opp-trapezium', naam:'Oppervlakte van een trapezium', kort:'Oppervlakte = (a + b) : 2 × hoogte: het gemiddelde van de evenwijdige zijden keer de hoogte',
        uit:'<p>Een <b>trapezium</b> heeft twee <b>evenwijdige zijden</b>, een lange en een korte. Neem daar het <b>gemiddelde</b> van: (a + b) : 2.</p><p>Dan is de <b>oppervlakte = (a + b) : 2 × hoogte</b>. De hoogte is de afstand tussen de evenwijdige zijden.</p><p>Zijden 10 en 6 cm, hoogte 4 cm: (10 + 6) : 2 = 8, en 8 × 4 = <b>32 cm²</b>.</p>',
        wanneer:'een vierhoek één paar evenwijdige zijden heeft.',
        maak:function(R){
          var a = R.heel(6, 14), c = R.heel(2, a - 2), h = R.heel(2, 9), p = R.heel(0, a - c), m = (a + c) / 2, A = m * h;
          var bl = tekenFig([[0, 0], [a, 0], [p + c, h], [p, h]], { zijde:[a + ' cm', '', c + ' cm', ''], markeer:false, W:400, H:240, extra:[[0, -0.6]], aria:'trapezium met evenwijdige zijden ' + a + ' en ' + c + ' cm',
            na:function(P, f){ var x = p > 0 ? p : p + c / 2; return hoogteLijn(f([x, h]), f([x, 0]), 1, h + ' cm', 1); } });
          return { vraag:'Oppervlakte?', context:'De evenwijdige zijden van het trapezium zijn ' + a + ' cm en ' + c + ' cm. De hoogte is ' + h + ' cm. Bereken de oppervlakte.', eenheid:'cm²', beeld:bl, zelfBeeld:bl, stappen:[
            St('De evenwijdige zijden samen: ' + a + ' + ' + c + ' =', metE(String(a + c), 'cm'), 'Tel de lange en de korte zijde op.'),
            St('Het gemiddelde: ' + (a + c) + ' : 2 =', metE(T(m), 'cm'), 'Deel door 2.', Fz([T(m)], F(String(a + c), 'Deel nog door 2.')), { waarom:'Een trapezium is net zo groot als een rechthoek die ' + T(m) + ' cm breed is: wat er aan de ene kant uitsteekt, past aan de andere kant in het gat.' }),
            St('Oppervlakte = ' + T(m) + ' ' + X + ' ' + h + ' =', metE(T(A), 'cm²'), T(m) + ' keer de hoogte ' + h + '.', Fz(metE(T(A), 'cm²'), F(T((a + c) * h), 'Je vergat te delen door 2.', T(a * h), 'Gebruik het gemiddelde van beide zijden, niet alleen de lange.')), { e:'cm²', waarom:'Die rechthoek is ' + T(m) + ' cm breed en ' + h + ' cm hoog. En cm ' + X + ' cm = cm².' }) ] };
        } },
      { id:'wob-m-opp-ruit', naam:'Oppervlakte van een ruit en een vlieger', kort:'Oppervlakte = diagonaal × diagonaal : 2, de helft van de rechthoek eromheen',
        uit:'<p>Een <b>ruit</b> en een <b>vlieger</b> hebben twee <b>diagonalen</b>: lijnen van hoekpunt naar hoekpunt. Ze staan loodrecht op elkaar.</p>' +
          '<p>Teken er een <b>rechthoek</b> omheen. Die is zo breed als de ene diagonaal en zo hoog als de andere. De diagonalen verdelen de rechthoek in vier stukken. Elk stuk is voor de ene <b>helft figuur</b> en voor de andere helft een driehoekje erbuiten.</p>' +
          '<p>De figuur is dus de <b>helft</b> van de rechthoek: <b>oppervlakte = diagonaal × diagonaal : 2</b>. De zijden heb je niet nodig.</p>' +
          '<p>Diagonalen van 8 cm en 6 cm: 8 × 6 = 48 cm² voor de rechthoek, en 48 : 2 = <b>24 cm²</b>.</p>',
        wanneer:'je de oppervlakte van een ruit of vlieger zoekt en de diagonalen weet.',
        beeld:ruitFig(6, 8, 3, { rh:true, half:true }),
        maak:function(R){
          var ruit = R.heel(0, 1) === 0, d1, d2, t, s = null, e = 'cm', ctx;
          if (ruit){
            var tr = R.kies(TRIPEL.filter(function(x){ return x[2] <= 13; })); d1 = 2 * Math.min(tr[0], tr[1]); d2 = 2 * Math.max(tr[0], tr[1]); t = d1 / 2; s = tr[2]; e = R.kies(['cm', 'cm', 'm']);
            ctx = 'Een ruit heeft diagonalen van ' + d1 + ' ' + e + ' en ' + d2 + ' ' + e + '. Elke zijde is ' + s + ' ' + e + '. Bereken de oppervlakte.';
          } else if (R.heel(0, 2) === 0){
            d1 = R.kies([60, 80, 100, 120]); d2 = R.kies([40, 50, 60, 70].filter(function(x){ return x < d1 && 2 * x >= d1; })); t = d1 / 4;
            ctx = 'Een vlieger van stof heeft diagonalen van ' + d1 + ' cm en ' + d2 + ' cm. Hoeveel stof zit erin? Bereken de oppervlakte.';
          } else {
            d1 = R.heel(7, 14); t = R.heel(2, Math.floor((d1 - 1) / 2)); d2 = R.heel(Math.max(4, Math.ceil(d1 / 2)), Math.min(12, d1 - 1));
            ctx = 'Een vlieger heeft diagonalen van ' + d1 + ' cm en ' + d2 + ' cm. Bereken de oppervlakte.';
          }
          var e2 = e + '²', RH = d1 * d2, A = RH / 2, nm = ruit ? 'ruit' : 'vlieger';
          var bl = function(n){ return ruitFig(d1, d2, t, { e:e, vlieger:!ruit, rh:n >= 1, half:n >= 2, zijde:s ? s + ' ' + e : '', tot:n >= 3 ? T(A) + ' ' + e2 : '' }); };
          var OPT = ['de twee diagonalen', 'twee zijden'];
          return { vraag:'Oppervlakte?', context:ctx, eenheid:e2, beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'Welke maten heb je nodig?', OPT[0], [], 'De ' + nm + ' past precies in een rechthoek die zo groot is als de diagonalen. De zijden heb je niet nodig.', { orde:OPT }),
            St('De rechthoek eromheen: ' + d1 + ' ' + X + ' ' + d2 + ' =', metE(String(RH), e2), 'Zo breed als de ene diagonaal, zo hoog als de andere: ' + d1 + ' keer ' + d2 + '.', s ? Fz([String(RH)], F(String(s * s), 'Je nam de zijden. Gebruik de diagonalen.')) : null, { e:e2, waarom:'De gestippelde rechthoek is ' + d2 + ' ' + e + ' breed en ' + d1 + ' ' + e + ' hoog.' }),
            St('De ' + nm + ' is de helft: ' + RH + ' : 2 =', metE(T(A), e2), 'Deel de rechthoek door 2.', Fz(metE(T(A), e2), F(String(RH), 'Deel nog door 2: de driehoekjes buiten de ' + nm + ' horen er niet bij.', T(RH / 4), 'De ' + nm + ' is de helft, dus deel door 2, niet door 4.')), { e:e2, waarom:'In de figuur zie je het: elk van de vier stukken van de rechthoek is half ' + nm + ' en half driehoekje erbuiten. En ' + e + ' ' + X + ' ' + e + ' = ' + e2 + '.' }) ] };
        } },
      { id:'wob-m-opp-om', naam:'Vierkante maten omrekenen', kort:'1 cm² = 10 × 10 = 100 mm² en 1 m² = 100 × 100 = 10.000 cm²',
        uit:'<p>1 cm is 10 mm. Je zou denken: 1 cm² is dan 10 mm². Maar dat klopt <b>niet</b>.</p>' +
          '<p>1 cm² is een vierkant van 10 mm <b>bij</b> 10 mm. Daar passen <b>10 rijen van 10</b> hokjes van 1 mm² in: <b>1 cm² = 10 × 10 = 100 mm²</b>. Een vierkante maat is lang <b>en</b> breed, dus de stap telt twee keer.</p>' +
          '<p>Net zo: 1 m = 100 cm, dus <b>1 m² = 100 × 100 = 10.000 cm²</b>.</p>' +
          '<p>Naar een <b>kleinere</b> eenheid: er passen meer hokjes in, dus <b>keer</b>. Naar een <b>grotere</b> eenheid: <b>gedeeld door</b>. 3 cm² = 300 mm², en 50.000 cm² = 5 m².</p>',
        wanneer:'je cm² en mm², of m² en cm², door elkaar ziet.',
        beeld:maatFig('mm', { rij:true, tot:true }),
        maak:function(R){
          var v = R.kies([
            { x:[2, 3, 5, 8, 12, 25, 1.5, 2.5, 0.5, 4.2, 0.75], van:'cm²', naar:'mm²', m:'mm', f:100 },
            { x:[300, 500, 1200, 2500, 150, 450, 50, 75, 800, 1000], van:'mm²', naar:'cm²', m:'mm', f:0.01 },
            { x:[2, 3, 5, 1.5, 0.5, 2.5, 0.25, 4, 12], van:'m²', naar:'cm²', m:'m', f:10000 },
            { x:[20000, 50000, 15000, 5000, 2500, 80000, 120000, 7500, 30000], van:'cm²', naar:'m²', m:'m', f:0.0001 } ]);
          var x = R.kies(v.x), y = rnd(x * v.f, 6), keer = v.f > 1, mm = v.m === 'mm', st = mm ? 10 : 100, kw = st * st;
          var gr = mm ? 'cm' : 'm', kl = mm ? 'mm' : 'cm';
          var OPT = ['keer ' + T(kw), 'gedeeld door ' + T(kw), 'keer ' + st, 'gedeeld door ' + st];
          var bl = function(n){ return maatFig(v.m, { rij:n >= 2, tot:n >= 2 }); };
          var fx = keer ? x * st : x / st, fo = F(T(rnd(fx, 6)), 'Bij vierkante maten is de stap ' + T(kw) + ', niet ' + st + '.', T(rnd(keer ? x / kw : x * kw, 6)), 'Andersom: ' + (keer ? 'keer' : 'gedeeld door') + ' ' + T(kw) + '.');
          return { vraag:T(x) + ' ' + v.van + ' = ? ' + v.naar, context:'Reken om.', eenheid:v.naar, beeld:bl, stappen:[
            St('1 ' + gr + ' = hoeveel ' + kl + '?', metE(String(st), kl), mm ? 'Op je liniaal: 1 cm heeft 10 streepjes van 1 mm.' : '1 meter is 100 centimeter.', null, { e:kl }),
            St('1 ' + gr + '² is ' + st + ' ' + kl + ' bij ' + st + ' ' + kl + '. 1 ' + gr + '² = ' + st + ' ' + X + ' ' + st + ' =', metE(T(kw), kl + '²'), st + ' rijen van ' + st + ' hokjes: ' + st + ' ' + X + ' ' + st + '.', F(String(st), 'Een ' + gr + '² is ' + st + ' ' + kl + ' lang én ' + st + ' ' + kl + ' breed. Dat zijn ' + st + ' rijen van ' + st + ': ' + st + ' ' + X + ' ' + st + '.'), { e:kl + '²', waarom:'Het vierkant is lang én breed, dus de stap van ' + st + ' telt twee keer.' }),
            kstap(R, 'Van ' + v.van + ' naar ' + v.naar + ': wat doe je?', keer ? OPT[0] : OPT[1], [], keer ? 'Naar een kleinere eenheid: er passen meer hokjes in, dus keer ' + T(kw) + '.' : 'Naar een grotere eenheid: er passen minder in, dus gedeeld door ' + T(kw) + '.', { orde:OPT }),
            St(T(x) + ' ' + v.van + ' = (in ' + v.naar + ')', metE(T(y), v.naar), keer ? T(x) + ' ' + X + ' ' + T(kw) + ' = ' + T(y) + '.' : T(x) + ' : ' + T(kw) + ' = ' + T(y) + '.', Fz(metE(T(y), v.naar), fo), { e:v.naar }) ] };
        } }
    ] });

  /* ================= 3 inhoud ================= */
  var TRAP = [['m³', 'dm³', 'cm³'], ['kubieke meter', 'kubieke decimeter', 'kubieke centimeter']];
  G.push({ groep:{ id:'wob-m-inh', niveau:'onderbouw', domein:'meetkunde', naam:'Inhoud',
      uit:'De inhoud van balk, prisma en cilinder: grondvlak keer hoogte. En omrekenen tussen m³, dm³, cm³ en liter.' },
    doelen:[
      { id:'wob-m-inh-balk', naam:'Inhoud van een balk', kort:'Inhoud = lengte × breedte × hoogte, of grondvlak × hoogte',
        uit:'<p>De <b>inhoud</b> is hoeveel kubusjes van 1 cm³ erin passen.</p><p>De onderste laag is het <b>grondvlak</b>: lengte × breedte. Er liggen zoveel lagen op elkaar als de <b>hoogte</b>. Dus: <b>inhoud = l × b × h</b>.</p><p>Balk van 5 bij 3 bij 4 cm: grondvlak 5 × 3 = 15 cm², inhoud 15 × 4 = <b>60 cm³</b>.</p>',
        wanneer:'je wilt weten hoeveel er in een doos of bak past.',
        maak:function(R){
          var kubus = R.heel(0, 4) === 0, l = R.heel(3, 15), b = kubus ? l : R.heel(2, 10), h = kubus ? l : R.heel(2, 12), e = R.kies(['cm', 'cm', 'm', 'dm']);
          if (kubus) l = b = h = R.heel(2, 10);
          var Gv = l * b, V = Gv * h;
          var bl = ruimte(balkPts(l, b, h), BALK_RIBBEN, { maten:[[0, 1, l + ' ' + e], [1, 2, b + ' ' + e], [2, 6, h + ' ' + e, 30]], vlak:[[[0, 1, 2, 3], K[0]]], aria:kubus ? 'kubus met ribben van ' + l + ' ' + e : 'balk van ' + l + ' bij ' + b + ' bij ' + h + ' ' + e });
          return { vraag:'Inhoud?', context:kubus ? 'Een kubus heeft ribben van ' + l + ' ' + e + '. Bereken de inhoud.' : 'Een balk is ' + l + ' ' + e + ' lang, ' + b + ' ' + e + ' breed en ' + h + ' ' + e + ' hoog. Bereken de inhoud.', eenheid:e + '³', beeld:bl, zelfBeeld:bl, stappen:[
            St('Grondvlak = ' + l + ' ' + X + ' ' + b + ' =', metE(String(Gv), e + '²'), 'Lengte keer breedte: de onderste laag.', null, { e:e + '²' }),
            St('Inhoud = ' + Gv + ' ' + X + ' ' + h + ' =', metE(String(V), e + '³'), 'Zoveel lagen als de hoogte: keer ' + h + '.', Fz(metE(String(V), e + '³'), F(String(l + b + h), 'Keer, niet plus.', String(Gv), 'Dat is alleen het grondvlak. Doe nog keer de hoogte.')), { e:e + '³' }) ] };
        } },
      { id:'wob-m-inh-prisma', naam:'Inhoud van een prisma', kort:'Inhoud = oppervlakte grondvlak × hoogte; bij een liggend prisma is de hoogte de lengte',
        uit:'<p>Een <b>prisma</b> heeft een grondvlak en een bovenvlak die precies gelijk zijn, met rechte zijkanten ertussen. Net als bij een balk: <b>inhoud = grondvlak × hoogte</b>.</p><p>Bereken eerst de oppervlakte van het grondvlak: een driehoek (basis × hoogte : 2) of een trapezium ((a + b) : 2 × hoogte).</p><p>Ligt het prisma op zijn kant, dan is de voorkant het grondvlak. De <b>hoogte van het prisma</b> is dan de <b>lengte</b> naar achteren.</p>',
        wanneer:'een ruimtefiguur voor en achter dezelfde vorm heeft, zoals een tent of een dakgoot.',
        maak:function(R){
          var v = R.kies(['rh', 'tent', 'trap']), L = R.heel(5, 20), Gv, gt, bl, ctx, vorm = v === 'trap' ? 'een trapezium' : 'een driehoek';
          if (v === 'rh'){ var a1 = R.heel(3, 10), a2 = R.heel(3, 10); Gv = a1 * a2 / 2; gt = a1 + ' ' + X + ' ' + a2 + ' : 2';
            ctx = 'Het grondvlak (de voorkant) is een rechthoekige driehoek met rechthoekszijden van ' + a1 + ' cm en ' + a2 + ' cm. Het prisma is ' + L + ' cm lang.';
            bl = ruimte([[0, 0, 0], [a1, 0, 0], [0, a2, 0], [0, 0, L], [a1, 0, L], [0, a2, L]], [[0, 1], [1, 2], [2, 0], [0, 3, 1], [1, 4], [2, 5], [3, 4, 1], [4, 5], [5, 3, 1]], { maten:[[0, 1, a1 + ' cm'], [0, 2, a2 + ' cm'], [1, 4, L + ' cm']], vlak:[[[0, 1, 2], K[0]]], d:0.35, aria:'prisma met een rechthoekige driehoek als grondvlak' }); }
          else if (v === 'tent'){ var ba = R.heel(3, 10), hh = R.heel(Math.ceil(ba / 2) + 1, 10); Gv = ba * hh / 2; gt = ba + ' ' + X + ' ' + hh + ' : 2';
            ctx = 'Een tent heeft de vorm van een prisma. De voorkant is een driehoek met een basis van ' + ba + ' dm en een hoogte van ' + hh + ' dm. De tent is ' + L + ' dm lang.';
            bl = ruimte([[0, 0, 0], [ba, 0, 0], [ba / 2, hh, 0], [0, 0, L], [ba, 0, L], [ba / 2, hh, L], [ba / 2, 0, 0]], [[0, 1], [1, 2], [2, 0], [0, 3, 1], [1, 4], [2, 5], [3, 4, 1], [4, 5], [5, 3, 1]], { maten:[[0, 1, ba + ' dm'], [1, 4, L + ' dm']], lijnen:[[6, 2, 1, true]], vlak:[[[0, 1, 2], K[0]]], d:0.35, aria:'tent in de vorm van een prisma' }); }
          else { var a = R.heel(6, 12), c = R.heel(2, a - 2), ht = R.heel(2, 6), p = R.heel(0, a - c); if ((a + c) % 2 && ht % 2) ht++; Gv = (a + c) / 2 * ht; gt = '(' + a + ' + ' + c + ') : 2 ' + X + ' ' + ht;
            ctx = 'Een stuk dijk heeft de vorm van een prisma. De voorkant is een trapezium: de evenwijdige zijden zijn ' + a + ' m en ' + c + ' m, de hoogte is ' + ht + ' m. Het stuk dijk is ' + L + ' m lang.'; var xh = p + c / 2;
            bl = ruimte([[0, 0, 0], [a, 0, 0], [p + c, ht, 0], [p, ht, 0], [0, 0, L], [a, 0, L], [p + c, ht, L], [p, ht, L], [xh, 0, 0], [xh, ht, 0]], [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5, 1], [5, 6], [6, 7], [7, 4, 1], [0, 4, 1], [1, 5], [2, 6], [3, 7]], { maten:[[0, 1, a + ' m'], [3, 2, c + ' m'], [1, 5, L + ' m'], [8, 9, ht + ' m', -18]], lijnen:[[8, 9, 1, true]], vlak:[[[0, 1, 2, 3], K[0]]], d:0.3, aria:'prisma met een trapezium als grondvlak' }); }
          var V = Gv * L, e = v === 'tent' ? 'dm' : v === 'trap' ? 'm' : 'cm';
          return { vraag:'Inhoud?', context:ctx + ' Bereken de inhoud.', eenheid:e + '³', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke vorm heeft het grondvlak (de voorkant)?', vorm, [], 'Kijk naar de gekleurde voorkant.', { orde:['een rechthoek', 'een driehoek', 'een trapezium'] }),
            St('Grondvlak = ' + gt + ' =', metE(T(Gv), e + '²'), v === 'trap' ? 'Het gemiddelde van de evenwijdige zijden keer de hoogte.' : 'Basis keer hoogte, gedeeld door 2.', Fz(metE(T(Gv), e + '²'), v === 'trap' ? F(T((a + c) * ht), 'Deel de zijden samen nog door 2.') : F(T(Gv * 2), 'Een driehoek: deel nog door 2.')), { e:e + '²' }),
            St('Inhoud = grondvlak ' + X + ' lengte = ' + T(Gv) + ' ' + X + ' ' + L + ' =', metE(T(V), e + '³'), 'De lengte naar achteren is hier de hoogte van het prisma.', Fz(metE(T(V), e + '³'), F(T(V * 2), v === 'trap' ? 'Gebruik het gemiddelde van de evenwijdige zijden.' : 'Het grondvlak is een driehoek: deel door 2.', T(V / 2), 'Bij een prisma deel je niet door 2: alleen in het grondvlak.')), { e:e + '³' }) ] };
        } },
      { id:'wob-m-inh-cilinder', naam:'Inhoud van een cilinder', kort:'Inhoud = π × r² × h: de cirkel van het grondvlak keer de hoogte',
        uit:'<p>Een <b>cilinder</b> is een prisma met een <b>cirkel</b> als grondvlak. Dus ook hier: <b>inhoud = grondvlak × hoogte</b>.</p><p>Het grondvlak is π × r². Dus <b>inhoud = π × r² × h</b>. Let op: je hebt de <b>straal</b> nodig. Is de diameter gegeven, deel die dan eerst door 2.</p><p>Tik alles in één keer in, en rond pas aan het eind af.</p>',
        wanneer:'je de inhoud van een blik, buis of ronde bak zoekt.',
        maak:function(R){
          var r, h, dGeg = R.heel(0, 2) === 0, d = R.kies([0, 1]), V;
          do { r = R.heel(2, 12); h = R.heel(3, 25); V = PI * r * r * h; } while (grens(V, d));
          var bl = cilinder({ r:dGeg ? 'd = ' + (2 * r) + ' cm' : 'r = ' + r + ' cm', h:'h = ' + h + ' cm', diam:dGeg, aria:'cilinder' });
          var st = [];
          if (dGeg) st.push(St('De straal: r = ' + (2 * r) + ' : 2 =', metE(String(r), 'cm'), 'De straal is de helft van de diameter.', Fz(metE(String(r), 'cm'), F(String(4 * r), 'Delen door 2, niet keer 2.')), { e:'cm' }));
          st.push(St('r² = ' + r + ' ' + X + ' ' + r + ' =', String(r * r), r + ' keer zichzelf.', Fz([String(r * r)], F(String(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.'))));
          st.push(St('Inhoud = π ' + X + ' ' + (r * r) + ' ' + X + ' ' + h + ' ≈ (' + rondTekst(d) + ')', af(V, d, 'cm³'), 'Tik in: π ' + X + ' ' + (r * r) + ' ' + X + ' ' + h + ' = ' + T(V, { dec:3 }) + '…', Fz(af(V, d, 'cm³'), F(afT(PI * 4 * r * r * h, d), 'Je nam de diameter. Gebruik de straal.', afT(PI * 2 * r * h, d), 'Je deed π × d × h. Gebruik π × r² × h.')), { e:'cm³' }));
          return { vraag:'Inhoud?', context:'Een cilinder heeft ' + (dGeg ? 'een diameter van ' + (2 * r) : 'een straal van ' + r) + ' cm en een hoogte van ' + h + ' cm. Bereken de inhoud. ' + Rond(d), eenheid:'cm³', beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wob-m-inh-om', naam:'Inhoudsmaten omrekenen', kort:'Op de trap m³, dm³, cm³ is elke stap keer of gedeeld door 1000; 1 liter = 1 dm³ en 1 ml = 1 cm³',
        uit:'<p>Een kubus van 1 dm bij 1 dm bij 1 dm is 10 × 10 × 10 = <b>1000 cm³</b>. Daarom is op de trap <b>m³ → dm³ → cm³</b> elke stap <b>× 1000</b>. Naar boven deel je door 1000.</p><p>Voor vloeistoffen gebruik je liter: <b>1 liter = 1 dm³</b> en <b>1 ml = 1 cm³</b>.</p><p>Zet liter of ml dus eerst om naar dm³ of cm³, en gebruik dan de trap.</p>',
        wanneer:'je cm³, dm³, m³, liter en ml door elkaar ziet.',
        maak:function(R){
          var v = R.kies([
            { x:[2, 3.5, 0.8, 1.25, 4, 12, 0.3], van:'dm³', naar:'cm³', f:1000 },
            { x:[3000, 2500, 750, 125, 4200, 60], van:'cm³', naar:'dm³', f:0.001 },
            { x:[2, 1.5, 0.6, 3.25, 0.05], van:'m³', naar:'dm³', f:1000 },
            { x:[4000, 2500, 800, 150], van:'dm³', naar:'m³', f:0.001 },
            { x:[2, 1.5, 0.75, 3, 0.25], van:'liter', naar:'cm³', f:1000, eerst:'dm³' },
            { x:[500, 1500, 250, 3200, 75], van:'cm³', naar:'liter', f:0.001, na:'dm³' },
            { x:[2, 0.5, 1.2, 3.5], van:'m³', naar:'liter', f:1000, na:'dm³' },
            { x:[750, 1500, 330, 2000, 50], van:'ml', naar:'liter', f:0.001, eerst:'cm³', na:'dm³' } ]);
          var x = R.kies(v.x), y = rnd(x * v.f, 6), stappen = [], keer = v.f > 1;
          var OPT = ['keer 1000', 'gedeeld door 1000', 'keer 10', 'gedeeld door 10'];
          var bron = v.eerst || v.van, doel = v.na || v.naar;
          if (v.eerst) stappen.push(St('Schrijf als kubieke maat: ' + T(x) + ' ' + v.van + ' =', metE(T(x), v.eerst), v.van === 'liter' ? '1 liter is 1 dm³: het getal blijft hetzelfde.' : '1 ml is 1 cm³: het getal blijft hetzelfde.', null, { e:v.eerst }));
          stappen.push(kstap(R, 'Van ' + bron + ' naar ' + doel + ': is dat keer of gedeeld door?', keer ? OPT[0] : OPT[1], [], keer ? 'Naar een kleinere eenheid: er passen er meer in, dus keer 1000.' : 'Naar een grotere eenheid: er passen er minder in, dus gedeeld door 1000.', { orde:OPT }));
          stappen.push(St(T(x) + ' ' + bron + ' = (in ' + doel + ')', metE(T(y), doel), keer ? T(x) + ' ' + X + ' 1000 = ' + T(y) + '.' : T(x) + ' : 1000 = ' + T(y) + '.', Fz(metE(T(y), doel), F(T(rnd(keer ? x * 100 : x / 100, 6)), 'Bij inhoud is een stap 1000, niet 100.', T(rnd(keer ? x / 1000 : x * 1000, 6)), 'Andersom: ' + (keer ? 'keer' : 'gedeeld door') + ' 1000.')), { e:doel }));
          if (v.na) stappen.push(St('En dat is in ' + v.naar + ':', metE(T(y), v.naar === 'liter' ? 'l' : v.naar, v.naar === 'liter' ? ['liter', 'L'] : null), '1 dm³ is 1 liter: het getal blijft hetzelfde.', null, { e:v.naar === 'liter' ? 'liter' : v.naar }));
          return { vraag:T(x) + ' ' + v.van + ' = ? ' + v.naar, context:'Reken om.', eenheid:v.naar, stappen:stappen };
        } },
      { id:'wob-m-inh-liter', naam:'Hoeveel liter past erin?', kort:'Reken de inhoud uit in cm³ en deel door 1000: dan heb je liter',
        uit:'<p>Een aquarium is 60 cm lang, 30 cm breed en 40 cm hoog. De inhoud is 60 × 30 × 40 = 72.000 cm³.</p><p>Omdat <b>1 liter = 1000 cm³</b>, deel je door 1000: <b>72 liter</b>.</p><p>Het kan ook andersom: reken eerst alle maten om naar dm (60 cm = 6 dm) en vermenigvuldig dan. 6 × 3 × 4 = 72 dm³ = 72 liter.</p>',
        wanneer:'je wilt weten hoeveel water er in een bak of aquarium past.',
        maak:function(R){
          var it = R.kies([{ wat:'Een aquarium', l:[40, 50, 60, 80, 100], b:[20, 25, 30, 40], h:[25, 30, 40, 50] }, { wat:'Een plantenbak', l:[50, 60, 75, 80], b:[15, 20, 25], h:[20, 25, 30] }, { wat:'Een koelbox', l:[40, 45, 50, 60], b:[25, 30, 35], h:[30, 35, 40] }, { wat:'Een zwembadje', l:[150, 200, 250], b:[100, 120, 150], h:[30, 40, 50] }]);
          var l = R.kies(it.l), b = R.kies(it.b), h = R.kies(it.h), V = l * b * h, Lt = V / 1000;
          var bl = ruimte(balkPts(l, b, h), BALK_RIBBEN, { maten:[[0, 1, l + ' cm'], [1, 2, b + ' cm'], [2, 6, h + ' cm', 30]], vlak:[[[0, 1, 5, 4], K[0]]], aria:it.wat.toLowerCase() + ' van ' + l + ' bij ' + b + ' bij ' + h + ' cm' });
          return { vraag:'Hoeveel liter?', context:it.wat + ' is ' + l + ' cm lang, ' + b + ' cm breed en ' + h + ' cm hoog. Hoeveel liter past erin?', eenheid:'liter', beeld:bl, zelfBeeld:bl, stappen:[
            St('Inhoud = ' + l + ' ' + X + ' ' + b + ' ' + X + ' ' + h + ' =', metE(T(V), 'cm³'), 'Lengte keer breedte keer hoogte.', null, { e:'cm³' }),
            kstap(R, '1 liter = 1000 cm³. Hoe reken je cm³ om naar liter?', 'delen door 1000', [], 'Een liter is groter dan een cm³: er gaan er 1000 in. Dus delen.', { orde:['delen door 1000', 'keer 1000', 'delen door 100'] }),
            St(T(V) + ' : 1000 =', metE(T(Lt), 'liter', ['l', 'L']), 'Haal drie nullen weg of zet de komma drie plaatsen naar links.', Fz(metE(T(Lt), 'liter'), F(T(V / 100), 'Deel door 1000, niet door 100.')), { e:'liter' }) ] };
        } }
    ] });

  /* ================= 4 transformaties ================= */
  G.push({ groep:{ id:'wob-m-transf', niveau:'onderbouw', domein:'meetkunde', naam:'Spiegelen, verschuiven en draaien',
      uit:'Een driehoek in een assenstelsel spiegelen, verschuiven of draaien, en de coördinaten van het beeldpunt uitrekenen. Het beeldpunt van A heet A′, hier geschreven als A\'.' },
    doelen:[
      { id:'wob-m-tr-spiegel', naam:'Spiegelen in de x-as of de y-as', kort:'In de x-as wordt (x, y) → (x, −y); in de y-as wordt (x, y) → (−x, y)',
        uit:'<p>Bij <b>spiegelen</b> komt het beeldpunt even ver aan de <b>andere kant</b> van de spiegelas.</p><p>Spiegel je in de <b>x-as</b>, dan blijft x gelijk en verandert y van teken: (3, 2) wordt <b>(3, −2)</b>.</p><p>Spiegel je in de <b>y-as</b>, dan blijft y gelijk en verandert x van teken: (3, 2) wordt <b>(−3, 2)</b>.</p>',
        wanneer:'een figuur in een assenstelsel gespiegeld wordt in een van de assen.',
        maak:function(R){
          var as = R.kies(['x', 'y']), P, wi, Q;
          do { P = driePunten(R, -5, 5); wi = R.heel(0, 2); } while (P.some(function(p){ return as === 'x' ? p[1] === 0 : p[0] === 0; }) || P.some(function(p){ return as === 'x' ? p[1] < 0 : p[0] < 0; }) && R.heel(0, 1));
          Q = P.map(function(p){ return as === 'x' ? [p[0], -p[1]] : [-p[0], p[1]]; });
          var nm = 'ABC'.charAt(wi), A = P[wi], B = Q[wi], wat = as === 'x' ? 'y' : 'x', oud = as === 'x' ? A[1] : A[0], nieuw = -oud;
          var bl = function(n){ return rooster({ tri:P, as:as, acc:wi, beeld:n >= 3 ? Q : null, aria:'driehoek ABC en de spiegelas' }); };
          return { vraag:nm + "' = ?", context:'Driehoek ABC heeft de hoekpunten ' + puntTekst(P) + '. Spiegel de driehoek in de ' + as + '-as. Wat zijn de coördinaten van ' + nm + "'? Schrijf als (x, y).", beeld:bl, zelfBeeld:bl(0), antwoord:[co(B[0], B[1])], controle:coC(B[0], B[1]), stappen:[
            kstap(R, 'Je spiegelt in de ' + as + '-as. Welke coördinaat verandert van teken?', 'de ' + wat + '-coördinaat', [], as === 'x' ? 'Bij de x-as ga je van boven naar onder (of andersom). De x blijft gelijk, de y krijgt het andere teken.' : 'Bij de y-as ga je van rechts naar links (of andersom). De y blijft gelijk, de x krijgt het andere teken.', { orde:['de x-coördinaat', 'de y-coördinaat'] }),
            St('De ' + wat + '-coördinaat van ' + nm + ' is ' + T(oud) + '. Die van ' + nm + "' is", T(nieuw), 'Het andere teken: ' + T(oud) + ' wordt ' + T(nieuw) + '.', Fz([T(nieuw)], F(T(oud), 'Die blijft niet gelijk: hij krijgt het andere teken.'))),
            StC(nm + "' =", B[0], B[1], (as === 'x' ? 'x blijft ' + T(A[0]) + ', y wordt ' + T(B[1]) : 'x wordt ' + T(B[0]) + ', y blijft ' + T(A[1])) + ': ' + nm + "' = " + co(B[0], B[1]) + '.') ] };
        } },
      { id:'wob-m-tr-verschuif', naam:'Verschuiven', kort:'Tel het aantal stappen opzij bij x op en het aantal stappen omhoog bij y',
        uit:'<p>Bij <b>verschuiven</b> gaat elk punt even ver dezelfde kant op. Naar rechts tel je bij <b>x</b> op, naar links trek je af. Omhoog tel je bij <b>y</b> op, omlaag trek je af.</p><p>3 naar rechts en 2 omlaag: (1, 4) wordt (1 + 3, 4 − 2) = <b>(4, 2)</b>.</p><p>Zie je alleen dat A naar A\' gaat? Reken dan eerst uit hoeveel er bij x en bij y bij komt. Dat doe je dan ook bij B en C.</p>',
        wanneer:'een figuur in een assenstelsel verschoven wordt.',
        maak:function(R){
          var P, dx, dy, Q, wi, v = R.heel(0, 1);
          do { P = driePunten(R, -4, 4); dx = R.heel(-5, 5); dy = R.heel(-5, 5); Q = P.map(function(p){ return [p[0] + dx, p[1] + dy]; }); }
          while (!dx || !dy || Q.some(function(q){ return Math.abs(q[0]) > 6 || Math.abs(q[1]) > 6; }));
          function woord(d, as){ return Math.abs(d) + (as === 'x' ? (d > 0 ? ' naar rechts' : ' naar links') : (d > 0 ? ' omhoog' : ' omlaag')); }
          if (!v){
            wi = R.heel(0, 2); var nm = 'ABC'.charAt(wi), A = P[wi], B = Q[wi];
            var bl = function(n){ return rooster({ tri:P, acc:wi, beeld:n >= 3 ? Q : null, aria:'driehoek ABC in een assenstelsel' }); };
            return { vraag:nm + "' = ?", context:'Driehoek ABC heeft de hoekpunten ' + puntTekst(P) + '. Verschuif de driehoek ' + woord(dx, 'x') + ' en ' + woord(dy, 'y') + '. Wat zijn de coördinaten van ' + nm + "'? Schrijf als (x, y).", beeld:bl, zelfBeeld:bl(0), antwoord:[co(B[0], B[1])], controle:coC(B[0], B[1]), stappen:[
              St('De x-coördinaat: ' + plus(A[0], dx) + ' =', T(B[0]), dx > 0 ? 'Naar rechts: tel ' + dx + ' op.' : 'Naar links: trek ' + (-dx) + ' af.', Fz([T(B[0])], F(T(A[0] - dx), dx > 0 ? 'Naar rechts is erbij, niet eraf.' : 'Naar links is eraf, niet erbij.', T(A[0] + dy), 'Bij x hoort de stap opzij, niet omhoog of omlaag.'))),
              St('De y-coördinaat: ' + plus(A[1], dy) + ' =', T(B[1]), dy > 0 ? 'Omhoog: tel ' + dy + ' op.' : 'Omlaag: trek ' + (-dy) + ' af.', Fz([T(B[1])], F(T(A[1] - dy), dy > 0 ? 'Omhoog is erbij, niet eraf.' : 'Omlaag is eraf, niet erbij.', T(A[1] + dx), 'Bij y hoort de stap omhoog of omlaag.'))),
              StC(nm + "' =", B[0], B[1], 'Zet ze samen: ' + nm + "' = " + co(B[0], B[1]) + '.') ] };
          }
          var w2 = R.heel(1, 2), nmB = 'ABC'.charAt(w2), Bp = P[w2], BQ = Q[w2];
          var bl2 = function(n){ return rooster({ tri:P, acc:w2, beeld:n >= 3 ? Q : null, pijl:[P[0], Q[0]], punt:n >= 3 ? null : [Q[0], "A'"], aria:'driehoek ABC en de verschuiving van A naar A\'' }); };
          return { vraag:nmB + "' = ?", context:'Driehoek ABC heeft de hoekpunten ' + puntTekst(P) + '. Een verschuiving brengt A naar A\'' + co(Q[0][0], Q[0][1]) + '. Wat zijn de coördinaten van ' + nmB + "'? Schrijf als (x, y).", beeld:bl2, zelfBeeld:bl2(0), antwoord:[co(BQ[0], BQ[1])], controle:coC(BQ[0], BQ[1]), stappen:[
            St('Van A naar A\': hoeveel komt er bij x? ' + T(Q[0][0]) + ' ' + MIN + ' ' + (P[0][0] < 0 ? '(' + T(P[0][0]) + ')' : T(P[0][0])) + ' =', T(dx), 'Nieuw min oud. Negatief betekent naar links.', Fz([T(dx)], F(T(-dx), 'Nieuw min oud, niet oud min nieuw.'))),
            St('Hoeveel komt er bij y? ' + T(Q[0][1]) + ' ' + MIN + ' ' + (P[0][1] < 0 ? '(' + T(P[0][1]) + ')' : T(P[0][1])) + ' =', T(dy), 'Nieuw min oud. Negatief betekent omlaag.', Fz([T(dy)], F(T(-dy), 'Nieuw min oud, niet oud min nieuw.'))),
            StC('Doe hetzelfde bij ' + nmB + co(Bp[0], Bp[1]) + '. ' + nmB + "' =", BQ[0], BQ[1], 'x: ' + plus(Bp[0], dx) + ' = ' + T(BQ[0]) + ', y: ' + plus(Bp[1], dy) + ' = ' + T(BQ[1]) + '.') ] };
        } },
      { id:'wob-m-tr-halve', naam:'Een halve slag draaien om de oorsprong', kort:'Bij een halve slag (180°) om O wordt (x, y) → (−x, −y)',
        uit:'<p>Draai je een punt een <b>halve slag</b> (180°) om de oorsprong O, dan komt het aan de <b>overkant</b> van O, even ver weg.</p><p>Beide coördinaten krijgen het <b>andere teken</b>: (x, y) wordt <b>(−x, −y)</b>. Zo wordt (4, −1) het punt (−4, 1).</p><p>Het maakt niet uit of je linksom of rechtsom draait: een halve slag komt op dezelfde plek uit.</p>',
        wanneer:'een figuur 180° gedraaid wordt om de oorsprong.',
        maak:function(R){
          var P, wi; do { P = driePunten(R, -5, 5); wi = R.heel(0, 2); } while (!P[wi][0] || !P[wi][1]);
          var Q = P.map(function(p){ return [-p[0], -p[1]]; }), nm = 'ABC'.charAt(wi), A = P[wi], B = Q[wi];
          var RG = ['(x, y) → (' + MIN + 'x, ' + MIN + 'y)', '(x, y) → (' + MIN + 'x, y)', '(x, y) → (y, x)'];
          var bl = function(n){ return rooster({ tri:P, O:true, acc:wi, beeld:n >= 3 ? Q : null, aria:'driehoek ABC en de oorsprong O' }); };
          return { vraag:nm + "' = ?", context:'Driehoek ABC heeft de hoekpunten ' + puntTekst(P) + '. Draai de driehoek een halve slag (180°) om de oorsprong O. Wat zijn de coördinaten van ' + nm + "'? Schrijf als (x, y).", beeld:bl, zelfBeeld:bl(0), antwoord:[co(B[0], B[1])], controle:coC(B[0], B[1]), stappen:[
            kstap(R, 'Welke regel hoort bij een halve slag om O?', RG[0], [], 'Je komt aan de overkant van O uit: links wordt rechts en boven wordt onder. Dus beide tekens wisselen.', { orde:RG }),
            St('De x-coördinaat van ' + nm + ' is ' + T(A[0]) + '. Met het andere teken wordt dat', T(B[0]), 'Het andere teken van ' + T(A[0]) + '.', Fz([T(B[0])], F(T(A[0]), 'Ook x krijgt het andere teken.'))),
            StC(nm + "' =", B[0], B[1], 'x wordt ' + T(B[0]) + ' en y wordt ' + T(B[1]) + ': ' + co(B[0], B[1]) + '.') ] };
        } },
      { id:'wob-m-tr-kwart', naam:'Een kwartslag draaien om de oorsprong', kort:'Linksom 90°: (x, y) → (−y, x). Rechtsom 90°: (x, y) → (y, −x)',
        uit:'<p>Bij een <b>kwartslag</b> (90°) om de oorsprong ruilen x en y van plaats, en één van de twee krijgt het andere teken.</p><p><b>Linksom</b> (tegen de klok in): (x, y) wordt <b>(−y, x)</b>. Controle: (1, 0) rechts van O gaat naar (0, 1), boven O.</p><p><b>Rechtsom</b> (met de klok mee): (x, y) wordt <b>(y, −x)</b>. Controle: (1, 0) gaat naar (0, −1), onder O.</p><p>Twijfel je? Draai je schrift een kwartslag en kijk waar het punt terechtkomt.</p>',
        wanneer:'een figuur 90° gedraaid wordt om de oorsprong.',
        maak:function(R){
          var links = R.heel(0, 1) === 1, P, wi; do { P = driePunten(R, -5, 5); wi = R.heel(0, 2); } while (!P[wi][0] || !P[wi][1] || P[wi][0] === P[wi][1] || P[wi][0] === -P[wi][1]);
          var Q = P.map(function(p){ return links ? [-p[1], p[0]] : [p[1], -p[0]]; }), nm = 'ABC'.charAt(wi), A = P[wi], B = Q[wi];
          var RG = ['(x, y) → (' + MIN + 'y, x)', '(x, y) → (y, ' + MIN + 'x)', '(x, y) → (' + MIN + 'x, ' + MIN + 'y)'];
          var bl = function(n){ return rooster({ tri:P, O:true, acc:wi, beeld:n >= 3 ? Q : null, aria:'driehoek ABC en de oorsprong O' }); };
          var w = links ? 'linksom (tegen de klok in)' : 'rechtsom (met de klok mee)';
          return { vraag:nm + "' = ?", context:'Driehoek ABC heeft de hoekpunten ' + puntTekst(P) + '. Draai de driehoek 90° ' + w + ' om de oorsprong O. Wat zijn de coördinaten van ' + nm + "'? Schrijf als (x, y).", beeld:bl, zelfBeeld:bl(0), antwoord:[co(B[0], B[1])], controle:coC(B[0], B[1]), stappen:[
            kstap(R, 'Welke regel hoort bij een kwartslag ' + (links ? 'linksom' : 'rechtsom') + '?', RG[links ? 0 : 1], [], links ? 'Linksom gaat (1, 0) naar (0, 1). Dat past bij (' + MIN + 'y, x).' : 'Rechtsom gaat (1, 0) naar (0, ' + MIN + '1). Dat past bij (y, ' + MIN + 'x).', { orde:RG }),
            St(links ? 'De x-coördinaat van ' + nm + "' is " + MIN + 'y. Hier is y = ' + T(A[1]) + ', dus ' + MIN + 'y =' : 'De x-coördinaat van ' + nm + "' is y. Hier is y =", T(B[0]), links ? 'Neem y = ' + T(A[1]) + ' en geef het het andere teken.' : 'Neem gewoon y = ' + T(A[1]) + '.', Fz([T(B[0])], F(T(A[0]), 'Bij een kwartslag ruilen x en y van plaats.', T(-B[0]), links ? 'Bij linksom krijgt de nieuwe x het andere teken.' : 'Bij rechtsom blijft de nieuwe x gelijk aan y.'))),
            StC(nm + "' =", B[0], B[1], 'x wordt ' + T(B[0]) + ' en y wordt ' + (links ? 'x = ' : MIN + 'x = ') + T(B[1]) + ': ' + co(B[0], B[1]) + '.') ] };
        } }
    ] });

  /* ================= 5 evenwijdige lijnen en driehoeken ================= */
  function evW(t, i){ return i % 2 ? 180 - t : t; }
  function evT(R){ var t; do { t = R.heel(8, 28) * 5; } while (t === 90); return t; }
  G.push({ groep:{ id:'wob-m-evenw', niveau:'onderbouw', domein:'meetkunde', naam:'Hoeken bij evenwijdige lijnen en in driehoeken',
      uit:'F-hoeken en Z-hoeken bij evenwijdige lijnen, de goede hoekregel kiezen, de hoekensom van een driehoek en de gelijkbenige driehoek.' },
    doelen:[
      { id:'wob-m-ev-f', naam:'F-hoeken', kort:'Bij evenwijdige lijnen liggen F-hoeken op dezelfde plek bij elk snijpunt: ze zijn even groot',
        uit:'<p>Een lijn m snijdt twee <b>evenwijdige</b> lijnen k en l. De pijltjes op k en l betekenen: evenwijdig.</p><p>Bij elk snijpunt zie je vier hoeken. Twee hoeken die op <b>dezelfde plek</b> liggen (allebei rechtsboven, bijvoorbeeld), heten <b>F-hoeken</b>. Je kunt er een letter F langs tekenen.</p><p>F-hoeken zijn <b>even groot</b>.</p>',
        wanneer:'een lijn twee evenwijdige lijnen snijdt en de hoeken op dezelfde plek liggen.',
        maak:function(R){
          var t = evT(R), i = R.heel(0, 3), opK = R.heel(0, 1) === 1, w = evW(t, i), X1 = opK ? 'k' : 'l', Y1 = opK ? 'l' : 'k';
          var a = ['', '', '', ''], b = ['', '', '', '']; (opK ? a : b)[i] = w + '°'; (opK ? b : a)[i] = '?';
          var bl = evenwBeeld(t, a, b);
          return { vraag:'? = ?', vraagHtml:'Hoe groot is de hoek met het vraagteken?', context:'De lijnen k en l zijn evenwijdig. Lijn m snijdt ze allebei. Eén hoek is ' + w + '°.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'De hoek van ' + w + '° ligt bij lijn ' + X1 + '. Op welke plek, vanuit het snijpunt?', PLEK[i], [], 'Kijk vanuit het snijpunt van ' + X1 + ' en m: boven of onder ' + X1 + ', links of rechts van m.', { orde:PLEK }),
            kstap(R, 'Waar ligt de F-hoek ervan bij lijn ' + Y1 + '?', PLEK[i], [], 'Een F-hoek ligt bij het andere snijpunt op dezelfde plek: ook ' + PLEK[i] + '. Daar staat het vraagteken.', { orde:PLEK }),
            St('F-hoeken zijn even groot. De hoek met het vraagteken =', gr(w), 'Hij is even groot als de hoek van ' + w + '°.', Fz(gr(w), F(String(180 - w), 'Dat is de nevenhoek. F-hoeken zijn even groot.')), { e:'°' }) ] };
        } },
      { id:'wob-m-ev-z', naam:'Z-hoeken', kort:'Z-hoeken liggen tussen de evenwijdige lijnen, aan verschillende kanten van de snijlijn: ze zijn even groot',
        uit:'<p>Twee hoeken die allebei <b>tussen</b> de evenwijdige lijnen liggen, maar aan <b>verschillende kanten</b> van de snijlijn m, heten <b>Z-hoeken</b>. Je kunt er een Z (of een omgekeerde Z) langs tekenen.</p><p>Z-hoeken zijn <b>even groot</b>.</p><p>Bij lijn k (boven) liggen de hoeken tussen de lijnen onder k. Bij lijn l (onder) liggen ze boven l.</p>',
        wanneer:'een lijn twee evenwijdige lijnen snijdt en de hoeken er schuin tegenover liggen.',
        maak:function(R){
          var t = evT(R), z = R.heel(0, 1), opK = R.heel(0, 1) === 1, iK = z ? 3 : 2, iL = z ? 1 : 0, w = evW(t, iK);
          var a = ['', '', '', ''], b = ['', '', '', '']; if (opK){ a[iK] = w + '°'; b[iL] = '?'; } else { b[iL] = w + '°'; a[iK] = '?'; }
          var Y1 = opK ? 'l' : 'k', jA = opK ? iL : iK, bl = evenwBeeld(t, a, b);
          return { vraag:'? = ?', vraagHtml:'Hoe groot is de hoek met het vraagteken?', context:'De lijnen k en l zijn evenwijdig. Lijn m snijdt ze allebei. Eén hoek is ' + w + '°.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'De hoek van ' + w + '° ligt bij lijn ' + (opK ? 'k' : 'l') + '. Op welke plek, vanuit het snijpunt?', PLEK[opK ? iK : iL], [], 'Kijk vanuit het snijpunt: boven of onder de lijn, links of rechts van m. De hoek ligt tussen k en l.', { orde:PLEK }),
            kstap(R, 'De Z-hoek ligt bij lijn ' + Y1 + ', ook tussen de lijnen, maar aan de andere kant van m. Op welke plek?', PLEK[jA], [], 'Tussen de lijnen is bij ' + Y1 + (Y1 === 'k' ? ' onder k' : ' boven l') + '. De andere kant van m is ' + (PLEK[jA].indexOf('rechts') >= 0 ? 'rechts' : 'links') + '.', { orde:PLEK }),
            St('Z-hoeken zijn even groot. De hoek met het vraagteken =', gr(w), 'Hij is even groot als de hoek van ' + w + '°.', Fz(gr(w), F(String(180 - w), 'Dat is de nevenhoek. Z-hoeken zijn even groot.')), { e:'°' }) ] };
        } },
      { id:'wob-m-ev-regel', naam:'Welke hoekregel past?', kort:'Kies eerst de regel: F-hoeken, Z-hoeken, overstaande hoeken of nevenhoeken. Reken dan uit',
        uit:'<p>Bij twee evenwijdige lijnen en een snijlijn heb je vier regels:</p><p><b>F-hoeken</b> (zelfde plek, ander snijpunt): even groot. <b>Z-hoeken</b> (tussen de lijnen, aan weerskanten van m): even groot. <b>Overstaande hoeken</b> (tegenover elkaar bij hetzelfde snijpunt): even groot. <b>Nevenhoeken</b> (naast elkaar op een rechte lijn): samen 180°.</p><p>Kijk dus eerst hoe de twee hoeken ten opzichte van elkaar liggen. Dan weet je de regel.</p>',
        wanneer:'je bij evenwijdige lijnen niet meteen ziet welke regel je nodig hebt.',
        maak:function(R){
          var t = evT(R), soort = R.kies(['F', 'Z', 'O', 'N']), opK = R.heel(0, 1) === 1, i, j, zelfde = false;
          if (soort === 'F'){ i = R.heel(0, 3); j = i; }
          else if (soort === 'Z'){ var z = R.heel(0, 1); i = opK ? (z ? 3 : 2) : (z ? 1 : 0); j = opK ? (z ? 1 : 0) : (z ? 3 : 2); }
          else { zelfde = true; i = R.heel(0, 3); j = soort === 'O' ? (i + 2) % 4 : (i + R.kies([1, 3])) % 4; }
          var w = evW(t, i), uit = evW(t, j), a = ['', '', '', ''], b = ['', '', '', ''];
          (opK ? a : b)[i] = w + '°'; ((zelfde ? opK : !opK) ? a : b)[j] = '?';
          var REG = ['F-hoeken: even groot', 'Z-hoeken: even groot', 'overstaande hoeken: even groot', 'nevenhoeken: samen 180°'], gi = { F:0, Z:1, O:2, N:3 }[soort];
          var hint = ['De twee hoeken liggen op dezelfde plek, maar bij verschillende snijpunten.', 'Ze liggen allebei tussen k en l, aan verschillende kanten van m.', 'Ze liggen bij hetzelfde snijpunt, recht tegenover elkaar.', 'Ze liggen bij hetzelfde snijpunt naast elkaar, op een rechte lijn.'][gi];
          var bl = evenwBeeld(t, a, b);
          return { vraag:'? = ?', vraagHtml:'Hoe groot is de hoek met het vraagteken?', context:'De lijnen k en l zijn evenwijdig. Lijn m snijdt ze allebei. Eén hoek is ' + w + '°.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Hoe liggen de twee hoeken ten opzichte van elkaar? Welke regel past?', REG[gi], [], hint, { orde:REG }),
            St(soort === 'N' ? 'De hoek met het vraagteken = 180 ' + MIN + ' ' + w + ' =' : 'De hoek met het vraagteken =', gr(uit), soort === 'N' ? 'Nevenhoeken zijn samen 180°.' : 'Deze hoeken zijn even groot.', Fz(gr(uit), F(String(180 - uit), soort === 'N' ? 'Nevenhoeken zijn niet gelijk: samen zijn ze 180°.' : 'Deze hoeken zijn even groot, niet samen 180°.')), { e:'°' }) ] };
        } },
      { id:'wob-m-ev-driehoek', naam:'De hoekensom van een driehoek', kort:'De drie hoeken van een driehoek zijn samen 180°',
        uit:'<p>Knip de drie hoeken van een driehoek af en leg ze naast elkaar. Ze vormen samen een <b>gestrekte hoek</b>. De hoeken van een driehoek zijn dus samen <b>180°</b>.</p><p>Weet je twee hoeken, tel ze dan op en trek ze af van 180°.</p><p>∠A = 50° en ∠B = 70°: samen 120°, dus ∠C = 180 − 120 = <b>60°</b>.</p>',
        wanneer:'je twee hoeken van een driehoek weet en de derde zoekt.',
        maak:function(R){
          var x = [], q, nm = R.kies(NAMEN3);
          do { if (R.heel(0, 1)){ x = [R.heel(4, 22) * 5, R.heel(4, 22) * 5]; } else { x = [R.heel(21, 99), R.heel(21, 99)]; } if (R.heel(0, 3) === 0) x[0] = 90; x.push(180 - x[0] - x[1]); } while (x[2] < 25 || x[0] < 25 || x[1] < 25 || Math.max.apply(null, x) > 115);
          x = R.hussel(x); q = R.heel(0, 2);
          var bek = x.filter(function(v, k){ return k !== q; }), sb = bek[0] + bek[1];
          var bl = tekenFig(driePts(x[0], x[1]), { hoek:x.map(function(v, k){ return k === q ? '?' : v + '°'; }), kl:[K[0], K[3], K[2]].map(function(c, k){ return k === q ? K[1] : c; }), namen:nm, aria:'driehoek ' + nm.join('') });
          var andere = nm.filter(function(v, k){ return k !== q; });
          return { vraag:'∠' + nm[q] + ' = ?', context:'In driehoek ' + nm.join('') + ' is ∠' + andere[0] + ' = ' + bek[0] + '° en ∠' + andere[1] + ' = ' + bek[1] + '°. Bereken ∠' + nm[q] + '.', eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
            St('De twee bekende hoeken samen: ' + bek[0] + ' + ' + bek[1] + ' =', gr(sb), 'Tel de twee hoeken op.', null, { e:'°' }),
            St('∠' + nm[q] + ' = 180 ' + MIN + ' ' + sb + ' =', gr(180 - sb), 'De drie hoeken zijn samen 180°.', Fz(gr(180 - sb), F(String(sb), 'Dat zijn de twee bekende hoeken samen. Trek ze af van 180°.', String(360 - sb), 'Een driehoek is samen 180°, niet 360°.')), { e:'°' }) ] };
        } },
      { id:'wob-m-ev-gelijkbenig', naam:'Hoeken in een gelijkbenige driehoek', kort:'Tegenover de twee gelijke zijden liggen twee gelijke hoeken: de basishoeken',
        uit:'<p>Een <b>gelijkbenige</b> driehoek heeft twee even lange zijden, de <b>benen</b>. Die zie je aan de streepjes.</p><p>De twee hoeken bij de <b>basis</b> (de derde zijde) zijn <b>even groot</b>. De hoek tussen de benen is de <b>tophoek</b>.</p><p>Tophoek 40°: de basishoeken zijn samen 180 − 40 = 140°, dus elk 70°. Basishoek 65°: de tophoek is 180 − 2 × 65 = 50°.</p>',
        wanneer:'een driehoek twee zijden met een streepje heeft.',
        maak:function(R){
          var nm = R.kies(NAMEN3), perm = R.hussel([0, 1, 2]), N = perm.map(function(k){ return nm[k]; }), top = N[2], v = R.heel(0, 1), tp, bs;
          if (v === 0){ tp = R.heel(15, 55) * 2; bs = (180 - tp) / 2; } else { do { bs = R.heel(35, 75); } while (bs === 60); tp = 180 - 2 * bs; }
          var rot = R.kies([0, 0, 90, 180, 270, 30, 210]), pts = driePts(bs, bs).map(function(p){ return draai(p, rot); });
          var lab = v === 0 ? ['?', '', tp + '°'] : [bs + '°', '', '?'];
          var bl = tekenFig(pts, { hoek:lab, kl:[K[0], K[0], K[3]], namen:N, aria:'gelijkbenige driehoek ' + nm.join(''), na:function(P){ return streepje(P[0], P[2]) + streepje(P[1], P[2]); } });
          var paar = [[N[0], N[1]], [N[0], top], [N[1], top]].map(function(p){ p = p.slice().sort(); return '∠' + p[0] + ' en ∠' + p[1]; }), goedP = paar[0];
          var benen = zn(top, N[0]) + ' = ' + zn(top, N[1]);
          var st = [kstap(R, 'Welke twee hoeken zijn even groot?', goedP, paar.slice(1), 'De gelijke hoeken liggen bij de basis ' + zn(N[0], N[1]) + ', tegenover de gelijke zijden.')];
          if (v === 0) st.push(St('De basishoeken samen: 180 ' + MIN + ' ' + tp + ' =', gr(180 - tp), 'Trek de tophoek af van 180°.', null, { e:'°' }),
            St('∠' + N[0] + ' = ' + (180 - tp) + ' : 2 =', gr(bs), 'De twee basishoeken zijn even groot: deel door 2.', Fz(gr(bs), F(String(180 - tp), 'Dat zijn de twee basishoeken samen. Deel nog door 2.', String(tp), 'De basishoek is niet even groot als de tophoek.')), { e:'°' }));
          else st.push(St('De basishoeken samen: 2 ' + X + ' ' + bs + ' =', gr(2 * bs), '∠' + N[1] + ' is ook ' + bs + '°.', null, { e:'°' }),
            St('∠' + top + ' = 180 ' + MIN + ' ' + (2 * bs) + ' =', gr(tp), 'Wat er van de 180° overblijft, is de tophoek.', Fz(gr(tp), F(String(180 - bs), 'Er zijn twee basishoeken van ' + bs + '°.', String(bs), 'De tophoek is niet even groot als een basishoek.')), { e:'°' }));
          return { vraag:'∠' + (v === 0 ? N[0] : top) + ' = ?', context:'Driehoek ' + nm.join('') + ' is gelijkbenig: ' + benen + '. ' + (v === 0 ? '∠' + top + ' = ' + tp + '°. Bereken ∠' + N[0] + '.' : '∠' + N[0] + ' = ' + bs + '°. Bereken ∠' + top + '.'), eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  /* ================= 6 cirkel en samengestelde figuren ================= */
  function cirkelBeeld(v, isD, e){
    var c = [190, 125], r = 95, s = cir(c[0], c[1], r, { f:K[0], fo:0.1, w:2.5 });
    if (isD){ var a = pol(c[0], c[1], r, 200), b = pol(c[0], c[1], r, 20); s += lnP(a, b, { k:K[1], w:3 }) + tx(c[0] + 6, c[1] - 14, 'd = ' + T(v) + ' ' + e, { vet:true, k:K[1], fs:15 }); }
    else { var p = pol(c[0], c[1], r, 25); s += lnP(c, p, { k:K[1], w:3 }) + tx((c[0] + p[0]) / 2 - 4, (c[1] + p[1]) / 2 - 12, 'r = ' + T(v) + ' ' + e, { vet:true, k:K[1], fs:15 }); }
    s += cir(c[0], c[1], 4, { f:'var(--ink)', s:'none', w:0 }) + tx(c[0] - 10, c[1] + 18, 'M', { vet:true, fs:14 });
    return svg(380, 250, s, 'cirkel met ' + (isD ? 'diameter ' : 'straal ') + T(v) + ' ' + e, 360);
  }
  /* samengestelde figuren: elke vorm geeft de stappen en een plaatje dat meegroeit */
  function lab(f, p, t, dx, dy, a){ var q = f(p); return tx(q[0] + dx, q[1] + dy, t, { mid:true, vet:true, fs:14, a:a || 'middle' }); }
  function vulRect(f, x0, y0, x1, y1, kl, fo){ return pg([f([x0, y0]), f([x1, y0]), f([x1, y1]), f([x0, y1])], { f:kl, fo:fo, s:'none', w:0 }); }
  var VORM = {
    L:function(R, manier){
      var W = R.heel(6, 12), H = R.heel(5, 10), cw = R.heel(2, W - 3), ch = R.heel(2, H - 3), e = R.kies(['m', 'cm']), e2 = e + '²';
      var O = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]];
      var beeld = function(n){
        var t = pas(O, 380, 250, 40), f = t.f, s = pad(pth(O.map(f)), { f:K[0], fo:0.08, s:'none', w:0 });
        if (manier === 'erbij'){ if (n >= 1) s += vulRect(f, 0, 0, W, H - ch, K[0], 0.25) + lab(f, [W / 2, (H - ch) / 2], '1', 0, 0); if (n >= 2) s += vulRect(f, 0, H - ch, W - cw, H, K[3], 0.25) + lab(f, [(W - cw) / 2, H - ch / 2], '2', 0, 0); s += lnP(f([0, H - ch]), f([W - cw, H - ch]), { k:K[1], w:2.5, stip:'6 5' }); }
        else { s += pad(pth([[W - cw, H - ch], [W, H - ch], [W, H], [W - cw, H]].map(f)), { s:K[1], w:2.5, stip:'6 5', f:n >= 2 ? K[1] : 'none', fo:0.2 }); }
        s += pad(pth(O.map(f)), { w:2.5 });
        s += lab(f, [W / 2, 0], W + ' ' + e, 0, 16) + lab(f, [0, H / 2], H + ' ' + e, -8, 0, 'end') + lab(f, [(W - cw) / 2, H], (W - cw) + ' ' + e, 0, -12) + lab(f, [W, (H - ch) / 2], (H - ch) + ' ' + e, 8, 0, 'start') +
          lab(f, [W - cw / 2, H], cw + ' ' + e, 0, -12) + lab(f, [W - cw, H - ch / 2], ch + ' ' + e, 8, 0, 'start');
        return svg(380, 250, s, 'een L-vormige figuur', 400);
      };
      var r1 = W * (H - ch), r2 = (W - cw) * ch, gr_ = W * H, wg = cw * ch, tot = r1 + r2;
      var st = manier === 'erbij' ? [
        St('Stuk 1 (de onderste rechthoek): ' + W + ' ' + X + ' ' + (H - ch) + ' =', metE(String(r1), e2), 'De onderste rechthoek is ' + W + ' breed en ' + (H - ch) + ' hoog.', null, { e:e2 }),
        St('Stuk 2 (de rechthoek linksboven): ' + (W - cw) + ' ' + X + ' ' + ch + ' =', metE(String(r2), e2), 'Dit stuk is ' + (W - cw) + ' breed en ' + ch + ' hoog.', Fz(metE(String(r2), e2), F(String((W - cw) * H), 'Neem alleen het stuk boven de stippellijn: ' + ch + ' hoog.')), { e:e2 }),
        St('Samen: ' + r1 + ' + ' + r2 + ' =', metE(String(tot), e2), 'Tel de twee stukken op.', Fz(metE(String(tot), e2), F(String(gr_), 'Dat is de hele rechthoek, met het lege hoekje erbij.')), { e:e2 }) ] : [
        St('De grote rechthoek eromheen: ' + W + ' ' + X + ' ' + H + ' =', metE(String(gr_), e2), 'Doe alsof het hoekje er nog in zit: ' + W + ' bij ' + H + '.', null, { e:e2 }),
        St('Het stuk dat eruit is: ' + cw + ' ' + X + ' ' + ch + ' =', metE(String(wg), e2), 'Het lege hoekje is ' + cw + ' bij ' + ch + '.', null, { e:e2 }),
        St('Over: ' + gr_ + ' ' + MIN + ' ' + wg + ' =', metE(String(tot), e2), 'Haal het lege stuk eraf.', Fz(metE(String(tot), e2), F(String(gr_ + wg), 'Het stuk moet eraf, niet erbij.')), { e:e2 }) ];
      return { beeld:beeld, stappen:st, e:e2, wat:'de L-vormige figuur', maat:'De figuur is ' + W + ' ' + e + ' breed en ' + H + ' ' + e + ' hoog; rechtsboven is een stuk van ' + cw + ' bij ' + ch + ' ' + e + ' weg.' };
    },
    huis:function(R){
      var W = R.heel(4, 12), H = R.heel(3, 8), t = R.heel(2, 6), e = R.kies(['m', 'cm']), e2 = e + '²', O = [[0, 0], [W, 0], [W, H], [W / 2, H + t], [0, H]];
      var beeld = function(n){
        var f = pas(O, 380, 250, 40).f, s = pad(pth(O.map(f)), { f:K[0], fo:0.08, s:'none', w:0 });
        if (n >= 1) s += vulRect(f, 0, 0, W, H, K[0], 0.25); if (n >= 2) s += pg([f([0, H]), f([W, H]), f([W / 2, H + t])], { f:K[3], fo:0.25, s:'none', w:0 });
        s += lnP(f([0, H]), f([W, H]), { k:K[1], w:2.5, stip:'6 5' }) + lnP(f([W / 2, H]), f([W / 2, H + t]), { k:K[1], w:2.5, stip:'4 4' }) + pad(pth(O.map(f)), { w:2.5 });
        s += lab(f, [W / 2, 0], W + ' ' + e, 0, 16) + lab(f, [0, H / 2], H + ' ' + e, -8, 0, 'end') + lab(f, [W / 2, H + t / 2], t + ' ' + e, 8, 0, 'start');
        return svg(380, 250, s, 'een huisje: een rechthoek met een driehoek erop', 400);
      };
      var r1 = W * H, r2 = W * t / 2, tot = r1 + r2;
      return { beeld:beeld, e:e2, wat:'het huisje', maat:'Het huisje is ' + W + ' ' + e + ' breed. De muur is ' + H + ' ' + e + ' hoog en het dak ' + t + ' ' + e + '.', stappen:[
        St('De rechthoek: ' + W + ' ' + X + ' ' + H + ' =', metE(T(r1), e2), 'Breedte keer hoogte van het onderste stuk.', null, { e:e2 }),
        St('De driehoek: ' + W + ' ' + X + ' ' + t + ' : 2 =', metE(T(r2), e2), 'Basis ' + W + ' keer hoogte ' + t + ', gedeeld door 2.', Fz(metE(T(r2), e2), F(T(W * t), 'Een driehoek: deel nog door 2.')), { e:e2 }),
        St('Samen: ' + T(r1) + ' + ' + T(r2) + ' =', metE(T(tot), e2), 'Tel de twee stukken op.', null, { e:e2 }) ] };
    },
    halfrond:function(R){
      var W, H, r, half; do { W = R.heel(4, 12); H = R.kies([4, 6, 8, 10]); r = H / 2; half = PI * r * r / 2; } while (grens(half, 1));
      var e = R.kies(['m', 'cm']), e2 = e + '²', rect = W * H;
      var beeld = function(n){
        var f = pas([[0, 0], [W + r, H]], 380, 250, 40).f, sc = pas([[0, 0], [W + r, H]], 380, 250, 40).sc, rs = n1(r * sc);
        var d = 'M' + f([0, 0]).map(n1).join(' ') + ' L' + f([W, 0]).map(n1).join(' ') + ' A' + rs + ' ' + rs + ' 0 0 0 ' + f([W, H]).map(n1).join(' ') + ' L' + f([0, H]).map(n1).join(' ') + ' Z';
        var dh = 'M' + f([W, 0]).map(n1).join(' ') + ' A' + rs + ' ' + rs + ' 0 0 0 ' + f([W, H]).map(n1).join(' ') + ' Z';
        var s = pad(d, { f:K[0], fo:0.08, s:'none', w:0 });
        if (n >= 1) s += vulRect(f, 0, 0, W, H, K[0], 0.25); if (n >= 2) s += pad(dh, { f:K[3], fo:0.25, s:'none', w:0 });
        s += lnP(f([W, 0]), f([W, H]), { k:K[1], w:2.5, stip:'6 5' }) + pad(d, { w:2.5 }) + cir(f([W, r])[0], f([W, r])[1], 3, { f:'var(--ink)', s:'none', w:0 });
        s += lab(f, [W / 2, 0], W + ' ' + e, 0, 16) + lab(f, [0, H / 2], H + ' ' + e, -8, 0, 'end');
        return svg(380, 250, s, 'een rechthoek met een halve cirkel', 400);
      };
      return { beeld:beeld, e:e2, wat:'de figuur', maat:'Een rechthoek van ' + W + ' bij ' + H + ' ' + e + ' heeft rechts een halve cirkel.', extra:' ' + Rond(1), stappen:[
        St('De rechthoek: ' + W + ' ' + X + ' ' + H + ' =', metE(String(rect), e2), 'Breedte keer hoogte.', null, { e:e2 }),
        St('De halve cirkel heeft straal ' + T(r) + '. π ' + X + ' ' + T(r) + '² : 2 ≈ (rond af op 1 decimaal)', af(half, 1, e2), 'De diameter is ' + H + ', dus de straal ' + T(r) + '. Tik in: π ' + X + ' ' + T(r * r) + ' : 2 = ' + T(half, { dec:3 }) + '…', Fz(af(half, 1, e2), F(afT(2 * half, 1), 'Het is een halve cirkel: deel door 2.', afT(PI * H * H / 2, 1), 'Je nam de diameter. De straal is ' + T(r) + '.')), { e:e2 }),
        St('Samen: ' + rect + ' + ' + afT(half, 1) + ' =', af(rect + half, 1, e2), 'Tel de rechthoek en de halve cirkel op.', null, { e:e2 }) ] };
    },
    gat:function(R){
      var W = R.heel(8, 14), H = R.heel(6, 10), w = R.heel(2, W - 4), h = R.heel(2, H - 3), e = R.kies(['cm', 'dm']), e2 = e + '²', x0 = (W - w) / 2, y0 = (H - h) / 2;
      var beeld = function(n){
        var f = pas([[0, 0], [W, H]], 380, 250, 40).f, d = pth([[0, 0], [W, 0], [W, H], [0, H]].map(f)) + ' ' + pth([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]].map(f));
        var s = pad(d, { f:K[0], fo:n >= 1 ? 0.25 : 0.12, w:2.5, eo:true });
        if (n >= 2) s += vulRect(f, x0, y0, x0 + w, y0 + h, K[1], 0.2);
        s += lab(f, [W / 2, 0], W + ' ' + e, 0, 16) + lab(f, [0, H / 2], H + ' ' + e, -8, 0, 'end') + lab(f, [x0 + w / 2, y0 + h], w + ' ' + e, 0, -11) + lab(f, [x0 + w, y0 + h / 2], h + ' ' + e, 7, 0, 'start');
        return svg(380, 250, s, 'een rechthoek met een rechthoekig gat', 400);
      };
      var g = W * H, wg = w * h;
      return { beeld:beeld, e:e2, wat:'de lijst', voor:'Een fotolijst is een rechthoek met een rechthoekig gat erin.', maat:'De lijst is ' + W + ' bij ' + H + ' ' + e + ', het gat ' + w + ' bij ' + h + ' ' + e + '.', stappen:[
        St('De hele rechthoek: ' + W + ' ' + X + ' ' + H + ' =', metE(String(g), e2), 'Doe alsof er geen gat in zit.', null, { e:e2 }),
        St('Het gat: ' + w + ' ' + X + ' ' + h + ' =', metE(String(wg), e2), 'Het gat is ' + w + ' bij ' + h + '.', null, { e:e2 }),
        St('Over: ' + g + ' ' + MIN + ' ' + wg + ' =', metE(String(g - wg), e2), 'Haal het gat eraf.', Fz(metE(String(g - wg), e2), F(String(g + wg), 'Het gat moet eraf, niet erbij.')), { e:e2 }) ] };
    },
    rondgat:function(R){
      var W, H, r, c; do { W = R.heel(6, 14); H = R.heel(6, 12); r = R.heel(1, Math.floor(Math.min(W, H) / 2) - 1); c = PI * r * r; } while (r < 1 || grens(c, 1));
      var e = R.kies(['cm', 'dm']), e2 = e + '²', g = W * H;
      var beeld = function(n){
        var t = pas([[0, 0], [W, H]], 380, 250, 40), f = t.f, m = f([W / 2, H / 2]), rs = n1(r * t.sc);
        var d = pth([[0, 0], [W, 0], [W, H], [0, H]].map(f)) + ' M' + n1(m[0] - rs) + ' ' + n1(m[1]) + ' A' + rs + ' ' + rs + ' 0 1 0 ' + n1(m[0] + rs) + ' ' + n1(m[1]) + ' A' + rs + ' ' + rs + ' 0 1 0 ' + n1(m[0] - rs) + ' ' + n1(m[1]) + ' Z';
        var s = pad(d, { f:K[0], fo:n >= 1 ? 0.25 : 0.12, w:2.5, eo:true });
        if (n >= 2) s += cir(m[0], m[1], rs, { f:K[1], fo:0.2, s:'none', w:0 });
        s += lnP(m, [m[0] + rs, m[1]], { k:K[1], w:2.5 }) + cir(m[0], m[1], 3, { f:'var(--ink)', s:'none', w:0 }) + tx(m[0] + rs / 2, m[1] - 9, 'r = ' + r, { vet:true, fs:13, k:K[1] });
        s += lab(f, [W / 2, 0], W + ' ' + e, 0, 16) + lab(f, [0, H / 2], H + ' ' + e, -8, 0, 'end');
        return svg(380, 250, s, 'een rechthoek met een rond gat', 400);
      };
      return { beeld:beeld, e:e2, wat:'de plaat', voor:'Uit een rechthoekige plaat is een rond gat gezaagd.', maat:'De plaat is ' + W + ' bij ' + H + ' ' + e + ', het gat heeft een straal van ' + r + ' ' + e + '.', extra:' ' + Rond(1), stappen:[
        St('De hele plaat: ' + W + ' ' + X + ' ' + H + ' =', metE(String(g), e2), 'Doe alsof er geen gat in zit.', null, { e:e2 }),
        St('Het gat: π ' + X + ' ' + r + '² ≈ (rond af op 1 decimaal)', af(c, 1, e2), 'Tik in: π ' + X + ' ' + (r * r) + ' = ' + T(c, { dec:3 }) + '…', Fz(af(c, 1, e2), F(afT(2 * PI * r, 1), 'Dat is de omtrek van het gat. Je zoekt de oppervlakte: π × r².')), { e:e2 }),
        St('Over: ' + g + ' ' + MIN + ' ' + afT(c, 1) + ' =', af(g - c, 1, e2), 'Haal het gat eraf.', null, { e:e2 }) ] };
    },
    inkeping:function(R){
      var W = R.heel(6, 12), H = R.heel(5, 10), nb = R.heel(2, W - 2), dd = R.heel(1, H - 2), e = R.kies(['m', 'cm']), e2 = e + '²';
      var O = [[0, 0], [W, 0], [W, H], [(W + nb) / 2, H], [W / 2, H - dd], [(W - nb) / 2, H], [0, H]];
      var beeld = function(n){
        var f = pas([[0, 0], [W, H]], 380, 250, 40).f, s = pad(pth(O.map(f)), { f:K[0], fo:n >= 1 ? 0.25 : 0.12, s:'none', w:0 });
        s += pg([f([(W - nb) / 2, H]), f([(W + nb) / 2, H]), f([W / 2, H - dd])], { f:n >= 2 ? K[1] : 'none', fo:0.2, s:K[1], w:2.5, stip:'6 5' });
        s += lnP(f([W / 2, H]), f([W / 2, H - dd]), { k:K[1], w:2, stip:'3 4' }) + pad(pth(O.map(f)), { w:2.5 });
        s += lab(f, [W / 2, 0], W + ' ' + e, 0, 16) + lab(f, [0, H / 2], H + ' ' + e, -8, 0, 'end') + lab(f, [W / 2, H], nb + ' ' + e, 0, -12) + lab(f, [W / 2, H - dd / 2], dd + ' ' + e, 7, 0, 'start');
        return svg(380, 250, s, 'een rechthoek met een driehoekige inkeping', 400);
      };
      var g = W * H, wg = nb * dd / 2;
      return { beeld:beeld, e:e2, wat:'de figuur', voor:'Uit de bovenkant van een rechthoek is een driehoek geknipt.', maat:'De rechthoek is ' + W + ' bij ' + H + ' ' + e + '; de driehoek is ' + nb + ' ' + e + ' breed en ' + dd + ' ' + e + ' diep.', stappen:[
        St('De hele rechthoek: ' + W + ' ' + X + ' ' + H + ' =', metE(String(g), e2), 'Doe alsof de driehoek er nog in zit.', null, { e:e2 }),
        St('De driehoek die eruit is: ' + nb + ' ' + X + ' ' + dd + ' : 2 =', metE(T(wg), e2), 'Basis ' + nb + ' keer hoogte ' + dd + ', gedeeld door 2.', Fz(metE(T(wg), e2), F(T(nb * dd), 'Een driehoek: deel nog door 2.')), { e:e2 }),
        St('Over: ' + g + ' ' + MIN + ' ' + T(wg) + ' =', metE(T(g - wg), e2), 'Haal de driehoek eraf.', null, { e:e2 }) ] };
    }
  };
  function vormOp(v, voor){
    return { vraag:'Oppervlakte?', context:(v.voor ? v.voor + ' ' : '') + v.maat + ' Bereken de oppervlakte van ' + v.wat + '.' + (voor || '') + (v.extra || ''), eenheid:v.e, beeld:v.beeld, zelfBeeld:v.beeld(0), stappen:v.stappen };
  }
  G.push({ groep:{ id:'wob-m-cirkel', niveau:'onderbouw', domein:'meetkunde', naam:'Cirkels en samengestelde figuren',
      uit:'Omtrek en oppervlakte van een cirkel met π, en de oppervlakte van een figuur die uit stukken bestaat: erbij of eraf.' },
    doelen:[
      { id:'wob-m-cir-omtrek', naam:'Omtrek van een cirkel', kort:'Omtrek = π × d, of 2 × π × r',
        uit:'<p>De <b>straal</b> r gaat van het middelpunt M naar de rand. De <b>diameter</b> d gaat dwars door M, van rand tot rand: <b>d = 2 × r</b>.</p><p>De omtrek is iets meer dan 3 keer de diameter, precies <b>π</b> keer (π ≈ 3,14). Dus <b>omtrek = π × d</b>.</p><p>Gebruik de π-knop van je rekenmachine en rond pas aan het eind af, zoals de vraag zegt.</p>',
        wanneer:'je de lengte van de rand van een cirkel zoekt.',
        maak:function(R){
          var isD = R.heel(0, 1) === 1, it = R.kies([['Een cirkel', 'cm'], ['Een rond tafelblad', 'cm'], ['Een wiel', 'cm'], ['Een ronde vijver', 'm'], ['Een rotonde', 'm']]), e = it[1], v, d, O, dd = R.kies([0, 1, 1, 2]);
          do { v = isD ? R.heel(3, 40) : R.heel(2, 25); d = isD ? v : 2 * v; O = PI * d; } while (grens(O, dd));
          var bl = cirkelBeeld(v, isD, e), st = [kstap(R, 'Wat is gegeven: de straal of de diameter?', isD ? 'de diameter d' : 'de straal r', [], 'De straal gaat van het midden naar de rand. De diameter gaat dwars door het midden.', { orde:['de straal r', 'de diameter d'] })];
          if (!isD) st.push(St('d = 2 ' + X + ' r = 2 ' + X + ' ' + v + ' =', metE(String(d), e), 'De diameter is twee keer de straal.', null, { e:e }));
          st.push(St('Omtrek = π ' + X + ' ' + d + ' ≈ (' + rondTekst(dd) + ')', af(O, dd, e), 'Tik in: π ' + X + ' ' + d + ' = ' + T(O, { dec:4 }) + '…', Fz(af(O, dd, e), isD ? F(afT(PI * d / 2, dd), 'Je nam de straal. Hier is de diameter gegeven.', afT(PI * d * d / 4, dd), 'Dat is de oppervlakte. De omtrek is π × d.') : F(afT(PI * v, dd), 'Je nam de straal. Gebruik de diameter: π × ' + d + '.', afT(PI * v * v, dd), 'Dat is de oppervlakte. De omtrek is π × d.')), { e:e }));
          return { vraag:'Omtrek?', context:it[0] + ' heeft een ' + (isD ? 'diameter' : 'straal') + ' van ' + v + ' ' + e + '. Bereken de omtrek. ' + Rond(dd), eenheid:e, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wob-m-cir-opp', naam:'Oppervlakte van een cirkel', kort:'Oppervlakte = π × r², met de straal',
        uit:'<p>De oppervlakte van een cirkel is <b>π × r²</b>: π keer de straal keer de straal.</p><p>Gebruik altijd de <b>straal</b>. Is de diameter gegeven, deel die dan eerst door 2.</p><p>Straal 5 cm: r² = 25, en π × 25 ≈ <b>78,5 cm²</b>.</p>',
        wanneer:'je wilt weten hoeveel ruimte een cirkel inneemt.',
        maak:function(R){
          var isD = R.heel(0, 1) === 1, it = R.kies([['Een cirkel', 'cm'], ['Een pizza', 'cm'], ['Een rond tafelkleed', 'cm'], ['Een ronde vijver', 'm'], ['Een rond grasveld', 'm']]), e = it[1], e2 = e + '²', v, r, A, dd = R.kies([0, 1, 1, 2]);
          do { v = isD ? R.heel(3, 30) : R.heel(2, 20); r = isD ? v / 2 : v; A = PI * r * r; } while (grens(A, dd));
          var bl = cirkelBeeld(v, isD, e), st = [kstap(R, 'Wat is gegeven: de straal of de diameter?', isD ? 'de diameter d' : 'de straal r', [], 'De straal gaat van het midden naar de rand. De diameter gaat dwars door het midden.', { orde:['de straal r', 'de diameter d'] })];
          if (isD) st.push(St('r = d : 2 = ' + v + ' : 2 =', metE(T(r), e), 'De straal is de helft van de diameter.', Fz(metE(T(r), e), F(String(2 * v), 'Delen door 2, niet keer 2.')), { e:e }));
          st.push(St('r² = ' + T(r) + ' ' + X + ' ' + T(r) + ' =', T(r * r), T(r) + ' keer zichzelf.', Fz([T(r * r)], F(T(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.'))));
          st.push(St('Oppervlakte = π ' + X + ' ' + T(r * r) + ' ≈ (' + rondTekst(dd) + ')', af(A, dd, e2), 'Tik in: π ' + X + ' ' + T(r * r) + ' = ' + T(A, { dec:4 }) + '…', Fz(af(A, dd, e2), F(afT(PI * 4 * r * r, dd), 'Je nam de diameter. Gebruik de straal.', afT(2 * PI * r, dd), 'Dat is de omtrek. De oppervlakte is π × r².')), { e:e2 }));
          return { vraag:'Oppervlakte?', context:it[0] + ' heeft een ' + (isD ? 'diameter' : 'straal') + ' van ' + v + ' ' + e + '. Bereken de oppervlakte. ' + Rond(dd), eenheid:e2, beeld:bl, zelfBeeld:bl, stappen:st };
        } },
      { id:'wob-m-sam-erbij', naam:'Samengestelde figuur: stukken erbij', kort:'Verdeel de figuur in stukken die je kent, bereken elk stuk en tel op',
        uit:'<p>Een figuur die uit stukken bestaat, verdeel je in figuren die je kent: rechthoeken, driehoeken, een halve cirkel.</p><p>Bereken de oppervlakte van <b>elk stuk</b> en <b>tel ze op</b>.</p><p>Let op welke maten bij welk stuk horen. Een stuk dat maar een deel van de hoogte heeft, krijgt ook alleen dat deel.</p>',
        wanneer:'een figuur uit een paar bekende vormen bestaat die tegen elkaar aan liggen.',
        maak:function(R){ var s = R.kies(['L', 'L', 'huis', 'halfrond']); return vormOp(VORM[s](R, 'erbij'), s === 'L' ? ' Verdeel de figuur langs de stippellijn in twee rechthoeken.' : ' Verdeel de figuur in twee stukken.'); } },
      { id:'wob-m-sam-eraf', naam:'Samengestelde figuur: groot min wat eraf is', kort:'Neem een grote figuur eromheen en trek af wat er niet bij hoort',
        uit:'<p>Soms is het makkelijker om eerst de <b>grote figuur</b> te nemen, alsof er niets uit is.</p><p>Bereken daarna het stuk dat <b>eruit</b> is, en <b>trek het af</b>.</p><p>Dat is vooral handig bij een <b>gat</b> in het midden of een hap uit de rand: splitsen in stukken gaat daar lastig.</p>',
        wanneer:'er een gat of een hap uit een eenvoudige figuur is.',
        maak:function(R){ var s = R.kies(['L', 'gat', 'rondgat', 'inkeping']); return vormOp(VORM[s](R, 'eraf'), s === 'L' ? ' Neem de grote rechthoek en haal het lege hoekje eraf.' : ''); } },
      { id:'wob-m-sam-kies', naam:'Kies de handigste manier', kort:'Liggen de stukken naast elkaar: erbij. Is er iets uit: eraf',
        uit:'<p>Bij een samengestelde figuur heb je twee manieren: <b>erbij</b> (in stukken verdelen en optellen) en <b>eraf</b> (een grote figuur min wat eruit is).</p><p>Kijk eerst naar de vorm. Liggen er bekende figuren <b>tegen elkaar aan</b>, zoals een dak op een rechthoek? Dan is <b>erbij</b> handig.</p><p>Is er een <b>gat</b> of een <b>hap</b> uit een eenvoudige figuur? Dan is <b>eraf</b> handig.</p>',
        wanneer:'je bij een samengestelde figuur eerst moet beslissen hoe je hem aanpakt.',
        maak:function(R){
          var s = R.kies(['huis', 'halfrond', 'gat', 'rondgat', 'inkeping']), erbij = s === 'huis' || s === 'halfrond', v = VORM[s](R, erbij ? 'erbij' : 'eraf');
          var M = ['erbij: in stukken verdelen en optellen', 'eraf: een grote figuur min wat eruit is'];
          var op = vormOp(v, '');
          var oud = v.beeld; op.beeld = function(n){ return oud(Math.max(0, n - 1)); }; op.zelfBeeld = oud(0);
          op.stappen = [kstap(R, 'Welke manier is hier het handigst?', M[erbij ? 0 : 1], [], erbij ? 'Twee bekende figuren liggen tegen elkaar aan. Bereken ze los en tel op.' : 'Er is iets uit de figuur gehaald. Neem de hele figuur en haal het stuk eraf.', { orde:M })].concat(v.stappen);
          return op;
        } }
    ] });

  /* ================= 7 oppervlakte van ruimtefiguren ================= */
  G.push({ groep:{ id:'wob-m-uitslag', niveau:'onderbouw', domein:'meetkunde', naam:'Oppervlakte van ruimtefiguren',
      uit:'De oppervlakte van een ruimtefiguur is de oppervlakte van zijn uitslag: alle vlakken samen. Zo bereken je hoeveel papier, verf of karton je nodig hebt.' },
    doelen:[
      { id:'wob-m-uit-balk', naam:'Oppervlakte van een balk', kort:'Zes rechthoeken, in drie gelijke paren: onder en boven, voor en achter, links en rechts',
        uit:'<p>Vouw een balk open: dat is de <b>uitslag</b>. Hij bestaat uit <b>6 rechthoeken</b>.</p><p>Die vormen <b>drie paren</b>: onder en boven (l × b), voor en achter (l × h), links en rechts (b × h). Bereken elk paar en tel op.</p><p>Balk 5 bij 3 bij 2: 2 × 15 + 2 × 10 + 2 × 6 = 30 + 20 + 12 = <b>62 cm²</b>.</p>',
        wanneer:'je wilt weten hoeveel papier je nodig hebt om een doos in te pakken.',
        maak:function(R){
          var l = R.heel(3, 12), b = R.heel(2, 9), h = R.heel(2, 10), a1 = 2 * l * b, a2 = 2 * l * h, a3 = 2 * b * h, tot = a1 + a2 + a3;
          var bl = function(n){
            var f = pas([[0, 0], [2 * l + 2 * b, h + 2 * b]], 420, 260, 46).f, s = '';
            function vlak(x0, y0, w, hh, kl, aan){ s += pg([f([x0, y0]), f([x0 + w, y0]), f([x0 + w, y0 + hh]), f([x0, y0 + hh])], { f:aan ? kl : K[0], fo:aan ? 0.3 : 0.06, w:2 }); }
            vlak(b, 0, l, b, K[0], n >= 1); vlak(b, b + h, l, b, K[0], n >= 1);
            vlak(b, b, l, h, K[3], n >= 2); vlak(2 * b + l, b, l, h, K[3], n >= 2);
            vlak(0, b, b, h, K[2], n >= 3); vlak(b + l, b, b, h, K[2], n >= 3);
            s += lab(f, [b + l / 2, 2 * b + h], l + ' cm', 0, -11) + lab(f, [b, b + h + b / 2], b + ' cm', -8, 0, 'end') + lab(f, [0, b + h / 2], h + ' cm', -8, 0, 'end');
            return svg(420, 260, s, 'de uitslag van een balk', 440);
          };
          return { vraag:'Oppervlakte?', context:'Een doos (een balk) is ' + l + ' cm lang, ' + b + ' cm breed en ' + h + ' cm hoog. Hiernaast zie je de uitslag. Bereken de oppervlakte.', eenheid:'cm²', beeld:bl, zelfBeeld:bl(0), stappen:[
            St('Onder en boven: 2 ' + X + ' ' + l + ' ' + X + ' ' + b + ' =', metE(String(a1), 'cm²'), 'Eén vlak is ' + l + ' bij ' + b + ', en er zijn er twee.', Fz(metE(String(a1), 'cm²'), F(String(l * b), 'Er zijn twee van deze vlakken.')), { e:'cm²' }),
            St('Voor en achter: 2 ' + X + ' ' + l + ' ' + X + ' ' + h + ' =', metE(String(a2), 'cm²'), 'Eén vlak is ' + l + ' bij ' + h + ', en er zijn er twee.', Fz(metE(String(a2), 'cm²'), F(String(l * h), 'Er zijn twee van deze vlakken.')), { e:'cm²' }),
            St('Links en rechts: 2 ' + X + ' ' + b + ' ' + X + ' ' + h + ' =', metE(String(a3), 'cm²'), 'Eén vlak is ' + b + ' bij ' + h + ', en er zijn er twee.', Fz(metE(String(a3), 'cm²'), F(String(b * h), 'Er zijn twee van deze vlakken.')), { e:'cm²' }),
            St('Samen: ' + a1 + ' + ' + a2 + ' + ' + a3 + ' =', metE(String(tot), 'cm²'), 'Tel de drie paren op.', Fz(metE(String(tot), 'cm²'), F(String(l * b * h), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.', String(tot / 2), 'Je telde elk vlak maar één keer.')), { e:'cm²' }) ] };
        } },
      { id:'wob-m-uit-prisma', naam:'Oppervlakte van een prisma', kort:'Twee keer het grondvlak, plus de rechthoeken van de zijkanten',
        uit:'<p>De uitslag van een driezijdig prisma bestaat uit <b>2 driehoeken</b> (voor en achter) en <b>3 rechthoeken</b> (de zijkanten).</p><p>Elke rechthoek is zo lang als het prisma en zo breed als een zijde van de driehoek. Samen dus <b>(a + b + c) × lengte</b>: de omtrek van de driehoek keer de lengte.</p><p>Tel daar de twee driehoeken bij op.</p>',
        wanneer:'je de buitenkant van een driezijdig prisma zoekt, zoals een tent of een chocoladedoos.',
        maak:function(R){
          var t = R.kies([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [4, 3, 5], [8, 6, 10]]), a = t[0], b = t[1], c = t[2], L = R.heel(4, 15);
          var dr = a * b, rh = (a + b + c) * L, tot = dr + rh;
          var bl = ruimte([[0, 0, 0], [a, 0, 0], [0, b, 0], [0, 0, L], [a, 0, L], [0, b, L]], [[0, 1], [1, 2], [2, 0], [0, 3, 1], [1, 4], [2, 5], [3, 4, 1], [4, 5], [5, 3, 1]], { maten:[[0, 1, a + ' cm'], [0, 2, b + ' cm'], [1, 2, c + ' cm', 18, 0], [1, 4, L + ' cm']], vlak:[[[0, 1, 2], K[0]]], d:0.35, aria:'prisma met een rechthoekige driehoek als grondvlak' });
          return { vraag:'Oppervlakte?', context:'Het grondvlak van een prisma is een rechthoekige driehoek met zijden van ' + a + ', ' + b + ' en ' + c + ' cm. Het prisma is ' + L + ' cm lang. Bereken de oppervlakte.', eenheid:'cm²', beeld:bl, zelfBeeld:bl, stappen:[
            St('Twee driehoeken: 2 ' + X + ' (' + a + ' ' + X + ' ' + b + ' : 2) =', metE(String(dr), 'cm²'), 'Eén driehoek is ' + a + ' ' + X + ' ' + b + ' : 2 = ' + T(dr / 2) + '. Er zijn er twee.', Fz(metE(String(dr), 'cm²'), F(T(dr / 2), 'Er zijn twee driehoeken: voor en achter.', String(a * c), 'Gebruik de rechthoekszijden ' + a + ' en ' + b + ', niet de schuine zijde.')), { e:'cm²' }),
            St('Drie rechthoeken: (' + a + ' + ' + b + ' + ' + c + ') ' + X + ' ' + L + ' =', metE(String(rh), 'cm²'), 'Alle zijkanten zijn ' + L + ' lang. Samen zijn ze ' + (a + b + c) + ' breed.', Fz(metE(String(rh), 'cm²'), F(String((a + b) * L), 'Vergeet de rechthoek onder de schuine zijde niet.')), { e:'cm²' }),
            St('Samen: ' + dr + ' + ' + rh + ' =', metE(String(tot), 'cm²'), 'Tel de driehoeken en de rechthoeken op.', Fz(metE(String(tot), 'cm²'), F(String(dr / 2 * L), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.')), { e:'cm²' }) ] };
        } },
      { id:'wob-m-uit-cilinder', naam:'Oppervlakte van een cilinder', kort:'Twee cirkels plus een rechthoek die zo breed is als de omtrek: 2 × π × r² + π × d × h',
        uit:'<p>Vouw een blik open: je krijgt <b>twee cirkels</b> (boven en onder) en <b>een rechthoek</b> (de wand).</p><p>De rechthoek is zo hoog als de cilinder, en zo breed als de <b>omtrek</b> van de cirkel: π × d. Dus de wand is <b>π × d × h</b>.</p><p>De twee cirkels samen zijn <b>2 × π × r²</b>. Tel alles op.</p>',
        wanneer:'je wilt weten hoeveel materiaal er nodig is voor een blik of buis met deksels.',
        maak:function(R){
          var r, h, c2, w;
          do { r = R.heel(2, 8); h = R.heel(3, 15); c2 = 2 * PI * r * r; w = 2 * PI * r * h; } while (grens(c2, 1) || grens(w, 1) || Math.abs(rnd(c2, 1) + rnd(w, 1) - rnd(c2 + w, 1)) > 1e-6);
          var bl = function(n){
            var B = 2 * PI * r, t = pas([[0, -2 * r], [B, h + 2 * r]], 400, 280, 26), f = t.f, rs = r * t.sc, s = '';
            var m1 = f([B / 2, h + r]), m2 = f([B / 2, -r]);
            s += pg([f([0, 0]), f([B, 0]), f([B, h]), f([0, h])], { f:n >= 2 ? K[3] : K[0], fo:n >= 2 ? 0.28 : 0.06, w:2 });
            s += cir(m1[0], m1[1], rs, { f:n >= 1 ? K[0] : K[0], fo:n >= 1 ? 0.28 : 0.06, w:2 }) + cir(m2[0], m2[1], rs, { f:K[0], fo:n >= 1 ? 0.28 : 0.06, w:2 });
            s += lnP(m1, [m1[0] + rs, m1[1]], { k:K[1], w:2.5 }) + tx(m1[0] + rs / 2, m1[1] - 8, 'r = ' + r, { vet:true, fs:13, k:K[1] });
            s += lab(f, [0, h / 2], h + ' cm', -8, 0, 'end') + lab(f, [B / 2, 0], 'omtrek van de cirkel', 0, -12);
            return svg(400, 280, s, 'de uitslag van een cilinder', 400);
          };
          return { vraag:'Oppervlakte?', context:'Een blik (een cilinder) heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Bereken de oppervlakte, met deksel en bodem. Rond elk tussenantwoord en het eindantwoord af op 1 decimaal.', eenheid:'cm²', beeld:bl, zelfBeeld:bl(0), stappen:[
            St('Twee cirkels: 2 ' + X + ' π ' + X + ' ' + r + '² ≈', af(c2, 1, 'cm²'), 'Tik in: 2 ' + X + ' π ' + X + ' ' + (r * r) + ' = ' + T(c2, { dec:3 }) + '…', Fz(af(c2, 1, 'cm²'), F(afT(c2 / 2, 1), 'Er zijn twee cirkels: deksel en bodem.')), { e:'cm²' }),
            St('De wand: π ' + X + ' ' + (2 * r) + ' ' + X + ' ' + h + ' ≈', af(w, 1, 'cm²'), 'De rechthoek is zo breed als de omtrek π ' + X + ' ' + (2 * r) + ', en ' + h + ' hoog. Tik in: π ' + X + ' ' + (2 * r) + ' ' + X + ' ' + h + ' = ' + T(w, { dec:3 }) + '…', Fz(af(w, 1, 'cm²'), F(afT(w / 2, 1), 'Gebruik de diameter ' + (2 * r) + ' in π × d, niet de straal.')), { e:'cm²' }),
            St('Samen: ' + afT(c2, 1) + ' + ' + afT(w, 1) + ' =', af(c2 + w, 1, 'cm²'), 'Tel de cirkels en de wand op.', Fz(af(c2 + w, 1, 'cm²'), F(afT(PI * r * r * h, 1), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.')), { e:'cm²' }) ] };
        } }
    ] });

  /* ================= 8 Pythagoras ================= */
  function pytFig(nm, a, b, lab, rot){
    var pts = [[0, 0], [a, 0], [0, b]].map(function(p){ return draai(p, rot); });
    return tekenFig(pts, { zijde:[lab.a, lab.c, lab.b], namen:nm, W:360, H:250, aria:'rechthoekige driehoek ' + nm.join('') + ' met de rechte hoek bij ' + nm[0] });
  }
  function pytNamen(R){ var nm = R.kies(NAMEN3), p = R.hussel([0, 1, 2]); return p.map(function(k){ return nm[k]; }); }
  function zijden(nm){ return { a:zn(nm[0], nm[1]), b:zn(nm[0], nm[2]), c:zn(nm[1], nm[2]) }; }
  var ROT = [0, 90, 180, 270, 25, 205, 300];
  function pytSchuin(R){
    var a, b, s2, c; do { if (R.heel(0, 2) === 0){ var t = R.kies([[3, 4], [6, 8], [5, 12], [8, 15], [9, 12], [4, 3], [12, 5]]); a = t[0]; b = t[1]; } else { a = R.heel(2, 15); b = R.heel(2, 15); } s2 = a * a + b * b; c = Math.sqrt(s2); } while (grens(c, 1));
    return { a:a, b:b, s2:s2, c:c };
  }
  function pytRhz(R){
    var c, a, d2, b; do { if (R.heel(0, 2) === 0){ var t = R.kies([[5, 3], [5, 4], [10, 6], [13, 5], [13, 12], [15, 9], [17, 8]]); c = t[0]; a = t[1]; } else { c = R.heel(5, 20); a = R.heel(2, c - 1); } d2 = c * c - a * a; b = Math.sqrt(d2); } while (grens(b, 1) || b < 1.5);
    return { c:c, a:a, d2:d2, b:b };
  }
  function pytStappen(R, nm, zoekSchuin, w, kies){
    var z = zijden(nm), st = [], ex;
    if (kies) st.push(kstap(R, 'Je zoekt ' + (zoekSchuin ? z.c : z.b) + '. Is dat de schuine zijde?', zoekSchuin ? 'ja, de schuine zijde: optellen' : 'nee, een rechthoekszijde: aftrekken', [], 'De schuine zijde ligt tegenover de rechte hoek bij ' + nm[0] + '. Dat is ' + z.c + '.', { orde:['ja, de schuine zijde: optellen', 'nee, een rechthoekszijde: aftrekken'] }));
    else st.push(kstap(R, 'Welke zijde is de schuine zijde?', z.c, [z.a, z.b], 'De schuine zijde ligt tegenover de rechte hoek bij ' + nm[0] + '.'));
    if (zoekSchuin){ ex = heel(w.c);
      st.push(St(z.c + '² = ' + w.a + '² + ' + w.b + '² = ' + (w.a * w.a) + ' + ' + (w.b * w.b) + ' =', String(w.s2), 'Je zoekt de schuine zijde: de kwadraten optellen.', Fz([String(w.s2)], F(String(w.a + w.b), 'Eerst kwadrateren, dan optellen.', String(Math.abs(w.a * w.a - w.b * w.b)), 'Je zoekt de schuine zijde: optellen, niet aftrekken.'))));
      st.push(St(z.c + ' = √' + w.s2 + (ex ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(w.c, 1, 'cm'), 'Gebruik de wortelknop: √' + w.s2 + ' = ' + T(w.c, { dec:4 }) + (ex ? '.' : '…'), F(String(w.s2), 'Je vergat de wortel te nemen.'), { e:'cm' }));
    } else { ex = heel(w.b);
      st.push(St(z.b + '² = ' + w.c + '² ' + MIN + ' ' + w.a + '² = ' + (w.c * w.c) + ' ' + MIN + ' ' + (w.a * w.a) + ' =', String(w.d2), 'Je zoekt een rechthoekszijde: het kleine kwadraat van het grote aftrekken.', Fz([String(w.d2)], F(String(w.c * w.c + w.a * w.a), 'Je zoekt een rechthoekszijde: aftrekken, niet optellen.', String(w.c - w.a), 'Eerst kwadrateren, dan aftrekken.'))));
      st.push(St(z.b + ' = √' + w.d2 + (ex ? ' =' : ' ≈ (rond af op 1 decimaal)'), af(w.b, 1, 'cm'), 'Gebruik de wortelknop: √' + w.d2 + ' = ' + T(w.b, { dec:4 }) + (ex ? '.' : '…'), Fz(af(w.b, 1, 'cm'), F(String(w.d2), 'Je vergat de wortel te nemen.', afT(Math.sqrt(w.c * w.c + w.a * w.a), 1), 'Je telde op. Bij een rechthoekszijde trek je af.')), { e:'cm' }));
    }
    return st;
  }
  function pytOp(R, zoekSchuin, kies){
    var nm = pytNamen(R), z = zijden(nm), rot = R.kies(ROT), w, bl, ctx;
    if (zoekSchuin){ w = pytSchuin(R); bl = pytFig(nm, w.a, w.b, { a:w.a + ' cm', b:w.b + ' cm', c:'?' }, rot); ctx = z.a + ' = ' + w.a + ' cm en ' + z.b + ' = ' + w.b + ' cm. Bereken ' + z.c + '.'; }
    else { w = pytRhz(R); bl = pytFig(nm, w.a, w.b, { a:w.a + ' cm', b:'?', c:w.c + ' cm' }, rot); ctx = z.a + ' = ' + w.a + ' cm en ' + z.c + ' = ' + w.c + ' cm. Bereken ' + z.b + '.'; }
    return { vraag:(zoekSchuin ? z.c : z.b) + ' = ?', context:'In driehoek ' + nm.slice().sort().join('') + ' is ∠' + nm[0] + ' = 90°. ' + ctx + ' Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:pytStappen(R, nm, zoekSchuin, w, kies) };
  }
  G.push({ groep:{ id:'wob-m-pyt', niveau:'onderbouw', domein:'meetkunde', naam:'De stelling van Pythagoras',
      uit:'In een rechthoekige driehoek geldt: de twee rechthoekszijden in het kwadraat samen zijn de schuine zijde in het kwadraat. Zo bereken je een zijde, en controleer je of een driehoek rechthoekig is.' },
    doelen:[
      { id:'wob-m-pyt-schuin', naam:'De schuine zijde berekenen', kort:'Schuine zijde² = rechthoekszijde² + rechthoekszijde²; daarna de wortel',
        uit:'<p>In een <b>rechthoekige driehoek</b> ligt de <b>schuine zijde</b> tegenover de rechte hoek. Het is altijd de langste zijde. De andere twee heten <b>rechthoekszijden</b>.</p><p>De stelling van Pythagoras: <b>schuine zijde² = rechthoekszijde² + rechthoekszijde²</b>.</p><p>Rechthoekszijden 6 en 8: 36 + 64 = 100, en √100 = <b>10</b>.</p>',
        wanneer:'je twee rechthoekszijden weet en de schuine zijde zoekt.',
        maak:function(R){ return pytOp(R, true, false); } },
      { id:'wob-m-pyt-rhz', naam:'Een rechthoekszijde berekenen', kort:'Rechthoekszijde² = schuine zijde² − andere rechthoekszijde²; daarna de wortel',
        uit:'<p>Weet je de <b>schuine zijde</b> en één rechthoekszijde? Dan zoek je de andere rechthoekszijde.</p><p>Nu <b>trek je af</b>: rechthoekszijde² = schuine zijde² − andere rechthoekszijde². Neem daarna de wortel.</p><p>Schuine zijde 13, rechthoekszijde 5: 169 − 25 = 144, en √144 = <b>12</b>. De uitkomst is altijd kleiner dan de schuine zijde.</p>',
        wanneer:'je de schuine zijde en één rechthoekszijde weet.',
        maak:function(R){ return pytOp(R, false, false); } },
      { id:'wob-m-pyt-kies', naam:'Welke zijde zoek je: optellen of aftrekken?', kort:'Zoek je de schuine zijde, tel dan op. Zoek je een rechthoekszijde, trek dan af',
        uit:'<p>Bij Pythagoras is de eerste vraag: <b>welke zijde zoek je?</b></p><p>Zoek je de <b>schuine zijde</b> (tegenover de rechte hoek)? Dan <b>tel je</b> de kwadraten <b>op</b>.</p><p>Zoek je een <b>rechthoekszijde</b>? Dan <b>trek je</b> het kleine kwadraat van het grote <b>af</b>.</p><p>Controle: de schuine zijde is altijd de langste.</p>',
        wanneer:'je Pythagoras gebruikt en niet zeker weet of je moet optellen of aftrekken.',
        maak:function(R){ return pytOp(R, R.heel(0, 1) === 1, true); } },
      { id:'wob-m-pyt-check', naam:'Is de driehoek rechthoekig?', kort:'Vergelijk het kwadraat van de langste zijde met de som van de andere twee kwadraten',
        uit:'<p>Je weet de drie zijden en wilt weten of de driehoek <b>rechthoekig</b> is.</p><p>Neem de <b>langste zijde</b>. Als de driehoek rechthoekig is, dan is dat de schuine zijde. Reken het kwadraat ervan uit, en de twee andere kwadraten samen.</p><p>Zijn die <b>gelijk</b>, dan is de driehoek rechthoekig. Zijn ze <b>niet gelijk</b>, dan niet. 6, 8 en 10: 36 + 64 = 100 = 10². Rechthoekig.</p>',
        wanneer:'je drie zijden van een driehoek weet en wilt weten of er een rechte hoek in zit.',
        maak:function(R){
          var t = R.kies([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [6, 8, 10], [9, 12, 15], [12, 16, 20], [10, 24, 26]]), ja = R.heel(0, 1) === 1, z = t.slice();
          if (!ja){ do { z = t.slice(); var k = R.heel(0, 2); z[k] += R.kies([-1, 1]); z.sort(function(p, q){ return p - q; }); } while (z[0] + z[1] <= z[2] || z[0] * z[0] + z[1] * z[1] === z[2] * z[2]); }
          var nm = R.kies(NAMEN3), kant = [zn(nm[0], nm[1]), zn(nm[1], nm[2]), zn(nm[0], nm[2])], volg = R.hussel([0, 1, 2]), lang = z[2], som = z[0] * z[0] + z[1] * z[1];
          var tekst = volg.map(function(i, k){ return kant[k] + ' = ' + z[i] + ' cm'; });
          return eindKeuze({ vraag:'Is driehoek ' + nm.join('') + ' rechthoekig?', context:'Driehoek ' + nm.join('') + ' heeft zijden ' + tekst[0] + ', ' + tekst[1] + ' en ' + tekst[2] + '.', stappen:[
            St('Hoe lang is de langste zijde?', metE(String(lang), 'cm'), 'Kijk welke van de drie het grootst is.', null, { e:'cm' }),
            St('Het kwadraat van de langste zijde: ' + lang + '² =', String(lang * lang), lang + ' keer ' + lang + '.', Fz([String(lang * lang)], F(String(2 * lang), 'Kwadraat is keer zichzelf, niet keer 2.'))),
            St('De andere twee: ' + z[0] + '² + ' + z[1] + '² = ' + (z[0] * z[0]) + ' + ' + (z[1] * z[1]) + ' =', String(som), 'Tel de kwadraten van de twee kortere zijden op.', Fz([String(som)], F(String(z[0] + z[1]), 'Eerst kwadrateren, dan optellen.'))),
            kstap(R, 'Is ' + som + ' gelijk aan ' + (lang * lang) + '? Is de driehoek rechthoekig?', ja ? 'ja' : 'nee', [], ja ? 'Ze zijn gelijk: dan klopt Pythagoras, en is de driehoek rechthoekig.' : som + ' is niet gelijk aan ' + (lang * lang) + '. Dan is de driehoek niet rechthoekig.', { orde:['ja', 'nee'] }) ] });
        } },
      { id:'wob-m-pyt-toepas', naam:'Pythagoras in het echt', kort:'Zoek de rechthoekige driehoek in de situatie en bepaal eerst wat de schuine zijde is',
        uit:'<p>Een ladder tegen een muur, een kabel aan een mast, de diagonaal van een scherm: overal zit een <b>rechthoekige driehoek</b> in.</p><p>Teken die driehoek en zoek de <b>rechte hoek</b>: tussen de muur en de grond, tussen de mast en de grond. De <b>schuine zijde</b> ligt daar tegenover: de ladder, de kabel, de diagonaal.</p><p>Daarna is het gewoon Pythagoras: optellen als je de schuine zijde zoekt, aftrekken als je een rechthoekszijde zoekt.</p>',
        wanneer:'een vraag over een ladder, kabel, scherm of helling gaat.',
        maak:function(R){
          var v = R.kies(['ladderH', 'ladderL', 'tv', 'kabel']), hor, ver, sch, zoek, e, d, ctx, opt, schuinW, rr;
          if (v === 'ladderH'){ do { sch = R.kies([3, 3.5, 4, 4.5, 5, 6]); hor = R.kies([0.8, 1, 1.2, 1.5, 1.8]); ver = Math.sqrt(sch * sch - hor * hor); } while (hor > sch / 2.5 || grens(ver, 2)); zoek = 'ver'; e = 'm'; d = 2;
            ctx = 'Een ladder van ' + T(sch) + ' m staat tegen een muur. De voet van de ladder staat ' + T(hor) + ' m van de muur. Hoe hoog komt de ladder tegen de muur?'; opt = ['de ladder', 'de muur', 'de grond']; schuinW = 'de ladder'; rr = ['ladder', 'muur', 'grond']; }
          else if (v === 'ladderL'){ do { ver = R.kies([2.5, 3, 3.5, 4, 4.5, 5]); hor = R.kies([0.8, 1, 1.2, 1.5]); sch = Math.sqrt(ver * ver + hor * hor); } while (grens(sch, 2)); zoek = 'sch'; e = 'm'; d = 2;
            ctx = 'Een ladder moet tegen een muur tot ' + T(ver) + ' m hoogte reiken. De voet staat ' + T(hor) + ' m van de muur. Hoe lang moet de ladder zijn?'; opt = ['de ladder', 'de muur', 'de grond']; schuinW = 'de ladder'; rr = ['ladder', 'muur', 'grond']; }
          else if (v === 'tv'){ var tv = R.kies([[89, 50], [71, 40], [106, 60], [124, 70], [80, 45], [62, 35]]); hor = tv[0]; ver = tv[1]; sch = Math.sqrt(hor * hor + ver * ver); zoek = 'sch'; e = 'cm'; d = grens(sch, 0) ? 1 : 0;
            ctx = 'Een tv-scherm is ' + hor + ' cm breed en ' + ver + ' cm hoog. Hoe lang is de diagonaal van het scherm?'; opt = ['de diagonaal', 'de breedte', 'de hoogte']; schuinW = 'de diagonaal'; rr = ['diagonaal', 'hoogte', 'breedte']; }
          else { do { ver = R.heel(6, 15); hor = R.heel(3, 8); sch = Math.sqrt(ver * ver + hor * hor); } while (grens(sch, 1)); zoek = R.heel(0, 1) ? 'sch' : 'hor'; e = 'm'; d = 1;
            if (zoek === 'hor'){ sch = R.heel(ver + 2, ver + 6); hor = Math.sqrt(sch * sch - ver * ver); if (grens(hor, 1)) sch++; hor = Math.sqrt(sch * sch - ver * ver); }
            ctx = zoek === 'sch' ? 'Een mast van ' + ver + ' m staat recht omhoog. Een kabel loopt van de top naar een haak in de grond, ' + hor + ' m van de voet van de mast. Hoe lang is de kabel?' : 'Een mast van ' + ver + ' m staat recht omhoog. Een kabel van ' + sch + ' m loopt van de top naar de grond. Hoe ver van de mast zit de kabel vast?';
            opt = ['de kabel', 'de mast', 'de grond']; schuinW = 'de kabel'; rr = ['kabel', 'mast', 'grond']; }
          var uit = zoek === 'sch' ? sch : zoek === 'ver' ? ver : hor;
          var bl = (function(){
            var f = pas([[0, 0], [hor, 0], [0, ver]], 360, 240, 40).f, O = f([0, 0]), Hh = f([hor, 0]), V = f([0, ver]), s = '';
            if (v === 'tv'){ s += pg([O, Hh, f([hor, ver]), V], { f:K[0], fo:0.08, w:3 }) + lnP(Hh, V, { k:K[0], w:3.5 }); }
            else { s += lnP([O[0] - 20, O[1]], [Hh[0] + 30, Hh[1]], { w:3 }) + lnP(O, V, { w:v === 'kabel' ? 5 : 7, k:'var(--muted)' }) + lnP(Hh, V, { k:K[0], w:4 }); }
            s += hoekje(O[0], O[1], 0, 90, { k:'var(--ink)' });
            var lb = function(w){ return w === 'sch' ? (zoek === 'sch' ? '?' : T(sch) + ' ' + e) : w === 'ver' ? (zoek === 'ver' ? '?' : T(ver) + ' ' + e) : (zoek === 'hor' ? '?' : T(hor) + ' ' + e); };
            s += tx((Hh[0] + V[0]) / 2 + 12, (Hh[1] + V[1]) / 2 - 10, rr[0] + ': ' + lb('sch'), { vet:true, a:'start', k:zoek === 'sch' ? K[1] : K[0], fs:14 });
            s += tx(O[0] - 10, (O[1] + V[1]) / 2, rr[1] + ': ' + lb('ver'), { vet:true, a:'end', k:zoek === 'ver' ? K[1] : null, fs:14, mid:true });
            s += tx((O[0] + Hh[0]) / 2, O[1] + 20, rr[2] + ': ' + lb('hor'), { vet:true, k:zoek === 'hor' ? K[1] : null, fs:14 });
            return svg(360, 250, s, 'schets van de situatie met een rechthoekige driehoek', 380);
          })();
          var A1 = zoek === 'sch' ? hor : sch, A2 = zoek === 'sch' ? ver : (zoek === 'ver' ? hor : ver), kw = zoek === 'sch' ? A1 * A1 + A2 * A2 : A1 * A1 - A2 * A2;
          var kwT = zoek === 'sch' ? T(A1) + '² + ' + T(A2) + '² = ' + T(A1 * A1) + ' + ' + T(A2 * A2) + ' =' : T(A1) + '² ' + MIN + ' ' + T(A2) + '² = ' + T(A1 * A1) + ' ' + MIN + ' ' + T(A2 * A2) + ' =';
          return { vraag:'Hoe lang?', context:ctx + ' ' + Rond(d), eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'De rechte hoek zit ' + (v === 'tv' ? 'in de hoek van het scherm' : 'onderaan, bij de grond') + '. Wat is de schuine zijde?', schuinW, opt.filter(function(o){ return o !== schuinW; }), 'De schuine zijde ligt tegenover de rechte hoek.'),
            St((zoek === 'sch' ? 'Je zoekt de schuine zijde: optellen. ' : 'Je zoekt een rechthoekszijde: aftrekken. ') + kwT, T(kw), zoek === 'sch' ? 'Tel de twee kwadraten op.' : 'Trek het kleine kwadraat van het grote af.', Fz([T(kw)], F(T(zoek === 'sch' ? Math.abs(A1 * A1 - A2 * A2) : A1 * A1 + A2 * A2), zoek === 'sch' ? 'Je zoekt de schuine zijde: optellen.' : 'Je zoekt geen schuine zijde: aftrekken.'))),
            St('√' + T(kw) + ' ≈ (' + rondTekst(d) + ')', af(uit, d, e), 'Gebruik de wortelknop: √' + T(kw) + ' = ' + T(uit, { dec:4 }) + '…', F(T(kw), 'Je vergat de wortel te nemen.'), { e:e }) ] };
        } }
    ] });

  /* ================= 9 gelijkvormigheid ================= */
  /* een gelijkvormige situatie: origineel ABC (zijden c = AB, a = BC, b = AC) en beeld met factor k */
  function gelijk(R, kLijst, perm){
    var t = R.kies(DRIE), z = R.hussel(t), k = R.kies(kLijst), L1 = R.kies([['A', 'B', 'C'], ['K', 'L', 'M'], ['D', 'E', 'F']]), L2 = R.kies([['P', 'Q', 'R'], ['S', 'T', 'U'], ['X', 'Y', 'Z']]).slice();
    if (perm) L2 = R.hussel(L2);
    var o = { a:z[0], b:z[1], c:z[2], k:k, rot:R.kies([0, 0, 20, 60, 90, 180, 300]), spiegel:perm && R.heel(0, 1) === 1, n1:L1, n2:L2 };
    o.zijde = [o.c, o.a, o.b];   /* volgens ZIJ: 0-1, 1-2, 0-2 */
    o.nm1 = ZIJ.map(function(p){ return L1[p[0]] + L1[p[1]]; }); o.nm2 = ZIJ.map(function(p){ return L2[p[0]] + L2[p[1]]; });
    o.notatie = '△' + L1.join('') + ' ∼ △' + L2.join('');
    return o;
  }
  function gTeken(o, l1, l2){ return tweeDriehoeken({ a:o.a, b:o.b, c:o.c, k:o.k, rot:o.rot, spiegel:o.spiegel, n1:o.n1, n2:o.n2, l1:l1, l2:l2 }); }
  G.push({ groep:{ id:'wob-m-gelijk', niveau:'onderbouw', domein:'meetkunde', naam:'Gelijkvormigheid',
      uit:'Gelijkvormige figuren hebben dezelfde vorm: de hoeken zijn gelijk en alle zijden zijn met dezelfde factor vergroot of verkleind. Zoek eerst welke zijden bij elkaar horen; reken daarna met de factor of met een verhoudingstabel.' },
    doelen:[
      { id:'wob-m-gel-paren', naam:'Welke zijden horen bij elkaar?', kort:'In △ABC ∼ △PQR hoort de eerste letter bij de eerste, de tweede bij de tweede: AB hoort bij PQ',
        uit:'<p>△ABC ∼ △PQR betekent: de driehoeken zijn <b>gelijkvormig</b>, en de letters horen <b>op volgorde</b> bij elkaar. A hoort bij P, B bij Q en C bij R.</p><p>Zo hoort zijde <b>AC</b> bij zijde <b>PR</b>: de eerste en de derde letter.</p><p>Let op: de letters staan niet altijd op alfabetische volgorde, zoals in △ABC ∼ △RPQ. Dan hoort A bij R. In de figuur zie je het ook aan de gelijke hoeken.</p>',
        wanneer:'je bij twee gelijkvormige driehoeken wilt weten welke zijden je met elkaar vergelijkt.',
        maak:function(R){
          var o = gelijk(R, [1.5, 2, 0.5, 2.5], true), zi = R.heel(0, 2), heen = R.heel(0, 1) === 1;
          var van = heen ? o.n1 : o.n2, naar = heen ? o.n2 : o.n1, p = ZIJ[zi], zv = van[p[0]] + van[p[1]], zg = naar[p[0]] + naar[p[1]];
          var andere = ZIJ.filter(function(q, i){ return i !== zi; }).map(function(q){ return naar[q[0]] + naar[q[1]]; });
          var bl = gTeken(o, ['', '', ''], ['', '', '']);
          return eindKeuze({ vraag:'Welke zijde hoort bij ' + zv + '?', context:o.notatie + '. Welke zijde van △' + naar.join('') + ' hoort bij ' + zv + '?', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Bij welk punt hoort ' + van[p[0]] + '?', naar[p[0]], naar.filter(function(x){ return x !== naar[p[0]]; }), van[p[0]] + ' staat op plek ' + (p[0] + 1) + ' in △' + van.join('') + '. Kijk welke letter op plek ' + (p[0] + 1) + ' staat in △' + naar.join('') + '.'),
            kstap(R, 'Bij welk punt hoort ' + van[p[1]] + '?', naar[p[1]], naar.filter(function(x){ return x !== naar[p[1]]; }), van[p[1]] + ' staat op plek ' + (p[1] + 1) + '. Daar staat in △' + naar.join('') + ' de letter ' + naar[p[1]] + '.'),
            kstap(R, 'Welke zijde hoort bij ' + zv + '?', zg, andere, 'Zet de twee punten achter elkaar: ' + naar[p[0]] + ' en ' + naar[p[1]] + ' geeft ' + zg + '.') ] });
        } },
      { id:'wob-m-gel-factor', naam:'De vergrotingsfactor berekenen', kort:'Factor = zijde in het beeld : zijde die erbij hoort in het origineel',
        uit:'<p>Bij een vergroting worden alle zijden <b>even veel keer</b> zo groot. Dat getal is de <b>vergrotingsfactor</b> k.</p><p>Neem een zijde van het beeld en de zijde die erbij hoort in het origineel: <b>k = beeld : origineel</b>.</p><p>AB = 4 en PQ = 10: k = 10 : 4 = <b>2,5</b>. Is k kleiner dan 1, dan is het een verkleining.</p>',
        wanneer:'je wilt weten hoeveel keer zo groot een figuur geworden is.',
        maak:function(R){
          var o = gelijk(R, [1.5, 2, 2.5, 3, 0.5, 1.25, 0.75], true), zi = R.heel(0, 2), ai = (zi + R.heel(1, 2)) % 3;
          var l1 = ['', '', ''], l2 = ['', '', '']; l1[zi] = o.zijde[zi] + ''; l2[zi] = T(o.zijde[zi] * o.k); l2[ai] = T(o.zijde[ai] * o.k);
          var bl = gTeken(o, l1, l2), wat = o.k > 1 ? 'vergroting' : 'verkleining';
          return { vraag:'k = ?', context:o.notatie + ': △' + o.n2.join('') + ' is een ' + wat + ' van △' + o.n1.join('') + '. Bereken de factor k. De maten zijn in cm.', beeld:bl, zelfBeeld:bl, stappen:[
            kstap(R, 'Welke zijde van △' + o.n2.join('') + ' hoort bij ' + o.nm1[zi] + '?', o.nm2[zi], o.nm2.filter(function(x, i){ return i !== zi; }), 'Kijk naar de volgorde van de letters in ' + o.notatie + '.'),
            St('k = beeld : origineel = ' + o.nm2[zi] + ' : ' + o.nm1[zi] + ' = ' + T(o.zijde[zi] * o.k) + ' : ' + o.zijde[zi] + ' =', T(o.k), 'Deel de zijde van de ' + wat + ' door de zijde die erbij hoort in het origineel.', Fz([T(o.k)], F(T(rnd(1 / o.k, 4)), 'Andersom: beeld gedeeld door origineel.', T(rnd(o.zijde[ai] * o.k / o.zijde[zi], 4)), 'Je nam een zijde van het beeld die niet bij ' + o.nm1[zi] + ' hoort.'))) ] };
        } },
      { id:'wob-m-gel-zijde', naam:'Een zijde berekenen met de factor', kort:'Reken eerst k uit. Van origineel naar beeld: keer k. Van beeld naar origineel: gedeeld door k',
        uit:'<p>Reken eerst de factor uit met twee zijden die bij elkaar horen: <b>k = beeld : origineel</b>.</p><p>Zoek je een zijde in het <b>beeld</b>? Doe dan de zijde die erbij hoort <b>keer k</b>. Zoek je een zijde in het <b>origineel</b>? Doe dan de zijde van het beeld <b>gedeeld door k</b>.</p><p>AB = 4, PQ = 6, dus k = 1,5. BC = 6, dus QR = 6 × 1,5 = <b>9</b>.</p>',
        wanneer:'de factor een mooi getal is, zoals 2, 1,5 of 0,5.',
        maak:function(R){
          var o = gelijk(R, [1.5, 2, 2.5, 3, 0.5], false), zi = R.heel(0, 2), qi = (zi + R.heel(1, 2)) % 3, inBeeld = R.heel(0, 1) === 1;
          var B = function(i){ return T(o.zijde[i] * o.k); }, l1 = ['', '', ''], l2 = ['', '', ''];
          l1[zi] = o.zijde[zi] + ''; l2[zi] = B(zi);
          if (inBeeld){ l1[qi] = o.zijde[qi] + ''; l2[qi] = '?'; } else { l1[qi] = '?'; l2[qi] = B(qi); }
          var uit = inBeeld ? o.zijde[qi] * o.k : o.zijde[qi], zoek = inBeeld ? o.nm2[qi] : o.nm1[qi], wat = o.k > 1 ? 'vergroting' : 'verkleining';
          var bl = gTeken(o, l1, l2), KZ = ['keer ' + T(o.k), 'gedeeld door ' + T(o.k)];
          return { vraag:zoek + ' = ?', context:o.notatie + ': △' + o.n2.join('') + ' is een ' + wat + ' van △' + o.n1.join('') + '. Bereken ' + zoek + '. De maten zijn in cm.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
            St('k = ' + o.nm2[zi] + ' : ' + o.nm1[zi] + ' = ' + B(zi) + ' : ' + o.zijde[zi] + ' =', T(o.k), 'Beeld gedeeld door origineel.', Fz([T(o.k)], F(T(rnd(1 / o.k, 4)), 'Andersom: beeld gedeeld door origineel.'))),
            kstap(R, 'Je gaat van ' + (inBeeld ? o.nm1[qi] + ' (origineel) naar ' + o.nm2[qi] + ' (beeld)' : o.nm2[qi] + ' (beeld) naar ' + o.nm1[qi] + ' (origineel)') + '. Keer k of gedeeld door k?', KZ[inBeeld ? 0 : 1], [], inBeeld ? 'Van origineel naar beeld doe je keer k.' : 'Terug van beeld naar origineel doe je gedeeld door k.', { orde:KZ }),
            St(zoek + ' = ' + (inBeeld ? o.zijde[qi] + ' ' + X + ' ' + T(o.k) : B(qi) + ' : ' + T(o.k)) + ' =', metE(T(uit), 'cm'), inBeeld ? 'De zijde van het origineel keer de factor.' : 'De zijde van het beeld gedeeld door de factor.', Fz(metE(T(uit), 'cm'), F(T(rnd(inBeeld ? o.zijde[qi] / o.k : o.zijde[qi] * o.k * o.k, 4)), inBeeld ? 'Van origineel naar beeld is keer k, niet gedeeld door.' : 'Terug naar het origineel is gedeeld door k, niet keer.')), { e:'cm' }) ] };
        } },
      { id:'wob-m-gel-tabel', naam:'Een zijde berekenen met een verhoudingstabel', kort:'Zet de zijden die bij elkaar horen onder elkaar en vermenigvuldig kruislings',
        uit:'<p>Zet de twee driehoeken in een <b>verhoudingstabel</b>: in elke kolom twee zijden die bij elkaar horen.</p><p>Het vraagteken vind je door <b>kruislings te vermenigvuldigen</b>: vermenigvuldig de twee getallen die schuin tegenover elkaar staan, en deel door het getal dat schuin tegenover het vraagteken staat.</p><p>Zo hoef je de factor niet uit te rekenen. Dat is handig als die geen mooi getal is, zoals 7 : 3.</p>',
        wanneer:'de vergrotingsfactor geen mooi getal is.',
        maak:function(R){
          var o, zi, qi, s, m, kb, ko, inBeeld, uit, d;
          do { o = gelijk(R, [1], false); zi = R.heel(0, 2); qi = (zi + R.heel(1, 2)) % 3; s = o.zijde; inBeeld = R.heel(0, 1) === 1;
            if (inBeeld){ ko = s[zi]; kb = R.heel(ko + 1, 2 * ko + 3); uit = s[qi] * kb / ko; }
            else { kb = s[zi]; ko = R.heel(Math.max(2, Math.ceil(kb / 3)), kb - 1); uit = s[qi] * ko / kb; }
          } while (eindig(kb, ko) || grens(uit, 1));
          d = heel(uit) ? 0 : 1;
          /* de driehoek met de bekende zijde heeft de hele maten s; de andere is daar een vergroting of verkleining van */
          var k = kb / ko, o1 = inBeeld ? s : s.map(function(x){ return x / k; });
          var l1 = ['', '', ''], l2 = ['', '', '']; l1[zi] = ko + ''; l2[zi] = kb + '';
          if (inBeeld){ l1[qi] = s[qi] + ''; l2[qi] = '?'; } else { l1[qi] = '?'; l2[qi] = s[qi] + ''; }
          var tel = inBeeld ? [kb, s[qi]] : [ko, s[qi]], noem = inBeeld ? ko : kb, prod = tel[0] * tel[1];
          var tab = function(n){ var r1 = ['△' + o.n1.join(''), ko + '', inBeeld ? s[qi] + '' : (n >= 3 ? afT(uit, d) : '?')], r2 = ['△' + o.n2.join(''), kb + '', inBeeld ? (n >= 3 ? afT(uit, d) : '?') : s[qi] + ''];
            return R0.teken.tabel([['', o.nm1[zi] + ' en ' + o.nm2[zi], o.nm1[qi] + ' en ' + o.nm2[qi]], r1, r2], { kop:true, zijkop:true, nadruk:n >= 3 ? [[inBeeld ? 2 : 1, 2]] : [] }); };
          var plaatje = gTeken({ a:o1[1], b:o1[2], c:o1[0], k:k, rot:o.rot, spiegel:false, n1:o.n1, n2:o.n2 }, l1, l2);
          var bl = function(n){ return plaatje + tab(n); };
          var zoek = inBeeld ? o.nm2[qi] : o.nm1[qi];
          return { vraag:zoek + ' = ?', context:o.notatie + '. Bereken ' + zoek + ' met een verhoudingstabel. De maten zijn in cm.' + (d ? ' Rond af op 1 decimaal.' : ''), eenheid:'cm', beeld:bl, zelfBeeld:bl(0), stappen:[
            kstap(R, 'In de tabel staan zijden die bij elkaar horen onder elkaar. Welke zijde hoort bij ' + o.nm1[qi] + '?', o.nm2[qi], o.nm2.filter(function(x, i){ return i !== qi; }), 'Kijk naar de volgorde van de letters in ' + o.notatie + '.'),
            St('Kruislings: vermenigvuldig de twee getallen die schuin tegenover elkaar staan. ' + T(tel[0]) + ' ' + X + ' ' + T(tel[1]) + ' =', T(prod), 'Het vraagteken staat schuin tegenover ' + T(noem) + '. De andere twee getallen zijn ' + T(tel[0]) + ' en ' + T(tel[1]) + '.'),
            St(zoek + ' = ' + T(prod) + ' : ' + T(noem) + (d ? ' ≈ (rond af op 1 decimaal)' : ' ='), af(uit, d, 'cm'), 'Deel door het getal dat schuin tegenover het vraagteken staat: ' + T(noem) + '. Dat is ' + T(uit, { dec:4 }) + (d ? '…' : '.'), Fz(af(uit, d, 'cm'), F(afT(prod / s[qi], d), 'Deel door het getal schuin tegenover het vraagteken: ' + T(noem) + '.')), { e:'cm' }) ] };
        } },
      { id:'wob-m-gel-kies', naam:'Kies de handigste manier', kort:'Is de factor een mooi getal? Reken met de factor. Zo niet, gebruik een verhoudingstabel',
        uit:'<p>Een ontbrekende zijde kun je vinden met de <b>factor</b> of met een <b>verhoudingstabel</b>.</p><p>Reken eerst in je hoofd de factor uit: beeld : origineel. Komt er een <b>mooi getal</b> uit, zoals 2, 3 of 1,5? Dan is de <b>factor</b> het snelst.</p><p>Komt er een <b>lelijk getal</b> uit, zoals 7 : 3 = 2,333…? Dan moet je afronden en wordt je antwoord onnauwkeurig. Gebruik dan de <b>verhoudingstabel</b> en vermenigvuldig kruislings.</p>',
        wanneer:'je een zijde zoekt bij twee gelijkvormige figuren en zelf mag kiezen hoe.',
        maak:function(R){
          var mooi = R.heel(0, 1) === 1, o, zi, qi, ko, kb, k, uit;
          do { o = gelijk(R, [1], false); zi = R.heel(0, 2); qi = (zi + R.heel(1, 2)) % 3; ko = o.zijde[zi];
            if (mooi){ k = R.kies([1.5, 2, 3, 2.5, 0.5]); kb = ko * k; } else { kb = R.heel(ko + 1, 2 * ko + 3); k = kb / ko; }
            uit = o.zijde[qi] * k; } while (!heel(kb) || (!mooi && (eindig(kb, ko) || grens(uit, 1))) || (mooi && !heel(uit * 10)));
          var d = heel(uit) ? 0 : 1, M = ['met de factor', 'met een verhoudingstabel'];
          var l1 = ['', '', ''], l2 = ['', '', '']; l1[zi] = ko + ''; l2[zi] = kb + ''; l1[qi] = o.zijde[qi] + ''; l2[qi] = '?';
          o.k = k; var bl = gTeken(o, l1, l2), zoek = o.nm2[qi];
          var st = [kstap(R, 'De factor is ' + kb + ' : ' + ko + '. Welke manier is hier het handigst?', M[mooi ? 0 : 1], [], mooi ? kb + ' : ' + ko + ' = ' + T(k) + ', een mooi getal. Reken met de factor.' : kb + ' : ' + ko + ' = ' + T(k, { dec:4 }) + '…, geen mooi getal. Met een verhoudingstabel hoef je niet tussendoor af te ronden.', { orde:M })];
          if (mooi) st.push(St('k = ' + kb + ' : ' + ko + ' =', T(k), 'Beeld gedeeld door origineel.'), St(zoek + ' = ' + o.zijde[qi] + ' ' + X + ' ' + T(k) + ' =', metE(T(uit), 'cm'), 'Van origineel naar beeld: keer k.', Fz(metE(T(uit), 'cm'), F(T(rnd(o.zijde[qi] / k, 4)), 'Van origineel naar beeld is keer k.')), { e:'cm' }));
          else st.push(St('Kruislings: ' + kb + ' ' + X + ' ' + o.zijde[qi] + ' =', String(kb * o.zijde[qi]), 'Vermenigvuldig de twee getallen die schuin tegenover elkaar staan in de tabel.'),
            St(zoek + ' = ' + (kb * o.zijde[qi]) + ' : ' + ko + (d ? ' ≈ (rond af op 1 decimaal)' : ' ='), af(uit, d, 'cm'), 'Deel door het getal schuin tegenover het vraagteken: ' + ko + '. Dat is ' + T(uit, { dec:4 }) + (d ? '…' : '.'), null, { e:'cm' }));
          return { vraag:zoek + ' = ?', context:o.notatie + ': △' + o.n2.join('') + ' is een vergroting of verkleining van △' + o.n1.join('') + '. Bereken ' + zoek + '. De maten zijn in cm.' + (d ? ' Rond af op 1 decimaal.' : ''), eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st };
        } }
    ] });

  LEERROUTE.voeg('wiskunde', G);
})();
