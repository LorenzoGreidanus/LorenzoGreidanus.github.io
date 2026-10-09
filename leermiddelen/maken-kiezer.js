/* Vragen uit de site: in maken.html kies je vragen uit de oefenstof die al op
   de site staat, in plaats van alles zelf te typen. De bron is de vragenbank
   van de spellen: bank-<vak>.js, met de opgaven van de vakspellen erbij
   (bank-spellen.js). Een bank komt pas binnen als je het vak kiest; zo blijft
   maken.html licht. Rekenen doet niet mee: die sommen maakt de computer elke
   keer nieuw, er is geen vaste lijst om uit te kiezen.

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
     KIEZER.sleutel(vraag, goed)  waaraan een vraag herkend wordt */
window.KIEZER = (function(){
  'use strict';
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

  /* het onderdeel van een vraag, met de naam uit bank.js */
  function deelNaam(vak, t){ var o = ((window.ONDERDELEN && ONDERDELEN[vak]) || []).filter(function(x){ return x.id === t; })[0]; return o ? o.naam : t; }
  var NIVONAAM = { 1:'vmbo-bb', 2:'vmbo-kgt en tl', 3:'havo', 4:'vwo' };

  /* ---------- het venster ---------- */
  var opt = null, gekozen = {}, volgorde = [], toon = PER_KEER, alleenGekozen = false, bezig = false;
  function bouw(){
    if ($('kiezer')) return;
    var vakken = (window.VAKKEN || []).filter(function(v){ return window.BANK && BANK.vakken.indexOf(v.id) >= 0 && v.id !== 'eigen'; });
    var niv = (window.NIVEAUS || []).map(function(n){ return '<option value="' + n.rang + '">' + schoon(n.naam) + '</option>'; }).join('');
    document.body.insertAdjacentHTML('beforeend',
      '<dialog class="kiezer" id="kiezer" aria-labelledby="kzKop" aria-describedby="kzUitleg">' +
        '<div class="kzkop"><h2 id="kzKop">Vragen uit de site</h2>' +
          '<button class="kzsluit" type="button" id="kzSluit" aria-label="Sluiten zonder vragen toe te voegen">&times;</button></div>' +
        '<div class="kzmidden" id="kzMidden">' +
          '<p class="tip" id="kzUitleg">Kies uit de oefenstof van de spellen op deze site. De vragen komen als gewone vragen in je toets, met de uitleg erbij, en je kunt ze daarna nog aanpassen. Rekenen staat er niet bij: die sommen maakt de computer elke keer nieuw.</p>' +
          '<div class="kzfilters">' +
            '<label class="veldnaam">Vak<select class="veld" id="kzVak"><option value="">kies een vak</option>' + vakken.map(function(v){ return '<option value="' + v.id + '">' + schoon(v.naam) + '</option>'; }).join('') + '</select></label>' +
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
          '<div class="rij"><button class="knop" type="button" id="kzZet" disabled>Zet in de toets</button>' +
          '<button class="knop stil" type="button" id="kzAnnuleer">Annuleren</button></div></div>' +
      '</dialog>');
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
    $('kzZet').textContent = n ? 'Zet ' + (n === 1 ? 'de vraag' : 'de ' + n + ' vragen') + ' in de toets' : 'Zet in de toets';
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
    Promise.all([BANK.zorg(vak), laadOpen(vak)]).then(function(){
      if (vakNu !== vak) return;
      var b = bereid(vak);
      b.lijst.forEach(function(x){ OP_ID[x.id] = x; });
      vulDelen(vak, b.lijst);
      $('kzOpenRij').classList.toggle('hide', !b.lijst.some(openVan));
      $('kzLijst').removeAttribute('aria-busy');
      teken();
    }).catch(function(){
      $('kzLijst').removeAttribute('aria-busy');
      $('kzLijst').innerHTML = '<p class="leeg">De vragen konden niet geladen worden. Controleer je internet en kies het vak opnieuw.</p>';
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
    var al = alInToets(x), aan = !!gekozen[x.id], open = $('kzOpen').checked && openAntwoorden(x).length;
    var labels = [];
    if (x.n && NIVONAAM[x.n]) labels.push('vanaf ' + NIVONAAM[x.n]);
    if (vakNu && x.vak === vakNu && !$('kzDeel').value) labels.push(deelNaam(x.vak, x.t));
    if (x.vak !== vakNu) labels.push(((window.VAKKEN || []).filter(function(v){ return v.id === x.vak; })[0] || {}).naam || x.vak);
    if (x.beeld) labels.push('met plaatje');
    if (open) labels.push('open vraag');
    if (al) labels.push('staat al in je toets');
    return '<label class="kzvraag' + (aan ? ' aan' : '') + (al ? ' al' : '') + '"><input type="checkbox" data-id="' + schoon(x.id) + '"' + (aan ? ' checked' : '') + (al ? ' disabled' : '') + '>' +
      beeldHtml(x) +
      '<span class="kztekst"><span class="kzv">' + schoon(open ? openVraag(x) : x.v) + '</span>' +
      '<span class="kzgoed"><span class="kzgoedlabel">Goed:</span> ' + schoon(open ? openAntwoorden(x).join(' / ') : x.goed) + '</span>' +
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
    var it = { vorm: 'mk', vraag: x.v, goed: x.goed, fout: schud(x.fout), uitleg: x.uitleg, punten: 1 };
    var ant = open ? openAntwoorden(x) : [];
    if (ant.length) it = { vorm: 'open', vraag: openVraag(x), antwoorden: ant, uitleg: x.uitleg, punten: 1 };
    if (!x.beeld) return Promise.resolve(it);
    return plaatje(x.beeld).then(function(data){ it.afbData = data; return it; }, function(){ return null; });
  }
  function zet(){
    var ids = volgorde.slice(); if (!ids.length || bezig) return;
    var p = past([]); if (p){ melding(p, 'fout'); return; }
    var open = $('kzOpen').checked;
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

  function dicht(){
    var d = $('kiezer'); if (d.open) d.close();
    document.documentElement.classList.remove('kzopen');
    if (opt && opt.knop) opt.knop.focus();
  }
  function sluit(){
    if (bezig) return;
    gekozen = {}; volgorde = []; zetAlleen(false); melding('');
    dicht();
  }
  function open(o){
    opt = o || {};
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
    $('kzVak').focus();
  }
  return { open: open, sleutel: sleutel };
})();
