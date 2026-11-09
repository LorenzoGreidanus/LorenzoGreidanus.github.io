/* De mededeling: een korte melding van de beheerder bovenaan de site, zoals
   "vrijdag even geen Klasstrijd door onderhoud". De beheerder zet hem in
   beheer.html; de server geeft hem hier, een minuut in de browser bewaard.

   Op de voorpagina's staat hij als balk boven de pagina. Heeft de beheerder
   "overal" gekozen, dan verschijnt hij in een spel als klein kaartje onderin,
   zodat de spelopbouw niet verschuift. Wie hem wegklikt, ziet hem niet meer
   tot er een nieuwe komt. vangnet.js laadt dit bestand, dus het staat op
   bijna elke pagina zonder dat elke pagina het noemt. */
(function(){
  'use strict';
  if (window.__mededeling) return; window.__mededeling = true;
  var p = location.pathname;
  if (/\/beheer\.html$/.test(p)) return;
  if (!(location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) return;
  var START = { '/':1, '/index.html':1, '/nieuw.html':1, '/leermiddelen/':1, '/leermiddelen/index.html':1, '/leermiddelen/klas.html':1, '/leermiddelen/leerroute.html':1, '/leermiddelen/mee.html':1 };
  var opStart = !!START[p];
  function weg(id){ try { return localStorage.getItem('lg-mededeling-weg') === id; } catch (e){ return false; } }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function toon(m){
    if (!m || !m.tekst || weg(m.id)) return;
    if (!opStart && m.waar !== 'overal') return;
    var css = document.createElement('style');
    css.textContent =
      '.lg-mededeling{font-family:Poppins,system-ui,sans-serif;color:#14224C;display:flex;align-items:center;gap:12px;font-size:.92rem;line-height:1.4;z-index:9998}' +
      '.lg-mededeling.balk{position:relative;padding:10px 16px;justify-content:center;background:#FCDED6;border-bottom:1px solid rgba(20,34,76,.12)}' +
      '.lg-mededeling.let{background:#EA9836}' +
      '.lg-mededeling.kaartje{position:fixed;right:16px;bottom:16px;max-width:min(420px,calc(100vw - 32px));padding:12px 14px;border-radius:14px;background:#FCDED6;box-shadow:0 10px 30px rgba(20,34,76,.25)}' +
      '.lg-mededeling.kaartje.let{background:#EA9836}' +
      '.lg-mededeling b{font-weight:600}' +
      '.lg-mededeling a{color:#14224C;font-weight:600;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}' +
      '.lg-mededeling button{flex:none;border:none;background:rgba(20,34,76,.08);color:#14224C;border-radius:10px;width:36px;height:36px;font-size:1.2rem;line-height:1;cursor:pointer}' +
      '.lg-mededeling button:hover{background:rgba(20,34,76,.16)}' +
      '.lg-mededeling button:focus-visible,.lg-mededeling a:focus-visible{outline:3px solid #14224C;outline-offset:2px}' +
      '@media print{.lg-mededeling{display:none}}';
    document.head.appendChild(css);
    var el = document.createElement('div');
    el.className = 'lg-mededeling ' + (opStart ? 'balk' : 'kaartje') + (m.soort === 'let' ? ' let' : '');
    el.setAttribute('role', 'status');
    el.innerHTML = '<span>' + (m.soort === 'let' ? '<b>Let op: </b>' : '') + schoon(m.tekst) +
      (m.link ? ' <a href="' + schoon(m.link) + '">' + schoon(m.linktekst || 'Lees meer') + '</a>' : '') + '</span>' +
      '<button type="button" aria-label="Mededeling sluiten">×</button>';
    el.querySelector('button').addEventListener('click', function(){
      try { localStorage.setItem('lg-mededeling-weg', m.id); } catch (e){}
      el.remove();
    });
    if (opStart) document.body.insertBefore(el, document.body.firstChild); else document.body.appendChild(el);
  }
  function haal(){
    fetch('/api/mededeling').then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (j) toon(j.mededeling); }).catch(function(){});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', haal); else haal();
})();
