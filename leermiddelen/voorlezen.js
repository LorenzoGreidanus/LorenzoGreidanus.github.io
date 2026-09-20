/* Een knopje onder een vraag dat de vraag en de antwoorden voorleest.

   Waarom: lezen is voor een deel van de leerlingen het werk, niet de stof. Wie
   moeite heeft met lezen struikelt bij een vraag over de Tweede Wereldoorlog
   over de zin en niet over de oorlog. Met een stem erbij gaat de vraag weer
   over geschiedenis.

   Hoe: de browser kan dit zelf (speechSynthesis). Er gaat dus niets de deur
   uit, er is geen dienst van iemand anders bij betrokken en het werkt zonder
   netwerk. Kan de browser het niet, dan komt het knopje er niet.

   Drie standen, per apparaat bewaard:
     'knop'  het knopje staat er en je drukt zelf (de gewone stand)
     'auto'  elke nieuwe vraag wordt meteen voorgelezen
     'uit'   geen knopje

   Gebruik, net als melding.js:
     VOORLEES.knop(doel, function(){ return { v:'de vraag', o:['a','b'], taal:'nl-NL' }; })
     VOORLEES.volg('zij', kiesDoel, geef)     voor een paneel dat opnieuw getekend wordt
     VOORLEES.keuze(doel)                     de drie standen als knoppenrij
   Roep knop() gerust bij elke vraag opnieuw aan: hij zet zichzelf maar een keer
   neer, en leest bij 'auto' alleen voor als de vraag echt veranderd is. */
