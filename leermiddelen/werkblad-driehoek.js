/* Een werkblad om de oppervlakte van driehoeken te oefenen, met bij elke
   opgave de driehoek getekend.

   De docent kiest de soorten driehoeken (rechthoekig, scherp, stomp), wat er
   bij de driehoek staat en een paar extra's:
     maten      de basis en de hoogte staan erbij
     afleiders  alle zijden staan erbij: zoek zelf welke maten je nodig hebt
     meten      er staat niets bij: de driehoek is op ware grootte, meet zelf
                met je geodriehoek (op havo en vwo teken je ook zelf de hoogte)
   Daarbij kan de rechthoek eromheen als hulp, kunnen driehoeken op hun kant of
   op hun kop liggen, en kan de opgave omgekeerd: de oppervlakte is gegeven,
   zoek de hoogte of de basis. Het niveau bepaalt de getallen: van hele getallen
   tot kommagetallen en millimeters. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function r(lo, hi){ return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function kies(l){ return l[Math.floor(Math.random() * l.length)]; }
  /* een getal met een komma, zonder staartje van de computer */
  function T(x){ return String(Math.round(x * 1000) / 1000).replace('.', ','); }

  /* vaste kleuren: het papier is altijd wit, ook als de site in donker staat */
  var INK = '#14224C', VLAK = '#83A5F2', HOOG = '#C4452A', HULP = '#8a93ad', ZACHT = '#4a5270';

  var SOORTEN = [
    { id:'recht', naam:'Rechthoekige driehoeken' },
    { id:'scherp', naam:'Scherphoekige driehoeken (de top boven de basis)' },
    { id:'stomp', naam:'Stomphoekige driehoeken (de hoogte valt erbuiten)' }
  ];
  var BIJ = [
    { id:'maten', naam:'De basis en de hoogte staan erbij' },
    { id:'afleid', naam:'Alle zijden staan erbij: zoek zelf de basis en de hoogte' },
    { id:'meten', naam:'Niets erbij: op ware grootte, zelf meten met de geodriehoek' }
  ];

  /* ---------- de maten van een driehoek ----------
     A = (0, 0) en B = (b, 0) zijn de basis, de top C = (p, h). p ligt bij een
     rechthoekige driehoek op 0 of b, bij een scherpe ertussen en bij een stompe
     erbuiten. */
  function topPlek(soort, b, stap){
    function rond(x){ return Math.round(x / stap) * stap; }
    if (soort === 'recht') return Math.random() < 0.5 ? 0 : b;
    if (soort === 'scherp'){ var p; do { p = rond(b * (0.2 + Math.random() * 0.6)); } while (p <= 0 || p >= b); return p; }
    var over = Math.max(stap, rond(b * (0.2 + Math.random() * 0.4)));
    return Math.random() < 0.5 ? -over : b + over;
  }
  /* basis en hoogte bij het niveau (1 tot 4); de oppervlakte heeft hooguit twee decimalen, of 0,25 bij een halve maat */
  function maten(rang){
    var m;
    do { m = maten0(rang); } while (m.b / m.h > 2.6 || m.b / m.h < 0.55);
    return m;
  }
  function maten0(rang){
    var b, h, e;
    if (rang <= 1){ e = 'cm'; do { b = r(2, 12); h = r(2, 10); } while ((b * h) % 2); }
    else if (rang === 2){ e = kies(['cm', 'cm', 'm']); do { b = r(3, 20); h = r(2, 15); } while ((b * h) % 2 || b === h); }
    else if (rang === 3){
      e = kies(['cm', 'm', 'mm']);
      if (e === 'mm'){ b = 5 * r(4, 24); h = 5 * r(3, 18); }
      else { b = r(3, 18); h = r(2, 14); if (Math.random() < 0.6){ if (Math.random() < 0.5) b += 0.5; else h += 0.5; } }
    } else {
      e = kies(['cm', 'm']);
      /* een decimaal per maat, en de oppervlakte op hooguit twee decimalen */
      do { b = r(30, 160) / 10; h = r(20, 120) / 10; if (Math.random() < 0.4) b = Math.round(b); } while ((Math.round(b * 10) * Math.round(h * 10)) % 2);
    }
    return { b:b, h:h, e:e };
  }
  /* op ware grootte: hele (en op havo en vwo halve) centimeters, zodat het te meten is */
  function metenMaten(rang, soort, draai){
    var stap = rang >= 3 ? 0.5 : 1, b, h, p, breed;
    do {
      b = r(4, draai % 180 ? 8 : 11) + (stap < 1 && Math.random() < 0.5 ? 0.5 : 0);
      h = r(3, draai % 180 ? 9 : 7) + (stap < 1 && b % 1 === 0 && Math.random() < 0.5 ? 0.5 : 0);
      p = topPlek(soort, b, stap);
      breed = Math.max(b, p) - Math.min(0, p);
    } while (breed > (draai % 180 ? 9 : 13) || breed / h > 3 || b / h < 0.55);
    return { b:b, h:h, e:'cm', p:p };
  }

  /* ---------- de tekening ---------- */
  function draaiPunt(q, hoek){
    if (hoek === 90) return [-q[1], q[0]];
    if (hoek === 180) return [-q[0], -q[1]];
    if (hoek === 270) return [q[1], -q[0]];
    return [q[0], q[1]];
  }
  function eenheid(v){ var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function f1(x){ return (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, ''); }

  /* d: { b, h, p, e, soort, draai }, o: { ware (op ware grootte), labels: { basis, hoogte, zijden }, hulp, hoogteLijn } */
  function tekening(d, o){
    var ware = !!o.ware;
    /* schaal: op ware grootte zijn de eenheden van de tekening millimeters */
    var breedte = Math.max(d.b, d.p) - Math.min(0, d.p);
    var s = ware ? 10 : Math.min(210 / breedte, 130 / d.h, 210 / d.h);
    var fs = ware ? 3.6 : 12.5, k = ware ? 2.6 : 8, lw = ware ? 0.45 : 1.8;
    var L = { A:[0, 0], B:[d.b, 0], C:[d.p, d.h], H:[d.p, 0] };
    /* naar het scherm: schalen, draaien, en y naar beneden */
    var P = {};
    Object.keys(L).forEach(function(n){ var q = draaiPunt([L[n][0] * s, L[n][1] * s], d.draai || 0); P[n] = [q[0], -q[1]]; });
    var M = [(P.A[0] + P.B[0] + P.C[0]) / 3, (P.A[1] + P.B[1] + P.C[1]) / 3];
    function plus(a, v, m){ return [a[0] + v[0] * m, a[1] + v[1] * m]; }
    function midden(a, b){ return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    function loodrecht(a, b, weg){ var u = eenheid([b[0] - a[0], b[1] - a[1]]), n = [-u[1], u[0]], m = midden(a, b); return (n[0] * (weg[0] - m[0]) + n[1] * (weg[1] - m[1])) > 0 ? [-n[0], -n[1]] : n; }
    var vormen = '', teksten = [], punten = [P.A, P.B, P.C, P.H];
    function lijn(a, b, kleur, dik, streep){ return '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + kleur + '" stroke-width="' + dik + '"' + (streep ? ' stroke-dasharray="' + streep + '"' : '') + ' stroke-linecap="round"/>'; }
    function label(plek, richting, tekst, kleur, vet){
      var x = plek[0] + richting[0] * fs * 0.55, y = plek[1] + richting[1] * fs * 0.55;
      var anker = richting[0] > 0.35 ? 'start' : richting[0] < -0.35 ? 'end' : 'middle';
      y += richting[1] > 0.35 ? fs * 0.85 : richting[1] < -0.35 ? -fs * 0.15 : fs * 0.36;
      teksten.push({ x:x, y:y, anker:anker, tekst:tekst, kleur:kleur, vet:vet, breed:tekst.length * fs * (vet ? 0.64 : 0.6), richting:richting });
    }
    /* de rechthoek eromheen als hulp: bij een stompe driehoek past die niet */
    if (o.hulp && d.soort !== 'stomp'){
      var R = [[0, 0], [d.b, 0], [d.b, d.h], [0, d.h]].map(function(q){ var t = draaiPunt([q[0] * s, q[1] * s], d.draai || 0); return [t[0], -t[1]]; });
      vormen += '<polygon points="' + R.map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' ') + '" fill="none" stroke="' + HULP + '" stroke-width="' + lw * 0.8 + '" stroke-dasharray="' + (ware ? '1.6 1.4' : '5 4') + '"/>';
    }
    vormen += '<polygon points="' + [P.A, P.B, P.C].map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' ') + '" fill="' + VLAK + '" fill-opacity=".28" stroke="' + INK + '" stroke-width="' + lw + '" stroke-linejoin="round"/>';
    /* de hoogte: een stippellijn van de top naar de basis, bij een stompe driehoek met de basis verlengd */
    var recht = d.soort === 'recht';
    if (o.hoogteLijn){
      if (d.soort === 'stomp'){ var eind = d.p < 0 ? P.A : P.B; vormen += lijn(eind, P.H, INK, lw * 0.7, ware ? '0.8 1.4' : '2 4'); }
      if (!recht) vormen += lijn(P.C, P.H, HOOG, lw, ware ? '2 1.4' : '6 4');
      /* het hoekje van 90 graden bij het voetpunt */
      var naarBasis = d.soort === 'stomp' ? (d.p < 0 ? P.A : P.B) : (Math.abs(d.p) < 1e-9 ? P.B : Math.abs(d.p - d.b) < 1e-9 ? P.A : (d.p > d.b / 2 ? P.A : P.B));
      var u = eenheid([naarBasis[0] - P.H[0], naarBasis[1] - P.H[1]]), v = eenheid([P.C[0] - P.H[0], P.C[1] - P.H[1]]);
      var h1 = plus(P.H, u, k), h2 = plus(h1, v, k), h3 = plus(P.H, v, k);
      vormen += '<polyline points="' + [h1, h2, h3].map(function(q){ return f1(q[0]) + ',' + f1(q[1]); }).join(' ') + '" fill="none" stroke="' + (recht ? INK : HOOG) + '" stroke-width="' + lw * 0.75 + '"/>';
    }
    var lb = o.labels || {};
    if (lb.basis) label(midden(P.A, P.B), loodrecht(P.A, P.B, P.C), lb.basis, INK, true);
    if (lb.hoogte){
      var richt;
      if (recht || d.soort === 'stomp') richt = loodrecht(P.C, P.H, M);
      else { var naar = d.p > d.b / 2 ? P.A : P.B, uu = eenheid([naar[0] - P.H[0], naar[1] - P.H[1]]); richt = uu; }
      label(midden(P.C, P.H), richt, lb.hoogte, recht ? INK : HOOG, true);
    }
    (lb.zijden || []).forEach(function(z){
      var a = P[z.van], b = P[z.naar];
      label(midden(a, b), loodrecht(a, b, M), z.tekst, ZACHT, false);
    });
    /* een zijde die over een andere tekst valt, schuift naar buiten tot hij vrij is */
    function vak(t){ var b = t.breed * 1.15, l = t.anker === 'start' ? t.x : t.anker === 'end' ? t.x - b : t.x - b / 2; return [l - fs * 0.2, t.y - fs * 1.05, l + b + fs * 0.2, t.y + fs * 0.35]; }
    function raakt(a, b){ var p = vak(a), q = vak(b); return p[0] < q[2] && q[0] < p[2] && p[1] < q[3] && q[1] < p[3]; }
    teksten.forEach(function(t, i){
      if (t.vet) return;
      for (var stap = 0; stap < 14 && teksten.slice(0, i).some(function(u){ return raakt(t, u); }); stap++){ t.x += t.richting[0] * fs * 0.5; t.y += t.richting[1] * fs * 0.5; }
    });
    /* de maat van de tekening: alle punten en teksten erin, met wat ruimte */
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    function neem(x, y){ x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    punten.forEach(function(q){ neem(q[0], q[1]); });
    teksten.forEach(function(t){
      var l = t.anker === 'start' ? t.x : t.anker === 'end' ? t.x - t.breed : t.x - t.breed / 2;
      neem(l, t.y - fs); neem(l + t.breed, t.y + fs * 0.3);
    });
    var rand = ware ? 3 : 8;
    x0 -= rand; y0 -= rand; x1 += rand; y1 += rand;
    var w = x1 - x0, hh = y1 - y0;
    var tekst = teksten.map(function(t){
      return '<text x="' + f1(t.x) + '" y="' + f1(t.y) + '" text-anchor="' + t.anker + '" font-size="' + fs + '" fill="' + t.kleur + '" stroke="#fff" stroke-width="' + f1(fs * 0.3) + '" stroke-linejoin="round" paint-order="stroke"' + (t.vet ? ' font-weight="600"' : '') + '>' + schoon(t.tekst) + '</text>';
    }).join('');
    var maat = ware ? ' width="' + f1(w) + 'mm" height="' + f1(hh) + 'mm"' : ' width="' + Math.round(w) + '" height="' + Math.round(hh) + '"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + f1(x0) + ' ' + f1(y0) + ' ' + f1(w) + ' ' + f1(hh) + '"' + maat + ' role="img" aria-label="' + schoon(o.alt || 'driehoek') + '" font-family="Poppins, Arial, sans-serif">' + vormen + tekst + '</svg>';
  }

  /* de schuine zijden, voor de afleiders: echte lengtes, op een decimaal */
  function zijden(d){
    var ac = Math.hypot(d.p, d.h), bc = Math.hypot(d.b - d.p, d.h), uit = [];
    if (Math.abs(d.p) > 1e-9) uit.push({ van:'A', naar:'C', tekst:T(Math.round(ac * 10) / 10) + ' ' + d.e });
    if (Math.abs(d.p - d.b) > 1e-9) uit.push({ van:'B', naar:'C', tekst:T(Math.round(bc * 10) / 10) + ' ' + d.e });
    return uit;
  }

  /* ---------- een opgave ---------- */
  function opgave(o){
    var soort = kies(o.soorten), draai = o.draai && Math.random() < 0.5 ? kies([90, 180, 270]) : 0, d;
    if (o.bij === 'meten'){ d = metenMaten(o.rang, soort, draai); }
    else {
      d = maten(o.rang);
      var stap = d.e === 'mm' ? 5 : d.b % 1 || d.h % 1 ? 0.5 : 1;
      d.p = topPlek(soort, d.b, stap);
    }
    d.soort = soort; d.draai = draai;
    d.opp = d.b * d.h / 2;
    var om = o.om && o.bij !== 'meten' && Math.random() < 0.4 ? kies(['hoogte', 'basis']) : '';
    /* omgekeerd: de oppervlakte is een mooi getal, en het gezochte ook */
    if (om && (d.b % 1 || d.h % 1)){ d.b = Math.round(d.b); d.h = Math.round(d.h); if ((d.b * d.h) % 2) d.b++; if (d.b / d.h > 2.6) d.h = Math.ceil(d.b / 2.6); if (d.b / d.h < 0.55) d.b = Math.ceil(d.h * 0.55); if ((d.b * d.h) % 2) d.b++; d.p = topPlek(soort, d.b, 1); d.opp = d.b * d.h / 2; }
    return { d:d, om:om };
  }
  function figuur(x, o, voorbeeld){
    var d = x.d, e = d.e, lb = {}, ware = o.bij === 'meten' && !voorbeeld;
    if (o.bij === 'maten' || voorbeeld){ lb.basis = 'basis ' + T(d.b) + ' ' + e; lb.hoogte = 'hoogte ' + T(d.h) + ' ' + e; }
    else if (o.bij === 'afleid'){ lb.basis = T(d.b) + ' ' + e; lb.hoogte = T(d.h) + ' ' + e; lb.zijden = zijden(d); }
    if (x.om === 'hoogte') lb.hoogte = 'hoogte ?';
    if (x.om === 'basis') lb.basis = 'basis ?';
    /* zelf de hoogte tekenen: bij meten op havo en vwo */
    var hoogteLijn = !(ware && o.rang >= 3);
    return tekening(d, { ware:ware, labels:lb, hulp:o.hulp || voorbeeld, hoogteLijn:hoogteLijn,
      alt:(d.soort === 'recht' ? 'rechthoekige' : d.soort === 'scherp' ? 'scherphoekige' : 'stomphoekige') + ' driehoek' + (lb.basis ? ', ' + lb.basis + ', ' + lb.hoogte : ', meet zelf') });
  }
  function opdracht(x, o){
    var e = x.d.e;
    if (x.om) return 'De oppervlakte is ' + T(x.d.opp) + ' ' + e + '². Bereken de ' + x.om + '.';
    if (o.bij === 'meten') return o.rang >= 3 && x.d.soort !== 'recht' ? 'Teken de hoogte, meet de basis en de hoogte, en bereken de oppervlakte.' : 'Meet de basis en de hoogte, en bereken de oppervlakte.';
    if (o.bij === 'afleid') return 'Zoek de basis en de hoogte, en bereken de oppervlakte.';
    return 'Bereken de oppervlakte.';
  }
  function invul(x, o){
    var e = x.d.e, l = '<i class="dh-l" aria-hidden="true"></i>';
    function g(t){ return '<span class="dh-g">' + t + '</span>'; }
    if (x.om) return '<p class="dh-reken">' + g((x.om === 'hoogte' ? 'hoogte' : 'basis') + ' = 2 × ' + l + ' : ' + l) + ' ' + g('= ' + l + ' ' + e) + '</p>';
    var meet = o.bij !== 'maten' ? '<p class="dh-reken">' + g('basis = ' + l + ' ' + e) + ' ' + g('hoogte = ' + l + ' ' + e) + '</p>' : '';
    return meet + '<p class="dh-reken">' + g('oppervlakte = ' + l + ' × ' + l + ' : 2') + ' ' + g('= ' + l + ' ' + e + '²') + '</p>';
  }
  function berekening(x){
    var d = x.d, e = d.e;
    if (x.om === 'hoogte') return 'hoogte = 2 × ' + T(d.opp) + ' : ' + T(d.b) + ' = ' + T(d.h) + ' ' + e;
    if (x.om === 'basis') return 'basis = 2 × ' + T(d.opp) + ' : ' + T(d.h) + ' = ' + T(d.b) + ' ' + e;
    return 'basis ' + T(d.b) + ' ' + e + ', hoogte ' + T(d.h) + ' ' + e + ': ' + T(d.b) + ' × ' + T(d.h) + ' = ' + T(d.b * d.h) + ', en : 2 = ' + T(d.opp) + ' ' + e + '²';
  }
  function antwoord(x){ return x.om === 'hoogte' ? T(x.d.h) + ' ' + x.d.e : x.om === 'basis' ? T(x.d.b) + ' ' + x.d.e : T(x.d.opp) + ' ' + x.d.e + '²'; }

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad ol.driehoeken:not(.antw){display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));column-gap:28px}' +
      '.blad ol.driehoeken.dhmeten:not(.antw){grid-template-columns:minmax(0,1fr)}' +
      '.blad ol.driehoeken .dh{margin:8px 0 4px}' +
      '.blad ol.driehoeken .dh svg{display:block;max-width:100%;height:auto}' +
      '.blad ol.driehoeken.dhmeten .dh svg{max-width:none}' +
      '.blad .dh-reken{margin:6px 0 0;font-size:.95rem;line-height:2;display:flex;flex-wrap:wrap;column-gap:14px}.blad .dh-g{white-space:nowrap}' +
      '.blad .dh-l{display:inline-block;width:46px;border-bottom:1px solid #14224C;height:1.1em;vertical-align:baseline}' +
      '.blad ol.antw.driehoeken small{display:block;color:#4a5270}' +
      '.blad .dh-voorbeeld{border:1.5px solid #c9d2e6;border-radius:10px;padding:12px 14px;margin:6px 0 14px;break-inside:avoid;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start}' +
      '.blad .dh-voorbeeld h3{font-size:1rem;margin:0 0 6px}.blad .dh-voorbeeld p{margin:0 0 6px;font-size:.9rem}' +
      '.blad .dh-voorbeeld ol{margin:6px 0 0;padding-left:20px;font-size:.9rem;line-height:1.5}.blad .dh-voorbeeld ol b{color:#204ECF}' +
      '.blad .dh-voorbeeld svg{display:block;max-width:260px;height:auto}' +
      '@media(max-width:560px){.blad .dh-voorbeeld{grid-template-columns:minmax(0,1fr)}.blad ol.driehoeken.dhmeten .dh{overflow-x:auto}}';
    document.head.appendChild(st);
  } catch (e){}

  function maakBlad(vak){
    return {
      naam:'Oppervlakte van driehoeken (met de driehoeken erbij)', vak:vak,
      aantallen:[4, 6, 8, 10, 12], standaard:8, aantalNaam:'Aantal driehoeken',
      delenKop:'Welke driehoeken',
      delenTip:'Bij elke opgave staat de driehoek getekend. Het niveau bepaalt de getallen: hele getallen, kommagetallen of millimeters. Kies je zelf meten, print dan op ware grootte (schaal 100%).',
      delen:function(aan){
        function aanv(id, std){ return aan.length ? aan.indexOf(id) >= 0 : std; }
        var bij = BIJ.filter(function(b){ return aan.indexOf(b.id) >= 0; })[0];
        var bijId = bij ? bij.id : 'maten';
        return '<p class="kop">Soorten driehoeken</p>' +
          SOORTEN.map(function(s){ return '<label><input type="checkbox" name="dhs" value="' + s.id + '"' + (aanv(s.id, true) ? ' checked' : '') + '> ' + schoon(s.naam) + '</label>'; }).join('') +
          '<p class="kop">Wat staat er bij de driehoek</p>' +
          BIJ.map(function(b){ return '<label><input type="radio" name="dhb" value="' + b.id + '"' + (b.id === bijId ? ' checked' : '') + '> ' + schoon(b.naam) + '</label>'; }).join('') +
          '<p class="kop">Extra</p>' +
          '<label><input type="checkbox" name="dhx" value="hulp"' + (aanv('hulp', false) ? ' checked' : '') + '> De rechthoek eromheen als hulp</label>' +
          '<label><input type="checkbox" name="dhx" value="draai"' + (aanv('draai', false) ? ' checked' : '') + '> Ook driehoeken op hun kant of op hun kop</label>' +
          '<label><input type="checkbox" name="dhx" value="om"' + (aanv('om', false) ? ' checked' : '') + '> Ook omgekeerd: de oppervlakte is gegeven, zoek de hoogte of de basis</label>' +
          '<label><input type="checkbox" name="dhx" value="vb"' + (aanv('vb', true) ? ' checked' : '') + '> Uitleg en een voorgedaan voorbeeld bovenaan</label>';
      },
      lees:function(el, rang){
        var soorten = [].map.call(el.querySelectorAll('input[name="dhs"]:checked'), function(x){ return x.value; });
        var x = [].map.call(el.querySelectorAll('input[name="dhx"]:checked'), function(i){ return i.value; });
        return { soorten:soorten.length ? soorten : ['recht', 'scherp', 'stomp'], bij:(el.querySelector('input[name="dhb"]:checked') || {}).value || 'maten',
          hulp:x.indexOf('hulp') >= 0, draai:x.indexOf('draai') >= 0, om:x.indexOf('om') >= 0, voorbeeld:x.indexOf('vb') >= 0, rang:Math.max(1, Math.min(4, rang || 2)) };
      },
      maak:function(o, n){
        var uit = [], gezien = {};
        /* elke soort komt aan de beurt, daarna door elkaar */
        for (var p = 0; uit.length < n + 1 && p < (n + 1) * 40; p++){
          var oo = Object.assign({}, o, { soorten:[o.soorten[uit.length % o.soorten.length]] });
          var x = opgave(oo), sl = [x.d.soort, x.d.b, x.d.h, x.d.p, x.d.e, x.om].join('|');
          if (gezien[sl]) continue;
          gezien[sl] = true; x.keuze = o; uit.push(x);
        }
        if (uit.length < 2) return { fout:'Het lukte niet om genoeg driehoeken te maken.' };
        uit.shift();
        /* het voorbeeld: een rechtopstaande scherpe driehoek, de maten erbij */
        var vb = opgave(Object.assign({}, o, { soorten:['scherp'], draai:false, om:false, bij:o.bij === 'meten' ? 'maten' : o.bij }));
        vb.d.p = topPlek('scherp', vb.d.b, vb.d.b % 1 ? 0.5 : 1);
        /* de volgorde door elkaar, zodat dezelfde soort niet steeds op dezelfde plek staat */
        for (var i = uit.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = uit[i]; uit[i] = uit[j]; uit[j] = t; }
        uit.forEach(function(x){ x.vb = vb; });
        return uit;
      },
      teken:function(w){
        var o = w.items[0].keuze, vb = w.items[0].vb, e = vb.d.e;
        var boven = !o.voorbeeld ? '' : '<div class="dh-voorbeeld"><div><h3>Zo bereken je de oppervlakte van een driehoek</h3>' +
          '<p>Teken een <b>rechthoek</b> om de driehoek heen. De driehoek is precies de <b>helft</b> van die rechthoek.</p>' +
          '<p>Dus: oppervlakte = <b>basis × hoogte : 2</b>. De <b>hoogte</b> is de rechte afstand van de top naar de basis: hij staat loodrecht op de basis. Bij een stompe driehoek valt hij buiten de driehoek.</p>' +
          (o.bij === 'meten' ? '<p>Meet met je geodriehoek, in hele of halve centimeters.</p>' : '') +
          '<ol><li>De basis is <b>' + T(vb.d.b) + ' ' + e + '</b>, de hoogte <b>' + T(vb.d.h) + ' ' + e + '</b>.</li>' +
          '<li>De rechthoek: ' + T(vb.d.b) + ' × ' + T(vb.d.h) + ' = <b>' + T(vb.d.b * vb.d.h) + ' ' + e + '²</b>.</li>' +
          '<li>De driehoek is de helft: ' + T(vb.d.b * vb.d.h) + ' : 2 = <b>' + T(vb.d.opp) + ' ' + e + '²</b>.</li></ol></div>' +
          '<div>' + figuur(vb, o, true) + '</div></div>';
        var vragen = w.items.map(function(x){
          return '<li><span class="vr">' + schoon(opdracht(x, o)) + '</span><div class="dh">' + figuur(x, o, false) + '</div>' + invul(x, o) + '</li>';
        }).join('');
        var antwoorden = w.items.map(function(x){
          return '<li><span class="goed">' + schoon(antwoord(x)) + '</span>' + (w.uitleg || o.bij !== 'maten' ? '<small>' + schoon(berekening(x)) + '</small>' : '') + '</li>';
        }).join('');
        var bijNaam = { maten:'basis en hoogte gegeven', afleid:'zoek zelf de basis en de hoogte', meten:'zelf meten op ware grootte' }[o.bij];
        return { titel:'Werkblad: oppervlakte van driehoeken', sub:w.niveauNaam + ' · ' + bijNaam + ' · ' + w.items.length + ' driehoeken', klasse:'driehoeken' + (o.bij === 'meten' ? ' dhmeten' : ''),
          intro:o.bij === 'meten' ? 'De driehoeken staan op ware grootte. Meet met je geodriehoek en reken de oppervlakte uit: basis × hoogte : 2.' : 'Reken bij elke driehoek de oppervlakte uit: basis × hoogte : 2. Vergeet de eenheid niet.',
          antwoordIntro:o.bij === 'meten' ? 'Bij elke driehoek staat de basis die wij kozen. Een andere zijde als basis kan ook, met de hoogte die daarbij hoort; door het meten scheelt de uitkomst dan een beetje.' : '',
          boven:boven, vragen:vragen, antwoorden:antwoorden };
      }
    };
  }
  window.SPELBLAD.driehoek = maakBlad('reken');
  window.SPELBLAD['driehoek-wis'] = maakBlad('wis');
})();
