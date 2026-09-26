/* Verbinding: wat de klassenspellen delen tussen het bord en de telefoons.

   Klasquiz, Klasstrijd, Tekenslag, de telefoon van een rollenspel (rol.html)
   en het bord van een rollenspel (rollen.js) hadden elk hun eigen verbinding.
   Alleen die van rollen.js zei het als de verbinding haperde; de rest gooide
   een bericht zonder verbinding stil weg, en een leerling zag "Verstuurd"
   terwijl er niets was verstuurd. Nu praten ze allemaal via deze ene.

     var v = VERBINDING.maak({
       pad:     'ABCD?rol=speler&sid=...',   wat er achter /ws/ komt
       rol:     'host' of 'speler',          bepaalt de woorden in de strook
       max:     8,                           na zoveel pogingen opgeven (0: blijven proberen)
       onBericht(m), onOpen(opnieuw), onWacht(pogingen), onEruit(), onDicht(reden)
     });
     v.stuur(m)            geeft true als het bericht nu echt de deur uit is;
                           anders staat het in de wachtrij tot de verbinding terug is
     v.stuur(m, { rij:false })          niet bewaren als het niet lukt
     v.stuur(m, { daarna:function(){} }) draait zodra een bewaard bericht alsnog weg is
     v.sluit()             netjes ophangen, niet opnieuw proberen
     v.zetDicht()          niet meer opnieuw verbinden (weggestuurd, afgelopen)
     v.open()              is er nu een open verbinding?

   Daarnaast twee dingen voor het bord:
     VERBINDING.bord({ knoppen:'.bordknop' })   de bordstand: groot en breed op een
                                                breed scherm, beeldvullend met de knop
     VERBINDING.toetsen(function(){ ... })      spatie, pijl naar rechts of PageDown
                                                (de afstandsbediening) is "volgende" */