window.VOORLEES = (function(){
  'use strict';
  var kan = false;
  try { kan = !!(window.speechSynthesis && window.SpeechSynthesisUtterance); } catch (e){ kan = false; }
  var SLEUTEL = 'lg-voorlezen';
  var LUIDSPREKER = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z"/><path d="M15.8 9.2a4 4 0 0 1 0 5.6"/><path d="M18.4 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>';
  var STOPTEKEN = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></svg>';

  function lees(){ try { return localStorage.getItem(SLEUTEL) || ''; } catch (e){ return ''; } }
  function stand(){ var s = lees(); return (s === 'uit' || s === 'auto') ? s : 'knop'; }
  function zet(nieuw){
    try { localStorage.setItem(SLEUTEL, nieuw); } catch (e){}
    if (nieuw !== 'auto') stop();
    if (nieuw === 'uit') Array.prototype.forEach.call(document.querySelectorAll('.leesvak'), function(el){ el.remove(); });
    document.dispatchEvent(new CustomEvent('voorleeswissel', { detail:{ stand: nieuw } }));
  }

  /* ---------- de stem ---------- */
  var stemmen = [];
  function stemmenLaden(){ try { stemmen = window.speechSynthesis.getVoices() || []; } catch (e){ stemmen = []; } }
  if (kan){
    stemmenLaden();
    try { window.speechSynthesis.addEventListener('voiceschanged', stemmenLaden); } catch (e){}
  }
  /* De eerste stem die bij de taal past. Een stem van het apparaat zelf klinkt
     beter dan een die over het netwerk komt, maar kiezen kunnen we niet: we
     nemen wat er is en beginnen bij een exacte treffer op nl-NL of en-GB. */
  function stemVoor(taal){
    if (!stemmen.length) stemmenLaden();
    var t = String(taal || 'nl-NL').toLowerCase(), kort = t.split('-')[0];
    var raak = null;
    stemmen.forEach(function(s){
      var l = String(s.lang || '').toLowerCase().replace('_', '-');
      if (!raak && l === t) raak = s;
    });
    if (raak) return raak;
    stemmen.forEach(function(s){
      var l = String(s.lang || '').toLowerCase();
      if (!raak && l.indexOf(kort) === 0) raak = s;
    });
    return raak;
  }

  var bezig = null;          /* de knop die nu aan het lezen is */
  function stop(){
    try { window.speechSynthesis.cancel(); } catch (e){}
    if (bezig){ bezigAf(bezig); bezig = null; }
  }
  function bezigAan(knopje){
    bezig = knopje;
    knopje.classList.add('aan');
    knopje.setAttribute('aria-pressed', 'true');
    knopje.innerHTML = STOPTEKEN + '<span>Stop</span>';
  }
  function bezigAf(knopje){
    knopje.classList.remove('aan');
    knopje.setAttribute('aria-pressed', 'false');
    knopje.innerHTML = LUIDSPREKER + '<span>Lees voor</span>';
  }

  /* De vraag, dan de antwoorden met hun nummer erbij, want met de toetsen 1 tot
     4 kies je ze ook. Elk stuk krijgt zijn eigen zin, zodat de stem ertussen
     ademhaalt en je hoort waar een antwoord ophoudt. */
  function stukken(g){
    var uit = [];
    if (g && g.v) uit.push(String(g.v));
    if (g && g.o && g.o.length) g.o.forEach(function(t, i){ uit.push('Antwoord ' + (i + 1) + '. ' + String(t)); });
    return uit.filter(function(t){ return t.replace(/\s/g, ''); });
  }
  function spreek(g, knopje){
    if (!kan) return;
    stop();
    var delen = stukken(g);
    if (!delen.length) return;
    var taal = (g && g.taal) || 'nl-NL', stem = stemVoor(taal);
    if (knopje) bezigAan(knopje);
    delen.forEach(function(tekst, i){
      var u = new SpeechSynthesisUtterance(tekst);
      u.lang = taal;
      if (stem) u.voice = stem;
      u.rate = 0.95;                     /* een tikje rustiger dan de standaard */
      if (i === delen.length - 1) u.onend = function(){ if (knopje && bezig === knopje){ bezigAf(knopje); bezig = null; } };
      try { window.speechSynthesis.speak(u); } catch (e){}
    });
  }

  /* ---------- het knopje ---------- */
  /* Waaraan we zien dat het een andere vraag is: de vraag en de antwoorden bij
     elkaar. Alleen de vraag is niet genoeg, want bij de vlaggen staat er elke
     keer dezelfde zin boven en zitten de verschillen in de landnamen eronder. */
  function kenmerk(g){
    if (!g) return '';
    return String(g.v || '') + '||' + ((g.o || []).join('|'));
  }
  var laatst = '';           /* het kenmerk van wat als laatste vanzelf is voorgelezen */
  /* Het knopje komt naast de vraag te staan en niet erin. Dat is niet alleen
     netter om te zien: een spel dat de volgende vraag neerzet met
     textContent = ... veegt alles binnen dat element weg, en wie de vraag uit
     de pagina leest zou anders "Lees voor" mee voorlezen. */
  function knop(doel, geef){
    if (!kan || !doel || stand() === 'uit') return null;
    var vak = doel.nextElementSibling;
    if (!vak || !vak.classList || !vak.classList.contains('leesvak')) vak = null;
    if (!vak){
      vak = document.createElement('span');
      vak.className = 'leesvak';
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'leesknop';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', 'Lees de vraag en de antwoorden voor');
      b.innerHTML = LUIDSPREKER + '<span>Lees voor</span>';
      b.addEventListener('click', function(){
        if (bezig === b){ stop(); return; }
        var g = null; try { g = geef ? geef() : null; } catch (e){ g = null; }
        laatst = kenmerk(g) || laatst;
        spreek(g, b);
      });
      vak.appendChild(b);
      if (doel.parentNode) doel.parentNode.insertBefore(vak, doel.nextSibling);
      else return null;
    }
    /* vanzelf voorlezen, maar alleen als de vraag echt een andere is */
    if (stand() === 'auto'){
      var g2 = null; try { g2 = geef ? geef() : null; } catch (e){ g2 = null; }
      var k = kenmerk(g2);
      if (k.replace(/[|]/g, '').trim() && k !== laatst){ laatst = k; spreek(g2, vak.querySelector('.leesknop')); }
    }
    return vak;
  }

  /* voor een paneel dat in zijn geheel opnieuw getekend wordt (Zwaardvechter) */
  function volg(id, kiesDoel, geef){
    var el = document.getElementById(id);
    if (!kan || !el || !window.MutationObserver) return;
    var aanHetZetten = false;
    var mo = new MutationObserver(function(){
      if (aanHetZetten) return;
      var d = kiesDoel(el);
      if (!d) return;
      aanHetZetten = true;
      knop(d, geef);
      aanHetZetten = false;
    });
    mo.observe(el, { childList:true, subtree:true });
  }

  /* ---------- de keuze uit drie standen ---------- */
  function keuze(doel){
    if (!doel) return;
    if (!kan){
      doel.innerHTML = '<p class="leesuit">Deze browser kan niet voorlezen. Op een telefoon of een andere browser werkt het meestal wel.</p>';
      return;
    }
    function teken(){
      var nu = stand();
      doel.innerHTML = [['knop', 'Met een knopje'], ['auto', 'Meteen voorlezen'], ['uit', 'Uit']].map(function(k){
        return '<button type="button" data-lees="' + k[0] + '"' + (nu === k[0] ? ' class="aan" aria-pressed="true"' : ' aria-pressed="false"') + '>' + k[1] + '</button>';
      }).join('');
      Array.prototype.forEach.call(doel.querySelectorAll('button'), function(b){
        b.addEventListener('click', function(){ zet(b.getAttribute('data-lees')); teken(); });
      });
    }
    teken();
  }

  /* niemand wil een stem horen van een tabblad dat hij net wegklikte */
  document.addEventListener('visibilitychange', function(){ if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);

  return { kan: function(){ return kan; }, knop: knop, volg: volg, spreek: spreek, stop: stop,
           stand: stand, zet: zet, keuze: keuze };
})();
