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
   misserBeeld:false houdt een versierend plaatje uit de lijst met missers op het eindscherm.
   onderdeel is waar KLAS.tel op telt (per onderdeel goed/gesteld, voor het
   klasoverzicht). niveau voor de klas komt uit keuze.niveau.

   STAP VOOR STAP, de begeleide stand: de knop op het startscherm, of ?begeleid=1 in het
   adres (samen met ?n=, ?soort=, ?aantal= enzovoort). Per onderdeel (de items van de keuze
   'soort', zonder 'alles'; staat soort vast in het adres, dan alleen dat onderdeel) gaat het
   zoals een docent het aan het bord doet:
     1. voordoen: een uitgewerkt voorbeeld, stap voor stap, met bij elke stap waarom;
     2. samen doen: opgaven met de stappen als steiger. Bij de eerste staat stap 1 er al,
        daarna vraag je zelf een stap als je vastloopt, een per keer, nooit meteen het antwoord;
     3. zelf doen: de steiger valt weg. Na drie keer goed zonder hint door naar het volgende
        onderdeel; twee keer mis op rij en de stappen komen even terug.
   Na een fout: de uitleg van precies de stap die misging, en een vergelijkbare opgave (zelfde
   vorm, zelfde onderdeel en evenveel stappen, als dat lukt).
   Het telt niet voor beste scores, de klas of Mijn voortgang. Munten wel, voor wat zelf goed was.

   Stappen aanleveren kan het makkelijkst in de opgave zelf, waar de getallen al bekend zijn:

     return { onderdeel, vraag, vorm:'invul', velden:[{ label:'bij 1', antwoord:2.5 }, { label:'bij 8', antwoord:20 }], uitleg,
       stappen:[
         { tekst:'Deel door 3: 7,50 ÷ 3 = 2,50.', waarom:'Bij 1 hoort een derde van wat bij 3 hoort.', hint:'Deel 7,50 door 3.', veld:0 },
         { tekst:'Keer 8: 2,50 × 8 = 20.', waarom:'Bij 8 hoort acht keer zoveel als bij 1.', hint:'Hoeveel keer zoveel is 8 als 1?', veld:1 }
       ] };

     tekst   wat je doet, met de getallen van deze opgave (html mag)
     waarom  waarom die stap klopt (niet verplicht, maar daar zit de uitleg)
     hint    wat de leerling bij samen doen ziet, zonder de uitkomst (het waarom komt dan pas bij
             de uitwerking). Zonder hint krijgt hij tekst en waarom, en dan niet die van de laatste
             stap: die geeft het antwoord weg
     fout    de bekende fout bij deze stap; staat erbij als het daar misging (niet verplicht)
     veld    bij welk invulvak deze stap hoort: de index van de input in het antwoordvak, vanaf 0
             (bij een eigen vorm met inputs ook; een input met de klasse fout is mis)
     optie   bij meerkeuze: de index (of een lijst) van de foute opties die uit deze stap komen
     kaart   bij slepen: de id's van de kaartjes die deze stap neerlegt
   Met veld, optie of kaart ziet de motor bij een fout welke stap misging. Anders kan de opgave
   het zelf zeggen: foutStap:function(antwoordvak){ return index of -1; }.

   Of los van de opgaven, in de configuratie (alles niet verplicht):
     begeleid:{
       stappen:function(opgave, keuze){ return [{ tekst, waarom }, …]; },   als de opgave zelf geen stappen heeft
       voorbeeld:function(onderdeel, keuze){ return opgave; },               een vaste voorbeeldopgave per onderdeel
       onderdelen:{ via1:{ uit:'…' }, recept:false },                        uit staat bij voordoen; false slaat over
       samen:2, zelf:3, keuze:'soort'                                        hoeveel goed per fase; welke keuze de onderdelen geeft
     }
   Een eigen vorm kan in teken el.voordoe = function(){ … } zetten: dat vult bij voordoen het
   antwoord in, net als el.proef voor de proefscripts. maak krijgt in deze stand keuze.begeleid
   ('voordoen', 'samen' of 'zelf') mee. Zonder stappen knipt de motor de uitleg van de opgave in
   zinnen: zo heeft elk vakspel de stand meteen, maar duidelijk minder uitgebreid. */
