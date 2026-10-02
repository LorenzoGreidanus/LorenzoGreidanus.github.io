/* Leer de tafels met trucjes, voor de Rekenrace.

   Een tafel uit je hoofd leren gaat beter als je hem kunt afleiden van een
   tafel die je al kent. De tafel van 4 is die van 2, maar dan dubbel. De tafel
   van 9 is die van 10, min één keer. Wie dat ziet, hoeft minder te stampen en
   kan zichzelf redden als hij er een vergeet.

   Per tafel: het trucje met een tabel waarin je het ziet gebeuren, dan vier
   sommen met de stappen erbij, dan vier zonder (met een knop als je vastloopt).
   Aan het eind kun je meteen de race in met dezelfde tafels.

     TAFELLEER.open(tafels, { klaar:function(tafels){ ... } })
   De pagina geeft een lijst tafels mee (1 tot 15) en wat er moet gebeuren als
   de leerling de race in wil. */
window.TAFELLEER = (function(){
  'use strict';
  /* Een tafel als som van tafels die je al kent: rijen zijn de tafels waar je
     van uitgaat, en hoe je ze samenneemt. */
  var TRUC = {
    1:  { kort:'Keer 1 verandert niets', uit:'Eén keer een getal is gewoon dat getal. Deze ken je dus al.', rijen:[1], doe:'zelf' },
    10: { kort:'Zet er een nul achter', uit:'Tien keer een getal: schrijf het getal op en zet er een nul achter. 10 × 7 = 70.', rijen:[1], doe:'nul' },
    2:  { kort:'Het getal plus zichzelf', uit:'Keer 2 is dubbel: tel het getal bij zichzelf op. 2 × 8 = 8 + 8 = 16. Alle uitkomsten zijn even.', rijen:[1], doe:'dubbel' },
    5:  { kort:'De helft van de tafel van 10', uit:'Vijf is de helft van tien. Reken 10 keer uit en neem de helft: 5 × 8 is de helft van 80, dus 40. De uitkomst eindigt altijd op 0 of 5.', rijen:[10], doe:'helft' },
    4:  { kort:'De tafel van 2, maar dan dubbel', uit:'Vier is twee keer twee. Verdubbel het getal, en verdubbel dan nog een keer: 4 × 7: 7 → 14 → 28.', rijen:[2], doe:'dubbel' },
    3:  { kort:'De tafel van 2, plus nog één keer', uit:'Drie keer is twee keer en dan nog één keer erbij: 3 × 7 = 14 + 7 = 21.', rijen:[2, 1], doe:'plus' },
    9:  { kort:'De tafel van 10, min één keer', uit:'Negen keer is tien keer min één keer: 9 × 7 = 70 − 7 = 63. Controle: de cijfers van de uitkomst tellen op tot 9 (6 + 3 = 9).', rijen:[10, 1], doe:'min' },
    6:  { kort:'De tafel van 5, plus nog één keer', uit:'Zes keer is vijf keer plus één keer: 6 × 7 = 35 + 7 = 42. Of de tafel van 3, maar dan dubbel.', rijen:[5, 1], doe:'plus' },
    8:  { kort:'De tafel van 4, maar dan dubbel', uit:'Acht is twee keer vier. Drie keer verdubbelen: 8 × 6: 6 → 12 → 24 → 48.', rijen:[4], doe:'dubbel' },
    7:  { kort:'De tafel van 5 plus de tafel van 2', uit:'Zeven is vijf plus twee. 7 × 6 = 5 × 6 + 2 × 6 = 30 + 12 = 42. De tafel van 7 is de lastigste; met dit trucje kun je hem altijd uitrekenen.', rijen:[5, 2], doe:'plus' },
    11: { kort:'De tafel van 10 plus nog één keer', uit:'Elf keer is tien keer plus één keer: 11 × 7 = 70 + 7 = 77. Tot en met 9 zie je het getal twee keer staan.', rijen:[10, 1], doe:'plus' },
    12: { kort:'De tafel van 10 plus de tafel van 2', uit:'Twaalf is tien plus twee: 12 × 7 = 70 + 14 = 84.', rijen:[10, 2], doe:'plus' },
    15: { kort:'De tafel van 10 plus de helft erbij', uit:'Vijftien is tien plus vijf, en vijf is de helft van tien: 15 × 6 = 60 + 30 = 90.', rijen:[10, 5], doe:'plus' },
    13: { kort:'De tafel van 10 plus de tafel van 3', uit:'Dertien is tien plus drie: 13 × 7 = 70 + 21 = 91.', rijen:[10, 3], doe:'plus' },
    14: { kort:'De tafel van 7, maar dan dubbel', uit:'Veertien is twee keer zeven: 14 × 6 = 42 + 42 = 84. Of tien keer plus vier keer: 60 + 24.', rijen:[7], doe:'dubbel' }
  };
  /* de volgorde om ze te leren: eerst wat je al kent, dan wat je ervan afleidt */
  var VOLG = [1, 10, 2, 5, 4, 3, 9, 6, 8, 7, 11, 12, 15, 13, 14];

  function schoon(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function rnd(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  /* de stappen van het trucje voor n × k */
  function stappen(n, k){
    var t = TRUC[n], r = t.rijen;
    if (t.doe === 'zelf') return [n + ' × ' + k + ' = ' + k];
    if (t.doe === 'nul') return [k + ' met een nul erachter: ' + (10 * k)];
    if (t.doe === 'helft') return ['10 × ' + k + ' = ' + (10 * k), 'de helft van ' + (10 * k) + ' is ' + (5 * k)];
    if (t.doe === 'dubbel'){
      var b = r[0], uit = [];
      if (b === 1) return [k + ' + ' + k + ' = ' + (2 * k)];
      uit.push(b + ' × ' + k + ' = ' + (b * k));
      uit.push('dubbel: ' + (b * k) + ' + ' + (b * k) + ' = ' + (n * k));
      return uit;
    }
    var a1 = r[0] * k, a2 = r[1] * k;
    return [r[0] + ' × ' + k + ' = ' + a1, r[1] + ' × ' + k + ' = ' + a2,
      a1 + (t.doe === 'min' ? ' − ' : ' + ') + a2 + ' = ' + (n * k)];
  }
  /* de tabel: de tafel(s) waar je van uitgaat, en wat er uitkomt */
  function tabel(n){
    var t = TRUC[n], k, h = '<div class="tl-tabel" role="table" aria-label="De tafel van ' + n + '"><div class="tl-rij kop" role="row"><span role="columnheader">keer</span>';
    for (k = 1; k <= 10; k++) h += '<span role="columnheader">' + k + '</span>';
    h += '</div>';
    if (t.doe !== 'zelf' && t.doe !== 'nul'){
      t.rijen.forEach(function(b){
        h += '<div class="tl-rij bron" role="row"><span role="rowheader">tafel van ' + b + '</span>';
        for (k = 1; k <= 10; k++) h += '<span role="cell">' + (b * k) + '</span>';
        h += '</div>';
      });
      var teken = t.doe === 'plus' ? '+' : t.doe === 'min' ? '−' : t.doe === 'helft' ? 'de helft' : 'dubbel';
      h += '<div class="tl-rij teken" role="row"><span role="rowheader"></span><span class="tl-op" role="cell">' + teken + '</span></div>';
    }
    h += '<div class="tl-rij doel" role="row"><span role="rowheader">tafel van ' + n + '</span>';
    for (k = 1; k <= 10; k++) h += '<span role="cell">' + (n * k) + '</span>';
    return h + '</div></div>';
  }
  /* hoeveel je er al kent: een raster van 10 bij 10, waar omdraaien de helft scheelt */
  function raster(gekend){
    var h = '<div class="tl-raster" aria-hidden="true">';
    for (var a = 1; a <= 10; a++) for (var b = 1; b <= 10; b++){
      var aan = gekend.indexOf(a) >= 0 || gekend.indexOf(b) >= 0;
      h += '<i class="' + (aan ? 'aan' : '') + '"></i>';
    }
    return h + '</div>';
  }

  var stijl = false;
  function zetStijl(){
    if (stijl) return; stijl = true;
    var s = document.createElement('style');
    s.textContent = [
      '.tl{max-width:760px;margin:0 auto;padding:28px 0 60px}',
      '.tl-kaart{background:var(--kaart,#fff);border:2px solid rgba(20,34,76,.10);border-radius:22px;padding:clamp(16px,3vw,26px);margin-top:16px}',
      ':root[data-theme="dark"] .tl-kaart{border-color:rgba(243,239,233,.12)}',
      '.tl h2{font-size:clamp(1.5rem,4vw,2.1rem)}',
      '.tl-kort{font-size:1.15rem;font-weight:600;color:var(--ocean);margin-top:4px}',
      ':root[data-theme="dark"] .tl-kort{color:var(--vista)}',
      '.tl-uit{margin-top:10px}',
      '.tl-tabel{margin-top:16px;overflow-x:auto;font-variant-numeric:tabular-nums}',
      '.tl-rij{display:grid;grid-template-columns:92px repeat(10,minmax(30px,1fr));gap:3px;min-width:430px}',
      '.tl-rij span{text-align:center;padding:5px 0;border-radius:7px;font-size:.92rem}',
      '.tl-rij span:first-child{text-align:left;font-size:.74rem;color:var(--muted);align-self:center}',
      '.tl-rij.kop span{font-size:.72rem;color:var(--muted)}',
      '.tl-rij.bron span+span{background:rgba(131,165,242,.18)}',
      '.tl-rij.doel span+span{background:rgba(242,103,73,.16);font-weight:700}',
      '.tl-rij.teken{grid-template-columns:92px 1fr}',
      '.tl-op{font-size:.8rem !important;font-weight:600;color:var(--muted)}',
      '.tl-raster{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;width:min(220px,60vw);margin-top:12px}',
      '.tl-raster i{aspect-ratio:1;border-radius:3px;background:rgba(20,34,76,.10)}',
      ':root[data-theme="dark"] .tl-raster i{background:rgba(243,239,233,.22)}',
      '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .tl-raster i{background:rgba(243,239,233,.22)}}',
      '.tl-raster i.aan{background:var(--crab)}',
      '.tl-som{font-size:clamp(2rem,7vw,3rem);font-weight:700;text-align:center;margin-top:8px;font-variant-numeric:tabular-nums}',
      '.tl-hulp{list-style:none;padding:0;margin:12px auto 0;max-width:360px;display:grid;gap:6px}',
      '.tl-hulp li{background:rgba(131,165,242,.16);border-radius:10px;padding:7px 12px;font-variant-numeric:tabular-nums}',
      '.tl-hulp li.vraag{background:rgba(242,103,73,.14);font-weight:600}',
      '.tl-invoer{display:flex;gap:8px;justify-content:center;margin-top:16px}',
      '.tl-invoer input{width:130px;min-height:54px;text-align:center;font:700 1.5rem Poppins,system-ui,sans-serif;border-radius:14px;border:2px solid rgba(20,34,76,.2);background:var(--kaart,#fff);color:var(--ink)}',
      '.tl-invoer input:focus{outline:3px solid var(--focusring,#B4701A);outline-offset:2px}',
      '.tl-terug{text-align:center;margin-top:12px;min-height:1.6em;font-weight:600}',
      '.tl-terug.goed{color:var(--op)} .tl-terug.fout{color:var(--neer)}',
      '.tl-voort{display:flex;gap:6px;justify-content:center;margin-top:10px}',
      '.tl-voort i{width:12px;height:12px;border-radius:50%;border:2px solid var(--muted)}',
      '.tl-voort i.goed{background:var(--op);border-color:var(--op)} .tl-voort i.fout{background:var(--neer);border-color:var(--neer)}',
      '.tl-knoppen{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:18px}',
      '.tl-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
      '.tl-chips span{border-radius:999px;padding:4px 11px;font-size:.84rem;background:rgba(20,34,76,.07)}',
      ':root[data-theme="dark"] .tl-chips span{background:rgba(243,239,233,.10)}',
      '.tl-chips span.klaar{background:var(--goed-bg);font-weight:600}',
      '.tl-chips span.nu{outline:2px solid var(--crab)}',
      '@media(max-width:520px){.tl-rij{grid-template-columns:70px repeat(10,minmax(26px,1fr));min-width:340px}.tl-rij span{font-size:.8rem}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var vak = null, lijst = [], nr = 0, fase = 'uitleg', sommen = [], sNr = 0, uitslag = [], opts = {}, terugNaar = null;
  function el(id){ return document.getElementById(id); }

  function open(tafels, o){
    zetStijl();
    opts = o || {};
    lijst = VOLG.filter(function(t){ return (tafels || []).indexOf(t) >= 0; });
    if (!lijst.length) lijst = VOLG.slice(0, 10);
    terugNaar = opts.verberg || [];
    terugNaar.forEach(function(x){ if (x) x.classList.add('hide'); });
    if (!vak){ vak = document.createElement('section'); vak.className = 'wrap tl'; vak.id = 'scherm-leer'; var na = el('scherm-start'); na.parentNode.insertBefore(vak, na.nextSibling); }
    vak.classList.remove('hide');
    nr = 0; uitslag = [];
    intro();
  }
  function sluit(){
    if (vak) vak.classList.add('hide');
    terugNaar.forEach(function(x){ if (x) x.classList.remove('hide'); });
    scrollTo({ top:0, behavior:'auto' });
  }
  function chips(){
    return '<div class="tl-chips">' + lijst.map(function(t, i){ return '<span class="' + (i < nr ? 'klaar' : i === nr ? 'nu' : '') + '">' + t + '</span>'; }).join('') + '</div>';
  }
  function intro(){
    var gekend = [1, 2, 5, 10];
    vak.innerHTML = '<p class="hand" style="font-size:1.5rem">minder stampen, meer snappen</p><h1>Leer de tafels</h1>' +
      '<div class="tl-kaart"><h2>Je kent er al meer dan je denkt</h2>' +
      '<p class="tl-uit">Bij keer maakt de volgorde niet uit: 3 × 7 is hetzelfde als 7 × 3. Ken je de tafels van 1, 2, 5 en 10, dan ken je de gekleurde vakjes al. Van de honderd sommen tot 10 × 10 blijven er dan maar weinig over, en die leid je af van wat je al kent.</p>' +
      raster(gekend) +
      '<p class="tl-uit">Per tafel zie je het trucje, oefen je vier sommen met de stappen erbij en vier zonder. Je leert: ' + lijst.map(function(t){ return 'de tafel van ' + t; }).join(', ').replace(/, ([^,]*)$/, ' en $1') + '.</p>' +
      '<div class="tl-knoppen"><button class="btn" type="button" id="tlStart">Begin met de tafel van ' + lijst[0] + '</button><button class="linkbtn" type="button" id="tlTerug">Terug</button></div></div>';
    el('tlStart').addEventListener('click', uitleg);
    el('tlTerug').addEventListener('click', sluit);
    el('tlStart').focus({ preventScroll:true });
    scrollTo({ top:0, behavior:'auto' });
  }
  function uitleg(){
    var n = lijst[nr], t = TRUC[n];
    fase = 'uitleg';
    vak.innerHTML = chips() + '<div class="tl-kaart"><p class="eyebrow">het trucje</p><h2>De tafel van ' + n + '</h2>' +
      '<p class="tl-kort">' + schoon(t.kort) + '</p><p class="tl-uit">' + schoon(t.uit) + '</p>' + tabel(n) +
      '<div class="tl-knoppen"><button class="btn" type="button" id="tlOefen">Oefen met hulp</button><button class="linkbtn" type="button" id="tlTerug">Stoppen</button></div></div>';
    el('tlOefen').addEventListener('click', function(){ maakSommen(n); sNr = 0; fase = 'hulp'; som(); });
    el('tlTerug').addEventListener('click', sluit);
    el('tlOefen').focus({ preventScroll:true });
    scrollTo({ top:0, behavior:'auto' });
  }
  /* acht sommen: vier met hulp, vier zonder, niet twee keer dezelfde achter elkaar */
  function maakSommen(n){
    var ks = [2, 3, 4, 6, 7, 8, 9], kies = [];
    while (kies.length < 8){ var k = ks[rnd(0, ks.length - 1)]; if (kies[kies.length - 1] !== k) kies.push(k); }
    sommen = kies.map(function(k){ return { n:n, k:k, goed:null }; });
  }
  function som(){
    var s = sommen[sNr], metHulp = sNr < 4;
    fase = metHulp ? 'hulp' : 'zelf';
    var stap = stappen(s.n, s.k);
    vak.innerHTML = chips() + '<div class="tl-kaart"><p class="eyebrow">' + (metHulp ? 'met hulp' : 'nu zelf') + ' · som ' + (sNr + 1) + ' van 8</p>' +
      '<div class="tl-som">' + s.n + ' × ' + s.k + ' = ?</div>' +
      (metHulp ? '<ul class="tl-hulp">' + stap.slice(0, -1).map(function(x){ return '<li>' + schoon(x) + '</li>'; }).join('') + '<li class="vraag">' + schoon(stap[stap.length - 1].replace(/= \d+$/, '= ?').replace(/: \d+$/, ': ?').replace(/ is \d+$/, ' is ?')) + '</li></ul>' : '<ul class="tl-hulp hide" id="tlHulp">' + stap.map(function(x){ return '<li>' + schoon(x) + '</li>'; }).join('') + '</ul>') +
      '<div class="tl-invoer"><input id="tlIn" type="text" inputmode="numeric" autocomplete="off" aria-label="Jouw antwoord"><button class="btn" type="button" id="tlCheck">Kijk na</button></div>' +
      '<p class="tl-terug" id="tlTerugk" role="status" aria-live="polite"></p>' +
      '<div class="tl-voort" aria-hidden="true">' + sommen.map(function(x, i){ return '<i class="' + (x.goed === true ? 'goed' : x.goed === false ? 'fout' : '') + '"></i>'; }).join('') + '</div>' +
      (metHulp ? '' : '<div class="tl-knoppen"><button class="linkbtn" type="button" id="tlToon">Ik zit vast: laat het trucje zien</button></div>') + '</div>';
    var inp = el('tlIn'), af = false;
    function kijk(){
      if (af) return;
      var w = parseInt(String(inp.value).replace(/\D/g, ''), 10);
      if (isNaN(w)) return;
      af = true; inp.disabled = true; el('tlCheck').disabled = true;
      var ok = w === s.n * s.k;
      s.goed = ok;
      var tk = el('tlTerugk');
      tk.className = 'tl-terug ' + (ok ? 'goed' : 'fout');
      tk.textContent = ok ? 'Goed! ' + s.n + ' × ' + s.k + ' = ' + (s.n * s.k) + '.' : 'Niet goed, het is ' + (s.n * s.k) + '. Kijk hierboven hoe het trucje werkt.';
      var hulp = el('tlHulp'); if (hulp && !ok) hulp.classList.remove('hide');
      /* bij een fout met hulp: de laatste stap met het antwoord erin */
      if (!ok && metHulp){ var laatst = vak.querySelector('.tl-hulp li.vraag'); if (laatst) laatst.textContent = stap[stap.length - 1]; }
      var vast = el('tlToon'); if (vast) vast.classList.add('hide');
      var verder = document.createElement('button');
      verder.className = 'btn'; verder.type = 'button'; verder.id = 'tlVerder';
      verder.textContent = sNr < 7 ? 'Volgende som' : 'Klaar met deze tafel';
      verder.addEventListener('click', function(){ sNr++; if (sNr < 8) som(); else tafelKlaar(); });
      tk.parentNode.insertBefore(verder, tk.nextSibling);
      verder.style.display = 'block'; verder.style.margin = '12px auto 0';
      verder.focus({ preventScroll:true });
    }
    el('tlCheck').addEventListener('click', kijk);
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); kijk(); } });
    var toon = el('tlToon'); if (toon) toon.addEventListener('click', function(){ el('tlHulp').classList.remove('hide'); toon.classList.add('hide'); });
    setTimeout(function(){ try { inp.focus({ preventScroll:true }); } catch (e){} }, 30);
  }
  function tafelKlaar(){
    var n = lijst[nr], zelfGoed = sommen.slice(4).filter(function(x){ return x.goed; }).length;
    uitslag.push({ n:n, goed:sommen.filter(function(x){ return x.goed; }).length, zelf:zelfGoed });
    nr++;
    var laatste = nr >= lijst.length;
    vak.innerHTML = chips() + '<div class="tl-kaart"><p class="eyebrow">de tafel van ' + n + '</p>' +
      '<h2>' + (zelfGoed === 4 ? 'Die zit erin' : zelfGoed >= 3 ? 'Bijna' : 'Nog even oefenen') + '</h2>' +
      '<p class="tl-uit">Zonder hulp had je er ' + zelfGoed + ' van de 4 goed. ' + (zelfGoed === 4 ? 'Het trucje werkt.' : 'Lees het trucje nog eens: ' + schoon(TRUC[n].kort.toLowerCase()) + '.') + '</p>' +
      '<div class="tl-knoppen">' + (zelfGoed < 4 ? '<button class="btn ghost" type="button" id="tlNog">Deze tafel nog een keer</button>' : '') +
      (laatste ? '<button class="btn" type="button" id="tlRace">Nu de race met deze tafels</button>' : '<button class="btn" type="button" id="tlVolg">Door naar de tafel van ' + lijst[nr] + '</button>') +
      '<button class="linkbtn" type="button" id="tlTerug">Stoppen</button></div>' +
      (laatste ? '<p class="tl-uit">' + uitslag.map(function(u){ return 'tafel van ' + u.n + ': ' + u.zelf + ' van 4 zelf goed'; }).join(' · ') + '</p>' : '') + '</div>';
    var nog = el('tlNog'); if (nog) nog.addEventListener('click', function(){ nr--; uitslag.pop(); uitleg(); });
    var volg = el('tlVolg'); if (volg) volg.addEventListener('click', uitleg);
    var race = el('tlRace'); if (race) race.addEventListener('click', function(){ sluit(); if (opts.klaar) opts.klaar(lijst.slice()); });
    el('tlTerug').addEventListener('click', sluit);
    (volg || race).focus({ preventScroll:true });
  }
  return { open:open, stappen:stappen, TRUC:TRUC };
})();
