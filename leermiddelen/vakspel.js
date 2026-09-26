/* De motor onder de vakspellen: een startscherm met keuzes, een rij opgaven
   met meteen nakijken en uitleg, en een eindscherm dat bij de klas meldt.
   Een spel zegt alleen wat het is en hoe het een opgave maakt:

     VAKSPEL.maak({
       id:'verhoudingen', naam:'De verhoudingstabel', vak:'reken', kleur:'#EA9836',
       hand:'twee keer zoveel, twee keer zo duur', lead:'…',
       hoe:[{ kop, tekst }, { kop, tekst }, { kop, tekst }],
       keuzes:[{ id:'niveau', kop:'hoe moeilijk', items:[{ id, naam, uit }], std:'kgt' }, …],
       aantal:10, label:'opgaven goed',
       maak:function(keuze, nr){ return opgave; },
       uitleg:{ doel, tijd, bediening },       // het paneel van spel.js op het startscherm
       tutorial:[{ titel, tekst, doel }]       // niet verplicht; anders drie algemene stappen
     });

   Een opgave: { onderdeel, vraag, opdracht, beeld, vorm, uitleg, punten } en
   per vorm:
     'meerkeuze'  opties:[…], goed:i                (opties mogen html zijn; goed is de index)
     'invul'      velden:[{ id, label, antwoord, tol, eenheid, breed, type:'tekst' }]
                  antwoord is een getal (met tol als marge) of een tekst (hoofdletters en
                  spaties tellen niet); anders mag ook een lijst van goede teksten
     'sleep'      kaarten:[{ id, tekst }], vakken:[{ id, naam, uit, hoort:[kaartIds], max }]
                  (max 1 met vakken op een rij = op volgorde zetten)
     'eigen'      teken:function(el, api){ … }  met api.klaar(goed, uitlegHtml), api.knop(tekst, fn)
                  en api.uit(tekst); het spel roept klaar() als het antwoord er is.
   onderdeel is waar KLAS.tel op telt (per onderdeel goed/gesteld, voor het
   klasoverzicht). niveau voor de klas komt uit keuze.niveau. */
