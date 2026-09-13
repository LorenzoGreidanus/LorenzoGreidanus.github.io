/* Het gedeelde skelet van elk spel: het uitlegpaneel op het startscherm en
   de eindkaart op het eindscherm. Elk spel houdt zijn eigen inhoud; dit
   zorgt dat de vaste stukken er overal hetzelfde uitzien en werken.

   Gebruik:
     SPEL.uitleg({ doel:'...', tijd:'...', bediening:'...' })
       Zet onder de inleiding een paneel met drie regels en het plaatje van
       het spel. Lange uitleg die al op het startscherm stond (.uitleg en
       .tip) verhuist naar "Alle regels" in het paneel. Wie op "Begrepen"
       tikt ziet het paneel de volgende keer ingeklapt (localStorage).
     SPEL.einde({ spel:'toren', score:12, label:'rondes', max:20, sterren:2,
                  ronde:12, punten:340, niveau:'havo', vak:'ges', ... })
       Zet bovenaan het eindscherm een kaart met de score, sterren, het beste
       resultaat ooit op dit apparaat, en de knoppen Nog een keer, Delen en
       Alle spellen. Meldt de uitslag bij de klas als er een klascode staat
       (klas.js), tenzij klas:false. Zie einde() voor alle velden. */
window.SPEL = (function(){
  'use strict';
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
    alle:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>'
  };

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
    var ic = icoon();
    paneel.innerHTML =
      '<div class="beeld">' + (ic ? '<img src="' + schoon(ic) + '" alt="">' : '') + '</div>' +
      '<div class="regels">' +
        (o.doel ? '<div class="regel">' + IC.doel + '<span><b>Doel</b>' + schoon(o.doel) + '</span></div>' : '') +
        (o.tijd ? '<div class="regel">' + IC.tijd + '<span><b>Tijd</b>' + schoon(o.tijd) + '</span></div>' : '') +
        (o.bediening ? '<div class="regel">' + IC.hand + '<span><b>Bediening</b>' + schoon(o.bediening) + '</span></div>' : '') +
        '<div class="knoppen"><button type="button" class="begrepen">Begrepen</button><button type="button" class="stil regels-knop">Alle regels</button></div>' +
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
    function toon(open){
      paneel.hidden = !open; knop.hidden = open;
    }
    paneel.querySelector('.begrepen').addEventListener('click', function(){ zet(sleutel, 1); toon(false); });
    knop.addEventListener('click', function(){ toon(true); });
    var na = start.querySelector('.lead');
    if (na && na.parentNode === start){ na.insertAdjacentElement('afterend', knop); na.insertAdjacentElement('afterend', paneel); }
    else { start.insertBefore(knop, start.firstChild); start.insertBefore(paneel, start.firstChild); }
    toon(!gezien);
    return { open:function(){ toon(true); }, dicht:function(){ toon(false); } };
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
        zet(sleutel, { w:waarde, t:Date.now() });
        beste = { w:waarde };
      }
    }
    var sterren = sterrenVan(o, waarde);
    var kaart = document.createElement('div');
    kaart.className = 'eindkaart' + (o.compact ? ' compact' : '');
    if (o.kleur){ kaart.style.setProperty('--ek1', o.kleur[0]); kaart.style.setProperty('--ek2', o.kleur[1] || o.kleur[0]); }
    var besteTekst = '';
    if (beste && typeof beste.w === 'number'){
      besteTekst = record ? 'Nieuw record op dit apparaat<span class="record">record</span>'
                 : eerste ? 'Je eerste keer op dit apparaat'
                 : 'Beste ooit op dit apparaat: <b>' + schoon(beste.w) + (o.label ? ' ' + schoon(o.label) : '') + '</b>';
    }
    var sterrenHtml = sterren === null ? '' : '<div class="sterren" aria-label="' + sterren + ' van 3 sterren">' +
      [0, 1, 2].map(function(i){ return IC.ster.replace('<svg ', '<svg class="ster' + (i < sterren ? ' vol' : '') + '" '); }).join('') + '</div>';
    kaart.innerHTML =
      '<p class="eyebrow">' + schoon(o.kop || 'klaar') + '</p>' +
      (!o.compact && o.score !== undefined && o.score !== null ? '<div class="getal">' + schoon(o.score) + (o.label ? '<small>' + schoon(o.label) + '</small>' : '') + '</div>' : '') +
      '<div class="rechts">' + sterrenHtml + (besteTekst ? '<p class="beste">' + besteTekst + '</p>' : '') + '</div>' +
      '<div class="knoppen">' +
        knopje('opnieuw', IC.opnieuw, schoon(o.opnieuwTekst || 'Nog een keer')) +
        knopje('stil deel', IC.deel, 'Delen') +
        knopje('stil', IC.alle, 'Alle spellen', 'a', ' href="index.html"') +
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
    kaart.querySelector('.deel').addEventListener('click', function(){
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
      KLAS.meld({ spel:o.spel, ronde:o.ronde | 0, punten:o.punten | 0, niveau:o.niveau || '', vak:o.vak || '' }, 'eindMeta');
    }
    return kaart;
  }

  return { uitleg:uitleg, einde:einde, bestand:bestand };
})();