/* de nagekeken g in de kop, net als op de andere pagina's; merk.js tekent hem opnieuw als je er met de muis overheen gaat */
var MERK = "<svg class=\"ng teken\" viewBox=\"0 0 256 256\" width=\"34\" height=\"34\" aria-hidden=\"true\" focusable=\"false\" style=\"width:100%;height:100%;overflow:visible;transform:scale(1.3)\"><style>.ng .ngr{stroke:#204ECF}.ng .ngv{stroke:#F26749}:root[data-theme=\"dark\"] .ng .ngr{stroke:#83A5F2}@media(prefers-color-scheme:dark){:root:not([data-theme=\"light\"]) .ng .ngr{stroke:#83A5F2}}.ng.teken .ngr{stroke-dasharray:100;animation:ng-ring .6s cubic-bezier(.6,0,.3,1) .15s both}.ng.teken .ngv{stroke-dasharray:100;animation:ng-vink .34s cubic-bezier(.3,0,.2,1) .67s both}@keyframes ng-ring{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}@keyframes ng-vink{from{stroke-dashoffset:100;opacity:0}1%{opacity:1}to{stroke-dashoffset:0;opacity:1}}@media(prefers-reduced-motion:reduce){.ng.teken .ngr,.ng.teken .ngv{animation:none}}</style><g transform=\"translate(8 0)\" fill=\"none\" stroke-width=\"32\"><path class=\"ngr\" pathLength=\"100\" d=\"M163.3 123A50 50 0 1 0 76.7 73A50 50 0 1 0 163.3 123Z\"/><path class=\"ngv\" pathLength=\"100\" d=\"M163.3 123L114.2 208L82.2 176\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g></svg>";
if (!document.querySelector('script[src$="merk.js"]')) { var merkScript = document.createElement('script'); merkScript.src = '/leermiddelen/merk.js'; document.head.appendChild(merkScript); }
/* de nagekeken g bij een goed antwoord (zie nagekeken.js) */
if (!window.NAGEKEKEN && !document.querySelector('script[src="nagekeken.js"]')) { var ngScript = document.createElement('script'); ngScript.src = 'nagekeken.js'; document.head.appendChild(ngScript); }
window.VAKSPEL = (function(){
  'use strict';
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function husselen(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function getal(t){ var s = String(t == null ? '' : t).trim().replace(/\s/g, '').replace(',', '.'); if (!s || !/^[-+]?\d*\.?\d+$/.test(s)) return null; return parseFloat(s); }
  function tekstNorm(t){ return String(t == null ? '' : t).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function pct(c){ return c && c[1] ? Math.round(c[0] / c[1] * 100) : 0; }

  /* zelfinschatting vooraf: 0 nog niet, 1 een beetje, 2 goed */
  var ZELF = ['nog niet', 'een beetje', 'goed'], zelfVoor = null;
  function zelfBand(p){ return p >= .8 ? 2 : p >= .5 ? 1 : 0; }
  /* de vorige rondes van dit spel, op dit apparaat: { p, t } */
  function groeiLees(){ try { var l = JSON.parse(localStorage.getItem('lg-groei-' + cfg.id) || '[]'); return Array.isArray(l) ? l : []; } catch (e){ return []; } }
  function groeiZet(l){ try { localStorage.setItem('lg-groei-' + cfg.id, JSON.stringify(l.slice(-12))); } catch (e){} }
  function tekenGroei(deel, gedaan){
    var el = $('groei'); if (!el) return;
    if (!gedaan || oneindig && gedaan < 5){ el.classList.add('hide'); return; }
    var vorige = groeiLees(), h = '';
    if (zelfVoor !== null){
      var echt = zelfBand(deel), p = Math.round(deel * 100);
      h += '<p><b>Vooraf dacht je: ' + ZELF[zelfVoor] + '.</b> Je had ' + p + '% goed' + (echt > zelfVoor ? ': je kunt meer dan je dacht.' : echt < zelfVoor ? ': het ging minder goed dan je dacht. Goed om te weten; kijk welk onderdeel het lastigst was.' : ': dat klopte met wat je dacht.') + '</p>';
    }
    var reeks = vorige.concat([{ p:deel, t:Date.now() }]).slice(-6);
    if (vorige.length){
      var v = vorige[vorige.length - 1].p, verschil = Math.round((deel - v) * 100);
      h += '<p>Vorige keer ' + Math.round(v * 100) + '%, nu ' + Math.round(deel * 100) + '%' + (verschil >= 10 ? ': je bent ' + verschil + ' procentpunt vooruit.' : verschil <= -10 ? '. Een mindere ronde; vaak scheelt het welk onderdeel je kreeg.' : '.') + '</p>' +
        '<div class="groeibalk" aria-hidden="true">' + reeks.map(function(x, i){ return '<i style="height:' + Math.max(6, Math.round(x.p * 100)) + '%"' + (i === reeks.length - 1 ? ' class="nu"' : '') + '></i>'; }).join('') + '</div><p class="groeionder">je laatste ' + reeks.length + ' rondes</p>';
    }
    groeiZet(vorige.concat([{ p:Math.round(deel * 100) / 100, t:Date.now() }]));
    el.innerHTML = h; el.classList.toggle('hide', !h);
    /* een volgende ronde vraagt het opnieuw */
    zelfVoor = null; Array.prototype.forEach.call(document.querySelectorAll('#zelfVoor button'), function(x){ x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
  }
  /* Tien opgaven was kort voor een les. Standaard nu twintig; wie snel wil, kiest tien, wie lang wil dertig (of oneindig). */
  var AANTALLEN = [10, 20, 30], aantal = 20;
  try { var la = +localStorage.getItem('lg-aantal'); if (AANTALLEN.indexOf(la) >= 0) aantal = la; } catch (e){}
  function tekenAantal(){
    var v = $('keuze-aantal'); if (!v) return;
    Array.prototype.forEach.call(v.querySelectorAll('button'), function(b){ var aan = +b.getAttribute('data-n') === aantal; b.classList.toggle('on', aan); b.setAttribute('aria-pressed', aan ? 'true' : 'false'); });
    $('uit-aantal').textContent = 'Ongeveer ' + minuten(aantal) + ' minuten.';
  }
  /* hoe lang een ronde duurt: een half minuutje per opgave, of naar rato van cfg.minuten
     (dat geldt voor het aantal waar het spel mee kwam; een tekst lezen duurt langer dan een som) */
  function minuten(n){
    var per = cfg && cfg.minuten ? cfg.minuten / (cfg.basisAantal || 10) : .5;
    return Math.max(3, Math.round(n * per));
  }
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
        '<a class="mark" href="./"><span class="lgmark"><i class="lgblob" style="background:none;box-shadow:none;border:0;border-radius:0;padding:0">' + MERK + '</i></span><span class="lgnaam"><span>' + schoon(cfg.naam) + '</span><span class="lgstreep"></span></span><span class="lghoi">alle spellen</span></a>' +
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
        '<p class="lead" id="leadTekst">' + schoon(cfg.lead || '') + '</p>' +
        /* de kaartjes met uitleg gaan achter "Alle regels" in het paneel van spel.js, zodat Start in beeld staat */
        '<div class="hoe uitleg">' + (cfg.hoe || []).map(function(h, i){ return '<div><i>' + (i + 1) + '</i><b>' + schoon(h.kop) + '</b><span>' + h.tekst + '</span></div>'; }).join('') + '</div>' +
        (cfg.keuzes || []).map(function(k, i){
          var rij = '<div class="keuze" id="keuze-' + k.id + '" role="group" aria-labelledby="kop-' + k.id + '"></div><p class="keuzeuit" id="uit-' + k.id + '"></p>';
          /* inklap: een keuze die de meesten laten staan, dicht achter een regel met wat er nu gekozen is */
          if (k.inklap) return '<details class="keuzeklap' + (i ? ' kop2' : '') + '"><summary><span class="eyebrow" id="kop-' + k.id + '">' + schoon(k.kop) + '</span> <b id="nu-' + k.id + '"></b></summary>' + rij + '</details>';
          return '<p class="eyebrow' + (i ? ' kop2' : '') + '" id="kop-' + k.id + '">' + schoon(k.kop) + '</p>' + rij;
        }).join('') +
        /* het leerdoel, en hoe goed je denkt dat je het al kunt: achteraf leg je dat naast je uitslag */
        '<div class="leerdoel">' + (cfg.leerdoel ? '<p class="eyebrow">wat je hier leert</p><p class="ldtekst">' + schoon(cfg.leerdoel) + '</p>' : '') +
          '<p class="ldvraag" id="ldVraag">Hoe goed kun je dit nu al? Aan het eind zie je of het klopte.</p><div class="keuze ldkeuze" id="zelfVoor" role="group" aria-labelledby="ldVraag">' +
          ZELF.map(function(z, i){ return '<button type="button" data-z="' + i + '" aria-pressed="false">' + z + '</button>'; }).join('') + '</div></div>' +
        /* hoeveel opgaven per ronde: standaard 20, onthouden op dit apparaat */
        '<div class="aantalrij"><p class="eyebrow" id="kop-aantal">hoeveel opgaven</p><div class="keuze" id="keuze-aantal" role="group" aria-labelledby="kop-aantal">' +
          AANTALLEN.map(function(n){ return '<button type="button" data-n="' + n + '" aria-pressed="false">' + n + '</button>'; }).join('') + '</div><p class="keuzeuit" id="uit-aantal"></p></div>' +
        '<div class="startknoppen"><button class="btn" id="startBtn" type="button">Start</button>' +
        '<button class="btn tweede" id="oneindigBtn" type="button" title="Zoveel opgaven als je wilt, je stopt zelf">Oneindig oefenen</button>' +
        '<button class="btn tweede" id="begeleidBtn" type="button" title="Eerst een voorbeeld, dan samen met de stappen, dan zelf">Stap voor stap</button></div>' +
      '</section>' +
      '<section class="wrap speelvak hide" id="scherm-spel">' +
        /* stap voor stap: de onderdelen en de drie fasen, in plaats van de balk met punten */
        '<div class="vs-beg hide" id="begKop"></div>' +
        '<div class="balk" id="balk"></div>' +
        '<div class="voort"><i id="voortIn"></i></div>' +
        '<div class="kaart">' +
          '<p class="eyebrow onderdeel" id="onderdeelUit"></p>' +
          '<p class="vraag" id="vraag"></p>' +
          '<p class="opdracht" id="opdracht"></p>' +
          '<div class="beeld" id="beeld"></div>' +
          '<div class="vs-steiger hide" id="steiger"></div>' +
          '<div class="antwoordvak" id="antwoordvak"></div>' +
          '<div id="reactie" role="status" aria-live="polite"></div>' +
          '<p class="vs-sr" id="stapMeld" role="status" aria-live="polite"></p>' +
          '<div class="verder hide" id="verder"><button type="button" class="stop hide" id="stopBtn">Stoppen</button><button type="button" class="stop hide" id="begVbBtn">Nog een voorbeeld</button><button type="button" id="verderBtn">Volgende &rarr;</button></div>' +
        '</div>' +
      '</section>' +
      /* het eindscherm: de eindkaart van spel.js zet de score bovenaan en heeft de knop voor een nieuwe ronde;
         hieronder alleen wat die kaart niet zegt: hoe het per onderdeel ging en wat er mis ging */
      '<section class="wrap eind hide" id="scherm-einde">' +
        '<p class="eindzin" id="eindUit"><b id="eindKop"></b> <span id="eindBand"></span></p>' +
        '<div class="groei hide" id="groei"></div>' +
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
      /* een lange rij schuift op een telefoon opzij (vakspel.css); de gekozen knop blijft in beeld */
      vak.classList.toggle('schuifrij', k.items.length >= 4);
      var aan = vak.querySelector('.on');
      if (aan && vak.scrollWidth > vak.clientWidth){
        var dx = aan.getBoundingClientRect().left - vak.getBoundingClientRect().left;
        if (dx < 0 || dx + aan.offsetWidth > vak.clientWidth - 24) vak.scrollLeft += dx - 12;
      }
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
    /* ?n=… en andere keuzes in het adres: gekozen door de docent, en dan uit beeld.
       Met van=lo komt de keuze van de leerling zelf, uit de leeromgeving. */
    var wie = /[?&]van=lo\b/.test(location.search) ? 'gekozen in de leeromgeving' : 'gekozen door je docent';
    (cfg.keuzes || []).forEach(function(k){
      var m = new RegExp('[?&]' + (k.id === 'niveau' ? 'n' : k.id) + '=([^&#]+)').exec(location.search);
      if (!m) return;
      var w = decodeURIComponent(m[1]);
      if (!k.items.some(function(it){ return it.id === w; })) return;
      keuze[k.id] = w;
      var vak = $('keuze-' + k.id); if (vak) vak.classList.add('hide');
      var kop = $('kop-' + k.id); if (kop) kop.textContent = k.kop + ': ' + k.items.filter(function(it){ return it.id === w; })[0].naam + ', ' + wie;
    });
  }

  /* Op een telefoon is de inleiding soms acht regels: dan staan er drie, met
     "Lees verder" eronder. Het doel staat in een zin in de knop "Hoe werkt het?". */
  function leadKort(){
    var p = $('leadTekst');
    if (!p || !window.matchMedia || !matchMedia('(max-width:560px)').matches) return;
    p.classList.add('kort');
    if (p.scrollHeight <= p.clientHeight + 2){ p.classList.remove('kort'); return; }
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'leadmeer'; b.textContent = 'Lees verder';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'leadTekst');
    b.addEventListener('click', function(){ p.classList.remove('kort'); b.parentNode.removeChild(b); });
    p.insertAdjacentElement('afterend', b);
  }

  /* ---------- een ronde ---------- */
  /* oneindig: geen ronde van tien, doorgaan tot je zelf stopt */
  var oneindig = false, oneindigUrl = /[?&]oneindig=1\b/.test(location.search);
  /* Meegroeiend niveau: vier goed op rij en de opgaven gaan een stap omhoog,
     twee fout op rij een stap terug, nooit onder wat je zelf koos. Het gekozen
     niveau blijft staan voor de uitslag en de klas; alleen de opgaven veranderen. */
  var nivNu = null, nivReeks = 0, nivToast = null, nivKlok = null;
  function nivKeuze(){ return (cfg.keuzes || []).filter(function(k){ return k.id === 'niveau'; })[0]; }
  function nivStap(isGoed){
    var nk = nivKeuze(); if (!nk || nk.items.length < 2 || !keuze.niveau) return;
    /* na de laatste opgave komt er geen volgende: dan ook geen bericht dat de opgaven omhoog gaan */
    if (!oneindig && nr >= cfg.aantal) return;
    var l = nk.items.map(function(x){ return x.id; });
    if (nivNu == null) nivNu = keuze.niveau;
    nivReeks = isGoed ? Math.max(0, nivReeks) + 1 : Math.min(0, nivReeks) - 1;
    var i = l.indexOf(nivNu), basis = l.indexOf(keuze.niveau), naar = null;
    if (nivReeks >= 4 && i >= 0 && i < l.length - 1) naar = l[i + 1];
    else if (nivReeks <= -2 && i > basis) naar = l[i - 1];
    if (!naar) return;
    var omhoog = l.indexOf(naar) > i, it = nk.items[l.indexOf(naar)];
    nivNu = naar; nivReeks = 0;
    if (!nivToast){ nivToast = document.createElement('div'); nivToast.className = 'adaptief-toast'; nivToast.setAttribute('role', 'status'); nivToast.setAttribute('aria-live', 'polite'); document.body.appendChild(nivToast); }
    nivToast.textContent = omhoog ? 'Dit gaat je makkelijk af. De opgaven gaan een stap omhoog: ' + it.naam + '.' : 'Even een stap terug: de opgaven zijn weer ' + it.naam + '.';
    nivToast.classList.add('aan'); clearTimeout(nivKlok); nivKlok = setTimeout(function(){ nivToast.classList.remove('aan'); }, 4200);
  }
  function start(zo){
    begUit();
    oneindig = !!zo;
    cfg.aantal = aantal;
    nivNu = keuze.niveau || null; nivReeks = 0;
    nr = 0; goed = 0; fout = 0; punten = 0; reeks = 0; besteReeks = 0; od = {}; missers = []; perDeel = {};
    $('voortIn').parentNode.classList.toggle('hide', oneindig);
    $('scherm-start').classList.add('hide'); $('scherm-einde').classList.add('hide'); $('scherm-spel').classList.remove('hide');
    opnieuwKnop(false);
    window.scrollTo({ top:0, behavior:'auto' });
    volgende();
  }
  function balk(){
    $('balk').innerHTML = '<span class="meter">opgave<b>' + (oneindig ? nr : Math.min(nr, cfg.aantal) + '/' + cfg.aantal) + '</b></span>' + (oneindig ? '<span class="meter oneindigmeter">oneindig</span>' : '') + '<span class="meter">goed<b>' + goed + '</b></span><span class="meter">punten<b>' + punten + '</b></span>' + (nivNu && nivNu !== keuze.niveau ? '<span class="meter">niveau<b>' + schoon((nivKeuze().items.filter(function(x){ return x.id === nivNu; })[0] || {}).naam || nivNu) + '</b></span>' : '') + (reeks >= 2 ? '<span class="meter reeks">reeks<b>' + reeks + '</b></span>' : '');
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
    begUit();
    $('scherm-spel').classList.add('hide'); $('scherm-einde').classList.add('hide'); $('scherm-start').classList.remove('hide');
    opnieuwKnop(false);
    window.scrollTo({ top:0, behavior:'auto' });
  }
  function volgende(){
    if (beg){ begVerder(); return; }
    if (!oneindig && nr >= cfg.aantal){ einde(); return; }
    nr++;
    /* niet steeds dezelfde, maar in een lange sessie mag er na een tijd weer een terugkomen */
    if (vorigeSleutels.length > 40) vorigeSleutels.splice(0, vorigeSleutels.length - 40);
    var probeer = 0;
    do { opgave = cfg.maak(Object.assign({}, keuze, nivNu ? { niveau:nivNu } : {}), nr); probeer++; } while ((!opgave || (opgave.sleutel && vorigeSleutels.indexOf(opgave.sleutel) >= 0)) && probeer < 12);
    if (!opgave){ einde(); return; }
    if (opgave.sleutel) vorigeSleutels.push(opgave.sleutel);
    bezig = true;
    balk();
    tekenOpgave();
  }
  /* de opgave in de kaart zetten: vraag, beeld en de antwoordvorm (ook voor stap voor stap) */
  function tekenOpgave(){
    $('onderdeelUit').textContent = opgave.onderdeelNaam || opgave.onderdeel || '';
    $('vraag').innerHTML = opgave.vraag || '';
    $('opdracht').innerHTML = opgave.opdracht || '';
    $('opdracht').classList.toggle('hide', !opgave.opdracht);
    $('beeld').innerHTML = opgave.beeld || '';
    $('beeld').classList.toggle('hide', !opgave.beeld);
    $('reactie').innerHTML = '';
    $('verder').classList.add('hide');
    /* voordoe hoort bij de vorige opgave in eigen vorm: weg ermee */
    var vak = $('antwoordvak'); vak.innerHTML = ''; vak.voordoe = null;
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
      klaar: function(isGoed, uitlegHtml, deels){ klaar(!!isGoed, uitlegHtml, deels); },
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
  function kaleTekst(t){ return String(t || '').replace(/<(div|svg|ol|table)\b[\s\S]*$/i, '').replace(/<br\s*\/?>|<\/(p|li|h\d)>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim(); }
  function klaar(isGoed, extra, deels){
    if (!bezig) return;
    bezig = false;
    /* stap voor stap telt niet mee: geen punten, geen missers, niets naar de klas */
    if (beg){ begKlaar(isGoed, extra, deels); return; }
    var w = opgave.punten || 10;
    /* bij een sleepvraag: ligt meer dan de helft goed, dan is het bijna, met punten naar rato */
    var bijna = !isGoed && deels && deels.van > 1 && deels.goed * 2 >= deels.van;
    if (isGoed){ goed++; reeks++; if (reeks > besteReeks) besteReeks = reeks; punten += w + (reeks >= 3 ? Math.min(5, reeks) : 0); }
    else { fout++; reeks = 0; if (bijna) punten += Math.round(w * deels.goed / deels.van);
      /* het plaatje gaat mee (klein), anders staat er "bij welke stad hoort deze grafiek?" zonder grafiek */
      missers.push({ v: kaleTekst(opgave.vraag), j: opgave.antwoordTekst || '', hoe: kaleTekst(opgave.uitleg), beeld: misserBeeld(opgave) }); }
    var deel = opgave.onderdeel || 'overig';
    if (window.KLAS && KLAS.tel) KLAS.tel(od, deel, isGoed);
    nivStap(isGoed);
    var c = perDeel[deel] = perDeel[deel] || [0, 0, opgave.onderdeelNaam || deel]; c[1]++; if (isGoed) c[0]++;
    $('reactie').innerHTML = '<div class="uitslagregel ' + (isGoed ? 'goed' : bijna ? 'bijna' : 'fout') + '"><b>' + (isGoed && window.NAGEKEKEN ? NAGEKEKEN.svg({ maat: 24, teken: true }) : '') + (isGoed ? (reeks >= 3 ? 'Goed, ' + reeks + ' op rij!' : 'Goed!') : bijna ? 'Bijna: ' + deels.goed + ' van de ' + deels.van + ' goed.' : 'Niet goed.') + '</b>' +
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
    /* misserBeeld:false: het plaatje is versiering (een luidspreker), geen deel van de vraag */
    if (o.misserBeeld === false || !/<svg[\s>]/i.test(b) || b.length > 60000) return '';
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
    if (nivToast){ clearTimeout(nivKlok); nivToast.classList.remove('aan'); }
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
    tekenGroei(deel, gedaan);
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
    if (window.SPEL && SPEL.einde) SPEL.einde({ spel: cfg.id, vak: cfg.vak, od: od, goed: goed, ronde: goed, reeks: besteReeks, score: oneindig ? String(punten) : punten, label: 'punten', waarde: oneindig ? undefined : punten, max: max,
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

  /* ---------- stap voor stap: voordoen, samen doen, zelf doen (zie bovenaan) ----------
     Dezelfde kaart en dezelfde antwoordvormen als een gewone ronde, met daarboven de
     onderdelen en de drie fasen, en tussen het beeld en het antwoord de steiger: de stappen.
     beg: { delen, i, fase, st:{ eigen, lijst }, samenGoed, zelfGoed, foutRij, hulp, gegeven,
     vorigeFout, laatste, mis, verder, uitslag:[{ naam, zelf, gedaan, hint, klaar }] } */
  var beg = null, begTeller = 0;
  function begAantal(n, std){ return typeof n === 'number' && n > 0 ? Math.round(n) : std; }
  function begCfg(){ return cfg.begeleid || {}; }
  /* de onderdelen: de items van de keuze soort, zonder alles. Zette de docent er een vast, dan alleen dat */
  function begDelen(){
    var b = begCfg(), kid = b.keuze || 'soort', ob = b.onderdelen || {};
    var sk = (cfg.keuzes || []).filter(function(k){ return k.id === kid; })[0];
    var lijst = sk ? sk.items.filter(function(it){ return it.id !== 'alles' && ob[it.id] !== false; }) : [];
    var rij = sk && $('keuze-' + kid);
    if (rij && rij.classList.contains('hide') && keuze[kid] !== 'alles') lijst = lijst.filter(function(it){ return it.id === keuze[kid]; });
    if (!lijst.length) return [{ id:'', keuze:'', naam:cfg.naam, uit:'' }];
    return lijst.map(function(it){ var e = ob[it.id] || {}; return { id:it.id, keuze:kid, naam:it.naam, uit:e.uit || schoon(it.uit || '') }; });
  }
  function begStart(){
    if (!cfg) return;
    beg = { delen:begDelen(), i:0, uitslag:[], eerste:true };
    /* koos de leerling op het startscherm één onderdeel, dan begint hij daar */
    var kid = beg.delen[0].keuze, i = kid ? beg.delen.map(function(d){ return d.id; }).indexOf(keuze[kid]) : -1;
    nr = 0; oneindig = false;
    $('scherm-start').classList.add('hide'); $('scherm-einde').classList.add('hide'); $('scherm-spel').classList.remove('hide');
    $('scherm-spel').classList.add('begeleid');
    $('balk').classList.add('hide'); $('voortIn').parentNode.classList.add('hide');
    $('begKop').classList.remove('hide');
    if (nivToast){ clearTimeout(nivKlok); nivToast.classList.remove('aan'); }
    opnieuwKnop(false);
    begDeel(i > 0 ? i : 0);
  }
  /* terug naar een gewone ronde of het startscherm: start() en naarStart() roepen dit altijd */
  function begUit(){
    beg = null;
    if (!$('scherm-spel')) return;
    $('scherm-spel').classList.remove('begeleid');
    $('begKop').classList.add('hide'); $('begKop').innerHTML = '';
    $('steiger').classList.add('hide'); $('steiger').innerHTML = '';
    $('balk').classList.remove('hide'); $('begVbBtn').classList.add('hide');
    var vak = $('antwoordvak'); vak.removeAttribute('inert'); vak.classList.remove('vs-voordoet');
  }
  function begDeel(i){
    beg.i = i; beg.samenGoed = 0; beg.zelfGoed = 0; beg.foutRij = 0; beg.vorigeFout = false; beg.laatste = null;
    if (!beg.uitslag[i]) beg.uitslag[i] = { naam:beg.delen[i].naam, zelf:0, gedaan:0, hint:0, klaar:false };
    begVoordoen();
  }
  function begKeuze(fase){
    var k = Object.assign({}, keuze), d = beg.delen[beg.i];
    if (d.keuze) k[d.keuze] = d.id;
    k.begeleid = fase;
    return k;
  }
  /* een opgave van dit onderdeel; na een fout een die erop lijkt: dezelfde vorm, hetzelfde
     onderdeel en evenveel stappen (meestal hetzelfde soort som), als dat lukt */
  function begMaak(fase, lijkOp){
    var k = begKeuze(fase), b = begCfg(), o = null, reserve = null, reserveAnders = true;
    if (vorigeSleutels.length > 40) vorigeSleutels.splice(0, vorigeSleutels.length - 40);
    if (fase === 'voordoen' && typeof b.voorbeeld === 'function') o = b.voorbeeld(beg.delen[beg.i].id, k) || null;
    for (var p = 0; !o && p < 14; p++){
      var x = cfg.maak(Object.assign({}, k), ++begTeller);
      if (!x) continue;
      var oud = !!(x.sleutel && vorigeSleutels.indexOf(x.sleutel) >= 0);
      var anders = !!(lijkOp && (x.vorm !== lijkOp.vorm || (x.onderdeel || '') !== (lijkOp.onderdeel || '') || (x.stappen || []).length !== (lijkOp.stappen || []).length));
      if ((oud || anders) && p < 12){ if (!reserve || (reserveAnders && !anders)){ reserve = x; reserveAnders = anders; } continue; }
      o = x;
    }
    o = o || reserve;
    if (o && o.sleutel) vorigeSleutels.push(o.sleutel);
    return o;
  }
  /* de stappen van een opgave: van de opgave zelf, van begeleid.stappen, of de uitleg in zinnen */
  function begStappen(o){
    var l = Array.isArray(o.stappen) && o.stappen.length ? o.stappen : null, b = begCfg();
    if (!l && typeof b.stappen === 'function') l = b.stappen(o, begKeuze(beg.fase)) || null;
    var eigen = !!(l && l.length);
    if (!eigen) l = begZinnen(o.uitleg);
    return { eigen:eigen, lijst:l.map(function(s){ return typeof s === 'string' ? { tekst:s } : s; }).filter(function(s){ return s && s.tekst; }) };
  }
  /* de uitleg in zinnen; niet knippen na een rangnummer (1.) of een afkorting (bijv.) */
  function begZinnen(html){
    var t = String(html || '').replace(/<(div|svg|ol|ul|table)\b[\s\S]*$/i, '').replace(/<br\s*\/?>|<\/(p|li|h\d)>/gi, '\n')
      .replace(/<(?!\/?(b|i|em|strong|sub|sup)\b)[^>]*>/gi, '');
    var uit = [];
    t.split('\n').forEach(function(regel){
      var re = /[.!?]\s+(?=[A-ZÀ-Ý0-9‘“'"(<])/g, m, begin = 0;
      while ((m = re.exec(regel))){
        var stuk = regel.slice(begin, m.index + 1).trim();
        if (/^\d+[.)]$/.test(stuk) || /\b(bijv|bv|o\.a|enz|nr|ca|d\.w\.z|vs|blz)\.$/i.test(stuk)) continue;
        if (stuk) uit.push(stuk);
        begin = m.index + m[0].length;
      }
      var rest = regel.slice(begin).trim(); if (rest) uit.push(rest);
    });
    return uit;
  }
  /* bij samen doen geeft een hint nooit het antwoord: de laatste stap alleen als hij een eigen hint heeft */
  function begHintbaar(l){ return !l.length ? 0 : l[l.length - 1].hint ? l.length : l.length - 1; }
  function begAntwoord(o){
    if (o.vorm === 'meerkeuze' && o.opties) return o.opties[o.goed];
    if (o.antwoordTekst) return schoon(kaleTekst(o.antwoordTekst));
    if (o.vorm === 'invul') return o.velden.map(function(v){ return schoon((v.label ? v.label + ': ' : '') + toonAntwoord(v)); }).join('; ');
    if (o.vorm === 'sleep') return o.vakken.map(function(v, i){ return schoon(kaleTekst(v.naam) || 'vak ' + (i + 1)) + ': ' + (v.hoort || []).map(function(id){ var k = o.kaarten.filter(function(x){ return x.id === id; })[0]; return k ? k.tekst : ''; }).join(', '); }).join('; ');
    return '';
  }
  /* een stap in de lijst; bij samen doen alleen de hint als die er is (het waarom verraadt vaak de uitkomst) */
  function begLi(s, i, hint, klasse){
    var alleenHint = hint && s.hint;
    return '<li' + (klasse ? ' class="' + klasse + '"' : '') + '><i aria-hidden="true">' + (i + 1) + '</i><div><span class="vs-sr">Stap ' + (i + 1) + ': </span>' + (alleenHint ? s.hint : s.tekst) +
      (s.waarom && !alleenHint ? '<span class="vs-waarom"><b>Waarom:</b> ' + s.waarom + '</span>' : '') + '</div></li>';
  }
  function begSlot(o){ return '<li class="slot"><i aria-hidden="true">&#10003;</i><div>Het antwoord: <b>' + begAntwoord(o) + '</b></div></li>'; }
  function begSteiger(kop, intro, knop, stil){
    var st = $('steiger');
    st.innerHTML = '<p class="eyebrow' + (kop ? '' : ' hide') + '" id="steigerKop">' + kop + '</p>' + [].concat(intro || []).filter(Boolean).map(function(t){ return '<p class="vs-intro">' + t + '</p>'; }).join('') +
      '<ol class="vs-denk" id="stapLijst"></ol><p class="vs-noot hide" id="stapNoot"></p>' +
      '<div class="vs-stapknop"><button type="button" class="vs-knop' + (stil ? ' stil' : '') + '" id="stapBtn">' + knop + '</button></div>';
    st.classList.remove('hide', 'vs-dicht');
  }
  /* een nieuwe stap erbij: hardop voor een schermlezer, en in beeld als hij onder de rand valt */
  function begErbij(html){
    var l = $('stapLijst'); l.insertAdjacentHTML('beforeend', html);
    var li = l.lastElementChild, meld = $('stapMeld');
    meld.textContent = ''; setTimeout(function(){ meld.textContent = (li.querySelector('div') || li).textContent; }, 40);
    var zacht = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (li.getBoundingClientRect().bottom > innerHeight - 90) li.scrollIntoView({ block:'center', behavior: zacht ? 'smooth' : 'auto' });
  }
  /* bij voordoen het antwoord invullen in de antwoordvorm zelf */
  function begVulIn(o, vak){
    function met(sel, attr, w){ return Array.prototype.filter.call(vak.querySelectorAll(sel), function(x){ return x.getAttribute(attr) === String(w); })[0]; }
    if (typeof vak.voordoe === 'function'){ vak.voordoe(); return; }
    if (o.vorm === 'meerkeuze'){ var g = met('.optie', 'data-i', o.goed); if (g) g.classList.add('juist'); }
    else if (o.vorm === 'invul'){
      var inv = vak.querySelectorAll('input');
      o.velden.forEach(function(v, i){ if (!inv[i]) return; inv[i].value = typeof v.antwoord === 'number' && v.type !== 'tekst' ? String(v.antwoord).replace('.', ',') : (v.toon || (Array.isArray(v.antwoord) ? v.antwoord[0] : v.antwoord)); inv[i].classList.add('goed'); });
    } else if (o.vorm === 'sleep') o.vakken.forEach(function(v){
      var doel = met('.sleepdoel', 'data-id', v.id); if (!doel) return;
      (v.hoort || []).forEach(function(id){ var k = met('.sleepkaart', 'data-id', id); if (k){ doel.querySelector('.inhoud').appendChild(k); k.classList.add('goed'); } });
    });
  }
  /* de kop: de onderdelen (aantikken om te wisselen) en de drie fasen, met bij zelf doen de bolletjes */
  function begKopTeken(){
    var fasen = [['voordoen', 'voordoen'], ['samen', 'samen doen'], ['zelf', 'zelf doen']], nu = ['voordoen', 'samen', 'zelf'].indexOf(beg.fase), n = begAantal(begCfg().zelf, 3);
    $('begKop').innerHTML = (beg.delen.length > 1 ? '<div class="vs-delen" role="group" aria-label="Onderdelen">' + beg.delen.map(function(d, i){
        var u = beg.uitslag[i], af = u && u.klaar;
        return '<button type="button" data-i="' + i + '" class="' + (i === beg.i ? 'nu' : af ? 'klaar' : '') + '"' + (i === beg.i ? ' aria-current="step"' : '') + '>' + schoon(d.naam) + (af ? '<span class="vs-sr"> (af)</span>' : '') + '</button>';
      }).join('') + '</div>' : '') +
      '<ol class="vs-fasen" aria-label="Fasen">' + fasen.map(function(f, i){
        return '<li class="' + (i === nu ? 'nu' : i < nu ? 'af' : '') + '"' + (i === nu ? ' aria-current="step"' : '') + '><i aria-hidden="true">' + (i + 1) + '</i><span>' + f[1] + '</span>' +
          (f[0] === 'zelf' ? '<span class="vs-bol" aria-hidden="true">' + Array.apply(null, Array(n)).map(function(x, j){ return '<span' + (j < beg.zelfGoed ? ' class="aan"' : '') + '></span>'; }).join('') + '</span><span class="vs-sr">, ' + beg.zelfGoed + ' van de ' + n + ' zelf goed</span>' : '') + '</li>';
      }).join('') + '</ol>';
    var aan = $('begKop').querySelector('.vs-delen .nu'), rij = aan && aan.parentNode;
    if (aan && rij.scrollWidth > rij.clientWidth) rij.scrollLeft = aan.offsetLeft - rij.offsetLeft - 12;
  }
  /* 1. voordoen: het uitgewerkte voorbeeld, een stap per klik, en dan het antwoord ingevuld */
  function begVoordoen(){
    beg.fase = 'voordoen'; beg.verder = null; beg.mis = -1; beg.hulp = 0;
    var d = beg.delen[beg.i], o = begMaak('voordoen');
    if (!o){ begEinde(); return; }
    opgave = o; bezig = false; nr++;
    tekenOpgave();
    var vak = $('antwoordvak'); vak.setAttribute('inert', ''); vak.classList.add('vs-voordoet');
    beg.st = begStappen(o);
    $('onderdeelUit').textContent = 'voordoen' + (d.id ? ' · ' + d.naam : '');
    begKopTeken();
    var intro = [beg.eerste ? 'Eerst zie je hoe het gaat, stap voor stap en met waarom. Daarna maak je er een met de stappen als hulp, en dan zelf.' : '', d.uit];
    beg.eerste = false;
    var l = beg.st.lijst, st = 0;
    begSteiger('zo pak je het aan', intro, l.length ? 'Eerste stap' : 'Laat het antwoord zien');
    var knop = $('stapBtn');
    knop.addEventListener('click', function(){
      if (!beg || beg.fase !== 'voordoen') return;
      if (st < l.length){ begErbij(begLi(l[st], st)); st++; knop.textContent = st < l.length ? 'Volgende stap' : 'Het antwoord'; return; }
      begErbij(begSlot(o));
      begVulIn(o, vak);
      knop.parentNode.classList.add('hide');
      begVerderKnop('Nu jij, met hulp', function(){ begOpgave('samen'); });
    });
    setTimeout(function(){ try { knop.focus({ preventScroll:true }); } catch (e){} }, 60);
  }
  /* 2. en 3. samen doen en zelf doen: een gewone opgave, met of zonder steiger */
  function begOpgave(fase){
    beg.fase = fase; beg.hulp = 0; beg.mis = -1; beg.gegeven = 0;
    var d = beg.delen[beg.i], o = begMaak(fase, beg.vorigeFout ? beg.laatste : null);
    if (!o){ begEinde(); return; }
    beg.laatste = o;
    var vak = $('antwoordvak'); vak.removeAttribute('inert'); vak.classList.remove('vs-voordoet');
    opgave = o; bezig = true; nr++;
    tekenOpgave();
    beg.st = begStappen(o);
    $('onderdeelUit').textContent = (fase === 'samen' ? 'samen doen' : 'zelf doen') + (d.id ? ' · ' + d.naam : '');
    begKopTeken();
    var l = beg.st.lijst, n = begHintbaar(l), zelf = fase === 'zelf';
    if (!zelf){
      begSteiger('de stappen', !beg.st.eigen && d.uit ? '<b>Tip:</b> ' + d.uit : '', 'Geef een stap', true);
      /* de eerste opgave, en na een fout: stap 1 staat er al */
      if (n && (beg.samenGoed === 0 || beg.vorigeFout)){ $('stapLijst').innerHTML = begLi(l[0], 0, true); beg.gegeven = 1; }
      if (!n && !beg.st.eigen && !d.uit) $('steiger').classList.add('hide');
    } else {
      /* de steiger is weg; alleen een knop voor wie echt vastzit */
      begSteiger('', '', 'Ik zit vast: geef een stap', true);
      $('steiger').classList.add('vs-dicht');
      if (!n) $('steiger').classList.add('hide');
    }
    var knop = $('stapBtn');
    knop.parentNode.classList.toggle('hide', beg.gegeven >= n);
    knop.addEventListener('click', function(){
      if (!bezig || !beg || beg.gegeven >= n) return;
      if (zelf){ $('steiger').classList.remove('vs-dicht'); $('steigerKop').textContent = 'de stappen'; $('steigerKop').classList.remove('hide'); }
      beg.hulp++;
      begErbij(begLi(l[beg.gegeven], beg.gegeven, true));
      beg.gegeven++;
      var noot = $('stapNoot');
      if (zelf){ noot.textContent = 'Met een hint telt deze niet als zelf goed.'; noot.classList.remove('hide'); }
      if (beg.gegeven >= n){
        knop.parentNode.classList.add('hide');
        if (!zelf){ noot.textContent = 'Meer stappen zijn er niet: de laatste stap is het antwoord zelf.'; noot.classList.remove('hide'); }
        var eerst = vak.querySelector('input:not([disabled]), .optie, .sleepkaart, button');
        if (eerst) eerst.focus({ preventScroll:true });
      } else knop.textContent = 'Nog een stap';
    });
  }
  /* welke stap misging: wat de opgave zelf zegt, of via veld, optie en kaart */
  function begMisStap(o, l){
    var vak = $('antwoordvak');
    if (typeof o.foutStap === 'function'){ var r = o.foutStap(vak); return typeof r === 'number' && l[r] ? r : -1; }
    var inv = vak.querySelectorAll('input'), mis = vak.querySelector('.optie.mis'), gekozen = mis ? +mis.getAttribute('data-i') : null;
    var kaarten = Array.prototype.map.call(vak.querySelectorAll('.sleepkaart.fout'), function(k){ return k.getAttribute('data-id'); });
    for (var i = 0; i < l.length; i++){
      var s = l[i];
      if (s.veld != null && [].concat(s.veld).some(function(v){ return inv[v] && inv[v].classList.contains('fout'); })) return i;
      if (s.optie != null && gekozen !== null && [].concat(s.optie).indexOf(gekozen) >= 0) return i;
      if (s.kaart != null && [].concat(s.kaart).some(function(id){ return kaarten.indexOf(id) >= 0; })) return i;
    }
    return -1;
  }
  function begVolgendDeel(){
    for (var j = 1; j <= beg.delen.length; j++){ var k = (beg.i + j) % beg.delen.length; if (!beg.uitslag[k] || !beg.uitslag[k].klaar) return k; }
    return -1;
  }
  function begVerderKnop(tekst, fn, voorbeeld){
    beg.verder = fn;
    $('verderBtn').textContent = tekst;
    $('begVbBtn').classList.toggle('hide', !voorbeeld);
    $('stopBtn').classList.remove('hide');
    $('verder').classList.remove('hide');
    setTimeout(function(){ $('verderBtn').focus({ preventScroll:true }); inBeeld(); }, 30);
  }
  function begVerder(){ var f = beg && beg.verder; if (!f) return; beg.verder = null; $('begVbBtn').classList.add('hide'); f(); }
  /* nagekeken: wat er goed of mis ging, bij een fout de stap waar het misging, en waar het heen gaat */
  function begKlaar(isGoed, extra, deels){
    var b = begCfg(), fase = beg.fase, u = beg.uitslag[beg.i], l = beg.st.lijst, zelfZonder = fase === 'zelf' && !beg.hulp;
    var nodigSamen = begAantal(b.samen, 2), nodigZelf = begAantal(b.zelf, 3);
    var bijna = !isGoed && deels && deels.van > 1 && deels.goed * 2 >= deels.van;
    u.gedaan++; if (beg.hulp) u.hint++;
    beg.mis = isGoed ? -1 : begMisStap(opgave, l);
    if (fase === 'samen' && isGoed) beg.samenGoed++;
    if (fase === 'zelf'){ if (isGoed){ beg.foutRij = 0; if (zelfZonder){ beg.zelfGoed++; u.zelf++; } } else beg.foutRij++; }
    beg.vorigeFout = !isGoed;
    /* waar het heen gaat */
    var naar, noot = '';
    if (fase === 'samen'){
      naar = !isGoed ? ['Een vergelijkbare opgave', function(){ begOpgave('samen'); }, true]
        : beg.samenGoed >= nodigSamen ? ['Nu zelf, zonder hulp', function(){ begOpgave('zelf'); }]
        : ['Volgende opgave', function(){ begOpgave('samen'); }];
    } else if (beg.zelfGoed >= nodigZelf){
      u.klaar = true;
      noot = '<p class="vs-af">Dit onderdeel zit erin: ' + nodigZelf + ' keer goed zonder hulp.</p>';
      var volg = begVolgendDeel();
      naar = volg >= 0 ? ['Volgende onderdeel: ' + beg.delen[volg].naam, function(){ begDeel(volg); }] : ['Naar het overzicht', begEinde];
    } else if (!isGoed && beg.foutRij >= 2){
      /* twee keer mis op rij: de steiger komt terug, voor één opgave */
      beg.samenGoed = Math.max(0, nodigSamen - 1); beg.foutRij = 0;
      noot = '<p>Twee keer mis op rij. Je krijgt de stappen weer even als hulp.</p>';
      naar = ['Nog een keer met hulp', function(){ begOpgave('samen'); }, true];
    } else naar = [!isGoed ? 'Een vergelijkbare opgave' : 'Volgende opgave', function(){ begOpgave('zelf'); }];
    var s = beg.mis >= 0 ? l[beg.mis] : null;
    var kop = isGoed ? (fase === 'zelf' ? (zelfZonder ? 'Goed, helemaal zelf!' : 'Goed, met hulp. Deze telt nog niet als zelf goed.') : beg.hulp ? 'Goed, met ' + (beg.hulp === 1 ? 'één stap' : beg.hulp + ' stappen') + ' als hulp.' : 'Goed!')
      : bijna ? 'Bijna: ' + deels.goed + ' van de ' + deels.van + ' goed.' : 'Niet goed.';
    var h = '<div class="uitslagregel ' + (isGoed ? 'goed' : bijna ? 'bijna' : 'fout') + '"><b>' + (isGoed && window.NAGEKEKEN ? NAGEKEKEN.svg({ maat: 24, teken: true }) : '') + kop + '</b>' + (extra ? '<p>' + extra + '</p>' : '');
    if (s) h += '<div class="vs-misstap"><p class="eyebrow">hier ging het mis: stap ' + (beg.mis + 1) + '</p><p>' + s.tekst + '</p>' + (s.fout ? '<p><b>Let op:</b> ' + s.fout + '</p>' : '') + (s.waarom ? '<p class="vs-waarom"><b>Waarom:</b> ' + s.waarom + '</p>' : '') + '</div>';
    else if (!isGoed && beg.st.eigen) h += '<p>Loop de stappen hierboven na: waar wijkt jouw antwoord af?</p>';
    /* zonder eigen stappen: de uitleg van het spel zelf, met plaatje en al */
    if (!beg.st.eigen && opgave.uitleg) h += '<div class="waarom">' + opgave.uitleg + '</div>';
    $('reactie').innerHTML = h + noot + '</div>';
    /* met eigen stappen: de hele uitwerking in de steiger, de foute stap gemarkeerd; bij zelf goed hoeft dat niet */
    if (beg.st.eigen && l.length && !(isGoed && fase === 'zelf')){
      $('steiger').classList.remove('hide', 'vs-dicht');
      $('steiger').innerHTML = '<p class="eyebrow">zo gaat het, stap voor stap</p><ol class="vs-denk">' + l.map(function(x, i){ return begLi(x, i, false, i === beg.mis ? 'mis' : ''); }).join('') + begSlot(opgave) + '</ol>';
    } else $('steiger').classList.add('hide');
    begKopTeken();
    begVerderKnop(naar[0], naar[1], naar[2]);
  }
  /* het overzicht: per onderdeel af of niet; munten voor wat zelf goed was, verder telt het nergens mee */
  function begEinde(){
    if (!beg) return;
    var b = beg, lijst = b.uitslag.filter(Boolean), af = lijst.filter(function(u){ return u.klaar; }).length, zelf = lijst.reduce(function(s, u){ return s + u.zelf; }, 0);
    bezig = false;
    begUit();
    $('scherm-spel').classList.add('hide'); $('scherm-einde').classList.remove('hide');
    opnieuwKnop(false);
    $('eindKop').textContent = b.delen.length > 1 ? 'Stap voor stap: ' + af + ' van de ' + b.delen.length + ' onderdelen af.' : af ? 'Stap voor stap: dit zit erin.' : 'Stap voor stap: gestopt.';
    $('eindBand').textContent = (zelf ? 'Je had ' + zelf + (zelf === 1 ? ' opgave' : ' opgaven') + ' goed zonder hulp. ' : '') +
      'Dit was oefenen met hulp: het telt niet voor je beste score of voor de klas. ' + (af === b.delen.length ? 'Probeer nu een gewone ronde.' : 'De onderdelen die nog niet af zijn, kun je later stap voor stap afmaken.');
    $('groei').classList.add('hide'); $('zwakst').classList.add('hide'); $('missers').innerHTML = '';
    $('perdeel').innerHTML = lijst.map(function(u){ return '<span class="' + (u.klaar ? 'g' : 'm') + '">' + schoon(u.naam) + '<b>' + (u.klaar ? 'af' : 'nog niet af') + '</b> <small>' + u.zelf + ' zelf goed</small></span>'; }).join('');
    if (window.SPEL && SPEL.einde) SPEL.einde({ spel:cfg.id, vak:cfg.vak, kop:'stap voor stap', compact:true, klas:false, goed:zelf, reeks:0, sleutel:'stapvoorstap',
      opnieuw:function(){ start(false); }, opnieuwTekst:'Nu een gewone ronde' });
    window.scrollTo({ top:0, behavior:'auto' });
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
    /* "twintig opgaven per ronde, of kies 10 of 30": de tijd hoort bij die twintig */
    return t + ', ongeveer ' + minuten(/twintig/.test(t) ? 20 : /dertig/.test(t) ? 30 : /\btien\b/.test(t) ? 10 : (cfg.aantal || 10)) + ' minuten';
  }
  function naLaden(fn){ if (document.readyState === 'complete') fn(); else addEventListener('load', fn); }

  /* ---------- de werkbladstand ----------
     Met ?werkblad=1 in het adres tekent de pagina geen spel, maar wacht hij in
     een verborgen iframe op werkblad.html. Die vraagt de keuzes op en laat
     opgaven maken, en krijgt ze terug als html: de vraag met het beeld en de
     antwoordruimte, en het antwoord voor het antwoordblad. */
  /* genoeg letters: een windroos heeft acht keuzes, een zin om het foute woord in aan te wijzen soms meer */
  var LET = 'abcdefghijklmnopqrstuvwxyz'.split('');
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
      antwoord = o.velden.map(function(v){ return (v.label ? v.label + ': ' : '') + (v.voor && !v.toon ? v.voor + ' ' : '') + toonAntwoord(v); }).join('; ');
    } else if (o.vorm === 'sleep'){
      var kaarten = o.vasteVolgorde ? o.kaarten.slice() : husselen(o.kaarten), let2 = {};
      kaarten.forEach(function(k, i){ let2[k.id] = LET[i] || String(i + 1); });
      vr += '<div class="sleep-wb"><p class="kaartjes-wb">' + kaarten.map(function(k){ return '<span><b>' + let2[k.id] + '</b>' + k.tekst + '</span>'; }).join('') + '</p>' +
        '<p class="vakken-wb">' + o.vakken.map(function(v, i){ return '<span><b>' + (v.naam ? v.naam : 'vak ' + (i + 1)) + (v.uit ? ' <small>(' + schoon(v.uit) + ')</small>' : '') + '</b> <i class="lijn kort"></i></span>'; }).join('') + '</p>' +
        '<p class="opdr">Schrijf bij elk vak de letters van de kaartjes die erin horen.</p></div>';
      antwoord = o.vakken.map(function(v, i){ return (v.naam || 'vak ' + (i + 1)) + ': ' + (v.hoort || []).map(function(id){ return let2[id]; }).join(', '); }).join('; ');
    } else if (o.vorm === 'eigen' && typeof o.teken === 'function'){
      var d = document.createElement('div');
      /* papier: true zegt het spel dat het op een werkblad staat; het kan dan tekenen wat op papier kan */
      try { o.teken(d, { klaar:function(){}, knop:function(){ var b = document.createElement('button'); return b; }, uit:function(){}, bezig:function(){ return true; }, husselen:husselen, schoon:schoon, getal:getal, papier:true }); } catch (e){}
      Array.prototype.forEach.call(d.querySelectorAll('.nakijk, input[type=range]'), function(x){ x.parentNode.removeChild(x); });
      /* Een knop met een partij of een naam erop is de opgave zelf: die wordt een
         vakje om te omcirkelen. Een knop om verder te gaan kan op papier niet. */
      Array.prototype.forEach.call(d.querySelectorAll('button'), function(x){
        if (/^(volgende|nakijken|opnieuw|wis|stop|terug|klaar|controleer)/i.test(x.textContent.trim()) || /Btn$/.test(x.id)){ x.parentNode.removeChild(x); return; }
        var s = document.createElement('span'); s.className = 'wb-keus ' + x.className; s.innerHTML = x.innerHTML; x.parentNode.replaceChild(s, x);
      });
      Array.prototype.forEach.call(d.querySelectorAll('input'), function(x){ x.setAttribute('readonly', ''); x.value = ''; });
      vr += '<div class="eigen-wb">' + d.innerHTML + '</div>';
      antwoord = o.antwoordTekst || '';
      /* Tekent het spel op papier keuzes met een letter (Wie ben ik?), dan komt
         die letter ook op het antwoordblad: "b. Willem van Oranje", net als bij meerkeuze. */
      Array.prototype.forEach.call(d.querySelectorAll('.opties > span'), function(x){
        var b = x.querySelector('b'); if (!b || !antwoord) return;
        var tekst = x.textContent.slice(b.textContent.length).trim();
        if (tekst && tekst === String(o.antwoordTekst).replace(/<[^>]+>/g, '').trim()) antwoord = b.textContent.trim() + '. ' + tekst;
      });
    }
    return { kop: o.onderdeelNaam || o.onderdeel || '', vraag: vr, antwoord: antwoord || o.antwoordTekst || '', uitleg: (o.uitleg || '').replace(/<div[\s\S]*$/, '') };
  }
  function werkbladModus(c){
    cfg = c;
    document.body.innerHTML = '<p style="font:14px system-ui;padding:12px;color:#666">Dit venster maakt opgaven voor een werkblad. Open <a href="' + location.pathname + '">het spel zelf</a> om te oefenen.</p>';
    var stijl = Array.prototype.map.call(document.querySelectorAll('style'), function(s){ return s.textContent; }).join('\n');
    /* alleen met een werkblad van deze site praten, niet met een pagina die ons in een frame zet */
    function stuur(b){ if (window.parent && window.parent !== window) window.parent.postMessage(b, location.origin); }
    addEventListener('message', function(e){
      if (e.origin !== location.origin || e.source !== window.parent) return;
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
    cfg = c; cfg.basisAantal = c.aantal || 10; if (!c.vastAantal) cfg.aantal = aantal;
    bouw();
    herinner();
    tekenKeuzes();
    leadKort();
    $('startBtn').addEventListener('click', function(){ start(oneindigUrl); });
    $('keuze-aantal').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; aantal = +b.getAttribute('data-n'); try { localStorage.setItem('lg-aantal', String(aantal)); } catch (x){} tekenAantal(); });
    /* ?aantal=20 uit een opdracht van de docent */
    (function(){ var ma = /[?&]aantal=(\d+)/.exec(location.search); if (ma && AANTALLEN.indexOf(+ma[1]) >= 0) aantal = +ma[1]; })();
    tekenAantal();
    $('zelfVoor').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; var z = +b.getAttribute('data-z'); zelfVoor = zelfVoor === z ? null : z;
      Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){ var aan = +x.getAttribute('data-z') === zelfVoor; x.classList.toggle('on', aan); x.setAttribute('aria-pressed', aan ? 'true' : 'false'); }); });
    $('oneindigBtn').addEventListener('click', function(){ start(true); });
    $('stopBtn').addEventListener('click', function(){ if (bezig) return; if (beg) begEinde(); else einde(); });
    /* stap voor stap: met de knop, of met ?begeleid=1 van de docent meteen */
    $('begeleidBtn').addEventListener('click', function(){ begStart(); });
    $('begVbBtn').addEventListener('click', function(){ if (beg && !bezig){ beg.verder = null; $('begVbBtn').classList.add('hide'); begVoordoen(); } });
    $('begKop').addEventListener('click', function(e){ var b = e.target.closest('.vs-delen button'); if (b && beg) begDeel(+b.getAttribute('data-i')); });
    /* de docent linkt met ?oneindig=1: dan is Start meteen oneindig */
    if (oneindigUrl){ $('startBtn').textContent = 'Start: oneindig oefenen'; $('oneindigBtn').classList.add('hide'); }
    $('verderBtn').addEventListener('click', function(){ if (!bezig) volgende(); });
    /* ?start=1: de opdracht van de docent in de leeromgeving aangeklikt, dus meteen beginnen */
    /* een spel met een eigen leerroute (begeleid:false) heeft deze knop niet nodig */
    if (cfg.begeleid === false) $('begeleidBtn').classList.add('hide');
    if (cfg.begeleid !== false && /[?&]begeleid=1\b/.test(location.search)) setTimeout(function(){ begStart(); }, 0);
    else if (/[?&]start=1\b/.test(location.search)) setTimeout(function(){ start(oneindigUrl); }, 0);
    /* nog een ronde: meteen, met dezelfde keuzes; wie iets anders wil, gaat via Opnieuw naar het startscherm */
    $('nogBtn').addEventListener('click', function(){ start(oneindig); });
    $('opnieuwBtn').addEventListener('click', function(){
      /* midden in een ronde: eerst vragen, want je raakt je antwoorden kwijt */
      var bezigMet = !$('scherm-spel').classList.contains('hide') && (nr > 0 || !!beg);
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
      if (!bezig && (e.key === 'Enter' || e.key === ' ') && !inInvoer && (!opKnop || opKnop.id === 'verderBtn')){
        /* stap voor stap: Enter gaat alleen door als Volgende er staat, niet midden in een voorbeeld */
        if (beg && $('verder').classList.contains('hide')) return;
        e.preventDefault(); volgende(); return;
      }
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
           _werkbladItem: function(o){ return werkbladItem(o); }, _opgave: function(){ return opgave; }, _cfg: function(){ return cfg; }, _keuze: function(){ return keuze; },
           _beg: function(){ return beg ? { fase:beg.fase, deel:beg.delen[beg.i].id, delen:beg.delen.length, samenGoed:beg.samenGoed, zelfGoed:beg.zelfGoed, hulp:beg.hulp, stappen:beg.st ? beg.st.lijst.length : 0, eigen:beg.st ? beg.st.eigen : false, mis:beg.mis } : null; }, _stand: function(){ return { nr:nr, goed:goed, fout:fout, punten:punten, bezig:bezig, od:od }; } };
})();
