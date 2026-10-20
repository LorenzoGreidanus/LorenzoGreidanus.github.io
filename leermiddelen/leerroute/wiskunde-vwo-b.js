/* De leerroute wiskunde, vwo B. Logaritmen en e en ln, exponentiële en
   logaritmische vergelijkingen, de afgeleide van eˣ, ln x, gˣ, sin x en cos x,
   de productregel, de quotiëntregel en de kettingregel, de raaklijn, extremen en
   buigpunten, primitiveren en de oppervlakte met een integraal, radialen en de
   eenheidscirkel, goniometrische vergelijkingen en de sinusoïde, vectoren
   (lengte, inproduct, hoek, vectorvoorstelling, afstand punt tot lijn) en de
   vergelijking van een cirkel. Elke methode een eigen doel.
   De machtsregel en de afgeleide van een veelterm staan bij havo.
   Antwoorden met formules controleert leesE: die rekent de getypte formule uit
   op een paar punten en vergelijkt met het goede antwoord, dus elke gelijkwaardige
   schrijfwijze is goed (6x^2 − 4x, 2x(3x − 2), e^(2x), 1/2pi, ½√3 ...).
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', PI = Math.PI, PR = '′';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

  /* ================= hulpjes voor stappen ================= */
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
      varianten(typeof k === 'number' ? T(k) : k).forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = uitleg; });
    }
    return o;
  }
  function nz(R, lo, hi){ var x; do { x = R.heel(lo, hi); } while (!x); return x; }
  function paren(n){ return n < 0 ? '(' + T(n) + ')' : T(n); }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function eqAnt(x){ return [T(x), 'x = ' + T(x)]; }
  function hoofd(t){ return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ================= schrijven: machten, termen, breuken, π ================= */
  var SUPC = { '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹', '+':'⁺', '−':'⁻', '-':'⁻', 'x':'ˣ', '(':'⁽', ')':'⁾', 'u':'ᵘ' };
  function sup(t){ return String(t).replace(/\s+/g, '').split('').map(function(c){ return SUPC[c] != null ? SUPC[c] : c; }).join(''); }
  function xm(n){ return n === 0 ? '' : n === 1 ? 'x' : 'x' + sup(n); }
  /* E([[3,'x²'],[-4,'x'],[5,'']]) = '3x² − 4x + 5'; '/x' geeft 3/x, een functienaam krijgt een spatie: 3 sin x */
  function E(termen){
    var s = '';
    termen.forEach(function(t){
      var c = t[0], v = t[1] || ''; if (!c) return;
      var abs = Math.abs(c), stuk;
      if (!v) stuk = T(abs);
      else if (v.charAt(0) === '/') stuk = T(abs) + v;
      else stuk = (abs === 1 ? '' : T(abs) + (/^[a-z]{2}/.test(v) ? ' ' : '')) + v;
      if (!s) s = (c < 0 ? MIN : '') + stuk; else s += (c < 0 ? ' ' + MIN + ' ' : ' + ') + stuk;
    });
    return s || '0';
  }
  function haak(t){ return /[+−]/.test(String(t).replace(/^−/, '')) ? '(' + t + ')' : t; }
  function LOG(g){ return g === 10 ? 'log' : sup(g) + 'log'; }
  function breuk(n, d){ if (d < 0){ n = -n; d = -d; } var g = ggd(n, d) || 1; n /= g; d /= g; return d === 1 ? T(n) : (n < 0 ? MIN : '') + Math.abs(n) + '/' + d; }
  /* n/d · π, zoals in de methode: 5/6π, π, 2π, −1/6π */
  function piT(n, d){
    if (d < 0){ n = -n; d = -d; }
    var g = ggd(n, d) || 1; n /= g; d /= g; if (n === 0) return '0';
    var a = Math.abs(n);
    return (n < 0 ? MIN : '') + (d === 1 ? (a === 1 ? '' : a) : a + '/' + d) + 'π';
  }
  function pt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  /* exacte waarden van sin en cos */
  function exT(v){
    if (Math.abs(v) < 1e-9) return '0';
    var s = v < 0 ? MIN : '', a = Math.abs(v);
    if (Math.abs(a - 1) < 1e-9) return s + '1';
    if (Math.abs(a - 0.5) < 1e-9) return s + '½';
    if (Math.abs(a - Math.SQRT2 / 2) < 1e-9) return s + '½√2';
    if (Math.abs(a - Math.sqrt(3) / 2) < 1e-9) return s + '½√3';
    return null;
  }
  /* veeltermen als lijst coëfficiënten [c0, c1, c2, ...] */
  function pT(c){ var t = []; for (var n = c.length - 1; n >= 0; n--) t.push([c[n], xm(n)]); return E(t); }
  function pD(c){ return c.slice(1).map(function(v, i){ return v * (i + 1); }); }
  function pV(c, x){ return c.reduce(function(s, v, i){ return s + v * Math.pow(x, i); }, 0); }

  /* ================= formules lezen en uitrekenen ================= */
  var SUPM = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9', '⁺':'+', '⁻':'-', 'ˣ':'x', '⁽':'(', '⁾':')', 'ᵘ':'u' };
  var VULG = { '½':'(1/2)', '⅓':'(1/3)', '⅔':'(2/3)', '¼':'(1/4)', '¾':'(3/4)', '⅙':'(1/6)', '⅚':'(5/6)' };
  var FUN = { sin:Math.sin, cos:Math.cos, tan:Math.tan, ln:Math.log, log:function(v){ return Math.log(v) / Math.LN10; }, exp:Math.exp, abs:Math.abs };
  var TOK = /\d+(?:\.\d+)?|\.\d+|sin|cos|tan|ln|log|exp|abs|√|π|e|[xyupt]|[-+*\/^()]/g;
  function prep(t){
    var s = String(t == null ? '' : t).toLowerCase();
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ˣ⁽⁾ᵘ]+/g, function(m){ return '^(' + m.split('').map(function(c){ return SUPM[c]; }).join('') + ')'; });
    s = s.replace(/[½⅓⅔¼¾⅙⅚]/g, function(c){ return VULG[c]; });
    s = s.replace(/[−–—]/g, '-').replace(/[×·⋅∙*]/g, '*').replace(/:/g, '/').replace(/pi/g, 'π').replace(/wortel|sqrt/g, '√');
    s = s.replace(/\|([^|]*)\|/g, 'abs($1)').replace(/,/g, '.').replace(/\s+/g, '');
    return s;
  }
  /* een formule in x (of u, p, t) en y wordt een functie v -> getal; null als hij niet te lezen is.
     Keer mag weg (2x, 3sin x, x·eˣ), sin x zonder haakjes neemt 2x mee (sin 2x), e^2x is e^(2x). */
  function leesE(t){
    var s = prep(t); if (!s) return null;
    var tk = s.match(TOK); if (!tk || tk.join('') !== s) return null;
    var i = 0;
    function kijk(){ return tk[i]; }
    function isVar(x){ return x === 'x' || x === 'u' || x === 'p' || x === 't'; }
    function keten(x){ return x != null && (/^[\d.]/.test(x) || isVar(x) || x === 'y' || x === 'π' || x === 'e' || x === '('); }
    function begin(x){ return keten(x) || x === '√' || (x != null && FUN.hasOwnProperty(x)); }
    function getal(c){ var f = function(){ return c; }; f.num = true; return f; }
    function maal(a, b){ return function(v){ return a(v) * b(v); }; }
    function atoom(){
      var x = tk[i++]; if (x == null) return null;
      if (/^[\d.]/.test(x)) return getal(parseFloat(x));
      if (isVar(x)) return function(v){ return v.x; };
      if (x === 'y') return function(v){ return v.y; };
      if (x === 'π') return getal(PI);
      if (x === 'e'){ var f = function(){ return Math.E; }; f.isE = true; return f; }
      if (x === '('){ var p = som(); if (!p || tk[i++] !== ')') return null; return p; }
      if (x === '√'){ var a = kijk() === '(' ? atoom() : macht(); if (!a) return null; return function(v){ return Math.sqrt(a(v)); }; }
      if (FUN.hasOwnProperty(x)){
        var fn = FUN[x], arg;
        if (kijk() === '('){ i++; arg = som(); if (!arg || tk[i++] !== ')') return null; }
        else { arg = macht(); if (!arg) return null; while (keten(kijk())){ var b = macht(); if (!b) return null; arg = maal(arg, b); } }
        return function(v){ return fn(arg(v)); };
      }
      return null;
    }
    function expo(isE){
      if (kijk() === '-'){ i++; var m = expo(isE); return m && function(v){ return -m(v); }; }
      if (kijk() === '+'){ i++; return expo(isE); }
      var a = atoom(); if (!a) return null;
      if (kijk() === '^'){ i++; var e = expo(a.isE); if (!e) return null; var b = a; return function(v){ return Math.pow(b(v), e(v)); }; }
      if (isE && a.num && isVar(kijk())){ var x = atoom(); return maal(a, x); }
      return a;
    }
    function macht(){
      var a = atoom(); if (!a) return null;
      if (kijk() === '^'){ i++; var e = expo(a.isE); if (!e) return null; return function(v){ return Math.pow(a(v), e(v)); }; }
      return a;
    }
    function unair(){
      if (kijk() === '-'){ i++; var p = unair(); return p && function(v){ return -p(v); }; }
      if (kijk() === '+'){ i++; return unair(); }
      return macht();
    }
    function term(){
      var p = unair(); if (!p) return null;
      for (;;){
        var x = kijk();
        if (x === '*' || x === '/'){ i++; var q = unair(); if (!q) return null; p = x === '*' ? maal(p, q) : (function(a, b){ return function(v){ return a(v) / b(v); }; })(p, q); }
        else if (begin(x)){ var q2 = macht(); if (!q2) return null; p = maal(p, q2); }
        else return p;
      }
    }
    function som(){
      var p = term(); if (!p) return null;
      while (kijk() === '+' || kijk() === '-'){
        var o = tk[i++], q = term(); if (!q) return null;
        p = (function(a, b, plus){ return function(v){ return plus ? a(v) + b(v) : a(v) - b(v); }; })(p, q, o === '+');
      }
      return p;
    }
    var uit = som();
    return uit && i === tk.length ? uit : null;
  }
  function wrd(f, x, y){ try { var r = f({ x:x, y:y == null ? 0 : y }); return typeof r === 'number' ? r : NaN; } catch (e){ return NaN; } }
  function gelijk(a, b){ return isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b)); }
  /* alleen wat na het laatste = staat: f'(x) = ..., y = ..., x ≈ ... */
  function rechts(v){ var s = String(v == null ? '' : v).replace(/≈/g, '='); var k = s.lastIndexOf('='); return k >= 0 ? s.slice(k + 1) : s; }
  var XS = [0.37, 0.81, 1.23, 1.77, 2.41, 3.37];
  /* dezelfde functie van x */
  function fC(verwacht){
    var q = leesE(verwacht); if (!q) throw new Error('formule niet te lezen: ' + verwacht);
    return function(v){
      var p = leesE(rechts(v)); if (!p) return false;
      var n = 0;
      for (var j = 0; j < XS.length; j++){ var a = wrd(q, XS[j]), b = wrd(p, XS[j]); if (!isFinite(a)) continue; if (!gelijk(b, a)) return false; n++; }
      return n >= 3;
    };
  }
  /* een primitieve: mag een constante verschillen, + c mag erachter */
  function zonderC(t){ return String(t).replace(/\+\s*c\s*$/i, ''); }
  function primC(verwacht){
    var q = leesE(zonderC(verwacht)); if (!q) throw new Error('formule niet te lezen: ' + verwacht);
    return function(v){
      var p = leesE(zonderC(rechts(v))); if (!p) return false;
      var d = null, n = 0;
      for (var j = 0; j < XS.length; j++){
        var a = wrd(q, XS[j]), b = wrd(p, XS[j]); if (!isFinite(a)) continue; if (!isFinite(b)) return false;
        if (d == null) d = b - a; else if (Math.abs(b - a - d) > 1e-7 * Math.max(1, Math.abs(a))) return false;
        n++;
      }
      return n >= 3;
    };
  }
  /* een getal, ook exact getypt: 5/6π, √13, 2√5, 1/2 */
  function getalVan(t){ var p = leesE(rechts(t)); if (!p) return NaN; var a = wrd(p, 0.37, 0.5), b = wrd(p, 1.91, -0.3); return gelijk(a, b) ? a : NaN; }
  function getalC(w, tol){ return function(v){ var a = getalVan(v); return isFinite(a) && Math.abs(a - w) <= (tol || 1e-9 * Math.max(1, Math.abs(w))); }; }
  /* een rij oplossingen: "x = 1/6π of x = 5/6π", "−2; 2", "±2" */
  function lijstC(waarden){
    var w = waarden.slice().sort(function(a, b){ return a - b; });
    return function(v){
      var delen = String(v).replace(/[−–—]/g, '-').split(/;|∨|\bof\b|\ben\b|,(?!\d)/i).map(function(x){ return x.trim(); }).filter(Boolean), l = [];
      for (var j = 0; j < delen.length; j++){
        var d = rechts(delen[j]).trim(), pm = /^(\+\/-|±)/.test(d);
        var a = getalVan(d.replace(/^(\+\/-|±)/, '')); if (!isFinite(a)) return false;
        l.push(a); if (pm) l.push(-a);
      }
      l.sort(function(a, b){ return a - b; });
      l = l.filter(function(x, k){ return !k || Math.abs(x - l[k - 1]) > 1e-9; });
      return l.length === w.length && l.every(function(x, k){ return gelijk(x, w[k]); });
    };
  }
  function lijstT(l, f){ return l.map(function(x){ return 'x = ' + f(x); }).join(' of '); }
  /* een punt of vector: (3, −2) */
  function delen2(v){
    var s = String(v).replace(/[−–—]/g, '-').replace(/^[^=]*=/, '').replace(/[()\[\]\s]/g, '').replace(/^[a-z]+/i, '');
    var d = s.split(/[;,]/); if (d.length !== 2) return null;
    var a = getalVan(d[0]), b = getalVan(d[1]); return isFinite(a) && isFinite(b) ? [a, b] : null;
  }
  function coordC(x, y){ return function(v){ var d = delen2(v); return !!d && gelijk(d[0], x) && gelijk(d[1], y); }; }
  /* een normaalvector: elke vector die niet 0 is en loodrecht staat op r */
  function normC(r1, r2){ return function(v){ var d = delen2(v); return !!d && (d[0] || d[1]) && Math.abs(d[0] * r1 + d[1] * r2) < 1e-9; }; }
  /* een vergelijking in x en y: goed als links min rechts een veelvoud is van wat het moet zijn */
  var PT = [[0.37, 1.21], [1.3, -0.7], [2.2, 0.45], [-1.1, 2.3], [3.1, -2.2], [0.9, 3.4], [-2.3, -1.6]];
  function vglC(verwacht){
    var dd = verwacht.split('='), qa = leesE(dd[0]), qb = leesE(dd[1]);
    if (!qa || !qb) throw new Error('vergelijking niet te lezen: ' + verwacht);
    return function(v){
      var e = String(v).split('='); if (e.length !== 2) return false;
      var a = leesE(e[0]), b = leesE(e[1]); if (!a || !b) return false;
      var lam = null, n = 0;
      for (var j = 0; j < PT.length; j++){
        var g = wrd(qa, PT[j][0], PT[j][1]) - wrd(qb, PT[j][0], PT[j][1]), h = wrd(a, PT[j][0], PT[j][1]) - wrd(b, PT[j][0], PT[j][1]);
        if (!isFinite(g) || !isFinite(h)) return false;
        if (Math.abs(g) < 1e-6){ if (Math.abs(h) > 1e-6) return false; continue; }
        var l = h / g;
        if (lam == null) lam = l; else if (Math.abs(l - lam) > 1e-7 * Math.max(1, Math.abs(lam))) return false;
        n++;
      }
      return n >= 3 && lam != null && Math.abs(lam) > 1e-9;
    };
  }
  /* kwadraatafsplitsen: (x − 3)² − 9, precies in die vorm */
  function afsplitsC(letter, p, q){
    var re = new RegExp('^\\(' + letter + '([+-]\\d+(?:\\.\\d+)?)\\)\\^\\(?2\\)?([+-]\\d+(?:\\.\\d+)?)$');
    return function(v){ var m = re.exec(prep(rechts(v))); return !!m && Math.abs(+m[1] - p) < 1e-9 && Math.abs(+m[2] - q) < 1e-9; };
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
  function stip(x, y, k, r){ return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + (r || 5.5) + '" style="fill:' + (k || KL[1]) + '"/>'; }
  function pijl(x1, y1, x2, y2, k, w){
    var a = Math.atan2(y2 - y1, x2 - x1), h = 11;
    return ln(x1, y1, x2, y2, { k:k, w:w || 3 }) + '<path d="M' + n1(x2) + ' ' + n1(y2) + ' L' + n1(x2 - h * Math.cos(a - 0.42)) + ' ' + n1(y2 - h * Math.sin(a - 0.42)) +
      ' M' + n1(x2) + ' ' + n1(y2) + ' L' + n1(x2 - h * Math.cos(a + 0.42)) + ' ' + n1(y2 - h * Math.sin(a + 0.42)) + '" style="fill:none;stroke:' + k + ';stroke-width:' + (w || 3) + ';stroke-linecap:round"/>';
  }
  function stapje(span){ var l = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]; for (var i = 0; i < l.length; i++) if (span / l[i] <= 10) return l[i]; return 1000; }
  function ticks(lo, hi, st){ var l = []; for (var v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) l.push({ x:Math.round(v * 1000) / 1000, t:T(Math.round(v * 1000) / 1000) }); return l; }
  /* een assenstelsel met grafieken: { x:[lo,hi], y:[lo,hi], fns:[{f,k,dash}], vlak:{f,a,b}, punten:[{x,y,t}], hl:[{y}|{x}], cirkels:[{m,r}], xt:[{x,t}] } */
  function plot(o){
    var W = 440, H = 300, L = 40, Rr = 16, Tp = 14, B = 28;
    var x0 = o.x[0], x1 = o.x[1], y0 = o.y[0], y1 = o.y[1];
    function px(x){ return L + (x - x0) / (x1 - x0) * (W - L - Rr); }
    function py(y){ return Tp + (y1 - y) / (y1 - y0) * (H - Tp - B); }
    function binnenY(y){ return Math.max(y0, Math.min(y1, y)); }
    var s = '', xt = o.xt || ticks(x0, x1, o.xs || stapje(x1 - x0)), yt = ticks(y0, y1, o.ys || stapje(y1 - y0));
    var ax = y0 <= 0 && y1 >= 0 ? 0 : y0, ay = x0 <= 0 && x1 >= 0 ? 0 : x0;
    xt.forEach(function(t){ s += ln(px(t.x), py(y0), px(t.x), py(y1), { k:'var(--muted)', w:1, op:0.3 }); });
    yt.forEach(function(t){ s += ln(px(x0), py(t.x), px(x1), py(t.x), { k:'var(--muted)', w:1, op:0.3 }); });
    if (o.vlak){
      var v = o.vlak, d = 'M' + n1(px(v.a)) + ' ' + n1(py(binnenY(0)));
      for (var j = 0; j <= 90; j++){ var xv = v.a + (v.b - v.a) * j / 90, yv = v.f(xv); if (isFinite(yv)) d += ' L' + n1(px(xv)) + ' ' + n1(py(binnenY(yv))); }
      s += '<path d="' + d + ' L' + n1(px(v.b)) + ' ' + n1(py(binnenY(0))) + ' Z" style="fill:var(--lr-1);fill-opacity:.22;stroke:none"/>';
    }
    s += ln(px(x0), py(ax), px(x1), py(ax), { w:1.8 }) + ln(px(ay), py(y0), px(ay), py(y1), { w:1.8 });
    xt.forEach(function(t){ if (Math.abs(t.x - ay) > 1e-9 || ax !== 0) s += tx(px(t.x), py(ax) + 18, t.t, { m:'klein' }); });
    yt.forEach(function(t){ if (Math.abs(t.x - ax) > 1e-9 || ay !== 0) s += tx(px(ay) - 6, py(t.x) + 5, t.t, { m:'klein', a:'end' }); });
    if (ax === 0 && ay === 0) s += tx(px(0) - 6, py(0) + 18, '0', { m:'klein', a:'end' });
    s += tx(px(x1) - 4, py(ax) - 7, 'x', { m:'klein', a:'end' }) + tx(px(ay) + 8, py(y1) + 12, 'y', { m:'klein', a:'start' });
    (o.hl || []).forEach(function(h){ s += h.y != null ? ln(px(x0), py(h.y), px(x1), py(h.y), { k:h.k || 'var(--muted)', w:1.6, dash:'6 5' }) : ln(px(h.x), py(y0), px(h.x), py(y1), { k:h.k || 'var(--muted)', w:1.6, dash:'6 5' }); });
    (o.fns || []).forEach(function(c){
      var d = '', pen = false, marge = (y1 - y0) * 0.02;
      for (var j = 0; j <= 260; j++){
        var x = x0 + (x1 - x0) * j / 260, y = c.f(x);
        if (!isFinite(y) || y < y0 - marge || y > y1 + marge){ pen = false; continue; }
        d += (pen ? ' L' : 'M') + n1(px(x)) + ' ' + n1(py(y)); pen = true;
      }
      if (d) s += '<path d="' + d + '" style="fill:none;stroke:' + (c.k || KL[0]) + ';stroke-width:' + (c.w || 2.8) + (c.dash ? ';stroke-dasharray:' + c.dash : '') + ';stroke-linejoin:round;stroke-linecap:round"/>';
    });
    (o.cirkels || []).forEach(function(c){
      s += '<ellipse cx="' + n1(px(c.m[0])) + '" cy="' + n1(py(c.m[1])) + '" rx="' + n1(c.r * (W - L - Rr) / (x1 - x0)) + '" ry="' + n1(c.r * (H - Tp - B) / (y1 - y0)) + '" style="fill:none;stroke:' + (c.k || KL[0]) + ';stroke-width:2.8"/>';
    });
    (o.punten || []).forEach(function(p){ s += stip(px(p.x), py(p.y), p.k) + (p.t ? tx(px(p.x) + 8, py(p.y) - 9, p.t, { m:'klein', a:'start', vet:true, k:p.k || KL[1] }) : ''); });
    return svg(W, H, s, o.aria || 'grafiek', 520);
  }
  function bereik(fs, x0, x1, extra, klem){
    var lo = Infinity, hi = -Infinity;
    fs.forEach(function(f){ for (var j = 0; j <= 120; j++){ var y = f(x0 + (x1 - x0) * j / 120); if (isFinite(y)){ lo = Math.min(lo, y); hi = Math.max(hi, y); } } });
    (extra || []).forEach(function(y){ lo = Math.min(lo, y); hi = Math.max(hi, y); });
    if (klem){ lo = Math.max(lo, klem[0]); hi = Math.min(hi, klem[1]); }
    if (hi - lo < 4){ var m = (hi + lo) / 2; lo = m - 2; hi = m + 2; }
    var pad = (hi - lo) * 0.1; return [lo - pad, hi + pad];
  }
  /* de eenheidscirkel: { hoek, label, proj, lijn:{sin|cos, v, t}, punten:[hoeken] } */
  function eenheid(o){
    var c = 150, r = 104, s = '';
    s += ln(22, c, 278, c, { w:1.6 }) + ln(c, 278, c, 22, { w:1.6 });
    s += '<circle cx="150" cy="150" r="104" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    s += tx(c + r + 10, c + 18, '1', { m:'klein' }) + tx(c - r - 12, c + 18, MIN + '1', { m:'klein' }) + tx(c - 10, c - r - 6, '1', { m:'klein', a:'end' }) + tx(c - 10, c + r + 16, MIN + '1', { m:'klein', a:'end' });
    if (o.lijn){
      var v = o.lijn.v;
      if (o.lijn.sin) s += ln(c - r - 16, c - v * r, c + r + 16, c - v * r, { k:KL[1], w:2, dash:'7 5' }) + tx(c + r + 18, c - v * r + 5, 'y = ' + o.lijn.t, { m:'klein', a:'start', k:KL[1], vet:true });
      else s += ln(c + v * r, c - r - 16, c + v * r, c + r + 16, { k:KL[1], w:2, dash:'7 5' }) + tx(c + v * r, c + r + 32, 'x = ' + o.lijn.t, { m:'klein', k:KL[1], vet:true });
    }
    (o.punten || []).forEach(function(h){ var x = c + r * Math.cos(h), y = c - r * Math.sin(h); s += ln(c, c, x, y, { k:KL[0], w:2.4 }) + stip(x, y, KL[0], 6); });
    if (o.hoek != null){
      var h = o.hoek, x = c + r * Math.cos(h), y = c - r * Math.sin(h), b = 28;
      if (Math.abs(h) >= 2 * PI - 1e-9) s += '<circle cx="150" cy="150" r="' + b + '" style="fill:none;stroke:' + KL[2] + ';stroke-width:2.4"/>';
      else s += '<path d="M' + (c + b) + ' ' + c + ' A' + b + ' ' + b + ' 0 ' + (Math.abs(h) > PI ? 1 : 0) + ' ' + (h > 0 ? 0 : 1) + ' ' + n1(c + b * Math.cos(h)) + ' ' + n1(c - b * Math.sin(h)) + '" style="fill:none;stroke:' + KL[2] + ';stroke-width:2.4"/>';
      if (o.proj) s += ln(x, y, x, c, { k:KL[3], w:2, dash:'5 4' }) + ln(x, y, c, y, { k:KL[3], w:2, dash:'5 4' });
      s += ln(c, c, x, y, { k:KL[0], w:2.6 }) + stip(x, y, KL[1], 6.5);
      if (o.label) s += tx(c + 46 * Math.cos(h / 2 || 0.3) + 4, c - 46 * Math.sin(h / 2 || 0.3) + 4, o.label, { m:'klein', a:'start', k:KL[2], vet:true });
    }
    return svg(300, 300, s, o.aria || 'eenheidscirkel', 300);
  }
  /* vectoren in een rooster: [{v:[x,y], van:[x,y], k, t}] */
  function vecBeeld(lijst, aria){
    var M = 4;
    lijst.forEach(function(p){ var v0 = p.van || [0, 0]; [v0[0], v0[1], v0[0] + p.v[0], v0[1] + p.v[1]].forEach(function(z){ M = Math.max(M, Math.abs(z)); }); });
    M = Math.ceil(M) + 1;
    var W = 320, m = 12, u = (W - 2 * m) / (2 * M), s = '';
    function px(x){ return m + (x + M) * u; } function py(y){ return m + (M - y) * u; }
    for (var g = -M; g <= M; g++){ s += ln(px(g), py(-M), px(g), py(M), { k:'var(--muted)', w:1, op:g ? 0.3 : 1 }) + ln(px(-M), py(g), px(M), py(g), { k:'var(--muted)', w:1, op:g ? 0.3 : 1 }); }
    s += ln(px(-M), py(0), px(M), py(0), { w:1.6 }) + ln(px(0), py(-M), px(0), py(M), { w:1.6 });
    lijst.forEach(function(p){
      var v0 = p.van || [0, 0], x2 = v0[0] + p.v[0], y2 = v0[1] + p.v[1];
      s += pijl(px(v0[0]), py(v0[1]), px(x2), py(y2), p.k, p.dun ? 2.2 : 3);
      if (p.t) s += tx((px(v0[0]) + px(x2)) / 2 + 10, (py(v0[1]) + py(y2)) / 2 - 8, p.t, { m:'klein', k:p.k, vet:true, a:'start' });
    });
    return svg(W, W, s, aria || 'vectoren in een rooster', 340);
  }
  /* een tekenschema: nul = getallen waar f′ nul is, tekens = '+'/'−' per stuk (of null) */
  function tekenschema(nul, tekens){
    var W = 440, x0 = 50, x1 = 420, y = 50, s = tx(24, y + 5, 'f' + PR, { vet:true });
    s += ln(x0, y, x1, y, { w:2 });
    var pos = nul.map(function(z, i){ return x0 + (i + 1) * (x1 - x0) / (nul.length + 1); });
    pos.forEach(function(xp, i){ s += ln(xp, y - 8, xp, y + 8, { w:2 }) + tx(xp, y + 28, 'x = ' + T(nul[i]), { m:'klein' }) + tx(xp, y - 14, '0', { m:'klein', vet:true }); });
    if (tekens){
      var grens = [x0].concat(pos, [x1]);
      tekens.forEach(function(t, i){ var mid = (grens[i] + grens[i + 1]) / 2; s += tx(mid, y - 12, t === '+' ? '+ + +' : MIN + ' ' + MIN + ' ' + MIN, { k:t === '+' ? KL[3] : KL[1], vet:true }); });
    }
    return svg(W, 92, s, 'tekenschema van de afgeleide', 480);
  }

  /* ================= logaritmen en vergelijkingen: de manieren ================= */
  /* gelijke grondtallen: (p^m)^(ax + b) = p^r */
  function mGrondtal(R){
    var g, m, a, b, r, x;
    for (var p = 0; p < 400; p++){
      g = R.kies([2, 2, 3, 5]); m = g === 2 ? R.kies([1, 2, 3]) : R.kies([1, 2]); a = R.kies([1, 1, 2, 3]); b = R.heel(-3, 3); r = R.heel(-3, { 2:9, 3:6, 5:4 }[g]);
      if (!r || (m === 1 && a === 1 && b === 0)) continue;
      x = (r - m * b) / (m * a);
      if (Math.abs(x * 2 - Math.round(x * 2)) < 1e-9 && Math.abs(x) <= 12) break;
    }
    var L = Math.pow(g, m), ex = E([[a, 'x'], [b, '']]), Rv = r > 0 ? T(Math.pow(g, r)) : '1/' + T(Math.pow(g, -r)), st = [];
    if (m > 1) st.push(S('Schrijf het grondtal ' + L + ' als macht van ' + g + ': ' + L + ' = ' + g + '<sup>?</sup>. De exponent:', m, g + sup(m) + ' = ' + L + '.'));
    st.push(S('Schrijf ' + Rv + ' als macht van ' + g + ': ' + Rv + ' = ' + g + '<sup>?</sup>. De exponent:', r,
      r > 0 ? g + sup(r) + ' = ' + Rv + '.' : 'Een breuk 1/' + g + sup(-r) + ' is ' + g + ' tot de macht ' + MIN + (-r) + '.', F(r, -r, 'Let op het teken: een breuk 1/' + g + sup(-r) + ' geeft een negatieve exponent.')));
    var links = m > 1 ? m + '(' + ex + ')' : ex, uit = m > 1 ? E([[m * a, 'x'], [m * b, '']]) : ex;
    st.push(SC((m > 1 ? 'Links staat (' + g + sup(m) + ')<sup>' + ex + '</sup> = ' + g + '<sup>' + m + '(' + ex + ')</sup>. ' : '') + 'De grondtallen zijn gelijk, dus de exponenten ook: ' + links + ' = ' + T(r) + '. Los op: x =', eqAnt(x), getalC(x),
      (m > 1 ? 'Haakjes weg: ' + uit + ' = ' + T(r) + '. ' : '') + (m * b ? (m * b > 0 ? 'Trek ' + (m * b) + ' af' : 'Tel ' + (-m * b) + ' op') + ': ' + E([[m * a, 'x']]) + ' = ' + T(r - m * b) + '. ' : '') + (m * a > 1 ? 'Deel door ' + (m * a) + ': x = ' + T(x) + '.' : 'x = ' + T(x) + '.')));
    return { vraag:L + '^(' + ex + ') = ' + Rv, vraagHtml:L + '<sup>' + ex + '</sup> = ' + Rv, stappen:st, antwoord:eqAnt(x), controle:getalC(x), soort:0 };
  }
  /* met de logaritme: c · g^x + d = rechts */
  function mLogVgl(R){
    var g, A, q;
    for (var p = 0; p < 400; p++){ g = R.kies([2, 3, 4, 5, 6, 7]); A = R.heel(3, 60); q = Math.log(A) / Math.log(g); if (Math.abs(q * 6 - Math.round(q * 6)) > 1e-6) break; }
    var c = R.kies([1, 1, 2, 3, 4, 5]), d = R.kies([0, 0, 0, nz(R, -20, 20)]), rh = c * A + d, x = Math.log(A) / Math.log(g), st = [];
    var links = (c > 1 ? c + ' · ' : '') + g + '<sup>x</sup>' + (d ? (d > 0 ? ' + ' + d : ' ' + MIN + ' ' + (-d)) : '');
    if (c > 1 || d) st.push(S('Maak de macht vrij: ' + g + '<sup>x</sup> =', A,
      (d ? (d > 0 ? 'Trek eerst ' + d + ' af' : 'Tel eerst ' + (-d) + ' op') + ': ' + T(rh - d) + '. ' : '') + (c > 1 ? 'Deel door ' + c + ': ' + T(rh - d) + ' : ' + c + ' = ' + A + '.' : ''),
      F(A, rh, 'Er staat nog iets bij de macht. Haal dat eerst weg.')));
    st.push(K(R, g + '<sup>x</sup> = ' + A + '. Dus x =', LOG(g) + ' ' + A, [LOG(A) + ' ' + g, A + ' : ' + g], 'gˣ = a betekent x = ᵍlog a: het grondtal staat linksboven de log.'));
    st.push(S('Reken uit met log ' + A + ' : log ' + g + '. Rond af op 2 decimalen: x ≈', rnd(x, 2), 'Typ op je rekenmachine log(' + A + ') ÷ log(' + g + ').',
      F(rnd(x, 2), rnd(A / g, 2), 'Je deelde ' + A + ' door ' + g + '. Je deelt de logaritmen: log ' + A + ' : log ' + g + '.')));
    return { vraag:(c > 1 ? c + ' · ' : '') + g + '^x' + (d ? (d > 0 ? ' + ' + d : ' ' + MIN + ' ' + (-d)) : '') + ' = ' + T(rh), vraagHtml:links + ' = ' + T(rh), stappen:st, antwoord:T(rnd(x, 2)), soort:1 };
  }

  /* ================= differentiëren: de manieren ================= */
  /* standaardfuncties: een som van termen */
  function mSom(R){
    var soort = R.kies(['e', 'l', 's']), a = nz(R, -6, 6), b = nz(R, -5, 5), n = R.kies([1, 2, 3, 4]), st = [], f, fp, t1, t1p;
    var t2 = E([[b, xm(n)]]), t2p = E([[n * b, xm(n - 1)]]);
    if (soort === 'e'){ t1 = E([[a, 'eˣ']]); t1p = t1; }
    else if (soort === 'l'){ t1 = E([[a, 'ln x']]); t1p = E([[a, '/x']]); }
    else { t1 = E([[a, 'sin x']]); t1p = E([[a, 'cos x']]); }
    f = soort === 'e' ? E([[a, 'eˣ'], [b, xm(n)]]) : soort === 'l' ? E([[a, 'ln x'], [b, xm(n)]]) : E([[a, 'sin x'], [b, xm(n)]]);
    fp = soort === 'e' ? E([[a, 'eˣ'], [n * b, xm(n - 1)]]) : soort === 'l' ? E([[a, '/x'], [n * b, xm(n - 1)]]) : E([[a, 'cos x'], [n * b, xm(n - 1)]]);
    st.push(SC('De afgeleide van ' + t1 + ' is', t1p, fC(t1p), soort === 'e' ? 'eˣ is zijn eigen afgeleide.' : soort === 'l' ? 'De afgeleide van ln x is 1/x.' : 'De afgeleide van sin x is cos x.'));
    st.push(SC('De afgeleide van ' + t2 + ' is', t2p, fC(t2p), 'Machtsregel: de exponent ervoor, en de exponent 1 lager.'));
    st.push(SC('Samen: f' + PR + '(x) =', fp, fC(fp), 'Tel de afgeleiden op: ' + fp + '.'));
    return { vraag:'f(x) = ' + f, stappen:st, antwoord:fp, controle:fC(fp), soort:3 };
  }
  /* de productregel */
  var VFUN = [['eˣ', 'eˣ'], ['ln x', '1/x'], ['sin x', 'cos x'], ['cos x', MIN + 'sin x']];
  function mProduct(R){
    var u, up, v = R.kies(VFUN);
    if (R.heel(0, 2)){ var c = R.kies([1, 1, 2, 3]), n = R.kies([1, 2, 2, 3]); u = E([[c, xm(n)]]); up = E([[c * n, xm(n - 1)]]); }
    else { var p = nz(R, -5, 5); u = E([[1, 'x'], [p, '']]); up = '1'; }
    var t1 = up === '1' ? v[0] : haak(up) + ' · ' + v[0], neg = v[1].charAt(0) === MIN, t2 = haak(u) + ' · ' + (neg ? v[1].slice(1) : v[1]);
    var fp = t1 + (neg ? ' ' + MIN + ' ' : ' + ') + t2, f = haak(u) + ' · ' + v[0];
    return { vraag:'f(x) = ' + f, soort:0, antwoord:fp, controle:fC(fp), stappen:[
      SC('u = ' + u + '. u' + PR + ' =', up, fC(up), 'Machtsregel: de exponent ervoor en 1 lager. Een los getal valt weg.'),
      SC('v = ' + v[0] + '. v' + PR + ' =', v[1], fC(v[1]), { 'eˣ':'eˣ blijft eˣ.', 'ln x':'ln x wordt 1/x.', 'sin x':'sin x wordt cos x.', 'cos x':'cos x wordt −sin x.' }[v[0]]),
      SC('f' + PR + '(x) = u' + PR + ' · v + u · v' + PR + ' =', fp, fC(fp), 'Vul in: ' + haak(up) + ' · ' + v[0] + ' + ' + haak(u) + ' · ' + haak(v[1]) + '.',
        F(fp, haak(up) + ' · ' + v[1], 'Bij een product vermenigvuldig je niet gewoon de afgeleiden. Gebruik u' + PR + 'v + uv' + PR + '.')) ] };
  }
  /* de quotiëntregel */
  function mQuot(R){
    var soort = R.kies(['lin', 'lin', 'kw', 'e', 'l']), t, tp, n, np = '1', teller, fp;
    if (soort === 'lin'){
      var a = R.kies([1, 2, 3]), b, d;
      do { b = nz(R, -6, 6); d = nz(R, -5, 5); } while (a * d - b === 0);
      t = E([[a, 'x'], [b, '']]); tp = T(a); n = E([[1, 'x'], [d, '']]); teller = T(a * d - b); fp = teller + '/(' + n + ')²';
    } else if (soort === 'kw'){
      var p = nz(R, -5, 5); t = 'x²'; tp = '2x'; n = E([[1, 'x'], [p, '']]); teller = E([[1, 'x²'], [2 * p, 'x']]); fp = '(' + teller + ')/(' + n + ')²';
    } else if (soort === 'e'){ t = 'eˣ'; tp = 'eˣ'; n = 'x'; teller = 'x · eˣ ' + MIN + ' eˣ'; fp = '(' + teller + ')/x²'; }
    else { t = 'ln x'; tp = '1/x'; n = 'x'; teller = '1 ' + MIN + ' ln x'; fp = '(' + teller + ')/x²'; }
    var f = haak(t) + '/' + haak(n), nk = n === 'x' ? 'x²' : '(' + n + ')²';
    return { vraag:'f(x) = ' + f, soort:1, antwoord:fp, controle:fC(fp), stappen:[
      SC('Teller t = ' + t + '. t' + PR + ' =', tp, fC(tp), soort === 'e' ? 'eˣ blijft eˣ.' : soort === 'l' ? 'ln x wordt 1/x.' : 'Machtsregel.'),
      SC('Noemer n = ' + n + '. n' + PR + ' =', np, fC(np), 'De afgeleide van x is 1; een los getal valt weg.'),
      SC('De nieuwe teller: n · t' + PR + ' ' + MIN + ' t · n' + PR + ' = ' + haak(n) + ' · ' + haak(tp) + ' ' + MIN + ' ' + haak(t) + ' · 1. Werk uit:', teller, fC(teller),
        'Eerst de noemer keer de afgeleide van de teller, dan min de teller keer de afgeleide van de noemer.'),
      SC('f' + PR + '(x) = (n · t' + PR + ' ' + MIN + ' t · n' + PR + ')/n² =', fp, fC(fp), 'Zet de nieuwe teller boven ' + nk + '.',
        F(fp, '(' + teller + ')/(' + n + ')', 'De noemer gaat in het kwadraat.')) ] };
  }
  /* de kettingregel */
  function mKetting(R){
    var soort = R.kies(['macht', 'macht', 'e', 'sin', 'cos', 'ln', 'wortel']), a, b, n, u, buiten, bp, fp, f;
    if (soort === 'macht'){ a = R.kies([2, 3, 4, 5, -2]); b = nz(R, -7, 7); n = R.kies([2, 3, 4, 5]); }
    else if (soort === 'ln' || soort === 'wortel'){ a = R.kies([2, 3, 4]); b = R.heel(1, 6); }
    else { a = R.kies([2, 3, 4, -1, -2]); b = R.kies([0, 0, nz(R, -4, 4)]); }
    u = E([[a, 'x'], [b, '']]);
    if (soort === 'macht'){ f = '(' + u + ')' + sup(n); buiten = 'u' + sup(n); bp = n + 'u' + (n - 1 > 1 ? sup(n - 1) : ''); fp = T(n * a) + '(' + u + ')' + (n - 1 > 1 ? sup(n - 1) : ''); }
    else if (soort === 'e'){ f = 'e' + sup(u); buiten = 'eᵘ'; bp = 'eᵘ'; fp = E([[a, 'e' + sup(u)]]); }
    else if (soort === 'sin'){ f = 'sin(' + u + ')'; buiten = 'sin u'; bp = 'cos u'; fp = E([[a, 'cos(' + u + ')']]); }
    else if (soort === 'cos'){ f = 'cos(' + u + ')'; buiten = 'cos u'; bp = MIN + 'sin u'; fp = E([[-a, 'sin(' + u + ')']]); }
    else if (soort === 'ln'){ f = 'ln(' + u + ')'; buiten = 'ln u'; bp = '1/u'; fp = a + '/(' + u + ')'; }
    else { f = '√(' + u + ')'; buiten = '√u'; bp = '1/(2√u)'; fp = a + '/(2√(' + u + '))'; }
    return { vraag:'f(x) = ' + f, soort:2, antwoord:fp, controle:fC(fp), stappen:[
      S('De binnenste functie: u = ' + u + '. u' + PR + ' =', a, 'Bij ' + u + ' is de afgeleide het getal voor de x.', F(a, b, 'Dat is het losse getal. Je hebt het getal voor de x nodig.')),
      SC('De buitenste functie: ' + buiten + '. De afgeleide daarvan (in u) is', bp, fC(bp), { macht:'Machtsregel: ' + buiten + ' wordt ' + bp + '.', e:'eᵘ blijft eᵘ.', sin:'sin u wordt cos u.', cos:'cos u wordt −sin u.', ln:'ln u wordt 1/u.', wortel:'√u = u^½ wordt ½ · u^(−½) = 1/(2√u).' }[soort]),
      SC('f' + PR + '(x) = (afgeleide buiten, met u = ' + u + ') · u' + PR + ' =', fp, fC(fp), 'Vul u = ' + u + ' in bij ' + bp + ' en doe keer ' + paren(a) + '.',
        F(fp, bp.replace(/u/g, '(' + u + ')'), 'Vergeet niet keer de afgeleide van de binnenste functie, ' + paren(a) + '.')) ] };
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= logaritmen ================= */
    { groep:{ id:'wvb-log', niveau:'vwo', domein:'algebra', naam:'Logaritmen, e en ln',
        uit:'Een logaritme is het omgekeerde van een macht. Je leert wat ᵍlog a betekent, de rekenregels voor logaritmen, en rekenen met het getal e en de natuurlijke logaritme ln.' },
      doelen:[
        { id:'wvb-log-def', naam:'Wat een logaritme is', kort:'ᵍlog a is de exponent waarmee je g moet verheffen om a te krijgen: ²log 8 = 3, want 2³ = 8',
          uit:'<p><b>ᵍlog a</b> is het getal waartoe je g moet verheffen om a te krijgen. ²log 8 = 3, want 2³ = 8. Het getal g heet het <b>grondtal</b>.</p><p>Schrijf a als een <b>macht van g</b>. De exponent is het antwoord: ³log 81 = 4, want 3⁴ = 81.</p><p>Een breuk geeft een negatieve exponent: ²log (1/8) = −3, want 2⁻³ = 1/8. Een wortel is de macht ½: ⁹log 3 = ½.</p><p>Staat er <b>log</b> zonder grondtal, dan is het grondtal 10: log 1000 = 3.</p>',
          wanneer:'je een logaritme zonder rekenmachine wilt uitrekenen.',
          maak:function(R){
            var soort = R.kies(['pos', 'pos', 'pos', 'neg', 'neg', 'wortel']), g, n, a, aT, st;
            if (soort === 'pos'){ g = R.kies([2, 2, 3, 3, 4, 5, 10]); n = R.heel(2, { 2:7, 3:5, 4:4, 5:4, 10:5 }[g]); a = Math.pow(g, n); aT = T(a); }
            else if (soort === 'neg'){ g = R.kies([2, 3, 5, 10]); n = R.heel(1, g === 2 ? 4 : g === 10 ? 3 : 2); a = Math.pow(g, n); aT = g === 10 ? T(1 / a) : '1/' + a; }
            else { g = R.kies([4, 9, 16, 25, 100]); a = Math.sqrt(g); aT = T(a); }
            var vr = LOG(g) + ' ' + (soort === 'neg' && g !== 10 ? '(' + aT + ')' : aT);
            st = [K(R, vr + ' betekent:', g + ' tot de macht ? is ' + aT, [aT + ' tot de macht ? is ' + g, g + ' keer ? is ' + aT], 'Het grondtal ' + g + ' staat linksboven de log. Je zoekt de exponent bij ' + g + '.')];
            if (soort === 'pos'){
              var rij = []; for (var k = 1; k <= n; k++) rij.push(g + sup(k) + ' = ' + T(Math.pow(g, k)));
              st.push(S('Welke macht van ' + g + ' is ' + aT + '? ' + g + '<sup>?</sup> = ' + aT + ', dus ' + vr + ' =', n, 'Machten van ' + g + ': ' + rij.join(', ') + '.', F(n, a / g, 'Je deelde. Je zoekt hoe vaak je ' + g + ' met zichzelf vermenigvuldigt.')));
            } else if (soort === 'neg'){
              if (g === 10) st.push(S(aT + ' = 1/' + T(a) + ' = 1/10<sup>' + n + '</sup> = 10<sup>?</sup>. Dus ' + vr + ' =', -n, 'Een breuk 1/10' + sup(n) + ' is 10 tot de macht ' + MIN + n + '.', F(-n, n, 'Het getal is kleiner dan 1, dus de exponent is negatief.')));
              else {
                st.push(S('Eerst de noemer: ' + a + ' = ' + g + '<sup>?</sup>. De exponent:', n, g + sup(n) + ' = ' + a + '.'));
                st.push(S('Dus ' + aT + ' = 1/' + g + sup(n) + ' = ' + g + '<sup>?</sup>. ' + vr + ' =', -n, 'Een breuk 1/' + g + sup(n) + ' is ' + g + ' tot de macht ' + MIN + n + '.', F(-n, n, 'Het getal is een breuk kleiner dan 1, dus de exponent is negatief.')));
              }
            } else st.push(S('√' + g + ' = ' + a + ', en een wortel is de macht ½. Dus ' + g + '<sup>?</sup> = ' + a + ' en ' + vr + ' =', ['1/2', '0,5', '½'], 'Want ' + g + '<sup>½</sup> = √' + g + ' = ' + a + '.',
              F(['1/2', '0,5', '½'], 2, 'Andersom: ' + a + '² = ' + g + '. Je zoekt ' + g + ' tot de macht wat geeft ' + a + '.')));
            return { vraag:vr + ' =', context:'Bereken zonder rekenmachine.', stappen:st };
          } },
        { id:'wvb-log-regels', naam:'Rekenregels voor logaritmen', kort:'ᵍlog a + ᵍlog b = ᵍlog(a · b), ᵍlog a − ᵍlog b = ᵍlog(a/b) en n · ᵍlog a = ᵍlog(aⁿ)',
          uit:'<p>Logaritmen met hetzelfde grondtal mag je samenvoegen. <b>Plus</b> wordt keer: ᵍlog a + ᵍlog b = ᵍlog(a · b). <b>Min</b> wordt delen: ᵍlog a − ᵍlog b = ᵍlog(a/b).</p><p>Een getal <b>voor</b> de log wordt een exponent: n · ᵍlog a = ᵍlog(aⁿ).</p><p>Voorbeeld: ²log 40 − ²log 5 = ²log(40/5) = ²log 8 = 3. Zo reken je exact, zonder rekenmachine.</p>',
          wanneer:'je logaritmen met hetzelfde grondtal moet optellen, aftrekken of met een getal ervoor moet uitrekenen.',
          maak:function(R){
            var soort = R.kies(['som', 'som', 'min', 'min', 'factor']), g, a, b, N, k, vr, st = [];
            if (soort === 'som'){
              var opt = R.kies([[6, 36, [[2, 18], [3, 12], [4, 9]]], [10, 100, [[2, 50], [4, 25], [5, 20]]], [10, 1000, [[2, 500], [4, 250], [5, 200], [8, 125], [20, 50], [25, 40]]], [12, 144, [[2, 72], [3, 48], [4, 36], [8, 18], [9, 16]]]]);
              g = opt[0]; N = opt[1]; var pr = R.hussel(R.kies(opt[2])); a = pr[0]; b = pr[1];
              vr = LOG(g) + ' ' + a + ' + ' + LOG(g) + ' ' + b;
              st.push(S('Plus wordt keer: ' + vr + ' = ' + LOG(g) + '(' + a + ' · ' + b + ') = ' + LOG(g) + ' ?. Op de plek van ? komt', N, a + ' · ' + b + ' = ' + T(N) + '.', F(N, a + b, 'Je telde op. Bij plus van logaritmen vermenigvuldig je de getallen.')));
            } else if (soort === 'min'){
              g = R.kies([2, 2, 3, 5]); k = R.heel(2, { 2:5, 3:3, 5:2 }[g]); b = R.kies({ 2:[3, 5, 6, 7], 3:[2, 4, 5, 7], 5:[2, 3, 4, 6] }[g]); N = Math.pow(g, k); a = b * N;
              vr = LOG(g) + ' ' + a + ' ' + MIN + ' ' + LOG(g) + ' ' + b;
              st.push(S('Min wordt delen: ' + vr + ' = ' + LOG(g) + '(' + a + '/' + b + ') = ' + LOG(g) + ' ?. Op de plek van ? komt', N, a + ' : ' + b + ' = ' + N + '.', F(N, a - b, 'Je trok af. Bij min van logaritmen deel je de getallen.')));
            } else {
              var tup = R.kies([[2, 6, 9], [2, 6, 18], [2, 12, 9], [2, 12, 18], [2, 10, 25], [2, 20, 25], [2, 14, 49], [3, 6, 4], [3, 6, 12], [3, 15, 25], [3, 12, 16], [3, 21, 49]]);
              g = tup[0]; a = tup[1]; b = tup[2]; N = a * a / b;
              vr = '2 · ' + LOG(g) + ' ' + a + ' ' + MIN + ' ' + LOG(g) + ' ' + b;
              st.push(S('Eerst de 2 voor de log: 2 · ' + LOG(g) + ' ' + a + ' = ' + LOG(g) + ' ' + a + '². ' + a + '² =', a * a, 'De 2 wordt een exponent: ' + a + ' · ' + a + ' = ' + (a * a) + '.', F(a * a, 2 * a, 'Je deed keer 2. De 2 wordt een exponent: ' + a + '².')));
              st.push(S('Min wordt delen: ' + LOG(g) + ' ' + (a * a) + ' ' + MIN + ' ' + LOG(g) + ' ' + b + ' = ' + LOG(g) + ' ?. Op de plek van ? komt', N, (a * a) + ' : ' + b + ' = ' + N + '.', F(N, a * a - b, 'Je trok af. Bij min van logaritmen deel je.')));
            }
            k = Math.round(Math.log(N) / Math.log(g));
            st.push(S(LOG(g) + ' ' + T(N) + ' =', k, g + sup(k) + ' = ' + T(N) + '.'));
            return { vraag:vr + ' =', context:'Bereken exact met de rekenregels voor logaritmen.', stappen:st };
          } },
        { id:'wvb-ln-e', naam:'Rekenen met e en ln', kort:'ln is de logaritme met grondtal e: ln(eᵃ) = a en e^(ln a) = a',
          uit:'<p>Het getal <b>e</b> ≈ 2,718 is een grondtal dat je veel tegenkomt. De logaritme met grondtal e heet <b>ln</b>: ln a = ᵉlog a.</p><p>ln en e heffen elkaar op: <b>ln(eᵃ) = a</b> en <b>e<sup>ln a</sup> = a</b>. Dus ln(e⁵) = 5 en e<sup>ln 7</sup> = 7.</p><p>De rekenregels voor machten en logaritmen gelden ook hier: e³ · e⁴ = e⁷, en 2 ln 3 = ln 9, dus e<sup>2 ln 3</sup> = 9.</p>',
          wanneer:'je een uitdrukking met e en ln exact wilt uitrekenen.',
          maak:function(R){
            var soort = R.heel(0, 6), a = R.heel(2, 7), b = R.heel(2, 7), st, vr, vh;
            if (soort === 0){ vr = 'ln(e' + sup(a) + ' · e' + sup(b) + ')'; st = [S('Bij keer tel je de exponenten op: e' + sup(a) + ' · e' + sup(b) + ' = e<sup>?</sup>. De exponent:', a + b, a + ' + ' + b + ' = ' + (a + b) + '.', F(a + b, a * b, 'Bij keer van machten tel je de exponenten op.')), S('ln(e' + sup(a + b) + ') =', a + b, 'ln en e heffen elkaar op: ln(eᵃ) = a.')]; }
            else if (soort === 1){ while (a === b) b = R.heel(2, 7); vr = 'ln(e' + sup(a) + '/e' + sup(b) + ')'; st = [S('Bij delen trek je de exponenten af: e' + sup(a) + '/e' + sup(b) + ' = e<sup>?</sup>. De exponent:', a - b, a + ' ' + MIN + ' ' + b + ' = ' + T(a - b) + '.'), S('ln(e<sup>' + T(a - b) + '</sup>) =', a - b, 'ln en e heffen elkaar op.')]; }
            else if (soort === 2){ var n = R.heel(1, 5); vr = 'ln(1/e' + (n > 1 ? sup(n) : '') + ')'; st = [S('Een breuk geeft een negatieve exponent: 1/e' + (n > 1 ? sup(n) : '') + ' = e<sup>?</sup>. De exponent:', -n, '1/eⁿ = e tot de macht −n.', F(-n, n, 'Het is een breuk, dus de exponent is negatief.')), S('ln(e<sup>' + T(-n) + '</sup>) =', -n, 'ln en e heffen elkaar op.')]; }
            else if (soort === 3){ var m = R.kies([2, 3]), g = m === 2 ? R.heel(2, 9) : R.heel(2, 5); vr = 'e^(' + m + ' ln ' + g + ')'; vh = 'e<sup>' + m + ' ln ' + g + '</sup>'; st = [S('Eerst de exponent: ' + m + ' ln ' + g + ' = ln(' + g + sup(m) + ') = ln ?. Op de plek van ? komt', Math.pow(g, m), 'Het getal voor ln wordt een exponent: ' + g + sup(m) + ' = ' + Math.pow(g, m) + '.', F(Math.pow(g, m), m * g, 'Je deed keer ' + m + '. Het wordt een exponent.')), S('e<sup>ln ' + Math.pow(g, m) + '</sup> =', Math.pow(g, m), 'e en ln heffen elkaar op: e<sup>ln a</sup> = a.')]; }
            else if (soort === 4){ vr = 'e^(ln ' + a + ' + ln ' + b + ')'; vh = 'e<sup>ln ' + a + ' + ln ' + b + '</sup>'; st = [S('Plus wordt keer: ln ' + a + ' + ln ' + b + ' = ln ?. Op de plek van ? komt', a * b, a + ' · ' + b + ' = ' + (a * b) + '.', F(a * b, a + b, 'Bij plus van logaritmen vermenigvuldig je.')), S('e<sup>ln ' + (a * b) + '</sup> =', a * b, 'e en ln heffen elkaar op.')]; }
            else if (soort === 5){ var c = R.heel(2, 6); vr = 'e^(ln ' + (a * c) + ' − ln ' + a + ')'; vh = 'e<sup>ln ' + (a * c) + ' ' + MIN + ' ln ' + a + '</sup>'; st = [S('Min wordt delen: ln ' + (a * c) + ' ' + MIN + ' ln ' + a + ' = ln ?. Op de plek van ? komt', c, (a * c) + ' : ' + a + ' = ' + c + '.', F(c, a * c - a, 'Bij min van logaritmen deel je.')), S('e<sup>ln ' + c + '</sup> =', c, 'e en ln heffen elkaar op.')]; }
            else { var w = R.kies([2, 3, 4]); vr = 'ln(' + (w === 2 ? '' : sup(w)) + '√e)'; var h = '1/' + w, hl = w === 2 ? ['1/2', '0,5', '½'] : w === 4 ? ['1/4', '0,25', '¼'] : ['1/3', '⅓'];
              st = [S((w === 2 ? '√e' : 'De ' + w + 'e-machtswortel van e') + ' = e<sup>?</sup>. De exponent:', hl, 'Een wortel is een macht: ' + (w === 2 ? '√e = e<sup>½</sup>.' : 'de ' + w + 'e-machtswortel is de macht ' + h + '.')), S('ln(e<sup>' + h + '</sup>) =', hl, 'ln en e heffen elkaar op.')]; }
            return { vraag:vr + ' =', vraagHtml:vh ? vh + ' =' : undefined, context:'Bereken exact.', stappen:st };
          } }
      ] },

    /* ================= vergelijkingen ================= */
    { groep:{ id:'wvb-expvgl', niveau:'vwo', domein:'algebra', naam:'Exponentiële en logaritmische vergelijkingen',
        uit:'Een exponentiële vergelijking los je op met gelijke grondtallen of met een logaritme. Een logaritmische vergelijking schrijf je eerst zonder log. Met e en ln gaat het net zo.' },
      doelen:[
        { id:'wvb-vgl-grondtal', naam:'Gelijke grondtallen maken', kort:'Schrijf beide kanten als macht van hetzelfde grondtal; dan zijn de exponenten gelijk',
          uit:'<p>Bij 4<sup>x + 1</sup> = 32 zijn 4 en 32 allebei een <b>macht van 2</b>: 4 = 2² en 32 = 2⁵.</p><p>Links staat dan (2²)<sup>x + 1</sup> = 2<sup>2(x + 1)</sup>. Rechts 2⁵. De grondtallen zijn gelijk, dus de <b>exponenten zijn gelijk</b>: 2(x + 1) = 5.</p><p>Los op: 2x + 2 = 5, 2x = 3, <b>x = 1,5</b>. Een breuk als 1/8 schrijf je als 2⁻³.</p>',
          wanneer:'beide kanten een macht zijn van hetzelfde getal, zoals 2, 3 of 5.',
          maak:function(R){ var m = mGrondtal(R); m.context = 'Los exact op door gelijke grondtallen te maken.'; return m; } },
        { id:'wvb-vgl-log', naam:'Oplossen met een logaritme', kort:'Maak de macht vrij: gˣ = a geeft x = ᵍlog a = log a : log g',
          uit:'<p>Bij 3 · 2ˣ = 45 is 15 geen macht van 2. Dan gebruik je een <b>logaritme</b>.</p><p>Maak eerst de macht vrij: 2ˣ = 15. Dat betekent <b>x = ²log 15</b>.</p><p>Op de rekenmachine: ²log 15 = log 15 : log 2 ≈ <b>3,91</b>. Rond af zoals gevraagd.</p>',
          wanneer:'de getallen geen machten zijn van hetzelfde grondtal.',
          maak:function(R){ var m = mLogVgl(R); m.context = 'Los op met een logaritme. Rond af op 2 decimalen.'; return m; } },
        { id:'wvb-vgl-kies', naam:'Kies de handigste manier', kort:'Is het rechterlid een macht van hetzelfde grondtal? Maak gelijke grondtallen. Anders: gebruik de logaritme',
          uit:'<p>Kijk eerst naar de getallen en <b>kies</b> dan.</p><p>Zijn beide kanten machten van <b>hetzelfde getal</b>, zoals 9<sup>x</sup> = 27 (allebei machten van 3)? Maak <b>gelijke grondtallen</b>. Dan krijg je een exact antwoord.</p><p>Is het getal <b>geen macht</b> van het grondtal, zoals 2ˣ = 15? Gebruik de <b>logaritme</b>: x = ²log 15.</p>',
          wanneer:'je een exponentiële vergelijking snel en goed wilt oplossen.',
          maak:function(R){
            var m = R.heel(0, 1) ? mGrondtal(R) : mLogVgl(R), op = ['gelijke grondtallen maken', 'de logaritme gebruiken'];
            var uitleg = m.soort === 0 ? 'Beide kanten zijn machten van hetzelfde getal. Dan maak je gelijke grondtallen en krijg je een exact antwoord.' : 'Het getal is geen macht van het grondtal. Dan gebruik je de logaritme.';
            m.context = 'Kies eerst de handigste manier. Los de vergelijking dan op' + (m.soort === 0 ? ', exact.' : '. Rond af op 2 decimalen.');
            m.stappen = [K(R, 'Welke manier is hier het handigst?', op[m.soort], op, uitleg, { orde:op, waarom:uitleg })].concat(m.stappen);
            return m;
          } },
        { id:'wvb-vgl-logvgl', naam:'Logaritmische vergelijkingen', kort:'ᵍlog(A) = c betekent A = gᶜ: schrijf de vergelijking zonder log en controleer of A positief is',
          uit:'<p>Maak eerst de <b>log vrij</b>: 3 + 2 · ²log(x − 1) = 9 geeft ²log(x − 1) = 3.</p><p>Schrijf de vergelijking <b>zonder log</b>: ²log(A) = 3 betekent A = 2³. Dus x − 1 = 8 en <b>x = 9</b>.</p><p><b>Controleer</b>: wat achter de log staat moet positief zijn. Hier is x − 1 = 8, dat klopt.</p>',
          wanneer:'de onbekende achter een log staat.',
          maak:function(R){
            var g = R.kies([2, 2, 3, 3, 5, 10]), c = R.heel(1, { 2:5, 3:3, 5:2, 10:2 }[g]), G = Math.pow(g, c), a, b, x;
            for (var p = 0; p < 500; p++){ a = R.kies([1, 1, 2, 3, 4]); b = R.heel(-10, 10); x = (G - b) / a; if (x === Math.round(x) && Math.abs(x) <= 40 && !(a === 1 && b === 0)) break; }
            var inner = E([[a, 'x'], [b, '']]), lg = LOG(g) + '(' + inner + ')', vr = lg + ' = ' + c, st = [];
            if (R.heel(0, 2) === 0){
              var m = R.kies([1, 2, 3]), k = nz(R, -6, 6), n = k + m * c;
              vr = (m > 1 ? m + ' · ' : '') + lg + (k > 0 ? ' + ' + k : ' ' + MIN + ' ' + (-k)) + ' = ' + T(n);
              st.push(S('Maak de log vrij: ' + lg + ' =', c, (k > 0 ? 'Trek ' + k + ' af' : 'Tel ' + (-k) + ' op') + ': ' + (m > 1 ? m + ' · ' : '') + lg + ' = ' + T(n - k) + (m > 1 ? '. Deel door ' + m + '.' : '.')));
            }
            st.push(S(lg + ' = ' + c + ' betekent ' + inner + ' = ' + g + '<sup>' + c + '</sup>. Dat is', G, g + sup(c) + ' = ' + T(G) + '.', F(G, g * c, 'Dat is ' + g + ' keer ' + c + '. Je hebt ' + g + ' tot de macht ' + c + ' nodig.')));
            st.push(S('Los op: ' + inner + ' = ' + T(G) + '. x =', eqAnt(x), (b ? (b > 0 ? 'Trek ' + b + ' af' : 'Tel ' + (-b) + ' op') + (a > 1 ? ' en deel door ' + a : '') + '. ' : a > 1 ? 'Deel door ' + a + '. ' : '') + 'Controle: ' + inner + ' is dan ' + T(G) + ', positief, dus x = ' + T(x) + ' mag.'));
            return { vraag:vr, context:'Los exact op.', stappen:st };
          } },
        { id:'wvb-vgl-eln', naam:'Vergelijkingen met e en ln', kort:'eᴬ = c geeft A = ln c, en ln A = c geeft A = eᶜ',
          uit:'<p>Bij een <b>e-macht</b>: maak de macht vrij en neem <b>ln</b> aan beide kanten. 2 · e<sup>3x</sup> = 14 geeft e<sup>3x</sup> = 7, dus 3x = ln 7 en x = ln 7 : 3 ≈ 0,65.</p><p>Bij een <b>ln</b>: schrijf zonder ln met een <b>e-macht</b>. ln(2x + 1) = 3 geeft 2x + 1 = e³, dus x = (e³ − 1) : 2 ≈ 9,54.</p>',
          wanneer:'er een e-macht of een ln in de vergelijking staat.',
          maak:function(R){
            var st = [], vr, vh, x;
            if (R.heel(0, 1)){
              var A = R.heel(2, 30), c = R.kies([1, 1, 2, 3, 4]), a = R.kies([1, 2, 3, -1, -2]), b = R.heel(-3, 3), ex = E([[a, 'x'], [b, '']]);
              x = (Math.log(A) - b) / a;
              vr = (c > 1 ? c + ' · ' : '') + 'e^(' + ex + ') = ' + T(c * A); vh = (c > 1 ? c + ' · ' : '') + 'e<sup>' + ex + '</sup> = ' + T(c * A);
              if (c > 1) st.push(S('Maak de e-macht vrij: e<sup>' + ex + '</sup> =', A, 'Deel door ' + c + ': ' + T(c * A) + ' : ' + c + ' = ' + A + '.'));
              st.push(K(R, 'Neem ln aan beide kanten: ' + ex + ' =', 'ln ' + A, ['e' + sup(A), A + ' : e'], 'eᴬ = ' + A + ' betekent A = ln ' + A + '.'));
              st.push(S('Los op en rond af op 2 decimalen: x ≈', rnd(x, 2), 'x = ' + (b ? '(ln ' + A + ' ' + (b > 0 ? MIN + ' ' + b : '+ ' + (-b)) + ')' : 'ln ' + A) + (a !== 1 ? ' : ' + paren(a) : '') + '. Op je rekenmachine: ln(' + A + ').'));
            } else {
              var cc = R.kies([1, 2, 3, -1]), a2 = R.kies([1, 2, 3, 4]), b2 = R.heel(-5, 5), inner = E([[a2, 'x'], [b2, '']]);
              x = (Math.exp(cc) - b2) / a2;
              vr = 'ln(' + inner + ') = ' + T(cc);
              st.push(K(R, 'Schrijf zonder ln: ' + inner + ' =', 'e' + sup(T(cc)), ['ln ' + paren(cc), T(cc) + ' : e'], 'ln A = ' + T(cc) + ' betekent A = e tot de macht ' + T(cc) + '.'));
              st.push(S('Los op en rond af op 2 decimalen: x ≈', rnd(x, 2), 'x = ' + (b2 ? '(e' + sup(T(cc)) + ' ' + (b2 > 0 ? MIN + ' ' + b2 : '+ ' + (-b2)) + ')' : 'e' + sup(T(cc))) + (a2 > 1 ? ' : ' + a2 : '') + '. Op je rekenmachine: e^(' + T(cc) + ').'));
            }
            return { vraag:vr, vraagHtml:vh, context:'Los op. Rond af op 2 decimalen.', stappen:st };
          } }
      ] },

    /* ================= afgeleiden van standaardfuncties ================= */
    { groep:{ id:'wvb-difstd', niveau:'vwo', domein:'verbanden', naam:'Afgeleiden van standaardfuncties',
        uit:'Naast de machtsregel heb je de afgeleiden van eˣ, ln x, gˣ, ᵍlog x, sin x en cos x. Een getal ervoor blijft staan, en bij een som differentieer je elke term apart.' },
      doelen:[
        { id:'wvb-dif-ex', naam:'De afgeleide van eˣ', kort:'eˣ is zijn eigen afgeleide: f(x) = a · eˣ geeft f′(x) = a · eˣ',
          uit:'<p>De functie <b>eˣ</b> is bijzonder: hij is zijn <b>eigen afgeleide</b>. f(x) = eˣ geeft f′(x) = eˣ.</p><p>Een getal ervoor blijft staan: 5eˣ wordt 5eˣ. Andere termen differentieer je apart, met de machtsregel: f(x) = 3eˣ − 2x² geeft <b>f′(x) = 3eˣ − 4x</b>.</p><p>Typ eˣ als e^x.</p>',
          wanneer:'er eˣ in de formule staat.',
          maak:function(R){
            var a = nz(R, -6, 6), b = nz(R, -5, 5), n = R.kies([1, 2, 3, 4]), c = R.kies([0, 0, nz(R, -9, 9)]);
            var f = E([[a, 'eˣ'], [b, xm(n)], [c, '']]), fp = E([[a, 'eˣ'], [n * b, xm(n - 1)]]), st = [];
            st.push(SC('De afgeleide van ' + E([[a, 'eˣ']]) + ' is', E([[a, 'eˣ']]), fC(E([[a, 'eˣ']])), 'eˣ is zijn eigen afgeleide. Het getal ervoor blijft staan.'));
            st.push(SC('De afgeleide van ' + E([[b, xm(n)]]) + ' is', E([[n * b, xm(n - 1)]]), fC(E([[n * b, xm(n - 1)]])), 'Machtsregel: de exponent ' + n + ' ervoor en de exponent 1 lager.'));
            if (c) st.push(S('De afgeleide van het losse getal ' + T(c) + ' is', 0, 'Een los getal verandert niet: de afgeleide is 0.'));
            st.push(SC('Samen: f' + PR + '(x) =', fp, fC(fp), 'Zet de afgeleiden achter elkaar: ' + fp + '.'));
            return { vraag:'f(x) = ' + f, context:'Bereken de afgeleide. Typ eˣ als e^x en x² als x^2.', stappen:st, antwoord:fp, controle:fC(fp), invoer:'tekst' };
          } },
        { id:'wvb-dif-ln', naam:'De afgeleide van ln x', kort:'f(x) = ln x geeft f′(x) = 1/x; a · ln x geeft a/x',
          uit:'<p>De afgeleide van <b>ln x</b> is <b>1/x</b>. Een getal ervoor blijft staan: 4 ln x wordt 4/x.</p><p>Bij een som differentieer je elke term apart: f(x) = 4 ln x + x³ geeft <b>f′(x) = 4/x + 3x²</b>.</p><p>Typ ln x als ln(x) of ln x.</p>',
          wanneer:'er ln x in de formule staat.',
          maak:function(R){
            var a = nz(R, -6, 6), b = nz(R, -5, 5), n = R.kies([1, 2, 3, 4]), c = R.kies([0, 0, nz(R, -9, 9)]);
            var f = E([[a, 'ln x'], [b, xm(n)], [c, '']]), fp = E([[a, '/x'], [n * b, xm(n - 1)]]), st = [];
            st.push(SC('De afgeleide van ' + E([[a, 'ln x']]) + ' is', E([[a, '/x']]), fC(E([[a, '/x']])), 'ln x wordt 1/x. Het getal ervoor komt boven de breukstreep: ' + E([[a, '/x']]) + '.', F(E([[a, '/x']]), E([[a, 'x']]), 'Niet keer x: ln x wordt 1 gedeeld door x.')));
            st.push(SC('De afgeleide van ' + E([[b, xm(n)]]) + ' is', E([[n * b, xm(n - 1)]]), fC(E([[n * b, xm(n - 1)]])), 'Machtsregel: de exponent ' + n + ' ervoor en de exponent 1 lager.'));
            if (c) st.push(S('De afgeleide van het losse getal ' + T(c) + ' is', 0, 'Een los getal verandert niet: de afgeleide is 0.'));
            st.push(SC('Samen: f' + PR + '(x) =', fp, fC(fp), 'Zet de afgeleiden achter elkaar: ' + fp + '.'));
            return { vraag:'f(x) = ' + f, context:'Bereken de afgeleide. Typ bijvoorbeeld 4/x + 3x^2.', stappen:st, antwoord:fp, controle:fC(fp), invoer:'tekst' };
          } },
        { id:'wvb-dif-gx', naam:'De afgeleide van gˣ en ᵍlog x', kort:'gˣ wordt gˣ · ln g, en ᵍlog x wordt 1/(x · ln g)',
          uit:'<p>Bij een ander grondtal dan e komt er een <b>ln</b> bij. f(x) = 2ˣ geeft f′(x) = <b>2ˣ · ln 2</b>.</p><p>Bij een logaritme deel je erdoor: f(x) = ²log x geeft f′(x) = <b>1/(x · ln 2)</b>.</p><p>Een getal ervoor blijft staan: 5 · 3ˣ wordt 5 · 3ˣ · ln 3. Laat ln 3 gewoon staan: dat is een exact getal.</p>',
          wanneer:'er een macht met x in de exponent staat, of een log met een ander grondtal dan e.',
          maak:function(R){
            var g = R.kies([2, 3, 5, 10]), a = nz(R, -5, 5), st = [], f, fp, regel;
            if (R.heel(0, 2)){
              f = (a === 1 ? '' : a === -1 ? MIN : T(a) + ' · ') + g + 'ˣ'; fp = (a === 1 ? '' : a === -1 ? MIN : T(a) + ' · ') + g + 'ˣ · ln ' + g;
              st.push(K(R, 'De afgeleide van ' + g + 'ˣ is', g + 'ˣ · ln ' + g, ['x · ' + g + sup('x−1'), g + 'ˣ'], 'Bij gˣ komt er ln g achter: ' + g + 'ˣ · ln ' + g + '. Alleen eˣ blijft precies hetzelfde.'));
              regel = 'gˣ wordt gˣ · ln g';
            } else {
              f = (a === 1 ? '' : a === -1 ? MIN : T(a) + ' · ') + LOG(g) + ' x'; fp = T(a) + '/(x · ln ' + g + ')';
              st.push(K(R, 'De afgeleide van ' + LOG(g) + ' x is', '1/(x · ln ' + g + ')', ['1/x', 'ln ' + g + '/x'], 'Bij ᵍlog x deel je door x · ln g. Alleen ln x wordt gewoon 1/x.'));
              regel = 'ᵍlog x wordt 1/(x · ln g)';
            }
            st.push(SC('Met het getal ervoor: f' + PR + '(x) =', fp, fC(fp), 'Het getal ' + T(a) + ' blijft staan; ' + regel + '.'));
            return { vraag:'f(x) = ' + f, context:'Bereken de afgeleide exact. Typ bijvoorbeeld 3*2^x*ln(2).', stappen:st, antwoord:fp, controle:fC(fp), invoer:'tekst' };
          } },
        { id:'wvb-dif-sin', naam:'De afgeleide van sin x en cos x', kort:'sin x wordt cos x, en cos x wordt −sin x',
          uit:'<p><b>sin x</b> wordt <b>cos x</b>. <b>cos x</b> wordt <b>−sin x</b>: let op de min.</p><p>Een getal ervoor blijft staan: f(x) = 3 sin x + 2 cos x geeft <b>f′(x) = 3 cos x − 2 sin x</b>.</p><p>Dit geldt alleen als x in <b>radialen</b> is, en dat is in de wiskunde altijd zo.</p>',
          wanneer:'er sin x of cos x in de formule staat.',
          maak:function(R){
            var a = nz(R, -5, 5), b = nz(R, -5, 5), n = R.kies([0, 0, 1, 2, 3]), c = nz(R, -4, 4), st = [];
            var f = E([[a, 'sin x'], [b, 'cos x']].concat(n ? [[c, xm(n)]] : [])), fp = E([[a, 'cos x'], [-b, 'sin x']].concat(n ? [[n * c, xm(n - 1)]] : []));
            st.push(SC('De afgeleide van ' + E([[a, 'sin x']]) + ' is', E([[a, 'cos x']]), fC(E([[a, 'cos x']])), 'sin x wordt cos x; het getal blijft staan.'));
            st.push(SC('De afgeleide van ' + E([[b, 'cos x']]) + ' is', E([[-b, 'sin x']]), fC(E([[-b, 'sin x']])), 'cos x wordt ' + MIN + 'sin x. Dus ' + E([[b, 'cos x']]) + ' wordt ' + E([[-b, 'sin x']]) + '.', F(E([[-b, 'sin x']]), E([[b, 'sin x']]), 'Let op de min: cos x wordt min sin x.')));
            if (n) st.push(SC('De afgeleide van ' + E([[c, xm(n)]]) + ' is', E([[n * c, xm(n - 1)]]), fC(E([[n * c, xm(n - 1)]])), 'Machtsregel.'));
            st.push(SC('Samen: f' + PR + '(x) =', fp, fC(fp), 'Zet de afgeleiden achter elkaar: ' + fp + '.'));
            return { vraag:'f(x) = ' + f, context:'Bereken de afgeleide. Typ bijvoorbeeld 3cos(x) − 2sin(x).', stappen:st, antwoord:fp, controle:fC(fp), invoer:'tekst' };
          } }
      ] },

    /* ================= product, quotiënt en ketting ================= */
    { groep:{ id:'wvb-difregel', niveau:'vwo', domein:'verbanden', naam:'Productregel, quotiëntregel en kettingregel',
        uit:'Een product, een breuk of een functie in een functie differentieer je met een eigen regel. Je leert elke regel apart, en daarna kies je zelf welke je nodig hebt.' },
      doelen:[
        { id:'wvb-dif-product', naam:'De productregel', kort:'f = u · v geeft f′ = u′ · v + u · v′',
          uit:'<p>Bij een <b>product</b> van twee functies, zoals x² · eˣ, noem je de stukken <b>u</b> en <b>v</b>: u = x² en v = eˣ.</p><p>De regel: <b>f′ = u′ · v + u · v′</b>. Hier u′ = 2x en v′ = eˣ, dus f′(x) = 2x · eˣ + x² · eˣ.</p><p>Je mag het nog netter schrijven, bijvoorbeeld (x² + 2x)eˣ, maar dat hoeft niet.</p>',
          wanneer:'twee functies van x met elkaar vermenigvuldigd worden.',
          beeld:R0.teken.tabel([['', 'functie', 'afgeleide'], ['u', 'x²', '2x'], ['v', 'eˣ', 'eˣ'], ['f′', 'u′ · v + u · v′', '2x · eˣ + x² · eˣ']], { kop:true, zijkop:true }),
          maak:function(R){ var m = mProduct(R); m.context = 'Bereken f' + PR + '(x) met de productregel. Typ eˣ als e^x.'; m.invoer = 'tekst'; return m; } },
        { id:'wvb-dif-quot', naam:'De quotiëntregel', kort:'f = t/n geeft f′ = (n · t′ − t · n′)/n²',
          uit:'<p>Bij een <b>breuk</b> noem je de teller <b>t</b> en de noemer <b>n</b>. De regel: <b>f′ = (n · t′ − t · n′) / n²</b>. Onthoud: "noemer keer afgeleide teller, min teller keer afgeleide noemer, gedeeld door de noemer in het kwadraat".</p><p>f(x) = (2x + 1)/(x − 3): t′ = 2 en n′ = 1. De teller wordt 2(x − 3) − (2x + 1) = −7. Dus <b>f′(x) = −7/(x − 3)²</b>.</p>',
          wanneer:'de formule een breuk is met x in de noemer.',
          maak:function(R){ var m = mQuot(R); m.context = 'Bereken f' + PR + '(x) met de quotiëntregel. Gebruik haakjes, bijvoorbeeld −7/(x−3)^2.'; m.invoer = 'tekst'; return m; } },
        { id:'wvb-dif-ketting', naam:'De kettingregel', kort:'f(x) = buiten(binnen): f′ = afgeleide van buiten, met binnen erin, keer de afgeleide van binnen',
          uit:'<p>Bij (3x − 2)⁴ zit er een functie <b>in</b> een functie. De <b>binnenste</b>: u = 3x − 2. De <b>buitenste</b>: u⁴.</p><p>Differentieer de buitenste: 4u³. Vul u weer in en doe <b>keer de afgeleide van de binnenste</b>: f′(x) = 4(3x − 2)³ · 3 = <b>12(3x − 2)³</b>.</p><p>Zo ook: e<sup>2x + 1</sup> wordt 2e<sup>2x + 1</sup>, sin(4x) wordt 4 cos(4x) en ln(2x + 5) wordt 2/(2x + 5).</p>',
          wanneer:'er iets anders dan x in de haakjes, de exponent of achter sin, cos of ln staat.',
          maak:function(R){ var m = mKetting(R); m.context = 'Bereken f' + PR + '(x) met de kettingregel. Typ bijvoorbeeld 12(3x−2)^3 of 2e^(2x+1).'; m.invoer = 'tekst'; return m; } },
        { id:'wvb-dif-kies', naam:'Kies de juiste regel', kort:'Een product: productregel. Een breuk: quotiëntregel. Iets ingewikkelds in een functie: kettingregel. Een som van gewone termen: alleen de basisregels',
          uit:'<p>Kijk eerst hoe de functie <b>gebouwd</b> is, en kies dan.</p><p>Twee functies <b>keer</b> elkaar, zoals x² · sin x: de <b>productregel</b>. Een <b>breuk</b> met x in de noemer: de <b>quotiëntregel</b>. Een functie <b>in</b> een functie, zoals e<sup>3x</sup> of (2x + 1)⁵: de <b>kettingregel</b>.</p><p>Staan er alleen termen met plus en min, zoals 3eˣ + x²? Dan heb je <b>alleen de basisregels</b> nodig.</p>',
          wanneer:'je een functie moet differentiëren en eerst moet zien welke regel erbij hoort.',
          maak:function(R){
            var s = R.heel(0, 3), m = s === 0 ? mProduct(R) : s === 1 ? mQuot(R) : s === 2 ? mKetting(R) : mSom(R);
            var op = ['de productregel', 'de quotiëntregel', 'de kettingregel', 'alleen de basisregels'];
            var uitleg = ['Er staan twee functies van x keer elkaar: de productregel.', 'Het is een breuk met x in de noemer: de quotiëntregel.', 'Er zit een functie in een functie: de kettingregel.', 'Het is een som van gewone termen: elke term apart met de basisregels.'][m.soort];
            m.context = 'Kies eerst de regel die je nodig hebt. Bereken dan f' + PR + '(x).'; m.invoer = 'tekst';
            m.stappen = [K(R, 'Welke regel heb je nodig?', op[m.soort], op, uitleg, { orde:op, waarom:uitleg })].concat(m.stappen);
            return m;
          } }
      ] },

    /* ================= raaklijn, extremen, buigpunten ================= */
    { groep:{ id:'wvb-toepas', niveau:'vwo', domein:'verbanden', naam:'Raaklijn, extremen en buigpunten',
        uit:'Met de afgeleide vind je de helling van de raaklijn en de toppen van een grafiek. Met de tweede afgeleide zie je of een top een maximum of een minimum is, en waar de grafiek van kromming wisselt.' },
      doelen:[
        { id:'wvb-raaklijn', naam:'De raaklijn in een punt', kort:'Bereken f(a) en f′(a): de raaklijn is y = f′(a) · x + b, door het punt (a, f(a))',
          uit:'<p>De <b>raaklijn</b> in het punt met x = a raakt de grafiek precies daar. De <b>helling</b> is f′(a).</p><p>Stappenplan: bereken f′(x), dan de helling f′(a) en het raakpunt f(a). Vul het punt in <b>y = f′(a) · x + b</b> en reken b uit.</p><p>Voorbeeld: f(x) = x³ − 2x bij x = 1. f′(x) = 3x² − 2, helling 1, raakpunt (1, −1). −1 = 1 · 1 + b, dus b = −2: <b>y = x − 2</b>.</p>',
          wanneer:'je een vergelijking van de raaklijn aan een grafiek nodig hebt.',
          maak:function(R){
            var soort = R.kies(['p', 'p', 'p', 'e', 'l', 's']), a, fT, fdT, m, fa, f, x0, x1;
            if (soort === 'p'){
              var c; do { c = [R.heel(-6, 6), R.heel(-5, 5), R.heel(-3, 3), R.kies([0, 1, -1])]; } while (!c[3] && !c[2]);
              a = R.heel(-2, 2); fT = pT(c); fdT = pT(pD(c)); m = pV(pD(c), a); fa = pV(c, a); f = function(x){ return pV(c, x); }; x0 = a - 2.5; x1 = a + 2.5;
            } else if (soort === 'e'){
              var k1 = nz(R, -4, 4), d = R.heel(-4, 4), k0 = R.heel(-5, 5); a = 0; fT = E([[k1, 'eˣ'], [d, 'x'], [k0, '']]); fdT = E([[k1, 'eˣ'], [d, '']]); m = k1 + d; fa = k1 + k0;
              f = function(x){ return k1 * Math.exp(x) + d * x + k0; }; x0 = -3; x1 = 2;
            } else if (soort === 'l'){
              var l1 = nz(R, -4, 4), l2 = nz(R, -4, 4); a = 1; fT = E([[l1, 'ln x'], [l2, 'x']]); fdT = E([[l1, '/x'], [l2, '']]); m = l1 + l2; fa = l2;
              f = function(x){ return l1 * Math.log(x) + l2 * x; }; x0 = 0; x1 = 4;
            } else {
              var s1 = nz(R, -4, 4), s2 = R.heel(-3, 3), s0 = R.heel(-5, 5); a = 0; fT = E([[s1, 'sin x'], [s2, 'x'], [s0, '']]); fdT = E([[s1, 'cos x'], [s2, '']]); m = s1 + s2; fa = s0;
              f = function(x){ return s1 * Math.sin(x) + s2 * x + s0; }; x0 = -3; x1 = 3;
            }
            var b = fa - m * a, lijn = E([[m, 'x'], [b, '']]), yr = bereik([f], soort === 'l' ? 0.1 : x0, x1, [fa], [fa - 15, fa + 15]);
            var hint1 = { p:'Differentieer elke term met de machtsregel.', e:'eˣ blijft eˣ; de afgeleide van ' + E([[1, 'x']]) + ' is 1.', l:'ln x wordt 1/x.', s:'sin x wordt cos x.' }[soort];
            var hint2 = { p:'Vul x = ' + a + ' in bij f' + PR + '(x) = ' + fdT + '.', e:'e⁰ = 1.', l:'1/1 = 1.', s:'cos 0 = 1.' }[soort];
            var hint3 = { p:'Vul x = ' + a + ' in bij f(x).', e:'e⁰ = 1, dus f(0) = ' + E([[k1, '']]) + ' + ' + paren(k0) + '.', l:'ln 1 = 0.', s:'sin 0 = 0.' }[soort];
            return { vraag:'f(x) = ' + fT, context:'Stel een vergelijking op van de raaklijn aan de grafiek van f in het punt met x = ' + a + '. Typ bijvoorbeeld y = 2x − 3.', invoer:'tekst',
              antwoord:'y = ' + lijn, controle:fC(lijn),
              beeld:function(n){ return plot({ x:[x0, x1], y:yr, fns:[{ f:f }].concat(n >= 5 ? [{ f:function(x){ return m * x + b; }, k:KL[1], w:2.4 }] : []), punten:n >= 3 ? [{ x:a, y:fa, t:pt(a, fa) }] : [], aria:'grafiek van f' + (n >= 5 ? ' met de raaklijn' : '') }); },
              stappen:[
                SC('f' + PR + '(x) =', fdT, fC(fdT), hint1),
                S('De helling bij x = ' + a + ': f' + PR + '(' + a + ') =', m, hint2),
                S('Het raakpunt: f(' + a + ') =', fa, hint3),
                S('De raaklijn y = ' + E([[m, 'x']]) + ' + b gaat door ' + pt(a, fa) + '. Dus b =', b, a === 0 ? 'Bij x = 0 is b gewoon f(0).' : T(fa) + ' = ' + T(m) + ' · ' + paren(a) + ' + b, dus b = ' + T(fa) + ' ' + MIN + ' ' + paren(m * a) + '.'),
                SC('De raaklijn:', 'y = ' + lijn, fC(lijn), 'y = ' + T(m) + 'x + ' + paren(b) + '.') ] };
          } },
        { id:'wvb-extreem', naam:'Extremen met een tekenschema', kort:'Los f′(x) = 0 op en kijk in een tekenschema waar f′ van + naar − gaat (maximum) of van − naar + (minimum)',
          uit:'<p>Een <b>top</b> van de grafiek ligt waar <b>f′(x) = 0</b>. Los die vergelijking op.</p><p>Maak dan een <b>tekenschema</b>: vul een x tussen de nulpunten in bij f′. Gaat f′ van <b>+ naar −</b>, dan stijgt f en daalt hij daarna: een <b>maximum</b>. Van <b>− naar +</b>: een <b>minimum</b>.</p><p>Het extreem zelf is de waarde f(x) in dat punt.</p>',
          wanneer:'je het maximum of minimum van een functie exact moet berekenen.',
          maak:function(R){
            var r1, r2; do { r1 = R.heel(-4, 3); r2 = R.heel(r1 + 1, 4); } while ((r1 + r2) % 2);
            var s = R.kies([1, -1]), D = R.heel(-8, 8), c = [D, 3 * s * r1 * r2, -1.5 * s * (r1 + r2), s], fd = pD(c), ask = R.kies(['max', 'min']);
            var t = s === 1 ? (ask === 'max' ? r1 : r2) : (ask === 'max' ? r2 : r1), mid = (r1 + r2) / 2, tek = s === 1 ? ['+', '−', '+'] : ['−', '+', '−'];
            var naam = ask === 'max' ? 'maximum' : 'minimum', ook = pT([r1 * r2, -(r1 + r2), 1]);
            return { vraag:'f(x) = ' + pT(c), context:'Bereken het ' + naam + ' van f met de afgeleide en een tekenschema.',
              beeld:function(n){ return n < 2 ? '' : tekenschema([r1, r2], n >= 3 ? tek : null); },
              stappen:[
                SC('f' + PR + '(x) =', pT(fd), fC(pT(fd)), 'Machtsregel voor elke term; het losse getal valt weg.'),
                SC('Los op: f' + PR + '(x) = 0. x =', lijstT([r1, r2], T), lijstC([r1, r2]), 'Deel door ' + (3 * s) + ': ' + ook + ' = 0. Ontbind: (' + E([[1, 'x'], [-r1, '']]) + ')(' + E([[1, 'x'], [-r2, '']]) + ') = 0. Typ bijvoorbeeld x = ' + r1 + ' of x = ' + r2 + '.'),
                S('Neem een x tussen ' + r1 + ' en ' + r2 + ', bijvoorbeeld x = ' + mid + ': f' + PR + '(' + mid + ') =', pV(fd, mid), 'Vul x = ' + mid + ' in bij f' + PR + '(x) = ' + pT(fd) + '.'),
                K(R, 'f' + PR + ' is ' + (tek[1] === '−' ? 'negatief' : 'positief') + ' tussen ' + r1 + ' en ' + r2 + ', en ' + (tek[0] === '+' ? 'positief' : 'negatief') + ' daarbuiten. Wat heeft f bij x = ' + t + '?', ask === 'max' ? 'een maximum' : 'een minimum', [ask === 'max' ? 'een minimum' : 'een maximum'],
                  'Van + naar − is eerst stijgen en dan dalen: een maximum. Van − naar + is een minimum.', { orde:['een maximum', 'een minimum'] }),
                S('Het ' + naam + ' is f(' + t + ') =', pV(c, t), 'Vul x = ' + t + ' in bij f(x).') ] };
          } },
        { id:'wvb-extreem-tweede', naam:'Extremen met de tweede afgeleide', kort:'Is f′(a) = 0 en f″(a) negatief, dan is het een maximum; is f″(a) positief, een minimum',
          uit:'<p>De <b>tweede afgeleide</b> f″ is de afgeleide van f′. Hij zegt hoe de grafiek <b>krom</b> is.</p><p>Is f′(a) = 0 en <b>f″(a) &lt; 0</b>, dan is de grafiek daar een bergtop: een <b>maximum</b>. Is <b>f″(a) &gt; 0</b>, dan een dal: een <b>minimum</b>.</p><p>Voorbeeld: f(x) = x³ − 12x. f″(x) = 6x. Bij x = 2 is f″(2) = 12, positief: een minimum f(2) = −16.</p>',
          wanneer:'je al weet waar de toppen liggen en snel wilt zien of het een maximum of minimum is.',
          maak:function(R){
            var c, xs, t, w;
            if (R.heel(0, 4) < 3){
              var r1, r2; do { r1 = R.heel(-4, 3); r2 = R.heel(r1 + 1, 4); } while ((r1 + r2) % 2);
              var s = R.kies([1, -1]); c = [R.heel(-8, 8), 3 * s * r1 * r2, -1.5 * s * (r1 + r2), s]; xs = [r1, r2]; t = R.kies(xs); w = t === r1 ? r2 : r1;
            } else {
              var k = R.kies([1, 2]), s2 = R.kies([1, -1]); c = [R.heel(-5, 9), 0, -2 * s2 * k * k, 0, s2]; xs = [-k, 0, k]; t = R.kies(xs); w = t === 0 ? k : 0;
            }
            var fd = pD(c), fdd = pD(fd), h = pV(fdd, t), v = pV(c, t), vw = pV(c, w), soort = h < 0 ? 'een maximum' : 'een minimum', ander = h < 0 ? 'een minimum' : 'een maximum';
            var op = R.hussel(uniek([soort + ' van ' + T(v), ander + ' van ' + T(v), soort + ' van ' + T(vw), ander + ' van ' + T(vw)]));
            return { vraag:'f(x) = ' + pT(c), context:'f heeft extremen bij ' + lijstT(xs, T) + '. Onderzoek met de tweede afgeleide wat f bij x = ' + t + ' heeft, en bereken de waarde.',
              opties:op, goed:op.indexOf(soort + ' van ' + T(v)),
              stappen:[
                SC('f' + PR + '(x) =', pT(fd), fC(pT(fd)), 'Machtsregel voor elke term.'),
                SC('f' + PR + PR + '(x) =', pT(fdd), fC(pT(fdd)), 'Differentieer f' + PR + '(x) = ' + pT(fd) + ' nog een keer.'),
                S('f' + PR + PR + '(' + t + ') =', h, 'Vul x = ' + t + ' in bij f' + PR + PR + '(x) = ' + pT(fdd) + '.'),
                K(R, 'f' + PR + PR + '(' + t + ') is ' + (h < 0 ? 'negatief' : 'positief') + '. Dan heeft f bij x = ' + t, soort, [ander], 'f' + PR + PR + ' negatief: een bergtop, een maximum. f' + PR + PR + ' positief: een dal, een minimum.', { orde:['een maximum', 'een minimum'] }),
                S('De waarde: f(' + t + ') =', v, 'Vul x = ' + t + ' in bij f(x).') ] };
          } },
        { id:'wvb-buigpunt', naam:'Buigpunten met de tweede afgeleide', kort:'Los f″(x) = 0 op; wisselt f″ daar van teken, dan is (x, f(x)) een buigpunt',
          uit:'<p>In een <b>buigpunt</b> gaat de grafiek over van bol naar hol, of andersom. Daar is de helling het grootst of het kleinst.</p><p>Stappenplan: bereken f′ en <b>f″</b>, en los <b>f″(x) = 0</b> op. Controleer dat f″ daar van teken wisselt. Bereken dan de y-coördinaat met f(x).</p><p>Voorbeeld: f(x) = x³ − 6x² + 5. f″(x) = 6x − 12 = 0 geeft x = 2. f(2) = −11. Het buigpunt is <b>(2, −11)</b>.</p>',
          wanneer:'je de buigpunten van een grafiek moet berekenen.',
          maak:function(R){
            var c, t, st = [], ctx = 'Bereken de coördinaten van het buigpunt van de grafiek van f. Typ bijvoorbeeld (2, −11).', kw = R.heel(0, 3) === 0;
            if (!kw){ var a = R.kies([1, -1, 2]), p = R.heel(-3, 3); c = [R.heel(-9, 9), R.heel(-9, 9), -3 * a * p, a]; t = p; }
            else { var k = R.kies([1, 2]); c = [R.heel(-9, 9), R.heel(-6, 6), -6 * k * k, 0, 1]; t = k; ctx = 'Bereken de coördinaten van het buigpunt met x > 0. Typ bijvoorbeeld (2, −11).'; }
            var fd = pD(c), fdd = pD(fd), v = pV(c, t), f = function(x){ return pV(c, x); };
            st.push(SC('f' + PR + '(x) =', pT(fd), fC(pT(fd)), 'Machtsregel voor elke term.'));
            st.push(SC('f' + PR + PR + '(x) =', pT(fdd), fC(pT(fdd)), 'Differentieer f' + PR + '(x) nog een keer.'));
            if (!kw) st.push(S('Los op: ' + pT(fdd) + ' = 0. x =', eqAnt(t), 'Breng het losse getal naar de andere kant en deel door ' + fdd[1] + '.'));
            else st.push(SC('Los op: ' + pT(fdd) + ' = 0. x =', lijstT([-t, t], T), lijstC([-t, t]), 'Deel door 12: x² = ' + (t * t) + '. Typ x = ' + MIN + t + ' of x = ' + t + '.'));
            st.push(S('f' + PR + PR + ' wisselt bij x = ' + t + ' van teken. De y-coördinaat: f(' + t + ') =', v, 'Vul x = ' + t + ' in bij f(x) = ' + pT(c) + '.'));
            st.push(SC('Het buigpunt:', pt(t, v), coordC(t, v), 'De x-coördinaat en de y-coördinaat samen: ' + pt(t, v) + '.'));
            var yr = bereik([f], t - 3, t + 3, [v], [v - 25, v + 25]);
            return { vraag:'f(x) = ' + pT(c), context:ctx, invoer:'tekst', antwoord:pt(t, v), controle:coordC(t, v), stappen:st,
              beeld:function(n){ return n < st.length ? '' : plot({ x:[t - 3, t + 3], y:yr, fns:[{ f:f }], punten:[{ x:t, y:v, t:pt(t, v) }], aria:'grafiek van f met het buigpunt' }); } };
          } }
      ] },

    /* ================= integreren ================= */
    { groep:{ id:'wvb-integr', niveau:'vwo', domein:'verbanden', naam:'Primitiveren en oppervlakte',
        uit:'Primitiveren is differentiëren andersom: je zoekt een functie F met F′ = f. Met een primitieve bereken je de oppervlakte onder een grafiek: de bepaalde integraal.' },
      doelen:[
        { id:'wvb-prim-macht', naam:'Primitiveren van machten', kort:'Bij a · xⁿ hoort a/(n + 1) · xⁿ⁺¹: exponent 1 hoger, dan delen door de nieuwe exponent',
          uit:'<p>Een <b>primitieve</b> F van f is een functie met F′ = f. Je doet de machtsregel andersom.</p><p>Bij <b>a · xⁿ</b>: maak de exponent <b>1 hoger</b> en <b>deel</b> door die nieuwe exponent. 6x² wordt 6/3 · x³ = 2x³. Een los getal 5 wordt 5x.</p><p>Er mag altijd een getal bij: daarom schrijf je <b>+ c</b>. f(x) = 6x² + 5 geeft F(x) = 2x³ + 5x + c.</p>',
          wanneer:'je een primitieve zoekt van een som van machten van x.',
          maak:function(R){
            var aantal = R.kies([2, 3, 3]), ns = R.hussel([0, 1, 2, 3, 4, 5]).slice(0, aantal).sort(function(p, q){ return q - p; }), neg = R.heel(0, 4) === 0;
            if (neg) ns[ns.length - 1] = -2;
            var tf = [], tp = [], st = [];
            ns.forEach(function(n){
              if (n === -2){ var a = nz(R, -6, 6); tf.push([a, '/x²']); tp.push([-a, '/x']);
                st.push(SC('Een primitieve van ' + E([[a, '/x²']]) + ' = ' + E([[a, 'x' + sup(-2)]]) + ' is', E([[-a, '/x']]), primC(E([[-a, '/x']])), 'Exponent 1 hoger: ' + MIN + '2 + 1 = ' + MIN + '1. Deel door ' + MIN + '1: ' + E([[-a, 'x' + sup(-1)]]) + ' = ' + E([[-a, '/x']]) + '.')); return; }
              var k = nz(R, -4, 4), a2 = k * (n + 1); tf.push([a2, xm(n)]); tp.push([k, xm(n + 1)]);
              st.push(SC('Een primitieve van ' + E([[a2, xm(n)]]) + ' is', E([[k, xm(n + 1)]]), primC(E([[k, xm(n + 1)]])),
                n === 0 ? 'Bij een los getal ' + T(a2) + ' hoort ' + E([[a2, 'x']]) + '.' : 'Exponent 1 hoger: x' + sup(n + 1) + '. Deel ' + T(a2) + ' door ' + (n + 1) + ': ' + T(k) + '.',
                F(E([[k, xm(n + 1)]]), E([[a2 * (n + 1), xm(n + 1)]]), 'Je vermenigvuldigde. Bij primitiveren deel je door de nieuwe exponent.', E([[a2 * n, xm(n - 1)]]), 'Dat is de afgeleide. Je moet andersom: exponent 1 hoger.')));
            });
            var Fp = E(tp) + ' + c';
            st.push(SC('Samen: F(x) =', Fp, primC(Fp), 'Zet de primitieven achter elkaar en schrijf + c erachter.'));
            return { vraag:'f(x) = ' + E(tf), context:'Bereken een primitieve F(x). Typ bijvoorbeeld 2x^3 + 5x + c.', stappen:st, antwoord:Fp, controle:primC(Fp), invoer:'tekst' };
          } },
        { id:'wvb-prim-std', naam:'Primitieven van eˣ, 1/x, sin x en cos x', kort:'eˣ blijft eˣ, 1/x wordt ln|x|, sin x wordt −cos x en cos x wordt sin x',
          uit:'<p>Ook hier draai je de afgeleiden om. <b>eˣ</b> heeft als primitieve eˣ. <b>1/x</b> heeft als primitieve <b>ln|x|</b> (voor x &gt; 0 gewoon ln x).</p><p><b>cos x</b> heeft als primitieve <b>sin x</b>. <b>sin x</b> heeft als primitieve <b>−cos x</b>: controleer maar, de afgeleide van −cos x is sin x.</p><p>Een getal ervoor blijft staan: f(x) = 4eˣ − 3 sin x geeft F(x) = 4eˣ + 3 cos x + c.</p>',
          wanneer:'je eˣ, 1/x, sin x of cos x moet primitiveren.',
          maak:function(R){
            var soorten = R.hussel(['e', 'r', 's', 'c']).slice(0, 2), tf = [], tp = [], st = [];
            var V = { e:['eˣ', 'eˣ', 1, 'eˣ blijft eˣ.'], r:['/x', 'ln|x|', 1, 'Bij 1/x hoort ln|x|.'], s:['sin x', 'cos x', -1, 'Bij sin x hoort ' + MIN + 'cos x: de afgeleide van ' + MIN + 'cos x is sin x.'], c:['cos x', 'sin x', 1, 'Bij cos x hoort sin x.'] };
            soorten.forEach(function(s){
              var a = nz(R, -5, 5), v = V[s], p = E([[a * v[2], v[1]]]); tf.push([a, v[0]]); tp.push([a * v[2], v[1]]);
              st.push(SC('Een primitieve van ' + E([[a, v[0]]]) + ' is', p, primC(p), v[3] + ' Het getal ervoor blijft staan.', s === 's' ? F(p, E([[a, 'cos x']]), 'Let op de min: bij sin x hoort min cos x.') : s === 'c' ? F(p, E([[-a, 'sin x']]), 'Bij cos x hoort plus sin x, zonder min.') : null));
            });
            if (R.heel(0, 2) === 0){ var n = R.kies([0, 1, 2]), k = nz(R, -4, 4); tf.push([k * (n + 1), xm(n)]); tp.push([k, xm(n + 1)]);
              st.push(SC('Een primitieve van ' + E([[k * (n + 1), xm(n)]]) + ' is', E([[k, xm(n + 1)]]), primC(E([[k, xm(n + 1)]])), 'Exponent 1 hoger en delen door de nieuwe exponent.')); }
            var Fp = E(tp) + ' + c';
            st.push(SC('Samen: F(x) =', Fp, primC(Fp), 'Zet de primitieven achter elkaar en schrijf + c erachter.'));
            return { vraag:'f(x) = ' + E(tf), context:'Bereken een primitieve F(x). Typ bijvoorbeeld 4e^x + 3cos(x) + c of 2ln|x| + c.', stappen:st, antwoord:Fp, controle:primC(Fp), invoer:'tekst' };
          } },
        { id:'wvb-integraal', naam:'De oppervlakte met een integraal', kort:'Oppervlakte = ∫ van a tot b van f(x) dx = F(b) − F(a)',
          uit:'<p>Ligt de grafiek van f boven de x-as, dan is de <b>oppervlakte</b> tussen de grafiek, de x-as en de lijnen x = a en x = b gelijk aan de <b>integraal</b> ∫<sub>a</sub><sup>b</sup> f(x) dx.</p><p>Die reken je uit met een primitieve: <b>F(b) − F(a)</b>. De + c laat je weg, die valt toch tegen elkaar weg.</p><p>Voorbeeld: f(x) = 3x² op [1, 2]. F(x) = x³, dus 8 − 1 = <b>7</b>.</p>',
          wanneer:'je de oppervlakte van een vlakdeel onder een grafiek exact wilt berekenen.',
          maak:function(R){
            var soort = R.kies(['p', 'p', 'p', 'para', 'ln', 'sin']), st = [], fT, f, a, b, Fx, FT, aT, bT, ctx, beeld, opp, Fa, Fb, xr, yr, xt;
            if (soort === 'p'){
              var p, q, r; do { p = R.kies([0, 3, 6]); q = R.kies([0, 2, 4, 6]); r = R.heel(0, 6); } while ((p ? 1 : 0) + (q ? 1 : 0) + (r ? 1 : 0) < 2);
              a = R.heel(0, 2); b = R.heel(a + 1, 4);
              fT = E([[p, 'x²'], [q, 'x'], [r, '']]); FT = E([[p / 3, 'x³'], [q / 2, 'x²'], [r, 'x']]);
              f = function(x){ return p * x * x + q * x + r; }; Fx = function(x){ return p / 3 * x * x * x + q / 2 * x * x + r * x; };
              aT = T(a); bT = T(b); xr = [Math.min(0, a) - 0.5, b + 0.8]; yr = [-1, f(b + 0.8) * 1.08];
            } else if (soort === 'para'){
              var pk = R.kies([[1, 3], [2, 3], [3, 1], [3, 2]]), m = pk[0], k = pk[1];
              fT = E([[m * k * k, ''], [-m, 'x²']]); f = function(x){ return m * (k * k - x * x); }; Fx = function(x){ return m * k * k * x - m / 3 * x * x * x; };
              FT = E([[m * k * k, 'x']]) + (m === 3 ? ' ' + MIN + ' x³' : ' ' + MIN + ' ' + m + '/3x³');
              a = -k; b = k; aT = T(a); bT = T(b); xr = [-k - 1, k + 1]; yr = [f(k + 1) * 0.6, m * k * k * 1.15];
              st.push(SC('De grafiek snijdt de x-as waar f(x) = 0: ' + T(m * k * k) + ' = ' + E([[m, 'x²']]) + '. x =', lijstT([-k, k], T), lijstC([-k, k]), 'Deel door ' + m + ': x² = ' + (k * k) + '. Typ x = ' + MIN + k + ' of x = ' + k + '.'));
            } else if (soort === 'ln'){
              var al = R.heel(1, 6), tw = R.heel(0, 1); fT = E([[al, '/x']]); f = function(x){ return al / x; }; Fx = function(x){ return al * Math.log(x); }; FT = E([[al, 'ln x']]);
              a = 1; b = tw ? Math.E * Math.E : Math.E; aT = '1'; bT = tw ? 'e²' : 'e'; xr = [0, tw ? 8 : 3.6]; yr = [-0.4 * al, al * 2.3];
              xt = [{ x:1, t:'1' }, { x:Math.E, t:'e' }].concat(tw ? [{ x:Math.E * Math.E, t:'e²' }] : []);
            } else {
              var as = R.heel(1, 6); fT = E([[as, 'sin x']]); f = function(x){ return as * Math.sin(x); }; Fx = function(x){ return -as * Math.cos(x); }; FT = E([[-as, 'cos x']]);
              a = 0; b = PI; aT = '0'; bT = 'π'; xr = [-0.4, PI + 0.6]; yr = [-0.3 * as, as * 1.2]; xt = [{ x:PI / 2, t:'½π' }, { x:PI, t:'π' }];
            }
            Fa = Math.round(Fx(a) * 1e9) / 1e9; Fb = Math.round(Fx(b) * 1e9) / 1e9; opp = Math.round((Fb - Fa) * 1e9) / 1e9;
            var hb = { p:'Vul x = ' + bT + ' in bij F(x) = ' + FT + '.', para:'Vul x = ' + bT + ' in bij F(x) = ' + FT + '.', ln:'ln ' + bT + ' = ' + (bT === 'e' ? 1 : 2) + '.', sin:'cos π = ' + MIN + '1, dus ' + E([[-as, '']]) + ' · ' + MIN + '1.' }[soort];
            var ha = { p:'Vul x = ' + aT + ' in bij F(x).', para:'Vul x = ' + aT + ' in bij F(x). Let op de mintekens.', ln:'ln 1 = 0.', sin:'cos 0 = 1.' }[soort];
            st.push(SC('Een primitieve: F(x) =', FT, primC(FT), { p:'Exponent 1 hoger en delen door de nieuwe exponent.', para:'Bij een los getal hoort getal · x; bij ' + E([[m, 'x²']]) + ' hoort ' + (m === 3 ? 'x³' : m + '/3x³') + '.', ln:'Bij 1/x hoort ln x.', sin:'Bij sin x hoort ' + MIN + 'cos x.' }[soort]));
            st.push(S('F(' + bT + ') =', Fb, hb));
            st.push(S('F(' + aT + ') =', Fa, ha));
            st.push(S('De oppervlakte is F(' + bT + ') ' + MIN + ' F(' + aT + ') =', opp, T(Fb) + ' ' + MIN + ' ' + paren(Fa) + '.', F(opp, Fb + Fa, 'Je telde op. Het is F(b) min F(a).')));
            ctx = soort === 'para' ? 'Bereken exact de oppervlakte van het vlakdeel dat de grafiek van f en de x-as insluiten.' : 'Bereken exact de oppervlakte van het vlakdeel tussen de grafiek van f, de x-as en de lijnen x = ' + aT + ' en x = ' + bT + '.';
            beeld = plot({ x:xr, y:yr, fns:[{ f:f }], vlak:{ f:f, a:a, b:b }, xt:xt, aria:'grafiek van f met het vlakdeel gekleurd' });
            return { vraag:'f(x) = ' + fT, context:ctx, beeld:beeld, zelfBeeld:beeld, stappen:st };
          } }
      ] },

    /* ================= radialen en de eenheidscirkel ================= */
    { groep:{ id:'wvb-eenheid', niveau:'vwo', domein:'meetkunde', naam:'Radialen en de eenheidscirkel',
        uit:'Bij goniometrische functies meet je hoeken in radialen: 180° is π. Op de eenheidscirkel lees je exacte waarden van sinus en cosinus af.' },
      doelen:[
        { id:'wvb-radialen', naam:'Graden en radialen omrekenen', kort:'180° = π radialen: graden keer π/180 geeft radialen, radialen keer 180/π geeft graden',
          uit:'<p>Een halve cirkel is <b>180°</b> of <b>π radialen</b>. Dat is de sleutel.</p><p>Van graden naar radialen: hoeveel keer 180° is het? 150° = 150/180 · π = <b>5/6π</b>.</p><p>Van radialen naar graden: vervang π door 180°. 4/3π = 4/3 · 180° = <b>240°</b>. Tip: 1/6π = 30°, 1/4π = 45° en 1/3π = 60°.</p>',
          wanneer:'je een hoek in graden en in radialen moet kunnen gebruiken.',
          maak:function(R){
            var j = R.heel(1, 24), d = 15 * j, gg = ggd(j, 12), n = j / gg, den = 12 / gg, rad = piT(n, den), st, h = d * PI / 180;
            var beeld = eenheid({ hoek:h, label:T(d) + '°', aria:'eenheidscirkel met een hoek van ' + d + ' graden' });
            if (R.heel(0, 1)){
              st = [SC('Hoeveel keer 180° is ' + d + '°? Schrijf als breuk: ' + d + '/180 =', breuk(n, den), getalC(d / 180), 'Vereenvoudig: deel teller en noemer door hetzelfde getal. ' + d + '/180 = ' + breuk(n, den) + '.'),
                SC('Dus ' + d + '° =', rad, getalC(h), '180° is π, dus ' + d + '° is ' + breuk(n, den) + ' keer π.')];
              return { vraag:d + '° = ? rad', context:'Reken om naar radialen. Geef een exact antwoord met π (typ π als pi).', beeld:beeld, stappen:st, antwoord:rad, controle:getalC(h), invoer:'tekst' };
            }
            st = den === 1 ? [S('π rad = 180°. Dus ' + rad + ' = ' + n + ' · 180° =', d, 'Vervang π door 180°.')] :
              [S('π rad = 180°. Dus 1/' + den + 'π = 180° : ' + den + ' =', 180 / den, '180 : ' + den + ' = ' + (180 / den) + '.'),
               S(rad + ' = ' + n + ' · ' + (180 / den) + '° =', d, n + ' · ' + (180 / den) + ' = ' + d + '.', F(d, 180 / den, 'Dat is 1/' + den + 'π. Je hebt ' + n + ' keer zoveel.'))];
            st[st.length - 1].eenheid = '°';
            return { vraag:rad + ' rad = ?°', context:'Reken om naar graden.', beeld:beeld, stappen:st, eenheid:'°' };
          } },
        { id:'wvb-exact', naam:'Exacte waarden op de eenheidscirkel', kort:'Zoek de hoek met de x-as en bepaal het teken met het kwadrant: sin is de y, cos is de x',
          uit:'<p>Op de <b>eenheidscirkel</b> (straal 1) hoort bij een hoek een punt. De <b>x-coördinaat</b> is de <b>cosinus</b>, de <b>y-coördinaat</b> is de <b>sinus</b>.</p><p>Ken de waarden bij 1/6π, 1/4π en 1/3π: sin is ½, ½√2 en ½√3, cos is ½√3, ½√2 en ½.</p><p>Bij een andere hoek: zoek de hoek met de <b>x-as</b> (dat is er een van die drie) en bepaal het <b>teken</b> met het kwadrant. sin(5/6π) = ½, want de hoek met de x-as is 1/6π en het punt ligt boven de x-as.</p>',
          wanneer:'je sin of cos van een hoek als 3/4π of 7/6π exact moet weten.',
          maak:function(R){
            var j, d; do { j = R.heel(1, 24); d = 15 * j; } while (d % 30 && d % 45);
            var h = d * PI / 180, fn = R.kies(['sin', 'cos']), v = fn === 'sin' ? Math.sin(h) : Math.cos(h), w = exT(v), gg = ggd(j, 12), rad = piT(j / gg, 12 / gg), st = [];
            var opt = d % 90 ? ['½', MIN + '½', '½√2', MIN + '½√2', '½√3', MIN + '½√3'] : ['0', '1', MIN + '1', '½'];
            if (d % 90){
              var kw = Math.floor(d / 90), ref = Math.min(d % 180, 180 - d % 180), kwn = ['het eerste kwadrant', 'het tweede kwadrant', 'het derde kwadrant', 'het vierde kwadrant'];
              var refT = { 30:'1/6π', 45:'1/4π', 60:'1/3π' }[ref];
              st.push(K(R, 'In welk kwadrant ligt het punt bij ' + rad + '?', kwn[kw], kwn, 'π is een halve cirkel. ' + rad + ' is ' + d + '°, en dat ligt tussen ' + (kw * 90) + '° en ' + (kw * 90 + 90) + '°.', { orde:kwn }));
              st.push(K(R, 'De hoek tussen de straal en de x-as is', refT, ['1/6π', '1/4π', '1/3π'], 'Hoeveel scheelt ' + rad + ' met de dichtstbijzijnde π of 0 of 2π? Dat is ' + ref + '°.', { orde:['1/6π', '1/4π', '1/3π'] }));
              st.push(K(R, 'Is ' + fn + '(' + rad + ') positief of negatief?', v > 0 ? 'positief' : 'negatief', [v > 0 ? 'negatief' : 'positief'], fn === 'sin' ? 'sin is de y-coördinaat: boven de x-as positief, eronder negatief.' : 'cos is de x-coördinaat: rechts van de y-as positief, links negatief.', { orde:['positief', 'negatief'] }));
            } else {
              var pts = ['(1, 0)', '(0, 1)', '(' + MIN + '1, 0)', '(0, ' + MIN + '1)'], pi = (d / 90) % 4;
              st.push(K(R, 'Bij welk punt van de eenheidscirkel hoort ' + rad + '?', pts[pi], pts, '½π is een kwart cirkel omhoog, π een halve, 1½π drie kwart en 2π de hele cirkel rond.', { orde:pts }));
            }
            var op = R.hussel(opt);
            st.push(K(R, 'Dus ' + fn + '(' + rad + ') =', w, opt, fn === 'sin' ? 'sin is de y-coördinaat van het punt.' : 'cos is de x-coördinaat van het punt.', { orde:op }));
            return { vraag:fn + '(' + rad + ')', context:'Geef de exacte waarde.', opties:op, goed:op.indexOf(w), stappen:st,
              beeld:function(n){ return eenheid({ hoek:h, proj:n >= 1, aria:'eenheidscirkel met het punt bij ' + rad }); } };
          } }
      ] },

    /* ================= goniometrische vergelijkingen en de sinusoïde ================= */
    { groep:{ id:'wvb-gonio', niveau:'vwo', domein:'meetkunde', naam:'Goniometrische vergelijkingen en de sinusoïde',
        uit:'Een vergelijking als sin x = ½ heeft meer oplossingen: de eenheidscirkel geeft er twee per rondje. Daarna stel je de formule op van een sinusoïde uit evenwichtsstand, amplitude, periode en beginpunt.' },
      doelen:[
        { id:'wvb-gvgl', naam:'sin x = c en cos x = c oplossen', kort:'Zoek één oplossing; bij sin is de tweede π − x, bij cos is hij −x; tel er 2π bij tot je in het interval zit',
          uit:'<p>Bij <b>sin x = ½</b> trek je op de eenheidscirkel de lijn y = ½. Die snijdt de cirkel in <b>twee</b> punten.</p><p>De eerste oplossing ken je: x = 1/6π. Bij <b>sin</b> is de tweede <b>π − x</b> = 5/6π. Bij <b>cos</b> is de tweede <b>−x</b>.</p><p>Ligt een oplossing niet in het interval, <b>tel er 2π bij</b> (of trek 2π af). Op [0, 2π] is het antwoord hier: x = 1/6π of x = 5/6π.</p>',
          wanneer:'je een vergelijking als sin x = ½ of cos x = −½√2 exact moet oplossen.',
          maak:function(R){
            var fn = R.kies(['sin', 'cos']), vals = [0.5, Math.SQRT2 / 2, Math.sqrt(3) / 2], cv = R.kies(vals) * R.kies([1, -1]), ct = exT(cv);
            function waar(k){ var x = k * PI / 12; return Math.abs((fn === 'sin' ? Math.sin(x) : Math.cos(x)) - cv) < 1e-9; }
            var k0 = Math.round((fn === 'sin' ? Math.asin(cv) : Math.acos(cv)) / (PI / 12)), k1 = fn === 'sin' ? 12 - k0 : -k0;
            var opl = []; for (var k = 0; k <= 24; k++) if (waar(k)) opl.push(k);
            function pk(k){ return piT(k, 12); }
            var af1 = uniek([-k0, 6 - k0, k0 + 6, 2 * k0].filter(function(k){ return !waar(k) && k !== k0; }).map(pk)).slice(0, 2);
            var af2 = uniek((fn === 'sin' ? [-k0, k0 + 12] : [12 - k0, k0 + 12]).filter(function(k){ return !waar(k); }).map(pk)).slice(0, 2);
            var antw = lijstT(opl.map(function(k){ return k; }), pk), lw = opl.map(function(k){ return k * PI / 12; });
            return { vraag:fn + ' x = ' + ct, context:'Los exact op op het interval [0, 2π]. Typ π als pi en zet "of" tussen de oplossingen.', invoer:'tekst', antwoord:antw, controle:lijstC(lw),
              beeld:function(n){ return eenheid({ lijn:{ sin:fn === 'sin', v:cv, t:ct }, punten:n >= 2 ? [k0 * PI / 12, k1 * PI / 12] : n >= 1 ? [k0 * PI / 12] : [], aria:'eenheidscirkel met de lijn ' + (fn === 'sin' ? 'y' : 'x') + ' = ' + ct }); },
              stappen:[
                K(R, 'Eén oplossing, met de eenheidscirkel of de tabel: x =', pk(k0), af1, fn === 'sin' ? 'sin is de y-coördinaat. Bij welke hoek is die ' + ct + '? Bij een negatieve waarde ligt de hoek onder de x-as.' : 'cos is de x-coördinaat. Bij welke hoek tussen 0 en π is die ' + ct + '?'),
                K(R, 'De tweede oplossing: bij ' + fn + ' is dat ' + (fn === 'sin' ? 'π ' + MIN + ' x' : MIN + 'x') + '. Dus x =', pk(k1), af2, fn === 'sin' ? 'π ' + MIN + ' (' + pk(k0) + ') = ' + pk(k1) + '.' : 'Het punt gespiegeld in de x-as: ' + MIN + '(' + pk(k0) + ') = ' + pk(k1) + '.'),
                SC('Tel 2π op of trek 2π af tot de oplossingen tussen 0 en 2π liggen. Alle oplossingen:', antw, lijstC(lw), 'Een negatieve oplossing plus 2π: bijvoorbeeld ' + MIN + '1/6π + 2π = 11/6π. Typ bijvoorbeeld x = 1/6pi of x = 5/6pi.') ] };
          } },
        { id:'wvb-gvgl-2x', naam:'Vergelijkingen als sin(2x) = c', kort:'Los eerst op voor u = 2x, neem alle u op het dubbele interval en deel dan door 2',
          uit:'<p>Bij <b>sin(2x) = ½</b> op [0, 2π] noem je <b>u = 2x</b>. Als x van 0 tot 2π loopt, loopt u van 0 tot <b>4π</b>: twee rondjes.</p><p>Los sin u = ½ op: u = 1/6π of u = 5/6π. Het tweede rondje geeft er <b>2π</b> bij: u = 13/6π of u = 17/6π.</p><p><b>Deel</b> alles door 2: x = 1/12π, 5/12π, 13/12π of 17/12π. Vier oplossingen.</p>',
          wanneer:'er 2x achter sin of cos staat en je alle oplossingen op een interval zoekt.',
          maak:function(R){
            var fn = R.kies(['sin', 'cos']), cv = R.kies([0.5, Math.SQRT2 / 2, Math.sqrt(3) / 2]) * R.kies([1, -1]), ct = exT(cv);
            function waar(k){ var x = k * PI / 12; return Math.abs((fn === 'sin' ? Math.sin(x) : Math.cos(x)) - cv) < 1e-9; }
            var u1 = [], u2 = []; for (var k = 0; k <= 48; k++) if (waar(k)){ if (k <= 24) u1.push(k); u2.push(k); }
            function pk12(k){ return piT(k, 12); } function pk24(k){ return piT(k, 24); }
            var antw = lijstT(u2, pk24);
            return { vraag:fn + '(2x) = ' + ct, context:'Los exact op op het interval [0, 2π]. Typ π als pi en zet "of" tussen de oplossingen.', invoer:'tekst', antwoord:antw, controle:lijstC(u2.map(function(k){ return k * PI / 24; })),
              stappen:[
                SC('Stel u = 2x. Los eerst ' + fn + ' u = ' + ct + ' op, met u op [0, 2π]. u =', lijstT(u1, pk12), lijstC(u1.map(function(k){ return k * PI / 12; })), 'Gebruik de eenheidscirkel: een oplossing en ' + (fn === 'sin' ? 'π min die oplossing' : 'min die oplossing, plus 2π') + '.'),
                SC('x loopt van 0 tot 2π, dus u = 2x loopt van 0 tot 4π. Tel bij elke oplossing 2π op. Alle u:', lijstT(u2, pk12), lijstC(u2.map(function(k){ return k * PI / 12; })), '2π = 24/12π. Bijvoorbeeld ' + pk12(u1[0]) + ' + 2π = ' + pk12(u1[0] + 24) + '.'),
                SC('Deel alles door 2: x =', antw, lijstC(u2.map(function(k){ return k * PI / 24; })), 'x = u : 2. Bijvoorbeeld ' + pk12(u1[0]) + ' : 2 = ' + pk24(u1[0]) + '.') ] };
          } },
        { id:'wvb-sinusoide', naam:'De formule van een sinusoïde', kort:'y = a + b sin(c(x − d)): a is de evenwichtsstand, b de amplitude, c = 2π : periode en d het beginpunt',
          uit:'<p>Een <b>sinusoïde</b> heeft de formule <b>y = a + b sin(c(x − d))</b>.</p><p><b>a</b> is de evenwichtsstand: (max + min) : 2. <b>b</b> is de amplitude: (max − min) : 2. <b>c</b> = 2π : periode. <b>d</b> is het beginpunt: daar gaat de grafiek <b>stijgend</b> door de evenwichtsstand.</p><p>Ligt er een maximum bij x = 5 en is de periode 12? Het beginpunt ligt een <b>kwart periode</b> eerder: d = 5 − 3 = 2.</p>',
          wanneer:'je bij een golvende grafiek of een periodiek verschijnsel een formule moet opstellen.',
          maak:function(R){
            var P = R.kies([4, 8, 12, 20, 24]), d = R.heel(0, P / 2), a = R.heel(-3, 12), b = R.heel(1, 6), mx = a + b, mn = a - b, xm = d + P / 4, ct = piT(2, P);
            var arg = ct + (d ? '(x ' + MIN + ' ' + d + ')' : 'x'), form = 'y = ' + (a ? T(a) + ' + ' : '') + (b === 1 ? '' : b + ' ') + 'sin(' + arg + ')';
            var f = function(x){ return a + b * Math.sin(2 * PI / P * (x - d)); }, beeld = plot({ x:[0, 2 * P], y:[mn - 1.5, mx + 1.5], fns:[{ f:f }], hl:[{ y:a, k:KL[2] }], punten:[{ x:xm, y:mx, t:'max' }], aria:'grafiek van de sinusoïde' });
            return { vraag:'y = a + b sin(c(x − d))', context:'Een sinusoïde heeft maximum ' + T(mx) + ' en minimum ' + T(mn) + '. De periode is ' + P + '. Bij x = ' + xm + ' ligt een maximum. Stel de formule op. Typ π als pi.',
              invoer:'tekst', antwoord:form, controle:fC(form.replace(/^y = /, '')), beeld:beeld, zelfBeeld:beeld,
              stappen:[
                S('De evenwichtsstand a = (max + min) : 2 =', a, '(' + T(mx) + ' + ' + paren(mn) + ') : 2.', F(a, b, 'Dat is de amplitude. De evenwichtsstand ligt midden tussen max en min.')),
                S('De amplitude b = (max ' + MIN + ' min) : 2 =', b, '(' + T(mx) + ' ' + MIN + ' ' + paren(mn) + ') : 2.', F(b, a, 'Dat is de evenwichtsstand. De amplitude is de halve afstand van max tot min.', 2 * b, 'Deel nog door 2: de amplitude is de halve hoogte.')),
                SC('c = 2π : periode = 2π : ' + P + ' =', ct, getalC(2 * PI / P), '2/' + P + ' vereenvoudigd, keer π: ' + ct + '.'),
                S('Een maximum ligt een kwart periode na het beginpunt. Een kwart periode is ' + (P / 4) + '. Dus d = ' + xm + ' ' + MIN + ' ' + (P / 4) + ' =', d, 'Het beginpunt ligt ' + (P / 4) + ' vóór het maximum.'),
                SC('De formule:', form, fC(form.replace(/^y = /, '')), 'Vul a, b, c en d in: ' + form + '.') ] };
          } }
      ] },

    /* ================= vectoren ================= */
    { groep:{ id:'wvb-vec', niveau:'vwo', domein:'meetkunde', naam:'Vectoren en lijnen',
        uit:'Met vectoren reken je in het vlak: optellen, de lengte, het inproduct en de hoek. Een lijn beschrijf je met een vectorvoorstelling of een vergelijking, en daarmee bereken je ook de afstand van een punt tot een lijn.' },
      doelen:[
        { id:'wvb-vec-som', naam:'Vectoren optellen en de lengte', kort:'Reken met de kentallen apart; de lengte van (x, y) is √(x² + y²)',
          uit:'<p>Een vector schrijf je met zijn <b>kentallen</b>: a = (3, −2) betekent 3 naar rechts en 2 naar beneden.</p><p><b>Optellen</b> en keer een getal doe je per kental: 2a + b met b = (1, 5) is (2 · 3 + 1, 2 · −2 + 5) = (7, 1).</p><p>De <b>lengte</b> is Pythagoras: |(7, 1)| = √(49 + 1) = <b>√50</b>. Laat de wortel staan als hij niet uitkomt: dat is exact.</p>',
          wanneer:'je vectoren moet optellen of de lengte van een vector exact moet berekenen.',
          maak:function(R){
            var a, b, cmb, r;
            do { a = [nz(R, -5, 5), R.heel(-5, 5)]; b = [R.heel(-5, 5), nz(R, -5, 5)]; cmb = R.kies([[1, 1, 'a + b'], [1, -1, 'a − b'], [2, 1, '2a + b'], [1, 2, 'a + 2b'], [2, -1, '2a − b'], [3, 1, '3a + b'], [1, -3, 'a − 3b']]); r = [cmb[0] * a[0] + cmb[1] * b[0], cmb[0] * a[1] + cmb[1] * b[1]]; }
            while ((!r[0] && !r[1]) || Math.abs(r[0]) > 12 || Math.abs(r[1]) > 12);
            var L2 = r[0] * r[0] + r[1] * r[1], wt = Math.round(Math.sqrt(L2)), lT = wt * wt === L2 ? T(wt) : '√' + L2, lab = cmb[2].replace('−', MIN);
            function stuk(i){ return (cmb[0] === 1 ? '' : cmb[0] + ' · ') + paren(a[i]) + (cmb[1] < 0 ? ' ' + MIN + ' ' : ' + ') + (Math.abs(cmb[1]) === 1 ? '' : Math.abs(cmb[1]) + ' · ') + paren(b[i]); }
            return { vraag:'|' + lab + '|', context:'a = ' + pt(a[0], a[1]) + ' en b = ' + pt(b[0], b[1]) + '. Bereken de lengte van ' + lab + ' exact. Typ een wortel als wortel of √.', invoer:'tekst', antwoord:lT, controle:getalC(Math.sqrt(L2)),
              beeld:function(n){ return vecBeeld([{ v:a, k:KL[0], t:'a' }, { v:b, k:KL[2], t:'b' }].concat(n >= 2 ? [{ v:r, k:KL[1], t:lab }] : []), 'de vectoren a en b' + (n >= 2 ? ' en ' + lab : '')); },
              stappen:[
                S('Het eerste kental van ' + lab + ': ' + stuk(0) + ' =', r[0], 'Reken alleen met de eerste kentallen: ' + a[0] + ' en ' + b[0] + '.'),
                S('Het tweede kental: ' + stuk(1) + ' =', r[1], 'Reken alleen met de tweede kentallen: ' + a[1] + ' en ' + b[1] + '.'),
                SC('De lengte: √(' + paren(r[0]) + '² + ' + paren(r[1]) + '²) =', lT, getalC(Math.sqrt(L2)), paren(r[0]) + '² + ' + paren(r[1]) + '² = ' + L2 + '.' + (wt * wt === L2 ? ' √' + L2 + ' = ' + wt + '.' : ' Laat de wortel staan: √' + L2 + '.')) ] };
          } },
        { id:'wvb-inproduct', naam:'Het inproduct', kort:'a · b = a₁b₁ + a₂b₂; is het inproduct 0, dan staan de vectoren loodrecht op elkaar',
          uit:'<p>Het <b>inproduct</b> van a = (a₁, a₂) en b = (b₁, b₂) is <b>a₁ · b₁ + a₂ · b₂</b>: eerste keer eerste, plus tweede keer tweede. Het is een getal, geen vector.</p><p>(3, −2) · (4, 5) = 12 − 10 = 2.</p><p>Is het inproduct <b>0</b>, dan staan de vectoren <b>loodrecht</b> op elkaar. Zo vind je een onbekend kental: (p, 3) · (6, −2) = 6p − 6 = 0 geeft p = 1.</p>',
          wanneer:'je het inproduct nodig hebt, of wilt weten wanneer twee vectoren loodrecht staan.',
          maak:function(R){
            if (R.heel(0, 2)){
              var a = [nz(R, -6, 6), nz(R, -6, 6)], b = [nz(R, -6, 6), nz(R, -6, 6)], ip = a[0] * b[0] + a[1] * b[1];
              return { vraag:'a · b', context:'a = ' + pt(a[0], a[1]) + ' en b = ' + pt(b[0], b[1]) + '. Bereken het inproduct a · b.', stappen:[
                S('Eerste keer eerste: ' + paren(a[0]) + ' · ' + paren(b[0]) + ' =', a[0] * b[0], 'Let op de mintekens.'),
                S('Tweede keer tweede: ' + paren(a[1]) + ' · ' + paren(b[1]) + ' =', a[1] * b[1], 'Let op de mintekens.'),
                S('Tel op: a · b = ' + T(a[0] * b[0]) + ' + ' + paren(a[1] * b[1]) + ' =', ip, 'Het inproduct is een getal.') ] };
            }
            var p, a2, b1, b2;
            do { p = nz(R, -8, 8); b1 = nz(R, -5, 5); b2 = nz(R, -6, 6); a2 = -p * b1 / b2; } while (a2 !== Math.round(a2) || !a2 || Math.abs(a2) > 9);
            var ex = E([[b1, 'p'], [a2 * b2, '']]);
            return { vraag:'a ⊥ b', context:'a = (p, ' + T(a2) + ') en b = ' + pt(b1, b2) + '. Voor welke p staan a en b loodrecht op elkaar?', stappen:[
              SC('Het inproduct: p · ' + paren(b1) + ' + ' + paren(a2) + ' · ' + paren(b2) + ' =', ex, fC(ex), 'Eerste keer eerste plus tweede keer tweede. Typ bijvoorbeeld ' + ex.replace(/−/g, '-') + '.'),
              S('Loodrecht: het inproduct is 0. ' + ex + ' = 0, dus p =', p, 'Los de vergelijking op.', F(p, -p, 'Let op het teken.')) ] };
          } },
        { id:'wvb-vec-hoek', naam:'De hoek tussen twee vectoren', kort:'cos φ = (a · b) : (|a| · |b|); daarna φ met cos⁻¹',
          uit:'<p>Voor de <b>hoek φ</b> tussen a en b geldt: <b>cos φ = (a · b) : (|a| · |b|)</b>.</p><p>Stappenplan: het inproduct, de twee lengtes, en dan φ = cos⁻¹(inproduct : (|a| · |b|)).</p><p>Voorbeeld: a = (3, 1) en b = (1, 2). a · b = 5, |a| = √10, |b| = √5. cos φ = 5 : √50 ≈ 0,707, dus φ = 45°. Reken met de exacte lengtes, dan wordt je antwoord niet te grof.</p>',
          wanneer:'je de hoek tussen twee vectoren of twee lijnen moet berekenen.',
          maak:function(R){
            var a, b; do { a = [R.heel(-6, 6), R.heel(-6, 6)]; b = [R.heel(-6, 6), R.heel(-6, 6)]; } while ((!a[0] && !a[1]) || (!b[0] && !b[1]) || a[0] * b[1] - a[1] * b[0] === 0);
            var ip = a[0] * b[0] + a[1] * b[1], la2 = a[0] * a[0] + a[1] * a[1], lb2 = b[0] * b[0] + b[1] * b[1];
            function wt(q){ var r = Math.round(Math.sqrt(q)); return r * r === q ? T(r) : '√' + q; }
            var phi = Math.acos(ip / Math.sqrt(la2 * lb2)) * 180 / PI;
            return { vraag:'∠(a, b)', context:'a = ' + pt(a[0], a[1]) + ' en b = ' + pt(b[0], b[1]) + '. Bereken de hoek tussen a en b in graden. Rond af op 1 decimaal.', eenheid:'°',
              beeld:vecBeeld([{ v:a, k:KL[0], t:'a' }, { v:b, k:KL[2], t:'b' }], 'de vectoren a en b'),
              stappen:[
                S('Het inproduct a · b =', ip, paren(a[0]) + ' · ' + paren(b[0]) + ' + ' + paren(a[1]) + ' · ' + paren(b[1]) + '.'),
                SC('|a| =', wt(la2), getalC(Math.sqrt(la2), 0.005), '√(' + paren(a[0]) + '² + ' + paren(a[1]) + '²) = √' + la2 + '. Exact of op 2 decimalen.'),
                SC('|b| =', wt(lb2), getalC(Math.sqrt(lb2), 0.005), '√(' + paren(b[0]) + '² + ' + paren(b[1]) + '²) = √' + lb2 + '. Exact of op 2 decimalen.'),
                (function(){ var s = S('φ = cos⁻¹(' + T(ip) + ' : (' + wt(la2) + ' · ' + wt(lb2) + ')). Rond af op 1 decimaal: φ ≈', rnd(phi, 1), 'Typ op je rekenmachine cos⁻¹(' + ip + ' ÷ √' + (la2 * lb2) + '). Je rekenmachine moet in graden staan.'); s.eenheid = '°'; return s; })() ] };
          } },
        { id:'wvb-vec-lijn', naam:'De vectorvoorstelling van een lijn', kort:'Lijn door A en B: (x, y) = A + t · (B − A), met steunvector A en richtingsvector B − A',
          uit:'<p>Een lijn door A en B beschrijf je met een <b>vectorvoorstelling</b>: <b>(x, y) = A + t · r</b>. A is de <b>steunvector</b>, r = B − A de <b>richtingsvector</b>. Elke t geeft een punt van de lijn.</p><p>A(1, 2) en B(4, 0): r = (3, −2), dus (x, y) = (1, 2) + t · (3, −2).</p><p>Ligt P(7, y) op de lijn? Uit de x: 1 + 3t = 7, dus t = 2. Dan y = 2 + 2 · −2 = −2.</p>',
          wanneer:'je met een lijn door twee punten wilt rekenen.',
          maak:function(R){
            var A, B, r; do { A = [R.heel(-5, 5), R.heel(-5, 5)]; B = [R.heel(-5, 5), R.heel(-5, 5)]; r = [B[0] - A[0], B[1] - A[1]]; } while (!r[0] || (!r[1] && R.heel(0, 3)));
            var t = R.kies([-3, -2, -1, 2, 3, 4]), P1 = A[0] + t * r[0], y = A[1] + t * r[1];
            function vv(p, d){ return '(x, y) = ' + pt(p[0], p[1]) + ' + t · ' + pt(d[0], d[1]); }
            function goedeLijn(p, d){ return (d[0] || d[1]) && d[0] * r[1] - d[1] * r[0] === 0 && (p[0] - A[0]) * r[1] - (p[1] - A[1]) * r[0] === 0; }
            var kand = [[r, A], [B, A], [A, [A[0] + B[0], A[1] + B[1]]], [A, B], [B, [r[1], r[0]]], [A, [-r[1], r[0]]]].filter(function(c){ return !goedeLijn(c[0], c[1]); }).map(function(c){ return vv(c[0], c[1]); });
            return { vraag:'P(' + T(P1) + ', ?)', context:'De lijn l gaat door A' + pt(A[0], A[1]) + ' en B' + pt(B[0], B[1]) + '. Het punt P(' + T(P1) + ', y) ligt op l. Bereken y met een vectorvoorstelling.',
              stappen:[
                SC('De richtingsvector: B ' + MIN + ' A =', pt(r[0], r[1]), coordC(r[0], r[1]), 'Per kental: ' + B[0] + ' ' + MIN + ' ' + paren(A[0]) + ' en ' + B[1] + ' ' + MIN + ' ' + paren(A[1]) + '. Typ bijvoorbeeld (3, ' + MIN + '2).'),
                K(R, 'Een vectorvoorstelling van l is', vv(A, r), uniek(kand).slice(0, 3), 'De steunvector is een punt van de lijn (A), de richtingsvector is B ' + MIN + ' A.'),
                S('P ligt op l: ' + A[0] + ' + t · ' + paren(r[0]) + ' = ' + T(P1) + '. Dus t =', t, '(' + T(P1) + ' ' + MIN + ' ' + paren(A[0]) + ') : ' + paren(r[0]) + '.'),
                S('Vul t = ' + t + ' in bij y: y = ' + A[1] + ' + ' + paren(t) + ' · ' + paren(r[1]) + ' =', y, 'Eerst ' + paren(t) + ' · ' + paren(r[1]) + ' = ' + T(t * r[1]) + ', dan erbij ' + A[1] + '.') ] };
          } },
        { id:'wvb-vec-vgl', naam:'Van vectorvoorstelling naar vergelijking', kort:'Neem een normaalvector n = (r₂, −r₁); de vergelijking is r₂x − r₁y = c, en c vind je met het steunpunt',
          uit:'<p>Een <b>normaalvector</b> n staat loodrecht op de lijn. Bij richtingsvector r = (3, −2) is n = (2, 3) goed: verwissel de kentallen en verander één teken. Controle: 3 · 2 + −2 · 3 = 0.</p><p>Met n = (a, b) is de vergelijking <b>ax + by = c</b>. Vul het steunpunt in voor c: bij (1, 2) is c = 2 · 1 + 3 · 2 = 8. Dus <b>2x + 3y = 8</b>.</p>',
          wanneer:'je van een vectorvoorstelling een vergelijking ax + by = c wilt maken.',
          maak:function(R){
            var A = [R.heel(-5, 5), R.heel(-5, 5)], r = [nz(R, -5, 5), nz(R, -5, 5)], g = ggd(r[0], r[1]), n = [r[1] / g, -r[0] / g];
            if (n[0] < 0){ n = [-n[0], -n[1]]; }
            var c = n[0] * A[0] + n[1] * A[1], vgl = E([[n[0], 'x'], [n[1], 'y']]) + ' = ' + T(c);
            return { vraag:'(x, y) = ' + pt(A[0], A[1]) + ' + t · ' + pt(r[0], r[1]), context:'Stel een vergelijking op van deze lijn, van de vorm ax + by = c.', invoer:'tekst', antwoord:vgl, controle:vglC(vgl),
              stappen:[
                SC('Een normaalvector, loodrecht op ' + pt(r[0], r[1]) + ': n =', pt(n[0], n[1]), normC(r[0], r[1]), 'Verwissel de kentallen en verander één teken. Controle: het inproduct met ' + pt(r[0], r[1]) + ' moet 0 zijn.'),
                S('Neem n = ' + pt(n[0], n[1]) + '. Dan is de vergelijking ' + E([[n[0], 'x'], [n[1], 'y']]) + ' = c. Vul het steunpunt ' + pt(A[0], A[1]) + ' in: c =', c, T(n[0]) + ' · ' + paren(A[0]) + ' + ' + paren(n[1]) + ' · ' + paren(A[1]) + '.'),
                SC('De vergelijking:', vgl, vglC(vgl), 'Zet c rechts: ' + vgl + '.') ] };
          } },
        { id:'wvb-afstand', naam:'De afstand van een punt tot een lijn', kort:'Bij de lijn ax + by = c en het punt P(p, q): d = |ap + bq − c| : √(a² + b²)',
          uit:'<p>De <b>afstand</b> van een punt tot een lijn meet je loodrecht op de lijn. Met de <b>formule</b> gaat het snel: bij de lijn ax + by = c en het punt P(p, q) is</p><p><b>d(P, l) = |ap + bq − c| : √(a² + b²)</b>.</p><p>Voorbeeld: l: 3x + 4y = 2 en P(4, 5). Teller: |12 + 20 − 2| = 30. Noemer: √(9 + 16) = 5. Dus d = 6. Het kan ook met een loodlijn en een snijpunt, maar dat is veel meer werk.</p>',
          wanneer:'je de afstand van een punt tot een lijn moet berekenen.',
          maak:function(R){
            var ab, P, c, num;
            do { ab = R.kies([[3, 4], [4, 3], [6, 8], [8, 6]]); ab = [ab[0] * R.kies([1, -1]), ab[1] * R.kies([1, -1])]; P = [R.heel(-6, 6), R.heel(-6, 6)]; c = R.heel(-12, 12); num = ab[0] * P[0] + ab[1] * P[1] - c; } while (!num);
            var N = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]), d = Math.abs(num) / N;
            return { vraag:'d(P, l)', context:'l: ' + E([[ab[0], 'x'], [ab[1], 'y']]) + ' = ' + T(c) + ' en P' + pt(P[0], P[1]) + '. Bereken de afstand van P tot l.', antwoord:T(d), controle:getalC(d),
              stappen:[
                S('Vul P in: ' + T(ab[0]) + ' · ' + paren(P[0]) + ' + ' + paren(ab[1]) + ' · ' + paren(P[1]) + ' ' + MIN + ' ' + paren(c) + ' =', num, 'Eerst de twee producten, dan ' + MIN + ' ' + paren(c) + '.'),
                S('De noemer: √(' + paren(ab[0]) + '² + ' + paren(ab[1]) + '²) =', N, paren(ab[0]) + '² + ' + paren(ab[1]) + '² = ' + (N * N) + '.'),
                SC('d = |' + T(num) + '| : ' + N + ' =', T(d), getalC(d), 'De absolute waarde maakt het getal positief: ' + Math.abs(num) + ' : ' + N + '.', F(T(d), T(num / N), 'Een afstand is nooit negatief: neem de absolute waarde.')) ] };
          } }
      ] },

    /* ================= de cirkel ================= */
    { groep:{ id:'wvb-cirkel', niveau:'vwo', domein:'meetkunde', naam:'De vergelijking van een cirkel',
        uit:'Een cirkel met middelpunt M(a, b) en straal r heeft de vergelijking (x − a)² + (y − b)² = r². Je stelt hem op, je leest middelpunt en straal af, en je herschrijft een vergelijking met kwadraatafsplitsen.' },
      doelen:[
        { id:'wvb-cirkel-op', naam:'De vergelijking van een cirkel opstellen', kort:'Cirkel met middelpunt M(a, b) en straal r: (x − a)² + (y − b)² = r²',
          uit:'<p>Een punt (x, y) ligt op de cirkel als zijn afstand tot M precies r is. Met Pythagoras geeft dat <b>(x − a)² + (y − b)² = r²</b>.</p><p>Let op het teken: bij M(3, −2) hoort (x − 3)² + (y + 2)².</p><p>Ken je de straal niet, maar wel een punt P op de cirkel? Dan is r² = (afstand MP)². Middelpunt (1, 2) en P(4, 6): r² = 3² + 4² = 25.</p>',
          wanneer:'je de vergelijking zoekt van een cirkel met een gegeven middelpunt.',
          maak:function(R){
            var a, b; do { a = R.heel(-5, 5); b = R.heel(-5, 5); } while (!a && !b);
            var mp = R.heel(0, 1), r2, P, ctx, st = [];
            function xd(l, v){ return v === 0 ? l + '²' : '(' + l + ' ' + (v > 0 ? MIN + ' ' + v : '+ ' + (-v)) + ')²'; }
            if (mp){ var dx, dy; do { dx = R.heel(-5, 5); dy = R.heel(-5, 5); } while (!dx || !dy); P = [a + dx, b + dy]; r2 = dx * dx + dy * dy; ctx = 'Stel een vergelijking op van de cirkel met middelpunt M' + pt(a, b) + ' die door P' + pt(P[0], P[1]) + ' gaat.'; }
            else { var r = R.heel(2, 7); r2 = r * r; ctx = 'Stel een vergelijking op van de cirkel met middelpunt M' + pt(a, b) + ' en straal ' + r + '.'; }
            if (a) st.push(K(R, 'Het stuk met x:', xd('x', a), [xd('x', -a)], 'In de vergelijking staat x min de x van het middelpunt: x ' + MIN + ' ' + paren(a) + '.'));
            if (b) st.push(K(R, 'Het stuk met y:', xd('y', b), [xd('y', -b)], 'In de vergelijking staat y min de y van het middelpunt: y ' + MIN + ' ' + paren(b) + '.'));
            st.push(S(mp ? 'r² is de afstand MP in het kwadraat: (' + P[0] + ' ' + MIN + ' ' + paren(a) + ')² + (' + P[1] + ' ' + MIN + ' ' + paren(b) + ')² =' : 'r² =', r2, mp ? 'Pythagoras: ' + paren(P[0] - a) + '² + ' + paren(P[1] - b) + '².' : 'De straal in het kwadraat.', mp ? null : F(r2, Math.sqrt(r2), 'Rechts staat r², niet r.')));
            var vgl = xd('x', a) + ' + ' + xd('y', b) + ' = ' + r2;
            st.push(SC('De vergelijking:', vgl, vglC(vgl), 'Zet de stukken samen: ' + vgl + '.'));
            var sp = Math.max(Math.abs(a), Math.abs(b)) + Math.sqrt(r2) + 1.5, yr = [Math.min(b - Math.sqrt(r2), 0) - 1.5, Math.max(b + Math.sqrt(r2), 0) + 1.5], hx = (yr[1] - yr[0]) * 384 / 258 / 2;
            return { vraag:'M' + pt(a, b), context:ctx + ' Typ bijvoorbeeld (x−3)^2+(y+2)^2=25.', invoer:'tekst', antwoord:vgl, controle:vglC(vgl), stappen:st,
              beeld:function(n){ return plot({ x:[a - hx, a + hx], y:yr, punten:[{ x:a, y:b, t:'M' }].concat(mp ? [{ x:P[0], y:P[1], t:'P', k:KL[3] }] : []), cirkels:n >= st.length ? [{ m:[a, b], r:Math.sqrt(r2) }] : [], aria:'het middelpunt' + (n >= st.length ? ' en de cirkel' : '') }); } };
          } },
        { id:'wvb-cirkel-af', naam:'Middelpunt en straal aflezen', kort:'Bij (x − a)² + (y − b)² = r² is het middelpunt (a, b): let op het teken; de straal is √(r²)',
          uit:'<p>Uit (x − 3)² + (y + 2)² = 25 lees je af: het middelpunt is <b>M(3, −2)</b>. Het teken draait om: x − 3 hoort bij 3, en y + 2 hoort bij −2.</p><p>Rechts staat r², dus de <b>straal</b> is <b>√25 = 5</b>. Komt de wortel niet uit, laat hem dan staan: r = √20.</p>',
          wanneer:'je bij een cirkelvergelijking het middelpunt en de straal wilt weten.',
          maak:function(R){
            var a, b; do { a = R.heel(-6, 6); b = R.heel(-6, 6); } while (!a || !b && R.heel(0, 1));
            var r2 = R.heel(0, 9) < 7 ? R.kies([4, 9, 16, 25, 36, 49, 64]) : R.kies([8, 12, 18, 20, 27, 32, 45, 50]), rw = Math.round(Math.sqrt(r2)), rT = rw * rw === r2 ? T(rw) : '√' + r2;
            function xd(l, v){ return v === 0 ? l + '²' : '(' + l + ' ' + (v > 0 ? MIN + ' ' + v : '+ ' + (-v)) + ')²'; }
            function opt(p, q, s){ return 'M' + pt(p, q) + ' en r = ' + s; }
            var goed = opt(a, b, rT), op = R.hussel(uniek([goed, opt(-a, -b, rT), opt(a, b, T(r2)), opt(-a, -b, T(r2))]));
            return { vraag:xd('x', a) + ' + ' + xd('y', b) + ' = ' + r2, context:'Geef het middelpunt en de straal van deze cirkel.', opties:op, goed:op.indexOf(goed), stappen:[
              S('De x-coördinaat van M:', a, a ? 'Bij ' + xd('x', a) + ' hoort ' + T(a) + ': het teken draait om.' : 'Er staat x², dus x ' + MIN + ' 0.', F(a, -a, 'Het teken draait om: bij x ' + (a > 0 ? MIN + ' ' + a : '+ ' + (-a)) + ' hoort ' + T(a) + '.')),
              S('De y-coördinaat van M:', b, b ? 'Bij ' + xd('y', b) + ' hoort ' + T(b) + ': het teken draait om.' : 'Er staat y², dus y ' + MIN + ' 0.', F(b, -b, 'Het teken draait om.')),
              SC('De straal: r = √' + r2 + ' =', rT, getalC(Math.sqrt(r2)), rw * rw === r2 ? rw + ' · ' + rw + ' = ' + r2 + '.' : 'De wortel komt niet uit: laat hem staan.', F(rT, r2, 'Rechts staat r². De straal is de wortel daarvan.')) ] };
          } },
        { id:'wvb-cirkel-afsplits', naam:'Kwadraatafsplitsen bij een cirkel', kort:'Schrijf x² − 6x als (x − 3)² − 9 en y² + 4y als (y + 2)² − 4; breng de getallen naar rechts',
          uit:'<p>Staat de vergelijking uitgewerkt, zoals x² + y² − 6x + 4y − 12 = 0, dan zie je het middelpunt niet direct. <b>Splits het kwadraat af</b>.</p><p>x² − 6x = (x − 3)² − 9: neem de helft van −6 en trek het kwadraat daarvan af. y² + 4y = (y + 2)² − 4.</p><p>Dan staat er (x − 3)² − 9 + (y + 2)² − 4 − 12 = 0, dus <b>(x − 3)² + (y + 2)² = 25</b>. M(3, −2) en r = 5.</p>',
          wanneer:'de vergelijking van een cirkel zonder haakjes is gegeven.',
          maak:function(R){
            var a = nz(R, -5, 5), b = nz(R, -5, 5), r2 = R.heel(0, 9) < 7 ? R.kies([4, 9, 16, 25, 36, 49]) : R.kies([8, 12, 18, 20, 32, 45]), Fc = a * a + b * b - r2;
            var rw = Math.round(Math.sqrt(r2)), rT = rw * rw === r2 ? T(rw) : '√' + r2;
            function xd(l, v){ return '(' + l + ' ' + (v > 0 ? MIN + ' ' + v : '+ ' + (-v)) + ')²'; }
            var xs = xd('x', a) + ' ' + MIN + ' ' + (a * a), ys = xd('y', b) + ' ' + MIN + ' ' + (b * b);
            function opt(p, q, s){ return 'M' + pt(p, q) + ' en r = ' + s; }
            var goed = opt(a, b, rT), op = R.hussel(uniek([goed, opt(-a, -b, rT), opt(a, b, T(r2)), opt(-a, -b, T(r2))]));
            return { vraag:E([[1, 'x²'], [1, 'y²'], [-2 * a, 'x'], [-2 * b, 'y'], [Fc, '']]) + ' = 0', context:'Bereken het middelpunt en de straal van deze cirkel met kwadraatafsplitsen.', opties:op, goed:op.indexOf(goed), stappen:[
              SC('Splits af bij x: ' + E([[1, 'x²'], [-2 * a, 'x']]) + ' =', xs, afsplitsC('x', -a, -a * a), 'De helft van ' + T(-2 * a) + ' is ' + T(-a) + ': ' + xd('x', a) + ', en trek ' + T(-a) + '² = ' + (a * a) + ' eraf. Typ bijvoorbeeld (x−3)^2−9.'),
              SC('Splits af bij y: ' + E([[1, 'y²'], [-2 * b, 'y']]) + ' =', ys, afsplitsC('y', -b, -b * b), 'De helft van ' + T(-2 * b) + ' is ' + T(-b) + ': ' + xd('y', b) + ', en trek ' + T(-b) + '² = ' + (b * b) + ' eraf.'),
              S('Nu staat er ' + xs + ' + ' + ys + (Fc ? (Fc > 0 ? ' + ' + Fc : ' ' + MIN + ' ' + (-Fc)) : '') + ' = 0. Breng de losse getallen naar rechts: r² =', r2, (a * a) + ' + ' + (b * b) + (Fc ? (Fc > 0 ? ' ' + MIN + ' ' + Fc : ' + ' + (-Fc)) : '') + '.', F(r2, a * a + b * b + Fc, 'Let op de tekens: wat links min is, wordt rechts plus.')),
              K(R, 'Het middelpunt en de straal:', goed, op, 'Lees af uit ' + xd('x', a) + ' + ' + xd('y', b) + ' = ' + r2 + '. Het teken draait om, en r = √' + r2 + '.', { orde:op }) ] };
          } }
      ] }
  ]);
})();
