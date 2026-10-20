/* De leerroute wiskunde: havo wiskunde B. De top van een parabool (topvorm, x = −b : 2a,
   midden tussen de nulpunten), functiewaarde, domein en bereik, transformaties,
   negatieve en gebroken exponenten, machts- en wortelvergelijkingen, logaritmen,
   exponentiële vergelijkingen (gelijke grondtallen of een logaritme), differentiëren
   en de afgeleide gebruiken, periodieke functies, de sinus- en cosinusregel, en
   cirkels met raaklijnen. Elke manier een eigen doel.
   Ongelijkheden, merkwaardige producten, ontbinden, kwadratische vergelijkingen en de
   rekenregels voor machten staan in wiskunde-algebra.js. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '×', RAD = Math.PI / 180;
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes voor stappen en antwoorden ================= */
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
  /* F(goed, fout1, uitleg1, fout2, uitleg2, ...): uitleg bij typische fouten */
  function F(goed){
    var o = {}, g = [];
    [].concat(goed).forEach(function(x){ g = g.concat(varianten(typeof x === 'number' ? T(x) : x)); });
    for (var i = 1; i + 1 < arguments.length; i += 2){
      var uitleg = arguments[i + 1], k = arguments[i];
      varianten(typeof k === 'number' ? T(k) : k).forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = uitleg; });
    }
    return o;
  }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  function nz(R, lo, hi){ var x; do { x = R.heel(lo, hi); } while (!x); return x; }
  function paren(n){ return n < 0 ? '(' + T(n) + ')' : T(n); }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* ligt x vlak bij een afrondingsgrens? Dan kiezen we liever andere getallen */
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.02; }
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function norm360(a){ return ((a % 360) + 360) % 360; }
  var SUPC = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sup(n){ return String(n).split('').map(function(c){ return c === '-' ? '⁻' : SUPC.charAt(+c); }).join(''); }
  /* een uitdrukking: E([[3,'x²'],[-4,'x'],[5,'']]) = '3x² − 4x + 5' */
  function E(termen){
    var s = '';
    termen.forEach(function(t){
      var c = t[0], v = t[1] || ''; if (!c) return;
      var abs = Math.abs(c), stuk = (v && abs === 1 ? '' : T(abs)) + v;
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }
  var XP = ['', 'x', 'x²', 'x³', 'x⁴', 'x⁵', 'x⁶'];
  /* een veelterm uit coëfficiënten, index = macht: P([5, -4, 3]) = '3x² − 4x + 5' */
  function P(c){ var t = []; for (var i = c.length - 1; i >= 0; i--) t.push([c[i], XP[i]]); return E(t); }
  function pv(c, x){ var s = 0; for (var i = 0; i < c.length; i++) s += c[i] * Math.pow(x, i); return s; }
  function pd(c){ var r = c.slice(1).map(function(v, i){ return v * (i + 1); }); return r.length ? r : [0]; }
  /* een getal voor x: 1 weg, −1 alleen het minteken */
  function coefD(a){ return a === 1 ? '' : a === -1 ? MIN : a === 0.5 ? '½' : a === -0.5 ? MIN + '½' : T(a); }
  /* (x − 3), (x + 4), of x */
  function haak(p, l){ l = l || 'x'; return !p ? l : '(' + l + ' ' + (p < 0 ? '+ ' + T(-p) : MIN + ' ' + T(p)) + ')'; }
  function plusQ(q){ return q ? (q < 0 ? ' ' + MIN + ' ' + T(-q) : ' + ' + T(q)) : ''; }
  /* hint bij ax + b = rechts */
  function losHint(a, b, rechts, x){ var l = []; if (b) l.push((b > 0 ? 'Trek ' + T(b) + ' af' : 'Tel ' + T(-b) + ' op') + ': ' + E([[a, 'x']]) + ' = ' + T(rechts - b) + '.'); if (a !== 1) l.push('Deel door ' + a + ': x = ' + T(x) + '.'); if (!l.length) l.push('x = ' + T(x) + '.'); return l.join(' '); }
  function eqAnt(x){ return [T(x), 'x = ' + T(x)]; }
  function punt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  /* maakt van superscripts ^-tekens, voor een typvoorbeeld */
  function typ(s){ return String(s).replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function(c){ return '^' + c.split('').map(function(ch){ return ch === '⁻' ? '-' : SUPC.indexOf(ch); }).join(''); }).replace(/−/g, '-').replace(/ /g, ''); }

  /* ---------- meetkunde: antwoorden met eenheid ---------- */
  function metE(x, e, ook){
    x = String(x);
    /* 0,075 niet ook als 0.075: dat leest de motor als vijfenzeventig */
    var punt = x.replace(/\./g, '').replace(',', '.'), vormen = uniek([x, x.replace(/\./g, '')].concat(/^-?\d{1,3}(\.\d{3})+$/.test(punt) ? [] : [punt])), uit = vormen.slice();
    [e].concat(ook || []).forEach(function(eh){
      if (!eh) return;
      vormen.forEach(function(v){ uit.push(v + ' ' + eh, v + eh); });
    });
    return uniek(uit);
  }
  function gr(x){ return metE(T(x), '°', ['graden']); }
  function af(x, d, e){ var r = rnd(x, d), v = metE(T(r, { dec:d, vast:true }), e), k = metE(T(r), e); return uniek(Math.abs(x - Math.round(x)) < 1e-9 ? k.concat(v) : v.concat(k)); }
  function St(tekst, ant, hint, fout, o){
    o = o || {};
    var s = { tekst:tekst, antwoord:[].concat(ant).map(String), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (o.e) s.eenheid = o.e;
    return s;
  }
  function FM(){ var f = {}; for (var i = 0; i < arguments.length; i += 2){ var k = String(arguments[i]).toLowerCase(); if (!(k in f)) f[k] = arguments[i + 1]; } return f; }
  function Fz(goed, f){ var g = [].concat(goed).map(function(x){ return String(x).toLowerCase(); }), o = {}; for (var k in f) if (g.indexOf(k) < 0) o[k] = f[k]; return o; }

  /* ---------- uitdrukkingen lezen: een veelterm als { '':4, x:3, xx:1 } ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
  var SUPN = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁻':'-' };
  function norm(t){
    return String(t == null ? '' : t).toLowerCase().replace(/[−–—]/g, '-').replace(/½/g, '(1/2)').replace(/⅓/g, '(1/3)').replace(/¼/g, '(1/4)')
      .replace(/[×·*]/g, '*').replace(/:/g, '/')
      .replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function(c){ return '^' + c.split('').map(function(ch){ return SUPN[ch]; }).join(''); })
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
  /* zonder haakjes, en elke soort term maar een keer */
  function kaal(v){
    var s = norm(v); if (/[()]/.test(s)) return false;
    var stukken = s.replace(/([^*\/^+-])([+-])/g, '$1|$2').split('|'), gezien = {};
    for (var i = 0; i < stukken.length; i++){
      var p = lees(stukken[i]); if (!p) return false;
      var k = Object.keys(p).filter(function(x){ return Math.abs(p[x]) > 1e-12; });
      if (k.length > 1 || (k.length === 1 && gezien[k[0]])) return false;
      if (k.length) gezien[k[0]] = 1;
    }
    return true;
  }
  /* "f(x) =", "f′(x) =", "g(x) =" of "y =" mag ervoor */
  function kop(v){ return String(v).trim().replace(/^[a-z]\s*['′’]?\s*\(\s*x\s*\)\s*=/i, '').replace(/^y\s*=/i, '').replace(/^=/, ''); }
  function exprC(verwacht, o){
    o = o || {}; var q = lees(verwacht);
    return function(v){ var t = kop(v), p = lees(t); if (!p || !pGelijk(p, q)) return false; return o.kaal ? kaal(t) : true; };
  }
  /* een getal of een breuk: 4/3, −0,75 */
  function getal(s){ var m = /^([-+]?\d*\.?\d+)(?:\/(\d*\.?\d+))?$/.exec(s); if (!m) return NaN; return m[2] ? +m[1] / +m[2] : +m[1]; }
  function getC(val){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/^[a-z]+=/, '');
      var g = getal(s); return !isNaN(g) && Math.abs(g - val) < 1e-9;
    };
  }
  /* één macht a · x^n, ook met negatieve of gebroken exponent */
  function macC(a, n){
    return function(v){
      var s = kop(v).toLowerCase().replace(/[−–—]/g, '-').replace(/½/g, '1/2').replace(/⅓/g, '1/3').replace(/¼/g, '1/4')
        .replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function(c){ return '^' + c.split('').map(function(ch){ return SUPN[ch]; }).join(''); })
        .replace(/,/g, '.').replace(/\s+/g, '').replace(/[×·*]/g, '');
      var m = /^(.*?)x(?:\^(.+))?$/.exec(s); if (!m) return false;
      var cp = m[1].replace(/^\((.*)\)$/, '$1'), ca = cp === '' || cp === '+' ? 1 : cp === '-' ? -1 : getal(cp);
      var ep = m[2] == null ? '1' : m[2].replace(/^\((.*)\)$/, '$1'), ce = getal(ep);
      return !isNaN(ca) && !isNaN(ce) && Math.abs(ca - a) < 1e-9 && Math.abs(ce - n) < 1e-9;
    };
  }
  function expT(n){ if (n === 1) return ''; if (Math.round(n) === n) return sup(n); if (Math.abs(n - 1 / 3) < 1e-9) return '^(1/3)'; return '^' + T(n); }
  function macStr(a, n){ return (a === 1 ? '' : a === -1 ? MIN : T(a)) + 'x' + expT(n); }
  /* een ongelijkheid met x of y: x ≥ 3, ook 3 ≤ x; >= en <= mogen */
  function ongL(L, teken, g){
    var om = { '<':'>', '>':'<', '≤':'≥', '≥':'≤' };
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/<=|=</g, '≤').replace(/>=|=>/g, '≥').replace(/,/g, '.');
      if (L === 'y') s = s.replace(/^f\(x\)/, 'y').replace(/f\(x\)$/, 'y');
      var m = new RegExp('^' + L + '([<>≤≥])(-?\\d+(?:\\.\\d+)?)$').exec(s);
      if (m) return m[1] === teken && Math.abs(+m[2] - g) < 1e-9;
      m = new RegExp('^(-?\\d+(?:\\.\\d+)?)([<>≤≥])' + L + '$').exec(s);
      if (m) return m[2] === om[teken] && Math.abs(+m[1] - g) < 1e-9;
      return false;
    };
  }
  function ongT(L, teken, g){ return L + ' ' + teken + ' ' + T(g); }
  /* oplossingen in elke volgorde: "x = 3 of x = −3", "±3", "geen oplossing" */
  function oplC(waarden){
    var w = uniek(waarden.map(function(x){ return String(rnd(x, 6)); })).map(Number).sort(function(a, b){ return a - b; });
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
      if (!w.length) return /geen/.test(s) && !/\d/.test(s);
      if (/geen/.test(s)) return false;
      s = s.replace(/x\s*[12]?\s*(=|≈)/g, ' ').replace(/≈|=/g, ' ').replace(/\b(of|en)\b/g, ' ').replace(/\+\s*\/?\s*-/g, '±').replace(/;/g, ' ');
      s = s.replace(/(\d),(?=\d)/g, '$1.').replace(/,/g, ' ');
      if (/[^\d\s.±-]/.test(s)) return false;
      var l = [], re = /(±|-)?\s*(\d+(?:\.\d+)?)/g, m;
      while ((m = re.exec(s))){ var n = +m[2]; if (m[1] === '±'){ l.push(n, -n); } else l.push(m[1] === '-' ? -n : n); }
      if (s.replace(re, '').trim()) return false;
      l = uniek(l.map(function(x){ return String(x); })).map(Number).sort(function(a, b){ return a - b; });
      return l.length === w.length && l.every(function(x, i){ return Math.abs(x - w[i]) < 1e-9; });
    };
  }
  function oplTekst(l, ca){ return l.length ? l.map(function(x){ return 'x ' + (ca ? '≈ ' + T(x, { dec:2, vast:true }) : '= ' + T(x)); }).join(' of ') : 'geen oplossing'; }
  function puntC(x, y){
    return function(v){
      var s = String(v).replace(/[\s()]/g, '').replace(/[−–—]/g, '-'), d = s.split(/[;,]/);
      if (d.length !== 2 || !/^-?\d+$/.test(d[0]) || !/^-?\d+$/.test(d[1])) return false;
      return +d[0] === x && +d[1] === y;
    };
  }
  /* twee of meer punten, in elke volgorde: "(−1, 7) en (3, −25)" */
  function puntenC(pts){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, ''), re = /\((-?\d+)[;,](-?\d+)\)/g, m, l = [];
      while ((m = re.exec(s))) l.push([+m[1], +m[2]]);
      if (s.replace(re, '').replace(/en|of|[;,&]/g, '')) return false;
      if (l.length !== pts.length) return false;
      return pts.every(function(p){ return l.some(function(q){ return q[0] === p[0] && q[1] === p[1]; }); }) &&
        l.every(function(q, i){ return l.every(function(r, j){ return i === j || r[0] !== q[0] || r[1] !== q[1]; }); });
    };
  }
  /* een lijn y = a·x + b; "y =" mag ook weg */
  function formC(a, b){
    var q = { x:a, '':b };
    return function(v){
      var d = String(v).split('='); if (d.length > 2) return false;
      if (d.length === 2){
        var l = lees(d[0]), r = lees(d[1]); if (!l || !r) return false;
        if (pGelijk(l, { y:1 })) return pGelijk(r, q);
        if (pGelijk(r, { y:1 })) return pGelijk(l, q);
        return false;
      }
      var p = lees(d[0]); return !!p && pGelijk(p, q);
    };
  }
  function formS(a, b){ return 'y = ' + E([[a, 'x'], [b, '']]); }
  /* een breuk netjes: 4/3, of −0,75 als het een eindig kommagetal is */
  function breukS(t, n){
    if (n < 0){ t = -t; n = -n; }
    var g = ggd(t, n); t /= g; n /= g;
    if (n === 1) return [T(t)];
    var b = (t < 0 ? MIN : '') + Math.abs(t) + '/' + n, m = n; while (m % 2 === 0) m /= 2; while (m % 5 === 0) m /= 5;
    return m === 1 ? [b, T(t / n)] : [b];
  }

  /* ================= tekenen: assenstelsel en grafieken ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700');
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal' + (o.m ? ' ' + o.m : '') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function stip(x, y, r, k, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + k + (o.s ? ';stroke:' + o.s + ';stroke-width:' + (o.w || 2) : '') + '"/>'; }
  /* een assenstelsel: lijnen { a, b } of { f }, cirkels, stippellijnen, punten en een legenda */
  function assen(o){
    var x0 = o.xmin, x1 = o.xmax, y0 = o.ymin, y1 = o.ymax, u = Math.min(440 / (x1 - x0), 340 / (y1 - y0)), m = 28, W = (x1 - x0) * u + 2 * m, H = (y1 - y0) * u + 2 * m, s = '';
    function Xp(x){ return m + (x - x0) * u; }
    function Yp(y){ return m + (y1 - y) * u; }
    var ls = (y1 - y0) > 16 || (x1 - x0) > 16 ? 2 : 1;
    for (var x = x0; x <= x1; x++) s += ln(Xp(x), Yp(y0), Xp(x), Yp(y1), { w:1, op:0.18 });
    for (var y = y0; y <= y1; y++) s += ln(Xp(x0), Yp(y), Xp(x1), Yp(y), { w:1, op:0.18 });
    s += ln(Xp(x0) - 6, Yp(0), Xp(x1) + 10, Yp(0), { w:2 }) + ln(Xp(0), Yp(y0) + 6, Xp(0), Yp(y1) - 10, { w:2 });
    s += '<path d="M' + n1(Xp(x1) + 12) + ' ' + n1(Yp(0)) + ' l-9 -5 M' + n1(Xp(x1) + 12) + ' ' + n1(Yp(0)) + ' l-9 5 M' + n1(Xp(0)) + ' ' + n1(Yp(y1) - 12) + ' l-5 9 M' + n1(Xp(0)) + ' ' + n1(Yp(y1) - 12) + ' l5 9" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/>';
    for (x = x0; x <= x1; x++) if (x && x % ls === 0) s += tx(Xp(x), Yp(0) + 17, T(x), { m:'klein' });
    for (y = y0; y <= y1; y++) if (y && y % ls === 0) s += tx(Xp(0) - 7, Yp(y) + 5, T(y), { m:'klein', a:'end' });
    s += tx(Xp(0) - 7, Yp(0) + 17, '0', { m:'klein', a:'end' }) + tx(Xp(x1) + 12, Yp(0) - 10, 'x', { m:'klein', vet:true }) + tx(Xp(0) + 12, Yp(y1) - 6, 'y', { m:'klein', vet:true, a:'start' });
    (o.cirkels || []).forEach(function(c){ s += '<circle cx="' + n1(Xp(c.x)) + '" cy="' + n1(Yp(c.y)) + '" r="' + n1(c.r * u) + '" style="fill:none;stroke:' + KL[c.k || 0] + ';stroke-width:3.5"/>'; });
    (o.vlijn || []).forEach(function(v){ s += ln(Xp(v.x), Yp(y0), Xp(v.x), Yp(y1), { k:KL[v.k == null ? 1 : v.k], w:2.5, dash:'7 5' }); });
    (o.lijnen || []).forEach(function(l){
      if (l.f){ var d = ''; for (var t = x0; t <= x1 + 1e-9; t += 0.05){ var v = l.f(t); if (!isFinite(v) || v < y0 - 0.5 || v > y1 + 0.5){ d += ' '; continue; } d += (/[\d]$/.test(d) ? ' L' : ' M') + n1(Xp(t)) + ' ' + n1(Yp(v)); }
        s += '<path d="' + d.replace(/\s+M/g, ' M').trim() + '" style="fill:none;stroke:' + KL[l.k || 0] + ';stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>'; return; }
      var xa = x0, xb = x1;
      if (l.a !== 0){ var p1 = (y0 - l.b) / l.a, p2 = (y1 - l.b) / l.a; xa = Math.max(x0, Math.min(p1, p2)); xb = Math.min(x1, Math.max(p1, p2)); }
      if (xb <= xa) return;
      s += ln(Xp(xa), Yp(l.a * xa + l.b), Xp(xb), Yp(l.a * xb + l.b), { k:KL[l.k || 0], w:3.5 });
    });
    (o.seg || []).forEach(function(g){ s += ln(Xp(g.x1), Yp(g.y1), Xp(g.x2), Yp(g.y2), { k:KL[g.k == null ? 1 : g.k], w:2.5, dash:g.dash ? '7 5' : null }); });
    (o.punten || []).forEach(function(p){ s += stip(Xp(p.x), Yp(p.y), 6, KL[p.k == null ? 1 : p.k], { s:'var(--kaart)', w:2 }); if (p.label) s += tx(Xp(p.x) + (p.links ? -10 : 10), Yp(p.y) - 10, p.label, { m:'klein', vet:true, a:p.links ? 'end' : 'start' }); });
    (o.legenda || []).forEach(function(l, i){ s += tx(Xp(x0) + 8, Yp(y1) + 20 + i * 22, l[0], { k:KL[l[1]], vet:true, a:'start' }); });
    return svg(W, H, s, o.aria || 'assenstelsel', Math.min(560, W * 1.15));
  }
  /* een sinusoïde y = a + b sin(2π(x − d) : P) met een raster per kwart periode */
  function perGraf(o){
    var W = 540, H = 300, ml = 42, mr = 26, mt = 16, mb = 34, x1 = o.xmax, y0 = o.ymin, y1 = o.ymax;
    var ux = (W - ml - mr) / x1, uy = (H - mt - mb) / (y1 - y0), s = '', ys = (y1 - y0) > 13 ? 2 : 1;
    function Xp(x){ return ml + x * ux; }
    function Yp(y){ return mt + (y1 - y) * uy; }
    for (var k = 0; k * o.stap <= x1 + 1e-9; k++){ var xx = k * o.stap; s += ln(Xp(xx), Yp(y0), Xp(xx), Yp(y1), { w:1, op:0.2 }); s += tx(Xp(xx), Yp(y0) + 22, T(xx), { m:'klein' }); }
    for (var y = y0; y <= y1; y++){ if (y % ys) continue; s += ln(Xp(0), Yp(y), Xp(x1), Yp(y), { w:1, op:0.2 }); s += tx(Xp(0) - 8, Yp(y) + 5, T(y), { m:'klein', a:'end' }); }
    s += ln(Xp(0), Yp(0), Xp(x1) + 8, Yp(0), { w:2 }) + ln(Xp(0), Yp(y0), Xp(0), Yp(y1), { w:2 });
    s += tx(Xp(x1) + 14, Yp(0) + 5, 'x', { m:'klein', vet:true }) + tx(Xp(0) + 10, Yp(y1) + 12, 'y', { m:'klein', vet:true, a:'start' });
    (o.hlijn || []).forEach(function(h){ s += ln(Xp(0), Yp(h.y), Xp(x1), Yp(h.y), { k:KL[h.k], w:2.5, dash:'7 5' }); if (h.t) s += tx(Xp(x1) - 4, Yp(h.y) - 7, h.t, { k:KL[h.k], vet:true, a:'end', m:'klein' }); });
    var d = '';
    for (var i = 0; i <= 320; i++){ var x = x1 * i / 320, v = o.a + o.b * Math.sin(2 * Math.PI * (x - o.d) / o.P); d += (i ? ' L' : 'M') + n1(Xp(x)) + ' ' + n1(Yp(v)); }
    s += '<path d="' + d + '" style="fill:none;stroke:' + KL[0] + ';stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>';
    (o.punten || []).forEach(function(p){ s += stip(Xp(p.x), Yp(p.y), 6, KL[p.k == null ? 1 : p.k], { s:'var(--kaart)', w:2 }); if (p.label) s += tx(Xp(p.x) + 8, Yp(p.y) - 10, p.label, { m:'klein', vet:true, a:'start' }); });
    return svg(W, H, s, o.aria || 'grafiek van een periodieke functie', 560);
  }

  /* ---------- meetkunde: figuren met hoekjes ---------- */
  function mtx(x, y, t, o){
    o = o || {};
    var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600)];
    if (o.k) st.push('fill:' + o.k);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '"' + (o.mid ? ' dy=".35em"' : '') + ' style="' + st.join(';') + '">' + Sch(t) + '</text>';
  }
  function stijl(o){
    return 'fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2) +
      (o.stip ? ';stroke-dasharray:' + (o.stip === true ? '6 5' : o.stip) : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round;stroke-linejoin:round';
  }
  function mln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="' + stijl({ s:o.k || 'var(--ink)', w:o.w || 2, stip:o.stip, op:o.op }) + '"/>'; }
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
    var d = norm360(a2 - a1), kl = o.k || KL[0], r = o.r || 30, s = '';
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
    if (o.t != null && o.t !== ''){ var mm = pol(cx, cy, r + (o.lr || 17), a1 + d / 2); s += mtx(mm[0], mm[1], o.t, { k:kl, vet:true, mid:true, fs:o.fs || 15 }); }
    return s;
  }
  /* het binnenste hoekje tussen twee richtingen vanuit V */
  function hoekTussen(V, A, B, o){ var dA = rich(V, A), dB = rich(V, B); return norm360(dB - dA) < 180 ? hoekje(V[0], V[1], dA, dB, o) : hoekje(V[0], V[1], dB, dA, o); }
  function pas(pts, W, H, m){
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    var sc = Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * m) / ((y1 - y0) || 1)), ox = (W - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
    return { sc:sc, f:function(p){ return [ox + (p[0] - x0) * sc, H - oy - (p[1] - y0) * sc]; } };
  }
  /* een veelhoek met hoeken, namen en maten */
  function figuur(Pt, o){
    o = o || {};
    var n = Pt.length, s = '', i, cx = 0, cy = 0;
    Pt.forEach(function(p){ cx += p[0] / n; cy += p[1] / n; });
    s += pg(Pt, { f:KL[0], fo:0.1, w:2.5 });
    for (i = 0; i < n; i++){
      var V = Pt[i], N = Pt[(i + 1) % n], Q = Pt[(i + n - 1) % n], a1 = rich(V, N), d = norm360(rich(V, Q) - a1);
      var lab = o.hoek ? o.hoek[i] : null, recht = Math.abs(d - 90) < 0.5;
      if (lab != null && lab !== '') s += hoekje(V[0], V[1], a1, a1 + d, { t:lab, k:lab === '?' ? KL[1] : KL[0], r:d < 50 ? 36 : 26, lr:d < 50 ? 22 : 17 + String(lab).length * 2.5 });
      else if (recht) s += hoekje(V[0], V[1], a1, a1 + d, { k:'var(--ink)' });
    }
    (o.zijde || []).forEach(function(t, j){
      if (t == null || t === '') return;
      var A = Pt[j], B = Pt[(j + 1) % n], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nv = [(B[1] - A[1]) / L, -(B[0] - A[0]) / L];
      if (nv[0] * (mx - cx) + nv[1] * (my - cy) < 0) nv = [-nv[0], -nv[1]];
      var afst = 16 + Math.abs(nv[0]) * 4 * String(t).length;
      s += mtx(mx + nv[0] * afst, my + nv[1] * afst, t, { mid:true, vet:true, k:t === '?' ? KL[1] : null, fs:16 });
    });
    (o.namen || []).forEach(function(t, j){
      if (!t) return;
      var V = Pt[j], dx = V[0] - cx, dy = V[1] - cy, L = Math.hypot(dx, dy) || 1;
      s += mtx(V[0] + dx / L * 18, V[1] + dy / L * 18, t, { mid:true, vet:true, fs:16 });
    });
    return s;
  }
  function driePts(al, be){ var t = Math.sin(be * RAD) / Math.sin((al + be) * RAD); return [[0, 0], [1, 0], [t * Math.cos(al * RAD), t * Math.sin(al * RAD)]]; }
  var VN = ['A', 'B', 'C'], ZN = ['a', 'b', 'c'];
  /* driehoek ABC: ang = hoeken bij A, B, C; hl = labels bij de hoeken; zl = labels bij de zijden a, b, c */
  function driehoek(ang, hl, zl){
    var pts = driePts(ang[0], ang[1]), t = pas(pts, 400, 260, 46), Q = pts.map(t.f);
    return svg(400, 260, figuur(Q, { hoek:hl, zijde:[zl[2], zl[0], zl[1]], namen:VN }), 'driehoek ABC', 420);
  }

  /* ================= de top van een parabool ================= */
  function topVorm(a, p, q){ return coefD(a) + haak(p) + '²' + plusQ(q); }
  function mTopVorm(R){
    var a = R.kies([1, -1, 2, -2, 3, -3, 0.5, -0.5]), p = nz(R, -6, 6), q = R.heel(-9, 9), h = haak(p), dal = a > 0, keuze = ['laagste punt: een dalparabool', 'hoogste punt: een bergparabool'];
    return { vraag:'f(x) = ' + topVorm(a, p, q), context:'Wat is de top van de parabool? Schrijf hem als (x, y).', antwoord:punt(p, q), controle:puntC(p, q), invoer:'tekst', stappen:[
      S(h + ' is 0 als x =', p, 'Welk getal moet je invullen om ' + h + ' 0 te maken?', F(p, -p, 'Let op het teken: ' + h + ' is 0 bij x = ' + T(p) + '.')),
      S('Het getal achter het kwadraat is de y van de top: y =', q, q ? 'Het losse getal achteraan, met het teken ervoor: ' + T(q) + '.' : 'Er staat geen getal achteraan, dus y = 0.', q ? F(q, -q, 'Neem het teken voor het getal mee.') : null),
      K(R, 'a = ' + T(a) + '. Is de top het laagste of het hoogste punt?', dal ? keuze[0] : keuze[1], [], dal ? 'a is positief: een dalparabool, de top is het laagste punt.' : 'a is negatief: een bergparabool, de top is het hoogste punt.', { orde:keuze }),
      SC('De top (x, y):', punt(p, q), puntC(p, q), 'Eerst x, dan y: ' + punt(p, q) + '.', F(punt(p, q), punt(-p, q), 'Let op het teken van x.', punt(q, p), 'Je draaide ze om. Eerst x, dan y.')) ] };
  }
  function abcTop(R){
    var a, p, q, b, c;
    do { a = R.kies([1, -1, 2, -2, 3, -3]); p = nz(R, -5, 5); q = R.heel(-9, 9); b = -2 * a * p; c = a * p * p + q; } while (Math.abs(c) > 30);
    return { a:a, p:p, q:q, b:b, c:c, f:'f(x) = ' + E([[a, 'x²'], [b, 'x'], [c, '']]) };
  }
  function topStappenAbc(R, g){
    var a = g.a, b = g.b, c = g.c, p = g.p, q = g.q;
    var hy = 'Vul x = ' + T(p) + ' in: ' + T(a) + ' ' + X + ' ' + paren(p) + '² = ' + T(a * p * p) + ' en ' + T(b) + ' ' + X + ' ' + paren(p) + ' = ' + T(b * p) + '. Dan ' + T(a * p * p) + ' + ' + paren(b * p) + (c ? ' + ' + paren(c) : '') + ' = ' + T(q) + '.';
    return [
      S('Lees af: a = ' + T(a) + ' en b =', b, 'Het getal voor x, met het teken ervoor: ' + T(b) + '.', F(b, -b, 'Neem het teken voor het getal mee.')),
      S('x = ' + MIN + 'b : 2a = ' + T(-b) + ' : ' + paren(2 * a) + ' =', p, MIN + 'b is het tegengestelde van ' + T(b) + ', dus ' + T(-b) + '. En 2a = 2 ' + X + ' ' + paren(a) + ' = ' + T(2 * a) + '.', F(p, -p, 'Let op de min voor b, en op het teken van 2a.')),
      S('y = f(' + T(p) + ') =', q, hy) ];
  }
  function mTopAbc(R){
    var g = abcTop(R);
    return { vraag:g.f, context:'Bereken de top met x = ' + MIN + 'b : 2a. Schrijf hem als (x, y).', antwoord:punt(g.p, g.q), controle:puntC(g.p, g.q), invoer:'tekst',
      stappen:topStappenAbc(R, g).concat([SC('De top (x, y):', punt(g.p, g.q), puntC(g.p, g.q), 'Eerst x, dan y: ' + punt(g.p, g.q) + '.', F(punt(g.p, g.q), punt(g.q, g.p), 'Je draaide ze om. Eerst x, dan y.'))]) };
  }
  function mTopSym(R){
    var a, n1v, h, n2v, m, q;
    do { a = R.kies([1, -1, 2, -2, 3, 0.5]); h = R.heel(1, 4); n1v = R.heel(-6, 6 - 2 * h); } while (Math.abs(a) * h * h > 12 || (a === 0.5 && h % 2));
    n2v = n1v + 2 * h; m = n1v + h; q = -a * h * h;
    var fac = function(n){ return haak(n); };
    var vorm = coefD(a) + (n1v === 0 ? 'x' + haak(n2v) : n2v === 0 ? 'x' + haak(n1v) : haak(n1v) + haak(n2v));
    var f = function(x){ return a * (x - n1v) * (x - n2v); }, yb = [Math.min(-2, Math.floor(q) - 1), Math.max(2, Math.ceil(q) + 1)];
    function pl(n){
      var pts = [];
      if (n >= 1) pts.push({ x:n1v, y:0, k:3 }); if (n >= 2) pts.push({ x:n2v, y:0, k:3 }); if (n >= 5) pts.push({ x:m, y:q, k:1, label:punt(m, q) });
      return assen({ xmin:-7, xmax:7, ymin:yb[0], ymax:yb[1], lijnen:n >= 5 ? [{ f:f, k:0 }] : [], vlijn:n >= 3 ? [{ x:m, k:1 }] : [], punten:pts, aria:'parabool met nulpunten en symmetrieas' });
    }
    var hm = 'Vul x = ' + T(m) + ' in: ' + T(a) + ' ' + X + ' ' + paren(m - n1v) + ' ' + X + ' ' + paren(m - n2v) + ' = ' + T(q) + '.';
    return { vraag:'f(x) = ' + vorm, context:'Bereken de top. Gebruik dat hij midden tussen de nulpunten ligt. Schrijf hem als (x, y).', antwoord:punt(m, q), controle:puntC(m, q), invoer:'tekst', beeld:pl, stappen:[
      S('Het eerste nulpunt: ' + fac(n1v) + ' = 0 geeft x =', n1v, 'Welke x maakt ' + fac(n1v) + ' nul?', n1v ? F(n1v, -n1v, 'Let op het teken: ' + fac(n1v) + ' is 0 bij x = ' + T(n1v) + '.') : null),
      S('Het tweede nulpunt: ' + fac(n2v) + ' = 0 geeft x =', n2v, 'Welke x maakt ' + fac(n2v) + ' nul?', n2v ? F(n2v, -n2v, 'Let op het teken: ' + fac(n2v) + ' is 0 bij x = ' + T(n2v) + '.') : null),
      S('Het midden: (' + T(n1v) + ' + ' + paren(n2v) + ') : 2 =', m, 'Tel de nulpunten op en deel door 2: ' + T(n1v + n2v) + ' : 2.', h !== m ? F(m, h, 'Dat is de halve afstand. Het midden is de som gedeeld door 2.') : null),
      S('y = f(' + T(m) + ') =', q, hm),
      SC('De top (x, y):', punt(m, q), puntC(m, q), 'Eerst x, dan y: ' + punt(m, q) + '.') ] };
  }

  /* ================= functiewaarde, domein en bereik ================= */
  function mWaarde(R){
    var drie = R.heel(0, 3) === 0, st = [], a, b, c, x, f, t1, t2, val, xs;
    if (!drie){
      a = R.kies([1, -1, 2, -2, 3, -3]); b = nz(R, -6, 6); c = R.heel(-9, 9); x = nz(R, -4, 4);
      f = 'f(x) = ' + E([[a, 'x²'], [b, 'x'], [c, '']]); t1 = a * x * x; t2 = b * x; val = t1 + t2 + c;
      st.push(S('(' + T(x) + ')² =', x * x, x < 0 ? 'Min keer min is plus: ' + paren(x) + ' ' + X + ' ' + paren(x) + ' = ' + (x * x) + '.' : T(x) + ' ' + X + ' ' + T(x) + '.', x < 0 ? F(x * x, -x * x, 'Een kwadraat is nooit negatief: min keer min is plus.') : null));
      if (a !== 1) st.push(S(T(a) + ' · ' + T(x * x) + ' =', t1, 'Vermenigvuldig ' + T(a) + ' met ' + T(x * x) + '.'));
    } else {
      a = R.kies([1, -1, 2, -2]); b = nz(R, -9, 9); c = R.heel(-9, 9); x = nz(R, -3, 3);
      f = 'f(x) = ' + E([[a, 'x³'], [b, 'x'], [c, '']]); xs = x * x * x; t1 = a * xs; t2 = b * x; val = t1 + t2 + c;
      st.push(S('(' + T(x) + ')³ =', xs, T(x) + ' ' + X + ' ' + T(x) + ' ' + X + ' ' + T(x) + '.' + (x < 0 ? ' Drie keer een min-getal: het blijft min.' : ''), x < 0 ? F(xs, -xs, 'Drie mintekens: min keer min is plus, en dan nog een keer min.') : null));
      if (a !== 1) st.push(S(T(a) + ' · ' + paren(xs) + ' =', t1, 'Vermenigvuldig ' + T(a) + ' met ' + T(xs) + '.'));
    }
    st.push(S(T(b) + ' · (' + T(x) + ') =', t2, (b < 0 && x < 0 ? 'Min keer min is plus. ' : b < 0 || x < 0 ? 'Min keer plus is min. ' : '') + T(b) + ' ' + X + ' ' + paren(x) + ' = ' + T(t2) + '.', F(t2, -t2, 'Let op het teken.')));
    st.push(S('f(' + T(x) + ') = ' + T(t1) + ' + ' + paren(t2) + (c ? ' + ' + paren(c) : '') + ' =', val, 'Tel de stukken op: ' + T(t1) + ' + ' + paren(t2) + (c ? ' + ' + paren(c) : '') + '.'));
    return { vraag:f + ', f(' + T(x) + ') = ?', vraagHtml:Sch(f) + '<br>f(' + T(x) + ') = ?', context:'Bereken de functiewaarde. Zet het getal tussen haakjes als je het invult.', stappen:st };
  }
  function binnen(b, c){ return b > 0 ? E([[b, 'x'], [c, '']]) : E([[c, ''], [b, 'x']]); }
  function wortelF(d, a, inner){
    var w = (Math.abs(a) === 1 ? '' : T(Math.abs(a))) + (inner === 'x' ? '√x' : '√(' + inner + ')');
    return d ? T(d) + (a < 0 ? ' ' + MIN + ' ' : ' + ') + w : (a < 0 ? MIN : '') + w;
  }
  function mDomein(R){
    var b = R.kies([1, 1, 2, 3, -1, -2]), r = nz(R, -6, 8), c = -b * r, a = R.kies([1, 2, 3, -1, -2]), d = R.heel(-5, 5), inner = binnen(b, c);
    var teken = b > 0 ? '≥' : '≤', ant = ongT('x', teken, r), st = [];
    st.push(S('Onder de wortel mag geen negatief getal staan: ' + inner + ' ≥ 0. Breng het losse getal naar rechts: ' + E([[b, 'x']]) + ' ≥', -c, c > 0 ? 'Trek aan beide kanten ' + T(c) + ' af.' : 'Tel aan beide kanten ' + T(-c) + ' op.', F(-c, c, 'Naar de andere kant: tel op wat eraf ging, of trek af wat erbij kwam.')));
    if (b !== 1){
      var keuze = ['het blijft ≥', 'het klapt om: ≥ wordt ≤'];
      st.push(K(R, 'Je deelt door ' + T(b) + '. Wat gebeurt er met het teken ≥?', b < 0 ? keuze[1] : keuze[0], [], b < 0 ? 'Delen door een negatief getal: het teken klapt om.' : T(b) + ' is positief: het teken blijft staan.', { orde:keuze }));
    }
    var fo = b < 0 ? F(ant, 'x ≥ ' + T(r), 'Je deelde door een negatief getal: het teken klapt om.', 'x >= ' + T(r), 'Je deelde door een negatief getal: het teken klapt om.') : F(ant, 'x ≤ ' + T(r), 'Het teken klapt alleen om als je door een negatief getal deelt.', 'x <= ' + T(r), 'Het teken klapt alleen om als je door een negatief getal deelt.');
    st.push(SC('Het domein:', ant, ongL('x', teken, r), b === 1 ? 'Er staat al x ≥ ' + T(r) + '.' : T(-c) + ' : ' + paren(b) + ' = ' + T(r) + (b < 0 ? '. Het teken klapt om: x ≤ ' + T(r) + '.' : ', dus x ≥ ' + T(r) + '.'), fo));
    return { vraag:'f(x) = ' + wortelF(d, a, inner), context:'Wat is het domein van f? Schrijf het zoals x ≥ 3. Typ >= voor ≥ en <= voor ≤.', antwoord:ant, controle:ongL('x', teken, r), invoer:'tekst', stappen:st };
  }
  function mBereikW(R){
    var b = R.kies([1, 1, 2, 3]), r = nz(R, -6, 6), c = -b * r, a = R.kies([1, 2, 3, -1, -2, -3]), d = R.heel(-6, 6), inner = binnen(b, c);
    var teken = a > 0 ? '≥' : '≤', ant = ongT('y', teken, d), keuze = ['omhoog', 'omlaag'];
    return { vraag:'f(x) = ' + wortelF(d, a, inner), context:'Wat is het bereik van f? Schrijf het zoals y ≥ 2. Typ >= voor ≥ en <= voor ≤.', antwoord:ant, controle:ongL('y', teken, d), invoer:'tekst', stappen:[
      S('Het beginpunt: ' + inner + ' = 0 geeft x =', r, 'Los op: ' + inner + ' = 0.', F(r, -r, 'Let op het teken.')),
      S('Daar is de wortel 0. f(' + T(r) + ') =', d, d ? 'De wortel van 0 is 0. Alleen ' + T(d) + ' blijft over.' : 'De wortel van 0 is 0, en er staat geen los getal: y = 0.'),
      K(R, 'Er staat ' + (a > 0 ? '+' : MIN) + ' voor de wortel. Gaat de grafiek vanaf het beginpunt omhoog of omlaag?', a > 0 ? 'omhoog' : 'omlaag', [], 'Een wortel is nooit negatief. Met + ervoor komt er iets bij, met ' + MIN + ' gaat er iets af.', { orde:keuze }),
      SC('Het bereik:', ant, ongL('y', teken, d), 'De grafiek begint bij y = ' + T(d) + ' en gaat ' + (a > 0 ? 'omhoog: y ≥ ' : 'omlaag: y ≤ ') + T(d) + '.', F(ant, 'y ' + (a > 0 ? '≤' : '≥') + ' ' + T(d), 'Kijk nog eens naar het teken voor de wortel.')) ] };
  }
  function mBereikP(R){
    var g = abcTop(R), dal = g.a > 0, keuze = ['een dalparabool: de top is het laagste punt', 'een bergparabool: de top is het hoogste punt'], teken = dal ? '≥' : '≤', ant = ongT('y', teken, g.q);
    var st = [K(R, 'a = ' + T(g.a) + '. Wat voor parabool is het?', dal ? keuze[0] : keuze[1], [], dal ? 'a is positief: een dalparabool.' : 'a is negatief: een bergparabool.', { orde:keuze })].concat(topStappenAbc(R, g).slice(1));
    st.push(SC('Het bereik:', ant, ongL('y', teken, g.q), (dal ? 'Het laagste punt heeft y = ' + T(g.q) + ', dus y ≥ ' : 'Het hoogste punt heeft y = ' + T(g.q) + ', dus y ≤ ') + T(g.q) + '.', F(ant, 'y ' + (dal ? '≤' : '≥') + ' ' + T(g.q), 'Kijk nog eens: is het een dal- of een bergparabool?')));
    return { vraag:g.f, context:'Wat is het bereik van f? Bereken eerst de top. Schrijf het zoals y ≥ ' + MIN + '5. Typ >= voor ≥ en <= voor ≤.', antwoord:ant, controle:ongL('y', teken, g.q), invoer:'tekst', stappen:st };
  }

  /* ================= transformaties ================= */
  /* een veelterm met een ander stuk op de plek van x: sub([0,-4,1], '(x − 3)') = '(x − 3)² − 4(x − 3)' */
  function sub(c, inner){
    var s = '';
    for (var k = c.length - 1; k >= 0; k--){
      var v = c[k]; if (!v) continue;
      var abs = Math.abs(v), stuk = k === 0 ? T(abs) : (abs === 1 ? '' : T(abs)) + inner + (k > 1 ? sup(k) : '');
      s += s ? (v < 0 ? ' ' + MIN + ' ' : ' + ') + stuk : (v < 0 ? MIN : '') + stuk;
    }
    return s || '0';
  }
  var BASIS = [ { c:[0, 0, 1] }, { c:[0, 0, 0, 1] }, { c:[0, 0, 2] }, { c:[0, 0, -1] }, { c:[-4, 0, 1] }, { c:[0, -4, 1] }, { c:[0, 2, 1] }, { c:[0, -3, 0, 1] } ];
  var BMEER = [ { c:[-4, 0, 1] }, { c:[0, -4, 1] }, { c:[0, 2, 1] }, { c:[0, -3, 0, 1] }, { c:[1, 0, 1] } ];
  function schuifTekst(p, q){
    var l = [];
    if (p) l.push(T(Math.abs(p)) + ' naar ' + (p > 0 ? 'rechts' : 'links'));
    if (q) l.push(T(Math.abs(q)) + ' ' + (q > 0 ? 'omhoog' : 'omlaag'));
    return l.join(' en ');
  }
  function bT(b){ return b === 0.5 ? '½' : b === -0.5 ? MIN + '½' : T(b); }
  function trBeeld(fc, gf, n, klaar){
    return assen({ xmin:-6, xmax:6, ymin:-8, ymax:10, lijnen:[{ f:function(x){ return pv(fc, x); }, k:0 }].concat(n >= klaar ? [{ f:gf, k:3 }] : []), legenda:n >= klaar ? [['f', 0], ['g', 3]] : [['f', 0]], aria:'grafiek van f en het beeld g' });
  }
  function mTrPunt(R){
    var soort = R.kies(['schuif', 'schuif', 'xas', 'yas']), x0 = nz(R, -4, 4), y0 = nz(R, -4, 4), nx = x0, ny = y0, desc, keuze = ['alleen x', 'alleen y', 'x en y allebei'], goed, hx, hy;
    if (soort === 'schuif'){
      var p = nz(R, -5, 5), q = nz(R, -5, 5); nx = x0 + p; ny = y0 + q; desc = 'Je verschuift de grafiek ' + schuifTekst(p, q); goed = keuze[2];
      hx = 'Naar ' + (p > 0 ? 'rechts: tel ' + p + ' op bij x.' : 'links: trek ' + (-p) + ' af van x.'); hy = (q > 0 ? 'Omhoog: tel ' + q + ' op bij y.' : 'Omlaag: trek ' + (-q) + ' af van y.');
    } else if (soort === 'xas'){
      var a = R.kies([2, 3, 4, 0.5]); if (a === 0.5 && y0 % 2) y0 *= 2; ny = a * y0; desc = 'Je vermenigvuldigt de grafiek ten opzichte van de x-as met ' + bT(a); goed = keuze[1];
      hx = 'Ten opzichte van de x-as blijft x hetzelfde.'; hy = 'y wordt ' + bT(a) + ' keer zo groot: ' + bT(a) + ' ' + X + ' ' + paren(y0) + ' = ' + T(ny) + '.';
    } else {
      var b = R.kies([2, 3, 4, 0.5]); if (b === 0.5 && x0 % 2) x0 *= 2; nx = b * x0; ny = y0; desc = 'Je vermenigvuldigt de grafiek ten opzichte van de y-as met ' + bT(b); goed = keuze[0];
      hx = 'x wordt ' + bT(b) + ' keer zo groot: ' + bT(b) + ' ' + X + ' ' + paren(x0) + ' = ' + T(nx) + '.'; hy = 'Ten opzichte van de y-as blijft y hetzelfde.';
    }
    if (soort !== 'schuif'){ nx = soort === 'yas' ? nx : x0; }
    var lo = Math.min(0, x0, nx, y0, ny), hi = Math.max(0, x0, nx, y0, ny);
    function pl(n){ return assen({ xmin:Math.min(-2, Math.min(x0, nx) - 1), xmax:Math.max(2, Math.max(x0, nx) + 1), ymin:Math.min(-2, Math.min(y0, ny) - 1), ymax:Math.max(2, Math.max(y0, ny) + 1),
      punten:[{ x:x0, y:y0, k:0, label:'A' }].concat(n >= 4 ? [{ x:nx, y:ny, k:3, label:'A′' }] : []), aria:'punt A en zijn beeld' }); }
    return { vraag:'A' + punt(x0, y0), context:'Het punt A' + punt(x0, y0) + ' ligt op de grafiek van f. ' + desc + '. Wat is het beeld A′ van A? Schrijf als (x, y).', antwoord:punt(nx, ny), controle:puntC(nx, ny), invoer:'tekst', beeld:pl, stappen:[
      K(R, 'Welke coördinaten veranderen?', goed, [], soort === 'schuif' ? 'Verschuiven naar links of rechts verandert x, omhoog of omlaag verandert y.' : soort === 'xas' ? 'Ten opzichte van de x-as: de afstand tot de x-as verandert, dat is y.' : 'Ten opzichte van de y-as: de afstand tot de y-as verandert, dat is x.', { orde:keuze }),
      S('De nieuwe x =', nx, hx, F(nx, soort === 'xas' ? a * x0 : soort === 'yas' ? x0 : x0 - (nx - x0), soort === 'xas' ? 'Ten opzichte van de x-as verandert x niet.' : soort === 'yas' ? 'Ten opzichte van de y-as verandert juist x.' : 'Rechts is erbij, links is eraf.')),
      S('De nieuwe y =', ny, hy, F(ny, soort === 'yas' ? b * y0 : soort === 'xas' ? y0 : y0 - (ny - y0), soort === 'yas' ? 'Ten opzichte van de y-as verandert y niet.' : soort === 'xas' ? 'Ten opzichte van de x-as verandert juist y.' : 'Omhoog is erbij, omlaag is eraf.')),
      SC('Het beeld A′ (x, y):', punt(nx, ny), puntC(nx, ny), 'Eerst x, dan y: ' + punt(nx, ny) + '.') ] };
  }
  function mTrSchuif(R){
    var B = R.kies(BASIS), p = nz(R, -4, 4), q = nz(R, -4, 4), h = haak(p), cq = B.c.slice(); cq[0] += q; var g = sub(cq, h);
    var gf = function(x){ return pv(B.c, x - p) + q; };
    return { vraag:'f(x) = ' + P(B.c), context:'Je verschuift de grafiek van f ' + schuifTekst(p, q) + '. Wat is de formule van het beeld g? Je mag de haakjes laten staan.', antwoord:'g(x) = ' + g, controle:exprC(g), invoer:'tekst',
      beeld:function(n){ return trBeeld(B.c, gf, n, 3); }, stappen:[
      SC(T(Math.abs(p)) + ' naar ' + (p > 0 ? 'rechts' : 'links') + ': x vervang je door', h, exprC(h.replace(/[()]/g, '')), 'Naar rechts is min, naar links is plus: ' + h + '.', F(h, haak(-p), 'Andersom: naar rechts schuiven geeft x ' + MIN + ' een getal.', haak(-p).replace(/[()]/g, ''), 'Andersom: naar rechts schuiven geeft x ' + MIN + ' een getal.')),
      S(T(Math.abs(q)) + ' ' + (q > 0 ? 'omhoog' : 'omlaag') + ': bij de hele formule tel je op', q, 'Omhoog is erbij, omlaag is eraf: ' + T(q) + '.', F(q, -q, 'Omhoog is +, omlaag is ' + MIN + '.')),
      SC('De nieuwe formule: g(x) =', g, exprC(g), 'Vervang elke x in ' + P(B.c) + ' door ' + h + (q > 0 ? ' en tel ' + T(q) + ' op: ' : ' en trek ' + T(-q) + ' af: ') + g + '. Typ bijvoorbeeld ' + typ(g) + '.') ] };
  }
  function mTrXas(R){
    var B = R.kies(BMEER), a = R.kies([2, 3, 4, 0.5]), g = coefD(a) + '(' + P(B.c) + ')', x1, y1; do { x1 = R.kies([-2, -1, 1, 2, 3]); y1 = pv(B.c, x1); } while (!y1 || Math.abs(y1) > 12);
    var keuze = ['de y-coördinaten', 'de x-coördinaten'];
    var gf = function(x){ return a * pv(B.c, x); };
    return { vraag:'f(x) = ' + P(B.c), context:'Je vermenigvuldigt de grafiek van f ten opzichte van de x-as met ' + bT(a) + '. Wat is de formule van het beeld g? Je mag de haakjes laten staan.', antwoord:'g(x) = ' + g, controle:exprC(g), invoer:'tekst',
      beeld:function(n){ return trBeeld(B.c, gf, n, 3); }, stappen:[
      K(R, 'Wat verandert er bij vermenigvuldigen ten opzichte van de x-as?', keuze[0], [], 'De afstand tot de x-as wordt ' + bT(a) + ' keer zo groot. Die afstand is de y.', { orde:keuze }),
      S('Het punt ' + punt(x1, y1) + ' ligt op de grafiek van f. Het beeld is (' + T(x1) + ', ?). ? =', a * y1, bT(a) + ' ' + X + ' ' + paren(y1) + ' = ' + T(a * y1) + '.', F(a * y1, y1, 'y moet ' + bT(a) + ' keer zo groot worden.')),
      SC('Dus de hele formule keer ' + bT(a) + ': g(x) =', g, exprC(g), 'Zet haakjes om de formule en ' + bT(a) + ' ervoor: ' + g + '. Typ bijvoorbeeld ' + typ(g).replace('½', '0,5') + '.') ] };
  }
  function mTrYas(R){
    var B = R.kies(BASIS.slice(0, 2).concat(BMEER.slice(1, 4))), b = R.kies([2, 3, 0.5]), inner = { 2:'½x', 3:'⅓x', 0.5:'2x', '-1':MIN + 'x' }[b], g = sub(B.c, '(' + inner + ')'), keuze = ['de x-coördinaten', 'de y-coördinaten'];
    var x1 = b === 0.5 ? R.kies([-2, 2]) : R.kies([-2, -1, 1, 2]), y1 = pv(B.c, x1), gf = function(x){ return pv(B.c, x / b); };
    var deel = b === -1 ? 'x : ' + paren(-1) + ' = ' + MIN + 'x' : 'x : ' + bT(b) + ' = ' + inner;
    return { vraag:'f(x) = ' + P(B.c), context:'Je vermenigvuldigt de grafiek van f ten opzichte van de y-as met ' + bT(b) + '. Wat is de formule van het beeld g? Je mag de haakjes laten staan.', antwoord:'g(x) = ' + g, controle:exprC(g), invoer:'tekst',
      beeld:function(n){ return trBeeld(B.c, gf, n, 4); }, stappen:[
      K(R, 'Wat verandert er bij vermenigvuldigen ten opzichte van de y-as?', keuze[0], [], 'De afstand tot de y-as wordt ' + bT(b) + ' keer zo groot. Die afstand is de x.', { orde:keuze }),
      S('Het punt ' + punt(x1, y1) + ' ligt op de grafiek van f. Het beeld is (?, ' + T(y1) + '). ? =', b * x1, bT(b) + ' ' + X + ' ' + paren(x1) + ' = ' + T(b * x1) + '.', F(b * x1, x1 / b, 'Andersom: x wordt ' + bT(b) + ' keer zo groot.')),
      SC('In de formule vervang je x door', inner, exprC(inner), 'Als x ' + bT(b) + ' keer zo groot wordt, deel je in de formule door ' + bT(b) + ': ' + deel + '.', b === 2 || b === 3 ? F(inner, b + 'x', 'Andersom: de grafiek wordt breder, dus je deelt x door ' + b + '.') : b === 0.5 ? F(inner, '½x', 'Andersom: x : ½ is x ' + X + ' 2.', '0,5x', 'Andersom: x : ½ is x ' + X + ' 2.') : null),
      SC('De nieuwe formule: g(x) =', g, exprC(g), 'Vervang elke x in ' + P(B.c) + ' door (' + inner + '): ' + g + '.') ] };
  }
  function mTrTwee(R){
    var B = R.kies([{ c:[0, 0, 1], t:'x²', e:'²' }, { c:[0, 0, 0, 1], t:'x³', e:'³' }]), a = R.kies([2, 3, 4, 0.5]), p = nz(R, -4, 4), q = nz(R, -4, 4), xs = R.heel(0, 1) === 1;
    var dA = 'vermenigvuldigen ten opzichte van de x-as met ' + bT(a), dS = schuifTekst(p, q) + ' verschuiven', s1, s2, h1, h2;
    if (xs){ s1 = coefD(a) + B.t; s2 = coefD(a) + haak(p) + B.e + plusQ(q);
      h1 = 'Keer ' + bT(a) + ': y = ' + s1 + '.'; h2 = 'Vervang x door ' + haak(p) + (q > 0 ? ' en tel ' + T(q) + ' op: ' : ' en trek ' + T(-q) + ' af: ') + s2 + '.'; }
    else { s1 = haak(p) + B.e + plusQ(q); s2 = coefD(a) + haak(p) + B.e + plusQ(a * q);
      h1 = 'Vervang x door ' + haak(p) + (q > 0 ? ' en tel ' + T(q) + ' op: ' : ' en trek ' + T(-q) + ' af: ') + s1 + '.'; h2 = 'Zet de hele formule keer ' + bT(a) + '. Ook het losse getal: ' + bT(a) + ' ' + X + ' ' + paren(q) + ' = ' + T(a * q) + '. Dus ' + s2 + '.'; }
    var gf = function(x){ return a * pv(B.c, x - p) + (xs ? q : a * q); }, eerst = xs ? dA : dS, dan = xs ? dS : dA;
    return { vraag:'f(x) = ' + B.t, context:'Je verandert de grafiek van f in twee stappen. Eerst: ' + eerst + '. Daarna: ' + dan + '. Wat is de formule van het beeld g?', antwoord:'g(x) = ' + s2, controle:exprC(s2), invoer:'tekst',
      beeld:function(n){ return trBeeld(B.c, gf, n, 3); }, stappen:[
      K(R, 'Wat doe je eerst?', eerst, [], 'Werk in de volgorde van de opgave: eerst ' + eerst + '.', { orde:[dA, dS] }),
      SC('Na de eerste stap: y =', s1, exprC(s1), h1),
      SC('Na de tweede stap: g(x) =', s2, exprC(s2), h2 + ' Typ bijvoorbeeld ' + typ(s2).replace('½', '0,5') + '.') ] };
  }

  /* ================= machten en wortelvergelijkingen ================= */
  function mNeg(R){
    var soort = R.kies(['boven', 'boven', 'onder', 'beide', 'deel']), n = R.heel(1, 5), xn = 'x' + (n > 1 ? sup(n) : ''), st = [], a, vraag;
    var expStap = S('1/' + xn + ' = x tot de macht', -n, 'Delen door ' + xn + ' is keer x' + sup(-n) + ': onder de deelstreep wordt de exponent negatief.', F(-n, n, 'Onder de deelstreep wordt de exponent negatief.'));
    if (soort === 'boven'){ a = R.heel(2, 9); vraag = a + '/' + xn; st.push(expStap); }
    else if (soort === 'onder'){ var k = R.kies([2, 4, 5, 10]); a = 1 / k; vraag = '1/(' + k + xn + ')';
      st.push(S('Het getal ervoor: 1 : ' + k + ' =', a, '1 gedeeld door ' + k + ' als kommagetal.', F(a, k, 'Het getal staat onder de deelstreep: je deelt erdoor.'))); st.push(expStap); }
    else if (soort === 'beide'){ var k2 = R.kies([2, 3, 4, 5]), mm = R.heel(2, 5); a = mm; vraag = (k2 * mm) + '/(' + k2 + xn + ')';
      st.push(S('Het getal ervoor: ' + (k2 * mm) + ' : ' + k2 + ' =', mm, 'Deel de getallen door elkaar.')); st.push(expStap); }
    else { var p = R.heel(1, 4), q = p + n; a = 1; vraag = 'x' + (p > 1 ? sup(p) : '') + '/x' + sup(q);
      st.push(S('Bij delen trek je de exponenten af: ' + p + ' ' + MIN + ' ' + q + ' =', -n, 'Exponent boven min exponent onder: ' + p + ' ' + MIN + ' ' + q + '.', F(-n, n, 'Boven min onder: ' + p + ' ' + MIN + ' ' + q + ' is negatief.'))); }
    var ant = macStr(a, -n);
    st.push(SC('Als macht:', ant, macC(a, -n), 'Het getal ervoor is ' + T(a) + ' en de exponent is ' + T(-n) + ': ' + ant + '. Typ ' + typ(ant) + '.'));
    return { vraag:vraag, context:'Schrijf als a · xⁿ. Typ bijvoorbeeld 5x^-3.', antwoord:ant, controle:macC(a, -n), invoer:'tekst', stappen:st };
  }
  function mGebr(R){
    var soort = R.kies(['wortel', 'derde', 'xwortel', 'xwortel', 'onder', 'macht']), st = [], a = 1, n, vraag;
    var wStap = S('√x = x tot de macht', ['0,5', '1/2'], 'Een wortel is de macht 0,5, want x^0,5 · x^0,5 = x¹.', F('0,5', '2', 'Een wortel is een halve macht: 0,5.'));
    if (soort === 'wortel'){ a = R.heel(1, 9); n = 0.5; vraag = (a > 1 ? a : '') + '√x'; st.push(wStap); }
    else if (soort === 'derde'){ a = R.kies([1, 2, 3, 5]); n = 1 / 3; vraag = (a > 1 ? a : '') + '∛x'; st.push(S('∛x = x tot de macht', ['1/3'], 'De derdemachtswortel is de macht 1/3. Typ 1/3.', F('1/3', '3', 'Het is een breuk: 1/3.'))); }
    else if (soort === 'xwortel'){ var k = R.heel(1, 3); a = R.kies([1, 1, 2, 4]); n = k + 0.5; vraag = (a > 1 ? a : '') + 'x' + (k > 1 ? sup(k) : '') + '√x'; st.push(wStap);
      st.push(S('x' + sup(k) + ' · x^0,5 = x tot de macht ' + k + ' + 0,5 =', n, 'Bij keer tel je de exponenten op: ' + k + ' + 0,5.', F(n, k * 0.5, 'Bij keer tel je de exponenten op, niet keer.'))); }
    else if (soort === 'onder'){ a = R.heel(1, 9); n = -0.5; vraag = a + '/√x'; st.push(wStap);
      st.push(S('1/x^0,5 = x tot de macht', -0.5, 'Onder de deelstreep wordt de exponent negatief.', F(-0.5, 0.5, 'Onder de deelstreep wordt de exponent negatief.'))); }
    else { var k3 = R.kies([3, 5]); a = 1; n = k3 / 2; vraag = '√(x' + sup(k3) + ')';
      st.push(S('√(x' + sup(k3) + ') = (x' + sup(k3) + ')^0,5. Macht van een macht: ' + k3 + ' · 0,5 =', n, 'Bij een macht van een macht vermenigvuldig je de exponenten.', F(n, k3 + 0.5, 'Bij een macht van een macht vermenigvuldig je, niet optellen.'))); }
    var ant = macStr(a, n);
    st.push(SC('Als macht:', ant, macC(a, n), 'Het getal ervoor is ' + T(a) + ' en de exponent is ' + (n === 1 / 3 ? '1/3' : T(n)) + ': ' + ant + '.'));
    return { vraag:vraag, context:'Schrijf als a · xⁿ. Typ bijvoorbeeld 3x^0,5 of x^(1/3).', antwoord:ant, controle:macC(a, n), invoer:'tekst', stappen:st };
  }
  function mMachtVgl(R){
    var soort = R.kies(['oneven', 'oneven', 'even', 'even', 'geen', 'scheef']), n, k, c, r, opl, exact = true, st = [];
    if (soort === 'oneven'){ n = R.kies([3, 3, 5]); k = nz(R, n === 5 ? -3 : -6, n === 5 ? 3 : 6); if (Math.abs(k) === 1) k *= 2; c = Math.pow(k, n); opl = [k]; }
    else if (soort === 'even'){ n = 4; k = R.heel(2, 5); c = Math.pow(k, 4); opl = [k, -k]; }
    else if (soort === 'geen'){ n = R.kies([4, 6]); c = -R.kies([16, 81, 64, 10, 20]); opl = []; }
    else {
      n = R.kies([3, 4]); exact = false;
      do { c = R.heel(5, 300) * (n === 3 && R.heel(0, 3) === 0 ? -1 : 1); r = (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), 1 / n); } while (Math.abs(Math.round(r) - r) < 1e-6 || grens(r, 2));
      k = rnd(r, 2); opl = n === 4 ? [k, -k] : [k];
    }
    var a = R.kies([1, 1, 2, 3, 4, 5]), b = R.kies([0, 0, R.heel(-20, 20)]), xn = 'x' + sup(n), vgl = E([[a, xn], [b, '']]) + ' = ' + T(a * c + b);
    if (a !== 1 || b){
      var hv = (b ? (b > 0 ? 'Trek eerst ' + b + ' af' : 'Tel eerst ' + (-b) + ' op') + (a !== 1 ? ' en deel dan door ' + a : '') : 'Deel door ' + a) + ': ' + (b ? '(' + T(a * c + b) + ' ' + (b > 0 ? MIN + ' ' + b : '+ ' + (-b)) + ')' : T(a * c)) + (a !== 1 ? ' : ' + a : '') + ' = ' + T(c) + '.';
      st.push(S('Maak ' + xn + ' vrij: ' + xn + ' =', c, hv));
    }
    var aantal = ['één oplossing', 'twee oplossingen', 'geen oplossing'], goedA = opl.length === 1 ? aantal[0] : opl.length === 2 ? aantal[1] : aantal[2];
    st.push(K(R, 'De exponent ' + n + ' is ' + (n % 2 ? 'oneven' : 'even') + ' en ' + xn + ' = ' + T(c) + '. Hoeveel oplossingen zijn er?', goedA, [], n % 2 ? 'Bij een oneven exponent is er altijd precies één oplossing, ook bij een negatief getal.' : c < 0 ? 'Een even macht is nooit negatief.' : 'Bij een even exponent werkt een positief én een negatief getal.', { orde:aantal }));
    var ant = oplTekst(opl, !exact);
    if (opl.length){
      var pos = Math.abs(opl[0]), wat = Math.abs(c) + '^(1/' + n + ')';
      st.push(S((c < 0 ? 'Reken eerst zonder min: ' : '') + wat + (exact ? ' =' : ' ≈ (rond af op 2 decimalen)'), exact ? pos : uniek([T(pos, { dec:2, vast:true }), T(pos)]),
        exact ? 'Welk getal tot de macht ' + n + ' is ' + Math.abs(c) + '? Of tik in: ' + Math.abs(c) + ' ^ (1 : ' + n + ').' : 'Tik in: ' + Math.abs(c) + ' ^ (1 : ' + n + ') = ' + T(Math.pow(Math.abs(c), 1 / n), { dec:5 }) + '…'));
      st.push(SC('De oplossing' + (opl.length > 1 ? 'en' : '') + ':', ant, oplC(opl), opl.length > 1 ? 'Een even exponent: plus en min. Typ bijvoorbeeld ' + ant + '.' : c < 0 ? 'Een oneven macht van een negatief getal is negatief: ' + ant + '.' : 'Bij een oneven exponent is er één oplossing: ' + ant + '.',
        opl.length > 1 ? F(ant, 'x = ' + T(opl[0]), 'Er is nog een oplossing: het negatieve getal.', T(opl[0]), 'Er is nog een oplossing: het negatieve getal.') : null));
    } else st.push(SC('De oplossing:', ant, oplC([]), 'Een even macht kan niet negatief zijn. Typ: geen oplossing.'));
    return { vraag:vgl, context:'Los op.' + (exact ? '' : ' Rond af op 2 decimalen.'), antwoord:ant, controle:oplC(opl), invoer:'tekst', stappen:st };
  }
  function mWortelVgl(R){
    var soort = R.kies(['kaal', 'kaal', 'voor', 'voor', 'geen']), a = R.kies([1, 1, 2, 3]), x, c, b;
    do { x = R.heel(-5, 12); c = R.heel(1, 7); b = c * c - a * x; } while (Math.abs(b) > 30);
    var inner = E([[a, 'x'], [b, '']]), w = inner === 'x' ? '√x' : '√(' + inner + ')', st = [], vgl, cc = c, p = 0, q = 1;
    if (soort === 'kaal') vgl = w + ' = ' + c;
    else {
      p = nz(R, -9, 9); q = soort === 'geen' ? 1 : R.kies([1, 2, 3]);
      if (soort === 'geen') cc = -R.heel(1, 6);
      vgl = (q > 1 ? q : '') + w + plusQ(p) + ' = ' + T(p + q * cc);
      st.push(S('Maak de wortel vrij: ' + w + ' =', cc, (p > 0 ? 'Trek aan beide kanten ' + p + ' af' : 'Tel aan beide kanten ' + (-p) + ' op') + (q > 1 ? ' en deel door ' + q : '') + '.', F(cc, (p + q * cc + p) / q, 'Naar de andere kant: ' + (p > 0 ? 'trek ' + p + ' af.' : 'tel ' + (-p) + ' op.'))));
    }
    if (soort === 'geen'){
      st.push(K(R, w + ' = ' + T(cc) + '. Kan een wortel negatief zijn?', 'nee, dus er is geen oplossing', ['ja, kwadrateer beide kanten'], 'Een wortel is nooit negatief: √ geeft altijd 0 of meer.'));
      st.push(SC('De oplossing:', 'geen oplossing', oplC([]), 'Een wortel kan niet negatief zijn. Typ: geen oplossing.'));
      return { vraag:vgl, context:'Los op.', antwoord:'geen oplossing', controle:oplC([]), invoer:'tekst', stappen:st };
    }
    st.push(S('Kwadrateer beide kanten: ' + inner + ' =', c * c, c + ' ' + X + ' ' + c + ' = ' + (c * c) + '.', F(c * c, 2 * c, 'Kwadrateren is keer zichzelf, niet keer 2.')));
    st.push(S('Los op: x =', eqAnt(x), losHint(a, b, c * c, x)));
    return { vraag:vgl, context:'Los op.', stappen:st };
  }

  /* ================= logaritmen ================= */
  function lg(g){ return g === 10 ? 'log' : sup(g) + 'log'; }
  function lgA(g, a){ return /[\/√]/.test(String(a)) ? lg(g) + '(' + a + ')' : lg(g) + ' ' + a; }
  function keten(g, e){ var l = []; for (var i = 0; i < e; i++) l.push(g); return l.join(' ' + X + ' '); }
  function mLogDef(R){
    var g = R.kies([2, 2, 3, 3, 4, 5, 10, 10]), rng = { 2:[-4, 7], 3:[-3, 5], 4:[-2, 4], 5:[-2, 4], 10:[-3, 5] }[g], b, aT, hint;
    if ((g === 2 || g === 3 || g === 5) && R.heel(0, 7) === 0){ b = 0.5; aT = '√' + g; hint = '√' + g + ' = ' + g + '^0,5, want een wortel is de macht 0,5.'; }
    else {
      b = R.heel(rng[0], rng[1]); aT = b < 0 ? '1/' + T(Math.pow(g, -b)) : T(Math.pow(g, b));
      hint = b === 0 ? 'Elk getal tot de macht 0 is 1.' : b < 0 ? aT + ' = 1/' + g + sup(-b) + ' = ' + g + sup(b) + ': een negatieve exponent betekent 1 gedeeld door.' : b === 1 ? g + '¹ = ' + g + '.' : keten(g, b) + ' = ' + aT + '. Dat is ' + g + sup(b) + '.';
    }
    var v = lgA(g, aT);
    return { vraag:v, context:'Bereken zonder rekenmachine.', stappen:[
      K(R, 'Wat betekent ' + v + ' = ?', g + '^? = ' + aT, ['?^' + g + ' = ' + aT, aT + '^? = ' + g], lg(g) + ' a is de exponent: ' + g + ' tot de macht ? geeft ' + aT + '.'),
      S(g + '^? = ' + aT + '. De exponent ? =', b === 0.5 ? ['0,5', '1/2'] : b, hint, b < 0 ? F(b, -b, 'Het is een breuk: dan is de exponent negatief.') : null) ] };
  }
  var RS = 'ᵍlog a + ᵍlog b = ᵍlog(a · b)', RV = 'ᵍlog a ' + MIN + ' ᵍlog b = ᵍlog(a : b)', RM = 'n · ᵍlog a = ᵍlog(aⁿ)';
  var LSOM = [[10, 2, 50, 2], [10, 4, 25, 2], [10, 5, 20, 2], [10, 8, 125, 3], [10, 5, 200, 3], [10, 25, 40, 3], [10, 4, 250, 3], [6, 4, 9, 2], [6, 2, 18, 2], [6, 3, 12, 2], [6, 4, 54, 3], [6, 8, 27, 3], [12, 3, 48, 2], [12, 2, 72, 2], [15, 3, 75, 2], [15, 5, 45, 2], [20, 4, 100, 2], [20, 5, 80, 2]];
  var LMACHT = [[10, 5, 2, 4, '+', 2], [10, 2, 2, 25, '+', 2], [10, 5, 3, 8, '+', 3], [10, 2, 3, 125, '+', 3], [6, 2, 2, 9, '+', 2], [6, 3, 2, 4, '+', 2], [6, 2, 3, 27, '+', 3],
    [2, 6, 2, 9, '-', 2], [3, 6, 2, 4, '-', 2], [5, 10, 2, 4, '-', 2], [2, 12, 2, 9, '-', 4], [3, 12, 2, 16, '-', 2], [2, 6, 3, 27, '-', 3], [10, 20, 2, 4, '-', 2]];
  function mLogRegels(R){
    var soort = R.kies(['som', 'verschil', 'macht']), opties = [RS, RV, RM], st = [], vraag, g, res, comb;
    if (soort === 'som'){
      var s = R.kies(LSOM); g = s[0]; res = s[3]; comb = s[1] * s[2]; vraag = lg(g) + ' ' + s[1] + ' + ' + lg(g) + ' ' + s[2];
      st.push(K(R, 'Welke regel gebruik je?', RS, [], 'Er staat een plus tussen twee logaritmen met hetzelfde grondtal.', { orde:opties }));
      st.push(S('Samen: ' + lg(g) + '(' + s[1] + ' · ' + s[2] + ') = ' + lg(g), comb, 'Vermenigvuldig: ' + s[1] + ' ' + X + ' ' + s[2] + ' = ' + comb + '.', F(comb, s[1] + s[2], 'Plus tussen de logaritmen wordt keer binnen de log.')));
    } else if (soort === 'verschil'){
      g = R.kies([2, 3, 5, 10]); res = R.heel(1, { 2:5, 3:3, 5:2, 10:2 }[g]); var m = R.kies({ 2:[3, 5, 7], 3:[2, 4, 5, 7], 5:[2, 3, 4, 6], 10:[3, 7] }[g]); comb = Math.pow(g, res);
      var a = comb * m; vraag = lg(g) + ' ' + T(a) + ' ' + MIN + ' ' + lg(g) + ' ' + m;
      st.push(K(R, 'Welke regel gebruik je?', RV, [], 'Er staat een min tussen twee logaritmen met hetzelfde grondtal.', { orde:opties }));
      st.push(S('Samen: ' + lg(g) + '(' + T(a) + ' : ' + m + ') = ' + lg(g), comb, 'Deel: ' + T(a) + ' : ' + m + ' = ' + T(comb) + '.', F(comb, a - m, 'Min tussen de logaritmen wordt delen binnen de log.')));
    } else {
      var t = R.kies(LMACHT); g = t[0]; res = t[5]; var an = Math.pow(t[1], t[2]); comb = t[4] === '+' ? an * t[3] : an / t[3];
      vraag = t[2] + ' · ' + lg(g) + ' ' + t[1] + ' ' + (t[4] === '+' ? '+' : MIN) + ' ' + lg(g) + ' ' + t[3];
      st.push(K(R, 'Welke regel gebruik je eerst?', RM, [], 'Er staat een getal voor de log: dat wordt een exponent.', { orde:opties }));
      st.push(S(t[2] + ' · ' + lg(g) + ' ' + t[1] + ' = ' + lg(g), an, t[1] + sup(t[2]) + ' = ' + an + '.', F(an, t[1] * t[2], 'Het getal ervoor wordt een exponent: ' + t[1] + sup(t[2]) + ', niet ' + t[1] + ' ' + X + ' ' + t[2] + '.')));
      st.push(S('Samen: ' + lg(g) + ' ' + an + ' ' + (t[4] === '+' ? '+' : MIN) + ' ' + lg(g) + ' ' + t[3] + ' = ' + lg(g), comb, t[4] === '+' ? 'Plus wordt keer: ' + an + ' ' + X + ' ' + t[3] + ' = ' + comb + '.' : 'Min wordt delen: ' + an + ' : ' + t[3] + ' = ' + comb + '.'));
    }
    st.push(S(lg(g) + ' ' + T(comb) + ' =', res, g + sup(res) + ' = ' + T(comb) + '.', F(res, comb, 'Je zoekt de exponent: ' + g + ' tot welke macht is ' + T(comb) + '?')));
    return { vraag:vraag, context:'Bereken zonder rekenmachine met de rekenregels.', stappen:st };
  }
  function mLogVgl(R){
    var g = R.kies([2, 2, 3, 5, 10]), cr = { 2:[-2, 6], 3:[0, 4], 5:[-1, 3], 10:[-1, 3] }[g], c = R.heel(cr[0], cr[1]), G = Math.pow(g, c), a, b, x;
    if (c < 0){ a = 1; b = R.kies([0, 0, 1, 2, -1, -3]); x = Math.round((G - b) * 1e6) / 1e6; }
    else { a = R.kies([1, 1, 2, 3]); x = Math.round(G / a) + R.heel(-12, 12); b = G - a * x; }
    var inner = E([[a, 'x'], [b, '']]), L = inner === 'x' ? lg(g) + ' x' : lg(g) + '(' + inner + ')', voor = R.kies(['kaal', 'kaal', 'plus', 'keer']), vgl, st = [];
    if (voor === 'kaal') vgl = L + ' = ' + T(c);
    else if (voor === 'plus'){ var p = nz(R, -6, 6); vgl = L + plusQ(p) + ' = ' + T(p + c); st.push(S('Maak de log vrij: ' + L + ' =', c, (p > 0 ? 'Trek aan beide kanten ' + p + ' af.' : 'Tel aan beide kanten ' + (-p) + ' op.'))); }
    else { var k = R.heel(2, 4); vgl = k + ' · ' + L + ' = ' + T(k * c); st.push(S('Maak de log vrij: ' + L + ' =', c, 'Deel beide kanten door ' + k + '.')); }
    st.push(S('Gebruik de definitie: ' + inner + ' = ' + g + sup(c) + ' =', G, c < 0 ? g + sup(c) + ' = 1/' + g + sup(-c) + ' = ' + T(G) + '.' : c === 0 ? 'Elk getal tot de macht 0 is 1.' : keten(g, c) + ' = ' + T(G) + '.', F(G, g * c, 'Het is ' + g + ' tot de macht ' + c + ', niet ' + g + ' ' + X + ' ' + c + '.', c, 'Gebruik de definitie: wat achter log staat is ' + g + ' tot de macht ' + c + '.')));
    if (inner !== 'x') st.push(S('Los op: x =', eqAnt(x), losHint(a, b, G, x)));
    return { vraag:vgl, context:'Los op zonder rekenmachine.', antwoord:eqAnt(x), stappen:st };
  }

  /* ================= exponentiële vergelijkingen ================= */
  function mh(g, e){ return g + '<sup>' + e + '</sup>'; }
  function macht2(g, m){ return m < 0 ? '1/' + T(Math.pow(g, -m)) : T(Math.pow(g, m)); }
  function mGelijk(R, soort){
    var g = R.kies([2, 2, 3, 3, 5, 10]), mr = { 2:[-3, 7], 3:[-2, 5], 5:[-2, 4], 10:[-2, 4] }[g], st = [], m, x, vraag, vraagH, expo = 'x';
    soort = soort || R.kies(['kaal', 'voor', 'voor', 'exp']);
    if (soort === 'kaal'){ m = R.heel(mr[0], mr[1]); x = m; vraag = g + '^x = ' + macht2(g, m); vraagH = mh(g, 'x') + ' = ' + macht2(g, m); }
    else if (soort === 'voor'){ m = R.heel(1, Math.min(5, mr[1])); x = m; var k = R.heel(2, 5), d = k * Math.pow(g, m); vraag = k + ' · ' + g + '^x = ' + T(d); vraagH = k + ' · ' + mh(g, 'x') + ' = ' + T(d);
      st.push(S('Maak de macht vrij: ' + mh(g, 'x') + ' = ' + T(d) + ' : ' + k + ' =', Math.pow(g, m), 'Deel beide kanten door ' + k + '.', F(Math.pow(g, m), d - k, 'Er staat keer ' + k + ': deel door ' + k + '.'))); }
    else { var a = R.kies([1, 2]), s = nz(R, -3, 3); do { x = R.heel(-3, 5); m = a * x + s; } while (m < mr[0] || m > mr[1]); expo = E([[a, 'x'], [s, '']]);
      vraag = g + '^(' + expo + ') = ' + macht2(g, m); vraagH = mh(g, expo) + ' = ' + macht2(g, m); }
    var hm = m < 0 ? macht2(g, m) + ' = 1/' + g + sup(-m) + ' = ' + g + sup(m) + '.' : m === 0 ? g + '⁰ = 1.' : m === 1 ? g + '¹ = ' + g + '.' : keten(g, m) + ' = ' + macht2(g, m) + '.';
    st.push(S('Schrijf ' + macht2(g, m) + ' als macht van ' + g + ': ' + macht2(g, m) + ' = ' + g + ' tot de macht', m, hm, m < 0 ? F(m, -m, 'Het is een breuk: dan is de exponent negatief.') : null));
    if (soort === 'exp') st.push(S('De exponenten zijn gelijk: ' + expo + ' = ' + T(m) + ', dus x =', eqAnt(x), 'Los ' + expo + ' = ' + T(m) + ' op met de balans.'));
    else st.push(S('Links ' + mh(g, 'x') + ', rechts ' + mh(g, m) + '. De exponenten zijn gelijk, dus x =', eqAnt(m), 'Hetzelfde grondtal ' + g + ': dan is x gelijk aan ' + T(m) + '.'));
    return { vraag:vraag, vraagHtml:vraagH, context:'Los op zonder rekenmachine. Schrijf beide kanten als macht van hetzelfde getal.', antwoord:eqAnt(x), stappen:st };
  }
  var GROND = [1.02, 1.03, 1.05, 1.08, 1.1, 1.2, 1.25, 1.5, 2, 3, 0.9, 0.8, 0.85, 0.95, 0.75];
  function mMetLog(R){
    var g, v, b, t;
    do {
      g = R.kies(GROND);
      v = g > 1 ? R.kies([1.5, 2, 2.5, 3, 4, 5, 6, 10]) : R.kies([0.5, 0.25, 0.2, 0.4, 0.6, 0.1, 0.3]);
      b = R.kies([1, 2, 4, 5, 10, 20, 50, 100, 200, 400, 500, 800]);
      t = Math.log(v) / Math.log(g);
    } while (Math.abs(t - Math.round(t)) < 0.02 || grens(t, 2) || t > 150 || Math.abs(b * v - Math.round(b * v)) > 1e-9);
    var d = Math.round(b * v), st = [], tr = rnd(t, 2), ant = uniek([T(tr, { dec:2, vast:true }), T(tr)]), omg = rnd(Math.log(g) / Math.log(v), 2);
    var vraag = (b === 1 ? '' : T(b) + ' · ') + T(g) + '^x = ' + T(d), vraagH = (b === 1 ? '' : T(b) + ' · ') + mh(T(g), 'x') + ' = ' + T(d);
    if (b !== 1) st.push(S('Maak de macht vrij: ' + mh(T(g), 'x') + ' = ' + T(d) + ' : ' + T(b) + ' =', v, 'Deel ' + T(d) + ' door ' + T(b) + '.'));
    st.push(K(R, 'Hoe reken je x uit?', 'x = log(' + T(v) + ') : log(' + T(g) + ')', ['x = log(' + T(g) + ') : log(' + T(v) + ')', 'x = ' + T(v) + ' : ' + T(g)], 'x is de logaritme van ' + T(v) + ' met grondtal ' + T(g) + '. Op de rekenmachine: log(' + T(v) + ') : log(' + T(g) + ').'));
    st.push(S('x ≈ (rond af op 2 decimalen)', ant, 'Tik in: log(' + T(v) + ') ÷ log(' + T(g) + ') = ' + T(t, { dec:5 }) + '…', F(ant, T(omg, { dec:2, vast:true }), 'Je deelde andersom. log(' + T(v) + ') komt boven.')));
    return { vraag:vraag, vraagHtml:vraagH, context:'Los op met een logaritme. Rond af op 2 decimalen.', antwoord:ant, stappen:st };
  }

  /* ================= de afgeleide ================= */
  function fp(c){ return P(pd(c)); }
  function mAfgMacht(R){
    var a, n, aT;
    if (R.heel(0, 5) === 0){ var sp = R.kies([[1 / 3, 3, '⅓'], [0.5, 2, '½'], [0.5, 4, '½'], [0.25, 4, '¼'], [1.5, 2, '1,5']]); a = sp[0]; n = sp[1]; aT = sp[2]; }
    else { a = nz(R, -8, 8); n = R.heel(2, 6); aT = coefD(a); }
    var na = Math.round(n * a * 1e9) / 1e9, aShow = a === 1 ? '1' : a === -1 ? MIN + '1' : aT, f = 'f(x) = ' + aT + XP[n], d = E([[na, XP[n - 1]]]);
    return { vraag:f, context:'Bereken de afgeleide f′(x). Typ een macht met ^, zoals 15x^2.', antwoord:'f′(x) = ' + d, controle:exprC(d), invoer:'tekst', stappen:[
      S('De exponent gaat ervoor: ' + n + ' · ' + (a < 0 ? '(' + aShow + ')' : aShow) + ' =', na, 'Vermenigvuldig de exponent ' + n + ' met het getal ervoor (' + aShow + ').', na !== a ? F(na, a, 'Vergeet niet de exponent ervoor te zetten: ' + n + ' keer ' + aShow + '.') : null),
      S('De exponent wordt 1 minder: ' + n + ' ' + MIN + ' 1 =', n - 1, 'Trek 1 af van de exponent.', F(n - 1, n + 1, 'De exponent wordt 1 minder, niet meer.')),
      SC('f′(x) =', d, exprC(d), 'Het getal ' + T(na) + ' met exponent ' + (n - 1) + ': ' + d + '. Typ ' + typ(d) + '.') ] };
  }
  function termAfg(c, k){
    var t = E([[c, XP[k]]]), d = E([[k * c, XP[k - 1]]]);
    return SC('De afgeleide van ' + t + ' is', d, exprC(d), 'De exponent ' + k + ' gaat ervoor: ' + k + ' ' + X + ' ' + paren(c) + ' = ' + T(k * c) + (k > 1 ? ', en de exponent wordt ' + (k - 1) + '.' : '. De x valt weg, want x⁰ = 1.'));
  }
  function mAfgVeel(R){
    var c, tel;
    do {
      c = R.heel(0, 3) === 0 ? [R.heel(-9, 9), 0, nz(R, -6, 6), 0, nz(R, -3, 3)] : [R.heel(-9, 9), R.heel(-8, 8), R.heel(-6, 6), nz(R, -5, 5)];
      tel = c.slice(1).filter(function(v){ return v; }).length;
    } while (tel < 2);
    var st = [];
    for (var k = c.length - 1; k >= 1; k--) if (c[k]) st.push(termAfg(c[k], k));
    if (c[0]) st.push(S('Het losse getal ' + T(c[0]) + ' wordt', 0, 'Een los getal verandert niet: de afgeleide ervan is 0.', F(0, c[0], 'Een los getal valt weg: het wordt 0.')));
    var d = fp(c);
    st.push(SC('f′(x) =', d, exprC(d), 'Zet de stukken achter elkaar: ' + d + '. Typ ' + typ(d) + '.'));
    return { vraag:'f(x) = ' + P(c), context:'Bereken de afgeleide f′(x). Typ een macht met ^, zoals 6x^2 ' + MIN + ' 8x + 5.', antwoord:'f′(x) = ' + d, controle:exprC(d), invoer:'tekst', stappen:st };
  }
  function mAfgHerleid(R){
    var soort = R.kies(['haak', 'haak', 'xhaak', 'breuk', 'wortel']), f, c, st;
    if (soort === 'haak' || soort === 'xhaak'){
      if (soort === 'haak'){ var p = R.kies([1, 2, 3]), q = nz(R, -5, 5), r = R.kies([1, 1, 2]), s = nz(R, -5, 5); f = '(' + E([[p, 'x'], [q, '']]) + ')(' + E([[r, 'x'], [s, '']]) + ')'; c = [q * s, p * s + q * r, p * r]; }
      else if (R.heel(0, 1)){ var a = nz(R, -4, 4), b = nz(R, -6, 6); f = 'x²(' + E([[a, 'x'], [b, '']]) + ')'; c = [0, 0, b, a]; }
      else { var a2 = nz(R, -3, 3), b2 = nz(R, -9, 9); f = 'x(' + E([[a2, 'x²'], [b2, '']]) + ')'; c = [0, b2, 0, a2]; }
      var u = P(c), d = fp(c);
      st = [SC('Werk de haakjes weg: f(x) =', u, exprC(u, { kaal:true }), 'Vermenigvuldig elke term met elke term en neem samen: ' + u + '.'),
        SC('Differentieer: f′(x) =', d, exprC(d), 'Elke term apart: de exponent ervoor en 1 minder. ' + d + '.')];
      return { vraag:'f(x) = ' + f, context:'Werk eerst de haakjes weg en bereken dan f′(x). Typ een macht met ^, zoals 6x^2.', antwoord:'f′(x) = ' + d, controle:exprC(d), invoer:'tekst', stappen:st };
    }
    var k0, n0, vraag;
    if (soort === 'breuk'){ k0 = R.heel(1, 9); var e = R.heel(1, 3); n0 = -e; vraag = k0 + '/x' + (e > 1 ? sup(e) : ''); }
    else if (R.heel(0, 2)){ k0 = R.kies([2, 4, 6, 8, 10]); n0 = 0.5; vraag = k0 + '√x'; }
    else { k0 = R.kies([2, 4]); n0 = 1.5; vraag = k0 + 'x√x'; }
    var m1 = macStr(k0, n0), na = n0 * k0, m2 = macStr(na, n0 - 1);
    st = [SC('Schrijf als macht: f(x) =', m1, macC(k0, n0), soort === 'breuk' ? 'Delen door x' + sup(-n0) + ' is keer x' + sup(n0) + ': ' + m1 + '.' : '√x = x^0,5' + (n0 === 1.5 ? ' en x · x^0,5 = x^1,5' : '') + ': ' + m1 + '.'),
      SC('Differentieer: f′(x) =', m2, macC(na, n0 - 1), 'De exponent ' + T(n0) + ' gaat ervoor: ' + T(n0) + ' ' + X + ' ' + k0 + ' = ' + T(na) + '. De exponent wordt ' + T(n0) + ' ' + MIN + ' 1 = ' + T(n0 - 1) + '. Typ ' + typ(m2) + '.',
        F(m2, macStr(na, n0 + 1), 'De exponent wordt 1 minder, ook als hij negatief is.', typ(macStr(na, n0 + 1)), 'De exponent wordt 1 minder, ook als hij negatief is.'))];
    return { vraag:'f(x) = ' + vraag, context:'Schrijf f eerst als a · xⁿ en bereken dan f′(x). Schrijf je antwoord ook als a · xⁿ, zoals ' + MIN + '6x^-3 of 2x^-0,5.', antwoord:'f′(x) = ' + m2, controle:macC(na, n0 - 1), invoer:'tekst', stappen:st };
  }

  /* ================= de afgeleide gebruiken ================= */
  function polyKies(R){ return R.heel(0, 1) ? [R.heel(-6, 6), nz(R, -6, 6), nz(R, -3, 3)] : [R.heel(-6, 6), R.heel(-6, 6), R.heel(-3, 3), nz(R, -2, 2)]; }
  function invul(c, x){
    var t = [];
    for (var i = c.length - 1; i >= 0; i--) if (c[i]) t.push((t.length ? paren(c[i]) : T(c[i])) + (i ? ' ' + X + ' ' + (x < 0 ? '(' + T(x) + ')' : T(x)) + (i > 1 ? sup(i) : '') : ''));
    return 'Vul x = ' + T(x) + ' in: ' + t.join(' + ') + ' = ' + T(pv(c, x)) + '.';
  }
  function afgStap(c){ var d = fp(c); return SC('f′(x) =', d, exprC(d), 'Differentieer elke term: de exponent ervoor en 1 minder. ' + d + '.'); }
  function mHelling(R){
    var c, p, s;
    do { c = polyKies(R); p = nz(R, -3, 3); s = pv(pd(c), p); } while (Math.abs(s) > 60);
    return { vraag:'f(x) = ' + P(c), context:'Bereken de helling van de grafiek van f in het punt met x = ' + T(p) + '.', stappen:[
      afgStap(c),
      S('De helling: f′(' + T(p) + ') =', s, invul(pd(c), p), F(s, pv(c, p), 'Dat is f(' + T(p) + '). De helling vind je met f′.')) ] };
  }
  function mRaak(R){
    var c, p, s, y, b;
    do { c = polyKies(R); p = nz(R, -3, 3); s = pv(pd(c), p); y = pv(c, p); b = y - s * p; } while (Math.abs(y) > 40 || Math.abs(b) > 60 || Math.abs(s) > 40);
    var f = formS(s, b);
    return { vraag:'f(x) = ' + P(c), context:'Stel de vergelijking op van de raaklijn aan de grafiek van f in het punt met x = ' + T(p) + '. Schrijf hem zoals y = 5x ' + MIN + ' 16.', antwoord:f, controle:formC(s, b), invoer:'tekst', stappen:[
      afgStap(c),
      S('De helling: a = f′(' + T(p) + ') =', s, invul(pd(c), p)),
      S('Het raakpunt: f(' + T(p) + ') =', y, invul(c, p), F(y, s, 'Dat is de helling. Voor het raakpunt vul je in bij f zelf.')),
      S('Vul het raakpunt (' + T(p) + ', ' + T(y) + ') in bij y = ' + E([[s, 'x']]) + ' + b: b = ' + T(y) + ' ' + MIN + ' ' + paren(s) + ' · ' + paren(p) + ' =', b, T(s) + ' ' + X + ' ' + paren(p) + ' = ' + T(s * p) + '. Dan ' + T(y) + ' ' + MIN + ' ' + paren(s * p) + ' = ' + T(b) + '.', F(b, y + s * p, 'Je telde op. b = y ' + MIN + ' a · x.')),
      SC('De raaklijn:', f, formC(s, b), 'y = ax + b met a = ' + T(s) + ' en b = ' + T(b) + ': ' + f + '.') ] };
  }
  function mStijg(R){
    var c, p, s;
    do { c = polyKies(R); p = nz(R, -3, 3); s = pv(pd(c), p); } while (!s || Math.abs(s) > 60);
    var keuze = ['stijgend', 'dalend'];
    return eindKeuze({ vraag:'f(x) = ' + P(c), context:'Is de grafiek van f stijgend of dalend bij x = ' + T(p) + '?', stappen:[
      afgStap(c),
      S('f′(' + T(p) + ') =', s, invul(pd(c), p)),
      K(R, 'f′(' + T(p) + ') = ' + T(s) + '. De grafiek is bij x = ' + T(p) + ':', s > 0 ? keuze[0] : keuze[1], [], s > 0 ? 'De helling is positief: de grafiek gaat omhoog.' : 'De helling is negatief: de grafiek gaat omlaag.', { orde:keuze }) ] });
  }
  function mToppen(R){
    var a, r1, r2, b, c, d, y1, y2;
    do { a = R.kies([1, -1, 2, -2]); r1 = R.heel(-4, 3); r2 = R.heel(r1 + 1, 4); d = R.heel(-9, 9);
      b = -3 * a * (r1 + r2) / 2; c = 3 * a * r1 * r2; y1 = a * r1 * r1 * r1 + b * r1 * r1 + c * r1 + d; y2 = a * r2 * r2 * r2 + b * r2 * r2 + c * r2 + d;
    } while (b !== Math.round(b) || Math.abs(y1) > 99 || Math.abs(y2) > 99);
    var cf = [d, c, b, a], dd = fp(cf), k = 3 * a, kw = E([[1, 'x²'], [-(r1 + r2), 'x'], [r1 * r2, '']]), fac = (r1 === 0 ? 'x' : haak(r1)) + (r2 === 0 ? 'x' : haak(r2));
    var ant = punt(r1, y1) + ' en ' + punt(r2, y2);
    return { vraag:'f(x) = ' + P(cf), context:'Bereken de coördinaten van de toppen van de grafiek van f. Typ ze zoals (' + MIN + '1, 7) en (3, ' + MIN + '25).', antwoord:ant, controle:puntenC([[r1, y1], [r2, y2]]), invoer:'tekst', stappen:[
      afgStap(cf),
      SC('Los op: f′(x) = 0 geeft', oplTekst([r1, r2]), oplC([r1, r2]), 'Deel ' + dd + ' = 0 door ' + T(k) + ': ' + kw + ' = 0. Ontbind: ' + fac + ' = 0.'),
      S('f(' + T(r1) + ') =', y1, invul(cf, r1)),
      S('f(' + T(r2) + ') =', y2, invul(cf, r2)),
      SC('De toppen:', ant, puntenC([[r1, y1], [r2, y2]]), 'Elke x met zijn y: ' + ant + '.') ] };
  }

  /* ================= periodieke functies ================= */
  function perPar(R){
    var Pp = R.kies([4, 8, 12, 16, 20, 24]), q = Pp / 4, d = q * R.heel(1, 3), mn = R.heel(-3, 5), mx = mn + R.heel(2, 8);
    return { P:Pp, q:q, d:d, mn:mn, mx:mx, a:(mx + mn) / 2, b:(mx - mn) / 2, ymin:Math.min(0, mn - 1), ymax:Math.max(0, mx + 1) };
  }
  function perKop(R, g){ return R.kies(['Hieronder zie je de grafiek van een periodieke functie.', 'De grafiek hieronder hoort bij een sinusoïde.', 'Hieronder zie je een grafiek die zich steeds herhaalt.', 'De grafiek hieronder golft steeds op en neer.']) + ' De lijnen op de x-as staan ' + T(g.q) + ' uit elkaar.'; }
  function perBeeld(g, o){ o = o || {}; return perGraf({ a:g.a, b:g.b, P:g.P, d:g.d, xmax:2 * g.P, stap:g.q, ymin:g.ymin, ymax:g.ymax, hlijn:o.hlijn, punten:o.punten }); }
  function mPerEA(R){
    var g = perPar(R), ampl = R.heel(0, 1) === 1;
    function pl(n){ var h = []; if (n >= 1) h.push({ y:g.mx, k:3, t:'max' }); if (n >= 2) h.push({ y:g.mn, k:3, t:'min' }); if (n >= 3 && !ampl) h.push({ y:g.a, k:1, t:'evenwicht' }); return perBeeld(g, { hlijn:h }); }
    var st = [S('Lees af: de hoogste waarde (max) =', g.mx, 'Kijk naar de toppen van de grafiek en lees de y af.'), S('De laagste waarde (min) =', g.mn, 'Kijk naar de dalen van de grafiek en lees de y af.')];
    if (ampl) st.push(S('Amplitude = (max ' + MIN + ' min) : 2 = (' + T(g.mx) + ' ' + MIN + ' ' + paren(g.mn) + ') : 2 =', g.b, 'Het verschil tussen max en min, en dan de helft: ' + T(g.mx - g.mn) + ' : 2.', F(g.b, g.mx - g.mn, 'Dat is het hele verschil. De amplitude is de helft ervan.', g.a, 'Dat is de evenwichtsstand. De amplitude is de afstand van het midden tot de top.')));
    else st.push(S('Evenwichtsstand = (max + min) : 2 = (' + T(g.mx) + ' + ' + paren(g.mn) + ') : 2 =', g.a, 'Tel max en min op en deel door 2: ' + T(g.mx + g.mn) + ' : 2.', F(g.a, g.b, 'Dat is de amplitude. De evenwichtsstand is het midden: (max + min) : 2.')));
    return { vraag:ampl ? 'Amplitude = ?' : 'Evenwichtsstand = ?', context:perKop(R, g) + ' Bereken de ' + (ampl ? 'amplitude' : 'evenwichtsstand') + '.', beeld:pl, zelfBeeld:pl(0), stappen:st };
  }
  function mPerPer(R){
    var g = perPar(R), top = R.heel(0, 2) > 0, w = top ? 'top' : 'dal', t1 = ((g.d + (top ? g.q : 3 * g.q)) % g.P), t2 = t1 + g.P;
    function pl(n){ var p = []; if (n >= 1) p.push({ x:t1, y:top ? g.mx : g.mn, k:3 }); if (n >= 2) p.push({ x:t2, y:top ? g.mx : g.mn, k:3 }); return perBeeld(g, { punten:p }); }
    return { vraag:'Periode = ?', context:perKop(R, g) + ' Lees de periode af.', beeld:pl, zelfBeeld:pl(0), stappen:[
      S('Het eerste ' + (top ? 'hoogste punt (een top)' : 'laagste punt (een dal)') + ' ligt bij x =', t1, 'Zoek van links af het eerste ' + (top ? 'hoogste' : 'laagste') + ' punt en lees de x af. De lijnen staan ' + T(g.q) + ' uit elkaar.'),
      S('De volgende ' + w + ' ligt bij x =', t2, 'Ga verder naar rechts tot het volgende ' + (top ? 'hoogste' : 'laagste') + ' punt.'),
      S('Periode = ' + T(t2) + ' ' + MIN + ' ' + T(t1) + ' =', g.P, 'Het verschil tussen de twee x-waarden.', F(g.P, g.P / 2, 'Dat is van top tot dal: een halve periode.')) ] };
  }
  function cTekst(Pp){ return Pp === 2 ? 'π' : Pp % 2 === 0 ? 'π/' + (Pp / 2) : '2π/' + Pp; }
  function sinF(a, b, cT, d){
    var bp = (Math.abs(b) === 1 ? '' : T(Math.abs(b)) + ' ') + 'sin(' + cT + ' · ' + (d ? haak(d) : 'x') + ')';
    return 'y = ' + (a ? T(a) + (b < 0 ? ' ' + MIN + ' ' : ' + ') + bp : (b < 0 ? MIN : '') + bp);
  }
  function mPerForm(R){
    var a = R.heel(-3, 9), b = nz(R, -5, 5), d = R.heel(0, 6), wat = R.kies(['evenwicht', 'amplitude', 'periode', 'periode']), Pp, cT, exact = true, cv;
    if (R.heel(0, 4) === 0){ cv = R.kies([2, 3, 0.5, 4]); cT = T(cv); Pp = 2 * Math.PI / cv; exact = false; }
    else { Pp = R.kies([2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]); cT = cTekst(Pp); }
    var f = sinF(a, b, cT, d), wie = ['a: het losse getal vooraan', 'b: het getal voor sin', 'c: het getal voor de haakjes', 'd: het getal bij x in de haakjes'], st, vr;
    if (wat === 'evenwicht'){ vr = 'evenwichtsstand';
      st = [K(R, 'Welk getal in y = a + b sin(c(x ' + MIN + ' d)) is de evenwichtsstand?', wie[0], [], 'De grafiek golft om het losse getal vooraan heen.', { orde:wie }),
        S('De evenwichtsstand is', a, a ? 'Het losse getal vooraan: ' + T(a) + '.' : 'Er staat geen getal vooraan, dus de evenwichtsstand is 0.', F(a, Math.abs(b), 'Dat is de amplitude, het getal voor sin.'))]; }
    else if (wat === 'amplitude'){ vr = 'amplitude';
      st = [K(R, 'Welk getal in y = a + b sin(c(x ' + MIN + ' d)) is de amplitude?', wie[1], [], 'Het getal voor sin zegt hoe ver de grafiek boven en onder de evenwichtsstand komt.', { orde:wie }),
        S('De amplitude is', Math.abs(b), 'Het getal voor sin' + (b < 0 ? ', zonder min-teken' : '') + ': ' + T(Math.abs(b)) + '.', F(Math.abs(b), b < 0 ? b : a, b < 0 ? 'De amplitude is een afstand: altijd positief.' : 'Dat is de evenwichtsstand, het losse getal vooraan.'))]; }
    else { vr = 'periode';
      var pt = exact ? Pp : uniek([T(rnd(Pp, 2), { dec:2, vast:true }), T(rnd(Pp, 2))]);
      st = [K(R, 'Wat is c, het getal voor de haakjes?', cT, [T(Math.abs(b)), String(d || 1)].filter(function(x){ return x !== cT; }), 'Het getal dat bij x hoort, binnen de sin: ' + cT + '.'),
        S('De periode = 2π : c' + (exact ? ' =' : ' ≈ (rond af op 2 decimalen)'), pt, exact ? '2π : (' + cT + ')' + (Pp % 2 === 0 ? ' = 2 ' + X + ' ' + (Pp / 2) + ' = ' + T(Pp) : ' = ' + T(Pp)) + '.' : 'Tik in: 2 ' + X + ' π ÷ ' + cT + ' = ' + T(Pp, { dec:4 }) + '…', exact ? F(Pp, Pp / 2, 'Vergeet de 2 in 2π niet.') : null)]; }
    return { vraag:f, context:'Wat is de ' + vr + '?' + (exact ? '' : ' Rond af op 2 decimalen.'), stappen:st };
  }
  function mPerOpstel(R){
    var g = perPar(R), cT = cTekst(g.P), goed = sinF(g.a, g.b, cT, g.d), t1 = (g.d + g.q) % g.P;
    var fouten = [sinF(g.a, g.b, cTekst(2 * g.P), g.d), sinF(g.a, g.b, cT, -g.d), g.a !== g.b && g.a ? sinF(g.b, g.a, cT, g.d) : sinF(g.a, g.b, T(g.P), g.d)];
    function pl(n){ var h = [], p = []; if (n >= 1) h.push({ y:g.a, k:1, t:'evenwicht' }); if (n >= 4) p.push({ x:g.d, y:g.a, k:3, label:'beginpunt' }); return perBeeld(g, { hlijn:h, punten:p }); }
    return eindKeuze({ vraag:'Welke formule?', context:perKop(R, g) + ' Welke formule y = a + b sin(c(x ' + MIN + ' d)) hoort erbij?', beeld:pl, zelfBeeld:pl(0), stappen:[
      S('a = evenwichtsstand = (max + min) : 2 =', g.a, 'Lees de max (' + T(g.mx) + ') en de min (' + T(g.mn) + ') af. Dan (' + T(g.mx) + ' + ' + paren(g.mn) + ') : 2.'),
      S('b = amplitude = (max ' + MIN + ' min) : 2 =', g.b, '(' + T(g.mx) + ' ' + MIN + ' ' + paren(g.mn) + ') : 2.', F(g.b, g.mx - g.mn, 'De amplitude is de helft van het verschil.')),
      S('De periode (van top tot top) =', g.P, 'Er ligt een top bij x = ' + T(t1) + ' en de volgende bij x = ' + T(t1 + g.P) + '.', F(g.P, g.P / 2, 'Dat is een halve periode.')),
      S('Het beginpunt: de eerste x waar de grafiek stijgend door de evenwichtsstand gaat. d =', g.d, 'Zoek waar de grafiek de evenwichtslijn y = ' + T(g.a) + ' snijdt terwijl hij omhoog gaat.', F(g.d, (g.d + g.P / 2) % g.P, 'Daar gaat de grafiek dalend door de evenwichtsstand. Je zoekt stijgend.')),
      K(R, 'c = 2π : ' + g.P + ' = ' + cT + '. Welke formule hoort erbij?', goed, fouten, 'a = ' + T(g.a) + ', b = ' + T(g.b) + ', c = ' + cT + ' en x ' + MIN + ' ' + T(g.d) + ': ' + goed + '.') ] });
  }

  /* ================= sinusregel en cosinusregel ================= */
  function opsom(l){ return l.length > 1 ? l.slice(0, -1).join(', ') + ' en ' + l[l.length - 1] : l[0]; }
  function mSinZijde(R){
    var ang, i, j, k, p, q, derde = R.heel(0, 2) === 0;
    do { var A = R.heel(30, 110), B = R.heel(25, 150 - A); ang = [A, B, 180 - A - B]; var idx = R.hussel([0, 1, 2]); i = idx[0]; j = idx[1]; k = idx[2]; p = R.heel(4, 15); q = p * Math.sin(ang[j] * RAD) / Math.sin(ang[i] * RAD); }
    while (ang[2] < 20 || grens(q, 1) || q > 40);
    var hl = ['', '', ''], zl = ['', '', '']; hl[j] = ang[j] + '°'; if (derde) hl[k] = ang[k] + '°'; else hl[i] = ang[i] + '°'; zl[i] = p + ' cm'; zl[j] = '?';
    var bl = driehoek(ang, hl, zl), geg = (derde ? ['∠' + VN[j] + ' = ' + ang[j] + '°', '∠' + VN[k] + ' = ' + ang[k] + '°'] : ['∠' + VN[i] + ' = ' + ang[i] + '°', '∠' + VN[j] + ' = ' + ang[j] + '°']).concat([ZN[i] + ' = ' + p + ' cm']);
    var st = [];
    if (derde) st.push(St('∠' + VN[i] + ' = 180° ' + MIN + ' ' + ang[j] + '° ' + MIN + ' ' + ang[k] + '° =', gr(ang[i]), 'De hoeken van een driehoek zijn samen 180°.', null, { e:'°' }));
    st.push(K(R, 'Welk paar ken je: een zijde én de hoek ertegenover?', ZN[i] + ' en ∠' + VN[i], [ZN[j] + ' en ∠' + VN[j], ZN[k] + ' en ∠' + VN[k]], 'Zijde ' + ZN[i] + ' ligt tegenover ∠' + VN[i] + ', en die ken je allebei.'));
    st.push(K(R, 'Welke vergelijking hoort erbij?', ZN[j] + ' / sin(' + ang[j] + '°) = ' + p + ' / sin(' + ang[i] + '°)', [ZN[j] + ' / sin(' + ang[i] + '°) = ' + p + ' / sin(' + ang[j] + '°)', ZN[j] + ' / cos(' + ang[j] + '°) = ' + p + ' / cos(' + ang[i] + '°)'], 'Elke zijde hoort bij de sinus van de hoek ertegenover: ' + ZN[j] + ' bij ∠' + VN[j] + ' en ' + ZN[i] + ' bij ∠' + VN[i] + '.'));
    var fout = rnd(p * Math.sin(ang[i] * RAD) / Math.sin(ang[j] * RAD), 1);
    st.push(St(ZN[j] + ' = ' + p + ' · sin(' + ang[j] + '°) / sin(' + ang[i] + '°) ≈ (rond af op 1 decimaal)', af(q, 1, 'cm'), 'Tik in: ' + p + ' ' + X + ' sin(' + ang[j] + ') ÷ sin(' + ang[i] + ') = ' + T(q, { dec:4 }) + '…', Fz(af(q, 1, 'cm'), FM(T(fout, { dec:1, vast:true }), 'Je wisselde de hoeken om. ' + ZN[j] + ' hoort bij sin(' + ang[j] + '°).')), { e:'cm' }));
    return { vraag:ZN[j] + ' = ?', context:'In driehoek ABC is ' + opsom(geg) + '. Bereken ' + ZN[j] + '. Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:st, regel:'sinus' };
  }
  function mSinHoek(R){
    var A, i, j, k, p, qq, Q, ang;
    do { A = R.heel(35, 120); var idx = R.hussel([0, 1, 2]); i = idx[0]; j = idx[1]; k = idx[2]; p = R.heel(6, 15); qq = R.heel(3, p - 1); Q = Math.asin(qq * Math.sin(A * RAD) / p) / RAD; }
    while (Q < 15 || grens(Q, 1) || 180 - A - Q < 15);
    ang = [0, 0, 0]; ang[i] = A; ang[j] = Q; ang[k] = 180 - A - Q;
    var hl = ['', '', ''], zl = ['', '', '']; hl[i] = A + '°'; hl[j] = '?'; zl[i] = p + ' cm'; zl[j] = qq + ' cm';
    var bl = driehoek(ang, hl, zl), sv = 'sin(∠' + VN[j] + ')';
    return { vraag:'∠' + VN[j] + ' = ?', context:'In driehoek ABC is ∠' + VN[i] + ' = ' + A + '°, ' + ZN[i] + ' = ' + p + ' cm en ' + ZN[j] + ' = ' + qq + ' cm. Bereken ∠' + VN[j] + '. Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'°', beeld:bl, zelfBeeld:bl, regel:'sinus', stappen:[
      K(R, 'Welk paar ken je: een zijde én de hoek ertegenover?', ZN[i] + ' en ∠' + VN[i], [ZN[j] + ' en ∠' + VN[j], ZN[k] + ' en ∠' + VN[k]], 'Zijde ' + ZN[i] + ' ligt tegenover ∠' + VN[i] + ', en die ken je allebei.'),
      K(R, 'Welke vergelijking hoort erbij?', sv + ' = ' + qq + ' · sin(' + A + '°) / ' + p, [sv + ' = ' + p + ' · sin(' + A + '°) / ' + qq, sv + ' = ' + qq + ' / (' + p + ' · sin(' + A + '°))'], 'Uit ' + qq + ' / ' + sv + ' = ' + p + ' / sin(' + A + '°) volgt ' + sv + ' = ' + qq + ' · sin(' + A + '°) / ' + p + '.'),
      St('∠' + VN[j] + ' ≈ (rond af op 1 decimaal)', af(Q, 1, '°'), 'Tik in: sin⁻¹(' + qq + ' ' + X + ' sin(' + A + ') ÷ ' + p + ') = ' + T(Q, { dec:4 }) + '…', null, { e:'°' }) ] };
  }
  function mCosZijde(R){
    var Xh, y, z, x, i, j, k;
    do { Xh = R.heel(30, 140); y = R.heel(4, 15); z = R.heel(4, 15); x = Math.sqrt(y * y + z * z - 2 * y * z * Math.cos(Xh * RAD)); } while (grens(x, 1) || (y === z && R.heel(0, 1)));
    var idx = R.hussel([0, 1, 2]); i = idx[0]; j = idx[1]; k = idx[2];
    var Yh = Math.acos((x * x + z * z - y * y) / (2 * x * z)) / RAD, ang = [0, 0, 0]; ang[i] = Xh; ang[j] = Yh; ang[k] = 180 - Xh - Yh;
    var hl = ['', '', ''], zl = ['', '', '']; hl[i] = Xh + '°'; zl[i] = '?'; zl[j] = y + ' cm'; zl[k] = z + ' cm';
    var bl = driehoek(ang, hl, zl), som = y * y + z * z, prod = 2 * y * z, keuze = ['twee zijden en de hoek ertussen', 'een zijde en de hoek ertegenover', 'drie zijden'];
    return { vraag:ZN[i] + ' = ?', context:'In driehoek ABC is ' + ZN[j] + ' = ' + y + ' cm, ' + ZN[k] + ' = ' + z + ' cm en ∠' + VN[i] + ' = ' + Xh + '°. Bereken ' + ZN[i] + '. Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'cm', beeld:bl, zelfBeeld:bl, regel:'cosinus', stappen:[
      K(R, 'Wat ken je?', keuze[0], [], 'Je kent ' + ZN[j] + ' en ' + ZN[k] + ', en ∠' + VN[i] + ' ligt tussen die twee zijden. Er is geen paar, dus de cosinusregel.', { orde:keuze }),
      St(y + '² + ' + z + '² =', [String(som)], y * y + ' + ' + z * z + '.'),
      St('2 · ' + y + ' · ' + z + ' =', [String(prod)], '2 ' + X + ' ' + y + ' ' + X + ' ' + z + '.'),
      St(ZN[i] + ' = √(' + som + ' ' + MIN + ' ' + prod + ' · cos(' + Xh + '°)) ≈ (rond af op 1 decimaal)', af(x, 1, 'cm'), 'Tik in: √(' + som + ' ' + MIN + ' ' + prod + ' ' + X + ' cos(' + Xh + ')) = ' + T(x, { dec:4 }) + '…', Fz(af(x, 1, 'cm'), FM(T(rnd(x * x, 1), { dec:1, vast:true }), 'Dat is ' + ZN[i] + '². Neem nog de wortel.')), { e:'cm' }) ] };
  }
  function mCosHoek(R){
    var x, y, z, Xh, Yh;
    do { x = R.heel(3, 15); y = R.heel(3, 15); z = R.heel(3, 15); Xh = Math.acos((y * y + z * z - x * x) / (2 * y * z)) / RAD; Yh = Math.acos((x * x + z * z - y * y) / (2 * x * z)) / RAD; }
    while (!(x < y + z && y < x + z && z < x + y) || Xh < 20 || Xh > 150 || Yh < 15 || 180 - Xh - Yh < 15 || grens(Xh, 1) || Math.abs(Xh - Math.round(Xh)) < 0.05);
    var idx = R.hussel([0, 1, 2]), i = idx[0], j = idx[1], k = idx[2], ang = [0, 0, 0]; ang[i] = Xh; ang[j] = Yh; ang[k] = 180 - Xh - Yh;
    var hl = ['', '', ''], zl = ['', '', '']; hl[i] = '?'; zl[i] = x + ' cm'; zl[j] = y + ' cm'; zl[k] = z + ' cm';
    var bl = driehoek(ang, hl, zl), som = y * y + z * z, prod = 2 * y * z;
    return { vraag:'∠' + VN[i] + ' = ?', context:'In driehoek ABC is ' + ZN[i] + ' = ' + x + ' cm, ' + ZN[j] + ' = ' + y + ' cm en ' + ZN[k] + ' = ' + z + ' cm. Bereken ∠' + VN[i] + '. Rond af op 1 decimaal. Zet je rekenmachine in graden.', eenheid:'°', beeld:bl, zelfBeeld:bl, regel:'cosinus', stappen:[
      St(ZN[j] + '² + ' + ZN[k] + '² = ' + y + '² + ' + z + '² =', [String(som)], 'De twee zijden die ∠' + VN[i] + ' insluiten: ' + y * y + ' + ' + z * z + '.'),
      St(ZN[i] + '² = ' + x + '² =', [String(x * x)], ZN[i] + ' ligt tegenover ∠' + VN[i] + ': ' + x + ' ' + X + ' ' + x + '.'),
      St('2 · ' + y + ' · ' + z + ' =', [String(prod)], '2 ' + X + ' ' + y + ' ' + X + ' ' + z + '.'),
      St('∠' + VN[i] + ' = cos⁻¹((' + som + ' ' + MIN + ' ' + x * x + ') / ' + prod + ') ≈ (rond af op 1 decimaal)', af(Xh, 1, '°'), 'Tik in: cos⁻¹((' + som + ' ' + MIN + ' ' + x * x + ') ÷ ' + prod + ') = ' + T(Xh, { dec:4 }) + '…', null, { e:'°' }) ] };
  }

  /* ================= cirkels en raaklijnen ================= */
  function cirkelHoekFig(x, del, labM, labC){
    var W = 340, H = 300, cx = 170, cy = 150, r = 110, s = '';
    var A = pol(cx, cy, r, 270 - x), B = pol(cx, cy, r, 270 + x), C = pol(cx, cy, r, 90 + del), M = [cx, cy];
    s += cir(cx, cy, r, { w:2.5, f:KL[0], fo:0.05 });
    s += mln(cx, cy, A[0], A[1], { k:KL[0], w:3 }) + mln(cx, cy, B[0], B[1], { k:KL[0], w:3 }) + mln(C[0], C[1], A[0], A[1], { k:KL[3], w:3 }) + mln(C[0], C[1], B[0], B[1], { k:KL[3], w:3 });
    s += hoekje(cx, cy, 270 - x, 270 + x, { t:labM, k:labM === '?' ? KL[1] : KL[0], r:26, lr:20 });
    s += hoekTussen(C, A, B, { t:labC, k:labC === '?' ? KL[1] : KL[3], r:34, lr:20 });
    [[A, 'A', 270 - x], [B, 'B', 270 + x], [C, 'C', 90 + del]].forEach(function(p){ s += cir(p[0][0], p[0][1], 4, { f:'var(--ink)', s:'none', w:0 }); var l = pol(cx, cy, r + 18, p[2]); s += mtx(l[0], l[1], p[1], { mid:true, vet:true, fs:16 }); });
    s += cir(cx, cy, 4, { f:'var(--ink)', s:'none', w:0 }) + mtx(cx + (del > 0 ? 14 : -14), cy - 12, 'M', { mid:true, vet:true, fs:16 });
    return svg(W, H, s, 'cirkel met middelpunt M en de punten A, B en C', 360);
  }
  function mCirHoek(R){
    var x = R.heel(18, 80), del = R.kies([-35, -25, -15, 15, 25, 35]), vraagM = R.heel(0, 1) === 0, keuze = ['∠AMB', '∠ACB'];
    var bl = cirkelHoekFig(x, del, vraagM ? '?' : 2 * x + '°', vraagM ? x + '°' : '?'), ant = vraagM ? 2 * x : x;
    return { vraag:(vraagM ? '∠AMB' : '∠ACB') + ' = ?', context:'M is het middelpunt van de cirkel. ' + (vraagM ? '∠ACB = ' + x + '°. Bereken ∠AMB.' : '∠AMB = ' + 2 * x + '°. Bereken ∠ACB.'), eenheid:'°', beeld:bl, zelfBeeld:bl, stappen:[
      K(R, 'Welke hoek is de middelpuntshoek?', keuze[0], [], 'Bij een middelpuntshoek ligt het hoekpunt in het middelpunt M.', { orde:keuze }),
      St((vraagM ? '∠AMB' : '∠ACB') + ' =', gr(ant), vraagM ? 'Beide hoeken staan op boog AB. De middelpuntshoek is 2 keer zo groot: 2 ' + X + ' ' + x + '° = ' + 2 * x + '°.' : 'Beide hoeken staan op boog AB. De omtrekshoek is de helft: ' + 2 * x + '° : 2 = ' + x + '°.',
        Fz(gr(ant), vraagM ? FM(T(x / 2), 'Andersom: de middelpuntshoek is juist groter dan de omtrekshoek.', T(x), 'Ze zijn niet even groot: de middelpuntshoek is 2 keer zo groot.') : FM(T(4 * x), 'Andersom: de omtrekshoek is juist kleiner.', T(2 * x), 'Ze zijn niet even groot: de omtrekshoek is de helft.')), { e:'°' }) ] };
  }
  function raakFig(r, a, th, kant, lab){
    var t = kant ? [-Math.sin(th * RAD), Math.cos(th * RAD)] : [Math.sin(th * RAD), -Math.cos(th * RAD)];
    var M = [0, 0], Rp = [r * Math.cos(th * RAD), r * Math.sin(th * RAD)], Pp = [Rp[0] + a * t[0], Rp[1] + a * t[1]];
    var E1 = [Rp[0] - 0.35 * a * t[0], Rp[1] - 0.35 * a * t[1]], E2 = [Pp[0] + 0.12 * a * t[0], Pp[1] + 0.12 * a * t[1]];
    var tt = pas([M, Rp, Pp, [-r, -r], [r, r], E1, E2], 400, 280, 34), m = tt.f(M), Rq = tt.f(Rp), Pq = tt.f(Pp), e1 = tt.f(E1), e2 = tt.f(E2), s = '';
    s += cir(m[0], m[1], r * tt.sc, { w:2.5, f:KL[0], fo:0.05 });
    s += mln(e1[0], e1[1], e2[0], e2[1], { k:KL[3], w:2.5, stip:'6 5' }) + mln(Rq[0], Rq[1], Pq[0], Pq[1], { k:KL[3], w:3.5 }) + mln(m[0], m[1], Rq[0], Rq[1], { k:KL[0], w:3.5 }) + mln(m[0], m[1], Pq[0], Pq[1], { k:KL[2], w:3 });
    s += hoekTussen(Rq, m, Pq, { k:'var(--ink)' });
    var cx = (m[0] + Rq[0] + Pq[0]) / 3, cy = (m[1] + Rq[1] + Pq[1]) / 3;
    [[m, 'M'], [Rq, 'R'], [Pq, 'P']].forEach(function(p){ var dx = p[0][0] - cx, dy = p[0][1] - cy, L = Math.hypot(dx, dy) || 1; s += cir(p[0][0], p[0][1], 4, { f:'var(--ink)', s:'none', w:0 }) + mtx(p[0][0] + dx / L * 18, p[0][1] + dy / L * 18, p[1], { mid:true, vet:true, fs:16 }); });
    [[m, Rq, lab.MR], [Rq, Pq, lab.PR], [m, Pq, lab.MP]].forEach(function(z){ if (!z[2]) return; var mx = (z[0][0] + z[1][0]) / 2, my = (z[0][1] + z[1][1]) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1; s += mtx(mx + dx / L * 20, my + dy / L * 20, z[2], { mid:true, vet:true, fs:16, k:z[2] === '?' ? KL[1] : null }); });
    return svg(400, 280, s, 'cirkel met middelpunt M en raaklijn PR', 420);
  }
  var TRIPEL = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [4, 3, 5], [12, 5, 13], [8, 6, 10]];
  function mRaakLengte(R){
    var soort = R.kies(['PR', 'PR', 'MP']), r, a, b, t;
    if (R.heel(0, 2) === 0){ t = R.kies(TRIPEL); r = t[0]; a = t[1]; b = t[2]; }
    else if (soort === 'PR'){ do { r = R.heel(2, 9); b = R.heel(r + 2, 20); a = Math.sqrt(b * b - r * r); } while (grens(a, 1)); }
    else { do { r = R.heel(2, 9); a = R.heel(3, 15); b = Math.sqrt(r * r + a * a); } while (grens(b, 1)); }
    var lab = { MR:r + ' cm', PR:soort === 'PR' ? '?' : T(a) + ' cm', MP:soort === 'MP' ? '?' : T(b) + ' cm' }, bl = raakFig(r, a, R.heel(55, 125), R.heel(0, 1) === 1, lab);
    var val = soort === 'PR' ? a : b, ant = af(val, 1, 'cm'), st;
    if (soort === 'PR') st = St('PR = √(' + b + '² ' + MIN + ' ' + r + '²) ≈ (rond af op 1 decimaal)', ant, 'MP is de schuine zijde. ' + b * b + ' ' + MIN + ' ' + r * r + ' = ' + (b * b - r * r) + ', en dan de wortel: ' + T(a, { dec:4 }) + '…', Fz(ant, FM(T(rnd(Math.sqrt(b * b + r * r), 1), { dec:1, vast:true }), 'Je telde op. MP is de schuine zijde: dan trek je af.')), { e:'cm' });
    else st = St('MP = √(' + r + '² + ' + T(a) + '²) ≈ (rond af op 1 decimaal)', ant, 'MP is de schuine zijde: tel de kwadraten op. ' + r * r + ' + ' + a * a + ' = ' + (r * r + a * a) + ', en dan de wortel: ' + T(b, { dec:4 }) + '…', a > r ? Fz(ant, FM(T(rnd(Math.sqrt(a * a - r * r), 1), { dec:1, vast:true }), 'Je trok af. MP is de schuine zijde: dan tel je op.')) : null, { e:'cm' });
    return { vraag:soort + ' = ?', context:'PR raakt de cirkel met middelpunt M in R. De straal is ' + r + ' cm en ' + (soort === 'PR' ? 'MP = ' + T(b) + ' cm. Bereken PR.' : 'PR = ' + T(a) + ' cm. Bereken MP.') + ' Rond af op 1 decimaal.', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
      K(R, 'Hoe groot is ∠MRP?', '90°', ['60°', '180°'], 'De raaklijn PR staat loodrecht op de straal MR.'),
      K(R, 'Welke zijde is de schuine zijde van driehoek MRP?', 'MP', ['MR', 'PR'], 'De schuine zijde ligt tegenover de rechte hoek bij R.'),
      st ] };
  }
  function cirkelVgl(a, b, rr){ return (a ? haak(a) + '²' : 'x²') + ' + ' + (b ? haak(b, 'y') + '²' : 'y²') + ' = ' + rr; }
  function mRaakCoord(R){
    var o = R.kies([[1, 1], [1, 2], [2, 1], [3, 1], [3, 4], [1, 4], [3, 2], [4, 2]]), sx = R.kies([1, -1]), sy = R.kies([1, -1]);
    var dx = o[0] * sx, dy = o[1] * sy, a = R.heel(-3, 3), b = R.heel(-3, 3), px = a + dx, py = b + dy, rr = dx * dx + dy * dy, r = Math.sqrt(rr);
    var rcMP = breukS(dy, dx), rc = -dx / dy, rcS = breukS(-dx, dy), bb = (py * dy + dx * px) / dy, bS = breukS(py * dy + dx * px, dy).reverse(), f = formS(rc, bb);
    var lo = [Math.min(-1, Math.floor(a - r) - 1), Math.max(1, Math.ceil(a + r) + 1)], hi = [Math.min(-1, Math.floor(b - r) - 1), Math.max(1, Math.ceil(b + r) + 1)];
    function pl(n){ return assen({ xmin:lo[0], xmax:lo[1], ymin:hi[0], ymax:hi[1], cirkels:[{ x:a, y:b, r:r, k:0 }], seg:n >= 2 ? [{ x1:a, y1:b, x2:px, y2:py, k:2 }] : [], lijnen:n >= 5 ? [{ a:rc, b:bb, k:3 }] : [],
      punten:[{ x:px, y:py, k:1, label:'P' }].concat(n >= 1 ? [{ x:a, y:b, k:0, label:'M' }] : []), aria:'cirkel met het punt P' }); }
    return { vraag:cirkelVgl(a, b, rr), vraagHtml:Sch(cirkelVgl(a, b, rr)) + '<br>P' + punt(px, py), context:'Het punt P' + punt(px, py) + ' ligt op de cirkel. Stel de vergelijking op van de raaklijn in P. Schrijf hem zoals y = ' + MIN + '0,75x + 9.', antwoord:f, controle:formC(rc, bb), invoer:'tekst', beeld:pl, stappen:[
      SC('Het middelpunt M =', punt(a, b), puntC(a, b), 'Bij (x ' + MIN + ' a)² + (y ' + MIN + ' b)² is M (a, b). Let op het teken: ' + punt(a, b) + '.', F(punt(a, b), punt(-a, -b), 'Let op het teken: (x + 2) hoort bij x = ' + MIN + '2.')),
      SC('De richtingscoëfficiënt van MP = ' + T(dy) + ' : ' + paren(dx) + ' =', rcMP, getC(dy / dx), 'Verschil in y gedeeld door verschil in x: (' + T(py) + ' ' + MIN + ' ' + paren(b) + ') : (' + T(px) + ' ' + MIN + ' ' + paren(a) + '). Typ een breuk als ' + rcMP[0] + '.'),
      SC('De raaklijn staat loodrecht op MP. Zijn richtingscoëfficiënt = ' + MIN + '1 : (' + rcMP[0] + ') =', rcS, getC(rc), 'Keer elkaar moet het ' + MIN + '1 zijn: draai de breuk om en verander het teken.', F(rcS, rcMP[0], 'Dat is de rc van MP zelf. Draai hem om en verander het teken.')),
      SC('Vul P in bij y = ' + E([[rc, 'x']]) + ' + b: b = ' + T(py) + ' ' + MIN + ' ' + paren(rc) + ' · ' + paren(px) + ' =', bS, getC(bb), paren(rc) + ' ' + X + ' ' + paren(px) + ' = ' + T(rc * px) + '. Dan ' + T(py) + ' ' + MIN + ' ' + paren(rc * px) + '.'),
      SC('De raaklijn:', f, formC(rc, bb), 'y = ax + b met a = ' + T(rc) + ' en b = ' + T(bb) + ': ' + f + '.') ] };
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= machten en wortelvergelijkingen ================= */
    { groep:{ id:'whb-mac', niveau:'havo', domein:'algebra', naam:'Machten en wortelvergelijkingen',
        uit:'Machten met een negatieve of gebroken exponent, en vergelijkingen met een macht of een wortel. De gewone rekenregels voor machten staan bij Machten, wortels en formules.' },
      doelen:[
        { id:'whb-mac-neg', naam:'Negatieve exponenten', kort:'Delen door xⁿ is keer x⁻ⁿ: 5 / x³ = 5x⁻³',
          uit:'<p>x⁵ : x⁸ = x⁻³, want bij delen trek je de exponenten af. Ook 1 / x³ = x⁻³. Een <b>negatieve exponent</b> betekent dus: 1 gedeeld door.</p><p>Staat er een getal boven de deelstreep, dan blijft dat ervoor staan: <b>5 / x³ = 5x⁻³</b>.</p><p>Staat er een getal onder de deelstreep, dan deel je erdoor: 1 / (4x²) = 0,25x⁻².</p>',
          wanneer:'je een breuk met x eronder wilt schrijven als a · xⁿ, bijvoorbeeld om te differentiëren.',
          maak:mNeg },
        { id:'whb-mac-gebr', naam:'Gebroken exponenten', kort:'Een wortel is een macht met een breuk: √x = x^0,5 en ∛x = x^(1/3)',
          uit:'<p>√x · √x = x. En x^0,5 · x^0,5 = x¹ = x. Daarom is <b>√x = x^0,5</b>, ofwel x^(1/2). Zo is de derdemachtswortel <b>∛x = x^(1/3)</b>.</p><p>Daarna gebruik je de gewone rekenregels. x√x = x¹ · x^0,5 = <b>x^1,5</b>. En 1 / √x = <b>x^' + MIN + '0,5</b>.</p><p>Typ een exponent met ^, zoals x^1,5 of x^(1/3).</p>',
          wanneer:'er een wortel in een formule staat die je als macht wilt schrijven.',
          maak:mGebr },
        { id:'whb-mac-vgl', naam:'Vergelijkingen als x³ = 64', kort:'Maak de macht vrij. Oneven exponent: één oplossing. Even exponent: twee of geen',
          uit:'<p>x³ = 64: welk getal tot de derde is 64? Dat is <b>4</b>, want 4 · 4 · 4 = 64. Bij een <b>oneven</b> exponent is er één oplossing, ook bij een negatief getal: x³ = ' + MIN + '8 geeft x = ' + MIN + '2.</p><p>Bij een <b>even</b> exponent zijn er twee oplossingen: x⁴ = 81 geeft x = 3 of x = ' + MIN + '3. En x⁴ = ' + MIN + '16 heeft <b>geen oplossing</b>, want een even macht is nooit negatief.</p><p>Komt het niet mooi uit? Gebruik de rekenmachine: x³ = 50 geeft x = 50^(1/3) ≈ 3,68.</p>',
          wanneer:'er alleen één macht van x in de vergelijking staat.',
          maak:mMachtVgl },
        { id:'whb-mac-wortel', naam:'Wortelvergelijkingen', kort:'Maak de wortel vrij, kwadrateer beide kanten en los op. Is de wortel negatief, dan is er geen oplossing',
          uit:'<p>√(x + 2) = 5. Je haalt de wortel weg door beide kanten te <b>kwadrateren</b>: x + 2 = 25, dus <b>x = 23</b>.</p><p>Staat er nog iets naast de wortel, zoals 2√x ' + MIN + ' 3 = 7? Maak dan eerst de <b>wortel vrij</b>: 2√x = 10, √x = 5, dus x = 25.</p><p>Een wortel is nooit negatief. Krijg je √(…) = ' + MIN + '4, dan is er <b>geen oplossing</b>.</p>',
          wanneer:'de x onder een wortel staat.',
          maak:mWortelVgl }
      ] },

    /* ================= logaritmen ================= */
    { groep:{ id:'whb-log', niveau:'havo', domein:'algebra', naam:'Logaritmen',
        uit:'Een logaritme is een exponent. Je rekent logaritmen uit met de definitie, gebruikt de rekenregels en lost een vergelijking met een logaritme op.' },
      doelen:[
        { id:'whb-log-def', naam:'Wat is een logaritme?', kort:'ᵍlog a = b betekent gᵇ = a: de logaritme is de exponent',
          uit:'<p><b>²log 8</b> is de exponent waarmee je 2 tot de macht neemt om 8 te krijgen. 2³ = 8, dus ²log 8 = <b>3</b>.</p><p>De regel: <b>ᵍlog a = b betekent gᵇ = a</b>. Staat er geen getal voor log, dan is het grondtal 10: log 1000 = 3.</p><p>Ook negatieve uitkomsten kunnen: ²log(1/8) = ' + MIN + '3, want 2⁻³ = 1/8. En ᵍlog 1 = 0, want g⁰ = 1.</p>',
          wanneer:'je een logaritme zonder rekenmachine wilt uitrekenen.',
          maak:mLogDef },
        { id:'whb-log-regels', naam:'Rekenregels voor logaritmen', kort:'Plus wordt keer, min wordt delen, een getal ervoor wordt een exponent',
          uit:'<p>Bij hetzelfde grondtal gelden drie regels:</p><p><b>ᵍlog a + ᵍlog b = ᵍlog(a · b)</b><br><b>ᵍlog a ' + MIN + ' ᵍlog b = ᵍlog(a : b)</b><br><b>n · ᵍlog a = ᵍlog(aⁿ)</b></p><p>Voorbeeld: ⁶log 4 + ⁶log 9 = ⁶log 36 = 2, want 6² = 36. Zo reken je het uit zonder rekenmachine.</p>',
          wanneer:'je twee logaritmen met hetzelfde grondtal samen wilt nemen.',
          maak:mLogRegels },
        { id:'whb-log-vgl', naam:'Een vergelijking met een logaritme', kort:'Maak de log vrij en gebruik de definitie: ᵍlog(A) = c geeft A = gᶜ',
          uit:'<p>³log(x ' + MIN + ' 1) = 2. Met de definitie: x ' + MIN + ' 1 = 3² = 9. Dus <b>x = 10</b>.</p><p>Staat er nog iets naast de log, zoals 5 + ²log x = 8? Maak dan eerst de <b>log vrij</b>: ²log x = 3, dus x = 2³ = 8.</p><p>Controleer: wat achter log staat moet positief zijn. Bij x = 10 is x ' + MIN + ' 1 = 9. Dat klopt.</p>',
          wanneer:'de x achter log staat.',
          maak:mLogVgl }
      ] },

    /* ================= exponentiële vergelijkingen ================= */
    { groep:{ id:'whb-expv', niveau:'havo', domein:'algebra', naam:'Exponentiële vergelijkingen',
        uit:'Een vergelijking met x in de exponent. Kun je beide kanten schrijven als macht van hetzelfde getal, dan ben je snel klaar. Anders gebruik je een logaritme.' },
      doelen:[
        { id:'whb-expv-gelijk', naam:'Gelijke grondtallen', kort:'Schrijf beide kanten als macht van hetzelfde grondtal; dan zijn de exponenten gelijk',
          uit:'<p>3 · 2<sup>x</sup> = 96. Maak eerst de <b>macht vrij</b>: 2<sup>x</sup> = 32.</p><p>Schrijf 32 als macht van 2: 32 = 2⁵. Dus 2<sup>x</sup> = 2⁵. Bij <b>gelijke grondtallen</b> zijn de exponenten gelijk: <b>x = 5</b>.</p><p>Dit werkt ook met een breuk: 2<sup>x</sup> = 1/8 = 2⁻³, dus x = ' + MIN + '3. En bij 2<sup>x ' + MIN + ' 1</sup> = 32 is x ' + MIN + ' 1 = 5, dus x = 6.</p>',
          wanneer:'de rechterkant een mooie macht is van het grondtal links.',
          maak:function(R){ return mGelijk(R); } },
        { id:'whb-expv-log', naam:'Oplossen met een logaritme', kort:'gˣ = a geeft x = ᵍlog a; op de rekenmachine log(a) : log(g)',
          uit:'<p>1,05<sup>x</sup> = 2,5. 2,5 is geen mooie macht van 1,05. Dan gebruik je een <b>logaritme</b>: x is de logaritme van 2,5 met grondtal 1,05.</p><p>Op de rekenmachine reken je die uit met <b>log(2,5) : log(1,05)</b> ≈ 18,78.</p><p>Staat er een getal voor de macht, zoals 200 · 1,05<sup>x</sup> = 500? Deel dan eerst: 1,05<sup>x</sup> = 2,5.</p>',
          wanneer:'de rechterkant geen mooie macht van het grondtal is.',
          maak:mMetLog },
        { id:'whb-expv-kies', naam:'Kies de handigste manier', kort:'Is de rechterkant een mooie macht van het grondtal: gelijke grondtallen. Anders: een logaritme',
          uit:'<p>Maak eerst de macht vrij. Kijk dan naar het getal aan de andere kant.</p><p>Is het een <b>mooie macht</b> van het grondtal, zoals 32 = 2⁵ of 1/9 = 3⁻²? Gebruik <b>gelijke grondtallen</b>. Dan heb je geen rekenmachine nodig en is het antwoord exact.</p><p>Is het <b>geen mooie macht</b>, zoals 1,05<sup>x</sup> = 2,5? Gebruik dan een <b>logaritme</b> en rond af.</p>',
          wanneer:'je een exponentiële vergelijking snel wilt oplossen.',
          maak:function(R){
            var log = R.heel(0, 1) === 1, m = log ? mMetLog(R) : mGelijk(R, R.kies(['kaal', 'voor'])), opties = ['gelijke grondtallen', 'met een logaritme'];
            var uitleg = log ? 'Het getal is geen mooie macht van het grondtal. Gebruik een logaritme.' : 'Het getal is een mooie macht van het grondtal. Schrijf beide kanten als macht van hetzelfde getal.';
            m.context = 'Kies eerst de handigste manier. Los dan op.' + (log ? ' Rond af op 2 decimalen.' : '');
            m.stappen = [K(R, 'Welke manier is hier het handigst?', opties[log ? 1 : 0], [], uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen);
            return m;
          } }
      ] },

    /* ================= de top van een parabool ================= */
    { groep:{ id:'whb-top', niveau:'havo', domein:'verbanden', naam:'De top van een parabool',
        uit:'De top van een parabool vind je op drie manieren: aflezen uit de topvorm, met x = −b : 2a, of midden tussen de nulpunten. Met de afgeleide kan het ook; dat staat bij De afgeleide gebruiken.' },
      doelen:[
        { id:'whb-top-vorm', naam:'Aflezen uit de topvorm', kort:'Bij f(x) = a(x − p)² + q is de top (p, q): let op het teken van p',
          uit:'<p>Staat de formule in de <b>topvorm</b> f(x) = a(x ' + MIN + ' p)² + q, dan lees je de top zo af: <b>(p, q)</b>.</p><p>Let op het teken. Bij f(x) = 2(x ' + MIN + ' 3)² + 5 is (x ' + MIN + ' 3) nul bij x = 3. De top is (3, 5). Bij f(x) = (x + 4)² ' + MIN + ' 1 is (x + 4) nul bij x = ' + MIN + '4. De top is (' + MIN + '4, ' + MIN + '1).</p><p>Is a positief, dan is de top het <b>laagste</b> punt: een dalparabool. Is a negatief, dan het <b>hoogste</b> punt: een bergparabool.</p>',
          wanneer:'de formule al de vorm a(x − p)² + q heeft.',
          maak:mTopVorm },
        { id:'whb-top-abc', naam:'De top met x = −b : 2a', kort:'Bij f(x) = ax² + bx + c ligt de top bij x = −b : 2a; vul die x in voor de y',
          uit:'<p>Bij f(x) = ax² + bx + c ligt de top bij <b>x = ' + MIN + 'b : 2a</b>.</p><p>Voorbeeld: f(x) = 2x² ' + MIN + ' 8x + 3. Hier is a = 2 en b = ' + MIN + '8. Dan x = 8 : 4 = <b>2</b>.</p><p>De y van de top vind je door x = 2 in te vullen: f(2) = 2 · 4 ' + MIN + ' 16 + 3 = <b>' + MIN + '5</b>. De top is (2, ' + MIN + '5).</p>',
          wanneer:'de formule de vorm ax² + bx + c heeft.',
          maak:mTopAbc },
        { id:'whb-top-sym', naam:'Midden tussen de nulpunten', kort:'Bij f(x) = a(x − p)(x − q) ligt de top midden tussen de nulpunten p en q',
          uit:'<p>Een parabool is <b>symmetrisch</b>. De top ligt precies in het <b>midden tussen de nulpunten</b>.</p><p>Bij f(x) = 2(x ' + MIN + ' 1)(x ' + MIN + ' 5) zijn de nulpunten x = 1 en x = 5. Het midden is (1 + 5) : 2 = <b>3</b>.</p><p>Vul x = 3 in: f(3) = 2 · (3 ' + MIN + ' 1) · (3 ' + MIN + ' 5) = 2 · 2 · (' + MIN + '2) = <b>' + MIN + '8</b>. De top is (3, ' + MIN + '8).</p>',
          wanneer:'de formule als product van twee haakjes geschreven is.',
          maak:mTopSym },
        { id:'whb-top-kies', naam:'Kies de handigste manier', kort:'Topvorm: aflezen. Twee haakjes met x: midden tussen de nulpunten. Anders: x = −b : 2a',
          uit:'<p>Kijk eerst hoe de formule eruitziet.</p><p>Staat er <b>a(x ' + MIN + ' p)² + q</b>? Dan <b>lees je de top af</b>.</p><p>Staat er een product van <b>twee haakjes</b>, zoals 2(x ' + MIN + ' 1)(x ' + MIN + ' 5)? Neem dan het <b>midden tussen de nulpunten</b>.</p><p>Staat er <b>ax² + bx + c</b>? Gebruik dan <b>x = ' + MIN + 'b : 2a</b>.</p>',
          wanneer:'je de top van een parabool snel wilt vinden.',
          maak:function(R){
            var s = R.heel(0, 2), opties = ['aflezen uit de topvorm', 'midden tussen de nulpunten', 'x = ' + MIN + 'b : 2a'], m, uitleg;
            if (s === 0){ m = mTopVorm(R); uitleg = 'De formule staat in de topvorm a(x ' + MIN + ' p)² + q. Je kunt de top aflezen.'; }
            else if (s === 1){ m = mTopSym(R); delete m.beeld; uitleg = 'De formule is een product van haakjes. De nulpunten zie je meteen.'; }
            else { m = mTopAbc(R); uitleg = 'De formule heeft de vorm ax² + bx + c. Gebruik x = ' + MIN + 'b : 2a.'; }
            m.context = 'Kies eerst de handigste manier. Bereken dan de top en schrijf hem als (x, y).';
            m.stappen = [K(R, 'Welke manier is hier het handigst?', opties[s], [], uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen);
            return m;
          } }
      ] },

    /* ================= functiewaarde, domein en bereik ================= */
    { groep:{ id:'whb-fun', niveau:'havo', domein:'verbanden', naam:'Functiewaarde, domein en bereik',
        uit:'Met f(x) reken je een functiewaarde uit. Het domein zijn de x-waarden die je mag invullen, het bereik de y-waarden die eruit kunnen komen.' },
      doelen:[
        { id:'whb-fun-waarde', naam:'Een functiewaarde berekenen', kort:'Vervang elke x door het getal, met haakjes eromheen, en reken uit: eerst machten, dan keer, dan plus en min',
          uit:'<p>f(' + MIN + '2) betekent: vul <b>x = ' + MIN + '2</b> in de formule van f in.</p><p>Zet het getal <b>tussen haakjes</b>. Bij f(x) = 2x² ' + MIN + ' 3x + 1: f(' + MIN + '2) = 2 · (' + MIN + '2)² ' + MIN + ' 3 · (' + MIN + '2) + 1.</p><p>Reken uit in de goede volgorde: eerst de macht, (' + MIN + '2)² = 4. Dan keer: 2 · 4 = 8 en ' + MIN + '3 · (' + MIN + '2) = 6. Dan optellen: 8 + 6 + 1 = <b>15</b>.</p>',
          wanneer:'je wilt weten welke y bij een x hoort.',
          maak:mWaarde },
        { id:'whb-fun-domein', naam:'Het domein van een wortelfunctie', kort:'Onder de wortel mag geen negatief getal staan: los op wat eronder staat ≥ 0',
          uit:'<p>Het <b>domein</b> zijn alle x-waarden die je in de formule mag invullen.</p><p>Bij een wortel mag het getal <b>onder de wortel</b> niet negatief zijn. Bij f(x) = √(2x ' + MIN + ' 6) moet dus 2x ' + MIN + ' 6 ≥ 0. Dan 2x ≥ 6, dus <b>x ≥ 3</b>.</p><p>Deel je door een negatief getal, dan <b>klapt het teken om</b>. Bij √(8 ' + MIN + ' 2x): ' + MIN + '2x ≥ ' + MIN + '8, dus x ≤ 4.</p>',
          wanneer:'er een wortel met x in de formule staat.',
          maak:mDomein },
        { id:'whb-fun-bereikw', naam:'Het bereik van een wortelfunctie', kort:'Zoek het beginpunt waar de wortel 0 is; met + voor de wortel gaat de grafiek omhoog, met − omlaag',
          uit:'<p>Het <b>bereik</b> zijn alle y-waarden die uit de formule kunnen komen.</p><p>Een wortel is nooit negatief. De kleinste waarde is √0 = 0, bij het <b>beginpunt</b>. Bij f(x) = 3 + 2√(x ' + MIN + ' 1) ligt het beginpunt bij x = 1, met y = 3 + 0 = 3.</p><p>Staat er <b>+</b> voor de wortel, dan komt er alleen iets bij: het bereik is <b>y ≥ 3</b>. Staat er <b>' + MIN + '</b>, dan gaat er iets af en is het bereik y ≤ 3.</p>',
          wanneer:'je wilt weten welke y-waarden een wortelfunctie kan hebben.',
          maak:mBereikW },
        { id:'whb-fun-bereikp', naam:'Het bereik van een parabool', kort:'Bereken de top; bij een dalparabool is het bereik y ≥ de y van de top, bij een bergparabool y ≤',
          uit:'<p>Bij een parabool hangt het bereik af van de <b>top</b>.</p><p>Is a positief, dan is het een dalparabool. De top is het laagste punt. Ligt de top bij y = ' + MIN + '5, dan is het bereik <b>y ≥ ' + MIN + '5</b>.</p><p>Is a negatief, dan is het een bergparabool en is het bereik <b>y ≤</b> de y van de top. Bereken de top met x = ' + MIN + 'b : 2a.</p>',
          wanneer:'je wilt weten welke y-waarden een kwadratische functie kan hebben.',
          maak:mBereikP }
      ] },

    /* ================= transformaties ================= */
    { groep:{ id:'whb-tr', niveau:'havo', domein:'verbanden', naam:'Transformaties',
        uit:'Een grafiek verschuiven of vermenigvuldigen ten opzichte van een as: wat er met een punt gebeurt, en hoe je de nieuwe formule maakt.' },
      doelen:[
        { id:'whb-tr-punt', naam:'Het beeld van een punt', kort:'Verschuiven: tel op bij x en y. Ten opzichte van de x-as: y keer het getal. Ten opzichte van de y-as: x keer het getal',
          uit:'<p>Bij een transformatie verhuist elk punt van de grafiek. Het nieuwe punt heet het <b>beeld</b>.</p><p><b>Verschuiven</b> 3 naar rechts en 2 omlaag: (4, 6) wordt (4 + 3, 6 ' + MIN + ' 2) = (7, 4).</p><p><b>Vermenigvuldigen ten opzichte van de x-as</b> met 3: de afstand tot de x-as wordt 3 keer zo groot. Alleen y verandert: (4, 6) wordt (4, 18). <b>Ten opzichte van de y-as</b> met 3: alleen x verandert, (4, 6) wordt (12, 6).</p>',
          wanneer:'je wilt weten waar een punt van de grafiek terechtkomt.',
          maak:mTrPunt },
        { id:'whb-tr-schuif', naam:'Verschuiven: de nieuwe formule', kort:'p naar rechts: vervang x door (x − p). q omhoog: tel q op bij de hele formule',
          uit:'<p>Je verschuift de grafiek van f(x) = x² <b>3 naar rechts</b> en <b>2 omhoog</b>.</p><p>Naar rechts: vervang elke x door <b>(x ' + MIN + ' 3)</b>. Let op: rechts is min, links is plus. Omhoog: tel <b>2</b> op bij de hele formule.</p><p>De nieuwe formule is g(x) = (x ' + MIN + ' 3)² + 2. Zo gaat de top van (0, 0) naar (3, 2).</p>',
          wanneer:'je een grafiek opschuift en de formule erbij zoekt.',
          maak:mTrSchuif },
        { id:'whb-tr-xas', naam:'Vermenigvuldigen ten opzichte van de x-as', kort:'Met a ten opzichte van de x-as: de hele formule keer a, dus g(x) = a · f(x)',
          uit:'<p>Vermenigvuldigen <b>ten opzichte van de x-as</b> met 3: elke y-waarde wordt 3 keer zo groot. De x-waarden blijven hetzelfde.</p><p>Daarom zet je de <b>hele formule keer 3</b>: bij f(x) = x² ' + MIN + ' 4 wordt het g(x) = 3(x² ' + MIN + ' 4) = 3x² ' + MIN + ' 12.</p><p>De nulpunten blijven op hun plek, want 3 · 0 = 0.</p>',
          wanneer:'een grafiek in de hoogte wordt uitgerekt of ingedrukt.',
          maak:mTrXas },
        { id:'whb-tr-yas', naam:'Vermenigvuldigen ten opzichte van de y-as', kort:'Met b ten opzichte van de y-as: vervang x door x : b',
          uit:'<p>Vermenigvuldigen <b>ten opzichte van de y-as</b> met 2: elke x-waarde wordt 2 keer zo groot. De grafiek wordt twee keer zo breed. De y-waarden blijven hetzelfde.</p><p>In de formule <b>vervang je x door x : 2</b>, dus door ½x. Bij f(x) = x² ' + MIN + ' 4x wordt het g(x) = (½x)² ' + MIN + ' 4 · ½x = ¼x² ' + MIN + ' 2x.</p><p>Let op: met 2 vermenigvuldigen geeft ½x in de formule. Het is precies andersom dan je zou denken.</p>',
          wanneer:'een grafiek in de breedte wordt uitgerekt of ingedrukt.',
          maak:mTrYas },
        { id:'whb-tr-twee', naam:'Twee transformaties na elkaar', kort:'Werk in de volgorde van de opgave: pas de tweede toe op de formule na de eerste',
          uit:'<p>Bij twee transformaties werk je <b>in volgorde</b>. Maak eerst de formule na de eerste stap. Pas daarna de tweede stap toe op die nieuwe formule.</p><p>f(x) = x². Eerst ten opzichte van de x-as met 2: y = 2x². Dan 1 naar rechts en 3 omhoog: g(x) = 2(x ' + MIN + ' 1)² + 3.</p><p>Andersom gaat het anders. Eerst verschuiven geeft (x ' + MIN + ' 1)² + 3, dan keer 2 geeft g(x) = 2(x ' + MIN + ' 1)² + 6. De <b>volgorde</b> maakt dus uit.</p>',
          wanneer:'een grafiek eerst op de ene en dan op de andere manier verandert.',
          maak:mTrTwee }
      ] },

    /* ================= de afgeleide ================= */
    { groep:{ id:'whb-afg', niveau:'havo', domein:'verbanden', naam:'De afgeleide',
        uit:'De afgeleide f′(x) geeft de helling van de grafiek. Je differentieert een macht, een veelterm, en functies die je eerst herleidt.' },
      doelen:[
        { id:'whb-afg-macht', naam:'De afgeleide van a · xⁿ', kort:'De exponent gaat ervoor en wordt 1 minder: 5x³ wordt 15x²',
          uit:'<p>De <b>afgeleide</b> van f(x) = xⁿ is <b>f′(x) = n · xⁿ⁻¹</b>: de exponent gaat ervoor en wordt 1 minder.</p><p>Staat er een getal voor, dan vermenigvuldig je mee: f(x) = 5x³ geeft f′(x) = 3 · 5x² = <b>15x²</b>.</p><p>Typ je antwoord met ^, zoals 15x^2.</p>',
          wanneer:'je de afgeleide van één macht van x zoekt.',
          maak:mAfgMacht },
        { id:'whb-afg-veel', naam:'De afgeleide van een veelterm', kort:'Differentieer elke term apart; een los getal wordt 0',
          uit:'<p>Bij een som differentieer je <b>elke term apart</b>: dat is de somregel.</p><p>f(x) = 2x³ ' + MIN + ' 4x² + 5x ' + MIN + ' 7. Dan wordt 2x³ 6x², ' + MIN + '4x² wordt ' + MIN + '8x, 5x wordt 5 en het losse getal ' + MIN + '7 wordt <b>0</b>.</p><p>Samen: f′(x) = <b>6x² ' + MIN + ' 8x + 5</b>.</p>',
          wanneer:'de formule bestaat uit termen met machten van x.',
          maak:mAfgVeel },
        { id:'whb-afg-herleid', naam:'Eerst herleiden, dan differentiëren', kort:'Werk haakjes weg en schrijf breuken en wortels als a · xⁿ; differentieer daarna',
          uit:'<p>Haakjes, breuken en wortels kun je niet zomaar differentiëren. <b>Herleid eerst</b>.</p><p>f(x) = (2x ' + MIN + ' 1)(x + 3) = 2x² + 5x ' + MIN + ' 3, dus f′(x) = 4x + 5.</p><p>f(x) = 6 / x² = 6x⁻², dus f′(x) = ' + MIN + '12x⁻³. En f(x) = 4√x = 4x^0,5, dus f′(x) = 2x^' + MIN + '0,5.</p>',
          wanneer:'er haakjes, een breuk of een wortel in de formule staan.',
          maak:mAfgHerleid }
      ] },

    /* ================= de afgeleide gebruiken ================= */
    { groep:{ id:'whb-afgg', niveau:'havo', domein:'verbanden', naam:'De afgeleide gebruiken',
        uit:'Met de afgeleide bereken je de helling in een punt, de vergelijking van de raaklijn, of een grafiek stijgt of daalt, en de toppen.' },
      doelen:[
        { id:'whb-afgg-helling', naam:'De helling in een punt', kort:'Bereken f′(x) en vul de x van het punt in',
          uit:'<p>De <b>helling</b> van de grafiek in een punt is de afgeleide in dat punt.</p><p>f(x) = x³ ' + MIN + ' 2x. Dan f′(x) = 3x² ' + MIN + ' 2. De helling bij x = 2 is f′(2) = 3 · 4 ' + MIN + ' 2 = <b>10</b>.</p><p>Let op: vul in bij <b>f′</b>, niet bij f.</p>',
          wanneer:'je wilt weten hoe steil de grafiek in een punt is.',
          maak:mHelling },
        { id:'whb-afgg-raak', naam:'De vergelijking van de raaklijn', kort:'De helling a = f′(p); het raakpunt is (p, f(p)); vul dat in bij y = ax + b',
          uit:'<p>De <b>raaklijn</b> in het punt met x = p raakt de grafiek daar. Het is een rechte lijn y = ax + b.</p><p>De helling: <b>a = f′(p)</b>. Het raakpunt: (p, f(p)).</p><p>Voorbeeld: f(x) = x² ' + MIN + ' 3x bij x = 4. f′(x) = 2x ' + MIN + ' 3, dus a = f′(4) = 5. f(4) = 16 ' + MIN + ' 12 = 4. Vul (4, 4) in: 4 = 5 · 4 + b, dus b = ' + MIN + '16. De raaklijn is <b>y = 5x ' + MIN + ' 16</b>.</p>',
          wanneer:'je de rechte lijn zoekt die de grafiek in een punt raakt.',
          maak:mRaak },
        { id:'whb-afgg-stijg', naam:'Stijgt of daalt de grafiek?', kort:'f′(p) positief: de grafiek stijgt bij x = p. f′(p) negatief: hij daalt',
          uit:'<p>De afgeleide vertelt of de grafiek stijgt of daalt. Is <b>f′(p) &gt; 0</b>, dan <b>stijgt</b> de grafiek bij x = p. Is <b>f′(p) &lt; 0</b>, dan <b>daalt</b> hij.</p><p>f(x) = x³ ' + MIN + ' 12x. f′(x) = 3x² ' + MIN + ' 12. Bij x = 1: f′(1) = 3 ' + MIN + ' 12 = ' + MIN + '9. Negatief, dus de grafiek daalt bij x = 1.</p><p>Is f′(p) = 0, dan ligt er misschien een top.</p>',
          wanneer:'je zonder grafiek wilt weten of een functie op een plek toeneemt of afneemt.',
          maak:mStijg },
        { id:'whb-afgg-top', naam:'Toppen berekenen met f′(x) = 0', kort:'In een top is de helling 0: los f′(x) = 0 op en vul de x-waarden in f in',
          uit:'<p>In een <b>top</b> loopt de grafiek even horizontaal: de helling is 0. Los dus <b>f′(x) = 0</b> op.</p><p>f(x) = x³ ' + MIN + ' 3x² ' + MIN + ' 9x + 2. f′(x) = 3x² ' + MIN + ' 6x ' + MIN + ' 9 = 0. Deel door 3: x² ' + MIN + ' 2x ' + MIN + ' 3 = 0, dus (x + 1)(x ' + MIN + ' 3) = 0. Dan x = ' + MIN + '1 of x = 3.</p><p>Vul in bij f: f(' + MIN + '1) = 7 en f(3) = ' + MIN + '25. De toppen zijn <b>(' + MIN + '1, 7)</b> en <b>(3, ' + MIN + '25)</b>.</p>',
          wanneer:'je de hoogste of laagste punten van een grafiek zoekt.',
          maak:mToppen }
      ] },

    /* ================= periodieke functies ================= */
    { groep:{ id:'whb-per', niveau:'havo', domein:'verbanden', naam:'Periodieke functies',
        uit:'Een grafiek die zich steeds herhaalt. Je leest de evenwichtsstand, de amplitude en de periode af uit een grafiek of een formule, en stelt zelf een formule op.' },
      doelen:[
        { id:'whb-per-ea', naam:'Evenwichtsstand en amplitude', kort:'Evenwichtsstand = (max + min) : 2; amplitude = (max − min) : 2',
          uit:'<p>Een periodieke grafiek golft tussen een hoogste waarde (<b>max</b>) en een laagste waarde (<b>min</b>).</p><p>De <b>evenwichtsstand</b> ligt precies in het midden: (max + min) : 2. Bij max 7 en min 1 is dat (7 + 1) : 2 = 4.</p><p>De <b>amplitude</b> is de afstand van de evenwichtsstand tot de max: (max ' + MIN + ' min) : 2. Hier (7 ' + MIN + ' 1) : 2 = 3.</p>',
          wanneer:'je bij een golvende grafiek het midden en de uitslag zoekt.',
          maak:mPerEA },
        { id:'whb-per-per', naam:'De periode aflezen', kort:'De periode is de afstand van een top tot de volgende top',
          uit:'<p>De <b>periode</b> is de lengte van één golf: na één periode begint alles opnieuw.</p><p>Lees af bij welke x de grafiek een top heeft, en bij welke x de <b>volgende top</b>. Het verschil is de periode. Toppen bij x = 3 en x = 15 geven een periode van 15 ' + MIN + ' 3 = <b>12</b>.</p><p>Het kan ook van dal tot dal. Van een top tot het volgende dal is maar een halve periode.</p>',
          wanneer:'je wilt weten hoe lang het duurt voor de grafiek zich herhaalt.',
          maak:mPerPer },
        { id:'whb-per-formule', naam:'Aflezen uit de formule', kort:'Bij y = a + b sin(c(x − d)): evenwichtsstand a, amplitude b, periode 2π : c',
          uit:'<p>Een <b>sinusoïde</b> heeft de formule y = a + b sin(c(x ' + MIN + ' d)).</p><p><b>a</b> is de evenwichtsstand. <b>b</b> is de amplitude, zonder min-teken. De <b>periode</b> is <b>2π : c</b>.</p><p>Voorbeeld: y = 5 + 3 sin(π/6 · (x ' + MIN + ' 2)). Evenwichtsstand 5, amplitude 3, periode 2π : (π/6) = 12.</p>',
          wanneer:'je de formule van een sinusoïde hebt en de eigenschappen zoekt.',
          maak:mPerForm },
        { id:'whb-per-opstel', naam:'Een formule opstellen', kort:'Zoek a, b, de periode en het beginpunt d in de grafiek; c = 2π : periode',
          uit:'<p>Je maakt een formule y = a + b sin(c(x ' + MIN + ' d)) bij een grafiek.</p><p><b>a</b> = evenwichtsstand en <b>b</b> = amplitude: die haal je uit de max en de min. Lees de <b>periode</b> af en reken uit: <b>c = 2π : periode</b>. Bij periode 12 is c = π/6.</p><p><b>d</b> is het <b>beginpunt</b>: een x waar de grafiek <b>stijgend</b> door de evenwichtsstand gaat.</p>',
          wanneer:'je bij een golvende grafiek een formule zoekt.',
          maak:mPerOpstel }
      ] },

    /* ================= sinusregel en cosinusregel ================= */
    { groep:{ id:'whb-sc', niveau:'havo', domein:'meetkunde', naam:'De sinusregel en de cosinusregel',
        uit:'Rekenen in een driehoek zonder rechte hoek. Zijde a ligt tegenover hoek A, zijde b tegenover hoek B en zijde c tegenover hoek C.' },
      doelen:[
        { id:'whb-sc-szijde', naam:'Sinusregel: een zijde', kort:'Ken je een zijde met de hoek ertegenover? Dan a / sin A = b / sin B',
          uit:'<p>In elke driehoek geldt de <b>sinusregel</b>: <b>a / sin A = b / sin B = c / sin C</b>. Een zijde gedeeld door de sinus van de hoek ertegenover is overal hetzelfde.</p><p>Je hebt een <b>paar</b> nodig: een zijde én de hoek ertegenover. Is ∠A = 40°, ∠B = 65° en a = 8, dan b / sin 65° = 8 / sin 40°. Dus b = 8 · sin 65° / sin 40° ≈ 11,3.</p><p>Ken je twee hoeken, dan is de derde 180° min die twee.</p>',
          wanneer:'je een zijde zoekt en een zijde met de hoek ertegenover kent.',
          maak:mSinZijde },
        { id:'whb-sc-shoek', naam:'Sinusregel: een hoek', kort:'sin B = b · sin A / a; neem dan sin⁻¹',
          uit:'<p>Met de sinusregel vind je ook een <b>hoek</b>. Ken je a, ∠A en b, dan is sin B / b = sin A / a. Dus <b>sin B = b · sin A / a</b>.</p><p>Dan ∠B = sin⁻¹(b · sin A / a). Voorbeeld: a = 10, ∠A = 70°, b = 7. sin B = 7 · sin 70° / 10 ≈ 0,658, dus ∠B ≈ 41,1°.</p><p>Hier is b korter dan a. Dan is ∠B kleiner dan ∠A en dus een scherpe hoek.</p>',
          wanneer:'je een hoek zoekt en een zijde met de hoek ertegenover kent.',
          maak:mSinHoek },
        { id:'whb-sc-czijde', naam:'Cosinusregel: een zijde', kort:'Twee zijden en de hoek ertussen: a² = b² + c² − 2bc · cos A',
          uit:'<p>Ken je <b>twee zijden en de hoek ertussen</b>? Dan heb je geen paar voor de sinusregel. Gebruik de <b>cosinusregel</b>: <b>a² = b² + c² ' + MIN + ' 2 · b · c · cos A</b>.</p><p>Voorbeeld: b = 5, c = 7 en ∠A = 60°. a² = 25 + 49 ' + MIN + ' 70 · cos 60° = 74 ' + MIN + ' 35 = 39. Dus a = √39 ≈ 6,2.</p>',
          wanneer:'je twee zijden en de hoek ertussen kent.',
          maak:mCosZijde },
        { id:'whb-sc-choek', naam:'Cosinusregel: een hoek', kort:'Drie zijden bekend: cos A = (b² + c² − a²) / (2bc)',
          uit:'<p>Ken je <b>alle drie de zijden</b>? Dan vind je elke hoek met de cosinusregel, omgewerkt: <b>cos A = (b² + c² ' + MIN + ' a²) / (2 · b · c)</b>.</p><p>Voorbeeld: a = 7, b = 5, c = 8. cos A = (25 + 64 ' + MIN + ' 49) / 80 = 40 / 80 = 0,5. Dus ∠A = cos⁻¹(0,5) = 60°.</p><p>Let op: a is de zijde tegenover de hoek die je zoekt.</p>',
          wanneer:'je alle drie de zijden kent en een hoek zoekt.',
          maak:mCosHoek },
        { id:'whb-sc-kies', naam:'Kies: sinusregel of cosinusregel', kort:'Ken je een zijde met de hoek ertegenover: sinusregel. Anders: cosinusregel',
          uit:'<p>Zoek eerst naar een <b>paar</b>: een zijde én de hoek ertegenover, die je allebei kent. Ken je twee hoeken, reken dan eerst de derde uit.</p><p>Heb je een paar? Gebruik de <b>sinusregel</b>.</p><p>Geen paar, maar wel <b>twee zijden met de hoek ertussen</b>, of <b>drie zijden</b>? Gebruik de <b>cosinusregel</b>.</p>',
          wanneer:'je in een driehoek zonder rechte hoek gaat rekenen.',
          maak:function(R){
            var s = R.heel(0, 3), m = [mSinZijde, mSinHoek, mCosZijde, mCosHoek][s](R), opties = ['de sinusregel', 'de cosinusregel'], sin = m.regel === 'sinus';
            var uitleg = sin ? 'Je kent een zijde én de hoek ertegenover: een paar. Gebruik de sinusregel.' : 'Er is geen paar van een zijde met de hoek ertegenover. Gebruik de cosinusregel.';
            if (s === 0 && /180°/.test(m.stappen[0].tekst)) uitleg = 'Reken eerst de derde hoek uit. Dan heb je een zijde met de hoek ertegenover: de sinusregel.';
            m.stappen = [K(R, 'Welke regel gebruik je?', opties[sin ? 0 : 1], [], uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen);
            m.context = 'Kies eerst de goede regel. ' + m.context;
            return m;
          } }
      ] },

    /* ================= cirkels en raaklijnen ================= */
    { groep:{ id:'whb-cir', niveau:'havo', domein:'meetkunde', naam:'Cirkels en raaklijnen',
        uit:'Hoeken in een cirkel, en de raaklijn aan een cirkel: die staat loodrecht op de straal naar het raakpunt.' },
      doelen:[
        { id:'whb-cir-hoek', naam:'Middelpuntshoek en omtrekshoek', kort:'De middelpuntshoek is twee keer de omtrekshoek op dezelfde boog',
          uit:'<p>A en B liggen op een cirkel met middelpunt M. <b>∠AMB</b> is de <b>middelpuntshoek</b>: het hoekpunt is M. Een hoek ∠ACB met C op de cirkel heet een <b>omtrekshoek</b>.</p><p>Staan ze op dezelfde boog AB, dan is de middelpuntshoek <b>twee keer</b> zo groot: ∠AMB = 2 · ∠ACB.</p><p>Voorbeeld: ∠ACB = 35°, dan ∠AMB = 70°. Andersom: ∠AMB = 100°, dan ∠ACB = 50°.</p>',
          wanneer:'er hoeken in een cirkel staan met het hoekpunt in het middelpunt of op de cirkel.',
          maak:mCirHoek },
        { id:'whb-cir-raak', naam:'Raaklijn en straal: Pythagoras', kort:'De raaklijn staat loodrecht op de straal: in driehoek MRP is ∠R = 90°, dus Pythagoras',
          uit:'<p>Een <b>raaklijn</b> raakt de cirkel in één punt R. De raaklijn staat altijd <b>loodrecht op de straal</b> MR.</p><p>Van een punt P buiten de cirkel naar R krijg je de rechthoekige driehoek MRP, met de rechte hoek bij R. De schuine zijde is <b>MP</b>.</p><p>Voorbeeld: straal 5 en MP = 13. Dan PR² = 13² ' + MIN + ' 5² = 144, dus PR = 12.</p>',
          wanneer:'je een lengte zoekt bij een raaklijn aan een cirkel.',
          maak:mRaakLengte },
        { id:'whb-cir-coord', naam:'De raaklijn met coördinaten', kort:'Bereken de richtingscoëfficiënt van MP; die van de raaklijn is −1 gedeeld door die; vul P in voor b',
          uit:'<p>De cirkel (x ' + MIN + ' 1)² + (y ' + MIN + ' 2)² = 25 heeft middelpunt M(1, 2). Het punt P(4, 6) ligt op de cirkel. Wat is de raaklijn in P?</p><p>De <b>richtingscoëfficiënt</b> van MP is 4 : 3 = 4/3. De raaklijn staat <b>loodrecht</b> op MP. Twee loodrechte lijnen hebben rc\'s die keer elkaar ' + MIN + '1 zijn. Dus de rc van de raaklijn is <b>' + MIN + '1 : (4/3) = ' + MIN + '3/4</b>.</p><p>Vul P in bij y = ' + MIN + '0,75x + b: 6 = ' + MIN + '3 + b, dus b = 9. De raaklijn is <b>y = ' + MIN + '0,75x + 9</b>.</p>',
          wanneer:'je de vergelijking zoekt van een raaklijn aan een cirkel in een assenstelsel.',
          maak:mRaakCoord }
      ] }
  ]);
})();
