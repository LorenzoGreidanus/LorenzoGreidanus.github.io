/* Luisteren en typen, voor het dictee (Nederlands) en de dictation (Engels).
   De browser leest voor met voorlezen.js (speechSynthesis); de leerling ziet
   de tekst niet en typt wat hij hoort. Kan de browser niet voorlezen, dan is
   er een noodknop die de tekst twee seconden laat zien, zodat het spel toch
   bruikbaar blijft.

     LUISTER.opgave({
       onderdeel, onderdeelNaam, taal:'nl-NL',
       spreek:'Hij vindt het leuk.',        wat de stem zegt
       antwoord:'vindt' of ['color', 'colour'],  wat er getypt moet worden
       gat:'Hij ___ het leuk.',             (niet verplicht) de zin met een gat in beeld: dan typ je alleen het woord
       exact:true,                          hoofdletters en leestekens tellen mee (anders niet)
       vraag, opdracht, uitleg, antwoordTekst, sleutel, beeldExtra
     })
   geeft een opgave in de 'eigen' vorm van vakspel.js. */
window.LUISTER = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  var CSS = '.luister{display:grid;gap:12px;justify-items:center}' +
    '.luister .spreker{width:120px;height:90px;color:var(--nadruk)}' +
    '.luister .spreker .golf{opacity:.25;transition:opacity .2s}' +
    '.luister.praat .spreker .golf{opacity:1;animation:luistergolf .9s ease-in-out infinite alternate}' +
    '@keyframes luistergolf{from{transform:scale(.96);transform-origin:40% 50%}to{transform:scale(1.04);transform-origin:40% 50%}}' +
    '.luister .knoppen{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    '.luister .knoppen button{border:none;border-radius:999px;padding:12px 22px;font-weight:600;min-height:46px;background:var(--nadruk);color:#fff}' +
    '.luister .knoppen button.stil{background:var(--kaart2);color:var(--ink)}' +
    '.luister .knoppen button:disabled{opacity:.45;cursor:not-allowed}' +
    '.luister .gat{font-size:1.15rem;font-weight:600;text-align:center;line-height:1.5}' +
    '.luister .gat b{display:inline-block;min-width:4em;border-bottom:3px solid var(--nadruk);color:var(--nadruk)}' +
    '.luister input{width:min(100%,26em);height:54px;border-radius:14px;border:2px solid var(--rand2);background:var(--kaart);color:var(--ink);font-size:1.15rem;font-weight:600;text-align:center;padding:0 14px}' +
    '.luister input:focus{outline:none;border-color:var(--nadruk);box-shadow:0 0 0 4px var(--nadruk-zacht)}' +
    '.luister input.goed{background:var(--goed-bg);border-color:var(--goed);color:var(--goed)}' +
    '.luister input.fout{background:var(--fout-bg);border-color:var(--fout);color:var(--fout)}' +
    '.luister .flits{min-height:1.6em;font-size:1.2rem;font-weight:600;color:var(--nadruk);text-align:center}' +
    '.luister .geen{font-size:.86rem;color:var(--muted);text-align:center;max-width:46ch}' +
    '.luister .verschil{font-size:1.05rem;text-align:center;line-height:1.6}' +
    '.luister .verschil span{padding:0 1px;border-radius:4px}' +
    '.luister .verschil .weg{background:var(--fout-bg);color:var(--fout);text-decoration:line-through}' +
    '.luister .verschil .erbij{background:var(--goed-bg);color:var(--goed);font-weight:700}' +
    '.luister .verschil small{display:block;color:var(--muted);font-size:.78rem}';
  var cssGezet = false;
  function zetCss(){ if (cssGezet) return; cssGezet = true; var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
  var SPREKER = '<svg class="spreker" viewBox="0 0 120 90" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M18 36h16l20-16v50L34 54H18z" fill="currentColor" fill-opacity=".15"/>' +
    '<g class="golf"><path d="M68 32a18 18 0 0 1 0 26"/><path d="M80 22a32 32 0 0 1 0 46"/><path d="M92 12a46 46 0 0 1 0 66"/></g></svg>';

  function norm(t, exact){
    t = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    if (exact) return t.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
    return t.toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:"]/g, '').replace(/\s+/g, ' ').trim();
  }
  /* het verschil letter voor letter: wat de leerling te veel (doorgestreept)
     of te weinig (groen) had, via de langste gemeenschappelijke deelrij */
  function verschil(eigen, goed){
    var a = eigen.split(''), b = goed.split(''), n = a.length, m = b.length, L = [];
    for (var i = 0; i <= n; i++){ L[i] = []; for (var j = 0; j <= m; j++) L[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var uit = '', p = 0, q = 0;
    while (p < n && q < m){
      if (a[p] === b[q]){ uit += schoon(a[p]); p++; q++; }
      else if (L[p + 1][q] >= L[p][q + 1]){ uit += '<span class="weg">' + schoon(a[p]) + '</span>'; p++; }
      else { uit += '<span class="erbij">' + schoon(b[q]) + '</span>'; q++; }
    }
    while (p < n){ uit += '<span class="weg">' + schoon(a[p]) + '</span>'; p++; }
    while (q < m){ uit += '<span class="erbij">' + schoon(b[q]) + '</span>'; q++; }
    return uit;
  }

  function opgave(o){
    zetCss();
    var goedLijst = (Array.isArray(o.antwoord) ? o.antwoord : [o.antwoord]).map(String);
    return {
      onderdeel: o.onderdeel, onderdeelNaam: o.onderdeelNaam, vorm: 'eigen', sleutel: o.sleutel, uitleg: o.uitleg, antwoordTekst: o.antwoordTekst || goedLijst[0],
      vraag: o.vraag || 'Luister en typ wat je hoort.', opdracht: o.opdracht || '', beeld: o.beeldExtra || '',
      teken: function(el, api){
        var kan = !!(window.VOORLEES && VOORLEES.kan()), keren = 0, MAX = 3;
        el.innerHTML = '<div class="luister" id="luistervak">' + SPREKER +
          (o.gat ? '<p class="gat">' + schoon(o.gat).replace(/_{2,}/, '<b>&nbsp;</b>') + '</p>' : '') +
          '<div class="knoppen"><button type="button" id="luisterBtn">Luister</button>' +
          '<button type="button" class="stil" id="nogeensBtn" disabled>Nog eens (' + (MAX - 1) + ' over)</button></div>' +
          (kan ? '' : '<p class="geen">Deze browser kan niet voorlezen. Op een telefoon of in een andere browser werkt het meestal wel. Noodoplossing: laat de tekst twee seconden zien.</p><div class="knoppen"><button type="button" class="stil" id="flitsBtn">Laat het 2 seconden zien</button></div>') +
          '<p class="flits" id="flits" aria-live="polite"></p>' +
          '<input id="luisterInvoer" type="text" autocomplete="off" autocapitalize="' + (o.exact ? 'sentences' : 'off') + '" spellcheck="false" aria-label="Typ wat je hoort" placeholder="' + (o.gat ? 'het woord' : 'typ hier') + '">' +
          '<div class="verschil" id="verschil"></div></div>';
        var vak = el.querySelector('#luistervak'), inv = el.querySelector('#luisterInvoer'), lb = el.querySelector('#luisterBtn'), nb = el.querySelector('#nogeensBtn'), fl = el.querySelector('#flits');
        function lees(){
          if (!api.bezig()) return;
          keren++;
          if (kan){
            vak.classList.add('praat');
            VOORLEES.spreek({ v: o.spreek, taal: o.taal || 'nl-NL' });
            /* de golfjes stoppen als de stem stopt; de stem meldt dat niet aan ons, dus na een schatting van de duur */
            setTimeout(function(){ vak.classList.remove('praat'); }, Math.min(9000, 700 + o.spreek.length * 70));
          }
          lb.disabled = true; nb.disabled = keren >= MAX;
          nb.textContent = 'Nog eens' + (keren >= MAX ? '' : ' (' + (MAX - keren) + ' over)');
          inv.focus();
        }
        lb.addEventListener('click', lees); nb.addEventListener('click', lees);
        var fb = el.querySelector('#flitsBtn');
        if (fb) fb.addEventListener('click', function(){ if (!api.bezig()) return; fl.textContent = o.spreek; fb.disabled = true; setTimeout(function(){ fl.textContent = ''; fb.disabled = keren >= MAX; keren++; inv.focus(); }, 2000); });
        var knop = api.knop('Nakijken', function(){ kijkNa(); });
        inv.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); kijkNa(); } });
        function kijkNa(){
          if (!api.bezig()) return;
          if (!inv.value.trim()){ api.uit('Typ eerst wat je hoort.'); inv.focus(); return; }
          var w = inv.value, ok = goedLijst.some(function(g){ return norm(g, o.exact) === norm(w, o.exact); });
          inv.disabled = true; inv.classList.add(ok ? 'goed' : 'fout'); knop.disabled = true; lb.disabled = true; nb.disabled = true;
          if (window.VOORLEES) VOORLEES.stop(); vak.classList.remove('praat');
          if (!ok) el.querySelector('#verschil').innerHTML = verschil(w.trim(), goedLijst[0]) + '<small>doorgestreept: te veel of anders; groen: zo hoort het</small>';
          api.klaar(ok, ok ? '' : 'Goed is: <b>' + schoon(goedLijst[0]) + '</b>');
        }
        el.proef = function(){ inv.value = goedLijst[0]; kijkNa(); };
        el.proefFout = function(){ inv.value = 'xq' + goedLijst[0] + 'z'; kijkNa(); };
        /* meteen voorlezen als het kan: dat scheelt een klik per woord */
        setTimeout(function(){ if (kan && api.bezig()) lees(); else inv.focus(); }, 250);
      }
    };
  }
  return { opgave: opgave, norm: norm, verschil: verschil };
})();
