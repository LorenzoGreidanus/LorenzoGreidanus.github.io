/* De leerroute wiskunde, onderbouw: getallen en algebra (klas 1 tot 3, ook vmbo-bb).
   Negatieve getallen (plus en min op de getallenlijn, plus of min een negatief getal,
   de regel voor grote getallen, keer en delen), machten en wortels, de volgorde van
   bewerkingen, rekenen met letters, eenvoudige vergelijkingen en de wetenschappelijke
   notatie. Machten van negatieve getallen, termen vermenigvuldigen, twee haakjes en de
   balansmethode staan in wiskunde-algebra.js. Zie leerroute.js voor het formaat. */
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
  /* + 5 of − 5 achter iets anders */
  function pm(n){ return n < 0 ? ' ' + MIN + ' ' + T(-n) : ' + ' + T(n); }
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
  function eqAnt(x){ return [T(x), 'x = ' + T(x)]; }
  var SUPC = { '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹' };
  var SUPN = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9' };
  function sup(n){ return (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map(function(c){ return SUPC[c]; }).join(''); }
  function keten(g, e){ var l = []; for (var i = 0; i < e; i++) l.push(g); return l.join(' ' + X + ' '); }
  function macht(g, e){ var r = 1; for (var i = 0; i < e; i++) r *= g; return r; }
  function nullen(k){ var s = ''; for (var i = 0; i < k; i++) s += '0'; return s; }

  /* ---------- uitdrukkingen lezen (zoals in wiskunde-algebra.js): een veelterm als { '':4, x:3, xx:1 } ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
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
    function mac(){
      var p = atoom(); if (!p) return null;
      if (kijk() === '^'){ i++; var e = tk[i++]; if (!/^\d$/.test(e || '')) return null; var r = { '':1 }; for (var k = 0; k < +e; k++) r = pMaal(r, p); p = r; }
      return p;
    }
    function unair(){
      if (kijk() === '-'){ i++; var p = unair(); return p && pSchaal(p, -1); }
      if (kijk() === '+'){ i++; return unair(); }
      return mac();
    }
    function term(){
      var p = unair(); if (!p) return null;
      for (;;){
        var t = kijk();
        if (t === '*' || t === '/'){ i++; var q = unair(); if (!q) return null;
          if (t === '*') p = pMaal(p, q); else { var c = pConst(q); if (c == null || Math.abs(c) < 1e-12) return null; p = pSchaal(p, 1 / c); } }
        else if (t && (/^[a-z]$/.test(t) || t === '(')){ var q2 = mac(); if (!q2) return null; p = pMaal(p, q2); }
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
  /* precies deze schrijfwijze (alleen spaties en de soort min tellen niet) */
  function nrm(t){ return String(t == null ? '' : t).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, ''); }
  function exactC(goed){ var g = nrm(goed); return function(v){ return nrm(v) === g; }; }
  /* gehele getallen uit een antwoord: "6 en 7", "6; 7" */
  function getallen(v){
    var s = String(v).toLowerCase().replace(/[−–—]/g, '-').replace(/\b(en|of|tussen)\b/g, ' ').replace(/[;,]/g, ' ').trim();
    if (!/^[-\d\s]+$/.test(s)) return null;
    var l = s.split(/\s+/).filter(Boolean); if (l.some(function(x){ return !/^-?\d+$/.test(x); })) return null;
    return l.map(Number);
  }
  function paarC(p, q){ return function(v){ var l = getallen(v); if (!l || l.length !== 2) return false; return (l[0] === p && l[1] === q) || (l[0] === q && l[1] === p); }; }
  /* wetenschappelijke notatie: 4,5 × 10^6, 4,5·10⁶, 4.5*10^(6), 4,5e6 */
  function sciLees(v){
    var s = String(v == null ? '' : v).toLowerCase().replace(/[−–—]/g, '-')
      .replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function(t){ return '^' + t.replace('⁻', '-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function(c){ return SUPN[c]; }); })
      .replace(/\s+/g, '').replace(/,/g, '.').replace(/[×·*x]/g, '*');
    var m = /^(\d+(?:\.\d+)?)\*10\^\(?(-?\d+)\)?$/.exec(s) || /^(\d+(?:\.\d+)?)e(-?\d+)$/.exec(s);
    return m ? { m:parseFloat(m[1]), e:+m[2] } : null;
  }
  function sciC(m, e){ return function(v){ var r = sciLees(v); return !!r && Math.abs(r.m - m) < 1e-9 && r.e === e; }; }
  /* een macht van 10: 10^5, 10⁵, 10^-3 */
  function tienC(e){ return function(v){ var r = sciLees('1 × ' + String(v).trim()); return !!r && r.m === 1 && r.e === e && /^\s*10/.test(String(v)); }; }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + Sch(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {}; var st = [];
    if (o.a) st.push('text-anchor:' + o.a); if (o.k) st.push('fill:' + o.k); if (o.vet) st.push('font-weight:700');
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" class="getal' + (o.m ? ' ' + o.m : '') + '"' + (st.length ? ' style="' + st.join(';') + '"' : '') + '>' + Sch(t) + '</text>';
  }
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + '"/>'; }
  /* een boog met pijlpunt van x1 naar x2, boven of onder y */
  function boog(x1, x2, y, omhoog, kleur, label, h){
    var mid = (x1 + x2) / 2, d = omhoog ? -1 : 1, r = x2 > x1 ? -1 : 1;
    return '<path d="M' + n1(x1) + ' ' + n1(y) + ' Q' + n1(mid) + ' ' + n1(y + d * h * 1.6) + ' ' + n1(x2) + ' ' + n1(y) + '" style="fill:none;stroke:' + kleur + ';stroke-width:2.6;stroke-linecap:round"/>' +
      '<path d="M' + n1(x2) + ' ' + n1(y) + ' l' + (r * 7) + ' ' + (d * 7) + ' M' + n1(x2) + ' ' + n1(y) + ' l' + (r * 1.5) + ' ' + (d * 10) + '" style="fill:none;stroke:' + kleur + ';stroke-width:2.6;stroke-linecap:round"/>' +
      (label ? tx(mid, y + d * h * 0.8 + (omhoog ? -7 : 17), label, { k:kleur, vet:true }) : '');
  }
  /* de pijlenketting heen en terug: vak = getallen in de vakjes, ops = bewerkingen heen, terug = omgekeerd; nT = aantal bogen terug */
  function ketting(vak, ops, terug, nT){
    var m = vak.length, bw = 84, gap = 74, x0 = 10, y = 64, bh = 42, s = '';
    function cx(i){ return x0 + i * (bw + gap) + bw / 2; }
    vak.forEach(function(t, i){ var x = x0 + i * (bw + gap), v = String(t) === '?'; s += rc(x, y, bw, bh, { rx:10, s:v ? 'var(--lr-2)' : 'var(--ink)', dash:v ? '5 4' : '' }) + tx(x + bw / 2, y + 28, String(t), { m:String(t).length > 5 ? '' : 'groot', k:v ? 'var(--lr-2)' : '' }); });
    ops.forEach(function(o, i){ s += boog(cx(i) + 16, cx(i + 1) - 16, y - 3, true, KL[0], o, 22); });
    terug.forEach(function(o, i){ if (i >= m - 1 - nT) s += boog(cx(i + 1) - 16, cx(i) + 16, y + bh + 3, false, KL[1], o, 22); });
    return svg(x0 * 2 + m * bw + (m - 1) * gap, 172, s, 'pijlenketting heen en terug', 150 * m);
  }
  /* de tekenregel voor keer en delen, met het vakje van deze som gekleurd */
  function tekenTabel(teken, negA, negB, aan){
    return R0.teken.tabel([[teken, '+ getal', MIN + ' getal'], ['+ getal', '+', MIN], [MIN + ' getal', MIN, '+']], { kop:true, zijkop:true, nadruk:aan ? [[negA ? 2 : 1, negB ? 2 : 1]] : [] });
  }
  /* de volgorde van bewerkingen, met de regel die nu aan de beurt is gekleurd */
  function ladder(niv){
    return R0.teken.tabel([['volgorde', 'wat reken je uit'], ['1', 'haakjes'], ['2', 'machten'], ['3', 'keer en delen, van links naar rechts'], ['4', 'plus en min, van links naar rechts']], { kop:true, nadruk:niv ? [[niv, 0], [niv, 1]] : [] });
  }
  /* de komma die verspringt: ds = cijfers zonder komma, p0 = waar de komma stond, p1 = waar hij komt */
  function kommaBeeld(ds, p0, p1, o){
    o = o || {};
    var w = 32, x0 = 24, y = 92, s = '', d = p1 > p0 ? 1 : -1;
    function kx(p){ return x0 + p * w; }
    ds.split('').forEach(function(c, i){ s += tx(x0 + i * w + w / 2, y, c, { m:'groot', k:o.grijs && i >= o.grijs ? 'var(--lr-3)' : '' }); });
    if (p0 < ds.length || o.doel) s += tx(kx(p0), y + 7, ',', { m:'groot', k:o.doel ? 'var(--muted)' : '' });
    if (o.doel) s += tx(kx(p1), y + 7, ',', { m:'groot', k:KL[1] });
    if (o.bogen) for (var p = p0; p !== p1; p += d) s += boog(kx(p), kx(p + d), y - 26, true, KL[0], '', 9);
    if (o.bogen) s += tx((kx(p0) + kx(p1)) / 2, 22, Math.abs(p1 - p0) + ' plaatsen naar ' + (d > 0 ? 'rechts' : 'links'), { k:KL[0], vet:true });
    return svg(x0 * 2 + ds.length * w, 116, s, 'de komma schuift ' + Math.abs(p1 - p0) + ' plaatsen op', Math.max(260, (x0 * 2 + ds.length * w) * 1.6));
  }

  /* ================= negatieve getallen: plus en min ================= */
  function mLijn(R){
    var a, b, plus, r;
    do { a = R.heel(-9, 9); b = R.heel(2, 9); plus = R.heel(0, 1) === 1; r = plus ? a + b : a - b; } while (!a || Math.abs(r) > 10 || (a > 0 && r >= 0));
    var vraag = T(a) + (plus ? ' + ' : ' ' + MIN + ' ') + b, kant = plus ? 'naar rechts' : 'naar links';
    var van = Math.min(a, r, 0) - 1, tot = Math.max(a, r, 0) + 1;
    return { vraag:vraag + ' =',
      beeld:function(n){ return R0.teken.lijn({ van:van, tot:tot, streep:1, stip:n >= 1 ? [a] : [], sprongen:n >= 3 ? [{ van:a, naar:r, tekst:(plus ? '+' : MIN) + b }] : [], nieuw:n === 3, aria:'getallenlijn van ' + T(van) + ' tot ' + T(tot) }); },
      stappen:[
        S('Bij welk getal begin je op de getallenlijn?', a, 'Je begint bij het eerste getal: ' + T(a) + '.', F(a, -a, 'Let op het minteken: je begint bij ' + T(a) + '.')),
        K(R, 'Er staat ' + (plus ? '+ ' : MIN + ' ') + b + '. Welke kant spring je op?', kant, [], plus ? 'Plus is erbij: je gaat naar rechts, naar de grotere getallen.' : 'Min is eraf: je gaat naar links, naar de kleinere getallen.', { orde:['naar rechts', 'naar links'] }),
        S('Spring ' + b + ' ' + kant + ' vanaf ' + T(a) + '. ' + vraag + ' =', r, 'Tel ' + b + ' streepjes ' + kant + ', vanaf ' + T(a) + '.' + (a * r < 0 ? ' Je gaat over 0 heen.' : ''),
          F(r, plus ? a - b : a + b, 'Je sprong de verkeerde kant op.', -r, 'Kijk of je links of rechts van 0 uitkomt.')) ] };
  }
  function mRegel(R){
    var soort = R.heel(0, 2), a, b, plus, s, r;
    do {
      b = R.heel(12, 190);
      if (soort === 0){ a = -R.heel(12, 190); plus = false; }
      else if (soort === 1){ a = -R.heel(12, 190); plus = true; }
      else { a = R.heel(12, 150); plus = false; }
      s = plus ? b : -b; r = a + s;
    } while (Math.abs(a) === b || (soort === 2 && b <= a) || Math.abs(r) > 300);
    var vraag = T(a) + (plus ? ' + ' : ' ' + MIN + ' ') + b, zelfde = soort === 0, A = Math.abs(a), gr = Math.max(A, b), kl = Math.min(A, b);
    var JA = 'ja, hetzelfde teken', NEE = 'nee, een plus en een min', POS = 'plus (positief)', NEG = 'min (negatief)';
    var winnaar = A > b ? T(a) : (plus ? '+ ' : MIN + ' ') + b;
    var van = Math.min(a, r, 0), tot = Math.max(a, r, 0), pad = Math.max(5, Math.round((tot - van) * 0.06));
    return { vraag:vraag + ' =',
      beeld:function(n){ return R0.teken.lijn({ van:van - pad, tot:tot + pad, stip:[a], sprongen:n >= 4 ? [{ van:a, naar:r, tekst:(plus ? '+' : MIN) + b }] : [], nieuw:n === 4, aria:'getallenlijn met ' + T(a) }); },
      stappen:[
        K(R, T(a) + ' is ' + (a < 0 ? 'negatief' : 'positief') + ' en er staat ' + (plus ? '+ ' : MIN + ' ') + b + '. Is het teken hetzelfde?', zelfde ? JA : NEE, [],
          zelfde ? 'Je begint onder 0 en gaat nog verder naar links: twee keer min.' : a < 0 ? 'Je begint onder 0 (min) en gaat naar rechts (plus).' : 'Je begint boven 0 (plus) en gaat naar links (min).', { orde:[JA, NEE] }),
        zelfde ? S('Hetzelfde teken: tel de afstanden tot 0 op. ' + A + ' + ' + b + ' =', A + b, 'De afstand van ' + T(a) + ' tot 0 is ' + A + '. Daar komt ' + b + ' bij.', F(A + b, Math.abs(A - b), 'Bij hetzelfde teken tel je de afstanden op.'))
          : S('Een plus en een min: trek de kleinste afstand af van de grootste. ' + gr + ' ' + MIN + ' ' + kl + ' =', gr - kl, 'De afstanden tot 0 zijn ' + A + ' en ' + b + '. Neem de grootste min de kleinste.', F(gr - kl, A + b, 'Bij een plus en een min trek je de afstanden af.')),
        K(R, 'Krijgt het antwoord een plus of een min?', r > 0 ? POS : NEG, [], zelfde ? 'Twee keer min: het antwoord blijft min.' : 'Het getal met de grootste afstand tot 0 wint. Dat is ' + winnaar + ', dus het antwoord is ' + (r > 0 ? 'positief.' : 'negatief.'), { orde:[POS, NEG] }),
        S(vraag + ' =', r, (r < 0 ? 'Het getal ' + T(-r) + ' met een min ervoor.' : 'Het getal ' + T(r) + ', zonder min.'), F(r, -r, 'Kijk nog eens naar het teken.', a - s, 'Je ging de verkeerde kant op.')) ] };
  }

  /* ================= volgorde van bewerkingen ================= */
  function opgaveVolg(vraag, rijen){
    /* rijen: [stap, niveau]; het beeld is de ladder met het niveau van de stap die nu aan de beurt is */
    var st = rijen.map(function(x){ return x[0]; }), niv = rijen.map(function(x){ return x[1]; });
    return { vraag:vraag + ' =', context:'Reken uit.', beeld:function(n){ return ladder(niv[Math.min(n, niv.length - 1)]); }, stappen:st };
  }

  /* ================= vergelijkingen: de pijlenketting ================= */
  function opS(o){ return o.s + ' ' + (o.n < 0 ? '(' + T(o.n) + ')' : T(o.n)); }
  function inv(o){ return { s:{ '+':MIN, '−':'+', '×':':', ':':X }[o.s], n:o.n }; }
  function doe(v, o){ return o.s === '+' ? v + o.n : o.s === MIN ? v - o.n : o.s === X ? v * o.n : v / o.n; }
  function plusOp(n){ return n < 0 ? { s:MIN, n:-n } : { s:'+', n:n }; }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('wiskunde', [
    /* ================= negatieve getallen: plus en min ================= */
    { groep:{ id:'wob-a-negpm', niveau:'onderbouw', domein:'algebra', naam:'Negatieve getallen: plus en min',
        uit:'Optellen en aftrekken met getallen onder nul: op de getallenlijn, plus of min een negatief getal, en de regel voor grote getallen.' },
      doelen:[
        { id:'wob-a-neg-lijn', naam:'Optellen en aftrekken op de getallenlijn', kort:'Begin bij het eerste getal. Plus is naar rechts, min is naar links',
          uit:'<p>Op de <b>getallenlijn</b> staan de negatieve getallen links van 0. Hoe verder naar links, hoe kleiner.</p><p>Bij −3 + 5 begin je bij −3. <b>Plus</b> is naar <b>rechts</b>: 5 stappen naar rechts en je komt uit bij <b>2</b>.</p><p>Bij 2 − 6 begin je bij 2. <b>Min</b> is naar <b>links</b>: 6 stappen naar links en je komt uit bij <b>−4</b>.</p>',
          wanneer:'de getallen klein zijn, tot ongeveer 10.',
          beeld:R0.teken.lijn({ van:-5, tot:4, streep:1, stip:[-3], sprongen:[{ van:-3, naar:2, tekst:'+5' }] }),
          maak:function(R){ var m = mLijn(R); return { vraag:m.vraag, context:'Reken uit. Denk aan de getallenlijn.', beeld:m.beeld, stappen:m.stappen }; } },
        { id:'wob-a-neg-plusneg', naam:'Plus een negatief getal', kort:'Plus een negatief getal is hetzelfde als min: 3 + (−5) = 3 − 5',
          uit:'<p>Bij <b>3 + (−5)</b> krijg je er een schuld van 5 bij. Dat is hetzelfde als 5 eraf.</p><p>Dus <b>+ (−5) wordt − 5</b>: 3 + (−5) = 3 − 5 = <b>−2</b>.</p><p>Schrijf eerst de som zonder haakjes. Reken dan uit op de getallenlijn: naar links.</p>',
          wanneer:'er + (−...) in een som staat.',
          maak:function(R){
            var a, b, r; do { a = nz(R, -9, 9); b = R.heel(2, 9); r = a - b; } while (r < -12);
            var vraag = T(a) + ' + (' + MIN + b + ')', van = Math.min(r, 0) - 1, tot = Math.max(a, 0) + 1;
            return { vraag:vraag + ' =', context:'Reken uit.',
              beeld:function(n){ return R0.teken.lijn({ van:van, tot:tot, streep:1, stip:[a], sprongen:n >= 2 ? [{ van:a, naar:r, tekst:MIN + b }] : [], nieuw:n === 2 }); },
              stappen:[
                K(R, 'Plus een negatief getal. Wat wordt + (' + MIN + b + ')?', MIN + ' ' + b, [], 'Een schuld van ' + b + ' erbij is hetzelfde als ' + b + ' eraf. Dus + (' + MIN + b + ') wordt ' + MIN + ' ' + b + '.', { orde:['+ ' + b, MIN + ' ' + b] }),
                S('Nu staat er ' + T(a) + ' ' + MIN + ' ' + b + '. Spring ' + b + ' naar links: ' + T(a) + ' ' + MIN + ' ' + b + ' =', r, 'Begin bij ' + T(a) + ' en ga ' + b + ' stappen naar links.',
                  F(r, a + b, 'Je deed plus ' + b + '. Maar plus een negatief getal is min.', -r, 'Let op het teken.')) ] };
          } },
        { id:'wob-a-neg-minneg', naam:'Min een negatief getal wordt plus', kort:'Twee mintekens naast elkaar worden plus: 2 − (−6) = 2 + 6',
          uit:'<p>Bij <b>2 − (−6)</b> haal je een schuld van 6 weg. Een schuld kwijt is net zo goed als 6 erbij krijgen.</p><p>Dus <b>− (−6) wordt + 6</b>: 2 − (−6) = 2 + 6 = <b>8</b>.</p><p>Ook als je met een negatief getal begint: −8 − (−3) = −8 + 3 = <b>−5</b>.</p>',
          wanneer:'er − (−...) in een som staat: twee mintekens naast elkaar.',
          maak:function(R){
            var a = nz(R, -12, 12), b = R.heel(2, 9), r = a + b, vraag = T(a) + ' ' + MIN + ' (' + MIN + b + ')', van = Math.min(a, 0) - 1, tot = Math.max(r, 0) + 1;
            return { vraag:vraag + ' =', context:'Reken uit.',
              beeld:function(n){ return R0.teken.lijn({ van:van, tot:tot, streep:1, stip:[a], sprongen:n >= 2 ? [{ van:a, naar:r, tekst:'+' + b }] : [], nieuw:n === 2 }); },
              stappen:[
                K(R, 'Min een negatief getal. Wat wordt ' + MIN + ' (' + MIN + b + ')?', '+ ' + b, [], 'Een schuld van ' + b + ' wegnemen is hetzelfde als ' + b + ' erbij. Twee mintekens naast elkaar worden plus.', { orde:['+ ' + b, MIN + ' ' + b] }),
                S('Nu staat er ' + T(a) + ' + ' + b + '. Spring ' + b + ' naar rechts: ' + T(a) + ' + ' + b + ' =', r, 'Begin bij ' + T(a) + ' en ga ' + b + ' stappen naar rechts.',
                  F(r, a - b, 'Je deed min ' + b + '. Maar min een negatief getal wordt plus.', -r, 'Let op het teken.')) ] };
          } },
        { id:'wob-a-neg-regel', naam:'Grote getallen: de regel', kort:'Zelfde teken: tel de afstanden op. Een plus en een min: trek af en neem het teken van de grootste afstand',
          uit:'<p>Met grote getallen teken je geen getallenlijn. Je kijkt naar de <b>afstand tot 0</b> en naar het <b>teken</b>.</p><p><b>Hetzelfde teken</b>: tel de afstanden op en houd het teken. −45 − 30: allebei min, 45 + 30 = 75, dus <b>−75</b>.</p><p><b>Een plus en een min</b>: trek de kleinste afstand af van de grootste. Het teken van de grootste afstand wint. −45 + 30: 45 − 30 = 15, de 45 had een min, dus <b>−15</b>. En 35 − 120: 120 − 35 = 85, de 120 had een min, dus <b>−85</b>.</p>',
          wanneer:'de getallen te groot zijn om op een getallenlijn te tellen.',
          maak:function(R){ var m = mRegel(R); return { vraag:m.vraag, context:'Reken uit met de regel.', beeld:m.beeld, stappen:m.stappen }; } },
        { id:'wob-a-neg-kies', naam:'Kies de handigste manier', kort:'Kleine getallen: de getallenlijn. Grote getallen: de regel met de afstanden',
          uit:'<p>Kijk eerst naar de getallen en <b>kies</b> dan.</p><p>Zijn de getallen <b>klein</b>, tot ongeveer 10? Dan zie je het meteen op de <b>getallenlijn</b>: −3 + 5, spring 5 naar rechts.</p><p>Zijn de getallen <b>groot</b>, zoals −145 + 60? Zoveel stappen tel je niet. Gebruik dan de <b>regel</b>: kijk naar de tekens en reken met de afstanden tot 0.</p>',
          wanneer:'je een som met negatieve getallen snel en zonder fouten wilt uitrekenen.',
          maak:function(R){
            var lijn = R.heel(0, 1) === 1, m = lijn ? mLijn(R) : mRegel(R), opties = ['de getallenlijn', 'de regel met de afstanden'];
            var uitleg = lijn ? 'De getallen zijn klein. Op de getallenlijn zie je het meteen.' : 'De getallen zijn groot. Zoveel stappen tel je niet: gebruik de regel.';
            return { vraag:m.vraag, context:'Kies eerst de handigste manier. Reken dan uit.', beeld:function(n){ return n < 1 ? '' : m.beeld(n - 1); },
              stappen:[K(R, 'Welke manier is hier het handigst?', opties[lijn ? 0 : 1], [], uitleg, { orde:opties, waarom:uitleg })].concat(m.stappen) };
          } }
      ] },

    /* ================= negatieve getallen: keer en delen ================= */
    { groep:{ id:'wob-a-negkd', niveau:'onderbouw', domein:'algebra', naam:'Negatieve getallen: keer en delen',
        uit:'Vermenigvuldigen en delen met negatieve getallen. Je rekent eerst zonder min en kiest dan het teken met de tekenregels. Machten van negatieve getallen staan bij Herleiden.' },
      doelen:[
        { id:'wob-a-neg-keer', naam:'Vermenigvuldigen met negatieve getallen', kort:'Eén min: het antwoord is negatief. Twee mintekens: het antwoord is positief',
          uit:'<p>Reken eerst <b>zonder mintekens</b>: bij −4 × 6 is dat 4 × 6 = 24.</p><p>Kies dan het <b>teken</b>. <b>Eén</b> min geeft een negatief antwoord: −4 × 6 = <b>−24</b>. <b>Twee</b> mintekens geven een positief antwoord: −4 × −6 = <b>24</b>.</p><p>Min keer min is plus. De tabel helpt je onthouden.</p>',
          wanneer:'je twee getallen vermenigvuldigt en er minstens een negatief is.',
          beeld:tekenTabel(X, false, false, false),
          maak:function(R){
            var a, b; do { a = nz(R, -12, 12); b = nz(R, -12, 12); } while ((a > 0 && b > 0) || Math.abs(a) < 2 || Math.abs(b) < 2);
            var r = a * b, m = (a < 0 ? 1 : 0) + (b < 0 ? 1 : 0), vraag = T(a) + ' ' + X + ' ' + paren(b);
            return { vraag:vraag + ' =', context:'Reken uit.', beeld:function(n){ return tekenTabel(X, a < 0, b < 0, n >= 1); },
              stappen:[
                K(R, 'Tel de mintekens. Wordt het antwoord positief of negatief?', r > 0 ? 'positief' : 'negatief', [], m === 1 ? 'Er is één minteken: het antwoord is negatief.' : 'Er zijn twee mintekens: min keer min is plus.', { orde:['positief', 'negatief'] }),
                S('Reken zonder mintekens: ' + Math.abs(a) + ' ' + X + ' ' + Math.abs(b) + ' =', Math.abs(r), 'De tafel van ' + Math.abs(b) + '.', F(Math.abs(r), Math.abs(a) + Math.abs(b), 'Je telde op. Hier vermenigvuldig je.')),
                S(vraag + ' =', r, 'Het getal ' + Math.abs(r) + (r < 0 ? ' met een min ervoor.' : ' zonder min.'), F(r, -r, 'Let op het teken: ' + (m === 1 ? 'één min geeft min.' : 'min keer min is plus.'), a + b, 'Je telde op. Hier vermenigvuldig je.')) ] };
          } },
        { id:'wob-a-neg-deel', naam:'Delen met negatieve getallen', kort:'Bij delen gelden dezelfde regels: één min geeft min, twee mintekens geven plus',
          uit:'<p>Delen gaat net als vermenigvuldigen. Reken eerst <b>zonder mintekens</b>: bij −36 : 4 is dat 36 : 4 = 9.</p><p><b>Eén</b> min: het antwoord is negatief. −36 : 4 = <b>−9</b>.</p><p><b>Twee</b> mintekens: het antwoord is positief. −36 : −4 = <b>9</b>.</p>',
          wanneer:'je deelt en er minstens een negatief getal in de som staat.',
          beeld:tekenTabel(':', false, false, false),
          maak:function(R){
            var q, b, p; do { q = nz(R, -12, 12); b = nz(R, -12, 12); p = q * b; } while ((p > 0 && b > 0) || Math.abs(q) < 2 || Math.abs(b) < 2);
            var m = (p < 0 ? 1 : 0) + (b < 0 ? 1 : 0), vraag = T(p) + ' : ' + paren(b);
            return { vraag:vraag + ' =', context:'Reken uit.', beeld:function(n){ return tekenTabel(':', p < 0, b < 0, n >= 1); },
              stappen:[
                K(R, 'Tel de mintekens. Wordt het antwoord positief of negatief?', q > 0 ? 'positief' : 'negatief', [], m === 1 ? 'Er is één minteken: het antwoord is negatief.' : 'Er zijn twee mintekens: min gedeeld door min is plus.', { orde:['positief', 'negatief'] }),
                S('Reken zonder mintekens: ' + Math.abs(p) + ' : ' + Math.abs(b) + ' =', Math.abs(q), 'Hoe vaak past ' + Math.abs(b) + ' in ' + Math.abs(p) + '?'),
                S(vraag + ' =', q, 'Het getal ' + Math.abs(q) + (q < 0 ? ' met een min ervoor.' : ' zonder min.'), F(q, -q, 'Let op het teken: ' + (m === 1 ? 'één min geeft min.' : 'min gedeeld door min is plus.'))) ] };
          } },
        { id:'wob-a-neg-meer', naam:'Meer getallen keer elkaar: tel de mintekens', kort:'Een even aantal mintekens geeft plus, een oneven aantal geeft min',
          uit:'<p>Staan er <b>meer dan twee</b> getallen keer elkaar? <b>Tel de mintekens</b>.</p><p>Een <b>even</b> aantal (2, 4) geeft een positief antwoord. Een <b>oneven</b> aantal (1, 3) geeft een negatief antwoord.</p><p>−2 × 3 × −5: twee mintekens, dus plus. 2 × 3 × 5 = 30, dus <b>30</b>. En −2 × −3 × −5 = <b>−30</b>, want dat zijn drie mintekens.</p>',
          wanneer:'je drie of vier getallen met elkaar vermenigvuldigt.',
          maak:function(R){
            var k = R.kies([3, 3, 4]), f, prod, m;
            do { f = []; for (var i = 0; i < k; i++) f.push(nz(R, -6, 6)); prod = f.reduce(function(x, y){ return x * y; }, 1); m = f.filter(function(x){ return x < 0; }).length; }
            while (Math.abs(prod) > 400 || !m || f.filter(function(x){ return Math.abs(x) === 1; }).length > 1);
            var vraag = f.map(function(x, j){ return j ? paren(x) : T(x); }).join(' ' + X + ' '), abs = f.map(function(x){ return Math.abs(x); }).join(' ' + X + ' ');
            return { vraag:vraag + ' =', context:'Reken uit.', stappen:[
              S('Tel de mintekens. Hoeveel zijn het er?', m, 'Kijk bij elk getal of er een min voor staat: ' + f.map(T).join(', ') + '.'),
              K(R, (m === 1 ? 'Eén minteken' : m + ' mintekens') + '. Wordt het antwoord positief of negatief?', prod > 0 ? 'positief' : 'negatief', [], m + ' is ' + (m % 2 ? 'oneven' : 'even') + '. Een even aantal mintekens geeft plus, een oneven aantal geeft min.', { orde:['positief', 'negatief'] }),
              S('Reken zonder mintekens: ' + abs + ' =', Math.abs(prod), 'Doe het in stukjes, van links naar rechts.'),
              S(vraag + ' =', prod, 'Het getal ' + Math.abs(prod) + (prod < 0 ? ' met een min ervoor.' : ' zonder min.'), F(prod, -prod, 'Let op het teken: ' + (m === 1 ? 'één minteken.' : m + ' mintekens.'))) ] };
          } }
      ] },

    /* ================= machten en wortels ================= */
    { groep:{ id:'wob-a-macht', niveau:'onderbouw', domein:'algebra', naam:'Kwadraten, machten en wortels',
        uit:'Een macht uitrekenen, de wortel van een kwadraat en een wortel schatten. De rekenregels voor machten en wortels vereenvoudigen komen later.' },
      doelen:[
        { id:'wob-a-mac-uit', naam:'Een macht uitrekenen', kort:'Het kleine getal zegt hoe vaak je het grondtal met zichzelf vermenigvuldigt: 2⁴ = 2 × 2 × 2 × 2',
          uit:'<p>Bij <b>3⁴</b> is 3 het <b>grondtal</b> en 4 de <b>exponent</b>. De exponent zegt hoe vaak de 3 keer zichzelf gaat: 3 × 3 × 3 × 3.</p><p>Reken in stukjes: 3 × 3 = 9, 9 × 3 = 27, 27 × 3 = <b>81</b>.</p><p>Let op: 3⁴ is niet 3 × 4. Bij een macht van 10 tel je nullen: 10⁵ = 100.000, een 1 met 5 nullen.</p>',
          wanneer:'je een getal met een klein getal rechtsboven ziet staan.',
          maak:function(R){
            var soort = R.heel(0, 3), g, e;
            if (soort === 0){ g = R.heel(2, 5); e = g === 2 ? R.heel(3, 5) : g === 3 ? R.heel(3, 5) : R.heel(3, 4); }
            else if (soort === 1){ g = R.heel(6, 15); e = 2; }
            else if (soort === 2){ g = R.heel(2, 9); e = 3; }
            else { g = 10; e = R.heel(2, 7); }
            var w = macht(g, e), vraag = g + sup(e), st = [
              K(R, 'Wat betekent ' + vraag + '?', keten(g, e), [g + ' ' + X + ' ' + e, e + ' ' + X + ' ' + e], 'De exponent ' + e + ' zegt: ' + e + ' keer het getal ' + g + ', met keer ertussen.') ];
            if (g === 10){
              st.push(S('Een macht van 10: hoeveel nullen komen er achter de 1?', e, 'De exponent is ' + e + ', dus ' + e + ' nullen.'));
              st.push(S(vraag + ' =', w, 'Een 1 met ' + e + ' nullen.', F(w, 10 * e, 'Een macht is geen keer: 10 ' + X + ' ' + e + ' is iets anders.')));
            } else if (e === 2 || (soort === 2 && g > 5)){
              st.push(S(vraag + ' = ' + keten(g, e) + ' =', w, e === 2 ? g + ' ' + X + ' ' + g + '.' : g + ' ' + X + ' ' + g + ' = ' + (g * g) + ', en dat nog eens keer ' + g + '.', F(w, g * e, 'Een macht is geen keer ' + e + '. Het is ' + g + ' keer zichzelf.')));
            } else {
              for (var i = 2; i <= e; i++){
                var v = macht(g, i - 1);
                st.push(S((i === e ? vraag + ' = ' : '') + keten(g, i) + (i > 2 ? ' = ' + T(v) + ' ' + X + ' ' + g : '') + ' =', macht(g, i), T(v) + ' ' + X + ' ' + g + '.', i === e ? F(macht(g, i), g * e, 'Een macht is geen keer ' + e + '.') : null));
              }
            }
            return { vraag:vraag + ' =', context:'Reken uit.', stappen:st };
          } },
        { id:'wob-a-mac-wortel', naam:'De wortel van een kwadraat', kort:'√49 vraagt: welk getal keer zichzelf is 49? Dat is 7, want 7 × 7 = 49',
          uit:'<p>De <b>wortel</b> is het omgekeerde van een kwadraat. Bij <b>√49</b> zoek je het getal dat keer zichzelf 49 is.</p><p>7 × 7 = 49, dus <b>√49 = 7</b>.</p><p>Ken je kwadraten tot 20 × 20 = 400 goed, dan zie je de wortel meteen. Bij √3600 kijk je naar 36: 6 × 6 = 36, dus 60 × 60 = 3600 en √3600 = <b>60</b>.</p>',
          wanneer:'het getal onder de wortel een kwadraat is.',
          maak:function(R){
            var tien = R.heel(0, 4) === 0, k = tien ? R.heel(2, 9) * 10 : R.heel(2, 20), n = k * k, kk = tien ? k / 10 : 0;
            return { vraag:'√' + T(n) + ' =', context:'Reken uit.', stappen:[
              S('Welk getal keer zichzelf is ' + T(n) + '?', k, tien ? 'Kijk eerst naar ' + (kk * kk) + ': dat is ' + kk + ' ' + X + ' ' + kk + '. Dan is ' + T(n) + ' = ' + k + ' ' + X + ' ' + k + '.' : 'Probeer: ' + (k - 1) + ' ' + X + ' ' + (k - 1) + ' = ' + ((k - 1) * (k - 1)) + '. Is dat genoeg, of moet het een groter getal zijn?',
                F(k, n / 2, 'De wortel is niet de helft. Zoek een getal dat keer zichzelf ' + T(n) + ' is.')),
              S('Controleer: ' + k + ' ' + X + ' ' + k + ' =', n, k + ' keer ' + k + '.'),
              S('√' + T(n) + ' =', k, 'Het getal dat keer zichzelf ' + T(n) + ' is.', F(k, n / 2, 'De wortel is niet de helft.')) ] };
          } },
        { id:'wob-a-mac-schat', naam:'Een wortel schatten', kort:'Zoek het kwadraat net onder en net boven het getal: √40 ligt tussen √36 = 6 en √49 = 7',
          uit:'<p>√40 is geen heel getal, want 40 is geen kwadraat. Je kunt wel zeggen <b>tussen welke twee gehele getallen</b> hij ligt.</p><p>Zoek het <b>kwadraat net onder</b> 40: dat is 36 = 6 × 6. En het <b>kwadraat net boven</b> 40: dat is 49 = 7 × 7.</p><p>Dus √40 ligt <b>tussen 6 en 7</b>.</p>',
          wanneer:'je zonder rekenmachine wilt weten hoe groot een wortel ongeveer is.',
          maak:function(R){
            var n, k; do { n = R.heel(5, 200); k = Math.floor(Math.sqrt(n) + 1e-9); } while (k * k === n);
            var o = k * k, b = (k + 1) * (k + 1), ant = k + ' en ' + (k + 1);
            return { vraag:'√' + n, context:'Tussen welke twee gehele getallen ligt √' + n + '?', antwoord:ant, controle:paarC(k, k + 1), invoer:'tekst',
              beeld:function(nn){ if (nn < 3) return ''; return R0.teken.lijn({ van:k - 1, tot:k + 2, streep:1, stip:[Math.sqrt(n)], toon:function(x){ return Math.abs(x - Math.round(x)) < 1e-9 ? T(x) : '√' + n; }, aria:'√' + n + ' op de getallenlijn tussen ' + k + ' en ' + (k + 1) }); },
              stappen:[
                S('Welk kwadraat ligt net onder ' + n + '?', o, 'Kwadraten zijn 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225. Welke is het grootste dat nog kleiner is dan ' + n + '?', F(o, b, 'Dat is groter dan ' + n + '. Zoek het kwadraat eronder.')),
                S('Welk kwadraat ligt net boven ' + n + '?', b, 'Het volgende kwadraat na ' + o + ' = ' + k + ' ' + X + ' ' + k + ' is ' + (k + 1) + ' ' + X + ' ' + (k + 1) + '.', F(b, o, 'Dat is kleiner dan ' + n + '. Zoek het kwadraat erboven.')),
                SC('√' + o + ' = ' + k + ' en √' + b + ' = ' + (k + 1) + '. Dus √' + n + ' ligt tussen welke twee gehele getallen?', ant, paarC(k, k + 1), 'Typ de twee getallen, bijvoorbeeld: ' + ant + '.', F(ant, o + ' en ' + b, 'Dat zijn de kwadraten. Neem van allebei de wortel.')) ] };
          } }
      ] },

    /* ================= volgorde van bewerkingen ================= */
    { groep:{ id:'wob-a-volg', niveau:'onderbouw', domein:'algebra', naam:'Volgorde van bewerkingen',
        uit:'In welke volgorde reken je een lange som uit? Eerst haakjes, dan machten, dan keer en delen, dan plus en min. Gelijke bewerkingen van links naar rechts. Ook met negatieve getallen.' },
      doelen:[
        { id:'wob-a-volg-keer', naam:'Keer en delen gaan voor plus en min', kort:'Reken eerst keer en delen uit, daarna pas plus en min',
          uit:'<p>Bij <b>3 + 4 × 5</b> reken je niet van links naar rechts. <b>Keer en delen</b> gaan <b>voor</b> plus en min.</p><p>Eerst 4 × 5 = 20. Dan 3 + 20 = <b>23</b>. Niet 7 × 5 = 35.</p><p>Staan er twee keersommen? Reken ze allebei eerst uit: 2 × 6 − 3 × 4 = 12 − 12 = <b>0</b>.</p>',
          wanneer:'er plus of min en keer of delen in dezelfde som staan.',
          beeld:ladder(3),
          maak:function(R){
            var t = R.heel(0, 3), a = R.heel(2, 20), b = R.heel(2, 9), c = R.heel(2, 9), d = R.heel(2, 9), p, vraag, r;
            if (t === 0){ p = b * c; r = a + p; vraag = a + ' + ' + b + ' ' + X + ' ' + c;
              return opgaveVolg(vraag, [[K(R, 'Wat reken je eerst uit?', b + ' ' + X + ' ' + c, [a + ' + ' + b], 'Keer gaat voor plus.'), 3], [S(b + ' ' + X + ' ' + c + ' =', p, 'De tafel van ' + c + '.'), 3],
                [S('Nu staat er ' + a + ' + ' + p + '. ' + vraag + ' =', r, a + ' + ' + p + '.', F(r, (a + b) * c, 'Je rekende eerst de plus uit. Keer gaat voor.')), 4]]); }
            if (t === 1){ p = b * c; r = a - p; vraag = a + ' ' + MIN + ' ' + b + ' ' + X + ' ' + c;
              return opgaveVolg(vraag, [[K(R, 'Wat reken je eerst uit?', b + ' ' + X + ' ' + c, [a + ' ' + MIN + ' ' + b], 'Keer gaat voor min.'), 3], [S(b + ' ' + X + ' ' + c + ' =', p, 'De tafel van ' + c + '.'), 3],
                [S('Nu staat er ' + a + ' ' + MIN + ' ' + p + '. ' + vraag + ' =', r, a + ' min ' + p + '.' + (r < 0 ? ' Je komt onder 0 uit.' : ''), F(r, (a - b) * c, 'Je rekende eerst de min uit. Keer gaat voor.', -r, 'Let op het teken.')), 4]]); }
            if (t === 2){ var q = R.heel(2, 9); b = q * c; r = a + q; vraag = a + ' + ' + b + ' : ' + c;
              return opgaveVolg(vraag, [[K(R, 'Wat reken je eerst uit?', b + ' : ' + c, [a + ' + ' + b], 'Delen gaat voor plus.'), 3], [S(b + ' : ' + c + ' =', q, 'Hoe vaak past ' + c + ' in ' + b + '?'), 3],
                [S('Nu staat er ' + a + ' + ' + q + '. ' + vraag + ' =', r, a + ' + ' + q + '.', F(r, (a + b) / c, 'Je rekende eerst de plus uit. Delen gaat voor.')), 4]]); }
            a = R.heel(2, 9); var p1 = a * b, p2 = c * d; r = p1 - p2; vraag = a + ' ' + X + ' ' + b + ' ' + MIN + ' ' + c + ' ' + X + ' ' + d;
            return opgaveVolg(vraag, [[S('Eerst de eerste keersom: ' + a + ' ' + X + ' ' + b + ' =', p1, 'De tafel van ' + b + '.'), 3], [S('Dan de tweede keersom: ' + c + ' ' + X + ' ' + d + ' =', p2, 'De tafel van ' + d + '.'), 3],
              [S('Nu staat er ' + p1 + ' ' + MIN + ' ' + p2 + '. ' + vraag + ' =', r, p1 + ' min ' + p2 + '.', F(r, (p1 - c) * d, 'Je rekende de min te vroeg uit. Eerst allebei de keersommen.', -r, 'Let op het teken.')), 4]]);
          } },
        { id:'wob-a-volg-links', naam:'Van links naar rechts', kort:'Keer en delen zijn even sterk, plus en min ook: dan reken je van links naar rechts',
          uit:'<p><b>Keer en delen</b> zijn even sterk. Staan ze naast elkaar, dan reken je <b>van links naar rechts</b>.</p><p>24 : 4 × 2: eerst 24 : 4 = 6, dan 6 × 2 = <b>12</b>. Niet 24 : 8 = 3.</p><p>Met <b>plus en min</b> net zo: 10 − 4 + 3 = 6 + 3 = <b>9</b>. Niet 10 − 7 = 3.</p>',
          wanneer:'er alleen keer en delen, of alleen plus en min in een som staan.',
          beeld:ladder(3),
          maak:function(R){
            var t = R.heel(0, 3), a, b, c, eerst, tweede, h, r, vraag, niv, fout;
            if (t === 0){ b = R.heel(2, 9); var q = R.heel(2, 9); a = b * q; c = R.heel(2, 9); h = q; r = q * c; vraag = a + ' : ' + b + ' ' + X + ' ' + c; eerst = a + ' : ' + b; tweede = b + ' ' + X + ' ' + c; niv = 3; fout = a / (b * c); }
            else if (t === 1){ a = R.heel(10, 40); b = R.heel(2, 15); c = R.heel(2, 15); h = a - b; r = h + c; vraag = a + ' ' + MIN + ' ' + b + ' + ' + c; eerst = a + ' ' + MIN + ' ' + b; tweede = b + ' + ' + c; niv = 4; fout = a - (b + c); }
            else if (t === 2){ a = R.heel(15, 40); b = R.heel(2, 12); do { c = R.heel(2, 12); } while (c === b); h = a - b; r = h - c; vraag = a + ' ' + MIN + ' ' + b + ' ' + MIN + ' ' + c; eerst = a + ' ' + MIN + ' ' + b; tweede = b + ' ' + MIN + ' ' + c; niv = 4; fout = a - (b - c); }
            else { c = R.heel(2, 5); b = c * R.heel(2, 4); var q2 = R.heel(2, 6); a = b * q2; h = q2; r = q2 / c; while (r !== Math.round(r)){ q2++; a = b * q2; h = q2; r = q2 / c; } vraag = a + ' : ' + b + ' : ' + c; eerst = a + ' : ' + b; tweede = b + ' : ' + c; niv = 3; fout = a / (b / c); }
            var rest = vraag.slice(eerst.length);
            return opgaveVolg(vraag, [
              [K(R, 'Wat reken je eerst uit?', eerst, [tweede], niv === 3 ? 'Keer en delen zijn even sterk. Dan ga je van links naar rechts.' : 'Plus en min zijn even sterk. Dan ga je van links naar rechts.'), niv],
              [S(eerst + ' =', h, 'Begin links: ' + eerst + '.'), niv],
              [S('Nu staat er ' + T(h) + rest + '. ' + vraag + ' =', r, T(h) + rest + '.', F(r, fout, 'Je rekende eerst het rechterstuk uit. Ga van links naar rechts.')), niv]]);
          } },
        { id:'wob-a-volg-haakjes', naam:'Eerst wat tussen haakjes staat', kort:'Haakjes gaan altijd voor: reken eerst uit wat tussen haakjes staat',
          uit:'<p><b>Haakjes</b> gaan voor alles. Wat tussen haakjes staat, reken je <b>eerst</b> uit.</p><p>(3 + 5) × 4: eerst 3 + 5 = 8, dan 8 × 4 = <b>32</b>. Zonder haakjes was het 3 + 20 = 23.</p><p>Komt er tussen de haakjes een negatief getal uit, zet het dan tussen haakjes: 2 × (3 − 7) = 2 × (−4) = <b>−8</b>.</p>',
          wanneer:'er haakjes in een som staan.',
          beeld:ladder(1),
          maak:function(R){
            var t = R.heel(0, 3), a, b, c, d, h, r, vraag;
            if (t === 0){ a = R.heel(1, 12); b = R.heel(1, 12); c = R.heel(2, 9); h = a + b; r = h * c; vraag = '(' + a + ' + ' + b + ') ' + X + ' ' + c;
              return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + a + ' + ' + b + ' =', h, a + ' + ' + b + '.'), 1], [S('Nu staat er ' + h + ' ' + X + ' ' + c + '. ' + vraag + ' =', r, h + ' ' + X + ' ' + c + '.', F(r, a + b * c, 'Je deed eerst de keersom. Haakjes gaan voor.')), 3]]); }
            if (t === 1){ a = R.heel(2, 9); b = R.heel(1, 12); c = R.heel(1, 15); if (b === c) c++; h = b - c; r = a * h; vraag = a + ' ' + X + ' (' + b + ' ' + MIN + ' ' + c + ')';
              return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + b + ' ' + MIN + ' ' + c + ' =', h, b + ' min ' + c + '.' + (h < 0 ? ' Je komt onder 0 uit.' : ''), F(h, -h, 'Let op het teken.')), 1],
                [S('Nu staat er ' + a + ' ' + X + ' ' + paren(h) + '. ' + vraag + ' =', r, a + ' ' + X + ' ' + paren(h) + '.' + (h < 0 ? ' Eén min: het antwoord is negatief.' : ''), F(r, a * b - c, 'Je deed eerst de keersom. Haakjes gaan voor.', -r, 'Let op het teken.')), 3]]); }
            if (t === 2){ c = R.heel(2, 6); var q = nz(R, -8, 9); a = R.heel(1, 30); b = a - q * c; if (b <= 0){ b = a + Math.abs(q) * c; } h = a - b; r = h / c; vraag = '(' + a + ' ' + MIN + ' ' + b + ') : ' + c;
              return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + a + ' ' + MIN + ' ' + b + ' =', h, a + ' min ' + b + '.' + (h < 0 ? ' Je komt onder 0 uit.' : ''), F(h, -h, 'Let op het teken.')), 1],
                [S('Nu staat er ' + paren(h) + ' : ' + c + '. ' + vraag + ' =', r, Math.abs(h) + ' : ' + c + ' = ' + Math.abs(r) + (h < 0 ? ', en één min geeft min.' : '.'), F(r, -r, 'Let op het teken.')), 3]]); }
            a = R.heel(10, 40); b = R.heel(1, 6); c = R.heel(1, 6); d = R.heel(2, 6); h = b + c; var p = h * d; r = a - p; vraag = a + ' ' + MIN + ' (' + b + ' + ' + c + ') ' + X + ' ' + d;
            return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + b + ' + ' + c + ' =', h, b + ' + ' + c + '.'), 1], [S('Dan de keersom: ' + h + ' ' + X + ' ' + d + ' =', p, h + ' ' + X + ' ' + d + '.', F(p, (a - h) * d, 'Dat is te veel: eerst alleen ' + h + ' ' + X + ' ' + d + '.')), 3],
              [S('Nu staat er ' + a + ' ' + MIN + ' ' + p + '. ' + vraag + ' =', r, a + ' min ' + p + '.', F(r, (a - h) * d, 'Je rekende de min te vroeg uit. Keer gaat voor min.', -r, 'Let op het teken.')), 4]]);
          } },
        { id:'wob-a-volg-macht', naam:'Machten gaan voor keer en delen', kort:'Na de haakjes komen de machten: reken een kwadraat uit voordat je vermenigvuldigt',
          uit:'<p>Na de haakjes komen de <b>machten</b>. Die gaan voor keer, delen, plus en min.</p><p>2 × 3²: eerst 3² = 9, dan 2 × 9 = <b>18</b>. Niet 6² = 36.</p><p>Staan er haakjes om, dan gaan die nog eerder: (2 + 3)² = 5² = <b>25</b>. Dat is iets anders dan 2² + 3² = 13.</p>',
          wanneer:'er een macht, zoals een kwadraat, in een langere som staat.',
          beeld:ladder(2),
          maak:function(R){
            var t = R.heel(0, 4), a = R.heel(2, 9), b = R.heel(2, 9), c = R.heel(2, 9), m, r, vraag;
            if (t === 0){ m = b * b; r = a * m; vraag = a + ' ' + X + ' ' + b + '²';
              return opgaveVolg(vraag, [[K(R, 'Wat reken je eerst uit?', b + '²', [a + ' ' + X + ' ' + b], 'Machten gaan voor keer.'), 2], [S(b + '² =', m, b + ' ' + X + ' ' + b + '.', F(m, 2 * b, 'Een kwadraat is keer zichzelf, niet keer 2.')), 2],
                [S('Nu staat er ' + a + ' ' + X + ' ' + m + '. ' + vraag + ' =', r, a + ' ' + X + ' ' + m + '.', F(r, (a * b) * (a * b), 'Je deed eerst de keersom. De macht gaat voor.')), 3]]); }
            if (t === 1){ a = R.heel(2, 20); m = b * b; r = a + m; vraag = a + ' + ' + b + '²';
              return opgaveVolg(vraag, [[K(R, 'Wat reken je eerst uit?', b + '²', [a + ' + ' + b], 'Machten gaan voor plus.'), 2], [S(b + '² =', m, b + ' ' + X + ' ' + b + '.', F(m, 2 * b, 'Een kwadraat is keer zichzelf, niet keer 2.')), 2],
                [S('Nu staat er ' + a + ' + ' + m + '. ' + vraag + ' =', r, a + ' + ' + m + '.', F(r, (a + b) * (a + b), 'Je deed eerst de plus. De macht gaat voor.')), 4]]); }
            if (t === 2){ a = R.heel(1, 8); b = R.heel(1, 8); var h = a + b; r = h * h; vraag = '(' + a + ' + ' + b + ')²';
              return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + a + ' + ' + b + ' =', h, a + ' + ' + b + '.'), 1], [S('Nu staat er ' + h + '². ' + vraag + ' =', r, h + ' ' + X + ' ' + h + '.', F(r, a * a + b * b, 'Eerst de haakjes, dan pas het kwadraat.', 2 * h, 'Een kwadraat is keer zichzelf, niet keer 2.')), 2]]); }
            if (t === 3){ m = a * a; var p = b * c; r = m - p; vraag = a + '² ' + MIN + ' ' + b + ' ' + X + ' ' + c;
              return opgaveVolg(vraag, [[S('Eerst de macht: ' + a + '² =', m, a + ' ' + X + ' ' + a + '.', F(m, 2 * a, 'Een kwadraat is keer zichzelf, niet keer 2.')), 2], [S('Dan de keersom: ' + b + ' ' + X + ' ' + c + ' =', p, 'De tafel van ' + c + '.'), 3],
                [S('Nu staat er ' + m + ' ' + MIN + ' ' + p + '. ' + vraag + ' =', r, m + ' min ' + p + '.', F(r, (m - b) * c, 'Je rekende de min te vroeg uit. Keer gaat voor min.', -r, 'Let op het teken.')), 4]]); }
            b = R.heel(2, 4); a = R.heel(5, 60); m = b * b * b; r = a - m; vraag = a + ' ' + MIN + ' ' + b + '³';
            return opgaveVolg(vraag, [[S('Eerst de macht: ' + b + '³ = ' + keten(b, 3) + ' =', m, b + ' ' + X + ' ' + b + ' = ' + (b * b) + ', en dat keer ' + b + '.', F(m, 3 * b, 'Een macht is geen keer 3.')), 2],
              [S('Nu staat er ' + a + ' ' + MIN + ' ' + m + '. ' + vraag + ' =', r, a + ' min ' + m + '.', F(r, macht(a - b, 3), 'Je deed eerst de min. De macht gaat voor.', -r, 'Let op het teken.')), 4]]);
          } },
        { id:'wob-a-volg-neg', naam:'Alles samen, met negatieve getallen', kort:'Haakjes, machten, keer en delen, plus en min, en let bij elke stap op de mintekens',
          uit:'<p>Nu komt alles samen, ook met <b>negatieve getallen</b>. Werk de volgorde stap voor stap af en schrijf elke tussenuitkomst op.</p><p>5 − 3 × (2 − 6): eerst de haakjes, 2 − 6 = −4. Dan de keersom, 3 × (−4) = −12. Dan 5 − (−12) = 5 + 12 = <b>17</b>.</p><p>Zet een negatieve tussenuitkomst altijd tussen haakjes. Dan zie je goed wat je moet doen.</p>',
          wanneer:'er in een lange som ook negatieve getallen staan.',
          beeld:ladder(0),
          maak:function(R){
            var t = R.heel(0, 2), a, b, c, d, h, k, r, vraag;
            if (t === 0){
              do { a = nz(R, -10, 10); b = R.heel(2, 6); c = nz(R, -6, 6); d = R.heel(1, 9); h = c - d; } while (h >= 0);
              k = b * h; r = a - k; vraag = T(a) + ' ' + MIN + ' ' + b + ' ' + X + ' (' + T(c) + ' ' + MIN + ' ' + d + ')';
              return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + T(c) + ' ' + MIN + ' ' + d + ' =', h, 'Begin bij ' + T(c) + ' en ga ' + d + ' naar links.', F(h, -h, 'Let op het teken.')), 1],
                [S('Dan de keersom: ' + b + ' ' + X + ' ' + paren(h) + ' =', k, 'Eén min: het antwoord is negatief.', F(k, -k, 'Let op het teken: één min geeft min.')), 3],
                [S('Nu staat er ' + T(a) + ' ' + MIN + ' ' + paren(k) + '. Min een min wordt plus: ' + T(a) + ' + ' + (-k) + ' =', r, T(a) + ' + ' + (-k) + '.', F(r, a + k, 'Min een negatief getal wordt plus.', (a - b) * h, 'Je rekende de min te vroeg uit. Keer gaat voor.')), 4]]);
            }
            if (t === 1){
              var p;
              do { a = nz(R, -5, 5); b = R.heel(1, 9); h = a - b; c = nz(R, -6, 6); d = nz(R, -6, 6); } while (h >= 0 || h < -7 || c * d > 0);
              var m = h * h; p = c * d; r = m + p; vraag = '(' + T(a) + ' ' + MIN + ' ' + b + ')² + ' + paren(c) + ' ' + X + ' ' + paren(d);
              return opgaveVolg(vraag, [[S('Eerst de haakjes: ' + T(a) + ' ' + MIN + ' ' + b + ' =', h, 'Begin bij ' + T(a) + ' en ga ' + b + ' naar links.', F(h, -h, 'Let op het teken.')), 1],
                [S('Dan de macht: ' + paren(h) + '² =', m, paren(h) + ' ' + X + ' ' + paren(h) + '. Min keer min is plus.', F(m, -m, 'Een kwadraat is nooit negatief: min keer min is plus.')), 2],
                [S('Dan de keersom: ' + paren(c) + ' ' + X + ' ' + paren(d) + ' =', p, 'Eén min: het antwoord is negatief.', F(p, -p, 'Let op het teken.')), 3],
                [S('Nu staat er ' + m + ' + ' + paren(p) + '. Dat is ' + m + ' ' + MIN + ' ' + (-p) + ' =', r, m + ' min ' + (-p) + '.', F(r, m - p, 'Plus een negatief getal is min.')), 4]]);
            }
            var q;
            do { a = nz(R, -9, 9); b = nz(R, -9, 9); d = nz(R, -9, 9); q = nz(R, -9, 9); c = q * d; } while (Math.abs(a) < 2 || Math.abs(b) < 2 || Math.abs(d) < 2 || (a > 0 && b > 0 && c > 0 && d > 0) || Math.abs(c) > 60);
            var p1 = a * b; r = p1 - q; vraag = T(a) + ' ' + X + ' ' + paren(b) + ' ' + MIN + ' ' + paren(c) + ' : ' + paren(d);
            return opgaveVolg(vraag, [[S('Eerst de keersom: ' + T(a) + ' ' + X + ' ' + paren(b) + ' =', p1, (p1 < 0 ? 'Eén min: negatief. ' : a < 0 ? 'Min keer min is plus. ' : '') + Math.abs(a) + ' ' + X + ' ' + Math.abs(b) + ' = ' + Math.abs(p1) + '.', F(p1, -p1, 'Let op het teken.')), 3],
              [S('Dan de deelsom: ' + T(c) + ' : ' + paren(d) + ' =', q, (q < 0 ? 'Eén min: negatief. ' : (c < 0 ? 'Min gedeeld door min is plus. ' : '')) + Math.abs(c) + ' : ' + Math.abs(d) + ' = ' + Math.abs(q) + '.', F(q, -q, 'Let op het teken.')), 3],
              [S('Nu staat er ' + T(p1) + ' ' + MIN + ' ' + paren(q) + '. ' + vraag + ' =', r, q < 0 ? 'Min een min wordt plus: ' + T(p1) + ' + ' + (-q) + '.' : T(p1) + ' min ' + q + '.', F(r, p1 + q, q < 0 ? 'Min een negatief getal wordt plus.' : 'Je telde op. Er staat min.')), 4]]);
          } }
      ] },

    /* ================= rekenen met letters ================= */
    { groep:{ id:'wob-a-letter', niveau:'onderbouw', domein:'algebra', naam:'Rekenen met letters',
        uit:'Korter schrijven zonder keerteken, gelijksoortige termen samennemen, getallen invullen en één haakje wegwerken. Termen vermenigvuldigen en twee haakjes staan bij Herleiden.' },
      doelen:[
        { id:'wob-a-let-keer', naam:'Het keerteken weglaten', kort:'Eerst het getal, dan de letters op volgorde van het alfabet: b · 3 · a = 3ab',
          uit:'<p>Tussen een getal en een letter laat je het <b>keerteken weg</b>: 3 · a = <b>3a</b>.</p><p>Het <b>getal</b> komt altijd <b>vooraan</b>, de <b>letters</b> erachter op volgorde van het <b>alfabet</b>: a · 5 = 5a en b · 2 · a = <b>2ab</b>.</p><p>Een 1 schrijf je niet op: 1 · x = <b>x</b>. En −1 · x = <b>−x</b>.</p>',
          wanneer:'je een uitdrukking met letters zo kort mogelijk opschrijft.',
          maak:function(R){
            var c = R.kies([1, -1, 2, 3, 4, 5, 6, 7, 8, 9, -2, -3, -4, -5, -6, 9, 5]), paar = R.kies([['a'], ['x'], ['p'], ['a', 'b'], ['x', 'y'], ['p', 'q'], ['a', 'b'], ['k', 'm']]);
            var letters = paar.join(''), fact = R.hussel(paar.concat([c])), vraag = fact.map(function(f, j){ return typeof f === 'number' ? (j ? paren(f) : T(f)) : f; }).join(' · ');
            var res = (c === 1 ? '' : c === -1 ? MIN : T(c)) + letters, omg = paar.slice().reverse().join('');
            var st = [S('Welk getal zet je vooraan?', c, 'Het getal in de vermenigvuldiging is ' + T(c) + '. Dat komt voor de letters.', F(c, -c, 'Let op het minteken.'))];
            if (paar.length > 1) st.push(SC('Welke letters komen erachter? Zet ze op volgorde van het alfabet.', letters, exactC(letters), 'In het alfabet komt ' + paar[0] + ' voor ' + paar[1] + ': ' + letters + '.', F(letters, omg, 'Bijna. Zet de letters op volgorde van het alfabet: ' + letters + '.')));
            st.push(SC('Schrijf zonder keerteken: ' + vraag + ' =', res, exactC(res), c === 1 ? 'Een 1 voor een letter schrijf je niet op: 1 · ' + letters + ' = ' + letters + '.' : c === -1 ? 'Bij −1 schrijf je alleen de min: ' + res + '.' : 'Eerst het getal, dan de letters: ' + res + '.',
              F(res, '1' + letters, 'Een 1 voor een letter schrijf je niet op.', MIN + '1' + letters, 'Bij −1 schrijf je alleen de min.', letters + T(c), 'Het getal komt vooraan.', paar.length > 1 ? T(c) + omg : letters + T(c), 'Zet de letters op volgorde van het alfabet.', T(c) + '·' + letters, 'Laat het keerteken weg.', T(c) + ' · ' + letters, 'Laat het keerteken weg.')));
            return { vraag:vraag, context:'Schrijf zo kort mogelijk.', antwoord:res, controle:exactC(res), invoer:'tekst', stappen:st };
          } },
        { id:'wob-a-let-samen', naam:'Gelijksoortige termen samennemen', kort:'Neem alleen termen met precies dezelfde letters samen; losse getallen apart',
          uit:'<p><b>Gelijksoortige termen</b> hebben precies dezelfde letters: 3a en −5a wel, 3a en 3b niet, en a en a² ook niet.</p><p>3a + 7 + 2a − 9: de a-termen samen, 3a + 2a = 5a. De losse getallen samen, 7 − 9 = −2. Samen: <b>5a − 2</b>.</p><p>Het teken hoort bij de term erachter. Bij − 4a tel je dus −4 mee.</p>',
          wanneer:'er in een uitdrukking termen met dezelfde letter staan.',
          maak:function(R){
            var v = R.heel(0, 2), l = R.kies(['a', 'x', 'p', 'b']), A, B, c1, c2, d1, d2, termen;
            do { c1 = nz(R, -9, 9); c2 = nz(R, -9, 9); d1 = nz(R, -12, 12); d2 = nz(R, -12, 12); } while (!(c1 + c2) || !(d1 + d2) || (c1 < 0 && c2 < 0 && R.heel(0, 1)));
            if (v === 0){ A = l; B = ''; } else if (v === 1){ A = l; B = { a:'b', x:'y', p:'q', b:'c' }[l]; d1 = nz(R, -9, 9); while (!(d1 + d2) || Math.abs(d2) > 9) d2 = nz(R, -9, 9); } else { A = l + '²'; B = l; d1 = nz(R, -9, 9); while (!(d1 + d2) || Math.abs(d2) > 9) d2 = nz(R, -9, 9); }
            termen = R.hussel([[c1, A], [c2, A], [d1, B], [d2, B]]);
            if (termen[0][0] < 0 && R.heel(0, 1)) termen.push(termen.shift());
            var vraag = E(termen), sA = c1 + c2, sB = d1 + d2, res = E([[sA, A], [sB, B]]), resA = E([[sA, A]]);
            var aT = termen.filter(function(t){ return t[1] === A; }), bT = termen.filter(function(t){ return t[1] === B; });
            var st = [SC('Neem de termen met ' + A + ' samen: ' + E(aT) + ' =', resA, exprC(resA, { kaal:true }), 'Tel de getallen voor ' + A + ' op: ' + T(aT[0][0]) + ' en ' + T(aT[1][0]) + ' geeft ' + T(sA) + '.',
              F(resA, E([[aT[0][0] - aT[1][0], A]]), 'Het teken hoort bij de term. Tel ' + T(aT[0][0]) + ' en ' + T(aT[1][0]) + ' op.', E([[-sA, A]]), 'Let op het teken.'))];
            if (B) st.push(SC('Neem de termen met ' + B + ' samen: ' + E(bT) + ' =', E([[sB, B]]), exprC(E([[sB, B]]), { kaal:true }), 'Tel de getallen voor ' + B + ' op: ' + T(bT[0][0]) + ' en ' + T(bT[1][0]) + ' geeft ' + T(sB) + '.', F(E([[sB, B]]), E([[-sB, B]]), 'Let op het teken.')));
            else st.push(S('Neem de losse getallen samen: ' + E(bT) + ' =', sB, T(bT[0][0]) + ' en ' + T(bT[1][0]) + ' samen.', F(sB, -sB, 'Let op het teken.', bT[0][0] - bT[1][0], 'Het teken hoort bij het getal erachter.')));
            st.push(SC('Zet het samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'De twee stukken achter elkaar: ' + res + '.', F(res, E([[sA + sB, A]]), B ? A + ' en ' + B + ' zijn niet gelijksoortig. Die mag je niet samennemen.' : 'Een ' + A + '-term en een los getal mag je niet samennemen.')));
            return { vraag:vraag, context:'Neem samen.' + (v === 2 ? ' Typ ' + l + '² als ' + l + '^2.' : ''), antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:st };
          } },
        { id:'wob-a-let-invul', naam:'Invullen in een uitdrukking', kort:'Vervang elke letter door het getal, met haakjes om een negatief getal, en reken in de goede volgorde',
          uit:'<p>Bij <b>invullen</b> vervang je de letter door een getal. Zet om een <b>negatief</b> getal altijd <b>haakjes</b>.</p><p>3a + 5 met a = −4: 3 × (−4) + 5 = −12 + 5 = <b>−7</b>.</p><p>Let op de volgorde bij een kwadraat: 2a² met a = −3 is 2 × (−3)² = 2 × 9 = <b>18</b>. Eerst het kwadraat, dan keer 2.</p>',
          wanneer:'je de uitkomst van een formule of uitdrukking zoekt bij een gegeven getal.',
          maak:function(R){
            var t = R.heel(0, 2), p, q, va, vb, r, vraag, ctx, st = [];
            if (t === 0){
              p = nz(R, -9, 9); if (Math.abs(p) < 2) p = 3; q = nz(R, -12, 12); va = R.heel(-8, -1); var pv = p * va; r = pv + q; vraag = E([[p, 'a'], [q, '']]); ctx = 'Neem a = ' + T(va) + '. Bereken:';
              st = [S('Vul in: ' + T(p) + ' ' + X + ' ' + paren(va) + ' =', pv, (pv < 0 ? 'Eén min: negatief. ' : 'Min keer min is plus. ') + Math.abs(p) + ' ' + X + ' ' + Math.abs(va) + ' = ' + Math.abs(pv) + '.', F(pv, -pv, 'Let op het teken.', p + va, 'Je telde op. ' + E([[p, 'a']]) + ' betekent ' + T(p) + ' keer a.')),
                S('Nu staat er ' + T(pv) + pm(q) + ' =', r, T(pv) + pm(q) + '.', F(r, -r, 'Let op het teken.'))];
            } else if (t === 1){
              p = R.heel(2, 6); q = nz(R, -6, 6); if (Math.abs(q) < 2) q = -2; va = nz(R, -6, 6); vb = nz(R, -6, 6); if (va > 0 && vb > 0) vb = -vb;
              var p1 = p * va, p2 = q * vb; r = p1 + p2; vraag = E([[p, 'a'], [q, 'b']]); ctx = 'Neem a = ' + T(va) + ' en b = ' + T(vb) + '. Bereken:';
              st = [S('Eerst ' + E([[p, 'a']]) + ': ' + p + ' ' + X + ' ' + paren(va) + ' =', p1, p + ' keer ' + paren(va) + '.', F(p1, -p1, 'Let op het teken.')),
                S('Dan ' + E([[q, 'b']]) + ': ' + T(q) + ' ' + X + ' ' + paren(vb) + ' =', p2, 'Neem het teken mee: ' + T(q) + ' keer ' + paren(vb) + '.' + (q < 0 && vb < 0 ? ' Min keer min is plus.' : ''), F(p2, -p2, 'Let op het teken.')),
                S('Tel op: ' + T(p1) + ' + ' + paren(p2) + ' =', r, T(p1) + (p2 < 0 ? ' min ' + (-p2) : ' plus ' + p2) + '.', F(r, p1 - p2, 'Let op de tekens.'))];
            } else {
              p = R.kies([1, 1, 2, 3, -1, -2]); q = nz(R, -10, 10); va = R.heel(-6, -2); var kw = va * va, pk = p * kw; r = pk + q; vraag = E([[p, 'a²'], [q, '']]); ctx = 'Neem a = ' + T(va) + '. Bereken:';
              st = [S('Eerst het kwadraat: ' + paren(va) + '² =', kw, paren(va) + ' ' + X + ' ' + paren(va) + '. Min keer min is plus.', F(kw, -kw, 'Een kwadraat is nooit negatief: min keer min is plus.', 2 * va, 'Een kwadraat is keer zichzelf, niet keer 2.'))];
              if (p !== 1) st.push(S('Dan ' + E([[p, 'a²']]) + ': ' + T(p) + ' ' + X + ' ' + kw + ' =', pk, T(p) + ' keer ' + kw + '.', F(pk, (p * va) * (p * va), 'Eerst het kwadraat, dan pas keer ' + T(p) + '.', -pk, 'Let op het teken.')));
              st.push(S('Nu staat er ' + T(pk) + pm(q) + ' =', r, T(pk) + pm(q) + '.', F(r, -r, 'Let op het teken.')));
            }
            return { vraag:vraag, context:ctx, stappen:st };
          } },
        { id:'wob-a-let-haak', naam:'Eén haakje wegwerken', kort:'Vermenigvuldig het getal voor de haakjes met elke term binnen de haakjes',
          uit:'<p>Bij <b>3(x + 4)</b> gaat de 3 keer <b>alles</b> wat tussen de haakjes staat: 3 · x = 3x en 3 · 4 = 12. Samen <b>3x + 12</b>.</p><p>Let op de tekens: −2(a − 5) = −2a + 10, want −2 · −5 = +10.</p><p>Een rooster helpt: boven de termen tussen de haakjes, links het getal ervoor.</p>',
          wanneer:'er een getal voor haakjes staat.',
          beeld:R0.teken.rooster(['x', '+4'], ['3'], [['3x', '12']]),
          maak:function(R){
            var p, a = R.kies([1, 1, 2, 3]), q, l = R.kies(['x', 'a', 'p']);
            do { p = nz(R, -8, 8); q = nz(R, -9, 9); } while (Math.abs(p) < 2);
            var binnen = E([[a, l], [q, '']]), vraag = (p < 0 ? MIN + (-p) : p) + '(' + binnen + ')', res = E([[p * a, l], [p * q, '']]), t1 = E([[p * a, l]]);
            return { vraag:vraag, context:'Werk de haakjes weg.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst',
              beeld:function(n){ return R0.teken.rooster([E([[a, l]]), (q < 0 ? MIN : '+') + Math.abs(q)], [T(p)], [[n >= 1 ? t1 : '', n >= 2 ? T(p * q) : '']]); },
              stappen:[
                SC(T(p) + ' · ' + E([[a, l]]) + ' =', t1, exprC(t1, { kaal:true }), (a === 1 ? T(p) + ' keer ' + l + ' schrijf je als ' + t1 + '.' : T(p) + ' ' + X + ' ' + a + ' = ' + T(p * a) + '. De letter ' + l + ' blijft staan.'), F(t1, E([[-p * a, l]]), 'Let op het teken.')),
                S(T(p) + ' ' + X + ' ' + paren(q) + ' =', p * q, (p * q < 0 ? 'Eén min: negatief. ' : (p < 0 ? 'Min keer min is plus. ' : '')) + Math.abs(p) + ' ' + X + ' ' + Math.abs(q) + ' = ' + Math.abs(p * q) + '.', F(p * q, -p * q, 'Let op het teken.', q, 'Ook de ' + T(q) + ' gaat keer ' + T(p) + '.')),
                SC('Samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'Zet de twee stukken achter elkaar: ' + res + '.', F(res, E([[p * a, l], [q, '']]), 'Ook het getal tussen de haakjes gaat keer ' + T(p) + '.')) ] };
          } },
        { id:'wob-a-let-minhaak', naam:'Een min voor de haakjes', kort:'Een min voor de haakjes draait elk teken tussen de haakjes om',
          uit:'<p>Een <b>min voor de haakjes</b> is hetzelfde als −1 keer alles erin. Elk teken <b>draait om</b>.</p><p>−(x − 4) = <b>−x + 4</b>. Uit + wordt −, uit − wordt +.</p><p>Staat er nog iets voor: 10 − (2a + 3) = 10 − 2a − 3. Neem dan de getallen samen: <b>7 − 2a</b>.</p>',
          wanneer:'er een min direct voor haakjes staat.',
          maak:function(R){
            var t = R.heel(0, 2), l = R.kies(['x', 'a', 'p']), a = R.kies([1, 1, 2, 3, 4, 5]), q = nz(R, -9, 9), binnen = E([[a, l], [q, '']]), vraag, res, st;
            if (t === 0){
              vraag = MIN + '(' + binnen + ')'; res = E([[-a, l], [-q, '']]);
              st = [SC('De min draait het teken van ' + E([[a, l]]) + ' om:', E([[-a, l]]), exprC(E([[-a, l]]), { kaal:true }), 'Uit + ' + E([[a, l]]) + ' wordt ' + MIN + ' ' + E([[a, l]]) + '.'),
                S('De min draait ook ' + (q < 0 ? MIN : '+') + ' ' + Math.abs(q) + ' om:', -q, q < 0 ? 'Uit ' + MIN + ' ' + (-q) + ' wordt + ' + (-q) + '.' : 'Uit + ' + q + ' wordt ' + MIN + ' ' + q + '.', F(-q, q, 'Ook dit teken draait om.')),
                SC('Samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'Zet ze achter elkaar: ' + res + '.', F(res, E([[-a, l], [q, '']]), 'Ook het teken van het getal draait om.'))];
            } else if (t === 1){
              var k; do { k = R.heel(2, 15); } while (k === q);
              vraag = k + ' ' + MIN + ' (' + binnen + ')'; var los = E([[k, ''], [-a, l], [-q, '']]); res = E([[-a, l], [k - q, '']]);
              st = [SC('Werk de haakjes weg. Elk teken draait om: ' + vraag + ' =', los, exprC(los), 'De ' + k + ' blijft staan. Uit de haakjes komt ' + E([[-a, l], [-q, '']]) + '.', F(los, E([[k, ''], [-a, l], [q, '']]), 'Ook het teken van het getal draait om.')),
                S('Neem de getallen samen: ' + k + pm(-q) + ' =', k - q, k + pm(-q) + '.', F(k - q, k + q, 'Let op het teken: het is ' + pm(-q).trim() + '.')),
                SC('Samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'De ' + l + '-term en het getal: ' + res + '.')];
            } else {
              var b; do { b = R.heel(2, 9); } while (b === a);
              vraag = E([[b, l]]) + ' ' + MIN + ' (' + binnen + ')'; var los2 = E([[b, l], [-a, l], [-q, '']]); res = E([[b - a, l], [-q, '']]);
              st = [SC('Werk de haakjes weg. Elk teken draait om: ' + vraag + ' =', los2, exprC(los2), E([[b, l]]) + ' blijft staan. Uit de haakjes komt ' + E([[-a, l], [-q, '']]) + '.', F(los2, E([[b, l], [-a, l], [q, '']]), 'Ook het teken van het getal draait om.')),
                SC('Neem de ' + l + '-termen samen: ' + E([[b, l], [-a, l]]) + ' =', E([[b - a, l]]), exprC(E([[b - a, l]]), { kaal:true }), T(b) + ' ' + MIN + ' ' + a + ' = ' + T(b - a) + '.', F(E([[b - a, l]]), E([[b + a, l]]), 'Er staat min ' + E([[a, l]]) + '.')),
                SC('Samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'De ' + l + '-term en het getal: ' + res + '.')];
            }
            return { vraag:vraag, context:'Werk de haakjes weg en neem samen.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:st };
          } },
        { id:'wob-a-let-haaksamen', naam:'Haakjes wegwerken en samennemen', kort:'Werk eerst de haakjes weg, neem dan de x-termen samen en daarna de losse getallen',
          uit:'<p>Werk eerst <b>alle haakjes</b> weg. Daarna <b>neem je samen</b>.</p><p>3(x + 2) + 4x − 5 = 3x + 6 + 4x − 5. De x-termen: 3x + 4x = 7x. De getallen: 6 − 5 = 1. Samen: <b>7x + 1</b>.</p><p>Staat er een min voor de haakjes, dan draaien alle tekens erin om: 2(x + 3) − (x + 4) = 2x + 6 − x − 4 = <b>x + 2</b>.</p>',
          wanneer:'er haakjes en losse termen in een uitdrukking staan.',
          maak:function(R){
            var t = R.heel(0, 2), p, q, r, s, m, u, los, vraag, xs, gs;
            do {
              p = nz(R, -6, 6); q = nz(R, -9, 9);
              if (t === 0){ r = nz(R, -8, 8); s = nz(R, -12, 12); xs = p + r; gs = p * q + s; }
              else if (t === 1){ m = R.kies([-1, -1, 2, 3, -2, -3]); u = nz(R, -9, 9); xs = p + m; gs = p * q + m * u; }
              else { m = -1; u = nz(R, -9, 9); r = R.heel(2, 5); xs = p - r; gs = p * q - u; }
            } while (Math.abs(p) < 2 || !xs || !gs);
            var eerst = (p < 0 ? MIN + (-p) : p) + '(x' + pm(q) + ')';
            if (t === 0){ vraag = eerst + ' ' + (r < 0 ? MIN + ' ' + E([[-r, 'x']]) : '+ ' + E([[r, 'x']])) + pm(s); los = [[p, 'x'], [p * q, ''], [r, 'x'], [s, '']]; }
            else if (t === 1){ vraag = eerst + (m === -1 ? ' ' + MIN + ' ' : m < 0 ? ' ' + MIN + ' ' + (-m) : ' + ' + m) + '(x' + pm(u) + ')'; los = [[p, 'x'], [p * q, ''], [m, 'x'], [m * u, '']]; }
            else { vraag = eerst + ' ' + MIN + ' (' + E([[r, 'x'], [u, '']]) + ')'; los = [[p, 'x'], [p * q, ''], [-r, 'x'], [-u, '']]; }
            var losT = E(los), res = E([[xs, 'x'], [gs, '']]), xT = E(los.filter(function(x){ return x[1]; })), gT = E(los.filter(function(x){ return !x[1]; }));
            return { vraag:vraag, context:'Werk de haakjes weg en neem samen.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:[
              SC('Werk de haakjes weg: ' + vraag + ' =', losT, exprC(losT), t === 0 ? T(p) + ' keer x en ' + T(p) + ' keer ' + paren(q) + '. De rest blijft staan.' : 'Bij elk haakje: het getal ervoor keer elke term erin.' + (t === 2 || m < 0 ? ' Een min voor de haakjes draait de tekens om.' : '')),
              SC('Neem de x-termen samen: ' + xT + ' =', E([[xs, 'x']]), exprC(E([[xs, 'x']]), { kaal:true }), 'Tel de getallen voor x op.', F(E([[xs, 'x']]), E([[-xs, 'x']]), 'Let op het teken.')),
              S('Neem de losse getallen samen: ' + gT + ' =', gs, 'Tel de getallen op, met hun teken.', F(gs, -gs, 'Let op het teken.')),
              SC('Samen: ' + vraag + ' =', res, exprC(res, { kaal:true }), 'De x-term en het getal: ' + res + '.') ] };
          } }
      ] },

    /* ================= eenvoudige vergelijkingen ================= */
    { groep:{ id:'wob-a-vgl', niveau:'onderbouw', domein:'algebra', naam:'Eenvoudige vergelijkingen',
        uit:'De eerste vergelijkingen: één bewerking terugdraaien, een pijlenketting met twee bewerkingen, een min voor x en de oplossing controleren. De balansmethode en vergelijkingen met haakjes staan bij Vergelijkingen oplossen.' },
      doelen:[
        { id:'wob-a-vgl-plus', naam:'x + a = b: de omgekeerde bewerking', kort:'Komt er iets bij x? Haal het er weer af. Gaat er iets af? Tel het er weer bij',
          uit:'<p>Bij <b>x + 7 = 3</b> komt er 7 bij x en dan krijg je 3. Om x te vinden, draai je dat <b>om</b>: het <b>omgekeerde</b> van + 7 is − 7.</p><p>x = 3 − 7 = <b>−4</b>. Controle: −4 + 7 = 3. Klopt.</p><p>Bij x − 5 = −2 is het omgekeerde + 5: x = −2 + 5 = <b>3</b>.</p>',
          wanneer:'er maar één plus of min bij x staat.',
          maak:function(R){
            var a = R.heel(2, 15), x = nz(R, -12, 15), vorm = R.heel(0, 2), plus = vorm !== 1, b = plus ? x + a : x - a;
            var op = (plus ? '+ ' : MIN + ' ') + a, io = (plus ? MIN + ' ' : '+ ') + a;
            var vgl = vorm === 0 ? 'x + ' + a + ' = ' + T(b) : vorm === 1 ? 'x ' + MIN + ' ' + a + ' = ' + T(b) : a + ' + x = ' + T(b);
            return { vraag:vgl, context:'Los op.',
              beeld:function(n){ return ketting([n >= 3 ? 'x = ' + T(x) : 'x', T(b)], [op], [io], n >= 2 ? 1 : 0); },
              stappen:[
                K(R, 'Wat gebeurt er met x?', op, [io], vorm === 2 ? a + ' + x is hetzelfde als x + ' + a + ': er komt ' + a + ' bij.' : plus ? 'Er komt ' + a + ' bij x.' : 'Er gaat ' + a + ' van x af.', { orde:['+ ' + a, MIN + ' ' + a] }),
                K(R, 'Wat is het omgekeerde van ' + op + '?', io, [op], plus ? 'Erbij draai je om met eraf.' : 'Eraf draai je om met erbij.', { orde:['+ ' + a, MIN + ' ' + a] }),
                S('Reken terug: x = ' + T(b) + ' ' + io + ' =', eqAnt(x), T(b) + ' ' + io + '.', F(x, plus ? b + a : b - a, 'Je deed hetzelfde als in de vergelijking. Doe het omgekeerde.', -x, 'Let op het teken.')) ] };
          } },
        { id:'wob-a-vgl-keer', naam:'a · x = b: de omgekeerde bewerking', kort:'Staat er 4x = 20? Dan gaat x keer 4. Het omgekeerde is delen door 4',
          uit:'<p><b>4x</b> betekent 4 keer x. Bij <b>4x = −20</b> draai je keer 4 om met <b>delen door 4</b>: x = −20 : 4 = <b>−5</b>.</p><p>Bij −3x = 12 deel je door −3: x = 12 : (−3) = <b>−4</b>. Let op de tekenregels.</p><p>Bij x : 4 = −3 is het andersom: delen draai je om met keer. x = −3 × 4 = <b>−12</b>.</p>',
          wanneer:'x alleen met een getal vermenigvuldigd of gedeeld wordt.',
          maak:function(R){
            var deel = R.heel(0, 3) === 0, a = deel ? R.heel(2, 9) : nz(R, -9, 9), x = nz(R, -12, 12);
            if (Math.abs(a) < 2) a = a < 0 ? -2 : 2;
            var b = deel ? x / a : a * x;
            if (deel){ x = a * nz(R, -9, 9); b = x / a; }
            var op = deel ? ': ' + a : X + ' ' + paren(a), io = deel ? X + ' ' + a : ': ' + paren(a), vgl = deel ? 'x : ' + a + ' = ' + T(b) : E([[a, 'x']]) + ' = ' + T(b);
            var ops = deel ? [op, io, '+ ' + a] : [op, io, (a < 0 ? MIN + ' ' + (-a) : '+ ' + a)];
            return { vraag:vgl, context:'Los op.',
              beeld:function(n){ return ketting([n >= 3 ? 'x = ' + T(x) : 'x', T(b)], [op], [io], n >= 2 ? 1 : 0); },
              stappen:[
                K(R, 'Wat gebeurt er met x?', op, ops.filter(function(o){ return o !== op; }), deel ? 'x wordt gedeeld door ' + a + '.' : E([[a, 'x']]) + ' betekent ' + T(a) + ' keer x.'),
                K(R, 'Wat is het omgekeerde van ' + op + '?', io, ops.filter(function(o){ return o !== io; }), deel ? 'Delen draai je om met keer.' : 'Keer draai je om met delen.'),
                S('Reken terug: x = ' + T(b) + ' ' + io + ' =', eqAnt(x), deel ? T(b) + ' ' + X + ' ' + a + '.' + (b < 0 ? ' Eén min: negatief.' : '') : (x < 0 ? 'Eén min: het antwoord is negatief. ' : (a < 0 ? 'Min gedeeld door min is plus. ' : '')) + Math.abs(b) + ' : ' + Math.abs(a) + ' = ' + Math.abs(x) + '.',
                  F(x, -x, 'Let op het teken.', deel ? b / a : b * a, 'Je deed hetzelfde als in de vergelijking. Doe het omgekeerde.')) ] };
          } },
        { id:'wob-a-vgl-ketting', naam:'Terugrekenen met de pijlenketting', kort:'Zet de bewerkingen in een pijlenketting en reken van achter naar voren terug, met het omgekeerde',
          uit:'<p>Bij <b>3x + 5 = 20</b> gebeuren er twee dingen met x: eerst <b>× 3</b>, dan <b>+ 5</b>. Zet dat in een <b>pijlenketting</b>: x → × 3 → + 5 → 20.</p><p>Reken <b>terug</b>, van achter naar voren, met het omgekeerde: 20 − 5 = 15, en 15 : 3 = 5. Dus <b>x = 5</b>.</p><p>Controle: 3 × 5 + 5 = 20. Klopt. Bij lastiger vergelijkingen, met haakjes of x aan twee kanten, kom je later terug.</p>',
          wanneer:'x er één keer in staat, met een keer en een plus of min.',
          beeld:ketting(['x', '15', '20'], [X + ' 3', '+ 5'], [': 3', MIN + ' 5'], 2),
          maak:function(R){
            var a, b, x, c;
            do { a = R.heel(2, 6); b = nz(R, -15, 15); x = nz(R, -8, 10); c = a * x + b; } while (Math.abs(c) > 60 || !c);
            var o1 = { s:X, n:a }, o2 = plusOp(b), w = [x, a * x, c], vgl = E([[a, 'x'], [b, '']]) + ' = ' + T(c);
            var goed = 'x → ' + opS(o1) + ' → ' + opS(o2) + ' → ' + T(c), mis = 'x → ' + opS(o2) + ' → ' + opS(o1) + ' → ' + T(c);
            return { vraag:vgl, context:'Los op door terug te rekenen.',
              beeld:function(n){
                var vak = [n >= 3 ? 'x = ' + T(x) : 'x', n >= 2 ? T(a * x) : '?', T(c)];
                return ketting(vak, [opS(o1), opS(o2)], [opS(inv(o1)), opS(inv(o2))], Math.max(0, n - 1)); },
              stappen:[
                K(R, 'Welke pijlenketting hoort bij ' + vgl + '?', goed, [mis], 'Eerst gaat x keer ' + a + ': dat is ' + a + 'x. Daarna komt ' + opS(o2) + '.'),
                S('Begin achteraan bij ' + T(c) + '. Het omgekeerde van ' + opS(o2) + ' is ' + opS(inv(o2)) + ': ' + T(c) + ' ' + opS(inv(o2)) + ' =', a * x, T(c) + ' ' + opS(inv(o2)) + '.', F(a * x, c + b, 'Je deed ' + opS(o2) + '. Terug doe je het omgekeerde: ' + opS(inv(o2)) + '.')),
                S('Het omgekeerde van ' + opS(o1) + ' is : ' + a + ': x = ' + T(a * x) + ' : ' + a + ' =', eqAnt(x), T(a * x) + ' : ' + a + '.' + (x < 0 ? ' Eén min: negatief.' : ''), F(x, a * x * a, 'Je deed keer. Terug doe je delen.', -x, 'Let op het teken.')) ] };
          } },
        { id:'wob-a-vgl-minx', naam:'Een min voor x: a − x = b', kort:'Bij 10 − x = 4 haal je x van 10 af en hou je 4 over. Dus x = 10 − 4',
          uit:'<p>Bij <b>10 − x = 4</b> gaat x van 10 af. Wat over blijft is 4.</p><p>Dan is x het stuk dat eraf ging: x = 10 − 4 = <b>6</b>. Het is dus niet 4 + 10.</p><p>Controle: 10 − 6 = 4. Klopt. Ook met negatieve getallen: 3 − x = −5 geeft x = 3 − (−5) = 3 + 5 = <b>8</b>.</p>',
          wanneer:'er min x staat, zoals in 12 − x = 5.',
          maak:function(R){
            var a, x, c; do { a = R.heel(3, 20); x = nz(R, -8, 15); c = a - x; } while (!c || x === a);
            var vgl = a + ' ' + MIN + ' x = ' + T(c), goed = 'x = ' + a + ' ' + MIN + ' ' + paren(c);
            var opties = uniek([goed, 'x = ' + T(c) + ' ' + MIN + ' ' + a, 'x = ' + a + ' + ' + paren(c)]);
            return { vraag:vgl, context:'Los op.', antwoord:eqAnt(x), stappen:[
              K(R, 'Met welke som vind je x?', goed, opties.slice(1), 'Van ' + a + ' gaat x af en er blijft ' + T(c) + ' over. Dan is x wat eraf ging: ' + a + ' ' + MIN + ' ' + paren(c) + '.'),
              S('x = ' + a + ' ' + MIN + ' ' + paren(c) + ' =', eqAnt(x), c < 0 ? 'Min een negatief getal wordt plus: ' + a + ' + ' + (-c) + '.' : a + ' min ' + c + '.', F(x, c - a, 'Andersom: begin bij ' + a + '.', a + c, c < 0 ? 'Min een negatief getal wordt plus.' : 'Je telde op. Je moet ' + c + ' van ' + a + ' afhalen.')),
              S('Controleer: ' + a + ' ' + MIN + ' ' + paren(x) + ' =', c, x < 0 ? 'Min een negatief getal wordt plus: ' + a + ' + ' + (-x) + '.' : a + ' min ' + x + '.') ] };
          } },
        { id:'wob-a-vgl-controle', naam:'De oplossing controleren', kort:'Vul het getal in voor x: komt links hetzelfde uit als rechts, dan is het een oplossing',
          uit:'<p>Of een getal een <b>oplossing</b> is, zie je door het <b>in te vullen</b>.</p><p>Is x = 3 een oplossing van 2x + 5 = 11? Links: 2 × 3 + 5 = 11. Rechts staat 11. Gelijk, dus <b>ja</b>.</p><p>Staat x aan twee kanten, reken dan links en rechts allebei uit. Bij 5x − 2 = 3x + 6 en x = 3: links 13, rechts 15. Niet gelijk, dus <b>nee</b>.</p>',
          wanneer:'je wilt weten of een antwoord klopt, of als er een getal gegeven is.',
          maak:function(R){
            var twee = R.heel(0, 1) === 1, x0 = nz(R, -6, 8), a, b, c, d, e, v, ja = R.heel(0, 1) === 1;
            do { a = R.kies([2, 3, 4, 5, -2, -3]); b = nz(R, -12, 12); c = twee ? R.kies([1, 2, 3, -1, -2]) : 0; } while (a === c);
            e = a * x0 + b - c * x0;
            v = ja ? x0 : R.kies([x0 + 1, x0 - 1, -x0, x0 + 2]);
            if (v === x0) ja = true;
            function inv1(k, m){ return (k === 1 ? T(v) : k === -1 ? MIN + paren(v) : T(k) + ' ' + X + ' ' + paren(v)) + pm(m); }
            var L = a * v + b, Rr = twee ? c * v + e : e, gelijk = L === Rr, vgl = E([[a, 'x'], [b, '']]) + ' = ' + (twee ? E([[c, 'x'], [e, '']]) : T(e));
            var st = [S('Vul x = ' + T(v) + ' in, links: ' + inv1(a, b) + ' =', L, 'Eerst ' + T(a) + ' ' + X + ' ' + paren(v) + ' = ' + T(a * v) + ', dan' + pm(b) + '.', F(L, -L, 'Let op het teken.'))];
            if (twee) st.push(S('En rechts: ' + inv1(c, e) + ' =', Rr, (c === 1 ? 'x is ' + T(v) : c === -1 ? MIN + 'x is ' + T(-v) : 'Eerst ' + T(c) + ' ' + X + ' ' + paren(v) + ' = ' + T(c * v)) + ', dan' + pm(e) + '.', F(Rr, -Rr, 'Let op het teken.')));
            st.push(K(R, 'Is x = ' + T(v) + ' een oplossing van ' + vgl + '?', gelijk ? 'ja' : 'nee', [], 'Links komt ' + T(L) + ' uit en rechts ' + T(Rr) + '. ' + (gelijk ? 'Dat is gelijk, dus ja.' : 'Dat is niet gelijk, dus nee.'), { orde:['ja', 'nee'] }));
            return { vraag:vgl, context:'Is x = ' + T(v) + ' een oplossing? Vul in en controleer.', opties:['ja', 'nee'], goed:gelijk ? 0 : 1, stappen:st };
          } }
      ] },

    /* ================= wetenschappelijke notatie ================= */
    { groep:{ id:'wob-a-sci', niveau:'onderbouw', domein:'algebra', naam:'Machten van 10 en de wetenschappelijke notatie',
        uit:'Machten van 10, ook met een negatieve exponent, en heel grote en heel kleine getallen kort opschrijven als een getal tussen 1 en 10 keer een macht van 10. Heen en terug.' },
      doelen:[
        { id:'wob-a-sci-tien', naam:'Machten van 10', kort:'10⁵ is een 1 met 5 nullen. 10⁻³ is 0,001: de 1 staat op de derde plek achter de komma',
          uit:'<p>Bij een <b>macht van 10</b> zegt de exponent hoeveel <b>nullen</b> er achter de 1 komen: 10⁵ = <b>100.000</b>.</p><p>Een <b>negatieve exponent</b> maakt het getal klein, niet negatief. 10⁻³ = <b>0,001</b>: de 1 staat op de derde plek achter de komma. 10⁻¹ = 0,1 en 10⁻² = 0,01.</p><p>Andersom: 1.000.000 heeft 6 nullen, dus 1.000.000 = <b>10⁶</b>. En 0,0001 = <b>10⁻⁴</b>.</p>',
          wanneer:'je met heel grote of heel kleine getallen werkt.',
          maak:function(R){
            var t = R.heel(0, 3), e = t % 2 === 0 ? R.heel(2, 7) : -R.heel(1, 5), k = Math.abs(e);
            var waarde = e > 0 ? T(macht(10, e)) : '0,' + nullen(k - 1) + '1', mac = '10' + sup(e), typ = '10^' + T(e).replace(MIN, '-');
            if (t < 2){
              return { vraag:mac + ' =', context:'Schrijf als gewoon getal.', stappen:e > 0 ? [
                  S('Hoeveel nullen komen er achter de 1?', k, 'De exponent is ' + k + ', dus ' + k + ' nullen.'),
                  S(mac + ' =', waarde, 'Een 1 met ' + k + ' nullen.', F(waarde, 10 * k, 'Een macht is geen keer: 10 ' + X + ' ' + k + ' is iets anders.')) ] : [
                  S('De exponent is negatief. Op welke plek achter de komma komt de 1?', k, 'De exponent is ' + T(e) + ', dus de 1 staat op plek ' + k + ' achter de komma.'),
                  S(mac + ' =', waarde, '0, dan ' + (k - 1) + ' nul' + (k - 1 === 1 ? '' : 'len') + ' en dan de 1: ' + waarde + '.', F(waarde, -macht(10, k), 'Een negatieve exponent maakt het getal niet negatief, maar klein.', T(macht(10, k)), 'Een negatieve exponent maakt het getal klein: kleiner dan 1.')) ] };
            }
            return { vraag:waarde + ' = 10^?', vraagHtml:Sch(waarde) + ' = 10<sup>?</sup>', context:'Schrijf als macht van 10. Typ bijvoorbeeld ' + (e > 0 ? '10^4' : '10^-4') + '.', antwoord:mac, controle:tienC(e), invoer:'tekst', stappen:e > 0 ? [
                S('Hoeveel nullen staan er achter de 1?', k, 'Tel de nullen in ' + waarde + '.'),
                SC('Dus ' + waarde + ' =', mac, tienC(e), k + ' nullen: 10 tot de macht ' + k + '. Typ ' + typ + '.') ] : [
                S('Op welke plek achter de komma staat de 1?', k, 'Tel vanaf de komma: ' + waarde + '.', F(k, k - 1, 'Tel ook de plek van de 1 zelf mee.')),
                SC('Dus ' + waarde + ' =', mac, tienC(e), 'Plek ' + k + ' achter de komma: de exponent is ' + T(e) + '. Typ ' + typ + '.', F(mac, '10^' + k, 'Een getal kleiner dan 1 krijgt een negatieve exponent.')) ] };
          } },
        { id:'wob-a-sci-groot', naam:'Een groot getal in wetenschappelijke notatie', kort:'Zet de komma achter het eerste cijfer en tel hoeveel plaatsen hij opschuift: 45.000 = 4,5 × 10⁴',
          uit:'<p>In de <b>wetenschappelijke notatie</b> schrijf je een getal als een getal <b>tussen 1 en 10</b> keer een <b>macht van 10</b>.</p><p>4.500.000: zet de komma achter het eerste cijfer, dan krijg je 4,5. De komma schuift daarvoor <b>6 plaatsen</b> naar links. Dus 4.500.000 = <b>4,5 × 10⁶</b>.</p><p>Typ het antwoord als 4,5 × 10^6.</p>',
          wanneer:'een getal heel groot is, met veel nullen.',
          beeld:kommaBeeld('4500000', 7, 1, { doel:true, bogen:true }),
          maak:function(R){
            var len = R.kies([1, 2, 2, 3]), d = String(R.heel(1, 9));
            for (var i = 1; i < len; i++) d += String(i === len - 1 ? R.heel(1, 9) : R.heel(0, 9));
            var e = R.heel(Math.max(3, len), 9), N = parseInt(d, 10) * macht(10, e - (len - 1)), m = parseFloat(d.charAt(0) + '.' + (d.slice(1) || '0'));
            var ds = String(N), ant = T(m) + ' × 10' + sup(e), nul = e - (len - 1);
            return { vraag:T(N), context:'Schrijf in de wetenschappelijke notatie.', antwoord:ant, controle:sciC(m, e), invoer:'tekst',
              beeld:function(n){ return kommaBeeld(ds, ds.length, 1, { doel:n >= 1, bogen:n >= 2 }); },
              stappen:[
                S('Zet de komma achter het eerste cijfer. Welk getal tussen 1 en 10 krijg je?', m, 'Het eerste cijfer is ' + d.charAt(0) + '. ' + (len > 1 ? 'De cijfers ' + d.slice(1) + ' komen achter de komma: ' + T(m) + '. De nullen op het eind laat je weg.' : 'De nullen erachter laat je weg: ' + T(m) + '.'), F(m, parseInt(d, 10), 'Dat ligt niet tussen 1 en 10. Zet de komma achter het eerste cijfer.')),
                S('Hoeveel plaatsen schuift de komma naar links?', e, 'Tel de cijfers achter het eerste cijfer: dat zijn er ' + e + '.', F(e, e + 1, 'Je telde het eerste cijfer mee. Tel alleen de cijfers erachter.', nul !== e ? nul : e + 1, 'Je telde alleen de nullen. Tel alle cijfers achter het eerste cijfer.')),
                SC('Dus ' + T(N) + ' =', ant, sciC(m, e), T(m) + ' keer 10 tot de macht ' + e + '. Typ ' + T(m) + ' × 10^' + e + '.') ] };
          } },
        { id:'wob-a-sci-klein', naam:'Een klein getal in wetenschappelijke notatie', kort:'Zet de komma achter het eerste cijfer dat geen nul is; schuift hij naar rechts, dan is de exponent negatief',
          uit:'<p>Ook <b>kleine getallen</b> schrijf je als een getal tussen 1 en 10 keer een macht van 10.</p><p>0,00032: zet de komma achter de 3, het eerste cijfer dat geen nul is. Dan krijg je 3,2. De komma schuift <b>4 plaatsen naar rechts</b>.</p><p>Bij een getal kleiner dan 1 is de exponent <b>negatief</b>: 0,00032 = <b>3,2 × 10⁻⁴</b>. Typ het als 3,2 × 10^-4.</p>',
          wanneer:'een getal heel klein is, met veel nullen achter de komma.',
          beeld:kommaBeeld('000032', 1, 5, { doel:true, bogen:true }),
          maak:function(R){
            var len = R.kies([1, 2, 2, 3]), d = String(R.heel(1, 9));
            for (var i = 1; i < len; i++) d += String(i === len - 1 ? R.heel(1, 9) : R.heel(0, 9));
            var k = R.heel(2, 7), getal = '0,' + nullen(k - 1) + d, m = parseFloat(d.charAt(0) + '.' + (d.slice(1) || '0')), ant = T(m) + ' × 10' + sup(-k);
            var ds = '0' + nullen(k - 1) + d;
            return { vraag:getal, context:'Schrijf in de wetenschappelijke notatie.', antwoord:ant, controle:sciC(m, -k), invoer:'tekst',
              beeld:function(n){ return kommaBeeld(ds, 1, k + 1, { doel:n >= 1, bogen:n >= 2 }); },
              stappen:[
                S('Zet de komma achter het eerste cijfer dat geen nul is. Welk getal tussen 1 en 10 krijg je?', m, 'Het eerste cijfer dat geen nul is, is de ' + d.charAt(0) + '. ' + (len > 1 ? 'Daarachter komt ' + d.slice(1) + ': ' + T(m) + '.' : 'Dus ' + T(m) + '.'), F(m, parseInt(d, 10), 'Dat ligt niet tussen 1 en 10. Zet de komma achter het eerste cijfer.')),
                S('Hoeveel plaatsen schuift de komma naar rechts?', k, 'Tel vanaf de komma tot en met de ' + d.charAt(0) + ': dat zijn ' + k + ' plaatsen.', F(k, k - 1, 'Tel de ' + d.charAt(0) + ' zelf ook mee.')),
                SC('Het getal is kleiner dan 1, dus de exponent is negatief. ' + getal + ' =', ant, sciC(m, -k), T(m) + ' keer 10 tot de macht ' + MIN + k + '. Typ ' + T(m) + ' × 10^-' + k + '.', F(ant, T(m) + ' × 10^' + k, 'Een getal kleiner dan 1 krijgt een negatieve exponent.', T(m) + '×10^' + k, 'Een getal kleiner dan 1 krijgt een negatieve exponent.')) ] };
          } },
        { id:'wob-a-sci-terug', naam:'Terug naar een gewoon getal', kort:'Positieve exponent: de komma schuift naar rechts. Negatieve exponent: naar links',
          uit:'<p>Van de wetenschappelijke notatie terug naar een gewoon getal: <b>schuif de komma</b> zoveel plaatsen als de exponent zegt.</p><p>3,2 × 10⁵: de exponent is positief, dus de komma gaat <b>5 plaatsen naar rechts</b>. Vul aan met nullen: <b>320.000</b>.</p><p>7,5 × 10⁻³: de exponent is negatief, dus de komma gaat <b>3 plaatsen naar links</b>: <b>0,0075</b>.</p>',
          wanneer:'je wilt zien hoe groot of hoe klein een getal echt is.',
          maak:function(R){
            var len = R.kies([1, 2, 2, 3]), d = String(R.heel(1, 9));
            for (var i = 1; i < len; i++) d += String(i === len - 1 ? R.heel(1, 9) : R.heel(0, 9));
            var groot = R.heel(0, 1) === 1, e = groot ? R.heel(Math.max(3, len), 8) : -R.heel(2, 6), k = Math.abs(e), m = parseFloat(d.charAt(0) + '.' + (d.slice(1) || '0'));
            var waarde = groot ? T(parseInt(d, 10) * macht(10, e - (len - 1))) : '0,' + nullen(k - 1) + d;
            var fout = groot ? '0,' + nullen(k - 1) + d : T(parseInt(d, 10) * macht(10, k - (len - 1)));
            var RE = 'naar rechts: het getal wordt groot', LI = 'naar links: het getal wordt klein';
            var dsVoor = d, dsNa = groot ? String(parseInt(d, 10) * macht(10, e - (len - 1))) : '0' + nullen(k - 1) + d;
            return { vraag:T(m) + ' × 10' + sup(e) + ' =', context:'Schrijf als gewoon getal.',
              beeld:function(n){ return n < 2 ? kommaBeeld(dsVoor, 1, 1, {}) : groot ? kommaBeeld(dsNa, 1, k + 1, { doel:true, bogen:true, grijs:len }) : kommaBeeld(dsNa, k + 1, 1, { doel:true, bogen:true, grijs:0 }); },
              stappen:[
                K(R, 'De exponent is ' + T(e) + '. Welke kant schuift de komma op?', groot ? RE : LI, [], groot ? 'Een positieve exponent maakt het getal groot: de komma gaat naar rechts.' : 'Een negatieve exponent maakt het getal klein: de komma gaat naar links.', { orde:[RE, LI] }),
                S('Hoeveel plaatsen schuift de komma op?', k, 'Zoveel als de exponent zegt, zonder het minteken: ' + k + '.'),
                S('Schuif de komma ' + k + ' plaatsen ' + (groot ? 'naar rechts en vul aan met nullen' : 'naar links en zet er nullen voor') + '. ' + T(m) + ' × 10' + sup(e) + ' =', waarde, groot ? 'Na de komma staan ' + (len - 1) + ' cijfer' + (len - 1 === 1 ? '' : 's') + '. Er ' + (k - (len - 1) === 1 ? 'komt nog 1 nul' : 'komen nog ' + (k - (len - 1)) + ' nullen') + ' bij.' : 'De ' + d.charAt(0) + ' komt op plek ' + k + ' achter de komma.',
                  F(waarde, fout, 'Je schoof de verkeerde kant op.')) ] };
          } }
      ] }
  ]);
})();
