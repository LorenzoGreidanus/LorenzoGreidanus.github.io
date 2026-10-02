/* De foutenmap: vragen die je fout had in de Vragenrace, Torenverdediging,
   Zwaardvechter, Mijnwerker, Poortrace of Kaarttoren komen hier terecht, en in
   "Oefen je fouten" (fouten.html) krijg je ze terug. Alles staat in deze
   browser; met een speelcode reizen de vragen mee (alleen het kenmerk, het vak
   en hoe ver je bent, de tekst komt weer uit de vragenbank).

   Herhalen over dagen: wie iets een keer goed heeft, weet het morgen vaak
   niet meer. Daarom gaat een vraag niet meteen weg als je hem goed hebt, maar
   schuift hij een bak op en komt hij later terug: na een dag, na drie dagen,
   na een week. Pas wie hem dan nog weet, is hem kwijt. Een fout zet hem weer
   in de eerste bak, voor vandaag.

     bak 0  vandaag          (net fout)
     bak 1  over 1 dag       (1 keer goed)
     bak 2  over 3 dagen     (2 keer goed)
     bak 3  over 7 dagen     (3 keer goed)
     goed in bak 3: geleerd, uit de map

     FOUTENMAP.noteer(vraag, vak)   na een fout antwoord: { v, o, g, u, t }; terug naar bak 0
     FOUTENMAP.goed(h)              goed beantwoord: een bak verder -> { weg, dagen }
     FOUTENMAP.weg(h)               er meteen uit (de map leegmaken)
     FOUTENMAP.lijst()              alle bewaarde vragen, oudste eerst
     FOUTENMAP.nu()                 wat vandaag aan de beurt is, de langst wachtende eerst
     FOUTENMAP.later()              wat pas later terugkomt, de eerstvolgende eerst
     FOUTENMAP.dag()                het nummer van vandaag (dagen sinds 1970, in de eigen tijdzone)
     FOUTENMAP.hash(tekst)          het kenmerk van een vraag */
window.FOUTENMAP = (function(){
  'use strict';
  var SLEUTEL = 'lg-fouten', MAX = 120, NA = [0, 1, 3, 7], BAKKEN = NA.length;
  function hash(t){
    var h = 5381; t = String(t || '');
    for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  function dag(){ var n = new Date(); return Math.floor((n.getTime() - n.getTimezoneOffset() * 60000) / 86400000); }
  /* oude vragen (van voor de bakken) staan gewoon in bak 0, voor vandaag */
  function bakVan(x){ var b = x.b | 0; return b < 0 ? 0 : b >= BAKKEN ? BAKKEN - 1 : b; }
  function lees(){ try { var l = JSON.parse(localStorage.getItem(SLEUTEL) || '[]'); return Array.isArray(l) ? l : []; } catch (e){ return []; } }
  function zet(l){ try { localStorage.setItem(SLEUTEL, JSON.stringify(l)); } catch (e){} }
  function sync(){ if (window.PROFIEL && PROFIEL.sync) PROFIEL.sync(); }
  /* een vraag erin: met de tekst erbij, zodat ook een rekenvraag (die niet in de bank staat) terug kan komen */
  function noteer(q, vak){
    if (!q || !q.v || !Array.isArray(q.o)) return;
    var l = lees(), h = hash(q.v), i = -1;
    for (var k = 0; k < l.length; k++) if (l[k].h === h){ i = k; break; }
    if (i >= 0){ l[i].n = (l[i].n | 0) + 1; l[i].t0 = Date.now(); l[i].b = 0; l[i].d = dag(); }
    else l.push({ h:h, vak:String(vak || ''), v:String(q.v).slice(0, 300), o:q.o.slice(0, 4).map(function(x){ return String(x).slice(0, 120); }), g:q.g | 0, u:String(q.u || '').slice(0, 300), t:String(q.t || '').slice(0, 40), vlag:q.vlag || '', n:1, t0:Date.now(), b:0, d:dag() });
    if (l.length > MAX) l.splice(0, l.length - MAX);
    zet(l);
    sync();
  }
  function goed(h){
    var l = lees(), uit = { weg:false, dagen:0 };
    for (var k = 0; k < l.length; k++){
      if (l[k].h !== h) continue;
      var b = bakVan(l[k]) + 1;
      if (b >= BAKKEN){ l.splice(k, 1); uit.weg = true; }
      else { l[k].b = b; l[k].d = dag() + NA[b]; uit.dagen = NA[b]; }
      break;
    }
    zet(l); sync();
    return uit;
  }
  function weg(h){ zet(lees().filter(function(x){ return x.h !== h; })); sync(); }
  function lijst(){ return lees(); }
  function nu(){
    var v = dag();
    return lees().filter(function(x){ return (x.d | 0) <= v; })
      .sort(function(a, b){ return (a.d | 0) - (b.d | 0) || (a.t0 | 0) - (b.t0 | 0); });
  }
  function later(){
    var v = dag();
    return lees().filter(function(x){ return (x.d | 0) > v; }).sort(function(a, b){ return (a.d | 0) - (b.d | 0); });
  }
  /* alleen kenmerk, vak, bak en dag, voor het profiel */
  function kort(){ return lees().map(function(x){ return { h:x.h, vak:x.vak, b:bakVan(x), d:x.d | 0 }; }); }
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
        if (hash(q.v) === k.h){ l.push({ h:k.h, vak:k.vak, v:q.v, o:q.o.slice(0, 4), g:q.g | 0, u:q.u || '', t:q.t || '', vlag:q.vlag || '', n:1, t0:Date.now(), b:bakVan(k), d:k.d | 0 }); heb[k.h] = true; erbij++; break; }
      }
    });
    if (erbij){ if (l.length > MAX) l.splice(0, l.length - MAX); zet(l); }
    return erbij;
  }
  return { noteer:noteer, goed:goed, weg:weg, lijst:lijst, nu:nu, later:later, dag:dag, hash:hash, kort:kort, neemOver:neemOver, BAKKEN:BAKKEN };
})();
