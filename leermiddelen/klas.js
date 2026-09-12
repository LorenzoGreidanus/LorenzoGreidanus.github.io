/* De klascode: een leerling koppelt de leeromgeving eenmalig aan de klas van
   zijn docent (code van vier letters plus een bijnaam), en daarna melden de
   spellen hun einduitslag bij die klas. De docent ziet ze in het
   klasoverzicht (klas.html). Geen accounts: de koppeling staat alleen in
   deze browser en is met een tik weer los te maken. */
window.KLAS = (function(){
  'use strict';
  var SLEUTEL = 'lg-klas';
  function lees(){
    try {
      var k = JSON.parse(localStorage.getItem(SLEUTEL) || 'null');
      if (k && /^[A-Z]{4}$/.test(String(k.code || '')) && k.naam) return k;
    } catch (e){}
    return null;
  }
  function zet(code, naam){
    var k = { code:String(code || '').toUpperCase().replace(/[^A-Z]/g, ''), naam:String(naam || '').trim().slice(0, 16), sinds:Date.now() };
    try { localStorage.setItem(SLEUTEL, JSON.stringify(k)); } catch (e){}
    return k;
  }
  function wis(){ try { localStorage.removeItem(SLEUTEL); } catch (e){} }
  /* hetzelfde kenmerk als de spelkamers gebruiken, zodat een leerling op een apparaat een geheel is */
  function sid(){
    var s = null;
    try { s = localStorage.getItem('lg-quiz-sid'); } catch (e){}
    if (!s){
      var r = new Uint8Array(12); crypto.getRandomValues(r);
      s = Array.prototype.map.call(r, function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
      try { localStorage.setItem('lg-quiz-sid', s); } catch (e){}
    }
    return s;
  }
  function toon(naId, tekst){
    var el = naId && document.getElementById(naId);
    if (!el || !el.parentNode) return;
    var p = el.parentNode.querySelector('.klasnoot');
    if (!p){ p = document.createElement('p'); p.className = 'klasnoot'; el.parentNode.insertBefore(p, el.nextSibling); }
    p.textContent = tekst;
  }
  /* de einduitslag melden; geeft een belofte, en zet een regeltje onder het element met dit id */
  function meld(gegevens, naId){
    var k = lees();
    if (!k) return Promise.resolve(null);
    var body = Object.assign({ sid:sid(), naam:k.naam }, gegevens || {});
    return fetch('/api/klas/' + k.code + '/meld', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) })
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
      .then(function(x){
        toon(naId, x.ok ? 'Gemeld bij klas ' + k.code + ' als ' + k.naam + '.' : 'Melden bij de klas lukte niet' + (x.j && x.j.fout ? ': ' + x.j.fout : '.'));
        return x;
      })
      .catch(function(){ toon(naId, 'Melden bij de klas lukte niet: geen verbinding.'); return null; });
  }
  return { lees:lees, zet:zet, wis:wis, meld:meld, sid:sid };
})();
