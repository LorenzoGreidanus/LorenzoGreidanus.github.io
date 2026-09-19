/* De foutenmap: vragen die je fout had in de Vragenrace, Torenverdediging of
   Zwaardvechter komen hier terecht, en in "Oefen je fouten" (fouten.html)
   krijg je ze terug tot je ze goed hebt. Alles staat in deze browser; met een
   speelcode reizen de vragen mee (alleen het kenmerk en het vak, de tekst
   komt weer uit de vragenbank).

     FOUTENMAP.noteer(vraag, vak)   na een fout antwoord: { v, o, g, u, t }
     FOUTENMAP.lijst()              alle bewaarde vragen, oudste eerst
     FOUTENMAP.goed(h)              een vraag is goed beantwoord: eruit
     FOUTENMAP.hash(tekst)          het kenmerk van een vraag */
window.FOUTENMAP = (function(){
  'use strict';
  var SLEUTEL = 'lg-fouten', MAX = 80;
  function hash(t){
    var h = 5381; t = String(t || '');
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  function lees(){ try { var l = JSON.parse(localStorage.getItem(SLEUTEL) || '[]'); return Array.isArray(l) ? l : []; } catch (e){ return []; } }
  function zet(l){ try { localStorage.setItem(SLEUTEL, JSON.stringify(l)); } catch (e){} }
  /* een vraag erin: met de tekst erbij, zodat ook een rekenvraag (die niet in de bank staat) terug kan komen */
  function noteer(q, vak){
    if (!q || !q.v || !Array.isArray(q.o)) return;
    var l = lees(), h = hash(q.v), i = -1;
    for (var k = 0; k < l.length; k++) if (l[k].h === h){ i = k; break; }
    if (i >= 0){ l[i].n = (l[i].n | 0) + 1; l[i].t0 = Date.now(); }
    else l.push({ h:h, vak:String(vak || ''), v:String(q.v).slice(0, 300), o:q.o.slice(0, 4).map(function(x){ return String(x).slice(0, 120); }), g:q.g | 0, u:String(q.u || '').slice(0, 300), t:String(q.t || '').slice(0, 40), vlag:q.vlag || '', n:1, t0:Date.now() });
    if (l.length > MAX) l.splice(0, l.length - MAX);
    zet(l);
    if (window.PROFIEL && PROFIEL.sync) PROFIEL.sync();
  }
  function goed(h){ var l = lees().filter(function(x){ return x.h !== h; }); zet(l); if (window.PROFIEL && PROFIEL.sync) PROFIEL.sync(); }
  function lijst(){ return lees(); }
  /* alleen kenmerk en vak, voor het profiel */
  function kort(){ return lees().map(function(x){ return { h:x.h, vak:x.vak }; }); }
  /* van het profiel: kenmerken die hier nog niet staan, terugzoeken in de vragenbank (als die geladen is) */
  function neemOver(kortLijst, bronnen){
    if (!Array.isArray(kortLijst) || !kortLijst.length) return 0;
    var l = lees(), heb = {}, erbij = 0;
    l.forEach(function(x){ heb[x.h] = true; });
    kortLijst.forEach(function(k){
      if (!k || heb[k.h]) return;
      var bron = bronnen && bronnen[k.vak];
      if (!bron) return;
      for (var i = 0; i < bron.length; i++){
        var q = bron[i];
        if (hash(q.v) === k.h){ l.push({ h:k.h, vak:k.vak, v:q.v, o:q.o.slice(0, 4), g:q.g | 0, u:q.u || '', t:q.t || '', vlag:q.vlag || '', n:1, t0:Date.now() }); heb[k.h] = true; erbij++; break; }
      }
    });
    if (erbij){ if (l.length > MAX) l.splice(0, l.length - MAX); zet(l); }
    return erbij;
  }
  return { noteer:noteer, goed:goed, lijst:lijst, hash:hash, kort:kort, neemOver:neemOver };
})();
