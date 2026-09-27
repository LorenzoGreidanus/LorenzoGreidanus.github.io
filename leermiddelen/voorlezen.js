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
     VOORLEES.spreek({ v:'tekst', taal:'nl-NL', tempo:0.7, klaar:function(reden){} })
                                              zelf iets voorlezen; klaar komt als de stem echt stopt
     VOORLEES.stemmenVoor('nl-NL'), stemVoor, kiesStem(taal, naam), opStemmen(fn)
                                              welke stemmen er zijn en welke gekozen is
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
  /* De lijst met stemmen komt in Chrome pas na een tijdje (voiceschanged).
     Wie wil weten welke stemmen er zijn, meldt zich met opStemmen(fn): fn
     draait meteen, bij elke nieuwe lijst, en na anderhalve seconde nog een
     keer, want dan weten we ook dat er echt geen stemmen zijn. */
  var stemmen = [], luisteraars = [], begin = Date.now(), NA = 1500;
  function stemmenLaden(){
    try { stemmen = window.speechSynthesis.getVoices() || []; } catch (e){ stemmen = []; }
    luisteraars.slice().forEach(function(f){ try { f(); } catch (e){} });
  }
  if (kan){
    stemmenLaden();
    try { window.speechSynthesis.addEventListener('voiceschanged', stemmenLaden); } catch (e){}
    setTimeout(stemmenLaden, NA + 50);
  }
  /* geeft een functie terug om weer af te melden */
  function opStemmen(fn){
    if (typeof fn !== 'function') return function(){};
    luisteraars.push(fn);
    var weg = function(){ var i = luisteraars.indexOf(fn); if (i >= 0) luisteraars.splice(i, 1); };
    try { fn(); } catch (e){}
    return weg;
  }
  /* bekend: de lijst is er, of we hebben lang genoeg gewacht om te weten dat hij leeg blijft */
  function stemmenBekend(){ return !kan || stemmen.length > 0 || Date.now() - begin > NA; }

  /* Hoe goed past een stem? Eerst de taal: nl-NL gaat voor nl-BE (en en-GB
     voor en-US). Dan de klank: de nieuwe stemmen (Natural, Neural, Online,
     Premium) klinken veel beter dan de oude, en die van Google en Microsoft
     zijn meestal beter dan wat er verder op een apparaat staat. -1: past niet. */
  function taalVan(s){ return String(s && s.lang || '').toLowerCase().replace('_', '-'); }
  function stemScore(s, taal){
    var t = String(taal || 'nl-NL').toLowerCase(), l = taalVan(s), sc;
    if (l === t) sc = 100; else if (l.split('-')[0] === t.split('-')[0]) sc = 50; else return -1;
    var naam = String(s.name || '');
    if (/natural|neural|online|premium|enhanced/i.test(naam)) sc += 20;
    if (/google|microsoft/i.test(naam)) sc += 10;
    if (s['default']) sc += 1;
    return sc;
  }
  /* alle stemmen voor een taal, de beste eerst */
  function stemmenVoor(taal){
    if (!stemmen.length && kan) try { stemmen = window.speechSynthesis.getVoices() || []; } catch (e){}
    return stemmen.map(function(s){ return { s:s, sc:stemScore(s, taal) }; })
      .filter(function(x){ return x.sc >= 0; })
      .sort(function(a, b){ return b.sc - a.sc; })
      .map(function(x){ return x.s; });
  }
  /* de gekozen stem blijft op dit apparaat, per taal (nl, en) */
  function stemSleutel(taal){ return 'lg-stem-' + String(taal || 'nl-NL').toLowerCase().split('-')[0]; }
  function gekozenStem(taal){ try { return localStorage.getItem(stemSleutel(taal)) || ''; } catch (e){ return ''; } }
  function kiesStem(taal, naam){ try { if (naam) localStorage.setItem(stemSleutel(taal), naam); else localStorage.removeItem(stemSleutel(taal)); } catch (e){} }
  /* De stem voor een taal: de gekozen stem als die er nog is, anders de beste. */
  function stemVoor(taal){
    var lijst = stemmenVoor(taal), wil = gekozenStem(taal);
    if (wil){ var raak = lijst.filter(function(s){ return s.name === wil || s.voiceURI === wil; })[0]; if (raak) return raak; }
    return lijst[0] || null;
  }

  var bezig = null;          /* de knop die nu aan het lezen is */
  /* Wie voorlezen aanvraagt met een klaar-functie, hoort precies wanneer de
     stem stopt: klaar('klaar') na de laatste zin, klaar('stop') als iemand
     het afbreekt, en anders de fout van de browser ('not-allowed',
     'synthesis-failed', ...). Elke beurt heeft een nummer; een late melding
     van een afgebroken beurt telt niet meer. */
  var beurt = 0, lopend = null, vast = [];
  function afronden(reden){
    var l = lopend; lopend = null;
    if (!l) return;
    clearTimeout(l.wacht);
    if (l.klaar) try { l.klaar(reden); } catch (e){}
  }
  function stop(){
    beurt++;
    try { window.speechSynthesis.cancel(); } catch (e){}
    if (bezig){ bezigAf(bezig); bezig = null; }
    afronden('stop');
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
  /* g: { v, o, taal, tempo (standaard 0.95), stem (een stem uit stemmenVoor), klaar(reden) } */
  function spreek(g, knopje){
    var klaar = g && typeof g.klaar === 'function' ? g.klaar : null;
    if (!kan){ if (klaar) setTimeout(function(){ klaar('geen'); }, 0); return; }
    stop();
    var delen = stukken(g);
    if (!delen.length){ if (klaar) setTimeout(function(){ klaar('leeg'); }, 0); return; }
    var taal = (g && g.taal) || 'nl-NL', stem = (g && g.stem) || stemVoor(taal);
    var tempo = g && g.tempo > 0 ? g.tempo : 0.95;       /* een tikje rustiger dan de standaard */
    var mijn = beurt, tekens = delen.join(' ').length;
    if (knopje) bezigAan(knopje);
    function af(reden){
      if (mijn !== beurt) return;
      if (knopje && bezig === knopje){ bezigAf(knopje); bezig = null; }
      afronden(reden);
    }
    /* Een vangnet: sommige browsers melden het einde nooit (een stem die
       vastloopt, een tabblad op de achtergrond). Ruim na de te verwachten duur
       is de beurt dan toch voorbij. */
    lopend = { klaar: klaar, wacht: setTimeout(function(){ af('te lang'); }, Math.max(6000, tekens * 160 / tempo)) };
    /* de uitspraken vasthouden: Chrome ruimt ze anders soms op voordat onend komt */
    vast = [];
    delen.forEach(function(tekst, i){
      var u = new SpeechSynthesisUtterance(tekst);
      u.lang = taal;
      if (stem) u.voice = stem;
      u.rate = tempo;
      if (i === delen.length - 1) u.onend = function(){ af('klaar'); };
      u.onerror = function(e){ af((e && e.error) || 'fout'); };
      vast.push(u);
      try { window.speechSynthesis.speak(u); } catch (e){ af('fout'); }
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
           stand: stand, zet: zet, keuze: keuze,
           stemVoor: stemVoor, stemmenVoor: stemmenVoor, kiesStem: kiesStem, gekozenStem: gekozenStem,
           opStemmen: opStemmen, stemmenBekend: stemmenBekend };
})();
