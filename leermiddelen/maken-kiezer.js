/* Vragen uit de site: in maken.html kies je vragen uit de oefenstof die al op
   de site staat, in plaats van alles zelf te typen. De bron is de vragenbank
   van de spellen: bank-<vak>.js, met de opgaven van de vakspellen erbij
   (bank-spellen.js). Een bank komt pas binnen als je het vak kiest; zo blijft
   maken.html licht.

   Rekenen heeft geen vaste lijst: die sommen maakt de computer elke keer nieuw.
   Daarom halen we rekenen (en Nederlands nog een keer) uit de leerroute
   (leerroute.js en leerroute/<vak>-*.js): elk doel maakt een paar sommen, met
   het eindantwoord en de stappen als uitleg. Ze komen als open vraag in de
   toets, of als meerkeuze als het doel zelf keuzes geeft. Een som die alleen
   met het plaatje te begrijpen is (een klok, een grafiek), laten we weg.

   Wat eruit komt is een gewone vraag in de vorm van maken.html: meerkeuze met
   het goede antwoord, de foute antwoorden door elkaar en de uitleg van de bank.
   Staat de vraag in open/<vak>.json, dan kan hij ook als open vraag, met alle
   antwoorden die daar goed rekenen. Een vlag of een getekende figuur gaat mee
   als plaatje, want zonder plaatje is "Van welk land is deze vlag?" geen vraag.

     KIEZER.open({ knop, vak, al, plaatjesVrij, ruimte, klaar })
       knop            krijgt de focus terug als de kiezer dichtgaat
       vak             het vak van de toets (mag leeg)
       al()            sleutels van de vragen die al in de toets staan (KIEZER.sleutel)
       plaatjesVrij()  hoeveel plaatjes er nog bij mogen
       ruimte()        hoeveel vragen er nog bij mogen
       klaar(items, info)  de nieuwe vragen, in het formaat van maken.html
     KIEZER.sleutel(vraag, goed)  waaraan een vraag herkend wordt

   Werkblad maken (werkblad-samen.js) gebruikt hetzelfde venster als "Vraag
   toevoegen", met blad: true bij de eerste keer openen. Dan zijn er drie tabs
   (Uit het boek, Uit de vragenbank, Zelf schrijven), gelden de grenzen van een
   toets niet (200 vragen, 12 plaatjes, een figuur die niet als plaatje kan) en
   krijgt klaar() de vragen zoals ze op het blad komen:
       { bron:'bank', vorm, vraag, goed, fout, antwoorden, uitleg, beeld, vak, t }
       { bron:'boek', o, pvak, par, toets }   o is de opgave zelf, met de figuur
     extra bij blad: plek (tekst achter de kop, "na opgave 2"), tab ('boek',
     'bank' of 'zelf'), tabs (welke er zijn), titel, zelf: { bouw(el), toon() }
     KIEZER.boekToets(o, vak, par)  een opgave uit het boek als toetsvraag (of met reden waarom niet)
     KIEZER.alsBlad(x, open), KIEZER.bankLijst(vak)  de vragenbank, voor Vervangen
     KIEZER.plaatje(beeld), KIEZER.sluit()   */
