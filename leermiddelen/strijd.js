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
    '#strijdSluier ul.lobby{list-style:none;margin:10px 0;padding:0;display:grid;gap:4px;text-align:left}' +
    '#strijdSluier ul.lobby li{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;background:#f4f7ff;border-radius:10px;padding:6px 10px;font-size:.9rem}' +
    '#strijdSluier ul.lobby li em{font-style:normal;color:#5b6480;font-size:.8rem}#strijdSluier ul.lobby li i{font-style:normal;font-size:.72rem;font-weight:600;color:#c0442c}#strijdSluier ul.lobby li.klaar i{color:#2f7d52}' +
    '#strijdSluier p.kop{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#5b6480;margin:8px 0 4px;font-weight:600}' +
    '#strijdSluier .stijlen{display:grid;gap:6px;margin-bottom:8px}' +
    '#strijdSluier .stijlen button{display:block;width:100%;text-align:left;background:#fff;border:2px solid rgba(20,34,76,.12);border-radius:14px;padding:8px 12px;margin:0;color:#14224C;font:inherit}' +
    '#strijdSluier .stijlen button b{display:block;font-size:.92rem;margin:0}#strijdSluier .stijlen button small{display:block;font-size:.74rem;color:#5b6480;line-height:1.3}' +
    '#strijdSluier .stijlen button.aan{border-color:#204ECF;background:#204ECF;color:#fff}#strijdSluier .stijlen button.aan small{color:rgba(255,255,255,.85)}#strijdSluier .stijlen button.aan em{font-style:normal;font-size:.72rem;font-weight:600;background:#fff;color:#204ECF;border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:middle}#strijdSluier .stijlen button:disabled{opacity:.7}' +
    '#strijdSluier button.crab{background:#F26749;color:#fff;border-color:#F26749}#strijdSluier button.stil{background:#fff;color:#14224C;border:2px solid rgba(20,34,76,.15)}' +
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
    donkerRegels(':root[data-theme="dark"] ', '.duelvak,.sitelijst .rij,.duelvak input,.sitelijst .naamrij input,.duelvak button.los{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.14)}.sitelijst .rij.jij{background:#3a3220;border-color:#EFC64A}.duelvak p,.sitelijst .rij small,.sitelijst .leeg,.sitelijst .hint,.sitelijst .rij .nr{color:#B3BBD0}.duelvak h3,.sitelijst h3{color:#F3EFE9}#strijdSluier>div{background:#182652;color:#F3EFE9}#strijdSluier p{color:#B3BBD0}#strijdSluier button{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.2)}#strijdSluier .stijlen button{background:#1f2f5e;color:#F3EFE9}#strijdSluier .stijlen button b{color:#F3EFE9}#strijdSluier .stijlen button.aan{background:#204ECF;color:#fff;border-color:#204ECF}#strijdSluier .stijlen button.aan b{color:#fff}#strijdSluier ul.lobby li{background:#1f2f5e;color:#F3EFE9}#strijdSluier button.crab{background:#F26749;color:#fff;border-color:#F26749}#strijdSluier p.kop{color:#B3BBD0}') +
    '@media(prefers-color-scheme:dark){' + donkerRegels(':root:not([data-theme="light"]) ', '.duelvak,.sitelijst .rij,.duelvak input,.sitelijst .naamrij input,.duelvak button.los{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.14)}.sitelijst .rij.jij{background:#3a3220;border-color:#EFC64A}.duelvak p,.sitelijst .rij small,.sitelijst .leeg,.sitelijst .hint,.sitelijst .rij .nr{color:#B3BBD0}.duelvak h3,.sitelijst h3{color:#F3EFE9}#strijdSluier>div{background:#182652;color:#F3EFE9}#strijdSluier p{color:#B3BBD0}#strijdSluier button{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.2)}#strijdSluier .stijlen button{background:#1f2f5e;color:#F3EFE9}#strijdSluier .stijlen button b{color:#F3EFE9}#strijdSluier .stijlen button.aan{background:#204ECF;color:#fff;border-color:#204ECF}#strijdSluier .stijlen button.aan b{color:#fff}#strijdSluier ul.lobby li{background:#1f2f5e;color:#F3EFE9}#strijdSluier button.crab{background:#F26749;color:#fff;border-color:#F26749}#strijdSluier p.kop{color:#B3BBD0}') + '}';
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
  var hud, toast, sluier, toastKlok = null, mijnSid = sid(), mijnPid = null;   /* mijnPid: het openbare nummer dat de kamer me geeft */
  var ws = null, dicht = false, pogingen = 0, hooks = null, gestart = false, klaarMet = false, laatsteStand = '', duel = false, tegen = null, gastheer = null, maatNaam = '', maatAv = '', maten = [], maxSamen = 2;
  /* de lobby van Zwaardvechter samen: mijn stijl en of ik klaar ben */
  var mijnStijl = '', mijnKlaar = false;
  function stuurLobby(){ stuur({ t:'lobby', stijl:mijnStijl, klaar:mijnKlaar }); }
  function samen(){ return duel && hooks && hooks.samen; }

  function zeg(tekst, goed){
    if (!toast) return;
    toast.textContent = tekst; toast.className = 'aan' + (goed ? ' goed' : '');
    clearTimeout(toastKlok); toastKlok = setTimeout(function(){ toast.className = ''; }, 2600);
  }
  function hudTekst(kop, onder, wacht){ if (!hud) return; hud.innerHTML = kop + (onder ? '<small>' + onder + '</small>' : ''); hud.className = wacht ? 'wacht' : ''; }
  function sluierTekst(html){
    if (!sluier) return;
    sluier.innerHTML = '<div>' + html + '</div>';
    /* de knop 'Toch niet' sluit de kamer; een knop met data-start geeft het startsein */
    Array.prototype.forEach.call(sluier.querySelectorAll('button'), function(k){
      k.addEventListener('click', function(){
        if (k.getAttribute('data-start')){ k.disabled = true; stuur({ t:'start' }); return; }
        if (k.getAttribute('data-stijl')){ mijnStijl = k.getAttribute('data-stijl'); if (hooks && hooks.lobby) hooks.lobby.kies(mijnStijl); stuurLobby(); sluierTekst(wachtTekst(maten.length + 1)); return; }
        if (k.getAttribute('data-klaar')){ mijnKlaar = !mijnKlaar; stuurLobby(); sluierTekst(wachtTekst(maten.length + 1)); return; }
        stuur({ t:'stop' }); location.href = location.pathname;
      });
    });
  }
  function namen(lijst){ var n = lijst.map(function(r){ return schoon(r.naam); }); return n.length <= 1 ? n.join('') : n.slice(0, -1).join(', ') + ' en ' + n[n.length - 1]; }
  function sluierWeg(){ if (sluier && sluier.parentNode) sluier.parentNode.removeChild(sluier); sluier = null; }

  if (actief){
    hud = document.createElement('div'); hud.id = 'strijdHud'; hud.className = 'wacht'; hud.innerHTML = 'Verbinden…';
    toast = document.createElement('div'); toast.id = 'strijdToast';
    sluier = document.createElement('div'); sluier.id = 'strijdSluier';
    /* de start kan al binnen zijn voordat de pagina klaar is; dan is de sluier al weg */
    document.addEventListener('DOMContentLoaded', function(){ [hud, toast, sluier].forEach(function(el){ if (el && !el.parentNode) document.body.appendChild(el); }); });
    sluierTekst('<b>Verbinden met kamer ' + code + '…</b>');
  }

  function open(){
    if (dicht || !actief) return;
    var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var s = new WebSocket(proto + location.host + '/ws/' + code + '?rol=speler&sid=' + encodeURIComponent(mijnSid) + '&naam=' + encodeURIComponent(naam) + '&av=' + encodeURIComponent(window.PROFIEL ? PROFIEL.avatar() : ''));
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

  /* de lobby met stijlkeuze: wie er is, wat hij koos, wie klaar is; de maker start als iedereen klaar is */
  function lobbyTekst(aantal){
    var L = hooks.lobby, ikMaak = gastheer === mijnPid;
    if (!mijnStijl) mijnStijl = L.huidig();
    function stijlNaam(id){ var x = L.stijlen.filter(function(y){ return y.id === id; })[0]; return x ? x.naam : 'nog geen stijl'; }
    var rij = [{ naam:naam + ' (jij)', stijl:mijnStijl, klaar:mijnKlaar }].concat(maten).map(function(r){
      return '<li' + (r.klaar ? ' class="klaar"' : '') + '><span>' + schoon(r.naam) + '</span><em>' + schoon(stijlNaam(r.stijl)) + '</em><i>' + (r.klaar ? 'klaar' : 'kiest nog') + '</i></li>';
    }).join('');
    var keuze = '<div class="stijlen">' + L.stijlen.map(function(x){ var aan = mijnStijl === x.id; return '<button type="button" data-stijl="' + x.id + '"' + (aan ? ' class="aan"' : '') + (mijnKlaar ? ' disabled' : '') + '><b>' + (aan ? '\u2713 ' : '') + x.naam + (aan ? ' <em>gekozen</em>' : '') + '</b><small>' + x.uit + '</small></button>'; }).join('') + '</div>';
    var alleKlaar = mijnKlaar && maten.every(function(r){ return r.klaar; });
    var uitleg = '<p>Laat je vrienden naar <strong>' + location.host.replace(/^www\./, '') + '/q</strong> gaan en deze code invullen:</p><span class="code">' + code + '</span>';
    var knoppen = '<button type="button" data-klaar="1" class="' + (mijnKlaar ? 'stil' : 'crab') + '">' + (mijnKlaar ? 'Toch nog iets veranderen' : 'Klaar als ' + stijlNaam(mijnStijl).toLowerCase() + '!') + '</button> ';
    if (ikMaak) knoppen += '<button type="button" data-start="1"' + (aantal >= 2 && alleKlaar ? '' : ' disabled') + '>Start met z\'n ' + (aantal <= 2 ? 'tweeën' : aantal === 3 ? 'drieën' : 'vieren') + '</button> ';
    knoppen += '<button type="button">Toch niet</button>';
    var status = aantal < 2 ? 'Zodra er twee zijn en iedereen klaar is, kan het beginnen; met vier begint het vanzelf.'
      : alleKlaar ? (ikMaak ? 'Iedereen is klaar. Druk op start.' : 'Iedereen is klaar; de maker van de kamer start.')
      : 'Het begint als iedereen op Klaar heeft gedrukt' + (ikMaak ? ' en jij start' : '') + '.';
    return '<b>' + (aantal < 2 ? 'Wacht op je vrienden' : aantal + ' in de kamer') + '</b>' + uitleg + '<ul class="lobby">' + rij + '</ul>' +
      '<p class="kop">Stap 1: kies je stijl</p>' + keuze +
      '<p class="kop">Stap 2: druk op Klaar</p><p>' + (mijnKlaar ? 'Je staat klaar als <strong>' + stijlNaam(mijnStijl) + '</strong>. ' : 'Je speelt als <strong>' + stijlNaam(mijnStijl) + '</strong>; druk op Klaar als dat goed is. ') + status + '</p>' + knoppen;
  }
  function wachtTekst(aantal){
    if (duel && maxSamen > 2 && hooks && hooks.lobby) return lobbyTekst(aantal);
    if (duel && maxSamen > 2){
      /* samen met twee, drie of vier: de maker start zodra er minstens twee zijn; vol begint het vanzelf */
      var ikMaak = gastheer === mijnPid, erbij = maten.length ? '<p>Al in de kamer: <strong>' + namen(maten) + '</strong>.</p>' : '';
      var uitleg = '<p>Laat je vrienden naar <strong>' + location.host.replace(/^www\./, '') + '/q</strong> gaan en deze code invullen:</p><span class="code">' + code + '</span>' + erbij;
      if (aantal < 2) return '<b>Wacht op je vrienden</b>' + uitleg + '<p>Tot vier in een arena. Zodra er twee zijn kan het beginnen; met vier begint het vanzelf.</p><button type="button">Toch niet</button>';
      if (ikMaak) return '<b>' + aantal + ' in de kamer</b>' + uitleg + '<p>Nog iemand erbij, of nu beginnen? Met vier begint het vanzelf.</p><button type="button" data-start="1">Start met z\'n ' + (aantal === 2 ? 'tweeën' : aantal === 3 ? 'drieën' : 'vieren') + '</button> <button type="button">Toch niet</button>';
      return '<b>' + aantal + ' in de kamer</b>' + uitleg + '<p>Wacht tot de maker van de kamer start, of tot de kamer vol is.</p><button type="button">Toch niet</button>';
    }
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
      duel = !!m.duel; gastheer = m.gastheer || null; if (m.max) maxSamen = m.max;
      if (m.jij) mijnPid = m.jij;
      var aantal = m.spelers ? m.spelers.length : 0;
      maten = (m.spelers || []).filter(function(r){ return r.sid !== mijnPid; }).map(function(r){ return { sid:r.sid, naam:r.naam, av:r.av || '' }; });
      (m.spelers || []).forEach(function(r){ if (r.sid !== mijnPid){ maatNaam = r.naam; maatAv = r.av || ''; } });
      hudTekst((duel ? 'Duel ' : 'Klasstrijd ') + code, aantal + ' in de kamer', true);
      if (m.fase === 'bezig') start(m);
      else if (m.fase === 'einde') sluierWeg();
      else if (m.fase === 'aftellen') aftellen(3);
      else {
        /* in de lobby: mijn stijl alvast melden, zodat de anderen hem zien */
        if (hooks && hooks.lobby){ if (!mijnStijl) mijnStijl = hooks.lobby.huidig(); mijnKlaar = false; stuurLobby(); }
        sluierTekst(wachtTekst(aantal));
      }
      return;
    }
    if (m.t === 'lobby'){
      maten = (m.spelers || []).filter(function(r){ return r.sid !== mijnPid; });
      if (!gestart) sluierTekst(wachtTekst(maten.length + 1));
      return;
    }
    if (m.t === 'aftellen'){ aftellen(m.s || 3); return; }
    if (m.t === 'start'){ start(m); return; }
    if (m.t === 'net'){ if (hooks && hooks.net) hooks.net(m.d); return; }
    if (m.t === 'stand'){
      if (m.max) maxSamen = m.max;
      if (m.maten) maten = m.maten;
      if (m.tegen && m.tegen.naam){ maatNaam = m.tegen.naam; maatAv = m.tegen.av || maatAv; if (hooks && hooks.maatNaam) hooks.maatNaam(maatNaam, maatAv); }
      toonStand(m); return;
    }
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
        var mij = lijst.filter(function(r){ return r.sid === mijnPid; })[0], anderen = lijst.filter(function(r){ return r.sid !== mijnPid; });
        hudTekst('Samen tot ronde ' + (mij ? mij.ronde : '?') + ' gekomen', anderen.length ? 'met ' + namen(anderen) : '', false);
        zeg((anderen.length > 1 ? 'Jullie zijn allemaal gevallen.' : 'Jullie zijn allebei gevallen.') + ' Samen tot ronde ' + (mij ? mij.ronde : '?') + '.', true);
      } else if (duel){
        var winnaar = lijst[0], ander = lijst.filter(function(r){ return r.sid !== mijnPid; })[0];
        var gewonnen = !!(winnaar && winnaar.sid === mijnPid);
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
  function start(m){
    /* de kamer heeft de motor opnieuw opgebouwd: de pagina stuurt zijn uitrusting of keuze terug */
    if (gestart){ if (m && m.herstel && hooks && hooks.herstel) hooks.herstel(); return; }
    gestart = true;
    clearInterval(telKlok);
    sluierWeg();
    hudTekst((duel ? 'Duel ' : 'Klasstrijd ') + code, 'gestart, veel succes', false);
    /* de kamer zegt wie speler 0, 1, 2, 3 is (de volgorde van de motor) */
    var mij = m && typeof m.mij === 'number' && m.mij >= 0 ? m.mij : (gastheer === mijnPid ? 0 : 1);
    var lijst = m && m.spelers ? m.spelers : null;
    if (lijst) maten = lijst.filter(function(r){ return r.sid !== mijnPid; }).map(function(r){ return { sid:r.sid, naam:r.naam, av:r.av || '' }; });
    if (hooks) hooks.start({ duel:duel, rol:duel ? (gastheer === mijnPid ? 'host' : 'gast') : null, mij:mij, spelers:lijst, maat:maatNaam, maatAv:maatAv });
    zeg(samen() ? 'Start! Samen tegen de fouten, met ' + (maten.length ? namen(maten) : (maatNaam || 'je maat')) + '.' : 'Start! Vijf goed op rij stuurt fouten naar ' + (duel ? 'je tegenstander' : 'de anderen') + '.', true);
  }
  function toonStand(m){
    if (klaarMet) return;
    var aantal = m.jouw ? m.jouw.van : 0;
    if (!gestart){
      if (m.fase === 'lobby') sluierTekst(wachtTekst(aantal));
      hudTekst((duel ? 'Duel ' : 'Klasstrijd ') + code, aantal + ' in de kamer, wacht op de start', true);
      return;
    }
    if (duel && samen() && maten.length > 1){
      hudTekst('Samen met ' + namen(maten), maten.map(function(r){ return schoon(r.naam) + (r.af ? ' gevallen' : ' ronde ' + r.ronde) + (r.aan === false ? ' (even weg)' : ''); }).join(' · '), false);
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
    var samenSpel = true, bord = spel === 'toren';
    doel.innerHTML = '<div class="duelvak"><h3>' + (bord ? 'Samen met een vriend' : 'Samen met vrienden') + '</h3>' +
      '<p>' + (bord
        ? 'Jullie bouwen samen op hetzelfde bord, allebei op je eigen scherm, en verdedigen dezelfde school. Munten, levens en torens zijn van jullie samen; elk goed antwoord van allebei vult de kas.'
        : 'Met twee, drie of vier in één arena, ieder op zijn eigen scherm, tegen dezelfde fouten. Meer spelers, meer fouten en een taaiere baas. Wie neergaat staat de volgende ronde weer op; pas als iedereen ligt is het voorbij.') + '</p>' +
      '<div class="rij"><input type="text" id="duelNaam" aria-label="Je bijnaam" maxlength="16" placeholder="Je bijnaam" autocomplete="nickname" value="' + schoon(bewaardeNaam()) + '">' +
      '<button type="button" id="duelMaak">' + (samenSpel ? 'Maak een kamer' : 'Maak een duel') + '</button></div>' +
      '<div class="rij" style="margin-top:8px"><input type="text" class="code" id="duelCode" aria-label="Code van je vriend" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off">' +
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
        body: JSON.stringify({ spel:'strijd', duel:true, game:spel, vak:k.vak, niveau:k.niveau, deel:(k.deel || []).join(',') }) })
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); })
      .then(function(x){
        knop.disabled = false;
        if (!x.ok){ fout.textContent = x.j.fout || 'Het lukte niet om een duel te maken.'; return; }
        location.href = spel + '.html?vak=' + encodeURIComponent(k.vak) + '&n=' + encodeURIComponent(k.niveau) + ((k.deel || []).length ? '&deel=' + encodeURIComponent(k.deel.join(',')) : '') + '&kamer=' + x.j.code + '&naam=' + encodeURIComponent(n);
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
        location.href = x.j.game + '.html?vak=' + encodeURIComponent(x.j.vak) + '&n=' + encodeURIComponent(x.j.niveau) + (x.j.deel ? '&deel=' + encodeURIComponent(x.j.deel) : '') + '&kamer=' + c + '&naam=' + encodeURIComponent(n);
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
            '<span class="avrij">' + (window.AVATAR ? AVATAR.svg(r.naam, 34, r.av) : '') + '<span><b>' + schoon(r.naam) + '</b><small>' + [r.waar, r.niveau, r.vak].filter(Boolean).map(schoon).join(' · ') + (r.t ? ' · ' + new Date(r.t).toLocaleDateString('nl-NL') : '') + '</small></span></span>' +
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
