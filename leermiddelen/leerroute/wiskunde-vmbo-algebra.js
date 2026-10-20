/* De leerroute wiskunde, bovenbouw vmbo (kb en gt): algebra en verbanden voor het examen.
   Lineaire formules opstellen (hellingsgetal, bij een tabel, een grafiek en een verhaal,
   terugrekenen), formules met een kwadraat of een wortel (invullen en terugrekenen),
   formules combineren en formules met eenheden, vergelijkingen oplossen door inklemmen
   en met de grafiek, kwadratische verbanden (tabel, dal of berg, symmetrieas, top,
   snijpunten met de x-as), exponentiële groei verder (meer perioden, afname, terug in
   de tijd, een grens) en grafieken in de praktijk (toenamediagram, grootste toename,
   gemiddelde verandering, toenemend en afnemend stijgen). Elke manier een eigen doel.
   De basis van exponentiële groei (groeifactor, procent, N = b · g^t, groeifactor uit
   een tabel) staat in wiskunde-verbanden.js (groep wi-exp). Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon, G = R0.geld;
  var MIN = '−', X = '×';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes voor stappen en antwoorden ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function S(tekst, ant, hint, fout, waarom){
    var s = { tekst:tekst, antwoord:uniek([].concat(ant).map(function(a){ return typeof a === 'number' ? T(a) : String(a); })), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (waarom) s.waarom = waarom;
    return s;
  }
  function SC(tekst, ant, controle, hint, fout, waarom){ var s = S(tekst, ant, hint, fout, waarom); s.controle = controle; s.invoer = 'tekst'; return s; }
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
  function rnd(x, d){ var f = Math.pow(10, d == null ? 6 : d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  function eu(x){ return T(rnd(x, 2), { dec:2, vast:true }); }
  /* afstand tot de grens waar afronden omslaat: klein = twijfelgeval */
  function randAfst(x, d){ var f = x * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5); }
  function E(termen){
    var s = '';
    termen.forEach(function(t){
      var c = t[0], v = t[1] || ''; if (!c) return;
      var abs = Math.abs(c), stuk = (v && abs === 1 ? '' : T(abs)) + v;
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }
  function plus(c){ return c < 0 ? MIN + ' ' + T(-c) : '+ ' + T(c); }
  function antP(d){ return d > 0 ? [T(d), '+' + T(d)] : [T(d)]; }
  function metTeken(d){ return (d > 0 ? '+' : '') + T(d); }

  /* ---------- uitdrukkingen lezen: een veelterm als { '':4, x:3, xx:1 } ---------- */
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
  /* zonder haakjes, en elke soort term maar een keer: 1,2m + 3,5 wel, 2,4 · 0,5m + 3,5 niet */
  function kaal(v){
    var s = norm(v); if (/[()]/.test(s)) return false;
    var stukken = s.replace(/([^*\/^+-])([+-])/g, '$1|$2').split('|'), gezien = {};
    for (var i = 0; i < stukken.length; i++){
      if (/[*\/]/.test(stukken[i].replace(/^[+-]/, '')) && /\d.*[*\/].*\d/.test(stukken[i])) return false;
      var p = lees(stukken[i]); if (!p) return false;
      var k = Object.keys(p).filter(function(x){ return Math.abs(p[x]) > 1e-12; });
      if (k.length > 1 || (k.length === 1 && gezien[k[0]])) return false;
      if (k.length) gezien[k[0]] = 1;
    }
    return true;
  }
  /* een formule met een letter links: "K = 2,4a + 3,5"; "K =" mag weg; o.kaal: helemaal uitgewerkt */
  function formC(L, verwacht, o){
    o = o || {}; var q = lees(verwacht), l = {}; l[L.toLowerCase()] = 1;
    return function(v){
      var d = String(v).split('='), r, tekst;
      if (d.length > 2) return false;
      if (d.length === 2){
        var a = lees(d[0]), b = lees(d[1]); if (!a || !b) return false;
        if (pGelijk(a, l)){ r = b; tekst = d[1]; } else if (pGelijk(b, l)){ r = a; tekst = d[0]; } else return false;
      } else { r = lees(d[0]); tekst = d[0]; }
      if (!r || !pGelijk(r, q)) return false;
      return o.kaal ? kaal(tekst) : true;
    };
  }
  /* een getal, eventueel met "x =" of "x ≈" ervoor */
  function getalVan(t){
    var s = String(t == null ? '' : t).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^[a-z]+(=|≈)/, '').replace(/^(≈|=)/, '').replace(/^€/, '').replace(/%$/, '');
    if (/^-?\d+(,\d+)?$/.test(s)) return +s.replace(',', '.');
    if (/^-?\d*\.\d+$/.test(s)) return +s;
    return NaN;
  }
  function numC(w){ return function(v){ var g = getalVan(v); return !isNaN(g) && Math.abs(g - w) < 1e-9; }; }
  /* gehele getallen uit een antwoord, met + en − ervoor; ; , spaties en "en" scheiden */
  function heleGetallen(v){
    var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\b(en|of|tot|tussen|x|y)\b/g, ' ').replace(/[;,=]/g, ' ').trim();
    if (!/^[-+\d\s]+$/.test(s)) return null;
    var l = s.split(/\s+/).filter(Boolean);
    if (l.some(function(x){ return !/^[+-]?\d+$/.test(x); })) return null;
    return l.map(function(x){ return +x.replace('+', ''); });
  }
  function rijC(rij){ return function(v){ var l = heleGetallen(v); return !!l && l.length === rij.length && l.every(function(x, i){ return x === rij[i]; }); }; }
  function paarC(p, q){ return function(v){ var l = heleGetallen(v); return !!l && l.length === 2 && ((l[0] === p && l[1] === q) || (l[0] === q && l[1] === p)); }; }
  /* oplossingen: "x = 5 of x = −1", ook "5 en −1" */
  function oplC(waarden){
    var w = waarden.slice().sort(function(a, b){ return a - b; });
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/x\s*[12]?\s*(=|≈)/g, ' ').replace(/\b(of|en)\b/g, ' ').replace(/[;]/g, ' ').replace(/(\d),(?=\d)/g, '$1.').replace(/,/g, ' ').trim();
      if (!/^[-\d.\s]+$/.test(s)) return false;
      var l = s.split(/\s+/).filter(Boolean).map(Number);
      if (l.some(isNaN)) return false;
      l = uniek(l.map(String)).map(Number).sort(function(a, b){ return a - b; });
      return l.length === w.length && l.every(function(x, i){ return Math.abs(x - w[i]) < 1e-9; });
    };
  }
  function oplTekst(l){ return l.map(function(x){ return 'x = ' + T(x); }).join(' of '); }
  /* een punt: (2, −3) of (2,5; −3,25) */
  function puntLees(t){
    var s = String(t).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '');
    var i = s.indexOf('('); if (i > 0) s = s.slice(i);
    s = s.replace(/^\(/, '').replace(/\)$/, '');
    var d = s.indexOf(';') >= 0 ? s.split(';') : s.split(',');
    if (d.length !== 2) return null;
    var a = d.map(function(x){ x = x.replace(',', '.'); return /^-?\d+(\.\d+)?$/.test(x) ? +x : NaN; });
    return isNaN(a[0]) || isNaN(a[1]) ? null : a;
  }
  function puntC(x, y){ return function(v){ var p = puntLees(v); return !!p && Math.abs(p[0] - x) < 1e-9 && Math.abs(p[1] - y) < 1e-9; }; }
  function punt(x, y){ return x === Math.round(x) && y === Math.round(y) ? '(' + T(x) + ', ' + T(y) + ')' : '(' + T(x) + '; ' + T(y) + ')'; }
  /* twee punten in willekeurige volgorde: "(−1, 0) en (3, 0)" */
  function puntenC(lijst){
    return function(v){
      var g = String(v).match(/\([^()]*\)/g); if (!g || g.length !== lijst.length) return false;
      var p = g.map(puntLees); if (p.some(function(x){ return !x; })) return false;
      var over = lijst.slice();
      return p.every(function(q){ for (var i = 0; i < over.length; i++) if (Math.abs(over[i][0] - q[0]) < 1e-9 && Math.abs(over[i][1] - q[1]) < 1e-9){ over.splice(i, 1); return true; } return false; });
    };
  }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + Math.round(max) + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700');
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal' + (o.m ? ' ' + o.m : '') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function cirkel(x, y, r, k, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + k + (o.s ? ';stroke:' + o.s + ';stroke-width:' + (o.w || 2) : '') + '"/>'; }
  function pijl(x1, y1, x2, y2, k){ var r = x2 > x1 ? -1 : 1; return ln(x1, y1, x2, y2, { k:k, w:2.5 }) + '<path d="M' + n1(x2) + ' ' + n1(y2) + ' l' + (r * 9) + ' -6 M' + n1(x2) + ' ' + n1(y2) + ' l' + (r * 9) + ' 6" style="fill:none;stroke:' + k + ';stroke-width:2.5;stroke-linecap:round"/>'; }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).filter(Boolean).map(function(x){ return /^<svg/.test(x) ? '<div style="width:100%;max-width:540px">' + x + '</div>' : x; }).join('') + '</div>'; }

  /* een pijlenketting: vak = teksten in de vakjes, ops = de bewerkingen erheen, terug = de bewerkingen terug (mag weg), lab = letters boven de vakjes */
  function ketting(vak, ops, terug, lab){
    var bw = 80, aw = 100, n = ops.length, top = lab ? 24 : 6, W = (n + 1) * bw + n * aw + 8, H = top + 48 + (terug ? 64 : 4), s = '';
    function bx(i){ return 4 + i * (bw + aw); }
    vak.forEach(function(t, i){
      s += '<rect x="' + bx(i) + '" y="' + top + '" width="' + bw + '" height="42" rx="10" class="vak"/>';
      if (t !== '' && t != null) s += tx(bx(i) + bw / 2, top + 27, t, {});
      if (lab && lab[i]) s += tx(bx(i) + bw / 2, top - 8, lab[i], { m:'klein', vet:true });
    });
    ops.forEach(function(t, i){
      var x1 = bx(i) + bw + 6, x2 = bx(i + 1) - 6, y = top + 23;
      s += pijl(x1, y, x2, y, KL[0]) + tx((x1 + x2) / 2, y - 8, t, { m:'klein', k:KL[0], vet:true });
      if (terug && terug[i]){ var yt = top + 66; s += pijl(x2, yt, x1, yt, KL[1]) + tx((x1 + x2) / 2, yt + 21, terug[i], { m:'klein', k:KL[1], vet:true }); }
    });
    return svg(W, H, s, 'pijlenketting: ' + ops.join(', '), Math.min(640, W * 1.05));
  }

  /* een assenstelsel met roosterlijnen: o = { x0, x1, dx, lx, y0, y1, dy, ly, gelijk, xnaam, ynaam, xt, lijnen:[{ f, k, naam, nx }], punten:[{ x, y, k, label }], poly:[[x, y], ..] } */
  function stelsel(o){
    var x0 = o.x0, x1 = o.x1, y0 = o.y0, y1 = o.y1, dx = o.dx || 1, dy = o.dy || 1, lx = o.lx || dx, ly = o.ly || dy;
    var PW = o.pw || 440, PH = o.ph || 290, ml = 50, mr = 34, mt = o.ynaam ? 34 : 18, mb = o.xnaam ? 48 : 30;
    if (o.gelijk){ var u = Math.min(PW / (x1 - x0), PH / (y1 - y0)); PW = u * (x1 - x0); PH = u * (y1 - y0); }
    var ux = PW / (x1 - x0), uy = PH / (y1 - y0), W = PW + ml + mr, H = PH + mt + mb, s = '', i, v;
    function Xp(x){ return ml + (x - x0) * ux; }
    function Yp(y){ return mt + (y1 - y) * uy; }
    function veel(w, st){ var q = w / st; return Math.abs(q - Math.round(q)) < 1e-6; }
    for (i = 0; (v = x0 + i * dx) <= x1 + 1e-9; i++) s += ln(Xp(v), Yp(y0), Xp(v), Yp(y1), { w:1, op:0.2 });
    for (i = 0; (v = y0 + i * dy) <= y1 + 1e-9; i++) s += ln(Xp(x0), Yp(v), Xp(x1), Yp(v), { w:1, op:0.2 });
    var ax = y0 <= 0 && y1 >= 0 ? 0 : y0, ay = x0 <= 0 && x1 >= 0 ? 0 : x0, oorsprong = ax === 0 && ay === 0 && !o.xt;
    s += ln(Xp(x0), Yp(ax), Xp(x1) + 14, Yp(ax), { w:2 }) + ln(Xp(ay), Yp(y0), Xp(ay), Yp(y1) - 14, { w:2 });
    s += '<path d="M' + n1(Xp(x1) + 16) + ' ' + n1(Yp(ax)) + ' l-9 -5 M' + n1(Xp(x1) + 16) + ' ' + n1(Yp(ax)) + ' l-9 5 M' + n1(Xp(ay)) + ' ' + n1(Yp(y1) - 16) + ' l-5 9 M' + n1(Xp(ay)) + ' ' + n1(Yp(y1) - 16) + ' l5 9" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
    for (i = 0; (v = x0 + i * dx) <= x1 + 1e-9; i++){ v = rnd(v, 6); if (!veel(v - (o.xt ? x0 : 0), lx)) continue; if (oorsprong && v === 0) continue; s += tx(Xp(v), Yp(ax) + 19, o.xt ? o.xt(v) : T(v), { m:'klein' }); }
    for (i = 0; (v = y0 + i * dy) <= y1 + 1e-9; i++){ v = rnd(v, 6); if (!veel(v, ly)) continue; if (oorsprong && v === 0) continue; if (v === ax && ay !== x0) continue; if (v !== ax && Math.abs(Yp(v) - Yp(ax)) < 30 && v < ax) continue; s += tx(Xp(ay) - 8, Yp(v) + 5, T(v), { m:'klein', a:'end' }); }
    if (oorsprong && x0 === 0) s += tx(Xp(0) - 8, Yp(0) + 19, '0', { m:'klein', a:'end' });
    if (o.xnaam) s += tx(Xp(x1) + 14, Yp(ax) + 40, o.xnaam, { m:'klein', vet:true, a:'end' });
    if (o.ynaam) s += tx(Xp(ay) + 10, Yp(y1) - 18, o.ynaam, { m:'klein', vet:true, a:'start' });
    (o.lijnen || []).forEach(function(l){
      var d = '', aan = false, N = 300;
      for (var j = 0; j <= N; j++){
        var t = x0 + (x1 - x0) * j / N, w = l.f(t);
        if (w < y0 - 1e-9 || w > y1 + 1e-9 || !isFinite(w)){ aan = false; continue; }
        d += (aan ? ' L' : ' M') + n1(Xp(t)) + ' ' + n1(Yp(w)); aan = true;
      }
      if (d) s += '<path d="' + d.trim() + '" style="fill:none;stroke:' + KL[l.k || 0] + ';stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>';
      if (l.naam){ var nx = l.nx, ny = l.f(nx); s += tx(Xp(nx) + 8, Yp(ny) - 10, l.naam, { k:KL[l.k || 0], vet:true, a:'start' }); }
    });
    if (o.poly){
      s += '<path d="' + o.poly.map(function(p, j){ return (j ? 'L' : 'M') + n1(Xp(p[0])) + ' ' + n1(Yp(p[1])); }).join(' ') + '" style="fill:none;stroke:' + KL[0] + ';stroke-width:3;stroke-linejoin:round"/>';
      o.poly.forEach(function(p){ s += cirkel(Xp(p[0]), Yp(p[1]), 4.5, KL[0], { s:'var(--kaart)', w:1.5 }); });
    }
    (o.punten || []).forEach(function(p){ s += cirkel(Xp(p.x), Yp(p.y), 6, KL[p.k == null ? 1 : p.k], { s:'var(--kaart)', w:2 }); if (p.label) s += tx(Xp(p.x) + 10, Yp(p.y) - 10, p.label, { m:'klein', vet:true, a:'start' }); });
    return svg(W, H, s, o.aria || 'assenstelsel met een grafiek', Math.min(580, W * 1.15));
  }
  /* een toenamediagram: tijden (k + 1 labels), d (k toenames), n staven zichtbaar, st = roosterstap */
  function toenameDiagram(tijden, d, n, st, naam){
    var k = d.length, lo = Math.min(0, Math.min.apply(null, d)), hi = Math.max(0, Math.max.apply(null, d));
    lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st; if (lo === 0) lo = -st; if (hi === 0) hi = st;
    var PW = 440, PH = Math.min(260, Math.max(150, (hi - lo) / st * 22)), ml = 54, mr = 24, mt = 34, mb = 34, W = PW + ml + mr, H = PH + mt + mb, s = '', v;
    function Xp(i){ return ml + i * PW / k; }
    function Yp(y){ return mt + (hi - y) / (hi - lo) * PH; }
    for (v = lo; v <= hi + 1e-9; v += st){ v = rnd(v, 6); s += ln(ml, Yp(v), ml + PW, Yp(v), { w:1, op:0.2 }) + tx(ml - 8, Yp(v) + 5, metTeken(v), { m:'klein', a:'end' }); }
    for (var i = 0; i < n && i < k; i++){
      var x = Xp(i) + PW / k * 0.2, w = PW / k * 0.6, y = Math.min(Yp(0), Yp(d[i])), h = Math.abs(Yp(d[i]) - Yp(0));
      s += '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" style="fill:' + (d[i] > 0 ? KL[0] : KL[3]) + ';opacity:.85;stroke:var(--ink);stroke-width:1.5"/>';
    }
    s += ln(ml, Yp(0), ml + PW, Yp(0), { w:2.5 }) + ln(ml, Yp(lo), ml, Yp(hi), { w:2 });
    tijden.forEach(function(t, j){ s += ln(Xp(j), Yp(0) - 5, Xp(j), Yp(0) + 5, { w:2 }) + tx(Xp(j), H - 10, t, { m:'klein' }); });
    s += tx(ml - 4, mt - 16, naam || 'toename', { m:'klein', vet:true, a:'start' });
    return svg(W, H, s, 'toenamediagram', 580);
  }
  /* een parabool met eenheidsrooster */
  function parabool(f, x0, x1, y0, y1, extra){
    var o = { x0:x0, x1:x1, y0:y0, y1:y1, dx:1, dy:1, gelijk:true, lx:(x1 - x0) > 14 ? 2 : 1, ly:(y1 - y0) > 14 ? 2 : 1, lijnen:[{ f:f, k:0 }] };
    for (var k in extra) o[k] = extra[k];
    if (extra && extra.lijnen) o.lijnen = [{ f:f, k:0 }].concat(extra.lijnen);
    return stelsel(o);
  }

  /* ================= lineaire formules: de verhalen ================= */
  var LIN = [
    { L:'K', v:'a', ev:'km', evm:'km', geld:true, wat:'K is de prijs in euro en a het aantal km.', xn:'a (km)', yn:'K (€)',
      zin:function(a, b){ return 'Een taxirit kost ' + G(b) + ' instaptarief plus ' + G(a) + ' per km.'; }, as:[1.5, 2, 2.25, 2.4, 2.5, 3], bs:[3, 3.5, 4, 4.5, 5], pool:[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20],
      terug:function(Y){ return 'Een rit kost ' + G(Y) + '. Hoeveel km was de rit?'; }, gr:{ dys:[1, 2], bk:[2, 4] } },
    { L:'K', v:'u', ev:'uur', evm:'uur', geld:true, wat:'K is de prijs in euro en u het aantal uur.', xn:'u (uur)', yn:'K (€)',
      zin:function(a, b){ return 'Een kano huren kost ' + G(b) + ' vast plus ' + G(a) + ' per uur.'; }, as:[4, 5, 6, 7.5, 8], bs:[10, 12, 15, 20], pool:[1, 2, 3, 4, 5, 6, 8],
      terug:function(Y){ return 'Je betaalt ' + G(Y) + '. Hoeveel uur had je de kano?'; }, gr:{ dys:[5, 10], bk:[1, 3] } },
    { L:'h', v:'t', ev:'uur', evm:'uur', dal:true, wat:'h is de lengte in cm en t de tijd in uren.', xn:'t (uur)', yn:'h (cm)',
      zin:function(a, b){ return 'Een kaars is ' + T(b) + ' cm lang. Hij brandt elk uur ' + T(-a) + ' cm korter.'; }, as:[-1, -1.5, -2, -2.5, -3], bs:[20, 24, 25, 30, 36], pool:[1, 2, 3, 4, 5, 6, 8],
      terug:function(Y){ return 'De kaars is nog ' + T(Y) + ' cm lang. Hoeveel uur brandt hij al?'; }, gr:{ dys:[2, 5], bk:[5, 10] } },
    { L:'V', v:'t', ev:'minuut', evm:'minuten', wat:'V is de hoeveelheid water in liter en t de tijd in minuten.', xn:'t (min)', yn:'V (liter)',
      zin:function(a, b){ return 'In een bad zit ' + T(b) + ' liter water. De kraan loopt en er komt elke minuut ' + T(a) + ' liter bij.'; }, as:[8, 10, 12, 15], bs:[10, 20, 25, 30], pool:[1, 2, 3, 4, 5, 6, 8],
      terug:function(Y){ return 'Er zit ' + T(Y) + ' liter water in het bad. Hoeveel minuten loopt de kraan al?'; }, gr:{ dys:[10, 20], bk:[1, 3] } },
    { L:'B', v:'t', ev:'uur', evm:'uur', dal:true, wat:'B is de benzine in liter en t de tijd in uren.', xn:'t (uur)', yn:'B (liter)',
      zin:function(a, b){ return 'Een aggregaat heeft een tank met ' + T(b) + ' liter benzine. Het verbruikt ' + T(-a) + ' liter per uur.'; }, as:[-2, -2.5, -4, -5], bs:[40, 50, 60], pool:[1, 2, 3, 4, 5, 6, 8, 10],
      terug:function(Y){ return 'Er zit nog ' + T(Y) + ' liter in de tank. Hoeveel uur draait het aggregaat al?'; }, gr:{ dys:[5, 10], bk:[4, 8] } },
    { L:'K', v:'m', ev:'minuut', evm:'minuten', geld:true, wat:'K is de prijs per maand in euro en m het aantal gebelde minuten.', xn:'m (min)', yn:'K (€)',
      zin:function(a, b){ return 'Een telefoonabonnement kost ' + G(b) + ' per maand plus ' + G(a) + ' per gebelde minuut.'; }, as:[0.1, 0.15, 0.2, 0.25], bs:[8, 10, 12.5, 15], pool:[10, 20, 30, 40, 50, 60, 80, 100, 120],
      terug:function(Y){ return 'Je betaalt deze maand ' + G(Y) + '. Hoeveel minuten heb je gebeld?'; } },
    { L:'L', v:'w', ev:'week', evm:'weken', wat:'L is de lengte in cm en w het aantal weken.', xn:'w (weken)', yn:'L (cm)',
      zin:function(a, b){ return 'Een plant is ' + T(b) + ' cm lang. Hij groeit elke week ' + T(a) + ' cm.'; }, as:[1.5, 2, 2.5, 3, 4], bs:[5, 8, 10, 12], pool:[1, 2, 3, 4, 5, 6, 8, 10],
      terug:function(Y){ return 'De plant is ' + T(Y) + ' cm lang. Na hoeveel weken is dat?'; }, gr:{ dys:[2, 5], bk:[1, 4] } }
  ];
  function linForm(it, a, b){ return it.L + ' = ' + E([[a, it.v], [b, '']]); }
  function linFy(it){ return it.geld ? function(y){ return eu(y); } : function(y){ return T(y); }; }
  function linData(R, it, n){
    var a, b, xs;
    for (var p = 0; p < 200; p++){
      a = R.kies(it.as); b = R.kies(it.bs); xs = R.hussel(it.pool).slice(0, n).sort(function(u, w){ return u - w; });
      if (xs.every(function(x){ return b + a * x > 0; })) break;
    }
    return { a:a, b:b, xs:xs, ys:xs.map(function(x){ return rnd(b + a * x); }) };
  }
  function linTab(it, xs, ys, o){
    o = o || {}; var fy = linFy(it);
    return R0.teken.tabel([[it.v].concat(xs.map(function(x){ return T(x); })), [it.L].concat(ys.map(fy))], { zijkop:true, nadruk:o.nadruk || [], pijlen:o.pijlen || [] });
  }

  /* ---------- lineair: maak-functies ---------- */
  function mHelling(R){
    var it, d, i = 0, gap = 0;
    for (var p = 0; p < 60; p++){
      it = R.kies(LIN); d = linData(R, it, 4); gap = 0;
      for (var j = 0; j < 3; j++) if (d.xs[j + 1] - d.xs[j] > gap){ gap = d.xs[j + 1] - d.xs[j]; i = j; }
      if (gap >= 2) break;
    }
    var a = d.a, xs = d.xs, ys = d.ys, x1 = xs[i], x2 = xs[i + 1], y1 = ys[i], y2 = ys[i + 1], dy = rnd(y2 - y1), dx = x2 - x1, fy = linFy(it);
    function tab(n){ return linTab(it, xs, ys, { nadruk:n >= 1 ? [[0, i + 1], [0, i + 2], [1, i + 1], [1, i + 2]] : [],
      pijlen:[].concat(n >= 2 ? [{ van:i + 1, naar:i + 2, tekst:'+' + T(dx) }] : [], n >= 1 ? [{ van:i + 1, naar:i + 2, tekst:metTeken(dy), onder:true }] : []) }); }
    return { vraag:it.L + ': ' + ys.map(fy).join(' '), vraagHtml:'Wat is het hellingsgetal?', context:'Bij deze tabel hoort een lineair verband. ' + it.wat + ' Bereken het hellingsgetal: hoeveel verandert ' + it.L + ' per ' + it.ev + '?',
      beeld:tab, zelfBeeld:tab(0), stappen:[
        S('Neem de kolommen ' + it.v + ' = ' + T(x1) + ' en ' + it.v + ' = ' + T(x2) + '. Verschil in ' + it.L + ': ' + fy(y2) + ' ' + MIN + ' ' + fy(y1) + ' =', dy,
          'De rechter waarde min de linker: ' + fy(y2) + ' ' + MIN + ' ' + fy(y1) + '.' + (dy < 0 ? ' Het wordt minder, dus het verschil is negatief.' : ''), F(dy, -dy, dy < 0 ? 'Het wordt minder: het verschil is negatief.' : 'Doe de rechter waarde min de linker.')),
        S('Verschil in ' + it.v + ': ' + T(x2) + ' ' + MIN + ' ' + T(x1) + ' =', dx, 'Kijk in de bovenste rij: van ' + T(x1) + ' naar ' + T(x2) + '.'),
        S('Hellingsgetal = ' + T(dy) + ' : ' + T(dx) + ' =', a, 'Deel het verschil in ' + it.L + ' door het verschil in ' + it.v + ': ' + T(dy) + ' : ' + T(dx) + '.' + (a < 0 ? ' Negatief gedeeld door positief is negatief.' : ''),
          F(a, dy, 'Je moet nog delen door ' + T(dx) + ': de stap in ' + it.v + ' is niet 1.', rnd(dx / dy), 'Andersom: het verschil in ' + it.L + ' gedeeld door het verschil in ' + it.v + '.', -a, a < 0 ? 'Het wordt minder, dus het hellingsgetal is negatief.' : 'Het wordt meer, dus het hellingsgetal is positief.')) ] };
  }
  function mLinTabel(R){
    var it = R.kies(LIN), d = linData(R, it, 4), a = d.a, b = d.b, xs = d.xs, ys = d.ys, x1 = xs[0], x2 = xs[1], y1 = ys[0], y2 = ys[1], fy = linFy(it);
    var e = E([[a, it.v], [b, '']]), f = it.L + ' = ' + e, stap = rnd(x1 * Math.abs(a)), c = formC(it.L, e);
    function tab(n){
      if (n >= 2) return linTab(it, [0].concat(xs), [b].concat(ys), { nadruk:[[0, 1], [1, 1]], pijlen:[{ van:2, naar:1, tekst:(a > 0 ? MIN : '+') + T(stap) + ' terug', onder:true }] });
      return linTab(it, xs, ys, { nadruk:n >= 1 ? [[1, 1], [1, 2]] : [] });
    }
    return { vraag:'Formule bij ' + it.L + ': ' + ys.map(fy).join(' '), vraagHtml:'Welke formule hoort bij de tabel?', context:'Bij deze tabel hoort een lineair verband. ' + it.wat + ' Stel de formule op. Schrijf hem zoals ' + it.L + ' = 2,5' + it.v + ' + 7.',
      antwoord:f, controle:c, invoer:'tekst', beeld:tab, zelfBeeld:tab(0), stappen:[
        S('Hellingsgetal: (' + fy(y2) + ' ' + MIN + ' ' + fy(y1) + ') : (' + T(x2) + ' ' + MIN + ' ' + T(x1) + ') =', a, 'Verschil in ' + it.L + ': ' + T(rnd(y2 - y1)) + '. Verschil in ' + it.v + ': ' + T(x2 - x1) + '. Deel het eerste door het tweede.',
          F(a, rnd(y2 - y1), 'Deel nog door het verschil in ' + it.v + ': ' + T(x2 - x1) + '.', -a, 'Let op het teken: het wordt ' + (a < 0 ? 'minder.' : 'meer.'))),
        S('Startgetal: reken terug naar ' + it.v + ' = 0. ' + fy(y1) + ' ' + (a > 0 ? MIN : '+') + ' ' + T(x1) + ' ' + X + ' ' + T(Math.abs(a)) + ' =', b,
          'Van ' + it.v + ' = ' + T(x1) + ' naar ' + it.v + ' = 0 ga je ' + T(x1) + ' ' + (x1 === 1 ? 'stap' : 'stappen') + ' terug. Bij elke stap terug wordt het ' + T(Math.abs(a)) + (a > 0 ? ' minder' : ' meer') + ': ' + T(x1) + ' ' + X + ' ' + T(Math.abs(a)) + ' = ' + T(stap) + '.',
          F(b, y1, 'Dat is ' + it.L + ' bij ' + it.v + ' = ' + T(x1) + '. Het startgetal hoort bij ' + it.v + ' = 0.', rnd(a > 0 ? y1 + stap : y1 - stap), 'Andersom: terug naar ' + it.v + ' = 0 wordt het ' + (a > 0 ? 'minder.' : 'meer.'))),
        SC('De formule: ' + it.L + ' =', e, c, it.L + ' = hellingsgetal ' + X + ' ' + it.v + ' + startgetal: ' + f + '.') ] };
  }
  function mLinGraf(R){
    var lijst = LIN.filter(function(x){ return x.gr; }), it = R.kies(lijst), amin = Math.min.apply(null, it.as.map(Math.abs)), amax = Math.max.apply(null, it.as.map(Math.abs));
    var a, b, xk, yk, dy, su, xmax, ymax;
    for (var p = 0; p < 2000; p++){
      dy = R.kies(it.gr.dys); su = R.kies([1, 1, 2]); xmax = 10 * su;
      b = dy * R.heel(it.gr.bk[0], it.gr.bk[1]); xk = su * R.kies([2, 4, 5, 6, 8, 10]);
      var m = R.heel(1, 8); yk = it.dal ? b - dy * m : b + dy * m;
      a = rnd((yk - b) / xk);
      if (yk < 0 || Math.abs(a * 100 - Math.round(a * 100)) > 1e-6 || Math.abs(a) < amin * 0.5 || Math.abs(a) > amax * 2) continue;
      ymax = Math.ceil(Math.max(b, b + a * xmax) / dy) * dy + (it.dal ? dy : 0);
      if (ymax / dy > 13 || ymax / dy < 5) continue;
      break;
    }
    var e = E([[a, it.v], [b, '']]), f = it.L + ' = ' + e, c = formC(it.L, e);
    var plaat = stelsel({ x0:0, x1:xmax, dx:su, y0:0, y1:ymax, dy:dy, xnaam:it.xn, ynaam:it.yn, lijnen:[{ f:function(x){ return b + a * x; }, k:0 }], punten:[{ x:0, y:b, k:1 }, { x:xk, y:yk, k:1 }] });
    return { vraag:'grafiek ' + it.L + ' ' + b + ' ' + xk + ' ' + yk, vraagHtml:'Welke formule hoort bij de grafiek?', context:'De grafiek hoort bij een lineair verband. ' + it.wat + ' Stel de formule op. Schrijf hem zoals ' + it.L + ' = 2,5' + it.v + ' + 7.',
      antwoord:f, controle:c, invoer:'tekst', beeld:plaat, zelfBeeld:plaat, stappen:[
        S('Lees het startgetal af: bij ' + it.v + ' = 0 is ' + it.L + ' =', b, 'Kijk waar de lijn de verticale as snijdt, bij de eerste stip.', F(b, yk, 'Dat is de andere stip. Het startgetal staat bij ' + it.v + ' = 0.')),
        S('Lees een tweede punt af: bij ' + it.v + ' = ' + T(xk) + ' is ' + it.L + ' =', yk, 'Ga bij ' + it.v + ' = ' + T(xk) + ' recht omhoog naar de stip op de lijn, en kijk dan naar links op de as.'),
        S('Hellingsgetal: (' + T(yk) + ' ' + MIN + ' ' + T(b) + ') : ' + T(xk) + ' =', a, 'Verschil in ' + it.L + ': ' + T(rnd(yk - b)) + '. Deel dat door ' + T(xk) + ', het verschil in ' + it.v + '.',
          F(a, rnd(yk - b), 'Deel nog door ' + T(xk) + ', het verschil in ' + it.v + '.', -a, 'Let op het teken: de lijn ' + (a < 0 ? 'daalt.' : 'stijgt.'))),
        SC('De formule: ' + it.L + ' =', e, c, it.L + ' = hellingsgetal ' + X + ' ' + it.v + ' + startgetal: ' + f + '.') ] };
  }
  function mLinVerhaal(R){
    var it = R.kies(LIN), a = R.kies(it.as), b = R.kies(it.bs), e = E([[a, it.v], [b, '']]), f = it.L + ' = ' + e, c = formC(it.L, e);
    return { vraag:it.L + ' = ?', context:it.zin(a, b) + ' ' + it.wat + ' Stel de formule op. Schrijf hem zoals ' + it.L + ' = 2,5' + it.v + ' + 7.', antwoord:f, controle:c, invoer:'tekst', stappen:[
      S('Het startgetal: hoeveel is ' + it.L + ' bij ' + it.v + ' = 0?', b, 'Wat is er al aan het begin, voordat er één ' + it.ev + ' voorbij is? Dat is ' + T(b) + '.', F(b, a, 'Dat is wat er per ' + it.ev + ' verandert. Het startgetal is wat er bij ' + it.v + ' = 0 al is.', -a, 'Dat is wat er per ' + it.ev + ' verandert.')),
      S(it.dal ? 'Het hellingsgetal: er gaat per ' + it.ev + ' ' + T(-a) + ' af. Het wordt minder, dus het hellingsgetal is' : 'Het hellingsgetal: hoeveel komt er per ' + it.ev + ' bij?', a,
        it.dal ? 'Het wordt minder: zet een min voor ' + T(-a) + '.' : 'Elke ' + it.ev + ' komt er ' + T(a) + ' bij.', F(a, -a, it.dal ? 'Het wordt minder: het hellingsgetal is negatief.' : 'Het wordt meer: het hellingsgetal is positief.', b, 'Dat is het startgetal.')),
      SC('De formule: ' + it.L + ' =', e, c, it.L + ' = hellingsgetal ' + X + ' ' + it.v + ' + startgetal: ' + f + '.', F(e, E([[b, it.v], [a, '']]), 'Je draaide ze om. Het hellingsgetal staat bij de ' + it.v + '.')) ] };
  }
  function mLinTerug(R){
    var it = R.kies(LIN), a, b, x, Y;
    for (var p = 0; p < 100; p++){ a = R.kies(it.as); b = R.kies(it.bs); x = R.kies(it.pool); Y = rnd(b + a * x); if (Y > 0) break; }
    var f = linForm(it, a, b), fy = linFy(it), st, bl = null;
    if (!it.dal){
      var r1 = rnd(Y - b);
      bl = function(n){ return ketting([n >= 2 ? T(x) : '?', n >= 1 ? T(r1) : '', fy(Y)], [X + ' ' + T(a), '+ ' + T(b)], [': ' + T(a), MIN + ' ' + T(b)], [it.v, '', it.L]); };
      st = [
        S('Reken terug. Haal eerst het startgetal eraf: ' + fy(Y) + ' ' + MIN + ' ' + fy(b) + ' =', r1, 'Het omgekeerde van + ' + T(b) + ' is ' + MIN + ' ' + T(b) + '.', F(r1, rnd(Y + b), 'Terugrekenen: + wordt ' + MIN + '.')),
        S('Deel door het hellingsgetal: ' + T(r1) + ' : ' + T(a) + ' =', x, 'Het omgekeerde van ' + X + ' ' + T(a) + ' is : ' + T(a) + '.', F(x, rnd(r1 * a), 'Terugrekenen: keer wordt delen.', rnd(Y / a), 'Haal eerst het startgetal eraf, en deel daarna.')) ];
    } else {
      var af = rnd(b - Y);
      st = [
        S('Hoeveel is er al af? ' + T(b) + ' ' + MIN + ' ' + T(Y) + ' =', af, 'Het begin min wat er nu nog is.', F(af, rnd(b + Y), 'Het wordt minder: doe ' + T(b) + ' ' + MIN + ' ' + T(Y) + '.')),
        S('Per ' + it.ev + ' gaat er ' + T(-a) + ' af. ' + T(af) + ' : ' + T(-a) + ' =', x, 'Hoe vaak past ' + T(-a) + ' in ' + T(af) + '?', F(x, rnd(Y / -a), 'Deel wat er af is, niet wat er nog over is.', rnd(af * -a), 'Delen, niet keer.')) ];
    }
    var o = { vraag:it.L + ' = ' + fy(Y), context:it.zin(a, b) + ' De formule is ' + f + '. ' + it.terug(Y), eenheid:it.evm, stappen:st };
    if (bl){ o.beeld = bl; o.zelfBeeld = ''; }
    return o;
  }

  /* ================= formules met een kwadraat of een wortel ================= */
  var KWF = [
    { L:'r', v:'v', c:0.01, k:0, zin:'De remweg van een auto is r = 0,01 · v². Hierin is r de remweg in meter en v de snelheid in km/u.', vals:[30, 40, 50, 60, 70, 80, 90, 100, 110, 120], eh:'meter',
      vr:function(x){ return 'Hoe lang is de remweg bij ' + T(x) + ' km/u?'; }, tvr:function(Y){ return 'Een auto heeft een remweg van ' + T(Y) + ' meter. Hoe hard reed hij?'; }, teh:'km/u' },
    { L:'h', v:'t', c:5, k:0, zin:'Een steen valt van een hoge brug. Na t seconden is hij h = 5 · t² meter gevallen.', vals:[1.5, 2, 2.5, 3, 3.5, 4], eh:'meter',
      vr:function(x){ return 'Hoeveel meter is hij na ' + T(x) + ' seconden gevallen?'; }, tvr:function(Y){ return 'De steen is ' + T(Y) + ' meter gevallen. Hoeveel seconden is hij al onderweg?'; }, teh:'seconden' },
    { L:'A', v:'r', c:3.14, k:0, dec:1, zin:'De oppervlakte van een cirkel is A = 3,14 · r². Hierin is r de straal in cm en A de oppervlakte in cm².', vals:[3, 4, 5, 6, 7, 8, 9, 11, 12, 15], eh:'cm²',
      vr:function(x){ return 'Wat is de oppervlakte bij een straal van ' + T(x) + ' cm?'; }, tvr:function(Y){ return 'Een cirkel heeft een oppervlakte van ' + T(Y) + ' cm². Hoe groot is de straal?'; }, teh:'cm' },
    { L:'K', v:'z', c:30, k:100, geld:true, zin:'Een vierkante vloer laten tegelen kost K = 30 · z² + 100. Hierin is K de prijs in euro en z de lengte van een zijde in meter.', vals:[2, 2.5, 3, 3.5, 4, 4.5, 5, 6], eh:'',
      vr:function(x){ return 'Wat kost een vloer met zijden van ' + T(x) + ' meter?'; }, tvr:function(Y){ return 'Een vloer tegelen kost ' + G(Y) + '. Hoe lang is een zijde?'; }, teh:'meter' } ];
  function kwGen(R){
    var c = R.kies([2, 3, -2, 0.5, 4]), k = nz(R, -9, 9);
    return { L:'y', v:'x', c:c, k:k, zin:'Gegeven is de formule y = ' + E([[c, 'x²'], [k, '']]) + '.', vals:[-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], eh:'', vr:function(x){ return 'Bereken y voor x = ' + T(x) + '.'; } };
  }
  function labels(eerste, n, laatste){ var l = [eerste]; for (var i = 1; i < n; i++) l.push(''); l.push(laatste); return l; }
  function mKwInvul(R){
    var it = R.heel(0, 4) ? R.kies(KWF) : kwGen(R), x = R.kies(it.vals), xx = rnd(x * x), cxx = rnd(it.c * xx), y = rnd(cxx + it.k), eind = it.dec ? rnd(y, 1) : y;
    var ops = ['kwadraat', X + ' ' + T(it.c)].concat(it.k ? [plus(it.k)] : []), w = [T(x), T(xx), T(cxx)].concat(it.k ? [T(y)] : []);
    function bl(n){ return ketting(w.map(function(t, i){ return i <= n ? t : ''; }), ops, null, labels(it.v, ops.length, it.L)); }
    var st = [
      S('Eerst het kwadraat: ' + paren(x) + '² =', xx, 'Een kwadraat is een getal keer zichzelf: ' + paren(x) + ' ' + X + ' ' + paren(x) + '.' + (x < 0 ? ' Min keer min is plus.' : ''),
        F(xx, rnd(2 * x), 'Kwadraat is niet keer 2, maar keer zichzelf.', -xx, 'Min keer min is plus: een kwadraat is nooit negatief.')),
      S('Dan keer ' + T(it.c) + ': ' + T(it.c) + ' ' + X + ' ' + T(xx) + ' =', cxx, 'Reken uit: ' + T(it.c) + ' ' + X + ' ' + T(xx) + '.' + (it.c === 0.01 ? ' Keer 0,01 is hetzelfde als delen door 100.' : ''),
        F(cxx, rnd(it.c * x * it.c * x), 'Eerst het kwadraat van ' + it.v + ', dan pas keer ' + T(it.c) + '.')) ];
    if (it.k) st.push(S('Dan ' + plus(it.k) + ': ' + T(cxx) + ' ' + plus(it.k) + ' =', y, 'Het losse getal komt als laatste.', F(y, rnd(cxx - it.k), 'Let op het teken: ' + plus(it.k) + '.')));
    if (it.dec && eind !== y) st.push(S('Rond af op 1 decimaal: ' + T(y) + ' ≈', eind, 'Kijk naar het tweede cijfer achter de komma. Is dat 5 of meer, dan rond je naar boven af.'));
    return { vraag:it.L + ' bij ' + it.v + ' = ' + T(x), context:it.zin + ' ' + it.vr(x) + (it.dec ? ' Rond af op 1 decimaal.' : ''), antwoord:it.geld ? [eu(eind), T(eind)] : T(eind), eenheid:it.eh,
      beeld:bl, zelfBeeld:'', stappen:st };
  }
  var WTF = [
    { L:'d', v:'h', c:3.6, zin:'Hoe ver je kunt kijken tot de horizon: d = 3,6 · √h. Hierin is d de afstand in km en h de hoogte van je ogen in meter.', vals:[4, 9, 16, 25, 36, 49, 64, 81, 100, 144], eh:'km',
      vr:function(x){ return 'Hoe ver kun je kijken als je ogen ' + T(x) + ' meter hoog zijn?'; }, tvr:function(Y){ return 'Je kunt ' + T(Y) + ' km ver kijken. Hoe hoog zijn je ogen?'; }, teh:'meter' },
    { L:'T', v:'L', c:2, zin:'Eén keer heen en weer schommelen duurt T = 2 · √L seconden. Hierin is L de lengte van de touwen in meter.', vals:[0.25, 1, 2.25, 4, 6.25], eh:'seconden',
      vr:function(x){ return 'Hoe lang duurt één keer heen en weer bij touwen van ' + T(x) + ' meter?'; }, tvr:function(Y){ return 'Eén keer heen en weer duurt ' + T(Y) + ' seconden. Hoe lang zijn de touwen?'; }, teh:'meter' },
    { L:'O', v:'A', c:4, zin:'Een vierkant veld heeft een oppervlakte van A m². De omtrek in meter is O = 4 · √A.', vals:[100, 144, 225, 400, 625, 900, 1600, 2500], eh:'meter',
      vr:function(x){ return 'Wat is de omtrek als de oppervlakte ' + T(x) + ' m² is?'; }, tvr:function(Y){ return 'De omtrek is ' + T(Y) + ' meter. Wat is de oppervlakte?'; }, teh:'m²' },
    { L:'t', v:'h', c:1, deel:5, zin:'Een steen valt van een hoogte van h meter. Hij doet er t = √(h : 5) seconden over.', vals:[5, 20, 45, 80, 125, 180, 245, 320], eh:'seconden',
      vr:function(x){ return 'Hoe lang valt de steen van ' + T(x) + ' meter hoog?'; }, tvr:function(Y){ return 'De steen valt ' + T(Y) + ' seconden. Van hoe hoog viel hij?'; }, teh:'meter' } ];
  var WORTEL_ROND = [2, 3, 5, 6, 7, 8, 10, 12, 15, 20, 30, 40, 50].filter(function(x){
    var y = 3.6 * Math.sqrt(x); return randAfst(y, 1) > 0.05 && rnd(3.6 * rnd(Math.sqrt(x), 2), 1) === rnd(y, 1); });
  function mWortelInvul(R){
    var rond = !R.heel(0, 3), it = rond ? WTF[0] : R.kies(WTF), x = rond ? R.kies(WORTEL_ROND) : R.kies(it.vals);
    var q = it.deel ? rnd(x / it.deel) : x, r = rnd(Math.sqrt(q)), y = rnd(it.c * r), st = [], w, ops;
    if (it.deel) st.push(S('Eerst wat onder de wortel staat: ' + T(x) + ' : ' + it.deel + ' =', q, 'Wat onder de wortel staat, reken je eerst uit.', F(q, rnd(Math.sqrt(x)), 'Eerst ' + T(x) + ' : 5, dan pas de wortel.')));
    if (rond){
      var r2 = rnd(Math.sqrt(x), 2);
      y = rnd(3.6 * Math.sqrt(x), 1);
      st.push(S('De wortel: √' + T(x) + ' ≈ (rond af op 2 decimalen)', r2, 'Tik in: √' + T(x) + ' = ' + T(rnd(Math.sqrt(x), 5)) + '…', F(r2, rnd(x / 2, 2), 'De wortel is niet de helft. Gebruik de knop √.', rnd(x * x, 2), 'Dat is het kwadraat. Gebruik de knop √.')));
      st.push(S('Keer 3,6. Reken met de hele wortel uit je rekenmachine: 3,6 ' + X + ' √' + T(x) + ' ≈ (rond af op 1 decimaal)', y, '3,6 ' + X + ' ' + T(rnd(Math.sqrt(x), 5)) + '… = ' + T(rnd(3.6 * Math.sqrt(x), 4)) + '…',
        F(y, rnd(Math.sqrt(3.6 * x), 1), 'Eerst de wortel, dan pas keer 3,6.')));
      w = [T(x), '≈ ' + T(r2), '≈ ' + T(y)]; ops = ['wortel', X + ' 3,6'];
    } else {
      st.push(S((it.deel ? 'Dan' : 'Eerst') + ' de wortel: √' + T(q) + ' =', r, 'Welk getal keer zichzelf is ' + T(q) + '? Controleer: ' + T(r) + ' ' + X + ' ' + T(r) + ' = ' + T(q) + '.',
        F(r, rnd(q / 2), 'De wortel is niet de helft. Zoek het getal dat keer zichzelf ' + T(q) + ' is.', q < 30 ? rnd(q * q) : null, 'Dat is het kwadraat. De wortel is juist andersom.')));
      if (it.c !== 1) st.push(S('Dan keer ' + T(it.c) + ': ' + T(it.c) + ' ' + X + ' ' + T(r) + ' =', y, 'Reken uit: ' + T(it.c) + ' ' + X + ' ' + T(r) + '.', F(y, rnd(Math.sqrt(it.c * q)), 'Eerst de wortel, dan pas keer ' + T(it.c) + '.')));
      if (it.deel){ w = [T(x), T(q), T(r)]; ops = [': ' + it.deel, 'wortel']; }
      else { w = [T(x), T(r), T(y)]; ops = ['wortel', X + ' ' + T(it.c)]; }
    }
    function bl(n){ return ketting(w.map(function(t, i){ return i <= n ? t : ''; }), ops, null, labels(it.v, ops.length, it.L)); }
    return { vraag:it.L + ' bij ' + it.v + ' = ' + T(x), context:it.zin + ' ' + it.vr(x) + (rond ? ' Rond af op 1 decimaal.' : ''), antwoord:T(y), eenheid:it.eh, beeld:bl, zelfBeeld:'', stappen:st };
  }
  function mKwTerug(R){
    var it = R.kies(KWF), x = R.kies(it.vals), xx = rnd(x * x), Y = rnd(it.c * xx + it.k), r1 = rnd(Y - it.k), st = [];
    var w = [T(x), T(xx)].concat(it.k ? [T(r1)] : []).concat([it.geld ? eu(Y) : T(Y)]);
    var ops = ['kwadraat', X + ' ' + T(it.c)].concat(it.k ? ['+ ' + T(it.k)] : []), terug = ['wortel', ': ' + T(it.c)].concat(it.k ? [MIN + ' ' + T(it.k)] : []);
    function bl(n){ var m = w.length; return ketting(w.map(function(t, i){ return i >= m - 1 - n ? t : (i ? '' : '?'); }), ops, terug, labels(it.v, ops.length, it.L)); }
    if (it.k) st.push(S('Reken terug. Haal eerst ' + T(it.k) + ' eraf: ' + T(Y) + ' ' + MIN + ' ' + T(it.k) + ' =', r1, 'Het omgekeerde van + ' + T(it.k) + ' is ' + MIN + ' ' + T(it.k) + '.', F(r1, rnd(Y + it.k), 'Terugrekenen: + wordt ' + MIN + '.')));
    st.push(S((it.k ? 'Deel' : 'Reken terug. Deel eerst') + ' door ' + T(it.c) + ': ' + T(r1) + ' : ' + T(it.c) + ' =', xx, it.c === 0.01 ? 'Delen door 0,01 is hetzelfde als keer 100.' : 'Het omgekeerde van ' + X + ' ' + T(it.c) + ' is : ' + T(it.c) + '.',
      F(xx, rnd(r1 * it.c), 'Terugrekenen: keer wordt delen.')));
    st.push(S('Neem de wortel: √' + T(xx) + ' =', x, 'Het omgekeerde van een kwadraat is de wortel. Welk getal keer zichzelf is ' + T(xx) + '?', F(x, xx, 'Je moet nog de wortel nemen.', rnd(xx / 2), 'De wortel is niet de helft.', -x, 'Hier telt alleen het positieve getal.'),
      'Je neemt alleen de positieve wortel: een snelheid, tijd of lengte is niet negatief.'));
    return { vraag:it.L + ' = ' + (it.geld ? eu(Y) : T(Y)), context:it.zin + ' ' + it.tvr(Y), antwoord:T(x), eenheid:it.teh, beeld:bl, zelfBeeld:'', stappen:st };
  }
  function mWortelTerug(R){
    var it = R.kies(WTF), x = R.kies(it.vals), q = it.deel ? rnd(x / it.deel) : x, r = rnd(Math.sqrt(q)), Y = rnd(it.c * r), st = [], w, ops, terug;
    if (it.deel){ w = [T(x), T(q), T(Y)]; ops = [': ' + it.deel, 'wortel']; terug = [X + ' ' + it.deel, 'kwadraat']; }
    else { w = [T(x), T(r), T(Y)]; ops = ['wortel', X + ' ' + T(it.c)]; terug = ['kwadraat', ': ' + T(it.c)]; }
    function bl(n){ return ketting(w.map(function(t, i){ return i >= 2 - n ? t : (i ? '' : '?'); }), ops, terug, labels(it.v, 2, it.L)); }
    if (it.c !== 1) st.push(S('Reken terug. Deel eerst door ' + T(it.c) + ': ' + T(Y) + ' : ' + T(it.c) + ' =', r, 'Het omgekeerde van ' + X + ' ' + T(it.c) + ' is : ' + T(it.c) + '.', F(r, rnd(Y * it.c), 'Terugrekenen: keer wordt delen.')));
    st.push(S((it.c !== 1 ? 'Doe' : 'Reken terug. Doe eerst') + ' in het kwadraat: ' + T(r) + '² =', q, 'Het omgekeerde van de wortel is het kwadraat: ' + T(r) + ' ' + X + ' ' + T(r) + '.',
      F(q, rnd(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.', rnd(Math.sqrt(r)), 'Niet nog een keer de wortel: terug doe je het kwadraat.')));
    if (it.deel) st.push(S('Keer ' + it.deel + ': ' + T(q) + ' ' + X + ' ' + it.deel + ' =', x, 'Het omgekeerde van : ' + it.deel + ' is ' + X + ' ' + it.deel + '.', F(x, rnd(q / it.deel), 'Terugrekenen: delen wordt keer.')));
    return { vraag:it.L + ' = ' + T(Y), context:it.zin + ' ' + it.tvr(Y), antwoord:T(x), eenheid:it.teh, beeld:bl, zelfBeeld:'', stappen:st };
  }

  /* ================= formules combineren en eenheden ================= */
  var COMB = [
    { z1:'Een taxi legt in de stad in m minuten a = 0,5 · m km af.', z2:'De prijs in euro is K = 2,4 · a + 3,5.', L1:'a', c1:0.5, k1:0, v:'m', L2:'K', c2:2.4, k2:3.5, xs:[10, 12, 16, 20, 24, 30, 40], geld:true,
      vr:function(x){ return 'Wat kost een rit van ' + x + ' minuten?'; } },
    { z1:'Een auto verbruikt L = 0,06 · a liter benzine. Hierin is a het aantal gereden km.', z2:'De benzine kost K = 1,9 · L euro.', L1:'L', c1:0.06, k1:0, v:'a', L2:'K', c2:1.9, k2:0, xs:[100, 150, 200, 250, 300, 400, 500], geld:true,
      vr:function(x){ return 'Wat kost de benzine voor een rit van ' + x + ' km?'; } },
    { z1:'Voor een feest bestel je p = 0,5 · g + 2 pizza\'s. Hierin is g het aantal gasten.', z2:'De pizza\'s kosten samen K = 8 · p euro.', L1:'p', c1:0.5, k1:2, v:'g', L2:'K', c2:8, k2:0, xs:[10, 12, 16, 20, 24, 30, 36], geld:true,
      vr:function(x){ return 'Wat kosten de pizza\'s bij ' + x + ' gasten?'; } },
    { z1:'Een bakker bakt b = 40 · u broden. Hierin is u het aantal uur dat hij bakt.', z2:'Zijn kosten in euro zijn K = 0,6 · b + 25.', L1:'b', c1:40, k1:0, v:'u', L2:'K', c2:0.6, k2:25, xs:[2, 3, 4, 5, 6, 8], geld:true,
      vr:function(x){ return 'Wat zijn de kosten als hij ' + x + ' uur bakt?'; } },
    { z1:'Bij een schoolreis gaan b = 2 · n + 3 begeleiders mee. Hierin is n het aantal klassen.', z2:'De bus kost K = 15 · b + 120 euro.', L1:'b', c1:2, k1:3, v:'n', L2:'K', c2:15, k2:120, xs:[3, 4, 5, 6, 7, 8], geld:true,
      vr:function(x){ return 'Wat kost de bus als er ' + x + ' klassen meegaan?'; } },
    { z1:'Een zwembad wordt gevuld. Na t uur zit er W = 12 · t + 50 m³ water in.', z2:'Het water kost K = 1,5 · W euro.', L1:'W', c1:12, k1:50, v:'t', L2:'K', c2:1.5, k2:0, xs:[2, 3, 4, 5, 6, 8], geld:true,
      vr:function(x){ return 'Wat kost het water na ' + x + ' uur?'; } },
    { z1:'Een fietsenmaker repareert f = 3 · u fietsen in u uur.', z2:'Hij verdient V = 12 · f + 20 euro.', L1:'f', c1:3, k1:0, v:'u', L2:'V', c2:12, k2:20, xs:[2, 3, 4, 5, 6, 7], geld:true,
      vr:function(x){ return 'Hoeveel verdient hij als hij ' + x + ' uur werkt?'; } },
    { z1:'Een printer maakt p = 20 · m pagina\'s in m minuten.', z2:'Papier en inkt kosten K = 0,05 · p + 2 euro.', L1:'p', c1:20, k1:0, v:'m', L2:'K', c2:0.05, k2:2, xs:[3, 5, 8, 10, 12, 15], geld:true,
      vr:function(x){ return 'Wat kost het als de printer ' + x + ' minuten print?'; } } ];
  function vrm(c, v, k){ return E([[c, v], [k, '']]); }
  function mCombInvul(R){
    var it = R.kies(COMB), x = R.kies(it.xs), v1 = rnd(it.c1 * x + it.k1), v2 = rnd(it.c2 * v1 + it.k2);
    return { vraag:it.L2 + ' bij ' + it.v + ' = ' + x, context:it.z1 + ' ' + it.z2 + ' ' + it.vr(x), antwoord:it.geld ? [eu(v2), T(v2)] : T(v2), stappen:[
      S('Eerst ' + it.L1 + ': ' + T(it.c1) + ' ' + X + ' ' + x + (it.k1 ? ' ' + plus(it.k1) : '') + ' =', v1, 'Vul ' + it.v + ' = ' + x + ' in de formule voor ' + it.L1 + ' in.', F(v1, rnd(it.c2 * x + it.k2), 'Begin met de formule waar ' + it.v + ' in staat: die voor ' + it.L1 + '.')),
      S('Dan ' + it.L2 + ': ' + T(it.c2) + ' ' + X + ' ' + T(v1) + (it.k2 ? ' ' + plus(it.k2) : '') + ' =', v2, 'Vul ' + it.L1 + ' = ' + T(v1) + ' in de formule voor ' + it.L2 + ' in.',
        F(v2, rnd(it.c2 * x + it.k2), 'Vul ' + it.L1 + ' = ' + T(v1) + ' in, niet ' + it.v + ' = ' + x + '.', it.k2 ? rnd(it.c2 * v1) : null, 'Vergeet ' + plus(it.k2) + ' niet.')) ] };
  }
  function mCombFormule(R){
    var it = R.kies(COMB), e1 = vrm(it.c1, it.v, it.k1), sub = T(it.c2) + ' · ' + (it.k1 ? '(' + e1 + ')' : e1) + (it.k2 ? ' ' + plus(it.k2) : '');
    var a = rnd(it.c1 * it.c2), b = rnd(it.c2 * it.k1 + it.k2), e = vrm(a, it.v, b), f = it.L2 + ' = ' + e, st = [
      SC('Vervang ' + it.L1 + ' door ' + e1 + '. ' + it.L2 + ' =', sub, formC(it.L2, sub), 'Zet ' + (it.k1 ? '(' + e1 + ')' : e1) + ' op de plek van ' + it.L1 + ': ' + it.L2 + ' = ' + sub + '.') ];
    if (it.k1){
      st.push(S('Werk de haakjes weg. Het getal voor ' + it.v + ': ' + T(it.c2) + ' ' + X + ' ' + T(it.c1) + ' =', a, T(it.c2) + ' keer alles binnen de haakjes. Eerst ' + T(it.c2) + ' ' + X + ' ' + T(it.c1) + it.v + '.'));
      st.push(S('Het losse getal: ' + T(it.c2) + ' ' + X + ' ' + T(it.k1) + (it.k2 ? ' ' + plus(it.k2) : '') + ' =', b, 'Ook ' + T(it.k1) + ' gaat keer ' + T(it.c2) + '.' + (it.k2 ? ' Tel daarna ' + T(it.k2) + ' op.' : ''),
        F(b, rnd(it.k1 + it.k2), 'Ook ' + T(it.k1) + ' binnen de haakjes gaat keer ' + T(it.c2) + '.')));
    } else st.push(S('Het getal voor ' + it.v + ': ' + T(it.c2) + ' ' + X + ' ' + T(it.c1) + ' =', a, 'Vermenigvuldig de twee getallen: ' + T(it.c2) + ' ' + X + ' ' + T(it.c1) + '.'));
    st.push(SC('De formule: ' + it.L2 + ' =', e, formC(it.L2, e, { kaal:true }), 'Het getal voor ' + it.v + ' is ' + T(a) + (b ? ' en het losse getal is ' + T(b) : '') + ': ' + f + '.'));
    return { vraag:it.L2 + ' met ' + it.v, context:it.z1 + ' ' + it.z2 + ' Maak één formule voor ' + it.L2 + ' waar ' + it.v + ' in staat. Schrijf hem zoals ' + it.L2 + ' = 2,5' + it.v + ' + 10.', antwoord:f, controle:formC(it.L2, e, { kaal:true }), invoer:'tekst', stappen:st };
  }
  var WIE = [{ wie:'Een scooter', doe:'rijdt', vs:[25, 30, 40, 45] }, { wie:'Een fietser', doe:'fietst', vs:[12, 15, 16, 18, 20] }, { wie:'Een trein', doe:'rijdt', vs:[80, 100, 120, 140, 160] },
    { wie:'Een wandelaar', doe:'loopt', vs:[4, 5, 6] }, { wie:'Een auto', doe:'rijdt', vs:[50, 60, 80, 90, 100, 120] }];
  function mAfstand(R){
    var w = R.kies(WIE), v = R.kies(w.vs), m = R.kies([6, 12, 15, 18, 24, 30, 36, 45, 48, 54, 75, 90]), t = rnd(m / 60), s = rnd(v * t);
    return { vraag:v + ' km/u, ' + m + ' minuten', context:'De formule is s = v · t. Hierin is s de afstand in km, v de snelheid in km/u en t de tijd in uren. ' + w.wie + ' ' + w.doe + ' ' + v + ' km/u. Hoeveel km legt hij af in ' + m + ' minuten?', eenheid:'km', stappen:[
      K(R, 'In welke eenheid moet t in de formule?', 'in uren', [], 'De snelheid is in km per uur. Dan moet de tijd ook in uren.', { orde:['in minuten', 'in uren'] }),
      S('Reken om: ' + m + ' minuten = ' + m + ' : 60 =', t, 'Een uur heeft 60 minuten. Deel door 60.', F(t, rnd(m / 100), 'Een uur heeft 60 minuten, niet 100. Deel door 60.')),
      S('Vul in: s = ' + v + ' ' + X + ' ' + T(t) + ' =', s, 'Reken uit: ' + v + ' ' + X + ' ' + T(t) + '.', F(s, v * m, 'Je vulde de minuten in. Gebruik ' + T(t) + ' uur.', rnd(v * m / 100), 'Een uur heeft 60 minuten, niet 100.')) ] };
  }
  function mTijd(R){
    var w, v, t, s;
    do { w = R.kies(WIE); v = R.kies(w.vs); t = R.kies([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9, 1.25, 1.5, 2.5]); s = rnd(v * t); } while (rnd(s, 1) !== s);
    var m = rnd(t * 60);
    return { vraag:T(s) + ' km, ' + v + ' km/u', context:'De formule is t = s : v. Hierin is t de tijd in uren, s de afstand in km en v de snelheid in km/u. ' + w.wie + ' ' + w.doe + ' ' + T(s) + ' km met een snelheid van ' + v + ' km/u. Hoeveel minuten doet hij erover?', eenheid:'minuten', stappen:[
      S('Vul in: t = ' + T(s) + ' : ' + v + ' =', t, 'Reken uit: ' + T(s) + ' : ' + v + '. Dat is de tijd in uren.', F(t, rnd(v / s), 'Andersom: de afstand gedeeld door de snelheid.')),
      S('Van uren naar minuten: ' + T(t) + ' ' + X + ' 60 =', m, 'Een uur heeft 60 minuten. Doe keer 60.', F(m, rnd(t * 100), 'Een uur heeft 60 minuten, niet 100. Doe keer 60.')) ] };
  }
  var KOST = [
    { z:'Bellen kost K = 0,15 · m + 5. Hierin is K de prijs in euro en m het aantal minuten.', vs:[1, 1.5, 2, 2.5, 3, 4], geg:function(u){ return 'Je belt in een maand ' + T(u) + ' uur.'; }, eh:'in minuten', ehF:'in uren',
      om:function(u){ return [T(u) + ' uur = ' + T(u) + ' ' + X + ' 60 =', rnd(u * 60), 'Een uur is 60 minuten.', rnd(u * 100), 'Een uur heeft 60 minuten, niet 100.']; }, f:function(m){ return [0.15, m, 5]; }, L:'K', vr:'Hoeveel euro betaal je?' },
    { z:'Parkeren kost K = 0,04 · m. Hierin is K de prijs in euro en m het aantal minuten.', vs:[[1, 15], [1, 30], [2, 15], [2, 45], [3, 30], [4, 15]], geg:function(u){ return 'Je parkeert ' + u[0] + ' uur en ' + u[1] + ' minuten.'; }, eh:'in minuten', ehF:'in uren',
      om:function(u){ return [u[0] + ' uur en ' + u[1] + ' minuten = ' + u[0] + ' ' + X + ' 60 + ' + u[1] + ' =', u[0] * 60 + u[1], 'Een uur is 60 minuten. Tel de losse minuten erbij.', u[0] * 100 + u[1], 'Een uur heeft 60 minuten, niet 100.']; }, f:function(m){ return [0.04, m, 0]; }, L:'K', vr:'Hoeveel euro betaal je?' },
    { z:'Een taxirit kost K = 2,4 · a + 3,5. Hierin is K de prijs in euro en a de afstand in km.', vs:[2500, 3500, 4500, 6000, 7500, 12500], geg:function(u){ return 'De rit is ' + T(u, { punt:true }) + ' meter.'; }, eh:'in km', ehF:'in meter',
      om:function(u){ return [T(u, { punt:true }) + ' meter = ' + T(u, { punt:true }) + ' : 1000 =', rnd(u / 1000), '1 km is 1000 meter. Deel door 1000.', rnd(u / 100), 'Een km is 1000 meter, niet 100.']; }, f:function(a){ return [2.4, a, 3.5]; }, L:'K', vr:'Hoeveel euro kost de rit?' },
    { z:'Water kost per jaar K = 1,2 · w + 60. Hierin is K de prijs in euro en w het aantal m³ water.', vs:[45000, 60000, 75000, 85000, 110000, 125000], geg:function(u){ return 'Een gezin gebruikt dit jaar ' + T(u, { punt:true }) + ' liter water.'; }, eh:'in m³', ehF:'in liter',
      om:function(u){ return [T(u, { punt:true }) + ' liter = ' + T(u, { punt:true }) + ' : 1000 =', rnd(u / 1000), '1 m³ is 1000 liter. Deel door 1000.', rnd(u / 100), '1 m³ is 1000 liter, niet 100.']; }, f:function(w){ return [1.2, w, 60]; }, L:'K', vr:'Hoeveel euro betaalt het gezin?' } ];
  function mKosten(R){
    var na = !R.heel(0, 4);
    if (na){
      var n = R.kies([50, 75, 120, 150, 200, 250, 350]), p = R.kies([5, 8, 10, 12]), ct = n * p, e = rnd(ct / 100);
      return { vraag:n + ' kopieën', context:'Kopiëren kost K = ' + p + ' · n. Hierin is K de prijs in cent en n het aantal kopieën. Je maakt ' + n + ' kopieën. Hoeveel euro betaal je?', antwoord:[eu(e), T(e)], stappen:[
        K(R, 'In welke eenheid geeft de formule K?', 'in cent', [], 'Kijk in de tekst: K is de prijs in cent.', { orde:['in euro', 'in cent'] }),
        S('Vul in: K = ' + p + ' ' + X + ' ' + n + ' =', ct, 'Reken uit: ' + p + ' ' + X + ' ' + n + '. Dat is in cent.'),
        S('Van cent naar euro: ' + ct + ' : 100 =', e, '100 cent is 1 euro. Deel door 100.', F(e, ct, 'Dat is in cent. Deel door 100 voor euro.', rnd(ct / 1000), '100 cent is 1 euro, niet 1000.')) ] };
    }
    var it = R.kies(KOST), u = R.kies(it.vs), om = it.om(u), x = om[1], f = it.f(x), K0 = rnd(f[0] * x + f[2]);
    var subs = T(f[0]) + ' ' + X + ' ' + T(x) + (f[2] ? ' + ' + T(f[2]) : '');
    return { vraag:it.L + ' = ?', context:it.z + ' ' + it.geg(u) + ' ' + it.vr, antwoord:[eu(K0), T(K0)], stappen:[
      K(R, 'In welke eenheid moet je invullen?', it.eh, [], 'Kijk in de tekst bij de formule: daar staat de eenheid.', { orde:[it.ehF, it.eh] }),
      S('Reken om: ' + om[0], x, om[2], F(x, om[3], om[4])),
      S('Vul in: ' + it.L + ' = ' + subs + ' =', K0, 'Reken uit: ' + subs + '. Eerst keer, dan plus.', F(K0, rnd(f[0] * (Array.isArray(u) ? u[0] : u) + f[2]), 'Je vulde het getal in zonder om te rekenen.')) ] };
  }

  /* ================= vergelijkingen: inklemmen en de grafiek ================= */
  /* x komt twee keer voor, dus terugrekenen gaat niet */
  function famKies(R, soort){
    var s = soort || R.kies(['k', 'k', 'k2', 'c']), b;
    function bx(x){ return b === 1 ? T(x) : b + ' ' + X + ' ' + T(x); }
    if (s === 'k'){ b = R.heel(1, 8); return { f:function(x){ return rnd(x * x + b * x); }, t:E([[1, 'x²'], [b, 'x']]), kub:false,
      sub:function(x){ return T(x) + '² + ' + bx(x); }, hint:function(x){ return 'Eerst ' + T(x) + '² = ' + T(rnd(x * x)) + ', dan ' + bx(x) + ' = ' + T(rnd(b * x)) + '. Tel op.'; } }; }
    if (s === 'k2'){ b = R.heel(1, 9); return { f:function(x){ return rnd(2 * x * x + b * x); }, t:E([[2, 'x²'], [b, 'x']]), kub:false,
      sub:function(x){ return '2 ' + X + ' ' + T(x) + '² + ' + bx(x); }, hint:function(x){ return 'Eerst ' + T(x) + '² = ' + T(rnd(x * x)) + ', keer 2 is ' + T(rnd(2 * x * x)) + '. Dan ' + bx(x) + ' = ' + T(rnd(b * x)) + '. Tel op.'; } }; }
    b = R.heel(1, 4);
    return { f:function(x){ return rnd(x * x * x + b * x); }, t:E([[1, 'x³'], [b, 'x']]), kub:true,
      sub:function(x){ return T(x) + '³ + ' + bx(x); }, hint:function(x){ return 'Eerst ' + T(x) + '³ = ' + T(x) + ' ' + X + ' ' + T(x) + ' ' + X + ' ' + T(x) + ' = ' + T(rnd(x * x * x)) + ', dan ' + bx(x) + ' = ' + T(rnd(b * x)) + '. Tel op.'; } };
  }
  function zoek(f, c, lo, hi){ for (var i = 0; i < 80; i++){ var m = (lo + hi) / 2; if (f(m) < c) lo = m; else hi = m; } return (lo + hi) / 2; }
  function inklemTab(rij, c, n){
    return R0.teken.tabel([['x', 'uitkomst', 'vergeleken met ' + T(c)]].concat(rij.slice(0, n).map(function(r){ return [T(r[0]), T(r[1]), r[1] < c ? 'te klein' : 'te groot']; })), { kop:true });
  }
  function mInklemHeel(R){
    var fam, k, c, lo, hi;
    for (var p = 0; p < 300; p++){
      fam = famKies(R); k = fam.kub ? R.heel(3, 8) : R.heel(4, 14); lo = fam.f(k); hi = fam.f(k + 1);
      if (hi - lo < 4) continue;
      c = null;
      [100, 50, 10, 5].some(function(m){ var x = Math.floor(lo / m) * m + m; if (x < hi){ c = x; return true; } return false; });
      if (c == null || c === lo || R.heel(0, 3) === 0) c = lo + R.heel(1, hi - lo - 1);
      break;
    }
    var g1 = k - R.kies([1, 2]), g2 = k + 1 + R.kies([1, 2]), rij = [[g1, fam.f(g1)], [g2, fam.f(g2)], [k, lo], [k + 1, hi]];
    function bl(n){ return inklemTab(rij, c, n); }
    function stap(i, tekst, waarom){ return S(tekst + T(rij[i][0]) + ': ' + fam.sub(rij[i][0]) + ' =', rij[i][1], fam.hint(rij[i][0]), null, waarom); }
    return { vraag:fam.t + ' = ' + T(c), context:'Los op door in te klemmen: probeer steeds een andere hele x. De oplossing is positief. Tussen welke twee hele getallen ligt hij? Typ zoals 20 en 21.',
      antwoord:k + ' en ' + (k + 1), controle:paarC(k, k + 1), invoer:'tekst', beeld:bl, zelfBeeld:'', stappen:[
        stap(0, 'Probeer x = ', 'Minder dan ' + T(c) + ': x moet groter.'),
        stap(1, 'Probeer x = ', 'Meer dan ' + T(c) + ': x moet kleiner.'),
        stap(2, 'Probeer x = ', 'Nog steeds minder dan ' + T(c) + '.'),
        stap(3, 'Probeer x = ', 'Meer dan ' + T(c) + '. De oplossing ligt dus tussen ' + k + ' en ' + (k + 1) + '.'),
        SC('Dus de oplossing ligt tussen', k + ' en ' + (k + 1), paarC(k, k + 1), 'Bij x = ' + k + ' is het te klein en bij x = ' + (k + 1) + ' te groot.', F(k + ' en ' + (k + 1), (k - 1) + ' en ' + k, 'Bij x = ' + k + ' is het nog te klein.', (k + 1) + ' en ' + (k + 2), 'Bij x = ' + (k + 1) + ' is het al te groot.')) ] };
  }
  function inklemDec(R){
    var fam, c, s, a, d;
    for (var p = 0; p < 2000; p++){
      fam = famKies(R, R.kies(['k', 'k', 'c']));
      c = fam.kub ? R.heel(10, 600) : R.heel(10, 120);
      s = zoek(fam.f, c, 0, 20);
      if (s < 2 || s > 9) continue;
      a = Math.floor(s); d = Math.floor((s - a) * 10 + 1e-9);
      var fr = s * 10 - Math.floor(s * 10);
      if (d < 1 || d > 8 || fr < 0.08 || fr > 0.92 || randAfst(s, 1) < 0.08) continue;
      break;
    }
    var xl = rnd(a + d / 10, 1), xh = rnd(xl + 0.1, 1), xm = rnd(xl + 0.05, 2), r = rnd(s, 1), fm = fam.f(xm);
    var rij = [[a, fam.f(a)], [a + 1, fam.f(a + 1)], [xl, fam.f(xl)], [xh, fam.f(xh)], [xm, fm]];
    function bl(n){ return inklemTab(rij, c, n); }
    function stap(i, tekst, waarom){ return S(tekst + T(rij[i][0]) + ': ' + fam.sub(rij[i][0]) + ' =', rij[i][1], fam.hint(rij[i][0]), null, waarom); }
    return { vraag:fam.t + ' = ' + T(c), context:'Los op door in te klemmen. Rond af op 1 decimaal.', ctxKies:'Rond af op 1 decimaal.', antwoord:[T(r), 'x = ' + T(r)], controle:numC(r), beeld:bl, zelfBeeld:'', stappen:[
      stap(0, 'Probeer x = ', 'Minder dan ' + T(c) + '.'),
      stap(1, 'Probeer x = ', 'Meer dan ' + T(c) + '. De oplossing ligt tussen ' + a + ' en ' + (a + 1) + '.'),
      stap(2, 'Nu met één decimaal. Probeer x = ', 'Minder dan ' + T(c) + '.'),
      stap(3, 'Probeer x = ', 'Meer dan ' + T(c) + '. De oplossing ligt tussen ' + T(xl) + ' en ' + T(xh) + '.'),
      SC('Halverwege: x = ' + T(xm) + ' geeft ' + T(fm) + '. Rond af op 1 decimaal: x ≈', [T(r), 'x = ' + T(r)], numC(r),
        'Is ' + T(fm) + ' meer dan ' + T(c) + '? Dan ligt de oplossing onder ' + T(xm) + ' en rond je af op ' + T(xl) + '. Is het minder, dan rond je af op ' + T(xh) + '.',
        F(T(r), T(r === xl ? xh : xl), 'Vergelijk ' + T(fm) + ' met ' + T(c) + '. Ligt de oplossing boven of onder ' + T(xm) + '?')) ] };
  }
  function mInklemDec(R){ var m = inklemDec(R); delete m.ctxKies; return m; }
  function subLin(c, x){ return c === 1 ? paren(x) : c === -1 ? MIN + paren(x) : T(c) + ' ' + X + ' ' + paren(x); }
  function subKw(a, b, c, x){
    var s = (a === 1 ? '' : T(a) + ' ' + X + ' ') + paren(x) + '²';
    if (b) s += (b < 0 ? ' ' + MIN + ' ' : ' + ') + (Math.abs(b) === 1 ? '' : T(Math.abs(b)) + ' ' + X + ' ') + paren(x);
    if (c) s += ' ' + plus(c);
    return s;
  }
  function kwVorm(a, b, c){ return 'y = ' + E([[a, 'x²'], [b, 'x'], [c, '']]); }
  function grafVgl(R){
    var r1, r2, m, n, p, q, y1, y2, xv, yv, ok = false;
    for (var t = 0; t < 1000 && !ok; t++){
      r1 = R.heel(-3, 3); r2 = r1 + R.heel(2, 5); m = R.kies([0, 0, 0, 1, -1, 2]); n = R.heel(-3, 6);
      p = m - r1 - r2; q = r1 * r2 + n; y1 = m * r1 + n; y2 = m * r2 + n; xv = -p / 2; yv = q - p * p / 4;
      ok = r1 + r2 !== 0 && Math.abs(y1) <= 7 && Math.abs(y2) <= 7 && yv >= -9 && r2 <= 6 && !(m === 0 && n === 0 && R.heel(0, 1));
    }
    var links = E([[1, 'x²'], [p, 'x'], [q, '']]), rechts = m ? E([[m, 'x'], [n, '']]) : T(n);
    var f = function(x){ return x * x + p * x + q; }, g = function(x){ return m * x + n; };
    var x0 = Math.min(r1 - 2, -1), x1 = Math.max(r2 + 2, 1), y0 = Math.min(Math.floor(yv) - 1, -1, Math.min(y1, y2) - 1), y1w = Math.max(Math.max(y1, y2) + 3, 3);
    function bl(n2){ return parabool(f, x0, x1, y0, y1w, { lijnen:[{ f:g, k:3 }], punten:[].concat(n2 >= 2 ? [{ x:r1, y:y1, k:1 }] : [], n2 >= 3 ? [{ x:r2, y:y2, k:1 }] : []) }); }
    function sub(x){ return paren(x) + '²' + (p ? (p < 0 ? ' ' + MIN + ' ' : ' + ') + (Math.abs(p) === 1 ? '' : Math.abs(p) + ' ' + X + ' ') + paren(x) : '') + (q ? ' ' + plus(q) : ''); }
    var fout = m === 0 ? 'x = ' + T(n) : 'y = ' + E([[-m, 'x'], [n, '']]);
    return { vraag:links + ' = ' + rechts, context:'Los op met de grafiek. De grafieken van y = ' + links + ' en y = ' + rechts + ' staan hieronder. Schrijf je antwoord zoals x = ' + MIN + '5 of x = 7.',
      ctxKies:'De grafieken van beide kanten staan hieronder. Schrijf je antwoord zoals x = ' + MIN + '5 of x = 7.',
      antwoord:oplTekst([r1, r2]), controle:oplC([r1, r2]), invoer:'tekst', beeld:bl, zelfBeeld:bl(0), stappen:[
        K(R, 'Welke grafiek hoort bij de rechterkant, ' + rechts + '?', 'y = ' + rechts, [fout], 'De rechterkant wordt de formule y = ' + rechts + (m === 0 ? ': een horizontale lijn.' : ': een rechte lijn.')),
        S('Lees af: het linker snijpunt van de parabool en de lijn heeft x =', r1, 'Zoek het linker punt waar de twee grafieken elkaar snijden. Ga recht omlaag of omhoog naar de x-as.', F(r1, y1, 'Dat is de y van het snijpunt. Je zoekt de x.')),
        S('Het rechter snijpunt heeft x =', r2, 'Zoek het rechter snijpunt en lees de x af.', F(r2, y2, 'Dat is de y van het snijpunt. Je zoekt de x.')),
        S('Controleer x = ' + T(r2) + ' in de linkerkant: ' + sub(r2) + ' =', y2, 'Reken uit: eerst ' + paren(r2) + '² = ' + (r2 * r2) + '.', null, 'De rechterkant geeft bij x = ' + T(r2) + ' ook ' + T(y2) + '. Het klopt.'),
        SC('De oplossingen:', oplTekst([r1, r2]), oplC([r1, r2]), 'Twee snijpunten, dus twee oplossingen: ' + oplTekst([r1, r2]) + '.') ] };
  }
  function mGrafVgl(R){ var m = grafVgl(R); delete m.ctxKies; return m; }
  function terugGen(R){
    var a, x, k, c;
    do { a = R.kies([2, 3, 4, 5]); x = R.heel(2, 9); k = nz(R, -20, 20); c = a * x * x + k; } while (c <= 0);
    var ax = a * x * x;
    return { vraag:E([[a, 'x²'], [k, '']]) + ' = ' + T(c), context:'x is positief.', ctxKies:'x is positief.', antwoord:[T(x), 'x = ' + T(x)], stappen:[
      S((k > 0 ? 'Haal ' + k + ' eraf' : 'Tel ' + (-k) + ' erbij') + ': ' + T(c) + ' ' + plus(-k) + ' =', ax, 'Het omgekeerde van ' + plus(k) + ' is ' + plus(-k) + '.', F(ax, c + k, 'Terugrekenen: ' + (k > 0 ? '+ wordt ' + MIN + '.' : MIN + ' wordt +.'))),
      S('Deel door ' + a + ': ' + ax + ' : ' + a + ' =', x * x, 'Het omgekeerde van ' + X + ' ' + a + ' is : ' + a + '.'),
      S('Neem de wortel: √' + (x * x) + ' =', [T(x), 'x = ' + T(x)], 'Welk getal keer zichzelf is ' + (x * x) + '?', F(T(x), x * x, 'Je moet nog de wortel nemen.'), 'x is positief, dus alleen ' + x + '.') ] };
  }
  function mInklemKies(R){
    var s = R.heel(0, 2), m, juist, uitleg, opties = ['aflezen uit de grafiek', 'inklemmen', 'terugrekenen'];
    if (s === 0){ m = grafVgl(R); juist = opties[0]; uitleg = 'De grafieken van beide kanten zijn getekend en de snijpunten liggen precies op het rooster. Dan lees je ze af.'; }
    else if (s === 1){ m = inklemDec(R); juist = opties[1]; uitleg = 'x staat er twee keer in, dus terugrekenen gaat niet. Er is geen grafiek en je moet afronden: klem in.'; }
    else { m = terugGen(R); juist = opties[2]; uitleg = 'x staat er maar één keer in. Reken terug, dan krijg je meteen het precieze antwoord.'; }
    var o = { vraag:m.vraag, context:'Kies eerst de handigste manier. Los de vergelijking dan op. ' + m.ctxKies, antwoord:m.antwoord, invoer:m.invoer,
      beeld:function(n){ if (n < 1) return m.zelfBeeld || ''; return typeof m.beeld === 'function' ? m.beeld(n - 1) : (m.beeld || ''); },
      stappen:[K(R, 'Welke manier is hier het handigst?', juist, opties, uitleg, { waarom:uitleg, orde:opties })].concat(m.stappen) };
    if (m.controle) o.controle = m.controle;
    if (m.zelfBeeld) o.zelfBeeld = m.zelfBeeld;
    return o;
  }

  /* ================= kwadratische verbanden ================= */
  function mKwTabel(R){
    var a, b, c, xs = [-1, 0, 1, 2, 3], ys, f;
    do { a = R.kies([-2, -1, 1, 2]); b = nz(R, -6, 6); c = R.heel(-5, 8); f = function(x){ return a * x * x + b * x + c; }; ys = xs.map(f); } while (Math.max.apply(null, ys.map(Math.abs)) > 20);
    var volg = [0, 2, 3, 4];
    function tab(n){ return R0.teken.tabel([['x'].concat(xs.map(T)), ['y'].concat(ys.map(function(y, i){ return i === 1 || volg.indexOf(i) < n ? T(y) : ''; }))], { zijkop:true, nadruk:n >= 1 && n <= 4 ? [[1, volg[n - 1] + 1]] : [] }); }
    function bl(n){
      if (n < 4) return tab(n);
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), dy = hi - lo > 12 ? 2 : 1, y0 = Math.floor((lo - 1) / dy) * dy, y1 = Math.ceil((hi + 1) / dy) * dy;
      return stapel(tab(n), stelsel({ x0:-2, x1:4, dx:1, y0:Math.min(y0, -dy), y1:Math.max(y1, dy), dy:dy, ly:dy * (y1 - y0 > 16 ? 2 : 1), lijnen:[{ f:f, k:0 }], punten:xs.map(function(x, i){ return { x:x, y:ys[i], k:1 }; }) }));
    }
    var st = volg.map(function(i){
      var x = xs[i], y = ys[i], xx = x * x;
      var hint = 'Eerst het kwadraat: ' + paren(x) + '² = ' + xx + '.' + (a !== 1 ? ' Dan keer ' + T(a) + ': ' + T(a * xx) + '.' : '') + ' Dan ' + subLin(b, x) + ' = ' + T(b * x) + '.' + (c ? ' En dan ' + plus(c) + '.' : '');
      var fo = x === -1 ? F(y, -a + b * x + c, 'Let op: (' + MIN + '1)² = 1, want min keer min is plus.') : Math.abs(a) !== 1 ? F(y, a * a * xx + b * x + c, 'Eerst het kwadraat, dan pas keer ' + T(a) + '.') : null;
      return S('x = ' + T(x) + ': y = ' + subKw(a, b, c, x) + ' =', y, hint, fo);
    });
    return { vraag:kwVorm(a, b, c), context:'Maak de tabel af voor x = ' + MIN + '1 tot en met 3. Typ de hele rij y met puntkomma\'s ertussen, zoals 4; 1; 0; 1; 4.', antwoord:ys.map(T).join('; '), controle:rijC(ys), invoer:'tekst',
      beeld:bl, zelfBeeld:tab(0), stappen:st };
  }
  function mKwSoort(R){
    var a, b, c;
    do { a = R.kies([-3, -2, -1, 1, 2, 3, 0.5, -0.5]); b = nz(R, -6, 6); c = nz(R, -9, 9); } while (c === b || c === a || Math.abs(c) === Math.abs(b));
    var vorm = 'y = ' + E(R.hussel([[a, 'x²'], [b, 'x'], [c, '']])), soort = a > 0 ? 'dalparabool' : 'bergparabool', ander = a > 0 ? 'bergparabool' : 'dalparabool';
    var goed = soort + ' door ' + punt(0, c), fout = [ander + ' door ' + punt(0, c), soort + ' door ' + punt(0, b), ander + ' door ' + punt(0, b)];
    var eind = K(R, 'Welke beschrijving klopt?', goed, fout, 'Een ' + soort + ' (het getal voor x² is ' + (a > 0 ? 'positief' : 'negatief') + '), en bij x = 0 is y = ' + T(c) + '.');
    var f = function(x){ return a * x * x + b * x + c; };
    function bl(n){ return n < 4 ? '' : stelsel({ x0:-6, x1:6, dx:1, lx:2, y0:-12, y1:12, dy:2, ly:4, lijnen:[{ f:f, k:0 }], punten:[{ x:0, y:c, k:1, label:punt(0, c) }] }); }
    return { vraag:vorm, context:'Is de grafiek een dalparabool of een bergparabool? En waar snijdt hij de y-as?', opties:eind.opties, goed:eind.goed, beeld:bl, stappen:[
      S('Welk getal staat voor x²?', a, 'Zoek de term met x². Het getal ervoor hoort erbij, met het teken.', F(a, b, 'Dat is het getal voor x, niet voor x².', c, 'Dat is het losse getal.', -a, 'Let op het teken.')),
      K(R, 'Is het een dalparabool of een bergparabool?', soort, [ander], 'Het getal voor x² is ' + T(a) + '. ' + (a > 0 ? 'Positief: een dal, met de top als laagste punt.' : 'Negatief: een berg, met de top als hoogste punt.'), { orde:['dalparabool', 'bergparabool'] }),
      S('Het snijpunt met de y-as: vul x = 0 in. Dan is y =', c, 'Alles met x wordt 0. Alleen het losse getal blijft over.', F(c, a, 'Dat is het getal voor x². Bij x = 0 blijft alleen het losse getal over.', b, 'Dat is het getal voor x. Bij x = 0 blijft alleen het losse getal over.')),
      eind ] };
  }
  function kwSymData(R){
    var a, b, c, xs2, f, ys, xs = [0, 1, 2, 3, 4, 5, 6];
    for (var p = 0; p < 500; p++){ a = R.kies([1, 1, -1, -1, 2, -2]); xs2 = R.kies([2, 3, 4, 5, 6, 7]); b = -a * xs2; c = R.heel(-6, 9); f = (function(a, b, c){ return function(x){ return rnd(a * x * x + b * x + c); }; })(a, b, c); ys = xs.map(f); if (Math.max.apply(null, ys.map(Math.abs)) <= 40) break; }
    var xsym = xs2 / 2, kand = [];
    for (var x = 0; x < xsym; x++) if (xs2 - x <= 6) kand.push(x);
    var x1 = R.kies(kand), x2 = xs2 - x1;
    return { a:a, b:b, c:c, f:f, xs:xs, ys:ys, xsym:xsym, x1:x1, x2:x2, y1:ys[x1], yt:f(xsym) };
  }
  function symTab(d, n, extra){
    var nad = n >= 1 ? [[0, d.x1 + 1], [1, d.x1 + 1], [0, d.x2 + 1], [1, d.x2 + 1]] : [];
    if (extra && d.xsym === Math.round(d.xsym)) nad.push([0, d.xsym + 1], [1, d.xsym + 1]);
    return R0.teken.tabel([['x'].concat(d.xs.map(T)), ['y'].concat(d.ys.map(T))], { zijkop:true, nadruk:nad });
  }
  function mKwSymas(R){
    var d = kwSymData(R);
    return { vraag:'tabel ' + d.ys.map(T).join(' '), vraagHtml:'Wat is de symmetrieas?', context:'De tabel hoort bij een parabool. Bereken de symmetrieas. Schrijf hem zoals x = 4,5.', antwoord:['x = ' + T(d.xsym), T(d.xsym)], controle:numC(d.xsym), invoer:'tekst',
      beeld:function(n){ return symTab(d, n, n >= 2); }, zelfBeeld:symTab(d, 0), stappen:[
        S('Bij x = ' + d.x1 + ' is y = ' + T(d.y1) + '. Bij welke andere x is y ook ' + T(d.y1) + '?', d.x2, 'Zoek in de onderste rij nog een keer ' + T(d.y1) + '.'),
        SC('De symmetrieas ligt midden tussen ' + d.x1 + ' en ' + d.x2 + ': (' + d.x1 + ' + ' + d.x2 + ') : 2 =', [T(d.xsym), 'x = ' + T(d.xsym)], numC(d.xsym), 'Tel op en deel door 2: ' + (d.x1 + d.x2) + ' : 2.', F(T(d.xsym), d.x1 + d.x2, 'Deel nog door 2.')) ] };
  }
  function mKwTopTabel(R){
    var d = kwSymData(R), heel = d.xsym === Math.round(d.xsym), xx = rnd(d.xsym * d.xsym);
    var top = punt(d.xsym, d.yt), soort = d.a > 0 ? 'Het getal voor x² is positief: de top is het laagste punt.' : 'Het getal voor x² is negatief: de top is het hoogste punt.';
    return { vraag:kwVorm(d.a, d.b, d.c), context:'Hieronder staat de tabel bij deze formule. Bereken de top van de parabool. Schrijf hem zoals (4,5; ' + MIN + '2,25).', antwoord:top, controle:puntC(d.xsym, d.yt), invoer:'tekst',
      beeld:function(n){ return symTab(d, n, n >= 2); }, zelfBeeld:symTab(d, 0), stappen:[
        S('Bij x = ' + d.x1 + ' is y = ' + T(d.y1) + '. Bij welke andere x is y ook ' + T(d.y1) + '?', d.x2, 'Zoek in de onderste rij nog een keer ' + T(d.y1) + '.'),
        S('De symmetrieas: (' + d.x1 + ' + ' + d.x2 + ') : 2 =', d.xsym, 'Midden tussen ' + d.x1 + ' en ' + d.x2 + ': tel op en deel door 2.', F(d.xsym, d.x1 + d.x2, 'Deel nog door 2.')),
        heel ? S('De top ligt op de symmetrieas. Lees af: bij x = ' + T(d.xsym) + ' is y =', d.yt, 'Kijk in de tabel onder x = ' + T(d.xsym) + '.')
          : S('De top ligt op de symmetrieas. Vul x = ' + T(d.xsym) + ' in: y = ' + subKw(d.a, d.b, d.c, d.xsym) + ' =', d.yt,
            'Eerst ' + T(d.xsym) + '² = ' + T(xx) + (d.a !== 1 ? ', keer ' + T(d.a) + ' is ' + T(rnd(d.a * xx)) : '') + '. Dan ' + subLin(d.b, d.xsym) + ' = ' + T(rnd(d.b * d.xsym)) + '.' + (d.c ? ' En dan ' + plus(d.c) + '.' : ''),
            F(d.yt, d.y1, 'Dat is y bij x = ' + d.x1 + '. De top ligt bij x = ' + T(d.xsym) + '.')),
        SC('De top:', top, puntC(d.xsym, d.yt), 'Eerst x, dan y: ' + top + '.', F(top, punt(d.yt, d.xsym), 'Je draaide ze om. Eerst x, dan y.'), soort) ] };
  }
  function kwNulData(R){
    var a = R.kies([1, -1]), r1, r2;
    do { r1 = R.heel(-4, 3); r2 = r1 + R.heel(2, 6); } while (r2 > 5);
    var b = -a * (r1 + r2), c = a * r1 * r2, f = function(x){ return a * x * x + b * x + c; }, xsym = (r1 + r2) / 2, yt = rnd(f(xsym));
    var x0 = Math.min(r1 - 2, -1), x1 = Math.max(r2 + 2, 1), y0, y1;
    if (a > 0){ y0 = Math.floor(yt) - 1; y1 = 4; } else { y1 = Math.ceil(yt) + 1; y0 = -4; }
    return { a:a, b:b, c:c, f:f, r1:r1, r2:r2, xsym:xsym, yt:yt, plaat:function(pt){ return parabool(f, x0, x1, y0, y1, { punten:pt || [] }); } };
  }
  function mKwNul(R){
    var d = kwNulData(R), vorm = kwVorm(d.a, d.b, d.c), ant = punt(d.r1, 0) + ' en ' + punt(d.r2, 0);
    return { vraag:vorm, context:'Hieronder staat de grafiek van ' + vorm + '. Geef de snijpunten met de x-as. Schrijf ze zoals (' + MIN + '5, 0) en (6, 0).', antwoord:ant, controle:puntenC([[d.r1, 0], [d.r2, 0]]), invoer:'tekst',
      beeld:function(n){ return d.plaat([].concat(n >= 2 ? [{ x:d.r1, y:0, k:1 }] : [], n >= 3 ? [{ x:d.r2, y:0, k:1 }] : [])); }, zelfBeeld:d.plaat(), stappen:[
        K(R, 'Een snijpunt met de x-as ligt op de x-as. Daar is', 'y = 0', [], 'Op de x-as is de hoogte 0, dus y = 0.', { orde:['x = 0', 'y = 0'] }),
        S('Lees af: het linker snijpunt met de x-as heeft x =', d.r1, 'Zoek links waar de parabool de horizontale as kruist.'),
        S('Het rechter snijpunt heeft x =', d.r2, 'Zoek rechts waar de parabool de horizontale as kruist.'),
        S('Controleer met de formule: x = ' + T(d.r2) + ' geeft y = ' + subKw(d.a, d.b, d.c, d.r2) + ' =', 0, 'Reken uit: eerst ' + paren(d.r2) + '² = ' + (d.r2 * d.r2) + '. Komt er 0 uit, dan klopt het.'),
        SC('De snijpunten met de x-as:', ant, puntenC([[d.r1, 0], [d.r2, 0]]), 'Schrijf ze als punten: eerst x, dan y = 0. Dus ' + ant + '.', F(ant, punt(0, d.r1) + ' en ' + punt(0, d.r2), 'Eerst x, dan y.')) ] };
  }
  function mKwTopNul(R){
    var d = kwNulData(R), vorm = kwVorm(d.a, d.b, d.c), top = punt(d.xsym, d.yt), xx = rnd(d.xsym * d.xsym);
    return { vraag:vorm, context:'Hieronder staat de grafiek van ' + vorm + '. Bereken de top met de snijpunten met de x-as. Schrijf hem zoals (4,5; ' + MIN + '2,25).', antwoord:top, controle:puntC(d.xsym, d.yt), invoer:'tekst',
      beeld:function(n){ return d.plaat([].concat(n >= 1 ? [{ x:d.r1, y:0, k:1 }, { x:d.r2, y:0, k:1 }] : [], n >= 4 ? [{ x:d.xsym, y:d.yt, k:3 }] : [])); }, zelfBeeld:d.plaat(), stappen:[
        SC('Lees af bij welke x de parabool de x-as snijdt. Typ ze met en ertussen, zoals 2 en 6:', T(d.r1) + ' en ' + T(d.r2), paarC(d.r1, d.r2), 'Zoek de twee punten waar de parabool de horizontale as kruist.'),
        S('De symmetrieas ligt midden ertussen: (' + T(d.r1) + ' + ' + T(d.r2) + ') : 2 =', d.xsym, 'Tel de twee x-waarden op en deel door 2.', F(d.xsym, d.r1 + d.r2, 'Deel nog door 2.')),
        S('De top ligt op de symmetrieas. Vul x = ' + T(d.xsym) + ' in: y = ' + subKw(d.a, d.b, d.c, d.xsym) + ' =', d.yt,
          'Eerst ' + paren(d.xsym) + '² = ' + T(xx) + '.' + (d.a === -1 ? ' Met de min ervoor: ' + T(-xx) + '.' : '') + ' Dan ' + subLin(d.b, d.xsym) + ' = ' + T(rnd(d.b * d.xsym)) + '.' + (d.c ? ' En dan ' + plus(d.c) + '.' : ''),
          F(d.yt, -d.yt, 'Let op het teken.')),
        SC('De top:', top, puntC(d.xsym, d.yt), 'Eerst x, dan y: ' + top + '.', F(top, punt(d.yt, d.xsym), 'Je draaide ze om. Eerst x, dan y.')) ] };
  }

  /* ================= exponentiële groei verder ================= */
  var EXPP = [
    { t:function(p){ return 'Het bedrag op een spaarrekening groeit met ' + T(p) + '% per jaar.'; }, per:'jaar', mv:'jaar', ps:[2, 3, 4, 5, 6], ns:[3, 4, 5, 10] },
    { t:function(p){ return 'Het aantal bacteriën groeit met ' + T(p) + '% per uur.'; }, per:'uur', mv:'uur', ps:[10, 15, 20, 25, 30], ns:[3, 4, 5, 6] },
    { t:function(p){ return 'Een waterplant groeit elke dag met ' + T(p) + '%.'; }, per:'dag', mv:'dagen', ps:[5, 8, 10, 12, 15], ns:[7], naam:'week' },
    { t:function(p){ return 'Het aantal inwoners van een stad groeit met ' + T(p) + '% per jaar.'; }, per:'jaar', mv:'jaar', ps:[1, 2, 3], ns:[5, 10, 20] },
    { t:function(p){ return 'Het aantal volgers van een account groeit elke week met ' + T(p) + '%.'; }, per:'week', mv:'weken', ps:[4, 5, 6, 8], ns:[4, 8, 10] } ];
  function macht(g, n){ return T(g) + '^' + n; }
  function mExpPerioden(R){
    var it, p, n, g;
    for (var q = 0; q < 300; q++){ it = R.kies(EXPP); p = R.kies(it.ps); n = R.kies(it.ns); g = rnd(1 + p / 100); if (randAfst((Math.pow(g, n) - 1) * 100, 1) > 0.05) break; }
    var gn = rnd(Math.pow(g, n), 3), pr = rnd((gn - 1) * 100, 1), pPer = it.naam || n + ' ' + it.mv, pIn = it.naam ? 'een ' + it.naam : n + ' ' + it.mv;
    return { vraag:T(p) + '% per ' + it.per + ', ' + pIn, context:it.t(p) + ' Met hoeveel procent groeit het in ' + pIn + '? Rond af op 1 decimaal.', antwoord:T(pr), eenheid:'%', stappen:[
      S('De groeifactor per ' + it.per + ':', g, 'Een toename van ' + T(p) + '%: 1 + ' + T(rnd(p / 100)) + '.', F(g, p, 'Maak eerst een kommagetal: ' + T(p) + '% = ' + T(rnd(p / 100)) + '. Tel dat bij 1 op.', rnd(p / 100), 'Tel het nog bij 1 op.', rnd(1 - p / 100), 'Het groeit: de groeifactor is groter dan 1.')),
      S('In ' + pIn + ' doe je ' + n + ' keer ' + X + ' ' + T(g) + '. De groeifactor per ' + pPer + ' is ' + macht(g, n) + ' ≈ (rond af op 3 decimalen)', gn, 'Tik in: ' + T(g) + ' ^ ' + n + ' = ' + T(rnd(Math.pow(g, n), 6)) + '…',
        F(gn, rnd(g * n, 3), 'Je deed keer ' + n + '. Het moet tot de macht ' + n + ': ' + n + ' keer ' + X + ' ' + T(g) + '.', rnd(1 + n * p / 100, 3), 'Je telde de procenten op. Bij groei vermenigvuldig je met de groeifactor.')),
      S('De toename in procenten: (' + T(gn) + ' ' + MIN + ' 1) ' + X + ' 100 =', pr, 'Haal 1 eraf en doe keer 100: de komma twee plaatsen naar rechts.',
        F(pr, n * p, 'Je telde de procenten op. Dat is te weinig: er komt ook groei bovenop de groei.', rnd(gn * 100, 1), 'Haal eerst 1 eraf: dat is het deel dat erbij komt.')) ] };
  }
  var EXPA = [
    { t:function(p){ return 'Een auto wordt elk jaar ' + T(p) + '% minder waard.'; }, per:'jaar', mv:'jaar', ps:[10, 12, 15, 20, 25], ns:[2, 3, 4, 5, 6], wat:'de waarde' },
    { t:function(p){ return 'De hoeveelheid medicijn in je bloed neemt elk uur met ' + T(p) + '% af.'; }, per:'uur', mv:'uur', ps:[10, 15, 20, 25, 30], ns:[2, 3, 4, 5, 6], wat:'de hoeveelheid medicijn' },
    { t:function(p){ return 'Het aantal bijen in een gebied neemt elk jaar met ' + T(p) + '% af.'; }, per:'jaar', mv:'jaar', ps:[3, 4, 5, 8], ns:[5, 10], wat:'het aantal bijen' },
    { t:function(p){ return 'Een telefoon verliest elk jaar ' + T(p) + '% van zijn waarde.'; }, per:'jaar', mv:'jaar', ps:[20, 25, 30, 35], ns:[2, 3, 4], wat:'de waarde' },
    { t:function(p){ return 'Een gletsjer wordt elk jaar ' + T(p) + '% kleiner.'; }, per:'jaar', mv:'jaar', ps:[2, 3, 4], ns:[10, 20], wat:'de gletsjer' } ];
  function mExpAfname(R){
    var it, p, n, g;
    for (var q = 0; q < 300; q++){ it = R.kies(EXPA); p = R.kies(it.ps); n = R.kies(it.ns); g = rnd(1 - p / 100); if (randAfst(Math.pow(g, n) * 100, 1) > 0.05) break; }
    var gn = rnd(Math.pow(g, n), 3), over = rnd(gn * 100, 1), af = rnd(100 - over, 1);
    return { vraag:T(p) + '% af per ' + it.per + ', ' + n + ' ' + it.mv, context:it.t(p) + ' Met hoeveel procent is ' + it.wat + ' na ' + n + ' ' + it.mv + ' afgenomen? Rond af op 1 decimaal.', antwoord:T(af), eenheid:'%', stappen:[
      S('De groeifactor per ' + it.per + ':', g, 'Een afname van ' + T(p) + '%: 1 ' + MIN + ' ' + T(rnd(p / 100)) + '.', F(g, rnd(1 + p / 100), 'Het neemt af: de groeifactor is kleiner dan 1.', rnd(p / 100), 'Dat is het deel dat eraf gaat. Je houdt 1 ' + MIN + ' ' + T(rnd(p / 100)) + ' over.')),
      S('De groeifactor per ' + n + ' ' + it.mv + ': ' + macht(g, n) + ' ≈ (rond af op 3 decimalen)', gn, 'Tik in: ' + T(g) + ' ^ ' + n + ' = ' + T(rnd(Math.pow(g, n), 6)) + '…',
        F(gn, rnd(1 - n * p / 100, 3), 'Je haalde de procenten er ' + n + ' keer af. Vermenigvuldig ' + n + ' keer met ' + T(g) + '.', rnd(g * n, 3), 'Tot de macht ' + n + ', niet keer ' + n + '.')),
      S('Er is nog over, in procenten: ' + T(gn) + ' ' + X + ' 100 =', over, 'Keer 100: de komma twee plaatsen naar rechts.'),
      S('De afname: 100 ' + MIN + ' ' + T(over) + ' =', af, 'Wat er over is, haal je van 100% af.',
        F(af, n * p, 'Je telde de procenten op. Elk ' + it.per + ' gaat er ' + T(p) + '% af van wat er dan nog is, en dat wordt steeds minder.', over, 'Dat is wat er over is. De vraag is hoeveel eraf is.')) ] };
  }
  var TERUG = [
    { g:1.1, ns:[2, 3], bs:[1000, 2000, 3000, 5000, 10000], per:'jaar', mv:'jaar', eh:'inwoners', h:'Een toename van 10%: 1 + 0,1.',
      t:function(N, n){ return 'Het aantal inwoners van een dorp groeit al jaren met 10% per jaar. Nu zijn het er ' + T(N) + '. Hoeveel inwoners waren er ' + n + ' jaar geleden?'; } },
    { g:1.2, ns:[2, 3], bs:[500, 1000, 2500, 5000], per:'maand', mv:'maanden', eh:'bezoekers', h:'Een toename van 20%: 1 + 0,2.',
      t:function(N, n){ return 'Het aantal bezoekers van een website groeit al een tijd met 20% per maand. Deze maand zijn het er ' + T(N) + '. Hoeveel bezoekers waren er ' + n + ' maanden geleden?'; } },
    { g:1.05, ns:[2], bs:[400, 800, 1200, 2000, 4000], per:'jaar', mv:'jaar', eh:'', geld:true, h:'Een toename van 5%: 1 + 0,05.',
      t:function(N, n){ return 'Een bedrag staat op een spaarrekening met 5% rente per jaar. Nu staat er ' + G(N) + ' op. Hoeveel stond er ' + n + ' jaar geleden op?'; } },
    { g:2, ns:[2, 3, 4], bs:[25, 40, 50, 75, 100, 150], per:'uur', mv:'uur', eh:'bacteriën', h:'Verdubbelen is keer 2.',
      t:function(N, n){ return 'Het aantal bacteriën verdubbelt elk uur. Nu zijn het er ' + T(N) + '. Hoeveel waren het er ' + n + ' uur geleden?'; } },
    { g:1.5, ns:[2, 3], bs:[16, 32, 80, 200, 400], per:'week', mv:'weken', eh:'cm²', h:'Een toename van 50%: 1 + 0,5.',
      t:function(N, n){ return 'Een plant in een vijver groeit elke week met 50%. Nu bedekt hij ' + T(N) + ' cm². Hoeveel cm² was het ' + n + ' weken geleden?'; } },
    { g:0.8, ns:[2, 3], bs:[625, 1250, 2500, 5000], per:'jaar', mv:'jaar', eh:'', geld:true, h:'Een afname van 20%: 1 ' + MIN + ' 0,2.',
      t:function(N, n){ return 'Een scooter wordt elk jaar 20% minder waard. Nu is hij ' + G(N) + ' waard. Wat was hij ' + n + ' jaar geleden waard?'; } },
    { g:0.9, ns:[2], bs:[500, 1000, 2000, 5000], per:'jaar', mv:'jaar', eh:'vissen', h:'Een afname van 10%: 1 ' + MIN + ' 0,1.',
      t:function(N, n){ return 'Het aantal vissen in een meer neemt elk jaar met 10% af. Nu zijn het er ' + T(N) + '. Hoeveel waren het er ' + n + ' jaar geleden?'; } },
    { g:0.5, ns:[2, 3, 4], bs:[400, 800, 1000, 1600], per:'uur', mv:'uur', eh:'mg', h:'Halveren is keer 0,5.',
      t:function(N, n){ return 'De hoeveelheid medicijn in je bloed halveert elk uur. Nu is het ' + T(N) + ' mg. Hoeveel mg was het ' + n + ' uur geleden?'; } } ];
  function mExpTerug(R){
    var it = R.kies(TERUG), n = R.kies(it.ns), b = R.kies(it.bs), gn = rnd(Math.pow(it.g, n)), N = rnd(b * gn), keten = [];
    for (var i = 0; i < n; i++) keten.push(T(it.g));
    return { vraag:'nu ' + (it.geld ? G(N) : T(N)) + ', ' + n + ' ' + it.mv + ' terug', context:it.t(N, n), antwoord:it.geld ? [eu(b), T(b)] : T(b), eenheid:it.eh, stappen:[
      S('De groeifactor per ' + it.per + ':', it.g, it.h, F(it.g, rnd(2 - it.g), it.g > 1 ? 'Het groeit: de groeifactor is groter dan 1.' : 'Het neemt af: de groeifactor is kleiner dan 1.')),
      S('Terug in de tijd deel je ' + n + ' keer door ' + T(it.g) + '. In één keer: delen door ' + macht(it.g, n) + ' =', gn, 'Reken uit: ' + keten.join(' ' + X + ' ') + '.', F(gn, rnd(it.g * n), 'Tot de macht ' + n + ', niet keer ' + n + '.')),
      S(T(N) + ' : ' + T(gn) + ' =', b, 'Deel wat er nu is door ' + T(gn) + '.', F(b, rnd(N * gn, 2), 'Terug in de tijd moet je delen, niet keer.')) ] };
  }
  var GRENS = [
    { t:function(b, p){ return 'Een stad heeft ' + T(b) + ' inwoners. Het aantal groeit met ' + T(p) + '% per jaar.'; }, toe:true, per:'jaar', mv:'jaar', mvH:'jaren', hoev:'het aantal inwoners', eh:'', bs:[12000, 15000, 20000, 24000, 30000], ps:[2, 3, 4, 5] },
    { t:function(b, p){ return 'Op een kweekplaat zitten ' + T(b) + ' bacteriën. Het aantal groeit met ' + T(p) + '% per uur.'; }, toe:true, per:'uur', mv:'uur', mvH:'uren', hoev:'het aantal bacteriën', eh:'', bs:[200, 300, 500, 800], ps:[20, 25, 30, 40, 50] },
    { t:function(b, p){ return 'Een account heeft ' + T(b) + ' volgers. Het aantal groeit elke maand met ' + T(p) + '%.'; }, toe:true, per:'maand', mv:'maanden', mvH:'maanden', hoev:'het aantal volgers', eh:'', bs:[400, 600, 900, 1500], ps:[10, 12, 15, 20] },
    { t:function(b, p){ return 'Na een injectie zit er ' + T(b) + ' mg medicijn in je bloed. Elk uur neemt dat met ' + T(p) + '% af.'; }, toe:false, per:'uur', mv:'uur', mvH:'uren', hoev:'de hoeveelheid medicijn', eh:' mg', bs:[200, 300, 400, 500], ps:[10, 15, 20, 25] },
    { t:function(b, p){ return 'In een meer leven ' + T(b) + ' vissen. Door vervuiling neemt het aantal elk jaar met ' + T(p) + '% af.'; }, toe:false, per:'jaar', mv:'jaar', mvH:'jaren', hoev:'het aantal vissen', eh:'', bs:[2000, 3000, 5000, 8000], ps:[5, 8, 10, 12] } ];
  function mExpGrens(R){
    var it, b, p, g, k, Gr, dubbel, N;
    function goed(x){ return randAfst(x, 0) > 0.05 && Math.abs(x - Gr) > 0.6 + 0.002 * Gr; }
    for (var q = 0; q < 2000; q++){
      it = R.kies(GRENS); b = R.kies(it.bs); p = R.kies(it.ps); g = rnd(it.toe ? 1 + p / 100 : 1 - p / 100);
      N = function(t){ return b * Math.pow(g, t); };
      dubbel = it.toe && !R.heel(0, 2);
      if (dubbel){ Gr = 2 * b; for (k = 1; k < 40 && N(k) <= Gr; k++); }
      else {
        k = R.heel(3, 12); var lo = Math.min(N(k - 1), N(k)), hi = Math.max(N(k - 1), N(k)), marge = 0.6 + 0.002 * hi; Gr = null;
        [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5].some(function(u){ var c = Math.ceil((lo + marge) / u) * u; if (c < hi - marge){ Gr = c; return true; } return false; });
        if (Gr == null) continue;
      }
      if (k < 3 || k > 14 || !goed(N(k - 1)) || !goed(N(k))) continue;
      break;
    }
    var n1 = Math.round(N(k - 1)), n2 = Math.round(N(k)), woord = it.toe ? 'meer' : 'minder';
    var vraagZin = dubbel ? ' Na hoeveel hele ' + it.mvH + ' is ' + it.hoev + ' voor het eerst meer dan verdubbeld, dus meer dan ' + T(Gr) + '?' : ' Na hoeveel hele ' + it.mvH + ' is ' + it.hoev + ' voor het eerst ' + woord + ' dan ' + T(Gr) + it.eh + '?';
    function probeer(t, nr, waarom){ return S('Probeer t = ' + t + ': ' + T(b) + ' ' + X + ' ' + macht(g, t) + ' ≈ (rond af op een heel getal)', nr, 'Tik in: ' + T(b) + ' ' + X + ' ' + T(g) + ' ^ ' + t + ' = ' + T(rnd(N(t), 3)) + '…', F(nr, Math.round(b * g * t), 'Tot de macht ' + t + ', niet keer ' + t + '.'), waarom); }
    return { vraag:T(b) + ' ' + X + ' ' + T(g) + '^t, grens ' + T(Gr), context:it.t(b, p) + vraagZin, antwoord:T(k), eenheid:it.mv, stappen:[
      S('De groeifactor per ' + it.per + ':', g, (it.toe ? 'Een toename van ' + T(p) + '%: 1 + ' : 'Een afname van ' + T(p) + '%: 1 ' + MIN + ' ') + T(rnd(p / 100)) + '.', F(g, rnd(it.toe ? 1 - p / 100 : 1 + p / 100), it.toe ? 'Het groeit: de groeifactor is groter dan 1.' : 'Het neemt af: de groeifactor is kleiner dan 1.')),
      probeer(k - 1, n1, 'Nog niet ' + woord + ' dan ' + T(Gr) + '.'),
      probeer(k, n2, 'Nu wel ' + woord + ' dan ' + T(Gr) + '.'),
      S('Dus na hoeveel ' + it.mvH + ' is het voor het eerst ' + woord + ' dan ' + T(Gr) + '?', k, 'Bij t = ' + (k - 1) + ' nog niet, bij t = ' + k + ' wel.', F(k, k - 1, 'Bij t = ' + (k - 1) + ' is het nog niet ' + woord + ' dan ' + T(Gr) + '.', k + 1, 'Bij t = ' + k + ' is het al ' + woord + ' dan ' + T(Gr) + '.')) ] };
  }

  /* ================= grafieken in de praktijk ================= */
  var DAG = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  var REEKS = [
    { wat:'het aantal leden van een sportclub', kop:'leden', tkop:'jaar', op:'in', units:[5, 10], starts:[80, 120, 150, 200], s0:[2017, 2018, 2019], lab:function(i, s){ return String(s + i); } },
    { wat:'het aantal bezoekers van een museum, in duizenden', kop:'bezoekers (× 1000)', tkop:'jaar', op:'in', units:[1, 2], starts:[20, 30, 45, 60], s0:[2016, 2017, 2018], lab:function(i, s){ return String(s + i); } },
    { wat:'de temperatuur in een kas in °C', kop:'temperatuur (°C)', tkop:'tijd', op:'om', units:[1, 2], starts:[12, 15, 18], s0:[7, 8, 9, 10], lab:function(i, s){ return (s + i) + ':00'; } },
    { wat:'het aantal fietsen in een stalling', kop:'fietsen', tkop:'tijd', op:'om', units:[10, 20], starts:[40, 60, 100], s0:[7, 8], lab:function(i, s){ return (s + i) + ':00'; } },
    { wat:'de waterstand van een rivier in cm', kop:'waterstand (cm)', tkop:'dag', op:'op', units:[5, 10], starts:[300, 350, 400], s0:[0], lab:function(i){ return DAG[i]; } } ];
  /* k perioden; d = toenames (geen 0); vals blijven positief */
  function reeks(R, k, maakD){
    var it, u, v0, d, vals, s0;
    for (var p = 0; p < 500; p++){
      it = R.kies(REEKS); u = R.kies(it.units); v0 = R.kies(it.starts); s0 = R.kies(it.s0);
      var ruw = maakD ? maakD(R, k) : (function(){ var l = []; for (var i = 0; i < k; i++) l.push(nz(R, -4, 6)); return l; })();
      if (!ruw) continue;
      d = ruw.map(function(x){ return x * u; });
      vals = [v0]; d.forEach(function(x){ vals.push(vals[vals.length - 1] + x); });
      if (Math.min.apply(null, vals) > 0) break;
    }
    var labs = []; for (var i = 0; i <= k; i++) labs.push(it.lab(i, s0));
    return { it:it, u:u, d:d, vals:vals, labs:labs };
  }
  function reeksTab(r, n){ return R0.teken.tabel([[r.it.tkop].concat(r.labs), [r.it.kop].concat(r.vals.map(T))], { zijkop:true, nadruk:n || [] }); }
  function periode(r, i){ return 'van ' + r.labs[i] + ' tot ' + r.labs[i + 1]; }
  function lijnGraf(r){
    var lo = Math.min.apply(null, r.vals), hi = Math.max.apply(null, r.vals), u = r.u, y0 = Math.max(0, Math.floor(lo / u) * u - u), y1 = Math.ceil(hi / u) * u + u, ly = u;
    while ((y1 - y0) / ly > 10) ly *= 2;
    return stelsel({ x0:0, x1:r.labs.length - 1, dx:1, xt:function(v){ return r.labs[v]; }, y0:y0, y1:y1, dy:u, ly:ly, ynaam:r.it.kop, poly:r.vals.map(function(v, i){ return [i, v]; }) });
  }
  function mToename(R){
    var r = reeks(R, 4), d = r.d;
    function bl(n){ return stapel(reeksTab(r), toenameDiagram(r.labs, d, n, r.u, 'toename')); }
    return { vraag:r.it.kop + ': ' + r.vals.map(T).join(' '), vraagHtml:'Maak het toenamediagram', context:'In de tabel zie je ' + r.it.wat + '. Bereken de toenames voor het toenamediagram. Typ ze met puntkomma\'s ertussen, zoals +5; ' + MIN + '10; +20.',
      antwoord:d.map(metTeken).join('; '), controle:rijC(d), invoer:'tekst', beeld:bl, zelfBeeld:reeksTab(r), stappen:d.map(function(x, i){
        return S(periode(r, i).replace(/^v/, 'V') + ': ' + T(r.vals[i + 1]) + ' ' + MIN + ' ' + T(r.vals[i]) + ' =', antP(x), 'Nieuw min oud: ' + T(r.vals[i + 1]) + ' ' + MIN + ' ' + T(r.vals[i]) + '.' + (x < 0 ? ' Het werd minder, dus de toename is negatief.' : ''),
          F(antP(x), -x, x < 0 ? 'Het werd minder: de toename is negatief.' : 'Doe nieuw min oud.'));
      }) };
  }
  function mLezen(R){
    var r = reeks(R, 4), d = r.d, j = R.kies([2, 3, 4]), som = 0, it = r.it;
    for (var i = 0; i < j; i++) som += d[i];
    var plaat = toenameDiagram(r.labs, d, 4, r.u, 'toename ' + it.kop), st = [
      S('Lees de eerste staaf af. De toename ' + periode(r, 0) + ' is', antP(d[0]), 'Kijk hoe hoog of hoe diep de staaf gaat. Onder de nullijn is het een afname, met een min ervoor.', F(antP(d[0]), -d[0], 'Let op: onder de nullijn is een afname, boven de nullijn een toename.')),
      S('Lees de staven tot ' + r.labs[j] + ' af en tel alle ' + j + ' toenames op:', som, 'De toenames zijn ' + d.slice(0, j).map(metTeken).join(', ') + '. Tel ze op.', F(som, d.slice(0, j).reduce(function(a, x){ return a + Math.abs(x); }, 0), 'Een staaf onder de nullijn telt als min.')),
      S(it.op.charAt(0).toUpperCase() + it.op.slice(1) + ' ' + r.labs[j] + ': ' + T(r.vals[0]) + ' ' + plus(som) + ' =', r.vals[j], 'Begin bij ' + T(r.vals[0]) + ' en tel de toename erbij op.', F(r.vals[j], som, 'Dat is alleen de toename. Tel de beginwaarde ' + T(r.vals[0]) + ' erbij.')) ];
    return { vraag:it.kop + ' ' + it.op + ' ' + r.labs[j] + '?', context:'Het toenamediagram hoort bij ' + it.wat + '. ' + it.op.charAt(0).toUpperCase() + it.op.slice(1) + ' ' + r.labs[0] + ' was het ' + T(r.vals[0]) + '. Hoeveel was het ' + it.op + ' ' + r.labs[j] + '?',
      beeld:plaat, zelfBeeld:plaat, stappen:st };
  }
  function mGrootste(R){
    var af = !R.heel(0, 2), r = reeks(R, 5, function(R2, k){
      var l = []; for (var i = 0; i < k; i++) l.push(nz(R2, -4, 6));
      var doel = af ? Math.min.apply(null, l) : Math.max.apply(null, l), tel = l.filter(function(x){ return x === doel; }).length;
      if (tel !== 1 || (af && (doel >= 0 || l.filter(function(x){ return x < 0; }).length < 2)) || (!af && doel <= 0)) return null;
      return l;
    });
    var d = r.d, doel = af ? Math.min.apply(null, d) : Math.max.apply(null, d), i0 = d.indexOf(doel), opties = d.map(function(x, i){ return periode(r, i); }), woord = af ? 'afname' : 'toename';
    var eind = K(R, 'In welke periode is de ' + woord + ' het grootst?', opties[i0], opties.filter(function(x, i){ return i !== i0; }), 'De grootste ' + woord + ' is ' + metTeken(doel) + ', ' + opties[i0] + '.', { orde:opties });
    return { vraag:r.it.kop + ': ' + r.vals.map(T).join(' '), vraagHtml:'Waar is de ' + woord + ' het grootst?', context:'In de tabel en de grafiek zie je ' + r.it.wat + '. In welke periode is de ' + woord + ' het grootst?',
      opties:eind.opties, goed:eind.goed, beeld:stapel(reeksTab(r), lijnGraf(r)), zelfBeeld:stapel(reeksTab(r), lijnGraf(r)), stappen:[
        SC('Bereken alle toenames, nieuw min oud, met puntkomma\'s ertussen:', d.map(metTeken).join('; '), rijC(d), 'De eerste: ' + T(r.vals[1]) + ' ' + MIN + ' ' + T(r.vals[0]) + ' = ' + metTeken(d[0]) + '. Doe zo alle ' + d.length + ' perioden.'),
        eind ] };
  }
  var GEM = [
    { wat:'De prijs van een huis, in duizenden euro', kop:'prijs (× € 1000)', tkop:'jaar', ts:[2008, 2012, 2015, 2018, 2020, 2024], per:'jaar', toe:true, starts:[180, 200, 240, 260], d:[3, 12], jr:true },
    { wat:'De lengte van een boom in cm', kop:'lengte (cm)', tkop:'jaar', ts:[2010, 2013, 2016, 2018, 2021, 2025], per:'jaar', toe:true, starts:[120, 150, 200], d:[10, 40], jr:true },
    { wat:'De temperatuur van een kop thee in °C', kop:'temperatuur (°C)', tkop:'tijd (min)', ts:[0, 2, 5, 8, 12, 15], per:'minuut', toe:false, starts:[80, 85, 90], d:[1, 4] },
    { wat:'De lading van een telefoonaccu in procent', kop:'lading (%)', tkop:'tijd (uur)', ts:[0, 1, 3, 4, 6, 8], per:'uur', toe:false, starts:[100], d:[5, 10] },
    { wat:'Het aantal inwoners van een dorp', kop:'inwoners', tkop:'jaar', ts:[2000, 2005, 2010, 2014, 2020, 2024], per:'jaar', toe:true, starts:[3000, 4500, 6000], d:[20, 90], jr:true },
    { wat:'Het aantal inwoners van een dorp', kop:'inwoners', tkop:'jaar', ts:[2000, 2005, 2010, 2014, 2020, 2024], per:'jaar', toe:false, starts:[3000, 4500, 6000], d:[20, 90], jr:true } ];
  function mGemiddeld(R){
    var it, vals, i, j, dv, dt, gem, ans;
    for (var p = 0; p < 500; p++){
      it = R.kies(GEM); vals = [R.kies(it.starts)];
      for (var k = 1; k < it.ts.length; k++){ var stap = R.heel(it.d[0], it.d[1]) * (it.ts[k] - it.ts[k - 1]); vals.push(vals[k - 1] + (it.toe ? stap : -stap)); }
      if (Math.min.apply(null, vals) <= 0) continue;
      i = R.heel(0, 3); j = R.heel(i + 2, it.ts.length - 1);
      dv = vals[j] - vals[i]; dt = it.ts[j] - it.ts[i]; gem = Math.abs(dv) / dt;
      if (randAfst(gem, 1) < 0.05) continue;
      break;
    }
    ans = rnd(gem, 1);
    var woord = it.toe ? 'toename' : 'afname', tl = function(t){ return it.jr ? String(t) : 't = ' + t; }, kort = it.kop.split(' (')[0];
    return { vraag:'gemiddelde ' + woord + ' per ' + it.per, context:it.wat + ' staat in de tabel. Bereken de gemiddelde ' + woord + ' per ' + it.per + ' van ' + tl(it.ts[i]) + ' tot ' + tl(it.ts[j]) + '. Rond af op 1 decimaal.',
      antwoord:T(ans), beeld:reeksTabG(it, vals, [i, j]), zelfBeeld:reeksTabG(it, vals, []), stappen:[
        S('Verschil in ' + kort + ': ' + T(vals[j]) + ' ' + MIN + ' ' + T(vals[i]) + ' =', dv, 'De latere waarde min de eerdere.' + (dv < 0 ? ' Het werd minder, dus het verschil is negatief.' : ''), F(dv, -dv, 'Doe de latere waarde min de eerdere.')),
        S('Verschil in tijd: ' + T(it.ts[j]) + ' ' + MIN + ' ' + T(it.ts[i]) + ' =', dt, 'Kijk in de bovenste rij.'),
        S('Gemiddelde ' + woord + ' per ' + it.per + ': ' + T(Math.abs(dv)) + ' : ' + dt + ' ≈ (rond af op 1 decimaal)', ans, 'Deel het verschil in ' + kort + ' door het verschil in tijd: ' + T(Math.abs(dv)) + ' : ' + dt + ' = ' + T(rnd(gem, 4)) + '…',
          F(ans, -ans, 'Bij een afname schrijf je het getal zonder min.', rnd(dt / Math.abs(dv), 1), 'Andersom: het verschil in ' + kort + ' gedeeld door het verschil in tijd.', Math.abs(dv), 'Deel nog door het verschil in tijd: ' + dt + '.')) ] };
  }
  function reeksTabG(it, vals, nad){ var n = []; nad.forEach(function(c){ n.push([0, c + 1], [1, c + 1]); }); return R0.teken.tabel([[it.tkop].concat(it.ts.map(String)), [it.kop].concat(vals.map(T))], { zijkop:true, nadruk:n }); }
  var SOORT = ['toenemend stijgend', 'afnemend stijgend', 'lineair stijgend', 'toenemend dalend', 'afnemend dalend', 'lineair dalend'];
  function mStijgen(R){
    var s = R.heel(0, 5), stijg = s < 3, vorm = s % 3;
    var r = reeks(R, 4, function(R2, k){
      var m = [], i;
      if (vorm === 2){ var c = R2.heel(2, 6); for (i = 0; i < k; i++) m.push(c); }
      else { m.push(R2.heel(1, 3)); for (i = 1; i < k; i++) m.push(m[i - 1] + R2.heel(1, 3)); if (vorm === 1) m.reverse(); }
      return m.map(function(x){ return stijg ? x : -x; });
    });
    var d = r.d, stap = ['ze worden steeds groter', 'ze worden steeds kleiner', 'ze blijven even groot'][vorm];
    var eind = K(R, 'Dus de grafiek is', SOORT[s], [], (stijg ? 'Stijgend' : 'Dalend') + ', en ' + stap.replace('ze ', 'de stappen ') + ': ' + SOORT[s] + '.', { orde:SOORT });
    return { vraag:r.it.kop + ': ' + r.vals.map(T).join(' '), vraagHtml:'Hoe stijgt of daalt de grafiek?', context:'In de tabel en de grafiek zie je ' + r.it.wat + '. Welke vorm heeft de grafiek: toenemend, afnemend of lineair, en stijgend of dalend?',
      opties:eind.opties, goed:eind.goed, beeld:stapel(reeksTab(r), lijnGraf(r)), zelfBeeld:stapel(reeksTab(r), lijnGraf(r)), stappen:[
        SC('Bereken de toenames, nieuw min oud, met puntkomma\'s ertussen:', d.map(metTeken).join('; '), rijC(d), 'De eerste: ' + T(r.vals[1]) + ' ' + MIN + ' ' + T(r.vals[0]) + ' = ' + metTeken(d[0]) + '. Doe zo alle vier.'),
        K(R, 'Stijgt of daalt de grafiek?', stijg ? 'stijgend' : 'dalend', [], stijg ? 'De toenames zijn positief: het wordt steeds meer.' : 'De toenames zijn negatief: het wordt steeds minder.', { orde:['stijgend', 'dalend'] }),
        K(R, 'Kijk naar de stappen zonder minteken: ' + d.map(function(x){ return T(Math.abs(x)); }).join(', ') + '. Wat zie je?', stap, [], 'Vergelijk de stappen: ' + d.map(function(x){ return T(Math.abs(x)); }).join(', ') + '.', { orde:['ze worden steeds groter', 'ze worden steeds kleiner', 'ze blijven even groot'] }),
        eind ] };
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ---------- lineaire formules ---------- */
    { groep:{ id:'wvm-a-lin', niveau:'vmbo', domein:'verbanden', naam:'Lineaire formules opstellen',
        uit:'Bij een lineair verband hoort een rechte lijn en een formule zoals K = 2,5a + 10. Je berekent het hellingsgetal, stelt de formule op bij een tabel, een grafiek of een verhaal, en rekent terug. De formule van een lijn door twee punten staat bij de onderbouw.' },
      doelen:[
        { id:'wvm-a-lin-helling', naam:'Het hellingsgetal berekenen', kort:'Hellingsgetal = verschil in y gedeeld door verschil in x, ook als x met grotere stappen gaat',
          uit:'<p>Het <b>hellingsgetal</b> zegt hoeveel y verandert als x 1 groter wordt.</p><p>Gaat x in de tabel met grotere stappen, bijvoorbeeld van 4 naar 10, dan <b>deel</b> je: verschil in y gedeeld door verschil in x. Van K = 13 naar K = 28 is 15 erbij, bij 6 km erbij. Het hellingsgetal is 15 : 6 = <b>2,5</b>.</p><p>Wordt het minder, dan is het verschil in y negatief. Dan is het hellingsgetal ook negatief.</p>',
          wanneer:'je wilt weten hoeveel er per stap bij komt of af gaat.', maak:mHelling },
        { id:'wvm-a-lin-tabel', naam:'Een formule bij een tabel', kort:'Bereken het hellingsgetal en reken terug naar x = 0 voor het startgetal',
          uit:'<p>Bij een tabel van een lineair verband maak je een formule zoals K = 2,5a + 10.</p><p>Bereken eerst het <b>hellingsgetal</b>: verschil in K gedeeld door verschil in a.</p><p>Staat a = 0 niet in de tabel? Reken dan <b>terug</b> naar a = 0. Bij a = 2 is K = 15 en het hellingsgetal is 2,5. Twee stappen terug: 15 − 2 × 2,5 = <b>10</b>. Dat is het <b>startgetal</b>.</p>',
          wanneer:'je bij een tabel de formule zoekt en x = 0 er niet in staat.', maak:mLinTabel },
        { id:'wvm-a-lin-grafiek', naam:'Een formule bij een grafiek', kort:'Lees het startgetal af op de verticale as en een tweede punt op het rooster; deel de verschillen',
          uit:'<p>Bij een rechte lijn lees je twee dingen af.</p><p>Het <b>startgetal</b>: waar de lijn de verticale as snijdt, bij x = 0.</p><p>Een <b>tweede punt</b> dat precies op het rooster ligt. Het hellingsgetal is het verschil in hoogte gedeeld door het verschil in x. Begint de lijn bij 10 en is hij bij x = 4 op 20, dan is het hellingsgetal 10 : 4 = <b>2,5</b>.</p>',
          wanneer:'je bij een getekende rechte lijn de formule zoekt.', maak:mLinGraf },
        { id:'wvm-a-lin-verhaal', naam:'Een formule bij een verhaal', kort:'Wat er aan het begin al is, is het startgetal; wat er per stap bij komt of af gaat, is het hellingsgetal',
          uit:'<p>In een verhaal zoek je twee getallen.</p><p>Het <b>startgetal</b> is wat er aan het begin al is: een vast bedrag of de lengte bij het begin.</p><p>Het <b>hellingsgetal</b> is wat er per stap bij komt, zoals € 2,40 per km. Gaat er iets af, zoals 1,5 cm per uur, dan is het hellingsgetal negatief: h = −1,5t + 25.</p>',
          wanneer:'een verhaal een vast bedrag of beginwaarde noemt en een bedrag of hoeveelheid per stap.', maak:mLinVerhaal },
        { id:'wvm-a-lin-terug', naam:'Terugrekenen bij een lineaire formule', kort:'Weet je de uitkomst: haal het startgetal eraf en deel door het hellingsgetal',
          uit:'<p>Bij K = 2,4a + 3,5 weet je wat de rit kost: € 27,50. Hoeveel km was de rit?</p><p>Zet de formule in een <b>pijlenketting</b>: a, dan keer 2,4, dan plus 3,5. Reken <b>terug</b> met het omgekeerde, van achter naar voren.</p><p>27,50 − 3,5 = 24 en 24 : 2,4 = <b>10</b> km. Wordt het minder, zoals bij een kaars? Kijk dan hoeveel er af is en deel door wat er per uur af gaat.</p>',
          wanneer:'je de uitkomst van de formule weet en zoekt wat je hebt ingevuld.', maak:mLinTerug }
      ] },

    /* ---------- formules met een kwadraat of een wortel ---------- */
    { groep:{ id:'wvm-a-form', niveau:'vmbo', domein:'algebra', naam:'Formules met een kwadraat of een wortel',
        uit:'Formules uit de praktijk met een kwadraat of een wortel, zoals de remweg r = 0,01 · v². Je vult in, in de goede volgorde, en je rekent terug met het omgekeerde.' },
      doelen:[
        { id:'wvm-a-form-kwadraat', naam:'Invullen bij een kwadraat', kort:'Eerst het kwadraat, dan keer het getal ervoor, dan plus of min',
          uit:'<p>Bij r = 0,01 · v² en v = 80 doe je eerst het <b>kwadraat</b>: 80² = 80 × 80 = 6400.</p><p>Dan pas <b>keer</b>: 0,01 × 6400 = <b>64</b>. De remweg is 64 meter.</p><p>Het kwadraat hoort alleen bij de letter, niet bij het getal ervoor. Een negatief getal in het kwadraat wordt positief: (−3)² = 9.</p>',
          wanneer:'er een letter in het kwadraat in de formule staat.', maak:mKwInvul },
        { id:'wvm-a-form-wortel', naam:'Invullen bij een wortel', kort:'Eerst wat onder de wortel staat, dan de wortel, dan keer',
          uit:'<p>Bij d = 3,6 · √h en h = 25 neem je eerst de <b>wortel</b>: √25 = 5, want 5 × 5 = 25.</p><p>Dan <b>keer</b>: 3,6 × 5 = <b>18</b> km.</p><p>Staat er een som onder de wortel, zoals √(h : 5), dan reken je die <b>eerst</b> uit. Is de wortel geen heel getal? Gebruik dan de knop √ en rond pas aan het eind af.</p>',
          wanneer:'er een wortel in de formule staat.', maak:mWortelInvul },
        { id:'wvm-a-form-terug-kw', naam:'Terugrekenen bij een kwadraat', kort:'Reken terug met het omgekeerde: plus wordt min, keer wordt delen, en het kwadraat wordt de wortel',
          uit:'<p>De remweg is r = 0,01 · v². Een auto heeft een remweg van 49 meter. Hoe hard reed hij?</p><p>In de pijlenketting: v, dan <b>kwadraat</b>, dan <b>keer 0,01</b>. Terug: 49 : 0,01 = 4900, en dan de <b>wortel</b>: √4900 = <b>70</b> km/u.</p><p>Neem alleen het positieve antwoord: een snelheid, tijd of lengte is niet negatief.</p>',
          wanneer:'je de uitkomst weet van een formule met een kwadraat.', maak:mKwTerug },
        { id:'wvm-a-form-terug-wortel', naam:'Terugrekenen bij een wortel', kort:'Deel eerst door het getal voor de wortel, en doe dan in het kwadraat',
          uit:'<p>Bij d = 3,6 · √h kun je 18 km ver kijken. Hoe hoog zijn je ogen?</p><p>Terug: 18 : 3,6 = 5. Dat is √h. Het omgekeerde van de wortel is het <b>kwadraat</b>: 5² = <b>25</b> meter.</p><p>Controleer: √25 = 5 en 3,6 × 5 = 18. Het klopt.</p>',
          wanneer:'je de uitkomst weet van een formule met een wortel.', maak:mWortelTerug }
      ] },

    /* ---------- formules combineren en eenheden ---------- */
    { groep:{ id:'wvm-a-comb', niveau:'vmbo', domein:'algebra', naam:'Formules combineren en eenheden',
        uit:'Twee formules na elkaar gebruiken, er één formule van maken, en goed letten op de eenheden: minuten of uren, meter of km, cent of euro.' },
      doelen:[
        { id:'wvm-a-comb-invul', naam:'Twee formules na elkaar', kort:'Vul eerst in bij de formule waar je getal in past; die uitkomst vul je in bij de tweede formule',
          uit:'<p>Soms heb je <b>twee formules</b>. Een taxi rijdt a = 0,5 · m km in m minuten. De prijs is K = 2,4 · a + 3,5.</p><p>Wat kost een rit van 20 minuten? Eerst <b>a</b>: 0,5 × 20 = 10 km. Dan <b>K</b>: 2,4 × 10 + 3,5 = <b>27,50</b> euro.</p><p>Kijk goed welke letter in welke formule staat. Begin met de formule waar jouw getal in past.</p>',
          wanneer:'de uitkomst van de ene formule nodig is in de andere.', maak:mCombInvul },
        { id:'wvm-a-comb-formule', naam:'Eén formule maken', kort:'Zet de formule van de ene letter op de plek van die letter in de andere formule, en werk uit',
          uit:'<p>Bij a = 0,5 · m en K = 2,4 · a + 3,5 wil je één formule met m erin.</p><p>Zet 0,5m op de plek van a: K = 2,4 · 0,5m + 3,5. Reken het getal voor m uit: 2,4 × 0,5 = 1,2. Dus <b>K = 1,2m + 3,5</b>.</p><p>Staat er een plus in de eerste formule? Zet hem dan tussen <b>haakjes</b> en werk die weg: 8 · (0,5g + 2) = 4g + 16.</p>',
          wanneer:'je vaak moet rekenen met twee formules achter elkaar.', maak:mCombFormule },
        { id:'wvm-a-eenh-afstand', naam:'Afstand met minuten', kort:'Bij km per uur moet de tijd in uren: deel de minuten door 60',
          uit:'<p>De formule <b>s = v · t</b>: afstand is snelheid keer tijd. De snelheid is in km per <b>uur</b>, dus de tijd moet ook in uren.</p><p>Een fietser rijdt 16 km/u, 45 minuten lang. 45 minuten = 45 : 60 = <b>0,75 uur</b>. Dan s = 16 × 0,75 = <b>12 km</b>.</p><p>Let op: een uur heeft 60 minuten, niet 100. 45 minuten is dus geen 0,45 uur.</p>',
          wanneer:'de snelheid in km per uur is en de tijd in minuten.', maak:mAfstand },
        { id:'wvm-a-eenh-tijd', naam:'De tijd in minuten', kort:'Bereken de tijd in uren met t = s : v, en doe daarna keer 60',
          uit:'<p>Met <b>t = s : v</b> bereken je hoe lang iets duurt. De uitkomst is in <b>uren</b>.</p><p>Een scooter rijdt 9 km met 45 km/u. t = 9 : 45 = 0,2 uur. In minuten: 0,2 × 60 = <b>12 minuten</b>.</p><p>Een uur heeft 60 minuten. 0,2 uur is dus geen 20 minuten.</p>',
          wanneer:'je wilt weten hoeveel minuten een rit duurt.', maak:mTijd },
        { id:'wvm-a-eenh-kosten', naam:'Kosten met de goede eenheid', kort:'Kijk welke eenheid de formule wil, reken eerst om en vul dan in',
          uit:'<p>Bij een formule staat welke <b>eenheid</b> je moet invullen. Bij K = 2,4 · a + 3,5 is a in km.</p><p>Is de rit 4500 meter? Reken eerst om: 4500 : 1000 = 4,5 km. Dan K = 2,4 × 4,5 + 3,5 = <b>14,30</b> euro.</p><p>Soms geeft de formule een andere eenheid dan je wilt, zoals cent. Reken dan de uitkomst om: 1200 cent = <b>€ 12</b>.</p>',
          wanneer:'het getal dat je hebt een andere eenheid heeft dan de formule vraagt.', maak:mKosten }
      ] },

    /* ---------- vergelijkingen: inklemmen en de grafiek ---------- */
    { groep:{ id:'wvm-a-inklem', niveau:'vmbo', domein:'algebra', naam:'Vergelijkingen: inklemmen en de grafiek',
        uit:'Staat x er twee keer in, zoals bij x² + 3x = 50, dan kun je niet terugrekenen. Je klemt de oplossing in door slim te proberen, of je leest hem af uit de grafiek.' },
      doelen:[
        { id:'wvm-a-inklem-heel', naam:'Inklemmen tussen hele getallen', kort:'Probeer hele getallen voor x: te klein, dan groter; te groot, dan kleiner, tot je twee buren vindt',
          uit:'<p>Bij x² + 5x = 200 kun je niet terugrekenen: x staat er twee keer in. Je <b>klemt in</b>: je probeert getallen en houdt bij of het te klein of te groot is.</p><p>x = 10 geeft 150: te klein. x = 13 geeft 234: te groot. x = 11 geeft 176: te klein. x = 12 geeft 204: te groot.</p><p>De oplossing ligt dus <b>tussen 11 en 12</b>. Zet je pogingen in een tabel, dan houd je het overzicht.</p>',
          wanneer:'x er twee keer in staat en je een eerste schatting wilt.', maak:mInklemHeel },
        { id:'wvm-a-inklem-dec', naam:'Inklemmen op 1 decimaal', kort:'Klem in tussen hele getallen, dan tussen tienden, en kijk halverwege hoe je afrondt',
          uit:'<p>Je zoekt de oplossing op <b>1 decimaal</b>. Bij x² + 2x = 30: x = 4 geeft 24, x = 5 geeft 35. De oplossing ligt tussen 4 en 5.</p><p>Probeer nu <b>tienden</b>: x = 4,5 geeft 29,25 en x = 4,6 geeft 30,36. Hij ligt tussen 4,5 en 4,6.</p><p>Kijk dan <b>halverwege</b>: x = 4,55 geeft 29,8025. Dat is minder dan 30, dus de oplossing ligt boven 4,55. Afgerond: <b>x ≈ 4,6</b>.</p>',
          wanneer:'je de oplossing op 1 decimaal moet geven en terugrekenen niet gaat.', maak:mInklemDec },
        { id:'wvm-a-inklem-grafiek', naam:'Oplossen met de grafiek', kort:'Maak van elke kant een grafiek; de x van elk snijpunt is een oplossing',
          uit:'<p>Bij x² − 2x = 3 maak je van elke kant een grafiek: <b>y = x² − 2x</b> (een parabool) en <b>y = 3</b> (een horizontale lijn).</p><p>Waar de grafieken elkaar <b>snijden</b>, zijn beide kanten gelijk. Lees bij elk snijpunt de <b>x</b> af: x = −1 en x = 3.</p><p>Controleer door in te vullen: 3² − 2 × 3 = 3. Het klopt. Er zijn hier twee oplossingen.</p>',
          wanneer:'de grafieken getekend zijn en de snijpunten precies op het rooster liggen.', maak:mGrafVgl },
        { id:'wvm-a-inklem-kies', naam:'Kies de handigste manier', kort:'x één keer: terugrekenen. Grafiek met snijpunten op het rooster: aflezen. Anders: inklemmen',
          uit:'<p>Kijk eerst goed naar de vergelijking en <b>kies</b> dan.</p><p>Staat x er maar <b>één keer</b> in, zoals bij 3x² + 5 = 152? <b>Reken terug</b>: dat is snel en precies.</p><p>Staat x er twee keer in en zijn de <b>grafieken</b> getekend met snijpunten op het rooster? <b>Lees af</b>. Geen grafiek en je moet afronden? <b>Klem in</b>.</p>',
          wanneer:'je een vergelijking snel en precies wilt oplossen.', maak:mInklemKies }
      ] },

    /* ---------- kwadratische verbanden ---------- */
    { groep:{ id:'wvm-a-kw', niveau:'vmbo', domein:'verbanden', naam:'Kwadratische verbanden en de parabool',
        uit:'Bij een formule met x² hoort een parabool. Je maakt een tabel, ziet of het een dal of een berg is, en vindt de symmetrieas, de top en de snijpunten met de x-as.' },
      doelen:[
        { id:'wvm-a-kw-tabel', naam:'Een tabel bij een kwadratische formule', kort:'Vul x in: eerst het kwadraat, dan keer het getal ervoor, dan de rest',
          uit:'<p>Bij y = −2x² + 8x + 1 en x = 3 reken je in de goede <b>volgorde</b>.</p><p>Eerst het <b>kwadraat</b>: 3² = 9. Dan <b>keer −2</b>: −18. Dan 8 × 3 = 24. Samen: −18 + 24 + 1 = <b>7</b>.</p><p>Bij x = −1 is (−1)² = 1, want min keer min is plus. Met de tabel teken je daarna de parabool.</p>',
          wanneer:'je een parabool wilt tekenen of y wilt weten bij een paar waarden van x.', maak:mKwTabel },
        { id:'wvm-a-kw-soort', naam:'Dalparabool of bergparabool', kort:'Positief getal voor x²: een dal. Negatief: een berg. Het losse getal is het snijpunt met de y-as',
          uit:'<p>Kijk naar het getal voor <b>x²</b>, ook als die term niet vooraan staat.</p><p>Is het <b>positief</b>, dan is de grafiek een <b>dalparabool</b>: de top is het laagste punt. Is het <b>negatief</b>, dan is het een <b>bergparabool</b>: de top is het hoogste punt.</p><p>Vul je x = 0 in, dan blijft alleen het <b>losse getal</b> over. Bij y = 5 + 3x − 2x² is dat 5: een bergparabool door (0, 5).</p>',
          wanneer:'je zonder te tekenen wilt weten hoe de parabool eruitziet.', maak:mKwSoort },
        { id:'wvm-a-kw-symas', naam:'De symmetrieas uit een tabel', kort:'Zoek twee x-waarden met dezelfde y; de symmetrieas ligt er precies midden tussen',
          uit:'<p>Een parabool is <b>symmetrisch</b>: links en rechts van de <b>symmetrieas</b> zie je dezelfde y-waarden.</p><p>Zoek in de tabel twee x-waarden met <b>dezelfde y</b>, bijvoorbeeld x = 1 en x = 4. De as ligt <b>midden</b> ertussen: (1 + 4) : 2 = 2,5.</p><p>Je schrijft de symmetrieas als <b>x = 2,5</b>: een verticale lijn.</p>',
          wanneer:'je bij een tabel van een parabool de symmetrieas zoekt.', maak:mKwSymas },
        { id:'wvm-a-kw-top-tabel', naam:'De top uit een tabel', kort:'De top ligt op de symmetrieas: zoek de as en vul die x in de formule in',
          uit:'<p>De <b>top</b> van de parabool ligt op de <b>symmetrieas</b>.</p><p>Zoek eerst de as met twee gelijke y-waarden in de tabel, bijvoorbeeld x = 2,5. Vul dan x = 2,5 in de formule in. Bij y = x² − 5x + 3: 6,25 − 12,5 + 3 = −3,25.</p><p>De top is <b>(2,5; −3,25)</b>. Staat de x van de top in de tabel, dan lees je y gewoon af.</p>',
          wanneer:'je de top van een parabool zoekt en een tabel hebt.', maak:mKwTopTabel },
        { id:'wvm-a-kw-nul', naam:'Snijpunten met de x-as aflezen', kort:'Op de x-as is y = 0: lees de x af waar de parabool de x-as kruist',
          uit:'<p>Een <b>snijpunt met de x-as</b> ligt op de x-as, dus daar is <b>y = 0</b>.</p><p>Lees in de grafiek af waar de parabool de horizontale as kruist, bijvoorbeeld bij x = −1 en x = 3. De snijpunten zijn <b>(−1, 0)</b> en <b>(3, 0)</b>.</p><p>Controleer met de formule: bij y = x² − 2x − 3 en x = 3 komt er 9 − 6 − 3 = 0 uit. Het klopt.</p>',
          wanneer:'je bij een grafiek wilt weten waar y nul is.', maak:mKwNul },
        { id:'wvm-a-kw-top-nul', naam:'De top via de snijpunten met de x-as', kort:'De symmetrieas ligt midden tussen de snijpunten met de x-as; vul die x in voor de top',
          uit:'<p>De snijpunten met de x-as liggen <b>symmetrisch</b>. De symmetrieas ligt er dus precies <b>midden</b> tussen.</p><p>Bij y = x² − 6x + 5 snijdt de parabool de x-as bij x = 1 en x = 5. De as: (1 + 5) : 2 = <b>3</b>.</p><p>Vul x = 3 in: 9 − 18 + 5 = −4. De top is <b>(3, −4)</b>.</p>',
          wanneer:'je de snijpunten met de x-as weet en de top zoekt.', maak:mKwTopNul }
      ] },

    /* ---------- exponentiële groei verder ---------- */
    { groep:{ id:'wvm-a-exp', niveau:'vmbo', domein:'verbanden', naam:'Exponentiële groei verder',
        uit:'Je kent de groeifactor en de formule N = b · g^t al (zie Exponentiële groei). Nu reken je de groei en de afname over meer perioden, terug in de tijd, en wanneer een grens bereikt wordt.' },
      doelen:[
        { id:'wvm-a-exp-perioden', naam:'Groei over meer perioden', kort:'De groeifactor per n perioden is g^n; haal er 1 af en doe keer 100 voor het procent',
          uit:'<p>Groeit iets met 5% per jaar, dan is de groeifactor per jaar 1,05. Over 10 jaar doe je 10 keer × 1,05: de groeifactor per 10 jaar is <b>1,05<sup>10</sup> ≈ 1,629</b>.</p><p>Dat is 162,9%: een toename van <b>62,9%</b>.</p><p>Let op: het is geen 10 × 5% = 50%. Elk jaar komt er ook groei bovenop de groei van de jaren ervoor.</p>',
          wanneer:'je de groei per week, per 10 jaar of per andere langere periode zoekt.', maak:mExpPerioden },
        { id:'wvm-a-exp-afname', naam:'Afname over meer perioden', kort:'Neem de groeifactor tot de macht n; wat er over is, haal je van 100% af',
          uit:'<p>Een auto wordt elk jaar 15% minder waard. De groeifactor per jaar is <b>0,85</b>.</p><p>Na 4 jaar: 0,85<sup>4</sup> ≈ 0,522. Er is dus nog <b>52,2%</b> van de waarde over.</p><p>De afname is 100% − 52,2% = <b>47,8%</b>. Dat is minder dan 4 × 15% = 60%, want elk jaar gaat er 15% af van een kleiner bedrag.</p>',
          wanneer:'iets elk jaar of elk uur met een vast procent afneemt en je de afname over langere tijd zoekt.', maak:mExpAfname },
        { id:'wvm-a-exp-terug', naam:'Terugrekenen in de tijd', kort:'Terug in de tijd deel je door de groeifactor, één keer per periode',
          uit:'<p>Een dorp groeit met 10% per jaar en heeft nu 1331 inwoners. Hoeveel waren het er 3 jaar geleden?</p><p>Vooruit doe je elk jaar <b>keer 1,1</b>. Terug in de tijd doe je dus <b>gedeeld door 1,1</b>, drie keer. In één keer: delen door 1,1<sup>3</sup> = 1,331.</p><p>1331 : 1,331 = <b>1000</b> inwoners.</p>',
          wanneer:'je weet hoeveel er nu is en wilt weten hoeveel er eerder was.', maak:mExpTerug },
        { id:'wvm-a-exp-grens', naam:'Wanneer wordt een grens bereikt?', kort:'Reken N uit voor hele waarden van t en zoek de eerste t waarbij de grens voorbij is',
          uit:'<p>Een stad met 20.000 inwoners groeit met 3% per jaar. Na hoeveel jaar zijn er voor het eerst meer dan 25.000?</p><p>Je klemt in: reken N = 20.000 · 1,03<sup>t</sup> uit voor hele t. t = 7 geeft ongeveer 24.597: nog niet. t = 8 geeft ongeveer 25.335: wel.</p><p>Na <b>8 jaar</b> zijn er voor het eerst meer dan 25.000 inwoners.</p>',
          wanneer:'je wilt weten wanneer een hoeveelheid voor het eerst boven of onder een grens komt.', maak:mExpGrens }
      ] },

    /* ---------- grafieken in de praktijk ---------- */
    { groep:{ id:'wvm-a-graf', niveau:'vmbo', domein:'verbanden', naam:'Grafieken in de praktijk',
        uit:'Grafieken en tabellen uit het echte leven: een toenamediagram maken en lezen, de grootste toename zoeken, de gemiddelde verandering berekenen en zien of een grafiek toenemend of afnemend stijgt.' },
      doelen:[
        { id:'wvm-a-graf-toename', naam:'Een toenamediagram maken', kort:'Bereken per periode nieuw min oud; een toename is een staaf omhoog, een afname een staaf omlaag',
          uit:'<p>In een <b>toenamediagram</b> zie je hoeveel er per periode bij komt of af gaat.</p><p>Reken per periode <b>nieuw min oud</b>. Van 120 leden naar 135 is +15. Van 135 naar 125 is −10.</p><p>Een toename teken je als staaf <b>omhoog</b>, een afname als staaf <b>omlaag</b>. Elke staaf staat tussen de twee tijdstippen waar hij bij hoort.</p>',
          wanneer:'je wilt laten zien hoeveel er per periode bij komt of af gaat.', maak:mToename },
        { id:'wvm-a-graf-lezen', naam:'Een toenamediagram lezen', kort:'Begin bij de beginwaarde en tel de toenames op; staven omlaag tellen als min',
          uit:'<p>Een toenamediagram geeft niet de waarden zelf, maar hoeveel er steeds <b>bij komt of af gaat</b>.</p><p>Weet je de <b>beginwaarde</b>, dan tel je de staven erbij op. Begin 120, staven +15, −10 en +20: 120 + 15 − 10 + 20 = <b>145</b>.</p><p>Een staaf onder de nullijn is een <b>afname</b>: die tel je met een min.</p>',
          wanneer:'je een toenamediagram en een beginwaarde hebt en een latere waarde zoekt.', maak:mLezen },
        { id:'wvm-a-graf-grootste', naam:'De grootste toename', kort:'Bereken alle toenames en kies de grootste; in de grafiek is dat het steilste stuk',
          uit:'<p>Wanneer groeide het het hardst? Bereken voor elke periode de <b>toename</b>: nieuw min oud.</p><p>De grootste toename is het grootste getal. In de grafiek is dat het <b>steilste stuk omhoog</b>.</p><p>Wordt naar de grootste <b>afname</b> gevraagd? Zoek dan het negatieve getal dat het verst onder 0 ligt: het steilste stuk omlaag.</p>',
          wanneer:'je wilt weten in welke periode iets het hardst groeide of daalde.', maak:mGrootste },
        { id:'wvm-a-graf-gem', naam:'De gemiddelde verandering', kort:'Verschil in waarde gedeeld door verschil in tijd',
          uit:'<p>Van 2012 tot 2020 steeg de prijs van een huis van 240 naar 300 duizend euro. Hoeveel is dat <b>gemiddeld per jaar</b>?</p><p>Verschil in prijs: 300 − 240 = 60. Verschil in tijd: 2020 − 2012 = 8 jaar. Gemiddeld: 60 : 8 = <b>7,5</b> duizend euro per jaar.</p><p>Neemt het af, dan heet het een gemiddelde <b>afname</b>. Je schrijft dan het getal zonder min.</p>',
          wanneer:'je wilt weten hoeveel iets gemiddeld per jaar, uur of minuut verandert.', maak:mGemiddeld },
        { id:'wvm-a-graf-stijgen', naam:'Toenemend of afnemend stijgen', kort:'Worden de stappen steeds groter, dan is het toenemend; steeds kleiner, dan afnemend',
          uit:'<p>Bereken de <b>toenames</b> in de tabel. Zijn ze positief, dan is de grafiek <b>stijgend</b>. Zijn ze negatief, dan is hij <b>dalend</b>.</p><p>Kijk dan naar de stappen zonder het minteken. Worden ze steeds <b>groter</b>, dan is het <b>toenemend</b> stijgend of dalend: de grafiek wordt steeds steiler. Worden ze steeds <b>kleiner</b>, dan is het <b>afnemend</b>: de grafiek wordt steeds vlakker.</p><p>Blijven ze <b>gelijk</b>, dan is het <b>lineair</b>: een rechte lijn.</p>',
          wanneer:'je de vorm van een grafiek in woorden wilt beschrijven.', maak:mStijgen }
      ] }
  ]);
})();
