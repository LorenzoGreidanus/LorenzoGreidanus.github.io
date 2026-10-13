/* De leerroute wiskunde: getallen en algebra. Machten van negatieve getallen,
   termen vermenigvuldigen, twee haakjes, vergelijkingen (balans, terugrekenen,
   eerst haakjes), ongelijkheden, merkwaardige producten, ontbinden in factoren,
   kwadratische vergelijkingen (worteltrekken, ontbinden, abc-formule), machten,
   wortels en formules omwerken. Elke manier een eigen doel.
   De basis (termen samennemen, één haakje, de balans met positieve getallen)
   staat in de leerroute rekenen (rekenen-algebra.js). Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '×';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes voor stappen en antwoorden ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function S(tekst, ant, hint, fout, waarom){
    var s = { tekst:tekst, antwoord:[].concat(ant).map(function(a){ return typeof a === 'number' ? T(a) : String(a); }), hint:hint };
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
      varianten(typeof k === 'number' ? T(k) : k).forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = uitleg; });
    }
    return o;
  }
  function nz(R, lo, hi){ var x; do { x = R.heel(lo, hi); } while (!x); return x; }
  function paren(n){ return n < 0 ? '(' + T(n) + ')' : T(n); }
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sup(n){ return n === 1 ? '' : String(n).split('').map(function(c){ return SUP.charAt(+c); }).join(''); }
  function keten(g, e){ var l = []; for (var i = 0; i < e; i++) l.push(g); return l.join(' ' + X + ' '); }
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
  /* x + p of x − p, met ruimte: '(x − 3)' */
  function lin(a, b, l){ return E([[a, l || 'x'], [b, '']]); }
  function eqAnt(x){ return [T(x), 'x = ' + T(x)]; }

  /* ---------- uitdrukkingen lezen: een veelterm als { '':4, x:3, xx:1 } ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
  function pGraad(p){ var g = 0; for (var k in p) if (Math.abs(p[k]) > 1e-12) g = Math.max(g, k.length); return g; }
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
  /* zonder haakjes, en elke soort term maar een keer: 7x − 4 wel, 3x + 4x − 4 niet */
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
  function exprC(verwacht, o){
    o = o || {}; var q = lees(verwacht);
    return function(v){ var t = String(v).trim().replace(/^=/, ''), p = lees(t); if (!p || !pGelijk(p, q)) return false; return o.kaal ? kaal(t) : true; };
  }
  /* ontbonden: een factor voor de haakjes (o.voor) en haakjes met elk een letter erin; (x + 3)² mag ook */
  function factorC(doel, o){
    o = o || {}; var q = lees(doel);
    return function(v){
      var s = norm(v).replace(/\*/g, ''), i = s.indexOf('(');
      if (i < 0) return false;
      var pre = s.slice(0, i), rest = s.slice(i), groepen = [], r = /\(([^()]+)\)(\^2)?/g, m, pos = 0;
      while ((m = r.exec(rest)) && m.index === pos){ groepen.push(m[1]); if (m[2]) groepen.push(m[1]); pos = r.lastIndex; }
      if (pos !== rest.length || !groepen.length) return false;
      var P = pre === '' ? { '':1 } : pre === '-' ? { '':-1 } : lees(pre); if (!P) return false;
      var tot = P;
      for (var j = 0; j < groepen.length; j++){ var G = lees(groepen[j]); if (!G || pGraad(G) !== 1) return false; tot = pMaal(tot, G); }
      if (!pGelijk(tot, q)) return false;
      if (o.voor != null && !pGelijk(P, lees(o.voor))) return false;
      if (o.groepen && groepen.length !== o.groepen) return false;
      return true;
    };
  }
  /* een vergelijking met 0 rechts: links gelijk aan de veelterm (of min de veelterm) */
  function nulC(poly){
    var q = lees(poly);
    return function(v){ var d = String(v).split('='); if (d.length !== 2) return false; var a = lees(d[0]), b = lees(d[1]); if (!a || !b || pConst(b) !== 0) return false; return pGelijk(a, q) || pGelijk(a, pSchaal(q, -1)); };
  }
  /* gehele getallen uit een antwoord, met min-tekens; komma's en puntkomma's scheiden */
  function getallen(v){
    var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\b(en|of)\b/g, ' ').replace(/[;,]/g, ' ').trim();
    if (!/^[-\d\s]+$/.test(s)) return null;
    var l = s.split(/\s+/).filter(Boolean); if (l.some(function(x){ return !/^-?\d+$/.test(x); })) return null;
    return l.map(Number);
  }
  /* twee getallen in willekeurige volgorde */
  function paarC(p, q){ return function(v){ var l = getallen(v); if (!l || l.length !== 2) return false; return (l[0] === p && l[1] === q) || (l[0] === q && l[1] === p); }; }
  /* drie getallen in deze volgorde */
  function rijC(rij){ return function(v){ var l = getallen(v); if (!l || l.length !== rij.length) return false; return l.every(function(x, i){ return x === rij[i]; }); }; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* oplossingen: "x = 5 of x = −5", "±5", "5; −5", ook met ≈; [] is geen oplossing */
  function oplC(waarden){
    var w = uniek(waarden.map(function(x){ return String(rnd(x, 6)); })).map(Number).sort(function(a, b){ return a - b; });
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
      if (!w.length) return /geen/.test(s) && !/\d/.test(s);
      if (/geen/.test(s)) return false;
      s = s.replace(/x\s*[12]?\s*(=|≈)/g, ' ').replace(/≈|=/g, ' ').replace(/\b(of|en)\b/g, ' ').replace(/\+\s*\/?\s*-/g, '±').replace(/;/g, ' ');
      s = s.replace(/(\d),(?=\d)/g, '$1.').replace(/,/g, ' ');
      if (/[^\d\s.±-]/.test(s)) return false;
      var l = [], re = /(±|-)?\s*(\d+(?:\.\d+)?)/g, m, rest = s;
      while ((m = re.exec(s))){ var n = +m[2]; if (m[1] === '±'){ l.push(n, -n); } else l.push(m[1] === '-' ? -n : n); }
      rest = s.replace(re, '').trim(); if (rest) return false;
      l = uniek(l.map(function(x){ return String(x); })).map(Number).sort(function(a, b){ return a - b; });
      return l.length === w.length && l.every(function(x, i){ return Math.abs(x - w[i]) < 1e-9; });
    };
  }
  function oplTekst(l){ return l.length ? l.map(function(x){ return 'x = ' + T(x); }).join(' of ') : 'geen oplossing'; }
  /* een ongelijkheid: x < 3, ook 3 > x; <= en >= mogen voor ≤ en ≥ */
  function ongC(teken, getal){
    var om = { '<':'>', '>':'<', '≤':'≥', '≥':'≤' };
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/<=|=</g, '≤').replace(/>=|=>/g, '≥').replace(/,/g, '.');
      var m = /^x([<>≤≥])(-?\d+(?:\.\d+)?)$/.exec(s);
      if (m) return m[1] === teken && Math.abs(+m[2] - getal) < 1e-9;
      m = /^(-?\d+(?:\.\d+)?)([<>≤≥])x$/.exec(s);
      if (m) return m[2] === om[teken] && Math.abs(+m[1] - getal) < 1e-9;
      return false;
    };
  }
  function esc(t){ return String(t).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function keerOm(t){ return { '<':'>', '>':'<', '≤':'≥', '≥':'≤' }[t]; }
  /* een vrijgemaakte letter: "x = (y − 3) : 2" of alleen "(y − 3) : 2" */
  function vrijC(letter, verwacht){
    var q = lees(verwacht);
    return function(v){
      var d = String(v).split('='); if (d.length > 2) return false;
      if (d.length === 2){ if (norm(d[0]) !== letter.toLowerCase()) return false; d = [d[1]]; }
      var p = lees(d[0]); return !!p && pGelijk(p, q);
    };
  }
  /* k√m */
  function wortelC(k, m){
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/[×·*x]/g, '').replace(/wortel/g, '√');
      var r = /^(\d+)√\(?(\d+)\)?$/.exec(s); return !!r && +r[1] === k && +r[2] === m;
    };
  }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700');
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal' + (o.m ? ' ' + o.m : '') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + '"/>'; }
  function cirkel(x, y, r, k, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + k + (o.s ? ';stroke:' + o.s + ';stroke-width:' + (o.w || 2) : '') + '"/>'; }
  /* een boog met pijlpunt van x1 naar x2, boven of onder y */
  function boog(x1, x2, y, omhoog, kleur, label, h){
    var mid = (x1 + x2) / 2, d = omhoog ? -1 : 1, r = x2 > x1 ? -1 : 1;
    return '<path d="M' + n1(x1) + ' ' + n1(y) + ' Q' + n1(mid) + ' ' + n1(y + d * h * 1.6) + ' ' + n1(x2) + ' ' + n1(y) + '" style="fill:none;stroke:' + kleur + ';stroke-width:2.6;stroke-linecap:round"/>' +
      '<path d="M' + n1(x2) + ' ' + n1(y) + ' l' + (r * 8) + ' ' + (d * 8) + ' M' + n1(x2) + ' ' + n1(y) + ' l' + (r * 1.5) + ' ' + (d * 11) + '" style="fill:none;stroke:' + kleur + ';stroke-width:2.6;stroke-linecap:round"/>' +
      (label ? tx(mid, y + d * h * 0.8 + (omhoog ? -7 : 17), label, { k:kleur, vet:true }) : '');
  }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).filter(Boolean).map(function(x){ return /^<svg/.test(x) ? '<div style="width:100%;max-width:620px">' + x + '</div>' : x; }).join('') + '</div>'; }

  /* het werkschema van de balansmethode: elke regel de vergelijking, ernaast wat je aan beide kanten doet */
  function schema(rijen, n){
    var r = rijen.slice(0, n + 1).map(function(x, i){ return [x[0], i < n ? x[1] : '']; });
    return R0.teken.tabel([['vergelijking', 'aan beide kanten']].concat(r), { kop:true, nadruk:[[r.length, 0]] });
  }
  /* de pijlenketting heen en terug: vak = getallen in de vakjes, ops = bewerkingen heen, terug = omgekeerd; nT = aantal bogen terug */
  function ketting(vak, ops, terug, nT){
    var m = vak.length, bw = 78, gap = 74, x0 = 10, y = 64, bh = 42, s = '';
    function cx(i){ return x0 + i * (bw + gap) + bw / 2; }
    vak.forEach(function(t, i){ var x = x0 + i * (bw + gap), v = String(t) === '?'; s += rc(x, y, bw, bh, { rx:10, s:v ? 'var(--lr-2)' : 'var(--ink)', dash:v ? '5 4' : '' }) + tx(x + bw / 2, y + 28, String(t), { m:String(t).length > 5 ? '' : 'groot', k:v ? 'var(--lr-2)' : '' }); });
    ops.forEach(function(o, i){ s += boog(cx(i) + 16, cx(i + 1) - 16, y - 3, true, KL[0], o, 22); });
    terug.forEach(function(o, i){ if (i >= m - 1 - nT) s += boog(cx(i + 1) - 16, cx(i) + 16, y + bh + 3, false, KL[1], o, 22); });
    return svg(x0 * 2 + m * bw + (m - 1) * gap, 172, s, 'pijlenketting heen en terug', 140 * m);
  }
  /* een getallenlijn met de oplossing van een ongelijkheid: open rondje bij < en >, dicht bij ≤ en ≥ */
  function ongLijn(v, teken){
    var W = 560, L = 30, Rr = 530, Y = 46, van = v - 5, tot = v + 5, s = '';
    function x(n){ return L + (n - van) / (tot - van) * (Rr - L); }
    var rechts = teken === '>' || teken === '≥', dicht = teken === '≤' || teken === '≥';
    s += ln(L - 14, Y, Rr + 14, Y);
    for (var n = van; n <= tot; n++){ s += ln(x(n), Y - 6, x(n), Y + 6) + tx(x(n), Y + 28, T(n), { m:'klein' }); }
    var x2 = rechts ? Rr + 10 : L - 10;
    s += ln(x(v), Y, x2, Y, { k:KL[1], w:6 }) + '<path d="M' + n1(x2) + ' ' + Y + ' l' + (rechts ? -12 : 12) + ' -9 M' + n1(x2) + ' ' + Y + ' l' + (rechts ? -12 : 12) + ' 9" style="fill:none;stroke:' + KL[1] + ';stroke-width:4;stroke-linecap:round"/>';
    s += cirkel(x(v), Y, 8, dicht ? KL[1] : 'var(--kaart)', { s:KL[1], w:3 });
    return svg(W, 86, s, 'getallenlijn met de oplossing x ' + teken + ' ' + T(v), 600);
  }
  /* een rooster voor haakjes: kop bovenaan, zij links, vakjes ingevuld als n groot genoeg is */
  function hokjes(kop, zij, vak, n, volg){
    var v = vak.map(function(r, i){ return r.map(function(c, j){ return n >= volg[i][j] ? c : ''; }); });
    return R0.teken.rooster(kop, zij, v);
  }
  function teken(n){ return n < 0 ? MIN + T(-n) : '+' + T(n); }

  /* ================= vergelijkingen: de manieren (ook voor "Kies de handigste manier") ================= */
  function bew(c, l){ return c > 0 ? MIN + ' ' + E([[c, l || '']]) : '+ ' + E([[-c, l || '']]); }
  function weg(c, l){ return c > 0 ? 'trek aan beide kanten ' + E([[c, l || '']]) + ' af' : 'tel aan beide kanten ' + E([[-c, l || '']]) + ' op'; }
  /* a·x + b = c·x + d, met e = a − c niet 0 */
  function balansVgl(R, metX){
    var a, b, c, d, x, e;
    do { x = nz(R, -8, 9); e = R.kies([2, 3, 4, 5, 6]); c = metX ? nz(R, -4, 4) : 0; a = c + e; b = nz(R, -12, 12); d = a * x + b - c * x; } while (a === 0 || Math.abs(d) > 40 || d === b);
    return { a:a, b:b, c:c, d:d, x:x, e:e, vgl:E([[a, 'x'], [b, '']]) + ' = ' + (c ? E([[c, 'x'], [d, '']]) : T(d)) };
  }
  function mBalans(R, v){
    var a = v.a, b = v.b, c = v.c, d = v.d, e = v.e, x = v.x, st = [], rij = [[v.vgl, '']];
    if (c){
      rij[0][1] = bew(c, 'x');
      rij.push([E([[e, 'x'], [b, '']]) + ' = ' + T(d), '']);
      st.push(S('Haal de x weg aan de rechterkant: ' + weg(c, 'x') + '. Hoeveel x blijft er links over? ' + T(a) + ' ' + (c > 0 ? MIN : '+') + ' ' + T(Math.abs(c)) + ' =', e,
        'Links stond ' + E([[a, 'x']]) + '. ' + (c > 0 ? 'Er gaat ' + E([[c, 'x']]) + ' af.' : 'Er komt ' + E([[-c, 'x']]) + ' bij.'),
        F(e, a + c, c > 0 ? 'Je telde op. Rechts staat +' + E([[c, 'x']]) + ', dus aan beide kanten gaat ' + E([[c, 'x']]) + ' eraf.' : 'Je trok af. Rechts staat ' + E([[c, 'x']]) + ', dus aan beide kanten komt ' + E([[-c, 'x']]) + ' erbij.')));
    }
    rij[rij.length - 1][1] = bew(b);
    rij.push([E([[e, 'x']]) + ' = ' + T(d - b), ': ' + paren(e)]);
    rij.push(['x = ' + T(x), '']);
    st.push(S('Nu staat er ' + E([[e, 'x'], [b, '']]) + ' = ' + T(d) + '. ' + weg(b).charAt(0).toUpperCase() + weg(b).slice(1) + ': ' + E([[e, 'x']]) + ' = ' + T(d) + ' ' + (b > 0 ? MIN : '+') + ' ' + T(Math.abs(b)) + ' =', d - b,
      b > 0 ? 'Links staat + ' + b + '. Haal die aan beide kanten weg.' : 'Links staat ' + MIN + ' ' + (-b) + '. Tel aan beide kanten ' + (-b) + ' op, dan is die weg.',
      F(d - b, d + b, b > 0 ? 'Je telde ' + b + ' op. Links staat + ' + b + ': die haal je aan beide kanten weg.' : 'Je trok ' + (-b) + ' af. Links staat ' + MIN + ' ' + (-b) + ': daar tel je ' + (-b) + ' bij op.')));
    st.push(S(E([[e, 'x']]) + ' = ' + T(d - b) + '. Deel door ' + e + ': x = ' + T(d - b) + ' : ' + e + ' =', eqAnt(x),
      (d - b < 0 ? 'Een min-getal gedeeld door een plus-getal geeft een min-getal. ' : '') + T(d - b) + ' : ' + e + '.', F(x, -x, 'Let op het teken.', d - b, 'Dat is ' + e + 'x. Deel nog door ' + e + '.')));
    return { stappen:st, beeld:function(n){ return schema(rij, Math.min(n, rij.length - 1)); } };
  }
  /* terugrekenen: een pijlenketting met twee of drie bewerkingen */
  function opS(o){ return o.s + ' ' + (o.n < 0 ? '(' + T(o.n) + ')' : T(o.n)); }
  function inv(o){ return { s:{ '+':MIN, '−':'+', '×':':', ':':X }[o.s], n:o.n }; }
  function doe(v, o){ return o.s === '+' ? v + o.n : o.s === MIN ? v - o.n : o.s === X ? v * o.n : v / o.n; }
  function plusOp(n){ return n < 0 ? { s:MIN, n:-n } : { s:'+', n:n }; }
  function terugVgl(R, vorm){
    var a, b, c, x, ops, links;
    for (var p = 0; p < 200; p++){
      if (vorm === 'hk'){ a = R.kies([2, 3, 4, 5, -2, -3]); b = nz(R, -7, 7); c = nz(R, -15, 15); x = nz(R, -9, 9); ops = [plusOp(b), { s:X, n:a }, plusOp(c)];
        links = (a < 0 ? MIN + (-a) : a) + '(x ' + (b < 0 ? MIN + ' ' + (-b) : '+ ' + b) + ')' + (c < 0 ? ' ' + MIN + ' ' + (-c) : ' + ' + c); }
      else if (vorm === 'dl'){ a = R.kies([2, 3, 4, 5, 6]); b = nz(R, -9, 9); var m = nz(R, -6, 6); x = m * a - b; c = nz(R, -12, 12); ops = [plusOp(b), { s:':', n:a }, plusOp(c)];
        links = '(x ' + (b < 0 ? MIN + ' ' + (-b) : '+ ' + b) + ') : ' + a + (c < 0 ? ' ' + MIN + ' ' + (-c) : ' + ' + c); }
      else { a = R.kies([-2, -3, -4, -5, -6, -7]); c = nz(R, -20, 20); x = nz(R, -9, 9); ops = [{ s:X, n:a }, plusOp(c)]; links = E([[a, 'x'], [c, '']]); }
      var w = [x]; ops.forEach(function(o){ w.push(doe(w[w.length - 1], o)); });
      if (x !== 0 && Math.abs(w[w.length - 1]) <= 60 && w.every(function(t){ return Math.round(t) === t; })) break;
    }
    return { x:x, ops:ops, w:w, vgl:links + ' = ' + T(w[w.length - 1]) };
  }
  function mTerug(R, v){
    var ops = v.ops, k = ops.length, w = v.w, st = [], last = ops[k - 1], andere = ops.slice(0, k - 1).map(opS).concat([opS(inv(last))]);
    st.push(K(R, 'Welke bewerking gebeurt als laatste met x?', opS(last), andere, 'Volg x: eerst ' + ops.map(opS).join(', dan ') + '. Terugrekenen begin je bij de laatste.'));
    for (var i = k - 1; i >= 0; i--){
      var o = ops[i], io = inv(o), van = w[i + 1], naar = w[i], fout = F(naar, doe(van, o), 'Je deed ' + opS(o) + '. Terug doe je het omgekeerde: ' + opS(io) + '.');
      st.push(S((i === k - 1 ? 'Begin bij ' + T(van) + '. Het omgekeerde van ' + opS(o) + ' is ' + opS(io) + ': ' : 'Het omgekeerde van ' + opS(o) + ' is ' + opS(io) + ': ') + paren(van) + ' ' + opS(io) + ' =', i === 0 ? eqAnt(naar) : naar,
        T(van) + ' ' + opS(io) + '.' + ((io.s === ':' || io.s === X) && io.n < 0 ? ' Keer of delen door een min-getal draait het teken om.' : ''), fout));
    }
    return { stappen:st, beeld:function(n){
      var vak = w.map(function(t, i){ return i === w.length - 1 ? T(t) : i === 0 ? (n >= k + 1 ? 'x = ' + T(t) : 'x') : (n >= k + 1 - i ? T(t) : '?'); });
      return ketting(vak, ops.map(opS), ops.map(function(o){ return opS(inv(o)); }), Math.max(0, n - 1)); } };
  }
  /* eerst haakjes: p(x + q) = r·x + s */
  function hkVgl(R){
    var p, q, r, s, x, e;
    do { p = R.kies([-4, -3, -2, 2, 3, 4, 5, 6]); q = nz(R, -6, 6); r = R.heel(-4, 6); x = nz(R, -8, 8); e = p - r; s = p * (x + q) - r * x; } while (!r || !e || Math.abs(e) > 8 || Math.abs(s) > 50);
    return { p:p, q:q, r:r, s:s, x:x, e:e, links:(p < 0 ? MIN + (-p) : p) + '(x ' + (q < 0 ? MIN + ' ' + (-q) : '+ ' + q) + ')', vgl:(p < 0 ? MIN + (-p) : p) + '(x ' + (q < 0 ? MIN + ' ' + (-q) : '+ ' + q) + ') = ' + E([[r, 'x'], [s, '']]) };
  }
  function mHaakjes(R, v){
    var p = v.p, q = v.q, r = v.r, s = v.s, x = v.x, e = v.e, pq = p * q, uit = E([[p, 'x'], [pq, '']]);
    var rij = [[v.vgl, 'haakjes weg'], [uit + ' = ' + E([[r, 'x'], [s, '']]), bew(r, 'x')], [E([[e, 'x'], [pq, '']]) + ' = ' + T(s), bew(pq)], [E([[e, 'x']]) + ' = ' + T(s - pq), ': ' + paren(e)], ['x = ' + T(x), '']];
    return { stappen:[
        SC('Werk eerst de haakjes weg: ' + v.links + ' =', uit, exprC(uit, { kaal:true }), T(p) + ' ' + X + ' x en ' + T(p) + ' ' + X + ' ' + paren(q) + ' = ' + T(pq) + '.',
          F(uit, E([[p, 'x'], [q, '']]), 'Ook de ' + T(q) + ' gaat keer ' + T(p) + '.', E([[p, 'x'], [-pq, '']]), 'Let op het teken: ' + T(p) + ' ' + X + ' ' + paren(q) + ' = ' + T(pq) + '.')),
        S('Nu staat er ' + uit + ' = ' + E([[r, 'x'], [s, '']]) + '. ' + weg(r, 'x').charAt(0).toUpperCase() + weg(r, 'x').slice(1) + '. Hoeveel x blijft er links? ' + T(p) + ' ' + (r > 0 ? MIN : '+') + ' ' + T(Math.abs(r)) + ' =', e,
          r > 0 ? T(p) + ' min ' + r + '.' : T(p) + ' plus ' + (-r) + '.', F(e, p + r, 'Je ging de verkeerde kant op. Je haalt ' + E([[r, 'x']]) + ' weg aan beide kanten.')),
        S(weg(pq).charAt(0).toUpperCase() + weg(pq).slice(1) + ': ' + E([[e, 'x']]) + ' = ' + T(s) + ' ' + (pq > 0 ? MIN : '+') + ' ' + T(Math.abs(pq)) + ' =', s - pq, T(s) + (pq > 0 ? ' min ' : ' plus ') + T(Math.abs(pq)) + '.', F(s - pq, s + pq, 'Andersom: je haalt ' + T(pq) + ' aan beide kanten weg.')),
        S('Deel door ' + paren(e) + ': x = ' + T(s - pq) + ' : ' + paren(e) + ' =', eqAnt(x), (e < 0 ? 'Delen door een min-getal draait het teken om. ' : '') + T(s - pq) + ' : ' + paren(e) + '.', F(x, -x, 'Let op het teken.')) ],
      beeld:function(n){ return schema(rij, Math.min(n, rij.length - 1)); } };
  }

  /* ================= ongelijkheden ================= */
  function ongVgl(R, negatief){
    var x0, e, c, a, b, d, t = R.kies(['<', '>', '≤', '≥']);
    do { x0 = nz(R, -8, 8); e = R.kies([2, 3, 4, 5, 6]) * (negatief ? -1 : 1); c = R.kies([0, 0, nz(R, -4, 4)]); a = c + e; b = nz(R, -12, 12); d = a * x0 + b - c * x0; } while (a === 0 || Math.abs(d) > 40);
    return { x0:x0, e:e, c:c, a:a, b:b, d:d, t:t, eind:negatief ? keerOm(t) : t, ong:E([[a, 'x'], [b, '']]) + ' ' + t + ' ' + (c ? E([[c, 'x'], [d, '']]) : T(d)) };
  }
  function mOng(R, v, negatief){
    var st = [], e = v.e, rij = [[v.ong, '']];
    if (v.c){
      rij[0][1] = bew(v.c, 'x'); rij.push([E([[e, 'x'], [v.b, '']]) + ' ' + v.t + ' ' + T(v.d), '']);
      st.push(S('Haal de x weg aan de rechterkant: ' + weg(v.c, 'x') + '. Hoeveel x blijft er links? ' + T(v.a) + ' ' + (v.c > 0 ? MIN : '+') + ' ' + T(Math.abs(v.c)) + ' =', e, T(v.a) + (v.c > 0 ? ' min ' : ' plus ') + T(Math.abs(v.c)) + '.', F(e, v.a + v.c, 'Je ging de verkeerde kant op.')));
    }
    rij[rij.length - 1][1] = bew(v.b);
    rij.push([E([[e, 'x']]) + ' ' + v.t + ' ' + T(v.d - v.b), ': ' + paren(e)]);
    rij.push(['x ' + v.eind + ' ' + T(v.x0), '']);
    st.push(S(weg(v.b).charAt(0).toUpperCase() + weg(v.b).slice(1) + ': ' + E([[e, 'x']]) + ' ' + v.t + ' ' + T(v.d) + ' ' + (v.b > 0 ? MIN : '+') + ' ' + T(Math.abs(v.b)) + ' =', v.d - v.b, T(v.d) + (v.b > 0 ? ' min ' : ' plus ') + T(Math.abs(v.b)) + '. Het teken ' + v.t + ' blijft gewoon staan.', F(v.d - v.b, v.d + v.b, 'Andersom: je haalt ' + T(v.b) + ' aan beide kanten weg.')));
    if (negatief) st.push(K(R, 'Je deelt door ' + T(e) + ', een negatief getal. Wat gebeurt er met het teken ' + v.t.replace('<', '&lt;').replace('>', '&gt;') + '?', 'het teken klapt om: ' + v.t + ' wordt ' + v.eind, ['het teken blijft ' + v.t], 'Delen door een negatief getal draait de volgorde om. Dan klapt het teken om.'));
    var ant = 'x ' + v.eind + ' ' + T(v.x0);
    st.push(SC((negatief ? 'Deel door ' + T(e) + ' en klap het teken om. ' : 'Deel door ' + e + '. Het teken blijft staan, want ' + e + ' is positief. ') + 'De oplossing:', ant, ongC(v.eind, v.x0),
      T(v.d - v.b) + ' : ' + paren(e) + ' = ' + T(v.x0) + '. Typ bijvoorbeeld x ' + v.eind + ' ' + T(v.x0) + (/[≤≥]/.test(v.eind) ? ' (≤ mag je typen als <=, ≥ als >=).' : '.'),
      F(ant, 'x ' + v.t + ' ' + T(v.x0), negatief ? 'Je vergat het teken om te klappen. Je deelde door een negatief getal.' : 'Goed getal, maar kijk nog eens naar het teken.', 'x ' + v.eind + ' ' + T(-v.x0), 'Let op het minteken van het getal.')));
    st.forEach(function(x){ x.tekst = esc(x.tekst); });
    return { stappen:st, ant:ant, beeld:function(n){ return stapel(schema(rij, Math.min(n, rij.length - 1)), n >= st.length ? ongLijn(v.x0, v.eind) : ''); } };
  }

  /* ================= haakjes en merkwaardige producten ================= */
  function mKwadraat(R, k, p){
    var a = E([[k, 'x']]), res = E([[k * k, 'x²'], [2 * k * p, 'x'], [p * p, '']]);
    return { vraag:'(' + lin(k, p) + ')²', res:res, stappen:[
        SC('Het kwadraat van de eerste term: ' + (k === 1 ? 'x · x' : '(' + a + ')²') + ' =', E([[k * k, 'x²']]), exprC(E([[k * k, 'x²']])), k === 1 ? 'x keer x is x². Typ x² als x^2.' : '(' + a + ')² = ' + a + ' ' + X + ' ' + a + ': ' + k + ' ' + X + ' ' + k + ' = ' + (k * k) + ' en x ' + X + ' x = x².', k > 1 ? F(E([[k * k, 'x²']]), E([[k, 'x²']]), 'Ook het getal ' + k + ' gaat in het kwadraat: ' + k + ' ' + X + ' ' + k + ' = ' + (k * k) + '.') : null),
        SC('Twee keer het product: 2 ' + X + ' ' + a + ' ' + X + ' ' + paren(p) + ' =', E([[2 * k * p, 'x']]), exprC(E([[2 * k * p, 'x']])), '2 ' + X + ' ' + (k === 1 ? '' : k + ' ' + X + ' ') + paren(p) + ' = ' + T(2 * k * p) + '. De x blijft staan.', F(E([[2 * k * p, 'x']]), E([[k * p, 'x']]), 'Vergeet de 2 niet: het is twee keer het product.', E([[-2 * k * p, 'x']]), 'Let op het teken.')),
        S('Het kwadraat van de tweede term: ' + paren(p) + '² =', p * p, paren(p) + ' ' + X + ' ' + paren(p) + '.', F(p * p, -p * p, 'Een kwadraat is nooit negatief: min keer min is plus.', 2 * Math.abs(p), 'Kwadraat is keer zichzelf, niet keer 2.')),
        SC('Samen: (' + lin(k, p) + ')² =', res, exprC(res, { kaal:true }), 'Zet de drie stukken achter elkaar: ' + res + '.', F(res, E([[k * k, 'x²'], [p * p, '']]), 'Je vergat de middelste term, twee keer het product.')) ],
      beeld:function(n){ return hokjes([a, teken(p)], [a, teken(p)], [[E([[k * k, 'x²']]), E([[k * p, 'x']])], [E([[k * p, 'x']]), T(p * p)]], n, [[1, 2], [2, 3]]); } };
  }
  function mVerschil(R, k, p, eerstMin, metVorm){
    var a = E([[k, 'x']]), res = E([[k * k, 'x²'], [-p * p, '']]), st = [];
    var vraag = eerstMin ? '(' + lin(k, -p) + ')(' + lin(k, p) + ')' : '(' + lin(k, p) + ')(' + lin(k, -p) + ')';
    if (metVorm) st.push(K(R, 'Welke vorm heeft ' + vraag + '?', '(a + b)(a − b)', ['(a + b)²', '(a − b)²'], 'Twee keer dezelfde termen, één keer met plus en één keer met min.'));
    st.push(SC('a² = ' + (k === 1 ? 'x · x' : '(' + a + ')²') + ' =', E([[k * k, 'x²']]), exprC(E([[k * k, 'x²']])), k === 1 ? 'x keer x is x². Typ x² als x^2.' : k + ' ' + X + ' ' + k + ' = ' + (k * k) + ' en x ' + X + ' x = x².', k > 1 ? F(E([[k * k, 'x²']]), E([[k, 'x²']]), 'Ook het getal gaat in het kwadraat.') : null));
    st.push(S('b² = ' + p + '² =', p * p, p + ' ' + X + ' ' + p + '.'));
    st.push(SC('(a + b)(a − b) = a² − b², dus ' + vraag + ' =', res, exprC(res, { kaal:true }), 'De middelste termen ' + E([[k * p, 'x']]) + ' en ' + E([[-k * p, 'x']]) + ' vallen tegen elkaar weg. Er blijft ' + res + ' over.',
      F(res, E([[k * k, 'x²'], [p * p, '']]), 'Het is min b²: ' + T(p) + ' ' + X + ' ' + MIN + T(p) + ' = ' + MIN + T(p * p) + '.')));
    return { vraag:vraag, res:res, stappen:st, beeld:function(n){ var o = metVorm ? 1 : 0; return hokjes([a, eerstMin ? '+' + p : MIN + p], [a, eerstMin ? MIN + p : '+' + p], [[E([[k * k, 'x²']]), E([[eerstMin ? k * p : -k * p, 'x']])], [E([[eerstMin ? -k * p : k * p, 'x']]), T(-p * p)]], n, [[1 + o, 3 + o], [3 + o, 2 + o]]); } };
  }
  /* (a·x + p)(x + q), vier keer vermenigvuldigen */
  function mTwee(R, a, p, q, kort){
    var ax = E([[a, 'x']]), res = E([[a, 'x²'], [a * q + p, 'x'], [p * q, '']]), vraag = '(' + lin(a, p) + ')(' + lin(1, q) + ')', st;
    if (!kort) st = [
      SC('Eerste keer eerste: ' + ax + ' ' + X + ' x =', E([[a, 'x²']]), exprC(E([[a, 'x²']])), 'x keer x is x². Typ x² als x^2.', F(E([[a, 'x²']]), E([[2 * a, 'x']]), 'x ' + X + ' x is x², niet 2x.')),
      SC(ax + ' ' + X + ' ' + paren(q) + ' =', E([[a * q, 'x']]), exprC(E([[a * q, 'x']])), (a === 1 ? 'x keer ' + paren(q) + ' schrijf je als ' + E([[q, 'x']]) + '.' : T(a) + ' ' + X + ' ' + paren(q) + ' = ' + T(a * q) + '. De x blijft staan.')),
      SC(paren(p) + ' ' + X + ' x =', E([[p, 'x']]), exprC(E([[p, 'x']])), 'De tweede term van de eerste haakjes, ' + T(p) + ', keer x.'),
      S(paren(p) + ' ' + X + ' ' + paren(q) + ' =', p * q, (p * q < 0 ? 'Eén min: het antwoord is negatief. ' : p < 0 && q < 0 ? 'Min keer min is plus. ' : '') + T(p) + ' ' + X + ' ' + T(q) + '.', F(p * q, -p * q, 'Let op het teken.')),
      SC('Samen, met de x-termen samengenomen:', res, exprC(res, { kaal:true }), E([[a * q, 'x']]) + ' en ' + E([[p, 'x']]) + ' samen is ' + E([[a * q + p, 'x']]) + '. Dus ' + res + '.', F(res, E([[a, 'x²'], [p * q, '']]), 'Je vergat de twee middelste producten.')) ];
    else st = [
      SC('x ' + X + ' x =', 'x²', exprC('x²'), 'x keer x is x². Typ x² als x^2.', F('x²', '2x', 'x ' + X + ' x is x², niet 2x.')),
      SC('De twee middelste samen: x ' + X + ' ' + paren(q) + ' + ' + paren(p) + ' ' + X + ' x =', E([[q + p, 'x']]), exprC(E([[q + p, 'x']])), E([[q, 'x']]) + ' en ' + E([[p, 'x']]) + ': samen ' + E([[q + p, 'x']]) + '.'),
      S(paren(p) + ' ' + X + ' ' + paren(q) + ' =', p * q, T(p) + ' ' + X + ' ' + T(q) + '.', F(p * q, -p * q, 'Let op het teken.')),
      SC('Samen:', res, exprC(res, { kaal:true }), 'x² en dan de x-term en het getal: ' + res + '.') ];
    return { vraag:vraag, res:res, stappen:st, beeld:function(n){ return hokjes(['x', teken(q)], [ax, teken(p)], [[E([[a, 'x²']]), E([[a * q, 'x']])], [E([[p, 'x']]), T(p * q)]], n, kort ? [[1, 2], [2, 3]] : [[1, 2], [3, 4]]); } };
  }

  /* ================= ontbinden ================= */
  function buitenGetallen(R){ var k, m, n; do { k = R.heel(2, 6); m = R.heel(1, 5); n = nz(R, -9, 9); } while (ggd(m, n) !== 1 || Math.abs(k * n) > 60); return { k:k, m:m, n:n }; }
  function mBuiten(R, k, m, n, kort){
    var expr = E([[k * m, 'x²'], [k * n, 'x']]), f = E([[k, 'x']]), binnen = lin(m, n), ant = (k === 1 ? '' : k) + 'x(' + binnen + ')', ctrl = factorC(expr, { voor:f, groepen:1 }), st = [];
    if (k > 1){
      var kl = []; for (var d = 2; d < k; d++) if (k % d === 0) kl.push(d, 'Dat past in allebei, maar er past een groter getal in.');
      st.push(S('Welk getal past in ' + (k * m) + ' en in ' + Math.abs(k * n) + '? Neem het grootste.', k, 'Zoek de grootste tafel waar ' + (k * m) + ' en ' + Math.abs(k * n) + ' allebei in staan.', F.apply(null, [k].concat(kl))));
    }
    if (!kort) st.push(K(R, 'Welke letter kun je ook buiten haakjes halen?', 'x', ['x²', 'geen letter'], 'In ' + E([[k * m, 'x²']]) + ' zit x ' + X + ' x, en in ' + E([[k * n, 'x']]) + ' zit één x. Eén x zit in allebei.'));
    st.push(SC(E([[k * m, 'x²']]) + ' : ' + f + ' =', E([[m, 'x']]), exprC(E([[m, 'x']])), (k * m) + ' : ' + k + ' = ' + m + ', en x² : x = x.'));
    st.push(S(E([[k * n, 'x']]) + ' : ' + f + ' =', n, T(k * n) + ' : ' + k + ' = ' + T(n) + ', en de x valt weg.', F(n, -n, 'Let op het teken.')));
    st.push(SC('Samen: ' + expr + ' =', ant, ctrl, 'Voor de haakjes ' + f + ', binnen de haakjes wat overblijft: ' + ant + '.'));
    return { vraag:expr, ant:ant, ctrl:ctrl, stappen:st };
  }
  function somProdGetallen(R){ var p, q; do { p = nz(R, -9, 9); q = nz(R, -9, 9); } while (p + q === 0 || p === q || Math.abs(p * q) > 40); return { p:p, q:q }; }
  /* de zoektabel: alle paren met dit product die de goede tekens kunnen hebben */
  function zoekTabel(c, b, p, n){
    var rij = [['getal 1', 'getal 2', 'som']], nad = [], a = Math.abs(c);
    for (var d = 1; d * d <= a; d++){
      if (a % d) continue;
      var e = a / d, paren2 = c > 0 ? (b > 0 ? [[d, e]] : [[-d, -e]]) : [[d, -e], [-d, e]];
      paren2.forEach(function(x){ rij.push([T(x[0]), T(x[1]), T(x[0] + x[1])]); if (x[0] + x[1] === b) nad.push([rij.length - 1, 0], [rij.length - 1, 1], [rij.length - 1, 2]); });
    }
    return n >= 2 ? R0.teken.tabel(rij, { kop:true, nadruk:n >= 3 ? nad : [] }) : '';
  }
  function mSomProd(R, p, q, kort){
    var b = p + q, c = p * q, expr = E([[1, 'x²'], [b, 'x'], [c, '']]), ant = '(' + lin(1, p) + ')(' + lin(1, q) + ')', ctrl = factorC(expr, { voor:'1', groepen:2 }), st = [];
    if (!kort) st.push(S('Het product van de twee getallen moet het losse getal zijn:', c, 'Het getal zonder x in ' + expr + '.'));
    st.push(S('De som van de twee getallen moet het getal voor de x zijn:', b, 'Het getal voor de x in ' + expr + ', met het teken ervoor.', F(b, -b, 'Neem het teken mee.')));
    st.push(SC('Welke twee getallen hebben product ' + T(c) + ' en som ' + T(b) + '? Typ ze met een puntkomma ertussen, zoals 3; ' + MIN + '5.', T(p) + '; ' + T(q), paarC(p, q),
      (c < 0 ? 'Het product is negatief: één getal is negatief. ' : b < 0 ? 'Product positief en som negatief: allebei negatief. ' : 'Product en som positief: allebei positief. ') + 'Zoek in de tabel de rij met som ' + T(b) + '.'));
    st.push(SC('Dus ' + expr + ' =', ant, ctrl, 'Zet elk getal bij een x tussen haakjes: ' + ant + '.', F(ant, '(' + lin(1, -p) + ')(' + lin(1, -q) + ')', 'De tekens zijn omgedraaid. Controleer: het product moet ' + T(c) + ' zijn en de som ' + T(b) + '.')));
    return { vraag:expr, ant:ant, ctrl:ctrl, stappen:st, beeld:function(n){ return zoekTabel(c, b, p, kort ? n + 1 : n); } };
  }
  function mVerschilOnt(R, k, p){
    var expr = E([[k * k, 'x²'], [-p * p, '']]), a = E([[k, 'x']]), ant = '(' + lin(k, p) + ')(' + lin(k, -p) + ')', ctrl = factorC(expr, { voor:'1', groepen:2 });
    return { vraag:expr, ant:ant, ctrl:ctrl, stappen:[
        SC(E([[k * k, 'x²']]) + ' is het kwadraat van', a, exprC(a), k === 1 ? 'x ' + X + ' x = x².' : k + ' ' + X + ' ' + k + ' = ' + (k * k) + ', dus (' + a + ')² = ' + E([[k * k, 'x²']]) + '.', F(a, E([[k * k, 'x']]), 'Neem ook van het getal de wortel: √' + (k * k) + ' = ' + k + '.')),
        S((p * p) + ' is het kwadraat van', p, 'Welk getal keer zichzelf is ' + (p * p) + '?', F(p, p * p / 2, 'Je deelde door 2. Zoek het getal dat keer zichzelf ' + (p * p) + ' is.')),
        SC('a² − b² = (a + b)(a − b), dus ' + expr + ' =', ant, ctrl, '(' + a + ' + ' + p + ')(' + a + ' ' + MIN + ' ' + p + ').', F(ant, '(' + lin(k, -p) + ')²', 'Dat geeft een middelste term. Neem één keer plus en één keer min.')) ] };
  }

  /* ================= kwadratische vergelijkingen ================= */
  function mWortel(R, soort){
    var r, q, a, c, d, st = [], vgl, opl, exact = true;
    if (soort === 'geen'){ c = R.heel(5, 20); q = -R.heel(1, 9) * R.kies([1, 4]); d = c + q; vgl = 'x² + ' + c + ' = ' + T(d);
      st.push(S('Maak x² vrij: ' + (d < 0 ? 'x² = ' + T(d) + ' ' + MIN + ' ' + c : 'x² = ' + T(d) + ' ' + MIN + ' ' + c) + ' =', q, 'Trek aan beide kanten ' + c + ' af.'));
      st.push(K(R, 'x² = ' + T(q) + '. Kan een kwadraat negatief zijn?', 'nee, dus er is geen oplossing', ['ja, er zijn twee oplossingen'], 'Een getal keer zichzelf is nooit negatief: min keer min is ook plus.'));
      st.push(SC('De oplossing:', 'geen oplossing', oplC([]), 'Een kwadraat kan niet negatief zijn. Typ: geen oplossing.'));
      return { vraag:vgl, stappen:st, ant:'geen oplossing', ctrl:oplC([]) };
    }
    if (soort === 'scheef'){ do { q = R.heel(2, 99); } while (Math.round(Math.sqrt(q)) * Math.round(Math.sqrt(q)) === q); r = rnd(Math.sqrt(q), 2); exact = false; vgl = 'x² = ' + q; }
    else {
      r = R.heel(1, 12); q = r * r;
      if (soort === 'kaal') vgl = 'x² = ' + q;
      else if (soort === 'keer'){ a = R.heel(2, 5); vgl = a + 'x² = ' + (a * q); st.push(S('Maak x² vrij: deel door ' + a + '. x² = ' + (a * q) + ' : ' + a + ' =', q, (a * q) + ' gedeeld door ' + a + '.')); }
      else { c = nz(R, -20, 20); d = q + c; vgl = 'x² ' + (c < 0 ? MIN + ' ' + (-c) : '+ ' + c) + ' = ' + T(d); st.push(S('Maak x² vrij: ' + weg(c) + '. x² = ' + T(d) + ' ' + (c > 0 ? MIN : '+') + ' ' + Math.abs(c) + ' =', q, T(d) + (c > 0 ? ' min ' : ' plus ') + Math.abs(c) + '.', F(q, d + c, 'Andersom: je haalt ' + T(c) + ' aan beide kanten weg.'))); }
    }
    st.push(S('√' + q + (exact ? ' =' : ' ≈ (rond af op 2 decimalen)'), exact ? r : uniek([T(r, { dec:2, vast:true }), T(r)]), exact ? 'Welk getal keer zichzelf is ' + q + '?' : 'Gebruik de wortelknop: √' + q + ' = ' + T(Math.sqrt(q), { dec:5 }) + '… Kijk naar het derde cijfer na de komma om af te ronden.'));
    opl = [r, -r];
    var ant = exact ? 'x = ' + T(r) + ' of x = ' + T(-r) : 'x ≈ ' + T(r, { dec:2, vast:true }) + ' of x ≈ ' + T(-r, { dec:2, vast:true });
    st.push(SC('x² = ' + q + ' heeft twee oplossingen:', ant, oplC(opl), 'Een positief en een negatief getal: ' + T(r) + ' ' + X + ' ' + T(r) + ' en ' + paren(-r) + ' ' + X + ' ' + paren(-r) + ' geven allebei ' + (exact ? q : 'ongeveer ' + q) + '. Typ bijvoorbeeld ' + ant + '.',
      F(ant, T(r), 'Er is nog een oplossing: het negatieve getal.', 'x = ' + T(r), 'Er is nog een oplossing: het negatieve getal.', 'x ≈ ' + T(r, { dec:2, vast:true }), 'Er is nog een oplossing: het negatieve getal.')));
    return { vraag:vgl, stappen:st, ant:ant, ctrl:oplC(opl) };
  }
  function mOntbindVgl(R, soort){
    var st = [], vgl, ant, opl;
    if (soort === 'buiten'){
      var b = nz(R, -12, 12), expr = E([[1, 'x²'], [b, 'x']]), f = 'x(' + lin(1, b) + ')';
      vgl = expr + ' = 0'; opl = [0, -b];
      st.push(SC('Haal x buiten haakjes: ' + expr + ' =', f, factorC(expr, { voor:'x', groepen:1 }), 'In allebei de termen zit een x: x ' + X + ' x en ' + T(b) + ' ' + X + ' x.'));
      st.push(S('x ' + X + ' (' + lin(1, b) + ') = 0, dus x = 0 of ' + lin(1, b) + ' = 0. De tweede oplossing: x =', eqAnt(-b), 'Wat moet x zijn om ' + lin(1, b) + ' nul te maken?', F(-b, b, 'Controleer: ' + T(b) + ' ' + (b > 0 ? '+' : MIN) + ' ' + Math.abs(b) + ' is geen 0.')));
    } else {
      var g = somProdGetallen(R), p = g.p, q = g.q, B = p + q, C = p * q, expr2 = E([[1, 'x²'], [B, 'x'], [C, '']]), fa = '(' + lin(1, p) + ')(' + lin(1, q) + ')';
      opl = [-p, -q];
      if (soort === 'verplaats'){
        var c2; do { c2 = nz(R, -12, 12); } while (c2 === C); var rechts = c2 - C; vgl = E([[1, 'x²'], [B, 'x'], [c2, '']]) + ' = ' + T(rechts);
        st.push(SC('Maak de rechterkant 0: ' + weg(rechts) + '. Wat staat er dan?', expr2 + ' = 0', nulC(expr2), weg(rechts).charAt(0).toUpperCase() + weg(rechts).slice(1) + ': ' + T(c2) + ' ' + (rechts > 0 ? MIN : '+') + ' ' + Math.abs(rechts) + ' = ' + T(C) + '. Typ de hele vergelijking, met = 0 erachter.'));
      } else vgl = expr2 + ' = 0';
      st.push(SC('Ontbind met de som-productmethode: ' + expr2 + ' =', fa, factorC(expr2, { voor:'1', groepen:2 }), 'Zoek twee getallen met product ' + T(C) + ' en som ' + T(B) + ': ' + T(p) + ' en ' + T(q) + '.'));
      st.push(S('Een product is 0 als een van de factoren 0 is. ' + lin(1, p) + ' = 0 geeft x =', eqAnt(-p), 'Wat moet x zijn om ' + lin(1, p) + ' nul te maken?', F(-p, p, 'Controleer: ' + T(p) + ' ' + (p > 0 ? '+' : MIN) + ' ' + Math.abs(p) + ' is geen 0. Neem het tegengestelde.')));
      st.push(S(lin(1, q) + ' = 0 geeft x =', eqAnt(-q), 'Wat moet x zijn om ' + lin(1, q) + ' nul te maken?', F(-q, q, 'Neem het tegengestelde getal.')));
    }
    ant = oplTekst(opl);
    st.push(SC('De oplossingen:', ant, oplC(opl), 'Zet ze achter elkaar: ' + ant + '.'));
    return { vraag:vgl, stappen:st, ant:ant, ctrl:oplC(opl) };
  }
  function abcGetallen(R, geen){
    var a, b, c, D;
    for (var p = 0; p < 300; p++){
      a = R.kies([1, 1, 2, 3, -1, -2]); b = nz(R, -9, 9); c = nz(R, -9, 9); D = b * b - 4 * a * c;
      if (geen ? D < 0 : (D > 0 && Math.round(Math.sqrt(D)) * Math.round(Math.sqrt(D)) !== D)) break;
    }
    return { a:a, b:b, c:c, D:D };
  }
  function vglAbc(g){ return E([[g.a, 'x²'], [g.b, 'x'], [g.c, '']]) + ' = 0'; }
  function mAbc(R, g, kort){
    var a = g.a, b = g.b, c = g.c, D = g.D, st = [];
    if (!kort) st.push(SC('Lees a, b en c af. Typ ze in deze volgorde met puntkomma\'s ertussen, zoals 2; ' + MIN + '3; 1.', T(a) + '; ' + T(b) + '; ' + T(c), rijC([a, b, c]),
      'a is het getal voor x², b het getal voor x en c het losse getal. Neem de mintekens mee.' + (a === 1 ? ' Staat er geen getal voor x², dan is a = 1.' : a === -1 ? ' Staat er alleen een min voor x², dan is a = ' + MIN + '1.' : '')));
    st.push(S('De discriminant: D = b² − 4ac = ' + paren(b) + '² ' + MIN + ' 4 ' + X + ' ' + paren(a) + ' ' + X + ' ' + paren(c) + ' =', D,
      'b² = ' + (b * b) + ' en 4ac = 4 ' + X + ' ' + paren(a) + ' ' + X + ' ' + paren(c) + ' = ' + T(4 * a * c) + '. Dan ' + (b * b) + ' ' + MIN + ' ' + paren(4 * a * c) + '.',
      F(D, b * b + 4 * a * c, 'Let op het teken van 4ac. Min een min-getal is plus.', -b * b - 4 * a * c, 'b² is altijd positief: ' + paren(b) + '² = ' + (b * b) + '.')));
    if (D < 0){
      st.push(K(R, 'D = ' + T(D) + ' is negatief. Hoeveel oplossingen zijn er?', 'geen', ['één', 'twee'], 'Uit een negatief getal kun je geen wortel trekken. Dan is er geen oplossing.'));
      st.push(SC('De oplossing:', 'geen oplossing', oplC([]), 'Typ: geen oplossing.'));
      return { stappen:st, ant:'geen oplossing', ctrl:oplC([]) };
    }
    var x1 = rnd((-b + Math.sqrt(D)) / (2 * a), 2), x2 = rnd((-b - Math.sqrt(D)) / (2 * a), 2), noem = paren(2 * a);
    st.push(S('x = (' + T(-b) + ' + √' + D + ') : ' + noem + ' ≈ (rond af op 2 decimalen)', uniek([T(x1, { dec:2, vast:true }), T(x1)]), 'Tik in: (' + T(-b) + ' + √' + D + ') : ' + noem + ' = ' + T((-b + Math.sqrt(D)) / (2 * a), { dec:5 }) + '… Zet haakjes om de teller.',
      F(T(x1, { dec:2, vast:true }), T(rnd((b + Math.sqrt(D)) / (2 * a), 2), { dec:2, vast:true }), 'Begin met min b: dat is ' + T(-b) + '.', T(rnd(-b + Math.sqrt(D) / (2 * a), 2), { dec:2, vast:true }), 'Zet haakjes om de hele teller voor je deelt.')));
    st.push(S('x = (' + T(-b) + ' ' + MIN + ' √' + D + ') : ' + noem + ' ≈', uniek([T(x2, { dec:2, vast:true }), T(x2)]), 'Tik in: (' + T(-b) + ' ' + MIN + ' √' + D + ') : ' + noem + ' = ' + T((-b - Math.sqrt(D)) / (2 * a), { dec:5 }) + '…'));
    var ant = 'x ≈ ' + T(x1, { dec:2, vast:true }) + ' of x ≈ ' + T(x2, { dec:2, vast:true });
    st.push(SC('De oplossingen:', ant, oplC([x1, x2]), 'Zet ze achter elkaar: ' + ant + '.'));
    return { stappen:st, ant:ant, ctrl:oplC([x1, x2]) };
  }

  /* ================= machten ================= */
  function mMacht(R, regel){
    var l = R.kies(['a', 'x', 'p', 'b']), p, q, c1, c2, e, c, vraag, st = [], namen = ['keer: de exponenten optellen', 'delen: de exponenten aftrekken', 'macht van een macht: de exponenten vermenigvuldigen'];
    function m(c, k){ return E([[c, l + sup(k)]]); }
    if (regel === 'keer'){ do { p = R.heel(2, 5); q = R.heel(1, 4); } while (p + q > 9); c1 = R.kies([1, 2, 3, 4, 5]); c2 = R.kies([1, 2, 3, 4, 5]); e = p + q; c = c1 * c2; vraag = m(c1, p) + ' · ' + m(c2, q); }
    else if (regel === 'deel'){ p = R.heel(4, 9); q = R.heel(1, p - 1); c2 = R.kies([1, 2, 3, 4]); c = R.kies([1, 2, 3, 5]); c1 = c * c2; e = p - q; vraag = m(c1, p) + ' : ' + m(c2, q); }
    else { do { p = R.heel(2, 4); q = R.heel(2, 3); } while (p * q > 9); c1 = R.kies([1, 1, 2, 3]); c = Math.pow(c1, q); e = p * q; vraag = '(' + m(c1, p) + ')' + sup(q); }
    var res = m(c, e), idx = { keer:0, deel:1, macht:2 }[regel], tek = ['+', MIN, X][idx];
    st.push(K(R, 'Welke rekenregel gebruik je?', namen[idx], namen.filter(function(x, i){ return i !== idx; }), regel === 'keer' ? 'Je vermenigvuldigt twee machten met hetzelfde grondtal.' : regel === 'deel' ? 'Je deelt twee machten met hetzelfde grondtal.' : 'Er staat een macht tussen haakjes, en daarbuiten weer een macht.'));
    st.push(S('De nieuwe exponent: ' + p + ' ' + tek + ' ' + q + ' =', e, regel === 'keer' ? l + sup(p) + ' · ' + l + sup(q) + ' is ' + p + ' + ' + q + ' keer een ' + l + '.' : regel === 'deel' ? 'Boven ' + p + ' keer een ' + l + ', onder ' + q + '. Er vallen er ' + q + ' weg.' : '(' + l + sup(p) + ')' + sup(q) + ' is ' + q + ' keer ' + l + sup(p) + ' met zichzelf vermenigvuldigd: ' + q + ' ' + X + ' ' + p + ' keer een ' + l + '.',
      regel === 'keer' ? F(e, p * q, 'Bij keer tel je de exponenten op, je vermenigvuldigt ze niet.') : regel === 'macht' ? F(e, p + q, 'Bij een macht van een macht vermenigvuldig je de exponenten.') : F(e, p + q, 'Bij delen trek je de exponenten af, je telt ze niet op.')));
    if (c !== 1 || c1 !== 1) st.push(S(regel === 'keer' ? 'Het getal: ' + c1 + ' ' + X + ' ' + c2 + ' =' : regel === 'deel' ? 'Het getal: ' + c1 + ' : ' + c2 + ' =' : 'Het getal: ' + c1 + sup(q) + ' =', c,
      regel === 'macht' ? 'Ook het getal gaat tot de macht ' + q + ': ' + keten(c1, q) + '.' : regel === 'keer' ? 'De getallen vermenigvuldig je gewoon.' : 'De getallen deel je gewoon.',
      regel === 'macht' ? F(c, c1 * q, 'Tot de macht ' + q + ' is ' + keten(c1, q) + ', niet ' + c1 + ' ' + X + ' ' + q + '.', c1, 'Ook het getal gaat tot de macht.') : null));
    st.push(SC('Samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'Getal en dan ' + l + ' met de nieuwe exponent: ' + res + '. Typ ' + l + sup(e) + ' als ' + l + '^' + e + '.'));
    return { vraag:vraag, res:res, stappen:st };
  }

  /* ================= formules omwerken ================= */
  var OMW = [
    { y:'y', x:'x', bLetter:'', ctx:'Maak x vrij.' },
    { y:'K', x:'a', bLetter:'', ctx:'K is de prijs in euro en a het aantal kaartjes. Maak a vrij.', pos:true },
    { y:'L', x:'t', bLetter:'', ctx:'L is de lengte van een plant in cm en t de tijd in weken. Maak t vrij.', pos:true, as:[2, 3, 4, 5], bs:[5, 8, 10, 12, 15] },
    { y:'O', x:'b', bLetter:'l', ctx:'O is de omtrek van een rechthoek, l de lengte en b de breedte. Maak b vrij.', vast:[2, 2] },
    { y:'W', x:'n', bLetter:'', ctx:'W is de winst in euro en n het aantal verkochte broodjes. Maak n vrij.', pos:true, min:true },
    { y:'y', x:'x', bLetter:'z', ctx:'Maak x vrij.' } ];
  function omwerk(R){
    var it = R.kies(OMW), a, b;
    if (it.vast){ a = it.vast[0]; b = it.vast[1]; }
    else if (it.pos){ a = R.kies(it.as || [2, 3, 4, 5, 8, 12, 15]); b = it.min ? -R.kies([10, 20, 25, 40, 50]) : R.kies(it.bs || [3, 5, 10, 20, 30, 40]); }
    else { a = R.kies([2, 3, 4, 5, -2, -3]); b = nz(R, -12, 12); }
    var bt = it.bLetter ? E([[b, it.bLetter]]) : T(b), rechts = E([[a, it.x], [b, it.bLetter]]);
    var lhs = it.y + ' ' + (b > 0 ? MIN + ' ' + bt : '+ ' + E([[-b, it.bLetter]])), verw = '(' + lhs + ') : ' + paren(a);
    var ant = it.x + ' = ' + verw, eindC = vrijC(it.x, '(' + lhs + ')/' + paren(a));
    return { vraag:it.y + ' = ' + rechts, ctx:it.ctx, ant:ant, ctrl:eindC, stappen:[
      K(R, 'Je wilt ' + it.x + ' alleen overhouden. Wat doe je eerst?', b > 0 ? 'aan beide kanten ' + bt + ' aftrekken' : 'aan beide kanten ' + E([[-b, it.bLetter]]) + ' optellen', ['aan beide kanten delen door ' + T(a), b > 0 ? 'aan beide kanten ' + bt + ' optellen' : 'aan beide kanten ' + E([[-b, it.bLetter]]) + ' aftrekken'],
        'Bij ' + it.x + ' gebeurt eerst ' + X + ' ' + paren(a) + ' en daarna ' + (b > 0 ? '+ ' + bt : MIN + ' ' + E([[-b, it.bLetter]])) + '. Terug begin je bij de laatste.'),
      SC('Er staat nu: … = ' + E([[a, it.x]]) + '. Wat staat er links?', lhs, exprC(lhs), 'Aan beide kanten ' + (b > 0 ? bt + ' eraf' : E([[-b, it.bLetter]]) + ' erbij') + ': links ' + lhs + '.', F(lhs, it.y + ' ' + (b > 0 ? '+ ' + bt : MIN + ' ' + E([[-b, it.bLetter]])), 'Andersom: je haalt ' + bt + ' aan beide kanten weg.')),
      SC('Deel aan beide kanten door ' + paren(a) + '. ' + it.x + ' =', ant, eindC, 'Zet haakjes om ' + lhs + ' en deel door ' + paren(a) + ': ' + ant + '.', F(ant, it.x + ' = ' + it.y + ' ' + (b > 0 ? MIN + ' ' + bt : '+ ' + E([[-b, it.bLetter]])) + ' : ' + paren(a), 'Zet haakjes om de hele linkerkant: alles moet door ' + paren(a) + ' gedeeld worden.')) ] };
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= herleiden (onderbouw) ================= */
    { groep:{ id:'wi-herleid', niveau:'onderbouw', domein:'algebra', naam:'Herleiden',
        uit:'Machten van negatieve getallen, termen vermenigvuldigen en twee haakjes wegwerken. Termen samennemen en één haakje wegwerken staan in de leerroute rekenen.' },
      doelen:[
        { id:'wi-neg-macht', naam:'Machten van negatieve getallen', kort:'Staat de min binnen de haakjes, dan doet hij mee: (−3)² = 9, maar −3² = −9',
          uit:'<p>Bij <b>(−3)²</b> staat de min binnen de haakjes. Je doet −3 keer zichzelf: (−3) × (−3) = <b>9</b>.</p><p>Bij <b>−3²</b> staan er geen haakjes. De macht hoort alleen bij de 3. Eerst 3² = 9, en dan de min ervoor: <b>−9</b>.</p><p>Tel de mintekens: een <b>even</b> aantal geeft plus, een <b>oneven</b> aantal geeft min. (−2)³ = (−2) × (−2) × (−2) = −8.</p>',
          wanneer:'er een macht staat bij een negatief getal, met of zonder haakjes.',
          maak:function(R){
            var e = R.kies([2, 2, 3, 4]), g = e === 2 ? R.heel(2, 12) : e === 3 ? R.heel(2, 5) : R.heel(2, 3), hk = R.heel(0, 2) > 0;
            var mg = Math.pow(g, e), uit = hk ? (e % 2 ? -mg : mg) : -mg, vr = hk ? '(' + MIN + g + ')' + sup(e) : MIN + g + sup(e), ja = 'ja, de min doet mee met de macht', nee = 'nee, eerst de macht en dan de min';
            return { vraag:vr + ' =', context:'Reken uit.', stappen:[
              K(R, 'Staat de min binnen de haakjes, samen met het getal?', hk ? ja : nee, [], hk ? 'De min staat binnen de haakjes, bij de ' + g + '. Hij doet mee met de macht.' : 'Er staan geen haakjes. De macht hoort alleen bij de ' + g + '.', { orde:[ja, nee] }),
              S('Reken eerst de macht zonder min uit: ' + g + sup(e) + ' =', mg, keten(g, e) + '.', F(mg, g * e, 'Een macht is keer zichzelf, niet keer ' + e + '.')),
              K(R, 'Wordt het antwoord positief of negatief?', uit > 0 ? 'positief' : 'negatief', [], hk ? 'Je vermenigvuldigt ' + e + ' min-getallen. ' + (e % 2 ? 'Een oneven aantal mintekens geeft min.' : 'Een even aantal mintekens geeft plus.') : 'De min staat buiten de macht: die komt er op het eind gewoon voor.', { orde:['positief', 'negatief'] }),
              S(vr + ' =', uit, hk ? keten('(' + MIN + g + ')', e) + ' = ' + T(uit) + '.' : 'Eerst ' + g + sup(e) + ' = ' + mg + ', dan de min ervoor.', F(uit, -uit, 'Let op het teken.')) ] };
          } },
        { id:'wi-herl-keer', naam:'Termen vermenigvuldigen', kort:'Getallen keer elkaar en letters keer elkaar: 3a · 4a = 12a²',
          uit:'<p>Bij <b>3a · 4a</b> doe je twee dingen. De <b>getallen</b> keer elkaar: 3 × 4 = 12. De <b>letters</b> keer elkaar: a · a = a². Samen <b>12a²</b>.</p><p>Let op het verschil met optellen: 3a + 4a = 7a, maar 3a · 4a = 12a².</p><p>Verschillende letters zet je achter elkaar: 2x · 5y = 10xy. En a² · a = a³, want dat is a · a · a.</p>',
          wanneer:'je twee termen met letters met elkaar vermenigvuldigt.',
          maak:function(R){
            var v = R.heel(0, 3), l = R.kies(['a', 'x', 'p', 'b']), c1 = R.heel(2, 7), c2 = R.heel(2, 7), l1 = l, l2 = l, lr = l + '²';
            if (v === 1){ var pr = R.kies([['a', 'b'], ['x', 'y'], ['p', 'q']]); l1 = pr[0]; l2 = pr[1]; lr = pr[0] + pr[1]; }
            else if (v === 2){ l1 = l + '²'; lr = l + '³'; }
            else if (v === 3){ if (R.heel(0, 1)) c1 = -c1; else c2 = -c2; if (R.heel(0, 3) === 0){ c1 = -Math.abs(c1); c2 = -Math.abs(c2); } }
            var A = E([[c1, l1]]), B = E([[c2, l2]]), c = c1 * c2, res = E([[c, lr]]);
            return { vraag:A + ' · ' + (c2 < 0 ? '(' + B + ')' : B), context:'Schrijf zo kort mogelijk. Typ ' + (v === 2 ? l + '³ als ' + l + '^3' : v === 1 ? 'het antwoord zonder keerteken' : l + '² als ' + l + '^2') + '.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:[
              S('De getallen: ' + T(c1) + ' ' + X + ' ' + paren(c2) + ' =', c, (c < 0 ? 'Eén min-getal: het antwoord is negatief. ' : c1 < 0 ? 'Min keer min is plus. ' : '') + Math.abs(c1) + ' ' + X + ' ' + Math.abs(c2) + ' = ' + Math.abs(c) + '.', F(c, c1 + c2, 'Je telde op. De getallen vermenigvuldig je.', -c, 'Let op het teken.')),
              SC('De letters: ' + l1 + ' · ' + l2 + ' =', lr, exprC(lr), v === 1 ? 'Verschillende letters zet je achter elkaar: ' + lr + '.' : v === 2 ? l + '² · ' + l + ' = ' + l + ' · ' + l + ' · ' + l + ' = ' + l + '³.' : l + ' · ' + l + ' = ' + l + '².', v === 1 ? null : F(lr, v === 2 ? l + '²' : '2' + l, v === 2 ? 'Tel de letters: drie keer een ' + l + '.' : l + ' · ' + l + ' is ' + l + '², niet 2' + l + '.', l, 'Er blijven meer letters over: ' + lr + '.')),
              SC('Samen: ' + A + ' · ' + (c2 < 0 ? '(' + B + ')' : B) + ' =', res, exprC(res, { kaal:true }), 'Het getal en dan de letters: ' + res + '.', F(res, E([[c1 + c2, l]]), 'Dat is optellen. Hier vermenigvuldig je.')) ] };
          } },
        { id:'wi-herl-twee', naam:'Twee haakjes wegwerken', kort:'Elke term uit de eerste haakjes keer elke term uit de tweede: vier keer vermenigvuldigen, dan samennemen',
          uit:'<p>Bij <b>(x + 3)(x + 5)</b> moet alles uit de eerste haakjes keer alles uit de tweede. Dat zijn <b>vier</b> vermenigvuldigingen. Een rooster helpt.</p><p>x · x = x², x · 5 = 5x, 3 · x = 3x en 3 · 5 = 15. Samen: x² + 5x + 3x + 15 = <b>x² + 8x + 15</b>.</p><p>Let op de tekens: (x − 2)(x + 6) = x² + 6x − 2x − 12 = x² + 4x − 12.</p>',
          wanneer:'er twee haakjes met elk twee termen naast elkaar staan.',
          beeld:R0.teken.rooster(['x', '+5'], ['x', '+3'], [['x²', '5x'], ['3x', '15']]),
          maak:function(R){
            var a = R.kies([1, 1, 1, 2, 3]), p, q;
            do { p = nz(R, -9, 9); q = nz(R, -9, 9); } while (a * q + p === 0 || (a === 1 && p === q));
            var m = mTwee(R, a, p, q, false);
            return { vraag:m.vraag, context:'Werk de haakjes weg en neem samen. Typ x² als x^2.', antwoord:m.res, controle:exprC(m.res, { kaal:true }), invoer:'tekst', beeld:m.beeld, zelfBeeld:'', stappen:m.stappen };
          } }
      ] },

    /* ================= vergelijkingen (onderbouw) ================= */
    { groep:{ id:'wi-vgl', niveau:'onderbouw', domein:'algebra', naam:'Vergelijkingen oplossen',
        uit:'Vergelijkingen met negatieve getallen, met x aan twee kanten en met haakjes. Je lost ze op met de balansmethode of door terug te rekenen. De eerste stappen met de balans staan in de leerroute rekenen.' },
      doelen:[
        { id:'wi-vgl-balans', naam:'De balansmethode', kort:'Haal eerst de x weg aan één kant, dan de losse getallen, en deel ten slotte door het getal voor x',
          uit:'<p>Bij de <b>balansmethode</b> doe je links en rechts steeds hetzelfde. Zo blijft de vergelijking kloppen.</p><p>5x − 7 = 2x + 8. Trek aan beide kanten 2x af: 3x − 7 = 8. Tel aan beide kanten 7 op: 3x = 15. Deel door 3: <b>x = 5</b>.</p><p>Staat er <b>min</b> 7? Dan tel je 7 op om hem weg te krijgen. Schrijf naast elke regel wat je aan beide kanten doet.</p>',
          wanneer:'x aan beide kanten staat, of als er negatieve getallen in de vergelijking staan.',
          beeld:R0.teken.tabel([['vergelijking', 'aan beide kanten'], ['5x − 7 = 2x + 8', '− 2x'], ['3x − 7 = 8', '+ 7'], ['3x = 15', ': 3'], ['x = 5', '']], { kop:true }),
          maak:function(R){
            var v = balansVgl(R, R.heel(0, 3) > 0), m = mBalans(R, v);
            return { vraag:v.vgl, context:'Los op met de balansmethode.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'wi-vgl-terug', naam:'Terugrekenen', kort:'Staat x er maar één keer in? Volg de bewerkingen en reken ze van achter naar voren terug, met het omgekeerde',
          uit:'<p>Bij 3(x − 4) + 5 = −7 gebeurt er van alles met x: eerst <b>− 4</b>, dan <b>× 3</b>, dan <b>+ 5</b>. Zet dat in een <b>pijlenketting</b>.</p><p>Reken <b>terug</b>, van achter naar voren, met het omgekeerde: −7 − 5 = −12, −12 : 3 = −4, −4 + 4 = 0. Dus <b>x = 0</b>.</p><p>Keer een negatief getal draai je om met delen door dat negatieve getal: −2x + 3 = 11 geeft 11 − 3 = 8 en 8 : (−2) = −4.</p>',
          wanneer:'x er maar één keer in staat, met een paar bewerkingen erachter.',
          maak:function(R){
            var v = terugVgl(R, R.kies(['hk', 'dl', 'neg'])), m = mTerug(R, v);
            return { vraag:v.vgl, context:'Los op door terug te rekenen.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'wi-vgl-haakjes', naam:'Eerst de haakjes wegwerken', kort:'Werk eerst de haakjes weg, en los daarna op met de balansmethode',
          uit:'<p>Bij 3(x − 2) = x + 8 staat x in de haakjes én aan de andere kant. Terugrekenen gaat dan niet.</p><p>Werk eerst de <b>haakjes</b> weg: 3x − 6 = x + 8. Nu staat er een gewone vergelijking.</p><p>Gebruik de <b>balans</b>: trek x af, 2x − 6 = 8. Tel 6 op, 2x = 14. Deel door 2: <b>x = 7</b>.</p>',
          wanneer:'er haakjes in de vergelijking staan en x ook aan de andere kant staat.',
          maak:function(R){
            var v = hkVgl(R), m = mHaakjes(R, v);
            return { vraag:v.vgl, context:'Werk de haakjes weg en los op.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'wi-vgl-kies', naam:'Kies de handigste manier', kort:'x aan twee kanten: balans. x één keer met bewerkingen: terugrekenen. Haakjes én x aan twee kanten: eerst de haakjes weg',
          uit:'<p>Kijk eerst goed naar de vergelijking en <b>kies</b> dan.</p><p>Staat x er <b>één keer</b> in, met bewerkingen eromheen zoals 2(x + 3) − 1 = 9? Dan is <b>terugrekenen</b> het snelst.</p><p>Staat x <b>aan beide kanten</b>? Gebruik de <b>balansmethode</b>. Staan er ook nog <b>haakjes</b>? Werk die <b>eerst</b> weg, en gebruik dan de balans.</p>',
          wanneer:'je een vergelijking snel en zonder fouten wilt oplossen.',
          maak:function(R){
            var s = R.heel(0, 2), m, vraag, juist, uitleg, opties = ['de balansmethode', 'terugrekenen', 'eerst de haakjes wegwerken, dan de balans'];
            if (s === 0){ var v = balansVgl(R, true); m = mBalans(R, v); vraag = v.vgl; juist = opties[0]; uitleg = 'x staat aan beide kanten en er zijn geen haakjes. Terugrekenen gaat niet: gebruik de balans.'; }
            else if (s === 1){ var w = terugVgl(R, R.kies(['hk', 'dl'])); m = mTerug(R, w); vraag = w.vgl; juist = opties[1]; uitleg = 'x staat er maar één keer in, met bewerkingen eromheen. Dan reken je terug.'; }
            else { var h = hkVgl(R); m = mHaakjes(R, h); vraag = h.vgl; juist = opties[2]; uitleg = 'x staat in de haakjes én aan de andere kant. Werk eerst de haakjes weg, dan kun je de balans gebruiken.'; }
            return { vraag:vraag, context:'Kies eerst de handigste manier. Los de vergelijking dan op.', beeld:function(n){ return n < 1 ? '' : m.beeld(n - 1); },
              stappen:[K(R, 'Welke manier is hier het handigst?', juist, opties, uitleg, { waarom:uitleg })].concat(m.stappen) };
          } }
      ] },

    /* ================= ongelijkheden (havo) ================= */
    { groep:{ id:'wi-ongel', niveau:'havo', domein:'algebra', naam:'Ongelijkheden',
        uit:'Een ongelijkheid los je op zoals een vergelijking, met de balans. Alleen bij delen door een negatief getal klapt het teken om. De oplossing is een heel stuk van de getallenlijn.' },
      doelen:[
        { id:'wi-ong-los', naam:'Een ongelijkheid oplossen', kort:'Los op met de balansmethode; het teken blijft staan zolang je door een positief getal deelt',
          uit:'<p>Een <b>ongelijkheid</b> heeft &lt;, &gt;, ≤ of ≥ in plaats van =. Je lost hem op met de <b>balans</b>, net als een vergelijking.</p><p>3x + 4 &lt; 19: trek 4 af, 3x &lt; 15. Deel door 3: <b>x &lt; 5</b>. Alle getallen kleiner dan 5 zijn een oplossing.</p><p>Op de getallenlijn: bij &lt; en &gt; een <b>open</b> rondje (5 doet niet mee), bij ≤ en ≥ een <b>dicht</b> rondje (5 doet wel mee).</p>',
          wanneer:'er geen = maar een ongelijkheidsteken staat, en het getal voor x positief blijft.',
          maak:function(R){
            var v = ongVgl(R, false), m = mOng(R, v, false);
            return { vraag:v.ong, context:'Los op. Schrijf je antwoord zoals x &lt; 3.', antwoord:m.ant, controle:ongC(v.eind, v.x0), invoer:'tekst', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'wi-ong-omklap', naam:'Delen door een negatief getal', kort:'Deel je door een negatief getal, dan klapt het teken om: < wordt >',
          uit:'<p>Bij −2x &lt; 6 deel je door <b>−2</b>, een negatief getal. Dan <b>klapt het teken om</b>: x &gt; −3.</p><p>Controleer met een getal: x = 0. Dan is −2 × 0 = 0, en 0 &lt; 6 klopt. En 0 &gt; −3 klopt ook. Had je het teken laten staan (x &lt; −3), dan zat 0 er niet bij.</p><p>Ook ≤ wordt ≥, en ≥ wordt ≤.</p>',
          wanneer:'er na het wegwerken een negatief getal voor x staat.',
          maak:function(R){
            var v = ongVgl(R, true), m = mOng(R, v, true);
            return { vraag:v.ong, context:'Los op. Schrijf je antwoord zoals x &gt; ' + MIN + '3.', antwoord:m.ant, controle:ongC(v.eind, v.x0), invoer:'tekst', beeld:m.beeld, stappen:m.stappen };
          } }
      ] },

    /* ================= merkwaardige producten (havo) ================= */
    { groep:{ id:'wi-merk', niveau:'havo', domein:'algebra', naam:'Merkwaardige producten',
        uit:'Drie vormen met twee haakjes komen zo vaak voor dat je ze uit je hoofd leert: (a + b)², (a − b)² en (a + b)(a − b). Daarmee werk je haakjes in één keer weg.' },
      doelen:[
        { id:'wi-merk-kwadraat', naam:'(a + b)² en (a − b)²', kort:'(a + b)² = a² + 2ab + b²: het kwadraat van de eerste, twee keer het product, het kwadraat van de tweede',
          uit:'<p>(x + 5)² betekent (x + 5)(x + 5). Dat werk je in één keer weg met de regel <b>(a + b)² = a² + 2ab + b²</b>.</p><p>a = x en b = 5: x² + 2 · x · 5 + 25 = <b>x² + 10x + 25</b>.</p><p>Met een min: (x − 3)² = x² − 6x + 9. De middelste term krijgt de min, het laatste kwadraat is altijd plus. De fout x² + 25 komt vaak voor: vergeet de <b>middelste term</b> niet.</p>',
          wanneer:'er een kwadraat van een som of verschil staat, zoals (x − 4)².',
          beeld:R0.teken.rooster(['x', '+5'], ['x', '+5'], [['x²', '5x'], ['5x', '25']]),
          maak:function(R){
            var k = R.kies([1, 1, 1, 2, 3]), p = k === 1 ? nz(R, -9, 9) : nz(R, -6, 6), m = mKwadraat(R, k, p);
            return { vraag:m.vraag, context:'Werk de haakjes weg met (a + b)² = a² + 2ab + b². Typ x² als x^2.', antwoord:m.res, controle:exprC(m.res, { kaal:true }), invoer:'tekst', beeld:m.beeld, zelfBeeld:'', stappen:m.stappen };
          } },
        { id:'wi-merk-verschil', naam:'(a + b)(a − b)', kort:'(a + b)(a − b) = a² − b²: de middelste termen vallen tegen elkaar weg',
          uit:'<p>Bij (x + 4)(x − 4) staan <b>dezelfde termen</b>, één keer met plus en één keer met min.</p><p>Werk je het uit, dan krijg je x² − 4x + 4x − 16. De middelste termen <b>vallen weg</b>. Er blijft over: <b>x² − 16</b>.</p><p>De regel: <b>(a + b)(a − b) = a² − b²</b>. Het kwadraat van de eerste min het kwadraat van de tweede.</p>',
          wanneer:'twee haakjes hetzelfde zijn op één teken na.',
          maak:function(R){
            var k = R.kies([1, 1, 2, 3]), p = k === 1 ? R.heel(1, 12) : R.heel(1, 7), m = mVerschil(R, k, p, R.heel(0, 1) === 1, true);
            return { vraag:m.vraag, context:'Werk de haakjes weg. Typ x² als x^2.', antwoord:m.res, controle:exprC(m.res, { kaal:true }), invoer:'tekst', beeld:m.beeld, zelfBeeld:'', stappen:m.stappen };
          } },
        { id:'wi-merk-kies', naam:'Kies de handigste manier', kort:'Herken je (a + b)², (a − b)² of (a + b)(a − b)? Gebruik de regel. Anders: vier keer vermenigvuldigen',
          uit:'<p>Kijk eerst naar de haakjes.</p><p><b>Twee keer hetzelfde</b>, zoals (x + 3)(x + 3) of (x + 3)²? Gebruik <b>(a + b)²</b> of <b>(a − b)²</b>.</p><p><b>Hetzelfde op één teken na</b>, zoals (x + 3)(x − 3)? Gebruik <b>(a + b)(a − b) = a² − b²</b>.</p><p>Zijn de getallen <b>verschillend</b>, zoals (x + 3)(x − 5)? Dan is het geen merkwaardig product: <b>vier keer vermenigvuldigen</b>.</p>',
          wanneer:'je twee haakjes snel wilt wegwerken.',
          maak:function(R){
            var s = R.heel(0, 3), p = R.heel(2, 9), m, juist, opties = ['(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²', '(a + b)(a − b) = a² − b²', 'geen merkwaardig product: vier keer vermenigvuldigen'], uitleg;
            if (s === 0){ m = mKwadraat(R, 1, p); juist = opties[0]; m.vraag = R.heel(0, 1) ? m.vraag : '(x + ' + p + ')(x + ' + p + ')'; uitleg = 'Twee keer hetzelfde met een plus: (a + b)².'; }
            else if (s === 1){ m = mKwadraat(R, 1, -p); juist = opties[1]; m.vraag = R.heel(0, 1) ? m.vraag : '(x ' + MIN + ' ' + p + ')(x ' + MIN + ' ' + p + ')'; uitleg = 'Twee keer hetzelfde met een min: (a − b)².'; }
            else if (s === 2){ m = mVerschil(R, 1, p, R.heel(0, 1) === 1, false); juist = opties[2]; uitleg = 'Dezelfde termen, één keer plus en één keer min: (a + b)(a − b).'; }
            else { var q; do { q = nz(R, -9, 9); } while (q === p || q === -p); var pp = R.heel(0, 1) ? p : -p; m = mTwee(R, 1, pp, q, true); juist = opties[3]; uitleg = 'De getallen ' + T(pp) + ' en ' + T(q) + ' zijn verschillend. Dan is het geen merkwaardig product.'; }
            return { vraag:m.vraag, context:'Kies eerst de handigste manier. Werk dan de haakjes weg. Typ x² als x^2.', antwoord:m.res, controle:exprC(m.res, { kaal:true }), invoer:'tekst', zelfBeeld:'',
              beeld:function(n){ return n < 1 ? '' : m.beeld(n - 1); }, stappen:[K(R, 'Welke manier is hier het handigst?', juist, opties, uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen) };
          } }
      ] },

    /* ================= ontbinden in factoren (havo) ================= */
    { groep:{ id:'wi-ontbind', niveau:'havo', domein:'algebra', naam:'Ontbinden in factoren',
        uit:'Ontbinden is haakjes wegwerken andersom: je schrijft een som als een product. Dat heb je nodig om kwadratische vergelijkingen op te lossen.' },
      doelen:[
        { id:'wi-ont-buiten', naam:'Buiten haakjes halen', kort:'Zoek de grootste factor die in alle termen zit, getal én letter, en zet die voor de haakjes',
          uit:'<p>Bij 6x² + 9x zoek je wat in <b>allebei</b> de termen zit. Het grootste getal dat in 6 en 9 past is <b>3</b>. En in x² en x zit allebei een <b>x</b>.</p><p>Zet <b>3x</b> voor de haakjes en deel elke term erdoor: 6x² : 3x = 2x en 9x : 3x = 3. Dus 6x² + 9x = <b>3x(2x + 3)</b>.</p><p>Controleer door de haakjes weer weg te werken.</p>',
          wanneer:'alle termen een getal of letter gemeen hebben, zoals bij 4x² − 10x.',
          maak:function(R){
            var g = buitenGetallen(R), m = mBuiten(R, g.k, g.m, g.n, false);
            return { vraag:m.vraag, context:'Ontbind: haal zoveel mogelijk buiten haakjes. Schrijf je antwoord zoals 3x(2x + 3).', antwoord:m.ant, controle:m.ctrl, invoer:'tekst', stappen:m.stappen };
          } },
        { id:'wi-ont-somprod', naam:'De som-productmethode', kort:'Bij x² + bx + c zoek je twee getallen met product c en som b; dan is het (x + ..)(x + ..)',
          uit:'<p>x² + 7x + 12 schrijf je als <b>(x + 3)(x + 4)</b>. Hoe vind je 3 en 4?</p><p>Je zoekt twee getallen met <b>product 12</b> (het losse getal) en <b>som 7</b> (het getal voor x). Zet de paren met product 12 in een tabel: 1 en 12, 2 en 6, 3 en 4. Alleen 3 + 4 = 7.</p><p>Let op de mintekens: bij x² − 2x − 15 zoek je product −15 en som −2. Dat zijn 3 en −5: (x + 3)(x − 5).</p>',
          wanneer:'er x², een x-term en een los getal staan, en voor x² staat geen getal.',
          maak:function(R){
            var g = somProdGetallen(R), m = mSomProd(R, g.p, g.q, false);
            return { vraag:m.vraag, context:'Ontbind met de som-productmethode. Schrijf je antwoord zoals (x + 3)(x ' + MIN + ' 5).', antwoord:m.ant, controle:m.ctrl, invoer:'tekst', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'wi-ont-verschil', naam:'Het verschil van twee kwadraten', kort:'a² − b² = (a + b)(a − b): neem van allebei de wortel',
          uit:'<p>x² − 49 is een kwadraat <b>min</b> een kwadraat. Daarvoor is er een snelle regel: <b>a² − b² = (a + b)(a − b)</b>.</p><p>x² is het kwadraat van x, en 49 is het kwadraat van 7. Dus x² − 49 = <b>(x + 7)(x − 7)</b>.</p><p>Ook met een getal voor x²: 9x² − 4 = (3x)² − 2² = (3x + 2)(3x − 2). Bij een <b>plus</b>, zoals x² + 49, werkt het niet.</p>',
          wanneer:'er een kwadraat min een kwadraat staat, zonder x-term.',
          maak:function(R){
            var k = R.kies([1, 1, 1, 2, 3]), p; do { p = k === 1 ? R.heel(1, 12) : R.heel(1, 7); } while (ggd(k, p) !== 1);
            var m = mVerschilOnt(R, k, p);
            return { vraag:m.vraag, context:'Ontbind. Schrijf je antwoord zoals (x + 7)(x ' + MIN + ' 7).', antwoord:m.ant, controle:m.ctrl, invoer:'tekst', stappen:m.stappen };
          } },
        { id:'wi-ont-kies', naam:'Kies de handigste manier', kort:'Geen los getal: buiten haakjes. Kwadraat min kwadraat: a² − b². Anders: de som-productmethode',
          uit:'<p>Kijk eerst welke termen er staan.</p><p>Is er <b>geen los getal</b>, zoals 4x² + 6x? Haal dan <b>buiten haakjes</b>.</p><p>Is het een <b>kwadraat min een kwadraat</b>, zonder x-term, zoals x² − 25? Gebruik <b>a² − b² = (a + b)(a − b)</b>.</p><p>Staan er x², een x-term én een los getal, zoals x² + 5x + 6? Gebruik de <b>som-productmethode</b>.</p>',
          wanneer:'je een uitdrukking moet ontbinden en niet weet hoe.',
          maak:function(R){
            var s = R.heel(0, 2), m, juist, opties = ['buiten haakjes halen', 'a² − b² = (a + b)(a − b)', 'de som-productmethode'], uitleg;
            if (s === 0){ var g = buitenGetallen(R); m = mBuiten(R, g.k, g.m, g.n, true); juist = opties[0]; uitleg = 'Er is geen los getal. In alle termen zit een x: haal buiten haakjes.'; }
            else if (s === 1){ var p = R.heel(2, 12); m = mVerschilOnt(R, 1, p); juist = opties[1]; uitleg = 'Een kwadraat min een kwadraat, zonder x-term.'; }
            else { var h = somProdGetallen(R); m = mSomProd(R, h.p, h.q, true); juist = opties[2]; uitleg = 'Er staan x², een x-term en een los getal: zoek product en som.'; }
            return { vraag:m.vraag, context:'Kies eerst de handigste manier. Ontbind dan.', antwoord:m.ant, controle:m.ctrl, invoer:'tekst',
              beeld:function(n){ return n < 1 || !m.beeld ? '' : m.beeld(n - 1); }, stappen:[K(R, 'Welke manier is hier het handigst?', juist, opties, uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen) };
          } }
      ] },

    /* ================= kwadratische vergelijkingen (havo) ================= */
    { groep:{ id:'wi-kwvgl', niveau:'havo', domein:'algebra', naam:'Kwadratische vergelijkingen',
        uit:'Een vergelijking met x². Er zijn meestal twee oplossingen, soms één of geen. Je lost hem op door de wortel te trekken, door te ontbinden of met de abc-formule.' },
      doelen:[
        { id:'wi-kw-wortel', naam:'x² = getal: worteltrekken', kort:'Maak x² vrij en trek de wortel: x² = 25 geeft x = 5 of x = −5',
          uit:'<p>Bij x² = 25 zoek je een getal dat keer zichzelf 25 is. Dat is 5, maar ook <b>−5</b>, want (−5)² = 25. Dus <b>x = 5 of x = −5</b>.</p><p>Staat er nog iets bij x², zoals x² + 7 = 32? Maak eerst <b>x² vrij</b>: x² = 25.</p><p>Komt er geen mooi getal uit, zoals x² = 20? Dan x = √20 ≈ 4,47 of x ≈ −4,47. En x² = −9 heeft <b>geen oplossing</b>: een kwadraat is nooit negatief.</p>',
          wanneer:'er alleen x² en getallen in de vergelijking staan, zonder losse x.',
          maak:function(R){
            var m = mWortel(R, R.kies(['kaal', 'keer', 'plus', 'plus', 'scheef', 'scheef', 'geen']));
            return { vraag:m.vraag, context:'Los op. Rond af op 2 decimalen als het niet precies uitkomt.', antwoord:m.ant, controle:m.ctrl, invoer:'tekst', stappen:m.stappen };
          } },
        { id:'wi-kw-ontbind', naam:'Oplossen door te ontbinden', kort:'Maak de rechterkant 0, ontbind, en gebruik: A · B = 0 geeft A = 0 of B = 0',
          uit:'<p>Een <b>product is 0</b> als een van de factoren 0 is. Daarom ontbind je eerst.</p><p>x² − x − 6 = 0. Ontbind met som en product: (x + 2)(x − 3) = 0. Dus x + 2 = 0 of x − 3 = 0: <b>x = −2 of x = 3</b>.</p><p>Staat er rechts geen 0? Breng dan eerst alles naar links. En bij x² + 5x = 0 haal je x buiten haakjes: x(x + 5) = 0, dus x = 0 of x = −5.</p>',
          wanneer:'je de vergelijking met = 0 makkelijk kunt ontbinden.',
          maak:function(R){
            var m = mOntbindVgl(R, R.kies(['somprod', 'somprod', 'verplaats', 'buiten']));
            return { vraag:m.vraag, context:'Los op door te ontbinden.', antwoord:m.ant, controle:m.ctrl, invoer:'tekst', stappen:m.stappen };
          } },
        { id:'wi-kw-abc', naam:'De abc-formule', kort:'Lees a, b en c af, bereken D = b² − 4ac, en dan x = (−b ± √D) : 2a',
          uit:'<p>Lukt ontbinden niet? Dan werkt de <b>abc-formule</b> altijd. Schrijf de vergelijking als ax² + bx + c = 0 en lees a, b en c af.</p><p>Bereken eerst de <b>discriminant</b>: <b>D = b² − 4ac</b>. Is D negatief, dan is er geen oplossing. Is D = 0, dan is er één.</p><p>Anders: <b>x = (−b + √D) : 2a</b> of <b>x = (−b − √D) : 2a</b>. Zet haakjes om de teller op je rekenmachine, en rond af op 2 decimalen.</p>',
          wanneer:'ontbinden niet lukt, of als je niet ziet hoe het moet.',
          maak:function(R){
            var g = abcGetallen(R, R.heel(0, 5) === 0), m = mAbc(R, g, false);
            return { vraag:vglAbc(g), context:'Los op met de abc-formule. Rond af op 2 decimalen.', antwoord:m.ant, controle:m.ctrl, invoer:'tekst', stappen:m.stappen };
          } },
        { id:'wi-kw-kies', naam:'Kies de handigste manier', kort:'Geen losse x: worteltrekken. Makkelijk te ontbinden: ontbinden. Anders: de abc-formule',
          uit:'<p>Kijk eerst naar de vergelijking.</p><p>Staat er <b>geen losse x</b>, alleen x² en getallen? Maak x² vrij en <b>trek de wortel</b>.</p><p>Is hij <b>makkelijk te ontbinden</b>, met som en product of door x buiten haakjes te halen? Dan is <b>ontbinden</b> het snelst.</p><p>Lukt dat niet, omdat er geen mooie getallen zijn of omdat er een getal voor x² staat? Gebruik de <b>abc-formule</b>.</p>',
          wanneer:'je een kwadratische vergelijking snel wilt oplossen.',
          maak:function(R){
            var s = R.heel(0, 2), m, vraag, juist, opties = ['worteltrekken', 'ontbinden', 'de abc-formule'], uitleg;
            if (s === 0){ m = mWortel(R, R.kies(['kaal', 'keer', 'plus'])); vraag = m.vraag; juist = opties[0]; uitleg = 'Er staat geen losse x, alleen x² en getallen. Maak x² vrij en trek de wortel.'; }
            else if (s === 1){ m = mOntbindVgl(R, R.kies(['somprod', 'buiten'])); vraag = m.vraag; juist = opties[1]; uitleg = 'Deze is makkelijk te ontbinden. Dat is sneller dan de abc-formule.'; }
            else { var g = abcGetallen(R, false); m = mAbc(R, g, true); vraag = vglAbc(g); juist = opties[2]; uitleg = 'Er zijn geen mooie getallen met de goede som en het goede product. Gebruik de abc-formule.'; }
            return { vraag:vraag, context:'Kies eerst de handigste manier. Los dan op. Rond af op 2 decimalen als het niet precies uitkomt.', antwoord:m.ant, controle:m.ctrl, invoer:'tekst',
              stappen:[K(R, 'Welke manier is hier het handigst?', juist, opties, uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen) };
          } }
      ] },

    /* ================= machten, wortels en formules (havo) ================= */
    { groep:{ id:'wi-macht', niveau:'havo', domein:'algebra', naam:'Machten, wortels en formules',
        uit:'De rekenregels voor machten, wortels zo eenvoudig mogelijk schrijven en een formule omwerken zodat een andere letter vrij staat.' },
      doelen:[
        { id:'wi-mac-regels', naam:'Rekenregels voor machten', kort:'Keer: exponenten optellen. Delen: aftrekken. Macht van een macht: vermenigvuldigen',
          uit:'<p>a³ · a⁴ is (a · a · a) · (a · a · a · a): zeven keer a. Bij <b>keer</b> tel je de exponenten <b>op</b>: a³ · a⁴ = a⁷.</p><p>Bij <b>delen</b> trek je ze <b>af</b>: a⁷ : a² = a⁵. Bij een <b>macht van een macht</b> vermenigvuldig je: (a³)² = a⁶.</p><p>Staan er getallen voor? Die reken je gewoon uit: 2a³ · 5a⁴ = 10a⁷. En (3a²)³ = 27a⁶, want ook de 3 gaat tot de derde.</p>',
          wanneer:'je machten met hetzelfde grondtal vermenigvuldigt, deelt of weer tot een macht neemt.',
          maak:function(R){
            var m = mMacht(R, R.kies(['keer', 'deel', 'macht']));
            return { vraag:m.vraag, context:'Schrijf zo eenvoudig mogelijk. Typ a⁵ als a^5.', antwoord:m.res, controle:exprC(m.res, { kaal:true }), invoer:'tekst', stappen:m.stappen };
          } },
        { id:'wi-mac-wortel', naam:'Wortels vereenvoudigen', kort:'Zoek het grootste kwadraat dat erin past: √48 = √16 · √3 = 4√3',
          uit:'<p>√48 kun je eenvoudiger schrijven. Zoek het <b>grootste kwadraat</b> dat een deler is van 48. Kwadraten zijn 4, 9, 16, 25, 36, 49, … Het grootste dat in 48 past is <b>16</b>: 48 = 16 × 3.</p><p>Dan √48 = √16 · √3 = <b>4√3</b>.</p><p>Neem je een te klein kwadraat, zoals 4, dan krijg je 2√12. Dat kan nog verder: in 12 zit nog een 4.</p>',
          wanneer:'je een exact antwoord moet geven, zonder af te ronden.',
          maak:function(R){
            var k, m, n; do { k = R.heel(2, 7); m = R.kies([2, 3, 5, 6, 7, 10, 11, 13, 14, 15]); n = k * k * m; } while (n > 300);
            var kl = []; for (var s = 2; s < k; s++) if (k % s === 0) kl.push(s);
            var foutK = {}; kl.forEach(function(s){ var r = n / (s * s); [s + '√' + r, s + ' √' + r, s + '√(' + r + ')'].forEach(function(v){ foutK[v] = 'Er zit nog een kwadraat in √' + r + '. Neem het grootste kwadraat.'; }); });
            var vk = []; kl.forEach(function(s){ vk.push(s * s, 'Dat kwadraat past erin, maar er past een groter kwadraat in.'); });
            var ant = k + '√' + m;
            return { vraag:'√' + n, context:'Schrijf zo eenvoudig mogelijk. Typ bijvoorbeeld 4√3 of 4 wortel 3.', antwoord:ant, controle:wortelC(k, m), invoer:'tekst', stappen:[
              S('Wat is het grootste kwadraat dat een deler is van ' + n + '?', k * k, 'Probeer de kwadraten van groot naar klein: ' + [49, 36, 25, 16, 9, 4].filter(function(x){ return x <= n; }).join(', ') + '. Welke past precies in ' + n + '?', F.apply(null, [k * k].concat(vk))),
              S(n + ' = ' + (k * k) + ' ' + X + ' …', m, n + ' : ' + (k * k) + '.'),
              SC('√' + n + ' = √' + (k * k) + ' · √' + m + ' =', ant, wortelC(k, m), '√' + (k * k) + ' = ' + k + ', dus ' + ant + '.', foutK) ] };
          } },
        { id:'wi-om-lin', naam:'Een formule omwerken', kort:'Maak de gevraagde letter vrij: doe aan beide kanten hetzelfde, in omgekeerde volgorde',
          uit:'<p>K = 15a + 40 geeft de prijs K bij a kaartjes. Wil je weten hoeveel kaartjes je voor een prijs krijgt? Dan maak je <b>a vrij</b>.</p><p>Doe het zoals bij een vergelijking, met de <b>balans</b>. Bij a gebeurt eerst × 15 en dan + 40. Terug begin je bij de laatste: trek aan beide kanten 40 af, K − 40 = 15a. Deel dan door 15: <b>a = (K − 40) : 15</b>.</p><p>Zet <b>haakjes</b> om K − 40: alles moet door 15 gedeeld worden.</p>',
          wanneer:'je een formule andersom wilt gebruiken.',
          maak:function(R){
            var m = omwerk(R);
            return { vraag:m.vraag, context:m.ctx, antwoord:m.ant, controle:m.ctrl, invoer:'tekst', stappen:m.stappen };
          } }
      ] }
  ]);
})();
