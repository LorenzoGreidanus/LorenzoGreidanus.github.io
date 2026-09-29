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

/* ---------- Open vragen op papier ----------
   Een meerkeuzevraag die open wordt, verliest zijn keuzes. Bij veel vragen
   weet een leerling dan niet meer wat hij moet opschrijven: "Welke zin is
   goed?" zonder zinnen, "Ik ___ het antwoord al." zonder het werkwoord, of
   "Welk woord is een bijvoeglijk naamwoord?" zonder woorden. OPENVRAAG.vorm
   kijkt per vraag wat er op papier moet staan:
     open      een lijn, soms met een korte opdracht (opdr) of een
               duidelijker vraag (v)
     kies      een lijn met "Kies uit:" en de korte keuzes erboven; de
               leerling schrijft het goede woord op (een gat in een zin)
     omcirkel  de keuzes blijven staan met hun letters (lange keuzes, zoals
               hele zinnen); de leerling omcirkelt de goede
   werkblad.html gebruikt dit voor de vragenbank, werkblad-vakspellen.js voor
   de meerkeuzevragen van de vakspellen. */
var OPENVRAAG = (function(){
  'use strict';
  function kaal(t){ return String(t == null ? '' : t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(); }
  function klein(t){ return kaal(t).toLowerCase().replace(/[’‘'"“”.,!?;:()\/]/g, ' ').replace(/\s+/g, ' ').trim(); }
  /* het woord zelf, zonder lidwoord of voorzetsel ervoor */
  function kern(t){ return klein(t).replace(/^(in |op |met |naar |bij )?(de|het|een|to|the|a|an) /, ''); }
  function afstand(a, b){
    var m = a.length, n = b.length, p = [], c, i, j;
    if (!m || !n) return m || n;
    for (j = 0; j <= n; j++) p[j] = j;
    for (i = 1; i <= m; i++){ c = [i]; for (j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; }
    return p[n];
  }
  function lijkt(a, b){ return 1 - afstand(a, b) / Math.max(a.length, b.length, 1); }
  function staatIn(tekst, woord){ var w = klein(woord); return !!w && (' ' + klein(tekst) + ' ').indexOf(' ' + w + ' ') >= 0; }
  var KLEINTJES = /^(de|het|een|en|of|in|op|aan|van|met|voor|naar|bij|dat|die|wat|wie|hoe|is|zijn|je|jij|hij|zij|ze|wij|we|ik|the|and|to|on|at|are|you|he|she|it|they|welk|welke|niet|geen|als|dan|ook|nog|al|er|om|te|zo)$/;
  /* staat het woord, of een vorm ervan, al in de vraag? hond bij honden, ontwikkelen bij ontwikkeling */
  function lijktIn(tekst, antw){
    var a = kern(antw);
    if (!a) return false;
    return klein(tekst).split(' ').some(function(x){
      if (x.length < 3 || KLEINTJES.test(x)) return false;
      return lijkt(x, a) >= 0.6 || (x.length >= 4 && a.indexOf(x) >= 0) || a.indexOf(x) === 0 || (a.length >= 4 && x.indexOf(a) >= 0) ||
        (x.length >= 4 && a.length >= 4 && x.slice(0, 4) === a.slice(0, 4)) || (x.slice(0, 2) === a.slice(0, 2) && lijkt(x, a) >= 0.4);
    });
  }
  /* Een woord tussen haakjes dat zegt welk woord in het gat hoort: (lopen),
     (leggen, verleden tijd). "(verleden tijd)" alleen zegt dat niet. */
  var GRAMMATICA = /^(verleden|tijd|tegenwoordige|toekomende|voltooid|voltooide|deelwoord|meervoud|enkelvoud|persoonsvorm|infinitief|hele|werkwoord|vorm|zin|met|en|of|de|het|een|past|present|simple|continuous|perfect|tense|form)$/i;
  function haakjesWoord(v){
    return (String(v).match(/\(([^)]*)\)/g) || []).some(function(h){
      return klein(h).split(' ').some(function(w){ return w.length >= 3 && !GRAMMATICA.test(w); });
    });
  }
  var GAT = /_{2,}|…(?=\s*\S)|\.\.\.(?=\s*\S)/;
  var EINDGAT = /(…|\.\.\.)\s*$/;
  /* go, ___, gone: de andere vormen staan erbij */
  var RIJTJE = /^[\w' -]+, (_{2,}|[\w' -]+), (_{2,}|[\w' -]+)\.?$/;
  var OPDRACHT = /(^|[.!?:]\s+)(vul|schrijf|geef|noem|bereken|vertaal|zet|maak|kies|reken|los|herschrijf|verbeter|omcirkel|leg uit|beschrijf|verklaar|lees|tel|teken|rond|vereenvoudig|werk|splits|ontbind|bepaal|zoek|onderstreep|fill|write|give|choose|complete|translate|rewrite|put|correct)\b/i;
  var VAN_WOORD = /\b(meervoud|enkelvoud|verkleinwoord|verleden tijd|voltooid deelwoord|vergrotende trap|overtreffende trap|tegenovergestelde|synoniem|zelfstandig naamwoord|werkwoord|bijvoeglijk naamwoord) (van|bij)\s+\S/i;
  var VERTALEN = /^(hoe zeg je|wat betekent|vertaal|valse vriend|what does|what is .* in (dutch|english))\b/i;

  /* gaat de vraag over de keuzes zelf? dan kan hij zonder keuzes niet */
  function overKeuzes(v, vraag){
    return /\b(van deze|van de volgende|hieronder|onderstaande|of these|of the following)\b|hoort (er )?niet bij|\bdeze (dingen|woorden|begrippen|gebeurtenissen|personen|getallen|dieren|landen|steden|stoffen|mogelijkheden|antwoorden|zinnen)\b/i.test(v) ||
      (/\b(welke?|which)\b[^?]*\b(niet|geen|not|except)\b(?!-)/i.test(vraag) && !/\b(waarom|wat betekent|why)\b/i.test(vraag)) ||
      /\bwat (is|zijn|was|waren) geen\b/i.test(vraag) ||
      /* "Welk woord is een lidwoord?" zonder zin erbij: welk woord dan? */
      (/\bwelke? (twee )?(woord|woorden) (is|zijn) (een|de|het)\b/i.test(v) && !/:\s*\S/.test(v)) ||
      /\b(welke?|in welke|which|what)\b[^?]*(\b(is|zijn|staat|staan|wordt|worden|geschreven|gespeld)\s+(goed|juist|fout|onjuist|correct|waar)\b|\b(goede|juiste|foute|correcte|klopt|kloppen|right|wrong|incorrect|correct|true|false)\b|\b(goed|juist|fout)\s*$)/i.test(vraag) ||
      /\bwelke? bewering(en)? (is|zijn) waar\b/i.test(vraag) ||
      /\b(welke?|which) (getal|getallen|breuk|breuken|verhouding|kaart|schaal|number|fraction)\b[^?]*\b(grootst|kleinst|hoogst|laagst|meeste|minste|biggest|smallest|largest|highest|lowest)\b/i.test(vraag) ||
      /\b(welke?|in welke|which) (zin|zinnen|versie|vraag|uitroep|schrijfwijze|spelling|vervolg|reeks|rij|combinatie|bewering|beweringen|uitspraak|reactie|samenvatting|conclusie|sentence|sentences|version|option|answer|translation|reply|response|question)\b/i.test(vraag) ||
      /^(wat is (goed|beter|juist|fout|correct)(?! aan)|kies|choose|pick)\b/i.test(v) || /\b(kies|choose) (de|het|the) (goede|juiste|correct|right)\b/i.test(v) ||
      /^waar (hoort|staat|moet) (de|het|een) (komma|punt|dubbele punt|vraagteken|uitroepteken|puntkomma|aanhalingstekens?|apostrof|hoofdletter|streepje|trema|koppelteken)\b[^:]*\?\s*$/i.test(v);
  }
  /* zijn de keuzes spellingen of vormen van hetzelfde woord? loopt, lopen, lopend */
  function varianten(o, g){
    var a = kern(o[g]), rest = o.filter(function(x, i){ return i !== g; }).map(kern);
    /* een woord, geen omschrijving: "in Normandië" en "die daalt" zijn geen spellingen van elkaar */
    if (!rest.length || a.length < 3 || /\d/.test(a) || a.indexOf(' ') >= 0) return false;
    return rest.filter(function(x){ return lijkt(a, x) >= 0.7 || (a.length >= 4 && x.slice(0, 4) === a.slice(0, 4)); }).length >= Math.max(1, rest.length - 1);
  }
  /* kort genoeg om als rijtje achter "Kies uit:" te zetten? */
  function kort(o){ return o.every(function(x){ var t = kaal(x); return t.length <= 28 && t.split(' ').length <= 3 && !/[.?!;:]/.test(t); }); }

  /* "Kies de goede afkorting." zonder keuzes wordt "Schrijf de goede afkorting op."
     Werkt ook op html (werkblad-vakspellen.js): het stukje staat nooit over een tag heen. */
  function schrijfOp(t){
    return String(t).replace(/\b([Kk])ies (de|het|een) ((?:goede |juiste |volledige )?[a-zà-ÿ]+)\./g, function(m, k, lw, rest){ return (k === 'K' ? 'S' : 's') + 'chrijf ' + lw + ' ' + rest + ' op.'; });
  }
  /* q: { v, o, g }. Geeft { soort, v, opdr }. */
  function vorm(q){
    var v = schrijfOp(kaal(q.v)), o = (q.o || []).map(kaal), g = q.g, a = o[g] || '';
    var uit = { soort:'open', v:v, opdr:'' };
    if (o.length < 2) return uit;
    /* True, False, Not stated: zeg welke woorden er mogen */
    if (o.every(function(x){ return /^(true|false|not stated|waar|niet waar|juist|onjuist|ja|nee)$/i.test(x); })) return { soort:'kies', v:v, opdr:'' };
    /* de vraag zegt zelf "kies": dan moet er ook iets te kiezen zijn (True, False, Not stated) */
    if (/(^|[.!?:,]\s+)(kies|choose)\b/i.test(v) && !/^(kies|choose) (de|het|the) (goede|juiste|correct|right) (vorm|form)\b/i.test(v) && !/staat:\s*"?kies\b/i.test(v)){ uit.soort = kort(o) ? 'kies' : 'omcirkel'; if (uit.soort === 'omcirkel') uit.opdr = 'Omcirkel de letter van het goede antwoord.'; return uit; }
    var vraag = v.split(/:\s+(?=\S)/)[0];
    var alleInVraag = o.every(function(x){ return staatIn(v, x); });
    var keuzes = false;
    /* "Which translation is correct?" wordt open: vertaal de zin zelf */
    var vert = v.match(/^which translation is correct\?\s*(.+)$/i);
    if (vert){ uit.v = 'Vertaal naar het Engels: ' + vert[1]; return uit; }
    if (alleInVraag) keuzes = false;
    else if (/^(kies|choose) (de|het|the) (goede|juiste|correct|right) (vorm|form)\b/i.test(v) && GAT.test(v) && haakjesWoord(v)){
      /* "Kies de goede vorm: Hij heeft haar foto ___. (liken)": het werkwoord staat erbij */
      uit.v = v.replace(/^(kies|choose) (de|het|the) (goede|juiste|correct|right) (vorm|form):?\s*/i, 'Vul de goede vorm in: ');
    }
    else if (overKeuzes(v, vraag) && !staatIn(v, a)) keuzes = true;
    else if (GAT.test(v) && !RIJTJE.test(v) && !haakjesWoord(v)) keuzes = true;
    /* het meervoud van hond: het woord staat in de vraag, dus open */
    else if (!VERTALEN.test(v) && !VAN_WOORD.test(v) && varianten(o, g) && !lijktIn(v, a)) keuzes = true;
    if (keuzes){ uit.soort = kort(o) ? 'kies' : 'omcirkel'; if (uit.soort === 'omcirkel') uit.opdr = 'Omcirkel de letter van het goede antwoord.'; return uit; }
    /* open: zegt de vraag wat je moet doen? anders een korte opdracht erbij */
    var heeftOpdracht = OPDRACHT.test(uit.v);
    if (RIJTJE.test(v) && GAT.test(v)) uit.opdr = 'Vul de ontbrekende vorm in.';
    else if (GAT.test(v) && !heeftOpdracht && !/\?/.test(v)) uit.opdr = haakjesWoord(v) ? 'Vul de goede vorm in.' : 'Vul het ontbrekende woord in.';
    else if (EINDGAT.test(v) && !/\?/.test(v) && !heeftOpdracht) uit.opdr = 'Maak de zin af.';
    else if (!/\?/.test(v) && !/:\s*\S/.test(v) && !heeftOpdracht && !/\d/.test(v)) uit.opdr = 'Schrijf het antwoord op de lijn.';
    return uit;
  }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  /* de korte keuzes als rijtje boven de lijn: de leerling schrijft het goede woord op */
  function kiesUit(o){ return '<span class="kiesuit"><i>Kies uit:</i>' + o.map(function(x){ return '<span>' + schoon(x) + '</span>'; }).join('') + '</span>'; }
  /* bovenaan een blad met open vragen: hoe je antwoordt, alleen wat op dit blad voorkomt */
  function uitleg(vormen){
    var soorten = {}; vormen.forEach(function(p){ soorten[p.soort] = true; });
    if (!soorten.open && !soorten.kies && !soorten.omcirkel) return '';
    return 'Schrijf je antwoord op de lijn.' + (soorten.kies ? ' Staat er Kies uit, kies dan een woord uit dat rijtje en schrijf het op de lijn.' : '') + (soorten.omcirkel ? ' Staan er keuzes met letters, omcirkel dan de letter van het goede antwoord.' : '');
  }
  return { vorm:vorm, schrijfOp:schrijfOp, kiesUit:kiesUit, uitleg:uitleg };
})();

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
    naam:'Tekstdetective: alinea’s lezen', vak:'ned',
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
    naam:'Breukenbakker: breuken', vak:'reken',
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
        /* de vraag is vaak dezelfde zin ("Welk stuk is groter?"): het plaatje en het antwoord maken het verschil */
        var sl = q.vraag.replace(/van de \S+ /, '') + '|' + JSON.stringify(q.taart || q.twee || '') + '|' + JSON.stringify(q.antwoord);
        if (gezien[sl]) continue;
        gezien[sl] = true; q.soortNaam = s.naam; uit.push(q);
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
    naam:'DHTE-schema: optellen en aftrekken', vak:'reken',
    eigenNiveau:true,
    aantallen:[6, 9, 12, 15, 20], standaard:9, aantalNaam:'Aantal sommen',
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
