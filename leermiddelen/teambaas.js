/* ============================================================================
   TEAMBAAS: de pagina van de racemanager (teambaas.html).
   Alles wat telt (munten, upgrades, antwoorden, de race) doet de server
   (server/teambaas.js); deze pagina laat het zien en stuurt keuzes door.
   De regels en de banen staan in teambaas-data.js, de helm in teambaas-helm.js.

   Schermen (tabbladen): hoofdkwartier, vragen, strategie, race, stand, garage, circuits.
   Lokaal testen zonder Microsoft: teambaas.html?test=naam (de server staat dat
   alleen op localhost toe).
   ============================================================================ */
(function(){
  'use strict';
  var T = window.TEAMBAAS, R = T.REGELS;
  var q = new URLSearchParams(location.search), TEST = /^[a-z0-9]{1,20}$/.test(q.get('test') || '') ? q.get('test') : '';
  var $ = function(id){ return document.getElementById(id); };
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(pad, body){
    var u = '/api/teambaas' + pad;
    if (TEST) u += (u.indexOf('?') >= 0 ? '&' : '?') + 'test=' + TEST;
    var o = body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' } : { credentials: 'same-origin' };
    return fetch(u, o).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j = j || {}; j._status = r.status; return j; }); })
      .catch(function(){ return { _status: 0, fout: 'geen verbinding met de server' }; });
  }
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e){ return null; } }

  var team = null, liga = null, scherm = 'hq', race = null;
  var VAKKEN = [['reken', 'Rekenen'], ['ned', 'Nederlands'], ['eng', 'Engels'], ['wis', 'Wiskunde'], ['ges', 'Geschiedenis'], ['aard', 'Aardrijkskunde'], ['bio', 'Biologie'], ['burg', 'Mens en maatschappij'], ['eco', 'Economie']];
  var NIVEAUS = [[1, 'vmbo-bb'], [2, 'vmbo-kgt'], [3, 'havo'], [4, 'vwo']];
  var WATNAAM = { motor: 'Motor', aero: 'Aerodynamica', accu: 'Batterij', betrouw: 'Betrouwbaarheid', hq: 'Hoofdkwartier', snel: 'snelheid', inhalen: 'inhalen', constant: 'constant rijden' };
  function watTekst(wat){ var m = /^c([12])\.(\w+)$/.exec(wat); return m ? 'Training ' + (team ? team.c[+m[1] - 1].naam : 'coureur ' + m[1]) + ': ' + WATNAAM[m[2]] : WATNAAM[wat] || wat; }
  function duur(ms){
    ms = Math.max(0, ms); var s = Math.ceil(ms / 1000), d = Math.floor(s / 86400), u = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    if (d) return d + ' d' + (u ? ' ' + u + ' u' : '');
    if (u) return u + ' u' + (m ? ' ' + m + ' min' : '');
    if (m >= 10 || (m && !r)) return m + ' min';
    return m ? m + ' min ' + r + ' s' : r + ' s';
  }
  function munt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  /* het verschil tussen de klok van de server en die van deze computer */
  var klokVerschil = 0;

  /* ---------- een baan tekenen ----------
     De baan in lagen, zoals een echt circuit van boven: uitloopstrook, curbs in de bochten
     (koraal en wit), witte randlijnen, asfalt en een geblokte start/finish. */
  function baanPunten(b, w, h, marge){
    var s = Math.min((w - 2 * marge) / b.breed, (h - 2 * marge) / b.hoog), ox = (w - b.breed * s) / 2, oy = (h - b.hoog * s) / 2;
    return b.pts.map(function(p){ return [p[0] * s + ox, p[1] * s + oy]; });
  }
  function geo(b, w, h, marge){
    var P = baanPunten(b, w, h, marge), L = [0], i;
    for (i = 0; i < P.length; i++){ var a = P[i], c = P[(i + 1) % P.length]; L.push(L[i] + Math.hypot(c[0] - a[0], c[1] - a[1])); }
    var TOT = L[L.length - 1];
    function punt(f){ f = ((f % 1) + 1) % 1; var d = f * TOT, k = 0; while (k < P.length - 1 && L[k + 1] < d) k++; var a = P[k], c = P[(k + 1) % P.length], s = (d - L[k]) / ((L[k + 1] - L[k]) || 1); return [a[0] + (c[0] - a[0]) * s, a[1] + (c[1] - a[1]) * s]; }
    function normaal(f){ var a = punt(f - 0.002), c = punt(f + 0.002), dx = c[0] - a[0], dy = c[1] - a[1], n = Math.hypot(dx, dy) || 1; return [-dy / n, dx / n]; }
    var S = []; for (i = 0; i < T.NP; i++) S.push(punt(i / T.NP));
    return { P: P, S: S, punt: punt, normaal: normaal, prof: T.profiel(b) };
  }
  function lijn(pts, dicht){ return 'M' + pts.map(function(p){ return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + (dicht ? ' Z' : ''); }
  /* de bochten: stukjes waar de baan sterk draait, voor de curbs */
  function bochten(g){
    var uit = [], nu = null, k = g.prof.krom;
    for (var i = 0; i <= T.NP; i++){
      var j = i % T.NP, scherp = Math.abs(k[j]) > 0.32 && i < T.NP;
      if (scherp && !nu) nu = [Math.max(0, i - 1)]; else if (!scherp && nu){ nu.push(Math.min(T.NP, i + 1)); uit.push(nu); nu = null; }
    }
    return uit.map(function(r){ var pts = []; for (var i = r[0]; i <= r[1]; i++) pts.push(g.S[i % T.NP]); return pts; });
  }
  function baanLagen(g, w, opties){
    opties = opties || {};
    var d = lijn(g.S, true), s = '';
    s += '<path d="' + d + '" fill="none" stroke="#161D45" stroke-width="' + (w * 2.4).toFixed(1) + '" stroke-linejoin="round"/>';
    bochten(g).forEach(function(pts){
      var dd = lijn(pts);
      s += '<path d="' + dd + '" fill="none" stroke="#F26749" stroke-width="' + (w * 1.5).toFixed(1) + '" stroke-linejoin="round" stroke-linecap="butt"/>' +
        '<path d="' + dd + '" fill="none" stroke="#FBF6F1" stroke-width="' + (w * 1.5).toFixed(1) + '" stroke-dasharray="' + (w * 0.45).toFixed(1) + ' ' + (w * 0.45).toFixed(1) + '" stroke-linejoin="round"/>';
    });
    s += opties.voorRand || '';
    s += '<path d="' + d + '" fill="none" stroke="' + (opties.rand || '#DCE3F6') + '" stroke-width="' + (w * 1.16).toFixed(1) + '" stroke-linejoin="round"' + (opties.gloed ? ' style="filter:drop-shadow(0 0 ' + (w * 0.6).toFixed(1) + 'px ' + opties.gloed + ')"' : '') + '/>';
    s += opties.voorAsfalt || '';
    s += '<path d="' + d + '" fill="none" stroke="' + (opties.asfalt || '#2B335F') + '" stroke-width="' + w.toFixed(1) + '" stroke-linejoin="round"/>';
    /* de geblokte start/finish: twee rijen blokjes dwars over de baan */
    var a = g.S[0], n = g.normaal(0), r = [n[1], -n[0]], blok = w / 4, k, j;
    for (k = -2; k < 2; k++) for (j = 0; j < 2; j++){
      var x = a[0] + n[0] * (k + 0.5) * blok + r[0] * (j - 0.5) * blok, y = a[1] + n[1] * (k + 0.5) * blok + r[1] * (j - 0.5) * blok;
      s += '<rect x="' + (x - blok / 2).toFixed(1) + '" y="' + (y - blok / 2).toFixed(1) + '" width="' + blok.toFixed(1) + '" height="' + blok.toFixed(1) + '" fill="' + ((k + j) % 2 ? '#FBF6F1' : '#14224C') + '" transform="rotate(' + (Math.atan2(n[1], n[0]) * 180 / Math.PI).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return s;
  }
  function baanSvg(b, w, h, opties){
    opties = opties || {};
    var g = geo(b, w, h, opties.marge || 14);
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Baan van ' + esc(b.plaats) + ', ' + esc(b.land) + '">' +
      baanLagen(g, opties.breed || 7, { gloed: opties.gloed ? opties.kleur : '', rand: opties.kleur && !opties.gloed ? opties.kleur : '#DCE3F6' }) + '</svg>';
  }
  /* wat er op deze baan telt, als zinnetje en als twee balkjes */
  function karakter(b, kort){
    var p = T.profiel(b), m = Math.round(p.motor * 100);
    var soort = p.soort === 'snel' ? 'Snel circuit: lange rechte stukken, de motor telt zwaar.' : p.soort === 'bochtig' ? 'Bochtig circuit: de aerodynamica telt zwaar.' : 'Gemengd circuit: motor en aerodynamica tellen allebei.';
    return '<div class="tb-karakter">' + (kort ? '' : '<p class="tb-klein">' + soort + ' Inhalen: ' + p.inhalen + '.</p>') +
      '<div class="tb-weeg"><span>Motor</span><div class="tb-meter"><i style="width:' + m + '%;background:#EA9836"></i></div><b>' + m + '%</b></div>' +
      '<div class="tb-weeg"><span>Aero</span><div class="tb-meter"><i style="width:' + (100 - m) + '%;background:#83A5F2"></i></div><b>' + (100 - m) + '%</b></div></div>';
  }
  var MAAND = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  function datumTekst(d){ var x = String(d).split('-'); return (+x[2]) + ' ' + MAAND[+x[1] - 1]; }
  function raceTijdTekst(t){ var d = new Date(t); return ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][d.getDay()] + ' ' + d.getDate() + ' ' + MAAND[d.getMonth()] + ' om ' + d.getHours() + '.' + String(d.getMinutes()).padStart(2, '0'); }

  /* ---------- helmen ---------- */
  var helmen = [];
  function helmIn(doos, h, maat, extra){
    var c = document.createElement('canvas'); c.width = maat * 2; c.height = maat * 2; c.style.width = maat + 'px'; c.style.height = maat + 'px'; c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Helm');
    doos.innerHTML = ''; doos.appendChild(c);
    var p = Object.assign({ draai: false, hoek: -0.9, sleep: false }, h, extra || {});
    var x = window.TBHELM ? TBHELM.maak(c, p) : null; if (x) helmen.push(x); return x;
  }
  function gezicht(naam, maat){ return window.AVATAR ? AVATAR.svg(naam, maat) : ''; }

  /* ---------- tabbladen ---------- */
  var SCHERMEN = [['hq', 'Hoofdkwartier'], ['vragen', 'Vragen'], ['strategie', 'Strategie'], ['race', 'Race'], ['stand', 'Stand'], ['garage', 'Garage'], ['circuits', 'Circuits']];
  function tabs(){
    $('tbTabs').innerHTML = SCHERMEN.map(function(s){ return '<button type="button" role="tab" data-s="' + s[0] + '" aria-selected="' + (scherm === s[0]) + '">' + s[1] + '</button>'; }).join('');
  }
  function naar(s, extra){
    scherm = s; ls('tb-scherm', s);
    helmen.forEach(function(h){ h.stop(); }); helmen = [];
    if (s !== 'race') stopRace();
    tabs();
    SCHERMEN.forEach(function(x){ $('tb-' + x[0]).hidden = x[0] !== s; });
    ({ hq: tekenHq, vragen: tekenVragen, strategie: tekenStrategie, race: tekenRace, stand: tekenStand, garage: tekenGarage, circuits: tekenCircuits })[s](extra);
    var kop = $('tb-' + s).querySelector('h2'); if (kop && extra !== 'stil'){ kop.setAttribute('tabindex', '-1'); kop.focus({ preventScroll: true }); }
  }
  $('tbTabs').addEventListener('click', function(e){ var b = e.target.closest('[data-s]'); if (b) naar(b.getAttribute('data-s')); });
  $('tbTabs').addEventListener('keydown', function(e){
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var i = SCHERMEN.findIndex(function(s){ return s[0] === scherm; }), j = (i + (e.key === 'ArrowRight' ? 1 : -1) + SCHERMEN.length) % SCHERMEN.length;
    naar(SCHERMEN[j][0]); $('tbTabs').querySelector('[data-s="' + SCHERMEN[j][0] + '"]').focus();
  });

  /* ---------- de balk bovenaan: team, munten, betrouwbaarheid ---------- */
  function tekenBalk(){
    if (!team){ $('tbBalk').innerHTML = ''; return; }
    var b = Math.round(team.betrouwbaarheid * 100);
    $('tbBalk').innerHTML =
      '<div class="tb-team"><span class="tb-kleuren"><i style="background:' + team.k1 + '"></i><i style="background:' + team.k2 + '"></i></span><div><span class="tb-hand">jouw raceteam</span><b>' + esc(team.naam) + '</b></div></div>' +
      '<div class="tb-tel tb-munt"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#EA9836"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#0B1029" stroke-width="2"/></svg><div><b>' + munt(team.munten) + '</b><span>munten</span></div></div>' +
      '<div class="tb-tel tb-betr" title="Je laatste 30 antwoorden. Meer fout betekent meer kans dat een auto uitvalt."><div><span>Betrouwbaarheid</span><b>' + b + '%</b></div><div class="tb-meter"><i style="width:' + b + '%"></i></div><small>uitvalkans ' + Math.round(team.uitval * 100) + '% per auto</small></div>' +
      '<button type="button" class="tb-knop tb-koraal" data-naar="vragen">Vragen beantwoorden</button>';
  }
  document.addEventListener('click', function(e){ var b = e.target.closest('[data-naar]'); if (b){ naar(b.getAttribute('data-naar'), b.getAttribute('data-job') || undefined); } });

  /* ---------- hoofdkwartier ---------- */
  function pips(n, max){ var s = ''; for (var i = 1; i <= 10; i++) s += '<i class="' + (i <= n ? 'aan' : i <= max ? '' : 'dicht') + '"></i>'; return '<span class="tb-pips" aria-label="niveau ' + n + ' van 10">' + s + '</span>'; }
  function upgradeKnop(wat, nu){
    var bezig = team.jobs.filter(function(j){ return j.wat === wat; })[0];
    if (bezig) return '<span class="tb-bezig">wordt gebouwd: ' + duur(bezig.eind - Date.now() - klokVerschil) + '</span>';
    var naar = nu + 1, max = wat === 'hq' ? R.hqMax : R.maxNiveau(team.hq);
    if (naar > max && /^c/.test(wat)) return '';
    if (naar > max) return '<span class="tb-klein" title="Een beter hoofdkwartier tilt dit hoger">' + (wat === 'hq' ? 'hoogste niveau' : max >= 10 ? 'hoogste niveau' : 'max bij hoofdkwartier ' + team.hq) + '</span>';
    var k = wat === 'hq' ? R.hq(naar) : /^c/.test(wat) ? R.training(naar) : R.onderdeel(naar), vol = team.jobs.length >= R.werkplaatsen(team.hq), arm = team.munten < k.munten;
    return '<button type="button" class="tb-knop tb-oker" data-up="' + wat + '"' + (vol || arm ? ' disabled' : '') + ' title="' + (vol ? 'Alle werkplaatsen zijn bezet' : arm ? 'Niet genoeg munten' : '') + '">' + (wat === 'hq' ? 'Niveau ' + naar : 'Naar ' + naar) + ' · ' + munt(k.munten) + ' · ' + duur(k.tijd) + '</button>';
  }
  function tekenHq(){
    var t = team, nu = Date.now() + klokVerschil, wk = T.baanVanWeek(nu), b = wk.baan;
    var volgende = liga ? liga.volgende : T.volgendeRace(nu);
    var stand = liga && liga.teams ? liga.teams : [], mij = stand.findIndex(function(x){ return x.id === 'jij'; });
    var rij = stand.slice(Math.max(0, mij - 1), Math.max(0, mij - 1) + 3);
    var c = t.c.map(function(cr, i){
      return '<article class="tb-kaart tb-coureur" style="border-color:' + (i ? t.k2 : t.k1) + '">' +
        '<div class="tb-cr-kop"><span class="tb-gezicht">' + gezicht(cr.naam, 44) + '</span><div><span class="tb-klein">Coureur ' + (i + 1) + '</span><b>' + esc(cr.naam) + '</b></div>' +
        '<button type="button" class="tb-helmknop" data-naar="garage" aria-label="Helm van ' + esc(cr.naam) + ' ontwerpen"><span id="tbHelmHq' + i + '"></span></button></div>' +
        T.EIGENSCHAPPEN.map(function(e){ var k = upgradeKnop('c' + (i + 1) + '.' + e.id, cr[e.id]); return '<div class="tb-stat"><span>' + e.naam + '</span>' + pips(cr[e.id], R.maxNiveau(t.hq)) + '<b>' + cr[e.id] + '</b></div>' + (k ? '<div class="tb-statknop">' + k + '</div>' : ''); }).join('') +
        (T.EIGENSCHAPPEN.some(function(e){ return cr[e.id] >= R.maxNiveau(t.hq); }) && R.maxNiveau(t.hq) < 10 ? '<p class="tb-klein">Trainen gaat tot niveau ' + R.maxNiveau(t.hq) + '. Een beter hoofdkwartier tilt dat hoger.</p>' : '') +
        '</article>';
    }).join('');
    var pr = T.profiel(b), gewicht = { motor: pr.motor, aero: pr.aero, accu: 0, betrouw: 0 };
    var delen = T.ONDERDELEN.map(function(o){ var w = gewicht[o.id], ster = o.id === 'betrouw' ? 'telt op elke baan' : o.id === 'accu' ? 'telt op elke baan, vooral bij inhalen' : 'telt op ' + esc(b.plaats) + ': ' + (w > 0.62 ? 'zwaar' : w > 0.45 ? 'gemiddeld' : 'licht'); return '<div class="tb-deel' + (w > 0.62 ? ' tb-belangrijk' : '') + '"><b>' + o.naam + '</b><span class="tb-klein">' + o.uit + '</span><span class="tb-telt">' + ster + '</span>' + pips(t[o.id] || 1, R.maxNiveau(t.hq)) + upgradeKnop(o.id, t[o.id] || 1) + '</div>'; }).join('');
    var plaatsen = R.werkplaatsen(t.hq), jobs = '';
    for (var i = 0; i < plaatsen; i++){
      var j = t.jobs[i];
      if (j){ var pct = Math.max(0, Math.min(100, 100 - 100 * (j.eind - nu) / Math.max(1, j.duur)));
        jobs += '<div class="tb-job"><div class="tb-job-kop"><b>Werkplaats ' + (i + 1) + ' · ' + esc(watTekst(j.wat)) + ' ' + j.naar + '</b><span data-eind="' + j.eind + '">' + duur(j.eind - nu) + '</span></div><div class="tb-meter"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
          '<button type="button" class="tb-knop tb-blauw" data-naar="vragen" data-job="' + j.id + '">Versnellen met vragen</button></div>';
      } else jobs += '<div class="tb-job tb-vrij">Werkplaats ' + (i + 1) + ' is vrij. Kies hiernaast een upgrade.</div>';
    }
    var nieuws = (t.nieuws || []).slice(0, 3).map(function(n){
      if (n.s === 'race') return '<li>Race gereden: ' + n.plekken.map(function(p, k){ return 'coureur ' + (k + 1) + ' ' + (p ? 'P' + p : 'viel uit'); }).join(', ') + '. +' + n.punten + ' punten, +' + n.munten + ' munten.</li>';
      if (n.s === 'klaar') return '<li>Klaar: ' + esc(watTekst(n.wat)) + ' is nu niveau ' + n.naar + '.</li>';
      return '';
    }).join('');
    $('tb-hq').innerHTML = '<h2 class="sronly">Hoofdkwartier</h2><div class="tb-hq">' +
      '<section class="tb-kol" aria-label="Volgende race">' +
        '<div class="tb-kaart"><div class="tb-rij"><h3>Race ' + ((liga ? liga.race : 0) + 1) + ' van ' + R.seizoen + '</h3><span class="tb-klein">' + raceTijdTekst(volgende) + '</span></div>' +
        '<div class="tb-minibaan">' + baanSvg(b, 280, 150, { kleur: '#EA9836', gloed: true, breed: 6 }) + '</div>' +
        '<b>' + esc(b.plaats) + ', ' + esc(b.land) + '</b><span class="tb-klein">' + (b.lengte / 1000).toFixed(3).replace('.', ',') + ' km · ' + T.RONDEN + ' ronden' + (wk.herhaling ? ' · deze week geen echte race: een eerdere baan opnieuw' : '') + '</span>' +
        karakter(b) + '<div class="tb-aftel"><b id="tbAftel">' + duur(volgende - nu) + '</b><span>tot de start</span></div>' +
        '<button type="button" class="tb-knop tb-rand" data-naar="strategie">Banden en pitstops kiezen</button></div>' +
        '<div class="tb-kaart"><div class="tb-rij"><h3>Divisie ' + (t.div || 1) + '</h3><button type="button" class="tb-link" data-naar="stand">hele stand</button></div>' +
        (rij.length ? '<ol class="tb-ministand">' + rij.map(function(x){ return '<li' + (x.id === 'jij' ? ' class="jij"' : '') + '><span>' + (stand.indexOf(x) + 1) + '</span><i style="background:' + x.k1 + '"></i><b>' + esc(x.naam) + '</b><em>' + x.punten + '</em></li>'; }).join('') + '</ol>' : '<p class="tb-klein">Na de eerste race staat hier de stand.</p>') +
        '<p class="tb-klein">Na race ' + R.seizoen + ' gaan de beste ' + R.promotie + ' een divisie omhoog.</p></div>' +
      '</section>' +
      '<section class="tb-kol tb-midden" aria-label="Coureurs en auto"><div class="tb-twee">' + c + '</div>' +
        '<div class="tb-kaart"><div class="tb-rij"><h3>De auto</h3><span class="tb-klein">geldt voor allebei je coureurs</span></div><div class="tb-delen">' + delen + '</div></div></section>' +
      '<section class="tb-kol" aria-label="Hoofdkwartier"><div class="tb-kaart"><div class="tb-rij"><h3>Hoofdkwartier</h3><span class="tb-klein">niveau ' + t.hq + '</span></div>' +
        '<div class="tb-jobs">' + jobs + '</div>' +
        '<p class="tb-klein">Niveau ' + Math.min(R.hqMax, t.hq + 1) + ' geeft ' + (R.werkplaatsen(t.hq + 1) > plaatsen ? 'een werkplaats erbij en ' : '') + 'tilt onderdelen en coureurs tot niveau ' + R.maxNiveau(Math.min(R.hqMax, t.hq + 1)) + '.' + (t.hq < R.ingenieur ? ' Op niveau ' + R.ingenieur + ' geeft je ingenieur advies over de strategie.' : '') + '</p>' +
        upgradeKnop('hq', t.hq) + '</div>' +
        (nieuws ? '<div class="tb-kaart"><h3>Nieuws</h3><ul class="tb-nieuws">' + nieuws + '</ul></div>' : '') +
      '</section></div>';
    t.c.forEach(function(cr, i){ var d = $('tbHelmHq' + i); if (d) helmIn(d, cr.helm, 58); });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-up]'); if (!b || b.disabled) return;
    b.disabled = true;
    api('/upgrade', { wat: b.getAttribute('data-up') }).then(function(j){ if (j.team){ team = j.team; tekenBalk(); tekenHq(); } else melding(j.fout || 'Dat lukte niet.'); });
  });
  function melding(t){ var m = $('tbMelding'); m.textContent = t; m.hidden = !t; clearTimeout(melding.k); melding.k = setTimeout(function(){ m.hidden = true; }, 4000); }

  /* ---------- vragen ---------- */
  var vraag = null, versnelJob = '';
  function tekenVragen(job){
    if (job && job !== 'stil') versnelJob = job;
    if (!team.jobs.some(function(j){ return j.id === versnelJob; })) versnelJob = team.jobs.length ? team.jobs.slice().sort(function(a, b){ return a.eind - b.eind; })[0].id : '';
    var vak = ls('tb-vak') || 'reken', niv = +(ls('tb-niv') || 2), nu = Date.now() + klokVerschil, b = Math.round(team.betrouwbaarheid * 100);
    var j = team.jobs.filter(function(x){ return x.id === versnelJob; })[0];
    $('tb-vragen').innerHTML = '<div class="tb-vragen"><aside class="tb-kol">' +
      '<div class="tb-kaart"><h2>Vragen beantwoorden</h2><p class="tb-klein">Elk goed antwoord: ' + R.perGoed[niv] + ' munten en tien minuten van je upgrade. Fout telt mee in je betrouwbaarheid.</p>' +
        '<label class="tb-veld"><span>Vak</span><select id="tbVak">' + VAKKEN.map(function(v){ return '<option value="' + v[0] + '"' + (v[0] === vak ? ' selected' : '') + '>' + v[1] + '</option>'; }).join('') + '</select></label>' +
        '<label class="tb-veld"><span>Niveau</span><select id="tbNiv">' + NIVEAUS.map(function(v){ return '<option value="' + v[0] + '"' + (v[0] === niv ? ' selected' : '') + '>' + v[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="tb-kaart"><h3>Wat je versnelt</h3>' + (team.jobs.length ? '<label class="tb-veld"><span class="sronly">Upgrade</span><select id="tbJob">' + team.jobs.map(function(x){ return '<option value="' + x.id + '"' + (x.id === versnelJob ? ' selected' : '') + '>' + esc(watTekst(x.wat)) + ' ' + x.naar + '</option>'; }).join('') + '</select></label>' +
        '<div class="tb-groot" id="tbJobTijd">' + (j ? duur(j.eind - nu) : '') + '</div>' : '<p class="tb-klein">Er wordt nu niets gebouwd. Je verdient wel munten.</p>') + '</div>' +
      '<div class="tb-kaart"><div class="tb-rij"><span>Vandaag verdiend</span><b>' + team.dag + ' / ' + R.dagMax + '</b></div><div class="tb-meter"><i style="width:' + Math.min(100, team.dag / R.dagMax * 100) + '%;background:#EA9836"></i></div>' +
        '<div class="tb-rij" style="margin-top:10px"><span>Betrouwbaarheid</span><b>' + b + '%</b></div><div class="tb-meter"><i style="width:' + b + '%"></i></div></div>' +
      '</aside><section class="tb-kaart tb-vraagvak" id="tbVraag" aria-live="polite"><p class="tb-klein">Even een vraag ophalen...</p></section></div>';
    $('tbVak').addEventListener('change', function(){ ls('tb-vak', this.value); nieuweVraag(); });
    $('tbNiv').addEventListener('change', function(){ ls('tb-niv', this.value); nieuweVraag(); });
    if ($('tbJob')) $('tbJob').addEventListener('change', function(){ versnelJob = this.value; tekenVragen('stil'); });
    if (vraag && vraag.vak === vak && !vraag.klaar) toonVraag(); else nieuweVraag();
  }
  function nieuweVraag(){
    var vak = ls('tb-vak') || 'reken', niv = +(ls('tb-niv') || 2);
    $('tbVraag').innerHTML = '<p class="tb-klein">Even een vraag ophalen...</p>';
    api('/vraag?vak=' + vak + '&niv=' + niv).then(function(j){
      if (!j.token){ $('tbVraag').innerHTML = '<p>' + esc(j.fout || 'Er kwam geen vraag.') + '</p><button type="button" class="tb-knop tb-rand" id="tbOpnieuw">Opnieuw</button>'; $('tbOpnieuw').onclick = nieuweVraag; return; }
      vraag = j; toonVraag();
    });
  }
  function toonVraag(){
    var v = vraag, naam = (VAKKEN.filter(function(x){ return x[0] === v.vak; })[0] || [0, ''])[1];
    $('tbVraag').innerHTML = '<div class="tb-rij"><span class="tb-label">' + esc(naam) + (v.deel ? ' · ' + esc(v.deel) : '') + '</span></div>' +
      '<p class="tb-vraag">' + esc(v.v) + '</p>' + (v.svg ? '<div class="tb-vraagbeeld">' + v.svg + '</div>' : '') +
      '<div class="tb-opties">' + v.o.map(function(o, i){ return '<button type="button" class="tb-optie" data-k="' + i + '"><b>' + 'ABCD'[i] + '</b>' + esc(o) + '</button>'; }).join('') + '</div><div id="tbUitleg"></div>';
    $('tbVraag').querySelectorAll('[data-k]').forEach(function(b){ b.addEventListener('click', kies); });
  }
  function kies(e){
    var b = e.currentTarget, k = +b.getAttribute('data-k'), v = vraag;
    if (v.klaar) return; v.klaar = true;
    $('tbVraag').querySelectorAll('[data-k]').forEach(function(x){ x.disabled = true; });
    api('/antwoord', { token: v.token, keuze: k, job: versnelJob }).then(function(j){
      if (j.team){ team = j.team; tekenBalk(); }
      $('tbVraag').querySelectorAll('[data-k]').forEach(function(x){ var tekst = x.textContent.slice(1); if (tekst === j.juist) x.classList.add('goed'); else if (+x.getAttribute('data-k') === k) x.classList.add('fout'); });
      var kop = j.goed ? 'Goed!' + (j.munten ? ' +' + j.munten + ' munten' : j.dagVol ? ' (je munten voor vandaag zijn op)' : '') + (j.sneller ? ', ' + Math.round(j.sneller / 60000) + ' minuten sneller' : '') : 'Helaas, het was: ' + j.juist;
      $('tbUitleg').innerHTML = '<div class="tb-uitleg ' + (j.goed ? 'goed' : 'fout') + '"><div><b>' + esc(kop) + '</b>' + (j.uitleg ? '<p>' + esc(j.uitleg) + '</p>' : '') + '</div><button type="button" class="tb-knop tb-room" id="tbVolgende">Volgende vraag</button></div>';
      $('tbVolgende').addEventListener('click', function(){ tekenVragen('stil'); });
      $('tbVolgende').focus({ preventScroll: true });
      var jt = $('tbJobTijd'), jb = team && team.jobs.filter(function(x){ return x.id === versnelJob; })[0]; if (jt) jt.textContent = jb ? duur(jb.eind - Date.now() - klokVerschil) : 'Klaar!';
    });
  }

  /* ---------- strategie ---------- */
  var bewaarStrat = [null, null];
  function tekenStrategie(){
    var t = team;
    var kaarten = t.c.map(function(cr, i){
      var s = T.strategie(cr.strat), rt = T.rondetijden(s, T.baanVanWeek(Date.now() + klokVerschil).baan), tot = rt.reduce(function(a, b){ return a + b; }, 0);
      var grens = [0].concat(s.stops.map(function(p){ return p.ronde; })).concat([T.RONDEN]), banden = [s.start].concat(s.stops.map(function(p){ return p.band; }));
      function knoppen(gekozen, doel){ return ['Z', 'M', 'H'].map(function(b){ return '<button type="button" class="tb-band' + (gekozen === b ? ' aan' : '') + '" style="--band:' + T.BAND[b].kleur + '" data-strat="' + i + '" data-doel="' + doel + '" data-band="' + b + '" aria-pressed="' + (gekozen === b) + '" aria-label="' + T.BAND[b].naam + '">' + b + '</button>'; }).join(''); }
      return '<article class="tb-kaart tb-strat" style="border-color:' + (i ? t.k2 : t.k1) + '"><div class="tb-rij"><h3>' + esc(cr.naam) + '</h3><span class="tb-klein">verwachte tijd <b class="tb-tijd">' + Math.floor(tot / 60) + ':' + (tot % 60).toFixed(1).padStart(4, '0').replace('.', ',') + '</b></span></div>' +
        '<div class="tb-stints" aria-label="' + banden.map(function(b, k){ return T.BAND[b].naam + ' tot ronde ' + grens[k + 1]; }).join(', ') + '">' + banden.map(function(b, k){ var n = grens[k + 1] - grens[k]; return '<span style="flex:' + n + ';background:' + T.BAND[b].kleur + '">' + T.BAND[b].naam + ' · ' + n + '</span>'; }).join('') + '</div>' +
        '<div class="tb-stratrij"><div><span class="tb-klein">Start op</span><div class="tb-banden">' + knoppen(s.start, 'start') + '</div></div>' +
        s.stops.map(function(p, k){ return '<div><span class="tb-klein">Pitstop ' + (k + 1) + '</span><div class="tb-banden"><button type="button" class="tb-plus" data-strat="' + i + '" data-doel="r' + k + '" data-d="-1" aria-label="Een ronde eerder">−</button><b class="tb-ronde">ronde ' + p.ronde + '</b><button type="button" class="tb-plus" data-strat="' + i + '" data-doel="r' + k + '" data-d="1" aria-label="Een ronde later">+</button>' + knoppen(p.band, 'b' + k) + '</div></div>'; }).join('') +
        '<div><span class="tb-klein">Pitstops</span><div class="tb-banden"><button type="button" class="tb-knop tb-rand tb-smal" data-strat="' + i + '" data-doel="erbij"' + (s.stops.length >= 2 ? ' disabled' : '') + '>+ stop</button><button type="button" class="tb-knop tb-rand tb-smal" data-strat="' + i + '" data-doel="eraf"' + (s.stops.length <= 1 ? ' disabled' : '') + '>− stop</button></div></div>' +
        '<label class="tb-vink"><input type="checkbox" data-strat="' + i + '" data-doel="sc"' + (s.sc ? ' checked' : '') + '> Binnenkomen bij safety car</label></div></article>';
    }).join('');
    var wb = T.baanVanWeek(Date.now() + klokVerschil).baan, rtb = T.profiel(wb).rondetijd, lo = Math.floor(rtb - 2), hi = lo + 6;
    var lijnen = t.c.map(function(cr){ return T.rondetijden(cr.strat, wb).map(function(x, j){ var y = 170 - (Math.min(hi, Math.max(lo, x > rtb + 12 ? hi : x)) - lo) / 6 * 150; return (40 + j * (330 / (T.RONDEN - 1))).toFixed(1) + ',' + y.toFixed(1); }).join(' '); });
    var b = T.besteEenStop();
    $('tb-strategie').innerHTML = '<div class="tb-stratscherm"><div class="tb-kol"><h2>Strategie voor de volgende race</h2>' + kaarten + '</div><aside class="tb-kol">' +
      '<div class="tb-kaart"><h3>Rondetijd per ronde in ' + esc(wb.plaats) + '</h3><svg viewBox="0 0 380 200" width="100%" role="img" aria-label="Rondetijden van je coureurs per ronde; een pitstop is een piek, slijtage een langzame stijging">' +
        '<line x1="40" y1="20" x2="40" y2="170" stroke="#2F3C78"/><line x1="40" y1="170" x2="370" y2="170" stroke="#2F3C78"/><text x="34" y="24" text-anchor="end" font-size="10" fill="#B9C3E6">' + hi + ' s</text><text x="34" y="172" text-anchor="end" font-size="10" fill="#B9C3E6">' + lo + ' s</text><text x="40" y="188" font-size="10" fill="#B9C3E6">ronde 1</text><text x="370" y="188" text-anchor="end" font-size="10" fill="#B9C3E6">' + T.RONDEN + '</text>' +
        '<polyline points="' + lijnen[0] + '" fill="none" stroke="' + t.k1 + '" stroke-width="2.5"/><polyline points="' + lijnen[1] + '" fill="none" stroke="' + t.k2 + '" stroke-width="2.5" stroke-dasharray="6 4"/></svg>' +
        '<p class="tb-klein">Elke ronde op dezelfde banden gaat iets langzamer. Een pitstop kost ' + T.PIT + ' seconden, onder de safety car maar ' + T.PIT_SC + '. Je moet minstens twee soorten banden gebruiken.</p></div>' +
      '<div class="tb-kaart tb-advies"><h3>Advies van je ingenieur</h3>' + (t.hq >= R.ingenieur ? '<p>Met een stop is ' + T.BAND[b.s.start].naam + ' tot ronde ' + b.s.stops[0].ronde + ' en dan ' + T.BAND[b.s.stops[0].band].naam + ' het snelst.</p>' : '<p class="tb-klein">Dit advies krijg je met een hoofdkwartier op niveau ' + R.ingenieur + '.</p>') + '</div>' +
      '<div class="tb-kaart tb-klein" id="tbStratBewaard" aria-live="polite">Je keuzes worden vanzelf bewaard.</div></aside></div>';
  }
  function wijzigStrat(i, doel, el){
    var s = T.strategie(team.c[i].strat);
    s = { start: s.start, stops: s.stops.map(function(p){ return { ronde: p.ronde, band: p.band }; }), sc: s.sc };
    if (doel === 'start') s.start = el.getAttribute('data-band');
    else if (doel === 'sc') s.sc = el.checked;
    else if (doel === 'erbij'){ var laatst = s.stops.length ? s.stops[s.stops.length - 1].ronde : 4; if (laatst + 3 < T.RONDEN) s.stops.push({ ronde: laatst + 3, band: 'M' }); }
    else if (doel === 'eraf') s.stops.pop();
    else if (/^b\d$/.test(doel)) s.stops[+doel[1]].band = el.getAttribute('data-band');
    else if (/^r\d$/.test(doel)){ var k = +doel[1], d = +el.getAttribute('data-d'), lo = k ? s.stops[k - 1].ronde + 1 : 1, hi = s.stops[k + 1] ? s.stops[k + 1].ronde - 1 : T.RONDEN - 1; s.stops[k].ronde = Math.max(lo, Math.min(hi, s.stops[k].ronde + d)); }
    team.c[i].strat = T.strategie(s);
    tekenStrategie();
    $('tbStratBewaard').textContent = 'Even bewaren...';
    clearTimeout(bewaarStrat[i]);
    bewaarStrat[i] = setTimeout(function(){ api('/strategie', { nr: i + 1, strat: team.c[i].strat }).then(function(j){ if (j.team){ team.c[i].strat = j.team.c[i].strat; var x = $('tbStratBewaard'); if (x) x.textContent = 'Bewaard. Zo rijden ze de volgende race.'; } else melding(j.fout || 'Bewaren lukte niet.'); }); }, 500);
  }
  $('tb-strategie').addEventListener('click', function(e){ var b = e.target.closest('[data-strat]'); if (!b || b.disabled || b.type === 'checkbox') return; wijzigStrat(+b.getAttribute('data-strat'), b.getAttribute('data-doel'), b); });
  $('tb-strategie').addEventListener('change', function(e){ var b = e.target.closest('input[data-strat]'); if (b) wijzigStrat(+b.getAttribute('data-strat'), 'sc', b); });

  /* ---------- de race terugkijken ---------- */
  var RS = null;   /* de herhaling die loopt */
  function stopRace(){ if (RS){ cancelAnimationFrame(RS.raf); RS = null; } }
  function tekenRace(){
    var wk = liga && liga.laatste;
    if (!wk){
      var v = liga ? liga.volgende : T.volgendeRace(Date.now());
      $('tb-race').innerHTML = '<div class="tb-kaart tb-leeg"><h2>Nog geen race</h2><p>De eerste race van je divisie is ' + raceTijdTekst(v) + '. Daarna kun je hem hier de hele week terugkijken.</p><button type="button" class="tb-knop tb-oker" data-naar="strategie">Kies je strategie</button></div>';
      return;
    }
    if (race && race.week === wk.week && race.div === wk.div) return startRace();
    $('tb-race').innerHTML = '<div class="tb-kaart tb-leeg"><h2>De race laden...</h2></div>';
    api('/race?week=' + encodeURIComponent(wk.week) + '&div=' + wk.div).then(function(j){
      if (!j.sim){ $('tb-race').innerHTML = '<div class="tb-kaart tb-leeg"><h2>De race is er niet</h2><p>' + esc(j.fout || '') + '</p></div>'; return; }
      race = j; startRace();
    });
  }
  function bandNaKeuze(sim){
    /* per auto de pitstops, uitval en banden in tijd; en de vlaggen */
    var per = sim.autos.map(function(a){ return { pit: [], uit: null, banden: [[0, a.start]] }; }), sc = [], geel = [];
    sim.gebeurt.forEach(function(e){
      if (e.s === 'pit') per[e.a].pit.push([e.t, null, e.b]);
      if (e.s === 'pituit'){ var p = per[e.a].pit[per[e.a].pit.length - 1]; if (p) p[1] = e.t; per[e.a].banden.push([e.t, e.b]); }
      if (e.s === 'crash' || e.s === 'pech') per[e.a].uit = [e.t, e.s, e.sec];
      if (e.s === 'geel') geel.push([e.t, e.tot, e.sec]);
      if (e.s === 'sc') sc.push([e.t, null]);
      if (e.s === 'scuit' && sc.length) sc[sc.length - 1][1] = e.t;
    });
    return { per: per, sc: sc, geel: geel };
  }
  var VLAG = {
    groen: { naam: 'Groene vlag', uit: 'Er wordt geracet.', svg: '<rect x="4" y="3" width="22" height="15" fill="#4FB37E"/>' },
    geel: { naam: 'Gele vlag', uit: 'Gevaar in een sector: langzamer en niet inhalen. Active aero en overtake mode staan daar uit.', svg: '<rect x="4" y="3" width="22" height="15" fill="#F2D649"/>' },
    sc: { naam: 'Safety car', uit: 'Iedereen achter de safety car, niet inhalen. De batterijen laden op. Een pitstop kost nu maar ' + T.PIT_SC + ' seconden.', svg: '<rect x="4" y="3" width="22" height="15" fill="#F2D649"/><text x="15" y="14" text-anchor="middle" font-size="8" font-weight="700" fill="#14224C" font-family="Poppins,sans-serif">SC</text>' },
    finish: { naam: 'Geblokte vlag', uit: 'De race is voorbij.', svg: '<rect x="4" y="3" width="22" height="15" fill="#FBF6F1"/>' + [0, 1, 2, 3].map(function(i){ return [0, 1, 2].map(function(j){ return (i + j) % 2 ? '' : '<rect x="' + (4 + i * 5.5) + '" y="' + (3 + j * 5) + '" width="5.5" height="5" fill="#14224C"/>'; }).join(''); }).join('') },
    start: { naam: 'Start', uit: 'Als de lichten uitgaan, begint de race.', svg: '<rect x="4" y="3" width="22" height="15" fill="#F26749"/>' }
  };
  function vlagSvg(soort, maat){ return '<svg viewBox="0 0 30 34" width="' + maat + '" height="' + Math.round(maat * 34 / 30) + '" aria-hidden="true"><line x1="4" y1="2" x2="4" y2="33" stroke="#C9D2EE" stroke-width="2"/>' + VLAG[soort].svg + '</svg>'; }
  function startRace(){
    stopRace();
    var r = race, sim = r.sim, b = T.baan(r.baan), W = 760, H = 520, BR = 20;
    var g = geo(b, W, H, 46), punt = g.punt, prof = g.prof, ronde = sim.ronde || prof.rondetijd;
    var info = bandNaKeuze(sim), deel = r.deelnemers, eigen = r.eigen;
    /* de pitstraat: een weg naast het rechte stuk voor de finish, met een in- en uitrit,
       aan de kant waar de rest van de baan het verst weg ligt */
    var P0 = -0.07, P1 = 0.06;
    function afstandTotBaan(q){ var m = 1e9; for (var i = 0; i < T.NP; i++){ var f = i / T.NP; if (f > 0.9 + P0 + 0.02 || f < P1 + 0.12) continue; var s = g.S[i]; m = Math.min(m, Math.hypot(s[0] - q[0], s[1] - q[1])); } return m; }
    var mid = punt(0), nm = g.normaal(0), kant = afstandTotBaan([mid[0] + nm[0] * 40, mid[1] + nm[1] * 40]) >= afstandTotBaan([mid[0] - nm[0] * 40, mid[1] - nm[1] * 40]) ? 1 : -1;
    function zacht(x){ x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    function pitPad(u, extra){
      var f = P0 + (P1 - P0) * u, p = punt(f), n = g.normaal(f), off = kant * (BR * 0.3 + (44 - BR * 0.3 + (extra || 0)) * Math.min(zacht(u / 0.24), zacht((1 - u) / 0.24)));
      return [p[0] + n[0] * off, p[1] + n[1] * off];
    }
    var pitLijn = []; for (var k = 0; k <= 60; k++) pitLijn.push(pitPad(k / 60));
    /* tien garages langs het middenstuk, in de kleur van elk team */
    var garages = deel.map(function(e, i){ var u = 0.3 + 0.4 * (i + 0.5) / deel.length; return { u: u, p: pitPad(u, 19), e: e, mijn: i === eigen }; });
    function garageSvg(x){ var f = P0 + (P1 - P0) * x.u, n = g.normaal(f), hoek = Math.atan2(n[1], n[0]) * 180 / Math.PI; return '<g transform="translate(' + x.p[0].toFixed(1) + ' ' + x.p[1].toFixed(1) + ') rotate(' + hoek.toFixed(1) + ')"><rect x="-5" y="-9" width="12" height="18" rx="2" fill="#1A2350" stroke="' + (x.mijn ? '#FBF6F1' : 'rgba(251,246,241,.25)') + '" stroke-width="' + (x.mijn ? 1.5 : 1) + '"/><rect x="' + (kant > 0 ? 4 : -5) + '" y="-9" width="3" height="18" fill="' + x.e.k1 + '"/></g>'; }
    /* de sectoren en de posten van de baancommissarissen */
    function sectorPad(s){ var pts = []; for (var i = Math.floor((s - 1) * T.NP / 3); i <= Math.floor(s * T.NP / 3); i++) pts.push(g.S[i % T.NP]); return lijn(pts); }
    var zones = [], z0 = -1;
    for (var zi = 0; zi <= T.NP; zi++){ var rechtHier = zi < T.NP && prof.st[zi] > 0.85; if (rechtHier && z0 < 0) z0 = zi; else if (!rechtHier && z0 >= 0){ if (zi - z0 >= 5) zones.push([z0, zi - 1]); z0 = -1; } }
    function zoneSvg(z, nr){
      var pts = []; for (var i = z[0]; i <= z[1]; i++) pts.push(g.S[i]);
      var f0 = z[0] / T.NP, a0 = punt(f0), n0 = g.normaal(f0), h = BR * 0.62;
      return '<g id="tbZone' + nr + '" data-sec="' + T.sector(f0) + '" style="transition:opacity .3s"><path d="' + lijn(pts) + '" fill="none" stroke="#83A5F2" stroke-width="2.5" stroke-dasharray="7 6" stroke-linecap="round" opacity=".75"/>' +
        '<line x1="' + (a0[0] - n0[0] * h).toFixed(1) + '" y1="' + (a0[1] - n0[1] * h).toFixed(1) + '" x2="' + (a0[0] + n0[0] * h).toFixed(1) + '" y2="' + (a0[1] + n0[1] * h).toFixed(1) + '" stroke="#EA9836" stroke-width="3" stroke-linecap="round"/></g>';
    }
    var posten = [0, 1 / 3, 2 / 3].map(function(f, i){ var p = punt(f), n = g.normaal(f), o = -kant * 30; return { x: p[0] + n[0] * o, y: p[1] + n[1] * o, f: f, nr: i }; });
    /* de pitstraat: asfalt, witte randen, de pitmuur en de garages */
    var pitSvg = '<path d="' + lijn(pitLijn) + '" fill="none" stroke="#DCE3F6" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + lijn(pitLijn) + '" fill="none" stroke="#2B335F" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + lijn(pitLijn.slice(14, 47).map(function(q, i){ var u = (14 + i) / 60, f = P0 + (P1 - P0) * u, n = g.normaal(f); return [q[0] - n[0] * kant * 11, q[1] - n[1] * kant * 11]; })) + '" fill="none" stroke="#83A5F2" stroke-width="2.5" stroke-dasharray="1 0"/>' +
        garages.map(garageSvg).join('');
    $('tb-race').innerHTML = '<div class="tb-racescherm"><section class="tb-baanvak" aria-label="De baan met alle auto\'s als stippen">' +
      '<div class="tb-racekop"><h2>Race · ' + esc(b.plaats) + ', ' + esc(b.land) + '</h2><span class="tb-klein">divisie ' + r.div + ' · gereden ' + raceTijdTekst(r.gereden) + (r.herhaling ? ' · een eerdere baan opnieuw' : '') + '</span></div>' +
      '<div class="tb-lichten" id="tbLichten" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="tb-baan" id="tbBaan" style="width:' + W + 'px;height:' + H + 'px"><svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' +
        '<defs><pattern id="tbGrond" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(131,165,242,.07)"/></pattern></defs>' +
        '<rect width="' + W + '" height="' + H + '" fill="url(#tbGrond)"/>' +
        baanLagen(g, BR, { voorRand: pitSvg, voorAsfalt: [1, 2, 3].map(function(s){ return '<path id="tbGeel' + s + '" d="' + sectorPad(s) + '" fill="none" stroke="#F2D649" stroke-width="' + (BR * 1.5) + '" stroke-linejoin="round" opacity="0" style="transition:opacity .3s"/>'; }).join('') }) +
        zones.map(zoneSvg).join('') +
        posten.map(function(p){ return '<g class="tb-post" transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')"><circle r="9" fill="#0F1636" stroke="rgba(251,246,241,.35)"/><text y="3.5" text-anchor="middle" font-size="9" font-weight="700" fill="#C9D2EE" font-family="Poppins,sans-serif">' + (p.nr ? 'S' + (p.nr + 1) : 'S1') + '</text><rect id="tbPost' + p.nr + '" x="5" y="-20" width="14" height="10" rx="1.5" fill="#4FB37E"/><line x1="5" y1="-21" x2="5" y2="-6" stroke="#C9D2EE" stroke-width="1.5"/></g>'; }).join('') +
      '</svg></div>' +
      '<div class="tb-raceonder"><div class="tb-banden-eigen" id="tbEigenBanden"></div><div class="tb-uitleg26">' + karakter(b, true) +'<p class="tb-klein"><i class="tb-lz tb-lz-aa"></i>Active aero: op de rechte stukken klapt de vleugel open, dus minder luchtweerstand.</p>' +'<p class="tb-klein"><i class="tb-lz tb-lz-ot"></i>Zit je hier binnen 1 seconde van de auto voor je, dan krijg je overtake mode: extra stroom uit de batterij en een veel grotere kans om in te halen.</p></div></div></section>' +
      '<aside class="tb-kol"><div class="tb-kaart tb-vlag" id="tbVlag" aria-live="polite"></div>' +
      '<div class="tb-kaart tb-bediening"><b id="tbRonde">Ronde 1 / ' + T.RONDEN + '</b><button type="button" class="tb-knop tb-rand tb-smal" id="tbSpeel">Pauze</button><button type="button" class="tb-knop tb-rand tb-smal" id="tbTempo">2×</button><button type="button" class="tb-knop tb-rand tb-smal" id="tbOpnieuwR">Opnieuw</button><button type="button" class="tb-knop tb-rand tb-smal" id="tbEind">Naar de finish</button></div>' +
      '<div class="tb-kaart tb-racestand"><h3>Stand</h3><ol id="tbRaceStand"></ol></div><div class="tb-kaart tb-log" aria-live="polite"><h3>Wat er gebeurt</h3><ul id="tbLog"></ul></div></aside></div>';
    var baanEl = $('tbBaan'), stippen = sim.autos.map(function(a){
      var e = deel[a.t], el = document.createElement('div'), mijn = a.t === eigen, kl = a.nr === 1 ? e.k1 : e.k2;
      el.className = 'tb-stip' + (mijn ? ' mijn' : '') + (helderheid(kl) < 0.25 ? ' donker' : ''); el.textContent = a.nr; el.title = e.naam + ' ' + a.nr;
      el.style.background = kl; el.style.color = licht(kl) ? '#14224C' : '#FBF6F1';
      baanEl.appendChild(el); return el;
    });
    var scEl = document.createElement('div'); scEl.className = 'tb-stip tb-scstip'; scEl.textContent = 'SC'; scEl.hidden = true; baanEl.appendChild(scEl);
    var eind = (sim.beelden.length - 1) * sim.stap, VOOR = 3.2, staat = { t: 0, voor: 0, tempo: 2, loopt: true, laatst: performance.now() };
    var tempo = ronde / 12;   /* een ronde duurt in de herhaling twaalf seconden */
    RS = staat; staat.sim = sim; window.TBRACE = staat;   /* om te testen: naar een moment springen */
    $('tbSpeel').onclick = function(){ staat.loopt = !staat.loopt; this.textContent = staat.loopt ? 'Pauze' : 'Verder'; staat.laatst = performance.now(); };
    $('tbTempo').onclick = function(){ staat.tempo = staat.tempo === 1 ? 2 : staat.tempo === 2 ? 4 : 1; this.textContent = staat.tempo + '×'; };
    $('tbOpnieuwR').onclick = function(){ staat.t = 0; staat.voor = 0; staat.loopt = true; $('tbSpeel').textContent = 'Pauze'; };
    $('tbEind').onclick = function(){ staat.t = eind; staat.voor = VOOR; };
    function pos(i, t){ var f = Math.max(0, t) / sim.stap, k2 = Math.max(0, Math.min(sim.beelden.length - 2, Math.floor(f))), s = Math.max(0, Math.min(1, f - k2)); return (sim.beelden[k2][i] * (1 - s) + sim.beelden[k2 + 1][i] * s) / 1000; }
    function pitStand(i, t){ var x = info.per[i].pit.filter(function(p){ return t >= p[0] && (p[1] == null || t < p[1]); })[0]; return x ? (t - x[0]) / Math.max(1, (x[1] || x[0] + 20) - x[0]) : -1; }
    var OT = (sim.ot || []).map(function(o){ return [o[0], o[1], Math.max(o[2], o[0] + 1)]; });
    function otNu(i, t){ for (var k = 0; k < OT.length; k++) if (OT[k][1] === i && t >= OT[k][0] && t < OT[k][2]) return true; return false; }
    function otTel(i, t){ var n = 0; OT.forEach(function(o){ if (o[1] === i && o[0] <= t) n++; }); return n; }
    function accuNu(i, t){ var A = sim.accu; if (!A || !A.length) return -1; var f = Math.max(0, t) / sim.accuStap, k = Math.min(A.length - 1, Math.floor(f)), k2 = Math.min(A.length - 1, k + 1), s = Math.min(1, f - k); return (A[k][i] * (1 - s) + A[k2][i] * s) / 100; }
    function band(i, t){ var bb = info.per[i].banden, x = bb[0][1]; bb.forEach(function(q){ if (t >= q[0]) x = q[1]; }); return x; }
    function uit(i, t){ var u = info.per[i].uit; return u && t >= u[0] ? u[1] : ''; }
    function scNu(t){ return info.sc.some(function(s){ return t >= s[0] && (s[1] == null || t < s[1]); }); }
    function geelNu(t){ return info.geel.filter(function(x){ return t >= x[0] && t < x[1]; }).map(function(x){ return x[2]; }); }
    var NAAM = function(i){ var a = sim.autos[i], e = deel[a.t]; return a.t === eigen ? 'jouw ' + e.c[a.nr - 1].naam : e.naam + ' ' + a.nr; };
    var finishT = {}; sim.gebeurt.forEach(function(e){ if (e.s === 'finish') finishT[e.a] = e.t; });
    var eersteFinish = Math.min.apply(null, Object.keys(finishT).map(function(k){ return finishT[k]; }).concat([eind]));
    var vorigeLog = '', vorigeVlag = '';
    function teken(){
      var t = staat.t, sc = scNu(t), geel = geelNu(t), klaar = t >= eersteFinish, pitTel = {};
      /* de startlichten: vijf rode lampen gaan een voor een aan en dan samen uit */
      var aan = staat.voor < VOOR ? Math.min(5, Math.floor(staat.voor / 0.5)) : 0;
      $('tbLichten').hidden = staat.voor >= VOOR + 0.6; $('tbLichten').querySelectorAll('i').forEach(function(l, k){ l.classList.toggle('aan', k < aan); });
      var orde = sim.autos.map(function(a, i){ return i; }).sort(function(x, y){
        var ux = uit(x, t), uy = uit(y, t); if (!!ux !== !!uy) return ux ? 1 : -1;
        var fx = finishT[x] != null && t >= finishT[x], fy = finishT[y] != null && t >= finishT[y];
        if (fx && fy) return finishT[x] - finishT[y]; if (fx !== fy) return fx ? -1 : 1;
        return pos(y, t) - pos(x, t);
      });
      var leider = orde[0], pl = pos(leider, t);
      stippen.forEach(function(el, i){
        var p = pos(i, t), q, u = uit(i, t), ps = pitStand(i, t), a = sim.autos[i];
        if (ps >= 0 && !u){
          /* door de pitstraat: inrijden, stilstaan bij de garage, uitrijden */
          var gu = garages[a.t].u, uu = ps < 0.3 ? 0.02 + (gu - 0.02) * zacht(ps / 0.3) : ps < 0.75 ? gu : gu + (0.98 - gu) * zacht((ps - 0.75) / 0.25);
          q = pitPad(uu, ps >= 0.3 && ps < 0.75 ? (a.nr === 1 ? -4 : 4) : 0);
        } else { q = punt(p); if (u){ var n = g.normaal(p); q = [q[0] + n[0] * 18, q[1] + n[1] * 18]; } }
        el.style.transform = 'translate(' + q[0].toFixed(1) + 'px,' + q[1].toFixed(1) + 'px)';
        el.classList.toggle('uit', !!u);
        el.classList.toggle('ot', !u && ps < 0 && otNu(i, t));
      });
      scEl.hidden = !sc;
      if (sc){ var sq = punt(pl + 0.025); scEl.style.transform = 'translate(' + sq[0].toFixed(1) + 'px,' + sq[1].toFixed(1) + 'px)'; }
      [1, 2, 3].forEach(function(s){ var el = $('tbGeel' + s); if (el) el.setAttribute('opacity', sc || geel.indexOf(s) >= 0 ? 1 : 0); });
      zones.forEach(function(z, nr){ var el = $('tbZone' + nr); if (el) el.style.opacity = sc || geel.indexOf(+el.getAttribute('data-sec')) >= 0 ? 0.15 : 1; });
      var vlag = klaar ? 'finish' : staat.voor < VOOR ? 'start' : sc ? 'sc' : geel.length ? 'geel' : 'groen';
      [0, 1, 2].forEach(function(nr){ var el = $('tbPost' + nr); if (!el) return; var s = nr + 1, kl = klaar ? '#FBF6F1' : sc || geel.indexOf(s) >= 0 ? '#F2D649' : '#4FB37E'; el.setAttribute('fill', kl); });
      if (vlag + geel.join() !== vorigeVlag){
        vorigeVlag = vlag + geel.join();
        $('tbVlag').innerHTML = '<div class="tb-vlagrij">' + vlagSvg(vlag, 34) + '<div><b>' + VLAG[vlag].naam + (vlag === 'geel' ? ' in sector ' + geel.join(' en ') : '') + '</b><span class="tb-klein">' + VLAG[vlag].uit + '</span></div></div>';
      }
      $('tbRonde').textContent = klaar && t >= eind ? 'Finish' : staat.voor < VOOR ? 'Start' : 'Ronde ' + Math.min(T.RONDEN, Math.max(1, Math.floor(pl) + 1)) + ' / ' + T.RONDEN;
      if (!teken.n || teken.n++ % 6 === 0){
        teken.n = teken.n || 1;
        $('tbRaceStand').innerHTML = orde.map(function(i, k2){
          var a = sim.autos[i], e = deel[a.t], u = uit(i, t), mijn = a.t === eigen, bnd = band(i, t);
          var gat = u ? (u === 'crash' ? 'crash' : 'pech') : pitStand(i, t) >= 0 ? 'pitstop' : k2 === 0 ? 'leider' : '+' + Math.max(0, (pl - pos(i, t)) * ronde).toFixed(1) + ' s';
          return '<li class="' + (mijn ? 'mijn' : '') + (u ? ' uit' : '') + (!u && otNu(i, t) ? ' ot' : '') + '"><span>' + (u ? '-' : k2 + 1) + '</span><i style="background:' + (a.nr === 1 ? e.k1 : e.k2) + '"></i><b>' + esc(e.naam) + ' ' + a.nr + '</b><em class="tb-bandje" style="--band:' + T.BAND[bnd].kleur + '">' + bnd + '</em><small>' + gat + '</small></li>';
        }).join('');
        var eigenB = sim.autos.map(function(a, i){ return i; }).filter(function(i){ return sim.autos[i].t === eigen; });
        $('tbEigenBanden').innerHTML = eigenB.length ? '<b>Jouw auto\'s</b>' + eigenB.map(function(i){
          var bnd = band(i, t), B = T.BAND[bnd], laatste = info.per[i].banden.filter(function(q){ return t >= q[0]; }).pop() || [0], oud = pos(i, t) - pos(i, laatste[0]), over = Math.max(0, Math.min(1, 1 - oud / B.vol));
          return '<div class="tb-rij"><span>' + esc(deel[sim.autos[i].t].c[sim.autos[i].nr - 1].naam) + '</span><em class="tb-bandje" style="--band:' + B.kleur + '">' + bnd + '</em><div class="tb-meter"><i style="width:' + Math.round(over * 100) + '%;background:' + (over < 0.25 ? '#F26749' : '#83A5F2') + '"></i></div><small>' + (uit(i, t) ? '-' : Math.round(over * 100) + '%') + '</small></div>' +
            (function(){ var ac = accuNu(i, t); if (ac < 0) return ''; var ot = !uit(i, t) && otNu(i, t);
              return '<div class="tb-rij tb-accurij"><span>batterij' + (ot ? ' <em class="tb-otje">OT</em>' : '') + '</span><i class="tb-bliksem" aria-hidden="true"></i><div class="tb-meter"><i style="width:' + Math.round(ac * 100) + '%;background:' + (ot ? '#EA9836' : ac < 0.15 ? '#F26749' : '#FCDED6') + '"></i></div><small>' + (uit(i, t) ? '-' : Math.round(ac * 100) + '%') + '</small></div><small class="tb-klein tb-otteller">overtake mode ' + otTel(i, t) + ' keer gebruikt</small>'; })();
        }).join('') : '';
        var log = sim.gebeurt.filter(function(e){ return e.t <= t && e.s !== 'finish' && e.s !== 'pituit' && (e.s !== 'pit' || sim.autos[e.a].t === eigen || e.sc); }).slice(-5).reverse().map(function(e){
          var rnd = 'Ronde ' + Math.min(T.RONDEN, Math.max(1, Math.floor(pos(leider, e.t)) + 1)) + ' · ';
          if (e.s === 'geel') return rnd + 'gele vlag in sector ' + e.sec;
          if (e.s === 'sc') return rnd + 'safety car op de baan';
          if (e.s === 'scuit') return rnd + 'safety car gaat eruit: groene vlag';
          if (e.s === 'crash') return rnd + NAAM(e.a) + ' crasht';
          if (e.s === 'pech') return rnd + NAAM(e.a) + ' valt uit: motorpech';
          if (e.s === 'pit') return rnd + NAAM(e.a) + ' naar binnen' + (e.sc ? ' onder de safety car' : '') + ': ' + T.BAND[e.b].naam;
          return '';
        });
        if (klaar){ var w = sim.uitslag[0]; log.unshift('Geblokte vlag · ' + esc(deel[w.t].naam) + ' ' + w.nr + ' wint'); }
        var html = log.map(function(x){ return '<li>' + x + '</li>'; }).join('');
        if (html !== vorigeLog){ $('tbLog').innerHTML = html; vorigeLog = html; }
      }
    }
    function stap(nu){
      if (RS !== staat) return;
      /* het eerste beeld kan een tijd van voor de klik meekrijgen: nooit terug in de tijd */
      var dt = Math.max(0, Math.min(0.1, (nu - staat.laatst) / 1000)); staat.laatst = nu;
      if (staat.loopt){
        if (staat.voor < VOOR) staat.voor += dt;
        else if (staat.t < eind) staat.t = Math.min(eind, staat.t + dt * tempo * staat.tempo);
      }
      teken();
      staat.raf = requestAnimationFrame(stap);
    }
    teken.n = 0; teken();
    staat.raf = requestAnimationFrame(stap);
  }
  function helderheid(k){ var x = parseInt(String(k).slice(1), 16); return (((x >> 16) & 255) * 0.299 + ((x >> 8) & 255) * 0.587 + (x & 255) * 0.114) / 255; }
  function licht(k){ return helderheid(k) > 0.6; }

  /* ---------- stand en uitslag ---------- */
  function tekenStand(){
    var st = liga && liga.teams ? liga.teams : [];
    var tabel = '<table class="tb-tabel"><thead><tr><th>Plek</th><th>Team</th><th class="r">Punten</th></tr></thead><tbody>' + st.map(function(x, i){
      var zone = i < R.promotie && (liga.div > 1) ? ' op' : i >= st.length - R.promotie && liga.div < liga.divisies ? ' neer' : '';
      return '<tr class="' + (x.id === 'jij' ? 'mijn' : '') + zone + '"><td>' + (i + 1) + '</td><td><i class="tb-bol" style="background:' + x.k1 + '"></i>' + esc(x.naam) + (x.bot ? ' <small class="tb-klein">(vult aan)</small>' : '') + '</td><td class="r">' + x.punten + '</td></tr>';
    }).join('') + '</tbody></table>';
    var uitslag = '<p class="tb-klein">Na de eerste race zie je hier de uitslag.</p>';
    if (race && race.sim){
      uitslag = '<table class="tb-tabel"><thead><tr><th>Plek</th><th>Coureur</th><th>Team</th><th class="r">Punten</th></tr></thead><tbody>' + race.sim.uitslag.map(function(u){
        var e = race.deelnemers[u.t], pt = u.plek && u.plek <= R.punten.length ? R.punten[u.plek - 1] : 0;
        return '<tr class="' + (u.t === race.eigen ? 'mijn' : '') + (u.uit ? ' uitv' : '') + '"><td>' + (u.plek || '-') + '</td><td><i class="tb-bol" style="background:' + (u.nr === 1 ? e.k1 : e.k2) + '"></i>' + esc(e.c[u.nr - 1].naam) + '</td><td>' + esc(e.naam) + '</td><td class="r">' + (u.uit ? (u.uit === 'crash' ? 'crash' : 'motorpech') : pt) + '</td></tr>';
      }).join('') + '</tbody></table>';
    } else if (liga && liga.laatste){ uitslag = '<p class="tb-klein">Open eerst de race om de uitslag te zien.</p><button type="button" class="tb-knop tb-rand" data-naar="race">Naar de race</button>'; }
    $('tb-stand').innerHTML = '<div class="tb-standscherm"><div class="tb-kaart"><h2>Divisie ' + (liga ? liga.div : 1) + ' · seizoen ' + (liga ? liga.seizoen : 1) + ', na ' + (liga ? liga.race : 0) + ' van ' + R.seizoen + ' races</h2>' + tabel +
      '<p class="tb-klein">Teams met "vult aan" zijn computerteams, zodat er altijd twintig auto\'s rijden. De beste ' + R.promotie + ' gaan na het seizoen een divisie omhoog, de laatste ' + R.promotie + ' een omlaag.</p></div>' +
      '<div class="tb-kaart"><h2>Uitslag van de laatste race</h2>' + uitslag + '</div></div>';
  }

  /* ---------- garage: helmen ---------- */
  var garageNr = 0, garageHelm = null, garageOntwerp = null, garageOpen = false;
  function tekenGarage(){
    var t = team, cr = t.c[garageNr];
    if (!garageOntwerp || garageOntwerp.nr !== garageNr) garageOntwerp = Object.assign({ nr: garageNr }, cr.helm);
    var h = garageOntwerp, kosten = 0;
    var pat = T.PATRONEN.filter(function(p){ return p.id === h.patroon; })[0], viz = T.VIZIEREN.filter(function(v){ return v.id === h.vizier; })[0];
    if (pat.prijs && t.bezit.indexOf('p:' + pat.id) < 0) kosten += pat.prijs;
    if (viz.prijs && t.bezit.indexOf('v:' + viz.id) < 0) kosten += viz.prijs;
    function stalen(kop, sl){ return '<div class="tb-kaart tb-stalen"><h3>' + kop + '</h3><div>' + T.KLEUREN.map(function(k){ return '<button type="button" class="tb-staal' + (h[sl] === k[0] ? ' aan' : '') + '" style="background:' + k[0] + '" data-helm="' + sl + '" data-w="' + k[0] + '" aria-pressed="' + (h[sl] === k[0]) + '" aria-label="' + kop + ': ' + k[1] + '" title="' + k[1] + '"></button>'; }).join('') + '</div></div>'; }
    function prijsTekst(x, soort){ if (x.zege) return t.zeges ? 'verdiend' : 'na een zege'; if (!x.prijs) return 'gratis'; return t.bezit.indexOf(soort + ':' + x.id) >= 0 ? 'gekocht' : munt(x.prijs); }
    $('tb-garage').innerHTML = '<div class="tb-garage"><section class="tb-kaart tb-helmvak"><div class="tb-rij"><h2>Garage: helmen</h2><div class="tb-seg" role="tablist" aria-label="Welke coureur">' + t.c.map(function(c, i){ return '<button type="button" role="tab" data-gnr="' + i + '" aria-selected="' + (i === garageNr) + '">' + esc(c.naam) + '</button>'; }).join('') + '</div></div>' +
      '<div id="tbGroteHelm" class="tb-grotehelm"></div><div class="tb-rij tb-midden"><span class="tb-klein">Sleep om te draaien</span><button type="button" class="tb-knop tb-blauw tb-smal" id="tbVizier" aria-pressed="' + garageOpen + '">' + (garageOpen ? 'Vizier dicht' : 'Vizier open') + '</button></div>' +
      '<div class="tb-tweehelm"><div><span id="tbKlein0"></span><small>' + esc(t.c[0].naam) + '</small></div><div><span id="tbKlein1"></span><small>' + esc(t.c[1].naam) + '</small></div></div></section>' +
      '<aside class="tb-kol">' + stalen('Basiskleur', 'basis') + stalen('Streep', 'streep') + stalen('Accent en vizierrand', 'accent') +
      '<div class="tb-kaart"><h3>Patroon</h3><div class="tb-vakjes">' + T.PATRONEN.map(function(p){ return '<button type="button" class="tb-vakje' + (h.patroon === p.id ? ' aan' : '') + '" data-helm="patroon" data-w="' + p.id + '" aria-pressed="' + (h.patroon === p.id) + '"' + (p.zege && !t.zeges ? ' disabled' : '') + '><b>' + p.naam + '</b><small>' + prijsTekst(p, 'p') + '</small></button>'; }).join('') + '</div></div>' +
      '<div class="tb-kaart"><h3>Vizier</h3><div class="tb-vakjes tb-drie">' + T.VIZIEREN.map(function(v){ return '<button type="button" class="tb-vakje' + (h.vizier === v.id ? ' aan' : '') + '" data-helm="vizier" data-w="' + v.id + '" aria-pressed="' + (h.vizier === v.id) + '"><i style="background:' + v.kleur + '"></i><b>' + v.naam + '</b><small>' + prijsTekst(v, 'v') + '</small></button>'; }).join('') + '</div></div>' +
      '<div class="tb-rij"><span class="tb-klein">Kleuren zijn gratis. Wat je koopt, houd je voor allebei je coureurs.</span><button type="button" class="tb-knop tb-blauw" id="tbHelmBewaar"' + (kosten > t.munten ? ' disabled' : '') + '>' + (kosten ? 'Kopen en opslaan · ' + munt(kosten) : 'Opslaan') + '</button></div></aside></div>';
    garageHelm = helmIn($('tbGroteHelm'), h, 430, { draai: true, hoek: -0.6, sleep: true, open: garageOpen ? 1 : 0 });
    helmIn($('tbKlein0'), garageNr === 0 ? h : t.c[0].helm, 92);
    helmIn($('tbKlein1'), garageNr === 1 ? h : t.c[1].helm, 92);
    $('tbVizier').onclick = function(){ garageOpen = !garageOpen; if (garageHelm) garageHelm.open(garageOpen); this.textContent = garageOpen ? 'Vizier dicht' : 'Vizier open'; this.setAttribute('aria-pressed', garageOpen); };
    $('tbHelmBewaar').onclick = function(){
      var knop = this; knop.disabled = true;
      api('/helm', { nr: garageNr + 1, helm: garageOntwerp }).then(function(j){ if (j.team){ team = j.team; tekenBalk(); melding(j.kosten ? 'Gekocht en opgeslagen.' : 'Opgeslagen.'); garageOntwerp = null; tekenGarage(); } else { melding(j.fout || 'Opslaan lukte niet.'); knop.disabled = false; } });
    };
  }
  $('tb-garage').addEventListener('click', function(e){
    var g = e.target.closest('[data-gnr]'); if (g){ garageNr = +g.getAttribute('data-gnr'); garageOntwerp = null; helmen.forEach(function(x){ x.stop(); }); helmen = []; tekenGarage(); return; }
    var b = e.target.closest('[data-helm]'); if (!b || b.disabled) return;
    garageOntwerp[b.getAttribute('data-helm')] = b.getAttribute('data-w');
    var open = garageOpen; helmen.forEach(function(x){ x.stop(); }); helmen = []; garageOpen = open; tekenGarage();
  });

  /* ---------- circuits ---------- */
  function tekenCircuits(){
    var nu = Date.now() + klokVerschil, wk = T.baanVanWeek(nu), vandaag = T.dagVan(nu);
    $('tb-circuits').innerHTML = '<div class="tb-kaart"><h2>Alle circuits van 2026</h2><p class="tb-klein">Elke week rijden we op de baan die die week ook echt aan de beurt is. Sakhir en Jeddah zijn afgelast: die rijden we in de winterstop.</p><div class="tb-circuits">' +
      T.BANEN.map(function(b, i){
        var dezeWeek = b === wk.baan, af = b.status === 'afgelast', geweest = !af && b.datum < vandaag && !dezeWeek;
        return '<div class="tb-circuit' + (dezeWeek ? ' nu' : '') + (af ? ' af' : '') + (geweest ? ' geweest' : '') + '"><div class="tb-rij tb-klein"><span>ronde ' + (i + 1) + '</span><span>' + datumTekst(b.datum) + '</span></div>' +
          baanSvg(b, 150, 120, { kleur: dezeWeek ? '#EA9836' : af ? '#F26749' : geweest ? '#4A5486' : '', gloed: dezeWeek, breed: 5, marge: 12 }) +
          '<b>' + esc(b.plaats) + '</b><span class="tb-klein">' + esc(b.land) + ' · ' + (b.lengte / 1000).toFixed(3).replace('.', ',') + ' km</span><span class="tb-soort tb-' + T.profiel(b).soort + '">' + ({ snel: 'snel', bochtig: 'bochtig', gemengd: 'gemengd' })[T.profiel(b).soort] + ' · motor ' + Math.round(T.profiel(b).motor * 100) + '%</span>' + (dezeWeek ? '<em class="tb-label tb-oker-l">deze week</em>' : af ? '<em class="tb-label">afgelast</em>' : '') + '</div>';
      }).join('') + '</div><p class="tb-klein">Baanvormen: f1-circuits van Tomislav Bacinger (MIT-licentie). Niet officieel en niet van de organisatie van het kampioenschap.</p></div>';
  }

  /* ---------- nieuw team, inloggen ---------- */
  function tekenNieuw(){
    var k1 = '#F26749', k2 = '#204ECF';
    $('tbInhoud').hidden = true; $('tbStart').hidden = false;
    $('tbStart').innerHTML = '<div class="tb-kaart tb-nieuw"><span class="tb-hand">welkom</span><h2>Start je raceteam</h2><p>Je krijgt twee coureurs, een auto en een hoofdkwartier. Met munten uit goed beantwoorde vragen maak je ze beter. Elke zondag om 20.00 racen alle teams van je divisie.</p>' +
      '<label class="tb-veld"><span>Naam van je team</span><input id="tbNaam" maxlength="24" autocomplete="off" placeholder="bijvoorbeeld Team Valk"></label>' +
      '<div class="tb-veld"><span>Eerste kleur</span><div class="tb-stalenrij" id="tbK1">' + T.KLEUREN.map(function(k){ return '<button type="button" class="tb-staal' + (k[0] === k1 ? ' aan' : '') + '" style="background:' + k[0] + '" data-k="' + k[0] + '" aria-label="' + k[1] + '" aria-pressed="' + (k[0] === k1) + '"></button>'; }).join('') + '</div></div>' +
      '<div class="tb-veld"><span>Tweede kleur</span><div class="tb-stalenrij" id="tbK2">' + T.KLEUREN.map(function(k){ return '<button type="button" class="tb-staal' + (k[0] === k2 ? ' aan' : '') + '" style="background:' + k[0] + '" data-k="' + k[0] + '" aria-label="' + k[1] + '" aria-pressed="' + (k[0] === k2) + '"></button>'; }).join('') + '</div></div>' +
      '<p class="tb-fout" id="tbNieuwFout" hidden></p><button type="button" class="tb-knop tb-koraal" id="tbMaak">Start mijn team</button></div>';
    ['tbK1', 'tbK2'].forEach(function(id){ $(id).addEventListener('click', function(e){ var b = e.target.closest('[data-k]'); if (!b) return; this.querySelectorAll('[data-k]').forEach(function(x){ x.classList.toggle('aan', x === b); x.setAttribute('aria-pressed', x === b); }); if (id === 'tbK1') k1 = b.getAttribute('data-k'); else k2 = b.getAttribute('data-k'); }); });
    $('tbMaak').onclick = function(){
      var naam = $('tbNaam').value.trim(), f = $('tbNieuwFout');
      if (naam.length < 2){ f.textContent = 'Geef je team een naam van minstens twee letters.'; f.hidden = false; $('tbNaam').focus(); return; }
      if (k1 === k2){ f.textContent = 'Kies twee verschillende kleuren.'; f.hidden = false; return; }
      this.disabled = true;
      api('/start', { naam: naam, k1: k1, k2: k2 }).then(function(j){ if (j.team){ laad(); } else { f.textContent = j.fout || 'Dat lukte niet.'; f.hidden = false; $('tbMaak').disabled = false; } });
    };
  }
  function tekenInloggen(){
    $('tbInhoud').hidden = true; $('tbStart').hidden = false;
    var adres = window.PROFIEL && PROFIEL.inlogAdres ? PROFIEL.inlogAdres() : '/api/account/inloggen?terug=' + encodeURIComponent(location.pathname);
    $('tbStart').innerHTML = '<div class="tb-kaart tb-nieuw"><span class="tb-hand">alleen met een account</span><h2>Teambaas</h2><p>Bouw je eigen raceteam: upgrade je auto, je coureurs en je hoofdkwartier met munten die je verdient door vragen goed te beantwoorden. Elke zondag racen alle teams van je divisie op de baan van die week.</p><p>Je raceteam hoort bij je account, zodat het op elke computer hetzelfde is. Log daarom eerst in.</p><a class="tb-knop tb-koraal" href="' + esc(adres) + '">Inloggen met Microsoft</a></div>';
  }

  /* ---------- laden en de klok ---------- */
  function laad(){
    return api('').then(function(j){
      if (j._status === 401){ tekenInloggen(); return; }
      if (j.nieuw){ tekenNieuw(); return; }
      if (!j.team){ $('tbStart').hidden = false; $('tbStart').innerHTML = '<div class="tb-kaart tb-nieuw"><h2>Even geen verbinding</h2><p>' + esc(j.fout || 'Probeer het zo nog eens.') + '</p></div>'; $('tbInhoud').hidden = true; return; }
      team = j.team; liga = j.liga; klokVerschil = (team.nu || Date.now()) - Date.now();
      $('tbStart').hidden = true; $('tbInhoud').hidden = false;
      tekenBalk();
      var s = ls('tb-scherm'); naar(SCHERMEN.some(function(x){ return x[0] === s; }) ? s : 'hq', 'stil');
    });
  }
  /* elke seconde de aftellers; is er een upgrade klaar, dan het team opnieuw ophalen */
  setInterval(function(){
    if (!team) return;
    var nu = Date.now() + klokVerschil;
    document.querySelectorAll('[data-eind]').forEach(function(el){ el.textContent = duur(+el.getAttribute('data-eind') - nu); });
    var a = $('tbAftel'); if (a && liga) a.textContent = duur(liga.volgende - nu);
    var jt = $('tbJobTijd'), jb = team.jobs.filter(function(x){ return x.id === versnelJob; })[0]; if (jt && jb) jt.textContent = duur(jb.eind - nu);
    var klaar = team.jobs.some(function(j){ return j.eind <= nu; }), race = liga && liga.volgende && liga.volgende <= nu - 5000;
    if ((klaar || race) && !laad.bezig){ laad.bezig = true; api('').then(function(j){ laad.bezig = false; if (j.team){ team = j.team; liga = j.liga; tekenBalk(); if (scherm === 'hq') tekenHq(); } }); }
  }, 1000);
  laad();
})();
