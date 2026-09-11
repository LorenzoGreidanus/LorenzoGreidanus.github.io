/* De Klasstrijd, de kant van de speler.

   Torenverdediging en Zwaardvechter spelen ieder op hun eigen bord of arena;
   dit script hangt zo'n spel aan een kamer op de server. Het stuurt om de
   paar seconden de stand (ronde, levens, punten) naar de kamer, laat de
   docent de partij starten, en zet aanvallen van klasgenoten om in extra
   fouten. Het spel zelf roept drie dingen aan:

     STRIJD.klaar(spel, { start:fn, stand:fn, aanval:fn(n, van) })
     STRIJD.reeks(reeks)          na elk antwoord
     STRIJD.af({ ronde, punten }) als het spel voorbij is

   Zonder ?kamer=CODE in het adres doet dit script niets en is window.STRIJD
   null, dus een gewoon potje merkt er niets van. */
window.STRIJD = (function(){
  'use strict';
  function param(naam){ var m = new RegExp('[?&]' + naam + '=([^&#]+)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }
  var code = (param('kamer') || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (code.length !== 4) return null;

  var naam = param('naam') || '';
  try { if (!naam) naam = localStorage.getItem('lg-quiz-naam') || ''; } catch (e){}
  naam = naam.trim().slice(0, 16) || 'Leerling';
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

  /* ---------- het balkje in beeld ---------- */
  var css = '#strijdHud{position:fixed;left:12px;bottom:12px;z-index:90;background:#14224C;color:#fff;border-radius:14px;padding:9px 13px;' +
    'font:600 .82rem/1.3 Poppins,system-ui,sans-serif;box-shadow:0 10px 24px rgba(20,34,76,.25);max-width:min(92vw,340px)}' +
    '#strijdHud small{display:block;font-weight:500;opacity:.8}' +
    '#strijdHud.wacht{background:#204ECF}' +
    '#strijdToast{position:fixed;left:50%;top:16px;transform:translate(-50%,-30px);z-index:91;background:#F26749;color:#fff;border-radius:999px;' +
    'padding:10px 18px;font:600 .9rem/1.2 Poppins,system-ui,sans-serif;box-shadow:0 10px 24px rgba(20,34,76,.25);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;max-width:92vw;text-align:center}' +
    '#strijdToast.aan{opacity:1;transform:translate(-50%,0)}' +
    '#strijdToast.goed{background:#2f7d52}' +
    '#strijdSluier{position:fixed;inset:0;z-index:89;background:rgba(20,34,76,.55);display:grid;place-items:center;padding:20px}' +
    '#strijdSluier div{background:#fff;color:#14224C;border-radius:22px;padding:26px 28px;text-align:center;max-width:420px;font-family:Poppins,system-ui,sans-serif}' +
    '#strijdSluier b{display:block;font-size:1.4rem;margin-bottom:6px}' +
    '#strijdSluier p{margin:0;color:#5b6480}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var hud = document.createElement('div'); hud.id = 'strijdHud'; hud.className = 'wacht';
  hud.innerHTML = 'Klasstrijd ' + code + '<small>verbinden…</small>';
  var toast = document.createElement('div'); toast.id = 'strijdToast';
  var sluier = document.createElement('div'); sluier.id = 'strijdSluier';
  sluier.innerHTML = '<div><b>Wacht tot de docent start</b><p>Je doet mee als <strong>' + naam.replace(/[<>&]/g, '') + '</strong>. Zodra het bord op start drukt, begint het bij iedereen tegelijk.</p></div>';
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(hud); document.body.appendChild(toast); document.body.appendChild(sluier); });
  var toastKlok = null;
  function zeg(tekst, goed){
    toast.textContent = tekst; toast.className = 'aan' + (goed ? ' goed' : '');
    clearTimeout(toastKlok); toastKlok = setTimeout(function(){ toast.className = ''; }, 2600);
  }
  function hudTekst(kop, onder, wacht){ hud.innerHTML = kop + (onder ? '<small>' + onder + '</small>' : ''); hud.className = wacht ? 'wacht' : ''; }

  /* ---------- verbinding ---------- */
  var ws = null, dicht = false, pogingen = 0, hooks = null, gestart = false, klaarMet = false, laatsteStand = '';
  var mijnSid = sid();
  function open(){
    if (dicht) return;
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
      if (e.code === 1000 && /gesloten|afgelopen|verwijderd|nieuwe kamer/.test(e.reason || '')){ hudTekst('Klasstrijd', e.reason, true); dicht = true; return; }
      pogingen++;
      hudTekst('Klasstrijd ' + code, 'verbinding kwijt, opnieuw proberen…', true);
      setTimeout(open, Math.min(8000, 600 * pogingen));
    };
  }
  function stuur(obj){ if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }
  setInterval(function(){ if (ws && ws.readyState === 1) ws.send('ping'); }, 25000);

  function bericht(m){
    if (m.t === 'welkom'){
      if (m.spel !== 'strijd'){ hudTekst('Klasstrijd', 'deze code hoort bij een ander spel', true); return; }
      hudTekst('Klasstrijd ' + code, (m.spelers ? m.spelers.length : 0) + ' in de kamer, wacht op de start', true);
      if (m.fase === 'bezig') start();
      if (m.fase === 'einde') sluier.remove();
      return;
    }
    if (m.t === 'start'){ start(); return; }
    if (m.t === 'stand'){ toonStand(m); return; }
    if (m.t === 'aanval'){
      if (!gestart || klaarMet || !hooks) return;
      var n = Math.max(1, Math.min(5, m.n | 0));
      hooks.aanval(n, m.van);
      zeg((m.van || 'Iemand') + ' stuurt je ' + n + (n === 1 ? ' extra fout!' : ' extra fouten!'));
      return;
    }
    if (m.t === 'einde'){
      klaarMet = true; dicht = true;
      var j = m.jouw;
      hudTekst('Klasstrijd afgelopen', j ? 'jij werd ' + j.rang + 'e van ' + j.van : '', false);
      sluier.remove();
      if (ws){ try { ws.close(1000, 'klaar'); } catch (e){} }
      return;
    }
  }
  function start(){
    if (gestart) return;
    gestart = true;
    sluier.remove();
    hudTekst('Klasstrijd ' + code, 'gestart, veel succes', false);
    if (hooks) hooks.start();
    zeg('Start! Vijf goed op rij stuurt fouten naar de anderen.', true);
  }
  function toonStand(m){
    if (klaarMet) return;
    if (!gestart){ hudTekst('Klasstrijd ' + code, (m.jouw ? m.jouw.van : 0) + ' in de kamer, wacht op de start', true); return; }
    var j = m.jouw;
    hudTekst('Klasstrijd: ' + (j ? j.rang + 'e van ' + j.van : '…'),
      m.bezig + ' nog in het spel' + (m.koploper ? ' · ' + m.koploper.naam + ' ronde ' + m.koploper.ronde : ''), false);
  }

  /* om de paar seconden de stand doorgeven, en meteen als hij verandert */
  setInterval(function(){
    if (!gestart || klaarMet || !hooks) return;
    var s = hooks.stand();
    var sleutel = JSON.stringify(s);
    if (sleutel === laatsteStand) return;
    laatsteStand = sleutel;
    stuur({ t:'stand', ronde:s.ronde | 0, gehaald:s.gehaald | 0, leven:s.leven | 0, punten:s.punten | 0 });
  }, 2000);

  var laatsteAanval = 0;
  return {
    code: code,
    naam: naam,
    klaar: function(spel, h){ hooks = h; open(); },
    reeks: function(reeks){
      if (!gestart || klaarMet || !reeks || reeks % 5) return;
      var nu = Date.now();
      if (nu - laatsteAanval < 4000) return;
      laatsteAanval = nu;
      var n = Math.min(4, 1 + Math.floor(reeks / 10));
      stuur({ t:'aanval', n:n });
      zeg(reeks + ' goed op rij: je stuurt ' + n + (n === 1 ? ' fout' : ' fouten') + ' naar de anderen!', true);
    },
    af: function(uit){
      if (!gestart || klaarMet) return;
      klaarMet = true;
      stuur({ t:'af', ronde:(uit && uit.ronde) | 0, punten:(uit && uit.punten) | 0 });
      hudTekst('Klasstrijd ' + code, 'je bent af, de anderen spelen nog; de eindstand komt op het bord', false);
    }
  };
})();
