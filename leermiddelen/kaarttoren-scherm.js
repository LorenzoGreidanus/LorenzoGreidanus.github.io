/* Kaarttoren: het scherm. De regels staan in kaarttoren-motor.js; hier staan
   het startscherm (met de dagtoren, de treden en wat er nog te winnen is), de
   vragen, de kaart van de toren, het gevecht, de tussenstops, de beloning en
   het eindscherm, plus het bewaren op dit apparaat en de speelbot voor de test.

   Wat er bewaard wordt (localStorage, alles met lg-kt- ervoor):
     lg-kt-run         de beklimming van nu, na elke stap, zodat je na herladen verder kunt
     lg-kt-laatst      je vorige keuze van vak, onderdelen en niveau
     lg-kt-voortgang   alle klimmen samen: verdiepingen, beste, overwinningen, hoogste trede
     lg-kt-dag         je beste klim in de dagtoren van vandaag
     lg-kt-trede       de trede die je het laatst koos
   Een beklimming van versie 1 (lg-kaarttoren-run-v1) wordt omgezet; lukt dat
   niet, dan begin je netjes opnieuw. De vragen komen uit bank.js, net als in
   Torenverdediging en Zwaardvechter.

   Testen: kaartBot.start(0.75) speelt vanzelf, met 75 procent goed; #testBot
   (of #testBot=0.9) in het adres start hem meteen. kaartBot.tempo is de tijd
   tussen twee stappen in ms. */
