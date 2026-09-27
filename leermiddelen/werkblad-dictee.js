/* Werkbladen voor het dictee (Nederlands) en de dictation (Engels). Op het
   scherm leest de computer voor; op papier doet de docent dat. Daarom geeft
   elk blad twee kanten:
     - het leerlingblad: genummerde lijnen, en bij een werkwoord de zin met
       een gat, bij een woordpaar de twee woorden om uit te kiezen;
     - het voorleesblad voor de docent (op de plek van het antwoordblad): wat
       je voorleest, het goede antwoord en de regel erbij.
   De opgaven komen uit dictee-opgaven.js en dictation-opgaven.js, dezelfde als
   in dictee.html en dictation.html. Een hele tekst (het dictee van de week)
   voorlezen gaat met dictee-werkblad.html; die staat hier als eigen keuze in
   de lijst, zodat je hem vindt waar de andere werkbladen staan. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  function vink(naam, waarde, tekst, aan){ return '<label><input type="checkbox" name="' + naam + '" value="' + schoon(waarde) + '"' + (aan ? ' checked' : '') + '> ' + schoon(tekst) + '</label>'; }
  function waarden(el, naam){ return [].map.call(el.querySelectorAll('input[name="' + naam + '"]:checked'), function(x){ return x.value; }); }
  /* de vier niveaus van de vragenbank naar de drie van het dictee */
  function niv3(rang){ return rang <= 1 ? 1 : rang === 2 ? 2 : 3; }
  function lijnen(k){ var h = ''; for (var i = 0; i < k; i++) h += '<span class="lijn" aria-hidden="true"></span>'; return h; }
  /* een hele zin: een lijn per veertig tekens, en minstens twee */
  function zinLijnen(zin){ return lijnen(Math.max(2, Math.ceil(String(zin).length / 40))); }

  /* Opgaven van het eigen niveau; zijn het er te weinig, dan ook van lager, en
     bestaat het onderdeel op dit niveau niet (leenwoorden op bb), dan erboven. */
  function trek(lijst, niv, n, sleutel){
    var eigen = schud(lijst.filter(function(x){ return x.n === niv; })), lager = schud(lijst.filter(function(x){ return x.n < niv; }));
    for (var k = niv + 1; !eigen.length && !lager.length && k <= 3; k++) eigen = schud(lijst.filter(function(x){ return x.n === k; }));
    /* hetzelfde op het leerlingblad (ship of sheep, en sheep of ship) maar een keer */
    var gezien = {};
    return eigen.concat(lager).filter(function(x){ var sl = sleutel ? sleutel(x) : ''; if (!sl) return true; if (gezien[sl]) return false; gezien[sl] = 1; return true; }).slice(0, n);
  }
  /* n opgaven eerlijk over de gekozen onderdelen, per onderdeel bij elkaar: een
     leerling wisselt zo niet steeds tussen een woord en een hele zin */
  function verdeel(D, soorten, niv, n){
    var per = {}, k, uit = [];
    soorten.forEach(function(s){ per[s.id] = 0; });
    for (k = 0; k < n; k++) per[soorten[k % soorten.length].id]++;
    soorten.forEach(function(s){ trek(D[s.bron], niv, per[s.id], s.sleutel).forEach(function(it){ uit.push({ soort:s, it:it }); }); });
    return uit;
  }

  /* het werkwoord in de zin wordt een gat (zoals in dictee.html) */
  var LETTER = 'A-Za-zÀ-ÿ';
  function metGat(zin, woord){
    var m = new RegExp('(^|[^' + LETTER + '])(' + woord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?=$|[^' + LETTER + '])', 'i').exec(zin);
    if (!m) return schoon(zin) + ' <span class="gat" aria-label="gat"></span>';
    var i = m.index + m[1].length;
    return schoon(zin.slice(0, i)) + '<span class="gat" aria-label="gat"></span>' + schoon(zin.slice(i + woord.length));
  }
  function ookGoed(lijst, hoofd){
    var rest = (lijst || []).filter(function(x){ return x !== hoofd; });
    return rest.length ? ' <span class="ook">(ook goed: ' + rest.map(schoon).join('; ') + ')</span>' : '';
  }
  function uitlegZin(t){ t = String(t || '').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.') : ''; }

  /* Elk onderdeel: waar de opgaven staan, wat de leerling ziet (vraag), wat de
     docent voorleest (lees) en wat goed is (goed, met de regel). */
  function maakBlad(o){
    var D = window[o.bron];
    if (!D) return null;
    var soorten = o.soorten.filter(function(s){ return D[s.bron] && D[s.bron].length; });
    return {
      naam:o.naam, vak:o.vak, eigenNiveau:false,
      aantallen:[10, 15, 20, 25, 30], standaard:15, aantalNaam:'Aantal woorden en zinnen',
      delenKop:'Wat komt erin',
      delenTip:o.tip,
      delen:function(aan){
        var alle = !soorten.some(function(s){ return aan.indexOf(s.id) >= 0; });
        return '<p class="kop">Onderdelen</p>' + soorten.map(function(s){ return vink('dsoort', s.id, s.naam, alle ? s.std : aan.indexOf(s.id) >= 0); }).join('') + (o.extra || '');
      },
      lees:function(el, rang){ return { soorten:waarden(el, 'dsoort'), niv:niv3(rang) }; },
      maak:function(k, n){
        var gekozen = soorten.filter(function(s){ return k.soorten.indexOf(s.id) >= 0; });
        if (!gekozen.length) return { fout:'Vink minstens een onderdeel aan.' };
        return verdeel(D, gekozen, k.niv, n);
      },
      teken:function(w){
        var koppen = w.items.some(function(x, i){ return i && x.soort !== w.items[i - 1].soort; });
        var vragen = w.items.map(function(x){ return '<li>' + (koppen ? '<span class="odkop">' + schoon(x.soort.kop) + '</span>' : '') + x.soort.vraag(x.it) + '</li>'; }).join('');
        var antwoorden = w.items.map(function(x){
          var r = x.soort.goed(x.it);
          return '<li><span class="lees">' + x.soort.lees(x.it) + '</span><span class="goed">' + r.html + '</span>' + (w.uitleg && r.regel ? '<small>' + schoon(uitlegZin(r.regel)) + '</small>' : '') + '</li>';
        }).join('');
        var namen = [];
        w.items.forEach(function(x){ if (namen.indexOf(x.soort.naam) < 0) namen.push(x.soort.naam); });
        return {
          titel:o.titel, sub:w.niveauNaam + ' · ' + namen.join(', ').toLowerCase() + ' · ' + w.items.length + (w.items.length === 1 ? ' opgave' : ' opgaven'),
          klasse:'dictee', intro:o.intro,
          vragen:vragen, antwoorden:antwoorden,
          antwoordKop:'Voorleesblad', antwoordIntro:o.voorlezen
        };
      }
    };
  }

  /* ---------- Dictee (Nederlands) ---------- */
  var WOORD_NL = {
    vraag:function(){ return '<span class="lijn woord" aria-hidden="true"></span>'; },
    lees:function(it){ return 'Zeg: <b>' + schoon(it.w) + '</b>. ' + schoon(it.zin) + ' <b>' + schoon(it.w) + '</b>.'; },
    goed:function(it){ return { html:schoon(it.w) + ookGoed(it.antwoordLijst, it.w), regel:it.uit }; }
  };
  var dictee = maakBlad({
    bron:'DICTEE_OPGAVEN', naam:'Dictee: voorlezen en opschrijven', vak:'ned', titel:'Dictee',
    tip:'Jij leest voor, de leerlingen schrijven. Het tweede blad is het voorleesblad: wat je voorleest, het goede antwoord en de regel. Liever een hele tekst voorlezen? Kies bij Werkblad het dictee met een hele tekst.',
    intro:'Je docent leest voor. Schrijf bij elk nummer wat je hoort. Staat er een zin met een gat, schrijf dan alleen het werkwoord in het gat.',
    voorlezen:'Zo lees je voor: noem het nummer. Een woord: zeg het woord, dan de zin, dan het woord nog een keer. Een werkwoord: lees de hele zin twee keer; de leerling schrijft alleen het werkwoord in het gat. Een zin met leestekens: lees hem in zijn geheel, dan in stukjes, en noem geen leestekens.',
    extra:'<p class="kop">Een hele tekst</p><p class="tip" style="grid-column:1/-1">Het dictee van de week of een andere doorlopende tekst voorlezen? Kies bij Werkblad <b>Dictee: een hele tekst voorlezen</b>, of ga naar <a href="dictee-werkblad.html">Dictee om voor te lezen</a>.</p>',
    soorten:[
      { id:'werkwoorden', bron:'werkwoorden', naam:'Werkwoorden (d, t of dt)', kop:'werkwoord in het gat', std:true,
        vraag:function(it){ return '<span class="vr zin">' + metGat(it.zin, it.woord) + '</span>'; },
        lees:function(it){ return 'Lees voor: ' + schoon(it.zin); },
        goed:function(it){ return { html:schoon(it.woord) + ookGoed(it.antwoordLijst, it.woord), regel:it.regel }; } },
      { id:'woorden', bron:'woorden', naam:'Lastige woorden', kop:'woord', std:true,
        vraag:WOORD_NL.vraag, lees:WOORD_NL.lees, goed:WOORD_NL.goed },
      { id:'leenwoorden', bron:'leenwoorden', naam:'Leenwoorden (vanaf kgt)', kop:'leenwoord', std:false,
        vraag:WOORD_NL.vraag, lees:WOORD_NL.lees, goed:WOORD_NL.goed },
      { id:'leestekens', bron:'leestekens', naam:'Hele zinnen met hoofdletters en leestekens', kop:'hele zin', std:false,
        vraag:function(it){ return zinLijnen(it.zin); },
        lees:function(it){ return 'Lees voor: ' + schoon(it.zin); },
        goed:function(it){ return { html:schoon(it.zin) + ookGoed(it.antwoordLijst, it.zin), regel:it.uit }; } }
    ]
  });

  /* ---------- Dictation (Engels) ---------- */
  var dictation = maakBlad({
    bron:'DICTATION_OPGAVEN', naam:'Dictation: read aloud, write down', vak:'eng', titel:'Dictation',
    tip:'Jij leest voor in het Engels, de leerlingen schrijven. Het tweede blad is het voorleesblad: wat je voorleest, het goede antwoord en een korte uitleg.',
    intro:'Your teacher reads out loud. Write down what you hear next to each number. Numbers, times and dates: write them in figures.',
    voorlezen:'Zo lees je voor: noem het nummer. Een woord: zeg het woord, dan de zin, dan het woord nog een keer. Een zin: eerst in zijn geheel, dan in stukjes. Een getal of tijd: twee keer. Een woordpaar: lees de zin; de leerling schrijft welk van de twee woorden erin zat. Bij een zin tellen hoofdletters en leestekens niet mee, en don’t en do not zijn allebei goed.',
    soorten:[
      { id:'woorden', bron:'woorden', naam:'Tricky words', kop:'word', std:true,
        vraag:WOORD_NL.vraag, lees:WOORD_NL.lees, goed:WOORD_NL.goed },
      { id:'zinnen', bron:'zinnen', naam:'Whole sentences', kop:'sentence', std:true,
        vraag:function(it){ return zinLijnen(it.zin); },
        lees:function(it){ return 'Lees voor: ' + schoon(it.zin); },
        goed:function(it){ return { html:schoon(it.zin), regel:it.uit }; } },
      { id:'getallen', bron:'getallen', naam:'Numbers, times and dates', kop:'in figures', std:false,
        vraag:function(){ return '<span class="antwregel">in figures: <span class="lijn kort" aria-hidden="true"></span></span>'; },
        lees:function(it){ return 'Zeg: ' + schoon(it.spreek); },
        goed:function(it){ return { html:schoon(it.antwoord[0]) + ookGoed(it.antwoord, it.antwoord[0]), regel:it.uit }; } },
      { id:'paren', bron:'paren', naam:'Minimal pairs (ship or sheep)', kop:'which word', std:false,
        sleutel:function(it){ return [it.w, it.ander].sort().join('|'); },
        vraag:function(it){ var twee = schud([it.w, it.ander]); return '<span class="vr">Which word do you hear: <b>' + schoon(twee[0]) + '</b> or <b>' + schoon(twee[1]) + '</b>?</span><span class="lijn woord" aria-hidden="true"></span>'; },
        lees:function(it){ return 'Lees voor: ' + schoon(it.zin); },
        goed:function(it){ return { html:schoon(it.w), regel:it.uit }; } }
    ]
  });

  /* ---------- Een hele tekst: dictee-werkblad.html ---------- */
  var DNIV = { 1:'bb', 2:'kgt', 3:'hv' };
  var dicteeTekst = window.DICTEE_OPGAVEN && {
    naam:'Dictee: een hele tekst voorlezen', vak:'ned',
    aantallen:[1], standaard:1, aantalNaam:'Aantal', geenAantal:true,
    delenKop:'Een hele tekst',
    delenTip:'Een doorlopende tekst van vier tot zes zinnen: het dictee van de week, een tekst uit de lijst of je eigen dictee. Je krijgt een voorleesblad met de zinnen in grote letters, een schrijfblad voor de leerlingen en een nakijkblad met de lastige woorden.',
    delen:function(){ return '<p class="tip" style="grid-column:1/-1">Dit werkblad heeft een eigen pagina. Met <b>Maak werkblad</b> ga je erheen, op het niveau dat je hierboven koos.</p>'; },
    lees:function(el, rang){ return { niv:niv3(rang) }; },
    /* geen opgaven hier: werkblad.html opent de pagina van het voorleesdictee */
    adres:function(k){ return 'dictee-werkblad.html?n=' + DNIV[k.niv] + '&nakijk=1'; },
    maak:function(){ return []; },
    teken:function(){ return {}; }
  };

  if (dictee) SPELBLAD.dictee = dictee;
  if (dicteeTekst) SPELBLAD.dicteetekst = dicteeTekst;
  if (dictation) SPELBLAD.dictation = dictation;
})();
