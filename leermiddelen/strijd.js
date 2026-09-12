/* Samen spelen, de kant van de speler.

   Drie dingen zitten hier:
   1. Het duel en de klasstrijd. Met ?kamer=CODE in het adres hangt een potje
      Torenverdediging of Zwaardvechter aan een kamer op de server. Het spel
      roept aan:
        STRIJD.klaar(spel, { start:fn, stand:fn, aanval:fn(n, van) })
        STRIJD.reeks(reeks)          na elk antwoord
        STRIJD.af({ ronde, punten }) als het spel voorbij is
      Zonder ?kamer= is STRIJD.actief false en doen die drie niets.
   2. Het duelblok op het startscherm: STRIJD.duelBlok(doelId, spel, keuze),
      waar keuze() het gekozen vak en niveau teruggeeft. Maakt een kamer voor
      twee, of doet mee met een code.
   3. Het klassement van de hele site: STRIJD.klassement.toon(doelId, spel, id)
      en STRIJD.klassement.zet(spel, gegevens). */
window.STRIJD = (function(){
  'use strict';
  function param(naam){ var m = new RegExp('[?&]' + naam + '=([^&#]+)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function sid(){
    var s = null;
    try { s = localStorage.getItem('lg-quiz-sid'); } catch (e){}
    if (!s){
      var r = new Uint8Array(12); crypto.getRandomValues(r);
      s = Array.prototype.map.call(r, function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
      try { localStorage.setItem('lg-quiz-sid', s); } catch (e){}
    }
    return s;
  }
  function bewaardeNaam(){ try { return localStorage.getItem('lg-quiz-naam') || ''; } catch (e){ return ''; } }
  function bewaarNaam(n){ try { localStorage.setItem('lg-quiz-naam', n); } catch (e){} }
  /* het naamfilter, als het geladen is; anders alleen de lengte */
  function naamOk(n){ return !!n && !(window.NAAMFILTER && NAAMFILTER.verboden(n)); }
  var NAAMFOUT = 'Die bijnaam kan niet. Kies een andere.';

  /* ---------- opmaak van alles wat dit script tekent ---------- */
  var css = '#strijdHud{position:fixed;left:12px;bottom:12px;z-index:90;background:#14224C;color:#fff;border-radius:14px;padding:9px 13px;' +
    'font:600 .82rem/1.3 Poppins,system-ui,sans-serif;box-shadow:0 10px 24px rgba(20,34,76,.25);max-width:min(92vw,340px)}' +
    '#strijdHud small{display:block;font-weight:500;opacity:.8}' +
    '#strijdHud.wacht{background:#204ECF}' +
    '#strijdToast{position:fixed;left:50%;top:16px;transform:translate(-50%,-30px);z-index:91;background:#F26749;color:#fff;border-radius:999px;' +
    'padding:10px 18px;font:600 .9rem/1.2 Poppins,system-ui,sans-serif;box-shadow:0 10px 24px rgba(20,34,76,.25);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;max-width:92vw;text-align:center}' +
    '#strijdToast.aan{opacity:1;transform:translate(-50%,0)}' +
    '#strijdToast.goed{background:#2f7d52}' +
    '#strijdSluier{position:fixed;inset:0;z-index:89;background:rgba(20,34,76,.55);display:grid;place-items:center;padding:20px}' +
    '#strijdSluier>div{background:#fff;color:#14224C;border-radius:22px;padding:26px 28px;text-align:center;max-width:440px;font-family:Poppins,system-ui,sans-serif}' +
    '#strijdSluier b{display:block;font-size:1.4rem;margin-bottom:6px}' +
    '#strijdSluier p{margin:0;color:#5b6480}' +
    '#strijdSluier .code{display:block;font-size:2.6rem;letter-spacing:.25em;font-weight:700;color:#204ECF;margin:10px 0 4px;padding-left:.25em}' +
    '#strijdSluier .tel{font-size:3.4rem;font-weight:700;color:#F26749;line-height:1;margin:8px 0}' +
    '#strijdSluier button{margin-top:14px;border:1.5px solid rgba(20,34,76,.18);background:#fff;border-radius:999px;padding:8px 16px;font:600 .9rem Poppins,system-ui,sans-serif;color:#14224C;cursor:pointer}' +
    '.duelvak{max-width:560px;margin:18px auto 0;background:#fff;border:1px solid rgba(20,34,76,.08);border-radius:18px;padding:16px 18px;text-align:left;font-family:Poppins,system-ui,sans-serif}' +
    '.duelvak h3{margin:0 0 4px;font-size:1rem;font-weight:600}' +
    '.duelvak p{margin:0 0 10px;font-size:.86rem;color:#5b6480}' +
    '.duelvak .rij{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
    '.duelvak input{flex:1;min-width:110px;border:1.5px solid rgba(20,34,76,.14);border-radius:12px;padding:10px 12px;font:inherit;font-size:.95rem;background:#FBF6F1;color:inherit}' +
    '.duelvak input.code{flex:0 0 7.5em;text-transform:uppercase;letter-spacing:.2em;font-weight:700;text-align:center}' +
    '.duelvak button{border:none;border-radius:12px;padding:10px 14px;font:600 .9rem Poppins,system-ui,sans-serif;background:#204ECF;color:#fff;cursor:pointer;box-shadow:0 4px 0 rgba(20,34,76,.12)}' +
    '.duelvak button.los{background:#fff;color:#14224C;border:1.5px solid rgba(20,34,76,.14);box-shadow:none}' +
    '.duelvak button:disabled{opacity:.5;cursor:default}' +
    '.duelvak .fout{color:#c0442c;font-size:.85rem;min-height:1.2em;margin-top:6px}' +
    '.sitelijst{max-width:560px;margin:18px auto 0;text-align:left;font-family:Poppins,system-ui,sans-serif}' +
    '.sitelijst h3{margin:0 0 8px;font-size:1rem;font-weight:600}' +
    '.sitelijst .rij{display:grid;grid-template-columns:2.2em 1fr auto;gap:10px;align-items:center;background:#fff;border:1px solid rgba(20,34,76,.08);border-radius:12px;padding:7px 12px;margin-bottom:5px;font-size:.9rem}' +
    '.sitelijst .rij.jij{background:#fff6dc;border-color:#EFC64A}' +
    '.sitelijst .rij b{font-weight:600}.sitelijst .rij small{display:block;color:#5b6480;font-size:.76rem}' +
    '.sitelijst .rij .nr{font-weight:700;color:#5b6480}.sitelijst .rij .pt{font-weight:700;white-space:nowrap}' +
    '.sitelijst .leeg{color:#5b6480;font-size:.88rem}' +
    '.sitelijst .naamrij{display:flex;gap:8px;margin-bottom:10px}' +
    '.sitelijst .naamrij input{flex:1;min-width:0;border:1.5px solid rgba(20,34,76,.14);border-radius:12px;padding:10px 12px;font:inherit;background:#FBF6F1;color:inherit}' +
    '.sitelijst .naamrij button{border:none;border-radius:12px;padding:10px 14px;font:600 .9rem Poppins,system-ui,sans-serif;background:#F26749;color:#fff;cursor:pointer}' +
    '.sitelijst .hint{font-size:.85rem;color:#5b6480;margin:0 0 8px}' +
    /* donker: bij een eigen keuze en bij een apparaat dat donker vraagt */
    donkerRegels(':root[data-theme="dark"] ', '.duelvak,.sitelijst .rij,.duelvak input,.sitelijst .naamrij input,.duelvak button.los{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.14)}.sitelijst .rij.jij{background:#3a3220;border-color:#EFC64A}.duelvak p,.sitelijst .rij small,.sitelijst .leeg,.sitelijst .hint,.sitelijst .rij .nr{color:#B3BBD0}.duelvak h3,.sitelijst h3{color:#F3EFE9}#strijdSluier>div{background:#182652;color:#F3EFE9}#strijdSluier p{color:#B3BBD0}#strijdSluier button{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.2)}') +
    '@media(prefers-color-scheme:dark){' + donkerRegels(':root:not([data-theme="light"]) ', '.duelvak,.sitelijst .rij,.duelvak input,.sitelijst .naamrij input,.duelvak button.los{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.14)}.sitelijst .rij.jij{background:#3a3220;border-color:#EFC64A}.duelvak p,.sitelijst .rij small,.sitelijst .leeg,.sitelijst .hint,.sitelijst .rij .nr{color:#B3BBD0}.duelvak h3,.sitelijst h3{color:#F3EFE9}#strijdSluier>div{background:#182652;color:#F3EFE9}#strijdSluier p{color:#B3BBD0}#strijdSluier button{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.2)}') + '}';
  /* elke selector in een regelblok krijgt de voorloper */
  function donkerRegels(voor, regels){
    return regels.replace(/(^|\})([^{}]+)\{/g, function(alles, s0, sel){ return s0 + sel.split(',').map(function(x){ return voor + x.trim(); }).join(',') + '{'; });
  }
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ======================================================================
     1. het potje aan een kamer
     ====================================================================== */
  var code = (param('kamer') || '').toUpperCase().replace(/[^A-Z]/g, '');
  var actief = code.length === 4;
  var naam = param('naam') || bewaardeNaam();
  naam = naam.trim().slice(0, 16);
  if (!naamOk(naam)) naam = 'Leerling';
  var hud, toast, sluier, toastKlok = null, mijnSid = sid();
  var ws = null, dicht = false, pogingen = 0, hooks = null, gestart = false, klaarMet = false, laatsteStand = '', duel = false, tegen = null, gastheer = null, maatNaam = '';
  function samen(){ return duel && hooks && hooks.samen; }

  function zeg(tekst, goed){
    if (!toast) return;
    toast.textContent = tekst; toast.className = 'aan' + (goed ? ' goed' : '');
    clearTimeout(toastKlok); toastKlok = setTimeout(function(){ toast.className = ''; }, 2600);
  }
  function hudTekst(kop, onder, wacht){ if (!hud) return; hud.innerHTML = kop + (onder ? '<small>' + onder + '</small>' : ''); hud.className = wacht ? 'wacht' : ''; }
  function sluierTekst(html){ if (sluier){ sluier.innerHTML = '<div>' + html + '</div>'; var k = sluier.querySelector('button'); if (k) k.addEventListener('click', function(){ stuur({ t:'stop' }); location.href = location.pathname; }); } }
  function sluierWeg(){ if (sluier && sluier.parentNode) sluier.parentNode.removeChild(sluier); sluier = null; }

  if (actief){
    hud = document.createElement('div'); hud.id = 'strijdHud'; hud.className = 'wacht'; hud.innerHTML = 'Verbinden…';
    toast = document.createElement('div'); toast.id = 'strijdToast';
    sluier = document.createElement('div'); sluier.id = 'strijdSluier';
    document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(hud); document.body.appendChild(toast); document.body.appendChild(sluier); });
    sluierTekst('<b>Verbinden met kamer ' + code + '…</b>');
  }

  function open(){
    if (dicht || !actief) return;
    var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var s = new WebSocket(proto + location.host + '/ws/' + code + '?rol=speler&sid=' + encodeURIComponent(mijnSid) + '&naam=' + encodeURIComponent(naam));
    ws = s;
    s.onopen = function(){ pogingen = 0; };
    s.onmessage = function(e){
      if (e.data === 'pong') return;
      var m; try { m = JSON.parse(e.data); } catch (x){ return; }
      bericht(m);
    };
    s.onclose = function(e){
      if (ws !== s) return;
      ws = null;
      if (dicht) return;
      if (e.code === 1000 && /gesloten|afgelopen|verwijderd|nieuwe kamer|twee spelers/.test(e.reason || '')){ hudTekst('Samen spelen', e.reason, true); sluierTekst('<b>' + schoon(e.reason) + '</b><button type="button">Terug</button>'); dicht = true; return; }
      pogingen++;
      hudTekst('Kamer ' + code, 'verbinding kwijt, opnieuw proberen…', true);
      setTimeout(open, Math.min(8000, 600 * pogingen));
    };
  }
  function stuur(obj){ if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }
  setInterval(function(){ if (ws && ws.readyState === 1) ws.send('ping'); }, 25000);

  function wachtTekst(aantal){
    if (duel){
      var wie = samen() ? 'je maat' : 'je tegenstander';
      if (aantal < 2) return '<b>Wacht op ' + wie + '</b><p>Laat ' + wie + ' naar <strong>' + location.host.replace(/^www\./, '') + '/q</strong> gaan en deze code invullen:</p>' +
        '<span class="code">' + code + '</span><p>' + (samen() ? 'Jullie spelen samen in een arena; het begint vanzelf zodra hij er is.' : 'Het duel begint vanzelf zodra hij er is.') + '</p><button type="button">Toch niet</button>';
      return '<b>' + (samen() ? 'Je maat is er' : 'Je tegenstander is er') + '</b><p>Het begint zo…</p>';
    }
    return '<b>Wacht tot de docent start</b><p>Je doet mee als <strong>' + schoon(naam) + '</strong>' + (aantal ? ', met ' + (aantal - 1) + ' ' + (aantal === 2 ? 'ander' : 'anderen') : '') + '. Zodra het bord op start drukt, begint het bij iedereen tegelijk.</p>';
  }
  function bericht(m){
    if (m.t === 'welkom'){
      if (m.spel !== 'strijd'){ hudTekst('Samen spelen', 'deze code hoort bij een ander spel', true); sluierTekst('<b>Deze code hoort bij een ander spel.</b><button type="button">Terug</button>'); return; }
      duel = !!m.duel; gastheer = m.gastheer || null;
      var aantal = m.spelers ? m.spelers.length : 0;
      (m.spelers || []).forEach(function(r){ if (r.sid !== mijnSid) maatNaam = r.naam; });
      hudTekst((duel ? 'Duel ' : 'Klasstrijd ') + code, aantal + ' in de kamer', true);
      if (m.fase === 'bezig') start();
      else if (m.fase === 'einde') sluierWeg();
      else if (m.fase === 'aftellen') aftellen(3);
      else sluierTekst(wachtTekst(aantal));
      return;
    }
    if (m.t === 'aftellen'){ aftellen(m.s || 3); return; }
    if (m.t === 'start'){ start(); return; }
    if (m.t === 'net'){ if (hooks && hooks.net) hooks.net(m.d); return; }
    if (m.t === 'stand'){ if (m.tegen && m.tegen.naam){ maatNaam = m.tegen.naam; if (hooks && hooks.maatNaam) hooks.maatNaam(maatNaam); } toonStand(m); return; }
    if (m.t === 'aanval'){
      if (!gestart || klaarMet || !hooks) return;
      var n = Math.max(1, Math.min(5, m.n | 0));
      hooks.aanval(n, m.van);
      zeg((m.van || 'Iemand') + ' stuurt je ' + n + (n === 1 ? ' extra fout!' : ' extra fouten!'));
      return;
    }
    if (m.t === 'einde'){
      klaarMet = true; dicht = true;
      var j = m.jouw, lijst = m.stand || [];
      if (samen()){
        var mij = lijst.filter(function(r){ return r.sid === mijnSid; })[0];
        hudTekst('Samen tot ronde ' + (mij ? mij.ronde : '?') + ' gekomen', maatNaam ? 'met ' + maatNaam : '', false);
        zeg('Jullie zijn allebei gevallen. Samen tot ronde ' + (mij ? mij.ronde : '?') + '.', true);
      } else if (duel){
        var winnaar = lijst[0], ander = lijst.filter(function(r){ return r.sid !== mijnSid; })[0];
        var gewonnen = !!(winnaar && winnaar.sid === mijnSid);
        hudTekst(gewonnen ? 'Je hebt het duel gewonnen!' : (winnaar ? winnaar.naam + ' heeft gewonnen' : 'Het duel is voorbij'),
          ander ? ander.naam + ' kwam tot ronde ' + ander.ronde : '', false);
        zeg(gewonnen ? 'Gewonnen! Je tegenstander is gevallen.' : 'Verloren. ' + (winnaar ? winnaar.naam + ' hield het langer vol.' : ''), gewonnen);
      } else {
        hudTekst('Klasstrijd afgelopen', j ? 'jij werd ' + j.rang + 'e van ' + j.van : '', false);
      }
      sluierWeg();
      if (ws){ try { ws.close(1000, 'klaar'); } catch (e){} }
      return;
    }
  }
  var telKlok = null;
  function aftellen(s){
    if (gestart) return;
    clearInterval(telKlok);
    var over = s;
    var tik = function(){
      if (gestart){ clearInterval(telKlok); return; }
      sluierTekst('<b>Het begint over</b><div class="tel">' + Math.max(1, over) + '</div><p>' + (samen() ? 'Samen in een arena: dek elkaar, en wie neergaat staat de volgende ronde weer op.' : 'Vijf goed op rij stuurt een fout naar je tegenstander.') + '</p>');
      over--;
      if (over < 0) clearInterval(telKlok);
    };
    tik(); telKlok = setInterval(tik, 1000);
  }
  function start(){
    if (gestart) return;
    gestart = true;
    clearInterval(telKlok);
    sluierWeg();
    hudTekst((duel ? 'Duel ' : 'Klasstrijd ') + code, 'gestart, veel succes', false);
    if (hooks) hooks.start({ duel:duel, rol:duel ? (gastheer === mijnSid ? 'host' : 'gast') : null, maat:maatNaam });
    zeg(samen() ? 'Start! Samen tegen de fouten, met ' + (maatNaam || 'je maat') + '.' : 'Start! Vijf goed op rij stuurt fouten naar ' + (duel ? 'je tegenstander' : 'de anderen') + '.', true);
  }
  function toonStand(m){
    if (klaarMet) return;
    var aantal = m.jouw ? m.jouw.van : 0;
    if (!gestart){
      if (m.fase === 'lobby') sluierTekst(wachtTekst(aantal));
      hudTekst((duel ? 'Duel ' : 'Klasstrijd ') + code, aantal + ' in de kamer, wacht op de start', true);
      return;
    }
    if (duel){
      tegen = m.tegen || null;
      hudTekst(tegen ? (samen() ? 'Samen met ' : 'Tegen ') + schoon(tegen.naam) : 'Duel ' + code,
        tegen ? (tegen.af ? tegen.naam + ' is gevallen in ronde ' + tegen.ronde : 'ronde ' + tegen.ronde + ' · ' + tegen.leven + ' levens' + (tegen.aan ? '' : ' · even weg')) : 'wacht op je tegenstander', false);
      return;
    }
    var j = m.jouw;
    hudTekst('Klasstrijd: ' + (j ? j.rang + 'e van ' + j.van : '…'),
      m.bezig + ' nog in het spel' + (m.koploper ? ' · ' + m.koploper.naam + ' ronde ' + m.koploper.ronde : ''), false);
  }
  /* om de paar seconden de stand doorgeven, en meteen als hij verandert */
  setInterval(function(){
    if (!actief || !gestart || klaarMet || !hooks) return;
    var s = hooks.stand();
    var sleutel = JSON.stringify(s);
    if (sleutel === laatsteStand) return;
    laatsteStand = sleutel;
    stuur({ t:'stand', ronde:s.ronde | 0, gehaald:s.gehaald | 0, leven:s.leven | 0, punten:s.punten | 0 });
  }, 2000);
  var laatsteAanval = 0;

  /* ======================================================================
     2. het duelblok op het startscherm
     ====================================================================== */
  function duelBlok(doelId, spel, keuze){
    var doel = document.getElementById(doelId);
    if (!doel || actief) return;
    var samenSpel = spel === 'zwaard';
    doel.innerHTML = '<div class="duelvak"><h3>' + (samenSpel ? 'Samen met een vriend' : 'Tegen een vriend') + '</h3>' +
      '<p>' + (samenSpel
        ? 'Jullie staan samen in één arena, allebei op je eigen scherm, tegen dezelfde fouten. Wie neergaat staat de volgende ronde weer op; pas als jullie allebei liggen is het voorbij.'
        : 'Jullie spelen allebei op je eigen scherm, tegelijk. Vijf goed op rij stuurt een extra fout naar de ander. Wie het langst overleeft wint.') + '</p>' +
      '<div class="rij"><input type="text" id="duelNaam" maxlength="16" placeholder="Je bijnaam" autocomplete="nickname" value="' + schoon(bewaardeNaam()) + '">' +
      '<button type="button" id="duelMaak">' + (samenSpel ? 'Maak een kamer' : 'Maak een duel') + '</button></div>' +
      '<div class="rij" style="margin-top:8px"><input type="text" class="code" id="duelCode" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off">' +
      '<button type="button" class="los" id="duelDoe">Doe mee met een code</button></div>' +
      '<div class="fout" id="duelFout"></div></div>';
    var fout = document.getElementById('duelFout');
    function naamUit(){
      var n = document.getElementById('duelNaam').value.trim().slice(0, 16);
      if (!n){ fout.textContent = 'Vul eerst een bijnaam in.'; return null; }
      if (!naamOk(n)){ fout.textContent = NAAMFOUT; return null; }
      bewaarNaam(n); fout.textContent = ''; return n;
    }
    document.getElementById('duelMaak').addEventListener('click', function(){
      var n = naamUit(); if (!n) return;
      var k = keuze();
      if (!k || !k.vak){ fout.textContent = 'Kies eerst een vak.'; return; }
      var knop = this; knop.disabled = true;
      fetch('/api/kamer', { method:'POST', headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ spel:'strijd', duel:true, game:spel, vak:k.vak, niveau:k.niveau }) })
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
      .then(function(x){
        knop.disabled = false;
        if (!x.ok){ fout.textContent = x.j.fout || 'Het lukte niet om een duel te maken.'; return; }
        location.href = spel + '.html?vak=' + encodeURIComponent(k.vak) + '&n=' + encodeURIComponent(k.niveau) + '&kamer=' + x.j.code + '&naam=' + encodeURIComponent(n);
      })
      .catch(function(){ knop.disabled = false; fout.textContent = 'Geen verbinding met de server.'; });
    });
    document.getElementById('duelDoe').addEventListener('click', function(){
      var n = naamUit(); if (!n) return;
      var c = document.getElementById('duelCode').value.toUpperCase().replace(/[^A-Z]/g, '');
      if (c.length !== 4){ fout.textContent = 'De code is vier letters.'; return; }
      var knop = this; knop.disabled = true;
      fetch('/api/kamer/' + c).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
      .then(function(x){
        knop.disabled = false;
        if (!x.ok){ fout.textContent = x.j.fout || 'Geen kamer met deze code.'; return; }
        if (x.j.spel !== 'strijd'){ location.href = 'klasquiz.html?k=' + c; return; }
        if (x.j.fase === 'einde'){ fout.textContent = 'Dit potje is al afgelopen.'; return; }
        location.href = x.j.game + '.html?vak=' + encodeURIComponent(x.j.vak) + '&n=' + encodeURIComponent(x.j.niveau) + '&kamer=' + c + '&naam=' + encodeURIComponent(n);
      })
      .catch(function(){ knop.disabled = false; fout.textContent = 'Geen verbinding met de server.'; });
    });
    document.getElementById('duelCode').addEventListener('keydown', function(e){ if (e.key === 'Enter') document.getElementById('duelDoe').click(); });
  }

  /* ======================================================================
     3. het klassement van de hele site
     ====================================================================== */
  var klassement = {
    /* de top tien tekenen; id markeert je eigen rij; metVorm voegt het invulvak toe */
    toon: function(doelId, spel, id, vorm){
      var doel = document.getElementById(doelId);
      if (!doel) return;
      doel.className = 'sitelijst';
      doel.innerHTML = '<h3>Klassement van de hele site</h3>' + (vorm ? vorm : '') + '<div class="leeg">Laden…</div>';
      fetch('/api/klassement/' + spel).then(function(r){ return r.json(); }).then(function(j){
        var lijst = (j.lijst || []).slice(0, 10);
        var html = '<h3>Klassement van de hele site</h3>' + (vorm ? vorm : '');
        if (!lijst.length) html += '<div class="leeg">Nog niemand. Wie het eerst speelt, staat bovenaan.</div>';
        lijst.forEach(function(r){
          html += '<div class="rij' + (id && r.id === id ? ' jij' : '') + '"><span class="nr">' + r.plek + '</span>' +
            '<span><b>' + schoon(r.naam) + '</b><small>' + [r.waar, r.niveau, r.vak].filter(Boolean).map(schoon).join(' · ') + (r.t ? ' · ' + new Date(r.t).toLocaleDateString('nl-NL') : '') + '</small></span>' +
            '<span class="pt">' + r.ronde + ' rondes</span></div>';
        });
        doel.innerHTML = html;
      }).catch(function(){ doel.innerHTML = '<h3>Klassement van de hele site</h3><div class="leeg">Nu even niet bereikbaar.</div>'; });
    },
    /* een score insturen; geeft een belofte met { plek, id } of { fout } */
    zet: function(spel, g){
      if (!naamOk(g.naam)) return Promise.resolve({ fout: NAAMFOUT });
      bewaarNaam(g.naam);
      return fetch('/api/klassement/' + spel, { method:'POST', headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ naam:g.naam, ronde:g.ronde, punten:g.punten, waar:g.waar, niveau:g.niveau, vak:g.vak, sid:sid() }) })
      .then(function(r){ return r.json(); })
      .catch(function(){ return { fout:'Geen verbinding met de server.' }; });
    },
    /* het invulvak voor het eindscherm: naam, knop, hint, en daarna de lijst met je eigen rij */
    vorm: function(doelId, spel, gegevens){
      var html = '<p class="hint">Zet je score in het klassement van de hele site.</p><div class="naamrij"><input type="text" id="siteNaam" maxlength="16" placeholder="Je bijnaam" value="' + schoon(bewaardeNaam()) + '"><button type="button" id="siteZet">Insturen</button></div><p class="hint" id="siteHint"></p>';
      klassement.toon(doelId, spel, null, html);
      /* de knop bestaat pas na het laden; daarom via de container luisteren */
      var doel = document.getElementById(doelId);
      doel.addEventListener('click', function(e){
        if (!e.target || e.target.id !== 'siteZet') return;
        var n = document.getElementById('siteNaam').value.trim().slice(0, 16), hint = document.getElementById('siteHint');
        if (!n){ hint.textContent = 'Vul een bijnaam in.'; return; }
        if (!naamOk(n)){ hint.textContent = NAAMFOUT; return; }
        e.target.disabled = true;
        klassement.zet(spel, Object.assign({ naam:n }, gegevens())).then(function(j){
          if (j.fout){ hint.textContent = j.fout; e.target.disabled = false; return; }
          klassement.toon(doelId, spel, j.id, '<p class="hint">' + (j.plek ? 'Je staat op plek ' + j.plek + ' van de hele site.' : 'Ingestuurd, maar niet in de top honderd.') + '</p>');
        });
      });
    },
    naamOk: naamOk
  };

  return {
    actief: actief,
    code: code,
    naam: naam,
    klaar: function(spel, h){ if (!actief) return; hooks = h; open(); },
    stuurNet: function(d){ if (actief && gestart && !klaarMet) stuur({ t:'net', d:d }); },
    reeks: function(reeks){
      if (!actief || !gestart || klaarMet || samen() || !reeks || reeks % 5) return;
      var nu = Date.now();
      if (nu - laatsteAanval < 4000) return;
      laatsteAanval = nu;
      var n = Math.min(4, 1 + Math.floor(reeks / 10));
      stuur({ t:'aanval', n:n });
      zeg(reeks + ' goed op rij: je stuurt ' + n + (n === 1 ? ' fout' : ' fouten') + ' naar ' + (duel ? 'je tegenstander' : 'de anderen') + '!', true);
    },
    af: function(uit){
      if (!actief || !gestart || klaarMet) return;
      klaarMet = true;
      stuur({ t:'af', ronde:(uit && uit.ronde) | 0, punten:(uit && uit.punten) | 0 });
      hudTekst(duel ? 'Je bent gevallen' : 'Klasstrijd ' + code, duel ? 'de uitslag komt zo' : 'je bent af, de anderen spelen nog; de eindstand komt op het bord', false);
    },
    duelBlok: duelBlok,
    klassement: klassement,
    naamOk: naamOk
  };
})();
