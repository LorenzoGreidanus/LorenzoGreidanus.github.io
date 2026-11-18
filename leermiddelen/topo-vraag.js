/* Een topografievraag in een klassenspel (Grand Prix, Dijkbouwers): de kaart tekenen.

   De kamer stuurt bij een vraag { kaart, soort, i }:
   - soort "naam": plek nummer i licht op; de leerling kiest de naam uit de antwoorden;
   - soort "wijs": de leerling klikt de plek aan; de pagina stuurt de naam van die plek terug.
   De kaarten zelf (topo-kaarten.js, een groot bestand) komen pas binnen bij de eerste vraag.

     TOPOVRAAG.toon(el, topo, { kies:function(naam){} })   tekent de kaart in el
     TOPOVRAAG.merk(el, goed, gekozen)                      na het oordeel: goed blauw, fout zand
     TOPOVRAAG.kan(kaart)                                   bestaat de kaart (na het laden)

   De kleuren staan vast (zee, land, inkt): de kaart is in elk spel dezelfde lichte kaart. */
window.TOPOVRAAG = (function(){
  'use strict';
  var laadP = null, stijlKlaar = false;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function laad(){
    if (window.KAARTEN) return Promise.resolve();
    if (!laadP) laadP = new Promise(function(ok, nee){ var s = document.createElement('script'); s.src = 'topo-kaarten.js'; s.onload = function(){ ok(); }; s.onerror = function(){ laadP = null; nee(new Error('kaart niet geladen')); }; document.head.appendChild(s); });
    return laadP;
  }
  function stijl(){
    if (stijlKlaar) return; stijlKlaar = true;
    var s = document.createElement('style');
    s.textContent = '.tv{display:block;width:100%;height:100%;background:#DCE5FB;border-radius:inherit}' +
      '.tv .tv-achter{fill:#EFE9E0;stroke:#C9C0B4;stroke-width:.6}' +
      '.tv .tv-land{fill:#F7F1E8;stroke:#14224C;stroke-width:.7;stroke-linejoin:round}' +
      '.tv .tv-basis{fill:#F7F1E8;stroke:#9aa3bd;stroke-width:.5}' +
      '.tv .tv-stip{fill:#fff;stroke:#14224C;stroke-width:1.6}' +
      '.tv .op{fill:#F26749}.tv .tv-ring{fill:none;stroke:#F26749;stroke-width:3;animation:tvring 1.2s ease-in-out infinite}' +
      '@keyframes tvring{50%{opacity:.25}}' +
      '.tv.wijs [data-i]{cursor:pointer}.tv.wijs .tv-land:hover,.tv.wijs .tv-stip:hover{fill:#83A5F2}' +
      '.tv .goed{fill:#204ECF !important}.tv .mis{fill:#FCDED6 !important;stroke:#F26749;stroke-width:2}' +
      '.tv.klaar [data-i]{cursor:default;pointer-events:none}' +
      '.tv-naam{font-family:Poppins,system-ui,sans-serif;font-weight:700;fill:#14224C;stroke:#fff;stroke-width:4;paint-order:stroke;stroke-linejoin:round}' +
      '@media (prefers-reduced-motion:reduce){.tv .tv-ring{animation:none}}';
    document.head.appendChild(s);
  }
  function toon(el, topo, opt){
    opt = opt || {};
    return laad().then(function(){
      var m = window.KAARTEN && KAARTEN[topo.kaart];
      if (!m){ el.innerHTML = ''; return false; }
      stijl();
      var punt = m.soort === 'punt', basis = m.basisVan && KAARTEN[m.basisVan], wijs = topo.soort === 'wijs';
      /* de maat van een stip of ring: mee met de grootte van de kaart */
      var e = Math.max(m.breed, m.hoog) / 100;
      var h = '<svg class="tv' + (wijs ? ' wijs' : '') + '" viewBox="0 0 ' + m.breed + ' ' + m.hoog + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + schoon(m.naam) + '">';
      if (m.achter) h += '<path class="tv-achter" d="' + m.achter + '"/>';
      if (punt && basis) h += basis.landen.map(function(l){ return l.d ? '<path class="tv-basis" d="' + l.d + '"/>' : ''; }).join('');
      m.landen.forEach(function(l, i){
        var op = !wijs && i === topo.i ? ' op' : '';
        if (!punt && l.d) h += '<path class="tv-land' + op + '" data-i="' + i + '" d="' + l.d + '"/>';
        if (punt || l.k) h += '<circle class="tv-stip' + op + '" data-i="' + i + '" cx="' + l.x + '" cy="' + l.y + '" r="' + (punt ? e * 0.95 : e * 1.1).toFixed(1) + '"/>';
      });
      if (!wijs && m.landen[topo.i]) h += '<circle class="tv-ring" cx="' + m.landen[topo.i].x + '" cy="' + m.landen[topo.i].y + '" r="' + (e * 3.2).toFixed(1) + '"/>';
      h += '<g class="tv-namen"></g></svg>';
      el.innerHTML = h;
      var svg = el.firstChild;
      if (wijs) svg.addEventListener('click', function(ev){
        var t = ev.target.closest ? ev.target.closest('[data-i]') : null;
        if (!t || svg.classList.contains('klaar')) return;
        svg.classList.add('klaar');
        var l = m.landen[+t.getAttribute('data-i')];
        t.classList.add('op');
        if (l && opt.kies) opt.kies(l.n);
      });
      return true;
    });
  }
  /* na het oordeel: de goede plek blauw met de naam erbij, een fout aangeklikte plek zand */
  function merk(el, goed, gekozen){
    var svg = el.querySelector('svg.tv'); if (!svg || !window.KAARTEN) return;
    var m = null; Object.keys(KAARTEN).forEach(function(k){ if (!m && svg.getAttribute('aria-label') === KAARTEN[k].naam) m = KAARTEN[k]; });
    if (!m) return;
    svg.classList.add('klaar');
    var e = Math.max(m.breed, m.hoog) / 100, namen = '';
    m.landen.forEach(function(l, i){
      var els = svg.querySelectorAll('[data-i="' + i + '"]');
      if (l.n === goed){ [].forEach.call(els, function(x){ x.classList.remove('op'); x.classList.add('goed'); }); namen += '<text class="tv-naam" x="' + l.x + '" y="' + (l.y - e * 1.8) + '" text-anchor="middle" font-size="' + (e * 3.1).toFixed(1) + '">' + schoon(l.n) + '</text>'; }
      else if (gekozen && l.n === gekozen){ [].forEach.call(els, function(x){ x.classList.remove('op'); x.classList.add('mis'); }); }
    });
    var ring = svg.querySelector('.tv-ring'); if (ring) ring.parentNode.removeChild(ring);
    svg.querySelector('.tv-namen').innerHTML = namen;
  }
  function kan(kaart){ return !!(window.KAARTEN && KAARTEN[kaart]); }
  return { toon: toon, merk: merk, kan: kan, laad: laad };
})();
