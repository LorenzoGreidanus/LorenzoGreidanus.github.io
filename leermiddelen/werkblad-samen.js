/* Werkblad zelf samenstellen (Werkblad maken, werkblad.html).

   Boven het blad staat een schakelaar Bekijken / Samenstellen. In de stand
   Samenstellen klik je een opgave aan: dan krijg je vier knoppen (vervangen,
   omhoog, omlaag, weghalen) en "+ Vraag hier". Een vraag erbij komt uit het
   boek, uit de vragenbank of je schrijft hem zelf; dat venster is de kiezer van
   de toetseditor (maken-kiezer.js) met een derde tab, Zelf schrijven.

   Hoe het werkt: de pagina tekent een blad zoals altijd (teken van een
   werkblad geeft vragen en antwoorden als rijen <li>). Hier worden die rijen
   paren: de opgave op het werkblad en zijn regel op het antwoordblad. Een kop
   (li.ob-kop van het opdrachtenboek, li.wb-kop van een eigen kopje) telt niet
   mee in de nummers. Klopt het aantal opgaven en antwoorden niet een op een,
   of horen de nummers bij iets anders (de kaart van topografie, het
   voorleesblad van een dictee), dan staat Samenstellen uit, met de reden.

   Het samengestelde blad (model) staat in localStorage onder de instellingen
   van de pagina (het adres: vak, blad, niveau, aantal, vorm, delen). Een
   opgave uit het boek of de vragenbank staat er als de getekende html van het
   paar, zodat hij niet opnieuw getrokken wordt. Een eigen vraag staat er als
   zijn velden; de html maken we er elke keer uit, met alles ontsmet (schoon).

   Bewaar in Mijn materiaal maakt er een toets van (EIGEN.bewaar, soort
   oefening, modus toets): meerkeuze en open vragen, plaatjes via de bestaande
   plaatjesroute, figuren als plaatje zoals de boek-tab van de kiezer dat doet.
   Een kopje heeft in een toets geen vorm en blijft weg; dat staat in de
   melding, net als een opgave die niet als toetsvraag kan.

     SAMEN.start(api)       werkblad.html geeft wat hier nodig is (papier, laatste, ...)
     SAMEN.blad(b)          het blad dat teken maakte: gewoon tonen of samengesteld
     SAMEN.geenBlad()       er staat geen blad (een fout, of een eigen pagina)
     SAMEN.aangepast()      is het blad aangepast (dan eerst vragen bij andere keuzes)
     SAMEN.vraagWeg(ja, nee) vragen of de wijzigingen weg mogen */
