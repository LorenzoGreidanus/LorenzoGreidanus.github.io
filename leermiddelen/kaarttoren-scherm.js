/* Kaarttoren: het scherm. De regels staan in kaarttoren-motor.js; hier staan
   het startscherm, de vragen, de kaart van de toren, het gevecht, de
   tussenstops, de beloning en het eindscherm, plus het bewaren op dit
   apparaat en de speelbot voor de test.

   De beklimming (st) gaat na elke stap in localStorage (lg-kaarttoren-run-v1),
   zodat je na herladen verder kunt waar je was. De vragen komen uit bank.js,
   net als in Torenverdediging en Zwaardvechter.

   Testen: kaartBot.start(0.75) speelt vanzelf, met 75 procent goed; #testBot
   (of #testBot=0.9) in het adres start hem meteen. kaartBot.tempo is de tijd
   tussen twee stappen in ms. */
(function(){
  'use strict';
  var KT = window.KAARTTOREN, F = window.KT_FIGUUR;
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function lees(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e){ return null; } }
  function zet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e){} }
  function weg(k){ try { localStorage.removeItem(k); } catch (e){} }
  var RUN = 'lg-kaarttoren-run-v1', LAATST = 'lg-kaarttoren-laatst';
  var zacht = true;
  try { zacht = !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){}
  var raak = document.documentElement.classList.contains('raak');

  var st = null;                 /* de beklimming */
  var vak = '', niveau = 'kgt', keuze = {};
  var bezig = false;             /* de tegenstander is aan zet: even niets aanraken */
  var melding = '';              /* een regel voor het logregeltje bij het volgende scherm */

  /* ---------- vakken, niveaus en de kleuren ---------- */
  function kleurVan(c){
    var t = { 'var(--crab)':'#F26749', 'var(--deep-ocean)':'#204ECF', 'var(--butterscotch)':'#EA9836', 'var(--vista-blue)':'#83A5F2' };
    return t[c] || c;
  }
  /* wit of donkerblauw op een gekleurd vlak, net als in Torenverdediging */
  function inktOp(c){
    var v = kleurVan(c).replace('#', '');
    if (v.length !== 6) return '#fff';
    var d = [0, 2, 4].map(function(i){ var x = parseInt(v.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    var L = 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2];
    return 1.05 / (L + 0.05) >= (L + 0.05) / 0.0673 ? '#fff' : '#14224C';
  }
  function vakVan(id){ return VAKKEN.filter(function(v){ return v.id === id; })[0] || null; }
  function nivVan(id){ return NIVEAUS.filter(function(n){ return n.id === id; })[0] || null; }
  function vakNaam(id){ var v = vakVan(id); return v ? v.naam.toLowerCase() : 'vraag'; }
  var SOORTKLEUR = { aanval:'#F26749', verdediging:'#204ECF', speciaal:'#EA9836', rommel:'#8b95ad' };
  function kaartKleur(t){ if (t.vak){ var v = vakVan(t.vak); return v ? kleurVan(v.kleur) : '#6b3fa0'; } return SOORTKLEUR[t.soort] || '#6b3fa0'; }

  /* ---------- de vragen ---------- */
  var pot = null;
  var slim = Adaptief({ ladder:NIVEAUS.map(function(n){ return n.id; }), start:niveau,
    naam:function(id){ var n = nivVan(id); return n ? n.naam : id; }, wissel:function(){ pot = null; } });
  function vraagRang(){ var n = nivVan(slim.niveau()); return n ? n.rang : 2; }
  function nieuweVraag(){
    var r = vraagRang(), gekozen = keuze[vak] || [];
    if (vak === 'reken') return rekenVraag(r, gekozen);
    var bron = BRONNEN[vak] || [], nivo = NIVOS[vak] || [];
    if (!pot || !pot.length){
      var mag = function(i){ return !gekozen.length || gekozen.indexOf(bron[i].t) >= 0; };
      var alles = bron.map(function(q, i){ return i; }).filter(mag);
      /* eerst precies het niveau, dan ruimer, nooit boven je niveau tenzij de stapel bijna leeg is (zoals Torenverdediging) */
      var onder = r >= 4 ? r - 2 : r - 1;
      var ids = alles.filter(function(i){ return nivo[i] <= r && nivo[i] >= onder; });
      if (ids.length < 14) ids = alles.filter(function(i){ return nivo[i] <= r; });
      if (ids.length < 4) ids = alles.filter(function(i){ return nivo[i] <= r + 1; });
      if (!ids.length) ids = alles;
      pot = ids.sort(function(){ return Math.random() - 0.5; });
    }
    var q = bron[pot.pop()];
    if (!q) return rekenVraag(r, []);
    if (vak === 'ges'){
      var tv = TIJDVAKKEN.filter(function(t){ return t.id === q.t; })[0];
      var h = shuffleVraag(q); h.kop = tv ? 'tijdvak ' + tv.naam.replace(/^\d+ /, '') : (q.t || 'geschiedenis'); return h;
    }
    if (vak === 'eng' && /^woordjes /.test(q.t) && !/\?$/.test(q.v)){
      return shuffleVraag({ v:(q.t === 'woordjes NL naar EN' ? 'Hoe zeg je: ' : 'Wat betekent: ') + q.v + '?', o:q.o, g:q.g, u:q.u, t:q.t });
    }
    return shuffleVraag(q);
  }
  function beeldVoor(q){
    if (q.vlag && /^[a-z-]{2,8}$/.test(q.vlag)) return '<img class="vlagvak" src="vlaggen/' + q.vlag + '.svg" alt="Een vlag">';
    return q.svg || '';
  }
  /* De vraag in een plek op het scherm. o.antwoord(goed) draait meteen (de
     regels), o.klaar(goed) pas als de vraag weg mag: bij goed na een tel, bij
     fout pas na Volgende, zodat de uitleg blijft staan zolang jij wilt. */
  var huidig = null;
  function vraagIn(plek, o){
    var q = nieuweVraag(), h = { q:q, o:o, plek:plek, af:false };
    huidig = h;
    var od = vak === 'reken' ? (ONDERDELEN.reken || []).filter(function(x){ return x.id === q.t; })[0] : null;
    var kop = kopVoorVraag({ t:od ? od.naam : (q.kop || q.t), o:q.o }, vakNaam(vak));
    var beeld = beeldVoor(q);
    plek.innerHTML =
      '<div class="vraagpaneel">' +
        '<p class="vraagdoel">' + schoon(o.titel) + '</p>' +
        '<p class="vraagkop">' + schoon(kop) + '</p>' +
        (beeld ? '<div class="vraagbeeld">' + beeld + '</div>' : '') +
        '<p class="vraagtekst" id="vraagTekst">' + schoon(q.v) + '</p>' +
        '<div class="opties" id="opties">' + q.o.map(function(t, i){
          return '<button type="button" class="optie" data-i="' + i + '"><kbd aria-hidden="true">' + (i + 1) + '</kbd><span>' + schoon(t) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="terug" id="terug" role="status" aria-live="polite"></div>' +
        '<div class="volgenderij" id="volgendeRij" hidden><button type="button" class="volgendeknop" id="volgendeBtn">Volgende &rarr;</button>' +
          (raak ? '' : '<small>of druk op Enter</small>') + '</div>' +
        '<div id="meldPlek"></div>' +
      '</div>';
    plek.classList.remove('hide');
    Array.prototype.forEach.call(plek.querySelectorAll('.optie'), function(b){
      b.addEventListener('click', function(){ beantwoord(parseInt(b.getAttribute('data-i'), 10)); });
    });
    if (window.VOORLEES) VOORLEES.knop($('vraagTekst'), function(){ return { v:q.v, o:q.o, taal:vak === 'eng' ? 'en-GB' : 'nl-NL' }; });
    if (window.MELDING) MELDING.knop($('meldPlek'), function(){ return { spel:'kaarttoren', vraag:q.v, q:q, vak:vak, niveau:niveau }; });
    if (window.SPEL && SPEL.inBeeld) SPEL.inBeeld(plek);
    bot.wek();
  }
  function beantwoord(i){
    var h = huidig;
    if (!h || h.af || !h.q.o[i]) return;
    h.af = true;
    var q = h.q, goed = i === q.g;
    slim.toets(goed);
    if (st && window.KLAS) KLAS.tel(st.ui.od, q.t, goed);
    if (!goed && window.FOUTENMAP && vak && vak !== 'reken') FOUTENMAP.noteer(q, vak);
    if (!goed && window.KLAS && KLAS.fout) KLAS.fout(q, i, vak);
    Array.prototype.forEach.call(h.plek.querySelectorAll('.optie'), function(b, k){
      b.disabled = true;
      if (k === q.g){ b.classList.add('juist'); b.insertAdjacentHTML('beforeend', '<span class="merk" aria-label="goed">✓</span>'); }
      else if (k === i){ b.classList.add('mis'); b.insertAdjacentHTML('beforeend', '<span class="merk" aria-label="fout">✗</span>'); }
    });
    if (h.o.antwoord) h.o.antwoord(goed);
    var terug = $('terug');
    function verder(){ if (huidig !== h) return; huidig = null; clearTimeout(h.klok); h.o.klaar(goed); }
    if (goed){
      terug.className = 'terug goed';
      terug.innerHTML = '<b>Goed!</b> ' + schoon(h.o.goedTekst || '');
      h.klok = setTimeout(verder, h.o.snel ? 600 : 1100);
    } else {
      terug.className = 'terug fout';
      terug.innerHTML = '<b>Niet goed.</b> ' + (window.WAAROM ? WAAROM.html(q, i, schoon) : '') + 'Het goede antwoord is: <b>' + schoon(q.o[q.g]) + '</b>. ' + schoon(q.u || '') +
        (h.o.foutTekst ? '<span class="terugna">' + schoon(h.o.foutTekst) + '</span>' : '');
      var rij = $('volgendeRij'), knop = $('volgendeBtn');
      rij.hidden = false;
      knop.addEventListener('click', verder);
      try { knop.focus({ preventScroll:true }); } catch (e){ knop.focus(); }
      if (window.SPEL && SPEL.inBeeld) SPEL.inBeeld(rij);
    }
    bot.wek();
  }

  /* ---------- schermen ---------- */
  function toon(welk){
    ['start', 'spel', 'einde'].forEach(function(s){ $('scherm-' + s).classList.toggle('hide', s !== welk); });
    $('stopBtn').classList.toggle('hide', welk !== 'spel');
    if (welk !== 'spel') ademStop();
    scrollTo(0, 0);
  }
  function view(welk){
    ['vKaart', 'vStop', 'vGevecht', 'vBeloning'].forEach(function(v){ $(v).classList.toggle('hide', v !== welk); });
    if (welk !== 'vGevecht') ademStop();
  }
  function tekenBalk(){
    var f = st.fase === 'kaart' ? Math.min(KT.HOOG, st.rij + 2) : st.rij + 1;
    $('sbVerd').innerHTML = '<span class="ico ico-toren" aria-hidden="true"></span><span class="sb-lang">Verdieping </span>' + Math.max(1, f) + '<span class="sb-lang"> van </span><span class="sb-kort">/</span>' + KT.HOOG;
    $('sbHpGetal').textContent = st.hp + '/' + st.max;
    $('sbMunt').textContent = st.munten;
    $('sbStapel').textContent = st.stapel.length;
  }
  /* alles tekenen voor de fase waarin de beklimming staat */
  function tekenFase(){
    tekenBalk();
    if (st.fase === 'einde') return einde();
    if (st.fase === 'kaart') return tekenKaart();
    if (st.fase === 'stop') return tekenStop();
    if (st.fase === 'beloning') return tekenBeloning();
    if (st.fase === 'gevecht'){ view('vGevecht'); tekenGevecht(); if (st.g.fase === 'vraag') beurtVraag(); return; }
  }
  function bewaar(){
    if (!st) return;
    if (st.klaar){ weg(RUN); return; }
    zet(RUN, st);
  }

  /* ---------- de kaart van de toren ---------- */
  var STOPNAAM = { rust:'rustplek', winkel:'de schoolwinkel', gebeurtenis:'een gebeurtenis' };
  function kamerTekst(k){
    var d = KT.VIJANDEN[k.vijand];
    return { naam:d.naam, soort:k.soort === 'baas' ? 'baas' : k.soort === 'lastpak' ? 'lastpak: sterker, maar meer munten en een zeldzame kaart' : 'tegenstander',
             stop:k.stop ? 'eerst ' + STOPNAAM[k.stop] : '' };
  }
  function tekenKaart(){
    view('vKaart');
    var ks = KT.keuzes(st), f = st.rij + 2;
    $('kaartKop').textContent = f === 5 || f === 12 ? 'Verdieping ' + f + ': de baas' : 'Verdieping ' + f + ': kies je kamer';
    $('kaartUit').textContent = st.rij < 0 ? 'Onderaan de toren. Kies waar je begint; de lijnen op de kaart laten zien waar je daarna heen kunt.'
      : ks.length === 1 ? 'Er is maar een weg naar boven.' : 'Je kunt naar ' + ks.length + ' kamers. Kijk ook wat er daarna komt.';
    $('kamers').innerHTML = ks.map(function(x, n){
      var t = kamerTekst(x.kamer);
      return '<button type="button" class="kamerknop soort-' + x.kamer.soort + '" data-i="' + x.i + '">' +
        '<span class="kamerfig">' + F.mini(x.kamer.vijand) + '</span>' +
        '<span class="kamertekst"><b>' + schoon(t.naam) + '</b><small>' + schoon(t.soort) + '</small>' +
        (t.stop ? '<small class="stoplabel stop-' + x.kamer.stop + '">' + schoon(t.stop) + '</small>' : '') + '</span>' +
        (raak ? '' : '<kbd aria-hidden="true">' + (n + 1) + '</kbd>') + '</button>';
    }).join('');
    Array.prototype.forEach.call($('kamers').querySelectorAll('.kamerknop'), function(b){
      b.addEventListener('click', function(){ kiesKamer(parseInt(b.getAttribute('data-i'), 10)); });
    });
    $('torenplan').innerHTML = torenSvg();
    tekenBalk();
    bot.wek();
  }
  function kiesKamer(i){
    if (!KT.kiesKamer(st, i)) return;
    bewaar();
    melding = '';
    tekenFase();
    scrollTo(0, 0);
  }
  /* De toren als tekening: onderaan verdieping 1, bovenaan 12. De weg die je
     liep is dik, de kamers waar je nu heen kunt lichten op. */
  function torenSvg(){
    var R = st.kaart, H = KT.HOOG, dy = 46, top = 26, W = 300;
    function x(k){ return 60 + k.c * 90; }
    function y(r){ return top + (H - 1 - r) * dy; }
    var hoogte = top + (H - 1) * dy + 30, lijn = '', knoop = '';
    var open = KT.keuzes(st).map(function(k){ return k.i; });
    var gelopen = {}; st.pad.forEach(function(k, r){ gelopen[r + ':' + k] = true; });
    R.forEach(function(rij, r){
      if (r === H - 1) return;
      rij.forEach(function(k, i){
        k.naar.forEach(function(j){
          var n = R[r + 1][j], op = gelopen[r + ':' + i] && gelopen[(r + 1) + ':' + j];
          lijn += '<line x1="' + x(k) + '" y1="' + y(r) + '" x2="' + x(n) + '" y2="' + y(r + 1) + '" class="gang' + (op ? ' gelopen' : '') + '"/>';
        });
      });
    });
    R.forEach(function(rij, r){
      rij.forEach(function(k, i){
        var hier = st.rij === r && st.kol === i, kan = r === st.rij + 1 && open.indexOf(i) >= 0, was = gelopen[r + ':' + i];
        var rr = k.soort === 'baas' ? 18 : 14;
        knoop += '<g class="knoop ' + k.soort + (hier ? ' hier' : '') + (kan ? ' kan' : '') + (was ? ' was' : '') + (r > st.rij + 1 ? ' later' : '') + '" transform="translate(' + x(k) + ' ' + y(r) + ')">' +
          (kan ? '<circle r="' + (rr + 6) + '" class="gloed"/>' : '') +
          '<circle r="' + rr + '" class="rond"/>' +
          '<g transform="scale(' + (rr / 62).toFixed(3) + ')">' + F.teken(k.vijand, '') + '</g>' +
          (k.stop ? '<g transform="translate(' + (rr - 2) + ' ' + (-rr + 2) + ')"><circle r="7" class="stopbol stop-' + k.stop + '"/><text y="3.5" text-anchor="middle">' + (k.stop === 'rust' ? 'z' : k.stop === 'winkel' ? '€' : '?') + '</text></g>' : '') +
          '</g>';
      });
      knoop += '<text x="10" y="' + (y(r) + 4) + '" class="verdnr">' + (r + 1) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + hoogte + '" role="img" aria-label="De kaart van de toren">' + lijn + knoop + '</svg>' +
      '<p class="legenda"><span><i class="stopbol stop-rust">z</i> rustplek</span><span><i class="stopbol stop-winkel">€</i> winkel</span><span><i class="stopbol stop-gebeurtenis">?</i> gebeurtenis</span><span><i class="lp"></i> lastpak</span></p>';
  }

  /* ---------- een kaart tekenen ---------- */
  function kaartHtml(k, o){
    o = o || {};
    var t = KT.tekst(k, o.g, st ? st.reeks : 0), kleur = kaartKleur(t);
    var tekst = t.goed ? '<span class="kk-tekst"><span class="kk-goed">Goed: ' + schoon(t.goed) + '</span><span class="kk-fout">Fout: ' + schoon(t.fout) + '</span></span>'
                       : '<span class="kk-tekst">' + schoon(t.doe) + '</span>';
    var binnen = '<span class="kk-kop" style="--kk:' + kleur + ';--kkinkt:' + inktOp(kleur) + '"><span class="kk-kost" aria-hidden="true">' + t.kost + '</span>' +
        '<span class="kk-ico">' + F.kaartIcoon(t.soort, t.fig) + '</span></span>' +
      '<b class="kk-naam">' + schoon(t.naam) + '</b>' +
      (t.eerst ? '<span class="kk-eerst">' + schoon(t.eerst) + '</span>' : '') + tekst +
      (t.slim ? '<span class="kk-slim' + (o.g && o.g.slim ? ' aan' : '') + '"><span class="ico ico-bliksem" aria-hidden="true"></span>' + schoon(t.slim) + '</span>' : '') +
      (t.na ? '<span class="kk-na">' + schoon(t.na) + '</span>' : '') +
      (o.bij && t.bij ? '<span class="kk-bij">' + schoon(t.bij) + '</span>' : '') +
      (t.vak ? '<span class="kk-vak">' + schoon(vakNaam(t.vak)) + '</span>' : '');
    var label = t.naam + ', ' + t.kost + ' energie. ' + (t.eerst ? t.eerst + ' ' : '') + (t.goed ? 'Goed: ' + t.goed + '. Fout: ' + t.fout + '.' : t.doe + '.') +
      (t.slim ? ' Na een goed antwoord erbij: ' + t.slim + '.' : '') + (t.na ? ' ' + t.na : '') + (o.kan ? ' ' + o.kan : '');
    var kl = 'kk soort-' + t.soort + (t.vak ? ' vakk' : '') + (t.zeld === 1 ? ' zeldzaam' : '') + (k.p ? ' beter' : '') + (o.kan ? ' kanniet' : '') + (o.groot ? ' groot' : '') + (o.klasse ? ' ' + o.klasse : '');
    if (o.knop === false) return '<div class="' + kl + '" role="listitem" aria-label="' + schoon(label) + '">' + binnen + '</div>';
    return '<button type="button" class="' + kl + '"' + (o.data || '') + ' aria-label="' + schoon(label) + '"' + (o.uit ? ' disabled' : '') + '>' + binnen + '</button>';
  }

  /* ---------- het gevecht ---------- */
  var laatsteFig = '';
  var PLANICO = { aanval:'<path d="M5 19L17 7M14 5l5 5M4 20l2-2"/>', blok:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>',
    kracht:'<path d="M12 20V6M6 12l6-6 6 6"/>', raar:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>' };
  function tekenGevecht(){
    var g = st.g; if (!g) return;
    var v = g.v, vd = KT.VIJANDEN[v.id];
    tekenBalk();
    /* de tegenstander: alleen opnieuw tekenen als zijn gezicht verandert */
    var stem = v.hp <= 0 ? 'op' : '';
    if (laatsteFig !== v.id + stem){ $('vijandG').innerHTML = F.teken(v.id, stem); laatsteFig = v.id + stem; }
    $('vijandNaam').textContent = v.naam + (vd.baas ? ' (baas)' : vd.lastpak ? ' (lastpak)' : '');
    $('zijBalk').style.width = Math.max(0, 100 * v.hp / v.max) + '%';
    $('zijGetal').textContent = v.hp + ' / ' + v.max;
    $('zijStanden').innerHTML = standen([[v.blok, 'blok', 'blok: vangt schade op'], [v.kracht, 'kracht', 'kracht: elke klap doet zoveel meer'],
      [v.zwak, 'zwak', 'zwak: zijn klappen doen een kwart minder'], [v.wankel, 'wankel', 'wankel: hij krijgt de helft meer schade']]);
    var p = KT.planTekst(st);
    $('plan').className = 'voornemen vn-' + (p ? p.soort : 'anders') + (v.hp <= 0 ? ' hide' : '');
    $('plan').innerHTML = p ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (PLANICO[p.soort] || PLANICO.raar) + '</svg><span><small>van plan</small>' + schoon(p.tekst) + '</span>' : '';
    /* jij */
    if (!$('jijFig').firstChild) $('jijFig').innerHTML = jijSvg();
    $('jijBalk').style.width = Math.max(0, 100 * st.hp / st.max) + '%';
    $('jijGetal').textContent = st.hp + ' / ' + st.max;
    $('jijStanden').innerHTML = standen([[g.blok, 'blok', 'blok: vangt schade op'], [g.kracht, 'kracht', 'kracht: elke klap doet zoveel meer'],
      [g.zwak, 'zwak', 'zwak: je klappen doen een kwart minder'], [g.wankel, 'wankel', 'wankel: je krijgt de helft meer schade'],
      [st.reeks >= KT.B.vuur ? 'vuur' : st.reeks >= KT.B.dreef ? 'dreef' : 0, 'dreef', st.reeks >= KT.B.vuur ? 'in vuur en vlam: ' + st.reeks + ' goed op rij' : 'op dreef: ' + st.reeks + ' goed op rij'],
      [g.pb, 'pb', 'elke beurt zoveel blok']]);
    /* energie en stapels */
    var max = Math.max(g.energie, KT.B.energie);
    var bol = '';
    for (var i = 0; i < max; i++) bol += '<i class="' + (i < g.energie ? 'vol' : '') + '"></i>';
    $('energie').innerHTML = '<b>' + g.energie + '</b>' + bol + '<span>energie</span>';
    $('energie').setAttribute('aria-label', g.energie + ' energie');
    $('stapeltjes').textContent = 'trekstapel ' + g.trek.length + ' · afgelegd ' + g.af.length;
    /* de hand */
    var spelen = g.fase === 'spelen' && !bezig && !huidig;
    $('handPlek').classList.toggle('hide', g.fase === 'vraag' || !!huidig);
    $('hand').innerHTML = g.hand.map(function(k, h){
      var reden = KT.magSpelen(st, h);
      return kaartHtml(k, { g:g, data:' data-h="' + h + '"', kan:reden, uit:!spelen });
    }).join('');
    $('hand').setAttribute('aria-label', 'Je hand: ' + g.hand.length + ' kaarten');
    $('klaarBtn').disabled = !spelen;
    var kan = g.hand.some(function(k, h){ return !KT.magSpelen(st, h); });
    $('handTip').textContent = g.fase !== 'spelen' ? '' : !g.hand.length ? 'Je hand is leeg.' :
      kan ? (g.slim ? 'Opgeladen: de bliksemregels tellen mee.' : 'Speel kaarten zolang je energie hebt.') : 'Geen energie meer voor deze kaarten.';
    $('klaarBtn').classList.toggle('nadruk', spelen && !kan);
    if (melding){ $('logregel').textContent = melding; melding = ''; }
    if (!document.hidden) ademStart();
    bot.wek();
  }
  function standen(lijst){
    return lijst.filter(function(s){ return s[0]; }).map(function(s){
      var n = s[0] === 'vuur' ? 'in vuur en vlam' : s[0] === 'dreef' ? 'op dreef' : (s[1] === 'pb' ? 'elke beurt blok' : s[1]) + ' ' + s[0];
      return '<span class="stand stand-' + s[1] + (s[0] === 'vuur' ? ' vuur' : '') + '" title="' + schoon(s[2]) + '"><span class="sr">' + schoon(s[2]) + ' </span><span aria-hidden="true">' +
        (s[1] === 'dreef' ? '' : '<i></i>') + schoon(n) + '</span></span>';
    }).join('');
  }
  function jijSvg(){
    var wie = window.KLAS && KLAS.lees(), spec = window.PROFIEL ? PROFIEL.avatar() : '';
    if (window.AVATAR) return AVATAR.svg(wie ? wie.naam : 'jij', 72, spec);
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#204ECF"/></svg>';
  }
  /* de vraag aan het begin van een beurt */
  function beurtVraag(){
    var g = st.g;
    $('handPlek').classList.add('hide');
    var titel = g.beurt === 1 ? 'Beurt 1 tegen ' + g.v.naam + ': eerst een vraag' : 'Beurt ' + g.beurt + ': eerst een vraag';
    vraagIn($('vraagPlek'), {
      titel:titel,
      goedTekst:'Je bent opgeladen: extra energie en een kaart meer, en ' + g.v.naam + ' schrikt: zijn klap is deze beurt zwakker.',
      foutTekst:'Dit wordt een gewone beurt. Tik op Volgende als je klaar bent met lezen.',
      antwoord:function(goed){
        KT.antwoord(st, goed);
        var extra = st.log.filter(function(l){ return l.t === 'dreef'; })[0];
        if (extra) melding = extra.vuur ? 'In vuur en vlam! ' + st.reeks + ' goed op rij: nog meer energie en elke klap doet ' + KT.B.vuurKracht + ' meer.'
                                        : 'Op dreef! ' + st.reeks + ' goed op rij: een energie extra en elke klap doet ' + KT.B.dreefKracht + ' meer.';
        bewaar();
      },
      klaar:function(){ $('vraagPlek').classList.add('hide'); $('vraagPlek').innerHTML = ''; tekenGevecht(); focusHand(); }
    });
  }
  function focusHand(){
    if (raak) return;
    var b = $('hand').querySelector('.kk:not(.kanniet)') || $('klaarBtn');
    try { b.focus({ preventScroll:true }); } catch (e){}
  }
  function speelKaart(h){
    var g = st && st.g;
    if (!g || g.fase !== 'spelen' || bezig || huidig) return;
    var reden = KT.magSpelen(st, h);
    if (reden){ $('logregel').textContent = reden; schud($('hand').children[h]); return; }
    var e = KT.effect(g.hand[h]);
    if (e.vraag){
      $('handPlek').classList.add('hide');
      vraagIn($('vraagPlek'), {
        titel:e.naam + ': een extra vraag', snel:true,
        goedTekst:KT.tekst(g.hand[h], g, st.reeks).goed + '.',
        foutTekst:'Je kaart doet nu: ' + KT.tekst(g.hand[h], g, st.reeks).fout.toLowerCase() + '.',
        antwoord:function(goed){ KT.speel(st, h, goed); naSpelen(st.log.slice(), e); },
        klaar:function(){ $('vraagPlek').classList.add('hide'); $('vraagPlek').innerHTML = ''; naKaart(); }
      });
      return;
    }
    KT.speel(st, h);
    naSpelen(st.log.slice(), e);
    naKaart();
  }
  function naSpelen(log){
    var kaart = log.filter(function(l){ return l.t === 'speel'; })[0];
    if (kaart){
      var def = KT.KAARTEN[kaart.id];
      /* een vakkaart laat zijn weetje zien: daar leer je ook iets van */
      melding = def && def.bij ? def.naam + ': ' + def.bij : '';
    }
    speelLog(log);
    bewaar();
  }
  function naKaart(){
    if (st.fase === 'gevecht' && st.g.fase === 'klaar' || st.fase !== 'gevecht'){
      /* de tegenstander geeft op: even laten zien, dan de beloning */
      bezig = true; tekenGevecht();
      setTimeout(function(){ bezig = false; tekenFase(); }, zacht ? 1100 : 500);
      return;
    }
    tekenGevecht();
    focusHand();
  }
  function beurtKlaar(){
    var g = st && st.g;
    if (!g || g.fase !== 'spelen' || bezig || huidig) return;
    bezig = true;
    KT.beurtKlaar(st);
    var log = st.log.slice();
    bewaar();
    if (log.some(function(l){ return l.t === 'raak' && l.op === 'j'; })){ var z = $('zijVak'); z.classList.remove('valtaan'); void z.offsetWidth; z.classList.add('valtaan'); }
    speelLog(log);
    tekenGevecht();
    setTimeout(function(){
      bezig = false;
      if (st.fase === 'einde'){ tekenFase(); return; }
      tekenGevecht();
      if (st.g.fase === 'vraag') beurtVraag();
    }, zacht ? 900 : 350);
  }
  /* wat er gebeurde: zwevende getallen, een schudje, en een regel voor wie niet kijkt */
  function speelLog(log){
    var zinnen = [];
    log.forEach(function(l){
      var jij = l.op === 'j';
      if (l.t === 'raak'){
        if (l.n) zweef(jij ? 'jij' : 'zij', '-' + l.n, 'schade');
        if (l.blok) zweef(jij ? 'jij' : 'zij', l.blok + ' geblokt', 'blok');
        schud(jij ? $('jijVak') : $('vijandFig'));
        zinnen.push(jij ? 'Je krijgt ' + l.n + ' schade' + (l.blok ? ' (' + l.blok + ' geblokt)' : '') : st.g.v.naam + ' krijgt ' + l.n + ' schade' + (l.blok ? ' (' + l.blok + ' geblokt)' : ''));
      } else if (l.t === 'blok'){ zweef(jij ? 'jij' : 'zij', '+' + l.n + ' blok', 'blok'); }
      else if (l.t === 'heel'){ if (l.n) zweef('jij', '+' + l.n, 'heel'); zinnen.push('Je herstelt ' + l.n + '.'); }
      else if (l.t === 'kracht'){ zweef(jij ? 'jij' : 'zij', '+' + l.n + ' kracht', 'kracht'); }
      else if (l.t === 'zwak'){ zweef(jij ? 'jij' : 'zij', l.schrik ? 'schrikt' : 'zwak', 'zwak'); }
      else if (l.t === 'wankel'){ zweef(jij ? 'jij' : 'zij', 'wankel', 'zwak'); }
      else if (l.t === 'rommel'){ zinnen.push(st.g.v.naam + ' stopt ' + (l.id === 'kauwgom' ? 'kauwgom' : l.n === 1 ? 'een propje' : l.n + ' propjes') + ' in je stapel.'); }
      else if (l.t === 'boos'){ zinnen.push(st.g.v.naam + ' raakt geïrriteerd: ' + l.n + ' kracht erbij.'); }
      else if (l.t === 'munt'){ zweef('jij', '+' + l.n + ' munten', 'munt'); }
      else if (l.t === 'op'){ var d = KT.VIJANDEN[l.id]; zinnen.push(d.naam + ' ' + d.op + '.'); }
      else if (l.t === 'uitgeteld'){ zinnen.push('Je hebt even geen puf meer.'); }
    });
    if (zinnen.length && !melding) $('logregel').textContent = zinnen.join(' ');
    else if (melding){ $('logregel').textContent = melding + (zinnen.length ? ' ' + zinnen.join(' ') : ''); melding = ''; }
  }
  function zweef(waar, tekst, soort){
    var laag = $('zwevers'); if (!laag) return;
    var s = document.createElement('span');
    s.className = 'zwever ' + waar + ' z-' + soort;
    s.textContent = tekst;
    s.style.setProperty('--dx', (Math.random() * 40 - 20).toFixed(0) + 'px');
    laag.appendChild(s);
    setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, zacht ? 1100 : 700);
  }
  function schud(el){ if (!el || !zacht) return; el.classList.remove('schud'); void el.offsetWidth; el.classList.add('schud'); }

  /* De tegenstander ademt: een klein op en neer in een eigen lus die stopt
     zodra het gevecht niet in beeld is of het tabblad op de achtergrond staat. */
  var adem = { aan:false };
  function ademStart(){
    if (adem.aan || !zacht || document.hidden || $('vGevecht').classList.contains('hide')) return;
    adem.aan = true; adem.el = $('vijandAdem');
    requestAnimationFrame(ademTik);
  }
  function ademStop(){ adem.aan = false; }
  function ademTik(t){
    if (!adem.aan) return;
    if (document.hidden || $('scherm-spel').classList.contains('hide')){ adem.aan = false; return; }
    var s = Math.sin(t / 620);
    adem.el.setAttribute('transform', 'translate(0 ' + (s * 1.8).toFixed(2) + ') scale(' + (1 + s * 0.02).toFixed(4) + ')');
    requestAnimationFrame(ademTik);
  }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden && st && st.fase === 'gevecht') ademStart(); });

  /* ---------- tussenstops ---------- */
  function tekenStop(){
    view('vStop');
    var s = st.stop, k = KT.kamer(st), vd = KT.VIJANDEN[k.vijand], na = '<p class="stopna">Daarna: ' + schoon(vd.naam) + '.</p>', h = '';
    if (s.soort === 'rust'){
      var n = Math.min(st.max - st.hp, Math.round(st.max * KT.B.rustHeel));
      h = '<div class="stopkaart"><p class="hand">even op adem komen</p><h2>Rustplek: de bank in de gang</h2><p class="vuit">Kies een van de twee.</p>' +
        '<div class="stopkeuzes">' +
          '<button type="button" class="keuzeknop" id="rustHeel"><b>Uitrusten</b><span>' + (n ? 'Herstel ' + n + ' doorzetting. Je hebt er nu ' + st.hp + ' van de ' + st.max + '.' : 'Je doorzetting is al vol; oefenen levert nu meer op.') + '</span></button>' +
          '<button type="button" class="keuzeknop" id="rustBeter"' + (kanBeter().length ? '' : ' disabled') + '><b>Oefenen</b><span>' + (kanBeter().length ? 'Verbeter een kaart uit je stapel.' : 'Al je kaarten zijn al verbeterd.') + '</span></button>' +
        '</div>' + na + '</div>';
      $('vStop').innerHTML = h;
      $('rustHeel').addEventListener('click', function(){ KT.rust(st, 'heel'); melding = 'Uitgerust: +' + n + ' doorzetting.'; naStop(); });
      $('rustBeter').addEventListener('click', function(){
        kiesUitStapel('Welke kaart wil je verbeteren?', kanBeter(), function(i){ var nm = KT.effect(st.stapel[i]).naam; KT.rust(st, 'beter', i); melding = nm + ' is verbeterd.'; naStop(); }, true);
      });
    } else if (s.soort === 'winkel'){
      h = '<div class="stopkaart"><p class="hand">even shoppen</p><h2>De schoolwinkel</h2><p class="vuit">Je hebt <b>' + st.munten + '</b> munten.</p>' +
        '<div class="waren">' + s.waren.map(function(w, i){
          var te = st.munten < w.prijs;
          return '<div class="waar' + (w.weg ? ' verkocht' : '') + '">' + kaartHtml({ id:w.id, p:0 }, { knop:false, bij:true }) +
            '<button type="button" class="koopknop" data-i="' + i + '"' + (w.weg || te ? ' disabled' : '') + '>' + (w.weg ? 'Gekocht' : 'Koop voor ' + w.prijs) + '<span class="ico ico-munt" aria-hidden="true"></span></button></div>';
        }).join('') + '</div>' +
        '<div class="stopkeuzes">' +
          '<button type="button" class="keuzeknop" id="koopPleister"' + (s.pleister.weg || st.munten < s.pleister.prijs || st.hp >= st.max ? ' disabled' : '') + '><b>Pleisters, ' + s.pleister.prijs + ' munten</b><span>' + (s.pleister.weg ? 'Gekocht.' : 'Herstel ' + s.pleister.h + ' doorzetting.') + '</span></button>' +
          '<button type="button" class="keuzeknop" id="koopWeg"' + (s.wegGedaan || st.munten < s.wegPrijs || st.stapel.length <= 5 ? ' disabled' : '') + '><b>Een kaart weggooien, ' + s.wegPrijs + ' munten</b><span>' + (s.wegGedaan ? 'Gedaan.' : 'Een kleinere stapel geeft vaker je beste kaarten.') + '</span></button>' +
        '</div>' +
        '<button type="button" class="btn" id="stopVerder">Verder naar ' + schoon(vd.naam) + '</button></div>';
      $('vStop').innerHTML = h;
      Array.prototype.forEach.call($('vStop').querySelectorAll('.koopknop'), function(b){
        b.addEventListener('click', function(){ var i = +b.getAttribute('data-i'); if (KT.koop(st, i)){ bewaar(); $('logregel').textContent = ''; tekenStop(); tekenBalk(); } });
      });
      $('koopPleister').addEventListener('click', function(){ if (KT.pleister(st)){ bewaar(); tekenStop(); tekenBalk(); } });
      $('koopWeg').addEventListener('click', function(){
        kiesUitStapel('Welke kaart gooi je weg?', st.stapel.map(function(k, i){ return i; }), function(i){ KT.weg(st, i); bewaar(); tekenStop(); tekenBalk(); });
      });
      $('stopVerder').addEventListener('click', function(){ KT.verder(st); naStop(); });
    } else {
      var gb = KT.gebeurtenisDef(st);
      h = '<div class="stopkaart"><p class="hand">onderweg</p><h2>' + schoon(gb.titel) + '</h2><p class="vuit">' + schoon(gb.tekst) + '</p>' +
        '<div class="stopkeuzes" id="gbKeuzes">' + gb.opties.map(function(o, i){
          return '<button type="button" class="keuzeknop" data-o="' + i + '"><b>' + schoon(o.t) + '</b>' + (o.vragen ? '<span>' + (o.vragen === 1 ? 'Een vraag' : o.vragen + ' vragen') + '</span>' : '') + '</button>';
        }).join('') + '</div><div class="vraagplek hide" id="gbVraag"></div>' + na + '</div>';
      $('vStop').innerHTML = h;
      Array.prototype.forEach.call($('vStop').querySelectorAll('[data-o]'), function(b){
        b.addEventListener('click', function(){ gebeurtenisKies(+b.getAttribute('data-o')); });
      });
    }
    tekenBalk();
    bot.wek();
  }
  function kanBeter(){ return st.stapel.map(function(k, i){ return i; }).filter(function(i){ return !st.stapel[i].p && KT.KAARTEN[st.stapel[i].id].plus; }); }
  function gebeurtenisKies(o){
    var gb = KT.gebeurtenisDef(st), opt = gb.opties[o], uit = [];
    var voor = { munten:st.munten, hp:st.hp, max:st.max };
    function klaar(kaart){
      KT.gebeurtenis(st, o, uit, kaart);
      var d = [];
      if (st.munten > voor.munten) d.push('+' + (st.munten - voor.munten) + ' munten');
      if (st.max > voor.max) d.push('+' + (st.max - voor.max) + ' doorzetting voor de rest van de klim');
      else if (st.hp > voor.hp) d.push('+' + (st.hp - voor.hp) + ' doorzetting');
      st.log.forEach(function(l){
        if (l.t === 'beter') d.push(KT.KAARTEN[l.id].naam + ' is verbeterd');
        if (l.t === 'weg') d.push(KT.KAARTEN[l.id].naam + ' is weg');
        if (l.t === 'ruil') d.push(KT.KAARTEN[l.van].naam + ' geruild voor ' + KT.KAARTEN[l.id].naam);
      });
      melding = gb.titel + (d.length ? ': ' + d.join(', ') + '.' : ': je loopt door.');
      naStop();
    }
    if (opt.weg){ kiesUitStapel('Welke kaart gooi je weg?', st.stapel.map(function(k, i){ return i; }), klaar); return; }
    if (!opt.vragen) return klaar();
    $('gbKeuzes').classList.add('hide');
    var n = 0;
    (function volgende(){
      vraagIn($('gbVraag'), {
        titel:gb.titel + (opt.vragen > 1 ? ': vraag ' + (n + 1) + ' van ' + opt.vragen : ''),
        goedTekst:opt.perGoed ? '+' + opt.perGoed.m + ' munten.' : '',
        foutTekst:'',
        antwoord:function(goed){ uit.push(goed); },
        klaar:function(){ n++; if (n < opt.vragen) volgende(); else klaar(); }
      });
    })();
  }
  function naStop(){ bewaar(); tekenFase(); scrollTo(0, 0); }

  /* ---------- je stapel: bekijken of een kaart kiezen ---------- */
  var dekTerug = null, dekKies = null;
  function dekOpen(kop, uitleg, idx, kies, verbetering){
    dekTerug = document.activeElement; dekKies = kies;
    $('dekKop').textContent = kop;
    $('dekUit').textContent = uitleg || '';
    $('dekKaarten').setAttribute('role', kies ? 'group' : 'list');
    $('dekKaarten').innerHTML = idx.map(function(i){
      var k = st.stapel[i];
      if (!kies) return kaartHtml(k, { knop:false, bij:true });
      var na = verbetering ? '<span class="kk-wordt">wordt: ' + schoon(KT.tekst({ id:k.id, p:1 }).doe || KT.tekst({ id:k.id, p:1 }).goed) + '</span>' : '';
      return kaartHtml(k, { data:' data-i="' + i + '"', bij:true, klasse:'kiesbaar' }).replace('</button>', na + '</button>');
    }).join('');
    Array.prototype.forEach.call($('dekKaarten').querySelectorAll('[data-i]'), function(b){
      b.addEventListener('click', function(){ var f = dekKies; dekDicht(); if (f) f(+b.getAttribute('data-i')); });
    });
    $('dek').hidden = false;
    document.body.classList.add('dekopen');
    var eerste = $('dekKaarten').querySelector('button') || $('dekDicht');
    try { eerste.focus(); } catch (e){}
    bot.wek();
  }
  function dekDicht(){
    $('dek').hidden = true; dekKies = null;
    document.body.classList.remove('dekopen');
    if (dekTerug && dekTerug.focus && document.contains(dekTerug)) try { dekTerug.focus({ preventScroll:true }); } catch (e){}
  }
  function kiesUitStapel(kop, idx, kies, verbetering){ dekOpen(kop, verbetering ? 'Onder elke kaart staat wat hij wordt.' : '', idx, kies, verbetering); }
  $('dekDicht').addEventListener('click', dekDicht);
  $('dek').addEventListener('click', function(e){ if (e.target === $('dek')) dekDicht(); });
  $('stapelBtn').addEventListener('click', function(){
    if (!st) return;
    var n = st.stapel.length;
    dekOpen('Je stapel', n + ' kaarten. Elk gevecht begin je met al deze kaarten geschud.', st.stapel.map(function(k, i){ return i; }).sort(function(a, b){
      var x = KT.KAARTEN[st.stapel[a].id], y = KT.KAARTEN[st.stapel[b].id];
      return (x.soort > y.soort ? 1 : x.soort < y.soort ? -1 : 0) || (x.naam > y.naam ? 1 : -1);
    }), null);
  });

  /* ---------- de beloning ---------- */
  function tekenBeloning(){
    view('vBeloning');
    var b = st.bel, k = KT.kamer(st), vd = KT.VIJANDEN[k.vijand];
    var heel = KT.B.naGevecht && !vd.baas ? ' Je puft even uit: tot ' + KT.B.naGevecht + ' doorzetting terug.' : vd.baas ? ' Na een baas mag je even bijkomen.' : '';
    $('vBeloning').innerHTML = '<div class="stopkaart beloning"><p class="hand">gelukt!</p>' +
      '<h2>' + schoon(vd.naam) + ' ' + schoon(vd.op) + '.</h2>' +
      '<p class="vuit"><span class="ico ico-munt" aria-hidden="true"></span> +' + b.munten + ' munten.' + schoon(heel) + '</p>' +
      '<h3 class="kiesKop">Kies een kaart voor je stapel</h3>' +
      '<div class="belkaarten">' + b.opties.map(function(id, i){ return kaartHtml({ id:id, p:0 }, { data:' data-b="' + i + '"', bij:true, groot:true }); }).join('') + '</div>' +
      '<button type="button" class="linkbtn geenkaart" id="belGeen">Geen kaart nemen</button></div>';
    Array.prototype.forEach.call($('vBeloning').querySelectorAll('[data-b]'), function(x){
      x.addEventListener('click', function(){ kiesBeloning(+x.getAttribute('data-b')); });
    });
    $('belGeen').addEventListener('click', function(){ kiesBeloning(-1); });
    tekenBalk();
    bot.wek();
  }
  function kiesBeloning(i){
    var id = i >= 0 ? st.bel.opties[i] : null;
    KT.beloning(st, i);
    melding = id ? KT.KAARTEN[id].naam + ' zit nu in je stapel.' : '';
    bewaar(); tekenFase(); scrollTo(0, 0);
  }

  /* ---------- het einde ---------- */
  function einde(){
    var s = st;
    weg(RUN);
    toon('einde');
    var vk = vakVan(s.vak), nv = nivVan(s.ui.niveau), laatste = s.kaart[Math.max(0, s.rij)][Math.max(0, s.kol)], vd = KT.VIJANDEN[laatste.vijand];
    $('eindHand').textContent = s.gewonnen ? 'de top!' : 'even uitgeteld';
    $('eindKop').textContent = s.gewonnen ? 'Je staat bovenaan de toren' : 'Verdieping ' + s.verdiepingen + ' gehaald';
    var totaal = s.goed + s.fout;
    $('eindUit').textContent = (s.gewonnen ? vd.naam + ' ' + vd.op + '. ' : vd.naam + ' was je deze keer te slim af op verdieping ' + (s.rij + 1) + '. ') +
      'Je beantwoordde ' + s.goed + ' van de ' + totaal + ' vragen goed' + (vk ? ' (' + vk.naam.toLowerCase() + (nv ? ', ' + nv.naam : '') + ')' : '') + '.' +
      (s.gewonnen ? '' : ' Meer goed op rij geeft meer energie: daar zit de kracht.');
    $('cijfers').innerHTML = '<div><b>' + s.besteReeks + '</b><span>langste reeks</span></div><div><b>' + s.stapel.length + '</b><span>kaarten in je stapel</span></div>' +
      '<div><b>' + Math.max(1, Math.round((s.ui.ms || 0) / 60000)) + '</b><span>' + (Math.round((s.ui.ms || 0) / 60000) > 1 ? 'minuten' : 'minuut') + ' geklommen</span></div>';
    $('eindCode').innerHTML = 'Torencode <b>' + schoon(s.code) + '</b>. Geef hem aan een klasgenoot: bij meer keuzes vul je hem in en klim je dezelfde toren.';
    var sterren = s.gewonnen ? 3 : s.verdiepingen >= 9 ? 2 : s.verdiepingen >= 5 ? 1 : 0;
    if (window.KLAS) KLAS.meld({ spel:'kaarttoren', ronde:s.verdiepingen, punten:s.goed, niveau:s.ui.niveau, vak:s.vak, od:s.ui.od }, 'eindUit');
    var kaartE = SPEL.einde({ spel:'kaarttoren', reeks:s.besteReeks, compact:true, waarde:s.verdiepingen, label:'verdiepingen', sterren:sterren, klas:false, plek:'siteLijst',
      goed:s.goed, muntFactor:1.5, muntBonus:s.verdiepingen * 2, opnieuw:nogEenKeer, sleutel:s.ui.niveau, deelTekst:s.gewonnen ? 'de top van de toren' : 'verdieping ' + s.verdiepingen,
      kop:s.gewonnen ? 'jouw klim: de top' : 'jouw klim' });
    if (kaartE && sterren === 0){
      var warm = document.createElement('p'); warm.className = 'warm';
      warm.textContent = 'De eerste ster komt als je de baas op verdieping 5 verslaat. Kies onderweg ook een rustplek als je doorzetting laag is.';
      var re = kaartE.querySelector('.rechts'); if (re) re.appendChild(warm);
    }
    oefenKnop(kaartE, s.fout);
    if (window.STRIJD){
      if (s.ui.bot && STRIJD.knoei) STRIJD.knoei();
      STRIJD.klassement.vorm('siteLijst', 'kaarttoren', function(){
        return { ronde:s.verdiepingen, punten:KT.punten(s), waar:'', niveau:nv ? nv.naam : '', vak:vk ? vk.naam : '' };
      });
    }
    bot.wek();
  }
  function oefenKnop(kaartE, fouten){
    if (!kaartE || !fouten || !window.FOUTENMAP || !FOUTENMAP.lijst || !FOUTENMAP.lijst().length) return;
    var kn = kaartE.querySelector('.knoppen'); if (!kn || /Oefen je fouten/.test(kn.textContent)) return;
    var a = document.createElement('a'); a.className = 'stil'; a.href = 'fouten.html';
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16M4 20v-4h4"/></svg>Oefen je fouten';
    kn.insertBefore(a, kn.children[1] || null);
  }
  function nogEenKeer(){ metVragen(function(){ begin(''); }); }
  $('nogBtn').addEventListener('click', nogEenKeer);

  /* ---------- beginnen en verdergaan ---------- */
  function metVragen(daarna, knop){
    if (!vak || !window.BANK || BANK.heeft(vak) || vak === 'reken') return daarna();
    /* de knop draait tot de vragen er zijn (fonts.css) */
    if (knop){ knop.disabled = true; knop.setAttribute('aria-busy', 'true'); }
    BANK.zorg(vak).then(function(){ if (knop){ knop.disabled = false; knop.removeAttribute('aria-busy'); } daarna(); });
  }
  function begin(code){
    weg(RUN);
    st = KT.nieuw(code || '', vak);
    st.ui = { niveau:niveau, deel:(keuze[vak] || []).slice(), od:{}, ms:0, bot:bot.aan };
    slim.reset(niveau); pot = null;
    bewaarLaatst();
    bewaar();
    melding = '';
    toon('spel');
    tekenFase();
  }
  function hervat(s){
    st = s;
    vak = s.vak; niveau = s.ui.niveau; keuze[vak] = (s.ui.deel || []).slice();
    slim.reset(niveau); pot = null;
    if (bot.aan) st.ui.bot = true;
    toon('spel');
    melding = 'Welkom terug. Je klimt verder waar je was.';
    tekenFase();
  }
  /* tijd die je echt aan het klimmen bent, voor het eindscherm */
  setInterval(function(){ if (st && !st.klaar && !document.hidden && !$('scherm-spel').classList.contains('hide')){ st.ui.ms = (st.ui.ms || 0) + 5000; } }, 5000);

  /* het startscherm: niveau, vak en onderdelen, zoals Torenverdediging */
  function onthoudNiveau(id){ try { if (id) localStorage.setItem('lg-niveau', id); } catch (e){} }
  function tekenNiveaus(){
    $('niveaus').innerHTML = NIVEAUS.map(function(n){ return '<button type="button" data-n="' + n.id + '"' + (niveau === n.id ? ' class="on"' : '') + '>' + n.naam + '</button>'; }).join('');
    Array.prototype.forEach.call($('niveaus').querySelectorAll('button'), function(b){
      b.addEventListener('click', function(){ niveau = b.getAttribute('data-n'); onthoudNiveau(niveau); tekenNiveaus(); });
    });
    var n = nivVan(niveau);
    $('nivUit').textContent = n ? 'Vragen op het niveau van ' + n.naam + '. Gaat het goed, dan worden ze vanzelf iets moeilijker.' : '';
  }
  function tekenVakken(){
    $('vakken').innerHTML = VAKKEN.map(function(v){
      return '<button class="vak' + (vak === v.id ? ' on' : '') + '" type="button" data-v="' + v.id + '" title="' + schoon(v.onder) + '">' +
        '<i style="background:' + kleurVan(v.kleur) + ';color:' + inktOp(v.kleur) + '" aria-hidden="true">' + v.mark + '</i><b>' + v.naam + '</b></button>';
    }).join('');
    var gv = vakVan(vak);
    $('vakUit').textContent = gv ? gv.onder + '. Je krijgt ook vakkaarten: ' + vakKaartVoorbeeld(vak) + '.' : '';
    Array.prototype.forEach.call($('vakken').querySelectorAll('.vak'), function(b){
      b.addEventListener('click', function(){ vak = b.getAttribute('data-v'); if (!keuze[vak]) keuze[vak] = []; pot = null; tekenVakken(); tekenDeelvakken(); });
    });
  }
  function vakKaartVoorbeeld(id){
    var l = (window.KAARTTOREN_VAKKAARTEN || {})[id] || [];
    var namen = l.slice(0, 3).map(function(k){ return k.naam; });
    return namen.length ? namen.join(', ') + ' en meer' : 'oefenkaarten';
  }
  function tekenDeelvakken(){
    var doel = $('deelvakken');
    if (!vak){ doel.innerHTML = ''; return; }
    if (!keuze[vak]) keuze[vak] = [];
    var items = (window.BANK && BANK.deelItems) ? BANK.deelItems(vak) : (ONDERDELEN[vak] || []).map(function(o){ return { soort:'deel', id:o.id, naam:o.naam }; });
    doel.innerHTML = '<div class="deelvak"><button type="button" data-d="alles"' + (keuze[vak].length ? '' : ' class="on"') + '>alles door elkaar</button>' +
      items.filter(function(o){ return o.soort !== 'kop'; }).map(function(o){
        return '<button type="button" data-d="' + schoon(o.id) + '"' + (keuze[vak].indexOf(o.id) >= 0 ? ' class="on"' : '') + '>' + schoon(o.naam) + '</button>';
      }).join('') + '</div>';
    Array.prototype.forEach.call(doel.querySelectorAll('button'), function(b){
      b.addEventListener('click', function(){
        var d = b.getAttribute('data-d');
        if (d === 'alles') keuze[vak] = [];
        else { var k = keuze[vak].indexOf(d); if (k >= 0) keuze[vak].splice(k, 1); else keuze[vak].push(d); }
        pot = null; tekenDeelvakken();
      });
    });
    var namen = items.filter(function(o){ return o.soort !== 'kop' && keuze[vak].indexOf(o.id) >= 0; }).map(function(o){ return o.naam; });
    $('deelSamen').textContent = !namen.length ? 'alles door elkaar' : namen.length <= 3 ? namen.join(', ') : namen.slice(0, 2).join(', ') + ' en ' + (namen.length - 2) + ' meer';
  }
  function bewaarLaatst(){ zet(LAATST, { vak:vak, deel:(keuze[vak] || []).slice(), niveau:niveau }); }

  /* de torencode bij meer keuzes */
  function codeUitVeld(){ return String($('codeVeld').value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); }
  $('codeVeld').addEventListener('input', function(){
    var c = codeUitVeld();
    $('codeVeld').value = c;
    $('meerSamen').textContent = c.length === 4 ? 'torencode ' + c : 'een nieuwe toren';
    $('codeUit').textContent = c && c.length < 4 ? 'Een torencode heeft vier letters.' : '';
  });

  /* Start: loopt er nog een klim, dan eerst vragen of die weg mag */
  var startZeker = false, startKlok = null;
  $('startBtn').addEventListener('click', function(){
    if (!vak) return;
    var knop = this, oud = lees(RUN);
    if (oud && oud.v === KT.VERSIE && !oud.klaar && !startZeker){
      startZeker = true; knop.textContent = 'Zeker? Je lopende klim stopt dan'; knop.classList.add('zeker');
      startKlok = setTimeout(function(){ startZeker = false; knop.textContent = 'Begin de klim'; knop.classList.remove('zeker'); }, 3000);
      return;
    }
    clearTimeout(startKlok); startZeker = false; knop.textContent = 'Begin de klim'; knop.classList.remove('zeker');
    var c = codeUitVeld();
    metVragen(function(){ begin(c.length === 4 ? c : ''); }, knop);
  });

  /* Stoppen in de kop (spel.js vraagt eerst "Zeker? Tik nog eens"): de klim blijft bewaard */
  $('stopBtn').addEventListener('click', function(){
    if (huidig){ clearTimeout(huidig.klok); huidig = null; }
    bezig = false;
    bewaar();
    toon('start');
    tekenVerder();
  });

  /* ---------- een link van de docent of uit de leeromgeving ----------
     ?vak=ges&n=havo&deel=6,7&van=lo, en ?code=KMRT voor een torencode */
  function param(naam){ var m = new RegExp('[?&]' + naam + '=([^&#]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : null; }
  var uitLink = false, vanLo = /[?&]van=lo\b/.test(location.search);
  (function(){
    var ANDERS = { hv:'havo' };
    var n = param('n'); if (n){ n = ANDERS[n] || n; if (nivVan(n)) niveau = n; }
    var v = param('vak');
    if (v && vakVan(v)){
      vak = v; keuze[vak] = []; uitLink = true;
      var d = param('deel'); if (d) d.split(',').forEach(function(id){ if ((ONDERDELEN[vak] || []).some(function(o){ return o.id === id; })) keuze[vak].push(id); });
    } else if (window.EIGEN_LIJST && vakVan('eigen')){ vak = 'eigen'; keuze[vak] = []; uitLink = true; }
    var c = param('code'); if (c){ $('codeVeld').value = c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); $('meerSamen').textContent = 'torencode ' + $('codeVeld').value; }
  })();
  /* Verder: een lopende klim, of anders je vorige keuze */
  function tekenVerder(){
    var box = $('verderVak'), oud = lees(RUN), l = lees(LAATST);
    box.innerHTML = ''; box.classList.add('hide');
    var d = $('anders');
    if (oud && oud.v === KT.VERSIE && !oud.klaar && oud.ui && vakVan(oud.vak)){
      var v = vakVan(oud.vak), nv = nivVan(oud.ui.niveau), f = oud.fase === 'kaart' ? oud.rij + 2 : oud.rij + 1;
      box.innerHTML = '<button class="verderknop" type="button" id="verderRun">Verder met je klim' +
        '<small>verdieping ' + Math.max(1, f) + ' van ' + KT.HOOG + ' · ' + schoon(v.naam.toLowerCase()) + ' · ' + schoon(nv ? nv.naam : '') + ' · ' + oud.hp + ' doorzetting</small></button>';
      box.classList.remove('hide');
      d.classList.remove('zonder'); d.open = false;
      $('verderRun').addEventListener('click', function(){
        var s = lees(RUN); if (!s) return;
        vak = s.vak;
        metVragen(function(){ hervat(s); }, this);
      });
      return;
    }
    if (uitLink || !l || !vakVan(l.vak)) { d.classList.add('zonder'); d.open = true; return; }
    var v2 = vakVan(l.vak), nv2 = nivVan(l.niveau);
    box.innerHTML = '<button class="verderknop" type="button" id="verderStart">Verder met ' + schoon(v2.naam.toLowerCase()) + ' · ' + schoon(nv2 ? nv2.naam : l.niveau) +
      '<small>een nieuwe toren, ' + ((l.deel || []).length ? l.deel.length + ((l.deel.length === 1) ? ' onderdeel' : ' onderdelen') : 'alle onderdelen') + '</small></button>';
    box.classList.remove('hide');
    d.classList.remove('zonder'); d.open = false;
    $('verderStart').addEventListener('click', function(){
      vak = l.vak; keuze[vak] = (l.deel || []).filter(function(id){ return (ONDERDELEN[vak] || []).some(function(o){ return o.id === id; }); });
      if (nivVan(l.niveau)) niveau = l.niveau;
      metVragen(function(){ begin(codeUitVeld().length === 4 ? codeUitVeld() : ''); }, this);
    });
  }
  (function(){
    var l = lees(LAATST);
    if (!uitLink && l && vakVan(l.vak)){
      vak = l.vak; keuze[vak] = (l.deel || []).slice();
      if (nivVan(l.niveau) && !param('n')) niveau = l.niveau;
    }
    if (!param('n') && !(l && l.niveau)){ try { var ln = localStorage.getItem('lg-niveau'); if (nivVan(ln)) niveau = ln; } catch (e){} }
    /* een eerste bezoek: rekenen staat klaar, dat heeft geen vragenbestand nodig */
    if (!vak){ vak = 'reken'; keuze[vak] = []; }
  })();
  tekenNiveaus(); tekenVakken(); tekenDeelvakken(); tekenVerder();
  if (uitLink){
    var vv = vakVan(vak);
    var namen = (keuze[vak] || []).map(function(id){ var o = (ONDERDELEN[vak] || []).filter(function(x){ return x.id === id; })[0]; return o ? o.naam : id; });
    var wat = vv.naam + (namen.length ? ', ' + namen.join(' en ') : '');
    $('vakKop').innerHTML = '<i>2</i>je oefent';
    ['vakken', 'deelKeuze', 'vakUit'].forEach(function(id){ $(id).classList.add('hide'); });
    var uit = $('vastUit');
    uit.textContent = wat + (vanLo ? ', gekozen in de leeromgeving. ' : ', gekozen door je docent.');
    if (vanLo){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn anderskies'; b.textContent = 'anders kiezen';
      b.addEventListener('click', function(){ ['vakken', 'deelKeuze', 'vakUit'].forEach(function(id){ $(id).classList.remove('hide'); }); uit.classList.add('hide'); $('vakKop').innerHTML = '<i>2</i>kies je vak'; });
      uit.appendChild(b);
    }
    uit.classList.remove('hide');
  }
  $('jaar').textContent = new Date().getFullYear();
  if (window.STRIJD){
    /* het klassement van de site telt in rondes; hier zijn het verdiepingen */
    if (STRIJD.klassement.maat) STRIJD.klassement.maat('kaarttoren', 'verdiepingen');
    STRIJD.klassement.toon('siteStartLijst', 'kaarttoren');
  }

  /* ---------- toetsen ---------- */
  addEventListener('keydown', function(e){
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!$('dek').hidden){ if (e.key === 'Escape'){ dekDicht(); e.preventDefault(); } return; }
    var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (huidig && !huidig.af && /^[1-4]$/.test(e.key)){ beantwoord(parseInt(e.key, 10) - 1); e.preventDefault(); return; }
    if (huidig || !st || $('scherm-spel').classList.contains('hide')) return;
    if (st.fase === 'gevecht' && st.g && st.g.fase === 'spelen' && !bezig){
      if (/^[1-9]$/.test(e.key)){ speelKaart(parseInt(e.key, 10) - 1); e.preventDefault(); }
      else if (e.key === 'e' || e.key === 'E'){ beurtKlaar(); e.preventDefault(); }
    } else if (st.fase === 'kaart' && /^[1-3]$/.test(e.key)){
      var kb = $('kamers').querySelectorAll('.kamerknop')[parseInt(e.key, 10) - 1]; if (kb){ kb.click(); e.preventDefault(); }
    }
  });
  $('hand').addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-h]') : null;
    if (b) speelKaart(parseInt(b.getAttribute('data-h'), 10));
  });
  $('klaarBtn').addEventListener('click', beurtKlaar);

  /* ---------- de speelbot ----------
     Klikt door het echte scherm, zoals een leerling dat doet: antwoorden
     (goed met kans p), kaarten, kamers, winkels en beloningen, met de keuzes
     van KAARTTOREN.bot. Voor de test, niet voor het klassement. */
  var bot = { aan:false, goed:0.75, tempo:260, klok:null, stappen:0, log:[] };
  bot.wek = function(){ if (bot.aan && !bot.klok) bot.klok = setTimeout(bot.stap, bot.tempo); };
  bot.start = function(p, tempo){
    bot.aan = true; if (typeof p === 'number') bot.goed = p; if (tempo) bot.tempo = tempo;
    if (st && st.ui) st.ui.bot = true;
    if (window.STRIJD && STRIJD.knoei) STRIJD.knoei();
    bot.wek();
  };
  bot.stop = function(){ bot.aan = false; clearTimeout(bot.klok); bot.klok = null; };
  function klik(el){ if (el && !el.disabled){ el.click(); return true; } return false; }
  bot.stap = function(){
    bot.klok = null;
    if (!bot.aan) return;
    bot.stappen++;
    try {
      if (!$('dek').hidden){
        /* een kaart kiezen uit de stapel: verbeteren of weggooien */
        var knoppen = $('dekKaarten').querySelectorAll('[data-i]');
        if (!knoppen.length){ dekDicht(); return bot.wek(); }
        var z = KT.bot.zwakste(st), keuzeI = null;
        Array.prototype.forEach.call(knoppen, function(b){ if (+b.getAttribute('data-i') === z) keuzeI = b; });
        if (/verbeteren/.test($('dekKop').textContent)){ var r = KT.bot.rust(st); Array.prototype.forEach.call(knoppen, function(b){ if (+b.getAttribute('data-i') === r.kaart) keuzeI = b; }); }
        klik(keuzeI || knoppen[0]); return bot.wek();
      }
      if (!$('scherm-start').classList.contains('hide')){ klik($('verderRun')) || klik($('startBtn')); return bot.wek(); }
      if (!$('scherm-einde').classList.contains('hide')){ bot.log.push('einde'); bot.aan = false; return; }
      if (huidig){
        if (!huidig.af){ var q = huidig.q, goed = Math.random() < bot.goed, i = goed ? q.g : (q.g + 1 + Math.floor(Math.random() * (q.o.length - 1))) % q.o.length; beantwoord(i); }
        else { var vb = $('volgendeBtn'); if (vb && !$('volgendeRij').hidden) klik(vb); }
        return bot.wek();
      }
      if (bezig || !st) return bot.wek();
      /* voor een test: in deze fase even niets doen (kaartBot.pauze = 'beloning') */
      if (bot.pauze && bot.pauze === st.fase) return bot.wek();
      if (st.fase === 'kaart'){ var ki = KT.bot.kamer(st); klik($('kamers').querySelector('[data-i="' + ki + '"]')); }
      else if (st.fase === 'gevecht'){
        if (st.g.fase === 'spelen'){ var h = KT.bot.speel(st, bot.goed); if (h < 0) klik($('klaarBtn')); else klik($('hand').querySelector('[data-h="' + h + '"]')); }
      } else if (st.fase === 'beloning'){ var bi = KT.bot.beloning(st); klik(bi < 0 ? $('belGeen') : $('vBeloning').querySelector('[data-b="' + bi + '"]')); }
      else if (st.fase === 'stop'){
        var s = st.stop;
        if (s.soort === 'rust'){ var rr = KT.bot.rust(st); klik(rr.wat === 'heel' ? $('rustHeel') : $('rustBeter')) || klik($('rustHeel')); }
        else if (s.soort === 'winkel'){
          var w = KT.bot.winkel(st);
          if (!w) klik($('stopVerder'));
          else if (w.wat === 'koop') klik($('vStop').querySelector('.koopknop[data-i="' + w.i + '"]')) || klik($('stopVerder'));
          else if (w.wat === 'pleister') klik($('koopPleister')) || klik($('stopVerder'));
          else klik($('koopWeg')) || klik($('stopVerder'));
        } else { var gk = KT.bot.gebeurtenis(st); klik($('vStop').querySelector('[data-o="' + gk.o + '"]')); }
      }
    } catch (fout){ bot.log.push('fout: ' + (fout && fout.message)); }
    bot.wek();
  };
  window.kaartBot = bot;
  /* voor de test: de beklimming van nu */
  window.__kt = function(){ return st; };
  window.__ktVraag = function(){ return huidig ? { goed:huidig.q.g, af:huidig.af } : null; };
  (function(){
    var m = /#testBot(?:=([0-9.]+))?/.exec(location.hash);
    if (m) setTimeout(function(){ bot.start(m[1] ? parseFloat(m[1]) : 0.75); }, 300);
  })();
})();
