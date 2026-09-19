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
  var beweegtLiever = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches:false };

  /* ---------- de cirkel die over het scherm loopt ----------
     De browser maakt een plaatje van het oude scherm en een van het nieuwe. Wij
     zetten het nieuwe erboven en laten het als een cirkel opengaan vanaf de
     knop. Kan de browser dat niet, dan valt alles terug op de zachte overgang
     van de kleuren zelf. */
  function cirkelWissel(zet, knop){
    var wortel = document.documentElement;
    if (beweegtLiever.matches || !document.startViewTransition || !wortel.animate){ zachtWissel(zet); return; }
    var r = knop.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var straal = Math.sqrt(Math.pow(Math.max(x, innerWidth - x), 2) + Math.pow(Math.max(y, innerHeight - y), 2));
    zorgVoorStijl();
    var wissel = document.startViewTransition(zet);
    wissel.ready.then(function(){
      wortel.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + straal + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 520, easing: 'cubic-bezier(.22,.61,.36,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function(){});
  }
  function zachtWissel(zet){
    var wortel = document.documentElement;
    if (beweegtLiever.matches){ zet(); return; }
    wortel.classList.add('themawisselt');
    zet();
    setTimeout(function(){ wortel.classList.remove('themawisselt'); }, 640);
  }
  /* de twee regels die de standaard kruisvervaging uitzetten, eenmalig */
  var stijlGezet = false;
  function zorgVoorStijl(){
    if (stijlGezet) return;
    stijlGezet = true;
    try {
      var st = document.createElement('style');
      st.textContent = '::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}' +
        '::view-transition-old(root){z-index:0}::view-transition-new(root){z-index:1}';
      document.head.appendChild(st);
    } catch (e){}
  }

  knop.addEventListener('click', function(){
    var nieuw = huidig() === 'dark' ? 'light' : 'dark';
    if (!beweegtLiever.matches){
      /* opnieuw laten beginnen als je snel achter elkaar drukt */
      knop.classList.remove('draait');
      void knop.offsetWidth;
      knop.classList.add('draait');
      setTimeout(function(){ knop.classList.remove('draait'); }, 640);
    }
    cirkelWissel(function(){
      wortel.setAttribute('data-theme', nieuw);
      try { localStorage.setItem('thema', nieuw); } catch (e) {}
      bijwerken();
      document.dispatchEvent(new CustomEvent('themawissel', { detail:{ thema:nieuw } }));
    }, knop);
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

/* Een tik per paginabezoek voor de gebruikstelling: alleen het pad van de
   pagina, geen cookie, geen adres bewaard. Zo is te zien welke spellen leven. */
try {
  if (navigator.sendBeacon && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))){
    navigator.sendBeacon('/api/tel', new Blob([JSON.stringify({ p: location.pathname })], { type: 'text/plain' }));
  }
} catch (e){}