window.KIEZER = (function(){
  'use strict';
  /* het venster voor een werkblad of voor een toets: dat ligt vast bij de eerste keer openen */
  var BLAD = false;
  function waar(){ return BLAD ? 'op het blad' : 'in je toets'; }
  /* zo lang als de server bewaart (server/materiaal.js); langer kan niet mee */
  var MAX = { vraag:300, goed:150, uitleg:300, open:100, fout:5, antwoorden:8 };
  var PER_KEER = 60;          /* zoveel regels tegelijk in de lijst; daarna "Laat meer zien" */
  var STRENG = { ned:1, eng:1 };
  function $(id){ return document.getElementById(id); }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* hetzelfde kenmerk als typen.js en WAAROM in bank.js: vraag | goed antwoord */
  function hash(t){ var h = 5381; t = String(t || ''); for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

  /* Kale tekst: geen opmaak en geen **sterretjes**, entiteiten worden tekens.
     Alleen echte tags gaan eruit; "2x + 3 > 11" en "x < 4" blijven staan. */
  var TAG = /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?\/?>/gi, lezer = null;
  function kaal(t){
    var s = String(t == null ? '' : t).replace(/<br\s*\/?>/gi, ' ').replace(TAG, '').replace(/\*\*/g, '');
    if (/&(#\d+|#x[0-9a-f]+|[a-z]+);/i.test(s)){ lezer = lezer || document.createElement('textarea'); lezer.innerHTML = s; s = lezer.value; }
    return s.replace(/\s+/g, ' ').trim();
  }
  function sleutel(vraag, goed){ return (String(vraag || '') + '|' + String(goed || '')).toLowerCase().replace(/\s+/g, ' ').trim(); }
  /* een uitleg die te lang is, stopt na de laatste hele zin die past */
  function kortUitleg(u){
    if (u.length <= MAX.uitleg) return u;
    var stuk = u.slice(0, MAX.uitleg), eind = Math.max(stuk.lastIndexOf('. '), stuk.lastIndexOf('! '), stuk.lastIndexOf('? '));
    return eind > 40 ? stuk.slice(0, eind + 1) : stuk.slice(0, stuk.lastIndexOf(' ')) + '…';
  }
  /* een kaal woord (huis, moreover): zeg erbij welke kant je op vertaalt, net als het werkblad */
  function vraagTekst(vak, q){
    var v = kaal(q.v);
    if (vak === 'eng' && !/[?:_…]/.test(v) && v.replace(/\([^)]*\)/g, '').trim().split(' ').length <= 4 && !/\d/.test(v))
      v = (q.t === 'woordjes NL naar EN' ? 'Vertaal naar het Engels: ' : 'Vertaal naar het Nederlands: ') + v;
    return v;
  }
  /* Een getekende figuur gaat als plaatje mee. Dat kan alleen als hij op zichzelf
     klopt: geen kleuren uit de stylesheet van de site en niets van buiten. */
  function svgKan(s){ return /^\s*<svg[\s>]/i.test(s) && !/var\(|<image|<foreignObject|href=|url\((?!#)|<script/i.test(s); }

  /* ---------- de vragen van een vak, klaar om te kiezen ---------- */
  var KLAAR = {}, OPEN = {};
  function bereid(vak){
    if (KLAAR[vak]) return KLAAR[vak];
    var bron = (window.BRONNEN && BRONNEN[vak]) || [], nivo = (window.NIVOS && NIVOS[vak]) || [];
    var uit = [], gezien = {}, weg = 0;
    bron.forEach(function(q, i){
      if (!q || !Array.isArray(q.o) || q.g == null || q.o[q.g] == null){ weg++; return; }
      var goed = kaal(q.o[q.g]), fout = [];
      q.o.forEach(function(o, k){
        var f = kaal(o);
        if (k !== q.g && f && f.toLowerCase() !== goed.toLowerCase() && fout.indexOf(f) < 0) fout.push(f);
      });
      var beeld = q.vlag ? (/^[a-z-]{2,8}$/.test(q.vlag) ? { vlag: q.vlag } : null) : q.svg ? (svgKan(q.svg) ? { svg: String(q.svg) } : null) : '';
      var v = vraagTekst(vak, q);
      if (beeld === null || !v || !goed || !fout.length || v.length > MAX.vraag || goed.length > MAX.goed || fout.some(function(f){ return f.length > MAX.goed; })){ weg++; return; }
      /* dubbel in de bank: dezelfde vraag met hetzelfde antwoord en plaatje telt een keer */
      var sl = sleutel(v, goed) + '|' + (q.vlag || '') + '|' + (q.svg ? hash(q.svg) : '');
      if (gezien[sl]) return;
      gezien[sl] = true;
      uit.push({ id: vak + ':' + i, vak: vak, v: v, goed: goed, fout: fout.slice(0, MAX.fout), uitleg: kortUitleg(kaal(q.u)),
                 t: String(q.t || ''), n: Number(nivo[i]) || 0, beeld: beeld, h: hash(q.v + '|' + q.o[q.g]) });
    });
    return (KLAAR[vak] = { lijst: uit, weg: weg });
  }
  /* de open versies (dezelfde lijst als de spellen gebruiken bij zelf typen) */
  function laadOpen(vak){
    if (OPEN[vak]) return Promise.resolve();
    return fetch('open/' + vak + '.json').then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ OPEN[vak] = j && typeof j === 'object' ? j : {}; }, function(){ OPEN[vak] = {}; });
  }
  function openVan(x){ var o = OPEN[x.vak] && OPEN[x.vak][x.h]; return o && Array.isArray(o.a) ? o : null; }
  /* Alle antwoorden die goed rekenen. oefen.html kijkt hoofdletters en spaties
     niet na, maar wel elk woord; buiten de taalvakken mag de, het of een weg.
     Is de vraag open anders gesteld ("Wat doen de kransslagaders?" wordt
     "Welke bloedvaten..."), dan past het goede antwoord van de meerkeuzevraag
     niet meer: dan tellen alleen de antwoorden van de open versie. */
  function openAntwoorden(x){
    var o = openVan(x); if (!o) return [];
    var uit = [], klein = {};
    function erbij(a){ a = kaal(a); var k = a.toLowerCase(); if (a && a.length <= MAX.open && !klein[k]){ klein[k] = true; uit.push(a); } }
    (o.v ? [] : [x.goed]).concat(o.a).forEach(function(a){
      erbij(a);
      if (!STRENG[x.vak]) erbij(kaal(a).replace(/^(de|het|een) /i, ''));
    });
    return uit.slice(0, MAX.antwoorden);
  }
  function openVraag(x){ var o = openVan(x); return o && o.v ? kaal(o.v) : x.v; }

  /* ---------- de leerroute: rekenen en Nederlands ---------- */
  var LR_VAKKEN = [{ id:'lr-rekenen', vak:'rekenen', naam:'Rekenen (leerroute)' }, { id:'lr-nederlands', vak:'nederlands', naam:'Nederlands (leerroute)' }];
  var LR_LADEN = null, LR_GROEP = {};
  var LR_BEELD = /\b(hieronder|plaatje|afbeelding|grafiek|diagram|klok|figuur|tekening|rooster|getallenlijn|strook|tabel|de lijn|het rad|de zak|bouwsel|uitslag)\b/i;
  function laadScript(src){ return new Promise(function(klaar){ var e = document.createElement('script'); e.src = src; e.onload = e.onerror = function(){ klaar(); }; document.head.appendChild(e); }); }
  function laadLeerroute(){
    if (LR_LADEN) return LR_LADEN;
    LR_LADEN = (window.LEERROUTE ? Promise.resolve() : laadScript('leerroute.js')).then(function(){
      if (!window.LEERROUTE) throw new Error('geen leerroute');
      var lijst = [].concat(LEERROUTE.BESTANDEN.rekenen, LEERROUTE.BESTANDEN.nederlands);
      return lijst.reduce(function(p, b){ return p.then(function(){ return laadScript('leerroute/' + b + '.js'); }); }, Promise.resolve());
    });
    return LR_LADEN;
  }
  /* een antwoord ook zoals een leerling het typt: 1,5 en 1.5, zonder euroteken */
  function lrVarianten(a){
    var uit = [];
    [].concat(a).forEach(function(x){
      x = kaal(x); if (!x) return;
      [x, x.replace(/^€\s*/, ''), x.replace(/\u2212/g, '-'), /^-?[\d.]+,\d+$/.test(x.replace(/^€\s*/, '')) ? x.replace(/^€\s*/, '').replace(/\./g, '').replace(',', '.') : '']
        .forEach(function(y){ if (y && uit.indexOf(y) < 0) uit.push(y); });
    });
    return uit.slice(0, MAX.antwoorden);
  }
  function bereidLeerroute(id){
    if (KLAAR[id]) return KLAAR[id];
    var lv = LR_VAKKEN.filter(function(x){ return x.id === id; })[0], uit = [], weg = 0, R = LEERROUTE.R, NIV = { basis:1, '1F':1, '2F':2, '3F':3 };
    LEERROUTE._doelen().filter(function(d){ return d.vak === lv.vak && !d.mix; }).forEach(function(d){
      var gezien = {};
      LR_GROEP[d.groep.id] = d.groep;
      for (var p = 0; p < 12 && Object.keys(gezien).length < 6; p++){
        var o; try { o = d.maak(R); } catch (e){ weg++; continue; }
        var v = kaal((o.context ? o.context + ' ' : '') + (o.vraagHtml || o.vraag));
        if (gezien[v]) continue;
        gezien[v] = 1;
        var st = o.stappen || [], laatste = st[st.length - 1] || {};
        var goed = o.opties ? o.opties[o.goed] : o.antwoord != null ? [].concat(o.antwoord)[0] : laatste.opties ? laatste.opties[laatste.goed] : laatste.antwoord != null ? [].concat(laatste.antwoord)[0] : '';
        goed = kaal(goed);
        var opties = o.opties || (o.antwoord == null && laatste.opties ? laatste.opties : null);
        var uitleg = st.map(function(x){ var a = x.opties ? x.opties[x.goed] : x.info ? '' : [].concat(x.antwoord)[0]; var t = kaal(x.tekst); a = a != null ? kaal(a) : ''; return a && t.indexOf('…') >= 0 ? t.replace('…', a) : t + (a ? ' ' + a : ''); }).join('; ');
        if (!v || !goed || v.length > MAX.vraag || goed.length > MAX.goed || LR_BEELD.test(v) || o.zelfBeeld || (o.controle && !opties)){ weg++; continue; }
        var x = { id:id + ':' + d.id + ':' + p, vak:id, lr:true, v:v, goed:goed, uitleg:kortUitleg('Zo: ' + uitleg.replace(/[.!?]$/, '') + '.'), t:d.groep.id, n:0, niv:NIV[d.groep.niveau] || 0, beeld:'', doel:d.naam, h:'' };
        if (opties){ x.fout = opties.map(kaal).filter(function(y){ return y && y.toLowerCase() !== goed.toLowerCase(); }).slice(0, MAX.fout); if (!x.fout.length){ weg++; continue; } }
        else { x.fout = []; x.antwoorden = lrVarianten(o.antwoord != null ? o.antwoord : laatste.antwoord); if (!x.antwoorden.length) x.antwoorden = [goed]; }
        uit.push(x);
      }
    });
    return (KLAAR[id] = { lijst: uit, weg: weg });
  }

  /* het onderdeel van een vraag, met de naam uit bank.js */
  function deelNaam(vak, t){ if (/^lr-/.test(vak)) return LR_GROEP[t] ? LR_GROEP[t].naam : t; var o = ((window.ONDERDELEN && ONDERDELEN[vak]) || []).filter(function(x){ return x.id === t; })[0]; return o ? o.naam : t; }
  var NIVONAAM = { 1:'vmbo-bb', 2:'vmbo-kgt en tl', 3:'havo', 4:'vwo' };

  /* ---------- het venster ---------- */
  var opt = null, gekozen = {}, volgorde = [], toon = PER_KEER, alleenGekozen = false, bezig = false;
  function bouw(){
    if ($('kiezer')) return;
    var vakken = (window.VAKKEN || []).filter(function(v){ return window.BANK && BANK.vakken.indexOf(v.id) >= 0 && v.id !== 'eigen'; });
    var niv = (window.NIVEAUS || []).map(function(n){ return '<option value="' + n.rang + '">' + schoon(n.naam) + '</option>'; }).join('');
    if (BLAD) basisStijl();
    var tabBank = '<button type="button" role="tab" id="kzTabBank" aria-selected="true" aria-controls="kzMidden">' + (BLAD ? 'Uit de vragenbank' : 'Vragenbank') + '</button>';
    var tabBoek = '<button type="button" role="tab" id="kzTabBoek" aria-selected="false" aria-controls="kzBoek" tabindex="-1">' + (BLAD ? 'Uit het boek' : 'Opdrachtenboek') + '</button>';
    document.body.insertAdjacentHTML('beforeend',
      '<dialog class="kiezer' + (BLAD ? ' kzblad' : '') + '" id="kiezer" aria-labelledby="kzKop" aria-describedby="kzUitleg">' +
        '<div class="kzkop">' + (BLAD ? '<h2 id="kzKop"><span id="kzTitel">Vraag toevoegen</span> <span class="kzplek" id="kzPlek"></span></h2>' : '<h2 id="kzKop">Vragen uit de site</h2>') +
          '<div class="kztabs" role="tablist" aria-label="' + (BLAD ? 'Waar komt de vraag vandaan' : 'Bron') + '">' + (BLAD ? tabBoek + tabBank + '<button type="button" role="tab" id="kzTabZelf" aria-selected="false" aria-controls="kzZelf" tabindex="-1">Zelf schrijven</button>' : tabBank + tabBoek) + '</div>' +
          '<button class="kzsluit" type="button" id="kzSluit" aria-label="Sluiten zonder ' + (BLAD ? 'iets op het blad te zetten' : 'vragen toe te voegen') + '">&times;</button></div>' +
        '<div class="kzmidden" id="kzMidden">' +
          '<p class="tip" id="kzUitleg">' + (BLAD ? 'Kies uit de oefenstof van de spellen op deze site. De vragen komen op het blad, met het antwoord en de uitleg op het antwoordblad. Rekenen komt uit de leerroute: daar maakt elk doel nieuwe sommen.'
            : 'Kies uit de oefenstof van de spellen op deze site. De vragen komen als gewone vragen in je toets, met de uitleg erbij, en je kunt ze daarna nog aanpassen. Rekenen komt uit de leerroute: daar maakt elk doel nieuwe sommen, met de uitwerking als uitleg.') + '</p>' +
          '<div class="kzfilters">' +
            '<label class="veldnaam">Vak<select class="veld" id="kzVak"><option value="">kies een vak</option>' + vakken.map(function(v){ return '<option value="' + v.id + '">' + schoon(v.naam) + '</option>'; }).join('') + LR_VAKKEN.map(function(v){ return '<option value="' + v.id + '">' + schoon(v.naam) + '</option>'; }).join('') + '</select></label>' +
            '<label class="veldnaam">Niveau<select class="veld" id="kzNiveau"><option value="">alle niveaus</option>' + niv + '</select></label>' +
            '<label class="veldnaam kzdeel">Onderwerp<select class="veld" id="kzDeel" disabled><option value="">kies eerst een vak</option></select></label>' +
            '<label class="veldnaam kzbreed">Zoeken<input class="veld" type="search" id="kzZoek" placeholder="zoek in vragen en antwoorden" autocomplete="off"></label>' +
          '</div>' +
          '<label class="vink hide" id="kzOpenRij"><input type="checkbox" id="kzOpen"> <span>Als open vraag waar dat kan: leerlingen typen het antwoord zelf</span></label>' +
          '<div class="kzbalk"><p class="kzaantal" id="kzAantal" aria-live="polite"></p>' +
            '<div class="rij"><button class="knop stil klein" type="button" id="kzWillekeurig" disabled>Willekeurig 10</button>' +
            '<button class="knop stil klein" type="button" id="kzAlleen" aria-pressed="false" disabled>Alleen gekozen</button></div></div>' +
          '<div class="kzlijst" id="kzLijst"></div>' +
        '</div>' +
        '<div class="kzvoet"><p class="melding" id="kzMelding" role="status" aria-live="polite"></p>' +
          '<div class="rij"><button class="knop" type="button" id="kzZet" disabled>Zet ' + (BLAD ? 'op het blad' : 'in de toets') + '</button>' +
          '<button class="knop stil" type="button" id="kzAnnuleer">Annuleren</button></div></div>' +
        boekHtml() +
        (BLAD ? '<div class="kzzelf" id="kzZelf" role="tabpanel" aria-labelledby="kzTabZelf"></div>' : '') +
      '</dialog>');
    boekKoppel();
    if (BLAD && opt.zelf && opt.zelf.bouw) opt.zelf.bouw($('kzZelf'));
    var d = $('kiezer');
    $('kzSluit').addEventListener('click', sluit);
    $('kzAnnuleer').addEventListener('click', sluit);
    /* Esc: dicht, maar via sluit(), dan komt de focus terug op de knop */
    d.addEventListener('cancel', function(e){ e.preventDefault(); if (!bezig) sluit(); });
    $('kzVak').addEventListener('change', function(){ kiesVak(this.value); });
    $('kzDeel').addEventListener('change', function(){ toon = PER_KEER; teken(); });
    $('kzNiveau').addEventListener('change', function(){ toon = PER_KEER; teken(); });
    var wacht = null;
    $('kzZoek').addEventListener('input', function(){ clearTimeout(wacht); wacht = setTimeout(function(){ toon = PER_KEER; teken(); }, 160); });
    $('kzOpen').addEventListener('change', function(){ teken(); });
    $('kzWillekeurig').addEventListener('click', willekeurig);
    $('kzAlleen').addEventListener('click', function(){ zetAlleen(!alleenGekozen); teken(); });
    $('kzZet').addEventListener('click', zet);
    $('kzLijst').addEventListener('change', function(e){
      var c = e.target; if (!c.matches || !c.matches('input[type=checkbox][data-id]')) return;
      var id = c.getAttribute('data-id');
      if (c.checked){
        var p = past([id]);
        if (p){ c.checked = false; melding(p, 'fout'); return; }
        kies(id);
      } else ontkies(id);
      c.closest('.kzvraag').classList.toggle('aan', c.checked);
      melding(''); stand();
    });
    $('kzLijst').addEventListener('click', function(e){
      if (e.target.id !== 'kzMeer') return;
      var eerste = $('kzLijst').querySelectorAll('.kzvraag').length;
      toon += PER_KEER; teken();
      /* de focus naar de eerste nieuwe vraag, anders begin je bovenaan opnieuw */
      var nieuw = $('kzLijst').querySelectorAll('.kzvraag input')[eerste]; if (nieuw) nieuw.focus();
    });
  }
  function melding(t, soort){ var m = $('kzMelding'); m.textContent = t || ''; m.className = 'melding' + (soort ? ' ' + soort : ''); }
  function zetAlleen(aan){ alleenGekozen = aan; $('kzAlleen').setAttribute('aria-pressed', aan ? 'true' : 'false'); $('kzAlleen').textContent = aan ? 'Alle vragen tonen' : 'Alleen gekozen'; toon = PER_KEER; }

  /* alle vragen die je kunt kiezen, op id; ook uit een vak dat je eerder koos */
  var OP_ID = {};
  function vanId(id){ return OP_ID[id]; }
  function kies(id){ if (!gekozen[id]){ gekozen[id] = true; volgorde.push(id); } }
  function ontkies(id){ delete gekozen[id]; volgorde = volgorde.filter(function(x){ return x !== id; }); }
  function aantalGekozen(){ return volgorde.length; }
  function plaatjesGekozen(lijst){ return lijst.filter(function(id){ return vanId(id) && vanId(id).beeld; }).length; }
  /* mag dit er nog bij? anders de reden */
  function past(nieuw){
    /* op een werkblad gelden de grenzen van een toets niet */
    if (BLAD) return '';
    var alles = volgorde.concat(nieuw);
    if (alles.length > opt.ruimte()) return 'Een toets heeft hoogstens 200 vragen; er kunnen er nog ' + opt.ruimte() + ' bij.';
    if (plaatjesGekozen(alles) > opt.plaatjesVrij()) return 'Een toets heeft hoogstens 12 plaatjes; er kunnen er nog ' + opt.plaatjesVrij() + ' bij. Kies een vraag zonder plaatje.';
    return '';
  }
  function alInToets(x){
    var al = opt.alSet;
    return !!(al[sleutel(x.v, x.goed)] || (openVan(x) && al[sleutel(openVraag(x), openAntwoorden(x)[0])]));
  }
  function stand(){
    var n = aantalGekozen();
    $('kzZet').disabled = !n || bezig;
    var plek = BLAD ? ' op het blad' : ' in de toets';
    $('kzZet').textContent = n ? 'Zet ' + (n === 1 ? 'de vraag' : 'de ' + n + ' vragen') + plek : 'Zet' + plek;
    $('kzAlleen').disabled = !n && !alleenGekozen;
    var s = $('kzAantal').getAttribute('data-zicht') || '';
    $('kzAantal').textContent = s + (n ? (s ? ' · ' : '') + n + ' gekozen' : '');
  }

  /* ---------- een vak kiezen: de bank komt nu pas binnen ---------- */
  var vakNu = '';
  function kiesVak(vak){
    vakNu = vak; toon = PER_KEER;
    var deel = $('kzDeel');
    deel.disabled = true; deel.innerHTML = '<option value="">' + (vak ? 'even laden…' : 'kies eerst een vak') + '</option>';
    $('kzOpenRij').classList.add('hide');
    $('kzWillekeurig').disabled = true;
    if (!vak){ $('kzLijst').innerHTML = '<p class="leeg">Kies een vak, dan zie je hier de vragen.</p>'; $('kzAantal').setAttribute('data-zicht', ''); stand(); return; }
    $('kzLijst').setAttribute('aria-busy', 'true');
    $('kzLijst').innerHTML = '<p class="leeg">Vragen ophalen…</p>';
    var lr = /^lr-/.test(vak);
    laadVak(vak).then(function(b){
      if (vakNu !== vak) return;
      if (lr) vulDelenLr(vak, b.lijst); else vulDelen(vak, b.lijst);
      $('kzOpenRij').classList.toggle('hide', !b.lijst.some(openVan));
      $('kzLijst').removeAttribute('aria-busy');
      teken();
    }).catch(function(){
      $('kzLijst').removeAttribute('aria-busy');
      $('kzLijst').innerHTML = '<p class="leeg">De vragen konden niet geladen worden. Controleer je internet en kies het vak opnieuw.</p>';
    });
  }
  /* de vragen van een vak, klaar om te kiezen (ook voor Vervangen op het werkblad) */
  function laadVak(vak){
    var lr = /^lr-/.test(vak);
    return (lr ? laadLeerroute() : Promise.all([BANK.zorg(vak), laadOpen(vak)])).then(function(){
      var b = lr ? bereidLeerroute(vak) : bereid(vak);
      b.lijst.forEach(function(x){ OP_ID[x.id] = x; });
      return b;
    });
  }
  /* De onderwerpen van het vak, onder dezelfde koppen als in de spellen.
     Een onderwerp zonder vragen die mee kunnen, staat er niet bij. */
  function vulDelen(vak, lijst){
    var tel = {}; lijst.forEach(function(x){ tel[x.t] = (tel[x.t] || 0) + 1; });
    var bekend = {}, groepen = [];
    (BANK.groepen(vak) || []).forEach(function(g){
      var o = g.onderdelen.filter(function(d){ bekend[d.id] = true; return tel[d.id]; });
      if (o.length) groepen.push({ naam: g.naam, delen: o.map(function(d){ return { id: d.id, naam: d.naam }; }) });
    });
    /* wat de vakspellen erbij zetten onder een eigen naam, komt onder "overig" */
    var los = Object.keys(tel).filter(function(t){ return !bekend[t]; }).sort();
    if (los.length) groepen.push({ naam: groepen.length ? 'overig' : '', delen: los.map(function(t){ return { id: t, naam: t || 'zonder onderwerp' }; }) });
    var h = '<option value="">alle onderwerpen (' + lijst.length + ')</option>';
    groepen.forEach(function(g){
      var opties = g.delen.map(function(d){ return '<option value="' + schoon(d.id) + '">' + schoon(d.naam) + ' (' + tel[d.id] + ')</option>'; }).join('');
      h += g.naam ? '<optgroup label="' + schoon(g.naam) + '">' + opties + '</optgroup>' : opties;
    });
    $('kzDeel').innerHTML = h; $('kzDeel').disabled = false;
  }
  function vulDelenLr(vak, lijst){
    var tel = {}, volg = []; lijst.forEach(function(x){ if (!tel[x.t]){ tel[x.t] = 0; volg.push(x.t); } tel[x.t]++; });
    var NIV = [['basis', 'Fundament'], ['1F', '1F'], ['2F', '2F'], ['3F', '3F']];
    var h = '<option value="">alle onderwerpen (' + lijst.length + ')</option>';
    NIV.forEach(function(n){
      var g = volg.filter(function(t){ return LR_GROEP[t] && LR_GROEP[t].niveau === n[0]; });
      if (g.length) h += '<optgroup label="' + n[1] + '">' + g.map(function(t){ return '<option value="' + schoon(t) + '">' + schoon(LR_GROEP[t].naam) + ' (' + tel[t] + ')</option>'; }).join('') + '</optgroup>';
    });
    $('kzDeel').innerHTML = h; $('kzDeel').disabled = false;
  }
  /* niveau: wat bij dat niveau past, zoals in het werkblad; vanaf een niveau lager */
  function filter(){
    var b = KLAAR[vakNu]; if (!b) return [];
    var deel = $('kzDeel').value, r = Number($('kzNiveau').value) || 0, onder = r >= 4 ? r - 2 : r - 1;
    var zoek = $('kzZoek').value.trim().toLowerCase();
    return b.lijst.filter(function(x){
      if (deel && x.t !== deel) return false;
      if (r && x.n && (x.n > r || x.n < onder)) return false;
      if (zoek && (x.v + ' ' + x.goed + ' ' + x.fout.join(' ')).toLowerCase().indexOf(zoek) < 0) return false;
      return true;
    });
  }
  function beeldHtml(x){
    if (!x.beeld) return '';
    if (x.beeld.vlag) return '<span class="kzbeeld"><img src="vlaggen/' + x.beeld.vlag + '.svg" alt="" loading="lazy"></span>';
    return '<span class="kzbeeld" aria-hidden="true">' + x.beeld.svg + '</span>';
  }
  function rijHtml(x){
    var al = alInToets(x), aan = !!gekozen[x.id], open = x.lr ? !!x.antwoorden : $('kzOpen').checked && openAntwoorden(x).length;
    var labels = [];
    if (x.n && NIVONAAM[x.n]) labels.push('vanaf ' + NIVONAAM[x.n]);
    if (vakNu && x.vak === vakNu && !$('kzDeel').value) labels.push(deelNaam(x.vak, x.t));
    if (x.lr) labels.push(x.doel);
    if (x.vak !== vakNu) labels.push(((window.VAKKEN || []).filter(function(v){ return v.id === x.vak; })[0] || {}).naam || x.vak);
    if (x.beeld) labels.push('met plaatje');
    if (open) labels.push('open vraag');
    if (al) labels.push('staat al ' + waar());
    return '<label class="kzvraag' + (aan ? ' aan' : '') + (al ? ' al' : '') + '"><input type="checkbox" data-id="' + schoon(x.id) + '"' + (aan ? ' checked' : '') + (al ? ' disabled' : '') + '>' +
      beeldHtml(x) +
      '<span class="kztekst"><span class="kzv">' + schoon(open && !x.lr ? openVraag(x) : x.v) + '</span>' +
      '<span class="kzgoed"><span class="kzgoedlabel">Goed:</span> ' + schoon(x.lr ? (x.antwoorden ? x.antwoorden.join(' / ') : x.goed) : open ? openAntwoorden(x).join(' / ') : x.goed) + '</span>' +
      (labels.length ? '<span class="kzlabels">' + labels.map(function(l){ return '<span>' + schoon(l) + '</span>'; }).join('') + '</span>' : '') +
      '</span></label>';
  }
  function teken(){
    if (!vakNu && !alleenGekozen){ stand(); return; }
    var lijst = alleenGekozen ? volgorde.map(vanId).filter(Boolean) : filter();
    var vrij = lijst.filter(function(x){ return !alInToets(x) && !gekozen[x.id]; }).length;
    $('kzWillekeurig').disabled = alleenGekozen || !vrij;
    var zicht = alleenGekozen ? '' : lijst.length + (lijst.length === 1 ? ' vraag' : ' vragen');
    $('kzAantal').setAttribute('data-zicht', zicht);
    var h = lijst.slice(0, toon).map(rijHtml).join('');
    if (lijst.length > toon) h += '<button class="knop stil klein kzmeer" type="button" id="kzMeer">Laat meer zien (nog ' + (lijst.length - toon) + ')</button>';
    if (!lijst.length) h = '<p class="leeg">' + (alleenGekozen ? 'Je hebt nog niets gekozen.' : 'Geen vragen bij deze keuze. Kies een ander onderwerp of niveau, of zoek op iets anders.') + '</p>';
    $('kzLijst').innerHTML = h;
    stand();
  }
  /* Willekeurig tien: om de beurt uit elk onderwerp, zodat een groot onderwerp
     de kleine niet wegdrukt. Plaatjes alleen zolang er plek voor is. */
  function willekeurig(){
    var pot = filter().filter(function(x){ return !alInToets(x) && !gekozen[x.id]; });
    var stapels = {}, n = 0, plek = opt.ruimte() - aantalGekozen(), afb = opt.plaatjesVrij() - plaatjesGekozen(volgorde);
    schud(pot).forEach(function(x){ (stapels[x.t] = stapels[x.t] || []).push(x); });
    var namen = schud(Object.keys(stapels));
    while (n < 10 && n < plek && namen.some(function(k){ return stapels[k].length; })){
      namen.forEach(function(k){
        if (n >= 10 || n >= plek) return;
        var x = stapels[k].pop(); if (!x) return;
        if (x.beeld){ if (afb <= 0) return; afb--; }
        kies(x.id); n++;
      });
    }
    if (!n){ melding(plek <= 0 ? 'Er kunnen geen vragen meer bij: een toets heeft hoogstens 200 vragen.' : 'Er zijn geen vragen meer over om te kiezen.', 'fout'); return; }
    zetAlleen(true); teken();
    melding(n + (n === 1 ? ' vraag' : ' vragen') + ' willekeurig gekozen. Hieronder zie je wat je nu gekozen hebt; haal weg wat je niet wilt.');
    var eerste = $('kzLijst').querySelector('input'); if (eerste) eerste.focus();
  }

  /* ---------- in de toets ---------- */
  /* een vlag of figuur als plaatje: via EIGEN.verklein, net als een eigen plaatje */
  function maatSvg(s){
    var kop = /<svg\b[^>]*>/i.exec(s); if (!kop) return s;
    var k = kop[0], nieuw = k, vb = /viewBox="([^"]+)"/i.exec(k);
    if (!/\sxmlns=/.test(k)) nieuw = nieuw.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    if (vb && !/\swidth=/.test(k)){
      var d = vb[1].trim().split(/[\s,]+/).map(Number);
      if (d[2] > 0 && d[3] > 0) nieuw = nieuw.replace(/<svg/i, '<svg width="600" height="' + Math.round(600 * d[3] / d[2]) + '"');
    }
    /* currentColor wordt de inktkleur van de site, ook in het donker op wit papier */
    nieuw = nieuw.replace(/<svg/i, '<svg color="#14224C"');
    return s.replace(k, nieuw);
  }
  function plaatje(beeld){
    var svg = beeld.vlag ? fetch('vlaggen/' + beeld.vlag + '.svg').then(function(r){ if (!r.ok) throw new Error('geen vlag'); return r.text(); }) : Promise.resolve(beeld.svg);
    return svg.then(function(s){ return EIGEN.verklein(new Blob([maatSvg(s)], { type: 'image/svg+xml' }), 900); });
  }
  function alsItem(x, open){
    if (x.lr) return Promise.resolve(x.antwoorden ? { vorm: 'open', vraag: x.v, antwoorden: x.antwoorden, uitleg: x.uitleg, punten: 1 } : { vorm: 'mk', vraag: x.v, goed: x.goed, fout: schud(x.fout), uitleg: x.uitleg, punten: 1 });
    var it = { vorm: 'mk', vraag: x.v, goed: x.goed, fout: schud(x.fout), uitleg: x.uitleg, punten: 1 };
    var ant = open ? openAntwoorden(x) : [];
    if (ant.length) it = { vorm: 'open', vraag: openVraag(x), antwoorden: ant, uitleg: x.uitleg, punten: 1 };
    if (!x.beeld) return Promise.resolve(it);
    return plaatje(x.beeld).then(function(data){ it.afbData = data; return it; }, function(){ return null; });
  }
  /* een vraag zoals hij op een werkblad komt: de tekst, de keuzes en het beeld zelf (geen plaatje) */
  function alsBlad(x, open){
    var b = { bron:'bank', vak:x.vak, t:x.t, uitleg:x.uitleg, beeld:x.beeld || '', vraag:x.v, goed:x.goed };
    if (x.lr) return Object.assign(b, x.antwoorden ? { vorm:'open', antwoorden:x.antwoorden } : { vorm:'mk', fout:schud(x.fout) });
    var ant = open ? openAntwoorden(x) : [];
    if (ant.length) return Object.assign(b, { vorm:'open', vraag:openVraag(x), goed:ant[0], antwoorden:ant });
    return Object.assign(b, { vorm:'mk', fout:schud(x.fout) });
  }
  function zet(){
    var ids = volgorde.slice(); if (!ids.length || bezig) return;
    var p = past([]); if (p){ melding(p, 'fout'); return; }
    var open = $('kzOpen').checked;
    if (BLAD){
      var lijst = ids.map(function(id){ return alsBlad(vanId(id), open); }), kb = opt;
      gekozen = {}; volgorde = []; zetAlleen(false);
      dicht();
      kb.klaar(lijst, { vakken:[] });
      return;
    }
    bezig = true; stand(); $('kzZet').setAttribute('aria-busy', 'true');
    melding(plaatjesGekozen(ids) ? 'De plaatjes klaarmaken…' : '');
    Promise.all(ids.map(function(id){ return alsItem(vanId(id), open); })).then(function(items){
      var mislukt = items.filter(function(x){ return !x; }).length;
      items = items.filter(Boolean);
      var vakken = {}; ids.forEach(function(id){ vakken[vanId(id).vak] = true; });
      bezig = false; $('kzZet').removeAttribute('aria-busy');
      var k = opt;
      gekozen = {}; volgorde = []; zetAlleen(false);
      dicht();
      k.klaar(items, { vakken: Object.keys(vakken), mislukt: mislukt });
    });
  }

  /* ---------- het opdrachtenboek: de tweede tab ----------
     Links de inhoud van het boek (opdrachtenboek.js), rechts opgaven die de
     leerroute nu maakt voor de gekozen paragraaf. Wat je aanvinkt wordt een
     gewone vraag: keuzes worden meerkeuze, een invulantwoord wordt een open
     vraag met de goede antwoorden. Een figuur gaat mee als plaatje: de svg
     krijgt zijn kleuren en stijl erin (OPDRACHTENBOEK.losseSvg) en wordt via
     EIGEN.verklein een jpeg, net als een eigen plaatje; een tabel wordt eerst
     een getekende tabel. Een figuur die niet mee kan terwijl de vraag hem
     nodig heeft, of een tekst die te lang is voor een vraag: die opgave staat
     er wel, maar kun je niet aanvinken, met de reden erbij. */
  var BOEKVAK = { reken:'rekenen', ned:'nederlands', wis:'wiskunde' }, TOETSVAK = { rekenen:'reken', nederlands:'ned', wiskunde:'wis' };
  var BOEK_PER = 6;
  var boekAan = false, bVak = '', bPar = '', bLijst = [], bGekozen = {}, bVolg = [], bTeller = 0, bBezig = false;
  var bLaden = null;
  function laadBoek(){
    if (window.OPDRACHTENBOEK) return Promise.resolve();
    if (bLaden) return bLaden;
    return (bLaden = laadScript('opdrachtenboek.js?v=1').then(function(){ if (!window.OPDRACHTENBOEK){ bLaden = null; throw new Error('geen boek'); } }));
  }
  function boekStijl(){
    if ($('kzBoekStijl')) return;
    var s = document.createElement('style'); s.id = 'kzBoekStijl';
    s.textContent =
      '.kztabs{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--kaart2);margin-right:auto;margin-left:14px}' +
      '.kzkop{flex-wrap:wrap}' +
      '.kztabs button{min-height:40px;padding:0 14px;border:0;border-radius:9px;background:transparent;font-size:.9rem;font-weight:500;color:var(--ink)}' +
      '.kztabs button[aria-selected="true"]{background:var(--kaart);box-shadow:0 1px 3px rgba(20,34,76,.15);font-weight:600}' +
      '.kiezer.kzboekaan{width:min(1180px,100% - 32px);height:min(880px,100% - 40px)}' +
      '.kiezer.kzboekaan .kzmidden,.kiezer.kzboekaan .kzvoet{display:none}' +
      '.kiezer:not(.kzboekaan) .kzboek{display:none}' +
      '.kzboek{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}' +
      '.kzb-midden{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(250px,320px) minmax(0,1fr)}' +
      '.kzb-nav{overflow:auto;overscroll-behavior:contain;border-right:1px solid var(--rand);padding:12px 14px 16px;display:grid;gap:6px;align-content:start}' +
      '.kzb-vakken{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--kaart2)}' +
      '.kzb-vakken button{flex:1 1 0;min-height:38px;border:0;border-radius:9px;background:transparent;font-size:.84rem;font-weight:500;color:var(--ink);padding:0 6px}' +
      '.kzb-vakken button[aria-pressed="true"]{background:var(--kaart);box-shadow:0 1px 3px rgba(20,34,76,.15);font-weight:600}' +
      '.kzb-zoek{display:flex;align-items:center;gap:8px;border:1.5px solid var(--rand2);border-radius:12px;padding:0 12px;min-height:44px;background:var(--kaart)}' +
      '.kzb-zoek:focus-within{border-color:var(--ocean)}' +
      '.kzb-zoek svg{width:16px;height:16px;fill:none;stroke:var(--muted);stroke-width:2;flex:none}' +
      '.kzb-zoek input{border:0;outline:0;background:none;flex:1;min-width:0;font-size:.92rem;min-height:40px;color:var(--ink)}' +
      '.kzb-kop{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600;margin:12px 0 2px}' +
      '.kzb-par{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:4px 10px;border-radius:10px;border:0;background:none;text-align:left;font-size:.88rem;line-height:1.3;color:var(--ink)}' +
      '.kzb-par:hover{background:var(--kaart2)}' +
      '.kzb-par[aria-current="true"]{background:var(--kies);box-shadow:inset 0 0 0 1.5px var(--ocean);font-weight:600}' +
      '.kzb-par small,.kzb-soort{margin-left:auto;font-size:.7rem;font-weight:600;border-radius:6px;padding:2px 6px;white-space:nowrap}' +
      '.kzb-par small{color:var(--muted);background:var(--kaart2)}' +
      '.kzb-par .kzb-tel{display:inline-grid;place-items:center;min-width:20px;height:20px;border-radius:999px;background:var(--ocean);color:#fff;font-size:.7rem;font-weight:600;margin-left:4px}' +
      '.kzb-rechts{overflow:auto;overscroll-behavior:contain;padding:14px 20px 18px;display:grid;gap:10px;align-content:start}' +
      '.kzb-rechtskop{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}' +
      '.kzb-rechtskop h3{font-size:1.05rem;margin:0}' +
      '.kzb-rechtskop .tip{font-size:.85rem}' +
      '.kzb-rechtskop .knop{margin-left:auto}' +
      '.kzb-vr{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:12px;align-items:start;padding:12px 14px;border-radius:14px;border:1.5px solid var(--rand2);background:var(--kaart);cursor:pointer}' +
      '.kzb-vr:hover{border-color:var(--ocean)}' +
      '.kzb-vr.aan{border-color:var(--ocean);background:var(--kies)}' +
      '.kzb-vr.kan-niet{opacity:.65;cursor:default}' +
      '.kzb-vr.kan-niet:hover{border-color:var(--rand2)}' +
      '.kzb-vr input{width:18px;height:18px;margin:3px 0 0;accent-color:var(--ocean)}' +
      '.kzb-vr input:focus-visible{outline:3px solid var(--focusring);outline-offset:3px}' +
      '.kzb-vrt{display:grid;gap:3px;min-width:0}' +
      '.kzb-vrt b{font-weight:500;font-size:.95rem;line-height:1.4;overflow-wrap:anywhere}' +
      '.kzb-vrt span{font-size:.84rem;color:var(--muted);overflow-wrap:anywhere}' +
      '.kzb-vrt .kzb-goed{color:var(--goed)}' +
      '.kzb-vrt img{display:block;max-width:220px;max-height:120px;background:#fff;border:1px solid var(--rand);border-radius:8px;padding:4px;margin-top:4px}' +
      '.kzb-soort{color:var(--ocean);background:var(--kies)}' +
      '.kzb-vr.kan-niet .kzb-soort{color:var(--muted);background:var(--kaart2)}' +
      '.kzb-leeg{color:var(--muted);padding:12px 0}' +
      '.kzb-voet{border-top:1px solid var(--rand);padding:10px 20px calc(12px + env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;background:var(--kaart)}' +
      '.kzb-voet .melding{flex:1 1 100%;margin:0}.kzb-voet .melding:empty{display:none}' +
      '.kzb-voet .vink{min-height:40px;font-size:.88rem}' +
      '.kzb-voet .knop:last-child{margin-left:auto}' +
      /* smal: de inhoud bovenaan met een eigen schuifbalk, daaronder de opgaven */
      '@media(max-width:760px){.kzb-midden{display:flex;flex-direction:column;overflow:auto}.kzb-nav{flex:none;max-height:40svh;border-right:0;border-bottom:1px solid var(--rand)}.kzb-rechts{overflow:visible}.kztabs{margin-left:0;order:3;flex:1 1 100%}}' +
      '@media(max-width:560px){.kiezer.kzboekaan{width:100%;height:100%;max-height:none;margin:0}}';
    document.head.appendChild(s);
  }
  var ZOEKIKOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  function boekHtml(){
    return '<div class="kzboek" id="kzBoek" role="tabpanel" aria-labelledby="kzTabBoek">' +
      '<div class="kzb-midden">' +
        '<nav class="kzb-nav" aria-label="Inhoud van het boek">' +
          '<div class="kzb-vakken" role="group" aria-label="Vak van het boek">' + ['rekenen', 'nederlands', 'wiskunde'].map(function(v){ return '<button type="button" data-bvak="' + v + '" aria-pressed="false">' + { rekenen:'Rekenen', nederlands:'Nederlands', wiskunde:'Wiskunde' }[v] + '</button>'; }).join('') + '</div>' +
          '<label class="kzb-zoek">' + ZOEKIKOON + '<input type="search" id="kzbZoek" placeholder="Zoek een onderwerp" aria-label="Zoek een onderwerp in het boek" autocomplete="off"></label>' +
          '<div id="kzbBoom"><p class="kzb-leeg">Het boek laden…</p></div>' +
        '</nav>' +
        '<section class="kzb-rechts" id="kzbRechts" aria-label="Opgaven"></section>' +
      '</div>' +
      '<div class="kzb-voet"><p class="melding" id="kzbMelding" role="status" aria-live="polite"></p>' +
        '<span id="kzbTel" aria-live="polite"></span>' +
        /* op een werkblad volgt de uitleg de keuze van het blad */
        '<label class="vink' + (BLAD ? ' hide' : '') + '"><input type="checkbox" id="kzbUitleg" checked> Met uitleg na de vraag</label>' +
        '<button class="knop" type="button" id="kzbZet" disabled>Zet ' + (BLAD ? 'op het blad' : 'in de toets') + '</button></div>' +
    '</div>';
  }
  function boekKoppel(){
    boekStijl();
    $('kzTabBank').addEventListener('click', function(){ kiesTab('bank'); });
    $('kzTabBoek').addEventListener('click', function(){ kiesTab('boek'); });
    if ($('kzTabZelf')) $('kzTabZelf').addEventListener('click', function(){ kiesTab('zelf'); });
    /* pijltjes: naar de volgende tab die er is (bij aanpassen staat alleen Zelf schrijven er) */
    $('kiezer').querySelector('.kztabs').addEventListener('keydown', function(e){
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
      var lijst = [].filter.call(this.querySelectorAll('[role="tab"]'), function(t){ return !t.hidden; });
      var i = lijst.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault();
      var n = e.key === 'Home' ? 0 : e.key === 'End' ? lijst.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + lijst.length) % lijst.length;
      kiesTab(TABNAAM[lijst[n].id]); lijst[n].focus();
    });
    $('kzBoek').querySelector('.kzb-vakken').addEventListener('click', function(e){ var b = e.target.closest('[data-bvak]'); if (b && b.getAttribute('data-bvak') !== bVak) boekVak(b.getAttribute('data-bvak')); });
    var wacht = null;
    $('kzbZoek').addEventListener('input', function(){ clearTimeout(wacht); wacht = setTimeout(boekBoom, 140); });
    $('kzbBoom').addEventListener('click', function(e){
      var b = e.target.closest('[data-par]'); if (!b) return;
      boekPar(b.getAttribute('data-par'));
      /* op een smal scherm staan de opgaven onder de inhoud: daarheen */
      if (window.matchMedia && matchMedia('(max-width:760px)').matches) $('kzbRechts').scrollIntoView({ block:'start' });
    });
    $('kzbRechts').addEventListener('click', function(e){ if (e.target.closest('#kzbAnder')) boekMaak(true); });
    $('kzbRechts').addEventListener('change', function(e){
      var c = e.target; if (!c.matches || !c.matches('input[data-bid]')) return;
      var x = bLijst.filter(function(y){ return y.id === c.getAttribute('data-bid'); })[0]; if (!x) return;
      if (c.checked){
        var r = boekPast(x);
        if (r){ c.checked = false; boekMelding(r, 'fout'); return; }
        bGekozen[x.id] = x; bVolg.push(x.id);
      } else { delete bGekozen[x.id]; bVolg = bVolg.filter(function(id){ return id !== x.id; }); }
      c.closest('.kzb-vr').classList.toggle('aan', c.checked);
      boekMelding(''); boekStand(); boekTellers();
    });
    $('kzbZet').addEventListener('click', boekZet);
  }
  function boekMelding(t, soort){ var m = $('kzbMelding'); m.textContent = t || ''; m.className = 'melding' + (soort ? ' ' + soort : ''); }
  var TABNAAM = { kzTabBank:'bank', kzTabBoek:'boek', kzTabZelf:'zelf' }, tabNu = 'bank';
  function kiesTab(naam){
    tabNu = naam; boekAan = naam === 'boek';
    $('kiezer').classList.toggle('kzboekaan', naam === 'boek');
    $('kiezer').classList.toggle('kzzelfaan', naam === 'zelf');
    Object.keys(TABNAAM).forEach(function(id){ var t = $(id); if (!t) return; var aan = TABNAAM[id] === naam; t.setAttribute('aria-selected', String(aan)); t.tabIndex = aan ? 0 : -1; });
    if (naam === 'boek') boekOpen();
    if (naam === 'zelf' && opt.zelf && opt.zelf.toon) opt.zelf.toon();
  }
  /* de tab openen: het vak van de toets, of het vak dat je eerder koos */
  function boekOpen(){
    $('kiezer').classList.add('kzboekaan');
    var vak = bVak || BOEKVAK[opt && opt.vak] || 'rekenen';
    laadBoek().then(function(){ if (vak !== bVak || !$('kzbBoom').querySelector('[data-par]')) boekVak(vak); else boekStand(); },
      function(){ $('kzbBoom').innerHTML = '<p class="kzb-leeg">Het boek laden lukte niet. Controleer je internet en probeer het opnieuw.</p>'; });
  }
  function boekVak(vak){
    bVak = vak; bPar = '';
    [].forEach.call($('kzBoek').querySelectorAll('[data-bvak]'), function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-bvak') === vak)); });
    boekBoom();
    var eerste = OPDRACHTENBOEK.paragrafen(vak)[0];
    if (eerste) boekPar(eerste.p.id);
  }
  function plat(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  /* de inhoud: per hoofdstuk de paragrafen; met een zoekwoord alleen wat past */
  function boekBoom(){
    var B = OPDRACHTENBOEK, w = plat($('kzbZoek').value).trim().split(/\s+/).filter(Boolean), h = '', vorige = '';
    var tel = {}; bVolg.forEach(function(id){ var x = bGekozen[id]; if (x && x.vak === bVak) tel[x.par] = (tel[x.par] || 0) + 1; });
    B.paragrafen(bVak).forEach(function(x){
      if (w.length){
        var tekst = plat([x.thema.naam, x.hoofdstuk.naam, x.p.naam].concat(x.p.doelen.map(function(id){ var d = B.doel(id); return d ? d.naam : ''; })).join(' '));
        if (!w.every(function(z){ return tekst.indexOf(z) >= 0; })) return;
      }
      var kop = x.thema.naam + ' › ' + x.hoofdstuk.naam;
      if (kop !== vorige){ h += '<p class="kzb-kop">' + schoon(kop) + '</p>'; vorige = kop; }
      h += '<button type="button" class="kzb-par" data-par="' + schoon(x.p.id) + '"' + (x.p.id === bPar ? ' aria-current="true"' : '') + '><span>' + x.nummer + ' ' + schoon(x.p.naam) + '</span>' +
        (tel[x.p.id] ? '<span class="kzb-tel" aria-label="' + tel[x.p.id] + ' gekozen">' + tel[x.p.id] + '</span>' : '') + '<small>' + schoon(x.p.niveau) + '</small></button>';
    });
    $('kzbBoom').innerHTML = h || '<p class="kzb-leeg">Niets gevonden. Zoek op een ander woord.</p>';
  }
  function boekTellers(){
    var tel = {}; bVolg.forEach(function(id){ var x = bGekozen[id]; if (x && x.vak === bVak) tel[x.par] = (tel[x.par] || 0) + 1; });
    [].forEach.call($('kzbBoom').querySelectorAll('[data-par]'), function(b){
      var n = tel[b.getAttribute('data-par')] || 0, t = b.querySelector('.kzb-tel');
      if (!n && t) t.remove();
      else if (n){ if (!t){ t = document.createElement('span'); t.className = 'kzb-tel'; b.insertBefore(t, b.querySelector('small')); } t.textContent = n; t.setAttribute('aria-label', n + ' gekozen'); }
    });
  }
  function boekPar(id){
    bPar = id;
    [].forEach.call($('kzbBoom').querySelectorAll('[data-par]'), function(b){ if (b.getAttribute('data-par') === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    boekMaak(false);
  }
  /* de opgaven van de paragraaf; Andere opgaven houdt wat je al hebt aangevinkt */
  function boekMaak(ander){
    var vak = bVak, id = bPar, x = OPDRACHTENBOEK.paragraaf(vak, id); if (!x) return;
    var R = $('kzbRechts');
    R.setAttribute('aria-busy', 'true');
    R.innerHTML = kopHtml(x) + '<p class="kzb-leeg">Opgaven maken…</p>';
    /* loopt de leerroute van de vragenbank nog (Rekenen of Nederlands uit de leerroute), dan eerst die */
    (LR_LADEN || Promise.resolve()).then(function(){ return OPDRACHTENBOEK.laad(vak); }).then(function(){
      if (vak !== bVak || id !== bPar) return;
      var houd = bVolg.map(function(k){ return bGekozen[k]; }).filter(function(y){ return y.par === id && y.vak === vak; });
      var gezien = {}; houd.forEach(function(y){ gezien[y.sl] = true; });
      var nieuw = OPDRACHTENBOEK.opgaven(vak, id, BOEK_PER + houd.length + 2).map(function(o){ return alsToets(o, vak, id); })
        .filter(function(y){ if (gezien[y.sl]) return false; gezien[y.sl] = true; return true; }).slice(0, Math.max(BOEK_PER - (ander ? 0 : houd.length), 2));
      bLijst = houd.concat(nieuw);
      R.removeAttribute('aria-busy');
      R.innerHTML = kopHtml(x) + (bLijst.length ? bLijst.map(vrHtml).join('') : '<p class="kzb-leeg">Bij deze paragraaf lukte het niet om opgaven te maken. Kies een andere.</p>');
      boekStand();
    }, function(){
      R.removeAttribute('aria-busy');
      R.innerHTML = kopHtml(x) + '<p class="kzb-leeg">De opgaven konden niet geladen worden. Controleer je internet en kies de paragraaf opnieuw.</p>';
    });
  }
  function kopHtml(x){
    return '<div class="kzb-rechtskop"><h3>' + x.nummer + ' ' + schoon(x.p.naam) + '</h3><span class="tip">' + schoon(x.p.niveau) + ' · vink aan wat ' + waar() + ' moet</span>' +
      '<button class="knop stil klein" type="button" id="kzbAnder">Andere opgaven</button></div>';
  }

  /* een opgave uit het boek als vraag voor de toets */
  var MET_FIGUUR = /\b(figuur|tekening|plaatje|afbeelding|grafiek|diagram|klok|rooster|getallenlijn|strook|tabel|hieronder|deze driehoek|deze rechthoek|de lijn|bouwsel|uitslag|stip|hokje)\b/i;
  /* twee stukken tekst als zinnen achter elkaar: een punt ertussen, en dan een hoofdletter (na een dubbele punt niet) */
  function zinnen(a, b){
    if (!a) return b; if (!b) return a;
    if (/:$/.test(a)) return a + ' ' + b;
    /* alleen een gewoon woord krijgt een hoofdletter; een formule als x + 3 = 7 niet */
    return a + (/[.?!]$/.test(a) ? ' ' : '. ') + (/^[a-zà-ÿ]{3,}[\s:,]/.test(b) ? b.charAt(0).toUpperCase() + b.slice(1) : b);
  }
  function alsToets(o, vak, par){
    var B = OPDRACHTENBOEK, x = { id:'b' + (++bTeller), vak:vak, par:par, punten:1, svg:'', reden:'', o:o };
    if (o.soort === 'bank'){
      var q = o.q, goed = kaal(q.o[q.g]);
      x.vorm = 'mk'; x.vraag = kaal(q.v); x.goed = goed;
      x.fout = q.o.map(kaal).filter(function(f, i){ return i !== q.g && f && f.toLowerCase() !== goed.toLowerCase(); }).slice(0, MAX.fout);
      x.uitleg = kortUitleg(kaal(q.u)); x.sl = 'b|' + x.vraag + '|' + goed;
      x.info = (x.fout.length + 1) + ' keuzes · antwoord ' + goed;
      return check(x);
    }
    var op = o.op, kz = B.keuzes(op), b = B.beeld(op, 0);
    var ctx = kaal(op.context || ''), v = kaal(B.vraagHtml(op));
    var vraag = ctx && v.indexOf(ctx) < 0 ? zinnen(ctx, v) : v;
    if (kz && kz.uitStap) vraag = zinnen(vraag, kaal(kz.tekst));
    x.sl = String(op.vraag || '') + '|' + vraag + '|' + B.eind(op);
    var st = B.echteStappen(op);
    x.uitleg = kortUitleg('Zo: ' + st.map(function(s){ var t = kaal(s.tekst), a = kaal(B.stapAntwoord(s)); return a && t.indexOf('…') >= 0 ? t.replace('…', a) : t + (a ? ' ' + a : ''); }).join('; ').replace(/[.!?]$/, '') + '.');
    if (kz){
      x.vorm = 'mk'; x.goed = kaal(kz.opties[kz.goed]);
      x.fout = kz.opties.map(kaal).filter(function(f, i){ return i !== kz.goed && f && f.toLowerCase() !== x.goed.toLowerCase(); }).slice(0, MAX.fout);
      x.info = kz.opties.length + ' keuzes · antwoord ' + x.goed;
      if (!x.fout.length) x.reden = 'er is maar één keuze';
    } else {
      x.vorm = 'open';
      if (op.eenheid && vraag.indexOf(op.eenheid) < 0) vraag = zinnen(vraag, 'Geef het antwoord in ' + op.eenheid + '.');
      x.antwoorden = lrVarianten(B.goedeAntwoorden(op));
      x.goed = x.antwoorden[0] || '';
      x.punten = st.length >= 3 ? 2 : 1;
      x.info = 'antwoord ' + x.goed + (op.eenheid ? ' ' + op.eenheid : '');
      if (!x.antwoorden.length) x.reden = 'het antwoord kan de computer niet nakijken';
    }
    x.vraag = vraag;
    /* de figuur: een svg of tabel gaat als plaatje mee; een zin met de woorden apart staat al in de vraag */
    if (b && !/^\s*<p class="lr-zin"/.test(b)){
      x.fig = true;
      var svg = B.losseSvg(b);
      if (!svg){ var m = b.match(/<svg[\s\S]*?<\/svg>/g); if (m && m.length === 1) svg = B.losseSvg(m[0]); }
      if (svg) x.svg = svg;
      else if (MET_FIGUUR.test(vraag) || !kaal(B.vraagHtml(op)).replace(/[?.]/g, '').trim()) x.reden = 'de figuur kan niet mee in een toets';
      else x.zonder = true;
    }
    return check(x);
  }
  function check(x){
    if (!x.reden && x.vraag.length > MAX.vraag) x.reden = 'de tekst is te lang voor een toetsvraag (hoogstens ' + MAX.vraag + ' tekens)';
    if (!x.reden && (x.goed || '').length > MAX.goed) x.reden = 'het antwoord is te lang';
    if (!x.reden && x.vorm === 'mk' && x.fout.some(function(f){ return f.length > MAX.goed; })) x.reden = 'een keuze is te lang';
    return x;
  }
  function vrHtml(x){
    /* op een werkblad kan elke opgave mee, met de figuur zoals in het boek */
    var reden = BLAD ? '' : x.reden;
    var aan = !!bGekozen[x.id], kan = !reden, al = kan && opt.alSet[sleutel(x.vraag, x.goed)];
    var meta = [x.info];
    if (BLAD){ if (x.fig) meta.push('met figuur'); }
    else if (x.svg) meta.push('met figuur'); else if (x.zonder) meta.push('zonder de figuur');
    if (al) meta.push('staat al ' + waar());
    if (reden) meta = ['kan niet mee: ' + reden];
    return '<label class="kzb-vr' + (aan ? ' aan' : '') + (kan && !al ? '' : ' kan-niet') + '"><input type="checkbox" data-bid="' + x.id + '"' + (aan ? ' checked' : '') + (kan && !al ? '' : ' disabled') + '>' +
      '<span class="kzb-vrt"><b>' + schoon(x.vraag) + '</b>' + (x.svg ? '<img alt="De figuur bij deze opgave" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(x.svg) + '">' : '') +
      '<span class="' + (reden ? '' : 'kzb-goed') + '">' + schoon(meta.join(' · ')) + '</span></span>' +
      '<span class="kzb-soort">' + (x.vorm === 'mk' ? 'meerkeuze' : 'open') + (BLAD ? '' : ' · ' + x.punten + ' p') + '</span></label>';
  }
  function boekPast(x){
    if (BLAD) return '';
    if (bVolg.length + 1 > opt.ruimte()) return 'Een toets heeft hoogstens 200 vragen; er kunnen er nog ' + opt.ruimte() + ' bij.';
    if (x.svg && bVolg.filter(function(id){ return bGekozen[id].svg; }).length + 1 > opt.plaatjesVrij()) return 'Een toets heeft hoogstens 12 plaatjes; er kunnen er nog ' + opt.plaatjesVrij() + ' bij. Kies een opgave zonder figuur.';
    return '';
  }
  function boekStand(){
    var n = bVolg.length, p = bVolg.reduce(function(a, id){ return a + bGekozen[id].punten; }, 0);
    var pars = {}; bVolg.forEach(function(id){ pars[bGekozen[id].vak + bGekozen[id].par] = true; });
    var np = Object.keys(pars).length;
    $('kzbTel').innerHTML = n ? '<b>' + n + (n === 1 ? ' opgave' : ' opgaven') + '</b> gekozen, uit ' + np + (np === 1 ? ' paragraaf' : ' paragrafen') + (BLAD ? '' : ' · ' + p + (p === 1 ? ' punt' : ' punten')) : 'Nog niets gekozen';
    $('kzbZet').disabled = !n || bBezig;
    var plek = BLAD ? ' op het blad' : ' in de toets';
    $('kzbZet').textContent = n ? 'Zet ' + (n === 1 ? 'de opgave' : n + ' opgaven') + plek : 'Zet' + plek;
  }
  function boekLeeg(){ bGekozen = {}; bVolg = []; if ($('kzbMelding')){ boekMelding(''); boekStand(); boekTellers(); [].forEach.call($('kzbRechts').querySelectorAll('input[data-bid]'), function(c){ c.checked = false; c.closest('.kzb-vr').classList.remove('aan'); }); } }
  function boekZet(){
    if (!bVolg.length || bBezig) return;
    var uitleg = $('kzbUitleg').checked, lijst = bVolg.map(function(id){ return bGekozen[id]; });
    if (BLAD){
      var kb = opt, uit = lijst.map(function(x){ return { bron:'boek', o:x.o, pvak:x.vak, par:x.par, toets:toetsVan(x) }; });
      boekLeeg(); dicht();
      kb.klaar(uit, { vakken:[] });
      return;
    }
    bBezig = true; boekStand(); $('kzbZet').setAttribute('aria-busy', 'true');
    boekMelding(lijst.some(function(x){ return x.svg; }) ? 'De figuren klaarmaken…' : '');
    Promise.all(lijst.map(function(x){
      var it = x.vorm === 'mk' ? { vorm:'mk', vraag:x.vraag, goed:x.goed, fout:schud(x.fout), uitleg:uitleg ? x.uitleg : '', punten:x.punten }
        : { vorm:'open', vraag:x.vraag, antwoorden:x.antwoorden, uitleg:uitleg ? x.uitleg : '', punten:x.punten };
      if (!x.svg) return Promise.resolve(it);
      return plaatje({ svg:x.svg }).then(function(data){ it.afbData = data; return it; }, function(){ return null; });
    })).then(function(items){
      var mislukt = items.filter(function(y){ return !y; }).length;
      items = items.filter(Boolean);
      var vakken = {}; lijst.forEach(function(x){ vakken[TOETSVAK[x.vak]] = true; });
      bBezig = false; $('kzbZet').removeAttribute('aria-busy');
      var k = opt;
      boekLeeg();
      dicht();
      k.klaar(items, { vakken:Object.keys(vakken), mislukt:mislukt });
    });
  }

  function dicht(){
    var d = $('kiezer'); if (d.open) d.close();
    document.documentElement.classList.remove('kzopen');
    if (opt && opt.knop) opt.knop.focus();
  }
  function sluit(){
    if (bezig) return;
    gekozen = {}; volgorde = []; zetAlleen(false); melding('');
    boekLeeg();
    dicht();
  }
  /* een opgave uit het boek als toetsvraag, zonder de opgave zelf (die kan niet in localStorage) */
  function toetsVan(x){
    var t = { vorm:x.vorm, vraag:x.vraag, goed:x.goed, uitleg:x.uitleg, punten:x.punten };
    if (x.vorm === 'mk') t.fout = x.fout.slice(); else t.antwoorden = (x.antwoorden || []).slice();
    if (x.svg) t.svg = x.svg;
    if (x.reden) t.reden = x.reden;
    return t;
  }

  /* De stijl van het venster. In maken.html staat die in de pagina zelf; op
     het werkblad komt hij hier vandaan, met wat maken.html uit eigen.css haalt. */
  function basisStijl(){
    if ($('kzBasisStijl')) return;
    var s = document.createElement('style'); s.id = 'kzBasisStijl';
    s.textContent =
      'html.kzopen{overflow:hidden}' +
      '.kiezer{width:min(1180px,100% - 32px);height:min(880px,100% - 40px);max-width:none;max-height:none;padding:0;border:1px solid var(--rand);border-radius:22px;background:var(--room);color:var(--ink);box-shadow:0 30px 80px rgba(20,34,76,.35);overflow:hidden}' +
      '.kiezer[open]{display:flex;flex-direction:column}' +
      '.kiezer::backdrop{background:rgba(15,26,61,.55)}' +
      '.kzkop{display:flex;align-items:center;justify-content:space-between;gap:10px 14px;padding:12px 12px 12px 22px;border-bottom:1px solid var(--rand2);background:var(--kaart)}' +
      '.kzkop h2{font-size:1.2rem;margin:0}' +
      '.kzplek{font-size:.9rem;font-weight:500;color:var(--muted);letter-spacing:0}' +
      '.kzblad .kztabs[hidden],.kzblad .kztabs [hidden]{display:none}' +
      '.kzsluit{border:1.5px solid var(--rand2);background:var(--kaart);color:var(--ink);width:44px;height:44px;border-radius:12px;font-size:1.5rem;line-height:1;padding:0;flex:none}' +
      '.kzsluit:hover{background:var(--kaart2)}' +
      '.kzmidden{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;padding:14px 22px 18px;display:grid;gap:12px;align-content:start;background:var(--kaart)}' +
      '.kzfilters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}' +
      '.kzbreed,.kzdeel{grid-column:1 / -1}' +
      '@media(min-width:700px){.kzfilters{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr)}.kzfilters .kzdeel{grid-column:auto}}' +
      '.kiezer label.veldnaam{display:grid;gap:4px;font-size:.88rem;font-weight:600}' +
      '.kiezer .knop.klein{padding:8px 12px;font-size:.88rem;border-radius:12px;min-height:44px;box-shadow:none}' +
      '.kiezer .melding{min-height:1.4em;font-size:.92rem;margin:0}' +
      '.kiezer .melding.fout{color:var(--fout);font-weight:600}' +
      '.kiezer .leeg{padding:22px;border:1.5px dashed var(--rand2);border-radius:16px;color:var(--muted);text-align:center}' +
      '.kzbalk{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px}' +
      '.kzaantal{font-size:.9rem;color:var(--muted);font-variant-numeric:tabular-nums;margin:0}' +
      '.kzlijst{display:grid;gap:6px}' +
      '.kzvraag{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1.5px solid var(--rand2);border-radius:14px;cursor:pointer;min-height:44px}' +
      '.kzvraag:hover{border-color:var(--ocean)}' +
      '.kzvraag.aan{border-color:var(--ocean);background:var(--kies)}' +
      '.kzvraag.al{opacity:.6;cursor:default}' +
      '.kzvraag input{width:20px;height:20px;margin:2px 0 0;accent-color:var(--ocean);flex:none;cursor:inherit}' +
      '.kzvraag input:focus-visible{outline:3px solid var(--focusring,#B4701A);outline-offset:3px}' +
      '.kzbeeld{flex:none;width:64px;height:48px;display:grid;place-items:center;border-radius:8px;background:#fff;color:#14224C;border:1px solid var(--rand);overflow:hidden;padding:2px}' +
      '.kzbeeld img{max-width:100%;max-height:100%;display:block}.kzbeeld svg{width:100%;height:100%;display:block}' +
      '.kztekst{display:grid;gap:3px;min-width:0;flex:1 1 auto}' +
      '.kzv{font-weight:600;line-height:1.35;overflow-wrap:anywhere}' +
      '.kzgoed{font-size:.9rem;color:var(--goed);overflow-wrap:anywhere}.kzgoedlabel{font-weight:700}' +
      '.kzlabels{display:flex;flex-wrap:wrap;gap:4px}' +
      '.kzlabels span{font-size:.75rem;font-weight:600;border-radius:999px;padding:2px 8px;background:var(--kaart2);color:var(--muted)}' +
      '.kzmeer{justify-self:start;margin-top:4px}' +
      '.kzvoet{border-top:1px solid var(--rand);padding:10px 22px calc(12px + env(safe-area-inset-bottom));background:var(--kaart)}' +
      '.kzvoet .melding{margin:0 0 8px}.kzvoet .melding:empty{display:none}' +
      '.kiezer.kzboekaan .kzmidden,.kiezer.kzboekaan .kzvoet,.kiezer.kzzelfaan .kzmidden,.kiezer.kzzelfaan .kzvoet,.kiezer.kzzelfaan .kzboek{display:none}' +
      '.kiezer:not(.kzzelfaan) .kzzelf{display:none}' +
      '.kzzelf{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}' +
      '.kzb-midden,.kzb-voet{background:var(--kaart)}' +
      '@media(max-width:560px){.kiezer{width:100%;height:100%;max-height:none;margin:0;border:0;border-radius:0}.kzkop{padding:8px 8px 8px 16px}.kzmidden{padding:12px 16px 16px}.kzvoet{padding-left:16px;padding-right:16px}.kzvoet .rij{gap:8px}.kzvoet .rij .knop{flex:1 1 auto}#kzAnnuleer{display:none}}' +
      '@media(max-width:420px){.kzfilters{grid-template-columns:minmax(0,1fr)}}';
    document.head.appendChild(s);
  }

  function open(o){
    opt = o || {};
    if (!$('kiezer')) BLAD = !!opt.blad;
    bouw();
    opt.alSet = {}; (opt.al ? opt.al() : []).forEach(function(s){ opt.alSet[s] = true; });
    opt.ruimte = opt.ruimte || function(){ return 200; };
    opt.plaatjesVrij = opt.plaatjesVrij || function(){ return 12; };
    var d = $('kiezer');
    melding('');
    document.documentElement.classList.add('kzopen');
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    $('kzMidden').scrollTop = 0;
    /* het vak van de toets staat al klaar; anders eerst een vak kiezen */
    var vak = $('kzVak').value || (opt.vak && [].some.call($('kzVak').options, function(x){ return x.value === opt.vak; }) ? opt.vak : '');
    if (vak !== vakNu || !KLAAR[vak]){ $('kzVak').value = vak; kiesVak(vak); }
    else teken();
    if (BLAD){
      /* waar de vraag komt, en welke tabs er zijn (aanpassen: alleen Zelf schrijven) */
      $('kzTitel').textContent = opt.titel || 'Vraag toevoegen';
      $('kzPlek').textContent = opt.plek || '';
      var tabs = opt.tabs || ['boek', 'bank', 'zelf'];
      Object.keys(TABNAAM).forEach(function(id){ $(id).hidden = tabs.indexOf(TABNAAM[id]) < 0; });
      d.querySelector('.kztabs').hidden = tabs.length < 2;
      var tab = opt.tab && tabs.indexOf(opt.tab) >= 0 ? opt.tab : tabs.indexOf(tabNu) >= 0 ? tabNu : tabs[0];
      kiesTab(tab);
      if (tab !== 'zelf') $(tab === 'boek' ? 'kzTabBoek' : 'kzTabBank').focus();
      return;
    }
    /* stond het boek open, dan weer het boek; anders de vragenbank */
    if (boekAan){ boekOpen(); $('kzTabBoek').focus(); } else $('kzVak').focus();
  }
  return { open: open, sleutel: sleutel, sluit: function(){ if ($('kiezer')) sluit(); },
    tab: function(){ return tabNu; },
    /* voor het werkblad: een opgave uit het boek als toetsvraag, en de vragenbank voor Vervangen */
    boekToets: function(o, vak, par){ return toetsVan(alsToets(o, vak, par)); },
    alsBlad: alsBlad,
    bankLijst: function(vak){ return laadVak(vak).then(function(b){ return b.lijst; }); },
    plaatje: plaatje };
})();
