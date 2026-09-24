/* Werkbladen uit drie spellen: de Tekstdetective, de Breukenbakker en het
   DHTE-schema. De opgaven komen uit dezelfde bestanden als het spel
   (tekstdetective-opgaven.js, breukenbakker-opgaven.js, dhte-opgaven.js), dus
   wat de leerling op papier maakt is hetzelfde als op het scherm.

   Elk spel hier heeft:
     naam, aantallen, standaard, aantalNaam   voor de keuzes bovenaan
     delenKop, delenTip, delen(aan)           het blok met eigen keuzes
     eigenNiveau                              true als het niveau van de vragenbank niet telt
     lees(vak, rang)                          de keuzes uit dat blok
     maak(keuze, n)                           een lijst opgaven, of { fout }
     teken(w)                                 { titel, sub, klasse, vragen, antwoorden } als html
   werkblad.html doet de rest: het papier, printen en het adres. */
var SPELBLAD = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  function vink(naam, waarde, tekst, aan){ return '<label><input type="checkbox" name="' + naam + '" value="' + schoon(waarde) + '"' + (aan ? ' checked' : '') + '> ' + schoon(tekst) + '</label>'; }
  function keus(naam, waarde, tekst, aan){ return '<label><input type="radio" name="' + naam + '" value="' + schoon(waarde) + '"' + (aan ? ' checked' : '') + '> ' + schoon(tekst) + '</label>'; }
  function kop(t){ return '<p class="kop">' + schoon(t) + '</p>'; }
  function waarden(el, naam){ return [].map.call(el.querySelectorAll('input[name="' + naam + '"]:checked'), function(x){ return x.value; }); }
  /* de vier niveaus van de vragenbank naar de drie van deze spellen */
  function niv3(rang){ return rang <= 1 ? 1 : rang === 2 ? 2 : 3; }
  var ABCD = ['a', 'b', 'c', 'd'];
  function opties(lijst){ return '<div class="opties">' + lijst.map(function(t, i){ return '<span><b>' + ABCD[i] + '</b>' + schoon(t) + '</span>'; }).join('') + '</div>'; }

  /* ---------- Tekstdetective ---------- */
  var T = window.TEKSTOPGAVEN;
  var tekst = T && {
    naam:'Tekstdetective: alinea’s lezen',
    aantallen:[4, 6, 8, 10], standaard:6, aantalNaam:'Aantal alinea’s',
    delenKop:'Wat komt erin',
    delenTip:'Bij elke alinea de vragen die je aanvinkt. Kies je geen soort tekst, dan komen alle soorten aan bod.',
    delen:function(aan){
      var vr = ['hoofd', 'sein', 'doel'].filter(function(x){ return aan.indexOf(x) >= 0; });
      var alle = !vr.length;
      return kop('Vragen bij elke alinea') +
        vink('vr', 'hoofd', 'Wat is de hoofdgedachte?', alle || vr.indexOf('hoofd') >= 0) +
        vink('vr', 'sein', 'Onderstreep het signaalwoord en noem het verband', alle || vr.indexOf('sein') >= 0) +
        vink('vr', 'doel', 'Wat wil de schrijver?', alle || vr.indexOf('doel') >= 0) +
        kop('Leerjaar') + T.LEERJAREN.map(function(l, i){ return keus('lj', l.id, l.naam, aan.indexOf('34') >= 0 ? l.id === '34' : i === 0); }).join('') +
        kop('Soort tekst') + T.SOORTEN.map(function(s){ return vink('soort', s.id, s.naam, aan.indexOf(s.id) >= 0); }).join('');
    },
    lees:function(el, rang){ return { vr:waarden(el, 'vr'), lj:waarden(el, 'lj')[0] || '12', soorten:waarden(el, 'soort'), niv:niv3(rang) }; },
    maak:function(o, n){
      if (!o.vr.length) return { fout:'Vink minstens een vraag aan die bij elke alinea komt.' };
      function past(a, onder){ return a.n <= o.niv && a.n >= onder && (!o.soorten.length || o.soorten.indexOf(a.s) >= 0) && (o.lj === '34' || a.lj !== 3); }
      /* eerst wat precies bij het niveau past, is dat te weinig, dan ook lager */
      var pot = T.ALINEAS.filter(function(a){ return past(a, o.niv); });
      if (pot.length < n) pot = T.ALINEAS.filter(function(a){ return past(a, 0); });
      return schud(pot).slice(0, n).map(function(a){
        var goedDoel = a.d || T.DOEL_VAN_SOORT[a.s] || 'info';
        return {
          a:a,
          hoofd:schud(a.h.map(function(t, i){ return { t:t, goed:i + 1 === a.g }; })),
          doel:goedDoel,
          doelen:schud(schud(T.DOELEN.filter(function(d){ return d.id !== goedDoel; })).slice(0, 3).concat(T.DOELEN.filter(function(d){ return d.id === goedDoel; })))
        };
      });
    },
    teken:function(w){
      var o = w.keuze;
      function soortNaam(a){ return (T.SOORTEN.filter(function(s){ return s.id === a.s; })[0] || {}).naam || ''; }
      var vragen = w.items.map(function(q){
        var h = '<span class="odkop">' + schoon(soortNaam(q.a)) + '</span><p class="alinea">' + schoon(q.a.t.replace(/\[|\]/g, '')) + '</p>';
        if (o.vr.indexOf('hoofd') >= 0) h += '<div class="deel"><b>Wat is de hoofdgedachte van deze alinea?</b>' + opties(q.hoofd.map(function(x){ return x.t; })) + '</div>';
        if (o.vr.indexOf('sein') >= 0) h += '<div class="deel"><b>Onderstreep het signaalwoord. Welk verband geeft het aan?</b><span class="lijn" aria-hidden="true"></span></div>';
        if (o.vr.indexOf('doel') >= 0) h += '<div class="deel"><b>Wat wil de schrijver met deze tekst?</b>' + opties(q.doelen.map(function(d){ return d.naam; })) + '</div>';
        return '<li>' + h + '</li>';
      }).join('');
      var antwoorden = w.items.map(function(q){
        var r = [];
        if (o.vr.indexOf('hoofd') >= 0){
          var i = q.hoofd.map(function(x){ return x.goed; }).indexOf(true);
          r.push('<span class="goed">Hoofdgedachte: ' + ABCD[i] + '. ' + schoon(q.hoofd[i].t) + '</span>' + (w.uitleg && q.a.u ? '<small>' + schoon(q.a.u) + '</small>' : ''));
        }
        if (o.vr.indexOf('sein') >= 0){
          var vb = T.VERBANDEN.filter(function(x){ return x.id === q.a.v; })[0] || { naam:'', uit:'' };
          r.push('<span class="goed">Signaalwoord: ' + schoon(q.a.t.split(/\[|\]/)[1]) + ', ' + schoon(vb.naam) + '</span>' + (w.uitleg ? '<small>' + schoon(vb.uit.charAt(0).toUpperCase() + vb.uit.slice(1)) + '.</small>' : ''));
        }
        if (o.vr.indexOf('doel') >= 0){
          var d = q.doelen.map(function(x){ return x.id; }).indexOf(q.doel);
          r.push('<span class="goed">Schrijfdoel: ' + ABCD[d] + '. ' + schoon(q.doelen[d].naam) + '</span>' + (w.uitleg ? '<small>' + schoon(q.doelen[d].uit.charAt(0).toUpperCase() + q.doelen[d].uit.slice(1)) + '.</small>' : ''));
        }
        return '<li>' + r.join('<br>') + '</li>';
      }).join('');
      var lj = (T.LEERJAREN.filter(function(l){ return l.id === o.lj; })[0] || {}).naam || '';
      return { titel:'Werkblad Tekstdetective', sub:w.niveauNaam + ' · ' + lj + ' · ' + w.items.length + ' alinea’s', klasse:'', vragen:vragen, antwoorden:antwoorden };
    }
  };

  /* ---------- Breukenbakker ---------- */
  var B = window.BREUKOPGAVEN;
  /* Een taart voor op papier: grijze stukken zijn er nog, witte zijn weg. Geen
     kleuren van het scherm, want die verdwijnen op een zwart-witprinter. */
  function taart(n, vol, r){
    r = r || 32;
    var C = r + 2, d = '';
    if (n === 1) d = '<circle cx="' + C + '" cy="' + C + '" r="' + r + '" fill="' + (vol ? '#c3c9da' : '#fff') + '" stroke="#14224C" stroke-width="1.6"/>';
    else for (var i = 0; i < n; i++){
      var a1 = -Math.PI / 2 + i * 2 * Math.PI / n, a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n;
      d += '<path d="M' + C + ' ' + C + ' L' + (C + r * Math.cos(a1)).toFixed(2) + ' ' + (C + r * Math.sin(a1)).toFixed(2) +
        ' A' + r + ' ' + r + ' 0 0 1 ' + (C + r * Math.cos(a2)).toFixed(2) + ' ' + (C + r * Math.sin(a2)).toFixed(2) +
        ' Z" fill="' + (i < vol ? '#c3c9da' : '#fff') + '" stroke="#14224C" stroke-width="1.6" stroke-linejoin="round"/>';
    }
    return '<svg class="taartje" viewBox="0 0 ' + 2 * C + ' ' + 2 * C + '" width="' + 2 * C + '" height="' + 2 * C + '" role="img" aria-label="taart in ' + n + ' stukken, ' + vol + ' grijs">' + d + '</svg>';
  }
  function plaat(q){
    if (q.twee) return '<div class="plaat">' + q.twee.map(function(b, i){ return '<figure>' + taart(b.n, b.t) + '<figcaption>' + 'AB'.charAt(i) + ': ' + B.br(b) + '</figcaption></figure>'; }).join('') + '</div>';
    if (q.termen) return '<div class="plaat"><figure>' + taart(q.termen[0].n, q.termen[0].vol) + '</figure><span class="plus">+</span><figure>' + taart(q.termen[1].n, q.termen[1].vol) + '</figure></div>';
    var h = '';
    for (var i = 0; i < (q.taart.heel || 0); i++) h += '<figure>' + taart(1, 1) + '</figure>';
    return '<div class="plaat">' + h + '<figure>' + taart(q.taart.n, q.taart.vol) + '</figure></div>';
  }
  function antwoordVak(q){
    if (q.keuze) return '<p class="antwregel">A of B: <span class="lijn kort" aria-hidden="true"></span></p>';
    if (q.eenheid === 'breuk') return '<p class="antwregel">Antwoord: <span class="breukvak" aria-hidden="true"><span></span><span></span><span></span></span></p>';
    return '<p class="antwregel">Antwoord: <span class="lijn kort" aria-hidden="true"></span>' + (q.eenheid === 'procent' ? ' %' : '') + '</p>';
  }
  function antwoordTekst(q){
    if (q.keuze) return 'AB'.charAt(q.antwoord - 1) + ': ' + q.keuze[q.antwoord - 1];
    if (q.eenheid === 'breuk'){
      var ook = (q.ook || []).map(B.br).filter(function(x, i, l){ return x !== B.br(q.antwoord) && l.indexOf(x) === i; });
      return B.br(q.antwoord) + (ook.length ? ' (of ' + ook.join(', ') + ')' : '');
    }
    return String(q.antwoord.t).replace('.', ',') + (q.eenheid === 'procent' ? '%' : '');
  }
  var breuk = B && {
    naam:'Breukenbakker: breuken',
    aantallen:[8, 12, 16, 20], standaard:12, aantalNaam:'Aantal sommen',
    delenKop:'Soorten sommen',
    delenTip:'Kies je niets, dan komen alle soorten die bij het niveau passen aan bod. De taarten worden grijs geprint: grijs is wat er nog is.',
    delen:function(aan){
      return B.SOORTEN.map(function(s){ return vink('soort', s.id, s.naam + (s.niv ? ' (vanaf ' + B.NIVEAUS[s.niv - 1].naam + ')' : ''), aan.indexOf(s.id) >= 0); }).join('');
    },
    lees:function(el, rang){ return { soorten:waarden(el, 'soort'), niv:niv3(rang) }; },
    maak:function(o, n){
      var mag = B.SOORTEN.filter(function(s){ return (!s.niv || s.niv <= o.niv) && (!o.soorten.length || o.soorten.indexOf(s.id) >= 0); });
      if (!mag.length) return { fout:'Die soorten horen bij een hoger niveau. Kies een hoger niveau of een andere soort.' };
      /* om de beurt een soort, zodat er van alles wat in zit */
      var uit = [], gezien = {};
      for (var p = 0; uit.length < n && p < n * 40; p++){
        var s = mag[p % mag.length], q = s.maak(o.niv);
        if (gezien[q.vraag]) continue;
        gezien[q.vraag] = true; q.soortNaam = s.naam; uit.push(q);
      }
      return schud(uit);
    },
    teken:function(w){
      var vragen = w.items.map(function(q){
        return '<li><span class="odkop">' + schoon(q.soortNaam) + '</span>' + plaat(q) + '<span class="vr">' + schoon(q.vraag) + '</span>' + antwoordVak(q) + '</li>';
      }).join('');
      var antwoorden = w.items.map(function(q){
        return '<li><span class="goed">' + schoon(antwoordTekst(q)) + '</span>' + (w.uitleg && q.hoe ? '<small>' + schoon(q.hoe) + '</small>' : '') + '</li>';
      }).join('');
      return { titel:'Werkblad Breukenbakker', sub:w.niveauNaam + ' · ' + w.items.length + ' sommen', klasse:'breuken', intro:'In de plaatjes is grijs wat er van de taart is, en wit wat er al weg is.', vragen:vragen, antwoorden:antwoorden };
    }
  };

  /* ---------- DHTE-schema ---------- */
  var D = window.DHTEOPGAVEN;
  /* Een som in het schema. Met vol staat het antwoord erin, en ook wat je
     onthoudt of leent, precies zoals het spel het voordoet. */
  function schema(q, n, vol){
    var kols = [], c;
    for (c = 0; c < n; c++) kols.push(c);
    var ant = {}, hulp = {};
    q.stappen.forEach(function(s){ if (s.soort === 'antwoord') ant[s.kol] = s.waarde; else hulp[s.kol] = s.waarde; });
    var h = '<table class="schema"><tr><th class="op"></th>' + kols.map(function(k){ return '<th>' + D.LETTERS[D.plaats(k, n)] + '</th>'; }).join('') + '</tr>';
    if (q.od === 'invullen'){
      h += '<tr class="uitk"><td class="op"></td>' + kols.map(function(k){ return '<td>' + (vol ? ant[k] : '') + '</td>'; }).join('') + '</tr>';
      return h + '</table>';
    }
    var ca = D.cijfers(q.a, n), cb = D.cijfers(q.b, n);
    h += '<tr class="hulp"><td class="op"></td>' + kols.map(function(k){ return '<td>' + (vol && hulp[k] != null ? hulp[k] : '') + '</td>'; }).join('') + '</tr>';
    h += '<tr><td class="op"></td>' + kols.map(function(k){ return '<td>' + ca[k] + '</td>'; }).join('') + '</tr>';
    h += '<tr><td class="op">' + (q.od === 'optellen' ? '+' : '−') + '</td>' + kols.map(function(k){ return '<td>' + cb[k] + '</td>'; }).join('') + '</tr>';
    h += '<tr class="streep"><td class="op"></td><td colspan="' + n + '"></td></tr>';
    h += '<tr class="uitk"><td class="op"></td>' + kols.map(function(k){ return '<td>' + (vol ? ant[k] : '') + '</td>'; }).join('') + '</tr>';
    return h + '</table>';
  }
  var dhte = D && {
    naam:'DHTE-schema: optellen en aftrekken',
    eigenNiveau:true,
    aantallen:[6, 9, 12, 15], standaard:9, aantalNaam:'Aantal sommen',
    delenKop:'Getallen en sommen',
    delenTip:'Kies je meer soorten sommen, dan wisselen ze elkaar af. In de gestippelde vakjes zet de leerling wat hij onthoudt of leent.',
    delen:function(aan){
      var nv = D.NIVEAUS.filter(function(x){ return aan.indexOf(x.id) >= 0; })[0] || D.NIVEAUS[1];
      var ods = D.ONDERDELEN.filter(function(o){ return aan.indexOf(o.id) >= 0; }).map(function(o){ return o.id; });
      if (!ods.length) ods = ['optellen', 'aftrekken'];
      return kop('Getallen') + D.NIVEAUS.map(function(x){ return keus('niv', x.id, x.naam, x === nv); }).join('') +
        kop('Sommen') + D.ONDERDELEN.map(function(o){ return vink('od', o.id, o.naam + (o.id === 'invullen' ? ': een getal in het schema zetten' : o.id === 'optellen' ? ' met onthouden' : ' met lenen'), ods.indexOf(o.id) >= 0); }).join('');
    },
    lees:function(el){ return { niv:waarden(el, 'niv')[0] || 'hte', ods:waarden(el, 'od') }; },
    maak:function(o, n){
      if (!o.ods.length) return { fout:'Vink minstens een soort som aan.' };
      var nv = D.NIVEAUS.filter(function(x){ return x.id === o.niv; })[0] || D.NIVEAUS[1], k = nv.kolommen;
      var uit = [], gezien = {};
      for (var p = 0; uit.length < n && p < n * 40; p++){
        var od = o.ods[p % o.ods.length], q;
        if (od === 'invullen'){ var g = D.getalVan(k); q = { od:od, getal:g, stappen:D.stappenInvullen(g, k) }; }
        else {
          var s = od === 'optellen' ? D.somOptellen(k) : D.somAftrekken(k);
          var st = od === 'optellen' ? D.stappenOptellen(s.a, s.b, k) : D.stappenAftrekken(s.a, s.b, k);
          if (!st) continue;
          q = { od:od, a:s.a, b:s.b, stappen:st };
        }
        var sl = od + (q.getal || q.a + '|' + q.b);
        if (gezien[sl]) continue;
        gezien[sl] = true; uit.push(q);
      }
      return uit;
    },
    teken:function(w){
      var nv = D.NIVEAUS.filter(function(x){ return x.id === w.keuze.niv; })[0] || D.NIVEAUS[1], k = nv.kolommen;
      function naam(od){ return (D.ONDERDELEN.filter(function(o){ return o.id === od; })[0] || {}).naam || ''; }
      var vragen = w.items.map(function(q){
        return '<li><span class="odkop">' + schoon(naam(q.od)) + '</span>' +
          (q.od === 'invullen' ? '<span class="vr">Zet ' + q.getal + ' in het schema.</span>' : '<span class="vr">' + q.a + (q.od === 'optellen' ? ' + ' : ' − ') + q.b + '</span>') +
          schema(q, k, false) + '</li>';
      }).join('');
      var antwoorden = w.items.map(function(q){
        var uitkomst = q.od === 'invullen' ? q.getal : q.od === 'optellen' ? q.a + q.b : q.a - q.b;
        return '<li><span class="goed">' + (q.od === 'invullen' ? q.getal : q.a + (q.od === 'optellen' ? ' + ' : ' − ') + q.b + ' = ' + uitkomst) + '</span>' + schema(q, k, true) + '</li>';
      }).join('');
      var ods = w.keuze.ods.map(naam).join(', ').toLowerCase();
      return { titel:'Werkblad DHTE-schema', sub:nv.naam + ' · ' + ods + ' · ' + w.items.length + ' sommen', klasse:'sommen', vragen:vragen, antwoorden:antwoorden };
    }
  };

  var uit = {};
  if (tekst) uit.tekstdetective = tekst;
  if (breuk) uit.breukenbakker = breuk;
  if (dhte) uit.dhte = dhte;
  return uit;
})();
