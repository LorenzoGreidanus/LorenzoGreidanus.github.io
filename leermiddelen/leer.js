/* Leer de trucjes: een uitlegstand voor de oefenspellen.

   Wie een regel of een trucje snapt, hoeft minder te stampen en kan zichzelf
   redden als hij iets vergeet. Per trucje: de uitleg met een voorbeeld, dan
   vier sommen met de stappen erbij, dan vier zonder (met een knop als je
   vastloopt), en daarna meteen het spel. Zo gaat het van voordoen naar zelf
   doen, de manier waarop een docent het aan het bord ook doet.

     LEER.open({
       titel:'Rekentrucjes', hand:'minder rekenen, meer snappen',
       intro:'een alinea over wat je gaat leren',
       lessen:[{ kop, kort, uit, voorbeeld,                 uitleg in tekst, voorbeeld als regels
                 maak:function(){ return { vraag, stappen:[...], slot:'45 + 18 =', antwoord:['63'], invoer:'getal'|'tekst' }; } }],
       verberg:[elementen die weg moeten], terug, klaar:function(){ naar het spel }, klaarTekst:'Nu de race'
     })
   stappen zijn de tussenstappen; slot is de laatste stap zonder antwoord. Bij
   "met hulp" staan de stappen er, en het slot met een vraagteken. */
