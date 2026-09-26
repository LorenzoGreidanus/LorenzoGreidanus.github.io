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
   wiskunde getekende hoeken, driehoeken en coördinaten.

   Samenleving, aardrijkskunde, biologie en economie krijgen de tekstvragen
   uit Democratie, Welke partij is dit?, Verkiezingen, Bevolkingspiramides,
   Klimaatgrafieken, Kaartvaardigheden, Kruisingsschema, Voedselweb en Vraag
   en aanbod. Wat in het spel een plaatje nodig heeft, staat hier in woorden:
   een klimaatgrafiek wordt de warmste en koudste maand en de neerslag, een
   bevolkingspiramide de omschrijving van zijn vorm. Logo's doen niet mee. */
window.BANK_SPELLEN = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function kaal(t){ return String(t == null ? '' : t).replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/[{}]/g, ''); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function kies(a){ return a[Math.floor(Math.random() * a.length)]; }
  function tussen(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  var RANG = { bb:1, kgt:2, hv:3, vwo:4, 1:1, 2:2, 3:3, 4:4 };
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

  /* ---------- gedeeld door samenleving, aardrijkskunde, biologie en economie ---------- */
  function hoofd(t){ t = String(t); return t.charAt(0).toUpperCase() + t.slice(1); }
  function nl(x, d){ var f = Math.pow(10, d === undefined ? 1 : d); return String(Math.round(x * f) / f).replace('.', ','); }
  function dz(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  /* afleiders: geschud, zonder het goede antwoord, zonder dubbele en zonder wat in niet staat */
  function anders(lijst, goed, n, niet){
    var gezien = {}; gezien[goed] = 1; (niet || []).forEach(function(x){ gezien[x] = 1; });
    return schud(lijst).filter(function(x){ if (!x || gezien[x]) return false; gezien[x] = 1; return true; }).slice(0, n || 3);
  }
  /* een vraag met minstens drie antwoorden, anders geen vraag */
  function vr(v, goed, mis, u, t, n, svg){
    var q = vraag(v, goed, anders(mis, goed, 3), u, t, n, svg);
    return q && q.o.length >= 3 ? q : null;
  }
  /* Begrippen: het begrip bij de omschrijving, en (op een niveau hoger, als het
     kort genoeg is) de omschrijving bij het begrip. De afleiders komen uit
     begrippen van hetzelfde of een lager niveau; wat erop lijkt staat in botst. */
  function begripVragen(uit, lijst, t, botst){
    botst = botst || {};
    lijst.forEach(function(it){
      var mag = lijst.filter(function(x){ return x !== it && x.n <= Math.max(it.n, 1) && (botst[it.b] || []).indexOf(x.b) < 0 && (botst[x.b] || []).indexOf(it.b) < 0; });
      if (mag.length < 3) mag = lijst.filter(function(x){ return x !== it && (botst[it.b] || []).indexOf(x.b) < 0 && (botst[x.b] || []).indexOf(it.b) < 0; });
      var u = hoofd(it.b) + ': ' + it.u + '.';
      uit.push(vr('Welk begrip hoort bij deze omschrijving: ' + it.u + '?', it.b, mag.map(function(x){ return x.b; }), u, t, it.n));
      var kort = mag.filter(function(x){ return x.u.length <= 70; });
      if (it.u.length <= 70 && kort.length >= 3) uit.push(vr('Wat betekent het begrip "' + it.b + '"?', it.u, kort.map(function(x){ return x.u; }), u, t, Math.min(4, it.n + 1)));
    });
  }

  /* ---------- samenleving: democratie, partijen en verkiezingen ---------- */
  function burg(){
    var uit = [], D = window.DEM_DATA;
    /* meerkeuze uit het spel; niet als het goede antwoord veel langer is dan de
       rest (dan raad je het aan de lengte) of te lang voor een knop in de toren */
    function mc(lijst, t){ (lijst || []).forEach(function(it){
      if (!it.o || it.o.length < 3) return;
      var g = it.o[0].length, rest = Math.max.apply(null, it.o.slice(1).map(function(x){ return x.length; }));
      if (g > 85 || (g > rest + 12 && g > rest * 1.5)) return;
      uit.push(vr(it.v, it.o[0], it.o.slice(1), it.u, t, it.n));
    }); }
    if (D){
      /* trias politica: bij welke macht hoort het */
      var M = D.MACHT, MK = ['w', 'u', 'r'];
      function machten(behalve){ return MK.filter(function(k){ return k !== behalve; }).map(function(k){ return M[k].naam; }); }
      D.TRIAS.forEach(function(it){ uit.push(vr(it.t + ' Welke macht van de trias politica is hier aan het werk?', M[it.m].naam, machten(it.m), it.u || M[it.m].uit, 'rechtsstaat', it.n)); });
      D.TRIAS_KAART.forEach(function(it){ uit.push(vr('Bij welke macht van de trias politica hoort "' + it.k + '"?', M[it.m].naam, machten(it.m), M[it.m].uit, 'rechtsstaat', it.n)); });
      mc(D.TRIAS_MC, 'rechtsstaat');
      /* wie beslist erover: gemeente, provincie, waterschap, Rijk of EU */
      var L = D.LAAG, LK = Object.keys(L);
      D.WIE.forEach(function(it){ uit.push(vr(it.s + ' Welke overheid regelt dat?', L[it.l].naam, LK.map(function(k){ return L[k].naam; }), it.u || L[it.l].uit, 'bestuurslagen', it.n)); });
      var O = D.ORGAAN, OK = Object.keys(O);
      D.WIE_GEM.forEach(function(it){ uit.push(vr('Wie doet dit in de gemeente: ' + it.s + '?', O[it.w], OK.map(function(k){ return O[k]; }), it.u, 'bestuurslagen', it.n)); });
      mc(D.WIE_MC, 'bestuurslagen');
      /* hoe een wet tot stand komt: welke stap komt daarna. Alleen stappen die
         echt op elkaar volgen; op vmbo-bb uit de stappen die bb in het spel ziet. */
      var ST = D.WET_STAP, BB = D.WET_SET.bb, KGT = D.WET_SET.kgt;
      for (var i = 0; i + 1 < ST.length; i++){
        var bb = BB.indexOf(i) >= 0 && BB.indexOf(i + 1) >= 0, kgt = KGT.indexOf(i) >= 0 && KGT.indexOf(i + 1) >= 0;
        var pot = ST.filter(function(s, j){ return j !== i && j !== i + 1 && (!bb || BB.indexOf(j) >= 0); }).map(function(s){ return s.l; });
        uit.push(vr('Een wet komt in stappen tot stand. Welke stap volgt direct op: "' + ST[i].l.replace(/\.$/, '') + '"?', ST[i + 1].l, pot, 'De volgorde: ' + ST.map(function(s){ return s.k; }).join(', ') + '.', 'democratie', bb ? 1 : kgt ? 2 : 3));
      }
      mc(D.WET_MC, 'democratie');
      /* grondrechten bij een situatie */
      var R = D.RECHT, RK = Object.keys(R);
      D.RECHT_SIT.forEach(function(it){
        var r = R[it.r], pot = RK.filter(function(k){ return k !== it.r && r.niet.indexOf(k) < 0 && (R[k].niet || []).indexOf(it.r) < 0 && R[k].n <= Math.max(it.n, 2); }).map(function(k){ return R[k].naam; });
        uit.push(vr(it.s + ' Welk grondrecht hoort hierbij?', r.naam, pot, (it.u || r.uit) + ' Dat staat in ' + r.art + '.', 'rechtsstaat', it.n));
      });
      mc(D.RECHT_MC, 'rechtsstaat');
      /* democratie of dictatuur */
      mc(D.STAAT_MC, 'democratie');
      /* alleen de korte situaties: ze staan als antwoorden op de knoppen */
      var SIT = D.STAAT_SIT.filter(function(x){ return x.s.length <= 80; });
      var DEMO = SIT.filter(function(x){ return x.d; }), DICT = SIT.filter(function(x){ return !x.d; });
      SIT.forEach(function(it){
        var tegen = (it.d ? DICT : DEMO).map(function(x){ return x.s; });
        uit.push(vr('Welke situatie past bij een ' + (it.d ? 'democratie' : 'dictatuur') + '?', it.s, tegen, it.d ? 'In een democratie kiezen burgers vrij, mogen ze kritiek geven en is de rechter onafhankelijk.' : 'In een dictatuur heeft één persoon of groep alle macht en is er geen ruimte voor kritiek.', 'democratie', it.n));
      });
      var DK = D.STAAT_KAART.filter(function(x){ return x.d; }), NK = D.STAAT_KAART.filter(function(x){ return !x.d; });
      D.STAAT_KAART.forEach(function(it){
        uit.push(vr('Welk kenmerk hoort bij een ' + (it.d ? 'democratie' : 'dictatuur') + '?', it.k, (it.d ? NK : DK).map(function(x){ return x.k; }), hoofd(it.k) + ' hoort bij een ' + (it.d ? 'democratie' : 'dictatuur') + '.', 'democratie', it.n));
      });
    }
    /* politieke partijen: afkorting en naam, feiten, oprichtingsjaar (zonder logo's) */
    var PD = window.PARTIJEN_DATA;
    if (PD){
      var P = PD.P, PID = {}; P.forEach(function(p){ PID[p.id] = p; });
      function pool(p){ return P.filter(function(x){ return x !== p && (x.nu || !p.nu); }); }
      function kort(p){ return p.afk === p.naam || p.afk.length > 4 ? p.naam : p.afk; }
      /* JA21 en Volt hebben geen echte afkorting */
      var AFK = P.filter(function(p){ return p.afk !== p.naam && p.id !== 'ja21' && p.id !== 'volt'; });
      AFK.forEach(function(p){
        var mag = AFK.filter(function(x){ return x !== p && (x.nu || !p.nu); }), n = p.nu ? 1 : 3;
        uit.push(vr('Waar staat de afkorting ' + p.afk + ' voor?', p.naam, mag.map(function(x){ return x.naam; }), p.afk + ' staat voor ' + p.naam + '.', 'partijen', n));
        uit.push(vr('Wat is de afkorting van de partij ' + p.naam + '?', p.afk, mag.map(function(x){ return x.afk; }), p.naam + ' kort je af als ' + p.afk + '.', 'partijen', n));
      });
      /* bij "het jaar in haar naam" horen JA21 en 50PLUS niet als afleider: daar staat ook een getal in */
      var NIET = { d66: ['ja21', '50plus'] };
      PD.FEIT.forEach(function(f){
        var p = PID[f[0]]; if (!p) return;
        var mag = pool(p).filter(function(x){ return (NIET[p.id] || []).indexOf(x.id) < 0; });
        uit.push(vr(f[1], kort(p), mag.map(kort), p.naam + (p.afk !== p.naam ? ' (' + p.afk + ')' : '') + ' bestaat sinds ' + p.jaar + '.', 'partijen', f[2] ? 3 : 1));
      });
      P.forEach(function(p, pi){
        /* drie andere jaren, minstens vier jaar uit elkaar; per partij een andere schuif, zodat het goede jaar niet steeds in het midden ligt */
        var jaren = [p.jaar], stap = [-24, 12, -9, 20, -15, 7, 30, -5, 16, -32];
        for (var s = 0; s < stap.length && jaren.length < 4; s++){ var j = p.jaar + stap[(s + pi * 3) % stap.length]; if (j >= 1900 && j <= 2026 && jaren.every(function(x){ return Math.abs(x - j) >= 4; })) jaren.push(j); }
        uit.push(vr('In welk jaar werd de partij ' + p.naam + ' opgericht?', String(p.jaar), jaren.slice(1).map(String), p.naam + ' bestaat sinds ' + p.jaar + '.', 'partijen', p.nu ? 2 : 3));
      });
      PD.CHRISTELIJK.forEach(function(c){
        uit.push(vr('Welke van deze partijen is een christelijke partij?', PID[c].afk, PD.NIET_CHR.map(function(x){ return PID[x].afk; }), 'Het CDA, de ChristenUnie en de SGP baseren hun ideeën op de Bijbel.', 'partijen', 1));
      });
      PD.NIET_CHR.forEach(function(c){
        uit.push(vr('Welke van deze partijen is géén christelijke partij?', PID[c].afk, PD.CHRISTELIJK.map(function(x){ return PID[x].afk; }), 'Het CDA, de ChristenUnie en de SGP zijn de christelijke partijen. De ' + PID[c].afk + ' is dat niet.', 'partijen', 2));
      });
    }
    /* verkiezingen: begrippen, wie mag stemmen, en rekenen met zetels */
    var V = window.VERKIEZINGEN_DATA;
    if (V){
      var KAMERS = ['parlement', 'Tweede Kamer', 'Eerste Kamer', 'Staten-Generaal'];
      var botst = {}; KAMERS.forEach(function(k){ botst[k] = KAMERS; });
      botst.regering = ['kabinet', 'coalitie']; botst.kabinet = ['regering'];
      begripVragen(uit, V.BEGRIPPEN.map(function(b){ return { b: b.b, u: b.u, n: b.hv ? 2 : 1 }; }), 'democratie', botst);
      V.KIESRECHT.forEach(function(k){ if (k.o) uit.push(vr(k.v || k.s + ' Mag dat?', k.o[0], k.o.slice(1), k.u, 'democratie', k.n || 2)); });
    }
    [[9, 'gemeenteraad'], [15, 'gemeenteraad'], [17, 'gemeenteraad'], [25, 'gemeenteraad'], [29, 'gemeenteraad'], [37, 'gemeenteraad'], [45, 'gemeenteraad'], [75, 'Eerste Kamer'], [150, 'Tweede Kamer']].forEach(function(z){
      var n = z[0], m = Math.floor(n / 2) + 1;
      uit.push(vr('De ' + z[1] + ' heeft ' + n + ' zetels. Hoeveel zetels heeft een coalitie minstens nodig voor een meerderheid?', String(m), [String(m - 1), String(m + 1), String(Math.ceil(n * 2 / 3))], 'Een meerderheid is meer dan de helft. De helft van ' + n + ' is ' + nl(n / 2) + ', dus minstens ' + m + ' zetels.', 'democratie', 1));
    });
    [[30000, 15], [75000, 25], [58500, 39], [112500, 45], [40000, 25], [9000000, 150], [10500000, 150]].forEach(function(z){
      var d = z[0] / z[1];
      uit.push(vr('Er zijn ' + dz(z[0]) + ' geldige stemmen uitgebracht voor ' + z[1] + ' zetels. Hoe groot is de kiesdeler?', dz(d), [dz(d * 10), dz(d / 10), dz(d * 2)], dz(z[0]) + ' ÷ ' + z[1] + ' = ' + dz(d) + '. Zoveel stemmen kost een zetel.', 'democratie', 2));
    });
    [[7500, 2000], [12400, 3000], [5100, 1500], [18200, 2500], [1250000, 70000], [4500, 1600]].forEach(function(z){
      var vol = Math.floor(z[0] / z[1]);
      uit.push(vr('Een partij krijgt ' + dz(z[0]) + ' stemmen. De kiesdeler is ' + dz(z[1]) + '. Hoeveel volle zetels krijgt de partij?', String(vol), [String(vol + 1), String(vol - 1), String(vol + 2)], dz(z[0]) + ' ÷ ' + dz(z[1]) + ' = ' + nl(z[0] / z[1], 2) + '. Naar beneden afgerond: ' + vol + ' volle zetels. Wat overblijft telt mee voor de restzetels.', 'democratie', 2));
    });
    return uit.filter(Boolean);
  }

  /* ---------- aardrijkskunde: bevolking, klimaten en kaartlezen ---------- */
  var MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  function aard(){
    var uit = [];
    /* bevolking */
    var P = window.PIRAMIDES;
    if (P){
      var SOORT = { groei:'een groeiende bevolking (piramide)', stabiel:'een stabiele bevolking (klok)', krimp:'een krimpende, vergrijzende bevolking (urn)' }, SK = Object.keys(SOORT);
      var WAAROM = { groei:'Een brede basis betekent veel kinderen: de bevolking groeit.', stabiel:'De groepen zijn ongeveer even breed tot de ouderen: de bevolking blijft ongeveer gelijk.', krimp:'De basis is smaller dan het midden: er worden weinig kinderen geboren en de bevolking vergrijst.' };
      P.forEach(function(l){
        uit.push(vr('De bevolkingspiramide van ' + l.land + ' heeft deze vorm: ' + l.uit.replace(/: /g, ', ') + '. Wat voor bevolking is dat?', SOORT[l.soort], SK.map(function(k){ return SOORT[k]; }), WAAROM[l.soort], 'bevolking', l.bb ? 1 : 2));
        var ander = P.filter(function(x){ return x.soort !== l.soort; }).map(function(x){ return x.land; });
        uit.push(vr('Welk van deze landen heeft ' + SOORT[l.soort] + '?', l.land, ander, l.land + ': ' + l.uit + '. ' + WAAROM[l.soort], 'bevolking', 2));
        var g = l.geboorte - l.sterfte;
        uit.push(vr(l.land + ' heeft een geboortecijfer van ' + l.geboorte + ' en een sterftecijfer van ' + l.sterfte + ' per 1000 inwoners. Hoe groot is de natuurlijke bevolkingsgroei?', g + ' per 1000', [(l.geboorte + l.sterfte) + ' per 1000', (-g) + ' per 1000', l.geboorte + ' per 1000', l.sterfte + ' per 1000'], 'Natuurlijke groei = geboortecijfer min sterftecijfer: ' + l.geboorte + ' − ' + l.sterfte + ' = ' + g + ' per 1000 inwoners.' + (g < 0 ? ' Er sterven meer mensen dan er geboren worden.' : ''), 'bevolking', 2));
        var F = window.PIRAMIDE_FASEN;
        if (F){
          var fase = l.geboorte > 35 ? 2 : l.geboorte - l.sterfte >= 8 ? 3 : 4;
          uit.push(vr(l.land + ' heeft een geboortecijfer van ' + l.geboorte + ' en een sterftecijfer van ' + l.sterfte + ' per 1000. In welke fase van het demografisch transitiemodel zit het land?', F[fase - 1], F, 'Het verschil is ' + g + ' per 1000. ' + (fase === 2 ? 'Het sterftecijfer is al laag maar het geboortecijfer nog hoog: fase 2, snelle groei.' : fase === 3 ? 'Het geboortecijfer daalt, maar is nog duidelijk hoger dan het sterftecijfer: fase 3.' : 'Allebei laag en dicht bij elkaar: fase 4, met vergrijzing.'), 'bevolking', 3));
        }
      });
      var B = window.PIRAMIDE_BEGRIPPEN;
      if (B){
        var bbTot = B.map(function(x){ return x.b; }).indexOf('demografische transitie');
        begripVragen(uit, B.map(function(x, i){ return { b: x.b, u: x.u, n: i <= bbTot ? 1 : 2 }; }), 'bevolking', {
          'bevolkingsgroei': ['geboorteoverschot', 'natuurlijke bevolkingsgroei', 'vestigingsoverschot'], 'geboorteoverschot': ['natuurlijke bevolkingsgroei'],
          'immigratie': ['vestigingsoverschot', 'sociale bevolkingsgroei', 'asielzoeker'], 'vergrijzing': ['grijze druk'], 'ontgroening': ['groene druk'], 'bevolkingskrimp': ['ontgroening', 'vergrijzing'] });
      }
      var GV = window.PIRAMIDE_GEVOLGEN;
      if (GV){
        var LAND = { krimp:'Een land heeft een krimpende, vergrijzende bevolking: weinig kinderen en veel ouderen.', groei:'Een land heeft een groeiende bevolking: veel kinderen en weinig ouderen.', stabiel:'In een land zijn de leeftijdsgroepen tot de ouderen ongeveer even groot.' };
        GV.forEach(function(g){
          var v = g.v.replace('Wat is een gevolg van deze piramide voor', 'Wat is daarvan een gevolg voor').replace('Wat past bij deze piramide?', 'Wat past daarbij?');
          uit.push(vr(LAND[g.soort] + ' ' + v, g.goed, g.mis, LAND[g.soort] + ' Dus: ' + g.goed + '.', 'bevolking', 3));
        });
      }
    }
    /* klimaten */
    var K = window.KLIMAAT_GEGEVENS;
    if (K){
      var S = K.soorten, KK = Object.keys(S);
      KK.forEach(function(k){
        var buur = KK.filter(function(x){ return x !== k && S[x].groep === S[k].groep; }), rest = KK.filter(function(x){ return x !== k && S[x].groep !== S[k].groep; });
        uit.push(vr('Welk klimaat past hierbij: ' + S[k].kenmerk + '?', S[k].naam, schud(buur).slice(0, 1).concat(schud(rest)).map(function(x){ return S[x].naam; }), hoofd(S[k].naam) + ': ' + S[k].kenmerk + '.', 'klimaten', k === 'hooggebergte' ? 2 : 1));
      });
      var HG = { A:'tropische klimaten (A)', B:'droge klimaten (B)', C:'gematigde klimaten (C)', D:'landklimaten (D)', E:'poolklimaten (E)' };
      KK.forEach(function(k){
        if (!HG[S[k].groep] || k === 'land') return;
        uit.push(vr('Bij welke hoofdgroep van klimaten hoort het ' + S[k].naam + '?', HG[S[k].groep], Object.keys(HG).map(function(g){ return HG[g]; }), hoofd(S[k].naam) + ' hoort bij de ' + HG[S[k].groep] + ': ' + S[k].kenmerk + '.', 'klimaten', 2));
      });
      function som(a){ return a.reduce(function(s, x){ return s + x; }, 0); }
      function iMax(a){ var i = 0; a.forEach(function(x, j){ if (x > a[i]) i = j; }); return i; }
      function iMin(a){ var i = 0; a.forEach(function(x, j){ if (x < a[i]) i = j; }); return i; }
      /* past een klimaat bij deze getallen? Dan is het geen eerlijke afleider */
      function cijfers(st){
        var t = st.temp, r = st.neerslag, zuid = st.lat < 0, zomer = zuid ? [11, 0, 1] : [5, 6, 7], winter = zuid ? [5, 6, 7] : [11, 0, 1];
        var zr = som(zomer.map(function(i){ return r[i]; })) / 3, wr = som(winter.map(function(i){ return r[i]; })) / 3;
        return { min: t[iMin(t)], max: t[iMax(t)], som: som(r), droog: r[iMin(r)], zomerdroog: zr < 30 && zr < wr / 2 };
      }
      function past(k, st, c){
        return k === 'regenwoud' ? c.min > 18 && c.som > 1500 && c.droog >= 60 : k === 'savanne' ? c.min > 18 && c.droog < 60 : k === 'woestijn' ? c.som < 250 : k === 'steppe' ? c.som >= 250 && c.som <= 500 :
          k === 'zee' ? c.min > -3 && c.max >= 10 && c.max < 28 && !c.zomerdroog : k === 'middellandse' ? c.min > -3 && c.zomerdroog : k === 'land' ? c.min < -3 && c.max >= 10 : k === 'toendra' ? c.max < 10 : k === 'hooggebergte' ? !!st.hoogte : false;
      }
      var GR1 = { A:'tropisch klimaat', B:'droog klimaat (woestijn of steppe)', C:'gematigd klimaat (zee of Middellandse Zee)', D:'landklimaat', E:'poolklimaat' };
      function groepPast(g, c){ return g === 'A' ? c.min > 18 : g === 'B' ? c.som < 500 : g === 'C' ? c.min > -3 && c.max >= 10 && c.min <= 18 : g === 'D' ? c.min < -3 && c.max >= 10 : g === 'E' ? c.max < 10 : false; }
      K.stations.forEach(function(st){
        var c = cijfers(st), k = st.klimaat, g = S[k].groep, t = st.temp, r = st.neerslag;
        /* de grafiek in woorden; past het niet, dan zonder het land erbij */
        var tekst = st.naam + ' (' + st.land + ')' + (st.hoogte ? ', op ' + dz(st.hoogte) + ' m hoogte' : '') + ': warmste maand ' + nl(c.max) + ' °C, koudste ' + nl(c.min) + ' °C, ' + c.som + ' mm neerslag per jaar, ' + MAAND[iMax(r)] + ' het natst (' + r[iMax(r)] + ' mm), ' + MAAND[iMin(r)] + ' het droogst (' + c.droog + ' mm).';
        if (tekst.length > 135) tekst = tekst.replace(' (' + st.land + ')', '');
        var u = st.naam + ': ' + S[k].naam + ', want ' + S[k].kenmerk + '.';
        if (st.klimaatVraag !== false && GR1[g]){
          uit.push(vr(tekst + ' Bij welke groep klimaten hoort dit?', GR1[g], Object.keys(GR1).filter(function(x){ return x !== g && !groepPast(x, c); }).map(function(x){ return GR1[x]; }), u, 'klimaten', 1));
        }
        if (st.klimaatVraag !== false && past(k, st, c)){
          var buur = KK.filter(function(x){ return x !== k && S[x].groep === g && !past(x, st, c); }), rest = KK.filter(function(x){ return x !== k && S[x].groep !== g && !past(x, st, c); });
          uit.push(vr(tekst + ' Welk klimaat is dit?', S[k].naam, schud(buur).slice(0, 1).concat(schud(rest)).map(function(x){ return S[x].naam; }), u, 'klimaten', 2));
        }
        if (st.halfrondVraag !== false && Math.abs(st.lat) >= 12){
          var zuid = st.lat < 0;
          uit.push(vr('Bij een klimaatstation is ' + MAAND[iMax(t)] + ' de warmste maand (' + nl(c.max) + ' °C) en ' + MAAND[iMin(t)] + ' de koudste (' + nl(c.min) + ' °C). Waar ligt dit station?', zuid ? 'op het zuidelijk halfrond' : 'op het noordelijk halfrond', ['op het noordelijk halfrond', 'op het zuidelijk halfrond', 'precies op de evenaar'],
            (zuid ? 'De zomer valt in december tot februari, als het bij ons winter is: dat is het zuidelijk halfrond.' : 'De zomer valt in juni tot augustus, net als bij ons: dat is het noordelijk halfrond.') + ' Het station is ' + st.naam + '.', 'klimaten', 2));
        }
      });
    }
    /* kaartlezen */
    var G = window.KAART_GEGEVENS;
    if (G){
      function deel(s){ var i = s.indexOf(': '); return [s.slice(0, i), s.slice(i + 2)]; }
      G.symbolen.forEach(function(s){
        uit.push(vr('Op een kaart staat als teken ' + deel(s.uit)[0] + '. Wat betekent dat teken?', s.naam, G.symbolen.map(function(x){ return x.naam; }), 'Dat teken is ' + s.uit + '. In de legenda staat bij elk teken wat het betekent.', 'kaartlezen', 1));
      });
      G.lijnen.forEach(function(l){
        var wat = deel(l.uit)[0]; if (!/^(een|twee) /.test(wat)) wat = 'een lijn van ' + wat;
        uit.push(vr('Op een kaart zie je ' + wat + '. Wat stelt dat voor?', l.naam, G.lijnen.map(function(x){ return x.naam; }), 'Dat is ' + l.uit + '.', 'kaartlezen', 1));
      });
      var KL = { water:'blauw', bos:'groen', bebouwing:'oranje', weiland:'lichtgeel' }, WAT = { water:'water', bos:'bos', bebouwing:'bebouwing (een dorp of stad)', weiland:'weiland en akkers' };
      var UV = 'Blauw is water, groen is bos, oranje of rood is bebouwing, lichtgeel is open land met weiland en akkers.';
      G.vlakken.forEach(function(v){
        uit.push(vr('Wat stelt een ' + KL[v.id] + ' vlak op een kaart meestal voor?', v.naam, G.vlakken.map(function(x){ return x.naam; }), UV, 'kaartlezen', 1));
        uit.push(vr('Welke kleur heeft ' + WAT[v.id] + ' meestal op een kaart?', KL[v.id], Object.keys(KL).map(function(x){ return KL[x]; }), UV, 'kaartlezen', 1));
      });
      var R = G.richtingen, NAAR = {}; R.forEach(function(r){ NAAR[r.id] = 'het ' + r.naam + 'en'; });
      function bij(h){ h = ((h % 360) + 360) % 360; return R.filter(function(r){ return r.hoek === h; })[0]; }
      R.forEach(function(r, i){
        var hoofdR = r.hoek % 90 === 0, tegen = bij(r.hoek + 180);
        var pot = R.filter(function(x){ return x !== r && x !== tegen && (x.hoek % 90 === 0) === hoofdR; }).map(function(x){ return x.naam; });
        uit.push(vr('Welke windrichting is precies tegenovergesteld aan ' + r.naam + '?', tegen.naam, pot, 'Tegenover ' + r.naam + ' ligt ' + tegen.naam + ': een halve draai, 180 graden.', 'kaartlezen', hoofdR ? 1 : 2));
        var rechts = i % 2 === 0, na = bij(r.hoek + (rechts ? 90 : -90));
        var pot2 = [bij(r.hoek - (rechts ? 90 : -90)), tegen, r, bij(r.hoek + (rechts ? 45 : -45))].map(function(x){ return NAAR[x.id]; });
        uit.push(vr('Je kijkt naar ' + NAAR[r.id] + ' en draait een kwartslag naar ' + (rechts ? 'rechts' : 'links') + '. Welke kant kijk je nu op?', NAAR[na.id], pot2, 'Een kwartslag is 90 graden. Met de klok mee (rechtsom) gaat het van noord naar oost, zuid en west. Vanuit ' + r.naam + ' kom je zo bij ' + na.naam + '.', 'kaartlezen', hoofdR ? 1 : 2));
        if (!hoofdR) uit.push(vr('Waar staat de afkorting ' + r.id + ' voor bij de windrichtingen?', r.naam, R.filter(function(x){ return x.hoek % 90 !== 0; }).map(function(x){ return x.naam; }), r.id + ' is ' + r.naam + ': N is noord, O is oost, Z is zuid en W is west.', 'kaartlezen', 1));
      });
      function km(cm, sch){ return cm * sch / 100000; }
      function getal(x){ return nl(x, 3); }
      function naarEcht(sch, cm, n){
        var k = km(cm, sch);
        uit.push(vr('Een kaart heeft schaal 1 : ' + dz(sch) + '. Op de kaart is een afstand ' + nl(cm) + ' cm. Hoeveel kilometer is dat in het echt?', getal(k) + ' km', [getal(k * 10) + ' km', getal(k / 10) + ' km', getal(k * 100) + ' km'], nl(cm) + ' cm × ' + dz(sch) + ' = ' + dz(cm * sch) + ' cm in het echt. 1 km is 100.000 cm, dus dat is ' + getal(k) + ' km.', 'kaartlezen', n));
      }
      [10000, 50000, 100000].forEach(function(sch){ [2, 3, 4, 5].forEach(function(cm){ naarEcht(sch, cm, 1); }); });
      [25000, 200000, 500000].forEach(function(sch){ [2, 4, 6].forEach(function(cm){ naarEcht(sch, cm, 2); }); });
      [250000, 1000000, 2000000].forEach(function(sch){ [1.5, 2.5, 4.5].forEach(function(cm){
        var k = km(cm, sch);
        uit.push(vr('Op een kaart met schaal 1 : ' + dz(sch) + ' wil je een afstand van ' + getal(k) + ' km tekenen. Hoeveel centimeter is dat op de kaart?', nl(cm) + ' cm', [nl(cm * 10) + ' cm', nl(cm / 10, 2) + ' cm', nl(cm * 100) + ' cm'], getal(k) + ' km = ' + dz(Math.round(k * 100000)) + ' cm. Gedeeld door ' + dz(sch) + ' is dat ' + nl(cm) + ' cm op de kaart.', 'kaartlezen', 3));
      }); });
      [
        ['Op een kaart liggen de hoogtelijnen aan één kant van een heuvel heel dicht bij elkaar. Wat betekent dat?', 'daar is de helling steil', ['daar is de helling bijna vlak', 'daar ligt de top van de heuvel', 'daar stroomt een rivier'], 'Hoe dichter de hoogtelijnen bij elkaar, hoe sneller de hoogte verandert: daar is het steil.'],
        ['Wat verbindt een hoogtelijn op een kaart?', 'punten die even hoog liggen', ['punten die even ver van zee liggen', 'wegen van dezelfde soort', 'plaatsen met evenveel inwoners'], 'Een hoogtelijn loopt door alle punten die op dezelfde hoogte liggen.'],
        ['Op een kaart liggen de hoogtelijnen ver uit elkaar. Hoe is het land daar?', 'vrij vlak: de hoogte verandert langzaam', ['heel steil', 'onder water', 'precies op de top'], 'Ver uit elkaar betekent dat de hoogte maar langzaam verandert: het land is daar vrij vlak.'],
        ['Hoogtelijnen gaan om de 10 meter. De buitenste lijn is 10 meter, de binnenste 50 meter. Hoe hoog is de top ongeveer?', 'iets hoger dan 50 meter', ['precies 10 meter', 'tussen 10 en 20 meter', 'lager dan 10 meter'], 'De top ligt binnen de hoogste lijn, dus iets hoger dan 50 meter.']
      ].forEach(function(h){ uit.push(vr(h[0], h[1], h[2], h[3], 'kaartlezen', 2)); });
    }
    return uit.filter(Boolean);
  }

  /* ---------- biologie: erfelijkheid en voedselwebben ---------- */
  function bio(){
    var uit = [];
    var KR = window.KRUISEN_DATA;
    if (KR){
      var EIG = KR.EIG;
      /* de fenotypen zonder toevoeging tussen haakjes, en met een lidwoord waar dat hoort: "heeft een zwarte vacht", maar "heeft blauwe ogen" */
      function kaalF(f){ return f.replace(/ \([^)]*\)$/, ''); }
      function lw(f){ f = kaalF(f); return /^\S+ (vacht|stengel)$/.test(f) ? 'een ' + f : f; }
      function intro(e){ return hoofd(e.naam) + ': ' + e.letter + ' (' + kaalF(e.dom) + ') is dominant over ' + e.letter.toLowerCase() + ' (' + kaalF(e.rec) + ').'; }
      function net(e, g){ return g.split('').sort(function(x, y){ return x === e.letter ? -1 : y === e.letter ? 1 : 0; }).join(''); }
      function kinderen(e, g1, g2){ var k = []; [g1[0], g1[1]].forEach(function(a){ [g2[0], g2[1]].forEach(function(b){ k.push(net(e, a + b)); }); }); return k; }
      var PCT = ['0%', '25%', '50%', '75%', '100%'];
      EIG.forEach(function(e){
        var A = e.letter, a = A.toLowerCase(), D = lw(e.dom), R = lw(e.rec);
        [[A + a, A + a, true, 1], [A + a, a + a, true, 1], [A + a, A + a, false, 2], [A + A, a + a, false, 2], [A + A, A + a, true, 2]].forEach(function(k){
          var kids = kinderen(e, k[0], k[1]), dom = kids.filter(function(x){ return x.indexOf(A) >= 0; }).length, n = k[2] ? 4 - dom : dom, wat = k[2] ? R : D;
          uit.push(vr(intro(e) + ' De ouders zijn ' + k[0] + ' en ' + k[1] + '. Hoeveel procent van de nakomelingen heeft ' + wat + '?', (n * 25) + '%', PCT, 'Het kruisingsschema geeft ' + kids.join(', ') + '. ' + n + ' van de 4 hebben ' + wat + ', dus ' + (n * 25) + '%.', 'erfelijkheid', k[3]));
        });
        var PAREN = [A + a + ' × ' + A + a, A + a + ' × ' + a + a, A + A + ' × ' + a + a, A + A + ' × ' + A + a, a + a + ' × ' + a + a];
        [['de helft van de nakomelingen heeft ' + D + ', de rest ' + R, 1, 2, 'Er zijn nakomelingen met ' + R + ' (' + a + a + '), dus beide ouders hebben een ' + a + '. Half om half past bij ' + PAREN[1] + '.'],
         ['3 op de 4 nakomelingen hebben ' + D + ', 1 op de 4 ' + R, 0, 2, 'Er zijn nakomelingen met ' + R + ', dus beide ouders hebben een ' + a + '. De verhouding 3 : 1 past bij ' + PAREN[0] + '.'],
         ['alle nakomelingen hebben ' + D + ', maar één ouder heeft ' + R, 2, 3, 'De ouder met ' + R + ' is ' + a + a + '. Geen enkel kind heeft ' + R + ', dus de andere ouder geeft altijd een ' + A + ': ' + PAREN[2] + '.']
        ].forEach(function(s){
          uit.push(vr(intro(e) + ' ' + hoofd(s[0]) + '. Welke genotypen hebben de ouders?', PAREN[s[1]], PAREN.filter(function(p, i){ return i !== s[1] && i !== 3; }), s[3], 'erfelijkheid', s[2]));
        });
      });
      /* begrippen: bij de omschrijving, en bij een voorbeeld. Wat op elkaar lijkt, staat niet naast elkaar. */
      var BOTS = { recessief:['homozygoot', 'fenotype', 'genotype'], homozygoot:['genotype', 'allel'], allel:['genotype', 'heterozygoot', 'homozygoot'], drager:['heterozygoot', 'genotype', 'dominant'],
        geslachtschromosomen:['chromosoom'], chromosoom:['geslachtschromosomen', 'DNA'], DNA:['chromosoom', 'gen'], gen:['DNA', 'allel', 'chromosoom'], geslachtscel:['allel', 'bevruchting'], bevruchting:['geslachtscel'] };
      var ZONDER_VB = ['dominant', 'genotype', 'heterozygoot', 'fenotype'];
      function botst(x, y){ return (BOTS[x] || []).indexOf(y) >= 0 || (BOTS[y] || []).indexOf(x) >= 0; }
      KR.BEGRIPPEN.forEach(function(b, i){
        var n = b.hoog ? 3 : 1, pot = KR.BEGRIPPEN.filter(function(x){ return x !== b && !botst(b.b, x.b) && (!x.hoog || b.hoog); }).map(function(x){ return x.b; });
        uit.push(vr('Welk begrip past bij deze omschrijving: ' + b.u + '?', b.b, pot, hoofd(b.b) + ': ' + b.u + '.', 'erfelijkheid', n));
        if (ZONDER_VB.indexOf(b.b) >= 0) return;
        var e = EIG[i % EIG.length], vb = b.vb(e);
        uit.push(vr((b.vb.length ? intro(e) + ' ' : '') + 'Welk begrip hoort bij dit voorbeeld: ' + vb + '?', b.b, pot, hoofd(b.b) + ': ' + b.u + '. Voorbeeld: ' + vb + '.', 'erfelijkheid', b.hoog ? 3 : 2));
      });
    }
    var VW = window.VOEDSELWEB_DATA;
    if (VW){
      var ORG = VW.ORG, ECO = VW.ECO, OK = Object.keys(ORG);
      VW.BEGRIPPEN.forEach(function(b){
        var n = b.n.indexOf('bb') >= 0 ? 1 : b.n.indexOf('kgt') >= 0 ? 2 : 3;
        uit.push(vr(b.v, b.o[0], b.o.slice(1), b.u, 'voedselweb', n));
      });
      var ROL = { producent:'producent', herbivoor:'planteneter (herbivoor)', carnivoor:'vleeseter (carnivoor)', omnivoor:'alleseter (omnivoor)', afbreker:'afbreker' };
      /* producent, consument of afbreker: alle producenten en afbrekers, en om en om een consument */
      var c = 0;
      OK.forEach(function(id){
        var o = ORG[id], soort = o.rol === 'producent' || o.rol === 'afbreker' ? o.rol : 'consument';
        if (soort === 'consument' && c++ % 3) return;
        uit.push(vr('Is ' + o.e + ' een producent, een consument of een afbreker?', soort, ['producent', 'consument', 'afbreker'], soort === 'producent' ? hoofd(o.e) + ' maakt zelf voedsel met licht: een producent.' : soort === 'afbreker' ? hoofd(o.e) + ' breekt dode resten af: een afbreker.' : hoofd(o.e) + ' eet andere organismen: een consument.', 'voedselweb', 1));
      });
      /* herbivoor, carnivoor of omnivoor: alleen dieren waarbij dat duidelijk is */
      OK.forEach(function(id){
        var o = ORG[id]; if (o.twijfel || !/^(herbivoor|carnivoor|omnivoor)$/.test(o.rol)) return;
        uit.push(vr('Wat voor eter is ' + o.e + '?', ROL[o.rol], [ROL.herbivoor, ROL.carnivoor, ROL.omnivoor], hoofd(o.e) + ' is een ' + ROL[o.rol] + '. Een herbivoor eet planten, een carnivoor eet dieren, een omnivoor eet allebei.', 'voedselweb', 2));
      });
      /* wie eet wie: uit de ketens en de webben, een vraag per eter per gebied */
      var paren = [], gezien = {};
      VW.KETENS.forEach(function(k){ for (var i = 1; i < k.k.length; i++) paren.push([k.eco, k.k[i - 1], k.k[i]]); });
      VW.WEBBEN.forEach(function(w){ w.p.forEach(function(p){ paren.push([w.eco, p[0], p[1]]); }); });
            var TOP = OK.filter(function(id){ return ORG[id].rol === 'carnivoor' && !ORG[id].twijfel && !paren.some(function(p){ return p[1] === id; }) && paren.some(function(p){ return p[2] === id; }); });
      var PROD = OK.filter(function(id){ return ORG[id].rol === 'producent'; });
      var NL = { bos:1, weiland:1, sloot:1, noordzee:1 };
      paren.forEach(function(p){
        var eter = ORG[p[2]], sleutel = p[0] + p[2];
        if (gezien[sleutel] || eter.twijfel || (eter.rol !== 'carnivoor' && eter.rol !== 'herbivoor')) return;
        gezien[sleutel] = 1;
        var inEco = PROD.filter(function(id){ return paren.some(function(q){ return q[0] === p[0] && q[1] === id; }); });
        /* een planteneter eet geen roofdieren, een vleeseter geen planten: zo is elke afleider echt fout */
        var topEco = TOP.filter(function(id){ return id !== p[2] && paren.some(function(q){ return q[0] === p[0] && q[2] === id; }); });
        var mis = eter.rol === 'herbivoor' ? (topEco.length >= 3 ? topEco : TOP.filter(function(id){ return id !== p[2]; })) : (inEco.length >= 3 ? inEco : PROD);
        uit.push(vr('Wat eet ' + eter.e + ' in ' + ECO[p[0]] + '?', ORG[p[1]].n, mis.map(function(id){ return ORG[id].n; }), hoofd(eter.e) + ' is een ' + ROL[eter.rol] + ' en eet onder andere ' + ORG[p[1]].m + '.', 'voedselweb', NL[p[0]] ? 1 : 2));
      });
      /* de goede volgorde van een keten, en de orde van een schakel */
      var ORDE = ['producent', 'consument van de eerste orde', 'consument van de tweede orde', 'consument van de derde orde', 'consument van de vierde orde'];
      VW.KETENS.forEach(function(k, ki){
        var n = k.k.map(function(id){ return ORG[id].n; }), pijl = function(a){ return a.join(' → '); };
        var fout = [pijl(n.slice().reverse()), pijl(n.slice(1).concat(n.slice(0, 1))), pijl([n[1], n[0]].concat(n.slice(2))), pijl(n.slice(0, -2).concat([n[n.length - 1], n[n.length - 2]]))];
        uit.push(vr('Welke rij is een goede voedselketen uit ' + ECO[k.eco] + '?', pijl(n), fout, 'De producent (' + n[0] + ') staat vooraan; de pijl wijst steeds naar wie eet.', 'voedselweb', n.length > 4 ? 3 : 2));
        var idx = 2 + ki % (n.length - 2);
        uit.push(vr('In de voedselketen ' + pijl(n) + ': wat is ' + ORG[k.k[idx]].e + '?', ORDE[idx], ORDE.slice(1), hoofd(ORG[k.k[0]].e) + ' is de producent. ' + k.k.slice(1).map(function(id, i){ return (i ? ORG[id].e : hoofd(ORG[id].e)) + ' is ' + ORDE[i + 1]; }).join(', ') + '.', 'voedselweb', 3));
      });
    }
    return uit.filter(Boolean);
  }

  /* ---------- economie: vraag en aanbod ---------- */
  function eco(){
    var uit = [], D = window.VRAAGAANBOD_DATA;
    if (!D) return uit;
    begripVragen(uit, D.BEGRIPPEN.map(function(b){ return { b: b.b, u: b.u, n: b.hv ? 3 : 1 }; }), 'vraag en aanbod', {
      vraag:['vraaglijn'], aanbod:['aanbodlijn'], evenwichtsprijs:['evenwichtshoeveelheid', 'marktmechanisme'], omzet:['winst', 'afzet'], tekort:['schaarste'], concurrentie:['monopolie'] });
    var PRIJS = { vraag: { rechts:'stijgt', links:'daalt' }, aanbod: { rechts:'daalt', links:'stijgt' } };
    var LIJN = ['de vraaglijn schuift naar rechts', 'de vraaglijn schuift naar links', 'de aanbodlijn schuift naar rechts', 'de aanbodlijn schuift naar links'];
    D.GEBEURTENISSEN.forEach(function(g){
      uit.push(vr(g.t + ' Wat gebeurt er met de prijs van ' + g.product + '?', 'de prijs ' + PRIJS[g.lijn][g.kant], ['de prijs stijgt', 'de prijs daalt', 'de prijs blijft gelijk'], g.uit, 'vraag en aanbod', 1));
      uit.push(vr(g.t + ' Wat gebeurt er op de markt voor ' + g.product + '?', 'de ' + g.lijn + 'lijn schuift naar ' + g.kant, LIJN, g.uit, 'vraag en aanbod', 2));
    });
    /* tekort, overschot of evenwicht bij een prijs */
    var MARKT = [['ijsjes', 3, 60, 40], ['broodjes', 2, 80, 30], ['concertkaartjes', 8, 20, 50], ['aardbeien', 4, 50, 50], ['T-shirts', 7, 30, 70], ['flesjes water', 1, 90, 20], ['tweedehands fietsen', 6, 40, 60], ['schoolagenda’s', 5, 45, 45], ['ijsjes', 6, 30, 80], ['broodjes', 5, 40, 40], ['aardbeien', 2, 70, 40], ['T-shirts', 3, 60, 30], ['concertkaartjes', 4, 70, 20], ['flesjes water', 5, 30, 55]];
    var SOORT = ['een tekort: er wordt meer gevraagd dan aangeboden', 'een overschot: er wordt meer aangeboden dan gevraagd', 'evenwicht: vraag en aanbod zijn gelijk'];
    MARKT.forEach(function(m){
      var p = '€ ' + m[1] + ',00', s = m[2] > m[3] ? 0 : m[2] < m[3] ? 1 : 2, d = Math.abs(m[2] - m[3]);
      var u = 'Bij ' + p + ' is de vraag ' + m[2] + ' en het aanbod ' + m[3] + '. ' + (s === 0 ? 'Er is een tekort van ' + d + ': de prijs is te laag en zal stijgen.' : s === 1 ? 'Er is een overschot van ' + d + ': de prijs is te hoog en zal dalen.' : 'Vraag en aanbod zijn gelijk: dit is de evenwichtsprijs.');
      uit.push(vr('Bij een prijs van ' + p + ' willen kopers ' + m[2] + ' ' + m[0] + ' kopen en bieden verkopers er ' + m[3] + ' aan. Wat is er op de markt?', SOORT[s], SOORT, u, 'vraag en aanbod', 1));
      if (s < 2) uit.push(vr('De vraag naar ' + m[0] + ' is ' + m[2] + ' stuks en het aanbod is ' + m[3] + ' stuks bij een prijs van ' + p + '. Hoe groot is het tekort of overschot?', (s === 0 ? 'een tekort van ' : 'een overschot van ') + d + ' stuks', [(s === 0 ? 'een overschot van ' : 'een tekort van ') + d + ' stuks', (s === 0 ? 'een tekort van ' : 'een overschot van ') + (m[2] + m[3]) + ' stuks', (s === 0 ? 'een overschot van ' : 'een tekort van ') + (m[2] + m[3]) + ' stuks'], u, 'vraag en aanbod', 2));
    });
    [['Er is een tekort op de markt. Wat gebeurt er meestal met de prijs?', 'die stijgt, tot vraag en aanbod gelijk zijn', ['die daalt, tot vraag en aanbod gelijk zijn', 'die blijft altijd gelijk', 'die wordt door de kopers vastgesteld'], 'Bij een tekort willen kopers meer dan er is. Verkopers kunnen dan meer vragen: de prijs stijgt tot het evenwicht.'],
     ['Er is een overschot op de markt. Wat gebeurt er meestal met de prijs?', 'die daalt, tot vraag en aanbod gelijk zijn', ['die stijgt, tot vraag en aanbod gelijk zijn', 'die blijft altijd gelijk', 'die wordt door de overheid verhoogd'], 'Bij een overschot blijven verkopers met spullen zitten. Ze verlagen de prijs tot het evenwicht.'],
     ['Hoe loopt de vraaglijn in een grafiek met de prijs omhoog en de hoeveelheid opzij?', 'dalend: hoe lager de prijs, hoe meer kopers willen', ['stijgend: hoe hoger de prijs, hoe meer kopers willen', 'recht omhoog', 'plat, precies horizontaal'], 'Bij een lage prijs willen meer mensen kopen, dus de vraaglijn daalt.'],
     ['Hoe loopt de aanbodlijn in een grafiek met de prijs omhoog en de hoeveelheid opzij?', 'stijgend: hoe hoger de prijs, hoe meer verkopers aanbieden', ['dalend: hoe lager de prijs, hoe meer verkopers aanbieden', 'recht omhoog', 'plat, precies horizontaal'], 'Bij een hoge prijs is verkopen aantrekkelijk, dus de aanbodlijn stijgt.']
    ].forEach(function(h){ uit.push(vr(h[0], h[1], h[2], h[3], 'vraag en aanbod', 1)); });
    return uit.filter(Boolean);
  }

  var VAK = {
    ned: { bestanden:['woordenschat-opgaven.js', 'signaalwoorden-opgaven.js', 'register-opgaven.js'], maak: ned },
    eng: { bestanden:['phrasal-opgaven.js', 'translate-opgaven.js'], maak: eng },
    ges: { bestanden:['oorzaakgevolg-opgaven.js', 'wiebenik-opgaven.js'], maak: ges },
    wis: { bestanden:[], maak: wis },
    burg: { bestanden:['democratie-opgaven.js', 'partijen-opgaven.js', 'verkiezingen-opgaven.js'], maak: burg },
    aard: { bestanden:['bevolkingspiramide-opgaven.js', 'klimaatgrafiek-opgaven.js', 'kaartvaardigheid-opgaven.js'], maak: aard },
    bio: { bestanden:['kruisen-opgaven.js', 'voedselweb-opgaven.js'], maak: bio },
    eco: { bestanden:['vraagenaanbod-opgaven.js'], maak: eco }
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
