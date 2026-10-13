/* De leerroute wiskunde: verbanden en grafieken. Een tabel bij een formule met
   negatieve getallen, de formule van een lijn door twee punten, het snijpunt van
   twee lijnen berekenen, en exponentiële groei: groeifactor en procent, de formule
   N = b · g^t en de groeifactor uit een tabel. Elke manier een eigen doel.
   Startgetal en hellingsgetal aflezen staat in de leerroute rekenen (rekenen-algebra.js).
   Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, Sch = R0.schoon;
  var MIN = '−', X = '×';
  var KL = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];

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
  function formS(a, b){ return 'y = ' + E([[a, 'x'], [b, '']]); }
  function eqAnt(x){ return [T(x), 'x = ' + T(x)]; }

  /* ---------- uitdrukkingen lezen ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
  function pLetters(p){ var l = []; for (var k in p) if (Math.abs(p[k]) > 1e-12) k.split('').forEach(function(c){ if (l.indexOf(c) < 0) l.push(c); }); return l; }
  function pHernoem(p, van, naar){ var r = {}; for (var k in p){ var n = k.split(van).join(naar).split('').sort().join(''); r[n] = (r[n] || 0) + p[k]; } return r; }
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
  /* een vergelijking: goed als links min rechts hetzelfde is (of precies andersom) */
  function eqC(eq){
    var d = eq.split('='), q = pPlus(lees(d[0]), pSchaal(lees(d[1]), -1));
    return function(v){
      var e = String(v).split('='); if (e.length !== 2) return false;
      var a = lees(e[0]), b = lees(e[1]); if (!a || !b) return false;
      var p = pPlus(a, pSchaal(b, -1));
      return pGelijk(p, q) || pGelijk(p, pSchaal(q, -1));
    };
  }
  /* een formule y = a·x + b; "y =" mag ook weg */
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
  function puntC(x, y){
    return function(v){
      var s = String(v).replace(/[\s()]/g, '').replace(/[−–—]/g, '-'), d = s.split(/[;,]/);
      if (d.length !== 2 || !/^-?\d+$/.test(d[0]) || !/^-?\d+$/.test(d[1])) return false;
      return +d[0] === x && +d[1] === y;
    };
  }
  function punt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  /* gehele getallen in deze volgorde, gescheiden door puntkomma's, komma's of spaties */
  function rijC(rij){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/^y\s*[:=]?/, '').replace(/[;,]/g, ' ').trim();
      if (!/^[-\d\s]+$/.test(s)) return false;
      var l = s.split(/\s+/); return l.length === rij.length && l.every(function(x, i){ return /^-?\d+$/.test(x) && +x === rij[i]; });
    };
  }
  /* N = b · g^t */
  function getal(t, duizend){ t = String(t); if (duizend && /^\d{1,3}(\.\d{3})+$/.test(t)) return +t.replace(/\./g, ''); if (!/^\d+([.,]\d+)?$/.test(t)) return NaN; return +t.replace(',', '.'); }
  function expC(b, g){
    return function(v){
      var s = String(v).toLowerCase().replace(/\s+/g, '').replace(/^[a-z]=/, '');
      var m = /^([\d.,]+)[×·*x]\(?([\d.,]+)\)?\^t$/.exec(s) || /^([\d.,]+)\(([\d.,]+)\)\^t$/.exec(s);
      return !!m && Math.abs(getal(m[1], true) - b) < 1e-9 && Math.abs(getal(m[2]) - g) < 1e-9;
    };
  }
  /* een procent met de richting erbij: "toename van 4%", "afname van 15 procent" */
  function richtC(toe, p){
    return function(v){
      var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/,/g, '.');
      var nums = s.match(/\d+(?:\.\d+)?/g); if (!nums || nums.length !== 1 || Math.abs(+nums[0] - p) > 1e-9) return false;
      var isToe = /toe|groei|stijg|meer|bij|\+/.test(s), isAf = /af|daal|dal|minder|krimp|verlies|-/.test(s);
      return toe ? isToe && !isAf : isAf && !isToe;
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
  function cirkel(x, y, r, k, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + k + (o.s ? ';stroke:' + o.s + ';stroke-width:' + (o.w || 2) : '') + '"/>'; }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).filter(Boolean).map(function(x){ return /^<svg/.test(x) ? '<div style="width:100%;max-width:520px">' + x + '</div>' : x; }).join('') + '</div>'; }
  /* een assenstelsel met negatieve getallen: lijnen { a, b } of { f } (een kromme), punten en een trapje */
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
      if (l.f){ var d = ''; for (var t = x0; t <= x1 + 1e-9; t += 0.1){ var v = l.f(t); if (v < y0 - 0.5 || v > y1 + 0.5){ d += ' '; continue; } d += (/[\d]$/.test(d) ? ' L' : ' M') + n1(X(t)) + ' ' + n1(Y(v)); }
        s += '<path d="' + d.replace(/\s+M/g, ' M').trim() + '" style="fill:none;stroke:' + KL[l.k || 0] + ';stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>'; return; }
      var xa = x0, xb = x1;
      if (l.a !== 0){ var p1 = (y0 - l.b) / l.a, p2 = (y1 - l.b) / l.a; xa = Math.max(x0, Math.min(p1, p2)); xb = Math.min(x1, Math.max(p1, p2)); }
      if (xb <= xa) return;
      s += ln(X(xa), Y(l.a * xa + l.b), X(xb), Y(l.a * xb + l.b), { k:KL[l.k || 0], w:3.5 });
      if (l.naam){ var eind = o.vermijd == null || Math.abs(xb - o.vermijd) >= Math.abs(xa - o.vermijd), xn = eind ? xb - 0.4 : xa + 0.4, yn = l.a * xn + l.b; s += tx(X(xn) + (eind ? -4 : 4), Y(yn) - 10, l.naam, { k:KL[l.k || 0], vet:true, a:eind ? 'end' : 'start' }); }
    });
    (o.trap || []).forEach(function(t){
      s += ln(X(t.x1), Y(t.y1), X(t.x2), Y(t.y1), { k:KL[1], w:2.5, dash:'6 4' }) + ln(X(t.x2), Y(t.y1), X(t.x2), Y(t.y2), { k:KL[1], w:2.5, dash:'6 4' });
      if (t.dx) s += tx((X(t.x1) + X(t.x2)) / 2, Y(t.y1) + (t.y2 >= t.y1 ? 18 : -8), t.dx, { k:KL[1], vet:true, m:'klein' });
      if (t.dy) s += tx(X(t.x2) + 8, (Y(t.y1) + Y(t.y2)) / 2 + 5, t.dy, { k:KL[1], vet:true, m:'klein', a:'start' });
    });
    (o.punten || []).forEach(function(p){ s += cirkel(X(p.x), Y(p.y), 6, KL[p.k == null ? 1 : p.k], { s:'var(--kaart)', w:2 }); if (p.label) s += tx(X(p.x) + (p.links ? -10 : 10), Y(p.y) - 10, p.label, { m:'klein', vet:true, a:p.links ? 'end' : 'start' }); });
    return svg(W, H, s, o.aria || 'assenstelsel', Math.min(560, W * 1.15));
  }
  function bereik(lo, hi, min){ return [Math.min(-min, Math.floor(lo) - 1), Math.max(min, Math.ceil(hi) + 1)]; }

  /* ================= exponentiële groei: de verhalen ================= */
  var GROEI = [
    { t:function(p){ return 'Op een spaarrekening krijg je ' + T(p) + '% rente per jaar.'; }, toe:true, per:'jaar', ps:[1.5, 2, 2.5, 3, 4, 5] },
    { t:function(p){ return 'Het aantal inwoners van een stad groeit met ' + T(p) + '% per jaar.'; }, toe:true, per:'jaar', ps:[1, 2, 3, 4, 6] },
    { t:function(p){ return 'Het aantal volgers van een account groeit elke maand met ' + T(p) + '%.'; }, toe:true, per:'maand', ps:[5, 8, 10, 12, 15, 20, 25] },
    { t:function(p){ return 'Een plant in een vijver groeit elke week met ' + T(p) + '%.'; }, toe:true, per:'week', ps:[10, 20, 25, 30, 40, 50] },
    { t:function(p){ return 'Een auto wordt elk jaar ' + T(p) + '% minder waard.'; }, toe:false, per:'jaar', ps:[10, 12, 15, 18, 20, 25] },
    { t:function(p){ return 'De hoeveelheid medicijn in je bloed neemt elk uur met ' + T(p) + '% af.'; }, toe:false, per:'uur', ps:[10, 15, 20, 25, 30, 40] },
    { t:function(p){ return 'Het aantal bijen in een gebied neemt elk jaar met ' + T(p) + '% af.'; }, toe:false, per:'jaar', ps:[2, 3, 4, 5, 8, 10] },
    { t:function(p){ return 'Een telefoon verliest elk jaar ' + T(p) + '% van zijn waarde.'; }, toe:false, per:'jaar', ps:[20, 25, 30, 35, 40] } ];
  function gfac(toe, p){ return Math.round((toe ? 1 + p / 100 : 1 - p / 100) * 1e6) / 1e6; }
  function mFactor(R, it, p){
    var g = gfac(it.toe, p), q = Math.round(p / 100 * 1e6) / 1e6;
    return [
      K(R, 'Neemt de hoeveelheid toe of af?', it.toe ? 'toe' : 'af', [], it.toe ? 'Er komt elk ' + it.per + ' iets bij.' : 'Er gaat elk ' + it.per + ' iets af.', { orde:['toe', 'af'] }),
      S(T(p) + '% als kommagetal: ' + T(p) + ' : 100 =', q, 'Delen door 100: de komma twee plaatsen naar links.', F(q, p / 10, 'Bij delen door 100 gaat de komma twee plaatsen naar links.')),
      S('De groeifactor: ' + (it.toe ? '1 + ' + T(q) : '1 ' + MIN + ' ' + T(q)) + ' =', g, it.toe ? 'Je houdt alles (1) en er komt ' + T(q) + ' bij.' : 'Je houdt 1 ' + MIN + ' ' + T(q) + ' over.',
        F(g, it.toe ? 1 - q : 1 + q, it.toe ? 'Het neemt toe: de groeifactor is groter dan 1.' : 'Het neemt af: de groeifactor is kleiner dan 1.', q, 'Dat is alleen het stukje dat erbij of eraf gaat. Tel het bij 1 op of haal het van 1 af.', 1 + p, 'Maak eerst een kommagetal van ' + T(p) + '%.')) ];
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= lineaire formules (onderbouw) ================= */
    { groep:{ id:'wi-lin', niveau:'onderbouw', domein:'verbanden', naam:'Formules, lijnen en snijpunten',
        uit:'Een tabel bij een formule met negatieve getallen, de formule van een lijn door twee punten, en het snijpunt van twee lijnen uitrekenen. Startgetal en hellingsgetal aflezen staan in de leerroute rekenen.' },
      doelen:[
        { id:'wi-lin-tabel', naam:'Een tabel bij een formule', kort:'Vul elke x in op de plek van x, met negatieve getallen tussen haakjes',
          uit:'<p>Bij een formule maak je een <b>tabel</b>: je vult elke x in en rekent y uit.</p><p>Zet een <b>negatief</b> getal tussen haakjes. Bij y = x² − 3 en x = −2: (−2)² − 3 = 4 − 3 = <b>1</b>. Let op: (−2)² is plus 4, want min keer min is plus.</p><p>Bij x = 0 is het makkelijk: alles met x valt weg. Met de tabel kun je daarna de grafiek tekenen.</p>',
          wanneer:'je een grafiek wilt tekenen, of wilt zien hoe y verandert.',
          maak:function(R){
            var soort = R.kies(['lin', 'lin', 'kw', 'kwb', 'kwm']), a, b, f, sub, naam;
            if (soort === 'lin'){ a = nz(R, -4, 4); b = nz(R, -6, 6); f = function(x){ return a * x + b; }; naam = formS(a, b);
              sub = function(x){ return (a === 1 ? '' : a === -1 ? MIN : T(a) + ' ' + X + ' ') + paren(x) + (b < 0 ? ' ' + MIN + ' ' + (-b) : ' + ' + b); }; }
            else if (soort === 'kw'){ b = nz(R, -6, 6); f = function(x){ return x * x + b; }; naam = 'y = x² ' + (b < 0 ? MIN + ' ' + (-b) : '+ ' + b); sub = function(x){ return paren(x) + '² ' + (b < 0 ? MIN + ' ' + (-b) : '+ ' + b); }; }
            else if (soort === 'kwb'){ a = nz(R, -4, 4); f = function(x){ return x * x + a * x; }; naam = 'y = ' + E([[1, 'x²'], [a, 'x']]); sub = function(x){ return paren(x) + '² ' + (a < 0 ? MIN + ' ' : '+ ') + (Math.abs(a) === 1 ? '' : Math.abs(a) + ' ' + X + ' ') + paren(x); }; }
            else { b = R.heel(1, 9); f = function(x){ return -x * x + b; }; naam = 'y = ' + MIN + 'x² + ' + b; sub = function(x){ return MIN + paren(x) + '² + ' + b; }; }
            var xs = [-2, -1, 0, 1, 2], ys = xs.map(f), volg = [0, 1, 3, 4];
            function tab(n){
              var rij = xs.map(function(x, i){ return i === 2 || volg.indexOf(i) < n ? T(ys[i]) : ''; });
              return R0.teken.tabel([['x'].concat(xs.map(T)), ['y'].concat(rij)], { zijkop:true, nadruk:n >= 1 && n <= 4 ? [[1, volg[n - 1] + 1]] : [] });
            }
            function pl(n){
              if (n < 4) return tab(n);
              var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), yb = bereik(lo, hi, 2);
              return stapel(tab(n), assen({ xmin:-4, xmax:4, ymin:yb[0], ymax:yb[1], lijnen:[{ f:f, k:0 }], punten:xs.map(function(x, i){ return { x:x, y:ys[i], k:1 }; }) }));
            }
            var st = volg.map(function(i){
              var x = xs[i], y = ys[i], hint = soort === 'kwm' ? 'Eerst ' + paren(x) + '² = ' + (x * x) + ', dan de min ervoor: ' + MIN + (x * x) + '. Dan + ' + b + '.' : soort === 'lin' ? (x < 0 && a < 0 ? 'Min keer min is plus. ' : x < 0 || a < 0 ? 'Keer een min-getal geeft een min-getal. ' : '') + 'Eerst ' + T(a) + ' ' + X + ' ' + paren(x) + ' = ' + T(a * x) + '.' : 'Eerst ' + paren(x) + '² = ' + (x * x) + '.' + (x < 0 ? ' Min keer min is plus.' : '') + (soort === 'kwb' ? ' Dan ' + T(a) + ' ' + X + ' ' + paren(x) + ' = ' + T(a * x) + '.' : '');
              var fo = soort === 'lin' ? F(y, -a * x + b, 'Let op het teken van ' + T(a) + ' ' + X + ' ' + paren(x) + '.') : soort === 'kwm' ? F(y, x * x + b, 'De min staat voor x²: eerst het kwadraat, dan de min.') : F(y, -x * x + (soort === 'kw' ? b : a * x), 'Een kwadraat is nooit negatief: ' + paren(x) + '² = ' + (x * x) + '.');
              return S('x = ' + T(x) + ': y = ' + sub(x) + ' =', y, hint, fo);
            });
            var rij = ys.map(T).join('; ');
            return { vraag:naam, context:'Maak de tabel af voor x = ' + MIN + '2 tot en met 2. Typ de hele rij y met puntkomma\'s ertussen, zoals 3; 1; ' + MIN + '1; ' + MIN + '3; ' + MIN + '5.', antwoord:rij, controle:rijC(ys), invoer:'tekst',
              beeld:pl, zelfBeeld:tab(0), stappen:st };
          } },
        { id:'wi-lin-twee', naam:'De formule van een lijn door twee punten', kort:'Hellingsgetal = verschil in y gedeeld door verschil in x; vul daarna een punt in voor het startgetal',
          uit:'<p>Een rechte lijn gaat door (1, 5) en (3, 9). De formule is y = ax + b. Zoek eerst a, het <b>hellingsgetal</b>.</p><p><b>a = verschil in y : verschil in x</b>. Van x = 1 naar x = 3 is 2 naar rechts. Van y = 5 naar y = 9 is 4 omhoog. Dus a = 4 : 2 = <b>2</b>.</p><p>Dan b, het <b>startgetal</b>: vul een punt in. 5 = 2 × 1 + b, dus b = 5 − 2 = <b>3</b>. De formule is y = 2x + 3. Gaat de lijn omlaag, dan is a negatief.</p>',
          wanneer:'je twee punten van een rechte lijn weet en de formule zoekt.',
          maak:function(R){
            var a, b, x1, x2, y1, y2;
            for (var p = 0; p < 200; p++){
              a = R.kies([-3, -2, -1, -0.5, 0.5, 1, 2, 3, 1.5, -1.5]); b = R.heel(-5, 5); x1 = R.heel(-5, 3); x2 = x1 + R.kies([1, 2, 2, 3, 4]);
              if (Math.round(a * 2) % 2) { if ((x2 - x1) % 2) x2++; }
              y1 = a * x1 + b; y2 = a * x2 + b;
              if (x2 <= 6 && Math.abs(y1) <= 9 && Math.abs(y2) <= 9 && y1 === Math.round(y1) && y2 === Math.round(y2) && !(x1 === 0) && b !== y1) break;
            }
            var dx = x2 - x1, dy = y2 - y1, f = formS(a, b), yb = bereik(Math.min(y1, y2, b), Math.max(y1, y2, b), 2);
            function pl(n){ return assen({ xmin:-6, xmax:6, ymin:yb[0], ymax:yb[1], lijnen:n >= 5 ? [{ a:a, b:b, k:0 }] : [],
              punten:[{ x:x1, y:y1, k:1, label:punt(x1, y1), links:true }, { x:x2, y:y2, k:1, label:punt(x2, y2) }].concat(n >= 4 ? [{ x:0, y:b, k:3 }] : []),
              trap:n >= 2 ? [{ x1:x1, y1:y1, x2:x2, y2:y2, dx:'+' + dx, dy:(dy < 0 ? MIN + T(-dy) : '+' + T(dy)) }] : [] }); }
            return { vraag:'Door ' + punt(x1, y1) + ' en ' + punt(x2, y2), context:'Een rechte lijn gaat door deze twee punten. Wat is de formule? Schrijf hem zoals y = 2x + 3.', antwoord:f, controle:formC(a, b), invoer:'tekst',
              beeld:pl, zelfBeeld:pl(0), stappen:[
                S('Verschil in y: ' + T(y2) + ' ' + MIN + ' ' + paren(y1) + ' =', dy, 'Tweede y min eerste y.' + (y1 < 0 ? ' Min een min-getal is plus.' : ''), F(dy, y2 + y1, 'Min een min-getal is plus.', -dy, 'Doe de tweede min de eerste.')),
                S('Verschil in x: ' + T(x2) + ' ' + MIN + ' ' + paren(x1) + ' =', dx, 'Tweede x min eerste x.' + (x1 < 0 ? ' Min een min-getal is plus.' : ''), F(dx, x2 + x1, 'Min een min-getal is plus.')),
                S('Hellingsgetal a = ' + T(dy) + ' : ' + T(dx) + ' =', a, 'Deel het verschil in y door het verschil in x.' + (a < 0 ? ' De lijn daalt: a is negatief.' : ''), F(a, dx / dy, 'Andersom: verschil in y gedeeld door verschil in x.', -a, 'Let op het teken.')),
                S('Startgetal b: vul ' + punt(x1, y1) + ' in. ' + T(y1) + ' = ' + T(a) + ' ' + X + ' ' + paren(x1) + ' + b, dus b = ' + T(y1) + ' ' + MIN + ' ' + paren(a * x1) + ' =', b, T(a) + ' ' + X + ' ' + paren(x1) + ' = ' + T(a * x1) + '. Haal dat van ' + T(y1) + ' af.', F(b, y1 + a * x1, 'Je telde op. b = ' + T(y1) + ' ' + MIN + ' ' + paren(a * x1) + '.')),
                SC('De formule:', f, formC(a, b), 'y = ax + b met a = ' + T(a) + ' en b = ' + T(b) + ': ' + f + '.') ] };
          } },
        { id:'wi-lin-snij', naam:'Het snijpunt berekenen', kort:'Stel de formules gelijk, los de vergelijking op en vul x in om y te vinden',
          uit:'<p>Waar snijden y = 2x + 1 en y = −x + 7 elkaar? In het <b>snijpunt</b> zijn x én y van de twee lijnen gelijk.</p><p>Stel de formules <b>gelijk</b>: 2x + 1 = −x + 7. Los op met de balans: 3x + 1 = 7, 3x = 6, <b>x = 2</b>.</p><p>Vul x = 2 in een van de formules: y = 2 × 2 + 1 = <b>5</b>. Het snijpunt is <b>(2, 5)</b>: eerst x, dan y.</p>',
          wanneer:'je wilt weten waar twee lijnen elkaar snijden, of wanneer twee prijzen gelijk zijn.',
          maak:function(R){
            var a1, a2, b1, b2, x0, y0;
            do { a1 = nz(R, -4, 4); a2 = R.heel(-4, 4); x0 = R.heel(-5, 5); b1 = R.heel(-6, 6); y0 = a1 * x0 + b1; b2 = y0 - a2 * x0; } while (a1 === a2 || Math.abs(y0) > 9 || Math.abs(b2) > 12 || b1 === b2);
            var e = a1 - a2, fA = formS(a1, b1), fB = formS(a2, b2), vgl = E([[a1, 'x'], [b1, '']]) + ' = ' + E([[a2, 'x'], [b2, '']]), yb = bereik(Math.min(y0, b1, b2), Math.max(y0, b1, b2), 3);
            function pl(n){ return assen({ xmin:-6, xmax:6, ymin:Math.max(yb[0], -12), ymax:Math.min(yb[1], 12), vermijd:x0, lijnen:[{ a:a1, b:b1, k:0, naam:'A' }, { a:a2, b:b2, k:3, naam:'B' }], punten:n >= 3 ? [{ x:x0, y:y0, k:1, label:punt(x0, y0) }] : [] }); }
            return { vraag:'A: ' + fA + ' en B: ' + fB, vraagHtml:'A: ' + Sch(fA) + '<br>B: ' + Sch(fB), context:'Bereken het snijpunt van de lijnen A en B. Schrijf het als (x, y).', antwoord:punt(x0, y0), controle:puntC(x0, y0), invoer:'tekst',
              beeld:pl, zelfBeeld:pl(0), stappen:[
                SC('Stel de formules gelijk aan elkaar:', vgl, eqC(vgl), 'In het snijpunt is y van A gelijk aan y van B: ' + vgl + '.'),
                S('Los op met de balans. ' + (a2 ? (a2 > 0 ? 'Trek aan beide kanten ' + E([[a2, 'x']]) + ' af' : 'Tel aan beide kanten ' + E([[-a2, 'x']]) + ' op') + ': ' + E([[e, 'x'], [b1, '']]) + ' = ' + T(b2) + '. ' : '') + 'Dan x =', eqAnt(x0),
                  E([[e, 'x']]) + ' = ' + T(b2) + ' ' + (b1 < 0 ? '+ ' + (-b1) : MIN + ' ' + b1) + ' = ' + T(b2 - b1) + ', dus x = ' + T(b2 - b1) + ' : ' + paren(e) + ' = ' + T(x0) + '.', F(x0, -x0, 'Let op het teken.')),
                S('Vul x = ' + T(x0) + ' in bij A: y = ' + (a1 === 1 ? '' : a1 === -1 ? MIN : T(a1) + ' ' + X + ' ') + paren(x0) + (b1 ? (b1 < 0 ? ' ' + MIN + ' ' + (-b1) : ' + ' + b1) : '') + ' =', y0, 'Reken uit: ' + T(a1) + ' ' + X + ' ' + paren(x0) + ' = ' + T(a1 * x0) + '.' + (b1 ? ' Dan ' + (b1 < 0 ? MIN + ' ' + (-b1) : '+ ' + b1) + '.' : '')),
                SC('Het snijpunt (x, y):', punt(x0, y0), puntC(x0, y0), 'Eerst x, dan y: ' + punt(x0, y0) + '.', F(punt(x0, y0), punt(y0, x0), 'Je draaide ze om. Eerst x, dan y.')) ] };
          } }
      ] },

    /* ================= exponentiële groei (vmbo) ================= */
    { groep:{ id:'wi-exp', niveau:'vmbo', domein:'verbanden', naam:'Exponentiële groei',
        uit:'Bij exponentiële groei vermenigvuldig je een hoeveelheid steeds met hetzelfde getal: de groeifactor. Je rekent tussen groeifactor en procent, en maakt de formule N = b · g^t.' },
      doelen:[
        { id:'wi-exp-factor', naam:'Van procent naar groeifactor', kort:'Toename: 1 + p : 100. Afname: 1 − p : 100. 3% erbij geeft 1,03, 20% eraf geeft 0,8',
          uit:'<p>Groeit iets elk jaar met <b>3%</b>, dan heb je na een jaar 100% + 3% = 103%. Dat is <b>1,03</b> keer zoveel. 1,03 is de <b>groeifactor</b>.</p><p>Neemt iets elk jaar met <b>20%</b> af, dan houd je 100% − 20% = 80% over. De groeifactor is <b>0,8</b>.</p><p>Zo reken je: maak van het procent een kommagetal (3% = 0,03) en tel het bij 1 op, of haal het van 1 af.</p>',
          wanneer:'een hoeveelheid elke dag, maand of jaar met hetzelfde procent groeit of krimpt.',
          maak:function(R){
            var it = R.kies(GROEI), p = R.kies(it.ps);
            return { vraag:'Groeifactor per ' + it.per + '?', context:it.t(p) + ' Wat is de groeifactor per ' + it.per + '?', stappen:mFactor(R, it, p) };
          } },
        { id:'wi-exp-procent', naam:'Van groeifactor naar procent', kort:'Groter dan 1: toename van (g − 1) × 100%. Kleiner dan 1: afname van (1 − g) × 100%',
          uit:'<p>Bij een groeifactor van <b>1,04</b> wordt het steeds 1,04 keer zoveel. Dat is 104%: een <b>toename van 4%</b>.</p><p>Bij <b>0,85</b> houd je 85% over. Dat is een <b>afname van 15%</b>, want 100% − 85% = 15%.</p><p>Zo reken je: kijk of g groter of kleiner is dan 1. Neem het verschil met 1 en doe dat keer 100.</p>',
          wanneer:'je een groeifactor of formule hebt en wilt weten hoeveel procent het per keer verandert.',
          maak:function(R){
            var toe = R.heel(0, 1) === 1, p = toe ? R.kies([1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 40, 50]) : R.kies([2, 3, 5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 60]), g = gfac(toe, p), q = Math.round(Math.abs(g - 1) * 1e6) / 1e6;
            var b = R.kies([100, 200, 250, 500, 800, 1200, 2000]), per = R.kies(['jaar', 'maand', 'week', 'uur']), wat = toe ? R.kies(['groeit', 'neemt toe']) : R.kies(['krimpt', 'neemt af']);
            var ant = (toe ? 'toename' : 'afname') + ' van ' + T(p) + '%';
            return { vraag:'N = ' + b + ' · ' + T(g) + '^t', context:'Een hoeveelheid ' + wat + ' volgens deze formule, met t in ' + (per === 'jaar' ? 'jaren' : per === 'maand' ? 'maanden' : per === 'week' ? 'weken' : 'uren') + '. Met hoeveel procent per ' + per + '? Schrijf je antwoord zoals toename van 4% of afname van 15%.', antwoord:ant, controle:richtC(toe, p), invoer:'tekst', stappen:[
              S('Wat is de groeifactor g in de formule?', g, 'Het getal dat tot de macht t gaat: ' + T(g) + '.', F(g, b, 'Dat is de beginwaarde. De groeifactor staat onder de macht t.')),
              K(R, 'Is ' + T(g) + ' groter of kleiner dan 1?', toe ? 'groter dan 1: het neemt toe' : 'kleiner dan 1: het neemt af', [], 'Vergelijk ' + T(g) + ' met 1.', { orde:['groter dan 1: het neemt toe', 'kleiner dan 1: het neemt af'] }),
              S('Het verschil met 1: ' + (toe ? T(g) + ' ' + MIN + ' 1' : '1 ' + MIN + ' ' + T(g)) + ' =', q, toe ? 'Wat komt er boven de 1 bij?' : 'Hoeveel ontbreekt er aan 1?', F(q, g, 'Neem het verschil met 1.')),
              S('Als procent: ' + T(q) + ' ' + X + ' 100 =', p, 'Keer 100: de komma twee plaatsen naar rechts.', F(p, q * 10, 'Keer 100 is de komma twee plaatsen naar rechts.', toe ? 100 + p : 100 - p, 'Dat is wat je overhoudt of krijgt. Je zoekt hoeveel er verandert.')),
              SC('Dus per ' + per + ':', ant, richtC(toe, p), 'Schrijf erbij of het een toename of een afname is: ' + ant + '.', F(ant, (toe ? 'afname' : 'toename') + ' van ' + T(p) + '%', 'Kijk nog eens: g is ' + (toe ? 'groter' : 'kleiner') + ' dan 1.')) ] };
          } },
        { id:'wi-exp-formule', naam:'De formule N = b · g^t', kort:'b is de beginwaarde, g de groeifactor en t de tijd; reken uit met de rekenmachine',
          uit:'<p>Je zet € 500 op een spaarrekening met 4% rente per jaar. Elk jaar wordt het bedrag 1,04 keer zo groot.</p><p>De formule is <b>N = b · g^t</b>: b is de <b>beginwaarde</b> (500), g de <b>groeifactor</b> (1,04) en t het aantal jaren. Dus N = 500 · 1,04^t.</p><p>Na 5 jaar: 500 × 1,04^5 ≈ 608,33. Tik de macht in met de knop ^ of x^y. Rond af zoals het verhaal vraagt.</p>',
          wanneer:'je wilt weten hoeveel er na een aantal jaren, maanden of uren is.',
          maak:function(R){
            var it = R.kies([
              { t:function(b, p){ return 'Je zet € ' + b + ' op een spaarrekening met ' + T(p) + '% rente per jaar.'; }, toe:true, per:'jaar', mv:'jaar', bs:[200, 500, 750, 1000, 1500, 2000], ps:[1.5, 2, 2.5, 3, 4, 5], ts:[3, 4, 5, 6, 8, 10], dec:2, eh:'euro', vr:function(t){ return 'Hoeveel staat er na ' + t + ' jaar op de rekening?'; } },
              { t:function(b, p){ return 'Een dorp heeft ' + T(b) + ' inwoners. Het aantal groeit met ' + T(p) + '% per jaar.'; }, toe:true, per:'jaar', mv:'jaar', bs:[2400, 3500, 5000, 8000, 12000], ps:[1, 2, 3, 4], ts:[5, 8, 10, 15], dec:0, eh:'inwoners', vr:function(t){ return 'Hoeveel inwoners zijn er na ' + t + ' jaar?'; } },
              { t:function(b, p){ return 'Een account heeft ' + T(b) + ' volgers. Het aantal groeit elke maand met ' + T(p) + '%.'; }, toe:true, per:'maand', mv:'maanden', bs:[150, 300, 500, 1200], ps:[5, 8, 10, 12, 20], ts:[3, 4, 6, 12], dec:0, eh:'volgers', vr:function(t){ return 'Hoeveel volgers zijn er na ' + t + ' maanden?'; } },
              { t:function(b, p){ return 'Een auto kost nieuw € ' + T(b) + '. Hij wordt elk jaar ' + T(p) + '% minder waard.'; }, toe:false, per:'jaar', mv:'jaar', bs:[18000, 24000, 30000, 36000], ps:[10, 12, 15, 20], ts:[3, 4, 5, 6], dec:2, eh:'euro', vr:function(t){ return 'Wat is de auto na ' + t + ' jaar nog waard?'; } },
              { t:function(b, p){ return 'Na een injectie zit er ' + b + ' mg medicijn in je bloed. Elk uur neemt dat met ' + T(p) + '% af.'; }, toe:false, per:'uur', mv:'uur', bs:[200, 300, 400, 500, 800], ps:[10, 15, 20, 25], ts:[2, 3, 4, 5, 6], dec:1, eh:'mg', vr:function(t){ return 'Hoeveel mg zit er na ' + t + ' uur nog in je bloed?'; } } ]);
            var b = R.kies(it.bs), p = R.kies(it.ps), t = R.kies(it.ts), g = gfac(it.toe, p), N = b * Math.pow(g, t), Nr = rnd(N, it.dec), form = 'N = ' + T(b) + ' · ' + T(g) + '^t';
            var rk = it.dec === 2 ? 'op 2 decimalen' : it.dec === 1 ? 'op 1 decimaal' : 'op een heel getal', rond = 'Rond af ' + rk + (it.dec === 2 ? ', op hele centen.' : '.');
            var ant = uniek([T(Nr, { dec:it.dec, vast:true }), T(Nr)]);
            return { vraag:it.vr(t), context:it.t(b, p) + ' Maak de formule en reken uit. ' + rond, antwoord:ant, eenheid:it.eh === 'euro' ? '' : it.eh, stappen:[
              S('De beginwaarde b =', b, 'Waar begin je mee, bij t = 0?', F(b, p, 'Dat is het procent. De beginwaarde is de hoeveelheid aan het begin.')),
              S('De groeifactor g per ' + it.per + ' (' + (it.toe ? 'toename' : 'afname') + ' van ' + T(p) + '%) =', g, it.toe ? '1 + ' + T(p / 100) + '.' : '1 ' + MIN + ' ' + T(p / 100) + '.', F(g, gfac(!it.toe, p), it.toe ? 'Het neemt toe: g is groter dan 1.' : 'Het neemt af: g is kleiner dan 1.', p / 100, 'Tel het bij 1 op of haal het van 1 af.')),
              SC('De formule: N =', form, expC(b, g), 'N = b · g^t met b = ' + T(b) + ' en g = ' + T(g) + '. Typ bijvoorbeeld ' + T(b) + ' · ' + T(g) + '^t.'),
              S('Vul t = ' + t + ' in: ' + T(b) + ' ' + X + ' ' + T(g) + '^' + t + ' ≈ (rond af ' + rk + ')', ant, 'Tik in: ' + T(b) + ' ' + X + ' ' + T(g) + ' ^ ' + t + ' = ' + T(N, { dec:4 }) + '… Eerst de macht, dan keer ' + T(b) + '.',
                F(ant[0], T(rnd(b * g * t, it.dec), { dec:it.dec, vast:true }), 'Je deed keer ' + t + '. De groeifactor gaat tot de macht ' + t + '.', T(rnd(Math.pow(b * g, t), it.dec), { dec:it.dec, vast:true }), 'Alleen de groeifactor gaat tot de macht, niet ' + T(b) + ' ' + X + ' ' + T(g) + '.')) ] };
          } },
        { id:'wi-exp-tabel', naam:'De groeifactor uit een tabel', kort:'Deel een waarde door de waarde ervoor; komt er steeds hetzelfde uit, dan is dat de groeifactor',
          uit:'<p>In een tabel zie je exponentiële groei als je steeds <b>deelt</b>: een waarde gedeeld door de waarde ervoor.</p><p>16, 24, 36, 54: 24 : 16 = 1,5 en 36 : 24 = 1,5 en 54 : 36 = 1,5. Steeds <b>1,5</b>: dat is de <b>groeifactor</b>.</p><p>De <b>beginwaarde</b> b staat bij t = 0. De formule wordt N = 16 · 1,5^t.</p>',
          wanneer:'je bij een tabel de formule van exponentiële groei zoekt.',
          maak:function(R){
            var c = R.kies([[16, 1.5], [32, 1.5], [64, 1.5], [160, 0.5], [320, 0.5], [625, 1.2], [625, 0.8], [3, 2], [5, 2], [7, 2], [2, 3], [4, 3], [256, 1.25], [1000, 1.1], [1000, 0.9], [512, 0.75], [2000, 0.5]]);
            var b = c[0] * R.kies(c[0] < 10 ? [1, 2, 3, 10] : [1, 1, 2]), g = c[1], ts = [0, 1, 2, 3, 4], ns = ts.map(function(t){ return rnd(b * Math.pow(g, t), 4); }), wat = R.kies(['N', 'N', 'A', 'B']);
            function tab(n){ return R0.teken.tabel([['t'].concat(ts.map(String)), [wat].concat(ns.map(function(x){ return T(x); }))], { zijkop:true, pijlen:n >= 1 ? ts.slice(1).map(function(t, i){ return { van:i + 1, naar:i + 2, tekst:(i < n || n >= 3 ? X + ' ' + T(g) : ''), onder:true }; }).filter(function(p){ return p.tekst; }) : [], nadruk:n >= 3 ? [[1, 1]] : [] }); }
            var form = wat + ' = ' + T(b) + ' · ' + T(g) + '^t';
            return { vraag:'tabel ' + ns.map(T).join(' '), vraagHtml:'Welke formule hoort bij de tabel?', context:'De groei is exponentieel. Zoek de groeifactor en de beginwaarde. Schrijf de formule zoals N = 16 · 1,5^t.', antwoord:form, controle:expC(b, g), invoer:'tekst', beeld:tab, zelfBeeld:tab(0), stappen:[
              S(T(ns[1]) + ' : ' + T(ns[0]) + ' =', g, 'Deel de tweede waarde door de eerste.', F(g, ns[1] - ns[0], 'Je trok af. Bij exponentiële groei deel je.', ns[0] / ns[1], 'Andersom: de latere waarde gedeeld door de eerdere.')),
              S('Controleer: ' + T(ns[2]) + ' : ' + T(ns[1]) + ' =', g, 'Komt er weer ' + T(g) + ' uit? Dan is de groeifactor steeds hetzelfde.'),
              S('De beginwaarde b staat bij t = 0:', b, 'Kijk in de tabel onder t = 0.'),
              SC('De formule: ' + wat + ' =', form, expC(b, g), wat + ' = b · g^t: ' + form + '.') ] };
          } }
      ] }
  ]);
})();
