/* De leerroute wiskunde: de ruimtefiguren een voor een (onderbouw, meetkunde).
   Zeven doelen: kubus, balk, prisma, cilinder, piramide, kegel en bol. Elk doel
   behandelt van die ene figuur de kenmerken (vlakken, ribben, hoekpunten, of bij een
   ronde figuur wat ervoor in de plaats komt), de oppervlakte en de inhoud. De opgaven
   wisselen die drie af: de eerste gaat over de kenmerken, de tweede over de
   oppervlakte, de derde over de inhoud, en dan weer van voren af aan. Zo staat op een
   werkblad Stap voor stap van elke soort evenveel.
   Bij piramide en kegel is voor de oppervlakte de schuine hoogte gegeven: Pythagoras
   is hier niet nodig (dat staat in wiskunde-vmbo-meetkunde.js).
   De losse formules (alleen inhoud, alleen oppervlakte) staan in
   wiskunde-ob-meetkunde.js. Zie leerroute.js voor het formaat. */
(function(){
  'use strict';
  var R0 = LEERROUTE.R, T = R0.toon, S = R0.schoon;
  var K = ['var(--lr-1)', 'var(--lr-2)', 'var(--lr-3)', 'var(--lr-4)', 'var(--lr-5)'];
  var X = '×', PI = Math.PI;

  /* ================= hulpjes (zoals in wiskunde-ob-meetkunde.js) ================= */
  function uniek(l){ var u = []; l.forEach(function(x){ x = String(x); if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function rnd(x, d){ var f = Math.pow(10, d); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * f + 1e-9) / f; }
  /* ligt x vlak bij een afrondingsgrens? Dan kiezen we liever andere getallen */
  function grens(x, d){ var f = Math.abs(x) * Math.pow(10, d), r = f - Math.floor(f); return Math.abs(r - 0.5) < 0.03; }
  function heel(x){ return Math.abs(x - Math.round(x)) < 1e-9; }
  function metE(x, e, ook){
    x = String(x);
    var punt = x.replace(/\./g, '').replace(',', '.'), vormen = uniek([x, x.replace(/\./g, '')].concat(/^-?\d{1,3}(\.\d{3})+$/.test(punt) ? [] : [punt])), uit = vormen.slice();
    [e].concat(ook || []).forEach(function(eh){
      if (!eh) return;
      var ee = uniek([eh, eh.replace('²', '2').replace('³', '3')]);
      vormen.forEach(function(v){ ee.forEach(function(u){ uit.push(v + ' ' + u, v + u); }); });
    });
    return uniek(uit);
  }
  /* afgerond op d decimalen, met of zonder eenheid */
  function af(x, d, e){ var r = rnd(x, d), v = metE(T(r, { dec:d, vast:true }), e), k = metE(T(r), e); return uniek(heel(x) ? k.concat(v) : v.concat(k)); }
  function afT(x, d){ return T(rnd(x, d), { dec:d, vast:true }); }
  function rondTekst(d){ return d === 0 ? 'rond af op een heel getal' : d === 1 ? 'rond af op 1 decimaal' : 'rond af op 2 decimalen'; }
  function Rond(d){ var t = rondTekst(d); return t.charAt(0).toUpperCase() + t.slice(1) + '.'; }
  /* kloppen de afgeronde stukken samen met het afgeronde geheel? */
  function eens(a, b, tot){ return Math.abs(rnd(a, 1) + rnd(b, 1) - rnd(tot, 1)) < 1e-6; }
  function St(tekst, ant, hint, fout, o){
    o = o || {};
    var s = { tekst:tekst, antwoord:[].concat(ant).map(String), hint:hint };
    if (fout && Object.keys(fout).length) s.fout = fout;
    if (o.e) s.eenheid = o.e;
    return s;
  }
  function F(){ var f = {}; for (var i = 0; i < arguments.length; i += 2){ var k = String(arguments[i]).toLowerCase(); if (!(k in f)) f[k] = arguments[i + 1]; } return f; }
  /* fouten weg die toevallig goed zijn */
  function Fz(goed, f){ var g = [].concat(goed).map(function(x){ return String(x).toLowerCase(); }), o = {}; for (var k in f) if (g.indexOf(k) < 0) o[k] = f[k]; return o; }
  function kstap(tekst, goed, orde, hint){ return { tekst:tekst, opties:orde.slice(), goed:orde.indexOf(goed), hint:hint }; }
  /* een stap waarin je telt; bij nul mag je ook geen typen */
  function tel(tekst, n, hint, fout){ var a = n === 0 ? ['0', 'geen', 'nul'] : [String(n)]; return St(tekst, a, hint, Fz(a, fout || {})); }
  /* om de beurt: kenmerken, oppervlakte, inhoud */
  var SOORT = ['ken', 'opp', 'inh'];
  function beurten(){ var i = 0; return function(){ return SOORT[i++ % 3]; }; }

  /* ================= tekenen ================= */
  function n1(x){ return Math.round(x * 10) / 10; }
  function svg(w, h, binnen, aria, max){ return '<svg class="lr-svg" viewBox="0 0 ' + n1(w) + ' ' + n1(h) + '"' + (max ? ' style="max-width:' + max + 'px"' : '') + ' role="img" aria-label="' + S(aria) + '">' + binnen + '</svg>'; }
  function tx(x, y, t, o){
    o = o || {};
    /* een witte rand om de letters: een maat die over een lijn valt blijft leesbaar */
    var st = ['font-size:' + (o.fs || 15) + 'px', 'text-anchor:' + (o.a || 'middle'), 'font-weight:' + (o.vet ? 700 : 600), 'paint-order:stroke', 'stroke:var(--kaart,#fff)', 'stroke-width:4px', 'stroke-linejoin:round'];
    if (o.k) st.push('fill:' + o.k);
    return '<text x="' + n1(x) + '" y="' + n1(y) + '"' + (o.mid ? ' dy=".35em"' : '') + ' style="' + st.join(';') + '">' + S(t) + '</text>';
  }
  function stijl(o){
    return 'fill:' + (o.f || 'none') + (o.fo != null ? ';fill-opacity:' + o.fo : '') + ';stroke:' + (o.s || 'var(--ink)') + ';stroke-width:' + (o.w != null ? o.w : 2) +
      (o.stip ? ';stroke-dasharray:' + (o.stip === true ? '6 5' : o.stip) : '') + (o.op != null ? ';opacity:' + o.op : '') + ';stroke-linecap:round;stroke-linejoin:round';
  }
  function ln(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" style="' + stijl({ s:o.k || 'var(--ink)', w:o.w || 2, stip:o.stip, op:o.op }) + '"/>'; }
  function pg(p, o){ return '<polygon points="' + p.map(function(q){ return n1(q[0]) + ',' + n1(q[1]); }).join(' ') + '" style="' + stijl(o || {}) + '"/>'; }
  function pad(d, o){ return '<path d="' + d + '" style="' + stijl(o || {}) + '"/>'; }
  function cir(cx, cy, r, o){ return '<circle cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(r) + '" style="' + stijl(o || {}) + '"/>'; }
  function pas(pts, W, H, m){
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    var sc = Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * m) / ((y1 - y0) || 1)), ox = (W - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
    return { sc:sc, f:function(p){ return [ox + (p[0] - x0) * sc, H - oy - (p[1] - y0) * sc]; } };
  }
  /* veelvlakken, scheef getekend: punten [x, y, diepte], ribben [i, j, verstopt] */
  function schuin(p, d){ return [p[0] + p[2] * d * 0.62, p[1] + p[2] * d * 0.42]; }
  function ruimte(punten, ribben, o){
    o = o || {};
    var P = punten.map(function(p){ return schuin(p, o.d || 0.5); }), t = pas(P, o.W || 360, o.H || 250, 40), Q = P.map(t.f), s = '';
    (o.vlak || []).forEach(function(v){ s += pg(v[0].map(function(i){ return Q[i]; }), { f:v[1], fo:0.22, s:'none', w:0 }); });
    ribben.forEach(function(rb){ s += ln(Q[rb[0]][0], Q[rb[0]][1], Q[rb[1]][0], Q[rb[1]][1], { w:2.5, stip:rb[2] ? '6 5' : null, op:rb[2] ? 0.6 : null }); });
    (o.lijnen || []).forEach(function(l){ s += ln(Q[l[0]][0], Q[l[0]][1], Q[l[1]][0], Q[l[1]][1], { k:K[l[2] || 1], w:3, stip:l[3] ? '7 5' : null }); });
    var cx = 0, cy = 0; Q.forEach(function(q){ cx += q[0] / Q.length; cy += q[1] / Q.length; });
    (o.maten || []).forEach(function(m){ var a = Q[m[0]], b = Q[m[1]], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ref = m[4] != null ? Q[m[4]] : [cx, cy], dx = mx - ref[0], dy = my - ref[1], L = Math.hypot(dx, dy) || 1, af2 = m[3] || 22; s += tx(mx + dx / L * af2, my + dy / L * af2, m[2], { mid:true, vet:true, fs:15, k:m[5] || null }); });
    return svg(o.W || 360, o.H || 250, s, o.aria || 'ruimtefiguur', o.max || 380);
  }
  /* balk: A B C D onder, E F G H boven; l = AB (breedte), b = BC (diepte), h = AE */
  function balkPts(l, b, h){ return [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b], [0, h, 0], [l, h, 0], [l, h, b], [0, h, b]]; }
  var BALK_RIBBEN = [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7, 1]];
  function balkFig(l, b, h, e, aria){
    return ruimte(balkPts(l, b, h), BALK_RIBBEN, { maten:[[0, 1, l + ' ' + e], [1, 2, b + ' ' + e], [2, 6, h + ' ' + e, 30]], vlak:[[[0, 1, 5, 4], K[0]]], aria:aria });
  }
  /* liggend prisma met een rechthoekige driehoek voor; c (de schuine zijde) mag weg */
  var PRISMA_RIBBEN = [[0, 1], [1, 2], [2, 0], [0, 3, 1], [1, 4], [2, 5], [3, 4, 1], [4, 5], [5, 3, 1]];
  function prismaFig(a, b, c, L){
    var maten = [[0, 1, a + ' cm'], [0, 2, b + ' cm'], [1, 4, L + ' cm']];
    if (c) maten.push([1, 2, c + ' cm', 18, 0]);
    return ruimte([[0, 0, 0], [a, 0, 0], [0, b, 0], [0, 0, L], [a, 0, L], [0, b, L]], PRISMA_RIBBEN, { maten:maten, vlak:[[[0, 1, 2], K[0]]], d:0.35, aria:'liggend prisma van ' + L + ' cm lang met een rechthoekige driehoek van ' + a + ' bij ' + b + ' cm als grondvlak' });
  }
  /* piramide met een vierkant grondvlak van z; hTek is de hoogte in de tekening.
     o.h de hoogte (stippellijn in het midden), o.s de schuine hoogte (lijn over het voorvlak), o.k een opstaande ribbe */
  function pirFig(z, hTek, o){
    var pts = [[0, 0, 0], [z, 0, 0], [z, 0, z], [0, 0, z], [z / 2, hTek, z / 2], [z / 2, 0, z / 2], [z / 2, 0, 0], [z / 2, hTek * 0.6, z * 0.3]];
    var maten = [[0, 1, z + ' cm'], [1, 2, z + ' cm']], lijnen = [];
    if (o.h){ lijnen.push([5, 4, 1, true]); maten.push([5, 4, o.h, 36, 0, K[1]]); }
    if (o.s){ lijnen.push([6, 4, 1]); maten.push([6, 7, o.s, 30, 1, K[1]]); }
    if (o.k) maten.push([4, 1, o.k, 28, 5]);
    return ruimte(pts, [[0, 1], [1, 2], [2, 3, 1], [3, 0, 1], [4, 0], [4, 1], [4, 2], [4, 3, 1]], { maten:maten, lijnen:lijnen, vlak:[[o.s ? [0, 1, 4] : [0, 1, 2, 3], K[0]]], d:0.45, aria:o.aria || 'piramide met een vierkant grondvlak van ' + z + ' bij ' + z + ' cm' });
  }
  /* cilinder: o.r de tekst bij de straal (of de diameter als o.diam), o.h de tekst bij de hoogte */
  function cilFig(o){
    var cx = 150, rx = 95, ry = 28, top = 40, bod = 220, s = '';
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + bod, { stip:'6 5', op:0.6, w:2 });
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + bod, { w:2.5, f:K[0], fo:0.08 });
    s += '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" style="' + stijl({ w:2.5, f:K[0], fo:0.1 }) + '"/>' + ln(cx - rx, top, cx - rx, bod, { w:2.5 }) + ln(cx + rx, top, cx + rx, bod, { w:2.5 });
    if (o.diam) s += ln(cx - rx, top, cx + rx, top, { k:K[1], w:3 }) + tx(cx, top - 8, o.r, { vet:true, k:K[1] });
    else s += ln(cx, top, cx + rx, top, { k:K[1], w:3 }) + tx(cx + rx / 2, top - 8, o.r, { vet:true, k:K[1] });
    s += cir(cx, top, 3.5, { f:'var(--ink)', s:'none', w:0 }) + tx(cx + rx + 12, (top + bod) / 2, o.h, { vet:true, a:'start' });
    return svg(370, 270, s, o.aria || 'cilinder', 340);
  }
  /* kegel: o.r of o.d (straal of diameter van het grondvlak), o.h (hoogte, stippellijn), o.s (schuine hoogte, langs de mantel) */
  function kegelFig(o){
    var cx = 150, rx = 92, ry = 26, top = 28, bod = 214, s = '';
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + bod, { stip:'6 5', op:0.6, w:2 });
    s += pad('M' + (cx - rx) + ' ' + bod + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + bod + ' L' + cx + ' ' + top + ' Z', { w:2.5, f:K[0], fo:0.1 });
    if (o.h) s += ln(cx, top, cx, bod, { k:K[1], w:2.5, stip:'7 5' }) + tx(cx - 14, (top + bod) / 2 + 20, o.h, { vet:true, a:'end', k:K[1] });
    if (o.d) s += ln(cx - rx, bod, cx + rx, bod, { k:K[1], w:3 }) + tx(cx, bod - 13, o.d, { vet:true, k:K[1] });
    else if (o.r) s += ln(cx, bod, cx + rx, bod, { k:K[1], w:3 }) + tx(cx + rx / 2, bod - 13, o.r, { vet:true, k:K[1] });
    if (o.s) s += ln(cx, top, cx + rx, bod, { k:K[1], w:3.5 }) + tx(cx + rx / 2 + 14, (top + bod) / 2 - 6, o.s, { vet:true, a:'start', k:K[1] });
    s += cir(cx, bod, 3.5, { f:'var(--ink)', s:'none', w:0 });
    return svg(350, 254, s, o.aria || 'kegel', 330);
  }
  /* bol: o.r of o.d */
  function bolFig(o){
    var cx = 150, cy = 128, r = 100, s = cir(cx, cy, r, { f:K[0], fo:0.1, w:2.5 });
    s += pad('M' + (cx - r) + ' ' + cy + ' A' + r + ' 28 0 0 1 ' + (cx + r) + ' ' + cy, { stip:'6 5', op:0.6, w:2 }) + pad('M' + (cx - r) + ' ' + cy + ' A' + r + ' 28 0 0 0 ' + (cx + r) + ' ' + cy, { w:2 });
    if (o.d) s += ln(cx - r, cy, cx + r, cy, { k:K[1], w:3 }) + tx(cx, cy - 10, o.d, { vet:true, k:K[1] });
    else s += ln(cx, cy, cx + r, cy, { k:K[1], w:3 }) + tx(cx + r / 2, cy - 10, o.r, { vet:true, k:K[1] });
    return svg(300, 256, s + cir(cx, cy, 3.5, { f:'var(--ink)', s:'none', w:0 }), o.aria || 'bol', 280);
  }

  var ACHTER = ' Gestippelde ribben zitten aan de achterkant: die tel je mee.';
  var H_STRAAL = 'De straal loopt van het middelpunt naar de rand. De diameter loopt van rand tot rand door het middelpunt en is dus twee keer zo lang.';

  /* ================= 1 kubus ================= */
  function kubus(R, soort){
    var a = R.heel(2, 12), e = R.kies(['cm', 'cm', 'cm', 'dm', 'm']), e2 = e + '²', e3 = e + '³';
    var bl = balkFig(a, a, a, e, 'kubus met ribben van ' + a + ' ' + e), begin = 'Een kubus heeft ribben van ' + a + ' ' + e + '. ';
    if (soort === 'ken'){
      if (R.heel(0, 2) === 0) return { vraag:'Alle ribben samen?', context:begin + 'Hoe lang zijn alle ribben samen?', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
        tel('Hoeveel ribben heeft een kubus?', 12, 'Vier onder, vier boven en vier rechtop. De gestippelde ribben tel je mee.', F('8', 'Dat zijn de hoekpunten. Een ribbe is een rand.', '6', 'Dat zijn de vlakken. Een ribbe is een rand.')),
        St('Alle ribben zijn even lang: 12 ' + X + ' ' + a + ' =', metE(String(12 * a), e), 'Twaalf ribben van elk ' + a + ' ' + e + '.', Fz(metE(String(12 * a), e), F(String(8 * a), 'Een kubus heeft 12 ribben, geen 8.', String(6 * a), 'Een kubus heeft 12 ribben. Zes is het aantal vlakken.')), { e:e }) ] };
      var wat = R.kies(['vlakken', 'ribben', 'hoekpunten']), n = { vlakken:6, ribben:12, hoekpunten:8 }[wat];
      var hint = { vlakken:'Onder, boven, voor, achter, links en rechts.', ribben:'Vier onder, vier boven en vier rechtop.', hoekpunten:'Vier onder en vier boven.' }[wat];
      var fout = { vlakken:F('12', 'Dat zijn de ribben. Een vlak is een zijkant.', '8', 'Dat zijn de hoekpunten. Een vlak is een zijkant.'), ribben:F('6', 'Dat zijn de vlakken. Een ribbe is een rand.', '8', 'Dat zijn de hoekpunten. Een ribbe is een rand.'), hoekpunten:F('12', 'Dat zijn de ribben. Een hoekpunt is een punt waar ribben samenkomen.', '6', 'Dat zijn de vlakken. Een hoekpunt is een punt.') }[wat];
      return { vraag:'Aantal ' + wat + '?', context:begin + 'Hoeveel ' + wat + ' heeft de kubus?' + ACHTER, beeld:bl, zelfBeeld:bl, stappen:[
        kstap('Welke vorm hebben de vlakken van een kubus?', 'vierkanten', ['vierkanten', 'rechthoeken die langer zijn dan breed', 'driehoeken'], 'Alle ribben zijn even lang. Elk vlak is dus even lang als breed.'),
        tel('Hoeveel ' + wat + ' heeft een kubus?', n, hint, fout) ] };
    }
    var v = a * a;
    if (soort === 'opp') return { vraag:'Oppervlakte?', context:begin + 'Bereken de oppervlakte van alle vlakken samen.', eenheid:e2, beeld:bl, zelfBeeld:bl, stappen:[
      St('Eén vlak is een vierkant: ' + a + ' ' + X + ' ' + a + ' =', metE(String(v), e2), 'Lengte keer breedte van één vlak.', Fz(metE(String(v), e2), F(String(4 * a), 'Dat is de omtrek van het vlak. Doe ' + a + ' keer ' + a + '.', String(2 * a), 'Keer zichzelf, niet keer 2.')), { e:e2 }),
      tel('Hoeveel vlakken heeft een kubus?', 6, 'Onder, boven, voor, achter, links en rechts.', F('4', 'Tel onder en boven ook mee.', '12', 'Dat zijn de ribben.')),
      St('Oppervlakte = 6 ' + X + ' ' + v + ' =', metE(T(6 * v), e2), 'Zes vlakken die even groot zijn.', Fz(metE(T(6 * v), e2), F(T(v * a), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.', T(4 * v), 'Tel onder en boven ook mee: zes vlakken.')), { e:e2 }) ] };
    return { vraag:'Inhoud?', context:begin + 'Bereken de inhoud.', eenheid:e3, beeld:bl, zelfBeeld:bl, stappen:[
      St('Grondvlak = ' + a + ' ' + X + ' ' + a + ' =', metE(String(v), e2), 'De onderste laag: lengte keer breedte.', Fz(metE(String(v), e2), F(String(2 * a), 'Keer zichzelf, niet keer 2.')), { e:e2 }),
      St('Inhoud = ' + v + ' ' + X + ' ' + a + ' =', metE(T(v * a), e3), 'Zoveel lagen als de hoogte: keer ' + a + '.', Fz(metE(T(v * a), e3), F(String(3 * a), 'Keer, niet plus: ' + a + ' keer ' + a + ' keer ' + a + '.', String(v), 'Dat is alleen het grondvlak. Doe nog keer de hoogte.', T(6 * v), 'Dat is de oppervlakte. De inhoud is grondvlak keer hoogte.')), { e:e3 }) ] };
  }

  /* ================= 2 balk ================= */
  function balk(R, soort){
    var l, b, h, e = R.kies(['cm', 'cm', 'cm', 'dm', 'm']), e2 = e + '²', e3 = e + '³';
    do { l = R.heel(4, 12); b = R.heel(2, 8); h = R.heel(2, 9); } while (l === b || l === h || b === h);
    var bl = balkFig(l, b, h, e, 'balk van ' + l + ' bij ' + b + ' bij ' + h + ' ' + e), begin = 'Een balk is ' + l + ' ' + e + ' lang, ' + b + ' ' + e + ' breed en ' + h + ' ' + e + ' hoog. ';
    if (soort === 'ken'){
      if (R.heel(0, 2) === 0){ var som = l + b + h; return { vraag:'Alle ribben samen?', context:begin + 'Hoe lang zijn alle ribben samen?', eenheid:e, beeld:bl, zelfBeeld:bl, stappen:[
        tel('Hoeveel ribben van de balk zijn ' + l + ' ' + e + ' lang?', 4, 'Twee onder en twee boven: ze lopen alle vier dezelfde kant op.', F('2', 'Kijk ook naar het bovenvlak en naar de achterkant.', '12', 'Dat zijn alle ribben samen. Hoeveel daarvan zijn ' + l + ' ' + e + ' lang?')),
        St('Van elke maat één ribbe: ' + l + ' + ' + b + ' + ' + h + ' =', metE(String(som), e), 'Tel de lengte, de breedte en de hoogte op.', null, { e:e }),
        St('Van elke maat zijn er vier: 4 ' + X + ' ' + som + ' =', metE(String(4 * som), e), 'Vier ribben van ' + l + ', vier van ' + b + ' en vier van ' + h + '.', Fz(metE(String(4 * som), e), F(String(som), 'Van elke maat zijn er vier ribben.', String(2 * som), 'Van elke maat zijn er vier ribben, geen twee.')), { e:e }) ] }; }
      var wat = R.kies(['vlakken', 'ribben', 'hoekpunten']), n = { vlakken:6, ribben:12, hoekpunten:8 }[wat];
      var hint = { vlakken:'Onder, boven, voor, achter, links en rechts.', ribben:'Vier onder, vier boven en vier rechtop.', hoekpunten:'Vier onder en vier boven.' }[wat];
      var fout = { vlakken:F('12', 'Dat zijn de ribben. Een vlak is een zijkant.', '8', 'Dat zijn de hoekpunten. Een vlak is een zijkant.'), ribben:F('6', 'Dat zijn de vlakken. Een ribbe is een rand.', '8', 'Dat zijn de hoekpunten. Een ribbe is een rand.'), hoekpunten:F('12', 'Dat zijn de ribben. Een hoekpunt is een punt waar ribben samenkomen.', '6', 'Dat zijn de vlakken. Een hoekpunt is een punt.') }[wat];
      return { vraag:'Aantal ' + wat + '?', context:begin + 'Hoeveel ' + wat + ' heeft de balk?' + ACHTER, beeld:bl, zelfBeeld:bl, stappen:[
        kstap('Welke vorm hebben de vlakken van deze balk?', 'rechthoeken', ['rechthoeken', 'driehoeken', 'cirkels'], 'Elk vlak heeft vier rechte hoeken. Tegenover elkaar liggen twee dezelfde vlakken.'),
        tel('Hoeveel ' + wat + ' heeft een balk?', n, hint, fout) ] };
    }
    if (soort === 'opp'){ var a1 = 2 * l * b, a2 = 2 * l * h, a3 = 2 * b * h, tot = a1 + a2 + a3;
      return { vraag:'Oppervlakte?', context:begin + 'Bereken de oppervlakte van alle vlakken samen.', eenheid:e2, beeld:bl, zelfBeeld:bl, stappen:[
        St('Onder en boven: 2 ' + X + ' ' + l + ' ' + X + ' ' + b + ' =', metE(String(a1), e2), 'Eén vlak is ' + l + ' bij ' + b + ', en er zijn er twee.', Fz(metE(String(a1), e2), F(String(l * b), 'Er zijn twee van deze vlakken.')), { e:e2 }),
        St('Voor en achter: 2 ' + X + ' ' + l + ' ' + X + ' ' + h + ' =', metE(String(a2), e2), 'Eén vlak is ' + l + ' bij ' + h + ', en er zijn er twee.', Fz(metE(String(a2), e2), F(String(l * h), 'Er zijn twee van deze vlakken.')), { e:e2 }),
        St('Links en rechts: 2 ' + X + ' ' + b + ' ' + X + ' ' + h + ' =', metE(String(a3), e2), 'Eén vlak is ' + b + ' bij ' + h + ', en er zijn er twee.', Fz(metE(String(a3), e2), F(String(b * h), 'Er zijn twee van deze vlakken.')), { e:e2 }),
        St('Samen: ' + a1 + ' + ' + a2 + ' + ' + a3 + ' =', metE(String(tot), e2), 'Tel de drie paren op.', Fz(metE(String(tot), e2), F(String(l * b * h), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.', String(tot / 2), 'Je telde elk vlak maar één keer.')), { e:e2 }) ] }; }
    var Gv = l * b, V = Gv * h;
    return { vraag:'Inhoud?', context:begin + 'Bereken de inhoud.', eenheid:e3, beeld:bl, zelfBeeld:bl, stappen:[
      St('Grondvlak = ' + l + ' ' + X + ' ' + b + ' =', metE(String(Gv), e2), 'Lengte keer breedte: de onderste laag.', null, { e:e2 }),
      St('Inhoud = ' + Gv + ' ' + X + ' ' + h + ' =', metE(String(V), e3), 'Zoveel lagen als de hoogte: keer ' + h + '.', Fz(metE(String(V), e3), F(String(l + b + h), 'Keer, niet plus.', String(Gv), 'Dat is alleen het grondvlak. Doe nog keer de hoogte.')), { e:e3 }) ] };
  }

  /* ================= 3 prisma ================= */
  var TRIPEL = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [9, 12, 15]];
  function prisma(R, soort){
    var t = R.kies(TRIPEL), a = t[0], b = t[1], c = t[2], L = R.heel(4, 15);
    var metC = 'Een prisma heeft als grondvlak een rechthoekige driehoek met zijden van ' + a + ', ' + b + ' en ' + c + ' cm. Het prisma is ' + L + ' cm lang. ';
    if (soort === 'ken'){ var bl = prismaFig(a, b, c, L);
      if (R.heel(0, 2) === 0){ var om = a + b + c;
        return { vraag:'Alle ribben samen?', context:metC + 'Hoe lang zijn alle ribben samen?', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
          St('De ribben van één driehoek: ' + a + ' + ' + b + ' + ' + c + ' =', metE(String(om), 'cm'), 'Dat is de omtrek van de driehoek.', null, { e:'cm' }),
          St('Er zijn twee driehoeken, voor en achter: 2 ' + X + ' ' + om + ' =', metE(String(2 * om), 'cm'), 'De achterkant is precies gelijk aan de voorkant.', null, { e:'cm' }),
          St('Drie ribben van ' + L + ' cm naar achteren: 3 ' + X + ' ' + L + ' =', metE(String(3 * L), 'cm'), 'Vanuit elk hoekpunt van de driehoek loopt er één naar achteren.', Fz(metE(String(3 * L), 'cm'), F(String(2 * L), 'Een driehoek heeft drie hoekpunten: er lopen drie ribben naar achteren.', String(4 * L), 'Een driehoek heeft drie hoekpunten, geen vier.')), { e:'cm' }),
          St('Samen: ' + (2 * om) + ' + ' + (3 * L) + ' =', metE(String(2 * om + 3 * L), 'cm'), 'Tel de ribben van de driehoeken en de ribben naar achteren op.', null, { e:'cm' }) ] }; }
      var wat = R.kies(['vlakken', 'ribben', 'hoekpunten']), n = { vlakken:5, ribben:9, hoekpunten:6 }[wat];
      var hint = { vlakken:'Twee driehoeken en drie rechthoeken.', ribben:'Drie voor, drie achter en drie ertussen.', hoekpunten:'Drie voor en drie achter.' }[wat];
      var fout = { vlakken:F('6', 'Een balk heeft er zes. Dit prisma heeft maar drie zijkanten, plus voor en achter.', '9', 'Dat zijn de ribben. Een vlak is een zijkant.', '3', 'Tel de twee driehoeken ook mee.'), ribben:F('6', 'Dat zijn de hoekpunten. Een ribbe is een rand.', '5', 'Dat zijn de vlakken. Een ribbe is een rand.', '12', 'Een balk heeft er twaalf. Hier is het grondvlak een driehoek.'), hoekpunten:F('9', 'Dat zijn de ribben. Een hoekpunt is een punt.', '5', 'Dat zijn de vlakken. Een hoekpunt is een punt.', '8', 'Een balk heeft er acht. Hier is het grondvlak een driehoek.') }[wat];
      return { vraag:'Aantal ' + wat + '?', context:metC + 'Hoeveel ' + wat + ' heeft het prisma?' + ACHTER, beeld:bl, zelfBeeld:bl, stappen:[
        kstap('Het prisma ligt op zijn kant. Welke vorm hebben de voorkant en de achterkant?', 'driehoeken', ['driehoeken', 'rechthoeken', 'cirkels'], 'Kijk naar de gekleurde voorkant. De achterkant is precies gelijk.'),
        tel('Hoeveel ' + wat + ' heeft dit prisma?', n, hint, fout) ] };
    }
    if (soort === 'opp'){ var dr = a * b, rh = (a + b + c) * L, tot = dr + rh, bl2 = prismaFig(a, b, c, L);
      return { vraag:'Oppervlakte?', context:metC + 'Bereken de oppervlakte van alle vlakken samen.', eenheid:'cm²', beeld:bl2, zelfBeeld:bl2, stappen:[
        St('Twee driehoeken: 2 ' + X + ' (' + a + ' ' + X + ' ' + b + ' : 2) =', metE(String(dr), 'cm²'), 'Eén driehoek is ' + a + ' ' + X + ' ' + b + ' : 2 = ' + T(dr / 2) + '. Er zijn er twee.', Fz(metE(String(dr), 'cm²'), F(T(dr / 2), 'Er zijn twee driehoeken: voor en achter.', String(a * c), 'Gebruik de rechthoekszijden ' + a + ' en ' + b + ', niet de schuine zijde.')), { e:'cm²' }),
        St('Drie rechthoeken: (' + a + ' + ' + b + ' + ' + c + ') ' + X + ' ' + L + ' =', metE(String(rh), 'cm²'), 'Alle zijkanten zijn ' + L + ' lang. Samen zijn ze ' + (a + b + c) + ' breed.', Fz(metE(String(rh), 'cm²'), F(String((a + b) * L), 'Vergeet de rechthoek onder de schuine zijde niet.')), { e:'cm²' }),
        St('Samen: ' + dr + ' + ' + rh + ' =', metE(String(tot), 'cm²'), 'Tel de driehoeken en de rechthoeken op.', Fz(metE(String(tot), 'cm²'), F(String(dr / 2 * L), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.')), { e:'cm²' }) ] }; }
    var Gv = a * b / 2, V = Gv * L, bl3 = prismaFig(a, b, 0, L);
    return { vraag:'Inhoud?', context:'Een prisma heeft als grondvlak een rechthoekige driehoek met rechthoekszijden van ' + a + ' cm en ' + b + ' cm. Het prisma is ' + L + ' cm lang. Bereken de inhoud.', eenheid:'cm³', beeld:bl3, zelfBeeld:bl3, stappen:[
      St('Grondvlak = ' + a + ' ' + X + ' ' + b + ' : 2 =', metE(T(Gv), 'cm²'), 'Het grondvlak is de driehoek aan de voorkant: basis keer hoogte, gedeeld door 2.', Fz(metE(T(Gv), 'cm²'), F(T(Gv * 2), 'Een driehoek: deel nog door 2.')), { e:'cm²' }),
      St('Inhoud = grondvlak ' + X + ' lengte = ' + T(Gv) + ' ' + X + ' ' + L + ' =', metE(T(V), 'cm³'), 'De lengte naar achteren is hier de hoogte van het prisma.', Fz(metE(T(V), 'cm³'), F(T(V * 2), 'Het grondvlak is een driehoek: deel door 2.', T(V / 3), 'Bij een prisma deel je niet door 3. Dat doe je alleen bij een piramide.')), { e:'cm³' }) ] };
  }

  /* ================= 4 cilinder ================= */
  function cilinder(R, soort){
    var r, h, st = [];
    if (soort === 'ken'){
      var v = R.kies(['tel', 'tel', 'diam', 'mantel']); r = R.heel(2, 12); h = R.heel(3, 20);
      if (v === 'tel'){ var wat = R.kies(['platte vlakken', 'gebogen vlakken', 'hoekpunten']), n = { 'platte vlakken':2, 'gebogen vlakken':1, hoekpunten:0 }[wat];
        var hint = { 'platte vlakken':'De bodem en het deksel: twee cirkels.', 'gebogen vlakken':'Alleen de wand eromheen is gebogen. Die heet de mantel.', hoekpunten:'Een hoekpunt is een punt waar rechte ribben samenkomen. Een cilinder heeft alleen twee ronde randen.' }[wat];
        var fout = { 'platte vlakken':F('3', 'De wand is gebogen. Tel alleen de platte vlakken.', '1', 'Tel het deksel en de bodem.'), 'gebogen vlakken':F('2', 'De twee cirkels zijn plat. Alleen de wand is gebogen.', '3', 'De twee cirkels zijn plat. Alleen de wand is gebogen.'), hoekpunten:F('2', 'Dat zijn de ronde randen. Daar komen geen ribben in een punt samen.') }[wat];
        var bl = cilFig({ r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'cilinder met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm' });
        return { vraag:'Aantal ' + wat + '?', context:'Een cilinder heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Hoeveel ' + wat + ' heeft de cilinder?', beeld:bl, zelfBeeld:bl, stappen:[
          kstap('Welke vorm hebben het grondvlak en het bovenvlak van een cilinder?', 'cirkels', ['cirkels', 'rechthoeken', 'driehoeken'], 'Denk aan de bodem en het deksel van een blik.'),
          tel('Hoeveel ' + wat + ' heeft een cilinder?', n, hint, fout) ] }; }
      if (v === 'diam'){ var naarD = R.heel(0, 1) === 1;
        var bl2 = cilFig({ r:naarD ? 'r = ' + r + ' cm' : 'd = ' + (2 * r) + ' cm', h:'h = ' + h + ' cm', diam:!naarD, aria:'cilinder van ' + h + ' cm hoog' });
        return { vraag:naarD ? 'Diameter?' : 'Straal?', context:'Een cilinder heeft een ' + (naarD ? 'straal van ' + r : 'diameter van ' + (2 * r)) + ' cm en een hoogte van ' + h + ' cm. Hoe groot is de ' + (naarD ? 'diameter' : 'straal') + ' van het grondvlak?', eenheid:'cm', beeld:bl2, zelfBeeld:bl2, stappen:[
          kstap('Welke is langer: de straal of de diameter?', 'de diameter: twee keer de straal', ['de diameter: twee keer de straal', 'de straal: twee keer de diameter', 'ze zijn even lang'], H_STRAAL),
          naarD ? St('Diameter = 2 ' + X + ' ' + r + ' =', metE(String(2 * r), 'cm'), 'Twee keer de straal.', Fz(metE(String(2 * r), 'cm'), F(T(r / 2), 'Keer 2, niet gedeeld door 2.', String(r * r), 'Keer 2, niet in het kwadraat.')), { e:'cm' })
                : St('Straal = ' + (2 * r) + ' : 2 =', metE(String(r), 'cm'), 'De helft van de diameter.', Fz(metE(String(r), 'cm'), F(String(4 * r), 'Delen door 2, niet keer 2.')), { e:'cm' }) ] }; }
      var om; do { r = R.heel(2, 12); om = PI * 2 * r; } while (grens(om, 1));
      var bl3 = cilFig({ r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'cilinder met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm' });
      return { vraag:'Breedte van de mantel?', context:'Een cilinder heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Rol de wand (de mantel) uit: je krijgt een rechthoek. Hoe breed is die rechthoek? Rond af op 1 decimaal.', eenheid:'cm', beeld:bl3, zelfBeeld:bl3, stappen:[
        kstap('De uitgerolde mantel is een rechthoek. Hoe breed is die?', 'zo breed als de omtrek van de cirkel', ['zo breed als de omtrek van de cirkel', 'zo breed als de diameter van de cirkel', 'zo breed als de hoogte van de cilinder'], 'De wand past precies één keer om de cirkel heen.'),
        St('Diameter = 2 ' + X + ' ' + r + ' =', metE(String(2 * r), 'cm'), 'Twee keer de straal.', null, { e:'cm' }),
        St('Omtrek = π ' + X + ' ' + (2 * r) + ' ≈ (rond af op 1 decimaal)', af(om, 1, 'cm'), 'Tik in: π ' + X + ' ' + (2 * r) + ' = ' + T(om, { dec:3 }) + '…', Fz(af(om, 1, 'cm'), F(afT(PI * r, 1), 'Gebruik de diameter ' + (2 * r) + ', niet de straal.', afT(PI * r * r, 1), 'Dat is de oppervlakte van de cirkel. De omtrek is π keer de diameter.')), { e:'cm' }) ] };
    }
    if (soort === 'opp'){ var c2, w;
      do { r = R.heel(2, 8); h = R.heel(3, 15); c2 = 2 * PI * r * r; w = 2 * PI * r * h; } while (grens(c2, 1) || grens(w, 1) || grens(c2 + w, 1) || !eens(c2, w, c2 + w));
      var bl4 = cilFig({ r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'cilinder met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm' });
      return { vraag:'Oppervlakte?', context:'Een cilinder heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Bereken de oppervlakte van de twee cirkels en de mantel samen. Rond elk tussenantwoord en het eindantwoord af op 1 decimaal.', eenheid:'cm²', beeld:bl4, zelfBeeld:bl4, stappen:[
        St('Twee cirkels: 2 ' + X + ' π ' + X + ' ' + r + '² ≈', af(c2, 1, 'cm²'), 'Tik in: 2 ' + X + ' π ' + X + ' ' + (r * r) + ' = ' + T(c2, { dec:3 }) + '…', Fz(af(c2, 1, 'cm²'), F(afT(c2 / 2, 1), 'Er zijn twee cirkels: deksel en bodem.')), { e:'cm²' }),
        St('De mantel: π ' + X + ' ' + (2 * r) + ' ' + X + ' ' + h + ' ≈', af(w, 1, 'cm²'), 'De mantel is uitgerold een rechthoek: zo breed als de omtrek π ' + X + ' ' + (2 * r) + ', en ' + h + ' hoog. Tik in: π ' + X + ' ' + (2 * r) + ' ' + X + ' ' + h + ' = ' + T(w, { dec:3 }) + '…', Fz(af(w, 1, 'cm²'), F(afT(w / 2, 1), 'Gebruik de diameter ' + (2 * r) + ' in π keer d, niet de straal.')), { e:'cm²' }),
        St('Samen: ' + afT(c2, 1) + ' + ' + afT(w, 1) + ' =', af(c2 + w, 1, 'cm²'), 'Tel de cirkels en de mantel op.', Fz(af(c2 + w, 1, 'cm²'), F(afT(PI * r * r * h, 1), 'Dat is de inhoud. De oppervlakte is alle vlakken samen.')), { e:'cm²' }) ] }; }
    var dGeg = R.heel(0, 2) === 0, d = R.kies([0, 1]), V;
    do { r = R.heel(2, 12); h = R.heel(3, 25); V = PI * r * r * h; } while (grens(V, d));
    var bl5 = cilFig({ r:dGeg ? 'd = ' + (2 * r) + ' cm' : 'r = ' + r + ' cm', h:'h = ' + h + ' cm', diam:dGeg, aria:'cilinder van ' + h + ' cm hoog' });
    if (dGeg) st.push(St('De straal: r = ' + (2 * r) + ' : 2 =', metE(String(r), 'cm'), 'De straal is de helft van de diameter.', Fz(metE(String(r), 'cm'), F(String(4 * r), 'Delen door 2, niet keer 2.')), { e:'cm' }));
    st.push(St('r² = ' + r + ' ' + X + ' ' + r + ' =', String(r * r), r + ' keer zichzelf.', Fz([String(r * r)], F(String(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.'))));
    st.push(St('Inhoud = π ' + X + ' ' + (r * r) + ' ' + X + ' ' + h + ' ≈ (' + rondTekst(d) + ')', af(V, d, 'cm³'), 'Grondvlak keer hoogte. Tik in: π ' + X + ' ' + (r * r) + ' ' + X + ' ' + h + ' = ' + T(V, { dec:3 }) + '…', Fz(af(V, d, 'cm³'), F(afT(PI * 4 * r * r * h, d), 'Je nam de diameter. Gebruik de straal.', afT(PI * 2 * r * h, d), 'Je deed π keer d keer h. Gebruik π keer r² keer h.')), { e:'cm³' }));
    return { vraag:'Inhoud?', context:'Een cilinder heeft ' + (dGeg ? 'een diameter van ' + (2 * r) : 'een straal van ' + r) + ' cm en een hoogte van ' + h + ' cm. Bereken de inhoud. ' + Rond(d), eenheid:'cm³', beeld:bl5, zelfBeeld:bl5, stappen:st };
  }

  /* ================= 5 piramide ================= */
  function piramide(R, soort){
    var z, h, s, k;
    if (soort === 'ken'){
      if (R.heel(0, 2) === 0){
        z = R.heel(3, 12); k = R.heel(Math.ceil(0.75 * z) + 1, z + 3);
        var blk = pirFig(z, Math.sqrt(k * k - z * z / 2), { k:k + ' cm', aria:'piramide met een vierkant grondvlak van ' + z + ' cm en opstaande ribben van ' + k + ' cm' });
        return { vraag:'Alle ribben samen?', context:'Een piramide heeft een vierkant grondvlak met zijden van ' + z + ' cm. De opstaande ribben naar de top zijn elk ' + k + ' cm lang. Hoe lang zijn alle ribben samen?', eenheid:'cm', beeld:blk, zelfBeeld:blk, stappen:[
          St('Vier ribben om het grondvlak: 4 ' + X + ' ' + z + ' =', metE(String(4 * z), 'cm'), 'Het grondvlak is een vierkant: vier even lange zijden.', null, { e:'cm' }),
          St('Vier opstaande ribben: 4 ' + X + ' ' + k + ' =', metE(String(4 * k), 'cm'), 'Vanuit elk hoekpunt van het grondvlak loopt er één naar de top.', null, { e:'cm' }),
          St('Samen: ' + (4 * z) + ' + ' + (4 * k) + ' =', metE(String(4 * z + 4 * k), 'cm'), 'Tel de ribben van het grondvlak en de opstaande ribben op.', null, { e:'cm' }) ] };
      }
      z = R.heel(3, 12); do { h = R.heel(4, 15); } while (h > 1.4 * z + 2);
      var wat = R.kies(['vlakken', 'ribben', 'hoekpunten']), n = { vlakken:5, ribben:8, hoekpunten:5 }[wat];
      var hint = { vlakken:'Eén grondvlak en vier driehoeken.', ribben:'Vier om het grondvlak en vier naar de top.', hoekpunten:'Vier van het grondvlak, en de top.' }[wat];
      var fout = { vlakken:F('4', 'Tel het grondvlak ook mee.', '8', 'Dat zijn de ribben. Een vlak is een zijkant.', '6', 'Een balk heeft er zes. Een piramide heeft geen bovenvlak: de zijvlakken komen samen in de top.'), ribben:F('5', 'Dat zijn de vlakken. Een ribbe is een rand.', '4', 'Tel de ribben om het grondvlak ook mee.', '12', 'Een balk heeft er twaalf. Een piramide heeft geen bovenvlak.'), hoekpunten:F('4', 'De top is ook een hoekpunt.', '8', 'Dat zijn de ribben. Een hoekpunt is een punt.') }[wat];
      var bl = pirFig(z, h, { h:h + ' cm' });
      return { vraag:'Aantal ' + wat + '?', context:'Een piramide heeft een vierkant grondvlak met zijden van ' + z + ' cm en een hoogte van ' + h + ' cm. Hoeveel ' + wat + ' heeft de piramide?' + ACHTER, beeld:bl, zelfBeeld:bl, stappen:[
        kstap('Welke vorm hebben de opstaande zijvlakken van een piramide?', 'driehoeken', ['driehoeken', 'rechthoeken', 'vierkanten'], 'Elk zijvlak loopt van een zijde van het grondvlak naar de top.'),
        tel('Hoeveel ' + wat + ' heeft deze piramide?', n, hint, fout) ] };
    }
    if (soort === 'opp'){
      do { z = R.heel(4, 12); s = R.heel(Math.floor(z / 2) + 2, Math.ceil(1.2 * z)); } while ((z * s) % 2);
      var G2 = z * z, Z = z * s / 2, tot = G2 + 4 * Z;
      var bl2 = pirFig(z, Math.sqrt(s * s - z * z / 4), { s:s + ' cm', aria:'piramide met een vierkant grondvlak van ' + z + ' cm en een schuine hoogte van ' + s + ' cm' });
      return { vraag:'Oppervlakte?', context:'Een piramide heeft een vierkant grondvlak met zijden van ' + z + ' cm. De schuine hoogte (van de top over een zijvlak naar het midden van een zijde van het grondvlak) is ' + s + ' cm. Bereken de oppervlakte van alle vlakken samen.', eenheid:'cm²', beeld:bl2, zelfBeeld:bl2, stappen:[
        St('Het grondvlak: ' + z + ' ' + X + ' ' + z + ' =', metE(String(G2), 'cm²'), 'Het grondvlak is een vierkant.', Fz(metE(String(G2), 'cm²'), F(String(4 * z), 'Dat is de omtrek. Doe ' + z + ' keer ' + z + '.')), { e:'cm²' }),
        St('Eén zijvlak is een driehoek: ' + z + ' ' + X + ' ' + s + ' : 2 =', metE(String(Z), 'cm²'), 'Basis keer hoogte, gedeeld door 2. De hoogte van de driehoek is de schuine hoogte.', Fz(metE(String(Z), 'cm²'), F(String(z * s), 'Een driehoek: vergeet niet te delen door 2.')), { e:'cm²' }),
        St('Vier zijvlakken: 4 ' + X + ' ' + Z + ' =', metE(String(4 * Z), 'cm²'), 'De vier driehoeken zijn even groot.', null, { e:'cm²' }),
        St('Samen: ' + G2 + ' + ' + (4 * Z) + ' =', metE(String(tot), 'cm²'), 'Het grondvlak plus de vier zijvlakken.', Fz(metE(String(tot), 'cm²'), F(String(4 * Z), 'Tel het grondvlak ook mee.', String(G2 + Z), 'Er zijn vier driehoeken, niet één.')), { e:'cm²' }) ] };
    }
    var Gv, V;
    do { z = R.heel(3, 12); h = R.heel(4, 15); Gv = z * z; } while ((Gv * h) % 3 || h > 1.4 * z + 2);
    V = Gv * h / 3;
    var bl3 = pirFig(z, h, { h:h + ' cm' });
    return { vraag:'Inhoud?', context:'Een piramide heeft een vierkant grondvlak met zijden van ' + z + ' cm. De hoogte is ' + h + ' cm. Bereken de inhoud.', eenheid:'cm³', beeld:bl3, zelfBeeld:bl3, stappen:[
      St('Grondvlak = ' + z + ' ' + X + ' ' + z + ' =', metE(String(Gv), 'cm²'), 'Het grondvlak is een vierkant: lengte keer breedte.', null, { e:'cm²' }),
      St('Grondvlak ' + X + ' hoogte = ' + Gv + ' ' + X + ' ' + h + ' =', metE(String(Gv * h), 'cm³'), 'Dat is de inhoud van de balk eromheen.', null, { e:'cm³' }),
      St('Inhoud = ' + (Gv * h) + ' : 3 =', metE(String(V), 'cm³'), 'De piramide is een derde van de balk eromheen.', Fz(metE(String(V), 'cm³'), F(String(Gv * h), 'Dat is de balk eromheen. Deel nog door 3.', T(Gv * h / 2), 'Deel door 3, niet door 2.')), { e:'cm³' }) ] };
  }

  /* ================= 6 kegel ================= */
  function kegel(R, soort){
    var r, h, s;
    if (soort === 'ken'){
      var v = R.kies(['tel', 'tel', 'diam', 'omtrek']); r = R.heel(2, 10); h = R.heel(4, 20);
      if (v === 'tel'){ var wat = R.kies(['platte vlakken', 'gebogen vlakken', 'rechte ribben']), n = { 'platte vlakken':1, 'gebogen vlakken':1, 'rechte ribben':0 }[wat];
        var hint = { 'platte vlakken':'Alleen het grondvlak is plat: een cirkel.', 'gebogen vlakken':'De wand die naar de top loopt is gebogen. Die heet de mantel.', 'rechte ribben':'Er is alleen een ronde rand om het grondvlak. Een rechte ribbe heeft een kegel niet.' }[wat];
        var fout = { 'platte vlakken':F('2', 'Een kegel heeft geen deksel: de mantel loopt naar een punt.', '0', 'Het grondvlak is een platte cirkel.'), 'gebogen vlakken':F('2', 'Het grondvlak is plat. Alleen de mantel is gebogen.', '0', 'De mantel naar de top is gebogen.'), 'rechte ribben':F('1', 'De rand om het grondvlak is rond, niet recht.', '2', 'De schuine lijnen in de tekening zijn de zijkant van de mantel, geen ribben.') }[wat];
        var bl = kegelFig({ r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'kegel met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm' });
        return { vraag:'Aantal ' + wat + '?', context:'Een kegel heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Hoeveel ' + wat + ' heeft de kegel?', beeld:bl, zelfBeeld:bl, stappen:[
          kstap('Welke vorm heeft het grondvlak van een kegel?', 'een cirkel', ['een cirkel', 'een vierkant', 'een driehoek'], 'Denk aan de opening van een ijshoorntje.'),
          tel('Hoeveel ' + wat + ' heeft een kegel?', n, hint, fout) ] }; }
      if (v === 'diam'){ var naarD = R.heel(0, 1) === 1;
        var bl2 = kegelFig(naarD ? { r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'kegel van ' + h + ' cm hoog' } : { d:'d = ' + (2 * r) + ' cm', h:'h = ' + h + ' cm', aria:'kegel van ' + h + ' cm hoog' });
        return { vraag:naarD ? 'Diameter?' : 'Straal?', context:'Een kegel heeft een ' + (naarD ? 'straal van ' + r : 'diameter van ' + (2 * r)) + ' cm en een hoogte van ' + h + ' cm. Hoe groot is de ' + (naarD ? 'diameter' : 'straal') + ' van het grondvlak?', eenheid:'cm', beeld:bl2, zelfBeeld:bl2, stappen:[
          kstap('Welke is langer: de straal of de diameter?', 'de diameter: twee keer de straal', ['de diameter: twee keer de straal', 'de straal: twee keer de diameter', 'ze zijn even lang'], H_STRAAL),
          naarD ? St('Diameter = 2 ' + X + ' ' + r + ' =', metE(String(2 * r), 'cm'), 'Twee keer de straal.', Fz(metE(String(2 * r), 'cm'), F(T(r / 2), 'Keer 2, niet gedeeld door 2.', String(r * r), 'Keer 2, niet in het kwadraat.')), { e:'cm' })
                : St('Straal = ' + (2 * r) + ' : 2 =', metE(String(r), 'cm'), 'De helft van de diameter.', Fz(metE(String(r), 'cm'), F(String(4 * r), 'Delen door 2, niet keer 2.')), { e:'cm' }) ] }; }
      var om; do { r = R.heel(2, 10); om = PI * 2 * r; } while (grens(om, 1));
      var bl3 = kegelFig({ r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'kegel met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm' });
      return { vraag:'Omtrek van het grondvlak?', context:'Een kegel heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. De mantel sluit precies aan op de rand van het grondvlak. Hoe lang is die rand? Rond af op 1 decimaal.', eenheid:'cm', beeld:bl3, zelfBeeld:bl3, stappen:[
        kstap('De rand van het grondvlak is een cirkel. Welke formule geeft de lengte van die rand?', 'omtrek = π ' + X + ' diameter', ['omtrek = π ' + X + ' diameter', 'oppervlakte = π ' + X + ' r²', 'omtrek = 4 ' + X + ' zijde'], 'De lengte van de rand is de omtrek van de cirkel.'),
        St('Diameter = 2 ' + X + ' ' + r + ' =', metE(String(2 * r), 'cm'), 'Twee keer de straal.', null, { e:'cm' }),
        St('Omtrek = π ' + X + ' ' + (2 * r) + ' ≈ (rond af op 1 decimaal)', af(om, 1, 'cm'), 'Tik in: π ' + X + ' ' + (2 * r) + ' = ' + T(om, { dec:3 }) + '…', Fz(af(om, 1, 'cm'), F(afT(PI * r, 1), 'Gebruik de diameter ' + (2 * r) + ', niet de straal.', afT(PI * r * r, 1), 'Dat is de oppervlakte van de cirkel. De omtrek is π keer de diameter.')), { e:'cm' }) ] };
    }
    if (soort === 'opp'){ var C, M;
      do { r = R.heel(2, 8); s = R.heel(r + 1, r + 8); C = PI * r * r; M = PI * r * s; } while (grens(C, 1) || grens(M, 1) || grens(C + M, 1) || !eens(C, M, C + M));
      var bl4 = kegelFig({ r:'r = ' + r + ' cm', s:'s = ' + s + ' cm', aria:'kegel met een straal van ' + r + ' cm en een schuine hoogte van ' + s + ' cm' });
      return { vraag:'Oppervlakte?', context:'Een kegel heeft een straal van ' + r + ' cm. De schuine hoogte s (van de top langs de mantel naar de rand) is ' + s + ' cm. Bereken de oppervlakte van het grondvlak en de mantel samen. Rond elk tussenantwoord en het eindantwoord af op 1 decimaal.', eenheid:'cm²', beeld:bl4, zelfBeeld:bl4, stappen:[
        St('Het grondvlak: π ' + X + ' ' + r + '² ≈', af(C, 1, 'cm²'), 'Tik in: π ' + X + ' ' + (r * r) + ' = ' + T(C, { dec:3 }) + '…', Fz(af(C, 1, 'cm²'), F(afT(2 * PI * r, 1), 'Dat is de omtrek. Gebruik π keer r².')), { e:'cm²' }),
        St('De mantel: π ' + X + ' ' + r + ' ' + X + ' ' + s + ' ≈', af(M, 1, 'cm²'), 'De mantel is π keer de straal keer de schuine hoogte. Tik in: π ' + X + ' ' + r + ' ' + X + ' ' + s + ' = ' + T(M, { dec:3 }) + '…', Fz(af(M, 1, 'cm²'), F(afT(2 * M, 1), 'Gebruik de straal ' + r + ', niet de diameter.')), { e:'cm²' }),
        St('Samen: ' + afT(C, 1) + ' + ' + afT(M, 1) + ' =', af(C + M, 1, 'cm²'), 'Tel het grondvlak en de mantel op.', Fz(af(C + M, 1, 'cm²'), F(afT(M, 1), 'Tel het grondvlak ook mee.')), { e:'cm²' }) ] }; }
    var d = R.kies([0, 1]), V;
    do { r = R.heel(2, 9); h = R.heel(4, 20); V = PI * r * r * h / 3; } while (grens(V, d));
    var bl5 = kegelFig({ r:'r = ' + r + ' cm', h:'h = ' + h + ' cm', aria:'kegel met een straal van ' + r + ' cm en een hoogte van ' + h + ' cm' });
    return { vraag:'Inhoud?', context:'Een kegel heeft een straal van ' + r + ' cm en een hoogte van ' + h + ' cm. Bereken de inhoud. ' + Rond(d), eenheid:'cm³', beeld:bl5, zelfBeeld:bl5, stappen:[
      St('r² = ' + r + ' ' + X + ' ' + r + ' =', String(r * r), r + ' keer zichzelf.', Fz([String(r * r)], F(String(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.'))),
      St('r² ' + X + ' h = ' + (r * r) + ' ' + X + ' ' + h + ' =', T(r * r * h), (r * r) + ' keer de hoogte ' + h + '.'),
      St('Inhoud = π ' + X + ' ' + T(r * r * h) + ' : 3 ≈ (' + rondTekst(d) + ')', af(V, d, 'cm³'), 'De kegel is een derde van de cilinder eromheen. Tik alles in één keer in: ' + T(V, { dec:3 }) + '…', Fz(af(V, d, 'cm³'), F(afT(PI * r * r * h, d), 'Dat is de cilinder eromheen. Deel nog door 3.')), { e:'cm³' }) ] };
  }

  /* ================= 7 bol ================= */
  function bol(R, soort){
    var r = R.heel(2, 12), metD = R.heel(0, 2) === 0, st = [];
    function fig(){ return bolFig(metD ? { d:'d = ' + (2 * r) + ' cm', aria:'bol met een diameter van ' + (2 * r) + ' cm' } : { r:'r = ' + r + ' cm', aria:'bol met een straal van ' + r + ' cm' }); }
    function gegeven(){ return 'Een bol heeft een ' + (metD ? 'diameter van ' + (2 * r) : 'straal van ' + r) + ' cm. '; }
    function straalStap(){ if (metD) st.push(St('De straal: r = ' + (2 * r) + ' : 2 =', metE(String(r), 'cm'), 'De straal is de helft van de diameter.', Fz(metE(String(r), 'cm'), F(String(4 * r), 'Delen door 2, niet keer 2.')), { e:'cm' })); }
    if (soort === 'ken'){
      if (R.heel(0, 2) === 0){ var naarD = !metD, bl = fig();
        return { vraag:naarD ? 'Diameter?' : 'Straal?', context:gegeven() + 'Hoe groot is de ' + (naarD ? 'diameter' : 'straal') + '?', eenheid:'cm', beeld:bl, zelfBeeld:bl, stappen:[
          kstap('Welke is langer: de straal of de diameter?', 'de diameter: twee keer de straal', ['de diameter: twee keer de straal', 'de straal: twee keer de diameter', 'ze zijn even lang'], 'De straal loopt van het middelpunt naar de buitenkant. De diameter loopt dwars door de bol heen, door het middelpunt, en is dus twee keer zo lang.'),
          naarD ? St('Diameter = 2 ' + X + ' ' + r + ' =', metE(String(2 * r), 'cm'), 'Twee keer de straal.', Fz(metE(String(2 * r), 'cm'), F(T(r / 2), 'Keer 2, niet gedeeld door 2.', String(r * r), 'Keer 2, niet in het kwadraat.')), { e:'cm' })
                : St('Straal = ' + (2 * r) + ' : 2 =', metE(String(r), 'cm'), 'De helft van de diameter.', Fz(metE(String(r), 'cm'), F(String(4 * r), 'Delen door 2, niet keer 2.')), { e:'cm' }) ] }; }
      var wat = R.kies(['platte vlakken', 'gebogen vlakken', 'ribben', 'hoekpunten']), n = wat === 'gebogen vlakken' ? 1 : 0;
      var hint = { 'platte vlakken':'Een bol is overal rond: hij kan nergens plat op tafel liggen.', 'gebogen vlakken':'De hele buitenkant is één gebogen vlak.', ribben:'Een ribbe is een rand waar twee vlakken samenkomen. Een bol heeft maar één vlak.', hoekpunten:'Een bol heeft geen ribben, dus ook geen punten waar ribben samenkomen.' }[wat];
      var fout = { 'platte vlakken':F('1', 'De buitenkant is gebogen, niet plat.'), 'gebogen vlakken':F('0', 'De buitenkant van de bol is een gebogen vlak.', '2', 'De buitenkant is één geheel, zonder rand ertussen.'), ribben:F('1', 'De gestippelde cirkel in de tekening is een hulplijn, geen ribbe.'), hoekpunten:F('1', 'Het middelpunt ligt binnen in de bol. Het is geen hoekpunt.') }[wat];
      var bl2 = fig();
      return { vraag:'Aantal ' + wat + '?', context:gegeven() + 'Hoeveel ' + wat + ' heeft de bol?', beeld:bl2, zelfBeeld:bl2, stappen:[
        kstap('Wat geldt voor elk punt op de buitenkant van een bol?', 'het ligt even ver van het middelpunt', ['het ligt even ver van het middelpunt', 'het ligt op een plat vlak', 'het ligt op een rechte ribbe'], 'Die afstand tot het middelpunt is de straal.'),
        tel('Hoeveel ' + wat + ' heeft een bol?', n, hint, fout) ] };
    }
    if (soort === 'opp'){ var O;
      do { r = R.heel(2, 12); O = 4 * PI * r * r; } while (grens(O, 1));
      var bl3 = fig(); straalStap();
      st.push(St('r² = ' + r + ' ' + X + ' ' + r + ' =', String(r * r), r + ' keer zichzelf.', Fz([String(r * r)], F(String(2 * r), 'Kwadraat is keer zichzelf, niet keer 2.'))));
      st.push(St('Oppervlakte = 4 ' + X + ' π ' + X + ' ' + (r * r) + ' ≈ (rond af op 1 decimaal)', af(O, 1, 'cm²'), 'Tik in: 4 ' + X + ' π ' + X + ' ' + (r * r) + ' = ' + T(O, { dec:3 }) + '…', Fz(af(O, 1, 'cm²'), F(afT(PI * r * r, 1), 'Dat is één cirkel. De bol is vier keer zo groot.', afT(16 * PI * r * r, 1), 'Je nam de diameter. Gebruik de straal.')), { e:'cm²' }));
      return { vraag:'Oppervlakte?', context:gegeven() + 'Bereken de oppervlakte. Rond af op 1 decimaal.', eenheid:'cm²', beeld:bl3, zelfBeeld:bl3, stappen:st };
    }
    var V, r3;
    do { r = R.heel(2, 9); r3 = r * r * r; V = 4 / 3 * PI * r3; } while (grens(V, 1));
    var bl4 = fig(); straalStap();
    st.push(St('r³ = ' + r + ' ' + X + ' ' + r + ' ' + X + ' ' + r + ' =', String(r3), 'Drie keer ' + r + ' met elkaar vermenigvuldigen.', Fz([String(r3)], F(String(3 * r), 'r³ is r keer r keer r, niet keer 3.', String(r * r), 'Nog een keer keer ' + r + '.'))));
    st.push(St('Inhoud = 4/3 ' + X + ' π ' + X + ' ' + r3 + ' ≈ (rond af op 1 decimaal)', af(V, 1, 'cm³'), 'Tik in: 4 : 3 ' + X + ' π ' + X + ' ' + r3 + ' = ' + T(V, { dec:3 }) + '…', Fz(af(V, 1, 'cm³'), F(afT(PI * r3, 1), 'Vergeet 4/3 niet: keer 4 en gedeeld door 3.', afT(4 * PI * r * r, 1), 'Dat is de oppervlakte. Voor de inhoud gebruik je r³.')), { e:'cm³' }));
    return { vraag:'Inhoud?', context:gegeven() + 'Bereken de inhoud. Rond af op 1 decimaal.', eenheid:'cm³', beeld:bl4, zelfBeeld:bl4, stappen:st };
  }

  /* ================= de groep ================= */
  function doel(id, naam, kort, uit, wanneer, maker){
    var beurt = beurten();
    return { id:'wob-m-fig-' + id, naam:naam, kort:kort, uit:uit, wanneer:wanneer, maak:function(R){ return maker(R, beurt()); } };
  }
  LEERROUTE.voeg('wiskunde', [{ groep:{ id:'wob-m-fig', niveau:'onderbouw', domein:'meetkunde', naam:'Ruimtefiguren een voor een',
      uit:'Elke ruimtefiguur apart: kubus, balk, prisma, cilinder, piramide, kegel en bol. Per figuur de kenmerken, de oppervlakte en de inhoud, met de formule en een uitgewerkt voorbeeld.' },
    doelen:[
      doel('kubus', 'De kubus: kenmerken, oppervlakte en inhoud', '6 vierkanten, 12 ribben, 8 hoekpunten. Oppervlakte = 6 × ribbe × ribbe, inhoud = ribbe × ribbe × ribbe',
        '<p>Een <b>kubus</b> heeft <b>6 vlakken</b>, <b>12 ribben</b> en <b>8 hoekpunten</b>. Alle vlakken zijn even grote vierkanten, dus alle ribben zijn even lang. Denk aan een dobbelsteen.</p>' +
        '<p><b>Oppervlakte = 6 ' + X + ' ribbe ' + X + ' ribbe</b>: zes keer hetzelfde vierkant. Een kubus met ribben van 4 cm: één vlak is 4 ' + X + ' 4 = 16 cm², alle vlakken samen 6 ' + X + ' 16 = <b>96 cm²</b>.</p>' +
        '<p><b>Inhoud = ribbe ' + X + ' ribbe ' + X + ' ribbe</b>: het grondvlak keer de hoogte. Dezelfde kubus: 4 ' + X + ' 4 ' + X + ' 4 = <b>64 cm³</b>.</p>' +
        '<p>Let op de eenheid: een oppervlakte is in cm², een inhoud in cm³.</p>',
        'je alles van een kubus wilt weten: wat je kunt tellen, de oppervlakte en de inhoud.', kubus),
      doel('balk', 'De balk: kenmerken, oppervlakte en inhoud', '6 rechthoeken in drie paren, 12 ribben, 8 hoekpunten. Oppervlakte = de drie paren samen, inhoud = lengte × breedte × hoogte',
        '<p>Een <b>balk</b> heeft <b>6 vlakken</b>, <b>12 ribben</b> en <b>8 hoekpunten</b>, net als een kubus. De vlakken zijn rechthoeken. Ze vormen <b>drie paren</b>: onder en boven, voor en achter, links en rechts. Van elke maat zijn er vier ribben.</p>' +
        '<p><b>Oppervlakte = 2 ' + X + ' l ' + X + ' b + 2 ' + X + ' l ' + X + ' h + 2 ' + X + ' b ' + X + ' h</b>. Een balk van 6 bij 4 bij 3 cm: 2 ' + X + ' 24 + 2 ' + X + ' 18 + 2 ' + X + ' 12 = 48 + 36 + 24 = <b>108 cm²</b>.</p>' +
        '<p><b>Inhoud = lengte ' + X + ' breedte ' + X + ' hoogte</b>. Dezelfde balk: het grondvlak is 6 ' + X + ' 4 = 24 cm², de inhoud 24 ' + X + ' 3 = <b>72 cm³</b>.</p>',
        'je alles van een balk wilt weten, zoals bij een doos, een kast of een aquarium.', balk),
      doel('prisma', 'Het prisma: kenmerken, oppervlakte en inhoud', 'Een driezijdig prisma heeft 5 vlakken, 9 ribben en 6 hoekpunten. Oppervlakte = 2 driehoeken + 3 rechthoeken, inhoud = grondvlak × lengte',
        '<p>Een <b>prisma</b> heeft een grondvlak en een bovenvlak die precies gelijk zijn, met rechthoeken ertussen. Ligt het prisma op zijn kant, dan zijn dat de voorkant en de achterkant. Is het grondvlak een driehoek, dan heeft het prisma <b>5 vlakken</b> (2 driehoeken en 3 rechthoeken), <b>9 ribben</b> en <b>6 hoekpunten</b>.</p>' +
        '<p><b>Oppervlakte = 2 ' + X + ' grondvlak + omtrek van het grondvlak ' + X + ' lengte</b>. Een prisma van 10 cm lang met een rechthoekige driehoek van 3, 4 en 5 cm: de twee driehoeken zijn 2 ' + X + ' (3 ' + X + ' 4 : 2) = 12 cm², de drie rechthoeken (3 + 4 + 5) ' + X + ' 10 = 120 cm². Samen <b>132 cm²</b>.</p>' +
        '<p><b>Inhoud = grondvlak ' + X + ' lengte</b>. Hetzelfde prisma: het grondvlak is 3 ' + X + ' 4 : 2 = 6 cm², de inhoud 6 ' + X + ' 10 = <b>60 cm³</b>.</p>',
        'een ruimtefiguur voor en achter dezelfde driehoek heeft, zoals een tent, een dak of een wig.', prisma),
      doel('cilinder', 'De cilinder: kenmerken, oppervlakte en inhoud', '2 cirkels en een gebogen mantel, geen hoekpunten. Oppervlakte = 2 × π × r² + π × d × h, inhoud = π × r² × h',
        '<p>Een <b>cilinder</b> heeft <b>2 platte vlakken</b>: twee even grote cirkels. Daartussen zit <b>1 gebogen vlak</b>, de <b>mantel</b>. Er zijn twee ronde randen, maar geen rechte ribben en geen hoekpunten. Rol je de mantel uit, dan krijg je een rechthoek die zo breed is als de omtrek van de cirkel.</p>' +
        '<p><b>Oppervlakte = 2 ' + X + ' π ' + X + ' r² + π ' + X + ' d ' + X + ' h</b>: de twee cirkels plus de mantel. Een cilinder met r = 3 cm en h = 10 cm: 2 ' + X + ' π ' + X + ' 9 ≈ 56,5 cm² en π ' + X + ' 6 ' + X + ' 10 ≈ 188,5 cm². Samen ≈ <b>245,0 cm²</b>.</p>' +
        '<p><b>Inhoud = π ' + X + ' r² ' + X + ' h</b>: het grondvlak keer de hoogte. Dezelfde cilinder: π ' + X + ' 9 ' + X + ' 10 ≈ <b>282,7 cm³</b>.</p>' +
        '<p>Je hebt steeds de <b>straal</b> nodig. Is de diameter gegeven, deel die dan eerst door 2.</p>',
        'je alles van een cilinder wilt weten, zoals bij een blik, een buis of een ronde ton.', cilinder),
      doel('piramide', 'De piramide: kenmerken, oppervlakte en inhoud', 'Een vierkant grondvlak en 4 driehoeken: 5 vlakken, 8 ribben, 5 hoekpunten. Oppervlakte = grondvlak + 4 driehoeken, inhoud = grondvlak × hoogte : 3',
        '<p>Een <b>piramide</b> loopt vanaf het grondvlak naar één punt, de <b>top</b>. Met een vierkant grondvlak heeft hij <b>5 vlakken</b> (1 vierkant en 4 driehoeken), <b>8 ribben</b> en <b>5 hoekpunten</b>: vier van het grondvlak, en de top.</p>' +
        '<p>Een piramide heeft twee soorten hoogte. De <b>hoogte</b> loopt van de top recht naar beneden, naar het midden van het grondvlak. De <b>schuine hoogte</b> loopt van de top over een zijvlak naar het midden van een zijde van het grondvlak.</p>' +
        '<p><b>Oppervlakte = grondvlak + 4 ' + X + ' driehoek</b>, en één driehoek is zijde ' + X + ' schuine hoogte : 2. Een grondvlak van 10 bij 10 cm en een schuine hoogte van 13 cm: 10 ' + X + ' 10 = 100 cm², één driehoek 10 ' + X + ' 13 : 2 = 65 cm², vier driehoeken 260 cm². Samen <b>360 cm²</b>.</p>' +
        '<p><b>Inhoud = grondvlak ' + X + ' hoogte : 3</b>: een derde van de balk eromheen. Dezelfde piramide is 12 cm hoog: 100 ' + X + ' 12 = 1200, en 1200 : 3 = <b>400 cm³</b>.</p>',
        'een ruimtefiguur vanaf een vierkant spits toeloopt naar een punt, zoals een piramide of een torendak.', piramide),
      doel('kegel', 'De kegel: kenmerken, oppervlakte en inhoud', 'Een cirkel, een gebogen mantel en een top. Oppervlakte = π × r² + π × r × s, inhoud = π × r² × h : 3',
        '<p>Een <b>kegel</b> heeft <b>1 plat vlak</b>, het grondvlak: een cirkel. Daarop staat <b>1 gebogen vlak</b>, de <b>mantel</b>, die naar de <b>top</b> loopt. Er is één ronde rand en er zijn geen rechte ribben.</p>' +
        '<p>Ook een kegel heeft twee soorten hoogte. De <b>hoogte h</b> loopt van de top recht naar beneden, naar het middelpunt. De <b>schuine hoogte s</b> loopt van de top langs de mantel naar de rand.</p>' +
        '<p><b>Oppervlakte = π ' + X + ' r² + π ' + X + ' r ' + X + ' s</b>: het grondvlak plus de mantel. Een kegel met r = 3 cm en s = 5 cm: π ' + X + ' 9 ≈ 28,3 cm² en π ' + X + ' 3 ' + X + ' 5 ≈ 47,1 cm². Samen ≈ <b>75,4 cm²</b>.</p>' +
        '<p><b>Inhoud = π ' + X + ' r² ' + X + ' h : 3</b>: een derde van de cilinder eromheen. Dezelfde kegel is 4 cm hoog: π ' + X + ' 9 ' + X + ' 4 : 3 ≈ <b>37,7 cm³</b>.</p>',
        'een ruimtefiguur vanaf een cirkel spits toeloopt naar een punt, zoals een ijshoorntje, een puntzak of een feestmuts.', kegel),
      doel('bol', 'De bol: kenmerken, oppervlakte en inhoud', 'Eén gebogen vlak, geen ribben en geen hoekpunten. Oppervlakte = 4 × π × r², inhoud = 4/3 × π × r³',
        '<p>Een <b>bol</b> is overal rond. Hij heeft <b>1 gebogen vlak</b> en <b>geen</b> platte vlakken, ribben of hoekpunten. Elk punt op de buitenkant ligt even ver van het middelpunt: die afstand is de <b>straal r</b>. De <b>diameter</b> loopt dwars door het middelpunt en is twee keer de straal.</p>' +
        '<p><b>Oppervlakte = 4 ' + X + ' π ' + X + ' r²</b>: precies vier keer de cirkel door het midden. Een bol met r = 5 cm: 4 ' + X + ' π ' + X + ' 25 ≈ <b>314,2 cm²</b>.</p>' +
        '<p><b>Inhoud = 4/3 ' + X + ' π ' + X + ' r³</b>. Daarbij is r³ = r ' + X + ' r ' + X + ' r. Dezelfde bol: r³ = 125. Tik in: 4 : 3 ' + X + ' π ' + X + ' 125 ≈ <b>523,6 cm³</b>.</p>' +
        '<p>Je hebt steeds de <b>straal</b> nodig. Is de diameter gegeven, deel die dan eerst door 2.</p>',
        'iets de vorm van een bal heeft, zoals een voetbal, een knikker of een kerstbal.', bol)
    ] }]);
})();