window.LEER = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function norm(t){ return String(t == null ? '' : t).toLowerCase().replace(/\s+/g, ' ').replace(/\./g, ',').replace(/^\s+|\s+$/g, '').replace(/^(\d+),0+$/, '$1').replace(/(,\d*?)0+$/, '$1').replace(/,$/, ''); }
  var stijl = false;
  /* een regel voor de donkere stand: met de themaknop en met de instelling van het apparaat */
  function donker(sel, decl){
    var a = sel.split(',').map(function(x){ return ':root[data-theme="dark"] ' + x; }).join(','),
        b = sel.split(',').map(function(x){ return ':root:not([data-theme="light"]) ' + x; }).join(',');
    return a + '{' + decl + '}\n@media(prefers-color-scheme:dark){' + b + '{' + decl + '}}';
  }
  function zetStijl(){
    if (stijl) return; stijl = true;
    var s = document.createElement('style');
    s.textContent = [
      '.lr{max-width:760px;margin:0 auto;padding:28px 0 60px}',
      '.lr h1{font-size:clamp(2rem,6vw,2.6rem)}',
      '.lr-kaart{background:var(--kaart,#fff);border:2px solid rgba(20,34,76,.10);border-radius:22px;padding:clamp(16px,3vw,26px);margin-top:16px}',
      ':root[data-theme="dark"] .lr-kaart{border-color:rgba(243,239,233,.12)}',
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .lr-kaart{border-color:rgba(243,239,233,.12)}}',
      '.lr h2{font-size:clamp(1.5rem,4vw,2.1rem)}',
      '.lr-kort{font-size:1.15rem;font-weight:600;color:var(--ocean,#204ECF);margin-top:4px}',
      ':root[data-theme="dark"] .lr-kort{color:var(--vista,#83A5F2)}',
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .lr-kort{color:var(--vista,#83A5F2)}}',
      '.lr-uit{margin-top:10px}',
      '.lr-vb{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:6px}',
      '.lr-vb li{background:rgba(131,165,242,.16);border-radius:10px;padding:8px 12px;font-variant-numeric:tabular-nums}',
      '.lr-vb li b{color:#B8432A}', donker('.lr-vb li b', 'color:#f4a28c'),
      '.lr-som{font-size:clamp(1.5rem,5.5vw,2.6rem);font-weight:700;text-align:center;margin-top:8px;font-variant-numeric:tabular-nums;line-height:1.25}',
      '.lr-hulp{list-style:none;padding:0;margin:12px auto 0;max-width:420px;display:grid;gap:6px}',
      '.lr-hulp li{background:rgba(131,165,242,.16);border-radius:10px;padding:7px 12px;font-variant-numeric:tabular-nums}',
      '.lr-hulp li.vraag{background:rgba(242,103,73,.14);font-weight:600}',
      donker('.lr-hulp li.vraag', 'background:rgba(242,103,73,.28)'),
      /* invoer en Kijk na naast elkaar, ook op een telefoon */
      '.lr-invoer{display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:16px}',
      '.lr-invoer .btn{margin-top:0}',
      '.lr-invoer input{flex:1 1 140px;max-width:220px;min-width:0;min-height:54px;text-align:center;font:700 1.4rem Poppins,system-ui,sans-serif;border-radius:14px;border:2px solid rgba(20,34,76,.2);background:var(--kaart,#fff);color:var(--ink,#14224C)}',
      donker('.lr-invoer input', 'border-color:rgba(243,239,233,.32)'),
      '.lr-invoer input:disabled{opacity:1;color:var(--ink,#14224C)}',
      '.lr-invoer input:focus{outline:3px solid var(--focusring,#B4701A);outline-offset:2px}',
      '.lr-terug{text-align:center;margin-top:12px;min-height:1.6em;font-weight:600}',
      '.lr-terug.goed{color:var(--op,#2f7d52)} .lr-terug.fout{color:var(--neer,#c0442c)}',
      donker('.lr-terug.goed', 'color:#5fbf88'), donker('.lr-terug.fout', 'color:#f4a28c'),
      '.lr-voort{display:flex;gap:6px;justify-content:center;margin-top:16px}',
      '.lr-voort i{width:12px;height:12px;border-radius:50%;border:2px solid var(--muted,#5b6480)}',
      '.lr-voort i.goed{background:var(--op,#2f7d52);border-color:var(--op,#2f7d52)} .lr-voort i.fout{background:var(--neer,#c0442c);border-color:var(--neer,#c0442c)}',
      '.lr-knoppen{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin-top:18px}',
      '.lr-knoppen .btn{margin-top:0}',
      '.lr-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
      '.lr-chips span{border-radius:999px;padding:4px 11px;font-size:.84rem;background:rgba(20,34,76,.07)}',
      ':root[data-theme="dark"] .lr-chips span{background:rgba(243,239,233,.10)}',
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .lr-chips span{background:rgba(243,239,233,.10)}}',
      '.lr-chips span.klaar{background:var(--goed-bg,#e7f3ec);font-weight:600}',
      '.lr-chips span.nu{outline:2px solid var(--crab,#F26749)}',
      '.lr-verder{display:block;margin:12px auto 6px}',
      '.lr-uitslag{margin-top:16px}',
      '.lr-uitslag li{display:flex;justify-content:space-between;align-items:baseline;gap:4px 14px;flex-wrap:wrap}',
      '.lr .lr-vb.lr-uitslag li b{color:var(--ink,#14224C)}',
      '.lr-uitslag li span{white-space:nowrap;color:var(--muted,#5b6480);font-size:.92rem}',
      /* een som onder elkaar: cijfers in vaste kolommen, de onthouden cijfers klein erboven */
      '.lr-beeld{display:flex;justify-content:center;margin-top:12px}',
      '.lr-cijfer{border-collapse:collapse;font:600 1.5rem/1.15 ui-monospace,Consolas,monospace;font-variant-numeric:tabular-nums}',
      '.lr-cijfer td{width:1.15em;text-align:center;padding:1px 0}',
      '.lr-cijfer tr.onth td{font-size:.85rem;color:#B8432A;height:1.1em}', donker('.lr-cijfer tr.onth td', 'color:#f4a28c'),
      '.lr-cijfer tr.streep td{border-top:3px solid currentColor;padding-top:3px}',
      '.lr-cijfer td.teken{color:var(--muted,#5b6480)}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function klein(t){ t = String(t || ''); return t.charAt(0).toLowerCase() + t.slice(1); }
  var vak = null, o = {}, nr = 0, sommen = [], sNr = 0, uitslag = [];
  function el(id){ return document.getElementById(id); }
  function open(opts){
    zetStijl();
    o = opts || {};
    (o.verberg || []).forEach(function(x){ if (x) x.classList.add('hide'); });
    if (!vak){
      vak = document.createElement('section'); vak.className = 'wrap lr'; vak.id = 'scherm-leer';
      var na = o.na || el('scherm-start'); na.parentNode.insertBefore(vak, na.nextSibling);
    }
    vak.classList.remove('hide');
    nr = 0; uitslag = [];
    intro();
  }
  function sluit(){
    if (vak) vak.classList.add('hide');
    (o.verberg || []).forEach(function(x){ if (x) x.classList.remove('hide'); });
    scrollTo({ top:0, behavior:'auto' });
  }
  function chips(){ return '<div class="lr-chips">' + o.lessen.map(function(l, i){ return '<span class="' + (i < nr ? 'klaar' : i === nr ? 'nu' : '') + '">' + schoon(l.kop) + '</span>'; }).join('') + '</div>'; }
  function intro(){
    vak.innerHTML = '<p class="hand" style="font-size:1.5rem">' + schoon(o.hand || 'eerst snappen, dan oefenen') + '</p><h1>' + schoon(o.titel || 'Leer de trucjes') + '</h1>' +
      '<div class="lr-kaart"><p class="lr-uit">' + schoon(o.intro || '') + '</p>' +
      '<p class="lr-uit">Per trucje lees je eerst hoe het werkt, dan oefen je vier keer met de stappen erbij en vier keer zonder. Je leert:</p>' +
      '<ul class="lr-vb">' + o.lessen.map(function(l){ return '<li><b>' + schoon(l.kop) + '</b>: ' + schoon(klein(l.kort)) + '</li>'; }).join('') + '</ul>' +
      '<div class="lr-knoppen"><button class="btn" type="button" id="lrStart">Begin</button><button class="linkbtn" type="button" id="lrTerug">Terug</button></div></div>';
    el('lrStart').addEventListener('click', uitleg);
    el('lrTerug').addEventListener('click', sluit);
    el('lrStart').focus({ preventScroll:true });
    scrollTo({ top:0, behavior:'auto' });
  }
  function uitleg(){
    var l = o.lessen[nr];
    vak.innerHTML = chips() + '<div class="lr-kaart"><p class="eyebrow">het trucje</p><h2>' + schoon(l.kop) + '</h2>' +
      '<p class="lr-kort">' + schoon(l.kort) + '</p><p class="lr-uit">' + schoon(l.uit) + '</p>' +
      (l.beeld ? '<div class="lr-beeld">' + l.beeld + '</div>' : '') + (l.voorbeeld ? '<ul class="lr-vb">' + l.voorbeeld.map(function(v){ return '<li>' + schoon(v) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="lr-knoppen"><button class="btn" type="button" id="lrOefen">Oefen met hulp</button><button class="linkbtn" type="button" id="lrTerug">Stoppen</button></div></div>';
    el('lrOefen').addEventListener('click', function(){ maakSommen(l); sNr = 0; som(); });
    el('lrTerug').addEventListener('click', sluit);
    el('lrOefen').focus({ preventScroll:true });
    scrollTo({ top:0, behavior:'auto' });
  }
  function maakSommen(l){
    sommen = []; var gezien = {};
    for (var p = 0; sommen.length < 8 && p < 60; p++){ var s = l.maak(); if (gezien[s.vraag]) continue; gezien[s.vraag] = 1; s.goed = null; sommen.push(s); }
    while (sommen.length < 8){ var x = l.maak(); x.goed = null; sommen.push(x); }
  }
  function som(){
    var s = sommen[sNr], metHulp = sNr < 4;
    vak.innerHTML = chips() + '<div class="lr-kaart"><p class="eyebrow">' + (metHulp ? 'met hulp' : 'nu zelf') + ' · ' + (sNr + 1) + ' van 8</p>' +
      '<div class="lr-som">' + schoon(s.vraag) + '</div>' +
      (s.beeld ? '<div class="lr-beeld' + (metHulp ? '' : ' hide') + '" id="lrBeeld">' + s.beeld + '</div>' : '') +
      '<ul class="lr-hulp' + (metHulp ? '' : ' hide') + '" id="lrHulp">' + s.stappen.map(function(x){ return '<li>' + schoon(x) + '</li>'; }).join('') +
        '<li class="vraag" id="lrSlot">' + schoon(s.slot) + '&nbsp;?</li></ul>' +
      '<div class="lr-invoer"><input id="lrIn" type="text" inputmode="' + (s.invoer === 'getal' ? 'decimal' : 'text') + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Jouw antwoord"><button class="btn" type="button" id="lrCheck">Kijk na</button></div>' +
      '<p class="lr-terug" id="lrTerugk" role="status" aria-live="polite"></p>' +
      '<div class="lr-voort" aria-hidden="true">' + sommen.map(function(x){ return '<i class="' + (x.goed === true ? 'goed' : x.goed === false ? 'fout' : '') + '"></i>'; }).join('') + '</div>' +
      (metHulp ? '' : '<div class="lr-knoppen"><button class="linkbtn" type="button" id="lrToon">Ik zit vast: laat de stappen zien</button></div>') + '</div>';
    var inp = el('lrIn'), af = false;
    function kijk(){
      if (af || !inp.value.trim()) return;
      af = true; inp.disabled = true; el('lrCheck').disabled = true;
      var ok = s.antwoord.some(function(a){ return norm(a) === norm(inp.value); });
      s.goed = ok;
      var tk = el('lrTerugk');
      tk.className = 'lr-terug ' + (ok ? 'goed' : 'fout');
      tk.textContent = ok ? 'Goed!' : 'Niet goed, het is ' + s.antwoord[0] + '. Kijk hierboven hoe het gaat.';
      el('lrHulp').classList.remove('hide');
      var bl = el('lrBeeld'); if (bl){ bl.classList.remove('hide'); if (s.beeldNa) bl.innerHTML = s.beeldNa; }
      el('lrSlot').textContent = s.slot + ' ' + s.antwoord[0];
      var vast = el('lrToon'); if (vast) vast.classList.add('hide');
      var verder = document.createElement('button');
      verder.className = 'btn lr-verder'; verder.type = 'button'; verder.id = 'lrVerder';
      verder.textContent = sNr < 7 ? 'Volgende' : 'Klaar met dit trucje';
      verder.addEventListener('click', function(){ sNr++; if (sNr < 8) som(); else lesKlaar(); });
      tk.parentNode.insertBefore(verder, tk.nextSibling);
      verder.focus({ preventScroll:true });
    }
    el('lrCheck').addEventListener('click', kijk);
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); kijk(); } });
    var toon = el('lrToon'); if (toon) toon.addEventListener('click', function(){ el('lrHulp').classList.remove('hide'); var bl = el('lrBeeld'); if (bl) bl.classList.remove('hide'); toon.classList.add('hide'); });
    setTimeout(function(){ try { inp.focus({ preventScroll:true }); } catch (e){} }, 30);
  }
  function lesKlaar(){
    var l = o.lessen[nr], zelf = sommen.slice(4).filter(function(x){ return x.goed; }).length;
    uitslag.push({ kop:l.kop, zelf:zelf });
    nr++;
    var laatste = nr >= o.lessen.length;
    vak.innerHTML = chips() + '<div class="lr-kaart"><p class="eyebrow">' + schoon(l.kop) + '</p>' +
      '<h2>' + (zelf === 4 ? 'Dat zit erin' : zelf >= 3 ? 'Bijna' : 'Nog even oefenen') + '</h2>' +
      '<p class="lr-uit">Zonder hulp had je er ' + zelf + ' van de 4 goed. ' + (zelf === 4 ? 'Het trucje werkt.' : 'Het trucje nog eens: ' + schoon(klein(l.kort)) + '.') + '</p>' +
      /* aan het eind: per trucje hoeveel je zonder hulp goed had, als lijstje */
      (laatste && uitslag.length > 1 ? '<ul class="lr-vb lr-uitslag">' + uitslag.map(function(u){ return '<li><b>' + schoon(u.kop) + '</b><span>' + u.zelf + ' van 4 zelf goed</span></li>'; }).join('') + '</ul>' : '') +
      '<div class="lr-knoppen">' + (zelf < 4 ? '<button class="btn ghost" type="button" id="lrNog">Dit trucje nog een keer</button>' : '') +
      (laatste ? (o.klaar ? '<button class="btn" type="button" id="lrSpel">' + schoon(o.klaarTekst || 'Nu het spel') + '</button>' : '') : '<button class="btn" type="button" id="lrVolg">Volgende: ' + schoon(o.lessen[nr].kop.split(':')[0].toLowerCase()) + '</button>') +
      '<button class="linkbtn" type="button" id="lrTerug">' + (laatste ? 'Terug' : 'Stoppen') + '</button></div></div>';
    var nog = el('lrNog'); if (nog) nog.addEventListener('click', function(){ nr--; uitslag.pop(); uitleg(); });
    var volg = el('lrVolg'); if (volg) volg.addEventListener('click', uitleg);
    var spel = el('lrSpel'); if (spel) spel.addEventListener('click', function(){ sluit(); o.klaar(); });
    el('lrTerug').addEventListener('click', sluit);
    (volg || spel || el('lrTerug')).focus({ preventScroll:true });
  }
  return { open:open };
})();
