/* Het vangnet.

   Gaat er in een spel iets mis, dan stopte de pagina vroeger zonder dat iemand
   het zag: de leerling keek naar een scherm dat niets meer deed, en ik hoorde
   het nooit. Dit scriptje vangt die fouten op, zegt in gewone taal dat er iets
   misging, en stuurt een regeltje naar de beheerpagina zodat ik weet dat het in
   een echte les gebeurde.

   Het stuurt hoogstens een melding per pagina, en niets als de leerling geen
   verbinding heeft. Het kijkt alleen naar fouten in de code: een plaatje dat
   niet laadt is vervelend maar geen storing. */
(function(){
  'use strict';
  var gemeld = false, balk = null;

  function korte(t){ return String(t == null ? '' : t).slice(0, 300); }

  function toonBalk(){
    if (balk || !document.body) return;
    balk = document.createElement('div');
    balk.setAttribute('role', 'alert');
    balk.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:520px;margin-inline:auto;' +
      'background:#14224C;color:#F3EFE9;border-radius:16px;padding:12px 14px;font:500 .9rem Poppins,system-ui,sans-serif;' +
      'box-shadow:0 14px 34px rgba(0,0,0,.3);display:flex;gap:10px;align-items:center;line-height:1.4';
    var tekst = document.createElement('span');
    tekst.style.cssText = 'flex:1';
    tekst.textContent = 'Er ging iets mis in dit spel. Probeer het opnieuw; je voortgang staat bewaard.';
    var knop = document.createElement('button');
    knop.type = 'button';
    knop.textContent = 'Opnieuw';
    knop.style.cssText = 'flex:none;border:none;border-radius:999px;padding:8px 14px;font:600 .85rem Poppins,system-ui,sans-serif;' +
      'background:#F3EFE9;color:#14224C;cursor:pointer;min-height:38px';
    knop.addEventListener('click', function(){ location.reload(); });
    var weg = document.createElement('button');
    weg.type = 'button';
    weg.setAttribute('aria-label', 'Deze melding wegklikken');
    weg.textContent = '×';
    weg.style.cssText = 'flex:none;border:none;background:none;color:#F3EFE9;font-size:1.3rem;line-height:1;cursor:pointer;padding:4px 6px;min-height:38px';
    weg.addEventListener('click', function(){ if (balk && balk.parentNode) balk.parentNode.removeChild(balk); });
    balk.appendChild(tekst); balk.appendChild(knop); balk.appendChild(weg);
    document.body.appendChild(balk);
  }

  function meld(wat){
    if (gemeld || typeof fetch !== 'function') return;
    gemeld = true;
    try {
      fetch('/api/melding', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ spel: 'storing', opmerking: korte(wat), pad: location.pathname.slice(0, 80) })
      }).catch(function(){});
    } catch (e){}
  }

  addEventListener('error', function(e){
    /* een plaatje of een script dat niet laadt heeft geen message: dat is geen storing */
    if (!e || !e.message) return;
    toonBalk();
    meld(e.message + ' @ ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || 0));
  });
  addEventListener('unhandledrejection', function(e){
    var r = e && e.reason;
    /* een mislukte fetch (geen wifi) is geen storing in de code */
    if (r && /fetch|network|Failed to fetch|load failed/i.test(String(r.message || r))) return;
    toonBalk();
    meld('belofte: ' + korte(r && r.stack || r));
  });
})();
