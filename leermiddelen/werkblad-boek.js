/* Werkbladen uit het opdrachtenboek: kies paragrafen uit het boek van rekenen,
   Nederlands of wiskunde, en je krijgt per paragraaf een kop met het nummer,
   de uitleg met een voorbeeld en de opgaven, met figuren waar de leerroute ze
   tekent. Op het antwoordblad staat elk antwoord, met de stappen als uitleg.

   De indeling en de motor staan in opdrachtenboek.js; de opgaven zelf maakt de
   leerroute (leerroute.js en leerroute/<vak>-*.js). Allebei worden ze pas
   geladen als je dit werkblad kiest.

   De keuzes staan in het blok Onderdelen (#delen) als vinkjes en rondjes. Hun
   waarden gaan mee in de link (deel=): de id's van de paragrafen, volg-par of
   volg-mix, en uitleg. Het aantal opgaven per paragraaf is het gewone aantal
   van de pagina. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  var VAKKEN = { reken:'rekenen', ned:'nederlands', wis:'wiskunde' };
  var LETTERS = 'abcdef';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function plat(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ---------- laden: opdrachtenboek.js een keer ---------- */
  var laden = null;
  function laadBoek(){
    if (window.OPDRACHTENBOEK) return Promise.resolve();
    if (laden) return laden;
    laden = new Promise(function(klaar, mis){
      var s = document.createElement('script'); s.src = 'opdrachtenboek.js?v=1';
      s.onload = function(){ stijlBoek(); klaar(); };
      s.onerror = function(){ laden = null; mis(new Error('geen boek')); };
      document.head.appendChild(s);
    });
    return laden;
  }

  /* ---------- de stijl: de keuzes links, en het boek op papier ---------- */
  var IKOON = {
    zoek:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    pijl:'<svg class="ob-pijl" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'
  };
  try {
    var st = document.createElement('style');
    st.textContent =
      /* het keuzeblok */
      '.ob-kies{display:grid;gap:10px;min-width:0}' +
      '.ob-boven{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}' +
      '.ob-zoek{flex:1 1 220px;display:flex;align-items:center;gap:8px;border:1.5px solid var(--rand2);border-radius:12px;padding:0 12px;min-height:44px;background:var(--kaart)}' +
      '.ob-zoek:focus-within{border-color:var(--ocean)}' +
      '.ob-zoek svg{width:16px;height:16px;fill:none;stroke:var(--muted);stroke-width:2;flex:none}' +
      '.ob-zoek input{border:0;outline:0;background:none;flex:1;min-width:0;font-size:.92rem;min-height:40px}' +
      '.ob-tel{font-size:.85rem;color:var(--muted);font-variant-numeric:tabular-nums}' +
      '.ob-themas{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin;min-width:0}' +
      '.ob-themas button{flex:none;min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid var(--rand2);background:var(--kaart);font-size:.84rem;font-weight:600;white-space:nowrap}' +
      '.ob-themas button[aria-selected="true"]{background:var(--ink);border-color:var(--ink);color:var(--room)}' +
      '.ob-themas button .ob-aantal{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:6px;padding:0 5px;border-radius:999px;background:var(--keus);color:var(--kaart);font-size:.72rem}' +
      '.ob-themas button[aria-selected="true"] .ob-aantal{background:var(--room);color:var(--ink)}' +
      '.ob-aantal[hidden],.ob-thema[hidden],.ob-hfd[hidden],.ob-par[hidden],.ob-leeg[hidden]{display:none}' +
      '.ob-themakop{display:none;font-size:.7rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:8px 0 2px}' +
      '.ob-kies.zoekt .ob-themakop{display:block}.ob-kies.zoekt .ob-themas{display:none}' +
      '.ob-hfd{border-top:1px solid var(--rand)}' +
      '.ob-hfd summary{list-style:none;display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;min-height:44px;cursor:pointer;font-size:.9rem;font-weight:600}' +
      '.ob-hfd summary::-webkit-details-marker{display:none}' +
      '.ob-hfd summary > span{flex:1 1 auto;min-width:0;overflow-wrap:normal}' +
      '.ob-hfd summary small{margin-left:auto;font-size:.76rem;color:var(--muted);font-weight:500;white-space:nowrap}' +
      '.ob-hfd summary .ob-gek{color:var(--link);font-weight:600}' +
      '.ob-pijl{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;flex:none;transition:transform .15s var(--ease)}' +
      '.ob-hfd[open] .ob-pijl{transform:rotate(90deg)}' +
      '.ob-hfd .ob-lijst{display:grid;gap:2px;padding:0 0 8px}' +
      '.ob-par{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;align-items:center;min-height:42px;padding:2px 8px 2px 4px;border-radius:10px;font-size:.88rem;line-height:1.3;cursor:pointer}' +
      '.ob-par:hover{background:var(--kaart2)}' +
      '.ob-par:has(input:checked){background:var(--kies)}' +
      '.ob-par input{width:18px;height:18px;margin:0;accent-color:var(--ocean)}' +
      '.ob-par input:focus-visible{outline:3px solid var(--focusring,#B4701A);outline-offset:2px}' +
      '.ob-niv{font-size:.7rem;font-weight:600;color:var(--muted);background:var(--seg);border-radius:6px;padding:2px 6px;white-space:nowrap}' +
      '.ob-niv.ob-verd{margin-left:4px}' +
      '.ob-leeg{color:var(--muted);font-size:.88rem;padding:8px 0}' +
      '.ob-instel{display:grid;gap:8px;border-top:1px solid var(--rand);padding-top:12px}' +
      '.ob-seg label{flex:1 1 0;display:grid;place-items:center;min-height:40px;border-radius:9px;font-size:.86rem;font-weight:500;padding:0 8px;cursor:pointer;white-space:nowrap}' +
      '.ob-seg input{position:absolute;opacity:0;width:1px;height:1px;margin:0;pointer-events:none}' +
      '.ob-seg label:has(input:checked){background:var(--seg-aan);box-shadow:0 1px 3px rgba(20,34,76,.15);font-weight:600}' +
      '.ob-seg label:has(input:focus-visible){outline:3px solid var(--focusring,#B4701A);outline-offset:1px}' +
      /* het boek op papier */
      '.blad .ob-bovenkop{margin:0 0 2px;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#6a7290;font-weight:600}' +
      '.blad > ol > li.ob-kop{counter-increment:none;padding:18px 0 4px;border-bottom:0}' +
      '.blad > ol > li.ob-kop::before{display:none}' +
      '.blad > ol > li.ob-kop:first-child{padding-top:6px}' +
      '.blad .ob-parkop{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}' +
      '.blad .ob-nr{font-size:.78rem;font-weight:600;color:#fff;background:#204ECF;border-radius:6px;padding:2px 8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      '.blad .ob-parkop h3{margin:0;font-size:1.05rem;font-weight:600;letter-spacing:-.01em}' +
      '.blad .ob-parkop small{font-size:.75rem;color:#6a7290}' +
      '.blad .ob-uitleg{border:1.5px solid #c9d2e6;border-radius:10px;padding:10px 12px;margin:8px 0 2px;font-size:.88rem;line-height:1.5;break-inside:avoid}' +
      '.blad .ob-uitleg p{margin:0 0 6px}.blad .ob-uitleg p:last-child{margin-bottom:0}' +
      '.blad .ob-uitleg ul{margin:0;padding-left:18px}.blad .ob-uitleg li{margin:2px 0}' +
      '.blad .ob-uitleg .ob-regels{list-style:disc}' +
      '.blad .ob-vb{margin-top:8px;padding-top:8px;border-top:1px dashed #c9d2e6}' +
      '.blad .ob-vb > b{display:block;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:#6a7290;margin-bottom:2px}' +
      '.blad .ob-vb .lr-svg{max-width:280px;max-height:180px}' +
      '.blad .ob-vb ol{margin:6px 0 0;padding-left:20px}.blad .ob-vb ol li{margin:1px 0}.blad .ob-vb ol b{color:#204ECF}' +
      '.blad .ob-ant{margin-top:8px;font-size:.93rem}' +
      '.blad .ob-ant .lijn.kort{vertical-align:bottom;height:22px}' +
      '.blad .ob-wb .opdr{margin-top:6px}' +
      '.blad .ob-wb .lr-tekst{font-size:.92rem}' +
      '.blad .antw .ob-stappen{margin:4px 0 0;padding-left:20px;font-size:.84rem;line-height:1.45;color:#4a5270}' +
      '.blad .antw .ob-stappen b{color:#14224C}' +
      '@media print{.blad .ob-uitleg{break-inside:avoid}.blad > ol > li.ob-kop{break-after:avoid}}';
    document.head.appendChild(st);
  } catch (e){}
  var stijlGezet = false;
  function stijlBoek(){
    if (stijlGezet || !window.OPDRACHTENBOEK) return; stijlGezet = true;
    try { var s = document.createElement('style'); s.textContent = OPDRACHTENBOEK.STIJL; document.head.appendChild(s); } catch (e){}
  }

  /* ---------- het keuzeblok: zoeken, thema's, hoofdstukken met de paragrafen ---------- */
  function keuzeHtml(vak, aan){
    var B = OPDRACHTENBOEK, themas = B.boek(vak);
    var gekozen = {}, heeft = false;
    (aan || []).forEach(function(id){ if (B.paragraaf(vak, id)){ gekozen[id] = true; heeft = true; } });
    /* nog niets gekozen: de eerste paragraaf, zodat er meteen een blad staat */
    if (!heeft && themas.length) gekozen[themas[0].hoofdstukken[0].paragrafen[0].id] = true;
    var volg = (aan || []).indexOf('volg-mix') >= 0 ? 'mix' : 'par';
    var uitleg = (aan || []).some(function(x){ return /^volg-/.test(x); }) ? (aan || []).indexOf('uitleg') >= 0 : true;
    var actief = 0;
    themas.some(function(t, ti){ var ja = t.hoofdstukken.some(function(h){ return h.paragrafen.some(function(p){ return gekozen[p.id]; }); }); if (ja) actief = ti; return ja; });
    var n = Object.keys(gekozen).length;
    var h = '<div class="ob-kies" data-vak="' + vak + '">' +
      '<div class="ob-boven"><label class="ob-zoek">' + IKOON.zoek + '<input type="search" class="ob-zoekveld" placeholder="Zoek een onderwerp, bijv. lijdend voorwerp" aria-label="Zoek een onderwerp in het boek" autocomplete="off"></label>' +
      '<span class="ob-tel" aria-live="polite">' + telTekst(n) + '</span></div>' +
      '<div class="ob-themas" role="tablist" aria-label="Thema">' + themas.map(function(t, ti){
        var k = tel(t, gekozen);
        return '<button type="button" role="tab" data-thema="' + ti + '" aria-selected="' + (ti === actief) + '" tabindex="' + (ti === actief ? 0 : -1) + '">' + schoon(t.naam) + '<span class="ob-aantal"' + (k ? '' : ' hidden') + '>' + k + '</span></button>';
      }).join('') + '</div>';
    themas.forEach(function(t, ti){
      h += '<div class="ob-thema" role="tabpanel" data-thema="' + ti + '"' + (ti === actief ? '' : ' hidden') + '><p class="ob-themakop">' + schoon(t.naam) + '</p>';
      t.hoofdstukken.forEach(function(hf, hi){
        var k = hf.paragrafen.filter(function(p){ return gekozen[p.id]; }).length;
        h += '<details class="ob-hfd"' + (k || (ti === actief && hi === 0) ? ' open' : '') + '><summary>' + IKOON.pijl + '<span>' + (hi + 1) + ' · ' + schoon(hf.naam) + '</span>' +
          '<small>' + (k ? '<span class="ob-gek">' + k + ' gekozen</span> · ' : '') + hf.paragrafen.length + (hf.paragrafen.length === 1 ? ' paragraaf' : ' paragrafen') + '</small></summary><div class="ob-lijst">' +
          hf.paragrafen.map(function(p, pi){
            var verd = p.verdieping || hf.verdieping;
            return '<label class="ob-par"><input type="checkbox" value="' + schoon(p.id) + '"' + (gekozen[p.id] ? ' checked' : '') + '><span>' + (hi + 1) + '.' + (pi + 1) + ' ' + schoon(p.naam) + '</span>' +
              '<span><span class="ob-niv">' + schoon(p.niveau) + '</span>' + (verd ? '<span class="ob-niv ob-verd">verdieping</span>' : '') + '</span></label>';
          }).join('') + '</div></details>';
      });
      h += '</div>';
    });
    h += '<p class="ob-leeg" hidden>Niets gevonden. Zoek op een ander woord, zoals breuken, persoonsvorm of parabool.</p>' +
      '<div class="ob-instel"><span class="wm-lbl" id="obVolgLbl">Volgorde</span>' +
      '<div class="wm-seg ob-seg" role="radiogroup" aria-labelledby="obVolgLbl">' +
        '<label><input type="radio" name="obvolg" value="volg-par"' + (volg === 'par' ? ' checked' : '') + '><span>Per paragraaf</span></label>' +
        '<label><input type="radio" name="obvolg" value="volg-mix"' + (volg === 'mix' ? ' checked' : '') + '><span>Door elkaar</span></label></div>' +
      '<label class="vink"><input type="checkbox" name="obuitleg" value="uitleg"' + (uitleg ? ' checked' : '') + '> Uitleg en een voorbeeld boven elke paragraaf</label></div>';
    return h + '</div>';
  }
  function tel(t, gekozen){ return t.hoofdstukken.reduce(function(a, h){ return a + h.paragrafen.filter(function(p){ return gekozen[p.id]; }).length; }, 0); }
  function telTekst(n){ return n === 1 ? '1 paragraaf gekozen' : n + ' paragrafen gekozen'; }

  /* Wat er in het blok gebeurt zonder dat het blad opnieuw moet: een thema
     kiezen, zoeken, de tellers bijwerken. Het blok blijft staan, dus de kijker
     van de pagina (alleen de kinderen van #delen) merkt er niets van. */
  function bijwerken(el){
    var k = el.querySelector('.ob-kies'); if (!k) return;
    var gekozen = {};
    [].forEach.call(k.querySelectorAll('.ob-par input:checked'), function(i){ gekozen[i.value] = true; });
    k.querySelector('.ob-tel').textContent = telTekst(Object.keys(gekozen).length);
    [].forEach.call(k.querySelectorAll('.ob-thema'), function(paneel, ti){
      var n = paneel.querySelectorAll('.ob-par input:checked').length, b = k.querySelector('.ob-themas [data-thema="' + ti + '"] .ob-aantal');
      if (b){ b.textContent = n; b.hidden = !n; }
      [].forEach.call(paneel.querySelectorAll('.ob-hfd'), function(d){
        var m = d.querySelectorAll('.ob-par input:checked').length, tot = d.querySelectorAll('.ob-par').length, s = d.querySelector('summary small');
        s.innerHTML = (m ? '<span class="ob-gek">' + m + ' gekozen</span> · ' : '') + tot + (tot === 1 ? ' paragraaf' : ' paragrafen');
      });
    });
  }
  function kiesThema(k, ti, focus){
    [].forEach.call(k.querySelectorAll('.ob-themas [data-thema]'), function(b){ var aan = Number(b.getAttribute('data-thema')) === ti; b.setAttribute('aria-selected', String(aan)); b.tabIndex = aan ? 0 : -1; if (aan && focus) b.focus(); });
    [].forEach.call(k.querySelectorAll('.ob-thema'), function(p){ p.hidden = Number(p.getAttribute('data-thema')) !== ti; });
  }
  /* zoeken: in de namen van thema, hoofdstuk en paragraaf, en (als de leerroute er is) in de doelen */
  function zoeken(k, vraag){
    var B = OPDRACHTENBOEK, vak = k.getAttribute('data-vak'), w = plat(vraag).trim().split(/\s+/).filter(Boolean);
    k.classList.toggle('zoekt', !!w.length);
    if (!k._open) k._open = [].map.call(k.querySelectorAll('.ob-hfd'), function(d){ return d.open; });
    var tab = k.querySelector('.ob-themas [aria-selected="true"]'), actief = tab ? Number(tab.getAttribute('data-thema')) : 0;
    var iets = false;
    [].forEach.call(k.querySelectorAll('.ob-thema'), function(paneel, ti){
      var t = B.boek(vak)[ti], inThema = false;
      [].forEach.call(paneel.querySelectorAll('.ob-hfd'), function(d, hi){
        var hf = t.hoofdstukken[hi], inHfd = false;
        [].forEach.call(d.querySelectorAll('.ob-par'), function(lab, pi){
          var p = hf.paragrafen[pi];
          var tekst = plat([t.naam, hf.naam, p.naam, p.niveau].concat(p.doelen.map(function(id){ var x = B.doel(id); return x ? x.naam + ' ' + (x.kort || '') : ''; })).join(' '));
          var ja = !w.length || w.every(function(x){ return tekst.indexOf(x) >= 0; });
          lab.hidden = !ja; if (ja) inHfd = true;
        });
        d.hidden = !inHfd; if (inHfd) inThema = true;
        if (w.length && inHfd) d.open = true;
      });
      paneel.hidden = w.length ? !inThema : ti !== actief;
      if (inThema) iets = true;
    });
    k.querySelector('.ob-leeg').hidden = iets;
    if (!w.length){
      /* terug zoals het was, met de hoofdstukken open die open stonden */
      [].forEach.call(k.querySelectorAll('.ob-hfd'), function(d, i){ d.open = k._open[i] || !!d.querySelector('input:checked'); });
      k._open = null;
    }
  }
  function koppel(el){
    var k = el.querySelector('.ob-kies'); if (!k || k._gekoppeld) return; k._gekoppeld = true;
    var veld = k.querySelector('.ob-zoekveld'), wacht = null;
    veld.addEventListener('input', function(){ clearTimeout(wacht); wacht = setTimeout(function(){ zoeken(k, veld.value); }, 120); });
    /* het zoekveld is geen keuze voor het blad: zijn change gaat niet naar de pagina */
    veld.addEventListener('change', function(e){ e.stopPropagation(); });
    veld.addEventListener('keydown', function(e){ if (e.key === 'Enter') e.preventDefault(); });
    k.addEventListener('change', function(){ bijwerken(el); });
    var tabs = k.querySelector('.ob-themas');
    /* het gekozen thema in beeld, ook als het achteraan staat */
    var aan = tabs.querySelector('[aria-selected="true"]'); if (aan){ var r = aan.getBoundingClientRect(), t = tabs.getBoundingClientRect(); if (r.right > t.right) tabs.scrollLeft += r.left - t.left - 8; }
    tabs.addEventListener('click', function(e){ var b = e.target.closest('[data-thema]'); if (b) kiesThema(k, Number(b.getAttribute('data-thema'))); });
    tabs.addEventListener('keydown', function(e){
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault();
      var alle = tabs.querySelectorAll('[data-thema]'), nu = Number(tabs.querySelector('[aria-selected="true"]').getAttribute('data-thema'));
      var nieuw = e.key === 'Home' ? 0 : e.key === 'End' ? alle.length - 1 : (nu + (e.key === 'ArrowRight' ? 1 : -1) + alle.length) % alle.length;
      kiesThema(k, nieuw, true);
    });
  }
  /* het blok opnieuw als het boek binnen is (dan maakt de pagina ook het blad opnieuw) */
  function tekenKeuze(vak, aan){
    var el = document.getElementById('delen'); if (!el) return;
    el.innerHTML = keuzeHtml(vak, aan);
    koppel(el);
  }

  /* ---------- een opgave op papier ---------- */
  function zinBeeld(b){ return /^\s*<p class="lr-zin"/.test(b); }
  function zonderLabels(b){ return gelijkTekst(String(b).replace(/<small>[\s\S]*?<\/small>/g, '')); }
  /* tekst om te vergelijken: zonder opmaak, leestekens en spaties */
  function gelijkTekst(h){ return OPDRACHTENBOEK.kaal(h).toLowerCase().replace(/[^a-z0-9À-ɏ]+/g, ''); }
  /* de vraag zelf: staat de zin al in het beeld (een zin met de woorden apart), dan alleen het beeld */
  function vraagEnBeeld(op, n){
    var B = OPDRACHTENBOEK, b = B.beeld(op, n), v = B.vraagHtml(op);
    if (b && zinBeeld(b) && zonderLabels(b) === gelijkTekst(v)) return b;
    return (v ? '<span class="vr">' + v + '</span>' : '') + b;
  }
  function opgaveHtml(it){
    var B = OPDRACHTENBOEK;
    if (it.soort === 'bank') return '<span class="vr">' + schoon(it.q.v) + '</span><div class="opties">' + it.o.map(function(o, i){ return '<span><b>' + LETTERS.charAt(i) + '</b>' + schoon(o) + '</span>'; }).join('') + '</div>';
    var op = it.op, kz = B.keuzes(op);
    return (op.context ? '<span class="lr-context">' + op.context + '</span>' : '') + vraagEnBeeld(op, 0) +
      (kz ? (kz.uitStap ? '<span class="opdr">' + schoon(B.kaal(kz.tekst)) + '</span>' : '') + '<div class="opties">' + kz.opties.map(function(o, i){ return '<span><b>' + LETTERS.charAt(i) + '</b>' + schoon(o) + '</span>'; }).join('') + '</div>'
        : '<p class="ob-ant">Antwoord: <span class="lijn kort" aria-hidden="true"></span>' + (op.eenheid ? ' ' + schoon(op.eenheid) : '') + '</p>');
  }
  function antwoordHtml(it, metStappen){
    var B = OPDRACHTENBOEK;
    if (it.soort === 'bank') return '<span class="goed">' + LETTERS.charAt(it.g) + '. ' + schoon(it.o[it.g]) + '</span>' + (metStappen && it.q.u ? '<small>' + schoon(it.q.u) + '</small>' : '');
    var op = it.op, kz = B.keuzes(op), e = B.eind(op);
    return '<span class="goed">' + (kz ? LETTERS.charAt(kz.goed) + '. ' : '') + schoon(e) + (op.eenheid && !kz ? ' ' + schoon(op.eenheid) : '') + '</span>' +
      (metStappen ? '<ol class="ob-stappen">' + B.echteStappen(op).map(function(s){ return '<li>' + schoon(B.kaal(s.tekst)) + ' <b>' + schoon(B.stapAntwoord(s)) + '</b></li>'; }).join('') + '</ol>' : '');
  }
  function voorbeeldHtml(vb){
    var B = OPDRACHTENBOEK;
    if (!vb) return '';
    if (vb.soort === 'bank') return '<div class="ob-vb"><b>Voorbeeld</b>' + schoon(vb.q.v) + ' <strong>' + schoon(vb.q.o[vb.q.g]) + '</strong>' + (vb.q.u ? '<br>' + schoon(vb.q.u) : '') + '</div>';
    var op = vb.op, st = B.echteStappen(op);
    return '<div class="ob-vb"><b>Voorbeeld</b>' + (op.context ? '<span class="lr-context">' + op.context + '</span>' : '') + vraagEnBeeld(op, (op.stappen || []).length) +
      '<ol>' + st.map(function(s){ return '<li>' + s.tekst + ' <b>' + schoon(B.stapAntwoord(s)) + '</b></li>'; }).join('') + '</ol></div>';
  }
  function parKop(x, metUitleg, uitlegHtml, vb){
    var verd = x.verdieping ? ' · verdieping' : '';
    return '<li class="ob-kop"><div class="ob-parkop"><span class="ob-nr">' + x.nummer + '</span><h3>' + schoon(x.p.naam) + '</h3><small>' + schoon(x.p.niveau) + verd + '</small></div>' +
      (metUitleg ? '<div class="ob-uitleg">' + uitlegHtml + voorbeeldHtml(vb) + '</div>' : '') + '</li>';
  }

  /* Voor Samenstellen (werkblad-samen.js): een opgave uit het boek als paar voor
     het werkblad en het antwoordblad, ook op een blad dat zelf niet uit het boek
     komt. Het li krijgt dan ob-blad, zodat de figuren hun kleuren houden. */
  window.BOEKBLAD = {
    laad:function(){ return laadBoek().then(stijlBoek); },
    paar:function(o, metStappen){
      stijlBoek();
      var it = { soort:o.soort, op:o.op, q:o.q };
      if (o.soort === 'bank'){ var volg = OPDRACHTENBOEK.schud(o.q.o.map(function(_, j){ return j; })); it.o = volg.map(function(j){ return o.q.o[j]; }); it.g = volg.indexOf(o.q.g); }
      return { v:'<li class="ob-wb ob-blad">' + opgaveHtml(it) + '</li>', a:'<li class="ob-blad">' + antwoordHtml(it, metStappen) + '</li>' };
    }
  };

  Object.keys(VAKKEN).forEach(function(wvak){
    var vak = VAKKEN[wvak];
    window.SPELBLAD['boek-' + wvak] = {
      naam:'Opdrachtenboek', vak:wvak, eigenNiveau:true,
      aantallen:[4, 6, 8, 10], standaard:6, aantalNaam:'Opgaven per paragraaf',
      delenKop:'Kies uit het boek',
      delenTip:'Zoals in een opdrachtenboek: thema, hoofdstuk en paragraaf. Elke paragraaf maakt nieuwe opgaven uit de leerroute, met uitleg en figuren.',
      delen:function(aan){
        if (window.OPDRACHTENBOEK){ stijlBoek(); setTimeout(function(){ koppel(document.getElementById('delen')); }, 0); return keuzeHtml(vak, aan); }
        laadBoek().then(function(){ var b = document.getElementById('blad'); if (b && b.value === 'boek-' + wvak) tekenKeuze(vak, aan); },
          function(){ var d = document.getElementById('delen'); if (d) d.innerHTML = '<p class="tip" style="flex:1 1 100%">Het boek laden lukte niet. Laad de pagina opnieuw.</p>'; });
        return '<p class="tip" style="flex:1 1 100%">Het boek laden…</p>';
      },
      lees:function(el){
        var k = el.querySelector('.ob-kies');
        if (!k) return { wacht:true };
        return { vak:vak, pars:[].map.call(k.querySelectorAll('.ob-par input:checked'), function(i){ return i.value; }),
          mix:!!k.querySelector('input[name="obvolg"][value="volg-mix"]:checked'), uitleg:!!k.querySelector('input[name="obuitleg"]:checked') };
      },
      maak:function(k, n){
        /* het blok staat er nog niet: zodra het boek binnen is, tekent het zich en komt er een nieuwe beurt */
        if (k.wacht) return laadBoek().then(function(){ return new Promise(function(klaar){ setTimeout(function(){ klaar({ fout:'Kies een of meer paragrafen uit het boek.' }); }, 4000); }); });
        if (!k.pars.length) return { fout:'Kies een of meer paragrafen uit het boek. Je kunt ook zoeken op een onderwerp.' };
        return laadBoek().then(function(){ return OPDRACHTENBOEK.laad(vak); }).then(function(){
          var B = OPDRACHTENBOEK, items = [];
          k.pars.forEach(function(id){
            var x = B.paragraaf(vak, id); if (!x) return;
            var lijst = B.opgaven(vak, id, n + (k.uitleg ? 1 : 0));
            var vb = k.uitleg && lijst.length > 1 ? lijst.shift() : null;
            if (lijst.length > n) lijst = lijst.slice(0, n);
            var uit = k.uitleg ? B.uitleg(vak, id) : '';
            lijst.forEach(function(o, i){
              var it = { soort:o.soort, op:o.op, doel:o.doel, q:o.q, par:x, eerste:i === 0, vb:vb, uit:uit, keuze:k };
              /* een vraag uit de vragenbank: de keuzes een keer geschud, voor het blad en de antwoorden */
              if (o.soort === 'bank'){ var volg = B.schud(o.q.o.map(function(_, j){ return j; })); it.o = volg.map(function(j){ return o.q.o[j]; }); it.g = volg.indexOf(o.q.g); }
              items.push(it);
            });
          });
          if (!items.length) return { fout:'Bij deze paragrafen lukte het niet om opgaven te maken. Kies een andere paragraaf.' };
          if (k.mix) items = B.schud(items);
          return items;
        });
      },
      teken:function(w){
        var B = OPDRACHTENBOEK, k = w.items[0].keuze, vak = k.vak, items = w.items;
        var pars = [], themas = [], hfds = [];
        items.forEach(function(it){
          if (pars.indexOf(it.par) < 0) pars.push(it.par);
          if (themas.indexOf(it.par.thema.naam) < 0) themas.push(it.par.thema.naam);
          if (hfds.indexOf(it.par.hoofdstuk.naam) < 0) hfds.push(it.par.hoofdstuk.naam);
        });
        pars.sort(function(a, b){ return a.ti - b.ti || a.hi - b.hi || a.pi - b.pi; });
        var niv = []; pars.forEach(function(x){ x.p.niveau.split('/').forEach(function(n){ if (niv.indexOf(n) < 0) niv.push(n); }); });
        var titel = pars.length === 1 ? pars[0].p.naam : hfds.length === 1 ? hfds[0] : hfds.slice(0, 3).join(' · ') + (hfds.length > 3 ? ' en meer' : '');
        var kop = B.VAKNAAM[vak] + ' · ' + themas.join(' · ');
        var sub = (pars.length === 1 ? pars[0].hoofdstuk.naam + ' · ' : '') + pars.length + (pars.length === 1 ? ' paragraaf' : ' paragrafen') + ' · ' + items.length + ' opgaven · ' + niv.join(', ');
        var vragen = '', antwoorden = '';
        if (!k.mix){
          items.forEach(function(it){
            if (it.eerste){
              vragen += parKop(it.par, k.uitleg, it.uit, it.vb);
              antwoorden += parKop(it.par, false);
            }
            vragen += '<li class="ob-wb">' + opgaveHtml(it) + '</li>';
            antwoorden += '<li>' + antwoordHtml(it, w.uitleg) + '</li>';
          });
        } else {
          /* door elkaar: eerst de uitleg van elke paragraaf, dan de opgaven met hun paragraaf erboven */
          if (k.uitleg) pars.forEach(function(x){ var it = items.filter(function(y){ return y.par === x && y.eerste; })[0]; if (it) vragen += parKop(x, true, it.uit, it.vb); });
          if (k.uitleg) vragen += '<li class="ob-kop"><div class="ob-parkop"><h3>Opgaven door elkaar</h3></div></li>';
          items.forEach(function(it){
            var od = '<span class="odkop">' + it.par.nummer + ' ' + schoon(it.par.p.naam) + '</span>';
            vragen += '<li class="ob-wb">' + od + opgaveHtml(it) + '</li>';
            antwoorden += '<li>' + od + antwoordHtml(it, w.uitleg) + '</li>';
          });
        }
        return { titel:titel, sub:sub, kop:kop, klasse:'ob-blad', vragen:vragen, antwoorden:antwoorden,
          intro:(k.uitleg ? 'Lees eerst de uitleg. ' : '') + 'Schrijf je antwoord op de lijn, of omcirkel de letter van het goede antwoord.' };
      }
    };
  });
})();