(function(){
  'use strict';
  var MAX_RIJ = 200, LANG = 8;

  /* ---------- de strook onderaan ---------- */
  var CSS =
    '.vb-balk{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9998;max-width:600px;margin-inline:auto;' +
      'border-radius:16px;padding:12px 14px;font:500 .95rem Poppins,system-ui,sans-serif;line-height:1.4;text-align:left;' +
      'box-shadow:0 14px 34px rgba(0,0,0,.3);display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '.vb-balk b{display:block;font-weight:700}' +
    '.vb-balk span{flex:1 1 220px;min-width:0}' +
    /* haperen: amber met donkerblauw, in beide standen hetzelfde */
    '.vb-balk.wacht{background:#EA9836;color:#14224C}' +
    /* weg: donkerblauw met een lichte rand, zodat hij ook op een donkere pagina loskomt */
    '.vb-balk.weg{background:#14224C;color:#F3EFE9;border:1.5px solid rgba(243,239,233,.28)}' +
    '.vb-balk button{margin-left:auto;flex:none;border:none;border-radius:999px;padding:8px 16px;min-height:44px;' +
      'font:600 .9rem Poppins,system-ui,sans-serif;background:#F3EFE9;color:#14224C;cursor:pointer}' +
    '.vb-balk.wacht button{background:#14224C;color:#F3EFE9}' +
    '.vb-balk button:focus-visible{outline:3px solid #83A5F2;outline-offset:2px}' +
    /* de strook mag niets wegdrukken, maar ook niets onbereikbaar maken: er komt ruimte onder de pagina */
    'body.vb-hapert{padding-bottom:110px}' +
    '@media(prefers-reduced-motion:no-preference){.vb-balk{animation:vbOp .3s cubic-bezier(.22,1,.36,1)}' +
      '@keyframes vbOp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}';
  function stijl(){
    if (document.getElementById('vb-stijl') || !document.head) return;
    var s = document.createElement('style'); s.id = 'vb-stijl'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  var strook = null;
  /* wat: '' weg, 'wacht' (opnieuw verbinden) of 'weg' (opgegeven); kop, uitleg, knop {tekst, doe} */
  function balk(wat, kop, uitleg, knop){
    if (!document.body) return;
    if (!wat){
      if (strook && strook.parentNode) strook.parentNode.removeChild(strook);
      strook = null; document.body.classList.remove('vb-hapert');
      return;
    }
    stijl();
    if (!strook){
      strook = document.createElement('div');
      strook.setAttribute('role', 'status');
      strook.setAttribute('aria-live', 'polite');
      document.body.appendChild(strook);
    }
    strook.className = 'vb-balk ' + wat;
    strook.innerHTML = '';
    var t = document.createElement('span');
    var b = document.createElement('b'); b.textContent = kop; t.appendChild(b);
    if (uitleg) t.appendChild(document.createTextNode(uitleg));
    strook.appendChild(t);
    if (knop){
      var k = document.createElement('button');
      k.type = 'button'; k.textContent = knop.tekst;
      k.addEventListener('click', knop.doe);
      strook.appendChild(k);
    }
    document.body.classList.add('vb-hapert');
  }
  /* waarom het hapert, in gewone woorden */
  function reden(code){
    if (navigator.onLine === false) return 'Dit apparaat heeft geen internet. ';
    if (code === 4000) return 'Er kwam een tijd niets meer binnen. ';
    return 'De verbinding met de kamer viel weg. ';
  }

  function maak(o){
    o = o || {};
    var ws = null, dicht = false, pogingen = 0, rij = [], klok = null, host = o.rol === 'host';
    /* de verbinding levend houden, en merken als hij na slaap of wifi-uitval stil dood is (wakker.js) */
    (function(){ function aan(){ if (window.WAKKER) WAKKER({ ws:function(){ return ws; }, dicht:function(){ return dicht; } }); }
      if (document.readyState === 'complete') aan(); else addEventListener('load', aan); })();

    function zegWacht(code){
      var lang = !o.max && pogingen > LANG;
      var uitleg = reden(code) + (host
        ? 'De kamer loopt gewoon door; zodra de verbinding terug is, staat alles weer goed op het bord.'
        : 'Wat je nu kiest, sturen we zodra de verbinding terug is.');
      if (lang) uitleg += ' Duurt het lang? Laad de pagina opnieuw.';
      balk('wacht', 'Opnieuw verbinden…', ' ' + uitleg, lang ? { tekst:'Opnieuw laden', doe:function(){ location.reload(); } } : null);
    }
    function open(){
      if (dicht) return;
      clearTimeout(klok);
      var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
      var s = new WebSocket(proto + location.host + '/ws/' + o.pad);
      ws = s;
      s.onopen = function(){
        if (ws !== s) return;
        var opnieuw = pogingen > 0;
        pogingen = 0;
        balk('');
        /* eerst wat bleef liggen, in de volgorde waarin het kwam */
        rij.splice(0).forEach(function(x){ if (verzend(x.m) && x.daarna) try { x.daarna(); } catch (e){} });
        if (o.onWacht && opnieuw) o.onWacht(0);
        if (o.onOpen) o.onOpen(opnieuw);
      };
      s.onmessage = function(e){
        if (e.data === 'pong') return;
        var m; try { m = JSON.parse(e.data); } catch (x){ return; }
        if (o.onBericht) o.onBericht(m);
      };
      s.onclose = function(e){
        if (ws !== s) return;
        ws = null;
        if (dicht) return;
        var r = (e && e.reason) || '';
        /* een nette afsluiting door de kamer: niet blijven proberen */
        if (e && e.code === 1000 && /verwijderd/.test(r)){ dicht = true; balk(''); if (o.onEruit) o.onEruit(); else if (o.onDicht) o.onDicht(r); return; }
        if (e && e.code === 1000 && /gesloten|afgelopen|nieuwe kamer/.test(r)){ dicht = true; balk(''); if (o.onDicht) o.onDicht(r); return; }
        pogingen++;
        if (o.onWacht) o.onWacht(pogingen);
        /* Een bord met een eigen spelstand (de rollenspellen) geeft het na een
           paar pogingen op en zegt dat, zodat de docent de kamer opnieuw kan
           openen. De rest blijft proberen: de kamer bewaart daar alles. */
        if (o.max && pogingen > o.max){
          dicht = true;
          balk('weg', 'De verbinding met de kamer is weg.', ' ' + (o.wegTekst || 'Laad de pagina opnieuw.'),
            { tekst:o.wegKnop || 'Opnieuw laden', doe:function(){ location.reload(); } });
          if (o.onDicht) o.onDicht('de verbinding met de kamer is weg');
          return;
        }
        zegWacht(e && e.code);
        klok = setTimeout(open, Math.min(8000, 700 * pogingen));
      };
    }
    function verzend(m){
      if (!ws || ws.readyState !== 1) return false;
      try { ws.send(typeof m === 'string' ? m : JSON.stringify(m)); return true; } catch (e){ return false; }
    }
    function stuur(m, x){
      x = x || {};
      if (verzend(m)) return true;
      if (x.rij !== false && !dicht){
        if (rij.length >= MAX_RIJ) rij.shift();
        rij.push({ m:m, daarna:x.daarna });
      }
      return false;
    }
    /* weer online: niet op de wachttijd wachten */
    addEventListener('online', function(){ if (!dicht && !ws && pogingen){ open(); } });
    open();
    return {
      stuur: stuur,
      open: function(){ return !!(ws && ws.readyState === 1); },
      dicht: function(){ return dicht; },
      ws: function(){ return ws; },
      zetDicht: function(){ dicht = true; rij = []; clearTimeout(klok); balk(''); },
      sluit: function(){ dicht = true; rij = []; clearTimeout(klok); balk(''); if (ws){ try { ws.close(1000, 'klaar'); } catch (e){} } ws = null; }
    };
  }

  /* ---------- de bordstand ----------
     Op een breed scherm (vanaf 1200 beeldpunten) gaat het bord vanzelf in de
     bordstand: body.bord, breder en met grotere letters. De knop Digibord
     maakt het daarnaast beeldvullend (body.bord-vol); Gewoon scherm of Esc
     haalt dat weer weg. Elke pagina zegt zelf wat body.bord groter maakt. */
  function bord(o){
    o = o || {};
    var actief = false, handmatig = false, BREED = o.breed || 1200;
    function knoppen(){ return document.querySelectorAll(o.knoppen || '.bordknop'); }
    function zet(aan, vol){
      document.body.classList.toggle('bord', !!aan);
      document.body.classList.toggle('bord-vol', !!(aan && vol));
      Array.prototype.forEach.call(knoppen(), function(b){
        b.textContent = aan && vol ? 'Gewoon scherm' : 'Digibord';
        b.setAttribute('aria-pressed', aan && vol ? 'true' : 'false');
      });
    }
    function vanzelf(){
      if (!actief || document.body.classList.contains('bord-vol')) return;
      zet(!handmatig && innerWidth >= BREED, false);
    }
    addEventListener('resize', vanzelf);
    document.addEventListener('fullscreenchange', function(){
      if (!document.fullscreenElement && document.body.classList.contains('bord-vol')){ document.body.classList.remove('bord-vol'); zet(false, false); vanzelf(); }
    });
    document.addEventListener('click', function(e){
      var b = e.target && e.target.closest ? e.target.closest(o.knoppen || '.bordknop') : null;
      if (!b) return;
      if (document.body.classList.contains('bord-vol')){
        handmatig = true; zet(false, false);
        try { if (document.fullscreenElement) document.exitFullscreen(); } catch (x){}
      } else {
        handmatig = false; zet(true, true);
        try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function(){}); } catch (x){}
      }
    });
    return {
      aan: function(){ actief = true; vanzelf(); },
      uit: function(){ actief = false; zet(false, false); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (x){} }
    };
  }

  /* ---------- de afstandsbediening ----------
     Spatie, pijl naar rechts en PageDown (wat een presenter stuurt) doen
     "volgende". Niet als je in een invulveld staat, en een spatie op een
     knop laten we aan die knop. De functie geeft true als hij iets deed. */
  function toetsen(volgende){
    document.addEventListener('keydown', function(e){
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var k = e.key;
      if (k !== ' ' && k !== 'Spacebar' && k !== 'ArrowRight' && k !== 'PageDown') return;
      var el = document.activeElement, tag = el && el.tagName ? el.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (el && el.isContentEditable)) return;
      if ((k === ' ' || k === 'Spacebar') && (tag === 'button' || tag === 'a' || (el && el.getAttribute && el.getAttribute('role') === 'button'))) return;
      if (volgende(e)) e.preventDefault();
    });
  }
  /* een knop die in beeld staat en het doet: dan mag de afstandsbediening hem indrukken */
  function drukOp(el){
    if (!el || el.disabled || !el.getClientRects().length) return false;
    el.click(); return true;
  }

  window.VERBINDING = { maak:maak, balk:balk, bord:bord, toetsen:toetsen, drukOp:drukOp };
})();
