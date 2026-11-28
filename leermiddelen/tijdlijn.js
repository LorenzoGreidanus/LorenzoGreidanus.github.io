/* ============================================================================
   Tijdlijnmaker: de pagina. Het model en de indeling staan in tijdlijn-motor.js,
   de PDF in tijdlijn-pdf.js, inleveren en opdrachten op de server in
   server/tijdlijn.js.

   Opslag in deze browser:
     tl-lijst        [{ id, titel, bewerkt, n, stippen:[[x(0-1), cat]] }]
     tl-m-<id>       de tijdlijn zelf (met foto's als JPEG)
     tl-inl-<id>     { t, code }: wanneer hij voor het laatst werd ingeleverd
     tl-eenvoudig    '1' of '0' (zonder keuze: aan bij niveau bb)
   ============================================================================ */
(function(){
  'use strict';
  var T = window.TIJDLIJN, P = window.TIJDLIJN_PDF;
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lsGet(k){ try { return localStorage.getItem(k); } catch (e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); return true; } catch (e){ return false; } }
  function lsDel(k){ try { localStorage.removeItem(k); } catch (e){} }
  var ICOON = {
    kruis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prul: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    foto: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-9 9"/></svg>',
    luid: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
    greep: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>'
  };
  var VRAGEN = [
    { k: 'wat', v: 'Wat gebeurde er?', starters: [] },
    { k: 'waarom', v: 'Waarom gebeurde het?', starters: ['Het gebeurde omdat ', 'De oorzaak was ', ' wilde dat '] },
    { k: 'gevolg', v: 'Wat kwam ervan?', starters: ['Daardoor ', 'Het gevolg was dat '] }
  ];

  /* ---------- toestand ---------- */
  var st = { m: null, alleenLezen: false, ppj: null, weergave: 'tijdlijn', gekozen: null, L: null, opdrKeuze: null, klasset: null, ksI: 0, ksBron: '' };

  /* ---------- kleine hulpjes ---------- */
  var toastT = 0;
  function toast(t){ var el = $('toast'); el.textContent = t; el.classList.add('aan'); clearTimeout(toastT); toastT = setTimeout(function(){ el.classList.remove('aan'); }, 3200); }
  function eenvoudig(){ return document.body.classList.contains('tl-eenvoudig'); }
  function zetEenvoudig(aan, bewaar){ document.body.classList.toggle('tl-eenvoudig', !!aan); $('eenvoudig').checked = !!aan; if (bewaar) lsSet('tl-eenvoudig', aan ? '1' : '0'); }
  function lees(tekst){
    if (!window.VOORLEES || !VOORLEES.kan()) { toast('Voorlezen kan niet in deze browser.'); return; }
    VOORLEES.spreek({ v: tekst, taal: 'nl-NL' });
  }
  var meetCtx = null;
  function meet(s, px){
    if (!meetCtx){ meetCtx = document.createElement('canvas').getContext('2d'); }
    meetCtx.font = '600 ' + (px || 12) + 'px Poppins, sans-serif';
    return Math.ceil(meetCtx.measureText(String(s || '')).width) + 2;
  }
  function soortVan(it){ return T.SOORT[it.cat] || T.SOORT.anders; }
  function datumVan(it){ return it.soort === 'p' ? T.datumTekst(it.van) + ' tot ' + T.datumTekst(it.tot) : T.datumTekst(it.van); }
  function heeftUitleg(it){ return !!((it.wat || '') + (it.waarom || '') + (it.gevolg || '')).trim(); }
  function itemVan(id){ return st.m && st.m.items.filter(function(it){ return it.id === id; })[0]; }
  function verborgen(){ var v = {}; if (st.m && st.m.opdracht) st.m.items.forEach(function(it){ if (it.kaart && !st.m.opdracht.klaar[it.id]) v[it.id] = true; }); return v; }
  function zichtbaar(){ var v = verborgen(); return st.m.items.filter(function(it){ return !v[it.id]; }); }

  /* ---------- opslag ---------- */
  function lijst(){ try { var l = JSON.parse(lsGet('tl-lijst') || '[]'); return Array.isArray(l) ? l : []; } catch (e){ return []; } }
  function laad(id){ try { var m = JSON.parse(lsGet('tl-m-' + id) || 'null'); return m ? T.schoonModel(m) : null; } catch (e){ return null; } }
  var bewaarT = 0;
  function bewaar(){
    if (!st.m || st.alleenLezen) return;
    clearTimeout(bewaarT);
    $('status').textContent = 'Bezig met bewaren…';
    bewaarT = setTimeout(bewaarNu, 350);
  }
  function bewaarNu(){
    if (!st.m || st.alleenLezen) return;
    st.m.bewerkt = Date.now();
    var ok = lsSet('tl-m-' + st.m.id, JSON.stringify(st.m));
    var b = T.bereik(st.m.items), l = lijst().filter(function(x){ return x.id !== st.m.id; });
    l.unshift({ id: st.m.id, titel: st.m.titel, bewerkt: st.m.bewerkt, n: st.m.items.length, opdr: !!st.m.opdracht,
      stippen: st.m.items.filter(function(it){ return it.soort !== 'p'; }).slice(0, 24).map(function(it){ return [Math.round(1000 * (T.pos(it.van) - b.van) / (b.tot - b.van)) / 1000, it.cat]; }) });
    lsSet('tl-lijst', JSON.stringify(l.slice(0, 60)));
    $('status').textContent = ok ? 'Bewaard in deze browser' : 'Niet bewaard: je browser zit vol';
    if (!ok) toast('Je browser zit vol. Download de PDF en haal een oude tijdlijn of een grote afbeelding weg.');
  }
  function verwijder(id){ lsDel('tl-m-' + id); lsDel('tl-inl-' + id); lsSet('tl-lijst', JSON.stringify(lijst().filter(function(x){ return x.id !== id; }))); }

  /* ---------- schermen ---------- */
  function toon(id){
    ['schStart', 'schMaken', 'schKlasset'].forEach(function(s){ $(s).hidden = s !== id; });
    sluitPop();
    window.scrollTo(0, 0);
  }

  /* ---------- beginnen ---------- */
  function tekenStart(){
    var l = lijst(), html = '';
    l.forEach(function(x){
      var d = new Date(x.bewerkt || Date.now());
      html += '<div class="tl-mijnkaart" role="listitem"><button type="button" class="tl-mijnopen" data-open="' + esc(x.id) + '" style="all:unset;cursor:pointer;display:flex;flex-direction:column;gap:6px">' +
        '<span class="tl-mini" aria-hidden="true"><i></i>' + (x.stippen || []).map(function(s){ return '<em class="cat-' + esc(s[1]) + '" style="left:' + (4 + s[0] * 92) + '%"></em>'; }).join('') + '</span>' +
        '<b>' + esc(x.titel) + '</b><span>' + (x.opdr ? 'Opdracht · ' : '') + x.n + (x.n === 1 ? ' ding' : ' dingen') + ' · ' + d.getDate() + ' ' + T.MAANDEN[d.getMonth()] + '</span></button>' +
        '<button type="button" class="tl-weg" data-weg="' + esc(x.id) + '" aria-label="' + esc(x.titel) + ' weghalen">' + ICOON.prul + '</button></div>';
    });
    $('mijnLijst').setAttribute('role', 'list');
    $('mijnLijst').innerHTML = html || '<p class="tl-leeg">Nog geen tijdlijnen. Begin met een nieuwe, of met een tijdvak hieronder.</p>';
    $('tvKnoppen').innerHTML = T.TIJDVAKKEN.map(function(t, i){ return '<button type="button" data-tv="' + t.nr + '"><b>' + t.nr + '</b>' + esc(t.kort) + ' <small>' + esc(T.TIJDVAK_JAREN[i]) + '</small></button>'; }).join('');
    var docent = docentKlassen().length;
    $('rtKlas').hidden = !docent;
    tekenOpdrBalk();
  }
  function nieuw(extra){
    var k = window.KLAS && KLAS.lees();
    var m = T.schoonModel(Object.assign({ titel: 'Mijn tijdlijn', naam: k ? k.naam : '', items: [] }, extra || {}));
    st.alleenLezen = false;
    open(m);
    lsSet('tl-m-' + m.id, JSON.stringify(m)); bewaarNu();
    setTimeout(function(){ $('titelIn').focus(); $('titelIn').select(); }, 50);
  }
  function open(m, alleenLezen){
    st.m = T.schoonModel(m); st.alleenLezen = !!alleenLezen; st.ppj = null; st.gekozen = null; st.opdrKeuze = null;
    toon('schMaken');
    $('balkMaken').style.display = alleenLezen ? 'none' : 'contents';
    $('inlever').hidden = !!alleenLezen; $('titelIn').readOnly = !!alleenLezen; $('naamIn').readOnly = !!alleenLezen;
    $('opdrMaak').hidden = !!alleenLezen || !docentKlassen().length || !!st.m.opdracht;
    $('titelIn').value = st.m.titel; $('naamIn').value = st.m.naam || '';
    var inl = null; try { inl = JSON.parse(lsGet('tl-inl-' + st.m.id) || 'null'); } catch (e){}
    $('status').textContent = alleenLezen ? 'Voorbeeld: alleen bekijken' : inl ? 'Ingeleverd om ' + tijdTekst(inl.t) : 'Bewaard in deze browser';
    zetWeergave('tijdlijn');
    teken();
  }
  function tijdTekst(t){ var d = new Date(t); return d.getHours() + '.' + ('0' + d.getMinutes()).slice(-2) + (new Date().toDateString() === d.toDateString() ? '' : ' op ' + d.getDate() + ' ' + T.MAANDEN[d.getMonth()]); }

  /* ---------- tekenen ---------- */
  function teken(){
    if (!st.m) return;
    tekenOpdracht();
    tekenLegenda();
    if (st.weergave === 'lijst') tekenLijstweergave(); else tekenLijn(doelMaken());
    tekenVolg();
    tekenOnder();
    if (st.gekozen) plaatsPop();
  }
  function doelMaken(){ return { scroll: $('tlScroll'), vlak: $('tlVlak'), paneel: $('tlScroll').parentNode, model: st.m, verberg: verborgen(), eigen: true }; }
  function maten(){ var e = eenvoudig(); return { kaartBreed: e ? 180 : 160, kaartHoog: e ? 74 : 64 }; }
  function pasBreedte(doel, b){
    var w = Math.max(320, doel.scroll.clientWidth - 4);
    return Math.max(0.0005, (w - 48) / Math.max(1, b.tot - b.van));
  }
  function tekenLijn(doel){
    var m = doel.model, vis = m.items.filter(function(it){ return !doel.verberg[it.id]; });
    if (!vis.length){
      doel.vlak.style.width = ''; doel.vlak.style.height = '';
      doel.vlak.innerHTML = doel.eigen && !st.alleenLezen ? '<div class="tl-leegvlak">' + (m.opdracht ? '<b>Nog niets op de tijdlijn</b><span>Sleep de kaartjes hierboven naar de goede plek.</span>' :
        '<b>Je tijdlijn is nog leeg</b><span>Begin met de eerste gebeurtenis. Je kunt alles later nog veranderen.</span><button type="button" class="tl-knop vol" data-actie="nieuwG">+ Gebeurtenis</button>') + '</div>' : '<div class="tl-leegvlak"><b>Deze tijdlijn is leeg</b></div>';
      doel.L = null; if (doel.eigen) st.L = null;
      return;
    }
    var b = T.bereik(m.items, m.bereik);
    var pas = pasBreedte(doel, b);
    var ppj = doel.eigen && st.ppj ? st.ppj : pas;
    var mt = maten();
    var L = T.opmaak(m, { van: b.van, tot: b.tot, pxPerJaar: ppj, kaartBreed: mt.kaartBreed, kaartHoog: mt.kaartHoog, meet: function(s){ return meet(s, 12.5); }, verberg: doel.verberg, boven: 5 });
    doel.L = L; if (doel.eigen){ st.L = L; st.pas = pas; }
    var h = '', gek = doel.eigen ? st.gekozen : doel.gekozen;
    L.band.forEach(function(t, i){
      var w = t.x2 - t.x1, naam = 'Tijdvak ' + t.nr + ' · ' + t.naam;
      if (meet(naam, 12) > w - 14) naam = 'Tijdvak ' + t.nr + ' · ' + t.kort;
      if (meet(naam, 12) > w - 14) naam = String(t.nr);
      h += '<div class="tl-band' + (i % 2 ? ' even' : '') + '" style="left:' + t.x1 + 'px;width:' + Math.max(0, w - 2) + 'px" title="' + esc(t.naam) + '">' + esc(naam) + '</div>';
    });
    L.streepjes.forEach(function(s){
      h += '<div class="tl-raster" style="left:' + s.x + 'px;height:' + (L.hoog - 30 - 26) + 'px"></div><span class="tl-jaar" style="left:' + s.x + 'px;top:' + (L.hoog - 22) + 'px">' + esc(s.tekst) + '</span>';
    });
    L.perioden.forEach(function(e){
      var it = e.it, sel = gek === it.id, lbl = esc(it.titel) + ', ' + esc(datumVan(it));
      h += '<button type="button" class="tl-per cat-' + esc(it.cat) + (sel ? ' gekozen' : '') + '" data-id="' + esc(it.id) + '" style="left:' + e.x1 + 'px;top:' + e.top + 'px;width:' + Math.max(6, e.x2 - e.x1) + 'px;height:' + L.periodeHoog + 'px;line-height:' + L.periodeHoog + 'px" aria-label="Periode: ' + lbl + '">' + (e.binnen ? esc(it.titel) : '') + '</button>';
      if (!e.binnen) h += '<button type="button" class="tl-pernaam" data-id="' + esc(it.id) + '" tabindex="-1" aria-hidden="true" style="' + (e.naastLinks ? 'left:' + (e.x1 - 8) + 'px;transform:translateX(-100%)' : 'left:' + (e.x2 + 8) + 'px') + ';top:' + (e.top + 3) + 'px">' + esc(it.titel) + '</button>';
    });
    h += '<div class="tl-as" style="top:' + (L.asY - 2) + 'px;width:' + L.breed + 'px"></div>';
    L.gebeurt.forEach(function(e){
      var it = e.it, s = 'cat-' + esc(it.cat), sel = gek === it.id;
      if (e.sx !== e.x) h += '<div class="tl-echt" style="left:' + (e.x - 1) + 'px;top:' + (L.asY - 6) + 'px"></div>';
      h += '<div class="tl-stam ' + s + '" style="left:' + (e.sx - 1) + 'px;top:' + e.stamTop + 'px;height:' + Math.max(0, e.stamBodem - e.stamTop) + 'px"></div>';
      h += '<button type="button" class="tl-kaart ' + s + (it.foto ? ' met-foto' : '') + (!heeftUitleg(it) && doel.eigen && !st.alleenLezen ? ' zonder-uitleg' : '') + (sel ? ' gekozen' : '') + '" data-id="' + esc(it.id) + '" style="left:' + e.links + 'px;top:' + e.top + 'px;width:' + L.kaartBreed + 'px;height:' + L.kaartHoog + 'px" aria-label="' + e.nr + ': ' + esc(it.titel) + ', ' + esc(T.datumTekst(it.van)) + '">' +
        (it.foto ? '<svg class="tl-foto-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-9 9"/></svg>' : '') +
        '<b>' + esc(T.datumTekst(it.van)) + '</b><span>' + esc(it.titel) + '</span></button>';
      h += '<span class="tl-stip ' + s + (sel ? ' gekozen' : '') + '" data-id="' + esc(it.id) + '" aria-hidden="true" style="left:' + e.sx + 'px;top:' + (L.asY - 14) + 'px">' + e.nr + '</span>';
    });
    doel.vlak.style.width = L.breed + 'px'; doel.vlak.style.height = L.hoog + 'px';
    doel.vlak.innerHTML = h;
    if (doel.eigen) $('schaalTekst').textContent = schaalTekst(ppj);
  }
  function schaalTekst(ppj){
    var jaren = 100 / ppj;
    if (jaren < 1) return 'Een maand is ' + Math.round(ppj / 12) + ' px';
    var r = jaren >= 50 ? Math.round(jaren / 10) * 10 : jaren >= 5 ? Math.round(jaren) : Math.round(jaren * 10) / 10;
    return '2,5 cm is ongeveer ' + String(r).replace('.', ',') + ' jaar';
  }
  function tekenLegenda(){
    var gebruikt = {}; st.m.items.forEach(function(it){ gebruikt[it.cat] = true; });
    $('legenda').innerHTML = T.SOORTEN.filter(function(s){ return gebruikt[s.id]; }).map(function(s){ return '<li class="cat-' + s.id + '"><i aria-hidden="true"></i>' + esc(s.naam) + '</li>'; }).join('');
  }
  function gesorteerd(m){ return m.items.slice().sort(function(a, b){ return T.beginVan(a) - T.beginVan(b) || (a.soort === 'p') - (b.soort === 'p'); }); }
  function tekenVolg(){
    var nrs = T.nummers({ items: zichtbaar() }), v = verborgen(), html = '';
    gesorteerd(st.m).forEach(function(it){
      if (v[it.id]) return;
      var s = 'cat-' + esc(it.cat), nr = nrs[it.id], uitleg = heeftUitleg(it);
      html += '<li><button type="button" class="' + (st.gekozen === it.id ? 'gekozen' : '') + '" data-id="' + esc(it.id) + '">' +
        '<span class="nr ' + s + (it.soort === 'p' ? ' per' : '') + '" aria-hidden="true">' + (nr || '') + '</span>' +
        '<span class="tx"><b>' + esc(it.soort === 'p' ? T.jaarTekst(it.van.j) + ' tot ' + T.jaarTekst(it.tot.j) : T.jaarTekst(it.van.j)) + ' · ' + esc(it.titel) + '</b>' +
        '<small' + (uitleg || st.alleenLezen ? '' : ' class="mist"') + '>' + (uitleg ? 'uitleg geschreven' + (it.foto ? ', met afbeelding' : '') : st.alleenLezen ? (it.soort === 'p' ? 'periode' : 'gebeurtenis') : 'nog geen uitleg') + '</small></span>' +
        (it.foto ? '<img src="' + it.foto.src + '" alt="">' : '') + '</button></li>';
    });
    $('volgLijst').innerHTML = html || '<li class="tl-leeg">Nog niets.</li>';
  }
  function tekenLijstweergave(){
    var nrs = T.nummers({ items: zichtbaar() }), v = verborgen();
    $('lijstWeergave').innerHTML = gesorteerd(st.m).filter(function(it){ return !v[it.id]; }).map(function(it){
      var s = 'cat-' + esc(it.cat), nr = nrs[it.id];
      var tekst = VRAGEN.map(function(q){ return it[q.k] ? '<p><b>' + esc(q.v) + '</b> ' + esc(it[q.k]) + '</p>' : ''; }).join('');
      return '<button type="button" class="tl-lijstitem" data-id="' + esc(it.id) + '"><span class="nr ' + s + (it.soort === 'p' ? ' per' : '') + '" aria-hidden="true">' + (nr || '') + '</span>' +
        '<span><small>' + esc(datumVan(it)) + ' · ' + esc(soortVan(it).naam) + '</small><h3>' + esc(it.titel) + '</h3>' + (tekst || '<p style="color:var(--muted)">Nog geen uitleg.</p>') + '</span>' +
        (it.foto ? '<img src="' + it.foto.src + '" alt="">' : '<span></span>') + '</button>';
    }).join('') || '<p class="tl-leeg">Nog niets op je tijdlijn.</p>';
  }
  function tekenOnder(){
    var items = zichtbaar(), b = T.bereik(items, st.m.bereik), tv = T.TIJDVAKKEN;
    var gew = [14, 14, 8, 8, 7, 7, 7, 7, 7, 9], som = gew.reduce(function(a, c){ return a + c; }, 0);
    /* een plek in de tijd naar een plek op de strook (elk tijdvak een vast stuk) */
    function op(p){
      var links = 0;
      for (var i = 0; i < tv.length; i++){
        var t = tv[i], w = gew[i] / som;
        if (p < t.tot || i === tv.length - 1){ return Math.max(0, Math.min(1, links + w * Math.max(0, Math.min(1, (p - t.van) / (t.tot - t.van))))); }
        links += w;
      }
      return 1;
    }
    var a = op(b.van), z = op(b.tot), mid = T.tijdvakkenIn(b.van, b.tot).map(function(t){ return t.nr; });
    $('strook').innerHTML = tv.map(function(t, i){ return '<span class="' + (mid.indexOf(t.nr) >= 0 ? 'nu' : '') + '" style="flex:' + gew[i] + ' 0 0" title="' + esc(t.naam) + '">' + t.nr + '</span>'; }).join('') +
      '<i aria-hidden="true" style="left:' + (a * 100).toFixed(2) + '%;width:' + Math.max(1.2, (z - a) * 100).toFixed(2) + '%"></i>';
    var vakken = T.tijdvakkenIn(b.van, b.tot);
    $('strookTekst').textContent = items.length ? 'Jouw tijdlijn gaat over ' + T.asTekst(b.van) + ' tot ' + T.asTekst(b.tot) + ': ' + (vakken.length === 1 ? 'tijdvak ' + vakken[0].nr + ', de ' + vakken[0].naam.toLowerCase() + '.' : 'tijdvak ' + vakken[0].nr + ' tot en met ' + vakken[vakken.length - 1].nr + '.') : 'Zet iets op je tijdlijn, dan zie je hier in welk tijdvak het valt.';
    $('checklijst').innerHTML = T.checklijst(st.m).map(function(c){ return '<li class="' + (c.ok ? 'ok' : '') + '"><i aria-hidden="true">' + (c.ok ? '✓' : '!') + '</i><span>' + esc(c.tekst) + (c.ok ? '' : '<span class="sronly"> (nog niet af)</span>') + '</span></li>'; }).join('');
    $('onderRij').hidden = st.alleenLezen;
  }
  function zetWeergave(w){
    st.weergave = w;
    $('wTijdlijn').setAttribute('aria-pressed', w === 'tijdlijn'); $('wLijst').setAttribute('aria-pressed', w === 'lijst');
    $('tlScroll').hidden = w !== 'tijdlijn'; $('zoomRij').style.visibility = w === 'tijdlijn' ? '' : 'hidden';
    $('lijstWeergave').hidden = w !== 'lijst';
    sluitPop();
    teken();
  }

  /* ---------- het kaartje om te bewerken ---------- */
  var pop = null, popDoel = null;
  function maakPop(){ pop = document.createElement('section'); pop.className = 'tl-pop'; pop.setAttribute('role', 'dialog'); pop.hidden = true; return pop; }
  function openPop(id, doel){
    doel = doel || doelMaken();
    var it = (doel.model.items || []).filter(function(x){ return x.id === id; })[0]; if (!it) return;
    if (doel.eigen){ st.gekozen = id; if (st.weergave === 'lijst') zetWeergave('tijdlijn'); }
    else doel.gekozen = id;
    popDoel = doel;
    tekenLijn(doel); if (doel.eigen) tekenVolg();
    if (!pop) maakPop();
    if (pop.parentNode !== doel.paneel) doel.paneel.appendChild(pop);
    doel.paneel.style.position = 'relative';
    vulPop(it, doel);
    pop.hidden = false;
    plaatsPop();
    pop.tabIndex = -1;
    setTimeout(function(){ pop.focus({ preventScroll: true }); }, 30);
  }
  function sluitPop(terugNaar){
    if (pop) pop.hidden = true;
    var was = st.gekozen; st.gekozen = null;
    if (popDoel && !popDoel.eigen) popDoel.gekozen = null;
    if (was && st.m && !$('schMaken').hidden){ if (st.weergave === 'tijdlijn') tekenLijn(doelMaken()); tekenVolg(); }
    if (popDoel && !popDoel.eigen && popDoel.L) tekenLijn(popDoel);
    if (terugNaar){ var el = document.querySelector('[data-id="' + terugNaar + '"].tl-kaart, [data-id="' + terugNaar + '"].tl-per'); if (el) el.focus({ preventScroll: true }); }
  }
  function vulPop(it, doel){
    var s = soortVan(it), bewerk = doel.eigen && !st.alleenLezen, nr = T.nummers({ items: doel.eigen ? zichtbaar() : doel.model.items })[it.id];
    var h = '<div class="tl-popkop cat-' + esc(it.cat) + '"><span class="nr' + (it.soort === 'p' ? ' per' : '') + '" aria-hidden="true">' + (nr || '') + '</span><div><small>' + esc(datumVan(it)) + ' · ' + esc(s.naam) + '</small><h2 id="popKop">' + esc(it.titel) + '</h2></div>' +
      '<button type="button" class="tl-dicht" data-pop="dicht" aria-label="Sluiten">' + ICOON.kruis + '</button></div>';
    pop.setAttribute('aria-labelledby', 'popKop');
    if (it.foto){
      h += '<figure style="margin:0"><div class="tl-fotovak"><img src="' + it.foto.src + '" alt="Afbeelding bij ' + esc(it.titel) + '"></div><figcaption class="tl-fotobron"><span>' + (it.foto.bron ? 'Bron: ' + esc(it.foto.bron) : bewerk ? '' : '') + '</span>' +
        (bewerk ? '<span><button type="button" class="tl-linkknop" data-pop="foto">Andere afbeelding</button> · <button type="button" class="tl-linkknop" data-pop="fotoweg" style="color:var(--fout)">Weghalen</button></span>' : '') + '</figcaption></figure>';
      if (bewerk) h += '<label class="tl-vraag"><label for="popBron">Waar komt de afbeelding vandaan?</label><input class="tl-in" id="popBron" data-veld="bron" maxlength="160" value="' + esc(it.foto.bron || '') + '" placeholder="bijvoorbeeld je boek, blz. 84"></label>';
    } else if (bewerk){
      h += '<button type="button" class="tl-drop" data-pop="foto" id="popDrop">' + ICOON.foto + '<b>Afbeelding toevoegen</b><small>Kies een bestand, of sleep of plak hem hier</small></button>';
    }
    if (bewerk){
      VRAGEN.forEach(function(q, i){
        h += '<div class="tl-vraag"><label for="pv' + i + '">' + esc(q.v) + '</label><textarea class="tl-in" id="pv' + i + '" data-veld="' + q.k + '" rows="2" maxlength="1200">' + esc(it[q.k] || '') + '</textarea>' +
          (q.starters.length && (eenvoudig() || !it[q.k]) ? '<div class="tl-starters" aria-label="Zo kun je beginnen">' + q.starters.map(function(x){ return '<button type="button" data-start="' + esc(x) + '" data-voor="pv' + i + '">' + esc(x.trim()) + ' …</button>'; }).join('') + '</div>' : '') + '</div>';
      });
      if (docentKlassen().length && !st.m.opdracht && it.soort !== 'p') h += '<label class="tl-kaartvink"><input type="checkbox" data-veld="kaart"' + (it.kaart ? ' checked' : '') + '> Kaartje: leerlingen leggen dit zelf op de goede plek</label>';
      h += '<div class="tl-popvoet"><button type="button" class="tl-weglink" data-pop="weg">Weghalen</button><button type="button" class="tl-knop zacht klein" data-pop="lees">' + ICOON.luid + 'Voorlezen</button><span class="tl-vul"></span><button type="button" class="tl-knop zacht klein" data-pop="bewerk">Naam en datum</button><button type="button" class="tl-knop vol klein" data-pop="dicht">Klaar</button></div>';
    } else {
      var tekst = VRAGEN.map(function(q){ return it[q.k] ? '<p style="margin:0;line-height:1.55"><b>' + esc(q.v) + '</b> ' + esc(it[q.k]) + '</p>' : ''; }).join('');
      h += tekst || '<p style="margin:0;color:var(--muted)">Hier staat nog geen uitleg bij.</p>';
      h += '<div class="tl-popvoet"><button type="button" class="tl-knop zacht klein" data-pop="lees">' + ICOON.luid + 'Voorlezen</button><span class="tl-vul"></span><button type="button" class="tl-knop vol klein" data-pop="dicht">Sluiten</button></div>';
    }
    pop.className = 'tl-pop';
    pop.setAttribute('data-id', it.id);
    pop.innerHTML = h;
  }
  function plaatsPop(){
    if (!pop || pop.hidden || !popDoel) return;
    var id = pop.getAttribute('data-id');
    var el = popDoel.vlak.querySelector('.tl-kaart[data-id="' + id + '"], .tl-per[data-id="' + id + '"]');
    if (!el){ return; }
    var pr = popDoel.paneel.getBoundingClientRect(), r = el.getBoundingClientRect(), pw = pop.offsetWidth || 380, ph = pop.offsetHeight;
    var links = r.left - pr.left - pw - 16;
    if (links < 8) links = r.right - pr.left + 16;
    if (links + pw > pr.width - 8) links = Math.max(8, Math.min(pr.width - pw - 8, r.left - pr.left + r.width / 2 - pw / 2));
    var boven = r.top - pr.top - 20;
    boven = Math.max(8, boven);
    pop.style.left = links + 'px'; pop.style.top = boven + 'px';
    /* valt het kaartje onder de rand van het scherm, dan een stukje mee scrollen */
    var pb = pop.getBoundingClientRect();
    if (pb.bottom > window.innerHeight - 8 && window.innerWidth > 760) window.scrollBy({ top: Math.min(pb.bottom - window.innerHeight + 16, pb.top - 70), behavior: 'smooth' });
    if (ph === 0) requestAnimationFrame(plaatsPop);
  }
  function popActie(a, knop){
    var id = pop.getAttribute('data-id'), it = popDoel && popDoel.eigen ? itemVan(id) : (popDoel.model.items.filter(function(x){ return x.id === id; })[0]);
    if (!it) return;
    if (a === 'dicht'){ sluitPop(id); return; }
    if (a === 'lees'){ lees(it.titel + '. ' + datumVan(it) + '. ' + VRAGEN.map(function(q){ return it[q.k] ? q.v + ' ' + it[q.k] : ''; }).join(' ')); return; }
    if (a === 'foto'){ kiesFoto(function(src){ it.foto = { src: src, bron: (it.foto && it.foto.bron) || '' }; bewaar(); tekenLijn(doelMaken()); tekenVolg(); vulPop(it, popDoel); plaatsPop(); var b = $('popBron'); if (b) b.focus(); }); return; }
    if (a === 'fotoweg'){ delete it.foto; bewaar(); tekenLijn(doelMaken()); tekenVolg(); vulPop(it, popDoel); plaatsPop(); return; }
    if (a === 'weg'){
      if (!confirm('"' + it.titel + '" van je tijdlijn halen? Dit kun je niet terugdraaien.')) return;
      st.m.items = st.m.items.filter(function(x){ return x.id !== id; });
      bewaar(); sluitPop(); teken(); toast('Weggehaald'); return;
    }
    if (a === 'bewerk'){ sluitPop(); openStappen(it.soort, it); return; }
  }

  /* ---------- afbeeldingen: kiezen, slepen, plakken; altijd verkleind tot een JPEG ---------- */
  var fotoKlaar = null;
  function kiesFoto(klaar){ fotoKlaar = klaar; $('fotoIn').value = ''; $('fotoIn').click(); }
  function verwerkFoto(bestand, klaar){
    if (!bestand || !/^image\//.test(bestand.type)){ toast('Dat is geen afbeelding.'); return; }
    if (bestand.size > 25e6){ toast('Die afbeelding is te groot.'); return; }
    var url = URL.createObjectURL(bestand), img = new Image();
    img.onload = function(){
      var max = 1000, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      var w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
      var q = 0.8, data = c.toDataURL('image/jpeg', q);
      while (data.length > 300000 && q > 0.45){ q -= 0.1; data = c.toDataURL('image/jpeg', q); }
      if (data.length > 380000){ c.width = Math.round(w * 0.7); c.height = Math.round(h * 0.7); x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); data = c.toDataURL('image/jpeg', 0.7); }
      URL.revokeObjectURL(url);
      klaar(data);
    };
    img.onerror = function(){ URL.revokeObjectURL(url); toast('Deze afbeelding kan ik niet openen. Probeer een JPG of PNG.'); };
    img.src = url;
  }
  $('fotoIn').addEventListener('change', function(){ var f = this.files && this.files[0]; if (f && fotoKlaar){ var k = fotoKlaar; verwerkFoto(f, k); } });
  /* plakken: in het kaartje of in stap 3 */
  document.addEventListener('paste', function(e){
    var items = (e.clipboardData && e.clipboardData.items) || [], bestand = null;
    for (var i = 0; i < items.length; i++) if (items[i].kind === 'file' && /^image\//.test(items[i].type)){ bestand = items[i].getAsFile(); break; }
    if (!bestand) return;
    if ($('dlgNieuw').open && w && w.stap === 3){ e.preventDefault(); verwerkFoto(bestand, function(src){ w.it.foto = { src: src, bron: (w.it.foto && w.it.foto.bron) || '' }; tekenStap(); }); return; }
    if (pop && !pop.hidden && popDoel && popDoel.eigen && !st.alleenLezen){ e.preventDefault(); var it = itemVan(pop.getAttribute('data-id')); if (it) verwerkFoto(bestand, function(src){ it.foto = { src: src, bron: (it.foto && it.foto.bron) || '' }; bewaar(); tekenLijn(doelMaken()); tekenVolg(); vulPop(it, popDoel); plaatsPop(); }); }
  });
  function dropOp(el, klaar){
    el.addEventListener('dragover', function(e){ e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', function(){ el.classList.remove('over'); });
    el.addEventListener('drop', function(e){ e.preventDefault(); el.classList.remove('over'); var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) verwerkFoto(f, klaar); });
  }

  /* ---------- in stappen iets nieuws op de tijdlijn ---------- */
  var w = null;
  function openStappen(soort, bestaand){
    var it = bestaand ? JSON.parse(JSON.stringify(bestaand)) : { soort: soort, titel: '', cat: '', van: null, tot: null };
    w = { stap: 1, it: it, bewerk: bestaand ? bestaand.id : null, soortVast: !!bestaand,
      van: datumVelden(it.van), tot: datumVelden(it.tot), meer: !!(it.van && it.van.m) };
    $('stapMelding').textContent = '';
    tekenStap();
    $('dlgNieuw').showModal();
    setTimeout(function(){ var f = $('stapInhoud').querySelector('input, textarea'); if (f) f.focus(); }, 40);
  }
  function datumVelden(dt){ return dt ? { j: String(Math.abs(dt.j)), vc: dt.j < 0, m: dt.m ? String(dt.m) : '', d: dt.d ? String(dt.d) : '' } : { j: '', vc: false, m: '', d: '' }; }
  function veldDatum(v){
    var j = parseInt(String(v.j).replace(/[^0-9]/g, ''), 10);
    if (!j) return null;
    return T.schoneDatum({ j: v.vc ? -j : j, m: parseInt(v.m, 10) || 0, d: parseInt(v.d, 10) || 0 });
  }
  function stapAantal(){ return w.bewerk ? 2 : 3; }
  function tekenStap(){
    var it = w.it, per = it.soort === 'p', n = stapAantal();
    var namen = ['Wat?', 'Wanneer?', 'Vertel erover'];
    $('stappen').style.gridTemplateColumns = 'repeat(' + n + ',minmax(0,1fr))';
    $('stappen').innerHTML = namen.slice(0, n).map(function(x, i){ var k = i + 1; return '<li class="' + (k < w.stap ? 'klaar' : k === w.stap ? 'nu' : '') + '"' + (k === w.stap ? ' aria-current="step"' : '') + '><i>' + (k < w.stap ? '✓' : k) + '</i><span>' + x + '</span></li>'; }).join('');
    $('dlgHand').textContent = w.stap === 1 ? (w.bewerk ? 'veranderen' : per ? 'nieuwe periode' : 'nieuwe gebeurtenis') : it.titel;
    $('stapTerug').style.visibility = w.stap === 1 ? 'hidden' : '';
    $('stapVerder').textContent = w.stap < n ? 'Volgende stap →' : w.bewerk ? 'Bewaar ✓' : 'Zet op de tijdlijn ✓';
    $('stapTip').textContent = w.stap === 3 ? 'Dit mag je ook later invullen.' : '';
    var h = '';
    if (w.stap === 1){
      $('dlgKop').textContent = per ? 'Welke periode?' : 'Wat gebeurde er?';
      if (!w.soortVast) h += '<div class="tl-soortkeuze" role="group" aria-label="Wat zet je erop?" style="margin-bottom:16px"><button type="button" data-soort="g" aria-pressed="' + !per + '">Een gebeurtenis<small>op een moment, zoals een slag of een uitvinding</small></button><button type="button" data-soort="p" aria-pressed="' + per + '">Een periode<small>van een jaar tot een jaar, zoals een oorlog</small></button></div>';
      h += '<label class="tl-veld" style="font-size:1rem">Geef het een korte naam <small>Een paar woorden, bijvoorbeeld ' + (per ? '"Duitse bezetting"' : '"Bombardement op Rotterdam"') + '</small><input class="tl-in" id="stTitel" maxlength="80" value="' + esc(it.titel) + '" style="min-height:56px;font-size:1.15rem" autocomplete="off"></label>';
      h += '<div style="margin-top:18px"><span style="display:block;font-weight:600;margin-bottom:8px">Wat voor ' + (per ? 'periode' : 'gebeurtenis') + ' is het?</span><div class="tl-soorten" role="group" aria-label="Soort">' +
        T.SOORTEN.map(function(s){ return '<button type="button" class="cat-' + s.id + '" data-cat="' + s.id + '" aria-pressed="' + (it.cat === s.id) + '"><i aria-hidden="true"></i>' + esc(s.naam) + '</button>'; }).join('') + '</div></div>';
    } else if (w.stap === 2){
      $('dlgKop').textContent = per ? 'Van wanneer tot wanneer?' : 'In welk jaar gebeurde het?';
      if (!per) h += datumInvoer('van', w.van, true);
      else h += '<div class="tl-van-tot"><div><span>Van</span>' + datumInvoer('van', w.van, false) + '</div><div><span>Tot en met</span>' + datumInvoer('tot', w.tot, false) + '</div></div>';
      h += '<div class="tl-voorproef" style="margin-top:18px"><b>Hier komt ' + (per ? 'hij' : 'het') + ' te staan</b><div class="tl-vp" id="vp"></div><p class="tl-vptekst" id="vpTekst"></p></div>';
    } else {
      $('dlgKop').textContent = 'Vertel erover in een paar zinnen';
      h += '<div class="tl-twee"><div style="display:grid;gap:12px">';
      VRAGEN.forEach(function(q, i){
        h += '<div class="tl-vraag"><label for="sv' + i + '" style="font-size:1rem">' + (i + 1) + '. ' + esc(q.v) + '</label><textarea class="tl-in" id="sv' + i + '" data-wveld="' + q.k + '" rows="2" maxlength="1200">' + esc(it[q.k] || '') + '</textarea>' +
          (q.starters.length ? '<div class="tl-starters" aria-label="Zo kun je beginnen">' + q.starters.map(function(x){ return '<button type="button" data-start="' + esc(x) + '" data-voor="sv' + i + '">' + esc(x.trim()) + ' …</button>'; }).join('') + '</div>' : '') + '</div>';
      });
      h += '<button type="button" class="tl-knop zacht klein" id="stLees" style="justify-self:start">' + ICOON.luid + 'Lees de vragen voor</button></div><div style="display:grid;gap:10px;align-content:start"><span style="font-weight:600">Afbeelding <small style="font-weight:400;color:var(--muted)">(mag)</small></span>';
      if (it.foto) h += '<div class="tl-fotovak"><img src="' + it.foto.src + '" alt="Gekozen afbeelding"></div><div class="tl-fotobron"><button type="button" class="tl-linkknop" id="stFoto">Andere afbeelding</button><button type="button" class="tl-linkknop" id="stFotoWeg" style="color:var(--fout)">Weghalen</button></div>';
      else h += '<button type="button" class="tl-drop" id="stFoto">' + ICOON.foto + '<b>Kies een afbeelding</b><small>of sleep of plak hem hier</small></button>';
      h += '<label class="tl-veld">Waar komt hij vandaan? <input class="tl-in" id="stBron" maxlength="160" placeholder="bijvoorbeeld je boek, blz. 84" value="' + esc((it.foto && it.foto.bron) || w.bron || '') + '"></label></div></div>';
    }
    $('stapInhoud').innerHTML = h;
    if (w.stap === 2) tekenVoorproef();
    if (w.stap === 3){ var d = $('stFoto'); if (d && d.classList.contains('tl-drop')) dropOp(d, function(src){ w.it.foto = { src: src, bron: $('stBron').value }; tekenStap(); }); }
  }
  var MAANDOPTIES = '<option value="">weet ik niet</option>' + T.MAANDEN.map(function(m, i){ return '<option value="' + (i + 1) + '">' + m + '</option>'; }).join('');
  function datumInvoer(wie, v, groot){
    var meer = w.meer || (!eenvoudig() && false);
    return '<div class="tl-jaarrij"><label class="tl-veld">' + (groot ? 'Jaartal' : '<span class="sronly">Jaartal</span>') + '<input class="tl-jaarin" data-dv="' + wie + '" data-dk="j" inputmode="numeric" maxlength="5" value="' + esc(v.j) + '" aria-label="Jaartal ' + (wie === 'tot' ? 'tot' : wie === 'van' && w.it.soort === 'p' ? 'van' : '') + '"' + (groot ? '' : ' style="width:150px;min-height:60px;font-size:1.7rem"') + '></label>' +
      '<div class="tl-tijdkeuze" role="group" aria-label="Voor of na Christus"><button type="button" data-dv="' + wie + '" data-vc="1" aria-pressed="' + v.vc + '">voor Christus</button><button type="button" data-dv="' + wie + '" data-vc="0" aria-pressed="' + !v.vc + '">na Christus</button></div></div>' +
      '<details' + (meer || v.m ? ' open' : '') + ' style="margin-top:10px"><summary style="cursor:pointer;font-weight:600;min-height:40px;display:flex;align-items:center">Weet je ook de maand' + (w.it.soort === 'p' ? '' : ' of de dag') + '? Dat hoeft niet.</summary><div class="tl-preciezer">' +
      (w.it.soort === 'p' ? '' : '<label class="tl-veld">dag<input class="tl-in" data-dv="' + wie + '" data-dk="d" inputmode="numeric" maxlength="2" value="' + esc(v.d) + '"></label>') +
      '<label class="tl-veld">maand<select class="tl-in" data-dv="' + wie + '" data-dk="m">' + MAANDOPTIES.replace('value="' + v.m + '"', 'value="' + v.m + '" selected') + '</select></label></div></details>';
  }
  function tekenVoorproef(){
    var vp = $('vp'); if (!vp) return;
    var van = veldDatum(w.van), tot = w.it.soort === 'p' ? veldDatum(w.tot) : null;
    var anderen = st.m.items.filter(function(x){ return x.id !== w.bewerk && !verborgen()[x.id]; });
    var alle = anderen.slice(); if (van) alle.push({ soort: w.it.soort, van: van, tot: tot || van });
    var b = T.bereik(alle), W = vp.clientWidth || 780, X = function(p){ return Math.max(0, Math.min(W, (p - b.van) / (b.tot - b.van) * W)); };
    var h = '<div class="lijn"></div>';
    var stap = T.mooieStap((b.tot - b.van) / 6);
    for (var t = Math.ceil(b.van / stap) * stap; t <= b.tot; t += stap) h += '<span class="jr" style="left:' + X(t) + 'px">' + esc(t < 0 ? -t + ' v.Chr.' : t) + '</span>';
    anderen.filter(function(x){ return x.soort !== 'p'; }).forEach(function(x){ h += '<span class="ander" style="left:' + X(T.pos(x.van)) + 'px"></span>'; });
    if (van){
      if (w.it.soort === 'p' && tot){ var a = X(T.posBegin(van)), z = X(T.posEind(tot)); h += '<span class="nieuwper" style="left:' + Math.min(a, z) + 'px;width:' + Math.max(6, Math.abs(z - a)) + 'px"></span>'; }
      else h += '<div class="nieuw" style="left:' + X(T.pos(van)) + 'px"><span>' + esc(T.datumTekst(van)) + '</span><i></i><em></em></div>';
    }
    vp.innerHTML = h;
    /* in woorden: na wat en voor wat */
    var tekst = '';
    if (van){
      var p = T.pos(van), voor = null, na = null;
      anderen.filter(function(x){ return x.soort !== 'p'; }).forEach(function(x){ var q = T.pos(x.van); if (q <= p && (!voor || q > T.pos(voor.van))) voor = x; if (q > p && (!na || q < T.pos(na.van))) na = x; });
      tekst = voor && na ? 'Na "' + voor.titel + '" en voor "' + na.titel + '".' : voor ? 'Na "' + voor.titel + '": het laatste op je tijdlijn.' : na ? 'Voor "' + na.titel + '": het eerste op je tijdlijn.' : 'Het eerste op je tijdlijn.';
      if (w.it.soort === 'p' && tot && T.posEind(tot) < T.posBegin(van)) tekst = 'Let op: het eind ligt voor het begin. Ik draai ze om.';
    } else tekst = 'Vul een jaartal in.';
    $('vpTekst').textContent = tekst;
  }
  function stapKlopt(){
    var it = w.it;
    if (w.stap === 1){
      it.titel = ($('stTitel').value || '').trim();
      if (!it.titel) return 'Geef het eerst een korte naam.';
      if (!it.cat) return 'Kies wat voor ' + (it.soort === 'p' ? 'periode' : 'gebeurtenis') + ' het is. Weet je het niet? Kies Iets anders.';
    }
    if (w.stap === 2){
      var van = veldDatum(w.van);
      if (!van) return it.soort === 'p' ? 'Vul in welk jaar de periode begon.' : 'Vul een jaartal in.';
      if (+String(w.van.j).replace(/\D/g, '') > 2100 && !w.van.vc) return 'Dat jaartal ligt ver in de toekomst. Klopt het?';
      if (w.van.d && !w.van.m) return 'Kies ook de maand, of laat de dag leeg.';
      it.van = van;
      if (it.soort === 'p'){
        var tot = veldDatum(w.tot);
        if (!tot) return 'Vul in tot welk jaar de periode duurde.';
        if (T.posEind(tot) < T.posBegin(van)){ var x = van; van = tot; tot = x; it.van = van; }
        it.tot = tot;
      }
    }
    if (w.stap === 3){
      VRAGEN.forEach(function(q){ var el = $('stapInhoud').querySelector('[data-wveld="' + q.k + '"]'); if (el) it[q.k] = el.value.trim(); });
      if (it.foto) it.foto.bron = $('stBron').value.trim();
    }
    return '';
  }
  function stapVerder(){
    var fout = stapKlopt();
    $('stapMelding').textContent = fout;
    if (fout) return;
    if (w.stap < stapAantal()){ w.stap++; tekenStap(); setTimeout(function(){ var f = $('stapInhoud').querySelector('input, textarea'); if (f) f.focus(); }, 30); return; }
    /* klaar: op de tijdlijn */
    var schoon = T.schoonItem(Object.assign({}, w.it, { id: w.bewerk || T.nieuwId() }));
    if (w.bewerk){ st.m.items = st.m.items.map(function(x){ return x.id === w.bewerk ? Object.assign({}, x, { titel: schoon.titel, cat: schoon.cat, van: schoon.van, tot: schoon.tot }) : x; }); }
    else st.m.items.push(schoon);
    $('dlgNieuw').close();
    bewaar();
    /* past het nieuwe ding niet meer in de zoom, dan weer passend maken */
    st.ppj = null;
    teken();
    toast(w.bewerk ? 'Veranderd' : 'Staat op je tijdlijn');
    var id = schoon.id, el = $('tlVlak').querySelector('[data-id="' + id + '"]');
    if (el){ el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); el.classList.add('tl-goedflits'); el.focus({ preventScroll: true }); }
    w = null;
  }
  $('frmNieuw').addEventListener('submit', function(e){ e.preventDefault(); stapVerder(); });
  $('stapTerug').addEventListener('click', function(){ if (w.stap === 3) stapKlopt(); w.stap = Math.max(1, w.stap - 1); $('stapMelding').textContent = ''; tekenStap(); });
  $('dlgDicht').addEventListener('click', function(){ $('dlgNieuw').close(); });
  $('stapInhoud').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b || !w) return;
    if (b.hasAttribute('data-soort')){ w.it.soort = b.getAttribute('data-soort'); w.it.titel = $('stTitel').value; tekenStap(); return; }
    if (b.hasAttribute('data-cat')){ w.it.cat = b.getAttribute('data-cat'); w.it.titel = $('stTitel').value; tekenStap(); $('stTitel').focus(); return; }
    if (b.hasAttribute('data-vc')){ var v = w[b.getAttribute('data-dv')]; v.vc = b.getAttribute('data-vc') === '1'; b.parentNode.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed', x === b); }); tekenVoorproef(); return; }
    if (b.hasAttribute('data-start')){ zetStarter(b); return; }
    if (b.id === 'stFoto'){ kiesFoto(function(src){ stapKlopt(); w.bron = $('stBron') ? $('stBron').value : ''; w.it.foto = { src: src, bron: w.bron }; tekenStap(); }); return; }
    if (b.id === 'stFotoWeg'){ stapKlopt(); delete w.it.foto; tekenStap(); return; }
    if (b.id === 'stLees'){ lees(w.it.titel + '. ' + VRAGEN.map(function(q){ return q.v; }).join(' ')); return; }
  });
  $('stapInhoud').addEventListener('input', function(e){
    var el = e.target, wie = el.getAttribute('data-dv');
    if (wie){ w[wie][el.getAttribute('data-dk')] = el.value; if (el.getAttribute('data-dk') === 'm' || el.getAttribute('data-dk') === 'd') w.meer = true; tekenVoorproef(); }
  });
  $('stapInhoud').addEventListener('change', function(e){ var el = e.target, wie = el.getAttribute('data-dv'); if (wie){ w[wie][el.getAttribute('data-dk')] = el.value; tekenVoorproef(); } });
  function zetStarter(b){
    var t = $(b.getAttribute('data-voor')); if (!t) return;
    var s = b.getAttribute('data-start');
    t.value = (t.value.trim() ? t.value.trim() + ' ' : '') + s.replace(/^ /, '');
    t.focus(); t.setSelectionRange(t.value.length, t.value.length);
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* ---------- klikken op de tijdlijn ---------- */
  $('tlVlak').addEventListener('click', function(e){
    if (sleep.verschoven) return;
    var a = e.target.closest('[data-actie]'); if (a){ if (a.getAttribute('data-actie') === 'nieuwG') openStappen('g'); return; }
    var el = e.target.closest('[data-id]');
    if (st.opdrKeuze && !el){ legNeer(st.opdrKeuze, e.clientX); return; }
    if (el) openPop(el.getAttribute('data-id'));
  });
  $('volgLijst').addEventListener('click', function(e){ var b = e.target.closest('[data-id]'); if (b) openPop(b.getAttribute('data-id')); });
  $('lijstWeergave').addEventListener('click', function(e){ var b = e.target.closest('[data-id]'); if (b) openPop(b.getAttribute('data-id')); });
  document.addEventListener('click', function(e){
    if (!pop || pop.hidden) return;
    var b = e.target.closest('[data-pop]');
    if (b && pop.contains(b)){ popActie(b.getAttribute('data-pop'), b); return; }
    var s = e.target.closest('[data-start]');
    if (s && pop.contains(s)){ zetStarter(s); return; }
    if (!pop.contains(e.target) && !e.target.closest('[data-id]') && !e.target.closest('dialog') && !e.target.closest('#fotoIn')) sluitPop();
  });
  document.addEventListener('input', function(e){
    if (!pop || pop.hidden || !pop.contains(e.target) || st.alleenLezen) return;
    var it = itemVan(pop.getAttribute('data-id')), k = e.target.getAttribute('data-veld'); if (!it || !k) return;
    if (k === 'bron'){ if (it.foto) it.foto.bron = e.target.value; }
    else if (k === 'kaart') it.kaart = e.target.checked;
    else it[k] = e.target.value;
    bewaar();
    clearTimeout(document._tlT);
    document._tlT = setTimeout(function(){ tekenVolg(); tekenOnder(); var el = $('tlVlak').querySelector('.tl-kaart[data-id="' + it.id + '"]'); if (el) el.classList.toggle('zonder-uitleg', !heeftUitleg(it)); }, 250);
  });
  document.addEventListener('change', function(e){ if (pop && !pop.hidden && pop.contains(e.target) && e.target.getAttribute('data-veld') === 'kaart'){ var it = itemVan(pop.getAttribute('data-id')); if (it){ it.kaart = e.target.checked; bewaar(); } } });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && pop && !pop.hidden && !document.querySelector('dialog[open]')){ sluitPop(pop.getAttribute('data-id')); } });
  document.addEventListener('dragover', function(e){ if (pop && !pop.hidden && pop.contains(e.target)) e.preventDefault(); });
  document.addEventListener('drop', function(e){
    if (!pop || pop.hidden || !pop.contains(e.target) || st.alleenLezen) return;
    e.preventDefault();
    var f = e.dataTransfer.files && e.dataTransfer.files[0], it = itemVan(pop.getAttribute('data-id'));
    if (f && it) verwerkFoto(f, function(src){ it.foto = { src: src, bron: (it.foto && it.foto.bron) || '' }; bewaar(); tekenLijn(doelMaken()); tekenVolg(); vulPop(it, popDoel); plaatsPop(); });
  });
  window.addEventListener('resize', function(){ if (!st.m || $('schMaken').hidden) return; clearTimeout(window._tlR); window._tlR = setTimeout(function(){ if (!st.ppj) teken(); else plaatsPop(); }, 150); });

  /* slepen om te schuiven */
  var sleep = { aan: false, x: 0, s: 0, verschoven: false };
  $('tlScroll').addEventListener('pointerdown', function(e){
    if (e.button !== 0 || e.target.closest('button,[data-id],a,input')) return;
    sleep = { aan: true, x: e.clientX, s: this.scrollLeft, verschoven: false };
  });
  window.addEventListener('pointermove', function(e){
    if (!sleep.aan) return;
    var dx = e.clientX - sleep.x;
    if (Math.abs(dx) > 4){ sleep.verschoven = true; $('tlScroll').classList.add('sleept'); }
    if (sleep.verschoven) $('tlScroll').scrollLeft = sleep.s - dx;
  });
  window.addEventListener('pointerup', function(){ if (!sleep.aan) return; sleep.aan = false; $('tlScroll').classList.remove('sleept'); setTimeout(function(){ sleep.verschoven = false; }, 0); });
  $('tlScroll').addEventListener('scroll', function(){ if (pop && !pop.hidden) plaatsPop(); });

  /* zoomen */
  function zoom(f){
    if (!st.L) return;
    var sc = $('tlScroll'), midden = (sc.scrollLeft + sc.clientWidth / 2) / st.L.breed;
    var nu = st.ppj || st.pas, nieuwPpj = Math.max(st.pas, Math.min(nu * f, 2400));
    st.ppj = Math.abs(nieuwPpj - st.pas) < 1e-9 ? null : nieuwPpj;
    teken();
    sc.scrollLeft = midden * st.L.breed - sc.clientWidth / 2;
  }
  $('zoomIn').addEventListener('click', function(){ zoom(1.6); });
  $('zoomUit').addEventListener('click', function(){ zoom(1 / 1.6); });
  $('zoomPas').addEventListener('click', function(){ st.ppj = null; teken(); });

  /* ---------- titel, naam, knoppen ---------- */
  $('titelIn').addEventListener('input', function(){ st.m.titel = this.value; bewaar(); });
  $('titelIn').addEventListener('blur', function(){ if (!this.value.trim()){ this.value = 'Mijn tijdlijn'; st.m.titel = this.value; bewaar(); } });
  $('naamIn').addEventListener('input', function(){ st.m.naam = this.value; bewaar(); tekenOnder(); });
  $('nieuwG').addEventListener('click', function(){ openStappen('g'); });
  $('nieuwP').addEventListener('click', function(){ openStappen('p'); });
  $('wTijdlijn').addEventListener('click', function(){ zetWeergave('tijdlijn'); });
  $('wLijst').addEventListener('click', function(){ zetWeergave('lijst'); });
  $('eenvoudig').addEventListener('change', function(){ zetEenvoudig(this.checked, true); st.ppj = null; teken(); });
  $('naarStart').addEventListener('click', function(){ bewaarNu(); st.m = null; tekenStart(); toon('schStart'); });
  $('pdfUit').addEventListener('click', function(){ download(st.m); });

  function download(m){
    try {
      var bytes = P.maak(m), blob = new Blob([bytes], { type: 'application/pdf' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (m.titel || 'tijdlijn').replace(/[\\\/:*?"<>|]+/g, '').trim().slice(0, 60) + (m.naam ? ' - ' + m.naam.replace(/[\\\/:*?"<>|]+/g, '').trim().slice(0, 40) : '') + '.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
      toast('PDF gedownload. Je kunt hem hier later weer openen.');
    } catch (e){ toast('De PDF lukte niet. Probeer het nog eens.'); if (window.console) console.error(e); }
  }

  /* ---------- PDF openen: een om verder te werken, meer tegelijk om door te bladeren ---------- */
  $('rtOpen').addEventListener('click', function(){ $('pdfIn').value = ''; $('pdfIn').click(); });
  $('pdfIn').addEventListener('change', function(){
    var files = Array.prototype.slice.call(this.files || []);
    if (!files.length) return;
    Promise.all(files.map(function(f){ return f.arrayBuffer().then(function(buf){ return { naam: f.name, m: P.lees(new Uint8Array(buf)) }; }); })).then(function(res){
      var goed = res.filter(function(r){ return r.m; }), mis = res.length - goed.length;
      if (!goed.length){ toast(res.length === 1 ? 'Dit is geen PDF van de Tijdlijnmaker.' : 'Geen van deze bestanden is een PDF van de Tijdlijnmaker.'); return; }
      if (goed.length === 1 && res.length === 1){
        var m = goed[0].m, bestaat = laad(m.id);
        if (bestaat && !confirm('Je hebt deze tijdlijn al in deze browser. Wil je hem vervangen door de versie uit de PDF?')) m.id = T.nieuwId();
        st.alleenLezen = false; open(m); bewaarNu(); toast('Geopend. Je kunt verder werken.');
        return;
      }
      openKlasset(goed.map(function(r){ return { naam: r.m.naam || r.naam.replace(/\.pdf$/i, ''), m: r.m }; }), 'pdf');
      if (mis) toast(mis + (mis === 1 ? ' bestand is' : ' bestanden zijn') + ' geen PDF van de Tijdlijnmaker en ' + (mis === 1 ? 'is' : 'zijn') + ' overgeslagen.');
    });
  });

  /* ---------- het voorbeeld ---------- */
  function voorbeeld(){
    return { id: 'voorbeeld', titel: 'Nederland tussen twee wereldoorlogen', naam: 'Voorbeeld', items: [
      { id: 'v1', soort: 'g', titel: 'Het leger wordt gemobiliseerd', van: { j: 1914, m: 8, d: 1 }, cat: 'oorlog', wat: 'Nederland riep alle soldaten op, voor het geval het land werd aangevallen.', waarom: 'In Europa begon de Eerste Wereldoorlog. Nederland wilde neutraal blijven, maar wel klaar zijn.' },
      { id: 'v2', soort: 'g', titel: 'Kiesrecht voor alle mannen', van: { j: 1917 }, cat: 'politiek', wat: 'Alle mannen vanaf 25 jaar mochten stemmen.', waarom: 'Socialisten en liberalen streden daar al lang voor.', gevolg: 'De politiek veranderde: grote partijen voor arbeiders en geloven kregen meer macht.' },
      { id: 'v3', soort: 'g', titel: 'Kiesrecht voor vrouwen', van: { j: 1919 }, cat: 'politiek', wat: 'Ook vrouwen mochten vanaf nu stemmen.', gevolg: 'In 1922 stemden vrouwen voor het eerst.' },
      { id: 'v4', soort: 'g', titel: 'Beurskrach in New York', van: { j: 1929, m: 10, d: 24 }, cat: 'economie', wat: 'Aandelen werden in een paar dagen veel minder waard.', gevolg: 'Er kwam een crisis over de hele wereld. Ook in Nederland raakten veel mensen hun werk kwijt.' },
      { id: 'v5', soort: 'g', titel: 'De Afsluitdijk is klaar', van: { j: 1932, m: 5, d: 28 }, cat: 'techniek', wat: 'De Zuiderzee werd afgesloten met een dijk van 32 kilometer.', waarom: 'Het land moest beter beschermd worden tegen het water, en er kwam nieuw land bij.' },
      { id: 'v6', soort: 'g', titel: 'Duitsland valt Nederland binnen', van: { j: 1940, m: 5, d: 10 }, cat: 'oorlog', wat: 'Het Duitse leger viel Nederland aan.', gevolg: 'Na vijf dagen gaf Nederland zich over.' },
      { id: 'v7', soort: 'g', titel: 'Bombardement op Rotterdam', van: { j: 1940, m: 5, d: 14 }, cat: 'oorlog', wat: 'Duitse vliegtuigen gooiden bommen op het centrum van Rotterdam.', waarom: 'Duitsland wilde dat Nederland zich snel overgaf.', gevolg: 'Een dag later gaf Nederland zich over.' },
      { id: 'v8', soort: 'g', titel: 'Februaristaking', van: { j: 1941, m: 2, d: 25 }, cat: 'mensen', wat: 'In Amsterdam legden duizenden mensen het werk neer.', waarom: 'Ze protesteerden tegen de razzia\'s waarbij Joodse mannen werden opgepakt.', gevolg: 'De Duitsers sloegen de staking na twee dagen hard neer.' },
      { id: 'v9', soort: 'g', titel: 'Bevrijding', van: { j: 1945, m: 5, d: 5 }, cat: 'oorlog', wat: 'De Duitse soldaten in Nederland gaven zich over.' },
      { id: 'p1', soort: 'p', titel: 'Eerste Wereldoorlog', van: { j: 1914, m: 7 }, tot: { j: 1918, m: 11 }, cat: 'oorlog', wat: 'Een grote oorlog in Europa. Nederland deed niet mee.' },
      { id: 'p2', soort: 'p', titel: 'Crisisjaren', van: { j: 1929 }, tot: { j: 1939 }, cat: 'economie', wat: 'Jaren met weinig werk en veel armoede.' },
      { id: 'p3', soort: 'p', titel: 'Duitse bezetting', van: { j: 1940, m: 5, d: 15 }, tot: { j: 1945, m: 5, d: 5 }, cat: 'oorlog', wat: 'Nederland werd bestuurd door Duitsland.' },
      { id: 'p4', soort: 'p', titel: 'Hongerwinter', van: { j: 1944, m: 11 }, tot: { j: 1945, m: 5 }, cat: 'mensen', wat: 'In het westen van Nederland was bijna geen eten.' }
    ] };
  }
  $('rtVoorbeeld').addEventListener('click', function(){ open(voorbeeld(), true); voorbeeldBalk(); });
  function voorbeeldBalk(){
    $('opdrVak').hidden = false;
    $('opdrVak').innerHTML = '<div class="tl-opdrbalk" style="margin:0"><span class="hand">voorbeeld</span><b>Klik op een stip of kaartje om de uitleg te lezen.</b><button type="button" class="tl-knop" id="vbKopie">Maak er een eigen kopie van</button></div>';
    $('vbKopie').addEventListener('click', function(){ var m = voorbeeld(); m.id = T.nieuwId(); m.naam = ''; m.titel = 'Nederland tussen twee wereldoorlogen'; st.alleenLezen = false; open(m); bewaarNu(); toast('Dit is nu jouw tijdlijn. Verander maar wat je wilt.'); });
  }

  /* ---------- beginnen: knoppen ---------- */
  $('rtNieuw').addEventListener('click', function(){ nieuw(); });
  $('mijnLijst').addEventListener('click', function(e){
    var o = e.target.closest('[data-open]'), d = e.target.closest('[data-weg]');
    if (d){ var id = d.getAttribute('data-weg'), x = lijst().filter(function(y){ return y.id === id; })[0]; if (x && confirm('"' + x.titel + '" weghalen uit deze browser? Heb je geen PDF, dan ben je hem kwijt.')){ verwijder(id); tekenStart(); toast('Weggehaald'); } return; }
    if (o){ var m = laad(o.getAttribute('data-open')); if (m){ st.alleenLezen = false; open(m); } else toast('Deze tijdlijn kan ik niet meer openen.'); }
  });
  $('tvKnoppen').addEventListener('click', function(e){
    var b = e.target.closest('[data-tv]'); if (!b) return;
    var t = T.TIJDVAKKEN[+b.getAttribute('data-tv') - 1];
    nieuw({ titel: t.naam, tijdvak: t.nr, bereik: { van: Math.max(t.van, -5000), tot: Math.min(t.tot, new Date().getFullYear() + 1) } });
  });

  /* ---------- inleveren bij de klas ---------- */
  function sid(){ return window.KLAS ? KLAS.sid() : ''; }
  $('inlever').addEventListener('click', function(){
    var k = window.KLAS && KLAS.lees(), h = '';
    var mist = T.checklijst(st.m).filter(function(c){ return !c.ok; });
    if (k) h += '<p style="margin:0 0 10px;font-size:1.02rem">Je levert <b>' + esc(st.m.titel) + '</b> in bij klas <b>' + esc(k.code) + '</b> als <b>' + esc(st.m.naam || k.naam) + '</b>.</p><p style="margin:0;color:var(--muted);font-size:.92rem">Daarna kun je gewoon verder werken. Lever je opnieuw in, dan ziet je docent de nieuwste versie.</p>';
    else h += '<p style="margin:0 0 12px">Vul de klascode van je docent in. Die heeft vier letters.</p><div style="display:grid;grid-template-columns:140px minmax(0,1fr);gap:12px"><label class="tl-veld">Klascode<input class="tl-in" id="inlCode" maxlength="4" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;font-weight:600;letter-spacing:.12em"></label><label class="tl-veld">Je naam<input class="tl-in" id="inlNaam" maxlength="16" value="' + esc((st.m.naam || '').slice(0, 16)) + '"></label></div>';
    if (mist.length) h += '<div style="margin-top:14px;padding:12px 14px;border-radius:14px;background:var(--kaart2)"><b style="font-size:.92rem">Nog niet helemaal af:</b><ul style="margin:6px 0 0;padding-left:1.1em;font-size:.9rem">' + mist.map(function(c){ return '<li>' + esc(c.tekst) + '</li>'; }).join('') + '</ul><span style="font-size:.86rem;color:var(--muted)">Je mag toch inleveren.</span></div>';
    $('inlInhoud').innerHTML = h; $('inlMelding').textContent = ''; $('inlKnop').disabled = false; $('inlKnop').textContent = 'Lever in';
    $('dlgInlever').showModal();
    setTimeout(function(){ var f = $('inlCode') || $('inlKnop'); f.focus(); }, 30);
  });
  $('frmInlever').addEventListener('submit', function(e){
    e.preventDefault();
    var k = window.KLAS && KLAS.lees();
    if (!k){
      var code = ($('inlCode').value || '').toUpperCase().replace(/[^A-Z]/g, ''), naam = ($('inlNaam').value || '').trim();
      if (code.length !== 4){ $('inlMelding').textContent = 'Een klascode heeft vier letters.'; $('inlCode').focus(); return; }
      if (!naam){ $('inlMelding').textContent = 'Vul je naam in, zodat je docent weet van wie het is.'; $('inlNaam').focus(); return; }
      k = { code: code, naam: naam, nieuw: true };
    }
    $('inlKnop').disabled = true; $('inlKnop').textContent = 'Bezig…'; $('inlMelding').textContent = '';
    bewaarNu();
    var naamNu = st.m.naam || k.naam;
    fetch('/api/klas/' + k.code + '/tijdlijn/inlever', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sid: sid(), naam: naamNu.slice(0, 16), model: st.m, vak: 'ges' }) })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return { s: r.status, j: j }; }); })
      .then(function(r){
        if (r.s === 200 && r.j.ok){
          if (k.nieuw && window.KLAS) KLAS.zet(k.code, k.naam);
          lsSet('tl-inl-' + st.m.id, JSON.stringify({ t: r.j.t || Date.now(), code: k.code }));
          $('dlgInlever').close();
          $('status').textContent = 'Ingeleverd om ' + tijdTekst(r.j.t || Date.now());
          toast('Ingeleverd bij klas ' + k.code + '. Je docent kan hem nu bekijken.');
          return;
        }
        $('inlKnop').disabled = false; $('inlKnop').textContent = 'Probeer opnieuw';
        $('inlMelding').textContent = r.s === 404 ? 'Die klascode bestaat niet. Kijk nog eens goed.' : r.s === 410 ? 'Deze klascode is opgeheven. Vraag je docent om een nieuwe.' : r.s === 413 ? (r.j.fout || 'Je tijdlijn is te groot. Haal een paar afbeeldingen weg.') : r.s === 429 ? (r.j.fout === 'deze klas zit vol' ? 'Deze klas zit vol. Vraag het je docent.' : 'Even wachten en dan opnieuw proberen.') : (r.j.fout ? 'Het lukte niet: ' + r.j.fout + '.' : 'Het lukte niet. Probeer het zo nog eens.');
      })
      .catch(function(){ $('inlKnop').disabled = false; $('inlKnop').textContent = 'Probeer opnieuw'; $('inlMelding').textContent = 'Geen verbinding. Probeer het zo nog eens; je tijdlijn is wel bewaard in deze browser.'; });
  });
  document.querySelectorAll('[data-sluit]').forEach(function(b){ b.addEventListener('click', function(){ b.closest('dialog').close(); }); });

  /* ---------- docent: klassen, ingeleverd werk, opdracht maken ---------- */
  function docentKlassen(){ try { var k = JSON.parse(lsGet('lg-klas-docent') || '[]'); return Array.isArray(k) ? k.filter(function(x){ return x && /^[A-Z]{4}$/.test(x.code) && x.sleutel; }) : []; } catch (e){ return []; } }
  $('rtKlas').addEventListener('click', function(){
    var kl = docentKlassen(); if (!kl.length) return;
    if (kl.length === 1) haalKlas(kl[0]);
    else {
      $('opdrInhoud').innerHTML = '<p style="margin:0 0 10px">Van welke klas wil je het ingeleverde werk zien?</p><div style="display:grid;gap:8px">' + kl.map(function(k, i){ return '<button type="button" class="tl-knop" data-kl="' + i + '" style="justify-content:flex-start">' + esc(k.naam || k.code) + ' <small style="color:var(--muted);font-weight:400">' + esc(k.code) + '</small></button>'; }).join('') + '</div>';
      $('opdrKop').textContent = 'Ingeleverd werk'; $('opdrKnop').hidden = true; $('opdrMelding').textContent = '';
      $('dlgOpdr').showModal();
    }
  });
  $('opdrInhoud').addEventListener('click', function(e){ var b = e.target.closest('[data-kl]'); if (b){ $('dlgOpdr').close(); haalKlas(docentKlassen()[+b.getAttribute('data-kl')]); } });
  function haalKlas(k){
    toast('Even ophalen…');
    fetch('/api/klas/' + k.code + '/tijdlijn/lijst', { headers: { 'x-sleutel': k.sleutel } }).then(function(r){ return r.json(); }).then(function(j){
      var l = (j && j.tijdlijnen) || [];
      if (!l.length){ toast('Klas ' + (k.naam || k.code) + ' heeft nog niets ingeleverd.'); return; }
      openKlasset(l.map(function(x){ return { naam: x.naam, sid: x.sid, titel: x.titel, t: x.t, items: x.items, klas: k }; }), 'klas');
    }).catch(function(){ toast('Ophalen lukte niet. Probeer het zo nog eens.'); });
  }
  $('opdrMaak').addEventListener('click', function(){
    var kaarten = st.m.items.filter(function(it){ return it.kaart; }).length, kl = docentKlassen();
    $('opdrKop').textContent = 'Maak er een opdracht van'; $('opdrKnop').hidden = false; $('opdrKnop').disabled = false; $('opdrMelding').textContent = '';
    var over = new Date(Date.now() + 7 * 864e5), iso = over.toISOString().slice(0, 10);
    $('opdrInhoud').innerHTML = (kaarten ? '<p style="margin:0 0 12px">Leerlingen krijgen deze tijdlijn. <b>' + kaarten + (kaarten === 1 ? ' kaartje' : ' kaartjes') + '</b> leggen ze zelf op de goede plek; de rest staat er al op. Daarna schrijven ze uitleg en leveren ze in.</p>' :
      '<p style="margin:0 0 12px;padding:12px 14px;border-radius:14px;background:var(--kaart2)"><b>Kies eerst de kaartjes.</b> Klik op een gebeurtenis en zet het vinkje "Kaartje" aan. Die leggen leerlingen zelf op de goede plek.</p>') +
      '<div style="display:grid;gap:12px"><label class="tl-veld">Voor welke klas?<select class="tl-in" id="opKlas">' + kl.map(function(k, i){ return '<option value="' + i + '">' + esc(k.naam || k.code) + ' (' + esc(k.code) + ')</option>'; }).join('') + '</select></label>' +
      '<label class="tl-veld">Wat moeten ze doen?<textarea class="tl-in" id="opTekst" maxlength="400" rows="3">Zet de kaartjes op de goede plek. Schrijf daarna bij drie gebeurtenissen wat er gebeurde en waarom.</textarea></label>' +
      '<label class="tl-veld">Inleveren voor<input class="tl-in" type="date" id="opTot" value="' + iso + '" style="max-width:220px"></label></div>';
    $('opdrKnop').disabled = !kaarten;
    $('dlgOpdr').showModal();
  });
  $('frmOpdr').addEventListener('submit', function(e){
    e.preventDefault();
    if ($('opdrKnop').hidden) return;
    var k = docentKlassen()[+$('opKlas').value], tekst = $('opTekst').value.trim(), tot = new Date($('opTot').value + 'T23:59:00').getTime();
    if (!k){ $('opdrMelding').textContent = 'Kies een klas.'; return; }
    if (!isFinite(tot) || tot < Date.now()){ $('opdrMelding').textContent = 'Kies een datum in de toekomst.'; return; }
    $('opdrKnop').disabled = true; $('opdrKnop').textContent = 'Bezig…';
    var start = JSON.parse(JSON.stringify(st.m));
    start.items.forEach(function(it){ ['wat', 'waarom', 'gevolg'].forEach(function(x){ if (it.kaart) delete it[x]; }); });
    fetch('/api/klas/' + k.code + '/tijdlijn/startzet', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sleutel: k.sleutel, model: start, tekst: tekst }) })
      .then(function(r){ return r.json().then(function(j){ return { s: r.status, j: j }; }); })
      .then(function(r){
        if (r.s !== 200) throw new Error(r.j.fout || 'mislukt');
        return fetch('/api/klas/' + k.code + '/opdracht', { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sleutel: k.sleutel, opdracht: { spel: 'tijdlijn', vak: 'ges', min: 1, tot: tot, tekst: tekst.slice(0, 140), kz: 'tl=' + r.j.id, naam: 'Tijdlijn: ' + st.m.titel.slice(0, 70) } }) })
          .then(function(r2){ return r2.json().then(function(j2){ if (r2.status !== 200) throw new Error(j2.fout || 'mislukt'); }); });
      })
      .then(function(){ $('dlgOpdr').close(); $('opdrKnop').textContent = 'Zet klaar'; toast('De opdracht staat klaar in klas ' + (k.naam || k.code) + '.'); })
      .catch(function(err){ $('opdrKnop').disabled = false; $('opdrKnop').textContent = 'Zet klaar'; $('opdrMelding').textContent = 'Het lukte niet: ' + err.message + '.'; });
  });

  /* ---------- een klasset doorbladeren ---------- */
  var ksDoel = null;
  function openKlasset(lijstje, bron){
    st.klasset = lijstje.sort(function(a, b){ return String(a.naam).localeCompare(String(b.naam), 'nl'); }); st.ksI = 0; st.ksBron = bron;
    toon('schKlasset');
    $('ksStatus').textContent = lijstje.length + (lijstje.length === 1 ? ' tijdlijn' : ' tijdlijnen') + (bron === 'pdf' ? ' uit PDF\'s · niets wordt geupload' : ' ingeleverd in klas ' + (lijstje[0].klas.naam || lijstje[0].klas.code));
    if (!ksDoel){
      $('ksVak').innerHTML = '<section class="tl-paneel" aria-label="Tijdlijn"><div class="tl-lijnkop"><div><h2 id="ksTitel" style="margin:0;font-size:1.3rem"></h2><p id="ksSub" style="margin:2px 0 0;color:var(--muted);font-size:.9rem"></p></div></div><ul class="tl-legenda" id="ksLegenda"></ul><div class="tl-scroll" id="ksScroll"><div class="tl-vlak" id="ksVlak"></div></div></section>';
      ksDoel = { scroll: $('ksScroll'), vlak: $('ksVlak'), paneel: $('ksScroll').parentNode, model: null, verberg: {}, eigen: false };
      $('ksVlak').addEventListener('click', function(e){ var el = e.target.closest('[data-id]'); if (el) openPop(el.getAttribute('data-id'), ksDoel); });
    }
    tekenKlasset();
  }
  function tekenKlasset(){
    var l = st.klasset, x = l[st.ksI];
    $('ksNamen').innerHTML = l.map(function(y, i){ return '<li><button type="button" data-ks="' + i + '"' + (i === st.ksI ? ' aria-current="true"' : '') + '><span>' + esc(y.naam || 'Zonder naam') + '</span><small>' + (y.m ? y.m.items.length : y.items || 0) + '</small></button></li>'; }).join('');
    $('ksWie').textContent = (x.naam || 'Zonder naam') + ' · ' + (st.ksI + 1) + ' van ' + l.length;
    $('ksVorige').disabled = st.ksI === 0; $('ksVolgende').disabled = st.ksI === l.length - 1;
    if (pop) pop.hidden = true;
    if (x.m) return toonKs(x);
    $('ksTitel').textContent = 'Even ophalen…'; $('ksVlak').innerHTML = '';
    fetch('/api/klas/' + x.klas.code + '/tijdlijn/een?sid=' + encodeURIComponent(x.sid), { headers: { 'x-sleutel': x.klas.sleutel } }).then(function(r){ return r.json(); }).then(function(j){
      if (!j.model) throw new Error();
      x.m = j.model; if (st.klasset[st.ksI] === x) toonKs(x);
    }).catch(function(){ $('ksTitel').textContent = 'Deze tijdlijn kon ik niet ophalen.'; });
  }
  function toonKs(x){
    var m = x.m;
    $('ksTitel').textContent = m.titel;
    var goed = m.opdracht ? m.items.filter(function(it){ return it.kaart && m.opdracht.klaar[it.id]; }).length : 0, kaarten = m.items.filter(function(it){ return it.kaart; }).length;
    var metUitleg = m.items.filter(heeftUitleg).length;
    $('ksSub').textContent = [m.naam, m.items.length + ' op de tijdlijn', metUitleg + ' met uitleg', m.opdracht && kaarten ? goed + ' van ' + kaarten + ' kaartjes goed' : '', x.t ? 'ingeleverd om ' + tijdTekst(x.t) : ''].filter(Boolean).join(' · ');
    var gebruikt = {}; m.items.forEach(function(it){ gebruikt[it.cat] = true; });
    $('ksLegenda').innerHTML = T.SOORTEN.filter(function(s){ return gebruikt[s.id]; }).map(function(s){ return '<li class="cat-' + s.id + '"><i aria-hidden="true"></i>' + esc(s.naam) + '</li>'; }).join('');
    ksDoel.model = m; ksDoel.gekozen = null;
    var v = {}; if (m.opdracht) m.items.forEach(function(it){ if (it.kaart && !m.opdracht.klaar[it.id]) v[it.id] = true; }); ksDoel.verberg = v;
    tekenLijn(ksDoel);
  }
  $('ksNamen').addEventListener('click', function(e){ var b = e.target.closest('[data-ks]'); if (b){ st.ksI = +b.getAttribute('data-ks'); tekenKlasset(); } });
  $('ksVorige').addEventListener('click', function(){ if (st.ksI > 0){ st.ksI--; tekenKlasset(); } });
  $('ksVolgende').addEventListener('click', function(){ if (st.ksI < st.klasset.length - 1){ st.ksI++; tekenKlasset(); } });
  $('ksTerug').addEventListener('click', function(){ st.klasset = null; tekenStart(); toon('schStart'); });
  $('ksPdf').addEventListener('click', function(){ var x = st.klasset && st.klasset[st.ksI]; if (x && x.m) download(x.m); });
  document.addEventListener('keydown', function(e){
    if ($('schKlasset').hidden || document.querySelector('dialog[open]') || /input|textarea|select/i.test((e.target.tagName || ''))) return;
    if (e.key === 'ArrowRight' && st.ksI < st.klasset.length - 1){ st.ksI++; tekenKlasset(); }
    if (e.key === 'ArrowLeft' && st.ksI > 0){ st.ksI--; tekenKlasset(); }
  });

  /* ---------- opdracht van de docent: kaartjes op de goede plek ---------- */
  function parameters(){ var q = {}; location.search.replace(/^\?/, '').split('&').forEach(function(p){ if (!p) return; var i = p.indexOf('='); q[decodeURIComponent(i < 0 ? p : p.slice(0, i))] = i < 0 ? '' : decodeURIComponent(p.slice(i + 1)); }); return q; }
  function tekenOpdrBalk(){
    var q = parameters(), id = /^[a-z0-9]{4,12}$/.test(q.tl || '') ? q.tl : '', k = window.KLAS && KLAS.lees();
    if (!id){ $('opdrBalk').innerHTML = ''; return; }
    var al = lijst().map(function(x){ return laad(x.id); }).filter(function(m){ return m && m.opdracht && m.opdracht.code === id; })[0];
    $('opdrBalk').innerHTML = '<div class="tl-opdrbalk"><span class="hand">van je docent</span><b>' + (al ? esc(al.titel) : 'Een tijdlijnopdracht') + '</b>' +
      (k ? '<button type="button" class="tl-knop" id="opdrStart">' + (al ? 'Verder →' : 'Begin →') + '</button>' : '<span>Koppel eerst je klascode op de <a href="index.html">startpagina</a>.</span>') + '</div>';
    if (k) $('opdrStart').addEventListener('click', function(){ startOpdracht(id, al); });
  }
  function startOpdracht(id, al){
    if (al){ st.alleenLezen = false; open(al); return; }
    var k = KLAS.lees();
    $('opdrStart').disabled = true; $('opdrStart').textContent = 'Even ophalen…';
    fetch('/api/klas/' + k.code + '/tijdlijn/start?id=' + encodeURIComponent(id)).then(function(r){ return r.json().then(function(j){ return { s: r.status, j: j }; }); }).then(function(r){
      if (r.s !== 200 || !r.j.model) throw new Error(r.j.fout || 'mislukt');
      var m = r.j.model; m.id = T.nieuwId(); m.naam = k.naam; m.opdracht.code = id; m.gemaakt = Date.now();
      st.alleenLezen = false; open(m); bewaarNu();
    }).catch(function(e){ $('opdrStart').disabled = false; $('opdrStart').textContent = 'Probeer opnieuw'; toast('Ophalen lukte niet: ' + e.message + '.'); });
  }
  function tekenOpdracht(){
    var vak = $('opdrVak');
    if (st.m.id === 'voorbeeld' && st.alleenLezen) return;
    if (!st.m.opdracht){ vak.hidden = true; vak.innerHTML = ''; st.opdrKeuze = null; return; }
    var o = st.m.opdracht, kaarten = st.m.items.filter(function(it){ return it.kaart; }), open = kaarten.filter(function(it){ return !o.klaar[it.id]; });
    var goed = kaarten.length - open.length;
    var h = '<section class="tl-paneel" style="padding:16px 20px;display:grid;gap:12px" aria-labelledby="opdrTitel"><div class="tl-opdrkop"><div style="flex:1;min-width:220px"><span class="hand" style="font-size:1.3rem">opdracht van je docent</span><h2 id="opdrTitel" style="margin:2px 0 0;font-size:1.1rem">' + esc(o.tekst || 'Zet de kaartjes op de goede plek') + '</h2></div>' +
      '<div class="tl-voort">' + goed + ' van ' + kaarten.length + ' op hun plek <span aria-hidden="true"><i style="width:' + (kaarten.length ? Math.round(100 * goed / kaarten.length) : 0) + '%"></i></span></div>' +
      '<button type="button" class="tl-knop zacht klein" id="opdrLees">' + ICOON.luid + 'Voorlezen</button></div>';
    if (open.length){
      h += '<p style="margin:0;font-size:.95rem"><b>Sleep</b> een kaartje naar het jaar waarin het gebeurde. Lukt slepen niet? <b>Klik</b> op een kaartje en daarna op de tijdlijn.</p><div class="tl-stapel" id="stapel">' +
        open.map(function(it){ var hulp = o.hulp[it.id]; return '<button type="button" class="tl-stapelkaart" data-kaart="' + esc(it.id) + '" aria-pressed="' + (st.opdrKeuze === it.id) + '">' + ICOON.greep + '<span>' + esc(it.titel) + (hulp ? '<br><small style="color:var(--muted)">' + esc(T.jaarTekst(it.van.j)) + '</small>' : '') + '</span></button>'; }).join('') + '</div>';
      if (st.opdrKeuze){ var gk = itemVan(st.opdrKeuze); h += '<div style="display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap"><span style="font-size:.92rem">Klik op de tijdlijn waar <b>' + esc(gk ? gk.titel : '') + '</b> hoort, of typ het jaar:</span><label class="sronly" for="opdrJaar">Jaar</label><input class="tl-in" id="opdrJaar" inputmode="numeric" maxlength="5" style="width:110px" placeholder="jaar"><button type="button" class="tl-knop vol klein" id="opdrLeg">Leg neer</button></div>'; }
    } else h += '<p style="margin:0;font-size:1rem"><b>Alle kaartjes liggen goed.</b> Klik nu op de gebeurtenissen en schrijf erbij wat er gebeurde en waarom. Klaar? Lever in.</p>';
    h += '</section>';
    vak.innerHTML = h; vak.hidden = false;
    var lb = $('opdrLees'); if (lb) lb.addEventListener('click', function(){ lees((o.tekst || 'Zet de kaartjes op de goede plek.') + ' Nog op te leggen: ' + open.map(function(it){ return it.titel; }).join(', ') + '.'); });
    var leg = $('opdrLeg'); if (leg) leg.addEventListener('click', legMetJaar);
    var jr = $('opdrJaar'); if (jr) jr.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); legMetJaar(); } });
  }
  function legMetJaar(){
    var j = parseInt(($('opdrJaar').value || '').replace(/[^0-9-]/g, ''), 10);
    if (!j || !st.L){ toast('Typ een jaartal.'); return; }
    var x = st.L.X(T.pos({ j: j }));
    controleer(st.opdrKeuze, x, null);
  }
  function legNeer(id, clientX){
    if (!st.L) return;
    var r = $('tlVlak').getBoundingClientRect();
    controleer(id, clientX - r.left, clientX);
  }
  var hulpEl = null;
  function controleer(id, x, clientX){
    var it = itemVan(id), o = st.m.opdracht; if (!it || !o || !st.L) return;
    var uit = T.dichtBij(st.L, it, x);
    if (hulpEl){ hulpEl.remove(); hulpEl = null; }
    if (uit.goed){
      o.klaar[id] = true; st.opdrKeuze = null; bewaar(); teken();
      var el = $('tlVlak').querySelector('.tl-kaart[data-id="' + id + '"]');
      if (el){ el.classList.add('tl-goedflits'); el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      var over = st.m.items.filter(function(y){ return y.kaart && !o.klaar[y.id]; }).length;
      toast(over ? 'Goed! ' + it.titel + ' was ' + T.datumTekst(it.van) + '. Nog ' + over + ' te gaan.' : 'Goed! Alle kaartjes liggen op hun plek.');
      return;
    }
    o.pogingen[id] = (o.pogingen[id] || 0) + 1; bewaar();
    var dicht = Math.abs(uit.verschil) <= 10, keer = o.pogingen[id];
    var hint = uit.teVroeg ? 'Dit gebeurde later.' : 'Dit gebeurde eerder.';
    var uitleg = dicht ? 'Je zit er dichtbij: nog een klein stukje ' + (uit.teVroeg ? 'naar rechts.' : 'naar links.') : 'Kijk naar wat er al op je tijdlijn staat: gebeurde het daarvoor of daarna?';
    var paneel = $('tlScroll').parentNode, pr = paneel.getBoundingClientRect(), vr = $('tlVlak').getBoundingClientRect();
    hulpEl = document.createElement('div'); hulpEl.className = 'tl-hulp'; hulpEl.setAttribute('role', 'alert');
    hulpEl.innerHTML = '<b>Bijna! ' + hint + '</b><span>' + esc(uitleg) + '</span><div><button type="button" class="eerste" data-h="opnieuw">Probeer opnieuw</button>' + (keer >= 2 && !o.hulp[id] ? '<button type="button" data-h="jaar">Laat het jaar zien</button>' : '') + '</div>';
    var links = Math.max(8, Math.min(pr.width - 310, (vr.left - pr.left) + x + 14)), boven = Math.max(8, ($('tlScroll').getBoundingClientRect().top - pr.top) + 40);
    hulpEl.style.left = links + 'px'; hulpEl.style.top = boven + 'px';
    paneel.style.position = 'relative'; paneel.appendChild(hulpEl);
    hulpEl.querySelector('[data-h="opnieuw"]').focus();
    hulpEl.addEventListener('click', function(e){
      var b = e.target.closest('[data-h]'); if (!b) return;
      if (b.getAttribute('data-h') === 'jaar'){ o.hulp[id] = true; bewaar(); tekenOpdracht(); toast(it.titel + ': ' + T.jaarTekst(it.van.j)); }
      hulpEl.remove(); hulpEl = null;
      var kaart = document.querySelector('[data-kaart="' + id + '"]'); if (kaart) kaart.focus();
    });
  }
  /* slepen van een kaartje uit de stapel */
  var kaartSleep = null;
  $('opdrVak').addEventListener('pointerdown', function(e){
    var b = e.target.closest('[data-kaart]'); if (!b || e.button !== 0) return;
    kaartSleep = { id: b.getAttribute('data-kaart'), x0: e.clientX, y0: e.clientY, aan: false, el: null, mik: null, knop: b };
  });
  window.addEventListener('pointermove', function(e){
    if (!kaartSleep) return;
    if (!kaartSleep.aan && Math.hypot(e.clientX - kaartSleep.x0, e.clientY - kaartSleep.y0) > 6){
      kaartSleep.aan = true;
      var it = itemVan(kaartSleep.id);
      kaartSleep.el = document.createElement('div'); kaartSleep.el.className = 'tl-sleepkaart'; kaartSleep.el.textContent = it ? it.titel : '';
      document.body.appendChild(kaartSleep.el);
      kaartSleep.mik = document.createElement('div'); kaartSleep.mik.className = 'tl-mikpunt'; kaartSleep.mik.innerHTML = '<span></span>'; kaartSleep.mik.hidden = true;
      $('tlVlak').appendChild(kaartSleep.mik);
      if (hulpEl){ hulpEl.remove(); hulpEl = null; }
    }
    if (!kaartSleep.aan) return;
    e.preventDefault();
    kaartSleep.el.style.left = (e.clientX - 40) + 'px'; kaartSleep.el.style.top = (e.clientY - 24) + 'px';
    var r = $('tlScroll').getBoundingClientRect(), vr = $('tlVlak').getBoundingClientRect(), binnen = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 40 && e.clientY <= r.bottom + 20;
    kaartSleep.mik.hidden = !binnen || !st.L;
    if (binnen && st.L){ var x = e.clientX - vr.left; kaartSleep.mik.style.left = x + 'px'; kaartSleep.mik.firstChild.textContent = T.asTekst(T.posBijX(st.L, x)); }
    /* bij de rand vanzelf schuiven */
    var sc = $('tlScroll'); if (binnen){ if (e.clientX < r.left + 40) sc.scrollLeft -= 12; else if (e.clientX > r.right - 40) sc.scrollLeft += 12; }
  }, { passive: false });
  window.addEventListener('pointerup', function(e){
    if (!kaartSleep) return;
    var ks = kaartSleep; kaartSleep = null;
    if (!ks.aan){
      /* gewoon geklikt: kiezen, en daarna op de tijdlijn klikken */
      st.opdrKeuze = st.opdrKeuze === ks.id ? null : ks.id; tekenOpdracht();
      var k = document.querySelector('[data-kaart="' + ks.id + '"]'); if (k) k.focus();
      return;
    }
    ks.el.remove(); var mikZichtbaar = !ks.mik.hidden; ks.mik.remove();
    if (mikZichtbaar) legNeer(ks.id, e.clientX);
  });

  /* ---------- starten ---------- */
  var nv = lsGet('tl-eenvoudig');
  zetEenvoudig(nv === null ? lsGet('lg-niveau') === 'bb' : nv === '1', false);
  tekenStart();
  toon('schStart');
  /* een opdracht uit de klas: meteen beginnen als de leerling via de opdracht kwam */
  var q0 = parameters();
  if (q0.tl && q0.start === '1' && window.KLAS && KLAS.lees() && $('opdrStart')) $('opdrStart').click();
})();