(function(){
  'use strict';
  var KT = window.KAARTTOREN, F = window.KT_FIGUUR, DEC = window.KT_DECOR;
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function lees(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e){ return null; } }
  function zet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e){} }
  function weg(k){ try { localStorage.removeItem(k); } catch (e){} }
  function bestaat(k){ try { return localStorage.getItem(k) !== null; } catch (e){ return false; } }
  var RUN = 'lg-kt-run', LAATST = 'lg-kt-laatst', VG = 'lg-kt-voortgang', DAG = 'lg-kt-dag', TREDE = 'lg-kt-trede';
  var OUD_RUN = 'lg-kaarttoren-run-v1', OUD_LAATST = 'lg-kaarttoren-laatst';
  var zacht = true;
  try { zacht = !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e){}
  var raak = document.documentElement.classList.contains('raak');

  var st = null;                 /* de beklimming */
  var vak = '', niveau = 'kgt', keuze = {};
  var bezig = false;             /* de tegenstander is aan zet: even niets aanraken */
  var melding = '';              /* een regel voor het logregeltje bij het volgende scherm */

  /* ---------- voortgang op dit apparaat ---------- */
  function voortgang(){
    var v = lees(VG) || {};
    return { totaal:+v.totaal || 0, beste:+v.beste || 0, winst:+v.winst || 0, trede:Math.max(0, Math.min(KT.MAXTREDE, +v.trede || 0)), klimmen:+v.klimmen || 0 };
  }
  function vandaag(){ return KT.dagCode(); }
  function dagRecord(){ var d = lees(DAG); return d && d.datum === vandaag() ? d : null; }
  /* een oude beklimming omzetten (eenmalig), daarna geldt alleen nog lg-kt- */
  (function(){
    if (bestaat(OUD_RUN)){
      var s = KT.zetOm(lees(OUD_RUN), KT.slot(voortgang()));
      if (s && !s.klaar && !bestaat(RUN)) zet(RUN, s);
      weg(OUD_RUN);
    }
    if (bestaat(OUD_LAATST)){ var l = lees(OUD_LAATST); if (l && !bestaat(LAATST)) zet(LAATST, l); weg(OUD_LAATST); }
  })();
  /* de bewaarde beklimming, alleen als hij klopt; anders weg ermee */
  function leesRun(){
    if (!bestaat(RUN)) return null;
    var s = KT.zetOm(lees(RUN), KT.slot(voortgang()));
    if (!s || s.klaar || !s.ui || !vakVan(s.vak)){ weg(RUN); return null; }
    return s;
  }

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
     fout pas na Volgende, zodat de uitleg blijft staan zolang jij wilt.
     o.gevecht: een vraag in een gevecht, waar de Spiekbriefje-joker werkt. */
  var huidig = null;
  function vraagIn(plek, o){
    var q = nieuweVraag(), h = { q:q, o:o, plek:plek, af:false, weg:[] };
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
        '<p class="jokerregel hide" id="jokerRegel">' + F.hulpje('joker') + 'Spiekbriefje-joker: twee foute antwoorden vallen weg.</p>' +
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
    if (o.gevecht && st && st.g && st.g.joker) jokerToepassen();
    if (window.VOORLEES) VOORLEES.knop($('vraagTekst'), function(){ return { v:q.v, o:q.o, taal:vak === 'eng' ? 'en-GB' : 'nl-NL' }; });
    if (window.MELDING) MELDING.knop($('meldPlek'), function(){ return { spel:'kaarttoren', vraag:q.v, q:q, vak:vak, niveau:niveau }; });
    if (window.SPEL && SPEL.inBeeld) SPEL.inBeeld(plek);
    tekenBalk();
    bot.wek();
  }
  /* de joker: twee foute antwoorden weg (bij twee opties maar een) */
  function jokerToepassen(){
    var h = huidig; if (!h || h.af || h.weg.length) return;
    var fout = h.q.o.map(function(t, i){ return i; }).filter(function(i){ return i !== h.q.g; }).sort(function(){ return Math.random() - 0.5; });
    h.weg = fout.slice(0, Math.min(2, h.q.o.length - 2 > 0 ? 2 : 1));
    h.weg.forEach(function(i){
      var b = h.plek.querySelector('.optie[data-i="' + i + '"]');
      if (b){ b.disabled = true; b.classList.add('weggestreept'); b.setAttribute('aria-label', h.q.o[i] + ': weggestreept door de joker'); }
    });
    var r = $('jokerRegel'); if (r) r.classList.remove('hide');
  }
  function beantwoord(i){
    var h = huidig;
    if (!h || h.af || !h.q.o[i] || h.weg.indexOf(i) >= 0) return;
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
    tekenBalk();
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
  function verdNu(){ return st.fase === 'kaart' ? Math.min(KT.HOOG, st.rij + 2) : Math.max(1, st.rij + 1); }

  /* ---------- de balk bovenaan: verdieping, doorzetting, munten, schatten en hulpjes ---------- */
  var balkSleutel = '', uitlegOpen = null;
  function tekenBalk(){
    if (!st) return;
    var f = verdNu();
    $('sbVerd').innerHTML = '<span class="ico ico-toren" aria-hidden="true"></span><span><span class="sb-lang">Verdieping </span>' + f +
      '<span class="sb-lang"> van </span><span class="sb-kort">/</span>' + KT.HOOG + '</span>' +
      '<span class="sb-deel">· ' + schoon(DEC.NAAM[DEC.deel(f)]) + '</span>' +
      (st.dag ? '<span class="sb-trede dag">dagtoren</span>' : st.trede ? '<span class="sb-trede">trede ' + st.trede + '</span>' : '');
    $('sbHpGetal').textContent = st.hp + '/' + st.max;
    $('sbMunt').textContent = st.munten;
    $('sbStapel').textContent = st.stapel.length;
    /* schatten en hulpjes alleen opnieuw tekenen als er iets veranderde, zodat de focus blijft staan */
    var kan = st.hulpjes.map(function(id, i){ return KT.hulpjeKan(st, i) && !bezig ? 1 : 0; }).join('');
    var sleutel = st.schatten.join(',') + '|' + st.hulpjes.join(',') + '|' + kan;
    if (sleutel !== balkSleutel){
      balkSleutel = sleutel;
      $('sbSchatten').innerHTML = '<span class="sb-label">schatten</span>' + (st.schatten.length ? st.schatten.map(function(id){
        var d = KT.SCHATTEN[id];
        return '<button type="button" class="dingknop" data-schat="' + id + '" aria-label="Schat: ' + schoon(d.naam) + '. Tik voor uitleg." title="' + schoon(d.naam) + '"><span>' + F.schat(id) + '</span></button>';
      }).join('') : '<span class="sb-geen">nog geen</span>');
      var h = '<span class="sb-label">hulpjes</span>';
      for (var i = 0; i < KT.MAXHULP; i++){
        var id = st.hulpjes[i];
        if (!id){ h += '<button type="button" class="dingknop leeg" disabled aria-label="Lege plek voor een hulpje"><span></span></button>'; continue; }
        var d = KT.HULPJES[id], nu = KT.hulpjeKan(st, i) && !bezig;
        h += '<button type="button" class="dingknop' + (nu ? ' kan' : '') + '" data-hulp="' + i + '" aria-label="Hulpje: ' + schoon(d.naam) + (nu ? ', nu te gebruiken' : '') + '. Tik voor uitleg." title="' + schoon(d.naam) + '"><span>' + F.hulpje(id) + '</span></button>';
      }
      $('sbHulpjes').innerHTML = h;
    }
    Array.prototype.forEach.call($('spelbalk').querySelectorAll('.dingknop[data-schat],.dingknop[data-hulp]'), function(b){
      var open = uitlegOpen && ((uitlegOpen.soort === 'schat' && b.getAttribute('data-schat') === uitlegOpen.id) || (uitlegOpen.soort === 'hulp' && +b.getAttribute('data-hulp') === uitlegOpen.i));
      b.classList.toggle('open', !!open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (uitlegOpen) tekenUitleg();
  }
  $('spelbalk').addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.dingknop') : null;
    if (!b || b.disabled) return;
    var s = b.getAttribute('data-schat'), h = b.getAttribute('data-hulp');
    var nieuw = s ? { soort:'schat', id:s } : h !== null ? { soort:'hulp', i:+h } : null;
    if (!nieuw) return;
    if (uitlegOpen && uitlegOpen.soort === nieuw.soort && uitlegOpen.id === nieuw.id && uitlegOpen.i === nieuw.i) uitlegOpen = null;
    else uitlegOpen = nieuw;
    if (!uitlegOpen) $('balkUitleg').classList.add('hide');
    tekenBalk();
  });
  /* de uitleg onder de balk: een tik op een schat of hulpje */
  function tekenUitleg(){
    var u = uitlegOpen, box = $('balkUitleg');
    if (!u || !st){ box.classList.add('hide'); return; }
    var h;
    if (u.soort === 'schat'){
      var d = KT.SCHATTEN[u.id]; if (!d){ uitlegOpen = null; box.classList.add('hide'); return; }
      h = '<span class="bu-ico">' + F.schat(u.id) + '</span><div class="bu-tekst"><span class="bu-soort">schat' + (d.zeld === 2 ? ' van een baas' : d.zeld === 1 ? ', zeldzaam' : '') + '</span><b>' + schoon(d.naam) + '</b><p>' + schoon(d.tekst) + '</p>' +
        '<div class="bu-knoppen"><button type="button" class="bu-dicht">Sluiten</button></div></div>';
    } else {
      var id = st.hulpjes[u.i]; if (!id){ uitlegOpen = null; box.classList.add('hide'); return; }
      var hd = KT.HULPJES[id], kan = KT.hulpjeKan(st, u.i) && !bezig;
      var waarom = kan ? '' : id === 'water' ? (st.hp >= st.max ? 'Je doorzetting is al vol.' : 'Nu even niet.') : hd.vraag ? 'Te gebruiken in een gevecht, ook bij de vraag.' : 'Te gebruiken in een gevecht, als je kaarten speelt.';
      h = '<span class="bu-ico">' + F.hulpje(id) + '</span><div class="bu-tekst"><span class="bu-soort">hulpje, eenmalig</span><b>' + schoon(hd.naam) + '</b><p>' + schoon(hd.tekst) + (waarom ? ' ' + schoon(waarom) : '') + '</p>' +
        '<div class="bu-knoppen"><button type="button" class="bu-gebruik"' + (kan ? '' : ' disabled') + '>Gebruik</button><button type="button" class="bu-gooi">Weggooien</button><button type="button" class="bu-dicht">Sluiten</button></div></div>';
    }
    box.innerHTML = h;
    box.classList.remove('hide');
  }
  $('balkUitleg').addEventListener('click', function(e){
    var t = e.target;
    if (t.closest('.bu-dicht')){ uitlegOpen = null; $('balkUitleg').classList.add('hide'); tekenBalk(); return; }
    if (t.closest('.bu-gebruik') && uitlegOpen && uitlegOpen.soort === 'hulp'){ gebruikHulpje(uitlegOpen.i); return; }
    if (t.closest('.bu-gooi') && uitlegOpen && uitlegOpen.soort === 'hulp'){
      var b = t.closest('.bu-gooi');
      /* weggooien vraagt eerst of het zeker is */
      if (!b.classList.contains('zeker')){ b.classList.add('zeker'); b.textContent = 'Zeker? Tik nog eens'; return; }
      var id = st.hulpjes[uitlegOpen.i];
      KT.gooiWeg(st, uitlegOpen.i); uitlegOpen = null; $('balkUitleg').classList.add('hide');
      $('logregel').textContent = KT.HULPJES[id].naam + ' weggegooid.';
      bewaar(); tekenBalk();
      if (st.fase === 'gevecht' && !huidig) tekenGevecht();
    }
  });
  function gebruikHulpje(i){
    if (!st || bezig) return;
    var id = st.hulpjes[i];
    if (!KT.gebruik(st, i)) return;
    var log = st.log.slice();
    uitlegOpen = null; $('balkUitleg').classList.add('hide');
    melding = KT.HULPJES[id].naam + ' gebruikt.';
    if (id === 'joker' && huidig && !huidig.af) jokerToepassen();
    bewaar();
    if (st.fase === 'gevecht' && $('vGevecht') && !$('vGevecht').classList.contains('hide')){
      speelLog(log);
      if (!huidig) tekenGevecht(); else tekenBalk();
    } else {
      $('logregel').textContent = melding; melding = '';
      tekenBalk();
      if (!huidig && st.fase === 'stop') tekenStop();
      if (!huidig && st.fase === 'kaart') tekenKaart();
    }
    bot.wek();
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
    return { naam:d.naam, soort:k.soort === 'baas' ? 'baas' : k.soort === 'lastpak' ? 'lastpak' : 'tegenstander',
             uit:k.soort === 'lastpak' ? 'Sterker, maar je krijgt een schat, een zeldzame kaart en meer munten.' : k.soort === 'baas' ? KT.trekje(k.vijand) || 'De sterkste van dit deel van de toren.' : '',
             stop:k.stop ? 'eerst ' + STOPNAAM[k.stop] : '' };
  }
  function tekenKaart(){
    view('vKaart');
    var ks = KT.keuzes(st), f = st.rij + 2;
    $('kaartKop').textContent = f === 5 || f === 12 ? 'Verdieping ' + f + ': de baas' : 'Verdieping ' + f + ': kies je kamer';
    $('kaartUit').textContent = st.rij < 0 ? 'Onderaan de toren, in ' + DEC.NAAM.gang + '. Kies waar je begint; de lijnen op de kaart laten zien waar je daarna heen kunt.'
      : ks.length === 1 ? 'Er is maar een weg naar boven.' : 'Je kunt naar ' + ks.length + ' kamers. Kijk ook wat er daarna komt.';
    $('kamers').innerHTML = ks.map(function(x, n){
      var t = kamerTekst(x.kamer);
      return '<button type="button" class="kamerknop soort-' + x.kamer.soort + '" data-i="' + x.i + '">' +
        '<span class="kamerfig">' + F.mini(x.kamer.vijand) + '</span>' +
        '<span class="kamertekst"><span class="soortlabel l-' + x.kamer.soort + '">' + t.soort + '</span><b>' + schoon(t.naam) + '</b>' +
        (t.uit ? '<small>' + schoon(t.uit) + '</small>' : '') +
        (t.stop ? '<small class="stoplabel stop-' + x.kamer.stop + '">' + schoon(t.stop) + '</small>' : '') + '</span>' +
        (raak ? '' : '<kbd aria-hidden="true">' + (n + 1) + '</kbd>') + '</button>';
    }).join('');
    Array.prototype.forEach.call($('kamers').querySelectorAll('.kamerknop'), function(b){
      b.addEventListener('click', function(){ kiesKamer(parseInt(b.getAttribute('data-i'), 10)); });
    });
    $('torenplan').innerHTML = torenSvg();
    tekenBalk();
    if (melding){ $('logregel').textContent = melding; }
    bot.wek();
  }
  function kiesKamer(i){
    if (!KT.kiesKamer(st, i)) return;
    bewaar();
    melding = '';
    tekenFase();
    scrollTo(0, 0);
  }
  /* De toren als tekening: een gebouw met vier delen (gang, aula, lokaal,
     bibliotheek), onderaan verdieping 1 en bovenaan 12. De weg die je liep is
     dik, de kamers waar je nu heen kunt lichten op. */
  function torenSvg(){
    var R = st.kaart, H = KT.HOOG, dy = 46, top = 64, W = 330;
    function x(k){ return 70 + k.c * 85; }
    function y(r){ return top + (H - 1 - r) * dy; }
    var hoogte = top + (H - 1) * dy + 34, lijn = '', knoop = '', bouw = '';
    var open = KT.keuzes(st).map(function(k){ return k.i; });
    var gelopen = {}; st.pad.forEach(function(k, r){ gelopen[r + ':' + k] = true; });
    /* het gebouw */
    bouw += '<path class="tp-dak" d="M24 ' + (top - 26) + ' L165 4 L306 ' + (top - 26) + ' Z"/>';
    bouw += '<rect class="tp-muur" x="28" y="' + (top - 26) + '" width="274" height="' + (hoogte - top + 22) + '"/>';
    /* elk deel een eigen band, met de naam staand in de rechterrand */
    var r = 0;
    while (r < H){
      var d = DEC.deel(r + 1), van = r;
      while (r + 1 < H && DEC.deel(r + 2) === d) r++;
      var y1 = y(r) - dy / 2, y2 = y(van) + dy / 2;
      if (d === 'aula') bouw += '<rect class="tp-band" x="30" y="' + y1 + '" width="270" height="' + dy + '"/>';
      else bouw += '<path class="tp-lijn" d="M30 ' + y1 + 'H300"/>';
      bouw += '<text class="tp-deel" transform="translate(292 ' + ((y1 + y2) / 2) + ') rotate(-90)" text-anchor="middle">' + DEC.NAAM[d] + '</text>';
      r++;
    }
    bouw += '<rect class="tp-rand" x="28" y="' + (top - 26) + '" width="274" height="' + (hoogte - top + 22) + '"/>';
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
          (kan ? '<circle r="' + (rr + 7) + '" class="gloed"/>' : '') +
          '<circle r="' + rr + '" class="rond"/>' +
          '<g transform="scale(' + (rr / 62).toFixed(3) + ')">' + F.teken(k.vijand, '') + '</g>' +
          (k.stop ? '<g transform="translate(' + (rr - 2) + ' ' + (-rr + 2) + ')"><circle r="7" class="stopbol stop-' + k.stop + '"/><text y="3.5" text-anchor="middle">' + (k.stop === 'rust' ? 'z' : k.stop === 'winkel' ? '€' : '?') + '</text></g>' : '') +
          '</g>';
      });
      knoop += '<text x="38" y="' + (y(r) + 4) + '" class="verdnr">' + (r + 1) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + hoogte + '" role="img" aria-label="De kaart van de toren: je bent op verdieping ' + Math.max(0, st.rij + 1) + ' van ' + H + '">' + bouw + lijn + knoop + '</svg>' +
      '<p class="legenda"><span><i class="stopbol stop-rust">z</i> rustplek</span><span><i class="stopbol stop-winkel">€</i> winkel</span><span><i class="stopbol stop-gebeurtenis">?</i> gebeurtenis</span><span><i class="lp"></i> lastpak</span></p>';
  }

  /* ---------- een kaart tekenen ---------- */
  var SOORTNAAM = { aanval:'aanval', verdediging:'verdediging', speciaal:'speciaal', rommel:'rommel' };
  function kaartHtml(k, o){
    o = o || {};
    var t = KT.tekst(k, o.g, st ? st.reeks : 0, st), kleur = kaartKleur(t), d = KT.KAARTEN[k.id] || {};
    var basis = KT.effect(k).kost;
    var beeld = t.fig === 'persoon' && window.AVATAR ? AVATAR.svg(d.naam, 44) : F.kaartIcoon(t.soort, t.fig);
    var tekst = t.vraag ? '<span class="kk-tekst"><span class="kk-goed">Goed: ' + schoon(t.goed) + '</span><span class="kk-fout">Fout: ' + schoon(t.fout) + '</span></span>'
                        : '<span class="kk-tekst">' + schoon(t.doe) + '</span>';
    var merk = t.vraag ? '?' : t.zeld === 1 ? '★' : '';
    var binnen = '<span class="kk-kop" style="--kk:' + kleur + ';--kkinkt:' + inktOp(kleur) + '"><span class="kk-kost' + (t.kost < basis ? ' minder' : '') + '" aria-hidden="true">' + t.kost + '</span>' +
        '<span class="kk-beeld">' + beeld + '</span>' + (merk ? '<span class="kk-merk" aria-hidden="true">' + merk + '</span>' : '') + '</span>' +
      '<span class="kk-romp"><b class="kk-naam">' + schoon(t.naam) + '</b>' +
      (t.eerst ? '<span class="kk-eerst">' + schoon(t.eerst) + '</span>' : '') + tekst +
      (t.slim ? '<span class="kk-slim' + (o.g && o.g.slim ? ' aan' : '') + '"><span class="ico ico-bliksem" aria-hidden="true"></span>' + schoon(t.slim) + '</span>' : '') +
      (t.na ? '<span class="kk-na">' + schoon(t.na) + '</span>' : '') +
      (o.bij && t.bij ? '<span class="kk-bij">' + schoon(t.bij) + '</span>' : '') +
      '<span class="kk-voet">' + schoon(t.vak ? vakNaam(t.vak) : SOORTNAAM[t.soort] || '') + (t.zeld === 1 ? ' · zeldzaam' : '') + '</span></span>';
    var label = t.naam + ', ' + t.kost + ' energie, ' + (t.vak ? 'vakkaart ' + vakNaam(t.vak) : SOORTNAAM[t.soort]) + '. ' + (t.eerst ? t.eerst + ' ' : '') + (t.vraag ? 'Goed: ' + t.goed + '. Fout: ' + t.fout + '.' : t.doe + '.') +
      (t.slim ? ' Na een goed antwoord erbij: ' + t.slim + '.' : '') + (t.na ? ' ' + t.na : '') + (o.bij && t.bij ? ' ' + t.bij : '') + (o.kan ? ' ' + o.kan : '');
    var kl = 'kk soort-' + t.soort + (t.vak ? ' vakk' : '') + (t.zeld === 1 ? ' zeldzaam' : '') + (k.p ? ' beter' : '') + (o.kan ? ' kanniet' : '') + (o.groot ? ' groot' : '') + (o.klasse ? ' ' + o.klasse : '');
    if (o.knop === false) return '<div class="' + kl + '" role="listitem" aria-label="' + schoon(label) + '">' + binnen + '</div>';
    return '<button type="button" class="' + kl + '"' + (o.data || '') + ' aria-label="' + schoon(label) + '"' + (o.uit ? ' disabled' : '') + '>' + binnen + '</button>';
  }
  /* een schat of hulpje als kaartje (winkel, beloning) */
  function dingHtml(soort, id, extra){
    var d = soort === 'schat' ? KT.SCHATTEN[id] : KT.HULPJES[id];
    return '<span class="dingkaart"><span class="di-ico">' + (soort === 'schat' ? F.schat(id) : F.hulpje(id)) + '</span><span><span class="di-soort">' +
      (soort === 'schat' ? 'schat' + (d.zeld === 2 ? ' van een baas' : d.zeld === 1 ? ', zeldzaam' : '') : 'hulpje') + '</span><b>' + schoon(d.naam) + '</b><p>' + schoon(d.tekst) + '</p>' + (extra || '') + '</span></span>';
  }

  /* ---------- het gevecht ---------- */
  var laatsteFig = '', laatsteDecor = '';
  var PLANICO = { aanval:'<path d="M5 19L17 7M14 5l5 5M4 20l2-2"/>', blok:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/>',
    kracht:'<path d="M12 20V6M6 12l6-6 6 6"/>', heel:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    raar:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>' };
  function tekenGevecht(){
    var g = st.g; if (!g) return;
    var v = g.v, vd = KT.VIJANDEN[v.id];
    tekenBalk();
    var dl = DEC.deel(KT.kamer(st).f);
    if (laatsteDecor !== dl){ $('arenaDecor').innerHTML = DEC.plek(dl); laatsteDecor = dl; }
    /* de tegenstander: alleen opnieuw tekenen als zijn gezicht verandert */
    var stem = v.hp <= 0 ? 'op' : '';
    if (laatsteFig !== v.id + stem){ $('vijandG').innerHTML = F.teken(v.id, stem); laatsteFig = v.id + stem; }
    $('vijandNaam').textContent = v.naam + (vd.baas ? ' (baas)' : vd.lastpak ? ' (lastpak)' : '');
    var trek = KT.trekje(v.id);
    $('vijandTrek').textContent = trek; $('vijandTrek').classList.toggle('hide', !trek);
    $('zijBalk').style.width = Math.max(0, 100 * v.hp / v.max) + '%';
    $('zijGetal').textContent = v.hp + ' / ' + v.max + (v.blok ? ' · ' + v.blok + ' blok' : '');
    $('zijStanden').innerHTML = standen([[v.kracht, 'kracht', 'kracht: elke klap doet zoveel meer'],
      [v.zwak, 'zwak', 'zwak: zijn klappen doen een kwart minder'], [v.wankel, 'wankel', 'wankel: hij krijgt de helft meer schade']]);
    var p = KT.planTekst(st), na = KT.heeft(st, 'leesbril') ? KT.planTekst(st, 1) : null;
    $('plan').className = 'voornemen vn-' + (p ? p.soort : 'anders') + (v.hp <= 0 ? ' hide' : '');
    $('plan').innerHTML = p ? '<span class="vn-ico"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (PLANICO[p.soort] || PLANICO.raar) + '</svg>' + (p.getal ? '<span aria-hidden="true">' + schoon(p.getal) + '</span>' : '') + '</span>' +
      '<span class="vn-tekst"><small>van plan</small>' + schoon(p.tekst) +
      (p.extra ? '<span class="vn-extra">+' + p.extra + ' per klap: vraag fout</span>' : '') +
      (na ? '<span class="vn-daarna">daarna: ' + schoon(na.tekst) + '</span>' : '') + '</span>' : '';
    /* jij */
    if (!$('jijFig').firstChild) $('jijFig').innerHTML = jijSvg();
    $('jijBalk').style.width = Math.max(0, 100 * st.hp / st.max) + '%';
    $('jijGetal').textContent = st.hp + ' / ' + st.max + (g.blok ? ' · ' + g.blok + ' blok' : '');
    $('jijStanden').innerHTML = standen([[g.kracht, 'kracht', 'kracht: elke klap doet zoveel meer'],
      [g.zwak, 'zwak', 'zwak: je klappen doen een kwart minder'], [g.wankel, 'wankel', 'wankel: je krijgt de helft meer schade'],
      [st.reeks >= KT.vuurGrens(st) ? 'vuur' : st.reeks >= KT.dreefGrens(st) ? 'dreef' : 0, 'dreef', st.reeks >= KT.vuurGrens(st) ? 'in vuur en vlam: ' + st.reeks + ' goed op rij' : 'op dreef: ' + st.reeks + ' goed op rij'],
      [g.goedHier, 'kennis', 'kennis: zoveel goede antwoorden in dit gevecht'],
      [g.pb, 'pb', 'elke beurt zoveel blok'], [g.pg, 'pg', 'na elk goed antwoord zoveel blok'], [g.pd, 'pd', 'na elk goed antwoord zoveel schade op de tegenstander'],
      [g.pk, 'pk', 'elke beurt zoveel kracht erbij'], [g.dv ? 'ja' : 0, 'dv', 'je volgende vraagkaart telt dubbel'], [g.ve, 've', 'volgende beurt zoveel energie extra'],
      [g.joker ? 'ja' : 0, 'joker', 'de joker streept bij de volgende vraag twee foute antwoorden weg']]);
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
  var STANDNAAM = { pb:'elke beurt blok', pg:'goed: blok', pd:'goed: schade', pk:'elke beurt kracht', dv:'dubbele vraagkaart', ve:'volgende beurt energie', joker:'joker klaar', kennis:'kennis' };
  function standen(lijst){
    return lijst.filter(function(s){ return s[0]; }).map(function(s){
      var n = s[0] === 'vuur' ? 'in vuur en vlam' : s[0] === 'dreef' ? 'op dreef' : (STANDNAAM[s[1]] || s[1]) + (s[0] === 'ja' ? '' : ' ' + s[0]);
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
      titel:titel, gevecht:true,
      goedTekst:'Je bent opgeladen: extra energie en een kaart meer, en ' + g.v.naam + ' schrikt: zijn klap is deze beurt zwakker.',
      foutTekst:'Dit wordt een gewone beurt. Tik op Volgende als je klaar bent met lezen.',
      antwoord:function(goed){
        KT.antwoord(st, goed);
        var log = st.log.slice();
        var extra = log.filter(function(l){ return l.t === 'dreef'; })[0];
        if (extra) melding = extra.vuur ? 'In vuur en vlam! ' + st.reeks + ' goed op rij: nog meer energie en elke klap doet ' + KT.B.vuurKracht + ' meer.'
                                        : 'Op dreef! ' + st.reeks + ' goed op rij: een energie extra en elke klap doet ' + KT.B.dreefKracht + ' meer.';
        speelLog(log, true);
        bewaar();
      },
      klaar:function(){
        $('vraagPlek').classList.add('hide'); $('vraagPlek').innerHTML = '';
        /* een kaart of schat die op een goed antwoord wacht kan het gevecht al beslissen */
        if (st.fase !== 'gevecht' || st.g.fase === 'klaar') return naKaart();
        tekenGevecht(); focusHand();
      }
    });
  }
  function focusHand(){
    if (raak) return;
    var b = $('hand').querySelector('.kk:not(.kanniet)') || $('klaarBtn');
    try { b.focus({ preventScroll:true }); } catch (e){}
  }
  var gespeeld = {};
  function speelKaart(h){
    var g = st && st.g;
    if (!g || g.fase !== 'spelen' || bezig || huidig) return;
    var reden = KT.magSpelen(st, h);
    if (reden){ $('logregel').textContent = reden; schud($('hand').children[h]); return; }
    var e = KT.effect(g.hand[h]);
    if (e.vraag){
      $('handPlek').classList.add('hide');
      var tk = KT.tekst(g.hand[h], g, st.reeks, st);
      vraagIn($('vraagPlek'), {
        titel:e.naam + ': een extra vraag', snel:true, gevecht:true,
        goedTekst:tk.goed + '.' + ((g.dv || g.postit) ? ' En dat telt dubbel.' : ''),
        foutTekst:'Je kaart doet nu: ' + tk.fout.toLowerCase() + '.',
        antwoord:function(goed){ KT.speel(st, h, goed); naSpelen(st.log.slice()); },
        klaar:function(){ $('vraagPlek').classList.add('hide'); $('vraagPlek').innerHTML = ''; naKaart(); }
      });
      return;
    }
    KT.speel(st, h);
    naSpelen(st.log.slice());
    naKaart();
  }
  function naSpelen(log){
    var kaart = log.filter(function(l){ return l.t === 'speel'; })[0];
    if (kaart){
      gespeeld[kaart.id] = (gespeeld[kaart.id] || 0) + 1;
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
      if (st.fase !== 'gevecht' || st.g.fase === 'klaar'){ tekenFase(); return; }
      tekenGevecht();
      if (st.g.fase === 'vraag') beurtVraag();
    }, zacht ? 900 : 350);
  }
  /* wat er gebeurde: zwevende getallen, een schudje, en een regel voor wie niet kijkt */
  var SCHATZIN = { gelukspen:'Gelukspen: je trekt 2 kaarten.', koptelefoon:'Je koptelefoon houdt het tegen.' };
  function speelLog(log, stil){
    var zinnen = [];
    log.forEach(function(l){
      var jij = l.op === 'j', wie = jij ? 'jij' : 'zij';
      if (l.t === 'raak'){
        if (l.n) zweef(wie, '-' + l.n, 'schade');
        if (l.blok) zweef(wie, l.blok + ' geblokt', 'blok');
        schud(jij ? $('jijFig') : $('vijandFig'));
        /* klappen achter elkaar op dezelfde: een zin, niet vijf */
        var vorige = zinnen.length && zinnen[zinnen.length - 1];
        if (vorige && vorige.raak === wie){ vorige.n += l.n; vorige.blok += l.blok; vorige.x++; }
        else zinnen.push({ raak:wie, n:l.n, blok:l.blok, x:1 });
      } else if (l.t === 'blok'){ zweef(wie, '+' + l.n + ' blok', 'blok'); }
      else if (l.t === 'heel'){ if (l.n){ zweef('jij', '+' + l.n, 'heel'); zinnen.push('Je herstelt ' + l.n + '.'); } }
      else if (l.t === 'vheel'){ if (l.n){ zweef('zij', '+' + l.n, 'heel'); zinnen.push(st.g.v.naam + ' herstelt ' + l.n + '.'); } }
      else if (l.t === 'kracht'){ zweef(wie, '+' + l.n + ' kracht', 'kracht'); }
      else if (l.t === 'zwak'){ if (!stil || !l.schrik) zweef(wie, l.schrik ? 'schrikt' : 'zwak', 'zwak'); }
      else if (l.t === 'wankel'){ zweef(wie, 'wankel', 'zwak'); }
      else if (l.t === 'rommel'){ zinnen.push(st.g.v.naam + ' stopt ' + (l.id === 'kauwgom' ? 'kauwgom' : l.n === 1 ? 'een propje' : l.n + ' propjes') + ' in je stapel.'); }
      else if (l.t === 'ruim'){ zinnen.push(l.n ? (l.n === 1 ? 'Een stuk rommel' : l.n + ' stukken rommel') + ' opgeruimd.' : 'Er was geen rommel om op te ruimen.'); }
      else if (l.t === 'dubbel'){ zinnen.push('Dat telt dubbel!'); }
      else if (l.t === 'slim' && l.laat){ zinnen.push('Herkansing gelukt: je bent alsnog opgeladen.'); }
      else if (l.t === 'schoon'){ zinnen.push('Je bent weer rustig: niet meer zwak of wankel.'); }
      else if (l.t === 'schatwerkt'){ if (SCHATZIN[l.id]) zinnen.push(SCHATZIN[l.id]); }
      else if (l.t === 'boos'){ zinnen.push(st.g.v.naam + ' raakt geïrriteerd: ' + l.n + ' kracht erbij.'); }
      else if (l.t === 'munt'){ zweef('jij', '+' + l.n + ' munten', 'munt'); }
      else if (l.t === 'op'){ var d = KT.VIJANDEN[l.id]; zinnen.push(d.naam + ' ' + d.op + '.'); }
      else if (l.t === 'uitgeteld'){ zinnen.push('Je hebt even geen puf meer.'); }
    });
    zinnen = zinnen.map(function(z){
      if (typeof z === 'string') return z;
      return (z.raak === 'jij' ? 'Je krijgt ' : st.g.v.naam + ' krijgt ') + z.n + ' schade' + (z.x > 1 ? ' in ' + z.x + ' klappen' : '') + (z.blok ? ' (' + z.blok + ' geblokt).' : '.');
    });
    if (zinnen.length && !melding) $('logregel').textContent = zinnen.join(' ');
    else if (melding){ $('logregel').textContent = melding + (zinnen.length ? ' ' + zinnen.join(' ') : ''); melding = ''; }
  }
  function zweef(waar, tekst, soort){
    var laag = $('zwevers'); if (!laag) return;
    var s = document.createElement('span');
    s.className = 'zwever zw-' + waar + ' z-' + soort;
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
    if (document.hidden || $('scherm-spel').classList.contains('hide') || $('vGevecht').classList.contains('hide')){ adem.aan = false; return; }
    var s = Math.sin(t / 620);
    adem.el.setAttribute('transform', 'translate(0 ' + (s * 1.8).toFixed(2) + ') scale(' + (1 + s * 0.02).toFixed(4) + ')');
    requestAnimationFrame(ademTik);
  }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden && st && st.fase === 'gevecht') ademStart(); });

  /* ---------- tussenstops ---------- */
  var STOPICO = {
    rust:'<path d="M3 17h18M5 17v-5h14v5M7 12V9h4v3M5 17v3M19 17v3"/>',
    winkel:'<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M10 20v-6h4v6"/>',
    gebeurtenis:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
    beloning:'<path d="M12 3l2.4 5.6 6 .6-4.5 4 1.3 6-5.2-3.1-5.2 3.1 1.3-6-4.5-4 6-.6z"/>'
  };
  function stopKop(soort, hand, titel){
    return '<div class="stopkop"><span class="stopico s-' + soort + '"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + STOPICO[soort] + '</svg></span>' +
      '<div><p class="hand">' + hand + '</p><h2>' + titel + '</h2></div></div>';
  }
  function tekenStop(){
    view('vStop');
    var s = st.stop, k = KT.kamer(st), vd = KT.VIJANDEN[k.vijand], na = '<p class="stopna">Daarna: ' + schoon(vd.naam) + '.</p>', h = '';
    if (s.soort === 'rust'){
      var n = Math.min(st.max - st.hp, KT.rustHeel(st));
      h = '<div class="stopkaart kt-paneel">' + stopKop('rust', 'even op adem komen', 'Rustplek: de bank in de gang') + '<p class="vuit">Kies een van de twee.</p>' +
        '<div class="stopkeuzes">' +
          '<button type="button" class="keuzeknop" id="rustHeel"><b>Uitrusten</b><span>' + (n ? 'Herstel ' + n + ' doorzetting' + (KT.heeft(st, 'broodtrommel') ? ' (met je broodtrommel)' : '') + '. Je hebt er nu ' + st.hp + ' van de ' + st.max + '.' : 'Je doorzetting is al vol; oefenen levert nu meer op.') + '</span></button>' +
          '<button type="button" class="keuzeknop" id="rustBeter"' + (kanBeter().length ? '' : ' disabled') + '><b>Oefenen</b><span>' + (kanBeter().length ? 'Verbeter een kaart uit je stapel.' : 'Al je kaarten zijn al verbeterd.') + '</span></button>' +
        '</div>' + na + '</div>';
      $('vStop').innerHTML = h;
      $('rustHeel').addEventListener('click', function(){ KT.rust(st, 'heel'); melding = 'Uitgerust: +' + n + ' doorzetting.'; naStop(); });
      $('rustBeter').addEventListener('click', function(){
        kiesUitStapel('Welke kaart wil je verbeteren?', kanBeter(), function(i){ var nm = KT.effect(st.stapel[i]).naam; KT.rust(st, 'beter', i); melding = nm + ' is verbeterd.'; naStop(); }, true);
      });
    } else if (s.soort === 'winkel'){
      var vol = st.hulpjes.length >= KT.MAXHULP;
      h = '<div class="stopkaart kt-paneel">' + stopKop('winkel', 'even shoppen', 'De schoolwinkel') + '<p class="vuit">Je hebt <b>' + st.munten + '</b> munten.' + (KT.heeft(st, 'kluissleutel') ? ' Met je kluissleutel is alles een kwart goedkoper.' : '') + '</p>' +
        '<h3 class="winkelkop">Kaarten</h3>' +
        '<div class="waren">' + s.waren.map(function(w, i){
          var te = st.munten < w.prijs;
          return '<div class="waar' + (w.weg ? ' verkocht' : '') + '">' + kaartHtml({ id:w.id, p:0 }, { knop:false, bij:true }) +
            '<button type="button" class="koopknop" data-i="' + i + '"' + (w.weg || te ? ' disabled' : '') + '>' + (w.weg ? 'Gekocht' : 'Koop voor ' + w.prijs) + '<span class="ico ico-munt" aria-hidden="true"></span></button></div>';
        }).join('') + '</div>' +
        ((s.schatten || []).length ? '<h3 class="winkelkop">Schatten <small>blijven de hele klim</small></h3><div class="dingen">' + s.schatten.map(function(w, i){
          var te = st.munten < w.prijs || KT.heeft(st, w.id);
          return '<div class="waar' + (w.weg ? ' verkocht' : '') + '">' + dingHtml('schat', w.id) +
            '<button type="button" class="koopknop" data-schat="' + i + '"' + (w.weg || te ? ' disabled' : '') + '>' + (w.weg ? 'Gekocht' : 'Koop voor ' + w.prijs) + '<span class="ico ico-munt" aria-hidden="true"></span></button></div>';
        }).join('') + '</div>' : '') +
        ((s.hulpjes || []).length ? '<h3 class="winkelkop">Hulpjes <small>' + (vol ? 'je zakken zijn vol (drie hulpjes)' : 'eenmalig, hoogstens drie') + '</small></h3><div class="dingen">' + s.hulpjes.map(function(w, i){
          var te = st.munten < w.prijs || vol;
          return '<div class="waar' + (w.weg ? ' verkocht' : '') + '">' + dingHtml('hulp', w.id) +
            '<button type="button" class="koopknop" data-hulp="' + i + '"' + (w.weg || te ? ' disabled' : '') + '>' + (w.weg ? 'Gekocht' : 'Koop voor ' + w.prijs) + '<span class="ico ico-munt" aria-hidden="true"></span></button></div>';
        }).join('') + '</div>' : '') +
        '<div class="stopkeuzes">' +
          '<button type="button" class="keuzeknop" id="koopPleister"' + (s.pleister.weg || st.munten < s.pleister.prijs || st.hp >= st.max ? ' disabled' : '') + '><b>Pleisters, ' + s.pleister.prijs + ' munten</b><span>' + (s.pleister.weg ? 'Gekocht.' : 'Herstel ' + s.pleister.h + ' doorzetting.') + '</span></button>' +
          '<button type="button" class="keuzeknop" id="koopWeg"' + (s.wegGedaan || st.munten < s.wegPrijs || st.stapel.length <= 5 ? ' disabled' : '') + '><b>Een kaart weggooien, ' + s.wegPrijs + ' munten</b><span>' + (s.wegGedaan ? 'Gedaan.' : 'Een kleinere stapel geeft vaker je beste kaarten.') + '</span></button>' +
        '</div>' +
        '<button type="button" class="btn" id="stopVerder">Verder naar ' + schoon(vd.naam) + '</button></div>';
      $('vStop').innerHTML = h;
      function nawinkel(log){
        var x = log.filter(function(l){ return l.t === 'erbij' || l.t === 'schat' || l.t === 'hulpje'; })[0];
        $('logregel').textContent = '';
        melding = x ? (x.t === 'erbij' ? KT.KAARTEN[x.id].naam + ' zit nu in je stapel.' : x.t === 'schat' ? 'Nieuwe schat: ' + KT.SCHATTEN[x.id].naam + '.' : 'Nieuw hulpje: ' + KT.HULPJES[x.id].naam + '.') : '';
        bewaar(); tekenStop(); tekenBalk();
      }
      Array.prototype.forEach.call($('vStop').querySelectorAll('.koopknop'), function(b){
        b.addEventListener('click', function(){
          var ok = b.hasAttribute('data-schat') ? KT.koopSchat(st, +b.getAttribute('data-schat')) : b.hasAttribute('data-hulp') ? KT.koopHulpje(st, +b.getAttribute('data-hulp')) : KT.koop(st, +b.getAttribute('data-i'));
          if (ok) nawinkel(st.log.slice());
        });
      });
      $('koopPleister').addEventListener('click', function(){ if (KT.pleister(st)){ bewaar(); tekenStop(); tekenBalk(); } });
      $('koopWeg').addEventListener('click', function(){
        kiesUitStapel('Welke kaart gooi je weg?', st.stapel.map(function(k, i){ return i; }), function(i){ KT.weg(st, i); bewaar(); tekenStop(); tekenBalk(); });
      });
      $('stopVerder').addEventListener('click', function(){ KT.verder(st); naStop(); });
    } else {
      var gb = KT.gebeurtenisDef(st);
      h = '<div class="stopkaart kt-paneel">' + stopKop('gebeurtenis', 'onderweg', schoon(gb.titel)) + '<p class="vuit">' + schoon(gb.tekst) + '</p>' +
        '<div class="stopkeuzes" id="gbKeuzes">' + gb.opties.map(function(o, i){
          var kan = KT.optieKan(st, o);
          var onder = !kan ? (o.mk && st.munten < o.mk ? 'Je hebt maar ' + st.munten + ' munten.' : 'Dat kan nu niet.') : o.vragen ? (o.vragen === 1 ? 'Een vraag' : o.vragen + ' vragen') : '';
          return '<button type="button" class="keuzeknop" data-o="' + i + '"' + (kan ? '' : ' disabled') + '><b>' + schoon(o.t) + '</b>' + (onder ? '<span>' + onder + '</span>' : '') + '</button>';
        }).join('') + '</div><div class="vraagplek hide" id="gbVraag"></div>' + na + '</div>';
      $('vStop').innerHTML = h;
      Array.prototype.forEach.call($('vStop').querySelectorAll('[data-o]'), function(b){
        b.addEventListener('click', function(){ gebeurtenisKies(+b.getAttribute('data-o')); });
      });
    }
    tekenBalk();
    if (melding){ $('logregel').textContent = melding; melding = ''; }
    bot.wek();
  }
  function kanBeter(){ return st.stapel.map(function(k, i){ return i; }).filter(function(i){ return !st.stapel[i].p && KT.KAARTEN[st.stapel[i].id].plus; }); }
  function gebeurtenisKies(o){
    var gb = KT.gebeurtenisDef(st), opt = gb.opties[o], uit = [];
    if (!KT.optieKan(st, opt)) return;
    var voor = { munten:st.munten, max:st.max };
    function klaar(kaart){
      if (!KT.gebeurtenis(st, o, uit, kaart)) return;
      var d = [];
      st.log.forEach(function(l){
        if (l.t === 'betaal') d.push('-' + l.n + ' munten');
        if (l.t === 'kwijt' && l.n) d.push('-' + l.n + ' doorzetting');
        if (l.t === 'heel' && l.n) d.push('+' + l.n + ' doorzetting');
        if (l.t === 'beter') d.push(KT.KAARTEN[l.id].naam + ' is verbeterd');
        if (l.t === 'weg') d.push(KT.KAARTEN[l.id].naam + ' is weg');
        if (l.t === 'ruil') d.push(KT.KAARTEN[l.van].naam + ' geruild voor ' + KT.KAARTEN[l.id].naam);
        if (l.t === 'erbij') d.push(KT.KAARTEN[l.id].naam + ' zit nu in je stapel');
        if (l.t === 'schat') d.push('nieuwe schat: ' + KT.SCHATTEN[l.id].naam);
        if (l.t === 'hulpje') d.push('nieuw hulpje: ' + KT.HULPJES[l.id].naam);
        if (l.t === 'vol') d.push('je zakken zijn vol, dus ' + l.n + ' munten in plaats van ' + KT.HULPJES[l.id].naam.toLowerCase());
      });
      var munt = st.munten - voor.munten + st.log.filter(function(l){ return l.t === 'betaal'; }).reduce(function(a, l){ return a + l.n; }, 0);
      if (munt > 0) d.unshift('+' + munt + ' munten');
      if (st.max > voor.max) d.push('+' + (st.max - voor.max) + ' doorzetting voor de rest van de klim');
      melding = gb.titel + (d.length ? ': ' + d.join(', ') + '.' : ': je loopt door.');
      naStop();
    }
    if (opt.weg){ kiesUitStapel('Welke kaart gooi je weg?', st.stapel.map(function(k, i){ return i; }), klaar); return; }
    if (opt.beterKies){ kiesUitStapel('Welke kaart wil je verbeteren?', kanBeter(), klaar, true); return; }
    if (!opt.vragen) return klaar();
    $('gbKeuzes').classList.add('hide');
    var n = 0;
    (function volgende(){
      vraagIn($('gbVraag'), {
        titel:gb.titel + (opt.vragen > 1 ? ': vraag ' + (n + 1) + ' van ' + opt.vragen : ''),
        goedTekst:opt.perGoed ? (opt.perGoed.m ? '+' + opt.perGoed.m + ' munten.' : opt.perGoed.h ? '+' + opt.perGoed.h + ' doorzetting.' : opt.perGoed.beter ? 'Een kaart wordt beter.' : '') : '',
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
      var nt = KT.tekst({ id:k.id, p:1 });
      var na = verbetering ? '<span class="kk-wordt">wordt: ' + schoon(nt.vraag ? 'goed: ' + nt.goed + ', fout: ' + nt.fout : nt.doe) + (nt.kost !== KT.tekst(k).kost ? ' (kost ' + nt.kost + ')' : '') + '</span>' : '';
      return kaartHtml(k, { data:' data-i="' + i + '"', bij:true, klasse:'kiesbaar' }).replace(/<\/button>$/, na + '</button>');
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
    var heel = !vd.baas ? ' Je puft even uit: tot ' + (st.trede >= 2 ? 9 : KT.B.naGevecht) + ' doorzetting terug.' : ' Na een baas mag je even bijkomen.';
    var h = '<div class="stopkaart kt-paneel beloning">' + stopKop('beloning', 'gelukt!', schoon(vd.naam) + ' ' + schoon(vd.op) + '.') +
      '<p class="vuit"><span class="ico ico-munt" aria-hidden="true"></span> +' + b.munten + ' munten.' + schoon(heel) + '</p>';
    if (b.schat && !b.schatKeuze) h += '<div class="belding">' + dingHtml('schat', b.schat, '<p><b>Deze schat is van jou.</b></p>') + '</div>';
    if (b.hulpje) h += '<div class="belding">' + dingHtml('hulp', b.hulpje, '<p><b>Dit hulpje zit nu in je zak.</b></p>') + '</div>';
    if (b.schatKeuze){
      h += '<h3 class="kiesKop">Kies een schat van de baas</h3><div class="schatkeuze">' + b.schatKeuze.map(function(id, i){
        return '<button type="button" class="dingkaart" data-s="' + i + '">' + dingHtml('schat', id).replace(/^<span class="dingkaart">|<\/span>$/g, '') + '</button>';
      }).join('') + '</div>';
    } else {
      h += '<h3 class="kiesKop">Kies een kaart voor je stapel</h3>' +
        '<div class="belkaarten">' + b.opties.map(function(id, i){ return kaartHtml({ id:id, p:0 }, { data:' data-b="' + i + '"', bij:true, groot:true }); }).join('') + '</div>' +
        '<button type="button" class="linkbtn geenkaart" id="belGeen">Geen kaart nemen</button>';
    }
    $('vBeloning').innerHTML = h + '</div>';
    Array.prototype.forEach.call($('vBeloning').querySelectorAll('[data-b]'), function(x){
      x.addEventListener('click', function(){ kiesBeloning(+x.getAttribute('data-b')); });
    });
    Array.prototype.forEach.call($('vBeloning').querySelectorAll('[data-s]'), function(x){
      x.addEventListener('click', function(){
        var id = st.bel.schatKeuze[+x.getAttribute('data-s')];
        if (KT.kiesSchat(st, +x.getAttribute('data-s'))){ melding = 'Nieuwe schat: ' + KT.SCHATTEN[id].naam + '.'; bewaar(); tekenBeloning(); tekenBalk(); }
      });
    });
    if ($('belGeen')) $('belGeen').addEventListener('click', function(){ kiesBeloning(-1); });
    tekenBalk();
    if (melding){ $('logregel').textContent = melding; melding = ''; }
    bot.wek();
  }
  function kiesBeloning(i){
    var id = i >= 0 ? st.bel.opties[i] : null;
    if (!KT.beloning(st, i)) return;
    melding = id ? KT.KAARTEN[id].naam + ' zit nu in je stapel.' : '';
    bewaar(); tekenFase(); scrollTo(0, 0);
  }

  /* ---------- het einde ---------- */
  function namenVan(ids){
    return ids.map(function(id){ return KT.KAARTEN[id] ? 'de kaart ' + KT.KAARTEN[id].naam : KT.SCHATTEN[id] ? 'de schat ' + KT.SCHATTEN[id].naam : id; });
  }
  function lijstZin(a){ return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' en ' + a[a.length - 1]; }
  /* de voortgang bijwerken: eenmalig per klim */
  function telKlim(s){
    if (s.ui.geteld) return null;
    s.ui.geteld = true;
    var v = voortgang(), slotVoor = KT.slot(v), tredeVoor = v.trede;
    v.totaal += s.verdiepingen; v.beste = Math.max(v.beste, s.verdiepingen); v.klimmen++;
    if (s.gewonnen){ v.winst++; if ((s.trede || 0) === v.trede && v.trede < KT.MAXTREDE) v.trede++; }
    zet(VG, v);
    var slotNa = KT.slot(v);
    if (s.dag && s.dag === vandaag()){
      var d = dagRecord() || { datum:s.dag, keer:0, beste:null };
      d.keer++;
      var p = KT.punten(s);
      if (!d.beste || p > d.beste.punten) d.beste = { verd:s.verdiepingen, punten:p, gewonnen:s.gewonnen, goed:s.goed, totaal:s.goed + s.fout };
      zet(DAG, d);
    }
    return { nieuw:slotVoor.filter(function(id){ return slotNa.indexOf(id) < 0; }), trede:v.trede > tredeVoor ? v.trede : 0 };
  }
  function einde(){
    var s = st;
    weg(RUN);
    var nieuw = telKlim(s);
    toon('einde');
    var vk = vakVan(s.vak), nv = nivVan(s.ui.niveau), laatste = s.kaart[Math.max(0, s.rij)][Math.max(0, s.kol)], vd = KT.VIJANDEN[laatste.vijand];
    $('eindHand').textContent = s.gewonnen ? 'de top!' : 'even uitgeteld';
    $('eindKop').textContent = s.gewonnen ? 'Je staat bovenaan de toren' : 'Verdieping ' + s.verdiepingen + ' gehaald';
    var totaal = s.goed + s.fout;
    $('eindUit').textContent = (s.gewonnen ? vd.naam + ' ' + vd.op + '. ' : vd.naam + ' was je deze keer te slim af op verdieping ' + (s.rij + 1) + '. ') +
      'Je beantwoordde ' + s.goed + ' van de ' + totaal + ' vragen goed' + (vk ? ' (' + vk.naam.toLowerCase() + (nv ? ', ' + nv.naam : '') + ')' : '') + '.' +
      (s.dag ? ' Dit was de dagtoren van vandaag.' : s.trede ? ' Je klom op trede ' + s.trede + '.' : '') +
      (s.gewonnen ? '' : ' Meer goed op rij geeft meer energie: daar zit de kracht.');
    $('cijfers').innerHTML = '<div><b>' + s.besteReeks + '</b><span>langste reeks</span></div><div><b>' + s.schatten.length + '</b><span>' + (s.schatten.length === 1 ? 'schat' : 'schatten') + ' gevonden</span></div>' +
      '<div><b>' + s.stapel.length + '</b><span>kaarten in je stapel</span></div>' +
      '<div><b>' + Math.max(1, Math.round((s.ui.ms || 0) / 60000)) + '</b><span>' + (Math.round((s.ui.ms || 0) / 60000) > 1 ? 'minuten' : 'minuut') + ' geklommen</span></div>';
    var nb = $('nieuwVrij'), nh = '';
    if (nieuw && nieuw.trede) nh += '<h2>Trede ' + nieuw.trede + ' is vrijgespeeld</h2><p>' + schoon(KT.TREDEN[nieuw.trede].regel) + ' Kies hem op het startscherm.</p>';
    if (nieuw && nieuw.nieuw.length) nh += '<h2' + (nh ? ' style="margin-top:10px"' : '') + '>Nieuw in de toren</h2><p>Vanaf nu kun je ' + schoon(lijstZin(namenVan(nieuw.nieuw))) + ' tegenkomen.</p>';
    if (s.dag){ var dr = dagRecord(); if (dr && dr.beste) nh += '<h2' + (nh ? ' style="margin-top:10px"' : '') + '>Dagtoren van vandaag</h2><p>Je beste klim vandaag: ' + (dr.beste.gewonnen ? 'de top' : 'verdieping ' + dr.beste.verd) + ', ' + dr.beste.punten + ' punten. Morgen staat er een nieuwe toren.</p>'; }
    nb.innerHTML = nh; nb.classList.toggle('hide', !nh);
    $('eindCode').innerHTML = s.dag ? 'De dagtoren is vandaag voor iedereen dezelfde. Vergelijk je klim met een klasgenoot.' :
      'Torencode <b>' + schoon(s.code) + '</b>. Geef hem aan een klasgenoot: bij meer keuzes vul je hem in en klim je dezelfde toren.';
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
        return { ronde:s.verdiepingen, punten:KT.punten(s), waar:s.dag ? 'dagtoren' : s.trede ? 'trede ' + s.trede : '', niveau:nv ? nv.naam : '', vak:vk ? vk.naam : '' };
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
  /* nog een keer: dezelfde soort klim (een dagtoren blijft een dagtoren) */
  var laatsteDag = false;
  function nogEenKeer(){ metVragen(function(){ begin('', laatsteDag); }); }
  $('nogBtn').addEventListener('click', nogEenKeer);

  /* ---------- beginnen en verdergaan ---------- */
  function metVragen(daarna, knop){
    if (!vak || !window.BANK || BANK.heeft(vak) || vak === 'reken') return daarna();
    /* de knop draait tot de vragen er zijn (fonts.css) */
    if (knop){ knop.disabled = true; knop.setAttribute('aria-busy', 'true'); }
    BANK.zorg(vak).then(function(){ if (knop){ knop.disabled = false; knop.removeAttribute('aria-busy'); } daarna(); });
  }
  function gekozenTrede(){ var t = +(lees(TREDE) || 0); return Math.max(0, Math.min(voortgang().trede, t)); }
  function begin(code, dag){
    weg(RUN);
    laatsteDag = !!dag;
    var v = voortgang();
    st = KT.nieuw(code || '', vak, dag ? { dag:vandaag() } : { trede:gekozenTrede(), slot:KT.slot(v) });
    st.ui = { niveau:niveau, deel:(keuze[vak] || []).slice(), od:{}, ms:0, bot:bot.aan };
    slim.reset(niveau); pot = null;
    bewaarLaatst();
    bewaar();
    melding = st.dag ? 'De dagtoren van vandaag: voor iedereen dezelfde toren.' : st.trede ? 'Trede ' + st.trede + ': ' + KT.TREDEN.slice(1, st.trede + 1).map(function(t){ return t.regel.replace(/\.$/, '').toLowerCase(); }).join('; ') + '.' : '';
    uitlegOpen = null; $('balkUitleg').classList.add('hide'); balkSleutel = ''; laatsteDecor = ''; laatsteFig = '';
    toon('spel');
    tekenFase();
  }
  function hervat(s){
    st = s;
    vak = s.vak; niveau = s.ui.niveau; keuze[vak] = (s.ui.deel || []).slice();
    laatsteDag = !!s.dag;
    slim.reset(niveau); pot = null;
    if (bot.aan) st.ui.bot = true;
    uitlegOpen = null; $('balkUitleg').classList.add('hide'); balkSleutel = ''; laatsteDecor = ''; laatsteFig = '';
    toon('spel');
    melding = 'Welkom terug. Je klimt verder waar je was.';
    try { tekenFase(); }
    catch (e){
      /* een bewaarde klim die niet meer te tekenen is: netjes opnieuw beginnen */
      weg(RUN); st = null; toon('start'); tekenVerder();
      $('startUit').textContent = 'Je vorige klim kon niet verder. Begin gerust een nieuwe.'; $('startUit').classList.remove('hide');
    }
  }
  /* tijd die je echt aan het klimmen bent, voor het eindscherm */
  setInterval(function(){ if (st && !st.klaar && !document.hidden && !$('scherm-spel').classList.contains('hide')){ st.ui.ms = (st.ui.ms || 0) + 5000; } }, 5000);

  /* het startscherm: niveau, vak en onderdelen, zoals Torenverdediging */
  function onthoudNiveau(id){ try { if (id) localStorage.setItem('lg-niveau', id); } catch (e){} }
  function tekenNiveaus(){
    $('niveaus').innerHTML = NIVEAUS.map(function(n){ return '<button type="button" data-n="' + n.id + '"' + (niveau === n.id ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + n.naam + '</button>'; }).join('');
    Array.prototype.forEach.call($('niveaus').querySelectorAll('button'), function(b){
      b.addEventListener('click', function(){ niveau = b.getAttribute('data-n'); onthoudNiveau(niveau); tekenNiveaus(); tekenDag(); });
    });
    var n = nivVan(niveau);
    $('nivUit').textContent = n ? 'Vragen op het niveau van ' + n.naam + '. Gaat het goed, dan worden ze vanzelf iets moeilijker.' : '';
  }
  function tekenVakken(){
    $('vakken').innerHTML = VAKKEN.map(function(v){
      return '<button class="vak' + (vak === v.id ? ' on' : '') + '" type="button" data-v="' + v.id + '" aria-pressed="' + (vak === v.id) + '" title="' + schoon(v.onder) + '">' +
        '<i style="background:' + kleurVan(v.kleur) + ';color:' + inktOp(v.kleur) + '" aria-hidden="true">' + v.mark + '</i><b>' + v.naam + '</b></button>';
    }).join('');
    var gv = vakVan(vak);
    $('vakUit').textContent = gv && gv.onder ? gv.onder + '. Je krijgt ook vakkaarten: ' + vakKaartVoorbeeld(vak) + '.' : '';
    Array.prototype.forEach.call($('vakken').querySelectorAll('.vak'), function(b){
      b.addEventListener('click', function(){ vak = b.getAttribute('data-v'); if (!keuze[vak]) keuze[vak] = []; pot = null; tekenVakken(); tekenDeelvakken(); tekenDag(); });
    });
  }
  function vakKaartVoorbeeld(id){
    var l = (window.KAARTTOREN_VAKKAARTEN || {})[id] || [];
    var namen = l.slice(0, 3).map(function(k){ return k.naam; });
    return namen.length ? namen.join(', ') + ' en nog ' + (l.length - 3) + ' meer' : 'oefenkaarten';
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

  /* ---------- de dagtoren, de treden en wat er nog te winnen is ---------- */
  var KOPICO = {
    dag:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/><path d="M12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"/>',
    trede:'<path d="M3 20h5v-5h5v-5h5V5h3"/>',
    vrij:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/>',
    slot:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  };
  function kopIco(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + KOPICO[n] + '</svg>'; }
  function datumTekst(){ try { return new Date().toLocaleDateString('nl-NL', { weekday:'long', day:'numeric', month:'long' }); } catch (e){ return vandaag(); } }
  function tekenDag(){
    var d = dagRecord(), vv = vakVan(vak), nv = nivVan(niveau);
    $('dagVak').innerHTML = '<h2 id="dagKop">' + kopIco('dag') + 'Dagtoren</h2>' +
      '<p>De toren van ' + schoon(datumTekst()) + ': voor iedereen dezelfde kamers en tegenstanders, en iedereen speelt met dezelfde kaarten. Je vragen komen uit het vak dat je hierboven koos.</p>' +
      '<div class="dagbeste">' + (d && d.beste
        ? '<span><b>' + (d.beste.gewonnen ? 'de top' : 'verdieping ' + d.beste.verd) + '</b>je beste vandaag</span><span><b>' + d.beste.punten + '</b>punten</span><span><b>' + d.keer + '</b>' + (d.keer === 1 ? 'keer' : 'keer') + ' geklommen</span>'
        : '<span><b>nog niet</b>vandaag geklommen</span>') + '</div>' +
      '<button class="btn btn-dag" id="dagBtn" type="button">Klim de dagtoren</button>' +
      '<p style="margin-top:8px">Met ' + schoon(vv ? vv.naam.toLowerCase() : '') + (nv ? ', ' + schoon(nv.naam) : '') + '.</p>';
    $('dagBtn').addEventListener('click', function(){
      var knop = this, oud = leesRun();
      if (oud && !startZeker.dag){
        startZeker.dag = true; knop.textContent = 'Zeker? Je lopende klim stopt dan'; knop.classList.add('zeker');
        clearTimeout(startZeker.klokDag); startZeker.klokDag = setTimeout(function(){ startZeker.dag = false; knop.textContent = 'Klim de dagtoren'; knop.classList.remove('zeker'); }, 3000);
        return;
      }
      startZeker.dag = false; clearTimeout(startZeker.klokDag);
      metVragen(function(){ begin('', true); }, knop);
    });
  }
  function tekenTreden(){
    var v = voortgang(), t = gekozenTrede(), h = '';
    for (var i = 0; i <= KT.MAXTREDE; i++){
      var vrij = i <= v.trede;
      h += '<button type="button" data-t="' + i + '"' + (i === t ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + (vrij ? '' : ' disabled') +
        ' aria-label="Trede ' + i + (vrij ? '' : ', nog op slot') + '">' + (vrij ? i : kopIco('slot')) + '</button>';
    }
    $('tredeVak').innerHTML = '<h2 id="tredeKop">' + kopIco('trede') + 'Treden</h2>' +
      '<p>' + (v.trede ? 'Je klimt nu op trede ' + t + '. Elke trede maakt de klim iets zwaarder en telt mee voor je punten.' : 'Haal de top en je speelt trede 1 vrij: een iets zwaardere klim. Zo gaat het door tot trede 5.') + '</p>' +
      '<div class="treden" role="group" aria-label="Kies je trede">' + h + '</div>' +
      '<ul class="tredeuit">' + KT.TREDEN.slice(1).map(function(x){
        return '<li class="' + (x.n <= t ? 'aan' : 'nog') + '"><b>trede ' + x.n + '</b><span>' + schoon(x.regel) + (x.n > v.trede ? ' (nog op slot)' : '') + '</span></li>';
      }).join('') + '</ul>';
    Array.prototype.forEach.call($('tredeVak').querySelectorAll('[data-t]'), function(b){
      b.addEventListener('click', function(){ zet(TREDE, +b.getAttribute('data-t')); tekenTreden(); tekenStartknop(); });
    });
    tekenStartknop();
  }
  function tekenStartknop(){ var t = gekozenTrede(); if (!startZeker.klim) $('startBtn').textContent = t ? 'Begin de klim op trede ' + t : 'Begin de klim'; }
  function tekenVrij(){
    var v = voortgang();
    $('vrijVak').innerHTML = '<h2 id="vrijKop">' + kopIco('vrij') + 'Nog te winnen</h2>' +
      '<p>Sommige kaarten en schatten komen pas in de toren als je ver genoeg komt.</p>' +
      '<ul class="vrijlijst">' + KT.VRIJ.map(function(x){
        var klaar = x.test(v), m = /^(\d+) verdiepingen/.exec(x.wat);
        var vg = m && !klaar ? '<span class="voortgang" aria-hidden="true"><i style="width:' + Math.min(100, Math.round(100 * v.totaal / +m[1])) + '%"></i></span><small>' + v.totaal + ' van de ' + m[1] + '</small>' : '';
        var dingen = x.kaarten.map(function(id){ var d = KT.KAARTEN[id]; return '<span>' + F.kaartIcoon(d.soort, d.fig) + schoon(d.naam) + '</span>'; }).concat(
          x.schatten.map(function(id){ return '<span class="sch">' + F.schat(id) + schoon(KT.SCHATTEN[id].naam) + '</span>'; })).join('');
        return '<li class="' + (klaar ? 'vrij' : '') + '"><span class="vink" aria-hidden="true">' + (klaar ? '✓' : '') + '</span><span><b>' + schoon(x.wat) + '</b>' +
          '<span class="sr">' + (klaar ? ', vrijgespeeld' : ', nog niet') + '</span>' + vg + '<span class="vrijdingen">' + dingen + '</span></span></li>';
      }).join('') + '</ul>';
  }

  /* de torencode bij meer keuzes */
  function codeUitVeld(){ return String($('codeVeld').value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); }
  $('codeVeld').addEventListener('input', function(){
    var c = codeUitVeld();
    $('codeVeld').value = c;
    $('meerSamen').textContent = c.length === 4 ? 'torencode ' + c : 'een nieuwe toren';
    $('codeUit').textContent = c && c.length < 4 ? 'Een torencode heeft vier letters.' : '';
  });

  /* Start: loopt er nog een klim, dan eerst vragen of die weg mag */
  var startZeker = { klim:false, dag:false };
  $('startBtn').addEventListener('click', function(){
    if (!vak) return;
    var knop = this, oud = leesRun();
    if (oud && !startZeker.klim){
      startZeker.klim = true; knop.textContent = 'Zeker? Je lopende klim stopt dan'; knop.classList.add('zeker');
      startZeker.klok = setTimeout(function(){ startZeker.klim = false; knop.classList.remove('zeker'); tekenStartknop(); }, 3000);
      return;
    }
    clearTimeout(startZeker.klok); startZeker.klim = false; knop.classList.remove('zeker'); tekenStartknop();
    var c = codeUitVeld();
    metVragen(function(){ begin(c.length === 4 ? c : '', false); }, knop);
  });

  /* Stoppen in de kop (spel.js vraagt eerst "Zeker? Tik nog eens"): de klim blijft bewaard */
  $('stopBtn').addEventListener('click', function(){
    if (huidig){ clearTimeout(huidig.klok); huidig = null; }
    bezig = false;
    bewaar();
    toon('start');
    tekenVerder(); tekenStartExtra();
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
    var box = $('verderVak'), oud = leesRun(), l = lees(LAATST);
    box.innerHTML = ''; box.classList.add('hide');
    var d = $('anders');
    if (oud){
      var v = vakVan(oud.vak), nv = nivVan(oud.ui.niveau), f = oud.fase === 'kaart' ? oud.rij + 2 : oud.rij + 1;
      box.innerHTML = '<button class="verderknop" type="button" id="verderRun">Verder met je klim' +
        '<small>' + (oud.dag ? 'dagtoren · ' : oud.trede ? 'trede ' + oud.trede + ' · ' : '') + 'verdieping ' + Math.max(1, f) + ' van ' + KT.HOOG + ' · ' + schoon(v.naam.toLowerCase()) + ' · ' + schoon(nv ? nv.naam : '') + ' · ' + oud.hp + ' doorzetting</small></button>';
      box.classList.remove('hide');
      d.classList.remove('zonder'); d.open = false;
      $('verderRun').addEventListener('click', function(){
        var s = leesRun(); if (!s){ tekenVerder(); return; }
        vak = s.vak;
        metVragen(function(){ hervat(s); }, this);
      });
      return;
    }
    if (uitLink || !l || !vakVan(l.vak)) { d.classList.add('zonder'); d.open = true; return; }
    var v2 = vakVan(l.vak), nv2 = nivVan(l.niveau);
    box.innerHTML = '<button class="verderknop" type="button" id="verderStart">Verder met ' + schoon(v2.naam.toLowerCase()) + ' · ' + schoon(nv2 ? nv2.naam : l.niveau) +
      '<small>een nieuwe toren' + (gekozenTrede() ? ' op trede ' + gekozenTrede() : '') + ', ' + ((l.deel || []).length ? l.deel.length + ((l.deel.length === 1) ? ' onderdeel' : ' onderdelen') : 'alle onderdelen') + '</small></button>';
    box.classList.remove('hide');
    d.classList.remove('zonder'); d.open = false;
    $('verderStart').addEventListener('click', function(){
      vak = l.vak; keuze[vak] = (l.deel || []).filter(function(id){ return (ONDERDELEN[vak] || []).some(function(o){ return o.id === id; }); });
      if (nivVan(l.niveau)) niveau = l.niveau;
      metVragen(function(){ begin(codeUitVeld().length === 4 ? codeUitVeld() : '', false); }, this);
    });
  }
  function tekenStartExtra(){ tekenDag(); tekenTreden(); tekenVrij(); }
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
  if (DEC) $('heldBeeld').innerHTML = DEC.toren();
  tekenNiveaus(); tekenVakken(); tekenDeelvakken(); tekenVerder(); tekenStartExtra();
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
    if (e.key === 'Escape' && uitlegOpen){ uitlegOpen = null; $('balkUitleg').classList.add('hide'); tekenBalk(); e.preventDefault(); return; }
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
     (goed met kans p), kaarten, hulpjes, kamers, winkels, schatten en
     beloningen, met de keuzes van KAARTTOREN.bot. Voor de test, niet voor het
     klassement. */
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
  /* een hulpje gebruiken zoals een leerling: eerst erop tikken, dan op Gebruik */
  function botHulpje(fase){
    if (bot.geenHulp) return false;
    var i = KT.bot.hulpjeKeuze(st, fase); if (i < 0) return false;
    if (uitlegOpen && uitlegOpen.soort === 'hulp' && uitlegOpen.i === i) return klik($('balkUitleg').querySelector('.bu-gebruik'));
    return klik($('sbHulpjes').querySelector('[data-hulp="' + i + '"]'));
  }
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
        if (/verbeteren/.test($('dekKop').textContent)){ var r = KT.bot.rust(Object.assign({}, st, { hp:st.max })); Array.prototype.forEach.call(knoppen, function(b){ if (+b.getAttribute('data-i') === r.kaart) keuzeI = b; }); }
        klik(keuzeI || knoppen[0]); return bot.wek();
      }
      if (!$('scherm-start').classList.contains('hide')){ klik($('verderRun')) || klik($('startBtn')); return bot.wek(); }
      if (!$('scherm-einde').classList.contains('hide')){ bot.log.push('einde'); bot.aan = false; return; }
      if (huidig){
        if (!huidig.af){
          if (st && st.fase === 'gevecht' && st.g && st.g.fase === 'vraag' && botHulpje('vraag')) return bot.wek();
          var q = huidig.q, kan = q.o.map(function(t, i){ return i; }).filter(function(i){ return huidig.weg.indexOf(i) < 0; });
          var fout = kan.filter(function(i){ return i !== q.g; });
          var p = huidig.weg.length ? bot.goed + (1 - bot.goed) * 0.5 : bot.goed;
          beantwoord(Math.random() < p || !fout.length ? q.g : fout[Math.floor(Math.random() * fout.length)]);
        }
        else { var vb = $('volgendeBtn'); if (vb && !$('volgendeRij').hidden) klik(vb); }
        return bot.wek();
      }
      if (bezig || !st) return bot.wek();
      /* voor een test: in deze fase even niets doen (kaartBot.pauze = 'beloning') */
      if (bot.pauze && bot.pauze === st.fase) return bot.wek();
      if (st.fase === 'kaart'){ var ki = KT.bot.kamer(st); klik($('kamers').querySelector('[data-i="' + ki + '"]')); }
      else if (st.fase === 'gevecht'){
        if (st.g.fase === 'spelen'){
          if (botHulpje('spelen')) return bot.wek();
          var h = KT.bot.speel(st, bot.goed); if (h < 0) klik($('klaarBtn')); else klik($('hand').querySelector('[data-h="' + h + '"]'));
        }
      } else if (st.fase === 'beloning'){
        if (st.bel.schatKeuze){ klik($('vBeloning').querySelector('[data-s="' + KT.bot.schat(st) + '"]')); }
        else { var bi = KT.bot.beloning(st); klik(bi < 0 ? $('belGeen') : $('vBeloning').querySelector('[data-b="' + bi + '"]')); }
      }
      else if (st.fase === 'stop'){
        var s = st.stop;
        if (s.soort === 'rust'){ var rr = KT.bot.rust(st); klik(rr.wat === 'heel' ? $('rustHeel') : $('rustBeter')) || klik($('rustHeel')); }
        else if (s.soort === 'winkel'){
          var w = KT.bot.winkel(st);
          if (!w) klik($('stopVerder'));
          else if (w.wat === 'koop') klik($('vStop').querySelector('.koopknop[data-i="' + w.i + '"]')) || klik($('stopVerder'));
          else if (w.wat === 'schat') klik($('vStop').querySelector('.koopknop[data-schat="' + w.i + '"]')) || klik($('stopVerder'));
          else if (w.wat === 'hulpje') klik($('vStop').querySelector('.koopknop[data-hulp="' + w.i + '"]')) || klik($('stopVerder'));
          else if (w.wat === 'pleister') klik($('koopPleister')) || klik($('stopVerder'));
          else klik($('koopWeg')) || klik($('stopVerder'));
        } else {
          var gk = KT.bot.gebeurtenis(st);
          klik($('vStop').querySelector('[data-o="' + gk.o + '"]')) || klik($('vStop').querySelector('[data-o]:not(:disabled)'));
        }
      }
    } catch (fout){ bot.log.push('fout: ' + (fout && fout.message)); }
    bot.wek();
  };
  window.kaartBot = bot;
  /* voor de test: de beklimming van nu, de vraag, wat er gespeeld is, en een
     beklimming inladen (een gevecht met een bepaalde tegenstander, een schat) */
  window.__kt = function(){ return st; };
  window.__ktVraag = function(){ return huidig ? { goed:huidig.q.g, af:huidig.af, weg:huidig.weg.slice() } : null; };
  window.__ktGespeeld = function(){ return gespeeld; };
  window.__ktLaad = function(s){ if (huidig){ clearTimeout(huidig.klok); huidig = null; } bezig = false; hervat(s); bewaar(); };
  (function(){
    var m = /#testBot(?:=([0-9.]+))?/.exec(location.hash);
    if (m) setTimeout(function(){ bot.start(m[1] ? parseFloat(m[1]) : 0.75); }, 300);
  })();
})();
