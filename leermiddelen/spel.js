/* Het gedeelde skelet van elk spel: het uitlegpaneel op het startscherm en
   de eindkaart op het eindscherm. Elk spel houdt zijn eigen inhoud; dit
   zorgt dat de vaste stukken er overal hetzelfde uitzien en werken.

   Gebruik:
     SPEL.uitleg({ doel:'...', tijd:'...', bediening:'...' })
       Zet onder de inleiding een paneel met drie regels en het plaatje van
       het spel. Lange uitleg die al op het startscherm stond (.uitleg en
       .tip) verhuist naar "Alle regels" in het paneel. Wie op "Begrepen"
       tikt ziet het paneel de volgende keer ingeklapt (localStorage).
       Heeft het spel een uitleg stap voor stap (uitleg/<spel>.js, zie
       MET_STAPPEN), dan komt er een knop bij die hem opent; met ?uitleg in
       het adres gaat hij meteen open, handig op het digibord.
       Extra velden, allemaal los te gebruiken:
         onder:'id' (of true)  het paneel komt na dat blok in plaats van na
                               de inleiding; true is het blok met de startknop.
                               Zo staat Start direct onder de keuzes.
         links:true            het paneel lijnt links uit, voor een startscherm
                               dat links uitlijnt.
         chips:true            elke keuzeknop op het startscherm krijgt
                               aria-pressed, gelijk met de klasse 'on'.
         zeker:'id'            die knop in de kop (Opnieuw) vraagt tijdens een
                               lopend spel eerst "Zeker? Tik nog eens";
                               loopt:function geeft true als er een spel loopt.
         tegel:[kleur, svg]    het plaatje in het paneel; zonder staat daar de
                               tegel uit de leeromgeving (TEGEL) of het icoon.
     SPEL.inBeeld(el)
       Schuift el in beeld als hij er (half) buiten staat, zacht als dat mag.
     SPEL.einde({ spel:'toren', score:12, label:'rondes', max:20, sterren:2,
                  ronde:12, punten:340, niveau:'havo', vak:'ges', ... })
       Zet bovenaan het eindscherm een kaart met de score, sterren, het beste
       resultaat ooit op dit apparaat, en de knoppen Nog een keer, Delen en
       Alle spellen. Meldt de uitslag bij de klas als er een klascode staat
       (klas.js), tenzij klas:false. Zie einde() voor alle velden. */