window.SAMEN = (function(){
  'use strict';
  var A = null;
  var LETTERS = 'abcdef';
  var OPSLAG = 'wb-samen:', LIJST = 'wb-samen-lijst', MAX_BEWAARD = 12;
  /* hoe lang een eigen vraag mag zijn: zoals een toetsvraag (server/materiaal.js) */
  var MAX = { vraag:300, optie:150, antwoord:100, uitleg:300, kop:120, tekst:1500 };
  var PLAATJE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/;
  /* hier passen geen eigen opgaven tussen, en een andere volgorde klopt niet meer */
  var NEE = {
    topografie:'Bij topografie horen de nummers bij de kaart. Daar kun je geen opgaven tussen zetten of verplaatsen.',
    dictee:'Een dictee lees je voor van het voorleesblad. Daar passen geen eigen vragen tussen.',
    dictation:'Een dictation lees je voor van het voorleesblad. Daar passen geen eigen vragen tussen.'
  };
  var NIET_EEN_OP_EEN = 'Bij dit werkblad horen de vragen en de antwoorden niet een op een bij elkaar. Samenstellen kan hier niet.';

  var modus = 'kijk', bron = null, model = null, kan = { ja:false, reden:'' }, actief = -1, teller = 0, voorBewerk = '';
  function $(id){ return document.getElementById(id); }
  function esc(t){ return A.schoon(t); }
  /* tekst met regels: elke regel ontsmet, dan een <br> ertussen */
  function br(t){ return String(t == null ? '' : t).split(/\r?\n/).map(esc).join('<br>'); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nieuwId(){ return 'i' + Date.now().toString(36) + (++teller); }
  function kaal(h){ var d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }

  /* ---------- de rijen van een blad ---------- */
  /* de <li>'s van vragen of antwoorden; null als er iets anders tussen staat */
  function rijen(html){
    var t = document.createElement('template'); t.innerHTML = html || '';
    var uit = [];
    for (var n = t.content.firstChild; n; n = n.nextSibling){
      if (n.nodeType === 3 && !n.textContent.trim()) continue;
      if (n.nodeType === 8) continue;
      if (n.nodeType !== 1 || n.tagName !== 'LI') return null;
      uit.push(n);
    }
    return uit;
  }
  function isKop(li){ return li.classList.contains('ob-kop') || li.classList.contains('wb-kop'); }
  function soortVan(blad){ return !blad ? 'bank' : /^boek-/.test(blad) ? 'boek' : /^route-/.test(blad) ? 'route' : 'spel'; }
  function beoordeel(b){
    var id = A.blad();
    if (NEE[id]) return { ja:false, reden:NEE[id] };
    var vr = rijen(b.vragen), an = rijen(b.antwoorden);
    if (!vr || !an || !vr.length) return { ja:false, reden:NIET_EEN_OP_EEN };
    if (vr.filter(function(x){ return !isKop(x); }).length !== an.filter(function(x){ return !isKop(x); }).length) return { ja:false, reden:NIET_EEN_OP_EEN };
    return { ja:true, reden:'', vr:vr, an:an };
  }

  /* ---------- het model: het blad als paren ---------- */
  function maakModel(b){
    var L = A.laatste(), soort = soortVan(A.blad());
    if (!L || !kan.ja) return null;
    /* een opgave uit het boek krijgt zijn toetsvorm van de kiezer (voor Bewaar in Mijn materiaal) */
    if (soort === 'boek' && !window.KIEZER) return null;
    var vr = kan.vr, an = kan.an;
    var kopVr = vr.filter(isKop), kopAn = an.filter(isKop), opAn = an.filter(function(x){ return !isKop(x); });
    var kopPaar = kopVr.length === kopAn.length, ki = 0, oi = 0, items = [];
    vr.forEach(function(li){
      if (isKop(li)){ items.push({ id:nieuwId(), soort:'kop', bron:'blad', v:li.outerHTML, a:kopPaar ? kopAn[ki++].outerHTML : '' }); return; }
      var it = { id:nieuwId(), soort:'op', bron:'blad', v:li.outerHTML, a:opAn[oi].outerHTML };
      if (soort === 'bank'){ var m = A.bankMeta(oi); if (m){ it.t = m.t; it.sl = m.sl; it.open = m.open; it.toets = m.toets; } }
      else if (soort === 'boek'){
        var x = L.items[oi];
        if (x && x.par){ it.pvak = x.keuze.vak; it.par = x.par.p.id; try { it.toets = KIEZER.boekToets({ soort:x.soort, op:x.op, q:x.q }, x.keuze.vak, x.par.p.id); } catch (e){} }
      }
      else it.open = !!(L.isOpen && L.isOpen(L.vorm, oi));
      items.push(it); oi++;
    });
    return { sleutel:L.sleutel, soort:soort, blad:A.blad(), vak:L.vak, naam:A.soortNaam(),
      kop:{ titel:b.titel || '', sub:b.sub || '', klasse:b.klasse || '', intro:b.intro || '', boven:b.boven || '', antwoordKop:b.antwoordKop || '', antwoordIntro:b.antwoordIntro || '', bovenkop:b.kop || '' },
      items:items, aangepast:false, tijd:0, code:'' };
  }

  /* ---------- bewaren op deze computer ---------- */
  function lees(sl){
    try {
      var m = JSON.parse(localStorage.getItem(OPSLAG + sl) || 'null');
      return m && m.kop && Array.isArray(m.items) && m.sleutel === sl ? m : null;
    } catch (e){ return null; }
  }
  var bewaarFout = '';
  function bewaarHier(){
    if (!model) return;
    model.tijd = Date.now(); model.modus = modus;
    bewaarFout = '';
    try {
      localStorage.setItem(OPSLAG + model.sleutel, JSON.stringify(model));
      var l = []; try { l = JSON.parse(localStorage.getItem(LIJST) || '[]'); } catch (e){}
      if (!Array.isArray(l)) l = [];
      l = [model.sleutel].concat(l.filter(function(k){ return k !== model.sleutel; }));
      /* niet eindeloos: de oudste samengestelde bladen gaan weg */
      l.slice(MAX_BEWAARD).forEach(function(k){ try { localStorage.removeItem(OPSLAG + k); } catch (e){} });
      localStorage.setItem(LIJST, JSON.stringify(l.slice(0, MAX_BEWAARD)));
    } catch (e){
      bewaarFout = 'Bewaren op deze computer lukte niet: het blad is te groot of de browser staat het niet toe. Haal een plaatje weg, of bewaar het in Mijn materiaal.';
    }
  }
  function wisHier(sl){
    try {
      localStorage.removeItem(OPSLAG + sl);
      var l = JSON.parse(localStorage.getItem(LIJST) || '[]');
      if (Array.isArray(l)) localStorage.setItem(LIJST, JSON.stringify(l.filter(function(k){ return k !== sl; })));
    } catch (e){}
  }
  function wis(){ if (model) wisHier(model.sleutel); model = null; actief = -1; }

  /* ---------- scripts die pas nodig zijn als je ze gebruikt ---------- */
  var laden = {};
  function laadScript(src, klaar){
    if (klaar()) return Promise.resolve();
    if (laden[src]) return laden[src];
    laden[src] = new Promise(function(ok, mis){
      var s = document.createElement('script'); s.src = src;
      s.onload = function(){ klaar() ? ok() : mis(new Error(src)); };
      s.onerror = function(){ laden[src] = null; mis(new Error(src)); };
      document.head.appendChild(s);
    });
    return laden[src];
  }
  function laadKiezer(){ return laadScript('maken-kiezer.js', function(){ return !!window.KIEZER; }); }
  function laadEigen(){ return laadScript('eigen.js', function(){ return !!window.EIGEN; }); }
  /* een opgave uit het boek op een ander blad: de stijl van de figuren moet er zijn */
  function heeftBoek(m){ return m.soort === 'boek' || m.items.some(function(it){ return it.bron === 'boek'; }); }

  /* ---------- tekenen ---------- */
  function eigenPaar(e, uitleg){
    var plaat = e.plaatje && PLAATJE.test(e.plaatje) ? '<div class="beeld wb-plaat"><img src="' + esc(e.plaatje) + '" alt="Plaatje bij de vraag"></div>' : '';
    if (e.soort === 'kop'){
      return { v:'<li class="wb-kop wb-eigen">' + (e.kop ? '<h3>' + esc(e.kop) + '</h3>' : '') + (e.tekst ? '<p class="wb-tekst">' + br(e.tekst) + '</p>' : '') + plaat + '</li>',
        a:e.kop ? '<li class="wb-kop wb-eigen"><h3>' + esc(e.kop) + '</h3></li>' : '' };
    }
    var v = '<li class="wb-eigen"><span class="vr">' + br(e.vraag) + '</span>' + plaat, a;
    var u = uitleg && e.uitleg ? '<small>' + br(e.uitleg) + '</small>' : '';
    if (e.soort === 'mk'){
      v += '<div class="opties">' + e.opties.map(function(o, i){ return '<span><b>' + LETTERS.charAt(i) + '</b>' + esc(o) + '</span>'; }).join('') + '</div>';
      a = '<li class="wb-eigen"><span class="goed">' + LETTERS.charAt(e.goed) + '. ' + esc(e.opties[e.goed]) + '</span>' + u + '</li>';
    } else {
      for (var i = 0; i < Math.max(1, Math.min(8, e.lijnen || 1)); i++) v += '<span class="lijn" aria-hidden="true"></span>';
      a = '<li class="wb-eigen"><span class="goed">' + (e.antwoord ? esc(e.antwoord) : 'Zelf nakijken') + '</span>' + u + '</li>';
    }
    return { v:v + '</li>', a:a };
  }
  function paarVan(it){ return it.bron === 'eigen' ? eigenPaar(it.e, A.uitleg()) : { v:it.v, a:it.a || '' }; }
  function opgaven(){ return model.items.filter(function(it){ return it.soort === 'op'; }).length; }
  /* "20 vragen" in de regel onder de titel klopt na het samenstellen niet meer */
  var WOORD = { vragen:['vraag', 'vragen'], opgaven:['opgave', 'opgaven'], sommen:['som', 'sommen'], driehoeken:['driehoek', 'driehoeken'], 'alinea’s':['alinea', 'alinea’s'] };
  function sub(){
    var s = model.kop.sub, n = opgaven(), anders = model.items.some(function(it){ return it.soort === 'op' && it.bron !== 'blad'; });
    if (!model.aangepast) return s;
    return s.replace(/(\d+) (vragen|opgaven|sommen|driehoeken|alinea’s)/, function(m, x, w){ var p = anders ? WOORD.opgaven : WOORD[w]; return n + ' ' + (n === 1 ? p[0] : p[1]); });
  }
  function teken(){
    var k = model.kop, v = '', a = '';
    model.items.forEach(function(it){ var p = paarVan(it); v += p.v; a += p.a; });
    A.papier(k.titel, sub(), k.klasse, v, a, k.intro, k.boven, k.antwoordKop, k.antwoordIntro, k.bovenkop);
    versier();
    toonRest();
  }

  /* De knoppen op het blad, alleen in de stand Samenstellen. Alles met de klasse
     wb-bed is bediening: niet op papier (werkblad.html) en niet in de meting. */
  var IK = {
    vervang:'<path d="M20 11a8 8 0 0 0-14-5l-2 2M4 13a8 8 0 0 0 14 5l2-2"/><path d="M4 4v4h4M20 20v-4h-4"/>',
    bewerk:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    op:'<path d="M12 19V5M6 11l6-6 6 6"/>', neer:'<path d="M12 5v14M6 13l6 6 6-6"/>', weg:'<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function ik(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IK[n] + '</svg>'; }
  function naam(i){
    var it = model.items[i];
    if (it.soort === 'kop') return 'het kopje' + (it.bron === 'eigen' && it.e.kop ? ' ' + it.e.kop : '');
    return 'opgave ' + nummer(i);
  }
  function nummer(i){ var n = 0; for (var j = 0; j <= i; j++) if (model.items[j].soort === 'op') n++; return n; }
  function Naam(i){ var t = naam(i); return t.charAt(0).toUpperCase() + t.slice(1); }
  function kanVervangen(it){
    if (it.bron === 'eigen') return '';
    if (it.soort === 'kop') return 'Een kopje kun je niet vervangen. Verplaats het of haal het weg.';
    if (it.geen) return 'Er is geen andere opgave van deze soort te vinden.';
    if (it.bron === 'bank' && !it.bvak) return 'Deze vraag kun je niet vervangen.';
    return '';
  }
  function knop(doe, label, icoon, uit, extra){
    return '<button type="button" class="wb-ik' + (doe === 'weg' ? ' wb-weg' : '') + '" data-doe="' + doe + '" aria-label="' + esc(label) + '"' + (uit ? ' aria-disabled="true" title="' + esc(uit) + '"' : ' title="' + esc(label) + '"') + (extra || '') + '>' + ik(icoon) + '</button>';
  }
  function gereed(i){
    var it = model.items[i], N = Naam(i), eerste = i === 0, laatste = i === model.items.length - 1;
    var eerst = it.bron === 'eigen' ? knop('bewerk', N + ' aanpassen', 'bewerk', '')
      : knop('vervang', N + ' vervangen door een andere opgave', 'vervang', kanVervangen(it));
    return '<span class="wb-bed wb-gereed" role="group" aria-label="' + esc(N) + '">' + eerst +
      knop('op', N + ' omhoog', 'op', eerste ? 'Staat al bovenaan.' : '') +
      knop('neer', N + ' omlaag', 'neer', laatste ? 'Staat al onderaan.' : '') +
      knop('weg', N + ' weghalen', 'weg', '') + '</span>';
  }
  function versier(){
    var bl = $('bladen'), aan = modus === 'samen' && !!model;
    bl.classList.toggle('samen', aan);
    if (!aan) return;
    var voor = bl.querySelector('.blad.wb-voor'), ol = voor && voor.querySelector(':scope > ol');
    if (!ol) return;
    var lis = ol.children;
    for (var i = 0; i < lis.length && i < model.items.length; i++){
      var li = lis[i], it = model.items[i];
      li.classList.add('wb-item');
      li.setAttribute('data-i', i);
      li.tabIndex = 0;
      if (it.bron === 'eigen') li.insertAdjacentHTML('afterbegin', '<span class="wb-bed wb-label">' + (it.soort === 'kop' ? 'kopje' : 'zelf geschreven') + '</span>');
      if (i === actief){
        li.classList.add('wb-actief');
        li.setAttribute('aria-current', 'true');
        li.insertAdjacentHTML('afterbegin', gereed(i));
        li.insertAdjacentHTML('beforeend', '<div class="wb-bed wb-erbij"><button type="button" data-doe="erbij">+ Vraag hier</button></div>');
      }
    }
    ol.insertAdjacentHTML('afterend', '<div class="wb-bed wb-eind"><button type="button" data-doe="eind">+ Vraag toevoegen aan het eind</button></div>');
  }

  /* ---------- de schakelaar en de samenvatting links ---------- */
  var BRONNAAM = { bank:'uit de vragenbank', boek:'uit het boek', route:'uit de leerroute' };
  function telTekst(){
    var n = opgaven(), groep = {}, volg = [], kop = 0;
    model.items.forEach(function(it){
      if (it.soort === 'kop'){ kop++; return; }
      var w = it.bron === 'eigen' ? 'zelf geschreven' : it.bron === 'boek' ? BRONNAAM.boek : it.bron === 'bank' ? BRONNAAM.bank : BRONNAAM[model.soort] || 'uit ' + model.naam;
      if (!groep[w]){ groep[w] = 0; volg.push(w); }
      groep[w]++;
    });
    var delen = volg.map(function(w){ var t = groep[w] + ' ' + esc(w); return w === 'zelf geschreven' ? '<span class="wm-zelf">' + t + '</span>' : t; });
    if (kop) delen.push(kop + (kop === 1 ? ' kopje' : ' kopjes'));
    return '<b>' + n + (n === 1 ? ' opgave' : ' opgaven') + '</b>' + (delen.length ? ': ' + delen.join(', ') : '');
  }
  function tijd(t){ return new Date(t).toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' }); }
  var bewaarMelding = { tekst:'', soort:'', html:'' };
  function toonRest(){
    var seg = $('standSeg'), heeft = !!bron, samen = modus === 'samen';
    seg.classList.toggle('hide', !heeft);
    [].forEach.call(seg.querySelectorAll('[data-s]'), function(b){
      b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === (samen && kan.ja ? 'samen' : 'kijk')));
      if (b.getAttribute('data-s') === 'samen'){ if (kan.ja) b.removeAttribute('aria-disabled'); else b.setAttribute('aria-disabled', 'true'); }
    });
    var u = $('standUitleg');
    u.textContent = heeft && samen && !kan.ja ? 'Samenstellen kan bij dit werkblad niet. ' + kan.reden : '';
    u.classList.toggle('hide', !u.textContent);
    var k = $('samenKaart'), toon = heeft && !!model && (samen || model.aangepast);
    k.classList.toggle('hide', !toon);
    if (!toon){ k.innerHTML = ''; return; }
    var focus = document.activeElement && k.contains(document.activeElement) ? document.activeElement.id : '';
    k.innerHTML = (model.aangepast ? '<div class="wm-let"><b>Je hebt het blad aangepast.</b> Kies je andere instellingen of klik je op Andere vragen, dan vraagt de pagina eerst of je wijzigingen weg mogen.</div>' : '') +
      '<div class="kaart wm-ditblad"><h2 class="wm-stap" id="samenKop">Dit blad</h2>' +
      '<p class="wm-tel">' + telTekst() + '</p>' +
      '<p class="tip">' + (bewaarFout ? '<span class="wm-foutje">' + esc(bewaarFout) + '</span>' : model.aangepast ? 'Bewaard op deze computer om ' + tijd(model.tijd) + '.' : 'Klik op een opgave om hem te vervangen, te verplaatsen of weg te halen.') + '</p>' +
      '<div class="rij"><button type="button" class="knop stil" id="samenBewaar">' + (model.code ? 'Bewaar opnieuw in Mijn materiaal' : 'Bewaar in Mijn materiaal') + '</button>' +
      '<button type="button" class="knop stil wm-rood" id="samenOpnieuw"' + (model.aangepast ? '' : ' disabled') + '>Begin opnieuw</button></div>' +
      '<p class="wm-bewaar' + (bewaarMelding.soort ? ' ' + bewaarMelding.soort : '') + '" id="samenBewaarMelding" role="status" aria-live="polite">' + (bewaarMelding.html || esc(bewaarMelding.tekst)) + '</p></div>';
    if (focus && $(focus)) $(focus).focus();
  }
  function meld(t){ var s = $('samenStatus'); if (!s) return; s.textContent = ''; setTimeout(function(){ s.textContent = t; }, 30); }

  /* ---------- wat de pagina vraagt ---------- */
  function blad(b){
    bron = b; actief = -1;
    var L = A.laatste(), sl = L && L.sleutel;
    kan = beoordeel(b);
    var opgeslagen = sl && kan.ja ? lees(sl) : null;
    if (opgeslagen){
      if (!model || model.sleutel !== sl) bewaarMelding = { tekst:'', soort:'', html:'' };
      model = opgeslagen; modus = model.modus === 'samen' ? 'samen' : modus;
      if (heeftBoek(model) && window.BOEKBLAD) BOEKBLAD.laad().catch(function(){});
      if (modus === 'samen') laadKiezer().catch(function(){});
      teken();
      return;
    }
    if (!model || model.sleutel !== sl) bewaarMelding = { tekst:'', soort:'', html:'' };
    model = null;
    if (modus === 'samen' && kan.ja){
      model = maakModel(b);
      if (model){ teken(); laadKiezer().catch(function(){}); return; }
      A.toonBlad(b); toonRest();
      laadKiezer().then(function(){ if (bron !== b || modus !== 'samen') return; model = maakModel(b); if (model) teken(); }, function(){});
      return;
    }
    A.toonBlad(b);
    $('bladen').classList.remove('samen');
    toonRest();
  }
  function geenBlad(){ bron = null; model = null; actief = -1; kan = { ja:false, reden:'' }; $('bladen').classList.remove('samen'); toonRest(); }
  function aangepast(){ return !!(model && model.aangepast); }

  /* een vraag in een venstertje: ja of nee */
  var vraagNa = null;
  function vraag(o){
    var d = $('samenVraag');
    $('svKop').textContent = o.kop; $('svTekst').textContent = o.tekst;
    $('svJa').textContent = o.ja; $('svNee').textContent = o.nee;
    vraagNa = { ja:o.doeJa, nee:o.doeNee, terug:document.activeElement };
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    $('svNee').focus();
  }
  function antwoord(ja){
    var d = $('samenVraag'), na = vraagNa; vraagNa = null;
    if (d.open) d.close(); else d.removeAttribute('open');
    if (!na) return;
    if (na.terug && document.contains(na.terug)) na.terug.focus();
    (ja ? na.ja : na.nee)();
  }
  function vraagWeg(ja, nee){
    vraag({ kop:'Wijzigingen weggooien?', tekst:'Je hebt dit blad zelf samengesteld. Met een andere keuze maakt de pagina een nieuw blad, en dan zijn je wijzigingen weg.',
      ja:'Ja, maak een nieuw blad', nee:'Nee, houd dit blad',
      doeJa:function(){ wis(); bewaarMelding = { tekst:'', soort:'', html:'' }; ja(); },
      doeNee:function(){ nee(); meld('Het blad is gebleven zoals het was.'); } });
  }

  /* ---------- de stand wisselen ---------- */
  function zetModus(m){
    /* kan het hier niet, dan de reden onder de schakelaar; de stand blijft Samenstellen voor het volgende blad */
    if (m === 'samen' && !kan.ja){ modus = 'samen'; toonRest(); meld('Samenstellen kan bij dit werkblad niet. ' + kan.reden); return; }
    modus = m; actief = -1;
    if (m === 'samen'){
      /* de knoppen staan op het werkblad, niet op het antwoordblad */
      if ($('bladen').getAttribute('data-toon') === 'antw') $('tabWerk').click();
      if (!model){
        model = maakModel(bron);
        if (!model){ toonRest(); laadKiezer().then(function(){ if (modus !== 'samen' || !bron) return; model = maakModel(bron); if (model) teken(); }, function(){ meld('Het laden lukte niet. Probeer het nog eens.'); }); return; }
      }
      laadKiezer().catch(function(){});
    }
    if (model){
      if (model.aangepast){ model.modus = modus; bewaarHier(); }
      teken();
    } else { $('bladen').classList.remove('samen'); toonRest(); }
  }

  /* ---------- iets veranderen op het blad ---------- */
  function veranderd(){ model.aangepast = true; bewaarHier(); teken(); }
  function focusOp(i, doe){
    var li = $('bladen').querySelector('.wb-voor > ol > li[data-i="' + i + '"]'); if (!li) return;
    var b = doe && li.querySelector('[data-doe="' + doe + '"]');
    (b || li).focus();
    if (!li.contains(document.activeElement)) return;
    /* in beeld houden binnen het paneel */
    var r = li.getBoundingClientRect(), v = $('blikveld').getBoundingClientRect();
    if (r.top < v.top || r.bottom > v.bottom) li.scrollIntoView({ block:'nearest' });
  }
  function kies(i){ if (actief === i) return; actief = i; teken(); focusOp(i); }
  function verplaats(i, d){
    var j = i + d; if (j < 0 || j >= model.items.length) return;
    var x = model.items[i]; model.items[i] = model.items[j]; model.items[j] = x;
    actief = j; veranderd(); focusOp(j, d < 0 ? 'op' : 'neer');
    meld(Naam(j) + (d < 0 ? ' staat een plek hoger.' : ' staat een plek lager.'));
  }
  function weg(i){
    var n = Naam(i);
    model.items.splice(i, 1);
    actief = -1; veranderd();
    if (model.items.length) focusOp(Math.min(i, model.items.length - 1));
    else { var e = $('bladen').querySelector('[data-doe="eind"]'); if (e) e.focus(); }
    meld(n + ' is weggehaald.');
  }

  /* ---------- vervangen: een nieuwe opgave van dezelfde bron ---------- */
  function tekstSleutel(h){ return kaal(h).toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, ''); }
  function opBlad(){ var s = {}; model.items.forEach(function(it){ s[tekstSleutel(paarVan(it).v)] = true; }); return s; }
  /* het kopje van het onderdeel (odkop) houdt de nieuwe opgave als de oude het had */
  function houdOdkop(oud, nieuw){
    var o = rijen(oud), n = rijen(nieuw);
    if (!o || !n || !o[0] || !n[0]) return nieuw;
    var k = o[0].querySelector(':scope > .odkop');
    if (!k || n[0].querySelector(':scope > .odkop')) return nieuw;
    n[0].insertBefore(k.cloneNode(true), n[0].firstChild);
    return n[0].outerHTML;
  }
  function nieuwVoor(it){
    var L = A.laatste();
    if (it.bron === 'blad' && model.soort === 'bank'){
      var gezien = {}; model.items.forEach(function(x){ if (x.sl) gezien[x.sl] = true; });
      return Promise.resolve(A.bankNieuw(it.t, it.open, gezien));
    }
    if (it.bron === 'bank') return vervangBank(it);
    if (it.par && it.pvak) return vervangBoek(it);
    if (it.bron === 'blad' && L && L.spel) return vervangSpel(it, L);
    return Promise.resolve(null);
  }
  function vervangBoek(it){
    return BOEKBLAD.laad().then(function(){ return OPDRACHTENBOEK.laad(it.pvak); }).then(laadKiezer).then(function(){
      var al = opBlad(), lijst = OPDRACHTENBOEK.opgaven(it.pvak, it.par, 5);
      for (var i = 0; i < lijst.length; i++){
        var p = BOEKBLAD.paar(lijst[i], A.uitleg());
        if (al[tekstSleutel(p.v)]) continue;
        var t = null; try { t = KIEZER.boekToets(lijst[i], it.pvak, it.par); } catch (e){}
        return { v:p.v, a:p.a, toets:t };
      }
      return null;
    });
  }
  function vervangBank(it){
    return laadKiezer().then(function(){ return KIEZER.bankLijst(it.bvak); }).then(function(lijst){
      var al = {}; model.items.forEach(function(x){ if (x.toets) al[KIEZER.sleutel(x.toets.vraag, x.toets.goed)] = true; });
      var pot = schud(lijst.filter(function(x){ return x.t === it.t && !al[KIEZER.sleutel(x.v, x.goed)]; }));
      return pot.length ? uitBank(KIEZER.alsBlad(pot[0], it.open)) : null;
    });
  }
  function vervangSpel(it, L){
    var S = L.spel, uit;
    try { uit = S.maak(L.keuze, 3); } catch (e){ return Promise.resolve(null); }
    return Promise.resolve(uit).then(function(items){
      if (!Array.isArray(items) || !items.length) return null;
      var b = S.teken(Object.assign({}, L, { items:items, isOpen:function(){ return !!it.open; } }));
      var vr = (rijen(b.vragen) || []).filter(function(x){ return !isKop(x); }), an = (rijen(b.antwoorden) || []).filter(function(x){ return !isKop(x); });
      if (!vr.length || vr.length !== an.length) return null;
      var al = opBlad();
      for (var i = 0; i < vr.length; i++) if (!al[tekstSleutel(vr[i].outerHTML)]) return { v:vr[i].outerHTML, a:an[i].outerHTML };
      return null;
    }, function(){ return null; });
  }
  function vervang(i, knopje){
    var it = model.items[i], reden = kanVervangen(it);
    if (reden){ meld(reden); return; }
    knopje.setAttribute('aria-busy', 'true'); knopje.classList.add('bezig');
    var id = it.id;
    nieuwVoor(it).then(function(n){
      var j = -1; model.items.forEach(function(x, k){ if (x.id === id) j = k; });
      if (j < 0) return;
      if (!n){ model.items[j].geen = true; teken(); focusOp(j, 'vervang'); meld('Er is geen andere opgave van deze soort te vinden.'); return; }
      var x = model.items[j];
      n.v = houdOdkop(x.v, n.v);
      ['t', 'sl', 'open', 'toets'].forEach(function(k){ if (n[k] !== undefined) x[k] = n[k]; });
      x.v = n.v; x.a = n.a;
      if (n.toets === undefined && x.bron === 'blad' && model.soort !== 'bank') delete x.toets;
      actief = j; veranderd(); focusOp(j, 'vervang');
      meld(Naam(j) + ' is vervangen.');
    }, function(){
      knopje.removeAttribute('aria-busy'); knopje.classList.remove('bezig');
      meld('Vervangen lukte niet. Controleer je internet en probeer het nog eens.');
    });
  }

  /* ---------- een vraag erbij: uit het boek, de vragenbank of zelf ---------- */
  function plekTekst(na){
    if (na < 0) return 'bovenaan';
    if (na >= model.items.length - 1) return 'aan het eind';
    return 'na ' + naam(na);
  }
  function bankVak(vak){ return vak === 'reken' ? 'lr-rekenen' : vak; }
  function standaardTab(){ return model.soort === 'boek' ? 'boek' : model.soort === 'bank' ? 'bank' : 'zelf'; }
  var naPlek = -1, eersteKeer = true;
  function voegToe(na, knopje){
    naPlek = na;
    laadKiezer().then(function(){
      ZELF.nieuw();
      var tab = voorBewerk || (eersteKeer ? standaardTab() : KIEZER.tab());
      voorBewerk = ''; eersteKeer = false;
      KIEZER.open({ blad:true, knop:knopje, vak:bankVak(model.vak), plek:plekTekst(na), tab:tab, zelf:ZELF,
        al:function(){ return model.items.filter(function(x){ return x.toets; }).map(function(x){ return KIEZER.sleutel(x.toets.vraag, x.toets.goed); }); },
        klaar:function(lijst){ zetErbij(lijst.map(function(x){ return x.bron === 'boek' ? uitBoek(x) : uitBank(x); }).filter(Boolean)); } });
    }, function(){ meld('Het venster laden lukte niet. Controleer je internet en probeer het nog eens.'); });
  }
  function bewerk(i, knopje){
    var it = model.items[i];
    laadKiezer().then(function(){
      if (KIEZER.tab() !== 'zelf' || !voorBewerk) voorBewerk = eersteKeer ? '' : KIEZER.tab();
      ZELF.bewerk(i, it.e);
      KIEZER.open({ blad:true, knop:knopje, vak:bankVak(model.vak), titel:it.soort === 'kop' ? 'Kopje aanpassen' : 'Vraag aanpassen', plek:naam(i), tab:'zelf', tabs:['zelf'], zelf:ZELF,
        al:function(){ return []; }, klaar:function(){} });
    });
  }
  function zetErbij(nieuw){
    if (!nieuw.length) return;
    var plek = naPlek + 1;
    Array.prototype.splice.apply(model.items, [plek, 0].concat(nieuw));
    actief = plek; veranderd(); focusOp(plek);
    meld(nieuw.length === 1 ? 'De vraag staat op het blad.' : 'De ' + nieuw.length + ' vragen staan op het blad.');
  }
  /* een vraag uit de vragenbank (kiezer) als paar */
  function beeldHtml(b){
    if (!b) return '';
    if (b.vlag && /^[a-z-]{2,8}$/.test(b.vlag)) return '<div class="beeld"><img src="vlaggen/' + b.vlag + '.svg" alt="Een vlag"></div>';
    return b.svg ? '<div class="beeld">' + b.svg + '</div>' : '';
  }
  function uitBank(x){
    if (!x) return null;
    var uitleg = A.uitleg() && x.uitleg ? '<small>' + esc(x.uitleg) + '</small>' : '', v, a, t;
    if (x.vorm === 'mk'){
      var o = schud([x.goed].concat(x.fout)), g = o.indexOf(x.goed);
      v = '<li><span class="vr">' + esc(x.vraag) + '</span>' + beeldHtml(x.beeld) + '<div class="opties">' + o.map(function(y, i){ return '<span><b>' + LETTERS.charAt(i) + '</b>' + esc(y) + '</span>'; }).join('') + '</div></li>';
      a = '<li><span class="goed">' + LETTERS.charAt(g) + '. ' + esc(x.goed) + '</span>' + uitleg + '</li>';
      t = { vorm:'mk', vraag:x.vraag, goed:x.goed, fout:x.fout.slice(), uitleg:x.uitleg || '' };
    } else {
      v = '<li><span class="vr">' + esc(x.vraag) + '</span>' + beeldHtml(x.beeld) + '<span class="lijn' + (String(x.goed || '').length > 35 ? ' twee' : '') + '" aria-hidden="true"></span></li>';
      a = '<li><span class="goed">' + esc(x.goed || (x.antwoorden || [])[0] || '') + '</span>' + uitleg + '</li>';
      t = { vorm:'open', vraag:x.vraag, goed:x.goed, antwoorden:(x.antwoorden || []).slice(), uitleg:x.uitleg || '' };
    }
    if (x.beeld) t.beeld = x.beeld;
    return { id:nieuwId(), soort:'op', bron:'bank', v:v, a:a, toets:t, bvak:x.vak, t:x.t, open:x.vorm === 'open' };
  }
  function uitBoek(x){
    var p = BOEKBLAD.paar(x.o, A.uitleg());
    return { id:nieuwId(), soort:'op', bron:'boek', v:p.v, a:p.a, toets:x.toets || null, pvak:x.pvak, par:x.par };
  }

  /* ---------- Zelf schrijven: de derde tab van het venster ---------- */
  var ZELF = (function(){
    var el = null, e = null, bewerkI = -1, focusNa = false;
    function leeg(){ return { soort:'open', vraag:'', opties:['', '', ''], goed:0, lijnen:2, antwoord:'', uitleg:'', plaatje:'', kop:'', tekst:'' }; }
    function bouw(doel){
      el = doel;
      el.innerHTML = '<div class="zs">' +
        '<div class="zs-form">' +
          '<div class="zs-veld"><span id="zsSoortLbl">Soort</span><div class="wm-seg zs-seg" role="group" aria-labelledby="zsSoortLbl">' +
            '<button type="button" data-zs="open" aria-pressed="true">Open vraag</button><button type="button" data-zs="mk" aria-pressed="false">Meerkeuze</button><button type="button" data-zs="kop" aria-pressed="false">Kopje of tekst</button></div></div>' +
          '<label class="zs-veld zs-alsvraag">De vraag<textarea class="veld" id="zsVraag" rows="2" maxlength="' + MAX.vraag + '"></textarea></label>' +
          '<label class="zs-veld zs-alskop"><span>Kopje <small>bijvoorbeeld Deel A: zonder rekenmachine</small></span><input class="veld" id="zsKop" maxlength="' + MAX.kop + '" autocomplete="off"></label>' +
          '<label class="zs-veld zs-alskop"><span>Tekst eronder <small>mag leeg; een uitleg of een tekst om te lezen</small></span><textarea class="veld" id="zsTekst" rows="4" maxlength="' + MAX.tekst + '"></textarea></label>' +
          '<div class="zs-veld zs-alsmk" role="group" aria-labelledby="zsAntLbl"><span id="zsAntLbl">Antwoorden <small>klik op Goed bij het goede antwoord</small></span><div class="zs-opties" id="zsOpties"></div></div>' +
          '<div class="zs-rij zs-alsopen">' +
            '<div class="zs-veld"><span id="zsLijnLbl">Schrijflijnen</span><div class="wm-teller"><button type="button" id="zsMinder" aria-label="Een lijn minder">&#8722;</button><output id="zsLijnen" aria-labelledby="zsLijnLbl" aria-live="polite">2</output><button type="button" id="zsMeer" aria-label="Een lijn meer">+</button></div></div>' +
            '<label class="zs-veld"><span>Antwoord op het antwoordblad <small>mag leeg</small></span><input class="veld" id="zsAntwoord" maxlength="' + MAX.antwoord + '" autocomplete="off"></label>' +
          '</div>' +
          '<div class="zs-rij">' +
            '<div class="zs-veld"><span id="zsPlaatLbl">Plaatje <small>mag leeg</small></span><div id="zsPlaat"></div></div>' +
            '<label class="zs-veld zs-alsvraag"><span>Uitleg op het antwoordblad <small>mag leeg</small></span><textarea class="veld" id="zsUitleg" rows="3" maxlength="' + MAX.uitleg + '"></textarea></label>' +
          '</div>' +
          '<p class="zs-melding" id="zsMelding" role="status" aria-live="polite"></p>' +
        '</div>' +
        '<aside class="zs-voor" aria-labelledby="zsVoorKop">' +
          '<p class="zs-voorkop" id="zsVoorKop">Zo komt het op het blad</p>' +
          '<div class="blad zs-blad" id="zsBlad"></div>' +
          '<div class="zs-antw" id="zsAntw"></div>' +
          '<div class="zs-knoppen"><button type="button" class="knop stil" id="zsAnnuleer">Annuleren</button><button type="button" class="knop" id="zsZet">Zet op het blad</button></div>' +
        '</aside></div>';
      el.querySelector('.zs-seg').addEventListener('click', function(ev){ var b = ev.target.closest('[data-zs]'); if (b){ e.soort = b.getAttribute('data-zs'); vorm(); voorbeeld(); } });
      [['zsVraag', 'vraag'], ['zsKop', 'kop'], ['zsTekst', 'tekst'], ['zsAntwoord', 'antwoord'], ['zsUitleg', 'uitleg']].forEach(function(p){
        $(p[0]).addEventListener('input', function(){ e[p[1]] = this.value; voorbeeld(); });
      });
      $('zsMinder').addEventListener('click', function(){ e.lijnen = Math.max(1, e.lijnen - 1); lijnen(); voorbeeld(); });
      $('zsMeer').addEventListener('click', function(){ e.lijnen = Math.min(8, e.lijnen + 1); lijnen(); voorbeeld(); });
      var op = $('zsOpties');
      op.addEventListener('input', function(ev){
        var i = Number(ev.target.getAttribute('data-o'));
        if (ev.target.hasAttribute('data-nieuw')){
          /* typen in de lege regel: dat wordt een nieuw antwoord, de cursor blijft staan */
          e.opties.push(ev.target.value); opties(); var n = op.querySelector('[data-o="' + (e.opties.length - 1) + '"]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length);
        } else if (i >= 0) e.opties[i] = ev.target.value;
        voorbeeld();
      });
      op.addEventListener('click', function(ev){
        var g = ev.target.closest('[data-goed]'), w = ev.target.closest('[data-optweg]');
        if (g){ e.goed = Number(g.getAttribute('data-goed')); opties(); op.querySelector('[data-goed="' + e.goed + '"]').focus(); voorbeeld(); }
        if (w){
          var i = Number(w.getAttribute('data-optweg'));
          e.opties.splice(i, 1); if (e.goed === i) e.goed = 0; else if (e.goed > i) e.goed--;
          opties(); var f = op.querySelector('[data-o="' + Math.min(i, e.opties.length - 1) + '"]') || op.querySelector('[data-nieuw]'); if (f) f.focus(); voorbeeld();
        }
      });
      plaatKoppel();
      $('zsAnnuleer').addEventListener('click', function(){ KIEZER.sluit(); });
      $('zsZet').addEventListener('click', zet);
    }
    function vorm(){
      [].forEach.call(el.querySelectorAll('[data-zs]'), function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-zs') === e.soort)); });
      var kop = e.soort === 'kop';
      [].forEach.call(el.querySelectorAll('.zs-alsvraag'), function(x){ x.classList.toggle('hide', kop); });
      [].forEach.call(el.querySelectorAll('.zs-alskop'), function(x){ x.classList.toggle('hide', !kop); });
      [].forEach.call(el.querySelectorAll('.zs-alsmk'), function(x){ x.classList.toggle('hide', e.soort !== 'mk'); });
      [].forEach.call(el.querySelectorAll('.zs-alsopen'), function(x){ x.classList.toggle('hide', e.soort !== 'open'); });
      melding('');
    }
    function lijnen(){ $('zsLijnen').textContent = e.lijnen; $('zsMinder').disabled = e.lijnen <= 1; $('zsMeer').disabled = e.lijnen >= 8; }
    function opties(){
      $('zsOpties').innerHTML = e.opties.map(function(o, i){
        var l = LETTERS.charAt(i), goed = i === e.goed;
        return '<div class="zs-opt' + (goed ? ' goed' : '') + '"><b class="zs-letter" aria-hidden="true">' + l + '</b>' +
          '<input class="veld" data-o="' + i + '" value="' + esc(o) + '" maxlength="' + MAX.optie + '" aria-label="Antwoord ' + l + '" autocomplete="off">' +
          '<button type="button" class="zs-goed" data-goed="' + i + '" aria-pressed="' + goed + '" aria-label="Antwoord ' + l + ' is goed">Goed</button>' +
          '<button type="button" class="zs-optweg" data-optweg="' + i + '" aria-label="Antwoord ' + l + ' weghalen"' + (e.opties.length <= 2 ? ' disabled' : '') + '>&times;</button></div>';
      }).join('') + (e.opties.length < LETTERS.length ? '<div class="zs-opt nieuw"><span></span><input class="veld" data-nieuw="1" placeholder="Nog een antwoord" aria-label="Nog een antwoord" maxlength="' + MAX.optie + '" autocomplete="off"><span></span><span></span></div>' : '');
    }
    /* ---------- het plaatje: kiezen of slepen, dan verkleind tot een kleine jpeg ---------- */
    function plaat(){
      var p = $('zsPlaat');
      if (e.plaatje && PLAATJE.test(e.plaatje)){
        p.innerHTML = '<div class="zs-heeft"><img src="' + esc(e.plaatje) + '" alt="Het gekozen plaatje"><div class="zs-plaatknoppen"><label class="knop stil klein zs-kiesknop">Ander plaatje<input type="file" accept="image/*" id="zsBestand" class="zs-sr"></label><button type="button" class="knop stil klein" id="zsPlaatWeg">Weghalen</button></div></div>';
      } else {
        p.innerHTML = '<label class="zs-plaat" id="zsSleep">Sleep een plaatje hierheen of kies er een<input type="file" accept="image/*" id="zsBestand" class="zs-sr"></label>';
      }
    }
    function plaatKoppel(){
      var p = $('zsPlaat');
      p.addEventListener('change', function(ev){ if (ev.target.id === 'zsBestand' && ev.target.files && ev.target.files[0]) neem(ev.target.files[0]); });
      p.addEventListener('click', function(ev){ if (ev.target.id === 'zsPlaatWeg'){ e.plaatje = ''; plaat(); voorbeeld(); var b = $('zsBestand'); if (b) b.focus(); } });
      p.addEventListener('dragover', function(ev){ ev.preventDefault(); var z = $('zsSleep'); if (z) z.classList.add('sleep'); });
      p.addEventListener('dragleave', function(){ var z = $('zsSleep'); if (z) z.classList.remove('sleep'); });
      p.addEventListener('drop', function(ev){ ev.preventDefault(); var z = $('zsSleep'); if (z) z.classList.remove('sleep'); var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if (f) neem(f); });
    }
    function neem(f){
      melding('Het plaatje verkleinen…');
      verklein(f).then(function(d){ e.plaatje = d; plaat(); voorbeeld(); melding(''); var w = $('zsPlaatWeg'); if (w) w.focus(); }, function(f){ melding(f.message, 'fout'); });
    }
    /* Hoogstens 800 beeldpunten en zo'n 150 kB: dan past een handvol plaatjes in localStorage */
    function verklein(f){
      return new Promise(function(ok, mis){
        if (!f || !/^image\//.test(f.type)) return mis(new Error('Kies een plaatje: jpg, png of webp.'));
        var url = URL.createObjectURL(f), img = new Image();
        img.onload = function(){
          URL.revokeObjectURL(url);
          var s = Math.min(1, 800 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
          var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
          var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          var q = 0.82, uit = c.toDataURL('image/jpeg', q);
          while (uit.length > 200000 && q > 0.35){ q -= 0.12; uit = c.toDataURL('image/jpeg', q); }
          if (uit.length > 200000) return mis(new Error('Dit plaatje blijft te groot, ook verkleind. Snijd het bij of kies een ander.'));
          ok(uit);
        };
        img.onerror = function(){ URL.revokeObjectURL(url); mis(new Error('Dit bestand kan ik niet lezen als plaatje.')); };
        img.src = url;
      });
    }
    function melding(t, soort){ var m = $('zsMelding'); if (!m) return; m.textContent = t || ''; m.className = 'zs-melding' + (soort ? ' ' + soort : ''); }
    /* rechts: zo komt het op het blad, met het nummer dat hij krijgt, en de regel van het antwoordblad */
    function voorbeeld(){
      var x = schoonE(e, true), p = eigenPaar(x, true);
      var nr = bewerkI >= 0 ? nummer(bewerkI) - (model.items[bewerkI].soort === 'op' ? 1 : 0) : (function(){ var n = 0; for (var j = 0; j <= naPlek && j < model.items.length; j++) if (model.items[j].soort === 'op') n++; return n; })();
      $('zsBlad').innerHTML = '<ol style="counter-reset:v ' + nr + '">' + p.v + '</ol>';
      var r = rijen(p.a), goed = r && r[0] && r[0].querySelector('.goed'), uit = r && r[0] && r[0].querySelector('small');
      $('zsAntw').innerHTML = x.soort === 'kop' ? '<span>Op het antwoordblad staat ' + (x.kop ? 'het kopje.' : 'niets.') + '</span>'
        : '<b>Antwoordblad:</b> ' + esc(goed ? goed.textContent : '') + (uit ? '<span class="zs-uitleg">' + esc(uit.textContent) + '</span>' : '');
    }
    /* de velden zoals ze op het blad gaan: getrimd, lege antwoorden eruit */
    function schoonE(x, voorbeeld){
      var y = { soort:x.soort, plaatje:x.plaatje && PLAATJE.test(x.plaatje) ? x.plaatje : '' };
      if (x.soort === 'kop'){ y.kop = String(x.kop || '').trim().slice(0, MAX.kop); y.tekst = String(x.tekst || '').trim().slice(0, MAX.tekst); return y; }
      y.vraag = String(x.vraag || '').trim().slice(0, MAX.vraag) || (voorbeeld ? 'Je vraag komt hier.' : '');
      y.uitleg = String(x.uitleg || '').trim().slice(0, MAX.uitleg);
      if (x.soort === 'mk'){
        var o = [], g = -1;
        x.opties.forEach(function(t, i){ t = String(t || '').trim().slice(0, MAX.optie); if (!t) return; if (i === x.goed) g = o.length; o.push(t); });
        if (voorbeeld && !o.length){ o = ['Antwoord a', 'Antwoord b']; g = 0; }
        y.opties = o; y.goed = g < 0 ? 0 : g;
      } else { y.lijnen = Math.max(1, Math.min(8, Number(x.lijnen) || 1)); y.antwoord = String(x.antwoord || '').trim().slice(0, MAX.antwoord); }
      return y;
    }
    function zet(){
      var x = schoonE(e, false);
      if (x.soort === 'kop' && !x.kop && !x.tekst){ melding('Schrijf een kopje of een tekst.', 'fout'); $('zsKop').focus(); return; }
      if (x.soort !== 'kop' && !x.vraag){ melding('Schrijf eerst de vraag.', 'fout'); $('zsVraag').focus(); return; }
      if (x.soort === 'mk'){
        if (x.opties.length < 2){ melding('Een meerkeuzevraag heeft minstens twee antwoorden.', 'fout'); var leeg = [].filter.call($('zsOpties').querySelectorAll('input'), function(i){ return !i.value.trim(); })[0]; if (leeg) leeg.focus(); return; }
        if (!String(e.opties[e.goed] || '').trim()){ melding('Het antwoord dat je Goed noemde is leeg. Klik op Goed bij het goede antwoord.', 'fout'); var g = $('zsOpties').querySelector('[data-goed]'); if (g) g.focus(); return; }
      }
      var i = bewerkI, na = naPlek;
      KIEZER.sluit();
      if (i >= 0 && model.items[i]){
        model.items[i].e = x; model.items[i].soort = x.soort === 'kop' ? 'kop' : 'op';
        actief = i; veranderd(); focusOp(i, 'bewerk');
        meld(Naam(i) + ' is aangepast.');
      } else {
        naPlek = na;
        zetErbij([{ id:nieuwId(), soort:x.soort === 'kop' ? 'kop' : 'op', bron:'eigen', e:x }]);
      }
    }
    function vul(){
      vorm(); lijnen(); opties(); plaat();
      $('zsVraag').value = e.vraag; $('zsKop').value = e.kop; $('zsTekst').value = e.tekst; $('zsAntwoord').value = e.antwoord; $('zsUitleg').value = e.uitleg;
      $('zsZet').textContent = bewerkI >= 0 ? 'Pas aan op het blad' : 'Zet op het blad';
      voorbeeld();
    }
    return {
      bouw:bouw,
      nieuw:function(){ e = leeg(); bewerkI = -1; focusNa = false; if (el) vul(); },
      bewerk:function(i, x){
        bewerkI = i; focusNa = true;
        e = leeg(); Object.keys(x || {}).forEach(function(k){ e[k] = x[k]; });
        e.opties = x && x.opties && x.opties.length ? x.opties.slice() : ['', '', ''];
        while (e.opties.length < 2) e.opties.push('');
        if (el) vul();
      },
      toon:function(){
        if (!e) e = leeg();
        vul();
        if (focusNa){ focusNa = false; (e.soort === 'kop' ? $('zsKop') : $('zsVraag')).focus(); }
      }
    };
  })();

  /* ---------- Bewaar in Mijn materiaal: als toets ---------- */
  function bewaarMelden(tekst, soort, html){ bewaarMelding = { tekst:tekst || '', soort:soort || '', html:html || '' }; var m = $('samenBewaarMelding'); if (m){ m.className = 'wm-bewaar' + (soort ? ' ' + soort : ''); if (html) m.innerHTML = html; else m.textContent = tekst || ''; } }
  /* Een opgave van het blad zelf (een spel, de leerroute) als toetsvraag: de tekst,
     de keuzes als die er zijn, en een figuur als plaatje als er precies een is. */
  function uitHtml(it){
    var vr = rijen(it.v), an = rijen(it.a);
    if (!vr || !vr[0] || !an || !an[0]) return { reden:'deze opgave kan niet als toetsvraag' };
    var li = vr[0].cloneNode(true), goedEl = an[0].querySelector('.goed'), uitEl = an[0].querySelector('small');
    [].forEach.call(li.querySelectorAll('.odkop,.wb-bed,.kiesuit,.velden-wb,.dh-reken,.antwregel,.rw-eind,.rw-stappen,.ob-ant'), function(x){ x.remove(); });
    /* een regel om het antwoord op te schrijven ("oppervlakte = ___ × ___") hoort niet bij de vraag */
    [].forEach.call(li.querySelectorAll('.lijn'), function(l){ var o = l.parentNode; if (!o) return; if (o !== li && !o.classList.contains('vr')) o.remove(); else l.remove(); });
    /* tussen blokken een spatie, anders plakken de zinnen aan elkaar */
    [].forEach.call(li.querySelectorAll('div,p,br,h3,li,.vr,.opdr,.lr-context'), function(x){ x.insertAdjacentText('afterend', ' '); });
    var opt = li.querySelector('.opties'), keuzes = [];
    if (opt){
      if (opt.querySelector('svg, img')) return { reden:'de keuzes zijn plaatjes' };
      keuzes = [].map.call(opt.querySelectorAll(':scope > span'), function(s){ var c = s.cloneNode(true), b = c.querySelector('b'); if (b) b.remove(); return c.textContent.replace(/\s+/g, ' ').trim(); });
      opt.remove();
    }
    var figuren = li.querySelectorAll('svg').length, anders = li.querySelector('img, table, input, .eigen-wb, .sleep-wb');
    [].forEach.call(li.querySelectorAll('svg, .beeld, .dh, .rm-wb'), function(x){ if (x.parentNode) x.remove(); });
    var vraag = li.textContent.replace(/\s+/g, ' ').trim(), goed = goedEl ? goedEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!vraag || !goed) return { reden:'deze opgave kan niet als toetsvraag' };
    if (anders || figuren > 1) return { reden:'de figuur kan niet mee in een toets' };
    if (vraag.length > MAX.vraag) return { reden:'de tekst is te lang voor een toetsvraag' };
    var t, m = /^([a-f])\. ([\s\S]*)$/.exec(goed), uitleg = uitEl ? uitEl.textContent.replace(/\s+/g, ' ').trim().slice(0, MAX.uitleg) : '';
    if (keuzes.length >= 2 && m && keuzes.every(Boolean)){
      var g = LETTERS.indexOf(m[1]); if (!keuzes[g]) return { reden:'deze opgave kan niet als toetsvraag' };
      t = { vorm:'mk', vraag:vraag, goed:keuzes[g], fout:keuzes.filter(function(k, j){ return j !== g; }), uitleg:uitleg };
    } else {
      if (m) goed = m[2];
      t = { vorm:'open', vraag:vraag, goed:goed, antwoorden:goed.length <= MAX.antwoord ? [goed] : [], uitleg:uitleg };
    }
    if (figuren === 1) t.figuur = true;
    return t;
  }
  /* De figuur zoals hij nu op het blad staat, met de stijl erin geschreven: als
     plaatje kent hij de stylesheet van de pagina niet meer. */
  var STIJLEN = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'opacity', 'font-size', 'font-weight', 'font-family', 'font-style', 'text-anchor', 'dominant-baseline', 'display', 'visibility'];
  function figuurVan(i){
    var li = $('bladen').querySelector('.wb-voor > ol > li[data-i="' + i + '"]') || $('bladen').querySelectorAll('.wb-voor > ol > li')[i];
    var svg = li && [].filter.call(li.querySelectorAll('svg'), function(s){ return !s.closest('.opties, .wb-bed') && !(s.parentNode && s.parentNode.closest && s.parentNode.closest('svg')); })[0];
    if (!svg) return '';
    var c = svg.cloneNode(true), van = svg.querySelectorAll('*'), naar = c.querySelectorAll('*');
    function zet(a, b){ var cs = getComputedStyle(a); b.setAttribute('style', STIJLEN.map(function(p){ var w = cs.getPropertyValue(p); return w ? p + ':' + w : ''; }).filter(Boolean).join(';')); }
    zet(svg, c); for (var k = 0; k < van.length; k++) zet(van[k], naar[k]);
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    c.removeAttribute('class');
    var r = svg.getBoundingClientRect();
    if (r.width && !c.getAttribute('width')){ c.setAttribute('width', Math.round(r.width * 2)); c.setAttribute('height', Math.round(r.height * 2)); }
    var s = new XMLSerializer().serializeToString(c);
    /* een witte achtergrond, net als op papier */
    return s.replace(/(<svg\b[^>]*>)/, '$1<rect x="-10000" y="-10000" width="20000" height="20000" fill="#fff"/>');
  }
  function toetsVan(it){
    if (it.bron === 'eigen'){
      var e = it.e;
      if (e.soort === 'mk') return { vorm:'mk', vraag:e.vraag, goed:e.opties[e.goed], fout:e.opties.filter(function(o, i){ return i !== e.goed; }), uitleg:e.uitleg || '', plaatje:e.plaatje || '' };
      return { vorm:'open', vraag:e.vraag, goed:e.antwoord, antwoorden:e.antwoord ? [e.antwoord] : [], uitleg:e.uitleg || '', plaatje:e.plaatje || '' };
    }
    if (it.toets) return it.toets.reden ? { reden:it.toets.reden } : it.toets;
    return uitHtml(it);
  }
  function bewaarMateriaal(){
    var knopje = $('samenBewaar'); if (!model || !knopje || knopje.disabled) return;
    knopje.disabled = true; knopje.setAttribute('aria-busy', 'true');
    bewaarMelden('Bewaren…');
    var kopjes = 0, weg = [], items = [], plaatjes = 0;
    Promise.all([laadEigen(), laadKiezer()]).then(function(){
      model.items.forEach(function(it, i){
        if (it.soort === 'kop'){ if (it.bron === 'eigen' || it.a) kopjes++; return; }
        var t = toetsVan(it), nr = nummer(i);
        if (t.reden){ weg.push({ nr:nr, reden:t.reden }); return; }
        /* het plaatje: een eigen plaatje, een vlag, een figuur uit het boek, of de figuur zoals hij op het blad staat */
        var beeld = t.plaatje ? { data:t.plaatje } : t.beeld && t.beeld.vlag ? t.beeld : t.svg ? { svg:t.svg } : (t.beeld && t.beeld.svg) || t.figuur ? { svg:figuurVan(i) } : null;
        if (beeld && beeld.svg !== undefined && !beeld.svg) return weg.push({ nr:nr, reden:'de figuur kan niet mee in een toets' });
        if (beeld && plaatjes >= 12) return weg.push({ nr:nr, reden:'een toets heeft hoogstens 12 plaatjes' });
        if (beeld) plaatjes++;
        var x = t.vorm === 'mk' ? { vorm:'mk', vraag:t.vraag, goed:t.goed, fout:t.fout.slice(0, 5), uitleg:t.uitleg || '', punten:t.punten || 1 }
          : { vorm:'open', vraag:t.vraag, antwoorden:(t.antwoorden || []).slice(0, 8), uitleg:t.uitleg || '', punten:t.punten || 1 };
        items.push({ x:x, beeld:beeld, nr:nr });
      });
      if (!items.length) throw new Error('Er staat geen vraag op dit blad die in een toets kan.');
      if (items.length > 200) items = items.slice(0, 200);
      /* de plaatjes klaarmaken: een eigen plaatje is al een jpeg, een figuur of vlag wordt er een */
      return Promise.all(items.map(function(y){
        if (!y.beeld) return y;
        var p = y.beeld.data ? Promise.resolve(y.beeld.data) : KIEZER.plaatje(y.beeld);
        return p.then(function(d){ y.x.afbData = d; return y; }, function(){ weg.push({ nr:y.nr, reden:'het plaatje lukte niet' }); return null; });
      }));
    }).then(function(lijst){
      lijst = lijst.filter(Boolean);
      var m = { soort:'oefening', naam:(model.kop.titel || 'Werkblad').slice(0, 80), vak:String(model.vak || '').slice(0, 12), modus:'toets', terugzien:false, husselen:false, items:lijst.map(function(y){ return y.x; }) };
      return bewaarMetPlaatjes(m, model.code).then(function(j){ return { j:j, n:lijst.length }; });
    }).then(function(r){
      model.code = r.j.code; bewaarHier();
      knopje = $('samenBewaar'); if (knopje){ knopje.disabled = false; knopje.removeAttribute('aria-busy'); knopje.textContent = 'Bewaar opnieuw in Mijn materiaal'; }
      var na = [];
      if (kopjes) na.push((kopjes === 1 ? 'Het kopje staat' : 'De ' + kopjes + ' kopjes staan') + ' er niet in: een toets heeft geen kopjes.');
      if (weg.length){
        weg.sort(function(a, b){ return a.nr - b.nr; });
        na.push((weg.length === 1 ? 'Opgave ' + weg[0].nr + ' kon niet mee' : 'Opgave ' + weg.map(function(w){ return w.nr; }).join(', ').replace(/, (\d+)$/, ' en $1') + ' konden niet mee') + ': ' + weg.filter(function(w, i, a){ return a.map(function(x){ return x.reden; }).indexOf(w.reden) === i; }).map(function(w){ return w.reden; }).join('; ') + '.');
      }
      bewaarMelden('', 'goed', 'Bewaard als toets in Mijn materiaal, met ' + r.n + (r.n === 1 ? ' vraag' : ' vragen') + ' en de code <b>' + esc(r.j.code) + '</b>. ' +
        (na.length ? esc(na.join(' ')) + ' ' : '') + '<a href="maken.html?code=' + encodeURIComponent(r.j.code) + '">Open de toets in Mijn materiaal</a>');
    }).catch(function(f){
      knopje = $('samenBewaar'); if (knopje){ knopje.disabled = false; knopje.removeAttribute('aria-busy'); }
      var zin = String((f && f.message) || 'Bewaren lukte niet.'); zin = zin.charAt(0).toUpperCase() + zin.slice(1) + (/[.!?]$/.test(zin) ? '' : '.');
      if (f && f.deels){ model.code = f.deels.code; bewaarHier(); }
      bewaarMelden(zin + (f && (f.deels || (f.status >= 400 && f.status < 500)) || /geen vraag/.test(zin) ? '' : ' Controleer je internet en probeer het opnieuw.'), 'fout');
    });
  }
  /* zoals in maken.html: eerst de toets (dan is er een code), dan elk plaatje, dan de toets met de nummers */
  function bewaarMetPlaatjes(m, code){
    var nieuw = m.items.filter(function(it){ return it.afbData; });
    var kaalM = Object.assign({}, m, { items:m.items.map(function(it){ var y = Object.assign({}, it); delete y.afbData; return y; }) });
    /* een code die niet (meer) van ons is: dan een nieuwe toets */
    if (code && !EIGEN.mijn().some(function(x){ return x.code === code; })) code = '';
    return EIGEN.bewaar(kaalM, code || undefined).then(function(j){
      if (!nieuw.length) return j;
      bewaarMelden('Bewaard; nu ' + (nieuw.length === 1 ? 'het plaatje' : 'de ' + nieuw.length + ' plaatjes') + '…');
      var ketting = Promise.resolve();
      nieuw.forEach(function(it){ ketting = ketting.then(function(){ return EIGEN.afbeelding(j.code, it.afbData).then(function(r){ it.afb = r.id; delete it.afbData; }); }); });
      return ketting.then(function(){ return EIGEN.bewaar(m, j.code); }).then(function(){ return j; })
        .catch(function(f){ var e = new Error('De toets is bewaard, maar een plaatje niet: ' + (f.message || 'geen verbinding') + '. Klik nog eens op Bewaar.'); e.deels = j; throw e; });
    });
  }

  /* ---------- de stijl ---------- */
  function stijl(){
    var s = document.createElement('style');
    s.textContent =
      /* de schakelaar boven het blad */
      '.wm-stand{background:var(--stand)}.wm-stand button{padding:0 14px}' +
      '.wm-standuitleg{margin:-4px 0 10px;font-size:.86rem}' +
      '@media(max-width:480px){.wm-balk .wm-stand{flex:1 1 100%}}' +
      /* links: de samenvatting */
      '.wm-samen{display:grid;gap:12px}' +
      '.wm-let{background:var(--zelf);border:1.5px solid var(--zelf-rand);border-radius:16px;padding:14px 16px;font-size:.9rem;line-height:1.5}' +
      '.wm-let b{font-weight:600}' +
      '.wm-ditblad{display:grid;gap:8px}.wm-ditblad .wm-stap{margin:0}' +
      '.wm-tel{font-size:.95rem}.wm-tel b{font-weight:600}.wm-zelf{color:var(--zelf-inkt);font-weight:600}' +
      '.wm-ditblad .tip{font-size:.85rem}.wm-foutje{color:var(--fout)}' +
      '.wm-ditblad .rij{margin-top:4px}.wm-ditblad .knop{padding:0 14px;font-size:.9rem;border-radius:12px;box-shadow:none}' +
      '.knop.stil.wm-rood{color:var(--fout)}' +
      '.wm-bewaar{font-size:.86rem;line-height:1.5}.wm-bewaar:empty{display:none}.wm-bewaar.fout{color:var(--fout)}.wm-bewaar.goed b{font-weight:700;letter-spacing:.06em}' +
      /* op het blad: aanklikken, de knoppen, + Vraag hier (op wit papier, dus vaste kleuren) */
      '.blad .wb-bed{display:none}' +
      /* alleen op het scherm: op papier is er niets gekozen en niets oranje */
      '@media screen{' +
      '.bladen.samen .wb-voor > ol > li.wb-item{cursor:pointer;border-radius:10px;transition:background-color .12s,box-shadow .12s}' +
      '.bladen.samen .wb-voor > ol > li.wb-item:hover{background:#F7F4EF;box-shadow:0 0 0 8px #F7F4EF}' +
      '.bladen.samen .wb-voor > ol > li.wb-item:focus{outline:none}' +
      '.bladen.samen .wb-voor > ol > li.wb-item:focus-visible{box-shadow:0 0 0 8px #fff,0 0 0 11px #B4701A}' +
      '.bladen.samen .blad li.wb-eigen{background:#FFF4E5;box-shadow:0 0 0 8px #FFF4E5}' +
      '.bladen.samen .wb-voor > ol > li.wb-actief,.bladen.samen .wb-voor > ol > li.wb-actief:hover{background:#F5F8FF;box-shadow:0 0 0 8px #F5F8FF,0 0 0 9.5px #204ECF;cursor:default}' +
      '.bladen.samen .wb-voor > ol > li.wb-actief:focus-visible{box-shadow:0 0 0 8px #F5F8FF,0 0 0 9.5px #204ECF,0 0 0 13px #B4701A}' +
      '.bladen.samen .wb-label{display:block;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:#8a4b16;margin-bottom:2px}' +
      '.bladen.samen .wb-gereed{display:flex;gap:4px;float:right;margin:-2px 0 6px 12px;position:relative;z-index:1}' +
      '.wb-ik{width:40px;height:40px;border-radius:10px;border:0;background:#fff;color:#14224C;display:grid;place-items:center;padding:0;box-shadow:0 0 0 1px #DCD3C8;cursor:pointer}' +
      '.wb-ik:hover{box-shadow:0 0 0 1.5px #204ECF}' +
      '.wb-ik svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.wb-ik.wb-weg{color:#B3361F}' +
      '.wb-ik[aria-disabled="true"]{opacity:.38;cursor:default;box-shadow:0 0 0 1px #DCD3C8}' +
      '.wb-ik.bezig svg{animation:wb-draai 1s linear infinite}@keyframes wb-draai{to{transform:rotate(360deg)}}' +
      '@media(prefers-reduced-motion:reduce){.wb-ik.bezig svg{animation:none}.wb-ik.bezig{opacity:.6}}' +
      '.bladen.samen .wb-erbij{display:flex;align-items:center;gap:10px;clear:both;margin:14px 0 -2px;color:#204ECF}' +
      '.wb-erbij::before,.wb-erbij::after{content:"";flex:1;border-top:1.5px dashed #9fb3ea}' +
      '.wb-erbij button{border:1.5px solid #9fb3ea;background:#fff;color:#204ECF;border-radius:999px;min-height:40px;padding:0 14px;font-size:.86rem;font-weight:600}' +
      '.bladen.samen .wb-eind{display:block;margin-top:16px}' +
      '.wb-eind button{width:100%;min-height:52px;border:2px dashed #9fb3ea;border-radius:14px;background:#F5F8FF;color:#204ECF;font-size:.95rem;font-weight:600}' +
      '.wb-erbij button:hover,.wb-eind button:hover{border-color:#204ECF}' +
      '@media(max-width:600px){.bladen.samen .wb-gereed{float:none;justify-content:flex-end;margin:0 0 8px}}' +
      '}' +
      /* een eigen kopje en een eigen plaatje, ook op papier */
      '.blad > ol > li.wb-kop{counter-increment:none;padding:16px 0 6px;border-bottom:0}' +
      '.blad > ol > li.wb-kop::before{display:none}' +
      '.blad > ol > li.wb-kop:first-child{padding-top:4px}' +
      '.blad .wb-kop h3{margin:0;font-size:1.08rem;font-weight:600;letter-spacing:-.01em}' +
      '.blad .wb-kop .wb-tekst{margin:6px 0 0;font-size:.93rem;line-height:1.6;max-width:68ch}' +
      '.blad .beeld.wb-plaat img{max-width:min(100%,320px);max-height:220px}' +
      '@media print{.blad > ol > li.wb-kop{break-after:avoid}.blad > ol > li.wb-item{outline:none !important;box-shadow:none !important;background:none !important}}' +
      /* het venstertje met ja of nee */
      '.wb-vraag{width:min(480px,100% - 32px);border:1px solid var(--rand);border-radius:20px;padding:22px;background:var(--kaart);color:var(--ink);box-shadow:var(--schaduw)}' +
      '.wb-vraag::backdrop{background:rgba(15,26,61,.55)}' +
      '.wb-vraag h2{font-size:1.2rem;margin:0 0 8px}.wb-vraag p{color:var(--muted);margin:0 0 18px}' +
      '.wb-vraag .rij{justify-content:flex-end}' +
      '.wb-vraag .knop{box-shadow:none}' +
      '.wb-sr,.zs-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}' +
      /* Zelf schrijven */
      '.zs{flex:1 1 auto;min-height:0;display:flex;flex-wrap:wrap;overflow:auto;overscroll-behavior:contain}' +
      '.zs-form{flex:999 1 480px;min-width:0;padding:20px 22px;display:flex;flex-direction:column;gap:16px;background:var(--kaart)}' +
      '.zs-voor{flex:1 1 320px;min-width:0;max-width:440px;padding:20px 22px;border-left:1px solid var(--rand2);background:var(--kaart2);display:flex;flex-direction:column;gap:12px}' +
      '@media(max-width:860px){.zs-voor{max-width:none;border-left:0;border-top:1px solid var(--rand2)}}' +
      '.zs-veld{display:flex;flex-direction:column;gap:6px;font-size:.86rem;font-weight:600;min-width:0}' +
      '.zs-veld small{font-weight:400;color:var(--muted)}' +
      '.zs-veld textarea.veld{resize:vertical;line-height:1.45;font:inherit;font-weight:400}.zs-uitleg{display:block;color:#4a5270;margin-top:2px}.zs-veld input.veld{font-weight:400}' +
      '.zs-seg button{flex:1 1 0}' +
      '.zs-rij{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}' +
      '@media(max-width:640px){.zs-rij{grid-template-columns:minmax(0,1fr)}.zs-seg button{white-space:normal;line-height:1.2}}' +
      '.zs-opties{display:grid;gap:8px}' +
      '.zs-opt{display:grid;grid-template-columns:18px minmax(0,1fr) auto 40px;gap:6px;align-items:center;padding:3px 3px 3px 12px;border-radius:12px;border:1.5px solid var(--rand2);background:var(--kaart)}' +
      '.zs-opt .veld{border:0;background:transparent;min-height:40px;padding:0 4px;border-radius:8px}' +
      '.zs-opt .veld:focus{outline:none}.zs-opt:focus-within{border-color:var(--ocean)}' +
      '.zs-opt.goed{border-color:var(--goed);background:var(--goed-bg)}.zs-opt.goed .zs-letter{color:var(--goed)}' +
      '.zs-letter{font-size:.85rem;color:var(--muted)}' +
      '.zs-goed{min-height:40px;padding:0 12px;border-radius:10px;border:1.5px solid var(--rand2);background:var(--kaart);color:var(--ink);font-size:.82rem;font-weight:600}' +
      '.zs-opt.goed .zs-goed{background:#2f8a5f;border-color:#2f8a5f;color:#fff}' +
      '.zs-optweg{border:0;background:none;color:var(--muted);width:40px;height:40px;border-radius:10px;font-size:1.3rem;padding:0}' +
      '.zs-optweg:hover:not(:disabled){color:var(--fout);background:var(--kaart2)}.zs-optweg:disabled{opacity:.3;cursor:default}' +
      '.zs-opt.nieuw{border-style:dashed;background:var(--room)}' +
      '.zs-plaat{position:relative;min-height:84px;border:1.5px dashed var(--rand2);border-radius:12px;background:var(--room);display:grid;place-items:center;text-align:center;padding:12px;font-weight:500;color:var(--muted);cursor:pointer}' +
      '.zs-plaat:focus-within{outline:3px solid var(--focusring,#B4701A);outline-offset:2px}' +
      '.zs-plaat.sleep{border-color:var(--ocean);background:var(--kies);color:var(--ink)}' +
      '.zs-heeft{display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
      '.zs-heeft img{max-width:120px;max-height:84px;border-radius:8px;border:1px solid var(--rand);background:#fff}' +
      '.zs-plaatknoppen{display:flex;gap:6px;flex-wrap:wrap}.zs-plaatknoppen .knop{padding:0 12px;min-height:40px;font-size:.84rem;border-radius:10px;box-shadow:none;display:inline-flex;align-items:center}' +
      '.zs-kiesknop{position:relative;cursor:pointer}.zs-kiesknop:focus-within{outline:3px solid var(--focusring,#B4701A);outline-offset:2px}' +
      '.zs-melding{margin:0;font-size:.9rem}.zs-melding:empty{display:none}.zs-melding.fout{color:var(--fout);font-weight:600}' +
      '.zs-voorkop{margin:0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:600}' +
      '.blad.zs-blad{padding:14px 18px;border-radius:6px;box-shadow:0 8px 24px rgba(20,34,76,.12);max-width:none;margin:0}' +
      '.blad.zs-blad > ol{margin:0}.blad.zs-blad > ol > li{border-bottom:0}' +
      '.zs-antw{background:#fff;color:#14224C;border-radius:6px;padding:12px 16px;font-size:.86rem;line-height:1.5;overflow-wrap:anywhere}' +
      '.zs-antw b{color:#1f6b41;font-weight:600}' +
      '.zs-knoppen{margin-top:auto;display:flex;gap:8px;flex-wrap:wrap}.zs-knoppen .knop{box-shadow:none;padding:0 14px}.zs-knoppen #zsZet{flex:1 1 auto}';
    document.head.appendChild(s);
  }

  /* ---------- starten ---------- */
  function start(api){
    A = api;
    stijl();
    document.body.insertAdjacentHTML('beforeend',
      '<p class="wb-sr" id="samenStatus" role="status" aria-live="polite"></p>' +
      '<dialog class="wb-vraag" id="samenVraag" aria-labelledby="svKop" aria-describedby="svTekst"><h2 id="svKop"></h2><p id="svTekst"></p>' +
        '<div class="rij"><button type="button" class="knop stil" id="svNee"></button><button type="button" class="knop" id="svJa"></button></div></dialog>');
    $('svJa').addEventListener('click', function(){ antwoord(true); });
    $('svNee').addEventListener('click', function(){ antwoord(false); });
    $('samenVraag').addEventListener('cancel', function(e){ e.preventDefault(); antwoord(false); });
    $('standSeg').addEventListener('click', function(e){ var b = e.target.closest('[data-s]'); if (b) zetModus(b.getAttribute('data-s')); });
    $('samenKaart').addEventListener('click', function(e){
      if (e.target.id === 'samenBewaar') bewaarMateriaal();
      if (e.target.id === 'samenOpnieuw') vraag({ kop:'Opnieuw beginnen?', tekst:'Je eigen vragen en je wijzigingen gaan weg. Het blad wordt weer zoals de pagina het maakte.',
        ja:'Begin opnieuw', nee:'Annuleren',
        doeJa:function(){ var b = bron; wis(); bewaarMelding = { tekst:'', soort:'', html:'' }; if (b) blad(b); var f = $('standSeg').querySelector('[aria-pressed="true"]'); if (f) f.focus(); meld('Het blad staat weer zoals de pagina het maakte.'); },
        doeNee:function(){} });
    });
    var bl = $('bladen');
    bl.addEventListener('click', function(e){
      if (modus !== 'samen' || !model) return;
      var d = e.target.closest('[data-doe]');
      if (d && bl.contains(d)){
        var li = d.closest('li[data-i]'), i = li ? Number(li.getAttribute('data-i')) : -1, doe = d.getAttribute('data-doe');
        if (d.getAttribute('aria-disabled') === 'true'){ meld(d.getAttribute('title') || ''); return; }
        if (doe === 'eind') return voegToe(model.items.length - 1, d);
        if (doe === 'erbij') return voegToe(i, d);
        if (doe === 'op') return verplaats(i, -1);
        if (doe === 'neer') return verplaats(i, 1);
        if (doe === 'weg') return weg(i);
        if (doe === 'vervang') return vervang(i, d);
        if (doe === 'bewerk') return bewerk(i, d);
        return;
      }
      var item = e.target.closest('.wb-voor > ol > li[data-i]');
      if (item && !e.target.closest('a,button,input,label,select,textarea')) kies(Number(item.getAttribute('data-i')));
      /* naast de opgaven op het blad klikken: niets meer gekozen */
      else if (!item && actief >= 0 && e.target.closest('.wb-voor')){ actief = -1; teken(); }
    });
    bl.addEventListener('keydown', function(e){
      if (modus !== 'samen' || !model) return;
      var li = e.target;
      if (!li.matches || !li.matches('.wb-voor > ol > li[data-i]')) return;
      var i = Number(li.getAttribute('data-i'));
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); kies(i); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); focusOp(Math.max(0, Math.min(model.items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))); }
      else if (e.key === 'Escape' && actief >= 0){ e.preventDefault(); actief = -1; teken(); focusOp(i); }
    });
  }

  return { start:start, blad:blad, geenBlad:geenBlad, aangepast:aangepast, vraagWeg:vraagWeg };
})();