window.VAKSPEL = (function(){
  'use strict';
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function husselen(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function getal(t){ var s = String(t == null ? '' : t).trim().replace(/\s/g, '').replace(',', '.'); if (!s || !/^[-+]?\d*\.?\d+$/.test(s)) return null; return parseFloat(s); }
  function tekstNorm(t){ return String(t == null ? '' : t).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function pct(c){ return c && c[1] ? Math.round(c[0] / c[1] * 100) : 0; }

  var cfg = null, keuze = {}, nr = 0, goed = 0, fout = 0, punten = 0, reeks = 0, besteReeks = 0, od = {}, missers = [], perDeel = {}, bezig = false, opgave = null;

  /* ---------- de pagina ---------- */
  /* de inkt op de spelkleur: wit op donkere kleuren, navy op lichte (amber, vista, crab) */
  function lum(hex){
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '')); if (!m) return 0;
    return [0, 2, 4].map(function(i){ var c = parseInt(m[1].substr(i, 2), 16) / 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); })
      .reduce(function(s, c, i){ return s + c * [.2126, .7152, .0722][i]; }, 0);
  }
  function inktOp(hex){ var l = lum(hex), wit = 1.05 / (l + .05), navy = (l + .05) / (lum('#14224C') + .05); return navy > wit ? '#14224C' : '#fff'; }
  function bouw(){
    document.documentElement.style.setProperty('--spelkleur', cfg.kleur || '#204ECF');
    document.documentElement.style.setProperty('--spelinkt', inktOp(cfg.kleur || '#204ECF'));
    var wortel = $('vakspel') || document.body;
    wortel.innerHTML =
      '<header><div class="wrap hd">' +
        '<a class="mark" href="./"><span class="lgmark"><i><span>L</span><span>G</span></i><b class="lgdot"></b></span><span class="lgnaam"><span>' + schoon(cfg.naam) + '</span><span class="lgstreep"></span></span><span class="lghoi">alle spellen</span></a>' +
        '<div class="hd-right">' +
          '<button class="themaknop" id="themaknop" type="button" aria-label="Schakel naar donker" title="Donker of licht">' +
            '<svg class="maan" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' +
            '<svg class="zon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>' +
          '</button>' +
          '<button class="linkbtn" id="bordBtn" type="button">Digibord</button>' +
          '<button class="linkbtn hide" id="opnieuwBtn" type="button">Opnieuw</button>' +
        '</div></div></header>' +
      '<section class="wrap start oefen" id="scherm-start">' +
        '<p class="hand" style="font-size:1.6rem">' + schoon(cfg.hand || '') + '</p>' +
        '<h1>' + schoon(cfg.naam) + '</h1>' +
        '<p class="lead">' + schoon(cfg.lead || '') + '</p>' +
        /* de kaartjes met uitleg gaan achter "Alle regels" in het paneel van spel.js, zodat Start in beeld staat */
        '<div class="hoe uitleg">' + (cfg.hoe || []).map(function(h, i){ return '<div><i>' + (i + 1) + '</i><b>' + schoon(h.kop) + '</b><span>' + h.tekst + '</span></div>'; }).join('') + '</div>' +
        (cfg.keuzes || []).map(function(k, i){
          var rij = '<div class="keuze" id="keuze-' + k.id + '" role="group" aria-labelledby="kop-' + k.id + '"></div><p class="keuzeuit" id="uit-' + k.id + '"></p>';
          /* inklap: een keuze die de meesten laten staan, dicht achter een regel met wat er nu gekozen is */
          if (k.inklap) return '<details class="keuzeklap' + (i ? ' kop2' : '') + '"><summary><span class="eyebrow" id="kop-' + k.id + '">' + schoon(k.kop) + '</span> <b id="nu-' + k.id + '"></b></summary>' + rij + '</details>';
          return '<p class="eyebrow' + (i ? ' kop2' : '') + '" id="kop-' + k.id + '">' + schoon(k.kop) + '</p>' + rij;
        }).join('') +
        '<div class="startknoppen"><button class="btn" id="startBtn" type="button">Start</button>' +
        '<button class="btn tweede" id="oneindigBtn" type="button" title="Zoveel opgaven als je wilt, je stopt zelf">Oneindig oefenen</button></div>' +
      '</section>' +
      '<section class="wrap speelvak hide" id="scherm-spel">' +
        '<div class="balk" id="balk"></div>' +
        '<div class="voort"><i id="voortIn"></i></div>' +
        '<div class="kaart">' +
          '<p class="eyebrow onderdeel" id="onderdeelUit"></p>' +
          '<p class="vraag" id="vraag"></p>' +
          '<p class="opdracht" id="opdracht"></p>' +
          '<div class="beeld" id="beeld"></div>' +
          '<div class="antwoordvak" id="antwoordvak"></div>' +
          '<div id="reactie" role="status" aria-live="polite"></div>' +
          '<div class="verder hide" id="verder"><button type="button" class="stop hide" id="stopBtn">Stoppen</button><button type="button" id="verderBtn">Volgende &rarr;</button></div>' +
        '</div>' +
      '</section>' +
      /* het eindscherm: de eindkaart van spel.js zet de score bovenaan en heeft de knop voor een nieuwe ronde;
         hieronder alleen wat die kaart niet zegt: hoe het per onderdeel ging en wat er mis ging */
      '<section class="wrap eind hide" id="scherm-einde">' +
        '<p class="eindzin" id="eindUit"><b id="eindKop"></b> <span id="eindBand"></span></p>' +
        '<div class="zwakst hide" id="zwakst"></div>' +
        '<p class="eyebrow">per onderdeel</p><div class="perdeel" id="perdeel"></div>' +
        '<div id="missers"></div>' +
        '<button class="btn hide" id="nogBtn" type="button" tabindex="-1" aria-hidden="true">Nog een ronde</button>' +
      '</section>' +
      '<footer>meneer Greidanus &middot; ' + new Date().getFullYear() + '</footer>';
  }

  /* ---------- keuzes op het startscherm ---------- */
  function tekenKeuzes(){
    (cfg.keuzes || []).forEach(function(k){
      var vak = $('keuze-' + k.id);
      if (keuze[k.id] === undefined) keuze[k.id] = k.std !== undefined ? k.std : (k.items[0] && k.items[0].id);
      vak.innerHTML = k.items.map(function(it){ return '<button type="button" data-id="' + schoon(it.id) + '"' + (it.id === keuze[k.id] ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + schoon(it.naam) + '</button>'; }).join('');
      Array.prototype.forEach.call(vak.querySelectorAll('button'), function(b){ b.addEventListener('click', function(){ keuze[k.id] = b.getAttribute('data-id'); onthoud(k.id); tekenKeuzes(); }); });
      var it = k.items.filter(function(x){ return x.id === keuze[k.id]; })[0];
      $('uit-' + k.id).textContent = it && it.uit ? it.uit : '';
      if ($('nu-' + k.id)) $('nu-' + k.id).textContent = it ? it.naam : '';
    });
  }
  /* het niveau onthoudt de leeromgeving voor alle spellen; de rest per spel */
  function onthoud(id){
    try {
      if (id === 'niveau') localStorage.setItem('lg-niveau', keuze.niveau);
      localStorage.setItem('lg-keuze-' + cfg.id, JSON.stringify(keuze));
    } catch (e){}
  }
  function herinner(){
    try {
      var k = JSON.parse(localStorage.getItem('lg-keuze-' + cfg.id) || 'null');
      if (k && typeof k === 'object') (cfg.keuzes || []).forEach(function(x){ if (k[x.id] !== undefined && x.items.some(function(it){ return it.id === k[x.id]; })) keuze[x.id] = k[x.id]; });
      var n = localStorage.getItem('lg-niveau');
      var nk = (cfg.keuzes || []).filter(function(x){ return x.id === 'niveau'; })[0];
      if (n && nk && (!k || k.niveau === undefined) && nk.items.some(function(it){ return it.id === n; })) keuze.niveau = n;
    } catch (e){}
    /* ?n=… en andere keuzes in het adres: gekozen door de docent, en dan uit beeld */
    (cfg.keuzes || []).forEach(function(k){
      var m = new RegExp('[?&]' + (k.id === 'niveau' ? 'n' : k.id) + '=([^&#]+)').exec(location.search);
      if (!m) return;
      var w = decodeURIComponent(m[1]);
      if (!k.items.some(function(it){ return it.id === w; })) return;
      keuze[k.id] = w;
      var vak = $('keuze-' + k.id); if (vak) vak.classList.add('hide');
      var kop = $('kop-' + k.id); if (kop) kop.textContent = k.kop + ': ' + k.items.filter(function(it){ return it.id === w; })[0].naam + ', gekozen door je docent';
    });
  }

  /* ---------- een ronde ---------- */
  /* oneindig: geen ronde van tien, doorgaan tot je zelf stopt */
  var oneindig = false, oneindigUrl = /[?&]oneindig=1\b/.test(location.search);
  function start(zo){
    oneindig = !!zo;
    nr = 0; goed = 0; fout = 0; punten = 0; reeks = 0; besteReeks = 0; od = {}; missers = []; perDeel = {};
    $('voortIn').parentNode.classList.toggle('hide', oneindig);
    $('scherm-start').classList.add('hide'); $('scherm-einde').classList.add('hide'); $('scherm-spel').classList.remove('hide');
    opnieuwKnop(false);
    window.scrollTo({ top:0, behavior:'auto' });
    volgende();
  }
  function balk(){
    $('balk').innerHTML = '<span class="meter">opgave<b>' + (oneindig ? nr : Math.min(nr, cfg.aantal) + '/' + cfg.aantal) + '</b></span>' + (oneindig ? '<span class="meter oneindigmeter">oneindig</span>' : '') + '<span class="meter">goed<b>' + goed + '</b></span><span class="meter">punten<b>' + punten + '</b></span>' + (reeks >= 2 ? '<span class="meter reeks">reeks<b>' + reeks + '</b></span>' : '');
    /* tijdens een opgave telt hij de vorige; na het antwoord ook deze, zodat de balk bij de laatste vol is */
    $('voortIn').style.width = Math.round(Math.min(1, (bezig ? nr - 1 : nr) / cfg.aantal) * 100) + '%';
  }
  /* Opnieuw in de kop: op het startscherm weg, tijdens een ronde in twee stappen, op het eindscherm meteen */
  var opnieuwZeker = false, opnieuwTimer = null;
  function opnieuwKnop(zeker){
    var b = $('opnieuwBtn'); if (!b) return;
    opnieuwZeker = !!zeker; clearTimeout(opnieuwTimer);
    b.textContent = zeker ? 'Zeker? Tik nog eens' : 'Opnieuw';
    b.classList.toggle('zeker', !!zeker);
    b.classList.toggle('hide', !$('scherm-start').classList.contains('hide'));
    if (zeker) opnieuwTimer = setTimeout(function(){ opnieuwKnop(false); }, 3000);
  }
  function naarStart(){
    bezig = false;
    $('scherm-spel').classList.add('hide'); $('scherm-einde').classList.add('hide'); $('scherm-start').classList.remove('hide');
    opnieuwKnop(false);
    window.scrollTo({ top:0, behavior:'auto' });
  }
  function volgende(){
    if (!oneindig && nr >= cfg.aantal){ einde(); return; }
    nr++;
    /* niet steeds dezelfde, maar in een lange sessie mag er na een tijd weer een terugkomen */
    if (vorigeSleutels.length > 40) vorigeSleutels.splice(0, vorigeSleutels.length - 40);
    var probeer = 0;
    do { opgave = cfg.maak(Object.assign({}, keuze), nr); probeer++; } while ((!opgave || (opgave.sleutel && vorigeSleutels.indexOf(opgave.sleutel) >= 0)) && probeer < 12);
    if (!opgave){ einde(); return; }
    if (opgave.sleutel) vorigeSleutels.push(opgave.sleutel);
    bezig = true;
    balk();
    $('onderdeelUit').textContent = opgave.onderdeelNaam || opgave.onderdeel || '';
    $('vraag').innerHTML = opgave.vraag || '';
    $('opdracht').innerHTML = opgave.opdracht || '';
    $('opdracht').classList.toggle('hide', !opgave.opdracht);
    $('beeld').innerHTML = opgave.beeld || '';
    $('beeld').classList.toggle('hide', !opgave.beeld);
    $('reactie').innerHTML = '';
    $('verder').classList.add('hide');
    var vak = $('antwoordvak'); vak.innerHTML = '';
    if (opgave.vorm === 'meerkeuze') meerkeuze(vak);
    else if (opgave.vorm === 'invul') invul(vak);
    else if (opgave.vorm === 'sleep') sleep(vak);
    else if (opgave.vorm === 'eigen' && typeof opgave.teken === 'function') opgave.teken(vak, api());
    window.scrollTo({ top:0, behavior:'auto' });
    if (opgave.na) opgave.na(vak);
  }
  var vorigeSleutels = [];
  function api(){
    return {
      klaar: function(isGoed, uitlegHtml){ klaar(!!isGoed, uitlegHtml); },
      knop: function(tekst, fn, stil){ var d = $('antwoordvak').querySelector('.nakijk') || (function(){ var x = document.createElement('div'); x.className = 'nakijk'; $('antwoordvak').appendChild(x); return x; })();
        var b = document.createElement('button'); b.type = 'button'; b.textContent = tekst; if (stil) b.className = 'stil'; b.addEventListener('click', function(){ if (bezig) fn(b); }); d.appendChild(b); return b; },
      uit: function(tekst){ $('reactie').innerHTML = tekst ? '<p class="sleepuit">' + tekst + '</p>' : ''; },
      bezig: function(){ return bezig; },
      husselen: husselen, schoon: schoon, getal: getal
    };
  }

  /* ---------- meerkeuze ---------- */
  function meerkeuze(vak){
    var lijst = opgave.opties.map(function(o, i){ return { t:o, i:i }; });
    if (!opgave.vasteVolgorde) lijst = husselen(lijst);
    var groot = opgave.opties.every(function(o){ return String(o).replace(/<[^>]+>/g, '').length <= 6; });
    vak.innerHTML = '<div class="opties' + (opgave.opties.length === 2 ? ' twee' : '') + (groot ? ' groot' : '') + '">' + lijst.map(function(o){ return '<button type="button" class="optie" data-i="' + o.i + '">' + o.t + '</button>'; }).join('') + '</div>';
    Array.prototype.forEach.call(vak.querySelectorAll('.optie'), function(b){
      b.addEventListener('click', function(){
        if (!bezig) return;
        var i = parseInt(b.getAttribute('data-i'), 10), isGoed = i === opgave.goed;
        Array.prototype.forEach.call(vak.querySelectorAll('.optie'), function(x){ x.disabled = true; var xi = parseInt(x.getAttribute('data-i'), 10); if (xi === opgave.goed) x.classList.add('juist'); else if (xi === i) x.classList.add('mis'); });
        /* staat het goede antwoord al letterlijk in de uitleg, dan niet nog een keer ervoor */
        var goedKaal = kaleTekst(opgave.opties[opgave.goed]), alInUitleg = goedKaal.length > 3 && kaleTekst(opgave.uitleg).toLowerCase().indexOf(goedKaal.toLowerCase()) >= 0;
        klaar(isGoed, isGoed || alInUitleg ? '' : 'Het goede antwoord was: <b>' + opgave.opties[opgave.goed] + '</b>');
      });
    });
    /* de toetsen 1 tot 4 kiezen een antwoord; bij de eerste twee opgaven staat dat eronder (niet op een aanraakscherm) */
    vak.setAttribute('data-toetsen', '1');
    if (nr <= 2) vak.insertAdjacentHTML('beforeend', '<p class="toetsuit">Met het toetsenbord: de toetsen 1 tot ' + Math.min(9, opgave.opties.length) + ' kiezen een antwoord.</p>');
  }

  /* ---------- invullen ---------- */
  function invul(vak){
    vak.innerHTML = '<div class="velden">' + opgave.velden.map(function(v, i){
      var num = typeof v.antwoord === 'number' && v.type !== 'tekst';
      return '<div class="veldje"><label for="veld-' + i + '">' + schoon(v.label || '') + '</label><div class="rij">' + (v.voor ? '<span class="eenheid">' + schoon(v.voor) + '</span>' : '') +
        '<input id="veld-' + i + '" class="' + (v.breed ? 'breed' : '') + '" type="' + (num ? 'text' : 'text') + '" inputmode="' + (num ? 'decimal' : 'text') + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="' + schoon(v.label || 'antwoord') + '">' +
        (v.eenheid ? '<span class="eenheid">' + schoon(v.eenheid) + '</span>' : '') + '</div><span class="juist"></span></div>';
    }).join('') + '</div><div class="nakijk"><button type="button" id="nakijkBtn">Nakijken</button></div>';
    var invoer = vak.querySelectorAll('input');
    if (invoer[0]) setTimeout(function(){ invoer[0].focus(); }, 50);
    Array.prototype.forEach.call(invoer, function(inp, i){
      inp.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); if (invoer[i + 1]) invoer[i + 1].focus(); else $('nakijkBtn').click(); } });
    });
    $('nakijkBtn').addEventListener('click', function(){
      if (!bezig) return;
      /* een leeg vakje is geen fout antwoord: eerst invullen, dan pas nakijken */
      var leeg = Array.prototype.filter.call(invoer, function(inp){ return !inp.value.trim(); });
      if (leeg.length){
        $('reactie').innerHTML = '<p class="leegmelding">' + (invoer.length > 1 ? 'Vul eerst elk vakje in.' : 'Vul eerst iets in.') + '</p>';
        leeg[0].focus();
        return;
      }
      var alles = true;
      opgave.velden.forEach(function(v, i){
        var inp = invoer[i], w = inp.value.trim(), ok;
        if (typeof v.antwoord === 'number' && v.type !== 'tekst'){ var g = getal(w); ok = g !== null && Math.abs(g - v.antwoord) <= (v.tol || 0.001); }
        else { var goedLijst = Array.isArray(v.antwoord) ? v.antwoord : [v.antwoord]; ok = goedLijst.some(function(a){ return tekstNorm(a) === tekstNorm(w); }); }
        inp.disabled = true; inp.classList.add(ok ? 'goed' : 'fout');
        if (!ok){ alles = false; inp.parentNode.parentNode.querySelector('.juist').textContent = 'goed: ' + toonAntwoord(v); }
      });
      $('nakijkBtn').disabled = true;
      klaar(alles, alles ? '' : '');
    });
  }
  function toonAntwoord(v){
    if (typeof v.antwoord === 'number' && v.type !== 'tekst') return v.toon || String(v.antwoord).replace('.', ',') + (v.eenheid ? ' ' + v.eenheid : '');
    return v.toon || (Array.isArray(v.antwoord) ? v.antwoord[0] : v.antwoord);
  }

  /* ---------- slepen ---------- */
  function sleep(vak){
    var kaarten = opgave.vasteVolgorde ? opgave.kaarten.slice() : husselen(opgave.kaarten);
    var opRij = opgave.vakken.every(function(v){ return (v.max || 99) === 1; });
    vak.innerHTML = '<div class="sleepvak">' +
      '<div class="kaartjes" id="kaartjes">' + kaarten.map(function(k){ return '<div class="sleepkaart" tabindex="0" role="button" data-id="' + schoon(k.id) + '">' + k.tekst + '</div>'; }).join('') + '</div>' +
      '<div class="vakken' + (opRij ? ' rij' : '') + '">' + opgave.vakken.map(function(v, i){
        /* de kop van elk vak is een knop: met het toetsenbord kies je zo het vak voor het gepakte kaartje */
        var naam = v.naam ? String(v.naam).replace(/<[^>]+>/g, '') : 'plek ' + (i + 1);
        return '<div class="sleepdoel" data-id="' + schoon(v.id) + '" data-max="' + (v.max || 99) + '" data-naam="' + schoon(naam) + '">' +
          '<button type="button" class="doelknop" aria-label="Leg het kaartje in vak ' + (i + 1) + ': ' + schoon(naam) + '">' +
          (opRij && !v.naam ? '<span class="nr">' + (i + 1) + '</span>' : '<small class="vaknr" aria-hidden="true">' + (i + 1) + '</small><b>' + (v.naam || '') + '</b>') + '</button>' +
          (v.uit ? '<small>' + schoon(v.uit) + '</small>' : '') + '<div class="inhoud"></div></div>';
      }).join('') + '</div>' +
      '<p class="sleepuit" id="sleepuit">' + (opgave.sleepuit || 'Sleep elk kaartje naar het vak waar het hoort. Op een telefoon: tik een kaartje aan en dan het vak.') +
        ' <span class="toetsuit">Met het toetsenbord: Enter op een kaartje, dan het cijfer van het vak.</span></p>' +
      '<div class="nakijk"><button type="button" id="nakijkBtn" disabled>Nakijken</button></div></div>';
    var gepakt = null;
    /* wat er gebeurt, hardop voor een schermlezer (in #reactie, onzichtbaar) */
    function meld(t){ $('reactie').innerHTML = '<p class="vs-sr">' + schoon(t) + '</p>'; }
    function kaartNaam(k){ return (k.textContent || '').replace(/\s+/g, ' ').trim(); }
    function zetIn(kaart, doel){
      if (!bezig) return;
      var inhoud = doel.querySelector('.inhoud'), max = parseInt(doel.getAttribute('data-max'), 10);
      if (inhoud.children.length >= max){
        /* vol: het kaartje dat er lag gaat terug naar de stapel */
        $('kaartjes').appendChild(inhoud.firstElementChild);
      }
      var metToets = document.activeElement === kaart || (document.activeElement && document.activeElement.closest && document.activeElement.closest('.sleepdoel'));
      inhoud.appendChild(kaart); kaart.classList.remove('gepakt'); gepakt = null;
      Array.prototype.forEach.call(vak.querySelectorAll('.sleepdoel'), function(d){ d.classList.remove('kan', 'boven'); d.classList.toggle('vol', d.querySelector('.inhoud').children.length >= parseInt(d.getAttribute('data-max'), 10)); });
      var over = $('kaartjes').children.length;
      $('nakijkBtn').disabled = over > 0;
      meld('"' + kaartNaam(kaart) + '" ligt in ' + doel.getAttribute('data-naam') + '. ' + (over ? 'Nog ' + over + ' over.' : 'Alles ligt er. Nu Nakijken.'));
      /* met het toetsenbord: door naar het volgende kaartje, of naar Nakijken */
      if (metToets){ var volg = $('kaartjes').querySelector('.sleepkaart'); (volg || $('nakijkBtn')).focus(); }
    }
    function terug(kaart){ $('kaartjes').appendChild(kaart); kaart.classList.remove('gepakt'); gepakt = null; $('nakijkBtn').disabled = true; Array.prototype.forEach.call(vak.querySelectorAll('.sleepdoel'), function(d){ d.classList.remove('kan', 'boven', 'vol'); }); meld('"' + kaartNaam(kaart) + '" ligt weer op de stapel.'); }
    /* tikken: kaartje pakken, dan een vak (of nog een keer het kaartje om los te laten) */
    vak.addEventListener('click', function(e){
      if (!bezig) return;
      var kaart = e.target.closest('.sleepkaart'), doel = e.target.closest('.sleepdoel');
      if (kaart && !kaart.classList.contains('zweef')){
        if (gepakt === kaart){ kaart.classList.remove('gepakt'); gepakt = null; Array.prototype.forEach.call(vak.querySelectorAll('.sleepdoel'), function(d){ d.classList.remove('kan'); }); return; }
        if (gepakt) gepakt.classList.remove('gepakt');
        gepakt = kaart; kaart.classList.add('gepakt');
        Array.prototype.forEach.call(vak.querySelectorAll('.sleepdoel'), function(d){ d.classList.add('kan'); });
        meld('"' + kaartNaam(kaart) + '" gepakt. Kies een vak: een cijfer, of Tab naar het vak en Enter.');
        return;
      }
      if (doel && gepakt) zetIn(gepakt, doel);
      else if (doel && e.target.closest('.doelknop')) meld('Kies eerst een kaartje.');
      else if (gepakt && e.target.closest('#kaartjes')) terug(gepakt);
    });
    vak.addEventListener('keydown', function(e){
      var n = parseInt(e.key, 10), doelen = vak.querySelectorAll('.sleepdoel');
      var kaart = e.target.closest('.sleepkaart');
      if (!kaart){
        /* een cijfer terwijl je een kaartje vasthebt en ergens anders staat: ook goed */
        if (gepakt && n >= 1 && doelen[n - 1] && !/INPUT|TEXTAREA/.test(e.target.tagName)){ e.preventDefault(); zetIn(gepakt, doelen[n - 1]); }
        return;
      }
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); kaart.click(); }
      /* met de cijfers zet je het gepakte kaartje in vak 1, 2, 3, … */
      if (n >= 1 && doelen[n - 1]){ e.preventDefault(); zetIn(kaart, doelen[n - 1]); }
    });
    /* slepen met muis of vinger: een kopie zweeft mee, het vak eronder licht op */
    var sleepKaart = null, zweef = null, startX = 0, startY = 0, beweegt = false;
    vak.addEventListener('pointerdown', function(e){
      var kaart = e.target.closest('.sleepkaart'); if (!kaart || !bezig || e.button) return;
      sleepKaart = kaart; startX = e.clientX; startY = e.clientY; beweegt = false;
      try { kaart.setPointerCapture(e.pointerId); } catch (x){}
    });
    vak.addEventListener('pointermove', function(e){
      if (!sleepKaart) return;
      if (!beweegt && Math.hypot(e.clientX - startX, e.clientY - startY) < 6) return;
      if (!beweegt){
        beweegt = true;
        zweef = sleepKaart.cloneNode(true); zweef.classList.add('zweef'); zweef.classList.remove('gepakt');
        var r = sleepKaart.getBoundingClientRect(); zweef.style.width = r.width + 'px'; zweef.dataOffX = e.clientX - r.left; zweef.dataOffY = e.clientY - r.top;
        document.body.appendChild(zweef); sleepKaart.style.opacity = '.35';
      }
      zweef.style.left = (e.clientX - zweef.dataOffX) + 'px'; zweef.style.top = (e.clientY - zweef.dataOffY) + 'px';
      var onder = document.elementFromPoint(e.clientX, e.clientY), doel = onder && onder.closest ? onder.closest('.sleepdoel') : null;
      Array.prototype.forEach.call(vak.querySelectorAll('.sleepdoel'), function(d){ d.classList.toggle('boven', d === doel); });
      e.preventDefault();
    });
    function los(e){
      if (!sleepKaart) return;
      var kaart = sleepKaart; sleepKaart = null;
      if (!beweegt){ return; }   /* een tik: de klik-afhandeling doet het */
      kaart.style.opacity = '';
      if (zweef){ zweef.remove(); zweef = null; }
      var onder = document.elementFromPoint(e.clientX, e.clientY), doel = onder && onder.closest ? onder.closest('.sleepdoel') : null;
      if (doel) zetIn(kaart, doel);
      else if (onder && onder.closest && onder.closest('#kaartjes')) terug(kaart);
      else Array.prototype.forEach.call(vak.querySelectorAll('.sleepdoel'), function(d){ d.classList.remove('boven'); });
      /* een sleep is geen tik: de klik die erna komt hoort niets te doen */
      kaart.dataSleepte = Date.now();
    }
    vak.addEventListener('pointerup', los); vak.addEventListener('pointercancel', los);
    vak.addEventListener('click', function(e){ var k = e.target.closest('.sleepkaart'); if (k && k.dataSleepte && Date.now() - k.dataSleepte < 400){ e.stopImmediatePropagation(); } }, true);
    $('nakijkBtn').addEventListener('click', function(){
      if (!bezig) return;
      var alles = true, uitleg = [], aantalGoed = 0, aantal = 0;
      opgave.vakken.forEach(function(v){
        var doel = vak.querySelector('.sleepdoel[data-id="' + v.id + '"]');
        Array.prototype.forEach.call(doel.querySelectorAll('.sleepkaart'), function(k){
          var id = k.getAttribute('data-id'), ok = (v.hoort || []).indexOf(id) >= 0;
          k.classList.add(ok ? 'goed' : 'fout'); aantal++; if (ok) aantalGoed++;
          if (!ok){ alles = false; var hoortIn = opgave.vakken.filter(function(x){ return (x.hoort || []).indexOf(id) >= 0; })[0]; if (hoortIn) k.insertAdjacentHTML('beforeend', '<small>hoort bij ' + schoon(hoortIn.naam || ('vak ' + (opgave.vakken.indexOf(hoortIn) + 1))) + '</small>'); }
        });
      });
      $('nakijkBtn').disabled = true;
      klaar(alles, '', { goed: aantalGoed, van: aantal });
    });
  }

  /* ---------- nakijken, verder, einde ---------- */
  /* tekst zonder html; een plaatje dat achter de uitleg hangt gaat er helemaal af, anders staat de tekst uit de svg erin */
  function kaleTekst(t){ return String(t || '').replace(/<(div|svg|ol|table)\b[\s\S]*$/i, '').replace(/<[^>]+>/g, '').trim(); }
  function klaar(isGoed, extra, deels){
    if (!bezig) return;
    bezig = false;
    var w = opgave.punten || 10;
    /* bij een sleepvraag: ligt meer dan de helft goed, dan is het bijna, met punten naar rato */
    var bijna = !isGoed && deels && deels.van > 1 && deels.goed * 2 >= deels.van;
    if (isGoed){ goed++; reeks++; if (reeks > besteReeks) besteReeks = reeks; punten += w + (reeks >= 3 ? Math.min(5, reeks) : 0); }
    else { fout++; reeks = 0; if (bijna) punten += Math.round(w * deels.goed / deels.van);
      /* het plaatje gaat mee (klein), anders staat er "bij welke stad hoort deze grafiek?" zonder grafiek */
      missers.push({ v: kaleTekst(opgave.vraag), j: opgave.antwoordTekst || '', hoe: kaleTekst(opgave.uitleg), beeld: misserBeeld(opgave) }); }
    var deel = opgave.onderdeel || 'overig';
    if (window.KLAS && KLAS.tel) KLAS.tel(od, deel, isGoed);
    var c = perDeel[deel] = perDeel[deel] || [0, 0, opgave.onderdeelNaam || deel]; c[1]++; if (isGoed) c[0]++;
    $('reactie').innerHTML = '<div class="uitslagregel ' + (isGoed ? 'goed' : bijna ? 'bijna' : 'fout') + '"><b>' + (isGoed ? (reeks >= 3 ? 'Goed, ' + reeks + ' op rij!' : 'Goed!') : bijna ? 'Bijna: ' + deels.goed + ' van de ' + deels.van + ' goed.' : 'Niet goed.') + '</b>' +
      (extra ? '<p>' + extra + '</p>' : '') + (opgave.uitleg ? '<div class="waarom">' + opgave.uitleg + '</div>' : '') + '</div>';
    balk();
    $('verder').classList.remove('hide');
    $('verderBtn').textContent = !oneindig && nr >= cfg.aantal ? 'Naar de uitslag →' : 'Volgende →';
    $('stopBtn').classList.toggle('hide', !oneindig);
    setTimeout(function(){ $('verderBtn').focus({ preventScroll:true }); inBeeld(); }, 30);
  }
  /* na een antwoord: de uitleg en Volgende in beeld, zonder de bovenkant van de uitleg weg te schuiven */
  function inBeeld(){
    var r = $('reactie'), v = $('verder'); if (!r || !v) return;
    var kop = document.querySelector('header'), boven = (kop ? kop.getBoundingClientRect().bottom : 0) + 8;
    /* op een telefoon plakt Volgende onderaan: dan moet de uitleg boven die balk eindigen */
    var plakt = getComputedStyle(v).position === 'sticky', bodem = innerHeight - (plakt ? v.offsetHeight : 0);
    var a = r.getBoundingClientRect(), b = v.getBoundingClientRect(), onder = (plakt ? a.bottom : Math.max(a.bottom, b.bottom)) + 12;
    if (a.top >= boven && onder <= bodem) return;
    var zacht = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    /* zover omlaag dat Volgende in beeld komt, maar nooit zo ver dat "Goed" of "Niet goed" onder de kop verdwijnt */
    var dy = Math.min(onder - bodem, a.top - boven);
    if (a.top < boven) dy = a.top - boven;
    if (Math.abs(dy) > 2) window.scrollBy({ top: dy, behavior: zacht ? 'smooth' : 'auto' });
  }
  /* een klein plaatje bij een misser: alleen een svg (geen lange tekst of tabel) */
  function misserBeeld(o){
    var b = String(o.beeld || '');
    if (!/<svg[\s>]/i.test(b) || b.length > 60000) return '';
    var m = /<svg[\s\S]*<\/svg>/i.exec(b);
    return m ? m[0] : '';
  }
  /* elke kopie eigen id's, zodat verlopen en pijlpunten naar hun eigen kopie wijzen */
  function eigenIds(svg, n){
    var ids = []; svg.replace(/\sid="([^"]+)"/g, function(a, id){ ids.push(id); return a; });
    ids.forEach(function(id){
      var e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      svg = svg.replace(new RegExp('(\\sid=")' + e + '"', 'g'), '$1m' + n + '-' + id + '"').replace(new RegExp('#' + e + '([)"])', 'g'), '#m' + n + '-' + id + '$1');
    });
    return svg.replace(/<svg\b/, '<svg aria-hidden="true" focusable="false"');
  }
  function einde(){
    $('scherm-spel').classList.add('hide'); $('scherm-einde').classList.remove('hide');
    opnieuwKnop(false);
    var gedaan = goed + fout, deel = gedaan ? goed / gedaan : 0;
    $('eindKop').textContent = goed + ' van de ' + gedaan + ' goed.';
    $('nogBtn').textContent = oneindig ? 'Verder oefenen' : 'Nog een ronde';
    var nk = (cfg.keuzes || []).filter(function(k){ return k.id === 'niveau'; })[0];
    var nv = nk ? nk.items.filter(function(x){ return x.id === keuze.niveau; })[0] : null;
    /* de zin hangt af van hoe het ging: bij 1 van de 10 zeg je iets anders dan bij 10 van de 10 */
    var band = !gedaan ? 'Je hebt nog niets beantwoord.'
      : deel === 1 ? 'Alles goed. Probeer een moeilijker niveau of een ander onderdeel.'
      : deel >= .8 ? 'Dit zit er goed in. Kijk nog even naar wat er mis ging.'
      : deel >= .5 ? 'Een flink deel zit er al. Lees de uitleg bij je missers, dan gaat de volgende ronde beter.'
      : 'Dit is nog nieuw. Lees de uitleg bij je missers rustig door en oefen één onderdeel tegelijk.';
    $('eindBand').textContent = (nv ? nv.naam + '. ' : '') + (cfg.eindTekst || band);
    /* per onderdeel; bij één opgave zegt een percentage niets, dan alleen 0/1 of 1/1 */
    $('perdeel').innerHTML = Object.keys(perDeel).map(function(k){ var c = perDeel[k], p = pct(c);
      return c[1] < 2 ? '<span class="e">' + schoon(c[2]) + ' <small>' + c[0] + '/' + c[1] + '</small></span>'
        : '<span class="' + (p >= 80 ? 'g' : p >= 60 ? 'm' : 'r') + '">' + schoon(c[2]) + '<b>' + p + '%</b> <small>' + c[0] + '/' + c[1] + '</small></span>'; }).join('');
    /* het zwakste onderdeel, met een knop om alleen dat te oefenen (als het spel dat onderdeel als keuze heeft) */
    var zwak = zwaksteDeel();
    $('zwakst').classList.toggle('hide', !zwak);
    $('zwakst').innerHTML = zwak ? '<p>Hier ging het het vaakst mis: <b>' + schoon(zwak.naam) + '</b> (' + zwak.c[0] + ' van de ' + zwak.c[1] + ' goed).</p>' +
      '<button type="button" class="btn tweede" id="oefenDeelBtn">Oefen dit onderdeel</button>' : '';
    if (zwak) $('oefenDeelBtn').addEventListener('click', function(){ keuze[zwak.keuze] = zwak.id; onthoud(zwak.keuze); tekenKeuzes(); start(oneindig); });
    /* de missers: ink, niet rood; meer dan drie klappen in */
    var lijst = missers.map(function(f, i){ return '<div>' + (f.beeld ? '<span class="mbeeld">' + eigenIds(f.beeld, i) + '</span>' : '') + '<b>' + schoon(f.v) + '</b>' + (f.j ? '<span class="mgoed">goed: ' + schoon(f.j) + '</span>' : '') + (f.hoe ? '<span>' + schoon(f.hoe) + '</span>' : '') + '</div>'; }).join('');
    $('missers').innerHTML = !missers.length ? ''
      : missers.length > 3 ? '<details class="missersdicht"><summary>Bekijk je ' + missers.length + ' missers</summary><div class="missers">' + lijst + '</div></details>'
      : '<p class="eyebrow">nog even nakijken</p><div class="missers">' + lijst + '</div>';
    /* Een oneindige sessie heeft geen "beste ooit": hoe langer je doorgaat, hoe meer punten, dus een record zegt niets.
       De sterren gaan wel over hoeveel er goed was. */
    var max = (oneindig ? Math.max(gedaan, 1) : cfg.aantal) * 10 || 1, r = punten / max;
    if (window.SPEL && SPEL.einde) SPEL.einde({ spel: cfg.id, vak: cfg.vak, od: od, goed: goed, reeks: besteReeks, score: oneindig ? String(punten) : punten, label: 'punten', waarde: oneindig ? undefined : punten, max: max,
      sterren: oneindig ? (r >= .9 ? 3 : r >= .7 ? 2 : r >= .4 ? 1 : 0) : undefined,
      opnieuw: function(){ start(oneindig); }, opnieuwTekst: oneindig ? 'Verder oefenen' : 'Nog een ronde',
      ronde: goed, punten: punten, niveau: keuze.niveau || '', sleutel: Object.keys(keuze).map(function(k){ return keuze[k]; }).join('-') + (oneindig ? '-oneindig' : ''), deelTekst: goed + ' van de ' + gedaan + ' goed' + (oneindig ? ', oneindig geoefend' : '') });
    window.scrollTo({ top:0, behavior:'auto' });
  }
  /* het onderdeel waar het het vaakst mis ging, en de keuze die precies dat onderdeel oefent */
  function zwaksteDeel(){
    var soort = (cfg.keuzes || []).filter(function(k){ return k.id === 'soort'; })[0];
    if (!soort) return null;
    var vak = $('keuze-soort'); if (vak && vak.classList.contains('hide')) return null;   /* gekozen door de docent */
    var beste = null;
    Object.keys(perDeel).forEach(function(k){
      var c = perDeel[k]; if (c[0] >= c[1]) return;
      /* het onderdeel heet "klok: aflezen" en de keuze "aflezen": zoek op id, op naam, of het begin van de naam */
      var kort = String(k).split(': ').pop(), nm = tekstNorm(c[2]);
      var it = soort.items.filter(function(x){ return x.id !== 'alles' && (x.id === k || x.id === kort || (cfg.oefenDeel && cfg.oefenDeel[k] === x.id) || tekstNorm(x.naam) === nm); })[0] ||
        soort.items.filter(function(x){ var xn = tekstNorm(x.naam); return x.id !== 'alles' && nm && (xn.indexOf(nm) === 0 || nm.indexOf(xn) === 0); })[0];
      if (!it || it.id === keuze.soort) return;
      /* het vaakst mis: de meeste missers; bij gelijk aantal het laagste deel goed */
      var p = c[0] / c[1], mis = c[1] - c[0];
      if (!beste || mis > beste.mis || (mis === beste.mis && p < beste.p)) beste = { p:p, mis:mis, c:c, naam:c[2], id:it.id, keuze:'soort' };
    });
    return beste;
  }

  /* ---------- de tutorial: drie stappen die bij elk vakspel kloppen ---------- */
  function tutorialStappen(){
    if (cfg.tutorial) return cfg.tutorial;
    var vorm = opgave ? opgave.vorm : '';
    var doeTekst = vorm === 'meerkeuze' ? 'Kies het antwoord dat klopt. Je ziet meteen groen of rood.'
      : vorm === 'invul' ? 'Typ je antwoord in het vakje en druk op Nakijken (of Enter).'
      : vorm === 'sleep' ? 'Sleep elk kaartje naar het vak waar het hoort; op een telefoon tik je eerst het kaartje aan en dan het vak. Daarna Nakijken.'
      : 'Geef je antwoord en kijk het na.';
    return [
      { titel: 'De opgave', tekst: 'Bovenaan staat wat je moet doen' + (opgave && opgave.beeld ? ', met een plaatje of tabel erbij' : '') + '. Lees eerst goed, dan pas antwoorden.', doel: 'vraag' },
      { titel: 'Zo antwoord je', tekst: doeTekst, doel: 'antwoordvak' },
      { titel: 'Fout is niet erg', tekst: 'Bij elk antwoord staat erbij waarom het zo zit. Lees dat even, ook als je het goed had: daar leer je het van. Met Volgende ga je door; ' + cfg.aantal + ' opgaven per ronde.', doel: 'balk' }
    ];
  }

  /* "tien opgaven per ronde" met erbij hoe lang dat ongeveer duurt (cfg.minuten, anders een half minuutje per opgave) */
  function tijdTekst(t){
    t = t || (cfg.aantal || 10) + ' opgaven per ronde';
    if (/minu/.test(t)) return t;
    return t + ', ongeveer ' + (cfg.minuten || Math.max(3, Math.round((cfg.aantal || 10) / 2))) + ' minuten';
  }
  function naLaden(fn){ if (document.readyState === 'complete') fn(); else addEventListener('load', fn); }

  /* ---------- de werkbladstand ----------
     Met ?werkblad=1 in het adres tekent de pagina geen spel, maar wacht hij in
     een verborgen iframe op werkblad.html. Die vraagt de keuzes op en laat
     opgaven maken, en krijgt ze terug als html: de vraag met het beeld en de
     antwoordruimte, en het antwoord voor het antwoordblad. */
  var LET = ['a', 'b', 'c', 'd', 'e', 'f'];
  function werkbladItem(o){
    var vr = '<span class="vr">' + (o.vraag || '') + '</span>' + (o.opdracht ? '<span class="opdr">' + o.opdracht + '</span>' : '') + (o.beeld ? '<div class="beeld">' + o.beeld + '</div>' : ''), antwoord = '';
    if (o.vorm === 'meerkeuze'){
      var lijst = o.opties.map(function(t, i){ return { t:t, i:i }; }); if (!o.vasteVolgorde) lijst = husselen(lijst);
      var opties = '<div class="opties">' + lijst.map(function(x, k){ return '<span><b>' + LET[k] + '</b>' + x.t + '</span>'; }).join('') + '</div>';
      var k2 = 0; lijst.forEach(function(x, k){ if (x.i === o.goed) k2 = k; });
      var goedTekst = String(o.opties[o.goed]).replace(/<[^>]+>/g, '').trim() || o.antwoordTekst || '';
      antwoord = LET[k2] + '. ' + goedTekst;
      /* open kan alleen als de keuzes kort zijn en de vraag niet over de keuzes zelf gaat ("welke versie past") */
      var tekst = String(o.vraag || '').replace(/<[^>]+>/g, '');
      var kanOpen = o.opties.every(function(t){ var k = String(t).replace(/<[^>]+>/g, '').trim(); return k && k.length <= 40; }) &&
        !/\bwelke?\b[^.?]*\b(goed|juist|fout|onjuist|klopt|past|hoort)\b/i.test(tekst) && !/\bvan deze\b|hoort er niet bij|past niet/i.test(tekst);
      return { kop: o.onderdeelNaam || o.onderdeel || '', vraag: vr, opties: opties, kanOpen: kanOpen, antwoord: antwoord, antwoordOpen: goedTekst, uitleg: (o.uitleg || '').replace(/<div[\s\S]*$/, '') };
    } else if (o.vorm === 'invul'){
      vr += '<div class="velden-wb">' + o.velden.map(function(v){ return '<span class="veldlijn">' + schoon(v.label || '') + (v.voor ? ' ' + schoon(v.voor) : '') + ' <i class="lijn"></i>' + (v.eenheid ? ' ' + schoon(v.eenheid) : '') + '</span>'; }).join('') + '</div>';
      antwoord = o.velden.map(function(v){ return (v.label ? v.label + ': ' : '') + toonAntwoord(v); }).join('; ');
    } else if (o.vorm === 'sleep'){
      var kaarten = o.vasteVolgorde ? o.kaarten.slice() : husselen(o.kaarten), let2 = {};
      kaarten.forEach(function(k, i){ let2[k.id] = LET[i] || String(i + 1); });
      vr += '<div class="sleep-wb"><p class="kaartjes-wb">' + kaarten.map(function(k){ return '<span><b>' + let2[k.id] + '</b>' + k.tekst + '</span>'; }).join('') + '</p>' +
        '<p class="vakken-wb">' + o.vakken.map(function(v, i){ return '<span><b>' + (v.naam ? v.naam : 'vak ' + (i + 1)) + (v.uit ? ' <small>(' + schoon(v.uit) + ')</small>' : '') + '</b> <i class="lijn kort"></i></span>'; }).join('') + '</p>' +
        '<p class="opdr">Schrijf bij elk vak de letters van de kaartjes die erin horen.</p></div>';
      antwoord = o.vakken.map(function(v, i){ return (v.naam || 'vak ' + (i + 1)) + ': ' + (v.hoort || []).map(function(id){ return let2[id]; }).join(', '); }).join('; ');
    } else if (o.vorm === 'eigen' && typeof o.teken === 'function'){
      var d = document.createElement('div');
      try { o.teken(d, { klaar:function(){}, knop:function(){ var b = document.createElement('button'); return b; }, uit:function(){}, bezig:function(){ return true; }, husselen:husselen, schoon:schoon, getal:getal }); } catch (e){}
      Array.prototype.forEach.call(d.querySelectorAll('button, .nakijk, input[type=range]'), function(x){ x.parentNode.removeChild(x); });
      Array.prototype.forEach.call(d.querySelectorAll('input'), function(x){ x.setAttribute('readonly', ''); x.value = ''; });
      vr += '<div class="eigen-wb">' + d.innerHTML + '</div>';
      antwoord = o.antwoordTekst || '';
    }
    return { kop: o.onderdeelNaam || o.onderdeel || '', vraag: vr, antwoord: antwoord || o.antwoordTekst || '', uitleg: (o.uitleg || '').replace(/<div[\s\S]*$/, '') };
  }
  function werkbladModus(c){
    cfg = c;
    document.body.innerHTML = '<p style="font:14px system-ui;padding:12px;color:#666">Dit venster maakt opgaven voor een werkblad. Open <a href="' + location.pathname + '">het spel zelf</a> om te oefenen.</p>';
    var stijl = Array.prototype.map.call(document.querySelectorAll('style'), function(s){ return s.textContent; }).join('\n');
    function stuur(b){ if (window.parent && window.parent !== window) window.parent.postMessage(b, '*'); }
    addEventListener('message', function(e){
      var b = e.data || {};
      if (b.t === 'werkblad-keuzes') stuur({ t:'werkblad-keuzes', id:cfg.id, naam:cfg.naam, keuzes:(cfg.keuzes || []).map(function(k){ return { id:k.id, kop:k.kop, std:k.std, items:k.items.map(function(it){ return { id:it.id, naam:it.naam }; }) }; }), stijl:stijl });
      if (b.t === 'werkblad-maak'){
        var items = [], gezien = {}, keuze = b.keuze || {};
        (cfg.keuzes || []).forEach(function(k){ if (keuze[k.id] === undefined) keuze[k.id] = k.std !== undefined ? k.std : k.items[0].id; });
        for (var i = 0, p = 0; items.length < (b.n || 8) && p < (b.n || 8) * 12; p++){
          var o = null; try { o = cfg.maak(Object.assign({}, keuze), items.length + 1); } catch (e){ o = null; }
          if (!o) continue;
          var sl = o.sleutel || (o.vraag + '|' + (o.antwoordTekst || '')); if (gezien[sl]) continue; gezien[sl] = true;
          items.push(werkbladItem(o));
        }
        stuur({ t:'werkblad-maak', vraagId:b.vraagId, items:items });
      }
    });
    stuur({ t:'werkblad-klaar', id:cfg.id });
  }

  function maak(c){
    if (/[?&]werkblad=1/.test(location.search)){ werkbladModus(c); return; }
    cfg = c;
    bouw();
    herinner();
    tekenKeuzes();
    $('startBtn').addEventListener('click', function(){ start(oneindigUrl); });
    $('oneindigBtn').addEventListener('click', function(){ start(true); });
    $('stopBtn').addEventListener('click', function(){ if (!bezig) einde(); });
    /* de docent linkt met ?oneindig=1: dan is Start meteen oneindig */
    if (oneindigUrl){ $('startBtn').textContent = 'Start: oneindig oefenen'; $('oneindigBtn').classList.add('hide'); }
    $('verderBtn').addEventListener('click', function(){ if (!bezig) volgende(); });
    /* nog een ronde: meteen, met dezelfde keuzes; wie iets anders wil, gaat via Opnieuw naar het startscherm */
    $('nogBtn').addEventListener('click', function(){ start(oneindig); });
    $('opnieuwBtn').addEventListener('click', function(){
      /* midden in een ronde: eerst vragen, want je raakt je antwoorden kwijt */
      var bezigMet = !$('scherm-spel').classList.contains('hide') && nr > 0;
      if (bezigMet && !opnieuwZeker){ opnieuwKnop(true); return; }
      naarStart();
    });
    $('bordBtn').addEventListener('click', function(){ var aan = document.body.classList.toggle('groot'); this.classList.toggle('on', aan); });
    addEventListener('keydown', function(e){
      if ($('scherm-spel').classList.contains('hide')) return;
      if (window.TUTORIAL && TUTORIAL.open()) return;
      var inInvoer = /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '');
      /* Enter of spatie gaat door, behalve op een andere knop (Opnieuw, Stoppen): die doet zijn eigen ding */
      var opKnop = e.target && e.target.closest && e.target.closest('button, a, summary');
      if (!bezig && (e.key === 'Enter' || e.key === ' ') && !inInvoer && (!opKnop || opKnop.id === 'verderBtn')){ e.preventDefault(); volgende(); return; }
      if (bezig && opgave && opgave.vorm === 'meerkeuze' && !inInvoer && /^[1-9]$/.test(e.key)){
        var knoppen = $('antwoordvak').querySelectorAll('.optie'), k = knoppen[parseInt(e.key, 10) - 1]; if (k){ e.preventDefault(); k.click(); }
      }
    });
    /* spel.js en tutorial.js komen na dit bestand: pas aanhaken als alles er is */
    naLaden(function(){
      if (window.TUTORIAL && TUTORIAL.naStart) TUTORIAL.naStart('startBtn', cfg.id, tutorialStappen, {});
      if (window.SPEL && SPEL.uitleg && cfg.uitleg) SPEL.uitleg(Object.assign({}, cfg.uitleg, { tijd: tijdTekst(cfg.uitleg.tijd) }));
      /* na "Begrepen" klapt het paneel dicht: dan meteen naar Start, dat staat nu vlak eronder */
      var begrepen = document.querySelector('#scherm-start .uitlegpaneel .begrepen');
      if (begrepen) begrepen.addEventListener('click', function(){ setTimeout(function(){ $('startBtn').focus({ preventScroll:true }); var r = $('startBtn').getBoundingClientRect(); if (r.bottom > innerHeight) $('startBtn').scrollIntoView({ block:'nearest' }); }, 0); });
    });
    (function(){ var m = document.querySelector('header .mark'); if (m) m.setAttribute('href', './' + location.search); })();
  }

  return { maak: maak, husselen: husselen, schoon: schoon, getal: getal,
           /* voor de proefscripts */
           _opgave: function(){ return opgave; }, _cfg: function(){ return cfg; }, _keuze: function(){ return keuze; }, _stand: function(){ return { nr:nr, goed:goed, fout:fout, punten:punten, bezig:bezig, od:od }; } };
})();
