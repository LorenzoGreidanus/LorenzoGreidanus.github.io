/* De tutorial aan het begin van een spel: het spel staat stil, een lichtvlek
   wijst aan waar het over gaat, en een kaartje zegt wat je moet doen. Stap
   voor stap, met Volgende en Tutorial overslaan.

   Je ziet hem een keer. Ben je ingelogd (of heb je een speelcode), dan staat
   in je profiel dat je hem had, ook op een ander apparaat. Ben je gast, dan
   onthouden we het alleen zolang dit tabblad open is: op een gedeelde laptop
   is de volgende gast iemand anders. Overslaan kan altijd.

     TUTORIAL.nodig(id)                 of deze speler de tutorial nog moet zien
     TUTORIAL.start(id, stappen, klaar) laat hem zien; klaar(overgeslagen) na afloop
       stappen: [{ titel, tekst, doel }]  doel: een element, een id, een functie die
       een element of een rechthoek {left, top, width, height} geeft, of niets (midden)
     TUTORIAL.open()                    of er nu een tutorial openstaat */
window.TUTORIAL = (function(){
  'use strict';
  var SESSIE = 'lg-tut-', PROFIELSLEUTEL = 'lg-gezien';
  var laag = null, stappen = [], nr = 0, klaarFn = null, huidigId = '', vorigeFocus = null;
  function ss(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e){ return null; } }
  function gezienLijst(){ try { var o = JSON.parse(localStorage.getItem(PROFIELSLEUTEL) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e){ return {}; } }
  function metProfiel(){ return !!(window.PROFIEL && PROFIEL.code && PROFIEL.code()); }
  function nodig(id){
    if (ss(SESSIE + id) === 'ja') return false;
    if (metProfiel() && gezienLijst()[id]) return false;
    return true;
  }
  function onthoud(id){
    ss(SESSIE + id, 'ja');
    if (!metProfiel()) return;
    var g = gezienLijst(); g[id] = true;
    try { localStorage.setItem(PROFIELSLEUTEL, JSON.stringify(g)); } catch (e){}
    if (window.PROFIEL && PROFIEL.sync) PROFIEL.sync();
  }

  var CSS = '' +
    '.tut{position:fixed;inset:0;z-index:9000}' +
    '.tut .tutvlek{position:fixed;border-radius:18px;box-shadow:0 0 0 9999px rgba(15,26,61,.62);border:3px solid #EA9836;transition:all .28s cubic-bezier(.22,.61,.36,1);pointer-events:none}' +
    '.tut .tutvlek.geen{border:none;width:0!important;height:0!important;left:50%!important;top:50%!important}' +
    '.tut .tutkaart{position:fixed;width:min(380px,calc(100vw - 24px));background:#FBF6F1;color:#14224C;border-radius:18px;padding:18px 18px 14px;box-shadow:0 18px 40px rgba(0,0,0,.35);font-family:Poppins,system-ui,sans-serif;transition:top .28s cubic-bezier(.22,.61,.36,1),left .28s cubic-bezier(.22,.61,.36,1)}' +
    '.tut .tutnr{font-family:Caveat,cursive;font-weight:600;font-size:1.25rem;color:#C4452B;line-height:1;display:block;margin-bottom:4px}' +
    '.tut h2{font-size:1.15rem;margin:0 0 6px;line-height:1.2;color:#14224C}' +
    '.tut p{margin:0;font-size:.97rem;line-height:1.5;color:#2b3656}' +
    '.tut .tutknoppen{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap}' +
    '.tut .tutknoppen button{font:inherit;font-weight:600;min-height:44px;border-radius:12px;padding:0 16px;cursor:pointer}' +
    '.tut .tutsla{background:none;border:none;color:#204ECF;text-decoration:underline;text-underline-offset:3px;padding:0 4px!important}' +
    '.tut .tutvolg{background:#204ECF;color:#fff;border:none}' +
    '.tut .tutterug{background:none;border:1.5px solid rgba(20,34,76,.25);color:#14224C}' +
    '.tut .tutrechts{display:flex;gap:8px}' +
    '.tut .tutstip{display:flex;gap:5px;margin-top:12px}' +
    '.tut .tutstip i{width:7px;height:7px;border-radius:50%;background:rgba(20,34,76,.2)}' +
    '.tut .tutstip i.aan{background:#204ECF}' +
    '.tut button:focus-visible{outline:3px solid #B4701A;outline-offset:2px}' +
    '@media(prefers-reduced-motion:reduce){.tut .tutvlek,.tut .tutkaart{transition:none}}';
  function zetCss(){
    if (document.getElementById('tutcss')) return;
    var st = document.createElement('style'); st.id = 'tutcss'; st.textContent = CSS; document.head.appendChild(st);
  }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  /* waar staat het doel op het scherm? */
  function rechthoek(doel){
    if (!doel) return null;
    var d = typeof doel === 'function' ? doel() : doel;
    if (typeof d === 'string') d = document.getElementById(d);
    if (!d) return null;
    if (d.getBoundingClientRect){
      if (d.offsetParent === null && getComputedStyle(d).position !== 'fixed') return null;
      var r = d.getBoundingClientRect();
      /* een leeg of heel dun element (een uitleg die er nog niet staat) is geen doel: dan het midden */
      return r.width >= 20 && r.height >= 20 ? { left:r.left, top:r.top, width:r.width, height:r.height, el:d } : null;
    }
    return d;
  }
  function plaats(){
    if (!laag) return;
    var st = stappen[nr], r = rechthoek(st.doel);
    var vlek = laag.querySelector('.tutvlek'), kaart = laag.querySelector('.tutkaart');
    var vw = window.innerWidth, vh = window.innerHeight, marge = 8;
    if (r && r.el && (r.top < 0 || r.top + r.height > vh)){
      r.el.scrollIntoView({ block:'center', behavior:'auto' });
      r = rechthoek(st.doel);
    }
    if (r){
      var x = Math.max(4, r.left - marge), y = Math.max(4, r.top - marge);
      var b = Math.min(vw - 8, r.left + r.width + marge) - x, h = Math.min(vh - 8, r.top + r.height + marge) - y;
      vlek.classList.remove('geen');
      vlek.style.left = x + 'px'; vlek.style.top = y + 'px'; vlek.style.width = Math.max(0, b) + 'px'; vlek.style.height = Math.max(0, h) + 'px';
      /* het kaartje: eronder als daar plek is, anders erboven, anders ernaast of in het midden */
      var kb = kaart.offsetWidth, kh = kaart.offsetHeight;
      var kx = Math.min(vw - kb - 12, Math.max(12, x + b / 2 - kb / 2)), ky;
      if (y + h + 14 + kh < vh - 8) ky = y + h + 14;
      else if (y - 14 - kh > 8) ky = y - 14 - kh;
      else {
        /* het doel is groot (de hele arena): het kaartje onderin, eroverheen */
        ky = Math.max(12, vh - kh - 16);
      }
      kaart.style.left = kx + 'px'; kaart.style.top = ky + 'px';
    } else {
      vlek.classList.add('geen');
      kaart.style.left = Math.max(12, (vw - kaart.offsetWidth) / 2) + 'px';
      kaart.style.top = Math.max(12, (vh - kaart.offsetHeight) / 2) + 'px';
    }
  }
  function teken(){
    var st = stappen[nr], laatste = nr === stappen.length - 1;
    var k = laag.querySelector('.tutkaart');
    k.innerHTML = '<span class="tutnr">tutorial ' + (nr + 1) + ' van ' + stappen.length + '</span>' +
      '<h2 id="tutkop">' + schoon(st.titel) + '</h2><p id="tuttekst">' + schoon(st.tekst) + '</p>' +
      '<div class="tutknoppen"><button type="button" class="tutsla">Tutorial overslaan</button><span class="tutrechts">' +
      (nr ? '<button type="button" class="tutterug">Terug</button>' : '') +
      '<button type="button" class="tutvolg">' + (laatste ? 'Beginnen' : 'Volgende') + '</button></span></div>' +
      '<div class="tutstip" aria-hidden="true">' + stappen.map(function(x, i){ return '<i' + (i === nr ? ' class="aan"' : '') + '></i>'; }).join('') + '</div>';
    k.querySelector('.tutsla').addEventListener('click', function(){ sluit(true); });
    k.querySelector('.tutvolg').addEventListener('click', volgende);
    var t = k.querySelector('.tutterug'); if (t) t.addEventListener('click', function(){ nr--; teken(); });
    plaats();
    k.querySelector('.tutvolg').focus({ preventScroll:true });
  }
  function volgende(){ if (nr < stappen.length - 1){ nr++; teken(); } else sluit(false); }
  /* toetsen: zolang de tutorial open is, krijgt het spel ze niet */
  function toets(e){
    if (!laag) return;
    var k = e.key;
    if (k === 'Enter' || k === 'ArrowRight'){ if (!(document.activeElement && document.activeElement.classList && (document.activeElement.classList.contains('tutsla') || document.activeElement.classList.contains('tutterug')))) { e.preventDefault(); volgende(); } }
    else if (k === 'ArrowLeft' && nr > 0){ e.preventDefault(); nr--; teken(); }
    else if (k === 'Escape'){ e.preventDefault(); sluit(true); }
    else if (k === 'Tab'){
      /* de focus blijft in het kaartje */
      var kn = [].slice.call(laag.querySelectorAll('button'));
      var i = kn.indexOf(document.activeElement);
      e.preventDefault();
      kn[(i + (e.shiftKey ? kn.length - 1 : 1)) % kn.length].focus();
    }
    e.stopImmediatePropagation();
  }
  function sluit(overgeslagen){
    if (!laag) return;
    onthoud(huidigId);
    laag.remove(); laag = null;
    window.removeEventListener('keydown', toets, true);
    window.removeEventListener('keyup', blokkeer, true);
    window.removeEventListener('resize', plaats);
    if (vorigeFocus && vorigeFocus.focus) try { vorigeFocus.focus({ preventScroll:true }); } catch (e){}
    var f = klaarFn; klaarFn = null;
    if (f) f(overgeslagen);
  }
  function blokkeer(e){ if (laag) e.stopImmediatePropagation(); }
  function start(id, st, klaar){
    if (laag || !st || !st.length){ if (klaar) klaar(true); return; }
    zetCss();
    huidigId = id; stappen = st; nr = 0; klaarFn = klaar || null; vorigeFocus = document.activeElement;
    laag = document.createElement('div');
    laag.className = 'tut';
    laag.innerHTML = '<div class="tutvlek"></div><div class="tutkaart" role="dialog" aria-modal="true" aria-labelledby="tutkop" aria-describedby="tuttekst"></div>';
    /* tikken naast het kaartje doet niets: het spel eronder staat stil en blijft stil */
    laag.addEventListener('pointerdown', function(e){ if (!e.target.closest('.tutkaart')) e.preventDefault(); });
    document.body.appendChild(laag);
    window.addEventListener('keydown', toets, true);
    window.addEventListener('keyup', blokkeer, true);
    window.addEventListener('resize', plaats);
    teken();
  }
  /* wacht tot iets waar is, hoogstens zes seconden */
  function zodra(voorwaarde, fn, max){ var t = 0; (function kijk(){ if (voorwaarde()) return fn(); if ((t += 100) < (max || 6000)) setTimeout(kijk, 100); })(); }
  /* Voor de oefenspellen: na de startknop, zodra het spelscherm er is, de
     tutorial. opts.bewaar geeft wat de klok nu is; opts.herstel(t) zet hem daar
     weer op, elke zestig milliseconden zolang de tutorial open is, zodat de
     tijd stilstaat. opts.klaar loopt na afloop. */
  function naStart(knopId, id, stappen, opts){
    var knop = document.getElementById(knopId); if (!knop) return;
    opts = opts || {};
    knop.addEventListener('click', function(){
      if (!nodig(id)) return;
      zodra(function(){ var sp = document.getElementById('scherm-spel'); return !!(sp && !sp.classList.contains('hide') && sp.offsetParent !== null); }, function(){
        if (!nodig(id) || laag) return;
        var st = typeof stappen === 'function' ? stappen() : stappen;
        if (!st || !st.length) return;
        var bewaard = opts.bewaar ? opts.bewaar() : undefined, klok = null;
        if (opts.herstel) klok = setInterval(function(){ opts.herstel(bewaard); }, 60);
        start(id, st, function(){
          if (klok) clearInterval(klok);
          if (opts.herstel) opts.herstel(bewaard);
          if (opts.klaar) opts.klaar();
        });
      });
    });
  }
  return { nodig: nodig, start: start, open: function(){ return !!laag; }, onthoud: onthoud, naStart: naStart, zodra: zodra };
})();
