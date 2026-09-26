/* De opgaven van de vakspellen als vragen voor Torenverdediging, Zwaardvechter,
   de Vragenrace en de Klasquiz. bank.js laadt dit bestand zodra een vak wordt
   opgehaald, en BANK_SPELLEN.laad(vak) haalt dan de opgavenbestanden van dat
   vak op en zet ze om in vragen van de vragenbank: { v, o, g, u, t, svg }.
   Wat al in de bank stond blijft; dit komt erbij, onder de onderdelen die in
   bank.js bij ONDERDELEN staan (schooltaal, phrasal verbs, wie ben ik, ...).

   Niet alles leent zich ervoor: dictee en dictation hebben geluid nodig, een
   leestekst is te lang voor een toren, en slepen is geen meerkeuze. Wat wel
   kan: betekenis, gaten, signaalwoorden, formeel of informeel, phrasal verbs,
   collocations, vertalingen kiezen, oorzaak en gevolg, wie ben ik, en voor
   wiskunde getekende hoeken, driehoeken en coördinaten. */
window.BANK_SPELLEN = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function kaal(t){ return String(t == null ? '' : t).replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/[{}]/g, ''); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function kies(a){ return a[Math.floor(Math.random() * a.length)]; }
  function tussen(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  var RANG = { bb:1, kgt:2, hv:3, 1:1, 2:2, 3:3 };
  /* een vraag met het goede antwoord vooraan; de spellen husselen zelf */
  function vraag(v, goed, mis, u, t, n, svg){
    var o = [goed].concat(mis.filter(function(x){ return x && x !== goed; }).slice(0, 3));
    if (o.length < 2) return null;
    var q = { v: kaal(v), o: o.map(kaal), g: 0, u: kaal(u), t: t, n: RANG[n] || 2 };
    if (svg) q.svg = svg;
    return q;
  }

  var geladen = {};
  function script(src){
    if (geladen[src]) return geladen[src];
    return (geladen[src] = new Promise(function(res){
      var s = document.createElement('script'); s.src = src; s.onload = s.onerror = function(){ res(); }; document.head.appendChild(s);
    }));
  }

  /* ---------- Nederlands ---------- */
  function ned(){
    var uit = [];
    var W = window.WOORDENSCHAT;
    if (W){
      W.UIT.forEach(function(r){ uit.push(vraag('Wat betekent ' + r[1].replace(/\*\*([^*]+)\*\*/, '"$1"') + '', r[2], [r[3], r[4], r[5]], r[6], 'betekenis', r[0])); });
      W.GAT.forEach(function(r){ uit.push(vraag('Welk woord past in het gat? ' + r[1], r[2], [r[3], r[4], r[5]], r[6], 'betekenis', r[0])); });
      W.SCHOOL.forEach(function(r){ uit.push(vraag('Wat moet je doen als er in een opdracht "' + r[1] + '" staat?', r[3], [r[4], r[5], r[6]], r[7], 'schooltaal', r[0])); });
    }
    var S = window.SIGNAALWOORDEN;
    if (S){
      var naam = {}; S.VERBANDEN.forEach(function(v){ naam[v.id] = v.naam; });
      S.INVUL.forEach(function(r){ uit.push(vraag('Welk signaalwoord past? ' + r[1], r[2], [r[3], r[4], r[5]], r[7], 'tekstverbanden', r[0])); });
      S.WELK.forEach(function(r){
        var anderen = schud(S.VERBANDEN.filter(function(v){ return v.id !== r[2] && v.niv <= Math.max(2, r[0]); })).slice(0, 3).map(function(v){ return v.naam; });
        uit.push(vraag('Welk verband legt het vetgedrukte woord? ' + r[1], naam[r[2]], anderen, r[3], 'tekstverbanden', r[0]));
      });
      S.AFMAKEN.forEach(function(r){ uit.push(vraag('Welk vervolg klopt? ' + r[1], r[2], [r[3], r[4], r[5]], r[7], 'tekstverbanden', r[0])); });
    }
    var R = window.REGISTER;
    if (R){
      R.HERKENNEN.forEach(function(r){ uit.push(vraag('Is dit formeel of informeel? "' + r[1] + '"', r[2], [r[2] === 'formeel' ? 'informeel' : 'formeel'], r[3], 'formeel of informeel', r[0])); });
      R.KIES.forEach(function(r){ uit.push(vraag(r[1] + ' Welke versie past in een bericht aan school of een bedrijf?', r[2], [r[3], r[4]], r[5], 'formeel of informeel', r[0])); });
    }
    return uit;
  }
  /* ---------- Engels ---------- */
  function eng(){
    var uit = [], P = window.PHRASAL_OPGAVEN;
    if (P){
      var alle = P.verbs;
      alle.forEach(function(w){
        var anderen = schud(alle.filter(function(x){ return x !== w; })).slice(0, 3).map(function(x){ return x.nl; });
        uit.push(vraag('What does "' + w.v + '" mean? ' + kaal(w.z[0]), w.nl, anderen, w.v + ' = ' + w.nl + '.', 'phrasal verbs', w.n));
        if (w.fp && w.fp.length >= 2){
          var delen = w.v.split(' '), part = delen[delen.length - 1], zin = kaal(w.z[1] || w.z[0]).replace(new RegExp('\\b' + w.v.replace(/ /g, '\\s?') + '\\b', 'i'), '$&');
          var gat = zin.replace(new RegExp('\\b' + part + '\\b'), '___');
          if (gat !== zin) uit.push(vraag('Fill in the gap: ' + gat, part, w.fp.slice(0, 3), w.v + ' (' + w.nl + ').', 'phrasal verbs', w.n));
        }
      });
      (P.collocations || []).forEach(function(c){ uit.push(vraag('make or do, say or tell? ' + c.zin, c.goed, [c.goed === c.a ? c.b : c.a], c.uit, 'collocations', c.n)); });
    }
    var T = window.TRANSLATE_OPGAVEN;
    if (T) T.forEach(function(z){ if (z.fout && z.fout.length) uit.push(vraag('Which translation is correct? "' + z.nl + '"', z.en[0], z.fout, z.f || z.punt, 'vertalen', z.n)); });
    return uit;
  }
  /* ---------- geschiedenis ---------- */
  var TV = ['jagers en boeren', 'Grieken en Romeinen', 'monniken en ridders', 'steden en staten', 'ontdekkers en hervormers', 'regenten en vorsten', 'pruiken en revoluties', 'burgers en stoommachines', 'wereldoorlogen', 'televisie en computer'];
  function ges(){
    var uit = [], D = window.OG_DATA;
    if (D){
      D.LOS.forEach(function(it){
        var h = it.oorzaak.charAt(0).toUpperCase() + it.oorzaak.slice(1);
        uit.push(vraag(h + '. Wat was daarvan een gevolg?', it.gevolg, it.mis, h + ' → ' + it.gevolg + '.', 'oorzaak en gevolg', it.n));
        var anderen = schud(D.LOS.filter(function(x){ return x !== it; })).slice(0, 3).map(function(x){ return x.oorzaak; });
        var g = it.gevolg.charAt(0).toUpperCase() + it.gevolg.slice(1);
        uit.push(vraag(g + '. Wat was daarvan de oorzaak?', it.oorzaak, anderen, h + ' → ' + it.gevolg + '.', 'oorzaak en gevolg', it.n));
      });
    }
    var W = window.WIE_DATA;
    if (W) W.forEach(function(it){
      var anderen = schud(W.filter(function(x){ return x !== it && x.soort === it.soort; })).slice(0, 3).map(function(x){ return x.naam; });
      var hints = it.hints.slice(2, 5).join(' ');
      uit.push(vraag((it.soort === 'persoon' ? 'Wie ben ik? ' : 'Wat ben ik? ') + hints, it.naam, anderen, it.uit + ' Tijdvak ' + it.tv + ': ' + TV[it.tv - 1] + '.', 'wie ben ik', it.n));
    });
    return uit;
  }
  /* ---------- wiskunde: getekende vragen, elke keer opnieuw geloot ---------- */
  function hoekSvg(graden){
    var r = 70, rad = graden * Math.PI / 180, x = 90 + r * Math.cos(rad), y = 90 - r * Math.sin(rad);
    var groot = graden > 180 ? 1 : 0;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 110" width="190" height="110" role="img" aria-label="hoek">' +
      '<path d="M' + (90 + 22) + ' 90A22 22 0 ' + groot + ' 0 ' + (90 + 22 * Math.cos(rad)).toFixed(1) + ' ' + (90 - 22 * Math.sin(rad)).toFixed(1) + '" fill="none" stroke="#204ECF" stroke-width="2.5"/>' +
      '<path d="M90 90H170M90 90L' + x.toFixed(1) + ' ' + y.toFixed(1) + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="90" cy="90" r="3" fill="currentColor"/></svg>';
  }
  function driehoekSvg(a, b){
    var s = 120 / Math.max(a, b), A = a * s, B = b * s;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="200" height="150" role="img" aria-label="rechthoekige driehoek">' +
      '<path d="M40 ' + (135 - B).toFixed(1) + 'V135H' + (40 + A).toFixed(1) + 'Z" fill="#204ECF" fill-opacity=".12" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M40 121h14v14" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<text x="' + (40 + A / 2).toFixed(1) + '" y="148" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">' + a + '</text>' +
      '<text x="26" y="' + (135 - B / 2).toFixed(1) + '" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">' + b + '</text>' +
      '<text x="' + (48 + A / 2).toFixed(1) + '" y="' + (125 - B / 2).toFixed(1) + '" font-size="15" font-weight="700" fill="#204ECF">?</text></svg>';
  }
  function roosterSvg(px, py){
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 230" width="230" height="230" role="img" aria-label="assenstelsel">';
    for (var i = 0; i <= 10; i++){ var p = 20 + i * 19; s += '<line x1="' + p + '" y1="20" x2="' + p + '" y2="210" stroke="currentColor" stroke-opacity=".18"/><line x1="20" y1="' + p + '" x2="210" y2="' + p + '" stroke="currentColor" stroke-opacity=".18"/>'; }
    s += '<line x1="115" y1="20" x2="115" y2="210" stroke="currentColor" stroke-width="2"/><line x1="20" y1="115" x2="210" y2="115" stroke="currentColor" stroke-width="2"/>';
    [-5, 5].forEach(function(v){ s += '<text x="' + (115 + v * 19) + '" y="226" font-size="11" text-anchor="middle" fill="currentColor">' + v + '</text><text x="8" y="' + (119 - v * 19) + '" font-size="11" text-anchor="middle" fill="currentColor">' + v + '</text>'; });
    s += '<text x="122" y="126" font-size="10" fill="currentColor">O</text><circle cx="' + (115 + px * 19) + '" cy="' + (115 - py * 19) + '" r="6" fill="#F26749" stroke="#fff" stroke-width="1.5"/></svg>';
    return s;
  }
  function wis(){
    var uit = [], i;
    var DRIE = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [15, 20, 25], [10, 24, 26], [20, 21, 29], [18, 24, 30], [21, 28, 35], [12, 35, 37], [9, 40, 41]];
    /* de soort hoek: elke hoek per 5 graden een keer, plus de rechte en de gestrekte */
    var HOEKEN = [90, 180];
    for (i = 20; i <= 175; i += 5) if (i !== 90) HOEKEN.push(i);
    HOEKEN.forEach(function(gr){
      var soort = gr < 90 ? 'scherp' : gr === 90 ? 'recht' : gr < 180 ? 'stomp' : 'gestrekt';
      uit.push(vraag('Wat voor hoek is dit?', soort + 'e hoek' + (soort === 'recht' ? ' (90°)' : ''), ['scherpe hoek', 'rechte hoek (90°)', 'stompe hoek', 'gestrekte hoek'].filter(function(x){ return x.indexOf(soort) < 0; }), 'Scherp is kleiner dan 90°, recht is precies 90°, stomp zit tussen 90° en 180°, gestrekt is 180°. Deze hoek is ' + gr + '°.', 'hoeken', 1, hoekSvg(gr)));
    });
    for (i = 2; i <= 17; i++){
      var g2 = i * 10, mis2 = [g2 + 30, g2 - 30, g2 + 60, 180 - g2, g2 + 15].filter(function(x){ return x > 0 && x < 180 && x !== g2; });
      uit.push(vraag('Hoe groot is deze hoek ongeveer?', g2 + '°', schud(mis2).slice(0, 3).map(function(x){ return x + '°'; }), 'Vergelijk met 90° (een rechte hoek) en 45° (de helft daarvan): deze hoek is ' + g2 + '°.', 'hoeken', 2, hoekSvg(g2)));
    }
    DRIE.forEach(function(d, k){
      /* de schuine zijde met hele getallen is ook iets voor bb: beide kanten op */
      [[d[0], d[1]], [d[1], d[0]]].forEach(function(p){
        uit.push(vraag('De rechthoekszijden zijn ' + p[0] + ' en ' + p[1] + '. Bereken de schuine zijde.', String(d[2]), [String(p[0] + p[1]), String(d[2] + 1), String(d[2] - 2)], p[0] + '² + ' + p[1] + '² = ' + (p[0] * p[0]) + ' + ' + (p[1] * p[1]) + ' = ' + (d[2] * d[2]) + ', en √' + (d[2] * d[2]) + ' = ' + d[2] + '.', 'pythagoras', k < 11 ? 1 : 2, driehoekSvg(p[0], p[1])));
      });
      uit.push(vraag('De schuine zijde is ' + d[2] + ' en een rechthoekszijde is ' + d[0] + '. Hoe lang is de andere rechthoekszijde?', String(d[1]), [String(d[2] - d[0]), String(d[1] + 1), String(d[0] + d[2])], d[2] + '² − ' + d[0] + '² = ' + (d[2] * d[2]) + ' − ' + (d[0] * d[0]) + ' = ' + (d[1] * d[1]) + ', en √' + (d[1] * d[1]) + ' = ' + d[1] + '.', 'pythagoras', 3));
    });
    /* eerst elk punt in het eerste kwadrant (bb), daarna punten met negatieve coördinaten */
    var PUNTEN = [];
    for (var ax = 0; ax <= 5; ax++) for (var ay = 0; ay <= 5; ay++) if (ax || ay) PUNTEN.push([ax, ay]);
    for (i = 0; i < 60; i++){ var qx = tussen(-5, 5), qy = tussen(-5, 5); if (qx < 0 || qy < 0) PUNTEN.push([qx, qy]); }
    PUNTEN.forEach(function(pt){
      var px = pt[0], py = pt[1];
      uit.push(vraag('Welke coördinaten heeft de stip?', '(' + px + ', ' + py + ')', ['(' + py + ', ' + px + ')', '(' + (-px) + ', ' + py + ')', '(' + px + ', ' + (-py) + ')'], 'Eerst x (naar rechts is positief), dan y (omhoog is positief): (' + px + ', ' + py + ').', 'coördinaten', px < 0 || py < 0 ? 2 : 1, roosterSvg(px, py)));
    });
    return uit.filter(Boolean);
  }

  var VAK = {
    ned: { bestanden:['woordenschat-opgaven.js', 'signaalwoorden-opgaven.js', 'register-opgaven.js'], maak: ned },
    eng: { bestanden:['phrasal-opgaven.js', 'translate-opgaven.js'], maak: eng },
    ges: { bestanden:['oorzaakgevolg-opgaven.js', 'wiebenik-opgaven.js'], maak: ges },
    wis: { bestanden:[], maak: wis }
  };
  var gedaan = {};
  function laad(vak){
    var v = VAK[vak];
    if (!v || gedaan[vak]) return Promise.resolve();
    gedaan[vak] = true;
    return Promise.all(v.bestanden.map(script)).then(function(){
      var lijst;
      try { lijst = v.maak().filter(Boolean); } catch (e){ lijst = []; }
      if (!window.BRONNEN || !window.NIVOS) return;
      BRONNEN[vak] = (BRONNEN[vak] || []).concat(lijst.map(function(q){ var k = { v:q.v, o:q.o, g:q.g, u:q.u, t:q.t }; if (q.svg) k.svg = q.svg; return k; }));
      NIVOS[vak] = (NIVOS[vak] || []).concat(lijst.map(function(q){ return q.n; }));
    });
  }
  return { laad: laad, vakken: Object.keys(VAK) };
})();
