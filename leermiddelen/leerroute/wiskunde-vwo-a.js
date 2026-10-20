/* De leerroute wiskunde: vwo wiskunde A. Tellen (vermenigvuldigregel, herhaling,
   faculteit, permutaties, combinaties, rijtjes met twee soorten, routes in een rooster,
   de juiste telregel kiezen), kansregels (som, product, complement, kruistabel),
   kansverdelingen (verwachtingswaarde, standaardafwijking), de binomiale verdeling,
   de normale verdeling met de vuistregels, toetsen en het betrouwbaarheidsinterval,
   exponentiële groei met logaritmen, en differentiëren.
   Alles zonder grafische rekenmachine: getallen die met een gewone rekenmachine kunnen,
   en overschrijdingskansen staan in de opgave.
   Kansbomen, boxplot en de groeifactor staan in wiskunde-statistiek.js en wiskunde-verbanden.js.
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '·';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes voor stappen en antwoorden ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* ligt x vlak bij een afrondgrens? dan kiezen we andere getallen */
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.03; }
  function N(x){ return T(rnd(x, 6)); }
  function paren(a){ return a < 0 ? '(' + T(a) + ')' : T(a); }
  function getal(v){
    var s = String(v == null ? '' : v).trim().toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^≈/, '').replace(/^€/, '');
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    s = s.replace(',', '.');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    return { x:parseFloat(s), d:(s.split('.')[1] || '').length };
  }
  /* een getal: precies goed, of afgerond op minstens d decimalen */
  function getC(w, d){
    return function(v){ var p = getal(v); if (!p) return false;
      if (Math.abs(p.x - w) < 1e-9 || Math.abs(p.x - rnd(w, d)) < 1e-9) return true;
      return p.d >= d && Math.abs(p.x - w) <= 0.5 * Math.pow(10, -p.d) + 1e-12; };
  }
  function S(tekst, ant, hint, fout, o){
    o = o || {};
    var s = { tekst:tekst, antwoord:uniek([].concat(ant).map(function(a){ return typeof a === 'number' ? N(a) : String(a); })), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (o.e) s.eenheid = o.e;
    if (o.waarom) s.waarom = o.waarom;
    if (o.controle){ s.controle = o.controle; if (!o.getal) s.invoer = 'tekst'; }
    return s;
  }
  /* een stap met een afgerond antwoord: alleen die afronding (of het precieze getal) is goed */
  function SA(tekst, w, d, hint, fout, o){ o = o || {}; o.controle = getC(w, d); o.getal = true; return S(tekst, N(rnd(w, d)), hint, fout, o); }
  function K(R, tekst, goed, fout, hint, o){
    o = o || {};
    var l = o.orde ? o.orde.map(String) : R.hussel(uniek([goed].concat(fout || [])));
    var s = { tekst:tekst, opties:l, goed:l.indexOf(String(goed)), hint:hint };
    if (o.waarom) s.waarom = o.waarom;
    return s;
  }
  /* foute antwoorden met uitleg; komma en punt allebei, nooit een sleutel die gelijk is aan het goede antwoord */
  function F(goed){
    var o = {}, g = [].concat(goed).map(function(x){ return String(typeof x === 'number' ? N(x) : x).toLowerCase(); });
    var gn = g.map(function(x){ var p = getal(x); return p ? p.x : null; });
    for (var i = 1; i + 1 < arguments.length; i += 2){
      var k = String(typeof arguments[i] === 'number' ? N(arguments[i]) : arguments[i]).toLowerCase(), u = arguments[i + 1], p = getal(k);
      if (p && gn.some(function(x){ return x != null && Math.abs(x - p.x) < 1e-9; })) continue;
      var vs = [k, k.replace(/,/g, '.'), k.replace(/−/g, '-'), k.replace(/,/g, '.').replace(/−/g, '-')];
      if (/^\d{1,3}(\.\d{3})+$/.test(k)) vs.push(k.replace(/\./g, ''));
      vs.forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = u; });
    }
    return o;
  }
  /* het eindantwoord voor Zelf: van de laatste stap, met zijn controle of keuzes */
  function af(o){
    var st = o.stappen, l = st[st.length - 1];
    if (o.antwoord == null && !o.opties){
      if (l.opties){ o.opties = l.opties; o.goed = l.goed; }
      else if (l.controle){ o.antwoord = l.antwoord; o.controle = l.controle; if (l.invoer) o.invoer = l.invoer; }
    }
    if (o.eenheid == null && l.eenheid && !o.opties) o.eenheid = l.eenheid;
    return o;
  }
  /* kansen als breuk of kommagetal */
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function br(t, n){ return t + '/' + n; }
  function brv(t, n){ if (t === 0) return '0'; var g = ggd(t, n); return n / g === 1 ? String(t / g) : br(t / g, n / g); }
  function brAnt(t, n){ return uniek([br(t, n), brv(t, n)]); }
  function kansC(t, n){
    var w = t / n;
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-'), m;
      if ((m = /^(\d+)\/(\d+)$/.exec(s))) return +m[2] > 0 && Math.abs(+m[1] / +m[2] - w) < 1e-12;
      if ((m = /^(\d+)[.,](\d+)$/.exec(s))){ var d = m[2].length, x = +(m[1] + '.' + m[2]); if (Math.abs(x - w) < 1e-12) return true; return d >= 3 && Math.abs(x - w) <= 0.5 * Math.pow(10, -d) + 1e-12; }
      if (/^\d+$/.test(s)) return Math.abs(+s - w) < 1e-12;
      return false;
    };
  }
  function kansStap(tekst, t, n, hint, fout){ return S(tekst, brAnt(t, n), hint, fout, { controle:kansC(t, n) }); }
  /* een kans als breuk, of afgerond op 3 decimalen */
  function kans3C(t, n){ var a = kansC(t, n), b = getC(t / n, 3); return function(v){ return a(v) || b(v); }; }
  /* een interval: twee getallen in deze volgorde */
  function intC(lo, hi){
    return function(v){ var m = String(v).match(/\d+(?:[.,]\d+)?/g); if (!m || m.length !== 2) return false;
      var a = m.map(function(x){ return parseFloat(x.replace(',', '.')); });
      return Math.abs(a[0] - lo) < 1e-9 && Math.abs(a[1] - hi) < 1e-9; };
  }
  /* een punt met gehele coördinaten: (2, −5) */
  function puntC(x, y){
    return function(v){ var s = String(v).replace(/[−–—]/g, '-'), m = s.match(/-?\d+/g); if (!m || m.length !== 2 || /\./.test(s)) return false; return +m[0] === x && +m[1] === y; };
  }
  /* een kritiek gebied: "14", "X ≥ 14" of "x >= 14" */
  function kritC(rechts, g){
    return function(v){ var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/>=|=>/g, '≥').replace(/<=|=</g, '≤');
      var m = /^(x(≥|≤))?(\d+)$/.exec(s); if (!m) return false;
      if (m[2] && m[2] !== (rechts ? '≥' : '≤')) return false;
      return +m[3] === g; };
  }

  /* ---------- uitdrukkingen lezen (zoals in wiskunde-algebra.js) ---------- */
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
  function exprC(verwacht, o){
    o = o || {}; var q = lees(verwacht);
    return function(v){ var t = String(v).trim().replace(/^[a-z]'?\(x\)\s*=/i, '').replace(/^=/, ''), p = lees(t); if (!p || !pGelijk(p, q)) return false; return o.kaal ? kaal(t) : true; };
  }
  /* "y = 3x − 2" of alleen "3x − 2" */
  function vrijC(letter, verwacht){
    var q = lees(verwacht);
    return function(v){
      var d = String(v).split('='); if (d.length > 2) return false;
      if (d.length === 2){ if (norm(d[0]) !== letter.toLowerCase()) return false; d = [d[1]]; }
      var p = lees(d[0]); return !!p && pGelijk(p, q);
    };
  }
  /* oplossingen: "x = 1 of x = 3", "1 en 3", "1; 3" */
  function oplC(waarden){
    var w = uniek(waarden.map(function(x){ return String(rnd(x, 6)); })).map(Number).sort(function(a, b){ return a - b; });
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
      s = s.replace(/x\s*[12]?\s*(=|≈)/g, ' ').replace(/≈|=/g, ' ').replace(/\b(of|en)\b/g, ' ').replace(/;/g, ' ');
      s = s.replace(/(\d),(?=\d)/g, '$1.').replace(/,/g, ' ');
      if (/[^\d\s.-]/.test(s)) return false;
      var l = [], re = /(-)?\s*(\d+(?:\.\d+)?)/g, m;
      while ((m = re.exec(s))) l.push(m[1] ? -(+m[2]) : +m[2]);
      if (s.replace(re, '').trim()) return false;
      l = uniek(l.map(String)).map(Number).sort(function(a, b){ return a - b; });
      return l.length === w.length && l.every(function(x, i){ return Math.abs(x - w[i]) < 1e-9; });
    };
  }

  /* ---------- tellen en kansen ---------- */
  function fac(n){ var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function perm(n, k){ var r = 1; for (var i = 0; i < k; i++) r *= n - i; return r; }
  function comb(n, k){ var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); }
  function keten(n, k){ var l = []; for (var i = 0; i < k; i++) l.push(n - i); return l.join(' ' + X + ' '); }
  function boven(n, k){ return '(' + n + ' boven ' + k + ')'; }
  function pmf(n, p){ var a = []; for (var k = 0; k <= n; k++) a.push(comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k)); return a; }
  function pc(v){ return T(rnd(v * 100, 4)) + '%'; }

  /* ---------- veeltermen: [[coëfficiënt, exponent], ...] ---------- */
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sup(n){ return String(n).split('').map(function(c){ return c === '-' ? '⁻' : SUP.charAt(+c); }).join(''); }
  function E(termen){
    var s = '';
    termen.forEach(function(t){
      var c = rnd(t[0], 6), v = t[1] || ''; if (!c) return;
      var abs = Math.abs(c), stuk = (v && abs === 1 ? '' : T(abs)) + v;
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }
  function xm(e){ return e === 0 ? '' : e === 1 ? 'x' : 'x' + sup(e); }
  function polyS(p){ return E(p.map(function(t){ return [t[0], xm(t[1])]; })); }
  function afg(p){ return p.filter(function(t){ return t[1] > 0 && t[0]; }).map(function(t){ return [rnd(t[0] * t[1], 6), t[1] - 1]; }); }
  function waarde(p, x){ return rnd(p.reduce(function(s, t){ return s + t[0] * Math.pow(x, t[1]); }, 0), 6); }
  /* f(−2) uitschrijven: 2 · (−2)² − 3 · (−2) + 1 */
  function invul(p, a){
    var s = '';
    p.forEach(function(t){
      var c = t[0], e = t[1]; if (!c) return;
      var abs = Math.abs(c), xs = e === 0 ? '' : paren(a) + (e > 1 ? sup(e) : ''), stuk = e === 0 ? T(abs) : (abs === 1 ? xs : T(abs) + ' ' + X + ' ' + xs);
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + Math.round(max) + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600), 'fill:' + (o.k || 'var(--ink)')];
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" style="' + st.join(';') + '">' + Sch(t) + '</text>';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="stroke:' + (o.k || 'var(--ink)') + ';stroke-width:' + (o.w || 2) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round"/>'; }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + '"/>'; }
  function stip(x, y, k, r){ return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + (r || 6) + '" style="fill:' + k + ';stroke:var(--ink);stroke-width:1.5"/>'; }
  function pad(pts){ return pts.map(function(p, i){ return (i ? 'L' : 'M') + n1(p[0]) + ' ' + n1(p[1]); }).join(' '); }

  /* vakjes voor de telregels: lab onder elk vakje, w[i] erin; o.uit achter het =-teken */
  function vakjes(lab, w, o){
    o = o || {};
    var k = lab.length, b = k > 5 ? 62 : 100, g = k > 5 ? 22 : 34, xe = 10 + k * b + (k - 1) * g, W = xe + (o.uit ? 130 : 10), s = '';
    lab.forEach(function(l, i){
      var x = 10 + i * (b + g), vol = w[i] != null && w[i] !== '';
      s += rc(x, 12, b, 58, { rx:10, f:vol ? KL[0] : 'var(--kaart)', fo:vol ? 0.16 : 1 });
      if (vol) s += tx(x + b / 2, 50, w[i], { fs:24, vet:true });
      s += tx(x + b / 2, 92, l, { fs:k > 5 ? 12 : 13 });
      if (i < k - 1) s += tx(x + b + g / 2, 50, o.teken || X, { fs:26, vet:true });
    });
    if (o.uit) s += tx(xe + 64, 50, '= ' + o.uit, { fs:24, vet:true, k:KL[1] });
    return svg(W, 104, s, o.aria || 'vakjes', Math.min(640, W * 1.2));
  }
  /* een rijtje letters in hokjes; de letter hl valt op */
  function rijtje(l, hl){
    var b = 40, g = 6, W = l.length * (b + g) + 4, s = '';
    l.forEach(function(c, i){ var x = 2 + i * (b + g), op = c === hl; s += rc(x, 4, b, 44, { rx:8, f:op ? KL[0] : 'var(--kaart)', fo:op ? 0.22 : 1 }) + tx(x + b / 2, 33, c, { fs:20, vet:true }); });
    return svg(W, 52, s, 'een voorbeeld van een rijtje: ' + l.join(''), Math.min(560, W * 1.3));
  }
  /* een rooster van m bij h hokjes, A linksonder, B rechtsboven; route: rijtje van 'R' en 'O' */
  function rooster(m, h, o){
    o = o || {};
    var c = m > 5 || h > 4 ? 46 : 56, L = 36, Tp = 30, W = L + m * c + 40, H = Tp + h * c + 36, s = '', i, j;
    function Xr(a){ return L + a * c; } function Yr(b){ return Tp + (h - b) * c; }
    for (i = 0; i <= m; i++) s += ln(Xr(i), Yr(0), Xr(i), Yr(h), { w:1.6, op:0.5 });
    for (j = 0; j <= h; j++) s += ln(Xr(0), Yr(j), Xr(m), Yr(j), { w:1.6, op:0.5 });
    if (o.route){ var x = 0, y = 0, pts = [[Xr(0), Yr(0)]]; o.route.forEach(function(st){ if (st === 'R') x++; else y++; pts.push([Xr(x), Yr(y)]); }); s += '<path d="' + pad(pts) + '" style="fill:none;stroke:' + KL[1] + ';stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round"/>'; }
    s += stip(Xr(0), Yr(0), 'var(--ink)', 6) + tx(Xr(0) - 16, Yr(0) + 22, 'A', { fs:18, vet:true });
    s += stip(Xr(m), Yr(h), 'var(--ink)', 6) + tx(Xr(m) + 16, Yr(h) - 10, 'B', { fs:18, vet:true });
    if (o.P) s += stip(Xr(o.P[0]), Yr(o.P[1]), KL[3], 7) + tx(Xr(o.P[0]) + 14, Yr(o.P[1]) - 10, 'P', { fs:18, vet:true, k:KL[3] });
    return svg(W, H, s, o.aria || 'rooster van ' + m + ' bij ' + h + ' hokjes', Math.min(520, W * 1.25));
  }
  /* de normale kromme: streepjes bij μ + kσ met de waarden; o.vul [za, zb] kleurt een stuk; o.proc de vuistregels; o.streep een waarde */
  function normaal(mu, sig, o){
    o = o || {};
    var L = 16, Rr = 604, B = 150, Hh = 118, s = '', i, k;
    function Xn(z){ return L + (z + 3.7) / 7.4 * (Rr - L); }
    function Yn(z){ return B - Math.exp(-z * z / 2) * Hh; }
    if (o.vul){ var a = Math.max(o.vul[0], -3.7), b = Math.min(o.vul[1], 3.7), pts = [[Xn(a), B]]; for (i = 0; i <= 60; i++){ var z = a + (b - a) * i / 60; pts.push([Xn(z), Yn(z)]); } pts.push([Xn(b), B]); s += '<path d="' + pad(pts) + ' Z" style="fill:' + KL[0] + ';fill-opacity:0.32;stroke:none"/>'; }
    for (k = -3; k <= 3; k++){
      s += ln(Xn(k), B, Xn(k), Yn(k), { w:1.2, op:0.45, dash:'4 3' }) + ln(Xn(k), B, Xn(k), B + 6, { w:1.6 });
      s += tx(Xn(k), B + 22, T(rnd(mu + k * sig, 4)), { fs:13, vet:k === 0 });
      s += tx(Xn(k), B + 40, k === 0 ? 'μ' : 'μ ' + (k < 0 ? MIN : '+') + ' ' + (Math.abs(k) === 1 ? '' : Math.abs(k)) + 'σ', { fs:11, k:'var(--muted)' });
    }
    var cur = []; for (i = 0; i <= 140; i++){ var z2 = -3.7 + 7.4 * i / 140; cur.push([Xn(z2), Yn(z2)]); }
    s += '<path d="' + pad(cur) + '" style="fill:none;stroke:var(--ink);stroke-width:2.5"/>' + ln(L, B, Rr, B, { w:2 });
    if (o.proc){
      [[-0.5, '34%'], [0.5, '34%'], [-1.5, '13,5%'], [1.5, '13,5%']].forEach(function(p){ s += tx(Xn(p[0]), Math.abs(p[0]) < 1 ? B - 32 : B - 14, p[1], { fs:13, vet:true }); });
      [[-2.5, '2,35%'], [2.5, '2,35%']].forEach(function(p){ s += tx(Xn(p[0]), Yn(p[0]) - 10, p[1], { fs:11, vet:true }); });
      [[-3.4, '0,15%'], [3.4, '0,15%']].forEach(function(p){ s += tx(Xn(p[0]), Yn(p[0]) - 10, p[1], { fs:10, vet:true }); });
    }
    if (o.streep != null){ var zz = Math.max(-3.6, Math.min(3.6, o.streep)); s += ln(Xn(zz), B, Xn(zz), 22, { k:KL[1], w:3 }) + tx(Xn(zz), 16, o.streepT || '', { fs:13, vet:true, k:KL[1] }); }
    return svg(620, B + 48, s, o.aria || 'normale verdeling met μ = ' + T(mu) + ' en σ = ' + T(sig), 640);
  }
  /* een grafiek van f op [x0, x1]; o.punten [[x, y, label]], o.lijn { m, b } */
  function plot(f, x0, x1, o){
    o = o || {};
    var W = 440, H = 300, L = 40, Rr = W - 16, Tp = 14, B = H - 30, ys = [], i;
    for (i = 0; i <= 100; i++) ys.push(f(x0 + (x1 - x0) * i / 100));
    var y0 = Math.min(0, Math.min.apply(null, ys)), y1 = Math.max(0, Math.max.apply(null, ys));
    if (y1 - y0 < 4){ y1 += 2; y0 -= 2; }
    var pd = (y1 - y0) * 0.08; y0 -= pd; y1 += pd;
    function Xp(x){ return L + (x - x0) / (x1 - x0) * (Rr - L); }
    function Yp(y){ return B - (y - y0) / (y1 - y0) * (B - Tp); }
    var span = y1 - y0, st = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000].filter(function(v){ return span / v <= 8; })[0] || 2000, s = '', gx, gy;
    for (gx = Math.ceil(x0); gx <= x1; gx++) s += ln(Xp(gx), Tp, Xp(gx), B, { w:1, op:0.13 }) + tx(Xp(gx), B + 20, T(gx), { fs:12, k:'var(--muted)' });
    for (gy = Math.ceil(y0 / st) * st; gy <= y1; gy += st) s += ln(L, Yp(gy), Rr, Yp(gy), { w:1, op:0.13 }) + tx(L - 6, Yp(gy) + 4, T(gy), { fs:12, a:'end', k:'var(--muted)' });
    if (x0 <= 0 && x1 >= 0) s += ln(Xp(0), Tp, Xp(0), B, { w:1.8 });
    s += ln(L, Yp(0), Rr, Yp(0), { w:1.8 });
    if (o.lijn){ var m = o.lijn.m, b = o.lijn.b, xa = x0, xb = x1;
      if (m !== 0){ var xA = (y0 - b) / m, xB = (y1 - b) / m; xa = Math.max(xa, Math.min(xA, xB)); xb = Math.min(xb, Math.max(xA, xB)); }
      if (xa < xb && (m !== 0 || (b > y0 && b < y1))) s += ln(Xp(xa), Yp(m * xa + b), Xp(xb), Yp(m * xb + b), { k:KL[1], w:2.6 }); }
    var cur = []; for (i = 0; i <= 120; i++){ var x = x0 + (x1 - x0) * i / 120; cur.push([Xp(x), Yp(f(x))]); }
    s += '<path d="' + pad(cur) + '" style="fill:none;stroke:' + KL[0] + ';stroke-width:3"/>';
    (o.punten || []).forEach(function(p){ s += stip(Xp(p[0]), Yp(p[1]), KL[3], 5.5); if (p[2]) s += tx(Xp(p[0]) + 10, Yp(p[1]) - 10, p[2], { fs:13, vet:true, a:'start' }); });
    return svg(W, H, s, o.aria || 'grafiek', 460);
  }
  function tabel(rijen, nad, o){ o = o || {}; return R0.teken.tabel(rijen, { kop:o.kop, zijkop:o.zijkop == null ? true : o.zijkop, nadruk:nad || [] }); }

  /* ================= vaste verhalen ================= */
  /* de normale verdeling */
  var NORM = [
    { wat:'De lengte van volwassen mannen', mu:[178, 184], sig:[6, 9], eh:'cm', wie:'mannen', meer:'is langer dan', minder:'is korter dan', tus:function(a, b){ return 'is tussen ' + a + ' en ' + b + ' cm lang'; } },
    { wat:'Het gewicht van pakken suiker', mu:[1002, 1010], sig:[3, 8], eh:'gram', wie:'pakken', meer:'weegt meer dan', minder:'weegt minder dan', tus:function(a, b){ return 'weegt tussen ' + a + ' en ' + b + ' gram'; } },
    { wat:'De score op een landelijke toets', mu:[55, 70], sig:[8, 14], eh:'punten', wie:'leerlingen', meer:'scoort meer dan', minder:'scoort minder dan', tus:function(a, b){ return 'scoort tussen ' + a + ' en ' + b + ' punten'; } },
    { wat:'De reactietijd van automobilisten', mu:[230, 270], sig:[20, 40], eh:'ms', wie:'automobilisten', meer:'reageert langzamer dan', minder:'reageert sneller dan', tus:function(a, b){ return 'heeft een reactietijd tussen ' + a + ' en ' + b + ' ms'; } },
    { wat:'De inhoud van flessen frisdrank', mu:[1495, 1505], sig:[4, 9], eh:'ml', wie:'flessen', meer:'bevat meer dan', minder:'bevat minder dan', tus:function(a, b){ return 'bevat tussen ' + a + ' en ' + b + ' ml'; } }
  ];
  function normKies(R){ var c = R.kies(NORM); return { c:c, mu:R.heel(c.mu[0], c.mu[1]), sig:R.heel(c.sig[0], c.sig[1]) }; }
  /* de vuistregels: stukjes tussen −∞, −3, −2, −1, 0, 1, 2, 3, ∞ (±4 is oneindig) */
  var BAND = [0.15, 2.35, 13.5, 34, 34, 13.5, 2.35, 0.15];
  function stukjes(za, zb){ var l = []; for (var i = 0; i < 8; i++){ var lo = i - 4, hi = i - 3; if (i === 0) lo = -4; if (i === 7) hi = 4; if (lo >= za && hi <= zb) l.push(BAND[i]); } return l; }
  function opp(za, zb){ return rnd(stukjes(za, zb).reduce(function(s, x){ return s + x; }, 0), 2); }
  function sigTekst(k){ return k === 0 ? 'μ' : 'μ ' + (k < 0 ? MIN : '+') + ' ' + (Math.abs(k) === 1 ? '' : Math.abs(k)) + 'σ'; }
  /* boven μ + kσ ligt dit percentage */
  var BOVEN = { '-3':99.85, '-2':97.5, '-1':84, '0':50, '1':16, '2':2.5, '3':0.15 };

  /* toetsen: verhalen met een hypothese */
  var HYP = [
    { par:'p', v:[0.02, 0.05, 0.08], h1:'>', zin:function(v){ return 'Een fabrikant zegt dat ' + pc(v) + ' van zijn lampen defect is. Een winkelier denkt dat het er meer zijn.'; },
      uitk:function(n, k){ return 'In een steekproef van ' + n + ' lampen zijn er ' + k + ' defect.'; }, X:'het aantal defecte lampen' },
    { par:'p', v:[0.5], h1:'≠', zin:function(){ return 'Je wilt weten of een munt zuiver is: of de kans op kop 0,5 is. Je hebt geen idee of hij vaker kop of vaker munt geeft.'; },
      uitk:function(n, k){ return 'Je gooit ' + n + ' keer en krijgt ' + k + ' keer kop.'; }, X:'het aantal keer kop' },
    { par:'p', v:[0.4, 0.45, 0.6], h1:'≠', zin:function(v){ return 'Landelijk fietst ' + pc(v) + ' van de leerlingen naar school. Een school onderzoekt of dat bij haar leerlingen anders is.'; },
      uitk:function(n, k){ return 'Van ' + n + ' leerlingen van de school fietsen er ' + k + '.'; }, X:'het aantal fietsers' },
    { par:'p', v:[0.6, 0.65, 0.7], h1:'>', zin:function(v){ return 'Een oud medicijn helpt bij ' + pc(v) + ' van de patiënten. Onderzoekers denken dat een nieuw medicijn vaker helpt.'; },
      uitk:function(n, k){ return 'Van ' + n + ' patiënten helpt het nieuwe medicijn bij ' + k + '.'; }, X:'het aantal patiënten bij wie het nieuwe medicijn helpt' },
    { par:'p', v:[0.25, 0.3, 0.35], h1:'<', zin:function(v){ return 'Een partij kreeg bij de vorige verkiezing ' + pc(v) + ' van de stemmen. De partij vreest dat dit nu minder is.'; },
      uitk:function(n, k){ return 'Van ' + n + ' ondervraagde kiezers stemmen er ' + k + ' op de partij.'; }, X:'het aantal kiezers dat op de partij stemt' },
    { par:'μ', v:[150, 200, 250], h1:'<', zin:function(v){ return 'Op een zak chips staat dat er gemiddeld ' + v + ' gram in zit. De consumentenbond vermoedt dat het minder is.'; } },
    { par:'μ', v:[500, 750, 1000], h1:'≠', zin:function(v){ return 'Een machine vult flessen met gemiddeld ' + v + ' ml. De controleur wil weten of de machine ontregeld is. Hij kan te veel of te weinig vullen.'; } },
    { par:'μ', v:[35, 40, 45], h1:'<', zin:function(v){ return 'Een busrit duurde gemiddeld ' + v + ' minuten. De vervoerder denkt dat de rit met de nieuwe dienstregeling gemiddeld korter duurt.'; } },
    { par:'μ', v:[120, 150, 180], h1:'>', zin:function(v){ return 'Zonnebloemen worden gemiddeld ' + v + ' cm hoog. Een kweker denkt dat ze met een nieuwe voeding gemiddeld hoger worden.'; } }
  ];
  var ZIJ = { '>':'rechtszijdig', '<':'linkszijdig', '≠':'tweezijdig' };

  /* exponentiële groei */
  var OMREKEN = [
    { van:'jaar', naar:'maand', e:'1/12', ev:1 / 12, g:[102, 120], naarT:'maand' },
    { van:'jaar', naar:'10 jaar', e:'10', ev:10, g:[101, 115], naarT:'periode van 10 jaar' },
    { van:'dag', naar:'week', e:'7', ev:7, g:[102, 125], naarT:'week' },
    { van:'week', naar:'dag', e:'1/7', ev:1 / 7, g:[105, 160], naarT:'dag' },
    { van:'uur', naar:'dag', e:'24', ev:24, g:[101, 106], naarT:'dag' },
    { van:'dag', naar:'uur', e:'1/24', ev:1 / 24, g:[110, 200], naarT:'uur' },
    { van:'maand', naar:'jaar', e:'12', ev:12, g:[101, 110], naarT:'jaar' } ];
  var DINGEN = [
    { zin:'Het aantal bacteriën in een bakje groeit exponentieel.', t:['uur', 'dag', 'week'], groei:true },
    { zin:'Een spaarbedrag groeit exponentieel.', t:['maand', 'jaar', '10 jaar'], groei:true },
    { zin:'Het aantal volgers van een account groeit exponentieel.', t:['dag', 'week', 'maand', 'jaar'], groei:true },
    { zin:'De hoeveelheid medicijn in het bloed neemt exponentieel af.', t:['uur', 'dag'], groei:false },
    { zin:'De waarde van een auto neemt exponentieel af.', t:['maand', 'jaar', '10 jaar'], groei:false },
    { zin:'De hoeveelheid van een radioactieve stof neemt exponentieel af.', t:['dag', 'week', 'jaar', '10 jaar'], groei:false } ];

  /* ================= opgavemakers die vaker gebruikt worden ================= */
  /* g^(ax + b) = rechts, met een rechterkant die een macht van g is */
  function mZelfde(R, l, metC){
    var g, m, a, b, x, rng = { 2:[-3, 8], 3:[-3, 5], 5:[-2, 4], 10:[-3, 5] };
    do { g = R.kies([2, 3, 5, 10]); m = R.heel(rng[g][0], rng[g][1]); a = R.kies([1, 1, 2, 3]); b = R.kies([0, 0, -3, -2, -1, 1, 2, 3]); x = (m - b) / a; }
    while (m === 0 || Math.abs(x * 2 - Math.round(x * 2)) > 1e-9 || (metC && m < 1));
    var c = metC ? R.heel(2, 5) : 0;
    function macht(e){ return e >= 0 ? T(Math.pow(g, e)) : g === 10 ? T(rnd(Math.pow(10, e), 6)) : '1/' + T(Math.pow(g, -e)); }
    var rechts = macht(m), ex = E([[a, l], [b, '']]), kaalEx = a === 1 && b === 0;
    var links = (c ? c + ' ' + X + ' ' : '') + g + (kaalEx ? '^' + l : '^(' + ex + ')'), linksH = (c ? c + ' ' + X + ' ' : '') + g + '<sup>' + ex + '</sup>';
    var rechtsC = c ? T(c * Math.pow(g, m)) : rechts;
    var ant = Math.abs(x - Math.round(x)) < 1e-9 ? [T(x)] : [T(x), (x < 0 ? '−' : '') + Math.abs(2 * x) + '/2'];
    var st = [];
    if (c) st.push(S('Deel beide kanten door ' + c + ': ' + g + '<sup>' + ex + '</sup> =', Math.pow(g, m), rechtsC + ' : ' + c + ' = ' + rechts + '.'));
    var mh = m > 0 ? 'Reken door: ' + Array.apply(null, Array(Math.min(m, 8))).map(function(_, i){ return T(Math.pow(g, i + 1)); }).join(', ') + '.'
      : (g === 10 ? rechts + ' = 1/' + T(Math.pow(10, -m)) + ' en 1/10' + sup(-m) + ' = 10' + sup(m) + '.' : rechts + ' = 1/' + g + sup(-m) + ', en dat is ' + g + sup(m) + '. Een breuk 1/... geeft een negatieve exponent.');
    st.push(S('Schrijf ' + rechts + ' als macht van ' + g + ': ' + rechts + ' = ' + g + '<sup>…</sup>', m, mh, m < 0 ? F(m, -m, 'Let op: ' + rechts + ' is kleiner dan 1, dus de exponent is negatief.') : null));
    var dl = []; if (b) dl.push('aan beide kanten ' + (b > 0 ? MIN + ' ' + b : '+ ' + (-b))); if (a !== 1) dl.push((b ? 'dan ' : '') + 'delen door ' + a);
    st.push(S('De grondtallen zijn gelijk, dus de exponenten ook: ' + ex + ' = ' + T(m) + '. Dus ' + l + ' =', ant, kaalEx ? 'Er staat alleen ' + l + ' in de exponent.' : 'Los ' + ex + ' = ' + T(m) + ' op: ' + dl.join(', ') + '.'));
    return { vraag:links + ' = ' + rechtsC, vraagHtml:linksH + ' = ' + rechtsC, stappen:st, ant:ant };
  }
  /* b · g^t = c met een logaritme; of g^x = c met een geheel grondtal dat niet past */
  function mLog(R, l, geheel){
    var b, g, c, r, t, t2, st = [], vraag, vraagH;
    if (geheel){
      var MACHT = { 2:[2, 4, 8, 16, 32, 64, 128], 3:[3, 9, 27, 81, 243], 5:[5, 25, 125, 625] };
      do { g = R.kies([2, 3, 5]); c = R.heel(3, 200); t = Math.log(c) / Math.log(g); } while (MACHT[g].indexOf(c) >= 0 || grens(t, 2));
      t2 = rnd(t, 2);
      vraag = g + '^' + l + ' = ' + c; vraagH = g + '<sup>' + l + '</sup> = ' + c;
      var kl = MACHT[g].filter(function(x){ return x < c; }).pop(), gr = MACHT[g].filter(function(x){ return x > c; })[0];
      st.push(K(R, 'Kun je ' + c + ' schrijven als een macht van ' + g + ' met een geheel getal als exponent?', 'nee', ['ja'], c + ' ligt ' + (kl ? 'tussen ' + kl + ' en ' + (gr || 'een grotere macht') : 'onder ' + gr) + ': geen macht van ' + g + '.', { orde:['ja', 'nee'] }));
      st.push(SA(l + ' = log(' + c + ') : log(' + g + ') ≈ (2 decimalen)', t, 2, 'Rekenmachine: log(' + c + ') ÷ log(' + g + ').', F(t2, rnd(Math.log(g) / Math.log(c), 2), 'Andersom gedeeld. Boven de streep log(' + c + ').', rnd(c / g, 2), 'Delen is hier niet genoeg. Gebruik log.')));
      return { vraag:vraag, vraagHtml:vraagH, stappen:st, ant:T(t2) };
    }
    var groei = R.heel(0, 2) > 0;
    do { b = R.kies([2, 4, 5, 8, 10, 20, 25, 50]); g = groei ? R.heel(102, 150) / 100 : R.heel(50, 98) / 100;
      c = groei ? R.heel(b + 1, 5 * b) : R.heel(Math.ceil(b / 5), b - 1); r = rnd(c / b, 6); t = Math.log(r) / Math.log(g); }
    while (c === b || grens(t, 2) || t > 99 || t < 0.3);
    t2 = rnd(t, 2);
    vraag = b + ' ' + X + ' ' + T(g) + '^' + l + ' = ' + c; vraagH = b + ' ' + X + ' ' + T(g) + '<sup>' + l + '</sup> = ' + c;
    st.push(S('Maak de macht vrij: deel door ' + b + '. ' + T(g) + '<sup>' + l + '</sup> =', r, c + ' : ' + b + ' = ' + N(r) + '.', F(r, c - b, 'Er staat keer ' + b + ', dus je deelt door ' + b + '.')));
    st.push(SA(l + ' = log(' + N(r) + ') : log(' + T(g) + ') ≈ (2 decimalen)', t, 2, 'Rekenmachine: log(' + N(r) + ') ÷ log(' + T(g) + ').', F(t2, rnd(Math.log(c) / Math.log(g), 2), 'Je moet eerst door ' + b + ' delen.', rnd(Math.log(g) / Math.log(r), 2), 'Andersom gedeeld. Boven de streep log(' + N(r) + ').')));
    return { vraag:vraag, vraagHtml:vraagH, stappen:st, ant:T(t2) };
  }
  /* een binomiaal verhaal */
  var BIN = [
    { zin:function(p, n){ return 'Een basketballer gooit een vrije worp raak met kans ' + T(p) + '. Hij gooit ' + n + ' keer.'; }, X:'het aantal keer raak', p:[0.6, 0.7, 0.8, 0.9] },
    { zin:function(p, n){ return 'Een zaadje kiemt met kans ' + T(p) + '. Je plant ' + n + ' zaadjes.'; }, X:'het aantal zaadjes dat kiemt', p:[0.6, 0.7, 0.8, 0.9] },
    { zin:function(p, n){ return 'Je gooit ' + n + ' keer met een munt.'; }, X:'het aantal keer kop', p:[0.5] },
    { zin:function(p, n){ return 'Een product is defect met kans ' + T(p) + '. Je controleert er ' + n + '.'; }, X:'het aantal defecte producten', p:[0.1, 0.2, 0.3] },
    { zin:function(p, n){ return 'Bij een quiz weet Noor het antwoord met kans ' + T(p) + '. Er zijn ' + n + ' vragen.'; }, X:'het aantal vragen dat Noor goed heeft', p:[0.4, 0.5, 0.6, 0.7] } ];

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= tellen: de volgorde telt ================= */
    { groep:{ id:'wva-telv', niveau:'vwo', domein:'statistiek', naam:'Tellen: de volgorde telt',
        uit:'De vermenigvuldigregel, rijtjes met herhaling (n tot de macht k), alles op een rij zetten (n!) en een deel op volgorde zetten (permutaties).' },
      doelen:[
        { id:'wva-tel-verm', naam:'De vermenigvuldigregel', kort:'Maak je een paar keuzes na elkaar, dan vermenigvuldig je de aantallen mogelijkheden',
          uit:'<p>Je hebt 3 broeken, 4 shirts en 2 paar schoenen. Bij elke broek passen 4 shirts: dat zijn al 3 · 4 = 12 combinaties. Bij elk daarvan passen weer 2 paar schoenen.</p><p>Maak je keuzes <b>na elkaar</b>, dan <b>vermenigvuldig</b> je de aantallen: 3 · 4 · 2 = <b>24</b> outfits.</p><p>Een boomdiagram laat hetzelfde zien, maar bij grote aantallen wordt die boom veel te groot. Teken dan <b>vakjes</b>: één vakje per keuze, met het aantal mogelijkheden erin.</p>',
          wanneer:'je een paar keuzes na elkaar maakt, zoals bij een menu of een outfit.',
          maak:function(R){
            var sc = R.kies([
              { lab:['voorgerecht', 'hoofdgerecht', 'nagerecht'], zin:function(a){ return 'Een restaurant heeft ' + a[0] + ' voorgerechten, ' + a[1] + ' hoofdgerechten en ' + a[2] + ' nagerechten. Je kiest van elk één.'; }, vraag:'Hoeveel verschillende menu\'s?' },
              { lab:['broek', 'shirt', 'schoenen'], zin:function(a){ return 'Je hebt ' + a[0] + ' broeken, ' + a[1] + ' shirts en ' + a[2] + ' paar schoenen.'; }, vraag:'Hoeveel verschillende outfits?' },
              { lab:['A naar B', 'B naar C'], zin:function(a){ return 'Van dorp A naar dorp B lopen ' + a[0] + ' wegen. Van B naar C lopen ' + a[1] + ' wegen.'; }, vraag:'Hoeveel routes van A via B naar C?' },
              { lab:['hoorn/bakje', 'smaak', 'saus'], vast:[2], zin:function(a){ return 'Bij de ijssalon kies je een hoorntje of een bakje, één van de ' + a[1] + ' smaken en één van de ' + a[2] + ' sauzen.'; }, vraag:'Hoeveel verschillende ijsjes?' },
              { lab:['kleur', 'zadel', 'mand'], zin:function(a){ return 'Een fiets kun je bestellen in ' + a[0] + ' kleuren, met ' + a[1] + ' soorten zadels en met ' + a[2] + ' soorten manden.'; }, vraag:'Hoeveel verschillende fietsen?' } ]);
            var a = sc.lab.map(function(x, i){ return sc.vast && sc.vast[i] ? sc.vast[i] : R.heel(2, 8); });
            var prod = a.reduce(function(p, x){ return p * x; }, 1), som = a.reduce(function(p, x){ return p + x; }, 0);
            var bl = function(n){ return vakjes(sc.lab, n >= 1 ? a.map(String) : [], { uit:n >= 2 ? T(prod) : null, aria:'een vakje per keuze' }); };
            return af({ vraag:sc.vraag, context:sc.zin(a), beeld:bl, stappen:[
              K(R, 'Je maakt de keuzes na elkaar. Tel je de aantallen op, of vermenigvuldig je ze?', 'vermenigvuldigen', ['optellen'], 'Bij elke eerste keuze passen weer alle mogelijkheden van de volgende keuze.', { orde:['optellen', 'vermenigvuldigen'] }),
              S('Het aantal: ' + a.join(' ' + X + ' ') + ' =', prod, 'Vermenigvuldig de getallen in de vakjes: ' + a.join(' · ') + '.', F(prod, som, 'Je telde op. Bij keuzes na elkaar vermenigvuldig je.')) ] });
          } },
        { id:'wva-tel-herh', naam:'Met herhaling: n tot de macht k', kort:'Heb je k plekken met elk n mogelijkheden en mag iets vaker voorkomen, dan zijn er n tot de macht k rijtjes',
          uit:'<p>Een pincode heeft 4 cijfers. Een cijfer mag vaker voorkomen, dus voor <b>elke plek</b> heb je weer <b>10</b> mogelijkheden.</p><p>Met de vermenigvuldigregel: 10 · 10 · 10 · 10 = 10<sup>4</sup> = <b>10.000</b> pincodes.</p><p>In het algemeen: <b>k plekken</b> met elk <b>n mogelijkheden</b> geeft <b>n<sup>k</sup></b> rijtjes. Let op: het aantal mogelijkheden is het grondtal, het aantal plekken de exponent.</p>',
          wanneer:'de volgorde telt en hetzelfde vaker mag voorkomen, zoals bij codes en worpen.',
          maak:function(R){
            var sc = R.kies([
              { n:10, k:[3, 4, 5], zin:function(k){ return 'Een pincode bestaat uit ' + k + ' cijfers. Een cijfer mag vaker voorkomen.'; }, vraag:'Hoeveel pincodes?', plek:'cijfer' },
              { n:26, k:[2, 3], zin:function(k){ return 'Een code bestaat uit ' + k + ' letters uit het alfabet (26 letters). Een letter mag vaker voorkomen.'; }, vraag:'Hoeveel codes?', plek:'letter' },
              { n:6, k:[2, 3, 4], zin:function(k){ return 'Je gooit ' + k + ' keer met een dobbelsteen en schrijft de ogen op een rij.'; }, vraag:'Hoeveel rijtjes?', plek:'worp' },
              { n:[3, 4, 5], k:[4, 5, 6], zin:function(k, n){ return 'Een toets heeft ' + k + ' meerkeuzevragen met elk ' + n + ' antwoorden. Je kruist bij elke vraag één antwoord aan.'; }, vraag:'Op hoeveel manieren kun je de toets invullen?', plek:'vraag' },
              { n:2, k:[5, 6, 7, 8], zin:function(k){ return 'Je gooit ' + k + ' keer met een munt en schrijft K (kop) of M (munt) op een rij.'; }, vraag:'Hoeveel rijtjes?', plek:'worp' } ]);
            var n = typeof sc.n === 'number' ? sc.n : R.kies(sc.n), k = R.kies(sc.k), uit = Math.pow(n, k), lab = [], i;
            for (i = 0; i < k; i++) lab.push(sc.plek + ' ' + (i + 1));
            var keer = []; for (i = 0; i < k; i++) keer.push(n);
            var bl = k <= 6 ? function(m){ return vakjes(lab, m >= 1 ? lab.map(function(){ return String(n); }) : [], { uit:m >= 3 ? T(uit) : null, aria:k + ' vakjes met elk ' + n + ' mogelijkheden' }); } : null;
            return af({ vraag:sc.vraag, context:sc.zin(k, n), beeld:bl, stappen:[
              S('Hoeveel mogelijkheden zijn er voor één plek?', n, 'Hoeveel keuzes heb je voor één ' + sc.plek + '?'),
              S('Hoeveel plekken zijn er?', k, 'Hoeveel keer kies je?'),
              S('Het aantal: ' + n + '<sup>' + k + '</sup> =', uit, 'Doe ' + keer.join(' · ') + '.', F(uit, n * k, 'Je deed keer ' + k + '. Elke plek heeft weer ' + n + ' keuzes: het is een macht.', Math.pow(k, n), 'Andersom. Het grondtal is het aantal keuzes per plek: ' + n + '.')) ] });
          } },
        { id:'wva-tel-fac', naam:'Alles op een rij: n!', kort:'n verschillende dingen op volgorde zetten kan op n! = n · (n − 1) · … · 1 manieren',
          uit:'<p>Je zet 5 verschillende boeken naast elkaar. Voor de eerste plek heb je 5 keuzes, voor de tweede nog 4, dan 3, 2 en 1.</p><p>Dat geeft 5 · 4 · 3 · 2 · 1 = <b>120</b> volgordes. Zo\'n product schrijf je kort als <b>5!</b>. Je zegt: vijf faculteit.</p><p>Op de rekenmachine zit daarvoor een knop <b>x!</b> of <b>n!</b>.</p>',
          wanneer:'je alle dingen op een rij zet en elk ding één keer gebruikt.',
          maak:function(R){
            var sc = R.kies(['boek', 'rij', 'woord', 'foto', 'spreker']), n, zin, vraag, w;
            if (sc === 'woord'){ w = R.kies(['GOUD', 'MELK', 'BROEK', 'KAMER', 'TAFEL', 'PLANT', 'FIETS', 'STOEL', 'WINKEL', 'KLEDING', 'SCHRIJF']); n = w.length; zin = 'Je maakt rijtjes met alle letters van het woord ' + w + '. Alle letters zijn verschillend en je gebruikt elke letter één keer.'; vraag = 'Hoeveel rijtjes?'; }
            else { n = R.heel(4, 8);
              zin = { boek:'Je zet ' + n + ' verschillende boeken naast elkaar op een plank.', rij:n + ' leerlingen gaan achter elkaar in de rij staan.', foto:n + ' vrienden gaan naast elkaar op een foto.', spreker:'Bij een debat spreken ' + n + ' leerlingen, elk één keer, na elkaar.' }[sc];
              vraag = sc === 'spreker' ? 'Hoeveel volgordes van sprekers?' : 'Hoeveel volgordes?'; }
            var f = fac(n), lab = [], i; for (i = 0; i < n; i++) lab.push((i + 1) + 'e');
            var bl = function(m){ var w2 = []; if (m >= 1) w2.push(String(n)); if (m >= 2) w2.push(String(n - 1)); if (m >= 3) for (var j = n - 2; j >= 1; j--) w2.push(String(j)); return vakjes(lab, w2, { uit:m >= 3 ? T(f) : null, aria:n + ' plekken op een rij' }); };
            return af({ vraag:vraag, context:zin, beeld:bl, stappen:[
              S('Hoeveel keuzes heb je voor de eerste plek?', n, 'Alle ' + n + ' kunnen nog.'),
              S('En voor de tweede plek?', n - 1, 'Eén is al gebruikt.', F(n - 1, n, 'Eén is al gebruikt. Die kun je niet nog een keer kiezen.')),
              S('Het aantal: ' + n + '! = ' + keten(n, n) + ' =', f, 'Vermenigvuldig door tot 1, of gebruik de knop x! op je rekenmachine.', F(f, Math.pow(n, n), 'Dat is met herhaling. Elk ding gebruik je maar één keer.', n * (n - 1), 'Je stopte na twee plekken. Ga door tot 1.')) ] });
          } },
        { id:'wva-tel-perm', naam:'Permutaties: een deel op volgorde', kort:'k van de n op volgorde zetten, zonder herhaling: n · (n − 1) · … met k factoren',
          uit:'<p>Bij een race lopen 8 lopers. Hoeveel uitslagen zijn er voor goud, zilver en brons? Voor goud zijn er 8 keuzes, voor zilver nog 7, voor brons nog 6.</p><p>Dat is 8 · 7 · 6 = <b>336</b>. Je stopt na <b>3 factoren</b>, want er zijn 3 plekken. Dit heet een <b>permutatie</b> van 3 uit 8.</p><p>Op de rekenmachine: <b>8 nPr 3</b>. Met faculteiten is het 8! : 5!.</p>',
          wanneer:'de volgorde telt en niemand twee keer gekozen kan worden.',
          maak:function(R){
            var sc = R.kies([
              { k:[3], n:[6, 12], lab:['goud', 'zilver', 'brons'], zin:function(n){ return 'Bij een hardloopwedstrijd doen ' + n + ' lopers mee. Er is een gouden, een zilveren en een bronzen medaille.'; }, vraag:'Hoeveel uitslagen voor het podium?' },
              { k:[3], n:[7, 15], lab:['voorzitter', 'secretaris', 'penningmeester'], zin:function(n){ return 'Een club heeft ' + n + ' leden. Ze kiezen een voorzitter, een secretaris en een penningmeester. Niemand krijgt twee functies.'; }, vraag:'Hoeveel manieren?' },
              { k:[2], n:[8, 16], lab:['aanvoerder', 'reserve'], zin:function(n){ return 'In een team zitten ' + n + ' spelers. De trainer kiest een aanvoerder en een reserve-aanvoerder.'; }, vraag:'Hoeveel manieren?' },
              { k:[3, 4], n:[10, 10], plek:'cijfer', zin:function(n, k){ return 'Een code bestaat uit ' + k + ' cijfers die allemaal verschillend zijn.'; }, vraag:'Hoeveel codes?' },
              { k:[4], n:[10, 20], lab:['1e prijs', '2e prijs', '3e prijs', '4e prijs'], zin:function(n){ return 'Bij een loterij in de klas doen ' + n + ' leerlingen mee. Er zijn vier verschillende prijzen en iedereen kan maar één prijs winnen.'; }, vraag:'Hoeveel manieren om de prijzen te verdelen?' } ]);
            var n = R.heel(sc.n[0], sc.n[1]), k = R.kies(sc.k), lab = sc.lab, i;
            if (!lab){ lab = []; for (i = 0; i < k; i++) lab.push(sc.plek + ' ' + (i + 1)); }
            var P = perm(n, k), vol = []; for (i = 0; i < k; i++) vol.push(String(n - i));
            var bl = function(m){ return vakjes(lab, m >= 2 ? vol : m >= 1 ? [vol[0]] : [], { uit:m >= 3 ? T(P) : null, aria:k + ' plekken' }); };
            return af({ vraag:sc.vraag, context:sc.zin(n, k), beeld:bl, stappen:[
              S('Hoeveel keuzes zijn er voor de eerste plek (' + lab[0] + ')?', n, 'Iedereen kan nog.'),
              S('En voor de laatste plek (' + lab[k - 1] + ')?', n - k + 1, 'Bij elke plek is er één minder: ' + vol.join(', ') + '.', F(n - k + 1, n, 'Wie al gekozen is, kan niet nog een keer.', n - k, 'Tel nog eens: er zijn er pas ' + (k - 1) + ' gekozen.')),
              S('Het aantal: ' + keten(n, k) + ' =', P, 'Vermenigvuldig de ' + k + ' getallen. Of op de rekenmachine: ' + n + ' nPr ' + k + '.', F(P, Math.pow(n, k), 'Dat is met herhaling. Hier kan niemand twee keer.', comb(n, k), 'Dat is zonder volgorde. Hier telt de volgorde wel.', fac(n), 'Dat is alles op een rij. Je hebt maar ' + k + ' plekken.')) ] });
          } }
      ] },

    /* ================= tellen zonder volgorde ================= */
    { groep:{ id:'wva-telz', niveau:'vwo', domein:'statistiek', naam:'Tellen: zonder volgorde',
        uit:'Combinaties en de binomiaalcoëfficiënt (n boven k), rijtjes met twee soorten, routes in een rooster, en kiezen welke telregel past.' },
      doelen:[
        { id:'wva-tel-comb', naam:'Combinaties: een groepje kiezen', kort:'Zonder volgorde: tel eerst met volgorde en deel dan door k!; dat is n boven k',
          uit:'<p>Uit 8 leerlingen kies je er 3 voor een team. Nu telt de <b>volgorde niet</b>: Ali, Bo en Cas is hetzelfde team als Cas, Ali en Bo.</p><p>Met volgorde zijn er 8 · 7 · 6 = 336 rijtjes. Maar elk team komt daarin <b>3! = 6 keer</b> voor, in alle volgordes. Dus zijn er 336 : 6 = <b>56</b> teams.</p><p>Dit getal heet <b>8 boven 3</b>: een 8 boven een 3, tussen haakjes. Op de rekenmachine: <b>8 nCr 3</b>.</p>',
          wanneer:'je een groepje kiest en de volgorde er niet toe doet.',
          maak:function(R){
            var sc = R.kies([
              function(){ var n = R.heel(6, 12), k = R.heel(2, 4); return { n:n, k:k, zin:'Uit ' + n + ' leerlingen kies je er ' + k + ' voor een team. Alle teamleden zijn gelijk.', vraag:'Hoeveel teams?' }; },
              function(){ var n = R.heel(6, 10), k = R.heel(3, Math.min(5, n - 2)); return { n:n, k:k, zin:'Op een toets staan ' + n + ' vragen. Je moet er ' + k + ' kiezen om te maken.', vraag:'Hoeveel keuzes?' }; },
              function(){ var n = R.heel(6, 12), k = R.heel(2, 4); return { n:n, k:k, zin:'Bij een pizzeria kies je ' + k + ' verschillende toppings uit ' + n + ' toppings.', vraag:'Hoeveel verschillende pizza\'s?' }; },
              function(){ var n = R.heel(5, 20); return { n:n, k:2, zin:n + ' mensen geven elkaar allemaal één keer een hand.', vraag:'Hoeveel handen?' }; },
              function(){ var n = R.heel(6, 12), k = R.heel(2, 4); return { n:n, k:k, zin:'In een zak zitten ' + n + ' knikkers, elk met een andere kleur. Je pakt er in één keer ' + k + ' uit.', vraag:'Hoeveel verschillende groepjes?' }; } ])();
            var n = sc.n, k = sc.k, P = perm(n, k), C = comb(n, k);
            return af({ vraag:sc.vraag, context:sc.zin, stappen:[
              S('Met volgorde zou het zijn: ' + keten(n, k) + ' =', P, 'Vermenigvuldig ' + k + ' getallen, te beginnen bij ' + n + '.'),
              S('Elk groepje tel je dan meer keer mee, in alle volgordes. Dat is ' + k + '! =', fac(k), keten(k, k) + '.'),
              S('Zonder volgorde: ' + T(P) + ' : ' + fac(k) + ' =', C, 'Dat is ' + boven(n, k) + '. Op de rekenmachine: ' + n + ' nCr ' + k + '.', F(C, P, 'Dat is met volgorde. Deel nog door ' + k + '!.')) ] });
          } },
        { id:'wva-tel-rijtje', naam:'Rijtjes met twee soorten', kort:'Een rijtje van n met precies k keer de ene soort: kies de k plekken, dat zijn n boven k rijtjes',
          uit:'<p>Je gooit 6 keer een munt. Hoeveel rijtjes hebben <b>precies 2 keer kop</b>? Bijvoorbeeld KMMKMM of MMMMKK.</p><p>Je hoeft alleen te kiezen <b>op welke 2 van de 6 plekken</b> een K komt. De andere plekken krijgen een M. Dat kan op <b>(6 boven 2) = 15</b> manieren.</p><p>Dit heet de <b>binomiaalcoëfficiënt</b>. Je hebt hem straks nodig bij de binomiale verdeling.</p>',
          wanneer:'een rijtje uit twee soorten bestaat, zoals kop en munt of goed en fout.',
          maak:function(R){
            var sc = R.kies([
              { n:[4, 10], L:['K', 'M'], zin:function(n){ return 'Je gooit ' + n + ' keer met een munt. Je schrijft K (kop) of M (munt) op een rij.'; }, vraag:function(k){ return 'Hoeveel rijtjes met precies ' + k + ' keer K?'; }, plek:'worp' },
              { n:[5, 10], L:['G', 'F'], zin:function(n){ return 'Een toets heeft ' + n + ' vragen. Elke vraag is goed (G) of fout (F).'; }, vraag:function(k){ return 'Hoeveel rijtjes met precies ' + k + ' goed?'; }, plek:'vraag' },
              { n:[5, 9], L:['A', 'B'], zin:function(n, k){ return 'Je maakt rijtjes van ' + n + ' letters: ' + k + ' keer A en ' + (n - k) + ' keer B.'; }, vraag:function(){ return 'Hoeveel rijtjes?'; }, plek:'letter' },
              { n:[4, 10], L:['R', 'M'], zin:function(n){ return 'Een basketballer neemt ' + n + ' vrije worpen. Elke worp is raak (R) of mis (M).'; }, vraag:function(k){ return 'Hoeveel rijtjes met precies ' + k + ' keer raak?'; }, plek:'worp' } ]);
            var n = R.heel(sc.n[0], sc.n[1]), k = R.heel(2, n - 2), C = comb(n, k), L0 = sc.L[0], L1 = sc.L[1];
            var vb = []; for (var i = 0; i < n; i++) vb.push(i < k ? L0 : L1); vb = R.hussel(vb);
            return af({ vraag:sc.vraag(k), context:sc.zin(n, k) + ' Een voorbeeld van zo\'n rijtje: ' + vb.join('') + '.', beeld:function(){ return rijtje(vb, L0); }, stappen:[
              S('Hoeveel plekken heeft een rijtje?', n, 'Eén plek per ' + sc.plek + '.'),
              S('Op hoeveel van die plekken komt een ' + L0 + '?', k, 'Lees het af in de vraag.', F(k, n - k, 'Dat zijn de plekken met een ' + L1 + '. Neem de ' + L0 + '.')),
              S('Kies die ' + k + ' plekken uit ' + n + ': ' + boven(n, k) + ' =', C, 'Op de rekenmachine: ' + n + ' nCr ' + k + '. De andere plekken krijgen een ' + L1 + '.', F(C, Math.pow(2, n), 'Dat zijn alle rijtjes. Je wilt alleen die met precies ' + k + ' keer ' + L0 + '.', perm(n, k), 'Zo tel je elke keuze van plekken meer keer. Deel nog door ' + k + '!.')) ] });
          } },
        { id:'wva-tel-rooster', naam:'Routes in een rooster', kort:'Een route is een rijtje van stappen naar rechts en omhoog: kies welke stappen omhoog gaan; via een punt vermenigvuldig je',
          uit:'<p>In een rooster loop je van A naar B, alleen <b>naar rechts</b> (R) of <b>omhoog</b> (O). Moet je 4 naar rechts en 3 omhoog, dan is elke route een rijtje van 7 letters met 3 keer O.</p><p>Kies welke 3 van de 7 stappen omhoog gaan: <b>(7 boven 3) = 35</b> routes.</p><p>Moet je <b>via een punt P</b>, dan tel je de routes van A naar P en van P naar B. Elke route naar P kun je combineren met elke route vanaf P: <b>vermenigvuldig</b> ze.</p>',
          wanneer:'je het aantal kortste routes in een rooster of stratenplan zoekt.',
          maak:function(R){
            var m = R.heel(3, 6), h = R.heel(2, 5), via = R.heel(0, 1) === 1, P, st, vraag, i;
            function route(r, o){ var l = []; for (i = 0; i < r; i++) l.push('R'); for (i = 0; i < o; i++) l.push('O'); return R.hussel(l); }
            if (via){ P = [R.heel(1, m - 1), R.heel(1, h - 1)]; }
            var r1 = via ? route(P[0], P[1]) : route(m, h), r2 = via ? route(m - P[0], h - P[1]) : [];
            var ctx = 'Het rooster is ' + m + ' hokjes breed en ' + h + ' hokjes hoog. Je loopt over de lijnen van A naar B en gaat alleen naar rechts of omhoog.' + (via ? ' Je moet via punt P.' : '');
            var leeg = rooster(m, h, { P:P });
            if (!via){
              var C = comb(m + h, h);
              vraag = 'Hoeveel routes van A naar B?';
              st = [
                S('Hoeveel stappen ga je naar rechts?', m, 'Tel de hokjes van A naar B in de breedte.'),
                S('Hoeveel stappen ga je omhoog?', h, 'Tel de hokjes in de hoogte.'),
                S('Een route is een rijtje van ' + (m + h) + ' stappen. Kies welke ' + h + ' omhoog gaan: ' + boven(m + h, h) + ' =', C, 'Op de rekenmachine: ' + (m + h) + ' nCr ' + h + '.', F(C, m * h, 'Je deed rechts keer omhoog. Een route is een rijtje: kies de plekken van de stappen omhoog.', Math.pow(2, m + h), 'Dat zijn alle rijtjes van ' + (m + h) + ' stappen. Er moeten er precies ' + h + ' omhoog gaan.')) ];
              return af({ vraag:vraag, context:ctx, zelfBeeld:leeg, beeld:function(n){ return rooster(m, h, { route:n >= 3 ? r1 : null, aria:'rooster van ' + m + ' bij ' + h + ' hokjes' }); }, stappen:st });
            }
            var a1 = P[0], a2 = P[1], b1 = m - P[0], b2 = h - P[1], c1 = comb(a1 + a2, a2), c2 = comb(b1 + b2, b2);
            vraag = 'Hoeveel routes van A naar B via P?';
            st = [
              S('Het aantal routes van A naar P:', c1, 'Van A naar P ga je ' + a1 + ' naar rechts en ' + a2 + ' omhoog: ' + boven(a1 + a2, a2) + '.', F(c1, a1 * a2, 'Kies welke ' + a2 + ' van de ' + (a1 + a2) + ' stappen omhoog gaan.')),
              S('Het aantal routes van P naar B:', c2, 'Van P naar B ga je ' + b1 + ' naar rechts en ' + b2 + ' omhoog: ' + boven(b1 + b2, b2) + '.', F(c2, b1 * b2, 'Kies welke ' + b2 + ' van de ' + (b1 + b2) + ' stappen omhoog gaan.')),
              S('Via P: ' + c1 + ' ' + X + ' ' + c2 + ' =', c1 * c2, 'Elke route naar P past bij elke route vanaf P.', F(c1 * c2, c1 + c2, 'Je telde op. Elke route naar P kun je combineren met elke route vanaf P: vermenigvuldig.', comb(m + h, h), 'Dat zijn alle routes van A naar B. Ze moeten via P.')) ];
            return af({ vraag:vraag, context:ctx, zelfBeeld:leeg, beeld:function(n){ return rooster(m, h, { P:P, route:n >= 2 ? r1.concat(r2) : n >= 1 ? r1 : null, aria:'rooster met punt P' }); }, stappen:st });
          } },
        { id:'wva-tel-kies', naam:'Kies de juiste telregel', kort:'Telt de volgorde? Mag hetzelfde vaker? Dan n tot de macht k, n · (n − 1) · … of n boven k',
          uit:'<p>Stel jezelf twee vragen. <b>Telt de volgorde?</b> Verwissel er twee: krijg je iets anders? En <b>mag hetzelfde vaker voorkomen?</b></p><p>Volgorde telt en herhaling mag: <b>n<sup>k</sup></b>. Volgorde telt en geen herhaling: <b>n · (n − 1) · …</b> met k factoren (nPr).</p><p>Volgorde telt niet, je kiest een groepje: <b>(n boven k)</b> (nCr).</p>',
          wanneer:'je bij een telvraag niet meteen weet welke regel past.',
          maak:function(R){
            var s = R.kies([
              function(){ var k = R.heel(3, 5); return { s:'h', n:10, k:k, zin:'Een pincode bestaat uit ' + k + ' cijfers. Een cijfer mag vaker voorkomen.', vraag:'Hoeveel pincodes?' }; },
              function(){ var k = R.heel(2, 4); return { s:'h', n:6, k:k, zin:'Je gooit ' + k + ' keer met een dobbelsteen en schrijft de ogen op een rij.', vraag:'Hoeveel rijtjes?' }; },
              function(){ var k = R.heel(4, 6), n = R.kies([3, 4]); return { s:'h', n:n, k:k, zin:'Een toets heeft ' + k + ' meerkeuzevragen met elk ' + n + ' antwoorden. Je kruist bij elke vraag één antwoord aan.', vraag:'Op hoeveel manieren?' }; },
              function(){ var n = R.heel(6, 12); return { s:'p', n:n, k:3, zin:'Bij een wedstrijd doen ' + n + ' lopers mee. Er is goud, zilver en brons.', vraag:'Hoeveel uitslagen voor het podium?' }; },
              function(){ var n = R.heel(7, 12); return { s:'p', n:n, k:3, zin:'Een club met ' + n + ' leden kiest een voorzitter, een secretaris en een penningmeester. Niemand krijgt twee functies.', vraag:'Hoeveel manieren?' }; },
              function(){ var k = R.heel(3, 4); return { s:'p', n:10, k:k, zin:'Een code bestaat uit ' + k + ' cijfers die allemaal verschillend zijn.', vraag:'Hoeveel codes?' }; },
              function(){ var n = R.heel(8, 15), k = R.heel(3, 5); return { s:'c', n:n, k:k, zin:'Uit ' + n + ' leerlingen kies je er ' + k + ' voor een team. Alle teamleden zijn gelijk.', vraag:'Hoeveel teams?' }; },
              function(){ var n = R.heel(5, 15); return { s:'c', n:n, k:2, zin:n + ' mensen geven elkaar allemaal één keer een hand.', vraag:'Hoeveel handen?' }; },
              function(){ var n = R.heel(8, 14), k = R.heel(2, 4); return { s:'c', n:n, k:k, zin:'Een pizzeria heeft ' + n + ' toppings. Je kiest er ' + k + ', allemaal verschillend.', vraag:'Hoeveel verschillende pizza\'s?' }; } ])();
            var n = s.n, k = s.k, opt = [n + '^' + k + ' (met herhaling)', keten(n, k) + ' (zonder herhaling)', boven(n, k) + ' (zonder volgorde)'];
            var goed = s.s === 'h' ? 0 : s.s === 'p' ? 1 : 2, uit = s.s === 'h' ? Math.pow(n, k) : s.s === 'p' ? perm(n, k) : comb(n, k);
            var hv = { h:'Verwissel twee plekken in het rijtje: dan krijg je een ander rijtje. De volgorde telt.', p:'Verwissel er twee: dan krijgt iemand anders een andere plek. De volgorde telt.', c:'Verwissel er twee: het groepje blijft hetzelfde. De volgorde telt niet.' }[s.s];
            var hr = { h:'Hetzelfde mag vaker voorkomen: elke plek heeft weer ' + n + ' keuzes.', p:'De volgorde telt, maar niemand kan twee keer: elke plek is er één minder.', c:'Het gaat om een groepje, de volgorde telt niet: (n boven k).' }[s.s];
            var hu = { h:n + '^' + k + ': ' + n + ' tot de macht ' + k + '.', p:'Vermenigvuldig ' + keten(n, k) + ', of ' + n + ' nPr ' + k + '.', c:'Op de rekenmachine: ' + n + ' nCr ' + k + '.' }[s.s];
            return af({ vraag:s.vraag, context:s.zin, stappen:[
              K(R, 'Telt de volgorde?', s.s === 'c' ? 'nee' : 'ja', ['ja', 'nee'], hv, { orde:['ja', 'nee'] }),
              K(R, 'Welke telregel past?', opt[goed], opt, hr, { orde:opt }),
              S('Reken uit:', uit, hu, F(uit, Math.pow(n, k), 'Dat is met herhaling.', perm(n, k), 'Dat is met volgorde, zonder herhaling.', comb(n, k), 'Dat is zonder volgorde.')) ] });
          } }
      ] },

    /* ================= kansregels ================= */
    { groep:{ id:'wva-kans', niveau:'vwo', domein:'statistiek', naam:'Kansregels',
        uit:'De somregel (of), de productregel (en), de complementregel (minstens één), kiezen tussen rechtstreeks en via het complement, en de voorwaardelijke kans met een kruistabel. Kansbomen staan bij havo.' },
      doelen:[
        { id:'wva-kans-som', naam:'De somregel: of', kort:'P(A of B) = P(A) + P(B) als A en B niet tegelijk kunnen; anders trek je P(A en B) eraf',
          uit:'<p>Bij een rad is de kans op rood 0,25 en op blauw 0,4. De wijzer kan niet op rood én blauw staan: de gebeurtenissen <b>sluiten elkaar uit</b>. Dan is P(rood of blauw) = 0,25 + 0,4 = <b>0,65</b>.</p><p>Kunnen A en B <b>wel tegelijk</b>, dan tel je de overlap dubbel. Trek die er één keer af: <b>P(A of B) = P(A) + P(B) − P(A en B)</b>.</p><p>Voorbeeld met een kaartspel: P(harten of heer) = 13/52 + 4/52 − 1/52 = 16/52, want de hartenheer telde je twee keer.</p>',
          wanneer:'je de kans zoekt dat het ene of het andere gebeurt.',
          maak:function(R){
            var soort = R.kies(['rad', 'dobbel', 'kaart']);
            if (soort === 'rad'){
              var kl = ['rood', 'blauw', 'geel', 'groen'], u;
              do { u = [R.heel(2, 8), R.heel(2, 8), R.heel(2, 8)]; u.push(20 - u[0] - u[1] - u[2]); } while (u[3] < 2);
              var ij = R.hussel([0, 1, 2, 3]).slice(0, 2).sort(), p1 = u[ij[0]] / 20, p2 = u[ij[1]] / 20, c1 = kl[ij[0]], c2 = kl[ij[1]];
              return af({ vraag:'P(' + c1 + ' of ' + c2 + ')?', context:'Bij een rad zijn de kansen: ' + kl.map(function(c, i){ return c + ' ' + T(u[i] / 20); }).join(', ') + '. Je draait één keer.', stappen:[
                K(R, 'Kan het rad op ' + c1 + ' en ' + c2 + ' tegelijk uitkomen?', 'nee', ['ja', 'nee'], 'De wijzer staat altijd op één kleur.', { orde:['ja', 'nee'] }),
                S('Ze sluiten elkaar uit. P(' + c1 + ' of ' + c2 + ') = ' + T(p1) + ' + ' + T(p2) + ' =', rnd(p1 + p2, 4), 'Tel de twee kansen op.', F(rnd(p1 + p2, 4), rnd(p1 * p2, 4), 'Bij "of" tel je op. Vermenigvuldigen doe je bij "en".')) ] });
            }
            var A, B, tot, nA, nB, nAB, ov, zin;
            if (soort === 'dobbel'){
              var SETS = [{ n:'een even getal', s:[2, 4, 6] }, { n:'een oneven getal', s:[1, 3, 5] }, { n:'meer dan 4 ogen', s:[5, 6] }, { n:'meer dan 3 ogen', s:[4, 5, 6] }, { n:'minder dan 3 ogen', s:[1, 2] }, { n:'3 of 6 ogen', s:[3, 6] }, { n:'minder dan 4 ogen', s:[1, 2, 3] }];
              var ov2;
              do { A = R.kies(SETS); B = R.kies(SETS); ov2 = A.s.filter(function(x){ return B.s.indexOf(x) >= 0; }); } while (A === B || !ov2.length || ov2.length === A.s.length || ov2.length === B.s.length);
              tot = 6; nA = A.s.length; nB = B.s.length; nAB = ov2.length; ov = ov2.join(' en ');
              zin = 'Je gooit één keer met een dobbelsteen. A: je gooit ' + A.n + '. B: je gooit ' + B.n + '. Geef je antwoord als breuk.';
              A = { t:A.n, l:'A hoort bij ' + A.s.join(', ') + '.' }; B = { t:B.n, l:'B hoort bij ' + B.s.join(', ') + '.' };
              ov = 'Bij allebei hoort: ' + ov + '.';
            } else {
              var kleur = R.kies(['harten', 'ruiten', 'klaveren', 'schoppen']), rang = R.kies(['heer', 'vrouw', 'boer', 'aas']), rood = R.kies(['rode', 'zwarte']);
              var KC = [
                { a:'een ' + kleur + 'kaart', na:13, b:'een ' + rang, nb:4, nab:1, ov:'Alleen de ' + kleur + rang + ' is allebei.' },
                { a:'een ' + rood + ' kaart', na:26, b:'een ' + rang, nb:4, nab:2, ov:'De ' + (rood === 'rode' ? 'harten' + rang + ' en de ruiten' + rang : 'klaveren' + rang + ' en de schoppen' + rang) + ' zijn allebei.' },
                { a:'een plaatje (boer, vrouw of heer)', na:12, b:'een ' + kleur + 'kaart', nb:13, nab:3, ov:'De ' + kleur + 'boer, ' + kleur + 'vrouw en ' + kleur + 'heer zijn allebei.' } ];
              var kc = R.kies(KC);
              tot = 52; nA = kc.na; nB = kc.nb; nAB = kc.nab;
              zin = 'Je trekt één kaart uit een spel van 52 kaarten. A: de kaart is ' + kc.a + '. B: de kaart is ' + kc.b + '. Geef je antwoord als breuk.';
              A = { t:kc.a, l:'Er zijn ' + nA + ' kaarten die ' + kc.a.replace(/^een /, '') + ' zijn.' }; B = { t:kc.b, l:'Er zijn ' + nB + ' kaarten die ' + kc.b.replace(/^een /, '') + ' zijn.' }; ov = kc.ov;
              A.l = nA === 26 ? 'De helft van de kaarten: 26.' : nA === 12 ? 'Per kleur 3 plaatjes, 4 kleuren: 12.' : 'Van elke kleur zijn er 13 kaarten.';
              B.l = nB === 4 ? 'Er is er één van elke kleur: 4.' : 'Van elke kleur zijn er 13 kaarten.';
            }
            var nOf = nA + nB - nAB;
            return af({ vraag:'P(A of B)?', context:zin, antwoord:brAnt(nOf, tot), controle:kansC(nOf, tot), invoer:'tekst', stappen:[
              K(R, 'Kunnen A en B tegelijk gebeuren?', 'ja', ['ja', 'nee'], ov, { orde:['ja', 'nee'] }),
              kansStap('P(A) =', nA, tot, A.l + ' Deel door ' + tot + '.'),
              kansStap('P(B) =', nB, tot, B.l + ' Deel door ' + tot + '.'),
              kansStap('P(A en B) =', nAB, tot, ov),
              kansStap('P(A of B) = P(A) + P(B) ' + MIN + ' P(A en B) =', nOf, tot, nA + ' + ' + nB + ' ' + MIN + ' ' + nAB + ' = ' + nOf + ', en de noemer blijft ' + tot + '.', F(brAnt(nOf, tot), br(nA + nB, tot), 'Je telde de overlap dubbel. Trek P(A en B) eraf.')) ] });
          } },
        { id:'wva-kans-prod', naam:'De productregel: en', kort:'Bij onafhankelijke gebeurtenissen is P(A en B) = P(A) · P(B)',
          uit:'<p>Twee gebeurtenissen zijn <b>onafhankelijk</b> als de ene geen invloed heeft op de andere. Tim scoort een strafschop met kans 0,7 en Sara met kans 0,8, los van elkaar.</p><p>Dan geldt de <b>productregel</b>: P(Tim scoort en Sara scoort) = 0,7 · 0,8 = <b>0,56</b>.</p><p>Wil je dat iets <b>niet</b> gebeurt, reken dan eerst die kans uit: P(Sara mist) = 1 − 0,8 = 0,2. Dus P(Tim scoort en Sara mist) = 0,7 · 0,2 = 0,14.</p>',
          wanneer:'je de kans zoekt dat twee dingen allebei gebeuren, die los van elkaar staan.',
          maak:function(R){
            var sc = R.kies([
              { zin:function(a, b){ return 'Tim scoort een strafschop met kans ' + a + '. Sara scoort met kans ' + b + '. Ze nemen elk één strafschop.'; }, A:['Tim scoort', 'Tim mist'], B:['Sara scoort', 'Sara mist'] },
              { zin:function(a, b){ return 'De bus is op tijd met kans ' + a + '. De trein is op tijd met kans ' + b + '. Ze rijden los van elkaar.'; }, A:['bus op tijd', 'bus te laat'], B:['trein op tijd', 'trein te laat'] },
              { zin:function(a, b){ return 'Een tulpenbol komt uit met kans ' + a + '. Een narcisbol komt uit met kans ' + b + '. Je plant van elk één.'; }, A:['tulp komt uit', 'tulp komt niet uit'], B:['narcis komt uit', 'narcis komt niet uit'] },
              { zin:function(a, b){ return 'Lisa haalt haar theorie-examen met kans ' + a + '. Haar zwemdiploma haalt ze met kans ' + b + '. Het een heeft niets met het ander te maken.'; }, A:['theorie gehaald', 'theorie niet gehaald'], B:['zwemdiploma gehaald', 'zwemdiploma niet gehaald'] } ]);
            var ua = R.heel(10, 19), ub = R.heel(10, 19), a = ua / 20, b = ub / 20, wa = R.heel(0, 1), wb = R.heel(0, 1);
            var xa = wa ? rnd(1 - a, 4) : a, xb = wb ? rnd(1 - b, 4) : b, prod = rnd(xa * xb, 6), st = [
              K(R, 'Hangen de twee van elkaar af?', 'nee, ze zijn onafhankelijk', ['ja, ze hangen van elkaar af', 'nee, ze zijn onafhankelijk'], 'Heeft het ene invloed op het andere? Lees het verhaal nog eens.', { orde:['ja, ze hangen van elkaar af', 'nee, ze zijn onafhankelijk'] }) ];
            if (wa) st.push(S('P(' + sc.A[1] + ') = 1 ' + MIN + ' ' + T(a) + ' =', xa, 'Niet gebeuren is 1 min de kans dat het wel gebeurt.'));
            if (wb) st.push(S('P(' + sc.B[1] + ') = 1 ' + MIN + ' ' + T(b) + ' =', xb, 'Niet gebeuren is 1 min de kans dat het wel gebeurt.'));
            var naam = sc.A[wa] + ' en ' + sc.B[wb];
            st.push(S('P(' + naam + ') = ' + T(xa) + ' ' + X + ' ' + T(xb) + ' =', prod, 'Ze zijn onafhankelijk: vermenigvuldig de twee kansen.', F(prod, rnd(xa + xb, 4), 'Je telde op. Bij "en" met onafhankelijke kansen vermenigvuldig je.', rnd(a * b, 6), 'Dat is de kans dat ze allebei wel gebeuren. Kijk welke juist niet moet gebeuren.')));
            return af({ vraag:'P(' + naam + ')?', context:sc.zin(T(a), T(b)), stappen:st });
          } },
        { id:'wva-kans-compl', naam:'De complementregel: minstens één', kort:'P(minstens één keer) = 1 − P(geen enkele keer)',
          uit:'<p>Het <b>complement</b> van een gebeurtenis is: het gebeurt niet. Samen is dat altijd 1, dus <b>P(A) = 1 − P(niet A)</b>.</p><p>Handig bij <b>minstens één</b>. Het tegendeel daarvan is <b>geen enkele keer</b>, en die kans is makkelijk: één product.</p><p>Voorbeeld: 4 keer gooien met een dobbelsteen. P(geen zes) = (5/6)<sup>4</sup> ≈ 0,4823. Dus P(minstens één zes) = 1 − 0,4823 ≈ <b>0,518</b>.</p>',
          wanneer:'er "minstens één" in de vraag staat.',
          maak:function(R){
            var sc = R.kies([
              { p:[0.1, 0.15, 0.2, 0.25, 0.3], n:[2, 6], zin:function(p, n){ return 'Een basketballer gooit mis met kans ' + T(p) + '. Hij neemt ' + n + ' vrije worpen.'; }, minst:'minstens één keer mis', geen:'geen enkele keer mis', een:'precies één keer mis', alle:'elke keer mis', niet:'De kans op raak bij één worp' },
              { p:[0.02, 0.05, 0.1, 0.15], n:[3, 10], zin:function(p, n){ return 'Een lamp gaat binnen een jaar kapot met kans ' + T(p) + '. Je hebt ' + n + ' lampen, die los van elkaar kapotgaan.'; }, minst:'minstens één lamp kapot', geen:'geen enkele lamp kapot', een:'precies één lamp kapot', alle:'alle lampen kapot', niet:'De kans dat één lamp heel blijft' },
              { p:[0.1, 0.15, 0.2, 0.25], n:[2, 6], zin:function(p, n){ return 'Een vlucht heeft vertraging met kans ' + T(p) + '. Je maakt ' + n + ' vluchten.'; }, minst:'minstens één keer vertraging', geen:'geen enkele keer vertraging', een:'precies één keer vertraging', alle:'elke keer vertraging', niet:'De kans dat één vlucht op tijd is' },
              { dob:true, n:[2, 6], zin:function(p, n){ return 'Je gooit ' + n + ' keer met een dobbelsteen.'; }, minst:'minstens één zes', geen:'geen enkele zes', een:'precies één zes', alle:'alleen maar zessen', niet:'geen zes' } ]);
            var p, q, n, qn, d4, uit;
            do { p = sc.dob ? 1 / 6 : R.kies(sc.p); q = sc.dob ? 5 / 6 : rnd(1 - p, 4); n = R.heel(sc.n[0], sc.n[1]); qn = Math.pow(q, n); d4 = rnd(qn, 4); uit = 1 - qn; }
            while (grens(uit, 3) || grens(qn, 4) || rnd(1 - d4, 3) !== rnd(uit, 3));
            var qT = sc.dob ? '(5/6)' : T(q), st = [
              K(R, 'Wat is het tegendeel van "' + sc.minst + '"?', sc.geen, [sc.een, sc.alle], 'Minstens één is: één, twee, drie, … keer. Het enige wat overblijft is nul keer.') ];
            if (sc.dob) st.push(kansStap('De kans op geen zes bij één worp:', 5, 6, '5 van de 6 kanten zijn geen zes.'));
            else st.push(S(sc.niet + ': 1 ' + MIN + ' ' + T(p) + ' =', q, '1 min de kans dat het wel gebeurt.'));
            st.push(SA('P(' + sc.geen + ') = ' + qT + '<sup>' + n + '</sup> ≈ (4 decimalen)', qn, 4, 'Productregel: ' + n + ' keer ' + qT + ' met elkaar vermenigvuldigen.', F(rnd(qn, 4), rnd(q * n, 4), 'Je deed keer ' + n + '. Het is een macht: ' + qT + ' tot de ' + n + 'e.')));
            st.push(SA('P(' + sc.minst + ') = 1 ' + MIN + ' ' + T(d4) + ' ≈ (3 decimalen)', uit, 3, 'De complementregel: 1 min de kans op het tegendeel.', F(rnd(uit, 3), rnd(qn, 3), 'Dat is de kans op het tegendeel. Doe nog 1 min.')));
            return af({ vraag:'P(' + sc.minst + ')?', context:sc.zin(p, n) + ' Rond af op 3 decimalen.', stappen:st });
          } },
        { id:'wva-kans-kies', naam:'Kies de handigste manier', kort:'Minstens één of hoogstens n − 1: via het complement; geen enkele of allemaal: rechtstreeks',
          uit:'<p>Kijk eerst hoeveel takken er bij de vraag horen.</p><p><b>Geen enkele keer</b> of <b>elke keer</b>: dat is één tak. Reken die <b>rechtstreeks</b> uit met de productregel.</p><p><b>Minstens één keer</b> of <b>hoogstens n − 1 keer</b>: dat zijn heel veel takken. Het tegendeel is maar één tak. Reken dus <b>via het complement</b>: 1 min de kans op het tegendeel.</p>',
          wanneer:'je een kans zoekt bij een paar keer hetzelfde proberen.',
          maak:function(R){
            var p, q, n, t, w, d4, base;
            var sc = R.kies([
              { zin:function(p, n){ return 'Een speler raakt de roos met kans ' + T(p) + '. Hij gooit ' + n + ' pijlen.'; }, niet:'mis',
                naam:function(t, n){ return { minst:'minstens één keer raak', hoogst:'hoogstens ' + (n - 1) + ' keer raak', alle:'elke keer raak', geen:'geen enkele keer raak' }[t]; } },
              { zin:function(p, n){ return 'Een zaadje kiemt met kans ' + T(p) + '. Je plant ' + n + ' zaadjes.'; }, niet:'kiemt niet',
                naam:function(t, n){ return { minst:'minstens één zaadje kiemt', hoogst:'hoogstens ' + (n - 1) + ' zaadjes kiemen', alle:'alle zaadjes kiemen', geen:'geen enkel zaadje kiemt' }[t]; } },
              { zin:function(p, n){ return 'Je trein is op tijd met kans ' + T(p) + '. Je reist ' + n + ' dagen met de trein.'; }, niet:'te laat',
                naam:function(t, n){ return { minst:'minstens één dag op tijd', hoogst:'hoogstens ' + (n - 1) + ' dagen op tijd', alle:'elke dag op tijd', geen:'geen enkele dag op tijd' }[t]; } } ]);
            do { p = R.kies([0.6, 0.7, 0.75, 0.8, 0.85, 0.9]); q = rnd(1 - p, 4); n = R.heel(3, 6); t = R.kies(['minst', 'hoogst', 'alle', 'geen']);
              base = t === 'minst' || t === 'geen' ? q : p; d4 = rnd(Math.pow(base, n), 4); w = t === 'minst' || t === 'hoogst' ? 1 - Math.pow(base, n) : Math.pow(base, n); }
            while (grens(w, 3) || grens(Math.pow(base, n), 4) || ((t === 'minst' || t === 'hoogst') && rnd(1 - d4, 3) !== rnd(w, 3)));
            var nm = function(x){ return sc.naam(x, n); };
            var opt = ['rechtstreeks met de productregel', 'via het complement'], comp = t === 'minst' || t === 'hoogst';
            var uitleg = comp ? 'Bij "' + nm(t) + '" horen veel takken. Het tegendeel, "' + (t === 'minst' ? nm('geen') : nm('alle')) + '", is maar één tak.' : '"' + nm(t) + '" is maar één tak: reken die rechtstreeks uit.';
            var bT = T(base), st = [K(R, 'Welke manier is hier het handigst?', opt[comp ? 1 : 0], opt, uitleg, { orde:opt, waarom:uitleg })];
            if (comp){
              var tg = t === 'minst' ? nm('geen') : nm('alle');
              if (t === 'minst') st.push(S('De kans op ' + sc.niet + ' bij één keer: 1 ' + MIN + ' ' + T(p) + ' =', q, '1 min de kans dat het wel gebeurt.'));
              st.push(SA('Het tegendeel: P(' + tg + ') = ' + bT + '<sup>' + n + '</sup> ≈ (4 decimalen)', Math.pow(base, n), 4, 'Productregel: ' + n + ' keer ' + bT + ' vermenigvuldigen.'));
              st.push(SA('P(' + nm(t) + ') = 1 ' + MIN + ' ' + T(d4) + ' ≈ (3 decimalen)', w, 3, '1 min de kans op het tegendeel.', F(rnd(w, 3), rnd(Math.pow(base, n), 3), 'Dat is de kans op het tegendeel. Doe nog 1 min.')));
            } else {
              if (t === 'geen') st.push(S('De kans op ' + sc.niet + ' bij één keer: 1 ' + MIN + ' ' + T(p) + ' =', q, '1 min de kans dat het wel gebeurt.'));
              st.push(SA('P(' + nm(t) + ') = ' + bT + '<sup>' + n + '</sup> ≈ (3 decimalen)', w, 3, 'Productregel: ' + n + ' keer ' + bT + ' vermenigvuldigen.', F(rnd(w, 3), rnd(1 - w, 3), 'Dat is het complement. Hier reken je de kans rechtstreeks uit.')));
            }
            return af({ vraag:'P(' + nm(t) + ')?', context:sc.zin(p, n) + ' Kies eerst de handigste manier. Rond af op 3 decimalen.', stappen:st });
          } },
        { id:'wva-kans-kruis', naam:'Voorwaardelijke kans met een kruistabel', kort:'P(A | B): kijk alleen naar de rij of kolom van B en deel door dat totaal',
          uit:'<p>P(A | B) spreek je uit als: de kans op A, <b>gegeven</b> B. Je weet al dat B zo is.</p><p>In een kruistabel kijk je dan <b>alleen naar de rij of kolom van B</b>. P(A | B) = aantal (A en B) : <b>totaal van B</b>.</p><p>Let op: P(A | B) is iets anders dan P(B | A). Deel altijd door het totaal van wat je al weet.</p>',
          wanneer:'je de kans zoekt binnen een groep waarvan je al iets weet.',
          maak:function(R){
            var KR = [
              { wie:'leerlingen', een:'leerling', rij:[['fietst', 'naar school fietst'], ['fietst niet', 'niet naar school fietst']], kol:[['onderbouw', 'in de onderbouw zit'], ['bovenbouw', 'in de bovenbouw zit']] },
              { wie:'leerlingen', een:'leerling', rij:[['sport', 'aan sport doet'], ['sport niet', 'niet aan sport doet']], kol:[['jongen', 'een jongen is'], ['meisje', 'een meisje is']] },
              { wie:'mensen', een:'persoon', rij:[['test positief', 'positief test'], ['test negatief', 'negatief test']], kol:[['ziek', 'de ziekte heeft'], ['niet ziek', 'de ziekte niet heeft']] },
              { wie:'leerlingen', een:'leerling', rij:[['ontbijt', 'elke dag ontbijt'], ['ontbijt niet', 'niet elke dag ontbijt']], kol:[['klas 4', 'in klas 4 zit'], ['klas 5', 'in klas 5 zit']] },
              { wie:'klanten', een:'klant', rij:[['koopt iets', 'iets koopt'], ['koopt niets', 'niets koopt']], kol:[['met kaart', 'een klantenkaart heeft'], ['zonder kaart', 'geen klantenkaart heeft']] } ];
            var c = R.kies(KR), a = [[R.heel(12, 140), R.heel(12, 140)], [R.heel(12, 140), R.heel(12, 140)]];
            var rt = [a[0][0] + a[0][1], a[1][0] + a[1][1]], kt = [a[0][0] + a[1][0], a[0][1] + a[1][1]], tot = rt[0] + rt[1];
            var opRij = R.heel(0, 1) === 1, bi = R.heel(0, 1), ai = R.heel(0, 1);
            var Bc = opRij ? c.rij[bi] : c.kol[bi], Ac = opRij ? c.kol[ai] : c.rij[ai], totB = opRij ? rt[bi] : kt[bi], totA = opRij ? kt[ai] : rt[ai];
            var cel = opRij ? a[bi][ai] : a[ai][bi], celPos = opRij ? [bi + 1, ai + 1] : [ai + 1, bi + 1], totPos = opRij ? [bi + 1, 3] : [3, bi + 1];
            var w = cel / totB, w3 = rnd(w, 3);
            var rijen = [['', c.kol[0][0], c.kol[1][0], 'totaal'], [c.rij[0][0], String(a[0][0]), String(a[0][1]), String(rt[0])], [c.rij[1][0], String(a[1][0]), String(a[1][1]), String(rt[1])], ['totaal', String(kt[0]), String(kt[1]), String(tot)]];
            var bl = function(n){ return tabel(rijen, n >= 2 ? [totPos, celPos] : n >= 1 ? [totPos] : [], { kop:true }); };
            return af({ vraag:'P(' + Ac[0] + ' | ' + Bc[0] + ')?', context:'De kruistabel gaat over ' + tot + ' ' + c.wie + '. Je kiest willekeurig een ' + c.een + ' die ' + Bc[1] + '. Hoe groot is de kans dat deze ' + c.een + ' ' + Ac[1] + '? Rond af op 3 decimalen.',
              beeld:bl, zelfBeeld:bl(0), stappen:[
                S('Je weet al: "' + Bc[0] + '". Hoeveel ' + c.wie + ' zijn dat?', totB, 'Kijk bij "' + Bc[0] + '" naar het totaal.', F(totB, tot, 'Dat zijn alle ' + c.wie + '. Neem alleen het totaal bij "' + Bc[0] + '".')),
                S('Hoeveel van hen vallen ook onder "' + Ac[0] + '"?', cel, 'Het vakje waar "' + Bc[0] + '" en "' + Ac[0] + '" elkaar kruisen.', F(cel, totA, 'Dat is het totaal van "' + Ac[0] + '". Neem alleen het vakje bij "' + Bc[0] + '".')),
                S('P(' + Ac[0] + ' | ' + Bc[0] + ') = ' + cel + ' : ' + totB + ' ≈ (3 decimalen)', [T(w3)].concat(brAnt(cel, totB)), 'Deel door het totaal van wat je al weet: ' + totB + '.', F(T(w3), rnd(cel / tot, 3), 'Je deelde door alle ' + tot + ' ' + c.wie + '. Deel alleen door de ' + totB + ' bij "' + Bc[0] + '".', rnd(cel / totA, 3), 'Je deelde door het totaal van "' + Ac[0] + '". Je weet al "' + Bc[0] + '": deel daardoor.'), { controle:kans3C(cel, totB), getal:true }) ] });
          } }
      ] },

    /* ================= kansverdelingen ================= */
    { groep:{ id:'wva-verd', niveau:'vwo', domein:'statistiek', naam:'Kansverdeling: verwachting en spreiding',
        uit:'De verwachtingswaarde E(X) en de standaardafwijking σ(X) van een kansverdeling in een tabel.' },
      doelen:[
        { id:'wva-verd-ev', naam:'De verwachtingswaarde', kort:'E(X) = de som van x · P(X = x): elke waarde keer zijn kans, alles opgeteld',
          uit:'<p>Een <b>kansverdeling</b> is een tabel met alle waarden van X en hun kansen. Alle kansen samen zijn <b>1</b>.</p><p>De <b>verwachtingswaarde</b> E(X) is wat je op den duur gemiddeld krijgt. Doe elke waarde <b>keer zijn kans</b> en tel alles op.</p><p>Voorbeeld: je wint € 0 met kans 0,7, € 5 met kans 0,2 en € 20 met kans 0,1. E(X) = 0 · 0,7 + 5 · 0,2 + 20 · 0,1 = <b>3</b>. Kost het spel € 3,50, dan is je verwachte winst 3 − 3,50 = −0,50 per spel.</p>',
          wanneer:'je wilt weten wat je bij een spel of kansexperiment gemiddeld krijgt.',
          maak:function(R){
            var kind = R.heel(0, 3) === 0, x, u, mis = R.heel(0, 1) === 1, inzet = !kind && R.heel(0, 1) === 1 ? R.kies([1, 1.5, 2, 2.5, 3]) : 0, i;
            if (kind) x = [0, 1, 2, 3];
            else { x = [0].concat(R.hussel([1, 2, 5, 10, 20]).slice(0, 3)).sort(function(a, b){ return a - b; }); }
            do { u = [R.heel(1, 10), R.heel(1, 8), R.heel(1, 6)]; u.push(20 - u[0] - u[1] - u[2]); } while (u[3] < 1 || (!kind && u[3] > u[2]));
            if (!kind) u = u.slice().sort(function(a, b){ return b - a; });
            var p = u.map(function(v){ return v / 20; }), E1 = rnd(x.reduce(function(s, v, j){ return s + v * p[j]; }, 0), 6), mi = 1 + R.heel(0, 2);
            var last = x.length - 1, prodL = rnd(x[last] * p[last], 6), gemX = rnd(x.reduce(function(s, v){ return s + v; }, 0) / x.length, 6);
            function tb(n){
              var r = [[kind ? 'x' : 'x (euro)'].concat(x.map(String)), ['P(X = x)'].concat(p.map(function(v, j){ return mis && j === mi && n < 1 ? '?' : T(v); }))];
              if (n >= (mis ? 2 : 1)) r.push(['x · P(X = x)'].concat(x.map(function(v, j){ return T(rnd(v * p[j], 6)); })));
              return tabel(r);
            }
            var st = [];
            if (mis) st.push(S('De ontbrekende kans: 1 ' + MIN + ' (' + p.filter(function(v, j){ return j !== mi; }).map(T).join(' + ') + ') =', p[mi], 'Alle kansen samen zijn 1.'));
            st.push(S('Het product bij x = ' + x[last] + ': ' + x[last] + ' ' + X + ' ' + T(p[last]) + ' =', prodL, 'Waarde keer kans.'));
            st.push(S('E(X) = ' + x.map(function(v, j){ return v + ' ' + X + ' ' + T(p[j]); }).join(' + ') + ' =', E1, 'Reken elk product uit en tel ze op.', F(E1, gemX, 'Je nam het gewone gemiddelde van de waarden. Elke waarde telt mee met zijn kans.'), { e:kind ? null : 'euro' }));
            if (inzet) st.push(S('De verwachte winst per spel: ' + T(E1) + ' ' + MIN + ' ' + T(inzet) + ' =', rnd(E1 - inzet, 6), 'Winst is wat je krijgt min wat je inlegt.', F(rnd(E1 - inzet, 6), rnd(inzet - E1, 6), 'Andersom: uitbetaling min inzet.'), { e:'euro' }));
            var ctx = kind ? 'X is het aantal kinderen in een willekeurig gezin in een dorp. De tabel geeft de kansverdeling.' : 'Bij een rad krijg je een bedrag uitbetaald. X is het bedrag in euro. De tabel geeft de kansverdeling.' + (inzet ? ' Een keer draaien kost € ' + T(inzet, { dec:2, vast:true }) + '.' : '');
            return af({ vraag:inzet ? 'De verwachte winst per spel?' : 'E(X)?', context:ctx, beeld:tb, zelfBeeld:tb(0), stappen:st });
          } },
        { id:'wva-verd-sd', naam:'De standaardafwijking van een kansverdeling', kort:'σ(X) = √(som van (x − E(X))² · P(X = x))',
          uit:'<p>De <b>standaardafwijking</b> σ(X) zegt hoe ver de waarden gemiddeld van E(X) af liggen.</p><p>Reken eerst <b>E(X)</b> uit. Doe dan per waarde: (x − E(X))², <b>keer de kans</b>. Tel alles op: dat is de <b>variantie</b>. Neem tot slot de <b>wortel</b>.</p><p>Voorbeeld: X = 0, 2, 4 met kansen 0,25, 0,5, 0,25. E(X) = 2. Variantie = 4 · 0,25 + 0 · 0,5 + 4 · 0,25 = 2. σ(X) = √2 ≈ 1,41.</p>',
          wanneer:'je de spreiding van een kansverdeling wilt weten.',
          maak:function(R){
            var c = R.kies([['het aantal punten dat je bij een spel haalt', 'X is het aantal punten.'], ['het aantal doelpunten van een team in een wedstrijd', 'X is het aantal doelpunten.'], ['het aantal fouten op een bladzijde', 'X is het aantal fouten.'], ['het aantal klanten dat in een minuut binnenkomt', 'X is het aantal klanten.']]);
            var x, u, Ex, v, sd;
            do { x = R.hussel([0, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort(function(a, b){ return a - b; }); u = [R.heel(1, 6), R.heel(1, 6)]; u.push(10 - u[0] - u[1]);
              Ex = rnd(x.reduce(function(s, t, j){ return s + t * u[j] / 10; }, 0), 6); v = rnd(x.reduce(function(s, t, j){ return s + (t - Ex) * (t - Ex) * u[j] / 10; }, 0), 6); sd = Math.sqrt(v); }
            while (u[2] < 1 || Math.abs(Ex - Math.round(Ex)) > 1e-9 || grens(sd, 2) || v === 0);
            var p = u.map(function(t){ return t / 10; }), kw = x.map(function(t){ return (t - Ex) * (t - Ex); });
            function tb(n){ var r = [['x'].concat(x.map(String)), ['P(X = x)'].concat(p.map(T))];
              if (n >= 1) r.push(['(x − E(X))²'].concat(kw.map(String)));
              if (n >= 2) r.push(['(x − E(X))² · P'].concat(kw.map(function(k, j){ return T(rnd(k * p[j], 6)); })));
              return tabel(r); }
            return af({ vraag:'σ(X)?', context:'De tabel geeft de kansverdeling van ' + c[0] + '. ' + c[1] + ' X kan ' + x[0] + ', ' + x[1] + ' of ' + x[2] + ' zijn. Bereken de standaardafwijking. Rond af op 2 decimalen.', beeld:tb, zelfBeeld:tb(0), stappen:[
              S('E(X) = ' + x.map(function(t, j){ return t + ' ' + X + ' ' + T(p[j]); }).join(' + ') + ' =', Ex, 'Waarde keer kans, en alles optellen.'),
              S('De variantie: tel (x ' + MIN + ' ' + T(Ex) + ')² ' + X + ' P(X = x) op. Dat is', v, x.map(function(t, j){ return kw[j] + ' · ' + T(p[j]); }).join(' + ') + '.', F(v, rnd(kw.reduce(function(s, k){ return s + k; }, 0), 6), 'Vergeet niet elk kwadraat keer zijn kans te doen.')),
              SA('σ(X) = √' + T(v) + ' ≈ (2 decimalen)', sd, 2, 'Neem de wortel van de variantie.', F(rnd(sd, 2), v, 'Dat is de variantie. Neem nog de wortel.')) ] });
          } }
      ] },

    /* ================= de binomiale verdeling ================= */
    { groep:{ id:'wva-bin', niveau:'vwo', domein:'statistiek', naam:'De binomiale verdeling',
        uit:'Een kans op precies k successen met de formule, hoogstens en minstens door op te tellen, en de verwachtingswaarde en standaardafwijking van een binomiale verdeling.' },
      doelen:[
        { id:'wva-bin-formule', naam:'P(X = k) met de formule', kort:'P(X = k) = (n boven k) · p^k · (1 − p)^(n − k)',
          uit:'<p>Je doet <b>n keer</b> hetzelfde experiment, steeds onafhankelijk, met elke keer kans <b>p</b> op succes. X is het aantal successen. Dan is X <b>binomiaal verdeeld</b>.</p><p>De kans op één rijtje met k successen is p<sup>k</sup> · (1 − p)<sup>n − k</sup>. Er zijn <b>(n boven k)</b> van zulke rijtjes.</p><p>Dus <b>P(X = k) = (n boven k) · p<sup>k</sup> · (1 − p)<sup>n − k</sup></b>.</p>',
          wanneer:'je de kans zoekt op precies k keer succes bij n keer proberen.',
          maak:function(R){
            var sc = R.kies(BIN), n, k, p, q, C, een, w;
            do { n = R.heel(4, 6); k = R.heel(1, n - 1); p = R.kies(sc.p); q = rnd(1 - p, 4); C = comb(n, k); een = rnd(Math.pow(p, k) * Math.pow(q, n - k), 8); w = C * een; } while (grens(w, 4));
            return af({ vraag:'P(X = ' + k + ')?', context:sc.zin(p, n) + ' X is ' + sc.X + '. Bereken P(X = ' + k + ') met de formule. Rond af op 4 decimalen.', stappen:[
              S(boven(n, k) + ' =', C, 'Het aantal rijtjes met ' + (k === 1 ? 'één succes' : k + ' successen') + '. Rekenmachine: ' + n + ' nCr ' + k + '.'),
              S('De kans op één rijtje: ' + T(p) + '<sup>' + k + '</sup> ' + X + ' ' + T(q) + '<sup>' + (n - k) + '</sup> =', N(een), k + ' keer succes (' + T(p) + ') en ' + (n - k) + ' keer niet (' + T(q) + ').', F(N(een), rnd(Math.pow(p, k), 6), 'Vergeet de ' + (n - k) + ' keer zonder succes niet.'), { controle:getC(een, 4), getal:true }),
              SA('P(X = ' + k + ') = ' + C + ' ' + X + ' ' + N(een) + ' ≈ (4 decimalen)', w, 4, 'Vermenigvuldig met het aantal rijtjes.', F(rnd(w, 4), rnd(een, 4), 'Dat is de kans op één rijtje. Doe nog keer ' + C + '.')) ] });
          } },
        { id:'wva-bin-hoogstens', naam:'Hoogstens en minstens: kansen optellen', kort:'P(X ≤ k) is P(X = 0) + … + P(X = k); minstens doe je met 1 min de rest',
          uit:'<p><b>Hoogstens 2</b> betekent: 0, 1 of 2. Dus P(X ≤ 2) = P(X = 0) + P(X = 1) + P(X = 2). Reken elke kans uit met de formule.</p><p><b>Minstens 2</b> betekent 2, 3, 4, … tot n. Dat zijn veel kansen. Gebruik het complement: <b>P(X ≥ 2) = 1 − P(X ≤ 1)</b>.</p><p>Handig: P(X = 0) = (1 − p)<sup>n</sup> en P(X = 1) = n · p · (1 − p)<sup>n − 1</sup>.</p>',
          wanneer:'er "hoogstens" of "minstens" in de vraag staat.',
          maak:function(R){
            var sc = R.kies(BIN), n, p, q, t, P0, P1, P2, w;
            do { n = R.heel(4, 6); p = R.kies(sc.p); q = rnd(1 - p, 4); t = R.kies(['h1', 'h2', 'm2']);
              P0 = rnd(Math.pow(q, n), 8); P1 = rnd(n * p * Math.pow(q, n - 1), 8); P2 = rnd(comb(n, 2) * p * p * Math.pow(q, n - 2), 8);
              w = t === 'h1' ? P0 + P1 : t === 'h2' ? P0 + P1 + P2 : 1 - P0 - P1; } while (grens(w, 4) || w < 0.001);
            var vr = t === 'h1' ? 'P(X ≤ 1)' : t === 'h2' ? 'P(X ≤ 2)' : 'P(X ≥ 2)', st = [
              S('P(X = 0) = ' + T(q) + '<sup>' + n + '</sup> =', N(P0), 'Geen enkel succes: ' + n + ' keer ' + T(q) + '.', null, { controle:getC(P0, 4), getal:true }),
              S('P(X = 1) = ' + n + ' ' + X + ' ' + T(p) + ' ' + X + ' ' + T(q) + '<sup>' + (n - 1) + '</sup> =', N(P1), 'Er zijn ' + n + ' rijtjes met één succes.', F(N(P1), rnd(p * Math.pow(q, n - 1), 6), 'Dat is één rijtje. Er zijn er ' + n + '.'), { controle:getC(P1, 4), getal:true }) ];
            if (t === 'h2') st.push(S('P(X = 2) = ' + comb(n, 2) + ' ' + X + ' ' + T(p) + '<sup>2</sup> ' + X + ' ' + T(q) + '<sup>' + (n - 2) + '</sup> =', N(P2), boven(n, 2) + ' = ' + comb(n, 2) + ' rijtjes met twee successen.', null, { controle:getC(P2, 4), getal:true }));
            if (t === 'm2') st.push(SA('P(X ≥ 2) = 1 ' + MIN + ' (' + N(P0) + ' + ' + N(P1) + ') ≈ (4 decimalen)', w, 4, 'Minstens 2 is alles behalve 0 en 1.', F(rnd(w, 4), rnd(P0 + P1, 4), 'Dat is P(X ≤ 1). Doe nog 1 min.')));
            else st.push(SA(vr + ' = ' + [P0, P1].concat(t === 'h2' ? [P2] : []).map(N).join(' + ') + ' ≈ (4 decimalen)', w, 4, 'Tel de kansen op.', F(rnd(w, 4), rnd(1 - w, 4), 'Dat is het complement. Hier tel je gewoon op.')));
            var woord = t === 'h1' ? 'hoogstens 1' : t === 'h2' ? 'hoogstens 2' : 'minstens 2';
            return af({ vraag:vr + '?', context:sc.zin(p, n) + ' X is ' + sc.X + '. Bereken de kans op ' + woord + '. Rond af op 4 decimalen.', stappen:st });
          } },
        { id:'wva-bin-ev', naam:'Verwachting en standaardafwijking bij binomiaal', kort:'E(X) = n · p en σ(X) = √(n · p · (1 − p))',
          uit:'<p>Bij een binomiale verdeling hoef je geen tabel te maken. Er zijn twee formules.</p><p>De verwachtingswaarde: <b>E(X) = n · p</b>. Gooi je 100 keer met kans 0,3 op raak, dan verwacht je 30 keer raak.</p><p>De standaardafwijking: <b>σ(X) = √(n · p · (1 − p))</b>. Hier: √(100 · 0,3 · 0,7) = √21 ≈ 4,58.</p>',
          wanneer:'je het gemiddelde en de spreiding van een binomiale verdeling zoekt.',
          maak:function(R){
            var sc = R.kies([
              { zin:function(p, n){ return 'Een basketballer gooit raak met kans ' + T(p) + '. Hij gooit ' + n + ' keer.'; }, X:'het aantal keer raak', p:[0.6, 0.7, 0.75, 0.8] },
              { zin:function(p, n){ return 'Een product is defect met kans ' + T(p) + '. In een partij zitten ' + n + ' producten.'; }, X:'het aantal defecte producten', p:[0.05, 0.1, 0.2, 0.25] },
              { zin:function(p, n){ return 'Je gooit ' + n + ' keer met een munt.'; }, X:'het aantal keer kop', p:[0.5] },
              { zin:function(p, n){ return 'Een zaadje kiemt met kans ' + T(p) + '. Je zaait ' + n + ' zaadjes.'; }, X:'het aantal zaadjes dat kiemt', p:[0.6, 0.7, 0.8, 0.9] } ]);
            var n, p, Ex, v, sd;
            do { n = R.kies([20, 25, 40, 50, 60, 80, 100, 120, 150, 200, 250, 400]); p = R.kies(sc.p); Ex = rnd(n * p, 6); v = rnd(n * p * (1 - p), 6); sd = Math.sqrt(v); } while (grens(sd, 2));
            return af({ vraag:'σ(X)?', context:sc.zin(p, n) + ' X is ' + sc.X + '. Bereken de standaardafwijking van X. Rond af op 2 decimalen.', stappen:[
              S('E(X) = ' + n + ' ' + X + ' ' + T(p) + ' =', Ex, 'n keer p.'),
              S('n ' + X + ' p ' + X + ' (1 ' + MIN + ' p) = ' + n + ' ' + X + ' ' + T(p) + ' ' + X + ' ' + T(rnd(1 - p, 4)) + ' =', v, '1 ' + MIN + ' ' + T(p) + ' = ' + T(rnd(1 - p, 4)) + '.', F(v, rnd(n * p * p, 6), 'De laatste factor is 1 min p.')),
              SA('σ(X) = √' + T(v) + ' ≈ (2 decimalen)', sd, 2, 'Neem de wortel.', F(rnd(sd, 2), v, 'Dat is de variantie. Neem nog de wortel.', rnd(Math.sqrt(Ex), 2), 'Je nam de wortel van n · p. Neem ook (1 ' + MIN + ' p) mee.')) ] });
          } }
      ] },

    /* ================= de normale verdeling ================= */
    { groep:{ id:'wva-norm', niveau:'vwo', domein:'statistiek', naam:'De normale verdeling',
        uit:'De z-waarde, percentages met de vuistregels (68%, 95% en 99,7%), een grens bij een gegeven percentage, en μ en σ terugvinden. Zonder grafische rekenmachine.' },
      doelen:[
        { id:'wva-norm-z', naam:'De z-waarde', kort:'z = (x − μ) : σ: hoeveel standaardafwijkingen x van het gemiddelde ligt',
          uit:'<p>Bij een <b>normale verdeling</b> hoort een klokvorm met in het midden het gemiddelde <b>μ</b>. De standaardafwijking <b>σ</b> zegt hoe breed de klok is.</p><p>De <b>z-waarde</b> zegt hoeveel standaardafwijkingen een waarde x van μ af ligt: <b>z = (x − μ) : σ</b>.</p><p>Voorbeeld: μ = 180 cm, σ = 8 cm. Voor x = 194 is z = 14 : 8 = 1,75. Ligt x onder μ, dan is z negatief.</p>',
          wanneer:'je waarden uit verschillende normale verdelingen wilt vergelijken, of wilt weten hoe bijzonder een waarde is.',
          maak:function(R){
            var o, x, z;
            do { o = normKies(R); x = o.mu + R.heel(-Math.round(2.8 * o.sig), Math.round(2.8 * o.sig)); z = (x - o.mu) / o.sig; } while (x === o.mu || grens(z, 2));
            var c = o.c, d = x - o.mu, z2 = rnd(z, 2);
            return af({ vraag:'De z-waarde van ' + x + ' ' + c.eh + '?', context:c.wat + ' is normaal verdeeld met μ = ' + o.mu + ' ' + c.eh + ' en σ = ' + o.sig + ' ' + c.eh + '. Rond af op 2 decimalen.',
              beeld:function(n){ return normaal(o.mu, o.sig, { streep:n >= 1 ? z : null, streepT:String(x) }); }, stappen:[
                S('x ' + MIN + ' μ = ' + x + ' ' + MIN + ' ' + o.mu + ' =', d, 'Trek het gemiddelde ervan af.', F(d, -d, 'Andersom: x min μ.')),
                SA('z = ' + T(d) + ' : ' + o.sig + ' ≈ (2 decimalen)', z, 2, 'Deel door σ.', F(z2, -z2, 'Let op het teken: ' + x + ' ligt ' + (d < 0 ? 'onder' : 'boven') + ' het gemiddelde.', rnd(d * o.sig, 2), 'Je moet delen door σ, niet vermenigvuldigen.')) ] });
          } },
        { id:'wva-norm-vuist', naam:'De vuistregels: percentages', kort:'Tussen μ − σ en μ + σ ligt 68%, tussen μ − 2σ en μ + 2σ 95%, tussen μ − 3σ en μ + 3σ 99,7%',
          uit:'<p>Bij elke normale verdeling gelden de <b>vuistregels</b>: tussen μ − σ en μ + σ ligt <b>68%</b>, tussen μ − 2σ en μ + 2σ <b>95%</b>, en tussen μ − 3σ en μ + 3σ <b>99,7%</b>.</p><p>Verdeel de klok in stukjes. Van μ tot μ + σ: <b>34%</b>. Van μ + σ tot μ + 2σ: <b>13,5%</b>. Van μ + 2σ tot μ + 3σ: <b>2,35%</b>. Voorbij μ + 3σ: <b>0,15%</b>. Links is het net zo.</p><p>Zoek eerst hoeveel σ de grens van μ af ligt. Tel dan de stukjes op die je nodig hebt.</p>',
          wanneer:'een grens precies 1, 2 of 3 standaardafwijkingen van het gemiddelde ligt.',
          maak:function(R){
            var o = normKies(R), c = o.c, t = R.kies(['tus', 'tus', 'meer', 'minder']), za, zb, aant = R.heel(0, 2) === 0, Nn = R.kies([2000, 4000, 10000]);
            if (t === 'tus'){ do { za = R.heel(-3, 2); zb = R.heel(za + 1, 3); } while (za === -3 && zb === 3); }
            else if (t === 'meer'){ za = R.heel(-3, 3); zb = 4; } else { za = -4; zb = R.heel(-3, 3); }
            var a = o.mu + za * o.sig, b = o.mu + zb * o.sig, pr = opp(za, zb), stuk = stukjes(za, zb).map(T).join(' + ');
            var vraag = t === 'tus' ? 'Hoeveel procent ' + c.tus(a, b) + '?' : t === 'meer' ? 'Hoeveel procent ' + c.meer + ' ' + a + ' ' + c.eh + '?' : 'Hoeveel procent ' + c.minder + ' ' + b + ' ' + c.eh + '?';
            function kStap(v, k){ return S('Hoeveel σ ligt ' + v + ' van μ af? (Links van μ: met een min ervoor.)', k, v + ' ' + MIN + ' ' + o.mu + ' = ' + T(v - o.mu) + ', en dat is ' + T(k) + ' keer σ = ' + o.sig + '.', F(k, -k, 'Let op het teken: ' + v + ' ligt ' + (k < 0 ? 'links' : 'rechts') + ' van μ.')); }
            var st = [];
            if (t !== 'minder') st.push(kStap(a, za));
            if (t !== 'meer') st.push(kStap(b, zb));
            var nk = st.length;
            st.push(S('Tel de stukjes ' + (t === 'tus' ? 'ertussen' : t === 'meer' ? 'rechts daarvan' : 'links daarvan') + ' op:', [T(pr), T(pr) + '%'], stuk + '.', t === 'tus' ? null : F([T(pr), T(pr) + '%'], rnd(100 - pr, 2), 'Dat is de andere kant. Je zoekt het stuk ' + (t === 'meer' ? 'boven' : 'onder') + ' de grens.'), { e:'%' }));
            if (aant) st.push(S('Van de ' + T(Nn) + ' ' + c.wie + ': ' + T(pr) + '% van ' + T(Nn) + ' =', rnd(pr / 100 * Nn, 4), T(pr) + ' : 100 ' + X + ' ' + T(Nn) + '.'));
            return af({ vraag:aant ? 'Hoeveel van de ' + T(Nn) + ' ' + c.wie + '?' : vraag, context:c.wat + ' is normaal verdeeld met μ = ' + o.mu + ' ' + c.eh + ' en σ = ' + o.sig + ' ' + c.eh + '. Gebruik de vuistregels.' + (aant ? ' ' + vraag.replace(/^Hoeveel procent/, 'Hoeveel van ' + T(Nn) + ' ' + c.wie) : ''),
              antwoord:aant ? undefined : [T(pr), T(pr) + '%'], eenheid:aant ? null : '%',
              beeld:function(n){ return normaal(o.mu, o.sig, { proc:true, vul:n >= nk ? [za, zb] : null }); }, stappen:st });
          } },
        { id:'wva-norm-grens', naam:'Een grens bij een gegeven percentage', kort:'Zoek bij het percentage het stuk van de vuistregels; de grens is dan μ + k · σ',
          uit:'<p>Nu ken je het percentage en zoek je de grens. Bijvoorbeeld: de zwaarste 2,5% weegt meer dan hoeveel gram?</p><p>Boven <b>μ + σ</b> ligt 16% (13,5 + 2,35 + 0,15). Boven <b>μ + 2σ</b> ligt 2,5%. Boven <b>μ + 3σ</b> ligt 0,15%. Boven μ ligt 50%. Onder de grenzen links is het net zo.</p><p>Weet je welke grens het is, reken dan uit: <b>grens = μ + k · σ</b>, met k negatief als de grens links ligt.</p>',
          wanneer:'je een grens zoekt bij 50%, 16%, 2,5% of 0,15% (of 84%, 97,5%, 99,85%).',
          maak:function(R){
            var o = normKies(R), c = o.c, k = R.kies([-3, -2, -1, 1, 2, 3, 0, -1, 1, 2, -2]), boven = R.heel(0, 1) === 1;
            var pr = boven ? BOVEN[k] : rnd(100 - BOVEN[k], 2), g = o.mu + k * o.sig;
            var opt = uniek([k, -k, k - 1, k + 1].filter(function(v){ return v >= -3 && v <= 3; }).sort(function(a, b){ return a - b; }).map(sigTekst));
            var hint = boven ? 'Boven μ + σ ligt 16%, boven μ + 2σ 2,5% en boven μ + 3σ 0,15%. Boven μ ligt 50%. Bij meer dan 50% ligt de grens links van μ.' : 'Onder μ ' + MIN + ' σ ligt 16%, onder μ ' + MIN + ' 2σ 2,5% en onder μ ' + MIN + ' 3σ 0,15%. Onder μ ligt 50%. Bij meer dan 50% ligt de grens rechts van μ.';
            return af({ vraag:'De grens?', context:c.wat + ' is normaal verdeeld met μ = ' + o.mu + ' ' + c.eh + ' en σ = ' + o.sig + ' ' + c.eh + '. ' + T(pr) + '% van de ' + c.wie + ' ' + (boven ? c.meer : c.minder) + ' een bepaalde grens. Bereken die grens met de vuistregels.', eenheid:c.eh,
              beeld:function(n){ return normaal(o.mu, o.sig, { proc:true, vul:n >= 1 ? (boven ? [k, 4] : [-4, k]) : null }); }, stappen:[
                K(R, 'Waar ligt de grens met ' + T(pr) + '% ' + (boven ? 'erboven' : 'eronder') + '?', sigTekst(k), opt, hint, { orde:opt }),
                S('De grens: ' + o.mu + (k === 0 ? '' : ' ' + (k < 0 ? MIN : '+') + ' ' + Math.abs(k) + ' ' + X + ' ' + o.sig) + ' =', g, k === 0 ? 'Het is het gemiddelde zelf.' : 'μ ' + (k < 0 ? 'min' : 'plus') + ' ' + Math.abs(k) + ' keer σ.', F(g, o.mu - k * o.sig, 'Andere kant op: kijk of de grens links of rechts van μ ligt.'), { e:c.eh }) ] });
          } },
        { id:'wva-norm-terug', naam:'μ en σ terugvinden met de vuistregels', kort:'Het midden is μ; de afstand van μ tot een grens is k keer σ',
          uit:'<p>Soms weet je μ of σ niet, maar wel een paar percentages.</p><p>Ligt 95% <b>tussen 460 en 540</b>, precies rond het midden? Dan is μ het midden: <b>μ = 500</b>. Van 500 tot 540 is 40, en bij 95% hoort 2σ. Dus 2σ = 40 en <b>σ = 20</b>.</p><p>Weet je dat de helft boven 500 ligt en 16% boven 512? Dan is μ = 500 en μ + σ = 512, dus <b>σ = 12</b>.</p>',
          wanneer:'je μ of σ moet vinden uit percentages die bij de vuistregels horen.',
          maak:function(R){
            var o = normKies(R), c = o.c, mu = o.mu, sig = o.sig;
            if (R.heel(0, 1)){
              var k = R.kies([1, 2, 3]), pr = { 1:'68', 2:'95', 3:'99,7' }[k], a = mu - k * sig, b = mu + k * sig;
              return af({ vraag:'σ?', eenheid:c.eh, context:c.wat + ' is normaal verdeeld. ' + pr + '% van de ' + c.wie + ' ' + c.tus(a, b) + '. Het gemiddelde ligt precies in het midden.', stappen:[
                S('μ ligt in het midden: (' + a + ' + ' + b + ') : 2 =', mu, 'Tel op en deel door 2.', null, { e:c.eh }),
                S('Van μ tot ' + b + ' is', b - mu, b + ' ' + MIN + ' ' + mu + '.', F(b - mu, b - a, 'Dat is het hele stuk. Je zoekt de afstand van μ tot de rand.'), { e:c.eh }),
                S('Bij ' + pr + '% hoort μ ± ' + (k === 1 ? '' : k) + 'σ. Dus ' + (k === 1 ? 'σ' : k + 'σ') + ' = ' + (b - mu) + ' en σ =', sig, k === 1 ? 'De afstand is precies één σ.' : 'Deel ' + (b - mu) + ' door ' + k + '.', F(sig, b - mu, 'Dat is ' + k + ' keer σ. Deel nog door ' + k + '.'), { e:c.eh }) ] });
            }
            var kk = R.kies([1, 2, 3]), boven = R.heel(0, 1) === 1, pr2 = { 1:'16', 2:'2,5', 3:'0,15' }[kk], x = boven ? mu + kk * sig : mu - kk * sig;
            var opt = uniek([-3, -2, -1, 1, 2, 3].filter(function(v){ return Math.abs(v - (boven ? kk : -kk)) <= 1 || v === (boven ? -kk : kk); }).map(sigTekst));
            return af({ vraag:'σ?', eenheid:c.eh, context:c.wat + ' is normaal verdeeld. De helft van de ' + c.wie + ' ' + c.meer + ' ' + mu + ' ' + c.eh + '. ' + pr2 + '% ' + (boven ? c.meer : c.minder) + ' ' + x + ' ' + c.eh + '.', stappen:[
              S('μ =', mu, 'Bij de helft erboven en de helft eronder hoort het gemiddelde.', null, { e:c.eh }),
              K(R, 'Bij ' + pr2 + '% ' + (boven ? 'erboven' : 'eronder') + ' hoort de grens:', sigTekst(boven ? kk : -kk), opt, 'Boven μ + σ ligt 16%, boven μ + 2σ 2,5%, boven μ + 3σ 0,15%. Links is het net zo.', { orde:opt }),
              S('Dus ' + (kk === 1 ? 'σ' : kk + 'σ') + ' = ' + Math.abs(x - mu) + ' en σ =', sig, kk === 1 ? 'De afstand van ' + mu + ' tot ' + x + ' is precies één σ.' : 'Deel ' + Math.abs(x - mu) + ' door ' + kk + '.', F(sig, Math.abs(x - mu), 'Dat is ' + kk + ' keer σ. Deel nog door ' + kk + '.'), { e:c.eh }) ] });
          } }
      ] },

    /* ================= toetsen en schatten ================= */
    { groep:{ id:'wva-toets', niveau:'vwo', domein:'statistiek', naam:'Toetsen en schatten',
        uit:'Hypothesen opstellen, beslissen met een overschrijdingskans, het kritieke gebied uit een tabel, en het 95%-betrouwbaarheidsinterval voor een proportie. De kansen staan in de opgave.' },
      doelen:[
        { id:'wva-toets-hyp', naam:'H0 en H1 opstellen', kort:'H0 is wat beweerd wordt (met =), H1 is wat je vermoedt (>, < of ≠)',
          uit:'<p>Bij een toets ga je uit van wat altijd gezegd wordt: de <b>nulhypothese H0</b>. Daarin staat altijd een <b>=</b>, bijvoorbeeld H0: p = 0,05.</p><p>Wat je vermoedt is de <b>alternatieve hypothese H1</b>: groter (&gt;), kleiner (&lt;) of anders (≠).</p><p>Bij &gt; is de toets <b>rechtszijdig</b>, bij &lt; <b>linkszijdig</b>. Weet je niet welke kant het op gaat (≠), dan is de toets <b>tweezijdig</b>.</p>',
          wanneer:'je een bewering met een steekproef wilt toetsen.',
          maak:function(R){
            var h = R.kies(HYP), v = R.kies(h.v), vt = T(v), par = h.par;
            var H0 = ['=', '>', '<', '≠'].map(function(t){ return 'H0: ' + par + ' ' + t + ' ' + vt; }), H1 = ['>', '<', '≠'].map(function(t){ return 'H1: ' + par + ' ' + t + ' ' + vt; });
            var eind = ['>', '<', '≠'].map(function(t){ return 'H1: ' + par + ' ' + t + ' ' + vt + ', ' + ZIJ[t]; });
            var hint1 = h.h1 === '>' ? 'Er wordt gedacht dat het meer of groter is.' : h.h1 === '<' ? 'Er wordt gevreesd of gedacht dat het minder of kleiner is.' : 'Het kan beide kanten op: alleen "anders" wordt onderzocht.';
            return { vraag:'H1 en de soort toets?', context:h.zin(v) + ' Stel de hypothesen op.', opties:eind, goed:['>', '<', '≠'].indexOf(h.h1), stappen:[
              K(R, 'De nulhypothese:', H0[0], H0, 'In H0 staat altijd een =-teken: wat beweerd wordt.', { orde:H0 }),
              K(R, 'De alternatieve hypothese:', H1[['>', '<', '≠'].indexOf(h.h1)], H1, hint1, { orde:H1 }),
              K(R, 'Wat voor toets is het?', ZIJ[h.h1], ['linkszijdig', 'rechtszijdig', 'tweezijdig'], 'Bij > rechtszijdig, bij < linkszijdig, bij ≠ tweezijdig.', { orde:['linkszijdig', 'rechtszijdig', 'tweezijdig'] }) ] };
          } },
        { id:'wva-toets-besl', naam:'Beslissen met de overschrijdingskans', kort:'Is de overschrijdingskans kleiner dan of gelijk aan α (tweezijdig: α/2), dan verwerp je H0',
          uit:'<p>De <b>overschrijdingskans</b> is de kans op de uitkomst van de steekproef of nog extremer, als H0 waar is.</p><p>Vergelijk die kans met het <b>significantieniveau α</b>. Bij een eenzijdige toets vergelijk je met α. Bij een <b>tweezijdige</b> toets verdeel je α over twee kanten: vergelijk met <b>α/2</b>.</p><p>Is de overschrijdingskans <b>kleiner dan of gelijk aan</b> die grens, dan is de uitkomst te bijzonder: je <b>verwerpt H0</b>. Anders verwerp je H0 niet.</p>',
          wanneer:'je na een steekproef moet beslissen of je H0 verwerpt.',
          maak:function(R){
            var h, n, v, pm, rechts, k, tail, al, gr, r4, wil = R.heel(0, 1) === 1, kand, i;
            do {
              h = R.kies(HYP.filter(function(x){ return x.par === 'p'; })); v = R.kies(h.v); n = R.kies([20, 25, 30, 40, 50, 60, 80, 100]); pm = pmf(n, v);
              rechts = h.h1 === '>' || (h.h1 === '≠' && R.heel(0, 1) === 1); al = R.kies([0.01, 0.05, 0.1]); gr = h.h1 === '≠' ? al / 2 : al;
              kand = [];
              for (i = 0; i <= n; i++){
                var tl = 0, j; if (rechts){ if (i <= n * v) continue; for (j = i; j <= n; j++) tl += pm[j]; } else { if (i >= n * v) continue; for (j = 0; j <= i; j++) tl += pm[j]; }
                var t4 = rnd(tl, 4); if (t4 >= 0.001 && t4 <= 0.25 && Math.abs(t4 - gr) >= 0.002 && (t4 <= gr) === wil) kand.push([i, tl]);
              }
            } while (!kand.length);
            var kz = R.kies(kand); k = kz[0]; tail = kz[1]; r4 = rnd(tail, 4);
            var kl = r4 <= gr, tek = rechts ? '≥' : '≤', gOpt = uniek([T(al), T(rnd(al / 2, 4))]);
            var ctx = h.zin(v) + ' H0: p = ' + T(v) + ' en H1: p ' + h.h1 + ' ' + T(v) + '. ' + h.uitk(n, k) + ' De overschrijdingskans is P(X ' + tek + ' ' + k + ') = ' + T(r4) + ', als H0 waar is. Het significantieniveau is α = ' + T(al) + '.';
            var conc = kl ? 'Verwerp H0: er is reden om aan te nemen dat p ' + h.h1 + ' ' + T(v) + '.' : 'H0 wordt niet verworpen: er is te weinig bewijs dat p ' + h.h1 + ' ' + T(v) + '.';
            return af({ vraag:'H0 verwerpen?', context:ctx, stappen:[
              K(R, 'Met welk getal vergelijk je de overschrijdingskans?', T(gr), gOpt, h.h1 === '≠' ? 'De toets is tweezijdig: verdeel α over twee kanten. ' + T(al) + ' : 2 = ' + T(rnd(al / 2, 4)) + '.' : 'De toets is eenzijdig: vergelijk met α zelf.', { orde:gOpt }),
              K(R, 'Is ' + T(r4) + ' kleiner dan of gelijk aan ' + T(gr) + '?', kl ? 'ja' : 'nee', ['ja', 'nee'], 'Vergelijk de twee kommagetallen: ' + T(r4) + ' en ' + T(gr) + '.', { orde:['ja', 'nee'] }),
              K(R, 'De conclusie:', kl ? 'H0 verwerpen' : 'H0 niet verwerpen', ['H0 verwerpen', 'H0 niet verwerpen'], kl ? 'De uitkomst is te bijzonder als H0 waar is.' : 'De uitkomst is niet bijzonder genoeg.', { orde:['H0 verwerpen', 'H0 niet verwerpen'], waarom:conc }) ] });
          } },
        { id:'wva-toets-kritiek', naam:'Het kritieke gebied uit een tabel', kort:'Rechtszijdig: de kleinste g met P(X ≥ g) ≤ α; linkszijdig: de grootste g met P(X ≤ g) ≤ α',
          uit:'<p>Het <b>kritieke gebied</b> zijn de uitkomsten waarbij je H0 verwerpt. Je zoekt het vooraf, met kansen die gelden als H0 waar is.</p><p><b>Rechtszijdig</b>: zoek de <b>kleinste g</b> met P(X ≥ g) ≤ α. Het kritieke gebied is dan X ≥ g. <b>Linkszijdig</b>: zoek de <b>grootste g</b> met P(X ≤ g) ≤ α. Het kritieke gebied is X ≤ g.</p><p>Bij een <b>tweezijdige</b> toets vergelijk je aan elke kant met <b>α/2</b>.</p>',
          wanneer:'je vooraf wilt weten bij welke uitkomsten je H0 verwerpt.',
          maak:function(R){
            var h, v, n, pm, rechts, al, gr, g, rows, ok, i, j;
            do {
              h = R.kies(HYP.filter(function(x){ return x.par === 'p'; })); v = R.kies(h.v); n = R.kies([20, 25, 30, 40, 50, 60, 80, 100]); pm = pmf(n, v);
              rechts = h.h1 !== '<'; al = R.kies([0.01, 0.05, 0.1]); gr = h.h1 === '≠' ? al / 2 : al;
              var cum = []; for (i = 0; i <= n; i++){ var tl = 0; if (rechts) for (j = i; j <= n; j++) tl += pm[j]; else for (j = 0; j <= i; j++) tl += pm[j]; cum.push(tl); }
              g = -1; if (rechts){ for (i = 0; i <= n; i++) if (cum[i] <= gr){ g = i; break; } } else { for (i = n; i >= 0; i--) if (cum[i] <= gr){ g = i; break; } }
              ok = g > 2 && g < n - 2;
              if (ok){ var off = R.heel(2, 3), van = rechts ? g - off : g - 5 + off; rows = []; for (i = van; i < van + 6; i++){ if (i < 0 || i > n){ ok = false; break; } rows.push([i, cum[i]]); } }
              if (ok) ok = rows.every(function(r){ var r4 = rnd(r[1], 4); return Math.abs(r[1] - gr) > 0.0002 && (r4 <= gr) === (r[1] <= gr) && r4 > 0; });
            } while (!ok);
            var tek = rechts ? '≥' : '≤', kop = 'P(X ' + tek + ' g)';
            var tb = function(m){ return tabel([['g', kop]].concat(rows.map(function(r){ return [String(r[0]), T(rnd(r[1], 4), { dec:4, vast:true })]; })), m >= 2 ? [[rows.map(function(r){ return r[0]; }).indexOf(g) + 1, 0], [rows.map(function(r){ return r[0]; }).indexOf(g) + 1, 1]] : [], { kop:true, zijkop:false }); };
            var gOpt = uniek([T(al), T(rnd(al / 2, 4))]);
            return { vraag:'Het kritieke gebied: X ' + tek + ' …?', context:h.zin(v) + ' Je toetst H0: p = ' + T(v) + ' tegen H1: p ' + h.h1 + ' ' + T(v) + ' met n = ' + n + ' en α = ' + T(al) + '. X is ' + h.X + '. De tabel geeft kansen als H0 waar is.' + (h.h1 === '≠' ? ' Zoek het rechterdeel van het kritieke gebied.' : ''),
              antwoord:[String(g), 'X ' + tek + ' ' + g], controle:kritC(rechts, g), invoer:'tekst', beeld:tb, zelfBeeld:tb(0), stappen:[
                K(R, 'Met welk getal vergelijk je de kansen in de tabel?', T(gr), gOpt, h.h1 === '≠' ? 'Tweezijdig: aan elke kant α/2 = ' + T(rnd(al / 2, 4)) + '.' : 'Eenzijdig: vergelijk met α = ' + T(al) + '.', { orde:gOpt }),
                S('De ' + (rechts ? 'kleinste' : 'grootste') + ' g met ' + kop + ' ≤ ' + T(gr) + ':', g, 'Loop de tabel door en kijk waar de kans voor het eerst ' + T(gr) + ' of kleiner is.', F(g, rechts ? g - 1 : g + 1, 'Bij die g is de kans nog groter dan ' + T(gr) + '.', rechts ? g + 1 : g - 1, 'Er is een ' + (rechts ? 'kleinere' : 'grotere') + ' g waarbij het ook al kan.')) ] };
          } },
        { id:'wva-toets-bi', naam:'Het 95%-betrouwbaarheidsinterval', kort:'Bij een steekproefproportie p: het interval van p − 2 · √(p(1 − p) : n) tot p + 2 · √(p(1 − p) : n)',
          uit:'<p>In een steekproef van n mensen hebben er x een eigenschap. De <b>steekproefproportie</b> is p = x : n.</p><p>De echte proportie in de hele groep weet je niet precies. Het <b>95%-betrouwbaarheidsinterval</b> loopt van <b>p − 2 · √(p(1 − p) : n)</b> tot <b>p + 2 · √(p(1 − p) : n)</b>.</p><p>Je zegt dan: met 95% betrouwbaarheid ligt de echte proportie in dit interval. Hoe groter de steekproef, hoe smaller het interval.</p>',
          wanneer:'je vanuit een steekproef de proportie in een hele groep wilt schatten.',
          maak:function(R){
            var sc = R.kies([
              function(n, x){ return 'In een steekproef van ' + T(n) + ' leerlingen zeggen er ' + T(x) + ' dat ze elke dag ontbijten.'; },
              function(n, x){ return 'Van ' + T(n) + ' ondervraagde kiezers zeggen er ' + T(x) + ' dat ze op partij A stemmen.'; },
              function(n, x){ return 'Bij een controle van ' + T(n) + ' fietsen hebben er ' + T(x) + ' een kapot lampje.'; },
              function(n, x){ return 'Van ' + T(n) + ' bezoekers van een film vinden er ' + T(x) + ' de film goed.'; } ]);
            var n, x, p, se, lo, hi;
            do { n = R.kies([100, 200, 250, 400, 500, 625, 800, 1000, 1200, 1500, 2000]); x = R.heel(Math.round(0.1 * n), Math.round(0.9 * n)); p = x / n; se = Math.sqrt(p * (1 - p) / n); lo = p - 2 * se; hi = p + 2 * se; }
            while (Math.abs(p * 1000 - Math.round(p * 1000)) > 1e-9 || grens(lo, 3) || grens(hi, 3) || grens(se, 4) || rnd(p - 2 * rnd(se, 4), 3) !== rnd(lo, 3) || rnd(p + 2 * rnd(se, 4), 3) !== rnd(hi, 3));
            var se4 = rnd(se, 4), lo3 = rnd(lo, 3), hi3 = rnd(hi, 3), pT = N(p);
            return af({ vraag:'Het 95%-betrouwbaarheidsinterval?', context:sc(n, x) + ' Bereken het 95%-betrouwbaarheidsinterval voor de proportie. Rond de grenzen af op 3 decimalen. Typ bijvoorbeeld 0,412; 0,488.',
              antwoord:[T(lo3) + '; ' + T(hi3), '[' + T(lo3) + '; ' + T(hi3) + ']'], controle:intC(lo3, hi3), invoer:'tekst', stappen:[
                S('De steekproefproportie: p = ' + T(x) + ' : ' + T(n) + ' =', p, 'Deel het aantal met de eigenschap door de steekproefgrootte.'),
                SA('√(' + pT + ' ' + X + ' ' + N(1 - p) + ' : ' + T(n) + ') ≈ (4 decimalen)', se, 4, '1 ' + MIN + ' ' + pT + ' = ' + N(1 - p) + '. Vermenigvuldig, deel door ' + T(n) + ' en neem de wortel.', F(rnd(se, 4), rnd(p * (1 - p) / n, 4), 'Vergeet de wortel niet.')),
                SA('De ondergrens: ' + pT + ' ' + MIN + ' 2 ' + X + ' ' + T(se4) + ' ≈ (3 decimalen)', lo, 3, 'Trek twee keer de wortel van p af.', F(rnd(lo, 3), rnd(p - se, 3), 'Je trok de wortel maar één keer af. Het is 2 keer.')),
                SA('De bovengrens: ' + pT + ' + 2 ' + X + ' ' + T(se4) + ' ≈ (3 decimalen)', hi, 3, 'Tel twee keer de wortel bij p op.', F(rnd(hi, 3), rnd(p + se, 3), 'Je telde de wortel maar één keer op. Het is 2 keer.')) ] });
          } }
      ] },

    /* ================= exponentiële groei en logaritmen ================= */
    { groep:{ id:'wva-exp', niveau:'vwo', domein:'verbanden', naam:'Exponentiële groei: tijdseenheden en logaritmen',
        uit:'De groeifactor per andere tijdseenheid, de halveringstijd en verdubbelingstijd met een logaritme, en van halveringstijd terug naar de groeifactor. Groeifactor en procent staan bij vmbo.' },
      doelen:[
        { id:'wva-exp-eenheid', naam:'De groeifactor per andere tijdseenheid', kort:'Per t keer zo lange tijd wordt de groeifactor g tot de macht t',
          uit:'<p>De groeifactor per jaar is 1,06. Wat is hij <b>per 10 jaar</b>? Elk jaar keer 1,06, tien keer na elkaar: 1,06<sup>10</sup> ≈ 1,7908.</p><p>En <b>per maand</b>? Een maand is 1/12 jaar. De groeifactor per maand is dan 1,06<sup>1/12</sup> ≈ 1,0049.</p><p>Algemeen: is de nieuwe tijdseenheid <b>t keer</b> de oude, dan is de nieuwe groeifactor <b>g<sup>t</sup></b>. Ook als t een breuk is.</p>',
          wanneer:'de groeifactor per jaar gegeven is en je hem per maand, week of tien jaar nodig hebt.',
          maak:function(R){
            var c, d, g, w;
            do { c = R.kies(OMREKEN); var pas = DINGEN.filter(function(x){ return x.t.indexOf(c.van) >= 0 && x.t.indexOf(c.naar) >= 0; }); d = R.kies(pas);
              if (d.groei) g = R.heel(c.g[0], c.g[1]) / 100; else g = (c.ev < 1 ? R.heel(70, 98) : c.ev === 10 ? R.heel(85, 98) : R.heel(90, 99)) / 100;
              w = Math.pow(g, c.ev); } while (grens(w, 4) || g === 1);
            var eT = c.e, w4 = rnd(w, 4);
            return af({ vraag:'De groeifactor per ' + c.naar + '?', context:d.zin + ' De groeifactor per ' + c.van + ' is ' + T(g) + '. Bereken de groeifactor per ' + c.naarT + '. Rond af op 4 decimalen.', stappen:[
              S('Hoeveel keer zo lang als één ' + c.van + ' is één ' + c.naarT + '? Dat is de exponent.', eT, c.ev < 1 ? 'Eén ' + c.naar + ' is een deel van een ' + c.van + ': typ het als breuk, ' + eT + '.' : 'Eén ' + c.naarT + ' is ' + eT + ' keer een ' + c.van + '.', c.ev < 1 ? F(eT, String(Math.round(1 / c.ev)), 'Andersom: een ' + c.naar + ' is korter dan een ' + c.van + ', dus de exponent is een breuk.') : F(eT, '1/' + eT, 'Andersom: een ' + c.naarT + ' is langer dan een ' + c.van + ', dus de exponent is groter dan 1.')),
              SA('De groeifactor per ' + c.naar + ': ' + T(g) + '<sup>' + eT + '</sup> ≈ (4 decimalen)', w, 4, 'Rekenmachine: ' + T(g) + ' ^ (' + eT + ').', F(w4, rnd(g * c.ev, 4), 'Je deed keer ' + eT + '. Het is een macht.', rnd(Math.pow(g, 1 / c.ev), 4), 'Verkeerde exponent: ' + (c.ev < 1 ? 'de nieuwe tijdseenheid is korter, dus een breuk.' : 'de nieuwe tijdseenheid is langer, dus een geheel getal.'))) ] });
          } },
        { id:'wva-exp-half', naam:'De halveringstijd met een logaritme', kort:'Los g^t = 0,5 op: t = log(0,5) : log(g)',
          uit:'<p>De <b>halveringstijd</b> is de tijd waarin een hoeveelheid halveert. Na die tijd is de groeifactor <b>0,5</b>.</p><p>Je lost dus op: <b>g<sup>t</sup> = 0,5</b>. Dat doe je met een logaritme: t = <sup>g</sup>log(0,5) = <b>log(0,5) : log(g)</b>.</p><p>Voorbeeld: g = 0,9 per jaar. t = log(0,5) : log(0,9) ≈ 6,6 jaar.</p>',
          wanneer:'een hoeveelheid exponentieel afneemt en je wilt weten wanneer de helft over is.',
          maak:function(R){
            var c = R.kies([['De hoeveelheid medicijn in het bloed', 'uur'], ['De hoeveelheid van een radioactieve stof', 'jaar'], ['De waarde van een auto', 'jaar'], ['Het aantal vlinders in een gebied', 'jaar'], ['De temperatuur boven kamertemperatuur van een kop thee', 'minuut']]);
            var g, t, pr = R.heel(0, 1) === 1, eh = c[1] === 'minuut' ? 'minuten' : c[1];
            do { g = R.heel(70, 97) / 100; t = Math.log(0.5) / Math.log(g); } while (grens(t, 1));
            var gT = T(g), pc2 = Math.round((1 - g) * 100), st = [];
            if (pr) st.push(S('De groeifactor per ' + c[1] + ':', g, '100% ' + MIN + ' ' + pc2 + '% = ' + (100 - pc2) + '%, en dat is ' + gT + '.', F(g, rnd(pc2 / 100, 2), 'Dat is het deel dat eraf gaat. Er blijft 1 ' + MIN + ' ' + T(rnd(pc2 / 100, 2)) + ' over.')));
            st.push(K(R, 'Welke vergelijking los je op?', gT + '^t = 0,5', [gT + '^t = 2', '0,5^t = ' + gT, gT + ' · t = 0,5'], 'Na de halveringstijd is de hoeveelheid keer 0,5.'));
            st.push(SA('t = log(0,5) : log(' + gT + ') ≈ (1 decimaal)', t, 1, 'Rekenmachine: log(0,5) ÷ log(' + gT + ').', F(rnd(t, 1), rnd(Math.log(g) / Math.log(0.5), 1), 'Andersom gedeeld. Boven de streep log(0,5).', rnd(0.5 / (1 - g), 1), 'Dat is lineair gerekend. Het gaat exponentieel: gebruik log.'), { e:eh }));
            return af({ vraag:'De halveringstijd?', context:c[0] + (pr ? ' neemt elk' + (c[1] === 'uur' || c[1] === 'jaar' ? '' : 'e') + ' ' + c[1] + ' met ' + pc2 + '% af.' : ' neemt exponentieel af met groeifactor ' + gT + ' per ' + c[1] + '.') + ' Bereken de halveringstijd. Rond af op 1 decimaal.', stappen:st });
          } },
        { id:'wva-exp-verdub', naam:'De verdubbelingstijd met een logaritme', kort:'Los g^t = 2 op: t = log(2) : log(g)',
          uit:'<p>De <b>verdubbelingstijd</b> is de tijd waarin een hoeveelheid twee keer zo groot wordt. Na die tijd is de groeifactor <b>2</b>.</p><p>Je lost op: <b>g<sup>t</sup> = 2</b>, dus t = <sup>g</sup>log(2) = <b>log(2) : log(g)</b>.</p><p>Voorbeeld: een bedrag groeit met 5% per jaar, dus g = 1,05. t = log(2) : log(1,05) ≈ 14,2 jaar.</p>',
          wanneer:'een hoeveelheid exponentieel groeit en je wilt weten wanneer hij verdubbeld is.',
          maak:function(R){
            var c = R.kies([['Het aantal bacteriën in een bakje', 'uur'], ['Een spaarbedrag', 'jaar'], ['Het aantal volgers van een account', 'week'], ['Het aantal inwoners van een stad', 'jaar'], ['Het aantal konijnen op een eiland', 'maand']]);
            var g, t, pr = R.heel(0, 1) === 1;
            do { g = R.heel(102, 140) / 100; t = Math.log(2) / Math.log(g); } while (grens(t, 1));
            var gT = T(g), pc2 = Math.round((g - 1) * 100), st = [], elk = { uur:'elk uur', jaar:'elk jaar', week:'elke week', maand:'elke maand' }[c[1]];
            if (pr) st.push(S('De groeifactor per ' + c[1] + ':', g, '100% + ' + pc2 + '% = ' + (100 + pc2) + '%, en dat is ' + gT + '.', F(g, rnd(pc2 / 100, 2), 'Dat is alleen de groei. Tel er 1 bij op.')));
            st.push(K(R, 'Welke vergelijking los je op?', gT + '^t = 2', [gT + '^t = 0,5', '2^t = ' + gT, gT + ' · t = 2'], 'Na de verdubbelingstijd is de hoeveelheid keer 2.'));
            st.push(SA('t = log(2) : log(' + gT + ') ≈ (1 decimaal)', t, 1, 'Rekenmachine: log(2) ÷ log(' + gT + ').', F(rnd(t, 1), rnd(Math.log(g) / Math.log(2), 1), 'Andersom gedeeld. Boven de streep log(2).', rnd(1 / (g - 1), 1), 'Dat is lineair gerekend. Het gaat exponentieel: gebruik log.'), { e:c[1] === 'uur' ? 'uur' : c[1] === 'jaar' ? 'jaar' : c[1] === 'week' ? 'weken' : 'maanden' }));
            return af({ vraag:'De verdubbelingstijd?', context:c[0] + (pr ? ' groeit ' + elk + ' met ' + pc2 + '%.' : ' groeit exponentieel met groeifactor ' + gT + ' per ' + c[1] + '.') + ' Bereken de verdubbelingstijd. Rond af op 1 decimaal.', stappen:st });
          } },
        { id:'wva-exp-terug', naam:'Van halveringstijd naar groeifactor', kort:'Halveringstijd T: g = 0,5^(1/T); verdubbelingstijd T: g = 2^(1/T)',
          uit:'<p>Ken je de <b>halveringstijd</b>, bijvoorbeeld 6 uur, dan weet je de groeifactor per 6 uur: <b>0,5</b>.</p><p>Per uur is dat 0,5<sup>1/6</sup> ≈ 0,8909, want één uur is 1/6 van 6 uur.</p><p>Bij een <b>verdubbelingstijd</b> T gaat het net zo, met 2: g = 2<sup>1/T</sup>.</p>',
          wanneer:'de halveringstijd of verdubbelingstijd gegeven is en je de groeifactor zoekt.',
          maak:function(R){
            var half = R.heel(0, 1) === 1, c = half ? R.kies([['De halveringstijd van een medicijn in het bloed is', 'uur', 2, 12], ['De halveringstijd van een radioactieve stof is', 'jaar', 5, 30], ['De waarde van een auto halveert in', 'jaar', 4, 9]]) : R.kies([['Het aantal bacteriën verdubbelt in', 'uur', 2, 10], ['Een spaarbedrag verdubbelt in', 'jaar', 8, 25], ['Het aantal volgers van een account verdubbelt in', 'week', 3, 12]]);
            var Tt, g, b = half ? 0.5 : 2;
            do { Tt = R.heel(c[2], c[3]); g = Math.pow(b, 1 / Tt); } while (grens(g, 4));
            var mv = { uur:'uur', jaar:'jaar', week:'weken' }[c[1]], bT = T(b);
            return af({ vraag:'De groeifactor per ' + c[1] + '?', context:c[0] + ' ' + Tt + ' ' + mv + '. Bereken de groeifactor per ' + c[1] + '. Rond af op 4 decimalen.', stappen:[
              S('De groeifactor per ' + Tt + ' ' + mv + ':', b, half ? 'Halveren is keer 0,5.' : 'Verdubbelen is keer 2.', F(b, half ? 2 : 0.5, half ? 'Het wordt minder: halveren is keer 0,5.' : 'Het wordt meer: verdubbelen is keer 2.')),
              S('Eén ' + c[1] + ' is welk deel van ' + Tt + ' ' + mv + '? Dat is de exponent.', ['1/' + Tt], 'Typ het als breuk: 1/' + Tt + '.', F('1/' + Tt, String(Tt), 'Eén ' + c[1] + ' is korter, dus de exponent is een breuk.')),
              SA('g = ' + bT + '<sup>1/' + Tt + '</sup> ≈ (4 decimalen)', g, 4, 'Rekenmachine: ' + bT + ' ^ (1 ÷ ' + Tt + ').', F(rnd(g, 4), rnd(b / Tt, 4), 'Je deelde door ' + Tt + '. Het is een macht met exponent 1/' + Tt + '.')) ] });
          } }
      ] },

    /* ================= logaritmen ================= */
    { groep:{ id:'wva-log', niveau:'vwo', domein:'algebra', naam:'Logaritmen en exponentiële vergelijkingen',
        uit:'Een logaritme uitrekenen, en een exponentiële vergelijking oplossen: door hetzelfde grondtal te maken of met een logaritme. Daarna kies je de handigste manier.' },
      doelen:[
        { id:'wva-log-def', naam:'Een logaritme uitrekenen', kort:'Het getal g log a is de exponent: g tot de macht ? = a',
          uit:'<p><sup>2</sup>log(8) lees je als: <b>2-log van 8</b>. Het is de <b>exponent</b> die bij 2 hoort om 8 te krijgen. 2<sup>3</sup> = 8, dus <sup>2</sup>log(8) = <b>3</b>.</p><p>Ook bij breuken: 3<sup>−2</sup> = 1/9, dus <sup>3</sup>log(1/9) = <b>−2</b>. En <sup>10</sup>log(0,001) = −3.</p><p>Een wortel is de macht 1/2: √4 = 2 = 4<sup>1/2</sup>, dus <sup>4</sup>log(2) = 1/2. Altijd geldt <sup>g</sup>log(g) = 1 en <sup>g</sup>log(1) = 0.</p>',
          wanneer:'je een logaritme zonder rekenmachine wilt uitrekenen.',
          maak:function(R){
            var g, x, st, a, pre, rng = { 2:[-4, 8], 3:[-3, 5], 4:[-3, 4], 5:[-3, 4], 10:[-3, 6] };
            if (R.heel(0, 6) === 0){
              var wp = R.kies([[4, 2], [9, 3], [16, 4], [25, 5], [100, 10]]); pre = sup(wp[0]);
              return af({ vraag:pre + 'log(' + wp[1] + ')', context:'Bereken zonder rekenmachine.', stappen:[
                S('√' + wp[0] + ' =', wp[1], 'Welk getal keer zichzelf is ' + wp[0] + '?'),
                S('Een wortel is de macht 1/2: ' + wp[1] + ' = ' + wp[0] + '<sup>1/2</sup>. Dus ' + pre + 'log(' + wp[1] + ') =', ['1/2', '0,5'], 'De logaritme is de exponent.', F(['1/2', '0,5'], 2, 'Dat is ' + wp[0] + ' : ' + wp[1] + '. De logaritme is de exponent: 1/2.')) ] });
            }
            g = R.kies([2, 2, 3, 4, 5, 10]); x = R.heel(rng[g][0], rng[g][1]); pre = sup(g);
            var gm = Math.pow(g, Math.abs(x));
            a = x >= 0 ? T(gm) : g === 10 ? T(rnd(Math.pow(10, x), 6)) : '1/' + T(gm);
            var rij = []; for (var i = 1; i <= Math.min(Math.abs(x), 8); i++) rij.push(T(Math.pow(g, i)));
            if (x >= 0) st = [
              S('Welke macht van ' + g + ' is ' + a + '? ' + g + '<sup>…</sup> = ' + a, x, x === 0 ? 'Elk getal tot de macht 0 is 1.' : 'Reken door: ' + rij.join(', ') + '.'),
              S('Dus ' + pre + 'log(' + a + ') =', x, 'De logaritme is de exponent.') ];
            else st = [
              S((g === 10 ? a + ' = 1/' + T(gm) + '. ' : '') + 'Zonder de breuk: ' + g + '<sup>…</sup> = ' + T(gm), -x, 'Reken door: ' + rij.join(', ') + '.'),
              S('Eén gedeeld door een macht geeft een negatieve exponent. ' + g + '<sup>…</sup> = ' + a, x, '1/' + g + sup(-x) + ' = ' + g + sup(x) + '.', F(x, -x, 'Let op: ' + a + ' is kleiner dan 1, dus de exponent is negatief.')),
              S('Dus ' + pre + 'log(' + a + ') =', x, 'De logaritme is de exponent.', F(x, -x, 'De exponent is negatief.')) ];
            return af({ vraag:pre + 'log(' + a + ')', context:'Bereken zonder rekenmachine.', stappen:st });
          } },
        { id:'wva-log-zelfde', naam:'Exponentiële vergelijking: hetzelfde grondtal', kort:'Schrijf beide kanten als macht van hetzelfde grondtal; dan zijn de exponenten gelijk',
          uit:'<p>Neem 3<sup>x + 1</sup> = 81. Schrijf 81 als macht van 3: 81 = 3<sup>4</sup>.</p><p>Nu staat er 3<sup>x + 1</sup> = 3<sup>4</sup>. De grondtallen zijn gelijk, dus de <b>exponenten zijn gelijk</b>: x + 1 = 4, dus <b>x = 3</b>.</p><p>Staat er nog een getal voor de macht, zoals 2 · 3<sup>x</sup> = 54? Deel dan eerst: 3<sup>x</sup> = 27 = 3<sup>3</sup>, dus x = 3.</p>',
          wanneer:'de rechterkant een macht is van het grondtal links.',
          maak:function(R){
            var m = mZelfde(R, 'x', R.heel(0, 2) === 0);
            return af({ vraag:m.vraag, vraagHtml:m.vraagHtml, context:'Los exact op. Schrijf beide kanten als macht van hetzelfde grondtal.', stappen:m.stappen });
          } },
        { id:'wva-log-log', naam:'Exponentiële vergelijking met een logaritme', kort:'Maak de macht vrij: g^t = r; dan t = log(r) : log(g)',
          uit:'<p>Neem 5 · 1,08<sup>t</sup> = 12. Maak eerst de <b>macht vrij</b>: deel door 5. Dan 1,08<sup>t</sup> = 2,4.</p><p>2,4 is geen mooie macht van 1,08. Gebruik een <b>logaritme</b>: t = <sup>1,08</sup>log(2,4) = <b>log(2,4) : log(1,08)</b> ≈ 11,38.</p><p>Controleer: 5 · 1,08<sup>11,38</sup> ≈ 12.</p>',
          wanneer:'je de rechterkant niet als mooie macht van het grondtal kunt schrijven.',
          maak:function(R){
            var m = mLog(R, 't', R.heel(0, 3) === 0);
            return af({ vraag:m.vraag, vraagHtml:m.vraagHtml, context:'Los op met een logaritme. Rond af op 2 decimalen.', stappen:m.stappen });
          } },
        { id:'wva-log-kies', naam:'Kies de handigste manier', kort:'Is de rechterkant een macht van het grondtal: zelfde grondtal; anders: een logaritme',
          uit:'<p>Kijk eerst naar het getal aan de andere kant (na eventueel delen).</p><p>Is dat een <b>macht van het grondtal</b>, zoals 81 bij grondtal 3 of 1/8 bij grondtal 2? Maak dan <b>hetzelfde grondtal</b> en zet de exponenten gelijk. Dat is exact en snel.</p><p>Is het geen mooie macht, zoals 12 bij grondtal 2, of is het grondtal een kommagetal zoals 1,08? Gebruik dan een <b>logaritme</b>.</p>',
          wanneer:'je een exponentiële vergelijking zo snel mogelijk wilt oplossen.',
          maak:function(R){
            var opt = ['hetzelfde grondtal maken', 'met een logaritme'], zelf = R.heel(0, 1) === 1, m = zelf ? mZelfde(R, 'x', false) : mLog(R, 'x', R.heel(0, 1) === 1);
            var uitleg = zelf ? 'De rechterkant is een macht van het grondtal. Dan kan het exact.' : 'De rechterkant is geen mooie macht van het grondtal. Gebruik een logaritme.';
            return af({ vraag:m.vraag, vraagHtml:m.vraagHtml, context:'Kies eerst de handigste manier. Los dan op. Rond af op 2 decimalen als het niet precies uitkomt.', antwoord:m.ant,
              stappen:[K(R, 'Welke manier is hier het handigst?', opt[zelf ? 0 : 1], opt, uitleg, { orde:opt, waarom:uitleg })].concat(m.stappen) });
          } }
      ] },

    /* ================= differentiëren ================= */
    { groep:{ id:'wva-dif', niveau:'vwo', domein:'verbanden', naam:'Differentiëren',
        uit:'Het differentiequotiënt, de afgeleide van machten en veeltermen, de helling in een punt, de raaklijn en toppen met f\'(x) = 0.' },
      doelen:[
        { id:'wva-dif-dq', naam:'Het differentiequotiënt', kort:'Δy : Δx = (f(b) − f(a)) : (b − a): de gemiddelde verandering op een interval',
          uit:'<p>Het <b>differentiequotiënt</b> op het interval [a, b] is <b>Δy : Δx = (f(b) − f(a)) : (b − a)</b>.</p><p>Het is de <b>gemiddelde verandering</b> per stap van x. In de grafiek is het de helling van de lijn door de punten bij x = a en x = b.</p><p>Voorbeeld: f(x) = x² op [1, 3]. f(1) = 1 en f(3) = 9. Δy : Δx = 8 : 2 = <b>4</b>.</p>',
          wanneer:'je wilt weten hoe snel iets gemiddeld verandert tussen twee momenten.',
          maak:function(R){
            var p, a, D, b, fa, fb;
            do { p = R.heel(0, 2) === 0 ? [[R.kies([-1, 1, 2]), 3], [R.heel(-6, 6), 1], [R.heel(-9, 9), 0]] : [[R.kies([-3, -2, -1, 1, 2, 3]), 2], [R.heel(-6, 6), 1], [R.heel(-9, 9), 0]];
              a = R.heel(-3, 3); D = R.kies([1, 2, 3, 4]); b = a + D; } while (b > 5 || (p[0][1] === 3 && (Math.abs(a) > 3 || b > 3)));
            var f = function(x){ return waarde(p, x); }; fa = f(a); fb = f(b);
            var dy = rnd(fb - fa, 6), dq = rnd(dy / D, 6);
            return af({ vraag:'Δy : Δx op [' + T(a) + ', ' + T(b) + ']?', context:'f(x) = ' + polyS(p) + '. Bereken het differentiequotiënt op het interval [' + T(a) + ', ' + T(b) + '].',
              beeld:function(n){ return plot(f, Math.min(a, b) - 1, Math.max(a, b) + 1, { punten:n >= 2 ? [[a, fa], [b, fb]] : n >= 1 ? [[a, fa]] : [], lijn:n >= 4 ? { m:dq, b:fa - dq * a } : null, aria:'grafiek van f met de lijn door twee punten' }); }, stappen:[
                S('f(' + T(a) + ') =', fa, 'Vul ' + T(a) + ' in: ' + invul(p, a) + '.'),
                S('f(' + T(b) + ') =', fb, 'Vul ' + T(b) + ' in: ' + invul(p, b) + '.'),
                S('Δy = f(' + T(b) + ') ' + MIN + ' f(' + T(a) + ') =', dy, T(fb) + ' ' + MIN + ' ' + paren(fa) + '.', F(dy, -dy, 'Andersom: de rechter waarde min de linker.')),
                S('Δy : Δx = ' + T(dy) + ' : ' + D + ' =', dq, 'Δx = ' + T(b) + ' ' + MIN + ' ' + paren(a) + ' = ' + D + '.', F(dq, dy, 'Je vergat te delen door Δx = ' + D + '.')) ] });
          } },
        { id:'wva-dif-macht', naam:'De afgeleide van a · xⁿ', kort:'f(x) = a · xⁿ geeft f\'(x) = n · a · xⁿ⁻¹: de exponent ervoor, en de exponent 1 omlaag',
          uit:'<p>De <b>afgeleide</b> f\'(x) geeft de helling van de grafiek van f.</p><p>Voor een macht geldt: <b>f(x) = a · x<sup>n</sup> geeft f\'(x) = n · a · x<sup>n − 1</sup></b>. De exponent gaat ervoor als vermenigvuldiger, en de nieuwe exponent is één lager.</p><p>Voorbeelden: 5x³ wordt 15x². 7x wordt 7. Een los getal zoals 4 wordt 0. Typ x² als x^2.</p>',
          wanneer:'je de afgeleide van één macht van x zoekt.',
          maak:function(R){
            var a = R.heel(0, 4) === 0 ? R.kies([0.5, 1.5, 2.5, -0.5]) : R.kies([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]), n = R.heel(0, 7) === 0 ? 1 : R.heel(2, 6);
            var f = polyS([[a, n]]), d = polyS(afg([[a, n]])), na = rnd(n * a, 6);
            return af({ vraag:'f(x) = ' + f, context:'Bepaal de afgeleide. Typ x² als x^2.', stappen:[
              S('De exponent gaat ervoor: ' + n + ' ' + X + ' ' + paren(a) + ' =', na, 'Vermenigvuldig de exponent met het getal ervoor.'),
              S('De nieuwe exponent: ' + n + ' ' + MIN + ' 1 =', n - 1, 'Eén lager.', F(n - 1, n + 1, 'De exponent gaat omlaag, niet omhoog.')),
              S('f\'(x) =', d, n === 1 ? 'x⁰ = 1, dus er blijft alleen het getal over.' : 'Het getal ' + T(na) + ' met x tot de macht ' + (n - 1) + '. Typ bijvoorbeeld ' + T(na).replace('−', '-') + (n - 1 === 1 ? 'x' : 'x^' + (n - 1)) + '.', F(d, polyS([[na, n]]), 'De exponent moet nog 1 omlaag.', polyS([[a, n - 1]]), 'Vergeet niet te vermenigvuldigen met de exponent ' + n + '.'), { controle:exprC(d) }) ] });
          } },
        { id:'wva-dif-veelterm', naam:'De afgeleide van een veelterm', kort:'Differentieer term voor term; een los getal valt weg; werk haakjes eerst weg',
          uit:'<p>Een <b>veelterm</b> differentieer je <b>term voor term</b>. f(x) = 2x³ − 5x² + 4x − 7 geeft f\'(x) = 6x² − 10x + 4.</p><p>Een <b>los getal</b> (hier −7) verandert niet, dus de afgeleide daarvan is <b>0</b>.</p><p>Staan er <b>haakjes</b>, zoals f(x) = x(x + 3)? Werk die eerst weg: x² + 3x. Dan differentiëren: f\'(x) = 2x + 3.</p>',
          wanneer:'je de afgeleide van een functie met meer termen of met haakjes zoekt.',
          maak:function(R){
            function nz(lo, hi){ var v; do { v = R.heel(lo, hi); } while (!v); return v; }
            if (R.heel(0, 2) === 0){
              var vorm = R.heel(0, 2), p, toon, a1, b1, c1, d1;
              if (vorm === 0){ a1 = R.kies([1, 2, 3]); b1 = nz(-5, 5); c1 = R.kies([1, 2, 3]); d1 = nz(-5, 5); toon = '(' + E([[a1, 'x'], [b1, '']]) + ')(' + E([[c1, 'x'], [d1, '']]) + ')'; p = [[a1 * c1, 2], [a1 * d1 + b1 * c1, 1], [b1 * d1, 0]]; }
              else if (vorm === 1){ b1 = nz(-6, 6); toon = 'x²(' + E([[1, 'x'], [b1, '']]) + ')'; p = [[1, 3], [b1, 2]]; }
              else { a1 = nz(-5, 5); b1 = nz(-6, 6); toon = E([[a1, 'x']]) + '(' + E([[1, 'x'], [-b1, '']]) + ')'; p = [[a1, 2], [-a1 * b1, 1]]; }
              var uit = polyS(p), d = polyS(afg(p));
              return af({ vraag:'f(x) = ' + toon, context:'Bepaal de afgeleide. Werk eerst de haakjes weg. Typ x² als x^2.', stappen:[
                S('Werk de haakjes weg: f(x) =', uit, 'Vermenigvuldig elke term binnen de haakjes met wat ervoor staat.', null, { controle:exprC(uit, { kaal:true }) }),
                S('f\'(x) =', d, 'Differentieer ' + uit + ' term voor term.', null, { controle:exprC(d) }) ] });
            }
            var exps = R.kies([[3, 2, 1], [3, 2, 0], [3, 1, 0], [4, 2, 1], [4, 3, 0], [2, 1, 0], [5, 3, 1], [3, 2, 1, 0], [4, 2, 1, 0]]);
            var q = exps.map(function(e){ return [nz(-9, 9), e]; }), dq = afg(q), st = [];
            q.forEach(function(t){ if (t[1] > 0) st.push(S('De afgeleide van ' + polyS([t]) + ':', polyS(afg([t])), t[1] === 1 ? 'x wordt 1: er blijft alleen het getal over.' : t[1] + ' ' + X + ' ' + paren(t[0]) + ' = ' + T(t[0] * t[1]) + ', en de exponent wordt ' + (t[1] - 1) + '.', null, { controle:exprC(polyS(afg([t]))) })); });
            var c0 = q.filter(function(t){ return t[1] === 0; })[0];
            if (c0) st.push(S('De afgeleide van het losse getal ' + T(c0[0]) + ':', 0, 'Een los getal verandert niet: de afgeleide is 0.', F(0, c0[0], 'Een los getal valt weg bij differentiëren.')));
            var dS = polyS(dq);
            st.push(S('f\'(x) =', dS, 'Zet de afgeleiden van alle termen achter elkaar.', null, { controle:exprC(dS) }));
            return af({ vraag:'f(x) = ' + polyS(q), context:'Bepaal de afgeleide. Typ x² als x^2.', stappen:st });
          } },
        { id:'wva-dif-helling', naam:'De helling in een punt', kort:'De helling van de grafiek bij x = a is f\'(a): eerst differentiëren, dan invullen',
          uit:'<p>De afgeleide f\'(x) geeft bij elke x de <b>helling</b> van de grafiek van f.</p><p>Zoek je de helling in het punt met x = a, bepaal dan eerst <b>f\'(x)</b> en vul daarna <b>a in f\'</b> in (niet in f).</p><p>Voorbeeld: f(x) = x³ − 4x. f\'(x) = 3x² − 4. De helling bij x = 2 is f\'(2) = 12 − 4 = <b>8</b>.</p>',
          wanneer:'je wilt weten hoe steil een grafiek in één punt is.',
          maak:function(R){
            var p, a;
            do { p = R.heel(0, 1) ? [[R.kies([-2, -1, 1, 2]), 3], [R.heel(-4, 4), 2], [R.heel(-6, 6), 1], [R.heel(-5, 5), 0]] : [[R.kies([-3, -2, -1, 1, 2, 3]), 2], [R.heel(-8, 8), 1], [R.heel(-9, 9), 0]]; a = R.heel(-3, 3); } while (!a && R.heel(0, 1));
            var d = afg(p), dS = polyS(d), h = waarde(d, a), f = function(x){ return waarde(p, x); }, fa = f(a);
            return af({ vraag:'De helling bij x = ' + T(a) + '?', context:'f(x) = ' + polyS(p) + '. Bereken de helling van de grafiek van f in het punt met x = ' + T(a) + '. Typ x² als x^2.',
              zelfBeeld:plot(f, a - 3, a + 3, { punten:[[a, fa]], aria:'grafiek van f' }), beeld:function(n){ return plot(f, a - 3, a + 3, { punten:[[a, fa]], lijn:n >= 2 ? { m:h, b:fa - h * a } : null, aria:'grafiek van f met het punt bij x = ' + T(a) }); }, stappen:[
                S('f\'(x) =', dS, 'Differentieer term voor term.', null, { controle:exprC(dS) }),
                S('f\'(' + T(a) + ') =', h, 'Vul ' + T(a) + ' in de afgeleide in: ' + invul(d, a) + '.', F(h, fa, 'Dat is f(' + T(a) + '). Vul in de afgeleide in.')) ] });
          } },
        { id:'wva-dif-raaklijn', naam:'De vergelijking van de raaklijn', kort:'Raaklijn bij x = a: y = rc · x + b met rc = f\'(a); b vind je met het punt (a, f(a))',
          uit:'<p>De <b>raaklijn</b> raakt de grafiek in één punt en heeft daar dezelfde helling. Het is een rechte lijn: <b>y = rc · x + b</b>.</p><p>De richtingscoëfficiënt is de helling: <b>rc = f\'(a)</b>. De lijn gaat door het punt <b>(a, f(a))</b>. Vul dat punt in om b te vinden: b = f(a) − rc · a.</p><p>Voorbeeld: f(x) = x², a = 3. rc = f\'(3) = 6, f(3) = 9. b = 9 − 6 · 3 = −9. De raaklijn is y = 6x − 9.</p>',
          wanneer:'je de vergelijking van de lijn zoekt die de grafiek in een punt raakt.',
          maak:function(R){
            var p = R.heel(0, 1) ? [[R.kies([-1, 1]), 3], [R.heel(-3, 3), 2], [R.heel(-5, 5), 1], [R.heel(-5, 5), 0]] : [[R.kies([-2, -1, 1, 2, 3]), 2], [R.heel(-6, 6), 1], [R.heel(-9, 9), 0]], a = R.heel(-2, 3);
            var d = afg(p), dS = polyS(d), m = waarde(d, a), f = function(x){ return waarde(p, x); }, fa = f(a), b = rnd(fa - m * a, 6), lijn = E([[m, 'x'], [b, '']]);
            return af({ vraag:'De raaklijn bij x = ' + T(a) + '?', context:'f(x) = ' + polyS(p) + '. Stel de vergelijking op van de raaklijn aan de grafiek van f in het punt met x = ' + T(a) + '. Typ x² als x^2.', antwoord:['y = ' + lijn, lijn], controle:vrijC('y', lijn), invoer:'tekst',
              zelfBeeld:plot(f, a - 3, a + 3, { aria:'grafiek van f' }), beeld:function(n){ return plot(f, a - 3, a + 3, { punten:n >= 3 ? [[a, fa, '(' + T(a) + ', ' + T(fa) + ')']] : [], lijn:n >= 5 ? { m:m, b:b } : null, aria:'grafiek van f met de raaklijn' }); }, stappen:[
                S('f\'(x) =', dS, 'Differentieer term voor term.', null, { controle:exprC(dS) }),
                S('rc = f\'(' + T(a) + ') =', m, 'Vul ' + T(a) + ' in de afgeleide in: ' + invul(d, a) + '.', F(m, fa, 'Dat is f(' + T(a) + '). De helling vind je met de afgeleide.')),
                S('f(' + T(a) + ') =', fa, 'Vul ' + T(a) + ' in f in: ' + invul(p, a) + '.'),
                S('b = ' + T(fa) + ' ' + MIN + ' ' + paren(m) + ' ' + X + ' ' + paren(a) + ' =', b, 'De lijn gaat door (' + T(a) + ', ' + T(fa) + '): ' + T(fa) + ' = ' + T(m) + ' · ' + paren(a) + ' + b.', F(b, rnd(fa + m * a, 6), 'Let op het teken: b = f(a) min rc keer a.')),
                S('De raaklijn: y =', lijn, 'rc = ' + T(m) + ' en b = ' + T(b) + '.', null, { controle:vrijC('y', lijn) }) ] });
          } },
        { id:'wva-dif-top', naam:'Toppen met f\'(x) = 0', kort:'In een top is de helling 0: los f\'(x) = 0 op en vul de x in f in',
          uit:'<p>In een <b>top</b> (een maximum of een minimum) loopt de grafiek even horizontaal: de helling is <b>0</b>.</p><p>Los dus <b>f\'(x) = 0</b> op. Dat geeft de x van de top. Vul die x in <b>f</b> in voor de y.</p><p>Voorbeeld: f(x) = x² − 6x + 5. f\'(x) = 2x − 6 = 0 geeft x = 3, en f(3) = −4. De top is (3, −4). Bij een derdegraads functie geeft f\'(x) = 0 vaak twee oplossingen: twee toppen.</p>',
          wanneer:'je een maximum of minimum van een functie zoekt.',
          maak:function(R){
            if (R.heel(0, 2) > 0){
              var a = R.kies([-3, -2, -1, 1, 2, 3]), xt = R.heel(-4, 4), c = R.heel(-9, 9), p = [[a, 2], [-2 * a * xt, 1], [c, 0]];
              var d = afg(p), dS = polyS(d), f = function(x){ return waarde(p, x); }, yt = f(xt);
              return af({ vraag:'De top van f?', context:'f(x) = ' + polyS(p) + '. Bereken de coördinaten van de top met de afgeleide. Typ bijvoorbeeld (2, −5).', antwoord:['(' + T(xt) + ', ' + T(yt) + ')'], controle:puntC(xt, yt), invoer:'tekst',
                beeld:function(n){ return plot(f, xt - 3, xt + 3, { punten:n >= 3 ? [[xt, yt, '(' + T(xt) + ', ' + T(yt) + ')']] : [], lijn:n >= 2 ? { m:0, b:yt } : null, aria:'grafiek van f met de top' }); }, stappen:[
                  S('f\'(x) =', dS, 'Differentieer term voor term.', null, { controle:exprC(dS) }),
                  S('f\'(x) = 0: ' + dS + ' = 0, dus x =', xt, 'Los de lineaire vergelijking op.', F(xt, -xt, 'Let op het teken.')),
                  S('y = f(' + T(xt) + ') =', yt, 'Vul ' + T(xt) + ' in f in: ' + invul(p, xt) + '.', F(yt, waarde(d, xt), 'Vul in f in, niet in de afgeleide.')),
                  K(R, 'Is de top een maximum of een minimum?', a < 0 ? 'maximum' : 'minimum', ['maximum', 'minimum'], a < 0 ? 'Er staat een min voor x²: een bergparabool.' : 'Er staat een plus voor x²: een dalparabool.', { orde:['maximum', 'minimum'] }) ] });
            }
            var s, t, sg = R.kies([1, -1]), r = R.heel(-5, 5);
            do { s = R.heel(-4, 3); t = R.heel(s + 1, 4); } while ((s + t) % 2 !== 0);
            var p2 = [[sg, 3], [-sg * 3 * (s + t) / 2, 2], [sg * 3 * s * t, 1], [r, 0]], d2 = afg(p2), dS2 = polyS(d2), f2 = function(x){ return waarde(p2, x); };
            var kw = E([[1, 'x²'], [-(s + t), 'x'], [s * t, '']]);
            return af({ vraag:'De x-coördinaten van de toppen?', context:'f(x) = ' + polyS(p2) + '. Bereken met de afgeleide de x-coördinaten van de toppen. Typ bijvoorbeeld x = 1 of x = 3.',
              beeld:function(n){ return plot(f2, s - 1.5, t + 1.5, { punten:n >= 3 ? [[s, f2(s)], [t, f2(t)]] : [], aria:'grafiek van f met twee toppen' }); }, stappen:[
                S('f\'(x) =', dS2, 'Differentieer term voor term.', null, { controle:exprC(dS2) }),
                S('Deel f\'(x) = 0 door ' + T(3 * sg) + ':', kw + ' = 0', 'Deel elke term van ' + dS2 + ' door ' + T(3 * sg) + '.' + (sg < 0 ? ' Let op de tekens: delen door een negatief getal draait ze om.' : ''), null, { controle:function(v){ return exprC(kw)(String(v).replace(/=\s*0\s*$/, '')); } }),
                S('Ontbind en los op: x =', ['x = ' + T(s) + ' of x = ' + T(t)], 'Zoek twee getallen met som ' + T(s + t) + ' en product ' + T(s * t) + '.', null, { controle:oplC([s, t]) }) ] });
          } }
      ] }
  ]);
})();
