/* De klascode: een leerling koppelt de leeromgeving eenmalig aan de klas van
   zijn docent (code van vier letters plus een bijnaam), en daarna melden de
   spellen hun einduitslag bij die klas. De docent ziet ze in het
   klasoverzicht (klas.html). De koppeling staat in deze browser (en reist
   mee met de speelcode); wie met Microsoft is ingelogd kan hem niet zelf
   losmaken, alleen de docent kan de klascode opheffen. Is de code
   opgeheven, dan valt de koppeling vanzelf weg. */
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
    if (window.PROFIEL) PROFIEL.sync();
    /* meteen even zwaaien, zodat de docent aan het begin van de les ziet dat
       je binnen bent, ook al heb je nog niets gespeeld */
    zwaai(k, true);
    return k;
  }
  /* zeggen dat je er bent; lukt het niet, dan geeft het niet: bij het eerste
     potje dat je meldt komt je naam er alsnog bij. nieuw: de leerling vulde
     de code net zelf in, dus ook wie de docent eerder weghaalde mag weer
     meedoen. Een gewoon bezoek haalt zo iemand niet terug: dan valt de
     koppeling hier weg. */
  function zwaai(k, nieuw){
    if (!k || !k.code || typeof fetch !== 'function') return;
    try {
      fetch('/api/klas/' + k.code + '/hoi', { method:'POST', headers:{ 'content-type':'application/json' },
        body:JSON.stringify({ sid:sid(), naam:k.naam, av: window.PROFIEL ? PROFIEL.avatar() : '', nieuw: !!nieuw }) })
        .then(function(r){ return r.json(); })
        .then(function(j){ if (j && j.weg && !nieuw){ var nu = lees(); if (nu && nu.code === k.code) wis(); } })
        .catch(function(){});
    } catch (e){}
  }
  function wis(){ try { localStorage.removeItem(SLEUTEL); } catch (e){} if (window.PROFIEL && PROFIEL.klasWeg) PROFIEL.klasWeg(); }
  /* alleen van dit apparaat, het profiel houdt de klas (bij uitloggen op een gedeelde laptop) */
  function wisLokaal(){ try { localStorage.removeItem(SLEUTEL); } catch (e){} }
  /* bestaat de klascode nog? Zo niet, dan valt de koppeling weg. Geeft een belofte met true/false. */
  var gecontroleerd = null;
  function controleer(){
    var k = lees();
    if (!k || typeof fetch !== 'function') return Promise.resolve(!!k);
    if (gecontroleerd && gecontroleerd.code === k.code) return gecontroleerd.p;
    var p = fetch('/api/kamer/' + k.code, { cache:'no-store' }).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
      .then(function(x){
        if (x.ok && x.j && x.j.spel === 'klas') return true;
        if (!x.ok && x.j && /geen kamer|geen klascode|opgeheven|verlopen/.test(x.j.fout || '')){ wis(); return false; }
        if (x.ok && x.j && x.j.spel && x.j.spel !== 'klas'){ wis(); return false; }
        return true;
      }).catch(function(){ return true; });
    gecontroleerd = { code:k.code, p:p };
    return p;
  }
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
  /* ---------- de wachtrij ----------
     Op een vol schoolnetwerk mislukt een melding weleens. Vroeger was die
     uitslag dan weg. Nu blijft hij op het apparaat staan en gaat hij mee met
     de volgende keer dat er iets te melden valt, of bij het volgende bezoek. */
  var WACHTRIJ = 'lg-klas-wacht';
  function wachtLees(){ try { var l = JSON.parse(localStorage.getItem(WACHTRIJ) || '[]'); return Array.isArray(l) ? l : []; } catch (e){ return []; } }
  function wachtZet(l){ try { localStorage.setItem(WACHTRIJ, JSON.stringify(l.slice(-20))); } catch (e){} }
  function wachtErbij(code, body){ var l = wachtLees(); l.push({ code:code, body:body, t:Date.now() }); wachtZet(l); }
  function stuur(code, body){
    return fetch('/api/klas/' + code + '/meld', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) })
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }, function(){ return { ok:r.ok, j:{} }; }); });
  }
  /* de wachtrij legen: wat lukt gaat eruit, wat de klas niet meer kent ook */
  function wachtLegen(){
    var l = wachtLees(); if (!l.length || typeof fetch !== 'function') return;
    wachtZet([]);
    l.forEach(function(w){
      stuur(w.code, w.body).then(function(x){
        var weg = x.ok || /geen kamer|geen klascode|opgeheven|verlopen|zit vol|uit deze klas gehaald/.test(x.j && x.j.fout || '');
        if (!weg) wachtErbij(w.code, w.body);
      }).catch(function(){ wachtErbij(w.code, w.body); });
    });
  }
  /* ---------- per onderdeel, op dit apparaat ----------
     Wat een leerling per onderdeel goed had, opgeteld over al zijn potjes,
     ook zonder klascode. Mijn voortgang (voortgang.html) zet het per vak in
     categorieën (categorie.js). Een uitslag zonder vak (de Dagelijkse
     uitdaging) staat onder '' en krijgt daar zijn vak bij het onderdeel. */
  var PER_DEEL = 'lg-per-onderdeel';
  function onthoud(vak, od){
    if (!od || typeof od !== 'object') return;
    try {
      var x = JSON.parse(localStorage.getItem(PER_DEEL) || '{}') || {};
      var v = /^[a-z]{2,8}$/.test(String(vak || '')) ? vak : '', per = x[v] = x[v] || {}, n = 0;
      Object.keys(x).forEach(function(k){ n += Object.keys(x[k] || {}).length; });
      Object.keys(od).forEach(function(id){
        var w = od[id]; if (!Array.isArray(w) || !(w[1] > 0)) return;
        id = String(id).slice(0, 40);
        if (!per[id]){ if (n >= 600) return; per[id] = [0, 0]; n++; }
        per[id][0] += w[0] | 0; per[id][1] += w[1] | 0;
      });
      localStorage.setItem(PER_DEEL, JSON.stringify(x));
    } catch (e){}
  }
  function perOnderdeel(){ try { return JSON.parse(localStorage.getItem(PER_DEEL) || '{}') || {}; } catch (e){ return {}; } }
  /* de einduitslag melden; geeft een belofte, en zet een regeltje onder het element met dit id.
     Ook zonder klascode komt hier elk einde langs: dan alleen onthouden op dit apparaat. */
  function meld(gegevens, naId){
    if (gegevens && gegevens.od) onthoud(gegevens.vak, gegevens.od);
    var k = lees();
    if (!k) return Promise.resolve(null);
    var body = Object.assign({ sid:sid(), naam:k.naam, av: window.PROFIEL ? PROFIEL.avatar() : '' }, gegevens || {});
    return stuur(k.code, body)
      .then(function(x){
        if (x.ok) wachtLegen();
        /* de docent heeft de code opgeheven: de koppeling valt weg */
        /* de docent haalde je uit de klas: ook dan valt de koppeling weg, en de uitslag gaat niet de wachtrij in */
        if (!x.ok && x.j && x.j.weg){ wis(); toon(naId, 'Je docent heeft je uit klas ' + k.code + ' gehaald; je bent losgekoppeld. Hoort dat niet zo, vul de code dan opnieuw in.'); return x; }
        if (!x.ok && /geen kamer|geen klascode|opgeheven|verlopen/.test(x.j && x.j.fout || '')){ wis(); toon(naId, 'De klascode ' + k.code + ' is opgeheven door je docent; je bent losgekoppeld.'); return x; }
        if (!x.ok) wachtErbij(k.code, body);
        toon(naId, x.ok ? 'Gemeld bij klas ' + k.code + ' als ' + k.naam + '.' : 'Melden bij de klas lukte niet' + (x.j && x.j.fout ? ': ' + x.j.fout : '.'));
        return x;
      })
      .catch(function(){
        wachtErbij(k.code, body);
        toon(naId, 'Melden bij de klas lukte niet: geen verbinding. Hij gaat vanzelf mee zodra er weer verbinding is.');
        return null;
      });
  }
  /* een tellertje per onderdeel: tel(od, 'breuken', true) -> od.breuken = [goed, gesteld] */
  function tel(od, onderdeel, goed){
    var k = String(onderdeel || 'overig').slice(0, 40);
    var w = od[k] = od[k] || [0, 0];
    w[1]++; if (goed) w[0]++;
    return od;
  }
  /* bij het openen van een pagina eerst kijken of er nog iets klaarstaat */
  if (typeof fetch === 'function') setTimeout(wachtLegen, 2000);
  return { lees:lees, zet:zet, wis:wis, wisLokaal:wisLokaal, meld:meld, sid:sid, controleer:controleer, tel:tel, wachtLegen:wachtLegen, zwaai:zwaai, perOnderdeel:perOnderdeel };
})();