window.SPEL = (function(){
  'use strict';
  /* Een vinger is geen muis en zeker geen toetsenbord. Wie op een
     aanraakscherm speelt krijgt de klasse 'raak' op <html>, zodat de
     opmaak en de uitleg kunnen zeggen "tik" waar ze anders "klik" zeggen. */
  var raak = false;
  try { raak = (matchMedia && matchMedia('(pointer:coarse)').matches) || navigator.maxTouchPoints > 0; } catch (e) { raak = false; }
  if (raak) document.documentElement.classList.add('raak');
  var bestand = (location.pathname.split('/').pop() || 'spel').replace(/\.html$/, '') || 'spel';
  var SITE = 'meneergreidanus.nl';
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function lees(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e){ return null; } }
  function zet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e){} }
  function naamVanSpel(){
    var h = document.querySelector('#scherm-start h1') || document.querySelector('h1');
    return (h ? h.textContent : document.title).trim();
  }
  function icoon(){ var l = document.querySelector('link[rel="icon"]'); return l ? l.getAttribute('href') : ''; }
  var IC = {
    doel:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>',
    tijd:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    hand:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6.5a1.5 1.5 0 0 1 3 0V12M17 11.5V8.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4 13.5a1.6 1.6 0 0 1 2.6-1.8L8 13"/></svg>',
    vraag:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/></svg>',
    ster:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z"/></svg>',
    deel:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3M8 7l4-4 4 4"/></svg>',
    opnieuw:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16M4 20v-4h4"/></svg>',
    alle:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    trap:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h5v-5h5v-5h5V5h3"/></svg>'
  };
  /* De tegel van een spel: dezelfde kleur en hetzelfde plaatje als op de
     tegel in de leeromgeving (index.html), zodat een leerling het spel daar
     en hier herkent. Een spel dat hier niet staat, houdt zijn eigen icoon. */
  var TEGEL = {
    rekenen:['#EA9836', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h8"/>'],
    dag:['#204ECF', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>'],
    fouten:['#F26749', '<path d="M4 4h12l4 4v12H4z"/><path d="M8 12l3 3 5-6"/>'],
    race:['#EA9836', '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/>'],
    balans:['#F26749', '<path d="M12 3v18M7 21h10"/><path d="M4 8h16"/><path d="M4 8l-2.5 6a3 3 0 0 0 5 0z"/><path d="M20 8l2.5 6a3 3 0 0 1-5 0z"/>'],
    vlakken:['#204ECF', '<rect x="3" y="4" width="9" height="9" rx="1"/><path d="M16.5 10.5 21.5 20h-10z"/><circle cx="7" cy="18" r="3.2"/>'],
    irregular:['#204ECF', '<path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 1.5z"/><path d="M9 9h6M9 13h4"/>'],
    vlaggen:['#204ECF', '<path d="M5 21V4"/><path d="M5 4.5h12l-2.5 4L17 12.5H5z"/>'],
    landenvormen:['#2f7d52', '<path d="M4 6.5l5.5-2 5 2 5.5-2v13l-5.5 2-5-2-5.5 2z"/><path d="M9.5 4.5v13M14.5 6.5v13"/>'],
    lichaam:['#2f7d52', '<path d="M12 21c-5-4-8-7.5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 3.5-3 7-8 11z"/>'],
    organisme:['#83A5F2', '<circle cx="12" cy="12" r="9"/><circle cx="9.5" cy="10" r="2.6"/><ellipse cx="15" cy="14.5" rx="2.6" ry="1.5"/>'],
    werkwoorden:['#F26749', '<path d="M4 20l1-4L16.4 4.6a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/><path d="M4 20l4-1"/>'],
    zinsbouw:['#204ECF', '<rect x="3" y="5" width="6" height="5" rx="1.4"/><rect x="11" y="5" width="10" height="5" rx="1.4"/><rect x="3" y="14" width="9" height="5" rx="1.4"/><rect x="14" y="14" width="7" height="5" rx="1.4"/>'],
    tekstdetective:['#204ECF', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M7.5 9h6M7.5 12h4"/>'],
    uitverkoop:['#EA9836', '<path d="M13 4H6.5A2.5 2.5 0 0 0 4 6.5V13l7.5 7.5 8.5-8.5z"/><circle cx="8.5" cy="8.5" r="1.6"/>'],
    breukenbakker:['#F26749', '<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.5 6.5"/><path d="M12 12 5.5 18.5"/>'],
    dhte:['#204ECF', '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M9.2 10v9M14.8 10v9"/>']
  };
  var zachtMag = true;
  try { zachtMag = !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){}
  /* Een element in beeld schuiven, alleen als het er (half) buiten staat. Op
     een telefoon valt de uitleg na een antwoord anders onder de vouw. */
  function inBeeld(el){
    el = typeof el === 'string' ? $(el) : el;
    if (!el || !el.getBoundingClientRect) return;
    var r = el.getBoundingClientRect(), kop = document.querySelector('header'),
        boven = kop && getComputedStyle(kop).position === 'sticky' ? kop.getBoundingClientRect().bottom : 0;
    if (r.top >= boven && r.bottom <= innerHeight) return;
    try { el.scrollIntoView({ block:'nearest', behavior: zachtMag ? 'smooth' : 'auto' }); } catch (e){ el.scrollIntoView(false); }
  }

  /* ---------- uitleg stap voor stap ----------
     De spellen met een eigen uitleg in uitleg/<spel>.js. De speler zelf
     (stappen.js) en de inhoud komen pas binnen als iemand erom vraagt. */
  var MET_STAPPEN = [
    'balans', 'berlijn', 'breukenbakker', 'bronnenlab', 'crisis', 'dag', 'dhte', 'feodalisme', 'fouten',
    'handel', 'irregular', 'jagers', 'landenvormen', 'leenmannen', 'lichaam', 'meetlat', 'organisme', 'polis',
    'race', 'rekenen', 'stad', 'stadsontwerp', 'standen', 'tekstdetective', 'tijdvakken', 'topografie', 'toren',
    'uitverkoop', 'vergadering', 'vlaggen', 'vlakken', 'werkwoorden', 'zinsbouw', 'zwaard'
  ];
  var MAP = (function(){
    try {
      var s = document.currentScript || [].slice.call(document.scripts).filter(function(x){ return /(^|\/)spel\.js/.test(x.src); })[0];
      if (s && s.src) return s.src.replace(/spel\.js.*$/, '');
    } catch (e){}
    return '';
  })();
  var geladen = {};
  function laad(pad){
    if (geladen[pad]) return geladen[pad];
    geladen[pad] = new Promise(function(klaar, mis){
      var s = document.createElement('script');
      s.src = MAP + pad; s.onload = klaar;
      s.onerror = function(){ delete geladen[pad]; mis(new Error('niet geladen: ' + pad)); };
      document.head.appendChild(s);
    });
    return geladen[pad];
  }
  function heeftStappen(){ return MET_STAPPEN.indexOf(bestand) >= 0; }
  /* welke: het kenmerk van een uitleg om meteen te openen (anders de kiezer) */
  function stappen(welke){
    if (!heeftStappen()) return Promise.resolve(false);
    return laad('stappen.js').then(function(){ return laad('uitleg/' + bestand + '.js'); })
      .then(function(){ return window.STAPPEN ? STAPPEN.open(bestand, naamVanSpel(), welke) : false; })
      .catch(function(){ return false; });
  }

  /* ---------- het uitlegpaneel ---------- */
  function uitleg(o){
    o = o || {};
    var start = $(o.in || 'scherm-start');
    if (!start || start.querySelector('.uitlegpaneel')) return null;
    var sleutel = 'lg-uitleg-' + bestand, gezien = lees(sleutel) === 1;
    var paneel = document.createElement('div');
    paneel.className = 'uitlegpaneel';
    paneel.setAttribute('role', 'region');
    paneel.setAttribute('aria-label', 'Hoe werkt ' + naamVanSpel());
    var ic = icoon(), tg = o.tegel || TEGEL[bestand];
    if (o.links) paneel.classList.add('links');
    paneel.innerHTML =
      '<div class="beeld">' + (tg ? '<span class="speltegel" style="background:' + schoon(tg[0]) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + tg[1] + '</svg></span>'
        : ic ? '<img src="' + schoon(ic) + '" alt="">' : '') + '</div>' +
      '<div class="regels">' +
        (o.doel ? '<div class="regel">' + IC.doel + '<span><b>Doel</b>' + schoon(o.doel) + '</span></div>' : '') +
        (o.tijd ? '<div class="regel">' + IC.tijd + '<span><b>Tijd</b>' + schoon(o.tijd) + '</span></div>' : '') +
        (o.bediening ? '<div class="regel">' + IC.hand + '<span><b>Bediening</b>' + schoon(o.bediening) + '</span></div>' : '') +
        '<div class="knoppen"><button type="button" class="begrepen">Begrepen</button>' +
          (heeftStappen() ? '<button type="button" class="stil stappen-knop">' + IC.trap + 'Uitleg stap voor stap</button>' : '') +
          '<button type="button" class="stil regels-knop">Alle regels</button></div>' +
        '<div class="meer"></div>' +
      '</div>';
    /* wat er al aan lange uitleg stond, gaat achter "Alle regels" */
    var meer = paneel.querySelector('.meer'), lang = [];
    if (o.meer !== false){
      lang = Array.prototype.slice.call(start.querySelectorAll(o.meer || '.uitleg, .tip'));
      lang.forEach(function(el){ meer.appendChild(el); });
    }
    var regelsKnop = paneel.querySelector('.regels-knop');
    if (!lang.length) regelsKnop.hidden = true;
    regelsKnop.addEventListener('click', function(){
      var open = paneel.classList.toggle('open');
      regelsKnop.textContent = open ? 'Regels dicht' : 'Alle regels';
    });
    var knop = document.createElement('button');
    knop.type = 'button'; knop.className = 'uitlegknop';
    knop.innerHTML = IC.vraag + 'Hoe werkt het?';
    /* ingeklapt staat de stap-voor-stapknop naast "Hoe werkt het?" */
    var stapKnop = null;
    if (heeftStappen()){
      stapKnop = document.createElement('button');
      stapKnop.type = 'button'; stapKnop.className = 'uitlegknop stapknop';
      stapKnop.innerHTML = IC.trap + 'Uitleg stap voor stap';
      stapKnop.addEventListener('click', function(){ stappen(); });
      paneel.querySelector('.stappen-knop').addEventListener('click', function(){ stappen(); });
    }
    function toon(open){
      paneel.hidden = !open; knop.hidden = open;
      if (stapKnop) stapKnop.hidden = open;
    }
    paneel.querySelector('.begrepen').addEventListener('click', function(){ zet(sleutel, 1); toon(false); });
    knop.addEventListener('click', function(){ toon(true); });
    /* onder: het paneel na de keuzes en Start, zodat Start niet onder de vouw valt */
    var na = null;
    if (o.onder === true){
      na = start.querySelector('#startBtn') || start.querySelector('.btn');
      while (na && na.parentNode !== start) na = na.parentNode;
      /* het regeltje onder Start (een ronde is ..., oneindig: ...) hoort bij Start */
      while (na && na.nextElementSibling && na.nextElementSibling.classList.contains('oneindiguit')) na = na.nextElementSibling;
    } else if (o.onder) na = typeof o.onder === 'string' ? $(o.onder) : o.onder;
    if (!na || !start.contains(na)){ na = start.querySelector('.lead'); if (na && na.parentNode !== start) na = null; }
    if (na){ if (stapKnop) na.insertAdjacentElement('afterend', stapKnop); na.insertAdjacentElement('afterend', knop); na.insertAdjacentElement('afterend', paneel); }
    else { if (stapKnop) start.insertBefore(stapKnop, start.firstChild); start.insertBefore(knop, start.firstChild); start.insertBefore(paneel, start.firstChild); }
    if (o.onder){ knop.classList.add('onder'); if (stapKnop) stapKnop.classList.add('onder'); }
    toon(!gezien);
    if (o.chips) drukknoppen(start);
    if (o.zeker) zeker(o.zeker, o.loopt);
    /* ?uitleg of ?uitleg=optellen in het adres: meteen open */
    try {
      var q = new URLSearchParams(location.search);
      if (q.has('uitleg') && heeftStappen()) stappen(q.get('uitleg') || null);
    } catch (e){}
    return { open:function(){ toon(true); }, dicht:function(){ toon(false); } };
  }

  /* ---------- keuzeknoppen met aria-pressed ----------
     Een keuzeknop is gekozen als hij de klasse 'on' heeft. Een schermlezer
     ziet dat niet, dus elke knop in dezelfde rij krijgt aria-pressed, en dat
     loopt mee zodra een spel de klasse verzet. Rijen die een spel later
     opnieuw tekent, lopen gewoon mee. */
  function drukknoppen(root){
    root = typeof root === 'string' ? $(root) : root;
    if (!root) return;
    function rij(b){
      var p = b.parentNode; if (!p) return;
      Array.prototype.forEach.call(p.children, function(c){
        if (c.tagName === 'BUTTON' && !c.classList.contains('btn')) c.setAttribute('aria-pressed', c.classList.contains('on') ? 'true' : 'false');
      });
    }
    Array.prototype.forEach.call(root.querySelectorAll('button.on'), rij);
    if (!window.MutationObserver) return;
    new MutationObserver(function(lijst){
      lijst.forEach(function(m){
        if (m.type === 'attributes'){
          var t = m.target;
          if (t.tagName === 'BUTTON' && (t.classList.contains('on') || t.hasAttribute('aria-pressed'))) rij(t);
        } else Array.prototype.forEach.call(m.addedNodes, function(n){
          if (n.nodeType !== 1) return;
          if (n.tagName === 'BUTTON' && n.classList.contains('on')) rij(n);
          else if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll('button.on'), rij);
        });
      });
    }).observe(root, { attributes:true, attributeFilter:['class'], childList:true, subtree:true });
  }

  /* ---------- Opnieuw in de kop: eerst vragen ----------
     Tijdens een lopend spel gooit Opnieuw een ronde weg. De eerste tik zet er
     "Zeker? Tik nog eens" op, drie seconden lang; pas de tweede tik gaat door
     naar de knop van het spel zelf. Op het start- of eindscherm werkt hij
     meteen. Loopt er een spel? Standaard: #scherm-spel staat in beeld. */
  function zeker(knop, loopt){
    var id = typeof knop === 'string' ? knop : knop && knop.id;
    if (!id) return;
    loopt = loopt || function(){ var s = $('scherm-spel'); return !!(s && !s.hidden && !s.classList.contains('hide') && s.offsetParent !== null); };
    var tekst = null, klok = null;
    function terug(k){ clearTimeout(klok); if (tekst !== null && k){ k.textContent = tekst; k.classList.remove('zeker'); } tekst = null; }
    document.addEventListener('click', function(e){
      var k = e.target && e.target.closest ? e.target.closest('#' + id) : null;
      if (!k) return;
      if (tekst !== null || !loopt()){ terug(k); return; }
      e.stopImmediatePropagation(); e.preventDefault();
      tekst = k.textContent; k.textContent = 'Zeker? Tik nog eens'; k.classList.add('zeker');
      klok = setTimeout(function(){ terug(k); }, 3000);
    }, true);
  }

  /* ---------- de eindkaart ---------- */
  function sterrenVan(o, waarde){
    if (typeof o.sterren === 'number') return Math.max(0, Math.min(3, Math.round(o.sterren)));
    if (o.drempels && waarde !== null) return o.drempels.filter(function(d){ return waarde >= d; }).length;
    if (o.max && waarde !== null){ var r = waarde / o.max; return r >= .9 ? 3 : r >= .7 ? 2 : r >= .4 ? 1 : 0; }
    return null;
  }
  function knopje(klasse, ic, tekst, tag, attrs){
    return '<' + (tag || 'button') + (tag === 'a' ? '' : ' type="button"') + ' class="' + klasse + '"' + (attrs || '') + '>' + ic + tekst + '</' + (tag || 'button') + '>';
  }
  /* o: spel (id voor de klas), score (getal of tekst), label, waarde (getal om
     het beste ooit mee te vergelijken; anders score als dat een getal is),
     lagerIsBeter, sleutel (apart beste per niveau of modus), max, drempels,
     sterren, kop, compact (zonder groot getal), plek (id: kaart komt vóór
     dat element), klas (false: niet melden), ronde, punten, niveau, vak,
     opnieuw (functie), opnieuwTekst, deelTekst, kleur ([van, naar]). */
  /* 5 op rij: 1,1 keer; 10: 1,25; 20: 1,5; 30 en meer: 1,75 */
  function reeksFactor(r){ r = r | 0; return r >= 30 ? 1.75 : r >= 20 ? 1.5 : r >= 10 ? 1.25 : r >= 5 ? 1.1 : 1; }
  function einde(o){
    o = o || {};
    var sectie = $(o.in || 'scherm-einde');
    if (!sectie) return null;
    var oud = sectie.querySelector('.eindkaart'); if (oud) oud.parentNode.removeChild(oud);
    var waarde = typeof o.waarde === 'number' ? o.waarde : (typeof o.score === 'number' ? o.score : null);
    var sleutel = 'lg-beste-' + bestand + (o.sleutel ? '-' + String(o.sleutel).replace(/[^a-z0-9-]/gi, '') : '');
    var beste = lees(sleutel), record = false, eerste = false;
    if (waarde !== null && isFinite(waarde)){
      var beter = !beste || typeof beste.w !== 'number' ? true : (o.lagerIsBeter ? waarde < beste.w : waarde > beste.w);
      if (beter){
        record = !!(beste && typeof beste.w === 'number'); eerste = !record;
        zet(sleutel, o.lagerIsBeter ? { w:waarde, t:Date.now(), l:1 } : { w:waarde, t:Date.now() });
        beste = { w:waarde };
        if (window.PROFIEL) PROFIEL.sync();
      }
    }
    var sterren = sterrenVan(o, waarde);
    /* munten: per goed antwoord, en meer per antwoord in een spel dat langer duurt; alleen voor wie is ingelogd */
    var muntHtml = '';
    if (typeof o.goed === 'number' && o.goed > 0 && window.PROFIEL && PROFIEL.muntenErbij){
      /* MUNT_PER_GOED: de munten per goed antwoord, voor elk spel; de bonus per ronde staat er los van */
      var MUNT_PER_GOED = 1.15;
      /* de reeksbonus: hoe langer je langste reeks goed op rij, hoe meer elk goed antwoord waard is */
      var reeksX = reeksFactor(o.reeks);
      var nMunt = Math.max(0, Math.round(o.goed * (o.muntFactor || 1) * MUNT_PER_GOED * reeksX + (o.muntBonus || 0)));
      var reeksTekst = reeksX > 1 ? ' (reeks van ' + o.reeks + ': ×' + String(reeksX).replace('.', ',') + ')' : '';
      if (nMunt && PROFIEL.ingelogd()){ PROFIEL.muntenErbij(nMunt); muntHtml = '<p class="munten"><b>+' + nMunt + ' <span class="ico ico-munt" role="img" aria-label="munten" title="munten"></span></b>' + reeksTekst + ' je hebt er nu ' + PROFIEL.munten() + ' <a href="index.html?winkel=1">naar de winkel</a></p>'; }
      /* Bij nul sterren zegt dit scherm niets over gemiste munten. Een
         leerling die het niet haalde heeft geen aanbieding nodig. */
      else if (nMunt && sterren !== 0 && PROFIEL.accountMogelijk()) muntHtml = '<p class="munten stil">' + nMunt + ' <span class="ico ico-munt" role="img" aria-label="munten" title="munten"></span> gemist. ' +
        'Zonder inloggen blijft je voortgang alleen in deze browser: je munten, je reeks en je beste scores zijn weg zodra de laptop wordt geleegd. ' +
        '<a href="voortgang.html">Log in met Microsoft</a> en het staat op je account, op elk apparaat.</p>';
    }
    /* de dagstreak: elke dag dat je iets speelt telt; de eerste keer op een dag krijgt wie is ingelogd een bonus (5 per dag in de reeks, hoogstens 25) */
    var streakHtml = '';
    try {
      var vandaag = new Date(); vandaag.setHours(12, 0, 0, 0);
      var dagK = vandaag.toISOString().slice(0, 10), gisterenK = new Date(vandaag.getTime() - 86400000).toISOString().slice(0, 10);
      var st = lees('lg-dagen') || { laatst:'', reeks:0 }, nieuwDag = st.laatst !== dagK;
      if (nieuwDag){ st.reeks = st.laatst === gisterenK ? (st.reeks | 0) + 1 : 1; st.laatst = dagK; zet('lg-dagen', st); }
      if (st.reeks >= 2){
        /* De bonus hoort bij de dag. Wie zijn eerste potje speelde voordat de
           site wist dat hij was ingelogd, kreeg hem vroeger nooit meer; nu komt
           hij bij het eerstvolgende potje van diezelfde dag alsnog. */
        var bonus = st.bonusDag !== dagK && window.PROFIEL && PROFIEL.ingelogd() ? Math.min(25, 5 * st.reeks) : 0;
        if (bonus){ PROFIEL.muntenErbij(bonus); st.bonusDag = dagK; zet('lg-dagen', st); }
        streakHtml = '<p class="munten stil"><b>' + st.reeks + ' dagen op rij</b> geoefend' + (bonus ? ': +' + bonus + ' munten' : '') + '</p>';
      }
    } catch (e){}
    var kaart = document.createElement('div');
    kaart.className = 'eindkaart' + (o.compact ? ' compact' : '');
    if (o.kleur){ kaart.style.setProperty('--ek1', o.kleur[0]); kaart.style.setProperty('--ek2', o.kleur[1] || o.kleur[0]); }
    var besteTekst = '';
    if (beste && typeof beste.w === 'number'){
      besteTekst = record ? 'Nieuw record op dit apparaat<span class="record">record</span>'
                 : eerste ? 'Je eerste keer op dit apparaat'
                 : 'Beste ooit op dit apparaat: <b>' + schoon(beste.w) + (o.label ? ' ' + schoon(o.label) : '') + '</b>';
    }
    /* het gezichtje van de leerling: met de bijnaam van de klascode, of alleen het eigen gezichtje uit het profiel.
       Het kijkt blij en springt bij een record of drie sterren, en sip bij nul sterren. */
    var wie = window.KLAS && KLAS.lees(), avSpec = window.PROFIEL ? PROFIEL.avatar() : '';
    /* Het gezichtje juicht bij een record en kijkt verder gewoon. Het kijkt
       nooit sip: de site spreekt een leerling aan als iemand die iets kan. */
    var stemming = (record || sterren === 3) ? 'blij' : '';
    var wieTekst = wie ? schoon(wie.naam) : record ? 'Nieuw record!' : sterren === 3 ? 'Drie sterren!' :
      sterren === 0 ? (typeof o.goed === 'number' && o.goed > 0 ? o.goed + ' goed' : 'Je hebt gespeeld') : 'Goed bezig';
    /* Bewaart dit apparaat wel iets? Zo niet, dan staat er een record op het
       scherm dat straks nergens meer is, en dat hoort de leerling te weten
       voordat hij nog een uur doorspeelt. */
    var bewaarHtml = window.PROFIEL && PROFIEL.bewaart && !PROFIEL.bewaart()
      ? '<p class="bewaarniet">Dit apparaat bewaart niets. Zodra je dit tabblad sluit is je score weg. Dat komt meestal door een priv\u00e9venster of doordat site-gegevens uitstaan.</p>' : '';
    var wieHtml = window.AVATAR && (wie || avSpec) ? '<p class="wie">' + AVATAR.svg(wie ? wie.naam : 'jij', 34, avSpec, { stemming:stemming, klasse: stemming === 'blij' ? 'av-juich' : '' }) + wieTekst + '</p>' : '';
    var sterrenHtml = sterren === null ? '' : '<div class="sterren" aria-label="' + sterren + ' van 3 sterren">' +
      [0, 1, 2].map(function(i){ return IC.ster.replace('<svg ', '<svg class="ster' + (i < sterren ? ' vol' : '') + '" '); }).join('') + '</div>';
    kaart.innerHTML =
      '<p class="eyebrow">' + schoon(o.kop || 'klaar') + '</p>' +
      (!o.compact && o.score !== undefined && o.score !== null ? '<div class="getal">' + schoon(o.score) + (o.label ? '<small>' + schoon(o.label) + '</small>' : '') + '</div>' : '') +
      '<div class="rechts">' + sterrenHtml + (besteTekst ? '<p class="beste">' + besteTekst + '</p>' : '') + wieHtml + muntHtml + streakHtml + bewaarHtml + '</div>' +
      '<div class="knoppen">' +
        knopje('opnieuw', IC.opnieuw, schoon(o.opnieuwTekst || 'Nog een keer')) +
        /* Delen hoort bij een goede uitslag. Ging het mis, dan hoort daar een
           uitweg: de foutenmap serveert precies de vragen die fout gingen. */
        (sterren === 0
          ? (bestand !== 'fouten' && window.FOUTENMAP && FOUTENMAP.lijst && FOUTENMAP.lijst().length ? knopje('stil', IC.opnieuw, 'Oefen je fouten', 'a', ' href="fouten.html"') : '')
          : knopje('stil deel', IC.deel, 'Delen')) +
        knopje('stil', IC.alle, 'Alle spellen', 'a', ' href="index.html"') +
        knopje('stil', IC.alle, 'Mijn voortgang', 'a', ' href="voortgang.html"') +
      '</div>' +
      '<p class="meta" id="eindMeta"></p>';
    var voor = o.plek ? $(o.plek) : null;
    if (voor && voor.parentNode === sectie) sectie.insertBefore(kaart, voor);
    else sectie.insertBefore(kaart, sectie.firstChild);
    var meta = kaart.querySelector('.meta');
    kaart.querySelector('.opnieuw').addEventListener('click', function(){
      if (o.opnieuw){ o.opnieuw(); return; }
      var k = ['nogBtn', 'nogeensBtn', 'opnieuwBtn'].map($).filter(Boolean)[0];
      if (k) k.click(); else location.reload();
    });
    var deelKnop = kaart.querySelector('.deel');
    if (deelKnop) deelKnop.addEventListener('click', function(){
      var wat = o.deelTekst || (o.score !== undefined && o.score !== null ? String(o.score) + (o.label ? ' ' + o.label : '') : ''),
          tekst = (wat ? 'Ik haalde ' + wat + ' in ' : 'Speel ') + naamVanSpel() + ' op ' + SITE,
          url = location.origin + location.pathname;
      if (navigator.share){
        navigator.share({ title:naamVanSpel(), text:tekst, url:url }).catch(function(){});
      } else if (navigator.clipboard){
        navigator.clipboard.writeText(tekst + ' ' + url).then(function(){ meta.textContent = 'Gekopieerd, plak het in een berichtje.'; }, function(){ meta.textContent = tekst + ' ' + url; });
      } else meta.textContent = tekst + ' ' + url;
    });
    /* bij de klas melden, als deze leerling een klascode heeft */
    if (o.klas !== false && o.spel && window.KLAS && KLAS.lees()){
      KLAS.meld({ spel:o.spel, ronde:o.ronde | 0, punten:o.punten | 0, niveau:o.niveau || '', vak:o.vak || '', od:o.od || undefined }, 'eindMeta');
    }
    return kaart;
  }

  /* ---------- de klassementen op dit apparaat schoonhouden ----------
     Een bijnaam die het naamfilter niet haalt, hoort niet op het scherm van
     een klas. Namen worden bij het opslaan gecontroleerd, maar een lijst kan
     ouder zijn dan dat filter, en op een digibord kijkt niemand in de opslag
     van de browser. Daarom kijkt de site er bij elke start zelf even door.
     Het loopt over elke sleutel met "klassement" erin, want elk spel bewaart
     zijn lijst onder een eigen naam en in een eigen vorm. Wat geen voorwerp
     met een naam is, blijft ongemoeid. */
  function naamMag(n){
    if (typeof n !== 'string' || !n.trim()) return true;
    return !(window.NAAMFILTER && NAAMFILTER.verboden(n));
  }
  function schoonIn(waarde, weg){
    if (Array.isArray(waarde)){
      var uit = [];
      for (var i = 0; i < waarde.length; i++){
        var r = waarde[i];
        if (r && typeof r === 'object' && !Array.isArray(r) && 'naam' in r && !naamMag(r.naam)){ weg.n++; continue; }
        uit.push(schoonIn(r, weg));
      }
      return uit;
    }
    if (waarde && typeof waarde === 'object'){
      for (var k in waarde) if (Object.prototype.hasOwnProperty.call(waarde, k)) waarde[k] = schoonIn(waarde[k], weg);
    }
    return waarde;
  }
  function schoonKlassementen(){
    if (!window.NAAMFILTER) return 0;
    var totaal = 0;
    try {
      for (var i = localStorage.length - 1; i >= 0; i--){
        var sleutel = localStorage.key(i);
        if (!sleutel || sleutel.indexOf('klassement') < 0) continue;
        var ruw = localStorage.getItem(sleutel);
        if (!ruw || ruw.charAt(0) !== '{' && ruw.charAt(0) !== '[') continue;
        var d; try { d = JSON.parse(ruw); } catch (e){ continue; }
        var weg = { n:0 };
        var schoon = schoonIn(d, weg);
        if (weg.n){ localStorage.setItem(sleutel, JSON.stringify(schoon)); totaal += weg.n; }
      }
    } catch (e){}
    return totaal;
  }
  schoonKlassementen();

  return {
    raak: raak, uitleg:uitleg, stappen:stappen, einde:einde, bestand:bestand, naamMag:naamMag, schoonKlassementen:schoonKlassementen,
    inBeeld:inBeeld, drukknoppen:drukknoppen, zeker:zeker,
    /* een naam of iets anders van de speler als tekst in de opmaak zetten;
       de klassementen van deze computer gebruiken hem */
    schoon: schoon };
})();
