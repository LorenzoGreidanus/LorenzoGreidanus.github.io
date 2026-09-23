/* Uitleg stap voor stap: een venster dat een onderwerp in kleine stappen
   uitlegt, met bij elke stap een plaatje dat meebeweegt. Het DHTE-schema
   vult zich kolom voor kolom, een taart krijgt zijn stukken, een weegschaal
   raakt zijn blokjes kwijt.

   spel.js laadt dit bestand pas als iemand op "Stap voor stap" tikt, en
   daarna uitleg/<spel>.js met de inhoud. Dat bestand zegt:

     STAPPEN.les('dhte', function(){ return [les, les, ...]; });

   les:  { naam, uitleg, stappen: [stap, ...] }
         stappen mag ook een functie zijn: dan maakt hij bij elke keer een
         nieuw voorbeeld, en staat er aan het eind "Nog een voorbeeld".
   stap: { kop, tekst, beeld }   tekst en beeld zijn html, van ons zelf.

   De tekenhulpjes (schema, taart, strook, rij, weeg, formule, bak) maken
   dat html, zodat een uitlegbestand alleen hoeft te zeggen wat er te zien is. */
window.STAPPEN = (function(){
  'use strict';
  var REG = {};
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  /* ---------- de opmaak, een keer in de pagina ---------- */
  var CSS =
    '.st-achter{--st-na:#204ECF;--st-kaart:#fff;--st-kaart2:#f4efe8;--st-ink:#14224C;--st-muted:#5b6480;--st-rand:rgba(20,34,76,.10);--st-rand2:rgba(20,34,76,.18);--st-goed:#1f6b41;--st-goed-bg:#e7f3ec;--st-fout:#a8371f;--st-fout-bg:#fdecea;--st-hand:#D9522F;color:var(--st-ink);position:fixed;inset:0;z-index:200;background:rgba(10,16,38,.55);display:grid;place-items:center;padding:16px;animation:st-in .18s ease}' +
    '@keyframes st-in{from{opacity:0}to{opacity:1}}' +
    '.st-venster{position:relative;width:min(720px,100%);max-height:calc(100dvh - 32px);display:flex;flex-direction:column;background:var(--st-kaart);color:var(--st-ink);' +
      'border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden;text-align:left;font-size:1rem;line-height:1.5}' +
    '.st-kop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 12px;border-bottom:1px solid var(--st-rand)}' +
    '.st-kop p{margin:0;font-size:.7rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--st-muted)}' +
    '.st-kop h2{margin:2px 0 0;font-size:1.25rem;line-height:1.2}' +
    '.st-dicht{flex:none;width:44px;height:44px;border-radius:999px;border:1.5px solid var(--st-rand2);background:transparent;color:inherit;font-size:1.3rem;line-height:1;display:grid;place-items:center;cursor:pointer}' +
    '.st-lijf{flex:1;overflow:auto;padding:18px 20px;-webkit-overflow-scrolling:touch}' +
    '.st-lessen{display:grid;gap:10px}' +
    '.st-les{display:grid;gap:2px;text-align:left;width:100%;background:var(--st-kaart2);border:2px solid transparent;border-radius:16px;padding:14px 16px;color:inherit;font:inherit;cursor:pointer;min-height:44px}' +
    '.st-les:hover,.st-les:focus-visible{border-color:var(--st-na)}' +
    '.st-les b{font-size:1rem}.st-les span{font-size:.88rem;color:var(--st-muted)}' +
    '.st-beeld{display:grid;place-items:center;min-height:120px;background:var(--st-kaart2);border-radius:18px;padding:16px 12px;margin-bottom:16px;overflow-x:auto}' +
    '.st-beeld:empty{display:none}' +
    '.st-stap h3{margin:0 0 6px;font-size:1.12rem;line-height:1.25}' +
    '.st-tekst{font-size:.98rem}.st-tekst p{margin:0 0 8px}.st-tekst p:last-child{margin:0}' +
    '.st-tekst b,.st-tekst strong{font-weight:600}' +
    '.st-voet{display:flex;align-items:center;gap:10px;padding:12px 20px 16px;border-top:1px solid var(--st-rand);flex-wrap:wrap}' +
    '.st-teller{flex:1;min-width:90px;font-size:.84rem;color:var(--st-muted)}' +
    '.st-punten{display:flex;gap:5px;margin-top:4px}.st-punten i{width:8px;height:8px;border-radius:50%;background:var(--st-rand2)}.st-punten i.on{background:var(--st-na)}' +
    '.st-knop{border:none;border-radius:14px;padding:11px 18px;font:inherit;font-weight:600;min-height:44px;cursor:pointer;background:var(--st-na);color:#fff}' +
    ':root[data-theme="dark"] .st-achter{--st-na:#83A5F2;--st-kaart:#182652;--st-kaart2:#22336a;--st-ink:#F3EFE9;--st-muted:#B3BBD0;--st-rand:rgba(243,239,233,.12);--st-rand2:rgba(243,239,233,.26);--st-goed:#8fd8ac;--st-goed-bg:#1f3a2c;--st-fout:#f0a090;--st-fout-bg:#3a1f1b;--st-hand:#F26749;}:root[data-theme="dark"] .st-knop:not(.stil){color:#14224C}' +
    '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .st-achter{--st-na:#83A5F2;--st-kaart:#182652;--st-kaart2:#22336a;--st-ink:#F3EFE9;--st-muted:#B3BBD0;--st-rand:rgba(243,239,233,.12);--st-rand2:rgba(243,239,233,.26);--st-goed:#8fd8ac;--st-goed-bg:#1f3a2c;--st-fout:#f0a090;--st-fout-bg:#3a1f1b;--st-hand:#F26749;}:root:not([data-theme="light"]) .st-knop:not(.stil){color:#14224C}}' +
    '.st-knop.stil{background:transparent;color:inherit;border:1.5px solid var(--st-rand2)}' +
    '.st-knop:disabled{opacity:.4;cursor:default}' +
    '@media(max-width:560px){.st-achter{padding:0;place-items:stretch}.st-venster{max-height:100dvh;height:100dvh;border-radius:0}.st-kop,.st-lijf,.st-voet{padding-left:16px;padding-right:16px}}' +
    '@media(prefers-reduced-motion:reduce){.st-achter{animation:none}.st-schema .st-nieuw{animation:none}}' +
    /* het schema */
    '.st-schema{display:grid;grid-template-columns:auto repeat(var(--n,4),minmax(40px,52px));gap:5px;align-items:center;font-variant-numeric:tabular-nums}' +
    '.st-schema .st-kk{text-align:center;border-radius:10px;background:var(--st-kaart);border:1px solid var(--st-rand);padding:4px 2px;line-height:1.1}' +
    '.st-schema .st-kk b{display:block;font-size:1rem}.st-schema .st-kk small{display:block;font-size:.62rem;color:var(--st-muted)}' +
    '.st-schema .st-rk{font-size:.74rem;font-weight:600;color:var(--st-muted);text-align:right;padding-right:6px}' +
    '.st-schema .st-rk.st-t{font-size:1.3rem;color:inherit}' +
    '.st-schema .st-c{height:46px;display:grid;place-items:center;border-radius:12px;background:var(--st-kaart);font-size:1.35rem;font-weight:600;border:2px solid transparent}' +
    '.st-schema .st-c.st-h{height:34px;font-size:1rem;background:transparent;border:2px dashed var(--st-rand2);color:var(--st-hand)}' +
    '.st-schema .st-c.st-leeg{background:transparent;border-color:transparent}' +
    '.st-schema .st-c.st-a{border:2px dashed var(--st-rand2);background:transparent}' +
    '.st-schema .st-c.st-vol{border-style:solid;border-color:var(--st-goed);background:var(--st-goed-bg);color:var(--st-goed)}' +
    '.st-schema .st-c.st-oud{text-decoration:line-through;color:var(--st-muted)}' +
    '.st-schema .st-licht{box-shadow:0 0 0 3px var(--st-na)}' +
    '.st-schema .st-nieuw{animation:st-pop .45s cubic-bezier(.34,1.56,.64,1)}' +
    '@keyframes st-pop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}' +
    '.st-schema .st-streep{grid-column:1/-1;border-top:3px solid currentColor;margin:2px 0}' +
    /* een rij met plaatjes en tekens */
    '.st-rij{display:flex;align-items:center;justify-content:center;gap:10px 14px;flex-wrap:wrap}' +
    '.st-rij .st-tk{font-size:1.6rem;font-weight:600}' +
    '.st-rij figure{margin:0;display:grid;justify-items:center;gap:4px}.st-rij figcaption{font-size:.9rem;font-weight:600}' +
    '.st-formule{font-size:clamp(1.2rem,4vw,1.6rem);font-weight:600;text-align:center;line-height:1.5}' +
    '.st-formule .st-na{color:var(--st-na)}' +
    '.st-formule .st-zacht{color:var(--st-muted);font-weight:500}' +
    '.st-bak{border-radius:14px;padding:10px 14px;margin-top:10px;font-size:.92rem;background:var(--st-kaart2)}' +
    '.st-bak.st-goed{background:var(--st-goed-bg);color:var(--st-goed)}' +
    '.st-bak.st-let{background:var(--st-fout-bg);color:var(--st-fout)}' +
    '.st-tabel{border-collapse:collapse;font-size:.95rem;margin:0 auto}' +
    '.st-tabel th,.st-tabel td{border:1px solid var(--st-rand2);padding:6px 10px;text-align:left}' +
    '.st-tabel th{font-weight:600;background:var(--st-kaart)}' +
    '.st-tabel .st-na{color:var(--st-na);font-weight:600}' +
    '.st-weeg{display:grid;gap:6px;justify-items:center;width:100%}' +
    '.st-weeg .st-schalen{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:10px;width:min(520px,100%)}' +
    '.st-weeg .st-schaal{min-height:64px;border-bottom:4px solid currentColor;border-radius:0 0 10px 10px;display:flex;flex-wrap:wrap;align-content:flex-end;justify-content:center;gap:5px;padding:6px}' +
    '.st-weeg .st-is{font-size:1.5rem;font-weight:700;padding-bottom:10px}' +
    '.st-weeg .st-zak{width:34px;height:40px;border-radius:10px 10px 14px 14px;background:#204ECF;color:#fff;display:grid;place-items:center;font-weight:700;font-size:.95rem}' +
    '.st-weeg .st-blok{width:24px;height:24px;border-radius:6px;background:#EA9836;color:#14224C;display:grid;place-items:center;font-weight:700;font-size:.8rem}' +
    '.st-weeg .st-blok.st-min{background:#F26749;color:#fff}' +
    '.st-weeg .st-weg{opacity:.25;outline:2px dashed currentColor;outline-offset:2px}' +
    '.st-weeg .st-poot{width:14px;height:36px;background:currentColor;border-radius:4px;margin-top:-4px}';
  function zetCss(){
    if (document.getElementById('st-css')) return;
    var s = document.createElement('style'); s.id = 'st-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- tekenhulpjes ---------- */
  var LETTERS = ['E', 'T', 'H', 'D', 'TD'], WOORD = ['eenheden', 'tientallen', 'honderdtallen', 'duizendtallen', 'tienduizendtallen'];
  /* o: n (aantal kolommen), boven/onder (cijfers van links), teken ('+' of '−'),
     hulp {naam, cijfers:[... of null]}, doorgestreept [kolommen in boven],
     antwoord [... of null], licht (kolom), nieuw {rij:'hulp'|'antwoord'|'boven', kol} */
  function schema(o){
    var n = o.n, h = '<div class="st-schema" style="--n:' + n + '"><div></div>';
    function cls(rij, k, basis){
      var c = basis;
      if (o.licht === k) c += ' st-licht';
      if (o.nieuw && o.nieuw.rij === rij && o.nieuw.kol === k) c += ' st-nieuw';
      return c;
    }
    for (var k = 0; k < n; k++){ var p = n - 1 - k; h += '<div class="st-kk"><b>' + LETTERS[p] + '</b><small>' + WOORD[p].replace('tallen', '&shy;tallen') + '</small></div>'; }
    if (o.hulp){
      h += '<div class="st-rk">' + schoon(o.hulp.naam) + '</div>';
      for (var i = 0; i < n; i++){
        var v = o.hulp.cijfers[i];
        h += i === n - 1 ? '<div class="st-c st-leeg"></div>' : '<div class="' + cls('hulp', i, 'st-c st-h') + '">' + (v == null ? '' : v) + '</div>';
      }
    }
    if (o.getal != null){
      h += '<div class="st-rk">zet hier</div>';
      var cg = String(o.getal).padStart(n, ' ').split('');
      for (var g = 0; g < n; g++){ var t = o.vulGetal && o.vulGetal[g] ? cg[g] : ''; h += '<div class="' + cls('antwoord', g, 'st-c st-a' + (t ? ' st-vol' : '')) + '">' + t + '</div>'; }
    }
    if (o.boven){
      h += '<div class="st-rk"></div>';
      for (var b = 0; b < n; b++){
        var weg = o.doorgestreept && o.doorgestreept.indexOf(b) >= 0;
        h += '<div class="' + cls('boven', b, 'st-c' + (weg ? ' st-oud' : '')) + '">' + (o.boven[b] == null ? '' : o.boven[b]) + '</div>';
      }
      h += '<div class="st-rk st-t">' + (o.teken || '+') + '</div>';
      for (var u = 0; u < n; u++) h += '<div class="st-c">' + (o.onder[u] == null ? '' : o.onder[u]) + '</div>';
      h += '<div class="st-streep"></div><div class="st-rk st-t">=</div>';
      for (var a = 0; a < n; a++){
        var w = o.antwoord ? o.antwoord[a] : null;
        h += '<div class="' + cls('antwoord', a, 'st-c st-a' + (w == null ? '' : ' st-vol')) + '">' + (w == null ? '' : w) + '</div>';
      }
    }
    return h + '</div>';
  }
  /* een taart in n stukken, vol daarvan gekleurd; heel: zoveel hele taarten ervoor */
  function taartSvg(n, vol, r, kleur){
    var cx = r + 3, cy = r + 3, uit = '';
    if (n === 1) uit = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (vol ? kleur : 'transparent') + '"/>';
    else for (var i = 0; i < n; i++){
      var a1 = -Math.PI / 2 + i * 2 * Math.PI / n, a2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / n;
      uit += '<path d="M' + cx + ' ' + cy + ' L' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) +
        ' A' + r + ' ' + r + ' 0 ' + (n < 2 ? 1 : 0) + ' 1 ' + (cx + r * Math.cos(a2)).toFixed(1) + ' ' + (cy + r * Math.sin(a2)).toFixed(1) + ' Z" fill="' + (i < vol ? kleur : 'transparent') + '"/>';
    }
    return '<svg viewBox="0 0 ' + (2 * r + 6) + ' ' + (2 * r + 6) + '" width="' + (2 * r + 6) + '" height="' + (2 * r + 6) + '" aria-hidden="true">' +
      '<g stroke="currentColor" stroke-width="2">' + uit + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke-width="2.5"/></g></svg>';
  }
  function taart(n, vol, o){
    o = o || {};
    var r = o.r || 46, kleur = o.kleur || '#EA9836', heel = o.heel || 0, uit = '';
    for (var i = 0; i < heel; i++) uit += taartSvg(1, 1, r, kleur);
    uit += taartSvg(n, vol, r, kleur);
    return '<figure>' + (heel ? '<span class="st-rij">' + uit + '</span>' : uit) + (o.onder ? '<figcaption>' + o.onder + '</figcaption>' : '') + '</figure>';
  }
  /* een strook in n vakjes, vol gekleurd; handig voor procenten en tienden */
  function strook(n, vol, o){
    o = o || {};
    var b = o.breed || 300, h = o.hoog || 36, w = b / n, uit = '';
    for (var i = 0; i < n; i++) uit += '<rect x="' + (2 + i * w).toFixed(1) + '" y="2" width="' + w.toFixed(1) + '" height="' + h + '" fill="' + (i < vol ? (o.kleur || '#EA9836') : 'transparent') + '"/>';
    return '<figure><svg viewBox="0 0 ' + (b + 4) + ' ' + (h + 4) + '" width="' + (b + 4) + '" height="' + (h + 4) + '" style="max-width:100%;height:auto" aria-hidden="true"><g stroke="currentColor" stroke-width="2">' + uit +
      '<rect x="2" y="2" width="' + b + '" height="' + h + '" fill="none" stroke-width="2.5"/></g></svg>' + (o.onder ? '<figcaption>' + o.onder + '</figcaption>' : '') + '</figure>';
  }
  /* stukken naast elkaar: plaatjes, tekst en tekens ('+', '=', '→') */
  function rij(delen){
    return '<div class="st-rij">' + delen.map(function(d){ return /^[+=−×:→<>≈]$/.test(d) ? '<span class="st-tk">' + d + '</span>' : d; }).join('') + '</div>';
  }
  function formule(html){ return '<div class="st-formule">' + html + '</div>'; }
  function bak(html, soort){ return '<div class="st-bak' + (soort ? ' st-' + soort : '') + '">' + html + '</div>'; }
  function tabel(koppen, rijen){
    return '<table class="st-tabel"><thead><tr>' + koppen.map(function(k){ return '<th>' + k + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rijen.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  /* de weegschaal van de balans: links en rechts een lijst van 'x', '1' en '-1';
     weg: zoveel van elk soort doorgestreept, als {x:1, een:2} per kant */
  function weeg(links, rechts, weg){
    weg = weg || {};
    function kant(l, w){
      w = w || {}; var nx = 0, n1 = 0, nm = 0;
      return l.map(function(d){
        if (d === 'x'){ nx++; return '<span class="st-zak' + (nx <= (w.x || 0) ? ' st-weg' : '') + '">x</span>'; }
        if (d === '-1'){ nm++; return '<span class="st-blok st-min' + (nm <= (w.min || 0) ? ' st-weg' : '') + '">−1</span>'; }
        n1++; return '<span class="st-blok' + (n1 <= (w.een || 0) ? ' st-weg' : '') + '">1</span>';
      }).join('');
    }
    return '<div class="st-weeg"><div class="st-schalen"><div class="st-schaal">' + kant(links, weg.links) + '</div><div class="st-is">=</div><div class="st-schaal">' + kant(rechts, weg.rechts) + '</div></div><div class="st-poot"></div></div>';
  }

  /* ---------- het venster ---------- */
  var venster = null, terugFocus = null;
  function dicht(){
    if (!venster) return;
    document.removeEventListener('keydown', toets, true);
    venster.parentNode.removeChild(venster); venster = null;
    document.documentElement.style.overflow = '';
    if (terugFocus && terugFocus.focus) try { terugFocus.focus(); } catch (e){}
  }
  var toetsDoe = null;
  function toets(e){
    if (!venster) return;
    if (e.key === 'Escape'){ e.preventDefault(); dicht(); return; }
    if (toetsDoe && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
      var t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      e.preventDefault(); toetsDoe(e.key === 'ArrowRight' ? 1 : -1);
    }
    /* de focus blijft in het venster */
    if (e.key === 'Tab'){
      var f = venster.querySelectorAll('button:not([disabled]),a[href]');
      if (!f.length) return;
      var eerste = f[0], laatste = f[f.length - 1];
      if (e.shiftKey && document.activeElement === eerste){ e.preventDefault(); laatste.focus(); }
      else if (!e.shiftKey && document.activeElement === laatste){ e.preventDefault(); eerste.focus(); }
    }
  }
  function bouw(titel){
    zetCss();
    /* staat het venster al open (van de kiezer naar een uitleg en terug), dan hetzelfde venster */
    if (venster){ venster.querySelector('#st-titel').textContent = titel; return venster; }
    terugFocus = document.activeElement;
    venster = document.createElement('div');
    venster.className = 'st-achter';
    venster.innerHTML = '<div class="st-venster" role="dialog" aria-modal="true" aria-labelledby="st-titel">' +
      '<div class="st-kop"><div><p>Uitleg stap voor stap</p><h2 id="st-titel"></h2></div><button type="button" class="st-dicht" aria-label="Uitleg sluiten">×</button></div>' +
      '<div class="st-lijf"></div><div class="st-voet"></div></div>';
    venster.querySelector('#st-titel').textContent = titel;
    venster.querySelector('.st-dicht').addEventListener('click', dicht);
    venster.addEventListener('click', function(e){ if (e.target === venster) dicht(); });
    document.body.appendChild(venster);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', toets, true);
    return venster;
  }
  function kiezer(titel, lessen){
    var v = bouw(titel), lijf = v.querySelector('.st-lijf'), voet = v.querySelector('.st-voet');
    toetsDoe = null;
    lijf.innerHTML = '<p style="margin:0 0 12px;color:var(--st-muted);font-size:.93rem">Kies wat je uitgelegd wilt krijgen. Je gaat er stap voor stap doorheen, in je eigen tempo.</p><div class="st-lessen">' +
      lessen.map(function(l, i){ return '<button type="button" class="st-les" data-i="' + i + '"><b>' + schoon(l.naam) + '</b>' + (l.uitleg ? '<span>' + schoon(l.uitleg) + '</span>' : '') + '</button>'; }).join('') + '</div>';
    voet.innerHTML = '<span class="st-teller"></span><button type="button" class="st-knop stil st-sluit">Sluiten</button>';
    voet.querySelector('.st-sluit').addEventListener('click', dicht);
    [].forEach.call(lijf.querySelectorAll('.st-les'), function(b){
      b.addEventListener('click', function(){ speel(titel, lessen, +b.getAttribute('data-i')); });
    });
    var eerste = lijf.querySelector('.st-les'); if (eerste) eerste.focus();
  }
  function speel(titel, lessen, li){
    var les = lessen[li];
    var stappen = typeof les.stappen === 'function' ? les.stappen() : les.stappen;
    var v = bouw(les.naam);
    var lijf = v.querySelector('.st-lijf'), voet = v.querySelector('.st-voet'), i = 0;
    var meer = lessen.length > 1;
    function teken(){
      var s = stappen[i];
      lijf.innerHTML = '<div class="st-stap" aria-live="polite"><div class="st-beeld">' + (s.beeld || '') + '</div><h3>' + (s.kop || '') + '</h3><div class="st-tekst">' + (s.tekst || '') + '</div></div>';
      lijf.scrollTop = 0;
      var laatst = i === stappen.length - 1;
      voet.innerHTML = '<div class="st-teller">Stap ' + (i + 1) + ' van ' + stappen.length +
        '<div class="st-punten" aria-hidden="true">' + stappen.map(function(x, j){ return '<i' + (j <= i ? ' class="on"' : '') + '></i>'; }).join('') + '</div></div>' +
        (i > 0 ? '<button type="button" class="st-knop stil st-terug">Vorige</button>' : (meer ? '<button type="button" class="st-knop stil st-kies">Andere uitleg</button>' : '')) +
        (!laatst ? '<button type="button" class="st-knop st-verder">Volgende</button>'
                 : (typeof les.stappen === 'function' ? '<button type="button" class="st-knop stil st-nog">Nog een voorbeeld</button>' : '') +
                   (meer ? '<button type="button" class="st-knop stil st-kies">Andere uitleg</button>' : '') +
                   '<button type="button" class="st-knop st-klaar">Klaar</button>');
      function op(sel, f){ var b = voet.querySelector(sel); if (b) b.addEventListener('click', f); }
      op('.st-terug', function(){ ga(-1); });
      op('.st-verder', function(){ ga(1); });
      op('.st-klaar', dicht);
      op('.st-kies', function(){ kiezer(titel, lessen); });
      op('.st-nog', function(){ speel(titel, lessen, li); });
      var f = voet.querySelector('.st-verder') || voet.querySelector('.st-klaar');
      if (f) f.focus();
    }
    function ga(d){ var j = i + d; if (j < 0 || j >= stappen.length) return; i = j; teken(); }
    toetsDoe = ga;
    teken();
  }

  /* ---------- naar buiten ---------- */
  function les(spel, maak){ REG[spel] = maak; }
  function open(spel, titel, welke){
    var maak = REG[spel];
    if (!maak) return false;
    var lessen = maak();
    if (!lessen || !lessen.length) return false;
    var t = titel || 'Uitleg';
    var i = -1;
    if (welke != null) lessen.forEach(function(l, j){ if (l.id === welke) i = j; });
    if (i >= 0) speel(t, lessen, i);
    else if (lessen.length === 1) speel(t, lessen, 0);
    else kiezer(t, lessen);
    return true;
  }
  return { les:les, open:open, dicht:dicht, heeft:function(s){ return !!REG[s]; },
           schema:schema, taart:taart, strook:strook, rij:rij, formule:formule, bak:bak, tabel:tabel, weeg:weeg, schoon:schoon };
})();
