/* De leerroute rekenen: patronen, vergelijkingen, lineaire verbanden, rekenen met letters
   en een rekenprobleem aanpakken (het stappenplan en de rekenmachine). Elke manier een eigen doel.
   Woordformules en de pijlenketting bij formules staan in rekenen-meten.js (form-basis, form-om).
   Zie leerroute.js voor het formaat. */
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
  /* een invulstap met een eigen controle (formules, vergelijkingen) */
  function SC(tekst, ant, controle, hint, fout){ var s = S(tekst, ant, hint, fout); s.controle = controle; s.invoer = 'tekst'; return s; }
  /* een keuzestap; o.orde houdt een vaste volgorde */
  function K(R, tekst, goed, fout, hint, o){
    o = o || {};
    var l = o.orde ? o.orde.map(String) : R.hussel(uniek([goed].concat(fout || [])));
    var s = { tekst:tekst, opties:l, goed:l.indexOf(String(goed)), hint:hint };
    if (o.waarom) s.waarom = o.waarom;
    return s;
  }
  function eindKeuze(op){ var l = op.stappen[op.stappen.length - 1]; op.opties = l.opties; op.goed = l.goed; return op; }
  /* foutmeldingen: F(goed, fout1, uitleg1, ...); ook zonder spaties en met een gewoon minteken */
  function varianten(k){ k = String(k).toLowerCase().trim(); var a = k.replace(/−/g, '-'); return uniek([k, k.replace(/\s+/g, ''), a, a.replace(/\s+/g, '')]); }
  function F(goed){
    var o = {}, g = varianten(typeof goed === 'number' ? T(goed) : goed);
    for (var i = 1; i + 1 < arguments.length; i += 2){
      var uitleg = arguments[i + 1], k = arguments[i];
      varianten(typeof k === 'number' ? T(k) : k).forEach(function(v){ if (g.indexOf(v) < 0 && !(v in o)) o[v] = uitleg; });
    }
    return o;
  }
  function g2(x){ return T(x, { dec:2, vast:true }); }
  function G(x){ return '€ ' + g2(x); }
  function Gk(x){ return G(x).replace(',00', ''); }
  function metE(x, e, ook){
    x = typeof x === 'number' ? T(x) : String(x);
    var uit = [x];
    [e].concat(ook || []).forEach(function(eh){ if (eh) uit.push(x + ' ' + eh, x + eh); });
    return uniek(uit);
  }
  /* alleen goed met de eenheid erbij */
  function metEMoet(x, e, ook){ return metE(x, e, ook).slice(1); }
  function paren(n){ return n < 0 ? '(' + T(n) + ')' : T(n); }
  function pm(p, q){ return T(p) + (q < 0 ? ' − ' + T(-q) : ' + ' + T(q)); }
  function ggd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  function mooi(max){ var l = [1, 2, 5, 10, 20, 25, 50, 100, 200]; for (var i = 0; i < l.length; i++) if (max / l[i] <= 10) return l[i]; return 500; }
  function boven(max, st){ return Math.max(st, Math.ceil(max / st) * st); }
  /* een uitdrukking: E([[3,'x'],[-4,'']]) = '3x − 4' */
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

  /* ---------- uitdrukkingen lezen: een veelterm als { '':4, x:3, xx:1 } ---------- */
  function pPlus(p, q){ var r = {}, k; for (k in p) r[k] = (r[k] || 0) + p[k]; for (k in q) r[k] = (r[k] || 0) + q[k]; return r; }
  function pSchaal(p, c){ var r = {}; for (var k in p) r[k] = p[k] * c; return r; }
  function pMaal(p, q){ var r = {}; for (var a in p) for (var b in q){ var k = (a + b).split('').sort().join(''); r[k] = (r[k] || 0) + p[a] * q[b]; } return r; }
  function pConst(p){ for (var k in p) if (k && Math.abs(p[k]) > 1e-12) return null; return p[''] || 0; }
  function pGelijk(p, q){ var k; for (k in p) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; for (k in q) if (Math.abs((p[k] || 0) - (q[k] || 0)) > 1e-9) return false; return true; }
  function pLetters(p){ var l = []; for (var k in p) if (Math.abs(p[k]) > 1e-12) k.split('').forEach(function(c){ if (l.indexOf(c) < 0) l.push(c); }); return l; }
  function pHernoem(p, van, naar){ var r = {}; for (var k in p){ var n = k.split(van).join(naar).split('').sort().join(''); r[n] = (r[n] || 0) + p[k]; } return r; }
  function norm(t){ return String(t == null ? '' : t).toLowerCase().replace(/[−–—]/g, '-').replace(/[×·*]/g, '*').replace(/:/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').replace(/,/g, '.').replace(/\s+/g, ''); }
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
      if (k.length !== 1 || gezien[k[0]]) return false;
      gezien[k[0]] = 1;
    }
    return true;
  }
  function exprC(verwacht, o){
    o = o || {}; var q = lees(verwacht);
    return function(v){ var t = String(v).trim().replace(/^=/, ''), p = lees(t); if (!p || !pGelijk(p, q)) return false; return o.kaal ? kaal(t) : true; };
  }
  /* een vergelijking: goed als links min rechts hetzelfde is (of precies andersom); een andere letter mag */
  function eqC(eq){
    var d = eq.split('='), q = pPlus(lees(d[0]), pSchaal(lees(d[1]), -1)), vq = pLetters(q);
    return function(v){
      var e = String(v).split('='); if (e.length !== 2) return false;
      var a = lees(e[0]), b = lees(e[1]); if (!a || !b) return false;
      var p = pPlus(a, pSchaal(b, -1)), vp = pLetters(p);
      if (vq.length === 1 && vp.length === 1 && vp[0] !== vq[0]) p = pHernoem(p, vp[0], vq[0]);
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
  /* buiten haakjes: 3(2x + 3), met precies deze factor */
  function buitenC(f, binnen){
    var F0 = lees(f), I0 = lees(binnen);
    return function(v){ var s = norm(v), m = /^(.+?)\*?\((.+)\)$/.exec(s); if (!m) return false; var a = lees(m[1]), b = lees(m[2]); return !!a && !!b && pGelijk(a, F0) && pGelijk(b, I0); };
  }
  function puntC(x, y){
    return function(v){
      var s = String(v).replace(/[\s()]/g, '').replace(/[−–—]/g, '-'), d = s.split(/[;,]/);
      if (d.length !== 2 || !/^-?\d+$/.test(d[0]) || !/^-?\d+$/.test(d[1])) return false;
      return +d[0] === x && +d[1] === y;
    };
  }
  function punt(x, y){ return '(' + T(x) + ', ' + T(y) + ')'; }
  function duurC(min){
    return function(v){
      var s = String(v).toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ').trim(), r;
      if ((r = /^(\d+) ?(uur|u|h) ?(en ?)?(\d+) ?(minuten|minuut|min|m)?$/.exec(s))) return +r[1] * 60 + +r[4] === min;
      if ((r = /^(\d+):(\d\d)$/.exec(s))) return +r[1] * 60 + +r[2] === min;
      if ((r = /^(\d+(?:\.\d+)?) ?(minuten|min)$/.exec(s))) return Math.abs(+r[1] - min) < 1e-9;
      if ((r = /^(\d*\.?\d+) ?(uur|u)?$/.exec(s))) return Math.abs(+r[1] * 60 - min) < 1e-6;
      return false;
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
  function rc(x, y, w, h, o){ o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + (o.rx || 0) + '" style="fill:' + (o.f || 'var(--kaart)') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w == null ? 2 : o.w) + (o.dash ? ';stroke-dasharray:' + o.dash : '') + (o.op != null ? ';opacity:' + o.op : '') + '"/>'; }
  function cirkel(x, y, r, k, o){ o = o || {}; return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '" style="fill:' + k + (o.s ? ';stroke:' + o.s + ';stroke-width:' + (o.w || 2) : '') + (o.op != null ? ';opacity:' + o.op : '') + '"/>'; }
  /* een boog met pijlpunt van x1 naar x2, boven of onder y */
  function boog(x1, x2, y, omhoog, kleur, label, h){
    var mid = (x1 + x2) / 2, d = omhoog ? -1 : 1, r = x2 > x1 ? -1 : 1;
    return '<path d="M' + n1(x1) + ' ' + n1(y) + ' Q' + n1(mid) + ' ' + n1(y + d * h * 1.6) + ' ' + n1(x2) + ' ' + n1(y) + '" style="fill:none;stroke:' + kleur + ';stroke-width:2.6;stroke-linecap:round"/>' +
      '<path d="M' + n1(x2) + ' ' + n1(y) + ' l' + (r * 8) + ' ' + (d * 8) + ' M' + n1(x2) + ' ' + n1(y) + ' l' + (r * 1.5) + ' ' + (d * 11) + '" style="fill:none;stroke:' + kleur + ';stroke-width:2.6;stroke-linecap:round"/>' +
      (label ? tx(mid, y + d * h * 0.8 + (omhoog ? -7 : 17), label, { k:kleur, vet:true }) : '');
  }
  function stapel(){ return '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">' + Array.prototype.slice.call(arguments).filter(Boolean).map(function(x){ return /^<svg/.test(x) ? '<div style="width:100%;max-width:620px">' + x + '</div>' : x; }).join('') + '</div>'; }

  /* een rij getallen in vakjes, met bogen ertussen: bogen = [{ van, naar, tekst, k }] */
  function rijBeeld(items, bogen, o){
    o = o || {};
    var lang = Math.max.apply(null, items.map(function(t){ return (typeof t === 'number' ? T(t) : String(t)).length; }));
    var n = items.length, bw = Math.max(62, lang * 10 + 16), gap = 24, x0 = 12, y = o.y || 80, bh = 42, s = '';
    function cx(i){ return x0 + i * (bw + gap) + bw / 2; }
    (bogen || []).forEach(function(b){ var x1 = cx(b.van) + 6, x2 = cx(b.naar) - 6, h = Math.min(o.y ? 66 : 36, 14 + (x2 - x1) * 0.14); s += boog(x1, x2, y - 3, true, KL[b.k || 0], b.tekst, h); });
    items.forEach(function(t, i){
      var x = x0 + i * (bw + gap), t2 = typeof t === 'number' ? T(t) : String(t);
      if (t2 === '…'){ s += tx(x + bw / 2, y + 28, '…', { m:'groot' }); return; }
      var vr = t2 === '?';
      s += rc(x, y, bw, bh, { rx:10, s:vr ? 'var(--lr-2)' : 'var(--ink)', dash:vr ? '5 4' : '' }) + tx(x + bw / 2, y + 28, t2, { m:t2.length > 6 ? '' : 'groot', k:vr ? 'var(--lr-2)' : '' });
    });
    if (o.onder) o.onder.forEach(function(t, i){ if (t) s += tx(cx(i), y + bh + 22, t, { m:'klein' }); });
    var W = x0 * 2 + n * bw + (n - 1) * gap;
    return svg(W, y + bh + (o.onder ? 32 : 8), s, o.aria || 'een rij getallen', 640);
  }
  function bg(van, tekst, k){ return { van:van, naar:van + 1, tekst:tekst, k:k || 0 }; }

  /* ---------- figuurrijen: lucifers en stippen ---------- */
  var LUC = 30, STIP = 16;
  function luc(x1, y1, x2, y2){
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L * 3, uy = dy / L * 3;
    return '<line x1="' + n1(x1 + ux) + '" y1="' + n1(y1 + uy) + '" x2="' + n1(x2 - ux) + '" y2="' + n1(y2 - uy) + '" style="stroke:var(--lr-3);stroke-width:4.5;stroke-linecap:round"/>' +
      cirkel(x2 - ux * 1.3, y2 - uy * 1.3, 3.6, 'var(--lr-2)');
  }
  function stip(x, y){ return cirkel(x, y, 5.2, 'var(--lr-1)'); }
  function fig(type, k){
    var s = '', w = 0, h = 0, p = 7, i, j, pt = [];
    if (type === 'vierkanten'){
      for (i = 0; i < k; i++) s += luc(p + i * LUC, p, p + (i + 1) * LUC, p) + luc(p + i * LUC, p + LUC, p + (i + 1) * LUC, p + LUC);
      for (i = 0; i <= k; i++) s += luc(p + i * LUC, p + LUC, p + i * LUC, p);
      w = k * LUC; h = LUC;
    } else if (type === 'driehoeken'){
      var hh = 26;
      for (i = 0; i < k; i++){ var m = Math.floor(i / 2); s += i % 2 === 0 ? luc(p + m * LUC, p + hh, p + (m + 1) * LUC, p + hh) : luc(p + m * LUC + LUC / 2, p, p + (m + 1) * LUC + LUC / 2, p); }
      for (j = 0; j <= k; j++){ var mm = Math.floor(j / 2); s += j % 2 === 0 ? luc(p + mm * LUC, p + hh, p + mm * LUC + LUC / 2, p) : luc(p + mm * LUC + LUC / 2, p, p + (mm + 1) * LUC, p + hh); }
      w = (k + 1) * LUC / 2; h = hh;
    } else if (type === 'huisjes'){
      var dak = 26;
      for (i = 0; i < k; i++){
        var x = p + i * LUC;
        s += luc(x, p + dak + LUC, x + LUC, p + dak + LUC) + luc(x, p + dak, x + LUC, p + dak) + luc(x, p + dak, x + LUC / 2, p) + luc(x + LUC / 2, p, x + LUC, p + dak);
      }
      for (i = 0; i <= k; i++) s += luc(p + i * LUC, p + dak + LUC, p + i * LUC, p + dak);
      w = k * LUC; h = dak + LUC;
    } else {
      if (type === 'L'){ for (j = 0; j <= k; j++) pt.push([0, j]); for (i = 1; i <= k; i++) pt.push([i, k]); }
      else if (type === 'kruis'){ pt.push([k, k]); for (j = 1; j <= k; j++) pt.push([k - j, k], [k + j, k], [k, k - j], [k, k + j]); }
      else if (type === 'tweerij'){ for (j = 0; j <= k; j++) pt.push([j, 0], [j, 1]); }
      else if (type === 'kwadraat'){ for (i = 0; i < k; i++) for (j = 0; j < k; j++) pt.push([i, j]); }
      else if (type === 'driehoek'){ for (i = 0; i < k; i++) for (j = 0; j <= i; j++) pt.push([j - i / 2 + (k - 1) / 2, i]); }
      pt.forEach(function(q){ s += stip(p + q[0] * STIP, p + q[1] * STIP); w = Math.max(w, q[0] * STIP); h = Math.max(h, q[1] * STIP); });
    }
    return { s:s, w:w + 2 * p, h:h + 2 * p };
  }
  function aantal(type, k){ return { vierkanten:3 * k + 1, driehoeken:2 * k + 1, huisjes:5 * k + 1, L:2 * k + 1, kruis:4 * k + 1, tweerij:2 * k + 2, kwadraat:k * k, driehoek:k * (k + 1) / 2 }[type]; }
  function figuren(type, ks){
    var f = ks.map(function(k){ return fig(type, k); }), mh = Math.max.apply(null, f.map(function(x){ return x.h; })), gap = 30, x = 10, s = '';
    f.forEach(function(g, i){
      var vak = Math.max(g.w, 64);
      s += '<g transform="translate(' + n1(x + (vak - g.w) / 2) + ' ' + n1(8 + mh - g.h) + ')">' + g.s + '</g>' + tx(x + vak / 2, mh + 34, 'figuur ' + ks[i], { m:'klein' });
      x += vak + gap;
    });
    var W = x - gap + 10;
    return svg(W, mh + 44, s, 'figuur ' + ks.join(', '), Math.min(640, Math.round(W * 1.7)));
  }
  var LIN = [
    { id:'vierkanten', wat:'lucifers', enk:'lucifer', a:3, c:1 }, { id:'driehoeken', wat:'lucifers', enk:'lucifer', a:2, c:1 },
    { id:'huisjes', wat:'lucifers', enk:'lucifer', a:5, c:1 }, { id:'L', wat:'stippen', enk:'stip', a:2, c:1 },
    { id:'kruis', wat:'stippen', enk:'stip', a:4, c:1 }, { id:'tweerij', wat:'stippen', enk:'stip', a:2, c:2 } ];

  /* ---------- de balans: zakjes x en losse blokjes ---------- */
  function kant(Kt, x0){
    var s = '', i, nx = Kt.x || 0, wx = Kt.wx || 0, nb = Kt.b || 0, wb = Kt.wb || 0;
    for (i = 0; i < nx; i++){
      var x = x0 + 10 + i * 34, weg = i >= nx - wx;
      s += '<g' + (weg ? ' style="opacity:.25"' : '') + '>' + rc(x, 104, 28, 34, { rx:8, f:'var(--lr-1)', fo:0.25, s:'var(--lr-1)', w:2 }) + tx(x + 14, 127, 'x', { vet:true }) + '</g>';
      if (weg) s += ln(x + 2, 106, x + 26, 136, { k:KL[1], w:2.5 });
    }
    var basis = nx ? 100 : 136;
    if (nb <= 36){
      for (i = 0; i < nb; i++){
        var bx = x0 + 10 + (i % 12) * 17, by = basis - 15 - Math.floor(i / 12) * 17, w2 = i >= nb - wb;
        s += rc(bx, by, 15, 15, { rx:2, f:'var(--lr-3)', fo:0.85, w:1, op:w2 ? 0.22 : null });
        if (w2) s += ln(bx, by, bx + 15, by + 15, { k:KL[1], w:2 });
      }
    } else {
      var rest = nb - wb;
      s += rc(x0 + 20, basis - 32, 170, 30, { rx:4, f:'var(--lr-3)', fo:0.6, w:1.5 }) + tx(x0 + 105, basis - 11, rest + ' blokjes', { m:'klein', vet:true });
      if (wb) s += '<g style="opacity:.3">' + rc(x0 + 20, basis - 64, 170, 30, { rx:4, f:'var(--lr-3)', fo:0.6, w:1.5 }) + tx(x0 + 105, basis - 43, wb + ' blokjes', { m:'klein' }) + '</g>' + ln(x0 + 22, basis - 62, x0 + 188, basis - 36, { k:KL[1], w:2.5 });
    }
    return s;
  }
  function balans(L, Rr, o){
    o = o || {};
    var s = '<path d="M290 152 L262 204 L318 204 Z" style="fill:var(--kaart2);stroke:var(--ink);stroke-width:2"/>' + ln(60, 152, 520, 152, { w:4 }) +
      rc(40, 140, 220, 10, { f:'var(--kaart2)', rx:4 }) + rc(320, 140, 220, 10, { f:'var(--kaart2)', rx:4 }) + kant(L, 40) + kant(Rr, 320);
    if (o.tekst) s += tx(150, 182, o.tekst[0], { m:'groot' }) + tx(430, 182, o.tekst[1], { m:'groot' });
    return svg(580, 212, s, 'een balans in evenwicht', 560);
  }

  /* ---------- een assenstelsel met rechte lijnen ---------- */
  function graf(o){
    var x0 = 58, y0 = 24, pw = 460, ph = 236, xmax = o.xmax, ymin = o.ymin || 0, ymax = o.ymax, ys = o.ystap, s = '';
    function X(x){ return x0 + x / xmax * pw; }
    function Y(y){ return y0 + ph - (y - ymin) / (ymax - ymin) * ph; }
    var nY = Math.round((ymax - ymin) / ys), elk = nY > 12 ? 2 : 1;
    for (var x = 0; x <= xmax; x++){ s += ln(X(x), Y(ymin), X(x), Y(ymax), { w:1, op:0.22 }) + tx(X(x), Y(ymin) + 20, String(x), { m:'klein' }); }
    for (var j = 0; j <= nY; j++){ var yv = ymin + j * ys; s += ln(X(0), Y(yv), X(xmax), Y(yv), { w:1, op:0.22 }); if (j % elk === 0) s += tx(X(0) - 8, Y(yv) + 5, T(yv), { m:'klein', a:'end' }); }
    s += ln(X(0), Y(ymin), X(xmax) + 14, Y(ymin)) + ln(X(0), Y(ymin), X(0), Y(ymax) - 14);
    s += tx(X(xmax) + 14, Y(ymin) + 40, o.xnaam || 'x', { m:'klein', a:'end' }) + tx(X(0) + 8, y0 - 6, o.ynaam || 'y', { m:'klein', a:'start' });
    (o.lijnen || []).forEach(function(l){
      var xa = 0, xb = xmax;
      if (l.a !== 0){ var p1 = (ymin - l.b) / l.a, p2 = (ymax - l.b) / l.a; xa = Math.max(0, Math.min(p1, p2)); xb = Math.min(xmax, Math.max(p1, p2)); }
      if (xb <= xa) return;
      s += ln(X(xa), Y(l.a * xa + l.b), X(xb), Y(l.a * xb + l.b), { k:KL[l.k || 0], w:3.5 });
      if (l.naam) s += tx(X(xb) - 6, Y(l.a * xb + l.b) + (l.a >= 0 ? -10 : -12), l.naam, { k:KL[l.k || 0], vet:true, a:'end' });
    });
    (o.trap || []).forEach(function(t){
      s += ln(X(t.x1), Y(t.y1), X(t.x2), Y(t.y1), { k:KL[1], w:2.5, dash:'6 4' }) + ln(X(t.x2), Y(t.y1), X(t.x2), Y(t.y2), { k:KL[1], w:2.5, dash:'6 4' });
      if (t.dx) s += tx((X(t.x1) + X(t.x2)) / 2, Y(t.y1) + (t.y2 >= t.y1 ? 18 : -8), t.dx, { k:KL[1], vet:true, m:'klein' });
      if (t.dy) s += tx(X(t.x2) + 8, (Y(t.y1) + Y(t.y2)) / 2 + 5, t.dy, { k:KL[1], vet:true, m:'klein', a:'start' });
    });
    (o.punten || []).forEach(function(p){ s += cirkel(X(p.x), Y(p.y), 6.5, KL[p.k || 1], { s:'var(--kaart)', w:2 }); if (p.label) s += tx(X(p.x) + 10, Y(p.y) - 10, p.label, { m:'klein', vet:true, a:'start' }); });
    return svg(560, 314, s, o.aria || 'grafiek met een rechte lijn', 600);
  }

  /* ---------- de pijlenketting heen en terug ---------- */
  function ketting(vak, ops, terug, nT){
    var m = vak.length, bw = 84, gap = 70, x0 = 10, y = 64, bh = 42, s = '';
    function cx(i){ return x0 + i * (bw + gap) + bw / 2; }
    vak.forEach(function(t, i){ var x = x0 + i * (bw + gap), v = String(t) === '?'; s += rc(x, y, bw, bh, { rx:10, s:v ? 'var(--lr-2)' : 'var(--ink)', dash:v ? '5 4' : '' }) + tx(x + bw / 2, y + 28, String(t), { m:'groot', k:v ? 'var(--lr-2)' : '' }); });
    ops.forEach(function(o, i){ s += boog(cx(i) + 18, cx(i + 1) - 18, y - 3, true, KL[0], o, 22); });
    terug.forEach(function(o, i){ if (i >= m - 1 - nT) s += boog(cx(i + 1) - 18, cx(i) + 18, y + bh + 3, false, KL[1], o, 22); });
    return svg(x0 * 2 + m * bw + (m - 1) * gap, 172, s, 'pijlenketting heen en terug', 560);
  }
  function opS(o){ return o[0] + ' ' + T(o[1]); }
  function omgekeerd(o){ return [{ '+':'−', '−':'+', '×':':', ':':'×' }[o[0]], o[1]]; }
  function doe(v, o){ return o[0] === '+' ? v + o[1] : o[0] === '−' ? v - o[1] : o[0] === '×' ? v * o[1] : v / o[1]; }

  /* ---------- hekken, planken en rondjes ---------- */
  function palen(soort, st, n, lab){
    var s = '', i;
    if (soort === 'hek'){
      var L = 40, Rr = 520, dx = (Rr - L) / st;
      s += ln(L - 16, 124, Rr + 16, 124) + ln(L, 80, Rr, 80, { k:KL[2], w:5 }) + ln(L, 104, Rr, 104, { k:KL[2], w:5 });
      for (i = 0; i <= st; i++){ s += rc(L + i * dx - 4, 62, 8, 62, { f:KL[0], w:1.5, rx:2 }); if (n >= 2) s += tx(L + i * dx, 146, String(i + 1), { m:'klein', vet:true, k:KL[1] }); }
      s += boog(L + 4, L + dx - 4, 58, true, KL[3], lab, 8);
      return svg(560, 156, s, 'een hek met palen', 600);
    }
    if (soort === 'zaag'){
      var w = 480 / st;
      s += rc(40, 60, 480, 40, { f:KL[2], fo:0.45, rx:3 });
      for (i = 1; i < st; i++){ s += ln(40 + i * w, 50, 40 + i * w, 110, { k:KL[1], w:3, dash:'6 4' }); if (n >= 2) s += tx(40 + i * w, 132, String(i), { m:'klein', vet:true, k:KL[1] }); }
      s += tx(40 + w / 2, 86, lab, { m:'klein' });
      return svg(560, 140, s, 'een plank in stukken gezaagd', 600);
    }
    var cx = 280, cy = 112, r = 74;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" style="fill:var(--lr-1);fill-opacity:.15;stroke:var(--ink);stroke-width:2.5"/>';
    for (i = 0; i < st; i++){
      var a = 2 * Math.PI * i / st - Math.PI / 2;
      s += cirkel(cx + r * Math.cos(a), cy + r * Math.sin(a), 7, 'var(--lr-2)', { s:'var(--ink)', w:1.5 });
      if (n >= 2) s += tx(cx + (r + 20) * Math.cos(a), cy + (r + 20) * Math.sin(a) + 5, String(i + 1), { m:'klein', vet:true });
    }
    s += tx(cx, cy + 5, lab, { m:'klein' });
    return svg(560, 226, s, 'lampen rond een vijver', 420);
  }
  /* het scherm van een rekenmachine */
  function scherm(t, bovenTekst){
    var s = (bovenTekst ? tx(150, 16, bovenTekst, { m:'klein' }) : '') + rc(10, 26, 280, 58, { rx:10, f:'var(--kaart2)', w:2.5 }) +
      '<text x="276" y="66" class="getal groot" style="text-anchor:end;font-size:26px">' + Sch(t) + '</text>';
    return svg(300, 92, s, 'het scherm van de rekenmachine: ' + t, 340);
  }

  /* ================= de manieren voor vergelijkingen (ook voor "Kies de handigste manier") ================= */
  function mBalans(R, a, b, c, x){
    function tekst(n){ return n < 2 ? [E([[a, 'x'], [b, '']]), T(c)] : n < 3 ? [E([[a, 'x']]), T(c - b)] : ['x', T(x)]; }
    return { stappen:[
        K(R, 'Wat haal je eerst aan beide kanten weg?', b + ' blokjes', [a + ' zakjes', c + ' blokjes', '1 zakje'], 'Links liggen ' + b + ' losse blokjes bij de zakjes. Haal die weg, en rechts ook ' + b + '. Dan blijft de balans recht.'),
        S('Haal aan beide kanten ' + b + ' weg: ' + E([[a, 'x']]) + ' = ' + c + ' − ' + b + ' =', c - b, 'Rechts lagen ' + c + ' blokjes. Er gaan er ' + b + ' af.', F(c - b, c + b, 'Je deed er ' + b + ' bij. Je moet ze aan beide kanten weghalen.')),
        S(a + ' zakjes wegen samen ' + (c - b) + '. Eén zakje: ' + (c - b) + ' : ' + a + ' =', eqAnt(x), 'Verdeel de ' + (c - b) + ' blokjes eerlijk over de ' + a + ' zakjes.', F(x, c - b, 'Dat zijn alle ' + a + ' zakjes samen. Deel nog door ' + a + '.')) ],
      beeld:function(n){ return balans({ x:a, b:b, wb:n >= 2 ? b : 0 }, { b:c, wb:n >= 2 ? b : 0 }, { tekst:tekst(n) }); } };
  }
  /* terugrekenen: vorm mp (ax + b), mm (ax − b), dp (x : a + b), hk (a(x + b)) */
  function terugVgl(R, vorm){
    var a, b, x, ops, vgl;
    if (vorm === 'mp'){ a = R.heel(2, 9); b = R.heel(2, 20); x = R.heel(2, 12); ops = [['×', a], ['+', b]]; vgl = E([[a, 'x'], [b, '']]); }
    else if (vorm === 'mm'){ a = R.heel(2, 9); x = R.heel(3, 12); b = R.heel(2, a * x - 2); ops = [['×', a], ['−', b]]; vgl = E([[a, 'x'], [-b, '']]); }
    else if (vorm === 'dp'){ a = R.kies([2, 3, 4, 5, 10]); x = a * R.heel(2, 12); b = R.heel(2, 15); ops = [[':', a], ['+', b]]; vgl = 'x : ' + a + ' + ' + b; }
    else { a = R.heel(2, 8); b = R.heel(1, 9); x = R.heel(1, 12); ops = [['+', b], ['×', a]]; vgl = a + '(x + ' + b + ')'; }
    var mid = doe(x, ops[0]), c = doe(mid, ops[1]);
    return { a:a, b:b, x:x, c:c, mid:mid, ops:ops, vgl:vgl + ' = ' + T(c) };
  }
  function mTerug(R, v){
    var o0 = v.ops[0], o1 = v.ops[1], i0 = omgekeerd(o0), i1 = omgekeerd(o1);
    return { stappen:[
        K(R, 'Welke bewerking gebeurt als laatste met x?', opS(o1), [opS(o0), opS(i1)], 'Lees de pijlenketting: eerst ' + opS(o0) + ', dan ' + opS(o1) + '. Terugrekenen begint bij de laatste.'),
        S('Reken terug. Het omgekeerde van ' + opS(o1) + ' is ' + opS(i1) + '. Dus ' + T(v.c) + ' ' + opS(i1) + ' =', v.mid, 'Begin bij de uitkomst ' + T(v.c) + ' en doe ' + opS(i1) + '.', F(v.mid, doe(v.c, o1), 'Je deed ' + opS(o1) + '. Terug doe je het omgekeerde: ' + opS(i1) + '.')),
        S('Dan het omgekeerde van ' + opS(o0) + ', dat is ' + opS(i0) + '. Dus ' + T(v.mid) + ' ' + opS(i0) + ' =', eqAnt(v.x), 'Nu ' + opS(i0) + '. Dan ben je terug bij x.', F(v.x, doe(v.mid, o0), 'Je deed ' + opS(o0) + '. Terug doe je ' + opS(i0) + '.')) ],
      beeld:function(n){ return ketting([n >= 3 ? 'x = ' + T(v.x) : 'x', n >= 2 ? T(v.mid) : '?', T(v.c)], [opS(o0), opS(o1)], [opS(i0), opS(i1)], Math.max(0, n - 1)); } };
  }
  /* inklemmen: lin (p·x + q) of kw (x(x + p)) */
  function inklemVgl(R, soort){
    var x = R.kies([3, 4, 6, 7, 8, 9, 11, 12, 13, 14]), p, q, f, uit, vgl, lk;
    if (soort === 'lin'){ p = R.heel(6, 12); q = R.heel(5, 40); f = function(t){ return p * t + q; }; uit = function(t){ return p + ' × ' + t + ' + ' + q; }; vgl = p + 'x + ' + q; lk = vgl; }
    else { p = R.heel(1, 5); f = function(t){ return t * (t + p); }; uit = function(t){ return t + ' × (' + t + ' + ' + p + ')'; }; vgl = 'x(x + ' + p + ')'; lk = vgl; }
    return { x:x, f:f, uit:uit, c:f(x), vgl:vgl + ' = ' + T(f(x)), lk:lk };
  }
  function mInklem(R, v){
    var x = v.x, c = v.c, g = x < 10 ? 5 : 15, lo = x < 5 ? 0 : x < 10 ? 5 : 10, hi = x < 5 ? 5 : x < 10 ? 10 : 15;
    function tab(n){
      var xs = ['x'], ys = [v.lk];
      if (n >= 1){ xs.push('10'); ys.push(T(v.f(10))); }
      if (n >= 3){ xs.push(String(g)); ys.push(T(v.f(g))); }
      if (n >= 4){ xs.push(String(x)); ys.push(T(c)); }
      if (xs.length === 1){ xs.push('…'); ys.push('…'); }
      return R0.teken.tabel([xs, ys], { zijkop:true, nadruk:n >= 4 ? [[0, xs.length - 1], [1, ys.length - 1]] : [] });
    }
    return { stappen:[
        S('Probeer x = 10: ' + v.uit(10) + ' =', v.f(10), 'Vul 10 in op de plek van x.'),
        K(R, 'Je wilt ' + T(c) + ' krijgen. Is ' + T(v.f(10)) + ' te groot of te klein?', x < 10 ? 'te groot' : 'te klein', [], 'Vergelijk ' + T(v.f(10)) + ' met ' + T(c) + '.', { orde:['te klein', 'te groot'] }),
        S('Dus x moet ' + (x < 10 ? 'kleiner' : 'groter') + ' zijn dan 10. Probeer x = ' + g + ': ' + v.uit(g) + ' =', v.f(g), 'Vul ' + g + ' in op de plek van x.'),
        S('x ligt tussen ' + lo + ' en ' + hi + '. Probeer de getallen ertussen. x =', eqAnt(x), (x - 1 > lo ? 'Bij x = ' + (x - 1) + ' krijg je ' + T(v.f(x - 1)) + ': nog te klein. Probeer een getal hoger.' : 'Begin bij ' + (lo + 1) + ' en probeer steeds een getal hoger tot je ' + T(c) + ' krijgt.')) ],
      beeld:tab };
  }
  /* de onbekende aan twee kanten: a·x + b = c·x + d */
  function mTwee(R, a, b, c, d){
    var e = a - c, x = (d - b) / e;
    function tekst(n){ return n < 2 ? [E([[a, 'x'], [b, '']]), E([[c, 'x'], [d, '']])] : n < 3 ? [E([[e, 'x'], [b, '']]), T(d)] : n < 4 ? [E([[e, 'x']]), T(d - b)] : ['x', T(x)]; }
    return { stappen:[
        K(R, 'Er liggen zakjes aan beide kanten. Wat haal je eerst weg?', 'aan beide kanten ' + c + (c === 1 ? ' zakje' : ' zakjes'), ['alleen links ' + c + (c === 1 ? ' zakje' : ' zakjes'), 'aan beide kanten ' + a + ' zakjes'], (c === 1 ? 'Rechts ligt 1 zakje' : 'Rechts liggen ' + c + ' zakjes') + '. Haal er aan beide kanten zoveel weg. Dan liggen er alleen links nog zakjes.'),
        S('Hoeveel zakjes blijven er links over? ' + a + ' − ' + c + ' =', e, 'Links lagen ' + a + ' zakjes. Er ' + (c === 1 ? 'gaat er 1' : 'gaan er ' + c) + ' af.'),
        S('Nu staat er ' + E([[e, 'x'], [b, '']]) + ' = ' + d + '. Haal aan beide kanten ' + b + ' weg: ' + E([[e, 'x']]) + ' =', d - b, d + ' − ' + b + '.', F(d - b, d + b, 'Je deed er ' + b + ' bij. Haal ze aan beide kanten weg.')),
        S('x = ' + (d - b) + ' : ' + e + ' =', eqAnt(x), 'Verdeel ' + (d - b) + ' eerlijk over ' + e + ' zakjes.', F(x, d - b, 'Dat zijn ' + e + ' zakjes samen. Deel nog door ' + e + '.')) ],
      beeld:function(n){ return balans({ x:a, b:b, wx:n >= 2 ? c : 0, wb:n >= 3 ? b : 0 }, { x:c, b:d, wx:n >= 2 ? c : 0, wb:n >= 3 ? b : 0 }, { tekst:tekst(n) }); } };
  }
  function tweeGetallen(R){ var a, c, x, b, d; do { a = R.heel(3, 6); c = R.heel(1, a - 2); x = R.heel(1, 6); b = R.heel(1, 8); d = (a - c) * x + b; } while (d > 34); return { a:a, b:b, c:c, d:d, x:x }; }

  /* ================= verhalen bij vergelijkingen ================= */
  var VERH = [
    { t:function(a, b, c){ return 'Tim heeft ' + a + ' zakjes met knikkers en nog ' + b + ' losse knikkers. In elk zakje zitten evenveel knikkers. Samen heeft hij ' + c + ' knikkers.'; },
      x:'het aantal knikkers in één zakje', nep:['het aantal zakjes', 'het aantal knikkers van Tim samen', 'het aantal losse knikkers'], deel:function(a){ return 'de knikkers in ' + a + ' zakjes samen'; }, ar:[2, 6], br:[2, 15], xr:[4, 15] },
    { t:function(a, b, c){ return 'Sara koopt ' + a + ' pakjes stickers en een album van € ' + b + '. Ze betaalt € ' + c + ' in totaal.'; },
      x:'de prijs van één pakje stickers', nep:['het aantal pakjes', 'de prijs van het album', 'wat Sara in totaal betaalt'], deel:function(a){ return 'de prijs van ' + a + ' pakjes samen'; }, ar:[2, 5], br:[5, 15], xr:[2, 6] },
    { t:function(a, b, c){ return 'Een taxi kost € ' + b + ' om in te stappen en € ' + a + ' per kilometer. Een rit kost € ' + c + '.'; },
      x:'het aantal kilometers', nep:['de prijs per kilometer', 'de prijs van de rit', 'de prijs om in te stappen'], deel:function(){ return 'de prijs van alle kilometers samen'; }, ar:[2, 4], br:[3, 8], xr:[3, 20] },
    { t:function(a, b, c){ return 'Een plank is ' + c + ' cm lang. Je zaagt er ' + a + ' even lange stukken af. Er blijft ' + b + ' cm over.'; },
      x:'de lengte van één stuk', nep:['het aantal stukken', 'de lengte van de plank', 'het stuk dat overblijft'], deel:function(a){ return 'de lengte van ' + a + ' stukken samen'; }, ar:[2, 5], br:[5, 30], xr:[20, 60] },
    { t:function(a, b, c){ return 'Een klas gaat naar het museum. De bus kost € ' + b + '. Elke leerling betaalt ook een kaartje van € ' + a + '. Alles samen kost € ' + c + '.'; },
      x:'het aantal leerlingen', nep:['de prijs van een kaartje', 'de prijs van de bus', 'wat alles samen kost'], deel:function(){ return 'de prijs van alle kaartjes samen'; }, ar:[4, 9], br:[8, 20], bx:10, xr:[20, 30] },
    { t:function(a, b, c){ return 'Lisa heeft € ' + c + '. Ze koopt ' + a + ' boeken die allemaal evenveel kosten. Ze houdt € ' + b + ' over.'; }, min:true,
      x:'de prijs van één boek', nep:['het aantal boeken', 'het geld dat Lisa eerst had', 'het geld dat ze overhoudt'], deel:function(a){ return 'de prijs van de ' + a + ' boeken samen'; }, ar:[2, 4], br:[1, 9], xr:[5, 15] },
    { t:function(a, b, c){ return 'Een kaars is ' + c + ' cm lang. Elk uur brandt er ' + a + ' cm af. Nu is de kaars nog ' + b + ' cm.'; }, min:true,
      x:'het aantal uren dat de kaars brandde', nep:['hoeveel cm er per uur afbrandt', 'de lengte van de kaars nu', 'de lengte van de nieuwe kaars'], deel:function(){ return 'wat er in al die uren afbrandt'; }, ar:[2, 3], br:[4, 10], xr:[2, 8] } ];
  function verhaal(R){
    var it = R.kies(VERH), a = R.heel(it.ar[0], it.ar[1]), b = R.heel(it.br[0], it.br[1]) * (it.bx || 1), x = R.heel(it.xr[0], it.xr[1]), c = a * x + b;
    var vgl = it.min ? E([[c, ''], [-a, 'x']]) + ' = ' + b : E([[a, 'x'], [b, '']]) + ' = ' + c;
    return { it:it, a:a, b:b, x:x, c:c, vgl:vgl, ctx:it.t(a, b, c) };
  }

  /* ================= de inhoud ================= */
  LEERROUTE.voeg('rekenen', [
    /* ================= patronen in rijen (fundament) ================= */
    { groep:{ id:'patr-rij', niveau:'basis', domein:'verbanden', naam:'Patronen in rijen', kd:['rw12A.a'],
        uit:'Een rij getallen of figuren volgt een regel. Zoek wat er steeds gebeurt, dan kun je de rij voortzetten of een gat vullen.' },
      doelen:[
        { id:'patr-rij-plus', naam:'Er komt steeds hetzelfde bij', kort:'Zoek wat er van het ene getal naar het volgende bijkomt, en tel dat steeds erbij',
          uit:'<p>In veel rijen komt er <b>steeds hetzelfde bij</b>. Kijk naar twee buren: 4, 7, 10, 13, … Van 4 naar 7 is + 3.</p><p>Controleer met de volgende buren: van 7 naar 10 is ook + 3. Klopt. Het volgende getal is 13 + 3 = <b>16</b>.</p>',
          wanneer:'de getallen in een rij steeds even veel groter worden.',
          maak:function(R){
            var s = R.heel(1, 40), d = R.kies([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 20, 25]), t = [0, 1, 2, 3, 4, 5].map(function(i){ return s + i * d; });
            return { vraag:t.slice(0, 4).map(T).join(', ') + ', ?, ?', context:'Zet de rij voort. Welk getal komt op de plek van het laatste vraagteken?',
              beeld:function(n){ var b = []; if (n >= 1) for (var i = 0; i < 3; i++) b.push(bg(i, '+' + d)); if (n >= 2) b.push(bg(3, '+' + d, 1)); if (n >= 3) b.push(bg(4, '+' + d, 1));
                return rijBeeld([t[0], t[1], t[2], t[3], n >= 2 ? t[4] : '?', n >= 3 ? t[5] : '?'], b); },
              stappen:[
                S('Hoeveel komt er steeds bij? ' + t[0] + ' + … = ' + t[1], d, 'Reken van ' + t[0] + ' naar ' + t[1] + '. Kijk of het ook klopt van ' + t[1] + ' naar ' + t[2] + '.'),
                S('Het eerste vraagteken: ' + t[3] + ' + ' + d + ' =', t[4], 'Tel ' + d + ' bij het laatste getal dat er staat: ' + t[3] + '.'),
                S('Het tweede vraagteken: ' + t[4] + ' + ' + d + ' =', t[5], 'Nog een keer ' + d + ' erbij.', F(t[5], t[4], 'Dat is het eerste vraagteken. Er komt nog een keer ' + d + ' bij.')) ] };
          } },
        { id:'patr-rij-min', naam:'Er gaat steeds hetzelfde af', kort:'Zoek wat er van het ene getal naar het volgende afgaat, en haal dat steeds eraf',
          uit:'<p>Een rij kan ook <b>kleiner</b> worden: 50, 44, 38, 32, … Van 50 naar 44 gaat er 6 af.</p><p>Kijk of het overal klopt: 44 − 6 = 38 en 38 − 6 = 32. Het volgende getal is 32 − 6 = <b>26</b>.</p>',
          wanneer:'de getallen in een rij steeds even veel kleiner worden.',
          maak:function(R){
            var d = R.kies([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 25]), s = 5 * d + R.heel(1, 60), t = [0, 1, 2, 3, 4, 5].map(function(i){ return s - i * d; });
            return { vraag:t.slice(0, 4).map(T).join(', ') + ', ?, ?', context:'Zet de rij voort. Welk getal komt op de plek van het laatste vraagteken?',
              beeld:function(n){ var b = []; if (n >= 1) for (var i = 0; i < 3; i++) b.push(bg(i, MIN + d)); if (n >= 2) b.push(bg(3, MIN + d, 1)); if (n >= 3) b.push(bg(4, MIN + d, 1));
                return rijBeeld([t[0], t[1], t[2], t[3], n >= 2 ? t[4] : '?', n >= 3 ? t[5] : '?'], b); },
              stappen:[
                S('Hoeveel gaat er steeds af? ' + t[0] + ' − … = ' + t[1], d, 'Hoeveel scheelt ' + t[0] + ' met ' + t[1] + '?'),
                S('Het eerste vraagteken: ' + t[3] + ' − ' + d + ' =', t[4], 'Haal ' + d + ' van het laatste getal af: ' + t[3] + '.', F(t[4], t[3] + d, 'In deze rij gaat er steeds iets af, er komt niets bij.')),
                S('Het tweede vraagteken: ' + t[4] + ' − ' + d + ' =', t[5], 'Nog een keer ' + d + ' eraf.', F(t[5], t[4], 'Dat is het eerste vraagteken. Er gaat nog een keer ' + d + ' af.')) ] };
          } },
        { id:'patr-rij-keer', naam:'Rijen met keer: verdubbelen', kort:'Komt er niet steeds hetzelfde bij? Kijk of het steeds keer 2 (of een ander getal) gaat',
          uit:'<p>Soms komt er <b>niet steeds hetzelfde bij</b>: 3, 6, 12, 24, … Van 3 naar 6 is + 3, maar van 6 naar 12 is + 6.</p><p>Kijk dan of het <b>keer</b> gaat: 3 × 2 = 6, 6 × 2 = 12, 12 × 2 = 24. Elk getal is het <b>dubbele</b> van het vorige. Het volgende is 24 × 2 = <b>48</b>.</p><p>Het kan ook keer 3, keer 10, of steeds de helft.</p>',
          wanneer:'de getallen in een rij steeds sneller groter (of kleiner) worden.',
          maak:function(R){
            var v = R.heel(0, 4), f, t;
            if (v === 4){ var m = R.heel(1, 9); f = 2; t = [0, 1, 2, 3, 4, 5].map(function(i){ return m * Math.pow(2, 5 - i); }); }
            else { f = [2, 3, 10, 4][v]; var s = v === 0 ? R.heel(1, 12) : v === 1 ? R.heel(1, 4) : v === 2 ? R.heel(1, 9) : R.heel(1, 3); t = [0, 1, 2, 3, 4, 5].map(function(i){ return s * Math.pow(f, i); }); }
            var half = v === 4, op = half ? ':' + 2 : X + f, opT = half ? ' : 2' : ' × ' + f, woord = half ? 'gedeeld door 2' : 'keer ' + f;
            return { vraag:t.slice(0, 4).map(T).join(', ') + ', ?, ?', context:'Zet de rij voort. Welk getal komt op de plek van het laatste vraagteken?',
              beeld:function(n){ var b = []; if (n >= 1) for (var i = 0; i < 3; i++) b.push(bg(i, op)); if (n >= 2) b.push(bg(3, op, 1)); if (n >= 3) b.push(bg(4, op, 1));
                return rijBeeld([t[0], t[1], t[2], t[3], n >= 2 ? t[4] : '?', n >= 3 ? t[5] : '?'], b); },
              stappen:[
                half ? S('Wat gebeurt er steeds? ' + T(t[0]) + ' : … = ' + T(t[1]), 2, 'Hoe vaak past ' + T(t[1]) + ' in ' + T(t[0]) + '? Kijk ook naar ' + T(t[1]) + ' en ' + T(t[2]) + '.', F(2, t[0] - t[1], 'Er gaat niet steeds ' + T(t[0] - t[1]) + ' af. Kijk naar ' + T(t[1]) + ' en ' + T(t[2]) + '. Het gaat gedeeld door.'))
                  : S('Wat gebeurt er steeds? ' + T(t[0]) + ' × … = ' + T(t[1]), f, 'Hoe vaak past ' + T(t[0]) + ' in ' + T(t[1]) + '? Kijk ook naar ' + T(t[1]) + ' en ' + T(t[2]) + '.', F(f, t[1] - t[0], 'Er komt niet steeds ' + T(t[1] - t[0]) + ' bij: van ' + T(t[1]) + ' naar ' + T(t[2]) + ' is het meer. Het gaat keer.')),
                S('Het eerste vraagteken: ' + T(t[3]) + opT + ' =', T(t[4]), 'Doe het laatste getal ' + woord + '.', F(t[4], 2 * t[3] - t[2], 'Er komt niet steeds hetzelfde bij. Het gaat steeds ' + woord + '.')),
                S('Het tweede vraagteken: ' + T(t[4]) + opT + ' =', T(t[5]), 'Doe ' + T(t[4]) + ' ' + woord + '.', F(t[5], t[4], 'Dat is het eerste vraagteken. Doe het nog een keer ' + woord + '.')) ] };
          } },
        { id:'patr-rij-figuur', naam:'Figuurrijen: lucifers en stippen', kort:'Tel twee figuren, kijk hoeveel er steeds bijkomt en reken door naar de figuur die je zoekt',
          uit:'<p>Een <b>figuurrij</b> groeit volgens een regel. Tel hoeveel lucifers of stippen figuur 1 en figuur 2 hebben.</p><p>Zo zie je hoeveel er <b>bij elke nieuwe figuur bijkomen</b>. Bij een rij vierkantjes van lucifers zijn dat er 3: 4, 7, 10, …</p><p>Teken niet alles, maar <b>reken door</b>: figuur 4 heeft 10 + 3 = 13, figuur 5 heeft 13 + 3 = 16.</p>',
          wanneer:'je moet weten hoeveel lucifers of stippen een latere figuur heeft.',
          beeld:figuren('vierkanten', [1, 2, 3]),
          maak:function(R){
            var it = R.kies(LIN), t = R.kies([5, 6, 7]), f = function(k){ return aantal(it.id, k); }, a = it.a;
            var pl = figuren(it.id, [1, 2, 3]);
            return { vraag:'Figuur ' + t + ': hoeveel ' + it.wat + '?', context:'Kijk naar de figuren. Hoeveel ' + it.wat + ' heeft figuur ' + t + '?', beeld:pl, zelfBeeld:pl, eenheid:it.wat,
              stappen:[
                S('Tel de ' + it.wat + ' van figuur 1:', f(1), 'Tel ze een voor een. Tik met je vinger op elke ' + it.enk + ' die je telt.'),
                S('Tel figuur 2:', f(2), 'Figuur 2 lijkt op figuur 1, met een stukje erbij.'),
                S('Hoeveel ' + it.wat + ' komen er steeds bij? ' + f(1) + ' + … = ' + f(2), a, 'Van figuur 1 naar figuur 2. Klopt het ook naar figuur 3? Die heeft er ' + f(3) + '.'),
                S('Figuur 4: ' + f(3) + ' + ' + a + ' =', f(4), 'Figuur 3 heeft er ' + f(3) + '. Er komen er ' + a + ' bij.'),
                S('Figuur ' + t + ': ' + (t === 5 ? f(4) + ' + ' + a : f(4) + ' + ' + (t - 4) + ' × ' + a) + ' =', f(t), t === 5 ? 'Nog een keer ' + a + ' erbij.' : 'Van figuur 4 naar figuur ' + t + ' zijn ' + (t - 4) + ' stappen van ' + a + '.', F(f(t), f(5), 'Dat is figuur 5. Ga door tot figuur ' + t + '.', f(4) + a * (t - 4) - a, 'Je nam een stap te weinig.')) ] };
          } },
        { id:'patr-rij-verschil', naam:'De regel vinden met het verschil tussen buren', kort:'Schrijf onder de rij de verschillen tussen buren, en zoek de regel in die verschillen',
          uit:'<p>Komt er niet steeds hetzelfde bij? Schrijf dan het <b>verschil tussen buren</b> op. Bij 2, 3, 5, 8, … zijn de verschillen 1, 2, 3.</p><p>Nu zie je de regel: het verschil wordt <b>steeds 1 groter</b>. Het volgende verschil is 4, dus het volgende getal is 8 + 4 = <b>12</b>.</p><p>De verschillen kunnen ook afwisselen (+2, +5, +2, +5) of verdubbelen (+1, +2, +4).</p>',
          wanneer:'je in een rij niet meteen ziet wat er steeds bijkomt.',
          maak:function(R){
            var v = R.heel(0, 4), d, dn, hint, d0;
            if (v === 0){ d0 = R.heel(1, 5); d = [d0, d0 + 1, d0 + 2]; dn = d0 + 3; hint = 'De verschillen worden steeds 1 groter.'; }
            else if (v === 1){ d0 = R.heel(1, 5); d = [d0, d0 + 2, d0 + 4]; dn = d0 + 6; hint = 'De verschillen worden steeds 2 groter.'; }
            else if (v === 2){ var p, q; do { p = R.heel(1, 9); q = R.heel(1, 9); } while (p === q); d = [p, q, p]; dn = q; hint = 'De verschillen wisselen af: ' + p + ', ' + q + ', ' + p + ', en dan weer ' + q + '.'; }
            else if (v === 3){ d0 = R.heel(1, 3); d = [d0, 2 * d0, 4 * d0]; dn = 8 * d0; hint = 'Elk verschil is het dubbele van het vorige.'; }
            else { d0 = R.heel(4, 12); d = [d0, d0 - 1, d0 - 2]; dn = d0 - 3; hint = 'De verschillen worden steeds 1 kleiner.'; }
            var t = [R.heel(1, 30)]; d.forEach(function(x){ t.push(t[t.length - 1] + x); }); t.push(t[3] + dn);
            return { vraag:t.slice(0, 4).join(', ') + ', ?', context:'Er komt niet steeds hetzelfde bij. Zoek de regel in de verschillen. Welk getal komt erna?',
              beeld:function(n){ var b = []; for (var i = 0; i < Math.min(n, 3); i++) b.push(bg(i, '+' + d[i])); if (n >= 4) b.push(bg(3, '+' + dn, 1));
                return rijBeeld([t[0], t[1], t[2], t[3], n >= 5 ? t[4] : '?'], b); },
              stappen:[
                S('Het eerste verschil: ' + t[1] + ' − ' + t[0] + ' =', d[0], 'Hoeveel komt erbij van ' + t[0] + ' naar ' + t[1] + '?'),
                S('Het tweede verschil: ' + t[2] + ' − ' + t[1] + ' =', d[1], 'Hoeveel komt erbij van ' + t[1] + ' naar ' + t[2] + '?'),
                S('Het derde verschil: ' + t[3] + ' − ' + t[2] + ' =', d[2], 'Hoeveel komt erbij van ' + t[2] + ' naar ' + t[3] + '?'),
                S('De verschillen zijn ' + d.join(', ') + '. Wat is het volgende verschil?', dn, hint),
                S('Het volgende getal: ' + t[3] + ' + ' + dn + ' =', t[4], 'Tel het nieuwe verschil bij het laatste getal.', F(t[4], t[3] + d[2], 'Je nam hetzelfde verschil als de vorige keer. Het verschil verandert steeds.')) ] };
          } },
        { id:'patr-rij-gat', naam:'Welk getal ontbreekt?', kort:'Zoek de regel bij twee buren zonder gat en reken vanaf de linkerbuur naar het gat',
          uit:'<p>Soms mist er een getal <b>in het midden</b>: 12, 19, ?, 33, 40.</p><p>Zoek eerst twee buren <b>zonder gat</b>: 33 en 40. Daar komt 7 bij. Reken dan vanaf de linkerbuur van het gat: 19 + 7 = <b>26</b>.</p><p>Controleer met de rechterbuur: 26 + 7 = 33. Klopt.</p>',
          wanneer:'er in een rij een getal ontbreekt.',
          maak:function(R){
            var soort = R.kies(['plus', 'min', 'keer']), d, t, g = R.heel(1, 3), pa = g === 1 ? 2 : 0;
            if (soort === 'plus'){ d = R.heel(2, 15); var s = R.heel(1, 50); t = [0, 1, 2, 3, 4].map(function(i){ return s + i * d; }); }
            else if (soort === 'min'){ d = R.heel(2, 12); var s2 = 4 * d + R.heel(1, 50); t = [0, 1, 2, 3, 4].map(function(i){ return s2 - i * d; }); }
            else { d = R.kies([2, 2, 3]); var s3 = d === 2 ? R.heel(1, 10) : R.heel(1, 4); t = [0, 1, 2, 3, 4].map(function(i){ return s3 * Math.pow(d, i); }); }
            var op = soort === 'plus' ? '+' + d : soort === 'min' ? MIN + d : X + d, opT = soort === 'plus' ? ' + ' + d : soort === 'min' ? ' − ' + d : ' × ' + d;
            var items = t.map(function(x, i){ return i === g ? '?' : x; });
            return { vraag:items.map(function(x){ return typeof x === 'number' ? T(x) : x; }).join(', '), context:'Welk getal hoort op de plek van het vraagteken?',
              beeld:function(n){ var b = []; if (n >= 1) for (var i = 0; i < 4; i++) if (i !== g - 1 && i !== g) b.push(bg(i, op)); if (n >= 2){ b.push(bg(g - 1, op, 1)); b.push(bg(g, op, 1)); }
                return rijBeeld(n >= 2 ? t : items, b); },
              stappen:[
                soort === 'keer' ? S('Kijk naar twee buren zonder gat: ' + T(t[pa]) + ' en ' + T(t[pa + 1]) + '. Keer hoeveel?', d, 'Hoe vaak past ' + T(t[pa]) + ' in ' + T(t[pa + 1]) + '?', F(d, t[pa + 1] - t[pa], 'Kijk ook naar de andere buren: er komt niet steeds evenveel bij. Het gaat keer.'))
                  : S('Kijk naar twee buren zonder gat: ' + T(t[pa]) + ' en ' + T(t[pa + 1]) + '. Hoeveel ' + (soort === 'plus' ? 'komt er steeds bij' : 'gaat er steeds af') + '?', d, 'Reken het verschil tussen ' + T(t[pa]) + ' en ' + T(t[pa + 1]) + ' uit.'),
                S('Het ontbrekende getal: ' + T(t[g - 1]) + opT + ' =', t[g], 'Begin bij het getal links van het gat. Controleer: ' + T(t[g]) + opT + ' moet ' + T(t[g + 1]) + ' zijn.', F(t[g], t[g + 1], 'Dat getal staat er al, rechts van het gat. Begin links van het gat.')) ] };
          } }
      ] },

    /* ================= patronen met een regel (1F) ================= */
    { groep:{ id:'patr-regel', niveau:'1F', domein:'verbanden', naam:'Patronen met een regel', kd:['rw12A.a', 'rw12A.d'],
        uit:'Met een regel kun je ver vooruit rekenen zonder alles op te schrijven: het 20e getal of figuur 50. En je leert bijzondere rijen herkennen.' },
      doelen:[
        { id:'patr-regel-woorden', naam:'De regel in woorden', kort:'Zeg waar de rij begint en wat er steeds gebeurt: begin bij 4, steeds 3 erbij',
          uit:'<p>Een rij beschrijf je met een <b>regel in woorden</b>. Je zegt twee dingen: <b>waar je begint</b> en <b>wat er steeds gebeurt</b>.</p><p>4, 7, 10, 13, … De regel is: <b>begin bij 4, steeds 3 erbij</b>.</p><p>3, 6, 12, 24, … De regel is: begin bij 3, steeds keer 2.</p>',
          wanneer:'je een rij aan iemand anders wilt uitleggen, zonder alle getallen op te schrijven.',
          maak:function(R){
            var soort = R.kies(['plus', 'min', 'keer']), s, d, t, goed, nep, vr, hint;
            if (soort === 'plus'){ do { s = R.heel(1, 20); d = R.heel(2, 12); } while (s === d); t = [0, 1, 2, 3, 4].map(function(i){ return s + i * d; });
              goed = 'Begin bij ' + s + ', steeds ' + d + ' erbij.'; nep = ['Begin bij ' + d + ', steeds ' + s + ' erbij.', 'Begin bij ' + t[1] + ', steeds ' + d + ' erbij.', 'Begin bij ' + s + ', steeds ' + (d + 1) + ' erbij.', 'Begin bij ' + s + ', steeds keer ' + d + '.'];
              vr = S('Wat komt er steeds bij? ' + t[0] + ' + … = ' + t[1], d, 'Reken van ' + t[0] + ' naar ' + t[1] + '.'); hint = 'De rij begint bij ' + s + ' en er komt steeds ' + d + ' bij.'; }
            else if (soort === 'min'){ s = R.heel(40, 99); d = R.heel(2, 9); t = [0, 1, 2, 3, 4].map(function(i){ return s - i * d; });
              goed = 'Begin bij ' + s + ', steeds ' + d + ' eraf.'; nep = ['Begin bij ' + s + ', steeds ' + d + ' erbij.', 'Begin bij ' + t[1] + ', steeds ' + d + ' eraf.', 'Begin bij ' + s + ', steeds ' + (d + 1) + ' eraf.', 'Begin bij ' + t[4] + ', steeds ' + d + ' erbij.'];
              vr = S('Wat gaat er steeds af? ' + t[0] + ' − … = ' + t[1], d, 'Hoeveel scheelt ' + t[0] + ' met ' + t[1] + '?'); hint = 'De rij begint bij ' + s + ' en er gaat steeds ' + d + ' af.'; }
            else { s = R.heel(1, 5); d = R.kies([2, 3]); t = [0, 1, 2, 3, 4].map(function(i){ return s * Math.pow(d, i); });
              goed = 'Begin bij ' + s + ', steeds keer ' + d + '.'; nep = ['Begin bij ' + s + ', steeds ' + (t[1] - t[0]) + ' erbij.', 'Begin bij ' + s + ', steeds keer ' + (d + 1) + '.', 'Begin bij ' + t[1] + ', steeds keer ' + d + '.', 'Begin bij ' + d + ', steeds keer ' + s + '.'];
              vr = S('Keer hoeveel? ' + t[0] + ' × … = ' + t[1], d, 'Hoe vaak past ' + t[0] + ' in ' + t[1] + '? Controleer met ' + t[1] + ' en ' + t[2] + '.'); hint = 'De rij begint bij ' + s + ' en elk getal is ' + d + ' keer zo groot als het vorige.'; }
            nep = R.hussel(uniek(nep).filter(function(x){ return x !== goed; })).slice(0, 3);
            var op = soort === 'plus' ? '+' + d : soort === 'min' ? MIN + d : X + d;
            return eindKeuze({ vraag:t.join(', ') + ', …', context:'Welke regel hoort bij deze rij?',
              beeld:function(n){ var b = []; if (n >= 2) for (var i = 0; i < 4; i++) b.push(bg(i, op)); return rijBeeld(t, b); },
              stappen:[ S('Met welk getal begint de rij?', s, 'Het eerste getal, helemaal links.'), vr, K(R, 'Welke regel hoort bij de rij?', goed, nep, hint) ] });
          } },
        { id:'patr-regel-ver', naam:'Het 10e of 20e getal uitrekenen', kort:'Het n-de getal is het begingetal plus (n − 1) keer de stap',
          uit:'<p>Je wilt het <b>20e getal</b> van 5, 8, 11, 14, … weten. Alles opschrijven duurt lang. Het kan sneller.</p><p>Van het 1e naar het 20e getal zijn <b>19 stappen</b>, niet 20. Elke stap is + 3. Dat is 19 × 3 = 57.</p><p>Het 20e getal is dus 5 + 57 = <b>62</b>. Kort: begin + (n − 1) × stap.</p>',
          wanneer:'je een getal ver in de rij zoekt.',
          maak:function(R){
            var s = R.heel(1, 30), d = R.heel(2, 12), n = R.kies([10, 12, 15, 20, 25, 30, 50, 100]), tn = s + (n - 1) * d;
            return { vraag:[s, s + d, s + 2 * d, s + 3 * d].join(', ') + ', …', context:'Wat is het ' + n + 'e getal van deze rij? Je hoeft niet alles op te schrijven.',
              beeld:function(k){ var b = [bg(0, '+' + d), bg(1, '+' + d), bg(2, '+' + d)]; if (k >= 3) b.push({ van:0, naar:5, tekst:(n - 1) + ' × ' + d, k:1 });
                return rijBeeld([s, s + d, s + 2 * d, s + 3 * d, '…', k >= 4 ? tn : '?'], b, { y:120, onder:['1e', '2e', '3e', '4e', '', n + 'e'] }); },
              stappen:[
                S('Hoeveel komt er steeds bij?', d, 'Reken van ' + s + ' naar ' + (s + d) + '.'),
                S('Hoeveel stappen zijn er van het 1e naar het ' + n + 'e getal?', n - 1, 'Van het 1e naar het 2e getal is 1 stap. Van het 1e naar het 3e zijn het er 2. Naar het ' + n + 'e dus …', F(n - 1, n, 'Dat is een stap te veel. Van het 1e naar het 2e getal is maar 1 stap.')),
                S((n - 1) + ' stappen van ' + d + ': ' + (n - 1) + ' × ' + d + ' =', (n - 1) * d, (n - 1) + ' keer ' + d + '.', F((n - 1) * d, n * d, 'Je deed ' + n + ' × ' + d + '. Het zijn ' + (n - 1) + ' stappen.')),
                S('Tel het begingetal erbij: ' + s + ' + ' + T((n - 1) * d) + ' =', tn, 'Je begint bij ' + s + ' en zet dan alle stappen.', F(tn, (n - 1) * d, 'Je vergat het begingetal ' + s + '.')) ] };
          } },
        { id:'patr-regel-tabel', naam:'Een tabel bij een figuurrij', kort:'Zet de figuren in een tabel, ga terug naar figuur 0 en reken: stap × figuurnummer + figuur 0',
          uit:'<p>Bij een figuurrij maak je een <b>tabel</b>: bovenaan het figuurnummer, eronder het aantal lucifers.</p><p>Komen er steeds 3 bij en heeft figuur 1 er 4? Ga dan een stap <b>terug naar figuur 0</b>: 4 − 3 = 1.</p><p>Nu heb je de regel: aantal = <b>3 × figuurnummer + 1</b>. Figuur 20 heeft 3 × 20 + 1 = <b>61</b> lucifers.</p>',
          wanneer:'je een figuur ver in de rij zoekt, zoals figuur 20 of figuur 50.',
          maak:function(R){
            var it = R.kies(LIN), Tn = R.kies([10, 12, 15, 20, 25, 50]), f = function(k){ return aantal(it.id, k); }, a = it.a, c = it.c;
            function tab(n){
              return R.teken.tabel([['figuur', '0', '1', '2', '3', '4', '5', String(Tn)],
                ['aantal', n >= 3 ? String(c) : '?', n >= 1 ? String(f(1)) : '?', n >= 2 ? String(f(2)) : '?', n >= 2 ? String(f(3)) : '?', n >= 2 ? String(f(4)) : '?', n >= 2 ? String(f(5)) : '?', n >= 4 ? String(f(Tn)) : '?']],
                { zijkop:true, nadruk:n >= 4 ? [[1, 7]] : [] });
            }
            var pl = function(n){ return stapel(figuren(it.id, [1, 2, 3]), tab(n)); };
            return { vraag:'Figuur ' + Tn + ': hoeveel ' + it.wat + '?', context:'Maak de tabel bij de figuurrij. Hoeveel ' + it.wat + ' heeft figuur ' + Tn + '?', beeld:pl, zelfBeeld:pl(0), eenheid:it.wat,
              stappen:[
                S('Tel figuur 1. Hoeveel ' + it.wat + '?', f(1), 'Tel ze een voor een.'),
                S('Hoeveel komen er per figuur bij?', a, 'Figuur 2 heeft er ' + f(2) + '. Hoeveel meer dan ' + f(1) + '?'),
                S('Ga in de tabel terug naar figuur 0: ' + f(1) + ' − ' + a + ' =', c, 'Figuur 0 heeft er ' + a + ' minder dan figuur 1.'),
                S('Figuur ' + Tn + ': ' + a + ' × ' + Tn + ' + ' + c + ' =', f(Tn), 'Bij elke figuur komen er ' + a + ' bij. Bij figuur ' + Tn + ' is dat ' + Tn + ' keer ' + a + ', plus de ' + c + ' van figuur 0.', F(f(Tn), a * Tn, 'Je vergat de ' + c + ' van figuur 0.', f(1) * Tn, 'Je deed ' + f(1) + ' × ' + Tn + '. Maar de figuren delen ' + it.wat + ' met elkaar.')) ] };
          } },
        { id:'patr-regel-kwadraat', naam:'Kwadraten herkennen', kort:'1, 4, 9, 16, 25: elk getal is een getal keer zichzelf, een vierkant van stippen',
          uit:'<p>De rij 1, 4, 9, 16, 25, … heet de rij van de <b>kwadraten</b>. Elk getal is een getal <b>keer zichzelf</b>: 1 × 1, 2 × 2, 3 × 3, …</p><p>Met stippen zie je waarom: figuur 4 is een <b>vierkant</b> van 4 bij 4 stippen. Dat zijn 16 stippen.</p><p>De verschillen worden steeds 2 groter: 3, 5, 7, 9, …</p>',
          wanneer:'je een rij ziet die steeds sneller groeit, met getallen als 16, 25, 36 en 49.',
          beeld:figuren('kwadraat', [1, 2, 3, 4]),
          maak:function(R){
            if (R.heel(0, 1)){
              var r0 = R.heel(1, 6), t = [0, 1, 2, 3, 4].map(function(i){ return (r0 + i) * (r0 + i); }), r3 = r0 + 3, r4 = r0 + 4;
              return { vraag:t.slice(0, 4).join(', ') + ', ?', context:'Welk getal komt er na ' + t[3] + '?',
                beeld:function(n){ return rijBeeld([t[0], t[1], t[2], t[3], n >= 3 ? t[4] : '?'], [], { onder:n >= 1 ? [0, 1, 2, 3, 4].map(function(i){ return (r0 + i) + ' × ' + (r0 + i); }) : null }); },
                stappen:[
                  K(R, 'Wat voor rij is dit?', 'kwadraten: een getal keer zichzelf', ['steeds hetzelfde erbij', 'verdubbelen', 'driehoeksgetallen'], 'Kijk: ' + r3 + ' × ' + r3 + ' = ' + t[3] + ' en ' + (r3 - 1) + ' × ' + (r3 - 1) + ' = ' + t[2] + '.'),
                  S(t[3] + ' is … × …. Welk getal keer zichzelf is ' + t[3] + '?', r3, 'Zoek in de tafels: welk getal keer zichzelf geeft ' + t[3] + '?'),
                  S('Het volgende kwadraat: ' + r4 + ' × ' + r4 + ' =', t[4], 'Het getal na ' + r3 + ' is ' + r4 + '. Doe ' + r4 + ' keer zichzelf.', F(t[4], 2 * t[3] - t[2], 'Je nam hetzelfde verschil als het vorige. Bij kwadraten wordt het verschil steeds 2 groter.')) ] };
            }
            var k = R.heel(6, 15), pl = figuren('kwadraat', [1, 2, 3, 4]);
            return { vraag:'Figuur ' + k + ': hoeveel stippen?', context:'Hoeveel stippen heeft figuur ' + k + '?', beeld:pl, zelfBeeld:pl, eenheid:'stippen',
              stappen:[
                K(R, 'Welke vorm hebben de figuren?', 'een vierkant', ['een driehoek', 'een rechthoek van 2 rijen', 'een kruis'], 'Tel de rijen en de kolommen van figuur 3: 3 rijen van 3.'),
                S('Figuur ' + k + ' is een vierkant van ' + k + ' bij …', k, 'Figuur 3 is 3 bij 3. Figuur ' + k + ' is dus ' + k + ' bij …'),
                S(k + ' × ' + k + ' =', k * k, k + ' rijen van ' + k + ' stippen.', F(k * k, 2 * k, 'Dat is ' + k + ' + ' + k + '. Het is ' + k + ' keer ' + k + '.')) ] };
          } },
        { id:'patr-regel-driehoek', naam:'Driehoeksgetallen herkennen', kort:'1, 3, 6, 10, 15: er komt steeds 1 meer bij dan de vorige keer',
          uit:'<p>De rij 1, 3, 6, 10, 15, … heten de <b>driehoeksgetallen</b>. Met stippen maak je er een <b>driehoek</b> of trap van.</p><p>De verschillen zijn 2, 3, 4, 5: er komt <b>steeds 1 meer</b> bij.</p><p>Figuur 10 snel uitrekenen? Twee driehoeken samen maken een rechthoek van 10 bij 11. Dat is 110. Eén driehoek is de helft: <b>55</b>.</p>',
          wanneer:'je een rij ziet waarin het verschil steeds 1 groter wordt, of een trap van stippen.',
          beeld:figuren('driehoek', [1, 2, 3, 4]),
          maak:function(R){
            function D(k){ return k * (k + 1) / 2; }
            if (R.heel(0, 1)){
              var r0 = R.heel(1, 5), t = [0, 1, 2, 3, 4].map(function(i){ return D(r0 + i); });
              return { vraag:t.slice(0, 4).join(', ') + ', ?', context:'Welk getal komt er na ' + t[3] + '?',
                beeld:function(n){ var b = []; if (n >= 2) b.push(bg(0, '+' + (r0 + 1))); if (n >= 3){ b.push(bg(1, '+' + (r0 + 2))); b.push(bg(2, '+' + (r0 + 3))); } if (n >= 4) b.push(bg(3, '+' + (r0 + 4), 1)); return rijBeeld([t[0], t[1], t[2], t[3], n >= 4 ? t[4] : '?'], b); },
                stappen:[
                  K(R, 'Wat voor rij is dit?', 'driehoeksgetallen', ['kwadraten', 'steeds hetzelfde erbij', 'verdubbelen'], 'Kijk naar de verschillen: ' + (r0 + 1) + ', ' + (r0 + 2) + ', ' + (r0 + 3) + '. Ze worden steeds 1 groter.'),
                  S('Het eerste verschil: ' + t[1] + ' − ' + t[0] + ' =', r0 + 1, 'Hoeveel komt erbij van ' + t[0] + ' naar ' + t[1] + '?'),
                  S('Het laatste verschil: ' + t[3] + ' − ' + t[2] + ' =', r0 + 3, 'Hoeveel komt erbij van ' + t[2] + ' naar ' + t[3] + '?'),
                  S('Het volgende verschil is 1 meer: ' + (r0 + 4) + '. ' + t[3] + ' + ' + (r0 + 4) + ' =', t[4], 'Tel ' + (r0 + 4) + ' bij ' + t[3] + '.', F(t[4], t[3] + r0 + 3, 'Je nam hetzelfde verschil. Er komt steeds 1 meer bij.')) ] };
            }
            var k = R.heel(6, 20), pl = figuren('driehoek', [1, 2, 3, 4]);
            return { vraag:'Figuur ' + k + ': hoeveel stippen?', context:'Hoeveel stippen heeft figuur ' + k + '? Figuur ' + k + ' heeft onderaan een rij van ' + k + ' stippen.', beeld:pl, zelfBeeld:pl, eenheid:'stippen',
              stappen:[
                K(R, 'Welke vorm hebben de figuren?', 'een driehoek (een trap)', ['een vierkant', 'een rij', 'een kruis'], 'Elke rij heeft een stip meer dan de rij erboven.'),
                S('Leg twee driehoeken tegen elkaar: een rechthoek van ' + k + ' bij ' + (k + 1) + '. ' + k + ' × ' + (k + 1) + ' =', k * (k + 1), 'Twee trappen passen precies in een rechthoek van ' + k + ' rijen van ' + (k + 1) + '.'),
                S('Eén driehoek is de helft: ' + k * (k + 1) + ' : 2 =', D(k), 'Deel het aantal stippen van de rechthoek door 2.', F(D(k), k * (k + 1), 'Dat zijn twee driehoeken samen. Deel nog door 2.', k * k / 2, 'De rechthoek is ' + k + ' bij ' + (k + 1) + ', niet ' + k + ' bij ' + k + '.')) ] };
          } }
      ] },

    /* ================= vergelijkingen oplossen (2F) ================= */
    { groep:{ id:'verg-los', niveau:'2F', domein:'verbanden', naam:'Vergelijkingen oplossen', kd:['rw10B.d', 'rw10B.a'],
        uit:'In een vergelijking staat een onbekend getal, meestal x. Je zoekt welk getal het is: met de balans, door terug te rekenen of door te proberen.' },
      doelen:[
        { id:'verg-los-balans', naam:'De balansmethode', kort:'Doe aan beide kanten hetzelfde: eerst de losse blokjes weg, dan delen',
          uit:'<p>Een vergelijking is een <b>balans in evenwicht</b>. 3x + 4 = 19: links 3 zakjes met elk x blokjes en 4 losse blokjes. Rechts 19 blokjes.</p><p>Wat je links weghaalt, haal je <b>rechts ook weg</b>. Haal 4 blokjes weg: 3x = 15.</p><p>3 zakjes wegen 15. Eén zakje: 15 : 3 = 5. Dus <b>x = 5</b>.</p>',
          wanneer:'er aan één kant x en losse getallen staan, of x aan beide kanten.',
          beeld:balans({ x:3, b:4 }, { b:19 }, { tekst:['3x + 4', '19'] }),
          maak:function(R){
            var a = R.heel(2, 4), x = R.heel(2, 6), b = R.heel(1, 10), c = a * x + b, m = mBalans(R, a, b, c, x), om = R.heel(0, 3) === 0;
            return { vraag:om ? T(c) + ' = ' + E([[a, 'x'], [b, '']]) : E([[a, 'x'], [b, '']]) + ' = ' + T(c), context:'Los op met de balans.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'verg-los-terug', naam:'Terugrekenen met de pijlenketting', kort:'Zet de bewerkingen in een pijlenketting en reken van achter naar voren, met het omgekeerde',
          uit:'<p>Bij 3x + 4 = 19 gebeurt er iets met x: eerst <b>× 3</b>, dan <b>+ 4</b>. Dat zet je in een <b>pijlenketting</b>: x → × 3 → + 4 → 19.</p><p>Reken nu <b>terug</b>, van achter naar voren. Elke stap draai je om: + wordt −, × wordt :. 19 − 4 = 15, en 15 : 3 = <b>5</b>.</p><p>Let op de volgorde: bij 3(x + 2) = 24 is het eerst + 2 en dan × 3. Terug: 24 : 3 = 8, en 8 − 2 = 6.</p>',
          wanneer:'x er maar één keer in staat, met een paar bewerkingen erachter.',
          beeld:ketting(['x', '15', '19'], ['× 3', '+ 4'], [': 3', '− 4'], 2),
          maak:function(R){
            var v = terugVgl(R, R.kies(['mp', 'mm', 'dp', 'hk'])), m = mTerug(R, v);
            return { vraag:v.vgl, context:'Los op door terug te rekenen.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'verg-los-inklem', naam:'Inklemmen: proberen met een tabel', kort:'Probeer een getal, kijk of het te groot of te klein is, en klem de oplossing steeds verder in',
          uit:'<p>Soms kun je niet makkelijk terugrekenen, of zijn de getallen groot. Dan kun je <b>proberen</b>. Schrijf je pogingen in een <b>tabel</b>.</p><p>x(x + 3) = 70. Probeer x = 10: 10 × 13 = 130. <b>Te groot</b>. Probeer x = 5: 5 × 8 = 40. <b>Te klein</b>.</p><p>De oplossing zit <b>tussen 5 en 10</b>. Probeer 7: 7 × 10 = 70. <b>x = 7</b>.</p>',
          wanneer:'terugrekenen niet lukt, bijvoorbeeld als x er twee keer in staat.',
          maak:function(R){
            var v = inklemVgl(R, R.kies(['lin', 'kw'])), m = mInklem(R, v);
            return { vraag:v.vgl, context:'Los op door te proberen. Begin met x = 10.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'verg-los-twee', naam:'x aan twee kanten', kort:'Haal aan beide kanten evenveel x weg, zodat x nog maar aan één kant staat',
          uit:'<p>Bij 3x + 4 = x + 12 staan er <b>aan beide kanten zakjes</b>. Terugrekenen gaat dan niet.</p><p>Gebruik de balans. Haal aan beide kanten <b>1 zakje</b> weg: 2x + 4 = 12. Haal aan beide kanten 4 weg: 2x = 8.</p><p>Dus x = 8 : 2 = <b>4</b>.</p>',
          wanneer:'de x aan beide kanten van het isgelijkteken staat.',
          beeld:balans({ x:3, b:4 }, { x:1, b:12 }, { tekst:['3x + 4', 'x + 12'] }),
          maak:function(R){
            var g = tweeGetallen(R), m = mTwee(R, g.a, g.b, g.c, g.d);
            return { vraag:E([[g.a, 'x'], [g.b, '']]) + ' = ' + E([[g.c, 'x'], [g.d, '']]), context:'Los op met de balans.', beeld:m.beeld, stappen:m.stappen };
          } },
        { id:'verg-los-controle', naam:'De oplossing controleren', kort:'Vul de oplossing in: komen links en rechts hetzelfde uit, dan klopt het',
          uit:'<p>Een oplossing kun je altijd <b>controleren</b>. Vul het getal in op de plek van x, links en rechts.</p><p>Is x = 4 de oplossing van 3x + 4 = x + 12? Links: 3 × 4 + 4 = 16. Rechts: 4 + 12 = 16. <b>Gelijk</b>, dus het klopt.</p><p>Komt er links iets anders uit dan rechts? Dan is het <b>niet</b> de oplossing.</p>',
          wanneer:'je een vergelijking hebt opgelost en wilt weten of je antwoord goed is.',
          maak:function(R){
            var twee = R.heel(0, 1) === 1, a, b, c, d, x, p;
            if (twee){ var g = tweeGetallen(R); a = g.a; b = g.b; c = g.c; d = g.d; x = g.x; }
            else { a = R.heel(2, 9); x = R.heel(2, 12); b = R.heel(1, 20); c = 0; d = a * x + b; }
            p = R.heel(0, 1) ? x : x + R.kies([-2, -1, 1, 2]); if (p < 1) p = x + 1;
            function sub(k, v){ return k === 1 ? String(v) : k + ' × ' + v; }
            var L = a * p + b, Rv = c * p + d, klopt = L === Rv, vgl = E([[a, 'x'], [b, '']]) + ' = ' + (twee ? E([[c, 'x'], [d, '']]) : T(d));
            var st = [S('Vul x = ' + p + ' in. Links: ' + sub(a, p) + ' + ' + b + ' =', L, 'Eerst ' + sub(a, p) + ' = ' + a * p + ', dan + ' + b + '.')];
            if (twee) st.push(S('Rechts: ' + sub(c, p) + ' + ' + d + ' =', Rv, (c === 1 ? 'x is ' + p : 'Eerst ' + sub(c, p) + ' = ' + c * p) + ', dan + ' + d + '.'));
            st.push(K(R, 'Links is ' + L + ', rechts is ' + Rv + '. Is x = ' + p + ' de oplossing?', klopt ? 'ja, links en rechts zijn gelijk' : 'nee, links en rechts zijn niet gelijk', [], klopt ? 'Links en rechts komen allebei op ' + L + '.' : L + ' en ' + Rv + ' zijn niet gelijk.', { orde:['ja, links en rechts zijn gelijk', 'nee, links en rechts zijn niet gelijk'] }));
            return eindKeuze({ vraag:vgl, context:'Is x = ' + p + ' een oplossing? Controleer door in te vullen.', stappen:st });
          } },
        { id:'verg-los-kies', naam:'Kies de handigste manier', kort:'x aan twee kanten: balans. x één keer: terugrekenen. x keer zichzelf: inklemmen',
          uit:'<p>Kijk eerst goed naar de vergelijking en <b>kies</b> dan:</p><p>Staat x <b>aan beide kanten</b>? Gebruik de <b>balansmethode</b>. Staat x er <b>één keer</b> in, met bewerkingen erachter (delen, haakjes)? <b>Terugrekenen</b> met een pijlenketting. Wordt x <b>met zichzelf</b> vermenigvuldigd, zoals x(x + 3)? Dan werken die twee niet: <b>inklemmen</b> met een tabel.</p>',
          wanneer:'je een vergelijking snel en zonder fouten wilt oplossen.',
          maak:function(R){
            var s = R.heel(0, 2), m, vraag, juist, uitleg;
            if (s === 0){ var g = tweeGetallen(R); m = mTwee(R, g.a, g.b, g.c, g.d); vraag = E([[g.a, 'x'], [g.b, '']]) + ' = ' + E([[g.c, 'x'], [g.d, '']]); juist = 'de balansmethode'; uitleg = 'x staat aan beide kanten. Terugrekenen gaat dan niet. Met de balans haal je eerst de x weg aan één kant.'; }
            else if (s === 1){ var v = terugVgl(R, R.kies(['dp', 'hk'])); m = mTerug(R, v); vraag = v.vgl; juist = 'terugrekenen'; uitleg = 'x staat er maar één keer in, met een paar bewerkingen erachter. Met een pijlenketting reken je die terug.'; }
            else { var w = inklemVgl(R, 'kw'); m = mInklem(R, w); vraag = w.vgl; juist = 'inklemmen met een tabel'; uitleg = 'x wordt met zichzelf vermenigvuldigd. Terugrekenen en de balans werken dan niet. Probeer getallen.'; }
            return { vraag:vraag, context:'Kies eerst de handigste manier. Los de vergelijking dan op.', beeld:function(n){ return n < 1 ? '' : m.beeld(n - 1); },
              stappen:[K(R, 'Welke manier is hier het handigst?', juist, ['de balansmethode', 'terugrekenen', 'inklemmen met een tabel'], uitleg, { waarom:uitleg })].concat(m.stappen) };
          } }
      ] },

    /* ================= vergelijkingen opstellen (2F) ================= */
    { groep:{ id:'verg-maak', niveau:'2F', domein:'verbanden', naam:'Vergelijkingen opstellen', kd:['rw10B.b', 'rw10B.c', 'rw10B.a'],
        uit:'Bij een verhaal schrijf je zelf de vergelijking op. Na het oplossen vertaal je het antwoord terug naar het verhaal.' },
      doelen:[
        { id:'verg-maak-verhaal', naam:'Een vergelijking bij een verhaal', kort:'Noem het onbekende getal x, schrijf de stukken van het verhaal met x en zet ze gelijk aan het totaal',
          uit:'<p>Tim heeft 3 zakjes knikkers en 5 losse knikkers. Samen 29. Hoeveel zitten er in een zakje?</p><p>Noem het getal dat je <b>niet weet</b> x: het aantal knikkers in een zakje. 3 zakjes is dan <b>3x</b>. Met de losse erbij: 3x + 5.</p><p>Dat is samen 29: <b>3x + 5 = 29</b>. Dat is de vergelijking.</p>',
          wanneer:'je een verhaalsom wilt oplossen met een vergelijking.',
          maak:function(R){
            var v = verhaal(R), it = v.it, eq = eqC(v.vgl);
            return { vraag:'Stel een vergelijking op.', context:v.ctx + ' Gebruik x voor het getal dat je niet weet.', antwoord:v.vgl, controle:eq, invoer:'tekst',
              stappen:[
                K(R, 'Waar staat x voor?', it.x, it.nep, 'x is het getal dat je niet weet. Wat wordt er in het verhaal niet verteld?'),
                SC('Schrijf met x: ' + it.deel(v.a) + ' =', v.a + 'x', exprC(v.a + 'x'), 'Het gaat ' + v.a + ' keer om x. Dat schrijf je als ' + v.a + 'x.'),
                SC('Schrijf de vergelijking op:', v.vgl, eq, it.min ? 'Van de ' + v.c + ' gaat ' + v.a + 'x af. Er blijft ' + v.b + ' over: ' + v.vgl + '.' : v.a + 'x en de ' + v.b + ' erbij is samen ' + v.c + ': ' + v.vgl + '.') ] };
          } },
        { id:'verg-maak-kies', naam:'Welke vergelijking hoort bij het verhaal?', kort:'Kijk welk getal x keer gaat en wat het totaal is, en kies de vergelijking die dat zegt',
          uit:'<p>Bij een verhaal kun je soms <b>kiezen</b> uit een paar vergelijkingen. Ze lijken op elkaar, dus lees goed.</p><p>Vraag je af: waar staat x voor? <b>Hoe vaak</b> komt x voor? Dat getal staat <b>voor de x</b>. Wat komt erbij of gaat eraf? En wat is het <b>totaal</b>?</p><p>Lisa heeft € 30, koopt 3 boeken van x euro en houdt € 6 over: <b>30 − 3x = 6</b>.</p>',
          wanneer:'je bij een verhaal de goede vergelijking moet herkennen.',
          maak:function(R){
            var v = verhaal(R), it = v.it, a = v.a, b = v.b, c = v.c, nep;
            if (it.min) nep = [a + 'x − ' + c + ' = ' + b, c + ' + ' + a + 'x = ' + b, c + ' − ' + b + 'x = ' + a, a + 'x − ' + b + ' = ' + c];
            else nep = [b + 'x + ' + a + ' = ' + c, a + 'x = ' + b + ' + ' + c, 'x + ' + a + ' + ' + b + ' = ' + c, a + 'x − ' + b + ' = ' + c];
            nep = R.hussel(uniek(nep.map(function(x){ return x.replace(/ - /g, ' − '); })).filter(function(x){ return x !== v.vgl; })).slice(0, 3);
            return eindKeuze({ vraag:'Welke vergelijking past?', context:v.ctx + ' x is ' + it.x + '.',
              stappen:[
                S('Hoe vaak komt x voor? Dat getal staat voor de x.', a, 'Lees het verhaal: hoeveel keer gaat het om ' + it.x + '?'),
                K(R, 'Gaat het ' + a + 'x er van een getal af, of komt er iets bij?', it.min ? 'het gaat eraf' : 'er komt iets bij', [it.min ? 'er komt iets bij' : 'het gaat eraf'], it.min ? 'Er wordt iets gekocht of brandt op. Dat gaat eraf.' : 'Er komt nog iets bij de ' + a + 'x.', { orde:['er komt iets bij', 'het gaat eraf'] }),
                K(R, 'Welke vergelijking hoort bij het verhaal?', v.vgl, nep, it.min ? 'Begin bij ' + c + ', haal ' + a + 'x eraf, dan blijft ' + b + ' over.' : a + 'x plus ' + b + ' is samen ' + c + '.') ] });
          } },
        { id:'verg-maak-abo', naam:'Twee abonnementen: wanneer even duur?', kort:'Schrijf de kosten van allebei met x, zet ze gelijk en los de vergelijking op',
          uit:'<p>Sportschool A kost € 20 per maand en € 2 per les. Sportschool B kost € 8 per maand en € 5 per les. Wanneer zijn ze <b>even duur</b>?</p><p>Kosten A: 20 + 2x. Kosten B: 8 + 5x. <b>Zet ze gelijk</b>: 20 + 2x = 8 + 5x.</p><p>Haal 2x en 8 aan beide kanten weg: 12 = 3x. Dus x = <b>4 lessen</b>. Ga je vaker, dan is A goedkoper.</p>',
          wanneer:'je twee prijzen of abonnementen vergelijkt.',
          maak:function(R){
            var it = R.kies([{ A:'Sportschool Fit', B:'Sportschool Sterk', enk:'les', mv:'lessen' }, { A:'Bioscooppas Goud', B:'Bioscooppas Basis', enk:'film', mv:'films' },
              { A:'Bundel Groot', B:'Bundel Klein', enk:'GB', mv:'GB' }, { A:'Zwembad Plus', B:'Zwembad Los', enk:'keer zwemmen', mv:'keer' }, { A:'Muziekschool Vast', B:'Muziekschool Vrij', enk:'les', mv:'lessen' }]);
            var pa = R.heel(1, 4), d = R.heel(2, 4), pb = pa + d, x = R.heel(2, 10), vB = R.heel(5, 15), vA = vB + d * x;
            var kA = E([[vA, ''], [pa, 'x']]), kB = E([[vB, ''], [pb, 'x']]), vgl = kA + ' = ' + kB, xmax = Math.max(x + 2, Math.min(12, 2 * x)), top = Math.max(vA + pa * xmax, vB + pb * xmax), st = mooi(top);
            var ctx = it.A + ' kost € ' + vA + ' per maand en € ' + pa + ' per ' + it.enk + '. ' + it.B + ' kost € ' + vB + ' per maand en € ' + pb + ' per ' + it.enk + '.';
            return { vraag:'Bij hoeveel ' + it.mv + ' even duur?', context:ctx + ' Gebruik x voor het aantal ' + it.mv + ' per maand.', eenheid:it.mv, antwoord:metE(x, it.mv),
              beeld:function(n){ return graf({ xmax:xmax, ymax:boven(top, st), ystap:st, xnaam:it.mv, ynaam:'kosten (€)', lijnen:[{ a:pa, b:vA, k:0, naam:'A' }, { a:pb, b:vB, k:3, naam:'B' }], punten:n >= 5 ? [{ x:x, y:vA + pa * x, k:1, label:'even duur' }] : [] }); },
              stappen:[
                SC('De kosten van ' + it.A + ' bij x ' + it.mv + ':', kA, exprC(kA), 'Het vaste bedrag ' + vA + ' plus ' + pa + ' keer x.'),
                SC('De kosten van ' + it.B + ':', kB, exprC(kB), 'Het vaste bedrag ' + vB + ' plus ' + pb + ' keer x.'),
                SC('Even duur: zet ze gelijk.', vgl, eqC(vgl), 'De kosten van ' + it.A + ' = de kosten van ' + it.B + ': ' + vgl + '.'),
                S('Haal aan beide kanten ' + E([[pa, 'x']]) + ' en ' + vB + ' weg. Dan staat er ' + (vA - vB) + ' = …x. Welk getal komt op de puntjes?', d, 'Rechts blijft ' + pb + 'x − ' + E([[pa, 'x']]) + ' over.'),
                S('x = ' + (vA - vB) + ' : ' + d + ' =', metE(x, it.mv), 'Verdeel ' + (vA - vB) + ' over ' + d + '.', F(x, vA - vB, 'Dat is ' + d + 'x. Deel nog door ' + d + '.')) ] };
          } },
        { id:'verg-maak-terug', naam:'De oplossing terugvertalen', kort:'Zeg wat x betekent, rond af zoals de situatie vraagt en schrijf het antwoord met de eenheid',
          uit:'<p>Je hebt x gevonden. Maar wat <b>betekent</b> dat getal in het verhaal? Kijk terug naar waar x voor staat.</p><p>Soms moet je <b>afronden</b>. x = 6,4 weken sparen: na 6 weken heb je nog niet genoeg. Je hebt <b>7 weken</b> nodig. x = 7,6 pakjes kopen: je kunt er maar <b>7</b> kopen.</p><p>Schrijf het antwoord als een zin of met de <b>eenheid</b> erbij: 7 weken, niet alleen 7.</p>',
          wanneer:'je een vergelijking hebt opgelost en het antwoord moet geven in het verhaal.',
          maak:function(R){
            var s = R.heel(0, 4), a, b, c, x, xs, ctx, vgl, vr, goedB, nepB, rond, ans, eh, hintR, ook = [];
            var RO = ['nee, het klopt precies', 'ja, naar boven', 'ja, naar beneden'];
            function nietHeel(){ var q; do { q = c; } while (false); return q; }
            if (s === 0){ a = R.heel(2, 6); b = R.heel(2, 15); x = R.heel(4, 15); c = a * x + b; xs = T(x); vgl = E([[a, 'x'], [b, '']]) + ' = ' + c;
              ctx = 'Tim heeft ' + a + ' zakjes met knikkers en ' + b + ' losse knikkers. Samen ' + c + '.'; vr = 'Hoeveel knikkers zitten er in een zakje?';
              goedB = 'In elk zakje zitten ' + x + ' knikkers.'; nepB = ['Tim heeft ' + x + ' knikkers.', 'Tim heeft ' + x + ' zakjes.']; rond = RO[0]; ans = x; eh = 'knikkers'; hintR = 'x is een heel getal. Er hoeft niets afgerond te worden.'; }
            else if (s === 1){ do { a = R.kies([3, 4, 6, 7, 8, 9]); b = R.heel(5, 40); c = R.heel(9, 25) * 10; } while ((c - b) % a === 0 || c - b < 3 * a); x = (c - b) / a; xs = T(Math.round(x * 10) / 10);
              vgl = E([[a, 'x'], [b, '']]) + ' = ' + c; ctx = 'Noor heeft al € ' + b + ' en spaart elke week € ' + a + '. Ze wil een fiets van € ' + c + '.'; vr = 'Na hoeveel weken heeft Noor genoeg?';
              goedB = 'Na ' + xs + ' weken heeft Noor precies genoeg.'; nepB = ['Noor spaart € ' + xs + ' per week.', 'De fiets kost € ' + xs + '.']; rond = RO[1]; ans = Math.ceil(x); eh = 'weken';
              hintR = 'Na ' + Math.floor(x) + ' weken heeft ze nog niet genoeg. Ze moet dus nog een hele week sparen.'; }
            else if (s === 2){ do { a = R.kies([3, 4, 6, 7, 8, 9]); b = R.heel(5, 15); c = R.heel(4, 9) * 10; } while ((c - b) % a === 0 || c - b < 2 * a); x = (c - b) / a; xs = T(Math.round(x * 10) / 10);
              vgl = E([[a, 'x'], [b, '']]) + ' = ' + c; ctx = 'Je hebt € ' + c + '. Je koopt een album van € ' + b + ' en daarna zoveel mogelijk pakjes stickers van € ' + a + '.'; vr = 'Hoeveel pakjes kun je kopen?';
              goedB = 'Met je geld kun je ' + xs + ' pakjes kopen.'; nepB = ['Een pakje kost € ' + xs + '.', 'Je houdt € ' + xs + ' over.']; rond = RO[2]; ans = Math.floor(x); eh = 'pakjes';
              hintR = 'Een half pakje kun je niet kopen. Voor ' + Math.ceil(x) + ' pakjes is je geld niet genoeg.'; }
            else if (s === 3){ do { a = R.kies([6, 7, 8, 9]); c = R.heel(25, 90); } while (c % a === 0); x = c / a; xs = T(Math.round(x * 10) / 10);
              vgl = E([[a, 'x']]) + ' = ' + c; ctx = 'Er gaan ' + c + ' leerlingen mee op kamp. In een busje passen ' + a + ' leerlingen.'; vr = 'Hoeveel busjes zijn nodig?';
              goedB = 'Je hebt ' + xs + ' busjes nodig.'; nepB = ['In een busje passen ' + xs + ' leerlingen.', 'Er gaan ' + xs + ' leerlingen mee.']; rond = RO[1]; ans = Math.ceil(x); eh = 'busjes';
              hintR = 'In ' + Math.floor(x) + ' busjes past niet iedereen. Er moet nog een busje bij.'; }
            else { a = R.kies([2, 4, 6]); x = R.heel(3, 12) / 2; b = R.heel(4, 10); c = b + a * x; xs = T(x);
              vgl = E([[c, ''], [-a, 'x']]) + ' = ' + b; ctx = 'Een kaars is ' + c + ' cm lang. Elk uur brandt er ' + a + ' cm af.'; vr = 'Na hoeveel uur is hij nog ' + b + ' cm?';
              goedB = 'De kaars brandt ' + xs + ' uur.'; nepB = ['Er brandt ' + xs + ' cm per uur af.', 'De kaars is nog ' + xs + ' cm.']; rond = RO[0]; ans = x; eh = 'uur';
              hintR = 'Een half uur kan gewoon. Er hoeft niets afgerond te worden.'; if (x % 1) ook = [Math.floor(x) + ' uur en 30 minuten', Math.floor(x) + ' uur 30 minuten']; }
            var ant = metE(ans, eh).concat(ook);
            return { vraag:vr, context:ctx + ' Je lost ' + vgl + ' op en vindt x ' + (x % 1 && s !== 4 ? '≈ ' : '= ') + xs + '.', eenheid:eh, antwoord:ant,
              stappen:[
                K(R, 'Wat betekent x = ' + xs + ' hier?', goedB, nepB, 'Kijk waar x voor staat in de vergelijking ' + vgl + '.'),
                K(R, 'Moet je het antwoord afronden?', rond, [], hintR, { orde:RO }),
                S('Het antwoord in het verhaal:', ant, rond === RO[1] ? 'Rond ' + xs + ' naar boven af op een heel getal.' : rond === RO[2] ? 'Rond ' + xs + ' naar beneden af op een heel getal.' : 'Het antwoord is ' + xs + ' ' + eh + '.',
                  rond === RO[1] ? F(ans, Math.floor(x), 'Dan is het net niet genoeg. Rond naar boven af.') : rond === RO[2] ? F(ans, Math.ceil(x), 'Daar is je geld niet genoeg voor. Rond naar beneden af.') : null) ] };
          } }
      ] },

    /* ================= lineaire verbanden (2F) ================= */
    { groep:{ id:'lin-verband', niveau:'2F', domein:'verbanden', naam:'Lineaire verbanden', kd:['rw12A.c', 'rw12A.d', 'rw12A.e'],
        uit:'Bij een lineair verband komt er steeds evenveel bij. Je herkent het in een tabel, aan een rechte lijn en aan een formule: y = hellingsgetal × x + startgetal.' },
      doelen:[
        { id:'lin-tabel', naam:'Startgetal en hellingsgetal uit een tabel', kort:'Het hellingsgetal is wat y verandert als x 1 groter wordt, het startgetal is y bij x = 0',
          uit:'<p>In een lineaire tabel verandert y steeds evenveel. Het <b>hellingsgetal</b> is wat er bij y bijkomt als x <b>1</b> groter wordt.</p><p>Gaat x in stappen van 2 en komt er bij y steeds 8 bij? Dan is het hellingsgetal 8 : 2 = <b>4</b>.</p><p>Het <b>startgetal</b> is y bij x = 0. Samen geven ze de formule: <b>y = 4x + startgetal</b>.</p>',
          wanneer:'je bij een tabel de formule zoekt, ook als x niet in stappen van 1 gaat.',
          maak:function(R){
            var dx = R.kies([2, 5, 10]), a = R.kies({ 2:[1.5, 2, 3, 4, 5, -2, -3], 5:[2, 3, 4, 6, -2], 10:[0.5, 1.5, 2, 3, -1] }[dx]), x0 = R.kies([0, 0, dx]);
            var b = a < 0 ? R.heel(-a * (x0 + 4 * dx), -a * (x0 + 4 * dx) + 30) : R.heel(2, 30), xs = [0, 1, 2, 3, 4].map(function(i){ return x0 + i * dx; }), ys = xs.map(function(x){ return a * x + b; }), dy = a * dx;
            function tab(n){ var p = []; for (var i = 2; i <= 5; i++){ p.push({ van:i - 1, naar:i, tekst:'+' + dx }); if (n >= 1) p.push({ van:i - 1, naar:i, tekst:(dy < 0 ? MIN + T(-dy) : '+' + T(dy)), onder:true }); }
              return R.teken.tabel([['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))], { zijkop:true, pijlen:p }); }
            var f = formS(a, b);
            return { vraag:'tabel ' + ys.map(T).join(' '), vraagHtml:'Welke formule hoort bij de tabel?', context:'Zoek het hellingsgetal en het startgetal. Schrijf de formule zoals y = 3x + 5.', beeld:tab, zelfBeeld:tab(0), antwoord:f, controle:formC(a, b), invoer:'tekst',
              stappen:[
                S('x gaat steeds ' + dx + ' omhoog. Hoeveel verandert y dan? Van ' + T(ys[0]) + ' naar ' + T(ys[1]) + ':', T(dy), dy < 0 ? 'y wordt kleiner. Dan zet je er een min voor: ' + T(ys[1]) + ' − ' + T(ys[0]) + '.' : 'Reken ' + T(ys[1]) + ' − ' + T(ys[0]) + '.', dy < 0 ? F(dy, -dy, 'Let op: y wordt kleiner. Dan zet je er een min voor.') : null),
                S('Het hellingsgetal is wat er bij 1 stap van x verandert: ' + T(dy) + ' : ' + dx + ' =', T(a), 'Deel de verandering van y door de stap van x.', F(a, dy, 'Dat is bij een stap van ' + dx + '. Deel nog door ' + dx + '.')),
                x0 === 0 ? S('Het startgetal is y bij x = 0. Kijk in de tabel:', b, 'Zoek x = 0 in de bovenste rij. Wat staat eronder?')
                  : S('Het startgetal is y bij x = 0. Ga een stap terug: ' + pm(ys[0], -dy) + ' =', b, 'Van x = ' + dx + ' naar x = 0 is een stap terug. Draai de verandering om.', F(b, ys[0], 'Dat is y bij x = ' + dx + '. Ga nog terug naar x = 0.')),
                SC('De formule:', f, formC(a, b), 'y = hellingsgetal × x + startgetal: ' + f + '.') ] };
          } },
        { id:'lin-grafiek', naam:'Startgetal en hellingsgetal uit een grafiek', kort:'Het startgetal lees je af op de verticale as, het hellingsgetal is hoeveel de lijn stijgt per stap naar rechts',
          uit:'<p>Een lineair verband is in een grafiek een <b>rechte lijn</b>. Waar de lijn de <b>verticale as</b> snijdt, lees je het <b>startgetal</b> af.</p><p>Het <b>hellingsgetal</b> zie je aan hoe steil de lijn is. Ga een paar hokjes naar rechts en kijk hoeveel de lijn omhoog gaat. Deel door het aantal hokjes naar rechts.</p><p>Gaat de lijn <b>omlaag</b>? Dan is het hellingsgetal negatief.</p>',
          wanneer:'je bij een rechte lijn de formule zoekt.',
          maak:function(R){
            var POS = [[0.5, 1, [1, 2, 3, 4, 5], [2, 4]], [1, 1, [1, 2, 3, 4], [1, 2, 3]], [1.5, 3, [0, 3, 6], [2, 4]], [2, 2, [2, 4, 6, 8], [1, 2, 3]], [2.5, 5, [5, 10, 15], [2, 4]], [3, 3, [3, 6, 9, 12], [1, 2]], [4, 4, [4, 8, 12], [1, 2]], [5, 5, [5, 10, 15, 20], [1, 2]], [10, 10, [10, 20, 30], [1, 2]]];
            var NEG = [[-1, 1, [6, 7, 8], [1, 2, 3]], [-2, 2, [10, 12, 14, 16], [1, 2, 3]], [-3, 3, [15, 18, 21, 24], [1, 2]], [-5, 5, [25, 30, 35, 40], [1, 2]], [-10, 10, [50, 60, 70, 80], [1, 2]]];
            var c = R.heel(0, 3) === 0 ? R.kies(NEG) : R.kies(POS), a = c[0], ys = c[1], b = R.kies(c[2]), k = R.kies(c[3]), yk = b + a * k, ymax = a > 0 ? boven(a * 8 + b, ys) : b + ys, f = formS(a, b);
            function pl(n){ var p = [], t = []; if (n >= 1) p.push({ x:0, y:b, k:1 }); if (n >= 2) p.push({ x:k, y:yk, k:1 }); if (n >= 3) t.push({ x1:0, y1:b, x2:k, y2:yk, dx:'+' + k, dy:(a * k < 0 ? MIN + T(-a * k) : '+' + T(a * k)) });
              return graf({ xmax:8, ymax:ymax, ystap:ys, lijnen:[{ a:a, b:b, k:0 }], punten:p, trap:t }); }
            var st = [
              S('Waar snijdt de lijn de verticale as? Dat is het startgetal.', T(b), 'Kijk bij x = 0. Op welke hoogte zit de lijn daar?'),
              S('Lees af: bij x = ' + k + ' is y =', T(yk), 'Ga vanaf ' + k + ' op de horizontale as recht omhoog naar de lijn, en dan opzij naar de verticale as.'),
              S('Hoeveel is de lijn ' + (a > 0 ? 'gestegen' : 'gedaald') + ' van x = 0 tot x = ' + k + '?' + (k === 1 ? ' Dat is het hellingsgetal.' : '') + ' ' + T(yk) + ' − ' + T(b) + ' =', T(a * k), a > 0 ? 'Van ' + T(b) + ' naar ' + T(yk) + '.' : 'De lijn gaat omlaag, dus de uitkomst is negatief.', a < 0 ? F(a * k, -a * k, 'De lijn gaat omlaag. Dan is het een min-getal.') : null) ];
            if (k > 1) st.push(S('Per 1 naar rechts (het hellingsgetal): ' + T(a * k) + ' : ' + k + ' =', T(a), 'Deel door het aantal stappen naar rechts: ' + k + '.', F(a, a * k, 'Dat is bij ' + k + ' stappen naar rechts. Deel nog door ' + k + '.')));
            st.push(SC('De formule:', f, formC(a, b), 'y = hellingsgetal × x + startgetal: ' + f + '.'));
            return { vraag:'lijn ' + f, vraagHtml:'Welke formule hoort bij de lijn?', context:'Lees het startgetal en het hellingsgetal af. Schrijf de formule zoals y = 3x + 5.', beeld:pl, zelfBeeld:pl(0), antwoord:f, controle:formC(a, b), invoer:'tekst', stappen:st };
          } },
        { id:'lin-verhaal', naam:'Startgetal en hellingsgetal uit een verhaal', kort:'Het vaste bedrag of het begin is het startgetal, wat er per stuk bijkomt het hellingsgetal',
          uit:'<p>Een taxi kost € 4 om in te stappen en € 2 per kilometer. Het <b>vaste bedrag</b> (€ 4) betaal je altijd: dat is het <b>startgetal</b>.</p><p>Wat er <b>per kilometer</b> bijkomt (€ 2) is het <b>hellingsgetal</b>. De formule: y = 2x + 4, met x het aantal kilometers.</p><p>Wordt iets steeds <b>minder</b>, zoals een kaars die opbrandt? Dan is het hellingsgetal negatief: y = −3x + 24.</p>',
          wanneer:'je bij een verhaal met een vast bedrag en een bedrag per stuk een formule maakt.',
          maak:function(R){
            var it = R.kies([
              { t:function(a, b){ return 'Een taxi kost ' + Gk(b) + ' om in te stappen en ' + Gk(a) + ' per kilometer.'; }, x:'het aantal kilometers', y:'de prijs in euro', enk:'kilometer', ar:[1.5, 2, 2.5, 3], br:[3, 4, 5, 6] },
              { t:function(a, b){ return 'Een fiets huren kost ' + Gk(b) + ' borg en ' + Gk(a) + ' per dag.'; }, x:'het aantal dagen', y:'de kosten in euro', enk:'dag', ar:[5, 6, 7, 8, 10, 12], br:[10, 15, 20, 25, 50] },
              { t:function(a, b){ return 'Een plant is nu ' + T(b) + ' cm hoog. Hij groeit elke week ' + T(a) + ' cm.'; }, x:'het aantal weken', y:'de hoogte in cm', enk:'week', ar:[1.5, 2, 3, 4, 5], br:[5, 8, 10, 12, 15, 20] },
              { t:function(a, b){ return 'Een kaars is ' + T(b) + ' cm lang. Elk uur wordt hij ' + T(-a) + ' cm korter.'; }, x:'het aantal uren', y:'de lengte in cm', enk:'uur', ar:[-1, -2, -3, -1.5], br:[20, 24, 25, 30] },
              { t:function(a, b){ return 'In een bad zit ' + T(b) + ' liter water. Elke minuut stroomt er ' + T(-a) + ' liter uit.'; }, x:'het aantal minuten', y:'het aantal liter in het bad', enk:'minuut', ar:[-5, -8, -10, -12, -15], br:[120, 150, 180, 200] },
              { t:function(a, b){ return 'Je hebt ' + Gk(b) + ' in je spaarpot. Elke week doe je er ' + Gk(a) + ' bij.'; }, x:'het aantal weken', y:'het geld in euro', enk:'week', ar:[2, 2.5, 3, 4, 5], br:[10, 12, 15, 20, 25, 30] },
              { t:function(a, b){ return 'Een abonnement kost ' + Gk(b) + ' per maand plus ' + Gk(a) + ' per GB.'; }, x:'het aantal GB', y:'de kosten per maand in euro', enk:'GB', ar:[1, 2, 3, 4], br:[5, 8, 10, 12, 15] } ]);
            var a = R.kies(it.ar), b = R.kies(it.br), f = formS(a, b), dalend = a < 0;
            return { vraag:'Welke formule hoort erbij?', context:it.t(a, b) + ' x staat voor ' + it.x + ' en y voor ' + it.y + '.', antwoord:f, controle:formC(a, b), invoer:'tekst',
              beeld:function(n){ return n < 2 ? '' : R.teken.tabel([['x', '0', '1', '2', '3'], ['y'].concat([0, 1, 2, 3].map(function(x){ return T(a * x + b); }))], { zijkop:true, nadruk:[[1, 1]] }); },
              stappen:[
                S('Wat is het startgetal? Dat is y bij x = 0: ' + (dalend ? 'waar je mee begint.' : 'het vaste bedrag of het begin.'), T(b), 'Wat is er al voordat er ook maar één ' + it.enk + ' voorbij is?', F(b, Math.abs(a), 'Dat is wat er per ' + it.enk + ' verandert. Het startgetal is waar je mee begint.')),
                S('Wat is het hellingsgetal? Dat is wat er per ' + it.enk + ' bijkomt' + (dalend ? '. Het wordt minder, dus zet er een min voor.' : '.'), T(a), dalend ? 'Elke ' + it.enk + ' gaat er ' + T(-a) + ' af. Het hellingsgetal is dan ' + T(a) + '.' : 'Elke ' + it.enk + ' komt er ' + T(a) + ' bij.', dalend ? F(a, -a, 'Het wordt elke ' + it.enk + ' minder. Dan is het hellingsgetal negatief: ' + T(a) + '.') : F(a, b, 'Dat is het startgetal.')),
                SC('De formule:', f, formC(a, b), 'y = hellingsgetal × x + startgetal: ' + f + '.') ] };
          } },
        { id:'lin-twee', naam:'De formule uit twee gegevens', kort:'Deel het verschil in y door het verschil in x, en reken dan terug naar x = 0',
          uit:'<p>Een fiets huren kost € 27 voor 3 dagen en € 47 voor 7 dagen. Het verband is lineair. Wat is de formule?</p><p>Vergelijk de twee: 4 dagen meer kost € 20 meer. Per dag is dat 20 : 4 = <b>5</b>: het hellingsgetal.</p><p>Reken terug naar 0 dagen: 27 − 3 × 5 = <b>12</b>: het startgetal. De formule is <b>y = 5x + 12</b>.</p>',
          wanneer:'je twee punten of twee prijzen weet, maar geen tabel of startgetal.',
          maak:function(R){
            var it = R.kies([
              { t:function(x1, y1, x2, y2){ return 'Een fiets huren kost € ' + y1 + ' voor ' + x1 + ' dagen en € ' + y2 + ' voor ' + x2 + ' dagen.'; }, enk:'dag', mv:'dagen', y:'de kosten in euro' },
              { t:function(x1, y1, x2, y2){ return 'Een taxirit van ' + x1 + ' km kost € ' + y1 + '. Een rit van ' + x2 + ' km kost € ' + y2 + '.'; }, enk:'km', mv:'kilometers', y:'de prijs in euro' },
              { t:function(x1, y1, x2, y2){ return 'Een loodgieter rekent voor ' + x1 + ' uur werk € ' + y1 + ' en voor ' + x2 + ' uur € ' + y2 + '. Er zitten voorrijkosten in.'; }, enk:'uur', mv:'uren', y:'de kosten in euro' },
              { t:function(x1, y1, x2, y2){ return 'Na ' + x1 + ' weken is een plant ' + y1 + ' cm hoog. Na ' + x2 + ' weken is hij ' + y2 + ' cm.'; }, enk:'week', mv:'weken', y:'de hoogte in cm' },
              { t:function(x1, y1, x2, y2){ return 'Bowlen kost € ' + y1 + ' voor ' + x1 + ' spellen en € ' + y2 + ' voor ' + x2 + ' spellen, met de schoenen erbij.'; }, enk:'spel', mv:'spellen', y:'de kosten in euro' } ]);
            var a = R.heel(2, 9), b = R.heel(3, 30), x1 = R.heel(1, 5), x2 = x1 + R.heel(2, 5), y1 = a * x1 + b, y2 = a * x2 + b, f = formS(a, b), xmax = x2 + 1, st = mooi(a * xmax + b);
            return { vraag:'Welke formule hoort erbij?', context:it.t(x1, y1, x2, y2) + ' Het verband is lineair. x staat voor het aantal ' + it.mv + ' en y voor ' + it.y + '.', antwoord:f, controle:formC(a, b), invoer:'tekst',
              beeld:function(n){ return graf({ xmax:xmax, ymax:boven(a * xmax + b, st), ystap:st, xnaam:it.mv, lijnen:n >= 5 ? [{ a:a, b:b, k:0 }] : [], punten:[{ x:x1, y:y1, k:1, label:'(' + x1 + ', ' + y1 + ')' }, { x:x2, y:y2, k:1, label:'(' + x2 + ', ' + y2 + ')' }].concat(n >= 4 ? [{ x:0, y:b, k:3 }] : []),
                trap:n >= 2 ? [{ x1:x1, y1:y1, x2:x2, y2:y2, dx:'+' + (x2 - x1), dy:'+' + (y2 - y1) }] : [] }); },
              stappen:[
                S('Hoeveel ' + it.mv + ' scheelt het? ' + x2 + ' − ' + x1 + ' =', x2 - x1, 'Het verschil tussen ' + x2 + ' en ' + x1 + '.'),
                S('Hoeveel scheelt y? ' + y2 + ' − ' + y1 + ' =', y2 - y1, 'Het verschil tussen ' + y2 + ' en ' + y1 + '.'),
                S('Per ' + it.enk + ' (het hellingsgetal): ' + (y2 - y1) + ' : ' + (x2 - x1) + ' =', a, 'Verdeel het verschil in y over het verschil in x.', F(a, y2 - y1, 'Dat is voor ' + (x2 - x1) + ' ' + it.mv + '. Deel nog door ' + (x2 - x1) + '.')),
                S('Het startgetal: reken terug naar 0. ' + y1 + ' − ' + x1 + ' × ' + a + ' =', b, 'Haal ' + x1 + ' keer ' + a + ' van ' + y1 + ' af.', x1 > 1 ? F(b, y1 - a, 'Je ging maar één ' + it.enk + ' terug. Ga helemaal terug naar 0.') : null),
                SC('De formule:', f, formC(a, b), 'y = hellingsgetal × x + startgetal: ' + f + '.') ] };
          } },
        { id:'lin-evenredig', naam:'Recht evenredig', kort:'Startgetal 0: deel y door x, dan heb je de formule y = getal × x',
          uit:'<p>Bij een <b>recht evenredig</b> verband hoort bij 0 ook 0. De lijn gaat door de <b>oorsprong</b>, het punt (0, 0). Het startgetal is 0.</p><p>In de tabel krijg je steeds hetzelfde als je <b>y deelt door x</b>. 3 kilo kost € 7,50: 7,50 : 3 = 2,50. Bij 4 kilo: 10 : 4 = 2,50. Klopt.</p><p>De formule is <b>y = 2,5x</b>. Het is een verhoudingstabel.</p>',
          wanneer:'het verband begint bij 0 en dubbel zoveel x ook dubbel zoveel y geeft.',
          beeld:graf({ xmax:8, ymax:20, ystap:2, lijnen:[{ a:2.5, b:0, k:0 }], punten:[{ x:0, y:0, k:1, label:'(0, 0)' }, { x:4, y:10, k:1 }] }),
          maak:function(R){
            var it = R.kies([
              { t:'Appels kosten per kilo altijd hetzelfde.', x:'kilo', y:'prijs (€)', aL:[1.5, 2, 2.5, 3, 3.5], eh:'euro', vr:function(x){ return 'Wat kost ' + x + ' kilo?'; } },
              { t:'Een printer print elke minuut evenveel bladzijden.', x:'minuten', y:'bladzijden', aL:[12, 15, 20, 25], eh:'bladzijden', vr:function(x){ return 'Hoeveel bladzijden in ' + x + ' minuten?'; } },
              { t:'Je loopt steeds even snel.', x:'uur', y:'afstand (km)', aL:[4, 5, 6], eh:'km', vr:function(x){ return 'Hoe ver loop je in ' + x + ' uur?'; } },
              { t:'Kaas kost per kilo altijd hetzelfde.', x:'kilo', y:'prijs (€)', aL:[8, 12, 15, 16], eh:'euro', vr:function(x){ return 'Wat kost ' + x + ' kilo?'; } },
              { t:'Een kraan vult een bak: elke minuut evenveel liter.', x:'minuten', y:'liter', aL:[6, 8, 9, 12], eh:'liter', vr:function(x){ return 'Hoeveel liter na ' + x + ' minuten?'; } },
              { t:'Je verdient elk uur hetzelfde bedrag.', x:'uur', y:'loon (€)', aL:[6, 7.5, 8, 9, 12], eh:'euro', vr:function(x){ return 'Wat verdien je in ' + x + ' uur?'; } } ]);
            var a = R.kies(it.aL), x1 = R.heel(2, 5), x2, x3;
            do { x2 = R.heel(3, 10); } while (x2 === x1);
            do { x3 = R.heel(6, 15); } while (x3 === x1 || x3 === x2);
            var y1 = a * x1, y2 = a * x2, y3 = a * x3;
            function tab(n){ return R.teken.tabel([[it.x, String(x1), String(x2), String(x3)], [it.y, T(y1), T(y2), n >= 4 ? T(y3) : '?']], { zijkop:true, verhouding:true, nadruk:n >= 4 ? [[1, 3]] : [] }); }
            return { vraag:it.vr(x3), context:it.t + ' Het verband is recht evenredig. Maak de formule en reken uit.', beeld:tab, zelfBeeld:tab(0), eenheid:it.eh, antwoord:metE(T(y3), it.eh),
              stappen:[
                S('Hoeveel hoort er bij 1? ' + T(y1) + ' : ' + x1 + ' =', T(a), 'Verdeel ' + T(y1) + ' over ' + x1 + '.'),
                S('Controleer met de tweede kolom: ' + T(y2) + ' : ' + x2 + ' =', T(a), 'Als het recht evenredig is, komt hier hetzelfde uit.'),
                SC('De formule (startgetal 0):', 'y = ' + T(a) + 'x', formC(a, 0), 'Bij recht evenredig is het startgetal 0: y = ' + T(a) + 'x.'),
                S('Vul x = ' + x3 + ' in: ' + T(a) + ' × ' + x3 + ' =', metE(T(y3), it.eh), T(a) + ' keer ' + x3 + '.', F(T(y3), T(y2 + y1), 'Je telde twee kolommen op. Dat mag alleen als de getallen bovenaan ook optellen tot ' + x3 + '.')) ] };
          } },
        { id:'lin-check', naam:'Is het verband lineair?', kort:'Gaat x in gelijke stappen? Kijk dan of er bij y steeds evenveel bijkomt',
          uit:'<p>Een verband is <b>lineair</b> als er bij gelijke stappen van x <b>steeds evenveel</b> bij y bijkomt (of afgaat). Dan is de grafiek een rechte lijn.</p><p>Schrijf de <b>verschillen</b> onder de tabel. 5, 8, 11, 14: steeds + 3. <b>Lineair</b>.</p><p>1, 2, 4, 8: + 1, + 2, + 4. Niet steeds evenveel, dus <b>niet lineair</b>. De grafiek is dan een kromme lijn.</p>',
          wanneer:'je moet beslissen of een tabel bij een rechte lijn hoort.',
          maak:function(R){
            var dx = R.kies([1, 1, 2]), x0 = R.kies([0, 1]), soort = R.kies(['lin', 'lin', 'kw', 'dub']), xs = [0, 1, 2, 3].map(function(i){ return x0 + i * dx; }), f;
            if (soort === 'lin'){ var a = R.kies([2, 3, 4, 5, 6, -2, -3, -4]), b = a < 0 ? R.heel(30, 50) : R.heel(1, 20); f = function(x){ return a * x + b; }; }
            else if (soort === 'kw'){ var c = R.heel(0, 10), m = R.kies([1, 2]); f = function(x){ return m * x * x + c; }; }
            else { var s = R.heel(1, 5); f = function(x){ return s * Math.pow(2, x / dx); }; }
            var ys = xs.map(f), d = [ys[1] - ys[0], ys[2] - ys[1], ys[3] - ys[2]], lin = d[0] === d[1] && d[1] === d[2];
            function tab(n){ var p = []; for (var i = 0; i < Math.min(n, 3); i++) p.push({ van:i + 1, naar:i + 2, tekst:(d[i] < 0 ? MIN + T(-d[i]) : '+' + T(d[i])), onder:true });
              for (var j = 2; j <= 4; j++) p.push({ van:j - 1, naar:j, tekst:'+' + dx });
              return R.teken.tabel([['x'].concat(xs.map(T)), ['y'].concat(ys.map(T))], { zijkop:true, pijlen:p }); }
            var ja = 'ja, er komt steeds evenveel bij', nee = 'nee, er komt niet steeds evenveel bij';
            return eindKeuze({ vraag:'tabel ' + ys.map(T).join(' '), vraagHtml:'Is dit verband lineair?', context:'x gaat steeds ' + dx + ' omhoog. Kijk wat er met y gebeurt.', beeld:tab, zelfBeeld:tab(0),
              stappen:[
                S('Het eerste verschil: ' + T(ys[1]) + ' − ' + T(ys[0]) + ' =', T(d[0]), d[0] < 0 ? 'y wordt kleiner, dus een min-getal.' : 'Hoeveel komt erbij van ' + T(ys[0]) + ' naar ' + T(ys[1]) + '?'),
                S('Het tweede verschil: ' + T(ys[2]) + ' − ' + T(ys[1]) + ' =', T(d[1]), d[1] < 0 ? 'y wordt kleiner, dus een min-getal.' : 'Hoeveel komt erbij van ' + T(ys[1]) + ' naar ' + T(ys[2]) + '?'),
                S('Het derde verschil: ' + T(ys[3]) + ' − ' + T(ys[2]) + ' =', T(d[2]), d[2] < 0 ? 'y wordt kleiner, dus een min-getal.' : 'Hoeveel komt erbij van ' + T(ys[2]) + ' naar ' + T(ys[3]) + '?'),
                K(R, 'De verschillen zijn ' + d.map(T).join(', ') + '. Is het verband lineair?', lin ? ja : nee, [], lin ? 'De verschillen zijn allemaal ' + T(d[0]) + '. Dat is een rechte lijn.' : 'De verschillen zijn niet gelijk. Dan is het geen rechte lijn.', { orde:[ja, nee] }) ] });
          } },
        { id:'lin-snijden', naam:'Twee lijnen: waar snijden ze?', kort:'Maak een tabel van allebei en zoek de x waarbij ze hetzelfde geven: dat is het snijpunt',
          uit:'<p>Twee lineaire verbanden kunnen <b>even groot</b> zijn bij één bepaalde x. In de grafiek <b>snijden</b> de lijnen elkaar daar.</p><p>A: y = 3x + 2 en B: y = x + 8. Maak een tabel. Bij x = 3 geeft A: 3 × 3 + 2 = 11, en B: 3 + 8 = 11. <b>Gelijk</b>.</p><p>Het <b>snijpunt</b> is (3, 11): eerst x, dan y.</p>',
          wanneer:'je wilt weten wanneer twee prijzen, lengtes of afstanden even groot zijn.',
          maak:function(R){
            var a1 = R.heel(2, 5), a2 = R.heel(1, a1 - 1), xs = R.heel(2, 5), b1 = R.heel(0, 10), b2 = b1 + (a1 - a2) * xs, yS = a1 * xs + b1, X0 = [0, 1, 2, 3, 4, 5, 6];
            function yA(x){ return a1 * x + b1; } function yB(x){ return a2 * x + b2; }
            function sub(a, b, x){ return (a === 1 ? String(x) : a + ' × ' + x) + (b ? ' + ' + b : ''); }
            var fA = formS(a1, b1), fB = formS(a2, b2), top = Math.max(yA(6), yB(6)), st = mooi(top);
            function tab(n){ return R.teken.tabel([['x'].concat(X0.map(String)), ['A'].concat(X0.map(function(x){ return x === xs && n < 1 ? '?' : String(yA(x)); })), ['B'].concat(X0.map(function(x){ return x === xs && n < 2 ? '?' : String(yB(x)); }))],
              { zijkop:true, nadruk:n >= 2 ? [[1, xs + 1], [2, xs + 1]] : [] }); }
            function pl(n){ return stapel(tab(n), n >= 3 ? graf({ xmax:6, ymax:boven(top, st), ystap:st, lijnen:[{ a:a1, b:b1, k:0, naam:'A' }, { a:a2, b:b2, k:3, naam:'B' }], punten:[{ x:xs, y:yS, k:1, label:punt(xs, yS) }] }) : ''); }
            return { vraag:'A: ' + fA + ' en B: ' + fB, vraagHtml:'A: ' + Sch(fA) + '<br>B: ' + Sch(fB), context:'Waar snijden de lijnen van A en B? Gebruik de tabel. Schrijf het snijpunt als (x, y).', beeld:pl, zelfBeeld:tab(0), antwoord:punt(xs, yS), controle:puntC(xs, yS), invoer:'tekst',
              stappen:[
                S('Vul de tabel aan. A bij x = ' + xs + ': ' + sub(a1, b1, xs) + ' =', yA(xs), 'Vul ' + xs + ' in op de plek van x in ' + fA + '.'),
                S('B bij x = ' + xs + ': ' + sub(a2, b2, xs) + ' =', yB(xs), 'Vul ' + xs + ' in op de plek van x in ' + fB + '.'),
                SC('A en B zijn hier gelijk. Wat is het snijpunt? Schrijf (x, y).', punt(xs, yS), puntC(xs, yS), 'Bij x = ' + xs + ' geven A en B allebei ' + yS + '. Eerst x, dan y.', F(punt(xs, yS), punt(yS, xs), 'Je draaide ze om. Eerst x, dan y.')) ] };
          } }
      ] },

    /* ================= rekenen met letters (3F) ================= */
    { groep:{ id:'alg-letters', niveau:'3F', domein:'verbanden', naam:'Rekenen met letters', kd:['rw10A.g'],
        uit:'Met letters reken je net als met getallen. Je neemt termen samen, werkt haakjes weg, vult getallen in en haalt een factor buiten haakjes.' },
      doelen:[
        { id:'alg-samen', naam:'Gelijksoortige termen samennemen', kort:'Tel alleen termen met dezelfde letter bij elkaar op, en de losse getallen apart',
          uit:'<p>3a + 5a: dat zijn 3 appels en 5 appels. Samen <b>8a</b>. De letter blijft gewoon staan.</p><p>Alleen <b>gelijksoortige termen</b> mag je samennemen: met dezelfde letter. 4x + 3 + 2x − 1 wordt 6x + 2. De x-termen samen en de getallen samen.</p><p>3a + 2b kun je <b>niet</b> korter schrijven: a en b zijn verschillend.</p>',
          wanneer:'er in een uitdrukking meer termen met dezelfde letter staan.',
          maak:function(R){
            var v = R.heel(0, 2), l, p, q, r, s2, c, d, ex, res, st;
            if (v === 0){ l = R.kies(['a', 'b', 'x', 'y', 'p']); p = R.heel(2, 9); q = R.heel(2, 9); var min = R.heel(0, 2) === 0 && p > q, som = min ? p - q : p + q;
              ex = E([[p, l], [min ? -q : q, l]]); res = E([[som, l]]);
              st = [S(min ? p + ' − ' + q + ' =' : p + ' + ' + q + ' =', som, min ? 'Haal de getallen voor de ' + l + ' van elkaar af. De letter ' + l + ' blijft staan.' : 'Tel de getallen voor de ' + l + ' op. De letter ' + l + ' blijft staan.'),
                SC('Dus ' + ex + ' =', res, exprC(res, { kaal:true }), 'Het getal ' + som + ' met de letter erachter.', F(res, som + l + '²', 'Bij optellen blijft het gewoon ' + l + '. ' + l + ' + ' + l + ' is 2' + l + ', niet ' + l + '².', som + l + '2', 'Bij optellen blijft het gewoon ' + l + ', zonder kwadraat.'))]; }
            else if (v === 1){ p = R.heel(2, 9); q = R.heel(1, 9); do { c = R.heel(1, 12); d = R.heel(1, 12); } while (c === d);
              ex = E([[p, 'x'], [c, ''], [q, 'x'], [-d, '']]); res = E([[p + q, 'x'], [c - d, '']]);
              st = [SC('De x-termen samen: ' + E([[p, 'x']]) + ' + ' + E([[q, 'x']]) + ' =', E([[p + q, 'x']]), exprC(E([[p + q, 'x']]), { kaal:true }), p + ' + ' + q + ' = ' + (p + q) + '. De x blijft staan.'),
                S('De getallen samen: ' + c + ' − ' + d + ' =', T(c - d), c < d ? 'Je haalt meer weg dan er is. Dan krijg je een min-getal.' : c + ' min ' + d + '.'),
                SC('Samen:', res, exprC(res, { kaal:true }), 'Eerst de x-term, dan het getal: ' + res + '.', F(res, E([[p + q + c - d, 'x']]), 'Een x-term en een los getal kun je niet samennemen.'))]; }
            else { p = R.heel(4, 9); r = R.heel(1, p - 1); q = R.heel(1, 6); s2 = R.heel(1, 6);
              ex = E([[p, 'a'], [q, 'b'], [-r, 'a'], [s2, 'b']]); res = E([[p - r, 'a'], [q + s2, 'b']]);
              st = [SC('De a-termen samen: ' + E([[p, 'a']]) + ' − ' + E([[r, 'a']]) + ' =', E([[p - r, 'a']]), exprC(E([[p - r, 'a']]), { kaal:true }), p + ' − ' + r + ' = ' + (p - r) + '.'),
                SC('De b-termen samen: ' + E([[q, 'b']]) + ' + ' + E([[s2, 'b']]) + ' =', E([[q + s2, 'b']]), exprC(E([[q + s2, 'b']]), { kaal:true }), 'Let op: een b zonder getal ervoor is 1b.'),
                SC('Samen:', res, exprC(res, { kaal:true }), 'Zet de a-term en de b-term achter elkaar: ' + res + '. Verder samennemen kan niet.', F(res, E([[p - r + q + s2, 'a']]), 'a en b zijn verschillend. Die kun je niet samennemen.', E([[p - r + q + s2, 'ab']]), 'a en b zijn verschillend. Die kun je niet samennemen.'))]; }
            return { vraag:ex, context:'Schrijf zo kort mogelijk.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:st };
          } },
        { id:'alg-haakjes', naam:'Haakjes wegwerken', kort:'Vermenigvuldig het getal voor de haakjes met elke term binnen de haakjes',
          uit:'<p>3(x + 4) betekent: 3 keer alles wat tussen de haakjes staat. Doe het getal voor de haakjes keer <b>elke term</b>.</p><p>3 × x = 3x en 3 × 4 = 12. Dus 3(x + 4) = <b>3x + 12</b>.</p><p>Vergeet de tweede term niet: 3x + 4 is fout. Ook met een letter ervoor: x(x + 5) = x² + 5x.</p>',
          wanneer:'er een getal of letter voor haakjes staat.',
          maak:function(R){
            var v = R.heel(0, 2), l = R.kies(['x', 'a', 'p']), k, m, a, ex, res, st;
            if (v === 0){ k = R.heel(2, 9); m = R.heel(1, 9); ex = k + '(' + l + ' + ' + m + ')'; res = E([[k, l], [k * m, '']]);
              st = [SC(k + ' × ' + l + ' =', k + l, exprC(k + l), k + ' keer ' + l + ' schrijf je als ' + k + l + '.'),
                S(k + ' × ' + m + ' =', k * m, 'Ook de ' + m + ' gaat keer ' + k + '.'),
                SC('Samen: ' + ex + ' =', res, exprC(res, { kaal:true }), 'Zet de twee stukken achter elkaar met een plus.', F(res, E([[k, l], [m, '']]), 'Je deed alleen de ' + l + ' keer ' + k + '. Ook de ' + m + ' moet keer ' + k + '.'))]; }
            else if (v === 1){ k = R.heel(2, 6); a = R.heel(2, 5); m = R.heel(1, 9); ex = k + '(' + E([[a, l], [-m, '']]) + ')'; res = E([[k * a, l], [-k * m, '']]);
              st = [SC(k + ' × ' + a + l + ' =', E([[k * a, l]]), exprC(E([[k * a, l]])), k + ' × ' + a + ' = ' + (k * a) + '. De ' + l + ' blijft staan.'),
                S(k + ' × ' + m + ' =', k * m, k + ' keer ' + m + '.'),
                SC('Samen (let op de min): ' + ex + ' =', res, exprC(res, { kaal:true }), 'Binnen de haakjes stond min. Die min blijft: ' + res + '.', F(res, E([[k * a, l], [k * m, '']]), 'Binnen de haakjes stond min ' + m + '. Dan wordt het min ' + (k * m) + '.'))]; }
            else { m = R.heel(2, 9); ex = l + '(' + l + ' + ' + m + ')'; res = l + '² + ' + m + l;
              st = [SC(l + ' × ' + l + ' =', l + '²', exprC(l + '²'), l + ' keer zichzelf is ' + l + ' in het kwadraat: ' + l + '².', F(l + '²', '2' + l, l + ' × ' + l + ' is ' + l + '², niet 2' + l + '. Dat zou ' + l + ' + ' + l + ' zijn.')),
                SC(l + ' × ' + m + ' =', m + l, exprC(m + l), 'Getal voor de letter: ' + m + l + '.'),
                SC('Samen: ' + ex + ' =', res, exprC(res, { kaal:true }), 'Zet de twee stukken achter elkaar: ' + res + '.')]; }
            return { vraag:ex, context:'Werk de haakjes weg.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:st };
          } },
        { id:'alg-min', naam:'De min voor haakjes', kort:'Een min voor de haakjes draait elk teken binnen de haakjes om',
          uit:'<p>Staat er een <b>min voor de haakjes</b>? Dan gaat alles binnen de haakjes eraf. Elk teken <b>draait om</b>: plus wordt min, min wordt plus.</p><p>10x − (3x + 4) = 10x − 3x − 4 = <b>7x − 4</b>.</p><p>Met een getal: −2(x − 5) = −2x + 10. Min keer min is plus.</p>',
          wanneer:'er een min voor haakjes staat.',
          maak:function(R){
            var v = R.heel(0, 3), a, b, m, k, c, ex, res, st;
            if (v === 0 || v === 1){ a = R.heel(1, 6); b = a + R.heel(1, 8); m = R.heel(1, 9); var plus = v === 0;
              var binnen = E([[a, 'x'], [plus ? m : -m, '']]), weg = E([[-a, 'x'], [plus ? -m : m, '']]);
              ex = E([[b, 'x']]) + ' − (' + binnen + ')'; res = E([[b - a, 'x'], [plus ? -m : m, '']]);
              st = [SC('De min draait elk teken om: −(' + binnen + ') =', weg, exprC(weg, { kaal:true }), 'Elk teken binnen de haakjes draait om: ' + (plus ? 'plus wordt min.' : 'min wordt plus.'), F(weg, E([[-a, 'x'], [plus ? m : -m, '']]), 'De min geldt ook voor de ' + m + '.')),
                SC('Samen: ' + E([[b, 'x']]) + (weg.charAt(0) === '−' ? ' − ' + weg.slice(1) : ' + ' + weg) + ' =', res, exprC(res, { kaal:true }), 'Neem de x-termen samen: ' + b + ' − ' + a + ' = ' + (b - a) + '.', F(res, E([[b - a, 'x'], [plus ? m : -m, '']]), 'Let op het teken van de ' + m + ': de min voor de haakjes draait het om.'))]; }
            else if (v === 2){ k = R.heel(2, 6); m = R.heel(1, 9); ex = MIN + k + '(x − ' + m + ')'; res = E([[-k, 'x'], [k * m, '']]);
              st = [SC(MIN + k + ' × x =', E([[-k, 'x']]), exprC(E([[-k, 'x']])), 'Min ' + k + ' keer x is min ' + k + 'x.'),
                S(MIN + k + ' × ' + MIN + m + ' =', k * m, 'Min keer min is plus.', F(k * m, -k * m, 'Min keer min is plus.')),
                SC('Samen: ' + ex + ' =', res, exprC(res, { kaal:true }), 'Zet ze achter elkaar: ' + res + '.')]; }
            else { k = R.heel(2, 5); m = R.heel(1, 6); c = R.heel(k * m + 1, k * m + 20); ex = c + ' − ' + k + '(x + ' + m + ')'; res = E([[-k, 'x'], [c - k * m, '']]);
              var tus = E([[-k, 'x'], [-k * m, '']]);
              st = [SC('Werk eerst de haakjes weg, met de min: −' + k + '(x + ' + m + ') =', tus, exprC(tus, { kaal:true }), 'Min ' + k + ' keer x en min ' + k + ' keer ' + m + '.', F(tus, E([[-k, 'x'], [k * m, '']]), 'De min geldt voor allebei de termen.')),
                SC('Samen: ' + c + ' ' + tus.replace(/^−/, '− ') + ' =', res, exprC(res, { kaal:true }), 'Neem de getallen samen: ' + c + ' − ' + (k * m) + ' = ' + (c - k * m) + '.', F(res, E([[-k, 'x'], [c + k * m, '']]), 'Je telde ' + (k * m) + ' erbij. Het gaat eraf.'))]; }
            return { vraag:ex, context:'Werk de haakjes weg en schrijf zo kort mogelijk.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst', stappen:st };
          } },
        { id:'alg-invullen', naam:'Letters invullen', kort:'Zet het getal op de plek van de letter, tussen haakjes als het negatief is, en reken in de goede volgorde',
          uit:'<p>Vul een getal in op de plek van de letter. Een <b>negatief</b> getal zet je tussen <b>haakjes</b>: a = −2 in 3a + 5 geeft 3 × (−2) + 5 = −1.</p><p>Let op de volgorde: eerst machten, dan keer en delen, dan plus en min.</p><p>Bij een kwadraat: (−3)² = (−3) × (−3) = <b>9</b>. Min keer min is plus. En bij 2a² staat alleen a in het kwadraat.</p>',
          wanneer:'je een uitdrukking met letters moet uitrekenen voor een bepaald getal.',
          maak:function(R){
            function nz(lo, hi){ var x; do { x = R.heel(lo, hi); } while (!x); return x; }
            var v = R.heel(0, 3), p, q, a, b, x, ex, ctx, st;
            if (v === 0){ p = R.heel(2, 6); q = R.heel(2, 6); a = nz(-6, 9); b = nz(-6, 9); ex = p + 'a + ' + q + 'b'; ctx = 'Bereken als a = ' + T(a) + ' en b = ' + T(b) + '.';
              st = [S(p + ' × ' + paren(a) + ' =', p * a, a < 0 ? 'Keer een min-getal geeft een min-getal.' : p + ' keer ' + a + '.'), S(q + ' × ' + paren(b) + ' =', q * b, b < 0 ? 'Keer een min-getal geeft een min-getal.' : q + ' keer ' + b + '.'),
                S(T(p * a) + ' + ' + paren(q * b) + ' =', p * a + q * b, q * b < 0 ? 'Plus een min-getal is hetzelfde als min: ' + T(p * a) + ' − ' + T(-q * b) + '.' : 'Tel ze op.')]; }
            else if (v === 1){ p = R.heel(2, 6); x = R.kies([-6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6]); ex = 'x² + ' + p + 'x'; ctx = 'Bereken als x = ' + T(x) + '.';
              st = [S(paren(x) + '² = ' + paren(x) + ' × ' + paren(x) + ' =', x * x, x < 0 ? 'Min keer min is plus.' : x + ' keer ' + x + '.', F(x * x, -x * x, 'Min keer min is plus. Een kwadraat is nooit negatief.', 2 * x, 'Kwadraat is keer zichzelf, niet keer 2.')),
                S(p + ' × ' + paren(x) + ' =', p * x, x < 0 ? 'Keer een min-getal geeft een min-getal.' : p + ' keer ' + x + '.'),
                S(T(x * x) + ' + ' + paren(p * x) + ' =', x * x + p * x, p * x < 0 ? 'Plus een min-getal is min: ' + T(x * x) + ' − ' + T(-p * x) + '.' : 'Tel ze op.')]; }
            else if (v === 2){ p = R.heel(2, 6); a = nz(-5, 9); b = nz(-5, 9); if (a === b) b = a + 1 || 2; ex = p + '(a − b)'; ctx = 'Bereken als a = ' + T(a) + ' en b = ' + T(b) + '.';
              st = [S('Eerst de haakjes: ' + T(a) + ' − ' + paren(b) + ' =', a - b, b < 0 ? 'Min een min-getal is plus: ' + T(a) + ' + ' + T(-b) + '.' : T(a) + ' min ' + T(b) + '.', b < 0 ? F(a - b, a + b, 'Min een min-getal is plus.') : null),
                S(p + ' × ' + paren(a - b) + ' =', p * (a - b), p + ' keer de uitkomst van de haakjes.')]; }
            else { p = R.heel(2, 5); a = nz(-5, 5); ex = p + 'a²'; ctx = 'Bereken als a = ' + T(a) + '.';
              st = [S('Eerst het kwadraat: ' + paren(a) + '² =', a * a, a < 0 ? 'Min keer min is plus.' : a + ' keer ' + a + '.', F(a * a, -a * a, 'Min keer min is plus.')),
                S('Dan keer ' + p + ': ' + p + ' × ' + (a * a) + ' =', p * a * a, 'Alleen a staat in het kwadraat, de ' + p + ' niet.', F(p * a * a, p * p * a * a, 'Alleen a staat in het kwadraat, niet ' + p + 'a.'))]; }
            return { vraag:ex, context:ctx, stappen:st };
          } },
        { id:'alg-buiten', naam:'Buiten haakjes brengen', kort:'Zoek de grootste factor die in alle termen zit, zet die voor de haakjes en deel elke term erdoor',
          uit:'<p>Buiten haakjes brengen is haakjes wegwerken <b>andersom</b>. 6x + 9: welk getal zit in 6 én in 9? De grootste is <b>3</b>.</p><p>Zet 3 voor de haakjes en deel elke term door 3: 6x : 3 = 2x en 9 : 3 = 3. Dus 6x + 9 = <b>3(2x + 3)</b>.</p><p>Controleer door de haakjes weer weg te werken. Met een letter: x² + 5x = x(x + 5).</p>',
          wanneer:'je een uitdrukking als product wilt schrijven, bijvoorbeeld om te vereenvoudigen.',
          maak:function(R){
            var v = R.heel(0, 2), k, p, q, m, ex, res, ctrl, st;
            if (v === 0 || v === 1){ var min = v === 1;
              do { k = R.heel(2, 9); p = R.heel(1, 5); q = R.heel(1, 9); } while (ggd(p, q) !== 1 || p === q);
              var bin = E([[p, 'x'], [min ? -q : q, '']]); ex = E([[k * p, 'x'], [min ? -k * q : k * q, '']]); res = k + '(' + bin + ')'; ctrl = buitenC(String(k), bin);
              var del = []; for (var d = 2; d < k; d++) if (k % d === 0) del.push(d, 'Dat past in allebei, maar er past een groter getal in.');
              st = [S('Welk getal past in ' + (k * p) + ' en in ' + (k * q) + '? Neem het grootste.', k, 'Zoek de grootste tafel waar ' + (k * p) + ' en ' + (k * q) + ' allebei in staan.', F.apply(null, [k].concat(del))),
                SC(E([[k * p, 'x']]) + ' : ' + k + ' =', E([[p, 'x']]), exprC(E([[p, 'x']])), (k * p) + ' : ' + k + ' = ' + p + '. De x blijft staan.'),
                S((k * q) + ' : ' + k + ' =', q, (k * q) + ' gedeeld door ' + k + '.'),
                SC('Samen: ' + ex + ' =', res, ctrl, 'Het getal voor de haakjes, en binnen de haakjes wat overblijft: ' + res + '.')]; }
            else { m = R.heel(2, 9); ex = 'x² + ' + m + 'x'; res = 'x(x + ' + m + ')'; ctrl = buitenC('x', 'x + ' + m);
              st = [SC('Welke letter zit in beide termen?', 'x', exprC('x'), 'In x² zit x × x, en in ' + m + 'x zit ook een x.'),
                SC('x² : x =', 'x', exprC('x'), 'x × x gedeeld door x: er blijft één x over.'),
                S(m + 'x : x =', m, 'Haal de x weg: er blijft ' + m + ' over.'),
                SC('Samen: ' + ex + ' =', res, ctrl, 'x voor de haakjes, en binnen de haakjes wat overblijft: ' + res + '.')]; }
            return { vraag:ex, context:'Breng zoveel mogelijk buiten haakjes.', antwoord:res, controle:ctrl, invoer:'tekst', stappen:st };
          } },
        { id:'alg-mix', naam:'Haakjes wegwerken en samennemen', kort:'Werk eerst alle haakjes weg, en neem daarna de gelijksoortige termen samen',
          uit:'<p>Bij 2(x + 3) + 4(x − 1) doe je twee dingen na elkaar. Eerst <b>alle haakjes weg</b>: 2x + 6 + 4x − 4.</p><p>Dan <b>samennemen</b>: de x-termen 2x + 4x = 6x en de getallen 6 − 4 = 2. Samen <b>6x + 2</b>.</p><p>Let op een min voor de haakjes: die draait de tekens om.</p>',
          wanneer:'er meer stukken met haakjes in een uitdrukking staan.',
          maak:function(R){
            var v = R.heel(0, 2), k1 = R.heel(2, 6), m1 = R.heel(1, 8), k2, m2, ex, d1, d2, res;
            if (v === 2){ k2 = R.heel(1, k1 - 1); do { m2 = R.heel(1, 8); } while (k1 * m1 === k2 * m2); }
            else { k2 = R.heel(2, 6); m2 = R.heel(1, 8); }
            d1 = E([[k1, 'x'], [k1 * m1, '']]);
            if (v === 0){ ex = k1 + '(x + ' + m1 + ') + ' + k2 + '(x + ' + m2 + ')'; d2 = E([[k2, 'x'], [k2 * m2, '']]); res = E([[k1 + k2, 'x'], [k1 * m1 + k2 * m2, '']]); }
            else if (v === 1){ ex = k1 + '(x + ' + m1 + ') + ' + k2 + '(x − ' + m2 + ')'; d2 = E([[k2, 'x'], [-k2 * m2, '']]); res = E([[k1 + k2, 'x'], [k1 * m1 - k2 * m2, '']]); }
            else { ex = k1 + '(x + ' + m1 + ') − ' + (k2 === 1 ? '' : k2) + '(x + ' + m2 + ')'; d2 = E([[-k2, 'x'], [-k2 * m2, '']]); res = E([[k1 - k2, 'x'], [k1 * m1 - k2 * m2, '']]); }
            var tweede = v === 0 ? k2 + '(x + ' + m2 + ')' : v === 1 ? k2 + '(x − ' + m2 + ')' : MIN + (k2 === 1 ? '' : k2) + '(x + ' + m2 + ')';
            return { vraag:ex, context:'Werk de haakjes weg en schrijf zo kort mogelijk.', antwoord:res, controle:exprC(res, { kaal:true }), invoer:'tekst',
              stappen:[
                SC('De eerste haakjes: ' + k1 + '(x + ' + m1 + ') =', d1, exprC(d1, { kaal:true }), k1 + ' keer x en ' + k1 + ' keer ' + m1 + '.'),
                SC('De tweede haakjes: ' + tweede + ' =', d2, exprC(d2, { kaal:true }), v === 2 ? 'De min draait de tekens om: min ' + (k2 === 1 ? '' : k2) + 'x en min ' + (k2 * m2) + '.' : k2 + ' keer x en ' + k2 + ' keer ' + m2 + (v === 1 ? ', met de min.' : '.'), v === 2 ? F(d2, E([[-k2, 'x'], [k2 * m2, '']]), 'De min geldt ook voor de ' + m2 + '.') : null),
                SC('Neem samen: ' + d1 + (d2.charAt(0) === '−' ? ' − ' + d2.slice(1) : ' + ' + d2) + ' =', res, exprC(res, { kaal:true }), 'De x-termen samen en de getallen samen.') ] };
          } }
      ] },

    /* ================= een rekenprobleem aanpakken (1F) ================= */
    { groep:{ id:'aanpak-plan', niveau:'1F', domein:'getallen', naam:'Een rekenprobleem aanpakken', kd:['rw14A.a', 'rw14A.c', 'rw14A.e', 'rw17A.c'],
        uit:'Een verhaalsom los je op met een plan: wat weet je, wat moet je weten, welke som, uitrekenen en terugkijken. Een tekening of tabel helpt onderweg.' },
      doelen:[
        { id:'aanpak-plan-stappen', naam:'Het stappenplan', kort:'Wat weet je? Wat moet je weten? Welke som? Reken uit. Klopt het?',
          uit:'<p>Een verhaalsom pak je aan met vijf stappen:</p><p><b>1</b> Wat weet je? <b>2</b> Wat moet je weten? <b>3</b> Welke som past erbij? <b>4</b> Reken uit. <b>5</b> Klopt het? Kan dit antwoord?</p><p>Bij stap 3 schrijf je de som eerst op, voordat je gaat rekenen. Dan zie je of het een plus, min, keer of deel is, of meer dan één.</p>',
          wanneer:'je een verhaalsom niet meteen snapt.',
          maak:function(R){
            var s = R.heel(0, 3), o;
            if (s === 0){ var n = R.heel(2, 5), p = R.kies([1.25, 1.5, 1.75, 2.25, 2.5, 3.5]), tot = n * p, B = tot < 5 ? 5 : tot < 10 ? 10 : 20;
              o = { ctx:'Je koopt ' + n + ' tijdschriften van ' + G(p) + ' per stuk. Je betaalt met een briefje van € ' + B + '.', vr:'Hoeveel krijg je terug?', weet:'hoeveel geld je terugkrijgt', nepW:['hoeveel een tijdschrift kost', 'hoeveel tijdschriften je koopt'],
                som:B + ' − ' + n + ' × ' + g2(p), nepS:[n + ' × ' + g2(p), B + ' − ' + g2(p), B + ' + ' + n + ' × ' + g2(p)], uit:B - tot, geld:true, hS:'Wat je betaalt (' + n + ' × ' + G(p) + ') gaat van je briefje af.', hR:'Eerst keer: ' + n + ' × ' + g2(p) + ' = ' + g2(tot) + '. Dan ' + B + ' − ' + g2(tot) + '.' }; }
            else if (s === 1){ var k = R.heel(2, 4), m = R.heel(24, 30), d = R.heel(2, 6);
              o = { ctx:'Er gaan ' + k + ' klassen van ' + m + ' leerlingen op schoolreis. Er gaan ook ' + d + ' begeleiders mee.', vr:'Hoeveel mensen gaan er mee?', weet:'hoeveel mensen er meegaan', nepW:['hoeveel klassen er zijn', 'hoeveel bussen er nodig zijn'],
                som:k + ' × ' + m + ' + ' + d, nepS:[k + ' × ' + m, k + ' + ' + m + ' + ' + d, '(' + m + ' + ' + d + ') × ' + k], uit:k * m + d, eh:'mensen', hS:'Eerst alle leerlingen: ' + k + ' klassen van ' + m + '. Dan de begeleiders erbij.', hR:k + ' × ' + m + ' = ' + (k * m) + '. Dan + ' + d + '.' }; }
            else if (s === 2){ var P = R.heel(18, 32) * 10, q = R.heel(12, 25), r = R.heel(3, 7);
              o = { ctx:'Je boek heeft ' + P + ' bladzijden. Je leest elke dag ' + q + ' bladzijden. Je leest nu ' + r + ' dagen.', vr:'Hoeveel bladzijden moet je nog lezen?', weet:'hoeveel bladzijden je nog moet lezen', nepW:['hoeveel dagen je al leest', 'hoeveel bladzijden het boek heeft'],
                som:P + ' − ' + q + ' × ' + r, nepS:[q + ' × ' + r, P + ' − ' + q + ' − ' + r, P + ' : ' + q], uit:P - q * r, eh:'bladzijden', hS:'Eerst wat je al gelezen hebt: ' + r + ' dagen van ' + q + '. Dat gaat van het boek af.', hR:q + ' × ' + r + ' = ' + (q * r) + '. Dan ' + P + ' − ' + (q * r) + '.' }; }
            else { var v = R.heel(2, 4), pv = R.kies([12, 14, 15, 18]), kk = R.heel(2, 5), pk = R.kies([6, 7, 8, 9]);
              o = { ctx:'Een kaartje voor de dierentuin kost € ' + pv + ' voor een volwassene en € ' + pk + ' voor een kind. Je gaat met ' + v + ' volwassenen en ' + kk + ' kinderen.', vr:'Hoeveel betalen jullie samen?', weet:'hoeveel alle kaartjes samen kosten', nepW:['hoeveel mensen er meegaan', 'hoeveel een kaartje kost'],
                som:v + ' × ' + pv + ' + ' + kk + ' × ' + pk, nepS:['(' + v + ' + ' + kk + ') × ' + pv, v + ' × ' + pk + ' + ' + kk + ' × ' + pv, v + ' + ' + kk + ' × ' + pk], uit:v * pv + kk * pk, eh:'euro', hS:'De volwassenen betalen € ' + pv + ', de kinderen € ' + pk + '. Reken ze apart uit en tel op.', hR:v + ' × ' + pv + ' = ' + (v * pv) + ' en ' + kk + ' × ' + pk + ' = ' + (kk * pk) + '. Tel ze op.' }; }
            var ant = o.geld ? [g2(o.uit), T(o.uit)] : metE(o.uit, o.eh);
            return { vraag:o.vr, context:o.ctx, antwoord:ant, eenheid:o.geld ? 'euro' : o.eh,
              stappen:[
                K(R, 'Stap 1 en 2: wat moet je weten?', o.weet, o.nepW, 'Lees de vraag nog eens: ' + o.vr),
                K(R, 'Stap 3: welke som past?', o.som, o.nepS, o.hS),
                S('Stap 4 en 5: reken uit en kijk of het kan. ' + o.som + ' =', ant, o.hR) ] };
          } },
        { id:'aanpak-plan-overbodig', naam:'Overbodige informatie wegstrepen', kort:'Streep weg wat je niet nodig hebt voor de vraag, en reken met wat overblijft',
          uit:'<p>In een verhaalsom staat soms <b>meer</b> dan je nodig hebt. Dat is expres, om je in de war te brengen.</p><p>Lees eerst de <b>vraag</b>. Kijk dan bij elk gegeven: heb ik dit nodig om de vraag te beantwoorden? Zo niet, <b>streep het weg</b>.</p><p>Joep is 13 jaar en fietst 4 km naar school. Hoeveel km fietst hij heen en terug? Zijn leeftijd doet er niet toe.</p>',
          wanneer:'er in een verhaalsom veel getallen staan.',
          maak:function(R){
            var s = R.heel(0, 5), o;
            if (s === 0){ var a = R.heel(2, 8), j = R.heel(12, 15), d = R.kies([4, 5]);
              o = { ctx:'Joep fietst ' + a + ' km naar school. Hij is ' + j + ' jaar. Hij fietst ' + d + ' dagen per week heen en terug.', vr:'Hoeveel km fietst hij per week?', irr:'dat Joep ' + j + ' jaar is', rel:['de ' + a + ' km naar school', 'de ' + d + ' dagen per week'],
                som:a + ' × 2 × ' + d, nepS:[a + ' × ' + d, a + ' × ' + j + ' × ' + d, a + ' + 2 + ' + d], uit:2 * a * d, eh:'km', h:'Elke dag fietst hij ' + a + ' km heen en ' + a + ' km terug.' }; }
            else if (s === 1){ var r = R.kies([2, 3]), k = R.kies([4, 5, 6]), g = R.heel(30, 45) * 10, dd = R.heel(3, 8);
              o = { ctx:'Een doos eieren heeft ' + r + ' rijen van ' + k + ' eieren. Een volle doos weegt ' + g + ' gram. Je koopt ' + dd + ' dozen.', vr:'Hoeveel eieren heb je?', irr:'dat een doos ' + g + ' gram weegt', rel:['de ' + r + ' rijen van ' + k + ' eieren', 'de ' + dd + ' dozen'],
                som:r + ' × ' + k + ' × ' + dd, nepS:[r + ' × ' + k, g + ' × ' + dd, r + ' × ' + k + ' + ' + dd], uit:r * k * dd, eh:'eieren', h:'In één doos zitten ' + r + ' × ' + k + ' eieren. Je hebt ' + dd + ' dozen.' }; }
            else if (s === 2){ var p = R.heel(9, 13), m = R.heel(90, 140), v = R.heel(2, 5);
              o = { ctx:'Een bioscoopkaartje kost € ' + p + '. De film duurt ' + m + ' minuten. Je gaat met ' + v + ' vrienden.', vr:'Hoeveel betalen jullie samen?', irr:'dat de film ' + m + ' minuten duurt', rel:['de € ' + p + ' per kaartje', 'de ' + v + ' vrienden'],
                som:'(' + v + ' + 1) × ' + p, nepS:[v + ' × ' + p, '(' + v + ' + 1) × ' + m, m + ' : ' + p], uit:(v + 1) * p, eh:'euro', h:'Jij gaat zelf ook mee. Dus jullie zijn met ' + v + ' + 1.' }; }
            else if (s === 3){ var l = R.heel(6, 15), b = R.heel(4, 9), h = R.heel(3, 12);
              o = { ctx:'Een tuin is ' + l + ' m lang en ' + b + ' m breed. In de tuin staat een boom van ' + h + ' m hoog.', vr:'Hoeveel m² is de tuin?', irr:'dat de boom ' + h + ' m hoog is', rel:['de lengte van ' + l + ' m', 'de breedte van ' + b + ' m'],
                som:l + ' × ' + b, nepS:[l + ' + ' + b, '2 × (' + l + ' + ' + b + ')', l + ' × ' + b + ' × ' + h], uit:l * b, eh:'m²', h:'Oppervlakte is lengte keer breedte.' }; }
            else if (s === 4){ var j2 = R.heel(11, 15), sz = R.heel(3, 9), w = R.heel(5, 12);
              o = { ctx:'Sam is ' + j2 + ' jaar. Hij krijgt elke week € ' + sz + ' zakgeld. Hij spaart alles.', vr:'Hoeveel heeft hij na ' + w + ' weken?', irr:'dat Sam ' + j2 + ' jaar is', rel:['de € ' + sz + ' per week', 'de ' + w + ' weken'],
                som:sz + ' × ' + w, nepS:[j2 + ' × ' + sz, sz + ' + ' + w, w + ' × ' + j2], uit:sz * w, eh:'euro', h:'Elke week komt er € ' + sz + ' bij, ' + w + ' weken lang.' }; }
            else { var vv = R.kies([60, 80, 90, 120]), t = R.heel(2, 4), u = R.kies(['9:15', '10:40', '13:05', '7:50']);
              o = { ctx:'Een trein vertrekt om ' + u + '. Hij rijdt ' + vv + ' km per uur. Hij rijdt ' + t + ' uur.', vr:'Hoeveel km rijdt de trein?', irr:'dat hij om ' + u + ' vertrekt', rel:['de ' + vv + ' km per uur', 'de ' + t + ' uur'],
                som:vv + ' × ' + t, nepS:[vv + ' : ' + t, vv + ' + ' + t, vv + ' × ' + t + ' + ' + u.split(':')[0]], uit:vv * t, eh:'km', h:'Elk uur ' + vv + ' km, en dat ' + t + ' uur lang.' }; }
            return { vraag:o.vr, context:o.ctx, antwoord:metE(o.uit, o.eh), eenheid:o.eh,
              stappen:[
                K(R, 'Welk gegeven heb je niet nodig?', o.irr, o.rel, 'Heeft dit gegeven iets te maken met de vraag: ' + o.vr),
                K(R, 'Welke som past?', o.som, o.nepS, o.h),
                S('Reken uit: ' + o.som + ' =', metE(o.uit, o.eh), o.h) ] };
          } },
        { id:'aanpak-plan-tekening', naam:'Een tekening of tabel als tussenstap', kort:'Teken een klein voorbeeld of zet het in een tabel, en kijk wat er gebeurt',
          uit:'<p>Sommige sommen zijn lastig in je hoofd. Een <b>tekening</b> helpt. Een hek van 12 meter, om de 3 meter een paal. Hoeveel palen?</p><p>12 : 3 = 4 stukken. Teken het: bij 4 stukken heb je <b>5 palen</b>, want er staat er ook een aan het begin.</p><p>Een <b>tabel</b> helpt als iets week na week verandert. Schrijf elke week op, tot je het antwoord ziet.</p>',
          wanneer:'je een som niet meteen kunt uitrekenen, zoals bij palen, zaagsneden of sparen.',
          maak:function(R){
            var s = R.heel(0, 3);
            if (s === 0){ var d = R.kies([2, 3, 4, 5]), st = R.heel(3, 10), L = d * st;
              return { vraag:'Hoeveel palen?', context:'Een hek is ' + L + ' meter lang. Om de ' + d + ' meter staat een paal, ook aan het begin en aan het eind.', eenheid:'palen', antwoord:metE(st + 1, 'palen'),
                beeld:function(n){ return palen('hek', n >= 1 ? st : 2, n >= 2 ? 2 : 0, d + ' m'); },
                stappen:[
                  S('Hoeveel stukken van ' + d + ' meter? ' + L + ' : ' + d + ' =', st, 'Hoe vaak past ' + d + ' in ' + L + '?'),
                  S('Teken een klein hek van 2 stukken. Hoeveel palen heb je dan?', 3, 'Een paal aan het begin, een in het midden en een aan het eind.', F(3, 2, 'Kijk goed: er staat ook een paal aan het begin.')),
                  S('Je hebt steeds één paal meer dan stukken: ' + st + ' + 1 =', metE(st + 1, 'palen'), 'Bij 2 stukken waren het 3 palen. Bij ' + st + ' stukken dus ' + st + ' + 1.', F(st + 1, st, 'Dan vergeet je de paal aan het begin of aan het eind.')) ] };
            }
            if (s === 1){ var sk = R.heel(3, 9), m = R.heel(2, 6);
              return { vraag:'Hoe lang ben je bezig?', context:'Je zaagt een plank in ' + sk + ' even lange stukken. Elke keer zagen duurt ' + m + ' minuten.', eenheid:'minuten', antwoord:metE((sk - 1) * m, 'minuten'),
                beeld:function(n){ return palen('zaag', n >= 1 ? sk : 2, n, 'stuk'); },
                stappen:[
                  S('Teken een plank in 2 stukken. Hoe vaak moet je zagen?', 1, 'Eén zaagsnede in het midden maakt twee stukken.', F(1, 2, 'Kijk naar de tekening: één zaagsnede geeft al twee stukken.')),
                  S('Bij ' + sk + ' stukken zaag je ' + sk + ' − 1 keer:', sk - 1, 'Je zaagt steeds één keer minder dan er stukken zijn.', F(sk - 1, sk, 'Het laatste stuk hoef je niet meer te zagen.')),
                  S((sk - 1) + ' keer ' + m + ' minuten: ' + (sk - 1) + ' × ' + m + ' =', metE((sk - 1) * m, 'minuten'), 'Elke zaagsnede duurt ' + m + ' minuten.', F((sk - 1) * m, sk * m, 'Je rekende met ' + sk + ' zaagsneden. Het zijn er ' + (sk - 1) + '.')) ] };
            }
            if (s === 2){ var dr = R.kies([2, 3, 4, 5]), sr = R.heel(4, 10), Lr = dr * sr;
              return { vraag:'Hoeveel lampen?', context:'Een pad rond een vijver is ' + Lr + ' meter lang. Om de ' + dr + ' meter staat een lamp.', eenheid:'lampen', antwoord:metE(sr, 'lampen'),
                beeld:function(n){ return palen('rond', n >= 2 ? sr : 3, n >= 2 ? 2 : 0, Lr + ' m rond'); },
                stappen:[
                  S('Hoeveel stukken van ' + dr + ' meter? ' + Lr + ' : ' + dr + ' =', sr, 'Hoe vaak past ' + dr + ' in ' + Lr + '?'),
                  S('Teken een rondje in 3 stukken. Hoeveel lampen staan erop?', 3, 'Bij een rondje komt het eind weer bij het begin uit.', F(3, 4, 'Bij een rondje vallen het begin en het eind samen. Daar staat maar één lamp.')),
                  S('Bij een rondje: evenveel lampen als stukken. Hoeveel lampen?', metE(sr, 'lampen'), 'Bij 3 stukken waren het 3 lampen.', F(sr, sr + 1, 'Bij een rondje staat er geen extra lamp aan het eind.')) ] };
            }
            var a = R.heel(3, 6), b, a0 = R.heel(0, 15), w = R.heel(2, 6), b0;
            b = R.heel(1, a - 1); b0 = a0 + (a - b) * w;
            function tab(n){ var wk = [], al = [], bo = []; for (var i = 0; i <= w + 1; i++){ wk.push(String(i)); al.push(i === 0 || (i === 1 && n >= 1) || n >= 3 ? String(a0 + a * i) : '…'); bo.push(i === 0 || (i === 1 && n >= 2) || n >= 3 ? String(b0 + b * i) : '…'); }
              return R.teken.tabel([['week'].concat(wk), ['Ali (€)'].concat(al), ['Bo (€)'].concat(bo)], { zijkop:true, nadruk:n >= 3 ? [[1, w + 1], [2, w + 1]] : [] }); }
            return { vraag:'Na hoeveel weken evenveel?', context:'Ali heeft € ' + a0 + ' en spaart elke week € ' + a + '. Bo heeft € ' + b0 + ' en spaart elke week € ' + b + '. Maak een tabel.', eenheid:'weken', antwoord:metE(w, 'weken'), beeld:tab, zelfBeeld:tab(0),
              stappen:[
                S('Na 1 week heeft Ali: ' + a0 + ' + ' + a + ' =', a0 + a, 'Ali begint met ' + a0 + ' en krijgt er ' + a + ' bij.'),
                S('Na 1 week heeft Bo: ' + b0 + ' + ' + b + ' =', b0 + b, 'Bo begint met ' + b0 + ' en krijgt er ' + b + ' bij.'),
                S('Maak de tabel verder, week na week. Na hoeveel weken hebben ze evenveel?', metE(w, 'weken'), 'Elke week haalt Ali ' + (a - b) + ' euro in. Het verschil was ' + (b0 - a0) + ' euro.') ] };
          } },
        { id:'aanpak-plan-terugkijk', naam:'Terugkijken: kan dit antwoord?', kort:'Schat de uitkomst met ronde getallen en kijk of het antwoord daar in de buurt ligt',
          uit:'<p>Ben je klaar? <b>Kijk terug</b>. Kan dit antwoord wel? Een schoolreis van € 312 per leerling, een auto die 2000 km in een uur rijdt: dat klopt vast niet.</p><p>Maak een <b>schatting</b> met ronde getallen. 29 schriften van € 1,95 is ongeveer 30 × 2 = € 60.</p><p>Ligt het antwoord ver van je schatting, bijvoorbeeld € 6 of € 600? Dan zit er een fout in. Vaak staat de komma verkeerd.</p>',
          wanneer:'je een antwoord hebt en wilt weten of het kan kloppen.',
          maak:function(R){
            var s = R.heel(0, 3), A, B, rA, rB, c, ctx, fmt, wat, f = R.kies([1, 10, 0.1]);
            if (s === 0){ A = R.kies([12, 13, 18, 19, 21, 22, 28, 29, 31, 32, 38]); B = R.kies([1.95, 2.05, 0.98, 1.02, 2.98, 3.05]); rA = Math.round(A / 10) * 10; rB = Math.round(B); c = Math.round(A * B * 100) / 100; fmt = G; wat = A + ' schriften van ' + G(B); ctx = 'Je koopt ' + A + ' schriften van ' + G(B) + '.'; }
            else if (s === 1){ A = R.kies([78, 82, 88, 92, 98, 102, 118, 121]); B = R.kies([2, 3, 4]); rA = Math.round(A / 10) * 10; rB = B; c = A * B; fmt = function(x){ return T(x) + ' km'; }; ctx = 'Een auto rijdt ' + A + ' km per uur. Hoe ver komt hij in ' + B + ' uur?'; }
            else if (s === 2){ A = R.kies([4.8, 5.2, 3.9, 6.1]); B = R.kies([3.9, 4.1, 2.9, 5.1]); rA = Math.round(A); rB = Math.round(B); c = Math.round(A * B * 100) / 100; fmt = function(x){ return T(x) + ' m²'; }; ctx = 'Een kamer is ' + T(A) + ' m lang en ' + T(B) + ' m breed. Hoeveel m² is de vloer?'; }
            else { A = R.kies([19, 21, 29, 31, 39, 41]); B = R.kies([11, 12, 19, 21, 29]); rA = Math.round(A / 10) * 10; rB = Math.round(B / 10) * 10; c = A * B; fmt = G; ctx = 'Een uitje kost € ' + B + ' per leerling. Er gaan ' + A + ' leerlingen mee. Wat kost het samen?'; }
            var sam = Math.round(c * f * 1000) / 1000, est = rA * rB;
            var KAN = ['ja, het ligt dicht bij de schatting', 'nee, het is veel te groot', 'nee, het is veel te klein'], kan = f === 1 ? KAN[0] : f === 10 ? KAN[1] : KAN[2];
            return eindKeuze({ vraag:'Sam zegt: ' + fmt(sam), context:ctx + ' Kijk terug: kan het antwoord van Sam kloppen?',
              stappen:[
                S('Schat met ronde getallen: ' + [[A, rA], [B, rB]].filter(function(p){ return p[0] !== p[1]; }).map(function(p){ return T(p[0]) + ' ≈ ' + p[1]; }).join(' en ') + '. ' + rA + ' × ' + rB + ' =', est, rA + ' keer ' + rB + '.'),
                K(R, 'Sam zegt ' + fmt(sam) + '. Kan dat?', kan, [], 'Vergelijk ' + fmt(sam) + ' met je schatting van ongeveer ' + est + '.', { orde:KAN }),
                K(R, 'Welk antwoord is goed?', fmt(c), [fmt(Math.round(c * 1000) / 100), fmt(Math.round(c * 100) / 1000)], 'Kies het antwoord dat dicht bij je schatting ' + est + ' ligt.') ] });
          } },
        { id:'aanpak-plan-meerstaps', naam:'Opgaven in meer stappen', kort:'Zoek uit wat je eerst moet weten, reken dat uit, en ga dan pas verder',
          uit:'<p>Veel opgaven kun je niet in één som uitrekenen. Je hebt eerst een <b>tussenantwoord</b> nodig.</p><p>Een schoolreis: de bus kost € 140 voor 28 leerlingen, en een kaartje kost € 12. Wat betaalt elke leerling? <b>Eerst</b> de bus per leerling: 140 : 28 = 5. <b>Dan</b> 12 + 5 = <b>€ 17</b>.</p><p>Schrijf elk tussenantwoord op, met wat het betekent.</p>',
          wanneer:'je meer dan één som nodig hebt om de vraag te beantwoorden.',
          maak:function(R){
            var s = R.heel(0, 3);
            if (s === 0){ var k = R.heel(20, 32), u = R.heel(3, 8), B = k * u, q = R.heel(9, 15);
              return { vraag:'Wat betaalt elke leerling?', context:'Een klas van ' + k + ' leerlingen gaat naar de dierentuin. Een kaartje kost € ' + q + ' per leerling. De bus kost € ' + B + ' en wordt eerlijk verdeeld.', eenheid:'euro',
                stappen:[
                  K(R, 'Wat reken je eerst uit?', 'wat de bus per leerling kost', ['hoeveel bussen er nodig zijn', 'hoeveel leerlingen er meegaan'], 'De bus wordt verdeeld. Wat betaalt één leerling daarvan?'),
                  S('Eerst de bus per leerling: ' + B + ' : ' + k + ' =', u, 'Verdeel € ' + B + ' over ' + k + ' leerlingen.'),
                  S('Dan alles per leerling: ' + q + ' + ' + u + ' =', q + u, 'Het kaartje plus het stuk van de bus.', F(q + u, u, 'Dat is alleen de bus. Het kaartje komt er nog bij.')) ] };
            }
            if (s === 1){ var l, h, c, A; do { l = R.heel(4, 9); h = R.kies([2, 3]); c = R.kies([4, 5, 6, 8]); A = l * h; } while (A % c === 0);
              return { vraag:'Hoeveel blikken verf koop je?', context:'Je verft een muur van ' + l + ' m breed en ' + h + ' m hoog. Een blik verf is genoeg voor ' + c + ' m².', eenheid:'blikken', antwoord:metE(Math.ceil(A / c), 'blikken'),
                stappen:[
                  S('Eerst de oppervlakte van de muur: ' + l + ' × ' + h + ' =', metE(A, 'm²', ['m2']), 'Breedte keer hoogte.'),
                  S('Hoeveel hele keren past ' + c + ' in ' + A + '?', Math.floor(A / c), c + ' × ' + Math.floor(A / c) + ' = ' + c * Math.floor(A / c) + '. Nog een keer past niet.'),
                  S('Er blijft een stukje muur over. Hoeveel blikken koop je?', metE(Math.ceil(A / c), 'blikken'), 'Voor het stukje dat overblijft heb je nog een blik nodig.', F(Math.ceil(A / c), Math.floor(A / c), 'Dan heb je te weinig verf. Er blijft nog muur over.')) ] };
            }
            if (s === 2){ var a = R.heel(8, 15), b = R.heel(2, 5), w = R.heel(4, 10), P = (a - b) * w;
              return { vraag:'Hoeveel weken moet je sparen?', context:'Je verdient € ' + a + ' per week met een krantenwijk. Je geeft elke week € ' + b + ' uit. De rest spaar je. Je wilt iets kopen van € ' + P + '.', eenheid:'weken', antwoord:metE(w, 'weken'),
                stappen:[
                  S('Eerst: wat hou je per week over? ' + a + ' − ' + b + ' =', a - b, 'Wat je verdient min wat je uitgeeft.'),
                  S('Dan: hoeveel weken? ' + P + ' : ' + (a - b) + ' =', metE(w, 'weken'), 'Hoe vaak past ' + (a - b) + ' in ' + P + '?', F(w, Math.round(P / a * 100) / 100, 'Je rekende met wat je verdient. Je spaart alleen wat je overhoudt.')) ] };
            }
            var pp = R.kies([75, 100, 125]), g = 4 * pp, p, need;
            do { p = R.heel(6, 14); need = pp * p; } while (need % 500 === 0);
            return { vraag:'Hoeveel pakken pasta koop je?', context:'Een recept voor 4 personen gebruikt ' + g + ' gram pasta. Jij kookt voor ' + p + ' personen. Pasta zit in pakken van 500 gram.', eenheid:'pakken', antwoord:metE(Math.ceil(need / 500), 'pakken'),
              stappen:[
                S('Eerst per persoon: ' + g + ' : 4 =', metE(pp, 'gram'), 'Verdeel ' + g + ' gram over 4 personen.'),
                S('Voor ' + p + ' personen: ' + pp + ' × ' + p + ' =', metE(need, 'gram'), pp + ' gram voor elke persoon.'),
                S('In een pak zit 500 gram. Hoeveel pakken koop je?', metE(Math.ceil(need / 500), 'pakken'), Math.floor(need / 500) + ' pakken is ' + Math.floor(need / 500) * 500 + ' gram. Is dat genoeg voor ' + need + ' gram?', F(Math.ceil(need / 500), Math.floor(need / 500), 'Dan heb je te weinig pasta. Koop er een pak bij.')) ] };
          } },
        { id:'aanpak-plan-eenheid', naam:'Het antwoord met eenheid en goed afgerond', kort:'Kijk in de situatie of je naar boven of naar beneden afrondt, en zet de eenheid erachter',
          uit:'<p>Een deelsom in een verhaal geeft vaak een <b>rest</b>. Wat je daarmee doet, hangt af van de situatie.</p><p>75 leerlingen, 8 in een busje: 75 : 8 = 9 rest 3. Die 3 moeten ook mee, dus <b>naar boven</b>: 10 busjes. 75 eieren in dozen van 6: 12 rest 3. Hoeveel <b>volle</b> dozen? <b>Naar beneden</b>: 12 dozen.</p><p>Schrijf het antwoord met de <b>eenheid</b>: 10 busjes, niet alleen 10.</p>',
          wanneer:'een deelsom in een verhaal niet precies uitkomt.',
          maak:function(R){
            var it = R.kies([
              { t:function(N, c){ return 'Er gaan ' + N + ' leerlingen op kamp. In een busje passen ' + c + ' leerlingen.'; }, vr:'Hoeveel busjes zijn nodig?', c:[8, 9], N:[30, 90], up:true, enk:'busje', mv:'busjes' },
              { t:function(N, c){ return 'Je hebt ' + N + ' eieren. In een doos passen ' + c + ' eieren.'; }, vr:'Hoeveel volle dozen kun je maken?', c:[6, 12], N:[40, 150], up:false, enk:'doos', mv:'dozen' },
              { t:function(N, c){ return 'Je hebt € ' + N + '. Een kaartje kost € ' + c + '.'; }, vr:'Hoeveel kaartjes kun je kopen?', c:[3, 4, 6, 7], N:[20, 60], up:false, enk:'kaartje', mv:'kaartjes' },
              { t:function(N, c){ return 'Er komen ' + N + ' gasten op een feest. Aan een tafel passen ' + c + ' gasten.'; }, vr:'Hoeveel tafels zijn nodig?', c:[6, 8], N:[20, 70], up:true, enk:'tafel', mv:'tafels' },
              { t:function(N, c){ return 'Je hebt ' + N + ' meter lint nodig. Op een rol zit ' + c + ' meter.'; }, vr:'Hoeveel rollen koop je?', c:[5], N:[11, 44], up:true, enk:'rol', mv:'rollen' } ]);
            var c = R.kies(it.c), N; do { N = R.heel(it.N[0], it.N[1]); } while (N % c === 0);
            var q = Math.floor(N / c), r = N - q * c, ans = it.up ? q + 1 : q, other = it.up ? q : q + 1;
            var OP = ['naar boven: er moet nog een ' + it.enk + ' bij', 'naar beneden: de rest laat je weg'];
            var ant = metEMoet(ans, ans === 1 ? it.enk : it.mv);
            return { vraag:it.vr, context:it.t(N, c) + ' Schrijf het antwoord met de eenheid erbij.', antwoord:ant, invoer:'tekst',
              stappen:[
                S('Hoe vaak past ' + c + ' helemaal in ' + N + '?', q, c + ' × ' + q + ' = ' + q * c + ', en ' + c + ' × ' + (q + 1) + ' = ' + (q + 1) * c + ' is te veel.'),
                S('Hoeveel blijft er over? ' + N + ' − ' + q * c + ' =', r, 'Wat er na ' + q + ' keer ' + c + ' nog over is.'),
                K(R, 'Er blijft ' + r + ' over. Hoe rond je af?', it.up ? OP[0] : OP[1], [], it.up ? 'Ook de laatste ' + r + ' moeten een plek hebben.' : 'Van de laatste ' + r + ' kun je geen hele ' + it.enk + ' maken.', { orde:OP }),
                S('Het antwoord, met de eenheid erbij:', ant, 'Schrijf het getal ' + (it.up ? 'naar boven' : 'naar beneden') + ' afgerond, met "' + (ans === 1 ? it.enk : it.mv) + '" erachter.', F(ant[0], other + ' ' + it.mv, it.up ? 'Dan past niet alles. Rond naar boven af.' : 'Dat lukt niet: rond naar beneden af.', String(ans), 'Zet de eenheid erachter: ' + ans + ' ' + it.mv + '.')) ] };
          } }
      ] },

    /* ================= de rekenmachine slim gebruiken (2F) ================= */
    { groep:{ id:'aanpak-machine', niveau:'2F', domein:'getallen', naam:'De rekenmachine slim gebruiken', kd:['rw15B.e', 'rw15B.b', 'rw14A.d'],
        uit:'De rekenmachine rekent snel, maar alleen wat jij intikt. Schat eerst, tik in de goede volgorde, gebruik tussenantwoorden en lees de uitkomst goed.' },
      doelen:[
        { id:'aanpak-machine-schat', naam:'Eerst schatten, dan intikken', kort:'Schat met ronde getallen voordat je intikt, zodat je ziet of de uitkomst kan kloppen',
          uit:'<p>Een rekenmachine maakt geen rekenfouten, maar jij kunt wel <b>verkeerd tikken</b>. Daarom schat je <b>eerst</b>.</p><p>4,85 × 21,3: rond af tot 5 × 20 = <b>100</b>. Geeft de rekenmachine 103,305? Dat past. Geeft hij 1033,05 of 10,3305? Dan klopt er iets niet. Vaak is het de komma.</p>',
          wanneer:'je een som met kommagetallen op de rekenmachine uitrekent.',
          maak:function(R){
            var ra = R.heel(2, 9), offA = R.kies([-30, -25, -15, -12, -8, -5, 5, 8, 12, 15, 25, 30]), rb = R.heel(2, 9) * 10, offB = R.kies([-37, -26, -14, -8, -3, 3, 8, 14, 26, 37]);
            var A = ra * 100 + offA, B = rb * 10 + offB, a = A / 100, b = B / 10, c = A * B / 1000;
            return eindKeuze({ vraag:T(a) + ' × ' + T(b), context:'Je rekent dit uit met de rekenmachine. Schat eerst, dan zie je of de uitkomst kan kloppen.',
              stappen:[
                S('Rond ' + T(a) + ' af op een heel getal:', ra, 'Welk heel getal ligt het dichtst bij ' + T(a) + '?'),
                S('Rond ' + T(b) + ' af op een tiental:', rb, 'Welk tiental ligt het dichtst bij ' + T(b) + '?'),
                S('De schatting: ' + ra + ' × ' + rb + ' =', ra * rb, ra + ' × ' + (rb / 10) + ' = ' + (ra * rb / 10) + ', en dan nog keer 10.'),
                K(R, 'Welke uitkomst van de rekenmachine past bij je schatting?', T(c), [T(A * B / 100), T(A * B / 10000)], 'Kies de uitkomst die dicht bij ' + ra * rb + ' ligt.') ] });
          } },
        { id:'aanpak-machine-volgorde', naam:'Haakjes en volgorde op de rekenmachine', kort:'Moet iets eerst? Tik dan zelf de haakjes in, anders rekent de rekenmachine keer en delen eerst',
          uit:'<p>Een rekenmachine volgt de <b>rekenregels</b>: eerst keer en delen, dan plus en min. Tik je 24 + 36 : 4 =, dan krijg je 24 + 9 = <b>33</b>.</p><p>Wil je eerst 24 + 36 uitrekenen? Tik dan zelf de <b>haakjes</b>: ( 24 + 36 ) : 4 = <b>15</b>.</p><p>Dat geldt ook voor een gemiddelde: ( 6,5 + 7 + 8,3 ) : 3. Zonder haakjes deel je alleen het laatste getal.</p>',
          wanneer:'je een som met meer bewerkingen op de rekenmachine intikt.',
          maak:function(R){
            var s = R.heel(0, 3), vr, ctx, eerst, nepE, toets, nepT, val, fout, hint;
            if (s === 0){ var c = R.kies([3, 4, 5, 6, 8]), q = R.heel(6, 15), som = c * q, a = R.heel(10, som - 5), b = som - a;
              vr = '(' + a + ' + ' + b + ') : ' + c; ctx = 'Je deelt het totaal van ' + a + ' en ' + b + ' eerlijk door ' + c + '.'; eerst = a + ' + ' + b; nepE = [b + ' : ' + c];
              toets = '( ' + a + ' + ' + b + ' ) : ' + c + ' ='; nepT = [a + ' + ' + b + ' : ' + c + ' =', a + ' + ( ' + b + ' : ' + c + ' ) =']; val = q; fout = a + b / c; hint = 'Eerst ' + a + ' + ' + b + ' = ' + som + ', dan ' + som + ' : ' + c + '.'; }
            else if (s === 1){ var b2 = R.heel(2, 6), c2 = R.heel(2, 5), q2 = R.heel(2, 12), a2 = b2 * c2 * q2;
              vr = a2 + ' : (' + b2 + ' × ' + c2 + ')'; ctx = 'Je verdeelt ' + a2 + ' over ' + b2 + ' groepjes van ' + c2 + '.'; eerst = b2 + ' × ' + c2; nepE = [a2 + ' : ' + b2];
              toets = a2 + ' : ( ' + b2 + ' × ' + c2 + ' ) ='; nepT = [a2 + ' : ' + b2 + ' × ' + c2 + ' =', '( ' + a2 + ' : ' + b2 + ' ) × ' + c2 + ' =']; val = q2; fout = a2 / b2 * c2; hint = 'Eerst ' + b2 + ' × ' + c2 + ' = ' + b2 * c2 + ', dan ' + a2 + ' : ' + b2 * c2 + '.'; }
            else if (s === 2){ var gem, p, qq, r; do { gem = R.heel(55, 85); p = R.heel(50, 90); qq = R.heel(50, 90); r = 3 * gem - p - qq; } while (r < 40 || r > 100 || r % 10 === 0);
              vr = '(' + T(p / 10) + ' + ' + T(qq / 10) + ' + ' + T(r / 10) + ') : 3'; ctx = 'Je cijfers zijn ' + T(p / 10) + ', ' + T(qq / 10) + ' en ' + T(r / 10) + '. Je rekent het gemiddelde uit.'; eerst = T(p / 10) + ' + ' + T(qq / 10) + ' + ' + T(r / 10); nepE = [T(r / 10) + ' : 3'];
              toets = '( ' + T(p / 10) + ' + ' + T(qq / 10) + ' + ' + T(r / 10) + ' ) : 3 ='; nepT = [T(p / 10) + ' + ' + T(qq / 10) + ' + ' + T(r / 10) + ' : 3 =', T(p / 10) + ' + ' + T(qq / 10) + ' + ( ' + T(r / 10) + ' : 3 ) =']; val = gem / 10; fout = (p + qq) / 10 + r / 30; hint = 'Eerst alles optellen: ' + T(3 * gem / 10) + '. Dan delen door 3.'; }
            else { var d = R.heel(2, 9), e = R.heel(d + 2, 30), dd = e - d, q4 = R.heel(3, 15), sm = dd * q4, a4 = R.heel(10, sm - 5), b4 = sm - a4;
              vr = '(' + a4 + ' + ' + b4 + ') : (' + e + ' − ' + d + ')'; ctx = 'Er staan haakjes om allebei de stukken.'; eerst = a4 + ' + ' + b4 + ' en ' + e + ' − ' + d; nepE = [b4 + ' : ' + e];
              toets = '( ' + a4 + ' + ' + b4 + ' ) : ( ' + e + ' − ' + d + ' ) ='; nepT = [a4 + ' + ' + b4 + ' : ' + e + ' − ' + d + ' =', '( ' + a4 + ' + ' + b4 + ' ) : ' + e + ' − ' + d + ' =']; val = q4; fout = a4 + b4 / e - d; hint = 'Boven ' + sm + ', onder ' + dd + '. Dan ' + sm + ' : ' + dd + '.'; }
            return { vraag:vr, context:ctx + ' Je gebruikt de rekenmachine.',
              stappen:[
                K(R, 'Wat moet je eerst uitrekenen?', eerst, nepE, 'Wat tussen haakjes staat, gaat voor.'),
                K(R, 'Welke toetsen tik je in?', toets, nepT, 'Zonder haakjes doet de rekenmachine keer en delen eerst. Tik de haakjes dus mee.'),
                S('Wat geeft de rekenmachine als je goed tikt?', T(val), hint, F(T(val), T(Math.round(fout * 1e6) / 1e6), 'Dat krijg je zonder haakjes: de rekenmachine doet dan eerst keer of delen.')) ] };
          } },
        { id:'aanpak-machine-tussen', naam:'Een tussenantwoord gebruiken', kort:'Reken een stuk uit, bewaar de uitkomst (Ans of M+) en reken daarmee verder',
          uit:'<p>Bij een lange som reken je in <b>stukken</b>. Na elk stuk heb je een <b>tussenantwoord</b>.</p><p>Je hoeft dat niet over te tikken. De toets <b>Ans</b> onthoudt de laatste uitkomst. Met <b>M+</b> tel je een uitkomst op in het geheugen, met <b>MR</b> haal je het terug.</p><p>3 pizza\'s van € 8,50 en 4 flesjes van € 1,75: eerst 3 × 8,50 = 25,50 (M+), dan 4 × 1,75 = 7 (M+). MR geeft <b>€ 32,50</b>.</p>',
          wanneer:'je een som in meer stappen op de rekenmachine uitrekent.',
          maak:function(R){
            var s = R.heel(0, 3);
            if (s === 0){ var a = R.heel(2, 5), p = R.kies([750, 825, 850, 975]), b = R.heel(2, 6), q = R.kies([125, 175, 225, 95]);
              return { vraag:a + ' × ' + g2(p / 100) + ' + ' + b + ' × ' + g2(q / 100), context:'Je koopt ' + a + ' pizza\'s van ' + G(p / 100) + ' en ' + b + ' flesjes drinken van ' + G(q / 100) + '. Wat betaal je samen?', eenheid:'euro',
                stappen:[
                  S('Tik eerst ' + a + ' × ' + g2(p / 100) + ' = en bewaar het (M+):', g2(a * p / 100), a + ' pizza\'s.'),
                  S('Dan ' + b + ' × ' + g2(q / 100) + ' = (en weer M+):', g2(b * q / 100), b + ' flesjes.'),
                  S('Tel de tussenantwoorden op (MR): ' + g2(a * p / 100) + ' + ' + g2(b * q / 100) + ' =', g2((a * p + b * q) / 100), 'Het geheugen telt ze samen.') ] };
            }
            if (s === 1){ var n = R.kies([3, 4, 5, 6]), qq = R.heel(25, 90), B = R.heel(80, 250), A = B + n * qq;
              return { vraag:'(' + A + ' − ' + B + ') : ' + n, context:'Een klas verkoopt koekjes voor € ' + A + '. Het inkopen kostte € ' + B + '. De winst gaat eerlijk naar ' + n + ' goede doelen. Wat krijgt elk doel?', eenheid:'euro',
                stappen:[
                  S('Eerst de winst: ' + A + ' − ' + B + ' =', A - B, 'Wat ze ontvingen min wat het kostte.'),
                  S('Dan met Ans verder: ' + (A - B) + ' : ' + n + ' =', qq, 'Deel de winst door ' + n + '.', F(qq, A - B / n, 'Je deelde alleen het inkopen door ' + n + '. Gebruik het tussenantwoord.')) ] };
            }
            if (s === 2){ var u1 = R.kies([0.5, 1, 1.5]), u2 = R.kies([0.5, 1, 1.5, 2]), v = R.kies([12, 14, 15, 16, 18]), km = v * (u1 + u2), k1 = R.heel(Math.round(km * 0.3), Math.round(km * 0.6)), k2 = km - k1;
              return { vraag:'(' + k1 + ' + ' + k2 + ') : (' + T(u1) + ' + ' + T(u2) + ')', context:'Je fietst ' + k1 + ' km in ' + T(u1) + ' uur en daarna ' + k2 + ' km in ' + T(u2) + ' uur. Wat is je gemiddelde snelheid in km per uur?', eenheid:'km/u',
                stappen:[
                  S('Eerst de afstand samen: ' + k1 + ' + ' + k2 + ' =', km, 'Alle kilometers bij elkaar.'),
                  S('Dan de tijd samen: ' + T(u1) + ' + ' + T(u2) + ' =', T(u1 + u2), 'Alle uren bij elkaar.'),
                  S('Afstand gedeeld door tijd: ' + km + ' : ' + T(u1 + u2) + ' =', metE(v, 'km/u'), 'Gebruik je twee tussenantwoorden.', F(v, k1 / u1, 'Dat is alleen het eerste stuk. Neem de hele afstand en de hele tijd.')) ] };
            }
            var P = R.kies([20, 25, 30, 40, 50]), n2 = R.heel(2, 4), q2 = R.kies([3.75, 4.25, 5.5, 6.25, 7.5]), rest = P - n2 * q2;
            if (rest <= 0) { n2 = 2; rest = P - n2 * q2; }
            return { vraag:P + ' − ' + n2 + ' × ' + g2(q2), context:'Je hebt € ' + P + '. Je koopt ' + n2 + ' kaartjes van ' + G(q2) + '. Hoeveel houd je over?', eenheid:'euro',
              stappen:[
                S('Eerst wat de kaartjes kosten: ' + n2 + ' × ' + g2(q2) + ' =', g2(n2 * q2), n2 + ' kaartjes van ' + G(q2) + '.'),
                S('Dan ' + P + ' − Ans: ' + P + ' − ' + g2(n2 * q2) + ' =', g2(rest), 'Wat je had min wat het kost.', F(g2(rest), g2((P - n2) * q2), 'Je rekende van links naar rechts. Keer gaat voor min.')) ] };
          } },
        { id:'aanpak-machine-afronden', naam:'De uitkomst afronden en begrijpen', kort:'Kijk naar de situatie: geld op centen, mensen en busjes op hele getallen, tijd in uren en minuten',
          uit:'<p>De rekenmachine geeft vaak een lange uitkomst, zoals <b>2,333333</b>. Dat getal moet je nog <b>begrijpen</b>.</p><p>Gaat het om busjes? Dan rond je af op een heel getal, en meestal <b>naar boven</b>. Om geld? Op <b>2 decimalen</b>: hele centen. Om tijd? 2,75 uur is 2 uur en 0,75 × 60 = <b>45 minuten</b>.</p><p>Let op: veel rekenmachines tonen een punt in plaats van een komma.</p>',
          wanneer:'de rekenmachine een uitkomst met veel cijfers achter de komma geeft.',
          maak:function(R){
            var s = R.heel(0, 4), disp, st, ctx, vr, eh, ant;
            var OP = ['op een heel getal, naar boven', 'op een heel getal, naar beneden', 'op 2 decimalen: hele centen', 'op 1 decimaal'];
            if (s === 0){ var c = R.kies([6, 7, 8, 9]), N; do { N = R.heel(25, 90); } while (N % c === 0 || (N / c) % 1 === 0.5);
              disp = T(N / c, { dec:8 }); ctx = 'Er gaan ' + N + ' mensen mee. In een busje passen er ' + c + '. De rekenmachine geeft voor ' + N + ' : ' + c + ':'; vr = 'Hoeveel busjes?'; eh = 'busjes'; ant = metE(Math.ceil(N / c), eh);
              st = [K(R, 'Hoe rond je af?', OP[0], OP.slice(1, 3), 'Iedereen moet mee. Ook voor de laatste mensen is een busje nodig.'), S('Hoeveel busjes heb je nodig?', ant, 'Rond ' + disp + ' naar boven af.', F(Math.ceil(N / c), Math.floor(N / c), 'Dan kan niet iedereen mee. Rond naar boven af.'))]; }
            else if (s === 1){ var k = R.kies([3, 6, 7, 9]), B; do { B = R.heel(10, 90); } while ((B * 100) % k === 0);
              var r = Math.round(B / k * 100) / 100;
              disp = T(B / k, { dec:8 }); ctx = 'Je deelt € ' + B + ' eerlijk met ' + k + ' mensen. De rekenmachine geeft voor ' + B + ' : ' + k + ':'; vr = 'Hoeveel krijgt ieder?'; eh = 'euro'; ant = [g2(r)];
              st = [K(R, 'Hoe rond je af?', OP[2], [OP[0], OP[3]], 'Bij geld gaat het om hele centen: 2 cijfers achter de komma.'), S('Hoeveel krijgt ieder? Rond af op centen.', ant, 'Kijk naar het derde cijfer achter de komma: 5 of meer, dan gaat het tweede cijfer 1 omhoog.')]; }
            else if (s === 2){ var cd = R.kies([6, 12]), Nd; do { Nd = R.heel(40, 150); } while (Nd % cd === 0 || (Nd / cd) % 1 === 0.5);
              disp = T(Nd / cd, { dec:8 }); ctx = 'Je hebt ' + Nd + ' eieren. In een doos passen er ' + cd + '. De rekenmachine geeft voor ' + Nd + ' : ' + cd + ':'; vr = 'Hoeveel volle dozen?'; eh = 'dozen'; ant = metE(Math.floor(Nd / cd), eh);
              st = [K(R, 'Hoe rond je af?', OP[1], [OP[0], OP[2]], 'Een doos die niet vol is, telt niet als volle doos.'), S('Hoeveel volle dozen?', ant, 'Rond ' + disp + ' naar beneden af.', F(Math.floor(Nd / cd), Math.ceil(Nd / cd), 'Die laatste doos is niet vol. Rond naar beneden af.'))]; }
            else if (s === 3){ var v = R.kies([12, 16, 20]), dl = R.kies([0.25, 0.5, 0.75]), h = R.heel(1, 3), u = h + dl, d = v * u, m = dl * 60;
              disp = T(u); ctx = 'Je fietst ' + T(d) + ' km met ' + v + ' km per uur. De rekenmachine geeft voor ' + T(d) + ' : ' + v + ' (in uren):'; vr = 'Hoe lang fiets je?'; eh = ''; ant = [h + ' uur en ' + m + ' minuten'];
              st = [S('Hoeveel hele uren?', metE(h, 'uur'), 'Het getal voor de komma.'), S(T(dl) + ' uur is ' + T(dl) + ' × 60 =', metE(m, 'minuten'), 'Een uur heeft 60 minuten.', F(m, Math.round(dl * 100), 'Een uur heeft 60 minuten, geen 100.')),
                SC('Hoe lang fiets je? Schrijf: … uur en … minuten.', ant[0], duurC(h * 60 + m), 'Zet de hele uren en de minuten achter elkaar.', F(ant[0], h + ' uur en ' + Math.round(dl * 100) + ' minuten', 'Een uur heeft 60 minuten, geen 100.'))];
              return { vraag:vr, context:ctx, beeld:scherm(disp), zelfBeeld:scherm(disp), antwoord:ant, controle:duurC(h * 60 + m), invoer:'tekst', stappen:st }; }
            else { var a, b, c3; do { a = R.heel(50, 95); b = R.heel(50, 95); c3 = R.heel(50, 95); } while ((a + b + c3) % 3 === 0 || Math.round((a + b + c3) / 3) % 1);
              var gm = (a + b + c3) / 30, r1 = Math.round(gm * 10) / 10;
              disp = T(gm, { dec:8 }); ctx = 'Je cijfers zijn ' + T(a / 10) + ', ' + T(b / 10) + ' en ' + T(c3 / 10) + '. De rekenmachine geeft voor het gemiddelde:'; vr = 'Wat is je gemiddelde?'; eh = ''; ant = [T(r1)];
              st = [K(R, 'Hoe rond je af?', OP[3], [OP[0], OP[2]], 'Een rapportcijfer heeft 1 cijfer achter de komma.'), S('Je gemiddelde, op 1 decimaal:', ant, 'Kijk naar het tweede cijfer achter de komma: 5 of meer, dan gaat het eerste 1 omhoog.')]; }
            return { vraag:vr, context:ctx, beeld:scherm(disp), zelfBeeld:scherm(disp), antwoord:ant, eenheid:eh || undefined, stappen:st };
          } },
        { id:'aanpak-machine-tikfout', naam:'Een tikfout herkennen', kort:'Klopt de uitkomst niet met je schatting? Kijk wat er is ingetikt: komma, nul of bewerking',
          uit:'<p>Ligt de uitkomst van de rekenmachine ver van je <b>schatting</b>? Dan is er waarschijnlijk <b>verkeerd getikt</b>.</p><p>De bekendste tikfouten: de <b>komma vergeten</b> (213 in plaats van 21,3), een <b>0 te veel</b> (1200 in plaats van 120), of de <b>verkeerde knop</b> (: in plaats van ×).</p><p>Kijk naar wat er is ingetikt en vergelijk het met de som.</p>',
          wanneer:'de rekenmachine een uitkomst geeft die niet kan kloppen.',
          maak:function(R){
            var ra = R.heel(2, 9), A = ra * 100 + R.kies([-25, -15, -12, -5, 5, 12, 15, 25]), a = A / 100, deci = R.heel(0, 1) === 1, b, rb, B10;
            if (deci){ rb = R.heel(2, 9) * 10; B10 = rb * 10 + R.kies([-37, -26, -14, -8, 8, 14, 26, 37]); b = B10 / 10; }
            else { b = R.kies([120, 180, 210, 240, 290, 320, 410, 480]); rb = Math.round(b / 100) * 100; B10 = b * 10; }
            var fouten = ['niets', deci ? 'komma' : 'nul', 'deel'], f = R.kies(fouten), getikt, scr;
            if (f === 'niets'){ getikt = T(a) + ' × ' + T(b); scr = A * B10 / 1000; }
            else if (f === 'komma'){ getikt = T(a) + ' × ' + B10; scr = A * B10 / 100; }
            else if (f === 'nul'){ getikt = T(a) + ' × ' + T(b * 10); scr = A * B10 / 100; }
            else { getikt = T(a) + ' : ' + T(b); scr = Math.round(a / b * 1e8) / 1e8; }
            var disp = T(scr, { dec:8 }).replace(/\./g, ''), est = ra * rb, MIS = { niets:'Er ging niets mis.', komma:'Sam vergat de komma.', nul:'Sam tikte een 0 te veel.', deel:'Sam deelde in plaats van keer.' };
            var opts = ['Er ging niets mis.', 'Sam vergat de komma.', 'Sam tikte een 0 te veel.', 'Sam deelde in plaats van keer.'];
            return eindKeuze({ vraag:T(a) + ' × ' + T(b), context:'Sam rekent dit uit met de rekenmachine. Sam tikte: ' + getikt + ' =', beeld:scherm(disp, 'Sam tikte: ' + getikt + ' ='), zelfBeeld:scherm(disp, 'Sam tikte: ' + getikt + ' ='),
              stappen:[
                S('Schat: ' + T(a) + ' ≈ ' + ra + ' en ' + T(b) + ' ≈ ' + rb + '. ' + ra + ' × ' + rb + ' =', est, ra + ' keer ' + rb + '.'),
                K(R, 'Het scherm geeft ' + disp + '. Past dat bij je schatting?', f === 'niets' ? 'ja' : 'nee', [], 'Vergelijk ' + disp + ' met ongeveer ' + est + '.', { orde:['ja', 'nee'] }),
                K(R, 'Kijk wat Sam tikte: ' + getikt + '. Wat ging er mis?', MIS[f], [], 'Vergelijk wat Sam tikte met de som ' + T(a) + ' × ' + T(b) + '.', { orde:opts }) ] });
          } }
      ] }
  ]);
})();
