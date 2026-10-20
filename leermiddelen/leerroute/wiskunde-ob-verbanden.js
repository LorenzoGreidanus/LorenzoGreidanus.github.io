/* De leerroute wiskunde, onderbouw (klas 1 tot 3): verbanden en grafieken.
   Het assenstelsel, grafieken lezen, formules (woordformule, invullen, opstellen,
   terugrekenen), lineaire verbanden (gelijke toename, startgetal en hellingsgetal uit
   tabel, grafiek en formule, formule bij een tabel, grafiek bij een formule), snijpunt
   en vergelijking met grafiek of tabel, kwadratische tabellen (symmetrie, top, tweede
   verschillen) en omgekeerd evenredig.
   Een tabel bij een formule, de lijn door twee punten en het snijpunt berekenen staan in
   wiskunde-verbanden.js (groep wi-lin). Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', KEER = '×';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'K', 'P', 'Q', 'R', 'S'];

  /* ================= hulpjes ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function S(tekst, ant, hint, fout, waarom){
    var s = { tekst:tekst, antwoord:uniek([].concat(ant).map(function(a){ return typeof a === 'number' ? T(a) : String(a); })), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (waarom) s.waarom = waarom;
    return s;
  }
  function SC(tekst, ant, controle, hint, fout){ var s = S(tekst, ant, hint, fout); s.controle = controle; s.invoer = 'tekst'; return s; }
  function K(R, tekst, goed, fout, hint, o){
    o = o || {};
    var l = o.orde ? o.orde.map(String) : R.hussel(uniek([goed].concat(fout || [])));
    var s = { tekst:tekst, opties:l, goed:l.indexOf(String(goed)), hint:hint };
    if (o.waarom) s.waarom = o.waarom;
    return s;
  }
  function varianten(k){ k = String(k).toLowerCase().trim(); var a = k.replace(/−/g, '-'); return uniek([k, k.replace(/\s+/g, ''), a, a.replace(/\s+/g, '')]); }
  function F(goed){
    var o = {}, g = [];
    [].concat(goed).forEach(function(x){ g = g.concat(varianten(typeof x === 'number' ? T(x) : x)); });
    for (var i = 1; i + 1 < arguments.length; i += 2){
      var uitleg = arguments[i + 1], k = arguments[i];
      if (k == null || (typeof k === 'number' && !isFinite(k))) continue;
      varianten(typeof k === 'number' ? T(k) : k).forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = uitleg; });
    }
    return o;
  }
  function nz(R, lo, hi){ var x; do { x = R.heel(lo, hi); } while (!x); return x; }
  function paren(n){ return n < 0 ? '(' + T(n) + ')' : T(n); }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  function E(termen){
    var s = '';
    termen.forEach(function(t){
      var c = t[0], v = t[1] || ''; if (!c) return;
      var abs = Math.abs(c), stuk = (v && abs === 1 ? '' : T(abs)) + v;
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }
  function eqAnt(x){ return [T(x), 'x = ' + T(x)]; }
  function geldT(v){ v = rnd(v, 2); return Math.abs(v % 1) > 1e-9 ? T(v, { dec:2, vast:true }) : T(v); }
  function punt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  function teken(n){ return n ? (n < 0 ? MIN : '+') + T(Math.abs(n)) : '0'; }
  /* a × x + b ingevuld, zoals op papier: 3 × (−2) + 5 */
  function invul(a, b, x){ return (a === 1 ? '' : a === -1 ? MIN : T(a) + ' ' + KEER + ' ') + paren(x) + (b ? (b < 0 ? ' ' + MIN + ' ' + T(-b) : ' + ' + T(b)) : ''); }

  /* ---------- uitdrukkingen lezen (zoals in wiskunde-verbanden.js) ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
  var SUPN = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9' };
  function norm(t){
    return String(t == null ? '' : t).toLowerCase().replace(/[−–—]/g, '-').replace(/[×·*]/g, '*').replace(/:/g, '/')
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function(c){ return '^' + SUPN[c]; }).replace(/,/g, '.').replace(/\s+/g, '').replace(/([a-z])(\d)(?![\d.])/g, '$1^$2');
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
  /* een uitdrukking als 4u: dezelfde betekenis is goed */
  function exprC(verwacht){ var q = lees(verwacht); return function(v){ var p = lees(String(v).trim().replace(/^=/, '')); return !!p && pGelijk(p, q); }; }
  function linQ(xv, a, b){ var q = {}; q[xv.toLowerCase()] = a; q[''] = b; return q; }
  /* een formule K = 4u + 15; "K =" mag ook weg */
  function formL(yv, q){
    var Y = {}; Y[yv.toLowerCase()] = 1;
    return function(v){
      var d = String(v).split('='); if (d.length > 2) return false;
      if (d.length === 2){
        var l = lees(d[0]), r = lees(d[1]); if (!l || !r) return false;
        if (pGelijk(l, Y)) return pGelijk(r, q);
        if (pGelijk(r, Y)) return pGelijk(l, q);
        return false;
      }
      var p = lees(d[0]); return !!p && pGelijk(p, q);
    };
  }
  function puntC(x, y){
    return function(v){
      var s = String(v).replace(/[\s()]/g, '').replace(/[−–—]/g, '-'), d = s.split(/[;,]/);
      if (d.length !== 2 || !/^-?\d+$/.test(d[0]) || !/^-?\d+$/.test(d[1])) return false;
      return +d[0] === x && +d[1] === y;
    };
  }
  /* gehele getallen in deze volgorde, gescheiden door puntkomma's, komma's of spaties */
  function rijC(rij){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/^y\s*[:=]?/, '').replace(/[;,]/g, ' ').trim();
      if (!/^[-\d\s]+$/.test(s)) return false;
      var l = s.split(/\s+/); return l.length === rij.length && l.every(function(x, i){ return /^-?\d+$/.test(x) && +x === rij[i]; });
    };
  }
  /* twee getallen in deze volgorde (startgetal; hellingsgetal), komma mag als decimaalteken */
  function tweeC(p, q){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/startgetal|hellingsgetal|\b[ab]\s*=|=/g, ' ').trim(), d;
      if (s.indexOf(';') >= 0) d = s.split(';'); else d = s.split(/\s+(?:en\s+)?/);
      d = d.map(function(x){ return x.trim(); }).filter(Boolean);
      if (d.length !== 2) return false;
      for (var i = 0; i < 2; i++) if (!/^-?\d+([.,]\d+)?$/.test(d[i])) return false;
      var a = +d[0].replace(',', '.'), b = +d[1].replace(',', '.');
      return Math.abs(a - p) < 1e-9 && Math.abs(b - q) < 1e-9;
    };
  }
  function tweeT(p, q){ return T(p) + '; ' + T(q); }
  /* y = 48/x of y = 48 : x */
  function oeC(k){
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/^y=/, ''), m = /^(\d+)(\/|:)x$/.exec(s);
      return !!m && +m[1] === k;
    };
  }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700'); if (o.op != null) st.push('opacity:' + o.op);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal' + (o.m ? ' ' + o.m : '') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function cirkel(x, y, r, k, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + k + (o.s ? ';stroke:' + o.s + ';stroke-width:' + (o.w || 2) : '') + '"/>'; }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).filter(Boolean).map(function(x){ return /^<svg/.test(x) ? '<div style="width:100%;max-width:520px">' + x + '</div>' : x; }).join('') + '</div>'; }
  function streep(o){ return { k:KL[1], w:2.5, dash:'6 4' }; }
  /* een assenstelsel met negatieve getallen: lijnen { a, b, k, naam }, punten { x, y, k, label, ring },
     en o.teken(X, Y) voor wat er verder bij moet (stippellijnen, pijlen) */
  function assen(o){
    var x0 = o.xmin, x1 = o.xmax, y0 = o.ymin, y1 = o.ymax, u = Math.min(440 / (x1 - x0), 340 / (y1 - y0)), m = 28, W = (x1 - x0) * u + 2 * m, H = (y1 - y0) * u + 2 * m, s = '';
    function X(x){ return m + (x - x0) * u; }
    function Y(y){ return m + (y1 - y) * u; }
    var ls = (y1 - y0) > 16 || (x1 - x0) > 16 ? 2 : 1;
    for (var x = x0; x <= x1; x++) s += ln(X(x), Y(y0), X(x), Y(y1), { w:1, op:0.18 });
    for (var y = y0; y <= y1; y++) s += ln(X(x0), Y(y), X(x1), Y(y), { w:1, op:0.18 });
    s += ln(X(x0) - 6, Y(0), X(x1) + 10, Y(0), { w:2 }) + ln(X(0), Y(y0) + 6, X(0), Y(y1) - 10, { w:2 });
    s += '<path d="M' + n1(X(x1) + 12) + ' ' + n1(Y(0)) + ' l-9 -5 M' + n1(X(x1) + 12) + ' ' + n1(Y(0)) + ' l-9 5 M' + n1(X(0)) + ' ' + n1(Y(y1) - 12) + ' l-5 9 M' + n1(X(0)) + ' ' + n1(Y(y1) - 12) + ' l5 9" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
    for (x = x0; x <= x1; x++) if (x && x % ls === 0) s += tx(X(x), Y(0) + 17, T(x), { m:'klein' });
    for (y = y0; y <= y1; y++) if (y && y % ls === 0) s += tx(X(0) - 7, Y(y) + 5, T(y), { m:'klein', a:'end' });
    s += tx(X(0) - 7, Y(0) + 17, '0', { m:'klein', a:'end' }) + tx(X(x1) + 12, Y(0) - 10, 'x', { m:'klein', vet:true }) + tx(X(0) + 12, Y(y1) - 6, 'y', { m:'klein', vet:true, a:'start' });
    (o.lijnen || []).forEach(function(l){
      var xa = x0, xb = x1;
      if (l.a !== 0){ var p1 = (y0 - l.b) / l.a, p2 = (y1 - l.b) / l.a; xa = Math.max(x0, Math.min(p1, p2)); xb = Math.min(x1, Math.max(p1, p2)); }
      if (xb <= xa) return;
      s += ln(X(xa), Y(l.a * xa + l.b), X(xb), Y(l.a * xb + l.b), { k:KL[l.k || 0], w:3.5 });
      if (l.naam){ var eind = o.vermijd == null || Math.abs(xb - o.vermijd) >= Math.abs(xa - o.vermijd), xn = eind ? xb - 0.4 : xa + 0.4, yn = l.a * xn + l.b; s += tx(X(xn) + (eind ? -4 : 4), Y(yn) - 10, l.naam, { k:KL[l.k || 0], vet:true, a:eind ? 'end' : 'start' }); }
    });
    if (o.teken) s += o.teken(X, Y);
    (o.punten || []).forEach(function(p){
      if (p.ring) s += cirkel(X(p.x), Y(p.y), 12, 'none', { s:KL[1], w:3 });
      s += cirkel(X(p.x), Y(p.y), 6, KL[p.k == null ? 1 : p.k], { s:'var(--kaart)', w:2 });
      if (p.label) s += tx(X(p.x) + (p.links ? -10 : 10), Y(p.y) - 10, p.label, { m:'klein', vet:true, a:p.links ? 'end' : 'start' });
    });
    return svg(W, H, s, o.aria || 'assenstelsel', o.max || Math.min(560, W * 1.15));
  }
  /* een grafiek bij een verhaal: c = { xn, yn (hokjes), dx, dy (waarde per hokje), xt, yt (namen van de assen) },
     pts = [[hokje x, hokje y], ...]; o.lees = [{ c, r, v, h }] stippellijnen naar de assen; o.vak = [van, tot] gearceerd */
  function grafiek(c, pts, o){
    o = o || {};
    var u = 34, L = 62, T0 = 44, xn = c.xn, yn = c.yn, W = L + xn * u + 30, H = T0 + yn * u + 58, s = '', i, j;
    function X(v){ return L + v * u; }
    function Y(v){ return T0 + (yn - v) * u; }
    if (o.vak) s += '<rect x="' + n1(X(o.vak[0])) + '" y="' + n1(Y(yn)) + '" width="' + n1((o.vak[1] - o.vak[0]) * u) + '" height="' + n1(yn * u) + '" style="fill:var(--lr-4);opacity:0.2"/>';
    for (i = 0; i <= xn; i++) s += ln(X(i), Y(0), X(i), Y(yn), { w:1, op:0.18 });
    for (j = 0; j <= yn; j++) s += ln(X(0), Y(j), X(xn), Y(j), { w:1, op:0.18 });
    s += ln(X(0), Y(0), X(xn) + 14, Y(0), { w:2 }) + ln(X(0), Y(0), X(0), Y(yn) - 14, { w:2 });
    s += '<path d="M' + n1(X(xn) + 16) + ' ' + n1(Y(0)) + ' l-9 -5 M' + n1(X(xn) + 16) + ' ' + n1(Y(0)) + ' l-9 5 M' + n1(X(0)) + ' ' + n1(Y(yn) - 16) + ' l-5 9 M' + n1(X(0)) + ' ' + n1(Y(yn) - 16) + ' l5 9" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
    for (i = 0; i <= xn; i++) s += tx(X(i), Y(0) + 20, T(i * c.dx), { m:'klein' });
    for (j = 1; j <= yn; j++) s += tx(X(0) - 8, Y(j) + 5, T(j * c.dy), { m:'klein', a:'end' });
    s += tx(X(xn) + 16, Y(0) + 46, c.xt, { m:'klein', a:'end', vet:true }) + tx(8, T0 - 24, c.yt, { m:'klein', a:'start', vet:true });
    s += '<path d="' + pts.map(function(p, k){ return (k ? 'L' : 'M') + n1(X(p[0])) + ' ' + n1(Y(p[1])); }).join(' ') + '" style="fill:none;stroke:var(--lr-1);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>';
    (o.lees || []).forEach(function(l){
      if (l.v) s += ln(X(l.c), Y(0), X(l.c), Y(l.r), streep());
      if (l.h) s += ln(X(0), Y(l.r), X(l.c), Y(l.r), streep());
      s += cirkel(X(l.c), Y(l.r), 6, KL[1], { s:'var(--kaart)', w:2 });
    });
    return svg(W, H, s, o.aria || 'grafiek', 560);
  }
  /* de pijlenketting bij terugrekenen: boven heen, onder terug */
  function ketting(o, n){
    var bw = 96, bh = 44, xs = [8, 222, 436], yt = 30, yb = 128, W = 540, H = 186, s = '';
    function doos(x, y, t, k){ return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="10" style="fill:var(--kaart);stroke:' + (k || 'var(--ink)') + ';stroke-width:2"/>' + (t ? tx(x + bw / 2, y + bh / 2 + 6, t, { a:'middle', vet:true }) : ''); }
    function pijl(xa, xb, y, t, k){
      var r = xb > xa ? 1 : -1;
      return ln(xa, y, xb, y, { k:k, w:2.5 }) + '<path d="M' + xb + ' ' + y + ' l' + (-r * 10) + ' -6 M' + xb + ' ' + y + ' l' + (-r * 10) + ' 6" style="fill:none;stroke:' + k + ';stroke-width:2.5;stroke-linecap:round"/>' + tx((xa + xb) / 2, y - 10, t, { a:'middle', vet:true, k:k });
    }
    s += doos(xs[0], yt, o.x) + doos(xs[1], yt, '') + doos(xs[2], yt, o.y);
    s += pijl(xs[0] + bw + 8, xs[1] - 8, yt + bh / 2, o.op1, 'var(--ink)') + pijl(xs[1] + bw + 8, xs[2] - 8, yt + bh / 2, o.op2, 'var(--ink)');
    s += doos(xs[2], yb, o.y0, KL[1]);
    if (n >= 1) s += pijl(xs[2] - 8, xs[1] + bw + 8, yb + bh / 2, o.in2, KL[1]);
    if (n >= 2) s += doos(xs[1], yb, o.mid, KL[1]) + pijl(xs[1] - 8, xs[0] + bw + 8, yb + bh / 2, o.in1, KL[1]);
    if (n >= 3) s += doos(xs[0], yb, o.x0, KL[1]);
    s += tx(4, 20, 'heen', { m:'klein', a:'start', op:0.7 }) + tx(4, yb - 12, 'terug', { m:'klein', a:'start', k:KL[1] });
    return svg(W, H, s, 'pijlenketting', 540);
  }
  /* een dalparabool en een bergparabool naast elkaar; kies: 'dal' of 'berg' maakt de andere vaag */
  function parabolen(kies){
    var s = '';
    function p(d, k, op){ return '<path d="' + d + '" style="fill:none;stroke:' + k + ';stroke-width:4;stroke-linecap:round;opacity:' + op + '"/>'; }
    s += p('M30 24 Q90 176 150 24', KL[0], kies === 'berg' ? 0.25 : 1) + p('M210 124 Q270 -24 330 124', KL[3], kies === 'dal' ? 0.25 : 1);
    s += tx(90, 150, 'dalparabool', { vet:kies === 'dal', op:kies === 'berg' ? 0.4 : 1 }) + tx(270, 150, 'bergparabool', { vet:kies === 'berg', op:kies === 'dal' ? 0.4 : 1 });
    s += tx(90, 120, 'laagste punt', { m:'klein', op:kies === 'berg' ? 0.3 : 0.75 }) + tx(270, 38, 'hoogste punt', { m:'klein', op:kies === 'dal' ? 0.3 : 0.75 });
    return svg(360, 160, s, 'dalparabool en bergparabool', 420);
  }
  function tabel(rijen, o){ return R0.teken.tabel(rijen, Object.assign({ zijkop:true }, o || {})); }

  /* ================= grafieken bij een verhaal ================= */
  var GC = [
    { xt:'tijd (uur)', yt:'temperatuur (°C)', dx:2, dy:2, xn:12, yn:10, wie:'de temperatuur', xe:'uur', ye:'°C', xh:'uur', yh:'graden', intro:'De grafiek laat de temperatuur op een dag zien.',
      bij:function(v){ return 'om ' + v + ' uur'; }, tussen:function(a, b){ return 'tussen ' + a + ' en ' + b + ' uur'; },
      vY:function(v){ return 'Hoe warm is het om ' + v + ' uur?'; }, vX:function(w){ return 'Om hoe laat is het ' + w + ' °C?'; } },
    { xt:'tijd (min)', yt:'waterhoogte (cm)', dx:5, dy:5, xn:12, yn:10, wie:'de waterhoogte', xe:'min', ye:'cm', xh:'minuten', yh:'cm', intro:'Er loopt water in en uit een bak. De grafiek laat de waterhoogte zien.',
      bij:function(v){ return 'na ' + v + ' minuten'; }, tussen:function(a, b){ return 'tussen ' + a + ' en ' + b + ' minuten'; },
      vY:function(v){ return 'Hoe hoog staat het water na ' + v + ' minuten?'; }, vX:function(w){ return 'Na hoeveel minuten staat het water ' + w + ' cm hoog?'; } },
    { xt:'tijd (s)', yt:'hoogte (m)', dx:10, dy:5, xn:12, yn:10, wie:'de hoogte van de drone', xe:'s', ye:'m', xh:'seconden', yh:'meter', intro:'De grafiek laat zien hoe hoog een drone vliegt.',
      bij:function(v){ return 'na ' + v + ' seconden'; }, tussen:function(a, b){ return 'tussen ' + a + ' en ' + b + ' seconden'; },
      vY:function(v){ return 'Hoe hoog is de drone na ' + v + ' seconden?'; }, vX:function(w){ return 'Na hoeveel seconden is de drone ' + w + ' meter hoog?'; } },
    { xt:'tijd (min)', yt:'afstand tot huis (km)', dx:5, dy:1, xn:12, yn:10, wie:'de afstand tot huis', xe:'min', ye:'km', xh:'minuten', yh:'km', intro:'Sanne fietst een rondje. De grafiek laat zien hoe ver ze van huis is.',
      bij:function(v){ return 'na ' + v + ' minuten'; }, tussen:function(a, b){ return 'tussen ' + a + ' en ' + b + ' minuten'; },
      vY:function(v){ return 'Hoe ver is Sanne na ' + v + ' minuten van huis?'; }, vX:function(w){ return 'Na hoeveel minuten is Sanne ' + w + ' km van huis?'; } },
    { xt:'tijd (uur)', yt:'water in de ton (liter)', dx:1, dy:20, xn:12, yn:10, wie:'de hoeveelheid water', xe:'uur', ye:'liter', xh:'uur', yh:'liter', intro:'De grafiek laat zien hoeveel water er in een regenton zit.',
      bij:function(v){ return 'na ' + v + ' uur'; }, tussen:function(a, b){ return 'tussen ' + a + ' en ' + b + ' uur'; },
      vY:function(v){ return 'Hoeveel liter zit er na ' + v + ' uur in de ton?'; }, vX:function(w){ return 'Na hoeveel uur zit er ' + w + ' liter in de ton?'; } } ];
  /* zeven punten om de twee hokjes, tussen 0 en 10 hokjes hoog */
  function wandel(R){ var ys = [R.heel(1, 8)]; for (var i = 1; i < 7; i++){ var v; do { v = ys[i - 1] + R.kies([-3, -2, -1, 0, 1, 2, 3]); } while (v < 0 || v > 10); ys.push(v); } return ys; }
  function ptsVan(ys, w){ return ys.map(function(y, i){ return [i * w, y]; }); }
  /* bij welke x (in hokjes) is de grafiek r hoog; null als een vlak stuk precies op r ligt */
  function oplossingen(ys, r, w){
    var xs = [];
    for (var i = 0; i + 1 < ys.length; i++){
      var a = ys[i], b = ys[i + 1];
      if (a === b){ if (a === r) return null; continue; }
      if ((r - a) * (r - b) <= 0){ var x = w * i + w * (r - a) / (b - a); if (!xs.some(function(z){ return Math.abs(z - x) < 1e-9; })) xs.push(x); }
    }
    return xs;
  }

  /* ================= formules bij een verhaal ================= */
  var WF = [
    { y:'K', x:'u', yw:'kosten in euro', xw:'aantal uur', as:[3, 4, 5, 6, 8, 12], bs:[10, 15, 20, 25, 30, 35] },
    { y:'L', x:'w', yw:'lengte in cm', xw:'aantal weken', as:[2, 3, 4, 5], bs:[8, 10, 12, 15, 20], voor:true },
    { y:'P', x:'k', yw:'prijs in euro', xw:'aantal kilometers', as:[2, 3, 1.5, 2.5], bs:[3, 4, 5, 6] },
    { y:'A', x:'v', yw:'aantal lucifers', xw:'aantal vierkanten', as:[3], bs:[1] },
    { y:'S', x:'t', yw:'aantal stoelen', xw:'aantal tafels', as:[2, 4], bs:[2] },
    { y:'H', x:'u', yw:'hoogte in cm', xw:'aantal uur', as:[2, 3, 4], bs:[20, 24, 30, 36], min:true, voor:true },
    { y:'G', x:'n', yw:'gewicht in gram', xw:'aantal knikkers', as:[5, 6, 8, 12], bs:[40, 50, 80, 120] } ];
  var VH = [
    { t:function(a, b){ return 'Een taxirit kost € ' + geldT(b) + ' instaptarief plus € ' + geldT(a) + ' per kilometer.'; }, y:'P', x:'k', yw:'de prijs P in euro', xw:'k kilometer', per:'per kilometer', vast:'het instaptarief',
      as:[1.8, 2, 2.2, 2.4, 2.5, 3], bs:[2.5, 3, 3.5, 4, 4.5], vr:'Hoeveel kilometer was de rit?', eh:'km' },
    { t:function(a, b){ return 'Een sportschool vraagt € ' + geldT(b) + ' inschrijfgeld. Daarna betaal je € ' + geldT(a) + ' per maand.'; }, y:'K', x:'m', yw:'de kosten K in euro', xw:'m maanden', per:'per maand', vast:'het inschrijfgeld',
      as:[18, 20, 22.5, 25, 30], bs:[15, 20, 25, 30, 40], vr:'Hoeveel maanden ben je lid?', eh:'maanden' },
    { t:function(a, b){ return 'Een fiets huren kost € ' + geldT(b) + ' reserveringskosten plus € ' + geldT(a) + ' per dag.'; }, y:'K', x:'d', yw:'de kosten K in euro', xw:'d dagen', per:'per dag', vast:'de reserveringskosten',
      as:[8, 9, 10, 12.5, 15], bs:[2.5, 5, 7.5], vr:'Hoeveel dagen huur je de fiets?', eh:'dagen' },
    { t:function(a, b){ return 'Voor een concert betaal je € ' + geldT(b) + ' servicekosten per bestelling plus € ' + geldT(a) + ' per kaartje.'; }, y:'K', x:'n', yw:'de kosten K in euro', xw:'n kaartjes', per:'per kaartje', vast:'de servicekosten',
      as:[12, 15, 17.5, 22, 35], bs:[2, 2.5, 3, 4.5], vr:'Hoeveel kaartjes koop je?', eh:'kaartjes' },
    { t:function(a, b){ return 'Bowlen kost € ' + geldT(b) + ' voor de schoenen plus € ' + geldT(a) + ' per spel.'; }, y:'K', x:'s', yw:'de kosten K in euro', xw:'s spellen', per:'per spel', vast:'het geld voor de schoenen',
      as:[4.5, 5, 6, 7.5], bs:[3, 3.5, 4], vr:'Hoeveel spellen bowl je?', eh:'spellen' } ];
  function vhForm(st, a, b){ return st.y + ' = ' + geldT(a) + st.x + ' + ' + geldT(b); }

  /* ================= lineaire tabellen ================= */
  function linTabel(R, o){
    o = o || {};
    var start = R.kies(o.starts || [0, 0, 1, 2]), stap = R.kies(o.stappen || [1, 1, 2]), a = o.a ? o.a(R) : nz(R, -4, 5), b = o.b ? o.b(R, a) : R.heel(-6, 10);
    var xs = [0, 1, 2, 3].map(function(i){ return start + i * stap; }), ys = xs.map(function(x){ return a * x + b; });
    return { start:start, stap:stap, a:a, b:b, xs:xs, ys:ys, dy:a * stap };
  }
  /* stappen naar het hellingsgetal en het startgetal bij een lineaire tabel */
  function linStappen(t, yv, xv){
    yv = yv || 'y'; xv = xv || 'x';
    var st = [
      S('Hoeveel verandert ' + yv + ' per stap in de tabel? ' + T(t.ys[1]) + ' ' + MIN + ' ' + paren(t.ys[0]) + ' =', t.dy, 'Rechts min links: ' + T(t.ys[1]) + ' ' + MIN + ' ' + paren(t.ys[0]) + ' = ' + T(t.dy) + '.' + (t.dy < 0 ? ' Het gaat omlaag, dus het is een min-getal.' : ''),
        F(t.dy, -t.dy, 'Let op het teken: gaat ' + yv + ' omhoog of omlaag?')),
      S(t.stap === 1 ? xv + ' gaat per stap 1 omhoog. Het hellingsgetal is de verandering per 1: ' + T(t.dy) + ' : 1 =' : xv + ' gaat per stap ' + t.stap + ' omhoog. Het hellingsgetal is de verandering per 1: ' + T(t.dy) + ' : ' + t.stap + ' =', t.a,
        t.stap === 1 ? 'Bij een stap van 1 is het hellingsgetal gelijk aan de verandering: ' + T(t.a) + '.' : 'Deel de verandering door ' + t.stap + ': ' + T(t.dy) + ' : ' + t.stap + ' = ' + T(t.a) + '.',
        F(t.a, t.dy, 'Dat is de verandering per stap van ' + t.stap + '. Deel nog door ' + t.stap + '.')),
      t.start === 0 ? S('Het startgetal is ' + yv + ' bij ' + xv + ' = 0. Startgetal =', t.b, 'Kijk in de tabel onder ' + xv + ' = 0: daar staat ' + T(t.b) + '.', F(t.b, t.a, 'Dat is het hellingsgetal. Het startgetal staat bij ' + xv + ' = 0.'))
        : S(xv + ' = 0 staat niet in de tabel. Reken terug van ' + xv + ' = ' + t.start + ' naar ' + xv + ' = 0: ' + T(t.ys[0]) + ' ' + MIN + ' ' + t.start + ' ' + KEER + ' ' + paren(t.a) + ' =', t.b,
          'Van ' + xv + ' = ' + t.start + ' naar 0 is ' + t.start + ' keer 1 terug. Dan gaat ' + yv + ' ' + t.start + ' ' + KEER + ' ' + paren(t.a) + ' = ' + T(t.start * t.a) + ' terug: ' + T(t.ys[0]) + ' ' + MIN + ' ' + paren(t.start * t.a) + ' = ' + T(t.b) + '.',
          F(t.b, t.ys[0] + t.start * t.a, 'Je ging de verkeerde kant op. Terug naar ' + xv + ' = 0 betekent het hellingsgetal eraf halen.', t.ys[0], 'Dat is ' + yv + ' bij ' + xv + ' = ' + t.start + ', niet bij ' + xv + ' = 0.')) ];
    return st;
  }
  function linTab(t, n, yk, xk, o){
    o = o || {};
    var pijl = n >= 1 ? t.xs.slice(1).map(function(x, i){ return { van:i + 1, naar:i + 2, tekst:teken(t.dy), onder:true }; }) : [];
    return tabel([[xk || 'x'].concat(t.xs.map(T)), [yk || 'y'].concat(t.ys.map(T))], { pijlen:pijl, nadruk:n >= 3 && t.start === 0 ? [[1, 1]] : [] });
  }

  /* ================= kwadratische tabellen ================= */
  function kwSub(a, b, c, x){
    var s = (a === 1 ? '' : a === -1 ? MIN : T(a) + ' ' + KEER + ' ') + paren(x) + '²';
    if (b) s += (b < 0 ? ' ' + MIN + ' ' : ' + ') + (Math.abs(b) === 1 ? '' : T(Math.abs(b)) + ' ' + KEER + ' ') + paren(x);
    if (c) s += c < 0 ? ' ' + MIN + ' ' + T(-c) : ' + ' + T(c);
    return s;
  }
  function verschil(l){ var d = []; for (var i = 0; i + 1 < l.length; i++) d.push(l[i + 1] - l[i]); return d; }
  function allesGelijk(l){ return l.every(function(x){ return x === l[0]; }); }

  /* ================= vaste plaatjes voor de uitleg ================= */
  var UIT_AS = assen({ xmin:0, xmax:7, ymin:0, ymax:5, max:420, punten:[{ x:4, y:2, k:1, label:'A (4, 2)' }],
    teken:function(X, Y){ return ln(X(4), Y(2), X(4), Y(0), streep()) + ln(X(4), Y(2), X(0), Y(2), streep()); } });
  var UIT_NEG = assen({ xmin:-5, xmax:5, ymin:-4, ymax:4, max:460, punten:[{ x:-3, y:2, k:1, label:'B (−3, 2)' }, { x:2, y:-3, k:3, label:'C (2, −3)' }] });

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= het assenstelsel ================= */
    { groep:{ id:'wob-v-as', niveau:'onderbouw', domein:'verbanden', naam:'Het assenstelsel',
        uit:'Een punt in een assenstelsel heeft twee coördinaten: eerst x, dan y. Je leest ze af, ook als ze negatief zijn, en je zoekt bij twee coördinaten het goede punt.' },
      doelen:[
        { id:'wob-v-as-lees', naam:'Coördinaten aflezen', kort:'Eerst x: recht naar beneden naar de x-as. Dan y: recht naar links naar de y-as. Schrijf (x, y)',
          uit:'<p>Een <b>assenstelsel</b> heeft twee assen. De <b>x-as</b> loopt van links naar rechts, de <b>y-as</b> van beneden naar boven. Ze snijden elkaar in de <b>oorsprong</b> (0, 0).</p><p>Bij een punt lees je eerst de <b>x</b> af: ga recht naar beneden naar de x-as. Dan de <b>y</b>: ga recht naar links naar de y-as.</p><p>Je schrijft de <b>coördinaten</b> als (x, y). Punt A hieronder is (4, 2): 4 naar rechts en 2 omhoog. Eerst x, dan y, net als in het alfabet.</p>',
          wanneer:'je wilt opschrijven waar een punt precies ligt.', beeld:UIT_AS,
          maak:function(R){
            var x = R.heel(1, 8), y = R.heel(1, 8), L = R.kies(LETTERS);
            function pl(n){ return assen({ xmin:0, xmax:9, ymin:0, ymax:9, punten:[{ x:x, y:y, k:0, label:L }], teken:function(X, Y){ return (n >= 1 ? ln(X(x), Y(y), X(x), Y(0), streep()) : '') + (n >= 2 ? ln(X(x), Y(y), X(0), Y(y), streep()) : ''); } }); }
            return { vraag:'Wat zijn de coördinaten van ' + L + '?', context:'Lees de coördinaten van punt ' + L + ' af in het assenstelsel. Schrijf ze als (x, y), bijvoorbeeld (3, 5).', antwoord:punt(x, y), controle:puntC(x, y), invoer:'tekst',
              beeld:pl, zelfBeeld:pl(0), stappen:[
                S('Ga vanaf ' + L + ' recht naar beneden, naar de x-as. De x-coördinaat is', x, 'Kijk welk getal op de x-as (de liggende as) recht onder ' + L + ' staat.', F(x, y, 'Dat is de y. De x lees je af op de liggende as.')),
                S('Ga vanaf ' + L + ' recht naar links, naar de y-as. De y-coördinaat is', y, 'Kijk welk getal op de y-as (de staande as) recht links van ' + L + ' staat.', F(y, x, 'Dat is de x. De y lees je af op de staande as.')),
                SC('De coördinaten van ' + L + ' zijn (x, y) =', punt(x, y), puntC(x, y), 'Eerst x, dan y: ' + punt(x, y) + '.', F(punt(x, y), punt(y, x), 'Je draaide ze om. Eerst x, dan y.')) ] };
          } },
        { id:'wob-v-as-neg', naam:'Coördinaten met negatieve getallen', kort:'Links van de y-as is x negatief, onder de x-as is y negatief',
          uit:'<p>De assen lopen ook door onder 0. Links van de y-as is <b>x negatief</b>. Onder de x-as is <b>y negatief</b>.</p><p>Je leest af zoals altijd: eerst x, dan y. Punt B hieronder ligt 3 naar links en 2 omhoog: <b>(−3, 2)</b>. Punt C ligt 2 naar rechts en 3 omlaag: <b>(2, −3)</b>.</p><p>Let goed op het minteken: (−3, 2) en (3, 2) liggen aan verschillende kanten van de y-as.</p>',
          wanneer:'een punt links van de y-as of onder de x-as ligt.', beeld:UIT_NEG,
          maak:function(R){
            var x, y; do { x = nz(R, -6, 6); y = nz(R, -6, 6); } while (x > 0 && y > 0);
            var L = R.kies(LETTERS);
            function pl(n){ return assen({ xmin:-7, xmax:7, ymin:-7, ymax:7, punten:[{ x:x, y:y, k:0, label:L, links:x < 0 }], teken:function(X, Y){ return (n >= 1 ? ln(X(x), Y(y), X(x), Y(0), streep()) : '') + (n >= 2 ? ln(X(x), Y(y), X(0), Y(y), streep()) : ''); } }); }
            return { vraag:'Wat zijn de coördinaten van ' + L + '?', context:'Lees de coördinaten van punt ' + L + ' af. Let op de mintekens. Schrijf ze als (x, y), bijvoorbeeld (' + MIN + '2, 4).', antwoord:punt(x, y), controle:puntC(x, y), invoer:'tekst',
              beeld:pl, zelfBeeld:pl(0), stappen:[
                S('Ga vanaf ' + L + ' recht naar de x-as. Ligt ' + L + ' links van de y-as, dan is x negatief. x =', x,
                  L + ' ligt ' + (x < 0 ? 'links' : 'rechts') + ' van de y-as, ' + Math.abs(x) + ' hokje' + (Math.abs(x) > 1 ? 's' : '') + ' ver: x = ' + T(x) + '.',
                  F(x, -x, x < 0 ? 'Links van de y-as is x negatief: zet er een min voor.' : 'Rechts van de y-as is x positief.', y, 'Dat is de y. Eerst x, op de liggende as.')),
                S('Ga vanaf ' + L + ' recht naar de y-as. Ligt ' + L + ' onder de x-as, dan is y negatief. y =', y,
                  L + ' ligt ' + (y < 0 ? 'onder' : 'boven') + ' de x-as, ' + Math.abs(y) + ' hokje' + (Math.abs(y) > 1 ? 's' : '') + ' ver: y = ' + T(y) + '.',
                  F(y, -y, y < 0 ? 'Onder de x-as is y negatief: zet er een min voor.' : 'Boven de x-as is y positief.', x, 'Dat is de x. De y lees je af op de staande as.')),
                SC('De coördinaten van ' + L + ' zijn (x, y) =', punt(x, y), puntC(x, y), 'Eerst x, dan y: ' + punt(x, y) + '.', F(punt(x, y), punt(y, x), 'Je draaide ze om. Eerst x, dan y.', punt(-x, y), 'Kijk nog eens naar het teken van x.', punt(x, -y), 'Kijk nog eens naar het teken van y.')) ] };
          } },
        { id:'wob-v-as-zet', naam:'Een punt plaatsen', kort:'Begin in (0, 0): ga eerst x naar rechts of links, dan y omhoog of omlaag',
          uit:'<p>Een punt <b>plaatsen</b> doe je vanuit de <b>oorsprong</b> (0, 0).</p><p>Eerst de <b>x</b>: is x positief, ga dan naar rechts. Is x negatief, ga dan naar links. Daarna de <b>y</b>: positief is omhoog, negatief is omlaag.</p><p>Bij (3, −2) ga je 3 naar rechts en 2 omlaag. Daar zet je een stip. Pas op: (−2, 3) is een heel ander punt.</p>',
          wanneer:'je een punt moet tekenen of het goede punt moet zoeken bij twee coördinaten.',
          maak:function(R){
            var x, y; do { x = nz(R, -6, 6); y = nz(R, -6, 6); } while (Math.abs(x) === Math.abs(y));
            var kand = R.hussel([[x, y, 1], [y, x, 0], [-x, y, 0], [x, -y, 0]]), lt = ['A', 'B', 'C', 'D'], goed = 0;
            kand.forEach(function(k, i){ if (k[2]) goed = i; });
            var gl = lt[goed];
            function pl(n){ return assen({ xmin:-7, xmax:7, ymin:-7, ymax:7, punten:kand.map(function(k, i){ return { x:k[0], y:k[1], k:i === goed && n >= 3 ? 1 : 0, label:lt[i], links:k[0] < 0, ring:i === goed && n >= 3 }; }),
              teken:function(X, Y){ return (n >= 1 ? ln(X(0), Y(0), X(x), Y(0), { k:KL[1], w:3, dash:'6 4' }) : '') + (n >= 2 ? ln(X(x), Y(0), X(x), Y(y), { k:KL[1], w:3, dash:'6 4' }) : ''); } }); }
            var rl = x > 0 ? 'naar rechts' : 'naar links', ob = y > 0 ? 'omhoog' : 'omlaag';
            return { vraag:'Welk punt ligt op ' + punt(x, y) + '?', context:'Zoek in het assenstelsel het punt met deze coördinaten.', opties:lt, goed:goed, beeld:pl, zelfBeeld:pl(0), stappen:[
              K(R, 'x = ' + T(x) + '. Ga je vanaf (0, 0) naar rechts of naar links?', rl, [], x > 0 ? 'x is positief: naar rechts.' : 'x is negatief: naar links.', { orde:['naar rechts', 'naar links'] }),
              K(R, 'y = ' + T(y) + '. Ga je daarna omhoog of omlaag?', ob, [], y > 0 ? 'y is positief: omhoog.' : 'y is negatief: omlaag.', { orde:['omhoog', 'omlaag'] }),
              K(R, 'Je gaat ' + Math.abs(x) + ' ' + rl + ' en ' + Math.abs(y) + ' ' + ob + '. Welk punt ligt daar?', gl, [], 'Volg de stippellijn: ' + Math.abs(x) + ' ' + rl + ', dan ' + Math.abs(y) + ' ' + ob + '. Daar ligt punt ' + gl + '.', { orde:lt }) ] };
          } }
      ] },

    /* ================= grafieken lezen ================= */
    { groep:{ id:'wob-v-gl', niveau:'onderbouw', domein:'verbanden', naam:'Grafieken lezen',
        uit:'Een grafiek bij een verhaal: je leest een waarde af bij een tijd, je zoekt de tijd bij een waarde, je ziet waar de grafiek stijgt, daalt of gelijk blijft, en waar hij het snelst stijgt.' },
      doelen:[
        { id:'wob-v-gl-y', naam:'De waarde bij een x aflezen', kort:'Zoek x op de liggende as, ga recht omhoog naar de grafiek en dan recht naar links',
          uit:'<p>Bij een grafiek staat op de liggende as vaak de <b>tijd</b> en op de staande as wat je meet, zoals de temperatuur.</p><p>Wil je weten hoe warm het om 8 uur is? Zoek <b>8</b> op de liggende as. Ga <b>recht omhoog</b> tot je de grafiek raakt. Ga dan <b>recht naar links</b> naar de staande as en lees af.</p><p>Let op de <b>schaal</b>: één hokje is niet altijd 1. Kijk eerst hoeveel één hokje is, en tel dan de hokjes.</p>',
          wanneer:'je bij een tijdstip wilt weten hoeveel het was.',
          maak:function(R){
            var c = R.kies(GC), ys = wandel(R), i = R.heel(1, 6), cx = 2 * i, r = ys[i], xv = cx * c.dx, yv = r * c.dy;
            function pl(n){ return grafiek(c, ptsVan(ys, 2), { lees:n >= 2 ? [{ c:cx, r:r, v:true, h:n >= 3 }] : [] }); }
            return { vraag:c.vY(xv), context:c.intro + ' Lees af in de grafiek.', antwoord:T(yv), eenheid:c.ye, beeld:pl, zelfBeeld:pl(0), stappen:[
              S('Hoeveel ' + c.yh + ' is één hokje op de staande as?', c.dy, 'Kijk naar de getallen langs de staande as: ' + T(c.dy) + ', ' + T(2 * c.dy) + ', ' + T(3 * c.dy) + '. Ze gaan steeds ' + T(c.dy) + ' omhoog.', c.dy !== 1 ? F(c.dy, 1, 'Eén hokje is hier niet 1. Kijk naar de getallen langs de as.') : null),
              S('Zoek ' + T(xv) + ' op de liggende as en ga recht omhoog naar de grafiek. Hoeveel hokjes boven de liggende as ligt de grafiek daar?', r, 'Tel de hokjes vanaf de liggende as tot de stip op de grafiek.'),
              S(r + ' hokje' + (r === 1 ? '' : 's') + ' van ' + T(c.dy) + ': ' + r + ' ' + KEER + ' ' + T(c.dy) + ' =', yv, 'Elk hokje is ' + T(c.dy) + ' ' + c.yh + '. Je kunt het ook direct aflezen op de staande as.', F(yv, r, 'Dat is het aantal hokjes. Doe nog keer ' + T(c.dy) + '.')) ] };
          } },
        { id:'wob-v-gl-x', naam:'De x bij een waarde aflezen', kort:'Zoek de waarde op de staande as, ga recht naar rechts naar de grafiek en dan recht naar beneden',
          uit:'<p>Soms weet je de waarde en zoek je de <b>tijd</b>. Wanneer is het 12 °C?</p><p>Zoek <b>12</b> op de staande as. Ga <b>recht naar rechts</b> tot je de grafiek raakt. Ga dan <b>recht naar beneden</b> naar de liggende as en lees de tijd af.</p><p>Let weer op de schaal: kijk hoeveel één hokje op de liggende as is.</p>',
          wanneer:'je wilt weten wanneer iets een bepaalde waarde had.',
          maak:function(R){
            var c = R.kies(GC), ys, kand;
            do { ys = wandel(R); kand = []; for (var k = 1; k < 7; k++){ var o = oplossingen(ys, ys[k], 2); if (o && o.length === 1) kand.push(k); } } while (!kand.length);
            var i = R.kies(kand), cx = 2 * i, r = ys[i], xv = cx * c.dx, yv = r * c.dy;
            function pl(n){ return grafiek(c, ptsVan(ys, 2), { lees:n >= 2 ? [{ c:cx, r:r, h:true, v:n >= 3 }] : [] }); }
            return { vraag:c.vX(T(yv)), context:c.intro + ' Lees af in de grafiek.', antwoord:T(xv), eenheid:c.xe, beeld:pl, zelfBeeld:pl(0), stappen:[
              S('Hoeveel ' + c.xh + ' is één hokje op de liggende as?', c.dx, 'Kijk naar de getallen langs de liggende as: 0, ' + T(c.dx) + ', ' + T(2 * c.dx) + '. Ze gaan steeds ' + T(c.dx) + ' verder.', c.dx !== 1 ? F(c.dx, 1, 'Eén hokje is hier niet 1. Kijk naar de getallen langs de as.') : null),
              S('Zoek ' + T(yv) + ' op de staande as en ga recht naar rechts tot de grafiek. Ga dan recht naar beneden. Hoeveel hokjes rechts van de staande as kom je uit?', cx, 'Tel de hokjes van de staande as tot de stip.'),
              S(cx + ' hokjes van ' + T(c.dx) + ': ' + cx + ' ' + KEER + ' ' + T(c.dx) + ' =', xv, 'Elk hokje is ' + T(c.dx) + ' ' + c.xh + '. Je kunt het ook direct aflezen op de liggende as.', F(xv, cx, 'Dat is het aantal hokjes. Doe nog keer ' + T(c.dx) + '.')) ] };
          } },
        { id:'wob-v-gl-stijg', naam:'Stijgen, dalen of constant', kort:'Van links naar rechts: omhoog is stijgen, omlaag is dalen, vlak is constant',
          uit:'<p>Een grafiek lees je van <b>links naar rechts</b>, net als een zin.</p><p>Gaat de grafiek omhoog, dan <b>stijgt</b> hij: de waarde wordt groter. Gaat hij omlaag, dan <b>daalt</b> hij. Loopt hij vlak, dan is hij <b>constant</b>: de waarde blijft gelijk.</p><p>Twijfel je? Lees de waarde af aan het begin en aan het eind van het stuk en vergelijk ze.</p>',
          wanneer:'je wilt zien of iets toeneemt, afneemt of gelijk blijft.',
          maak:function(R){
            var c = R.kies(GC), OPT = ['stijgt', 'daalt', 'is constant'], soort = R.kies(OPT), ys, l;
            do { ys = wandel(R); l = []; for (var k = 0; k < 6; k++){ var d = ys[k + 1] - ys[k]; if ((soort === 'stijgt' && d > 0) || (soort === 'daalt' && d < 0) || (soort === 'is constant' && d === 0)) l.push(k); } } while (!l.length);
            var i = R.kies(l), xa = 2 * i * c.dx, xb = (2 * i + 2) * c.dx, ya = ys[i] * c.dy, yb = ys[i + 1] * c.dy;
            function pl(n){ return grafiek(c, ptsVan(ys, 2), { vak:[2 * i, 2 * i + 2], lees:(n >= 1 ? [{ c:2 * i, r:ys[i], h:true }] : []).concat(n >= 2 ? [{ c:2 * i + 2, r:ys[i + 1], h:true }] : []) }); }
            return { vraag:'Wat doet ' + c.wie + ' ' + c.tussen(xa, xb) + '?', context:c.intro + ' Kijk naar het gekleurde stuk van de grafiek.', opties:OPT, goed:OPT.indexOf(soort), beeld:pl, zelfBeeld:pl(0), stappen:[
              S('Lees af: ' + c.wie + ' ' + c.bij(xa) + ' (in ' + c.yh + ') =', ya, 'Ga bij ' + T(xa) + ' recht omhoog naar de grafiek en dan naar links.'),
              S('Lees af: ' + c.wie + ' ' + c.bij(xb) + ' (in ' + c.yh + ') =', yb, 'Ga bij ' + T(xb) + ' recht omhoog naar de grafiek en dan naar links.'),
              K(R, 'Van ' + T(ya) + ' naar ' + T(yb) + ' ' + c.ye + '. Wat doet de grafiek ' + c.tussen(xa, xb) + '?', soort, [], ya < yb ? 'Het wordt meer: de grafiek gaat omhoog.' : ya > yb ? 'Het wordt minder: de grafiek gaat omlaag.' : 'Het blijft ' + T(ya) + ': de grafiek loopt vlak.', { orde:OPT }) ] };
          } },
        { id:'wob-v-gl-snelst', naam:'Waar stijgt de grafiek het snelst?', kort:'Bij even lange stukken: waar komt er het meest bij? Daar is de grafiek het steilst',
          uit:'<p>Hoe <b>steiler</b> de grafiek, hoe <b>sneller</b> hij stijgt.</p><p>Zijn de stukken even lang, reken dan per stuk uit hoeveel er <b>bij</b> komt: de waarde aan het eind min de waarde aan het begin. Waar er het meest bijkomt, stijgt de grafiek het snelst.</p><p>Een vlak stuk stijgt helemaal niet: daar komt 0 bij.</p>',
          wanneer:'je wilt weten wanneer iets het hardst groeide.',
          maak:function(R){
            var c = R.kies(GC), d;
            do { d = R.hussel([0, 1, 2, 3, 4, 5]).slice(0, 3); } while (d.filter(function(x){ return x > 0; }).length < 2 || d[0] + d[1] + d[2] > 10);
            var r0 = R.heel(0, 10 - d[0] - d[1] - d[2]), ys = [r0, r0 + d[0], r0 + d[0] + d[1], r0 + d[0] + d[1] + d[2]];
            var best = d.indexOf(Math.max.apply(null, d)), opts = [0, 1, 2].map(function(k){ return c.tussen(4 * k * c.dx, 4 * (k + 1) * c.dx); });
            function pl(n){ var v = n >= 3 ? best : Math.min(n, 2); return grafiek(c, ptsVan(ys, 4), { vak:[4 * v, 4 * v + 4], lees:n >= 3 ? [] : [{ c:4 * v, r:ys[v], h:true }, { c:4 * v + 4, r:ys[v + 1], h:true }] }); }
            var st = [0, 1, 2].map(function(k){
              var a = ys[k] * c.dy, b = ys[k + 1] * c.dy;
              return S('Hoeveel stijgt ' + c.wie + ' ' + opts[k] + '? (in ' + c.yh + ')', b - a, 'Van ' + T(a) + ' naar ' + T(b) + ': ' + T(b) + ' ' + MIN + ' ' + T(a) + ' = ' + T(b - a) + '.', F(b - a, b, 'Dat is de waarde aan het eind. Trek de waarde aan het begin eraf.'));
            });
            st.push(K(R, 'Alle stukken zijn even lang. Waar stijgt de grafiek het snelst?', opts[best], [], 'Waar komt er het meest bij? Daar komt ' + T(d[best] * c.dy) + ' ' + c.ye + ' bij. Daar is de grafiek het steilst.', { orde:opts }));
            return { vraag:'grafiek ' + c.xt + ' ' + ys.join(' '), vraagHtml:'Waar stijgt ' + Sch(c.wie) + ' het snelst?', context:c.intro, opties:opts, goed:best, beeld:pl, zelfBeeld:grafiek(c, ptsVan(ys, 4)), stappen:st };
          } }
      ] },

    /* ================= formules ================= */
    { groep:{ id:'wob-v-fo', niveau:'onderbouw', domein:'verbanden', naam:'Formules',
        uit:'Van een woordformule een letterformule maken, getallen invullen in een formule, zelf een formule opstellen bij een verhaal, en terugrekenen als je de uitkomst al weet.' },
      doelen:[
        { id:'wob-v-fo-woord', naam:'Van woordformule naar letterformule', kort:'Kies een letter voor elk woord en laat het keerteken tussen getal en letter weg',
          uit:'<p>Een <b>woordformule</b> zegt in woorden hoe je iets uitrekent: kosten in euro = 4 × aantal uur + 15.</p><p>In een <b>letterformule</b> gebruik je een letter voor elk woord, bijvoorbeeld K voor de kosten en u voor het aantal uur. Het <b>keerteken</b> tussen een getal en een letter laat je weg: 4 × u schrijf je als <b>4u</b>.</p><p>Zo wordt het: <b>K = 4u + 15</b>. Korter, maar het betekent precies hetzelfde.</p>',
          wanneer:'je een formule korter en overzichtelijker wilt opschrijven.',
          maak:function(R){
            var w = R.kies(WF), a = R.kies(w.as), b = R.kies(w.bs), ca = w.min ? -a : a;
            var woord = w.voor ? w.yw + ' = ' + T(b) + (w.min ? ' ' + MIN + ' ' : ' + ') + T(a) + ' ' + KEER + ' ' + w.xw : w.yw + ' = ' + T(a) + ' ' + KEER + ' ' + w.xw + ' + ' + T(b);
            var lf = w.voor ? w.y + ' = ' + T(b) + (w.min ? ' ' + MIN + ' ' : ' + ') + T(a) + w.x : w.y + ' = ' + T(a) + w.x + ' + ' + T(b), chk = formL(w.y, linQ(w.x, ca, b));
            return { vraag:woord, context:'Schrijf de woordformule als letterformule. Gebruik ' + w.y + ' voor ' + w.yw + ' en ' + w.x + ' voor ' + w.xw + '.', antwoord:lf, controle:chk, invoer:'tekst', stappen:[
              S('Welk getal staat keer ' + w.xw + '?', a, 'Zoek het getal met ' + KEER + ' ervoor of erachter: ' + T(a) + ' ' + KEER + ' ' + w.xw + '.', F(a, b, 'Dat getal staat los. Zoek het getal met ' + KEER + ' erbij.')),
              S('Welk getal staat los, zonder ' + w.xw + '?', b, 'Het getal dat ' + (w.min ? 'voorop staat: ' : 'erbij komt: ') + T(b) + '.', F(b, a, 'Dat getal staat keer ' + w.xw + '. Zoek het losse getal.')),
              SC(T(a) + ' ' + KEER + ' ' + w.x + ' schrijf je korter als', T(a) + w.x, exprC(T(a) + w.x), 'Tussen een getal en een letter laat je het keerteken weg: ' + T(a) + w.x + '.'),
              SC('De letterformule: ' + w.y + ' =', lf, chk, 'Vervang ' + w.yw + ' door ' + w.y + ' en ' + w.xw + ' door ' + w.x + ': ' + lf + '.') ] };
          } },
        { id:'wob-v-fo-invul', naam:'Invullen in een formule', kort:'Vervang de letter door het getal en reken uit: eerst haakjes, dan kwadraat, dan keer, dan plus en min',
          uit:'<p>Bij <b>invullen</b> vervang je de letter door een getal. Bij K = 4u + 15 en u = 7 wordt het K = 4 × 7 + 15.</p><p>Let op: 4u betekent <b>4 keer u</b>, niet 47. Zet het keerteken er bij het invullen weer tussen.</p><p>Reken uit met de <b>voorrangsregels</b>: eerst haakjes, dan het kwadraat, dan keer en delen, dan plus en min. Dus 4 × 7 = 28 en 28 + 15 = <b>43</b>.</p>',
          wanneer:'je bij een formule de uitkomst zoekt voor een bepaald getal.',
          maak:function(R){
            var P = R.kies([['K', 'u'], ['P', 'n'], ['A', 't'], ['H', 'w'], ['y', 'x'], ['L', 'k']]), Yv = P[0], Xv = P[1], soort = R.kies(['plus', 'plus', 'min', 'haak', 'kwad']), a, b, x, form, st, res;
            if (soort === 'plus'){
              a = R.kies([2, 3, 4, 5, 6, 8, 9, 1.5, 2.5]); x = a % 1 ? 2 * R.heel(1, 6) : R.heel(2, 12); b = R.heel(3, 30); res = a * x + b;
              form = Yv + ' = ' + T(a) + Xv + ' + ' + b;
              st = [S('Vul ' + Xv + ' = ' + x + ' in: ' + Yv + ' = ' + T(a) + ' ' + KEER + ' ' + x + ' + ' + b + '. Eerst keer: ' + T(a) + ' ' + KEER + ' ' + x + ' =', a * x, 'Keer gaat voor plus.', a % 1 ? null : F(a * x, +(String(a) + String(x)), T(a) + Xv + ' betekent ' + T(a) + ' ' + KEER + ' ' + Xv + '. Je schreef de getallen achter elkaar.', a + x, 'Het is keer, niet plus.')),
                S('Dan plus: ' + T(a * x) + ' + ' + b + ' =', res, 'Tel ' + b + ' erbij.')];
            } else if (soort === 'min'){
              a = R.heel(2, 6); x = R.heel(2, 8); b = a * x + R.heel(2, 30); res = b - a * x;
              form = Yv + ' = ' + b + ' ' + MIN + ' ' + a + Xv;
              st = [S('Vul ' + Xv + ' = ' + x + ' in: ' + Yv + ' = ' + b + ' ' + MIN + ' ' + a + ' ' + KEER + ' ' + x + '. Eerst keer: ' + a + ' ' + KEER + ' ' + x + ' =', a * x, 'Keer gaat voor min.', F(a * x, +(String(a) + String(x)), a + Xv + ' betekent ' + a + ' ' + KEER + ' ' + Xv + '.')),
                S('Dan min: ' + b + ' ' + MIN + ' ' + (a * x) + ' =', res, 'Haal ' + (a * x) + ' van ' + b + ' af.', F(res, (b - a) * x, 'Eerst keer, dan pas min.'))];
            } else if (soort === 'haak'){
              a = R.heel(2, 6); x = R.heel(1, 9); b = R.heel(1, 9); res = a * (x + b);
              form = Yv + ' = ' + a + '(' + Xv + ' + ' + b + ')';
              st = [S('Vul ' + Xv + ' = ' + x + ' in: ' + Yv + ' = ' + a + ' ' + KEER + ' (' + x + ' + ' + b + '). Eerst de haakjes: ' + x + ' + ' + b + ' =', x + b, 'Wat tussen haakjes staat, reken je eerst uit.'),
                S('Dan keer: ' + a + ' ' + KEER + ' ' + (x + b) + ' =', res, 'Doe ' + a + ' keer de uitkomst van de haakjes.', F(res, a * x + b, 'Eerst de haakjes, dan pas keer.'))];
            } else {
              a = R.kies([1, 2, 3, 5]); x = R.heel(2, 9); b = R.heel(1, 20); res = a * x * x + b;
              form = Yv + ' = ' + (a === 1 ? '' : a) + Xv + '² + ' + b;
              st = [S('Vul ' + Xv + ' = ' + x + ' in: ' + Yv + ' = ' + (a === 1 ? '' : a + ' ' + KEER + ' ') + x + '² + ' + b + '. Eerst het kwadraat: ' + x + '² =', x * x, x + '² = ' + x + ' ' + KEER + ' ' + x + '.', F(x * x, 2 * x, 'Kwadraat is keer zichzelf, niet keer 2: ' + x + ' ' + KEER + ' ' + x + '.'))];
              if (a !== 1) st.push(S('Dan keer: ' + a + ' ' + KEER + ' ' + (x * x) + ' =', a * x * x, 'Doe ' + a + ' keer ' + (x * x) + '.', F(a * x * x, a * x * a * x, 'Alleen ' + Xv + ' gaat in het kwadraat, niet ' + a + Xv + '.')));
              st.push(S('Dan plus: ' + (a * x * x) + ' + ' + b + ' =', res, 'Tel ' + b + ' erbij.'));
            }
            return { vraag:form + ', ' + Xv + ' = ' + T(x), vraagHtml:Sch(form) + '<br>' + Xv + ' = ' + T(x), context:'Bereken ' + Yv + ' met de formule.', antwoord:T(res), stappen:st };
          } },
        { id:'wob-v-fo-verhaal', naam:'Een formule bij een verhaal', kort:'Het bedrag per stuk komt bij de letter, het vaste bedrag komt erbij: K = bedrag per stuk × n + vast bedrag',
          uit:'<p>Een taxirit kost € 3,50 instaptarief plus € 2,20 per kilometer. Wat kost een rit van k kilometer?</p><p>Het <b>vaste bedrag</b> betaal je altijd: € 3,50. Het bedrag <b>per stuk</b> betaal je voor elke kilometer: 2,20 keer k.</p><p>De formule: <b>P = 2,20k + 3,50</b>. Het bedrag per stuk staat voor de letter, het vaste bedrag komt erbij.</p>',
          wanneer:'een prijs bestaat uit een vast bedrag plus een bedrag per stuk, per uur of per kilometer.',
          maak:function(R){
            var st = R.kies(VH), a = R.kies(st.as), b = R.kies(st.bs), form = vhForm(st, a, b), chk = formL(st.y, linQ(st.x, a, b));
            return { vraag:'Formule voor ' + st.y + '?', context:st.t(a, b) + ' Schrijf een formule voor ' + st.yw + ' bij ' + st.xw + '.', antwoord:form, controle:chk, invoer:'tekst', stappen:[
              S('Wat is ' + st.vast + '? Dat betaal je altijd.', [geldT(b), b], 'Het bedrag dat je één keer betaalt: € ' + geldT(b) + '.', F(b, a, 'Dat betaal je ' + st.per + '. Het vaste bedrag betaal je maar één keer.')),
              S('Hoeveel betaal je ' + st.per + '?', [geldT(a), a], 'Dat bedrag komt keer ' + st.x + ': € ' + geldT(a) + '.', F(a, b, 'Dat is het vaste bedrag. Zoek wat je ' + st.per + ' betaalt.')),
              SC('De formule: ' + st.y + ' =', form, chk, 'Bedrag ' + st.per + ' keer ' + st.x + ', plus het vaste bedrag: ' + form + '.', F(form, vhForm(st, b, a), 'Je draaide de bedragen om. Het bedrag ' + st.per + ' komt bij de ' + st.x + '.')) ] };
          } },
        { id:'wob-v-fo-terug', naam:'Terugrekenen in een formule', kort:'Weet je de uitkomst, reken dan terug: doe de stappen omgekeerd en in omgekeerde volgorde',
          uit:'<p>Bij K = 4u + 15 doe je met u eerst <b>keer 4</b> en dan <b>plus 15</b>. Weet je dat K = 47, dan reken je <b>terug</b>.</p><p>Doe de laatste stap eerst ongedaan: het omgekeerde van plus 15 is <b>min 15</b>: 47 − 15 = 32. Dan het omgekeerde van keer 4: <b>gedeeld door 4</b>: 32 : 4 = <b>8</b>.</p><p>Een <b>pijlenketting</b> helpt: heen gaat u → × 4 → + 15 → K. Terug gaat K → − 15 → : 4 → u.</p>',
          wanneer:'je de uitkomst van een formule weet en zoekt wat je erin moet stoppen.',
          beeld:ketting({ x:'u', y:'K', op1:KEER + ' 4', op2:'+ 15', in2:MIN + ' 15', in1:': 4', y0:'47', mid:'32', x0:'8' }, 3),
          maak:function(R){
            var it, a, b, x0 = R.heel(3, 12), y0, isGeld = R.heel(0, 2) > 0, ctx, vr, eh, xl, yl;
            if (isGeld){
              it = R.kies(VH); a = R.kies(it.as); b = R.kies(it.bs); y0 = rnd(a * x0 + b, 2); xl = it.x; yl = it.y;
              ctx = it.t(a, b) + ' De formule is ' + vhForm(it, a, b) + '. Je betaalt € ' + geldT(y0) + '.'; vr = it.vr; eh = it.eh;
            } else {
              it = R.kies([
                { t:'Voor een rij van n vierkantjes van lucifers heb je A = 3n + 1 lucifers nodig.', a:3, b:1, vr:'Hoeveel vierkantjes leg je?', eh:'vierkantjes' },
                { t:'Voor een rij van n huisjes van lucifers heb je A = 5n + 1 lucifers nodig.', a:5, b:1, vr:'Hoeveel huisjes leg je?', eh:'huisjes' },
                { t:'Aan een rij van t tafels kunnen S = 2t + 2 mensen zitten.', a:2, b:2, vr:'Hoeveel tafels staan er?', eh:'tafels', y:'S', x:'t', heb:'mensen' },
                { t:'Een plant is L = 4w + 12 cm lang, met w het aantal weken.', a:4, b:12, vr:'Na hoeveel weken?', eh:'weken', y:'L', x:'w', heb:'cm' } ]);
              a = it.a; b = it.b; y0 = a * x0 + b; xl = it.x || 'n'; yl = it.y || 'A'; eh = it.eh; vr = it.vr;
              ctx = it.t + ' ' + (it.heb === 'cm' ? 'De plant is nu ' + y0 + ' cm lang.' : it.heb === 'mensen' ? 'Er kunnen ' + y0 + ' mensen zitten.' : 'Je gebruikt ' + y0 + ' lucifers.');
            }
            var mid = rnd(y0 - b, 2), aT = geldT(a), bT = geldT(b);
            var o = { x:xl, y:yl, op1:KEER + ' ' + aT, op2:'+ ' + bT, in2:MIN + ' ' + bT, in1:': ' + aT, y0:geldT(y0), mid:geldT(mid), x0:T(x0) };
            function pl(n){ return ketting(o, n); }
            return { vraag:vr, context:ctx + ' Reken terug.', antwoord:T(x0), eenheid:eh, beeld:pl, stappen:[
              K(R, 'Heen doe je eerst ' + KEER + ' ' + aT + ' en dan + ' + bT + '. Wat doe je bij terugrekenen eerst?', MIN + ' ' + bT, [': ' + aT], 'Terug begin je aan het eind: de laatste stap was + ' + bT + '. Het omgekeerde is ' + MIN + ' ' + bT + '.'),
              S(geldT(y0) + ' ' + MIN + ' ' + bT + ' =', [geldT(mid), mid], 'Haal ' + bT + ' eraf.'),
              S('Het omgekeerde van ' + KEER + ' ' + aT + ' is : ' + aT + '. ' + geldT(mid) + ' : ' + aT + ' =', x0, 'Deel ' + geldT(mid) + ' door ' + aT + '. Controle: ' + aT + ' ' + KEER + ' ' + x0 + ' + ' + bT + ' = ' + geldT(y0) + '.', F(x0, rnd(y0 / a, 2), 'Je deelde voordat je ' + bT + ' eraf haalde. Eerst ' + MIN + ' ' + bT + '.')) ] };
          } }
      ] },

    /* ================= lineaire verbanden ================= */
    { groep:{ id:'wob-v-lin', niveau:'onderbouw', domein:'verbanden', naam:'Lineaire verbanden',
        uit:'Een lineair verband herken je aan een gelijke toename. Je vindt het startgetal en het hellingsgetal uit een tabel, een grafiek of een formule, je maakt een formule bij een tabel en je zoekt de grafiek bij een formule.' },
      doelen:[
        { id:'wob-v-lin-is', naam:'Is de tabel lineair?', kort:'Gaat x steeds evenveel omhoog, kijk dan of y er steeds evenveel bij krijgt',
          uit:'<p>Een verband is <b>lineair</b> als de grafiek een rechte lijn is. In een tabel zie je dat aan de <b>gelijke toename</b>.</p><p>Kijk eerst of x steeds evenveel omhoog gaat. Reken dan bij y uit wat er elke stap bij komt: rechts min links. Is dat <b>steeds hetzelfde</b>, dan is het verband lineair.</p><p>2, 5, 8, 11: steeds +3, dus lineair. 1, 2, 4, 8: +1, +2, +4, dus niet lineair. Kijk naar <b>alle</b> stappen: soms gaat het pas aan het eind mis.</p>',
          wanneer:'je wilt weten of de grafiek bij een tabel een rechte lijn wordt.',
          maak:function(R){
            var start = R.kies([0, 0, 1, 2]), stap = R.kies([1, 1, 2]), xs = [0, 1, 2, 3].map(function(i){ return start + i * stap; }), soort = R.kies(['lin', 'lin', 'kw', 'bijna', 'dub']), ys;
            if (soort === 'lin' || soort === 'bijna'){ var a = nz(R, -5, 6), b = R.heel(-5, 12); ys = xs.map(function(x){ return a * x + b; }); if (soort === 'bijna'){ var j = R.kies([2, 3]); ys[j] += R.kies([-2, -1, 1, 2]); } }
            else if (soort === 'kw'){ var c = R.heel(-3, 8), sg = R.kies([1, -1]); ys = xs.map(function(x){ return sg * x * x + c; }); }
            else { var bb = R.kies([1, 2, 3, 5]); ys = [bb, 2 * bb, 4 * bb, 8 * bb]; }
            var ds = verschil(ys), lin = allesGelijk(ds), OPT = ['ja: lineair', 'nee: niet lineair'];
            function tab(n){ return tabel([['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))], { pijlen:ds.slice(0, Math.min(n, 3)).map(function(d, i){ return { van:i + 1, naar:i + 2, tekst:teken(d), onder:true }; }) }); }
            var st = ds.map(function(d, i){ return S('Van ' + T(ys[i]) + ' naar ' + T(ys[i + 1]) + ': wat komt erbij? (omlaag is een min-getal)', d, 'Rechts min links: ' + T(ys[i + 1]) + ' ' + MIN + ' ' + paren(ys[i]) + ' = ' + T(d) + '.', F(d, -d, 'Reken rechts min links. Gaat het omlaag, dan is het een min-getal.')); });
            st.push(K(R, 'x gaat steeds ' + stap + ' omhoog. Komt er bij y steeds hetzelfde bij?', lin ? OPT[0] : OPT[1], [], lin ? 'Steeds ' + teken(ds[0]) + ': gelijke toename, dus lineair.' : 'De toenames zijn ' + ds.map(teken).join(', ') + ': niet steeds hetzelfde.', { orde:OPT }));
            return { vraag:'tabel ' + xs.join(' ') + ' | ' + ys.join(' '), vraagHtml:'Is het verband in de tabel lineair?', context:'Kijk of y er steeds evenveel bij krijgt.', opties:OPT, goed:lin ? 0 : 1, beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wob-v-lin-tabel', naam:'Startgetal en hellingsgetal uit een tabel', kort:'Hellingsgetal: wat er bij y bijkomt als x 1 groter wordt. Startgetal: y bij x = 0',
          uit:'<p>Bij een lineair verband horen twee getallen. Het <b>startgetal</b> is y bij x = 0. Het <b>hellingsgetal</b> is wat er bij y bijkomt als x <b>1</b> groter wordt.</p><p>In de tabel x: 0, 1, 2, 3 en y: 5, 8, 11, 14 komt er steeds 3 bij. Het hellingsgetal is <b>3</b> en het startgetal is <b>5</b>.</p><p>Gaat x per stap met 2 omhoog, deel de toename dan door 2. Staat x = 0 niet in de tabel, reken dan terug: haal het hellingsgetal eraf tot je bij x = 0 bent.</p>',
          wanneer:'je bij een lineaire tabel de formule wilt maken of de grafiek wilt tekenen.',
          maak:function(R){
            var t = linTabel(R), ant = tweeT(t.b, t.a);
            function tab(n){ return linTab(t, n); }
            var st = linStappen(t);
            st.push(SC('Typ het startgetal en het hellingsgetal, met een puntkomma ertussen:', ant, tweeC(t.b, t.a), 'Eerst het startgetal (' + T(t.b) + '), dan het hellingsgetal (' + T(t.a) + '): ' + ant + '.', F(ant, tweeT(t.a, t.b), 'Je draaide ze om. Eerst het startgetal.')));
            return { vraag:'tabel ' + t.xs.join(' ') + ' | ' + t.ys.join(' '), vraagHtml:'Startgetal en hellingsgetal?', context:'Het verband in de tabel is lineair. Typ eerst het startgetal en dan het hellingsgetal, met een puntkomma ertussen, zoals 5; 3.', antwoord:ant, controle:tweeC(t.b, t.a), invoer:'tekst',
              beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wob-v-lin-graf', naam:'Startgetal en hellingsgetal uit een grafiek', kort:'Startgetal: waar de lijn de y-as snijdt. Hellingsgetal: hoeveel omhoog bij 1 naar rechts',
          uit:'<p>Het <b>startgetal</b> lees je af waar de lijn de <b>y-as</b> snijdt: daar is x = 0.</p><p>Het <b>hellingsgetal</b> vind je met een <b>trapje</b>: ga vanaf een roosterpunt op de lijn naar rechts en kijk hoeveel je omhoog moet om weer op de lijn te komen. Gaat de lijn omlaag, dan is het hellingsgetal negatief.</p><p>Kom je bij 1 naar rechts niet precies op een roosterpunt, neem dan 2 naar rechts en deel door 2. Bijvoorbeeld 2 naar rechts en 1 omhoog: hellingsgetal 1 : 2 = <b>0,5</b>.</p>',
          wanneer:'je bij een rechte lijn de formule zoekt.',
          maak:function(R){
            var a, b, dx, dy;
            do { a = R.kies([-3, -2, -1, 1, 2, 3, 0.5, -0.5]); b = R.heel(-4, 4); dx = a % 1 ? 2 : 1; dy = a * dx; } while (Math.abs(b + dy) > 6);
            var ant = tweeT(b, a);
            function pl(n){ return assen({ xmin:-6, xmax:6, ymin:-6, ymax:6, lijnen:[{ a:a, b:b, k:0 }], punten:n >= 1 ? [{ x:0, y:b, k:1 }].concat(n >= 2 ? [{ x:dx, y:b + dy, k:1 }] : []) : [],
              teken:function(X, Y){ return n >= 2 ? ln(X(0), Y(b), X(dx), Y(b), { k:KL[1], w:2.5, dash:'6 4' }) + ln(X(dx), Y(b), X(dx), Y(b + dy), { k:KL[1], w:2.5, dash:'6 4' }) + tx((X(0) + X(dx)) / 2, Y(b) + (dy > 0 ? 18 : -8), '+' + dx, { k:KL[1], vet:true, m:'klein' }) + tx(X(dx) + 8, (Y(b) + Y(b + dy)) / 2 + 5, teken(dy), { k:KL[1], vet:true, m:'klein', a:'start' }) : ''; } }); }
            return { vraag:'lijn ' + T(a) + ' ' + T(b), vraagHtml:'Startgetal en hellingsgetal van de lijn?', context:'Lees af uit de grafiek. Typ eerst het startgetal en dan het hellingsgetal, met een puntkomma ertussen, zoals 2; ' + MIN + '3.', antwoord:ant, controle:tweeC(b, a), invoer:'tekst',
              beeld:pl, zelfBeeld:pl(0), stappen:[
                S('Waar snijdt de lijn de y-as? Het startgetal is', b, 'Kijk op de staande as, waar x = 0: de lijn gaat door (0, ' + T(b) + ').', F(b, -b, 'Let op het teken: ligt het punt boven of onder de x-as?')),
                S('Ga vanaf (0, ' + T(b) + ') ' + dx + ' hokje' + (dx > 1 ? 's' : '') + ' naar rechts. Hoeveel hokjes moet je omhoog om weer op de lijn te komen? (omlaag is een min-getal)', dy, 'Tel de hokjes van het trapje. ' + (dy < 0 ? 'De lijn gaat omlaag, dus het is een min-getal: ' : 'De lijn gaat omhoog: ') + T(dy) + '.', F(dy, -dy, 'Let op: gaat de lijn omhoog of omlaag?')),
                S('Het hellingsgetal = ' + T(dy) + ' : ' + dx + ' =', a, dx === 1 ? 'Bij 1 naar rechts ging je ' + T(dy) + ' omhoog, dus het hellingsgetal is ' + T(a) + '.' : T(dy) + ' : 2 = ' + T(a) + '.', F(a, dy, 'Dat is bij 2 naar rechts. Deel nog door 2.')),
                SC('Typ het startgetal en het hellingsgetal, met een puntkomma ertussen:', ant, tweeC(b, a), 'Eerst het startgetal, dan het hellingsgetal: ' + ant + '.', F(ant, tweeT(a, b), 'Je draaide ze om. Eerst het startgetal.')) ] };
          } },
        { id:'wob-v-lin-form', naam:'Startgetal en hellingsgetal uit een formule', kort:'Het getal bij de x is het hellingsgetal, het getal zonder x is het startgetal',
          uit:'<p>Bij een formule als y = 3x + 5 lees je de getallen zo af. Het getal <b>bij de x</b> is het <b>hellingsgetal</b>: 3. Het getal <b>zonder x</b> is het <b>startgetal</b>: 5.</p><p>Het <b>teken</b> hoort erbij. Bij y = 7 − 2x is het hellingsgetal <b>−2</b> en het startgetal 7. De volgorde maakt niet uit.</p><p>Staat er alleen x, dan is het hellingsgetal 1 (en bij −x is het −1). Staat er geen los getal, dan is het startgetal 0.</p>',
          wanneer:'je een formule hebt en snel wilt zien waar de lijn begint en hoe steil hij is.',
          maak:function(R){
            var vorm = R.kies(['ax+b', 'b+ax', 'ax', 'b+ax', 'let']), a = R.kies([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 0.5, 1.5]), b = nz(R, -9, 9), xv = 'x', yv = 'y', f;
            if (vorm === 'ax') b = 0;
            if (vorm === 'let'){ var P = R.kies([['K', 'u'], ['L', 'w'], ['P', 'k'], ['H', 't']]); yv = P[0]; xv = P[1]; b = R.heel(5, 40); a = yv === 'H' ? -R.heel(1, 4) : R.heel(2, 9); }
            f = yv + ' = ' + (vorm === 'b+ax' || vorm === 'let' ? E([[b, ''], [a, xv]]) : E([[a, xv], [b, '']]));
            var ant = tweeT(b, a);
            return { vraag:f, context:'Wat zijn het startgetal en het hellingsgetal? Typ eerst het startgetal en dan het hellingsgetal, met een puntkomma ertussen, zoals 5; 3.', antwoord:ant, controle:tweeC(b, a), invoer:'tekst', stappen:[
              S('Het hellingsgetal is het getal bij de ' + xv + ', met het teken ervoor. Hellingsgetal =', a,
                Math.abs(a) === 1 ? 'Er staat ' + (a < 0 ? MIN : '') + xv + ': dat is ' + T(a) + ' ' + KEER + ' ' + xv + '.' : 'Er staat ' + E([[a, xv]]) + ': dat is ' + T(a) + ' ' + KEER + ' ' + xv + '.',
                F(a, -a, 'Het teken voor ' + E([[Math.abs(a), xv]]) + ' hoort erbij.', b, 'Dat is het getal zonder ' + xv + ': het startgetal.')),
              S('Het startgetal is het getal zonder ' + xv + '. Startgetal =', b, b === 0 ? 'Er staat geen los getal: het startgetal is 0.' : 'Het losse getal is ' + T(b) + '.', F(b, -b, 'Let op het teken ervoor.', a, 'Dat is het getal bij de ' + xv + ': het hellingsgetal.')),
              SC('Typ het startgetal en het hellingsgetal, met een puntkomma ertussen:', ant, tweeC(b, a), 'Eerst het startgetal, dan het hellingsgetal: ' + ant + '.', F(ant, tweeT(a, b), 'Je draaide ze om. Eerst het startgetal.')) ] };
          } },
        { id:'wob-v-lin-formtab', naam:'Een formule bij een tabel', kort:'Zoek het hellingsgetal en het startgetal in de tabel en schrijf y = hellingsgetal × x + startgetal',
          uit:'<p>Bij een lineaire tabel maak je een formule in de vorm <b>y = ax + b</b>. Daarbij is a het <b>hellingsgetal</b> en b het <b>startgetal</b>.</p><p>Week w: 0, 1, 2, 3 en lengte L: 12, 15, 18, 21. Elke week komt er 3 bij, dus a = 3. Bij w = 0 is L = 12, dus b = 12. De formule: <b>L = 3w + 12</b>.</p><p>Controleer met een getal uit de tabel: bij w = 2 is 3 × 2 + 12 = 18. Klopt.</p>',
          wanneer:'je bij een lineaire tabel een formule wilt maken.',
          maak:function(R){
            var C = R.kies([
              { y:'L', x:'w', yk:'L (cm)', xk:'w (weken)', a:function(R){ return R.heel(2, 6); }, b:function(R){ return R.heel(5, 20); } },
              { y:'K', x:'n', yk:'K (euro)', xk:'n (aantal)', a:function(R){ return R.heel(2, 9); }, b:function(R){ return R.heel(3, 25); } },
              { y:'H', x:'t', yk:'H (cm)', xk:'t (uur)', a:function(R){ return -R.heel(1, 4); }, b:function(R, a){ return -a * 8 + R.heel(2, 20); } },
              { y:'y', x:'x', yk:'y', xk:'x' } ]);
            var t = linTabel(R, { a:C.a, b:C.b }), form = C.y + ' = ' + (t.a < 0 && t.b > 0 ? E([[t.b, ''], [t.a, C.x]]) : E([[t.a, C.x], [t.b, '']])), chk = formL(C.y, linQ(C.x, t.a, t.b));
            function tab(n){ return linTab(t, n, C.yk, C.xk); }
            var st = linStappen(t, C.y, C.x);
            st.push(SC('De formule: ' + C.y + ' =', form, chk, C.y + ' = hellingsgetal ' + KEER + ' ' + C.x + ' + startgetal: ' + form + '.', F(form, C.y + ' = ' + E([[t.b, C.x], [t.a, '']]), 'Je draaide ze om. Het hellingsgetal komt bij de ' + C.x + '.')));
            return { vraag:'tabel ' + C.y + ' ' + t.xs.join(' ') + ' | ' + t.ys.join(' '), vraagHtml:'Welke formule hoort bij de tabel?', context:'Het verband is lineair. Schrijf de formule zoals ' + (C.y === 'y' ? 'y = 3x + 12' : C.y + ' = 3' + C.x + ' + 12') + '.', antwoord:form, controle:chk, invoer:'tekst',
              beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wob-v-lin-herken', naam:'De grafiek bij een formule', kort:'Begin bij het startgetal op de y-as en zet met het hellingsgetal een trapje naar het volgende punt',
          uit:'<p>Bij y = 2x − 1 hoort een rechte lijn. Je tekent of herkent hem in twee stappen.</p><p>1. Het <b>startgetal</b> is −1: de lijn snijdt de y-as in <b>(0, −1)</b>.</p><p>2. Het <b>hellingsgetal</b> is 2: ga vanaf dat punt 1 naar rechts en 2 omhoog. Je komt in <b>(1, 1)</b>. Trek een lijn door de twee punten. Is het hellingsgetal negatief, dan gaat de lijn omlaag.</p>',
          wanneer:'je bij een formule de lijn wilt tekenen of de goede grafiek moet kiezen.',
          maak:function(R){
            var a, b, dx, a2, b2;
            do { a = R.kies([-3, -2, -1, 1, 2, 3, 0.5, -0.5]); b = R.heel(-3, 3); dx = a % 1 ? 2 : 1; } while (Math.abs(b + a * dx) > 5);
            do { b2 = b + R.kies([-3, -2, 2, 3]); } while (Math.abs(b2) > 4);
            do { a2 = R.kies([-3, -2, -1, 1, 2, 3, 0.5, -0.5]); } while (a2 === a || a2 === -a);
            var kand = R.hussel([[a, b, 1], [-a, b, 0], [a, b2, 0], [a2, b, 0]]), lt = ['A', 'B', 'C', 'D'], goed = 0;
            kand.forEach(function(k, i){ if (k[2]) goed = i; });
            var f = 'y = ' + E([[a, 'x'], [b, '']]), y1 = b + a * dx;
            function pl(n){
              return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;width:100%;max-width:560px">' + kand.map(function(k, i){
                var hl = n >= 4 && i === goed;
                return '<div style="text-align:center' + (hl ? ';outline:3px solid var(--lr-2);border-radius:10px' : '') + '"><b style="font-size:1.1em">' + lt[i] + '</b>' + assen({ xmin:-5, xmax:5, ymin:-5, ymax:5, max:300, lijnen:[{ a:k[0], b:k[1], k:0 }] }) + '</div>';
              }).join('') + '</div>';
            }
            return { vraag:f, context:'Welke grafiek hoort bij deze formule?', opties:lt, goed:goed, beeld:pl, zelfBeeld:pl(0), stappen:[
              S('Het startgetal: door welk punt op de y-as gaat de lijn? (0, ?)', b, 'Het getal zonder x is ' + T(b) + ': de lijn gaat door (0, ' + T(b) + ').', F(b, a, 'Dat is het hellingsgetal. Het startgetal is het getal zonder x.')),
              K(R, 'Het hellingsgetal is ' + T(a) + '. Stijgt of daalt de lijn?', a > 0 ? 'stijgt' : 'daalt', [], a > 0 ? 'Een positief hellingsgetal: de lijn gaat omhoog.' : 'Een negatief hellingsgetal: de lijn gaat omlaag.', { orde:['stijgt', 'daalt'] }),
              S('Ga vanaf (0, ' + T(b) + ') ' + dx + ' naar rechts. Dan ga je ' + (a > 0 ? T(a * dx) + ' omhoog' : T(-a * dx) + ' omlaag') + '. Bij welke y kom je uit? ' + T(b) + ' + ' + paren(a * dx) + ' =', y1, T(b) + ' + ' + paren(a * dx) + ' = ' + T(y1) + '. De lijn gaat dus ook door (' + dx + ', ' + T(y1) + ').'),
              K(R, 'Welke grafiek gaat door (0, ' + T(b) + ') en door (' + dx + ', ' + T(y1) + ')?', lt[goed], [], 'Zoek de lijn die de y-as snijdt bij ' + T(b) + ' en ook door (' + dx + ', ' + T(y1) + ') gaat: dat is ' + lt[goed] + '.', { orde:lt }) ] };
          } }
      ] },

    /* ================= snijpunt en vergelijkingen ================= */
    { groep:{ id:'wob-v-snij', niveau:'onderbouw', domein:'verbanden', naam:'Snijpunten en vergelijkingen',
        uit:'Het snijpunt van twee grafieken aflezen, en een vergelijking oplossen met een tabel of met een grafiek. Het snijpunt uitrekenen staat bij Formules, lijnen en snijpunten.' },
      doelen:[
        { id:'wob-v-snij-graf', naam:'Het snijpunt aflezen', kort:'Zoek waar de lijnen elkaar kruisen en lees eerst x en dan y af',
          uit:'<p>Twee lijnen kunnen elkaar <b>snijden</b>. Het punt waar ze elkaar kruisen heet het <b>snijpunt</b>.</p><p>In het snijpunt hebben de twee lijnen dezelfde x én dezelfde y. Lees het af zoals elk punt: eerst x (recht naar de x-as), dan y (recht naar de y-as).</p><p>Schrijf het snijpunt als (x, y). Kijk goed: het snijpunt ligt precies op een roosterpunt.</p>',
          wanneer:'je wilt zien waar twee grafieken elkaar raken, bijvoorbeeld wanneer twee prijzen gelijk zijn.',
          maak:function(R){
            var a1, a2, x0, y0, b1, b2;
            do { a1 = R.heel(-3, 3); a2 = R.heel(-3, 3); x0 = R.heel(-4, 4); y0 = R.heel(-4, 4); b1 = y0 - a1 * x0; b2 = y0 - a2 * x0; } while (a1 === a2 || Math.abs(b1) > 6 || Math.abs(b2) > 6 || (x0 === 0 && y0 === 0));
            function pl(n){ return assen({ xmin:-6, xmax:6, ymin:-6, ymax:6, vermijd:x0, lijnen:[{ a:a1, b:b1, k:0, naam:'A' }, { a:a2, b:b2, k:3, naam:'B' }], punten:n >= 1 ? [{ x:x0, y:y0, k:1, ring:true }] : [],
              teken:function(X, Y){ return (n >= 1 ? ln(X(x0), Y(y0), X(x0), Y(0), streep()) : '') + (n >= 2 ? ln(X(x0), Y(y0), X(0), Y(y0), streep()) : ''); } }); }
            return { vraag:'snijpunt ' + [a1, b1, a2, b2].join(' '), vraagHtml:'Wat is het snijpunt van lijn A en lijn B?', context:'Lees het snijpunt af in de grafiek. Schrijf het als (x, y).', antwoord:punt(x0, y0), controle:puntC(x0, y0), invoer:'tekst',
              beeld:pl, zelfBeeld:pl(0), stappen:[
                S('Zoek het punt waar de lijnen elkaar kruisen. Ga vanaf dat punt recht naar de x-as. x =', x0, 'Het snijpunt ligt ' + (x0 < 0 ? 'links van' : x0 > 0 ? 'rechts van' : 'op') + ' de y-as: x = ' + T(x0) + '.', F(x0, -x0, 'Let op het teken van x.', y0, 'Dat is de y. Eerst x.')),
                S('Ga vanaf het snijpunt recht naar de y-as. y =', y0, 'Het snijpunt ligt ' + (y0 < 0 ? 'onder' : y0 > 0 ? 'boven' : 'op') + ' de x-as: y = ' + T(y0) + '.', F(y0, -y0, 'Let op het teken van y.')),
                SC('Het snijpunt (x, y):', punt(x0, y0), puntC(x0, y0), 'Eerst x, dan y: ' + punt(x0, y0) + '.', F(punt(x0, y0), punt(y0, x0), 'Je draaide ze om. Eerst x, dan y.')) ] };
          } },
        { id:'wob-v-snij-tabel', naam:'Een vergelijking oplossen met een tabel', kort:'Maak een tabel voor links en rechts en zoek de x waarbij ze gelijk zijn',
          uit:'<p>Bij 5x + 2 = 3x + 10 zoek je de x waarbij <b>links en rechts gelijk</b> zijn. Maak een <b>tabel</b>: een rij voor links en een rij voor rechts.</p><p>Bij x = 0 is links 2 en rechts 10: rechts is 8 groter. Links komt er per stap 5 bij en rechts 3. Het verschil wordt dus elke stap <b>2 kleiner</b>.</p><p>Na 8 : 2 = 4 stappen is het verschil weg. Bij x = 4 is links 22 en rechts ook 22. De oplossing is <b>x = 4</b>.</p>',
          wanneer:'je een vergelijking wilt oplossen door te proberen, of als je toch al een tabel hebt.',
          maak:function(R){
            var a1, a2, x0, b1, b2;
            do { a2 = R.heel(1, 4); a1 = a2 + R.heel(1, 3); x0 = R.heel(2, 6); b1 = R.heel(0, 8); b2 = b1 + (a1 - a2) * x0; } while (b2 > 30);
            var L = E([[a1, 'x'], [b1, '']]), Rr = E([[a2, 'x'], [b2, '']]), xs = []; for (var x = 0; x <= x0 + 1; x++) xs.push(x);
            var d = b2 - b1, k = a1 - a2, v = a1 * x0 + b1;
            function tab(n){
              var vol = n >= 3;
              return tabel([['x'].concat(xs.map(T)), [L].concat(xs.map(function(x){ return vol || x <= 1 ? T(a1 * x + b1) : ''; })), [Rr].concat(xs.map(function(x){ return vol || x <= 1 ? T(a2 * x + b2) : ''; }))],
                { nadruk:n >= 4 ? [[1, x0 + 1], [2, x0 + 1]] : n < 3 ? [[1, 1], [2, 1]] : [] });
            }
            return { vraag:L + ' = ' + Rr, context:'Los de vergelijking op met een tabel. Typ het antwoord als x = 4 of alleen 4.', antwoord:eqAnt(x0), beeld:tab, zelfBeeld:tab(0), stappen:[
              S('Bij x = 0 is links ' + T(b1) + ' en rechts ' + T(b2) + '. Hoeveel is rechts groter?', d, T(b2) + ' ' + MIN + ' ' + T(b1) + ' = ' + T(d) + '.'),
              S('Per stap komt er links ' + a1 + ' bij en rechts ' + a2 + '. Het verschil wordt per stap kleiner met', k, a1 + ' ' + MIN + ' ' + a2 + ' = ' + k + '. Links haalt rechts in.', F(k, a1 + a2, 'Het verschil wordt kleiner met ' + a1 + ' ' + MIN + ' ' + a2 + ', niet met ' + a1 + ' + ' + a2 + '.')),
              S('Na hoeveel stappen is het verschil weg? ' + d + ' : ' + k + ' =', x0, 'Elke stap gaat er ' + k + ' van het verschil af: ' + d + ' : ' + k + ' = ' + x0 + '.'),
              S('Controleer in de tabel bij x = ' + x0 + '. Links: ' + invul(a1, b1, x0) + ' =', v, invul(a1, b1, x0) + ' = ' + v + '. Rechts: ' + invul(a2, b2, x0) + ' = ' + (a2 * x0 + b2) + '. Ze zijn gelijk.'),
              S('Links en rechts zijn allebei ' + v + '. De oplossing: x =', eqAnt(x0), 'De x waarbij links en rechts gelijk zijn: ' + x0 + '.', F(eqAnt(x0), v, 'Dat is de uitkomst aan beide kanten. De oplossing is de x.')) ] };
          } },
        { id:'wob-v-snij-vgl', naam:'Een vergelijking oplossen met een grafiek', kort:'Teken links en rechts als twee lijnen; de x van het snijpunt is de oplossing',
          uit:'<p>Bij de vergelijking 2x + 1 = −x + 7 teken je <b>twee lijnen</b>: y = 2x + 1 voor links en y = −x + 7 voor rechts.</p><p>Waar de lijnen elkaar <b>snijden</b>, zijn links en rechts gelijk. De <b>x van het snijpunt</b> is de oplossing. Hier snijden ze in (2, 5), dus <b>x = 2</b>.</p><p>Controleer door in te vullen: 2 × 2 + 1 = 5 en −2 + 7 = 5. Klopt. Staat rechts alleen een getal, zoals 2x + 1 = 5, dan is de rechterlijn een vlakke lijn: y = 5.</p>',
          wanneer:'je een grafiek hebt of de lijnen makkelijk kunt tekenen.',
          maak:function(R){
            var soort = R.kies(['twee', 'twee', 'vlak']), a1, a2, x0, y0, b1, b2;
            do { a1 = nz(R, -3, 3); a2 = soort === 'vlak' ? 0 : nz(R, -3, 3); x0 = R.heel(-4, 4); y0 = R.heel(-4, 5); b1 = y0 - a1 * x0; b2 = y0 - a2 * x0; } while (a1 === a2 || Math.abs(b1) > 6 || Math.abs(b2) > 6);
            var L = E([[a1, 'x'], [b1, '']]), Rr = soort === 'vlak' ? T(y0) : (R.heel(0, 1) ? E([[a2, 'x'], [b2, '']]) : E([[b2, ''], [a2, 'x']]));
            function pl(n){ return assen({ xmin:-6, xmax:6, ymin:-6, ymax:6, vermijd:x0, lijnen:[{ a:a1, b:b1, k:0, naam:'A' }, { a:a2, b:b2, k:3, naam:'B' }], punten:n >= 1 ? [{ x:x0, y:y0, k:1, ring:true }] : [],
              teken:function(X, Y){ return n >= 1 ? ln(X(x0), Y(y0), X(x0), Y(0), streep()) : ''; } }); }
            var st = [
              S('Zoek het snijpunt van lijn A (links) en lijn B (rechts). Bij welke x snijden ze elkaar?', x0, 'Ga vanaf het snijpunt recht naar de x-as: x = ' + T(x0) + '.', F(x0, y0, 'Dat is de y van het snijpunt. De oplossing is de x.', -x0, 'Let op het teken van x.')),
              S('Controleer links: ' + invul(a1, b1, x0) + ' =', y0, invul(a1, b1, x0) + ' = ' + T(y0) + '.') ];
            if (soort !== 'vlak') st.push(S('En rechts: ' + invul(a2, b2, x0) + ' =', y0, invul(a2, b2, x0) + ' = ' + T(y0) + '. Links en rechts zijn gelijk.'));
            st.push(S('Beide kanten zijn ' + T(y0) + '. De oplossing: x =', eqAnt(x0), 'De x van het snijpunt: ' + T(x0) + '.', F(eqAnt(x0), y0, 'Dat is de uitkomst. De oplossing is de x.')));
            return { vraag:L + ' = ' + Rr, context:'Los de vergelijking op met de grafiek. Lijn A is y = ' + L + ', lijn B is y = ' + Rr + '. Typ het antwoord als x = 2 of alleen 2.', antwoord:eqAnt(x0), beeld:pl, zelfBeeld:pl(0), stappen:st };
          } }
      ] },

    /* ================= kwadratische formules ================= */
    { groep:{ id:'wob-v-kw', niveau:'onderbouw', domein:'verbanden', naam:'Kwadratische formules',
        uit:'Bij een formule met x² hoort een parabool. Je ziet aan de formule of het een dal- of bergparabool is, maakt een tabel, gebruikt de symmetrie, leest de top af en herkent een kwadratisch verband aan de tweede verschillen.' },
      doelen:[
        { id:'wob-v-kw-vorm', naam:'Dalparabool of bergparabool', kort:'Een positief getal voor x² geeft een dalparabool, een negatief getal een bergparabool',
          uit:'<p>De grafiek bij een formule met <b>x²</b> is een <b>parabool</b>: een boog die links en rechts gelijk is.</p><p>Kijk naar het getal <b>voor x²</b>. Is het <b>positief</b>, dan is het een <b>dalparabool</b>, met een laagste punt. Is het <b>negatief</b>, dan is het een <b>bergparabool</b>, met een hoogste punt.</p><p>Bij y = 5 + 4x − x² staat er −x²: het getal is −1, dus een bergparabool. De volgorde in de formule maakt niet uit.</p>',
          wanneer:'je wilt weten of een parabool een laagste of een hoogste punt heeft.', beeld:parabolen(null),
          maak:function(R){
            var a = R.kies([1, 2, 3, -1, -2, -3, 0.5, -0.5]), b = nz(R, -6, 6), c = nz(R, -9, 9), vorm = R.kies(['std', 'std', 'cvoor', 'bvoor', 'kaal']), f;
            if (vorm === 'std') f = E([[a, 'x²'], [b, 'x'], [c, '']]);
            else if (vorm === 'cvoor'){ b = 0; f = E([[c, ''], [a, 'x²']]); }
            else if (vorm === 'bvoor'){ c = 0; f = E([[b, 'x'], [a, 'x²']]); }
            else { b = 0; c = 0; f = E([[a, 'x²']]); }
            var OPT = ['dalparabool', 'bergparabool'], goed = a > 0 ? 0 : 1;
            function pl(n){ return parabolen(n >= 3 ? (a > 0 ? 'dal' : 'berg') : null); }
            return { vraag:'y = ' + f, context:'Is de grafiek een dalparabool of een bergparabool?', opties:OPT, goed:goed, beeld:pl, zelfBeeld:parabolen(null), stappen:[
              S('Welk getal staat voor x²? Let op het teken.', a, Math.abs(a) === 1 ? 'Er staat ' + (a < 0 ? MIN : '') + 'x²: dat is ' + T(a) + ' ' + KEER + ' x².' : 'Er staat ' + E([[a, 'x²']]) + ': het getal is ' + T(a) + '.',
                F(a, -a, 'Het teken voor x² hoort erbij.', b || null, 'Dat getal staat bij x, niet bij x².', c || null, 'Dat is het losse getal.')),
              K(R, 'Is ' + T(a) + ' positief of negatief?', a > 0 ? 'positief' : 'negatief', [], a > 0 ? T(a) + ' is groter dan 0.' : T(a) + ' is kleiner dan 0.', { orde:['positief', 'negatief'] }),
              K(R, 'Dus de grafiek is een', OPT[goed], [], a > 0 ? 'Positief voor x²: een dalparabool, met een laagste punt.' : 'Negatief voor x²: een bergparabool, met een hoogste punt.', { orde:OPT }) ] };
          } },
        { id:'wob-v-kw-tabel', naam:'Een tabel bij een kwadratische formule', kort:'Vul elke x in tussen haakjes; eerst het kwadraat, dan keer, dan plus en min',
          uit:'<p>Bij y = x² − 4x + 3 maak je een tabel door elke x in te vullen. Zet een <b>negatief</b> getal tussen haakjes.</p><p>Reken in de goede volgorde: eerst het <b>kwadraat</b>, dan <b>keer</b>, dan <b>plus en min</b>. Bij x = −1: (−1)² − 4 × (−1) + 3 = 1 + 4 + 3 = <b>8</b>.</p><p>Let op: een kwadraat is nooit negatief, want min keer min is plus. En −4 × (−1) is +4.</p>',
          wanneer:'je de grafiek van een kwadratische formule wilt tekenen.',
          maak:function(R){
            var a = R.kies([1, 1, -1, 2]), p = R.kies([-1, 1, 1, 2, 2, 3]), b = -2 * a * p, c = R.heel(-5, 8), s = R.kies([-2, -1, 0]);
            var xs = [0, 1, 2, 3, 4].map(function(i){ return s + i; }), f = function(x){ return a * x * x + b * x + c; }, ys = xs.map(f), form = 'y = ' + E([[a, 'x²'], [b, 'x'], [c, '']]);
            var volg = xs.map(function(x, i){ return i; }).filter(function(i){ return xs[i] !== 0; }), nul = xs.indexOf(0);
            function tab(n){ return tabel([['x'].concat(xs.map(T)), ['y'].concat(ys.map(function(y, i){ return i === nul || volg.indexOf(i) < n ? T(y) : ''; }))], { nadruk:n < volg.length ? [[1, volg[n] + 1]] : [] }); }
            var st = volg.map(function(i){
              var x = xs[i], y = ys[i], hint = 'Eerst ' + paren(x) + '² = ' + (x * x) + (a !== 1 ? ', dan ' + (a === -1 ? MIN + (x * x) : T(a) + ' ' + KEER + ' ' + (x * x) + ' = ' + T(a * x * x)) : '') + '. Dan ' + T(b) + ' ' + KEER + ' ' + paren(x) + ' = ' + T(b * x) + '.' + (c ? ' Dan ' + teken(c) + '.' : '');
              var fo = x < 0 ? F(y, -a * x * x + b * x + c, 'Een kwadraat is nooit negatief: ' + paren(x) + '² = ' + (x * x) + '.', a * x * x - b * x + c, 'Let op: ' + T(b) + ' ' + KEER + ' ' + paren(x) + ' = ' + T(b * x) + '.') : F(y, a * 2 * x + b * x + c, x + '² is ' + x + ' ' + KEER + ' ' + x + ', niet 2 ' + KEER + ' ' + x + '.');
              return S('x = ' + T(x) + ': ' + kwSub(a, b, c, x) + ' =', y, hint, fo);
            });
            return { vraag:form, context:'Maak de tabel af voor x = ' + T(xs[0]) + ' tot en met ' + T(xs[4]) + '. Typ de hele rij y met puntkomma\'s ertussen.', antwoord:ys.map(T).join('; '), controle:rijC(ys), invoer:'tekst',
              beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wob-v-kw-sym', naam:'De symmetrie in de tabel', kort:'Zoek de symmetrieas midden tussen twee gelijke y-waarden; even ver ervandaan staat dezelfde y',
          uit:'<p>Een parabool is <b>symmetrisch</b>: links en rechts van de top is hij precies gelijk. Dat zie je ook in de tabel.</p><p>Zoek twee <b>gelijke y-waarden</b> naast het midden. De <b>symmetrieas</b> ligt precies midden tussen hun x-waarden. Bij x = 2 en x = 4 allebei 3? Dan ligt de as bij x = 3.</p><p>Zoek je y bij x = 6, kijk dan even ver aan de andere kant. 6 ligt 3 rechts van de as, dus kijk bij 3 − 3 = <b>0</b>. Daar staat dezelfde y.</p>',
          wanneer:'je een tabel snel wilt afmaken zonder alles uit te rekenen.',
          maak:function(R){
            var a, s, p, b, c, xs, f, sh, kand;
            do {
              a = R.kies([1, -1, 1, -1, 2, -2]); s = R.kies([-2, -1, 0]); p = s + R.kies([1.5, 2, 2.5, 3, 3.5]); b = -2 * a * p; c = R.heel(-6, 8);
              xs = []; for (var i = 0; i < 8; i++) xs.push(s + i);
              f = function(x){ return a * x * x + b * x + c; };
              var grens = p % 1 ? p + 0.5 : p + 1; sh = xs.indexOf(grens);
              kand = xs.filter(function(x, i){ return i > sh && 2 * p - x >= s; });
            } while (!kand.length || xs.some(function(x){ return Math.abs(f(x)) > 60; }));
            var xk = R.kies(kand), m = 2 * p - xk, yk = f(xk), pl1 = p % 1 ? p - 0.5 : p - 1, pr = p % 1 ? p + 0.5 : p + 1, ik = xs.indexOf(xk);
            function tab(n){
              return tabel([['x'].concat(xs.map(T)), ['y'].concat(xs.map(function(x, i){ return i <= sh ? T(f(x)) : i === ik ? (n >= 3 ? T(yk) : '?') : ''; }))],
                { nadruk:(n >= 1 ? [[1, xs.indexOf(pl1) + 1], [1, xs.indexOf(pr) + 1]] : []).concat(n >= 2 ? [[1, xs.indexOf(m) + 1], [1, ik + 1]] : []) });
            }
            return { vraag:'tabel ' + xs.slice(0, sh + 1).map(f).join(' ') + ' ? ' + xk, vraagHtml:'Welk getal hoort op de plek van het vraagteken?', context:'De tabel hoort bij een kwadratische formule. De grafiek is symmetrisch, en de tabel dus ook.', antwoord:T(yk),
              beeld:tab, zelfBeeld:tab(0), stappen:[
                S('Zoek twee gelijke y-waarden rond het midden. De symmetrieas ligt midden tussen hun x-waarden: x =', p, 'Bij x = ' + T(pl1) + ' en x = ' + T(pr) + ' staat allebei ' + T(f(pl1)) + '. Het midden daartussen is ' + T(p) + '.'),
                S('x = ' + T(xk) + ' ligt ' + T(xk - p) + ' rechts van de as. Welke x ligt even ver links van de as?', m, T(p) + ' ' + MIN + ' ' + T(xk - p) + ' = ' + T(m) + '.', F(m, xk - p, 'Dat is de afstand tot de as. Ga die afstand naar links vanaf ' + T(p) + '.')),
                S('Dus bij x = ' + T(xk) + ' is y net zo groot als bij x = ' + T(m) + ': y =', yk, 'Kijk in de tabel bij x = ' + T(m) + ': daar staat ' + T(yk) + '.') ] };
          } },
        { id:'wob-v-kw-top', naam:'De top uit de tabel', kort:'De top ligt op de symmetrieas: midden tussen twee gelijke y-waarden',
          uit:'<p>De <b>top</b> van een parabool is het laagste punt (bij een dalparabool) of het hoogste punt (bij een bergparabool).</p><p>De top ligt op de <b>symmetrieas</b>. Zoek in de tabel twee gelijke y-waarden en neem het <b>midden</b> van hun x-waarden. Dat is de x van de top. Lees daar de y af.</p><p>Bij x: 0, 1, 2, 3, 4 en y: 7, 2, −1, −2, −1 staat −1 bij x = 2 en bij x = 4. Het midden is 3, dus de top is <b>(3, −2)</b>: het laagste punt.</p>',
          wanneer:'je het laagste of hoogste punt van een parabool zoekt.',
          maak:function(R){
            var a = R.kies([1, -1, 2, -2, 1, -1]), s = R.heel(-3, 1), p = s + R.heel(1, 5), q = R.heel(-6, 9), xs = [];
            for (var i = 0; i < 7; i++) xs.push(s + i);
            var f = function(x){ return a * (x - p) * (x - p) + q; }, ys = xs.map(f), ip = xs.indexOf(p), dal = a > 0;
            var OPT = ['het laagste punt (dalparabool)', 'het hoogste punt (bergparabool)'];
            function tab(n){ return tabel([['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))], { nadruk:(n >= 1 ? [[1, ip], [1, ip + 2]] : []).concat(n >= 2 ? [[0, ip + 1], [1, ip + 1]] : []) }); }
            return { vraag:'tabel ' + xs.join(' ') + ' | ' + ys.join(' '), vraagHtml:'Wat is de top van de parabool?', context:'De tabel hoort bij een parabool. Schrijf de top als (x, y).', antwoord:punt(p, q), controle:puntC(p, q), invoer:'tekst',
              beeld:tab, zelfBeeld:tab(0), stappen:[
                S('Zoek twee gelijke y-waarden. Het midden van hun x-waarden is de x van de top: x =', p, 'Bij x = ' + T(p - 1) + ' en x = ' + T(p + 1) + ' staat allebei ' + T(f(p - 1)) + '. Het midden is ' + T(p) + '.'),
                S('De y van de top: kijk in de tabel bij x = ' + T(p) + '. y =', q, 'Onder x = ' + T(p) + ' staat ' + T(q) + '.', F(q, f(p - 1), 'Dat is het getal naast de top. Kijk precies bij x = ' + T(p) + '.')),
                K(R, 'Is de top het laagste of het hoogste punt?', OPT[dal ? 0 : 1], [], 'De getallen naast de top zijn ' + (dal ? 'groter' : 'kleiner') + ' dan ' + T(q) + '.', { orde:OPT }),
                SC('De top (x, y):', punt(p, q), puntC(p, q), 'Eerst x, dan y: ' + punt(p, q) + '.', F(punt(p, q), punt(q, p), 'Je draaide ze om. Eerst x, dan y.')) ] };
          } },
        { id:'wob-v-kw-verschil', naam:'Lineair of kwadratisch: tweede verschillen', kort:'Eerste verschillen gelijk: lineair. Tweede verschillen gelijk (niet 0): kwadratisch',
          uit:'<p>Met <b>verschillen</b> zie je wat voor verband een tabel is (x gaat steeds 1 omhoog).</p><p>De <b>eerste verschillen</b> zijn wat er bij y bijkomt: rechts min links. Zijn die allemaal gelijk, dan is het verband <b>lineair</b>.</p><p>Zo niet, reken dan de <b>tweede verschillen</b> uit: de verschillen tussen de eerste verschillen. Zijn die allemaal gelijk (en niet 0), dan is het verband <b>kwadratisch</b>. Bij 1, 4, 9, 16, 25: eerste verschillen 3, 5, 7, 9, tweede verschillen 2, 2, 2. Kwadratisch.</p>',
          wanneer:'je bij een tabel wilt weten welke soort formule erbij hoort.',
          maak:function(R){
            var soort = R.kies(['lin', 'kw', 'kw', 'exp', 'anders']), xs = [0, 1, 2, 3, 4], ys, d1, d2;
            for (;;){
              if (soort === 'lin'){ var a = nz(R, -5, 6), b = R.heel(-5, 10); ys = xs.map(function(x){ return a * x + b; }); }
              else if (soort === 'kw'){ var ka = R.kies([1, 2, -1, 3, -2]), kb = R.heel(-4, 4), kc = R.heel(-5, 8); ys = xs.map(function(x){ return ka * x * x + kb * x + kc; }); }
              else if (soort === 'exp'){ var g = R.kies([2, 3]), eb = R.kies([1, 2, 3]); ys = xs.map(function(x){ return eb * Math.pow(g, x); }); }
              else { var v = R.heel(0, 10); ys = [v]; for (var i = 1; i < 5; i++) ys.push(ys[i - 1] + R.heel(-4, 7)); }
              d1 = verschil(ys); d2 = verschil(d1);
              var echt = allesGelijk(d1) ? 'lin' : allesGelijk(d2) ? 'kw' : 'anders';
              if (soort === 'exp' || echt === soort) break;
            }
            var OPT = ['lineair', 'kwadratisch', 'geen van beide'], goed = allesGelijk(d1) ? 0 : allesGelijk(d2) ? 1 : 2;
            function tab(n){
              var r = [['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))];
              if (n >= 1) r.push(['1e verschil', ''].concat(d1.map(teken)));
              if (n >= 2) r.push(['2e verschil', '', ''].concat(d2.map(teken)));
              return tabel(r);
            }
            return { vraag:'tabel ' + ys.join(' '), vraagHtml:'Lineair, kwadratisch of geen van beide?', context:'Bekijk de tabel. Reken de eerste en de tweede verschillen uit.', opties:OPT, goed:goed, beeld:tab, zelfBeeld:tab(0), stappen:[
              SC('De eerste verschillen (typ ze met puntkomma\'s ertussen):', d1.map(T).join('; '), rijC(d1), 'Steeds rechts min links: ' + ys.slice(1).map(function(y, i){ return T(y) + ' ' + MIN + ' ' + paren(ys[i]) + ' = ' + T(d1[i]); }).join(', ') + '.'),
              SC('De tweede verschillen: de verschillen tussen de eerste verschillen.', d2.map(T).join('; '), rijC(d2), 'Steeds rechts min links bij ' + d1.map(T).join(', ') + ': ' + d2.map(T).join(', ') + '.'),
              K(R, 'Eerste verschillen ' + d1.map(T).join(', ') + ', tweede verschillen ' + d2.map(T).join(', ') + '. Wat voor verband is het?', OPT[goed], [],
                goed === 0 ? 'De eerste verschillen zijn allemaal gelijk: lineair.' : goed === 1 ? 'De eerste verschillen zijn niet gelijk, de tweede verschillen wel: kwadratisch.' : 'De eerste verschillen zijn niet gelijk en de tweede verschillen ook niet.', { orde:OPT }) ] };
          } }
      ] },

    /* ================= omgekeerd evenredig ================= */
    { groep:{ id:'wob-v-oe', niveau:'onderbouw', domein:'verbanden', naam:'Omgekeerd evenredig',
        uit:'Bij een omgekeerd evenredig verband is x · y steeds hetzelfde: twee keer zo veel van het een geeft de helft van het ander. Je herkent het, rekent een ontbrekende waarde uit en maakt de formule.' },
      doelen:[
        { id:'wob-v-oe-herken', naam:'Omgekeerd evenredig herkennen', kort:'Reken in elke kolom x · y uit; is dat steeds hetzelfde, dan is het omgekeerd evenredig',
          uit:'<p>Bij <b>omgekeerd evenredig</b> wordt y kleiner als x groter wordt, en wel precies zo: twee keer zo veel x geeft de <b>helft</b> van y.</p><p>Je controleert het met <b>x · y</b>: reken in elke kolom x keer y uit. Is dat <b>steeds hetzelfde</b> getal, dan is het omgekeerd evenredig.</p><p>x: 2, 3, 4, 6 en y: 12, 8, 6, 4 geeft 24, 24, 24, 24: omgekeerd evenredig. Let op: als y alleen maar kleiner wordt, is het nog niet omgekeerd evenredig.</p>',
          wanneer:'je wilt weten of een tabel omgekeerd evenredig is.',
          maak:function(R){
            var soort = R.kies(['oe', 'oe', 'rv', 'dal', 'bijna']), xs, ys;
            if (soort === 'oe' || soort === 'bijna'){
              var k = R.kies([12, 24, 36, 48, 60, 72, 120]), del = []; for (var d = 1; d <= k; d++) if (k % d === 0 && d <= 12) del.push(d);
              xs = R.hussel(del).slice(0, 4).sort(function(p, q){ return p - q; }); ys = xs.map(function(x){ return k / x; });
              if (soort === 'bijna'){ var j = R.kies([2, 3]); ys[j] += ys[j] > 2 ? R.kies([-1, 1]) : 1; }
            } else if (soort === 'rv'){ var c = R.heel(2, 6); xs = R.hussel([1, 2, 3, 4, 5, 6, 8]).slice(0, 4).sort(function(p, q){ return p - q; }); ys = xs.map(function(x){ return c * x; }); }
            else { var st0 = R.heel(1, 3), a = R.heel(2, 5); xs = [0, 1, 2, 3].map(function(i){ return st0 + i; }); var b = a * xs[3] + R.heel(2, 10); ys = xs.map(function(x){ return b - a * x; }); }
            var pr = xs.map(function(x, i){ return x * ys[i]; }), oe = allesGelijk(pr), OPT = ['ja: omgekeerd evenredig', 'nee: niet omgekeerd evenredig'];
            function tab(n){ var r = [['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))]; if (n >= 1) r.push(['x · y'].concat(pr.map(function(p, i){ return i < n ? T(p) : ''; }))); return tabel(r); }
            var st = xs.map(function(x, i){ return S('Kolom ' + (i + 1) + ': ' + T(x) + ' ' + KEER + ' ' + T(ys[i]) + ' =', pr[i], 'Doe x keer y: ' + T(x) + ' ' + KEER + ' ' + T(ys[i]) + ' = ' + T(pr[i]) + '.', F(pr[i], x + ys[i], 'Het is x keer y, niet x plus y.')); });
            st.push(K(R, 'De uitkomsten zijn ' + pr.map(T).join(', ') + '. Is het omgekeerd evenredig?', OPT[oe ? 0 : 1], [], oe ? 'x · y is steeds ' + T(pr[0]) + ': omgekeerd evenredig.' : 'x · y is niet steeds hetzelfde, dus niet omgekeerd evenredig.', { orde:OPT }));
            return { vraag:'tabel ' + xs.join(' ') + ' | ' + ys.join(' '), vraagHtml:'Is de tabel omgekeerd evenredig?', context:'Reken in elke kolom x · y uit.', opties:OPT, goed:oe ? 0 : 1, beeld:tab, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wob-v-oe-ontbreek', naam:'Een ontbrekende waarde berekenen', kort:'Reken het vaste product uit en deel het door het nieuwe getal',
          uit:'<p>Met 4 schilders duurt een klus 6 dagen. Met meer schilders gaat het sneller: dat is <b>omgekeerd evenredig</b>.</p><p>Het <b>product</b> blijft gelijk: 4 × 6 = <b>24</b> werkdagen. Zoveel werk is het, hoeveel schilders er ook zijn.</p><p>Met 8 schilders: 24 : 8 = <b>3</b> dagen. Controleer: meer schilders, dus minder dagen. Klopt.</p>',
          wanneer:'twee dingen samen altijd hetzelfde opleveren, zoals aantal werkers keer aantal dagen.',
          maak:function(R){
            var C = R.kies([
              { tots:[24, 36, 48, 60, 72], lo:2, hi:12, t:function(p, d){ return 'Met ' + p + ' schilders duurt het schilderen van een school ' + T(d) + ' dagen.'; }, vr:function(q){ return 'Hoeveel dagen duurt het met ' + q + ' schilders?'; }, eh:'dagen', wie:'schilders', wat:'dagen', prod:'werkdagen' },
              { tots:[24, 36, 48, 60, 72, 90], lo:2, hi:10, t:function(p, d){ return 'Een zak voer is genoeg voor ' + p + ' konijnen gedurende ' + T(d) + ' dagen.'; }, vr:function(q){ return 'Hoeveel dagen doen ' + q + ' konijnen met dezelfde zak?'; }, eh:'dagen', wie:'konijnen', wat:'dagen', prod:'dagen voer voor één konijn' },
              { tots:[60, 72, 84, 96, 120], lo:3, hi:12, t:function(p, d){ return 'Een zak snoep is precies genoeg om ' + p + ' kinderen elk ' + T(d) + ' snoepjes te geven.'; }, vr:function(q){ return 'Hoeveel snoepjes krijgt ieder kind als je de zak eerlijk verdeelt over ' + q + ' kinderen?'; }, eh:'snoepjes', wie:'kinderen', wat:'snoepjes per kind', prod:'snoepjes in de zak' },
              { tots:[120, 180, 240, 360], lijst:[40, 45, 60, 80, 90, 120], t:function(p, d){ return 'Met een snelheid van ' + p + ' km per uur duurt een rit ' + T(d) + ' uur.'; }, vr:function(q){ return 'Hoe lang duurt de rit met ' + q + ' km per uur?'; }, eh:'uur', wie:'km per uur', wat:'tijd', prod:'km lang' } ]);
            var tot, p, q, d, ans;
            for (;;){
              tot = R.kies(C.tots);
              var del = (C.lijst || []).slice(); if (!C.lijst) for (var k = C.lo; k <= C.hi; k++) if (tot % k === 0) del.push(k);
              del = del.filter(function(k){ return (tot / k * 2) % 1 === 0 && tot / k >= 1; });
              if (del.length < 2) continue;
              p = R.kies(del); q = R.kies(del); d = tot / p; ans = tot / q;
              if (p !== q && (C.lijst || (d % 1 === 0 && ans % 1 === 0))) break;
            }
            var meer = q > p, rv = rnd(d * q / p, 2);
            var richt = C.eh === 'uur' ? (meer ? 'korter' : 'langer') : (meer ? 'minder' : 'meer');
            return { vraag:C.vr(q), context:C.t(p, T(d)) + ' Het verband is omgekeerd evenredig.', antwoord:T(ans), eenheid:C.eh, stappen:[
              K(R, 'Nu ' + q + ' in plaats van ' + p + ' ' + C.wie + '. Wordt het antwoord groter of kleiner dan ' + T(d) + '?', meer ? 'kleiner' : 'groter', [], (meer ? 'Meer ' : 'Minder ') + C.wie + ', dan ' + richt + ' ' + (C.eh === 'uur' ? 'onderweg' : C.wat) + '.', { orde:['groter', 'kleiner'] }),
              S('Het product blijft gelijk: ' + p + ' ' + KEER + ' ' + T(d) + ' =', tot, p + ' ' + KEER + ' ' + T(d) + ' = ' + tot + '. ' + (C.eh === 'uur' ? 'De rit is ' + tot + ' km lang.' : 'Dat zijn ' + tot + ' ' + C.prod + '.')),
              S(tot + ' : ' + q + ' =', ans, 'Deel het product door ' + q + '.', F(ans, rv, 'Je rekende alsof het recht evenredig is. Hier geldt: ' + (meer ? 'meer ' : 'minder ') + C.wie + ', dan ' + richt + '.')) ] };
          } },
        { id:'wob-v-oe-formule', naam:'De formule bij omgekeerd evenredig', kort:'Reken x · y uit; is dat steeds k, dan is de formule y = k/x',
          uit:'<p>Is x · y steeds hetzelfde getal, zeg <b>48</b>, dan is y gelijk aan 48 <b>gedeeld door</b> x.</p><p>De formule is dan <b>y = 48/x</b> (of y = 48 : x). Controleer met de tabel: bij x = 6 is y = 48 : 6 = 8.</p><p>Bij omgekeerd evenredig staat de x dus onder de deelstreep. De grafiek is een kromme lijn die steeds dichter bij de assen komt.</p>',
          wanneer:'je bij een omgekeerd evenredige tabel een formule wilt maken.',
          maak:function(R){
            var k = R.kies([12, 18, 24, 30, 36, 48, 60, 72, 120]), del = []; for (var d = 1; d <= k; d++) if (k % d === 0 && d <= 12) del.push(d);
            var xs = R.hussel(del).slice(0, 4).sort(function(p, q){ return p - q; }), ys = xs.map(function(x){ return k / x; }), form = 'y = ' + k + '/x';
            function tab(n){ var r = [['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))]; if (n >= 1) r.push(['x · y'].concat(xs.map(function(x, i){ return i < n && i < 2 ? T(k) : ''; }))); return tabel(r); }
            return { vraag:'tabel ' + xs.join(' ') + ' | ' + ys.join(' '), vraagHtml:'Welke formule hoort bij de tabel?', context:'De tabel is omgekeerd evenredig. Schrijf de formule zoals y = 24/x.', antwoord:form, controle:oeC(k), invoer:'tekst',
              beeld:tab, zelfBeeld:tab(0), stappen:[
                S('x · y in de eerste kolom: ' + T(xs[0]) + ' ' + KEER + ' ' + T(ys[0]) + ' =', k, T(xs[0]) + ' ' + KEER + ' ' + T(ys[0]) + ' = ' + k + '.'),
                S('En in de tweede kolom: ' + T(xs[1]) + ' ' + KEER + ' ' + T(ys[1]) + ' =', k, 'Weer ' + k + ': x · y is steeds ' + k + '.'),
                SC('x · y = ' + k + '. De formule: y =', form, oeC(k), 'Als x · y = ' + k + ', dan is y = ' + k + ' gedeeld door x. Typ ' + k + '/x.', F(form, 'y = ' + k + 'x', 'Dat is recht evenredig. Hier deel je ' + k + ' door x.', 'y = x/' + k, 'Andersom: ' + k + ' gedeeld door x.')) ] };
          } }
      ] }
  ]);
})();
