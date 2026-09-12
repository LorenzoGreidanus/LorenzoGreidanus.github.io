/* De schakelaar voor licht en donker, gedeeld door alle pagina's van de
   leeromgeving. Zonder keuze volgt de pagina het apparaat. Een klik zet
   data-theme op <html> en bewaart de keuze onder 'thema', dezelfde sleutel
   als de hoofdpagina's, zodat de hele site in een stand staat. Een spel dat
   zelf kleuren leest kan luisteren naar het event 'themawissel'. */
(function(){
  var knop = document.getElementById('themaknop');
  if (!knop) return;
  var wortel = document.documentElement;
  var donkerMQ = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : { matches:false };
  function huidig(){
    var t = wortel.getAttribute('data-theme');
    return t || (donkerMQ.matches ? 'dark' : 'light');
  }
  function bijwerken(){
    var donker = huidig() === 'dark';
    knop.setAttribute('aria-label', donker ? 'Schakel naar licht' : 'Schakel naar donker');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', donker ? '#0F1A3D' : '#FBF6F1');
  }
  knop.addEventListener('click', function(){
    var nieuw = huidig() === 'dark' ? 'light' : 'dark';
    wortel.setAttribute('data-theme', nieuw);
    try { localStorage.setItem('thema', nieuw); } catch (e) {}
    bijwerken();
    document.dispatchEvent(new CustomEvent('themawissel', { detail:{ thema:nieuw } }));
  });
  if (donkerMQ.addEventListener) donkerMQ.addEventListener('change', bijwerken);
  bijwerken();
})();

/* De leeromgeving als app: de service worker (sw.js) bewaart de spellen die
   je geopend hebt, zodat ze ook zonder verbinding starten, en maakt de site
   installeerbaar op het beginscherm. Alleen op de echte site en bij lokaal
   testen; de spelkamers gaan er nooit doorheen. */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))){
  addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });
}
