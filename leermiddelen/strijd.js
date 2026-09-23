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
  /* Wat er in het donker anders moet. Een lijst, twee keer gebruikt: een keer
     voor wie de donkere stand zelf koos en een keer voor wie hem van zijn
     computer krijgt. Stond hier twee keer woordelijk hetzelfde. */
  var DONKERREGELS = '.duelvak,.sitelijst .rij,.duelvak input,.sitelijst .naamrij input,.duelvak button.los{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.14)}.sitelijst .rij.jij{background:#3a3220;border-color:#EFC64A}.duelvak p,.sitelijst .rij small,.sitelijst .leeg,.sitelijst .hint,.sitelijst .rij .nr{color:#B3BBD0}.duelvak h3,.sitelijst h3{color:#F3EFE9}#strijdSluier>div{background:#182652;color:#F3EFE9}#strijdSluier p{color:#B3BBD0}#strijdSluier button{background:#182652;color:#F3EFE9;border-color:rgba(243,239,233,.2)}#strijdSluier .stijlen button{background:#1f2f5e;color:#F3EFE9}#strijdSluier .stijlen button b{color:#F3EFE9}#strijdSluier .stijlen button.aan{background:#204ECF;color:#fff;border-color:#204ECF}#strijdSluier .stijlen button.aan b{color:#fff}#strijdSluier .lobbykaart{background:#1f2f5e;color:#F3EFE9}#strijdSluier .lobbykaart .klas{color:#B3BBD0}#strijdSluier .lobbykaart.klaar{background:#1f3a2c;border-color:#5fbf88}#strijdSluier .lobbykaart.klaar .vlag{color:#8fd9ae}#strijdSluier .lobbykaart.jij{border-color:#83A5F2}#strijdSluier .lobbykaart.jij.klaar{border-color:#5fbf88}#strijdSluier .lobbykaart.leeg{background:transparent;border-color:rgba(243,239,233,.2);color:#B3BBD0}#strijdSluier .lobbykaart .vlag{color:#F4A28C}#strijdSluier button.crab{background:#F26749;color:#fff;border-color:#F26749}#strijdSluier p.kop{color:#B3BBD0}#strijdSluier .afopties button.goed{background:#1f3a2c;border-color:#5fbf88;color:#c9ecd8}#strijdSluier .afopties button.fout{background:#3b201a;border-color:#e0806b;color:#f4c8bd}#strijdSluier .afdoelen button small{color:#B3BBD0}#strijdSluier .afbalk{color:#B3BBD0}';
  var css = '#strijdHud{position:fixed;left:12px;bottom:12px;z-index:90;background:#14224C;color:#fff;border-radius:14px;padding:9px 13px;' +
    'font:600 .82rem/1.3 Poppins,system-ui,sans-serif;box-shadow:0 10px 24px rgba(20,34,76,.25);max-width:min(92vw,340px)}' +
    '#strijdHud small{display:block;font-weight:500;opacity:.8}' +
    '#strijdHud.wacht{background:#204ECF}' +
    '#strijdToast{position:fixed;left:50%;top:16px;transform:translate(-50%,-30px);z-index:91;background:#F26749;color:#fff;border-radius:999px;' +
    'padding:10px 18px;font:600 .9rem/1.2 Poppins,system-ui,sans-serif;box-shadow:0 10px 24px rgba(20,34,76,.25);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;max-width:92vw;text-align:center}' +
    '#strijdToast.aan{opacity:1;transform:translate(-50%,0)}' +
    '#strijdToast.goed{background:#2f7d52}' +
    '#strijdSluier{position:fixed;inset:0;z-index:89;background:rgba(20,34,76,.55);display:flex;padding:20px;' +
      'overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}' +
    /* margin:auto zet het blok in het midden als het past, en laat het gewoon
       van boven beginnen als het niet past. Een grid dat centreert schuift het
       dan over de bovenrand en daar kom je met geen scroll bij. */
    '#strijdSluier>div{background:#fff;color:#14224C;border-radius:22px;padding:26px 28px;text-align:center;' +
      'max-width:440px;width:100%;margin:auto;font-family:Poppins,system-ui,sans-serif}' +
    '#strijdSluier b{display:block;font-size:1.4rem;margin-bottom:6px}' +
    /* het lobbyscherm: een kaart per speler, met zijn gezichtje erop */
    '#strijdSluier>div.lobbyscherm{max-width:560px}' +
    /* het paneel voor wie af is: vragen beantwoorden en fouten doorsturen */
    '#strijdSluier>div.afscherm{max-width:600px;text-align:left}' +
    '#strijdSluier .afvraag{font-size:1.12rem;font-weight:600;margin:10px 0 12px}' +
    '#strijdSluier .afopties{display:grid;gap:8px}' +
    '#strijdSluier .afopties button{width:100%;text-align:left;padding:12px 14px;border-radius:14px;min-height:48px;font-weight:600}' +
    '#strijdSluier .afopties button.goed{background:#e6f4ec;border-color:#2f7d52;color:#1d5236}' +
    '#strijdSluier .afopties button.fout{background:#fbe9e5;border-color:#c0442c;color:#8d2f1e}' +
    '#strijdSluier .afuit{margin:12px 0 0;font-size:.95rem}' +
    '#strijdSluier .afdoelen{display:grid;gap:8px;margin-top:10px}' +
    '#strijdSluier .afdoelen button{display:flex;align-items:center;gap:10px;text-align:left;padding:10px 14px;border-radius:14px;min-height:48px}' +
    '#strijdSluier .afdoelen button .av{flex:none;width:32px;height:32px;line-height:0}' +
    '#strijdSluier .afdoelen button .av svg{display:block;width:100%;height:100%}' +
    '#strijdSluier .afdoelen button small{margin-left:auto;color:var(--muted,#5b6785);font-weight:500}' +
    '#strijdSluier .afbalk{display:flex;gap:14px;flex-wrap:wrap;color:#5b6785;font-size:.9rem;margin:0 0 4px}' +
    '#strijdSluier .afweg{margin-top:14px}' +
    /* het knopje om het paneel terug te halen als je je eindscherm bekeek */
    '#strijdTerug{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:88;' +
      'border:none;border-radius:999px;padding:12px 20px;min-height:48px;cursor:pointer;' +
      'background:#F26749;color:#fff;font:700 .95rem Poppins,system-ui,sans-serif;box-shadow:0 8px 24px rgba(20,34,76,.28)}' +
    '#strijdSluier .lobbyvak{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0 2px;text-align:left}' +
    '@media(min-width:480px){#strijdSluier .lobbyvak{grid-template-columns:1fr 1fr}}' +
    '#strijdSluier .lobbykaart{display:flex;align-items:center;gap:10px;background:#f4f7ff;' +
      'border:2px solid transparent;border-radius:14px;padding:9px 11px;min-height:64px;box-sizing:border-box}' +
    '#strijdSluier .lobbykaart .av{flex:none;width:42px;height:42px;line-height:0}' +
    '#strijdSluier .lobbykaart .av svg{display:block;width:100%;height:100%}' +
    '#strijdSluier .lobbykaart .wie{flex:1;min-width:0}' +
    '#strijdSluier .lobbykaart .wie b{display:block;font-size:.92rem;line-height:1.25;margin:0;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#strijdSluier .lobbykaart .klas{display:flex;align-items:center;gap:5px;font-size:.78rem;color:#5b6480;min-width:0}' +
    '#strijdSluier .lobbykaart .klas span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#strijdSluier .lobbykaart .klas svg{flex:none;width:15px;height:15px;fill:none;stroke:currentColor;' +
      'stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '#strijdSluier .lobbykaart .vlag{flex:none;font-style:normal;font-size:.66rem;font-weight:700;' +
      'letter-spacing:.07em;text-transform:uppercase;color:#c0442c;text-align:right;line-height:1.2}' +
    /* klaar hoor je van een afstand te zien: de hele kaart kleurt mee */
    '#strijdSluier .lobbykaart.klaar{background:#e9f6ee;border-color:#2f7d52}' +
    '#strijdSluier .lobbykaart.klaar .vlag{color:#2f7d52}' +
    '#strijdSluier .lobbykaart.jij{border-color:#204ECF}' +
    '#strijdSluier .lobbykaart.jij.klaar{border-color:#2f7d52}' +
    /* een plek die nog vrij is: je ziet dat er nog iemand bij kan */
    '#strijdSluier .lobbykaart.leeg{background:transparent;border:2px dashed rgba(20,34,76,.18);' +
      'color:#5b6480;font-size:.82rem;justify-content:center;min-height:64px}' +
    '#strijdSluier p.kop{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#5b6480;margin:8px 0 4px;font-weight:600}' +
    '#strijdSluier .stijlen{display:grid;gap:6px;margin-bottom:8px}' +
    '#strijdSluier .stijlen button{display:block;width:100%;text-align:left;background:#fff;border:2px solid rgba(20,34,76,.12);border-radius:14px;padding:8px 12px;margin:0;color:#14224C;font:inherit}' +
    '#strijdSluier .stijlen button b svg{width:1.05em;height:1.05em;vertical-align:-.16em;margin-right:.4em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '#strijdSluier .stijlen button b{display:block;font-size:.92rem;margin:0}#strijdSluier .stijlen button small{display:block;font-size:.74rem;color:#5b6480;line-height:1.3}' +
    '#strijdSluier .stijlen button.aan{border-color:#204ECF;background:#204ECF;color:#fff}#strijdSluier .stijlen button.aan small{color:rgba(255,255,255,.85)}#strijdSluier .stijlen button.aan em{font-style:normal;font-size:.72rem;font-weight:600;background:#fff;color:#204ECF;border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:middle}#strijdSluier .stijlen button:disabled{opacity:.7}' +
    '#strijdSluier button.crab{background:#F26749;color:#fff;border-color:#F26749}#strijdSluier button.stil{background:#fff;color:#14224C;border:2px solid rgba(20,34,76,.15)}' +
    '#strijdSluier p{margin:0;color:#5b6480}' +
    '#strijdSluier .code{display:block;font-size:2.6rem;letter-spacing:.25em;font-weight:700;color:#204ECF;margin:10px 0 4px;padding-left:.25em}' +
    '#strijdSluier .tel{font-size:3.4rem;font-weight:700;color:#F26749;line-height:1;margin:8px 0}' +
    '#strijdSluier button{margin-top:14px;border:1.5px solid rgba(20,34,76,.18);background:#fff;border-radius:999px;padding:8px 16px;font:600 .9rem Poppins,system-ui,sans-serif;color:#14224C;cursor:pointer}' +
    /* Op een telefoon past de lobby maar net. Iets minder lucht en een kortere
       uitleg onder elke stijl scheelt een half scherm scrollen. */
    '@media(max-height:720px){#strijdSluier{padding:12px}#strijdSluier>div{padding:18px 20px}' +
      '#strijdSluier b{font-size:1.2rem}#strijdSluier .code{font-size:2.1rem;margin:6px 0 2px}' +
      '#strijdSluier .stijlen{gap:4px}#strijdSluier .stijlen button{padding:6px 10px}' +
      '#strijdSluier .stijlen button small{display:none}}' +
    '.duelvak{max-width:560px;margin:18px auto 0;background:#fff;border:1px solid rgba(20,34,76,.08);border-radius:18px;padding:16px 18px;text-align:left;font-family:Poppins,system-ui,sans-serif}' +
    '.duelvak h3{margin:0 0 4px;font-size:1rem;font-weight:600}' +
    '.duelvak p{margin:0 0 10px;font-size:.86rem;color:#5b6480}' +
    '.duelvak .rij{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
    '.duelvak input{flex:1;min-width:110px;border:1.5px solid rgba(20,34,76,.14);border-radius:12px;padding:10px 12px;font:inherit;font-size:.95rem;background:#FBF6F1;color:inherit}' +
    '.duelvak input.code{flex:0 0 7.5em;text-transform:uppercase;letter-spacing:.2em;font-weight:700;text-align:center}' +
    /* zestien pixels op een telefoon, anders zoomt Safari het scherm in zodra je in het veld tikt */
    '@media(max-width:640px){.duelvak input{font-size:16px}}' +
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
    donkerRegels(':root[data-theme="dark"] ', DONKERREGELS) +
    '@media(prefers-color-scheme:dark){' + donkerRegels(':root:not([data-theme="light"]) ', DONKERREGELS) + '}';
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
  function sluierTekst(html, klas){
    if (!sluier) return;
    /* het balkje in de hoek hoort bij het spelen; zolang er een venster
       overheen ligt staat het alleen maar in de weg */
    if (hud) hud.style.display = 'none';
    sluier.innerHTML = '<div' + (klas ? ' class="' + klas + '"' : '') + '>' + html + '</div>';
    /* de knop 'Toch niet' sluit de kamer; een knop met data-start geeft het startsein */
    Array.prototype.forEach.call(sluier.querySelectorAll('button'), function(k){
      k.addEventListener('click', function(){
        if (k.getAttribute('data-start')){ k.disabled = true; stuur({ t:'start' }); return; }
        /* opnieuw meedoen na het kruisje van de docent: de pagina met dezelfde kamer opnieuw laden */
        if (k.getAttribute('data-opnieuw')){ location.reload(); return; }
        if (k.getAttribute('data-stijl')){ mijnStijl = k.getAttribute('data-stijl'); if (hooks && hooks.lobby) hooks.lobby.kies(mijnStijl); stuurLobby(); sluierTekst(wachtTekst(maten.length + 1), wachtKlas()); return; }
        if (k.getAttribute('data-klaar')){ mijnKlaar = !mijnKlaar; stuurLobby(); sluierTekst(wachtTekst(maten.length + 1), wachtKlas()); return; }
        vertrekNu();
      });
    });
  }
  function namen(lijst){ var n = lijst.map(function(r){ return schoon(r.naam); }); return n.length <= 1 ? n.join('') : n.slice(0, -1).join(', ') + ' en ' + n[n.length - 1]; }
  /* ---------- het paneel voor wie af is ----------
     Alles wat het paneel bijhoudt staat hier bij elkaar: de vraag die nu op het
     scherm staat, wie er nog spelen, en hoeveel je er al goed had. */
  var afAan = false, afVraag = null, afGoed = 0, afTotaal = 0, afGestuurd = 0, afDoelen = [], afTerug = null, afWacht = false;
  var AF_FOUTEN = 2;   /* zoveel extra fouten levert een goed antwoord op */

  function afStart(){
    if (afAan || duel || samen() || !hooks || !hooks.vraag) return;
    afAan = true;
    afVolgende();
  }
  function afVolgende(){
    afWacht = false;
    try { afVraag = hooks.vraag(); } catch (e){ afVraag = null; }
    if (!afVraag){ afAan = false; return; }
    afTeken();
  }
  function afTeken(){
    if (!afAan) return;
    if (!sluier){
      sluier = document.createElement('div'); sluier.id = 'strijdSluier';
      document.body.appendChild(sluier);
    }
    if (afTerug){ afTerug.remove(); afTerug = null; }
    var h = '<b>Je bent af, maar je bent niet klaar</b>' +
      '<p>Elke vraag die je goed hebt stuurt ' + AF_FOUTEN + ' extra fouten naar iemand die nog speelt. Jij kiest naar wie.</p>' +
      '<p class="afbalk"><span>' + afGoed + ' van de ' + afTotaal + ' goed</span><span>' + afGestuurd +
        (afGestuurd === 1 ? ' fout verstuurd' : ' fouten verstuurd') + '</span></p>' +
      '<p class="afvraag">' + schoon(afVraag.v) + '</p>' +
      '<div class="afopties">' + afVraag.o.map(function(x, i){
        return '<button type="button" class="los" data-af="' + i + '">' + schoon(x) + '</button>';
      }).join('') + '</div>' +
      '<div class="afweg"><button type="button" class="los" data-afweg="1">Even mijn eindscherm bekijken</button></div>';
    sluier.innerHTML = '<div class="afscherm">' + h + '</div>';
    if (hud) hud.style.display = 'none';
    Array.prototype.forEach.call(sluier.querySelectorAll('[data-af]'), function(k){
      k.addEventListener('click', function(){ afAntwoord(+k.getAttribute('data-af'), k); });
    });
    var weg = sluier.querySelector('[data-afweg]');
    if (weg) weg.addEventListener('click', afOpzij);
  }
  function afAntwoord(i, knop){
    if (afWacht || !afVraag) return;
    afWacht = true;
    afTotaal++;
    var goed = i === afVraag.g;
    Array.prototype.forEach.call(sluier.querySelectorAll('[data-af]'), function(k){ k.disabled = true; });
    knop.className = 'los ' + (goed ? 'goed' : 'fout');
    if (!goed){
      var j = sluier.querySelector('[data-af="' + afVraag.g + '"]');
      if (j) j.className = 'los goed';
    }
    var uit = document.createElement('p');
    uit.className = 'afuit';
    uit.innerHTML = (goed ? '<b>Goed.</b> ' : '<b>Niet goed.</b> ') + (afVraag.u ? schoon(afVraag.u) : '');
    sluier.querySelector('.afopties').insertAdjacentElement('afterend', uit);
    if (goed){ afGoed++; afKies(uit); }
    else {
      var door = document.createElement('button');
      door.type = 'button'; door.className = 'los'; door.textContent = 'Volgende vraag';
      door.style.marginTop = '12px';
      door.addEventListener('click', afVolgende);
      uit.insertAdjacentElement('afterend', door);
    }
  }
  /* naar wie gaan de fouten? alleen wie nog speelt staat in de lijst */
  function afKies(na){
    var vak = document.createElement('div');
    vak.className = 'afdoelen';
    if (!afDoelen.length){
      vak.innerHTML = '<p class="afuit">Er speelt op dit moment niemand meer. Zodra er weer iemand bezig is kun je sturen.</p>';
      var door = document.createElement('button');
      door.type = 'button'; door.className = 'los'; door.textContent = 'Volgende vraag';
      door.addEventListener('click', afVolgende);
      vak.appendChild(door);
    } else {
      vak.innerHTML = '<p class="afuit" style="margin:0">Naar wie sturen?</p>' + afDoelen.slice(0, 12).map(function(d){
        return '<button type="button" data-naar="' + schoon(d.sid) + '"><span class="av">' +
          (window.AVATAR ? AVATAR.svg(d.naam, 32, d.av || '') : '') + '</span>' + schoon(d.naam) +
          '<small>ronde ' + (d.ronde | 0) + '</small></button>';
      }).join('');
    }
    na.insertAdjacentElement('afterend', vak);
    Array.prototype.forEach.call(vak.querySelectorAll('[data-naar]'), function(k){
      k.addEventListener('click', function(){
        Array.prototype.forEach.call(vak.querySelectorAll('button'), function(b){ b.disabled = true; });
        stuur({ t: 'aanval', n: AF_FOUTEN, naar: k.getAttribute('data-naar') });
        afGestuurd += AF_FOUTEN;
        zeg(AF_FOUTEN + ' fouten onderweg naar ' + k.textContent.replace(/ronde \d+$/, '').trim() + '.', true);
        setTimeout(afVolgende, 600);
      });
    });
  }
  /* het paneel opzij zetten zodat je je eigen eindscherm kunt bekijken */
  function afOpzij(){
    sluierWeg();
    if (afTerug) return;
    afTerug = document.createElement('button');
    afTerug.type = 'button'; afTerug.id = 'strijdTerug';
    afTerug.textContent = 'Vragen beantwoorden en fouten sturen';
    afTerug.addEventListener('click', function(){ afTeken(); });
    document.body.appendChild(afTerug);
  }
  function afStop(){
    afAan = false;
    if (afTerug){ afTerug.remove(); afTerug = null; }
  }

  function sluierWeg(){ if (sluier && sluier.parentNode) sluier.parentNode.removeChild(sluier); sluier = null; if (hud) hud.style.display = ''; }

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
      if (e.code === 1000 && /verwijderd/.test(e.reason || '')){ bericht({ t:'eruit' }); return; }
      if (e.code === 1000 && /gesloten|afgelopen|nieuwe kamer|twee spelers/.test(e.reason || '')){ hudTekst('Samen spelen', e.reason, true); sluierTekst('<b>' + schoon(e.reason) + '</b><button type="button">Terug</button>'); dicht = true; return; }
      pogingen++;
      hudTekst('Kamer ' + code, 'verbinding kwijt, opnieuw proberen…', true);
      setTimeout(open, Math.min(8000, 600 * pogingen));
    };
  }
  function stuur(obj){ if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }
  setInterval(function(){ if (ws && ws.readyState === 1) ws.send('ping'); }, 25000);

  /* Weggaan uit de kamer. Eerst zeggen dat je gaat, dan pas ophangen en
     naar het startscherm: een bericht dat vlak voor het wegnavigeren wordt
     verstuurd, komt anders niet altijd aan. De kamer blijft open voor de
     anderen, en zolang het potje loopt kun je met dezelfde code terug. */
  function zonderKamer(){
    var q = location.search.replace(/^\?/, '').split('&').filter(function(x){ return x && !/^kamer=/.test(x); }).join('&');
    return location.pathname + (q ? '?' + q : '');
  }
  function vertrekNu(){
    var weg = function(){ location.href = zonderKamer(); };
    if (!ws || ws.readyState !== 1){ dicht = true; weg(); return; }
    stuur({ t:'vertrek' });
    dicht = true;
    var s = ws;
    setTimeout(function(){ try { s.close(1000, 'weg'); } catch (e){} weg(); }, 180);
  }
  /* de laatste kamer onthouden, zodat de code er nog staat als je terug wilt */
  function onthoudKamer(){ try { localStorage.setItem('lg-laatste-kamer', JSON.stringify({ code:code, t:Date.now() })); } catch (e){} }
  function laatsteKamer(){
    try { var k = JSON.parse(localStorage.getItem('lg-laatste-kamer') || 'null'); return k && k.code && Date.now() - k.t < 3 * 3600000 ? k.code : ''; } catch (e){ return ''; }
  }

  /* Het lobbyscherm: een kaart per speler met zijn gezichtje, zijn klasse en
     of hij klaar staat, plus de plekken die nog vrij zijn. Daaronder kies je
     je eigen klasse en meld je je klaar; de maker van de kamer start. */
  function lobbyTekst(aantal){
    var L = hooks.lobby, ikMaak = gastheer === mijnPid;
    if (!mijnStijl) mijnStijl = L.huidig();
    function stijlVan(id){ return L.stijlen.filter(function(y){ return y.id === id; })[0] || null; }
    function stijlNaam(id){ var x = stijlVan(id); return x ? x.naam : 'nog geen klasse'; }
    /* Het tekentje bij een klasse komt van het spel zelf, zodat dit bestand
       niets van zwaarden of bogen hoeft te weten. */
    function stijlIco(id){ var x = stijlVan(id); return x && x.ico ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + x.ico + '</svg>' : ''; }
    function gezicht(n, av){ return window.AVATAR ? AVATAR.svg(n, 42, av || '') : ''; }

    var mijnAv = window.PROFIEL && PROFIEL.avatar ? PROFIEL.avatar() : '';
    var allen = [{ naam:naam, av:mijnAv, stijl:mijnStijl, klaar:mijnKlaar, ik:true }].concat(maten);
    var kaarten = allen.map(function(r){
      return '<div class="lobbykaart' + (r.klaar ? ' klaar' : '') + (r.ik ? ' jij' : '') + '">' +
        '<span class="av">' + gezicht(r.naam, r.av) + '</span>' +
        '<span class="wie"><b>' + schoon(r.naam) + (r.ik ? ' (jij)' : '') + '</b>' +
        '<span class="klas">' + stijlIco(r.stijl) + '<span>' + schoon(stijlNaam(r.stijl)) + '</span></span></span>' +
        '<i class="vlag">' + (r.klaar ? '\u2713 klaar' : 'kiest nog') + '</i></div>';
    });
    for (var v = allen.length; v < maxSamen; v++) kaarten.push('<div class="lobbykaart leeg">plek vrij</div>');

    var keuze = '<div class="stijlen">' + L.stijlen.map(function(x){
      var aan = mijnStijl === x.id;
      return '<button type="button" data-stijl="' + x.id + '"' + (aan ? ' class="aan"' : '') + (mijnKlaar ? ' disabled' : '') +
        '><b>' + (aan ? '\u2713 ' : '') + stijlIco(x.id) + x.naam + (aan ? ' <em>gekozen</em>' : '') + '</b><small>' + x.uit + '</small></button>';
    }).join('') + '</div>';

    var alleKlaar = mijnKlaar && maten.every(function(r){ return r.klaar; });
    var uitleg = '<p>Laat je vrienden naar <strong>' + location.host.replace(/^www\./, '') + '/q</strong> gaan en deze code invullen:</p><span class="code">' + code + '</span>';
    var knoppen = '<button type="button" data-klaar="1" class="' + (mijnKlaar ? 'stil' : 'crab') + '">' + (mijnKlaar ? 'Toch nog iets veranderen' : 'Klaar als ' + stijlNaam(mijnStijl).toLowerCase() + '!') + '</button> ';
    if (ikMaak) knoppen += '<button type="button" data-start="1"' + (aantal >= 2 && alleKlaar ? '' : ' disabled') + '>Start met z\'n ' + (aantal <= 2 ? 'twee\u00ebn' : aantal === 3 ? 'drie\u00ebn' : 'vieren') + '</button> ';
    knoppen += '<button type="button">Toch niet</button>';
    var nogNiet = maten.filter(function(r){ return !r.klaar; });
    var status = aantal < 2 ? 'Zodra er twee zijn en iedereen klaar staat, kan het beginnen; met vier begint het vanzelf.'
      : alleKlaar ? (ikMaak ? 'Iedereen staat klaar. Druk op start.' : 'Iedereen staat klaar; de maker van de kamer start.')
      : !mijnKlaar ? 'Jij moet nog op Klaar drukken.'
      : 'Wachten op ' + namen(nogNiet) + '.';
    return '<b>' + (aantal < 2 ? 'Wacht op je vrienden' : aantal + ' in de kamer') + '</b>' + uitleg +
      '<div class="lobbyvak">' + kaarten.join('') + '</div>' +
      '<p class="kop">kies je klasse</p>' + keuze +
      '<p class="kop">en dan</p><p>' + status + '</p>' + knoppen;
  }
  /* De lobby is breder dan de andere meldingen: er staan kaarten in. */
  function wachtKlas(){ return (duel && maxSamen > 2 && hooks && hooks.lobby) ? 'lobbyscherm' : ''; }
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
    /* de docent haalde je uit de kamer: niet opnieuw verbinden, en zeggen wat er gebeurde */
    if (m.t === 'eruit'){
      dicht = true; klaarMet = true;
      /* de server hangt op, maar dat komt niet altijd aan: zelf ophangen */
      try { if (ws) ws.close(1000, 'eruit'); } catch (x){} ws = null;
      clearInterval(telKlok); afStop();
      hudTekst('Uit de kamer', 'je docent heeft je eruit gehaald', true);
      sluierTekst('<b>Je docent heeft je uit kamer ' + code + ' gehaald.</b><p>Was dat een vergissing? Dan kun je gewoon opnieuw meedoen.</p><button type="button" data-opnieuw="1">Opnieuw meedoen</button> <button type="button">Terug</button>');
      return;
    }
    if (m.t === 'welkom'){
      if (m.spel === 'strijd') onthoudKamer();
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
        sluierTekst(wachtTekst(aantal), wachtKlas());
      }
      return;
    }
    if (m.t === 'lobby'){
      maten = (m.spelers || []).filter(function(r){ return r.sid !== mijnPid; });
      /* ging de maker weg, dan beheert een ander de kamer; en wie aan het aftellen was maar nu te weinig heeft, wacht weer */
      if (m.gastheer !== undefined) gastheer = m.gastheer;
      if (m.fase === 'lobby') clearInterval(telKlok);
      if (!gestart) sluierTekst(wachtTekst(maten.length + 1), wachtKlas());
      return;
    }
    if (m.t === 'aftellen'){ aftellen(m.s || 3); return; }
    if (m.t === 'start'){ start(m); return; }
    if (m.t === 'net'){ if (hooks && hooks.net) hooks.net(m.d); return; }
    if (m.t === 'stand'){
      if (m.max) maxSamen = m.max;
      if (m.maten) maten = m.maten;
      if (m.doelen) afDoelen = m.doelen;
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
        hudTekst(gewonnen ? 'Je hebt het duel gewonnen!' : (winnaar ? schoon(winnaar.naam) + ' heeft gewonnen' : 'Het duel is voorbij'),
          ander ? schoon(ander.naam) + ' kwam tot ronde ' + (ander.ronde | 0) : '', false);
        zeg(gewonnen ? 'Gewonnen! Je tegenstander is gevallen.' : 'Verloren. ' + (winnaar ? winnaar.naam + ' hield het langer vol.' : ''), gewonnen);
      } else {
        hudTekst('Klasstrijd afgelopen', j ? 'jij werd ' + j.rang + 'e van ' + j.van : '', false);
      }
      afStop();
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
      if (m.fase === 'lobby') sluierTekst(wachtTekst(aantal), wachtKlas());
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
        tegen ? (tegen.af ? schoon(tegen.naam) + ' is gevallen in ronde ' + (tegen.ronde | 0) : 'ronde ' + tegen.ronde + ' · ' + tegen.leven + ' levens' + (tegen.aan ? '' : ' · even weg')) : 'wacht op je tegenstander', false);
      return;
    }
    var j = m.jouw;
    hudTekst('Klasstrijd: ' + (j ? j.rang + 'e van ' + j.van : '…'),
      m.bezig + ' nog in het spel' + (m.koploper ? ' · ' + schoon(m.koploper.naam) + ' ronde ' + (m.koploper.ronde | 0) : ''), false);
  }
  /* om de paar seconden de stand doorgeven, en meteen als hij verandert */
  setInterval(function(){
    if (!actief || !gestart || klaarMet || !hooks) return;
    var s = hooks.stand();
    var sleutel = JSON.stringify(s);
    if (sleutel === laatsteStand) return;
    laatsteStand = sleutel;
    stuur({ t:'stand', ronde:s.ronde | 0, gehaald:s.gehaald | 0, leven:s.leven | 0, punten:s.punten | 0, fase:s.fase || '' });
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
    document.getElementById('duelCode').addEventListener('keydown', function(e){ if (e && e.key === 'Enter') document.getElementById('duelDoe').click(); });
    var vorige = laatsteKamer();
    if (vorige){
      document.getElementById('duelCode').value = vorige;
      document.getElementById('duelDoe').textContent = 'Terug naar ' + vorige;
      document.getElementById('duelCode').addEventListener('input', function(){ document.getElementById('duelDoe').textContent = 'Doe mee met een code'; });
    }
  }

  /* ======================================================================
     3. het klassement van de hele site
     ====================================================================== */
  /* Met terugwerkende kracht: rijen die deze browser eerder instuurde krijgen alsnog het gezichtje van nu.
     Het id van een rij begint met de eerste acht tekens van het kenmerk van deze browser. */
  /* De bon. De server telt de score niet zelf na, dus zonder meer kon iedereen
     met een regel in de console ronde 250 insturen. Daarom vraagt de pagina een
     bon zodra het klassement in beeld komt (dat is het startscherm, dus het
     begin van het potje) en stuurt die mee. De server weet dan hoe lang het
     potje duurde en weigert wat sneller ging dan spelen kan. */
  var bonnen = {}, bonBezig = {};
  function zorgBon(spel){
    if (bonnen[spel] || bonBezig[spel]) return;
    bonBezig[spel] = true;
    fetch('/api/klassement/' + spel + '/bon', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ sid:sid() }) })
      .then(function(r){ return r.json(); })
      .then(function(j){ bonBezig[spel] = false; if (j && j.bon) bonnen[spel] = j.bon; })
      .catch(function(){ bonBezig[spel] = false; });
  }

  /* De knoeivlag. De spellen hebben testluiken om snel naar een late ronde te
     springen of weer vol leven te krijgen; die zijn er voor mij, niet om mee te
     scoren. Wie er een gebruikt zet deze vlag aan, en dan gaat er van dit potje
     niets meer naar het klassement. Wie de vlag weet te vinden kan hem
     weghalen, maar dan houdt de bon hierboven het nog tegen. */
  var geknoeid = false;
  function knoei(){ geknoeid = true; }

  /* Je gezichtje op de rijen die je eerder instuurde. Vroeger zocht de browser
     die rijen zelf op aan het begin van het id, want dat begon met de eerste
     acht tekens van je kenmerk. Daarmee stond dat stukje kenmerk dus in de
     openbare lijst en kon iedereen het gezichtje van een ander veranderen. Nu
     zoekt de server ze op aan de hand van het hele kenmerk, en vraagt de
     browser er alleen om als hij ooit iets instuurde en het gezichtje sindsdien
     veranderd is. */
  var gezichtGedaan = {};
  function gezichtSleutel(spel){ return 'lg-kl-av-' + spel; }
  function gezichtOnthoud(spel, av){ try { localStorage.setItem(gezichtSleutel(spel), av || '-'); } catch (e){} }
  function gezichtBijwerken(spel){
    var av = window.PROFIEL && PROFIEL.avatar ? PROFIEL.avatar() : '';
    if (!av || gezichtGedaan[spel]) return;
    var vorige = null;
    try { vorige = localStorage.getItem(gezichtSleutel(spel)); } catch (e){}
    if (!vorige || vorige === av) return;
    gezichtGedaan[spel] = true;
    gezichtOnthoud(spel, av);
    fetch('/api/klassement/' + spel + '/gezicht', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ sid:sid(), av:av }) })
      .then(function(r){ return r.json(); })
      .then(function(j){ if (j && j.bijgewerkt) klassement.toon(laatsteDoel[spel], spel, laatsteId[spel], laatsteVorm[spel]); })
      .catch(function(){});
  }
  var laatsteDoel = {}, laatsteId = {}, laatsteVorm = {};
  var klassement = {
    /* de top tien tekenen; id markeert je eigen rij; metVorm voegt het invulvak toe */
    toon: function(doelId, spel, id, vorm){
      var doel = document.getElementById(doelId);
      if (!doel) return;
      laatsteDoel[spel] = doelId; laatsteId[spel] = id || null; laatsteVorm[spel] = vorm || null;
      doel.className = 'sitelijst';
      doel.innerHTML = '<h3>Klassement van de hele site</h3>' + (vorm ? vorm : '') + '<div class="leeg">Laden…</div>';
      /* het klassement staat in beeld, dus er wordt zo gespeeld: alvast een bon */
      zorgBon(spel);
      fetch('/api/klassement/' + spel).then(function(r){ return r.json(); }).then(function(j){
        /* is het gezichtje veranderd sinds je laatste inzending, werk je oude rijen dan bij */
        gezichtBijwerken(spel);
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
      if (geknoeid) return Promise.resolve({ fout:'Je hebt het testpaneel gebruikt, dus dit potje telt niet mee voor het klassement.' });
      if (!naamOk(g.naam)) return Promise.resolve({ fout: NAAMFOUT });
      bewaarNaam(g.naam);
      /* je eigen gezichtje gaat mee; anders rekent de lijst er een uit je bijnaam */
      if (!g.av && window.PROFIEL && PROFIEL.avatar) g = Object.assign({ av:PROFIEL.avatar() }, g);
      var bon = bonnen[spel] || '';
      if (!bon) return Promise.resolve({ fout:'Deze partij is niet meer geldig. Ververs de pagina en speel opnieuw.' });
      /* de bon is er maar een, ook als het insturen mislukt: anders kan een
         mislukte poging eindeloos herhaald worden */
      bonnen[spel] = null;
      return fetch('/api/klassement/' + spel, { method:'POST', headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ bon:bon, naam:g.naam, av:g.av || '', ronde:g.ronde, punten:g.punten, waar:g.waar, niveau:g.niveau, vak:g.vak, sid:sid() }) })
      .then(function(r){ return r.json(); })
      .then(function(j){
        /* het volgende potje begint nu, dus meteen een verse bon */
        zorgBon(spel);
        if (j && j.id) gezichtOnthoud(spel, g.av || '');
        return j;
      })
      .catch(function(){ zorgBon(spel); return { fout:'Geen verbinding met de server.' }; });
    },
    /* het invulvak voor het eindscherm: naam, knop, hint, en daarna de lijst met je eigen rij */
    vorm: function(doelId, spel, gegevens){
      if (geknoeid){ klassement.toon(doelId, spel, null, '<p class="hint">Je hebt het testpaneel gebruikt, dus dit potje telt niet mee voor het klassement.</p>'); return; }
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
      /* wie af is mag blijven oefenen en zijn goede antwoorden doorsturen */
      afStart();
    },
    /* de knop Opnieuw in een spel: in een kamer betekent dat weggaan */
    vertrek: function(){ if (!actief) return false; vertrekNu(); return true; },
    duelBlok: duelBlok,
    klassement: klassement,
    knoei: knoei,
    naamOk: naamOk
  };
})();
